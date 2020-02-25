<script>
    import Input from './Input.svelte';
    import Punctuation from './Punctuation.svelte';
	export let word='';
	export let guessedLetters=[];

</script>
<style>
    div {
        display: inline-block;
    }
</style>
<div>
    {#each word as letter}

		{#if letter.match(/[A-Za-zА-Яа-я]/)}
		    <Input answer={letter} madeCorrect={guessedLetters.includes(letter)} on:guess on:error/>
		{:else}
		    <Punctuation symbol={letter}/>
		{/if}
	{/each}

</div>
