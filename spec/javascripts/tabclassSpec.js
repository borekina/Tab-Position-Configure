describe('TabIdList class', function() {
    var instance = null;
    var windowId = undefined;

    beforeEach(function() {
        instance = new TabIdList();
        windowId = 0;
    });

    it('call add', function() {
        expect(instance.data[windowId]).toBeUndefined();
        instance.add({ windowId: windowId, tabId: 5 });
        expect(instance.data[windowId][0]).toEqual(5);
        expect(instance.data[windowId].length).toEqual(1);
    });

    it('call insert', function() {
        instance.add({ windowId: windowId, tabId: 1 });
        instance.add({ windowId: windowId, tabId: 2 });
        instance.add({ windowId: windowId, tabId: 3 });
        instance.add({ windowId: windowId, tabId: 4 });

        var id = 5;
        var index = 1;
        instance.insert({ windowId: windowId, index: index, tabId: id});
        expect(instance.data[windowId][index]).toEqual(id);

        id = 6;
        index = 7;
        instance.insert({ windowId: windowId, index: index, tabId: id});
        expect(instance.data[windowId][index]).toBeUndefined();
        expect(instance.data[windowId].length).toEqual(6);
    });

    it('call move', function() {
        instance.add({ windowId: windowId, tabId: 1 });
        instance.add({ windowId: windowId, tabId: 2 });
        instance.add({ windowId: windowId, tabId: 3 });
        instance.add({ windowId: windowId, tabId: 4 });
        instance.add({ windowId: windowId, tabId: 5 });

        var fromIndex = 4;
        var toIndex = 2;
        instance.move({ windowId: windowId,
                        fromIndex: fromIndex,
                        toIndex: toIndex });
        var found = instance.find({ windowId: windowId, tabId: 5 });
        expect(found.index).toEqual(toIndex);

        expect(instance.data[windowId]).toEqual([1, 2, 5, 3, 4]);
    });

    it('call find', function() {
        instance.add({ windowId: windowId, tabId: 2 });
        instance.add({ windowId: windowId, tabId: 3 });
        instance.add({ windowId: windowId, tabId: 5 });

        var found = instance.find({ windowId: windowId, tabId: 3 });
        expect(found.index).toEqual(1);
        var found = instance.find({ tabId: 3 });
        expect(found.windowId).toEqual(windowId);

        expect(function() {
            instance.find({ windowId: windowId, tabId: 6 }) }).toThrow();
    });

    it('call remove', function() {
        instance.add({ windowId: windowId, tabId: 2 });
        instance.add({ windowId: windowId, tabId: 3 });
        instance.add({ windowId: windowId, tabId: 5 });

        // remove
        var tabId = 2;
        expect(instance.data[windowId].length).toEqual(3);
        expect(function() {
            instance.find({ windowId: windowId, tabId: tabId });
        }).not.toThrow();
        instance.remove({ windowId: windowId, tabId: tabId });
        expect(function() {
            instance.find({ windowId: windowId, tabId: tabId });
        }).toThrow();
        expect(instance.data[windowId].length).toEqual(2);

        var tabId = 3;
        expect(function() {
            instance.find({ windowId: windowId, tabId: tabId });
        }).not.toThrow();
        instance.remove({ windowId: windowId });
        expect(instance.data[windowId]).toBeUndefined();
    });

    it('call get', function() {
        instance.add({ windowId: windowId, tabId: 2 });
        instance.add({ windowId: windowId, tabId: 3 });
        instance.add({ windowId: windowId, tabId: 5 });

        expect(instance.get({ windowId: windowId, index: 2 })).toEqual(5);
        expect(function() {
            instance.get({ windowId: windowId, index: 5 });
        }).toThrow();
    });

    it('call length', function() {
        instance.add({ windowId: windowId, tabId: 2 });
        instance.add({ windowId: windowId, tabId: 3 });
        instance.add({ windowId: windowId, tabId: 5 });

        expect(instance.length(windowId)).toEqual(3);
        expect(instance.length()).toEqual(1);
    });

    it('call isEmpty', function() {
        expect(function() { instance.isEmpty() }).toThrow();
        expect(instance.isEmpty(windowId)).toBeTruthy();
        instance.add({ windowId: windowId, tabId: 2 });
        expect(instance.isEmpty(windowId)).toBeFalsy();
    });
});

describe('TabIdHistory class', function() {
    var instance = null;
    var windowId = undefined;

    beforeEach(function() {
        instance = new TabIdHistory();
        windowId = 0;
    });

    it('initialized history', function() {
        instance = new TabIdHistory();
    });

    it('call add', function() {
        expect(instance.history[windowId]).toBeUndefined();
        expect(instance.add({ windowId: windowId, tabId: 0 })).toEqual(0);
        expect(instance.add({ windowId: windowId, tabId: 1 })).toEqual(1);
        expect(instance.add({ windowId: windowId, tabId: 2 })).toEqual(2);
        expect(instance.history[windowId].length).toEqual(3);
    });

    it('call remove', function() {
        expect(instance.add({ windowId: windowId, tabId: 0 })).toEqual(0);
        expect(instance.add({ windowId: windowId, tabId: 1 })).toEqual(1);

        // remove
        instance.remove({ windowId: windowId, tabId: 0 });
        expect(instance.history[windowId][0]).toEqual(1);
        expect(instance.history[windowId].length).toEqual(1);

        instance.remove({ windowId: windowId, tabId: 1 });
        expect(instance.history[windowId].length).toEqual(0);
    });

    it('call get', function() {
        expect(instance.add({ windowId: windowId, tabId: 0 })).toEqual(0);
        expect(instance.add({ windowId: windowId, tabId: 1 })).toEqual(1);

        expect(instance.get({ windowId: windowId, index: 1 })).toEqual(1);
        expect(function() {
            instance.get({ windowId: windowId, index: 5 });
        }).toThrow();
    });

    it('call getlastPrevious', function() {
        expect(instance.add({ windowId: windowId, tabId: 1 })).toEqual(0);
        expect(instance.add({ windowId: windowId, tabId: 2 })).toEqual(1);

        // lastPrevious
        expect(instance.lastPrevious(windowId)).toEqual(2);
        expect(instance.lastPrevious(windowId, 2)).toEqual(1);
        expect(instance.lastPrevious(windowId, 3)).toEqual(1);
    });

    it('call update', function() {
        expect(instance.add({ windowId: windowId, tabId: 0 })).toEqual(0);
        expect(instance.add({ windowId: windowId, tabId: 1 })).toEqual(1);

        expect(function() {
            instance.update({ windowId: windowId, index: 5, tabId: 5 });
        }).toThrow();

        var index = 0;
        expect(instance.update({
               windowId: windowId, index: index, tabId: 5 })).toEqual(0);
        expect(instance.history[windowId][index]).toEqual(5);
    });
});
