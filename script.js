// alert("*");

window.onload = function(){
    let main = new Main();
    main.init();
}

class Main{
    constructor(){
        this.testButton1 = document.getElementById('test-button-1');
        this.testButton2 = document.getElementById('test-button-2');
        this.testButton3 = document.getElementById('test-button-3');
        this.left = document.getElementById('left-side');
        this.right = document.getElementById('right-side');
        this.optionsForm = document.getElementById('options-form');
        this.maxLength = document.getElementById('max-length');
        this.startChar = document.getElementById('start-char');
        this.epsilon = document.getElementById('epsilon');
        this.rulesPreview = document.getElementById('preview');
        this.output = document.getElementById('output');
        this.addRuleButton = document.getElementById('rule-add-button');
        this.generateButton = document.getElementById('generate');
        this.clearButton = document.getElementById('clear');
        this.rules = [];
        this.nonterminals = [];
        this.terminals = [];
    }

    init(){
        this.testButton1.onclick = () => {
            this.reset();
            this.left.value = "T";
            this.right.value = "aU";
            this.addRule(); 
            this.left.value = "U";
            this.right.value = "baU";
            this.addRule();
            this.left.value = "U";
            this.right.value = "e";
            this.addRule();
            this.startChar.value = "T";
            this.left.value = "";
            this.right.value = ""; 
        }

        this.testButton2.onclick = () => {
            this.reset();
            this.left.value = "S";
            this.right.value = "FF";
            this.addRule(); 
            this.left.value = "F";
            this.right.value = "aFb";
            this.addRule(); 
            this.left.value = "F";
            this.right.value = "ab";
            this.addRule(); 
            this.startChar.value = "S";
            this.left.value = "";
            this.right.value = "";
        }

        this.testButton3.onclick = () => {
            this.reset();
            this.left.value = "S";
            this.right.value = "aB";
            this.addRule(); 
            this.left.value = "S";
            this.right.value = "bA";
            this.addRule();
            this.left.value = "S";
            this.right.value = "e";
            this.addRule();
            this.left.value = "B";
            this.right.value = "bS";
            this.addRule();
            this.left.value = "B";
            this.right.value = "aBB";
            this.addRule();
            this.left.value = "A";
            this.right.value = "aS";
            this.addRule();
            this.left.value = "A";
            this.right.value = "bAA";
            this.addRule();
            this.startChar.value = "S";
            this.left.value = "";
            this.right.value = "";
        }

        this.addRuleButton.onclick = (event) => {
            // alert("*");
            event.preventDefault();
            this.addRule();
            this.left.value = "";
            this.right.value = "";            
        }

        this.generateButton.onclick = (event) => {
            event.preventDefault();
            this.updateLists();
            this.generateGrammar();
        }

        this.clearButton.onclick = () => { this.reset(); }
    }

    clearOutput() { this.output.textContent = ""; }
    showOutput(strings) { for (let s of strings){ this.output.textContent += s + '\r'; }}
    sortOutput(array) { return [...array].sort(function(a, b) { return a.length - b.length || a.localeCompare(b) }); }


    addRule() {
        if (this.left.value && this.right.value) {
            let rule = new Rule(this.left.value, this.right.value);
            this.rules.push(rule);
            this.rulesPreview.textContent += `${rule.leftSide} → ${rule.rightSide}\r\n`
        } else {
            alert("Пожалуйста, заполните все необходимые поля для добавления правила.")
        }
    }

    updateLists() {
        for (let rule of this.rules){
            for (let ch of rule.leftSide){
                if (Rule.isNonterminal(ch)){
                    if(!(this.nonterminals.find(e => e === ch))) { this.nonterminals.push(ch) }
                } else {
                    if (!(this.terminals.find(e => e === ch))) { this.terminals.push(ch) }
                }
            }
            for (let ch of rule.rightSide){
                if (Rule.isNonterminal(ch)){
                    if(!(this.nonterminals.find(e => e === ch))){ this.nonterminals.push(ch) }
                } else {
                    if (!(this.terminals.find(e => e === ch))) { this.terminals.push(ch); }
                }
            }
        }
    }

    reset(){
        this.rules = [];
        this.terminals = [];
        this.nonterminals = [];
        this.rulesPreview.textContent = "";
        this.clearOutput();
    }

    generateGrammar(){
        this.clearOutput();
        let grammar = new Grammar();
        grammar.terminals = this.terminals;
        grammar.nonterminals = this.nonterminals;
        grammar.startChar = this.startChar?.value;
        grammar.epsilon = 'e';
        grammar.maxLength = Number(this.maxLength?.value);
        for (let rule of this.rules){ grammar.addRule(rule); }
        grammar.generate();
        this.showOutput(this.sortOutput(grammar.strings));
    }
}

class Grammar{
    constructor(){
        this._terminals = []
        this._nonterminals = []
        this._rules = {}
        this._startChar = undefined
        this._epsilon = 'e';
        this._maxLength = 10;
        this.strings = new Set();
    }

    addRule(rule){
        if (this.rules[rule.leftSide]) {
            if(this.rules[rule.leftSide] !== rule.rightSide) { this.rules[rule.leftSide].push(rule.rightSide); }
        } else {
            this.rules[rule.leftSide] = [rule.rightSide];
        }
    }

    deleteRule(rule){
        if (this.rules[rule.leftSide]){
            let idx = this.rules[rule.leftSide].findIndex(e => e===rule.rightSide);
            if (idx >= 0){ this.rules[rule.leftSide].splice(idx, 1); }    
        }
    }

    get rules() { return this._rules; }
    get terminals() { return this._terminals; }
    get nonterminals() { return this._nonterminals; }
    get startChar() { return this._startChar; }
    get maxLength() { return this._maxLength; }
    get epsilon() { return this._epsilon; }
    set terminals(terminalsList) { this._terminals = terminalsList; }
    set nonterminals(nonterminalsList) { this._nonterminals = nonterminalsList; }
    set maxLength(value) { this._maxLength = value; }
    set startChar(value) { this._startChar = value; }
    set epsilon(value){ this._epsilon = value; }

    generate(){
        this.strings.clear();
        for (let res of this.rules[this.startChar]) { this._parse(res); }
    }

    _parse(string){
        let l = string.length;

        if (this._countLetters(string) > this.maxLength){ return;} 

        for (let i = 0; i < l; i++){
            for (let k = i; k < l, Rule.isNonterminal(string[k]); k++){
                let key = string.slice(i, k+1);
                if (Object.keys(this.rules).find(e => e === key)){
                    for(let res of this.rules[key]){
                        let s = string.slice(0, i) + res + string.slice(k+1);
                        this._parse(s);
                    }
                }
                return;
            }
            if (string[i] === this.epsilon){
                string = string.slice(0, i) + string.slice(i+1);
                i--;
                l--;
            }
            if (i === l - 1) { this.strings.add(string); }
        }
    }

    _countLetters(string){
        let s = 0;
        for (let ch of string){
            if (!Rule.isNonterminal(ch) && ch!==self.epsilon){ s++; }
        }
        return s;
    }
}

class Rule{
    constructor(left, right) {
        this.leftSide = left;
        this.rightSide = right;       
    }

    static isEqual(firstRule, secondRule){ return firstRule.leftSide == secondRule.leftSide && firstRule.rightSide == secondRule.rightSide; }
    static isNonterminal(value){ return value != value.toLowerCase() && value == value.toUpperCase(); }
}