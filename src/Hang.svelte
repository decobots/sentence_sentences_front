<script>
	export let errors=0;
</script>
<style>
.over{
    font-size: 2em;
    color: darkred;

}
</style>
{#if errors>0}
    <p>Number of errors = {errors}</p>
   {:else}
   <p class="over">Game over!</p>
   {/if}