<script>
	export let errors=0;
	export let win = false;
	export let help;
    $: src = errors>0 ? 'images/i' + (12-errors) + '.PNG':'images/fin.GIF';
</script>
<style>
image{
    max-height: 100px;
}
.win{
    font-size: 2em;
    color: darkgreen;
}
</style>
<img {src} alt="" height="100px" />
{#if !win && errors>0}
    <p on:click={help}>help</p>
{:else if win}
    <p class="win">You won!</p>
{/if}
