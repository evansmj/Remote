<script lang="ts">
  import { translate } from '$lib/i18n/translations.js'
  import { fetchPrisms } from '$lib/wallets/index.js'
  import type { Filter, Sorters } from '$lib/@types/common.js'
  import { getFilters, getSorters, getTags } from '$lib/filters.js'
  import type { Connection } from '$lib/wallets/interfaces.js'
  import ItemsList from '$lib/components/ItemsList.svelte'
  import type { Prism } from '$lib/@types/prisms.js'
  import PrismRow from './PrismRow.svelte'
  import plus from '$lib/icons/plus'

  const route = 'prisms'
  const rowSize = 101
  const filters: Filter[] = getFilters(route)
  const sorters: Sorters = getSorters(route)
  const tags: string[] = getTags(route)
  const maxAmountPrismsToFetch = 500

  const sync = async (connection: Connection) => {
    console.log('sync fetchPrisms')
    await fetchPrisms(connection)
  }

  const button = {
    href: '/channels/open',
    text: $translate('app.labels.create'),
    icon: plus
  }

  let prisms: Prism[] = []
</script>

<svelte:head>
  <title>{$translate(`app.routes./prisms.title`)}</title>
</svelte:head>

<ItemsList
  {filters}
  {sorters}
  {tags}
  {sync}
  {button}
  {route}
  {rowSize}
  bind:items={prisms}
  limit={maxAmountPrismsToFetch}
>
  <div slot="summary">
    <!-- <div class="w-full">Summary goes here</div> -->
  </div>

  <div slot="row" let:item>
    <PrismRow prism={item} />
  </div>
</ItemsList>
