/*global describe, it*/
var assert = (typeof window === 'undefined') ? require('assert') : window.chai.assert;
var kiwi = (typeof window === 'undefined') ? require('../bin/kiwi.js') : window.kiwi;

describe('kiwi', function() {
    it('create Solver', function() {
        var solver = new kiwi.Solver();
        assert(solver);
    });

    describe('Variable', function() {
        var solver = new kiwi.Solver();
        var variable;
        it('create', function() {
            variable = new kiwi.Variable();
            assert(variable);
            assert.equal(0, variable.value());
        });
        it('addEditVariable', function() {
            solver.addEditVariable(variable, kiwi.Strength.strong);
            assert(solver.hasEditVariable(variable));
        });
        it('suggestValue', function() {
            solver.suggestValue(variable, 200);
            solver.updateVariables();
            assert.equal(200, variable.value());
        });
        it('removeEditVariable', function() {
            solver.removeEditVariable(variable);
            assert(!solver.hasEditVariable(variable));
        });
        it('Exception:DuplicateEditVariableError', function() {
            assert(!solver.hasEditVariable(variable));
            solver.addEditVariable(variable, kiwi.Strength.strong);
            assert(solver.hasEditVariable(variable));
            try {
                solver.addEditVariable(variable, kiwi.Strength.strong);
                assert(false);
            }
            catch (err) {
                assert.equal(err.message, 'duplicate edit variable');
            }
        });
        it('Exception:UnknownEditVariableError', function() {
            assert(solver.hasEditVariable(variable));
            solver.removeEditVariable(variable);
            assert(!solver.hasEditVariable(variable));
            try {
                solver.removeEditVariable(variable);
                assert(false);
            }
            catch (err) {
                assert.equal(err.message, 'unknown edit variable');
            }
        });
    });

    describe('Constraint', function() {
        var solver = new kiwi.Solver();
        var vars = {};
        it('create Expression', function() {
            var expr = new kiwi.Expression();
            assert(expr);
        });
        it('Constant left constraint (10)', function() {
            vars.left = new kiwi.Variable();
            var left = new kiwi.Constraint(new kiwi.Expression([-1, vars.left], 10), kiwi.Operator.Eq);
            solver.addConstraint(left);
            solver.updateVariables();
            assert.equal(vars.left.value(), 10);
        });
        it('Width edit variable (200)', function() {
            vars.width = new kiwi.Variable();
            solver.addEditVariable(vars.width, kiwi.Strength.strong);
            solver.suggestValue(vars.width, 200);
            solver.updateVariables();
            assert.equal(vars.width.value(), 200);
        });
        it('Right === left + width (210)', function() {
            vars.right = new kiwi.Variable();
            var right = new kiwi.Constraint(new kiwi.Expression([-1, vars.right], vars.left, vars.width), kiwi.Operator.Eq);
            solver.addConstraint(right);
            solver.updateVariables();
            assert.equal(vars.right.value(), 210);
        });
        it('centerX === left + (width / 2) (110)', function() {
            vars.centerX = new kiwi.Variable();
            var centerX = new kiwi.Constraint(new kiwi.Expression([-1, vars.centerX], vars.left, [0.5, vars.width]), kiwi.Operator.Eq);
            solver.addConstraint(centerX);
            solver.updateVariables();
            assert.equal(vars.centerX.value(), 110);
        });
    });
});
