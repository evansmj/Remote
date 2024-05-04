<script lang="ts">
  import { translate } from '$lib/i18n/translations.js'
  import { fetchInvoices, fetchOffers, fetchPrisms } from '$lib/wallets/index.js'
  import type { Filter, Sorters } from '$lib/@types/common.js'
  import { getFilters, getSorters, getTags } from '$lib/filters.js'
  import type { Connection } from '$lib/wallets/interfaces.js'
  import ItemsList from '$lib/components/ItemsList.svelte'
  import type { Prism } from '$lib/@types/prisms.js'
  import PrismRow from './PrismRow.svelte'
  import plus from '$lib/icons/plus'
  import type { Offer } from '$lib/@types/offers'
  import PrismOfferRow from './PrismOfferRow.svelte'

  const prismsRoute = 'prisms'
  const prismsRowSize = 101
  const prismsFilters: Filter[] = getFilters(prismsRoute)
  const prismsSorters: Sorters = getSorters(prismsRoute)
  const prismsTags: string[] = getTags(prismsRoute)
  const maxAmountPrismsToFetch = 500

  const offersRoute = 'offers'
  const offersRowSize = 102
  const offersFilters: Filter[] = getFilters(offersRoute)
  const offersSorters: Sorters = getSorters(offersRoute)
  const offersTags: string[] = getTags(offersRoute)

  const syncPrisms = async (connection: Connection) => {
    console.log('sync fetchPrisms')
    await fetchPrisms(connection)
  }

  const syncOffers = async (connection: Connection) => {
    await Promise.all([fetchOffers(connection), fetchInvoices(connection)])
  }

  const createPrismButton = {
    href: '/channels/open',
    text: $translate('app.labels.create'),
    icon: plus
  }

  let prisms: Prism[] = []
  let offers: Offer[] = []

  const prismProps = {
    filters: prismsFilters,
    sorters: prismsSorters,
    tags: prismsTags,
    sync: syncPrisms,
    button: createPrismButton,
    route: prismsRoute,
    rowSize: prismsRowSize,
    title: "Prisms"
  }

  const offerProps = {
    filters: offersFilters,
    sorters: offersSorters,
    tags: offersTags,
    sync: syncOffers,
    route: offersRoute,
    rowSize: offersRowSize,
    title: "Offers"
  }
</script>

<svelte:head>
  <title>{"$translate(`app.routes./prisms.title`)"}</title>
</svelte:head>

<!-- {prismsFilters}
{prismsSorters}
{prismsTags}
{syncPrisms}
{createPrismButton}
{prismsRoute}
{prismsRowSize}
bind:items={prisms}
limit={maxAmountPrismsToFetch} -->

<ItemsList {...prismProps} bind:items={prisms} limit={maxAmountPrismsToFetch}>
  <div slot="row" let:item>
    <PrismRow prism={item} />
  </div>
</ItemsList>

<ItemsList {...offerProps}>
  <div slot="row" let:item>
    <PrismOfferRow offer={item} />
  </div>
</ItemsList>
