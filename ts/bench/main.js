/*global module:false*/
/*eslint strict:false, quotes: [2, "single"] */

var assert = (typeof window === 'undefined') ? require('assert') : window.chai.assert;
var _ = (typeof window === 'undefined') ? require('lodash') : window._;
var Platform = (typeof window === 'undefined') ? require('platform') : window.Platform;
var Benchmark = (typeof window === 'undefined') ? require('benchmark') : window.Benchmark;
var c = (typeof window === 'undefined') ? require('cassowary') : window.c; // cassowary
var kiwi = (typeof window === 'undefined') ? require('../bin/kiwi.js') : window.kiwi;

var logElement;
function log(message) {
    console.log(message);
    if (typeof document !== 'undefined') {
        logElement = logElement || document.getElementById('log')
        logElement.innerHTML += (message + '\n');
    }
}

function createKiwiSolver() {
    var solver = new kiwi.Solver();
    var strength = new kiwi.Strength.create(0, 900, 1000);

    // super-view
    var superView = {
        left: new kiwi.Variable(),
        top: new kiwi.Variable(),
        width: new kiwi.Variable(),
        height: new kiwi.Variable(),
        right: new kiwi.Variable(),
        bottom: new kiwi.Variable()
    };
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression(superView.left), kiwi.Operator.Eq));
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression(superView.top), kiwi.Operator.Eq));
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, superView.right], superView.left, superView.width), kiwi.Operator.Eq));
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, superView.bottom], superView.top, superView.height), kiwi.Operator.Eq));
    solver.addEditVariable(superView.width, kiwi.Strength.create(999, 1000, 1000));
    solver.addEditVariable(superView.height, kiwi.Strength.create(999, 1000, 1000));
    solver.suggestValue(superView.width, 300);
    solver.suggestValue(superView.height, 200);

    // subView1
    var subView1 = {
        left: new kiwi.Variable(),
        top: new kiwi.Variable(),
        width: new kiwi.Variable(),
        height: new kiwi.Variable(),
        right: new kiwi.Variable(),
        bottom: new kiwi.Variable()
    };
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, subView1.right], subView1.left, subView1.width), kiwi.Operator.Eq));
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, subView1.bottom], subView1.top, subView1.height), kiwi.Operator.Eq));

    // subView2
    var subView2 = {
        left: new kiwi.Variable(),
        top: new kiwi.Variable(),
        width: new kiwi.Variable(),
        height: new kiwi.Variable(),
        right: new kiwi.Variable(),
        bottom: new kiwi.Variable()
    };
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, subView2.right], subView2.left, subView2.width), kiwi.Operator.Eq));
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, subView2.bottom], subView2.top, subView2.height), kiwi.Operator.Eq));

    // Position sub-views in super-view
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, subView1.left], superView.left), kiwi.Operator.Eq, undefined, strength));
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, subView1.top], superView.top), kiwi.Operator.Eq, undefined, strength));
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, subView1.bottom], superView.bottom), kiwi.Operator.Eq, undefined, strength));
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, subView1.width], subView2.width), kiwi.Operator.Eq, undefined, strength));
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, subView1.right], subView2.left), kiwi.Operator.Eq, undefined, strength));
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, subView2.right], superView.right), kiwi.Operator.Eq, undefined, strength));
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, subView2.top], superView.top), kiwi.Operator.Eq, undefined, strength));
    solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, subView2.bottom], superView.bottom), kiwi.Operator.Eq, undefined, strength));

    // Calculate
    solver.updateVariables();

    // Uncomment to verify results
    //console.log('superView: ' + JSON.stringify(superView, undefined, 2));
    //console.log('subView1: ' + JSON.stringify(subView1, undefined, 2));
    //console.log('subView2: ' + JSON.stringify(subView2, undefined, 2));
    assert.equal(subView1.width.value(), 150);
    assert.equal(subView2.left.value(), 150);

    // Return data
    return {
        solver: solver,
        superView: superView,
        subView1: subView1,
        subView2: subView2
    };
}

