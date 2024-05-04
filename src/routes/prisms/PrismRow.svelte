<script lang="ts">
  import type { Prism } from '$lib/@types/prisms'

  export let prism: Prism
</script>

<div>
  <div class="flex items-center justify-between gap-x-2 w-full">
    <div class="max-w-[48%]">
      <div class="font-semibold whitespace-nowrap uppercase truncate">
        {prism.id}
      </div>
    </div>
  </div>
</div>
