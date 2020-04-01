
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function add_resize_listener(element, fn) {
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        const object = document.createElement('object');
        object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        object.setAttribute('aria-hidden', 'true');
        object.type = 'text/html';
        object.tabIndex = -1;
        let win;
        object.onload = () => {
            win = object.contentDocument.defaultView;
            win.addEventListener('resize', fn);
        };
        if (/Trident/.test(navigator.userAgent)) {
            element.appendChild(object);
            object.data = 'about:blank';
        }
        else {
            object.data = 'about:blank';
            element.appendChild(object);
        }
        return {
            cancel: () => {
                win && win.removeEventListener && win.removeEventListener('resize', fn);
                element.removeChild(object);
            }
        };
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Space.svelte generated by Svelte v3.19.1 */

    const file = "src\\Space.svelte";

    function create_fragment(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "svelte-1psr7ze");
    			add_location(span, file, 6, 0, 98);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Space extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Space",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\Hang.svelte generated by Svelte v3.19.1 */

    const file$1 = "src\\Hang.svelte";

    // (19:14) 
    function create_if_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "You won!";
    			attr_dev(p, "class", "win svelte-bbfcuj");
    			add_location(p, file$1, 19, 4, 365);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(19:14) ",
    		ctx
    	});

    	return block;
    }

    // (17:0) {#if !win && errors>0}
    function create_if_block(ctx) {
    	let p;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "help";
    			add_location(p, file$1, 17, 4, 316);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			dispose = listen_dev(
    				p,
    				"click",
    				function () {
    					if (is_function(/*help*/ ctx[2])) /*help*/ ctx[2].apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(17:0) {#if !win && errors>0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let img;
    	let img_src_value;
    	let t;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (!/*win*/ ctx[1] && /*errors*/ ctx[0] > 0) return create_if_block;
    		if (/*win*/ ctx[1]) return create_if_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (img.src !== (img_src_value = /*src*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 15, 0, 266);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*src*/ 8 && img.src !== (img_src_value = /*src*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { errors = 0 } = $$props;
    	let { win = false } = $$props;
    	let { help } = $$props;
    	const writable_props = ["errors", "win", "help"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hang> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("errors" in $$props) $$invalidate(0, errors = $$props.errors);
    		if ("win" in $$props) $$invalidate(1, win = $$props.win);
    		if ("help" in $$props) $$invalidate(2, help = $$props.help);
    	};

    	$$self.$capture_state = () => ({ errors, win, help, src });

    	$$self.$inject_state = $$props => {
    		if ("errors" in $$props) $$invalidate(0, errors = $$props.errors);
    		if ("win" in $$props) $$invalidate(1, win = $$props.win);
    		if ("help" in $$props) $$invalidate(2, help = $$props.help);
    		if ("src" in $$props) $$invalidate(3, src = $$props.src);
    	};

    	let src;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*errors*/ 1) {
    			 $$invalidate(3, src = errors > 0
    			? "images/i" + (12 - errors) + ".PNG"
    			: "images/fin.GIF");
    		}
    	};

    	return [errors, win, help, src];
    }

    class Hang extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, { errors: 0, win: 1, help: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hang",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*help*/ ctx[2] === undefined && !("help" in props)) {
    			console.warn("<Hang> was created without expected prop 'help'");
    		}
    	}

    	get errors() {
    		throw new Error("<Hang>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errors(value) {
    		throw new Error("<Hang>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get win() {
    		throw new Error("<Hang>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set win(value) {
    		throw new Error("<Hang>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get help() {
    		throw new Error("<Hang>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set help(value) {
    		throw new Error("<Hang>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Input.svelte generated by Svelte v3.19.1 */
    const file$2 = "src\\Input.svelte";

    // (76:4) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*answer*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*answer*/ 1) set_data_dev(t, /*answer*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(76:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (71:4) {#if !correct}
    function create_if_block$1(ctx) {
    	let input;
    	let t;
    	let div;
    	let div_class_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t = space();
    			div = element("div");
    			attr_dev(input, "maxlength", "1");
    			attr_dev(input, "size", "1");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "autocapitalize", "none");
    			attr_dev(input, "class", "svelte-1xgb1jp");
    			add_location(input, file$2, 71, 8, 1347);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*hover*/ ctx[3] ? "line colorLine" : "line") + " svelte-1xgb1jp"));
    			add_location(div, file$2, 73, 8, 1525);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[2]);
    			/*input_binding*/ ctx[11](input);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[8]),
    				listen_dev(input, "focus", /*focus_handler*/ ctx[9], false, false, false),
    				listen_dev(input, "focusout", /*focusout_handler*/ ctx[10], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 4 && input.value !== /*value*/ ctx[2]) {
    				set_input_value(input, /*value*/ ctx[2]);
    			}

    			if (dirty & /*hover*/ 8 && div_class_value !== (div_class_value = "" + (null_to_empty(/*hover*/ ctx[3] ? "line colorLine" : "line") + " svelte-1xgb1jp"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[11](null);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(71:4) {#if !correct}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (!/*correct*/ ctx[1]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "field svelte-1xgb1jp");
    			add_location(div, file$2, 69, 0, 1298);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { answer = "" } = $$props;
    	let { correct = false } = $$props;
    	let { position = 0 } = $$props;
    	let { focus = false } = $$props;
    	let value = "";
    	let hover = false;
    	const dispatch = createEventDispatcher();
    	let el;
    	const writable_props = ["answer", "correct", "position", "focus"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		(($$invalidate(2, value), $$invalidate(3, hover)), $$invalidate(0, answer));
    	}

    	const focus_handler = e => {
    		$$invalidate(3, hover = true);
    	};

    	const focusout_handler = e => {
    		$$invalidate(3, hover = false);
    	};

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, el = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("answer" in $$props) $$invalidate(0, answer = $$props.answer);
    		if ("correct" in $$props) $$invalidate(1, correct = $$props.correct);
    		if ("position" in $$props) $$invalidate(5, position = $$props.position);
    		if ("focus" in $$props) $$invalidate(6, focus = $$props.focus);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		answer,
    		correct,
    		position,
    		focus,
    		value,
    		hover,
    		dispatch,
    		el
    	});

    	$$self.$inject_state = $$props => {
    		if ("answer" in $$props) $$invalidate(0, answer = $$props.answer);
    		if ("correct" in $$props) $$invalidate(1, correct = $$props.correct);
    		if ("position" in $$props) $$invalidate(5, position = $$props.position);
    		if ("focus" in $$props) $$invalidate(6, focus = $$props.focus);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("hover" in $$props) $$invalidate(3, hover = $$props.hover);
    		if ("el" in $$props) $$invalidate(4, el = $$props.el);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*hover, value, answer*/ 13) {
    			 if (!hover && value && !(answer.toLowerCase() === value.toLowerCase())) {
    				$$invalidate(2, value = "");
    			}
    		}

    		if ($$self.$$.dirty & /*value, position*/ 36) {
    			 if (value) {
    				dispatch("guess", { text: value, position });
    			}
    		}

    		if ($$self.$$.dirty & /*focus, correct, el*/ 82) {
    			 if (focus && !correct) {
    				el.focus();
    			}
    		}
    	};

    	return [
    		answer,
    		correct,
    		value,
    		hover,
    		el,
    		position,
    		focus,
    		dispatch,
    		input_input_handler,
    		focus_handler,
    		focusout_handler,
    		input_binding
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$2, safe_not_equal, {
    			answer: 0,
    			correct: 1,
    			position: 5,
    			focus: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get answer() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set answer(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get correct() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set correct(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focus() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focus(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Punctuation.svelte generated by Svelte v3.19.1 */

    const file$3 = "src\\Punctuation.svelte";

    function create_fragment$3(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*symbol*/ ctx[0]);
    			attr_dev(span, "class", "svelte-4nedcc");
    			add_location(span, file$3, 9, 0, 149);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*symbol*/ 1) set_data_dev(t, /*symbol*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { symbol } = $$props;
    	const writable_props = ["symbol"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Punctuation> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("symbol" in $$props) $$invalidate(0, symbol = $$props.symbol);
    	};

    	$$self.$capture_state = () => ({ symbol });

    	$$self.$inject_state = $$props => {
    		if ("symbol" in $$props) $$invalidate(0, symbol = $$props.symbol);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [symbol];
    }

    class Punctuation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, { symbol: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Punctuation",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*symbol*/ ctx[0] === undefined && !("symbol" in props)) {
    			console.warn("<Punctuation> was created without expected prop 'symbol'");
    		}
    	}

    	get symbol() {
    		throw new Error("<Punctuation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set symbol(value) {
    		throw new Error("<Punctuation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.19.1 */

    const { Boolean: Boolean_1 } = globals;
    const file$4 = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (165:2) {:else }
    function create_else_block$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*line*/ ctx[0]);
    			add_location(p, file$4, 165, 2, 4794);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*line*/ 1) set_data_dev(t, /*line*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(165:2) {:else }",
    		ctx
    	});

    	return block;
    }

    // (139:1) {#if !win}
    function create_if_block$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*state*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*state, onGuess, errors*/ 44) {
    				each_value = /*state*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(139:1) {#if !win}",
    		ctx
    	});

    	return block;
    }

    // (160:41) 
    function create_if_block_4(ctx) {
    	let br;

    	const block = {
    		c: function create() {
    			br = element("br");
    			add_location(br, file$4, 160, 16, 4735);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(160:41) ",
    		ctx
    	});

    	return block;
    }

    // (158:48) 
    function create_if_block_3(ctx) {
    	let current;
    	const space_1 = new Space({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(space_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(space_1, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(space_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(space_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(space_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(158:48) ",
    		ctx
    	});

    	return block;
    }

    // (156:49) 
    function create_if_block_2(ctx) {
    	let current;

    	const punctuation = new Punctuation({
    			props: { symbol: /*letter*/ ctx[10].value },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(punctuation.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(punctuation, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const punctuation_changes = {};
    			if (dirty & /*state*/ 4) punctuation_changes.symbol = /*letter*/ ctx[10].value;
    			punctuation.$set(punctuation_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(punctuation.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(punctuation.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(punctuation, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(156:49) ",
    		ctx
    	});

    	return block;
    }

    // (148:12) {#if letter.type=='letter'}
    function create_if_block_1$1(ctx) {
    	let current;

    	const input = new Input({
    			props: {
    				answer: /*letter*/ ctx[10].value,
    				correct: /*letter*/ ctx[10].correct,
    				focus: /*letter*/ ctx[10].focus,
    				position: /*i*/ ctx[12]
    			},
    			$$inline: true
    		});

    	input.$on("guess", /*onGuess*/ ctx[5]);
    	input.$on("error", /*error_handler*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};
    			if (dirty & /*state*/ 4) input_changes.answer = /*letter*/ ctx[10].value;
    			if (dirty & /*state*/ 4) input_changes.correct = /*letter*/ ctx[10].correct;
    			if (dirty & /*state*/ 4) input_changes.focus = /*letter*/ ctx[10].focus;
    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(148:12) {#if letter.type=='letter'}",
    		ctx
    	});

    	return block;
    }

    // (140:4) {#each state as letter,i }
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_if_block_2, create_if_block_3, create_if_block_4];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*letter*/ ctx[10].type == "letter") return 0;
    		if (/*letter*/ ctx[10].type == "punctuation") return 1;
    		if (/*letter*/ ctx[10].type == "whitespace") return 2;
    		if (/*letter*/ ctx[10].type == "EOL") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(140:4) {#each state as letter,i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t0;
    	let br;
    	let t1;
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let div_resize_listener;
    	let current;

    	const hang = new Hang({
    			props: {
    				errors: /*errors*/ ctx[3],
    				win: /*win*/ ctx[4],
    				help: /*help*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*win*/ ctx[4]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(hang.$$.fragment);
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			div = element("div");
    			if_block.c();
    			add_location(br, file$4, 136, 0, 3929);
    			attr_dev(div, "class", "text svelte-147s3s1");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[9].call(div));
    			add_location(div, file$4, 137, 0, 3936);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(hang, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[9].bind(div));
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const hang_changes = {};
    			if (dirty & /*errors*/ 8) hang_changes.errors = /*errors*/ ctx[3];
    			if (dirty & /*win*/ 16) hang_changes.win = /*win*/ ctx[4];
    			hang.$set(hang_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hang.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hang.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hang, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			div_resize_listener.cancel();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let line = "";
    	let width = 1;
    	let state = [];
    	let errors = 12;
    	let win = false;

    	onMount(async () => {
    		const res = await fetch(`https://sentencesentences.herokuapp.com/quotes`);
    		$$invalidate(0, line = await res.json());
    	});

    	function onGuess(event) {
    		// resolve all correct letters
    		let first = true;

    		const pos = event.detail.position;
    		const correctGuess = state[pos].type === "letter" && state[pos].value.toLowerCase() === event.detail.text.toLowerCase();

    		if (correctGuess) {
    			for (let i = 0; i < state.length - 1; i++) {
    				if (state[i].type === "letter" && state[i].value.toLowerCase() === event.detail.text.toLowerCase()) {
    					$$invalidate(2, state[i].correct = true, state);

    					if (i >= pos && first) {
    						// set flag to focus next input
    						$$invalidate(2, state[i].focus = "next", state);

    						first = false;
    					}
    				}
    			}

    			if (!first) {
    				for (let j = pos; j < state.length - 1; j++) {
    					if (state[j].focus === "next") {
    						$$invalidate(2, state[j].focus = false, state);

    						for (let k = j + 1; k < state.length - 1; k++) {
    							if (state[k].type === "letter" && state[k].correct === false) {
    								$$invalidate(2, state[k].focus = "autofocus", state);
    								break;
    							}
    						}

    						break;
    					}
    				}
    			}
    		} else {
    			$$invalidate(3, errors = errors - 1);
    		}

    		((($$invalidate(2, state), $$invalidate(0, line)), $$invalidate(7, barier)), $$invalidate(1, width));
    		$$invalidate(4, win = !Boolean(state.find(obj => obj.correct === false)));
    	}

    	function help() {
    		for (let i = 0; i < line.length - 1; i++) {
    			if (state[i].type == "letter" && !state[i].correct) {
    				var event = new Object();
    				event.detail = new Object();
    				event.detail.position = i;
    				event.detail.text = state[i].value;
    				onGuess(event);
    				$$invalidate(3, errors = errors - 1);
    				break;
    			}
    		}
    	}

    	const error_handler = e => {
    		$$invalidate(3, errors = errors - 1);
    	};

    	function div_elementresize_handler() {
    		width = this.offsetWidth;
    		$$invalidate(1, width);
    	}

    	$$self.$capture_state = () => ({
    		Space,
    		Hang,
    		Input,
    		Punctuation,
    		onMount,
    		line,
    		width,
    		state,
    		errors,
    		win,
    		onGuess,
    		help,
    		barier,
    		Math,
    		console,
    		fetch,
    		Boolean,
    		Object
    	});

    	$$self.$inject_state = $$props => {
    		if ("line" in $$props) $$invalidate(0, line = $$props.line);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("state" in $$props) $$invalidate(2, state = $$props.state);
    		if ("errors" in $$props) $$invalidate(3, errors = $$props.errors);
    		if ("win" in $$props) $$invalidate(4, win = $$props.win);
    		if ("barier" in $$props) $$invalidate(7, barier = $$props.barier);
    	};

    	let barier;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width*/ 2) {
    			 $$invalidate(7, barier = Math.floor(width / 32));
    		}

    		if ($$self.$$.dirty & /*line*/ 1) {
    			 console.log(line);
    		}

    		if ($$self.$$.dirty & /*state, line, barier*/ 133) {
    			 {
    				if (!state.length) for (let i = 0; i < line.length; i++) {
    					const symbol = line[i];
    					let type = "";
    					let correct = true;

    					if (symbol.match(/[a-zA-zа-яА-Я]/)) {
    						type = "letter";
    						correct = false;
    					} else if (symbol.match(/\s/)) {
    						type = "whitespace";
    					} else {
    						type = "punctuation";
    					}

    					$$invalidate(
    						2,
    						state[i] = {
    							type,
    							"value": symbol,
    							correct,
    							"focus": false
    						},
    						state
    					);
    				}

    				if (state.length) {
    					for (let p = 0; p < state.length; p) {
    						let position = p + barier;

    						if (position < state.length) {
    							for (let i = position; i > p; i--) {
    								if (state[i].type === ("whitespace" )) {
    									$$invalidate(2, state[i].type = "EOL", state);
    									p = i;
    									break;
    								}
    							}
    						} else break;
    					}

    					((($$invalidate(2, state), $$invalidate(0, line)), $$invalidate(7, barier)), $$invalidate(1, width));
    				} //console.log(state)
    			}
    		}

    		if ($$self.$$.dirty & /*state*/ 4) {
    			 console.log(state);
    		}
    	};

    	return [
    		line,
    		width,
    		state,
    		errors,
    		win,
    		onGuess,
    		help,
    		barier,
    		error_handler,
    		div_elementresize_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
