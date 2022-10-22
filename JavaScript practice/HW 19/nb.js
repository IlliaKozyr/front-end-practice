/*
Copyright 2016-100500 Ivan Grynkin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE. 
*/

function nbInit(a,b){
    var root=document, $s=a;

    var dom = null;
    var closure = null;

    function searchElement(root, selector){
        if ((selector.indexOf('|dom') === selector.length - 4) && (selector.length > 4)){
            selector = selector.slice(0,selector.length - 4)
            dom      = true;
        }
        if ((selector.indexOf('|closure') === selector.length - 8) && (selector.length > 8)){
            selector = selector.slice(0,selector.length - 8)
            closure  = true;
        }
        if (root === document){
            var items = [root.getElementById(selector)]; 
        }
        else {
            items = root.querySelectorAll("#" + selector); 
        }
        items     = items[0]     ? items :  root.querySelectorAll(selector);
        items     = items.length ? items :  root === document ? root.getElementsByName(selector) : root.querySelectorAll("[name='" + selector + "']"); 
        items     = items.length ? items :  root.getElementsByClassName(selector); 
        return items;
    }

    if (a instanceof HTMLElement){
        root = a;
        $s   = b;
    }
    else if (typeof a === "string"){
        root = searchElement(document, a)[0];
        $s   = b;
    }
    if (b instanceof HTMLElement){
        root = b;
    }
    else if (typeof b === "string"){
        root = searchElement(document, a)[0];
    }
    if (typeof $s === "undefined"){
        $s = {}
    }

    function nBind(callback, prop, direction){
        direction = direction || "write";
        for (var selector in $s){
            var result = [];
            selector = prop || selector; //change selector to passed if it

            var items = searchElement(root, selector);
            for (var i=0,item=items[i];i<items.length;i++,item=items[i]){
                if (direction == "write" &&  Array.isArray($s[selector]) && (item.children.length == 0 || (items.length == $s[selector].length && items.length > 1))){
                    if (closure){
                        callback(item, $s, selector, $s[selector]);
                    }
                    else {
                        callback(item, $s, selector, $s[selector][i]);
                    }
                }
                else {
                    var res = callback(item, $s, selector);
                    if (typeof res !== "undefined"){
                        result.push(res)
                    }
                }
            }

            
            $s[selector] = result.length ? (result.length == 1 ? result[0] : result) : $s[selector];

            if (prop) return;  //exit if selector passed, no iteration
        }
    }

    function recursiveObjectSet(item, value){
        if (typeof item === 'undefined'){
            return;
        }
        for (var key in value){
            if (typeof value[key] !== 'object'){
                item[key] = value[key];
            }
            else {
                recursiveObjectSet(item[key], value[key]);
            }
        }
    }

    function syncToDOM(prop){
        nBind(function (item, $s, selector, value, key, thisByClass){
            value = typeof value === 'undefined' ? $s[selector] : value;
            var keyExists = typeof key !== 'undefined';
            if (closure){
                item.nbData = value[0].apply(item, value.slice(1))
                return;
            }
            if ((!item.children.length && !Array.isArray(value) && typeof value === 'object') || thisByClass || dom){ //hash array on single leaf node -> set attrs on the tag
                recursiveObjectSet(item,value);
                if (!thisByClass && !dom){
                    item.nbData = value;
                }
                return;
            }
            if (keyExists && "value" in item){ //if hash key-value pair. Usable for select > option
                item.value = key;
            }
            if (typeof value === "boolean" && item.type !== 'checkbox'){ //boolean means visibility, except checkbox
                if (value){
                    item.style.display = "originalDisplay" in item ? item.originalDisplay : "";
                }
                else {
                    item.originalDisplay = "originalDisplay" in item ? item.originalDisplay : item.style.display;
                    item.style.display   = "none";
                }
                return;
            }
            if (item.type === 'radio' && !keyExists){ //radiogroup set
                if (item.value === value){ //only item with right value to set
                    item.checked = true;
                }
                return;
            }
            if (item.type === 'checkbox' && !keyExists){ //checkbox setting by boolean
                item.checked = !!value;
                return;
            }
            if (item.children.length && typeof value === "object"){ //recursive fill
                item.copy = item.copy || item.cloneNode(true); //original node
                item.nbData = value;
                var originalChildren = item.copy.children;
                var i = 0;
                var isArray = Array.isArray(value);      //different logic for array and objects
                if (!isArray){ // if first key in array find as class name in one of subnodes
                    var classFound = false;
                    for (var key in value){
                        if (item.getElementsByClassName(key).length){
                            classFound = true;
                            break;
                        }
                    }
                    if (classFound){
                        for (var key in value){
                            var classSubnodes = item.getElementsByClassName(key);
                            for (var i=0;i<classSubnodes.length;i++){
                                arguments.callee(classSubnodes[i], $s, selector, value[key]); // recursively fill subnode with that data. No reason to pass a key, because key are class selector, not value for option
                            }
                            if (item.classList.contains(key)){
                                arguments.callee(item, $s, selector, value[key], undefined, true); // recursively fill subnode with that data. No reason to pass a key, because key are class selector, not value for option
                            }
                        }
                        return;
                    }
                }
                item.innerHTML = "";                     //remove sub nodes
                for (var key in value){ //otherwise iterate over array or object
                    var newNode = originalChildren[i].cloneNode(true);
                    item.appendChild(newNode);
                    if (isArray){
                        arguments.callee(newNode, $s, selector, value[key]);
                    }
                    else {
                        arguments.callee(newNode, $s, selector, value[key], key);
                    }
                    i = (i +1) % originalChildren.length;
                }
                return;
            }
            if (!keyExists){ //default logic: set text or value to data value
                item[("value" in item) && item.tagName !== 'LI' ? "value" : "innerText"] = value;
            }
            else {
                item.innerText = value; // do not try to overwrite value on option nodes
            }
        },prop, "write");
    }

    function syncFromDOM(prop){
        nBind(function(item, $s, selector){
            if (closure){
                return item.nbData()
            }
            if (item.type === 'radio'){
                if (item.checked) 
                    return item.value; 
                return;
            }
            if (item.type === 'checkbox'){
                return item.checked;
            }
            if (item.tagName === 'SELECT'){
                return item.value;
            }
            if ("nbData" in item){
                var value = item.nbData;
                var isArray = Array.isArray(value);      //different logic for array and objects
                if (item.children.length && typeof value === "object"){ //recursive fill
                    if (!isArray){ // if first key in array find as class name in one of subnodes
                        var classFound = false;
                        for (var key in value){
                            if (item.getElementsByClassName(key).length){
                                classFound = true;
                                break;
                            }
                        }
                        if (classFound){
                            for (var key in value){
                                var classSubnodes = item.getElementsByClassName(key);
                                for (var i=0;i<classSubnodes.length;i++){
                                    value[key] = arguments.callee(classSubnodes[i], $s, selector); // recursively fill subnode with that data. No reason to pass a key, because key are class selector, not value for option
                                }
                            }
                            return value;
                        }
                    }
                    else{
                        value.length = 0;
                        for (var key=0;key<item.children.length;key++){ //otherwise iterate over array or object
                            value[key] = arguments.callee(item.children[key], $s, selector);
                        }
                        return value;
                    }
                    //else {
                        //for (var key in value){
                            //value[key] = arguments.callee(item.children[key], $s, selector);
                        //}
                    //}
                }
                if (!isArray && typeof value === 'object' && item.children.length === 0){ //hash array on single leaf node -> set attrs on the tag
                    for (var key in value){
                        value[key] = item[key];
                    }
                    return value;
                }
                if (!isArray && typeof value === 'object'){ //hash array on single leaf node -> set attrs on the tag
                    value = {};
                    for (var i=0;i<item.children.length;i++){
                        var childItem = item.children[i];
                        value[childItem.value] = childItem.innerText;
                    }
                    return value;
                }
            }
            if ("value" in item){
                return item.value;
            }
            return item.innerText; 
        },prop, "read");
    }

    syncToDOM();

    var scopeProxy = new Proxy($s,{
        get(target, prop){
            //if (!(prop in target) && (document.getElementById(prop) || 
                                      //document.querySelectorAll(prop).length || 
                                      //document.getElementsByName(prop).length ||
                                      //document.getElementsByClassName(prop).length)){
                target[prop] = null;
            //}
            syncFromDOM(prop);
            dom = null;
            closure = null;
            return target[prop];
        },
        set(target, prop, value){
            //syncFromDOM();
            target[prop] = value
            syncToDOM(prop);
            dom = null;
            closure = null;
            return true;
        },
    })

    return scopeProxy;
}

function nbGetData(el){
    while (!('nbData' in el)){
        if (el.parentElement){
            el = el.parentElement;
        }
        else {
            return null;
        }
    }
    return el.nbData;
}
