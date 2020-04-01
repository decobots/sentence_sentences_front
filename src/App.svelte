<script>
    import Space from './Space.svelte';
    import Hang from './Hang.svelte'
    import Input from './Input.svelte';
    import Punctuation from './Punctuation.svelte';
    import { onMount } from 'svelte';
	let line = '';
	let width = 1;
	let state = [];
    let errors = 12;
    let win = false;

	$: barier = Math.floor(width/32);
	$: console.log(line)
	$: console.log(state)

    onMount(async () => {
		const res = await fetch(`https://sentencesentences.herokuapp.com/quotes`);
		line = await res.json();
	});


	$: {
        if(!state.length)
	    for(let i = 0 ; i < line.length; i++){
            const symbol = line[i];
            let type = '';
            let correct = true;
            if (symbol.match(/[a-zA-zа-яА-Я]/)){type = 'letter'; correct = false}
            else if(symbol.match(/\s/)){ type = 'whitespace';}
            else{type = 'punctuation';}
            state[i] = {'type':type,
                        'value':symbol,
                        'correct':correct,
                        'focus':false};
	    }

	    if(state.length){

           for (let p = 0; p < state.length; p){
                let position = p + barier;
                if(position < state.length){
                    for(let i = position; i > p; i--){
                        if (state[i].type === ('whitespace' || 'EOL' )){
                            state[i].type='EOL';
                            p = i;
                            break;
                        }
                    }
                }
                else break;
             }
             state=state;
             //console.log(state)
        }
    }


    function onGuess(event) {
        // resolve all correct letters
        let first = true;
        const pos = event.detail.position;

        const correctGuess = state[pos].type==='letter' && state[pos].value.toLowerCase()===event.detail.text.toLowerCase();

        if(correctGuess){
            for(let i=0;i<state.length-1;i++){
                if (state[i].type==='letter' && state[i].value.toLowerCase()===event.detail.text.toLowerCase()){
                   state[i].correct=true;
                   if(i>=pos && first){
                        // set flag to focus next input
                       state[i].focus='next';
                       first=false;
                   }
                }
            }
            if(!first){
                for(let j=pos;j<state.length-1;j++){
                    if (state[j].focus==='next'){
                        state[j].focus=false;
                        for(let k=j+1;k<state.length-1;k++){
                                if (state[k].type==='letter' && state[k].correct===false){
                                   state[k].focus='autofocus';
                                       break;
                               }
                        }
                     break;
                   }
                }

             }

         }
        else {
                     errors =errors-1;

        }
        state = state;
             win = !Boolean(state.find(obj=> obj.correct===false));
    }

    function help(){

        for(let i=0;i<line.length-1;i++){
           if (state[i].type=='letter' && !state[i].correct)  {
               var event=new Object();
               event.detail = new Object();
               event.detail.position=i;
               event.detail.text=state[i].value;
               onGuess(event);
               errors=errors-1;
               break;

           }

        }
    }

</script>
<style>
    :global(body) {
        background: #efefef;

        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    div {
        width: 80vw;
    }



</style>
<Hang {errors} {win} {help}/>
<br/>
<div class="text" bind:offsetWidth={width}>
 {#if !win}
    {#each state as letter,i }
           <!--
            {#if !state[i-1] || (letter.type==='letter' && state[i-1].type!=='letter') }
            <p></p>

             {/if}
           -->

            {#if letter.type=='letter'}
                <Input
                answer={letter.value}
                correct={letter.correct}
                on:guess={onGuess}
                on:error={e=>{errors=errors-1}}
                focus={letter.focus}
                position={i}/>
            {:else if letter.type=='punctuation'}
                <Punctuation symbol={letter.value}/>
            {:else if letter.type=='whitespace'}
                <Space/>
            {:else if letter.type=='EOL'}
                <br/>
            {/if}

        {/each}
  {:else }
  <p>{line}</p>
   {/if}
</div>
