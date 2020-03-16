<script>
    import { createEventDispatcher } from 'svelte';
	export let answer = '';
	export let correct= false;
	export let position= 0;

	export let focus = false;
	let value='';
	let hover = false;
	const dispatch = createEventDispatcher();
	$: if (value) {dispatch('guess',{text: value, position:position});}
    $: if(!hover && value && !((answer.toLowerCase()===value.toLowerCase()))) {value=''}
    let el;

	$: if(focus && !correct){el.focus();}

</script>
<style>
input {
    border:  1px dotted #bdc3c7;
    padding:  0.5em 0 0.5em 0 ;
    background: 0;
    margin: 0;
    outline: none;
    width: 1.5em;
    height: 1.5em;
    font-size: 1em;
    transition: padding 0.3s 0.2s ease;

}

.inp {
    display: inline-block;

    margin: 0;
    background: 0;
    width: 1.5em;
    height: 1.4em;
    font-size: 1em;
    text-align: center;


}

.field {
    position: relative;
    display: inline-block;
    margin: 0.5em 0.1em;
}

.field .line {

    height: 3px;
    position: absolute;
    left: 0;
      right: 0;
      margin-left: auto;
      margin-right: auto;
      width: 1.4em;
    bottom: -0.4em;
    background: #bdc3c7;
}

.field .colorLine {
    bottom: -.5em;
    background: #1abc9c;
    }

</style>
<div class="field">
    {#if !correct}
        <input  maxlength="1" size="1" type="text" bind:value="{value}" on:focus={e=>{hover=true}}
        on:focusout={e=>{hover=false}} bind:this={el}>
        <div class={hover ? 'line colorLine':'line'}/>

    {:else}
        {answer}
    {/if}
</div>