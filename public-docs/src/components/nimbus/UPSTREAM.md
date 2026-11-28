# Nimbus source component

Adapted from [Cloudflare Nimbus Steps](https://github.com/cloudflare/nimbus/blob/efbac66a8f992e246503900991566c925b41bd50/packages/nimbus-starter-source/src/components/ui/steps/Steps.astro), revision `efbac66a8f992e246503900991566c925b41bd50`. [MIT license](../../../public/notices/Nimbus-LICENSE.txt).

Starlight owns the Astro routes, navigation and search. We use the Nimbus source-component model: Steps renders an authored ordered list with its numbered markers and connecting lines. The original design tokens are mapped to Starlight colors. The client script, Tailwind utilities and optional individual Step children are not needed here. We do not install a competing site router or require a Cloudflare runtime.
