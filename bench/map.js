/*global module:false*/
/*eslint strict:false, quotes: [2, "single"] */

var assert = (typeof window === 'undefined') ? require('assert') : window.chai.assert;
var _ = (typeof window === 'undefined') ? require('lodash') : window._;
var Platform = (typeof window === 'undefined') ? require('platform') : window.Platform;
var Benchmark = (typeof window === 'undefined') ? require('benchmark') : window.Benchmark;

var logElement;
function log(message) {
    console.log(message);
    if (typeof document !== 'undefined') {
        logElement = logElement || document.getElementById('log')
        logElement.innerHTML += (message + '\n');
    }
}

var keys = [];
for (var i = 0; i < 100; i++) {
    keys.push({name: 'mykey', index: i});
}

function createMap() {
    var map = new Map();
    for (var i = 0, n = keys.length; i < n; i++) {
        map.set(keys[i], i + 1000);
    }
    return map;
}
var map = createMap();

function cmp(a, b) {
    return a.index - b.index;
}

function createAssociativeArray() {
    var aa = new tsu.AssociativeArray(cmp);
    for (var i = 0, n = keys.length; i < n; i++) {
        aa.insert(keys[i], i + 1000);
    }
    return aa;
}
var aa = createAssociativeArray();

function lookupMap() {
    var total = 0;
    for (var i = 0, n = keys.length; i < n; i++) {
        total += map.get(keys[i]);
    }
    return total;
}

function lookupAssociativeArray() {
    var total = 0;
    for (var i = 0, n = keys.length; i < n; i++) {
        total += aa.find(keys[i]).second;
    }
    return total;
}

function forEachMap() {
    var total = 0;
    map.forEach(function(value, key) {
        total += value;
    });
    return total;
}

function forPairOfMap() {
    var total = 0;
    for (var pair of map) {
        total += pair[1];
    }
    return total;
}

function forValueOfMap() {
    var total = 0;
    for (var value of map.values()) {
        total += value;
    }
    return total;
}

function forVarIndexInAA() {
    var total = 0;
    for (var i = 0, n = aa.size(); i < n; i++) {
        total += aa.itemAt(i).second;
    }
    return total;
}

function forEachAA() {
    var total = 0;
    tsu.forEach(aa, function(pair) {
        total += pair.second;
    });
    return total;
}

function creationBenchmark(callback) {
    log('----- Running Creation benchmark...');
    (new Benchmark.Suite).add('createMap', createMap)
    .add('createAssociativeArray', createAssociativeArray)
    .on('cycle', function(event) {
      log(String(event.target));
    }).on('complete', function() {
        var fastest = this.filter('fastest')[0];
        var slowest = this.filter('slowest')[0];
        log('Fastest is ' + fastest.name + ' (± ' + Math.round(fastest.hz / slowest.hz * 100)/100 + 'x faster)');
        if (callback) callback();
    }).run({ 'async': true });
}

function lookupBenchmark(callback) {
    log('----- Running Lookup benchmark...');
    (new Benchmark.Suite).add('lookupMap', lookupMap)
    .add('lookupAssociativeArray', lookupAssociativeArray)
    .on('cycle', function(event) {
      log(String(event.target));
    }).on('complete', function() {
        var fastest = this.filter('fastest')[0];
        var slowest = this.filter('slowest')[0];
        log('Fastest is ' + fastest.name + ' (± ' + Math.round(fastest.hz / slowest.hz * 100)/100 + 'x faster)');
        if (callback) callback();
    }).run({ 'async': true });
}

function enumBenchmark(callback) {
    log('----- Running Enumeration benchmark...');
    (new Benchmark.Suite).add('forEachMap', forEachMap)
    .add('forPairOfMap', forPairOfMap)
    .add('forValueOfMap', forValueOfMap)
    .add('forVarIndexInAA', forVarIndexInAA)
    .add('forEachAA', forEachAA)
    .on('cycle', function(event) {
      log(String(event.target));
    }).on('complete', function() {
        var fastest = this.filter('fastest')[0];
        var slowest = this.filter('slowest')[0];
        log('Fastest is ' + fastest.name + ' (± ' + Math.round(fastest.hz / slowest.hz * 100)/100 + 'x faster)');
        if (callback) callback();
    }).run({ 'async': true });
}

creationBenchmark(function() {
    lookupBenchmark(function() {
        enumBenchmark();
    });
});
