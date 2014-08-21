// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Tests for the form builders.
 *
 * @author sll@google.com (Sean Lip)
 */

describe('HTML to text', function() {
  beforeEach(module('oppia'));

  var htmlUnicodeHtmlPairings = [
    ['abc', 'abc', 'abc'],
    ['&lt;a&copy;&deg;', '<a©°', '&lt;a&#169;&#176;'],
    ['<b>a</b>', 'a', 'a'],
    ['<br>a', 'a', 'a'],
    ['<br/>a', 'a', 'a'],
    ['<br></br>a', 'a', 'a'],
    ['abc  a', 'abc  a', 'abc  a'],
  ];

  it('should convert HTML to and from raw text correctly', inject(function($filter) {
    htmlUnicodeHtmlPairings.forEach(function(pairing) {
      expect($filter('convertHtmlToUnicode')(pairing[0])).toEqual(pairing[1]);
      expect($filter('convertUnicodeToHtml')(pairing[1])).toEqual(pairing[2]);
    });
  }));

  var htmlUnicodeHtmlPairingsWithParams = [
    ['abc <oppia-parameter>name</oppia-parameter>  a', 'abc {{name}}  a', 'abc <oppia-parameter>name</oppia-parameter>  a'],
    ['{{{<oppia-parameter>name</oppia-parameter>', '\\\{\\\{\\\{{{name}}', '{{{<oppia-parameter>name</oppia-parameter>'],
    ['\\{\\{', '\\\\\\{\\\\\\{', '\\{\\{'],
    ['\\}}\\{\\{', '\\\\\\}\\}\\\\\\{\\\\\\{', '\\}}\\{\\{']
  ];

  it('should convert HTML-with-params to and from raw text correctly', inject(function($filter) {
    htmlUnicodeHtmlPairings.forEach(function(pairing) {
      expect($filter('convertHtmlWithParamsToUnicode')(pairing[0])).toEqual(pairing[1]);
      expect($filter('convertUnicodeWithParamsToHtml')(pairing[1])).toEqual(pairing[2]);
    });

    htmlUnicodeHtmlPairingsWithParams.forEach(function(pairing) {
      expect($filter('convertHtmlWithParamsToUnicode')(pairing[0])).toEqual(pairing[1]);
      expect($filter('convertUnicodeWithParamsToHtml')(pairing[1])).toEqual(pairing[2]);
    });
  }));

  var invalidUnicodeStrings = [
    '{}',
    '}}abc{{',
    '\\{{a}}',
    '{{a\\}}',
    '{{a}\\}'
  ];

  it('should detect invalid unicode strings', inject(function($filter) {
    invalidUnicodeStrings.forEach(function(s) {
      var fn = function() {
        return $filter('convertUnicodeWithParamsToHtml')(s);
      };
      expect(fn).toThrow();
    });
  }));
});

describe('Normalizer tests', function() {
  var filterNames = [
    'isFloat',
    'isAtLeast',
    'isAtMost',
    'isNonempty'
  ];

  beforeEach(module('oppia'));

  it('should have the relevant filters', inject(function($filter) {
    angular.forEach(filterNames, function(filterName) {
      expect($filter(filterName)).not.toEqual(null);
    });
  }));

  it('should validate floats correctly', inject(function($filter) {
    var filter = $filter('isFloat');
    expect(filter('1.23')).toEqual(1.23);
    expect(filter('-1.23')).toEqual(-1.23);
    expect(filter('0')).toEqual(0);
    expect(filter('-1')).toEqual(-1);
    expect(filter('-1.0')).toEqual(-1);
    expect(filter('1,5')).toEqual(1.5);

    expect(filter('')).toBeUndefined();
    expect(filter('1.23a')).toBeUndefined();
    expect(filter('abc')).toBeUndefined();
    expect(filter('2+3')).toBeUndefined();
    expect(filter('--1.23')).toBeUndefined();
    expect(filter('=1.23')).toBeUndefined();
  }));

  it('should impose minimum bounds', inject(function($filter) {
    var filter = $filter('isAtLeast');
    var args = {minValue: -2.0};
    expect(filter(1.23, args)).toBe(true);
    expect(filter(-1.23, args)).toBe(true);
    expect(filter(-1.99, args)).toBe(true);
    expect(filter(-2, args)).toBe(true);
    expect(filter(-2.01, args)).toBe(false);
    expect(filter(-3, args)).toBe(false);
  }));

  it('should impose maximum bounds', inject(function($filter) {
    var filter = $filter('isAtMost');
    var args = {maxValue: -2.0};
    expect(filter(-2, args)).toBe(true);
    expect(filter(-2.01, args)).toBe(true);
    expect(filter(-3, args)).toBe(true);
    expect(filter(1.23, args)).toBe(false);
    expect(filter(-1.23, args)).toBe(false);
    expect(filter(-1.99, args)).toBe(false);
  }));

  it('should validate non-emptiness', inject(function($filter) {
    var filter = $filter('isNonempty');
    expect(filter('a')).toBe(true);
    expect(filter('')).toBe(false);
  }));
});
