<script>
	export let errors=0;
	export let win = false;

</script>
<style>
.over{
    font-size: 2em;
    color: darkred;

}
.win{
    font-size: 2em;
    color: darkgreen;
}
</style>
{#if !win}
    {#if errors>0}
        <p>Number of errors = {errors}</p>
       {:else}
       <p class="over">Game over!</p>
       {/if}
{:else}
<p class="win">You won!</p>
{/if}
