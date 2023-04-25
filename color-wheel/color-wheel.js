const DEFAULT_COLOR_WHEEL_FILE = "color-wheel.json"

// import Menu from './d3-sunburst-menu-master/d3-sunburst-menu-master/src/d3-sunburst-menu.js';

function getPath () {
    let s = new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/ig)[0]
    return s.substring(1);
}


function createElement(type, style)
{
    let item = document.createElement(type);

    Object.keys(style).forEach(s=>{
        item.style[s] = style[s];
    });

    return item;
}
function createElementNS(type, style)
{
    let item = document.createElementNS("http://www.w3.org/2000/svg", type);

    Object.keys(style).forEach(s=>{
        item.style[s] = style[s];
    });

    return item;
}
//("http://www.w3.org/2000/svg", "svg")


if (window["MOODI"] === undefined)
{
    window["MOODI"] = {};
    window["MOODI"].clearMoodPreferences = function(n)
    {
        window[n+"-moodPreferences"].clearMoodPreferences();
    }
    window["MOODI"].getEmotionState = function(n, emotion)
    {
        return window[n+"-moodPreferences"].getEmotionState(emotion);
    }
    window["MOODI"].getEmotionColor = function(n, emotion)
    {
        return window[n+"-moodPreferences"].getEmotionColor(emotion);
    }
    window["MOODI"].setEmotionState = function(n, emotion)
    {
        window[n+"-moodPreferences"].updateEmotionState(emotion);
    }
    window["MOODI"].setEmotionColor = function(n, emotion, color)
    {
        window[n+"-moodPreferences"].updateEmotionColor(emotion, color);
    }
    window["MOODI"].setInteractable = function(n, b)
    {
        window[n+"-moodPreferences"].setInteractable(b);
    }
    window["MOODI"].setVisibility = function(n, b)
    {
        window[n+"-moodPreferences"].setVisibility(b);
    }
}


function createSliver(params)
{
    console.log(params.label + ": ")
    console.log(params)
    // let offsetRotation = (360 * (params.offset / params.totalNumOuter));
    // let rotation = 360 / params.groupChildren / params.totalNumOuter;
    let rotation = 360 * params.offset + 360 * (params.position / params.weight);
    let unitRot = 360 / (params.weight);
    let wrapper = createElement("div", {
        "position": "absolute",
        "width": "100%",
        "height": "100%",
        "pointer-events" : "none"
    });
    let textRotation = 2;
    let labelElem = createElement("div", {
        "position" : "absolute",
        "top": "-50%",
        "right": "-50%",
        "width": "100%",
        "height": "100%",
        "transform-origin": "0% 100%",
        "transform" : `rotate(${rotation + textRotation}deg) scale(0.47)`,
        // "transform" : `rotate(${offsetRotation + (params.position * rotation) + textRotation}deg) scale(0.47)`,
        "z-index" : "999",
        "font-family" : "Arial",
        "font-size" : "20px",
        "pointer-events" : "none"
    });
    labelElem.innerText = params.label;
    let sliverWrapper = createElement("li", {
        "overflow": "hidden",
        "position": "absolute",
        "top": "-50%",
        "right": "-50%",
        "width": "100%",
        "height": "100%",
        "transform-origin": "0% 100%",
        "transform" : `rotate(${rotation}deg) skewY(${(90 + (unitRot))}deg)`,
        // "transform" : `rotate(${offsetRotation + (params.position * rotation)}deg) skewY(${(rotation + 90)}deg)`,
        "border" : "1px solid black",
        "pointer-events" : "none"
    })
    let sliver = createElement("div", {
        "position": "absolute",
        "left": "-100%",
        "width": "200%",
        "height": "200%",
        "background": params.color,
        "pointer-events" : "auto"
    });
    sliverWrapper.appendChild(sliver);
    wrapper.appendChild(sliverWrapper);
    wrapper.appendChild(labelElem);
    return wrapper;
}

export default class ColorWheel
{
    constructor(params)
    {
        this.params = params || {};


        this.interactable = this.params.interactable !== undefined ? this.params.interactable : true;
        this.visible = this.params.visible !== undefined ? this.params.visible :  true;
    }

    generateHTML()
    {
        return this.parseColorWheelFile();
    }

