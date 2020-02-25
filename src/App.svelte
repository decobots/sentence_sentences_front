<script>
    import Word from './Word.svelte';
    import Space from './Space.svelte';
    import Hang from './Hang.svelte'
    import { onMount } from 'svelte';
	var line = '';
    onMount(async () => {
		const res = await fetch(`https://sentencesentences.herokuapp.com/quotes`);
		line = await res.json();
	});


	$: dividedLine = line.split(' ');
    let guessedLetters = [];
    let errors = 12;

    function addedGuessedLetter(event) {
      guessedLetters = [...guessedLetters, event.detail.text];
    }

    function help(){
        const old_length =new Set(guessedLetters).size;
        for(let i=0;i<line.length-1;i++){
            const letter = line[i];
            console.log(letter);
            if (!letter.match(/[a-zA-zа-яА-Я]/i)){
                continue;
            }
            guessedLetters= [...guessedLetters, letter];

            const new_length = new Set(guessedLetters).size;

            if (new_length>old_length){
                errors-=1;
                return;
            }
        }
    }

</script>
<style>
    :global(body) {
        background: #efefef;
        min-height: 100vmin;
        margin: 0;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
    }
    div {
        width: 80vw;
    }
</style>
<Hang {errors}/>
<p on:click={help}>help</p>
<br/>
<div class="text">

    {#each dividedLine as word }
		<Word word={word} on:guess={addedGuessedLetter} on:error={e=>{errors=errors-1}} guessedLetters={guessedLetters}/>
		<Space/>
	{/each}
</div>
