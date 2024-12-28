"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/fuzzysort/fuzzysort.js
  var require_fuzzysort = __commonJS({
    "node_modules/fuzzysort/fuzzysort.js"(exports, module) {
      ((root, UMD) => {
        if (typeof define === "function" && define.amd) define([], UMD);
        else if (typeof module === "object" && module.exports) module.exports = UMD();
        else root["fuzzysort"] = UMD();
      })(exports, (_2) => {
        "use strict";
        var single = (search, target) => {
          if (!search || !target) return NULL;
          var preparedSearch = getPreparedSearch(search);
          if (!isPrepared(target)) target = getPrepared(target);
          var searchBitflags = preparedSearch.bitflags;
          if ((searchBitflags & target._bitflags) !== searchBitflags) return NULL;
          return algorithm(preparedSearch, target);
        };
        var go = (search, targets, options) => {
          if (!search) return options?.all ? all(targets, options) : noResults;
          var preparedSearch = getPreparedSearch(search);
          var searchBitflags = preparedSearch.bitflags;
          var containsSpace = preparedSearch.containsSpace;
          var threshold = denormalizeScore(options?.threshold || 0);
          var limit = options?.limit || INFINITY;
          var resultsLen = 0;
          var limitedCount = 0;
          var targetsLen = targets.length;
          function push_result(result2) {
            if (resultsLen < limit) {
              q.add(result2);
              ++resultsLen;
            } else {
              ++limitedCount;
              if (result2._score > q.peek()._score) q.replaceTop(result2);
            }
          }
          if (options?.key) {
            var key = options.key;
            for (var i2 = 0; i2 < targetsLen; ++i2) {
              var obj = targets[i2];
              var target = getValue(obj, key);
              if (!target) continue;
              if (!isPrepared(target)) target = getPrepared(target);
              if ((searchBitflags & target._bitflags) !== searchBitflags) continue;
              var result = algorithm(preparedSearch, target);
              if (result === NULL) continue;
              if (result._score < threshold) continue;
              result.obj = obj;
              push_result(result);
            }
          } else if (options?.keys) {
            var keys = options.keys;
            var keysLen = keys.length;
            outer: for (var i2 = 0; i2 < targetsLen; ++i2) {
              var obj = targets[i2];
              {
                var keysBitflags = 0;
                for (var keyI = 0; keyI < keysLen; ++keyI) {
                  var key = keys[keyI];
                  var target = getValue(obj, key);
                  if (!target) {
                    tmpTargets[keyI] = noTarget;
                    continue;
                  }
                  if (!isPrepared(target)) target = getPrepared(target);
                  tmpTargets[keyI] = target;
                  keysBitflags |= target._bitflags;
                }
                if ((searchBitflags & keysBitflags) !== searchBitflags) continue;
              }
              if (containsSpace) for (let i3 = 0; i3 < preparedSearch.spaceSearches.length; i3++) keysSpacesBestScores[i3] = NEGATIVE_INFINITY;
              for (var keyI = 0; keyI < keysLen; ++keyI) {
                target = tmpTargets[keyI];
                if (target === noTarget) {
                  tmpResults[keyI] = noTarget;
                  continue;
                }
                tmpResults[keyI] = algorithm(
                  preparedSearch,
                  target,
                  /*allowSpaces=*/
                  false,
                  /*allowPartialMatch=*/
                  containsSpace
                );
                if (tmpResults[keyI] === NULL) {
                  tmpResults[keyI] = noTarget;
                  continue;
                }
                if (containsSpace) for (let i3 = 0; i3 < preparedSearch.spaceSearches.length; i3++) {
                  if (allowPartialMatchScores[i3] > -1e3) {
                    if (keysSpacesBestScores[i3] > NEGATIVE_INFINITY) {
                      var tmp = (keysSpacesBestScores[i3] + allowPartialMatchScores[i3]) / 4;
                      if (tmp > keysSpacesBestScores[i3]) keysSpacesBestScores[i3] = tmp;
                    }
                  }
                  if (allowPartialMatchScores[i3] > keysSpacesBestScores[i3]) keysSpacesBestScores[i3] = allowPartialMatchScores[i3];
                }
              }
              if (containsSpace) {
                for (let i3 = 0; i3 < preparedSearch.spaceSearches.length; i3++) {
                  if (keysSpacesBestScores[i3] === NEGATIVE_INFINITY) continue outer;
                }
              } else {
                var hasAtLeast1Match = false;
                for (let i3 = 0; i3 < keysLen; i3++) {
                  if (tmpResults[i3]._score !== NEGATIVE_INFINITY) {
                    hasAtLeast1Match = true;
                    break;
                  }
                }
                if (!hasAtLeast1Match) continue;
              }
              var objResults = new KeysResult(keysLen);
              for (let i3 = 0; i3 < keysLen; i3++) {
                objResults[i3] = tmpResults[i3];
              }
              if (containsSpace) {
                var score = 0;
                for (let i3 = 0; i3 < preparedSearch.spaceSearches.length; i3++) score += keysSpacesBestScores[i3];
              } else {
                var score = NEGATIVE_INFINITY;
                for (let i3 = 0; i3 < keysLen; i3++) {
                  var result = objResults[i3];
                  if (result._score > -1e3) {
                    if (score > NEGATIVE_INFINITY) {
                      var tmp = (score + result._score) / 4;
                      if (tmp > score) score = tmp;
                    }
                  }
                  if (result._score > score) score = result._score;
                }
              }
              objResults.obj = obj;
              objResults._score = score;
              if (options?.scoreFn) {
                score = options.scoreFn(objResults);
                if (!score) continue;
                score = denormalizeScore(score);
                objResults._score = score;
              }
              if (score < threshold) continue;
              push_result(objResults);
            }
          } else {
            for (var i2 = 0; i2 < targetsLen; ++i2) {
              var target = targets[i2];
              if (!target) continue;
              if (!isPrepared(target)) target = getPrepared(target);
              if ((searchBitflags & target._bitflags) !== searchBitflags) continue;
              var result = algorithm(preparedSearch, target);
              if (result === NULL) continue;
              if (result._score < threshold) continue;
              push_result(result);
            }
          }
          if (resultsLen === 0) return noResults;
          var results = new Array(resultsLen);
          for (var i2 = resultsLen - 1; i2 >= 0; --i2) results[i2] = q.poll();
          results.total = resultsLen + limitedCount;
          return results;
        };
        var highlight2 = (result, open = "<b>", close = "</b>") => {
          var callback = typeof open === "function" ? open : void 0;
          var target = result.target;
          var targetLen = target.length;
          var indexes = result.indexes;
          var highlighted = "";
          var matchI = 0;
          var indexesI = 0;
          var opened = false;
          var parts2 = [];
          for (var i2 = 0; i2 < targetLen; ++i2) {
            var char = target[i2];
            if (indexes[indexesI] === i2) {
              ++indexesI;
              if (!opened) {
                opened = true;
                if (callback) {
                  parts2.push(highlighted);
                  highlighted = "";
                } else {
                  highlighted += open;
                }
              }
              if (indexesI === indexes.length) {
                if (callback) {
                  highlighted += char;
                  parts2.push(callback(highlighted, matchI++));
                  highlighted = "";
                  parts2.push(target.substr(i2 + 1));
                } else {
                  highlighted += char + close + target.substr(i2 + 1);
                }
                break;
              }
            } else {
              if (opened) {
                opened = false;
                if (callback) {
                  parts2.push(callback(highlighted, matchI++));
                  highlighted = "";
                } else {
                  highlighted += close;
                }
              }
            }
            highlighted += char;
          }
          return callback ? parts2 : highlighted;
        };
        var prepare = (target) => {
          if (typeof target === "number") target = "" + target;
          else if (typeof target !== "string") target = "";
          var info = prepareLowerInfo(target);
          return new_result(target, { _targetLower: info._lower, _targetLowerCodes: info.lowerCodes, _bitflags: info.bitflags });
        };
        var cleanup = () => {
          preparedCache.clear();
          preparedSearchCache.clear();
        };
        class Result21 {
          get ["indexes"]() {
            return this._indexes.slice(0, this._indexes.len).sort((a2, b2) => a2 - b2);
          }
          set ["indexes"](indexes) {
            return this._indexes = indexes;
          }
          ["highlight"](open, close) {
            return highlight2(this, open, close);
          }
          get ["score"]() {
            return normalizeScore(this._score);
          }
          set ["score"](score) {
            this._score = denormalizeScore(score);
          }
        }
        class KeysResult extends Array {
          get ["score"]() {
            return normalizeScore(this._score);
          }
          set ["score"](score) {
            this._score = denormalizeScore(score);
          }
        }
        var new_result = (target, options) => {
          const result = new Result21();
          result["target"] = target;
          result["obj"] = options.obj ?? NULL;
          result._score = options._score ?? NEGATIVE_INFINITY;
          result._indexes = options._indexes ?? [];
          result._targetLower = options._targetLower ?? "";
          result._targetLowerCodes = options._targetLowerCodes ?? NULL;
          result._nextBeginningIndexes = options._nextBeginningIndexes ?? NULL;
          result._bitflags = options._bitflags ?? 0;
          return result;
        };
        var normalizeScore = (score) => {
          if (score === NEGATIVE_INFINITY) return 0;
          if (score > 1) return score;
          return Math.E ** (((-score + 1) ** 0.04307 - 1) * -2);
        };
        var denormalizeScore = (normalizedScore) => {
          if (normalizedScore === 0) return NEGATIVE_INFINITY;
          if (normalizedScore > 1) return normalizedScore;
          return 1 - Math.pow(Math.log(normalizedScore) / -2 + 1, 1 / 0.04307);
        };
        var prepareSearch = (search) => {
          if (typeof search === "number") search = "" + search;
          else if (typeof search !== "string") search = "";
          search = search.trim();
          var info = prepareLowerInfo(search);
          var spaceSearches = [];
          if (info.containsSpace) {
            var searches = search.split(/\s+/);
            searches = [...new Set(searches)];
            for (var i2 = 0; i2 < searches.length; i2++) {
              if (searches[i2] === "") continue;
              var _info = prepareLowerInfo(searches[i2]);
              spaceSearches.push({ lowerCodes: _info.lowerCodes, _lower: searches[i2].toLowerCase(), containsSpace: false });
            }
          }
          return { lowerCodes: info.lowerCodes, _lower: info._lower, containsSpace: info.containsSpace, bitflags: info.bitflags, spaceSearches };
        };
        var getPrepared = (target) => {
          if (target.length > 999) return prepare(target);
          var targetPrepared = preparedCache.get(target);
          if (targetPrepared !== void 0) return targetPrepared;
          targetPrepared = prepare(target);
          preparedCache.set(target, targetPrepared);
          return targetPrepared;
        };
        var getPreparedSearch = (search) => {
          if (search.length > 999) return prepareSearch(search);
          var searchPrepared = preparedSearchCache.get(search);
          if (searchPrepared !== void 0) return searchPrepared;
          searchPrepared = prepareSearch(search);
          preparedSearchCache.set(search, searchPrepared);
          return searchPrepared;
        };
        var all = (targets, options) => {
          var results = [];
          results.total = targets.length;
          var limit = options?.limit || INFINITY;
          if (options?.key) {
            for (var i2 = 0; i2 < targets.length; i2++) {
              var obj = targets[i2];
              var target = getValue(obj, options.key);
              if (target == NULL) continue;
              if (!isPrepared(target)) target = getPrepared(target);
              var result = new_result(target.target, { _score: target._score, obj });
              results.push(result);
              if (results.length >= limit) return results;
            }
          } else if (options?.keys) {
            for (var i2 = 0; i2 < targets.length; i2++) {
              var obj = targets[i2];
              var objResults = new KeysResult(options.keys.length);
              for (var keyI = options.keys.length - 1; keyI >= 0; --keyI) {
                var target = getValue(obj, options.keys[keyI]);
                if (!target) {
                  objResults[keyI] = noTarget;
                  continue;
                }
                if (!isPrepared(target)) target = getPrepared(target);
                target._score = NEGATIVE_INFINITY;
                target._indexes.len = 0;
                objResults[keyI] = target;
              }
              objResults.obj = obj;
              objResults._score = NEGATIVE_INFINITY;
              results.push(objResults);
              if (results.length >= limit) return results;
            }
          } else {
            for (var i2 = 0; i2 < targets.length; i2++) {
              var target = targets[i2];
              if (target == NULL) continue;
              if (!isPrepared(target)) target = getPrepared(target);
              target._score = NEGATIVE_INFINITY;
              target._indexes.len = 0;
              results.push(target);
              if (results.length >= limit) return results;
            }
          }
          return results;
        };
        var algorithm = (preparedSearch, prepared, allowSpaces = false, allowPartialMatch = false) => {
          if (allowSpaces === false && preparedSearch.containsSpace) return algorithmSpaces(preparedSearch, prepared, allowPartialMatch);
          var searchLower = preparedSearch._lower;
          var searchLowerCodes = preparedSearch.lowerCodes;
          var searchLowerCode = searchLowerCodes[0];
          var targetLowerCodes = prepared._targetLowerCodes;
          var searchLen = searchLowerCodes.length;
          var targetLen = targetLowerCodes.length;
          var searchI = 0;
          var targetI = 0;
          var matchesSimpleLen = 0;
          for (; ; ) {
            var isMatch = searchLowerCode === targetLowerCodes[targetI];
            if (isMatch) {
              matchesSimple[matchesSimpleLen++] = targetI;
              ++searchI;
              if (searchI === searchLen) break;
              searchLowerCode = searchLowerCodes[searchI];
            }
            ++targetI;
            if (targetI >= targetLen) return NULL;
          }
          var searchI = 0;
          var successStrict = false;
          var matchesStrictLen = 0;
          var nextBeginningIndexes = prepared._nextBeginningIndexes;
          if (nextBeginningIndexes === NULL) nextBeginningIndexes = prepared._nextBeginningIndexes = prepareNextBeginningIndexes(prepared.target);
          targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1];
          var backtrackCount = 0;
          if (targetI !== targetLen) for (; ; ) {
            if (targetI >= targetLen) {
              if (searchI <= 0) break;
              ++backtrackCount;
              if (backtrackCount > 200) break;
              --searchI;
              var lastMatch = matchesStrict[--matchesStrictLen];
              targetI = nextBeginningIndexes[lastMatch];
            } else {
              var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI];
              if (isMatch) {
                matchesStrict[matchesStrictLen++] = targetI;
                ++searchI;
                if (searchI === searchLen) {
                  successStrict = true;
                  break;
                }
                ++targetI;
              } else {
                targetI = nextBeginningIndexes[targetI];
              }
            }
          }
          var substringIndex = searchLen <= 1 ? -1 : prepared._targetLower.indexOf(searchLower, matchesSimple[0]);
          var isSubstring = !!~substringIndex;
          var isSubstringBeginning = !isSubstring ? false : substringIndex === 0 || prepared._nextBeginningIndexes[substringIndex - 1] === substringIndex;
          if (isSubstring && !isSubstringBeginning) {
            for (var i2 = 0; i2 < nextBeginningIndexes.length; i2 = nextBeginningIndexes[i2]) {
              if (i2 <= substringIndex) continue;
              for (var s2 = 0; s2 < searchLen; s2++) if (searchLowerCodes[s2] !== prepared._targetLowerCodes[i2 + s2]) break;
              if (s2 === searchLen) {
                substringIndex = i2;
                isSubstringBeginning = true;
                break;
              }
            }
          }
          var calculateScore = (matches) => {
            var score2 = 0;
            var extraMatchGroupCount = 0;
            for (var i3 = 1; i3 < searchLen; ++i3) {
              if (matches[i3] - matches[i3 - 1] !== 1) {
                score2 -= matches[i3];
                ++extraMatchGroupCount;
              }
            }
            var unmatchedDistance = matches[searchLen - 1] - matches[0] - (searchLen - 1);
            score2 -= (12 + unmatchedDistance) * extraMatchGroupCount;
            if (matches[0] !== 0) score2 -= matches[0] * matches[0] * 0.2;
            if (!successStrict) {
              score2 *= 1e3;
            } else {
              var uniqueBeginningIndexes = 1;
              for (var i3 = nextBeginningIndexes[0]; i3 < targetLen; i3 = nextBeginningIndexes[i3]) ++uniqueBeginningIndexes;
              if (uniqueBeginningIndexes > 24) score2 *= (uniqueBeginningIndexes - 24) * 10;
            }
            score2 -= (targetLen - searchLen) / 2;
            if (isSubstring) score2 /= 1 + searchLen * searchLen * 1;
            if (isSubstringBeginning) score2 /= 1 + searchLen * searchLen * 1;
            score2 -= (targetLen - searchLen) / 2;
            return score2;
          };
          if (!successStrict) {
            if (isSubstring) for (var i2 = 0; i2 < searchLen; ++i2) matchesSimple[i2] = substringIndex + i2;
            var matchesBest = matchesSimple;
            var score = calculateScore(matchesBest);
          } else {
            if (isSubstringBeginning) {
              for (var i2 = 0; i2 < searchLen; ++i2) matchesSimple[i2] = substringIndex + i2;
              var matchesBest = matchesSimple;
              var score = calculateScore(matchesSimple);
            } else {
              var matchesBest = matchesStrict;
              var score = calculateScore(matchesStrict);
            }
          }
          prepared._score = score;
          for (var i2 = 0; i2 < searchLen; ++i2) prepared._indexes[i2] = matchesBest[i2];
          prepared._indexes.len = searchLen;
          const result = new Result21();
          result.target = prepared.target;
          result._score = prepared._score;
          result._indexes = prepared._indexes;
          return result;
        };
        var algorithmSpaces = (preparedSearch, target, allowPartialMatch) => {
          var seen_indexes = /* @__PURE__ */ new Set();
          var score = 0;
          var result = NULL;
          var first_seen_index_last_search = 0;
          var searches = preparedSearch.spaceSearches;
          var searchesLen = searches.length;
          var changeslen = 0;
          var resetNextBeginningIndexes = () => {
            for (let i3 = changeslen - 1; i3 >= 0; i3--) target._nextBeginningIndexes[nextBeginningIndexesChanges[i3 * 2 + 0]] = nextBeginningIndexesChanges[i3 * 2 + 1];
          };
          var hasAtLeast1Match = false;
          for (var i2 = 0; i2 < searchesLen; ++i2) {
            allowPartialMatchScores[i2] = NEGATIVE_INFINITY;
            var search = searches[i2];
            result = algorithm(search, target);
            if (allowPartialMatch) {
              if (result === NULL) continue;
              hasAtLeast1Match = true;
            } else {
              if (result === NULL) {
                resetNextBeginningIndexes();
                return NULL;
              }
            }
            var isTheLastSearch = i2 === searchesLen - 1;
            if (!isTheLastSearch) {
              var indexes = result._indexes;
              var indexesIsConsecutiveSubstring = true;
              for (let i3 = 0; i3 < indexes.len - 1; i3++) {
                if (indexes[i3 + 1] - indexes[i3] !== 1) {
                  indexesIsConsecutiveSubstring = false;
                  break;
                }
              }
              if (indexesIsConsecutiveSubstring) {
                var newBeginningIndex = indexes[indexes.len - 1] + 1;
                var toReplace = target._nextBeginningIndexes[newBeginningIndex - 1];
                for (let i3 = newBeginningIndex - 1; i3 >= 0; i3--) {
                  if (toReplace !== target._nextBeginningIndexes[i3]) break;
                  target._nextBeginningIndexes[i3] = newBeginningIndex;
                  nextBeginningIndexesChanges[changeslen * 2 + 0] = i3;
                  nextBeginningIndexesChanges[changeslen * 2 + 1] = toReplace;
                  changeslen++;
                }
              }
            }
            score += result._score / searchesLen;
            allowPartialMatchScores[i2] = result._score / searchesLen;
            if (result._indexes[0] < first_seen_index_last_search) {
              score -= (first_seen_index_last_search - result._indexes[0]) * 2;
            }
            first_seen_index_last_search = result._indexes[0];
            for (var j2 = 0; j2 < result._indexes.len; ++j2) seen_indexes.add(result._indexes[j2]);
          }
          if (allowPartialMatch && !hasAtLeast1Match) return NULL;
          resetNextBeginningIndexes();
          var allowSpacesResult = algorithm(
            preparedSearch,
            target,
            /*allowSpaces=*/
            true
          );
          if (allowSpacesResult !== NULL && allowSpacesResult._score > score) {
            if (allowPartialMatch) {
              for (var i2 = 0; i2 < searchesLen; ++i2) {
                allowPartialMatchScores[i2] = allowSpacesResult._score / searchesLen;
              }
            }
            return allowSpacesResult;
          }
          if (allowPartialMatch) result = target;
          result._score = score;
          var i2 = 0;
          for (let index of seen_indexes) result._indexes[i2++] = index;
          result._indexes.len = i2;
          return result;
        };
        var remove_accents = (str) => str.replace(/\p{Script=Latin}+/gu, (match) => match.normalize("NFD")).replace(/[\u0300-\u036f]/g, "");
        var prepareLowerInfo = (str) => {
          str = remove_accents(str);
          var strLen = str.length;
          var lower = str.toLowerCase();
          var lowerCodes = [];
          var bitflags = 0;
          var containsSpace = false;
          for (var i2 = 0; i2 < strLen; ++i2) {
            var lowerCode = lowerCodes[i2] = lower.charCodeAt(i2);
            if (lowerCode === 32) {
              containsSpace = true;
              continue;
            }
            var bit = lowerCode >= 97 && lowerCode <= 122 ? lowerCode - 97 : lowerCode >= 48 && lowerCode <= 57 ? 26 : lowerCode <= 127 ? 30 : 31;
            bitflags |= 1 << bit;
          }
          return { lowerCodes, bitflags, containsSpace, _lower: lower };
        };
        var prepareBeginningIndexes = (target) => {
          var targetLen = target.length;
          var beginningIndexes = [];
          var beginningIndexesLen = 0;
          var wasUpper = false;
          var wasAlphanum = false;
          for (var i2 = 0; i2 < targetLen; ++i2) {
            var targetCode = target.charCodeAt(i2);
            var isUpper = targetCode >= 65 && targetCode <= 90;
            var isAlphanum = isUpper || targetCode >= 97 && targetCode <= 122 || targetCode >= 48 && targetCode <= 57;
            var isBeginning = isUpper && !wasUpper || !wasAlphanum || !isAlphanum;
            wasUpper = isUpper;
            wasAlphanum = isAlphanum;
            if (isBeginning) beginningIndexes[beginningIndexesLen++] = i2;
          }
          return beginningIndexes;
        };
        var prepareNextBeginningIndexes = (target) => {
          target = remove_accents(target);
          var targetLen = target.length;
          var beginningIndexes = prepareBeginningIndexes(target);
          var nextBeginningIndexes = [];
          var lastIsBeginning = beginningIndexes[0];
          var lastIsBeginningI = 0;
          for (var i2 = 0; i2 < targetLen; ++i2) {
            if (lastIsBeginning > i2) {
              nextBeginningIndexes[i2] = lastIsBeginning;
            } else {
              lastIsBeginning = beginningIndexes[++lastIsBeginningI];
              nextBeginningIndexes[i2] = lastIsBeginning === void 0 ? targetLen : lastIsBeginning;
            }
          }
          return nextBeginningIndexes;
        };
        var preparedCache = /* @__PURE__ */ new Map();
        var preparedSearchCache = /* @__PURE__ */ new Map();
        var matchesSimple = [];
        var matchesStrict = [];
        var nextBeginningIndexesChanges = [];
        var keysSpacesBestScores = [];
        var allowPartialMatchScores = [];
        var tmpTargets = [];
        var tmpResults = [];
        var getValue = (obj, prop) => {
          var tmp = obj[prop];
          if (tmp !== void 0) return tmp;
          if (typeof prop === "function") return prop(obj);
          var segs = prop;
          if (!Array.isArray(prop)) segs = prop.split(".");
          var len = segs.length;
          var i2 = -1;
          while (obj && ++i2 < len) obj = obj[segs[i2]];
          return obj;
        };
        var isPrepared = (x2) => {
          return typeof x2 === "object" && typeof x2._bitflags === "number";
        };
        var INFINITY = Infinity;
        var NEGATIVE_INFINITY = -INFINITY;
        var noResults = [];
        noResults.total = 0;
        var NULL = null;
        var noTarget = prepare("");
        var fastpriorityqueue = (r2) => {
          var e2 = [], o2 = 0, a2 = {}, v2 = (r3) => {
            for (var a3 = 0, v3 = e2[a3], c2 = 1; c2 < o2; ) {
              var s2 = c2 + 1;
              a3 = c2, s2 < o2 && e2[s2]._score < e2[c2]._score && (a3 = s2), e2[a3 - 1 >> 1] = e2[a3], c2 = 1 + (a3 << 1);
            }
            for (var f2 = a3 - 1 >> 1; a3 > 0 && v3._score < e2[f2]._score; f2 = (a3 = f2) - 1 >> 1) e2[a3] = e2[f2];
            e2[a3] = v3;
          };
          return a2.add = (r3) => {
            var a3 = o2;
            e2[o2++] = r3;
            for (var v3 = a3 - 1 >> 1; a3 > 0 && r3._score < e2[v3]._score; v3 = (a3 = v3) - 1 >> 1) e2[a3] = e2[v3];
            e2[a3] = r3;
          }, a2.poll = (r3) => {
            if (0 !== o2) {
              var a3 = e2[0];
              return e2[0] = e2[--o2], v2(), a3;
            }
          }, a2.peek = (r3) => {
            if (0 !== o2) return e2[0];
          }, a2.replaceTop = (r3) => {
            e2[0] = r3, v2();
          }, a2;
        };
        var q = fastpriorityqueue();
        return { "single": single, "go": go, "prepare": prepare, "cleanup": cleanup };
      });
    }
  });

  // node_modules/lit-html/lit-html.js
  var t = globalThis;
  var i = t.trustedTypes;
  var s = i ? i.createPolicy("lit-html", { createHTML: (t2) => t2 }) : void 0;
  var e = "$lit$";
  var h = `lit$${Math.random().toFixed(9).slice(2)}$`;
  var o = "?" + h;
  var n = `<${o}>`;
  var r = document;
  var l = () => r.createComment("");
  var c = (t2) => null === t2 || "object" != typeof t2 && "function" != typeof t2;
  var a = Array.isArray;
  var u = (t2) => a(t2) || "function" == typeof t2?.[Symbol.iterator];
  var d = "[ 	\n\f\r]";
  var f = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
  var v = /-->/g;
  var _ = />/g;
  var m = RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
  var p = /'/g;
  var g = /"/g;
  var $ = /^(?:script|style|textarea|title)$/i;
  var y = (t2) => (i2, ...s2) => ({ _$litType$: t2, strings: i2, values: s2 });
  var x = y(1);
  var b = y(2);
  var w = y(3);
  var T = Symbol.for("lit-noChange");
  var E = Symbol.for("lit-nothing");
  var A = /* @__PURE__ */ new WeakMap();
  var C = r.createTreeWalker(r, 129);
  function P(t2, i2) {
    if (!a(t2) || !t2.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== s ? s.createHTML(i2) : i2;
  }
  var V = (t2, i2) => {
    const s2 = t2.length - 1, o2 = [];
    let r2, l2 = 2 === i2 ? "<svg>" : 3 === i2 ? "<math>" : "", c2 = f;
    for (let i3 = 0; i3 < s2; i3++) {
      const s3 = t2[i3];
      let a2, u2, d2 = -1, y2 = 0;
      for (; y2 < s3.length && (c2.lastIndex = y2, u2 = c2.exec(s3), null !== u2); ) y2 = c2.lastIndex, c2 === f ? "!--" === u2[1] ? c2 = v : void 0 !== u2[1] ? c2 = _ : void 0 !== u2[2] ? ($.test(u2[2]) && (r2 = RegExp("</" + u2[2], "g")), c2 = m) : void 0 !== u2[3] && (c2 = m) : c2 === m ? ">" === u2[0] ? (c2 = r2 ?? f, d2 = -1) : void 0 === u2[1] ? d2 = -2 : (d2 = c2.lastIndex - u2[2].length, a2 = u2[1], c2 = void 0 === u2[3] ? m : '"' === u2[3] ? g : p) : c2 === g || c2 === p ? c2 = m : c2 === v || c2 === _ ? c2 = f : (c2 = m, r2 = void 0);
      const x2 = c2 === m && t2[i3 + 1].startsWith("/>") ? " " : "";
      l2 += c2 === f ? s3 + n : d2 >= 0 ? (o2.push(a2), s3.slice(0, d2) + e + s3.slice(d2) + h + x2) : s3 + h + (-2 === d2 ? i3 : x2);
    }
    return [P(t2, l2 + (t2[s2] || "<?>") + (2 === i2 ? "</svg>" : 3 === i2 ? "</math>" : "")), o2];
  };
  var N = class _N {
    constructor({ strings: t2, _$litType$: s2 }, n2) {
      let r2;
      this.parts = [];
      let c2 = 0, a2 = 0;
      const u2 = t2.length - 1, d2 = this.parts, [f2, v2] = V(t2, s2);
      if (this.el = _N.createElement(f2, n2), C.currentNode = this.el.content, 2 === s2 || 3 === s2) {
        const t3 = this.el.content.firstChild;
        t3.replaceWith(...t3.childNodes);
      }
      for (; null !== (r2 = C.nextNode()) && d2.length < u2; ) {
        if (1 === r2.nodeType) {
          if (r2.hasAttributes()) for (const t3 of r2.getAttributeNames()) if (t3.endsWith(e)) {
            const i2 = v2[a2++], s3 = r2.getAttribute(t3).split(h), e2 = /([.?@])?(.*)/.exec(i2);
            d2.push({ type: 1, index: c2, name: e2[2], strings: s3, ctor: "." === e2[1] ? H : "?" === e2[1] ? I : "@" === e2[1] ? L : k }), r2.removeAttribute(t3);
          } else t3.startsWith(h) && (d2.push({ type: 6, index: c2 }), r2.removeAttribute(t3));
          if ($.test(r2.tagName)) {
            const t3 = r2.textContent.split(h), s3 = t3.length - 1;
            if (s3 > 0) {
              r2.textContent = i ? i.emptyScript : "";
              for (let i2 = 0; i2 < s3; i2++) r2.append(t3[i2], l()), C.nextNode(), d2.push({ type: 2, index: ++c2 });
              r2.append(t3[s3], l());
            }
          }
        } else if (8 === r2.nodeType) if (r2.data === o) d2.push({ type: 2, index: c2 });
        else {
          let t3 = -1;
          for (; -1 !== (t3 = r2.data.indexOf(h, t3 + 1)); ) d2.push({ type: 7, index: c2 }), t3 += h.length - 1;
        }
        c2++;
      }
    }
    static createElement(t2, i2) {
      const s2 = r.createElement("template");
      return s2.innerHTML = t2, s2;
    }
  };
  function S(t2, i2, s2 = t2, e2) {
    if (i2 === T) return i2;
    let h2 = void 0 !== e2 ? s2._$Co?.[e2] : s2._$Cl;
    const o2 = c(i2) ? void 0 : i2._$litDirective$;
    return h2?.constructor !== o2 && (h2?._$AO?.(false), void 0 === o2 ? h2 = void 0 : (h2 = new o2(t2), h2._$AT(t2, s2, e2)), void 0 !== e2 ? (s2._$Co ??= [])[e2] = h2 : s2._$Cl = h2), void 0 !== h2 && (i2 = S(t2, h2._$AS(t2, i2.values), h2, e2)), i2;
  }
  var M = class {
    constructor(t2, i2) {
      this._$AV = [], this._$AN = void 0, this._$AD = t2, this._$AM = i2;
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    u(t2) {
      const { el: { content: i2 }, parts: s2 } = this._$AD, e2 = (t2?.creationScope ?? r).importNode(i2, true);
      C.currentNode = e2;
      let h2 = C.nextNode(), o2 = 0, n2 = 0, l2 = s2[0];
      for (; void 0 !== l2; ) {
        if (o2 === l2.index) {
          let i3;
          2 === l2.type ? i3 = new R(h2, h2.nextSibling, this, t2) : 1 === l2.type ? i3 = new l2.ctor(h2, l2.name, l2.strings, this, t2) : 6 === l2.type && (i3 = new z(h2, this, t2)), this._$AV.push(i3), l2 = s2[++n2];
        }
        o2 !== l2?.index && (h2 = C.nextNode(), o2++);
      }
      return C.currentNode = r, e2;
    }
    p(t2) {
      let i2 = 0;
      for (const s2 of this._$AV) void 0 !== s2 && (void 0 !== s2.strings ? (s2._$AI(t2, s2, i2), i2 += s2.strings.length - 2) : s2._$AI(t2[i2])), i2++;
    }
  };
  var R = class _R {
    get _$AU() {
      return this._$AM?._$AU ?? this._$Cv;
    }
    constructor(t2, i2, s2, e2) {
      this.type = 2, this._$AH = E, this._$AN = void 0, this._$AA = t2, this._$AB = i2, this._$AM = s2, this.options = e2, this._$Cv = e2?.isConnected ?? true;
    }
    get parentNode() {
      let t2 = this._$AA.parentNode;
      const i2 = this._$AM;
      return void 0 !== i2 && 11 === t2?.nodeType && (t2 = i2.parentNode), t2;
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(t2, i2 = this) {
      t2 = S(this, t2, i2), c(t2) ? t2 === E || null == t2 || "" === t2 ? (this._$AH !== E && this._$AR(), this._$AH = E) : t2 !== this._$AH && t2 !== T && this._(t2) : void 0 !== t2._$litType$ ? this.$(t2) : void 0 !== t2.nodeType ? this.T(t2) : u(t2) ? this.k(t2) : this._(t2);
    }
    O(t2) {
      return this._$AA.parentNode.insertBefore(t2, this._$AB);
    }
    T(t2) {
      this._$AH !== t2 && (this._$AR(), this._$AH = this.O(t2));
    }
    _(t2) {
      this._$AH !== E && c(this._$AH) ? this._$AA.nextSibling.data = t2 : this.T(r.createTextNode(t2)), this._$AH = t2;
    }
    $(t2) {
      const { values: i2, _$litType$: s2 } = t2, e2 = "number" == typeof s2 ? this._$AC(t2) : (void 0 === s2.el && (s2.el = N.createElement(P(s2.h, s2.h[0]), this.options)), s2);
      if (this._$AH?._$AD === e2) this._$AH.p(i2);
      else {
        const t3 = new M(e2, this), s3 = t3.u(this.options);
        t3.p(i2), this.T(s3), this._$AH = t3;
      }
    }
    _$AC(t2) {
      let i2 = A.get(t2.strings);
      return void 0 === i2 && A.set(t2.strings, i2 = new N(t2)), i2;
    }
    k(t2) {
      a(this._$AH) || (this._$AH = [], this._$AR());
      const i2 = this._$AH;
      let s2, e2 = 0;
      for (const h2 of t2) e2 === i2.length ? i2.push(s2 = new _R(this.O(l()), this.O(l()), this, this.options)) : s2 = i2[e2], s2._$AI(h2), e2++;
      e2 < i2.length && (this._$AR(s2 && s2._$AB.nextSibling, e2), i2.length = e2);
    }
    _$AR(t2 = this._$AA.nextSibling, i2) {
      for (this._$AP?.(false, true, i2); t2 && t2 !== this._$AB; ) {
        const i3 = t2.nextSibling;
        t2.remove(), t2 = i3;
      }
    }
    setConnected(t2) {
      void 0 === this._$AM && (this._$Cv = t2, this._$AP?.(t2));
    }
  };
  var k = class {
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    constructor(t2, i2, s2, e2, h2) {
      this.type = 1, this._$AH = E, this._$AN = void 0, this.element = t2, this.name = i2, this._$AM = e2, this.options = h2, s2.length > 2 || "" !== s2[0] || "" !== s2[1] ? (this._$AH = Array(s2.length - 1).fill(new String()), this.strings = s2) : this._$AH = E;
    }
    _$AI(t2, i2 = this, s2, e2) {
      const h2 = this.strings;
      let o2 = false;
      if (void 0 === h2) t2 = S(this, t2, i2, 0), o2 = !c(t2) || t2 !== this._$AH && t2 !== T, o2 && (this._$AH = t2);
      else {
        const e3 = t2;
        let n2, r2;
        for (t2 = h2[0], n2 = 0; n2 < h2.length - 1; n2++) r2 = S(this, e3[s2 + n2], i2, n2), r2 === T && (r2 = this._$AH[n2]), o2 ||= !c(r2) || r2 !== this._$AH[n2], r2 === E ? t2 = E : t2 !== E && (t2 += (r2 ?? "") + h2[n2 + 1]), this._$AH[n2] = r2;
      }
      o2 && !e2 && this.j(t2);
    }
    j(t2) {
      t2 === E ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t2 ?? "");
    }
  };
  var H = class extends k {
    constructor() {
      super(...arguments), this.type = 3;
    }
    j(t2) {
      this.element[this.name] = t2 === E ? void 0 : t2;
    }
  };
  var I = class extends k {
    constructor() {
      super(...arguments), this.type = 4;
    }
    j(t2) {
      this.element.toggleAttribute(this.name, !!t2 && t2 !== E);
    }
  };
  var L = class extends k {
    constructor(t2, i2, s2, e2, h2) {
      super(t2, i2, s2, e2, h2), this.type = 5;
    }
    _$AI(t2, i2 = this) {
      if ((t2 = S(this, t2, i2, 0) ?? E) === T) return;
      const s2 = this._$AH, e2 = t2 === E && s2 !== E || t2.capture !== s2.capture || t2.once !== s2.once || t2.passive !== s2.passive, h2 = t2 !== E && (s2 === E || e2);
      e2 && this.element.removeEventListener(this.name, this, s2), h2 && this.element.addEventListener(this.name, this, t2), this._$AH = t2;
    }
    handleEvent(t2) {
      "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t2) : this._$AH.handleEvent(t2);
    }
  };
  var z = class {
    constructor(t2, i2, s2) {
      this.element = t2, this.type = 6, this._$AN = void 0, this._$AM = i2, this.options = s2;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t2) {
      S(this, t2);
    }
  };
  var j = t.litHtmlPolyfillSupport;
  j?.(N, R), (t.litHtmlVersions ??= []).push("3.2.1");
  var B = (t2, i2, s2) => {
    const e2 = s2?.renderBefore ?? i2;
    let h2 = e2._$litPart$;
    if (void 0 === h2) {
      const t3 = s2?.renderBefore ?? null;
      e2._$litPart$ = h2 = new R(i2.insertBefore(l(), t3), t3, void 0, s2 ?? {});
    }
    return h2._$AI(t2), h2;
  };

  // src/result.ts
  function ok(value) {
    return { ok: true, value };
  }
  function error(value) {
    if (typeof value === "string") {
      return { ok: false, error: new Error(value) };
    }
    return { ok: false, error: value };
  }

  // src/action/action.ts
  var NOOPAction = class _NOOPAction {
    description = "Does nothing";
    postActionWork = "";
    undo = false;
    async do(explanMain2) {
      return ok(new _NOOPAction());
    }
  };
  var ActionFromOp = class _ActionFromOp {
    name = "ActionFromOp";
    description = "Action constructed directly from an Op.";
    postActionWork;
    undo;
    op;
    constructor(op, postActionWork, undo2) {
      this.postActionWork = postActionWork;
      this.undo = undo2;
      this.op = op;
    }
    async do(explanMain2) {
      const ret = this.op.applyTo(explanMain2.plan);
      if (!ret.ok) {
        return ret;
      }
      return ok(
        new _ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
      );
    }
  };

  // src/dag/dag.ts
  var DirectedEdge = class {
    i = 0;
    j = 0;
    constructor(i2 = 0, j2 = 0) {
      this.i = i2;
      this.j = j2;
    }
    equal(rhs) {
      return rhs.i === this.i && rhs.j === this.j;
    }
    toJSON() {
      return {
        i: this.i,
        j: this.j
      };
    }
  };
  var edgesBySrcToMap = (edges) => {
    const ret = /* @__PURE__ */ new Map();
    edges.forEach((e2) => {
      const arr = ret.get(e2.i) || [];
      arr.push(e2);
      ret.set(e2.i, arr);
    });
    return ret;
  };
  var edgesByDstToMap = (edges) => {
    const ret = /* @__PURE__ */ new Map();
    edges.forEach((e2) => {
      const arr = ret.get(e2.j) || [];
      arr.push(e2);
      ret.set(e2.j, arr);
    });
    return ret;
  };
  var edgesBySrcAndDstToMap = (edges) => {
    const ret = {
      bySrc: /* @__PURE__ */ new Map(),
      byDst: /* @__PURE__ */ new Map()
    };
    edges.forEach((e2) => {
      let arr = ret.bySrc.get(e2.i) || [];
      arr.push(e2);
      ret.bySrc.set(e2.i, arr);
      arr = ret.byDst.get(e2.j) || [];
      arr.push(e2);
      ret.byDst.set(e2.j, arr);
    });
    return ret;
  };

  // src/ops/ops.ts
  var Op = class _Op {
    subOps = [];
    constructor(subOps) {
      this.subOps = subOps;
    }
    // Reverts all SubOps up to the given index.
    applyAllInverseSubOpsToPlan(plan, inverseSubOps) {
      for (let i2 = 0; i2 < inverseSubOps.length; i2++) {
        const e2 = inverseSubOps[i2].applyTo(plan);
        if (!e2.ok) {
          return e2;
        }
        plan = e2.value.plan;
      }
      return ok(plan);
    }
    // Applies the Op to a Plan.
    applyTo(plan) {
      const inverseSubOps = [];
      for (let i2 = 0; i2 < this.subOps.length; i2++) {
        const e2 = this.subOps[i2].applyTo(plan);
        if (!e2.ok) {
          const revertErr = this.applyAllInverseSubOpsToPlan(plan, inverseSubOps);
          if (!revertErr.ok) {
            return revertErr;
          }
          return e2;
        }
        plan = e2.value.plan;
        inverseSubOps.unshift(e2.value.inverse);
      }
      return ok({
        plan,
        inverse: new _Op(inverseSubOps)
      });
    }
  };
  var applyAllInverseOpsToPlan = (inverses, plan) => {
    for (let i2 = 0; i2 < inverses.length; i2++) {
      const res = inverses[i2].applyTo(plan);
      if (!res.ok) {
        return res;
      }
      plan = res.value.plan;
    }
    return ok(plan);
  };
  var applyAllOpsToPlan = (ops, plan) => {
    const inverses = [];
    for (let i2 = 0; i2 < ops.length; i2++) {
      const res = ops[i2].applyTo(plan);
      if (!res.ok) {
        const inverseRes = applyAllInverseOpsToPlan(inverses, plan);
        if (!inverseRes.ok) {
          return inverseRes;
        }
        return res;
      }
      inverses.unshift(res.value.inverse);
      plan = res.value.plan;
    }
    return ok({
      ops: inverses,
      plan
    });
  };

  // src/ops/metrics.ts
  var SetMetricValueSubOp = class _SetMetricValueSubOp {
    name;
    value;
    taskIndex;
    constructor(name, value, taskIndex) {
      this.name = name;
      this.value = value;
      this.taskIndex = taskIndex;
    }
    applyTo(plan) {
      const metricsDefinition = plan.getMetricDefinition(this.name);
      if (metricsDefinition === void 0) {
        return error(`${this.name} does not exist as a Metric`);
      }
      const task = plan.chart.Vertices[this.taskIndex];
      const oldValue = task.getMetric(this.name) || metricsDefinition.default;
      task.setMetric(
        this.name,
        metricsDefinition.precision.round(
          metricsDefinition.range.clamp(this.value)
        )
      );
      return ok({ plan, inverse: this.inverse(oldValue) });
    }
    inverse(value) {
      return new _SetMetricValueSubOp(this.name, value, this.taskIndex);
    }
  };
  function SetMetricValueOp(name, value, taskIndex) {
    return new Op([new SetMetricValueSubOp(name, value, taskIndex)]);
  }

  // src/ops/chart.ts
  function DirectedEdgeForPlan(i2, j2, plan) {
    const chart = plan.chart;
    if (j2 === -1) {
      j2 = chart.Vertices.length - 1;
    }
    if (i2 < 0 || i2 >= chart.Vertices.length) {
      return error(
        `i index out of range: ${i2} not in [0, ${chart.Vertices.length - 1}]`
      );
    }
    if (j2 < 0 || j2 >= chart.Vertices.length) {
      return error(
        `j index out of range: ${j2} not in [0, ${chart.Vertices.length - 1}]`
      );
    }
    if (i2 === j2) {
      return error(`A Task can not depend on itself: ${i2} === ${j2}`);
    }
    return ok(new DirectedEdge(i2, j2));
  }
  var AddEdgeSubOp = class {
    i = 0;
    j = 0;
    constructor(i2, j2) {
      this.i = i2;
      this.j = j2;
    }
    applyTo(plan) {
      if (this.i === -1) {
        this.i = plan.chart.Vertices.length - 1;
      }
      if (this.j === -1) {
        this.j = plan.chart.Vertices.length - 1;
      }
      const e2 = DirectedEdgeForPlan(this.i, this.j, plan);
      if (!e2.ok) {
        return e2;
      }
      if (!plan.chart.Edges.find((value) => value.equal(e2.value))) {
        plan.chart.Edges.push(e2.value);
      }
      return ok({
        plan,
        inverse: this.inverse()
      });
    }
    inverse() {
      return new RemoveEdgeSupOp(this.i, this.j);
    }
  };
  var RemoveEdgeSupOp = class {
    i = 0;
    j = 0;
    constructor(i2, j2) {
      this.i = i2;
      this.j = j2;
    }
    applyTo(plan) {
      if (this.i === -1) {
        this.i = plan.chart.Vertices.length - 1;
      }
      if (this.j === -1) {
        this.j = plan.chart.Vertices.length - 1;
      }
      const e2 = DirectedEdgeForPlan(this.i, this.j, plan);
      if (!e2.ok) {
        return e2;
      }
      plan.chart.Edges = plan.chart.Edges.filter(
        (v2) => !v2.equal(e2.value)
      );
      return ok({
        plan,
        inverse: this.inverse()
      });
    }
    inverse() {
      return new AddEdgeSubOp(this.i, this.j);
    }
  };
  function indexInRangeForVertices(index, chart) {
    if (index < 0 || index > chart.Vertices.length - 2) {
      return error(`${index} is not in range [0, ${chart.Vertices.length - 2}]`);
    }
    return ok(null);
  }
  function indexInRangeForVerticesExclusive(index, chart) {
    if (index < 1 || index > chart.Vertices.length - 2) {
      return error(`${index} is not in range [1, ${chart.Vertices.length - 2}]`);
    }
    return ok(null);
  }
  var AddTaskAfterSubOp = class {
    index = 0;
    fullTaskToBeRestored;
    constructor(index, fullTaskToBeRestored = null) {
      this.index = index;
      this.fullTaskToBeRestored = fullTaskToBeRestored;
    }
    applyTo(plan) {
      const chart = plan.chart;
      const ret = indexInRangeForVertices(this.index, chart);
      if (!ret.ok) {
        return ret;
      }
      let task = plan.newTask();
      if (this.fullTaskToBeRestored !== null) {
        task = this.fullTaskToBeRestored.task;
      }
      plan.chart.Vertices.splice(this.index + 1, 0, task);
      for (let i2 = 0; i2 < chart.Edges.length; i2++) {
        const edge = chart.Edges[i2];
        if (edge.i >= this.index + 1) {
          edge.i++;
        }
        if (edge.j >= this.index + 1) {
          edge.j++;
        }
      }
      if (this.fullTaskToBeRestored !== null) {
        chart.Edges.push(...this.fullTaskToBeRestored.edges);
      }
      return ok({ plan, inverse: this.inverse() });
    }
    inverse() {
      return new DeleteTaskSubOp(this.index + 1);
    }
  };
  var DupTaskSubOp = class {
    index = 0;
    constructor(index) {
      this.index = index;
    }
    applyTo(plan) {
      const chart = plan.chart;
      const ret = indexInRangeForVerticesExclusive(this.index, chart);
      if (!ret.ok) {
        return ret;
      }
      const copy = plan.chart.Vertices[this.index].dup();
      plan.chart.Vertices.splice(this.index, 0, copy);
      for (let i2 = 0; i2 < chart.Edges.length; i2++) {
        const edge = chart.Edges[i2];
        if (edge.i > this.index) {
          edge.i++;
        }
        if (edge.j > this.index) {
          edge.j++;
        }
      }
      return ok({ plan, inverse: this.inverse() });
    }
    inverse() {
      return new DeleteTaskSubOp(this.index + 1);
    }
  };
  var MoveAllOutgoingEdgesFromToSubOp = class _MoveAllOutgoingEdgesFromToSubOp {
    fromTaskIndex = 0;
    toTaskIndex = 0;
    actualMoves;
    constructor(fromTaskIndex, toTaskIndex, actualMoves = /* @__PURE__ */ new Map()) {
      this.fromTaskIndex = fromTaskIndex;
      this.toTaskIndex = toTaskIndex;
      this.actualMoves = actualMoves;
    }
    applyTo(plan) {
      const chart = plan.chart;
      let ret = indexInRangeForVerticesExclusive(this.fromTaskIndex, chart);
      if (!ret.ok) {
        return ret;
      }
      ret = indexInRangeForVerticesExclusive(this.toTaskIndex, chart);
      if (!ret.ok) {
        return ret;
      }
      if (this.actualMoves.values.length === 0) {
        const actualMoves = /* @__PURE__ */ new Map();
        for (let i2 = 0; i2 < chart.Edges.length; i2++) {
          const edge = chart.Edges[i2];
          if (edge.i === this.fromTaskIndex && edge.j === this.toTaskIndex) {
            continue;
          }
          if (edge.i === this.fromTaskIndex) {
            actualMoves.set(
              new DirectedEdge(this.toTaskIndex, edge.j),
              new DirectedEdge(edge.i, edge.j)
            );
            edge.i = this.toTaskIndex;
          }
        }
        return ok({
          plan,
          inverse: this.inverse(
            this.toTaskIndex,
            this.fromTaskIndex,
            actualMoves
          )
        });
      } else {
        for (let i2 = 0; i2 < chart.Edges.length; i2++) {
          const newEdge = this.actualMoves.get(plan.chart.Edges[i2]);
          if (newEdge !== void 0) {
            plan.chart.Edges[i2] = newEdge;
          }
        }
        return ok({
          plan,
          inverse: new _MoveAllOutgoingEdgesFromToSubOp(
            this.toTaskIndex,
            this.fromTaskIndex
          )
        });
      }
    }
    inverse(toTaskIndex, fromTaskIndex, actualMoves) {
      return new _MoveAllOutgoingEdgesFromToSubOp(
        toTaskIndex,
        fromTaskIndex,
        actualMoves
      );
    }
  };
  var CopyAllEdgesFromToSubOp = class {
    fromIndex = 0;
    toIndex = 0;
    constructor(fromIndex, toIndex) {
      this.fromIndex = fromIndex;
      this.toIndex = toIndex;
    }
    applyTo(plan) {
      const ret = indexInRangeForVertices(this.fromIndex, plan.chart);
      if (!ret.ok) {
        return ret;
      }
      const newEdges = [];
      plan.chart.Edges.forEach((edge) => {
        if (edge.i === this.fromIndex) {
          newEdges.push(new DirectedEdge(this.toIndex, edge.j));
        }
        if (edge.j === this.fromIndex) {
          newEdges.push(new DirectedEdge(edge.i, this.toIndex));
        }
      });
      plan.chart.Edges.push(...newEdges);
      return ok({ plan, inverse: new RemoveAllEdgesSubOp(newEdges) });
    }
  };
  var RemoveAllEdgesSubOp = class {
    edges;
    constructor(edges) {
      this.edges = edges;
    }
    applyTo(plan) {
      plan.chart.Edges = plan.chart.Edges.filter(
        (edge) => -1 === this.edges.findIndex(
          (toBeRemoved) => edge.equal(toBeRemoved)
        )
      );
      return ok({ plan, inverse: new AddAllEdgesSubOp(this.edges) });
    }
  };
  var AddAllEdgesSubOp = class {
    edges;
    constructor(edges) {
      this.edges = edges;
    }
    applyTo(plan) {
      plan.chart.Edges.push(...this.edges);
      return ok({ plan, inverse: new RemoveAllEdgesSubOp(this.edges) });
    }
  };
  var DeleteTaskSubOp = class {
    index = 0;
    constructor(index) {
      this.index = index;
    }
    applyTo(plan) {
      const chart = plan.chart;
      const ret = indexInRangeForVertices(this.index, chart);
      if (!ret.ok) {
        return ret;
      }
      const edgesToBeRestored = chart.Edges.filter((de) => {
        if (de.i === this.index || de.j === this.index) {
          return true;
        }
        return false;
      });
      chart.Edges = chart.Edges.filter((de) => {
        if (de.i === this.index || de.j === this.index) {
          return false;
        }
        return true;
      });
      for (let i2 = 0; i2 < chart.Edges.length; i2++) {
        const edge = chart.Edges[i2];
        if (edge.i > this.index) {
          edge.i--;
        }
        if (edge.j > this.index) {
          edge.j--;
        }
      }
      const taskToBeRestored = chart.Vertices.splice(this.index, 1);
      const fullTaskToBeRestored = {
        edges: edgesToBeRestored,
        task: taskToBeRestored[0]
      };
      return ok({ plan, inverse: this.inverse(fullTaskToBeRestored) });
    }
    inverse(fullTaskToBeRestored) {
      return new AddTaskAfterSubOp(this.index - 1, fullTaskToBeRestored);
    }
  };
  var RationalizeEdgesSubOp = class _RationalizeEdgesSubOp {
    constructor() {
    }
    applyTo(plan) {
      const srcAndDst = edgesBySrcAndDstToMap(plan.chart.Edges);
      const Start = 0;
      const Finish = plan.chart.Vertices.length - 1;
      for (let i2 = Start; i2 < Finish; i2++) {
        const destinations = srcAndDst.bySrc.get(i2);
        if (destinations === void 0) {
          const toBeAdded = new DirectedEdge(i2, Finish);
          plan.chart.Edges.push(toBeAdded);
        } else {
          if (destinations.length > 1 && destinations.find((value) => value.j === Finish)) {
            const toBeRemoved = new DirectedEdge(i2, Finish);
            plan.chart.Edges = plan.chart.Edges.filter(
              (value) => !toBeRemoved.equal(value)
            );
          }
        }
      }
      for (let i2 = Start + 1; i2 < Finish; i2++) {
        const destinations = srcAndDst.byDst.get(i2);
        if (destinations === void 0) {
          const toBeAdded = new DirectedEdge(Start, i2);
          plan.chart.Edges.push(toBeAdded);
        } else {
          if (destinations.length > 1 && destinations.find((value) => value.i === Start)) {
            const toBeRemoved = new DirectedEdge(Start, i2);
            plan.chart.Edges = plan.chart.Edges.filter(
              (value) => !toBeRemoved.equal(value)
            );
          }
        }
      }
      if (plan.chart.Edges.length === 0) {
        plan.chart.Edges.push(new DirectedEdge(Start, Finish));
      }
      return ok({ plan, inverse: this.inverse() });
    }
    inverse() {
      return new _RationalizeEdgesSubOp();
    }
  };
  var SetTaskNameSubOp = class _SetTaskNameSubOp {
    taskIndex;
    name;
    constructor(taskIndex, name) {
      this.taskIndex = taskIndex;
      this.name = name;
    }
    applyTo(plan) {
      const ret = indexInRangeForVertices(this.taskIndex, plan.chart);
      if (!ret.ok) {
        return ret;
      }
      const oldName = plan.chart.Vertices[this.taskIndex].name;
      plan.chart.Vertices[this.taskIndex].name = this.name;
      return ok({
        plan,
        inverse: this.inverse(oldName)
      });
    }
    inverse(oldName) {
      return new _SetTaskNameSubOp(this.taskIndex, oldName);
    }
  };
  function InsertNewEmptyMilestoneAfterOp(taskIndex) {
    return new Op([
      new RationalizeEdgesSubOp(),
      new AddTaskAfterSubOp(taskIndex),
      new AddEdgeSubOp(0, taskIndex + 1),
      new AddEdgeSubOp(taskIndex + 1, -1),
      new RationalizeEdgesSubOp()
    ]);
  }
  function SetTaskNameOp(taskIndex, name) {
    return new Op([new SetTaskNameSubOp(taskIndex, name)]);
  }
  function SplitTaskOp(taskIndex) {
    const subOps = [
      new DupTaskSubOp(taskIndex),
      new AddEdgeSubOp(taskIndex, taskIndex + 1),
      new MoveAllOutgoingEdgesFromToSubOp(taskIndex, taskIndex + 1)
    ];
    return new Op(subOps);
  }
  function DupTaskOp(taskIndex) {
    const subOps = [
      new DupTaskSubOp(taskIndex),
      new CopyAllEdgesFromToSubOp(taskIndex, taskIndex + 1)
    ];
    return new Op(subOps);
  }
  function DeleteTaskOp(taskIndex) {
    return new Op([
      new RationalizeEdgesSubOp(),
      new DeleteTaskSubOp(taskIndex),
      new RationalizeEdgesSubOp()
    ]);
  }
  function AddEdgeOp(fromTaskIndex, toTaskIndex) {
    return new Op([
      new RationalizeEdgesSubOp(),
      new AddEdgeSubOp(fromTaskIndex, toTaskIndex),
      new RationalizeEdgesSubOp()
    ]);
  }
  function RationalizeEdgesOp() {
    return new Op([new RationalizeEdgesSubOp()]);
  }
  function RemoveEdgeOp(i2, j2) {
    return new Op([
      new RationalizeEdgesSubOp(),
      new RemoveEdgeSupOp(i2, j2),
      new RationalizeEdgesSubOp()
    ]);
  }
  function InsertNewEmptyTaskAfterOp(taskIndex) {
    return new Op([
      new RationalizeEdgesSubOp(),
      new AddTaskAfterSubOp(taskIndex),
      new SetMetricValueSubOp("Duration", 10, taskIndex + 1),
      new AddEdgeSubOp(0, taskIndex + 1),
      new AddEdgeSubOp(taskIndex + 1, -1),
      new RationalizeEdgesSubOp()
    ]);
  }

  // src/action/actions/addPredecessor.ts
  var AddPredecessorAction = class {
    description = "Prompts for and adds a predecessor to the current Task.";
    postActionWork = "planDefinitionChanged";
    undo = true;
    async do(explanMain2) {
      if (explanMain2.selectedTask === -1) {
        return error(new Error("A Task must be selected."));
      }
      const predTaskIndex = await explanMain2.querySelector("add-dependency-dialog").selectDependency(explanMain2.plan.chart, explanMain2.selectedTask, "pred");
      if (predTaskIndex === void 0) {
        return error(new Error("No predecessor was selected."));
      }
      const ret = AddEdgeOp(predTaskIndex, explanMain2.selectedTask).applyTo(
        explanMain2.plan
      );
      if (!ret.ok) {
        return ret;
      }
      return ok(
        new ActionFromOp(
          ret.value.inverse,
          this.postActionWork = this.postActionWork,
          true
        )
      );
    }
  };

  // src/action/actions/addSuccessor.ts
  var AddSuccessorAction = class {
    description = "Prompts for and adds a successor to the current Task.";
    postActionWork = "planDefinitionChanged";
    undo = true;
    async do(explanMain2) {
      if (explanMain2.selectedTask === -1) {
        return error(new Error("A Task must be selected."));
      }
      const succTaskIndex = await explanMain2.querySelector("add-dependency-dialog").selectDependency(explanMain2.plan.chart, explanMain2.selectedTask, "succ");
      if (succTaskIndex === void 0) {
        return error(new Error("No successor was selected."));
      }
      const ret = AddEdgeOp(explanMain2.selectedTask, succTaskIndex).applyTo(
        explanMain2.plan
      );
      if (!ret.ok) {
        return ret;
      }
      return ok(
        new ActionFromOp(
          ret.value.inverse,
          this.postActionWork = this.postActionWork,
          true
        )
      );
    }
  };

  // src/action/actions/gotoSearch.ts
  var GoToSearchAction = class {
    description = "Moves focus to search control.";
    postActionWork = "";
    undo = false;
    async do(_explanMain) {
      document.querySelector("search-task-panel").setKeyboardFocusToInput("name-only");
      return ok(this);
    }
  };
  var GoToFullSearchAction = class {
    description = "Moves focus to search control and does a full search of all resource values.";
    postActionWork = "";
    undo = false;
    async do(_explanMain) {
      document.querySelector("search-task-panel").setKeyboardFocusToInput("full-info");
      return ok(this);
    }
  };

  // src/action/actions/help.ts
  var HelpAction = class {
    description = "Displays the help dialog.";
    postActionWork = "";
    undo = false;
    async do(explanMain2) {
      explanMain2.querySelector("keyboard-map-dialog").showModal();
      return ok(this);
    }
  };

  // src/action/actions/resetZoom.ts
  var ResetZoomAction = class {
    description = "Undoes the zoom.";
    postActionWork = "paintChart";
    undo = false;
    async do(explanMain2) {
      explanMain2.displayRange = null;
      return ok(this);
    }
  };

  // src/action/actions/tasks.ts
  var SplitTaskAction = class {
    description = "Splits a task.";
    postActionWork = "planDefinitionChanged";
    undo = true;
    async do(explanMain2) {
      if (explanMain2.selectedTask === -1) {
        return error(new Error("A task must be selected first."));
      }
      const ret = SplitTaskOp(explanMain2.selectedTask).applyTo(explanMain2.plan);
      if (!ret.ok) {
        return ret;
      }
      return ok(
        new ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
      );
    }
  };
  var DupTaskAction = class {
    description = "Duplicates a task.";
    postActionWork = "planDefinitionChanged";
    undo = true;
    async do(explanMain2) {
      if (explanMain2.selectedTask === -1) {
        return error(new Error("A task must be selected first."));
      }
      const ret = DupTaskOp(explanMain2.selectedTask).applyTo(explanMain2.plan);
      if (!ret.ok) {
        return ret;
      }
      return ok(
        new ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
      );
    }
  };
  var NewTaskAction = class {
    description = "Creates a new task.";
    postActionWork = "planDefinitionChanged";
    undo = true;
    async do(explanMain2) {
      let ret = InsertNewEmptyTaskAfterOp(0).applyTo(explanMain2.plan);
      if (!ret.ok) {
        return ret;
      }
      return ok(
        new ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
      );
    }
  };
  var DeleteTaskAction = class {
    description = "Deletes a task.";
    postActionWork = "planDefinitionChanged";
    undo = true;
    async do(explanMain2) {
      if (explanMain2.selectedTask === -1) {
        return error(new Error("A task must be selected first."));
      }
      const ret = DeleteTaskOp(explanMain2.selectedTask).applyTo(explanMain2.plan);
      if (!ret.ok) {
        return ret;
      }
      explanMain2.selectedTask = -1;
      return ok(
        new ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
      );
    }
  };

  // src/style/toggler/toggler.ts
  var toggleTheme = () => {
    document.body.classList.toggle("darkmode");
  };

  // src/action/actions/toggleDarkMode.ts
  var ToggleDarkModeAction = class {
    description = "Toggles dark mode.";
    postActionWork = "paintChart";
    undo = false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async do(explanMain2) {
      toggleTheme();
      return ok(this);
    }
  };

  // src/action/actions/toggleRadar.ts
  var ToggleRadarAction = class {
    description = "Toggles the radar view.";
    postActionWork = "";
    undo = false;
    async do(explanMain2) {
      explanMain2.toggleRadar();
      return ok(this);
    }
  };

  // src/action/actions/undo.ts
  var UndoAction = class {
    description = "Undoes the last action.";
    postActionWork = "";
    undo = false;
    async do(explanMain2) {
      const ret = undo(explanMain2);
      return ok(new NOOPAction());
    }
  };

  // src/action/registry.ts
  var ActionRegistry = {
    ToggleDarkModeAction: new ToggleDarkModeAction(),
    ToggleRadarAction: new ToggleRadarAction(),
    ResetZoomAction: new ResetZoomAction(),
    UndoAction: new UndoAction(),
    HelpAction: new HelpAction(),
    SplitTaskAction: new SplitTaskAction(),
    DupTaskAction: new DupTaskAction(),
    NewTaskAction: new NewTaskAction(),
    DeleteTaskAction: new DeleteTaskAction(),
    GoToSearchAction: new GoToSearchAction(),
    GoToFullSearchAction: new GoToFullSearchAction(),
    AddPredecessorAction: new AddPredecessorAction(),
    AddSuccessorAction: new AddSuccessorAction()
  };

  // src/action/execute.ts
  var undoStack = [];
  var undo = async (explanMain2) => {
    const action = undoStack.pop();
    if (!action) {
      return ok(null);
    }
    return await executeUndo(action, explanMain2);
  };
  var execute = async (name, explanMain2) => {
    const action = ActionRegistry[name];
    const ret = await action.do(explanMain2);
    if (!ret.ok) {
      return ret;
    }
    switch (action.postActionWork) {
      case "":
        break;
      case "paintChart":
        explanMain2.paintChart();
        break;
      case "planDefinitionChanged":
        explanMain2.planDefinitionHasBeenChanged();
        explanMain2.paintChart();
      default:
        break;
    }
    if (action.undo) {
      undoStack.push(ret.value);
    }
    return ok(null);
  };
  var executeOp = async (op, postActionWork, undo2, explanMain2) => {
    const action = new ActionFromOp(op, postActionWork, undo2);
    const ret = await action.do(explanMain2);
    if (!ret.ok) {
      return ret;
    }
    switch (action.postActionWork) {
      case "":
        break;
      case "paintChart":
        explanMain2.paintChart();
        break;
      case "planDefinitionChanged":
        explanMain2.planDefinitionHasBeenChanged();
        explanMain2.paintChart();
        break;
      default:
        break;
    }
    if (action.undo) {
      undoStack.push(ret.value);
    }
    return ok(null);
  };
  var executeUndo = async (action, explanMain2) => {
    const ret = await action.do(explanMain2);
    if (!ret.ok) {
      return ret;
    }
    switch (action.postActionWork) {
      case "":
        break;
      case "paintChart":
        explanMain2.paintChart();
        break;
      case "planDefinitionChanged":
        explanMain2.planDefinitionHasBeenChanged();
        explanMain2.paintChart();
        break;
      default:
        break;
    }
    return ok(null);
  };

  // src/keymap/keymap.ts
  var KeyMap = /* @__PURE__ */ new Map([
    ["shift-ctrl-R", "ToggleRadarAction"],
    ["shift-ctrl-M", "ToggleDarkModeAction"],
    ["shift-ctrl-Z", "ResetZoomAction"],
    ["ctrl-z", "UndoAction"],
    ["shift-ctrl-H", "HelpAction"],
    ["shift-ctrl-|", "SplitTaskAction"],
    ["shift-ctrl-_", "DupTaskAction"],
    ["alt-Insert", "NewTaskAction"],
    ["alt-Delete", "DeleteTaskAction"],
    ["ctrl-f", "GoToSearchAction"],
    ["shift-ctrl-F", "GoToFullSearchAction"],
    ["shift-ctrl-<", "AddPredecessorAction"],
    ["shift-ctrl->", "AddSuccessorAction"]
  ]);
  var explanMain;
  var StartKeyboardHandling = (em) => {
    explanMain = em;
    document.addEventListener("keydown", onKeyDown);
  };
  var onKeyDown = async (e2) => {
    const keyname = `${e2.shiftKey ? "shift-" : ""}${e2.ctrlKey ? "ctrl-" : ""}${e2.metaKey ? "meta-" : ""}${e2.altKey ? "alt-" : ""}${e2.key}`;
    console.log(keyname);
    const actionName = KeyMap.get(keyname);
    if (actionName === void 0) {
      return;
    }
    e2.stopPropagation();
    e2.preventDefault();
    const ret = await execute(actionName, explanMain);
    if (!ret.ok) {
      console.log(ret.error);
    }
  };

  // src/help/help.ts
  var KeyboardMapDialog = class extends HTMLElement {
    connectedCallback() {
      const keymapEntries = [...KeyMap.entries()];
      keymapEntries.sort();
      B(
        x`
        <dialog>
          <table>
            ${keymapEntries.map(
          ([key, actionName]) => x`<tr>
                  <td>${key}</td>
                  <td>${ActionRegistry[actionName].description}</td>
                </tr>`
        )}
          </table>
        </dialog>
      `,
        this
      );
    }
    showModal() {
      this.querySelector("dialog").showModal();
    }
  };
  customElements.define("keyboard-map-dialog", KeyboardMapDialog);

  // src/dag/algorithms/dfs.ts
  var depthFirstSearchFromIndex = (g2, start_index, f2) => {
    const edgesBySrc = edgesBySrcToMap(g2.Edges);
    const visit = (vertexIndex) => {
      if (f2(g2.Vertices[vertexIndex], vertexIndex) === false) {
        return;
      }
      const next = edgesBySrc.get(vertexIndex);
      if (next === void 0) {
        return;
      }
      next.forEach((e2) => {
        visit(e2.j);
      });
    };
    visit(start_index);
  };

  // src/dag/algorithms/circular.ts
  var allSuccessors = (taskIndex, directedGraph) => {
    if (taskIndex >= directedGraph.Vertices.length - 1 || taskIndex <= 0) {
      return [];
    }
    const allChildren = /* @__PURE__ */ new Set();
    depthFirstSearchFromIndex(
      directedGraph,
      taskIndex,
      (_2, index) => {
        allChildren.add(index);
        return true;
      }
    );
    allChildren.delete(directedGraph.Vertices.length - 1);
    return [...allChildren.values()];
  };
  var allPredecessors = (taskIndex, directedGraph) => {
    if (taskIndex >= directedGraph.Vertices.length - 1 || taskIndex <= 0) {
      return [];
    }
    const predecessorsToCheck = [taskIndex];
    const ret = /* @__PURE__ */ new Set();
    const byDest = edgesByDstToMap(directedGraph.Edges);
    while (predecessorsToCheck.length !== 0) {
      const node = predecessorsToCheck.pop();
      ret.add(node);
      const predecessors = byDest.get(node);
      if (predecessors) {
        predecessorsToCheck.push(...predecessors.map((e2) => e2.i));
      }
    }
    ret.delete(0);
    return [...ret.values()];
  };
  var allTasks = (directedGraph) => {
    const ret = [];
    for (let index = 1; index < directedGraph.Vertices.length - 1; index++) {
      ret.push(index);
    }
    return ret;
  };
  var difference = (a2, b2) => {
    const bSet = new Set(b2);
    return a2.filter((i2) => bSet.has(i2) === false);
  };
  var allPotentialSuccessors = (taskIndex, directedGraph) => {
    const bySrc = edgesBySrcToMap(directedGraph.Edges);
    const directSucc = bySrc.get(taskIndex) || [];
    const directSuccArray = directSucc.map((e2) => e2.j);
    return difference(allTasks(directedGraph), [
      ...allPredecessors(taskIndex, directedGraph),
      ...directSuccArray
    ]);
  };
  var allPotentialPredecessors = (taskIndex, directedGraph) => {
    const byDest = edgesByDstToMap(directedGraph.Edges);
    const directPred = byDest.get(taskIndex) || [];
    const directPredArray = directPred.map((e2) => e2.i);
    const allSucc = allSuccessors(taskIndex, directedGraph);
    const all = allTasks(directedGraph);
    const toBeSubtracted = [...allSucc, ...directPredArray];
    return difference(all, toBeSubtracted);
  };

  // src/add-dependency-dialog/add-dependency-dialog.ts
  var AddDependencyDialog = class extends HTMLElement {
    titleElement = null;
    taskSearchControl = null;
    dialog = null;
    resolve = () => {
    };
    connectedCallback() {
      this.titleElement = this.querySelector("h2");
      this.taskSearchControl = this.querySelector("task-search-control");
      this.dialog = this.querySelector("dialog");
      this.dialog.addEventListener("cancel", () => this.resolve(void 0));
      this.taskSearchControl.addEventListener("task-change", (e2) => {
        this.dialog.close();
        this.resolve(e2.detail);
      });
    }
    /** Populates the dialog and shows it as a Modal dialog and returns a Promise
     *  that resolves on success to a taskIndex, or undefined if the user
     *  cancelled out of the flow.
     */
    selectDependency(chart, taskIndex, depType) {
      this.titleElement.textContent = depType;
      let includedIndexes = [];
      if (depType === "pred") {
        includedIndexes = allPotentialPredecessors(taskIndex, chart);
      } else {
        includedIndexes = allPotentialSuccessors(taskIndex, chart);
      }
      this.taskSearchControl.tasks = chart.Vertices;
      this.taskSearchControl.includedIndexes = includedIndexes;
      this.taskSearchControl.setKeyboardFocusToInput("name-only");
      const ret = new Promise((resolve, _reject) => {
        this.resolve = resolve;
        this.dialog.showModal();
      });
      return ret;
    }
  };
  customElements.define("add-dependency-dialog", AddDependencyDialog);

  // src/dag/algorithms/toposort.ts
  var topologicalSort = (g2) => {
    const ret = {
      hasCycles: false,
      cycle: [],
      order: []
    };
    const edgeMap = edgesBySrcToMap(g2.Edges);
    const nodesWithoutPermanentMark = /* @__PURE__ */ new Set();
    g2.Vertices.forEach(
      (_2, index) => nodesWithoutPermanentMark.add(index)
    );
    const hasPermanentMark = (index) => {
      return !nodesWithoutPermanentMark.has(index);
    };
    const temporaryMark = /* @__PURE__ */ new Set();
    const visit = (index) => {
      if (hasPermanentMark(index)) {
        return true;
      }
      if (temporaryMark.has(index)) {
        return false;
      }
      temporaryMark.add(index);
      const nextEdges = edgeMap.get(index);
      if (nextEdges !== void 0) {
        for (let i2 = 0; i2 < nextEdges.length; i2++) {
          const e2 = nextEdges[i2];
          if (!visit(e2.j)) {
            return false;
          }
        }
      }
      temporaryMark.delete(index);
      nodesWithoutPermanentMark.delete(index);
      ret.order.unshift(index);
      return true;
    };
    const ok2 = visit(0);
    if (!ok2) {
      ret.hasCycles = true;
      ret.cycle = [...temporaryMark.keys()];
    }
    return ret;
  };

  // src/chart/chart.ts
  var DEFAULT_TASK_NAME = "Task Name";
  var Task = class _Task {
    constructor(name = "") {
      this.name = name || DEFAULT_TASK_NAME;
      this.metrics = {};
      this.resources = {};
    }
    // Resource keys and values. The parent plan contains all the resource
    // definitions.
    resources;
    metrics;
    name;
    state = "unstarted";
    toJSON() {
      return {
        resources: this.resources,
        metrics: this.metrics,
        name: this.name,
        state: this.state
      };
    }
    get duration() {
      return this.getMetric("Duration");
    }
    set duration(value) {
      this.setMetric("Duration", value);
    }
    getMetric(key) {
      return this.metrics[key];
    }
    setMetric(key, value) {
      this.metrics[key] = value;
    }
    deleteMetric(key) {
      delete this.metrics[key];
    }
    getResource(key) {
      return this.resources[key];
    }
    setResource(key, value) {
      this.resources[key] = value;
    }
    deleteResource(key) {
      delete this.resources[key];
    }
    dup() {
      const ret = new _Task();
      ret.resources = Object.assign({}, this.resources);
      ret.metrics = Object.assign({}, this.metrics);
      ret.name = this.name;
      ret.state = this.state;
      return ret;
    }
  };
  var Chart = class {
    Vertices;
    Edges;
    constructor() {
      const start = new Task("Start");
      start.setMetric("Duration", 0);
      const finish = new Task("Finish");
      finish.setMetric("Duration", 0);
      this.Vertices = [start, finish];
      this.Edges = [new DirectedEdge(0, 1)];
    }
    toJSON() {
      return {
        vertices: this.Vertices.map((t2) => t2.toJSON()),
        edges: this.Edges.map((e2) => e2.toJSON())
      };
    }
  };
  function validateChart(g2) {
    if (g2.Vertices.length < 2) {
      return error(
        "Chart must contain at least two node, the start and finish tasks."
      );
    }
    const edgesByDst = edgesByDstToMap(g2.Edges);
    const edgesBySrc = edgesBySrcToMap(g2.Edges);
    if (edgesByDst.get(0) !== void 0) {
      return error("The start node (0) has an incoming edge.");
    }
    for (let i2 = 1; i2 < g2.Vertices.length; i2++) {
      if (edgesByDst.get(i2) === void 0) {
        return error(
          `Found node that isn't (0) that has no incoming edges: ${i2}`
        );
      }
    }
    if (edgesBySrc.get(g2.Vertices.length - 1) !== void 0) {
      return error(
        "The last node, which should be the Finish Milestone, has an outgoing edge."
      );
    }
    for (let i2 = 0; i2 < g2.Vertices.length - 1; i2++) {
      if (edgesBySrc.get(i2) === void 0) {
        return error(
          `Found node that isn't T_finish that has no outgoing edges: ${i2}`
        );
      }
    }
    const numVertices = g2.Vertices.length;
    for (let i2 = 0; i2 < g2.Edges.length; i2++) {
      const element = g2.Edges[i2];
      if (element.i < 0 || element.i >= numVertices || element.j < 0 || element.j >= numVertices) {
        return error(`Edge ${element} points to a non-existent Vertex.`);
      }
    }
    const tsRet = topologicalSort(g2);
    if (tsRet.hasCycles) {
      return error(`Chart has cycle: ${[...tsRet.cycle].join(", ")}`);
    }
    return ok(tsRet.order);
  }
  function ChartValidate(c2, taskDuration = null) {
    if (taskDuration === null) {
      taskDuration = (taskIndex) => c2.Vertices[taskIndex].duration;
    }
    const ret = validateChart(c2);
    if (!ret.ok) {
      return ret;
    }
    if (taskDuration(0) !== 0) {
      return error(
        `Start Milestone must have duration of 0, instead got ${taskDuration(0)}`
      );
    }
    if (taskDuration(c2.Vertices.length - 1) !== 0) {
      return error(
        `Finish Milestone must have duration of 0, instead got ${taskDuration(
          c2.Vertices.length - 1
        )}`
      );
    }
    return ret;
  }

  // src/precision/precision.ts
  var Precision = class _Precision {
    multiplier;
    _precision;
    constructor(precision3 = 0) {
      if (!Number.isFinite(precision3)) {
        precision3 = 0;
      }
      this._precision = Math.abs(Math.trunc(precision3));
      this.multiplier = 10 ** this._precision;
    }
    round(x2) {
      return Math.trunc(x2 * this.multiplier) / this.multiplier;
    }
    rounder() {
      return (x2) => this.round(x2);
    }
    get precision() {
      return this._precision;
    }
    toJSON() {
      return {
        precision: this._precision
      };
    }
    static FromJSON(s2) {
      if (s2 === void 0) {
        return new _Precision();
      }
      return new _Precision(s2.precision);
    }
  };

  // src/metrics/range.ts
  var clamp = (x2, min, max) => {
    if (x2 > max) {
      return max;
    }
    if (x2 < min) {
      return min;
    }
    return x2;
  };
  var MetricRange = class _MetricRange {
    _min = -Number.MAX_VALUE;
    _max = Number.MAX_VALUE;
    constructor(min = -Number.MAX_VALUE, max = Number.MAX_VALUE) {
      if (max < min) {
        [min, max] = [max, min];
      }
      this._min = min;
      this._max = max;
    }
    clamp(value) {
      return clamp(value, this._min, this._max);
    }
    get min() {
      return this._min;
    }
    get max() {
      return this._max;
    }
    toJSON() {
      return {
        min: this._min,
        max: this._max
      };
    }
    static FromJSON(s2) {
      if (s2 === void 0) {
        return new _MetricRange();
      }
      return new _MetricRange(s2.min, s2.max);
    }
  };

  // src/metrics/metrics.ts
  var MetricDefinition = class _MetricDefinition {
    range;
    default;
    isStatic;
    precision;
    constructor(defaultValue, range = new MetricRange(), isStatic = false, precision3 = new Precision(1)) {
      this.range = range;
      this.default = clamp(defaultValue, range.min, range.max);
      this.isStatic = isStatic;
      this.precision = precision3;
    }
    toJSON() {
      return {
        range: this.range.toJSON(),
        default: this.default,
        precision: this.precision.toJSON()
      };
    }
    static FromJSON(s2) {
      if (s2 === void 0) {
        return new _MetricDefinition(0);
      }
      return new _MetricDefinition(
        s2.default || 0,
        MetricRange.FromJSON(s2.range),
        false,
        Precision.FromJSON(s2.precision)
      );
    }
  };

  // src/resources/resources.ts
  var DEFAULT_RESOURCE_VALUE = "";
  var ResourceDefinition = class _ResourceDefinition {
    values;
    isStatic;
    constructor(values = [DEFAULT_RESOURCE_VALUE], isStatic = false) {
      this.values = values;
      this.isStatic = isStatic;
    }
    toJSON() {
      return {
        values: this.values
      };
    }
    static FromJSON(s2) {
      return new _ResourceDefinition(s2.values);
    }
  };

  // src/stats/cdf/triangular/triangular.ts
  var Triangular = class {
    a;
    b;
    c;
    F_c;
    /**  The triangular distribution is a continuous probability distribution with
    lower limit `a`, upper limit `b`, and mode `c`, where a < b and a ≤ c ≤ b. */
    constructor(a2, b2, c2) {
      this.a = a2;
      this.b = b2;
      this.c = c2;
      this.F_c = (c2 - a2) / (b2 - a2);
    }
    /**  Produce a sample from the triangular distribution. The value of 'p'
     should be in [0, 1.0]. */
    sample(p2) {
      if (p2 < 0) {
        return 0;
      } else if (p2 > 1) {
        return 1;
      } else if (p2 < this.F_c) {
        return this.a + Math.sqrt(p2 * (this.b - this.a) * (this.c - this.a));
      } else {
        return this.b - Math.sqrt((1 - p2) * (this.b - this.a) * (this.b - this.c));
      }
    }
  };

  // src/stats/cdf/triangular/jacobian.ts
  var UncertaintyToNum = {
    low: 1.1,
    moderate: 1.5,
    high: 2,
    extreme: 5
  };
  var Jacobian = class {
    triangular;
    constructor(expected, uncertainty) {
      const mul = UncertaintyToNum[uncertainty];
      this.triangular = new Triangular(expected / mul, expected * mul, expected);
    }
    sample(p2) {
      return this.triangular.sample(p2);
    }
  };

  // src/plan/plan.ts
  var StaticMetricDefinitions = {
    // How long a task will take, in days.
    Duration: new MetricDefinition(0, new MetricRange(0), true),
    // The percent complete for a task.
    Percent: new MetricDefinition(0, new MetricRange(0, 100), true)
  };
  var StaticResourceDefinitions = {
    Uncertainty: new ResourceDefinition(Object.keys(UncertaintyToNum), true)
  };
  var Plan = class {
    chart;
    resourceDefinitions;
    metricDefinitions;
    constructor() {
      this.chart = new Chart();
      this.resourceDefinitions = Object.assign({}, StaticResourceDefinitions);
      this.metricDefinitions = Object.assign({}, StaticMetricDefinitions);
      this.applyMetricsAndResourcesToVertices();
    }
    applyMetricsAndResourcesToVertices() {
      Object.keys(this.metricDefinitions).forEach((metricName) => {
        const md = this.metricDefinitions[metricName];
        this.chart.Vertices.forEach((task) => {
          task.setMetric(metricName, md.default);
        });
      });
      Object.entries(this.resourceDefinitions).forEach(
        ([key, resourceDefinition]) => {
          this.chart.Vertices.forEach((task) => {
            task.setResource(key, resourceDefinition.values[0]);
          });
        }
      );
    }
    toJSON() {
      return {
        chart: this.chart.toJSON(),
        resourceDefinitions: Object.fromEntries(
          Object.entries(this.resourceDefinitions).filter(
            ([key, resourceDefinition]) => !resourceDefinition.isStatic
          )
        ),
        metricDefinitions: Object.fromEntries(
          Object.entries(this.metricDefinitions).filter(([key, metricDefinition]) => !metricDefinition.isStatic).map(([key, metricDefinition]) => [key, metricDefinition.toJSON()])
        )
      };
    }
    getMetricDefinition(key) {
      return this.metricDefinitions[key];
    }
    setMetricDefinition(key, metricDefinition) {
      this.metricDefinitions[key] = metricDefinition;
    }
    deleteMetricDefinition(key) {
      delete this.metricDefinitions[key];
    }
    getResourceDefinition(key) {
      return this.resourceDefinitions[key];
    }
    setResourceDefinition(key, value) {
      this.resourceDefinitions[key] = value;
    }
    deleteResourceDefinition(key) {
      delete this.resourceDefinitions[key];
    }
    // Returns a new Task with defaults for all metrics and resources.
    newTask() {
      const ret = new Task();
      Object.keys(this.metricDefinitions).forEach((metricName) => {
        const md = this.getMetricDefinition(metricName);
        ret.setMetric(metricName, md.default);
      });
      Object.entries(this.resourceDefinitions).forEach(
        ([key, resourceDefinition]) => {
          ret.setResource(key, resourceDefinition.values[0]);
        }
      );
      return ret;
    }
  };
  var FromJSON = (text) => {
    const planSerialized = JSON.parse(text);
    const plan = new Plan();
    plan.chart.Vertices = planSerialized.chart.vertices.map(
      (taskSerialized) => {
        const task = new Task(taskSerialized.name);
        task.state = taskSerialized.state;
        task.metrics = taskSerialized.metrics;
        task.resources = taskSerialized.resources;
        return task;
      }
    );
    plan.chart.Edges = planSerialized.chart.edges.map(
      (directedEdgeSerialized) => new DirectedEdge(directedEdgeSerialized.i, directedEdgeSerialized.j)
    );
    const deserializedMetricDefinitions = Object.fromEntries(
      Object.entries(planSerialized.metricDefinitions).map(
        ([key, serializedMetricDefinition]) => [
          key,
          MetricDefinition.FromJSON(serializedMetricDefinition)
        ]
      )
    );
    plan.metricDefinitions = Object.assign(
      {},
      StaticMetricDefinitions,
      deserializedMetricDefinitions
    );
    const deserializedResourceDefinitions = Object.fromEntries(
      Object.entries(planSerialized.resourceDefinitions).map(
        ([key, serializedResourceDefinition]) => [
          key,
          ResourceDefinition.FromJSON(serializedResourceDefinition)
        ]
      )
    );
    plan.resourceDefinitions = Object.assign(
      {},
      StaticResourceDefinitions,
      deserializedResourceDefinitions
    );
    const ret = RationalizeEdgesOp().applyTo(plan);
    if (!ret.ok) {
      return ret;
    }
    const retVal = validateChart(plan.chart);
    if (!retVal.ok) {
      return retVal;
    }
    return ok(plan);
  };

  // src/selected-task-panel/selected-task-panel.ts
  var SelectedTaskPanel = class extends HTMLElement {
    plan = new Plan();
    taskIndex = -1;
    connectedCallback() {
      this.render();
    }
    updateSelectedTaskPanel(plan, taskIndex) {
      this.plan = plan;
      this.taskIndex = taskIndex;
      this.render();
    }
    render() {
      B(this.template(), this);
    }
    template() {
      const taskIndex = this.taskIndex;
      if (taskIndex === -1) {
        return x`No task selected.`;
      }
      const task = this.plan.chart.Vertices[taskIndex];
      return x`
      <table>
        <tr>
          <td>Name</td>
          <td>
            <input
              type="text"
              id="task-name"
              .value="${task.name}"
              @change=${(e2) => this.dispatchEvent(
        new CustomEvent("task-name-change", {
          bubbles: true,
          detail: {
            taskIndex,
            name: e2.target.value
          }
        })
      )}
            />
          </td>
        </tr>
        ${Object.entries(this.plan.resourceDefinitions).map(
        ([resourceKey, defn]) => x` <tr>
              <td>
                <label for="${resourceKey}">${resourceKey}</label>
              </td>
              <td>
                <select
                  id="${resourceKey}"
                  @change=${async (e2) => this.dispatchEvent(
          new CustomEvent("task-resource-value-change", {
            bubbles: true,
            detail: {
              taskIndex,
              value: e2.target.value,
              name: resourceKey
            }
          })
        )}
                >
                  ${defn.values.map(
          (resourceValue) => x`<option
                        name=${resourceValue}
                        .selected=${task.resources[resourceKey] === resourceValue}
                      >
                        ${resourceValue}
                      </option>`
        )}
                </select>
              </td>
            </tr>`
      )}
        ${Object.keys(this.plan.metricDefinitions).map(
        (key) => x` <tr>
              <td><label for="${key}">${key}</label></td>
              <td>
                <input
                  id="${key}"
                  type="number"
                  .value="${task.metrics[key]}"
                  @change=${async (e2) => this.dispatchEvent(
          new CustomEvent("task-metric-value-change", {
            bubbles: true,
            detail: {
              taskIndex,
              value: +e2.target.value,
              name: key
            }
          })
        )}
                />
              </td>
            </tr>`
      )}
      </table>
    `;
    }
  };
  customElements.define("selected-task-panel", SelectedTaskPanel);

  // src/slack/slack.ts
  var Span = class {
    start;
    finish;
    constructor(start = 0, finish = 0) {
      this.start = start;
      this.finish = finish;
    }
  };
  var Slack = class {
    early = new Span();
    late = new Span();
    slack = 0;
  };
  function ComputeSlack(c2, taskDuration = null, round) {
    if (taskDuration === null) {
      taskDuration = (taskIndex) => c2.Vertices[taskIndex].duration;
    }
    const slacks = new Array(c2.Vertices.length);
    for (let i2 = 0; i2 < c2.Vertices.length; i2++) {
      slacks[i2] = new Slack();
    }
    const r2 = ChartValidate(c2, taskDuration);
    if (!r2.ok) {
      return error(r2.error);
    }
    const edges = edgesBySrcAndDstToMap(c2.Edges);
    const topologicalOrder = r2.value;
    topologicalOrder.slice(1).forEach((vertexIndex) => {
      const task = c2.Vertices[vertexIndex];
      const slack = slacks[vertexIndex];
      slack.early.start = Math.max(
        ...edges.byDst.get(vertexIndex).map((e2) => {
          const predecessorSlack = slacks[e2.i];
          return predecessorSlack.early.finish;
        })
      );
      slack.early.finish = round(slack.early.start + taskDuration(vertexIndex));
    });
    topologicalOrder.reverse().forEach((vertexIndex) => {
      const task = c2.Vertices[vertexIndex];
      const slack = slacks[vertexIndex];
      const successors = edges.bySrc.get(vertexIndex);
      if (!successors) {
        slack.late.finish = slack.early.finish;
        slack.late.start = slack.early.start;
      } else {
        slack.late.finish = Math.min(
          ...edges.bySrc.get(vertexIndex).map((e2) => {
            const successorSlack = slacks[e2.j];
            return successorSlack.late.start;
          })
        );
        slack.late.start = round(slack.late.finish - taskDuration(vertexIndex));
        slack.slack = round(slack.late.finish - slack.early.finish);
      }
    });
    return ok(slacks);
  }
  var CriticalPath = (slacks, round) => {
    const ret = [];
    slacks.forEach((slack, index) => {
      if (round(slack.late.finish - slack.early.finish) < Number.EPSILON && round(slack.early.finish - slack.early.start) > Number.EPSILON) {
        ret.push(index);
      }
    });
    return ret;
  };

  // src/simulation/simulation.ts
  var MAX_RANDOM = 1e3;
  var precision = new Precision(2);
  var rndInt = (n2) => {
    return Math.floor(Math.random() * n2);
  };
  var simulation = (chart, numSimulationLoops) => {
    const allCriticalPaths = /* @__PURE__ */ new Map();
    for (let i2 = 0; i2 < numSimulationLoops; i2++) {
      const durations = chart.Vertices.map((t2) => {
        const rawDuration = new Jacobian(
          t2.duration,
          // Acceptable direct access to duration.
          t2.getResource("Uncertainty")
        ).sample(rndInt(MAX_RANDOM) / MAX_RANDOM);
        return precision.round(rawDuration);
      });
      const slacksRet = ComputeSlack(
        chart,
        (taskIndex) => durations[taskIndex],
        precision.rounder()
      );
      if (!slacksRet.ok) {
        throw slacksRet.error;
      }
      const criticalPath = CriticalPath(slacksRet.value, precision.rounder());
      const criticalPathAsString = `${criticalPath}`;
      let pathEntry = allCriticalPaths.get(criticalPathAsString);
      if (pathEntry === void 0) {
        pathEntry = {
          count: 0,
          criticalPath,
          durations
        };
        allCriticalPaths.set(criticalPathAsString, pathEntry);
      }
      pathEntry.count++;
    }
    return {
      paths: allCriticalPaths,
      tasks: criticalTaskFrequencies(allCriticalPaths, chart)
    };
  };
  var criticalTaskFrequencies = (allCriticalPaths, chart) => {
    const critialTasks = /* @__PURE__ */ new Map();
    allCriticalPaths.forEach((value) => {
      value.criticalPath.forEach((taskIndex) => {
        let taskEntry = critialTasks.get(taskIndex);
        if (taskEntry === void 0) {
          taskEntry = {
            taskIndex,
            duration: chart.Vertices[taskIndex].duration,
            numTimesAppeared: 0
          };
          critialTasks.set(taskIndex, taskEntry);
        }
        taskEntry.numTimesAppeared += value.count;
      });
    });
    return [...critialTasks.values()].sort(
      (a2, b2) => {
        return b2.duration - a2.duration;
      }
    );
  };

  // src/simulation-panel/simulation-panel.ts
  var SimulationPanel = class extends HTMLElement {
    results = {
      paths: /* @__PURE__ */ new Map(),
      tasks: []
    };
    chart = null;
    numSimulationLoops = 0;
    originalCriticalPath = [];
    connectedCallback() {
      this.render();
    }
    simulate(chart, numSimulationLoops, originalCriticalPath) {
      this.results = simulation(chart, numSimulationLoops);
      this.chart = chart;
      this.numSimulationLoops = numSimulationLoops;
      this.originalCriticalPath = originalCriticalPath;
      this.render();
      return this.results.tasks.map(
        (taskEntry) => taskEntry.taskIndex
      );
    }
    clear() {
      this.results = {
        paths: /* @__PURE__ */ new Map(),
        tasks: []
      };
      this.dispatchEvent(
        new CustomEvent("simulation-select", {
          bubbles: true,
          detail: {
            durations: null,
            criticalPath: []
          }
        })
      );
      this.render();
    }
    pathClicked(key) {
      this.dispatchEvent(
        new CustomEvent("simulation-select", {
          bubbles: true,
          detail: {
            durations: this.results.paths.get(key).durations,
            criticalPath: this.results.paths.get(key).criticalPath
          }
        })
      );
    }
    render() {
      B(this.template(), this);
    }
    displayCriticalPathDifferences(criticalPath) {
      const removed = difference(this.originalCriticalPath, criticalPath);
      const added = difference(criticalPath, this.originalCriticalPath);
      return x`
      ${added.map(
        (taskIndex) => x`
          <span class="added">+${this.chart.Vertices[taskIndex].name}</span>
        `
      )}
      ${removed.map(
        (taskIndex) => x`
          <span class="removed">-${this.chart.Vertices[taskIndex].name}</span>
        `
      )}
    `;
    }
    template() {
      if (this.results.paths.size === 0) {
        return x``;
      }
      const pathKeys = [...this.results.paths.keys()];
      const sortedPathKeys = pathKeys.sort((a2, b2) => {
        return this.results.paths.get(b2).count - this.results.paths.get(a2).count;
      });
      return x`
      <button
        @click=${() => {
        this.clear();
      }}
      >
        Clear
      </button>

      <table class="paths">
        <tr>
          <th>Count</th>
          <th>Critical Path</th>
        </tr>
        ${sortedPathKeys.map(
        (key) => x`<tr @click=${() => this.pathClicked(key)}>
              <td>${this.results.paths.get(key).count}</td>
              <td>
                ${this.displayCriticalPathDifferences(
          this.results.paths.get(key).criticalPath
        )}
              </td>
            </tr>`
      )}
      </table>
      <table>
        <tr>
          <th>Name</th>
          <th>Duration</th>
          <th>Frequency (%)</th>
        </tr>
        ${this.results.tasks.map(
        (taskEntry) => x`<tr>
              <td>${this.chart.Vertices[taskEntry.taskIndex].name}</td>
              <td>${taskEntry.duration}</td>
              <td>
                ${Math.floor(
          100 * taskEntry.numTimesAppeared / this.numSimulationLoops
        )}
              </td>
            </tr>`
      )}
      </table>
    `;
    }
  };
  customElements.define("simulation-panel", SimulationPanel);

  // src/search/search-task-panel.ts
  var SearchTaskPanel = class extends HTMLElement {
    explanMain = null;
    taskSearchControl = null;
    connectedCallback() {
      this.explanMain = document.querySelector("explan-main");
      if (!this.explanMain) {
        return;
      }
      this.taskSearchControl = this.querySelector("task-search-control");
      this.addEventListener(
        "task-change",
        (e2) => this.explanMain.setFocusOnTask(e2.detail)
      );
      this.addEventListener(
        "task-focus",
        (e2) => this.setKeyboardFocusToInput("full-info")
      );
    }
    setKeyboardFocusToInput(searchType) {
      this.taskSearchControl.tasks = this.explanMain.plan.chart.Vertices;
      this.taskSearchControl.includedIndexes = [];
      this.taskSearchControl.setKeyboardFocusToInput(searchType);
    }
  };
  customElements.define("search-task-panel", SearchTaskPanel);

  // src/search/task-search-controls.ts
  var import_fuzzysort = __toESM(require_fuzzysort(), 1);
  var indexesToRanges = (indexes, len) => {
    const ranges = indexes.map((x2) => [x2, x2 + 1]).flat();
    return [0, ...ranges, len];
  };
  var highlight = (ranges, target) => {
    const ret = [];
    let inHighlight = false;
    for (let i2 = 0; i2 < ranges.length - 1; i2++) {
      const sub = target.slice(ranges[i2], ranges[i2 + 1]);
      if (inHighlight) {
        ret.push(x`<b>${sub}</b>`);
      } else {
        ret.push(x`${sub}`);
      }
      inHighlight = !inHighlight;
    }
    return ret;
  };
  var highlightedTarget = (indexes, target) => {
    return highlight(indexesToRanges(indexes, target.length), target);
  };
  var template = (searchTaskPanel) => x`
  <input
    type="text"
    @input="${(e2) => searchTaskPanel.onInput(e2)}"
    @keydown="${(e2) => searchTaskPanel.onKeyDown(e2)}"
    @blur="${() => searchTaskPanel.lossOfFocus()}"
    @focus="${() => searchTaskPanel.searchInputReceivedFocus()}"
  />
  <ul>
    ${searchTaskPanel.searchResults.map(
    (task, index) => x` <li
          @click="${() => searchTaskPanel.selectSearchResult(index)}"
          ?data-focus=${index === searchTaskPanel.focusIndex}
        >
          ${highlightedTarget(task.indexes, task.target)}
        </li>`
  )}
  </ul>
`;
  var searchStringFromTaskBuilder = (fullTaskList, searchType, includedIndexes, maxNameLength) => {
    if (searchType === "full-info") {
      return (task) => {
        if (includedIndexes.size !== 0) {
          const taskIndex = fullTaskList.indexOf(task);
          if (!includedIndexes.has(taskIndex)) {
            return "";
          }
        }
        const resourceKeys = Object.keys(task.resources);
        resourceKeys.sort();
        return `${task.name} ${"-".repeat(maxNameLength - task.name.length + 2)} ${resourceKeys.map((key) => task.resources[key]).join(" ")}`;
      };
    } else {
      return (task) => {
        if (includedIndexes.size !== 0) {
          const taskIndex = fullTaskList.indexOf(task);
          if (!includedIndexes.has(taskIndex)) {
            return "";
          }
        }
        return task.name;
      };
    }
  };
  var TaskSearchControl = class extends HTMLElement {
    _tasks = [];
    _includedIndexes = /* @__PURE__ */ new Set();
    focusIndex = 0;
    searchResults = [];
    searchType = "name-only";
    connectedCallback() {
      B(template(this), this);
    }
    onInput(e2) {
      const maxNameLength = this._tasks.reduce(
        (prev, task) => task.name.length > prev ? task.name.length : prev,
        0
      );
      this.searchResults = import_fuzzysort.default.go(
        e2.target.value,
        this._tasks.slice(1, -1),
        // Remove Start and Finish from search range.
        {
          key: searchStringFromTaskBuilder(
            this._tasks,
            this.searchType,
            this._includedIndexes,
            maxNameLength
          ),
          limit: 15,
          threshold: 0.2
        }
      );
      this.focusIndex = 0;
      B(template(this), this);
    }
    onKeyDown(e2) {
      if (this.searchResults.length === 0) {
        return;
      }
      const keyname = `${e2.shiftKey ? "shift-" : ""}${e2.ctrlKey ? "ctrl-" : ""}${e2.metaKey ? "meta-" : ""}${e2.altKey ? "alt-" : ""}${e2.key}`;
      switch (keyname) {
        case "ArrowDown":
          this.focusIndex = (this.focusIndex + 1) % this.searchResults.length;
          e2.stopPropagation();
          e2.preventDefault();
          break;
        case "ArrowUp":
          this.focusIndex = (this.focusIndex - 1 + this.searchResults.length) % this.searchResults.length;
          e2.stopPropagation();
          e2.preventDefault();
          break;
        case "Enter":
          if (this.searchResults.length === 0) {
            return;
          }
          this.selectSearchResult(this.focusIndex);
          e2.stopPropagation();
          e2.preventDefault();
          break;
        default:
          break;
      }
      B(template(this), this);
    }
    selectSearchResult(index) {
      const taskIndex = this._tasks.indexOf(this.searchResults[index].obj);
      this.dispatchEvent(
        new CustomEvent("task-change", {
          bubbles: true,
          detail: taskIndex
        })
      );
      this.searchResults = [];
      B(template(this), this);
    }
    searchInputReceivedFocus() {
      this.dispatchEvent(
        new CustomEvent("task-focus", {
          bubbles: true
        })
      );
    }
    setKeyboardFocusToInput(searchType) {
      this.searchType = searchType;
      const inputControl = this.querySelector("input");
      inputControl.focus();
      inputControl.select();
    }
    lossOfFocus() {
      this.searchResults = [];
      B(template(this), this);
    }
    set tasks(tasks) {
      this._tasks = tasks;
    }
    set includedIndexes(v2) {
      this._includedIndexes = new Set(v2);
    }
  };
  customElements.define("task-search-control", TaskSearchControl);

  // src/dependencies/dependencies-panel.ts
  var depDisplayName = {
    pred: "Predecessors",
    succ: "Successors"
  };
  var kindTemplate = (dependenciesControl, depType, indexes) => x`
  <tr>
    <th>${depDisplayName[depType]}</th>
    <th></th>
  </tr>
  ${indexes.map((taskIndex) => {
    const task = dependenciesControl.tasks[taskIndex];
    return x`<tr>
      <td>${task.name}</td>
      <td>
        <button
          class="delete"
          title="Delete the dependency on ${task.name}"
          @click=${() => dependenciesControl.deleteDep(taskIndex, depType)}
        >
          ✗
        </button>
      </td>
    </tr>`;
  })}
  <tr>
    <td></td>
    <td>
      <button
        @click=${() => dependenciesControl.addDep(depType)}
        title="Add dependency."
      >
        +
      </button>
    </td>
  </tr>
`;
  var template2 = (dependenciesControl) => x`
  <table>
    ${kindTemplate(
    dependenciesControl,
    "pred",
    dependenciesControl.predIndexes
  )}
    ${kindTemplate(
    dependenciesControl,
    "succ",
    dependenciesControl.succIndexes
  )}
  </table>
`;
  var DependenciesPanel = class extends HTMLElement {
    tasks = [];
    predIndexes = [];
    succIndexes = [];
    connectedCallback() {
      B(template2(this), this);
    }
    setTasksAndIndices(tasks, predIndexes, succIndexes) {
      this.tasks = tasks;
      this.predIndexes = predIndexes;
      this.succIndexes = succIndexes;
      B(template2(this), this);
    }
    deleteDep(taskIndex, depType) {
      this.dispatchEvent(
        new CustomEvent("delete-dependency", {
          bubbles: true,
          detail: {
            taskIndex,
            depType
          }
        })
      );
    }
    addDep(depType) {
      this.dispatchEvent(
        new CustomEvent("add-dependency", {
          bubbles: true,
          detail: {
            taskIndex: -1,
            depType
          }
        })
      );
    }
  };
  customElements.define("dependencies-panel", DependenciesPanel);

  // src/ops/resources.ts
  var AddResourceSubOp = class {
    key;
    // Maps an index of a Task to a value for the given resource key.
    taskResourceValues;
    constructor(name, taskResourceValues = /* @__PURE__ */ new Map()) {
      this.key = name;
      this.taskResourceValues = taskResourceValues;
    }
    applyTo(plan) {
      const foundMatch = plan.getResourceDefinition(this.key);
      if (foundMatch !== void 0) {
        return error(`${this.key} already exists as a Resource`);
      }
      plan.setResourceDefinition(this.key, new ResourceDefinition());
      plan.chart.Vertices.forEach((task, index) => {
        task.setResource(
          this.key,
          this.taskResourceValues.get(index) || DEFAULT_RESOURCE_VALUE
        );
      });
      return ok({ plan, inverse: this.inverse() });
    }
    inverse() {
      return new DeleteResourceSupOp(this.key);
    }
  };
  var DeleteResourceSupOp = class {
    key;
    constructor(name) {
      this.key = name;
    }
    applyTo(plan) {
      const resourceDefinition = plan.getResourceDefinition(this.key);
      if (resourceDefinition === void 0) {
        return error(
          `The resource with name ${this.key} does not exist and can't be deleted.`
        );
      }
      plan.deleteMetricDefinition(this.key);
      const taskIndexToDeletedResourceValue = /* @__PURE__ */ new Map();
      plan.chart.Vertices.forEach((task, index) => {
        const value = task.getResource(this.key) || DEFAULT_RESOURCE_VALUE;
        taskIndexToDeletedResourceValue.set(index, value);
        task.deleteResource(this.key);
      });
      return ok({
        plan,
        inverse: this.inverse(taskIndexToDeletedResourceValue)
      });
    }
    inverse(resourceValuesForDeletedResourceKey) {
      return new AddResourceSubOp(this.key, resourceValuesForDeletedResourceKey);
    }
  };
  var AddResourceOptionSubOp = class {
    key;
    value;
    indicesOfTasksToChange = [];
    constructor(key, value, indicesOfTasksToChange = []) {
      this.key = key;
      this.value = value;
      this.indicesOfTasksToChange = indicesOfTasksToChange;
    }
    applyTo(plan) {
      const definition = plan.getResourceDefinition(this.key);
      if (definition === void 0) {
        return error(`${this.key} doesn't exist as a Resource`);
      }
      const existingIndex = definition.values.findIndex(
        (value) => value === this.value
      );
      if (existingIndex !== -1) {
        return error(
          `${this.value} already exists as a value in the Resource ${this.key}.`
        );
      }
      definition.values.push(this.value);
      this.indicesOfTasksToChange.forEach((taskIndex) => {
        plan.chart.Vertices[taskIndex].setResource(this.key, this.value);
      });
      return ok({ plan, inverse: this.inverse() });
    }
    inverse() {
      return new DeleteResourceOptionSubOp(
        this.key,
        this.value,
        this.indicesOfTasksToChange
      );
    }
  };
  var DeleteResourceOptionSubOp = class {
    key;
    value;
    indicesOfTasksToChange;
    constructor(key, value, indicesOfTasksToChange = []) {
      this.key = key;
      this.value = value;
      this.indicesOfTasksToChange = indicesOfTasksToChange;
    }
    applyTo(plan) {
      const definition = plan.getResourceDefinition(this.key);
      if (definition === void 0) {
        return error(`${this.key} doesn't exist as a Resource`);
      }
      const valueIndex = definition.values.findIndex(
        (value) => value === this.value
      );
      if (valueIndex === -1) {
        return error(
          `${this.value} does not exist as a value in the Resource ${this.key}.`
        );
      }
      if (definition.values.length === 1) {
        return error(
          `Resources must have at least one value. ${this.value} only has one value, so it can't be deleted. `
        );
      }
      definition.values.splice(valueIndex, 1);
      const indicesOfTasksWithMatchingResourceValues = [];
      plan.chart.Vertices.forEach((task, index) => {
        const resourceValue = task.getResource(this.key);
        if (resourceValue === void 0) {
          return;
        }
        task.setResource(this.key, definition.values[0]);
        indicesOfTasksWithMatchingResourceValues.push(index);
      });
      return ok({
        plan,
        inverse: this.inverse(indicesOfTasksWithMatchingResourceValues)
      });
    }
    inverse(indicesOfTasksToChange) {
      return new AddResourceOptionSubOp(
        this.key,
        this.value,
        indicesOfTasksToChange
      );
    }
  };
  var SetResourceValueSubOp = class _SetResourceValueSubOp {
    key;
    value;
    taskIndex;
    constructor(key, value, taskIndex) {
      this.key = key;
      this.value = value;
      this.taskIndex = taskIndex;
    }
    applyTo(plan) {
      const foundMatch = plan.getResourceDefinition(this.key);
      if (foundMatch === void 0) {
        return error(`${this.key} does not exist as a Resource`);
      }
      const foundValueMatch = foundMatch.values.findIndex((v2) => {
        return v2 === this.value;
      });
      if (foundValueMatch === -1) {
        return error(`${this.key} does not have a value of ${this.value}`);
      }
      if (this.taskIndex < 0 || this.taskIndex >= plan.chart.Vertices.length) {
        return error(`There is no Task at index ${this.taskIndex}`);
      }
      const task = plan.chart.Vertices[this.taskIndex];
      const oldValue = task.getResource(this.key);
      task.setResource(this.key, this.value);
      return ok({ plan, inverse: this.inverse(oldValue) });
    }
    inverse(oldValue) {
      return new _SetResourceValueSubOp(this.key, oldValue, this.taskIndex);
    }
  };
  function AddResourceOp(name) {
    return new Op([new AddResourceSubOp(name)]);
  }
  function AddResourceOptionOp(key, value) {
    return new Op([new AddResourceOptionSubOp(key, value)]);
  }
  function SetResourceValueOp(key, value, taskIndex) {
    return new Op([new SetResourceValueSubOp(key, value, taskIndex)]);
  }

  // src/renderer/scale/point.ts
  var Point = class _Point {
    x;
    y;
    constructor(x2, y2) {
      this.x = x2;
      this.y = y2;
    }
    add(x2, y2) {
      this.x += x2;
      this.y += y2;
      return this;
    }
    sum(rhs) {
      return new _Point(this.x + rhs.x, this.y + rhs.y);
    }
    equal(rhs) {
      return this.x === rhs.x && this.y === rhs.y;
    }
    set(rhs) {
      this.x = rhs.x;
      this.y = rhs.y;
      return this;
    }
    dup() {
      return new _Point(this.x, this.y);
    }
  };

  // src/renderer/dividermove/dividermove.ts
  var DIVIDER_MOVE_EVENT = "divider_move";
  var RESIZING_CLASS = "resizing";
  var getPageRect = (ele) => {
    const viewportRect = ele.getBoundingClientRect();
    return {
      top: viewportRect.top + window.scrollY,
      left: viewportRect.left + window.scrollX,
      width: viewportRect.width,
      height: viewportRect.height
    };
  };
  var DividerMove = class {
    /** The point where dragging started, in Page coordinates. */
    begin = null;
    /** The dimensions of the parent element in Page coordinates as of mousedown
     * on the divider.. */
    parentRect = null;
    /** The current mouse position in Page coordinates. */
    currentMoveLocation = new Point(0, 0);
    /** The last mouse position in Page coordinates reported via CustomEvent. */
    lastMoveSent = new Point(0, 0);
    /** The parent element that contains the divider. */
    parent;
    /** The divider element to be dragged across the parent element. */
    divider;
    /** The handle of the window.setInterval(). */
    internvalHandle = 0;
    /** The type of divider, either vertical ("column"), or horizontal ("row"). */
    dividerType;
    constructor(parent, divider, dividerType = "column") {
      this.parent = parent;
      this.divider = divider;
      this.dividerType = dividerType;
      this.divider.addEventListener("mousedown", this.mousedown.bind(this));
    }
    detach() {
      this.parent.removeEventListener("mousemove", this.mousemove.bind(this));
      this.divider.removeEventListener("mousedown", this.mousedown.bind(this));
      this.parent.removeEventListener("mouseup", this.mouseup.bind(this));
      this.parent.removeEventListener("mouseleave", this.mouseleave.bind(this));
      window.clearInterval(this.internvalHandle);
    }
    onTimeout() {
      if (!this.currentMoveLocation.equal(this.lastMoveSent)) {
        let diffPercent = 0;
        if (this.dividerType === "column") {
          diffPercent = 100 * (this.currentMoveLocation.x - this.parentRect.left) / this.parentRect.width;
        } else {
          diffPercent = 100 * (this.currentMoveLocation.y - this.parentRect.top) / this.parentRect.height;
        }
        diffPercent = clamp(diffPercent, 5, 95);
        this.parent.dispatchEvent(
          new CustomEvent(DIVIDER_MOVE_EVENT, {
            detail: {
              before: diffPercent,
              after: 100 - diffPercent
            }
          })
        );
        this.lastMoveSent.set(this.currentMoveLocation);
      }
    }
    mousemove(e2) {
      if (this.begin === null) {
        return;
      }
      this.currentMoveLocation.x = e2.pageX;
      this.currentMoveLocation.y = e2.pageY;
    }
    mousedown(e2) {
      this.internvalHandle = window.setInterval(this.onTimeout.bind(this), 16);
      this.parentRect = getPageRect(this.parent);
      this.parent.classList.add(RESIZING_CLASS);
      this.parent.addEventListener("mousemove", this.mousemove.bind(this));
      this.parent.addEventListener("mouseup", this.mouseup.bind(this));
      this.parent.addEventListener("mouseleave", this.mouseleave.bind(this));
      this.begin = new Point(e2.pageX, e2.pageY);
    }
    mouseup(e2) {
      if (this.begin === null) {
        return;
      }
      this.finished(new Point(e2.pageX, e2.pageY));
    }
    mouseleave(e2) {
      if (this.begin === null) {
        return;
      }
      this.finished(new Point(e2.pageX, e2.pageY));
    }
    finished(end) {
      window.clearInterval(this.internvalHandle);
      this.parent.classList.remove(RESIZING_CLASS);
      this.parent.removeEventListener("mousemove", this.mousemove.bind(this));
      this.parent.removeEventListener("mouseup", this.mouseup.bind(this));
      this.parent.removeEventListener("mouseleave", this.mouseleave.bind(this));
      this.currentMoveLocation = end;
      this.onTimeout();
      this.begin = null;
      this.currentMoveLocation = new Point(0, 0);
      this.lastMoveSent = new Point(0, 0);
    }
  };

  // src/renderer/mousedrag/mousedrag.ts
  var DRAG_RANGE_EVENT = "dragrange";
  var MouseDrag = class {
    begin = null;
    currentMoveLocation = new Point(0, 0);
    lastMoveSent = new Point(0, 0);
    ele;
    internvalHandle = 0;
    constructor(ele) {
      this.ele = ele;
      ele.addEventListener("mousemove", this.mousemove.bind(this));
      ele.addEventListener("mousedown", this.mousedown.bind(this));
      ele.addEventListener("mouseup", this.mouseup.bind(this));
      ele.addEventListener("mouseleave", this.mouseleave.bind(this));
    }
    detach() {
      this.ele.removeEventListener("mousemove", this.mousemove.bind(this));
      this.ele.removeEventListener("mousedown", this.mousedown.bind(this));
      this.ele.removeEventListener("mouseup", this.mouseup.bind(this));
      this.ele.removeEventListener("mouseleave", this.mouseleave.bind(this));
      window.clearInterval(this.internvalHandle);
    }
    onTimeout() {
      if (!this.currentMoveLocation.equal(this.lastMoveSent)) {
        this.ele.dispatchEvent(
          new CustomEvent(DRAG_RANGE_EVENT, {
            detail: {
              begin: this.begin.dup(),
              end: this.currentMoveLocation.dup()
            }
          })
        );
        this.lastMoveSent.set(this.currentMoveLocation);
      }
    }
    mousemove(e2) {
      if (this.begin === null) {
        return;
      }
      this.currentMoveLocation.x = e2.offsetX;
      this.currentMoveLocation.y = e2.offsetY;
    }
    mousedown(e2) {
      this.internvalHandle = window.setInterval(this.onTimeout.bind(this), 16);
      this.begin = new Point(e2.offsetX, e2.offsetY);
    }
    mouseup(e2) {
      this.finished(new Point(e2.offsetX, e2.offsetY));
    }
    mouseleave(e2) {
      if (this.begin === null) {
        return;
      }
      this.finished(new Point(e2.offsetX, e2.offsetY));
    }
    finished(end) {
      window.clearInterval(this.internvalHandle);
      this.currentMoveLocation = end;
      this.onTimeout();
      this.begin = null;
      this.currentMoveLocation = new Point(0, 0);
      this.lastMoveSent = new Point(0, 0);
    }
  };

  // src/renderer/mousemove/mousemove.ts
  var MouseMove = class {
    currentMoveLocation = new Point(0, 0);
    lastReadLocation = new Point(0, 0);
    ele;
    constructor(ele) {
      this.ele = ele;
      ele.addEventListener("mousemove", this.mousemove.bind(this));
    }
    detach() {
      this.ele.removeEventListener("mousemove", this.mousemove.bind(this));
    }
    mousemove(e2) {
      this.currentMoveLocation.x = e2.offsetX;
      this.currentMoveLocation.y = e2.offsetY;
    }
    /** Returns a Point if the mouse had moved since the last read, otherwise
     * returns null.
     */
    readLocation() {
      if (this.currentMoveLocation.equal(this.lastReadLocation)) {
        return null;
      }
      this.lastReadLocation.set(this.currentMoveLocation);
      return this.lastReadLocation.dup();
    }
  };

  // src/renderer/range/range.ts
  var MIN_DISPLAY_RANGE = 7;
  var DisplayRange = class {
    _begin;
    _end;
    constructor(begin, end) {
      this._begin = begin;
      this._end = end;
      if (this._begin > this._end) {
        [this._end, this._begin] = [this._begin, this._end];
      }
      if (this._end - this._begin < MIN_DISPLAY_RANGE) {
        this._end = this._begin + MIN_DISPLAY_RANGE;
      }
    }
    in(x2) {
      return x2 >= this._begin && x2 <= this._end;
    }
    get begin() {
      return this._begin;
    }
    get end() {
      return this._end;
    }
    get rangeInDays() {
      return this._end - this._begin;
    }
  };

  // src/chart/filter/filter.ts
  var filter = (chart, filterFunc, emphasizedTasks, spans, labels, selectedTaskIndex) => {
    const vret = validateChart(chart);
    if (!vret.ok) {
      return vret;
    }
    const topologicalOrder = vret.value;
    if (filterFunc === null) {
      const fromFilteredIndexToOriginalIndex2 = /* @__PURE__ */ new Map();
      for (let index = 0; index < chart.Vertices.length; index++) {
        fromFilteredIndexToOriginalIndex2.set(index, index);
      }
      return ok({
        chartLike: chart,
        displayOrder: vret.value,
        emphasizedTasks,
        spans,
        labels,
        fromFilteredIndexToOriginalIndex: fromFilteredIndexToOriginalIndex2,
        fromOriginalIndexToFilteredIndex: fromFilteredIndexToOriginalIndex2,
        selectedTaskIndex
      });
    }
    const tasks = [];
    const edges = [];
    const displayOrder = [];
    const filteredSpans = [];
    const filteredLabels = [];
    const fromFilteredIndexToOriginalIndex = /* @__PURE__ */ new Map();
    const fromOriginalToFilteredIndex = /* @__PURE__ */ new Map();
    chart.Vertices.forEach((task, originalIndex) => {
      if (filterFunc(task, originalIndex)) {
        tasks.push(task);
        filteredSpans.push(spans[originalIndex]);
        filteredLabels.push(labels[originalIndex]);
        const newIndex = tasks.length - 1;
        fromOriginalToFilteredIndex.set(originalIndex, newIndex);
        fromFilteredIndexToOriginalIndex.set(newIndex, originalIndex);
      }
    });
    chart.Edges.forEach((directedEdge) => {
      if (!fromOriginalToFilteredIndex.has(directedEdge.i) || !fromOriginalToFilteredIndex.has(directedEdge.j)) {
        return;
      }
      edges.push(
        new DirectedEdge(
          fromOriginalToFilteredIndex.get(directedEdge.i),
          fromOriginalToFilteredIndex.get(directedEdge.j)
        )
      );
    });
    topologicalOrder.forEach((originalTaskIndex) => {
      const task = chart.Vertices[originalTaskIndex];
      if (!filterFunc(task, originalTaskIndex)) {
        return;
      }
      displayOrder.push(fromOriginalToFilteredIndex.get(originalTaskIndex));
    });
    const updatedEmphasizedTasks = emphasizedTasks.map(
      (originalTaskIndex) => fromOriginalToFilteredIndex.get(originalTaskIndex)
    );
    return ok({
      chartLike: {
        Edges: edges,
        Vertices: tasks
      },
      displayOrder,
      emphasizedTasks: updatedEmphasizedTasks,
      spans: filteredSpans,
      labels: filteredLabels,
      fromFilteredIndexToOriginalIndex,
      fromOriginalIndexToFilteredIndex: fromOriginalToFilteredIndex,
      selectedTaskIndex: fromOriginalToFilteredIndex.get(selectedTaskIndex) || -1
    });
  };

  // src/renderer/kd/kd.ts
  var defaultMetric = (a2, b2) => (a2.x - b2.x) * (a2.x - b2.x) + (a2.y - b2.y) * (a2.y - b2.y);
  var defaultDimensions = ["x", "y"];
  var Node = class {
    obj;
    left = null;
    right = null;
    parent;
    dimension;
    constructor(obj, dimension, parent) {
      this.obj = obj;
      this.parent = parent;
      this.dimension = dimension;
    }
  };
  var KDTree = class {
    dimensions;
    root;
    metric;
    /**
     * The constructor.
     *
     * @param {Array} points - An array of points, something with the shape
     *     {x:x, y:y}.
     * @param {Array} dimensions - The dimensions to use in our points, for
     *     example ['x', 'y'].
     * @param {function} metric - A function that calculates the distance
     *     between two points.
     */
    constructor(points) {
      this.dimensions = defaultDimensions;
      this.metric = defaultMetric;
      this.root = this._buildTree(points, 0, null);
    }
    /**
     * Find the nearest Node to the given point.
     *
     * @param {Object} point - {x:x, y:y}
     * @returns {Object} The closest point object passed into the constructor.
     *     We pass back the original object since it might have extra info
     *     beyond just the coordinates, such as trace id.
     */
    nearest(point) {
      let bestNode = {
        node: this.root,
        distance: Number.MAX_VALUE
      };
      const saveNode = (node, distance) => {
        bestNode = {
          node,
          distance
        };
      };
      const nearestSearch = (node) => {
        const dimension = this.dimensions[node.dimension];
        const ownDistance = this.metric(point, node.obj);
        if (node.right === null && node.left === null) {
          if (ownDistance < bestNode.distance) {
            saveNode(node, ownDistance);
          }
          return;
        }
        let bestChild = null;
        let otherChild = null;
        if (node.right === null) {
          bestChild = node.left;
        } else if (node.left === null) {
          bestChild = node.right;
        } else if (point[dimension] < node.obj[dimension]) {
          bestChild = node.left;
          otherChild = node.right;
        } else {
          bestChild = node.right;
          otherChild = node.left;
        }
        nearestSearch(bestChild);
        if (ownDistance < bestNode.distance) {
          saveNode(node, ownDistance);
        }
        const pointOnHyperplane = {
          x: 0,
          y: 0
        };
        for (let i2 = 0; i2 < this.dimensions.length; i2++) {
          if (i2 === node.dimension) {
            pointOnHyperplane[this.dimensions[i2]] = point[this.dimensions[i2]];
          } else {
            pointOnHyperplane[this.dimensions[i2]] = node.obj[this.dimensions[i2]];
          }
        }
        if (otherChild !== null && this.metric(pointOnHyperplane, node.obj) < bestNode.distance) {
          nearestSearch(otherChild);
        }
      };
      if (this.root) {
        nearestSearch(this.root);
      }
      return bestNode.node.obj;
    }
    /**
     * Builds the from parent Node on down.
     *
     * @param {Array} points - An array of {x:x, y:y}.
     * @param {Number} depth - The current depth from the root node.
     * @param {Node} parent - The parent Node.
     */
    _buildTree(points, depth, parent) {
      const dim = depth % this.dimensions.length;
      if (points.length === 0) {
        return null;
      }
      if (points.length === 1) {
        return new Node(points[0], dim, parent);
      }
      points.sort((a2, b2) => a2[this.dimensions[dim]] - b2[this.dimensions[dim]]);
      const median = Math.floor(points.length / 2);
      const node = new Node(points[median], dim, parent);
      node.left = this._buildTree(points.slice(0, median), depth + 1, node);
      node.right = this._buildTree(points.slice(median + 1), depth + 1, node);
      return node;
    }
  };

  // src/renderer/scale/scale.ts
  var makeOdd = (n2) => {
    if (n2 % 2 === 0) {
      return n2 + 1;
    }
    return n2;
  };
  var Scale = class {
    dayWidthPx;
    rowHeightPx;
    blockSizePx;
    taskHeightPx;
    lineWidthPx;
    marginSizePx;
    timelineHeightPx;
    origin;
    totalNumberOfDays;
    groupByColumnWidthPx;
    timelineOrigin;
    tasksOrigin;
    groupByOrigin;
    tasksClipRectOrigin;
    constructor(opts, canvasWidthPx, totalNumberOfDays, maxGroupNameLength = 0) {
      this.totalNumberOfDays = totalNumberOfDays;
      this.groupByColumnWidthPx = maxGroupNameLength * opts.fontSizePx;
      this.blockSizePx = Math.floor(opts.fontSizePx / 3);
      this.taskHeightPx = makeOdd(Math.floor(this.blockSizePx * 3 / 4));
      this.lineWidthPx = makeOdd(Math.floor(this.taskHeightPx / 3));
      const milestoneRadius = Math.ceil(this.taskHeightPx / 2) + this.lineWidthPx;
      this.marginSizePx = milestoneRadius;
      this.timelineHeightPx = opts.hasTimeline ? Math.ceil(opts.fontSizePx * 4 / 3) : 0;
      this.timelineOrigin = new Point(milestoneRadius, 0);
      this.groupByOrigin = new Point(0, milestoneRadius + this.timelineHeightPx);
      let beginOffset = 0;
      if (opts.displayRange === null || opts.displayRangeUsage === "highlight") {
        this.dayWidthPx = (canvasWidthPx - this.groupByColumnWidthPx - 2 * this.marginSizePx) / totalNumberOfDays;
        this.origin = new Point(0, 0);
      } else {
        this.dayWidthPx = (canvasWidthPx - this.groupByColumnWidthPx - 2 * this.marginSizePx) / opts.displayRange.rangeInDays;
        beginOffset = Math.floor(
          this.dayWidthPx * opts.displayRange.begin + this.marginSizePx
        );
        this.origin = new Point(-beginOffset + this.marginSizePx, 0);
      }
      this.tasksOrigin = new Point(
        this.groupByColumnWidthPx - beginOffset + milestoneRadius,
        this.timelineHeightPx + milestoneRadius
      );
      this.tasksClipRectOrigin = new Point(
        this.groupByColumnWidthPx,
        this.timelineHeightPx
      );
      if (opts.hasText) {
        this.rowHeightPx = 6 * this.blockSizePx;
      } else {
        this.rowHeightPx = 1.1 * this.blockSizePx;
      }
    }
    /** The height of the chart. Note that it's not constrained by the canvas. */
    height(maxRows) {
      return maxRows * this.rowHeightPx + this.timelineHeightPx + 2 * this.marginSizePx;
    }
    dayRowFromPoint(point) {
      return {
        day: clamp(
          Math.floor(
            (window.devicePixelRatio * point.x - this.origin.x - this.marginSizePx - this.groupByColumnWidthPx) / this.dayWidthPx
          ),
          0,
          this.totalNumberOfDays
        ),
        row: Math.floor(
          (window.devicePixelRatio * point.y - this.origin.y - this.marginSizePx - this.timelineHeightPx) / this.rowHeightPx
        )
      };
    }
    /** The top left corner of the bounding box for a single task. */
    taskRowEnvelopeStart(row, day) {
      return this.origin.sum(
        new Point(
          Math.floor(
            day * this.dayWidthPx + this.marginSizePx + this.groupByColumnWidthPx
          ),
          Math.floor(
            row * this.rowHeightPx + this.marginSizePx + this.timelineHeightPx
          )
        )
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    groupRowEnvelopeStart(row, day) {
      return this.groupByOrigin.sum(
        new Point(
          0,
          row * this.rowHeightPx + this.marginSizePx + this.timelineHeightPx
        )
      );
    }
    groupHeaderStart() {
      return this.origin.sum(new Point(this.marginSizePx, this.marginSizePx));
    }
    timeEnvelopeStart(day) {
      return this.origin.sum(
        new Point(
          day * this.dayWidthPx + this.marginSizePx + this.groupByColumnWidthPx,
          0
        )
      );
    }
    /** Returns the coordinate of the item */
    feature(row, day, coord) {
      switch (coord) {
        case 0 /* taskLineStart */:
        case 4 /* verticalArrowDestTop */:
        case 7 /* verticalArrowStart */:
          return this.taskRowEnvelopeStart(row, day).add(
            0,
            this.rowHeightPx - this.blockSizePx
          );
        case 5 /* verticalArrowDestBottom */:
          return this.taskRowEnvelopeStart(row, day).add(0, this.rowHeightPx);
        case 1 /* textStart */:
          return this.taskRowEnvelopeStart(row, day).add(
            this.blockSizePx,
            this.blockSizePx
          );
        case 2 /* groupTextStart */:
          return this.groupRowEnvelopeStart(row, day).add(
            this.blockSizePx,
            this.blockSizePx
          );
        case 3 /* percentStart */:
          return this.taskRowEnvelopeStart(row, day).add(
            0,
            this.rowHeightPx - this.lineWidthPx
          );
        case 6 /* horizontalArrowDest */:
        case 8 /* horizontalArrowStart */:
          return this.taskRowEnvelopeStart(row, day).add(
            0,
            Math.floor(this.rowHeightPx - 0.5 * this.blockSizePx) - 1
          );
        case 9 /* verticalArrowDestToMilestoneTop */:
          return this.feature(row, day, 4 /* verticalArrowDestTop */).add(
            0,
            -1 * this.metric(4 /* milestoneDiameter */)
          );
        case 10 /* verticalArrowDestToMilestoneBottom */:
          return this.feature(row, day, 4 /* verticalArrowDestTop */).add(
            0,
            this.metric(4 /* milestoneDiameter */)
          );
        case 11 /* horizontalArrowDestToMilestone */:
          return this.feature(row, day, 6 /* horizontalArrowDest */).add(
            -1 * this.metric(4 /* milestoneDiameter */),
            -1 * this.metric(4 /* milestoneDiameter */)
          );
        case 12 /* verticalArrowStartFromMilestoneTop */:
          return this.feature(row, day, 7 /* verticalArrowStart */).add(
            0,
            -1 * this.metric(4 /* milestoneDiameter */)
          );
        case 13 /* verticalArrowStartFromMilestoneBottom */:
          return this.feature(row, day, 7 /* verticalArrowStart */).add(
            0,
            this.metric(4 /* milestoneDiameter */)
          );
        case 14 /* horizontalArrowStartFromMilestone */:
          return this.feature(row, day, 8 /* horizontalArrowStart */).add(
            this.metric(4 /* milestoneDiameter */),
            0
          );
        case 16 /* taskEnvelopeTop */:
          return this.taskRowEnvelopeStart(row, day);
        case 15 /* groupEnvelopeStart */:
          return this.groupRowEnvelopeStart(row, day);
        case 19 /* timeMarkStart */:
          return this.timeEnvelopeStart(day);
        case 20 /* timeMarkEnd */:
          return this.timeEnvelopeStart(day).add(0, this.rowHeightPx * (row + 1));
        case 21 /* timeTextStart */:
          return this.timeEnvelopeStart(day).add(this.blockSizePx, 0);
        case 22 /* groupTitleTextStart */:
          return this.groupHeaderStart().add(this.blockSizePx, 0);
        case 17 /* displayRangeTop */:
          return this.timeEnvelopeStart(day);
        case 18 /* taskRowBottom */:
          return this.taskRowEnvelopeStart(row + 1, day);
        case 23 /* tasksClipRectOrigin */:
          return this.tasksClipRectOrigin;
        case 24 /* groupByOrigin */:
          return this.groupByOrigin;
        default:
          coord;
          return new Point(0, 0);
      }
    }
    metric(feature) {
      switch (feature) {
        case 0 /* taskLineHeight */:
          return this.taskHeightPx;
        case 1 /* percentHeight */:
          return this.lineWidthPx;
        case 2 /* arrowHeadHeight */:
          return this.taskHeightPx;
        case 3 /* arrowHeadWidth */:
          return Math.ceil(this.taskHeightPx);
        case 4 /* milestoneDiameter */:
          return Math.ceil(this.taskHeightPx);
        case 5 /* lineDashLine */:
          return this.blockSizePx;
        case 6 /* lineDashGap */:
          return this.blockSizePx;
        case 7 /* textXOffset */:
          return this.blockSizePx;
        case 8 /* rowHeight */:
          return this.rowHeightPx;
        default:
          feature;
          return 0;
      }
    }
  };

  // src/renderer/renderer.ts
  var verticalArrowStartFeatureFromTaskDuration = (task, direction) => {
    if (task.duration === 0) {
      if (direction === "down") {
        return 13 /* verticalArrowStartFromMilestoneBottom */;
      }
      return 12 /* verticalArrowStartFromMilestoneTop */;
    } else {
      return 7 /* verticalArrowStart */;
    }
  };
  var verticalArrowDestFeatureFromTaskDuration = (task, direction) => {
    if (task.duration === 0) {
      if (direction === "down") {
        return 9 /* verticalArrowDestToMilestoneTop */;
      }
      return 10 /* verticalArrowDestToMilestoneBottom */;
    } else {
      if (direction === "down") {
        return 4 /* verticalArrowDestTop */;
      }
      return 5 /* verticalArrowDestBottom */;
    }
  };
  var horizontalArrowDestFeatureFromTaskDuration = (task) => {
    if (task.duration === 0) {
      return 11 /* horizontalArrowDestToMilestone */;
    } else {
      return 6 /* horizontalArrowDest */;
    }
  };
  function suggestedCanvasHeight(canvas, spans, opts, maxRows) {
    if (!opts.hasTasks) {
      maxRows = 0;
    }
    return new Scale(
      opts,
      canvas.width,
      spans[spans.length - 1].finish + 1
    ).height(maxRows);
  }
  function renderTasksToCanvas(parent, canvas, ctx, plan, spans, opts, overlay = null) {
    const vret = validateChart(plan.chart);
    if (!vret.ok) {
      return vret;
    }
    const taskLocations = [];
    const originalLabels = plan.chart.Vertices.map(
      (task, taskIndex) => opts.taskLabel(taskIndex)
    );
    const fret = filter(
      plan.chart,
      opts.filterFunc,
      opts.taskEmphasize,
      spans,
      originalLabels,
      opts.selectedTaskIndex
    );
    if (!fret.ok) {
      return fret;
    }
    const chartLike = fret.value.chartLike;
    const labels = fret.value.labels;
    const resourceDefinition = plan.getResourceDefinition(opts.groupByResource);
    const fromFilteredIndexToOriginalIndex = fret.value.fromFilteredIndexToOriginalIndex;
    const fromOriginalIndexToFilteredIndex = fret.value.fromOriginalIndexToFilteredIndex;
    let lastSelectedTaskIndex = opts.selectedTaskIndex;
    const emphasizedTasks = new Set(fret.value.emphasizedTasks);
    spans = fret.value.spans;
    let maxGroupNameLength = 0;
    if (opts.groupByResource !== "" && opts.hasText) {
      maxGroupNameLength = opts.groupByResource.length;
      if (resourceDefinition !== void 0) {
        resourceDefinition.values.forEach((value) => {
          maxGroupNameLength = Math.max(maxGroupNameLength, value.length);
        });
      }
    }
    const totalNumberOfRows = spans.length;
    const totalNumberOfDays = spans[spans.length - 1].finish;
    const scale = new Scale(
      opts,
      canvas.width,
      totalNumberOfDays + 1,
      maxGroupNameLength
    );
    const taskLineHeight = scale.metric(0 /* taskLineHeight */);
    const diamondDiameter = scale.metric(4 /* milestoneDiameter */);
    const percentHeight = scale.metric(1 /* percentHeight */);
    const arrowHeadHeight = scale.metric(2 /* arrowHeadHeight */);
    const arrowHeadWidth = scale.metric(3 /* arrowHeadWidth */);
    const daysWithTimeMarkers = /* @__PURE__ */ new Set();
    const tiret = taskIndexToRowFromGroupBy(
      opts,
      resourceDefinition,
      chartLike,
      fret.value.displayOrder
    );
    if (!tiret.ok) {
      return tiret;
    }
    const taskIndexToRow = tiret.value.taskIndexToRow;
    const rowRanges = tiret.value.rowRanges;
    clearCanvas(ctx, opts, canvas);
    setFontSize(ctx, opts);
    const clipRegion = new Path2D();
    const clipOrigin = scale.feature(0, 0, 23 /* tasksClipRectOrigin */);
    const clipWidth = canvas.width - clipOrigin.x;
    clipRegion.rect(clipOrigin.x, 0, clipWidth, canvas.height);
    if (0) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.stroke(clipRegion);
    }
    ctx.fillStyle = opts.colors.onSurface;
    ctx.strokeStyle = opts.colors.onSurface;
    if (rowRanges !== null) {
      if (opts.hasTasks) {
        drawSwimLaneHighlights(
          ctx,
          scale,
          rowRanges,
          totalNumberOfDays,
          opts.colors.groupColor
        );
      }
      if (resourceDefinition !== void 0 && opts.hasText) {
        drawSwimLaneLabels(ctx, opts, resourceDefinition, scale, rowRanges);
      }
    }
    ctx.fillStyle = opts.colors.onSurface;
    ctx.strokeStyle = opts.colors.onSurface;
    ctx.save();
    ctx.clip(clipRegion);
    const taskIndexToTaskHighlightCorners = /* @__PURE__ */ new Map();
    chartLike.Vertices.forEach((task, taskIndex) => {
      const row = taskIndexToRow.get(taskIndex);
      const span = spans[taskIndex];
      const taskStart = scale.feature(row, span.start, 0 /* taskLineStart */);
      const taskEnd = scale.feature(row, span.finish, 0 /* taskLineStart */);
      ctx.fillStyle = opts.colors.onSurfaceMuted;
      ctx.strokeStyle = opts.colors.onSurfaceMuted;
      if (opts.drawTimeMarkersOnTasks) {
        drawTimeMarkerAtDayToTask(
          ctx,
          row,
          span.start,
          task,
          opts,
          scale,
          daysWithTimeMarkers
        );
      }
      if (emphasizedTasks.has(taskIndex)) {
        ctx.fillStyle = opts.colors.onSurfaceHighlight;
        ctx.strokeStyle = opts.colors.onSurfaceHighlight;
      } else {
        ctx.fillStyle = opts.colors.onSurface;
        ctx.strokeStyle = opts.colors.onSurface;
      }
      const highlightTopLeft = scale.feature(
        row,
        span.start,
        16 /* taskEnvelopeTop */
      );
      const highlightBottomRight = scale.feature(
        row + 1,
        span.finish,
        16 /* taskEnvelopeTop */
      );
      taskIndexToTaskHighlightCorners.set(taskIndex, {
        topLeft: highlightTopLeft,
        bottomRight: highlightBottomRight
      });
      if (opts.hasTasks) {
        if (taskStart.x === taskEnd.x) {
          drawMilestone(ctx, taskStart, diamondDiameter, percentHeight);
        } else {
          drawTaskBar(ctx, taskStart, taskEnd, taskLineHeight);
        }
        if (taskIndex !== 0 && taskIndex !== totalNumberOfRows - 1) {
          drawTaskText(
            ctx,
            opts,
            scale,
            row,
            span,
            task,
            taskIndex,
            fromFilteredIndexToOriginalIndex.get(taskIndex),
            clipWidth,
            labels,
            taskLocations
          );
        }
      }
    });
    ctx.lineWidth = 1;
    ctx.strokeStyle = opts.colors.onSurfaceMuted;
    if (opts.hasEdges && opts.hasTasks) {
      const highlightedEdges = [];
      const normalEdges = [];
      chartLike.Edges.forEach((e2) => {
        if (emphasizedTasks.has(e2.i) && emphasizedTasks.has(e2.j)) {
          highlightedEdges.push(e2);
        } else {
          normalEdges.push(e2);
        }
      });
      ctx.strokeStyle = opts.colors.onSurfaceMuted;
      drawEdges(
        ctx,
        opts,
        normalEdges,
        spans,
        chartLike.Vertices,
        scale,
        taskIndexToRow,
        arrowHeadWidth,
        arrowHeadHeight,
        emphasizedTasks
      );
      ctx.strokeStyle = opts.colors.onSurfaceHighlight;
      drawEdges(
        ctx,
        opts,
        highlightedEdges,
        spans,
        chartLike.Vertices,
        scale,
        taskIndexToRow,
        arrowHeadWidth,
        arrowHeadHeight,
        emphasizedTasks
      );
    }
    ctx.restore();
    if (opts.displayRange !== null && opts.displayRangeUsage === "highlight") {
      if (opts.displayRange.begin > 0) {
        drawRangeOverlay(
          ctx,
          opts,
          scale,
          0,
          opts.displayRange.begin,
          totalNumberOfRows
        );
      }
      if (opts.displayRange.end < totalNumberOfDays) {
        drawRangeOverlay(
          ctx,
          opts,
          scale,
          opts.displayRange.end,
          totalNumberOfDays + 1,
          totalNumberOfRows
        );
      }
    }
    let updateHighlightFromMousePos = null;
    let selectedTaskLocation = null;
    if (overlay !== null) {
      const overlayCtx = overlay.getContext("2d");
      taskIndexToTaskHighlightCorners.forEach(
        (rc, filteredTaskIndex) => {
          const originalTaskIndex = fromFilteredIndexToOriginalIndex.get(filteredTaskIndex);
          taskLocations.push(
            {
              x: rc.bottomRight.x,
              y: rc.bottomRight.y,
              originalTaskIndex
            },
            {
              x: rc.topLeft.x,
              y: rc.topLeft.y,
              originalTaskIndex
            },
            {
              x: rc.bottomRight.x,
              y: rc.topLeft.y,
              originalTaskIndex
            },
            {
              x: rc.topLeft.x,
              y: rc.bottomRight.y,
              originalTaskIndex
            }
          );
        }
      );
      const taskLocationKDTree = new KDTree(taskLocations);
      let lastHighlightedTaskIndex = -1;
      updateHighlightFromMousePos = (point, updateType) => {
        point.x = point.x * window.devicePixelRatio;
        point.y = point.y * window.devicePixelRatio;
        const taskLocation = taskLocationKDTree.nearest(point);
        const originalTaskIndex = taskLocation.originalTaskIndex;
        if (updateType === "mousemove") {
          if (originalTaskIndex === lastHighlightedTaskIndex) {
            return originalTaskIndex;
          }
        } else {
          if (originalTaskIndex === lastSelectedTaskIndex) {
            return originalTaskIndex;
          }
        }
        if (updateType === "mousemove") {
          lastHighlightedTaskIndex = originalTaskIndex;
        } else {
          lastSelectedTaskIndex = originalTaskIndex;
        }
        overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
        let corners2 = taskIndexToTaskHighlightCorners.get(
          fromOriginalIndexToFilteredIndex.get(lastHighlightedTaskIndex)
        );
        if (corners2 !== void 0) {
          drawTaskHighlight(
            overlayCtx,
            corners2.topLeft,
            corners2.bottomRight,
            opts.colors.highlight,
            scale.metric(taskLineHeight)
          );
        }
        corners2 = taskIndexToTaskHighlightCorners.get(
          fromOriginalIndexToFilteredIndex.get(lastSelectedTaskIndex)
        );
        if (corners2 !== void 0) {
          drawSelectionHighlight(
            overlayCtx,
            corners2.topLeft,
            corners2.bottomRight,
            opts.colors.highlight
          );
        }
        return originalTaskIndex;
      };
      const corners = taskIndexToTaskHighlightCorners.get(
        fromOriginalIndexToFilteredIndex.get(lastSelectedTaskIndex)
      );
      if (corners !== void 0) {
        drawSelectionHighlight(
          overlayCtx,
          corners.topLeft,
          corners.bottomRight,
          opts.colors.highlight
        );
      }
    }
    taskIndexToTaskHighlightCorners.forEach((rc) => {
      if (selectedTaskLocation === null) {
        selectedTaskLocation = rc.topLeft;
        return;
      }
      if (rc.topLeft.y < selectedTaskLocation.y) {
        selectedTaskLocation = rc.topLeft;
      }
    });
    return ok({
      scale,
      updateHighlightFromMousePos,
      selectedTaskLocation
    });
  }
  function drawEdges(ctx, opts, edges, spans, tasks, scale, taskIndexToRow, arrowHeadWidth, arrowHeadHeight, taskHighlights) {
    edges.forEach((e2) => {
      const srcSlack = spans[e2.i];
      const dstSlack = spans[e2.j];
      const srcTask = tasks[e2.i];
      const dstTask = tasks[e2.j];
      const srcRow = taskIndexToRow.get(e2.i);
      const dstRow = taskIndexToRow.get(e2.j);
      const srcDay = srcSlack.finish;
      const dstDay = dstSlack.start;
      if (taskHighlights.has(e2.i) && taskHighlights.has(e2.j)) {
        ctx.strokeStyle = opts.colors.onSurfaceHighlight;
      } else {
        ctx.strokeStyle = opts.colors.onSurfaceMuted;
      }
      drawArrowBetweenTasks(
        ctx,
        srcDay,
        dstDay,
        scale,
        srcRow,
        srcTask,
        dstRow,
        dstTask,
        arrowHeadWidth,
        arrowHeadHeight
      );
    });
  }
  function drawRangeOverlay(ctx, opts, scale, beginDay, endDay, totalNumberOfRows) {
    const topLeft = scale.feature(0, beginDay, 17 /* displayRangeTop */);
    const bottomRight = scale.feature(
      totalNumberOfRows,
      endDay,
      18 /* taskRowBottom */
    );
    ctx.fillStyle = opts.colors.overlay;
    ctx.fillRect(
      topLeft.x,
      topLeft.y,
      bottomRight.x - topLeft.x,
      bottomRight.y - topLeft.y
    );
    console.log("drawRangeOverlay", topLeft, bottomRight);
  }
  function drawArrowBetweenTasks(ctx, srcDay, dstDay, scale, srcRow, srcTask, dstRow, dstTask, arrowHeadWidth, arrowHeadHeight) {
    if (srcDay === dstDay) {
      drawVerticalArrowToTask(
        ctx,
        scale,
        srcRow,
        srcDay,
        srcTask,
        dstRow,
        dstDay,
        dstTask,
        arrowHeadWidth,
        arrowHeadHeight
      );
    } else {
      drawLShapedArrowToTask(
        ctx,
        scale,
        srcRow,
        srcDay,
        srcTask,
        dstRow,
        dstTask,
        dstDay,
        arrowHeadHeight,
        arrowHeadWidth
      );
    }
  }
  function clearCanvas(ctx, opts, canvas) {
    ctx.fillStyle = opts.colors.surface;
    ctx.strokeStyle = opts.colors.onSurface;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  function setFontSize(ctx, opts) {
    ctx.font = `${opts.fontSizePx}px serif`;
  }
  function drawLShapedArrowToTask(ctx, scale, srcRow, srcDay, srcTask, dstRow, dstTask, dstDay, arrowHeadHeight, arrowHeadWidth) {
    ctx.beginPath();
    const direction = srcRow < dstRow ? "down" : "up";
    const vertLineStart = scale.feature(
      srcRow,
      srcDay,
      verticalArrowStartFeatureFromTaskDuration(srcTask, direction)
    );
    const vertLineEnd = scale.feature(
      dstRow,
      srcDay,
      horizontalArrowDestFeatureFromTaskDuration(dstTask)
    );
    ctx.moveTo(vertLineStart.x + 0.5, vertLineStart.y);
    ctx.lineTo(vertLineStart.x + 0.5, vertLineEnd.y);
    const horzLineStart = vertLineEnd;
    const horzLineEnd = scale.feature(
      dstRow,
      dstDay,
      horizontalArrowDestFeatureFromTaskDuration(dstTask)
    );
    ctx.moveTo(vertLineStart.x + 0.5, horzLineStart.y);
    ctx.lineTo(horzLineEnd.x + 0.5, horzLineEnd.y);
    ctx.moveTo(horzLineEnd.x + 0.5, horzLineEnd.y);
    ctx.lineTo(
      horzLineEnd.x - arrowHeadHeight + 0.5,
      horzLineEnd.y + arrowHeadWidth
    );
    ctx.moveTo(horzLineEnd.x + 0.5, horzLineEnd.y);
    ctx.lineTo(
      horzLineEnd.x - arrowHeadHeight + 0.5,
      horzLineEnd.y - arrowHeadWidth
    );
    ctx.stroke();
  }
  function drawVerticalArrowToTask(ctx, scale, srcRow, srcDay, srcTask, dstRow, dstDay, dstTask, arrowHeadWidth, arrowHeadHeight) {
    const direction = srcRow < dstRow ? "down" : "up";
    const arrowStart = scale.feature(
      srcRow,
      srcDay,
      verticalArrowStartFeatureFromTaskDuration(srcTask, direction)
    );
    const arrowEnd = scale.feature(
      dstRow,
      dstDay,
      verticalArrowDestFeatureFromTaskDuration(dstTask, direction)
    );
    ctx.beginPath();
    ctx.moveTo(arrowStart.x + 0.5, arrowStart.y);
    ctx.lineTo(arrowEnd.x + 0.5, arrowEnd.y);
    const deltaY = direction === "down" ? -arrowHeadHeight : arrowHeadHeight;
    ctx.moveTo(arrowEnd.x + 0.5, arrowEnd.y);
    ctx.lineTo(arrowEnd.x - arrowHeadWidth + 0.5, arrowEnd.y + deltaY);
    ctx.moveTo(arrowEnd.x + 0.5, arrowEnd.y);
    ctx.lineTo(arrowEnd.x + arrowHeadWidth + 0.5, arrowEnd.y + deltaY);
    ctx.stroke();
  }
  function drawTaskText(ctx, opts, scale, row, span, task, taskIndex, originalTaskIndex, clipWidth, labels, taskLocations) {
    if (!opts.hasText) {
      return;
    }
    const label = labels[taskIndex];
    let xStartInTime = span.start;
    let xPixelDelta = 0;
    if (opts.displayRange !== null && opts.displayRangeUsage === "restrict") {
      if (opts.displayRange.in(span.start)) {
        xStartInTime = span.start;
        xPixelDelta = 0;
      } else if (opts.displayRange.in(span.finish)) {
        xStartInTime = span.finish;
        const meas = ctx.measureText(label);
        xPixelDelta = -meas.width - 2 * scale.metric(7 /* textXOffset */);
      } else if (span.start < opts.displayRange.begin && span.finish > opts.displayRange.end) {
        xStartInTime = opts.displayRange.begin;
        xPixelDelta = clipWidth / 2;
      }
    }
    ctx.lineWidth = 1;
    ctx.fillStyle = opts.colors.onSurface;
    ctx.textBaseline = "top";
    const textStart = scale.feature(row, xStartInTime, 1 /* textStart */);
    const textX = textStart.x + xPixelDelta;
    const textY = textStart.y;
    ctx.fillText(label, textStart.x + xPixelDelta, textStart.y);
    taskLocations.push({
      x: textX,
      y: textY,
      originalTaskIndex
    });
  }
  function drawTaskBar(ctx, taskStart, taskEnd, taskLineHeight) {
    ctx.fillRect(
      taskStart.x,
      taskStart.y,
      taskEnd.x - taskStart.x,
      taskLineHeight
    );
  }
  function drawTaskHighlight(ctx, highlightStart, highlightEnd, color, borderWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(
      highlightStart.x,
      highlightStart.y,
      highlightEnd.x - highlightStart.x,
      highlightEnd.y - highlightStart.y
    );
  }
  function drawSelectionHighlight(ctx, highlightStart, highlightEnd, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
      highlightStart.x,
      highlightStart.y,
      highlightEnd.x - highlightStart.x,
      highlightEnd.y - highlightStart.y
    );
  }
  function drawMilestone(ctx, taskStart, diamondDiameter, percentHeight) {
    ctx.beginPath();
    ctx.lineWidth = percentHeight / 2;
    ctx.moveTo(taskStart.x, taskStart.y - diamondDiameter);
    ctx.lineTo(taskStart.x + diamondDiameter, taskStart.y);
    ctx.lineTo(taskStart.x, taskStart.y + diamondDiameter);
    ctx.lineTo(taskStart.x - diamondDiameter, taskStart.y);
    ctx.closePath();
    ctx.stroke();
  }
  var drawTimeMarkerAtDayToTask = (ctx, row, day, task, opts, scale, daysWithTimeMarkers) => {
    if (daysWithTimeMarkers.has(day)) {
      return;
    }
    daysWithTimeMarkers.add(day);
    const timeMarkStart = scale.feature(row, day, 19 /* timeMarkStart */);
    const timeMarkEnd = scale.feature(
      row,
      day,
      verticalArrowDestFeatureFromTaskDuration(task, "down")
    );
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = opts.colors.overlay;
    ctx.moveTo(timeMarkStart.x + 0.5, timeMarkStart.y);
    ctx.lineTo(timeMarkStart.x + 0.5, timeMarkEnd.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = opts.colors.onSurface;
    ctx.textBaseline = "top";
    const textStart = scale.feature(row, day, 21 /* timeTextStart */);
    if (opts.hasText && opts.hasTimeline) {
      ctx.fillText(`${day}`, textStart.x, textStart.y);
    }
  };
  var taskIndexToRowFromGroupBy = (opts, resourceDefinition, chartLike, displayOrder) => {
    const taskIndexToRow = new Map(
      // This looks backwards, but it isn't. Remember that the map callback takes
      // (value, index) as its arguments.
      displayOrder.map((taskIndex, row2) => [taskIndex, row2])
    );
    if (resourceDefinition === void 0) {
      return ok({
        taskIndexToRow,
        rowRanges: null,
        resourceDefinition: null
      });
    }
    const startTaskIndex = 0;
    const finishTaskIndex = chartLike.Vertices.length - 1;
    const ignorable = [startTaskIndex, finishTaskIndex];
    const groups = /* @__PURE__ */ new Map();
    displayOrder.forEach((taskIndex) => {
      const resourceValue = chartLike.Vertices[taskIndex].getResource(opts.groupByResource) || "";
      const groupMembers = groups.get(resourceValue) || [];
      groupMembers.push(taskIndex);
      groups.set(resourceValue, groupMembers);
    });
    const ret = /* @__PURE__ */ new Map();
    ret.set(0, 0);
    let row = 1;
    const rowRanges = /* @__PURE__ */ new Map();
    resourceDefinition.values.forEach(
      (resourceValue, resourceIndex) => {
        const startOfRow = row;
        (groups.get(resourceValue) || []).forEach((taskIndex) => {
          if (ignorable.includes(taskIndex)) {
            return;
          }
          ret.set(taskIndex, row);
          row++;
        });
        rowRanges.set(resourceIndex, { start: startOfRow, finish: row });
      }
    );
    ret.set(finishTaskIndex, row);
    return ok({
      taskIndexToRow: ret,
      rowRanges,
      resourceDefinition
    });
  };
  var drawSwimLaneHighlights = (ctx, scale, rowRanges, totalNumberOfDays, groupColor) => {
    ctx.fillStyle = groupColor;
    let group = 0;
    rowRanges.forEach((rowRange) => {
      const topLeft = scale.feature(
        rowRange.start,
        0,
        15 /* groupEnvelopeStart */
      );
      const bottomRight = scale.feature(
        rowRange.finish,
        totalNumberOfDays + 1,
        16 /* taskEnvelopeTop */
      );
      group++;
      if (group % 2 == 1) {
        return;
      }
      ctx.fillRect(
        topLeft.x,
        topLeft.y,
        bottomRight.x - topLeft.x,
        bottomRight.y - topLeft.y
      );
    });
  };
  var drawSwimLaneLabels = (ctx, opts, resourceDefinition, scale, rowRanges) => {
    if (rowRanges) ctx.lineWidth = 1;
    ctx.fillStyle = opts.colors.onSurface;
    const groupByOrigin = scale.feature(0, 0, 24 /* groupByOrigin */);
    if (opts.hasTimeline) {
      ctx.textBaseline = "bottom";
      ctx.fillText(opts.groupByResource, groupByOrigin.x, groupByOrigin.y);
    }
    if (opts.hasTasks) {
      ctx.textBaseline = "top";
      rowRanges.forEach((rowRange, resourceIndex) => {
        if (rowRange.start === rowRange.finish) {
          return;
        }
        const textStart = scale.feature(
          rowRange.start,
          0,
          2 /* groupTextStart */
        );
        ctx.fillText(
          resourceDefinition.values[resourceIndex],
          textStart.x,
          textStart.y
        );
      });
    }
  };

  // src/style/theme/theme.ts
  var colorThemePrototype = {
    surface: "",
    onSurface: "",
    onSurfaceMuted: "",
    onSurfaceSecondary: "",
    overlay: "",
    groupColor: "",
    highlight: "",
    added: "",
    removed: ""
  };
  var colorThemeFromElement = (ele) => {
    const style = getComputedStyle(ele);
    const ret = Object.assign({}, colorThemePrototype);
    Object.keys(ret).forEach((name) => {
      ret[name] = style.getPropertyValue(`--${name}`);
    });
    return ret;
  };

  // src/generate/generate.ts
  var people = ["Fred", "Barney", "Wilma", "Betty"];
  var DURATION = 100;
  var rndInt2 = (n2) => {
    return Math.floor(Math.random() * n2);
  };
  var rndDuration = () => {
    return rndInt2(DURATION);
  };
  var generateStarterPlan = () => {
    const plan = new Plan();
    let taskID = 0;
    const ops = [AddResourceOp("Person")];
    people.forEach((person) => {
      ops.push(AddResourceOptionOp("Person", person));
    });
    ops.push(
      InsertNewEmptyMilestoneAfterOp(0),
      SetMetricValueOp("Duration", 10, 1),
      SetResourceValueOp("Person", "Fred", 1),
      SetResourceValueOp("Uncertainty", "low", 1)
    );
    const res = applyAllOpsToPlan(ops, plan);
    if (!res.ok) {
      console.log(res.error);
    }
    return plan;
  };
  var generateRandomPlan = () => {
    const plan = new Plan();
    let taskID = 0;
    const ops = [AddResourceOp("Person")];
    people.forEach((person) => {
      ops.push(AddResourceOptionOp("Person", person));
    });
    ops.push(
      InsertNewEmptyMilestoneAfterOp(0),
      SetMetricValueOp("Duration", rndDuration(), 1),
      SetTaskNameOp(1, randomTaskName()),
      SetResourceValueOp("Person", people[rndInt2(people.length)], 1),
      SetResourceValueOp("Uncertainty", "moderate", 1)
    );
    let numTasks = 1;
    for (let i2 = 0; i2 < 15; i2++) {
      let index = rndInt2(numTasks) + 1;
      ops.push(
        SplitTaskOp(index),
        SetMetricValueOp("Duration", rndDuration(), index + 1),
        SetTaskNameOp(index + 1, randomTaskName()),
        SetResourceValueOp("Person", people[rndInt2(people.length)], index + 1),
        SetResourceValueOp("Uncertainty", "moderate", index + 1)
      );
      numTasks++;
      index = rndInt2(numTasks) + 1;
      ops.push(
        DupTaskOp(index),
        SetMetricValueOp("Duration", rndDuration(), index + 1),
        SetTaskNameOp(index + 1, randomTaskName()),
        SetResourceValueOp("Person", people[rndInt2(people.length)], index + 1),
        SetResourceValueOp("Uncertainty", "moderate", index + 1)
      );
      numTasks++;
    }
    const res = applyAllOpsToPlan(ops, plan);
    if (!res.ok) {
      console.log(res.error);
    }
    return plan;
  };
  var parts = [
    "lorem",
    "ipsum",
    "dolor",
    "sit",
    "amet",
    "consectetur",
    "adipiscing",
    "elit",
    "sed",
    "do",
    "eiusmod",
    "tempor",
    "incididunt",
    "ut",
    "labore",
    "et",
    "dolore",
    "magna",
    "aliqua",
    "ut",
    "enim",
    "ad",
    "minim",
    "veniam",
    "quis",
    "nostrud",
    "exercitation",
    "ullamco",
    "laboris",
    "nisi",
    "ut",
    "aliquip",
    "ex",
    "ea",
    "commodo",
    "consequat",
    "euis",
    "aute",
    "irure",
    "dolor",
    "in",
    "reprehenderit",
    "in",
    "voluptate",
    "velit",
    "esse",
    "cillum",
    "dolore",
    "eu",
    "fugiat",
    "nulla",
    "pariatur",
    "excepteur",
    "sint",
    "occaecat",
    "cupidatat",
    "non",
    "proident",
    "sunt",
    "in",
    "culpa",
    "qui",
    "officia",
    "deserunt",
    "mollit",
    "anim",
    "id",
    "est",
    "laborum"
  ];
  var partsLength = parts.length;
  var randomTaskName = () => `${parts[rndInt2(partsLength)]} ${parts[rndInt2(partsLength)]}`;

  // src/report-error/report-error.ts
  var reportError = (error2) => {
    console.log(error2);
  };
  var reportOnError = (ret) => {
    if (!ret.ok) {
      reportError(ret.error);
    }
  };

  // src/explanMain/explanMain.ts
  var FONT_SIZE_PX = 32;
  var NUM_SIMULATION_LOOPS = 100;
  var precision2 = new Precision(2);
  var ExplanMain = class extends HTMLElement {
    /** The Plan being edited. */
    plan = new Plan();
    /** The start and finish time for each Task in the Plan. */
    spans = [];
    /** The task indices of tasks on the critical path. */
    criticalPath = [];
    /** The selection (in time) of the Plan currently being viewed. */
    displayRange = null;
    /** Scale for the radar view, used for drag selecting a displayRange. */
    radarScale = null;
    /** All of the types of resources in the plan. */
    groupByOptions = [];
    /** Which of the resources are we currently grouping by, where 0 means no
     * grouping is done. */
    groupByOptionsIndex = 0;
    /** The currently selected task, as an index. */
    selectedTask = -1;
    // UI features that can be toggled on and off.
    topTimeline = false;
    criticalPathsOnly = false;
    focusOnTask = false;
    mouseMove = null;
    dependenciesPanel = null;
    downloadLink = null;
    selectedTaskPanel = null;
    alternateTaskDurations = null;
    simulationPanel = null;
    /** Callback to call when a mouse moves over the chart. */
    updateHighlightFromMousePos = null;
    connectedCallback() {
      this.simulationPanel = this.querySelector("simulation-panel");
      this.simulationPanel.addEventListener("simulation-select", (e2) => {
        this.alternateTaskDurations = e2.detail.durations;
        this.criticalPath = e2.detail.criticalPath;
        this.recalculateSpansAndCriticalPath();
        this.paintChart();
      });
      this.downloadLink = this.querySelector("#download");
      this.downloadLink.addEventListener("click", () => {
        this.prepareDownload();
      });
      this.dependenciesPanel = this.querySelector("dependencies-panel");
      this.dependenciesPanel.addEventListener("add-dependency", async (e2) => {
        let actionName = "AddPredecessorAction";
        if (e2.detail.depType === "succ") {
          actionName = "AddSuccessorAction";
        }
        const ret = await execute(actionName, this);
        if (!ret.ok) {
          console.log(ret.error);
        }
      });
      this.dependenciesPanel.addEventListener("delete-dependency", async (e2) => {
        let [i2, j2] = [e2.detail.taskIndex, this.selectedTask];
        if (e2.detail.depType === "succ") {
          [i2, j2] = [j2, i2];
        }
        const op = RemoveEdgeOp(i2, j2);
        const ret = await executeOp(op, "planDefinitionChanged", true, this);
        if (!ret.ok) {
          console.log(ret.error);
        }
      });
      this.selectedTaskPanel = this.querySelector("selected-task-panel");
      this.selectedTaskPanel.addEventListener(
        "task-name-change",
        async (e2) => {
          const op = SetTaskNameOp(e2.detail.taskIndex, e2.detail.name);
          reportOnError(await executeOp(op, "planDefinitionChanged", true, this));
        }
      );
      this.selectedTaskPanel.addEventListener(
        "task-resource-value-change",
        async (e2) => {
          const { name, value, taskIndex } = e2.detail;
          const op = SetResourceValueOp(name, value, taskIndex);
          reportOnError(await executeOp(op, "planDefinitionChanged", true, this));
        }
      );
      this.selectedTaskPanel.addEventListener(
        "task-metric-value-change",
        async (e2) => {
          const { name, value, taskIndex } = e2.detail;
          const op = SetMetricValueOp(name, value, taskIndex);
          reportOnError(await executeOp(op, "planDefinitionChanged", true, this));
        }
      );
      const radar = this.querySelector("#radar");
      new MouseDrag(radar);
      radar.addEventListener(
        DRAG_RANGE_EVENT,
        this.dragRangeHandler.bind(this)
      );
      const divider = this.querySelector("vertical-divider");
      new DividerMove(document.body, divider, "column");
      document.body.addEventListener(DIVIDER_MOVE_EVENT, (e2) => {
        this.style.setProperty(
          "grid-template-columns",
          `calc(${e2.detail.before}% - 15px) 10px auto`
        );
        this.paintChart();
      });
      this.querySelector("#reset-zoom").addEventListener("click", () => {
        execute("ResetZoomAction", this);
      });
      this.querySelector("#dark-mode-toggle").addEventListener("click", () => {
        execute("ToggleDarkModeAction", this);
      });
      this.querySelector("#radar-toggle").addEventListener("click", () => {
        execute("ToggleRadarAction", this);
      });
      this.querySelector("#top-timeline-toggle").addEventListener(
        "click",
        () => {
          this.topTimeline = !this.topTimeline;
          this.paintChart();
        }
      );
      this.querySelector("#group-by-toggle").addEventListener("click", () => {
        this.toggleGroupBy();
        this.paintChart();
      });
      this.querySelector("#critical-paths-toggle").addEventListener(
        "click",
        () => {
          this.toggleCriticalPathsOnly();
          this.paintChart();
        }
      );
      const overlayCanvas = this.querySelector("#overlay");
      this.mouseMove = new MouseMove(overlayCanvas);
      window.requestAnimationFrame(this.onMouseMove.bind(this));
      overlayCanvas.addEventListener("mousedown", (e2) => {
        const p2 = new Point(e2.offsetX, e2.offsetY);
        if (this.updateHighlightFromMousePos !== null) {
          this.selectedTask = this.updateHighlightFromMousePos(p2, "mousedown") || -1;
          this.updateTaskPanels(this.selectedTask);
        }
      });
      overlayCanvas.addEventListener("dblclick", (e2) => {
        const p2 = new Point(e2.offsetX, e2.offsetY);
        if (this.updateHighlightFromMousePos !== null) {
          this.setFocusOnTask(
            this.updateHighlightFromMousePos(p2, "mousedown") || -1
          );
        }
      });
      const fileUpload = document.querySelector("#file-upload");
      fileUpload.addEventListener("change", async () => {
        const json = await fileUpload.files[0].text();
        const ret = FromJSON(json);
        if (!ret.ok) {
          throw ret.error;
        }
        this.plan = ret.value;
        this.planDefinitionHasBeenChanged();
      });
      this.querySelector("#simulate").addEventListener("click", () => {
        this.criticalPath = this.simulationPanel.simulate(
          this.plan.chart,
          NUM_SIMULATION_LOOPS,
          this.criticalPath
        );
        this.paintChart();
      });
      this.querySelector("#focus-on-selected-task").addEventListener(
        "click",
        () => {
          this.toggleFocusOnTask();
          this.paintChart();
        }
      );
      this.querySelector("#gen-random-plan").addEventListener("click", () => {
        this.plan = generateRandomPlan();
        this.planDefinitionHasBeenChanged();
      });
      this.plan = generateStarterPlan();
      this.updateTaskPanels(this.selectedTask);
      this.planDefinitionHasBeenChanged();
      window.addEventListener("resize", this.paintChart.bind(this));
      StartKeyboardHandling(this);
    }
    prepareDownload() {
      const downloadBlob = new Blob([JSON.stringify(this.plan, null, "  ")], {
        type: "application/json"
      });
      this.downloadLink.href = URL.createObjectURL(downloadBlob);
    }
    updateTaskPanels(taskIndex) {
      this.selectedTask = taskIndex;
      this.selectedTaskPanel.updateSelectedTaskPanel(
        this.plan,
        this.selectedTask
      );
      const edges = edgesBySrcAndDstToMap(this.plan.chart.Edges);
      this.dependenciesPanel.setTasksAndIndices(
        this.plan.chart.Vertices,
        (edges.byDst.get(taskIndex) || []).map((e2) => e2.i),
        (edges.bySrc.get(taskIndex) || []).map((e2) => e2.j)
      );
      this.dependenciesPanel.classList.toggle(
        "hidden",
        this.selectedTask === -1
      );
    }
    setFocusOnTask(index) {
      this.selectedTask = index;
      this.forceFocusOnTask();
      this.paintChart();
      this.updateTaskPanels(this.selectedTask);
    }
    // TODO - Turn this on and off based on mouse entering the canvas area.
    onMouseMove() {
      const location = this.mouseMove.readLocation();
      if (location !== null && this.updateHighlightFromMousePos !== null) {
        this.updateHighlightFromMousePos(location, "mousemove");
      }
      window.requestAnimationFrame(this.onMouseMove.bind(this));
    }
    planDefinitionHasBeenChanged() {
      this.radarScale = null;
      this.displayRange = null;
      this.alternateTaskDurations = null;
      this.groupByOptions = ["", ...Object.keys(this.plan.resourceDefinitions)];
      this.groupByOptionsIndex = 0;
      this.recalculateSpansAndCriticalPath();
      this.paintChart();
    }
    getTaskDurationFunc() {
      if (this.alternateTaskDurations !== null) {
        return (taskIndex) => this.alternateTaskDurations[taskIndex];
      } else {
        return (taskIndex) => this.plan.chart.Vertices[taskIndex].duration;
      }
    }
    recalculateSpansAndCriticalPath() {
      let slacks = [];
      const slackResult = ComputeSlack(
        this.plan.chart,
        this.getTaskDurationFunc(),
        precision2.rounder()
      );
      if (!slackResult.ok) {
        console.error(slackResult);
      } else {
        slacks = slackResult.value;
      }
      this.spans = slacks.map((value) => {
        return value.early;
      });
      this.criticalPath = CriticalPath(slacks, precision2.rounder());
      this.updateTaskPanels(this.selectedTask);
    }
    getTaskLabeller() {
      return (taskIndex) => `${this.plan.chart.Vertices[taskIndex].name}`;
    }
    dragRangeHandler(e2) {
      if (this.radarScale === null) {
        return;
      }
      const begin = this.radarScale.dayRowFromPoint(e2.detail.begin);
      const end = this.radarScale.dayRowFromPoint(e2.detail.end);
      this.displayRange = new DisplayRange(begin.day, end.day);
      this.paintChart();
    }
    toggleRadar() {
      this.querySelector("radar-parent").classList.toggle("hidden");
    }
    toggleGroupBy() {
      this.groupByOptionsIndex = (this.groupByOptionsIndex + 1) % this.groupByOptions.length;
    }
    toggleCriticalPathsOnly() {
      this.criticalPathsOnly = !this.criticalPathsOnly;
    }
    toggleFocusOnTask() {
      this.focusOnTask = !this.focusOnTask;
      if (!this.focusOnTask) {
        this.displayRange = null;
      }
    }
    forceFocusOnTask() {
      this.focusOnTask = true;
    }
    paintChart() {
      console.time("paintChart");
      const themeColors = colorThemeFromElement(document.body);
      let filterFunc = null;
      const startAndFinish = [0, this.plan.chart.Vertices.length - 1];
      if (this.criticalPathsOnly) {
        const highlightSet = new Set(this.criticalPath);
        filterFunc = (task, taskIndex) => {
          if (startAndFinish.includes(taskIndex)) {
            return true;
          }
          return highlightSet.has(taskIndex);
        };
      } else if (this.focusOnTask && this.selectedTask != -1) {
        const neighborSet = /* @__PURE__ */ new Set();
        neighborSet.add(this.selectedTask);
        let earliestStart = this.spans[this.selectedTask].start;
        let latestFinish = this.spans[this.selectedTask].finish;
        this.plan.chart.Edges.forEach((edge) => {
          if (edge.i === this.selectedTask) {
            neighborSet.add(edge.j);
            if (latestFinish < this.spans[edge.j].finish) {
              latestFinish = this.spans[edge.j].finish;
            }
          }
          if (edge.j === this.selectedTask) {
            neighborSet.add(edge.i);
            if (earliestStart > this.spans[edge.i].start) {
              earliestStart = this.spans[edge.i].start;
            }
          }
        });
        this.displayRange = new DisplayRange(earliestStart - 1, latestFinish + 1);
        filterFunc = (_task, taskIndex) => {
          if (startAndFinish.includes(taskIndex)) {
            return true;
          }
          return neighborSet.has(taskIndex);
        };
      }
      const radarOpts = {
        fontSizePx: 6,
        hasText: false,
        displayRange: this.displayRange,
        displayRangeUsage: "highlight",
        colors: {
          surface: themeColors.surface,
          onSurface: themeColors.onSurface,
          onSurfaceMuted: themeColors.onSurfaceMuted,
          onSurfaceHighlight: themeColors.onSurfaceSecondary,
          overlay: themeColors.overlay,
          groupColor: themeColors.groupColor,
          highlight: themeColors.highlight
        },
        hasTimeline: false,
        hasTasks: true,
        hasEdges: false,
        drawTimeMarkersOnTasks: false,
        taskLabel: this.getTaskLabeller(),
        taskDuration: this.getTaskDurationFunc(),
        taskEmphasize: this.criticalPath,
        filterFunc: null,
        groupByResource: this.groupByOptions[this.groupByOptionsIndex],
        highlightedTask: null,
        selectedTaskIndex: this.selectedTask
      };
      const zoomOpts = {
        fontSizePx: FONT_SIZE_PX,
        hasText: true,
        displayRange: this.displayRange,
        displayRangeUsage: "restrict",
        colors: {
          surface: themeColors.surface,
          onSurface: themeColors.onSurface,
          onSurfaceMuted: themeColors.onSurfaceMuted,
          onSurfaceHighlight: themeColors.onSurfaceSecondary,
          overlay: themeColors.overlay,
          groupColor: themeColors.groupColor,
          highlight: themeColors.highlight
        },
        hasTimeline: this.topTimeline,
        hasTasks: true,
        hasEdges: true,
        drawTimeMarkersOnTasks: true,
        taskLabel: this.getTaskLabeller(),
        taskDuration: this.getTaskDurationFunc(),
        taskEmphasize: this.criticalPath,
        filterFunc,
        groupByResource: this.groupByOptions[this.groupByOptionsIndex],
        highlightedTask: 1,
        selectedTaskIndex: this.selectedTask
      };
      const timelineOpts = {
        fontSizePx: FONT_SIZE_PX,
        hasText: true,
        displayRange: this.displayRange,
        displayRangeUsage: "restrict",
        colors: {
          surface: themeColors.surface,
          onSurface: themeColors.onSurface,
          onSurfaceMuted: themeColors.onSurfaceMuted,
          onSurfaceHighlight: themeColors.onSurfaceSecondary,
          overlay: themeColors.overlay,
          groupColor: themeColors.groupColor,
          highlight: themeColors.highlight
        },
        hasTimeline: true,
        hasTasks: false,
        hasEdges: true,
        drawTimeMarkersOnTasks: true,
        taskLabel: this.getTaskLabeller(),
        taskDuration: this.getTaskDurationFunc(),
        taskEmphasize: this.criticalPath,
        filterFunc,
        groupByResource: this.groupByOptions[this.groupByOptionsIndex],
        highlightedTask: null,
        selectedTaskIndex: this.selectedTask
      };
      const ret = this.paintOneChart("#radar", radarOpts);
      if (!ret.ok) {
        return;
      }
      this.radarScale = ret.value.scale;
      this.paintOneChart("#timeline", timelineOpts);
      const zoomRet = this.paintOneChart("#zoomed", zoomOpts, "#overlay");
      if (zoomRet.ok) {
        this.updateHighlightFromMousePos = zoomRet.value.updateHighlightFromMousePos;
        if (zoomRet.value.selectedTaskLocation !== null) {
          document.querySelector("chart-parent").scroll({
            top: zoomRet.value.selectedTaskLocation.y,
            behavior: "smooth"
          });
        }
      }
      console.timeEnd("paintChart");
    }
    prepareCanvas(canvas, canvasWidth, canvasHeight, width, height) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      return ctx;
    }
    paintOneChart(canvasID, opts, overlayID = "") {
      const canvas = this.querySelector(canvasID);
      const parent = canvas.parentElement;
      const ratio = window.devicePixelRatio;
      const width = parent.clientWidth - FONT_SIZE_PX;
      let height = parent.clientHeight;
      const canvasWidth = Math.ceil(width * ratio);
      let canvasHeight = Math.ceil(height * ratio);
      const newHeight = suggestedCanvasHeight(
        canvas,
        this.spans,
        opts,
        this.plan.chart.Vertices.length + 2
        // TODO - Why do we need the +2 here!?
      );
      canvasHeight = newHeight;
      height = newHeight / window.devicePixelRatio;
      let overlay = null;
      if (overlayID) {
        overlay = document.querySelector(overlayID);
        this.prepareCanvas(overlay, canvasWidth, canvasHeight, width, height);
      }
      const ctx = this.prepareCanvas(
        canvas,
        canvasWidth,
        canvasHeight,
        width,
        height
      );
      return renderTasksToCanvas(
        parent,
        canvas,
        ctx,
        this.plan,
        this.spans,
        opts,
        overlay
      );
    }
  };
  customElements.define("explan-main", ExplanMain);
})();
/** @module kd
 * A k-d tree implementation, which is used to find the closest point in
 * something like a 2D scatter plot. See https://en.wikipedia.org/wiki/K-d_tree
 * for more details.
 *
 * Forked from https://skia.googlesource.com/buildbot/+/refs/heads/main/perf/modules/plot-simple-sk/kd.ts.
 *
 * Forked from https://github.com/Pandinosaurus/kd-tree-javascript and
 * then massively trimmed down to just find the single closest point, and also
 * ported to ES6 syntax, then ported to TypeScript.
 *
 * https://github.com/Pandinosaurus/kd-tree-javascript is a fork of
 * https://github.com/ubilabs/kd-tree-javascript
 *
 * @author Mircea Pricop <pricop@ubilabs.net>, 2012
 * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
 * @author Ubilabs http://ubilabs.net, 2012
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
/*! Bundled license information:

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2Z1enp5c29ydC9mdXp6eXNvcnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL3NyYy9saXQtaHRtbC50cyIsICIuLi9zcmMvcmVzdWx0LnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9uLnRzIiwgIi4uL3NyYy9kYWcvZGFnLnRzIiwgIi4uL3NyYy9vcHMvb3BzLnRzIiwgIi4uL3NyYy9vcHMvbWV0cmljcy50cyIsICIuLi9zcmMvb3BzL2NoYXJ0LnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9hZGRQcmVkZWNlc3Nvci50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvYWRkU3VjY2Vzc29yLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9nb3RvU2VhcmNoLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9oZWxwLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9yZXNldFpvb20udHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3Rhc2tzLnRzIiwgIi4uL3NyYy9zdHlsZS90b2dnbGVyL3RvZ2dsZXIudHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3RvZ2dsZURhcmtNb2RlLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy90b2dnbGVSYWRhci50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvdW5kby50cyIsICIuLi9zcmMvYWN0aW9uL3JlZ2lzdHJ5LnRzIiwgIi4uL3NyYy9hY3Rpb24vZXhlY3V0ZS50cyIsICIuLi9zcmMva2V5bWFwL2tleW1hcC50cyIsICIuLi9zcmMvaGVscC9oZWxwLnRzIiwgIi4uL3NyYy9kYWcvYWxnb3JpdGhtcy9kZnMudHMiLCAiLi4vc3JjL2RhZy9hbGdvcml0aG1zL2NpcmN1bGFyLnRzIiwgIi4uL3NyYy9hZGQtZGVwZW5kZW5jeS1kaWFsb2cvYWRkLWRlcGVuZGVuY3ktZGlhbG9nLnRzIiwgIi4uL3NyYy9kYWcvYWxnb3JpdGhtcy90b3Bvc29ydC50cyIsICIuLi9zcmMvY2hhcnQvY2hhcnQudHMiLCAiLi4vc3JjL3ByZWNpc2lvbi9wcmVjaXNpb24udHMiLCAiLi4vc3JjL21ldHJpY3MvcmFuZ2UudHMiLCAiLi4vc3JjL21ldHJpY3MvbWV0cmljcy50cyIsICIuLi9zcmMvcmVzb3VyY2VzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvc3RhdHMvY2RmL3RyaWFuZ3VsYXIvdHJpYW5ndWxhci50cyIsICIuLi9zcmMvc3RhdHMvY2RmL3RyaWFuZ3VsYXIvamFjb2JpYW4udHMiLCAiLi4vc3JjL3BsYW4vcGxhbi50cyIsICIuLi9zcmMvc2VsZWN0ZWQtdGFzay1wYW5lbC9zZWxlY3RlZC10YXNrLXBhbmVsLnRzIiwgIi4uL3NyYy9zbGFjay9zbGFjay50cyIsICIuLi9zcmMvc2ltdWxhdGlvbi9zaW11bGF0aW9uLnRzIiwgIi4uL3NyYy9zaW11bGF0aW9uLXBhbmVsL3NpbXVsYXRpb24tcGFuZWwudHMiLCAiLi4vc3JjL3NlYXJjaC9zZWFyY2gtdGFzay1wYW5lbC50cyIsICIuLi9zcmMvc2VhcmNoL3Rhc2stc2VhcmNoLWNvbnRyb2xzLnRzIiwgIi4uL3NyYy9kZXBlbmRlbmNpZXMvZGVwZW5kZW5jaWVzLXBhbmVsLnRzIiwgIi4uL3NyYy9vcHMvcmVzb3VyY2VzLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9zY2FsZS9wb2ludC50cyIsICIuLi9zcmMvcmVuZGVyZXIvZGl2aWRlcm1vdmUvZGl2aWRlcm1vdmUudHMiLCAiLi4vc3JjL3JlbmRlcmVyL21vdXNlZHJhZy9tb3VzZWRyYWcudHMiLCAiLi4vc3JjL3JlbmRlcmVyL21vdXNlbW92ZS9tb3VzZW1vdmUudHMiLCAiLi4vc3JjL3JlbmRlcmVyL3JhbmdlL3JhbmdlLnRzIiwgIi4uL3NyYy9jaGFydC9maWx0ZXIvZmlsdGVyLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9rZC9rZC50cyIsICIuLi9zcmMvcmVuZGVyZXIvc2NhbGUvc2NhbGUudHMiLCAiLi4vc3JjL3JlbmRlcmVyL3JlbmRlcmVyLnRzIiwgIi4uL3NyYy9zdHlsZS90aGVtZS90aGVtZS50cyIsICIuLi9zcmMvZ2VuZXJhdGUvZ2VuZXJhdGUudHMiLCAiLi4vc3JjL3JlcG9ydC1lcnJvci9yZXBvcnQtZXJyb3IudHMiLCAiLi4vc3JjL2V4cGxhbk1haW4vZXhwbGFuTWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gaHR0cHM6Ly9naXRodWIuY29tL2ZhcnpoZXIvZnV6enlzb3J0IHYzLjAuMlxyXG5cclxuLy8gVU1EIChVbml2ZXJzYWwgTW9kdWxlIERlZmluaXRpb24pIGZvciBmdXp6eXNvcnRcclxuOygocm9vdCwgVU1EKSA9PiB7XHJcbiAgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoW10sIFVNRClcclxuICBlbHNlIGlmKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IFVNRCgpXHJcbiAgZWxzZSByb290WydmdXp6eXNvcnQnXSA9IFVNRCgpXHJcbn0pKHRoaXMsIF8gPT4ge1xyXG4gICd1c2Ugc3RyaWN0J1xyXG5cclxuICB2YXIgc2luZ2xlID0gKHNlYXJjaCwgdGFyZ2V0KSA9PiB7XHJcbiAgICBpZighc2VhcmNoIHx8ICF0YXJnZXQpIHJldHVybiBOVUxMXHJcblxyXG4gICAgdmFyIHByZXBhcmVkU2VhcmNoID0gZ2V0UHJlcGFyZWRTZWFyY2goc2VhcmNoKVxyXG4gICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG5cclxuICAgIHZhciBzZWFyY2hCaXRmbGFncyA9IHByZXBhcmVkU2VhcmNoLmJpdGZsYWdzXHJcbiAgICBpZigoc2VhcmNoQml0ZmxhZ3MgJiB0YXJnZXQuX2JpdGZsYWdzKSAhPT0gc2VhcmNoQml0ZmxhZ3MpIHJldHVybiBOVUxMXHJcblxyXG4gICAgcmV0dXJuIGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0KVxyXG4gIH1cclxuXHJcbiAgdmFyIGdvID0gKHNlYXJjaCwgdGFyZ2V0cywgb3B0aW9ucykgPT4ge1xyXG4gICAgaWYoIXNlYXJjaCkgcmV0dXJuIG9wdGlvbnM/LmFsbCA/IGFsbCh0YXJnZXRzLCBvcHRpb25zKSA6IG5vUmVzdWx0c1xyXG5cclxuICAgIHZhciBwcmVwYXJlZFNlYXJjaCA9IGdldFByZXBhcmVkU2VhcmNoKHNlYXJjaClcclxuICAgIHZhciBzZWFyY2hCaXRmbGFncyA9IHByZXBhcmVkU2VhcmNoLmJpdGZsYWdzXHJcbiAgICB2YXIgY29udGFpbnNTcGFjZSAgPSBwcmVwYXJlZFNlYXJjaC5jb250YWluc1NwYWNlXHJcblxyXG4gICAgdmFyIHRocmVzaG9sZCA9IGRlbm9ybWFsaXplU2NvcmUoIG9wdGlvbnM/LnRocmVzaG9sZCB8fCAwIClcclxuICAgIHZhciBsaW1pdCAgICAgPSBvcHRpb25zPy5saW1pdCB8fCBJTkZJTklUWVxyXG5cclxuICAgIHZhciByZXN1bHRzTGVuID0gMDsgdmFyIGxpbWl0ZWRDb3VudCA9IDBcclxuICAgIHZhciB0YXJnZXRzTGVuID0gdGFyZ2V0cy5sZW5ndGhcclxuXHJcbiAgICBmdW5jdGlvbiBwdXNoX3Jlc3VsdChyZXN1bHQpIHtcclxuICAgICAgaWYocmVzdWx0c0xlbiA8IGxpbWl0KSB7IHEuYWRkKHJlc3VsdCk7ICsrcmVzdWx0c0xlbiB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgICsrbGltaXRlZENvdW50XHJcbiAgICAgICAgaWYocmVzdWx0Ll9zY29yZSA+IHEucGVlaygpLl9zY29yZSkgcS5yZXBsYWNlVG9wKHJlc3VsdClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgY29kZSBpcyBjb3B5L3Bhc3RlZCAzIHRpbWVzIGZvciBwZXJmb3JtYW5jZSByZWFzb25zIFtvcHRpb25zLmtleSwgb3B0aW9ucy5rZXlzLCBubyBrZXlzXVxyXG5cclxuICAgIC8vIG9wdGlvbnMua2V5XHJcbiAgICBpZihvcHRpb25zPy5rZXkpIHtcclxuICAgICAgdmFyIGtleSA9IG9wdGlvbnMua2V5XHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRzTGVuOyArK2kpIHsgdmFyIG9iaiA9IHRhcmdldHNbaV1cclxuICAgICAgICB2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBrZXkpXHJcbiAgICAgICAgaWYoIXRhcmdldCkgY29udGludWVcclxuICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgICAgIGlmKChzZWFyY2hCaXRmbGFncyAmIHRhcmdldC5fYml0ZmxhZ3MpICE9PSBzZWFyY2hCaXRmbGFncykgY29udGludWVcclxuICAgICAgICB2YXIgcmVzdWx0ID0gYWxnb3JpdGhtKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQpXHJcbiAgICAgICAgaWYocmVzdWx0ID09PSBOVUxMKSBjb250aW51ZVxyXG4gICAgICAgIGlmKHJlc3VsdC5fc2NvcmUgPCB0aHJlc2hvbGQpIGNvbnRpbnVlXHJcblxyXG4gICAgICAgIHJlc3VsdC5vYmogPSBvYmpcclxuICAgICAgICBwdXNoX3Jlc3VsdChyZXN1bHQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAvLyBvcHRpb25zLmtleXNcclxuICAgIH0gZWxzZSBpZihvcHRpb25zPy5rZXlzKSB7XHJcbiAgICAgIHZhciBrZXlzID0gb3B0aW9ucy5rZXlzXHJcbiAgICAgIHZhciBrZXlzTGVuID0ga2V5cy5sZW5ndGhcclxuXHJcbiAgICAgIG91dGVyOiBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0c0xlbjsgKytpKSB7IHZhciBvYmogPSB0YXJnZXRzW2ldXHJcblxyXG4gICAgICAgIHsgLy8gZWFybHkgb3V0IGJhc2VkIG9uIGJpdGZsYWdzXHJcbiAgICAgICAgICB2YXIga2V5c0JpdGZsYWdzID0gMFxyXG4gICAgICAgICAgZm9yICh2YXIga2V5SSA9IDA7IGtleUkgPCBrZXlzTGVuOyArK2tleUkpIHtcclxuICAgICAgICAgICAgdmFyIGtleSA9IGtleXNba2V5SV1cclxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwga2V5KVxyXG4gICAgICAgICAgICBpZighdGFyZ2V0KSB7IHRtcFRhcmdldHNba2V5SV0gPSBub1RhcmdldDsgY29udGludWUgfVxyXG4gICAgICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcbiAgICAgICAgICAgIHRtcFRhcmdldHNba2V5SV0gPSB0YXJnZXRcclxuXHJcbiAgICAgICAgICAgIGtleXNCaXRmbGFncyB8PSB0YXJnZXQuX2JpdGZsYWdzXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYoKHNlYXJjaEJpdGZsYWdzICYga2V5c0JpdGZsYWdzKSAhPT0gc2VhcmNoQml0ZmxhZ3MpIGNvbnRpbnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihjb250YWluc1NwYWNlKSBmb3IobGV0IGk9MDsgaTxwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzLmxlbmd0aDsgaSsrKSBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA9IE5FR0FUSVZFX0lORklOSVRZXHJcblxyXG4gICAgICAgIGZvciAodmFyIGtleUkgPSAwOyBrZXlJIDwga2V5c0xlbjsgKytrZXlJKSB7XHJcbiAgICAgICAgICB0YXJnZXQgPSB0bXBUYXJnZXRzW2tleUldXHJcbiAgICAgICAgICBpZih0YXJnZXQgPT09IG5vVGFyZ2V0KSB7IHRtcFJlc3VsdHNba2V5SV0gPSBub1RhcmdldDsgY29udGludWUgfVxyXG5cclxuICAgICAgICAgIHRtcFJlc3VsdHNba2V5SV0gPSBhbGdvcml0aG0ocHJlcGFyZWRTZWFyY2gsIHRhcmdldCwgLyphbGxvd1NwYWNlcz0qL2ZhbHNlLCAvKmFsbG93UGFydGlhbE1hdGNoPSovY29udGFpbnNTcGFjZSlcclxuICAgICAgICAgIGlmKHRtcFJlc3VsdHNba2V5SV0gPT09IE5VTEwpIHsgdG1wUmVzdWx0c1trZXlJXSA9IG5vVGFyZ2V0OyBjb250aW51ZSB9XHJcblxyXG4gICAgICAgICAgLy8gdG9kbzogdGhpcyBzZWVtcyB3ZWlyZCBhbmQgd3JvbmcuIGxpa2Ugd2hhdCBpZiBvdXIgZmlyc3QgbWF0Y2ggd2Fzbid0IGdvb2QuIHRoaXMgc2hvdWxkIGp1c3QgcmVwbGFjZSBpdCBpbnN0ZWFkIG9mIGF2ZXJhZ2luZyB3aXRoIGl0XHJcbiAgICAgICAgICAvLyBpZiBvdXIgc2Vjb25kIG1hdGNoIGlzbid0IGdvb2Qgd2UgaWdub3JlIGl0IGluc3RlYWQgb2YgYXZlcmFnaW5nIHdpdGggaXRcclxuICAgICAgICAgIGlmKGNvbnRhaW5zU3BhY2UpIGZvcihsZXQgaT0wOyBpPHByZXBhcmVkU2VhcmNoLnNwYWNlU2VhcmNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0gPiAtMTAwMCkge1xyXG4gICAgICAgICAgICAgIGlmKGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldID4gTkVHQVRJVkVfSU5GSU5JVFkpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0bXAgPSAoa2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gKyBhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSkgLyA0Lypib251cyBzY29yZSBmb3IgaGF2aW5nIG11bHRpcGxlIG1hdGNoZXMqL1xyXG4gICAgICAgICAgICAgICAgaWYodG1wID4ga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0pIGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldID0gdG1wXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldID4ga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0pIGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldID0gYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGNvbnRhaW5zU3BhY2UpIHtcclxuICAgICAgICAgIGZvcihsZXQgaT0wOyBpPHByZXBhcmVkU2VhcmNoLnNwYWNlU2VhcmNoZXMubGVuZ3RoOyBpKyspIHsgaWYoa2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPT09IE5FR0FUSVZFX0lORklOSVRZKSBjb250aW51ZSBvdXRlciB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHZhciBoYXNBdExlYXN0MU1hdGNoID0gZmFsc2VcclxuICAgICAgICAgIGZvcihsZXQgaT0wOyBpIDwga2V5c0xlbjsgaSsrKSB7IGlmKHRtcFJlc3VsdHNbaV0uX3Njb3JlICE9PSBORUdBVElWRV9JTkZJTklUWSkgeyBoYXNBdExlYXN0MU1hdGNoID0gdHJ1ZTsgYnJlYWsgfSB9XHJcbiAgICAgICAgICBpZighaGFzQXRMZWFzdDFNYXRjaCkgY29udGludWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBvYmpSZXN1bHRzID0gbmV3IEtleXNSZXN1bHQoa2V5c0xlbilcclxuICAgICAgICBmb3IobGV0IGk9MDsgaSA8IGtleXNMZW47IGkrKykgeyBvYmpSZXN1bHRzW2ldID0gdG1wUmVzdWx0c1tpXSB9XHJcblxyXG4gICAgICAgIGlmKGNvbnRhaW5zU3BhY2UpIHtcclxuICAgICAgICAgIHZhciBzY29yZSA9IDBcclxuICAgICAgICAgIGZvcihsZXQgaT0wOyBpPHByZXBhcmVkU2VhcmNoLnNwYWNlU2VhcmNoZXMubGVuZ3RoOyBpKyspIHNjb3JlICs9IGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIHRvZG8gY291bGQgcmV3cml0ZSB0aGlzIHNjb3JpbmcgdG8gYmUgbW9yZSBzaW1pbGFyIHRvIHdoZW4gdGhlcmUncyBzcGFjZXNcclxuICAgICAgICAgIC8vIGlmIHdlIG1hdGNoIG11bHRpcGxlIGtleXMgZ2l2ZSB1cyBib251cyBwb2ludHNcclxuICAgICAgICAgIHZhciBzY29yZSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgICAgICBmb3IobGV0IGk9MDsgaTxrZXlzTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG9ialJlc3VsdHNbaV1cclxuICAgICAgICAgICAgaWYocmVzdWx0Ll9zY29yZSA+IC0xMDAwKSB7XHJcbiAgICAgICAgICAgICAgaWYoc2NvcmUgPiBORUdBVElWRV9JTkZJTklUWSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRtcCA9IChzY29yZSArIHJlc3VsdC5fc2NvcmUpIC8gNC8qYm9udXMgc2NvcmUgZm9yIGhhdmluZyBtdWx0aXBsZSBtYXRjaGVzKi9cclxuICAgICAgICAgICAgICAgIGlmKHRtcCA+IHNjb3JlKSBzY29yZSA9IHRtcFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihyZXN1bHQuX3Njb3JlID4gc2NvcmUpIHNjb3JlID0gcmVzdWx0Ll9zY29yZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb2JqUmVzdWx0cy5vYmogPSBvYmpcclxuICAgICAgICBvYmpSZXN1bHRzLl9zY29yZSA9IHNjb3JlXHJcbiAgICAgICAgaWYob3B0aW9ucz8uc2NvcmVGbikge1xyXG4gICAgICAgICAgc2NvcmUgPSBvcHRpb25zLnNjb3JlRm4ob2JqUmVzdWx0cylcclxuICAgICAgICAgIGlmKCFzY29yZSkgY29udGludWVcclxuICAgICAgICAgIHNjb3JlID0gZGVub3JtYWxpemVTY29yZShzY29yZSlcclxuICAgICAgICAgIG9ialJlc3VsdHMuX3Njb3JlID0gc2NvcmVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHNjb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZVxyXG4gICAgICAgIHB1c2hfcmVzdWx0KG9ialJlc3VsdHMpXHJcbiAgICAgIH1cclxuXHJcbiAgICAvLyBubyBrZXlzXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0c0xlbjsgKytpKSB7IHZhciB0YXJnZXQgPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgaWYoIXRhcmdldCkgY29udGludWVcclxuICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgICAgIGlmKChzZWFyY2hCaXRmbGFncyAmIHRhcmdldC5fYml0ZmxhZ3MpICE9PSBzZWFyY2hCaXRmbGFncykgY29udGludWVcclxuICAgICAgICB2YXIgcmVzdWx0ID0gYWxnb3JpdGhtKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQpXHJcbiAgICAgICAgaWYocmVzdWx0ID09PSBOVUxMKSBjb250aW51ZVxyXG4gICAgICAgIGlmKHJlc3VsdC5fc2NvcmUgPCB0aHJlc2hvbGQpIGNvbnRpbnVlXHJcblxyXG4gICAgICAgIHB1c2hfcmVzdWx0KHJlc3VsdClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmKHJlc3VsdHNMZW4gPT09IDApIHJldHVybiBub1Jlc3VsdHNcclxuICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KHJlc3VsdHNMZW4pXHJcbiAgICBmb3IodmFyIGkgPSByZXN1bHRzTGVuIC0gMTsgaSA+PSAwOyAtLWkpIHJlc3VsdHNbaV0gPSBxLnBvbGwoKVxyXG4gICAgcmVzdWx0cy50b3RhbCA9IHJlc3VsdHNMZW4gKyBsaW1pdGVkQ291bnRcclxuICAgIHJldHVybiByZXN1bHRzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gdGhpcyBpcyB3cml0dGVuIGFzIDEgZnVuY3Rpb24gaW5zdGVhZCBvZiAyIGZvciBtaW5pZmljYXRpb24uIHBlcmYgc2VlbXMgZmluZSAuLi5cclxuICAvLyBleGNlcHQgd2hlbiBtaW5pZmllZC4gdGhlIHBlcmYgaXMgdmVyeSBzbG93XHJcbiAgdmFyIGhpZ2hsaWdodCA9IChyZXN1bHQsIG9wZW49JzxiPicsIGNsb3NlPSc8L2I+JykgPT4ge1xyXG4gICAgdmFyIGNhbGxiYWNrID0gdHlwZW9mIG9wZW4gPT09ICdmdW5jdGlvbicgPyBvcGVuIDogdW5kZWZpbmVkXHJcblxyXG4gICAgdmFyIHRhcmdldCAgICAgID0gcmVzdWx0LnRhcmdldFxyXG4gICAgdmFyIHRhcmdldExlbiAgID0gdGFyZ2V0Lmxlbmd0aFxyXG4gICAgdmFyIGluZGV4ZXMgICAgID0gcmVzdWx0LmluZGV4ZXNcclxuICAgIHZhciBoaWdobGlnaHRlZCA9ICcnXHJcbiAgICB2YXIgbWF0Y2hJICAgICAgPSAwXHJcbiAgICB2YXIgaW5kZXhlc0kgICAgPSAwXHJcbiAgICB2YXIgb3BlbmVkICAgICAgPSBmYWxzZVxyXG4gICAgdmFyIHBhcnRzICAgICAgID0gW11cclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0TGVuOyArK2kpIHsgdmFyIGNoYXIgPSB0YXJnZXRbaV1cclxuICAgICAgaWYoaW5kZXhlc1tpbmRleGVzSV0gPT09IGkpIHtcclxuICAgICAgICArK2luZGV4ZXNJXHJcbiAgICAgICAgaWYoIW9wZW5lZCkgeyBvcGVuZWQgPSB0cnVlXHJcbiAgICAgICAgICBpZihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGhpZ2hsaWdodGVkKTsgaGlnaGxpZ2h0ZWQgPSAnJ1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgKz0gb3BlblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoaW5kZXhlc0kgPT09IGluZGV4ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBpZihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBoaWdobGlnaHRlZCArPSBjaGFyXHJcbiAgICAgICAgICAgIHBhcnRzLnB1c2goY2FsbGJhY2soaGlnaGxpZ2h0ZWQsIG1hdGNoSSsrKSk7IGhpZ2hsaWdodGVkID0gJydcclxuICAgICAgICAgICAgcGFydHMucHVzaCh0YXJnZXQuc3Vic3RyKGkrMSkpXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoaWdobGlnaHRlZCArPSBjaGFyICsgY2xvc2UgKyB0YXJnZXQuc3Vic3RyKGkrMSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmKG9wZW5lZCkgeyBvcGVuZWQgPSBmYWxzZVxyXG4gICAgICAgICAgaWYoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgcGFydHMucHVzaChjYWxsYmFjayhoaWdobGlnaHRlZCwgbWF0Y2hJKyspKTsgaGlnaGxpZ2h0ZWQgPSAnJ1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgKz0gY2xvc2VcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaGlnaGxpZ2h0ZWQgKz0gY2hhclxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjYWxsYmFjayA/IHBhcnRzIDogaGlnaGxpZ2h0ZWRcclxuICB9XHJcblxyXG5cclxuICB2YXIgcHJlcGFyZSA9ICh0YXJnZXQpID0+IHtcclxuICAgIGlmKHR5cGVvZiB0YXJnZXQgPT09ICdudW1iZXInKSB0YXJnZXQgPSAnJyt0YXJnZXRcclxuICAgIGVsc2UgaWYodHlwZW9mIHRhcmdldCAhPT0gJ3N0cmluZycpIHRhcmdldCA9ICcnXHJcbiAgICB2YXIgaW5mbyA9IHByZXBhcmVMb3dlckluZm8odGFyZ2V0KVxyXG4gICAgcmV0dXJuIG5ld19yZXN1bHQodGFyZ2V0LCB7X3RhcmdldExvd2VyOmluZm8uX2xvd2VyLCBfdGFyZ2V0TG93ZXJDb2RlczppbmZvLmxvd2VyQ29kZXMsIF9iaXRmbGFnczppbmZvLmJpdGZsYWdzfSlcclxuICB9XHJcblxyXG4gIHZhciBjbGVhbnVwID0gKCkgPT4geyBwcmVwYXJlZENhY2hlLmNsZWFyKCk7IHByZXBhcmVkU2VhcmNoQ2FjaGUuY2xlYXIoKSB9XHJcblxyXG5cclxuICAvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxyXG4gIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcbiAgLy8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcclxuICAvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxyXG5cclxuXHJcbiAgY2xhc3MgUmVzdWx0IHtcclxuICAgIGdldCBbJ2luZGV4ZXMnXSgpIHsgcmV0dXJuIHRoaXMuX2luZGV4ZXMuc2xpY2UoMCwgdGhpcy5faW5kZXhlcy5sZW4pLnNvcnQoKGEsYik9PmEtYikgfVxyXG4gICAgc2V0IFsnaW5kZXhlcyddKGluZGV4ZXMpIHsgcmV0dXJuIHRoaXMuX2luZGV4ZXMgPSBpbmRleGVzIH1cclxuICAgIFsnaGlnaGxpZ2h0J10ob3BlbiwgY2xvc2UpIHsgcmV0dXJuIGhpZ2hsaWdodCh0aGlzLCBvcGVuLCBjbG9zZSkgfVxyXG4gICAgZ2V0IFsnc2NvcmUnXSgpIHsgcmV0dXJuIG5vcm1hbGl6ZVNjb3JlKHRoaXMuX3Njb3JlKSB9XHJcbiAgICBzZXQgWydzY29yZSddKHNjb3JlKSB7IHRoaXMuX3Njb3JlID0gZGVub3JtYWxpemVTY29yZShzY29yZSkgfVxyXG4gIH1cclxuXHJcbiAgY2xhc3MgS2V5c1Jlc3VsdCBleHRlbmRzIEFycmF5IHtcclxuICAgIGdldCBbJ3Njb3JlJ10oKSB7IHJldHVybiBub3JtYWxpemVTY29yZSh0aGlzLl9zY29yZSkgfVxyXG4gICAgc2V0IFsnc2NvcmUnXShzY29yZSkgeyB0aGlzLl9zY29yZSA9IGRlbm9ybWFsaXplU2NvcmUoc2NvcmUpIH1cclxuICB9XHJcblxyXG4gIHZhciBuZXdfcmVzdWx0ID0gKHRhcmdldCwgb3B0aW9ucykgPT4ge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IFJlc3VsdCgpXHJcbiAgICByZXN1bHRbJ3RhcmdldCddICAgICAgICAgICAgID0gdGFyZ2V0XHJcbiAgICByZXN1bHRbJ29iaiddICAgICAgICAgICAgICAgID0gb3B0aW9ucy5vYmogICAgICAgICAgICAgICAgICAgPz8gTlVMTFxyXG4gICAgcmVzdWx0Ll9zY29yZSAgICAgICAgICAgICAgICA9IG9wdGlvbnMuX3Njb3JlICAgICAgICAgICAgICAgID8/IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICByZXN1bHQuX2luZGV4ZXMgICAgICAgICAgICAgID0gb3B0aW9ucy5faW5kZXhlcyAgICAgICAgICAgICAgPz8gW11cclxuICAgIHJlc3VsdC5fdGFyZ2V0TG93ZXIgICAgICAgICAgPSBvcHRpb25zLl90YXJnZXRMb3dlciAgICAgICAgICA/PyAnJ1xyXG4gICAgcmVzdWx0Ll90YXJnZXRMb3dlckNvZGVzICAgICA9IG9wdGlvbnMuX3RhcmdldExvd2VyQ29kZXMgICAgID8/IE5VTExcclxuICAgIHJlc3VsdC5fbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBvcHRpb25zLl9uZXh0QmVnaW5uaW5nSW5kZXhlcyA/PyBOVUxMXHJcbiAgICByZXN1bHQuX2JpdGZsYWdzICAgICAgICAgICAgID0gb3B0aW9ucy5fYml0ZmxhZ3MgICAgICAgICAgICAgPz8gMFxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG4gIH1cclxuXHJcblxyXG4gIHZhciBub3JtYWxpemVTY29yZSA9IHNjb3JlID0+IHtcclxuICAgIGlmKHNjb3JlID09PSBORUdBVElWRV9JTkZJTklUWSkgcmV0dXJuIDBcclxuICAgIGlmKHNjb3JlID4gMSkgcmV0dXJuIHNjb3JlXHJcbiAgICByZXR1cm4gTWF0aC5FICoqICggKCgtc2NvcmUgKyAxKSoqLjA0MzA3IC0gMSkgKiAtMilcclxuICB9XHJcbiAgdmFyIGRlbm9ybWFsaXplU2NvcmUgPSBub3JtYWxpemVkU2NvcmUgPT4ge1xyXG4gICAgaWYobm9ybWFsaXplZFNjb3JlID09PSAwKSByZXR1cm4gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgIGlmKG5vcm1hbGl6ZWRTY29yZSA+IDEpIHJldHVybiBub3JtYWxpemVkU2NvcmVcclxuICAgIHJldHVybiAxIC0gTWF0aC5wb3coKE1hdGgubG9nKG5vcm1hbGl6ZWRTY29yZSkgLyAtMiArIDEpLCAxIC8gMC4wNDMwNylcclxuICB9XHJcblxyXG5cclxuICB2YXIgcHJlcGFyZVNlYXJjaCA9IChzZWFyY2gpID0+IHtcclxuICAgIGlmKHR5cGVvZiBzZWFyY2ggPT09ICdudW1iZXInKSBzZWFyY2ggPSAnJytzZWFyY2hcclxuICAgIGVsc2UgaWYodHlwZW9mIHNlYXJjaCAhPT0gJ3N0cmluZycpIHNlYXJjaCA9ICcnXHJcbiAgICBzZWFyY2ggPSBzZWFyY2gudHJpbSgpXHJcbiAgICB2YXIgaW5mbyA9IHByZXBhcmVMb3dlckluZm8oc2VhcmNoKVxyXG5cclxuICAgIHZhciBzcGFjZVNlYXJjaGVzID0gW11cclxuICAgIGlmKGluZm8uY29udGFpbnNTcGFjZSkge1xyXG4gICAgICB2YXIgc2VhcmNoZXMgPSBzZWFyY2guc3BsaXQoL1xccysvKVxyXG4gICAgICBzZWFyY2hlcyA9IFsuLi5uZXcgU2V0KHNlYXJjaGVzKV0gLy8gZGlzdGluY3RcclxuICAgICAgZm9yKHZhciBpPTA7IGk8c2VhcmNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZihzZWFyY2hlc1tpXSA9PT0gJycpIGNvbnRpbnVlXHJcbiAgICAgICAgdmFyIF9pbmZvID0gcHJlcGFyZUxvd2VySW5mbyhzZWFyY2hlc1tpXSlcclxuICAgICAgICBzcGFjZVNlYXJjaGVzLnB1c2goe2xvd2VyQ29kZXM6X2luZm8ubG93ZXJDb2RlcywgX2xvd2VyOnNlYXJjaGVzW2ldLnRvTG93ZXJDYXNlKCksIGNvbnRhaW5zU3BhY2U6ZmFsc2V9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtsb3dlckNvZGVzOiBpbmZvLmxvd2VyQ29kZXMsIF9sb3dlcjogaW5mby5fbG93ZXIsIGNvbnRhaW5zU3BhY2U6IGluZm8uY29udGFpbnNTcGFjZSwgYml0ZmxhZ3M6IGluZm8uYml0ZmxhZ3MsIHNwYWNlU2VhcmNoZXM6IHNwYWNlU2VhcmNoZXN9XHJcbiAgfVxyXG5cclxuXHJcblxyXG4gIHZhciBnZXRQcmVwYXJlZCA9ICh0YXJnZXQpID0+IHtcclxuICAgIGlmKHRhcmdldC5sZW5ndGggPiA5OTkpIHJldHVybiBwcmVwYXJlKHRhcmdldCkgLy8gZG9uJ3QgY2FjaGUgaHVnZSB0YXJnZXRzXHJcbiAgICB2YXIgdGFyZ2V0UHJlcGFyZWQgPSBwcmVwYXJlZENhY2hlLmdldCh0YXJnZXQpXHJcbiAgICBpZih0YXJnZXRQcmVwYXJlZCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGFyZ2V0UHJlcGFyZWRcclxuICAgIHRhcmdldFByZXBhcmVkID0gcHJlcGFyZSh0YXJnZXQpXHJcbiAgICBwcmVwYXJlZENhY2hlLnNldCh0YXJnZXQsIHRhcmdldFByZXBhcmVkKVxyXG4gICAgcmV0dXJuIHRhcmdldFByZXBhcmVkXHJcbiAgfVxyXG4gIHZhciBnZXRQcmVwYXJlZFNlYXJjaCA9IChzZWFyY2gpID0+IHtcclxuICAgIGlmKHNlYXJjaC5sZW5ndGggPiA5OTkpIHJldHVybiBwcmVwYXJlU2VhcmNoKHNlYXJjaCkgLy8gZG9uJ3QgY2FjaGUgaHVnZSBzZWFyY2hlc1xyXG4gICAgdmFyIHNlYXJjaFByZXBhcmVkID0gcHJlcGFyZWRTZWFyY2hDYWNoZS5nZXQoc2VhcmNoKVxyXG4gICAgaWYoc2VhcmNoUHJlcGFyZWQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHNlYXJjaFByZXBhcmVkXHJcbiAgICBzZWFyY2hQcmVwYXJlZCA9IHByZXBhcmVTZWFyY2goc2VhcmNoKVxyXG4gICAgcHJlcGFyZWRTZWFyY2hDYWNoZS5zZXQoc2VhcmNoLCBzZWFyY2hQcmVwYXJlZClcclxuICAgIHJldHVybiBzZWFyY2hQcmVwYXJlZFxyXG4gIH1cclxuXHJcblxyXG4gIHZhciBhbGwgPSAodGFyZ2V0cywgb3B0aW9ucykgPT4ge1xyXG4gICAgdmFyIHJlc3VsdHMgPSBbXTsgcmVzdWx0cy50b3RhbCA9IHRhcmdldHMubGVuZ3RoIC8vIHRoaXMgdG90YWwgY2FuIGJlIHdyb25nIGlmIHNvbWUgdGFyZ2V0cyBhcmUgc2tpcHBlZFxyXG5cclxuICAgIHZhciBsaW1pdCA9IG9wdGlvbnM/LmxpbWl0IHx8IElORklOSVRZXHJcblxyXG4gICAgaWYob3B0aW9ucz8ua2V5KSB7XHJcbiAgICAgIGZvcih2YXIgaT0wO2k8dGFyZ2V0cy5sZW5ndGg7aSsrKSB7IHZhciBvYmogPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwgb3B0aW9ucy5rZXkpXHJcbiAgICAgICAgaWYodGFyZ2V0ID09IE5VTEwpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBuZXdfcmVzdWx0KHRhcmdldC50YXJnZXQsIHtfc2NvcmU6IHRhcmdldC5fc2NvcmUsIG9iajogb2JqfSlcclxuICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTsgaWYocmVzdWx0cy5sZW5ndGggPj0gbGltaXQpIHJldHVybiByZXN1bHRzXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZihvcHRpb25zPy5rZXlzKSB7XHJcbiAgICAgIGZvcih2YXIgaT0wO2k8dGFyZ2V0cy5sZW5ndGg7aSsrKSB7IHZhciBvYmogPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgdmFyIG9ialJlc3VsdHMgPSBuZXcgS2V5c1Jlc3VsdChvcHRpb25zLmtleXMubGVuZ3RoKVxyXG4gICAgICAgIGZvciAodmFyIGtleUkgPSBvcHRpb25zLmtleXMubGVuZ3RoIC0gMTsga2V5SSA+PSAwOyAtLWtleUkpIHtcclxuICAgICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIG9wdGlvbnMua2V5c1trZXlJXSlcclxuICAgICAgICAgIGlmKCF0YXJnZXQpIHsgb2JqUmVzdWx0c1trZXlJXSA9IG5vVGFyZ2V0OyBjb250aW51ZSB9XHJcbiAgICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcbiAgICAgICAgICB0YXJnZXQuX3Njb3JlID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgICAgIHRhcmdldC5faW5kZXhlcy5sZW4gPSAwXHJcbiAgICAgICAgICBvYmpSZXN1bHRzW2tleUldID0gdGFyZ2V0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9ialJlc3VsdHMub2JqID0gb2JqXHJcbiAgICAgICAgb2JqUmVzdWx0cy5fc2NvcmUgPSBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgICAgIHJlc3VsdHMucHVzaChvYmpSZXN1bHRzKTsgaWYocmVzdWx0cy5sZW5ndGggPj0gbGltaXQpIHJldHVybiByZXN1bHRzXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvcih2YXIgaT0wO2k8dGFyZ2V0cy5sZW5ndGg7aSsrKSB7IHZhciB0YXJnZXQgPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgaWYodGFyZ2V0ID09IE5VTEwpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG4gICAgICAgIHRhcmdldC5fc2NvcmUgPSBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgICAgIHRhcmdldC5faW5kZXhlcy5sZW4gPSAwXHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRhcmdldCk7IGlmKHJlc3VsdHMubGVuZ3RoID49IGxpbWl0KSByZXR1cm4gcmVzdWx0c1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdHNcclxuICB9XHJcblxyXG5cclxuICB2YXIgYWxnb3JpdGhtID0gKHByZXBhcmVkU2VhcmNoLCBwcmVwYXJlZCwgYWxsb3dTcGFjZXM9ZmFsc2UsIGFsbG93UGFydGlhbE1hdGNoPWZhbHNlKSA9PiB7XHJcbiAgICBpZihhbGxvd1NwYWNlcz09PWZhbHNlICYmIHByZXBhcmVkU2VhcmNoLmNvbnRhaW5zU3BhY2UpIHJldHVybiBhbGdvcml0aG1TcGFjZXMocHJlcGFyZWRTZWFyY2gsIHByZXBhcmVkLCBhbGxvd1BhcnRpYWxNYXRjaClcclxuXHJcbiAgICB2YXIgc2VhcmNoTG93ZXIgICAgICA9IHByZXBhcmVkU2VhcmNoLl9sb3dlclxyXG4gICAgdmFyIHNlYXJjaExvd2VyQ29kZXMgPSBwcmVwYXJlZFNlYXJjaC5sb3dlckNvZGVzXHJcbiAgICB2YXIgc2VhcmNoTG93ZXJDb2RlICA9IHNlYXJjaExvd2VyQ29kZXNbMF1cclxuICAgIHZhciB0YXJnZXRMb3dlckNvZGVzID0gcHJlcGFyZWQuX3RhcmdldExvd2VyQ29kZXNcclxuICAgIHZhciBzZWFyY2hMZW4gICAgICAgID0gc2VhcmNoTG93ZXJDb2Rlcy5sZW5ndGhcclxuICAgIHZhciB0YXJnZXRMZW4gICAgICAgID0gdGFyZ2V0TG93ZXJDb2Rlcy5sZW5ndGhcclxuICAgIHZhciBzZWFyY2hJICAgICAgICAgID0gMCAvLyB3aGVyZSB3ZSBhdFxyXG4gICAgdmFyIHRhcmdldEkgICAgICAgICAgPSAwIC8vIHdoZXJlIHlvdSBhdFxyXG4gICAgdmFyIG1hdGNoZXNTaW1wbGVMZW4gPSAwXHJcblxyXG4gICAgLy8gdmVyeSBiYXNpYyBmdXp6eSBtYXRjaDsgdG8gcmVtb3ZlIG5vbi1tYXRjaGluZyB0YXJnZXRzIEFTQVAhXHJcbiAgICAvLyB3YWxrIHRocm91Z2ggdGFyZ2V0LiBmaW5kIHNlcXVlbnRpYWwgbWF0Y2hlcy5cclxuICAgIC8vIGlmIGFsbCBjaGFycyBhcmVuJ3QgZm91bmQgdGhlbiBleGl0XHJcbiAgICBmb3IoOzspIHtcclxuICAgICAgdmFyIGlzTWF0Y2ggPSBzZWFyY2hMb3dlckNvZGUgPT09IHRhcmdldExvd2VyQ29kZXNbdGFyZ2V0SV1cclxuICAgICAgaWYoaXNNYXRjaCkge1xyXG4gICAgICAgIG1hdGNoZXNTaW1wbGVbbWF0Y2hlc1NpbXBsZUxlbisrXSA9IHRhcmdldElcclxuICAgICAgICArK3NlYXJjaEk7IGlmKHNlYXJjaEkgPT09IHNlYXJjaExlbikgYnJlYWtcclxuICAgICAgICBzZWFyY2hMb3dlckNvZGUgPSBzZWFyY2hMb3dlckNvZGVzW3NlYXJjaEldXHJcbiAgICAgIH1cclxuICAgICAgKyt0YXJnZXRJOyBpZih0YXJnZXRJID49IHRhcmdldExlbikgcmV0dXJuIE5VTEwgLy8gRmFpbGVkIHRvIGZpbmQgc2VhcmNoSVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzZWFyY2hJID0gMFxyXG4gICAgdmFyIHN1Y2Nlc3NTdHJpY3QgPSBmYWxzZVxyXG4gICAgdmFyIG1hdGNoZXNTdHJpY3RMZW4gPSAwXHJcblxyXG4gICAgdmFyIG5leHRCZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZWQuX25leHRCZWdpbm5pbmdJbmRleGVzXHJcbiAgICBpZihuZXh0QmVnaW5uaW5nSW5kZXhlcyA9PT0gTlVMTCkgbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBwcmVwYXJlZC5fbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBwcmVwYXJlTmV4dEJlZ2lubmluZ0luZGV4ZXMocHJlcGFyZWQudGFyZ2V0KVxyXG4gICAgdGFyZ2V0SSA9IG1hdGNoZXNTaW1wbGVbMF09PT0wID8gMCA6IG5leHRCZWdpbm5pbmdJbmRleGVzW21hdGNoZXNTaW1wbGVbMF0tMV1cclxuXHJcbiAgICAvLyBPdXIgdGFyZ2V0IHN0cmluZyBzdWNjZXNzZnVsbHkgbWF0Y2hlZCBhbGwgY2hhcmFjdGVycyBpbiBzZXF1ZW5jZSFcclxuICAgIC8vIExldCdzIHRyeSBhIG1vcmUgYWR2YW5jZWQgYW5kIHN0cmljdCB0ZXN0IHRvIGltcHJvdmUgdGhlIHNjb3JlXHJcbiAgICAvLyBvbmx5IGNvdW50IGl0IGFzIGEgbWF0Y2ggaWYgaXQncyBjb25zZWN1dGl2ZSBvciBhIGJlZ2lubmluZyBjaGFyYWN0ZXIhXHJcbiAgICB2YXIgYmFja3RyYWNrQ291bnQgPSAwXHJcbiAgICBpZih0YXJnZXRJICE9PSB0YXJnZXRMZW4pIGZvcig7Oykge1xyXG4gICAgICBpZih0YXJnZXRJID49IHRhcmdldExlbikge1xyXG4gICAgICAgIC8vIFdlIGZhaWxlZCB0byBmaW5kIGEgZ29vZCBzcG90IGZvciB0aGlzIHNlYXJjaCBjaGFyLCBnbyBiYWNrIHRvIHRoZSBwcmV2aW91cyBzZWFyY2ggY2hhciBhbmQgZm9yY2UgaXQgZm9yd2FyZFxyXG4gICAgICAgIGlmKHNlYXJjaEkgPD0gMCkgYnJlYWsgLy8gV2UgZmFpbGVkIHRvIHB1c2ggY2hhcnMgZm9yd2FyZCBmb3IgYSBiZXR0ZXIgbWF0Y2hcclxuXHJcbiAgICAgICAgKytiYWNrdHJhY2tDb3VudDsgaWYoYmFja3RyYWNrQ291bnQgPiAyMDApIGJyZWFrIC8vIGV4cG9uZW50aWFsIGJhY2t0cmFja2luZyBpcyB0YWtpbmcgdG9vIGxvbmcsIGp1c3QgZ2l2ZSB1cCBhbmQgcmV0dXJuIGEgYmFkIG1hdGNoXHJcblxyXG4gICAgICAgIC0tc2VhcmNoSVxyXG4gICAgICAgIHZhciBsYXN0TWF0Y2ggPSBtYXRjaGVzU3RyaWN0Wy0tbWF0Y2hlc1N0cmljdExlbl1cclxuICAgICAgICB0YXJnZXRJID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNbbGFzdE1hdGNoXVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgaXNNYXRjaCA9IHNlYXJjaExvd2VyQ29kZXNbc2VhcmNoSV0gPT09IHRhcmdldExvd2VyQ29kZXNbdGFyZ2V0SV1cclxuICAgICAgICBpZihpc01hdGNoKSB7XHJcbiAgICAgICAgICBtYXRjaGVzU3RyaWN0W21hdGNoZXNTdHJpY3RMZW4rK10gPSB0YXJnZXRJXHJcbiAgICAgICAgICArK3NlYXJjaEk7IGlmKHNlYXJjaEkgPT09IHNlYXJjaExlbikgeyBzdWNjZXNzU3RyaWN0ID0gdHJ1ZTsgYnJlYWsgfVxyXG4gICAgICAgICAgKyt0YXJnZXRJXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRhcmdldEkgPSBuZXh0QmVnaW5uaW5nSW5kZXhlc1t0YXJnZXRJXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNoZWNrIGlmIGl0J3MgYSBzdWJzdHJpbmcgbWF0Y2hcclxuICAgIHZhciBzdWJzdHJpbmdJbmRleCA9IHNlYXJjaExlbiA8PSAxID8gLTEgOiBwcmVwYXJlZC5fdGFyZ2V0TG93ZXIuaW5kZXhPZihzZWFyY2hMb3dlciwgbWF0Y2hlc1NpbXBsZVswXSkgLy8gcGVyZjogdGhpcyBpcyBzbG93XHJcbiAgICB2YXIgaXNTdWJzdHJpbmcgPSAhIX5zdWJzdHJpbmdJbmRleFxyXG4gICAgdmFyIGlzU3Vic3RyaW5nQmVnaW5uaW5nID0gIWlzU3Vic3RyaW5nID8gZmFsc2UgOiBzdWJzdHJpbmdJbmRleD09PTAgfHwgcHJlcGFyZWQuX25leHRCZWdpbm5pbmdJbmRleGVzW3N1YnN0cmluZ0luZGV4LTFdID09PSBzdWJzdHJpbmdJbmRleFxyXG5cclxuICAgIC8vIGlmIGl0J3MgYSBzdWJzdHJpbmcgbWF0Y2ggYnV0IG5vdCBhdCBhIGJlZ2lubmluZyBpbmRleCwgbGV0J3MgdHJ5IHRvIGZpbmQgYSBzdWJzdHJpbmcgc3RhcnRpbmcgYXQgYSBiZWdpbm5pbmcgaW5kZXggZm9yIGEgYmV0dGVyIHNjb3JlXHJcbiAgICBpZihpc1N1YnN0cmluZyAmJiAhaXNTdWJzdHJpbmdCZWdpbm5pbmcpIHtcclxuICAgICAgZm9yKHZhciBpPTA7IGk8bmV4dEJlZ2lubmluZ0luZGV4ZXMubGVuZ3RoOyBpPW5leHRCZWdpbm5pbmdJbmRleGVzW2ldKSB7XHJcbiAgICAgICAgaWYoaSA8PSBzdWJzdHJpbmdJbmRleCkgY29udGludWVcclxuXHJcbiAgICAgICAgZm9yKHZhciBzPTA7IHM8c2VhcmNoTGVuOyBzKyspIGlmKHNlYXJjaExvd2VyQ29kZXNbc10gIT09IHByZXBhcmVkLl90YXJnZXRMb3dlckNvZGVzW2krc10pIGJyZWFrXHJcbiAgICAgICAgaWYocyA9PT0gc2VhcmNoTGVuKSB7IHN1YnN0cmluZ0luZGV4ID0gaTsgaXNTdWJzdHJpbmdCZWdpbm5pbmcgPSB0cnVlOyBicmVhayB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB0YWxseSB1cCB0aGUgc2NvcmUgJiBrZWVwIHRyYWNrIG9mIG1hdGNoZXMgZm9yIGhpZ2hsaWdodGluZyBsYXRlclxyXG4gICAgLy8gaWYgaXQncyBhIHNpbXBsZSBtYXRjaCwgd2UnbGwgc3dpdGNoIHRvIGEgc3Vic3RyaW5nIG1hdGNoIGlmIGEgc3Vic3RyaW5nIGV4aXN0c1xyXG4gICAgLy8gaWYgaXQncyBhIHN0cmljdCBtYXRjaCwgd2UnbGwgc3dpdGNoIHRvIGEgc3Vic3RyaW5nIG1hdGNoIG9ubHkgaWYgdGhhdCdzIGEgYmV0dGVyIHNjb3JlXHJcblxyXG4gICAgdmFyIGNhbGN1bGF0ZVNjb3JlID0gbWF0Y2hlcyA9PiB7XHJcbiAgICAgIHZhciBzY29yZSA9IDBcclxuXHJcbiAgICAgIHZhciBleHRyYU1hdGNoR3JvdXBDb3VudCA9IDBcclxuICAgICAgZm9yKHZhciBpID0gMTsgaSA8IHNlYXJjaExlbjsgKytpKSB7XHJcbiAgICAgICAgaWYobWF0Y2hlc1tpXSAtIG1hdGNoZXNbaS0xXSAhPT0gMSkge3Njb3JlIC09IG1hdGNoZXNbaV07ICsrZXh0cmFNYXRjaEdyb3VwQ291bnR9XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHVubWF0Y2hlZERpc3RhbmNlID0gbWF0Y2hlc1tzZWFyY2hMZW4tMV0gLSBtYXRjaGVzWzBdIC0gKHNlYXJjaExlbi0xKVxyXG5cclxuICAgICAgc2NvcmUgLT0gKDEyK3VubWF0Y2hlZERpc3RhbmNlKSAqIGV4dHJhTWF0Y2hHcm91cENvdW50IC8vIHBlbmFsaXR5IGZvciBtb3JlIGdyb3Vwc1xyXG5cclxuICAgICAgaWYobWF0Y2hlc1swXSAhPT0gMCkgc2NvcmUgLT0gbWF0Y2hlc1swXSptYXRjaGVzWzBdKi4yIC8vIHBlbmFsaXR5IGZvciBub3Qgc3RhcnRpbmcgbmVhciB0aGUgYmVnaW5uaW5nXHJcblxyXG4gICAgICBpZighc3VjY2Vzc1N0cmljdCkge1xyXG4gICAgICAgIHNjb3JlICo9IDEwMDBcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBzdWNjZXNzU3RyaWN0IG9uIGEgdGFyZ2V0IHdpdGggdG9vIG1hbnkgYmVnaW5uaW5nIGluZGV4ZXMgbG9zZXMgcG9pbnRzIGZvciBiZWluZyBhIGJhZCB0YXJnZXRcclxuICAgICAgICB2YXIgdW5pcXVlQmVnaW5uaW5nSW5kZXhlcyA9IDFcclxuICAgICAgICBmb3IodmFyIGkgPSBuZXh0QmVnaW5uaW5nSW5kZXhlc1swXTsgaSA8IHRhcmdldExlbjsgaT1uZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSkgKyt1bmlxdWVCZWdpbm5pbmdJbmRleGVzXHJcblxyXG4gICAgICAgIGlmKHVuaXF1ZUJlZ2lubmluZ0luZGV4ZXMgPiAyNCkgc2NvcmUgKj0gKHVuaXF1ZUJlZ2lubmluZ0luZGV4ZXMtMjQpKjEwIC8vIHF1aXRlIGFyYml0cmFyeSBudW1iZXJzIGhlcmUgLi4uXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNjb3JlIC09ICh0YXJnZXRMZW4gLSBzZWFyY2hMZW4pLzIgLy8gcGVuYWxpdHkgZm9yIGxvbmdlciB0YXJnZXRzXHJcblxyXG4gICAgICBpZihpc1N1YnN0cmluZykgICAgICAgICAgc2NvcmUgLz0gMStzZWFyY2hMZW4qc2VhcmNoTGVuKjEgLy8gYm9udXMgZm9yIGJlaW5nIGEgZnVsbCBzdWJzdHJpbmdcclxuICAgICAgaWYoaXNTdWJzdHJpbmdCZWdpbm5pbmcpIHNjb3JlIC89IDErc2VhcmNoTGVuKnNlYXJjaExlbioxIC8vIGJvbnVzIGZvciBzdWJzdHJpbmcgc3RhcnRpbmcgb24gYSBiZWdpbm5pbmdJbmRleFxyXG5cclxuICAgICAgc2NvcmUgLT0gKHRhcmdldExlbiAtIHNlYXJjaExlbikvMiAvLyBwZW5hbGl0eSBmb3IgbG9uZ2VyIHRhcmdldHNcclxuXHJcbiAgICAgIHJldHVybiBzY29yZVxyXG4gICAgfVxyXG5cclxuICAgIGlmKCFzdWNjZXNzU3RyaWN0KSB7XHJcbiAgICAgIGlmKGlzU3Vic3RyaW5nKSBmb3IodmFyIGk9MDsgaTxzZWFyY2hMZW47ICsraSkgbWF0Y2hlc1NpbXBsZVtpXSA9IHN1YnN0cmluZ0luZGV4K2kgLy8gYXQgdGhpcyBwb2ludCBpdCdzIHNhZmUgdG8gb3ZlcndyaXRlIG1hdGNoZWhzU2ltcGxlIHdpdGggc3Vic3RyIG1hdGNoZXNcclxuICAgICAgdmFyIG1hdGNoZXNCZXN0ID0gbWF0Y2hlc1NpbXBsZVxyXG4gICAgICB2YXIgc2NvcmUgPSBjYWxjdWxhdGVTY29yZShtYXRjaGVzQmVzdClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmKGlzU3Vic3RyaW5nQmVnaW5uaW5nKSB7XHJcbiAgICAgICAgZm9yKHZhciBpPTA7IGk8c2VhcmNoTGVuOyArK2kpIG1hdGNoZXNTaW1wbGVbaV0gPSBzdWJzdHJpbmdJbmRleCtpIC8vIGF0IHRoaXMgcG9pbnQgaXQncyBzYWZlIHRvIG92ZXJ3cml0ZSBtYXRjaGVoc1NpbXBsZSB3aXRoIHN1YnN0ciBtYXRjaGVzXHJcbiAgICAgICAgdmFyIG1hdGNoZXNCZXN0ID0gbWF0Y2hlc1NpbXBsZVxyXG4gICAgICAgIHZhciBzY29yZSA9IGNhbGN1bGF0ZVNjb3JlKG1hdGNoZXNTaW1wbGUpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIG1hdGNoZXNCZXN0ID0gbWF0Y2hlc1N0cmljdFxyXG4gICAgICAgIHZhciBzY29yZSA9IGNhbGN1bGF0ZVNjb3JlKG1hdGNoZXNTdHJpY3QpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcmVwYXJlZC5fc2NvcmUgPSBzY29yZVxyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzZWFyY2hMZW47ICsraSkgcHJlcGFyZWQuX2luZGV4ZXNbaV0gPSBtYXRjaGVzQmVzdFtpXVxyXG4gICAgcHJlcGFyZWQuX2luZGV4ZXMubGVuID0gc2VhcmNoTGVuXHJcblxyXG4gICAgY29uc3QgcmVzdWx0ICAgID0gbmV3IFJlc3VsdCgpXHJcbiAgICByZXN1bHQudGFyZ2V0ICAgPSBwcmVwYXJlZC50YXJnZXRcclxuICAgIHJlc3VsdC5fc2NvcmUgICA9IHByZXBhcmVkLl9zY29yZVxyXG4gICAgcmVzdWx0Ll9pbmRleGVzID0gcHJlcGFyZWQuX2luZGV4ZXNcclxuICAgIHJldHVybiByZXN1bHRcclxuICB9XHJcbiAgdmFyIGFsZ29yaXRobVNwYWNlcyA9IChwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0LCBhbGxvd1BhcnRpYWxNYXRjaCkgPT4ge1xyXG4gICAgdmFyIHNlZW5faW5kZXhlcyA9IG5ldyBTZXQoKVxyXG4gICAgdmFyIHNjb3JlID0gMFxyXG4gICAgdmFyIHJlc3VsdCA9IE5VTExcclxuXHJcbiAgICB2YXIgZmlyc3Rfc2Vlbl9pbmRleF9sYXN0X3NlYXJjaCA9IDBcclxuICAgIHZhciBzZWFyY2hlcyA9IHByZXBhcmVkU2VhcmNoLnNwYWNlU2VhcmNoZXNcclxuICAgIHZhciBzZWFyY2hlc0xlbiA9IHNlYXJjaGVzLmxlbmd0aFxyXG4gICAgdmFyIGNoYW5nZXNsZW4gPSAwXHJcblxyXG4gICAgLy8gUmV0dXJuIF9uZXh0QmVnaW5uaW5nSW5kZXhlcyBiYWNrIHRvIGl0cyBub3JtYWwgc3RhdGVcclxuICAgIHZhciByZXNldE5leHRCZWdpbm5pbmdJbmRleGVzID0gKCkgPT4ge1xyXG4gICAgICBmb3IobGV0IGk9Y2hhbmdlc2xlbi0xOyBpPj0wOyBpLS0pIHRhcmdldC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNbbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzW2kqMiArIDBdXSA9IG5leHRCZWdpbm5pbmdJbmRleGVzQ2hhbmdlc1tpKjIgKyAxXVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBoYXNBdExlYXN0MU1hdGNoID0gZmFsc2VcclxuICAgIGZvcih2YXIgaT0wOyBpPHNlYXJjaGVzTGVuOyArK2kpIHtcclxuICAgICAgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0gPSBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgICB2YXIgc2VhcmNoID0gc2VhcmNoZXNbaV1cclxuXHJcbiAgICAgIHJlc3VsdCA9IGFsZ29yaXRobShzZWFyY2gsIHRhcmdldClcclxuICAgICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2gpIHtcclxuICAgICAgICBpZihyZXN1bHQgPT09IE5VTEwpIGNvbnRpbnVlXHJcbiAgICAgICAgaGFzQXRMZWFzdDFNYXRjaCA9IHRydWVcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZihyZXN1bHQgPT09IE5VTEwpIHtyZXNldE5leHRCZWdpbm5pbmdJbmRleGVzKCk7IHJldHVybiBOVUxMfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpZiBub3QgdGhlIGxhc3Qgc2VhcmNoLCB3ZSBuZWVkIHRvIG11dGF0ZSBfbmV4dEJlZ2lubmluZ0luZGV4ZXMgZm9yIHRoZSBuZXh0IHNlYXJjaFxyXG4gICAgICB2YXIgaXNUaGVMYXN0U2VhcmNoID0gaSA9PT0gc2VhcmNoZXNMZW4gLSAxXHJcbiAgICAgIGlmKCFpc1RoZUxhc3RTZWFyY2gpIHtcclxuICAgICAgICB2YXIgaW5kZXhlcyA9IHJlc3VsdC5faW5kZXhlc1xyXG5cclxuICAgICAgICB2YXIgaW5kZXhlc0lzQ29uc2VjdXRpdmVTdWJzdHJpbmcgPSB0cnVlXHJcbiAgICAgICAgZm9yKGxldCBpPTA7IGk8aW5kZXhlcy5sZW4tMTsgaSsrKSB7XHJcbiAgICAgICAgICBpZihpbmRleGVzW2krMV0gLSBpbmRleGVzW2ldICE9PSAxKSB7XHJcbiAgICAgICAgICAgIGluZGV4ZXNJc0NvbnNlY3V0aXZlU3Vic3RyaW5nID0gZmFsc2U7IGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoaW5kZXhlc0lzQ29uc2VjdXRpdmVTdWJzdHJpbmcpIHtcclxuICAgICAgICAgIHZhciBuZXdCZWdpbm5pbmdJbmRleCA9IGluZGV4ZXNbaW5kZXhlcy5sZW4tMV0gKyAxXHJcbiAgICAgICAgICB2YXIgdG9SZXBsYWNlID0gdGFyZ2V0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlc1tuZXdCZWdpbm5pbmdJbmRleC0xXVxyXG4gICAgICAgICAgZm9yKGxldCBpPW5ld0JlZ2lubmluZ0luZGV4LTE7IGk+PTA7IGktLSkge1xyXG4gICAgICAgICAgICBpZih0b1JlcGxhY2UgIT09IHRhcmdldC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0pIGJyZWFrXHJcbiAgICAgICAgICAgIHRhcmdldC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0gPSBuZXdCZWdpbm5pbmdJbmRleFxyXG4gICAgICAgICAgICBuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXNbY2hhbmdlc2xlbioyICsgMF0gPSBpXHJcbiAgICAgICAgICAgIG5leHRCZWdpbm5pbmdJbmRleGVzQ2hhbmdlc1tjaGFuZ2VzbGVuKjIgKyAxXSA9IHRvUmVwbGFjZVxyXG4gICAgICAgICAgICBjaGFuZ2VzbGVuKytcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNjb3JlICs9IHJlc3VsdC5fc2NvcmUgLyBzZWFyY2hlc0xlblxyXG4gICAgICBhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA9IHJlc3VsdC5fc2NvcmUgLyBzZWFyY2hlc0xlblxyXG5cclxuICAgICAgLy8gZG9jayBwb2ludHMgYmFzZWQgb24gb3JkZXIgb3RoZXJ3aXNlIFwiYyBtYW5cIiByZXR1cm5zIE1hbmlmZXN0LmNwcCBpbnN0ZWFkIG9mIENoZWF0TWFuYWdlci5oXHJcbiAgICAgIGlmKHJlc3VsdC5faW5kZXhlc1swXSA8IGZpcnN0X3NlZW5faW5kZXhfbGFzdF9zZWFyY2gpIHtcclxuICAgICAgICBzY29yZSAtPSAoZmlyc3Rfc2Vlbl9pbmRleF9sYXN0X3NlYXJjaCAtIHJlc3VsdC5faW5kZXhlc1swXSkgKiAyXHJcbiAgICAgIH1cclxuICAgICAgZmlyc3Rfc2Vlbl9pbmRleF9sYXN0X3NlYXJjaCA9IHJlc3VsdC5faW5kZXhlc1swXVxyXG5cclxuICAgICAgZm9yKHZhciBqPTA7IGo8cmVzdWx0Ll9pbmRleGVzLmxlbjsgKytqKSBzZWVuX2luZGV4ZXMuYWRkKHJlc3VsdC5faW5kZXhlc1tqXSlcclxuICAgIH1cclxuXHJcbiAgICBpZihhbGxvd1BhcnRpYWxNYXRjaCAmJiAhaGFzQXRMZWFzdDFNYXRjaCkgcmV0dXJuIE5VTExcclxuXHJcbiAgICByZXNldE5leHRCZWdpbm5pbmdJbmRleGVzKClcclxuXHJcbiAgICAvLyBhbGxvd3MgYSBzZWFyY2ggd2l0aCBzcGFjZXMgdGhhdCdzIGFuIGV4YWN0IHN1YnN0cmluZyB0byBzY29yZSB3ZWxsXHJcbiAgICB2YXIgYWxsb3dTcGFjZXNSZXN1bHQgPSBhbGdvcml0aG0ocHJlcGFyZWRTZWFyY2gsIHRhcmdldCwgLyphbGxvd1NwYWNlcz0qL3RydWUpXHJcbiAgICBpZihhbGxvd1NwYWNlc1Jlc3VsdCAhPT0gTlVMTCAmJiBhbGxvd1NwYWNlc1Jlc3VsdC5fc2NvcmUgPiBzY29yZSkge1xyXG4gICAgICBpZihhbGxvd1BhcnRpYWxNYXRjaCkge1xyXG4gICAgICAgIGZvcih2YXIgaT0wOyBpPHNlYXJjaGVzTGVuOyArK2kpIHtcclxuICAgICAgICAgIGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldID0gYWxsb3dTcGFjZXNSZXN1bHQuX3Njb3JlIC8gc2VhcmNoZXNMZW5cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFsbG93U3BhY2VzUmVzdWx0XHJcbiAgICB9XHJcblxyXG4gICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2gpIHJlc3VsdCA9IHRhcmdldFxyXG4gICAgcmVzdWx0Ll9zY29yZSA9IHNjb3JlXHJcblxyXG4gICAgdmFyIGkgPSAwXHJcbiAgICBmb3IgKGxldCBpbmRleCBvZiBzZWVuX2luZGV4ZXMpIHJlc3VsdC5faW5kZXhlc1tpKytdID0gaW5kZXhcclxuICAgIHJlc3VsdC5faW5kZXhlcy5sZW4gPSBpXHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG4gIH1cclxuXHJcbiAgLy8gd2UgdXNlIHRoaXMgaW5zdGVhZCBvZiBqdXN0IC5ub3JtYWxpemUoJ05GRCcpLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csICcnKSBiZWNhdXNlIHRoYXQgc2NyZXdzIHdpdGggamFwYW5lc2UgY2hhcmFjdGVyc1xyXG4gIHZhciByZW1vdmVfYWNjZW50cyA9IChzdHIpID0+IHN0ci5yZXBsYWNlKC9cXHB7U2NyaXB0PUxhdGlufSsvZ3UsIG1hdGNoID0+IG1hdGNoLm5vcm1hbGl6ZSgnTkZEJykpLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csICcnKVxyXG5cclxuICB2YXIgcHJlcGFyZUxvd2VySW5mbyA9IChzdHIpID0+IHtcclxuICAgIHN0ciA9IHJlbW92ZV9hY2NlbnRzKHN0cilcclxuICAgIHZhciBzdHJMZW4gPSBzdHIubGVuZ3RoXHJcbiAgICB2YXIgbG93ZXIgPSBzdHIudG9Mb3dlckNhc2UoKVxyXG4gICAgdmFyIGxvd2VyQ29kZXMgPSBbXSAvLyBuZXcgQXJyYXkoc3RyTGVuKSAgICBzcGFyc2UgYXJyYXkgaXMgdG9vIHNsb3dcclxuICAgIHZhciBiaXRmbGFncyA9IDBcclxuICAgIHZhciBjb250YWluc1NwYWNlID0gZmFsc2UgLy8gc3BhY2UgaXNuJ3Qgc3RvcmVkIGluIGJpdGZsYWdzIGJlY2F1c2Ugb2YgaG93IHNlYXJjaGluZyB3aXRoIGEgc3BhY2Ugd29ya3NcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc3RyTGVuOyArK2kpIHtcclxuICAgICAgdmFyIGxvd2VyQ29kZSA9IGxvd2VyQ29kZXNbaV0gPSBsb3dlci5jaGFyQ29kZUF0KGkpXHJcblxyXG4gICAgICBpZihsb3dlckNvZGUgPT09IDMyKSB7XHJcbiAgICAgICAgY29udGFpbnNTcGFjZSA9IHRydWVcclxuICAgICAgICBjb250aW51ZSAvLyBpdCdzIGltcG9ydGFudCB0aGF0IHdlIGRvbid0IHNldCBhbnkgYml0ZmxhZ3MgZm9yIHNwYWNlXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBiaXQgPSBsb3dlckNvZGU+PTk3JiZsb3dlckNvZGU8PTEyMiA/IGxvd2VyQ29kZS05NyAvLyBhbHBoYWJldFxyXG4gICAgICAgICAgICAgIDogbG93ZXJDb2RlPj00OCYmbG93ZXJDb2RlPD01NyAgPyAyNiAgICAgICAgICAgLy8gbnVtYmVyc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMyBiaXRzIGF2YWlsYWJsZVxyXG4gICAgICAgICAgICAgIDogbG93ZXJDb2RlPD0xMjcgICAgICAgICAgICAgICAgPyAzMCAgICAgICAgICAgLy8gb3RoZXIgYXNjaWlcclxuICAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMzEgICAgICAgICAgIC8vIG90aGVyIHV0ZjhcclxuICAgICAgYml0ZmxhZ3MgfD0gMTw8Yml0XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtsb3dlckNvZGVzOmxvd2VyQ29kZXMsIGJpdGZsYWdzOmJpdGZsYWdzLCBjb250YWluc1NwYWNlOmNvbnRhaW5zU3BhY2UsIF9sb3dlcjpsb3dlcn1cclxuICB9XHJcbiAgdmFyIHByZXBhcmVCZWdpbm5pbmdJbmRleGVzID0gKHRhcmdldCkgPT4ge1xyXG4gICAgdmFyIHRhcmdldExlbiA9IHRhcmdldC5sZW5ndGhcclxuICAgIHZhciBiZWdpbm5pbmdJbmRleGVzID0gW107IHZhciBiZWdpbm5pbmdJbmRleGVzTGVuID0gMFxyXG4gICAgdmFyIHdhc1VwcGVyID0gZmFsc2VcclxuICAgIHZhciB3YXNBbHBoYW51bSA9IGZhbHNlXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0TGVuOyArK2kpIHtcclxuICAgICAgdmFyIHRhcmdldENvZGUgPSB0YXJnZXQuY2hhckNvZGVBdChpKVxyXG4gICAgICB2YXIgaXNVcHBlciA9IHRhcmdldENvZGU+PTY1JiZ0YXJnZXRDb2RlPD05MFxyXG4gICAgICB2YXIgaXNBbHBoYW51bSA9IGlzVXBwZXIgfHwgdGFyZ2V0Q29kZT49OTcmJnRhcmdldENvZGU8PTEyMiB8fCB0YXJnZXRDb2RlPj00OCYmdGFyZ2V0Q29kZTw9NTdcclxuICAgICAgdmFyIGlzQmVnaW5uaW5nID0gaXNVcHBlciAmJiAhd2FzVXBwZXIgfHwgIXdhc0FscGhhbnVtIHx8ICFpc0FscGhhbnVtXHJcbiAgICAgIHdhc1VwcGVyID0gaXNVcHBlclxyXG4gICAgICB3YXNBbHBoYW51bSA9IGlzQWxwaGFudW1cclxuICAgICAgaWYoaXNCZWdpbm5pbmcpIGJlZ2lubmluZ0luZGV4ZXNbYmVnaW5uaW5nSW5kZXhlc0xlbisrXSA9IGlcclxuICAgIH1cclxuICAgIHJldHVybiBiZWdpbm5pbmdJbmRleGVzXHJcbiAgfVxyXG4gIHZhciBwcmVwYXJlTmV4dEJlZ2lubmluZ0luZGV4ZXMgPSAodGFyZ2V0KSA9PiB7XHJcbiAgICB0YXJnZXQgPSByZW1vdmVfYWNjZW50cyh0YXJnZXQpXHJcbiAgICB2YXIgdGFyZ2V0TGVuID0gdGFyZ2V0Lmxlbmd0aFxyXG4gICAgdmFyIGJlZ2lubmluZ0luZGV4ZXMgPSBwcmVwYXJlQmVnaW5uaW5nSW5kZXhlcyh0YXJnZXQpXHJcbiAgICB2YXIgbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBbXSAvLyBuZXcgQXJyYXkodGFyZ2V0TGVuKSAgICAgc3BhcnNlIGFycmF5IGlzIHRvbyBzbG93XHJcbiAgICB2YXIgbGFzdElzQmVnaW5uaW5nID0gYmVnaW5uaW5nSW5kZXhlc1swXVxyXG4gICAgdmFyIGxhc3RJc0JlZ2lubmluZ0kgPSAwXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0TGVuOyArK2kpIHtcclxuICAgICAgaWYobGFzdElzQmVnaW5uaW5nID4gaSkge1xyXG4gICAgICAgIG5leHRCZWdpbm5pbmdJbmRleGVzW2ldID0gbGFzdElzQmVnaW5uaW5nXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGFzdElzQmVnaW5uaW5nID0gYmVnaW5uaW5nSW5kZXhlc1srK2xhc3RJc0JlZ2lubmluZ0ldXHJcbiAgICAgICAgbmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0gPSBsYXN0SXNCZWdpbm5pbmc9PT11bmRlZmluZWQgPyB0YXJnZXRMZW4gOiBsYXN0SXNCZWdpbm5pbmdcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5leHRCZWdpbm5pbmdJbmRleGVzXHJcbiAgfVxyXG5cclxuICB2YXIgcHJlcGFyZWRDYWNoZSAgICAgICA9IG5ldyBNYXAoKVxyXG4gIHZhciBwcmVwYXJlZFNlYXJjaENhY2hlID0gbmV3IE1hcCgpXHJcblxyXG4gIC8vIHRoZSB0aGVvcnkgYmVoaW5kIHRoZXNlIGJlaW5nIGdsb2JhbHMgaXMgdG8gcmVkdWNlIGdhcmJhZ2UgY29sbGVjdGlvbiBieSBub3QgbWFraW5nIG5ldyBhcnJheXNcclxuICB2YXIgbWF0Y2hlc1NpbXBsZSA9IFtdOyB2YXIgbWF0Y2hlc1N0cmljdCA9IFtdXHJcbiAgdmFyIG5leHRCZWdpbm5pbmdJbmRleGVzQ2hhbmdlcyA9IFtdIC8vIGFsbG93cyBzdHJhdyBiZXJyeSB0byBtYXRjaCBzdHJhd2JlcnJ5IHdlbGwsIGJ5IG1vZGlmeWluZyB0aGUgZW5kIG9mIGEgc3Vic3RyaW5nIHRvIGJlIGNvbnNpZGVyZWQgYSBiZWdpbm5pbmcgaW5kZXggZm9yIHRoZSByZXN0IG9mIHRoZSBzZWFyY2hcclxuICB2YXIga2V5c1NwYWNlc0Jlc3RTY29yZXMgPSBbXTsgdmFyIGFsbG93UGFydGlhbE1hdGNoU2NvcmVzID0gW11cclxuICB2YXIgdG1wVGFyZ2V0cyA9IFtdOyB2YXIgdG1wUmVzdWx0cyA9IFtdXHJcblxyXG4gIC8vIHByb3AgPSAna2V5JyAgICAgICAgICAgICAgICAgIDIuNW1zIG9wdGltaXplZCBmb3IgdGhpcyBjYXNlLCBzZWVtcyB0byBiZSBhYm91dCBhcyBmYXN0IGFzIGRpcmVjdCBvYmpbcHJvcF1cclxuICAvLyBwcm9wID0gJ2tleTEua2V5MicgICAgICAgICAgICAxMG1zXHJcbiAgLy8gcHJvcCA9IFsna2V5MScsICdrZXkyJ10gICAgICAgMjdtc1xyXG4gIC8vIHByb3AgPSBvYmogPT4gb2JqLnRhZ3Muam9pbigpID8/bXNcclxuICB2YXIgZ2V0VmFsdWUgPSAob2JqLCBwcm9wKSA9PiB7XHJcbiAgICB2YXIgdG1wID0gb2JqW3Byb3BdOyBpZih0bXAgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRtcFxyXG4gICAgaWYodHlwZW9mIHByb3AgPT09ICdmdW5jdGlvbicpIHJldHVybiBwcm9wKG9iaikgLy8gdGhpcyBzaG91bGQgcnVuIGZpcnN0LiBidXQgdGhhdCBtYWtlcyBzdHJpbmcgcHJvcHMgc2xvd2VyXHJcbiAgICB2YXIgc2VncyA9IHByb3BcclxuICAgIGlmKCFBcnJheS5pc0FycmF5KHByb3ApKSBzZWdzID0gcHJvcC5zcGxpdCgnLicpXHJcbiAgICB2YXIgbGVuID0gc2Vncy5sZW5ndGhcclxuICAgIHZhciBpID0gLTFcclxuICAgIHdoaWxlIChvYmogJiYgKCsraSA8IGxlbikpIG9iaiA9IG9ialtzZWdzW2ldXVxyXG4gICAgcmV0dXJuIG9ialxyXG4gIH1cclxuXHJcbiAgdmFyIGlzUHJlcGFyZWQgPSAoeCkgPT4geyByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnICYmIHR5cGVvZiB4Ll9iaXRmbGFncyA9PT0gJ251bWJlcicgfVxyXG4gIHZhciBJTkZJTklUWSA9IEluZmluaXR5OyB2YXIgTkVHQVRJVkVfSU5GSU5JVFkgPSAtSU5GSU5JVFlcclxuICB2YXIgbm9SZXN1bHRzID0gW107IG5vUmVzdWx0cy50b3RhbCA9IDBcclxuICB2YXIgTlVMTCA9IG51bGxcclxuXHJcbiAgdmFyIG5vVGFyZ2V0ID0gcHJlcGFyZSgnJylcclxuXHJcbiAgLy8gSGFja2VkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2xlbWlyZS9GYXN0UHJpb3JpdHlRdWV1ZS5qc1xyXG4gIHZhciBmYXN0cHJpb3JpdHlxdWV1ZT1yPT57dmFyIGU9W10sbz0wLGE9e30sdj1yPT57Zm9yKHZhciBhPTAsdj1lW2FdLGM9MTtjPG87KXt2YXIgcz1jKzE7YT1jLHM8byYmZVtzXS5fc2NvcmU8ZVtjXS5fc2NvcmUmJihhPXMpLGVbYS0xPj4xXT1lW2FdLGM9MSsoYTw8MSl9Zm9yKHZhciBmPWEtMT4+MTthPjAmJnYuX3Njb3JlPGVbZl0uX3Njb3JlO2Y9KGE9ZiktMT4+MSllW2FdPWVbZl07ZVthXT12fTtyZXR1cm4gYS5hZGQ9KHI9Pnt2YXIgYT1vO2VbbysrXT1yO2Zvcih2YXIgdj1hLTE+PjE7YT4wJiZyLl9zY29yZTxlW3ZdLl9zY29yZTt2PShhPXYpLTE+PjEpZVthXT1lW3ZdO2VbYV09cn0pLGEucG9sbD0ocj0+e2lmKDAhPT1vKXt2YXIgYT1lWzBdO3JldHVybiBlWzBdPWVbLS1vXSx2KCksYX19KSxhLnBlZWs9KHI9PntpZigwIT09bylyZXR1cm4gZVswXX0pLGEucmVwbGFjZVRvcD0ocj0+e2VbMF09cix2KCl9KSxhfVxyXG4gIHZhciBxID0gZmFzdHByaW9yaXR5cXVldWUoKSAvLyByZXVzZSB0aGlzXHJcblxyXG4gIC8vIGZ1enp5c29ydCBpcyB3cml0dGVuIHRoaXMgd2F5IGZvciBtaW5pZmljYXRpb24uIGFsbCBuYW1lcyBhcmUgbWFuZ2VsZWQgdW5sZXNzIHF1b3RlZFxyXG4gIHJldHVybiB7J3NpbmdsZSc6c2luZ2xlLCAnZ28nOmdvLCAncHJlcGFyZSc6cHJlcGFyZSwgJ2NsZWFudXAnOmNsZWFudXB9XHJcbn0pIC8vIFVNRFxyXG4iLCAiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTcgR29vZ2xlIExMQ1xuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEJTRC0zLUNsYXVzZVxuICovXG5cbi8vIElNUE9SVEFOVDogdGhlc2UgaW1wb3J0cyBtdXN0IGJlIHR5cGUtb25seVxuaW1wb3J0IHR5cGUge0RpcmVjdGl2ZSwgRGlyZWN0aXZlUmVzdWx0LCBQYXJ0SW5mb30gZnJvbSAnLi9kaXJlY3RpdmUuanMnO1xuaW1wb3J0IHR5cGUge1RydXN0ZWRIVE1MLCBUcnVzdGVkVHlwZXNXaW5kb3d9IGZyb20gJ3RydXN0ZWQtdHlwZXMvbGliJztcblxuY29uc3QgREVWX01PREUgPSB0cnVlO1xuY29uc3QgRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTID0gdHJ1ZTtcbmNvbnN0IEVOQUJMRV9TSEFEWURPTV9OT1BBVENIID0gdHJ1ZTtcbmNvbnN0IE5PREVfTU9ERSA9IGZhbHNlO1xuXG4vLyBBbGxvd3MgbWluaWZpZXJzIHRvIHJlbmFtZSByZWZlcmVuY2VzIHRvIGdsb2JhbFRoaXNcbmNvbnN0IGdsb2JhbCA9IGdsb2JhbFRoaXM7XG5cbi8qKlxuICogQ29udGFpbnMgdHlwZXMgdGhhdCBhcmUgcGFydCBvZiB0aGUgdW5zdGFibGUgZGVidWcgQVBJLlxuICpcbiAqIEV2ZXJ5dGhpbmcgaW4gdGhpcyBBUEkgaXMgbm90IHN0YWJsZSBhbmQgbWF5IGNoYW5nZSBvciBiZSByZW1vdmVkIGluIHRoZSBmdXR1cmUsXG4gKiBldmVuIG9uIHBhdGNoIHJlbGVhc2VzLlxuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5hbWVzcGFjZVxuZXhwb3J0IG5hbWVzcGFjZSBMaXRVbnN0YWJsZSB7XG4gIC8qKlxuICAgKiBXaGVuIExpdCBpcyBydW5uaW5nIGluIGRldiBtb2RlIGFuZCBgd2luZG93LmVtaXRMaXREZWJ1Z0xvZ0V2ZW50c2AgaXMgdHJ1ZSxcbiAgICogd2Ugd2lsbCBlbWl0ICdsaXQtZGVidWcnIGV2ZW50cyB0byB3aW5kb3csIHdpdGggbGl2ZSBkZXRhaWxzIGFib3V0IHRoZSB1cGRhdGUgYW5kIHJlbmRlclxuICAgKiBsaWZlY3ljbGUuIFRoZXNlIGNhbiBiZSB1c2VmdWwgZm9yIHdyaXRpbmcgZGVidWcgdG9vbGluZyBhbmQgdmlzdWFsaXphdGlvbnMuXG4gICAqXG4gICAqIFBsZWFzZSBiZSBhd2FyZSB0aGF0IHJ1bm5pbmcgd2l0aCB3aW5kb3cuZW1pdExpdERlYnVnTG9nRXZlbnRzIGhhcyBwZXJmb3JtYW5jZSBvdmVyaGVhZCxcbiAgICogbWFraW5nIGNlcnRhaW4gb3BlcmF0aW9ucyB0aGF0IGFyZSBub3JtYWxseSB2ZXJ5IGNoZWFwIChsaWtlIGEgbm8tb3AgcmVuZGVyKSBtdWNoIHNsb3dlcixcbiAgICogYmVjYXVzZSB3ZSBtdXN0IGNvcHkgZGF0YSBhbmQgZGlzcGF0Y2ggZXZlbnRzLlxuICAgKi9cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1uYW1lc3BhY2VcbiAgZXhwb3J0IG5hbWVzcGFjZSBEZWJ1Z0xvZyB7XG4gICAgZXhwb3J0IHR5cGUgRW50cnkgPVxuICAgICAgfCBUZW1wbGF0ZVByZXBcbiAgICAgIHwgVGVtcGxhdGVJbnN0YW50aWF0ZWRcbiAgICAgIHwgVGVtcGxhdGVJbnN0YW50aWF0ZWRBbmRVcGRhdGVkXG4gICAgICB8IFRlbXBsYXRlVXBkYXRpbmdcbiAgICAgIHwgQmVnaW5SZW5kZXJcbiAgICAgIHwgRW5kUmVuZGVyXG4gICAgICB8IENvbW1pdFBhcnRFbnRyeVxuICAgICAgfCBTZXRQYXJ0VmFsdWU7XG4gICAgZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZVByZXAge1xuICAgICAga2luZDogJ3RlbXBsYXRlIHByZXAnO1xuICAgICAgdGVtcGxhdGU6IFRlbXBsYXRlO1xuICAgICAgc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXk7XG4gICAgICBjbG9uYWJsZVRlbXBsYXRlOiBIVE1MVGVtcGxhdGVFbGVtZW50O1xuICAgICAgcGFydHM6IFRlbXBsYXRlUGFydFtdO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIEJlZ2luUmVuZGVyIHtcbiAgICAgIGtpbmQ6ICdiZWdpbiByZW5kZXInO1xuICAgICAgaWQ6IG51bWJlcjtcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgY29udGFpbmVyOiBIVE1MRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQ7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgcGFydDogQ2hpbGRQYXJ0IHwgdW5kZWZpbmVkO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIEVuZFJlbmRlciB7XG4gICAgICBraW5kOiAnZW5kIHJlbmRlcic7XG4gICAgICBpZDogbnVtYmVyO1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBjb250YWluZXI6IEhUTUxFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudDtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBwYXJ0OiBDaGlsZFBhcnQ7XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVJbnN0YW50aWF0ZWQge1xuICAgICAga2luZDogJ3RlbXBsYXRlIGluc3RhbnRpYXRlZCc7XG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBDb21waWxlZFRlbXBsYXRlO1xuICAgICAgaW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2U7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgZnJhZ21lbnQ6IE5vZGU7XG4gICAgICBwYXJ0czogQXJyYXk8UGFydCB8IHVuZGVmaW5lZD47XG4gICAgICB2YWx1ZXM6IHVua25vd25bXTtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZUluc3RhbnRpYXRlZEFuZFVwZGF0ZWQge1xuICAgICAga2luZDogJ3RlbXBsYXRlIGluc3RhbnRpYXRlZCBhbmQgdXBkYXRlZCc7XG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBDb21waWxlZFRlbXBsYXRlO1xuICAgICAgaW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2U7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgZnJhZ21lbnQ6IE5vZGU7XG4gICAgICBwYXJ0czogQXJyYXk8UGFydCB8IHVuZGVmaW5lZD47XG4gICAgICB2YWx1ZXM6IHVua25vd25bXTtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZVVwZGF0aW5nIHtcbiAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSB1cGRhdGluZyc7XG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBDb21waWxlZFRlbXBsYXRlO1xuICAgICAgaW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2U7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgcGFydHM6IEFycmF5PFBhcnQgfCB1bmRlZmluZWQ+O1xuICAgICAgdmFsdWVzOiB1bmtub3duW107XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgU2V0UGFydFZhbHVlIHtcbiAgICAgIGtpbmQ6ICdzZXQgcGFydCc7XG4gICAgICBwYXJ0OiBQYXJ0O1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICB2YWx1ZUluZGV4OiBudW1iZXI7XG4gICAgICB2YWx1ZXM6IHVua25vd25bXTtcbiAgICAgIHRlbXBsYXRlSW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2U7XG4gICAgfVxuXG4gICAgZXhwb3J0IHR5cGUgQ29tbWl0UGFydEVudHJ5ID1cbiAgICAgIHwgQ29tbWl0Tm90aGluZ1RvQ2hpbGRFbnRyeVxuICAgICAgfCBDb21taXRUZXh0XG4gICAgICB8IENvbW1pdE5vZGVcbiAgICAgIHwgQ29tbWl0QXR0cmlidXRlXG4gICAgICB8IENvbW1pdFByb3BlcnR5XG4gICAgICB8IENvbW1pdEJvb2xlYW5BdHRyaWJ1dGVcbiAgICAgIHwgQ29tbWl0RXZlbnRMaXN0ZW5lclxuICAgICAgfCBDb21taXRUb0VsZW1lbnRCaW5kaW5nO1xuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXROb3RoaW5nVG9DaGlsZEVudHJ5IHtcbiAgICAgIGtpbmQ6ICdjb21taXQgbm90aGluZyB0byBjaGlsZCc7XG4gICAgICBzdGFydDogQ2hpbGROb2RlO1xuICAgICAgZW5kOiBDaGlsZE5vZGUgfCBudWxsO1xuICAgICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSB8IHVuZGVmaW5lZDtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRUZXh0IHtcbiAgICAgIGtpbmQ6ICdjb21taXQgdGV4dCc7XG4gICAgICBub2RlOiBUZXh0O1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0Tm9kZSB7XG4gICAgICBraW5kOiAnY29tbWl0IG5vZGUnO1xuICAgICAgc3RhcnQ6IE5vZGU7XG4gICAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlIHwgdW5kZWZpbmVkO1xuICAgICAgdmFsdWU6IE5vZGU7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0QXR0cmlidXRlIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgYXR0cmlidXRlJztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRQcm9wZXJ0eSB7XG4gICAgICBraW5kOiAnY29tbWl0IHByb3BlcnR5JztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRCb29sZWFuQXR0cmlidXRlIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgYm9vbGVhbiBhdHRyaWJ1dGUnO1xuICAgICAgZWxlbWVudDogRWxlbWVudDtcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgIHZhbHVlOiBib29sZWFuO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdEV2ZW50TGlzdGVuZXIge1xuICAgICAga2luZDogJ2NvbW1pdCBldmVudCBsaXN0ZW5lcic7XG4gICAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBvbGRMaXN0ZW5lcjogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICAvLyBUcnVlIGlmIHdlJ3JlIHJlbW92aW5nIHRoZSBvbGQgZXZlbnQgbGlzdGVuZXIgKGUuZy4gYmVjYXVzZSBzZXR0aW5ncyBjaGFuZ2VkLCBvciB2YWx1ZSBpcyBub3RoaW5nKVxuICAgICAgcmVtb3ZlTGlzdGVuZXI6IGJvb2xlYW47XG4gICAgICAvLyBUcnVlIGlmIHdlJ3JlIGFkZGluZyBhIG5ldyBldmVudCBsaXN0ZW5lciAoZS5nLiBiZWNhdXNlIGZpcnN0IHJlbmRlciwgb3Igc2V0dGluZ3MgY2hhbmdlZClcbiAgICAgIGFkZExpc3RlbmVyOiBib29sZWFuO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0VG9FbGVtZW50QmluZGluZyB7XG4gICAgICBraW5kOiAnY29tbWl0IHRvIGVsZW1lbnQgYmluZGluZyc7XG4gICAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufVxuXG5pbnRlcmZhY2UgRGVidWdMb2dnaW5nV2luZG93IHtcbiAgLy8gRXZlbiBpbiBkZXYgbW9kZSwgd2UgZ2VuZXJhbGx5IGRvbid0IHdhbnQgdG8gZW1pdCB0aGVzZSBldmVudHMsIGFzIHRoYXQnc1xuICAvLyBhbm90aGVyIGxldmVsIG9mIGNvc3QsIHNvIG9ubHkgZW1pdCB0aGVtIHdoZW4gREVWX01PREUgaXMgdHJ1ZSBfYW5kXyB3aGVuXG4gIC8vIHdpbmRvdy5lbWl0TGl0RGVidWdFdmVudHMgaXMgdHJ1ZS5cbiAgZW1pdExpdERlYnVnTG9nRXZlbnRzPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBVc2VmdWwgZm9yIHZpc3VhbGl6aW5nIGFuZCBsb2dnaW5nIGluc2lnaHRzIGludG8gd2hhdCB0aGUgTGl0IHRlbXBsYXRlIHN5c3RlbSBpcyBkb2luZy5cbiAqXG4gKiBDb21waWxlZCBvdXQgb2YgcHJvZCBtb2RlIGJ1aWxkcy5cbiAqL1xuY29uc3QgZGVidWdMb2dFdmVudCA9IERFVl9NT0RFXG4gID8gKGV2ZW50OiBMaXRVbnN0YWJsZS5EZWJ1Z0xvZy5FbnRyeSkgPT4ge1xuICAgICAgY29uc3Qgc2hvdWxkRW1pdCA9IChnbG9iYWwgYXMgdW5rbm93biBhcyBEZWJ1Z0xvZ2dpbmdXaW5kb3cpXG4gICAgICAgIC5lbWl0TGl0RGVidWdMb2dFdmVudHM7XG4gICAgICBpZiAoIXNob3VsZEVtaXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZ2xvYmFsLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudDxMaXRVbnN0YWJsZS5EZWJ1Z0xvZy5FbnRyeT4oJ2xpdC1kZWJ1ZycsIHtcbiAgICAgICAgICBkZXRhaWw6IGV2ZW50LFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gIDogdW5kZWZpbmVkO1xuLy8gVXNlZCBmb3IgY29ubmVjdGluZyBiZWdpblJlbmRlciBhbmQgZW5kUmVuZGVyIGV2ZW50cyB3aGVuIHRoZXJlIGFyZSBuZXN0ZWRcbi8vIHJlbmRlcnMgd2hlbiBlcnJvcnMgYXJlIHRocm93biBwcmV2ZW50aW5nIGFuIGVuZFJlbmRlciBldmVudCBmcm9tIGJlaW5nXG4vLyBjYWxsZWQuXG5sZXQgZGVidWdMb2dSZW5kZXJJZCA9IDA7XG5cbmxldCBpc3N1ZVdhcm5pbmc6IChjb2RlOiBzdHJpbmcsIHdhcm5pbmc6IHN0cmluZykgPT4gdm9pZDtcblxuaWYgKERFVl9NT0RFKSB7XG4gIGdsb2JhbC5saXRJc3N1ZWRXYXJuaW5ncyA/Pz0gbmV3IFNldCgpO1xuXG4gIC8vIElzc3VlIGEgd2FybmluZywgaWYgd2UgaGF2ZW4ndCBhbHJlYWR5LlxuICBpc3N1ZVdhcm5pbmcgPSAoY29kZTogc3RyaW5nLCB3YXJuaW5nOiBzdHJpbmcpID0+IHtcbiAgICB3YXJuaW5nICs9IGNvZGVcbiAgICAgID8gYCBTZWUgaHR0cHM6Ly9saXQuZGV2L21zZy8ke2NvZGV9IGZvciBtb3JlIGluZm9ybWF0aW9uLmBcbiAgICAgIDogJyc7XG4gICAgaWYgKCFnbG9iYWwubGl0SXNzdWVkV2FybmluZ3MhLmhhcyh3YXJuaW5nKSkge1xuICAgICAgY29uc29sZS53YXJuKHdhcm5pbmcpO1xuICAgICAgZ2xvYmFsLmxpdElzc3VlZFdhcm5pbmdzIS5hZGQod2FybmluZyk7XG4gICAgfVxuICB9O1xuXG4gIGlzc3VlV2FybmluZyhcbiAgICAnZGV2LW1vZGUnLFxuICAgIGBMaXQgaXMgaW4gZGV2IG1vZGUuIE5vdCByZWNvbW1lbmRlZCBmb3IgcHJvZHVjdGlvbiFgXG4gICk7XG59XG5cbmNvbnN0IHdyYXAgPVxuICBFTkFCTEVfU0hBRFlET01fTk9QQVRDSCAmJlxuICBnbG9iYWwuU2hhZHlET00/LmluVXNlICYmXG4gIGdsb2JhbC5TaGFkeURPTT8ubm9QYXRjaCA9PT0gdHJ1ZVxuICAgID8gKGdsb2JhbC5TaGFkeURPTSEud3JhcCBhcyA8VCBleHRlbmRzIE5vZGU+KG5vZGU6IFQpID0+IFQpXG4gICAgOiA8VCBleHRlbmRzIE5vZGU+KG5vZGU6IFQpID0+IG5vZGU7XG5cbmNvbnN0IHRydXN0ZWRUeXBlcyA9IChnbG9iYWwgYXMgdW5rbm93biBhcyBUcnVzdGVkVHlwZXNXaW5kb3cpLnRydXN0ZWRUeXBlcztcblxuLyoqXG4gKiBPdXIgVHJ1c3RlZFR5cGVQb2xpY3kgZm9yIEhUTUwgd2hpY2ggaXMgZGVjbGFyZWQgdXNpbmcgdGhlIGh0bWwgdGVtcGxhdGVcbiAqIHRhZyBmdW5jdGlvbi5cbiAqXG4gKiBUaGF0IEhUTUwgaXMgYSBkZXZlbG9wZXItYXV0aG9yZWQgY29uc3RhbnQsIGFuZCBpcyBwYXJzZWQgd2l0aCBpbm5lckhUTUxcbiAqIGJlZm9yZSBhbnkgdW50cnVzdGVkIGV4cHJlc3Npb25zIGhhdmUgYmVlbiBtaXhlZCBpbi4gVGhlcmVmb3IgaXQgaXNcbiAqIGNvbnNpZGVyZWQgc2FmZSBieSBjb25zdHJ1Y3Rpb24uXG4gKi9cbmNvbnN0IHBvbGljeSA9IHRydXN0ZWRUeXBlc1xuICA/IHRydXN0ZWRUeXBlcy5jcmVhdGVQb2xpY3koJ2xpdC1odG1sJywge1xuICAgICAgY3JlYXRlSFRNTDogKHMpID0+IHMsXG4gICAgfSlcbiAgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVXNlZCB0byBzYW5pdGl6ZSBhbnkgdmFsdWUgYmVmb3JlIGl0IGlzIHdyaXR0ZW4gaW50byB0aGUgRE9NLiBUaGlzIGNhbiBiZVxuICogdXNlZCB0byBpbXBsZW1lbnQgYSBzZWN1cml0eSBwb2xpY3kgb2YgYWxsb3dlZCBhbmQgZGlzYWxsb3dlZCB2YWx1ZXMgaW5cbiAqIG9yZGVyIHRvIHByZXZlbnQgWFNTIGF0dGFja3MuXG4gKlxuICogT25lIHdheSBvZiB1c2luZyB0aGlzIGNhbGxiYWNrIHdvdWxkIGJlIHRvIGNoZWNrIGF0dHJpYnV0ZXMgYW5kIHByb3BlcnRpZXNcbiAqIGFnYWluc3QgYSBsaXN0IG9mIGhpZ2ggcmlzayBmaWVsZHMsIGFuZCByZXF1aXJlIHRoYXQgdmFsdWVzIHdyaXR0ZW4gdG8gc3VjaFxuICogZmllbGRzIGJlIGluc3RhbmNlcyBvZiBhIGNsYXNzIHdoaWNoIGlzIHNhZmUgYnkgY29uc3RydWN0aW9uLiBDbG9zdXJlJ3MgU2FmZVxuICogSFRNTCBUeXBlcyBpcyBvbmUgaW1wbGVtZW50YXRpb24gb2YgdGhpcyB0ZWNobmlxdWUgKFxuICogaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9zYWZlLWh0bWwtdHlwZXMvYmxvYi9tYXN0ZXIvZG9jL3NhZmVodG1sLXR5cGVzLm1kKS5cbiAqIFRoZSBUcnVzdGVkVHlwZXMgcG9seWZpbGwgaW4gQVBJLW9ubHkgbW9kZSBjb3VsZCBhbHNvIGJlIHVzZWQgYXMgYSBiYXNpc1xuICogZm9yIHRoaXMgdGVjaG5pcXVlIChodHRwczovL2dpdGh1Yi5jb20vV0lDRy90cnVzdGVkLXR5cGVzKS5cbiAqXG4gKiBAcGFyYW0gbm9kZSBUaGUgSFRNTCBub2RlICh1c3VhbGx5IGVpdGhlciBhICN0ZXh0IG5vZGUgb3IgYW4gRWxlbWVudCkgdGhhdFxuICogICAgIGlzIGJlaW5nIHdyaXR0ZW4gdG8uIE5vdGUgdGhhdCB0aGlzIGlzIGp1c3QgYW4gZXhlbXBsYXIgbm9kZSwgdGhlIHdyaXRlXG4gKiAgICAgbWF5IHRha2UgcGxhY2UgYWdhaW5zdCBhbm90aGVyIGluc3RhbmNlIG9mIHRoZSBzYW1lIGNsYXNzIG9mIG5vZGUuXG4gKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiBhbiBhdHRyaWJ1dGUgb3IgcHJvcGVydHkgKGZvciBleGFtcGxlLCAnaHJlZicpLlxuICogQHBhcmFtIHR5cGUgSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHdyaXRlIHRoYXQncyBhYm91dCB0byBiZSBwZXJmb3JtZWQgd2lsbFxuICogICAgIGJlIHRvIGEgcHJvcGVydHkgb3IgYSBub2RlLlxuICogQHJldHVybiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBzYW5pdGl6ZSB0aGlzIGNsYXNzIG9mIHdyaXRlcy5cbiAqL1xuZXhwb3J0IHR5cGUgU2FuaXRpemVyRmFjdG9yeSA9IChcbiAgbm9kZTogTm9kZSxcbiAgbmFtZTogc3RyaW5nLFxuICB0eXBlOiAncHJvcGVydHknIHwgJ2F0dHJpYnV0ZSdcbikgPT4gVmFsdWVTYW5pdGl6ZXI7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB3aGljaCBjYW4gc2FuaXRpemUgdmFsdWVzIHRoYXQgd2lsbCBiZSB3cml0dGVuIHRvIGEgc3BlY2lmaWMga2luZFxuICogb2YgRE9NIHNpbmsuXG4gKlxuICogU2VlIFNhbml0aXplckZhY3RvcnkuXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBzYW5pdGl6ZS4gV2lsbCBiZSB0aGUgYWN0dWFsIHZhbHVlIHBhc3NlZCBpbnRvXG4gKiAgICAgdGhlIGxpdC1odG1sIHRlbXBsYXRlIGxpdGVyYWwsIHNvIHRoaXMgY291bGQgYmUgb2YgYW55IHR5cGUuXG4gKiBAcmV0dXJuIFRoZSB2YWx1ZSB0byB3cml0ZSB0byB0aGUgRE9NLiBVc3VhbGx5IHRoZSBzYW1lIGFzIHRoZSBpbnB1dCB2YWx1ZSxcbiAqICAgICB1bmxlc3Mgc2FuaXRpemF0aW9uIGlzIG5lZWRlZC5cbiAqL1xuZXhwb3J0IHR5cGUgVmFsdWVTYW5pdGl6ZXIgPSAodmFsdWU6IHVua25vd24pID0+IHVua25vd247XG5cbmNvbnN0IGlkZW50aXR5RnVuY3Rpb246IFZhbHVlU2FuaXRpemVyID0gKHZhbHVlOiB1bmtub3duKSA9PiB2YWx1ZTtcbmNvbnN0IG5vb3BTYW5pdGl6ZXI6IFNhbml0aXplckZhY3RvcnkgPSAoXG4gIF9ub2RlOiBOb2RlLFxuICBfbmFtZTogc3RyaW5nLFxuICBfdHlwZTogJ3Byb3BlcnR5JyB8ICdhdHRyaWJ1dGUnXG4pID0+IGlkZW50aXR5RnVuY3Rpb247XG5cbi8qKiBTZXRzIHRoZSBnbG9iYWwgc2FuaXRpemVyIGZhY3RvcnkuICovXG5jb25zdCBzZXRTYW5pdGl6ZXIgPSAobmV3U2FuaXRpemVyOiBTYW5pdGl6ZXJGYWN0b3J5KSA9PiB7XG4gIGlmICghRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwgIT09IG5vb3BTYW5pdGl6ZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgQXR0ZW1wdGVkIHRvIG92ZXJ3cml0ZSBleGlzdGluZyBsaXQtaHRtbCBzZWN1cml0eSBwb2xpY3kuYCArXG4gICAgICAgIGAgc2V0U2FuaXRpemVET01WYWx1ZUZhY3Rvcnkgc2hvdWxkIGJlIGNhbGxlZCBhdCBtb3N0IG9uY2UuYFxuICAgICk7XG4gIH1cbiAgc2FuaXRpemVyRmFjdG9yeUludGVybmFsID0gbmV3U2FuaXRpemVyO1xufTtcblxuLyoqXG4gKiBPbmx5IHVzZWQgaW4gaW50ZXJuYWwgdGVzdHMsIG5vdCBhIHBhcnQgb2YgdGhlIHB1YmxpYyBBUEkuXG4gKi9cbmNvbnN0IF90ZXN0T25seUNsZWFyU2FuaXRpemVyRmFjdG9yeURvTm90Q2FsbE9yRWxzZSA9ICgpID0+IHtcbiAgc2FuaXRpemVyRmFjdG9yeUludGVybmFsID0gbm9vcFNhbml0aXplcjtcbn07XG5cbmNvbnN0IGNyZWF0ZVNhbml0aXplcjogU2FuaXRpemVyRmFjdG9yeSA9IChub2RlLCBuYW1lLCB0eXBlKSA9PiB7XG4gIHJldHVybiBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwobm9kZSwgbmFtZSwgdHlwZSk7XG59O1xuXG4vLyBBZGRlZCB0byBhbiBhdHRyaWJ1dGUgbmFtZSB0byBtYXJrIHRoZSBhdHRyaWJ1dGUgYXMgYm91bmQgc28gd2UgY2FuIGZpbmRcbi8vIGl0IGVhc2lseS5cbmNvbnN0IGJvdW5kQXR0cmlidXRlU3VmZml4ID0gJyRsaXQkJztcblxuLy8gVGhpcyBtYXJrZXIgaXMgdXNlZCBpbiBtYW55IHN5bnRhY3RpYyBwb3NpdGlvbnMgaW4gSFRNTCwgc28gaXQgbXVzdCBiZVxuLy8gYSB2YWxpZCBlbGVtZW50IG5hbWUgYW5kIGF0dHJpYnV0ZSBuYW1lLiBXZSBkb24ndCBzdXBwb3J0IGR5bmFtaWMgbmFtZXMgKHlldClcbi8vIGJ1dCB0aGlzIGF0IGxlYXN0IGVuc3VyZXMgdGhhdCB0aGUgcGFyc2UgdHJlZSBpcyBjbG9zZXIgdG8gdGhlIHRlbXBsYXRlXG4vLyBpbnRlbnRpb24uXG5jb25zdCBtYXJrZXIgPSBgbGl0JCR7TWF0aC5yYW5kb20oKS50b0ZpeGVkKDkpLnNsaWNlKDIpfSRgO1xuXG4vLyBTdHJpbmcgdXNlZCB0byB0ZWxsIGlmIGEgY29tbWVudCBpcyBhIG1hcmtlciBjb21tZW50XG5jb25zdCBtYXJrZXJNYXRjaCA9ICc/JyArIG1hcmtlcjtcblxuLy8gVGV4dCB1c2VkIHRvIGluc2VydCBhIGNvbW1lbnQgbWFya2VyIG5vZGUuIFdlIHVzZSBwcm9jZXNzaW5nIGluc3RydWN0aW9uXG4vLyBzeW50YXggYmVjYXVzZSBpdCdzIHNsaWdodGx5IHNtYWxsZXIsIGJ1dCBwYXJzZXMgYXMgYSBjb21tZW50IG5vZGUuXG5jb25zdCBub2RlTWFya2VyID0gYDwke21hcmtlck1hdGNofT5gO1xuXG5jb25zdCBkID1cbiAgTk9ERV9NT0RFICYmIGdsb2JhbC5kb2N1bWVudCA9PT0gdW5kZWZpbmVkXG4gICAgPyAoe1xuICAgICAgICBjcmVhdGVUcmVlV2Fsa2VyKCkge1xuICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfSxcbiAgICAgIH0gYXMgdW5rbm93biBhcyBEb2N1bWVudClcbiAgICA6IGRvY3VtZW50O1xuXG4vLyBDcmVhdGVzIGEgZHluYW1pYyBtYXJrZXIuIFdlIG5ldmVyIGhhdmUgdG8gc2VhcmNoIGZvciB0aGVzZSBpbiB0aGUgRE9NLlxuY29uc3QgY3JlYXRlTWFya2VyID0gKCkgPT4gZC5jcmVhdGVDb21tZW50KCcnKTtcblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdHlwZW9mLW9wZXJhdG9yXG50eXBlIFByaW1pdGl2ZSA9IG51bGwgfCB1bmRlZmluZWQgfCBib29sZWFuIHwgbnVtYmVyIHwgc3RyaW5nIHwgc3ltYm9sIHwgYmlnaW50O1xuY29uc3QgaXNQcmltaXRpdmUgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBQcmltaXRpdmUgPT5cbiAgdmFsdWUgPT09IG51bGwgfHwgKHR5cGVvZiB2YWx1ZSAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUgIT0gJ2Z1bmN0aW9uJyk7XG5jb25zdCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbmNvbnN0IGlzSXRlcmFibGUgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBJdGVyYWJsZTx1bmtub3duPiA9PlxuICBpc0FycmF5KHZhbHVlKSB8fFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICB0eXBlb2YgKHZhbHVlIGFzIGFueSk/LltTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nO1xuXG5jb25zdCBTUEFDRV9DSEFSID0gYFsgXFx0XFxuXFxmXFxyXWA7XG5jb25zdCBBVFRSX1ZBTFVFX0NIQVIgPSBgW14gXFx0XFxuXFxmXFxyXCInXFxgPD49XWA7XG5jb25zdCBOQU1FX0NIQVIgPSBgW15cXFxcc1wiJz49L11gO1xuXG4vLyBUaGVzZSByZWdleGVzIHJlcHJlc2VudCB0aGUgZml2ZSBwYXJzaW5nIHN0YXRlcyB0aGF0IHdlIGNhcmUgYWJvdXQgaW4gdGhlXG4vLyBUZW1wbGF0ZSdzIEhUTUwgc2Nhbm5lci4gVGhleSBtYXRjaCB0aGUgKmVuZCogb2YgdGhlIHN0YXRlIHRoZXkncmUgbmFtZWRcbi8vIGFmdGVyLlxuLy8gRGVwZW5kaW5nIG9uIHRoZSBtYXRjaCwgd2UgdHJhbnNpdGlvbiB0byBhIG5ldyBzdGF0ZS4gSWYgdGhlcmUncyBubyBtYXRjaCxcbi8vIHdlIHN0YXkgaW4gdGhlIHNhbWUgc3RhdGUuXG4vLyBOb3RlIHRoYXQgdGhlIHJlZ2V4ZXMgYXJlIHN0YXRlZnVsLiBXZSB1dGlsaXplIGxhc3RJbmRleCBhbmQgc3luYyBpdFxuLy8gYWNyb3NzIHRoZSBtdWx0aXBsZSByZWdleGVzIHVzZWQuIEluIGFkZGl0aW9uIHRvIHRoZSBmaXZlIHJlZ2V4ZXMgYmVsb3dcbi8vIHdlIGFsc28gZHluYW1pY2FsbHkgY3JlYXRlIGEgcmVnZXggdG8gZmluZCB0aGUgbWF0Y2hpbmcgZW5kIHRhZ3MgZm9yIHJhd1xuLy8gdGV4dCBlbGVtZW50cy5cblxuLyoqXG4gKiBFbmQgb2YgdGV4dCBpczogYDxgIGZvbGxvd2VkIGJ5OlxuICogICAoY29tbWVudCBzdGFydCkgb3IgKHRhZykgb3IgKGR5bmFtaWMgdGFnIGJpbmRpbmcpXG4gKi9cbmNvbnN0IHRleHRFbmRSZWdleCA9IC88KD86KCEtLXxcXC9bXmEtekEtWl0pfChcXC8/W2EtekEtWl1bXj5cXHNdKil8KFxcLz8kKSkvZztcbmNvbnN0IENPTU1FTlRfU1RBUlQgPSAxO1xuY29uc3QgVEFHX05BTUUgPSAyO1xuY29uc3QgRFlOQU1JQ19UQUdfTkFNRSA9IDM7XG5cbmNvbnN0IGNvbW1lbnRFbmRSZWdleCA9IC8tLT4vZztcbi8qKlxuICogQ29tbWVudHMgbm90IHN0YXJ0ZWQgd2l0aCA8IS0tLCBsaWtlIDwveywgY2FuIGJlIGVuZGVkIGJ5IGEgc2luZ2xlIGA+YFxuICovXG5jb25zdCBjb21tZW50MkVuZFJlZ2V4ID0gLz4vZztcblxuLyoqXG4gKiBUaGUgdGFnRW5kIHJlZ2V4IG1hdGNoZXMgdGhlIGVuZCBvZiB0aGUgXCJpbnNpZGUgYW4gb3BlbmluZ1wiIHRhZyBzeW50YXhcbiAqIHBvc2l0aW9uLiBJdCBlaXRoZXIgbWF0Y2hlcyBhIGA+YCwgYW4gYXR0cmlidXRlLWxpa2Ugc2VxdWVuY2UsIG9yIHRoZSBlbmRcbiAqIG9mIHRoZSBzdHJpbmcgYWZ0ZXIgYSBzcGFjZSAoYXR0cmlidXRlLW5hbWUgcG9zaXRpb24gZW5kaW5nKS5cbiAqXG4gKiBTZWUgYXR0cmlidXRlcyBpbiB0aGUgSFRNTCBzcGVjOlxuICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L3N5bnRheC5odG1sI2VsZW1lbnRzLWF0dHJpYnV0ZXNcbiAqXG4gKiBcIiBcXHRcXG5cXGZcXHJcIiBhcmUgSFRNTCBzcGFjZSBjaGFyYWN0ZXJzOlxuICogaHR0cHM6Ly9pbmZyYS5zcGVjLndoYXR3Zy5vcmcvI2FzY2lpLXdoaXRlc3BhY2VcbiAqXG4gKiBTbyBhbiBhdHRyaWJ1dGUgaXM6XG4gKiAgKiBUaGUgbmFtZTogYW55IGNoYXJhY3RlciBleGNlcHQgYSB3aGl0ZXNwYWNlIGNoYXJhY3RlciwgKFwiKSwgKCcpLCBcIj5cIixcbiAqICAgIFwiPVwiLCBvciBcIi9cIi4gTm90ZTogdGhpcyBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgSFRNTCBzcGVjIHdoaWNoIGFsc28gZXhjbHVkZXMgY29udHJvbCBjaGFyYWN0ZXJzLlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5IFwiPVwiXG4gKiAgKiBGb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVyc1xuICogICogRm9sbG93ZWQgYnk6XG4gKiAgICAqIEFueSBjaGFyYWN0ZXIgZXhjZXB0IHNwYWNlLCAoJyksIChcIiksIFwiPFwiLCBcIj5cIiwgXCI9XCIsIChgKSwgb3JcbiAqICAgICogKFwiKSB0aGVuIGFueSBub24tKFwiKSwgb3JcbiAqICAgICogKCcpIHRoZW4gYW55IG5vbi0oJylcbiAqL1xuY29uc3QgdGFnRW5kUmVnZXggPSBuZXcgUmVnRXhwKFxuICBgPnwke1NQQUNFX0NIQVJ9KD86KCR7TkFNRV9DSEFSfSspKCR7U1BBQ0VfQ0hBUn0qPSR7U1BBQ0VfQ0hBUn0qKD86JHtBVFRSX1ZBTFVFX0NIQVJ9fChcInwnKXwpKXwkKWAsXG4gICdnJ1xuKTtcbmNvbnN0IEVOVElSRV9NQVRDSCA9IDA7XG5jb25zdCBBVFRSSUJVVEVfTkFNRSA9IDE7XG5jb25zdCBTUEFDRVNfQU5EX0VRVUFMUyA9IDI7XG5jb25zdCBRVU9URV9DSEFSID0gMztcblxuY29uc3Qgc2luZ2xlUXVvdGVBdHRyRW5kUmVnZXggPSAvJy9nO1xuY29uc3QgZG91YmxlUXVvdGVBdHRyRW5kUmVnZXggPSAvXCIvZztcbi8qKlxuICogTWF0Y2hlcyB0aGUgcmF3IHRleHQgZWxlbWVudHMuXG4gKlxuICogQ29tbWVudHMgYXJlIG5vdCBwYXJzZWQgd2l0aGluIHJhdyB0ZXh0IGVsZW1lbnRzLCBzbyB3ZSBuZWVkIHRvIHNlYXJjaCB0aGVpclxuICogdGV4dCBjb250ZW50IGZvciBtYXJrZXIgc3RyaW5ncy5cbiAqL1xuY29uc3QgcmF3VGV4dEVsZW1lbnQgPSAvXig/OnNjcmlwdHxzdHlsZXx0ZXh0YXJlYXx0aXRsZSkkL2k7XG5cbi8qKiBUZW1wbGF0ZVJlc3VsdCB0eXBlcyAqL1xuY29uc3QgSFRNTF9SRVNVTFQgPSAxO1xuY29uc3QgU1ZHX1JFU1VMVCA9IDI7XG5jb25zdCBNQVRITUxfUkVTVUxUID0gMztcblxudHlwZSBSZXN1bHRUeXBlID0gdHlwZW9mIEhUTUxfUkVTVUxUIHwgdHlwZW9mIFNWR19SRVNVTFQgfCB0eXBlb2YgTUFUSE1MX1JFU1VMVDtcblxuLy8gVGVtcGxhdGVQYXJ0IHR5cGVzXG4vLyBJTVBPUlRBTlQ6IHRoZXNlIG11c3QgbWF0Y2ggdGhlIHZhbHVlcyBpbiBQYXJ0VHlwZVxuY29uc3QgQVRUUklCVVRFX1BBUlQgPSAxO1xuY29uc3QgQ0hJTERfUEFSVCA9IDI7XG5jb25zdCBQUk9QRVJUWV9QQVJUID0gMztcbmNvbnN0IEJPT0xFQU5fQVRUUklCVVRFX1BBUlQgPSA0O1xuY29uc3QgRVZFTlRfUEFSVCA9IDU7XG5jb25zdCBFTEVNRU5UX1BBUlQgPSA2O1xuY29uc3QgQ09NTUVOVF9QQVJUID0gNztcblxuLyoqXG4gKiBUaGUgcmV0dXJuIHR5cGUgb2YgdGhlIHRlbXBsYXRlIHRhZyBmdW5jdGlvbnMsIHtAbGlua2NvZGUgaHRtbH0gYW5kXG4gKiB7QGxpbmtjb2RlIHN2Z30gd2hlbiBpdCBoYXNuJ3QgYmVlbiBjb21waWxlZCBieSBAbGl0LWxhYnMvY29tcGlsZXIuXG4gKlxuICogQSBgVGVtcGxhdGVSZXN1bHRgIG9iamVjdCBob2xkcyBhbGwgdGhlIGluZm9ybWF0aW9uIGFib3V0IGEgdGVtcGxhdGVcbiAqIGV4cHJlc3Npb24gcmVxdWlyZWQgdG8gcmVuZGVyIGl0OiB0aGUgdGVtcGxhdGUgc3RyaW5ncywgZXhwcmVzc2lvbiB2YWx1ZXMsXG4gKiBhbmQgdHlwZSBvZiB0ZW1wbGF0ZSAoaHRtbCBvciBzdmcpLlxuICpcbiAqIGBUZW1wbGF0ZVJlc3VsdGAgb2JqZWN0cyBkbyBub3QgY3JlYXRlIGFueSBET00gb24gdGhlaXIgb3duLiBUbyBjcmVhdGUgb3JcbiAqIHVwZGF0ZSBET00geW91IG5lZWQgdG8gcmVuZGVyIHRoZSBgVGVtcGxhdGVSZXN1bHRgLiBTZWVcbiAqIFtSZW5kZXJpbmddKGh0dHBzOi8vbGl0LmRldi9kb2NzL2NvbXBvbmVudHMvcmVuZGVyaW5nKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKi9cbmV4cG9ydCB0eXBlIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUIGV4dGVuZHMgUmVzdWx0VHlwZSA9IFJlc3VsdFR5cGU+ID0ge1xuICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICBbJ18kbGl0VHlwZSQnXTogVDtcbiAgc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXk7XG4gIHZhbHVlczogdW5rbm93bltdO1xufTtcblxuLyoqXG4gKiBUaGlzIGlzIGEgdGVtcGxhdGUgcmVzdWx0IHRoYXQgbWF5IGJlIGVpdGhlciB1bmNvbXBpbGVkIG9yIGNvbXBpbGVkLlxuICpcbiAqIEluIHRoZSBmdXR1cmUsIFRlbXBsYXRlUmVzdWx0IHdpbGwgYmUgdGhpcyB0eXBlLiBJZiB5b3Ugd2FudCB0byBleHBsaWNpdGx5XG4gKiBub3RlIHRoYXQgYSB0ZW1wbGF0ZSByZXN1bHQgaXMgcG90ZW50aWFsbHkgY29tcGlsZWQsIHlvdSBjYW4gcmVmZXJlbmNlIHRoaXNcbiAqIHR5cGUgYW5kIGl0IHdpbGwgY29udGludWUgdG8gYmVoYXZlIHRoZSBzYW1lIHRocm91Z2ggdGhlIG5leHQgbWFqb3IgdmVyc2lvblxuICogb2YgTGl0LiBUaGlzIGNhbiBiZSB1c2VmdWwgZm9yIGNvZGUgdGhhdCB3YW50cyB0byBwcmVwYXJlIGZvciB0aGUgbmV4dFxuICogbWFqb3IgdmVyc2lvbiBvZiBMaXQuXG4gKi9cbmV4cG9ydCB0eXBlIE1heWJlQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUIGV4dGVuZHMgUmVzdWx0VHlwZSA9IFJlc3VsdFR5cGU+ID1cbiAgfCBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQ8VD5cbiAgfCBDb21waWxlZFRlbXBsYXRlUmVzdWx0O1xuXG4vKipcbiAqIFRoZSByZXR1cm4gdHlwZSBvZiB0aGUgdGVtcGxhdGUgdGFnIGZ1bmN0aW9ucywge0BsaW5rY29kZSBodG1sfSBhbmRcbiAqIHtAbGlua2NvZGUgc3ZnfS5cbiAqXG4gKiBBIGBUZW1wbGF0ZVJlc3VsdGAgb2JqZWN0IGhvbGRzIGFsbCB0aGUgaW5mb3JtYXRpb24gYWJvdXQgYSB0ZW1wbGF0ZVxuICogZXhwcmVzc2lvbiByZXF1aXJlZCB0byByZW5kZXIgaXQ6IHRoZSB0ZW1wbGF0ZSBzdHJpbmdzLCBleHByZXNzaW9uIHZhbHVlcyxcbiAqIGFuZCB0eXBlIG9mIHRlbXBsYXRlIChodG1sIG9yIHN2ZykuXG4gKlxuICogYFRlbXBsYXRlUmVzdWx0YCBvYmplY3RzIGRvIG5vdCBjcmVhdGUgYW55IERPTSBvbiB0aGVpciBvd24uIFRvIGNyZWF0ZSBvclxuICogdXBkYXRlIERPTSB5b3UgbmVlZCB0byByZW5kZXIgdGhlIGBUZW1wbGF0ZVJlc3VsdGAuIFNlZVxuICogW1JlbmRlcmluZ10oaHR0cHM6Ly9saXQuZGV2L2RvY3MvY29tcG9uZW50cy9yZW5kZXJpbmcpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIEluIExpdCA0LCB0aGlzIHR5cGUgd2lsbCBiZSBhbiBhbGlhcyBvZlxuICogTWF5YmVDb21waWxlZFRlbXBsYXRlUmVzdWx0LCBzbyB0aGF0IGNvZGUgd2lsbCBnZXQgdHlwZSBlcnJvcnMgaWYgaXQgYXNzdW1lc1xuICogdGhhdCBMaXQgdGVtcGxhdGVzIGFyZSBub3QgY29tcGlsZWQuIFdoZW4gZGVsaWJlcmF0ZWx5IHdvcmtpbmcgd2l0aCBvbmx5XG4gKiBvbmUsIHVzZSBlaXRoZXIge0BsaW5rY29kZSBDb21waWxlZFRlbXBsYXRlUmVzdWx0fSBvclxuICoge0BsaW5rY29kZSBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHR9IGV4cGxpY2l0bHkuXG4gKi9cbmV4cG9ydCB0eXBlIFRlbXBsYXRlUmVzdWx0PFQgZXh0ZW5kcyBSZXN1bHRUeXBlID0gUmVzdWx0VHlwZT4gPVxuICBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQ8VD47XG5cbmV4cG9ydCB0eXBlIEhUTUxUZW1wbGF0ZVJlc3VsdCA9IFRlbXBsYXRlUmVzdWx0PHR5cGVvZiBIVE1MX1JFU1VMVD47XG5cbmV4cG9ydCB0eXBlIFNWR1RlbXBsYXRlUmVzdWx0ID0gVGVtcGxhdGVSZXN1bHQ8dHlwZW9mIFNWR19SRVNVTFQ+O1xuXG5leHBvcnQgdHlwZSBNYXRoTUxUZW1wbGF0ZVJlc3VsdCA9IFRlbXBsYXRlUmVzdWx0PHR5cGVvZiBNQVRITUxfUkVTVUxUPjtcblxuLyoqXG4gKiBBIFRlbXBsYXRlUmVzdWx0IHRoYXQgaGFzIGJlZW4gY29tcGlsZWQgYnkgQGxpdC1sYWJzL2NvbXBpbGVyLCBza2lwcGluZyB0aGVcbiAqIHByZXBhcmUgc3RlcC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21waWxlZFRlbXBsYXRlUmVzdWx0IHtcbiAgLy8gVGhpcyBpcyBhIGZhY3RvcnkgaW4gb3JkZXIgdG8gbWFrZSB0ZW1wbGF0ZSBpbml0aWFsaXphdGlvbiBsYXp5XG4gIC8vIGFuZCBhbGxvdyBTaGFkeVJlbmRlck9wdGlvbnMgc2NvcGUgdG8gYmUgcGFzc2VkIGluLlxuICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICBbJ18kbGl0VHlwZSQnXTogQ29tcGlsZWRUZW1wbGF0ZTtcbiAgdmFsdWVzOiB1bmtub3duW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZWRUZW1wbGF0ZSBleHRlbmRzIE9taXQ8VGVtcGxhdGUsICdlbCc+IHtcbiAgLy8gZWwgaXMgb3ZlcnJpZGRlbiB0byBiZSBvcHRpb25hbC4gV2UgaW5pdGlhbGl6ZSBpdCBvbiBmaXJzdCByZW5kZXJcbiAgZWw/OiBIVE1MVGVtcGxhdGVFbGVtZW50O1xuXG4gIC8vIFRoZSBwcmVwYXJlZCBIVE1MIHN0cmluZyB0byBjcmVhdGUgYSB0ZW1wbGF0ZSBlbGVtZW50IGZyb20uXG4gIC8vIFRoZSB0eXBlIGlzIGEgVGVtcGxhdGVTdHJpbmdzQXJyYXkgdG8gZ3VhcmFudGVlIHRoYXQgdGhlIHZhbHVlIGNhbWUgZnJvbVxuICAvLyBzb3VyY2UgY29kZSwgcHJldmVudGluZyBhIEpTT04gaW5qZWN0aW9uIGF0dGFjay5cbiAgaDogVGVtcGxhdGVTdHJpbmdzQXJyYXk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgdGVtcGxhdGUgbGl0ZXJhbCB0YWcgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgVGVtcGxhdGVSZXN1bHQgd2l0aFxuICogdGhlIGdpdmVuIHJlc3VsdCB0eXBlLlxuICovXG5jb25zdCB0YWcgPVxuICA8VCBleHRlbmRzIFJlc3VsdFR5cGU+KHR5cGU6IFQpID0+XG4gIChzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4udmFsdWVzOiB1bmtub3duW10pOiBUZW1wbGF0ZVJlc3VsdDxUPiA9PiB7XG4gICAgLy8gV2FybiBhZ2FpbnN0IHRlbXBsYXRlcyBvY3RhbCBlc2NhcGUgc2VxdWVuY2VzXG4gICAgLy8gV2UgZG8gdGhpcyBoZXJlIHJhdGhlciB0aGFuIGluIHJlbmRlciBzbyB0aGF0IHRoZSB3YXJuaW5nIGlzIGNsb3NlciB0byB0aGVcbiAgICAvLyB0ZW1wbGF0ZSBkZWZpbml0aW9uLlxuICAgIGlmIChERVZfTU9ERSAmJiBzdHJpbmdzLnNvbWUoKHMpID0+IHMgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgJ1NvbWUgdGVtcGxhdGUgc3RyaW5ncyBhcmUgdW5kZWZpbmVkLlxcbicgK1xuICAgICAgICAgICdUaGlzIGlzIHByb2JhYmx5IGNhdXNlZCBieSBpbGxlZ2FsIG9jdGFsIGVzY2FwZSBzZXF1ZW5jZXMuJ1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAvLyBJbXBvcnQgc3RhdGljLWh0bWwuanMgcmVzdWx0cyBpbiBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgd2hpY2ggZzMgZG9lc24ndFxuICAgICAgLy8gaGFuZGxlLiBJbnN0ZWFkIHdlIGtub3cgdGhhdCBzdGF0aWMgdmFsdWVzIG11c3QgaGF2ZSB0aGUgZmllbGRcbiAgICAgIC8vIGBfJGxpdFN0YXRpYyRgLlxuICAgICAgaWYgKFxuICAgICAgICB2YWx1ZXMuc29tZSgodmFsKSA9PiAodmFsIGFzIHtfJGxpdFN0YXRpYyQ6IHVua25vd259KT8uWydfJGxpdFN0YXRpYyQnXSlcbiAgICAgICkge1xuICAgICAgICBpc3N1ZVdhcm5pbmcoXG4gICAgICAgICAgJycsXG4gICAgICAgICAgYFN0YXRpYyB2YWx1ZXMgJ2xpdGVyYWwnIG9yICd1bnNhZmVTdGF0aWMnIGNhbm5vdCBiZSB1c2VkIGFzIHZhbHVlcyB0byBub24tc3RhdGljIHRlbXBsYXRlcy5cXG5gICtcbiAgICAgICAgICAgIGBQbGVhc2UgdXNlIHRoZSBzdGF0aWMgJ2h0bWwnIHRhZyBmdW5jdGlvbi4gU2VlIGh0dHBzOi8vbGl0LmRldi9kb2NzL3RlbXBsYXRlcy9leHByZXNzaW9ucy8jc3RhdGljLWV4cHJlc3Npb25zYFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICAgIFsnXyRsaXRUeXBlJCddOiB0eXBlLFxuICAgICAgc3RyaW5ncyxcbiAgICAgIHZhbHVlcyxcbiAgICB9O1xuICB9O1xuXG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIEhUTUwgdGVtcGxhdGUgdGhhdCBjYW4gZWZmaWNpZW50bHlcbiAqIHJlbmRlciB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBoZWFkZXIgPSAodGl0bGU6IHN0cmluZykgPT4gaHRtbGA8aDE+JHt0aXRsZX08L2gxPmA7XG4gKiBgYGBcbiAqXG4gKiBUaGUgYGh0bWxgIHRhZyByZXR1cm5zIGEgZGVzY3JpcHRpb24gb2YgdGhlIERPTSB0byByZW5kZXIgYXMgYSB2YWx1ZS4gSXQgaXNcbiAqIGxhenksIG1lYW5pbmcgbm8gd29yayBpcyBkb25lIHVudGlsIHRoZSB0ZW1wbGF0ZSBpcyByZW5kZXJlZC4gV2hlbiByZW5kZXJpbmcsXG4gKiBpZiBhIHRlbXBsYXRlIGNvbWVzIGZyb20gdGhlIHNhbWUgZXhwcmVzc2lvbiBhcyBhIHByZXZpb3VzbHkgcmVuZGVyZWQgcmVzdWx0LFxuICogaXQncyBlZmZpY2llbnRseSB1cGRhdGVkIGluc3RlYWQgb2YgcmVwbGFjZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBodG1sID0gdGFnKEhUTUxfUkVTVUxUKTtcblxuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhbiBTVkcgZnJhZ21lbnQgdGhhdCBjYW4gZWZmaWNpZW50bHkgcmVuZGVyXG4gKiB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCByZWN0ID0gc3ZnYDxyZWN0IHdpZHRoPVwiMTBcIiBoZWlnaHQ9XCIxMFwiPjwvcmVjdD5gO1xuICpcbiAqIGNvbnN0IG15SW1hZ2UgPSBodG1sYFxuICogICA8c3ZnIHZpZXdCb3g9XCIwIDAgMTAgMTBcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gKiAgICAgJHtyZWN0fVxuICogICA8L3N2Zz5gO1xuICogYGBgXG4gKlxuICogVGhlIGBzdmdgICp0YWcgZnVuY3Rpb24qIHNob3VsZCBvbmx5IGJlIHVzZWQgZm9yIFNWRyBmcmFnbWVudHMsIG9yIGVsZW1lbnRzXG4gKiB0aGF0IHdvdWxkIGJlIGNvbnRhaW5lZCAqKmluc2lkZSoqIGFuIGA8c3ZnPmAgSFRNTCBlbGVtZW50LiBBIGNvbW1vbiBlcnJvciBpc1xuICogcGxhY2luZyBhbiBgPHN2Zz5gICplbGVtZW50KiBpbiBhIHRlbXBsYXRlIHRhZ2dlZCB3aXRoIHRoZSBgc3ZnYCB0YWdcbiAqIGZ1bmN0aW9uLiBUaGUgYDxzdmc+YCBlbGVtZW50IGlzIGFuIEhUTUwgZWxlbWVudCBhbmQgc2hvdWxkIGJlIHVzZWQgd2l0aGluIGFcbiAqIHRlbXBsYXRlIHRhZ2dlZCB3aXRoIHRoZSB7QGxpbmtjb2RlIGh0bWx9IHRhZyBmdW5jdGlvbi5cbiAqXG4gKiBJbiBMaXRFbGVtZW50IHVzYWdlLCBpdCdzIGludmFsaWQgdG8gcmV0dXJuIGFuIFNWRyBmcmFnbWVudCBmcm9tIHRoZVxuICogYHJlbmRlcigpYCBtZXRob2QsIGFzIHRoZSBTVkcgZnJhZ21lbnQgd2lsbCBiZSBjb250YWluZWQgd2l0aGluIHRoZSBlbGVtZW50J3NcbiAqIHNoYWRvdyByb290IGFuZCB0aHVzIG5vdCBiZSBwcm9wZXJseSBjb250YWluZWQgd2l0aGluIGFuIGA8c3ZnPmAgSFRNTFxuICogZWxlbWVudC5cbiAqL1xuZXhwb3J0IGNvbnN0IHN2ZyA9IHRhZyhTVkdfUkVTVUxUKTtcblxuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBNYXRoTUwgZnJhZ21lbnQgdGhhdCBjYW4gZWZmaWNpZW50bHkgcmVuZGVyXG4gKiB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBudW0gPSBtYXRobWxgPG1uPjE8L21uPmA7XG4gKlxuICogY29uc3QgZXEgPSBodG1sYFxuICogICA8bWF0aD5cbiAqICAgICAke251bX1cbiAqICAgPC9tYXRoPmA7XG4gKiBgYGBcbiAqXG4gKiBUaGUgYG1hdGhtbGAgKnRhZyBmdW5jdGlvbiogc2hvdWxkIG9ubHkgYmUgdXNlZCBmb3IgTWF0aE1MIGZyYWdtZW50cywgb3JcbiAqIGVsZW1lbnRzIHRoYXQgd291bGQgYmUgY29udGFpbmVkICoqaW5zaWRlKiogYSBgPG1hdGg+YCBIVE1MIGVsZW1lbnQuIEEgY29tbW9uXG4gKiBlcnJvciBpcyBwbGFjaW5nIGEgYDxtYXRoPmAgKmVsZW1lbnQqIGluIGEgdGVtcGxhdGUgdGFnZ2VkIHdpdGggdGhlIGBtYXRobWxgXG4gKiB0YWcgZnVuY3Rpb24uIFRoZSBgPG1hdGg+YCBlbGVtZW50IGlzIGFuIEhUTUwgZWxlbWVudCBhbmQgc2hvdWxkIGJlIHVzZWRcbiAqIHdpdGhpbiBhIHRlbXBsYXRlIHRhZ2dlZCB3aXRoIHRoZSB7QGxpbmtjb2RlIGh0bWx9IHRhZyBmdW5jdGlvbi5cbiAqXG4gKiBJbiBMaXRFbGVtZW50IHVzYWdlLCBpdCdzIGludmFsaWQgdG8gcmV0dXJuIGFuIE1hdGhNTCBmcmFnbWVudCBmcm9tIHRoZVxuICogYHJlbmRlcigpYCBtZXRob2QsIGFzIHRoZSBNYXRoTUwgZnJhZ21lbnQgd2lsbCBiZSBjb250YWluZWQgd2l0aGluIHRoZVxuICogZWxlbWVudCdzIHNoYWRvdyByb290IGFuZCB0aHVzIG5vdCBiZSBwcm9wZXJseSBjb250YWluZWQgd2l0aGluIGEgYDxtYXRoPmBcbiAqIEhUTUwgZWxlbWVudC5cbiAqL1xuZXhwb3J0IGNvbnN0IG1hdGhtbCA9IHRhZyhNQVRITUxfUkVTVUxUKTtcblxuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHRoYXQgc2lnbmFscyB0aGF0IGEgdmFsdWUgd2FzIGhhbmRsZWQgYnkgYSBkaXJlY3RpdmUgYW5kXG4gKiBzaG91bGQgbm90IGJlIHdyaXR0ZW4gdG8gdGhlIERPTS5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vQ2hhbmdlID0gU3ltYm9sLmZvcignbGl0LW5vQ2hhbmdlJyk7XG5cbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgYSBDaGlsZFBhcnQgdG8gZnVsbHkgY2xlYXIgaXRzIGNvbnRlbnQuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IGJ1dHRvbiA9IGh0bWxgJHtcbiAqICB1c2VyLmlzQWRtaW5cbiAqICAgID8gaHRtbGA8YnV0dG9uPkRFTEVURTwvYnV0dG9uPmBcbiAqICAgIDogbm90aGluZ1xuICogfWA7XG4gKiBgYGBcbiAqXG4gKiBQcmVmZXIgdXNpbmcgYG5vdGhpbmdgIG92ZXIgb3RoZXIgZmFsc3kgdmFsdWVzIGFzIGl0IHByb3ZpZGVzIGEgY29uc2lzdGVudFxuICogYmVoYXZpb3IgYmV0d2VlbiB2YXJpb3VzIGV4cHJlc3Npb24gYmluZGluZyBjb250ZXh0cy5cbiAqXG4gKiBJbiBjaGlsZCBleHByZXNzaW9ucywgYHVuZGVmaW5lZGAsIGBudWxsYCwgYCcnYCwgYW5kIGBub3RoaW5nYCBhbGwgYmVoYXZlIHRoZVxuICogc2FtZSBhbmQgcmVuZGVyIG5vIG5vZGVzLiBJbiBhdHRyaWJ1dGUgZXhwcmVzc2lvbnMsIGBub3RoaW5nYCBfcmVtb3Zlc18gdGhlXG4gKiBhdHRyaWJ1dGUsIHdoaWxlIGB1bmRlZmluZWRgIGFuZCBgbnVsbGAgd2lsbCByZW5kZXIgYW4gZW1wdHkgc3RyaW5nLiBJblxuICogcHJvcGVydHkgZXhwcmVzc2lvbnMgYG5vdGhpbmdgIGJlY29tZXMgYHVuZGVmaW5lZGAuXG4gKi9cbmV4cG9ydCBjb25zdCBub3RoaW5nID0gU3ltYm9sLmZvcignbGl0LW5vdGhpbmcnKTtcblxuLyoqXG4gKiBUaGUgY2FjaGUgb2YgcHJlcGFyZWQgdGVtcGxhdGVzLCBrZXllZCBieSB0aGUgdGFnZ2VkIFRlbXBsYXRlU3RyaW5nc0FycmF5XG4gKiBhbmQgX25vdF8gYWNjb3VudGluZyBmb3IgdGhlIHNwZWNpZmljIHRlbXBsYXRlIHRhZyB1c2VkLiBUaGlzIG1lYW5zIHRoYXRcbiAqIHRlbXBsYXRlIHRhZ3MgY2Fubm90IGJlIGR5bmFtaWMgLSB0aGV5IG11c3Qgc3RhdGljYWxseSBiZSBvbmUgb2YgaHRtbCwgc3ZnLFxuICogb3IgYXR0ci4gVGhpcyByZXN0cmljdGlvbiBzaW1wbGlmaWVzIHRoZSBjYWNoZSBsb29rdXAsIHdoaWNoIGlzIG9uIHRoZSBob3RcbiAqIHBhdGggZm9yIHJlbmRlcmluZy5cbiAqL1xuY29uc3QgdGVtcGxhdGVDYWNoZSA9IG5ldyBXZWFrTWFwPFRlbXBsYXRlU3RyaW5nc0FycmF5LCBUZW1wbGF0ZT4oKTtcblxuLyoqXG4gKiBPYmplY3Qgc3BlY2lmeWluZyBvcHRpb25zIGZvciBjb250cm9sbGluZyBsaXQtaHRtbCByZW5kZXJpbmcuIE5vdGUgdGhhdFxuICogd2hpbGUgYHJlbmRlcmAgbWF5IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBvbiB0aGUgc2FtZSBgY29udGFpbmVyYCAoYW5kXG4gKiBgcmVuZGVyQmVmb3JlYCByZWZlcmVuY2Ugbm9kZSkgdG8gZWZmaWNpZW50bHkgdXBkYXRlIHRoZSByZW5kZXJlZCBjb250ZW50LFxuICogb25seSB0aGUgb3B0aW9ucyBwYXNzZWQgaW4gZHVyaW5nIHRoZSBmaXJzdCByZW5kZXIgYXJlIHJlc3BlY3RlZCBkdXJpbmdcbiAqIHRoZSBsaWZldGltZSBvZiByZW5kZXJzIHRvIHRoYXQgdW5pcXVlIGBjb250YWluZXJgICsgYHJlbmRlckJlZm9yZWBcbiAqIGNvbWJpbmF0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlck9wdGlvbnMge1xuICAvKipcbiAgICogQW4gb2JqZWN0IHRvIHVzZSBhcyB0aGUgYHRoaXNgIHZhbHVlIGZvciBldmVudCBsaXN0ZW5lcnMuIEl0J3Mgb2Z0ZW5cbiAgICogdXNlZnVsIHRvIHNldCB0aGlzIHRvIHRoZSBob3N0IGNvbXBvbmVudCByZW5kZXJpbmcgYSB0ZW1wbGF0ZS5cbiAgICovXG4gIGhvc3Q/OiBvYmplY3Q7XG4gIC8qKlxuICAgKiBBIERPTSBub2RlIGJlZm9yZSB3aGljaCB0byByZW5kZXIgY29udGVudCBpbiB0aGUgY29udGFpbmVyLlxuICAgKi9cbiAgcmVuZGVyQmVmb3JlPzogQ2hpbGROb2RlIHwgbnVsbDtcbiAgLyoqXG4gICAqIE5vZGUgdXNlZCBmb3IgY2xvbmluZyB0aGUgdGVtcGxhdGUgKGBpbXBvcnROb2RlYCB3aWxsIGJlIGNhbGxlZCBvbiB0aGlzXG4gICAqIG5vZGUpLiBUaGlzIGNvbnRyb2xzIHRoZSBgb3duZXJEb2N1bWVudGAgb2YgdGhlIHJlbmRlcmVkIERPTSwgYWxvbmcgd2l0aFxuICAgKiBhbnkgaW5oZXJpdGVkIGNvbnRleHQuIERlZmF1bHRzIHRvIHRoZSBnbG9iYWwgYGRvY3VtZW50YC5cbiAgICovXG4gIGNyZWF0aW9uU2NvcGU/OiB7aW1wb3J0Tm9kZShub2RlOiBOb2RlLCBkZWVwPzogYm9vbGVhbik6IE5vZGV9O1xuICAvKipcbiAgICogVGhlIGluaXRpYWwgY29ubmVjdGVkIHN0YXRlIGZvciB0aGUgdG9wLWxldmVsIHBhcnQgYmVpbmcgcmVuZGVyZWQuIElmIG5vXG4gICAqIGBpc0Nvbm5lY3RlZGAgb3B0aW9uIGlzIHNldCwgYEFzeW5jRGlyZWN0aXZlYHMgd2lsbCBiZSBjb25uZWN0ZWQgYnlcbiAgICogZGVmYXVsdC4gU2V0IHRvIGBmYWxzZWAgaWYgdGhlIGluaXRpYWwgcmVuZGVyIG9jY3VycyBpbiBhIGRpc2Nvbm5lY3RlZCB0cmVlXG4gICAqIGFuZCBgQXN5bmNEaXJlY3RpdmVgcyBzaG91bGQgc2VlIGBpc0Nvbm5lY3RlZCA9PT0gZmFsc2VgIGZvciB0aGVpciBpbml0aWFsXG4gICAqIHJlbmRlci4gVGhlIGBwYXJ0LnNldENvbm5lY3RlZCgpYCBtZXRob2QgbXVzdCBiZSB1c2VkIHN1YnNlcXVlbnQgdG8gaW5pdGlhbFxuICAgKiByZW5kZXIgdG8gY2hhbmdlIHRoZSBjb25uZWN0ZWQgc3RhdGUgb2YgdGhlIHBhcnQuXG4gICAqL1xuICBpc0Nvbm5lY3RlZD86IGJvb2xlYW47XG59XG5cbmNvbnN0IHdhbGtlciA9IGQuY3JlYXRlVHJlZVdhbGtlcihcbiAgZCxcbiAgMTI5IC8qIE5vZGVGaWx0ZXIuU0hPV197RUxFTUVOVHxDT01NRU5UfSAqL1xuKTtcblxubGV0IHNhbml0aXplckZhY3RvcnlJbnRlcm5hbDogU2FuaXRpemVyRmFjdG9yeSA9IG5vb3BTYW5pdGl6ZXI7XG5cbi8vXG4vLyBDbGFzc2VzIG9ubHkgYmVsb3cgaGVyZSwgY29uc3QgdmFyaWFibGUgZGVjbGFyYXRpb25zIG9ubHkgYWJvdmUgaGVyZS4uLlxuLy9cbi8vIEtlZXBpbmcgdmFyaWFibGUgZGVjbGFyYXRpb25zIGFuZCBjbGFzc2VzIHRvZ2V0aGVyIGltcHJvdmVzIG1pbmlmaWNhdGlvbi5cbi8vIEludGVyZmFjZXMgYW5kIHR5cGUgYWxpYXNlcyBjYW4gYmUgaW50ZXJsZWF2ZWQgZnJlZWx5LlxuLy9cblxuLy8gVHlwZSBmb3IgY2xhc3NlcyB0aGF0IGhhdmUgYSBgX2RpcmVjdGl2ZWAgb3IgYF9kaXJlY3RpdmVzW11gIGZpZWxkLCB1c2VkIGJ5XG4vLyBgcmVzb2x2ZURpcmVjdGl2ZWBcbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0aXZlUGFyZW50IHtcbiAgXyRwYXJlbnQ/OiBEaXJlY3RpdmVQYXJlbnQ7XG4gIF8kaXNDb25uZWN0ZWQ6IGJvb2xlYW47XG4gIF9fZGlyZWN0aXZlPzogRGlyZWN0aXZlO1xuICBfX2RpcmVjdGl2ZXM/OiBBcnJheTxEaXJlY3RpdmUgfCB1bmRlZmluZWQ+O1xufVxuXG5mdW5jdGlvbiB0cnVzdEZyb21UZW1wbGF0ZVN0cmluZyhcbiAgdHNhOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSxcbiAgc3RyaW5nRnJvbVRTQTogc3RyaW5nXG4pOiBUcnVzdGVkSFRNTCB7XG4gIC8vIEEgc2VjdXJpdHkgY2hlY2sgdG8gcHJldmVudCBzcG9vZmluZyBvZiBMaXQgdGVtcGxhdGUgcmVzdWx0cy5cbiAgLy8gSW4gdGhlIGZ1dHVyZSwgd2UgbWF5IGJlIGFibGUgdG8gcmVwbGFjZSB0aGlzIHdpdGggQXJyYXkuaXNUZW1wbGF0ZU9iamVjdCxcbiAgLy8gdGhvdWdoIHdlIG1pZ2h0IG5lZWQgdG8gbWFrZSB0aGF0IGNoZWNrIGluc2lkZSBvZiB0aGUgaHRtbCBhbmQgc3ZnXG4gIC8vIGZ1bmN0aW9ucywgYmVjYXVzZSBwcmVjb21waWxlZCB0ZW1wbGF0ZXMgZG9uJ3QgY29tZSBpbiBhc1xuICAvLyBUZW1wbGF0ZVN0cmluZ0FycmF5IG9iamVjdHMuXG4gIGlmICghaXNBcnJheSh0c2EpIHx8ICF0c2EuaGFzT3duUHJvcGVydHkoJ3JhdycpKSB7XG4gICAgbGV0IG1lc3NhZ2UgPSAnaW52YWxpZCB0ZW1wbGF0ZSBzdHJpbmdzIGFycmF5JztcbiAgICBpZiAoREVWX01PREUpIHtcbiAgICAgIG1lc3NhZ2UgPSBgXG4gICAgICAgICAgSW50ZXJuYWwgRXJyb3I6IGV4cGVjdGVkIHRlbXBsYXRlIHN0cmluZ3MgdG8gYmUgYW4gYXJyYXlcbiAgICAgICAgICB3aXRoIGEgJ3JhdycgZmllbGQuIEZha2luZyBhIHRlbXBsYXRlIHN0cmluZ3MgYXJyYXkgYnlcbiAgICAgICAgICBjYWxsaW5nIGh0bWwgb3Igc3ZnIGxpa2UgYW4gb3JkaW5hcnkgZnVuY3Rpb24gaXMgZWZmZWN0aXZlbHlcbiAgICAgICAgICB0aGUgc2FtZSBhcyBjYWxsaW5nIHVuc2FmZUh0bWwgYW5kIGNhbiBsZWFkIHRvIG1ham9yIHNlY3VyaXR5XG4gICAgICAgICAgaXNzdWVzLCBlLmcuIG9wZW5pbmcgeW91ciBjb2RlIHVwIHRvIFhTUyBhdHRhY2tzLlxuICAgICAgICAgIElmIHlvdSdyZSB1c2luZyB0aGUgaHRtbCBvciBzdmcgdGFnZ2VkIHRlbXBsYXRlIGZ1bmN0aW9ucyBub3JtYWxseVxuICAgICAgICAgIGFuZCBzdGlsbCBzZWVpbmcgdGhpcyBlcnJvciwgcGxlYXNlIGZpbGUgYSBidWcgYXRcbiAgICAgICAgICBodHRwczovL2dpdGh1Yi5jb20vbGl0L2xpdC9pc3N1ZXMvbmV3P3RlbXBsYXRlPWJ1Z19yZXBvcnQubWRcbiAgICAgICAgICBhbmQgaW5jbHVkZSBpbmZvcm1hdGlvbiBhYm91dCB5b3VyIGJ1aWxkIHRvb2xpbmcsIGlmIGFueS5cbiAgICAgICAgYFxuICAgICAgICAudHJpbSgpXG4gICAgICAgIC5yZXBsYWNlKC9cXG4gKi9nLCAnXFxuJyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgfVxuICByZXR1cm4gcG9saWN5ICE9PSB1bmRlZmluZWRcbiAgICA/IHBvbGljeS5jcmVhdGVIVE1MKHN0cmluZ0Zyb21UU0EpXG4gICAgOiAoc3RyaW5nRnJvbVRTQSBhcyB1bmtub3duIGFzIFRydXN0ZWRIVE1MKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIEhUTUwgc3RyaW5nIGZvciB0aGUgZ2l2ZW4gVGVtcGxhdGVTdHJpbmdzQXJyYXkgYW5kIHJlc3VsdCB0eXBlXG4gKiAoSFRNTCBvciBTVkcpLCBhbG9uZyB3aXRoIHRoZSBjYXNlLXNlbnNpdGl2ZSBib3VuZCBhdHRyaWJ1dGUgbmFtZXMgaW5cbiAqIHRlbXBsYXRlIG9yZGVyLiBUaGUgSFRNTCBjb250YWlucyBjb21tZW50IG1hcmtlcnMgZGVub3RpbmcgdGhlIGBDaGlsZFBhcnRgc1xuICogYW5kIHN1ZmZpeGVzIG9uIGJvdW5kIGF0dHJpYnV0ZXMgZGVub3RpbmcgdGhlIGBBdHRyaWJ1dGVQYXJ0c2AuXG4gKlxuICogQHBhcmFtIHN0cmluZ3MgdGVtcGxhdGUgc3RyaW5ncyBhcnJheVxuICogQHBhcmFtIHR5cGUgSFRNTCBvciBTVkdcbiAqIEByZXR1cm4gQXJyYXkgY29udGFpbmluZyBgW2h0bWwsIGF0dHJOYW1lc11gIChhcnJheSByZXR1cm5lZCBmb3IgdGVyc2VuZXNzLFxuICogICAgIHRvIGF2b2lkIG9iamVjdCBmaWVsZHMgc2luY2UgdGhpcyBjb2RlIGlzIHNoYXJlZCB3aXRoIG5vbi1taW5pZmllZCBTU1JcbiAqICAgICBjb2RlKVxuICovXG5jb25zdCBnZXRUZW1wbGF0ZUh0bWwgPSAoXG4gIHN0cmluZ3M6IFRlbXBsYXRlU3RyaW5nc0FycmF5LFxuICB0eXBlOiBSZXN1bHRUeXBlXG4pOiBbVHJ1c3RlZEhUTUwsIEFycmF5PHN0cmluZz5dID0+IHtcbiAgLy8gSW5zZXJ0IG1ha2VycyBpbnRvIHRoZSB0ZW1wbGF0ZSBIVE1MIHRvIHJlcHJlc2VudCB0aGUgcG9zaXRpb24gb2ZcbiAgLy8gYmluZGluZ3MuIFRoZSBmb2xsb3dpbmcgY29kZSBzY2FucyB0aGUgdGVtcGxhdGUgc3RyaW5ncyB0byBkZXRlcm1pbmUgdGhlXG4gIC8vIHN5bnRhY3RpYyBwb3NpdGlvbiBvZiB0aGUgYmluZGluZ3MuIFRoZXkgY2FuIGJlIGluIHRleHQgcG9zaXRpb24sIHdoZXJlXG4gIC8vIHdlIGluc2VydCBhbiBIVE1MIGNvbW1lbnQsIGF0dHJpYnV0ZSB2YWx1ZSBwb3NpdGlvbiwgd2hlcmUgd2UgaW5zZXJ0IGFcbiAgLy8gc2VudGluZWwgc3RyaW5nIGFuZCByZS13cml0ZSB0aGUgYXR0cmlidXRlIG5hbWUsIG9yIGluc2lkZSBhIHRhZyB3aGVyZVxuICAvLyB3ZSBpbnNlcnQgdGhlIHNlbnRpbmVsIHN0cmluZy5cbiAgY29uc3QgbCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgLy8gU3RvcmVzIHRoZSBjYXNlLXNlbnNpdGl2ZSBib3VuZCBhdHRyaWJ1dGUgbmFtZXMgaW4gdGhlIG9yZGVyIG9mIHRoZWlyXG4gIC8vIHBhcnRzLiBFbGVtZW50UGFydHMgYXJlIGFsc28gcmVmbGVjdGVkIGluIHRoaXMgYXJyYXkgYXMgdW5kZWZpbmVkXG4gIC8vIHJhdGhlciB0aGFuIGEgc3RyaW5nLCB0byBkaXNhbWJpZ3VhdGUgZnJvbSBhdHRyaWJ1dGUgYmluZGluZ3MuXG4gIGNvbnN0IGF0dHJOYW1lczogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICBsZXQgaHRtbCA9XG4gICAgdHlwZSA9PT0gU1ZHX1JFU1VMVCA/ICc8c3ZnPicgOiB0eXBlID09PSBNQVRITUxfUkVTVUxUID8gJzxtYXRoPicgOiAnJztcblxuICAvLyBXaGVuIHdlJ3JlIGluc2lkZSBhIHJhdyB0ZXh0IHRhZyAobm90IGl0J3MgdGV4dCBjb250ZW50KSwgdGhlIHJlZ2V4XG4gIC8vIHdpbGwgc3RpbGwgYmUgdGFnUmVnZXggc28gd2UgY2FuIGZpbmQgYXR0cmlidXRlcywgYnV0IHdpbGwgc3dpdGNoIHRvXG4gIC8vIHRoaXMgcmVnZXggd2hlbiB0aGUgdGFnIGVuZHMuXG4gIGxldCByYXdUZXh0RW5kUmVnZXg6IFJlZ0V4cCB8IHVuZGVmaW5lZDtcblxuICAvLyBUaGUgY3VycmVudCBwYXJzaW5nIHN0YXRlLCByZXByZXNlbnRlZCBhcyBhIHJlZmVyZW5jZSB0byBvbmUgb2YgdGhlXG4gIC8vIHJlZ2V4ZXNcbiAgbGV0IHJlZ2V4ID0gdGV4dEVuZFJlZ2V4O1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgY29uc3QgcyA9IHN0cmluZ3NbaV07XG4gICAgLy8gVGhlIGluZGV4IG9mIHRoZSBlbmQgb2YgdGhlIGxhc3QgYXR0cmlidXRlIG5hbWUuIFdoZW4gdGhpcyBpc1xuICAgIC8vIHBvc2l0aXZlIGF0IGVuZCBvZiBhIHN0cmluZywgaXQgbWVhbnMgd2UncmUgaW4gYW4gYXR0cmlidXRlIHZhbHVlXG4gICAgLy8gcG9zaXRpb24gYW5kIG5lZWQgdG8gcmV3cml0ZSB0aGUgYXR0cmlidXRlIG5hbWUuXG4gICAgLy8gV2UgYWxzbyB1c2UgYSBzcGVjaWFsIHZhbHVlIG9mIC0yIHRvIGluZGljYXRlIHRoYXQgd2UgZW5jb3VudGVyZWRcbiAgICAvLyB0aGUgZW5kIG9mIGEgc3RyaW5nIGluIGF0dHJpYnV0ZSBuYW1lIHBvc2l0aW9uLlxuICAgIGxldCBhdHRyTmFtZUVuZEluZGV4ID0gLTE7XG4gICAgbGV0IGF0dHJOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgbGV0IGxhc3RJbmRleCA9IDA7XG4gICAgbGV0IG1hdGNoITogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcblxuICAgIC8vIFRoZSBjb25kaXRpb25zIGluIHRoaXMgbG9vcCBoYW5kbGUgdGhlIGN1cnJlbnQgcGFyc2Ugc3RhdGUsIGFuZCB0aGVcbiAgICAvLyBhc3NpZ25tZW50cyB0byB0aGUgYHJlZ2V4YCB2YXJpYWJsZSBhcmUgdGhlIHN0YXRlIHRyYW5zaXRpb25zLlxuICAgIHdoaWxlIChsYXN0SW5kZXggPCBzLmxlbmd0aCkge1xuICAgICAgLy8gTWFrZSBzdXJlIHdlIHN0YXJ0IHNlYXJjaGluZyBmcm9tIHdoZXJlIHdlIHByZXZpb3VzbHkgbGVmdCBvZmZcbiAgICAgIHJlZ2V4Lmxhc3RJbmRleCA9IGxhc3RJbmRleDtcbiAgICAgIG1hdGNoID0gcmVnZXguZXhlYyhzKTtcbiAgICAgIGlmIChtYXRjaCA9PT0gbnVsbCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGxhc3RJbmRleCA9IHJlZ2V4Lmxhc3RJbmRleDtcbiAgICAgIGlmIChyZWdleCA9PT0gdGV4dEVuZFJlZ2V4KSB7XG4gICAgICAgIGlmIChtYXRjaFtDT01NRU5UX1NUQVJUXSA9PT0gJyEtLScpIHtcbiAgICAgICAgICByZWdleCA9IGNvbW1lbnRFbmRSZWdleDtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFtDT01NRU5UX1NUQVJUXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gV2Ugc3RhcnRlZCBhIHdlaXJkIGNvbW1lbnQsIGxpa2UgPC97XG4gICAgICAgICAgcmVnZXggPSBjb21tZW50MkVuZFJlZ2V4O1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoW1RBR19OQU1FXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKHJhd1RleHRFbGVtZW50LnRlc3QobWF0Y2hbVEFHX05BTUVdKSkge1xuICAgICAgICAgICAgLy8gUmVjb3JkIGlmIHdlIGVuY291bnRlciBhIHJhdy10ZXh0IGVsZW1lbnQuIFdlJ2xsIHN3aXRjaCB0b1xuICAgICAgICAgICAgLy8gdGhpcyByZWdleCBhdCB0aGUgZW5kIG9mIHRoZSB0YWcuXG4gICAgICAgICAgICByYXdUZXh0RW5kUmVnZXggPSBuZXcgUmVnRXhwKGA8LyR7bWF0Y2hbVEFHX05BTUVdfWAsICdnJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZ2V4ID0gdGFnRW5kUmVnZXg7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbRFlOQU1JQ19UQUdfTkFNRV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnQmluZGluZ3MgaW4gdGFnIG5hbWVzIGFyZSBub3Qgc3VwcG9ydGVkLiBQbGVhc2UgdXNlIHN0YXRpYyB0ZW1wbGF0ZXMgaW5zdGVhZC4gJyArXG4gICAgICAgICAgICAgICAgJ1NlZSBodHRwczovL2xpdC5kZXYvZG9jcy90ZW1wbGF0ZXMvZXhwcmVzc2lvbnMvI3N0YXRpYy1leHByZXNzaW9ucydcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZ2V4ID0gdGFnRW5kUmVnZXg7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocmVnZXggPT09IHRhZ0VuZFJlZ2V4KSB7XG4gICAgICAgIGlmIChtYXRjaFtFTlRJUkVfTUFUQ0hdID09PSAnPicpIHtcbiAgICAgICAgICAvLyBFbmQgb2YgYSB0YWcuIElmIHdlIGhhZCBzdGFydGVkIGEgcmF3LXRleHQgZWxlbWVudCwgdXNlIHRoYXRcbiAgICAgICAgICAvLyByZWdleFxuICAgICAgICAgIHJlZ2V4ID0gcmF3VGV4dEVuZFJlZ2V4ID8/IHRleHRFbmRSZWdleDtcbiAgICAgICAgICAvLyBXZSBtYXkgYmUgZW5kaW5nIGFuIHVucXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZSwgc28gbWFrZSBzdXJlIHdlXG4gICAgICAgICAgLy8gY2xlYXIgYW55IHBlbmRpbmcgYXR0ck5hbWVFbmRJbmRleFxuICAgICAgICAgIGF0dHJOYW1lRW5kSW5kZXggPSAtMTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFtBVFRSSUJVVEVfTkFNRV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIEF0dHJpYnV0ZSBuYW1lIHBvc2l0aW9uXG4gICAgICAgICAgYXR0ck5hbWVFbmRJbmRleCA9IC0yO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF0dHJOYW1lRW5kSW5kZXggPSByZWdleC5sYXN0SW5kZXggLSBtYXRjaFtTUEFDRVNfQU5EX0VRVUFMU10ubGVuZ3RoO1xuICAgICAgICAgIGF0dHJOYW1lID0gbWF0Y2hbQVRUUklCVVRFX05BTUVdO1xuICAgICAgICAgIHJlZ2V4ID1cbiAgICAgICAgICAgIG1hdGNoW1FVT1RFX0NIQVJdID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgPyB0YWdFbmRSZWdleFxuICAgICAgICAgICAgICA6IG1hdGNoW1FVT1RFX0NIQVJdID09PSAnXCInXG4gICAgICAgICAgICAgICAgPyBkb3VibGVRdW90ZUF0dHJFbmRSZWdleFxuICAgICAgICAgICAgICAgIDogc2luZ2xlUXVvdGVBdHRyRW5kUmVnZXg7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHJlZ2V4ID09PSBkb3VibGVRdW90ZUF0dHJFbmRSZWdleCB8fFxuICAgICAgICByZWdleCA9PT0gc2luZ2xlUXVvdGVBdHRyRW5kUmVnZXhcbiAgICAgICkge1xuICAgICAgICByZWdleCA9IHRhZ0VuZFJlZ2V4O1xuICAgICAgfSBlbHNlIGlmIChyZWdleCA9PT0gY29tbWVudEVuZFJlZ2V4IHx8IHJlZ2V4ID09PSBjb21tZW50MkVuZFJlZ2V4KSB7XG4gICAgICAgIHJlZ2V4ID0gdGV4dEVuZFJlZ2V4O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTm90IG9uZSBvZiB0aGUgZml2ZSBzdGF0ZSByZWdleGVzLCBzbyBpdCBtdXN0IGJlIHRoZSBkeW5hbWljYWxseVxuICAgICAgICAvLyBjcmVhdGVkIHJhdyB0ZXh0IHJlZ2V4IGFuZCB3ZSdyZSBhdCB0aGUgY2xvc2Ugb2YgdGhhdCBlbGVtZW50LlxuICAgICAgICByZWdleCA9IHRhZ0VuZFJlZ2V4O1xuICAgICAgICByYXdUZXh0RW5kUmVnZXggPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAvLyBJZiB3ZSBoYXZlIGEgYXR0ck5hbWVFbmRJbmRleCwgd2hpY2ggaW5kaWNhdGVzIHRoYXQgd2Ugc2hvdWxkXG4gICAgICAvLyByZXdyaXRlIHRoZSBhdHRyaWJ1dGUgbmFtZSwgYXNzZXJ0IHRoYXQgd2UncmUgaW4gYSB2YWxpZCBhdHRyaWJ1dGVcbiAgICAgIC8vIHBvc2l0aW9uIC0gZWl0aGVyIGluIGEgdGFnLCBvciBhIHF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUuXG4gICAgICBjb25zb2xlLmFzc2VydChcbiAgICAgICAgYXR0ck5hbWVFbmRJbmRleCA9PT0gLTEgfHxcbiAgICAgICAgICByZWdleCA9PT0gdGFnRW5kUmVnZXggfHxcbiAgICAgICAgICByZWdleCA9PT0gc2luZ2xlUXVvdGVBdHRyRW5kUmVnZXggfHxcbiAgICAgICAgICByZWdleCA9PT0gZG91YmxlUXVvdGVBdHRyRW5kUmVnZXgsXG4gICAgICAgICd1bmV4cGVjdGVkIHBhcnNlIHN0YXRlIEInXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFdlIGhhdmUgZm91ciBjYXNlczpcbiAgICAvLyAgMS4gV2UncmUgaW4gdGV4dCBwb3NpdGlvbiwgYW5kIG5vdCBpbiBhIHJhdyB0ZXh0IGVsZW1lbnRcbiAgICAvLyAgICAgKHJlZ2V4ID09PSB0ZXh0RW5kUmVnZXgpOiBpbnNlcnQgYSBjb21tZW50IG1hcmtlci5cbiAgICAvLyAgMi4gV2UgaGF2ZSBhIG5vbi1uZWdhdGl2ZSBhdHRyTmFtZUVuZEluZGV4IHdoaWNoIG1lYW5zIHdlIG5lZWQgdG9cbiAgICAvLyAgICAgcmV3cml0ZSB0aGUgYXR0cmlidXRlIG5hbWUgdG8gYWRkIGEgYm91bmQgYXR0cmlidXRlIHN1ZmZpeC5cbiAgICAvLyAgMy4gV2UncmUgYXQgdGhlIG5vbi1maXJzdCBiaW5kaW5nIGluIGEgbXVsdGktYmluZGluZyBhdHRyaWJ1dGUsIHVzZSBhXG4gICAgLy8gICAgIHBsYWluIG1hcmtlci5cbiAgICAvLyAgNC4gV2UncmUgc29tZXdoZXJlIGVsc2UgaW5zaWRlIHRoZSB0YWcuIElmIHdlJ3JlIGluIGF0dHJpYnV0ZSBuYW1lXG4gICAgLy8gICAgIHBvc2l0aW9uIChhdHRyTmFtZUVuZEluZGV4ID09PSAtMiksIGFkZCBhIHNlcXVlbnRpYWwgc3VmZml4IHRvXG4gICAgLy8gICAgIGdlbmVyYXRlIGEgdW5pcXVlIGF0dHJpYnV0ZSBuYW1lLlxuXG4gICAgLy8gRGV0ZWN0IGEgYmluZGluZyBuZXh0IHRvIHNlbGYtY2xvc2luZyB0YWcgZW5kIGFuZCBpbnNlcnQgYSBzcGFjZSB0b1xuICAgIC8vIHNlcGFyYXRlIHRoZSBtYXJrZXIgZnJvbSB0aGUgdGFnIGVuZDpcbiAgICBjb25zdCBlbmQgPVxuICAgICAgcmVnZXggPT09IHRhZ0VuZFJlZ2V4ICYmIHN0cmluZ3NbaSArIDFdLnN0YXJ0c1dpdGgoJy8+JykgPyAnICcgOiAnJztcbiAgICBodG1sICs9XG4gICAgICByZWdleCA9PT0gdGV4dEVuZFJlZ2V4XG4gICAgICAgID8gcyArIG5vZGVNYXJrZXJcbiAgICAgICAgOiBhdHRyTmFtZUVuZEluZGV4ID49IDBcbiAgICAgICAgICA/IChhdHRyTmFtZXMucHVzaChhdHRyTmFtZSEpLFxuICAgICAgICAgICAgcy5zbGljZSgwLCBhdHRyTmFtZUVuZEluZGV4KSArXG4gICAgICAgICAgICAgIGJvdW5kQXR0cmlidXRlU3VmZml4ICtcbiAgICAgICAgICAgICAgcy5zbGljZShhdHRyTmFtZUVuZEluZGV4KSkgK1xuICAgICAgICAgICAgbWFya2VyICtcbiAgICAgICAgICAgIGVuZFxuICAgICAgICAgIDogcyArIG1hcmtlciArIChhdHRyTmFtZUVuZEluZGV4ID09PSAtMiA/IGkgOiBlbmQpO1xuICB9XG5cbiAgY29uc3QgaHRtbFJlc3VsdDogc3RyaW5nIHwgVHJ1c3RlZEhUTUwgPVxuICAgIGh0bWwgK1xuICAgIChzdHJpbmdzW2xdIHx8ICc8Pz4nKSArXG4gICAgKHR5cGUgPT09IFNWR19SRVNVTFQgPyAnPC9zdmc+JyA6IHR5cGUgPT09IE1BVEhNTF9SRVNVTFQgPyAnPC9tYXRoPicgOiAnJyk7XG5cbiAgLy8gUmV0dXJuZWQgYXMgYW4gYXJyYXkgZm9yIHRlcnNlbmVzc1xuICByZXR1cm4gW3RydXN0RnJvbVRlbXBsYXRlU3RyaW5nKHN0cmluZ3MsIGh0bWxSZXN1bHQpLCBhdHRyTmFtZXNdO1xufTtcblxuLyoqIEBpbnRlcm5hbCAqL1xuZXhwb3J0IHR5cGUge1RlbXBsYXRlfTtcbmNsYXNzIFRlbXBsYXRlIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBlbCE6IEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XG5cbiAgcGFydHM6IEFycmF5PFRlbXBsYXRlUGFydD4gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIHtzdHJpbmdzLCBbJ18kbGl0VHlwZSQnXTogdHlwZX06IFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCxcbiAgICBvcHRpb25zPzogUmVuZGVyT3B0aW9uc1xuICApIHtcbiAgICBsZXQgbm9kZTogTm9kZSB8IG51bGw7XG4gICAgbGV0IG5vZGVJbmRleCA9IDA7XG4gICAgbGV0IGF0dHJOYW1lSW5kZXggPSAwO1xuICAgIGNvbnN0IHBhcnRDb3VudCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICBjb25zdCBwYXJ0cyA9IHRoaXMucGFydHM7XG5cbiAgICAvLyBDcmVhdGUgdGVtcGxhdGUgZWxlbWVudFxuICAgIGNvbnN0IFtodG1sLCBhdHRyTmFtZXNdID0gZ2V0VGVtcGxhdGVIdG1sKHN0cmluZ3MsIHR5cGUpO1xuICAgIHRoaXMuZWwgPSBUZW1wbGF0ZS5jcmVhdGVFbGVtZW50KGh0bWwsIG9wdGlvbnMpO1xuICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IHRoaXMuZWwuY29udGVudDtcblxuICAgIC8vIFJlLXBhcmVudCBTVkcgb3IgTWF0aE1MIG5vZGVzIGludG8gdGVtcGxhdGUgcm9vdFxuICAgIGlmICh0eXBlID09PSBTVkdfUkVTVUxUIHx8IHR5cGUgPT09IE1BVEhNTF9SRVNVTFQpIHtcbiAgICAgIGNvbnN0IHdyYXBwZXIgPSB0aGlzLmVsLmNvbnRlbnQuZmlyc3RDaGlsZCE7XG4gICAgICB3cmFwcGVyLnJlcGxhY2VXaXRoKC4uLndyYXBwZXIuY2hpbGROb2Rlcyk7XG4gICAgfVxuXG4gICAgLy8gV2FsayB0aGUgdGVtcGxhdGUgdG8gZmluZCBiaW5kaW5nIG1hcmtlcnMgYW5kIGNyZWF0ZSBUZW1wbGF0ZVBhcnRzXG4gICAgd2hpbGUgKChub2RlID0gd2Fsa2VyLm5leHROb2RlKCkpICE9PSBudWxsICYmIHBhcnRzLmxlbmd0aCA8IHBhcnRDb3VudCkge1xuICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAgICAgY29uc3QgdGFnID0gKG5vZGUgYXMgRWxlbWVudCkubG9jYWxOYW1lO1xuICAgICAgICAgIC8vIFdhcm4gaWYgYHRleHRhcmVhYCBpbmNsdWRlcyBhbiBleHByZXNzaW9uIGFuZCB0aHJvdyBpZiBgdGVtcGxhdGVgXG4gICAgICAgICAgLy8gZG9lcyBzaW5jZSB0aGVzZSBhcmUgbm90IHN1cHBvcnRlZC4gV2UgZG8gdGhpcyBieSBjaGVja2luZ1xuICAgICAgICAgIC8vIGlubmVySFRNTCBmb3IgYW55dGhpbmcgdGhhdCBsb29rcyBsaWtlIGEgbWFya2VyLiBUaGlzIGNhdGNoZXNcbiAgICAgICAgICAvLyBjYXNlcyBsaWtlIGJpbmRpbmdzIGluIHRleHRhcmVhIHRoZXJlIG1hcmtlcnMgdHVybiBpbnRvIHRleHQgbm9kZXMuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgL14oPzp0ZXh0YXJlYXx0ZW1wbGF0ZSkkL2khLnRlc3QodGFnKSAmJlxuICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkuaW5uZXJIVE1MLmluY2x1ZGVzKG1hcmtlcilcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IG0gPVxuICAgICAgICAgICAgICBgRXhwcmVzc2lvbnMgYXJlIG5vdCBzdXBwb3J0ZWQgaW5zaWRlIFxcYCR7dGFnfVxcYCBgICtcbiAgICAgICAgICAgICAgYGVsZW1lbnRzLiBTZWUgaHR0cHM6Ly9saXQuZGV2L21zZy9leHByZXNzaW9uLWluLSR7dGFnfSBmb3IgbW9yZSBgICtcbiAgICAgICAgICAgICAgYGluZm9ybWF0aW9uLmA7XG4gICAgICAgICAgICBpZiAodGFnID09PSAndGVtcGxhdGUnKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtKTtcbiAgICAgICAgICAgIH0gZWxzZSBpc3N1ZVdhcm5pbmcoJycsIG0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPIChqdXN0aW5mYWduYW5pKTogZm9yIGF0dGVtcHRlZCBkeW5hbWljIHRhZyBuYW1lcywgd2UgZG9uJ3RcbiAgICAgICAgLy8gaW5jcmVtZW50IHRoZSBiaW5kaW5nSW5kZXgsIGFuZCBpdCdsbCBiZSBvZmYgYnkgMSBpbiB0aGUgZWxlbWVudFxuICAgICAgICAvLyBhbmQgb2ZmIGJ5IHR3byBhZnRlciBpdC5cbiAgICAgICAgaWYgKChub2RlIGFzIEVsZW1lbnQpLmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiAobm9kZSBhcyBFbGVtZW50KS5nZXRBdHRyaWJ1dGVOYW1lcygpKSB7XG4gICAgICAgICAgICBpZiAobmFtZS5lbmRzV2l0aChib3VuZEF0dHJpYnV0ZVN1ZmZpeCkpIHtcbiAgICAgICAgICAgICAgY29uc3QgcmVhbE5hbWUgPSBhdHRyTmFtZXNbYXR0ck5hbWVJbmRleCsrXTtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSAobm9kZSBhcyBFbGVtZW50KS5nZXRBdHRyaWJ1dGUobmFtZSkhO1xuICAgICAgICAgICAgICBjb25zdCBzdGF0aWNzID0gdmFsdWUuc3BsaXQobWFya2VyKTtcbiAgICAgICAgICAgICAgY29uc3QgbSA9IC8oWy4/QF0pPyguKikvLmV4ZWMocmVhbE5hbWUpITtcbiAgICAgICAgICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogQVRUUklCVVRFX1BBUlQsXG4gICAgICAgICAgICAgICAgaW5kZXg6IG5vZGVJbmRleCxcbiAgICAgICAgICAgICAgICBuYW1lOiBtWzJdLFxuICAgICAgICAgICAgICAgIHN0cmluZ3M6IHN0YXRpY3MsXG4gICAgICAgICAgICAgICAgY3RvcjpcbiAgICAgICAgICAgICAgICAgIG1bMV0gPT09ICcuJ1xuICAgICAgICAgICAgICAgICAgICA/IFByb3BlcnR5UGFydFxuICAgICAgICAgICAgICAgICAgICA6IG1bMV0gPT09ICc/J1xuICAgICAgICAgICAgICAgICAgICAgID8gQm9vbGVhbkF0dHJpYnV0ZVBhcnRcbiAgICAgICAgICAgICAgICAgICAgICA6IG1bMV0gPT09ICdAJ1xuICAgICAgICAgICAgICAgICAgICAgICAgPyBFdmVudFBhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIDogQXR0cmlidXRlUGFydCxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmFtZS5zdGFydHNXaXRoKG1hcmtlcikpIHtcbiAgICAgICAgICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogRUxFTUVOVF9QQVJULFxuICAgICAgICAgICAgICAgIGluZGV4OiBub2RlSW5kZXgsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiBiZW5jaG1hcmsgdGhlIHJlZ2V4IGFnYWluc3QgdGVzdGluZyBmb3IgZWFjaFxuICAgICAgICAvLyBvZiB0aGUgMyByYXcgdGV4dCBlbGVtZW50IG5hbWVzLlxuICAgICAgICBpZiAocmF3VGV4dEVsZW1lbnQudGVzdCgobm9kZSBhcyBFbGVtZW50KS50YWdOYW1lKSkge1xuICAgICAgICAgIC8vIEZvciByYXcgdGV4dCBlbGVtZW50cyB3ZSBuZWVkIHRvIHNwbGl0IHRoZSB0ZXh0IGNvbnRlbnQgb25cbiAgICAgICAgICAvLyBtYXJrZXJzLCBjcmVhdGUgYSBUZXh0IG5vZGUgZm9yIGVhY2ggc2VnbWVudCwgYW5kIGNyZWF0ZVxuICAgICAgICAgIC8vIGEgVGVtcGxhdGVQYXJ0IGZvciBlYWNoIG1hcmtlci5cbiAgICAgICAgICBjb25zdCBzdHJpbmdzID0gKG5vZGUgYXMgRWxlbWVudCkudGV4dENvbnRlbnQhLnNwbGl0KG1hcmtlcik7XG4gICAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICAgIGlmIChsYXN0SW5kZXggPiAwKSB7XG4gICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS50ZXh0Q29udGVudCA9IHRydXN0ZWRUeXBlc1xuICAgICAgICAgICAgICA/ICh0cnVzdGVkVHlwZXMuZW1wdHlTY3JpcHQgYXMgdW5rbm93biBhcyAnJylcbiAgICAgICAgICAgICAgOiAnJztcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbmV3IHRleHQgbm9kZSBmb3IgZWFjaCBsaXRlcmFsIHNlY3Rpb25cbiAgICAgICAgICAgIC8vIFRoZXNlIG5vZGVzIGFyZSBhbHNvIHVzZWQgYXMgdGhlIG1hcmtlcnMgZm9yIG5vZGUgcGFydHNcbiAgICAgICAgICAgIC8vIFdlIGNhbid0IHVzZSBlbXB0eSB0ZXh0IG5vZGVzIGFzIG1hcmtlcnMgYmVjYXVzZSB0aGV5J3JlXG4gICAgICAgICAgICAvLyBub3JtYWxpemVkIHdoZW4gY2xvbmluZyBpbiBJRSAoY291bGQgc2ltcGxpZnkgd2hlblxuICAgICAgICAgICAgLy8gSUUgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZClcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFzdEluZGV4OyBpKyspIHtcbiAgICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkuYXBwZW5kKHN0cmluZ3NbaV0sIGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgICAgICAgLy8gV2FsayBwYXN0IHRoZSBtYXJrZXIgbm9kZSB3ZSBqdXN0IGFkZGVkXG4gICAgICAgICAgICAgIHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgICBwYXJ0cy5wdXNoKHt0eXBlOiBDSElMRF9QQVJULCBpbmRleDogKytub2RlSW5kZXh9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE5vdGUgYmVjYXVzZSB0aGlzIG1hcmtlciBpcyBhZGRlZCBhZnRlciB0aGUgd2Fsa2VyJ3MgY3VycmVudFxuICAgICAgICAgICAgLy8gbm9kZSwgaXQgd2lsbCBiZSB3YWxrZWQgdG8gaW4gdGhlIG91dGVyIGxvb3AgKGFuZCBpZ25vcmVkKSwgc29cbiAgICAgICAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gYWRqdXN0IG5vZGVJbmRleCBoZXJlXG4gICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5hcHBlbmQoc3RyaW5nc1tsYXN0SW5kZXhdLCBjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDgpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IChub2RlIGFzIENvbW1lbnQpLmRhdGE7XG4gICAgICAgIGlmIChkYXRhID09PSBtYXJrZXJNYXRjaCkge1xuICAgICAgICAgIHBhcnRzLnB1c2goe3R5cGU6IENISUxEX1BBUlQsIGluZGV4OiBub2RlSW5kZXh9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXQgaSA9IC0xO1xuICAgICAgICAgIHdoaWxlICgoaSA9IChub2RlIGFzIENvbW1lbnQpLmRhdGEuaW5kZXhPZihtYXJrZXIsIGkgKyAxKSkgIT09IC0xKSB7XG4gICAgICAgICAgICAvLyBDb21tZW50IG5vZGUgaGFzIGEgYmluZGluZyBtYXJrZXIgaW5zaWRlLCBtYWtlIGFuIGluYWN0aXZlIHBhcnRcbiAgICAgICAgICAgIC8vIFRoZSBiaW5kaW5nIHdvbid0IHdvcmssIGJ1dCBzdWJzZXF1ZW50IGJpbmRpbmdzIHdpbGxcbiAgICAgICAgICAgIHBhcnRzLnB1c2goe3R5cGU6IENPTU1FTlRfUEFSVCwgaW5kZXg6IG5vZGVJbmRleH0pO1xuICAgICAgICAgICAgLy8gTW92ZSB0byB0aGUgZW5kIG9mIHRoZSBtYXRjaFxuICAgICAgICAgICAgaSArPSBtYXJrZXIubGVuZ3RoIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5vZGVJbmRleCsrO1xuICAgIH1cblxuICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgLy8gSWYgdGhlcmUgd2FzIGEgZHVwbGljYXRlIGF0dHJpYnV0ZSBvbiBhIHRhZywgdGhlbiB3aGVuIHRoZSB0YWcgaXNcbiAgICAgIC8vIHBhcnNlZCBpbnRvIGFuIGVsZW1lbnQgdGhlIGF0dHJpYnV0ZSBnZXRzIGRlLWR1cGxpY2F0ZWQuIFdlIGNhbiBkZXRlY3RcbiAgICAgIC8vIHRoaXMgbWlzbWF0Y2ggaWYgd2UgaGF2ZW4ndCBwcmVjaXNlbHkgY29uc3VtZWQgZXZlcnkgYXR0cmlidXRlIG5hbWVcbiAgICAgIC8vIHdoZW4gcHJlcGFyaW5nIHRoZSB0ZW1wbGF0ZS4gVGhpcyB3b3JrcyBiZWNhdXNlIGBhdHRyTmFtZXNgIGlzIGJ1aWx0XG4gICAgICAvLyBmcm9tIHRoZSB0ZW1wbGF0ZSBzdHJpbmcgYW5kIGBhdHRyTmFtZUluZGV4YCBjb21lcyBmcm9tIHByb2Nlc3NpbmcgdGhlXG4gICAgICAvLyByZXN1bHRpbmcgRE9NLlxuICAgICAgaWYgKGF0dHJOYW1lcy5sZW5ndGggIT09IGF0dHJOYW1lSW5kZXgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBEZXRlY3RlZCBkdXBsaWNhdGUgYXR0cmlidXRlIGJpbmRpbmdzLiBUaGlzIG9jY3VycyBpZiB5b3VyIHRlbXBsYXRlIGAgK1xuICAgICAgICAgICAgYGhhcyBkdXBsaWNhdGUgYXR0cmlidXRlcyBvbiBhbiBlbGVtZW50IHRhZy4gRm9yIGV4YW1wbGUgYCArXG4gICAgICAgICAgICBgXCI8aW5wdXQgP2Rpc2FibGVkPVxcJHt0cnVlfSA/ZGlzYWJsZWQ9XFwke2ZhbHNlfT5cIiBjb250YWlucyBhIGAgK1xuICAgICAgICAgICAgYGR1cGxpY2F0ZSBcImRpc2FibGVkXCIgYXR0cmlidXRlLiBUaGUgZXJyb3Igd2FzIGRldGVjdGVkIGluIGAgK1xuICAgICAgICAgICAgYHRoZSBmb2xsb3dpbmcgdGVtcGxhdGU6IFxcbmAgK1xuICAgICAgICAgICAgJ2AnICtcbiAgICAgICAgICAgIHN0cmluZ3Muam9pbignJHsuLi59JykgK1xuICAgICAgICAgICAgJ2AnXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2UgY291bGQgc2V0IHdhbGtlci5jdXJyZW50Tm9kZSB0byBhbm90aGVyIG5vZGUgaGVyZSB0byBwcmV2ZW50IGEgbWVtb3J5XG4gICAgLy8gbGVhaywgYnV0IGV2ZXJ5IHRpbWUgd2UgcHJlcGFyZSBhIHRlbXBsYXRlLCB3ZSBpbW1lZGlhdGVseSByZW5kZXIgaXRcbiAgICAvLyBhbmQgcmUtdXNlIHRoZSB3YWxrZXIgaW4gbmV3IFRlbXBsYXRlSW5zdGFuY2UuX2Nsb25lKCkuXG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBwcmVwJyxcbiAgICAgICAgdGVtcGxhdGU6IHRoaXMsXG4gICAgICAgIGNsb25hYmxlVGVtcGxhdGU6IHRoaXMuZWwsXG4gICAgICAgIHBhcnRzOiB0aGlzLnBhcnRzLFxuICAgICAgICBzdHJpbmdzLFxuICAgICAgfSk7XG4gIH1cblxuICAvLyBPdmVycmlkZGVuIHZpYSBgbGl0SHRtbFBvbHlmaWxsU3VwcG9ydGAgdG8gcHJvdmlkZSBwbGF0Zm9ybSBzdXBwb3J0LlxuICAvKiogQG5vY29sbGFwc2UgKi9cbiAgc3RhdGljIGNyZWF0ZUVsZW1lbnQoaHRtbDogVHJ1c3RlZEhUTUwsIF9vcHRpb25zPzogUmVuZGVyT3B0aW9ucykge1xuICAgIGNvbnN0IGVsID0gZC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgIGVsLmlubmVySFRNTCA9IGh0bWwgYXMgdW5rbm93biBhcyBzdHJpbmc7XG4gICAgcmV0dXJuIGVsO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlzY29ubmVjdGFibGUge1xuICBfJHBhcmVudD86IERpc2Nvbm5lY3RhYmxlO1xuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+O1xuICAvLyBSYXRoZXIgdGhhbiBob2xkIGNvbm5lY3Rpb24gc3RhdGUgb24gaW5zdGFuY2VzLCBEaXNjb25uZWN0YWJsZXMgcmVjdXJzaXZlbHlcbiAgLy8gZmV0Y2ggdGhlIGNvbm5lY3Rpb24gc3RhdGUgZnJvbSB0aGUgUm9vdFBhcnQgdGhleSBhcmUgY29ubmVjdGVkIGluIHZpYVxuICAvLyBnZXR0ZXJzIHVwIHRoZSBEaXNjb25uZWN0YWJsZSB0cmVlIHZpYSBfJHBhcmVudCByZWZlcmVuY2VzLiBUaGlzIHB1c2hlcyB0aGVcbiAgLy8gY29zdCBvZiB0cmFja2luZyB0aGUgaXNDb25uZWN0ZWQgc3RhdGUgdG8gYEFzeW5jRGlyZWN0aXZlc2AsIGFuZCBhdm9pZHNcbiAgLy8gbmVlZGluZyB0byBwYXNzIGFsbCBEaXNjb25uZWN0YWJsZXMgKHBhcnRzLCB0ZW1wbGF0ZSBpbnN0YW5jZXMsIGFuZFxuICAvLyBkaXJlY3RpdmVzKSB0aGVpciBjb25uZWN0aW9uIHN0YXRlIGVhY2ggdGltZSBpdCBjaGFuZ2VzLCB3aGljaCB3b3VsZCBiZVxuICAvLyBjb3N0bHkgZm9yIHRyZWVzIHRoYXQgaGF2ZSBubyBBc3luY0RpcmVjdGl2ZXMuXG4gIF8kaXNDb25uZWN0ZWQ6IGJvb2xlYW47XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVEaXJlY3RpdmUoXG4gIHBhcnQ6IENoaWxkUGFydCB8IEF0dHJpYnV0ZVBhcnQgfCBFbGVtZW50UGFydCxcbiAgdmFsdWU6IHVua25vd24sXG4gIHBhcmVudDogRGlyZWN0aXZlUGFyZW50ID0gcGFydCxcbiAgYXR0cmlidXRlSW5kZXg/OiBudW1iZXJcbik6IHVua25vd24ge1xuICAvLyBCYWlsIGVhcmx5IGlmIHRoZSB2YWx1ZSBpcyBleHBsaWNpdGx5IG5vQ2hhbmdlLiBOb3RlLCB0aGlzIG1lYW5zIGFueVxuICAvLyBuZXN0ZWQgZGlyZWN0aXZlIGlzIHN0aWxsIGF0dGFjaGVkIGFuZCBpcyBub3QgcnVuLlxuICBpZiAodmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGxldCBjdXJyZW50RGlyZWN0aXZlID1cbiAgICBhdHRyaWJ1dGVJbmRleCAhPT0gdW5kZWZpbmVkXG4gICAgICA/IChwYXJlbnQgYXMgQXR0cmlidXRlUGFydCkuX19kaXJlY3RpdmVzPy5bYXR0cmlidXRlSW5kZXhdXG4gICAgICA6IChwYXJlbnQgYXMgQ2hpbGRQYXJ0IHwgRWxlbWVudFBhcnQgfCBEaXJlY3RpdmUpLl9fZGlyZWN0aXZlO1xuICBjb25zdCBuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IgPSBpc1ByaW1pdGl2ZSh2YWx1ZSlcbiAgICA/IHVuZGVmaW5lZFxuICAgIDogLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICAgICh2YWx1ZSBhcyBEaXJlY3RpdmVSZXN1bHQpWydfJGxpdERpcmVjdGl2ZSQnXTtcbiAgaWYgKGN1cnJlbnREaXJlY3RpdmU/LmNvbnN0cnVjdG9yICE9PSBuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IpIHtcbiAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIGN1cnJlbnREaXJlY3RpdmU/LlsnXyRub3RpZnlEaXJlY3RpdmVDb25uZWN0aW9uQ2hhbmdlZCddPy4oZmFsc2UpO1xuICAgIGlmIChuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY3VycmVudERpcmVjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudERpcmVjdGl2ZSA9IG5ldyBuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IocGFydCBhcyBQYXJ0SW5mbyk7XG4gICAgICBjdXJyZW50RGlyZWN0aXZlLl8kaW5pdGlhbGl6ZShwYXJ0LCBwYXJlbnQsIGF0dHJpYnV0ZUluZGV4KTtcbiAgICB9XG4gICAgaWYgKGF0dHJpYnV0ZUluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICgocGFyZW50IGFzIEF0dHJpYnV0ZVBhcnQpLl9fZGlyZWN0aXZlcyA/Pz0gW10pW2F0dHJpYnV0ZUluZGV4XSA9XG4gICAgICAgIGN1cnJlbnREaXJlY3RpdmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIChwYXJlbnQgYXMgQ2hpbGRQYXJ0IHwgRGlyZWN0aXZlKS5fX2RpcmVjdGl2ZSA9IGN1cnJlbnREaXJlY3RpdmU7XG4gICAgfVxuICB9XG4gIGlmIChjdXJyZW50RGlyZWN0aXZlICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YWx1ZSA9IHJlc29sdmVEaXJlY3RpdmUoXG4gICAgICBwYXJ0LFxuICAgICAgY3VycmVudERpcmVjdGl2ZS5fJHJlc29sdmUocGFydCwgKHZhbHVlIGFzIERpcmVjdGl2ZVJlc3VsdCkudmFsdWVzKSxcbiAgICAgIGN1cnJlbnREaXJlY3RpdmUsXG4gICAgICBhdHRyaWJ1dGVJbmRleFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgdHlwZSB7VGVtcGxhdGVJbnN0YW5jZX07XG4vKipcbiAqIEFuIHVwZGF0ZWFibGUgaW5zdGFuY2Ugb2YgYSBUZW1wbGF0ZS4gSG9sZHMgcmVmZXJlbmNlcyB0byB0aGUgUGFydHMgdXNlZCB0b1xuICogdXBkYXRlIHRoZSB0ZW1wbGF0ZSBpbnN0YW5jZS5cbiAqL1xuY2xhc3MgVGVtcGxhdGVJbnN0YW5jZSBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgXyR0ZW1wbGF0ZTogVGVtcGxhdGU7XG4gIF8kcGFydHM6IEFycmF5PFBhcnQgfCB1bmRlZmluZWQ+ID0gW107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHBhcmVudDogQ2hpbGRQYXJ0O1xuICAvKiogQGludGVybmFsICovXG4gIF8kZGlzY29ubmVjdGFibGVDaGlsZHJlbj86IFNldDxEaXNjb25uZWN0YWJsZT4gPSB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IodGVtcGxhdGU6IFRlbXBsYXRlLCBwYXJlbnQ6IENoaWxkUGFydCkge1xuICAgIHRoaXMuXyR0ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIHRoaXMuXyRwYXJlbnQgPSBwYXJlbnQ7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgQ2hpbGRQYXJ0IHBhcmVudE5vZGUgZ2V0dGVyXG4gIGdldCBwYXJlbnROb2RlKCkge1xuICAgIHJldHVybiB0aGlzLl8kcGFyZW50LnBhcmVudE5vZGU7XG4gIH1cblxuICAvLyBTZWUgY29tbWVudCBpbiBEaXNjb25uZWN0YWJsZSBpbnRlcmZhY2UgZm9yIHdoeSB0aGlzIGlzIGEgZ2V0dGVyXG4gIGdldCBfJGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl8kcGFyZW50Ll8kaXNDb25uZWN0ZWQ7XG4gIH1cblxuICAvLyBUaGlzIG1ldGhvZCBpcyBzZXBhcmF0ZSBmcm9tIHRoZSBjb25zdHJ1Y3RvciBiZWNhdXNlIHdlIG5lZWQgdG8gcmV0dXJuIGFcbiAgLy8gRG9jdW1lbnRGcmFnbWVudCBhbmQgd2UgZG9uJ3Qgd2FudCB0byBob2xkIG9udG8gaXQgd2l0aCBhbiBpbnN0YW5jZSBmaWVsZC5cbiAgX2Nsb25lKG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQpIHtcbiAgICBjb25zdCB7XG4gICAgICBlbDoge2NvbnRlbnR9LFxuICAgICAgcGFydHM6IHBhcnRzLFxuICAgIH0gPSB0aGlzLl8kdGVtcGxhdGU7XG4gICAgY29uc3QgZnJhZ21lbnQgPSAob3B0aW9ucz8uY3JlYXRpb25TY29wZSA/PyBkKS5pbXBvcnROb2RlKGNvbnRlbnQsIHRydWUpO1xuICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IGZyYWdtZW50O1xuXG4gICAgbGV0IG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKSE7XG4gICAgbGV0IG5vZGVJbmRleCA9IDA7XG4gICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgbGV0IHRlbXBsYXRlUGFydCA9IHBhcnRzWzBdO1xuXG4gICAgd2hpbGUgKHRlbXBsYXRlUGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAobm9kZUluZGV4ID09PSB0ZW1wbGF0ZVBhcnQuaW5kZXgpIHtcbiAgICAgICAgbGV0IHBhcnQ6IFBhcnQgfCB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0ZW1wbGF0ZVBhcnQudHlwZSA9PT0gQ0hJTERfUEFSVCkge1xuICAgICAgICAgIHBhcnQgPSBuZXcgQ2hpbGRQYXJ0KFxuICAgICAgICAgICAgbm9kZSBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICAgIG5vZGUubmV4dFNpYmxpbmcsXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGVtcGxhdGVQYXJ0LnR5cGUgPT09IEFUVFJJQlVURV9QQVJUKSB7XG4gICAgICAgICAgcGFydCA9IG5ldyB0ZW1wbGF0ZVBhcnQuY3RvcihcbiAgICAgICAgICAgIG5vZGUgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgICB0ZW1wbGF0ZVBhcnQubmFtZSxcbiAgICAgICAgICAgIHRlbXBsYXRlUGFydC5zdHJpbmdzLFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRlbXBsYXRlUGFydC50eXBlID09PSBFTEVNRU5UX1BBUlQpIHtcbiAgICAgICAgICBwYXJ0ID0gbmV3IEVsZW1lbnRQYXJ0KG5vZGUgYXMgSFRNTEVsZW1lbnQsIHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuXyRwYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICB0ZW1wbGF0ZVBhcnQgPSBwYXJ0c1srK3BhcnRJbmRleF07XG4gICAgICB9XG4gICAgICBpZiAobm9kZUluZGV4ICE9PSB0ZW1wbGF0ZVBhcnQ/LmluZGV4KSB7XG4gICAgICAgIG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKSE7XG4gICAgICAgIG5vZGVJbmRleCsrO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBXZSBuZWVkIHRvIHNldCB0aGUgY3VycmVudE5vZGUgYXdheSBmcm9tIHRoZSBjbG9uZWQgdHJlZSBzbyB0aGF0IHdlXG4gICAgLy8gZG9uJ3QgaG9sZCBvbnRvIHRoZSB0cmVlIGV2ZW4gaWYgdGhlIHRyZWUgaXMgZGV0YWNoZWQgYW5kIHNob3VsZCBiZVxuICAgIC8vIGZyZWVkLlxuICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IGQ7XG4gICAgcmV0dXJuIGZyYWdtZW50O1xuICB9XG5cbiAgX3VwZGF0ZSh2YWx1ZXM6IEFycmF5PHVua25vd24+KSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcGFydCBvZiB0aGlzLl8kcGFydHMpIHtcbiAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgICAga2luZDogJ3NldCBwYXJ0JyxcbiAgICAgICAgICAgIHBhcnQsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVzW2ldLFxuICAgICAgICAgICAgdmFsdWVJbmRleDogaSxcbiAgICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgICAgIHRlbXBsYXRlSW5zdGFuY2U6IHRoaXMsXG4gICAgICAgICAgfSk7XG4gICAgICAgIGlmICgocGFydCBhcyBBdHRyaWJ1dGVQYXJ0KS5zdHJpbmdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAocGFydCBhcyBBdHRyaWJ1dGVQYXJ0KS5fJHNldFZhbHVlKHZhbHVlcywgcGFydCBhcyBBdHRyaWJ1dGVQYXJ0LCBpKTtcbiAgICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIHZhbHVlcyB0aGUgcGFydCBjb25zdW1lcyBpcyBwYXJ0LnN0cmluZ3MubGVuZ3RoIC0gMVxuICAgICAgICAgIC8vIHNpbmNlIHZhbHVlcyBhcmUgaW4gYmV0d2VlbiB0ZW1wbGF0ZSBzcGFucy4gV2UgaW5jcmVtZW50IGkgYnkgMVxuICAgICAgICAgIC8vIGxhdGVyIGluIHRoZSBsb29wLCBzbyBpbmNyZW1lbnQgaXQgYnkgcGFydC5zdHJpbmdzLmxlbmd0aCAtIDIgaGVyZVxuICAgICAgICAgIGkgKz0gKHBhcnQgYXMgQXR0cmlidXRlUGFydCkuc3RyaW5ncyEubGVuZ3RoIC0gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXJ0Ll8kc2V0VmFsdWUodmFsdWVzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgfVxufVxuXG4vKlxuICogUGFydHNcbiAqL1xudHlwZSBBdHRyaWJ1dGVUZW1wbGF0ZVBhcnQgPSB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBBVFRSSUJVVEVfUEFSVDtcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICByZWFkb25seSBjdG9yOiB0eXBlb2YgQXR0cmlidXRlUGFydDtcbiAgcmVhZG9ubHkgc3RyaW5nczogUmVhZG9ubHlBcnJheTxzdHJpbmc+O1xufTtcbnR5cGUgQ2hpbGRUZW1wbGF0ZVBhcnQgPSB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBDSElMRF9QQVJUO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xufTtcbnR5cGUgRWxlbWVudFRlbXBsYXRlUGFydCA9IHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIEVMRU1FTlRfUEFSVDtcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbn07XG50eXBlIENvbW1lbnRUZW1wbGF0ZVBhcnQgPSB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBDT01NRU5UX1BBUlQ7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG59O1xuXG4vKipcbiAqIEEgVGVtcGxhdGVQYXJ0IHJlcHJlc2VudHMgYSBkeW5hbWljIHBhcnQgaW4gYSB0ZW1wbGF0ZSwgYmVmb3JlIHRoZSB0ZW1wbGF0ZVxuICogaXMgaW5zdGFudGlhdGVkLiBXaGVuIGEgdGVtcGxhdGUgaXMgaW5zdGFudGlhdGVkIFBhcnRzIGFyZSBjcmVhdGVkIGZyb21cbiAqIFRlbXBsYXRlUGFydHMuXG4gKi9cbnR5cGUgVGVtcGxhdGVQYXJ0ID1cbiAgfCBDaGlsZFRlbXBsYXRlUGFydFxuICB8IEF0dHJpYnV0ZVRlbXBsYXRlUGFydFxuICB8IEVsZW1lbnRUZW1wbGF0ZVBhcnRcbiAgfCBDb21tZW50VGVtcGxhdGVQYXJ0O1xuXG5leHBvcnQgdHlwZSBQYXJ0ID1cbiAgfCBDaGlsZFBhcnRcbiAgfCBBdHRyaWJ1dGVQYXJ0XG4gIHwgUHJvcGVydHlQYXJ0XG4gIHwgQm9vbGVhbkF0dHJpYnV0ZVBhcnRcbiAgfCBFbGVtZW50UGFydFxuICB8IEV2ZW50UGFydDtcblxuZXhwb3J0IHR5cGUge0NoaWxkUGFydH07XG5jbGFzcyBDaGlsZFBhcnQgaW1wbGVtZW50cyBEaXNjb25uZWN0YWJsZSB7XG4gIHJlYWRvbmx5IHR5cGUgPSBDSElMRF9QQVJUO1xuICByZWFkb25seSBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICBfJGNvbW1pdHRlZFZhbHVlOiB1bmtub3duID0gbm90aGluZztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfX2RpcmVjdGl2ZT86IERpcmVjdGl2ZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHN0YXJ0Tm9kZTogQ2hpbGROb2RlO1xuICAvKiogQGludGVybmFsICovXG4gIF8kZW5kTm9kZTogQ2hpbGROb2RlIHwgbnVsbDtcbiAgcHJpdmF0ZSBfdGV4dFNhbml0aXplcjogVmFsdWVTYW5pdGl6ZXIgfCB1bmRlZmluZWQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlIHwgdW5kZWZpbmVkO1xuICAvKipcbiAgICogQ29ubmVjdGlvbiBzdGF0ZSBmb3IgUm9vdFBhcnRzIG9ubHkgKGkuZS4gQ2hpbGRQYXJ0IHdpdGhvdXQgXyRwYXJlbnRcbiAgICogcmV0dXJuZWQgZnJvbSB0b3AtbGV2ZWwgYHJlbmRlcmApLiBUaGlzIGZpZWxkIGlzIHVudXNlZCBvdGhlcndpc2UuIFRoZVxuICAgKiBpbnRlbnRpb24gd291bGQgYmUgY2xlYXJlciBpZiB3ZSBtYWRlIGBSb290UGFydGAgYSBzdWJjbGFzcyBvZiBgQ2hpbGRQYXJ0YFxuICAgKiB3aXRoIHRoaXMgZmllbGQgKGFuZCBhIGRpZmZlcmVudCBfJGlzQ29ubmVjdGVkIGdldHRlciksIGJ1dCB0aGUgc3ViY2xhc3NcbiAgICogY2F1c2VkIGEgcGVyZiByZWdyZXNzaW9uLCBwb3NzaWJseSBkdWUgdG8gbWFraW5nIGNhbGwgc2l0ZXMgcG9seW1vcnBoaWMuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX19pc0Nvbm5lY3RlZDogYm9vbGVhbjtcblxuICAvLyBTZWUgY29tbWVudCBpbiBEaXNjb25uZWN0YWJsZSBpbnRlcmZhY2UgZm9yIHdoeSB0aGlzIGlzIGEgZ2V0dGVyXG4gIGdldCBfJGlzQ29ubmVjdGVkKCkge1xuICAgIC8vIENoaWxkUGFydHMgdGhhdCBhcmUgbm90IGF0IHRoZSByb290IHNob3VsZCBhbHdheXMgYmUgY3JlYXRlZCB3aXRoIGFcbiAgICAvLyBwYXJlbnQ7IG9ubHkgUm9vdENoaWxkTm9kZSdzIHdvbid0LCBzbyB0aGV5IHJldHVybiB0aGUgbG9jYWwgaXNDb25uZWN0ZWRcbiAgICAvLyBzdGF0ZVxuICAgIHJldHVybiB0aGlzLl8kcGFyZW50Py5fJGlzQ29ubmVjdGVkID8/IHRoaXMuX19pc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIC8vIFRoZSBmb2xsb3dpbmcgZmllbGRzIHdpbGwgYmUgcGF0Y2hlZCBvbnRvIENoaWxkUGFydHMgd2hlbiByZXF1aXJlZCBieVxuICAvLyBBc3luY0RpcmVjdGl2ZVxuICAvKiogQGludGVybmFsICovXG4gIF8kZGlzY29ubmVjdGFibGVDaGlsZHJlbj86IFNldDxEaXNjb25uZWN0YWJsZT4gPSB1bmRlZmluZWQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZD8oXG4gICAgaXNDb25uZWN0ZWQ6IGJvb2xlYW4sXG4gICAgcmVtb3ZlRnJvbVBhcmVudD86IGJvb2xlYW4sXG4gICAgZnJvbT86IG51bWJlclxuICApOiB2b2lkO1xuICAvKiogQGludGVybmFsICovXG4gIF8kcmVwYXJlbnREaXNjb25uZWN0YWJsZXM/KHBhcmVudDogRGlzY29ubmVjdGFibGUpOiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHN0YXJ0Tm9kZTogQ2hpbGROb2RlLFxuICAgIGVuZE5vZGU6IENoaWxkTm9kZSB8IG51bGwsXG4gICAgcGFyZW50OiBUZW1wbGF0ZUluc3RhbmNlIHwgQ2hpbGRQYXJ0IHwgdW5kZWZpbmVkLFxuICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWRcbiAgKSB7XG4gICAgdGhpcy5fJHN0YXJ0Tm9kZSA9IHN0YXJ0Tm9kZTtcbiAgICB0aGlzLl8kZW5kTm9kZSA9IGVuZE5vZGU7XG4gICAgdGhpcy5fJHBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIC8vIE5vdGUgX19pc0Nvbm5lY3RlZCBpcyBvbmx5IGV2ZXIgYWNjZXNzZWQgb24gUm9vdFBhcnRzIChpLmUuIHdoZW4gdGhlcmUgaXNcbiAgICAvLyBubyBfJHBhcmVudCk7IHRoZSB2YWx1ZSBvbiBhIG5vbi1yb290LXBhcnQgaXMgXCJkb24ndCBjYXJlXCIsIGJ1dCBjaGVja2luZ1xuICAgIC8vIGZvciBwYXJlbnQgd291bGQgYmUgbW9yZSBjb2RlXG4gICAgdGhpcy5fX2lzQ29ubmVjdGVkID0gb3B0aW9ucz8uaXNDb25uZWN0ZWQgPz8gdHJ1ZTtcbiAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICAvLyBFeHBsaWNpdGx5IGluaXRpYWxpemUgZm9yIGNvbnNpc3RlbnQgY2xhc3Mgc2hhcGUuXG4gICAgICB0aGlzLl90ZXh0U2FuaXRpemVyID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcGFyZW50IG5vZGUgaW50byB3aGljaCB0aGUgcGFydCByZW5kZXJzIGl0cyBjb250ZW50LlxuICAgKlxuICAgKiBBIENoaWxkUGFydCdzIGNvbnRlbnQgY29uc2lzdHMgb2YgYSByYW5nZSBvZiBhZGphY2VudCBjaGlsZCBub2RlcyBvZlxuICAgKiBgLnBhcmVudE5vZGVgLCBwb3NzaWJseSBib3JkZXJlZCBieSAnbWFya2VyIG5vZGVzJyAoYC5zdGFydE5vZGVgIGFuZFxuICAgKiBgLmVuZE5vZGVgKS5cbiAgICpcbiAgICogLSBJZiBib3RoIGAuc3RhcnROb2RlYCBhbmQgYC5lbmROb2RlYCBhcmUgbm9uLW51bGwsIHRoZW4gdGhlIHBhcnQncyBjb250ZW50XG4gICAqIGNvbnNpc3RzIG9mIGFsbCBzaWJsaW5ncyBiZXR3ZWVuIGAuc3RhcnROb2RlYCBhbmQgYC5lbmROb2RlYCwgZXhjbHVzaXZlbHkuXG4gICAqXG4gICAqIC0gSWYgYC5zdGFydE5vZGVgIGlzIG5vbi1udWxsIGJ1dCBgLmVuZE5vZGVgIGlzIG51bGwsIHRoZW4gdGhlIHBhcnQnc1xuICAgKiBjb250ZW50IGNvbnNpc3RzIG9mIGFsbCBzaWJsaW5ncyBmb2xsb3dpbmcgYC5zdGFydE5vZGVgLCB1cCB0byBhbmRcbiAgICogaW5jbHVkaW5nIHRoZSBsYXN0IGNoaWxkIG9mIGAucGFyZW50Tm9kZWAuIElmIGAuZW5kTm9kZWAgaXMgbm9uLW51bGwsIHRoZW5cbiAgICogYC5zdGFydE5vZGVgIHdpbGwgYWx3YXlzIGJlIG5vbi1udWxsLlxuICAgKlxuICAgKiAtIElmIGJvdGggYC5lbmROb2RlYCBhbmQgYC5zdGFydE5vZGVgIGFyZSBudWxsLCB0aGVuIHRoZSBwYXJ0J3MgY29udGVudFxuICAgKiBjb25zaXN0cyBvZiBhbGwgY2hpbGQgbm9kZXMgb2YgYC5wYXJlbnROb2RlYC5cbiAgICovXG4gIGdldCBwYXJlbnROb2RlKCk6IE5vZGUge1xuICAgIGxldCBwYXJlbnROb2RlOiBOb2RlID0gd3JhcCh0aGlzLl8kc3RhcnROb2RlKS5wYXJlbnROb2RlITtcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl8kcGFyZW50O1xuICAgIGlmIChcbiAgICAgIHBhcmVudCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBwYXJlbnROb2RlPy5ub2RlVHlwZSA9PT0gMTEgLyogTm9kZS5ET0NVTUVOVF9GUkFHTUVOVCAqL1xuICAgICkge1xuICAgICAgLy8gSWYgdGhlIHBhcmVudE5vZGUgaXMgYSBEb2N1bWVudEZyYWdtZW50LCBpdCBtYXkgYmUgYmVjYXVzZSB0aGUgRE9NIGlzXG4gICAgICAvLyBzdGlsbCBpbiB0aGUgY2xvbmVkIGZyYWdtZW50IGR1cmluZyBpbml0aWFsIHJlbmRlcjsgaWYgc28sIGdldCB0aGUgcmVhbFxuICAgICAgLy8gcGFyZW50Tm9kZSB0aGUgcGFydCB3aWxsIGJlIGNvbW1pdHRlZCBpbnRvIGJ5IGFza2luZyB0aGUgcGFyZW50LlxuICAgICAgcGFyZW50Tm9kZSA9IChwYXJlbnQgYXMgQ2hpbGRQYXJ0IHwgVGVtcGxhdGVJbnN0YW5jZSkucGFyZW50Tm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmVudE5vZGU7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHBhcnQncyBsZWFkaW5nIG1hcmtlciBub2RlLCBpZiBhbnkuIFNlZSBgLnBhcmVudE5vZGVgIGZvciBtb3JlXG4gICAqIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgZ2V0IHN0YXJ0Tm9kZSgpOiBOb2RlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuXyRzdGFydE5vZGU7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHBhcnQncyB0cmFpbGluZyBtYXJrZXIgbm9kZSwgaWYgYW55LiBTZWUgYC5wYXJlbnROb2RlYCBmb3IgbW9yZVxuICAgKiBpbmZvcm1hdGlvbi5cbiAgICovXG4gIGdldCBlbmROb2RlKCk6IE5vZGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fJGVuZE5vZGU7XG4gIH1cblxuICBfJHNldFZhbHVlKHZhbHVlOiB1bmtub3duLCBkaXJlY3RpdmVQYXJlbnQ6IERpcmVjdGl2ZVBhcmVudCA9IHRoaXMpOiB2b2lkIHtcbiAgICBpZiAoREVWX01PREUgJiYgdGhpcy5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBUaGlzIFxcYENoaWxkUGFydFxcYCBoYXMgbm8gXFxgcGFyZW50Tm9kZVxcYCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBhY2NlcHQgYSB2YWx1ZS4gVGhpcyBsaWtlbHkgbWVhbnMgdGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgcGFydCB3YXMgbWFuaXB1bGF0ZWQgaW4gYW4gdW5zdXBwb3J0ZWQgd2F5IG91dHNpZGUgb2YgTGl0J3MgY29udHJvbCBzdWNoIHRoYXQgdGhlIHBhcnQncyBtYXJrZXIgbm9kZXMgd2VyZSBlamVjdGVkIGZyb20gRE9NLiBGb3IgZXhhbXBsZSwgc2V0dGluZyB0aGUgZWxlbWVudCdzIFxcYGlubmVySFRNTFxcYCBvciBcXGB0ZXh0Q29udGVudFxcYCBjYW4gZG8gdGhpcy5gXG4gICAgICApO1xuICAgIH1cbiAgICB2YWx1ZSA9IHJlc29sdmVEaXJlY3RpdmUodGhpcywgdmFsdWUsIGRpcmVjdGl2ZVBhcmVudCk7XG4gICAgaWYgKGlzUHJpbWl0aXZlKHZhbHVlKSkge1xuICAgICAgLy8gTm9uLXJlbmRlcmluZyBjaGlsZCB2YWx1ZXMuIEl0J3MgaW1wb3J0YW50IHRoYXQgdGhlc2UgZG8gbm90IHJlbmRlclxuICAgICAgLy8gZW1wdHkgdGV4dCBub2RlcyB0byBhdm9pZCBpc3N1ZXMgd2l0aCBwcmV2ZW50aW5nIGRlZmF1bHQgPHNsb3Q+XG4gICAgICAvLyBmYWxsYmFjayBjb250ZW50LlxuICAgICAgaWYgKHZhbHVlID09PSBub3RoaW5nIHx8IHZhbHVlID09IG51bGwgfHwgdmFsdWUgPT09ICcnKSB7XG4gICAgICAgIGlmICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgIT09IG5vdGhpbmcpIHtcbiAgICAgICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICAgICAga2luZDogJ2NvbW1pdCBub3RoaW5nIHRvIGNoaWxkJyxcbiAgICAgICAgICAgICAgc3RhcnQ6IHRoaXMuXyRzdGFydE5vZGUsXG4gICAgICAgICAgICAgIGVuZDogdGhpcy5fJGVuZE5vZGUsXG4gICAgICAgICAgICAgIHBhcmVudDogdGhpcy5fJHBhcmVudCxcbiAgICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5fJGNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gbm90aGluZztcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgIT09IHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAmJiB2YWx1ZSAhPT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgICB9XG4gICAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIH0gZWxzZSBpZiAoKHZhbHVlIGFzIFRlbXBsYXRlUmVzdWx0KVsnXyRsaXRUeXBlJCddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX2NvbW1pdFRlbXBsYXRlUmVzdWx0KHZhbHVlIGFzIFRlbXBsYXRlUmVzdWx0KTtcbiAgICB9IGVsc2UgaWYgKCh2YWx1ZSBhcyBOb2RlKS5ub2RlVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoREVWX01PREUgJiYgdGhpcy5vcHRpb25zPy5ob3N0ID09PSB2YWx1ZSkge1xuICAgICAgICB0aGlzLl9jb21taXRUZXh0KFxuICAgICAgICAgIGBbcHJvYmFibGUgbWlzdGFrZTogcmVuZGVyZWQgYSB0ZW1wbGF0ZSdzIGhvc3QgaW4gaXRzZWxmIGAgK1xuICAgICAgICAgICAgYChjb21tb25seSBjYXVzZWQgYnkgd3JpdGluZyBcXCR7dGhpc30gaW4gYSB0ZW1wbGF0ZV1gXG4gICAgICAgICk7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBgQXR0ZW1wdGVkIHRvIHJlbmRlciB0aGUgdGVtcGxhdGUgaG9zdGAsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgYGluc2lkZSBpdHNlbGYuIFRoaXMgaXMgYWxtb3N0IGFsd2F5cyBhIG1pc3Rha2UsIGFuZCBpbiBkZXYgbW9kZSBgLFxuICAgICAgICAgIGB3ZSByZW5kZXIgc29tZSB3YXJuaW5nIHRleHQuIEluIHByb2R1Y3Rpb24gaG93ZXZlciwgd2UnbGwgYCxcbiAgICAgICAgICBgcmVuZGVyIGl0LCB3aGljaCB3aWxsIHVzdWFsbHkgcmVzdWx0IGluIGFuIGVycm9yLCBhbmQgc29tZXRpbWVzIGAsXG4gICAgICAgICAgYGluIHRoZSBlbGVtZW50IGRpc2FwcGVhcmluZyBmcm9tIHRoZSBET00uYFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9jb21taXROb2RlKHZhbHVlIGFzIE5vZGUpO1xuICAgIH0gZWxzZSBpZiAoaXNJdGVyYWJsZSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuX2NvbW1pdEl0ZXJhYmxlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRmFsbGJhY2ssIHdpbGwgcmVuZGVyIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb25cbiAgICAgIHRoaXMuX2NvbW1pdFRleHQodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2luc2VydDxUIGV4dGVuZHMgTm9kZT4obm9kZTogVCkge1xuICAgIHJldHVybiB3cmFwKHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkucGFyZW50Tm9kZSEpLmluc2VydEJlZm9yZShcbiAgICAgIG5vZGUsXG4gICAgICB0aGlzLl8kZW5kTm9kZVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9jb21taXROb2RlKHZhbHVlOiBOb2RlKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgIHRoaXMuXyRjbGVhcigpO1xuICAgICAgaWYgKFxuICAgICAgICBFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MgJiZcbiAgICAgICAgc2FuaXRpemVyRmFjdG9yeUludGVybmFsICE9PSBub29wU2FuaXRpemVyXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgcGFyZW50Tm9kZU5hbWUgPSB0aGlzLl8kc3RhcnROb2RlLnBhcmVudE5vZGU/Lm5vZGVOYW1lO1xuICAgICAgICBpZiAocGFyZW50Tm9kZU5hbWUgPT09ICdTVFlMRScgfHwgcGFyZW50Tm9kZU5hbWUgPT09ICdTQ1JJUFQnKSB7XG4gICAgICAgICAgbGV0IG1lc3NhZ2UgPSAnRm9yYmlkZGVuJztcbiAgICAgICAgICBpZiAoREVWX01PREUpIHtcbiAgICAgICAgICAgIGlmIChwYXJlbnROb2RlTmFtZSA9PT0gJ1NUWUxFJykge1xuICAgICAgICAgICAgICBtZXNzYWdlID1cbiAgICAgICAgICAgICAgICBgTGl0IGRvZXMgbm90IHN1cHBvcnQgYmluZGluZyBpbnNpZGUgc3R5bGUgbm9kZXMuIGAgK1xuICAgICAgICAgICAgICAgIGBUaGlzIGlzIGEgc2VjdXJpdHkgcmlzaywgYXMgc3R5bGUgaW5qZWN0aW9uIGF0dGFja3MgY2FuIGAgK1xuICAgICAgICAgICAgICAgIGBleGZpbHRyYXRlIGRhdGEgYW5kIHNwb29mIFVJcy4gYCArXG4gICAgICAgICAgICAgICAgYENvbnNpZGVyIGluc3RlYWQgdXNpbmcgY3NzXFxgLi4uXFxgIGxpdGVyYWxzIGAgK1xuICAgICAgICAgICAgICAgIGB0byBjb21wb3NlIHN0eWxlcywgYW5kIGRvIGR5bmFtaWMgc3R5bGluZyB3aXRoIGAgK1xuICAgICAgICAgICAgICAgIGBjc3MgY3VzdG9tIHByb3BlcnRpZXMsIDo6cGFydHMsIDxzbG90PnMsIGAgK1xuICAgICAgICAgICAgICAgIGBhbmQgYnkgbXV0YXRpbmcgdGhlIERPTSByYXRoZXIgdGhhbiBzdHlsZXNoZWV0cy5gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgYExpdCBkb2VzIG5vdCBzdXBwb3J0IGJpbmRpbmcgaW5zaWRlIHNjcmlwdCBub2Rlcy4gYCArXG4gICAgICAgICAgICAgICAgYFRoaXMgaXMgYSBzZWN1cml0eSByaXNrLCBhcyBpdCBjb3VsZCBhbGxvdyBhcmJpdHJhcnkgYCArXG4gICAgICAgICAgICAgICAgYGNvZGUgZXhlY3V0aW9uLmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAnY29tbWl0IG5vZGUnLFxuICAgICAgICAgIHN0YXJ0OiB0aGlzLl8kc3RhcnROb2RlLFxuICAgICAgICAgIHBhcmVudDogdGhpcy5fJHBhcmVudCxcbiAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IHRoaXMuX2luc2VydCh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29tbWl0VGV4dCh2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIC8vIElmIHRoZSBjb21taXR0ZWQgdmFsdWUgaXMgYSBwcmltaXRpdmUgaXQgbWVhbnMgd2UgY2FsbGVkIF9jb21taXRUZXh0IG9uXG4gICAgLy8gdGhlIHByZXZpb3VzIHJlbmRlciwgYW5kIHdlIGtub3cgdGhhdCB0aGlzLl8kc3RhcnROb2RlLm5leHRTaWJsaW5nIGlzIGFcbiAgICAvLyBUZXh0IG5vZGUuIFdlIGNhbiBub3cganVzdCByZXBsYWNlIHRoZSB0ZXh0IGNvbnRlbnQgKC5kYXRhKSBvZiB0aGUgbm9kZS5cbiAgICBpZiAoXG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgIT09IG5vdGhpbmcgJiZcbiAgICAgIGlzUHJpbWl0aXZlKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSlcbiAgICApIHtcbiAgICAgIGNvbnN0IG5vZGUgPSB3cmFwKHRoaXMuXyRzdGFydE5vZGUpLm5leHRTaWJsaW5nIGFzIFRleHQ7XG4gICAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICAgIGlmICh0aGlzLl90ZXh0U2FuaXRpemVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLl90ZXh0U2FuaXRpemVyID0gY3JlYXRlU2FuaXRpemVyKG5vZGUsICdkYXRhJywgJ3Byb3BlcnR5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgPSB0aGlzLl90ZXh0U2FuaXRpemVyKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ2NvbW1pdCB0ZXh0JyxcbiAgICAgICAgICBub2RlLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgICAobm9kZSBhcyBUZXh0KS5kYXRhID0gdmFsdWUgYXMgc3RyaW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICAgIGNvbnN0IHRleHROb2RlID0gZC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgICAgIHRoaXMuX2NvbW1pdE5vZGUodGV4dE5vZGUpO1xuICAgICAgICAvLyBXaGVuIHNldHRpbmcgdGV4dCBjb250ZW50LCBmb3Igc2VjdXJpdHkgcHVycG9zZXMgaXQgbWF0dGVycyBhIGxvdFxuICAgICAgICAvLyB3aGF0IHRoZSBwYXJlbnQgaXMuIEZvciBleGFtcGxlLCA8c3R5bGU+IGFuZCA8c2NyaXB0PiBuZWVkIHRvIGJlXG4gICAgICAgIC8vIGhhbmRsZWQgd2l0aCBjYXJlLCB3aGlsZSA8c3Bhbj4gZG9lcyBub3QuIFNvIGZpcnN0IHdlIG5lZWQgdG8gcHV0IGFcbiAgICAgICAgLy8gdGV4dCBub2RlIGludG8gdGhlIGRvY3VtZW50LCB0aGVuIHdlIGNhbiBzYW5pdGl6ZSBpdHMgY29udGVudC5cbiAgICAgICAgaWYgKHRoaXMuX3RleHRTYW5pdGl6ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuX3RleHRTYW5pdGl6ZXIgPSBjcmVhdGVTYW5pdGl6ZXIodGV4dE5vZGUsICdkYXRhJywgJ3Byb3BlcnR5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgPSB0aGlzLl90ZXh0U2FuaXRpemVyKHZhbHVlKTtcbiAgICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgICAga2luZDogJ2NvbW1pdCB0ZXh0JyxcbiAgICAgICAgICAgIG5vZGU6IHRleHROb2RlLFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgfSk7XG4gICAgICAgIHRleHROb2RlLmRhdGEgPSB2YWx1ZSBhcyBzdHJpbmc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jb21taXROb2RlKGQuY3JlYXRlVGV4dE5vZGUodmFsdWUgYXMgc3RyaW5nKSk7XG4gICAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICAgIGtpbmQ6ICdjb21taXQgdGV4dCcsXG4gICAgICAgICAgICBub2RlOiB3cmFwKHRoaXMuXyRzdGFydE5vZGUpLm5leHRTaWJsaW5nIGFzIFRleHQsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9jb21taXRUZW1wbGF0ZVJlc3VsdChcbiAgICByZXN1bHQ6IFRlbXBsYXRlUmVzdWx0IHwgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdFxuICApOiB2b2lkIHtcbiAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIGNvbnN0IHt2YWx1ZXMsIFsnXyRsaXRUeXBlJCddOiB0eXBlfSA9IHJlc3VsdDtcbiAgICAvLyBJZiAkbGl0VHlwZSQgaXMgYSBudW1iZXIsIHJlc3VsdCBpcyBhIHBsYWluIFRlbXBsYXRlUmVzdWx0IGFuZCB3ZSBnZXRcbiAgICAvLyB0aGUgdGVtcGxhdGUgZnJvbSB0aGUgdGVtcGxhdGUgY2FjaGUuIElmIG5vdCwgcmVzdWx0IGlzIGFcbiAgICAvLyBDb21waWxlZFRlbXBsYXRlUmVzdWx0IGFuZCBfJGxpdFR5cGUkIGlzIGEgQ29tcGlsZWRUZW1wbGF0ZSBhbmQgd2UgbmVlZFxuICAgIC8vIHRvIGNyZWF0ZSB0aGUgPHRlbXBsYXRlPiBlbGVtZW50IHRoZSBmaXJzdCB0aW1lIHdlIHNlZSBpdC5cbiAgICBjb25zdCB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBDb21waWxlZFRlbXBsYXRlID1cbiAgICAgIHR5cGVvZiB0eXBlID09PSAnbnVtYmVyJ1xuICAgICAgICA/IHRoaXMuXyRnZXRUZW1wbGF0ZShyZXN1bHQgYXMgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0KVxuICAgICAgICA6ICh0eXBlLmVsID09PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICh0eXBlLmVsID0gVGVtcGxhdGUuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgdHJ1c3RGcm9tVGVtcGxhdGVTdHJpbmcodHlwZS5oLCB0eXBlLmhbMF0pLFxuICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNcbiAgICAgICAgICAgICkpLFxuICAgICAgICAgIHR5cGUpO1xuXG4gICAgaWYgKCh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgVGVtcGxhdGVJbnN0YW5jZSk/Ll8kdGVtcGxhdGUgPT09IHRlbXBsYXRlKSB7XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSB1cGRhdGluZycsXG4gICAgICAgICAgdGVtcGxhdGUsXG4gICAgICAgICAgaW5zdGFuY2U6IHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBUZW1wbGF0ZUluc3RhbmNlLFxuICAgICAgICAgIHBhcnRzOiAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIFRlbXBsYXRlSW5zdGFuY2UpLl8kcGFydHMsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgfSk7XG4gICAgICAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIFRlbXBsYXRlSW5zdGFuY2UpLl91cGRhdGUodmFsdWVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZSBhcyBUZW1wbGF0ZSwgdGhpcyk7XG4gICAgICBjb25zdCBmcmFnbWVudCA9IGluc3RhbmNlLl9jbG9uZSh0aGlzLm9wdGlvbnMpO1xuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAndGVtcGxhdGUgaW5zdGFudGlhdGVkJyxcbiAgICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgICBpbnN0YW5jZSxcbiAgICAgICAgICBwYXJ0czogaW5zdGFuY2UuXyRwYXJ0cyxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgdmFsdWVzLFxuICAgICAgICB9KTtcbiAgICAgIGluc3RhbmNlLl91cGRhdGUodmFsdWVzKTtcbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ3RlbXBsYXRlIGluc3RhbnRpYXRlZCBhbmQgdXBkYXRlZCcsXG4gICAgICAgICAgdGVtcGxhdGUsXG4gICAgICAgICAgaW5zdGFuY2UsXG4gICAgICAgICAgcGFydHM6IGluc3RhbmNlLl8kcGFydHMsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgfSk7XG4gICAgICB0aGlzLl9jb21taXROb2RlKGZyYWdtZW50KTtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IGluc3RhbmNlO1xuICAgIH1cbiAgfVxuXG4gIC8vIE92ZXJyaWRkZW4gdmlhIGBsaXRIdG1sUG9seWZpbGxTdXBwb3J0YCB0byBwcm92aWRlIHBsYXRmb3JtIHN1cHBvcnQuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRnZXRUZW1wbGF0ZShyZXN1bHQ6IFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IHRlbXBsYXRlQ2FjaGUuZ2V0KHJlc3VsdC5zdHJpbmdzKTtcbiAgICBpZiAodGVtcGxhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGVtcGxhdGVDYWNoZS5zZXQocmVzdWx0LnN0cmluZ3MsICh0ZW1wbGF0ZSA9IG5ldyBUZW1wbGF0ZShyZXN1bHQpKSk7XG4gICAgfVxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1pdEl0ZXJhYmxlKHZhbHVlOiBJdGVyYWJsZTx1bmtub3duPik6IHZvaWQge1xuICAgIC8vIEZvciBhbiBJdGVyYWJsZSwgd2UgY3JlYXRlIGEgbmV3IEluc3RhbmNlUGFydCBwZXIgaXRlbSwgdGhlbiBzZXQgaXRzXG4gICAgLy8gdmFsdWUgdG8gdGhlIGl0ZW0uIFRoaXMgaXMgYSBsaXR0bGUgYml0IG9mIG92ZXJoZWFkIGZvciBldmVyeSBpdGVtIGluXG4gICAgLy8gYW4gSXRlcmFibGUsIGJ1dCBpdCBsZXRzIHVzIHJlY3Vyc2UgZWFzaWx5IGFuZCBlZmZpY2llbnRseSB1cGRhdGUgQXJyYXlzXG4gICAgLy8gb2YgVGVtcGxhdGVSZXN1bHRzIHRoYXQgd2lsbCBiZSBjb21tb25seSByZXR1cm5lZCBmcm9tIGV4cHJlc3Npb25zIGxpa2U6XG4gICAgLy8gYXJyYXkubWFwKChpKSA9PiBodG1sYCR7aX1gKSwgYnkgcmV1c2luZyBleGlzdGluZyBUZW1wbGF0ZUluc3RhbmNlcy5cblxuICAgIC8vIElmIHZhbHVlIGlzIGFuIGFycmF5LCB0aGVuIHRoZSBwcmV2aW91cyByZW5kZXIgd2FzIG9mIGFuXG4gICAgLy8gaXRlcmFibGUgYW5kIHZhbHVlIHdpbGwgY29udGFpbiB0aGUgQ2hpbGRQYXJ0cyBmcm9tIHRoZSBwcmV2aW91c1xuICAgIC8vIHJlbmRlci4gSWYgdmFsdWUgaXMgbm90IGFuIGFycmF5LCBjbGVhciB0aGlzIHBhcnQgYW5kIG1ha2UgYSBuZXdcbiAgICAvLyBhcnJheSBmb3IgQ2hpbGRQYXJ0cy5cbiAgICBpZiAoIWlzQXJyYXkodGhpcy5fJGNvbW1pdHRlZFZhbHVlKSkge1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gW107XG4gICAgICB0aGlzLl8kY2xlYXIoKTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIHVzIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgaXRlbXMgd2Ugc3RhbXBlZCBzbyB3ZSBjYW4gY2xlYXIgbGVmdG92ZXJcbiAgICAvLyBpdGVtcyBmcm9tIGEgcHJldmlvdXMgcmVuZGVyXG4gICAgY29uc3QgaXRlbVBhcnRzID0gdGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIENoaWxkUGFydFtdO1xuICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgIGxldCBpdGVtUGFydDogQ2hpbGRQYXJ0IHwgdW5kZWZpbmVkO1xuXG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHZhbHVlKSB7XG4gICAgICBpZiAocGFydEluZGV4ID09PSBpdGVtUGFydHMubGVuZ3RoKSB7XG4gICAgICAgIC8vIElmIG5vIGV4aXN0aW5nIHBhcnQsIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgICAgLy8gVE9ETyAoanVzdGluZmFnbmFuaSk6IHRlc3QgcGVyZiBpbXBhY3Qgb2YgYWx3YXlzIGNyZWF0aW5nIHR3byBwYXJ0c1xuICAgICAgICAvLyBpbnN0ZWFkIG9mIHNoYXJpbmcgcGFydHMgYmV0d2VlbiBub2Rlc1xuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbGl0L2xpdC9pc3N1ZXMvMTI2NlxuICAgICAgICBpdGVtUGFydHMucHVzaChcbiAgICAgICAgICAoaXRlbVBhcnQgPSBuZXcgQ2hpbGRQYXJ0KFxuICAgICAgICAgICAgdGhpcy5faW5zZXJ0KGNyZWF0ZU1hcmtlcigpKSxcbiAgICAgICAgICAgIHRoaXMuX2luc2VydChjcmVhdGVNYXJrZXIoKSksXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zXG4gICAgICAgICAgKSlcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFJldXNlIGFuIGV4aXN0aW5nIHBhcnRcbiAgICAgICAgaXRlbVBhcnQgPSBpdGVtUGFydHNbcGFydEluZGV4XTtcbiAgICAgIH1cbiAgICAgIGl0ZW1QYXJ0Ll8kc2V0VmFsdWUoaXRlbSk7XG4gICAgICBwYXJ0SW5kZXgrKztcbiAgICB9XG5cbiAgICBpZiAocGFydEluZGV4IDwgaXRlbVBhcnRzLmxlbmd0aCkge1xuICAgICAgLy8gaXRlbVBhcnRzIGFsd2F5cyBoYXZlIGVuZCBub2Rlc1xuICAgICAgdGhpcy5fJGNsZWFyKFxuICAgICAgICBpdGVtUGFydCAmJiB3cmFwKGl0ZW1QYXJ0Ll8kZW5kTm9kZSEpLm5leHRTaWJsaW5nLFxuICAgICAgICBwYXJ0SW5kZXhcbiAgICAgICk7XG4gICAgICAvLyBUcnVuY2F0ZSB0aGUgcGFydHMgYXJyYXkgc28gX3ZhbHVlIHJlZmxlY3RzIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgICBpdGVtUGFydHMubGVuZ3RoID0gcGFydEluZGV4O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBub2RlcyBjb250YWluZWQgd2l0aGluIHRoaXMgUGFydCBmcm9tIHRoZSBET00uXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydCBTdGFydCBub2RlIHRvIGNsZWFyIGZyb20sIGZvciBjbGVhcmluZyBhIHN1YnNldCBvZiB0aGUgcGFydCdzXG4gICAqICAgICBET00gKHVzZWQgd2hlbiB0cnVuY2F0aW5nIGl0ZXJhYmxlcylcbiAgICogQHBhcmFtIGZyb20gIFdoZW4gYHN0YXJ0YCBpcyBzcGVjaWZpZWQsIHRoZSBpbmRleCB3aXRoaW4gdGhlIGl0ZXJhYmxlIGZyb21cbiAgICogICAgIHdoaWNoIENoaWxkUGFydHMgYXJlIGJlaW5nIHJlbW92ZWQsIHVzZWQgZm9yIGRpc2Nvbm5lY3RpbmcgZGlyZWN0aXZlcyBpblxuICAgKiAgICAgdGhvc2UgUGFydHMuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgXyRjbGVhcihcbiAgICBzdGFydDogQ2hpbGROb2RlIHwgbnVsbCA9IHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkubmV4dFNpYmxpbmcsXG4gICAgZnJvbT86IG51bWJlclxuICApIHtcbiAgICB0aGlzLl8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQ/LihmYWxzZSwgdHJ1ZSwgZnJvbSk7XG4gICAgd2hpbGUgKHN0YXJ0ICYmIHN0YXJ0ICE9PSB0aGlzLl8kZW5kTm9kZSkge1xuICAgICAgY29uc3QgbiA9IHdyYXAoc3RhcnQhKS5uZXh0U2libGluZztcbiAgICAgICh3cmFwKHN0YXJ0ISkgYXMgRWxlbWVudCkucmVtb3ZlKCk7XG4gICAgICBzdGFydCA9IG47XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBvZiBSb290UGFydCdzIGBpc0Nvbm5lY3RlZGAuIE5vdGUgdGhhdCB0aGlzIG1ldGhvZFxuICAgKiBzaG91bGQgb25seSBiZSBjYWxsZWQgb24gYFJvb3RQYXJ0YHMgKHRoZSBgQ2hpbGRQYXJ0YCByZXR1cm5lZCBmcm9tIGFcbiAgICogdG9wLWxldmVsIGByZW5kZXIoKWAgY2FsbCkuIEl0IGhhcyBubyBlZmZlY3Qgb24gbm9uLXJvb3QgQ2hpbGRQYXJ0cy5cbiAgICogQHBhcmFtIGlzQ29ubmVjdGVkIFdoZXRoZXIgdG8gc2V0XG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgc2V0Q29ubmVjdGVkKGlzQ29ubmVjdGVkOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuXyRwYXJlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fX2lzQ29ubmVjdGVkID0gaXNDb25uZWN0ZWQ7XG4gICAgICB0aGlzLl8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQ/Lihpc0Nvbm5lY3RlZCk7XG4gICAgfSBlbHNlIGlmIChERVZfTU9ERSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAncGFydC5zZXRDb25uZWN0ZWQoKSBtYXkgb25seSBiZSBjYWxsZWQgb24gYSAnICtcbiAgICAgICAgICAnUm9vdFBhcnQgcmV0dXJuZWQgZnJvbSByZW5kZXIoKS4nXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEEgdG9wLWxldmVsIGBDaGlsZFBhcnRgIHJldHVybmVkIGZyb20gYHJlbmRlcmAgdGhhdCBtYW5hZ2VzIHRoZSBjb25uZWN0ZWRcbiAqIHN0YXRlIG9mIGBBc3luY0RpcmVjdGl2ZWBzIGNyZWF0ZWQgdGhyb3VnaG91dCB0aGUgdHJlZSBiZWxvdyBpdC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSb290UGFydCBleHRlbmRzIENoaWxkUGFydCB7XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjb25uZWN0aW9uIHN0YXRlIGZvciBgQXN5bmNEaXJlY3RpdmVgcyBjb250YWluZWQgd2l0aGluIHRoaXMgcm9vdFxuICAgKiBDaGlsZFBhcnQuXG4gICAqXG4gICAqIGxpdC1odG1sIGRvZXMgbm90IGF1dG9tYXRpY2FsbHkgbW9uaXRvciB0aGUgY29ubmVjdGVkbmVzcyBvZiBET00gcmVuZGVyZWQ7XG4gICAqIGFzIHN1Y2gsIGl0IGlzIHRoZSByZXNwb25zaWJpbGl0eSBvZiB0aGUgY2FsbGVyIHRvIGByZW5kZXJgIHRvIGVuc3VyZSB0aGF0XG4gICAqIGBwYXJ0LnNldENvbm5lY3RlZChmYWxzZSlgIGlzIGNhbGxlZCBiZWZvcmUgdGhlIHBhcnQgb2JqZWN0IGlzIHBvdGVudGlhbGx5XG4gICAqIGRpc2NhcmRlZCwgdG8gZW5zdXJlIHRoYXQgYEFzeW5jRGlyZWN0aXZlYHMgaGF2ZSBhIGNoYW5jZSB0byBkaXNwb3NlIG9mXG4gICAqIGFueSByZXNvdXJjZXMgYmVpbmcgaGVsZC4gSWYgYSBgUm9vdFBhcnRgIHRoYXQgd2FzIHByZXZpb3VzbHlcbiAgICogZGlzY29ubmVjdGVkIGlzIHN1YnNlcXVlbnRseSByZS1jb25uZWN0ZWQgKGFuZCBpdHMgYEFzeW5jRGlyZWN0aXZlYHMgc2hvdWxkXG4gICAqIHJlLWNvbm5lY3QpLCBgc2V0Q29ubmVjdGVkKHRydWUpYCBzaG91bGQgYmUgY2FsbGVkLlxuICAgKlxuICAgKiBAcGFyYW0gaXNDb25uZWN0ZWQgV2hldGhlciBkaXJlY3RpdmVzIHdpdGhpbiB0aGlzIHRyZWUgc2hvdWxkIGJlIGNvbm5lY3RlZFxuICAgKiBvciBub3RcbiAgICovXG4gIHNldENvbm5lY3RlZChpc0Nvbm5lY3RlZDogYm9vbGVhbik6IHZvaWQ7XG59XG5cbmV4cG9ydCB0eXBlIHtBdHRyaWJ1dGVQYXJ0fTtcbmNsYXNzIEF0dHJpYnV0ZVBhcnQgaW1wbGVtZW50cyBEaXNjb25uZWN0YWJsZSB7XG4gIHJlYWRvbmx5IHR5cGU6XG4gICAgfCB0eXBlb2YgQVRUUklCVVRFX1BBUlRcbiAgICB8IHR5cGVvZiBQUk9QRVJUWV9QQVJUXG4gICAgfCB0eXBlb2YgQk9PTEVBTl9BVFRSSUJVVEVfUEFSVFxuICAgIHwgdHlwZW9mIEVWRU5UX1BBUlQgPSBBVFRSSUJVVEVfUEFSVDtcbiAgcmVhZG9ubHkgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogSWYgdGhpcyBhdHRyaWJ1dGUgcGFydCByZXByZXNlbnRzIGFuIGludGVycG9sYXRpb24sIHRoaXMgY29udGFpbnMgdGhlXG4gICAqIHN0YXRpYyBzdHJpbmdzIG9mIHRoZSBpbnRlcnBvbGF0aW9uLiBGb3Igc2luZ2xlLXZhbHVlLCBjb21wbGV0ZSBiaW5kaW5ncyxcbiAgICogdGhpcyBpcyB1bmRlZmluZWQuXG4gICAqL1xuICByZWFkb25seSBzdHJpbmdzPzogUmVhZG9ubHlBcnJheTxzdHJpbmc+O1xuICAvKiogQGludGVybmFsICovXG4gIF8kY29tbWl0dGVkVmFsdWU6IHVua25vd24gfCBBcnJheTx1bmtub3duPiA9IG5vdGhpbmc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX19kaXJlY3RpdmVzPzogQXJyYXk8RGlyZWN0aXZlIHwgdW5kZWZpbmVkPjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHBhcmVudDogRGlzY29ubmVjdGFibGU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPiA9IHVuZGVmaW5lZDtcblxuICBwcm90ZWN0ZWQgX3Nhbml0aXplcjogVmFsdWVTYW5pdGl6ZXIgfCB1bmRlZmluZWQ7XG5cbiAgZ2V0IHRhZ05hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC50YWdOYW1lO1xuICB9XG5cbiAgLy8gU2VlIGNvbW1lbnQgaW4gRGlzY29ubmVjdGFibGUgaW50ZXJmYWNlIGZvciB3aHkgdGhpcyBpcyBhIGdldHRlclxuICBnZXQgXyRpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fJHBhcmVudC5fJGlzQ29ubmVjdGVkO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHN0cmluZ3M6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPixcbiAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlLFxuICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWRcbiAgKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuXyRwYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICBpZiAoc3RyaW5ncy5sZW5ndGggPiAyIHx8IHN0cmluZ3NbMF0gIT09ICcnIHx8IHN0cmluZ3NbMV0gIT09ICcnKSB7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBuZXcgQXJyYXkoc3RyaW5ncy5sZW5ndGggLSAxKS5maWxsKG5ldyBTdHJpbmcoKSk7XG4gICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBub3RoaW5nO1xuICAgIH1cbiAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICB0aGlzLl9zYW5pdGl6ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoaXMgcGFydCBieSByZXNvbHZpbmcgdGhlIHZhbHVlIGZyb20gcG9zc2libHkgbXVsdGlwbGVcbiAgICogdmFsdWVzIGFuZCBzdGF0aWMgc3RyaW5ncyBhbmQgY29tbWl0dGluZyBpdCB0byB0aGUgRE9NLlxuICAgKiBJZiB0aGlzIHBhcnQgaXMgc2luZ2xlLXZhbHVlZCwgYHRoaXMuX3N0cmluZ3NgIHdpbGwgYmUgdW5kZWZpbmVkLCBhbmQgdGhlXG4gICAqIG1ldGhvZCB3aWxsIGJlIGNhbGxlZCB3aXRoIGEgc2luZ2xlIHZhbHVlIGFyZ3VtZW50LiBJZiB0aGlzIHBhcnQgaXNcbiAgICogbXVsdGktdmFsdWUsIGB0aGlzLl9zdHJpbmdzYCB3aWxsIGJlIGRlZmluZWQsIGFuZCB0aGUgbWV0aG9kIGlzIGNhbGxlZFxuICAgKiB3aXRoIHRoZSB2YWx1ZSBhcnJheSBvZiB0aGUgcGFydCdzIG93bmluZyBUZW1wbGF0ZUluc3RhbmNlLCBhbmQgYW4gb2Zmc2V0XG4gICAqIGludG8gdGhlIHZhbHVlIGFycmF5IGZyb20gd2hpY2ggdGhlIHZhbHVlcyBzaG91bGQgYmUgcmVhZC5cbiAgICogVGhpcyBtZXRob2QgaXMgb3ZlcmxvYWRlZCB0aGlzIHdheSB0byBlbGltaW5hdGUgc2hvcnQtbGl2ZWQgYXJyYXkgc2xpY2VzXG4gICAqIG9mIHRoZSB0ZW1wbGF0ZSBpbnN0YW5jZSB2YWx1ZXMsIGFuZCBhbGxvdyBhIGZhc3QtcGF0aCBmb3Igc2luZ2xlLXZhbHVlZFxuICAgKiBwYXJ0cy5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBwYXJ0IHZhbHVlLCBvciBhbiBhcnJheSBvZiB2YWx1ZXMgZm9yIG11bHRpLXZhbHVlZCBwYXJ0c1xuICAgKiBAcGFyYW0gdmFsdWVJbmRleCB0aGUgaW5kZXggdG8gc3RhcnQgcmVhZGluZyB2YWx1ZXMgZnJvbS4gYHVuZGVmaW5lZGAgZm9yXG4gICAqICAgc2luZ2xlLXZhbHVlZCBwYXJ0c1xuICAgKiBAcGFyYW0gbm9Db21taXQgY2F1c2VzIHRoZSBwYXJ0IHRvIG5vdCBjb21taXQgaXRzIHZhbHVlIHRvIHRoZSBET00uIFVzZWRcbiAgICogICBpbiBoeWRyYXRpb24gdG8gcHJpbWUgYXR0cmlidXRlIHBhcnRzIHdpdGggdGhlaXIgZmlyc3QtcmVuZGVyZWQgdmFsdWUsXG4gICAqICAgYnV0IG5vdCBzZXQgdGhlIGF0dHJpYnV0ZSwgYW5kIGluIFNTUiB0byBuby1vcCB0aGUgRE9NIG9wZXJhdGlvbiBhbmRcbiAgICogICBjYXB0dXJlIHRoZSB2YWx1ZSBmb3Igc2VyaWFsaXphdGlvbi5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfJHNldFZhbHVlKFxuICAgIHZhbHVlOiB1bmtub3duIHwgQXJyYXk8dW5rbm93bj4sXG4gICAgZGlyZWN0aXZlUGFyZW50OiBEaXJlY3RpdmVQYXJlbnQgPSB0aGlzLFxuICAgIHZhbHVlSW5kZXg/OiBudW1iZXIsXG4gICAgbm9Db21taXQ/OiBib29sZWFuXG4gICkge1xuICAgIGNvbnN0IHN0cmluZ3MgPSB0aGlzLnN0cmluZ3M7XG5cbiAgICAvLyBXaGV0aGVyIGFueSBvZiB0aGUgdmFsdWVzIGhhcyBjaGFuZ2VkLCBmb3IgZGlydHktY2hlY2tpbmdcbiAgICBsZXQgY2hhbmdlID0gZmFsc2U7XG5cbiAgICBpZiAoc3RyaW5ncyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBTaW5nbGUtdmFsdWUgYmluZGluZyBjYXNlXG4gICAgICB2YWx1ZSA9IHJlc29sdmVEaXJlY3RpdmUodGhpcywgdmFsdWUsIGRpcmVjdGl2ZVBhcmVudCwgMCk7XG4gICAgICBjaGFuZ2UgPVxuICAgICAgICAhaXNQcmltaXRpdmUodmFsdWUpIHx8XG4gICAgICAgICh2YWx1ZSAhPT0gdGhpcy5fJGNvbW1pdHRlZFZhbHVlICYmIHZhbHVlICE9PSBub0NoYW5nZSk7XG4gICAgICBpZiAoY2hhbmdlKSB7XG4gICAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbnRlcnBvbGF0aW9uIGNhc2VcbiAgICAgIGNvbnN0IHZhbHVlcyA9IHZhbHVlIGFzIEFycmF5PHVua25vd24+O1xuICAgICAgdmFsdWUgPSBzdHJpbmdzWzBdO1xuXG4gICAgICBsZXQgaSwgdjtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICB2ID0gcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCB2YWx1ZXNbdmFsdWVJbmRleCEgKyBpXSwgZGlyZWN0aXZlUGFyZW50LCBpKTtcblxuICAgICAgICBpZiAodiA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgdXNlci1wcm92aWRlZCB2YWx1ZSBpcyBgbm9DaGFuZ2VgLCB1c2UgdGhlIHByZXZpb3VzIHZhbHVlXG4gICAgICAgICAgdiA9ICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgQXJyYXk8dW5rbm93bj4pW2ldO1xuICAgICAgICB9XG4gICAgICAgIGNoYW5nZSB8fD1cbiAgICAgICAgICAhaXNQcmltaXRpdmUodikgfHwgdiAhPT0gKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBBcnJheTx1bmtub3duPilbaV07XG4gICAgICAgIGlmICh2ID09PSBub3RoaW5nKSB7XG4gICAgICAgICAgdmFsdWUgPSBub3RoaW5nO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlICE9PSBub3RoaW5nKSB7XG4gICAgICAgICAgdmFsdWUgKz0gKHYgPz8gJycpICsgc3RyaW5nc1tpICsgMV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gV2UgYWx3YXlzIHJlY29yZCBlYWNoIHZhbHVlLCBldmVuIGlmIG9uZSBpcyBgbm90aGluZ2AsIGZvciBmdXR1cmVcbiAgICAgICAgLy8gY2hhbmdlIGRldGVjdGlvbi5cbiAgICAgICAgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBBcnJheTx1bmtub3duPilbaV0gPSB2O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2hhbmdlICYmICFub0NvbW1pdCkge1xuICAgICAgdGhpcy5fY29tbWl0VmFsdWUodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbW1pdFZhbHVlKHZhbHVlOiB1bmtub3duKSB7XG4gICAgaWYgKHZhbHVlID09PSBub3RoaW5nKSB7XG4gICAgICAod3JhcCh0aGlzLmVsZW1lbnQpIGFzIEVsZW1lbnQpLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICAgIGlmICh0aGlzLl9zYW5pdGl6ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuX3Nhbml0aXplciA9IHNhbml0aXplckZhY3RvcnlJbnRlcm5hbChcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgICAgICdhdHRyaWJ1dGUnXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZSA9IHRoaXMuX3Nhbml0aXplcih2YWx1ZSA/PyAnJyk7XG4gICAgICB9XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICdjb21taXQgYXR0cmlidXRlJyxcbiAgICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgICAod3JhcCh0aGlzLmVsZW1lbnQpIGFzIEVsZW1lbnQpLnNldEF0dHJpYnV0ZShcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICAodmFsdWUgPz8gJycpIGFzIHN0cmluZ1xuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUge1Byb3BlcnR5UGFydH07XG5jbGFzcyBQcm9wZXJ0eVBhcnQgZXh0ZW5kcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkgdHlwZSA9IFBST1BFUlRZX1BBUlQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfY29tbWl0VmFsdWUodmFsdWU6IHVua25vd24pIHtcbiAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICBpZiAodGhpcy5fc2FuaXRpemVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fc2FuaXRpemVyID0gc2FuaXRpemVyRmFjdG9yeUludGVybmFsKFxuICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgICAgJ3Byb3BlcnR5J1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSB0aGlzLl9zYW5pdGl6ZXIodmFsdWUpO1xuICAgIH1cbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ2NvbW1pdCBwcm9wZXJ0eScsXG4gICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgfSk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAodGhpcy5lbGVtZW50IGFzIGFueSlbdGhpcy5uYW1lXSA9IHZhbHVlID09PSBub3RoaW5nID8gdW5kZWZpbmVkIDogdmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUge0Jvb2xlYW5BdHRyaWJ1dGVQYXJ0fTtcbmNsYXNzIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0IGV4dGVuZHMgQXR0cmlidXRlUGFydCB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IHR5cGUgPSBCT09MRUFOX0FUVFJJQlVURV9QQVJUO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgX2NvbW1pdFZhbHVlKHZhbHVlOiB1bmtub3duKSB7XG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICdjb21taXQgYm9vbGVhbiBhdHRyaWJ1dGUnLFxuICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgdmFsdWU6ICEhKHZhbHVlICYmIHZhbHVlICE9PSBub3RoaW5nKSxcbiAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgfSk7XG4gICAgKHdyYXAodGhpcy5lbGVtZW50KSBhcyBFbGVtZW50KS50b2dnbGVBdHRyaWJ1dGUoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICAhIXZhbHVlICYmIHZhbHVlICE9PSBub3RoaW5nXG4gICAgKTtcbiAgfVxufVxuXG50eXBlIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucyA9IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgJlxuICBQYXJ0aWFsPEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zPjtcblxuLyoqXG4gKiBBbiBBdHRyaWJ1dGVQYXJ0IHRoYXQgbWFuYWdlcyBhbiBldmVudCBsaXN0ZW5lciB2aWEgYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIuXG4gKlxuICogVGhpcyBwYXJ0IHdvcmtzIGJ5IGFkZGluZyBpdHNlbGYgYXMgdGhlIGV2ZW50IGxpc3RlbmVyIG9uIGFuIGVsZW1lbnQsIHRoZW5cbiAqIGRlbGVnYXRpbmcgdG8gdGhlIHZhbHVlIHBhc3NlZCB0byBpdC4gVGhpcyByZWR1Y2VzIHRoZSBudW1iZXIgb2YgY2FsbHMgdG9cbiAqIGFkZC9yZW1vdmVFdmVudExpc3RlbmVyIGlmIHRoZSBsaXN0ZW5lciBjaGFuZ2VzIGZyZXF1ZW50bHksIHN1Y2ggYXMgd2hlbiBhblxuICogaW5saW5lIGZ1bmN0aW9uIGlzIHVzZWQgYXMgYSBsaXN0ZW5lci5cbiAqXG4gKiBCZWNhdXNlIGV2ZW50IG9wdGlvbnMgYXJlIHBhc3NlZCB3aGVuIGFkZGluZyBsaXN0ZW5lcnMsIHdlIG11c3QgdGFrZSBjYXNlXG4gKiB0byBhZGQgYW5kIHJlbW92ZSB0aGUgcGFydCBhcyBhIGxpc3RlbmVyIHdoZW4gdGhlIGV2ZW50IG9wdGlvbnMgY2hhbmdlLlxuICovXG5leHBvcnQgdHlwZSB7RXZlbnRQYXJ0fTtcbmNsYXNzIEV2ZW50UGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xuICBvdmVycmlkZSByZWFkb25seSB0eXBlID0gRVZFTlRfUEFSVDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3RyaW5nczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LFxuICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUsXG4gICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzLCBwYXJlbnQsIG9wdGlvbnMpO1xuXG4gICAgaWYgKERFVl9NT0RFICYmIHRoaXMuc3RyaW5ncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBBIFxcYDwke2VsZW1lbnQubG9jYWxOYW1lfT5cXGAgaGFzIGEgXFxgQCR7bmFtZX09Li4uXFxgIGxpc3RlbmVyIHdpdGggYCArXG4gICAgICAgICAgJ2ludmFsaWQgY29udGVudC4gRXZlbnQgbGlzdGVuZXJzIGluIHRlbXBsYXRlcyBtdXN0IGhhdmUgZXhhY3RseSAnICtcbiAgICAgICAgICAnb25lIGV4cHJlc3Npb24gYW5kIG5vIHN1cnJvdW5kaW5nIHRleHQuJ1xuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvLyBFdmVudFBhcnQgZG9lcyBub3QgdXNlIHRoZSBiYXNlIF8kc2V0VmFsdWUvX3Jlc29sdmVWYWx1ZSBpbXBsZW1lbnRhdGlvblxuICAvLyBzaW5jZSB0aGUgZGlydHkgY2hlY2tpbmcgaXMgbW9yZSBjb21wbGV4XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgXyRzZXRWYWx1ZShcbiAgICBuZXdMaXN0ZW5lcjogdW5rbm93bixcbiAgICBkaXJlY3RpdmVQYXJlbnQ6IERpcmVjdGl2ZVBhcmVudCA9IHRoaXNcbiAgKSB7XG4gICAgbmV3TGlzdGVuZXIgPVxuICAgICAgcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCBuZXdMaXN0ZW5lciwgZGlyZWN0aXZlUGFyZW50LCAwKSA/PyBub3RoaW5nO1xuICAgIGlmIChuZXdMaXN0ZW5lciA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgb2xkTGlzdGVuZXIgPSB0aGlzLl8kY29tbWl0dGVkVmFsdWU7XG5cbiAgICAvLyBJZiB0aGUgbmV3IHZhbHVlIGlzIG5vdGhpbmcgb3IgYW55IG9wdGlvbnMgY2hhbmdlIHdlIGhhdmUgdG8gcmVtb3ZlIHRoZVxuICAgIC8vIHBhcnQgYXMgYSBsaXN0ZW5lci5cbiAgICBjb25zdCBzaG91bGRSZW1vdmVMaXN0ZW5lciA9XG4gICAgICAobmV3TGlzdGVuZXIgPT09IG5vdGhpbmcgJiYgb2xkTGlzdGVuZXIgIT09IG5vdGhpbmcpIHx8XG4gICAgICAobmV3TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5jYXB0dXJlICE9PVxuICAgICAgICAob2xkTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5jYXB0dXJlIHx8XG4gICAgICAobmV3TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5vbmNlICE9PVxuICAgICAgICAob2xkTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5vbmNlIHx8XG4gICAgICAobmV3TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5wYXNzaXZlICE9PVxuICAgICAgICAob2xkTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5wYXNzaXZlO1xuXG4gICAgLy8gSWYgdGhlIG5ldyB2YWx1ZSBpcyBub3Qgbm90aGluZyBhbmQgd2UgcmVtb3ZlZCB0aGUgbGlzdGVuZXIsIHdlIGhhdmVcbiAgICAvLyB0byBhZGQgdGhlIHBhcnQgYXMgYSBsaXN0ZW5lci5cbiAgICBjb25zdCBzaG91bGRBZGRMaXN0ZW5lciA9XG4gICAgICBuZXdMaXN0ZW5lciAhPT0gbm90aGluZyAmJlxuICAgICAgKG9sZExpc3RlbmVyID09PSBub3RoaW5nIHx8IHNob3VsZFJlbW92ZUxpc3RlbmVyKTtcblxuICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICBraW5kOiAnY29tbWl0IGV2ZW50IGxpc3RlbmVyJyxcbiAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgIHZhbHVlOiBuZXdMaXN0ZW5lcixcbiAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICByZW1vdmVMaXN0ZW5lcjogc2hvdWxkUmVtb3ZlTGlzdGVuZXIsXG4gICAgICAgIGFkZExpc3RlbmVyOiBzaG91bGRBZGRMaXN0ZW5lcixcbiAgICAgICAgb2xkTGlzdGVuZXIsXG4gICAgICB9KTtcbiAgICBpZiAoc2hvdWxkUmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgIHRoaXMsXG4gICAgICAgIG9sZExpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9uc1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHNob3VsZEFkZExpc3RlbmVyKSB7XG4gICAgICAvLyBCZXdhcmU6IElFMTEgYW5kIENocm9tZSA0MSBkb24ndCBsaWtlIHVzaW5nIHRoZSBsaXN0ZW5lciBhcyB0aGVcbiAgICAgIC8vIG9wdGlvbnMgb2JqZWN0LiBGaWd1cmUgb3V0IGhvdyB0byBkZWFsIHcvIHRoaXMgaW4gSUUxMSAtIG1heWJlXG4gICAgICAvLyBwYXRjaCBhZGRFdmVudExpc3RlbmVyP1xuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgdGhpcyxcbiAgICAgICAgbmV3TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBuZXdMaXN0ZW5lcjtcbiAgfVxuXG4gIGhhbmRsZUV2ZW50KGV2ZW50OiBFdmVudCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUuY2FsbCh0aGlzLm9wdGlvbnM/Lmhvc3QgPz8gdGhpcy5lbGVtZW50LCBldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgRXZlbnRMaXN0ZW5lck9iamVjdCkuaGFuZGxlRXZlbnQoZXZlbnQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgdHlwZSB7RWxlbWVudFBhcnR9O1xuY2xhc3MgRWxlbWVudFBhcnQgaW1wbGVtZW50cyBEaXNjb25uZWN0YWJsZSB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFTEVNRU5UX1BBUlQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfX2RpcmVjdGl2ZT86IERpcmVjdGl2ZTtcblxuICAvLyBUaGlzIGlzIHRvIGVuc3VyZSB0aGF0IGV2ZXJ5IFBhcnQgaGFzIGEgXyRjb21taXR0ZWRWYWx1ZVxuICBfJGNvbW1pdHRlZFZhbHVlOiB1bmRlZmluZWQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHBhcmVudCE6IERpc2Nvbm5lY3RhYmxlO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPiA9IHVuZGVmaW5lZDtcblxuICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50LFxuICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUsXG4gICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICB0aGlzLl8kcGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxuICAvLyBTZWUgY29tbWVudCBpbiBEaXNjb25uZWN0YWJsZSBpbnRlcmZhY2UgZm9yIHdoeSB0aGlzIGlzIGEgZ2V0dGVyXG4gIGdldCBfJGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl8kcGFyZW50Ll8kaXNDb25uZWN0ZWQ7XG4gIH1cblxuICBfJHNldFZhbHVlKHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICdjb21taXQgdG8gZWxlbWVudCBiaW5kaW5nJyxcbiAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgfSk7XG4gICAgcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBFTkQgVVNFUlMgU0hPVUxEIE5PVCBSRUxZIE9OIFRISVMgT0JKRUNULlxuICpcbiAqIFByaXZhdGUgZXhwb3J0cyBmb3IgdXNlIGJ5IG90aGVyIExpdCBwYWNrYWdlcywgbm90IGludGVuZGVkIGZvciB1c2UgYnlcbiAqIGV4dGVybmFsIHVzZXJzLlxuICpcbiAqIFdlIGN1cnJlbnRseSBkbyBub3QgbWFrZSBhIG1hbmdsZWQgcm9sbHVwIGJ1aWxkIG9mIHRoZSBsaXQtc3NyIGNvZGUuIEluIG9yZGVyXG4gKiB0byBrZWVwIGEgbnVtYmVyIG9mIChvdGhlcndpc2UgcHJpdmF0ZSkgdG9wLWxldmVsIGV4cG9ydHMgbWFuZ2xlZCBpbiB0aGVcbiAqIGNsaWVudCBzaWRlIGNvZGUsIHdlIGV4cG9ydCBhIF8kTEggb2JqZWN0IGNvbnRhaW5pbmcgdGhvc2UgbWVtYmVycyAob3JcbiAqIGhlbHBlciBtZXRob2RzIGZvciBhY2Nlc3NpbmcgcHJpdmF0ZSBmaWVsZHMgb2YgdGhvc2UgbWVtYmVycyksIGFuZCB0aGVuXG4gKiByZS1leHBvcnQgdGhlbSBmb3IgdXNlIGluIGxpdC1zc3IuIFRoaXMga2VlcHMgbGl0LXNzciBhZ25vc3RpYyB0byB3aGV0aGVyIHRoZVxuICogY2xpZW50LXNpZGUgY29kZSBpcyBiZWluZyB1c2VkIGluIGBkZXZgIG1vZGUgb3IgYHByb2RgIG1vZGUuXG4gKlxuICogVGhpcyBoYXMgYSB1bmlxdWUgbmFtZSwgdG8gZGlzYW1iaWd1YXRlIGl0IGZyb20gcHJpdmF0ZSBleHBvcnRzIGluXG4gKiBsaXQtZWxlbWVudCwgd2hpY2ggcmUtZXhwb3J0cyBhbGwgb2YgbGl0LWh0bWwuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IF8kTEggPSB7XG4gIC8vIFVzZWQgaW4gbGl0LXNzclxuICBfYm91bmRBdHRyaWJ1dGVTdWZmaXg6IGJvdW5kQXR0cmlidXRlU3VmZml4LFxuICBfbWFya2VyOiBtYXJrZXIsXG4gIF9tYXJrZXJNYXRjaDogbWFya2VyTWF0Y2gsXG4gIF9IVE1MX1JFU1VMVDogSFRNTF9SRVNVTFQsXG4gIF9nZXRUZW1wbGF0ZUh0bWw6IGdldFRlbXBsYXRlSHRtbCxcbiAgLy8gVXNlZCBpbiB0ZXN0cyBhbmQgcHJpdmF0ZS1zc3Itc3VwcG9ydFxuICBfVGVtcGxhdGVJbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZSxcbiAgX2lzSXRlcmFibGU6IGlzSXRlcmFibGUsXG4gIF9yZXNvbHZlRGlyZWN0aXZlOiByZXNvbHZlRGlyZWN0aXZlLFxuICBfQ2hpbGRQYXJ0OiBDaGlsZFBhcnQsXG4gIF9BdHRyaWJ1dGVQYXJ0OiBBdHRyaWJ1dGVQYXJ0LFxuICBfQm9vbGVhbkF0dHJpYnV0ZVBhcnQ6IEJvb2xlYW5BdHRyaWJ1dGVQYXJ0LFxuICBfRXZlbnRQYXJ0OiBFdmVudFBhcnQsXG4gIF9Qcm9wZXJ0eVBhcnQ6IFByb3BlcnR5UGFydCxcbiAgX0VsZW1lbnRQYXJ0OiBFbGVtZW50UGFydCxcbn07XG5cbi8vIEFwcGx5IHBvbHlmaWxscyBpZiBhdmFpbGFibGVcbmNvbnN0IHBvbHlmaWxsU3VwcG9ydCA9IERFVl9NT0RFXG4gID8gZ2xvYmFsLmxpdEh0bWxQb2x5ZmlsbFN1cHBvcnREZXZNb2RlXG4gIDogZ2xvYmFsLmxpdEh0bWxQb2x5ZmlsbFN1cHBvcnQ7XG5wb2x5ZmlsbFN1cHBvcnQ/LihUZW1wbGF0ZSwgQ2hpbGRQYXJ0KTtcblxuLy8gSU1QT1JUQU5UOiBkbyBub3QgY2hhbmdlIHRoZSBwcm9wZXJ0eSBuYW1lIG9yIHRoZSBhc3NpZ25tZW50IGV4cHJlc3Npb24uXG4vLyBUaGlzIGxpbmUgd2lsbCBiZSB1c2VkIGluIHJlZ2V4ZXMgdG8gc2VhcmNoIGZvciBsaXQtaHRtbCB1c2FnZS5cbihnbG9iYWwubGl0SHRtbFZlcnNpb25zID8/PSBbXSkucHVzaCgnMy4yLjEnKTtcbmlmIChERVZfTU9ERSAmJiBnbG9iYWwubGl0SHRtbFZlcnNpb25zLmxlbmd0aCA+IDEpIHtcbiAgaXNzdWVXYXJuaW5nIShcbiAgICAnbXVsdGlwbGUtdmVyc2lvbnMnLFxuICAgIGBNdWx0aXBsZSB2ZXJzaW9ucyBvZiBMaXQgbG9hZGVkLiBgICtcbiAgICAgIGBMb2FkaW5nIG11bHRpcGxlIHZlcnNpb25zIGlzIG5vdCByZWNvbW1lbmRlZC5gXG4gICk7XG59XG5cbi8qKlxuICogUmVuZGVycyBhIHZhbHVlLCB1c3VhbGx5IGEgbGl0LWh0bWwgVGVtcGxhdGVSZXN1bHQsIHRvIHRoZSBjb250YWluZXIuXG4gKlxuICogVGhpcyBleGFtcGxlIHJlbmRlcnMgdGhlIHRleHQgXCJIZWxsbywgWm9lIVwiIGluc2lkZSBhIHBhcmFncmFwaCB0YWcsIGFwcGVuZGluZ1xuICogaXQgdG8gdGhlIGNvbnRhaW5lciBgZG9jdW1lbnQuYm9keWAuXG4gKlxuICogYGBganNcbiAqIGltcG9ydCB7aHRtbCwgcmVuZGVyfSBmcm9tICdsaXQnO1xuICpcbiAqIGNvbnN0IG5hbWUgPSBcIlpvZVwiO1xuICogcmVuZGVyKGh0bWxgPHA+SGVsbG8sICR7bmFtZX0hPC9wPmAsIGRvY3VtZW50LmJvZHkpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHZhbHVlIEFueSBbcmVuZGVyYWJsZVxuICogICB2YWx1ZV0oaHR0cHM6Ly9saXQuZGV2L2RvY3MvdGVtcGxhdGVzL2V4cHJlc3Npb25zLyNjaGlsZC1leHByZXNzaW9ucyksXG4gKiAgIHR5cGljYWxseSBhIHtAbGlua2NvZGUgVGVtcGxhdGVSZXN1bHR9IGNyZWF0ZWQgYnkgZXZhbHVhdGluZyBhIHRlbXBsYXRlIHRhZ1xuICogICBsaWtlIHtAbGlua2NvZGUgaHRtbH0gb3Ige0BsaW5rY29kZSBzdmd9LlxuICogQHBhcmFtIGNvbnRhaW5lciBBIERPTSBjb250YWluZXIgdG8gcmVuZGVyIHRvLiBUaGUgZmlyc3QgcmVuZGVyIHdpbGwgYXBwZW5kXG4gKiAgIHRoZSByZW5kZXJlZCB2YWx1ZSB0byB0aGUgY29udGFpbmVyLCBhbmQgc3Vic2VxdWVudCByZW5kZXJzIHdpbGxcbiAqICAgZWZmaWNpZW50bHkgdXBkYXRlIHRoZSByZW5kZXJlZCB2YWx1ZSBpZiB0aGUgc2FtZSByZXN1bHQgdHlwZSB3YXNcbiAqICAgcHJldmlvdXNseSByZW5kZXJlZCB0aGVyZS5cbiAqIEBwYXJhbSBvcHRpb25zIFNlZSB7QGxpbmtjb2RlIFJlbmRlck9wdGlvbnN9IGZvciBvcHRpb25zIGRvY3VtZW50YXRpb24uXG4gKiBAc2VlXG4gKiB7QGxpbmsgaHR0cHM6Ly9saXQuZGV2L2RvY3MvbGlicmFyaWVzL3N0YW5kYWxvbmUtdGVtcGxhdGVzLyNyZW5kZXJpbmctbGl0LWh0bWwtdGVtcGxhdGVzfCBSZW5kZXJpbmcgTGl0IEhUTUwgVGVtcGxhdGVzfVxuICovXG5leHBvcnQgY29uc3QgcmVuZGVyID0gKFxuICB2YWx1ZTogdW5rbm93bixcbiAgY29udGFpbmVyOiBIVE1MRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsXG4gIG9wdGlvbnM/OiBSZW5kZXJPcHRpb25zXG4pOiBSb290UGFydCA9PiB7XG4gIGlmIChERVZfTU9ERSAmJiBjb250YWluZXIgPT0gbnVsbCkge1xuICAgIC8vIEdpdmUgYSBjbGVhcmVyIGVycm9yIG1lc3NhZ2UgdGhhblxuICAgIC8vICAgICBVbmNhdWdodCBUeXBlRXJyb3I6IENhbm5vdCByZWFkIHByb3BlcnRpZXMgb2YgbnVsbCAocmVhZGluZ1xuICAgIC8vICAgICAnXyRsaXRQYXJ0JCcpXG4gICAgLy8gd2hpY2ggcmVhZHMgbGlrZSBhbiBpbnRlcm5hbCBMaXQgZXJyb3IuXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgVGhlIGNvbnRhaW5lciB0byByZW5kZXIgaW50byBtYXkgbm90IGJlICR7Y29udGFpbmVyfWApO1xuICB9XG4gIGNvbnN0IHJlbmRlcklkID0gREVWX01PREUgPyBkZWJ1Z0xvZ1JlbmRlcklkKysgOiAwO1xuICBjb25zdCBwYXJ0T3duZXJOb2RlID0gb3B0aW9ucz8ucmVuZGVyQmVmb3JlID8/IGNvbnRhaW5lcjtcbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgbGV0IHBhcnQ6IENoaWxkUGFydCA9IChwYXJ0T3duZXJOb2RlIGFzIGFueSlbJ18kbGl0UGFydCQnXTtcbiAgZGVidWdMb2dFdmVudCAmJlxuICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAga2luZDogJ2JlZ2luIHJlbmRlcicsXG4gICAgICBpZDogcmVuZGVySWQsXG4gICAgICB2YWx1ZSxcbiAgICAgIGNvbnRhaW5lcixcbiAgICAgIG9wdGlvbnMsXG4gICAgICBwYXJ0LFxuICAgIH0pO1xuICBpZiAocGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgZW5kTm9kZSA9IG9wdGlvbnM/LnJlbmRlckJlZm9yZSA/PyBudWxsO1xuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAocGFydE93bmVyTm9kZSBhcyBhbnkpWydfJGxpdFBhcnQkJ10gPSBwYXJ0ID0gbmV3IENoaWxkUGFydChcbiAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoY3JlYXRlTWFya2VyKCksIGVuZE5vZGUpLFxuICAgICAgZW5kTm9kZSxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIG9wdGlvbnMgPz8ge31cbiAgICApO1xuICB9XG4gIHBhcnQuXyRzZXRWYWx1ZSh2YWx1ZSk7XG4gIGRlYnVnTG9nRXZlbnQgJiZcbiAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgIGtpbmQ6ICdlbmQgcmVuZGVyJyxcbiAgICAgIGlkOiByZW5kZXJJZCxcbiAgICAgIHZhbHVlLFxuICAgICAgY29udGFpbmVyLFxuICAgICAgb3B0aW9ucyxcbiAgICAgIHBhcnQsXG4gICAgfSk7XG4gIHJldHVybiBwYXJ0IGFzIFJvb3RQYXJ0O1xufTtcblxuaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICByZW5kZXIuc2V0U2FuaXRpemVyID0gc2V0U2FuaXRpemVyO1xuICByZW5kZXIuY3JlYXRlU2FuaXRpemVyID0gY3JlYXRlU2FuaXRpemVyO1xuICBpZiAoREVWX01PREUpIHtcbiAgICByZW5kZXIuX3Rlc3RPbmx5Q2xlYXJTYW5pdGl6ZXJGYWN0b3J5RG9Ob3RDYWxsT3JFbHNlID1cbiAgICAgIF90ZXN0T25seUNsZWFyU2FuaXRpemVyRmFjdG9yeURvTm90Q2FsbE9yRWxzZTtcbiAgfVxufVxuIiwgIi8qKiBSZXN1bHQgYWxsb3dzIGVhc2llciBoYW5kbGluZyBvZiByZXR1cm5pbmcgZWl0aGVyIGFuIGVycm9yIG9yIGEgdmFsdWUgZnJvbSBhXG4gKiBmdW5jdGlvbi4gKi9cbmV4cG9ydCB0eXBlIFJlc3VsdDxUPiA9IHsgb2s6IHRydWU7IHZhbHVlOiBUIH0gfCB7IG9rOiBmYWxzZTsgZXJyb3I6IEVycm9yIH07XG5cbmV4cG9ydCBmdW5jdGlvbiBvazxUPih2YWx1ZTogVCk6IFJlc3VsdDxUPiB7XG4gIHJldHVybiB7IG9rOiB0cnVlLCB2YWx1ZTogdmFsdWUgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVycm9yPFQ+KHZhbHVlOiBzdHJpbmcgfCBFcnJvcik6IFJlc3VsdDxUPiB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBuZXcgRXJyb3IodmFsdWUpIH07XG4gIH1cbiAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogdmFsdWUgfTtcbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgT3AgfSBmcm9tIFwiLi4vb3BzL29wc1wiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHRcIjtcblxuZXhwb3J0IHR5cGUgUG9zdEFjdG9uV29yayA9IFwiXCIgfCBcInBhaW50Q2hhcnRcIiB8IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3Rvbldvcms7XG4gIC8vIFRPRE8gLSBEbyB3ZSBuZWVkIGEgUG9zdEFjdGlvbkZvY3VzOiBudW1iZXIgd2hpY2ggcG9pbnRzIHRvIHRoZSBUYXNrIHdlIHNob3VsZCBtb3ZlIHRoZSBmb2N1cyB0bz9cbiAgdW5kbzogYm9vbGVhbjsgLy8gSWYgdHJ1ZSBpbmNsdWRlIGluIHVuZG8vcmVkbyBhY3Rpb25zLlxuICBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj47XG59XG5cbmV4cG9ydCBjbGFzcyBOT09QQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiRG9lcyBub3RoaW5nXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgcmV0dXJuIG9rKG5ldyBOT09QQWN0aW9uKCkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25Gcm9tT3Age1xuICBuYW1lOiBzdHJpbmcgPSBcIkFjdGlvbkZyb21PcFwiO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJBY3Rpb24gY29uc3RydWN0ZWQgZGlyZWN0bHkgZnJvbSBhbiBPcC5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3Rvbldvcms7XG4gIHVuZG86IGJvb2xlYW47XG5cbiAgb3A6IE9wO1xuXG4gIGNvbnN0cnVjdG9yKG9wOiBPcCwgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmssIHVuZG86IGJvb2xlYW4pIHtcbiAgICB0aGlzLnBvc3RBY3Rpb25Xb3JrID0gcG9zdEFjdGlvbldvcms7XG4gICAgdGhpcy51bmRvID0gdW5kbztcbiAgICB0aGlzLm9wID0gb3A7XG4gIH1cblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGNvbnN0IHJldCA9IHRoaXMub3AuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuIiwgIi8qKiBPbmUgdmVydGV4IG9mIGEgZ3JhcGguICovXG5leHBvcnQgdHlwZSBWZXJ0ZXggPSBvYmplY3Q7XG5cbi8qKiBFdmVyeSBWZXJ0ZXggaW4gYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIFZlcnRpY2VzID0gVmVydGV4W107XG5cbi8qKiBBIHN1YnNldCBvZiBWZXJ0aWNlcyByZWZlcnJlZCB0byBieSB0aGVpciBpbmRleCBudW1iZXIuICovXG5leHBvcnQgdHlwZSBWZXJ0ZXhJbmRpY2VzID0gbnVtYmVyW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCB7XG4gIGk6IG51bWJlcjtcbiAgajogbnVtYmVyO1xufVxuXG4vKiogT25lIGVkZ2Ugb2YgYSBncmFwaCwgd2hpY2ggaXMgYSBkaXJlY3RlZCBjb25uZWN0aW9uIGZyb20gdGhlIGkndGggVmVydGV4IHRvXG50aGUgaid0aCBWZXJ0ZXgsIHdoZXJlIHRoZSBWZXJ0ZXggaXMgc3RvcmVkIGluIGEgVmVydGljZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXJlY3RlZEVkZ2Uge1xuICBpOiBudW1iZXIgPSAwO1xuICBqOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGk6IG51bWJlciA9IDAsIGo6IG51bWJlciA9IDApIHtcbiAgICB0aGlzLmkgPSBpO1xuICAgIHRoaXMuaiA9IGo7XG4gIH1cblxuICBlcXVhbChyaHM6IERpcmVjdGVkRWRnZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiByaHMuaSA9PT0gdGhpcy5pICYmIHJocy5qID09PSB0aGlzLmo7XG4gIH1cblxuICB0b0pTT04oKTogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGk6IHRoaXMuaSxcbiAgICAgIGo6IHRoaXMuaixcbiAgICB9O1xuICB9XG59XG5cbi8qKiBFdmVyeSBFZ2RlIGluIGEgZ3JhcGguICovXG5leHBvcnQgdHlwZSBFZGdlcyA9IERpcmVjdGVkRWRnZVtdO1xuXG4vKiogQSBncmFwaCBpcyBqdXN0IGEgY29sbGVjdGlvbiBvZiBWZXJ0aWNlcyBhbmQgRWRnZXMgYmV0d2VlbiB0aG9zZSB2ZXJ0aWNlcy4gKi9cbmV4cG9ydCB0eXBlIERpcmVjdGVkR3JhcGggPSB7XG4gIFZlcnRpY2VzOiBWZXJ0aWNlcztcbiAgRWRnZXM6IEVkZ2VzO1xufTtcblxuLyoqXG4gR3JvdXBzIHRoZSBFZGdlcyBieSB0aGVpciBgaWAgdmFsdWUuXG5cbiBAcGFyYW0gZWRnZXMgLSBBbGwgdGhlIEVnZXMgaW4gYSBEaXJlY3RlZEdyYXBoLlxuIEByZXR1cm5zIEEgbWFwIGZyb20gdGhlIFZlcnRleCBpbmRleCB0byBhbGwgdGhlIEVkZ2VzIHRoYXQgc3RhcnQgYXRcbiAgIGF0IHRoYXQgVmVydGV4IGluZGV4LlxuICovXG5leHBvcnQgY29uc3QgZWRnZXNCeVNyY1RvTWFwID0gKGVkZ2VzOiBFZGdlcyk6IE1hcDxudW1iZXIsIEVkZ2VzPiA9PiB7XG4gIGNvbnN0IHJldCA9IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKTtcblxuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBjb25zdCBhcnIgPSByZXQuZ2V0KGUuaSkgfHwgW107XG4gICAgYXJyLnB1c2goZSk7XG4gICAgcmV0LnNldChlLmksIGFycik7XG4gIH0pO1xuXG4gIHJldHVybiByZXQ7XG59O1xuXG4vKipcbiAgIEdyb3VwcyB0aGUgRWRnZXMgYnkgdGhlaXIgYGpgIHZhbHVlLlxuICBcbiAgIEBwYXJhbSBlZGdlcyAtIEFsbCB0aGUgRWRnZXMgaW4gYSBEaXJlY3RlZEdyYXBoLlxuICAgQHJldHVybnMgQSBtYXAgZnJvbSB0aGUgVmVydGV4IGluZGV4IHRvIGFsbCB0aGUgRWRnZXMgdGhhdCBlbmQgYXRcbiAgICAgYXQgdGhhdCBWZXJ0ZXggaW5kZXguXG4gICAqL1xuXG5leHBvcnQgY29uc3QgZWRnZXNCeURzdFRvTWFwID0gKGVkZ2VzOiBFZGdlcyk6IE1hcDxudW1iZXIsIEVkZ2VzPiA9PiB7XG4gIGNvbnN0IHJldCA9IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKTtcblxuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBjb25zdCBhcnIgPSByZXQuZ2V0KGUuaikgfHwgW107XG4gICAgYXJyLnB1c2goZSk7XG4gICAgcmV0LnNldChlLmosIGFycik7XG4gIH0pO1xuXG4gIHJldHVybiByZXQ7XG59O1xuXG5leHBvcnQgdHlwZSBTcmNBbmREc3RSZXR1cm4gPSB7XG4gIGJ5U3JjOiBNYXA8bnVtYmVyLCBFZGdlcz47XG4gIGJ5RHN0OiBNYXA8bnVtYmVyLCBFZGdlcz47XG59O1xuXG5leHBvcnQgY29uc3QgZWRnZXNCeVNyY0FuZERzdFRvTWFwID0gKGVkZ2VzOiBFZGdlcyk6IFNyY0FuZERzdFJldHVybiA9PiB7XG4gIGNvbnN0IHJldCA9IHtcbiAgICBieVNyYzogbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpLFxuICAgIGJ5RHN0OiBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCksXG4gIH07XG5cbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgbGV0IGFyciA9IHJldC5ieVNyYy5nZXQoZS5pKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuYnlTcmMuc2V0KGUuaSwgYXJyKTtcbiAgICBhcnIgPSByZXQuYnlEc3QuZ2V0KGUuaikgfHwgW107XG4gICAgYXJyLnB1c2goZSk7XG4gICAgcmV0LmJ5RHN0LnNldChlLmosIGFycik7XG4gIH0pO1xuXG4gIHJldHVybiByZXQ7XG59O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuXG4vLyBPcGVyYXRpb25zIG9uIFBsYW5zLiBOb3RlIHRoZXkgYXJlIHJldmVyc2libGUsIHNvIHdlIGNhbiBoYXZlIGFuICd1bmRvJyBsaXN0LlxuXG4vLyBBbHNvLCBzb21lIG9wZXJhdGlvbnMgbWlnaHQgaGF2ZSAncGFydGlhbHMnLCBpLmUuIHJldHVybiBhIGxpc3Qgb2YgdmFsaWRcbi8vIG9wdGlvbnMgdGhhdCBjYW4gYmUgcGFzc2VkIHRvIHRoZSBvcGVyYXRpb24uIEZvciBleGFtcGxlLCBhZGRpbmcgYVxuLy8gcHJlZGVjZXNzb3IgY291bGQgbGlzdCBhbGwgdGhlIFRhc2tzIHRoYXQgd291bGQgbm90IGZvcm0gYSBsb29wLCBpLmUuIGV4Y2x1ZGVcbi8vIGFsbCBkZXNjZW5kZW50cywgYW5kIHRoZSBUYXNrIGl0c2VsZiwgZnJvbSB0aGUgbGlzdCBvZiBvcHRpb25zLlxuLy9cbi8vICogQ2hhbmdlIHN0cmluZyB2YWx1ZSBpbiBhIFRhc2suXG4vLyAqIENoYW5nZSBkdXJhdGlvbiB2YWx1ZSBpbiBhIFRhc2suXG4vLyAqIEluc2VydCBuZXcgZW1wdHkgVGFzayBhZnRlciBJbmRleC5cbi8vICogU3BsaXQgYSBUYXNrLiAoUHJlZGVjZXNzb3IgdGFrZXMgYWxsIGluY29taW5nIGVkZ2VzLCBzb3VyY2UgdGFza3MgYWxsIG91dGdvaW5nIGVkZ2VzKS5cbi8vXG4vLyAqIER1cGxpY2F0ZSBhIFRhc2sgKGFsbCBlZGdlcyBhcmUgZHVwbGljYXRlZCBmcm9tIHRoZSBzb3VyY2UgVGFzaykuXG4vLyAqIERlbGV0ZSBwcmVkZWNlc3NvciB0byBhIFRhc2suXG4vLyAqIERlbGV0ZSBzdWNjZXNzb3IgdG8gYSBUYXNrLlxuLy8gKiBEZWxldGUgYSBUYXNrLlxuXG4vLyBOZWVkIFVuZG8vUmVkbyBTdGFja3MuXG4vLyBUaGVzZSByZWNvcmQgdGhlIHN1Yi1vcHMgZm9yIGVhY2ggbGFyZ2Ugb3AuIEUuZy4gYW4gaW5zZXJ0IHRhc2sgb3AgaXMgbWFkZVxuLy8gb2YgdGhyZWUgc3ViLW9wczpcbi8vICAgIDEuIGluc2VydCB0YXNrIGludG8gVmVydGljZXMgYW5kIHJlbnVtYmVyIEVkZ2VzXG4vLyAgICAyLiBBZGQgZWRnZSBmcm9tIFN0YXJ0IHRvIE5ldyBUYXNrXG4vLyAgICAzLiBBZGQgZWRnZSBmcm9tIE5ldyBUYXNrIHRvIEZpbmlzaFxuLy9cbi8vIEVhY2ggc3ViLW9wOlxuLy8gICAgMS4gUmVjb3JkcyBhbGwgdGhlIGluZm8gaXQgbmVlZHMgdG8gd29yay5cbi8vICAgIDIuIENhbiBiZSBcImFwcGxpZWRcIiB0byBhIFBsYW4uXG4vLyAgICAzLiBDYW4gZ2VuZXJhdGUgaXRzIGludmVyc2Ugc3ViLW9wLlxuXG4vLyBUaGUgcmVzdWx0cyBmcm9tIGFwcGx5aW5nIGEgU3ViT3AuIFRoaXMgaXMgdGhlIG9ubHkgd2F5IHRvIGdldCB0aGUgaW52ZXJzZSBvZlxuLy8gYSBTdWJPcCBzaW5jZSB0aGUgU3ViT3AgaW52ZXJzZSBtaWdodCBkZXBlbmQgb24gdGhlIHN0YXRlIG9mIHRoZSBQbGFuIGF0IHRoZVxuLy8gdGltZSB0aGUgU3ViT3Agd2FzIGFwcGxpZWQuXG5leHBvcnQgaW50ZXJmYWNlIFN1Yk9wUmVzdWx0IHtcbiAgcGxhbjogUGxhbjtcbiAgaW52ZXJzZTogU3ViT3A7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3ViT3Age1xuICAvLyBJZiB0aGUgYXBwbHkgcmV0dXJucyBhbiBlcnJvciBpdCBpcyBndWFyYW50ZWVkIG5vdCB0byBoYXZlIG1vZGlmaWVkIHRoZVxuICAvLyBQbGFuLlxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9wUmVzdWx0IHtcbiAgcGxhbjogUGxhbjtcbiAgaW52ZXJzZTogT3A7XG59XG5cbi8vIE9wIGFyZSBvcGVyYXRpb25zIGFyZSBhcHBsaWVkIHRvIG1ha2UgY2hhbmdlcyB0byBhIFBsYW4uXG5leHBvcnQgY2xhc3MgT3Age1xuICBzdWJPcHM6IFN1Yk9wW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihzdWJPcHM6IFN1Yk9wW10pIHtcbiAgICB0aGlzLnN1Yk9wcyA9IHN1Yk9wcztcbiAgfVxuXG4gIC8vIFJldmVydHMgYWxsIFN1Yk9wcyB1cCB0byB0aGUgZ2l2ZW4gaW5kZXguXG4gIGFwcGx5QWxsSW52ZXJzZVN1Yk9wc1RvUGxhbihcbiAgICBwbGFuOiBQbGFuLFxuICAgIGludmVyc2VTdWJPcHM6IFN1Yk9wW11cbiAgKTogUmVzdWx0PFBsYW4+IHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGludmVyc2VTdWJPcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGUgPSBpbnZlcnNlU3ViT3BzW2ldLmFwcGx5VG8ocGxhbik7XG4gICAgICBpZiAoIWUub2spIHtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgICBwbGFuID0gZS52YWx1ZS5wbGFuO1xuICAgIH1cblxuICAgIHJldHVybiBvayhwbGFuKTtcbiAgfVxuXG4gIC8vIEFwcGxpZXMgdGhlIE9wIHRvIGEgUGxhbi5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PE9wUmVzdWx0PiB7XG4gICAgY29uc3QgaW52ZXJzZVN1Yk9wczogU3ViT3BbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJPcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGUgPSB0aGlzLnN1Yk9wc1tpXS5hcHBseVRvKHBsYW4pO1xuICAgICAgaWYgKCFlLm9rKSB7XG4gICAgICAgIC8vIFJldmVydCBhbGwgdGhlIFN1Yk9wcyBhcHBsaWVkIHVwIHRvIHRoaXMgcG9pbnQgdG8gZ2V0IHRoZSBQbGFuIGJhY2sgaW4gYVxuICAgICAgICAvLyBnb29kIHBsYWNlLlxuICAgICAgICBjb25zdCByZXZlcnRFcnIgPSB0aGlzLmFwcGx5QWxsSW52ZXJzZVN1Yk9wc1RvUGxhbihwbGFuLCBpbnZlcnNlU3ViT3BzKTtcbiAgICAgICAgaWYgKCFyZXZlcnRFcnIub2spIHtcbiAgICAgICAgICByZXR1cm4gcmV2ZXJ0RXJyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgICAgcGxhbiA9IGUudmFsdWUucGxhbjtcbiAgICAgIGludmVyc2VTdWJPcHMudW5zaGlmdChlLnZhbHVlLmludmVyc2UpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogbmV3IE9wKGludmVyc2VTdWJPcHMpLFxuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIEFsbE9wc1Jlc3VsdCA9IHtcbiAgb3BzOiBPcFtdO1xuICBwbGFuOiBQbGFuO1xufTtcblxuY29uc3QgYXBwbHlBbGxJbnZlcnNlT3BzVG9QbGFuID0gKGludmVyc2VzOiBPcFtdLCBwbGFuOiBQbGFuKTogUmVzdWx0PFBsYW4+ID0+IHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnZlcnNlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJlcyA9IGludmVyc2VzW2ldLmFwcGx5VG8ocGxhbik7XG4gICAgaWYgKCFyZXMub2spIHtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIHBsYW4gPSByZXMudmFsdWUucGxhbjtcbiAgfVxuXG4gIHJldHVybiBvayhwbGFuKTtcbn07XG5cbi8vIENvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciBhcHBseWluZyBtdWx0aXBsZSBPcHMgdG8gYSBwbGFuLCB1c2VkIG1vc3RseSBmb3Jcbi8vIHRlc3RpbmcuXG5leHBvcnQgY29uc3QgYXBwbHlBbGxPcHNUb1BsYW4gPSAoXG4gIG9wczogT3BbXSxcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PEFsbE9wc1Jlc3VsdD4gPT4ge1xuICBjb25zdCBpbnZlcnNlczogT3BbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG9wcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJlcyA9IG9wc1tpXS5hcHBseVRvKHBsYW4pO1xuICAgIGlmICghcmVzLm9rKSB7XG4gICAgICBjb25zdCBpbnZlcnNlUmVzID0gYXBwbHlBbGxJbnZlcnNlT3BzVG9QbGFuKGludmVyc2VzLCBwbGFuKTtcbiAgICAgIGlmICghaW52ZXJzZVJlcy5vaykge1xuICAgICAgICAvLyBUT0RPIENhbiB3ZSB3cmFwIHRoZSBFcnJvciBpbiBhbm90aGVyIGVycm9yIHRvIG1ha2UgaXQgY2xlYXIgdGhpc1xuICAgICAgICAvLyBlcnJvciBoYXBwZW5lZCB3aGVuIHRyeWluZyB0byBjbGVhbiB1cCBmcm9tIHRoZSBwcmV2aW91cyBFcnJvciB3aGVuXG4gICAgICAgIC8vIHRoZSBhcHBseSgpIGZhaWxlZC5cbiAgICAgICAgcmV0dXJuIGludmVyc2VSZXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBpbnZlcnNlcy51bnNoaWZ0KHJlcy52YWx1ZS5pbnZlcnNlKTtcbiAgICBwbGFuID0gcmVzLnZhbHVlLnBsYW47XG4gIH1cblxuICByZXR1cm4gb2soe1xuICAgIG9wczogaW52ZXJzZXMsXG4gICAgcGxhbjogcGxhbixcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgYXBwbHlBbGxPcHNUb1BsYW5BbmRUaGVuSW52ZXJzZSA9IChcbiAgb3BzOiBPcFtdLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8QWxsT3BzUmVzdWx0PiA9PiB7XG4gIGNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKG9wcywgcGxhbik7XG4gIGlmICghcmVzLm9rKSB7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICByZXR1cm4gYXBwbHlBbGxPcHNUb1BsYW4ocmVzLnZhbHVlLm9wcywgcmVzLnZhbHVlLnBsYW4pO1xufTtcbi8vIE5vT3AgaXMgYSBuby1vcC5cbmV4cG9ydCBmdW5jdGlvbiBOb09wKCk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXSk7XG59XG4iLCAiLy8gQ2hhbmdlTWV0cmljVmFsdWVcblxuaW1wb3J0IHsgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgTWV0cmljRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIGVycm9yLCBvayB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IE9wLCBTdWJPcCwgU3ViT3BSZXN1bHQgfSBmcm9tIFwiLi9vcHMudHNcIjtcblxuZXhwb3J0IGNsYXNzIEFkZE1ldHJpY1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb247XG5cbiAgLy8gTWFwcyBhbiBpbmRleCBvZiBhIFRhc2sgdG8gYSB2YWx1ZSBmb3IgdGhlIGdpdmVuIG1ldHJpYyBrZXkuXG4gIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24sXG4gICAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKSAvLyBTaG91bGQgb25seSBiZSBzdXBwbGllZCBieSBpbnZlcnNlIGFjdGlvbnMuXG4gICkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uID0gbWV0cmljRGVmaW5pdGlvbjtcbiAgICB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMgPSB0YXNrTWV0cmljVmFsdWVzO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5hbWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgTWV0cmljYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSwgdGhpcy5tZXRyaWNEZWZpbml0aW9uKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgYWRkIHRoaXMgbWV0cmljIGFuZCBzZXQgaXQgdG8gdGhlIGRlZmF1bHQsXG4gICAgLy8gdW5sZXNzIHRoZXJlIGlzIG1hdGNoaW5nIGVudHJ5IGluIHRhc2tNZXRyaWNWYWx1ZXMsIGluIHdoaWNoIGNhc2Ugd2Ugd2lsbFxuICAgIC8vIHVzZSB0aGF0IHZhbHVlLCBpLmUuIHRoaXMgQWRkTWV0cmljU3ViT3AgaXMgYWN0dWFsbHkgYSByZXZlcnQgb2YgYVxuICAgIC8vIERlbGV0ZU1ldHJpY1N1Yk9wLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgdGFzay5zZXRNZXRyaWMoXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgdGhpcy50YXNrTWV0cmljVmFsdWVzLmdldChpbmRleCkgfHwgdGhpcy5tZXRyaWNEZWZpbml0aW9uLmRlZmF1bHRcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlTWV0cmljU3ViT3AodGhpcy5uYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgbWV0cmljRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuXG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgVGhlIG1ldHJpYyB3aXRoIG5hbWUgJHt0aGlzLm5hbWV9IGRvZXMgbm90IGV4aXN0IGFuZCBjYW4ndCBiZSBkZWxldGVkLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBlcnJvcihgVGhlIHN0YXRpYyBNZXRyaWMgJHt0aGlzLm5hbWV9IGNhbid0IGJlIGRlbGV0ZWQuYCk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGZyb20gcmVzb3VyY2UgZGVmaW5pdGlvbnMuXG4gICAgcGxhbi5kZWxldGVNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG5cbiAgICBjb25zdCB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZTogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgcmVtb3ZlIGB0aGlzLm5hbWVgIGZyb20gdGhlIG1ldHJpYyB3aGlsZSBhbHNvXG4gICAgLy8gYnVpbGRpbmcgdXAgdGhlIGluZm8gbmVlZGVkIGZvciBhIHJldmVydC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKTtcbiAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhc2tJbmRleFRvRGVsZXRlZE1ldHJpY1ZhbHVlLnNldChpbmRleCwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgdGFzay5kZWxldGVNZXRyaWModGhpcy5uYW1lKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG1ldHJpY0RlZmluaXRpb24sIHRhc2tJbmRleFRvRGVsZXRlZE1ldHJpY1ZhbHVlKSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW52ZXJzZShcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIG1ldHJpY1ZhbHVlc0ZvckRlbGV0ZWRSZXNvdXJjZU5hbWU6IE1hcDxudW1iZXIsIG51bWJlcj5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkTWV0cmljU3ViT3AoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICBtZXRyaWNEZWZpbml0aW9uLFxuICAgICAgbWV0cmljVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlTmFtZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmFtZU1ldHJpY1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBvbGROYW1lOiBzdHJpbmc7XG4gIG5ld05hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihvbGROYW1lOiBzdHJpbmcsIG5ld05hbWU6IHN0cmluZykge1xuICAgIHRoaXMub2xkTmFtZSA9IG9sZE5hbWU7XG4gICAgdGhpcy5uZXdOYW1lID0gbmV3TmFtZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmIChwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uZXdOYW1lKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uZXdOYW1lfSBhbHJlYWR5IGV4aXN0cyBhcyBhIG1ldHJpYy5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXRyaWNEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMub2xkTmFtZSk7XG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMub2xkTmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG4gICAgaWYgKG1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBlcnJvcihgU3RhdGljIG1ldHJpYyAke3RoaXMub2xkTmFtZX0gY2FuJ3QgYmUgcmVuYW1lZC5gKTtcbiAgICB9XG5cbiAgICBwbGFuLnNldE1ldHJpY0RlZmluaXRpb24odGhpcy5uZXdOYW1lLCBtZXRyaWNEZWZpbml0aW9uKTtcbiAgICBwbGFuLmRlbGV0ZU1ldHJpY0RlZmluaXRpb24odGhpcy5vbGROYW1lKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgcmVuYW1lIHRoaXMgbWV0cmljLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm9sZE5hbWUpIHx8IG1ldHJpY0RlZmluaXRpb24uZGVmYXVsdDtcbiAgICAgIHRhc2suc2V0TWV0cmljKHRoaXMubmV3TmFtZSwgdmFsdWUpO1xuICAgICAgdGFzay5kZWxldGVNZXRyaWModGhpcy5vbGROYW1lKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW5hbWVNZXRyaWNTdWJPcCh0aGlzLm5ld05hbWUsIHRoaXMub2xkTmFtZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVwZGF0ZU1ldHJpY1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb247XG5cbiAgLy8gTWFwcyBhbiBpbmRleCBvZiBhIFRhc2sgdG8gYSB2YWx1ZSBmb3IgdGhlIGdpdmVuIG1ldHJpYyBrZXkuXG4gIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24sXG4gICAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKSAvLyBTaG91bGQgb25seSBiZSBzdXBwbGllZCBieSBpbnZlcnNlIGFjdGlvbnMuXG4gICkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uID0gbWV0cmljRGVmaW5pdGlvbjtcbiAgICB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMgPSB0YXNrTWV0cmljVmFsdWVzO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3Qgb2xkTWV0cmljRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuICAgIGlmIChvbGRNZXRyaWNEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5hbWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgTWV0cmljYCk7XG4gICAgfVxuICAgIGlmIChvbGRNZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFN0YXRpYyBtZXRyaWMgJHt0aGlzLm5hbWV9IGNhbid0IGJlIHVwZGF0ZWQuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSwgdGhpcy5tZXRyaWNEZWZpbml0aW9uKTtcblxuICAgIGNvbnN0IHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCB1cGRhdGUgdGhlIG1ldHJpYyB2YWx1ZXMgdG8gcmVmbGVjdCB0aGUgbmV3XG4gICAgLy8gbWV0cmljIGRlZmluaXRpb24sIHVubGVzcyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrTWV0cmljVmFsdWVzLCBpblxuICAgIC8vIHdoaWNoIGNhc2Ugd2Ugd2lsbCB1c2UgdGhhdCB2YWx1ZSwgaS5lLiB0aGlzIFVwZGF0ZU1ldHJpY1N1Yk9wIGlzXG4gICAgLy8gYWN0dWFsbHkgYSByZXZlcnQgb2YgYW5vdGhlciBVcGRhdGVNZXRyaWNTdWJPcC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKSE7XG5cbiAgICAgIGxldCBuZXdWYWx1ZTogbnVtYmVyO1xuICAgICAgaWYgKHRoaXMudGFza01ldHJpY1ZhbHVlcy5oYXMoaW5kZXgpKSB7XG4gICAgICAgIC8vIHRhc2tNZXRyaWNWYWx1ZXMgaGFzIGEgdmFsdWUgdGhlbiB1c2UgdGhhdCwgYXMgdGhpcyBpcyBhbiBpbnZlcnNlXG4gICAgICAgIC8vIG9wZXJhdGlvbi5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuZ2V0KGluZGV4KSE7XG4gICAgICB9IGVsc2UgaWYgKG9sZFZhbHVlID09PSBvbGRNZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQpIHtcbiAgICAgICAgLy8gSWYgdGhlIG9sZFZhbHVlIGlzIHRoZSBkZWZhdWx0LCBjaGFuZ2UgaXQgdG8gdGhlIG5ldyBkZWZhdWx0LlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgICAgICB0YXNrTWV0cmljVmFsdWVzLnNldChpbmRleCwgb2xkVmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ2xhbXAuXG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLnJhbmdlLmNsYW1wKG9sZFZhbHVlKTtcbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24ucHJlY2lzaW9uLnJvdW5kKG5ld1ZhbHVlKTtcbiAgICAgICAgdGFza01ldHJpY1ZhbHVlcy5zZXQoaW5kZXgsIG9sZFZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRhc2suc2V0TWV0cmljKHRoaXMubmFtZSwgbmV3VmFsdWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkTWV0cmljRGVmaW5pdGlvbiwgdGFza01ldHJpY1ZhbHVlcyksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKFxuICAgIG9sZE1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24sXG4gICAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPlxuICApOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBVcGRhdGVNZXRyaWNTdWJPcChcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIG9sZE1ldHJpY0RlZmluaXRpb24sXG4gICAgICB0YXNrTWV0cmljVmFsdWVzXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0TWV0cmljVmFsdWVTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogbnVtYmVyO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHZhbHVlOiBudW1iZXIsIHRhc2tJbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBtZXRyaWNzRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuICAgIGlmIChtZXRyaWNzRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cblxuICAgIGNvbnN0IHRhc2sgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XTtcbiAgICBjb25zdCBvbGRWYWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMubmFtZSkgfHwgbWV0cmljc0RlZmluaXRpb24uZGVmYXVsdDtcbiAgICB0YXNrLnNldE1ldHJpYyhcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIG1ldHJpY3NEZWZpbml0aW9uLnByZWNpc2lvbi5yb3VuZChcbiAgICAgICAgbWV0cmljc0RlZmluaXRpb24ucmFuZ2UuY2xhbXAodGhpcy52YWx1ZSlcbiAgICAgIClcbiAgICApO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZFZhbHVlKSB9KTtcbiAgfVxuXG4gIGludmVyc2UodmFsdWU6IG51bWJlcik6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AodGhpcy5uYW1lLCB2YWx1ZSwgdGhpcy50YXNrSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRNZXRyaWNPcChcbiAgbmFtZTogc3RyaW5nLFxuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRNZXRyaWNTdWJPcChuYW1lLCBtZXRyaWNEZWZpbml0aW9uKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlTWV0cmljT3AobmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgRGVsZXRlTWV0cmljU3ViT3AobmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmFtZU1ldHJpY09wKG9sZE5hbWU6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmVuYW1lTWV0cmljU3ViT3Aob2xkTmFtZSwgbmV3TmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFVwZGF0ZU1ldHJpY09wKFxuICBuYW1lOiBzdHJpbmcsXG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb25cbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFVwZGF0ZU1ldHJpY1N1Yk9wKG5hbWUsIG1ldHJpY0RlZmluaXRpb24pXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRNZXRyaWNWYWx1ZU9wKFxuICBuYW1lOiBzdHJpbmcsXG4gIHZhbHVlOiBudW1iZXIsXG4gIHRhc2tJbmRleDogbnVtYmVyXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRNZXRyaWNWYWx1ZVN1Yk9wKG5hbWUsIHZhbHVlLCB0YXNrSW5kZXgpXSk7XG59XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgQ2hhcnQsIFRhc2ssIFRhc2tTdGF0ZSB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuaW1wb3J0IHsgU2V0TWV0cmljVmFsdWVPcCwgU2V0TWV0cmljVmFsdWVTdWJPcCB9IGZyb20gXCIuL21ldHJpY3MudHNcIjtcblxuLyoqIEEgdmFsdWUgb2YgLTEgZm9yIGogbWVhbnMgdGhlIEZpbmlzaCBNaWxlc3RvbmUuICovXG5leHBvcnQgZnVuY3Rpb24gRGlyZWN0ZWRFZGdlRm9yUGxhbihcbiAgaTogbnVtYmVyLFxuICBqOiBudW1iZXIsXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxEaXJlY3RlZEVkZ2U+IHtcbiAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICBpZiAoaiA9PT0gLTEpIHtcbiAgICBqID0gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgfVxuICBpZiAoaSA8IDAgfHwgaSA+PSBjaGFydC5WZXJ0aWNlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgaSBpbmRleCBvdXQgb2YgcmFuZ2U6ICR7aX0gbm90IGluIFswLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDF9XWBcbiAgICApO1xuICB9XG4gIGlmIChqIDwgMCB8fCBqID49IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBqIGluZGV4IG91dCBvZiByYW5nZTogJHtqfSBub3QgaW4gWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMX1dYFxuICAgICk7XG4gIH1cbiAgaWYgKGkgPT09IGopIHtcbiAgICByZXR1cm4gZXJyb3IoYEEgVGFzayBjYW4gbm90IGRlcGVuZCBvbiBpdHNlbGY6ICR7aX0gPT09ICR7an1gKTtcbiAgfVxuICByZXR1cm4gb2sobmV3IERpcmVjdGVkRWRnZShpLCBqKSk7XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRFZGdlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyLCBqOiBudW1iZXIpIHtcbiAgICB0aGlzLmkgPSBpO1xuICAgIHRoaXMuaiA9IGo7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5pID09PSAtMSkge1xuICAgICAgdGhpcy5pID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5qID09PSAtMSkge1xuICAgICAgdGhpcy5qID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIGNvbnN0IGUgPSBEaXJlY3RlZEVkZ2VGb3JQbGFuKHRoaXMuaSwgdGhpcy5qLCBwbGFuKTtcbiAgICBpZiAoIWUub2spIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIC8vIE9ubHkgYWRkIHRoZSBlZGdlIGlmIGl0IGRvZXNuJ3QgZXhpc3RzIGFscmVhZHkuXG4gICAgaWYgKCFwbGFuLmNoYXJ0LkVkZ2VzLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmVxdWFsKGUudmFsdWUpKSkge1xuICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKGUudmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbW92ZUVkZ2VTdXBPcCh0aGlzLmksIHRoaXMuaik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW92ZUVkZ2VTdXBPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmICh0aGlzLmkgPT09IC0xKSB7XG4gICAgICB0aGlzLmkgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuICAgIGlmICh0aGlzLmogPT09IC0xKSB7XG4gICAgICB0aGlzLmogPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuXG4gICAgY29uc3QgZSA9IERpcmVjdGVkRWRnZUZvclBsYW4odGhpcy5pLCB0aGlzLmosIHBsYW4pO1xuICAgIGlmICghZS5vaykge1xuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgICh2OiBEaXJlY3RlZEVkZ2UpOiBib29sZWFuID0+ICF2LmVxdWFsKGUudmFsdWUpXG4gICAgKTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZEVkZ2VTdWJPcCh0aGlzLmksIHRoaXMuaik7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5kZXhJblJhbmdlRm9yVmVydGljZXMoaW5kZXg6IG51bWJlciwgY2hhcnQ6IENoYXJ0KTogUmVzdWx0PG51bGw+IHtcbiAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDIpIHtcbiAgICByZXR1cm4gZXJyb3IoYCR7aW5kZXh9IGlzIG5vdCBpbiByYW5nZSBbMCwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyfV1gKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59XG5cbmZ1bmN0aW9uIGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKFxuICBpbmRleDogbnVtYmVyLFxuICBjaGFydDogQ2hhcnRcbik6IFJlc3VsdDxudWxsPiB7XG4gIGlmIChpbmRleCA8IDEgfHwgaW5kZXggPiBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyKSB7XG4gICAgcmV0dXJuIGVycm9yKGAke2luZGV4fSBpcyBub3QgaW4gcmFuZ2UgWzEsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMn1dYCk7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufVxuXG5leHBvcnQgY2xhc3MgQWRkVGFza0FmdGVyU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuICBmdWxsVGFza1RvQmVSZXN0b3JlZDogRnVsbFRhc2tUb0JlUmVzdG9yZWQgfCBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGluZGV4OiBudW1iZXIsXG4gICAgZnVsbFRhc2tUb0JlUmVzdG9yZWQ6IEZ1bGxUYXNrVG9CZVJlc3RvcmVkIHwgbnVsbCA9IG51bGxcbiAgKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQgPSBmdWxsVGFza1RvQmVSZXN0b3JlZDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGxldCB0YXNrID0gcGxhbi5uZXdUYXNrKCk7XG4gICAgaWYgKHRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQgIT09IG51bGwpIHtcbiAgICAgIHRhc2sgPSB0aGlzLmZ1bGxUYXNrVG9CZVJlc3RvcmVkLnRhc2s7XG4gICAgfVxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXggKyAxLCAwLCB0YXNrKTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID49IHRoaXMuaW5kZXggKyAxKSB7XG4gICAgICAgIGVkZ2UuaSsrO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA+PSB0aGlzLmluZGV4ICsgMSkge1xuICAgICAgICBlZGdlLmorKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5mdWxsVGFza1RvQmVSZXN0b3JlZCAhPT0gbnVsbCkge1xuICAgICAgY2hhcnQuRWRnZXMucHVzaCguLi50aGlzLmZ1bGxUYXNrVG9CZVJlc3RvcmVkLmVkZ2VzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlVGFza1N1Yk9wKHRoaXMuaW5kZXggKyAxKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRHVwVGFza1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjb25zdCBjb3B5ID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLmluZGV4XS5kdXAoKTtcbiAgICAvLyBJbnNlcnQgdGhlIGR1cGxpY2F0ZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgVGFzayBpdCBpcyBjb3BpZWQgZnJvbS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAwLCBjb3B5KTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmkrKztcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaisrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlVGFza1N1Yk9wKHRoaXMuaW5kZXggKyAxKTtcbiAgfVxufVxuXG50eXBlIFN1YnN0aXR1dGlvbiA9IE1hcDxEaXJlY3RlZEVkZ2UsIERpcmVjdGVkRWRnZT47XG5cbmV4cG9ydCBjbGFzcyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBmcm9tVGFza0luZGV4OiBudW1iZXIgPSAwO1xuICB0b1Rhc2tJbmRleDogbnVtYmVyID0gMDtcbiAgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBmcm9tVGFza0luZGV4OiBudW1iZXIsXG4gICAgdG9UYXNrSW5kZXg6IG51bWJlcixcbiAgICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uID0gbmV3IE1hcCgpXG4gICkge1xuICAgIHRoaXMuZnJvbVRhc2tJbmRleCA9IGZyb21UYXNrSW5kZXg7XG4gICAgdGhpcy50b1Rhc2tJbmRleCA9IHRvVGFza0luZGV4O1xuICAgIHRoaXMuYWN0dWFsTW92ZXMgPSBhY3R1YWxNb3ZlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBsZXQgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUodGhpcy5mcm9tVGFza0luZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMudG9UYXNrSW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hY3R1YWxNb3Zlcy52YWx1ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zdCBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uID0gbmV3IE1hcCgpO1xuICAgICAgLy8gVXBkYXRlIGFsbCBFZGdlcyB0aGF0IHN0YXJ0IGF0ICdmcm9tVGFza0luZGV4JyBhbmQgY2hhbmdlIHRoZSBzdGFydCB0byAndG9UYXNrSW5kZXgnLlxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICAgIC8vIFNraXAgdGhlIGNvcm5lciBjYXNlIHRoZXJlIGZyb21UYXNrSW5kZXggcG9pbnRzIHRvIFRhc2tJbmRleC5cbiAgICAgICAgaWYgKGVkZ2UuaSA9PT0gdGhpcy5mcm9tVGFza0luZGV4ICYmIGVkZ2UuaiA9PT0gdGhpcy50b1Rhc2tJbmRleCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVkZ2UuaSA9PT0gdGhpcy5mcm9tVGFza0luZGV4KSB7XG4gICAgICAgICAgYWN0dWFsTW92ZXMuc2V0KFxuICAgICAgICAgICAgbmV3IERpcmVjdGVkRWRnZSh0aGlzLnRvVGFza0luZGV4LCBlZGdlLmopLFxuICAgICAgICAgICAgbmV3IERpcmVjdGVkRWRnZShlZGdlLmksIGVkZ2UuailcbiAgICAgICAgICApO1xuICAgICAgICAgIGVkZ2UuaSA9IHRoaXMudG9UYXNrSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvayh7XG4gICAgICAgIHBsYW46IHBsYW4sXG4gICAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShcbiAgICAgICAgICB0aGlzLnRvVGFza0luZGV4LFxuICAgICAgICAgIHRoaXMuZnJvbVRhc2tJbmRleCxcbiAgICAgICAgICBhY3R1YWxNb3Zlc1xuICAgICAgICApLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbmV3RWRnZSA9IHRoaXMuYWN0dWFsTW92ZXMuZ2V0KHBsYW4uY2hhcnQuRWRnZXNbaV0pO1xuICAgICAgICBpZiAobmV3RWRnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcGxhbi5jaGFydC5FZGdlc1tpXSA9IG5ld0VkZ2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9rKHtcbiAgICAgICAgcGxhbjogcGxhbixcbiAgICAgICAgaW52ZXJzZTogbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AoXG4gICAgICAgICAgdGhpcy50b1Rhc2tJbmRleCxcbiAgICAgICAgICB0aGlzLmZyb21UYXNrSW5kZXhcbiAgICAgICAgKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGludmVyc2UoXG4gICAgdG9UYXNrSW5kZXg6IG51bWJlcixcbiAgICBmcm9tVGFza0luZGV4OiBudW1iZXIsXG4gICAgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvblxuICApOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wKFxuICAgICAgdG9UYXNrSW5kZXgsXG4gICAgICBmcm9tVGFza0luZGV4LFxuICAgICAgYWN0dWFsTW92ZXNcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb3B5QWxsRWRnZXNGcm9tVG9TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZnJvbUluZGV4OiBudW1iZXIgPSAwO1xuICB0b0luZGV4OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGZyb21JbmRleDogbnVtYmVyLCB0b0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmZyb21JbmRleCA9IGZyb21JbmRleDtcbiAgICB0aGlzLnRvSW5kZXggPSB0b0luZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy5mcm9tSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGNvbnN0IG5ld0VkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIHBsYW4uY2hhcnQuRWRnZXMuZm9yRWFjaCgoZWRnZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21JbmRleCkge1xuICAgICAgICBuZXdFZGdlcy5wdXNoKG5ldyBEaXJlY3RlZEVkZ2UodGhpcy50b0luZGV4LCBlZGdlLmopKTtcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPT09IHRoaXMuZnJvbUluZGV4KSB7XG4gICAgICAgIG5ld0VkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZShlZGdlLmksIHRoaXMudG9JbmRleCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCguLi5uZXdFZGdlcyk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgUmVtb3ZlQWxsRWRnZXNTdWJPcChuZXdFZGdlcykgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW92ZUFsbEVkZ2VzU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXTtcblxuICBjb25zdHJ1Y3RvcihlZGdlczogRGlyZWN0ZWRFZGdlW10pIHtcbiAgICB0aGlzLmVkZ2VzID0gZWRnZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAoZWRnZTogRGlyZWN0ZWRFZGdlKSA9PlxuICAgICAgICAtMSA9PT1cbiAgICAgICAgdGhpcy5lZGdlcy5maW5kSW5kZXgoKHRvQmVSZW1vdmVkOiBEaXJlY3RlZEVkZ2UpID0+XG4gICAgICAgICAgZWRnZS5lcXVhbCh0b0JlUmVtb3ZlZClcbiAgICAgICAgKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgQWRkQWxsRWRnZXNTdWJPcCh0aGlzLmVkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCguLi50aGlzLmVkZ2VzKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBSZW1vdmVBbGxFZGdlc1N1Yk9wKHRoaXMuZWRnZXMpIH0pO1xuICB9XG59XG5cbmludGVyZmFjZSBGdWxsVGFza1RvQmVSZXN0b3JlZCB7XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXTtcbiAgdGFzazogVGFzaztcbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVRhc2tTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgZWRnZXNUb0JlUmVzdG9yZWQgPSBjaGFydC5FZGdlcy5maWx0ZXIoKGRlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChkZS5pID09PSB0aGlzLmluZGV4IHx8IGRlLmogPT09IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICAvLyBGaXJzdCByZW1vdmUgYWxsIGVkZ2VzIHRvIGFuZCBmcm9tIHRoZSB0YXNrLlxuICAgIGNoYXJ0LkVkZ2VzID0gY2hhcnQuRWRnZXMuZmlsdGVyKChkZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoZGUuaSA9PT0gdGhpcy5pbmRleCB8fCBkZS5qID09PSB0aGlzLmluZGV4KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIGVkZ2VzIGZvciB0YXNrcyB0aGF0IHdpbGwgZW5kIHVwIGF0IGEgbmV3IGluZGV4LlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgIGlmIChlZGdlLmkgPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaS0tO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5qLS07XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdGFza1RvQmVSZXN0b3JlZCA9IGNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAxKTtcbiAgICBjb25zdCBmdWxsVGFza1RvQmVSZXN0b3JlZCA9IHtcbiAgICAgIGVkZ2VzOiBlZGdlc1RvQmVSZXN0b3JlZCxcbiAgICAgIHRhc2s6IHRhc2tUb0JlUmVzdG9yZWRbMF0sXG4gICAgfTtcbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoZnVsbFRhc2tUb0JlUmVzdG9yZWQpIH0pO1xuICB9XG5cbiAgaW52ZXJzZShmdWxsVGFza1RvQmVSZXN0b3JlZDogRnVsbFRhc2tUb0JlUmVzdG9yZWQpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRUYXNrQWZ0ZXJTdWJPcCh0aGlzLmluZGV4IC0gMSwgZnVsbFRhc2tUb0JlUmVzdG9yZWQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBzcmNBbmREc3QgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAocGxhbi5jaGFydC5FZGdlcyk7XG4gICAgY29uc3QgU3RhcnQgPSAwO1xuICAgIGNvbnN0IEZpbmlzaCA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcblxuICAgIC8vIGxvb3Agb3ZlciBhbGwgdmVydGljcyBmcm9tIFtTdGFydCwgRmluaXNoKSBhbmQgbG9vayBmb3IgdGhlaXJcbiAgICAvLyBkZXN0aW5hdGlvbnMuIElmIHRoZXkgaGF2ZSBub25lIHRoZW4gYWRkIGluIGFuIGVkZ2UgdG8gRmluaXNoLiBJZiB0aGV5XG4gICAgLy8gaGF2ZSBtb3JlIHRoYW4gb25lIHRoZW4gcmVtb3ZlIGFueSBsaW5rcyB0byBGaW5pc2guXG4gICAgZm9yIChsZXQgaSA9IFN0YXJ0OyBpIDwgRmluaXNoOyBpKyspIHtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9ucyA9IHNyY0FuZERzdC5ieVNyYy5nZXQoaSk7XG4gICAgICBpZiAoZGVzdGluYXRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgdG9CZUFkZGVkID0gbmV3IERpcmVjdGVkRWRnZShpLCBGaW5pc2gpO1xuICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2godG9CZUFkZGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFyZSB0aGVyZSBhbnkgdW5lZWRlZCBFZ2RlcyB0byBGaW5pc2g/IElmIHNvIGZpbHRlciB0aGVtIG91dC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgZGVzdGluYXRpb25zLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmogPT09IEZpbmlzaClcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgdG9CZVJlbW92ZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKGksIEZpbmlzaCk7XG4gICAgICAgICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgICAgICAgKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+ICF0b0JlUmVtb3ZlZC5lcXVhbCh2YWx1ZSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbG9vcCBvdmVyIGFsbCB2ZXJ0aWNzIGZyb20oU3RhcnQsIEZpbmlzaF0gYW5kIGxvb2sgZm9yIHRoZWlyIHNvdXJjZXMuIElmXG4gICAgLy8gdGhleSBoYXZlIG5vbmUgdGhlbiBhZGQgaW4gYW4gZWRnZSBmcm9tIFN0YXJ0LiBJZiB0aGV5IGhhdmUgbW9yZSB0aGFuIG9uZVxuICAgIC8vIHRoZW4gcmVtb3ZlIGFueSBsaW5rcyBmcm9tIFN0YXJ0LlxuICAgIGZvciAobGV0IGkgPSBTdGFydCArIDE7IGkgPCBGaW5pc2g7IGkrKykge1xuICAgICAgY29uc3QgZGVzdGluYXRpb25zID0gc3JjQW5kRHN0LmJ5RHN0LmdldChpKTtcbiAgICAgIGlmIChkZXN0aW5hdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB0b0JlQWRkZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBpKTtcbiAgICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKHRvQmVBZGRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBcmUgdGhlcmUgYW55IHVuLW5lZWRlZCBFZ2RlcyBmcm9tIFN0YXJ0PyBJZiBzbyBmaWx0ZXIgdGhlbSBvdXQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBkZXN0aW5hdGlvbnMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5maW5kKCh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiB2YWx1ZS5pID09PSBTdGFydClcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgdG9CZVJlbW92ZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBpKTtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAgICAgICAodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gIXRvQmVSZW1vdmVkLmVxdWFsKHZhbHVlKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBsYW4uY2hhcnQuRWRnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZShTdGFydCwgRmluaXNoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRUYXNrTmFtZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHRhc2tJbmRleDogbnVtYmVyLCBuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy50YXNrSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBjb25zdCBvbGROYW1lID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0ubmFtZTtcbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5uYW1lID0gdGhpcy5uYW1lO1xuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZE5hbWUpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZShvbGROYW1lOiBzdHJpbmcpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRUYXNrTmFtZVN1Yk9wKHRoaXMudGFza0luZGV4LCBvbGROYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0VGFza1N0YXRlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIHRhc2tTdGF0ZTogVGFza1N0YXRlO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih0YXNrSW5kZXg6IG51bWJlciwgdGFza1N0YXRlOiBUYXNrU3RhdGUpIHtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgICB0aGlzLnRhc2tTdGF0ZSA9IHRhc2tTdGF0ZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMudGFza0luZGV4LCBwbGFuLmNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgY29uc3Qgb2xkU3RhdGUgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5zdGF0ZTtcbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5zdGF0ZSA9IHRoaXMudGFza1N0YXRlO1xuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZFN0YXRlKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UodGFza1N0YXRlOiBUYXNrU3RhdGUpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRUYXNrU3RhdGVTdWJPcCh0aGlzLnRhc2tJbmRleCwgdGFza1N0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gSW5zZXJ0TmV3RW1wdHlNaWxlc3RvbmVBZnRlck9wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IEFkZFRhc2tBZnRlclN1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCgwLCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKHRhc2tJbmRleCArIDEsIC0xKSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0VGFza05hbWVPcCh0YXNrSW5kZXg6IG51bWJlciwgbmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0VGFza05hbWVTdWJPcCh0YXNrSW5kZXgsIG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRUYXNrU3RhdGVPcCh0YXNrSW5kZXg6IG51bWJlciwgdGFza1N0YXRlOiBUYXNrU3RhdGUpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRUYXNrU3RhdGVTdWJPcCh0YXNrSW5kZXgsIHRhc2tTdGF0ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNwbGl0VGFza09wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICBjb25zdCBzdWJPcHM6IFN1Yk9wW10gPSBbXG4gICAgbmV3IER1cFRhc2tTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcCh0YXNrSW5kZXgsIHRhc2tJbmRleCArIDEpLFxuICBdO1xuXG4gIHJldHVybiBuZXcgT3Aoc3ViT3BzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIER1cFRhc2tPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgY29uc3Qgc3ViT3BzOiBTdWJPcFtdID0gW1xuICAgIG5ldyBEdXBUYXNrU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQ29weUFsbEVkZ2VzRnJvbVRvU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgXTtcblxuICByZXR1cm4gbmV3IE9wKHN1Yk9wcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVUYXNrT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgRGVsZXRlVGFza1N1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZEVkZ2VPcChmcm9tVGFza0luZGV4OiBudW1iZXIsIHRvVGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKGZyb21UYXNrSW5kZXgsIHRvVGFza0luZGV4KSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmF0aW9uYWxpemVFZGdlc09wKCk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW1vdmVFZGdlT3AoaTogbnVtYmVyLCBqOiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgUmVtb3ZlRWRnZVN1cE9wKGksIGopLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IEFkZFRhc2tBZnRlclN1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AoXCJEdXJhdGlvblwiLCAxMCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCgwLCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKHRhc2tJbmRleCArIDEsIC0xKSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuIiwgImltcG9ydCB7IEFkZERlcGVuZGVuY3lEaWFsb2cgfSBmcm9tIFwiLi4vLi4vYWRkLWRlcGVuZGVuY3ktZGlhbG9nL2FkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiO1xuaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IEFkZEVkZ2VPcCB9IGZyb20gXCIuLi8uLi9vcHMvY2hhcnRcIjtcbmltcG9ydCB7IGVycm9yLCBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Gcm9tT3AsIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRQcmVkZWNlc3NvckFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPVxuICAgIFwiUHJvbXB0cyBmb3IgYW5kIGFkZHMgYSBwcmVkZWNlc3NvciB0byB0aGUgY3VycmVudCBUYXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgVGFzayBtdXN0IGJlIHNlbGVjdGVkLlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHByZWRUYXNrSW5kZXggPSBhd2FpdCBleHBsYW5NYWluXG4gICAgICAucXVlcnlTZWxlY3RvcjxBZGREZXBlbmRlbmN5RGlhbG9nPihcImFkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiKSFcbiAgICAgIC5zZWxlY3REZXBlbmRlbmN5KGV4cGxhbk1haW4ucGxhbi5jaGFydCwgZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2ssIFwicHJlZFwiKTtcbiAgICBpZiAocHJlZFRhc2tJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiTm8gcHJlZGVjZXNzb3Igd2FzIHNlbGVjdGVkLlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IEFkZEVkZ2VPcChwcmVkVGFza0luZGV4LCBleHBsYW5NYWluLnNlbGVjdGVkVGFzaykuYXBwbHlUbyhcbiAgICAgIGV4cGxhbk1haW4ucGxhblxuICAgICk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AoXG4gICAgICAgIHJldC52YWx1ZS5pbnZlcnNlLFxuICAgICAgICAodGhpcy5wb3N0QWN0aW9uV29yayA9IHRoaXMucG9zdEFjdGlvbldvcmspLFxuICAgICAgICB0cnVlXG4gICAgICApXG4gICAgKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFkZERlcGVuZGVuY3lEaWFsb2cgfSBmcm9tIFwiLi4vLi4vYWRkLWRlcGVuZGVuY3ktZGlhbG9nL2FkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiO1xuaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IEFkZEVkZ2VPcCB9IGZyb20gXCIuLi8uLi9vcHMvY2hhcnRcIjtcbmltcG9ydCB7IGVycm9yLCBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Gcm9tT3AsIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRTdWNjZXNzb3JBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJQcm9tcHRzIGZvciBhbmQgYWRkcyBhIHN1Y2Nlc3NvciB0byB0aGUgY3VycmVudCBUYXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgVGFzayBtdXN0IGJlIHNlbGVjdGVkLlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHN1Y2NUYXNrSW5kZXggPSBhd2FpdCBleHBsYW5NYWluXG4gICAgICAucXVlcnlTZWxlY3RvcjxBZGREZXBlbmRlbmN5RGlhbG9nPihcImFkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiKSFcbiAgICAgIC5zZWxlY3REZXBlbmRlbmN5KGV4cGxhbk1haW4ucGxhbi5jaGFydCwgZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2ssIFwic3VjY1wiKTtcbiAgICBpZiAoc3VjY1Rhc2tJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiTm8gc3VjY2Vzc29yIHdhcyBzZWxlY3RlZC5cIikpO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBBZGRFZGdlT3AoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2ssIHN1Y2NUYXNrSW5kZXgpLmFwcGx5VG8oXG4gICAgICBleHBsYW5NYWluLnBsYW5cbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKFxuICAgICAgICByZXQudmFsdWUuaW52ZXJzZSxcbiAgICAgICAgKHRoaXMucG9zdEFjdGlvbldvcmsgPSB0aGlzLnBvc3RBY3Rpb25Xb3JrKSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IFNlYXJjaFRhc2tQYW5lbCB9IGZyb20gXCIuLi8uLi9zZWFyY2gvc2VhcmNoLXRhc2stcGFuZWxcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIEdvVG9TZWFyY2hBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJNb3ZlcyBmb2N1cyB0byBzZWFyY2ggY29udHJvbC5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oX2V4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yPFNlYXJjaFRhc2tQYW5lbD4oXCJzZWFyY2gtdGFzay1wYW5lbFwiKSFcbiAgICAgIC5zZXRLZXlib2FyZEZvY3VzVG9JbnB1dChcIm5hbWUtb25seVwiKTtcbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdvVG9GdWxsU2VhcmNoQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9XG4gICAgXCJNb3ZlcyBmb2N1cyB0byBzZWFyY2ggY29udHJvbCBhbmQgZG9lcyBhIGZ1bGwgc2VhcmNoIG9mIGFsbCByZXNvdXJjZSB2YWx1ZXMuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGFzeW5jIGRvKF9leHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcjxTZWFyY2hUYXNrUGFuZWw+KFwic2VhcmNoLXRhc2stcGFuZWxcIikhXG4gICAgICAuc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoXCJmdWxsLWluZm9cIik7XG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBIZWxwQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiRGlzcGxheXMgdGhlIGhlbHAgZGlhbG9nLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGV4cGxhbk1haW5cbiAgICAgIC5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImtleWJvYXJkLW1hcC1kaWFsb2dcIikhXG4gICAgICAuc2hvd01vZGFsKCk7XG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBSZXNldFpvb21BY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJVbmRvZXMgdGhlIHpvb20uXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwYWludENoYXJ0XCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGV4cGxhbk1haW4uZGlzcGxheVJhbmdlID0gbnVsbDtcbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHtcbiAgRGVsZXRlVGFza09wLFxuICBEdXBUYXNrT3AsXG4gIEluc2VydE5ld0VtcHR5TWlsZXN0b25lQWZ0ZXJPcCxcbiAgSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCxcbiAgU3BsaXRUYXNrT3AsXG59IGZyb20gXCIuLi8uLi9vcHMvY2hhcnRcIjtcbmltcG9ydCB7IFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi4vLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IGVycm9yLCBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Gcm9tT3AsIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBTcGxpdFRhc2tBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJTcGxpdHMgYSB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgdGFzayBtdXN0IGJlIHNlbGVjdGVkIGZpcnN0LlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IFNwbGl0VGFza09wKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrKS5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXBUYXNrQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiRHVwbGljYXRlcyBhIHRhc2suXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IHRydWU7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBpZiAoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2sgPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiQSB0YXNrIG11c3QgYmUgc2VsZWN0ZWQgZmlyc3QuXCIpKTtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gRHVwVGFza09wKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrKS5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOZXdUYXNrQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiQ3JlYXRlcyBhIG5ldyB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgbGV0IHJldCA9IEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AoMCkuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlVGFza0FjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkRlbGV0ZXMgYSB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgdGFzayBtdXN0IGJlIHNlbGVjdGVkIGZpcnN0LlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IERlbGV0ZVRhc2tPcChleHBsYW5NYWluLnNlbGVjdGVkVGFzaykuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9IC0xO1xuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG4iLCAiLyoqIFdoZW4gdGhlIGdpdmVuIGVsZW1lbnQgaXMgY2xpY2tlZCwgdGhlbiB0b2dnbGUgdGhlIGBkYXJrbW9kZWAgY2xhc3Mgb24gdGhlXG4gKiBib2R5IGVsZW1lbnQuICovXG5leHBvcnQgY29uc3QgdG9nZ2xlVGhlbWUgPSAoKSA9PiB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcImRhcmttb2RlXCIpO1xufTtcbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IHRvZ2dsZVRoZW1lIH0gZnJvbSBcIi4uLy4uL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlclwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgVG9nZ2xlRGFya01vZGVBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJUb2dnbGVzIGRhcmsgbW9kZS5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBhaW50Q2hhcnRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICB0b2dnbGVUaGVtZSgpO1xuICAgIC8vIFRvZ2dsZURhcmtNb2RlQWN0aW9uIGlzIGl0cyBvd24gaW52ZXJzZS5cbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IHRvZ2dsZVRoZW1lIH0gZnJvbSBcIi4uLy4uL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlclwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgVG9nZ2xlUmFkYXJBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJUb2dnbGVzIHRoZSByYWRhciB2aWV3LlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGV4cGxhbk1haW4udG9nZ2xlUmFkYXIoKTtcbiAgICAvLyBUb2dnbGVSYWRhckFjdGlvbiBpcyBpdHMgb3duIGludmVyc2UuXG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIE5PT1BBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5pbXBvcnQgeyB1bmRvIH0gZnJvbSBcIi4uL2V4ZWN1dGVcIjtcblxuZXhwb3J0IGNsYXNzIFVuZG9BY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJVbmRvZXMgdGhlIGxhc3QgYWN0aW9uLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGNvbnN0IHJldCA9IHVuZG8oZXhwbGFuTWFpbik7XG5cbiAgICAvLyBVbmRvIGlzIG5vdCBhIHJldmVyc2libGUgYWN0aW9uLlxuICAgIHJldHVybiBvayhuZXcgTk9PUEFjdGlvbigpKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbi50c1wiO1xuaW1wb3J0IHsgQWRkUHJlZGVjZXNzb3JBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL2FkZFByZWRlY2Vzc29yLnRzXCI7XG5pbXBvcnQgeyBBZGRTdWNjZXNzb3JBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL2FkZFN1Y2Nlc3Nvci50c1wiO1xuaW1wb3J0IHtcbiAgR29Ub0Z1bGxTZWFyY2hBY3Rpb24sXG4gIEdvVG9TZWFyY2hBY3Rpb24sXG59IGZyb20gXCIuL2FjdGlvbnMvZ290b1NlYXJjaC50c1wiO1xuaW1wb3J0IHsgSGVscEFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvaGVscC50c1wiO1xuaW1wb3J0IHsgUmVzZXRab29tQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy9yZXNldFpvb20udHNcIjtcbmltcG9ydCB7XG4gIERlbGV0ZVRhc2tBY3Rpb24sXG4gIER1cFRhc2tBY3Rpb24sXG4gIE5ld1Rhc2tBY3Rpb24sXG4gIFNwbGl0VGFza0FjdGlvbixcbn0gZnJvbSBcIi4vYWN0aW9ucy90YXNrcy50c1wiO1xuaW1wb3J0IHsgVG9nZ2xlRGFya01vZGVBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3RvZ2dsZURhcmtNb2RlLnRzXCI7XG5pbXBvcnQgeyBUb2dnbGVSYWRhckFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvdG9nZ2xlUmFkYXIudHNcIjtcbmltcG9ydCB7IFVuZG9BY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3VuZG8udHNcIjtcblxuZXhwb3J0IHR5cGUgQWN0aW9uTmFtZXMgPVxuICB8IFwiVG9nZ2xlRGFya01vZGVBY3Rpb25cIlxuICB8IFwiVG9nZ2xlUmFkYXJBY3Rpb25cIlxuICB8IFwiUmVzZXRab29tQWN0aW9uXCJcbiAgfCBcIlVuZG9BY3Rpb25cIlxuICB8IFwiSGVscEFjdGlvblwiXG4gIHwgXCJTcGxpdFRhc2tBY3Rpb25cIlxuICB8IFwiRHVwVGFza0FjdGlvblwiXG4gIHwgXCJOZXdUYXNrQWN0aW9uXCJcbiAgfCBcIkRlbGV0ZVRhc2tBY3Rpb25cIlxuICB8IFwiR29Ub1NlYXJjaEFjdGlvblwiXG4gIHwgXCJHb1RvRnVsbFNlYXJjaEFjdGlvblwiXG4gIHwgXCJBZGRQcmVkZWNlc3NvckFjdGlvblwiXG4gIHwgXCJBZGRTdWNjZXNzb3JBY3Rpb25cIjtcblxuZXhwb3J0IGNvbnN0IEFjdGlvblJlZ2lzdHJ5OiBSZWNvcmQ8QWN0aW9uTmFtZXMsIEFjdGlvbj4gPSB7XG4gIFRvZ2dsZURhcmtNb2RlQWN0aW9uOiBuZXcgVG9nZ2xlRGFya01vZGVBY3Rpb24oKSxcbiAgVG9nZ2xlUmFkYXJBY3Rpb246IG5ldyBUb2dnbGVSYWRhckFjdGlvbigpLFxuICBSZXNldFpvb21BY3Rpb246IG5ldyBSZXNldFpvb21BY3Rpb24oKSxcbiAgVW5kb0FjdGlvbjogbmV3IFVuZG9BY3Rpb24oKSxcbiAgSGVscEFjdGlvbjogbmV3IEhlbHBBY3Rpb24oKSxcbiAgU3BsaXRUYXNrQWN0aW9uOiBuZXcgU3BsaXRUYXNrQWN0aW9uKCksXG4gIER1cFRhc2tBY3Rpb246IG5ldyBEdXBUYXNrQWN0aW9uKCksXG4gIE5ld1Rhc2tBY3Rpb246IG5ldyBOZXdUYXNrQWN0aW9uKCksXG4gIERlbGV0ZVRhc2tBY3Rpb246IG5ldyBEZWxldGVUYXNrQWN0aW9uKCksXG4gIEdvVG9TZWFyY2hBY3Rpb246IG5ldyBHb1RvU2VhcmNoQWN0aW9uKCksXG4gIEdvVG9GdWxsU2VhcmNoQWN0aW9uOiBuZXcgR29Ub0Z1bGxTZWFyY2hBY3Rpb24oKSxcbiAgQWRkUHJlZGVjZXNzb3JBY3Rpb246IG5ldyBBZGRQcmVkZWNlc3NvckFjdGlvbigpLFxuICBBZGRTdWNjZXNzb3JBY3Rpb246IG5ldyBBZGRTdWNjZXNzb3JBY3Rpb24oKSxcbn07XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi9leHBsYW5NYWluL2V4cGxhbk1haW4udHNcIjtcbmltcG9ydCB7IE9wIH0gZnJvbSBcIi4uL29wcy9vcHMudHNcIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBBY3Rpb24sIEFjdGlvbkZyb21PcCwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuL2FjdGlvbi50c1wiO1xuaW1wb3J0IHsgQWN0aW9uTmFtZXMsIEFjdGlvblJlZ2lzdHJ5IH0gZnJvbSBcIi4vcmVnaXN0cnkudHNcIjtcblxuY29uc3QgdW5kb1N0YWNrOiBBY3Rpb25bXSA9IFtdO1xuXG5leHBvcnQgY29uc3QgdW5kbyA9IGFzeW5jIChleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8bnVsbD4+ID0+IHtcbiAgY29uc3QgYWN0aW9uID0gdW5kb1N0YWNrLnBvcCgpITtcbiAgaWYgKCFhY3Rpb24pIHtcbiAgICByZXR1cm4gb2sobnVsbCk7XG4gIH1cblxuICByZXR1cm4gYXdhaXQgZXhlY3V0ZVVuZG8oYWN0aW9uLCBleHBsYW5NYWluKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleGVjdXRlID0gYXN5bmMgKFxuICBuYW1lOiBBY3Rpb25OYW1lcyxcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpblxuKTogUHJvbWlzZTxSZXN1bHQ8bnVsbD4+ID0+IHtcbiAgY29uc3QgYWN0aW9uID0gQWN0aW9uUmVnaXN0cnlbbmFtZV07XG4gIGNvbnN0IHJldCA9IGF3YWl0IGFjdGlvbi5kbyhleHBsYW5NYWluKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIHN3aXRjaCAoYWN0aW9uLnBvc3RBY3Rpb25Xb3JrKSB7XG4gICAgY2FzZSBcIlwiOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInBhaW50Q2hhcnRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI6XG4gICAgICBleHBsYW5NYWluLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG4gIGlmIChhY3Rpb24udW5kbykge1xuICAgIHVuZG9TdGFjay5wdXNoKHJldC52YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufTtcblxuZXhwb3J0IGNvbnN0IGV4ZWN1dGVPcCA9IGFzeW5jIChcbiAgb3A6IE9wLFxuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayxcbiAgdW5kbzogYm9vbGVhbixcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpblxuKTogUHJvbWlzZTxSZXN1bHQ8bnVsbD4+ID0+IHtcbiAgY29uc3QgYWN0aW9uID0gbmV3IEFjdGlvbkZyb21PcChvcCwgcG9zdEFjdGlvbldvcmssIHVuZG8pO1xuICBjb25zdCByZXQgPSBhd2FpdCBhY3Rpb24uZG8oZXhwbGFuTWFpbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuICBzd2l0Y2ggKGFjdGlvbi5wb3N0QWN0aW9uV29yaykge1xuICAgIGNhc2UgXCJcIjpcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInBhaW50Q2hhcnRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI6XG4gICAgICBleHBsYW5NYWluLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgYnJlYWs7XG4gIH1cbiAgaWYgKGFjdGlvbi51bmRvKSB7XG4gICAgdW5kb1N0YWNrLnB1c2gocmV0LnZhbHVlKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59O1xuXG5jb25zdCBleGVjdXRlVW5kbyA9IGFzeW5jIChcbiAgYWN0aW9uOiBBY3Rpb24sXG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW5cbik6IFByb21pc2U8UmVzdWx0PG51bGw+PiA9PiB7XG4gIGNvbnN0IHJldCA9IGF3YWl0IGFjdGlvbi5kbyhleHBsYW5NYWluKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIHN3aXRjaCAoYWN0aW9uLnBvc3RBY3Rpb25Xb3JrKSB7XG4gICAgY2FzZSBcIlwiOlxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFwicGFpbnRDaGFydFwiOlxuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59O1xuIiwgImltcG9ydCB7IGV4ZWN1dGUgfSBmcm9tIFwiLi4vYWN0aW9uL2V4ZWN1dGVcIjtcbmltcG9ydCB7IEFjdGlvbk5hbWVzIH0gZnJvbSBcIi4uL2FjdGlvbi9yZWdpc3RyeVwiO1xuaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcblxuZXhwb3J0IGNvbnN0IEtleU1hcDogTWFwPHN0cmluZywgQWN0aW9uTmFtZXM+ID0gbmV3IE1hcChbXG4gIFtcInNoaWZ0LWN0cmwtUlwiLCBcIlRvZ2dsZVJhZGFyQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLU1cIiwgXCJUb2dnbGVEYXJrTW9kZUFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC1aXCIsIFwiUmVzZXRab29tQWN0aW9uXCJdLFxuICBbXCJjdHJsLXpcIiwgXCJVbmRvQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLUhcIiwgXCJIZWxwQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLXxcIiwgXCJTcGxpdFRhc2tBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtX1wiLCBcIkR1cFRhc2tBY3Rpb25cIl0sXG4gIFtcImFsdC1JbnNlcnRcIiwgXCJOZXdUYXNrQWN0aW9uXCJdLFxuICBbXCJhbHQtRGVsZXRlXCIsIFwiRGVsZXRlVGFza0FjdGlvblwiXSxcbiAgW1wiY3RybC1mXCIsIFwiR29Ub1NlYXJjaEFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC1GXCIsIFwiR29Ub0Z1bGxTZWFyY2hBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtPFwiLCBcIkFkZFByZWRlY2Vzc29yQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLT5cIiwgXCJBZGRTdWNjZXNzb3JBY3Rpb25cIl0sXG5dKTtcblxubGV0IGV4cGxhbk1haW46IEV4cGxhbk1haW47XG5cbmV4cG9ydCBjb25zdCBTdGFydEtleWJvYXJkSGFuZGxpbmcgPSAoZW06IEV4cGxhbk1haW4pID0+IHtcbiAgZXhwbGFuTWFpbiA9IGVtO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBvbktleURvd24pO1xufTtcblxuY29uc3Qgb25LZXlEb3duID0gYXN5bmMgKGU6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgY29uc3Qga2V5bmFtZSA9IGAke2Uuc2hpZnRLZXkgPyBcInNoaWZ0LVwiIDogXCJcIn0ke2UuY3RybEtleSA/IFwiY3RybC1cIiA6IFwiXCJ9JHtlLm1ldGFLZXkgPyBcIm1ldGEtXCIgOiBcIlwifSR7ZS5hbHRLZXkgPyBcImFsdC1cIiA6IFwiXCJ9JHtlLmtleX1gO1xuICBjb25zb2xlLmxvZyhrZXluYW1lKTtcbiAgY29uc3QgYWN0aW9uTmFtZSA9IEtleU1hcC5nZXQoa2V5bmFtZSk7XG4gIGlmIChhY3Rpb25OYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zdCByZXQgPSBhd2FpdCBleGVjdXRlKGFjdGlvbk5hbWUsIGV4cGxhbk1haW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIGNvbnNvbGUubG9nKHJldC5lcnJvcik7XG4gIH1cbn07XG4iLCAiaW1wb3J0IHsgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQgeyBLZXlNYXAgfSBmcm9tIFwiLi4va2V5bWFwL2tleW1hcC50c1wiO1xuaW1wb3J0IHsgQWN0aW9uUmVnaXN0cnkgfSBmcm9tIFwiLi4vYWN0aW9uL3JlZ2lzdHJ5XCI7XG5cbmNsYXNzIEtleWJvYXJkTWFwRGlhbG9nIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBjb25zdCBrZXltYXBFbnRyaWVzID0gWy4uLktleU1hcC5lbnRyaWVzKCldO1xuICAgIGtleW1hcEVudHJpZXMuc29ydCgpO1xuICAgIHJlbmRlcihcbiAgICAgIGh0bWxgXG4gICAgICAgIDxkaWFsb2c+XG4gICAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICAgJHtrZXltYXBFbnRyaWVzLm1hcChcbiAgICAgICAgICAgICAgKFtrZXksIGFjdGlvbk5hbWVdKSA9PlxuICAgICAgICAgICAgICAgIGh0bWxgPHRyPlxuICAgICAgICAgICAgICAgICAgPHRkPiR7a2V5fTwvdGQ+XG4gICAgICAgICAgICAgICAgICA8dGQ+JHtBY3Rpb25SZWdpc3RyeVthY3Rpb25OYW1lXS5kZXNjcmlwdGlvbn08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+YFxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8L2RpYWxvZz5cbiAgICAgIGAsXG4gICAgICB0aGlzXG4gICAgKTtcbiAgfVxuXG4gIHNob3dNb2RhbCgpIHtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5zaG93TW9kYWwoKTtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJrZXlib2FyZC1tYXAtZGlhbG9nXCIsIEtleWJvYXJkTWFwRGlhbG9nKTtcbiIsICJpbXBvcnQge1xuICBWZXJ0ZXgsXG4gIFZlcnRleEluZGljZXMsXG4gIERpcmVjdGVkRWRnZSxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeVNyY1RvTWFwLFxuICBlZGdlc0J5RHN0VG9NYXAsXG59IGZyb20gXCIuLi9kYWdcIjtcblxuLyoqIEEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgYXBwbGllZCB0byBhIFZlcnRleCwgdXNlZCBpbiBsYXRlciBmdW5jdGlvbnMgbGlrZVxuRGVwdGggRmlyc3QgU2VhcmNoIHRvIGRvIHdvcmsgb24gZXZlcnkgVmVydGV4IGluIGEgRGlyZWN0ZWRHcmFwaC5cbiAqL1xuZXhwb3J0IHR5cGUgdmVydGV4RnVuY3Rpb24gPSAodjogVmVydGV4LCBpbmRleDogbnVtYmVyKSA9PiBib29sZWFuO1xuXG4vKiogUmV0dXJucyB0aGUgaW5kZXggb2YgYWxsIFZlcnRpY2VzIHRoYXQgaGF2ZSBubyBpbmNvbWluZyBlZGdlLlxuICovXG5leHBvcnQgY29uc3Qgc2V0T2ZWZXJ0aWNlc1dpdGhOb0luY29taW5nRWRnZSA9IChcbiAgZzogRGlyZWN0ZWRHcmFwaCxcbik6IFZlcnRleEluZGljZXMgPT4ge1xuICBjb25zdCBub2Rlc1dpdGhJbmNvbWluZ0VkZ2VzID0gZWRnZXNCeURzdFRvTWFwKGcuRWRnZXMpO1xuICBjb25zdCByZXQ6IFZlcnRleEluZGljZXMgPSBbXTtcbiAgZy5WZXJ0aWNlcy5mb3JFYWNoKChfOiBWZXJ0ZXgsIGk6IG51bWJlcikgPT4ge1xuICAgIGlmICghbm9kZXNXaXRoSW5jb21pbmdFZGdlcy5oYXMoaSkpIHtcbiAgICAgIHJldC5wdXNoKGkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXQ7XG59O1xuXG4vKiogRGVzY2VuZHMgdGhlIGdyYXBoIGluIERlcHRoIEZpcnN0IFNlYXJjaCBhbmQgYXBwbGllcyB0aGUgZnVuY3Rpb24gYGZgIHRvXG5lYWNoIG5vZGUuXG4gKi9cbmV4cG9ydCBjb25zdCBkZXB0aEZpcnN0U2VhcmNoID0gKGc6IERpcmVjdGVkR3JhcGgsIGY6IHZlcnRleEZ1bmN0aW9uKSA9PiB7XG4gIHNldE9mVmVydGljZXNXaXRoTm9JbmNvbWluZ0VkZ2UoZykuZm9yRWFjaCgodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGRlcHRoRmlyc3RTZWFyY2hGcm9tSW5kZXgoZywgdmVydGV4SW5kZXgsIGYpO1xuICB9KTtcbn07XG5cbi8qKiBEZXB0aCBGaXJzdCBTZWFyY2ggc3RhcnRpbmcgYXQgVmVydGV4IGBzdGFydF9pbmRleGAuICovXG5leHBvcnQgY29uc3QgZGVwdGhGaXJzdFNlYXJjaEZyb21JbmRleCA9IChcbiAgZzogRGlyZWN0ZWRHcmFwaCxcbiAgc3RhcnRfaW5kZXg6IG51bWJlcixcbiAgZjogdmVydGV4RnVuY3Rpb24sXG4pID0+IHtcbiAgY29uc3QgZWRnZXNCeVNyYyA9IGVkZ2VzQnlTcmNUb01hcChnLkVkZ2VzKTtcblxuICBjb25zdCB2aXNpdCA9ICh2ZXJ0ZXhJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKGYoZy5WZXJ0aWNlc1t2ZXJ0ZXhJbmRleF0sIHZlcnRleEluZGV4KSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbmV4dCA9IGVkZ2VzQnlTcmMuZ2V0KHZlcnRleEluZGV4KTtcbiAgICBpZiAobmV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5leHQuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICB2aXNpdChlLmopO1xuICAgIH0pO1xuICB9O1xuXG4gIHZpc2l0KHN0YXJ0X2luZGV4KTtcbn07XG4iLCAiaW1wb3J0IHtcbiAgRGlyZWN0ZWRFZGdlLFxuICBEaXJlY3RlZEdyYXBoLFxuICBlZGdlc0J5RHN0VG9NYXAsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbn0gZnJvbSBcIi4uL2RhZ1wiO1xuaW1wb3J0IHsgZGVwdGhGaXJzdFNlYXJjaEZyb21JbmRleCB9IGZyb20gXCIuL2Rmc1wiO1xuXG4vKiogUmV0dXJucyB0aGUgaW5kaWNlcyBvZiBhbGwgdGhlIHN1Y2Nlc3NvcnMgb2YgdGhlIHRhc2sgYXQgdGhlIGdpdmVuIGluZGV4LlxuICogIE5vdGUgdGhhdCBpbmNsdWRlcyB0aGUgZ2l2ZW4gaW5kZXggaXRzZWxmLlxuICovXG5leHBvcnQgY29uc3QgYWxsU3VjY2Vzc29ycyA9IChcbiAgdGFza0luZGV4OiBudW1iZXIsXG4gIGRpcmVjdGVkR3JhcGg6IERpcmVjdGVkR3JhcGhcbik6IG51bWJlcltdID0+IHtcbiAgaWYgKHRhc2tJbmRleCA+PSBkaXJlY3RlZEdyYXBoLlZlcnRpY2VzLmxlbmd0aCAtIDEgfHwgdGFza0luZGV4IDw9IDApIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgY29uc3QgYWxsQ2hpbGRyZW46IFNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuICBkZXB0aEZpcnN0U2VhcmNoRnJvbUluZGV4KFxuICAgIGRpcmVjdGVkR3JhcGgsXG4gICAgdGFza0luZGV4LFxuICAgIChfOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGFsbENoaWxkcmVuLmFkZChpbmRleCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICk7XG4gIGFsbENoaWxkcmVuLmRlbGV0ZShkaXJlY3RlZEdyYXBoLlZlcnRpY2VzLmxlbmd0aCAtIDEpO1xuICByZXR1cm4gWy4uLmFsbENoaWxkcmVuLnZhbHVlcygpXTtcbn07XG5cbmV4cG9ydCBjb25zdCBhbGxQcmVkZWNlc3NvcnMgPSAoXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoXG4pOiBudW1iZXJbXSA9PiB7XG4gIGlmICh0YXNrSW5kZXggPj0gZGlyZWN0ZWRHcmFwaC5WZXJ0aWNlcy5sZW5ndGggLSAxIHx8IHRhc2tJbmRleCA8PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IHByZWRlY2Vzc29yc1RvQ2hlY2sgPSBbdGFza0luZGV4XTtcbiAgY29uc3QgcmV0OiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoKTtcbiAgY29uc3QgYnlEZXN0ID0gZWRnZXNCeURzdFRvTWFwKGRpcmVjdGVkR3JhcGguRWRnZXMpO1xuICB3aGlsZSAocHJlZGVjZXNzb3JzVG9DaGVjay5sZW5ndGggIT09IDApIHtcbiAgICBjb25zdCBub2RlID0gcHJlZGVjZXNzb3JzVG9DaGVjay5wb3AoKSE7XG4gICAgcmV0LmFkZChub2RlKTtcbiAgICBjb25zdCBwcmVkZWNlc3NvcnMgPSBieURlc3QuZ2V0KG5vZGUpO1xuICAgIGlmIChwcmVkZWNlc3NvcnMpIHtcbiAgICAgIHByZWRlY2Vzc29yc1RvQ2hlY2sucHVzaCguLi5wcmVkZWNlc3NvcnMubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUuaSkpO1xuICAgIH1cbiAgfVxuICByZXQuZGVsZXRlKDApO1xuICByZXR1cm4gWy4uLnJldC52YWx1ZXMoKV07XG59O1xuXG4vKiogUmV0dXJucyB0aGUgaW5kaWNlcyBvZiBhbGwgdGhlIHRhc2tzIGluIHRoZSBncmFwaCwgZXhwZWN0IHRoZSBmaXJzdCBhbmQgdGhlXG4gKiAgbGFzdC4gKi9cbmV4cG9ydCBjb25zdCBhbGxUYXNrcyA9IChkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoKTogbnVtYmVyW10gPT4ge1xuICBjb25zdCByZXQgPSBbXTtcbiAgZm9yIChsZXQgaW5kZXggPSAxOyBpbmRleCA8IGRpcmVjdGVkR3JhcGguVmVydGljZXMubGVuZ3RoIC0gMTsgaW5kZXgrKykge1xuICAgIHJldC5wdXNoKGluZGV4KTtcbiAgfVxuICByZXR1cm4gcmV0O1xufTtcblxuZXhwb3J0IGNvbnN0IGRpZmZlcmVuY2UgPSAoYTogbnVtYmVyW10sIGI6IG51bWJlcltdKTogbnVtYmVyW10gPT4ge1xuICBjb25zdCBiU2V0ID0gbmV3IFNldChiKTtcbiAgcmV0dXJuIGEuZmlsdGVyKChpOiBudW1iZXIpID0+IGJTZXQuaGFzKGkpID09PSBmYWxzZSk7XG59O1xuXG5leHBvcnQgY29uc3QgYWxsUG90ZW50aWFsU3VjY2Vzc29ycyA9IChcbiAgdGFza0luZGV4OiBudW1iZXIsXG4gIGRpcmVjdGVkR3JhcGg6IERpcmVjdGVkR3JhcGhcbik6IG51bWJlcltdID0+IHtcbiAgLy8gUmVtb3ZlIGFsbCBkaXJlY3Qgc3VjY2Vzc29ycyBhbHNvLlxuICBjb25zdCBieVNyYyA9IGVkZ2VzQnlTcmNUb01hcChkaXJlY3RlZEdyYXBoLkVkZ2VzKTtcbiAgY29uc3QgZGlyZWN0U3VjYyA9IGJ5U3JjLmdldCh0YXNrSW5kZXgpIHx8IFtdO1xuICBjb25zdCBkaXJlY3RTdWNjQXJyYXkgPSBkaXJlY3RTdWNjLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLmopO1xuXG4gIHJldHVybiBkaWZmZXJlbmNlKGFsbFRhc2tzKGRpcmVjdGVkR3JhcGgpLCBbXG4gICAgLi4uYWxsUHJlZGVjZXNzb3JzKHRhc2tJbmRleCwgZGlyZWN0ZWRHcmFwaCksXG4gICAgLi4uZGlyZWN0U3VjY0FycmF5LFxuICBdKTtcbn07XG5cbmV4cG9ydCBjb25zdCBhbGxQb3RlbnRpYWxQcmVkZWNlc3NvcnMgPSAoXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoXG4pOiBudW1iZXJbXSA9PiB7XG4gIC8vIFJlbW92ZSBhbGwgZGlyZWN0IHByZWRlY2Vzc29ycyBhbHNvLlxuICBjb25zdCBieURlc3QgPSBlZGdlc0J5RHN0VG9NYXAoZGlyZWN0ZWRHcmFwaC5FZGdlcyk7XG4gIGNvbnN0IGRpcmVjdFByZWQgPSBieURlc3QuZ2V0KHRhc2tJbmRleCkgfHwgW107XG4gIGNvbnN0IGRpcmVjdFByZWRBcnJheSA9IGRpcmVjdFByZWQubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUuaSk7XG4gIGNvbnN0IGFsbFN1Y2MgPSBhbGxTdWNjZXNzb3JzKHRhc2tJbmRleCwgZGlyZWN0ZWRHcmFwaCk7XG4gIGNvbnN0IGFsbCA9IGFsbFRhc2tzKGRpcmVjdGVkR3JhcGgpO1xuICBjb25zdCB0b0JlU3VidHJhY3RlZCA9IFsuLi5hbGxTdWNjLCAuLi5kaXJlY3RQcmVkQXJyYXldO1xuICByZXR1cm4gZGlmZmVyZW5jZShhbGwsIHRvQmVTdWJ0cmFjdGVkKTtcbn07XG4iLCAiaW1wb3J0IHsgVGFza1NlYXJjaENvbnRyb2wgfSBmcm9tIFwiLi4vc2VhcmNoL3Rhc2stc2VhcmNoLWNvbnRyb2xzXCI7XG5pbXBvcnQgeyBDaGFydCB9IGZyb20gXCIuLi9jaGFydC9jaGFydFwiO1xuaW1wb3J0IHsgRGVwVHlwZSB9IGZyb20gXCIuLi9kZXBlbmRlbmNpZXMvZGVwZW5kZW5jaWVzLXBhbmVsXCI7XG5pbXBvcnQge1xuICBhbGxQb3RlbnRpYWxTdWNjZXNzb3JzLFxuICBhbGxQb3RlbnRpYWxQcmVkZWNlc3NvcnMsXG59IGZyb20gXCIuLi9kYWcvYWxnb3JpdGhtcy9jaXJjdWxhclwiO1xuXG5leHBvcnQgY2xhc3MgQWRkRGVwZW5kZW5jeURpYWxvZyBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgcHJpdmF0ZSB0aXRsZUVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgdGFza1NlYXJjaENvbnRyb2w6IFRhc2tTZWFyY2hDb250cm9sIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgZGlhbG9nOiBIVE1MRGlhbG9nRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHJlc29sdmU6ICh2YWx1ZTogbnVtYmVyIHwgdW5kZWZpbmVkKSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy50aXRsZUVsZW1lbnQgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJoMlwiKSE7XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCA9IHRoaXMucXVlcnlTZWxlY3RvcihcInRhc2stc2VhcmNoLWNvbnRyb2xcIikhO1xuICAgIHRoaXMuZGlhbG9nID0gdGhpcy5xdWVyeVNlbGVjdG9yKFwiZGlhbG9nXCIpITtcbiAgICB0aGlzLmRpYWxvZy5hZGRFdmVudExpc3RlbmVyKFwiY2FuY2VsXCIsICgpID0+IHRoaXMucmVzb2x2ZSh1bmRlZmluZWQpKTtcbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sLmFkZEV2ZW50TGlzdGVuZXIoXCJ0YXNrLWNoYW5nZVwiLCAoZSkgPT4ge1xuICAgICAgdGhpcy5kaWFsb2chLmNsb3NlKCk7XG4gICAgICB0aGlzLnJlc29sdmUoZS5kZXRhaWwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFBvcHVsYXRlcyB0aGUgZGlhbG9nIGFuZCBzaG93cyBpdCBhcyBhIE1vZGFsIGRpYWxvZyBhbmQgcmV0dXJucyBhIFByb21pc2VcbiAgICogIHRoYXQgcmVzb2x2ZXMgb24gc3VjY2VzcyB0byBhIHRhc2tJbmRleCwgb3IgdW5kZWZpbmVkIGlmIHRoZSB1c2VyXG4gICAqICBjYW5jZWxsZWQgb3V0IG9mIHRoZSBmbG93LlxuICAgKi9cbiAgcHVibGljIHNlbGVjdERlcGVuZGVuY3koXG4gICAgY2hhcnQ6IENoYXJ0LFxuICAgIHRhc2tJbmRleDogbnVtYmVyLFxuICAgIGRlcFR5cGU6IERlcFR5cGVcbiAgKTogUHJvbWlzZTxudW1iZXIgfCB1bmRlZmluZWQ+IHtcbiAgICB0aGlzLnRpdGxlRWxlbWVudCEudGV4dENvbnRlbnQgPSBkZXBUeXBlO1xuXG4gICAgbGV0IGluY2x1ZGVkSW5kZXhlcyA9IFtdO1xuICAgIGlmIChkZXBUeXBlID09PSBcInByZWRcIikge1xuICAgICAgaW5jbHVkZWRJbmRleGVzID0gYWxsUG90ZW50aWFsUHJlZGVjZXNzb3JzKHRhc2tJbmRleCwgY2hhcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbmNsdWRlZEluZGV4ZXMgPSBhbGxQb3RlbnRpYWxTdWNjZXNzb3JzKHRhc2tJbmRleCwgY2hhcnQpO1xuICAgIH1cbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sIS50YXNrcyA9IGNoYXJ0LlZlcnRpY2VzO1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLmluY2x1ZGVkSW5kZXhlcyA9IGluY2x1ZGVkSW5kZXhlcztcblxuICAgIC8vIFRPRE8gLSBBbGxvdyBib3RoIHR5cGVzIG9mIHNlYXJjaCBpbiB0aGUgZGVwZW5kZW5jeSBkaWFsb2cuXG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEuc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoXCJuYW1lLW9ubHlcIik7XG4gICAgY29uc3QgcmV0ID0gbmV3IFByb21pc2U8bnVtYmVyIHwgdW5kZWZpbmVkPigocmVzb2x2ZSwgX3JlamVjdCkgPT4ge1xuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHRoaXMuZGlhbG9nIS5zaG93TW9kYWwoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImFkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiLCBBZGREZXBlbmRlbmN5RGlhbG9nKTtcbiIsICJpbXBvcnQge1xuICBWZXJ0ZXgsXG4gIFZlcnRleEluZGljZXMsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbn0gZnJvbSBcIi4uL2RhZy50c1wiO1xuXG4vKipcblRoZSByZXR1cm4gdHlwZSBmb3IgdGhlIFRvcGxvZ2ljYWxTb3J0IGZ1bmN0aW9uLiBcbiAqL1xudHlwZSBUU1JldHVybiA9IHtcbiAgaGFzQ3ljbGVzOiBib29sZWFuO1xuXG4gIGN5Y2xlOiBWZXJ0ZXhJbmRpY2VzO1xuXG4gIG9yZGVyOiBWZXJ0ZXhJbmRpY2VzO1xufTtcblxuLyoqXG5SZXR1cm5zIGEgdG9wb2xvZ2ljYWwgc29ydCBvcmRlciBmb3IgYSBEaXJlY3RlZEdyYXBoLCBvciB0aGUgbWVtYmVycyBvZiBhIGN5Y2xlIGlmIGFcbnRvcG9sb2dpY2FsIHNvcnQgY2FuJ3QgYmUgZG9uZS5cbiBcbiBUaGUgdG9wb2xvZ2ljYWwgc29ydCBjb21lcyBmcm9tOlxuXG4gICAgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVG9wb2xvZ2ljYWxfc29ydGluZyNEZXB0aC1maXJzdF9zZWFyY2hcblxuTCBcdTIxOTAgRW1wdHkgbGlzdCB0aGF0IHdpbGwgY29udGFpbiB0aGUgc29ydGVkIG5vZGVzXG53aGlsZSBleGlzdHMgbm9kZXMgd2l0aG91dCBhIHBlcm1hbmVudCBtYXJrIGRvXG4gICAgc2VsZWN0IGFuIHVubWFya2VkIG5vZGUgblxuICAgIHZpc2l0KG4pXG5cbmZ1bmN0aW9uIHZpc2l0KG5vZGUgbilcbiAgICBpZiBuIGhhcyBhIHBlcm1hbmVudCBtYXJrIHRoZW5cbiAgICAgICAgcmV0dXJuXG4gICAgaWYgbiBoYXMgYSB0ZW1wb3JhcnkgbWFyayB0aGVuXG4gICAgICAgIHN0b3AgICAoZ3JhcGggaGFzIGF0IGxlYXN0IG9uZSBjeWNsZSlcblxuICAgIG1hcmsgbiB3aXRoIGEgdGVtcG9yYXJ5IG1hcmtcblxuICAgIGZvciBlYWNoIG5vZGUgbSB3aXRoIGFuIGVkZ2UgZnJvbSBuIHRvIG0gZG9cbiAgICAgICAgdmlzaXQobSlcblxuICAgIHJlbW92ZSB0ZW1wb3JhcnkgbWFyayBmcm9tIG5cbiAgICBtYXJrIG4gd2l0aCBhIHBlcm1hbmVudCBtYXJrXG4gICAgYWRkIG4gdG8gaGVhZCBvZiBMXG5cbiAqL1xuZXhwb3J0IGNvbnN0IHRvcG9sb2dpY2FsU29ydCA9IChnOiBEaXJlY3RlZEdyYXBoKTogVFNSZXR1cm4gPT4ge1xuICBjb25zdCByZXQ6IFRTUmV0dXJuID0ge1xuICAgIGhhc0N5Y2xlczogZmFsc2UsXG4gICAgY3ljbGU6IFtdLFxuICAgIG9yZGVyOiBbXSxcbiAgfTtcblxuICBjb25zdCBlZGdlTWFwID0gZWRnZXNCeVNyY1RvTWFwKGcuRWRnZXMpO1xuXG4gIGNvbnN0IG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgZy5WZXJ0aWNlcy5mb3JFYWNoKChfOiBWZXJ0ZXgsIGluZGV4OiBudW1iZXIpID0+XG4gICAgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5hZGQoaW5kZXgpXG4gICk7XG5cbiAgY29uc3QgaGFzUGVybWFuZW50TWFyayA9IChpbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuICFub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrLmhhcyhpbmRleCk7XG4gIH07XG5cbiAgY29uc3QgdGVtcG9yYXJ5TWFyayA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuXG4gIGNvbnN0IHZpc2l0ID0gKGluZGV4OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICBpZiAoaGFzUGVybWFuZW50TWFyayhpbmRleCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAodGVtcG9yYXJ5TWFyay5oYXMoaW5kZXgpKSB7XG4gICAgICAvLyBXZSBvbmx5IHJldHVybiBmYWxzZSBvbiBmaW5kaW5nIGEgbG9vcCwgd2hpY2ggaXMgc3RvcmVkIGluXG4gICAgICAvLyB0ZW1wb3JhcnlNYXJrLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0ZW1wb3JhcnlNYXJrLmFkZChpbmRleCk7XG5cbiAgICBjb25zdCBuZXh0RWRnZXMgPSBlZGdlTWFwLmdldChpbmRleCk7XG4gICAgaWYgKG5leHRFZGdlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5leHRFZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlID0gbmV4dEVkZ2VzW2ldO1xuICAgICAgICBpZiAoIXZpc2l0KGUuaikpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0ZW1wb3JhcnlNYXJrLmRlbGV0ZShpbmRleCk7XG4gICAgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5kZWxldGUoaW5kZXgpO1xuICAgIHJldC5vcmRlci51bnNoaWZ0KGluZGV4KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBXZSB3aWxsIHByZXN1bWUgdGhhdCBWZXJ0ZXhbMF0gaXMgdGhlIHN0YXJ0IG5vZGUgYW5kIHRoYXQgd2Ugc2hvdWxkIHN0YXJ0IHRoZXJlLlxuICBjb25zdCBvayA9IHZpc2l0KDApO1xuICBpZiAoIW9rKSB7XG4gICAgcmV0Lmhhc0N5Y2xlcyA9IHRydWU7XG4gICAgcmV0LmN5Y2xlID0gWy4uLnRlbXBvcmFyeU1hcmsua2V5cygpXTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHtcbiAgVmVydGV4SW5kaWNlcyxcbiAgRWRnZXMsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbiAgZWRnZXNCeURzdFRvTWFwLFxuICBEaXJlY3RlZEVkZ2UsXG4gIERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9kYWcvZGFnXCI7XG5cbmltcG9ydCB7IHRvcG9sb2dpY2FsU29ydCB9IGZyb20gXCIuLi9kYWcvYWxnb3JpdGhtcy90b3Bvc29ydC50c1wiO1xuaW1wb3J0IHsgTWV0cmljVmFsdWVzIH0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgVGFza0R1cmF0aW9uIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzLnRzXCI7XG5cbmV4cG9ydCB0eXBlIFRhc2tTdGF0ZSA9IFwidW5zdGFydGVkXCIgfCBcInN0YXJ0ZWRcIiB8IFwiY29tcGxldGVcIjtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfVEFTS19OQU1FID0gXCJUYXNrIE5hbWVcIjtcblxuZXhwb3J0IGludGVyZmFjZSBUYXNrU2VyaWFsaXplZCB7XG4gIHJlc291cmNlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbiAgbWV0cmljczogTWV0cmljVmFsdWVzO1xuICBuYW1lOiBzdHJpbmc7XG4gIHN0YXRlOiBUYXNrU3RhdGU7XG59XG5cbi8vIERvIHdlIGNyZWF0ZSBzdWItY2xhc3NlcyBhbmQgdGhlbiBzZXJpYWxpemUgc2VwYXJhdGVseT8gT3IgZG8gd2UgaGF2ZSBhXG4vLyBjb25maWcgYWJvdXQgd2hpY2ggdHlwZSBvZiBEdXJhdGlvblNhbXBsZXIgaXMgYmVpbmcgdXNlZD9cbi8vXG4vLyBXZSBjYW4gdXNlIHRyYWRpdGlvbmFsIG9wdGltaXN0aWMvcGVzc2ltaXN0aWMgdmFsdWUuIE9yIEphY29iaWFuJ3Ncbi8vIHVuY2VydGFpbnRseSBtdWx0aXBsaWVycyBbMS4xLCAxLjUsIDIsIDVdIGFuZCB0aGVpciBpbnZlcnNlcyB0byBnZW5lcmF0ZSBhblxuLy8gb3B0aW1pc3RpYyBwZXNzaW1pc3RpYy5cblxuLyoqIFRhc2sgaXMgYSBWZXJ0ZXggd2l0aCBkZXRhaWxzIGFib3V0IHRoZSBUYXNrIHRvIGNvbXBsZXRlLiAqL1xuZXhwb3J0IGNsYXNzIFRhc2sge1xuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcgPSBcIlwiKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZSB8fCBERUZBVUxUX1RBU0tfTkFNRTtcbiAgICB0aGlzLm1ldHJpY3MgPSB7fTtcbiAgICB0aGlzLnJlc291cmNlcyA9IHt9O1xuICB9XG5cbiAgLy8gUmVzb3VyY2Uga2V5cyBhbmQgdmFsdWVzLiBUaGUgcGFyZW50IHBsYW4gY29udGFpbnMgYWxsIHRoZSByZXNvdXJjZVxuICAvLyBkZWZpbml0aW9ucy5cblxuICByZXNvdXJjZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG5cbiAgbWV0cmljczogTWV0cmljVmFsdWVzO1xuXG4gIG5hbWU6IHN0cmluZztcblxuICBzdGF0ZTogVGFza1N0YXRlID0gXCJ1bnN0YXJ0ZWRcIjtcblxuICB0b0pTT04oKTogVGFza1NlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICByZXNvdXJjZXM6IHRoaXMucmVzb3VyY2VzLFxuICAgICAgbWV0cmljczogdGhpcy5tZXRyaWNzLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgc3RhdGU6IHRoaXMuc3RhdGUsXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZHVyYXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRNZXRyaWMoXCJEdXJhdGlvblwiKSE7XG4gIH1cblxuICBwdWJsaWMgc2V0IGR1cmF0aW9uKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLnNldE1ldHJpYyhcIkR1cmF0aW9uXCIsIHZhbHVlKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRNZXRyaWMoa2V5OiBzdHJpbmcpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLm1ldHJpY3Nba2V5XTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRNZXRyaWMoa2V5OiBzdHJpbmcsIHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLm1ldHJpY3Nba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGRlbGV0ZU1ldHJpYyhrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLm1ldHJpY3Nba2V5XTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRSZXNvdXJjZShrZXk6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMucmVzb3VyY2VzW2tleV07XG4gIH1cblxuICBwdWJsaWMgc2V0UmVzb3VyY2Uoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLnJlc291cmNlc1trZXldID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZGVsZXRlUmVzb3VyY2Uoa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5yZXNvdXJjZXNba2V5XTtcbiAgfVxuXG4gIHB1YmxpYyBkdXAoKTogVGFzayB7XG4gICAgY29uc3QgcmV0ID0gbmV3IFRhc2soKTtcbiAgICByZXQucmVzb3VyY2VzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5yZXNvdXJjZXMpO1xuICAgIHJldC5tZXRyaWNzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5tZXRyaWNzKTtcbiAgICByZXQubmFtZSA9IHRoaXMubmFtZTtcbiAgICByZXQuc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgIHJldHVybiByZXQ7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVGFza3MgPSBUYXNrW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhcnRTZXJpYWxpemVkIHtcbiAgdmVydGljZXM6IFRhc2tTZXJpYWxpemVkW107XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkW107XG59XG5cbi8qKiBBIENoYXJ0IGlzIGEgRGlyZWN0ZWRHcmFwaCwgYnV0IHdpdGggVGFza3MgZm9yIFZlcnRpY2VzLiAqL1xuZXhwb3J0IGNsYXNzIENoYXJ0IHtcbiAgVmVydGljZXM6IFRhc2tzO1xuICBFZGdlczogRWRnZXM7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc3Qgc3RhcnQgPSBuZXcgVGFzayhcIlN0YXJ0XCIpO1xuICAgIHN0YXJ0LnNldE1ldHJpYyhcIkR1cmF0aW9uXCIsIDApO1xuICAgIGNvbnN0IGZpbmlzaCA9IG5ldyBUYXNrKFwiRmluaXNoXCIpO1xuICAgIGZpbmlzaC5zZXRNZXRyaWMoXCJEdXJhdGlvblwiLCAwKTtcbiAgICB0aGlzLlZlcnRpY2VzID0gW3N0YXJ0LCBmaW5pc2hdO1xuICAgIHRoaXMuRWRnZXMgPSBbbmV3IERpcmVjdGVkRWRnZSgwLCAxKV07XG4gIH1cblxuICB0b0pTT04oKTogQ2hhcnRTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmVydGljZXM6IHRoaXMuVmVydGljZXMubWFwKCh0OiBUYXNrKSA9PiB0LnRvSlNPTigpKSxcbiAgICAgIGVkZ2VzOiB0aGlzLkVkZ2VzLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLnRvSlNPTigpKSxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFRvcG9sb2dpY2FsT3JkZXIgPSBWZXJ0ZXhJbmRpY2VzO1xuXG5leHBvcnQgdHlwZSBWYWxpZGF0ZVJlc3VsdCA9IFJlc3VsdDxUb3BvbG9naWNhbE9yZGVyPjtcblxuLyoqIFZhbGlkYXRlcyBhIERpcmVjdGVkR3JhcGggaXMgYSB2YWxpZCBDaGFydC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNoYXJ0KGc6IERpcmVjdGVkR3JhcGgpOiBWYWxpZGF0ZVJlc3VsdCB7XG4gIGlmIChnLlZlcnRpY2VzLmxlbmd0aCA8IDIpIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBcIkNoYXJ0IG11c3QgY29udGFpbiBhdCBsZWFzdCB0d28gbm9kZSwgdGhlIHN0YXJ0IGFuZCBmaW5pc2ggdGFza3MuXCJcbiAgICApO1xuICB9XG5cbiAgY29uc3QgZWRnZXNCeURzdCA9IGVkZ2VzQnlEc3RUb01hcChnLkVkZ2VzKTtcbiAgY29uc3QgZWRnZXNCeVNyYyA9IGVkZ2VzQnlTcmNUb01hcChnLkVkZ2VzKTtcblxuICAvLyBUaGUgZmlyc3QgVmVydGV4LCBUXzAgYWthIHRoZSBTdGFydCBNaWxlc3RvbmUsIG11c3QgaGF2ZSAwIGluY29taW5nIGVkZ2VzLlxuICBpZiAoZWRnZXNCeURzdC5nZXQoMCkgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBlcnJvcihcIlRoZSBzdGFydCBub2RlICgwKSBoYXMgYW4gaW5jb21pbmcgZWRnZS5cIik7XG4gIH1cblxuICAvLyBBbmQgb25seSBUXzAgc2hvdWxkIGhhdmUgMCBpbmNvbWluZyBlZGdlcy5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBnLlZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGVkZ2VzQnlEc3QuZ2V0KGkpID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYEZvdW5kIG5vZGUgdGhhdCBpc24ndCAoMCkgdGhhdCBoYXMgbm8gaW5jb21pbmcgZWRnZXM6ICR7aX1gXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRoZSBsYXN0IFZlcnRleCwgVF9maW5pc2gsIHRoZSBGaW5pc2ggTWlsZXN0b25lLCBtdXN0IGhhdmUgMCBvdXRnb2luZyBlZGdlcy5cbiAgaWYgKGVkZ2VzQnlTcmMuZ2V0KGcuVmVydGljZXMubGVuZ3RoIC0gMSkgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIFwiVGhlIGxhc3Qgbm9kZSwgd2hpY2ggc2hvdWxkIGJlIHRoZSBGaW5pc2ggTWlsZXN0b25lLCBoYXMgYW4gb3V0Z29pbmcgZWRnZS5cIlxuICAgICk7XG4gIH1cblxuICAvLyBBbmQgb25seSBUX2ZpbmlzaCBzaG91bGQgaGF2ZSAwIG91dGdvaW5nIGVkZ2VzLlxuICBmb3IgKGxldCBpID0gMDsgaSA8IGcuVmVydGljZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgaWYgKGVkZ2VzQnlTcmMuZ2V0KGkpID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYEZvdW5kIG5vZGUgdGhhdCBpc24ndCBUX2ZpbmlzaCB0aGF0IGhhcyBubyBvdXRnb2luZyBlZGdlczogJHtpfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbnVtVmVydGljZXMgPSBnLlZlcnRpY2VzLmxlbmd0aDtcbiAgLy8gQW5kIGFsbCBlZGdlcyBtYWtlIHNlbnNlLCBpLmUuIHRoZXkgYWxsIHBvaW50IHRvIHZlcnRleGVzIHRoYXQgZXhpc3QuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZy5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBnLkVkZ2VzW2ldO1xuICAgIGlmIChcbiAgICAgIGVsZW1lbnQuaSA8IDAgfHxcbiAgICAgIGVsZW1lbnQuaSA+PSBudW1WZXJ0aWNlcyB8fFxuICAgICAgZWxlbWVudC5qIDwgMCB8fFxuICAgICAgZWxlbWVudC5qID49IG51bVZlcnRpY2VzXG4gICAgKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYEVkZ2UgJHtlbGVtZW50fSBwb2ludHMgdG8gYSBub24tZXhpc3RlbnQgVmVydGV4LmApO1xuICAgIH1cbiAgfVxuXG4gIC8vIE5vdyB3ZSBjb25maXJtIHRoYXQgd2UgaGF2ZSBhIERpcmVjdGVkIEFjeWNsaWMgR3JhcGgsIGkuZS4gdGhlIGdyYXBoIGhhcyBub1xuICAvLyBjeWNsZXMgYnkgY3JlYXRpbmcgYSB0b3BvbG9naWNhbCBzb3J0IHN0YXJ0aW5nIGF0IFRfMFxuICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ub3BvbG9naWNhbF9zb3J0aW5nI0RlcHRoLWZpcnN0X3NlYXJjaFxuICBjb25zdCB0c1JldCA9IHRvcG9sb2dpY2FsU29ydChnKTtcbiAgaWYgKHRzUmV0Lmhhc0N5Y2xlcykge1xuICAgIHJldHVybiBlcnJvcihgQ2hhcnQgaGFzIGN5Y2xlOiAke1suLi50c1JldC5jeWNsZV0uam9pbihcIiwgXCIpfWApO1xuICB9XG5cbiAgcmV0dXJuIG9rKHRzUmV0Lm9yZGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENoYXJ0VmFsaWRhdGUoXG4gIGM6IENoYXJ0LFxuICB0YXNrRHVyYXRpb246IFRhc2tEdXJhdGlvbiB8IG51bGwgPSBudWxsXG4pOiBWYWxpZGF0ZVJlc3VsdCB7XG4gIGlmICh0YXNrRHVyYXRpb24gPT09IG51bGwpIHtcbiAgICB0YXNrRHVyYXRpb24gPSAodGFza0luZGV4OiBudW1iZXIpID0+IGMuVmVydGljZXNbdGFza0luZGV4XS5kdXJhdGlvbjtcbiAgfVxuICBjb25zdCByZXQgPSB2YWxpZGF0ZUNoYXJ0KGMpO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgaWYgKHRhc2tEdXJhdGlvbigwKSAhPT0gMCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBTdGFydCBNaWxlc3RvbmUgbXVzdCBoYXZlIGR1cmF0aW9uIG9mIDAsIGluc3RlYWQgZ290ICR7dGFza0R1cmF0aW9uKDApfWBcbiAgICApO1xuICB9XG4gIGlmICh0YXNrRHVyYXRpb24oYy5WZXJ0aWNlcy5sZW5ndGggLSAxKSAhPT0gMCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBGaW5pc2ggTWlsZXN0b25lIG11c3QgaGF2ZSBkdXJhdGlvbiBvZiAwLCBpbnN0ZWFkIGdvdCAke3Rhc2tEdXJhdGlvbihcbiAgICAgICAgYy5WZXJ0aWNlcy5sZW5ndGggLSAxXG4gICAgICApfWBcbiAgICApO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG4iLCAiaW1wb3J0IHsgUm91bmRlciB9IGZyb20gXCIuLi90eXBlcy90eXBlc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByZWNpc2lvblNlcmlhbGl6ZWQge1xuICBwcmVjaXNpb246IG51bWJlcjtcbn1cbmV4cG9ydCBjbGFzcyBQcmVjaXNpb24ge1xuICBwcml2YXRlIG11bHRpcGxpZXI6IG51bWJlcjtcbiAgcHJpdmF0ZSBfcHJlY2lzaW9uOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IocHJlY2lzaW9uOiBudW1iZXIgPSAwKSB7XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUocHJlY2lzaW9uKSkge1xuICAgICAgcHJlY2lzaW9uID0gMDtcbiAgICB9XG4gICAgdGhpcy5fcHJlY2lzaW9uID0gTWF0aC5hYnMoTWF0aC50cnVuYyhwcmVjaXNpb24pKTtcbiAgICB0aGlzLm11bHRpcGxpZXIgPSAxMCAqKiB0aGlzLl9wcmVjaXNpb247XG4gIH1cblxuICByb3VuZCh4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLnRydW5jKHggKiB0aGlzLm11bHRpcGxpZXIpIC8gdGhpcy5tdWx0aXBsaWVyO1xuICB9XG5cbiAgcm91bmRlcigpOiBSb3VuZGVyIHtcbiAgICByZXR1cm4gKHg6IG51bWJlcik6IG51bWJlciA9PiB0aGlzLnJvdW5kKHgpO1xuICB9XG5cbiAgcHVibGljIGdldCBwcmVjaXNpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcHJlY2lzaW9uO1xuICB9XG5cbiAgdG9KU09OKCk6IFByZWNpc2lvblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBwcmVjaXNpb246IHRoaXMuX3ByZWNpc2lvbixcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIEZyb21KU09OKHM6IFByZWNpc2lvblNlcmlhbGl6ZWQgfCB1bmRlZmluZWQpOiBQcmVjaXNpb24ge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgUHJlY2lzaW9uKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJlY2lzaW9uKHMucHJlY2lzaW9uKTtcbiAgfVxufVxuIiwgIi8vIFV0aWxpdGllcyBmb3IgZGVhbGluZyB3aXRoIGEgcmFuZ2Ugb2YgbnVtYmVycy5cblxuZXhwb3J0IGludGVyZmFjZSBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQge1xuICBtaW46IG51bWJlcjtcbiAgbWF4OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBjbGFtcCA9ICh4OiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciA9PiB7XG4gIGlmICh4ID4gbWF4KSB7XG4gICAgcmV0dXJuIG1heDtcbiAgfVxuICBpZiAoeCA8IG1pbikge1xuICAgIHJldHVybiBtaW47XG4gIH1cbiAgcmV0dXJuIHg7XG59O1xuXG4vLyBSYW5nZSBkZWZpbmVzIGEgcmFuZ2Ugb2YgbnVtYmVycywgZnJvbSBbbWluLCBtYXhdIGluY2x1c2l2ZS5cbmV4cG9ydCBjbGFzcyBNZXRyaWNSYW5nZSB7XG4gIHByaXZhdGUgX21pbjogbnVtYmVyID0gLU51bWJlci5NQVhfVkFMVUU7XG4gIHByaXZhdGUgX21heDogbnVtYmVyID0gTnVtYmVyLk1BWF9WQUxVRTtcblxuICBjb25zdHJ1Y3RvcihtaW46IG51bWJlciA9IC1OdW1iZXIuTUFYX1ZBTFVFLCBtYXg6IG51bWJlciA9IE51bWJlci5NQVhfVkFMVUUpIHtcbiAgICBpZiAobWF4IDwgbWluKSB7XG4gICAgICBbbWluLCBtYXhdID0gW21heCwgbWluXTtcbiAgICB9XG4gICAgdGhpcy5fbWluID0gbWluO1xuICAgIHRoaXMuX21heCA9IG1heDtcbiAgfVxuXG4gIGNsYW1wKHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBjbGFtcCh2YWx1ZSwgdGhpcy5fbWluLCB0aGlzLl9tYXgpO1xuICB9XG5cbiAgcHVibGljIGdldCBtaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fbWluO1xuICB9XG5cbiAgcHVibGljIGdldCBtYXgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4O1xuICB9XG5cbiAgdG9KU09OKCk6IE1ldHJpY1JhbmdlU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1pbjogdGhpcy5fbWluLFxuICAgICAgbWF4OiB0aGlzLl9tYXgsXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBGcm9tSlNPTihzOiBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQgfCB1bmRlZmluZWQpOiBNZXRyaWNSYW5nZSB7XG4gICAgaWYgKHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBNZXRyaWNSYW5nZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IE1ldHJpY1JhbmdlKHMubWluLCBzLm1heCk7XG4gIH1cbn1cbiIsICIvLyBNZXRyaWNzIGRlZmluZSBmbG9hdGluZyBwb2ludCB2YWx1ZXMgdGhhdCBhcmUgdHJhY2tlZCBwZXIgVGFzay5cblxuaW1wb3J0IHsgUHJlY2lzaW9uLCBQcmVjaXNpb25TZXJpYWxpemVkIH0gZnJvbSBcIi4uL3ByZWNpc2lvbi9wcmVjaXNpb24udHNcIjtcbmltcG9ydCB7IGNsYW1wLCBNZXRyaWNSYW5nZSwgTWV0cmljUmFuZ2VTZXJpYWxpemVkIH0gZnJvbSBcIi4vcmFuZ2UudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBNZXRyaWNEZWZpbml0aW9uU2VyaWFsaXplZCB7XG4gIHJhbmdlOiBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQ7XG4gIGRlZmF1bHQ6IG51bWJlcjtcbiAgcHJlY2lzaW9uOiBQcmVjaXNpb25TZXJpYWxpemVkO1xufVxuXG5leHBvcnQgY2xhc3MgTWV0cmljRGVmaW5pdGlvbiB7XG4gIHJhbmdlOiBNZXRyaWNSYW5nZTtcbiAgZGVmYXVsdDogbnVtYmVyO1xuICBpc1N0YXRpYzogYm9vbGVhbjtcbiAgcHJlY2lzaW9uOiBQcmVjaXNpb247XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZGVmYXVsdFZhbHVlOiBudW1iZXIsXG4gICAgcmFuZ2U6IE1ldHJpY1JhbmdlID0gbmV3IE1ldHJpY1JhbmdlKCksXG4gICAgaXNTdGF0aWM6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICBwcmVjaXNpb246IFByZWNpc2lvbiA9IG5ldyBQcmVjaXNpb24oMSlcbiAgKSB7XG4gICAgdGhpcy5yYW5nZSA9IHJhbmdlO1xuICAgIHRoaXMuZGVmYXVsdCA9IGNsYW1wKGRlZmF1bHRWYWx1ZSwgcmFuZ2UubWluLCByYW5nZS5tYXgpO1xuICAgIHRoaXMuaXNTdGF0aWMgPSBpc1N0YXRpYztcbiAgICB0aGlzLnByZWNpc2lvbiA9IHByZWNpc2lvbjtcbiAgfVxuXG4gIHRvSlNPTigpOiBNZXRyaWNEZWZpbml0aW9uU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJhbmdlOiB0aGlzLnJhbmdlLnRvSlNPTigpLFxuICAgICAgZGVmYXVsdDogdGhpcy5kZWZhdWx0LFxuICAgICAgcHJlY2lzaW9uOiB0aGlzLnByZWNpc2lvbi50b0pTT04oKSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIEZyb21KU09OKHM6IE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHwgdW5kZWZpbmVkKTogTWV0cmljRGVmaW5pdGlvbiB7XG4gICAgaWYgKHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBNZXRyaWNEZWZpbml0aW9uKDApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IE1ldHJpY0RlZmluaXRpb24oXG4gICAgICBzLmRlZmF1bHQgfHwgMCxcbiAgICAgIE1ldHJpY1JhbmdlLkZyb21KU09OKHMucmFuZ2UpLFxuICAgICAgZmFsc2UsXG4gICAgICBQcmVjaXNpb24uRnJvbUpTT04ocy5wcmVjaXNpb24pXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBNZXRyaWNEZWZpbml0aW9ucyA9IHsgW2tleTogc3RyaW5nXTogTWV0cmljRGVmaW5pdGlvbiB9O1xuXG5leHBvcnQgdHlwZSBNZXRyaWNEZWZpbml0aW9uc1NlcmlhbGl6ZWQgPSB7XG4gIFtrZXk6IHN0cmluZ106IE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkO1xufTtcblxuZXhwb3J0IHR5cGUgTWV0cmljVmFsdWVzID0geyBba2V5OiBzdHJpbmddOiBudW1iZXIgfTtcbiIsICIvLyBFYWNoIFJlc291cnNlIGhhcyBhIGtleSwgd2hpY2ggaXMgdGhlIG5hbWUsIGFuZCBhIGxpc3Qgb2YgYWNjZXB0YWJsZSB2YWx1ZXMuXG4vLyBUaGUgbGlzdCBvZiB2YWx1ZXMgY2FuIG5ldmVyIGJlIGVtcHR5LCBhbmQgdGhlIGZpcnN0IHZhbHVlIGluIGB2YWx1ZXNgIGlzIHRoZVxuLy8gZGVmYXVsdCB2YWx1ZSBmb3IgYSBSZXNvdXJjZS5cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUkVTT1VSQ0VfVkFMVUUgPSBcIlwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICB2YWx1ZXM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgY2xhc3MgUmVzb3VyY2VEZWZpbml0aW9uIHtcbiAgdmFsdWVzOiBzdHJpbmdbXTtcbiAgaXNTdGF0aWM6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgdmFsdWVzOiBzdHJpbmdbXSA9IFtERUZBVUxUX1JFU09VUkNFX1ZBTFVFXSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIHRoaXMudmFsdWVzID0gdmFsdWVzO1xuICAgIHRoaXMuaXNTdGF0aWMgPSBpc1N0YXRpYztcbiAgfVxuXG4gIHRvSlNPTigpOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWVzOiB0aGlzLnZhbHVlcyxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIEZyb21KU09OKHM6IFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQpOiBSZXNvdXJjZURlZmluaXRpb24ge1xuICAgIHJldHVybiBuZXcgUmVzb3VyY2VEZWZpbml0aW9uKHMudmFsdWVzKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBSZXNvdXJjZURlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb24gfTtcbmV4cG9ydCB0eXBlIFJlc291cmNlRGVmaW5pdGlvbnNTZXJpYWxpemVkID0ge1xuICBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkO1xufTtcbiIsICIvKipcbiAqIFRyaWFuZ3VsYXIgaXMgdGhlIGludmVyc2UgQ3VtdWxhdGl2ZSBEZW5zaXR5IEZ1bmN0aW9uIChDREYpIGZvciB0aGVcbiAqIHRyaWFuZ3VsYXIgZGlzdHJpYnV0aW9uLlxuICpcbiAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RyaWFuZ3VsYXJfZGlzdHJpYnV0aW9uI0dlbmVyYXRpbmdfcmFuZG9tX3ZhcmlhdGVzXG4gKlxuICogVGhlIGludmVyc2Ugb2YgdGhlIENERiBpcyB1c2VmdWwgZm9yIGdlbmVyYXRpbmcgc2FtcGxlcyBmcm9tIHRoZVxuICogZGlzdHJpYnV0aW9uLCBpLmUuIHBhc3NpbmcgaW4gdmFsdWVzIGZyb20gdGhlIHVuaWZvcm0gZGlzdHJpYnV0aW9uIFswLCAxXVxuICogd2lsbCBwcm9kdWNlIHNhbXBsZSB0aGF0IGxvb2sgbGlrZSB0aGV5IGNvbWUgZnJvbSB0aGUgdHJpYW5ndWxhclxuICogZGlzdHJpYnV0aW9uLlxuICpcbiAqXG4gKi9cblxuZXhwb3J0IGNsYXNzIFRyaWFuZ3VsYXIge1xuICBwcml2YXRlIGE6IG51bWJlcjtcbiAgcHJpdmF0ZSBiOiBudW1iZXI7XG4gIHByaXZhdGUgYzogbnVtYmVyO1xuICBwcml2YXRlIEZfYzogbnVtYmVyO1xuXG4gIC8qKiAgVGhlIHRyaWFuZ3VsYXIgZGlzdHJpYnV0aW9uIGlzIGEgY29udGludW91cyBwcm9iYWJpbGl0eSBkaXN0cmlidXRpb24gd2l0aFxuICBsb3dlciBsaW1pdCBgYWAsIHVwcGVyIGxpbWl0IGBiYCwgYW5kIG1vZGUgYGNgLCB3aGVyZSBhIDwgYiBhbmQgYSBcdTIyNjQgYyBcdTIyNjQgYi4gKi9cbiAgY29uc3RydWN0b3IoYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlcikge1xuICAgIHRoaXMuYSA9IGE7XG4gICAgdGhpcy5iID0gYjtcbiAgICB0aGlzLmMgPSBjO1xuXG4gICAgLy8gRl9jIGlzIHRoZSBjdXRvZmYgaW4gdGhlIGRvbWFpbiB3aGVyZSB3ZSBzd2l0Y2ggYmV0d2VlbiB0aGUgdHdvIGhhbHZlcyBvZlxuICAgIC8vIHRoZSB0cmlhbmdsZS5cbiAgICB0aGlzLkZfYyA9IChjIC0gYSkgLyAoYiAtIGEpO1xuICB9XG5cbiAgLyoqICBQcm9kdWNlIGEgc2FtcGxlIGZyb20gdGhlIHRyaWFuZ3VsYXIgZGlzdHJpYnV0aW9uLiBUaGUgdmFsdWUgb2YgJ3AnXG4gICBzaG91bGQgYmUgaW4gWzAsIDEuMF0uICovXG4gIHNhbXBsZShwOiBudW1iZXIpOiBudW1iZXIge1xuICAgIGlmIChwIDwgMCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSBlbHNlIGlmIChwID4gMS4wKSB7XG4gICAgICByZXR1cm4gMS4wO1xuICAgIH0gZWxzZSBpZiAocCA8IHRoaXMuRl9jKSB7XG4gICAgICByZXR1cm4gdGhpcy5hICsgTWF0aC5zcXJ0KHAgKiAodGhpcy5iIC0gdGhpcy5hKSAqICh0aGlzLmMgLSB0aGlzLmEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdGhpcy5iIC0gTWF0aC5zcXJ0KCgxIC0gcCkgKiAodGhpcy5iIC0gdGhpcy5hKSAqICh0aGlzLmIgLSB0aGlzLmMpKVxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBUcmlhbmd1bGFyIH0gZnJvbSBcIi4vdHJpYW5ndWxhci50c1wiO1xuXG5leHBvcnQgdHlwZSBVbmNlcnRhaW50eSA9IFwibG93XCIgfCBcIm1vZGVyYXRlXCIgfCBcImhpZ2hcIiB8IFwiZXh0cmVtZVwiO1xuXG5leHBvcnQgY29uc3QgVW5jZXJ0YWludHlUb051bTogUmVjb3JkPFVuY2VydGFpbnR5LCBudW1iZXI+ID0ge1xuICBsb3c6IDEuMSxcbiAgbW9kZXJhdGU6IDEuNSxcbiAgaGlnaDogMixcbiAgZXh0cmVtZTogNSxcbn07XG5cbmV4cG9ydCBjbGFzcyBKYWNvYmlhbiB7XG4gIHByaXZhdGUgdHJpYW5ndWxhcjogVHJpYW5ndWxhcjtcbiAgY29uc3RydWN0b3IoZXhwZWN0ZWQ6IG51bWJlciwgdW5jZXJ0YWludHk6IFVuY2VydGFpbnR5KSB7XG4gICAgY29uc3QgbXVsID0gVW5jZXJ0YWludHlUb051bVt1bmNlcnRhaW50eV07XG4gICAgdGhpcy50cmlhbmd1bGFyID0gbmV3IFRyaWFuZ3VsYXIoZXhwZWN0ZWQgLyBtdWwsIGV4cGVjdGVkICogbXVsLCBleHBlY3RlZCk7XG4gIH1cblxuICBzYW1wbGUocDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy50cmlhbmd1bGFyLnNhbXBsZShwKTtcbiAgfVxufVxuIiwgImltcG9ydCB7XG4gIENoYXJ0LFxuICBDaGFydFNlcmlhbGl6ZWQsXG4gIFRhc2ssXG4gIFRhc2tTZXJpYWxpemVkLFxuICB2YWxpZGF0ZUNoYXJ0LFxufSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQge1xuICBNZXRyaWNEZWZpbml0aW9uLFxuICBNZXRyaWNEZWZpbml0aW9ucyxcbiAgTWV0cmljRGVmaW5pdGlvbnNTZXJpYWxpemVkLFxufSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNSYW5nZSB9IGZyb20gXCIuLi9tZXRyaWNzL3JhbmdlLnRzXCI7XG5pbXBvcnQgeyBSYXRpb25hbGl6ZUVkZ2VzT3AgfSBmcm9tIFwiLi4vb3BzL2NoYXJ0LnRzXCI7XG5pbXBvcnQge1xuICBSZXNvdXJjZURlZmluaXRpb24sXG4gIFJlc291cmNlRGVmaW5pdGlvbnMsXG4gIFJlc291cmNlRGVmaW5pdGlvbnNTZXJpYWxpemVkLFxufSBmcm9tIFwiLi4vcmVzb3VyY2VzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBvayB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFVuY2VydGFpbnR5VG9OdW0gfSBmcm9tIFwiLi4vc3RhdHMvY2RmL3RyaWFuZ3VsYXIvamFjb2JpYW4udHNcIjtcblxuZXhwb3J0IHR5cGUgU3RhdGljTWV0cmljS2V5cyA9IFwiRHVyYXRpb25cIiB8IFwiUGVyY2VudCBDb21wbGV0ZVwiO1xuXG5leHBvcnQgY29uc3QgU3RhdGljTWV0cmljRGVmaW5pdGlvbnM6IE1ldHJpY0RlZmluaXRpb25zID0ge1xuICAvLyBIb3cgbG9uZyBhIHRhc2sgd2lsbCB0YWtlLCBpbiBkYXlzLlxuICBEdXJhdGlvbjogbmV3IE1ldHJpY0RlZmluaXRpb24oMCwgbmV3IE1ldHJpY1JhbmdlKDApLCB0cnVlKSxcbiAgLy8gVGhlIHBlcmNlbnQgY29tcGxldGUgZm9yIGEgdGFzay5cbiAgUGVyY2VudDogbmV3IE1ldHJpY0RlZmluaXRpb24oMCwgbmV3IE1ldHJpY1JhbmdlKDAsIDEwMCksIHRydWUpLFxufTtcblxuZXhwb3J0IGNvbnN0IFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnMgPSB7XG4gIFVuY2VydGFpbnR5OiBuZXcgUmVzb3VyY2VEZWZpbml0aW9uKE9iamVjdC5rZXlzKFVuY2VydGFpbnR5VG9OdW0pLCB0cnVlKSxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGxhblNlcmlhbGl6ZWQge1xuICBjaGFydDogQ2hhcnRTZXJpYWxpemVkO1xuICByZXNvdXJjZURlZmluaXRpb25zOiBSZXNvdXJjZURlZmluaXRpb25zU2VyaWFsaXplZDtcbiAgbWV0cmljRGVmaW5pdGlvbnM6IE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZDtcbn1cblxuZXhwb3J0IGNsYXNzIFBsYW4ge1xuICBjaGFydDogQ2hhcnQ7XG5cbiAgcmVzb3VyY2VEZWZpbml0aW9uczogUmVzb3VyY2VEZWZpbml0aW9ucztcblxuICBtZXRyaWNEZWZpbml0aW9uczogTWV0cmljRGVmaW5pdGlvbnM7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jaGFydCA9IG5ldyBDaGFydCgpO1xuXG4gICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljUmVzb3VyY2VEZWZpbml0aW9ucyk7XG4gICAgdGhpcy5tZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIFN0YXRpY01ldHJpY0RlZmluaXRpb25zKTtcbiAgICB0aGlzLmFwcGx5TWV0cmljc0FuZFJlc291cmNlc1RvVmVydGljZXMoKTtcbiAgfVxuXG4gIGFwcGx5TWV0cmljc0FuZFJlc291cmNlc1RvVmVydGljZXMoKSB7XG4gICAgT2JqZWN0LmtleXModGhpcy5tZXRyaWNEZWZpbml0aW9ucykuZm9yRWFjaCgobWV0cmljTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBtZCA9IHRoaXMubWV0cmljRGVmaW5pdGlvbnNbbWV0cmljTmFtZV0hO1xuICAgICAgdGhpcy5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICAgIHRhc2suc2V0TWV0cmljKG1ldHJpY05hbWUsIG1kLmRlZmF1bHQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgT2JqZWN0LmVudHJpZXModGhpcy5yZXNvdXJjZURlZmluaXRpb25zKS5mb3JFYWNoKFxuICAgICAgKFtrZXksIHJlc291cmNlRGVmaW5pdGlvbl0pID0+IHtcbiAgICAgICAgdGhpcy5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICAgICAgdGFzay5zZXRSZXNvdXJjZShrZXksIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbMF0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgdG9KU09OKCk6IFBsYW5TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hhcnQ6IHRoaXMuY2hhcnQudG9KU09OKCksXG4gICAgICByZXNvdXJjZURlZmluaXRpb25zOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZmlsdGVyKFxuICAgICAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiAhcmVzb3VyY2VEZWZpbml0aW9uLmlzU3RhdGljXG4gICAgICAgIClcbiAgICAgICksXG4gICAgICBtZXRyaWNEZWZpbml0aW9uczogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyh0aGlzLm1ldHJpY0RlZmluaXRpb25zKVxuICAgICAgICAgIC5maWx0ZXIoKFtrZXksIG1ldHJpY0RlZmluaXRpb25dKSA9PiAhbWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYylcbiAgICAgICAgICAubWFwKChba2V5LCBtZXRyaWNEZWZpbml0aW9uXSkgPT4gW2tleSwgbWV0cmljRGVmaW5pdGlvbi50b0pTT04oKV0pXG4gICAgICApLFxuICAgIH07XG4gIH1cblxuICBnZXRNZXRyaWNEZWZpbml0aW9uKGtleTogc3RyaW5nKTogTWV0cmljRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIHNldE1ldHJpY0RlZmluaXRpb24oa2V5OiBzdHJpbmcsIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24pIHtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb25zW2tleV0gPSBtZXRyaWNEZWZpbml0aW9uO1xuICB9XG5cbiAgZGVsZXRlTWV0cmljRGVmaW5pdGlvbihrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLm1ldHJpY0RlZmluaXRpb25zW2tleV07XG4gIH1cblxuICBnZXRSZXNvdXJjZURlZmluaXRpb24oa2V5OiBzdHJpbmcpOiBSZXNvdXJjZURlZmluaXRpb24gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIHNldFJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZywgdmFsdWU6IFJlc291cmNlRGVmaW5pdGlvbikge1xuICAgIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1trZXldID0gdmFsdWU7XG4gIH1cblxuICBkZWxldGVSZXNvdXJjZURlZmluaXRpb24oa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zW2tleV07XG4gIH1cblxuICAvLyBSZXR1cm5zIGEgbmV3IFRhc2sgd2l0aCBkZWZhdWx0cyBmb3IgYWxsIG1ldHJpY3MgYW5kIHJlc291cmNlcy5cbiAgbmV3VGFzaygpOiBUYXNrIHtcbiAgICBjb25zdCByZXQgPSBuZXcgVGFzaygpO1xuICAgIE9iamVjdC5rZXlzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpLmZvckVhY2goKG1ldHJpY05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgbWQgPSB0aGlzLmdldE1ldHJpY0RlZmluaXRpb24obWV0cmljTmFtZSkhO1xuICAgICAgcmV0LnNldE1ldHJpYyhtZXRyaWNOYW1lLCBtZC5kZWZhdWx0KTtcbiAgICB9KTtcbiAgICBPYmplY3QuZW50cmllcyh0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMpLmZvckVhY2goXG4gICAgICAoW2tleSwgcmVzb3VyY2VEZWZpbml0aW9uXSkgPT4ge1xuICAgICAgICByZXQuc2V0UmVzb3VyY2Uoa2V5LCByZXNvdXJjZURlZmluaXRpb24udmFsdWVzWzBdKTtcbiAgICAgIH1cbiAgICApO1xuICAgIHJldHVybiByZXQ7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEZyb21KU09OID0gKHRleHQ6IHN0cmluZyk6IFJlc3VsdDxQbGFuPiA9PiB7XG4gIGNvbnN0IHBsYW5TZXJpYWxpemVkOiBQbGFuU2VyaWFsaXplZCA9IEpTT04ucGFyc2UodGV4dCk7XG4gIGNvbnN0IHBsYW4gPSBuZXcgUGxhbigpO1xuXG4gIHBsYW4uY2hhcnQuVmVydGljZXMgPSBwbGFuU2VyaWFsaXplZC5jaGFydC52ZXJ0aWNlcy5tYXAoXG4gICAgKHRhc2tTZXJpYWxpemVkOiBUYXNrU2VyaWFsaXplZCk6IFRhc2sgPT4ge1xuICAgICAgY29uc3QgdGFzayA9IG5ldyBUYXNrKHRhc2tTZXJpYWxpemVkLm5hbWUpO1xuICAgICAgdGFzay5zdGF0ZSA9IHRhc2tTZXJpYWxpemVkLnN0YXRlO1xuICAgICAgdGFzay5tZXRyaWNzID0gdGFza1NlcmlhbGl6ZWQubWV0cmljcztcbiAgICAgIHRhc2sucmVzb3VyY2VzID0gdGFza1NlcmlhbGl6ZWQucmVzb3VyY2VzO1xuXG4gICAgICByZXR1cm4gdGFzaztcbiAgICB9XG4gICk7XG4gIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuU2VyaWFsaXplZC5jaGFydC5lZGdlcy5tYXAoXG4gICAgKGRpcmVjdGVkRWRnZVNlcmlhbGl6ZWQ6IERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQpOiBEaXJlY3RlZEVkZ2UgPT5cbiAgICAgIG5ldyBEaXJlY3RlZEVkZ2UoZGlyZWN0ZWRFZGdlU2VyaWFsaXplZC5pLCBkaXJlY3RlZEVkZ2VTZXJpYWxpemVkLmopXG4gICk7XG5cbiAgY29uc3QgZGVzZXJpYWxpemVkTWV0cmljRGVmaW5pdGlvbnMgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMocGxhblNlcmlhbGl6ZWQubWV0cmljRGVmaW5pdGlvbnMpLm1hcChcbiAgICAgIChba2V5LCBzZXJpYWxpemVkTWV0cmljRGVmaW5pdGlvbl0pID0+IFtcbiAgICAgICAga2V5LFxuICAgICAgICBNZXRyaWNEZWZpbml0aW9uLkZyb21KU09OKHNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uKSxcbiAgICAgIF1cbiAgICApXG4gICk7XG5cbiAgcGxhbi5tZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAge30sXG4gICAgU3RhdGljTWV0cmljRGVmaW5pdGlvbnMsXG4gICAgZGVzZXJpYWxpemVkTWV0cmljRGVmaW5pdGlvbnNcbiAgKTtcblxuICBjb25zdCBkZXNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25zID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKHBsYW5TZXJpYWxpemVkLnJlc291cmNlRGVmaW5pdGlvbnMpLm1hcChcbiAgICAgIChba2V5LCBzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9uXSkgPT4gW1xuICAgICAgICBrZXksXG4gICAgICAgIFJlc291cmNlRGVmaW5pdGlvbi5Gcm9tSlNPTihzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9uKSxcbiAgICAgIF1cbiAgICApXG4gICk7XG5cbiAgcGxhbi5yZXNvdXJjZURlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICB7fSxcbiAgICBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zLFxuICAgIGRlc2VyaWFsaXplZFJlc291cmNlRGVmaW5pdGlvbnNcbiAgKTtcblxuICBjb25zdCByZXQgPSBSYXRpb25hbGl6ZUVkZ2VzT3AoKS5hcHBseVRvKHBsYW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBjb25zdCByZXRWYWwgPSB2YWxpZGF0ZUNoYXJ0KHBsYW4uY2hhcnQpO1xuICBpZiAoIXJldFZhbC5vaykge1xuICAgIHJldHVybiByZXRWYWw7XG4gIH1cbiAgcmV0dXJuIG9rKHBsYW4pO1xufTtcbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhblwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tOYW1lQ2hhbmdlRGV0YWlscyB7XG4gIG5hbWU6IHN0cmluZztcbiAgdGFza0luZGV4OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza1Jlc291cmNlVmFsdWVDaGFuZ2VEZXRhaWxzIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYXNrTWV0cmljVmFsdWVDaGFuZ2VEZXRhaWxzIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogbnVtYmVyO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwIHtcbiAgICBcInRhc2stbmFtZS1jaGFuZ2VcIjogQ3VzdG9tRXZlbnQ8VGFza05hbWVDaGFuZ2VEZXRhaWxzPjtcbiAgICBcInRhc2stcmVzb3VyY2UtdmFsdWUtY2hhbmdlXCI6IEN1c3RvbUV2ZW50PFRhc2tSZXNvdXJjZVZhbHVlQ2hhbmdlRGV0YWlscz47XG4gICAgXCJ0YXNrLW1ldHJpYy12YWx1ZS1jaGFuZ2VcIjogQ3VzdG9tRXZlbnQ8VGFza01ldHJpY1ZhbHVlQ2hhbmdlRGV0YWlscz47XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNlbGVjdGVkVGFza1BhbmVsIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBwbGFuOiBQbGFuID0gbmV3IFBsYW4oKTtcbiAgdGFza0luZGV4OiBudW1iZXIgPSAtMTtcblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgdXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWwocGxhbjogUGxhbiwgdGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnBsYW4gPSBwbGFuO1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgLypcbiAgICBUT0RPIC0gRG8gdGhlIGZvbGxvd2luZyB3aGVuIHNlbGVjdGluZyBhIG5ldyB0YXNrLlxuICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dCA9XG4gICAgICAgICAgc2VsZWN0ZWRUYXNrUGFuZWwucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihcIiN0YXNrLW5hbWVcIikhO1xuICAgICAgICBpbnB1dC5mb2N1cygpO1xuICAgICAgICBpbnB1dC5zZWxlY3QoKTtcbiAgICAgIH0sIDApO1xuICAgICAgKi9cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZW5kZXIodGhpcy50ZW1wbGF0ZSgpLCB0aGlzKTtcbiAgfVxuXG4gIHRlbXBsYXRlKCk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdCB0YXNrSW5kZXggPSB0aGlzLnRhc2tJbmRleDtcbiAgICBpZiAodGFza0luZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIGh0bWxgTm8gdGFzayBzZWxlY3RlZC5gO1xuICAgIH1cbiAgICBjb25zdCB0YXNrID0gdGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF07XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+TmFtZTwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgaWQ9XCJ0YXNrLW5hbWVcIlxuICAgICAgICAgICAgICAudmFsdWU9XCIke3Rhc2submFtZX1cIlxuICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudDxUYXNrTmFtZUNoYW5nZURldGFpbHM+KFwidGFzay1uYW1lLWNoYW5nZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgJHtPYmplY3QuZW50cmllcyh0aGlzLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucykubWFwKFxuICAgICAgICAgIChbcmVzb3VyY2VLZXksIGRlZm5dKSA9PlxuICAgICAgICAgICAgaHRtbGAgPHRyPlxuICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cIiR7cmVzb3VyY2VLZXl9XCI+JHtyZXNvdXJjZUtleX08L2xhYmVsPlxuICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgICAgaWQ9XCIke3Jlc291cmNlS2V5fVwiXG4gICAgICAgICAgICAgICAgICBAY2hhbmdlPSR7YXN5bmMgKGU6IEV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwidGFzay1yZXNvdXJjZS12YWx1ZS1jaGFuZ2VcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICB0YXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcmVzb3VyY2VLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgJHtkZWZuLnZhbHVlcy5tYXAoXG4gICAgICAgICAgICAgICAgICAgIChyZXNvdXJjZVZhbHVlOiBzdHJpbmcpID0+XG4gICAgICAgICAgICAgICAgICAgICAgaHRtbGA8b3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lPSR7cmVzb3VyY2VWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3RlZD0ke3Rhc2sucmVzb3VyY2VzW3Jlc291cmNlS2V5XSA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlVmFsdWV9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgJHtyZXNvdXJjZVZhbHVlfVxuICAgICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPmBcbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgKX1cbiAgICAgICAgJHtPYmplY3Qua2V5cyh0aGlzLnBsYW4ubWV0cmljRGVmaW5pdGlvbnMpLm1hcChcbiAgICAgICAgICAoa2V5OiBzdHJpbmcpID0+XG4gICAgICAgICAgICBodG1sYCA8dHI+XG4gICAgICAgICAgICAgIDx0ZD48bGFiZWwgZm9yPVwiJHtrZXl9XCI+JHtrZXl9PC9sYWJlbD48L3RkPlxuICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICBpZD1cIiR7a2V5fVwiXG4gICAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgIC52YWx1ZT1cIiR7dGFzay5tZXRyaWNzW2tleV19XCJcbiAgICAgICAgICAgICAgICAgIEBjaGFuZ2U9JHthc3luYyAoZTogRXZlbnQpID0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJ0YXNrLW1ldHJpYy12YWx1ZS1jaGFuZ2VcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICB0YXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICsoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPC90cj5gXG4gICAgICAgICl9XG4gICAgICA8L3RhYmxlPlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwic2VsZWN0ZWQtdGFzay1wYW5lbFwiLCBTZWxlY3RlZFRhc2tQYW5lbCk7XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBUYXNrLCBDaGFydCwgQ2hhcnRWYWxpZGF0ZSB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUm91bmRlciwgVGFza0R1cmF0aW9uIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzLnRzXCI7XG5cbi8qKiBTcGFuIHJlcHJlc2VudHMgd2hlbiBhIHRhc2sgd2lsbCBiZSBkb25lLCBpLmUuIGl0IGNvbnRhaW5zIHRoZSB0aW1lIHRoZSB0YXNrXG4gKiBpcyBleHBlY3RlZCB0byBiZWdpbiBhbmQgZW5kLiAqL1xuZXhwb3J0IGNsYXNzIFNwYW4ge1xuICBzdGFydDogbnVtYmVyO1xuICBmaW5pc2g6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihzdGFydDogbnVtYmVyID0gMCwgZmluaXNoOiBudW1iZXIgPSAwKSB7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMuZmluaXNoID0gZmluaXNoO1xuICB9XG59XG5cbi8qKiBUaGUgc3RhbmRhcmQgc2xhY2sgY2FsY3VsYXRpb24gdmFsdWVzLiAqL1xuZXhwb3J0IGNsYXNzIFNsYWNrIHtcbiAgZWFybHk6IFNwYW4gPSBuZXcgU3BhbigpO1xuICBsYXRlOiBTcGFuID0gbmV3IFNwYW4oKTtcbiAgc2xhY2s6IG51bWJlciA9IDA7XG59XG5cbmV4cG9ydCB0eXBlIFNsYWNrUmVzdWx0ID0gUmVzdWx0PFNsYWNrW10+O1xuXG4vLyBDYWxjdWxhdGUgdGhlIHNsYWNrIGZvciBlYWNoIFRhc2sgaW4gdGhlIENoYXJ0LlxuZXhwb3J0IGZ1bmN0aW9uIENvbXB1dGVTbGFjayhcbiAgYzogQ2hhcnQsXG4gIHRhc2tEdXJhdGlvbjogVGFza0R1cmF0aW9uIHwgbnVsbCA9IG51bGwsXG4gIHJvdW5kOiBSb3VuZGVyXG4pOiBTbGFja1Jlc3VsdCB7XG4gIGlmICh0YXNrRHVyYXRpb24gPT09IG51bGwpIHtcbiAgICB0YXNrRHVyYXRpb24gPSAodGFza0luZGV4OiBudW1iZXIpID0+IGMuVmVydGljZXNbdGFza0luZGV4XS5kdXJhdGlvbjtcbiAgfVxuXG4gIC8vIENyZWF0ZSBhIFNsYWNrIGZvciBlYWNoIFRhc2suXG4gIGNvbnN0IHNsYWNrczogU2xhY2tbXSA9IG5ldyBBcnJheShjLlZlcnRpY2VzLmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYy5WZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgIHNsYWNrc1tpXSA9IG5ldyBTbGFjaygpO1xuICB9XG5cbiAgY29uc3QgciA9IENoYXJ0VmFsaWRhdGUoYywgdGFza0R1cmF0aW9uKTtcbiAgaWYgKCFyLm9rKSB7XG4gICAgcmV0dXJuIGVycm9yKHIuZXJyb3IpO1xuICB9XG5cbiAgY29uc3QgZWRnZXMgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAoYy5FZGdlcyk7XG5cbiAgY29uc3QgdG9wb2xvZ2ljYWxPcmRlciA9IHIudmFsdWU7XG5cbiAgLy8gRmlyc3QgZ28gZm9yd2FyZCB0aHJvdWdoIHRoZSB0b3BvbG9naWNhbCBzb3J0IGFuZCBmaW5kIHRoZSBlYXJseSBzdGFydCBmb3JcbiAgLy8gZWFjaCB0YXNrLCB3aGljaCBpcyB0aGUgbWF4IG9mIGFsbCB0aGUgcHJlZGVjZXNzb3JzIGVhcmx5IGZpbmlzaCB2YWx1ZXMuXG4gIC8vIFNpbmNlIHdlIGtub3cgdGhlIGR1cmF0aW9uIHdlIGNhbiBhbHNvIGNvbXB1dGUgdGhlIGVhcmx5IGZpbmlzaC5cbiAgdG9wb2xvZ2ljYWxPcmRlci5zbGljZSgxKS5mb3JFYWNoKCh2ZXJ0ZXhJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzayA9IGMuVmVydGljZXNbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHNsYWNrID0gc2xhY2tzW3ZlcnRleEluZGV4XTtcbiAgICBzbGFjay5lYXJseS5zdGFydCA9IE1hdGgubWF4KFxuICAgICAgLi4uZWRnZXMuYnlEc3QuZ2V0KHZlcnRleEluZGV4KSEubWFwKChlOiBEaXJlY3RlZEVkZ2UpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBwcmVkZWNlc3NvclNsYWNrID0gc2xhY2tzW2UuaV07XG4gICAgICAgIHJldHVybiBwcmVkZWNlc3NvclNsYWNrLmVhcmx5LmZpbmlzaDtcbiAgICAgIH0pXG4gICAgKTtcbiAgICBzbGFjay5lYXJseS5maW5pc2ggPSByb3VuZChzbGFjay5lYXJseS5zdGFydCArIHRhc2tEdXJhdGlvbih2ZXJ0ZXhJbmRleCkpO1xuICB9KTtcblxuICAvLyBOb3cgYmFja3dhcmRzIHRocm91Z2ggdGhlIHRvcG9sb2dpY2FsIHNvcnQgYW5kIGZpbmQgdGhlIGxhdGUgZmluaXNoIG9mIGVhY2hcbiAgLy8gdGFzaywgd2hpY2ggaXMgdGhlIG1pbiBvZiBhbGwgdGhlIHN1Y2Nlc3NvciB0YXNrcyBsYXRlIHN0YXJ0cy4gQWdhaW4gc2luY2VcbiAgLy8gd2Uga25vdyB0aGUgZHVyYXRpb24gd2UgY2FuIGFsc28gY29tcHV0ZSB0aGUgbGF0ZSBzdGFydC4gRmluYWxseSwgc2luY2Ugd2VcbiAgLy8gbm93IGhhdmUgYWxsIHRoZSBlYXJseS9sYXRlIGFuZCBzdGFydC9maW5pc2ggdmFsdWVzIHdlIGNhbiBub3cgY2FsY3VhdGUgdGhlXG4gIC8vIHNsYWNrLlxuICB0b3BvbG9naWNhbE9yZGVyLnJldmVyc2UoKS5mb3JFYWNoKCh2ZXJ0ZXhJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzayA9IGMuVmVydGljZXNbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHNsYWNrID0gc2xhY2tzW3ZlcnRleEluZGV4XTtcbiAgICBjb25zdCBzdWNjZXNzb3JzID0gZWRnZXMuYnlTcmMuZ2V0KHZlcnRleEluZGV4KTtcbiAgICBpZiAoIXN1Y2Nlc3NvcnMpIHtcbiAgICAgIHNsYWNrLmxhdGUuZmluaXNoID0gc2xhY2suZWFybHkuZmluaXNoO1xuICAgICAgc2xhY2subGF0ZS5zdGFydCA9IHNsYWNrLmVhcmx5LnN0YXJ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBzbGFjay5sYXRlLmZpbmlzaCA9IE1hdGgubWluKFxuICAgICAgICAuLi5lZGdlcy5ieVNyYy5nZXQodmVydGV4SW5kZXgpIS5tYXAoKGU6IERpcmVjdGVkRWRnZSk6IG51bWJlciA9PiB7XG4gICAgICAgICAgY29uc3Qgc3VjY2Vzc29yU2xhY2sgPSBzbGFja3NbZS5qXTtcbiAgICAgICAgICByZXR1cm4gc3VjY2Vzc29yU2xhY2subGF0ZS5zdGFydDtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICBzbGFjay5sYXRlLnN0YXJ0ID0gcm91bmQoc2xhY2subGF0ZS5maW5pc2ggLSB0YXNrRHVyYXRpb24odmVydGV4SW5kZXgpKTtcbiAgICAgIHNsYWNrLnNsYWNrID0gcm91bmQoc2xhY2subGF0ZS5maW5pc2ggLSBzbGFjay5lYXJseS5maW5pc2gpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG9rKHNsYWNrcyk7XG59XG5cbmV4cG9ydCBjb25zdCBDcml0aWNhbFBhdGggPSAoc2xhY2tzOiBTbGFja1tdLCByb3VuZDogUm91bmRlcik6IG51bWJlcltdID0+IHtcbiAgY29uc3QgcmV0OiBudW1iZXJbXSA9IFtdO1xuICBzbGFja3MuZm9yRWFjaCgoc2xhY2s6IFNsYWNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKFxuICAgICAgcm91bmQoc2xhY2subGF0ZS5maW5pc2ggLSBzbGFjay5lYXJseS5maW5pc2gpIDwgTnVtYmVyLkVQU0lMT04gJiZcbiAgICAgIHJvdW5kKHNsYWNrLmVhcmx5LmZpbmlzaCAtIHNsYWNrLmVhcmx5LnN0YXJ0KSA+IE51bWJlci5FUFNJTE9OXG4gICAgKSB7XG4gICAgICByZXQucHVzaChpbmRleCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHsgQ2hhcnQsIFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnRcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuXCI7XG5pbXBvcnQgeyBQcmVjaXNpb24gfSBmcm9tIFwiLi4vcHJlY2lzaW9uL3ByZWNpc2lvblwiO1xuaW1wb3J0IHsgQ29tcHV0ZVNsYWNrLCBDcml0aWNhbFBhdGggfSBmcm9tIFwiLi4vc2xhY2svc2xhY2tcIjtcbmltcG9ydCB7IEphY29iaWFuLCBVbmNlcnRhaW50eSB9IGZyb20gXCIuLi9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhblwiO1xuXG5jb25zdCBNQVhfUkFORE9NID0gMTAwMDtcblxuY29uc3QgcHJlY2lzaW9uID0gbmV3IFByZWNpc2lvbigyKTtcblxuY29uc3Qgcm5kSW50ID0gKG46IG51bWJlcik6IG51bWJlciA9PiB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuKTtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3JpdGljYWxQYXRoRW50cnkge1xuICBjb3VudDogbnVtYmVyO1xuICBjcml0aWNhbFBhdGg6IG51bWJlcltdO1xuICBkdXJhdGlvbnM6IG51bWJlcltdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENyaXRpY2FsUGF0aFRhc2tFbnRyeSB7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuICBkdXJhdGlvbjogbnVtYmVyO1xuICBudW1UaW1lc0FwcGVhcmVkOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2ltdWxhdGlvblJlc3VsdHMge1xuICBwYXRoczogTWFwPHN0cmluZywgQ3JpdGljYWxQYXRoRW50cnk+O1xuICB0YXNrczogQ3JpdGljYWxQYXRoVGFza0VudHJ5W107XG59XG5cbi8qKlxuICogU2ltdWxhdGUgdGhlIHVuY2VydGFpbnR5IGluIHRoZSBwbGFuIGFuZCBnZW5lcmF0ZSBwb3NzaWJsZSBhbHRlcm5hdGUgY3JpdGljYWxcbiAqIHBhdGhzLlxuICovXG5leHBvcnQgY29uc3Qgc2ltdWxhdGlvbiA9IChcbiAgY2hhcnQ6IENoYXJ0LFxuICBudW1TaW11bGF0aW9uTG9vcHM6IG51bWJlclxuKTogU2ltdWxhdGlvblJlc3VsdHMgPT4ge1xuICAvLyBTaW11bGF0ZSB0aGUgdW5jZXJ0YWludHkgaW4gdGhlIHBsYW4gYW5kIGdlbmVyYXRlIHBvc3NpYmxlIGFsdGVybmF0ZVxuICAvLyBjcml0aWNhbCBwYXRocy5cblxuICBjb25zdCBhbGxDcml0aWNhbFBhdGhzID0gbmV3IE1hcDxzdHJpbmcsIENyaXRpY2FsUGF0aEVudHJ5PigpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtU2ltdWxhdGlvbkxvb3BzOyBpKyspIHtcbiAgICAvLyBHZW5lcmF0ZSByYW5kb20gZHVyYXRpb25zIGJhc2VkIG9uIGVhY2ggVGFza3MgdW5jZXJ0YWludHkuXG4gICAgY29uc3QgZHVyYXRpb25zID0gY2hhcnQuVmVydGljZXMubWFwKCh0OiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCByYXdEdXJhdGlvbiA9IG5ldyBKYWNvYmlhbihcbiAgICAgICAgdC5kdXJhdGlvbiwgLy8gQWNjZXB0YWJsZSBkaXJlY3QgYWNjZXNzIHRvIGR1cmF0aW9uLlxuICAgICAgICB0LmdldFJlc291cmNlKFwiVW5jZXJ0YWludHlcIikgYXMgVW5jZXJ0YWludHlcbiAgICAgICkuc2FtcGxlKHJuZEludChNQVhfUkFORE9NKSAvIE1BWF9SQU5ET00pO1xuICAgICAgcmV0dXJuIHByZWNpc2lvbi5yb3VuZChyYXdEdXJhdGlvbik7XG4gICAgfSk7XG5cbiAgICAvLyBDb21wdXRlIHRoZSBzbGFjayBiYXNlZCBvbiB0aG9zZSByYW5kb20gZHVyYXRpb25zLlxuICAgIGNvbnN0IHNsYWNrc1JldCA9IENvbXB1dGVTbGFjayhcbiAgICAgIGNoYXJ0LFxuICAgICAgKHRhc2tJbmRleDogbnVtYmVyKSA9PiBkdXJhdGlvbnNbdGFza0luZGV4XSxcbiAgICAgIHByZWNpc2lvbi5yb3VuZGVyKClcbiAgICApO1xuICAgIGlmICghc2xhY2tzUmV0Lm9rKSB7XG4gICAgICB0aHJvdyBzbGFja3NSZXQuZXJyb3I7XG4gICAgfVxuXG4gICAgY29uc3QgY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrc1JldC52YWx1ZSwgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG4gICAgY29uc3QgY3JpdGljYWxQYXRoQXNTdHJpbmcgPSBgJHtjcml0aWNhbFBhdGh9YDtcbiAgICBsZXQgcGF0aEVudHJ5ID0gYWxsQ3JpdGljYWxQYXRocy5nZXQoY3JpdGljYWxQYXRoQXNTdHJpbmcpO1xuICAgIGlmIChwYXRoRW50cnkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGF0aEVudHJ5ID0ge1xuICAgICAgICBjb3VudDogMCxcbiAgICAgICAgY3JpdGljYWxQYXRoOiBjcml0aWNhbFBhdGgsXG4gICAgICAgIGR1cmF0aW9uczogZHVyYXRpb25zLFxuICAgICAgfTtcbiAgICAgIGFsbENyaXRpY2FsUGF0aHMuc2V0KGNyaXRpY2FsUGF0aEFzU3RyaW5nLCBwYXRoRW50cnkpO1xuICAgIH1cbiAgICBwYXRoRW50cnkuY291bnQrKztcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGF0aHM6IGFsbENyaXRpY2FsUGF0aHMsXG4gICAgdGFza3M6IGNyaXRpY2FsVGFza0ZyZXF1ZW5jaWVzKGFsbENyaXRpY2FsUGF0aHMsIGNoYXJ0KSxcbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBjcml0aWNhbFRhc2tGcmVxdWVuY2llcyA9IChcbiAgYWxsQ3JpdGljYWxQYXRoczogTWFwPHN0cmluZywgQ3JpdGljYWxQYXRoRW50cnk+LFxuICBjaGFydDogQ2hhcnRcbik6IENyaXRpY2FsUGF0aFRhc2tFbnRyeVtdID0+IHtcbiAgY29uc3QgY3JpdGlhbFRhc2tzOiBNYXA8bnVtYmVyLCBDcml0aWNhbFBhdGhUYXNrRW50cnk+ID0gbmV3IE1hcCgpO1xuXG4gIGFsbENyaXRpY2FsUGF0aHMuZm9yRWFjaCgodmFsdWU6IENyaXRpY2FsUGF0aEVudHJ5KSA9PiB7XG4gICAgdmFsdWUuY3JpdGljYWxQYXRoLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBsZXQgdGFza0VudHJ5ID0gY3JpdGlhbFRhc2tzLmdldCh0YXNrSW5kZXgpO1xuICAgICAgaWYgKHRhc2tFbnRyeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhc2tFbnRyeSA9IHtcbiAgICAgICAgICB0YXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICAgICAgICBkdXJhdGlvbjogY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5kdXJhdGlvbixcbiAgICAgICAgICBudW1UaW1lc0FwcGVhcmVkOiAwLFxuICAgICAgICB9O1xuICAgICAgICBjcml0aWFsVGFza3Muc2V0KHRhc2tJbmRleCwgdGFza0VudHJ5KTtcbiAgICAgIH1cbiAgICAgIHRhc2tFbnRyeS5udW1UaW1lc0FwcGVhcmVkICs9IHZhbHVlLmNvdW50O1xuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gWy4uLmNyaXRpYWxUYXNrcy52YWx1ZXMoKV0uc29ydChcbiAgICAoYTogQ3JpdGljYWxQYXRoVGFza0VudHJ5LCBiOiBDcml0aWNhbFBhdGhUYXNrRW50cnkpOiBudW1iZXIgPT4ge1xuICAgICAgcmV0dXJuIGIuZHVyYXRpb24gLSBhLmR1cmF0aW9uO1xuICAgIH1cbiAgKTtcbn07XG4iLCAiaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW5cIjtcbmltcG9ydCB7XG4gIENyaXRpY2FsUGF0aEVudHJ5LFxuICBDcml0aWNhbFBhdGhUYXNrRW50cnksXG4gIFNpbXVsYXRpb25SZXN1bHRzLFxuICBzaW11bGF0aW9uLFxufSBmcm9tIFwiLi4vc2ltdWxhdGlvbi9zaW11bGF0aW9uXCI7XG5pbXBvcnQgeyBDaGFydCB9IGZyb20gXCIuLi9jaGFydC9jaGFydFwiO1xuaW1wb3J0IHsgZGlmZmVyZW5jZSB9IGZyb20gXCIuLi9kYWcvYWxnb3JpdGhtcy9jaXJjdWxhclwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNpbXVsYXRpb25TZWxlY3REZXRhaWxzIHtcbiAgZHVyYXRpb25zOiBudW1iZXJbXSB8IG51bGw7XG4gIGNyaXRpY2FsUGF0aDogbnVtYmVyW107XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJzaW11bGF0aW9uLXNlbGVjdFwiOiBDdXN0b21FdmVudDxTaW11bGF0aW9uU2VsZWN0RGV0YWlscz47XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNpbXVsYXRpb25QYW5lbCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgcmVzdWx0czogU2ltdWxhdGlvblJlc3VsdHMgPSB7XG4gICAgcGF0aHM6IG5ldyBNYXAoKSxcbiAgICB0YXNrczogW10sXG4gIH07XG4gIGNoYXJ0OiBDaGFydCB8IG51bGwgPSBudWxsO1xuICBudW1TaW11bGF0aW9uTG9vcHM6IG51bWJlciA9IDA7XG4gIG9yaWdpbmFsQ3JpdGljYWxQYXRoOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBzaW11bGF0ZShcbiAgICBjaGFydDogQ2hhcnQsXG4gICAgbnVtU2ltdWxhdGlvbkxvb3BzOiBudW1iZXIsXG4gICAgb3JpZ2luYWxDcml0aWNhbFBhdGg6IG51bWJlcltdXG4gICk6IG51bWJlcltdIHtcbiAgICB0aGlzLnJlc3VsdHMgPSBzaW11bGF0aW9uKGNoYXJ0LCBudW1TaW11bGF0aW9uTG9vcHMpO1xuICAgIHRoaXMuY2hhcnQgPSBjaGFydDtcbiAgICB0aGlzLm51bVNpbXVsYXRpb25Mb29wcyA9IG51bVNpbXVsYXRpb25Mb29wcztcbiAgICB0aGlzLm9yaWdpbmFsQ3JpdGljYWxQYXRoID0gb3JpZ2luYWxDcml0aWNhbFBhdGg7XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHJldHVybiB0aGlzLnJlc3VsdHMudGFza3MubWFwKFxuICAgICAgKHRhc2tFbnRyeTogQ3JpdGljYWxQYXRoVGFza0VudHJ5KSA9PiB0YXNrRW50cnkudGFza0luZGV4XG4gICAgKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMucmVzdWx0cyA9IHtcbiAgICAgIHBhdGhzOiBuZXcgTWFwKCksXG4gICAgICB0YXNrczogW10sXG4gICAgfTtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8U2ltdWxhdGlvblNlbGVjdERldGFpbHM+KFwic2ltdWxhdGlvbi1zZWxlY3RcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBkdXJhdGlvbnM6IG51bGwsXG4gICAgICAgICAgY3JpdGljYWxQYXRoOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcGF0aENsaWNrZWQoa2V5OiBzdHJpbmcpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8U2ltdWxhdGlvblNlbGVjdERldGFpbHM+KFwic2ltdWxhdGlvbi1zZWxlY3RcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBkdXJhdGlvbnM6IHRoaXMucmVzdWx0cy5wYXRocy5nZXQoa2V5KSEuZHVyYXRpb25zLFxuICAgICAgICAgIGNyaXRpY2FsUGF0aDogdGhpcy5yZXN1bHRzLnBhdGhzLmdldChrZXkpIS5jcml0aWNhbFBhdGgsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmVuZGVyKHRoaXMudGVtcGxhdGUoKSwgdGhpcyk7XG4gIH1cblxuICBkaXNwbGF5Q3JpdGljYWxQYXRoRGlmZmVyZW5jZXMoY3JpdGljYWxQYXRoOiBudW1iZXJbXSk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdCByZW1vdmVkID0gZGlmZmVyZW5jZSh0aGlzLm9yaWdpbmFsQ3JpdGljYWxQYXRoLCBjcml0aWNhbFBhdGgpO1xuICAgIGNvbnN0IGFkZGVkID0gZGlmZmVyZW5jZShjcml0aWNhbFBhdGgsIHRoaXMub3JpZ2luYWxDcml0aWNhbFBhdGgpO1xuICAgIHJldHVybiBodG1sYFxuICAgICAgJHthZGRlZC5tYXAoXG4gICAgICAgICh0YXNrSW5kZXg6IG51bWJlcikgPT4gaHRtbGBcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImFkZGVkXCI+KyR7dGhpcy5jaGFydCEuVmVydGljZXNbdGFza0luZGV4XS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgYFxuICAgICAgKX1cbiAgICAgICR7cmVtb3ZlZC5tYXAoXG4gICAgICAgICh0YXNrSW5kZXg6IG51bWJlcikgPT4gaHRtbGBcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInJlbW92ZWRcIj4tJHt0aGlzLmNoYXJ0IS5WZXJ0aWNlc1t0YXNrSW5kZXhdLm5hbWV9PC9zcGFuPlxuICAgICAgICBgXG4gICAgICApfVxuICAgIGA7XG4gIH1cblxuICB0ZW1wbGF0ZSgpOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgaWYgKHRoaXMucmVzdWx0cy5wYXRocy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gaHRtbGBgO1xuICAgIH1cbiAgICBjb25zdCBwYXRoS2V5cyA9IFsuLi50aGlzLnJlc3VsdHMucGF0aHMua2V5cygpXTtcbiAgICBjb25zdCBzb3J0ZWRQYXRoS2V5cyA9IHBhdGhLZXlzLnNvcnQoKGE6IHN0cmluZywgYjogc3RyaW5nKSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLnJlc3VsdHMucGF0aHMuZ2V0KGIpIS5jb3VudCAtIHRoaXMucmVzdWx0cy5wYXRocy5nZXQoYSkhLmNvdW50XG4gICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiBodG1sYFxuICAgICAgPGJ1dHRvblxuICAgICAgICBAY2xpY2s9JHsoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICBDbGVhclxuICAgICAgPC9idXR0b24+XG5cbiAgICAgIDx0YWJsZSBjbGFzcz1cInBhdGhzXCI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+Q291bnQ8L3RoPlxuICAgICAgICAgIDx0aD5Dcml0aWNhbCBQYXRoPC90aD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgJHtzb3J0ZWRQYXRoS2V5cy5tYXAoXG4gICAgICAgICAgKGtleTogc3RyaW5nKSA9PlxuICAgICAgICAgICAgaHRtbGA8dHIgQGNsaWNrPSR7KCkgPT4gdGhpcy5wYXRoQ2xpY2tlZChrZXkpfT5cbiAgICAgICAgICAgICAgPHRkPiR7dGhpcy5yZXN1bHRzLnBhdGhzLmdldChrZXkpIS5jb3VudH08L3RkPlxuICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgJHt0aGlzLmRpc3BsYXlDcml0aWNhbFBhdGhEaWZmZXJlbmNlcyhcbiAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0cy5wYXRocy5nZXQoa2V5KSEuY3JpdGljYWxQYXRoXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+YFxuICAgICAgICApfVxuICAgICAgPC90YWJsZT5cbiAgICAgIDx0YWJsZT5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgICAgICA8dGg+RHVyYXRpb248L3RoPlxuICAgICAgICAgIDx0aD5GcmVxdWVuY3kgKCUpPC90aD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgJHt0aGlzLnJlc3VsdHMudGFza3MubWFwKFxuICAgICAgICAgICh0YXNrRW50cnk6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSkgPT5cbiAgICAgICAgICAgIGh0bWxgPHRyPlxuICAgICAgICAgICAgICA8dGQ+JHt0aGlzLmNoYXJ0IS5WZXJ0aWNlc1t0YXNrRW50cnkudGFza0luZGV4XS5uYW1lfTwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD4ke3Rhc2tFbnRyeS5kdXJhdGlvbn08L3RkPlxuICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgJHtNYXRoLmZsb29yKFxuICAgICAgICAgICAgICAgICAgKDEwMCAqIHRhc2tFbnRyeS5udW1UaW1lc0FwcGVhcmVkKSAvIHRoaXMubnVtU2ltdWxhdGlvbkxvb3BzXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+YFxuICAgICAgICApfVxuICAgICAgPC90YWJsZT5cbiAgICBgO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcInNpbXVsYXRpb24tcGFuZWxcIiwgU2ltdWxhdGlvblBhbmVsKTtcbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpbi50c1wiO1xuaW1wb3J0IHsgU2VhcmNoVHlwZSwgVGFza1NlYXJjaENvbnRyb2wgfSBmcm9tIFwiLi90YXNrLXNlYXJjaC1jb250cm9scy50c1wiO1xuXG4vKiogVXNlcyBhIHRhc2stc2VhcmNoLWNvbnRyb2wgdG8gc2VhcmNoIHRocm91Z2ggYWxsIFRhc2tzLiAqL1xuZXhwb3J0IGNsYXNzIFNlYXJjaFRhc2tQYW5lbCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpbiB8IG51bGwgPSBudWxsO1xuICB0YXNrU2VhcmNoQ29udHJvbDogVGFza1NlYXJjaENvbnRyb2wgfCBudWxsID0gbnVsbDtcblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICB0aGlzLmV4cGxhbk1haW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZXhwbGFuLW1haW5cIik7XG4gICAgaWYgKCF0aGlzLmV4cGxhbk1haW4pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCA9IHRoaXMucXVlcnlTZWxlY3RvcihcInRhc2stc2VhcmNoLWNvbnRyb2xcIik7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwidGFzay1jaGFuZ2VcIiwgKGUpID0+XG4gICAgICB0aGlzLmV4cGxhbk1haW4hLnNldEZvY3VzT25UYXNrKGUuZGV0YWlsKVxuICAgICk7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwidGFzay1mb2N1c1wiLCAoZSkgPT5cbiAgICAgIHRoaXMuc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoXCJmdWxsLWluZm9cIilcbiAgICApO1xuICB9XG5cbiAgc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoc2VhcmNoVHlwZTogU2VhcmNoVHlwZSkge1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLnRhc2tzID0gdGhpcy5leHBsYW5NYWluIS5wbGFuLmNoYXJ0LlZlcnRpY2VzO1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLmluY2x1ZGVkSW5kZXhlcyA9IFtdO1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLnNldEtleWJvYXJkRm9jdXNUb0lucHV0KHNlYXJjaFR5cGUpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcInNlYXJjaC10YXNrLXBhbmVsXCIsIFNlYXJjaFRhc2tQYW5lbCk7XG4iLCAiaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IGZ1enp5c29ydCBmcm9tIFwiZnV6enlzb3J0XCI7XG5pbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJ0YXNrLWNoYW5nZVwiOiBDdXN0b21FdmVudDxudW1iZXI+O1xuICAgIFwidGFzay1mb2N1c1wiOiBDdXN0b21FdmVudDxudWxsPjtcbiAgfVxufVxuXG4vKiogVGhlIGluZGV4ZXMgcmV0dXJuZWQgYnkgZnV6enlzb3J0IGlzIGp1c3QgYSBsaXN0IG9mIHRoZSBpbmRleGVzIG9mIHRoZSB0aGVcbiAqICBpbmRpdmlkdWFsIGNoYXJzIHRoYXQgaGF2ZSBiZWVuIG1hdGNoZWQuIFdlIG5lZWQgdG8gdHVybiB0aGF0IGludG8gcGFpcnMgb2ZcbiAqICBudW1iZXJzIHdlIGNhbiBwYXNzIHRvIFN0cmluZy5wcm90b3R5cGUuc2xpY2UoKS5cbiAqXG4gKiAgVGhlIG9ic2VydmF0aW9uIGhlcmUgaXMgdGhhdCBpZiB0aGUgdGFyZ2V0IHN0cmluZyBpcyBcIkhlbGxvXCIgYW5kIHRoZSBpbmRpY2VzXG4gKiAgYXJlIFsyLDNdIHRoZW4gaXQgZG9lc24ndCBtYXR0ZXIgaWYgd2UgbWFya3VwIHRoZSBoaWdobGlnaHRlZCB0YXJnZXQgYXNcbiAqICBcIkhlPGI+bGw8L2I+b1wiIG9yIFwiSGU8Yj5sPC9iPjxiPmw8L2I+b1wiLiBUaGF0IGlzLCB3ZSBjYW4gc2ltcGxpZnkgaWYgd2VcbiAqICBhbHdheXMgc2xpY2Ugb3V0IGVhY2ggY2hhcmFjdGVyIGluIHRoZSB0YXJnZXQgc3RyaW5nIHRoYXQgbmVlZHMgdG8gYmVcbiAqICBoaWdobGlnaHRlZC5cbiAqXG4gKiAgU28gaW5kZXhlc1RvUmFuZ2VzIHJldHVybnMgYW4gYXJyYXkgb2YgaW5kZXhlcywgdGhhdCBpZiB0YWtlbiBpbiBwYWlycywgd2lsbFxuICogIGFsdGVybmF0ZWx5IHNsaWNlIG9mZiBwYXJ0cyBvZiB0YXJnZXQgdGhhdCBuZWVkIHRvIGJlIGVtcGhhc2l6ZWQuXG4gKlxuICogIEluIHRoZSBhYm92ZSBleGFtcGxlIHRhcmdldCA9IFwiSGVsbG9cIiBhbmQgaW5kZXhlcyA9IFsyLDNdLCB0aGVuXG4gKiAgaW5kZXhlc1RvUmFuZ2VzIHdpbGwgcmV0dXJuXCJcbiAqXG4gKiAgICAgWzAsMiwzLDMsNCw1XVxuICpcbiAqICB3aGljaCB3aWxsIGdlbmVyYXRlIHRoZSBmb2xsb3dpbmcgcGFpcnMgYXMgYXJncyB0byBzbGljZTpcbiAqXG4gKiAgICAgWzAsMl0gSGVcbiAqICAgICBbMiwzXSBsICAgI1xuICogICAgIFszLDNdXG4gKiAgICAgWzMsNF0gbCAgICNcbiAqICAgICBbNCw1XSBvXG4gKlxuICogTm90ZSB0aGF0IGlmIHdlIGFsdGVybmF0ZSBib2xkaW5nIHRoZW4gb25seSB0aGUgdHdvICdsJ3MgZ2V0IGVtcGhhc2l6ZWQsXG4gKiB3aGljaCBpcyB3aGF0IHdlIHdhbnQgKERlbm90ZWQgYnkgIyBhYm92ZSkuXG4gKi9cbmNvbnN0IGluZGV4ZXNUb1JhbmdlcyA9IChcbiAgaW5kZXhlczogUmVhZG9ubHk8bnVtYmVyW10+LFxuICBsZW46IG51bWJlclxuKTogbnVtYmVyW10gPT4ge1xuICAvLyBDb252ZXJ0IGVhY2ggaW5kZXggb2YgYSBoaWdobGlnaHRlZCBjaGFyIGludG8gYSBwYWlyIG9mIG51bWJlcnMgd2UgY2FuIHBhc3NcbiAgLy8gdG8gc2xpY2UsIGFuZCB0aGVuIGZsYXR0ZW4uXG4gIGNvbnN0IHJhbmdlcyA9IGluZGV4ZXMubWFwKCh4OiBudW1iZXIpID0+IFt4LCB4ICsgMV0pLmZsYXQoKTtcblxuICAvLyBOb3cgcHJlcGVuZCB3aXRoIDAgYW5kIGFwcGVuZCAnbGVuJyBzbyB0aGF0IHdlIGhhdmUgcGFpcnMgdGhhdCB3aWxsIHNsaWNlXG4gIC8vIHRhcmdldCBmdWxseSBpbnRvIHN1YnN0cmluZ3MuIFJlbWVtYmVyIHRoYXQgc2xpY2UgcmV0dXJuIGNoYXJzIGluIFthLCBiKSxcbiAgLy8gaS5lLiBTdHJpbmcuc2xpY2UoYSxiKSB3aGVyZSBiIGlzIG9uZSBiZXlvbmQgdGhlIGxhc3QgY2hhciBpbiB0aGUgc3RyaW5nIHdlXG4gIC8vIHdhbnQgdG8gaW5jbHVkZS5cbiAgcmV0dXJuIFswLCAuLi5yYW5nZXMsIGxlbl07XG59O1xuXG4vKiogUmV0dXJucyB0aGUgdGFyZ2V0IHN0cmluZyBoaWdobGlnaHRlZCBhcm91bmQgdGhlIGdpdmVuIGNoYXJhY3RlciBpbmRleGVzIGluXG4gKiAgdGhlIHJhbmdlcyBhcnJheS4gKi9cbmNvbnN0IGhpZ2hsaWdodCA9IChyYW5nZXM6IG51bWJlcltdLCB0YXJnZXQ6IHN0cmluZyk6IFRlbXBsYXRlUmVzdWx0W10gPT4ge1xuICBjb25zdCByZXQ6IFRlbXBsYXRlUmVzdWx0W10gPSBbXTtcbiAgbGV0IGluSGlnaGxpZ2h0ID0gZmFsc2U7XG5cbiAgLy8gUnVuIGRvd24gcmFuZ2VzIHdpdGggYSBzbGlkaW5nIHdpbmRvdyBvZiBsZW5ndGggMiBhbmQgdXNlIHRoYXQgYXMgdGhlXG4gIC8vIGFyZ3VtZW50cyB0byBzbGljZS4gQWx0ZXJuYXRlIGhpZ2hsaWdodGluZyBlYWNoIHNlZ21lbnQuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGNvbnN0IHN1YiA9IHRhcmdldC5zbGljZShyYW5nZXNbaV0sIHJhbmdlc1tpICsgMV0pO1xuICAgIGlmIChpbkhpZ2hsaWdodCkge1xuICAgICAgcmV0LnB1c2goaHRtbGA8Yj4ke3N1Yn08L2I+YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldC5wdXNoKGh0bWxgJHtzdWJ9YCk7XG4gICAgfVxuICAgIGluSGlnaGxpZ2h0ID0gIWluSGlnaGxpZ2h0O1xuICB9XG4gIHJldHVybiByZXQ7XG59O1xuXG4vKiogUmV0dXJucyB0aGUgdGFyZ2V0IHN0cmluZyBoaWdobGlnaHRlZCBhcm91bmQgdGhlIGdpdmVuIGNoYXJhY3RlciBpbmRleGVzLlxuICogIE5vdGUgdGhhdCB3ZSBkb24ndCB1c2UgZnV6enlzb3J0J3MgaGlnaGxpZ2h0IGJlY2F1c2Ugd2UgaGF2ZW4ndCBzYW5pdGl6ZWRcbiAqICB0aGUgbmFtZXMuXG4gKi9cbmNvbnN0IGhpZ2hsaWdodGVkVGFyZ2V0ID0gKFxuICBpbmRleGVzOiBSZWFkb25seTxudW1iZXJbXT4sXG4gIHRhcmdldDogc3RyaW5nXG4pOiBUZW1wbGF0ZVJlc3VsdFtdID0+IHtcbiAgcmV0dXJuIGhpZ2hsaWdodChpbmRleGVzVG9SYW5nZXMoaW5kZXhlcywgdGFyZ2V0Lmxlbmd0aCksIHRhcmdldCk7XG59O1xuXG5jb25zdCB0ZW1wbGF0ZSA9IChzZWFyY2hUYXNrUGFuZWw6IFRhc2tTZWFyY2hDb250cm9sKSA9PiBodG1sYFxuICA8aW5wdXRcbiAgICB0eXBlPVwidGV4dFwiXG4gICAgQGlucHV0PVwiJHsoZTogSW5wdXRFdmVudCkgPT4gc2VhcmNoVGFza1BhbmVsLm9uSW5wdXQoZSl9XCJcbiAgICBAa2V5ZG93bj1cIiR7KGU6IEtleWJvYXJkRXZlbnQpID0+IHNlYXJjaFRhc2tQYW5lbC5vbktleURvd24oZSl9XCJcbiAgICBAYmx1cj1cIiR7KCkgPT4gc2VhcmNoVGFza1BhbmVsLmxvc3NPZkZvY3VzKCl9XCJcbiAgICBAZm9jdXM9XCIkeygpID0+IHNlYXJjaFRhc2tQYW5lbC5zZWFyY2hJbnB1dFJlY2VpdmVkRm9jdXMoKX1cIlxuICAvPlxuICA8dWw+XG4gICAgJHtzZWFyY2hUYXNrUGFuZWwuc2VhcmNoUmVzdWx0cy5tYXAoXG4gICAgICAodGFzazogRnV6enlzb3J0LktleVJlc3VsdDxUYXNrPiwgaW5kZXg6IG51bWJlcikgPT5cbiAgICAgICAgaHRtbGAgPGxpXG4gICAgICAgICAgQGNsaWNrPVwiJHsoKSA9PiBzZWFyY2hUYXNrUGFuZWwuc2VsZWN0U2VhcmNoUmVzdWx0KGluZGV4KX1cIlxuICAgICAgICAgID9kYXRhLWZvY3VzPSR7aW5kZXggPT09IHNlYXJjaFRhc2tQYW5lbC5mb2N1c0luZGV4fVxuICAgICAgICA+XG4gICAgICAgICAgJHtoaWdobGlnaHRlZFRhcmdldCh0YXNrLmluZGV4ZXMsIHRhc2sudGFyZ2V0KX1cbiAgICAgICAgPC9saT5gXG4gICAgKX1cbiAgPC91bD5cbmA7XG5cbmV4cG9ydCB0eXBlIFNlYXJjaFR5cGUgPSBcIm5hbWUtb25seVwiIHwgXCJmdWxsLWluZm9cIjtcblxuY29uc3Qgc2VhcmNoU3RyaW5nRnJvbVRhc2tCdWlsZGVyID0gKFxuICBmdWxsVGFza0xpc3Q6IFRhc2tbXSxcbiAgc2VhcmNoVHlwZTogU2VhcmNoVHlwZSxcbiAgaW5jbHVkZWRJbmRleGVzOiBTZXQ8bnVtYmVyPixcbiAgbWF4TmFtZUxlbmd0aDogbnVtYmVyXG4pOiAoKHRhc2s6IFRhc2spID0+IHN0cmluZykgPT4ge1xuICBpZiAoc2VhcmNoVHlwZSA9PT0gXCJmdWxsLWluZm9cIikge1xuICAgIHJldHVybiAodGFzazogVGFzayk6IHN0cmluZyA9PiB7XG4gICAgICBpZiAoaW5jbHVkZWRJbmRleGVzLnNpemUgIT09IDApIHtcbiAgICAgICAgY29uc3QgdGFza0luZGV4ID0gZnVsbFRhc2tMaXN0LmluZGV4T2YodGFzayk7XG4gICAgICAgIGlmICghaW5jbHVkZWRJbmRleGVzLmhhcyh0YXNrSW5kZXgpKSB7XG4gICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHRhc2sucmVzb3VyY2VzKTtcbiAgICAgIHJlc291cmNlS2V5cy5zb3J0KCk7XG4gICAgICByZXR1cm4gYCR7dGFzay5uYW1lfSAke1wiLVwiLnJlcGVhdChtYXhOYW1lTGVuZ3RoIC0gdGFzay5uYW1lLmxlbmd0aCArIDIpfSAke3Jlc291cmNlS2V5c1xuICAgICAgICAubWFwKChrZXk6IHN0cmluZykgPT4gdGFzay5yZXNvdXJjZXNba2V5XSlcbiAgICAgICAgLmpvaW4oXCIgXCIpfWA7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKHRhc2s6IFRhc2spOiBzdHJpbmcgPT4ge1xuICAgICAgaWYgKGluY2x1ZGVkSW5kZXhlcy5zaXplICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IHRhc2tJbmRleCA9IGZ1bGxUYXNrTGlzdC5pbmRleE9mKHRhc2spO1xuICAgICAgICBpZiAoIWluY2x1ZGVkSW5kZXhlcy5oYXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGFzay5uYW1lO1xuICAgIH07XG4gIH1cbn07XG5cbmV4cG9ydCBjbGFzcyBUYXNrU2VhcmNoQ29udHJvbCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgX3Rhc2tzOiBUYXNrW10gPSBbXTtcbiAgX2luY2x1ZGVkSW5kZXhlczogU2V0PG51bWJlcj4gPSBuZXcgU2V0KCk7XG4gIGZvY3VzSW5kZXg6IG51bWJlciA9IDA7XG4gIHNlYXJjaFJlc3VsdHM6IEZ1enp5c29ydC5LZXlSZXN1bHRzPFRhc2s+IHwgW10gPSBbXTtcbiAgc2VhcmNoVHlwZTogU2VhcmNoVHlwZSA9IFwibmFtZS1vbmx5XCI7XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIG9uSW5wdXQoZTogSW5wdXRFdmVudCkge1xuICAgIGNvbnN0IG1heE5hbWVMZW5ndGggPSB0aGlzLl90YXNrcy5yZWR1Y2U8bnVtYmVyPihcbiAgICAgIChwcmV2OiBudW1iZXIsIHRhc2s6IFRhc2spOiBudW1iZXIgPT5cbiAgICAgICAgdGFzay5uYW1lLmxlbmd0aCA+IHByZXYgPyB0YXNrLm5hbWUubGVuZ3RoIDogcHJldixcbiAgICAgIDBcbiAgICApO1xuICAgIHRoaXMuc2VhcmNoUmVzdWx0cyA9IGZ1enp5c29ydC5nbzxUYXNrPihcbiAgICAgIChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSxcbiAgICAgIHRoaXMuX3Rhc2tzLnNsaWNlKDEsIC0xKSwgLy8gUmVtb3ZlIFN0YXJ0IGFuZCBGaW5pc2ggZnJvbSBzZWFyY2ggcmFuZ2UuXG4gICAgICB7XG4gICAgICAgIGtleTogc2VhcmNoU3RyaW5nRnJvbVRhc2tCdWlsZGVyKFxuICAgICAgICAgIHRoaXMuX3Rhc2tzLFxuICAgICAgICAgIHRoaXMuc2VhcmNoVHlwZSxcbiAgICAgICAgICB0aGlzLl9pbmNsdWRlZEluZGV4ZXMsXG4gICAgICAgICAgbWF4TmFtZUxlbmd0aFxuICAgICAgICApLFxuICAgICAgICBsaW1pdDogMTUsXG4gICAgICAgIHRocmVzaG9sZDogMC4yLFxuICAgICAgfVxuICAgICk7XG4gICAgdGhpcy5mb2N1c0luZGV4ID0gMDtcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgb25LZXlEb3duKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAodGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUT0RPIC0gZXh0cmFjdCBmcm9tIHRoZSB0d28gcGxhY2VzIHdlIGRvIHRoaXMuXG4gICAgY29uc3Qga2V5bmFtZSA9IGAke2Uuc2hpZnRLZXkgPyBcInNoaWZ0LVwiIDogXCJcIn0ke2UuY3RybEtleSA/IFwiY3RybC1cIiA6IFwiXCJ9JHtlLm1ldGFLZXkgPyBcIm1ldGEtXCIgOiBcIlwifSR7ZS5hbHRLZXkgPyBcImFsdC1cIiA6IFwiXCJ9JHtlLmtleX1gO1xuICAgIHN3aXRjaCAoa2V5bmFtZSkge1xuICAgICAgY2FzZSBcIkFycm93RG93blwiOlxuICAgICAgICB0aGlzLmZvY3VzSW5kZXggPSAodGhpcy5mb2N1c0luZGV4ICsgMSkgJSB0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93VXBcIjpcbiAgICAgICAgdGhpcy5mb2N1c0luZGV4ID1cbiAgICAgICAgICAodGhpcy5mb2N1c0luZGV4IC0gMSArIHRoaXMuc2VhcmNoUmVzdWx0cy5sZW5ndGgpICVcbiAgICAgICAgICB0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkVudGVyXCI6XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VsZWN0U2VhcmNoUmVzdWx0KHRoaXMuZm9jdXNJbmRleCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgc2VsZWN0U2VhcmNoUmVzdWx0KGluZGV4OiBudW1iZXIpIHtcbiAgICBjb25zdCB0YXNrSW5kZXggPSB0aGlzLl90YXNrcy5pbmRleE9mKHRoaXMuc2VhcmNoUmVzdWx0c1tpbmRleF0ub2JqKTtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8bnVtYmVyPihcInRhc2stY2hhbmdlXCIsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgZGV0YWlsOiB0YXNrSW5kZXgsXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gW107XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIHNlYXJjaElucHV0UmVjZWl2ZWRGb2N1cygpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8bnVtYmVyPihcInRhc2stZm9jdXNcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoc2VhcmNoVHlwZTogU2VhcmNoVHlwZSkge1xuICAgIHRoaXMuc2VhcmNoVHlwZSA9IHNlYXJjaFR5cGU7XG4gICAgY29uc3QgaW5wdXRDb250cm9sID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiaW5wdXRcIikhO1xuICAgIGlucHV0Q29udHJvbC5mb2N1cygpO1xuICAgIGlucHV0Q29udHJvbC5zZWxlY3QoKTtcbiAgfVxuXG4gIGxvc3NPZkZvY3VzKCkge1xuICAgIHRoaXMuc2VhcmNoUmVzdWx0cyA9IFtdO1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBwdWJsaWMgc2V0IHRhc2tzKHRhc2tzOiBUYXNrW10pIHtcbiAgICB0aGlzLl90YXNrcyA9IHRhc2tzO1xuICB9XG5cbiAgcHVibGljIHNldCBpbmNsdWRlZEluZGV4ZXModjogbnVtYmVyW10pIHtcbiAgICB0aGlzLl9pbmNsdWRlZEluZGV4ZXMgPSBuZXcgU2V0KHYpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcInRhc2stc2VhcmNoLWNvbnRyb2xcIiwgVGFza1NlYXJjaENvbnRyb2wpO1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcblxuZXhwb3J0IHR5cGUgRGVwVHlwZSA9IFwicHJlZFwiIHwgXCJzdWNjXCI7XG5cbmV4cG9ydCBjb25zdCBkZXBEaXNwbGF5TmFtZTogUmVjb3JkPERlcFR5cGUsIHN0cmluZz4gPSB7XG4gIHByZWQ6IFwiUHJlZGVjZXNzb3JzXCIsXG4gIHN1Y2M6IFwiU3VjY2Vzc29yc1wiLFxufTtcblxuaW50ZXJmYWNlIERlcGVuZW5jeUV2ZW50IHtcbiAgdGFza0luZGV4OiBudW1iZXI7XG4gIGRlcFR5cGU6IERlcFR5cGU7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJkZWxldGUtZGVwZW5kZW5jeVwiOiBDdXN0b21FdmVudDxEZXBlbmVuY3lFdmVudD47XG4gICAgXCJhZGQtZGVwZW5kZW5jeVwiOiBDdXN0b21FdmVudDxEZXBlbmVuY3lFdmVudD47XG4gIH1cbn1cblxuY29uc3Qga2luZFRlbXBsYXRlID0gKFxuICBkZXBlbmRlbmNpZXNDb250cm9sOiBEZXBlbmRlbmNpZXNQYW5lbCxcbiAgZGVwVHlwZTogRGVwVHlwZSxcbiAgaW5kZXhlczogbnVtYmVyW11cbik6IFRlbXBsYXRlUmVzdWx0ID0+IGh0bWxgXG4gIDx0cj5cbiAgICA8dGg+JHtkZXBEaXNwbGF5TmFtZVtkZXBUeXBlXX08L3RoPlxuICAgIDx0aD48L3RoPlxuICA8L3RyPlxuICAke2luZGV4ZXMubWFwKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSBkZXBlbmRlbmNpZXNDb250cm9sLnRhc2tzW3Rhc2tJbmRleF07XG4gICAgcmV0dXJuIGh0bWxgPHRyPlxuICAgICAgPHRkPiR7dGFzay5uYW1lfTwvdGQ+XG4gICAgICA8dGQ+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzcz1cImRlbGV0ZVwiXG4gICAgICAgICAgdGl0bGU9XCJEZWxldGUgdGhlIGRlcGVuZGVuY3kgb24gJHt0YXNrLm5hbWV9XCJcbiAgICAgICAgICBAY2xpY2s9JHsoKSA9PiBkZXBlbmRlbmNpZXNDb250cm9sLmRlbGV0ZURlcCh0YXNrSW5kZXgsIGRlcFR5cGUpfVxuICAgICAgICA+XG4gICAgICAgICAgXHUyNzE3XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC90ZD5cbiAgICA8L3RyPmA7XG4gIH0pfVxuICA8dHI+XG4gICAgPHRkPjwvdGQ+XG4gICAgPHRkPlxuICAgICAgPGJ1dHRvblxuICAgICAgICBAY2xpY2s9JHsoKSA9PiBkZXBlbmRlbmNpZXNDb250cm9sLmFkZERlcChkZXBUeXBlKX1cbiAgICAgICAgdGl0bGU9XCJBZGQgZGVwZW5kZW5jeS5cIlxuICAgICAgPlxuICAgICAgICArXG4gICAgICA8L2J1dHRvbj5cbiAgICA8L3RkPlxuICA8L3RyPlxuYDtcblxuY29uc3QgdGVtcGxhdGUgPSAoXG4gIGRlcGVuZGVuY2llc0NvbnRyb2w6IERlcGVuZGVuY2llc1BhbmVsXG4pOiBUZW1wbGF0ZVJlc3VsdCA9PiBodG1sYFxuICA8dGFibGU+XG4gICAgJHtraW5kVGVtcGxhdGUoXG4gICAgICBkZXBlbmRlbmNpZXNDb250cm9sLFxuICAgICAgXCJwcmVkXCIsXG4gICAgICBkZXBlbmRlbmNpZXNDb250cm9sLnByZWRJbmRleGVzXG4gICAgKX1cbiAgICAke2tpbmRUZW1wbGF0ZShcbiAgICAgIGRlcGVuZGVuY2llc0NvbnRyb2wsXG4gICAgICBcInN1Y2NcIixcbiAgICAgIGRlcGVuZGVuY2llc0NvbnRyb2wuc3VjY0luZGV4ZXNcbiAgICApfVxuICA8L3RhYmxlPlxuYDtcblxuZXhwb3J0IGNsYXNzIERlcGVuZGVuY2llc1BhbmVsIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICB0YXNrczogVGFza1tdID0gW107XG4gIHByZWRJbmRleGVzOiBudW1iZXJbXSA9IFtdO1xuICBzdWNjSW5kZXhlczogbnVtYmVyW10gPSBbXTtcblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgcHVibGljIHNldFRhc2tzQW5kSW5kaWNlcyhcbiAgICB0YXNrczogVGFza1tdLFxuICAgIHByZWRJbmRleGVzOiBudW1iZXJbXSxcbiAgICBzdWNjSW5kZXhlczogbnVtYmVyW11cbiAgKSB7XG4gICAgdGhpcy50YXNrcyA9IHRhc2tzO1xuICAgIHRoaXMucHJlZEluZGV4ZXMgPSBwcmVkSW5kZXhlcztcbiAgICB0aGlzLnN1Y2NJbmRleGVzID0gc3VjY0luZGV4ZXM7XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVEZXAodGFza0luZGV4OiBudW1iZXIsIGRlcFR5cGU6IERlcFR5cGUpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJkZWxldGUtZGVwZW5kZW5jeVwiLCB7XG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgIGRlcFR5cGU6IGRlcFR5cGUsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgYWRkRGVwKGRlcFR5cGU6IERlcFR5cGUpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJhZGQtZGVwZW5kZW5jeVwiLCB7XG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgIHRhc2tJbmRleDogLTEsXG4gICAgICAgICAgZGVwVHlwZTogZGVwVHlwZSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJkZXBlbmRlbmNpZXMtcGFuZWxcIiwgRGVwZW5kZW5jaWVzUGFuZWwpO1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IE9wLCBTdWJPcCwgU3ViT3BSZXN1bHQgfSBmcm9tIFwiLi9vcHMudHNcIjtcbmltcG9ydCB7XG4gIERFRkFVTFRfUkVTT1VSQ0VfVkFMVUUsXG4gIFJlc291cmNlRGVmaW5pdGlvbixcbn0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcblxuZXhwb3J0IGNsYXNzIEFkZFJlc291cmNlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gIHRhc2tSZXNvdXJjZVZhbHVlczogTWFwPG51bWJlciwgc3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdGFza1Jlc291cmNlVmFsdWVzOiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gbmV3IE1hcDxudW1iZXIsIHN0cmluZz4oKSAvLyBTaG91bGQgb25seSBiZSBzdXBwbGllZCBieSBpbnZlcnNlIGFjdGlvbnMuXG4gICkge1xuICAgIHRoaXMua2V5ID0gbmFtZTtcbiAgICB0aGlzLnRhc2tSZXNvdXJjZVZhbHVlcyA9IHRhc2tSZXNvdXJjZVZhbHVlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBhbHJlYWR5IGV4aXN0cyBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXksIG5ldyBSZXNvdXJjZURlZmluaXRpb24oKSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGFkZCB0aGlzIGtleSBhbmQgc2V0IGl0IHRvIHRoZSBkZWZhdWx0LCB1bmxlc3NcbiAgICAvLyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrUmVzb3VyY2VWYWx1ZXMsIGluIHdoaWNoIGNhc2Ugd2Ugd2lsbCB1c2UgdGhhdCB2YWx1ZS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIHRhc2suc2V0UmVzb3VyY2UoXG4gICAgICAgIHRoaXMua2V5LFxuICAgICAgICB0aGlzLnRhc2tSZXNvdXJjZVZhbHVlcy5nZXQoaW5kZXgpIHx8IERFRkFVTFRfUkVTT1VSQ0VfVkFMVUVcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlUmVzb3VyY2VTdXBPcCh0aGlzLmtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVJlc291cmNlU3VwT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMua2V5ID0gbmFtZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHJlc291cmNlRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYFRoZSByZXNvdXJjZSB3aXRoIG5hbWUgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYW5kIGNhbid0IGJlIGRlbGV0ZWQuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZnJvbSByZXNvdXJjZSBkZWZpbml0aW9ucy5cbiAgICBwbGFuLmRlbGV0ZU1ldHJpY0RlZmluaXRpb24odGhpcy5rZXkpO1xuXG4gICAgY29uc3QgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZTogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXAoKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgcmVtb3ZlIGB0aGlzLmtleWAgZnJvbSB0aGUgcmVzb3VyY2VzIHdoaWxlIGFsc29cbiAgICAvLyBidWlsZGluZyB1cCB0aGUgaW5mbyBuZWVkZWQgZm9yIGEgcmV2ZXJ0LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFO1xuICAgICAgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZS5zZXQoaW5kZXgsIHZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlUmVzb3VyY2UodGhpcy5rZXkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UodGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZSksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoXG4gICAgcmVzb3VyY2VWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VLZXk6IE1hcDxudW1iZXIsIHN0cmluZz5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkUmVzb3VyY2VTdWJPcCh0aGlzLmtleSwgcmVzb3VyY2VWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VLZXkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW10gLy8gVGhpcyBzaG91bGQgb25seSBiZSBzdXBwbGllZCB3aGVuIGJlaW5nIGNvbnN0cnVjdGVkIGFzIGEgaW52ZXJzZSBvcGVyYXRpb24uXG4gICkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UgPSBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXNuJ3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cbiAgICBjb25zdCBleGlzdGluZ0luZGV4ID0gZGVmaW5pdGlvbi52YWx1ZXMuZmluZEluZGV4KFxuICAgICAgKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlID09PSB0aGlzLnZhbHVlXG4gICAgKTtcbiAgICBpZiAoZXhpc3RpbmdJbmRleCAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy52YWx1ZX0gYWxyZWFkeSBleGlzdHMgYXMgYSB2YWx1ZSBpbiB0aGUgUmVzb3VyY2UgJHt0aGlzLmtleX0uYFxuICAgICAgKTtcbiAgICB9XG4gICAgZGVmaW5pdGlvbi52YWx1ZXMucHVzaCh0aGlzLnZhbHVlKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgc2V0IHRoZSB2YWx1ZSBmb3IgdGhlIGdpdmVuIGtleSBmb3IgYWxsIHRoZVxuICAgIC8vIHRhc2tzIGxpc3RlZCBpbiBgaW5kaWNlc09mVGFza3NUb0NoYW5nZWAuXG4gICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uc2V0UmVzb3VyY2UodGhpcy5rZXksIHRoaXMudmFsdWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy52YWx1ZSxcbiAgICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW11cbiAgKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZSA9IGluZGljZXNPZlRhc2tzVG9DaGFuZ2U7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lc24ndCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlSW5kZXggPSBkZWZpbml0aW9uLnZhbHVlcy5maW5kSW5kZXgoXG4gICAgICAodmFsdWU6IHN0cmluZykgPT4gdmFsdWUgPT09IHRoaXMudmFsdWVcbiAgICApO1xuICAgIGlmICh2YWx1ZUluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLnZhbHVlfSBkb2VzIG5vdCBleGlzdCBhcyBhIHZhbHVlIGluIHRoZSBSZXNvdXJjZSAke3RoaXMua2V5fS5gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBSZXNvdXJjZXMgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSB2YWx1ZS4gJHt0aGlzLnZhbHVlfSBvbmx5IGhhcyBvbmUgdmFsdWUsIHNvIGl0IGNhbid0IGJlIGRlbGV0ZWQuIGBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZGVmaW5pdGlvbi52YWx1ZXMuc3BsaWNlKHZhbHVlSW5kZXgsIDEpO1xuXG4gICAgLy8gTm93IGl0ZXJhdGUgdGhvdWdoIGFsbCB0aGUgdGFza3MgYW5kIGNoYW5nZSBhbGwgdGFza3MgdGhhdCBoYXZlXG4gICAgLy8gXCJrZXk6dmFsdWVcIiB0byBpbnN0ZWFkIGJlIFwia2V5OmRlZmF1bHRcIi4gUmVjb3JkIHdoaWNoIHRhc2tzIGdvdCBjaGFuZ2VkXG4gICAgLy8gc28gdGhhdCB3ZSBjYW4gdXNlIHRoYXQgaW5mb3JtYXRpb24gd2hlbiB3ZSBjcmVhdGUgdGhlIGludmVydCBvcGVyYXRpb24uXG5cbiAgICBjb25zdCBpbmRpY2VzT2ZUYXNrc1dpdGhNYXRjaGluZ1Jlc291cmNlVmFsdWVzOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCByZXNvdXJjZVZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSk7XG4gICAgICBpZiAocmVzb3VyY2VWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gU2luY2UgdGhlIHZhbHVlIGlzIG5vIGxvbmdlciB2YWxpZCB3ZSBjaGFuZ2UgaXQgYmFjayB0byB0aGUgZGVmYXVsdC5cbiAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5rZXksIGRlZmluaXRpb24udmFsdWVzWzBdKTtcblxuICAgICAgLy8gUmVjb3JkIHdoaWNoIHRhc2sgd2UganVzdCBjaGFuZ2VkLlxuICAgICAgaW5kaWNlc09mVGFza3NXaXRoTWF0Y2hpbmdSZXNvdXJjZVZhbHVlcy5wdXNoKGluZGV4KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKGluZGljZXNPZlRhc2tzV2l0aE1hdGNoaW5nUmVzb3VyY2VWYWx1ZXMpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy52YWx1ZSxcbiAgICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2VcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVSZXNvdXJjZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBvbGRLZXk6IHN0cmluZztcbiAgbmV3S2V5OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob2xkS2V5OiBzdHJpbmcsIG5ld0tleTogc3RyaW5nKSB7XG4gICAgdGhpcy5vbGRLZXkgPSBvbGRLZXk7XG4gICAgdGhpcy5uZXdLZXkgPSBuZXdLZXk7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBvbGREZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5vbGRLZXkpO1xuICAgIGlmIChvbGREZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm9sZEtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIC8vIENvbmZpcm0gdGhlIG5ld0tleSBpcyBub3QgYWxyZWFkeSB1c2VkLlxuICAgIGNvbnN0IG5ld0tleURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLm5ld0tleSk7XG4gICAgaWYgKG5ld0tleURlZmluaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmV3S2V5fSBhbHJlYWR5IGV4aXN0cyBhcyBhIHJlc291cmNlIG5hbWUuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5kZWxldGVSZXNvdXJjZURlZmluaXRpb24odGhpcy5vbGRLZXkpO1xuICAgIHBsYW4uc2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMubmV3S2V5LCBvbGREZWZpbml0aW9uKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgY2hhbmdlIG9sZEtleSAtPiBuZXdrZXkgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPVxuICAgICAgICB0YXNrLmdldFJlc291cmNlKHRoaXMub2xkS2V5KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFO1xuICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLm5ld0tleSwgY3VycmVudFZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlUmVzb3VyY2UodGhpcy5vbGRLZXkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZVJlc291cmNlU3ViT3AodGhpcy5uZXdLZXksIHRoaXMub2xkS2V5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIG9sZFZhbHVlOiBzdHJpbmc7XG4gIG5ld1ZhbHVlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcsIG5ld1ZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLm9sZFZhbHVlID0gb2xkVmFsdWU7XG4gICAgdGhpcy5uZXdWYWx1ZSA9IG5ld1ZhbHVlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZm91bmRNYXRjaCA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZm91bmRNYXRjaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBvbGRWYWx1ZSBpcyBpbiB0aGVyZS5cbiAgICBjb25zdCBvbGRWYWx1ZUluZGV4ID0gZm91bmRNYXRjaC52YWx1ZXMuaW5kZXhPZih0aGlzLm9sZFZhbHVlKTtcblxuICAgIGlmIChvbGRWYWx1ZUluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBhIHZhbHVlICR7dGhpcy5vbGRWYWx1ZX1gKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBuZXdWYWx1ZSBpcyBub3QgaW4gdGhlcmUuXG4gICAgY29uc3QgbmV3VmFsdWVJbmRleCA9IGZvdW5kTWF0Y2gudmFsdWVzLmluZGV4T2YodGhpcy5uZXdWYWx1ZSk7XG4gICAgaWYgKG5ld1ZhbHVlSW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGFscmVhZHkgaGFzIGEgdmFsdWUgJHt0aGlzLm5ld1ZhbHVlfWApO1xuICAgIH1cblxuICAgIC8vIFN3YXAgdGhlIHZhbHVlcy5cbiAgICBmb3VuZE1hdGNoLnZhbHVlcy5zcGxpY2Uob2xkVmFsdWVJbmRleCwgMSwgdGhpcy5uZXdWYWx1ZSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGNoYW5nZSBvbGRWYWx1ZSAtPiBuZXdWYWx1ZSBmb3IgdGhlIGdpdmVuIHJlc291cmNlIGtleS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpO1xuICAgICAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gdGhpcy5vbGRWYWx1ZSkge1xuICAgICAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLm5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW5hbWVSZXNvdXJjZU9wdGlvblN1Yk9wKFxuICAgICAgdGhpcy5rZXksXG4gICAgICB0aGlzLm5ld1ZhbHVlLFxuICAgICAgdGhpcy5vbGRWYWx1ZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgb2xkSW5kZXg6IG51bWJlcjtcbiAgbmV3SW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgb2xkVmFsdWU6IG51bWJlciwgbmV3VmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMub2xkSW5kZXggPSBvbGRWYWx1ZTtcbiAgICB0aGlzLm5ld0luZGV4ID0gbmV3VmFsdWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9sZEluZGV4ID4gZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIGF0IGluZGV4ICR7dGhpcy5vbGRJbmRleH1gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy5uZXdJbmRleCA+IGRlZmluaXRpb24udmFsdWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy5rZXl9IGRvZXMgbm90IGhhdmUgYSB2YWx1ZSBhdCBpbmRleCAke3RoaXMubmV3SW5kZXh9YFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHRoZSB2YWx1ZXMuXG4gICAgY29uc3QgdG1wID0gZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5vbGRJbmRleF07XG4gICAgZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5vbGRJbmRleF0gPSBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm5ld0luZGV4XTtcbiAgICBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm5ld0luZGV4XSA9IHRtcDtcblxuICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgd2l0aCBUYXNrcyBiZWNhdXNlIHRoZSBpbmRleCBvZiBhIHZhbHVlIGlzXG4gICAgLy8gaXJyZWxldmFudCBzaW5jZSB3ZSBzdG9yZSB0aGUgdmFsdWUgaXRzZWxmLCBub3QgdGhlIGluZGV4LlxuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wKHRoaXMua2V5LCB0aGlzLm5ld0luZGV4LCB0aGlzLm9sZEluZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgdGFza0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHRhc2tJbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZm91bmRNYXRjaCA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZm91bmRNYXRjaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICBjb25zdCBmb3VuZFZhbHVlTWF0Y2ggPSBmb3VuZE1hdGNoLnZhbHVlcy5maW5kSW5kZXgoKHY6IHN0cmluZykgPT4ge1xuICAgICAgcmV0dXJuIHYgPT09IHRoaXMudmFsdWU7XG4gICAgfSk7XG4gICAgaWYgKGZvdW5kVmFsdWVNYXRjaCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIG9mICR7dGhpcy52YWx1ZX1gKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGFza0luZGV4IDwgMCB8fCB0aGlzLnRhc2tJbmRleCA+PSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGVycm9yKGBUaGVyZSBpcyBubyBUYXNrIGF0IGluZGV4ICR7dGhpcy50YXNrSW5kZXh9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFzayA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdO1xuICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSkhO1xuICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5rZXksIHRoaXMudmFsdWUpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZFZhbHVlKSB9KTtcbiAgfVxuXG4gIGludmVyc2Uob2xkVmFsdWU6IHN0cmluZyk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFJlc291cmNlVmFsdWVTdWJPcCh0aGlzLmtleSwgb2xkVmFsdWUsIHRoaXMudGFza0luZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkUmVzb3VyY2VPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRSZXNvdXJjZVN1Yk9wKG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVSZXNvdXJjZU9wKG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IERlbGV0ZVJlc291cmNlU3VwT3AobmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZFJlc291cmNlT3B0aW9uT3Aoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgdmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVSZXNvdXJjZU9wdGlvbk9wKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgRGVsZXRlUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIHZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lUmVzb3VyY2VPcHRpb25PcChcbiAga2V5OiBzdHJpbmcsXG4gIG9sZFZhbHVlOiBzdHJpbmcsXG4gIG5ld1ZhbHVlOiBzdHJpbmdcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJlbmFtZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5hbWVSZXNvdXJjZU9wKG9sZFZhbHVlOiBzdHJpbmcsIG5ld1ZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVSZXNvdXJjZVN1Yk9wKG9sZFZhbHVlLCBuZXdWYWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1vdmVSZXNvdXJjZU9wdGlvbk9wKFxuICBrZXk6IHN0cmluZyxcbiAgb2xkSW5kZXg6IG51bWJlcixcbiAgbmV3SW5kZXg6IG51bWJlclxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgTW92ZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCBvbGRJbmRleCwgbmV3SW5kZXgpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRSZXNvdXJjZVZhbHVlT3AoXG4gIGtleTogc3RyaW5nLFxuICB2YWx1ZTogc3RyaW5nLFxuICB0YXNrSW5kZXg6IG51bWJlclxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wKGtleSwgdmFsdWUsIHRhc2tJbmRleCldKTtcbn1cbiIsICIvKiogQSBjb29yZGluYXRlIHBvaW50IG9uIHRoZSByZW5kZXJpbmcgc3VyZmFjZS4gKi9cbmV4cG9ydCBjbGFzcyBQb2ludCB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICB9XG5cbiAgYWRkKHg6IG51bWJlciwgeTogbnVtYmVyKTogUG9pbnQge1xuICAgIHRoaXMueCArPSB4O1xuICAgIHRoaXMueSArPSB5O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc3VtKHJoczogUG9pbnQpOiBQb2ludCB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLnggKyByaHMueCwgdGhpcy55ICsgcmhzLnkpO1xuICB9XG5cbiAgZXF1YWwocmhzOiBQb2ludCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnggPT09IHJocy54ICYmIHRoaXMueSA9PT0gcmhzLnk7XG4gIH1cblxuICBzZXQocmhzOiBQb2ludCk6IFBvaW50IHtcbiAgICB0aGlzLnggPSByaHMueDtcbiAgICB0aGlzLnkgPSByaHMueTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGR1cCgpOiBQb2ludCB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLngsIHRoaXMueSk7XG4gIH1cbn1cbiIsICIvKipcbiAqIEZ1bmN0aW9uYWxpdHkgZm9yIGNyZWF0aW5nIGRyYWdnYWJsZSBkaXZpZGVycyBiZXR3ZWVuIGVsZW1lbnRzIG9uIGEgcGFnZS5cbiAqL1xuaW1wb3J0IHsgY2xhbXAgfSBmcm9tIFwiLi4vLi4vbWV0cmljcy9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi4vc2NhbGUvcG9pbnQudHNcIjtcblxuLy8gVmFsdWVzIGFyZSByZXR1cm5lZCBhcyBwZXJjZW50YWdlcyBhcm91bmQgdGhlIGN1cnJlbnQgbW91c2UgbG9jYXRpb24uIFRoYXRcbi8vIGlzLCBpZiB3ZSBhcmUgaW4gXCJjb2x1bW5cIiBtb2RlIHRoZW4gYGJlZm9yZWAgd291bGQgZXF1YWwgdGhlIG1vdXNlIHBvc2l0aW9uXG4vLyBhcyBhICUgb2YgdGhlIHdpZHRoIG9mIHRoZSBwYXJlbnQgZWxlbWVudCBmcm9tIHRoZSBsZWZ0IGhhbmQgc2lkZSBvZiB0aGVcbi8vIHBhcmVudCBlbGVtZW50LiBUaGUgYGFmdGVyYCB2YWx1ZSBpcyBqdXN0IDEwMC1iZWZvcmUuXG5leHBvcnQgaW50ZXJmYWNlIERpdmlkZXJNb3ZlUmVzdWx0IHtcbiAgYmVmb3JlOiBudW1iZXI7XG4gIGFmdGVyOiBudW1iZXI7XG59XG5cbmV4cG9ydCB0eXBlIERpdmlkZXJUeXBlID0gXCJjb2x1bW5cIiB8IFwicm93XCI7XG5cbmV4cG9ydCBjb25zdCBESVZJREVSX01PVkVfRVZFTlQgPSBcImRpdmlkZXJfbW92ZVwiO1xuXG5leHBvcnQgY29uc3QgUkVTSVpJTkdfQ0xBU1MgPSBcInJlc2l6aW5nXCI7XG5cbmludGVyZmFjZSBSZWN0IHtcbiAgdG9wOiBudW1iZXI7XG4gIGxlZnQ6IG51bWJlcjtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG59XG5cbi8qKiBSZXR1cm5zIGEgYm91bmRpbmcgcmVjdGFuZ2xlIGZvciBhbiBlbGVtZW50IGluIFBhZ2UgY29vcmRpbmF0ZXMsIGFzIG9wcG9zZWRcbiAqIHRvIFZpZXdQb3J0IGNvb3JkaW5hdGVzLCB3aGljaCBpcyB3aGF0IGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIHJldHVybnMuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQYWdlUmVjdCA9IChlbGU6IEhUTUxFbGVtZW50KTogUmVjdCA9PiB7XG4gIGNvbnN0IHZpZXdwb3J0UmVjdCA9IGVsZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgcmV0dXJuIHtcbiAgICB0b3A6IHZpZXdwb3J0UmVjdC50b3AgKyB3aW5kb3cuc2Nyb2xsWSxcbiAgICBsZWZ0OiB2aWV3cG9ydFJlY3QubGVmdCArIHdpbmRvdy5zY3JvbGxYLFxuICAgIHdpZHRoOiB2aWV3cG9ydFJlY3Qud2lkdGgsXG4gICAgaGVpZ2h0OiB2aWV3cG9ydFJlY3QuaGVpZ2h0LFxuICB9O1xufTtcblxuLyoqIERpdmlkZXJNb3ZlIGlzIGNvcmUgZnVuY3Rpb25hbGl0eSBmb3IgY3JlYXRpbmcgZHJhZ2dhYmxlIGRpdmlkZXJzIGJldHdlZW5cbiAqIGVsZW1lbnRzIG9uIGEgcGFnZS5cbiAqXG4gKiBDb25zdHJ1Y3QgYSBEaXZpZGVyTW9kZSB3aXRoIGEgcGFyZW50IGVsZW1lbnQgYW5kIGEgZGl2aWRlciBlbGVtZW50LCB3aGVyZVxuICogdGhlIGRpdmlkZXIgZWxlbWVudCBpcyB0aGUgZWxlbWVudCBiZXR3ZWVuIG90aGVyIHBhZ2UgZWxlbWVudHMgdGhhdCBpc1xuICogZXhwZWN0ZWQgdG8gYmUgZHJhZ2dlZC4gRm9yIGV4YW1wbGUsIGluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSAjY29udGFpbmVyXG4gKiB3b3VsZCBiZSB0aGUgYHBhcmVudGAsIGFuZCAjZGl2aWRlciB3b3VsZCBiZSB0aGUgYGRpdmlkZXJgIGVsZW1lbnQuXG4gKlxuICogIDxkaXYgaWQ9Y29udGFpbmVyPlxuICogICAgPGRpdiBpZD1sZWZ0PjwvZGl2PiAgPGRpdiBpZD1kaXZpZGVyPjwvZGl2PiA8ZGl2IGlkPXJpZ2h0PjwvZGl2P1xuICogIDwvZGl2PlxuICpcbiAqIERpdmlkZXJNb2RlIHdhaXRzIGZvciBhIG1vdXNlZG93biBldmVudCBvbiB0aGUgYGRpdmlkZXJgIGVsZW1lbnQgYW5kIHRoZW5cbiAqIHdhdGNoZXMgbW91c2UgZXZlbnRzIGZvciB0aGUgZ2l2ZW4gcGFyZW50IEhUTUxFbGVtZW50IGFuZCBlbWl0cyBldmVudHMgYXJvdW5kXG4gKiBkcmFnZ2luZy5cbiAqXG4gKiBUaGUgZW1pdHRlZCBldmVudCBpcyBcImRpdmlkZXJfbW92ZVwiIGFuZCBpcyBhIEN1c3RvbUV2ZW50PERpdmlkZXJNb3ZlUmVzdWx0Pi5cbiAqXG4gKiBJdCBpcyB1cCB0byB0aGUgdXNlciBvZiBEaXZpZGVyTW92ZSB0byBsaXN0ZW4gZm9yIHRoZSBcImRpdmlkZXJfbW92ZVwiIGV2ZW50c1xuICogYW5kIHVwZGF0ZSB0aGUgQ1NTIG9mIHRoZSBwYWdlIGFwcHJvcHJpYXRlbHkgdG8gcmVmbGVjdCB0aGUgcG9zaXRpb24gb2YgdGhlXG4gKiBkaXZpZGVyLlxuICpcbiAqIE9uY2UgdGhlIG1vdXNlIGlzIGRvd24gYW4gZXZlbnQgd2lsbCBiZSBlbWl0dGVkIHBlcmlvZGljYWxseSBhcyB0aGUgbW91c2VcbiAqIG1vdmVzLlxuICpcbiAqIE9uY2UgdGhlIG1vdXNlIGlzIHJlbGVhc2VkLCBvciBpZiB0aGUgbW91c2UgZXhpdHMgdGhlIHBhcmVudCBIVE1MRWxlbWVudCwgb25lXG4gKiBsYXN0IGV2ZW50IGlzIGVtaXR0ZWQuXG4gKlxuICogV2hpbGUgZHJhZ2dpbmcgdGhlIGRpdmlkZXIsIHRoZSBcInJlc2l6aW5nXCIgY2xhc3Mgd2lsbCBiZSBhZGRlZCB0byB0aGUgcGFyZW50XG4gKiBlbGVtZW50LiBUaGlzIGNhbiBiZSB1c2VkIHRvIHNldCBhIHN0eWxlLCBlLmcuICd1c2VyLXNlbGVjdDogbm9uZScuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXZpZGVyTW92ZSB7XG4gIC8qKiBUaGUgcG9pbnQgd2hlcmUgZHJhZ2dpbmcgc3RhcnRlZCwgaW4gUGFnZSBjb29yZGluYXRlcy4gKi9cbiAgYmVnaW46IFBvaW50IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBkaW1lbnNpb25zIG9mIHRoZSBwYXJlbnQgZWxlbWVudCBpbiBQYWdlIGNvb3JkaW5hdGVzIGFzIG9mIG1vdXNlZG93blxuICAgKiBvbiB0aGUgZGl2aWRlci4uICovXG4gIHBhcmVudFJlY3Q6IFJlY3QgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGN1cnJlbnQgbW91c2UgcG9zaXRpb24gaW4gUGFnZSBjb29yZGluYXRlcy4gKi9cbiAgY3VycmVudE1vdmVMb2NhdGlvbjogUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG5cbiAgLyoqIFRoZSBsYXN0IG1vdXNlIHBvc2l0aW9uIGluIFBhZ2UgY29vcmRpbmF0ZXMgcmVwb3J0ZWQgdmlhIEN1c3RvbUV2ZW50LiAqL1xuICBsYXN0TW92ZVNlbnQ6IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuXG4gIC8qKiBUaGUgcGFyZW50IGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgZGl2aWRlci4gKi9cbiAgcGFyZW50OiBIVE1MRWxlbWVudDtcblxuICAvKiogVGhlIGRpdmlkZXIgZWxlbWVudCB0byBiZSBkcmFnZ2VkIGFjcm9zcyB0aGUgcGFyZW50IGVsZW1lbnQuICovXG4gIGRpdmlkZXI6IEhUTUxFbGVtZW50O1xuXG4gIC8qKiBUaGUgaGFuZGxlIG9mIHRoZSB3aW5kb3cuc2V0SW50ZXJ2YWwoKS4gKi9cbiAgaW50ZXJudmFsSGFuZGxlOiBudW1iZXIgPSAwO1xuXG4gIC8qKiBUaGUgdHlwZSBvZiBkaXZpZGVyLCBlaXRoZXIgdmVydGljYWwgKFwiY29sdW1uXCIpLCBvciBob3Jpem9udGFsIChcInJvd1wiKS4gKi9cbiAgZGl2aWRlclR5cGU6IERpdmlkZXJUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHBhcmVudDogSFRNTEVsZW1lbnQsXG4gICAgZGl2aWRlcjogSFRNTEVsZW1lbnQsXG4gICAgZGl2aWRlclR5cGU6IERpdmlkZXJUeXBlID0gXCJjb2x1bW5cIlxuICApIHtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLmRpdmlkZXIgPSBkaXZpZGVyO1xuICAgIHRoaXMuZGl2aWRlclR5cGUgPSBkaXZpZGVyVHlwZTtcbiAgICB0aGlzLmRpdmlkZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGRldGFjaCgpIHtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZGl2aWRlci5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICB9XG5cbiAgb25UaW1lb3V0KCkge1xuICAgIGlmICghdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLmVxdWFsKHRoaXMubGFzdE1vdmVTZW50KSkge1xuICAgICAgbGV0IGRpZmZQZXJjZW50OiBudW1iZXIgPSAwO1xuICAgICAgaWYgKHRoaXMuZGl2aWRlclR5cGUgPT09IFwiY29sdW1uXCIpIHtcbiAgICAgICAgZGlmZlBlcmNlbnQgPVxuICAgICAgICAgICgxMDAgKiAodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnggLSB0aGlzLnBhcmVudFJlY3QhLmxlZnQpKSAvXG4gICAgICAgICAgdGhpcy5wYXJlbnRSZWN0IS53aWR0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpZmZQZXJjZW50ID1cbiAgICAgICAgICAoMTAwICogKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi55IC0gdGhpcy5wYXJlbnRSZWN0IS50b3ApKSAvXG4gICAgICAgICAgdGhpcy5wYXJlbnRSZWN0IS5oZWlnaHQ7XG4gICAgICB9XG4gICAgICAvLyBUT0RPIC0gU2hvdWxkIGNsYW1wIGJlIHNldHRhYmxlIGluIHRoZSBjb25zdHJ1Y3Rvcj9cbiAgICAgIGRpZmZQZXJjZW50ID0gY2xhbXAoZGlmZlBlcmNlbnQsIDUsIDk1KTtcblxuICAgICAgdGhpcy5wYXJlbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50PERpdmlkZXJNb3ZlUmVzdWx0PihESVZJREVSX01PVkVfRVZFTlQsIHtcbiAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgIGJlZm9yZTogZGlmZlBlcmNlbnQsXG4gICAgICAgICAgICBhZnRlcjogMTAwIC0gZGlmZlBlcmNlbnQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICB0aGlzLmxhc3RNb3ZlU2VudC5zZXQodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBtb3VzZW1vdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54ID0gZS5wYWdlWDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSA9IGUucGFnZVk7XG4gIH1cblxuICBtb3VzZWRvd24oZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuaW50ZXJudmFsSGFuZGxlID0gd2luZG93LnNldEludGVydmFsKHRoaXMub25UaW1lb3V0LmJpbmQodGhpcyksIDE2KTtcbiAgICB0aGlzLnBhcmVudFJlY3QgPSBnZXRQYWdlUmVjdCh0aGlzLnBhcmVudCk7XG5cbiAgICB0aGlzLnBhcmVudC5jbGFzc0xpc3QuYWRkKFJFU0laSU5HX0NMQVNTKTtcblxuICAgIHRoaXMucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmVnaW4gPSBuZXcgUG9pbnQoZS5wYWdlWCwgZS5wYWdlWSk7XG4gIH1cblxuICBtb3VzZXVwKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZpbmlzaGVkKG5ldyBQb2ludChlLnBhZ2VYLCBlLnBhZ2VZKSk7XG4gIH1cblxuICBtb3VzZWxlYXZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZpbmlzaGVkKG5ldyBQb2ludChlLnBhZ2VYLCBlLnBhZ2VZKSk7XG4gIH1cblxuICBmaW5pc2hlZChlbmQ6IFBvaW50KSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuXG4gICAgdGhpcy5wYXJlbnQuY2xhc3NMaXN0LnJlbW92ZShSRVNJWklOR19DTEFTUyk7XG5cbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBlbmQ7XG4gICAgdGhpcy5vblRpbWVvdXQoKTtcbiAgICB0aGlzLmJlZ2luID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgdGhpcy5sYXN0TW92ZVNlbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuLi9zY2FsZS9wb2ludC50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYWdSYW5nZSB7XG4gIGJlZ2luOiBQb2ludDtcbiAgZW5kOiBQb2ludDtcbn1cblxuZXhwb3J0IGNvbnN0IERSQUdfUkFOR0VfRVZFTlQgPSBcImRyYWdyYW5nZVwiO1xuXG4vKiogTW91c2VNb3ZlIHdhdGNoZXMgbW91c2UgZXZlbnRzIGZvciBhIGdpdmVuIEhUTUxFbGVtZW50IGFuZCBlbWl0c1xuICogZXZlbnRzIGFyb3VuZCBkcmFnZ2luZy5cbiAqXG4gKiBUaGUgZW1pdHRlZCBldmVudCBpcyBcImRyYWdyYW5nZVwiIGFuZCBpcyBhIEN1c3RvbUV2ZW50PERyYWdSYW5nZT4uXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcHJlc3NlZCBkb3duIGluIHRoZSBIVE1MRWxlbWVudCBhbiBldmVudCB3aWxsIGJlXG4gKiBlbWl0dGVkIHBlcmlvZGljYWxseSBhcyB0aGUgbW91c2UgbW92ZXMuXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcmVsZWFzZWQsIG9yIGV4aXRzIHRoZSBIVE1MRWxlbWVudCBvbmUgbGFzdCBldmVudFxuICogaXMgZW1pdHRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vdXNlRHJhZyB7XG4gIGJlZ2luOiBQb2ludCB8IG51bGwgPSBudWxsO1xuICBjdXJyZW50TW92ZUxvY2F0aW9uOiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgbGFzdE1vdmVTZW50OiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgZWxlOiBIVE1MRWxlbWVudDtcbiAgaW50ZXJudmFsSGFuZGxlOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGVsZTogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZSA9IGVsZTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXRhY2goKSB7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICB9XG5cbiAgb25UaW1lb3V0KCkge1xuICAgIGlmICghdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLmVxdWFsKHRoaXMubGFzdE1vdmVTZW50KSkge1xuICAgICAgdGhpcy5lbGUuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50PERyYWdSYW5nZT4oRFJBR19SQU5HRV9FVkVOVCwge1xuICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgYmVnaW46IHRoaXMuYmVnaW4hLmR1cCgpLFxuICAgICAgICAgICAgZW5kOiB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24uZHVwKCksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICB0aGlzLmxhc3RNb3ZlU2VudC5zZXQodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBtb3VzZW1vdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54ID0gZS5vZmZzZXRYO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi55ID0gZS5vZmZzZXRZO1xuICB9XG5cbiAgbW91c2Vkb3duKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmludGVybnZhbEhhbmRsZSA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLm9uVGltZW91dC5iaW5kKHRoaXMpLCAxNik7XG4gICAgdGhpcy5iZWdpbiA9IG5ldyBQb2ludChlLm9mZnNldFgsIGUub2Zmc2V0WSk7XG4gIH1cblxuICBtb3VzZXVwKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmZpbmlzaGVkKG5ldyBQb2ludChlLm9mZnNldFgsIGUub2Zmc2V0WSkpO1xuICB9XG5cbiAgbW91c2VsZWF2ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maW5pc2hlZChuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpKTtcbiAgfVxuXG4gIGZpbmlzaGVkKGVuZDogUG9pbnQpIHtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVybnZhbEhhbmRsZSk7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gZW5kO1xuICAgIHRoaXMub25UaW1lb3V0KCk7XG4gICAgdGhpcy5iZWdpbiA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHRoaXMubGFzdE1vdmVTZW50ID0gbmV3IFBvaW50KDAsIDApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi4vc2NhbGUvcG9pbnQudHNcIjtcblxuLyoqIE1vdXNlTW92ZSB3YXRjaGVzIG1vdXNlIGV2ZW50cyBmb3IgYSBnaXZlbiBIVE1MRWxlbWVudCBhbmQgcmVjb3JkcyB0aGUgbW9zdFxuICogIHJlY2VudCBsb2NhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vdXNlTW92ZSB7XG4gIGN1cnJlbnRNb3ZlTG9jYXRpb246IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuICBsYXN0UmVhZExvY2F0aW9uOiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgZWxlOiBIVE1MRWxlbWVudDtcblxuICBjb25zdHJ1Y3RvcihlbGU6IEhUTUxFbGVtZW50KSB7XG4gICAgdGhpcy5lbGUgPSBlbGU7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXRhY2goKSB7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIG1vdXNlbW92ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnggPSBlLm9mZnNldFg7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnkgPSBlLm9mZnNldFk7XG4gIH1cblxuICAvKiogUmV0dXJucyBhIFBvaW50IGlmIHRoZSBtb3VzZSBoYWQgbW92ZWQgc2luY2UgdGhlIGxhc3QgcmVhZCwgb3RoZXJ3aXNlXG4gICAqIHJldHVybnMgbnVsbC5cbiAgICovXG4gIHJlYWRMb2NhdGlvbigpOiBQb2ludCB8IG51bGwge1xuICAgIGlmICh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24uZXF1YWwodGhpcy5sYXN0UmVhZExvY2F0aW9uKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRoaXMubGFzdFJlYWRMb2NhdGlvbi5zZXQodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uKTtcbiAgICByZXR1cm4gdGhpcy5sYXN0UmVhZExvY2F0aW9uLmR1cCgpO1xuICB9XG59XG4iLCAiZXhwb3J0IGNvbnN0IE1JTl9ESVNQTEFZX1JBTkdFID0gNztcblxuLyoqIFJlcHJlc2VudHMgYSByYW5nZSBvZiBkYXlzIG92ZXIgd2hpY2ggdG8gZGlzcGxheSBhIHpvb21lZCBpbiB2aWV3LCB1c2luZ1xuICogdGhlIGhhbGYtb3BlbiBpbnRlcnZhbCBbYmVnaW4sIGVuZCkuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXNwbGF5UmFuZ2Uge1xuICBwcml2YXRlIF9iZWdpbjogbnVtYmVyO1xuICBwcml2YXRlIF9lbmQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihiZWdpbjogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xuICAgIHRoaXMuX2JlZ2luID0gYmVnaW47XG4gICAgdGhpcy5fZW5kID0gZW5kO1xuICAgIGlmICh0aGlzLl9iZWdpbiA+IHRoaXMuX2VuZCkge1xuICAgICAgW3RoaXMuX2VuZCwgdGhpcy5fYmVnaW5dID0gW3RoaXMuX2JlZ2luLCB0aGlzLl9lbmRdO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZW5kIC0gdGhpcy5fYmVnaW4gPCBNSU5fRElTUExBWV9SQU5HRSkge1xuICAgICAgdGhpcy5fZW5kID0gdGhpcy5fYmVnaW4gKyBNSU5fRElTUExBWV9SQU5HRTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgaW4oeDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHggPj0gdGhpcy5fYmVnaW4gJiYgeCA8PSB0aGlzLl9lbmQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJlZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2JlZ2luO1xuICB9XG5cbiAgcHVibGljIGdldCBlbmQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZW5kO1xuICB9XG5cbiAgcHVibGljIGdldCByYW5nZUluRGF5cygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9lbmQgLSB0aGlzLl9iZWdpbjtcbiAgfVxufVxuIiwgImltcG9ydCB7IERpcmVjdGVkRWRnZSwgRWRnZXMgfSBmcm9tIFwiLi4vLi4vZGFnL2RhZ1wiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IFNwYW4gfSBmcm9tIFwiLi4vLi4vc2xhY2svc2xhY2tcIjtcbmltcG9ydCB7IENoYXJ0LCBUYXNrLCBUYXNrcywgdmFsaWRhdGVDaGFydCB9IGZyb20gXCIuLi9jaGFydFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoYXJ0TGlrZSB7XG4gIFZlcnRpY2VzOiBUYXNrcztcbiAgRWRnZXM6IEVkZ2VzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZpbHRlclJlc3VsdCB7XG4gIGNoYXJ0TGlrZTogQ2hhcnRMaWtlO1xuICBkaXNwbGF5T3JkZXI6IG51bWJlcltdO1xuICBlbXBoYXNpemVkVGFza3M6IG51bWJlcltdO1xuICBzcGFuczogU3BhbltdO1xuICBsYWJlbHM6IHN0cmluZ1tdO1xuICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPjtcbiAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj47XG4gIHNlbGVjdGVkVGFza0luZGV4OiBudW1iZXI7XG59XG5cbi8qKiBVc2VkIGZvciBmaWx0ZXJpbmcgdGFza3MsIHJldHVybnMgVHJ1ZSBpZiB0aGUgdGFzayBpcyB0byBiZSBpbmNsdWRlZCBpbiB0aGVcbiAqIGZpbHRlcmVkIHJlc3VsdHMuICovXG5leHBvcnQgdHlwZSBGaWx0ZXJGdW5jID0gKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IGJvb2xlYW47XG5cbi8qKiBGaWx0ZXJzIHRoZSBjb250ZW50cyBvZiB0aGUgQ2hhcnQgYmFzZWQgb24gdGhlIGZpbHRlckZ1bmMuXG4gKlxuICogc2VsZWN0ZWRUYXNrSW5kZXggd2lsbCBiZSByZXR1cm5lZCBhcyAtMSBpZiB0aGUgc2VsZWN0ZWQgdGFzayBnZXRzIGZpbHRlcmVkXG4gKiBvdXQuXG4gKi9cbmV4cG9ydCBjb25zdCBmaWx0ZXIgPSAoXG4gIGNoYXJ0OiBDaGFydCxcbiAgZmlsdGVyRnVuYzogRmlsdGVyRnVuYyB8IG51bGwsXG4gIGVtcGhhc2l6ZWRUYXNrczogbnVtYmVyW10sXG4gIHNwYW5zOiBTcGFuW10sXG4gIGxhYmVsczogc3RyaW5nW10sXG4gIHNlbGVjdGVkVGFza0luZGV4OiBudW1iZXJcbik6IFJlc3VsdDxGaWx0ZXJSZXN1bHQ+ID0+IHtcbiAgY29uc3QgdnJldCA9IHZhbGlkYXRlQ2hhcnQoY2hhcnQpO1xuICBpZiAoIXZyZXQub2spIHtcbiAgICByZXR1cm4gdnJldDtcbiAgfVxuICBjb25zdCB0b3BvbG9naWNhbE9yZGVyID0gdnJldC52YWx1ZTtcbiAgaWYgKGZpbHRlckZ1bmMgPT09IG51bGwpIHtcbiAgICBjb25zdCBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY2hhcnQuVmVydGljZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleC5zZXQoaW5kZXgsIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIGNoYXJ0TGlrZTogY2hhcnQsXG4gICAgICBkaXNwbGF5T3JkZXI6IHZyZXQudmFsdWUsXG4gICAgICBlbXBoYXNpemVkVGFza3M6IGVtcGhhc2l6ZWRUYXNrcyxcbiAgICAgIHNwYW5zOiBzcGFucyxcbiAgICAgIGxhYmVsczogbGFiZWxzLFxuICAgICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LFxuICAgICAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXg6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXgsXG4gICAgfSk7XG4gIH1cbiAgY29uc3QgdGFza3M6IFRhc2tzID0gW107XG4gIGNvbnN0IGVkZ2VzOiBFZGdlcyA9IFtdO1xuICBjb25zdCBkaXNwbGF5T3JkZXI6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGZpbHRlcmVkU3BhbnM6IFNwYW5bXSA9IFtdO1xuICBjb25zdCBmaWx0ZXJlZExhYmVsczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gIGNvbnN0IGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcblxuICAvLyBGaXJzdCBmaWx0ZXIgdGhlIHRhc2tzLlxuICBjaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBvcmlnaW5hbEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBpZiAoZmlsdGVyRnVuYyh0YXNrLCBvcmlnaW5hbEluZGV4KSkge1xuICAgICAgdGFza3MucHVzaCh0YXNrKTtcbiAgICAgIGZpbHRlcmVkU3BhbnMucHVzaChzcGFuc1tvcmlnaW5hbEluZGV4XSk7XG4gICAgICBmaWx0ZXJlZExhYmVscy5wdXNoKGxhYmVsc1tvcmlnaW5hbEluZGV4XSk7XG4gICAgICBjb25zdCBuZXdJbmRleCA9IHRhc2tzLmxlbmd0aCAtIDE7XG4gICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguc2V0KG9yaWdpbmFsSW5kZXgsIG5ld0luZGV4KTtcbiAgICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LnNldChuZXdJbmRleCwgb3JpZ2luYWxJbmRleCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBOb3cgZmlsdGVyIHRoZSBlZGdlcyB3aGlsZSBhbHNvIHJld3JpdGluZyB0aGVtLlxuICBjaGFydC5FZGdlcy5mb3JFYWNoKChkaXJlY3RlZEVkZ2U6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGlmIChcbiAgICAgICFmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguaGFzKGRpcmVjdGVkRWRnZS5pKSB8fFxuICAgICAgIWZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5oYXMoZGlyZWN0ZWRFZGdlLmopXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVkZ2VzLnB1c2goXG4gICAgICBuZXcgRGlyZWN0ZWRFZGdlKFxuICAgICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KGRpcmVjdGVkRWRnZS5pKSxcbiAgICAgICAgZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChkaXJlY3RlZEVkZ2UuailcbiAgICAgIClcbiAgICApO1xuICB9KTtcblxuICAvLyBOb3cgZmlsdGVyIGFuZCByZWluZGV4IHRoZSB0b3BvbG9naWNhbC9kaXNwbGF5IG9yZGVyLlxuICB0b3BvbG9naWNhbE9yZGVyLmZvckVhY2goKG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrOiBUYXNrID0gY2hhcnQuVmVydGljZXNbb3JpZ2luYWxUYXNrSW5kZXhdO1xuICAgIGlmICghZmlsdGVyRnVuYyh0YXNrLCBvcmlnaW5hbFRhc2tJbmRleCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZGlzcGxheU9yZGVyLnB1c2goZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChvcmlnaW5hbFRhc2tJbmRleCkhKTtcbiAgfSk7XG5cbiAgLy8gUmUtaW5kZXggaGlnaGxpZ2h0ZWQgdGFza3MuXG4gIGNvbnN0IHVwZGF0ZWRFbXBoYXNpemVkVGFza3MgPSBlbXBoYXNpemVkVGFza3MubWFwKFxuICAgIChvcmlnaW5hbFRhc2tJbmRleDogbnVtYmVyKTogbnVtYmVyID0+XG4gICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KG9yaWdpbmFsVGFza0luZGV4KSFcbiAgKTtcblxuICByZXR1cm4gb2soe1xuICAgIGNoYXJ0TGlrZToge1xuICAgICAgRWRnZXM6IGVkZ2VzLFxuICAgICAgVmVydGljZXM6IHRhc2tzLFxuICAgIH0sXG4gICAgZGlzcGxheU9yZGVyOiBkaXNwbGF5T3JkZXIsXG4gICAgZW1waGFzaXplZFRhc2tzOiB1cGRhdGVkRW1waGFzaXplZFRhc2tzLFxuICAgIHNwYW5zOiBmaWx0ZXJlZFNwYW5zLFxuICAgIGxhYmVsczogZmlsdGVyZWRMYWJlbHMsXG4gICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LFxuICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4OiBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXgsXG4gICAgc2VsZWN0ZWRUYXNrSW5kZXg6IGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5nZXQoc2VsZWN0ZWRUYXNrSW5kZXgpIHx8IC0xLFxuICB9KTtcbn07XG4iLCAiLyoqIEBtb2R1bGUga2RcbiAqIEEgay1kIHRyZWUgaW1wbGVtZW50YXRpb24sIHdoaWNoIGlzIHVzZWQgdG8gZmluZCB0aGUgY2xvc2VzdCBwb2ludCBpblxuICogc29tZXRoaW5nIGxpa2UgYSAyRCBzY2F0dGVyIHBsb3QuIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9LLWRfdHJlZVxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBGb3JrZWQgZnJvbSBodHRwczovL3NraWEuZ29vZ2xlc291cmNlLmNvbS9idWlsZGJvdC8rL3JlZnMvaGVhZHMvbWFpbi9wZXJmL21vZHVsZXMvcGxvdC1zaW1wbGUtc2sva2QudHMuXG4gKlxuICogRm9ya2VkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL1BhbmRpbm9zYXVydXMva2QtdHJlZS1qYXZhc2NyaXB0IGFuZFxuICogdGhlbiBtYXNzaXZlbHkgdHJpbW1lZCBkb3duIHRvIGp1c3QgZmluZCB0aGUgc2luZ2xlIGNsb3Nlc3QgcG9pbnQsIGFuZCBhbHNvXG4gKiBwb3J0ZWQgdG8gRVM2IHN5bnRheCwgdGhlbiBwb3J0ZWQgdG8gVHlwZVNjcmlwdC5cbiAqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUGFuZGlub3NhdXJ1cy9rZC10cmVlLWphdmFzY3JpcHQgaXMgYSBmb3JrIG9mXG4gKiBodHRwczovL2dpdGh1Yi5jb20vdWJpbGFicy9rZC10cmVlLWphdmFzY3JpcHRcbiAqXG4gKiBAYXV0aG9yIE1pcmNlYSBQcmljb3AgPHByaWNvcEB1YmlsYWJzLm5ldD4sIDIwMTJcbiAqIEBhdXRob3IgTWFydGluIEtsZXBwZSA8a2xlcHBlQHViaWxhYnMubmV0PiwgMjAxMlxuICogQGF1dGhvciBVYmlsYWJzIGh0dHA6Ly91YmlsYWJzLm5ldCwgMjAxMlxuICogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgPGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwPlxuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgS0RQb2ludCB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xufVxuXG50eXBlIERpbWVuc2lvbnMgPSBrZXlvZiBLRFBvaW50O1xuXG5jb25zdCBkZWZhdWx0TWV0cmljID0gKGE6IEtEUG9pbnQsIGI6IEtEUG9pbnQpOiBudW1iZXIgPT5cbiAgKGEueCAtIGIueCkgKiAoYS54IC0gYi54KSArIChhLnkgLSBiLnkpICogKGEueSAtIGIueSk7XG5cbmNvbnN0IGRlZmF1bHREaW1lbnNpb25zOiBEaW1lbnNpb25zW10gPSBbXCJ4XCIsIFwieVwiXTtcblxuLyoqIEBjbGFzcyBBIHNpbmdsZSBub2RlIGluIHRoZSBrLWQgVHJlZS4gKi9cbmNsYXNzIE5vZGU8SXRlbSBleHRlbmRzIEtEUG9pbnQ+IHtcbiAgb2JqOiBJdGVtO1xuXG4gIGxlZnQ6IE5vZGU8SXRlbT4gfCBudWxsID0gbnVsbDtcblxuICByaWdodDogTm9kZTxJdGVtPiB8IG51bGwgPSBudWxsO1xuXG4gIHBhcmVudDogTm9kZTxJdGVtPiB8IG51bGw7XG5cbiAgZGltZW5zaW9uOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Iob2JqOiBJdGVtLCBkaW1lbnNpb246IG51bWJlciwgcGFyZW50OiBOb2RlPEl0ZW0+IHwgbnVsbCkge1xuICAgIHRoaXMub2JqID0gb2JqO1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMuZGltZW5zaW9uID0gZGltZW5zaW9uO1xuICB9XG59XG5cbi8qKlxuICogQGNsYXNzIFRoZSBrLWQgdHJlZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEtEVHJlZTxQb2ludCBleHRlbmRzIEtEUG9pbnQ+IHtcbiAgcHJpdmF0ZSBkaW1lbnNpb25zOiBEaW1lbnNpb25zW107XG5cbiAgcHJpdmF0ZSByb290OiBOb2RlPFBvaW50PiB8IG51bGw7XG5cbiAgcHJpdmF0ZSBtZXRyaWM6IChhOiBLRFBvaW50LCBiOiBLRFBvaW50KSA9PiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gcG9pbnRzIC0gQW4gYXJyYXkgb2YgcG9pbnRzLCBzb21ldGhpbmcgd2l0aCB0aGUgc2hhcGVcbiAgICogICAgIHt4OngsIHk6eX0uXG4gICAqIEBwYXJhbSB7QXJyYXl9IGRpbWVuc2lvbnMgLSBUaGUgZGltZW5zaW9ucyB0byB1c2UgaW4gb3VyIHBvaW50cywgZm9yXG4gICAqICAgICBleGFtcGxlIFsneCcsICd5J10uXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1ldHJpYyAtIEEgZnVuY3Rpb24gdGhhdCBjYWxjdWxhdGVzIHRoZSBkaXN0YW5jZVxuICAgKiAgICAgYmV0d2VlbiB0d28gcG9pbnRzLlxuICAgKi9cbiAgY29uc3RydWN0b3IocG9pbnRzOiBQb2ludFtdKSB7XG4gICAgdGhpcy5kaW1lbnNpb25zID0gZGVmYXVsdERpbWVuc2lvbnM7XG4gICAgdGhpcy5tZXRyaWMgPSBkZWZhdWx0TWV0cmljO1xuICAgIHRoaXMucm9vdCA9IHRoaXMuX2J1aWxkVHJlZShwb2ludHMsIDAsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgdGhlIG5lYXJlc3QgTm9kZSB0byB0aGUgZ2l2ZW4gcG9pbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwb2ludCAtIHt4OngsIHk6eX1cbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIGNsb3Nlc3QgcG9pbnQgb2JqZWN0IHBhc3NlZCBpbnRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICogICAgIFdlIHBhc3MgYmFjayB0aGUgb3JpZ2luYWwgb2JqZWN0IHNpbmNlIGl0IG1pZ2h0IGhhdmUgZXh0cmEgaW5mb1xuICAgKiAgICAgYmV5b25kIGp1c3QgdGhlIGNvb3JkaW5hdGVzLCBzdWNoIGFzIHRyYWNlIGlkLlxuICAgKi9cbiAgbmVhcmVzdChwb2ludDogS0RQb2ludCk6IFBvaW50IHtcbiAgICBsZXQgYmVzdE5vZGUgPSB7XG4gICAgICBub2RlOiB0aGlzLnJvb3QsXG4gICAgICBkaXN0YW5jZTogTnVtYmVyLk1BWF9WQUxVRSxcbiAgICB9O1xuXG4gICAgY29uc3Qgc2F2ZU5vZGUgPSAobm9kZTogTm9kZTxQb2ludD4sIGRpc3RhbmNlOiBudW1iZXIpID0+IHtcbiAgICAgIGJlc3ROb2RlID0ge1xuICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICBkaXN0YW5jZTogZGlzdGFuY2UsXG4gICAgICB9O1xuICAgIH07XG5cbiAgICBjb25zdCBuZWFyZXN0U2VhcmNoID0gKG5vZGU6IE5vZGU8UG9pbnQ+KSA9PiB7XG4gICAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbnNbbm9kZS5kaW1lbnNpb25dO1xuICAgICAgY29uc3Qgb3duRGlzdGFuY2UgPSB0aGlzLm1ldHJpYyhwb2ludCwgbm9kZS5vYmopO1xuXG4gICAgICBpZiAobm9kZS5yaWdodCA9PT0gbnVsbCAmJiBub2RlLmxlZnQgPT09IG51bGwpIHtcbiAgICAgICAgaWYgKG93bkRpc3RhbmNlIDwgYmVzdE5vZGUuZGlzdGFuY2UpIHtcbiAgICAgICAgICBzYXZlTm9kZShub2RlLCBvd25EaXN0YW5jZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsZXQgYmVzdENoaWxkID0gbnVsbDtcbiAgICAgIGxldCBvdGhlckNoaWxkID0gbnVsbDtcbiAgICAgIC8vIElmIHdlIGdldCBoZXJlIHdlIGtub3cgdGhhdCBhdCBsZWFzdCBvbmUgb2YgLmxlZnQgYW5kIC5yaWdodCBpc1xuICAgICAgLy8gbm9uLW51bGwsIHNvIGJlc3RDaGlsZCBpcyBndWFyYW50ZWVkIHRvIGJlIG5vbi1udWxsLlxuICAgICAgaWYgKG5vZGUucmlnaHQgPT09IG51bGwpIHtcbiAgICAgICAgYmVzdENoaWxkID0gbm9kZS5sZWZ0O1xuICAgICAgfSBlbHNlIGlmIChub2RlLmxlZnQgPT09IG51bGwpIHtcbiAgICAgICAgYmVzdENoaWxkID0gbm9kZS5yaWdodDtcbiAgICAgIH0gZWxzZSBpZiAocG9pbnRbZGltZW5zaW9uXSA8IG5vZGUub2JqW2RpbWVuc2lvbl0pIHtcbiAgICAgICAgYmVzdENoaWxkID0gbm9kZS5sZWZ0O1xuICAgICAgICBvdGhlckNoaWxkID0gbm9kZS5yaWdodDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJlc3RDaGlsZCA9IG5vZGUucmlnaHQ7XG4gICAgICAgIG90aGVyQ2hpbGQgPSBub2RlLmxlZnQ7XG4gICAgICB9XG5cbiAgICAgIG5lYXJlc3RTZWFyY2goYmVzdENoaWxkISk7XG5cbiAgICAgIGlmIChvd25EaXN0YW5jZSA8IGJlc3ROb2RlLmRpc3RhbmNlKSB7XG4gICAgICAgIHNhdmVOb2RlKG5vZGUsIG93bkRpc3RhbmNlKTtcbiAgICAgIH1cblxuICAgICAgLy8gRmluZCBkaXN0YW5jZSB0byBoeXBlcnBsYW5lLlxuICAgICAgY29uc3QgcG9pbnRPbkh5cGVycGxhbmUgPSB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDAsXG4gICAgICB9O1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRpbWVuc2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGkgPT09IG5vZGUuZGltZW5zaW9uKSB7XG4gICAgICAgICAgcG9pbnRPbkh5cGVycGxhbmVbdGhpcy5kaW1lbnNpb25zW2ldXSA9IHBvaW50W3RoaXMuZGltZW5zaW9uc1tpXV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcG9pbnRPbkh5cGVycGxhbmVbdGhpcy5kaW1lbnNpb25zW2ldXSA9IG5vZGUub2JqW3RoaXMuZGltZW5zaW9uc1tpXV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIGh5cGVycGxhbmUgaXMgY2xvc2VyIHRoYW4gdGhlIGN1cnJlbnQgYmVzdCBwb2ludCB0aGVuIHdlXG4gICAgICAvLyBuZWVkIHRvIHNlYXJjaCBkb3duIHRoZSBvdGhlciBzaWRlIG9mIHRoZSB0cmVlLlxuICAgICAgaWYgKFxuICAgICAgICBvdGhlckNoaWxkICE9PSBudWxsICYmXG4gICAgICAgIHRoaXMubWV0cmljKHBvaW50T25IeXBlcnBsYW5lLCBub2RlLm9iaikgPCBiZXN0Tm9kZS5kaXN0YW5jZVxuICAgICAgKSB7XG4gICAgICAgIG5lYXJlc3RTZWFyY2gob3RoZXJDaGlsZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICh0aGlzLnJvb3QpIHtcbiAgICAgIG5lYXJlc3RTZWFyY2godGhpcy5yb290KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYmVzdE5vZGUubm9kZSEub2JqO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyB0aGUgZnJvbSBwYXJlbnQgTm9kZSBvbiBkb3duLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSBwb2ludHMgLSBBbiBhcnJheSBvZiB7eDp4LCB5Onl9LlxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVwdGggLSBUaGUgY3VycmVudCBkZXB0aCBmcm9tIHRoZSByb290IG5vZGUuXG4gICAqIEBwYXJhbSB7Tm9kZX0gcGFyZW50IC0gVGhlIHBhcmVudCBOb2RlLlxuICAgKi9cbiAgcHJpdmF0ZSBfYnVpbGRUcmVlKFxuICAgIHBvaW50czogUG9pbnRbXSxcbiAgICBkZXB0aDogbnVtYmVyLFxuICAgIHBhcmVudDogTm9kZTxQb2ludD4gfCBudWxsXG4gICk6IE5vZGU8UG9pbnQ+IHwgbnVsbCB7XG4gICAgLy8gRXZlcnkgc3RlcCBkZWVwZXIgaW50byB0aGUgdHJlZSB3ZSBzd2l0Y2ggdG8gdXNpbmcgYW5vdGhlciBheGlzLlxuICAgIGNvbnN0IGRpbSA9IGRlcHRoICUgdGhpcy5kaW1lbnNpb25zLmxlbmd0aDtcblxuICAgIGlmIChwb2ludHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHBvaW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBuZXcgTm9kZShwb2ludHNbMF0sIGRpbSwgcGFyZW50KTtcbiAgICB9XG5cbiAgICBwb2ludHMuc29ydCgoYSwgYikgPT4gYVt0aGlzLmRpbWVuc2lvbnNbZGltXV0gLSBiW3RoaXMuZGltZW5zaW9uc1tkaW1dXSk7XG5cbiAgICBjb25zdCBtZWRpYW4gPSBNYXRoLmZsb29yKHBvaW50cy5sZW5ndGggLyAyKTtcbiAgICBjb25zdCBub2RlID0gbmV3IE5vZGUocG9pbnRzW21lZGlhbl0sIGRpbSwgcGFyZW50KTtcbiAgICBub2RlLmxlZnQgPSB0aGlzLl9idWlsZFRyZWUocG9pbnRzLnNsaWNlKDAsIG1lZGlhbiksIGRlcHRoICsgMSwgbm9kZSk7XG4gICAgbm9kZS5yaWdodCA9IHRoaXMuX2J1aWxkVHJlZShwb2ludHMuc2xpY2UobWVkaWFuICsgMSksIGRlcHRoICsgMSwgbm9kZSk7XG5cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxufVxuIiwgImltcG9ydCB7IGNsYW1wIH0gZnJvbSBcIi4uLy4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFJlbmRlck9wdGlvbnMgfSBmcm9tIFwiLi4vcmVuZGVyZXIudHNcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4vcG9pbnQudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEYXlSb3cge1xuICBkYXk6IG51bWJlcjtcbiAgcm93OiBudW1iZXI7XG59XG5cbi8qKiBGZWF0dXJlcyBvZiB0aGUgY2hhcnQgd2UgY2FuIGFzayBmb3IgY29vcmRpbmF0ZXMgb2YsIHdoZXJlIHRoZSB2YWx1ZSByZXR1cm5lZCBpc1xuICogdGhlIHRvcCBsZWZ0IGNvb3JkaW5hdGUgb2YgdGhlIGZlYXR1cmUuXG4gKi9cbmV4cG9ydCBlbnVtIEZlYXR1cmUge1xuICB0YXNrTGluZVN0YXJ0LFxuICB0ZXh0U3RhcnQsXG4gIGdyb3VwVGV4dFN0YXJ0LFxuICBwZXJjZW50U3RhcnQsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9wLFxuICB2ZXJ0aWNhbEFycm93RGVzdEJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdCxcbiAgdmVydGljYWxBcnJvd1N0YXJ0LFxuICBob3Jpem9udGFsQXJyb3dTdGFydCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lVG9wLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tLFxuICBob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmUsXG4gIGdyb3VwRW52ZWxvcGVTdGFydCxcbiAgdGFza0VudmVsb3BlVG9wLFxuXG4gIGRpc3BsYXlSYW5nZVRvcCxcbiAgdGFza1Jvd0JvdHRvbSxcblxuICB0aW1lTWFya1N0YXJ0LFxuICB0aW1lTWFya0VuZCxcbiAgdGltZVRleHRTdGFydCxcblxuICBncm91cFRpdGxlVGV4dFN0YXJ0LFxuXG4gIHRhc2tzQ2xpcFJlY3RPcmlnaW4sXG4gIGdyb3VwQnlPcmlnaW4sXG59XG5cbi8qKiBTaXplcyBvZiBmZWF0dXJlcyBvZiBhIHJlbmRlcmVkIGNoYXJ0LiAqL1xuZXhwb3J0IGVudW0gTWV0cmljIHtcbiAgdGFza0xpbmVIZWlnaHQsXG4gIHBlcmNlbnRIZWlnaHQsXG4gIGFycm93SGVhZEhlaWdodCxcbiAgYXJyb3dIZWFkV2lkdGgsXG4gIG1pbGVzdG9uZURpYW1ldGVyLFxuICBsaW5lRGFzaExpbmUsXG4gIGxpbmVEYXNoR2FwLFxuICB0ZXh0WE9mZnNldCxcbiAgcm93SGVpZ2h0LFxufVxuXG4vKiogTWFrZXMgYSBudW1iZXIgb2RkLCBhZGRzIG9uZSBpZiBldmVuLiAqL1xuY29uc3QgbWFrZU9kZCA9IChuOiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICBpZiAobiAlIDIgPT09IDApIHtcbiAgICByZXR1cm4gbiArIDE7XG4gIH1cbiAgcmV0dXJuIG47XG59O1xuXG4vKiogU2NhbGUgY29uc29saWRhdGVzIGFsbCBjYWxjdWxhdGlvbnMgYXJvdW5kIHJlbmRlcmluZyBhIGNoYXJ0IG9udG8gYSBzdXJmYWNlLiAqL1xuZXhwb3J0IGNsYXNzIFNjYWxlIHtcbiAgcHJpdmF0ZSBkYXlXaWR0aFB4OiBudW1iZXI7XG4gIHByaXZhdGUgcm93SGVpZ2h0UHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBibG9ja1NpemVQeDogbnVtYmVyO1xuICBwcml2YXRlIHRhc2tIZWlnaHRQeDogbnVtYmVyO1xuICBwcml2YXRlIGxpbmVXaWR0aFB4OiBudW1iZXI7XG4gIHByaXZhdGUgbWFyZ2luU2l6ZVB4OiBudW1iZXI7XG4gIHByaXZhdGUgdGltZWxpbmVIZWlnaHRQeDogbnVtYmVyO1xuICBwcml2YXRlIG9yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgdG90YWxOdW1iZXJPZkRheXM6IG51bWJlcjtcbiAgcHJpdmF0ZSBncm91cEJ5Q29sdW1uV2lkdGhQeDogbnVtYmVyO1xuXG4gIHByaXZhdGUgdGltZWxpbmVPcmlnaW46IFBvaW50O1xuICBwcml2YXRlIHRhc2tzT3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSBncm91cEJ5T3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSB0YXNrc0NsaXBSZWN0T3JpZ2luOiBQb2ludDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICAgIGNhbnZhc1dpZHRoUHg6IG51bWJlcixcbiAgICB0b3RhbE51bWJlck9mRGF5czogbnVtYmVyLFxuICAgIG1heEdyb3VwTmFtZUxlbmd0aDogbnVtYmVyID0gMFxuICApIHtcbiAgICB0aGlzLnRvdGFsTnVtYmVyT2ZEYXlzID0gdG90YWxOdW1iZXJPZkRheXM7XG4gICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCA9IG1heEdyb3VwTmFtZUxlbmd0aCAqIG9wdHMuZm9udFNpemVQeDtcblxuICAgIHRoaXMuYmxvY2tTaXplUHggPSBNYXRoLmZsb29yKG9wdHMuZm9udFNpemVQeCAvIDMpO1xuICAgIHRoaXMudGFza0hlaWdodFB4ID0gbWFrZU9kZChNYXRoLmZsb29yKCh0aGlzLmJsb2NrU2l6ZVB4ICogMykgLyA0KSk7XG4gICAgdGhpcy5saW5lV2lkdGhQeCA9IG1ha2VPZGQoTWF0aC5mbG9vcih0aGlzLnRhc2tIZWlnaHRQeCAvIDMpKTtcbiAgICBjb25zdCBtaWxlc3RvbmVSYWRpdXMgPSBNYXRoLmNlaWwodGhpcy50YXNrSGVpZ2h0UHggLyAyKSArIHRoaXMubGluZVdpZHRoUHg7XG4gICAgdGhpcy5tYXJnaW5TaXplUHggPSBtaWxlc3RvbmVSYWRpdXM7XG4gICAgdGhpcy50aW1lbGluZUhlaWdodFB4ID0gb3B0cy5oYXNUaW1lbGluZVxuICAgICAgPyBNYXRoLmNlaWwoKG9wdHMuZm9udFNpemVQeCAqIDQpIC8gMylcbiAgICAgIDogMDtcblxuICAgIHRoaXMudGltZWxpbmVPcmlnaW4gPSBuZXcgUG9pbnQobWlsZXN0b25lUmFkaXVzLCAwKTtcbiAgICB0aGlzLmdyb3VwQnlPcmlnaW4gPSBuZXcgUG9pbnQoMCwgbWlsZXN0b25lUmFkaXVzICsgdGhpcy50aW1lbGluZUhlaWdodFB4KTtcblxuICAgIGxldCBiZWdpbk9mZnNldCA9IDA7XG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlID09PSBudWxsIHx8IG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwiaGlnaGxpZ2h0XCIpIHtcbiAgICAgIC8vIERvIG5vdCBmb3JjZSBkYXlXaWR0aFB4IHRvIGFuIGludGVnZXIsIGl0IGNvdWxkIGdvIHRvIDAgYW5kIGNhdXNlIGFsbFxuICAgICAgLy8gdGFza3MgdG8gYmUgcmVuZGVyZWQgYXQgMCB3aWR0aC5cbiAgICAgIHRoaXMuZGF5V2lkdGhQeCA9XG4gICAgICAgIChjYW52YXNXaWR0aFB4IC0gdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIDIgKiB0aGlzLm1hcmdpblNpemVQeCkgL1xuICAgICAgICB0b3RhbE51bWJlck9mRGF5cztcbiAgICAgIHRoaXMub3JpZ2luID0gbmV3IFBvaW50KDAsIDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTaG91bGQgd2Ugc2V0IHgtbWFyZ2lucyB0byAwIGlmIGEgU3ViUmFuZ2UgaXMgcmVxdWVzdGVkP1xuICAgICAgLy8gT3Igc2hvdWxkIHdlIHRvdGFsbHkgZHJvcCBhbGwgbWFyZ2lucyBmcm9tIGhlcmUgYW5kIGp1c3QgdXNlXG4gICAgICAvLyBDU1MgbWFyZ2lucyBvbiB0aGUgY2FudmFzIGVsZW1lbnQ/XG4gICAgICB0aGlzLmRheVdpZHRoUHggPVxuICAgICAgICAoY2FudmFzV2lkdGhQeCAtIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggLSAyICogdGhpcy5tYXJnaW5TaXplUHgpIC9cbiAgICAgICAgb3B0cy5kaXNwbGF5UmFuZ2UucmFuZ2VJbkRheXM7XG4gICAgICBiZWdpbk9mZnNldCA9IE1hdGguZmxvb3IoXG4gICAgICAgIHRoaXMuZGF5V2lkdGhQeCAqIG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luICsgdGhpcy5tYXJnaW5TaXplUHhcbiAgICAgICk7XG4gICAgICB0aGlzLm9yaWdpbiA9IG5ldyBQb2ludCgtYmVnaW5PZmZzZXQgKyB0aGlzLm1hcmdpblNpemVQeCwgMCk7XG4gICAgfVxuXG4gICAgdGhpcy50YXNrc09yaWdpbiA9IG5ldyBQb2ludChcbiAgICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggLSBiZWdpbk9mZnNldCArIG1pbGVzdG9uZVJhZGl1cyxcbiAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCArIG1pbGVzdG9uZVJhZGl1c1xuICAgICk7XG5cbiAgICB0aGlzLnRhc2tzQ2xpcFJlY3RPcmlnaW4gPSBuZXcgUG9pbnQoXG4gICAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4LFxuICAgICAgdGhpcy50aW1lbGluZUhlaWdodFB4XG4gICAgKTtcblxuICAgIGlmIChvcHRzLmhhc1RleHQpIHtcbiAgICAgIHRoaXMucm93SGVpZ2h0UHggPSA2ICogdGhpcy5ibG9ja1NpemVQeDsgLy8gVGhpcyBtaWdodCBhbHNvIGJlIGAoY2FudmFzSGVpZ2h0UHggLSAyICogb3B0cy5tYXJnaW5TaXplUHgpIC8gbnVtYmVyU3dpbUxhbmVzYCBpZiBoZWlnaHQgaXMgc3VwcGxpZWQ/XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucm93SGVpZ2h0UHggPSAxLjEgKiB0aGlzLmJsb2NrU2l6ZVB4O1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSBjaGFydC4gTm90ZSB0aGF0IGl0J3Mgbm90IGNvbnN0cmFpbmVkIGJ5IHRoZSBjYW52YXMuICovXG4gIHB1YmxpYyBoZWlnaHQobWF4Um93czogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gKFxuICAgICAgbWF4Um93cyAqIHRoaXMucm93SGVpZ2h0UHggKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHggKyAyICogdGhpcy5tYXJnaW5TaXplUHhcbiAgICApO1xuICB9XG5cbiAgcHVibGljIGRheVJvd0Zyb21Qb2ludChwb2ludDogUG9pbnQpOiBEYXlSb3cge1xuICAgIC8vIFRoaXMgc2hvdWxkIGFsc28gY2xhbXAgdGhlIHJldHVybmVkICd4JyB2YWx1ZSB0byBbMCwgbWF4Um93cykuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRheTogY2xhbXAoXG4gICAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgICAgKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICogcG9pbnQueCAtXG4gICAgICAgICAgICB0aGlzLm9yaWdpbi54IC1cbiAgICAgICAgICAgIHRoaXMubWFyZ2luU2l6ZVB4IC1cbiAgICAgICAgICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHgpIC9cbiAgICAgICAgICAgIHRoaXMuZGF5V2lkdGhQeFxuICAgICAgICApLFxuICAgICAgICAwLFxuICAgICAgICB0aGlzLnRvdGFsTnVtYmVyT2ZEYXlzXG4gICAgICApLFxuICAgICAgcm93OiBNYXRoLmZsb29yKFxuICAgICAgICAod2luZG93LmRldmljZVBpeGVsUmF0aW8gKiBwb2ludC55IC1cbiAgICAgICAgICB0aGlzLm9yaWdpbi55IC1cbiAgICAgICAgICB0aGlzLm1hcmdpblNpemVQeCAtXG4gICAgICAgICAgdGhpcy50aW1lbGluZUhlaWdodFB4KSAvXG4gICAgICAgICAgdGhpcy5yb3dIZWlnaHRQeFxuICAgICAgKSxcbiAgICB9O1xuICB9XG5cbiAgLyoqIFRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveCBmb3IgYSBzaW5nbGUgdGFzay4gKi9cbiAgcHJpdmF0ZSB0YXNrUm93RW52ZWxvcGVTdGFydChyb3c6IG51bWJlciwgZGF5OiBudW1iZXIpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLnN1bShcbiAgICAgIG5ldyBQb2ludChcbiAgICAgICAgTWF0aC5mbG9vcihcbiAgICAgICAgICBkYXkgKiB0aGlzLmRheVdpZHRoUHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHhcbiAgICAgICAgKSxcbiAgICAgICAgTWF0aC5mbG9vcihcbiAgICAgICAgICByb3cgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHhcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gIHByaXZhdGUgZ3JvdXBSb3dFbnZlbG9wZVN0YXJ0KHJvdzogbnVtYmVyLCBkYXk6IG51bWJlcik6IFBvaW50IHtcbiAgICByZXR1cm4gdGhpcy5ncm91cEJ5T3JpZ2luLnN1bShcbiAgICAgIG5ldyBQb2ludChcbiAgICAgICAgMCxcbiAgICAgICAgcm93ICogdGhpcy5yb3dIZWlnaHRQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4XG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgZ3JvdXBIZWFkZXJTdGFydCgpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLnN1bShuZXcgUG9pbnQodGhpcy5tYXJnaW5TaXplUHgsIHRoaXMubWFyZ2luU2l6ZVB4KSk7XG4gIH1cblxuICBwcml2YXRlIHRpbWVFbnZlbG9wZVN0YXJ0KGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5zdW0oXG4gICAgICBuZXcgUG9pbnQoXG4gICAgICAgIGRheSAqIHRoaXMuZGF5V2lkdGhQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCxcbiAgICAgICAgMFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgY29vcmRpbmF0ZSBvZiB0aGUgaXRlbSAqL1xuICBmZWF0dXJlKHJvdzogbnVtYmVyLCBkYXk6IG51bWJlciwgY29vcmQ6IEZlYXR1cmUpOiBQb2ludCB7XG4gICAgc3dpdGNoIChjb29yZCkge1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tMaW5lU3RhcnQ6XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3A6XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5yb3dIZWlnaHRQeCAtIHRoaXMuYmxvY2tTaXplUHhcbiAgICAgICAgKTtcblxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0Qm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKDAsIHRoaXMucm93SGVpZ2h0UHgpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4LFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHhcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cFRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeCxcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4XG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUucGVyY2VudFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5yb3dIZWlnaHRQeCAtIHRoaXMubGluZVdpZHRoUHhcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0OlxuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgTWF0aC5mbG9vcih0aGlzLnJvd0hlaWdodFB4IC0gMC41ICogdGhpcy5ibG9ja1NpemVQeCkgLSAxXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcCkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcCkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3RUb01pbGVzdG9uZTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0KS5hZGQoXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcblxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0KS5hZGQoXG4gICAgICAgICAgdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgICAwXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza0VudmVsb3BlVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBFbnZlbG9wZVN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cFJvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRpbWVNYXJrU3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZU1hcmtFbmQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSkuYWRkKDAsIHRoaXMucm93SGVpZ2h0UHggKiAocm93ICsgMSkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRpbWVUZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSkuYWRkKHRoaXMuYmxvY2tTaXplUHgsIDApO1xuXG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBUaXRsZVRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBIZWFkZXJTdGFydCgpLmFkZCh0aGlzLmJsb2NrU2l6ZVB4LCAwKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5kaXNwbGF5UmFuZ2VUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza1Jvd0JvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93ICsgMSwgZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrc0NsaXBSZWN0T3JpZ2luOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrc0NsaXBSZWN0T3JpZ2luO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwQnlPcmlnaW46XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwQnlPcmlnaW47XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBUaGUgbGluZSBiZWxvdyB3aWxsIG5vdCBjb21waWxlIGlmIHlvdSBtaXNzZWQgYW4gZW51bSBpbiB0aGUgc3dpdGNoIGFib3ZlLlxuICAgICAgICBjb29yZCBzYXRpc2ZpZXMgbmV2ZXI7XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQoMCwgMCk7XG4gICAgfVxuICB9XG5cbiAgbWV0cmljKGZlYXR1cmU6IE1ldHJpYyk6IG51bWJlciB7XG4gICAgc3dpdGNoIChmZWF0dXJlKSB7XG4gICAgICBjYXNlIE1ldHJpYy50YXNrTGluZUhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza0hlaWdodFB4O1xuICAgICAgY2FzZSBNZXRyaWMucGVyY2VudEhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMubGluZVdpZHRoUHg7XG4gICAgICBjYXNlIE1ldHJpYy5hcnJvd0hlYWRIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tIZWlnaHRQeDtcbiAgICAgIGNhc2UgTWV0cmljLmFycm93SGVhZFdpZHRoOlxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4KTtcbiAgICAgIGNhc2UgTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyOlxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4KTtcbiAgICAgIGNhc2UgTWV0cmljLmxpbmVEYXNoTGluZTpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy5saW5lRGFzaEdhcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy50ZXh0WE9mZnNldDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy5yb3dIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLnJvd0hlaWdodFB4O1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gVGhlIGxpbmUgYmVsb3cgd2lsbCBub3QgY29tcGlsZSBpZiB5b3UgbWlzc2VkIGFuIGVudW0gaW4gdGhlIHN3aXRjaCBhYm92ZS5cbiAgICAgICAgZmVhdHVyZSBzYXRpc2ZpZXMgbmV2ZXI7XG4gICAgICAgIHJldHVybiAwLjA7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHsgVGFzaywgdmFsaWRhdGVDaGFydCB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgQ2hhcnRMaWtlLCBmaWx0ZXIsIEZpbHRlckZ1bmMgfSBmcm9tIFwiLi4vY2hhcnQvZmlsdGVyL2ZpbHRlci50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBWZXJ0ZXhJbmRpY2VzIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBSZXNvdXJjZURlZmluaXRpb24gfSBmcm9tIFwiLi4vcmVzb3VyY2VzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBvayB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFNwYW4gfSBmcm9tIFwiLi4vc2xhY2svc2xhY2sudHNcIjtcbmltcG9ydCB7IFRhc2tEdXJhdGlvbiB9IGZyb20gXCIuLi90eXBlcy90eXBlcy50c1wiO1xuaW1wb3J0IHsgS0RUcmVlIH0gZnJvbSBcIi4va2Qva2QudHNcIjtcbmltcG9ydCB7IERpc3BsYXlSYW5nZSB9IGZyb20gXCIuL3JhbmdlL3JhbmdlLnRzXCI7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuL3NjYWxlL3BvaW50LnRzXCI7XG5pbXBvcnQgeyBGZWF0dXJlLCBNZXRyaWMsIFNjYWxlIH0gZnJvbSBcIi4vc2NhbGUvc2NhbGUudHNcIjtcblxudHlwZSBEaXJlY3Rpb24gPSBcInVwXCIgfCBcImRvd25cIjtcblxuZXhwb3J0IGludGVyZmFjZSBDb2xvcnMge1xuICBzdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2VNdXRlZDogc3RyaW5nO1xuICBvblN1cmZhY2VIaWdobGlnaHQ6IHN0cmluZztcbiAgb3ZlcmxheTogc3RyaW5nO1xuICBncm91cENvbG9yOiBzdHJpbmc7XG4gIGhpZ2hsaWdodDogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBUYXNrSW5kZXhUb1JvdyA9IE1hcDxudW1iZXIsIG51bWJlcj47XG5cbi8qKiBGdW5jdGlvbiB1c2UgdG8gcHJvZHVjZSBhIHRleHQgbGFiZWwgZm9yIGEgdGFzayBhbmQgaXRzIHNsYWNrLiAqL1xuZXhwb3J0IHR5cGUgVGFza0xhYmVsID0gKHRhc2tJbmRleDogbnVtYmVyKSA9PiBzdHJpbmc7XG5cbi8qKiBDb250cm9scyBvZiB0aGUgZGlzcGxheVJhbmdlIGluIFJlbmRlck9wdGlvbnMgaXMgdXNlZC5cbiAqXG4gKiAgXCJyZXN0cmljdFwiOiBPbmx5IGRpc3BsYXkgdGhlIHBhcnRzIG9mIHRoZSBjaGFydCB0aGF0IGFwcGVhciBpbiB0aGUgcmFuZ2UuXG4gKlxuICogIFwiaGlnaGxpZ2h0XCI6IERpc3BsYXkgdGhlIGZ1bGwgcmFuZ2Ugb2YgdGhlIGRhdGEsIGJ1dCBoaWdobGlnaHQgdGhlIHJhbmdlLlxuICovXG5leHBvcnQgdHlwZSBEaXNwbGF5UmFuZ2VVc2FnZSA9IFwicmVzdHJpY3RcIiB8IFwiaGlnaGxpZ2h0XCI7XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0VGFza0xhYmVsOiBUYXNrTGFiZWwgPSAodGFza0luZGV4OiBudW1iZXIpOiBzdHJpbmcgPT5cbiAgdGFza0luZGV4LnRvRml4ZWQoMCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyT3B0aW9ucyB7XG4gIC8qKiBUaGUgdGV4dCBmb250IHNpemUsIHRoaXMgZHJpdmVzIHRoZSBzaXplIG9mIGFsbCBvdGhlciBjaGFydCBmZWF0dXJlcy5cbiAgICogKi9cbiAgZm9udFNpemVQeDogbnVtYmVyO1xuXG4gIC8qKiBEaXNwbGF5IHRleHQgaWYgdHJ1ZS4gKi9cbiAgaGFzVGV4dDogYm9vbGVhbjtcblxuICAvKiogSWYgc3VwcGxpZWQgdGhlbiBvbmx5IHRoZSB0YXNrcyBpbiB0aGUgZ2l2ZW4gcmFuZ2Ugd2lsbCBiZSBkaXNwbGF5ZWQuICovXG4gIGRpc3BsYXlSYW5nZTogRGlzcGxheVJhbmdlIHwgbnVsbDtcblxuICAvKiogQ29udHJvbHMgaG93IHRoZSBgZGlzcGxheVJhbmdlYCBpcyB1c2VkIGlmIHN1cHBsaWVkLiAqL1xuICBkaXNwbGF5UmFuZ2VVc2FnZTogRGlzcGxheVJhbmdlVXNhZ2U7XG5cbiAgLyoqIFRoZSBjb2xvciB0aGVtZS4gKi9cbiAgY29sb3JzOiBDb2xvcnM7XG5cbiAgLyoqIElmIHRydWUgdGhlbiBkaXNwbGF5IHRpbWVzIGF0IHRoZSB0b3Agb2YgdGhlIGNoYXJ0LiAqL1xuICBoYXNUaW1lbGluZTogYm9vbGVhbjtcblxuICAvKiogSWYgdHJ1ZSB0aGVuIGRpc3BsYXkgdGhlIHRhc2sgYmFycy4gKi9cbiAgaGFzVGFza3M6IGJvb2xlYW47XG5cbiAgLyoqIElmIHRydWUgdGhlbiBkcmF3IHZlcnRpY2FsIGxpbmVzIGZyb20gdGhlIHRpbWVsaW5lIGRvd24gdG8gdGFzayBzdGFydCBhbmRcbiAgICogZmluaXNoIHBvaW50cy4gKi9cbiAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogYm9vbGVhbjtcblxuICAvKiogRHJhdyBkZXBlbmRlbmN5IGVkZ2VzIGJldHdlZW4gdGFza3MgaWYgdHJ1ZS4gKi9cbiAgaGFzRWRnZXM6IGJvb2xlYW47XG5cbiAgLyoqIEZ1bmN0aW9uIHRoYXQgcHJvZHVjZXMgZGlzcGxheSB0ZXh0IGZvciBhIFRhc2sgYW5kIGl0cyBhc3NvY2lhdGVkIFNsYWNrLiAqL1xuICB0YXNrTGFiZWw6IFRhc2tMYWJlbDtcblxuICAvKiogUmV0dXJucyB0aGUgZHVyYXRpb24gZm9yIGEgZ2l2ZW4gdGFzay4gKi9cbiAgdGFza0R1cmF0aW9uOiBUYXNrRHVyYXRpb247XG5cbiAgLyoqIFRoZSBpbmRpY2VzIG9mIHRhc2tzIHRoYXQgc2hvdWxkIGJlIGVtcGhhc2l6ZWQgd2hlbiBkcmF3LCB0eXBpY2FsbHkgdXNlZFxuICAgKiB0byBkZW5vdGUgdGhlIGNyaXRpY2FsIHBhdGguICovXG4gIHRhc2tFbXBoYXNpemU6IG51bWJlcltdO1xuXG4gIC8qKiBGaWx0ZXIgdGhlIFRhc2tzIHRvIGJlIGRpc3BsYXllZC4gKi9cbiAgZmlsdGVyRnVuYzogRmlsdGVyRnVuYyB8IG51bGw7XG5cbiAgLyoqIEdyb3VwIHRoZSB0YXNrcyB0b2dldGhlciB2ZXJ0aWNhbGx5IGJhc2VkIG9uIHRoZSBnaXZlbiByZXNvdXJjZS4gSWYgdGhlXG4gICAqIGVtcHR5IHN0cmluZyBpcyBzdXBwbGllZCB0aGVuIGp1c3QgZGlzcGxheSBieSB0b3BvbG9naWNhbCBvcmRlci5cbiAgICovXG4gIGdyb3VwQnlSZXNvdXJjZTogc3RyaW5nO1xuXG4gIC8qKiBUYXNrIHRvIGhpZ2hsaWdodC4gKi9cbiAgaGlnaGxpZ2h0ZWRUYXNrOiBudWxsIHwgbnVtYmVyO1xuXG4gIC8qKiBUaGUgaW5kZXggb2YgdGhlIHNlbGVjdGVkIHRhc2ssIG9yIC0xIGlmIG5vIHRhc2sgaXMgc2VsZWN0ZWQuIFRoaXMgaXNcbiAgICogYWx3YXlzIGFuIGluZGV4IGludG8gdGhlIG9yaWdpbmFsIGNoYXJ0LCBhbmQgbm90IGFuIGluZGV4IGludG8gYSBmaWx0ZXJlZFxuICAgKiBjaGFydC5cbiAgICovXG4gIHNlbGVjdGVkVGFza0luZGV4OiBudW1iZXI7XG59XG5cbmNvbnN0IHZlcnRpY2FsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKFxuICB0YXNrOiBUYXNrLFxuICBkaXJlY3Rpb246IERpcmVjdGlvblxuKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVCb3R0b207XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVUb3A7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0O1xuICB9XG59O1xuXG5jb25zdCB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKFxuICB0YXNrOiBUYXNrLFxuICBkaXJlY3Rpb246IERpcmVjdGlvblxuKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVUb3A7XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVCb3R0b207XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wO1xuICAgIH1cbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdEJvdHRvbTtcbiAgfVxufTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuY29uc3QgaG9yaXpvbnRhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9ICh0YXNrOiBUYXNrKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0O1xuICB9XG59O1xuXG5jb25zdCBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAodGFzazogVGFzayk6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3RUb01pbGVzdG9uZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0O1xuICB9XG59O1xuXG4vKipcbiAqIENvbXB1dGUgd2hhdCB0aGUgaGVpZ2h0IG9mIHRoZSBjYW52YXMgc2hvdWxkIGJlLiBOb3RlIHRoYXQgdGhlIHZhbHVlIGRvZXNuJ3RcbiAqIGtub3cgYWJvdXQgYHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvYCwgc28gaWYgdGhlIGNhbnZhcyBpcyBhbHJlYWR5IHNjYWxlZCBieVxuICogYHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvYCB0aGVuIHNvIHdpbGwgdGhlIHJlc3VsdCBvZiB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VnZ2VzdGVkQ2FudmFzSGVpZ2h0KFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxuICBzcGFuczogU3BhbltdLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBtYXhSb3dzOiBudW1iZXJcbik6IG51bWJlciB7XG4gIGlmICghb3B0cy5oYXNUYXNrcykge1xuICAgIG1heFJvd3MgPSAwO1xuICB9XG4gIHJldHVybiBuZXcgU2NhbGUoXG4gICAgb3B0cyxcbiAgICBjYW52YXMud2lkdGgsXG4gICAgc3BhbnNbc3BhbnMubGVuZ3RoIC0gMV0uZmluaXNoICsgMVxuICApLmhlaWdodChtYXhSb3dzKTtcbn1cblxuLy8gVGhlIGxvY2F0aW9uLCBpbiBjYW52YXMgcGl4ZWwgY29vcmRpbmF0ZXMsIG9mIGVhY2ggdGFzayBiYXIuIFNob3VsZCB1c2UgdGhlXG4vLyB0ZXh0IG9mIHRoZSB0YXNrIGxhYmVsIGFzIHRoZSBsb2NhdGlvbiwgc2luY2UgdGhhdCdzIGFsd2F5cyBkcmF3biBpbiB0aGUgdmlld1xuLy8gaWYgcG9zc2libGUuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tMb2NhdGlvbiB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuXG4gIC8vIFRoYXQgaW5kZXggb2YgdGhlIHRhc2sgaW4gdGhlIHVuZmlsdGVyZWQgQ2hhcnQuXG4gIG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXI7XG59XG5cbnR5cGUgVXBkYXRlVHlwZSA9IFwibW91c2Vtb3ZlXCIgfCBcIm1vdXNlZG93blwiO1xuXG4vLyBBIGZ1bmMgdGhhdCB0YWtlcyBhIFBvaW50IGFuZCByZWRyYXdzIHRoZSBoaWdobGlnaHRlZCB0YXNrIGlmIG5lZWRlZCwgcmV0dXJuc1xuLy8gdGhlIGluZGV4IG9mIHRoZSB0YXNrIHRoYXQgaXMgaGlnaGxpZ2h0ZWQuXG5leHBvcnQgdHlwZSBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgPSAoXG4gIHBvaW50OiBQb2ludCxcbiAgdXBkYXRlVHlwZTogVXBkYXRlVHlwZVxuKSA9PiBudW1iZXIgfCBudWxsO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlclJlc3VsdCB7XG4gIHNjYWxlOiBTY2FsZTtcbiAgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zOiBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgfCBudWxsO1xuICBzZWxlY3RlZFRhc2tMb2NhdGlvbjogUG9pbnQgfCBudWxsO1xufVxuXG4vLyBUT0RPIC0gUGFzcyBpbiBtYXggcm93cywgYW5kIGEgbWFwcGluZyB0aGF0IG1hcHMgZnJvbSB0YXNrSW5kZXggdG8gcm93LFxuLy8gYmVjYXVzZSB0d28gZGlmZmVyZW50IHRhc2tzIG1pZ2h0IGJlIHBsYWNlZCBvbiB0aGUgc2FtZSByb3cuIEFsc28gd2Ugc2hvdWxkXG4vLyBwYXNzIGluIG1heCByb3dzPyBPciBzaG91bGQgdGhhdCBjb21lIGZyb20gdGhlIGFib3ZlIG1hcHBpbmc/XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyVGFza3NUb0NhbnZhcyhcbiAgcGFyZW50OiBIVE1MRWxlbWVudCxcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHBsYW46IFBsYW4sXG4gIHNwYW5zOiBTcGFuW10sXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIG92ZXJsYXk6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCA9IG51bGxcbik6IFJlc3VsdDxSZW5kZXJSZXN1bHQ+IHtcbiAgY29uc3QgdnJldCA9IHZhbGlkYXRlQ2hhcnQocGxhbi5jaGFydCk7XG4gIGlmICghdnJldC5vaykge1xuICAgIHJldHVybiB2cmV0O1xuICB9XG5cbiAgY29uc3QgdGFza0xvY2F0aW9uczogVGFza0xvY2F0aW9uW10gPSBbXTtcblxuICBjb25zdCBvcmlnaW5hbExhYmVscyA9IHBsYW4uY2hhcnQuVmVydGljZXMubWFwKFxuICAgICh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4gb3B0cy50YXNrTGFiZWwodGFza0luZGV4KVxuICApO1xuXG4gIC8vIEFwcGx5IHRoZSBmaWx0ZXIgYW5kIHdvcmsgd2l0aCB0aGUgQ2hhcnRMaWtlIHJldHVybiBmcm9tIHRoaXMgcG9pbnQgb24uXG4gIC8vIEZpdGxlciBhbHNvIG5lZWRzIHRvIGJlIGFwcGxpZWQgdG8gc3BhbnMuXG4gIGNvbnN0IGZyZXQgPSBmaWx0ZXIoXG4gICAgcGxhbi5jaGFydCxcbiAgICBvcHRzLmZpbHRlckZ1bmMsXG4gICAgb3B0cy50YXNrRW1waGFzaXplLFxuICAgIHNwYW5zLFxuICAgIG9yaWdpbmFsTGFiZWxzLFxuICAgIG9wdHMuc2VsZWN0ZWRUYXNrSW5kZXhcbiAgKTtcbiAgaWYgKCFmcmV0Lm9rKSB7XG4gICAgcmV0dXJuIGZyZXQ7XG4gIH1cbiAgY29uc3QgY2hhcnRMaWtlID0gZnJldC52YWx1ZS5jaGFydExpa2U7XG4gIGNvbnN0IGxhYmVscyA9IGZyZXQudmFsdWUubGFiZWxzO1xuICBjb25zdCByZXNvdXJjZURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbihvcHRzLmdyb3VwQnlSZXNvdXJjZSk7XG4gIGNvbnN0IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4ID1cbiAgICBmcmV0LnZhbHVlLmZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4O1xuICBjb25zdCBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleCA9XG4gICAgZnJldC52YWx1ZS5mcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleDtcblxuICAvLyBTZWxlY3RlZCB0YXNrLCBhcyBhbiBpbmRleCBpbnRvIHRoZSB1bmZpbHRlcmVkIENoYXJ0LlxuICBsZXQgbGFzdFNlbGVjdGVkVGFza0luZGV4ID0gb3B0cy5zZWxlY3RlZFRhc2tJbmRleDtcblxuICAvLyBIaWdobGlnaHRlZCB0YXNrcy5cbiAgY29uc3QgZW1waGFzaXplZFRhc2tzOiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoZnJldC52YWx1ZS5lbXBoYXNpemVkVGFza3MpO1xuICBzcGFucyA9IGZyZXQudmFsdWUuc3BhbnM7XG5cbiAgLy8gQ2FsY3VsYXRlIGhvdyB3aWRlIHdlIG5lZWQgdG8gbWFrZSB0aGUgZ3JvdXBCeSBjb2x1bW4uXG4gIGxldCBtYXhHcm91cE5hbWVMZW5ndGggPSAwO1xuICBpZiAob3B0cy5ncm91cEJ5UmVzb3VyY2UgIT09IFwiXCIgJiYgb3B0cy5oYXNUZXh0KSB7XG4gICAgbWF4R3JvdXBOYW1lTGVuZ3RoID0gb3B0cy5ncm91cEJ5UmVzb3VyY2UubGVuZ3RoO1xuICAgIGlmIChyZXNvdXJjZURlZmluaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlcy5mb3JFYWNoKCh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIG1heEdyb3VwTmFtZUxlbmd0aCA9IE1hdGgubWF4KG1heEdyb3VwTmFtZUxlbmd0aCwgdmFsdWUubGVuZ3RoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHRvdGFsTnVtYmVyT2ZSb3dzID0gc3BhbnMubGVuZ3RoO1xuICBjb25zdCB0b3RhbE51bWJlck9mRGF5cyA9IHNwYW5zW3NwYW5zLmxlbmd0aCAtIDFdLmZpbmlzaDtcbiAgY29uc3Qgc2NhbGUgPSBuZXcgU2NhbGUoXG4gICAgb3B0cyxcbiAgICBjYW52YXMud2lkdGgsXG4gICAgdG90YWxOdW1iZXJPZkRheXMgKyAxLFxuICAgIG1heEdyb3VwTmFtZUxlbmd0aFxuICApO1xuXG4gIGNvbnN0IHRhc2tMaW5lSGVpZ2h0ID0gc2NhbGUubWV0cmljKE1ldHJpYy50YXNrTGluZUhlaWdodCk7XG4gIGNvbnN0IGRpYW1vbmREaWFtZXRlciA9IHNjYWxlLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpO1xuICBjb25zdCBwZXJjZW50SGVpZ2h0ID0gc2NhbGUubWV0cmljKE1ldHJpYy5wZXJjZW50SGVpZ2h0KTtcbiAgY29uc3QgYXJyb3dIZWFkSGVpZ2h0ID0gc2NhbGUubWV0cmljKE1ldHJpYy5hcnJvd0hlYWRIZWlnaHQpO1xuICBjb25zdCBhcnJvd0hlYWRXaWR0aCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMuYXJyb3dIZWFkV2lkdGgpO1xuICBjb25zdCBkYXlzV2l0aFRpbWVNYXJrZXJzOiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoKTtcbiAgY29uc3QgdGlyZXQgPSB0YXNrSW5kZXhUb1Jvd0Zyb21Hcm91cEJ5KFxuICAgIG9wdHMsXG4gICAgcmVzb3VyY2VEZWZpbml0aW9uLFxuICAgIGNoYXJ0TGlrZSxcbiAgICBmcmV0LnZhbHVlLmRpc3BsYXlPcmRlclxuICApO1xuICBpZiAoIXRpcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHRpcmV0O1xuICB9XG4gIGNvbnN0IHRhc2tJbmRleFRvUm93ID0gdGlyZXQudmFsdWUudGFza0luZGV4VG9Sb3c7XG4gIGNvbnN0IHJvd1JhbmdlcyA9IHRpcmV0LnZhbHVlLnJvd1JhbmdlcztcblxuICAvLyBTZXQgdXAgY2FudmFzIGJhc2ljcy5cbiAgY2xlYXJDYW52YXMoY3R4LCBvcHRzLCBjYW52YXMpO1xuICBzZXRGb250U2l6ZShjdHgsIG9wdHMpO1xuXG4gIGNvbnN0IGNsaXBSZWdpb24gPSBuZXcgUGF0aDJEKCk7XG4gIGNvbnN0IGNsaXBPcmlnaW4gPSBzY2FsZS5mZWF0dXJlKDAsIDAsIEZlYXR1cmUudGFza3NDbGlwUmVjdE9yaWdpbik7XG4gIGNvbnN0IGNsaXBXaWR0aCA9IGNhbnZhcy53aWR0aCAtIGNsaXBPcmlnaW4ueDtcbiAgY2xpcFJlZ2lvbi5yZWN0KGNsaXBPcmlnaW4ueCwgMCwgY2xpcFdpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAvLyBEcmF3IGJpZyByZWQgcmVjdCBvdmVyIHdoZXJlIHRoZSBjbGlwIHJlZ2lvbiB3aWxsIGJlLlxuICBpZiAoMCkge1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2UoY2xpcFJlZ2lvbik7XG4gIH1cblxuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG5cbiAgaWYgKHJvd1JhbmdlcyAhPT0gbnVsbCkge1xuICAgIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgICBkcmF3U3dpbUxhbmVIaWdobGlnaHRzKFxuICAgICAgICBjdHgsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICByb3dSYW5nZXMsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzLFxuICAgICAgICBvcHRzLmNvbG9ycy5ncm91cENvbG9yXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChyZXNvdXJjZURlZmluaXRpb24gIT09IHVuZGVmaW5lZCAmJiBvcHRzLmhhc1RleHQpIHtcbiAgICAgIGRyYXdTd2ltTGFuZUxhYmVscyhjdHgsIG9wdHMsIHJlc291cmNlRGVmaW5pdGlvbiwgc2NhbGUsIHJvd1Jhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuXG4gIGN0eC5zYXZlKCk7XG4gIGN0eC5jbGlwKGNsaXBSZWdpb24pO1xuXG4gIGludGVyZmFjZSBSZWN0Q29ybmVycyB7XG4gICAgdG9wTGVmdDogUG9pbnQ7XG4gICAgYm90dG9tUmlnaHQ6IFBvaW50O1xuICB9XG4gIGNvbnN0IHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnM6IE1hcDxudW1iZXIsIFJlY3RDb3JuZXJzPiA9IG5ldyBNYXAoKTtcblxuICAvLyBEcmF3IHRhc2tzIGluIHRoZWlyIHJvd3MuXG4gIGNoYXJ0TGlrZS5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHJvdyA9IHRhc2tJbmRleFRvUm93LmdldCh0YXNrSW5kZXgpITtcbiAgICBjb25zdCBzcGFuID0gc3BhbnNbdGFza0luZGV4XTtcbiAgICBjb25zdCB0YXNrU3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgc3Bhbi5zdGFydCwgRmVhdHVyZS50YXNrTGluZVN0YXJ0KTtcbiAgICBjb25zdCB0YXNrRW5kID0gc2NhbGUuZmVhdHVyZShyb3csIHNwYW4uZmluaXNoLCBGZWF0dXJlLnRhc2tMaW5lU3RhcnQpO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuXG4gICAgLy8gRHJhdyBpbiB0aW1lIG1hcmtlcnMgaWYgZGlzcGxheWVkLlxuICAgIC8vIFRPRE8gLSBNYWtlIHN1cmUgdGhleSBkb24ndCBvdmVybGFwLlxuICAgIGlmIChvcHRzLmRyYXdUaW1lTWFya2Vyc09uVGFza3MpIHtcbiAgICAgIGRyYXdUaW1lTWFya2VyQXREYXlUb1Rhc2soXG4gICAgICAgIGN0eCxcbiAgICAgICAgcm93LFxuICAgICAgICBzcGFuLnN0YXJ0LFxuICAgICAgICB0YXNrLFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgZGF5c1dpdGhUaW1lTWFya2Vyc1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoZW1waGFzaXplZFRhc2tzLmhhcyh0YXNrSW5kZXgpKSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICAgIH1cbiAgICBjb25zdCBoaWdobGlnaHRUb3BMZWZ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvdyxcbiAgICAgIHNwYW4uc3RhcnQsXG4gICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICk7XG4gICAgY29uc3QgaGlnaGxpZ2h0Qm90dG9tUmlnaHQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgcm93ICsgMSxcbiAgICAgIHNwYW4uZmluaXNoLFxuICAgICAgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3BcbiAgICApO1xuXG4gICAgdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5zZXQodGFza0luZGV4LCB7XG4gICAgICB0b3BMZWZ0OiBoaWdobGlnaHRUb3BMZWZ0LFxuICAgICAgYm90dG9tUmlnaHQ6IGhpZ2hsaWdodEJvdHRvbVJpZ2h0LFxuICAgIH0pO1xuICAgIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgICBpZiAodGFza1N0YXJ0LnggPT09IHRhc2tFbmQueCkge1xuICAgICAgICBkcmF3TWlsZXN0b25lKGN0eCwgdGFza1N0YXJ0LCBkaWFtb25kRGlhbWV0ZXIsIHBlcmNlbnRIZWlnaHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHJhd1Rhc2tCYXIoY3R4LCB0YXNrU3RhcnQsIHRhc2tFbmQsIHRhc2tMaW5lSGVpZ2h0KTtcbiAgICAgIH1cblxuICAgICAgLy8gU2tpcCBkcmF3aW5nIHRoZSB0ZXh0IG9mIHRoZSBTdGFydCBhbmQgRmluaXNoIHRhc2tzLlxuICAgICAgaWYgKHRhc2tJbmRleCAhPT0gMCAmJiB0YXNrSW5kZXggIT09IHRvdGFsTnVtYmVyT2ZSb3dzIC0gMSkge1xuICAgICAgICBkcmF3VGFza1RleHQoXG4gICAgICAgICAgY3R4LFxuICAgICAgICAgIG9wdHMsXG4gICAgICAgICAgc2NhbGUsXG4gICAgICAgICAgcm93LFxuICAgICAgICAgIHNwYW4sXG4gICAgICAgICAgdGFzayxcbiAgICAgICAgICB0YXNrSW5kZXgsXG4gICAgICAgICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXguZ2V0KHRhc2tJbmRleCkhLFxuICAgICAgICAgIGNsaXBXaWR0aCxcbiAgICAgICAgICBsYWJlbHMsXG4gICAgICAgICAgdGFza0xvY2F0aW9uc1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuXG4gIC8vIE5vdyBkcmF3IGFsbCB0aGUgYXJyb3dzLCBpLmUuIGVkZ2VzLlxuICBpZiAob3B0cy5oYXNFZGdlcyAmJiBvcHRzLmhhc1Rhc2tzKSB7XG4gICAgY29uc3QgaGlnaGxpZ2h0ZWRFZGdlczogRGlyZWN0ZWRFZGdlW10gPSBbXTtcbiAgICBjb25zdCBub3JtYWxFZGdlczogRGlyZWN0ZWRFZGdlW10gPSBbXTtcbiAgICBjaGFydExpa2UuRWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoZW1waGFzaXplZFRhc2tzLmhhcyhlLmkpICYmIGVtcGhhc2l6ZWRUYXNrcy5oYXMoZS5qKSkge1xuICAgICAgICBoaWdobGlnaHRlZEVkZ2VzLnB1c2goZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub3JtYWxFZGdlcy5wdXNoKGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG4gICAgZHJhd0VkZ2VzKFxuICAgICAgY3R4LFxuICAgICAgb3B0cyxcbiAgICAgIG5vcm1hbEVkZ2VzLFxuICAgICAgc3BhbnMsXG4gICAgICBjaGFydExpa2UuVmVydGljZXMsXG4gICAgICBzY2FsZSxcbiAgICAgIHRhc2tJbmRleFRvUm93LFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHQsXG4gICAgICBlbXBoYXNpemVkVGFza3NcbiAgICApO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICBkcmF3RWRnZXMoXG4gICAgICBjdHgsXG4gICAgICBvcHRzLFxuICAgICAgaGlnaGxpZ2h0ZWRFZGdlcyxcbiAgICAgIHNwYW5zLFxuICAgICAgY2hhcnRMaWtlLlZlcnRpY2VzLFxuICAgICAgc2NhbGUsXG4gICAgICB0YXNrSW5kZXhUb1JvdyxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0LFxuICAgICAgZW1waGFzaXplZFRhc2tzXG4gICAgKTtcbiAgfVxuXG4gIC8vIFJlbW92ZSB0aGUgY2xpcCByZWdpb24uXG4gIGN0eC5yZXN0b3JlKCk7XG5cbiAgLy8gTm93IGRyYXcgdGhlIHJhbmdlIGhpZ2hsaWdodHMgaWYgcmVxdWlyZWQuXG4gIGlmIChvcHRzLmRpc3BsYXlSYW5nZSAhPT0gbnVsbCAmJiBvcHRzLmRpc3BsYXlSYW5nZVVzYWdlID09PSBcImhpZ2hsaWdodFwiKSB7XG4gICAgLy8gRHJhdyBhIHJlY3Qgb3ZlciBlYWNoIHNpZGUgdGhhdCBpc24ndCBpbiB0aGUgcmFuZ2UuXG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luID4gMCkge1xuICAgICAgZHJhd1JhbmdlT3ZlcmxheShcbiAgICAgICAgY3R4LFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgMCxcbiAgICAgICAgb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4sXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZSb3dzXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuZW5kIDwgdG90YWxOdW1iZXJPZkRheXMpIHtcbiAgICAgIGRyYXdSYW5nZU92ZXJsYXkoXG4gICAgICAgIGN0eCxcbiAgICAgICAgb3B0cyxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIG9wdHMuZGlzcGxheVJhbmdlLmVuZCxcbiAgICAgICAgdG90YWxOdW1iZXJPZkRheXMgKyAxLFxuICAgICAgICB0b3RhbE51bWJlck9mUm93c1xuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBsZXQgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zOiBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgfCBudWxsID0gbnVsbDtcbiAgbGV0IHNlbGVjdGVkVGFza0xvY2F0aW9uOiBQb2ludCB8IG51bGwgPSBudWxsO1xuXG4gIGlmIChvdmVybGF5ICE9PSBudWxsKSB7XG4gICAgY29uc3Qgb3ZlcmxheUN0eCA9IG92ZXJsYXkuZ2V0Q29udGV4dChcIjJkXCIpITtcblxuICAgIC8vIEFkZCBpbiBhbGwgZm91ciBjb3JuZXJzIG9mIGV2ZXJ5IFRhc2sgdG8gdGFza0xvY2F0aW9ucy5cbiAgICB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmZvckVhY2goXG4gICAgICAocmM6IFJlY3RDb3JuZXJzLCBmaWx0ZXJlZFRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsVGFza0luZGV4ID1cbiAgICAgICAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleC5nZXQoZmlsdGVyZWRUYXNrSW5kZXgpITtcbiAgICAgICAgdGFza0xvY2F0aW9ucy5wdXNoKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHg6IHJjLmJvdHRvbVJpZ2h0LngsXG4gICAgICAgICAgICB5OiByYy5ib3R0b21SaWdodC55LFxuICAgICAgICAgICAgb3JpZ2luYWxUYXNrSW5kZXg6IG9yaWdpbmFsVGFza0luZGV4LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgeDogcmMudG9wTGVmdC54LFxuICAgICAgICAgICAgeTogcmMudG9wTGVmdC55LFxuICAgICAgICAgICAgb3JpZ2luYWxUYXNrSW5kZXg6IG9yaWdpbmFsVGFza0luZGV4LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgeDogcmMuYm90dG9tUmlnaHQueCxcbiAgICAgICAgICAgIHk6IHJjLnRvcExlZnQueSxcbiAgICAgICAgICAgIG9yaWdpbmFsVGFza0luZGV4OiBvcmlnaW5hbFRhc2tJbmRleCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHg6IHJjLnRvcExlZnQueCxcbiAgICAgICAgICAgIHk6IHJjLmJvdHRvbVJpZ2h0LnksXG4gICAgICAgICAgICBvcmlnaW5hbFRhc2tJbmRleDogb3JpZ2luYWxUYXNrSW5kZXgsXG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gICAgY29uc3QgdGFza0xvY2F0aW9uS0RUcmVlID0gbmV3IEtEVHJlZSh0YXNrTG9jYXRpb25zKTtcblxuICAgIC8vIEFsd2F5cyByZWNvcmVkIGluIHRoZSBvcmlnaW5hbCB1bmZpbHRlcmVkIHRhc2sgaW5kZXguXG4gICAgbGV0IGxhc3RIaWdobGlnaHRlZFRhc2tJbmRleCA9IC0xO1xuXG4gICAgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zID0gKFxuICAgICAgcG9pbnQ6IFBvaW50LFxuICAgICAgdXBkYXRlVHlwZTogVXBkYXRlVHlwZVxuICAgICk6IG51bWJlciB8IG51bGwgPT4ge1xuICAgICAgLy8gRmlyc3QgY29udmVydCBwb2ludCBpbiBvZmZzZXQgY29vcmRzIGludG8gY2FudmFzIGNvb3Jkcy5cbiAgICAgIHBvaW50LnggPSBwb2ludC54ICogd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgICBwb2ludC55ID0gcG9pbnQueSAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgY29uc3QgdGFza0xvY2F0aW9uID0gdGFza0xvY2F0aW9uS0RUcmVlLm5lYXJlc3QocG9pbnQpO1xuICAgICAgY29uc3Qgb3JpZ2luYWxUYXNrSW5kZXggPSB0YXNrTG9jYXRpb24ub3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgICBpZiAodXBkYXRlVHlwZSA9PT0gXCJtb3VzZW1vdmVcIikge1xuICAgICAgICBpZiAob3JpZ2luYWxUYXNrSW5kZXggPT09IGxhc3RIaWdobGlnaHRlZFRhc2tJbmRleCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG9yaWdpbmFsVGFza0luZGV4ID09PSBsYXN0U2VsZWN0ZWRUYXNrSW5kZXgpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHVwZGF0ZVR5cGUgPT09IFwibW91c2Vtb3ZlXCIpIHtcbiAgICAgICAgbGFzdEhpZ2hsaWdodGVkVGFza0luZGV4ID0gb3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYXN0U2VsZWN0ZWRUYXNrSW5kZXggPSBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgIH1cblxuICAgICAgb3ZlcmxheUN0eC5jbGVhclJlY3QoMCwgMCwgb3ZlcmxheS53aWR0aCwgb3ZlcmxheS5oZWlnaHQpO1xuXG4gICAgICAvLyBEcmF3IGJvdGggaGlnaGxpZ2h0IGFuZCBzZWxlY3Rpb24uXG5cbiAgICAgIC8vIERyYXcgaGlnaGxpZ2h0LlxuICAgICAgbGV0IGNvcm5lcnMgPSB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmdldChcbiAgICAgICAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXguZ2V0KGxhc3RIaWdobGlnaHRlZFRhc2tJbmRleCkhXG4gICAgICApO1xuICAgICAgaWYgKGNvcm5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkcmF3VGFza0hpZ2hsaWdodChcbiAgICAgICAgICBvdmVybGF5Q3R4LFxuICAgICAgICAgIGNvcm5lcnMudG9wTGVmdCxcbiAgICAgICAgICBjb3JuZXJzLmJvdHRvbVJpZ2h0LFxuICAgICAgICAgIG9wdHMuY29sb3JzLmhpZ2hsaWdodCxcbiAgICAgICAgICBzY2FsZS5tZXRyaWModGFza0xpbmVIZWlnaHQpXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIERyYXcgc2VsZWN0aW9uLlxuICAgICAgY29ybmVycyA9IHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMuZ2V0KFxuICAgICAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5nZXQobGFzdFNlbGVjdGVkVGFza0luZGV4KSFcbiAgICAgICk7XG4gICAgICBpZiAoY29ybmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRyYXdTZWxlY3Rpb25IaWdobGlnaHQoXG4gICAgICAgICAgb3ZlcmxheUN0eCxcbiAgICAgICAgICBjb3JuZXJzLnRvcExlZnQsXG4gICAgICAgICAgY29ybmVycy5ib3R0b21SaWdodCxcbiAgICAgICAgICBvcHRzLmNvbG9ycy5oaWdobGlnaHRcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9yaWdpbmFsVGFza0luZGV4O1xuICAgIH07XG5cbiAgICAvLyBEcmF3IHNlbGVjdGlvbi5cbiAgICBjb25zdCBjb3JuZXJzID0gdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5nZXQoXG4gICAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5nZXQobGFzdFNlbGVjdGVkVGFza0luZGV4KSFcbiAgICApO1xuICAgIGlmIChjb3JuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGRyYXdTZWxlY3Rpb25IaWdobGlnaHQoXG4gICAgICAgIG92ZXJsYXlDdHgsXG4gICAgICAgIGNvcm5lcnMudG9wTGVmdCxcbiAgICAgICAgY29ybmVycy5ib3R0b21SaWdodCxcbiAgICAgICAgb3B0cy5jb2xvcnMuaGlnaGxpZ2h0XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGhpZ2hlc3QgdGFzayBvZiBhbGwgdGhlIHRhc2tzIGRpc3BsYXllZC5cbiAgdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5mb3JFYWNoKChyYzogUmVjdENvcm5lcnMpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWRUYXNrTG9jYXRpb24gPT09IG51bGwpIHtcbiAgICAgIHNlbGVjdGVkVGFza0xvY2F0aW9uID0gcmMudG9wTGVmdDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHJjLnRvcExlZnQueSA8IHNlbGVjdGVkVGFza0xvY2F0aW9uLnkpIHtcbiAgICAgIHNlbGVjdGVkVGFza0xvY2F0aW9uID0gcmMudG9wTGVmdDtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBvayh7XG4gICAgc2NhbGU6IHNjYWxlLFxuICAgIHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvczogdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zLFxuICAgIHNlbGVjdGVkVGFza0xvY2F0aW9uOiBzZWxlY3RlZFRhc2tMb2NhdGlvbixcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdFZGdlcyhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSxcbiAgc3BhbnM6IFNwYW5bXSxcbiAgdGFza3M6IFRhc2tbXSxcbiAgc2NhbGU6IFNjYWxlLFxuICB0YXNrSW5kZXhUb1JvdzogVGFza0luZGV4VG9Sb3csXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyLFxuICB0YXNrSGlnaGxpZ2h0czogU2V0PG51bWJlcj5cbikge1xuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBjb25zdCBzcmNTbGFjazogU3BhbiA9IHNwYW5zW2UuaV07XG4gICAgY29uc3QgZHN0U2xhY2s6IFNwYW4gPSBzcGFuc1tlLmpdO1xuICAgIGNvbnN0IHNyY1Rhc2s6IFRhc2sgPSB0YXNrc1tlLmldO1xuICAgIGNvbnN0IGRzdFRhc2s6IFRhc2sgPSB0YXNrc1tlLmpdO1xuICAgIGNvbnN0IHNyY1JvdyA9IHRhc2tJbmRleFRvUm93LmdldChlLmkpITtcbiAgICBjb25zdCBkc3RSb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQoZS5qKSE7XG4gICAgY29uc3Qgc3JjRGF5ID0gc3JjU2xhY2suZmluaXNoO1xuICAgIGNvbnN0IGRzdERheSA9IGRzdFNsYWNrLnN0YXJ0O1xuXG4gICAgaWYgKHRhc2tIaWdobGlnaHRzLmhhcyhlLmkpICYmIHRhc2tIaWdobGlnaHRzLmhhcyhlLmopKSB7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIH1cblxuICAgIGRyYXdBcnJvd0JldHdlZW5UYXNrcyhcbiAgICAgIGN0eCxcbiAgICAgIHNyY0RheSxcbiAgICAgIGRzdERheSxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkcmF3UmFuZ2VPdmVybGF5KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgc2NhbGU6IFNjYWxlLFxuICBiZWdpbkRheTogbnVtYmVyLFxuICBlbmREYXk6IG51bWJlcixcbiAgdG90YWxOdW1iZXJPZlJvd3M6IG51bWJlclxuKSB7XG4gIGNvbnN0IHRvcExlZnQgPSBzY2FsZS5mZWF0dXJlKDAsIGJlZ2luRGF5LCBGZWF0dXJlLmRpc3BsYXlSYW5nZVRvcCk7XG4gIGNvbnN0IGJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICB0b3RhbE51bWJlck9mUm93cyxcbiAgICBlbmREYXksXG4gICAgRmVhdHVyZS50YXNrUm93Qm90dG9tXG4gICk7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vdmVybGF5O1xuICBjdHguZmlsbFJlY3QoXG4gICAgdG9wTGVmdC54LFxuICAgIHRvcExlZnQueSxcbiAgICBib3R0b21SaWdodC54IC0gdG9wTGVmdC54LFxuICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgKTtcbiAgY29uc29sZS5sb2coXCJkcmF3UmFuZ2VPdmVybGF5XCIsIHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcbn1cblxuZnVuY3Rpb24gZHJhd0Fycm93QmV0d2VlblRhc2tzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc3JjRGF5OiBudW1iZXIsXG4gIGRzdERheTogbnVtYmVyLFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNUYXNrOiBUYXNrLFxuICBkc3RSb3c6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXJcbikge1xuICBpZiAoc3JjRGF5ID09PSBkc3REYXkpIHtcbiAgICBkcmF3VmVydGljYWxBcnJvd1RvVGFzayhcbiAgICAgIGN0eCxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjRGF5LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdERheSxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgZHJhd0xTaGFwZWRBcnJvd1RvVGFzayhcbiAgICAgIGN0eCxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjRGF5LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBkc3REYXksXG4gICAgICBhcnJvd0hlYWRIZWlnaHQsXG4gICAgICBhcnJvd0hlYWRXaWR0aFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYXJDYW52YXMoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50XG4pIHtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLnN1cmZhY2U7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG59XG5cbmZ1bmN0aW9uIHNldEZvbnRTaXplKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBvcHRzOiBSZW5kZXJPcHRpb25zKSB7XG4gIGN0eC5mb250ID0gYCR7b3B0cy5mb250U2l6ZVB4fXB4IHNlcmlmYDtcbn1cblxuLy8gRHJhdyBMIHNoYXBlZCBhcnJvdywgZmlyc3QgZ29pbmcgYmV0d2VlbiByb3dzLCB0aGVuIGdvaW5nIGJldHdlZW4gZGF5cy5cbmZ1bmN0aW9uIGRyYXdMU2hhcGVkQXJyb3dUb1Rhc2soXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNEYXk6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdFRhc2s6IFRhc2ssXG4gIGRzdERheTogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlcixcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlclxuKSB7XG4gIC8vIERyYXcgdmVydGljYWwgcGFydCBvZiB0aGUgXCJMXCIuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY29uc3QgZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSBzcmNSb3cgPCBkc3RSb3cgPyBcImRvd25cIiA6IFwidXBcIjtcbiAgY29uc3QgdmVydExpbmVTdGFydCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgc3JjUm93LFxuICAgIHNyY0RheSxcbiAgICB2ZXJ0aWNhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihzcmNUYXNrLCBkaXJlY3Rpb24pXG4gICk7XG4gIGNvbnN0IHZlcnRMaW5lRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICBkc3RSb3csXG4gICAgc3JjRGF5LFxuICAgIGhvcml6b250YWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihkc3RUYXNrKVxuICApO1xuICBjdHgubW92ZVRvKHZlcnRMaW5lU3RhcnQueCArIDAuNSwgdmVydExpbmVTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIHZlcnRMaW5lRW5kLnkpO1xuXG4gIC8vIERyYXcgaG9yaXpvbnRhbCBwYXJ0IG9mIHRoZSBcIkxcIi5cbiAgY29uc3QgaG9yekxpbmVTdGFydCA9IHZlcnRMaW5lRW5kO1xuICBjb25zdCBob3J6TGluZUVuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIGRzdERheSxcbiAgICBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oZHN0VGFzaylcbiAgKTtcbiAgY3R4Lm1vdmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIGhvcnpMaW5lU3RhcnQueSk7XG4gIGN0eC5saW5lVG8oaG9yekxpbmVFbmQueCArIDAuNSwgaG9yekxpbmVFbmQueSk7XG5cbiAgLy8gRHJhdyB0aGUgYXJyb3doZWFkLiBUaGlzIGFycm93IGhlYWQgd2lsbCBhbHdheXMgcG9pbnQgdG8gdGhlIHJpZ2h0XG4gIC8vIHNpbmNlIHRoYXQncyBob3cgdGltZSBmbG93cy5cbiAgY3R4Lm1vdmVUbyhob3J6TGluZUVuZC54ICsgMC41LCBob3J6TGluZUVuZC55KTtcbiAgY3R4LmxpbmVUbyhcbiAgICBob3J6TGluZUVuZC54IC0gYXJyb3dIZWFkSGVpZ2h0ICsgMC41LFxuICAgIGhvcnpMaW5lRW5kLnkgKyBhcnJvd0hlYWRXaWR0aFxuICApO1xuICBjdHgubW92ZVRvKGhvcnpMaW5lRW5kLnggKyAwLjUsIGhvcnpMaW5lRW5kLnkpO1xuICBjdHgubGluZVRvKFxuICAgIGhvcnpMaW5lRW5kLnggLSBhcnJvd0hlYWRIZWlnaHQgKyAwLjUsXG4gICAgaG9yekxpbmVFbmQueSAtIGFycm93SGVhZFdpZHRoXG4gICk7XG4gIGN0eC5zdHJva2UoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1ZlcnRpY2FsQXJyb3dUb1Rhc2soXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNEYXk6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdERheTogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGNvbnN0IGRpcmVjdGlvbjogRGlyZWN0aW9uID0gc3JjUm93IDwgZHN0Um93ID8gXCJkb3duXCIgOiBcInVwXCI7XG4gIGNvbnN0IGFycm93U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHNyY1JvdyxcbiAgICBzcmNEYXksXG4gICAgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oc3JjVGFzaywgZGlyZWN0aW9uKVxuICApO1xuICBjb25zdCBhcnJvd0VuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIGRzdERheSxcbiAgICB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKGRzdFRhc2ssIGRpcmVjdGlvbilcbiAgKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8oYXJyb3dTdGFydC54ICsgMC41LCBhcnJvd1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKGFycm93RW5kLnggKyAwLjUsIGFycm93RW5kLnkpO1xuXG4gIC8vIERyYXcgdGhlIGFycm93aGVhZC5cbiAgY29uc3QgZGVsdGFZID0gZGlyZWN0aW9uID09PSBcImRvd25cIiA/IC1hcnJvd0hlYWRIZWlnaHQgOiBhcnJvd0hlYWRIZWlnaHQ7XG4gIGN0eC5tb3ZlVG8oYXJyb3dFbmQueCArIDAuNSwgYXJyb3dFbmQueSk7XG4gIGN0eC5saW5lVG8oYXJyb3dFbmQueCAtIGFycm93SGVhZFdpZHRoICsgMC41LCBhcnJvd0VuZC55ICsgZGVsdGFZKTtcbiAgY3R4Lm1vdmVUbyhhcnJvd0VuZC54ICsgMC41LCBhcnJvd0VuZC55KTtcbiAgY3R4LmxpbmVUbyhhcnJvd0VuZC54ICsgYXJyb3dIZWFkV2lkdGggKyAwLjUsIGFycm93RW5kLnkgKyBkZWx0YVkpO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUYXNrVGV4dChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93OiBudW1iZXIsXG4gIHNwYW46IFNwYW4sXG4gIHRhc2s6IFRhc2ssXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBvcmlnaW5hbFRhc2tJbmRleDogbnVtYmVyLFxuICBjbGlwV2lkdGg6IG51bWJlcixcbiAgbGFiZWxzOiBzdHJpbmdbXSxcbiAgdGFza0xvY2F0aW9uczogVGFza0xvY2F0aW9uW11cbikge1xuICBpZiAoIW9wdHMuaGFzVGV4dCkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBsYWJlbCA9IGxhYmVsc1t0YXNrSW5kZXhdO1xuXG4gIGxldCB4U3RhcnRJblRpbWUgPSBzcGFuLnN0YXJ0O1xuICBsZXQgeFBpeGVsRGVsdGEgPSAwO1xuICAvLyBEZXRlcm1pbmUgd2hlcmUgb24gdGhlIHgtYXhpcyB0byBzdGFydCBkcmF3aW5nIHRoZSB0YXNrIHRleHQuXG4gIGlmIChvcHRzLmRpc3BsYXlSYW5nZSAhPT0gbnVsbCAmJiBvcHRzLmRpc3BsYXlSYW5nZVVzYWdlID09PSBcInJlc3RyaWN0XCIpIHtcbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuaW4oc3Bhbi5zdGFydCkpIHtcbiAgICAgIHhTdGFydEluVGltZSA9IHNwYW4uc3RhcnQ7XG4gICAgICB4UGl4ZWxEZWx0YSA9IDA7XG4gICAgfSBlbHNlIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5pbihzcGFuLmZpbmlzaCkpIHtcbiAgICAgIHhTdGFydEluVGltZSA9IHNwYW4uZmluaXNoO1xuICAgICAgY29uc3QgbWVhcyA9IGN0eC5tZWFzdXJlVGV4dChsYWJlbCk7XG4gICAgICB4UGl4ZWxEZWx0YSA9IC1tZWFzLndpZHRoIC0gMiAqIHNjYWxlLm1ldHJpYyhNZXRyaWMudGV4dFhPZmZzZXQpO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBzcGFuLnN0YXJ0IDwgb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gJiZcbiAgICAgIHNwYW4uZmluaXNoID4gb3B0cy5kaXNwbGF5UmFuZ2UuZW5kXG4gICAgKSB7XG4gICAgICB4U3RhcnRJblRpbWUgPSBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbjtcbiAgICAgIHhQaXhlbERlbHRhID0gY2xpcFdpZHRoIC8gMjtcbiAgICB9XG4gIH1cbiAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xuICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgeFN0YXJ0SW5UaW1lLCBGZWF0dXJlLnRleHRTdGFydCk7XG4gIGNvbnN0IHRleHRYID0gdGV4dFN0YXJ0LnggKyB4UGl4ZWxEZWx0YTtcbiAgY29uc3QgdGV4dFkgPSB0ZXh0U3RhcnQueTtcbiAgY3R4LmZpbGxUZXh0KGxhYmVsLCB0ZXh0U3RhcnQueCArIHhQaXhlbERlbHRhLCB0ZXh0U3RhcnQueSk7XG4gIHRhc2tMb2NhdGlvbnMucHVzaCh7XG4gICAgeDogdGV4dFgsXG4gICAgeTogdGV4dFksXG4gICAgb3JpZ2luYWxUYXNrSW5kZXg6IG9yaWdpbmFsVGFza0luZGV4LFxuICB9KTtcbn1cblxuZnVuY3Rpb24gZHJhd1Rhc2tCYXIoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICB0YXNrU3RhcnQ6IFBvaW50LFxuICB0YXNrRW5kOiBQb2ludCxcbiAgdGFza0xpbmVIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGN0eC5maWxsUmVjdChcbiAgICB0YXNrU3RhcnQueCxcbiAgICB0YXNrU3RhcnQueSxcbiAgICB0YXNrRW5kLnggLSB0YXNrU3RhcnQueCxcbiAgICB0YXNrTGluZUhlaWdodFxuICApO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza0hpZ2hsaWdodChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIGhpZ2hsaWdodFN0YXJ0OiBQb2ludCxcbiAgaGlnaGxpZ2h0RW5kOiBQb2ludCxcbiAgY29sb3I6IHN0cmluZyxcbiAgYm9yZGVyV2lkdGg6IG51bWJlclxuKSB7XG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICBjdHgubGluZVdpZHRoID0gYm9yZGVyV2lkdGg7XG4gIGN0eC5zdHJva2VSZWN0KFxuICAgIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0U3RhcnQueSxcbiAgICBoaWdobGlnaHRFbmQueCAtIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0RW5kLnkgLSBoaWdobGlnaHRTdGFydC55XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdTZWxlY3Rpb25IaWdobGlnaHQoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBoaWdobGlnaHRTdGFydDogUG9pbnQsXG4gIGhpZ2hsaWdodEVuZDogUG9pbnQsXG4gIGNvbG9yOiBzdHJpbmdcbikge1xuICBjdHguZmlsbFN0eWxlID0gY29sb3I7XG4gIGN0eC5maWxsUmVjdChcbiAgICBoaWdobGlnaHRTdGFydC54LFxuICAgIGhpZ2hsaWdodFN0YXJ0LnksXG4gICAgaGlnaGxpZ2h0RW5kLnggLSBoaWdobGlnaHRTdGFydC54LFxuICAgIGhpZ2hsaWdodEVuZC55IC0gaGlnaGxpZ2h0U3RhcnQueVxuICApO1xufVxuXG5mdW5jdGlvbiBkcmF3TWlsZXN0b25lKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgdGFza1N0YXJ0OiBQb2ludCxcbiAgZGlhbW9uZERpYW1ldGVyOiBudW1iZXIsXG4gIHBlcmNlbnRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmxpbmVXaWR0aCA9IHBlcmNlbnRIZWlnaHQgLyAyO1xuICBjdHgubW92ZVRvKHRhc2tTdGFydC54LCB0YXNrU3RhcnQueSAtIGRpYW1vbmREaWFtZXRlcik7XG4gIGN0eC5saW5lVG8odGFza1N0YXJ0LnggKyBkaWFtb25kRGlhbWV0ZXIsIHRhc2tTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh0YXNrU3RhcnQueCwgdGFza1N0YXJ0LnkgKyBkaWFtb25kRGlhbWV0ZXIpO1xuICBjdHgubGluZVRvKHRhc2tTdGFydC54IC0gZGlhbW9uZERpYW1ldGVyLCB0YXNrU3RhcnQueSk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbiAgY3R4LnN0cm9rZSgpO1xufVxuXG5jb25zdCBkcmF3VGltZU1hcmtlckF0RGF5VG9UYXNrID0gKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgcm93OiBudW1iZXIsXG4gIGRheTogbnVtYmVyLFxuICB0YXNrOiBUYXNrLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBzY2FsZTogU2NhbGUsXG4gIGRheXNXaXRoVGltZU1hcmtlcnM6IFNldDxudW1iZXI+XG4pID0+IHtcbiAgaWYgKGRheXNXaXRoVGltZU1hcmtlcnMuaGFzKGRheSkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZGF5c1dpdGhUaW1lTWFya2Vycy5hZGQoZGF5KTtcbiAgY29uc3QgdGltZU1hcmtTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudGltZU1hcmtTdGFydCk7XG4gIGNvbnN0IHRpbWVNYXJrRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICByb3csXG4gICAgZGF5LFxuICAgIHZlcnRpY2FsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24odGFzaywgXCJkb3duXCIpXG4gICk7XG4gIGN0eC5saW5lV2lkdGggPSAwLjU7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm92ZXJsYXk7XG5cbiAgY3R4Lm1vdmVUbyh0aW1lTWFya1N0YXJ0LnggKyAwLjUsIHRpbWVNYXJrU3RhcnQueSk7XG4gIGN0eC5saW5lVG8odGltZU1hcmtTdGFydC54ICsgMC41LCB0aW1lTWFya0VuZC55KTtcbiAgY3R4LnN0cm9rZSgpO1xuXG4gIGN0eC5zZXRMaW5lRGFzaChbXSk7XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gIGNvbnN0IHRleHRTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudGltZVRleHRTdGFydCk7XG4gIGlmIChvcHRzLmhhc1RleHQgJiYgb3B0cy5oYXNUaW1lbGluZSkge1xuICAgIGN0eC5maWxsVGV4dChgJHtkYXl9YCwgdGV4dFN0YXJ0LngsIHRleHRTdGFydC55KTtcbiAgfVxufTtcblxuLyoqIFJlcHJlc2VudHMgYSBoYWxmLW9wZW4gaW50ZXJ2YWwgb2Ygcm93cywgZS5nLiBbc3RhcnQsIGZpbmlzaCkuICovXG5pbnRlcmZhY2UgUm93UmFuZ2Uge1xuICBzdGFydDogbnVtYmVyO1xuICBmaW5pc2g6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIFRhc2tJbmRleFRvUm93UmV0dXJuIHtcbiAgdGFza0luZGV4VG9Sb3c6IFRhc2tJbmRleFRvUm93O1xuXG4gIC8qKiBNYXBzIGVhY2ggcmVzb3VyY2UgdmFsdWUgaW5kZXggdG8gYSByYW5nZSBvZiByb3dzLiAqL1xuICByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPiB8IG51bGw7XG5cbiAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb24gfCBudWxsO1xufVxuXG5jb25zdCB0YXNrSW5kZXhUb1Jvd0Zyb21Hcm91cEJ5ID0gKFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICByZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCxcbiAgY2hhcnRMaWtlOiBDaGFydExpa2UsXG4gIGRpc3BsYXlPcmRlcjogVmVydGV4SW5kaWNlc1xuKTogUmVzdWx0PFRhc2tJbmRleFRvUm93UmV0dXJuPiA9PiB7XG4gIC8vIGRpc3BsYXlPcmRlciBtYXBzIGZyb20gcm93IHRvIHRhc2sgaW5kZXgsIHRoaXMgd2lsbCBwcm9kdWNlIHRoZSBpbnZlcnNlIG1hcHBpbmcuXG4gIGNvbnN0IHRhc2tJbmRleFRvUm93ID0gbmV3IE1hcChcbiAgICAvLyBUaGlzIGxvb2tzIGJhY2t3YXJkcywgYnV0IGl0IGlzbid0LiBSZW1lbWJlciB0aGF0IHRoZSBtYXAgY2FsbGJhY2sgdGFrZXNcbiAgICAvLyAodmFsdWUsIGluZGV4KSBhcyBpdHMgYXJndW1lbnRzLlxuICAgIGRpc3BsYXlPcmRlci5tYXAoKHRhc2tJbmRleDogbnVtYmVyLCByb3c6IG51bWJlcikgPT4gW3Rhc2tJbmRleCwgcm93XSlcbiAgKTtcblxuICBpZiAocmVzb3VyY2VEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gb2soe1xuICAgICAgdGFza0luZGV4VG9Sb3c6IHRhc2tJbmRleFRvUm93LFxuICAgICAgcm93UmFuZ2VzOiBudWxsLFxuICAgICAgcmVzb3VyY2VEZWZpbml0aW9uOiBudWxsLFxuICAgIH0pO1xuICB9XG5cbiAgY29uc3Qgc3RhcnRUYXNrSW5kZXggPSAwO1xuICBjb25zdCBmaW5pc2hUYXNrSW5kZXggPSBjaGFydExpa2UuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgY29uc3QgaWdub3JhYmxlID0gW3N0YXJ0VGFza0luZGV4LCBmaW5pc2hUYXNrSW5kZXhdO1xuXG4gIC8vIEdyb3VwIGFsbCB0YXNrcyBieSB0aGVpciByZXNvdXJjZSB2YWx1ZSwgd2hpbGUgcHJlc2VydmluZyBkaXNwbGF5T3JkZXJcbiAgLy8gb3JkZXIgd2l0aCB0aGUgZ3JvdXBzLlxuICBjb25zdCBncm91cHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyW10+KCk7XG4gIGRpc3BsYXlPcmRlci5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHJlc291cmNlVmFsdWUgPVxuICAgICAgY2hhcnRMaWtlLlZlcnRpY2VzW3Rhc2tJbmRleF0uZ2V0UmVzb3VyY2Uob3B0cy5ncm91cEJ5UmVzb3VyY2UpIHx8IFwiXCI7XG4gICAgY29uc3QgZ3JvdXBNZW1iZXJzID0gZ3JvdXBzLmdldChyZXNvdXJjZVZhbHVlKSB8fCBbXTtcbiAgICBncm91cE1lbWJlcnMucHVzaCh0YXNrSW5kZXgpO1xuICAgIGdyb3Vwcy5zZXQocmVzb3VyY2VWYWx1ZSwgZ3JvdXBNZW1iZXJzKTtcbiAgfSk7XG5cbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcblxuICAvLyBVZ2gsIFN0YXJ0IGFuZCBGaW5pc2ggVGFza3MgbmVlZCB0byBiZSBtYXBwZWQsIGJ1dCBzaG91bGQgbm90IGJlIGRvbmUgdmlhXG4gIC8vIHJlc291cmNlIHZhbHVlLCBzbyBTdGFydCBzaG91bGQgYWx3YXlzIGJlIGZpcnN0LlxuICByZXQuc2V0KDAsIDApO1xuXG4gIC8vIE5vdyBpbmNyZW1lbnQgdXAgdGhlIHJvd3MgYXMgd2UgbW92ZSB0aHJvdWdoIGFsbCB0aGUgZ3JvdXBzLlxuICBsZXQgcm93ID0gMTtcbiAgLy8gQW5kIHRyYWNrIGhvdyBtYW55IHJvd3MgYXJlIGluIGVhY2ggZ3JvdXAuXG4gIGNvbnN0IHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+ID0gbmV3IE1hcCgpO1xuICByZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmZvckVhY2goXG4gICAgKHJlc291cmNlVmFsdWU6IHN0cmluZywgcmVzb3VyY2VJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBzdGFydE9mUm93ID0gcm93O1xuICAgICAgKGdyb3Vwcy5nZXQocmVzb3VyY2VWYWx1ZSkgfHwgW10pLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmFibGUuaW5jbHVkZXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXQuc2V0KHRhc2tJbmRleCwgcm93KTtcbiAgICAgICAgcm93Kys7XG4gICAgICB9KTtcbiAgICAgIHJvd1Jhbmdlcy5zZXQocmVzb3VyY2VJbmRleCwgeyBzdGFydDogc3RhcnRPZlJvdywgZmluaXNoOiByb3cgfSk7XG4gICAgfVxuICApO1xuICByZXQuc2V0KGZpbmlzaFRhc2tJbmRleCwgcm93KTtcblxuICByZXR1cm4gb2soe1xuICAgIHRhc2tJbmRleFRvUm93OiByZXQsXG4gICAgcm93UmFuZ2VzOiByb3dSYW5nZXMsXG4gICAgcmVzb3VyY2VEZWZpbml0aW9uOiByZXNvdXJjZURlZmluaXRpb24sXG4gIH0pO1xufTtcblxuY29uc3QgZHJhd1N3aW1MYW5lSGlnaGxpZ2h0cyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4sXG4gIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXIsXG4gIGdyb3VwQ29sb3I6IHN0cmluZ1xuKSA9PiB7XG4gIGN0eC5maWxsU3R5bGUgPSBncm91cENvbG9yO1xuXG4gIGxldCBncm91cCA9IDA7XG4gIHJvd1Jhbmdlcy5mb3JFYWNoKChyb3dSYW5nZTogUm93UmFuZ2UpID0+IHtcbiAgICBjb25zdCB0b3BMZWZ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvd1JhbmdlLnN0YXJ0LFxuICAgICAgMCxcbiAgICAgIEZlYXR1cmUuZ3JvdXBFbnZlbG9wZVN0YXJ0XG4gICAgKTtcbiAgICBjb25zdCBib3R0b21SaWdodCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3dSYW5nZS5maW5pc2gsXG4gICAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICk7XG4gICAgZ3JvdXArKztcbiAgICAvLyBPbmx5IGhpZ2hsaWdodCBldmVyeSBvdGhlciBncm91cCBiYWNrZ3JvdWQgd2l0aCB0aGUgZ3JvdXBDb2xvci5cbiAgICBpZiAoZ3JvdXAgJSAyID09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY3R4LmZpbGxSZWN0KFxuICAgICAgdG9wTGVmdC54LFxuICAgICAgdG9wTGVmdC55LFxuICAgICAgYm90dG9tUmlnaHQueCAtIHRvcExlZnQueCxcbiAgICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgICApO1xuICB9KTtcbn07XG5cbmNvbnN0IGRyYXdTd2ltTGFuZUxhYmVscyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uLFxuICBzY2FsZTogU2NhbGUsXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+XG4pID0+IHtcbiAgaWYgKHJvd1JhbmdlcykgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGNvbnN0IGdyb3VwQnlPcmlnaW4gPSBzY2FsZS5mZWF0dXJlKDAsIDAsIEZlYXR1cmUuZ3JvdXBCeU9yaWdpbik7XG5cbiAgaWYgKG9wdHMuaGFzVGltZWxpbmUpIHtcbiAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJib3R0b21cIjtcbiAgICBjdHguZmlsbFRleHQob3B0cy5ncm91cEJ5UmVzb3VyY2UsIGdyb3VwQnlPcmlnaW4ueCwgZ3JvdXBCeU9yaWdpbi55KTtcbiAgfVxuXG4gIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gICAgcm93UmFuZ2VzLmZvckVhY2goKHJvd1JhbmdlOiBSb3dSYW5nZSwgcmVzb3VyY2VJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAocm93UmFuZ2Uuc3RhcnQgPT09IHJvd1JhbmdlLmZpbmlzaCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgICByb3dSYW5nZS5zdGFydCxcbiAgICAgICAgMCxcbiAgICAgICAgRmVhdHVyZS5ncm91cFRleHRTdGFydFxuICAgICAgKTtcbiAgICAgIGN0eC5maWxsVGV4dChcbiAgICAgICAgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1tyZXNvdXJjZUluZGV4XSxcbiAgICAgICAgdGV4dFN0YXJ0LngsXG4gICAgICAgIHRleHRTdGFydC55XG4gICAgICApO1xuICAgIH0pO1xuICB9XG59O1xuIiwgIi8vIFdoZW4gYWRkaW5nIHByb3BlcnRpZXMgdG8gQ29sb3JUaGVtZSBhbHNvIG1ha2Ugc3VyZSB0byBhZGQgYSBjb3JyZXNwb25kaW5nXG4vLyBDU1MgQHByb3BlcnR5IGRlY2xhcmF0aW9uLlxuLy9cbi8vIE5vdGUgdGhhdCBlYWNoIHByb3BlcnR5IGFzc3VtZXMgdGhlIHByZXNlbmNlIG9mIGEgQ1NTIHZhcmlhYmxlIG9mIHRoZSBzYW1lIG5hbWVcbi8vIHdpdGggYSBwcmVjZWVkaW5nIGAtLWAuXG5leHBvcnQgaW50ZXJmYWNlIFRoZW1lIHtcbiAgc3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlTXV0ZWQ6IHN0cmluZztcbiAgb25TdXJmYWNlU2Vjb25kYXJ5OiBzdHJpbmc7XG4gIG92ZXJsYXk6IHN0cmluZztcbiAgZ3JvdXBDb2xvcjogc3RyaW5nO1xuICBoaWdobGlnaHQ6IHN0cmluZztcbiAgYWRkZWQ6IHN0cmluZztcbiAgcmVtb3ZlZDogc3RyaW5nO1xufVxuXG50eXBlIFRoZW1lUHJvcCA9IGtleW9mIFRoZW1lO1xuXG5jb25zdCBjb2xvclRoZW1lUHJvdG90eXBlOiBUaGVtZSA9IHtcbiAgc3VyZmFjZTogXCJcIixcbiAgb25TdXJmYWNlOiBcIlwiLFxuICBvblN1cmZhY2VNdXRlZDogXCJcIixcbiAgb25TdXJmYWNlU2Vjb25kYXJ5OiBcIlwiLFxuICBvdmVybGF5OiBcIlwiLFxuICBncm91cENvbG9yOiBcIlwiLFxuICBoaWdobGlnaHQ6IFwiXCIsXG4gIGFkZGVkOiBcIlwiLFxuICByZW1vdmVkOiBcIlwiLFxufTtcblxuZXhwb3J0IGNvbnN0IGNvbG9yVGhlbWVGcm9tRWxlbWVudCA9IChlbGU6IEhUTUxFbGVtZW50KTogVGhlbWUgPT4ge1xuICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlKTtcbiAgY29uc3QgcmV0ID0gT2JqZWN0LmFzc2lnbih7fSwgY29sb3JUaGVtZVByb3RvdHlwZSk7XG4gIE9iamVjdC5rZXlzKHJldCkuZm9yRWFjaCgobmFtZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0W25hbWUgYXMgVGhlbWVQcm9wXSA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoYC0tJHtuYW1lfWApO1xuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHtcbiAgRHVwVGFza09wLFxuICBJbnNlcnROZXdFbXB0eU1pbGVzdG9uZUFmdGVyT3AsXG4gIFNldFRhc2tOYW1lT3AsXG4gIFNwbGl0VGFza09wLFxufSBmcm9tIFwiLi4vb3BzL2NoYXJ0XCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wIH0gZnJvbSBcIi4uL29wcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBPcCwgYXBwbHlBbGxPcHNUb1BsYW4gfSBmcm9tIFwiLi4vb3BzL29wc1wiO1xuaW1wb3J0IHtcbiAgQWRkUmVzb3VyY2VPcCxcbiAgQWRkUmVzb3VyY2VPcHRpb25PcCxcbiAgU2V0UmVzb3VyY2VWYWx1ZU9wLFxufSBmcm9tIFwiLi4vb3BzL3Jlc291cmNlc1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW5cIjtcblxuY29uc3QgcGVvcGxlOiBzdHJpbmdbXSA9IFtcIkZyZWRcIiwgXCJCYXJuZXlcIiwgXCJXaWxtYVwiLCBcIkJldHR5XCJdO1xuXG5jb25zdCBEVVJBVElPTiA9IDEwMDtcblxuY29uc3Qgcm5kSW50ID0gKG46IG51bWJlcik6IG51bWJlciA9PiB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuKTtcbn07XG5cbmNvbnN0IHJuZER1cmF0aW9uID0gKCk6IG51bWJlciA9PiB7XG4gIHJldHVybiBybmRJbnQoRFVSQVRJT04pO1xufTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlU3RhcnRlclBsYW4gPSAoKTogUGxhbiA9PiB7XG4gIGNvbnN0IHBsYW4gPSBuZXcgUGxhbigpO1xuICBsZXQgdGFza0lEID0gMDtcblxuICBjb25zdCBvcHM6IE9wW10gPSBbQWRkUmVzb3VyY2VPcChcIlBlcnNvblwiKV07XG5cbiAgcGVvcGxlLmZvckVhY2goKHBlcnNvbjogc3RyaW5nKSA9PiB7XG4gICAgb3BzLnB1c2goQWRkUmVzb3VyY2VPcHRpb25PcChcIlBlcnNvblwiLCBwZXJzb24pKTtcbiAgfSk7XG5cbiAgb3BzLnB1c2goXG4gICAgSW5zZXJ0TmV3RW1wdHlNaWxlc3RvbmVBZnRlck9wKDApLFxuICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCAxMCwgMSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIFwiRnJlZFwiLCAxKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcImxvd1wiLCAxKVxuICApO1xuXG4gIGNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKG9wcywgcGxhbik7XG5cbiAgaWYgKCFyZXMub2spIHtcbiAgICBjb25zb2xlLmxvZyhyZXMuZXJyb3IpO1xuICB9XG4gIHJldHVybiBwbGFuO1xufTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlUmFuZG9tUGxhbiA9ICgpOiBQbGFuID0+IHtcbiAgY29uc3QgcGxhbiA9IG5ldyBQbGFuKCk7XG4gIGxldCB0YXNrSUQgPSAwO1xuXG4gIGNvbnN0IG9wczogT3BbXSA9IFtBZGRSZXNvdXJjZU9wKFwiUGVyc29uXCIpXTtcblxuICBwZW9wbGUuZm9yRWFjaCgocGVyc29uOiBzdHJpbmcpID0+IHtcbiAgICBvcHMucHVzaChBZGRSZXNvdXJjZU9wdGlvbk9wKFwiUGVyc29uXCIsIHBlcnNvbikpO1xuICB9KTtcblxuICBvcHMucHVzaChcbiAgICBJbnNlcnROZXdFbXB0eU1pbGVzdG9uZUFmdGVyT3AoMCksXG4gICAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIHJuZER1cmF0aW9uKCksIDEpLFxuICAgIFNldFRhc2tOYW1lT3AoMSwgcmFuZG9tVGFza05hbWUoKSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIHBlb3BsZVtybmRJbnQocGVvcGxlLmxlbmd0aCldLCAxKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcIm1vZGVyYXRlXCIsIDEpXG4gICk7XG5cbiAgbGV0IG51bVRhc2tzID0gMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgbGV0IGluZGV4ID0gcm5kSW50KG51bVRhc2tzKSArIDE7XG4gICAgb3BzLnB1c2goXG4gICAgICBTcGxpdFRhc2tPcChpbmRleCksXG4gICAgICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgaW5kZXggKyAxKSxcbiAgICAgIFNldFRhc2tOYW1lT3AoaW5kZXggKyAxLCByYW5kb21UYXNrTmFtZSgpKSxcbiAgICAgIFNldFJlc291cmNlVmFsdWVPcChcIlBlcnNvblwiLCBwZW9wbGVbcm5kSW50KHBlb3BsZS5sZW5ndGgpXSwgaW5kZXggKyAxKSxcbiAgICAgIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibW9kZXJhdGVcIiwgaW5kZXggKyAxKVxuICAgICk7XG4gICAgbnVtVGFza3MrKztcbiAgICBpbmRleCA9IHJuZEludChudW1UYXNrcykgKyAxO1xuICAgIG9wcy5wdXNoKFxuICAgICAgRHVwVGFza09wKGluZGV4KSxcbiAgICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCBybmREdXJhdGlvbigpLCBpbmRleCArIDEpLFxuICAgICAgU2V0VGFza05hbWVPcChpbmRleCArIDEsIHJhbmRvbVRhc2tOYW1lKCkpLFxuICAgICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIHBlb3BsZVtybmRJbnQocGVvcGxlLmxlbmd0aCldLCBpbmRleCArIDEpLFxuICAgICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCBpbmRleCArIDEpXG4gICAgKTtcbiAgICBudW1UYXNrcysrO1xuICB9XG5cbiAgY29uc3QgcmVzID0gYXBwbHlBbGxPcHNUb1BsYW4ob3BzLCBwbGFuKTtcblxuICBpZiAoIXJlcy5vaykge1xuICAgIGNvbnNvbGUubG9nKHJlcy5lcnJvcik7XG4gIH1cbiAgcmV0dXJuIHBsYW47XG59O1xuXG5jb25zdCBwYXJ0cyA9IFtcbiAgXCJsb3JlbVwiLFxuICBcImlwc3VtXCIsXG4gIFwiZG9sb3JcIixcbiAgXCJzaXRcIixcbiAgXCJhbWV0XCIsXG4gIFwiY29uc2VjdGV0dXJcIixcbiAgXCJhZGlwaXNjaW5nXCIsXG4gIFwiZWxpdFwiLFxuICBcInNlZFwiLFxuICBcImRvXCIsXG4gIFwiZWl1c21vZFwiLFxuICBcInRlbXBvclwiLFxuICBcImluY2lkaWR1bnRcIixcbiAgXCJ1dFwiLFxuICBcImxhYm9yZVwiLFxuICBcImV0XCIsXG4gIFwiZG9sb3JlXCIsXG4gIFwibWFnbmFcIixcbiAgXCJhbGlxdWFcIixcbiAgXCJ1dFwiLFxuICBcImVuaW1cIixcbiAgXCJhZFwiLFxuICBcIm1pbmltXCIsXG4gIFwidmVuaWFtXCIsXG4gIFwicXVpc1wiLFxuICBcIm5vc3RydWRcIixcbiAgXCJleGVyY2l0YXRpb25cIixcbiAgXCJ1bGxhbWNvXCIsXG4gIFwibGFib3Jpc1wiLFxuICBcIm5pc2lcIixcbiAgXCJ1dFwiLFxuICBcImFsaXF1aXBcIixcbiAgXCJleFwiLFxuICBcImVhXCIsXG4gIFwiY29tbW9kb1wiLFxuICBcImNvbnNlcXVhdFwiLFxuICBcImV1aXNcIixcbiAgXCJhdXRlXCIsXG4gIFwiaXJ1cmVcIixcbiAgXCJkb2xvclwiLFxuICBcImluXCIsXG4gIFwicmVwcmVoZW5kZXJpdFwiLFxuICBcImluXCIsXG4gIFwidm9sdXB0YXRlXCIsXG4gIFwidmVsaXRcIixcbiAgXCJlc3NlXCIsXG4gIFwiY2lsbHVtXCIsXG4gIFwiZG9sb3JlXCIsXG4gIFwiZXVcIixcbiAgXCJmdWdpYXRcIixcbiAgXCJudWxsYVwiLFxuICBcInBhcmlhdHVyXCIsXG4gIFwiZXhjZXB0ZXVyXCIsXG4gIFwic2ludFwiLFxuICBcIm9jY2FlY2F0XCIsXG4gIFwiY3VwaWRhdGF0XCIsXG4gIFwibm9uXCIsXG4gIFwicHJvaWRlbnRcIixcbiAgXCJzdW50XCIsXG4gIFwiaW5cIixcbiAgXCJjdWxwYVwiLFxuICBcInF1aVwiLFxuICBcIm9mZmljaWFcIixcbiAgXCJkZXNlcnVudFwiLFxuICBcIm1vbGxpdFwiLFxuICBcImFuaW1cIixcbiAgXCJpZFwiLFxuICBcImVzdFwiLFxuICBcImxhYm9ydW1cIixcbl07XG5cbmNvbnN0IHBhcnRzTGVuZ3RoID0gcGFydHMubGVuZ3RoO1xuXG5jb25zdCByYW5kb21UYXNrTmFtZSA9ICgpOiBzdHJpbmcgPT5cbiAgYCR7cGFydHNbcm5kSW50KHBhcnRzTGVuZ3RoKV19ICR7cGFydHNbcm5kSW50KHBhcnRzTGVuZ3RoKV19YDtcbiIsICJpbXBvcnQgeyBSZXN1bHQgfSBmcm9tIFwiLi4vcmVzdWx0XCI7XG5cbi8vIERpc3BsYXlzIHRoZSBnaXZlbiBlcnJvci5cbi8vIFRPRE8gLSBNYWtlIHRoaXMgYSBwb3AtdXAgb3Igc29tZXRoaW5nLlxuZXhwb3J0IGNvbnN0IHJlcG9ydEVycm9yID0gKGVycm9yOiBFcnJvcikgPT4ge1xuICBjb25zb2xlLmxvZyhlcnJvcik7XG59O1xuXG4vLyBSZXBvcnRzIHRoZSBlcnJvciBpZiB0aGUgZ2l2ZW4gUmVzdWx0IGlzIG5vdCBvay5cbmV4cG9ydCBjb25zdCByZXBvcnRPbkVycm9yID0gPFQ+KHJldDogUmVzdWx0PFQ+KSA9PiB7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmVwb3J0RXJyb3IocmV0LmVycm9yKTtcbiAgfVxufTtcbiIsICJpbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBGaWx0ZXJGdW5jIH0gZnJvbSBcIi4uL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgZWRnZXNCeVNyY0FuZERzdFRvTWFwIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi4vb3BzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IFNldFJlc291cmNlVmFsdWVPcCB9IGZyb20gXCIuLi9vcHMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBGcm9tSlNPTiwgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IFByZWNpc2lvbiB9IGZyb20gXCIuLi9wcmVjaXNpb24vcHJlY2lzaW9uLnRzXCI7XG5pbXBvcnQge1xuICBESVZJREVSX01PVkVfRVZFTlQsXG4gIERpdmlkZXJNb3ZlLFxuICBEaXZpZGVyTW92ZVJlc3VsdCxcbn0gZnJvbSBcIi4uL3JlbmRlcmVyL2RpdmlkZXJtb3ZlL2RpdmlkZXJtb3ZlLnRzXCI7XG5pbXBvcnQge1xuICBEUkFHX1JBTkdFX0VWRU5ULFxuICBEcmFnUmFuZ2UsXG4gIE1vdXNlRHJhZyxcbn0gZnJvbSBcIi4uL3JlbmRlcmVyL21vdXNlZHJhZy9tb3VzZWRyYWcudHNcIjtcbmltcG9ydCB7IE1vdXNlTW92ZSB9IGZyb20gXCIuLi9yZW5kZXJlci9tb3VzZW1vdmUvbW91c2Vtb3ZlLnRzXCI7XG5pbXBvcnQgeyBEaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi4vcmVuZGVyZXIvcmFuZ2UvcmFuZ2UudHNcIjtcbmltcG9ydCB7XG4gIFJlbmRlck9wdGlvbnMsXG4gIFJlbmRlclJlc3VsdCxcbiAgVGFza0xhYmVsLFxuICBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MsXG4gIHJlbmRlclRhc2tzVG9DYW52YXMsXG4gIHN1Z2dlc3RlZENhbnZhc0hlaWdodCxcbn0gZnJvbSBcIi4uL3JlbmRlcmVyL3JlbmRlcmVyLnRzXCI7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuLi9yZW5kZXJlci9zY2FsZS9wb2ludC50c1wiO1xuaW1wb3J0IHsgU2NhbGUgfSBmcm9tIFwiLi4vcmVuZGVyZXIvc2NhbGUvc2NhbGUudHNcIjtcbmltcG9ydCB7IFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IENvbXB1dGVTbGFjaywgQ3JpdGljYWxQYXRoLCBTbGFjaywgU3BhbiB9IGZyb20gXCIuLi9zbGFjay9zbGFjay50c1wiO1xuaW1wb3J0IHsgVGhlbWUsIGNvbG9yVGhlbWVGcm9tRWxlbWVudCB9IGZyb20gXCIuLi9zdHlsZS90aGVtZS90aGVtZS50c1wiO1xuaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHtcbiAgQ3JpdGljYWxQYXRoRW50cnksXG4gIENyaXRpY2FsUGF0aFRhc2tFbnRyeSxcbiAgY3JpdGljYWxUYXNrRnJlcXVlbmNpZXMsXG4gIHNpbXVsYXRpb24sXG59IGZyb20gXCIuLi9zaW11bGF0aW9uL3NpbXVsYXRpb24udHNcIjtcbmltcG9ydCB7XG4gIGdlbmVyYXRlUmFuZG9tUGxhbixcbiAgZ2VuZXJhdGVTdGFydGVyUGxhbixcbn0gZnJvbSBcIi4uL2dlbmVyYXRlL2dlbmVyYXRlLnRzXCI7XG5pbXBvcnQgeyBleGVjdXRlLCBleGVjdXRlT3AgfSBmcm9tIFwiLi4vYWN0aW9uL2V4ZWN1dGUudHNcIjtcbmltcG9ydCB7IFN0YXJ0S2V5Ym9hcmRIYW5kbGluZyB9IGZyb20gXCIuLi9rZXltYXAva2V5bWFwLnRzXCI7XG5pbXBvcnQgeyBEZWxldGVUYXNrT3AsIFJlbW92ZUVkZ2VPcCwgU2V0VGFza05hbWVPcCB9IGZyb20gXCIuLi9vcHMvY2hhcnQudHNcIjtcbmltcG9ydCB7IERlcGVuZGVuY2llc1BhbmVsIH0gZnJvbSBcIi4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmNpZXMtcGFuZWwudHNcIjtcbmltcG9ydCB7IEFjdGlvbk5hbWVzIH0gZnJvbSBcIi4uL2FjdGlvbi9yZWdpc3RyeS50c1wiO1xuaW1wb3J0IHtcbiAgU2VsZWN0ZWRUYXNrUGFuZWwsXG4gIFRhc2tNZXRyaWNWYWx1ZUNoYW5nZURldGFpbHMsXG4gIFRhc2tOYW1lQ2hhbmdlRGV0YWlscyxcbiAgVGFza1Jlc291cmNlVmFsdWVDaGFuZ2VEZXRhaWxzLFxufSBmcm9tIFwiLi4vc2VsZWN0ZWQtdGFzay1wYW5lbC9zZWxlY3RlZC10YXNrLXBhbmVsLnRzXCI7XG5pbXBvcnQgeyByZXBvcnRPbkVycm9yIH0gZnJvbSBcIi4uL3JlcG9ydC1lcnJvci9yZXBvcnQtZXJyb3IudHNcIjtcbmltcG9ydCB7IFRhc2tEdXJhdGlvbiB9IGZyb20gXCIuLi90eXBlcy90eXBlcy50c1wiO1xuaW1wb3J0IHsgU2ltdWxhdGlvblBhbmVsIH0gZnJvbSBcIi4uL3NpbXVsYXRpb24tcGFuZWwvc2ltdWxhdGlvbi1wYW5lbC50c1wiO1xuXG5jb25zdCBGT05UX1NJWkVfUFggPSAzMjtcblxuY29uc3QgTlVNX1NJTVVMQVRJT05fTE9PUFMgPSAxMDA7XG5cbmNvbnN0IHByZWNpc2lvbiA9IG5ldyBQcmVjaXNpb24oMik7XG5cbmV4cG9ydCBjbGFzcyBFeHBsYW5NYWluIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAvKiogVGhlIFBsYW4gYmVpbmcgZWRpdGVkLiAqL1xuICBwbGFuOiBQbGFuID0gbmV3IFBsYW4oKTtcblxuICAvKiogVGhlIHN0YXJ0IGFuZCBmaW5pc2ggdGltZSBmb3IgZWFjaCBUYXNrIGluIHRoZSBQbGFuLiAqL1xuICBzcGFuczogU3BhbltdID0gW107XG5cbiAgLyoqIFRoZSB0YXNrIGluZGljZXMgb2YgdGFza3Mgb24gdGhlIGNyaXRpY2FsIHBhdGguICovXG4gIGNyaXRpY2FsUGF0aDogbnVtYmVyW10gPSBbXTtcblxuICAvKiogVGhlIHNlbGVjdGlvbiAoaW4gdGltZSkgb2YgdGhlIFBsYW4gY3VycmVudGx5IGJlaW5nIHZpZXdlZC4gKi9cbiAgZGlzcGxheVJhbmdlOiBEaXNwbGF5UmFuZ2UgfCBudWxsID0gbnVsbDtcblxuICAvKiogU2NhbGUgZm9yIHRoZSByYWRhciB2aWV3LCB1c2VkIGZvciBkcmFnIHNlbGVjdGluZyBhIGRpc3BsYXlSYW5nZS4gKi9cbiAgcmFkYXJTY2FsZTogU2NhbGUgfCBudWxsID0gbnVsbDtcblxuICAvKiogQWxsIG9mIHRoZSB0eXBlcyBvZiByZXNvdXJjZXMgaW4gdGhlIHBsYW4uICovXG4gIGdyb3VwQnlPcHRpb25zOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8qKiBXaGljaCBvZiB0aGUgcmVzb3VyY2VzIGFyZSB3ZSBjdXJyZW50bHkgZ3JvdXBpbmcgYnksIHdoZXJlIDAgbWVhbnMgbm9cbiAgICogZ3JvdXBpbmcgaXMgZG9uZS4gKi9cbiAgZ3JvdXBCeU9wdGlvbnNJbmRleDogbnVtYmVyID0gMDtcblxuICAvKiogVGhlIGN1cnJlbnRseSBzZWxlY3RlZCB0YXNrLCBhcyBhbiBpbmRleC4gKi9cbiAgc2VsZWN0ZWRUYXNrOiBudW1iZXIgPSAtMTtcblxuICAvLyBVSSBmZWF0dXJlcyB0aGF0IGNhbiBiZSB0b2dnbGVkIG9uIGFuZCBvZmYuXG4gIHRvcFRpbWVsaW5lOiBib29sZWFuID0gZmFsc2U7XG4gIGNyaXRpY2FsUGF0aHNPbmx5OiBib29sZWFuID0gZmFsc2U7XG4gIGZvY3VzT25UYXNrOiBib29sZWFuID0gZmFsc2U7XG4gIG1vdXNlTW92ZTogTW91c2VNb3ZlIHwgbnVsbCA9IG51bGw7XG5cbiAgZGVwZW5kZW5jaWVzUGFuZWw6IERlcGVuZGVuY2llc1BhbmVsIHwgbnVsbCA9IG51bGw7XG5cbiAgZG93bmxvYWRMaW5rOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gIHNlbGVjdGVkVGFza1BhbmVsOiBTZWxlY3RlZFRhc2tQYW5lbCB8IG51bGwgPSBudWxsO1xuXG4gIGFsdGVybmF0ZVRhc2tEdXJhdGlvbnM6IG51bWJlcltdIHwgbnVsbCA9IG51bGw7XG5cbiAgc2ltdWxhdGlvblBhbmVsOiBTaW11bGF0aW9uUGFuZWwgfCBudWxsID0gbnVsbDtcblxuICAvKiogQ2FsbGJhY2sgdG8gY2FsbCB3aGVuIGEgbW91c2UgbW92ZXMgb3ZlciB0aGUgY2hhcnQuICovXG4gIHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvczogVXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zIHwgbnVsbCA9IG51bGw7XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgdGhpcy5zaW11bGF0aW9uUGFuZWwgPVxuICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yPFNpbXVsYXRpb25QYW5lbD4oXCJzaW11bGF0aW9uLXBhbmVsXCIpO1xuICAgIHRoaXMuc2ltdWxhdGlvblBhbmVsIS5hZGRFdmVudExpc3RlbmVyKFwic2ltdWxhdGlvbi1zZWxlY3RcIiwgKGUpID0+IHtcbiAgICAgIHRoaXMuYWx0ZXJuYXRlVGFza0R1cmF0aW9ucyA9IGUuZGV0YWlsLmR1cmF0aW9ucztcbiAgICAgIHRoaXMuY3JpdGljYWxQYXRoID0gZS5kZXRhaWwuY3JpdGljYWxQYXRoO1xuICAgICAgdGhpcy5yZWNhbGN1bGF0ZVNwYW5zQW5kQ3JpdGljYWxQYXRoKCk7XG4gICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZG93bmxvYWRMaW5rID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxBbmNob3JFbGVtZW50PihcIiNkb3dubG9hZFwiKSE7XG4gICAgdGhpcy5kb3dubG9hZExpbmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucHJlcGFyZURvd25sb2FkKCk7XG4gICAgfSk7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXNQYW5lbCA9IHRoaXMucXVlcnlTZWxlY3RvcihcImRlcGVuZGVuY2llcy1wYW5lbFwiKSE7XG5cbiAgICB0aGlzLmRlcGVuZGVuY2llc1BhbmVsIS5hZGRFdmVudExpc3RlbmVyKFwiYWRkLWRlcGVuZGVuY3lcIiwgYXN5bmMgKGUpID0+IHtcbiAgICAgIGxldCBhY3Rpb25OYW1lOiBBY3Rpb25OYW1lcyA9IFwiQWRkUHJlZGVjZXNzb3JBY3Rpb25cIjtcbiAgICAgIGlmIChlLmRldGFpbC5kZXBUeXBlID09PSBcInN1Y2NcIikge1xuICAgICAgICBhY3Rpb25OYW1lID0gXCJBZGRTdWNjZXNzb3JBY3Rpb25cIjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGUoYWN0aW9uTmFtZSwgdGhpcyk7XG4gICAgICBpZiAoIXJldC5vaykge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5kZXBlbmRlbmNpZXNQYW5lbCEuYWRkRXZlbnRMaXN0ZW5lcihcImRlbGV0ZS1kZXBlbmRlbmN5XCIsIGFzeW5jIChlKSA9PiB7XG4gICAgICBsZXQgW2ksIGpdID0gW2UuZGV0YWlsLnRhc2tJbmRleCwgdGhpcy5zZWxlY3RlZFRhc2tdO1xuICAgICAgaWYgKGUuZGV0YWlsLmRlcFR5cGUgPT09IFwic3VjY1wiKSB7XG4gICAgICAgIFtpLCBqXSA9IFtqLCBpXTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG9wID0gUmVtb3ZlRWRnZU9wKGksIGopO1xuICAgICAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZU9wKG9wLCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLCB0cnVlLCB0aGlzKTtcbiAgICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJldC5lcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnNlbGVjdGVkVGFza1BhbmVsID0gdGhpcy5xdWVyeVNlbGVjdG9yKFwic2VsZWN0ZWQtdGFzay1wYW5lbFwiKSE7XG4gICAgdGhpcy5zZWxlY3RlZFRhc2tQYW5lbC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJ0YXNrLW5hbWUtY2hhbmdlXCIsXG4gICAgICBhc3luYyAoZTogQ3VzdG9tRXZlbnQ8VGFza05hbWVDaGFuZ2VEZXRhaWxzPikgPT4ge1xuICAgICAgICBjb25zdCBvcCA9IFNldFRhc2tOYW1lT3AoZS5kZXRhaWwudGFza0luZGV4LCBlLmRldGFpbC5uYW1lKTtcbiAgICAgICAgcmVwb3J0T25FcnJvcihhd2FpdCBleGVjdXRlT3Aob3AsIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCIsIHRydWUsIHRoaXMpKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5zZWxlY3RlZFRhc2tQYW5lbC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJ0YXNrLXJlc291cmNlLXZhbHVlLWNoYW5nZVwiLFxuICAgICAgYXN5bmMgKGU6IEN1c3RvbUV2ZW50PFRhc2tSZXNvdXJjZVZhbHVlQ2hhbmdlRGV0YWlscz4pID0+IHtcbiAgICAgICAgY29uc3QgeyBuYW1lLCB2YWx1ZSwgdGFza0luZGV4IH0gPSBlLmRldGFpbDtcbiAgICAgICAgY29uc3Qgb3AgPSBTZXRSZXNvdXJjZVZhbHVlT3AobmFtZSwgdmFsdWUsIHRhc2tJbmRleCk7XG4gICAgICAgIHJlcG9ydE9uRXJyb3IoYXdhaXQgZXhlY3V0ZU9wKG9wLCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLCB0cnVlLCB0aGlzKSk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMuc2VsZWN0ZWRUYXNrUGFuZWwuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwidGFzay1tZXRyaWMtdmFsdWUtY2hhbmdlXCIsXG4gICAgICBhc3luYyAoZTogQ3VzdG9tRXZlbnQ8VGFza01ldHJpY1ZhbHVlQ2hhbmdlRGV0YWlscz4pID0+IHtcbiAgICAgICAgY29uc3QgeyBuYW1lLCB2YWx1ZSwgdGFza0luZGV4IH0gPSBlLmRldGFpbDtcbiAgICAgICAgY29uc3Qgb3AgPSBTZXRNZXRyaWNWYWx1ZU9wKG5hbWUsIHZhbHVlLCB0YXNrSW5kZXgpO1xuICAgICAgICByZXBvcnRPbkVycm9yKGF3YWl0IGV4ZWN1dGVPcChvcCwgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIiwgdHJ1ZSwgdGhpcykpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBEcmFnZ2luZyBvbiB0aGUgcmFkYXIuXG4gICAgY29uc3QgcmFkYXIgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KFwiI3JhZGFyXCIpITtcbiAgICBuZXcgTW91c2VEcmFnKHJhZGFyKTtcbiAgICByYWRhci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgRFJBR19SQU5HRV9FVkVOVCxcbiAgICAgIHRoaXMuZHJhZ1JhbmdlSGFuZGxlci5iaW5kKHRoaXMpIGFzIEV2ZW50TGlzdGVuZXJcbiAgICApO1xuXG4gICAgLy8gRGl2aWRlciBkcmFnZ2luZy5cbiAgICBjb25zdCBkaXZpZGVyID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcInZlcnRpY2FsLWRpdmlkZXJcIikhO1xuICAgIG5ldyBEaXZpZGVyTW92ZShkb2N1bWVudC5ib2R5LCBkaXZpZGVyLCBcImNvbHVtblwiKTtcblxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihESVZJREVSX01PVkVfRVZFTlQsICgoXG4gICAgICBlOiBDdXN0b21FdmVudDxEaXZpZGVyTW92ZVJlc3VsdD5cbiAgICApID0+IHtcbiAgICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkoXG4gICAgICAgIFwiZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zXCIsXG4gICAgICAgIGBjYWxjKCR7ZS5kZXRhaWwuYmVmb3JlfSUgLSAxNXB4KSAxMHB4IGF1dG9gXG4gICAgICApO1xuICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgfSkgYXMgRXZlbnRMaXN0ZW5lcik7XG5cbiAgICAvLyBCdXR0b25zXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3Jlc2V0LXpvb21cIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBleGVjdXRlKFwiUmVzZXRab29tQWN0aW9uXCIsIHRoaXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2RhcmstbW9kZS10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBleGVjdXRlKFwiVG9nZ2xlRGFya01vZGVBY3Rpb25cIiwgdGhpcyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjcmFkYXItdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgZXhlY3V0ZShcIlRvZ2dsZVJhZGFyQWN0aW9uXCIsIHRoaXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3RvcC10aW1lbGluZS10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcImNsaWNrXCIsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMudG9wVGltZWxpbmUgPSAhdGhpcy50b3BUaW1lbGluZTtcbiAgICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNncm91cC1ieS10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLnRvZ2dsZUdyb3VwQnkoKTtcbiAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2NyaXRpY2FsLXBhdGhzLXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGVDcml0aWNhbFBhdGhzT25seSgpO1xuICAgICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3Qgb3ZlcmxheUNhbnZhcyA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MQ2FudmFzRWxlbWVudD4oXCIjb3ZlcmxheVwiKSE7XG4gICAgdGhpcy5tb3VzZU1vdmUgPSBuZXcgTW91c2VNb3ZlKG92ZXJsYXlDYW52YXMpO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbk1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcblxuICAgIG92ZXJsYXlDYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgY29uc3QgcCA9IG5ldyBQb2ludChlLm9mZnNldFgsIGUub2Zmc2V0WSk7XG4gICAgICBpZiAodGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZFRhc2sgPVxuICAgICAgICAgIHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zKHAsIFwibW91c2Vkb3duXCIpIHx8IC0xO1xuICAgICAgICB0aGlzLnVwZGF0ZVRhc2tQYW5lbHModGhpcy5zZWxlY3RlZFRhc2spO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgb3ZlcmxheUNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHAgPSBuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICAgICAgaWYgKHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2V0Rm9jdXNPblRhc2soXG4gICAgICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MocCwgXCJtb3VzZWRvd25cIikgfHwgLTFcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFJlYWN0IHRvIHRoZSB1cGxvYWQgaW5wdXQuXG4gICAgY29uc3QgZmlsZVVwbG9hZCA9XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiI2ZpbGUtdXBsb2FkXCIpITtcbiAgICBmaWxlVXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QganNvbiA9IGF3YWl0IGZpbGVVcGxvYWQuZmlsZXMhWzBdLnRleHQoKTtcbiAgICAgIGNvbnN0IHJldCA9IEZyb21KU09OKGpzb24pO1xuICAgICAgaWYgKCFyZXQub2spIHtcbiAgICAgICAgdGhyb3cgcmV0LmVycm9yO1xuICAgICAgfVxuICAgICAgdGhpcy5wbGFuID0gcmV0LnZhbHVlO1xuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2ltdWxhdGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLmNyaXRpY2FsUGF0aCA9IHRoaXMuc2ltdWxhdGlvblBhbmVsIS5zaW11bGF0ZShcbiAgICAgICAgdGhpcy5wbGFuLmNoYXJ0LFxuICAgICAgICBOVU1fU0lNVUxBVElPTl9MT09QUyxcbiAgICAgICAgdGhpcy5jcml0aWNhbFBhdGhcbiAgICAgICk7XG4gICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNmb2N1cy1vbi1zZWxlY3RlZC10YXNrXCIpIS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJjbGlja1wiLFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnRvZ2dsZUZvY3VzT25UYXNrKCk7XG4gICAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZ2VuLXJhbmRvbS1wbGFuXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5wbGFuID0gZ2VuZXJhdGVSYW5kb21QbGFuKCk7XG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGxhbiA9IGdlbmVyYXRlU3RhcnRlclBsYW4oKTtcbiAgICB0aGlzLnVwZGF0ZVRhc2tQYW5lbHModGhpcy5zZWxlY3RlZFRhc2spO1xuICAgIHRoaXMucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5wYWludENoYXJ0LmJpbmQodGhpcykpO1xuICAgIFN0YXJ0S2V5Ym9hcmRIYW5kbGluZyh0aGlzKTtcbiAgfVxuXG4gIHByZXBhcmVEb3dubG9hZCgpIHtcbiAgICBjb25zdCBkb3dubG9hZEJsb2IgPSBuZXcgQmxvYihbSlNPTi5zdHJpbmdpZnkodGhpcy5wbGFuLCBudWxsLCBcIiAgXCIpXSwge1xuICAgICAgdHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgfSk7XG4gICAgdGhpcy5kb3dubG9hZExpbmshLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGRvd25sb2FkQmxvYik7XG4gIH1cblxuICB1cGRhdGVUYXNrUGFuZWxzKHRhc2tJbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZWxlY3RlZFRhc2sgPSB0YXNrSW5kZXg7XG4gICAgdGhpcy5zZWxlY3RlZFRhc2tQYW5lbCEudXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWwoXG4gICAgICB0aGlzLnBsYW4sXG4gICAgICB0aGlzLnNlbGVjdGVkVGFza1xuICAgICk7XG4gICAgY29uc3QgZWRnZXMgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAodGhpcy5wbGFuLmNoYXJ0LkVkZ2VzKTtcbiAgICB0aGlzLmRlcGVuZGVuY2llc1BhbmVsIS5zZXRUYXNrc0FuZEluZGljZXMoXG4gICAgICB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXMsXG4gICAgICAoZWRnZXMuYnlEc3QuZ2V0KHRhc2tJbmRleCkgfHwgW10pLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLmkpLFxuICAgICAgKGVkZ2VzLmJ5U3JjLmdldCh0YXNrSW5kZXgpIHx8IFtdKS5tYXAoKGU6IERpcmVjdGVkRWRnZSkgPT4gZS5qKVxuICAgICk7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXNQYW5lbCEuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgIFwiaGlkZGVuXCIsXG4gICAgICB0aGlzLnNlbGVjdGVkVGFzayA9PT0gLTFcbiAgICApO1xuICB9XG5cbiAgc2V0Rm9jdXNPblRhc2soaW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuc2VsZWN0ZWRUYXNrID0gaW5kZXg7XG4gICAgdGhpcy5mb3JjZUZvY3VzT25UYXNrKCk7XG4gICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgdGhpcy51cGRhdGVUYXNrUGFuZWxzKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgfVxuXG4gIC8vIFRPRE8gLSBUdXJuIHRoaXMgb24gYW5kIG9mZiBiYXNlZCBvbiBtb3VzZSBlbnRlcmluZyB0aGUgY2FudmFzIGFyZWEuXG4gIG9uTW91c2VNb3ZlKCkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5tb3VzZU1vdmUhLnJlYWRMb2NhdGlvbigpO1xuICAgIGlmIChsb2NhdGlvbiAhPT0gbnVsbCAmJiB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MobG9jYXRpb24sIFwibW91c2Vtb3ZlXCIpO1xuICAgIH1cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBwbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCkge1xuICAgIHRoaXMucmFkYXJTY2FsZSA9IG51bGw7XG4gICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuYWx0ZXJuYXRlVGFza0R1cmF0aW9ucyA9IG51bGw7XG4gICAgdGhpcy5ncm91cEJ5T3B0aW9ucyA9IFtcIlwiLCAuLi5PYmplY3Qua2V5cyh0aGlzLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucyldO1xuICAgIHRoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleCA9IDA7XG4gICAgdGhpcy5yZWNhbGN1bGF0ZVNwYW5zQW5kQ3JpdGljYWxQYXRoKCk7XG4gICAgdGhpcy5wYWludENoYXJ0KCk7XG4gIH1cblxuICBnZXRUYXNrRHVyYXRpb25GdW5jKCk6IFRhc2tEdXJhdGlvbiB7XG4gICAgaWYgKHRoaXMuYWx0ZXJuYXRlVGFza0R1cmF0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuICh0YXNrSW5kZXg6IG51bWJlcikgPT4gdGhpcy5hbHRlcm5hdGVUYXNrRHVyYXRpb25zIVt0YXNrSW5kZXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKHRhc2tJbmRleDogbnVtYmVyKSA9PlxuICAgICAgICB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5kdXJhdGlvbjtcbiAgICB9XG4gIH1cblxuICByZWNhbGN1bGF0ZVNwYW5zQW5kQ3JpdGljYWxQYXRoKCkge1xuICAgIGxldCBzbGFja3M6IFNsYWNrW10gPSBbXTtcblxuICAgIGNvbnN0IHNsYWNrUmVzdWx0ID0gQ29tcHV0ZVNsYWNrKFxuICAgICAgdGhpcy5wbGFuLmNoYXJ0LFxuICAgICAgdGhpcy5nZXRUYXNrRHVyYXRpb25GdW5jKCksXG4gICAgICBwcmVjaXNpb24ucm91bmRlcigpXG4gICAgKTtcbiAgICBpZiAoIXNsYWNrUmVzdWx0Lm9rKSB7XG4gICAgICBjb25zb2xlLmVycm9yKHNsYWNrUmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2xhY2tzID0gc2xhY2tSZXN1bHQudmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5zcGFucyA9IHNsYWNrcy5tYXAoKHZhbHVlOiBTbGFjayk6IFNwYW4gPT4ge1xuICAgICAgcmV0dXJuIHZhbHVlLmVhcmx5O1xuICAgIH0pO1xuICAgIHRoaXMuY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrcywgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG4gICAgdGhpcy51cGRhdGVUYXNrUGFuZWxzKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgfVxuXG4gIGdldFRhc2tMYWJlbGxlcigpOiBUYXNrTGFiZWwge1xuICAgIHJldHVybiAodGFza0luZGV4OiBudW1iZXIpOiBzdHJpbmcgPT5cbiAgICAgIGAke3RoaXMucGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLm5hbWV9YDtcbiAgfVxuXG4gIGRyYWdSYW5nZUhhbmRsZXIoZTogQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPikge1xuICAgIGlmICh0aGlzLnJhZGFyU2NhbGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYmVnaW4gPSB0aGlzLnJhZGFyU2NhbGUuZGF5Um93RnJvbVBvaW50KGUuZGV0YWlsLmJlZ2luKTtcbiAgICBjb25zdCBlbmQgPSB0aGlzLnJhZGFyU2NhbGUuZGF5Um93RnJvbVBvaW50KGUuZGV0YWlsLmVuZCk7XG4gICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBuZXcgRGlzcGxheVJhbmdlKGJlZ2luLmRheSwgZW5kLmRheSk7XG4gICAgdGhpcy5wYWludENoYXJ0KCk7XG4gIH1cblxuICB0b2dnbGVSYWRhcigpIHtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJyYWRhci1wYXJlbnRcIikhLmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gIH1cblxuICB0b2dnbGVHcm91cEJ5KCkge1xuICAgIHRoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleCA9XG4gICAgICAodGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4ICsgMSkgJSB0aGlzLmdyb3VwQnlPcHRpb25zLmxlbmd0aDtcbiAgfVxuXG4gIHRvZ2dsZUNyaXRpY2FsUGF0aHNPbmx5KCkge1xuICAgIHRoaXMuY3JpdGljYWxQYXRoc09ubHkgPSAhdGhpcy5jcml0aWNhbFBhdGhzT25seTtcbiAgfVxuXG4gIHRvZ2dsZUZvY3VzT25UYXNrKCkge1xuICAgIHRoaXMuZm9jdXNPblRhc2sgPSAhdGhpcy5mb2N1c09uVGFzaztcbiAgICBpZiAoIXRoaXMuZm9jdXNPblRhc2spIHtcbiAgICAgIHRoaXMuZGlzcGxheVJhbmdlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBmb3JjZUZvY3VzT25UYXNrKCkge1xuICAgIHRoaXMuZm9jdXNPblRhc2sgPSB0cnVlO1xuICB9XG5cbiAgcGFpbnRDaGFydCgpIHtcbiAgICBjb25zb2xlLnRpbWUoXCJwYWludENoYXJ0XCIpO1xuXG4gICAgY29uc3QgdGhlbWVDb2xvcnM6IFRoZW1lID0gY29sb3JUaGVtZUZyb21FbGVtZW50KGRvY3VtZW50LmJvZHkpO1xuXG4gICAgbGV0IGZpbHRlckZ1bmM6IEZpbHRlckZ1bmMgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBzdGFydEFuZEZpbmlzaCA9IFswLCB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMV07XG4gICAgaWYgKHRoaXMuY3JpdGljYWxQYXRoc09ubHkpIHtcbiAgICAgIGNvbnN0IGhpZ2hsaWdodFNldCA9IG5ldyBTZXQodGhpcy5jcml0aWNhbFBhdGgpO1xuICAgICAgZmlsdGVyRnVuYyA9ICh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgICAgICBpZiAoc3RhcnRBbmRGaW5pc2guaW5jbHVkZXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaWdobGlnaHRTZXQuaGFzKHRhc2tJbmRleCk7XG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5mb2N1c09uVGFzayAmJiB0aGlzLnNlbGVjdGVkVGFzayAhPSAtMSkge1xuICAgICAgLy8gRmluZCBhbGwgcHJlZGVjZXNzb3IgYW5kIHN1Y2Nlc3NvcnMgb2YgdGhlIGdpdmVuIHRhc2suXG4gICAgICBjb25zdCBuZWlnaGJvclNldCA9IG5ldyBTZXQoKTtcbiAgICAgIG5laWdoYm9yU2V0LmFkZCh0aGlzLnNlbGVjdGVkVGFzayk7XG4gICAgICBsZXQgZWFybGllc3RTdGFydCA9IHRoaXMuc3BhbnNbdGhpcy5zZWxlY3RlZFRhc2tdLnN0YXJ0O1xuICAgICAgbGV0IGxhdGVzdEZpbmlzaCA9IHRoaXMuc3BhbnNbdGhpcy5zZWxlY3RlZFRhc2tdLmZpbmlzaDtcbiAgICAgIHRoaXMucGxhbi5jaGFydC5FZGdlcy5mb3JFYWNoKChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgICAgaWYgKGVkZ2UuaSA9PT0gdGhpcy5zZWxlY3RlZFRhc2spIHtcbiAgICAgICAgICBuZWlnaGJvclNldC5hZGQoZWRnZS5qKTtcbiAgICAgICAgICBpZiAobGF0ZXN0RmluaXNoIDwgdGhpcy5zcGFuc1tlZGdlLmpdLmZpbmlzaCkge1xuICAgICAgICAgICAgbGF0ZXN0RmluaXNoID0gdGhpcy5zcGFuc1tlZGdlLmpdLmZpbmlzaDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVkZ2UuaiA9PT0gdGhpcy5zZWxlY3RlZFRhc2spIHtcbiAgICAgICAgICBuZWlnaGJvclNldC5hZGQoZWRnZS5pKTtcbiAgICAgICAgICBpZiAoZWFybGllc3RTdGFydCA+IHRoaXMuc3BhbnNbZWRnZS5pXS5zdGFydCkge1xuICAgICAgICAgICAgZWFybGllc3RTdGFydCA9IHRoaXMuc3BhbnNbZWRnZS5pXS5zdGFydDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gVE9ETyAtIFNpbmNlIHdlIG92ZXJ3cml0ZSBkaXNwbGF5UmFuZ2UgdGhhdCBtZWFucyBkcmFnZ2luZyBvbiB0aGUgcmFkYXJcbiAgICAgIC8vIHdpbGwgbm90IHdvcmsgd2hlbiBmb2N1c2luZyBvbiBhIHNlbGVjdGVkIHRhc2suIEJ1ZyBvciBmZWF0dXJlP1xuICAgICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBuZXcgRGlzcGxheVJhbmdlKGVhcmxpZXN0U3RhcnQgLSAxLCBsYXRlc3RGaW5pc2ggKyAxKTtcblxuICAgICAgZmlsdGVyRnVuYyA9IChfdGFzazogVGFzaywgdGFza0luZGV4OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICAgICAgaWYgKHN0YXJ0QW5kRmluaXNoLmluY2x1ZGVzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZWlnaGJvclNldC5oYXModGFza0luZGV4KTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgcmFkYXJPcHRzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgICAgZm9udFNpemVQeDogNixcbiAgICAgIGhhc1RleHQ6IGZhbHNlLFxuICAgICAgZGlzcGxheVJhbmdlOiB0aGlzLmRpc3BsYXlSYW5nZSxcbiAgICAgIGRpc3BsYXlSYW5nZVVzYWdlOiBcImhpZ2hsaWdodFwiLFxuICAgICAgY29sb3JzOiB7XG4gICAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZTogdGhlbWVDb2xvcnMub25TdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2VNdXRlZDogdGhlbWVDb2xvcnMub25TdXJmYWNlTXV0ZWQsXG4gICAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgICBvdmVybGF5OiB0aGVtZUNvbG9ycy5vdmVybGF5LFxuICAgICAgICBncm91cENvbG9yOiB0aGVtZUNvbG9ycy5ncm91cENvbG9yLFxuICAgICAgICBoaWdobGlnaHQ6IHRoZW1lQ29sb3JzLmhpZ2hsaWdodCxcbiAgICAgIH0sXG4gICAgICBoYXNUaW1lbGluZTogZmFsc2UsXG4gICAgICBoYXNUYXNrczogdHJ1ZSxcbiAgICAgIGhhc0VkZ2VzOiBmYWxzZSxcbiAgICAgIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IGZhbHNlLFxuICAgICAgdGFza0xhYmVsOiB0aGlzLmdldFRhc2tMYWJlbGxlcigpLFxuICAgICAgdGFza0R1cmF0aW9uOiB0aGlzLmdldFRhc2tEdXJhdGlvbkZ1bmMoKSxcbiAgICAgIHRhc2tFbXBoYXNpemU6IHRoaXMuY3JpdGljYWxQYXRoLFxuICAgICAgZmlsdGVyRnVuYzogbnVsbCxcbiAgICAgIGdyb3VwQnlSZXNvdXJjZTogdGhpcy5ncm91cEJ5T3B0aW9uc1t0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXhdLFxuICAgICAgaGlnaGxpZ2h0ZWRUYXNrOiBudWxsLFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXg6IHRoaXMuc2VsZWN0ZWRUYXNrLFxuICAgIH07XG5cbiAgICBjb25zdCB6b29tT3B0czogUmVuZGVyT3B0aW9ucyA9IHtcbiAgICAgIGZvbnRTaXplUHg6IEZPTlRfU0laRV9QWCxcbiAgICAgIGhhc1RleHQ6IHRydWUsXG4gICAgICBkaXNwbGF5UmFuZ2U6IHRoaXMuZGlzcGxheVJhbmdlLFxuICAgICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwicmVzdHJpY3RcIixcbiAgICAgIGNvbG9yczoge1xuICAgICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlTXV0ZWQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZU11dGVkLFxuICAgICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgICAgZ3JvdXBDb2xvcjogdGhlbWVDb2xvcnMuZ3JvdXBDb2xvcixcbiAgICAgICAgaGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5oaWdobGlnaHQsXG4gICAgICB9LFxuICAgICAgaGFzVGltZWxpbmU6IHRoaXMudG9wVGltZWxpbmUsXG4gICAgICBoYXNUYXNrczogdHJ1ZSxcbiAgICAgIGhhc0VkZ2VzOiB0cnVlLFxuICAgICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogdHJ1ZSxcbiAgICAgIHRhc2tMYWJlbDogdGhpcy5nZXRUYXNrTGFiZWxsZXIoKSxcbiAgICAgIHRhc2tEdXJhdGlvbjogdGhpcy5nZXRUYXNrRHVyYXRpb25GdW5jKCksXG4gICAgICB0YXNrRW1waGFzaXplOiB0aGlzLmNyaXRpY2FsUGF0aCxcbiAgICAgIGZpbHRlckZ1bmM6IGZpbHRlckZ1bmMsXG4gICAgICBncm91cEJ5UmVzb3VyY2U6IHRoaXMuZ3JvdXBCeU9wdGlvbnNbdGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4XSxcbiAgICAgIGhpZ2hsaWdodGVkVGFzazogMSxcbiAgICAgIHNlbGVjdGVkVGFza0luZGV4OiB0aGlzLnNlbGVjdGVkVGFzayxcbiAgICB9O1xuXG4gICAgY29uc3QgdGltZWxpbmVPcHRzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgICAgZm9udFNpemVQeDogRk9OVF9TSVpFX1BYLFxuICAgICAgaGFzVGV4dDogdHJ1ZSxcbiAgICAgIGRpc3BsYXlSYW5nZTogdGhpcy5kaXNwbGF5UmFuZ2UsXG4gICAgICBkaXNwbGF5UmFuZ2VVc2FnZTogXCJyZXN0cmljdFwiLFxuICAgICAgY29sb3JzOiB7XG4gICAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZTogdGhlbWVDb2xvcnMub25TdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2VNdXRlZDogdGhlbWVDb2xvcnMub25TdXJmYWNlTXV0ZWQsXG4gICAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgICBvdmVybGF5OiB0aGVtZUNvbG9ycy5vdmVybGF5LFxuICAgICAgICBncm91cENvbG9yOiB0aGVtZUNvbG9ycy5ncm91cENvbG9yLFxuICAgICAgICBoaWdobGlnaHQ6IHRoZW1lQ29sb3JzLmhpZ2hsaWdodCxcbiAgICAgIH0sXG4gICAgICBoYXNUaW1lbGluZTogdHJ1ZSxcbiAgICAgIGhhc1Rhc2tzOiBmYWxzZSxcbiAgICAgIGhhc0VkZ2VzOiB0cnVlLFxuICAgICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogdHJ1ZSxcbiAgICAgIHRhc2tMYWJlbDogdGhpcy5nZXRUYXNrTGFiZWxsZXIoKSxcbiAgICAgIHRhc2tEdXJhdGlvbjogdGhpcy5nZXRUYXNrRHVyYXRpb25GdW5jKCksXG4gICAgICB0YXNrRW1waGFzaXplOiB0aGlzLmNyaXRpY2FsUGF0aCxcbiAgICAgIGZpbHRlckZ1bmM6IGZpbHRlckZ1bmMsXG4gICAgICBncm91cEJ5UmVzb3VyY2U6IHRoaXMuZ3JvdXBCeU9wdGlvbnNbdGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4XSxcbiAgICAgIGhpZ2hsaWdodGVkVGFzazogbnVsbCxcbiAgICAgIHNlbGVjdGVkVGFza0luZGV4OiB0aGlzLnNlbGVjdGVkVGFzayxcbiAgICB9O1xuXG4gICAgY29uc3QgcmV0ID0gdGhpcy5wYWludE9uZUNoYXJ0KFwiI3JhZGFyXCIsIHJhZGFyT3B0cyk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yYWRhclNjYWxlID0gcmV0LnZhbHVlLnNjYWxlO1xuXG4gICAgdGhpcy5wYWludE9uZUNoYXJ0KFwiI3RpbWVsaW5lXCIsIHRpbWVsaW5lT3B0cyk7XG4gICAgY29uc3Qgem9vbVJldCA9IHRoaXMucGFpbnRPbmVDaGFydChcIiN6b29tZWRcIiwgem9vbU9wdHMsIFwiI292ZXJsYXlcIik7XG4gICAgaWYgKHpvb21SZXQub2spIHtcbiAgICAgIHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zID1cbiAgICAgICAgem9vbVJldC52YWx1ZS51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M7XG4gICAgICBpZiAoem9vbVJldC52YWx1ZS5zZWxlY3RlZFRhc2tMb2NhdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiY2hhcnQtcGFyZW50XCIpIS5zY3JvbGwoe1xuICAgICAgICAgIHRvcDogem9vbVJldC52YWx1ZS5zZWxlY3RlZFRhc2tMb2NhdGlvbi55LFxuICAgICAgICAgIGJlaGF2aW9yOiBcInNtb290aFwiLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zb2xlLnRpbWVFbmQoXCJwYWludENoYXJ0XCIpO1xuICB9XG5cbiAgcHJlcGFyZUNhbnZhcyhcbiAgICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxuICAgIGNhbnZhc1dpZHRoOiBudW1iZXIsXG4gICAgY2FudmFzSGVpZ2h0OiBudW1iZXIsXG4gICAgd2lkdGg6IG51bWJlcixcbiAgICBoZWlnaHQ6IG51bWJlclxuICApOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQge1xuICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhc1dpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXNIZWlnaHQ7XG4gICAgY2FudmFzLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuXG4gICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKSE7XG4gICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIGN0eDtcbiAgfVxuXG4gIHBhaW50T25lQ2hhcnQoXG4gICAgY2FudmFzSUQ6IHN0cmluZyxcbiAgICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICAgIG92ZXJsYXlJRDogc3RyaW5nID0gXCJcIlxuICApOiBSZXN1bHQ8UmVuZGVyUmVzdWx0PiB7XG4gICAgY29uc3QgY2FudmFzID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxDYW52YXNFbGVtZW50PihjYW52YXNJRCkhO1xuICAgIGNvbnN0IHBhcmVudCA9IGNhbnZhcyEucGFyZW50RWxlbWVudCE7XG4gICAgY29uc3QgcmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbiAgICBjb25zdCB3aWR0aCA9IHBhcmVudC5jbGllbnRXaWR0aCAtIEZPTlRfU0laRV9QWDtcbiAgICBsZXQgaGVpZ2h0ID0gcGFyZW50LmNsaWVudEhlaWdodDtcbiAgICBjb25zdCBjYW52YXNXaWR0aCA9IE1hdGguY2VpbCh3aWR0aCAqIHJhdGlvKTtcbiAgICBsZXQgY2FudmFzSGVpZ2h0ID0gTWF0aC5jZWlsKGhlaWdodCAqIHJhdGlvKTtcblxuICAgIGNvbnN0IG5ld0hlaWdodCA9IHN1Z2dlc3RlZENhbnZhc0hlaWdodChcbiAgICAgIGNhbnZhcyxcbiAgICAgIHRoaXMuc3BhbnMsXG4gICAgICBvcHRzLFxuICAgICAgdGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCArIDIgLy8gVE9ETyAtIFdoeSBkbyB3ZSBuZWVkIHRoZSArMiBoZXJlIT9cbiAgICApO1xuICAgIGNhbnZhc0hlaWdodCA9IG5ld0hlaWdodDtcbiAgICBoZWlnaHQgPSBuZXdIZWlnaHQgLyB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcblxuICAgIGxldCBvdmVybGF5OiBIVE1MQ2FudmFzRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAgIGlmIChvdmVybGF5SUQpIHtcbiAgICAgIG92ZXJsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxDYW52YXNFbGVtZW50PihvdmVybGF5SUQpITtcbiAgICAgIHRoaXMucHJlcGFyZUNhbnZhcyhvdmVybGF5LCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG4gICAgY29uc3QgY3R4ID0gdGhpcy5wcmVwYXJlQ2FudmFzKFxuICAgICAgY2FudmFzLFxuICAgICAgY2FudmFzV2lkdGgsXG4gICAgICBjYW52YXNIZWlnaHQsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodFxuICAgICk7XG5cbiAgICByZXR1cm4gcmVuZGVyVGFza3NUb0NhbnZhcyhcbiAgICAgIHBhcmVudCxcbiAgICAgIGNhbnZhcyxcbiAgICAgIGN0eCxcbiAgICAgIHRoaXMucGxhbixcbiAgICAgIHRoaXMuc3BhbnMsXG4gICAgICBvcHRzLFxuICAgICAgb3ZlcmxheVxuICAgICk7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwiZXhwbGFuLW1haW5cIiwgRXhwbGFuTWFpbik7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFHQyxPQUFDLENBQUMsTUFBTSxRQUFRO0FBQ2YsWUFBRyxPQUFPLFdBQVcsY0FBYyxPQUFPLElBQUssUUFBTyxDQUFDLEdBQUcsR0FBRztBQUFBLGlCQUNyRCxPQUFPLFdBQVcsWUFBWSxPQUFPLFFBQVMsUUFBTyxVQUFVLElBQUk7QUFBQSxZQUN0RSxNQUFLLFdBQVcsSUFBSSxJQUFJO0FBQUEsTUFDL0IsR0FBRyxTQUFNLENBQUFBLE9BQUs7QUFDWjtBQUVBLFlBQUksU0FBUyxDQUFDLFFBQVEsV0FBVztBQUMvQixjQUFHLENBQUMsVUFBVSxDQUFDLE9BQVEsUUFBTztBQUU5QixjQUFJLGlCQUFpQixrQkFBa0IsTUFBTTtBQUM3QyxjQUFHLENBQUMsV0FBVyxNQUFNLEVBQUcsVUFBUyxZQUFZLE1BQU07QUFFbkQsY0FBSSxpQkFBaUIsZUFBZTtBQUNwQyxlQUFJLGlCQUFpQixPQUFPLGVBQWUsZUFBZ0IsUUFBTztBQUVsRSxpQkFBTyxVQUFVLGdCQUFnQixNQUFNO0FBQUEsUUFDekM7QUFFQSxZQUFJLEtBQUssQ0FBQyxRQUFRLFNBQVMsWUFBWTtBQUNyQyxjQUFHLENBQUMsT0FBUSxRQUFPLFNBQVMsTUFBTSxJQUFJLFNBQVMsT0FBTyxJQUFJO0FBRTFELGNBQUksaUJBQWlCLGtCQUFrQixNQUFNO0FBQzdD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UUFDQSxLQUFLLEtBQUssTUFBTSxTQUFTLFNBQVM7QUFBQTtBQUFBLE1BQ3BDO0FBQ0EscUJBQWU7QUFDZixlQUFTLFlBQVksT0FBTztBQUU1QixVQUFJLFVBQW9DO0FBQ3hDLFVBQUksV0FBVztBQUNiLGtCQUFVLFNBQVMsY0FBaUMsU0FBUztBQUM3RCxhQUFLLGNBQWMsU0FBUyxhQUFhLGNBQWMsT0FBTyxNQUFNO0FBQUEsTUFDdEU7QUFDQSxZQUFNLE1BQU0sS0FBSztBQUFBLFFBQ2Y7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUVBLGFBQU87QUFBQSxRQUNMO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBLEtBQUs7QUFBQSxRQUNMLEtBQUs7QUFBQSxRQUNMO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLGlCQUFlLE9BQU8sZUFBZSxVQUFVOyIsCiAgIm5hbWVzIjogWyJfIiwgInJlc3VsdCIsICJpIiwgImhpZ2hsaWdodCIsICJwYXJ0cyIsICJSZXN1bHQiLCAiYSIsICJiIiwgInMiLCAic2NvcmUiLCAiaiIsICJ4IiwgInIiLCAiZSIsICJvIiwgInYiLCAiYyIsICJmIiwgImdsb2JhbCIsICJnbG9iYWxUaGlzIiwgInRydXN0ZWRUeXBlcyIsICJwb2xpY3kiLCAiY3JlYXRlUG9saWN5IiwgImNyZWF0ZUhUTUwiLCAicyIsICJib3VuZEF0dHJpYnV0ZVN1ZmZpeCIsICJtYXJrZXIiLCAiTWF0aCIsICJyYW5kb20iLCAidG9GaXhlZCIsICJzbGljZSIsICJtYXJrZXJNYXRjaCIsICJub2RlTWFya2VyIiwgImQiLCAiZG9jdW1lbnQiLCAiY3JlYXRlTWFya2VyIiwgImNyZWF0ZUNvbW1lbnQiLCAiaXNQcmltaXRpdmUiLCAidmFsdWUiLCAiaXNBcnJheSIsICJBcnJheSIsICJpc0l0ZXJhYmxlIiwgIlN5bWJvbCIsICJpdGVyYXRvciIsICJTUEFDRV9DSEFSIiwgInRleHRFbmRSZWdleCIsICJjb21tZW50RW5kUmVnZXgiLCAiY29tbWVudDJFbmRSZWdleCIsICJ0YWdFbmRSZWdleCIsICJSZWdFeHAiLCAic2luZ2xlUXVvdGVBdHRyRW5kUmVnZXgiLCAiZG91YmxlUXVvdGVBdHRyRW5kUmVnZXgiLCAicmF3VGV4dEVsZW1lbnQiLCAidGFnIiwgInR5cGUiLCAic3RyaW5ncyIsICJ2YWx1ZXMiLCAiXyRsaXRUeXBlJCIsICJodG1sIiwgInN2ZyIsICJtYXRobWwiLCAibm9DaGFuZ2UiLCAiZm9yIiwgIm5vdGhpbmciLCAidGVtcGxhdGVDYWNoZSIsICJXZWFrTWFwIiwgIndhbGtlciIsICJjcmVhdGVUcmVlV2Fsa2VyIiwgInRydXN0RnJvbVRlbXBsYXRlU3RyaW5nIiwgInRzYSIsICJzdHJpbmdGcm9tVFNBIiwgImhhc093blByb3BlcnR5IiwgIkVycm9yIiwgImdldFRlbXBsYXRlSHRtbCIsICJsIiwgImxlbmd0aCIsICJhdHRyTmFtZXMiLCAicmF3VGV4dEVuZFJlZ2V4IiwgInJlZ2V4IiwgImkiLCAiYXR0ck5hbWUiLCAibWF0Y2giLCAiYXR0ck5hbWVFbmRJbmRleCIsICJsYXN0SW5kZXgiLCAiZXhlYyIsICJ0ZXN0IiwgImVuZCIsICJzdGFydHNXaXRoIiwgInB1c2giLCAiVGVtcGxhdGUiLCAiY29uc3RydWN0b3IiLCAib3B0aW9ucyIsICJub2RlIiwgInRoaXMiLCAicGFydHMiLCAibm9kZUluZGV4IiwgImF0dHJOYW1lSW5kZXgiLCAicGFydENvdW50IiwgImVsIiwgImNyZWF0ZUVsZW1lbnQiLCAiY3VycmVudE5vZGUiLCAiY29udGVudCIsICJ3cmFwcGVyIiwgImZpcnN0Q2hpbGQiLCAicmVwbGFjZVdpdGgiLCAiY2hpbGROb2RlcyIsICJuZXh0Tm9kZSIsICJub2RlVHlwZSIsICJoYXNBdHRyaWJ1dGVzIiwgIm5hbWUiLCAiZ2V0QXR0cmlidXRlTmFtZXMiLCAiZW5kc1dpdGgiLCAicmVhbE5hbWUiLCAic3RhdGljcyIsICJnZXRBdHRyaWJ1dGUiLCAic3BsaXQiLCAibSIsICJpbmRleCIsICJjdG9yIiwgIlByb3BlcnR5UGFydCIsICJCb29sZWFuQXR0cmlidXRlUGFydCIsICJFdmVudFBhcnQiLCAiQXR0cmlidXRlUGFydCIsICJyZW1vdmVBdHRyaWJ1dGUiLCAidGFnTmFtZSIsICJ0ZXh0Q29udGVudCIsICJlbXB0eVNjcmlwdCIsICJhcHBlbmQiLCAiZGF0YSIsICJpbmRleE9mIiwgIl9vcHRpb25zIiwgImlubmVySFRNTCIsICJyZXNvbHZlRGlyZWN0aXZlIiwgInBhcnQiLCAicGFyZW50IiwgImF0dHJpYnV0ZUluZGV4IiwgImN1cnJlbnREaXJlY3RpdmUiLCAiX19kaXJlY3RpdmVzIiwgIl9fZGlyZWN0aXZlIiwgIm5leHREaXJlY3RpdmVDb25zdHJ1Y3RvciIsICJfJGluaXRpYWxpemUiLCAiXyRyZXNvbHZlIiwgIlRlbXBsYXRlSW5zdGFuY2UiLCAidGVtcGxhdGUiLCAiXyRwYXJ0cyIsICJfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4iLCAiXyR0ZW1wbGF0ZSIsICJfJHBhcmVudCIsICJwYXJlbnROb2RlIiwgIl8kaXNDb25uZWN0ZWQiLCAiZnJhZ21lbnQiLCAiY3JlYXRpb25TY29wZSIsICJpbXBvcnROb2RlIiwgInBhcnRJbmRleCIsICJ0ZW1wbGF0ZVBhcnQiLCAiQ2hpbGRQYXJ0IiwgIm5leHRTaWJsaW5nIiwgIkVsZW1lbnRQYXJ0IiwgIl8kc2V0VmFsdWUiLCAiX19pc0Nvbm5lY3RlZCIsICJzdGFydE5vZGUiLCAiZW5kTm9kZSIsICJfJGNvbW1pdHRlZFZhbHVlIiwgIl8kc3RhcnROb2RlIiwgIl8kZW5kTm9kZSIsICJpc0Nvbm5lY3RlZCIsICJkaXJlY3RpdmVQYXJlbnQiLCAiXyRjbGVhciIsICJfY29tbWl0VGV4dCIsICJfY29tbWl0VGVtcGxhdGVSZXN1bHQiLCAiX2NvbW1pdE5vZGUiLCAiX2NvbW1pdEl0ZXJhYmxlIiwgImluc2VydEJlZm9yZSIsICJfaW5zZXJ0IiwgImNyZWF0ZVRleHROb2RlIiwgInJlc3VsdCIsICJfJGdldFRlbXBsYXRlIiwgImgiLCAiX3VwZGF0ZSIsICJpbnN0YW5jZSIsICJfY2xvbmUiLCAiZ2V0IiwgInNldCIsICJpdGVtUGFydHMiLCAiaXRlbVBhcnQiLCAiaXRlbSIsICJzdGFydCIsICJmcm9tIiwgIl8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQiLCAibiIsICJyZW1vdmUiLCAiZWxlbWVudCIsICJmaWxsIiwgIlN0cmluZyIsICJ2YWx1ZUluZGV4IiwgIm5vQ29tbWl0IiwgImNoYW5nZSIsICJ2IiwgIl9jb21taXRWYWx1ZSIsICJzZXRBdHRyaWJ1dGUiLCAidG9nZ2xlQXR0cmlidXRlIiwgInN1cGVyIiwgIm5ld0xpc3RlbmVyIiwgIm9sZExpc3RlbmVyIiwgInNob3VsZFJlbW92ZUxpc3RlbmVyIiwgImNhcHR1cmUiLCAib25jZSIsICJwYXNzaXZlIiwgInNob3VsZEFkZExpc3RlbmVyIiwgInJlbW92ZUV2ZW50TGlzdGVuZXIiLCAiYWRkRXZlbnRMaXN0ZW5lciIsICJldmVudCIsICJjYWxsIiwgImhvc3QiLCAiaGFuZGxlRXZlbnQiLCAicG9seWZpbGxTdXBwb3J0IiwgImdsb2JhbCIsICJsaXRIdG1sUG9seWZpbGxTdXBwb3J0IiwgIlRlbXBsYXRlIiwgIkNoaWxkUGFydCIsICJsaXRIdG1sVmVyc2lvbnMiLCAicHVzaCIsICJyZW5kZXIiLCAidmFsdWUiLCAiY29udGFpbmVyIiwgIm9wdGlvbnMiLCAicGFydE93bmVyTm9kZSIsICJyZW5kZXJCZWZvcmUiLCAicGFydCIsICJlbmROb2RlIiwgImluc2VydEJlZm9yZSIsICJjcmVhdGVNYXJrZXIiLCAiXyRzZXRWYWx1ZSIsICJleHBsYW5NYWluIiwgInVuZG8iLCAiaSIsICJqIiwgImUiLCAiaSIsICJlIiwgImkiLCAiaiIsICJlIiwgInYiLCAiaSIsICJqIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgInVuZG8iLCAiZSIsICJnIiwgImYiLCAiZSIsICJfIiwgImUiLCAiYSIsICJiIiwgImkiLCAiZSIsICJnIiwgIl8iLCAiaSIsICJlIiwgIm9rIiwgInQiLCAiZSIsICJnIiwgImkiLCAiYyIsICJwcmVjaXNpb24iLCAieCIsICJzIiwgIngiLCAicyIsICJwcmVjaXNpb24iLCAicyIsICJzIiwgImEiLCAiYiIsICJjIiwgInAiLCAicCIsICJlIiwgImMiLCAiaSIsICJyIiwgImUiLCAibiIsICJpIiwgInQiLCAiYSIsICJiIiwgImEiLCAiYiIsICJlIiwgIngiLCAiaSIsICJlIiwgImZ1enp5c29ydCIsICJ2IiwgInRlbXBsYXRlIiwgInYiLCAieCIsICJ5IiwgImUiLCAiZSIsICJlIiwgIngiLCAiZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXgiLCAiYSIsICJiIiwgImkiLCAibiIsICJlIiwgImNvcm5lcnMiLCAicm93IiwgInJuZEludCIsICJuIiwgImkiLCAiZXJyb3IiLCAicHJlY2lzaW9uIiwgImUiLCAiaSIsICJqIiwgInAiXQp9Cg==
