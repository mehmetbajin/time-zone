'use strict';

describe('filter: basic', function () {
  var tzRole;
  var tzCodeName;

  beforeEach(module('app'));

  beforeEach(inject(function (_$filter_) {
    tzRole = _$filter_('tzRole');
    tzCodeName = _$filter_('tzCodeName');
  }));

  describe('tzRole', function () {
    it('defaults to `Unknown`', function () {
      expect(tzRole()).toEqual('Unknown');
    });

    it('maps the user role to its title', function () {
      expect(tzRole(10)).toEqual('User');
    });

    it('maps the manager role to its title', function () {
      expect(tzRole(20)).toEqual('Manager');
    });

    it('maps the administrator role to its title', function () {
      expect(tzRole(99)).toEqual('Administrator');
    });
  });

  describe('tzCodeName', function () {
    var code;

    it('formats name as label followed by offset', function () {
      code = {
        name: 'NAME',
        offset: '+01:00'
      };
      expect(tzCodeName(code)).toEqual('NAME (GMT+01:00)');
    });

    it('defaults to the empty string', function () {
      code = undefined;
      expect(tzCodeName(code)).toEqual('');
    });
  });
});
