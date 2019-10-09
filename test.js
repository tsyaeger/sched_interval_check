var assert = require('assert');
var mealSlots = require('./mealSlots.js')

describe('Meal Slots', function () {
    
    it('should return false if vendor id does not exist', function () {
      assert.equal(mealSlots.isVendorAvailable(10, "2017-01-01 14:30:00"), false);
    });

    it('should return false if unavailable', function () {
        assert.equal(mealSlots.isVendorAvailable(2, "2017-01-01 15:15:00"), false);
        assert.equal(mealSlots.isVendorAvailable(2, "2017-01-01 15:45:00"), false);
        assert.equal(mealSlots.isVendorAvailable(2, "2017-01-01 16:00:00"), false);
        assert.equal(mealSlots.isVendorAvailable(1, "2017-01-01 13:45:00"), false);
    });
    
    it('should return true if available', function () {
        assert.equal(mealSlots.isVendorAvailable(2, "2017-02-01 14:30:00"), true);
        assert.equal(mealSlots.isVendorAvailable(2, "2017-01-01 15:00:00"), true);
        assert.equal(mealSlots.isVendorAvailable(2, "2017-01-01 16:10:00"), true);
        assert.equal(mealSlots.isVendorAvailable(1, "2017-01-01 12:50:00"), true);
    });

});