    parseColorWheelFile()
    {
        let scope = this;

        return new Promise(async resolve=> {

            // Check
            let settingsJSON = null;
            if (scope.params.colorWheelConfig === undefined)
            {
                let colorWheelFile = DEFAULT_COLOR_WHEEL_FILE;

                // Load as text file
                let r = await fetch(getPath() + "on");
                // let r = await fetch(getPath() + colorWheelFile);
                settingsJSON = await r.json();
            }
            else
            {
                settingsJSON = JSON.parse(JSON.stringify(scope.params.colorWheelConfig));
            }
            
            // Store the name
            this.name = settingsJSON["name"];
            this.storageName = this.name + "-" + "moodPreferences";
            this.appName = this.name + "-" + "svgapp";

            // Create mood preferences (internal)
            this.moodPreferences = {};

            // Now we have json with settings (hopefully correct format)
            let html = await scope.buildWheel3(settingsJSON);

            // Ensure we have initialized/updated mood preferences
            this.updateMoodPreferences(true);

            // Set global value
            window[this.storageName] = this;

            // Callback with generated html
            resolve(html);
        });
    }
    


    async buildWheel3(settings)
    {

        let numChildren = 0;
        let maxDepth = 0;
        let currentDepth = 1;
        let currIdx = 0;
        //console.log(settings)
        let curr = Object.values(settings["moods"])[currIdx];

        // Set up tree for d3 tree
        let tree = {};
        tree["nid"] = 4000*Math.random()
        tree["_children"] = [];
        let currTree = {};
        tree["_children"].push(currTree);
        currTree["id"] = curr["mood-name"]; 
        currTree["name"] = curr["mood-name"]; 
        currTree["fill"] = curr["color"]; 
        currTree["_children"] = [];
        currTree["_parent"] = tree;

        // basic callback func
        function default_callback(scope, node, dom) {
            if (window.MOODI.mode !== "colors")
            {
                scope = window.MOODI.primary
            }
            console.log(scope.name + ": " + node.id);
            console.log(scope.moodPreferences[node.id]["shown"]);
            scope.updateEmotionState(node.id, dom);
            console.log(scope.moodPreferences[node.id]["shown"]);
        }

        // Sets tree components
        let scope = this;
        function setTreeComponent(_currTree, _curr)
        {
                _currTree["id"] = _currTree["id"] || _curr["mood-name"].toLowerCase(); 
                _currTree["name"] = _currTree["name"] || _curr["mood-name"]; 
                _currTree["fill"] = _currTree["fill"] || _curr["color"]; 
                _currTree["_children"] = _currTree["_children"] || [];
                _currTree["callback"] = _currTree["callback"] || function(node, dom){default_callback(scope, node, dom)};
                // Also set internal mood preferences dictionary
                scope.moodPreferences[_currTree["id"].toLowerCase()] = {"id" : _currTree["id"], "treeElem" : _currTree};
        }

        // Crawl through all emotions and sub emotions
        // DFS
        while (true)
        {
            if (curr === undefined)
            {
                currIdx++;
                let next = settings["moods"][currIdx];
                if (next !== undefined)
                {
                    curr = Object.values(settings["moods"])[currIdx];
                    currTree = {};
                    tree["_children"].push(currTree);
                    setTreeComponent(currTree, curr);
                    currTree["_parent"] = tree;
                    currentDepth++;
                }
                else
                {
                    // End of traversal
                    curr = undefined;
                    break;
                }
            }
            else if (curr["moods"] !== undefined)
            {
                let i = 0;
                let vals = Object.values(curr["moods"]);

                setTreeComponent(currTree, curr);

                while (i < curr["moods"].length)
                {
                    let child = curr["moods"][i];
                    if (child.found === undefined)
                    {
                        // Traverse into child
                        curr.depth = currentDepth;
                        currentDepth++;
                        maxDepth = Math.max(...[maxDepth, currentDepth]);
                        child.parent = curr;
                        // Store child cound
                        curr.count = curr.count || 0;
                        // Move curr tree to child
                        var childTree = {};
                        currTree["_children"].push(childTree);
                        childTree["_parent"] = currTree;
                        currTree = childTree;

                        curr = child;
                        break;
                    }
                    i++;
                }

                if (i == vals.length)
                {
                    // Found all children
                    curr.found = true;
                    if (curr.parent)
                    {
                        curr.parent.count++;
                    }
                    curr = curr.parent;
                    currTree = currTree["_parent"];
                    currentDepth--;
                }

            }
            else if (curr.parent !== undefined)
            {
                // Handle particular child
                curr.parent.count++;
                numChildren++;
                curr.found = true;

                setTreeComponent(currTree, curr);


                curr = curr.parent;
                currTree = currTree["_parent"];
                currentDepth--;
            }
            else
            {
                
            }
        }

        //console.log(this.moodPreferences)
        
        let svg = createElementNS("svg", {});
        svg.setAttribute("id",this.appName);
        svg.setAttribute("class","svgapp");
        svg.setAttribute("name",this.name);
        this.svg = svg;
        this.svgParent = null;
        setTimeout(async()=>{
            console.log(scope.appName)
            scope.d3_sunburst_menu = new WheelMenu.create(tree, {x:0,y:0}, scope.appName);


            // Update
            Object.values(scope.moodPreferences).forEach(pref=>{
                //console.log(scope["name"])
                if (pref["shown"] == false)
                {
                    pref["treeElem"]["dom"].classList.add("hide-me")
                }
                else
                {
                    pref["treeElem"]["dom"].classList.remove("hide-me")
                }
            });
            // var d3_sunburst_menu = new Menu(tree, {x:0,y:0} , d3.select("#svgapp"));
            // d3_sunburst_menu.redraw();
            scope.svgParent = svg.parentElement;
            
            scope.setInteractable(scope.interactable);
            scope.setVisibility(scope.visible);
        }, 400);    
        return svg;
    }