function createKiwiSolverNewAPI() {
    var solver = new kiwi.Solver();
    var strength = new kiwi.Strength.create(0, 900, 1000);

    // super-view
    var superView = {
        left: new kiwi.Variable(),
        top: new kiwi.Variable(),
        width: new kiwi.Variable(),
        height: new kiwi.Variable(),
        right: new kiwi.Variable(),
        bottom: new kiwi.Variable()
    };
    solver.createConstraint(superView.left, kiwi.Operator.Eq, 0);
    solver.createConstraint(superView.top, kiwi.Operator.Eq, 0);
    solver.createConstraint(superView.right, kiwi.Operator.Eq, superView.left.plus(superView.width));
    solver.createConstraint(superView.bottom, kiwi.Operator.Eq, superView.top.plus(superView.height));
    solver.addEditVariable(superView.width, kiwi.Strength.create(999, 1000, 1000));
    solver.addEditVariable(superView.height, kiwi.Strength.create(999, 1000, 1000));
    solver.suggestValue(superView.width, 300);
    solver.suggestValue(superView.height, 200);

    // subView1
    var subView1 = {
        left: new kiwi.Variable(),
        top: new kiwi.Variable(),
        width: new kiwi.Variable(),
        height: new kiwi.Variable(),
        right: new kiwi.Variable(),
        bottom: new kiwi.Variable()
    };
    solver.createConstraint(subView1.right, kiwi.Operator.Eq, subView1.left.plus(subView1.width));
    solver.createConstraint(subView1.bottom, kiwi.Operator.Eq, subView1.top.plus(subView1.height));

    // subView2
    var subView2 = {
        left: new kiwi.Variable(),
        top: new kiwi.Variable(),
        width: new kiwi.Variable(),
        height: new kiwi.Variable(),
        right: new kiwi.Variable(),
        bottom: new kiwi.Variable()
    };
    solver.createConstraint(subView2.right, kiwi.Operator.Eq, subView2.left.plus(subView2.width));
    solver.createConstraint(subView2.bottom, kiwi.Operator.Eq, subView2.top.plus(subView2.height));

    // Position sub-views in super-view
    solver.createConstraint(subView1.left, kiwi.Operator.Eq, superView.left, strength);
    solver.createConstraint(subView1.top, kiwi.Operator.Eq, superView.top, strength);
    solver.createConstraint(subView1.bottom, kiwi.Operator.Eq, superView.bottom, strength);
    solver.createConstraint(subView1.width, kiwi.Operator.Eq, subView2.width, strength);
    solver.createConstraint(subView1.right, kiwi.Operator.Eq, subView2.left, strength);
    solver.createConstraint(subView2.right, kiwi.Operator.Eq, superView.right, strength);
    solver.createConstraint(subView2.top, kiwi.Operator.Eq, superView.top, strength);
    solver.createConstraint(subView2.bottom, kiwi.Operator.Eq, superView.bottom, strength);

    // Calculate
    solver.updateVariables();

    // Uncomment to verify results
    //console.log('superView: ' + JSON.stringify(superView, undefined, 2));
    //console.log('subView1: ' + JSON.stringify(subView1, undefined, 2));
    //console.log('subView2: ' + JSON.stringify(subView2, undefined, 2));
    assert.equal(subView1.width.value(), 150);
    assert.equal(subView2.left.value(), 150);

    // Return data
    return {
        solver: solver,
        superView: superView,
        subView1: subView1,
        subView2: subView2
    };
}

