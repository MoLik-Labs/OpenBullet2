//! Browser-local release list comparison. Names are data, never filesystem paths.
use std::{collections::HashSet, fmt::Write};
const LIMIT: usize = 256 * 1024;
const DISPLAY: usize = 32;

fn names(bytes: &[u8]) -> Result<HashSet<&str>, &'static str> {
    if bytes.len() > LIMIT {
        return Err("Manifest exceeds 256 KiB");
    }
    let text = std::str::from_utf8(bytes).map_err(|_| "Expected a UTF-8 manifest")?;
    let mut seen = HashSet::new();
    for (i, name) in text.trim_start_matches('\u{feff}').lines().enumerate() {
        if i >= 2048 {
            return Err("Manifest exceeds 2048 entries");
        }
        if name.is_empty()
            || name.len() > 255
            || matches!(name, "." | "..")
            || name.contains(['/', '\\', ':'])
            || name.chars().any(char::is_control)
        {
            return Err("Expected one top-level file name per line");
        }
        if !name.eq_ignore_ascii_case("UserData") && !seen.insert(name) {
            return Err("Duplicate name");
        }
    }
    if seen.is_empty() {
        return Err("No in-scope entries");
    }
    Ok(seen)
}
fn compare(before: &[u8], after: &[u8]) -> String {
    let a = match names(before) {
        Ok(v) => v,
        Err(e) => return format!("Error: Baseline: {e}."),
    };
    let b = match names(after) {
        Ok(v) => v,
        Err(e) => return format!("Error: Candidate: {e}."),
    };
    let mut added: Vec<_> = b.difference(&a).collect();
    let mut removed: Vec<_> = a.difference(&b).collect();
    added.sort_unstable();
    removed.sort_unstable();
    // Newlines and tabs cannot occur in names. Only bounded previews cross the Wasm boundary.
    let mut out = format!(
        "{}\t{}\t{}",
        added.len(),
        removed.len(),
        a.len() - removed.len()
    );
    for (prefix, list) in [("+", added), ("-", removed)] {
        for name in list.into_iter().take(DISPLAY) {
            let _ = write!(out, "\n{prefix}\t{name}");
        }
    }
    out
}
#[cfg(target_arch = "wasm32")]
mod wasm {
    use super::*;
    use std::cell::RefCell;
    thread_local! {
        static INPUT: RefCell<Vec<u8>> = RefCell::new(vec![0; LIMIT * 2]);
        static OUTPUT: RefCell<String> = RefCell::default();
    }
    #[no_mangle]
    pub extern "C" fn input() -> *mut u8 {
        INPUT.with(|s| s.borrow_mut().as_mut_ptr())
    }
    #[no_mangle]
    pub extern "C" fn run(a: usize, b: usize) -> usize {
        let text = if a > LIMIT || b > LIMIT {
            "Error: Input too large.".into()
        } else {
            INPUT.with(|s| {
                let mut buf = s.borrow_mut();
                let result = compare(&buf[..a], &buf[LIMIT..LIMIT + b]);
                buf[..a].fill(0);
                buf[LIMIT..LIMIT + b].fill(0);
                result
            })
        };
        let n = text.len();
        OUTPUT.with(|s| *s.borrow_mut() = text);
        n
    }
    #[no_mangle]
    pub extern "C" fn output() -> *const u8 {
        OUTPUT.with(|s| s.borrow().as_ptr())
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn exact_sorted_diff() {
        assert_eq!(
            compare(b"\xef\xbb\xbfA\r\nB\r\nUserData\n", b"a\nC\nB\nuserdata\n"),
            "2\t1\t1\n+\tC\n+\ta\n-\tA"
        );
    }
    #[test]
    fn malformed_inputs() {
        for input in [&b"../x"[..], b"x\nx", b"x\tq", b"\xff", b"UserData", b""] {
            assert!(compare(b"ok", input).starts_with("Error: Candidate:"));
        }
    }
    #[test]
    fn bounded_output() {
        let s = (0..2048).map(|i| format!("f{i}\n")).collect::<String>();
        let out = compare(b"old", s.as_bytes());
        assert!(out.starts_with("2048\t1\t0"));
        assert_eq!(out.lines().count(), 34);
        assert!(compare(b"ok", (s + "extra").as_bytes()).starts_with("Error:"));
    }
}