    updateMoodPreferences(init)
    {
        // this.clearMoodPreferences();
        // First, we need a storage only version of mood preferences
        let moodPreferencesStore = {};
        // First, initialize all emotions to true
        Object.values(this.moodPreferences).forEach(preference=>{
            let key = preference["id"];
            if (init == true)
            {
                moodPreferencesStore[key] = {"shown":true, "color":this.moodPreferences[key]["treeElem"]["fill"]};
                //console.log(this.moodPreferences[key])
                this.moodPreferences[key]["shown"] = true;
            }
            else
            {
                moodPreferencesStore[key] = {"shown": this.moodPreferences[key]["shown"], "color":this.moodPreferences[key]["treeElem"]["fill"]} ;
            }
        })

        // Lets see if these exist in our local storage
        let mpOld =localStorage.getItem(this.storageName);
        if (mpOld != null && mpOld !== "null" && init == true)
        {
            console.log(this.name + ": " + this.storageName + ": " + mpOld)
            // Let's use our cached history
            let newKeys = Object.keys(moodPreferencesStore);
            let oldJSON = JSON.parse(mpOld);
            Object.keys(oldJSON).forEach(key=>{
                if (newKeys.includes(key))
                {
                    let pref = oldJSON[key];
                    this.moodPreferences[key]["shown"] = pref["shown"];
                    this.moodPreferences[key]["treeElem"]["fill"] = pref["color"];
                    moodPreferencesStore[key] = pref;   
                }
            })
        }

        // Now we can saev them
        localStorage.setItem(this.storageName, JSON.stringify(moodPreferencesStore));

        // Redraw
        if (this.d3_sunburst_menu !== undefined)
        {
            this.d3_sunburst_menu.redraw();
        }
    }

    clearMoodPreferences()
    {
        localStorage.setItem(this.storageName, null);
    }

    updateEmotionState(key, dom)
    {
        // We will need to do a tree like process
        if (!(key in this.moodPreferences))
        {
            return;
        }

        // Otherwise
        let mood = this.moodPreferences[key];
        // Recursively enable elements
        let scope = this;
        let b = mood["shown"];
        function recursiveToggleEmotion(_mood)
        {
            let _treeElem = _mood["treeElem"];
            _treeElem["_children"].forEach(child=>{
                recursiveToggleEmotion(scope.moodPreferences[child["id"]]);
            });

            scope.moodPreferences[_treeElem["id"]]["shown"] = !b;
            if (!b)
            {
                _treeElem["dom"].classList.remove("hide-me")
            }
            else
            {
                _treeElem["dom"].classList.add("hide-me")
            }
        }
        recursiveToggleEmotion(mood);

        // Update local storage
        this.updateMoodPreferences(false);
    }

    getEmotionState(key)
    {
        if (!(key in this.moodPreferences))
        {
            return false;
        }

        return this.moodPreferences[key]["shown"];
    }

    getEmotionColor(key)
    {
        if (!(key in this.moodPreferences))
        {
            return false;
        }

        return this.moodPreferences[key]["treeElem"]["fill"];
    }

    async updateEmotionColor(key, color)
    {
        if (!(key in this.moodPreferences))
        {
            return;
        }

        this.moodPreferences[key]["treeElem"]["fill"] = color;

        // Update local storage
        this.updateMoodPreferences(false);

        // Reload
        let parent = this.svgParent;
        this.svgParent.children[0].remove();
        let html = await this.generateHTML();
        parent.appendChild(html);
    }

    setInteractable(b)
    {
        this.interactable = b;

        if (b == true)
        {
            this.svg.style["pointer-events"] = "auto";
        }
        else
        {
            this.svg.style["pointer-events"] = "none";
        }
    }

    setVisibility(b)
    {
        this.visible = b;

        if (b == true)
        {
            this.svg.style["display"] = "";
        }
        else
        {
            this.svg.style["display"] = "none";
        }
    }
    
}