function createCassowarySolver() {
    var solver = new c.SimplexSolver();
    var strength = new c.Strength('priority', 0, 900, 1000);

    // super-view
    var superView = {
        left: new c.Variable({value: 0}),
        top: new c.Variable({value: 0}),
        width: new c.Variable(),
        height: new c.Variable(),
        right: new c.Variable(),
        bottom: new c.Variable()
    };
    solver.addConstraint(new c.StayConstraint(superView.left, c.Strength.required));
    solver.addConstraint(new c.StayConstraint(superView.top, c.Strength.required));
    solver.addConstraint(new c.Equation(superView.right, c.plus(superView.left, superView.width)));
    solver.addConstraint(new c.Equation(superView.bottom, c.plus(superView.top, superView.height)));
    solver.addEditVar(superView.width, new c.Strength('required', 999, 1000, 1000));
    solver.addEditVar(superView.height, new c.Strength('required', 999, 1000, 1000));
    solver.suggestValue(superView.width, 300);
    solver.suggestValue(superView.height, 200);

    // subView1
    var subView1 = {
        left: new c.Variable(),
        top: new c.Variable(),
        width: new c.Variable(),
        height: new c.Variable(),
        right: new c.Variable(),
        bottom: new c.Variable()
    };
    solver.addConstraint(new c.Equation(subView1.right, c.plus(subView1.left, subView1.width)));
    solver.addConstraint(new c.Equation(subView1.bottom, c.plus(subView1.top, subView1.height)));

    // subView2
    var subView2 = {
        left: new c.Variable(),
        top: new c.Variable(),
        width: new c.Variable(),
        height: new c.Variable(),
        right: new c.Variable(),
        bottom: new c.Variable()
    };
    solver.addConstraint(new c.Equation(subView2.right, c.plus(subView2.left, subView2.width)));
    solver.addConstraint(new c.Equation(subView2.bottom, c.plus(subView2.top, subView2.height)));

    // Position sub-views in super-view
    solver.addConstraint(new c.Equation(subView1.left, superView.left, strength));
    solver.addConstraint(new c.Equation(subView1.top, superView.top, strength));
    solver.addConstraint(new c.Equation(subView1.bottom, superView.bottom, strength));
    solver.addConstraint(new c.Equation(subView1.right, subView2.left, strength));
    solver.addConstraint(new c.Equation(subView1.width, subView2.width, strength));
    solver.addConstraint(new c.Equation(subView2.right, superView.right, strength));
    solver.addConstraint(new c.Equation(subView2.top, superView.top, strength));
    solver.addConstraint(new c.Equation(subView2.bottom, superView.bottom, strength));

    // Calculate
    solver.resolve();

    // Return data
    return {
        solver: solver,
        superView: superView,
        subView1: subView1,
        subView2: subView2
    };
    // Uncomment to verify results
    //assert.equal(subView1.width.value, 150);
    //assert.equal(subView2.left.value, 150);
}

var cassowaryData = createCassowarySolver();
function solveCassowary(data) {
    var data = cassowaryData;
    data.solver.suggestValue(data.superView.width, 100);
    data.solver.suggestValue(data.superView.height, 50);
    data.solver.resolve();
    data.solver.suggestValue(data.superView.width, 200);
    data.solver.suggestValue(data.superView.height, 500);
    data.solver.resolve();
}

var kiwiData = createKiwiSolver();
function solveKiwi(data) {
    var data = kiwiData;
    data.solver.suggestValue(data.superView.width, 100);
    data.solver.suggestValue(data.superView.height, 50);
    data.solver.updateVariables();
    data.solver.suggestValue(data.superView.width, 200);
    data.solver.suggestValue(data.superView.height, 500);
    data.solver.updateVariables();
}


function runBench(name, benchmarks, callback) {
    log('----- Running ' + name + ' benchmark...');
    var suite = new Benchmark.Suite();
    for (var i = 0; i < benchmarks.length; i++) {
        suite.add(benchmarks[i].name, benchmarks[i].fn);
    }
    suite.on('cycle', function(event) {
      log(String(event.target));
    }).on('complete', function() {
        var fastest = this.filter('fastest')[0];
        var slowest = this.filter('slowest')[0];
        log('Fastest is ' + fastest.name + ' (± ' + Math.round(fastest.hz / slowest.hz * 100)/100 + 'x faster)');
        if (callback) callback();
    }).run({ 'async': true });
}

runBench('creation', [
    {name: 'Cassowary.js', fn: createCassowarySolver},
    {name: 'kiwi', fn: createKiwiSolver},
    {name: 'kiwi new API', fn: createKiwiSolverNewAPI}],
    function() {
        runBench('solving', [
            {name: 'Cassowary.js', fn: solveCassowary}, 
            {name: 'kiwi', fn: solveKiwi}
        ]);
    }
);

