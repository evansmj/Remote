<script lang="ts">
  import { from, map, timer } from 'rxjs'
  import { liveQuery } from 'dexie'
  import { db } from '$lib/db'
  import type { PageData } from './$types'
  import { nowSeconds } from '$lib/utils'
  import type { AppError } from '$lib/@types/errors'
  import Section from '$lib/components/Section.svelte'
  import Spinner from '$lib/components/Spinner.svelte'
  import Msg from '$lib/components/Msg.svelte'
  import { translate } from '$lib/i18n/translations'
  import SummaryRow from '$lib/components/SummaryRow.svelte'

  export let data: PageData

  let prismNotFound: boolean

  const prism$ = from(
    liveQuery(() =>
      db.prisms.get(data.id).then(prism => {
        prismNotFound = !prism
        return prism
      })
    )
  )

  const now$ = timer(0, 1000).pipe(map(nowSeconds))

  let showDisableModal = false
  let disablingPrism = false
  let disablePrismError: AppError | null = null

  function toggleDisableModal() {
    showDisableModal = !showDisableModal
  }

  async function disablePrism() {
    //todo
  }
</script>

<svelte:head>
  <title>
    {$translate('app.routes/prism.title')}
  </title>
</svelte:head>

<Section>
  {#if prismNotFound}
    <div class="w-full mt-4">
      <Msg message={$translate('app.errors.could_not_find_prism')} type="error" />
    </div>
  {:else if !$prism$}
    <div class="mt-4">
      <Spinner />
    </div>
  {:else}
    {@const { id, prism_members, timestamp, outlay_factor } = $prism$}
    <div class="w-full">
      <SummaryRow>
        <div slot="label">{'Prism Name'}</div>
        <div slot="value">{id}</div>
      </SummaryRow>

      <SummaryRow>
        <div slot="label">{'Created on'}</div>
        <div slot="value">
          {new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          }).format(new Date(timestamp * 1000))}
        </div>
      </SummaryRow>

      <SummaryRow>
        <div slot="label">{'Outlay Percentage'}</div>
        <div slot="value">{outlay_factor * 100}%</div>
      </SummaryRow>

      <br />
      <br />

      Members:
      <div class="grid grid-cols-1 gap-4">
        {#each prism_members as member (member.member_id)}
          <div class="border rounded p-4">
            <div class="font-bold text-lg mb-2">{member.label}</div>
            <div class="flex flex-col gap-1">
              <div class="flex justify-between">
                <span class="font-semibold">Destination:</span>
                <span>{member.destination.substring(0, 8)}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-semibold">Split:</span>
                <span>{member.split}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-semibold">Fees are incurred by:</span>
                <span>{member.fees_incurred_by}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-semibold">Payout threshold:</span>
                <span>{member.payout_threshold_msat.toLocaleString()} msat</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</Section>
