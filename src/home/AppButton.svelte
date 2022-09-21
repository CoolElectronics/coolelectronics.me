<script lang="ts">
    export let show: boolean = true;
    export let url: string = "";
    export let title: string;
    export let desc:string;
</script>

{#if show}
    <a href={url}>
        <div class="app darkp2 hover:scale-105 rounded-md">
            <p class="text text-center text-xl">{title}</p>

            <p class="text text-center text-md">{desc}</p>
        </div>
    </a>
{/if}

<style>
    .app {
        /* text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, */
        /*     1px 1px 0 #000; */
        aspect-ratio: 1/1;


    }
</style>
