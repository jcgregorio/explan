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
  function ChartValidate(c2) {
    const ret = validateChart(c2);
    if (!ret.ok) {
      return ret;
    }
    if (c2.Vertices[0].duration !== 0) {
      return error(
        `Start Milestone must have duration of 0, instead got ${c2.Vertices[0].duration}`
      );
    }
    if (c2.Vertices[c2.Vertices.length - 1].duration !== 0) {
      return error(
        `Finish Milestone must have duration of 0, instead got ${c2.Vertices[c2.Vertices.length - 1].duration}`
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
  var defaultTaskDuration = (t2) => {
    return t2.duration;
  };
  function ComputeSlack(c2, taskDuration = defaultTaskDuration, round) {
    const slacks = new Array(c2.Vertices.length);
    for (let i2 = 0; i2 < c2.Vertices.length; i2++) {
      slacks[i2] = new Slack();
    }
    const r2 = ChartValidate(c2);
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
      slack.early.finish = round(
        slack.early.start + taskDuration(task, vertexIndex)
      );
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
        slack.late.start = round(
          slack.late.finish - taskDuration(task, vertexIndex)
        );
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

  // src/style/theme/theme.ts
  var colorThemePrototype = {
    surface: "",
    onSurface: "",
    onSurfaceMuted: "",
    onSurfaceSecondary: "",
    overlay: "",
    groupColor: "",
    highlight: ""
  };
  var colorThemeFromElement = (ele) => {
    const style = getComputedStyle(ele);
    const ret = Object.assign({}, colorThemePrototype);
    Object.keys(ret).forEach((name) => {
      ret[name] = style.getPropertyValue(`--${name}`);
    });
    return ret;
  };

  // src/simulation/simulation.ts
  var MAX_RANDOM = 1e3;
  var precision = new Precision(2);
  var rndInt = (n2) => {
    return Math.floor(Math.random() * n2);
  };
  var simulation = (plan, numSimulationLoops) => {
    const allCriticalPaths = /* @__PURE__ */ new Map();
    for (let i2 = 0; i2 < numSimulationLoops; i2++) {
      const durations = plan.chart.Vertices.map((t2) => {
        const rawDuration = new Jacobian(
          t2.duration,
          t2.getResource("Uncertainty")
        ).sample(rndInt(MAX_RANDOM) / MAX_RANDOM);
        return precision.round(rawDuration);
      });
      const slacksRet = ComputeSlack(
        plan.chart,
        (t2, taskIndex) => durations[taskIndex],
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
          tasks: criticalPath,
          durations
        };
        allCriticalPaths.set(criticalPathAsString, pathEntry);
      }
      pathEntry.count++;
    }
    return allCriticalPaths;
  };
  var criticalTaskFrequencies = (allCriticalPaths, plan) => {
    const critialTasks = /* @__PURE__ */ new Map();
    allCriticalPaths.forEach((value) => {
      value.tasks.forEach((taskIndex) => {
        let taskEntry = critialTasks.get(taskIndex);
        if (taskEntry === void 0) {
          taskEntry = {
            taskIndex,
            duration: plan.chart.Vertices[taskIndex].duration,
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
  var criticalPathsTemplate = (allCriticalPaths, explanMain2) => x`
  <ul>
    ${Array.from(allCriticalPaths.entries()).map(
    ([key, value]) => x`<li
          @click=${() => explanMain2.onPotentialCriticialPathClick(key, allCriticalPaths)}
        >
          ${value.count} : ${key}
        </li>`
  )}
  </ul>
`;
  var criticalTaskFrequenciesTemplate = (plan, criticalTasksDurationDescending) => x`<tr>
      <th>Name</th>
      <th>Duration</th>
      <th>Frequency (%)</th>
    </tr>
    ${criticalTasksDurationDescending.map(
    (taskEntry) => x`<tr>
          <td>${plan.chart.Vertices[taskEntry.taskIndex].name}</td>
          <td>${taskEntry.duration}</td>
          <td>
            ${Math.floor(
      100 * taskEntry.numTimesAppeared / NUM_SIMULATION_LOOPS
    )}
          </td>
        </tr>`
  )} `;
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
    /** Callback to call when a mouse moves over the chart. */
    updateHighlightFromMousePos = null;
    connectedCallback() {
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
      this.plan = generateStarterPlan();
      this.planDefinitionHasBeenChanged();
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
      this.updateTaskPanels(this.selectedTask);
      const fileUpload = document.querySelector("#file-upload");
      fileUpload.addEventListener("change", async () => {
        const json = await fileUpload.files[0].text();
        const ret = FromJSON(json);
        if (!ret.ok) {
          throw ret.error;
        }
        this.plan = ret.value;
        this.planDefinitionHasBeenChanged();
        this.paintChart();
      });
      this.querySelector("#simulate").addEventListener("click", () => {
        this.simulate();
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
        this.paintChart();
      });
      this.paintChart();
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
    async deleteTask(taskIndex) {
      const op = DeleteTaskOp(taskIndex);
      return await executeOp(op, "paintChart", true, this);
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
      this.groupByOptions = ["", ...Object.keys(this.plan.resourceDefinitions)];
      this.groupByOptionsIndex = 0;
      this.recalculateSpansAndCriticalPath();
    }
    recalculateSpansAndCriticalPath() {
      let slacks = [];
      const slackResult = ComputeSlack(
        this.plan.chart,
        void 0,
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
        filterFunc = (task, taskIndex) => {
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
    onPotentialCriticialPathClick(key, allCriticalPaths) {
      const criticalPathEntry = allCriticalPaths.get(key);
      criticalPathEntry.durations.forEach(
        (duration, taskIndex) => {
          this.plan.chart.Vertices[taskIndex].duration = duration;
        }
      );
      this.recalculateSpansAndCriticalPath();
      this.paintChart();
    }
    simulate() {
      const allCriticalPaths = simulation(this.plan, NUM_SIMULATION_LOOPS);
      B(
        criticalPathsTemplate(allCriticalPaths, this),
        document.querySelector("#criticalPaths")
      );
      const criticalTasksDurationDescending = criticalTaskFrequencies(
        allCriticalPaths,
        this.plan
      );
      B(
        criticalTaskFrequenciesTemplate(
          this.plan,
          criticalTasksDurationDescending
        ),
        document.querySelector("#criticalTasks")
      );
      this.recalculateSpansAndCriticalPath();
      this.criticalPath = criticalTasksDurationDescending.map(
        (taskEntry) => taskEntry.taskIndex
      );
      this.paintChart();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2Z1enp5c29ydC9mdXp6eXNvcnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL3NyYy9saXQtaHRtbC50cyIsICIuLi9zcmMvcmVzdWx0LnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9uLnRzIiwgIi4uL3NyYy9kYWcvZGFnLnRzIiwgIi4uL3NyYy9vcHMvb3BzLnRzIiwgIi4uL3NyYy9vcHMvbWV0cmljcy50cyIsICIuLi9zcmMvb3BzL2NoYXJ0LnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9hZGRQcmVkZWNlc3Nvci50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvYWRkU3VjY2Vzc29yLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9nb3RvU2VhcmNoLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9oZWxwLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9yZXNldFpvb20udHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3Rhc2tzLnRzIiwgIi4uL3NyYy9zdHlsZS90b2dnbGVyL3RvZ2dsZXIudHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3RvZ2dsZURhcmtNb2RlLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy90b2dnbGVSYWRhci50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvdW5kby50cyIsICIuLi9zcmMvYWN0aW9uL3JlZ2lzdHJ5LnRzIiwgIi4uL3NyYy9hY3Rpb24vZXhlY3V0ZS50cyIsICIuLi9zcmMva2V5bWFwL2tleW1hcC50cyIsICIuLi9zcmMvaGVscC9oZWxwLnRzIiwgIi4uL3NyYy9kYWcvYWxnb3JpdGhtcy9kZnMudHMiLCAiLi4vc3JjL2RhZy9hbGdvcml0aG1zL2NpcmN1bGFyLnRzIiwgIi4uL3NyYy9hZGQtZGVwZW5kZW5jeS1kaWFsb2cvYWRkLWRlcGVuZGVuY3ktZGlhbG9nLnRzIiwgIi4uL3NyYy9kYWcvYWxnb3JpdGhtcy90b3Bvc29ydC50cyIsICIuLi9zcmMvY2hhcnQvY2hhcnQudHMiLCAiLi4vc3JjL3ByZWNpc2lvbi9wcmVjaXNpb24udHMiLCAiLi4vc3JjL21ldHJpY3MvcmFuZ2UudHMiLCAiLi4vc3JjL21ldHJpY3MvbWV0cmljcy50cyIsICIuLi9zcmMvcmVzb3VyY2VzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvc3RhdHMvY2RmL3RyaWFuZ3VsYXIvdHJpYW5ndWxhci50cyIsICIuLi9zcmMvc3RhdHMvY2RmL3RyaWFuZ3VsYXIvamFjb2JpYW4udHMiLCAiLi4vc3JjL3BsYW4vcGxhbi50cyIsICIuLi9zcmMvc2VsZWN0ZWQtdGFzay1wYW5lbC9zZWxlY3RlZC10YXNrLXBhbmVsLnRzIiwgIi4uL3NyYy9zZWFyY2gvc2VhcmNoLXRhc2stcGFuZWwudHMiLCAiLi4vc3JjL3NlYXJjaC90YXNrLXNlYXJjaC1jb250cm9scy50cyIsICIuLi9zcmMvZGVwZW5kZW5jaWVzL2RlcGVuZGVuY2llcy1wYW5lbC50cyIsICIuLi9zcmMvb3BzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvcmVuZGVyZXIvc2NhbGUvcG9pbnQudHMiLCAiLi4vc3JjL3JlbmRlcmVyL2RpdmlkZXJtb3ZlL2RpdmlkZXJtb3ZlLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9tb3VzZWRyYWcvbW91c2VkcmFnLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9tb3VzZW1vdmUvbW91c2Vtb3ZlLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9yYW5nZS9yYW5nZS50cyIsICIuLi9zcmMvY2hhcnQvZmlsdGVyL2ZpbHRlci50cyIsICIuLi9zcmMvcmVuZGVyZXIva2Qva2QudHMiLCAiLi4vc3JjL3JlbmRlcmVyL3NjYWxlL3NjYWxlLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9yZW5kZXJlci50cyIsICIuLi9zcmMvc2xhY2svc2xhY2sudHMiLCAiLi4vc3JjL3N0eWxlL3RoZW1lL3RoZW1lLnRzIiwgIi4uL3NyYy9zaW11bGF0aW9uL3NpbXVsYXRpb24udHMiLCAiLi4vc3JjL2dlbmVyYXRlL2dlbmVyYXRlLnRzIiwgIi4uL3NyYy9yZXBvcnQtZXJyb3IvcmVwb3J0LWVycm9yLnRzIiwgIi4uL3NyYy9leHBsYW5NYWluL2V4cGxhbk1haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYXJ6aGVyL2Z1enp5c29ydCB2My4wLjJcclxuXHJcbi8vIFVNRCAoVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uKSBmb3IgZnV6enlzb3J0XHJcbjsoKHJvb3QsIFVNRCkgPT4ge1xyXG4gIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKFtdLCBVTUQpXHJcbiAgZWxzZSBpZih0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBVTUQoKVxyXG4gIGVsc2Ugcm9vdFsnZnV6enlzb3J0J10gPSBVTUQoKVxyXG59KSh0aGlzLCBfID0+IHtcclxuICAndXNlIHN0cmljdCdcclxuXHJcbiAgdmFyIHNpbmdsZSA9IChzZWFyY2gsIHRhcmdldCkgPT4ge1xyXG4gICAgaWYoIXNlYXJjaCB8fCAhdGFyZ2V0KSByZXR1cm4gTlVMTFxyXG5cclxuICAgIHZhciBwcmVwYXJlZFNlYXJjaCA9IGdldFByZXBhcmVkU2VhcmNoKHNlYXJjaClcclxuICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuXHJcbiAgICB2YXIgc2VhcmNoQml0ZmxhZ3MgPSBwcmVwYXJlZFNlYXJjaC5iaXRmbGFnc1xyXG4gICAgaWYoKHNlYXJjaEJpdGZsYWdzICYgdGFyZ2V0Ll9iaXRmbGFncykgIT09IHNlYXJjaEJpdGZsYWdzKSByZXR1cm4gTlVMTFxyXG5cclxuICAgIHJldHVybiBhbGdvcml0aG0ocHJlcGFyZWRTZWFyY2gsIHRhcmdldClcclxuICB9XHJcblxyXG4gIHZhciBnbyA9IChzZWFyY2gsIHRhcmdldHMsIG9wdGlvbnMpID0+IHtcclxuICAgIGlmKCFzZWFyY2gpIHJldHVybiBvcHRpb25zPy5hbGwgPyBhbGwodGFyZ2V0cywgb3B0aW9ucykgOiBub1Jlc3VsdHNcclxuXHJcbiAgICB2YXIgcHJlcGFyZWRTZWFyY2ggPSBnZXRQcmVwYXJlZFNlYXJjaChzZWFyY2gpXHJcbiAgICB2YXIgc2VhcmNoQml0ZmxhZ3MgPSBwcmVwYXJlZFNlYXJjaC5iaXRmbGFnc1xyXG4gICAgdmFyIGNvbnRhaW5zU3BhY2UgID0gcHJlcGFyZWRTZWFyY2guY29udGFpbnNTcGFjZVxyXG5cclxuICAgIHZhciB0aHJlc2hvbGQgPSBkZW5vcm1hbGl6ZVNjb3JlKCBvcHRpb25zPy50aHJlc2hvbGQgfHwgMCApXHJcbiAgICB2YXIgbGltaXQgICAgID0gb3B0aW9ucz8ubGltaXQgfHwgSU5GSU5JVFlcclxuXHJcbiAgICB2YXIgcmVzdWx0c0xlbiA9IDA7IHZhciBsaW1pdGVkQ291bnQgPSAwXHJcbiAgICB2YXIgdGFyZ2V0c0xlbiA9IHRhcmdldHMubGVuZ3RoXHJcblxyXG4gICAgZnVuY3Rpb24gcHVzaF9yZXN1bHQocmVzdWx0KSB7XHJcbiAgICAgIGlmKHJlc3VsdHNMZW4gPCBsaW1pdCkgeyBxLmFkZChyZXN1bHQpOyArK3Jlc3VsdHNMZW4gfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICArK2xpbWl0ZWRDb3VudFxyXG4gICAgICAgIGlmKHJlc3VsdC5fc2NvcmUgPiBxLnBlZWsoKS5fc2NvcmUpIHEucmVwbGFjZVRvcChyZXN1bHQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGlzIGNvZGUgaXMgY29weS9wYXN0ZWQgMyB0aW1lcyBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucyBbb3B0aW9ucy5rZXksIG9wdGlvbnMua2V5cywgbm8ga2V5c11cclxuXHJcbiAgICAvLyBvcHRpb25zLmtleVxyXG4gICAgaWYob3B0aW9ucz8ua2V5KSB7XHJcbiAgICAgIHZhciBrZXkgPSBvcHRpb25zLmtleVxyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0c0xlbjsgKytpKSB7IHZhciBvYmogPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwga2V5KVxyXG4gICAgICAgIGlmKCF0YXJnZXQpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG5cclxuICAgICAgICBpZigoc2VhcmNoQml0ZmxhZ3MgJiB0YXJnZXQuX2JpdGZsYWdzKSAhPT0gc2VhcmNoQml0ZmxhZ3MpIGNvbnRpbnVlXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0KVxyXG4gICAgICAgIGlmKHJlc3VsdCA9PT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBpZihyZXN1bHQuX3Njb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZVxyXG5cclxuICAgICAgICByZXN1bHQub2JqID0gb2JqXHJcbiAgICAgICAgcHVzaF9yZXN1bHQocmVzdWx0KVxyXG4gICAgICB9XHJcblxyXG4gICAgLy8gb3B0aW9ucy5rZXlzXHJcbiAgICB9IGVsc2UgaWYob3B0aW9ucz8ua2V5cykge1xyXG4gICAgICB2YXIga2V5cyA9IG9wdGlvbnMua2V5c1xyXG4gICAgICB2YXIga2V5c0xlbiA9IGtleXMubGVuZ3RoXHJcblxyXG4gICAgICBvdXRlcjogZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldHNMZW47ICsraSkgeyB2YXIgb2JqID0gdGFyZ2V0c1tpXVxyXG5cclxuICAgICAgICB7IC8vIGVhcmx5IG91dCBiYXNlZCBvbiBiaXRmbGFnc1xyXG4gICAgICAgICAgdmFyIGtleXNCaXRmbGFncyA9IDBcclxuICAgICAgICAgIGZvciAodmFyIGtleUkgPSAwOyBrZXlJIDwga2V5c0xlbjsgKytrZXlJKSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSBrZXlzW2tleUldXHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIGtleSlcclxuICAgICAgICAgICAgaWYoIXRhcmdldCkgeyB0bXBUYXJnZXRzW2tleUldID0gbm9UYXJnZXQ7IGNvbnRpbnVlIH1cclxuICAgICAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG4gICAgICAgICAgICB0bXBUYXJnZXRzW2tleUldID0gdGFyZ2V0XHJcblxyXG4gICAgICAgICAgICBrZXlzQml0ZmxhZ3MgfD0gdGFyZ2V0Ll9iaXRmbGFnc1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmKChzZWFyY2hCaXRmbGFncyAmIGtleXNCaXRmbGFncykgIT09IHNlYXJjaEJpdGZsYWdzKSBjb250aW51ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoY29udGFpbnNTcGFjZSkgZm9yKGxldCBpPTA7IGk8cHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlcy5sZW5ndGg7IGkrKykga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPSBORUdBVElWRV9JTkZJTklUWVxyXG5cclxuICAgICAgICBmb3IgKHZhciBrZXlJID0gMDsga2V5SSA8IGtleXNMZW47ICsra2V5SSkge1xyXG4gICAgICAgICAgdGFyZ2V0ID0gdG1wVGFyZ2V0c1trZXlJXVxyXG4gICAgICAgICAgaWYodGFyZ2V0ID09PSBub1RhcmdldCkgeyB0bXBSZXN1bHRzW2tleUldID0gbm9UYXJnZXQ7IGNvbnRpbnVlIH1cclxuXHJcbiAgICAgICAgICB0bXBSZXN1bHRzW2tleUldID0gYWxnb3JpdGhtKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQsIC8qYWxsb3dTcGFjZXM9Ki9mYWxzZSwgLyphbGxvd1BhcnRpYWxNYXRjaD0qL2NvbnRhaW5zU3BhY2UpXHJcbiAgICAgICAgICBpZih0bXBSZXN1bHRzW2tleUldID09PSBOVUxMKSB7IHRtcFJlc3VsdHNba2V5SV0gPSBub1RhcmdldDsgY29udGludWUgfVxyXG5cclxuICAgICAgICAgIC8vIHRvZG86IHRoaXMgc2VlbXMgd2VpcmQgYW5kIHdyb25nLiBsaWtlIHdoYXQgaWYgb3VyIGZpcnN0IG1hdGNoIHdhc24ndCBnb29kLiB0aGlzIHNob3VsZCBqdXN0IHJlcGxhY2UgaXQgaW5zdGVhZCBvZiBhdmVyYWdpbmcgd2l0aCBpdFxyXG4gICAgICAgICAgLy8gaWYgb3VyIHNlY29uZCBtYXRjaCBpc24ndCBnb29kIHdlIGlnbm9yZSBpdCBpbnN0ZWFkIG9mIGF2ZXJhZ2luZyB3aXRoIGl0XHJcbiAgICAgICAgICBpZihjb250YWluc1NwYWNlKSBmb3IobGV0IGk9MDsgaTxwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmKGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldID4gLTEwMDApIHtcclxuICAgICAgICAgICAgICBpZihrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA+IE5FR0FUSVZFX0lORklOSVRZKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG1wID0gKGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldICsgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0pIC8gNC8qYm9udXMgc2NvcmUgZm9yIGhhdmluZyBtdWx0aXBsZSBtYXRjaGVzKi9cclxuICAgICAgICAgICAgICAgIGlmKHRtcCA+IGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldKSBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA9IHRtcFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA+IGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldKSBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA9IGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihjb250YWluc1NwYWNlKSB7XHJcbiAgICAgICAgICBmb3IobGV0IGk9MDsgaTxwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzLmxlbmd0aDsgaSsrKSB7IGlmKGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldID09PSBORUdBVElWRV9JTkZJTklUWSkgY29udGludWUgb3V0ZXIgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgaGFzQXRMZWFzdDFNYXRjaCA9IGZhbHNlXHJcbiAgICAgICAgICBmb3IobGV0IGk9MDsgaSA8IGtleXNMZW47IGkrKykgeyBpZih0bXBSZXN1bHRzW2ldLl9zY29yZSAhPT0gTkVHQVRJVkVfSU5GSU5JVFkpIHsgaGFzQXRMZWFzdDFNYXRjaCA9IHRydWU7IGJyZWFrIH0gfVxyXG4gICAgICAgICAgaWYoIWhhc0F0TGVhc3QxTWF0Y2gpIGNvbnRpbnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgb2JqUmVzdWx0cyA9IG5ldyBLZXlzUmVzdWx0KGtleXNMZW4pXHJcbiAgICAgICAgZm9yKGxldCBpPTA7IGkgPCBrZXlzTGVuOyBpKyspIHsgb2JqUmVzdWx0c1tpXSA9IHRtcFJlc3VsdHNbaV0gfVxyXG5cclxuICAgICAgICBpZihjb250YWluc1NwYWNlKSB7XHJcbiAgICAgICAgICB2YXIgc2NvcmUgPSAwXHJcbiAgICAgICAgICBmb3IobGV0IGk9MDsgaTxwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzLmxlbmd0aDsgaSsrKSBzY29yZSArPSBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyB0b2RvIGNvdWxkIHJld3JpdGUgdGhpcyBzY29yaW5nIHRvIGJlIG1vcmUgc2ltaWxhciB0byB3aGVuIHRoZXJlJ3Mgc3BhY2VzXHJcbiAgICAgICAgICAvLyBpZiB3ZSBtYXRjaCBtdWx0aXBsZSBrZXlzIGdpdmUgdXMgYm9udXMgcG9pbnRzXHJcbiAgICAgICAgICB2YXIgc2NvcmUgPSBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgICAgICAgZm9yKGxldCBpPTA7IGk8a2V5c0xlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBvYmpSZXN1bHRzW2ldXHJcbiAgICAgICAgICAgIGlmKHJlc3VsdC5fc2NvcmUgPiAtMTAwMCkge1xyXG4gICAgICAgICAgICAgIGlmKHNjb3JlID4gTkVHQVRJVkVfSU5GSU5JVFkpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0bXAgPSAoc2NvcmUgKyByZXN1bHQuX3Njb3JlKSAvIDQvKmJvbnVzIHNjb3JlIGZvciBoYXZpbmcgbXVsdGlwbGUgbWF0Y2hlcyovXHJcbiAgICAgICAgICAgICAgICBpZih0bXAgPiBzY29yZSkgc2NvcmUgPSB0bXBcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYocmVzdWx0Ll9zY29yZSA+IHNjb3JlKSBzY29yZSA9IHJlc3VsdC5fc2NvcmVcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG9ialJlc3VsdHMub2JqID0gb2JqXHJcbiAgICAgICAgb2JqUmVzdWx0cy5fc2NvcmUgPSBzY29yZVxyXG4gICAgICAgIGlmKG9wdGlvbnM/LnNjb3JlRm4pIHtcclxuICAgICAgICAgIHNjb3JlID0gb3B0aW9ucy5zY29yZUZuKG9ialJlc3VsdHMpXHJcbiAgICAgICAgICBpZighc2NvcmUpIGNvbnRpbnVlXHJcbiAgICAgICAgICBzY29yZSA9IGRlbm9ybWFsaXplU2NvcmUoc2NvcmUpXHJcbiAgICAgICAgICBvYmpSZXN1bHRzLl9zY29yZSA9IHNjb3JlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihzY29yZSA8IHRocmVzaG9sZCkgY29udGludWVcclxuICAgICAgICBwdXNoX3Jlc3VsdChvYmpSZXN1bHRzKVxyXG4gICAgICB9XHJcblxyXG4gICAgLy8gbm8ga2V5c1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldHNMZW47ICsraSkgeyB2YXIgdGFyZ2V0ID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIGlmKCF0YXJnZXQpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG5cclxuICAgICAgICBpZigoc2VhcmNoQml0ZmxhZ3MgJiB0YXJnZXQuX2JpdGZsYWdzKSAhPT0gc2VhcmNoQml0ZmxhZ3MpIGNvbnRpbnVlXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0KVxyXG4gICAgICAgIGlmKHJlc3VsdCA9PT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBpZihyZXN1bHQuX3Njb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZVxyXG5cclxuICAgICAgICBwdXNoX3Jlc3VsdChyZXN1bHQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZihyZXN1bHRzTGVuID09PSAwKSByZXR1cm4gbm9SZXN1bHRzXHJcbiAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShyZXN1bHRzTGVuKVxyXG4gICAgZm9yKHZhciBpID0gcmVzdWx0c0xlbiAtIDE7IGkgPj0gMDsgLS1pKSByZXN1bHRzW2ldID0gcS5wb2xsKClcclxuICAgIHJlc3VsdHMudG90YWwgPSByZXN1bHRzTGVuICsgbGltaXRlZENvdW50XHJcbiAgICByZXR1cm4gcmVzdWx0c1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIHRoaXMgaXMgd3JpdHRlbiBhcyAxIGZ1bmN0aW9uIGluc3RlYWQgb2YgMiBmb3IgbWluaWZpY2F0aW9uLiBwZXJmIHNlZW1zIGZpbmUgLi4uXHJcbiAgLy8gZXhjZXB0IHdoZW4gbWluaWZpZWQuIHRoZSBwZXJmIGlzIHZlcnkgc2xvd1xyXG4gIHZhciBoaWdobGlnaHQgPSAocmVzdWx0LCBvcGVuPSc8Yj4nLCBjbG9zZT0nPC9iPicpID0+IHtcclxuICAgIHZhciBjYWxsYmFjayA9IHR5cGVvZiBvcGVuID09PSAnZnVuY3Rpb24nID8gb3BlbiA6IHVuZGVmaW5lZFxyXG5cclxuICAgIHZhciB0YXJnZXQgICAgICA9IHJlc3VsdC50YXJnZXRcclxuICAgIHZhciB0YXJnZXRMZW4gICA9IHRhcmdldC5sZW5ndGhcclxuICAgIHZhciBpbmRleGVzICAgICA9IHJlc3VsdC5pbmRleGVzXHJcbiAgICB2YXIgaGlnaGxpZ2h0ZWQgPSAnJ1xyXG4gICAgdmFyIG1hdGNoSSAgICAgID0gMFxyXG4gICAgdmFyIGluZGV4ZXNJICAgID0gMFxyXG4gICAgdmFyIG9wZW5lZCAgICAgID0gZmFsc2VcclxuICAgIHZhciBwYXJ0cyAgICAgICA9IFtdXHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldExlbjsgKytpKSB7IHZhciBjaGFyID0gdGFyZ2V0W2ldXHJcbiAgICAgIGlmKGluZGV4ZXNbaW5kZXhlc0ldID09PSBpKSB7XHJcbiAgICAgICAgKytpbmRleGVzSVxyXG4gICAgICAgIGlmKCFvcGVuZWQpIHsgb3BlbmVkID0gdHJ1ZVxyXG4gICAgICAgICAgaWYoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgcGFydHMucHVzaChoaWdobGlnaHRlZCk7IGhpZ2hsaWdodGVkID0gJydcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IG9wZW5cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGluZGV4ZXNJID09PSBpbmRleGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgaWYoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgKz0gY2hhclxyXG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGNhbGxiYWNrKGhpZ2hsaWdodGVkLCBtYXRjaEkrKykpOyBoaWdobGlnaHRlZCA9ICcnXHJcbiAgICAgICAgICAgIHBhcnRzLnB1c2godGFyZ2V0LnN1YnN0cihpKzEpKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgKz0gY2hhciArIGNsb3NlICsgdGFyZ2V0LnN1YnN0cihpKzEpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZihvcGVuZWQpIHsgb3BlbmVkID0gZmFsc2VcclxuICAgICAgICAgIGlmKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHBhcnRzLnB1c2goY2FsbGJhY2soaGlnaGxpZ2h0ZWQsIG1hdGNoSSsrKSk7IGhpZ2hsaWdodGVkID0gJydcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IGNsb3NlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGhpZ2hsaWdodGVkICs9IGNoYXJcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY2FsbGJhY2sgPyBwYXJ0cyA6IGhpZ2hsaWdodGVkXHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIHByZXBhcmUgPSAodGFyZ2V0KSA9PiB7XHJcbiAgICBpZih0eXBlb2YgdGFyZ2V0ID09PSAnbnVtYmVyJykgdGFyZ2V0ID0gJycrdGFyZ2V0XHJcbiAgICBlbHNlIGlmKHR5cGVvZiB0YXJnZXQgIT09ICdzdHJpbmcnKSB0YXJnZXQgPSAnJ1xyXG4gICAgdmFyIGluZm8gPSBwcmVwYXJlTG93ZXJJbmZvKHRhcmdldClcclxuICAgIHJldHVybiBuZXdfcmVzdWx0KHRhcmdldCwge190YXJnZXRMb3dlcjppbmZvLl9sb3dlciwgX3RhcmdldExvd2VyQ29kZXM6aW5mby5sb3dlckNvZGVzLCBfYml0ZmxhZ3M6aW5mby5iaXRmbGFnc30pXHJcbiAgfVxyXG5cclxuICB2YXIgY2xlYW51cCA9ICgpID0+IHsgcHJlcGFyZWRDYWNoZS5jbGVhcigpOyBwcmVwYXJlZFNlYXJjaENhY2hlLmNsZWFyKCkgfVxyXG5cclxuXHJcbiAgLy8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcclxuICAvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxyXG4gIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcbiAgLy8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcclxuXHJcblxyXG4gIGNsYXNzIFJlc3VsdCB7XHJcbiAgICBnZXQgWydpbmRleGVzJ10oKSB7IHJldHVybiB0aGlzLl9pbmRleGVzLnNsaWNlKDAsIHRoaXMuX2luZGV4ZXMubGVuKS5zb3J0KChhLGIpPT5hLWIpIH1cclxuICAgIHNldCBbJ2luZGV4ZXMnXShpbmRleGVzKSB7IHJldHVybiB0aGlzLl9pbmRleGVzID0gaW5kZXhlcyB9XHJcbiAgICBbJ2hpZ2hsaWdodCddKG9wZW4sIGNsb3NlKSB7IHJldHVybiBoaWdobGlnaHQodGhpcywgb3BlbiwgY2xvc2UpIH1cclxuICAgIGdldCBbJ3Njb3JlJ10oKSB7IHJldHVybiBub3JtYWxpemVTY29yZSh0aGlzLl9zY29yZSkgfVxyXG4gICAgc2V0IFsnc2NvcmUnXShzY29yZSkgeyB0aGlzLl9zY29yZSA9IGRlbm9ybWFsaXplU2NvcmUoc2NvcmUpIH1cclxuICB9XHJcblxyXG4gIGNsYXNzIEtleXNSZXN1bHQgZXh0ZW5kcyBBcnJheSB7XHJcbiAgICBnZXQgWydzY29yZSddKCkgeyByZXR1cm4gbm9ybWFsaXplU2NvcmUodGhpcy5fc2NvcmUpIH1cclxuICAgIHNldCBbJ3Njb3JlJ10oc2NvcmUpIHsgdGhpcy5fc2NvcmUgPSBkZW5vcm1hbGl6ZVNjb3JlKHNjb3JlKSB9XHJcbiAgfVxyXG5cclxuICB2YXIgbmV3X3Jlc3VsdCA9ICh0YXJnZXQsIG9wdGlvbnMpID0+IHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBSZXN1bHQoKVxyXG4gICAgcmVzdWx0Wyd0YXJnZXQnXSAgICAgICAgICAgICA9IHRhcmdldFxyXG4gICAgcmVzdWx0WydvYmonXSAgICAgICAgICAgICAgICA9IG9wdGlvbnMub2JqICAgICAgICAgICAgICAgICAgID8/IE5VTExcclxuICAgIHJlc3VsdC5fc2NvcmUgICAgICAgICAgICAgICAgPSBvcHRpb25zLl9zY29yZSAgICAgICAgICAgICAgICA/PyBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgcmVzdWx0Ll9pbmRleGVzICAgICAgICAgICAgICA9IG9wdGlvbnMuX2luZGV4ZXMgICAgICAgICAgICAgID8/IFtdXHJcbiAgICByZXN1bHQuX3RhcmdldExvd2VyICAgICAgICAgID0gb3B0aW9ucy5fdGFyZ2V0TG93ZXIgICAgICAgICAgPz8gJydcclxuICAgIHJlc3VsdC5fdGFyZ2V0TG93ZXJDb2RlcyAgICAgPSBvcHRpb25zLl90YXJnZXRMb3dlckNvZGVzICAgICA/PyBOVUxMXHJcbiAgICByZXN1bHQuX25leHRCZWdpbm5pbmdJbmRleGVzID0gb3B0aW9ucy5fbmV4dEJlZ2lubmluZ0luZGV4ZXMgPz8gTlVMTFxyXG4gICAgcmVzdWx0Ll9iaXRmbGFncyAgICAgICAgICAgICA9IG9wdGlvbnMuX2JpdGZsYWdzICAgICAgICAgICAgID8/IDBcclxuICAgIHJldHVybiByZXN1bHRcclxuICB9XHJcblxyXG5cclxuICB2YXIgbm9ybWFsaXplU2NvcmUgPSBzY29yZSA9PiB7XHJcbiAgICBpZihzY29yZSA9PT0gTkVHQVRJVkVfSU5GSU5JVFkpIHJldHVybiAwXHJcbiAgICBpZihzY29yZSA+IDEpIHJldHVybiBzY29yZVxyXG4gICAgcmV0dXJuIE1hdGguRSAqKiAoICgoLXNjb3JlICsgMSkqKi4wNDMwNyAtIDEpICogLTIpXHJcbiAgfVxyXG4gIHZhciBkZW5vcm1hbGl6ZVNjb3JlID0gbm9ybWFsaXplZFNjb3JlID0+IHtcclxuICAgIGlmKG5vcm1hbGl6ZWRTY29yZSA9PT0gMCkgcmV0dXJuIE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICBpZihub3JtYWxpemVkU2NvcmUgPiAxKSByZXR1cm4gbm9ybWFsaXplZFNjb3JlXHJcbiAgICByZXR1cm4gMSAtIE1hdGgucG93KChNYXRoLmxvZyhub3JtYWxpemVkU2NvcmUpIC8gLTIgKyAxKSwgMSAvIDAuMDQzMDcpXHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIHByZXBhcmVTZWFyY2ggPSAoc2VhcmNoKSA9PiB7XHJcbiAgICBpZih0eXBlb2Ygc2VhcmNoID09PSAnbnVtYmVyJykgc2VhcmNoID0gJycrc2VhcmNoXHJcbiAgICBlbHNlIGlmKHR5cGVvZiBzZWFyY2ggIT09ICdzdHJpbmcnKSBzZWFyY2ggPSAnJ1xyXG4gICAgc2VhcmNoID0gc2VhcmNoLnRyaW0oKVxyXG4gICAgdmFyIGluZm8gPSBwcmVwYXJlTG93ZXJJbmZvKHNlYXJjaClcclxuXHJcbiAgICB2YXIgc3BhY2VTZWFyY2hlcyA9IFtdXHJcbiAgICBpZihpbmZvLmNvbnRhaW5zU3BhY2UpIHtcclxuICAgICAgdmFyIHNlYXJjaGVzID0gc2VhcmNoLnNwbGl0KC9cXHMrLylcclxuICAgICAgc2VhcmNoZXMgPSBbLi4ubmV3IFNldChzZWFyY2hlcyldIC8vIGRpc3RpbmN0XHJcbiAgICAgIGZvcih2YXIgaT0wOyBpPHNlYXJjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYoc2VhcmNoZXNbaV0gPT09ICcnKSBjb250aW51ZVxyXG4gICAgICAgIHZhciBfaW5mbyA9IHByZXBhcmVMb3dlckluZm8oc2VhcmNoZXNbaV0pXHJcbiAgICAgICAgc3BhY2VTZWFyY2hlcy5wdXNoKHtsb3dlckNvZGVzOl9pbmZvLmxvd2VyQ29kZXMsIF9sb3dlcjpzZWFyY2hlc1tpXS50b0xvd2VyQ2FzZSgpLCBjb250YWluc1NwYWNlOmZhbHNlfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7bG93ZXJDb2RlczogaW5mby5sb3dlckNvZGVzLCBfbG93ZXI6IGluZm8uX2xvd2VyLCBjb250YWluc1NwYWNlOiBpbmZvLmNvbnRhaW5zU3BhY2UsIGJpdGZsYWdzOiBpbmZvLmJpdGZsYWdzLCBzcGFjZVNlYXJjaGVzOiBzcGFjZVNlYXJjaGVzfVxyXG4gIH1cclxuXHJcblxyXG5cclxuICB2YXIgZ2V0UHJlcGFyZWQgPSAodGFyZ2V0KSA9PiB7XHJcbiAgICBpZih0YXJnZXQubGVuZ3RoID4gOTk5KSByZXR1cm4gcHJlcGFyZSh0YXJnZXQpIC8vIGRvbid0IGNhY2hlIGh1Z2UgdGFyZ2V0c1xyXG4gICAgdmFyIHRhcmdldFByZXBhcmVkID0gcHJlcGFyZWRDYWNoZS5nZXQodGFyZ2V0KVxyXG4gICAgaWYodGFyZ2V0UHJlcGFyZWQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRhcmdldFByZXBhcmVkXHJcbiAgICB0YXJnZXRQcmVwYXJlZCA9IHByZXBhcmUodGFyZ2V0KVxyXG4gICAgcHJlcGFyZWRDYWNoZS5zZXQodGFyZ2V0LCB0YXJnZXRQcmVwYXJlZClcclxuICAgIHJldHVybiB0YXJnZXRQcmVwYXJlZFxyXG4gIH1cclxuICB2YXIgZ2V0UHJlcGFyZWRTZWFyY2ggPSAoc2VhcmNoKSA9PiB7XHJcbiAgICBpZihzZWFyY2gubGVuZ3RoID4gOTk5KSByZXR1cm4gcHJlcGFyZVNlYXJjaChzZWFyY2gpIC8vIGRvbid0IGNhY2hlIGh1Z2Ugc2VhcmNoZXNcclxuICAgIHZhciBzZWFyY2hQcmVwYXJlZCA9IHByZXBhcmVkU2VhcmNoQ2FjaGUuZ2V0KHNlYXJjaClcclxuICAgIGlmKHNlYXJjaFByZXBhcmVkICE9PSB1bmRlZmluZWQpIHJldHVybiBzZWFyY2hQcmVwYXJlZFxyXG4gICAgc2VhcmNoUHJlcGFyZWQgPSBwcmVwYXJlU2VhcmNoKHNlYXJjaClcclxuICAgIHByZXBhcmVkU2VhcmNoQ2FjaGUuc2V0KHNlYXJjaCwgc2VhcmNoUHJlcGFyZWQpXHJcbiAgICByZXR1cm4gc2VhcmNoUHJlcGFyZWRcclxuICB9XHJcblxyXG5cclxuICB2YXIgYWxsID0gKHRhcmdldHMsIG9wdGlvbnMpID0+IHtcclxuICAgIHZhciByZXN1bHRzID0gW107IHJlc3VsdHMudG90YWwgPSB0YXJnZXRzLmxlbmd0aCAvLyB0aGlzIHRvdGFsIGNhbiBiZSB3cm9uZyBpZiBzb21lIHRhcmdldHMgYXJlIHNraXBwZWRcclxuXHJcbiAgICB2YXIgbGltaXQgPSBvcHRpb25zPy5saW1pdCB8fCBJTkZJTklUWVxyXG5cclxuICAgIGlmKG9wdGlvbnM/LmtleSkge1xyXG4gICAgICBmb3IodmFyIGk9MDtpPHRhcmdldHMubGVuZ3RoO2krKykgeyB2YXIgb2JqID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIG9wdGlvbnMua2V5KVxyXG4gICAgICAgIGlmKHRhcmdldCA9PSBOVUxMKSBjb250aW51ZVxyXG4gICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3X3Jlc3VsdCh0YXJnZXQudGFyZ2V0LCB7X3Njb3JlOiB0YXJnZXQuX3Njb3JlLCBvYmo6IG9ian0pXHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7IGlmKHJlc3VsdHMubGVuZ3RoID49IGxpbWl0KSByZXR1cm4gcmVzdWx0c1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYob3B0aW9ucz8ua2V5cykge1xyXG4gICAgICBmb3IodmFyIGk9MDtpPHRhcmdldHMubGVuZ3RoO2krKykgeyB2YXIgb2JqID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIHZhciBvYmpSZXN1bHRzID0gbmV3IEtleXNSZXN1bHQob3B0aW9ucy5rZXlzLmxlbmd0aClcclxuICAgICAgICBmb3IgKHZhciBrZXlJID0gb3B0aW9ucy5rZXlzLmxlbmd0aCAtIDE7IGtleUkgPj0gMDsgLS1rZXlJKSB7XHJcbiAgICAgICAgICB2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBvcHRpb25zLmtleXNba2V5SV0pXHJcbiAgICAgICAgICBpZighdGFyZ2V0KSB7IG9ialJlc3VsdHNba2V5SV0gPSBub1RhcmdldDsgY29udGludWUgfVxyXG4gICAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG4gICAgICAgICAgdGFyZ2V0Ll9zY29yZSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgICAgICB0YXJnZXQuX2luZGV4ZXMubGVuID0gMFxyXG4gICAgICAgICAgb2JqUmVzdWx0c1trZXlJXSA9IHRhcmdldFxyXG4gICAgICAgIH1cclxuICAgICAgICBvYmpSZXN1bHRzLm9iaiA9IG9ialxyXG4gICAgICAgIG9ialJlc3VsdHMuX3Njb3JlID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgICByZXN1bHRzLnB1c2gob2JqUmVzdWx0cyk7IGlmKHJlc3VsdHMubGVuZ3RoID49IGxpbWl0KSByZXR1cm4gcmVzdWx0c1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IodmFyIGk9MDtpPHRhcmdldHMubGVuZ3RoO2krKykgeyB2YXIgdGFyZ2V0ID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIGlmKHRhcmdldCA9PSBOVUxMKSBjb250aW51ZVxyXG4gICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuICAgICAgICB0YXJnZXQuX3Njb3JlID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgICB0YXJnZXQuX2luZGV4ZXMubGVuID0gMFxyXG4gICAgICAgIHJlc3VsdHMucHVzaCh0YXJnZXQpOyBpZihyZXN1bHRzLmxlbmd0aCA+PSBsaW1pdCkgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHRzXHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIGFsZ29yaXRobSA9IChwcmVwYXJlZFNlYXJjaCwgcHJlcGFyZWQsIGFsbG93U3BhY2VzPWZhbHNlLCBhbGxvd1BhcnRpYWxNYXRjaD1mYWxzZSkgPT4ge1xyXG4gICAgaWYoYWxsb3dTcGFjZXM9PT1mYWxzZSAmJiBwcmVwYXJlZFNlYXJjaC5jb250YWluc1NwYWNlKSByZXR1cm4gYWxnb3JpdGhtU3BhY2VzKHByZXBhcmVkU2VhcmNoLCBwcmVwYXJlZCwgYWxsb3dQYXJ0aWFsTWF0Y2gpXHJcblxyXG4gICAgdmFyIHNlYXJjaExvd2VyICAgICAgPSBwcmVwYXJlZFNlYXJjaC5fbG93ZXJcclxuICAgIHZhciBzZWFyY2hMb3dlckNvZGVzID0gcHJlcGFyZWRTZWFyY2gubG93ZXJDb2Rlc1xyXG4gICAgdmFyIHNlYXJjaExvd2VyQ29kZSAgPSBzZWFyY2hMb3dlckNvZGVzWzBdXHJcbiAgICB2YXIgdGFyZ2V0TG93ZXJDb2RlcyA9IHByZXBhcmVkLl90YXJnZXRMb3dlckNvZGVzXHJcbiAgICB2YXIgc2VhcmNoTGVuICAgICAgICA9IHNlYXJjaExvd2VyQ29kZXMubGVuZ3RoXHJcbiAgICB2YXIgdGFyZ2V0TGVuICAgICAgICA9IHRhcmdldExvd2VyQ29kZXMubGVuZ3RoXHJcbiAgICB2YXIgc2VhcmNoSSAgICAgICAgICA9IDAgLy8gd2hlcmUgd2UgYXRcclxuICAgIHZhciB0YXJnZXRJICAgICAgICAgID0gMCAvLyB3aGVyZSB5b3UgYXRcclxuICAgIHZhciBtYXRjaGVzU2ltcGxlTGVuID0gMFxyXG5cclxuICAgIC8vIHZlcnkgYmFzaWMgZnV6enkgbWF0Y2g7IHRvIHJlbW92ZSBub24tbWF0Y2hpbmcgdGFyZ2V0cyBBU0FQIVxyXG4gICAgLy8gd2FsayB0aHJvdWdoIHRhcmdldC4gZmluZCBzZXF1ZW50aWFsIG1hdGNoZXMuXHJcbiAgICAvLyBpZiBhbGwgY2hhcnMgYXJlbid0IGZvdW5kIHRoZW4gZXhpdFxyXG4gICAgZm9yKDs7KSB7XHJcbiAgICAgIHZhciBpc01hdGNoID0gc2VhcmNoTG93ZXJDb2RlID09PSB0YXJnZXRMb3dlckNvZGVzW3RhcmdldEldXHJcbiAgICAgIGlmKGlzTWF0Y2gpIHtcclxuICAgICAgICBtYXRjaGVzU2ltcGxlW21hdGNoZXNTaW1wbGVMZW4rK10gPSB0YXJnZXRJXHJcbiAgICAgICAgKytzZWFyY2hJOyBpZihzZWFyY2hJID09PSBzZWFyY2hMZW4pIGJyZWFrXHJcbiAgICAgICAgc2VhcmNoTG93ZXJDb2RlID0gc2VhcmNoTG93ZXJDb2Rlc1tzZWFyY2hJXVxyXG4gICAgICB9XHJcbiAgICAgICsrdGFyZ2V0STsgaWYodGFyZ2V0SSA+PSB0YXJnZXRMZW4pIHJldHVybiBOVUxMIC8vIEZhaWxlZCB0byBmaW5kIHNlYXJjaElcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VhcmNoSSA9IDBcclxuICAgIHZhciBzdWNjZXNzU3RyaWN0ID0gZmFsc2VcclxuICAgIHZhciBtYXRjaGVzU3RyaWN0TGVuID0gMFxyXG5cclxuICAgIHZhciBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVkLl9uZXh0QmVnaW5uaW5nSW5kZXhlc1xyXG4gICAgaWYobmV4dEJlZ2lubmluZ0luZGV4ZXMgPT09IE5VTEwpIG5leHRCZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZWQuX25leHRCZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZU5leHRCZWdpbm5pbmdJbmRleGVzKHByZXBhcmVkLnRhcmdldClcclxuICAgIHRhcmdldEkgPSBtYXRjaGVzU2ltcGxlWzBdPT09MCA/IDAgOiBuZXh0QmVnaW5uaW5nSW5kZXhlc1ttYXRjaGVzU2ltcGxlWzBdLTFdXHJcblxyXG4gICAgLy8gT3VyIHRhcmdldCBzdHJpbmcgc3VjY2Vzc2Z1bGx5IG1hdGNoZWQgYWxsIGNoYXJhY3RlcnMgaW4gc2VxdWVuY2UhXHJcbiAgICAvLyBMZXQncyB0cnkgYSBtb3JlIGFkdmFuY2VkIGFuZCBzdHJpY3QgdGVzdCB0byBpbXByb3ZlIHRoZSBzY29yZVxyXG4gICAgLy8gb25seSBjb3VudCBpdCBhcyBhIG1hdGNoIGlmIGl0J3MgY29uc2VjdXRpdmUgb3IgYSBiZWdpbm5pbmcgY2hhcmFjdGVyIVxyXG4gICAgdmFyIGJhY2t0cmFja0NvdW50ID0gMFxyXG4gICAgaWYodGFyZ2V0SSAhPT0gdGFyZ2V0TGVuKSBmb3IoOzspIHtcclxuICAgICAgaWYodGFyZ2V0SSA+PSB0YXJnZXRMZW4pIHtcclxuICAgICAgICAvLyBXZSBmYWlsZWQgdG8gZmluZCBhIGdvb2Qgc3BvdCBmb3IgdGhpcyBzZWFyY2ggY2hhciwgZ28gYmFjayB0byB0aGUgcHJldmlvdXMgc2VhcmNoIGNoYXIgYW5kIGZvcmNlIGl0IGZvcndhcmRcclxuICAgICAgICBpZihzZWFyY2hJIDw9IDApIGJyZWFrIC8vIFdlIGZhaWxlZCB0byBwdXNoIGNoYXJzIGZvcndhcmQgZm9yIGEgYmV0dGVyIG1hdGNoXHJcblxyXG4gICAgICAgICsrYmFja3RyYWNrQ291bnQ7IGlmKGJhY2t0cmFja0NvdW50ID4gMjAwKSBicmVhayAvLyBleHBvbmVudGlhbCBiYWNrdHJhY2tpbmcgaXMgdGFraW5nIHRvbyBsb25nLCBqdXN0IGdpdmUgdXAgYW5kIHJldHVybiBhIGJhZCBtYXRjaFxyXG5cclxuICAgICAgICAtLXNlYXJjaElcclxuICAgICAgICB2YXIgbGFzdE1hdGNoID0gbWF0Y2hlc1N0cmljdFstLW1hdGNoZXNTdHJpY3RMZW5dXHJcbiAgICAgICAgdGFyZ2V0SSA9IG5leHRCZWdpbm5pbmdJbmRleGVzW2xhc3RNYXRjaF1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGlzTWF0Y2ggPSBzZWFyY2hMb3dlckNvZGVzW3NlYXJjaEldID09PSB0YXJnZXRMb3dlckNvZGVzW3RhcmdldEldXHJcbiAgICAgICAgaWYoaXNNYXRjaCkge1xyXG4gICAgICAgICAgbWF0Y2hlc1N0cmljdFttYXRjaGVzU3RyaWN0TGVuKytdID0gdGFyZ2V0SVxyXG4gICAgICAgICAgKytzZWFyY2hJOyBpZihzZWFyY2hJID09PSBzZWFyY2hMZW4pIHsgc3VjY2Vzc1N0cmljdCA9IHRydWU7IGJyZWFrIH1cclxuICAgICAgICAgICsrdGFyZ2V0SVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0YXJnZXRJID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNbdGFyZ2V0SV1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayBpZiBpdCdzIGEgc3Vic3RyaW5nIG1hdGNoXHJcbiAgICB2YXIgc3Vic3RyaW5nSW5kZXggPSBzZWFyY2hMZW4gPD0gMSA/IC0xIDogcHJlcGFyZWQuX3RhcmdldExvd2VyLmluZGV4T2Yoc2VhcmNoTG93ZXIsIG1hdGNoZXNTaW1wbGVbMF0pIC8vIHBlcmY6IHRoaXMgaXMgc2xvd1xyXG4gICAgdmFyIGlzU3Vic3RyaW5nID0gISF+c3Vic3RyaW5nSW5kZXhcclxuICAgIHZhciBpc1N1YnN0cmluZ0JlZ2lubmluZyA9ICFpc1N1YnN0cmluZyA/IGZhbHNlIDogc3Vic3RyaW5nSW5kZXg9PT0wIHx8IHByZXBhcmVkLl9uZXh0QmVnaW5uaW5nSW5kZXhlc1tzdWJzdHJpbmdJbmRleC0xXSA9PT0gc3Vic3RyaW5nSW5kZXhcclxuXHJcbiAgICAvLyBpZiBpdCdzIGEgc3Vic3RyaW5nIG1hdGNoIGJ1dCBub3QgYXQgYSBiZWdpbm5pbmcgaW5kZXgsIGxldCdzIHRyeSB0byBmaW5kIGEgc3Vic3RyaW5nIHN0YXJ0aW5nIGF0IGEgYmVnaW5uaW5nIGluZGV4IGZvciBhIGJldHRlciBzY29yZVxyXG4gICAgaWYoaXNTdWJzdHJpbmcgJiYgIWlzU3Vic3RyaW5nQmVnaW5uaW5nKSB7XHJcbiAgICAgIGZvcih2YXIgaT0wOyBpPG5leHRCZWdpbm5pbmdJbmRleGVzLmxlbmd0aDsgaT1uZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSkge1xyXG4gICAgICAgIGlmKGkgPD0gc3Vic3RyaW5nSW5kZXgpIGNvbnRpbnVlXHJcblxyXG4gICAgICAgIGZvcih2YXIgcz0wOyBzPHNlYXJjaExlbjsgcysrKSBpZihzZWFyY2hMb3dlckNvZGVzW3NdICE9PSBwcmVwYXJlZC5fdGFyZ2V0TG93ZXJDb2Rlc1tpK3NdKSBicmVha1xyXG4gICAgICAgIGlmKHMgPT09IHNlYXJjaExlbikgeyBzdWJzdHJpbmdJbmRleCA9IGk7IGlzU3Vic3RyaW5nQmVnaW5uaW5nID0gdHJ1ZTsgYnJlYWsgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGFsbHkgdXAgdGhlIHNjb3JlICYga2VlcCB0cmFjayBvZiBtYXRjaGVzIGZvciBoaWdobGlnaHRpbmcgbGF0ZXJcclxuICAgIC8vIGlmIGl0J3MgYSBzaW1wbGUgbWF0Y2gsIHdlJ2xsIHN3aXRjaCB0byBhIHN1YnN0cmluZyBtYXRjaCBpZiBhIHN1YnN0cmluZyBleGlzdHNcclxuICAgIC8vIGlmIGl0J3MgYSBzdHJpY3QgbWF0Y2gsIHdlJ2xsIHN3aXRjaCB0byBhIHN1YnN0cmluZyBtYXRjaCBvbmx5IGlmIHRoYXQncyBhIGJldHRlciBzY29yZVxyXG5cclxuICAgIHZhciBjYWxjdWxhdGVTY29yZSA9IG1hdGNoZXMgPT4ge1xyXG4gICAgICB2YXIgc2NvcmUgPSAwXHJcblxyXG4gICAgICB2YXIgZXh0cmFNYXRjaEdyb3VwQ291bnQgPSAwXHJcbiAgICAgIGZvcih2YXIgaSA9IDE7IGkgPCBzZWFyY2hMZW47ICsraSkge1xyXG4gICAgICAgIGlmKG1hdGNoZXNbaV0gLSBtYXRjaGVzW2ktMV0gIT09IDEpIHtzY29yZSAtPSBtYXRjaGVzW2ldOyArK2V4dHJhTWF0Y2hHcm91cENvdW50fVxyXG4gICAgICB9XHJcbiAgICAgIHZhciB1bm1hdGNoZWREaXN0YW5jZSA9IG1hdGNoZXNbc2VhcmNoTGVuLTFdIC0gbWF0Y2hlc1swXSAtIChzZWFyY2hMZW4tMSlcclxuXHJcbiAgICAgIHNjb3JlIC09ICgxMit1bm1hdGNoZWREaXN0YW5jZSkgKiBleHRyYU1hdGNoR3JvdXBDb3VudCAvLyBwZW5hbGl0eSBmb3IgbW9yZSBncm91cHNcclxuXHJcbiAgICAgIGlmKG1hdGNoZXNbMF0gIT09IDApIHNjb3JlIC09IG1hdGNoZXNbMF0qbWF0Y2hlc1swXSouMiAvLyBwZW5hbGl0eSBmb3Igbm90IHN0YXJ0aW5nIG5lYXIgdGhlIGJlZ2lubmluZ1xyXG5cclxuICAgICAgaWYoIXN1Y2Nlc3NTdHJpY3QpIHtcclxuICAgICAgICBzY29yZSAqPSAxMDAwXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gc3VjY2Vzc1N0cmljdCBvbiBhIHRhcmdldCB3aXRoIHRvbyBtYW55IGJlZ2lubmluZyBpbmRleGVzIGxvc2VzIHBvaW50cyBmb3IgYmVpbmcgYSBiYWQgdGFyZ2V0XHJcbiAgICAgICAgdmFyIHVuaXF1ZUJlZ2lubmluZ0luZGV4ZXMgPSAxXHJcbiAgICAgICAgZm9yKHZhciBpID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNbMF07IGkgPCB0YXJnZXRMZW47IGk9bmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0pICsrdW5pcXVlQmVnaW5uaW5nSW5kZXhlc1xyXG5cclxuICAgICAgICBpZih1bmlxdWVCZWdpbm5pbmdJbmRleGVzID4gMjQpIHNjb3JlICo9ICh1bmlxdWVCZWdpbm5pbmdJbmRleGVzLTI0KSoxMCAvLyBxdWl0ZSBhcmJpdHJhcnkgbnVtYmVycyBoZXJlIC4uLlxyXG4gICAgICB9XHJcblxyXG4gICAgICBzY29yZSAtPSAodGFyZ2V0TGVuIC0gc2VhcmNoTGVuKS8yIC8vIHBlbmFsaXR5IGZvciBsb25nZXIgdGFyZ2V0c1xyXG5cclxuICAgICAgaWYoaXNTdWJzdHJpbmcpICAgICAgICAgIHNjb3JlIC89IDErc2VhcmNoTGVuKnNlYXJjaExlbioxIC8vIGJvbnVzIGZvciBiZWluZyBhIGZ1bGwgc3Vic3RyaW5nXHJcbiAgICAgIGlmKGlzU3Vic3RyaW5nQmVnaW5uaW5nKSBzY29yZSAvPSAxK3NlYXJjaExlbipzZWFyY2hMZW4qMSAvLyBib251cyBmb3Igc3Vic3RyaW5nIHN0YXJ0aW5nIG9uIGEgYmVnaW5uaW5nSW5kZXhcclxuXHJcbiAgICAgIHNjb3JlIC09ICh0YXJnZXRMZW4gLSBzZWFyY2hMZW4pLzIgLy8gcGVuYWxpdHkgZm9yIGxvbmdlciB0YXJnZXRzXHJcblxyXG4gICAgICByZXR1cm4gc2NvcmVcclxuICAgIH1cclxuXHJcbiAgICBpZighc3VjY2Vzc1N0cmljdCkge1xyXG4gICAgICBpZihpc1N1YnN0cmluZykgZm9yKHZhciBpPTA7IGk8c2VhcmNoTGVuOyArK2kpIG1hdGNoZXNTaW1wbGVbaV0gPSBzdWJzdHJpbmdJbmRleCtpIC8vIGF0IHRoaXMgcG9pbnQgaXQncyBzYWZlIHRvIG92ZXJ3cml0ZSBtYXRjaGVoc1NpbXBsZSB3aXRoIHN1YnN0ciBtYXRjaGVzXHJcbiAgICAgIHZhciBtYXRjaGVzQmVzdCA9IG1hdGNoZXNTaW1wbGVcclxuICAgICAgdmFyIHNjb3JlID0gY2FsY3VsYXRlU2NvcmUobWF0Y2hlc0Jlc3QpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZihpc1N1YnN0cmluZ0JlZ2lubmluZykge1xyXG4gICAgICAgIGZvcih2YXIgaT0wOyBpPHNlYXJjaExlbjsgKytpKSBtYXRjaGVzU2ltcGxlW2ldID0gc3Vic3RyaW5nSW5kZXgraSAvLyBhdCB0aGlzIHBvaW50IGl0J3Mgc2FmZSB0byBvdmVyd3JpdGUgbWF0Y2hlaHNTaW1wbGUgd2l0aCBzdWJzdHIgbWF0Y2hlc1xyXG4gICAgICAgIHZhciBtYXRjaGVzQmVzdCA9IG1hdGNoZXNTaW1wbGVcclxuICAgICAgICB2YXIgc2NvcmUgPSBjYWxjdWxhdGVTY29yZShtYXRjaGVzU2ltcGxlKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBtYXRjaGVzQmVzdCA9IG1hdGNoZXNTdHJpY3RcclxuICAgICAgICB2YXIgc2NvcmUgPSBjYWxjdWxhdGVTY29yZShtYXRjaGVzU3RyaWN0KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJlcGFyZWQuX3Njb3JlID0gc2NvcmVcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc2VhcmNoTGVuOyArK2kpIHByZXBhcmVkLl9pbmRleGVzW2ldID0gbWF0Y2hlc0Jlc3RbaV1cclxuICAgIHByZXBhcmVkLl9pbmRleGVzLmxlbiA9IHNlYXJjaExlblxyXG5cclxuICAgIGNvbnN0IHJlc3VsdCAgICA9IG5ldyBSZXN1bHQoKVxyXG4gICAgcmVzdWx0LnRhcmdldCAgID0gcHJlcGFyZWQudGFyZ2V0XHJcbiAgICByZXN1bHQuX3Njb3JlICAgPSBwcmVwYXJlZC5fc2NvcmVcclxuICAgIHJlc3VsdC5faW5kZXhlcyA9IHByZXBhcmVkLl9pbmRleGVzXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbiAgfVxyXG4gIHZhciBhbGdvcml0aG1TcGFjZXMgPSAocHJlcGFyZWRTZWFyY2gsIHRhcmdldCwgYWxsb3dQYXJ0aWFsTWF0Y2gpID0+IHtcclxuICAgIHZhciBzZWVuX2luZGV4ZXMgPSBuZXcgU2V0KClcclxuICAgIHZhciBzY29yZSA9IDBcclxuICAgIHZhciByZXN1bHQgPSBOVUxMXHJcblxyXG4gICAgdmFyIGZpcnN0X3NlZW5faW5kZXhfbGFzdF9zZWFyY2ggPSAwXHJcbiAgICB2YXIgc2VhcmNoZXMgPSBwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzXHJcbiAgICB2YXIgc2VhcmNoZXNMZW4gPSBzZWFyY2hlcy5sZW5ndGhcclxuICAgIHZhciBjaGFuZ2VzbGVuID0gMFxyXG5cclxuICAgIC8vIFJldHVybiBfbmV4dEJlZ2lubmluZ0luZGV4ZXMgYmFjayB0byBpdHMgbm9ybWFsIHN0YXRlXHJcbiAgICB2YXIgcmVzZXROZXh0QmVnaW5uaW5nSW5kZXhlcyA9ICgpID0+IHtcclxuICAgICAgZm9yKGxldCBpPWNoYW5nZXNsZW4tMTsgaT49MDsgaS0tKSB0YXJnZXQuX25leHRCZWdpbm5pbmdJbmRleGVzW25leHRCZWdpbm5pbmdJbmRleGVzQ2hhbmdlc1tpKjIgKyAwXV0gPSBuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXNbaSoyICsgMV1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgaGFzQXRMZWFzdDFNYXRjaCA9IGZhbHNlXHJcbiAgICBmb3IodmFyIGk9MDsgaTxzZWFyY2hlc0xlbjsgKytpKSB7XHJcbiAgICAgIGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgdmFyIHNlYXJjaCA9IHNlYXJjaGVzW2ldXHJcblxyXG4gICAgICByZXN1bHQgPSBhbGdvcml0aG0oc2VhcmNoLCB0YXJnZXQpXHJcbiAgICAgIGlmKGFsbG93UGFydGlhbE1hdGNoKSB7XHJcbiAgICAgICAgaWYocmVzdWx0ID09PSBOVUxMKSBjb250aW51ZVxyXG4gICAgICAgIGhhc0F0TGVhc3QxTWF0Y2ggPSB0cnVlXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYocmVzdWx0ID09PSBOVUxMKSB7cmVzZXROZXh0QmVnaW5uaW5nSW5kZXhlcygpOyByZXR1cm4gTlVMTH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgbm90IHRoZSBsYXN0IHNlYXJjaCwgd2UgbmVlZCB0byBtdXRhdGUgX25leHRCZWdpbm5pbmdJbmRleGVzIGZvciB0aGUgbmV4dCBzZWFyY2hcclxuICAgICAgdmFyIGlzVGhlTGFzdFNlYXJjaCA9IGkgPT09IHNlYXJjaGVzTGVuIC0gMVxyXG4gICAgICBpZighaXNUaGVMYXN0U2VhcmNoKSB7XHJcbiAgICAgICAgdmFyIGluZGV4ZXMgPSByZXN1bHQuX2luZGV4ZXNcclxuXHJcbiAgICAgICAgdmFyIGluZGV4ZXNJc0NvbnNlY3V0aXZlU3Vic3RyaW5nID0gdHJ1ZVxyXG4gICAgICAgIGZvcihsZXQgaT0wOyBpPGluZGV4ZXMubGVuLTE7IGkrKykge1xyXG4gICAgICAgICAgaWYoaW5kZXhlc1tpKzFdIC0gaW5kZXhlc1tpXSAhPT0gMSkge1xyXG4gICAgICAgICAgICBpbmRleGVzSXNDb25zZWN1dGl2ZVN1YnN0cmluZyA9IGZhbHNlOyBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGluZGV4ZXNJc0NvbnNlY3V0aXZlU3Vic3RyaW5nKSB7XHJcbiAgICAgICAgICB2YXIgbmV3QmVnaW5uaW5nSW5kZXggPSBpbmRleGVzW2luZGV4ZXMubGVuLTFdICsgMVxyXG4gICAgICAgICAgdmFyIHRvUmVwbGFjZSA9IHRhcmdldC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNbbmV3QmVnaW5uaW5nSW5kZXgtMV1cclxuICAgICAgICAgIGZvcihsZXQgaT1uZXdCZWdpbm5pbmdJbmRleC0xOyBpPj0wOyBpLS0pIHtcclxuICAgICAgICAgICAgaWYodG9SZXBsYWNlICE9PSB0YXJnZXQuX25leHRCZWdpbm5pbmdJbmRleGVzW2ldKSBicmVha1xyXG4gICAgICAgICAgICB0YXJnZXQuX25leHRCZWdpbm5pbmdJbmRleGVzW2ldID0gbmV3QmVnaW5uaW5nSW5kZXhcclxuICAgICAgICAgICAgbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzW2NoYW5nZXNsZW4qMiArIDBdID0gaVxyXG4gICAgICAgICAgICBuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXNbY2hhbmdlc2xlbioyICsgMV0gPSB0b1JlcGxhY2VcclxuICAgICAgICAgICAgY2hhbmdlc2xlbisrXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBzY29yZSArPSByZXN1bHQuX3Njb3JlIC8gc2VhcmNoZXNMZW5cclxuICAgICAgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0gPSByZXN1bHQuX3Njb3JlIC8gc2VhcmNoZXNMZW5cclxuXHJcbiAgICAgIC8vIGRvY2sgcG9pbnRzIGJhc2VkIG9uIG9yZGVyIG90aGVyd2lzZSBcImMgbWFuXCIgcmV0dXJucyBNYW5pZmVzdC5jcHAgaW5zdGVhZCBvZiBDaGVhdE1hbmFnZXIuaFxyXG4gICAgICBpZihyZXN1bHQuX2luZGV4ZXNbMF0gPCBmaXJzdF9zZWVuX2luZGV4X2xhc3Rfc2VhcmNoKSB7XHJcbiAgICAgICAgc2NvcmUgLT0gKGZpcnN0X3NlZW5faW5kZXhfbGFzdF9zZWFyY2ggLSByZXN1bHQuX2luZGV4ZXNbMF0pICogMlxyXG4gICAgICB9XHJcbiAgICAgIGZpcnN0X3NlZW5faW5kZXhfbGFzdF9zZWFyY2ggPSByZXN1bHQuX2luZGV4ZXNbMF1cclxuXHJcbiAgICAgIGZvcih2YXIgaj0wOyBqPHJlc3VsdC5faW5kZXhlcy5sZW47ICsraikgc2Vlbl9pbmRleGVzLmFkZChyZXN1bHQuX2luZGV4ZXNbal0pXHJcbiAgICB9XHJcblxyXG4gICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2ggJiYgIWhhc0F0TGVhc3QxTWF0Y2gpIHJldHVybiBOVUxMXHJcblxyXG4gICAgcmVzZXROZXh0QmVnaW5uaW5nSW5kZXhlcygpXHJcblxyXG4gICAgLy8gYWxsb3dzIGEgc2VhcmNoIHdpdGggc3BhY2VzIHRoYXQncyBhbiBleGFjdCBzdWJzdHJpbmcgdG8gc2NvcmUgd2VsbFxyXG4gICAgdmFyIGFsbG93U3BhY2VzUmVzdWx0ID0gYWxnb3JpdGhtKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQsIC8qYWxsb3dTcGFjZXM9Ki90cnVlKVxyXG4gICAgaWYoYWxsb3dTcGFjZXNSZXN1bHQgIT09IE5VTEwgJiYgYWxsb3dTcGFjZXNSZXN1bHQuX3Njb3JlID4gc2NvcmUpIHtcclxuICAgICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2gpIHtcclxuICAgICAgICBmb3IodmFyIGk9MDsgaTxzZWFyY2hlc0xlbjsgKytpKSB7XHJcbiAgICAgICAgICBhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA9IGFsbG93U3BhY2VzUmVzdWx0Ll9zY29yZSAvIHNlYXJjaGVzTGVuXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhbGxvd1NwYWNlc1Jlc3VsdFxyXG4gICAgfVxyXG5cclxuICAgIGlmKGFsbG93UGFydGlhbE1hdGNoKSByZXN1bHQgPSB0YXJnZXRcclxuICAgIHJlc3VsdC5fc2NvcmUgPSBzY29yZVxyXG5cclxuICAgIHZhciBpID0gMFxyXG4gICAgZm9yIChsZXQgaW5kZXggb2Ygc2Vlbl9pbmRleGVzKSByZXN1bHQuX2luZGV4ZXNbaSsrXSA9IGluZGV4XHJcbiAgICByZXN1bHQuX2luZGV4ZXMubGVuID0gaVxyXG5cclxuICAgIHJldHVybiByZXN1bHRcclxuICB9XHJcblxyXG4gIC8vIHdlIHVzZSB0aGlzIGluc3RlYWQgb2YganVzdCAubm9ybWFsaXplKCdORkQnKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCAnJykgYmVjYXVzZSB0aGF0IHNjcmV3cyB3aXRoIGphcGFuZXNlIGNoYXJhY3RlcnNcclxuICB2YXIgcmVtb3ZlX2FjY2VudHMgPSAoc3RyKSA9PiBzdHIucmVwbGFjZSgvXFxwe1NjcmlwdD1MYXRpbn0rL2d1LCBtYXRjaCA9PiBtYXRjaC5ub3JtYWxpemUoJ05GRCcpKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCAnJylcclxuXHJcbiAgdmFyIHByZXBhcmVMb3dlckluZm8gPSAoc3RyKSA9PiB7XHJcbiAgICBzdHIgPSByZW1vdmVfYWNjZW50cyhzdHIpXHJcbiAgICB2YXIgc3RyTGVuID0gc3RyLmxlbmd0aFxyXG4gICAgdmFyIGxvd2VyID0gc3RyLnRvTG93ZXJDYXNlKClcclxuICAgIHZhciBsb3dlckNvZGVzID0gW10gLy8gbmV3IEFycmF5KHN0ckxlbikgICAgc3BhcnNlIGFycmF5IGlzIHRvbyBzbG93XHJcbiAgICB2YXIgYml0ZmxhZ3MgPSAwXHJcbiAgICB2YXIgY29udGFpbnNTcGFjZSA9IGZhbHNlIC8vIHNwYWNlIGlzbid0IHN0b3JlZCBpbiBiaXRmbGFncyBiZWNhdXNlIG9mIGhvdyBzZWFyY2hpbmcgd2l0aCBhIHNwYWNlIHdvcmtzXHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHN0ckxlbjsgKytpKSB7XHJcbiAgICAgIHZhciBsb3dlckNvZGUgPSBsb3dlckNvZGVzW2ldID0gbG93ZXIuY2hhckNvZGVBdChpKVxyXG5cclxuICAgICAgaWYobG93ZXJDb2RlID09PSAzMikge1xyXG4gICAgICAgIGNvbnRhaW5zU3BhY2UgPSB0cnVlXHJcbiAgICAgICAgY29udGludWUgLy8gaXQncyBpbXBvcnRhbnQgdGhhdCB3ZSBkb24ndCBzZXQgYW55IGJpdGZsYWdzIGZvciBzcGFjZVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgYml0ID0gbG93ZXJDb2RlPj05NyYmbG93ZXJDb2RlPD0xMjIgPyBsb3dlckNvZGUtOTcgLy8gYWxwaGFiZXRcclxuICAgICAgICAgICAgICA6IGxvd2VyQ29kZT49NDgmJmxvd2VyQ29kZTw9NTcgID8gMjYgICAgICAgICAgIC8vIG51bWJlcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDMgYml0cyBhdmFpbGFibGVcclxuICAgICAgICAgICAgICA6IGxvd2VyQ29kZTw9MTI3ICAgICAgICAgICAgICAgID8gMzAgICAgICAgICAgIC8vIG90aGVyIGFzY2lpXHJcbiAgICAgICAgICAgICAgOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDMxICAgICAgICAgICAvLyBvdGhlciB1dGY4XHJcbiAgICAgIGJpdGZsYWdzIHw9IDE8PGJpdFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7bG93ZXJDb2Rlczpsb3dlckNvZGVzLCBiaXRmbGFnczpiaXRmbGFncywgY29udGFpbnNTcGFjZTpjb250YWluc1NwYWNlLCBfbG93ZXI6bG93ZXJ9XHJcbiAgfVxyXG4gIHZhciBwcmVwYXJlQmVnaW5uaW5nSW5kZXhlcyA9ICh0YXJnZXQpID0+IHtcclxuICAgIHZhciB0YXJnZXRMZW4gPSB0YXJnZXQubGVuZ3RoXHJcbiAgICB2YXIgYmVnaW5uaW5nSW5kZXhlcyA9IFtdOyB2YXIgYmVnaW5uaW5nSW5kZXhlc0xlbiA9IDBcclxuICAgIHZhciB3YXNVcHBlciA9IGZhbHNlXHJcbiAgICB2YXIgd2FzQWxwaGFudW0gPSBmYWxzZVxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldExlbjsgKytpKSB7XHJcbiAgICAgIHZhciB0YXJnZXRDb2RlID0gdGFyZ2V0LmNoYXJDb2RlQXQoaSlcclxuICAgICAgdmFyIGlzVXBwZXIgPSB0YXJnZXRDb2RlPj02NSYmdGFyZ2V0Q29kZTw9OTBcclxuICAgICAgdmFyIGlzQWxwaGFudW0gPSBpc1VwcGVyIHx8IHRhcmdldENvZGU+PTk3JiZ0YXJnZXRDb2RlPD0xMjIgfHwgdGFyZ2V0Q29kZT49NDgmJnRhcmdldENvZGU8PTU3XHJcbiAgICAgIHZhciBpc0JlZ2lubmluZyA9IGlzVXBwZXIgJiYgIXdhc1VwcGVyIHx8ICF3YXNBbHBoYW51bSB8fCAhaXNBbHBoYW51bVxyXG4gICAgICB3YXNVcHBlciA9IGlzVXBwZXJcclxuICAgICAgd2FzQWxwaGFudW0gPSBpc0FscGhhbnVtXHJcbiAgICAgIGlmKGlzQmVnaW5uaW5nKSBiZWdpbm5pbmdJbmRleGVzW2JlZ2lubmluZ0luZGV4ZXNMZW4rK10gPSBpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gYmVnaW5uaW5nSW5kZXhlc1xyXG4gIH1cclxuICB2YXIgcHJlcGFyZU5leHRCZWdpbm5pbmdJbmRleGVzID0gKHRhcmdldCkgPT4ge1xyXG4gICAgdGFyZ2V0ID0gcmVtb3ZlX2FjY2VudHModGFyZ2V0KVxyXG4gICAgdmFyIHRhcmdldExlbiA9IHRhcmdldC5sZW5ndGhcclxuICAgIHZhciBiZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZUJlZ2lubmluZ0luZGV4ZXModGFyZ2V0KVxyXG4gICAgdmFyIG5leHRCZWdpbm5pbmdJbmRleGVzID0gW10gLy8gbmV3IEFycmF5KHRhcmdldExlbikgICAgIHNwYXJzZSBhcnJheSBpcyB0b28gc2xvd1xyXG4gICAgdmFyIGxhc3RJc0JlZ2lubmluZyA9IGJlZ2lubmluZ0luZGV4ZXNbMF1cclxuICAgIHZhciBsYXN0SXNCZWdpbm5pbmdJID0gMFxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldExlbjsgKytpKSB7XHJcbiAgICAgIGlmKGxhc3RJc0JlZ2lubmluZyA+IGkpIHtcclxuICAgICAgICBuZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSA9IGxhc3RJc0JlZ2lubmluZ1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxhc3RJc0JlZ2lubmluZyA9IGJlZ2lubmluZ0luZGV4ZXNbKytsYXN0SXNCZWdpbm5pbmdJXVxyXG4gICAgICAgIG5leHRCZWdpbm5pbmdJbmRleGVzW2ldID0gbGFzdElzQmVnaW5uaW5nPT09dW5kZWZpbmVkID8gdGFyZ2V0TGVuIDogbGFzdElzQmVnaW5uaW5nXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBuZXh0QmVnaW5uaW5nSW5kZXhlc1xyXG4gIH1cclxuXHJcbiAgdmFyIHByZXBhcmVkQ2FjaGUgICAgICAgPSBuZXcgTWFwKClcclxuICB2YXIgcHJlcGFyZWRTZWFyY2hDYWNoZSA9IG5ldyBNYXAoKVxyXG5cclxuICAvLyB0aGUgdGhlb3J5IGJlaGluZCB0aGVzZSBiZWluZyBnbG9iYWxzIGlzIHRvIHJlZHVjZSBnYXJiYWdlIGNvbGxlY3Rpb24gYnkgbm90IG1ha2luZyBuZXcgYXJyYXlzXHJcbiAgdmFyIG1hdGNoZXNTaW1wbGUgPSBbXTsgdmFyIG1hdGNoZXNTdHJpY3QgPSBbXVxyXG4gIHZhciBuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXMgPSBbXSAvLyBhbGxvd3Mgc3RyYXcgYmVycnkgdG8gbWF0Y2ggc3RyYXdiZXJyeSB3ZWxsLCBieSBtb2RpZnlpbmcgdGhlIGVuZCBvZiBhIHN1YnN0cmluZyB0byBiZSBjb25zaWRlcmVkIGEgYmVnaW5uaW5nIGluZGV4IGZvciB0aGUgcmVzdCBvZiB0aGUgc2VhcmNoXHJcbiAgdmFyIGtleXNTcGFjZXNCZXN0U2NvcmVzID0gW107IHZhciBhbGxvd1BhcnRpYWxNYXRjaFNjb3JlcyA9IFtdXHJcbiAgdmFyIHRtcFRhcmdldHMgPSBbXTsgdmFyIHRtcFJlc3VsdHMgPSBbXVxyXG5cclxuICAvLyBwcm9wID0gJ2tleScgICAgICAgICAgICAgICAgICAyLjVtcyBvcHRpbWl6ZWQgZm9yIHRoaXMgY2FzZSwgc2VlbXMgdG8gYmUgYWJvdXQgYXMgZmFzdCBhcyBkaXJlY3Qgb2JqW3Byb3BdXHJcbiAgLy8gcHJvcCA9ICdrZXkxLmtleTInICAgICAgICAgICAgMTBtc1xyXG4gIC8vIHByb3AgPSBbJ2tleTEnLCAna2V5MiddICAgICAgIDI3bXNcclxuICAvLyBwcm9wID0gb2JqID0+IG9iai50YWdzLmpvaW4oKSA/P21zXHJcbiAgdmFyIGdldFZhbHVlID0gKG9iaiwgcHJvcCkgPT4ge1xyXG4gICAgdmFyIHRtcCA9IG9ialtwcm9wXTsgaWYodG1wICE9PSB1bmRlZmluZWQpIHJldHVybiB0bXBcclxuICAgIGlmKHR5cGVvZiBwcm9wID09PSAnZnVuY3Rpb24nKSByZXR1cm4gcHJvcChvYmopIC8vIHRoaXMgc2hvdWxkIHJ1biBmaXJzdC4gYnV0IHRoYXQgbWFrZXMgc3RyaW5nIHByb3BzIHNsb3dlclxyXG4gICAgdmFyIHNlZ3MgPSBwcm9wXHJcbiAgICBpZighQXJyYXkuaXNBcnJheShwcm9wKSkgc2VncyA9IHByb3Auc3BsaXQoJy4nKVxyXG4gICAgdmFyIGxlbiA9IHNlZ3MubGVuZ3RoXHJcbiAgICB2YXIgaSA9IC0xXHJcbiAgICB3aGlsZSAob2JqICYmICgrK2kgPCBsZW4pKSBvYmogPSBvYmpbc2Vnc1tpXV1cclxuICAgIHJldHVybiBvYmpcclxuICB9XHJcblxyXG4gIHZhciBpc1ByZXBhcmVkID0gKHgpID0+IHsgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgeC5fYml0ZmxhZ3MgPT09ICdudW1iZXInIH1cclxuICB2YXIgSU5GSU5JVFkgPSBJbmZpbml0eTsgdmFyIE5FR0FUSVZFX0lORklOSVRZID0gLUlORklOSVRZXHJcbiAgdmFyIG5vUmVzdWx0cyA9IFtdOyBub1Jlc3VsdHMudG90YWwgPSAwXHJcbiAgdmFyIE5VTEwgPSBudWxsXHJcblxyXG4gIHZhciBub1RhcmdldCA9IHByZXBhcmUoJycpXHJcblxyXG4gIC8vIEhhY2tlZCB2ZXJzaW9uIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9sZW1pcmUvRmFzdFByaW9yaXR5UXVldWUuanNcclxuICB2YXIgZmFzdHByaW9yaXR5cXVldWU9cj0+e3ZhciBlPVtdLG89MCxhPXt9LHY9cj0+e2Zvcih2YXIgYT0wLHY9ZVthXSxjPTE7YzxvOyl7dmFyIHM9YysxO2E9YyxzPG8mJmVbc10uX3Njb3JlPGVbY10uX3Njb3JlJiYoYT1zKSxlW2EtMT4+MV09ZVthXSxjPTErKGE8PDEpfWZvcih2YXIgZj1hLTE+PjE7YT4wJiZ2Ll9zY29yZTxlW2ZdLl9zY29yZTtmPShhPWYpLTE+PjEpZVthXT1lW2ZdO2VbYV09dn07cmV0dXJuIGEuYWRkPShyPT57dmFyIGE9bztlW28rK109cjtmb3IodmFyIHY9YS0xPj4xO2E+MCYmci5fc2NvcmU8ZVt2XS5fc2NvcmU7dj0oYT12KS0xPj4xKWVbYV09ZVt2XTtlW2FdPXJ9KSxhLnBvbGw9KHI9PntpZigwIT09byl7dmFyIGE9ZVswXTtyZXR1cm4gZVswXT1lWy0tb10sdigpLGF9fSksYS5wZWVrPShyPT57aWYoMCE9PW8pcmV0dXJuIGVbMF19KSxhLnJlcGxhY2VUb3A9KHI9PntlWzBdPXIsdigpfSksYX1cclxuICB2YXIgcSA9IGZhc3Rwcmlvcml0eXF1ZXVlKCkgLy8gcmV1c2UgdGhpc1xyXG5cclxuICAvLyBmdXp6eXNvcnQgaXMgd3JpdHRlbiB0aGlzIHdheSBmb3IgbWluaWZpY2F0aW9uLiBhbGwgbmFtZXMgYXJlIG1hbmdlbGVkIHVubGVzcyBxdW90ZWRcclxuICByZXR1cm4geydzaW5nbGUnOnNpbmdsZSwgJ2dvJzpnbywgJ3ByZXBhcmUnOnByZXBhcmUsICdjbGVhbnVwJzpjbGVhbnVwfVxyXG59KSAvLyBVTURcclxuIiwgIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDE3IEdvb2dsZSBMTENcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBCU0QtMy1DbGF1c2VcbiAqL1xuXG4vLyBJTVBPUlRBTlQ6IHRoZXNlIGltcG9ydHMgbXVzdCBiZSB0eXBlLW9ubHlcbmltcG9ydCB0eXBlIHtEaXJlY3RpdmUsIERpcmVjdGl2ZVJlc3VsdCwgUGFydEluZm99IGZyb20gJy4vZGlyZWN0aXZlLmpzJztcbmltcG9ydCB0eXBlIHtUcnVzdGVkSFRNTCwgVHJ1c3RlZFR5cGVzV2luZG93fSBmcm9tICd0cnVzdGVkLXR5cGVzL2xpYic7XG5cbmNvbnN0IERFVl9NT0RFID0gdHJ1ZTtcbmNvbnN0IEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUyA9IHRydWU7XG5jb25zdCBFTkFCTEVfU0hBRFlET01fTk9QQVRDSCA9IHRydWU7XG5jb25zdCBOT0RFX01PREUgPSBmYWxzZTtcblxuLy8gQWxsb3dzIG1pbmlmaWVycyB0byByZW5hbWUgcmVmZXJlbmNlcyB0byBnbG9iYWxUaGlzXG5jb25zdCBnbG9iYWwgPSBnbG9iYWxUaGlzO1xuXG4vKipcbiAqIENvbnRhaW5zIHR5cGVzIHRoYXQgYXJlIHBhcnQgb2YgdGhlIHVuc3RhYmxlIGRlYnVnIEFQSS5cbiAqXG4gKiBFdmVyeXRoaW5nIGluIHRoaXMgQVBJIGlzIG5vdCBzdGFibGUgYW5kIG1heSBjaGFuZ2Ugb3IgYmUgcmVtb3ZlZCBpbiB0aGUgZnV0dXJlLFxuICogZXZlbiBvbiBwYXRjaCByZWxlYXNlcy5cbiAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1uYW1lc3BhY2VcbmV4cG9ydCBuYW1lc3BhY2UgTGl0VW5zdGFibGUge1xuICAvKipcbiAgICogV2hlbiBMaXQgaXMgcnVubmluZyBpbiBkZXYgbW9kZSBhbmQgYHdpbmRvdy5lbWl0TGl0RGVidWdMb2dFdmVudHNgIGlzIHRydWUsXG4gICAqIHdlIHdpbGwgZW1pdCAnbGl0LWRlYnVnJyBldmVudHMgdG8gd2luZG93LCB3aXRoIGxpdmUgZGV0YWlscyBhYm91dCB0aGUgdXBkYXRlIGFuZCByZW5kZXJcbiAgICogbGlmZWN5Y2xlLiBUaGVzZSBjYW4gYmUgdXNlZnVsIGZvciB3cml0aW5nIGRlYnVnIHRvb2xpbmcgYW5kIHZpc3VhbGl6YXRpb25zLlxuICAgKlxuICAgKiBQbGVhc2UgYmUgYXdhcmUgdGhhdCBydW5uaW5nIHdpdGggd2luZG93LmVtaXRMaXREZWJ1Z0xvZ0V2ZW50cyBoYXMgcGVyZm9ybWFuY2Ugb3ZlcmhlYWQsXG4gICAqIG1ha2luZyBjZXJ0YWluIG9wZXJhdGlvbnMgdGhhdCBhcmUgbm9ybWFsbHkgdmVyeSBjaGVhcCAobGlrZSBhIG5vLW9wIHJlbmRlcikgbXVjaCBzbG93ZXIsXG4gICAqIGJlY2F1c2Ugd2UgbXVzdCBjb3B5IGRhdGEgYW5kIGRpc3BhdGNoIGV2ZW50cy5cbiAgICovXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbmFtZXNwYWNlXG4gIGV4cG9ydCBuYW1lc3BhY2UgRGVidWdMb2cge1xuICAgIGV4cG9ydCB0eXBlIEVudHJ5ID1cbiAgICAgIHwgVGVtcGxhdGVQcmVwXG4gICAgICB8IFRlbXBsYXRlSW5zdGFudGlhdGVkXG4gICAgICB8IFRlbXBsYXRlSW5zdGFudGlhdGVkQW5kVXBkYXRlZFxuICAgICAgfCBUZW1wbGF0ZVVwZGF0aW5nXG4gICAgICB8IEJlZ2luUmVuZGVyXG4gICAgICB8IEVuZFJlbmRlclxuICAgICAgfCBDb21taXRQYXJ0RW50cnlcbiAgICAgIHwgU2V0UGFydFZhbHVlO1xuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVQcmVwIHtcbiAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBwcmVwJztcbiAgICAgIHRlbXBsYXRlOiBUZW1wbGF0ZTtcbiAgICAgIHN0cmluZ3M6IFRlbXBsYXRlU3RyaW5nc0FycmF5O1xuICAgICAgY2xvbmFibGVUZW1wbGF0ZTogSFRNTFRlbXBsYXRlRWxlbWVudDtcbiAgICAgIHBhcnRzOiBUZW1wbGF0ZVBhcnRbXTtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBCZWdpblJlbmRlciB7XG4gICAgICBraW5kOiAnYmVnaW4gcmVuZGVyJztcbiAgICAgIGlkOiBudW1iZXI7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50O1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIHBhcnQ6IENoaWxkUGFydCB8IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBFbmRSZW5kZXIge1xuICAgICAga2luZDogJ2VuZCByZW5kZXInO1xuICAgICAgaWQ6IG51bWJlcjtcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgY29udGFpbmVyOiBIVE1MRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQ7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgcGFydDogQ2hpbGRQYXJ0O1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlSW5zdGFudGlhdGVkIHtcbiAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBpbnN0YW50aWF0ZWQnO1xuICAgICAgdGVtcGxhdGU6IFRlbXBsYXRlIHwgQ29tcGlsZWRUZW1wbGF0ZTtcbiAgICAgIGluc3RhbmNlOiBUZW1wbGF0ZUluc3RhbmNlO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIGZyYWdtZW50OiBOb2RlO1xuICAgICAgcGFydHM6IEFycmF5PFBhcnQgfCB1bmRlZmluZWQ+O1xuICAgICAgdmFsdWVzOiB1bmtub3duW107XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVJbnN0YW50aWF0ZWRBbmRVcGRhdGVkIHtcbiAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBpbnN0YW50aWF0ZWQgYW5kIHVwZGF0ZWQnO1xuICAgICAgdGVtcGxhdGU6IFRlbXBsYXRlIHwgQ29tcGlsZWRUZW1wbGF0ZTtcbiAgICAgIGluc3RhbmNlOiBUZW1wbGF0ZUluc3RhbmNlO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIGZyYWdtZW50OiBOb2RlO1xuICAgICAgcGFydHM6IEFycmF5PFBhcnQgfCB1bmRlZmluZWQ+O1xuICAgICAgdmFsdWVzOiB1bmtub3duW107XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVVcGRhdGluZyB7XG4gICAgICBraW5kOiAndGVtcGxhdGUgdXBkYXRpbmcnO1xuICAgICAgdGVtcGxhdGU6IFRlbXBsYXRlIHwgQ29tcGlsZWRUZW1wbGF0ZTtcbiAgICAgIGluc3RhbmNlOiBUZW1wbGF0ZUluc3RhbmNlO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIHBhcnRzOiBBcnJheTxQYXJ0IHwgdW5kZWZpbmVkPjtcbiAgICAgIHZhbHVlczogdW5rbm93bltdO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIFNldFBhcnRWYWx1ZSB7XG4gICAgICBraW5kOiAnc2V0IHBhcnQnO1xuICAgICAgcGFydDogUGFydDtcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgdmFsdWVJbmRleDogbnVtYmVyO1xuICAgICAgdmFsdWVzOiB1bmtub3duW107XG4gICAgICB0ZW1wbGF0ZUluc3RhbmNlOiBUZW1wbGF0ZUluc3RhbmNlO1xuICAgIH1cblxuICAgIGV4cG9ydCB0eXBlIENvbW1pdFBhcnRFbnRyeSA9XG4gICAgICB8IENvbW1pdE5vdGhpbmdUb0NoaWxkRW50cnlcbiAgICAgIHwgQ29tbWl0VGV4dFxuICAgICAgfCBDb21taXROb2RlXG4gICAgICB8IENvbW1pdEF0dHJpYnV0ZVxuICAgICAgfCBDb21taXRQcm9wZXJ0eVxuICAgICAgfCBDb21taXRCb29sZWFuQXR0cmlidXRlXG4gICAgICB8IENvbW1pdEV2ZW50TGlzdGVuZXJcbiAgICAgIHwgQ29tbWl0VG9FbGVtZW50QmluZGluZztcblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0Tm90aGluZ1RvQ2hpbGRFbnRyeSB7XG4gICAgICBraW5kOiAnY29tbWl0IG5vdGhpbmcgdG8gY2hpbGQnO1xuICAgICAgc3RhcnQ6IENoaWxkTm9kZTtcbiAgICAgIGVuZDogQ2hpbGROb2RlIHwgbnVsbDtcbiAgICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUgfCB1bmRlZmluZWQ7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0VGV4dCB7XG4gICAgICBraW5kOiAnY29tbWl0IHRleHQnO1xuICAgICAgbm9kZTogVGV4dDtcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdE5vZGUge1xuICAgICAga2luZDogJ2NvbW1pdCBub2RlJztcbiAgICAgIHN0YXJ0OiBOb2RlO1xuICAgICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSB8IHVuZGVmaW5lZDtcbiAgICAgIHZhbHVlOiBOb2RlO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdEF0dHJpYnV0ZSB7XG4gICAgICBraW5kOiAnY29tbWl0IGF0dHJpYnV0ZSc7XG4gICAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0UHJvcGVydHkge1xuICAgICAga2luZDogJ2NvbW1pdCBwcm9wZXJ0eSc7XG4gICAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0Qm9vbGVhbkF0dHJpYnV0ZSB7XG4gICAgICBraW5kOiAnY29tbWl0IGJvb2xlYW4gYXR0cmlidXRlJztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICB2YWx1ZTogYm9vbGVhbjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRFdmVudExpc3RlbmVyIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgZXZlbnQgbGlzdGVuZXInO1xuICAgICAgZWxlbWVudDogRWxlbWVudDtcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgb2xkTGlzdGVuZXI6IHVua25vd247XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgLy8gVHJ1ZSBpZiB3ZSdyZSByZW1vdmluZyB0aGUgb2xkIGV2ZW50IGxpc3RlbmVyIChlLmcuIGJlY2F1c2Ugc2V0dGluZ3MgY2hhbmdlZCwgb3IgdmFsdWUgaXMgbm90aGluZylcbiAgICAgIHJlbW92ZUxpc3RlbmVyOiBib29sZWFuO1xuICAgICAgLy8gVHJ1ZSBpZiB3ZSdyZSBhZGRpbmcgYSBuZXcgZXZlbnQgbGlzdGVuZXIgKGUuZy4gYmVjYXVzZSBmaXJzdCByZW5kZXIsIG9yIHNldHRpbmdzIGNoYW5nZWQpXG4gICAgICBhZGRMaXN0ZW5lcjogYm9vbGVhbjtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdFRvRWxlbWVudEJpbmRpbmcge1xuICAgICAga2luZDogJ2NvbW1pdCB0byBlbGVtZW50IGJpbmRpbmcnO1xuICAgICAgZWxlbWVudDogRWxlbWVudDtcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cbn1cblxuaW50ZXJmYWNlIERlYnVnTG9nZ2luZ1dpbmRvdyB7XG4gIC8vIEV2ZW4gaW4gZGV2IG1vZGUsIHdlIGdlbmVyYWxseSBkb24ndCB3YW50IHRvIGVtaXQgdGhlc2UgZXZlbnRzLCBhcyB0aGF0J3NcbiAgLy8gYW5vdGhlciBsZXZlbCBvZiBjb3N0LCBzbyBvbmx5IGVtaXQgdGhlbSB3aGVuIERFVl9NT0RFIGlzIHRydWUgX2FuZF8gd2hlblxuICAvLyB3aW5kb3cuZW1pdExpdERlYnVnRXZlbnRzIGlzIHRydWUuXG4gIGVtaXRMaXREZWJ1Z0xvZ0V2ZW50cz86IGJvb2xlYW47XG59XG5cbi8qKlxuICogVXNlZnVsIGZvciB2aXN1YWxpemluZyBhbmQgbG9nZ2luZyBpbnNpZ2h0cyBpbnRvIHdoYXQgdGhlIExpdCB0ZW1wbGF0ZSBzeXN0ZW0gaXMgZG9pbmcuXG4gKlxuICogQ29tcGlsZWQgb3V0IG9mIHByb2QgbW9kZSBidWlsZHMuXG4gKi9cbmNvbnN0IGRlYnVnTG9nRXZlbnQgPSBERVZfTU9ERVxuICA/IChldmVudDogTGl0VW5zdGFibGUuRGVidWdMb2cuRW50cnkpID0+IHtcbiAgICAgIGNvbnN0IHNob3VsZEVtaXQgPSAoZ2xvYmFsIGFzIHVua25vd24gYXMgRGVidWdMb2dnaW5nV2luZG93KVxuICAgICAgICAuZW1pdExpdERlYnVnTG9nRXZlbnRzO1xuICAgICAgaWYgKCFzaG91bGRFbWl0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGdsb2JhbC5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQ8TGl0VW5zdGFibGUuRGVidWdMb2cuRW50cnk+KCdsaXQtZGVidWcnLCB7XG4gICAgICAgICAgZGV0YWlsOiBldmVudCxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICA6IHVuZGVmaW5lZDtcbi8vIFVzZWQgZm9yIGNvbm5lY3RpbmcgYmVnaW5SZW5kZXIgYW5kIGVuZFJlbmRlciBldmVudHMgd2hlbiB0aGVyZSBhcmUgbmVzdGVkXG4vLyByZW5kZXJzIHdoZW4gZXJyb3JzIGFyZSB0aHJvd24gcHJldmVudGluZyBhbiBlbmRSZW5kZXIgZXZlbnQgZnJvbSBiZWluZ1xuLy8gY2FsbGVkLlxubGV0IGRlYnVnTG9nUmVuZGVySWQgPSAwO1xuXG5sZXQgaXNzdWVXYXJuaW5nOiAoY29kZTogc3RyaW5nLCB3YXJuaW5nOiBzdHJpbmcpID0+IHZvaWQ7XG5cbmlmIChERVZfTU9ERSkge1xuICBnbG9iYWwubGl0SXNzdWVkV2FybmluZ3MgPz89IG5ldyBTZXQoKTtcblxuICAvLyBJc3N1ZSBhIHdhcm5pbmcsIGlmIHdlIGhhdmVuJ3QgYWxyZWFkeS5cbiAgaXNzdWVXYXJuaW5nID0gKGNvZGU6IHN0cmluZywgd2FybmluZzogc3RyaW5nKSA9PiB7XG4gICAgd2FybmluZyArPSBjb2RlXG4gICAgICA/IGAgU2VlIGh0dHBzOi8vbGl0LmRldi9tc2cvJHtjb2RlfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gXG4gICAgICA6ICcnO1xuICAgIGlmICghZ2xvYmFsLmxpdElzc3VlZFdhcm5pbmdzIS5oYXMod2FybmluZykpIHtcbiAgICAgIGNvbnNvbGUud2Fybih3YXJuaW5nKTtcbiAgICAgIGdsb2JhbC5saXRJc3N1ZWRXYXJuaW5ncyEuYWRkKHdhcm5pbmcpO1xuICAgIH1cbiAgfTtcblxuICBpc3N1ZVdhcm5pbmcoXG4gICAgJ2Rldi1tb2RlJyxcbiAgICBgTGl0IGlzIGluIGRldiBtb2RlLiBOb3QgcmVjb21tZW5kZWQgZm9yIHByb2R1Y3Rpb24hYFxuICApO1xufVxuXG5jb25zdCB3cmFwID1cbiAgRU5BQkxFX1NIQURZRE9NX05PUEFUQ0ggJiZcbiAgZ2xvYmFsLlNoYWR5RE9NPy5pblVzZSAmJlxuICBnbG9iYWwuU2hhZHlET00/Lm5vUGF0Y2ggPT09IHRydWVcbiAgICA/IChnbG9iYWwuU2hhZHlET00hLndyYXAgYXMgPFQgZXh0ZW5kcyBOb2RlPihub2RlOiBUKSA9PiBUKVxuICAgIDogPFQgZXh0ZW5kcyBOb2RlPihub2RlOiBUKSA9PiBub2RlO1xuXG5jb25zdCB0cnVzdGVkVHlwZXMgPSAoZ2xvYmFsIGFzIHVua25vd24gYXMgVHJ1c3RlZFR5cGVzV2luZG93KS50cnVzdGVkVHlwZXM7XG5cbi8qKlxuICogT3VyIFRydXN0ZWRUeXBlUG9saWN5IGZvciBIVE1MIHdoaWNoIGlzIGRlY2xhcmVkIHVzaW5nIHRoZSBodG1sIHRlbXBsYXRlXG4gKiB0YWcgZnVuY3Rpb24uXG4gKlxuICogVGhhdCBIVE1MIGlzIGEgZGV2ZWxvcGVyLWF1dGhvcmVkIGNvbnN0YW50LCBhbmQgaXMgcGFyc2VkIHdpdGggaW5uZXJIVE1MXG4gKiBiZWZvcmUgYW55IHVudHJ1c3RlZCBleHByZXNzaW9ucyBoYXZlIGJlZW4gbWl4ZWQgaW4uIFRoZXJlZm9yIGl0IGlzXG4gKiBjb25zaWRlcmVkIHNhZmUgYnkgY29uc3RydWN0aW9uLlxuICovXG5jb25zdCBwb2xpY3kgPSB0cnVzdGVkVHlwZXNcbiAgPyB0cnVzdGVkVHlwZXMuY3JlYXRlUG9saWN5KCdsaXQtaHRtbCcsIHtcbiAgICAgIGNyZWF0ZUhUTUw6IChzKSA9PiBzLFxuICAgIH0pXG4gIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFVzZWQgdG8gc2FuaXRpemUgYW55IHZhbHVlIGJlZm9yZSBpdCBpcyB3cml0dGVuIGludG8gdGhlIERPTS4gVGhpcyBjYW4gYmVcbiAqIHVzZWQgdG8gaW1wbGVtZW50IGEgc2VjdXJpdHkgcG9saWN5IG9mIGFsbG93ZWQgYW5kIGRpc2FsbG93ZWQgdmFsdWVzIGluXG4gKiBvcmRlciB0byBwcmV2ZW50IFhTUyBhdHRhY2tzLlxuICpcbiAqIE9uZSB3YXkgb2YgdXNpbmcgdGhpcyBjYWxsYmFjayB3b3VsZCBiZSB0byBjaGVjayBhdHRyaWJ1dGVzIGFuZCBwcm9wZXJ0aWVzXG4gKiBhZ2FpbnN0IGEgbGlzdCBvZiBoaWdoIHJpc2sgZmllbGRzLCBhbmQgcmVxdWlyZSB0aGF0IHZhbHVlcyB3cml0dGVuIHRvIHN1Y2hcbiAqIGZpZWxkcyBiZSBpbnN0YW5jZXMgb2YgYSBjbGFzcyB3aGljaCBpcyBzYWZlIGJ5IGNvbnN0cnVjdGlvbi4gQ2xvc3VyZSdzIFNhZmVcbiAqIEhUTUwgVHlwZXMgaXMgb25lIGltcGxlbWVudGF0aW9uIG9mIHRoaXMgdGVjaG5pcXVlIChcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvc2FmZS1odG1sLXR5cGVzL2Jsb2IvbWFzdGVyL2RvYy9zYWZlaHRtbC10eXBlcy5tZCkuXG4gKiBUaGUgVHJ1c3RlZFR5cGVzIHBvbHlmaWxsIGluIEFQSS1vbmx5IG1vZGUgY291bGQgYWxzbyBiZSB1c2VkIGFzIGEgYmFzaXNcbiAqIGZvciB0aGlzIHRlY2huaXF1ZSAoaHR0cHM6Ly9naXRodWIuY29tL1dJQ0cvdHJ1c3RlZC10eXBlcykuXG4gKlxuICogQHBhcmFtIG5vZGUgVGhlIEhUTUwgbm9kZSAodXN1YWxseSBlaXRoZXIgYSAjdGV4dCBub2RlIG9yIGFuIEVsZW1lbnQpIHRoYXRcbiAqICAgICBpcyBiZWluZyB3cml0dGVuIHRvLiBOb3RlIHRoYXQgdGhpcyBpcyBqdXN0IGFuIGV4ZW1wbGFyIG5vZGUsIHRoZSB3cml0ZVxuICogICAgIG1heSB0YWtlIHBsYWNlIGFnYWluc3QgYW5vdGhlciBpbnN0YW5jZSBvZiB0aGUgc2FtZSBjbGFzcyBvZiBub2RlLlxuICogQHBhcmFtIG5hbWUgVGhlIG5hbWUgb2YgYW4gYXR0cmlidXRlIG9yIHByb3BlcnR5IChmb3IgZXhhbXBsZSwgJ2hyZWYnKS5cbiAqIEBwYXJhbSB0eXBlIEluZGljYXRlcyB3aGV0aGVyIHRoZSB3cml0ZSB0aGF0J3MgYWJvdXQgdG8gYmUgcGVyZm9ybWVkIHdpbGxcbiAqICAgICBiZSB0byBhIHByb3BlcnR5IG9yIGEgbm9kZS5cbiAqIEByZXR1cm4gQSBmdW5jdGlvbiB0aGF0IHdpbGwgc2FuaXRpemUgdGhpcyBjbGFzcyBvZiB3cml0ZXMuXG4gKi9cbmV4cG9ydCB0eXBlIFNhbml0aXplckZhY3RvcnkgPSAoXG4gIG5vZGU6IE5vZGUsXG4gIG5hbWU6IHN0cmluZyxcbiAgdHlwZTogJ3Byb3BlcnR5JyB8ICdhdHRyaWJ1dGUnXG4pID0+IFZhbHVlU2FuaXRpemVyO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gd2hpY2ggY2FuIHNhbml0aXplIHZhbHVlcyB0aGF0IHdpbGwgYmUgd3JpdHRlbiB0byBhIHNwZWNpZmljIGtpbmRcbiAqIG9mIERPTSBzaW5rLlxuICpcbiAqIFNlZSBTYW5pdGl6ZXJGYWN0b3J5LlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2FuaXRpemUuIFdpbGwgYmUgdGhlIGFjdHVhbCB2YWx1ZSBwYXNzZWQgaW50b1xuICogICAgIHRoZSBsaXQtaHRtbCB0ZW1wbGF0ZSBsaXRlcmFsLCBzbyB0aGlzIGNvdWxkIGJlIG9mIGFueSB0eXBlLlxuICogQHJldHVybiBUaGUgdmFsdWUgdG8gd3JpdGUgdG8gdGhlIERPTS4gVXN1YWxseSB0aGUgc2FtZSBhcyB0aGUgaW5wdXQgdmFsdWUsXG4gKiAgICAgdW5sZXNzIHNhbml0aXphdGlvbiBpcyBuZWVkZWQuXG4gKi9cbmV4cG9ydCB0eXBlIFZhbHVlU2FuaXRpemVyID0gKHZhbHVlOiB1bmtub3duKSA9PiB1bmtub3duO1xuXG5jb25zdCBpZGVudGl0eUZ1bmN0aW9uOiBWYWx1ZVNhbml0aXplciA9ICh2YWx1ZTogdW5rbm93bikgPT4gdmFsdWU7XG5jb25zdCBub29wU2FuaXRpemVyOiBTYW5pdGl6ZXJGYWN0b3J5ID0gKFxuICBfbm9kZTogTm9kZSxcbiAgX25hbWU6IHN0cmluZyxcbiAgX3R5cGU6ICdwcm9wZXJ0eScgfCAnYXR0cmlidXRlJ1xuKSA9PiBpZGVudGl0eUZ1bmN0aW9uO1xuXG4vKiogU2V0cyB0aGUgZ2xvYmFsIHNhbml0aXplciBmYWN0b3J5LiAqL1xuY29uc3Qgc2V0U2FuaXRpemVyID0gKG5ld1Nhbml0aXplcjogU2FuaXRpemVyRmFjdG9yeSkgPT4ge1xuICBpZiAoIUVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoc2FuaXRpemVyRmFjdG9yeUludGVybmFsICE9PSBub29wU2FuaXRpemVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYEF0dGVtcHRlZCB0byBvdmVyd3JpdGUgZXhpc3RpbmcgbGl0LWh0bWwgc2VjdXJpdHkgcG9saWN5LmAgK1xuICAgICAgICBgIHNldFNhbml0aXplRE9NVmFsdWVGYWN0b3J5IHNob3VsZCBiZSBjYWxsZWQgYXQgbW9zdCBvbmNlLmBcbiAgICApO1xuICB9XG4gIHNhbml0aXplckZhY3RvcnlJbnRlcm5hbCA9IG5ld1Nhbml0aXplcjtcbn07XG5cbi8qKlxuICogT25seSB1c2VkIGluIGludGVybmFsIHRlc3RzLCBub3QgYSBwYXJ0IG9mIHRoZSBwdWJsaWMgQVBJLlxuICovXG5jb25zdCBfdGVzdE9ubHlDbGVhclNhbml0aXplckZhY3RvcnlEb05vdENhbGxPckVsc2UgPSAoKSA9PiB7XG4gIHNhbml0aXplckZhY3RvcnlJbnRlcm5hbCA9IG5vb3BTYW5pdGl6ZXI7XG59O1xuXG5jb25zdCBjcmVhdGVTYW5pdGl6ZXI6IFNhbml0aXplckZhY3RvcnkgPSAobm9kZSwgbmFtZSwgdHlwZSkgPT4ge1xuICByZXR1cm4gc2FuaXRpemVyRmFjdG9yeUludGVybmFsKG5vZGUsIG5hbWUsIHR5cGUpO1xufTtcblxuLy8gQWRkZWQgdG8gYW4gYXR0cmlidXRlIG5hbWUgdG8gbWFyayB0aGUgYXR0cmlidXRlIGFzIGJvdW5kIHNvIHdlIGNhbiBmaW5kXG4vLyBpdCBlYXNpbHkuXG5jb25zdCBib3VuZEF0dHJpYnV0ZVN1ZmZpeCA9ICckbGl0JCc7XG5cbi8vIFRoaXMgbWFya2VyIGlzIHVzZWQgaW4gbWFueSBzeW50YWN0aWMgcG9zaXRpb25zIGluIEhUTUwsIHNvIGl0IG11c3QgYmVcbi8vIGEgdmFsaWQgZWxlbWVudCBuYW1lIGFuZCBhdHRyaWJ1dGUgbmFtZS4gV2UgZG9uJ3Qgc3VwcG9ydCBkeW5hbWljIG5hbWVzICh5ZXQpXG4vLyBidXQgdGhpcyBhdCBsZWFzdCBlbnN1cmVzIHRoYXQgdGhlIHBhcnNlIHRyZWUgaXMgY2xvc2VyIHRvIHRoZSB0ZW1wbGF0ZVxuLy8gaW50ZW50aW9uLlxuY29uc3QgbWFya2VyID0gYGxpdCQke01hdGgucmFuZG9tKCkudG9GaXhlZCg5KS5zbGljZSgyKX0kYDtcblxuLy8gU3RyaW5nIHVzZWQgdG8gdGVsbCBpZiBhIGNvbW1lbnQgaXMgYSBtYXJrZXIgY29tbWVudFxuY29uc3QgbWFya2VyTWF0Y2ggPSAnPycgKyBtYXJrZXI7XG5cbi8vIFRleHQgdXNlZCB0byBpbnNlcnQgYSBjb21tZW50IG1hcmtlciBub2RlLiBXZSB1c2UgcHJvY2Vzc2luZyBpbnN0cnVjdGlvblxuLy8gc3ludGF4IGJlY2F1c2UgaXQncyBzbGlnaHRseSBzbWFsbGVyLCBidXQgcGFyc2VzIGFzIGEgY29tbWVudCBub2RlLlxuY29uc3Qgbm9kZU1hcmtlciA9IGA8JHttYXJrZXJNYXRjaH0+YDtcblxuY29uc3QgZCA9XG4gIE5PREVfTU9ERSAmJiBnbG9iYWwuZG9jdW1lbnQgPT09IHVuZGVmaW5lZFxuICAgID8gKHtcbiAgICAgICAgY3JlYXRlVHJlZVdhbGtlcigpIHtcbiAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH0sXG4gICAgICB9IGFzIHVua25vd24gYXMgRG9jdW1lbnQpXG4gICAgOiBkb2N1bWVudDtcblxuLy8gQ3JlYXRlcyBhIGR5bmFtaWMgbWFya2VyLiBXZSBuZXZlciBoYXZlIHRvIHNlYXJjaCBmb3IgdGhlc2UgaW4gdGhlIERPTS5cbmNvbnN0IGNyZWF0ZU1hcmtlciA9ICgpID0+IGQuY3JlYXRlQ29tbWVudCgnJyk7XG5cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXR5cGVvZi1vcGVyYXRvclxudHlwZSBQcmltaXRpdmUgPSBudWxsIHwgdW5kZWZpbmVkIHwgYm9vbGVhbiB8IG51bWJlciB8IHN0cmluZyB8IHN5bWJvbCB8IGJpZ2ludDtcbmNvbnN0IGlzUHJpbWl0aXZlID0gKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUHJpbWl0aXZlID0+XG4gIHZhbHVlID09PSBudWxsIHx8ICh0eXBlb2YgdmFsdWUgIT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlICE9ICdmdW5jdGlvbicpO1xuY29uc3QgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5jb25zdCBpc0l0ZXJhYmxlID0gKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgSXRlcmFibGU8dW5rbm93bj4gPT5cbiAgaXNBcnJheSh2YWx1ZSkgfHxcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgdHlwZW9mICh2YWx1ZSBhcyBhbnkpPy5bU3ltYm9sLml0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJztcblxuY29uc3QgU1BBQ0VfQ0hBUiA9IGBbIFxcdFxcblxcZlxccl1gO1xuY29uc3QgQVRUUl9WQUxVRV9DSEFSID0gYFteIFxcdFxcblxcZlxcclwiJ1xcYDw+PV1gO1xuY29uc3QgTkFNRV9DSEFSID0gYFteXFxcXHNcIic+PS9dYDtcblxuLy8gVGhlc2UgcmVnZXhlcyByZXByZXNlbnQgdGhlIGZpdmUgcGFyc2luZyBzdGF0ZXMgdGhhdCB3ZSBjYXJlIGFib3V0IGluIHRoZVxuLy8gVGVtcGxhdGUncyBIVE1MIHNjYW5uZXIuIFRoZXkgbWF0Y2ggdGhlICplbmQqIG9mIHRoZSBzdGF0ZSB0aGV5J3JlIG5hbWVkXG4vLyBhZnRlci5cbi8vIERlcGVuZGluZyBvbiB0aGUgbWF0Y2gsIHdlIHRyYW5zaXRpb24gdG8gYSBuZXcgc3RhdGUuIElmIHRoZXJlJ3Mgbm8gbWF0Y2gsXG4vLyB3ZSBzdGF5IGluIHRoZSBzYW1lIHN0YXRlLlxuLy8gTm90ZSB0aGF0IHRoZSByZWdleGVzIGFyZSBzdGF0ZWZ1bC4gV2UgdXRpbGl6ZSBsYXN0SW5kZXggYW5kIHN5bmMgaXRcbi8vIGFjcm9zcyB0aGUgbXVsdGlwbGUgcmVnZXhlcyB1c2VkLiBJbiBhZGRpdGlvbiB0byB0aGUgZml2ZSByZWdleGVzIGJlbG93XG4vLyB3ZSBhbHNvIGR5bmFtaWNhbGx5IGNyZWF0ZSBhIHJlZ2V4IHRvIGZpbmQgdGhlIG1hdGNoaW5nIGVuZCB0YWdzIGZvciByYXdcbi8vIHRleHQgZWxlbWVudHMuXG5cbi8qKlxuICogRW5kIG9mIHRleHQgaXM6IGA8YCBmb2xsb3dlZCBieTpcbiAqICAgKGNvbW1lbnQgc3RhcnQpIG9yICh0YWcpIG9yIChkeW5hbWljIHRhZyBiaW5kaW5nKVxuICovXG5jb25zdCB0ZXh0RW5kUmVnZXggPSAvPCg/OighLS18XFwvW15hLXpBLVpdKXwoXFwvP1thLXpBLVpdW14+XFxzXSopfChcXC8/JCkpL2c7XG5jb25zdCBDT01NRU5UX1NUQVJUID0gMTtcbmNvbnN0IFRBR19OQU1FID0gMjtcbmNvbnN0IERZTkFNSUNfVEFHX05BTUUgPSAzO1xuXG5jb25zdCBjb21tZW50RW5kUmVnZXggPSAvLS0+L2c7XG4vKipcbiAqIENvbW1lbnRzIG5vdCBzdGFydGVkIHdpdGggPCEtLSwgbGlrZSA8L3ssIGNhbiBiZSBlbmRlZCBieSBhIHNpbmdsZSBgPmBcbiAqL1xuY29uc3QgY29tbWVudDJFbmRSZWdleCA9IC8+L2c7XG5cbi8qKlxuICogVGhlIHRhZ0VuZCByZWdleCBtYXRjaGVzIHRoZSBlbmQgb2YgdGhlIFwiaW5zaWRlIGFuIG9wZW5pbmdcIiB0YWcgc3ludGF4XG4gKiBwb3NpdGlvbi4gSXQgZWl0aGVyIG1hdGNoZXMgYSBgPmAsIGFuIGF0dHJpYnV0ZS1saWtlIHNlcXVlbmNlLCBvciB0aGUgZW5kXG4gKiBvZiB0aGUgc3RyaW5nIGFmdGVyIGEgc3BhY2UgKGF0dHJpYnV0ZS1uYW1lIHBvc2l0aW9uIGVuZGluZykuXG4gKlxuICogU2VlIGF0dHJpYnV0ZXMgaW4gdGhlIEhUTUwgc3BlYzpcbiAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9zeW50YXguaHRtbCNlbGVtZW50cy1hdHRyaWJ1dGVzXG4gKlxuICogXCIgXFx0XFxuXFxmXFxyXCIgYXJlIEhUTUwgc3BhY2UgY2hhcmFjdGVyczpcbiAqIGh0dHBzOi8vaW5mcmEuc3BlYy53aGF0d2cub3JnLyNhc2NpaS13aGl0ZXNwYWNlXG4gKlxuICogU28gYW4gYXR0cmlidXRlIGlzOlxuICogICogVGhlIG5hbWU6IGFueSBjaGFyYWN0ZXIgZXhjZXB0IGEgd2hpdGVzcGFjZSBjaGFyYWN0ZXIsIChcIiksICgnKSwgXCI+XCIsXG4gKiAgICBcIj1cIiwgb3IgXCIvXCIuIE5vdGU6IHRoaXMgaXMgZGlmZmVyZW50IGZyb20gdGhlIEhUTUwgc3BlYyB3aGljaCBhbHNvIGV4Y2x1ZGVzIGNvbnRyb2wgY2hhcmFjdGVycy5cbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieSBcIj1cIlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5OlxuICogICAgKiBBbnkgY2hhcmFjdGVyIGV4Y2VwdCBzcGFjZSwgKCcpLCAoXCIpLCBcIjxcIiwgXCI+XCIsIFwiPVwiLCAoYCksIG9yXG4gKiAgICAqIChcIikgdGhlbiBhbnkgbm9uLShcIiksIG9yXG4gKiAgICAqICgnKSB0aGVuIGFueSBub24tKCcpXG4gKi9cbmNvbnN0IHRhZ0VuZFJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgYD58JHtTUEFDRV9DSEFSfSg/Oigke05BTUVfQ0hBUn0rKSgke1NQQUNFX0NIQVJ9Kj0ke1NQQUNFX0NIQVJ9Kig/OiR7QVRUUl9WQUxVRV9DSEFSfXwoXCJ8Jyl8KSl8JClgLFxuICAnZydcbik7XG5jb25zdCBFTlRJUkVfTUFUQ0ggPSAwO1xuY29uc3QgQVRUUklCVVRFX05BTUUgPSAxO1xuY29uc3QgU1BBQ0VTX0FORF9FUVVBTFMgPSAyO1xuY29uc3QgUVVPVEVfQ0hBUiA9IDM7XG5cbmNvbnN0IHNpbmdsZVF1b3RlQXR0ckVuZFJlZ2V4ID0gLycvZztcbmNvbnN0IGRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4ID0gL1wiL2c7XG4vKipcbiAqIE1hdGNoZXMgdGhlIHJhdyB0ZXh0IGVsZW1lbnRzLlxuICpcbiAqIENvbW1lbnRzIGFyZSBub3QgcGFyc2VkIHdpdGhpbiByYXcgdGV4dCBlbGVtZW50cywgc28gd2UgbmVlZCB0byBzZWFyY2ggdGhlaXJcbiAqIHRleHQgY29udGVudCBmb3IgbWFya2VyIHN0cmluZ3MuXG4gKi9cbmNvbnN0IHJhd1RleHRFbGVtZW50ID0gL14oPzpzY3JpcHR8c3R5bGV8dGV4dGFyZWF8dGl0bGUpJC9pO1xuXG4vKiogVGVtcGxhdGVSZXN1bHQgdHlwZXMgKi9cbmNvbnN0IEhUTUxfUkVTVUxUID0gMTtcbmNvbnN0IFNWR19SRVNVTFQgPSAyO1xuY29uc3QgTUFUSE1MX1JFU1VMVCA9IDM7XG5cbnR5cGUgUmVzdWx0VHlwZSA9IHR5cGVvZiBIVE1MX1JFU1VMVCB8IHR5cGVvZiBTVkdfUkVTVUxUIHwgdHlwZW9mIE1BVEhNTF9SRVNVTFQ7XG5cbi8vIFRlbXBsYXRlUGFydCB0eXBlc1xuLy8gSU1QT1JUQU5UOiB0aGVzZSBtdXN0IG1hdGNoIHRoZSB2YWx1ZXMgaW4gUGFydFR5cGVcbmNvbnN0IEFUVFJJQlVURV9QQVJUID0gMTtcbmNvbnN0IENISUxEX1BBUlQgPSAyO1xuY29uc3QgUFJPUEVSVFlfUEFSVCA9IDM7XG5jb25zdCBCT09MRUFOX0FUVFJJQlVURV9QQVJUID0gNDtcbmNvbnN0IEVWRU5UX1BBUlQgPSA1O1xuY29uc3QgRUxFTUVOVF9QQVJUID0gNjtcbmNvbnN0IENPTU1FTlRfUEFSVCA9IDc7XG5cbi8qKlxuICogVGhlIHJldHVybiB0eXBlIG9mIHRoZSB0ZW1wbGF0ZSB0YWcgZnVuY3Rpb25zLCB7QGxpbmtjb2RlIGh0bWx9IGFuZFxuICoge0BsaW5rY29kZSBzdmd9IHdoZW4gaXQgaGFzbid0IGJlZW4gY29tcGlsZWQgYnkgQGxpdC1sYWJzL2NvbXBpbGVyLlxuICpcbiAqIEEgYFRlbXBsYXRlUmVzdWx0YCBvYmplY3QgaG9sZHMgYWxsIHRoZSBpbmZvcm1hdGlvbiBhYm91dCBhIHRlbXBsYXRlXG4gKiBleHByZXNzaW9uIHJlcXVpcmVkIHRvIHJlbmRlciBpdDogdGhlIHRlbXBsYXRlIHN0cmluZ3MsIGV4cHJlc3Npb24gdmFsdWVzLFxuICogYW5kIHR5cGUgb2YgdGVtcGxhdGUgKGh0bWwgb3Igc3ZnKS5cbiAqXG4gKiBgVGVtcGxhdGVSZXN1bHRgIG9iamVjdHMgZG8gbm90IGNyZWF0ZSBhbnkgRE9NIG9uIHRoZWlyIG93bi4gVG8gY3JlYXRlIG9yXG4gKiB1cGRhdGUgRE9NIHlvdSBuZWVkIHRvIHJlbmRlciB0aGUgYFRlbXBsYXRlUmVzdWx0YC4gU2VlXG4gKiBbUmVuZGVyaW5nXShodHRwczovL2xpdC5kZXYvZG9jcy9jb21wb25lbnRzL3JlbmRlcmluZykgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICovXG5leHBvcnQgdHlwZSBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQ8VCBleHRlbmRzIFJlc3VsdFR5cGUgPSBSZXN1bHRUeXBlPiA9IHtcbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgWydfJGxpdFR5cGUkJ106IFQ7XG4gIHN0cmluZ3M6IFRlbXBsYXRlU3RyaW5nc0FycmF5O1xuICB2YWx1ZXM6IHVua25vd25bXTtcbn07XG5cbi8qKlxuICogVGhpcyBpcyBhIHRlbXBsYXRlIHJlc3VsdCB0aGF0IG1heSBiZSBlaXRoZXIgdW5jb21waWxlZCBvciBjb21waWxlZC5cbiAqXG4gKiBJbiB0aGUgZnV0dXJlLCBUZW1wbGF0ZVJlc3VsdCB3aWxsIGJlIHRoaXMgdHlwZS4gSWYgeW91IHdhbnQgdG8gZXhwbGljaXRseVxuICogbm90ZSB0aGF0IGEgdGVtcGxhdGUgcmVzdWx0IGlzIHBvdGVudGlhbGx5IGNvbXBpbGVkLCB5b3UgY2FuIHJlZmVyZW5jZSB0aGlzXG4gKiB0eXBlIGFuZCBpdCB3aWxsIGNvbnRpbnVlIHRvIGJlaGF2ZSB0aGUgc2FtZSB0aHJvdWdoIHRoZSBuZXh0IG1ham9yIHZlcnNpb25cbiAqIG9mIExpdC4gVGhpcyBjYW4gYmUgdXNlZnVsIGZvciBjb2RlIHRoYXQgd2FudHMgdG8gcHJlcGFyZSBmb3IgdGhlIG5leHRcbiAqIG1ham9yIHZlcnNpb24gb2YgTGl0LlxuICovXG5leHBvcnQgdHlwZSBNYXliZUNvbXBpbGVkVGVtcGxhdGVSZXN1bHQ8VCBleHRlbmRzIFJlc3VsdFR5cGUgPSBSZXN1bHRUeXBlPiA9XG4gIHwgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0PFQ+XG4gIHwgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdDtcblxuLyoqXG4gKiBUaGUgcmV0dXJuIHR5cGUgb2YgdGhlIHRlbXBsYXRlIHRhZyBmdW5jdGlvbnMsIHtAbGlua2NvZGUgaHRtbH0gYW5kXG4gKiB7QGxpbmtjb2RlIHN2Z30uXG4gKlxuICogQSBgVGVtcGxhdGVSZXN1bHRgIG9iamVjdCBob2xkcyBhbGwgdGhlIGluZm9ybWF0aW9uIGFib3V0IGEgdGVtcGxhdGVcbiAqIGV4cHJlc3Npb24gcmVxdWlyZWQgdG8gcmVuZGVyIGl0OiB0aGUgdGVtcGxhdGUgc3RyaW5ncywgZXhwcmVzc2lvbiB2YWx1ZXMsXG4gKiBhbmQgdHlwZSBvZiB0ZW1wbGF0ZSAoaHRtbCBvciBzdmcpLlxuICpcbiAqIGBUZW1wbGF0ZVJlc3VsdGAgb2JqZWN0cyBkbyBub3QgY3JlYXRlIGFueSBET00gb24gdGhlaXIgb3duLiBUbyBjcmVhdGUgb3JcbiAqIHVwZGF0ZSBET00geW91IG5lZWQgdG8gcmVuZGVyIHRoZSBgVGVtcGxhdGVSZXN1bHRgLiBTZWVcbiAqIFtSZW5kZXJpbmddKGh0dHBzOi8vbGl0LmRldi9kb2NzL2NvbXBvbmVudHMvcmVuZGVyaW5nKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiBJbiBMaXQgNCwgdGhpcyB0eXBlIHdpbGwgYmUgYW4gYWxpYXMgb2ZcbiAqIE1heWJlQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdCwgc28gdGhhdCBjb2RlIHdpbGwgZ2V0IHR5cGUgZXJyb3JzIGlmIGl0IGFzc3VtZXNcbiAqIHRoYXQgTGl0IHRlbXBsYXRlcyBhcmUgbm90IGNvbXBpbGVkLiBXaGVuIGRlbGliZXJhdGVseSB3b3JraW5nIHdpdGggb25seVxuICogb25lLCB1c2UgZWl0aGVyIHtAbGlua2NvZGUgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdH0gb3JcbiAqIHtAbGlua2NvZGUgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0fSBleHBsaWNpdGx5LlxuICovXG5leHBvcnQgdHlwZSBUZW1wbGF0ZVJlc3VsdDxUIGV4dGVuZHMgUmVzdWx0VHlwZSA9IFJlc3VsdFR5cGU+ID1cbiAgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0PFQ+O1xuXG5leHBvcnQgdHlwZSBIVE1MVGVtcGxhdGVSZXN1bHQgPSBUZW1wbGF0ZVJlc3VsdDx0eXBlb2YgSFRNTF9SRVNVTFQ+O1xuXG5leHBvcnQgdHlwZSBTVkdUZW1wbGF0ZVJlc3VsdCA9IFRlbXBsYXRlUmVzdWx0PHR5cGVvZiBTVkdfUkVTVUxUPjtcblxuZXhwb3J0IHR5cGUgTWF0aE1MVGVtcGxhdGVSZXN1bHQgPSBUZW1wbGF0ZVJlc3VsdDx0eXBlb2YgTUFUSE1MX1JFU1VMVD47XG5cbi8qKlxuICogQSBUZW1wbGF0ZVJlc3VsdCB0aGF0IGhhcyBiZWVuIGNvbXBpbGVkIGJ5IEBsaXQtbGFicy9jb21waWxlciwgc2tpcHBpbmcgdGhlXG4gKiBwcmVwYXJlIHN0ZXAuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdCB7XG4gIC8vIFRoaXMgaXMgYSBmYWN0b3J5IGluIG9yZGVyIHRvIG1ha2UgdGVtcGxhdGUgaW5pdGlhbGl6YXRpb24gbGF6eVxuICAvLyBhbmQgYWxsb3cgU2hhZHlSZW5kZXJPcHRpb25zIHNjb3BlIHRvIGJlIHBhc3NlZCBpbi5cbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgWydfJGxpdFR5cGUkJ106IENvbXBpbGVkVGVtcGxhdGU7XG4gIHZhbHVlczogdW5rbm93bltdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVkVGVtcGxhdGUgZXh0ZW5kcyBPbWl0PFRlbXBsYXRlLCAnZWwnPiB7XG4gIC8vIGVsIGlzIG92ZXJyaWRkZW4gdG8gYmUgb3B0aW9uYWwuIFdlIGluaXRpYWxpemUgaXQgb24gZmlyc3QgcmVuZGVyXG4gIGVsPzogSFRNTFRlbXBsYXRlRWxlbWVudDtcblxuICAvLyBUaGUgcHJlcGFyZWQgSFRNTCBzdHJpbmcgdG8gY3JlYXRlIGEgdGVtcGxhdGUgZWxlbWVudCBmcm9tLlxuICAvLyBUaGUgdHlwZSBpcyBhIFRlbXBsYXRlU3RyaW5nc0FycmF5IHRvIGd1YXJhbnRlZSB0aGF0IHRoZSB2YWx1ZSBjYW1lIGZyb21cbiAgLy8gc291cmNlIGNvZGUsIHByZXZlbnRpbmcgYSBKU09OIGluamVjdGlvbiBhdHRhY2suXG4gIGg6IFRlbXBsYXRlU3RyaW5nc0FycmF5O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHRlbXBsYXRlIGxpdGVyYWwgdGFnIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFRlbXBsYXRlUmVzdWx0IHdpdGhcbiAqIHRoZSBnaXZlbiByZXN1bHQgdHlwZS5cbiAqL1xuY29uc3QgdGFnID1cbiAgPFQgZXh0ZW5kcyBSZXN1bHRUeXBlPih0eXBlOiBUKSA9PlxuICAoc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXksIC4uLnZhbHVlczogdW5rbm93bltdKTogVGVtcGxhdGVSZXN1bHQ8VD4gPT4ge1xuICAgIC8vIFdhcm4gYWdhaW5zdCB0ZW1wbGF0ZXMgb2N0YWwgZXNjYXBlIHNlcXVlbmNlc1xuICAgIC8vIFdlIGRvIHRoaXMgaGVyZSByYXRoZXIgdGhhbiBpbiByZW5kZXIgc28gdGhhdCB0aGUgd2FybmluZyBpcyBjbG9zZXIgdG8gdGhlXG4gICAgLy8gdGVtcGxhdGUgZGVmaW5pdGlvbi5cbiAgICBpZiAoREVWX01PREUgJiYgc3RyaW5ncy5zb21lKChzKSA9PiBzID09PSB1bmRlZmluZWQpKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdTb21lIHRlbXBsYXRlIHN0cmluZ3MgYXJlIHVuZGVmaW5lZC5cXG4nICtcbiAgICAgICAgICAnVGhpcyBpcyBwcm9iYWJseSBjYXVzZWQgYnkgaWxsZWdhbCBvY3RhbCBlc2NhcGUgc2VxdWVuY2VzLidcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgLy8gSW1wb3J0IHN0YXRpYy1odG1sLmpzIHJlc3VsdHMgaW4gYSBjaXJjdWxhciBkZXBlbmRlbmN5IHdoaWNoIGczIGRvZXNuJ3RcbiAgICAgIC8vIGhhbmRsZS4gSW5zdGVhZCB3ZSBrbm93IHRoYXQgc3RhdGljIHZhbHVlcyBtdXN0IGhhdmUgdGhlIGZpZWxkXG4gICAgICAvLyBgXyRsaXRTdGF0aWMkYC5cbiAgICAgIGlmIChcbiAgICAgICAgdmFsdWVzLnNvbWUoKHZhbCkgPT4gKHZhbCBhcyB7XyRsaXRTdGF0aWMkOiB1bmtub3dufSk/LlsnXyRsaXRTdGF0aWMkJ10pXG4gICAgICApIHtcbiAgICAgICAgaXNzdWVXYXJuaW5nKFxuICAgICAgICAgICcnLFxuICAgICAgICAgIGBTdGF0aWMgdmFsdWVzICdsaXRlcmFsJyBvciAndW5zYWZlU3RhdGljJyBjYW5ub3QgYmUgdXNlZCBhcyB2YWx1ZXMgdG8gbm9uLXN0YXRpYyB0ZW1wbGF0ZXMuXFxuYCArXG4gICAgICAgICAgICBgUGxlYXNlIHVzZSB0aGUgc3RhdGljICdodG1sJyB0YWcgZnVuY3Rpb24uIFNlZSBodHRwczovL2xpdC5kZXYvZG9jcy90ZW1wbGF0ZXMvZXhwcmVzc2lvbnMvI3N0YXRpYy1leHByZXNzaW9uc2BcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgICBbJ18kbGl0VHlwZSQnXTogdHlwZSxcbiAgICAgIHN0cmluZ3MsXG4gICAgICB2YWx1ZXMsXG4gICAgfTtcbiAgfTtcblxuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhbiBIVE1MIHRlbXBsYXRlIHRoYXQgY2FuIGVmZmljaWVudGx5XG4gKiByZW5kZXIgdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqXG4gKiBgYGB0c1xuICogY29uc3QgaGVhZGVyID0gKHRpdGxlOiBzdHJpbmcpID0+IGh0bWxgPGgxPiR7dGl0bGV9PC9oMT5gO1xuICogYGBgXG4gKlxuICogVGhlIGBodG1sYCB0YWcgcmV0dXJucyBhIGRlc2NyaXB0aW9uIG9mIHRoZSBET00gdG8gcmVuZGVyIGFzIGEgdmFsdWUuIEl0IGlzXG4gKiBsYXp5LCBtZWFuaW5nIG5vIHdvcmsgaXMgZG9uZSB1bnRpbCB0aGUgdGVtcGxhdGUgaXMgcmVuZGVyZWQuIFdoZW4gcmVuZGVyaW5nLFxuICogaWYgYSB0ZW1wbGF0ZSBjb21lcyBmcm9tIHRoZSBzYW1lIGV4cHJlc3Npb24gYXMgYSBwcmV2aW91c2x5IHJlbmRlcmVkIHJlc3VsdCxcbiAqIGl0J3MgZWZmaWNpZW50bHkgdXBkYXRlZCBpbnN0ZWFkIG9mIHJlcGxhY2VkLlxuICovXG5leHBvcnQgY29uc3QgaHRtbCA9IHRhZyhIVE1MX1JFU1VMVCk7XG5cbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgYW4gU1ZHIGZyYWdtZW50IHRoYXQgY2FuIGVmZmljaWVudGx5IHJlbmRlclxuICogdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqXG4gKiBgYGB0c1xuICogY29uc3QgcmVjdCA9IHN2Z2A8cmVjdCB3aWR0aD1cIjEwXCIgaGVpZ2h0PVwiMTBcIj48L3JlY3Q+YDtcbiAqXG4gKiBjb25zdCBteUltYWdlID0gaHRtbGBcbiAqICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDEwIDEwXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuICogICAgICR7cmVjdH1cbiAqICAgPC9zdmc+YDtcbiAqIGBgYFxuICpcbiAqIFRoZSBgc3ZnYCAqdGFnIGZ1bmN0aW9uKiBzaG91bGQgb25seSBiZSB1c2VkIGZvciBTVkcgZnJhZ21lbnRzLCBvciBlbGVtZW50c1xuICogdGhhdCB3b3VsZCBiZSBjb250YWluZWQgKippbnNpZGUqKiBhbiBgPHN2Zz5gIEhUTUwgZWxlbWVudC4gQSBjb21tb24gZXJyb3IgaXNcbiAqIHBsYWNpbmcgYW4gYDxzdmc+YCAqZWxlbWVudCogaW4gYSB0ZW1wbGF0ZSB0YWdnZWQgd2l0aCB0aGUgYHN2Z2AgdGFnXG4gKiBmdW5jdGlvbi4gVGhlIGA8c3ZnPmAgZWxlbWVudCBpcyBhbiBIVE1MIGVsZW1lbnQgYW5kIHNob3VsZCBiZSB1c2VkIHdpdGhpbiBhXG4gKiB0ZW1wbGF0ZSB0YWdnZWQgd2l0aCB0aGUge0BsaW5rY29kZSBodG1sfSB0YWcgZnVuY3Rpb24uXG4gKlxuICogSW4gTGl0RWxlbWVudCB1c2FnZSwgaXQncyBpbnZhbGlkIHRvIHJldHVybiBhbiBTVkcgZnJhZ21lbnQgZnJvbSB0aGVcbiAqIGByZW5kZXIoKWAgbWV0aG9kLCBhcyB0aGUgU1ZHIGZyYWdtZW50IHdpbGwgYmUgY29udGFpbmVkIHdpdGhpbiB0aGUgZWxlbWVudCdzXG4gKiBzaGFkb3cgcm9vdCBhbmQgdGh1cyBub3QgYmUgcHJvcGVybHkgY29udGFpbmVkIHdpdGhpbiBhbiBgPHN2Zz5gIEhUTUxcbiAqIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBjb25zdCBzdmcgPSB0YWcoU1ZHX1JFU1VMVCk7XG5cbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgTWF0aE1MIGZyYWdtZW50IHRoYXQgY2FuIGVmZmljaWVudGx5IHJlbmRlclxuICogdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqXG4gKiBgYGB0c1xuICogY29uc3QgbnVtID0gbWF0aG1sYDxtbj4xPC9tbj5gO1xuICpcbiAqIGNvbnN0IGVxID0gaHRtbGBcbiAqICAgPG1hdGg+XG4gKiAgICAgJHtudW19XG4gKiAgIDwvbWF0aD5gO1xuICogYGBgXG4gKlxuICogVGhlIGBtYXRobWxgICp0YWcgZnVuY3Rpb24qIHNob3VsZCBvbmx5IGJlIHVzZWQgZm9yIE1hdGhNTCBmcmFnbWVudHMsIG9yXG4gKiBlbGVtZW50cyB0aGF0IHdvdWxkIGJlIGNvbnRhaW5lZCAqKmluc2lkZSoqIGEgYDxtYXRoPmAgSFRNTCBlbGVtZW50LiBBIGNvbW1vblxuICogZXJyb3IgaXMgcGxhY2luZyBhIGA8bWF0aD5gICplbGVtZW50KiBpbiBhIHRlbXBsYXRlIHRhZ2dlZCB3aXRoIHRoZSBgbWF0aG1sYFxuICogdGFnIGZ1bmN0aW9uLiBUaGUgYDxtYXRoPmAgZWxlbWVudCBpcyBhbiBIVE1MIGVsZW1lbnQgYW5kIHNob3VsZCBiZSB1c2VkXG4gKiB3aXRoaW4gYSB0ZW1wbGF0ZSB0YWdnZWQgd2l0aCB0aGUge0BsaW5rY29kZSBodG1sfSB0YWcgZnVuY3Rpb24uXG4gKlxuICogSW4gTGl0RWxlbWVudCB1c2FnZSwgaXQncyBpbnZhbGlkIHRvIHJldHVybiBhbiBNYXRoTUwgZnJhZ21lbnQgZnJvbSB0aGVcbiAqIGByZW5kZXIoKWAgbWV0aG9kLCBhcyB0aGUgTWF0aE1MIGZyYWdtZW50IHdpbGwgYmUgY29udGFpbmVkIHdpdGhpbiB0aGVcbiAqIGVsZW1lbnQncyBzaGFkb3cgcm9vdCBhbmQgdGh1cyBub3QgYmUgcHJvcGVybHkgY29udGFpbmVkIHdpdGhpbiBhIGA8bWF0aD5gXG4gKiBIVE1MIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBjb25zdCBtYXRobWwgPSB0YWcoTUFUSE1MX1JFU1VMVCk7XG5cbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgdGhhdCBhIHZhbHVlIHdhcyBoYW5kbGVkIGJ5IGEgZGlyZWN0aXZlIGFuZFxuICogc2hvdWxkIG5vdCBiZSB3cml0dGVuIHRvIHRoZSBET00uXG4gKi9cbmV4cG9ydCBjb25zdCBub0NoYW5nZSA9IFN5bWJvbC5mb3IoJ2xpdC1ub0NoYW5nZScpO1xuXG4vKipcbiAqIEEgc2VudGluZWwgdmFsdWUgdGhhdCBzaWduYWxzIGEgQ2hpbGRQYXJ0IHRvIGZ1bGx5IGNsZWFyIGl0cyBjb250ZW50LlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBidXR0b24gPSBodG1sYCR7XG4gKiAgdXNlci5pc0FkbWluXG4gKiAgICA/IGh0bWxgPGJ1dHRvbj5ERUxFVEU8L2J1dHRvbj5gXG4gKiAgICA6IG5vdGhpbmdcbiAqIH1gO1xuICogYGBgXG4gKlxuICogUHJlZmVyIHVzaW5nIGBub3RoaW5nYCBvdmVyIG90aGVyIGZhbHN5IHZhbHVlcyBhcyBpdCBwcm92aWRlcyBhIGNvbnNpc3RlbnRcbiAqIGJlaGF2aW9yIGJldHdlZW4gdmFyaW91cyBleHByZXNzaW9uIGJpbmRpbmcgY29udGV4dHMuXG4gKlxuICogSW4gY2hpbGQgZXhwcmVzc2lvbnMsIGB1bmRlZmluZWRgLCBgbnVsbGAsIGAnJ2AsIGFuZCBgbm90aGluZ2AgYWxsIGJlaGF2ZSB0aGVcbiAqIHNhbWUgYW5kIHJlbmRlciBubyBub2Rlcy4gSW4gYXR0cmlidXRlIGV4cHJlc3Npb25zLCBgbm90aGluZ2AgX3JlbW92ZXNfIHRoZVxuICogYXR0cmlidXRlLCB3aGlsZSBgdW5kZWZpbmVkYCBhbmQgYG51bGxgIHdpbGwgcmVuZGVyIGFuIGVtcHR5IHN0cmluZy4gSW5cbiAqIHByb3BlcnR5IGV4cHJlc3Npb25zIGBub3RoaW5nYCBiZWNvbWVzIGB1bmRlZmluZWRgLlxuICovXG5leHBvcnQgY29uc3Qgbm90aGluZyA9IFN5bWJvbC5mb3IoJ2xpdC1ub3RoaW5nJyk7XG5cbi8qKlxuICogVGhlIGNhY2hlIG9mIHByZXBhcmVkIHRlbXBsYXRlcywga2V5ZWQgYnkgdGhlIHRhZ2dlZCBUZW1wbGF0ZVN0cmluZ3NBcnJheVxuICogYW5kIF9ub3RfIGFjY291bnRpbmcgZm9yIHRoZSBzcGVjaWZpYyB0ZW1wbGF0ZSB0YWcgdXNlZC4gVGhpcyBtZWFucyB0aGF0XG4gKiB0ZW1wbGF0ZSB0YWdzIGNhbm5vdCBiZSBkeW5hbWljIC0gdGhleSBtdXN0IHN0YXRpY2FsbHkgYmUgb25lIG9mIGh0bWwsIHN2ZyxcbiAqIG9yIGF0dHIuIFRoaXMgcmVzdHJpY3Rpb24gc2ltcGxpZmllcyB0aGUgY2FjaGUgbG9va3VwLCB3aGljaCBpcyBvbiB0aGUgaG90XG4gKiBwYXRoIGZvciByZW5kZXJpbmcuXG4gKi9cbmNvbnN0IHRlbXBsYXRlQ2FjaGUgPSBuZXcgV2Vha01hcDxUZW1wbGF0ZVN0cmluZ3NBcnJheSwgVGVtcGxhdGU+KCk7XG5cbi8qKlxuICogT2JqZWN0IHNwZWNpZnlpbmcgb3B0aW9ucyBmb3IgY29udHJvbGxpbmcgbGl0LWh0bWwgcmVuZGVyaW5nLiBOb3RlIHRoYXRcbiAqIHdoaWxlIGByZW5kZXJgIG1heSBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgb24gdGhlIHNhbWUgYGNvbnRhaW5lcmAgKGFuZFxuICogYHJlbmRlckJlZm9yZWAgcmVmZXJlbmNlIG5vZGUpIHRvIGVmZmljaWVudGx5IHVwZGF0ZSB0aGUgcmVuZGVyZWQgY29udGVudCxcbiAqIG9ubHkgdGhlIG9wdGlvbnMgcGFzc2VkIGluIGR1cmluZyB0aGUgZmlyc3QgcmVuZGVyIGFyZSByZXNwZWN0ZWQgZHVyaW5nXG4gKiB0aGUgbGlmZXRpbWUgb2YgcmVuZGVycyB0byB0aGF0IHVuaXF1ZSBgY29udGFpbmVyYCArIGByZW5kZXJCZWZvcmVgXG4gKiBjb21iaW5hdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJPcHRpb25zIHtcbiAgLyoqXG4gICAqIEFuIG9iamVjdCB0byB1c2UgYXMgdGhlIGB0aGlzYCB2YWx1ZSBmb3IgZXZlbnQgbGlzdGVuZXJzLiBJdCdzIG9mdGVuXG4gICAqIHVzZWZ1bCB0byBzZXQgdGhpcyB0byB0aGUgaG9zdCBjb21wb25lbnQgcmVuZGVyaW5nIGEgdGVtcGxhdGUuXG4gICAqL1xuICBob3N0Pzogb2JqZWN0O1xuICAvKipcbiAgICogQSBET00gbm9kZSBiZWZvcmUgd2hpY2ggdG8gcmVuZGVyIGNvbnRlbnQgaW4gdGhlIGNvbnRhaW5lci5cbiAgICovXG4gIHJlbmRlckJlZm9yZT86IENoaWxkTm9kZSB8IG51bGw7XG4gIC8qKlxuICAgKiBOb2RlIHVzZWQgZm9yIGNsb25pbmcgdGhlIHRlbXBsYXRlIChgaW1wb3J0Tm9kZWAgd2lsbCBiZSBjYWxsZWQgb24gdGhpc1xuICAgKiBub2RlKS4gVGhpcyBjb250cm9scyB0aGUgYG93bmVyRG9jdW1lbnRgIG9mIHRoZSByZW5kZXJlZCBET00sIGFsb25nIHdpdGhcbiAgICogYW55IGluaGVyaXRlZCBjb250ZXh0LiBEZWZhdWx0cyB0byB0aGUgZ2xvYmFsIGBkb2N1bWVudGAuXG4gICAqL1xuICBjcmVhdGlvblNjb3BlPzoge2ltcG9ydE5vZGUobm9kZTogTm9kZSwgZGVlcD86IGJvb2xlYW4pOiBOb2RlfTtcbiAgLyoqXG4gICAqIFRoZSBpbml0aWFsIGNvbm5lY3RlZCBzdGF0ZSBmb3IgdGhlIHRvcC1sZXZlbCBwYXJ0IGJlaW5nIHJlbmRlcmVkLiBJZiBub1xuICAgKiBgaXNDb25uZWN0ZWRgIG9wdGlvbiBpcyBzZXQsIGBBc3luY0RpcmVjdGl2ZWBzIHdpbGwgYmUgY29ubmVjdGVkIGJ5XG4gICAqIGRlZmF1bHQuIFNldCB0byBgZmFsc2VgIGlmIHRoZSBpbml0aWFsIHJlbmRlciBvY2N1cnMgaW4gYSBkaXNjb25uZWN0ZWQgdHJlZVxuICAgKiBhbmQgYEFzeW5jRGlyZWN0aXZlYHMgc2hvdWxkIHNlZSBgaXNDb25uZWN0ZWQgPT09IGZhbHNlYCBmb3IgdGhlaXIgaW5pdGlhbFxuICAgKiByZW5kZXIuIFRoZSBgcGFydC5zZXRDb25uZWN0ZWQoKWAgbWV0aG9kIG11c3QgYmUgdXNlZCBzdWJzZXF1ZW50IHRvIGluaXRpYWxcbiAgICogcmVuZGVyIHRvIGNoYW5nZSB0aGUgY29ubmVjdGVkIHN0YXRlIG9mIHRoZSBwYXJ0LlxuICAgKi9cbiAgaXNDb25uZWN0ZWQ/OiBib29sZWFuO1xufVxuXG5jb25zdCB3YWxrZXIgPSBkLmNyZWF0ZVRyZWVXYWxrZXIoXG4gIGQsXG4gIDEyOSAvKiBOb2RlRmlsdGVyLlNIT1dfe0VMRU1FTlR8Q09NTUVOVH0gKi9cbik7XG5cbmxldCBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWw6IFNhbml0aXplckZhY3RvcnkgPSBub29wU2FuaXRpemVyO1xuXG4vL1xuLy8gQ2xhc3NlcyBvbmx5IGJlbG93IGhlcmUsIGNvbnN0IHZhcmlhYmxlIGRlY2xhcmF0aW9ucyBvbmx5IGFib3ZlIGhlcmUuLi5cbi8vXG4vLyBLZWVwaW5nIHZhcmlhYmxlIGRlY2xhcmF0aW9ucyBhbmQgY2xhc3NlcyB0b2dldGhlciBpbXByb3ZlcyBtaW5pZmljYXRpb24uXG4vLyBJbnRlcmZhY2VzIGFuZCB0eXBlIGFsaWFzZXMgY2FuIGJlIGludGVybGVhdmVkIGZyZWVseS5cbi8vXG5cbi8vIFR5cGUgZm9yIGNsYXNzZXMgdGhhdCBoYXZlIGEgYF9kaXJlY3RpdmVgIG9yIGBfZGlyZWN0aXZlc1tdYCBmaWVsZCwgdXNlZCBieVxuLy8gYHJlc29sdmVEaXJlY3RpdmVgXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGl2ZVBhcmVudCB7XG4gIF8kcGFyZW50PzogRGlyZWN0aXZlUGFyZW50O1xuICBfJGlzQ29ubmVjdGVkOiBib29sZWFuO1xuICBfX2RpcmVjdGl2ZT86IERpcmVjdGl2ZTtcbiAgX19kaXJlY3RpdmVzPzogQXJyYXk8RGlyZWN0aXZlIHwgdW5kZWZpbmVkPjtcbn1cblxuZnVuY3Rpb24gdHJ1c3RGcm9tVGVtcGxhdGVTdHJpbmcoXG4gIHRzYTogVGVtcGxhdGVTdHJpbmdzQXJyYXksXG4gIHN0cmluZ0Zyb21UU0E6IHN0cmluZ1xuKTogVHJ1c3RlZEhUTUwge1xuICAvLyBBIHNlY3VyaXR5IGNoZWNrIHRvIHByZXZlbnQgc3Bvb2Zpbmcgb2YgTGl0IHRlbXBsYXRlIHJlc3VsdHMuXG4gIC8vIEluIHRoZSBmdXR1cmUsIHdlIG1heSBiZSBhYmxlIHRvIHJlcGxhY2UgdGhpcyB3aXRoIEFycmF5LmlzVGVtcGxhdGVPYmplY3QsXG4gIC8vIHRob3VnaCB3ZSBtaWdodCBuZWVkIHRvIG1ha2UgdGhhdCBjaGVjayBpbnNpZGUgb2YgdGhlIGh0bWwgYW5kIHN2Z1xuICAvLyBmdW5jdGlvbnMsIGJlY2F1c2UgcHJlY29tcGlsZWQgdGVtcGxhdGVzIGRvbid0IGNvbWUgaW4gYXNcbiAgLy8gVGVtcGxhdGVTdHJpbmdBcnJheSBvYmplY3RzLlxuICBpZiAoIWlzQXJyYXkodHNhKSB8fCAhdHNhLmhhc093blByb3BlcnR5KCdyYXcnKSkge1xuICAgIGxldCBtZXNzYWdlID0gJ2ludmFsaWQgdGVtcGxhdGUgc3RyaW5ncyBhcnJheSc7XG4gICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICBtZXNzYWdlID0gYFxuICAgICAgICAgIEludGVybmFsIEVycm9yOiBleHBlY3RlZCB0ZW1wbGF0ZSBzdHJpbmdzIHRvIGJlIGFuIGFycmF5XG4gICAgICAgICAgd2l0aCBhICdyYXcnIGZpZWxkLiBGYWtpbmcgYSB0ZW1wbGF0ZSBzdHJpbmdzIGFycmF5IGJ5XG4gICAgICAgICAgY2FsbGluZyBodG1sIG9yIHN2ZyBsaWtlIGFuIG9yZGluYXJ5IGZ1bmN0aW9uIGlzIGVmZmVjdGl2ZWx5XG4gICAgICAgICAgdGhlIHNhbWUgYXMgY2FsbGluZyB1bnNhZmVIdG1sIGFuZCBjYW4gbGVhZCB0byBtYWpvciBzZWN1cml0eVxuICAgICAgICAgIGlzc3VlcywgZS5nLiBvcGVuaW5nIHlvdXIgY29kZSB1cCB0byBYU1MgYXR0YWNrcy5cbiAgICAgICAgICBJZiB5b3UncmUgdXNpbmcgdGhlIGh0bWwgb3Igc3ZnIHRhZ2dlZCB0ZW1wbGF0ZSBmdW5jdGlvbnMgbm9ybWFsbHlcbiAgICAgICAgICBhbmQgc3RpbGwgc2VlaW5nIHRoaXMgZXJyb3IsIHBsZWFzZSBmaWxlIGEgYnVnIGF0XG4gICAgICAgICAgaHR0cHM6Ly9naXRodWIuY29tL2xpdC9saXQvaXNzdWVzL25ldz90ZW1wbGF0ZT1idWdfcmVwb3J0Lm1kXG4gICAgICAgICAgYW5kIGluY2x1ZGUgaW5mb3JtYXRpb24gYWJvdXQgeW91ciBidWlsZCB0b29saW5nLCBpZiBhbnkuXG4gICAgICAgIGBcbiAgICAgICAgLnRyaW0oKVxuICAgICAgICAucmVwbGFjZSgvXFxuICovZywgJ1xcbicpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIHBvbGljeSAhPT0gdW5kZWZpbmVkXG4gICAgPyBwb2xpY3kuY3JlYXRlSFRNTChzdHJpbmdGcm9tVFNBKVxuICAgIDogKHN0cmluZ0Zyb21UU0EgYXMgdW5rbm93biBhcyBUcnVzdGVkSFRNTCk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBIVE1MIHN0cmluZyBmb3IgdGhlIGdpdmVuIFRlbXBsYXRlU3RyaW5nc0FycmF5IGFuZCByZXN1bHQgdHlwZVxuICogKEhUTUwgb3IgU1ZHKSwgYWxvbmcgd2l0aCB0aGUgY2FzZS1zZW5zaXRpdmUgYm91bmQgYXR0cmlidXRlIG5hbWVzIGluXG4gKiB0ZW1wbGF0ZSBvcmRlci4gVGhlIEhUTUwgY29udGFpbnMgY29tbWVudCBtYXJrZXJzIGRlbm90aW5nIHRoZSBgQ2hpbGRQYXJ0YHNcbiAqIGFuZCBzdWZmaXhlcyBvbiBib3VuZCBhdHRyaWJ1dGVzIGRlbm90aW5nIHRoZSBgQXR0cmlidXRlUGFydHNgLlxuICpcbiAqIEBwYXJhbSBzdHJpbmdzIHRlbXBsYXRlIHN0cmluZ3MgYXJyYXlcbiAqIEBwYXJhbSB0eXBlIEhUTUwgb3IgU1ZHXG4gKiBAcmV0dXJuIEFycmF5IGNvbnRhaW5pbmcgYFtodG1sLCBhdHRyTmFtZXNdYCAoYXJyYXkgcmV0dXJuZWQgZm9yIHRlcnNlbmVzcyxcbiAqICAgICB0byBhdm9pZCBvYmplY3QgZmllbGRzIHNpbmNlIHRoaXMgY29kZSBpcyBzaGFyZWQgd2l0aCBub24tbWluaWZpZWQgU1NSXG4gKiAgICAgY29kZSlcbiAqL1xuY29uc3QgZ2V0VGVtcGxhdGVIdG1sID0gKFxuICBzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSxcbiAgdHlwZTogUmVzdWx0VHlwZVxuKTogW1RydXN0ZWRIVE1MLCBBcnJheTxzdHJpbmc+XSA9PiB7XG4gIC8vIEluc2VydCBtYWtlcnMgaW50byB0aGUgdGVtcGxhdGUgSFRNTCB0byByZXByZXNlbnQgdGhlIHBvc2l0aW9uIG9mXG4gIC8vIGJpbmRpbmdzLiBUaGUgZm9sbG93aW5nIGNvZGUgc2NhbnMgdGhlIHRlbXBsYXRlIHN0cmluZ3MgdG8gZGV0ZXJtaW5lIHRoZVxuICAvLyBzeW50YWN0aWMgcG9zaXRpb24gb2YgdGhlIGJpbmRpbmdzLiBUaGV5IGNhbiBiZSBpbiB0ZXh0IHBvc2l0aW9uLCB3aGVyZVxuICAvLyB3ZSBpbnNlcnQgYW4gSFRNTCBjb21tZW50LCBhdHRyaWJ1dGUgdmFsdWUgcG9zaXRpb24sIHdoZXJlIHdlIGluc2VydCBhXG4gIC8vIHNlbnRpbmVsIHN0cmluZyBhbmQgcmUtd3JpdGUgdGhlIGF0dHJpYnV0ZSBuYW1lLCBvciBpbnNpZGUgYSB0YWcgd2hlcmVcbiAgLy8gd2UgaW5zZXJ0IHRoZSBzZW50aW5lbCBzdHJpbmcuXG4gIGNvbnN0IGwgPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gIC8vIFN0b3JlcyB0aGUgY2FzZS1zZW5zaXRpdmUgYm91bmQgYXR0cmlidXRlIG5hbWVzIGluIHRoZSBvcmRlciBvZiB0aGVpclxuICAvLyBwYXJ0cy4gRWxlbWVudFBhcnRzIGFyZSBhbHNvIHJlZmxlY3RlZCBpbiB0aGlzIGFycmF5IGFzIHVuZGVmaW5lZFxuICAvLyByYXRoZXIgdGhhbiBhIHN0cmluZywgdG8gZGlzYW1iaWd1YXRlIGZyb20gYXR0cmlidXRlIGJpbmRpbmdzLlxuICBjb25zdCBhdHRyTmFtZXM6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgbGV0IGh0bWwgPVxuICAgIHR5cGUgPT09IFNWR19SRVNVTFQgPyAnPHN2Zz4nIDogdHlwZSA9PT0gTUFUSE1MX1JFU1VMVCA/ICc8bWF0aD4nIDogJyc7XG5cbiAgLy8gV2hlbiB3ZSdyZSBpbnNpZGUgYSByYXcgdGV4dCB0YWcgKG5vdCBpdCdzIHRleHQgY29udGVudCksIHRoZSByZWdleFxuICAvLyB3aWxsIHN0aWxsIGJlIHRhZ1JlZ2V4IHNvIHdlIGNhbiBmaW5kIGF0dHJpYnV0ZXMsIGJ1dCB3aWxsIHN3aXRjaCB0b1xuICAvLyB0aGlzIHJlZ2V4IHdoZW4gdGhlIHRhZyBlbmRzLlxuICBsZXQgcmF3VGV4dEVuZFJlZ2V4OiBSZWdFeHAgfCB1bmRlZmluZWQ7XG5cbiAgLy8gVGhlIGN1cnJlbnQgcGFyc2luZyBzdGF0ZSwgcmVwcmVzZW50ZWQgYXMgYSByZWZlcmVuY2UgdG8gb25lIG9mIHRoZVxuICAvLyByZWdleGVzXG4gIGxldCByZWdleCA9IHRleHRFbmRSZWdleDtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgIGNvbnN0IHMgPSBzdHJpbmdzW2ldO1xuICAgIC8vIFRoZSBpbmRleCBvZiB0aGUgZW5kIG9mIHRoZSBsYXN0IGF0dHJpYnV0ZSBuYW1lLiBXaGVuIHRoaXMgaXNcbiAgICAvLyBwb3NpdGl2ZSBhdCBlbmQgb2YgYSBzdHJpbmcsIGl0IG1lYW5zIHdlJ3JlIGluIGFuIGF0dHJpYnV0ZSB2YWx1ZVxuICAgIC8vIHBvc2l0aW9uIGFuZCBuZWVkIHRvIHJld3JpdGUgdGhlIGF0dHJpYnV0ZSBuYW1lLlxuICAgIC8vIFdlIGFsc28gdXNlIGEgc3BlY2lhbCB2YWx1ZSBvZiAtMiB0byBpbmRpY2F0ZSB0aGF0IHdlIGVuY291bnRlcmVkXG4gICAgLy8gdGhlIGVuZCBvZiBhIHN0cmluZyBpbiBhdHRyaWJ1dGUgbmFtZSBwb3NpdGlvbi5cbiAgICBsZXQgYXR0ck5hbWVFbmRJbmRleCA9IC0xO1xuICAgIGxldCBhdHRyTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGxldCBsYXN0SW5kZXggPSAwO1xuICAgIGxldCBtYXRjaCE6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG5cbiAgICAvLyBUaGUgY29uZGl0aW9ucyBpbiB0aGlzIGxvb3AgaGFuZGxlIHRoZSBjdXJyZW50IHBhcnNlIHN0YXRlLCBhbmQgdGhlXG4gICAgLy8gYXNzaWdubWVudHMgdG8gdGhlIGByZWdleGAgdmFyaWFibGUgYXJlIHRoZSBzdGF0ZSB0cmFuc2l0aW9ucy5cbiAgICB3aGlsZSAobGFzdEluZGV4IDwgcy5sZW5ndGgpIHtcbiAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBzdGFydCBzZWFyY2hpbmcgZnJvbSB3aGVyZSB3ZSBwcmV2aW91c2x5IGxlZnQgb2ZmXG4gICAgICByZWdleC5sYXN0SW5kZXggPSBsYXN0SW5kZXg7XG4gICAgICBtYXRjaCA9IHJlZ2V4LmV4ZWMocyk7XG4gICAgICBpZiAobWF0Y2ggPT09IG51bGwpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBsYXN0SW5kZXggPSByZWdleC5sYXN0SW5kZXg7XG4gICAgICBpZiAocmVnZXggPT09IHRleHRFbmRSZWdleCkge1xuICAgICAgICBpZiAobWF0Y2hbQ09NTUVOVF9TVEFSVF0gPT09ICchLS0nKSB7XG4gICAgICAgICAgcmVnZXggPSBjb21tZW50RW5kUmVnZXg7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbQ09NTUVOVF9TVEFSVF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIFdlIHN0YXJ0ZWQgYSB3ZWlyZCBjb21tZW50LCBsaWtlIDwve1xuICAgICAgICAgIHJlZ2V4ID0gY29tbWVudDJFbmRSZWdleDtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFtUQUdfTkFNRV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChyYXdUZXh0RWxlbWVudC50ZXN0KG1hdGNoW1RBR19OQU1FXSkpIHtcbiAgICAgICAgICAgIC8vIFJlY29yZCBpZiB3ZSBlbmNvdW50ZXIgYSByYXctdGV4dCBlbGVtZW50LiBXZSdsbCBzd2l0Y2ggdG9cbiAgICAgICAgICAgIC8vIHRoaXMgcmVnZXggYXQgdGhlIGVuZCBvZiB0aGUgdGFnLlxuICAgICAgICAgICAgcmF3VGV4dEVuZFJlZ2V4ID0gbmV3IFJlZ0V4cChgPC8ke21hdGNoW1RBR19OQU1FXX1gLCAnZycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWdleCA9IHRhZ0VuZFJlZ2V4O1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoW0RZTkFNSUNfVEFHX05BTUVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAoREVWX01PREUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0JpbmRpbmdzIGluIHRhZyBuYW1lcyBhcmUgbm90IHN1cHBvcnRlZC4gUGxlYXNlIHVzZSBzdGF0aWMgdGVtcGxhdGVzIGluc3RlYWQuICcgK1xuICAgICAgICAgICAgICAgICdTZWUgaHR0cHM6Ly9saXQuZGV2L2RvY3MvdGVtcGxhdGVzL2V4cHJlc3Npb25zLyNzdGF0aWMtZXhwcmVzc2lvbnMnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWdleCA9IHRhZ0VuZFJlZ2V4O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHJlZ2V4ID09PSB0YWdFbmRSZWdleCkge1xuICAgICAgICBpZiAobWF0Y2hbRU5USVJFX01BVENIXSA9PT0gJz4nKSB7XG4gICAgICAgICAgLy8gRW5kIG9mIGEgdGFnLiBJZiB3ZSBoYWQgc3RhcnRlZCBhIHJhdy10ZXh0IGVsZW1lbnQsIHVzZSB0aGF0XG4gICAgICAgICAgLy8gcmVnZXhcbiAgICAgICAgICByZWdleCA9IHJhd1RleHRFbmRSZWdleCA/PyB0ZXh0RW5kUmVnZXg7XG4gICAgICAgICAgLy8gV2UgbWF5IGJlIGVuZGluZyBhbiB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUsIHNvIG1ha2Ugc3VyZSB3ZVxuICAgICAgICAgIC8vIGNsZWFyIGFueSBwZW5kaW5nIGF0dHJOYW1lRW5kSW5kZXhcbiAgICAgICAgICBhdHRyTmFtZUVuZEluZGV4ID0gLTE7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbQVRUUklCVVRFX05BTUVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBBdHRyaWJ1dGUgbmFtZSBwb3NpdGlvblxuICAgICAgICAgIGF0dHJOYW1lRW5kSW5kZXggPSAtMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhdHRyTmFtZUVuZEluZGV4ID0gcmVnZXgubGFzdEluZGV4IC0gbWF0Y2hbU1BBQ0VTX0FORF9FUVVBTFNdLmxlbmd0aDtcbiAgICAgICAgICBhdHRyTmFtZSA9IG1hdGNoW0FUVFJJQlVURV9OQU1FXTtcbiAgICAgICAgICByZWdleCA9XG4gICAgICAgICAgICBtYXRjaFtRVU9URV9DSEFSXSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgID8gdGFnRW5kUmVnZXhcbiAgICAgICAgICAgICAgOiBtYXRjaFtRVU9URV9DSEFSXSA9PT0gJ1wiJ1xuICAgICAgICAgICAgICAgID8gZG91YmxlUXVvdGVBdHRyRW5kUmVnZXhcbiAgICAgICAgICAgICAgICA6IHNpbmdsZVF1b3RlQXR0ckVuZFJlZ2V4O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICByZWdleCA9PT0gZG91YmxlUXVvdGVBdHRyRW5kUmVnZXggfHxcbiAgICAgICAgcmVnZXggPT09IHNpbmdsZVF1b3RlQXR0ckVuZFJlZ2V4XG4gICAgICApIHtcbiAgICAgICAgcmVnZXggPSB0YWdFbmRSZWdleDtcbiAgICAgIH0gZWxzZSBpZiAocmVnZXggPT09IGNvbW1lbnRFbmRSZWdleCB8fCByZWdleCA9PT0gY29tbWVudDJFbmRSZWdleCkge1xuICAgICAgICByZWdleCA9IHRleHRFbmRSZWdleDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE5vdCBvbmUgb2YgdGhlIGZpdmUgc3RhdGUgcmVnZXhlcywgc28gaXQgbXVzdCBiZSB0aGUgZHluYW1pY2FsbHlcbiAgICAgICAgLy8gY3JlYXRlZCByYXcgdGV4dCByZWdleCBhbmQgd2UncmUgYXQgdGhlIGNsb3NlIG9mIHRoYXQgZWxlbWVudC5cbiAgICAgICAgcmVnZXggPSB0YWdFbmRSZWdleDtcbiAgICAgICAgcmF3VGV4dEVuZFJlZ2V4ID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgLy8gSWYgd2UgaGF2ZSBhIGF0dHJOYW1lRW5kSW5kZXgsIHdoaWNoIGluZGljYXRlcyB0aGF0IHdlIHNob3VsZFxuICAgICAgLy8gcmV3cml0ZSB0aGUgYXR0cmlidXRlIG5hbWUsIGFzc2VydCB0aGF0IHdlJ3JlIGluIGEgdmFsaWQgYXR0cmlidXRlXG4gICAgICAvLyBwb3NpdGlvbiAtIGVpdGhlciBpbiBhIHRhZywgb3IgYSBxdW90ZWQgYXR0cmlidXRlIHZhbHVlLlxuICAgICAgY29uc29sZS5hc3NlcnQoXG4gICAgICAgIGF0dHJOYW1lRW5kSW5kZXggPT09IC0xIHx8XG4gICAgICAgICAgcmVnZXggPT09IHRhZ0VuZFJlZ2V4IHx8XG4gICAgICAgICAgcmVnZXggPT09IHNpbmdsZVF1b3RlQXR0ckVuZFJlZ2V4IHx8XG4gICAgICAgICAgcmVnZXggPT09IGRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4LFxuICAgICAgICAndW5leHBlY3RlZCBwYXJzZSBzdGF0ZSBCJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBXZSBoYXZlIGZvdXIgY2FzZXM6XG4gICAgLy8gIDEuIFdlJ3JlIGluIHRleHQgcG9zaXRpb24sIGFuZCBub3QgaW4gYSByYXcgdGV4dCBlbGVtZW50XG4gICAgLy8gICAgIChyZWdleCA9PT0gdGV4dEVuZFJlZ2V4KTogaW5zZXJ0IGEgY29tbWVudCBtYXJrZXIuXG4gICAgLy8gIDIuIFdlIGhhdmUgYSBub24tbmVnYXRpdmUgYXR0ck5hbWVFbmRJbmRleCB3aGljaCBtZWFucyB3ZSBuZWVkIHRvXG4gICAgLy8gICAgIHJld3JpdGUgdGhlIGF0dHJpYnV0ZSBuYW1lIHRvIGFkZCBhIGJvdW5kIGF0dHJpYnV0ZSBzdWZmaXguXG4gICAgLy8gIDMuIFdlJ3JlIGF0IHRoZSBub24tZmlyc3QgYmluZGluZyBpbiBhIG11bHRpLWJpbmRpbmcgYXR0cmlidXRlLCB1c2UgYVxuICAgIC8vICAgICBwbGFpbiBtYXJrZXIuXG4gICAgLy8gIDQuIFdlJ3JlIHNvbWV3aGVyZSBlbHNlIGluc2lkZSB0aGUgdGFnLiBJZiB3ZSdyZSBpbiBhdHRyaWJ1dGUgbmFtZVxuICAgIC8vICAgICBwb3NpdGlvbiAoYXR0ck5hbWVFbmRJbmRleCA9PT0gLTIpLCBhZGQgYSBzZXF1ZW50aWFsIHN1ZmZpeCB0b1xuICAgIC8vICAgICBnZW5lcmF0ZSBhIHVuaXF1ZSBhdHRyaWJ1dGUgbmFtZS5cblxuICAgIC8vIERldGVjdCBhIGJpbmRpbmcgbmV4dCB0byBzZWxmLWNsb3NpbmcgdGFnIGVuZCBhbmQgaW5zZXJ0IGEgc3BhY2UgdG9cbiAgICAvLyBzZXBhcmF0ZSB0aGUgbWFya2VyIGZyb20gdGhlIHRhZyBlbmQ6XG4gICAgY29uc3QgZW5kID1cbiAgICAgIHJlZ2V4ID09PSB0YWdFbmRSZWdleCAmJiBzdHJpbmdzW2kgKyAxXS5zdGFydHNXaXRoKCcvPicpID8gJyAnIDogJyc7XG4gICAgaHRtbCArPVxuICAgICAgcmVnZXggPT09IHRleHRFbmRSZWdleFxuICAgICAgICA/IHMgKyBub2RlTWFya2VyXG4gICAgICAgIDogYXR0ck5hbWVFbmRJbmRleCA+PSAwXG4gICAgICAgICAgPyAoYXR0ck5hbWVzLnB1c2goYXR0ck5hbWUhKSxcbiAgICAgICAgICAgIHMuc2xpY2UoMCwgYXR0ck5hbWVFbmRJbmRleCkgK1xuICAgICAgICAgICAgICBib3VuZEF0dHJpYnV0ZVN1ZmZpeCArXG4gICAgICAgICAgICAgIHMuc2xpY2UoYXR0ck5hbWVFbmRJbmRleCkpICtcbiAgICAgICAgICAgIG1hcmtlciArXG4gICAgICAgICAgICBlbmRcbiAgICAgICAgICA6IHMgKyBtYXJrZXIgKyAoYXR0ck5hbWVFbmRJbmRleCA9PT0gLTIgPyBpIDogZW5kKTtcbiAgfVxuXG4gIGNvbnN0IGh0bWxSZXN1bHQ6IHN0cmluZyB8IFRydXN0ZWRIVE1MID1cbiAgICBodG1sICtcbiAgICAoc3RyaW5nc1tsXSB8fCAnPD8+JykgK1xuICAgICh0eXBlID09PSBTVkdfUkVTVUxUID8gJzwvc3ZnPicgOiB0eXBlID09PSBNQVRITUxfUkVTVUxUID8gJzwvbWF0aD4nIDogJycpO1xuXG4gIC8vIFJldHVybmVkIGFzIGFuIGFycmF5IGZvciB0ZXJzZW5lc3NcbiAgcmV0dXJuIFt0cnVzdEZyb21UZW1wbGF0ZVN0cmluZyhzdHJpbmdzLCBodG1sUmVzdWx0KSwgYXR0ck5hbWVzXTtcbn07XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCB0eXBlIHtUZW1wbGF0ZX07XG5jbGFzcyBUZW1wbGF0ZSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgZWwhOiBIVE1MVGVtcGxhdGVFbGVtZW50O1xuXG4gIHBhcnRzOiBBcnJheTxUZW1wbGF0ZVBhcnQ+ID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICB7c3RyaW5ncywgWydfJGxpdFR5cGUkJ106IHR5cGV9OiBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQsXG4gICAgb3B0aW9ucz86IFJlbmRlck9wdGlvbnNcbiAgKSB7XG4gICAgbGV0IG5vZGU6IE5vZGUgfCBudWxsO1xuICAgIGxldCBub2RlSW5kZXggPSAwO1xuICAgIGxldCBhdHRyTmFtZUluZGV4ID0gMDtcbiAgICBjb25zdCBwYXJ0Q291bnQgPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgY29uc3QgcGFydHMgPSB0aGlzLnBhcnRzO1xuXG4gICAgLy8gQ3JlYXRlIHRlbXBsYXRlIGVsZW1lbnRcbiAgICBjb25zdCBbaHRtbCwgYXR0ck5hbWVzXSA9IGdldFRlbXBsYXRlSHRtbChzdHJpbmdzLCB0eXBlKTtcbiAgICB0aGlzLmVsID0gVGVtcGxhdGUuY3JlYXRlRWxlbWVudChodG1sLCBvcHRpb25zKTtcbiAgICB3YWxrZXIuY3VycmVudE5vZGUgPSB0aGlzLmVsLmNvbnRlbnQ7XG5cbiAgICAvLyBSZS1wYXJlbnQgU1ZHIG9yIE1hdGhNTCBub2RlcyBpbnRvIHRlbXBsYXRlIHJvb3RcbiAgICBpZiAodHlwZSA9PT0gU1ZHX1JFU1VMVCB8fCB0eXBlID09PSBNQVRITUxfUkVTVUxUKSB7XG4gICAgICBjb25zdCB3cmFwcGVyID0gdGhpcy5lbC5jb250ZW50LmZpcnN0Q2hpbGQhO1xuICAgICAgd3JhcHBlci5yZXBsYWNlV2l0aCguLi53cmFwcGVyLmNoaWxkTm9kZXMpO1xuICAgIH1cblxuICAgIC8vIFdhbGsgdGhlIHRlbXBsYXRlIHRvIGZpbmQgYmluZGluZyBtYXJrZXJzIGFuZCBjcmVhdGUgVGVtcGxhdGVQYXJ0c1xuICAgIHdoaWxlICgobm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpKSAhPT0gbnVsbCAmJiBwYXJ0cy5sZW5ndGggPCBwYXJ0Q291bnQpIHtcbiAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgICAgIGNvbnN0IHRhZyA9IChub2RlIGFzIEVsZW1lbnQpLmxvY2FsTmFtZTtcbiAgICAgICAgICAvLyBXYXJuIGlmIGB0ZXh0YXJlYWAgaW5jbHVkZXMgYW4gZXhwcmVzc2lvbiBhbmQgdGhyb3cgaWYgYHRlbXBsYXRlYFxuICAgICAgICAgIC8vIGRvZXMgc2luY2UgdGhlc2UgYXJlIG5vdCBzdXBwb3J0ZWQuIFdlIGRvIHRoaXMgYnkgY2hlY2tpbmdcbiAgICAgICAgICAvLyBpbm5lckhUTUwgZm9yIGFueXRoaW5nIHRoYXQgbG9va3MgbGlrZSBhIG1hcmtlci4gVGhpcyBjYXRjaGVzXG4gICAgICAgICAgLy8gY2FzZXMgbGlrZSBiaW5kaW5ncyBpbiB0ZXh0YXJlYSB0aGVyZSBtYXJrZXJzIHR1cm4gaW50byB0ZXh0IG5vZGVzLlxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIC9eKD86dGV4dGFyZWF8dGVtcGxhdGUpJC9pIS50ZXN0KHRhZykgJiZcbiAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLmlubmVySFRNTC5pbmNsdWRlcyhtYXJrZXIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBjb25zdCBtID1cbiAgICAgICAgICAgICAgYEV4cHJlc3Npb25zIGFyZSBub3Qgc3VwcG9ydGVkIGluc2lkZSBcXGAke3RhZ31cXGAgYCArXG4gICAgICAgICAgICAgIGBlbGVtZW50cy4gU2VlIGh0dHBzOi8vbGl0LmRldi9tc2cvZXhwcmVzc2lvbi1pbi0ke3RhZ30gZm9yIG1vcmUgYCArXG4gICAgICAgICAgICAgIGBpbmZvcm1hdGlvbi5gO1xuICAgICAgICAgICAgaWYgKHRhZyA9PT0gJ3RlbXBsYXRlJykge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobSk7XG4gICAgICAgICAgICB9IGVsc2UgaXNzdWVXYXJuaW5nKCcnLCBtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyAoanVzdGluZmFnbmFuaSk6IGZvciBhdHRlbXB0ZWQgZHluYW1pYyB0YWcgbmFtZXMsIHdlIGRvbid0XG4gICAgICAgIC8vIGluY3JlbWVudCB0aGUgYmluZGluZ0luZGV4LCBhbmQgaXQnbGwgYmUgb2ZmIGJ5IDEgaW4gdGhlIGVsZW1lbnRcbiAgICAgICAgLy8gYW5kIG9mZiBieSB0d28gYWZ0ZXIgaXQuXG4gICAgICAgIGlmICgobm9kZSBhcyBFbGVtZW50KS5oYXNBdHRyaWJ1dGVzKCkpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgKG5vZGUgYXMgRWxlbWVudCkuZ2V0QXR0cmlidXRlTmFtZXMoKSkge1xuICAgICAgICAgICAgaWYgKG5hbWUuZW5kc1dpdGgoYm91bmRBdHRyaWJ1dGVTdWZmaXgpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHJlYWxOYW1lID0gYXR0ck5hbWVzW2F0dHJOYW1lSW5kZXgrK107XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gKG5vZGUgYXMgRWxlbWVudCkuZ2V0QXR0cmlidXRlKG5hbWUpITtcbiAgICAgICAgICAgICAgY29uc3Qgc3RhdGljcyA9IHZhbHVlLnNwbGl0KG1hcmtlcik7XG4gICAgICAgICAgICAgIGNvbnN0IG0gPSAvKFsuP0BdKT8oLiopLy5leGVjKHJlYWxOYW1lKSE7XG4gICAgICAgICAgICAgIHBhcnRzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IEFUVFJJQlVURV9QQVJULFxuICAgICAgICAgICAgICAgIGluZGV4OiBub2RlSW5kZXgsXG4gICAgICAgICAgICAgICAgbmFtZTogbVsyXSxcbiAgICAgICAgICAgICAgICBzdHJpbmdzOiBzdGF0aWNzLFxuICAgICAgICAgICAgICAgIGN0b3I6XG4gICAgICAgICAgICAgICAgICBtWzFdID09PSAnLidcbiAgICAgICAgICAgICAgICAgICAgPyBQcm9wZXJ0eVBhcnRcbiAgICAgICAgICAgICAgICAgICAgOiBtWzFdID09PSAnPydcbiAgICAgICAgICAgICAgICAgICAgICA/IEJvb2xlYW5BdHRyaWJ1dGVQYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgOiBtWzFdID09PSAnQCdcbiAgICAgICAgICAgICAgICAgICAgICAgID8gRXZlbnRQYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICA6IEF0dHJpYnV0ZVBhcnQsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5hbWUuc3RhcnRzV2l0aChtYXJrZXIpKSB7XG4gICAgICAgICAgICAgIHBhcnRzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IEVMRU1FTlRfUEFSVCxcbiAgICAgICAgICAgICAgICBpbmRleDogbm9kZUluZGV4LFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPIChqdXN0aW5mYWduYW5pKTogYmVuY2htYXJrIHRoZSByZWdleCBhZ2FpbnN0IHRlc3RpbmcgZm9yIGVhY2hcbiAgICAgICAgLy8gb2YgdGhlIDMgcmF3IHRleHQgZWxlbWVudCBuYW1lcy5cbiAgICAgICAgaWYgKHJhd1RleHRFbGVtZW50LnRlc3QoKG5vZGUgYXMgRWxlbWVudCkudGFnTmFtZSkpIHtcbiAgICAgICAgICAvLyBGb3IgcmF3IHRleHQgZWxlbWVudHMgd2UgbmVlZCB0byBzcGxpdCB0aGUgdGV4dCBjb250ZW50IG9uXG4gICAgICAgICAgLy8gbWFya2VycywgY3JlYXRlIGEgVGV4dCBub2RlIGZvciBlYWNoIHNlZ21lbnQsIGFuZCBjcmVhdGVcbiAgICAgICAgICAvLyBhIFRlbXBsYXRlUGFydCBmb3IgZWFjaCBtYXJrZXIuXG4gICAgICAgICAgY29uc3Qgc3RyaW5ncyA9IChub2RlIGFzIEVsZW1lbnQpLnRleHRDb250ZW50IS5zcGxpdChtYXJrZXIpO1xuICAgICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgICBpZiAobGFzdEluZGV4ID4gMCkge1xuICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkudGV4dENvbnRlbnQgPSB0cnVzdGVkVHlwZXNcbiAgICAgICAgICAgICAgPyAodHJ1c3RlZFR5cGVzLmVtcHR5U2NyaXB0IGFzIHVua25vd24gYXMgJycpXG4gICAgICAgICAgICAgIDogJyc7XG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIG5ldyB0ZXh0IG5vZGUgZm9yIGVhY2ggbGl0ZXJhbCBzZWN0aW9uXG4gICAgICAgICAgICAvLyBUaGVzZSBub2RlcyBhcmUgYWxzbyB1c2VkIGFzIHRoZSBtYXJrZXJzIGZvciBub2RlIHBhcnRzXG4gICAgICAgICAgICAvLyBXZSBjYW4ndCB1c2UgZW1wdHkgdGV4dCBub2RlcyBhcyBtYXJrZXJzIGJlY2F1c2UgdGhleSdyZVxuICAgICAgICAgICAgLy8gbm9ybWFsaXplZCB3aGVuIGNsb25pbmcgaW4gSUUgKGNvdWxkIHNpbXBsaWZ5IHdoZW5cbiAgICAgICAgICAgIC8vIElFIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQpXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhc3RJbmRleDsgaSsrKSB7XG4gICAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLmFwcGVuZChzdHJpbmdzW2ldLCBjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgICAgICAgIC8vIFdhbGsgcGFzdCB0aGUgbWFya2VyIG5vZGUgd2UganVzdCBhZGRlZFxuICAgICAgICAgICAgICB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgICAgcGFydHMucHVzaCh7dHlwZTogQ0hJTERfUEFSVCwgaW5kZXg6ICsrbm9kZUluZGV4fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBOb3RlIGJlY2F1c2UgdGhpcyBtYXJrZXIgaXMgYWRkZWQgYWZ0ZXIgdGhlIHdhbGtlcidzIGN1cnJlbnRcbiAgICAgICAgICAgIC8vIG5vZGUsIGl0IHdpbGwgYmUgd2Fsa2VkIHRvIGluIHRoZSBvdXRlciBsb29wIChhbmQgaWdub3JlZCksIHNvXG4gICAgICAgICAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIGFkanVzdCBub2RlSW5kZXggaGVyZVxuICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkuYXBwZW5kKHN0cmluZ3NbbGFzdEluZGV4XSwgY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSA4KSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSAobm9kZSBhcyBDb21tZW50KS5kYXRhO1xuICAgICAgICBpZiAoZGF0YSA9PT0gbWFya2VyTWF0Y2gpIHtcbiAgICAgICAgICBwYXJ0cy5wdXNoKHt0eXBlOiBDSElMRF9QQVJULCBpbmRleDogbm9kZUluZGV4fSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IGkgPSAtMTtcbiAgICAgICAgICB3aGlsZSAoKGkgPSAobm9kZSBhcyBDb21tZW50KS5kYXRhLmluZGV4T2YobWFya2VyLCBpICsgMSkpICE9PSAtMSkge1xuICAgICAgICAgICAgLy8gQ29tbWVudCBub2RlIGhhcyBhIGJpbmRpbmcgbWFya2VyIGluc2lkZSwgbWFrZSBhbiBpbmFjdGl2ZSBwYXJ0XG4gICAgICAgICAgICAvLyBUaGUgYmluZGluZyB3b24ndCB3b3JrLCBidXQgc3Vic2VxdWVudCBiaW5kaW5ncyB3aWxsXG4gICAgICAgICAgICBwYXJ0cy5wdXNoKHt0eXBlOiBDT01NRU5UX1BBUlQsIGluZGV4OiBub2RlSW5kZXh9KTtcbiAgICAgICAgICAgIC8vIE1vdmUgdG8gdGhlIGVuZCBvZiB0aGUgbWF0Y2hcbiAgICAgICAgICAgIGkgKz0gbWFya2VyLmxlbmd0aCAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBub2RlSW5kZXgrKztcbiAgICB9XG5cbiAgICBpZiAoREVWX01PREUpIHtcbiAgICAgIC8vIElmIHRoZXJlIHdhcyBhIGR1cGxpY2F0ZSBhdHRyaWJ1dGUgb24gYSB0YWcsIHRoZW4gd2hlbiB0aGUgdGFnIGlzXG4gICAgICAvLyBwYXJzZWQgaW50byBhbiBlbGVtZW50IHRoZSBhdHRyaWJ1dGUgZ2V0cyBkZS1kdXBsaWNhdGVkLiBXZSBjYW4gZGV0ZWN0XG4gICAgICAvLyB0aGlzIG1pc21hdGNoIGlmIHdlIGhhdmVuJ3QgcHJlY2lzZWx5IGNvbnN1bWVkIGV2ZXJ5IGF0dHJpYnV0ZSBuYW1lXG4gICAgICAvLyB3aGVuIHByZXBhcmluZyB0aGUgdGVtcGxhdGUuIFRoaXMgd29ya3MgYmVjYXVzZSBgYXR0ck5hbWVzYCBpcyBidWlsdFxuICAgICAgLy8gZnJvbSB0aGUgdGVtcGxhdGUgc3RyaW5nIGFuZCBgYXR0ck5hbWVJbmRleGAgY29tZXMgZnJvbSBwcm9jZXNzaW5nIHRoZVxuICAgICAgLy8gcmVzdWx0aW5nIERPTS5cbiAgICAgIGlmIChhdHRyTmFtZXMubGVuZ3RoICE9PSBhdHRyTmFtZUluZGV4KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRGV0ZWN0ZWQgZHVwbGljYXRlIGF0dHJpYnV0ZSBiaW5kaW5ncy4gVGhpcyBvY2N1cnMgaWYgeW91ciB0ZW1wbGF0ZSBgICtcbiAgICAgICAgICAgIGBoYXMgZHVwbGljYXRlIGF0dHJpYnV0ZXMgb24gYW4gZWxlbWVudCB0YWcuIEZvciBleGFtcGxlIGAgK1xuICAgICAgICAgICAgYFwiPGlucHV0ID9kaXNhYmxlZD1cXCR7dHJ1ZX0gP2Rpc2FibGVkPVxcJHtmYWxzZX0+XCIgY29udGFpbnMgYSBgICtcbiAgICAgICAgICAgIGBkdXBsaWNhdGUgXCJkaXNhYmxlZFwiIGF0dHJpYnV0ZS4gVGhlIGVycm9yIHdhcyBkZXRlY3RlZCBpbiBgICtcbiAgICAgICAgICAgIGB0aGUgZm9sbG93aW5nIHRlbXBsYXRlOiBcXG5gICtcbiAgICAgICAgICAgICdgJyArXG4gICAgICAgICAgICBzdHJpbmdzLmpvaW4oJyR7Li4ufScpICtcbiAgICAgICAgICAgICdgJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdlIGNvdWxkIHNldCB3YWxrZXIuY3VycmVudE5vZGUgdG8gYW5vdGhlciBub2RlIGhlcmUgdG8gcHJldmVudCBhIG1lbW9yeVxuICAgIC8vIGxlYWssIGJ1dCBldmVyeSB0aW1lIHdlIHByZXBhcmUgYSB0ZW1wbGF0ZSwgd2UgaW1tZWRpYXRlbHkgcmVuZGVyIGl0XG4gICAgLy8gYW5kIHJlLXVzZSB0aGUgd2Fsa2VyIGluIG5ldyBUZW1wbGF0ZUluc3RhbmNlLl9jbG9uZSgpLlxuICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICBraW5kOiAndGVtcGxhdGUgcHJlcCcsXG4gICAgICAgIHRlbXBsYXRlOiB0aGlzLFxuICAgICAgICBjbG9uYWJsZVRlbXBsYXRlOiB0aGlzLmVsLFxuICAgICAgICBwYXJ0czogdGhpcy5wYXJ0cyxcbiAgICAgICAgc3RyaW5ncyxcbiAgICAgIH0pO1xuICB9XG5cbiAgLy8gT3ZlcnJpZGRlbiB2aWEgYGxpdEh0bWxQb2x5ZmlsbFN1cHBvcnRgIHRvIHByb3ZpZGUgcGxhdGZvcm0gc3VwcG9ydC5cbiAgLyoqIEBub2NvbGxhcHNlICovXG4gIHN0YXRpYyBjcmVhdGVFbGVtZW50KGh0bWw6IFRydXN0ZWRIVE1MLCBfb3B0aW9ucz86IFJlbmRlck9wdGlvbnMpIHtcbiAgICBjb25zdCBlbCA9IGQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICBlbC5pbm5lckhUTUwgPSBodG1sIGFzIHVua25vd24gYXMgc3RyaW5nO1xuICAgIHJldHVybiBlbDtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERpc2Nvbm5lY3RhYmxlIHtcbiAgXyRwYXJlbnQ/OiBEaXNjb25uZWN0YWJsZTtcbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPjtcbiAgLy8gUmF0aGVyIHRoYW4gaG9sZCBjb25uZWN0aW9uIHN0YXRlIG9uIGluc3RhbmNlcywgRGlzY29ubmVjdGFibGVzIHJlY3Vyc2l2ZWx5XG4gIC8vIGZldGNoIHRoZSBjb25uZWN0aW9uIHN0YXRlIGZyb20gdGhlIFJvb3RQYXJ0IHRoZXkgYXJlIGNvbm5lY3RlZCBpbiB2aWFcbiAgLy8gZ2V0dGVycyB1cCB0aGUgRGlzY29ubmVjdGFibGUgdHJlZSB2aWEgXyRwYXJlbnQgcmVmZXJlbmNlcy4gVGhpcyBwdXNoZXMgdGhlXG4gIC8vIGNvc3Qgb2YgdHJhY2tpbmcgdGhlIGlzQ29ubmVjdGVkIHN0YXRlIHRvIGBBc3luY0RpcmVjdGl2ZXNgLCBhbmQgYXZvaWRzXG4gIC8vIG5lZWRpbmcgdG8gcGFzcyBhbGwgRGlzY29ubmVjdGFibGVzIChwYXJ0cywgdGVtcGxhdGUgaW5zdGFuY2VzLCBhbmRcbiAgLy8gZGlyZWN0aXZlcykgdGhlaXIgY29ubmVjdGlvbiBzdGF0ZSBlYWNoIHRpbWUgaXQgY2hhbmdlcywgd2hpY2ggd291bGQgYmVcbiAgLy8gY29zdGx5IGZvciB0cmVlcyB0aGF0IGhhdmUgbm8gQXN5bmNEaXJlY3RpdmVzLlxuICBfJGlzQ29ubmVjdGVkOiBib29sZWFuO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlRGlyZWN0aXZlKFxuICBwYXJ0OiBDaGlsZFBhcnQgfCBBdHRyaWJ1dGVQYXJ0IHwgRWxlbWVudFBhcnQsXG4gIHZhbHVlOiB1bmtub3duLFxuICBwYXJlbnQ6IERpcmVjdGl2ZVBhcmVudCA9IHBhcnQsXG4gIGF0dHJpYnV0ZUluZGV4PzogbnVtYmVyXG4pOiB1bmtub3duIHtcbiAgLy8gQmFpbCBlYXJseSBpZiB0aGUgdmFsdWUgaXMgZXhwbGljaXRseSBub0NoYW5nZS4gTm90ZSwgdGhpcyBtZWFucyBhbnlcbiAgLy8gbmVzdGVkIGRpcmVjdGl2ZSBpcyBzdGlsbCBhdHRhY2hlZCBhbmQgaXMgbm90IHJ1bi5cbiAgaWYgKHZhbHVlID09PSBub0NoYW5nZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBsZXQgY3VycmVudERpcmVjdGl2ZSA9XG4gICAgYXR0cmlidXRlSW5kZXggIT09IHVuZGVmaW5lZFxuICAgICAgPyAocGFyZW50IGFzIEF0dHJpYnV0ZVBhcnQpLl9fZGlyZWN0aXZlcz8uW2F0dHJpYnV0ZUluZGV4XVxuICAgICAgOiAocGFyZW50IGFzIENoaWxkUGFydCB8IEVsZW1lbnRQYXJ0IHwgRGlyZWN0aXZlKS5fX2RpcmVjdGl2ZTtcbiAgY29uc3QgbmV4dERpcmVjdGl2ZUNvbnN0cnVjdG9yID0gaXNQcmltaXRpdmUodmFsdWUpXG4gICAgPyB1bmRlZmluZWRcbiAgICA6IC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgICAodmFsdWUgYXMgRGlyZWN0aXZlUmVzdWx0KVsnXyRsaXREaXJlY3RpdmUkJ107XG4gIGlmIChjdXJyZW50RGlyZWN0aXZlPy5jb25zdHJ1Y3RvciAhPT0gbmV4dERpcmVjdGl2ZUNvbnN0cnVjdG9yKSB7XG4gICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICBjdXJyZW50RGlyZWN0aXZlPy5bJ18kbm90aWZ5RGlyZWN0aXZlQ29ubmVjdGlvbkNoYW5nZWQnXT8uKGZhbHNlKTtcbiAgICBpZiAobmV4dERpcmVjdGl2ZUNvbnN0cnVjdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGN1cnJlbnREaXJlY3RpdmUgPSB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnREaXJlY3RpdmUgPSBuZXcgbmV4dERpcmVjdGl2ZUNvbnN0cnVjdG9yKHBhcnQgYXMgUGFydEluZm8pO1xuICAgICAgY3VycmVudERpcmVjdGl2ZS5fJGluaXRpYWxpemUocGFydCwgcGFyZW50LCBhdHRyaWJ1dGVJbmRleCk7XG4gICAgfVxuICAgIGlmIChhdHRyaWJ1dGVJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAoKHBhcmVudCBhcyBBdHRyaWJ1dGVQYXJ0KS5fX2RpcmVjdGl2ZXMgPz89IFtdKVthdHRyaWJ1dGVJbmRleF0gPVxuICAgICAgICBjdXJyZW50RGlyZWN0aXZlO1xuICAgIH0gZWxzZSB7XG4gICAgICAocGFyZW50IGFzIENoaWxkUGFydCB8IERpcmVjdGl2ZSkuX19kaXJlY3RpdmUgPSBjdXJyZW50RGlyZWN0aXZlO1xuICAgIH1cbiAgfVxuICBpZiAoY3VycmVudERpcmVjdGl2ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFsdWUgPSByZXNvbHZlRGlyZWN0aXZlKFxuICAgICAgcGFydCxcbiAgICAgIGN1cnJlbnREaXJlY3RpdmUuXyRyZXNvbHZlKHBhcnQsICh2YWx1ZSBhcyBEaXJlY3RpdmVSZXN1bHQpLnZhbHVlcyksXG4gICAgICBjdXJyZW50RGlyZWN0aXZlLFxuICAgICAgYXR0cmlidXRlSW5kZXhcbiAgICApO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IHR5cGUge1RlbXBsYXRlSW5zdGFuY2V9O1xuLyoqXG4gKiBBbiB1cGRhdGVhYmxlIGluc3RhbmNlIG9mIGEgVGVtcGxhdGUuIEhvbGRzIHJlZmVyZW5jZXMgdG8gdGhlIFBhcnRzIHVzZWQgdG9cbiAqIHVwZGF0ZSB0aGUgdGVtcGxhdGUgaW5zdGFuY2UuXG4gKi9cbmNsYXNzIFRlbXBsYXRlSW5zdGFuY2UgaW1wbGVtZW50cyBEaXNjb25uZWN0YWJsZSB7XG4gIF8kdGVtcGxhdGU6IFRlbXBsYXRlO1xuICBfJHBhcnRzOiBBcnJheTxQYXJ0IHwgdW5kZWZpbmVkPiA9IFtdO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRwYXJlbnQ6IENoaWxkUGFydDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+ID0gdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKHRlbXBsYXRlOiBUZW1wbGF0ZSwgcGFyZW50OiBDaGlsZFBhcnQpIHtcbiAgICB0aGlzLl8kdGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICB0aGlzLl8kcGFyZW50ID0gcGFyZW50O1xuICB9XG5cbiAgLy8gQ2FsbGVkIGJ5IENoaWxkUGFydCBwYXJlbnROb2RlIGdldHRlclxuICBnZXQgcGFyZW50Tm9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fJHBhcmVudC5wYXJlbnROb2RlO1xuICB9XG5cbiAgLy8gU2VlIGNvbW1lbnQgaW4gRGlzY29ubmVjdGFibGUgaW50ZXJmYWNlIGZvciB3aHkgdGhpcyBpcyBhIGdldHRlclxuICBnZXQgXyRpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fJHBhcmVudC5fJGlzQ29ubmVjdGVkO1xuICB9XG5cbiAgLy8gVGhpcyBtZXRob2QgaXMgc2VwYXJhdGUgZnJvbSB0aGUgY29uc3RydWN0b3IgYmVjYXVzZSB3ZSBuZWVkIHRvIHJldHVybiBhXG4gIC8vIERvY3VtZW50RnJhZ21lbnQgYW5kIHdlIGRvbid0IHdhbnQgdG8gaG9sZCBvbnRvIGl0IHdpdGggYW4gaW5zdGFuY2UgZmllbGQuXG4gIF9jbG9uZShvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qge1xuICAgICAgZWw6IHtjb250ZW50fSxcbiAgICAgIHBhcnRzOiBwYXJ0cyxcbiAgICB9ID0gdGhpcy5fJHRlbXBsYXRlO1xuICAgIGNvbnN0IGZyYWdtZW50ID0gKG9wdGlvbnM/LmNyZWF0aW9uU2NvcGUgPz8gZCkuaW1wb3J0Tm9kZShjb250ZW50LCB0cnVlKTtcbiAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBmcmFnbWVudDtcblxuICAgIGxldCBub2RlID0gd2Fsa2VyLm5leHROb2RlKCkhO1xuICAgIGxldCBub2RlSW5kZXggPSAwO1xuICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgIGxldCB0ZW1wbGF0ZVBhcnQgPSBwYXJ0c1swXTtcblxuICAgIHdoaWxlICh0ZW1wbGF0ZVBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKG5vZGVJbmRleCA9PT0gdGVtcGxhdGVQYXJ0LmluZGV4KSB7XG4gICAgICAgIGxldCBwYXJ0OiBQYXJ0IHwgdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGVtcGxhdGVQYXJ0LnR5cGUgPT09IENISUxEX1BBUlQpIHtcbiAgICAgICAgICBwYXJ0ID0gbmV3IENoaWxkUGFydChcbiAgICAgICAgICAgIG5vZGUgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgICBub2RlLm5leHRTaWJsaW5nLFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRlbXBsYXRlUGFydC50eXBlID09PSBBVFRSSUJVVEVfUEFSVCkge1xuICAgICAgICAgIHBhcnQgPSBuZXcgdGVtcGxhdGVQYXJ0LmN0b3IoXG4gICAgICAgICAgICBub2RlIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgICAgdGVtcGxhdGVQYXJ0Lm5hbWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVBhcnQuc3RyaW5ncyxcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBvcHRpb25zXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0ZW1wbGF0ZVBhcnQudHlwZSA9PT0gRUxFTUVOVF9QQVJUKSB7XG4gICAgICAgICAgcGFydCA9IG5ldyBFbGVtZW50UGFydChub2RlIGFzIEhUTUxFbGVtZW50LCB0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl8kcGFydHMucHVzaChwYXJ0KTtcbiAgICAgICAgdGVtcGxhdGVQYXJ0ID0gcGFydHNbKytwYXJ0SW5kZXhdO1xuICAgICAgfVxuICAgICAgaWYgKG5vZGVJbmRleCAhPT0gdGVtcGxhdGVQYXJ0Py5pbmRleCkge1xuICAgICAgICBub2RlID0gd2Fsa2VyLm5leHROb2RlKCkhO1xuICAgICAgICBub2RlSW5kZXgrKztcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gV2UgbmVlZCB0byBzZXQgdGhlIGN1cnJlbnROb2RlIGF3YXkgZnJvbSB0aGUgY2xvbmVkIHRyZWUgc28gdGhhdCB3ZVxuICAgIC8vIGRvbid0IGhvbGQgb250byB0aGUgdHJlZSBldmVuIGlmIHRoZSB0cmVlIGlzIGRldGFjaGVkIGFuZCBzaG91bGQgYmVcbiAgICAvLyBmcmVlZC5cbiAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBkO1xuICAgIHJldHVybiBmcmFnbWVudDtcbiAgfVxuXG4gIF91cGRhdGUodmFsdWVzOiBBcnJheTx1bmtub3duPikge1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5fJHBhcnRzKSB7XG4gICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICAgIGtpbmQ6ICdzZXQgcGFydCcsXG4gICAgICAgICAgICBwYXJ0LFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlc1tpXSxcbiAgICAgICAgICAgIHZhbHVlSW5kZXg6IGksXG4gICAgICAgICAgICB2YWx1ZXMsXG4gICAgICAgICAgICB0ZW1wbGF0ZUluc3RhbmNlOiB0aGlzLFxuICAgICAgICAgIH0pO1xuICAgICAgICBpZiAoKHBhcnQgYXMgQXR0cmlidXRlUGFydCkuc3RyaW5ncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgKHBhcnQgYXMgQXR0cmlidXRlUGFydCkuXyRzZXRWYWx1ZSh2YWx1ZXMsIHBhcnQgYXMgQXR0cmlidXRlUGFydCwgaSk7XG4gICAgICAgICAgLy8gVGhlIG51bWJlciBvZiB2YWx1ZXMgdGhlIHBhcnQgY29uc3VtZXMgaXMgcGFydC5zdHJpbmdzLmxlbmd0aCAtIDFcbiAgICAgICAgICAvLyBzaW5jZSB2YWx1ZXMgYXJlIGluIGJldHdlZW4gdGVtcGxhdGUgc3BhbnMuIFdlIGluY3JlbWVudCBpIGJ5IDFcbiAgICAgICAgICAvLyBsYXRlciBpbiB0aGUgbG9vcCwgc28gaW5jcmVtZW50IGl0IGJ5IHBhcnQuc3RyaW5ncy5sZW5ndGggLSAyIGhlcmVcbiAgICAgICAgICBpICs9IChwYXJ0IGFzIEF0dHJpYnV0ZVBhcnQpLnN0cmluZ3MhLmxlbmd0aCAtIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFydC5fJHNldFZhbHVlKHZhbHVlc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gIH1cbn1cblxuLypcbiAqIFBhcnRzXG4gKi9cbnR5cGUgQXR0cmlidXRlVGVtcGxhdGVQYXJ0ID0ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgQVRUUklCVVRFX1BBUlQ7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgY3RvcjogdHlwZW9mIEF0dHJpYnV0ZVBhcnQ7XG4gIHJlYWRvbmx5IHN0cmluZ3M6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPjtcbn07XG50eXBlIENoaWxkVGVtcGxhdGVQYXJ0ID0ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgQ0hJTERfUEFSVDtcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbn07XG50eXBlIEVsZW1lbnRUZW1wbGF0ZVBhcnQgPSB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBFTEVNRU5UX1BBUlQ7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG59O1xudHlwZSBDb21tZW50VGVtcGxhdGVQYXJ0ID0ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgQ09NTUVOVF9QQVJUO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xufTtcblxuLyoqXG4gKiBBIFRlbXBsYXRlUGFydCByZXByZXNlbnRzIGEgZHluYW1pYyBwYXJ0IGluIGEgdGVtcGxhdGUsIGJlZm9yZSB0aGUgdGVtcGxhdGVcbiAqIGlzIGluc3RhbnRpYXRlZC4gV2hlbiBhIHRlbXBsYXRlIGlzIGluc3RhbnRpYXRlZCBQYXJ0cyBhcmUgY3JlYXRlZCBmcm9tXG4gKiBUZW1wbGF0ZVBhcnRzLlxuICovXG50eXBlIFRlbXBsYXRlUGFydCA9XG4gIHwgQ2hpbGRUZW1wbGF0ZVBhcnRcbiAgfCBBdHRyaWJ1dGVUZW1wbGF0ZVBhcnRcbiAgfCBFbGVtZW50VGVtcGxhdGVQYXJ0XG4gIHwgQ29tbWVudFRlbXBsYXRlUGFydDtcblxuZXhwb3J0IHR5cGUgUGFydCA9XG4gIHwgQ2hpbGRQYXJ0XG4gIHwgQXR0cmlidXRlUGFydFxuICB8IFByb3BlcnR5UGFydFxuICB8IEJvb2xlYW5BdHRyaWJ1dGVQYXJ0XG4gIHwgRWxlbWVudFBhcnRcbiAgfCBFdmVudFBhcnQ7XG5cbmV4cG9ydCB0eXBlIHtDaGlsZFBhcnR9O1xuY2xhc3MgQ2hpbGRQYXJ0IGltcGxlbWVudHMgRGlzY29ubmVjdGFibGUge1xuICByZWFkb25seSB0eXBlID0gQ0hJTERfUEFSVDtcbiAgcmVhZG9ubHkgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgXyRjb21taXR0ZWRWYWx1ZTogdW5rbm93biA9IG5vdGhpbmc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX19kaXJlY3RpdmU/OiBEaXJlY3RpdmU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRzdGFydE5vZGU6IENoaWxkTm9kZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGVuZE5vZGU6IENoaWxkTm9kZSB8IG51bGw7XG4gIHByaXZhdGUgX3RleHRTYW5pdGl6ZXI6IFZhbHVlU2FuaXRpemVyIHwgdW5kZWZpbmVkO1xuICAvKiogQGludGVybmFsICovXG4gIF8kcGFyZW50OiBEaXNjb25uZWN0YWJsZSB8IHVuZGVmaW5lZDtcbiAgLyoqXG4gICAqIENvbm5lY3Rpb24gc3RhdGUgZm9yIFJvb3RQYXJ0cyBvbmx5IChpLmUuIENoaWxkUGFydCB3aXRob3V0IF8kcGFyZW50XG4gICAqIHJldHVybmVkIGZyb20gdG9wLWxldmVsIGByZW5kZXJgKS4gVGhpcyBmaWVsZCBpcyB1bnVzZWQgb3RoZXJ3aXNlLiBUaGVcbiAgICogaW50ZW50aW9uIHdvdWxkIGJlIGNsZWFyZXIgaWYgd2UgbWFkZSBgUm9vdFBhcnRgIGEgc3ViY2xhc3Mgb2YgYENoaWxkUGFydGBcbiAgICogd2l0aCB0aGlzIGZpZWxkIChhbmQgYSBkaWZmZXJlbnQgXyRpc0Nvbm5lY3RlZCBnZXR0ZXIpLCBidXQgdGhlIHN1YmNsYXNzXG4gICAqIGNhdXNlZCBhIHBlcmYgcmVncmVzc2lvbiwgcG9zc2libHkgZHVlIHRvIG1ha2luZyBjYWxsIHNpdGVzIHBvbHltb3JwaGljLlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9faXNDb25uZWN0ZWQ6IGJvb2xlYW47XG5cbiAgLy8gU2VlIGNvbW1lbnQgaW4gRGlzY29ubmVjdGFibGUgaW50ZXJmYWNlIGZvciB3aHkgdGhpcyBpcyBhIGdldHRlclxuICBnZXQgXyRpc0Nvbm5lY3RlZCgpIHtcbiAgICAvLyBDaGlsZFBhcnRzIHRoYXQgYXJlIG5vdCBhdCB0aGUgcm9vdCBzaG91bGQgYWx3YXlzIGJlIGNyZWF0ZWQgd2l0aCBhXG4gICAgLy8gcGFyZW50OyBvbmx5IFJvb3RDaGlsZE5vZGUncyB3b24ndCwgc28gdGhleSByZXR1cm4gdGhlIGxvY2FsIGlzQ29ubmVjdGVkXG4gICAgLy8gc3RhdGVcbiAgICByZXR1cm4gdGhpcy5fJHBhcmVudD8uXyRpc0Nvbm5lY3RlZCA/PyB0aGlzLl9faXNDb25uZWN0ZWQ7XG4gIH1cblxuICAvLyBUaGUgZm9sbG93aW5nIGZpZWxkcyB3aWxsIGJlIHBhdGNoZWQgb250byBDaGlsZFBhcnRzIHdoZW4gcmVxdWlyZWQgYnlcbiAgLy8gQXN5bmNEaXJlY3RpdmVcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+ID0gdW5kZWZpbmVkO1xuICAvKiogQGludGVybmFsICovXG4gIF8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQ/KFxuICAgIGlzQ29ubmVjdGVkOiBib29sZWFuLFxuICAgIHJlbW92ZUZyb21QYXJlbnQ/OiBib29sZWFuLFxuICAgIGZyb20/OiBudW1iZXJcbiAgKTogdm9pZDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHJlcGFyZW50RGlzY29ubmVjdGFibGVzPyhwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlKTogdm9pZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzdGFydE5vZGU6IENoaWxkTm9kZSxcbiAgICBlbmROb2RlOiBDaGlsZE5vZGUgfCBudWxsLFxuICAgIHBhcmVudDogVGVtcGxhdGVJbnN0YW5jZSB8IENoaWxkUGFydCB8IHVuZGVmaW5lZCxcbiAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHRoaXMuXyRzdGFydE5vZGUgPSBzdGFydE5vZGU7XG4gICAgdGhpcy5fJGVuZE5vZGUgPSBlbmROb2RlO1xuICAgIHRoaXMuXyRwYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAvLyBOb3RlIF9faXNDb25uZWN0ZWQgaXMgb25seSBldmVyIGFjY2Vzc2VkIG9uIFJvb3RQYXJ0cyAoaS5lLiB3aGVuIHRoZXJlIGlzXG4gICAgLy8gbm8gXyRwYXJlbnQpOyB0aGUgdmFsdWUgb24gYSBub24tcm9vdC1wYXJ0IGlzIFwiZG9uJ3QgY2FyZVwiLCBidXQgY2hlY2tpbmdcbiAgICAvLyBmb3IgcGFyZW50IHdvdWxkIGJlIG1vcmUgY29kZVxuICAgIHRoaXMuX19pc0Nvbm5lY3RlZCA9IG9wdGlvbnM/LmlzQ29ubmVjdGVkID8/IHRydWU7XG4gICAgaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgICAgLy8gRXhwbGljaXRseSBpbml0aWFsaXplIGZvciBjb25zaXN0ZW50IGNsYXNzIHNoYXBlLlxuICAgICAgdGhpcy5fdGV4dFNhbml0aXplciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhlIHBhcmVudCBub2RlIGludG8gd2hpY2ggdGhlIHBhcnQgcmVuZGVycyBpdHMgY29udGVudC5cbiAgICpcbiAgICogQSBDaGlsZFBhcnQncyBjb250ZW50IGNvbnNpc3RzIG9mIGEgcmFuZ2Ugb2YgYWRqYWNlbnQgY2hpbGQgbm9kZXMgb2ZcbiAgICogYC5wYXJlbnROb2RlYCwgcG9zc2libHkgYm9yZGVyZWQgYnkgJ21hcmtlciBub2RlcycgKGAuc3RhcnROb2RlYCBhbmRcbiAgICogYC5lbmROb2RlYCkuXG4gICAqXG4gICAqIC0gSWYgYm90aCBgLnN0YXJ0Tm9kZWAgYW5kIGAuZW5kTm9kZWAgYXJlIG5vbi1udWxsLCB0aGVuIHRoZSBwYXJ0J3MgY29udGVudFxuICAgKiBjb25zaXN0cyBvZiBhbGwgc2libGluZ3MgYmV0d2VlbiBgLnN0YXJ0Tm9kZWAgYW5kIGAuZW5kTm9kZWAsIGV4Y2x1c2l2ZWx5LlxuICAgKlxuICAgKiAtIElmIGAuc3RhcnROb2RlYCBpcyBub24tbnVsbCBidXQgYC5lbmROb2RlYCBpcyBudWxsLCB0aGVuIHRoZSBwYXJ0J3NcbiAgICogY29udGVudCBjb25zaXN0cyBvZiBhbGwgc2libGluZ3MgZm9sbG93aW5nIGAuc3RhcnROb2RlYCwgdXAgdG8gYW5kXG4gICAqIGluY2x1ZGluZyB0aGUgbGFzdCBjaGlsZCBvZiBgLnBhcmVudE5vZGVgLiBJZiBgLmVuZE5vZGVgIGlzIG5vbi1udWxsLCB0aGVuXG4gICAqIGAuc3RhcnROb2RlYCB3aWxsIGFsd2F5cyBiZSBub24tbnVsbC5cbiAgICpcbiAgICogLSBJZiBib3RoIGAuZW5kTm9kZWAgYW5kIGAuc3RhcnROb2RlYCBhcmUgbnVsbCwgdGhlbiB0aGUgcGFydCdzIGNvbnRlbnRcbiAgICogY29uc2lzdHMgb2YgYWxsIGNoaWxkIG5vZGVzIG9mIGAucGFyZW50Tm9kZWAuXG4gICAqL1xuICBnZXQgcGFyZW50Tm9kZSgpOiBOb2RlIHtcbiAgICBsZXQgcGFyZW50Tm9kZTogTm9kZSA9IHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkucGFyZW50Tm9kZSE7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5fJHBhcmVudDtcbiAgICBpZiAoXG4gICAgICBwYXJlbnQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgcGFyZW50Tm9kZT8ubm9kZVR5cGUgPT09IDExIC8qIE5vZGUuRE9DVU1FTlRfRlJBR01FTlQgKi9cbiAgICApIHtcbiAgICAgIC8vIElmIHRoZSBwYXJlbnROb2RlIGlzIGEgRG9jdW1lbnRGcmFnbWVudCwgaXQgbWF5IGJlIGJlY2F1c2UgdGhlIERPTSBpc1xuICAgICAgLy8gc3RpbGwgaW4gdGhlIGNsb25lZCBmcmFnbWVudCBkdXJpbmcgaW5pdGlhbCByZW5kZXI7IGlmIHNvLCBnZXQgdGhlIHJlYWxcbiAgICAgIC8vIHBhcmVudE5vZGUgdGhlIHBhcnQgd2lsbCBiZSBjb21taXR0ZWQgaW50byBieSBhc2tpbmcgdGhlIHBhcmVudC5cbiAgICAgIHBhcmVudE5vZGUgPSAocGFyZW50IGFzIENoaWxkUGFydCB8IFRlbXBsYXRlSW5zdGFuY2UpLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIHJldHVybiBwYXJlbnROb2RlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBwYXJ0J3MgbGVhZGluZyBtYXJrZXIgbm9kZSwgaWYgYW55LiBTZWUgYC5wYXJlbnROb2RlYCBmb3IgbW9yZVxuICAgKiBpbmZvcm1hdGlvbi5cbiAgICovXG4gIGdldCBzdGFydE5vZGUoKTogTm9kZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl8kc3RhcnROb2RlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBwYXJ0J3MgdHJhaWxpbmcgbWFya2VyIG5vZGUsIGlmIGFueS4gU2VlIGAucGFyZW50Tm9kZWAgZm9yIG1vcmVcbiAgICogaW5mb3JtYXRpb24uXG4gICAqL1xuICBnZXQgZW5kTm9kZSgpOiBOb2RlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuXyRlbmROb2RlO1xuICB9XG5cbiAgXyRzZXRWYWx1ZSh2YWx1ZTogdW5rbm93biwgZGlyZWN0aXZlUGFyZW50OiBEaXJlY3RpdmVQYXJlbnQgPSB0aGlzKTogdm9pZCB7XG4gICAgaWYgKERFVl9NT0RFICYmIHRoaXMucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVGhpcyBcXGBDaGlsZFBhcnRcXGAgaGFzIG5vIFxcYHBhcmVudE5vZGVcXGAgYW5kIHRoZXJlZm9yZSBjYW5ub3QgYWNjZXB0IGEgdmFsdWUuIFRoaXMgbGlrZWx5IG1lYW5zIHRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIHBhcnQgd2FzIG1hbmlwdWxhdGVkIGluIGFuIHVuc3VwcG9ydGVkIHdheSBvdXRzaWRlIG9mIExpdCdzIGNvbnRyb2wgc3VjaCB0aGF0IHRoZSBwYXJ0J3MgbWFya2VyIG5vZGVzIHdlcmUgZWplY3RlZCBmcm9tIERPTS4gRm9yIGV4YW1wbGUsIHNldHRpbmcgdGhlIGVsZW1lbnQncyBcXGBpbm5lckhUTUxcXGAgb3IgXFxgdGV4dENvbnRlbnRcXGAgY2FuIGRvIHRoaXMuYFxuICAgICAgKTtcbiAgICB9XG4gICAgdmFsdWUgPSByZXNvbHZlRGlyZWN0aXZlKHRoaXMsIHZhbHVlLCBkaXJlY3RpdmVQYXJlbnQpO1xuICAgIGlmIChpc1ByaW1pdGl2ZSh2YWx1ZSkpIHtcbiAgICAgIC8vIE5vbi1yZW5kZXJpbmcgY2hpbGQgdmFsdWVzLiBJdCdzIGltcG9ydGFudCB0aGF0IHRoZXNlIGRvIG5vdCByZW5kZXJcbiAgICAgIC8vIGVtcHR5IHRleHQgbm9kZXMgdG8gYXZvaWQgaXNzdWVzIHdpdGggcHJldmVudGluZyBkZWZhdWx0IDxzbG90PlxuICAgICAgLy8gZmFsbGJhY2sgY29udGVudC5cbiAgICAgIGlmICh2YWx1ZSA9PT0gbm90aGluZyB8fCB2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09PSAnJykge1xuICAgICAgICBpZiAodGhpcy5fJGNvbW1pdHRlZFZhbHVlICE9PSBub3RoaW5nKSB7XG4gICAgICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAgICAgIGtpbmQ6ICdjb21taXQgbm90aGluZyB0byBjaGlsZCcsXG4gICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLl8kc3RhcnROb2RlLFxuICAgICAgICAgICAgICBlbmQ6IHRoaXMuXyRlbmROb2RlLFxuICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMuXyRwYXJlbnQsXG4gICAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuXyRjbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IG5vdGhpbmc7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlICE9PSB0aGlzLl8kY29tbWl0dGVkVmFsdWUgJiYgdmFsdWUgIT09IG5vQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMuX2NvbW1pdFRleHQodmFsdWUpO1xuICAgICAgfVxuICAgICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICB9IGVsc2UgaWYgKCh2YWx1ZSBhcyBUZW1wbGF0ZVJlc3VsdClbJ18kbGl0VHlwZSQnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9jb21taXRUZW1wbGF0ZVJlc3VsdCh2YWx1ZSBhcyBUZW1wbGF0ZVJlc3VsdCk7XG4gICAgfSBlbHNlIGlmICgodmFsdWUgYXMgTm9kZSkubm9kZVR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKERFVl9NT0RFICYmIHRoaXMub3B0aW9ucz8uaG9zdCA9PT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5fY29tbWl0VGV4dChcbiAgICAgICAgICBgW3Byb2JhYmxlIG1pc3Rha2U6IHJlbmRlcmVkIGEgdGVtcGxhdGUncyBob3N0IGluIGl0c2VsZiBgICtcbiAgICAgICAgICAgIGAoY29tbW9ubHkgY2F1c2VkIGJ5IHdyaXRpbmcgXFwke3RoaXN9IGluIGEgdGVtcGxhdGVdYFxuICAgICAgICApO1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgYEF0dGVtcHRlZCB0byByZW5kZXIgdGhlIHRlbXBsYXRlIGhvc3RgLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIGBpbnNpZGUgaXRzZWxmLiBUaGlzIGlzIGFsbW9zdCBhbHdheXMgYSBtaXN0YWtlLCBhbmQgaW4gZGV2IG1vZGUgYCxcbiAgICAgICAgICBgd2UgcmVuZGVyIHNvbWUgd2FybmluZyB0ZXh0LiBJbiBwcm9kdWN0aW9uIGhvd2V2ZXIsIHdlJ2xsIGAsXG4gICAgICAgICAgYHJlbmRlciBpdCwgd2hpY2ggd2lsbCB1c3VhbGx5IHJlc3VsdCBpbiBhbiBlcnJvciwgYW5kIHNvbWV0aW1lcyBgLFxuICAgICAgICAgIGBpbiB0aGUgZWxlbWVudCBkaXNhcHBlYXJpbmcgZnJvbSB0aGUgRE9NLmBcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29tbWl0Tm9kZSh2YWx1ZSBhcyBOb2RlKTtcbiAgICB9IGVsc2UgaWYgKGlzSXRlcmFibGUodmFsdWUpKSB7XG4gICAgICB0aGlzLl9jb21taXRJdGVyYWJsZSh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZhbGxiYWNrLCB3aWxsIHJlbmRlciB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gICAgICB0aGlzLl9jb21taXRUZXh0KHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9pbnNlcnQ8VCBleHRlbmRzIE5vZGU+KG5vZGU6IFQpIHtcbiAgICByZXR1cm4gd3JhcCh3cmFwKHRoaXMuXyRzdGFydE5vZGUpLnBhcmVudE5vZGUhKS5pbnNlcnRCZWZvcmUoXG4gICAgICBub2RlLFxuICAgICAgdGhpcy5fJGVuZE5vZGVcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tbWl0Tm9kZSh2YWx1ZTogTm9kZSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICB0aGlzLl8kY2xlYXIoKTtcbiAgICAgIGlmIChcbiAgICAgICAgRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTICYmXG4gICAgICAgIHNhbml0aXplckZhY3RvcnlJbnRlcm5hbCAhPT0gbm9vcFNhbml0aXplclxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHBhcmVudE5vZGVOYW1lID0gdGhpcy5fJHN0YXJ0Tm9kZS5wYXJlbnROb2RlPy5ub2RlTmFtZTtcbiAgICAgICAgaWYgKHBhcmVudE5vZGVOYW1lID09PSAnU1RZTEUnIHx8IHBhcmVudE5vZGVOYW1lID09PSAnU0NSSVBUJykge1xuICAgICAgICAgIGxldCBtZXNzYWdlID0gJ0ZvcmJpZGRlbic7XG4gICAgICAgICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAgICAgICBpZiAocGFyZW50Tm9kZU5hbWUgPT09ICdTVFlMRScpIHtcbiAgICAgICAgICAgICAgbWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgYExpdCBkb2VzIG5vdCBzdXBwb3J0IGJpbmRpbmcgaW5zaWRlIHN0eWxlIG5vZGVzLiBgICtcbiAgICAgICAgICAgICAgICBgVGhpcyBpcyBhIHNlY3VyaXR5IHJpc2ssIGFzIHN0eWxlIGluamVjdGlvbiBhdHRhY2tzIGNhbiBgICtcbiAgICAgICAgICAgICAgICBgZXhmaWx0cmF0ZSBkYXRhIGFuZCBzcG9vZiBVSXMuIGAgK1xuICAgICAgICAgICAgICAgIGBDb25zaWRlciBpbnN0ZWFkIHVzaW5nIGNzc1xcYC4uLlxcYCBsaXRlcmFscyBgICtcbiAgICAgICAgICAgICAgICBgdG8gY29tcG9zZSBzdHlsZXMsIGFuZCBkbyBkeW5hbWljIHN0eWxpbmcgd2l0aCBgICtcbiAgICAgICAgICAgICAgICBgY3NzIGN1c3RvbSBwcm9wZXJ0aWVzLCA6OnBhcnRzLCA8c2xvdD5zLCBgICtcbiAgICAgICAgICAgICAgICBgYW5kIGJ5IG11dGF0aW5nIHRoZSBET00gcmF0aGVyIHRoYW4gc3R5bGVzaGVldHMuYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGBMaXQgZG9lcyBub3Qgc3VwcG9ydCBiaW5kaW5nIGluc2lkZSBzY3JpcHQgbm9kZXMuIGAgK1xuICAgICAgICAgICAgICAgIGBUaGlzIGlzIGEgc2VjdXJpdHkgcmlzaywgYXMgaXQgY291bGQgYWxsb3cgYXJiaXRyYXJ5IGAgK1xuICAgICAgICAgICAgICAgIGBjb2RlIGV4ZWN1dGlvbi5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ2NvbW1pdCBub2RlJyxcbiAgICAgICAgICBzdGFydDogdGhpcy5fJHN0YXJ0Tm9kZSxcbiAgICAgICAgICBwYXJlbnQ6IHRoaXMuXyRwYXJlbnQsXG4gICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSB0aGlzLl9pbnNlcnQodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1pdFRleHQodmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICAvLyBJZiB0aGUgY29tbWl0dGVkIHZhbHVlIGlzIGEgcHJpbWl0aXZlIGl0IG1lYW5zIHdlIGNhbGxlZCBfY29tbWl0VGV4dCBvblxuICAgIC8vIHRoZSBwcmV2aW91cyByZW5kZXIsIGFuZCB3ZSBrbm93IHRoYXQgdGhpcy5fJHN0YXJ0Tm9kZS5uZXh0U2libGluZyBpcyBhXG4gICAgLy8gVGV4dCBub2RlLiBXZSBjYW4gbm93IGp1c3QgcmVwbGFjZSB0aGUgdGV4dCBjb250ZW50ICguZGF0YSkgb2YgdGhlIG5vZGUuXG4gICAgaWYgKFxuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlICE9PSBub3RoaW5nICYmXG4gICAgICBpc1ByaW1pdGl2ZSh0aGlzLl8kY29tbWl0dGVkVmFsdWUpXG4gICAgKSB7XG4gICAgICBjb25zdCBub2RlID0gd3JhcCh0aGlzLl8kc3RhcnROb2RlKS5uZXh0U2libGluZyBhcyBUZXh0O1xuICAgICAgaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgICAgICBpZiAodGhpcy5fdGV4dFNhbml0aXplciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5fdGV4dFNhbml0aXplciA9IGNyZWF0ZVNhbml0aXplcihub2RlLCAnZGF0YScsICdwcm9wZXJ0eScpO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlID0gdGhpcy5fdGV4dFNhbml0aXplcih2YWx1ZSk7XG4gICAgICB9XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICdjb21taXQgdGV4dCcsXG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgICAgKG5vZGUgYXMgVGV4dCkuZGF0YSA9IHZhbHVlIGFzIHN0cmluZztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IGQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgICAgICB0aGlzLl9jb21taXROb2RlKHRleHROb2RlKTtcbiAgICAgICAgLy8gV2hlbiBzZXR0aW5nIHRleHQgY29udGVudCwgZm9yIHNlY3VyaXR5IHB1cnBvc2VzIGl0IG1hdHRlcnMgYSBsb3RcbiAgICAgICAgLy8gd2hhdCB0aGUgcGFyZW50IGlzLiBGb3IgZXhhbXBsZSwgPHN0eWxlPiBhbmQgPHNjcmlwdD4gbmVlZCB0byBiZVxuICAgICAgICAvLyBoYW5kbGVkIHdpdGggY2FyZSwgd2hpbGUgPHNwYW4+IGRvZXMgbm90LiBTbyBmaXJzdCB3ZSBuZWVkIHRvIHB1dCBhXG4gICAgICAgIC8vIHRleHQgbm9kZSBpbnRvIHRoZSBkb2N1bWVudCwgdGhlbiB3ZSBjYW4gc2FuaXRpemUgaXRzIGNvbnRlbnQuXG4gICAgICAgIGlmICh0aGlzLl90ZXh0U2FuaXRpemVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLl90ZXh0U2FuaXRpemVyID0gY3JlYXRlU2FuaXRpemVyKHRleHROb2RlLCAnZGF0YScsICdwcm9wZXJ0eScpO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlID0gdGhpcy5fdGV4dFNhbml0aXplcih2YWx1ZSk7XG4gICAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICAgIGtpbmQ6ICdjb21taXQgdGV4dCcsXG4gICAgICAgICAgICBub2RlOiB0ZXh0Tm9kZSxcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIH0pO1xuICAgICAgICB0ZXh0Tm9kZS5kYXRhID0gdmFsdWUgYXMgc3RyaW5nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY29tbWl0Tm9kZShkLmNyZWF0ZVRleHROb2RlKHZhbHVlIGFzIHN0cmluZykpO1xuICAgICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAgICBraW5kOiAnY29tbWl0IHRleHQnLFxuICAgICAgICAgICAgbm9kZTogd3JhcCh0aGlzLl8kc3RhcnROb2RlKS5uZXh0U2libGluZyBhcyBUZXh0LFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tbWl0VGVtcGxhdGVSZXN1bHQoXG4gICAgcmVzdWx0OiBUZW1wbGF0ZVJlc3VsdCB8IENvbXBpbGVkVGVtcGxhdGVSZXN1bHRcbiAgKTogdm9pZCB7XG4gICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICBjb25zdCB7dmFsdWVzLCBbJ18kbGl0VHlwZSQnXTogdHlwZX0gPSByZXN1bHQ7XG4gICAgLy8gSWYgJGxpdFR5cGUkIGlzIGEgbnVtYmVyLCByZXN1bHQgaXMgYSBwbGFpbiBUZW1wbGF0ZVJlc3VsdCBhbmQgd2UgZ2V0XG4gICAgLy8gdGhlIHRlbXBsYXRlIGZyb20gdGhlIHRlbXBsYXRlIGNhY2hlLiBJZiBub3QsIHJlc3VsdCBpcyBhXG4gICAgLy8gQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdCBhbmQgXyRsaXRUeXBlJCBpcyBhIENvbXBpbGVkVGVtcGxhdGUgYW5kIHdlIG5lZWRcbiAgICAvLyB0byBjcmVhdGUgdGhlIDx0ZW1wbGF0ZT4gZWxlbWVudCB0aGUgZmlyc3QgdGltZSB3ZSBzZWUgaXQuXG4gICAgY29uc3QgdGVtcGxhdGU6IFRlbXBsYXRlIHwgQ29tcGlsZWRUZW1wbGF0ZSA9XG4gICAgICB0eXBlb2YgdHlwZSA9PT0gJ251bWJlcidcbiAgICAgICAgPyB0aGlzLl8kZ2V0VGVtcGxhdGUocmVzdWx0IGFzIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdClcbiAgICAgICAgOiAodHlwZS5lbCA9PT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAodHlwZS5lbCA9IFRlbXBsYXRlLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgIHRydXN0RnJvbVRlbXBsYXRlU3RyaW5nKHR5cGUuaCwgdHlwZS5oWzBdKSxcbiAgICAgICAgICAgICAgdGhpcy5vcHRpb25zXG4gICAgICAgICAgICApKSxcbiAgICAgICAgICB0eXBlKTtcblxuICAgIGlmICgodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIFRlbXBsYXRlSW5zdGFuY2UpPy5fJHRlbXBsYXRlID09PSB0ZW1wbGF0ZSkge1xuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAndGVtcGxhdGUgdXBkYXRpbmcnLFxuICAgICAgICAgIHRlbXBsYXRlLFxuICAgICAgICAgIGluc3RhbmNlOiB0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgVGVtcGxhdGVJbnN0YW5jZSxcbiAgICAgICAgICBwYXJ0czogKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBUZW1wbGF0ZUluc3RhbmNlKS5fJHBhcnRzLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICB2YWx1ZXMsXG4gICAgICAgIH0pO1xuICAgICAgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBUZW1wbGF0ZUluc3RhbmNlKS5fdXBkYXRlKHZhbHVlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IFRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGUgYXMgVGVtcGxhdGUsIHRoaXMpO1xuICAgICAgY29uc3QgZnJhZ21lbnQgPSBpbnN0YW5jZS5fY2xvbmUodGhpcy5vcHRpb25zKTtcbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ3RlbXBsYXRlIGluc3RhbnRpYXRlZCcsXG4gICAgICAgICAgdGVtcGxhdGUsXG4gICAgICAgICAgaW5zdGFuY2UsXG4gICAgICAgICAgcGFydHM6IGluc3RhbmNlLl8kcGFydHMsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgfSk7XG4gICAgICBpbnN0YW5jZS5fdXBkYXRlKHZhbHVlcyk7XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBpbnN0YW50aWF0ZWQgYW5kIHVwZGF0ZWQnLFxuICAgICAgICAgIHRlbXBsYXRlLFxuICAgICAgICAgIGluc3RhbmNlLFxuICAgICAgICAgIHBhcnRzOiBpbnN0YW5jZS5fJHBhcnRzLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICB2YWx1ZXMsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5fY29tbWl0Tm9kZShmcmFnbWVudCk7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBpbnN0YW5jZTtcbiAgICB9XG4gIH1cblxuICAvLyBPdmVycmlkZGVuIHZpYSBgbGl0SHRtbFBvbHlmaWxsU3VwcG9ydGAgdG8gcHJvdmlkZSBwbGF0Zm9ybSBzdXBwb3J0LlxuICAvKiogQGludGVybmFsICovXG4gIF8kZ2V0VGVtcGxhdGUocmVzdWx0OiBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSB0ZW1wbGF0ZUNhY2hlLmdldChyZXN1bHQuc3RyaW5ncyk7XG4gICAgaWYgKHRlbXBsYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRlbXBsYXRlQ2FjaGUuc2V0KHJlc3VsdC5zdHJpbmdzLCAodGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUocmVzdWx0KSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH1cblxuICBwcml2YXRlIF9jb21taXRJdGVyYWJsZSh2YWx1ZTogSXRlcmFibGU8dW5rbm93bj4pOiB2b2lkIHtcbiAgICAvLyBGb3IgYW4gSXRlcmFibGUsIHdlIGNyZWF0ZSBhIG5ldyBJbnN0YW5jZVBhcnQgcGVyIGl0ZW0sIHRoZW4gc2V0IGl0c1xuICAgIC8vIHZhbHVlIHRvIHRoZSBpdGVtLiBUaGlzIGlzIGEgbGl0dGxlIGJpdCBvZiBvdmVyaGVhZCBmb3IgZXZlcnkgaXRlbSBpblxuICAgIC8vIGFuIEl0ZXJhYmxlLCBidXQgaXQgbGV0cyB1cyByZWN1cnNlIGVhc2lseSBhbmQgZWZmaWNpZW50bHkgdXBkYXRlIEFycmF5c1xuICAgIC8vIG9mIFRlbXBsYXRlUmVzdWx0cyB0aGF0IHdpbGwgYmUgY29tbW9ubHkgcmV0dXJuZWQgZnJvbSBleHByZXNzaW9ucyBsaWtlOlxuICAgIC8vIGFycmF5Lm1hcCgoaSkgPT4gaHRtbGAke2l9YCksIGJ5IHJldXNpbmcgZXhpc3RpbmcgVGVtcGxhdGVJbnN0YW5jZXMuXG5cbiAgICAvLyBJZiB2YWx1ZSBpcyBhbiBhcnJheSwgdGhlbiB0aGUgcHJldmlvdXMgcmVuZGVyIHdhcyBvZiBhblxuICAgIC8vIGl0ZXJhYmxlIGFuZCB2YWx1ZSB3aWxsIGNvbnRhaW4gdGhlIENoaWxkUGFydHMgZnJvbSB0aGUgcHJldmlvdXNcbiAgICAvLyByZW5kZXIuIElmIHZhbHVlIGlzIG5vdCBhbiBhcnJheSwgY2xlYXIgdGhpcyBwYXJ0IGFuZCBtYWtlIGEgbmV3XG4gICAgLy8gYXJyYXkgZm9yIENoaWxkUGFydHMuXG4gICAgaWYgKCFpc0FycmF5KHRoaXMuXyRjb21taXR0ZWRWYWx1ZSkpIHtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IFtdO1xuICAgICAgdGhpcy5fJGNsZWFyKCk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyB1cyBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IGl0ZW1zIHdlIHN0YW1wZWQgc28gd2UgY2FuIGNsZWFyIGxlZnRvdmVyXG4gICAgLy8gaXRlbXMgZnJvbSBhIHByZXZpb3VzIHJlbmRlclxuICAgIGNvbnN0IGl0ZW1QYXJ0cyA9IHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBDaGlsZFBhcnRbXTtcbiAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICBsZXQgaXRlbVBhcnQ6IENoaWxkUGFydCB8IHVuZGVmaW5lZDtcblxuICAgIGZvciAoY29uc3QgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgaWYgKHBhcnRJbmRleCA9PT0gaXRlbVBhcnRzLmxlbmd0aCkge1xuICAgICAgICAvLyBJZiBubyBleGlzdGluZyBwYXJ0LCBjcmVhdGUgYSBuZXcgb25lXG4gICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiB0ZXN0IHBlcmYgaW1wYWN0IG9mIGFsd2F5cyBjcmVhdGluZyB0d28gcGFydHNcbiAgICAgICAgLy8gaW5zdGVhZCBvZiBzaGFyaW5nIHBhcnRzIGJldHdlZW4gbm9kZXNcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2xpdC9saXQvaXNzdWVzLzEyNjZcbiAgICAgICAgaXRlbVBhcnRzLnB1c2goXG4gICAgICAgICAgKGl0ZW1QYXJ0ID0gbmV3IENoaWxkUGFydChcbiAgICAgICAgICAgIHRoaXMuX2luc2VydChjcmVhdGVNYXJrZXIoKSksXG4gICAgICAgICAgICB0aGlzLl9pbnNlcnQoY3JlYXRlTWFya2VyKCkpLFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc1xuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZXVzZSBhbiBleGlzdGluZyBwYXJ0XG4gICAgICAgIGl0ZW1QYXJ0ID0gaXRlbVBhcnRzW3BhcnRJbmRleF07XG4gICAgICB9XG4gICAgICBpdGVtUGFydC5fJHNldFZhbHVlKGl0ZW0pO1xuICAgICAgcGFydEluZGV4Kys7XG4gICAgfVxuXG4gICAgaWYgKHBhcnRJbmRleCA8IGl0ZW1QYXJ0cy5sZW5ndGgpIHtcbiAgICAgIC8vIGl0ZW1QYXJ0cyBhbHdheXMgaGF2ZSBlbmQgbm9kZXNcbiAgICAgIHRoaXMuXyRjbGVhcihcbiAgICAgICAgaXRlbVBhcnQgJiYgd3JhcChpdGVtUGFydC5fJGVuZE5vZGUhKS5uZXh0U2libGluZyxcbiAgICAgICAgcGFydEluZGV4XG4gICAgICApO1xuICAgICAgLy8gVHJ1bmNhdGUgdGhlIHBhcnRzIGFycmF5IHNvIF92YWx1ZSByZWZsZWN0cyB0aGUgY3VycmVudCBzdGF0ZVxuICAgICAgaXRlbVBhcnRzLmxlbmd0aCA9IHBhcnRJbmRleDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgbm9kZXMgY29udGFpbmVkIHdpdGhpbiB0aGlzIFBhcnQgZnJvbSB0aGUgRE9NLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnQgU3RhcnQgbm9kZSB0byBjbGVhciBmcm9tLCBmb3IgY2xlYXJpbmcgYSBzdWJzZXQgb2YgdGhlIHBhcnQnc1xuICAgKiAgICAgRE9NICh1c2VkIHdoZW4gdHJ1bmNhdGluZyBpdGVyYWJsZXMpXG4gICAqIEBwYXJhbSBmcm9tICBXaGVuIGBzdGFydGAgaXMgc3BlY2lmaWVkLCB0aGUgaW5kZXggd2l0aGluIHRoZSBpdGVyYWJsZSBmcm9tXG4gICAqICAgICB3aGljaCBDaGlsZFBhcnRzIGFyZSBiZWluZyByZW1vdmVkLCB1c2VkIGZvciBkaXNjb25uZWN0aW5nIGRpcmVjdGl2ZXMgaW5cbiAgICogICAgIHRob3NlIFBhcnRzLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF8kY2xlYXIoXG4gICAgc3RhcnQ6IENoaWxkTm9kZSB8IG51bGwgPSB3cmFwKHRoaXMuXyRzdGFydE5vZGUpLm5leHRTaWJsaW5nLFxuICAgIGZyb20/OiBudW1iZXJcbiAgKSB7XG4gICAgdGhpcy5fJG5vdGlmeUNvbm5lY3Rpb25DaGFuZ2VkPy4oZmFsc2UsIHRydWUsIGZyb20pO1xuICAgIHdoaWxlIChzdGFydCAmJiBzdGFydCAhPT0gdGhpcy5fJGVuZE5vZGUpIHtcbiAgICAgIGNvbnN0IG4gPSB3cmFwKHN0YXJ0ISkubmV4dFNpYmxpbmc7XG4gICAgICAod3JhcChzdGFydCEpIGFzIEVsZW1lbnQpLnJlbW92ZSgpO1xuICAgICAgc3RhcnQgPSBuO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogSW1wbGVtZW50YXRpb24gb2YgUm9vdFBhcnQncyBgaXNDb25uZWN0ZWRgLiBOb3RlIHRoYXQgdGhpcyBtZXRob2RcbiAgICogc2hvdWxkIG9ubHkgYmUgY2FsbGVkIG9uIGBSb290UGFydGBzICh0aGUgYENoaWxkUGFydGAgcmV0dXJuZWQgZnJvbSBhXG4gICAqIHRvcC1sZXZlbCBgcmVuZGVyKClgIGNhbGwpLiBJdCBoYXMgbm8gZWZmZWN0IG9uIG5vbi1yb290IENoaWxkUGFydHMuXG4gICAqIEBwYXJhbSBpc0Nvbm5lY3RlZCBXaGV0aGVyIHRvIHNldFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHNldENvbm5lY3RlZChpc0Nvbm5lY3RlZDogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLl8kcGFyZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX19pc0Nvbm5lY3RlZCA9IGlzQ29ubmVjdGVkO1xuICAgICAgdGhpcy5fJG5vdGlmeUNvbm5lY3Rpb25DaGFuZ2VkPy4oaXNDb25uZWN0ZWQpO1xuICAgIH0gZWxzZSBpZiAoREVWX01PREUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ3BhcnQuc2V0Q29ubmVjdGVkKCkgbWF5IG9ubHkgYmUgY2FsbGVkIG9uIGEgJyArXG4gICAgICAgICAgJ1Jvb3RQYXJ0IHJldHVybmVkIGZyb20gcmVuZGVyKCkuJ1xuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBIHRvcC1sZXZlbCBgQ2hpbGRQYXJ0YCByZXR1cm5lZCBmcm9tIGByZW5kZXJgIHRoYXQgbWFuYWdlcyB0aGUgY29ubmVjdGVkXG4gKiBzdGF0ZSBvZiBgQXN5bmNEaXJlY3RpdmVgcyBjcmVhdGVkIHRocm91Z2hvdXQgdGhlIHRyZWUgYmVsb3cgaXQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUm9vdFBhcnQgZXh0ZW5kcyBDaGlsZFBhcnQge1xuICAvKipcbiAgICogU2V0cyB0aGUgY29ubmVjdGlvbiBzdGF0ZSBmb3IgYEFzeW5jRGlyZWN0aXZlYHMgY29udGFpbmVkIHdpdGhpbiB0aGlzIHJvb3RcbiAgICogQ2hpbGRQYXJ0LlxuICAgKlxuICAgKiBsaXQtaHRtbCBkb2VzIG5vdCBhdXRvbWF0aWNhbGx5IG1vbml0b3IgdGhlIGNvbm5lY3RlZG5lc3Mgb2YgRE9NIHJlbmRlcmVkO1xuICAgKiBhcyBzdWNoLCBpdCBpcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIGNhbGxlciB0byBgcmVuZGVyYCB0byBlbnN1cmUgdGhhdFxuICAgKiBgcGFydC5zZXRDb25uZWN0ZWQoZmFsc2UpYCBpcyBjYWxsZWQgYmVmb3JlIHRoZSBwYXJ0IG9iamVjdCBpcyBwb3RlbnRpYWxseVxuICAgKiBkaXNjYXJkZWQsIHRvIGVuc3VyZSB0aGF0IGBBc3luY0RpcmVjdGl2ZWBzIGhhdmUgYSBjaGFuY2UgdG8gZGlzcG9zZSBvZlxuICAgKiBhbnkgcmVzb3VyY2VzIGJlaW5nIGhlbGQuIElmIGEgYFJvb3RQYXJ0YCB0aGF0IHdhcyBwcmV2aW91c2x5XG4gICAqIGRpc2Nvbm5lY3RlZCBpcyBzdWJzZXF1ZW50bHkgcmUtY29ubmVjdGVkIChhbmQgaXRzIGBBc3luY0RpcmVjdGl2ZWBzIHNob3VsZFxuICAgKiByZS1jb25uZWN0KSwgYHNldENvbm5lY3RlZCh0cnVlKWAgc2hvdWxkIGJlIGNhbGxlZC5cbiAgICpcbiAgICogQHBhcmFtIGlzQ29ubmVjdGVkIFdoZXRoZXIgZGlyZWN0aXZlcyB3aXRoaW4gdGhpcyB0cmVlIHNob3VsZCBiZSBjb25uZWN0ZWRcbiAgICogb3Igbm90XG4gICAqL1xuICBzZXRDb25uZWN0ZWQoaXNDb25uZWN0ZWQ6IGJvb2xlYW4pOiB2b2lkO1xufVxuXG5leHBvcnQgdHlwZSB7QXR0cmlidXRlUGFydH07XG5jbGFzcyBBdHRyaWJ1dGVQYXJ0IGltcGxlbWVudHMgRGlzY29ubmVjdGFibGUge1xuICByZWFkb25seSB0eXBlOlxuICAgIHwgdHlwZW9mIEFUVFJJQlVURV9QQVJUXG4gICAgfCB0eXBlb2YgUFJPUEVSVFlfUEFSVFxuICAgIHwgdHlwZW9mIEJPT0xFQU5fQVRUUklCVVRFX1BBUlRcbiAgICB8IHR5cGVvZiBFVkVOVF9QQVJUID0gQVRUUklCVVRFX1BBUlQ7XG4gIHJlYWRvbmx5IGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIElmIHRoaXMgYXR0cmlidXRlIHBhcnQgcmVwcmVzZW50cyBhbiBpbnRlcnBvbGF0aW9uLCB0aGlzIGNvbnRhaW5zIHRoZVxuICAgKiBzdGF0aWMgc3RyaW5ncyBvZiB0aGUgaW50ZXJwb2xhdGlvbi4gRm9yIHNpbmdsZS12YWx1ZSwgY29tcGxldGUgYmluZGluZ3MsXG4gICAqIHRoaXMgaXMgdW5kZWZpbmVkLlxuICAgKi9cbiAgcmVhZG9ubHkgc3RyaW5ncz86IFJlYWRvbmx5QXJyYXk8c3RyaW5nPjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGNvbW1pdHRlZFZhbHVlOiB1bmtub3duIHwgQXJyYXk8dW5rbm93bj4gPSBub3RoaW5nO1xuICAvKiogQGludGVybmFsICovXG4gIF9fZGlyZWN0aXZlcz86IEFycmF5PERpcmVjdGl2ZSB8IHVuZGVmaW5lZD47XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlO1xuICAvKiogQGludGVybmFsICovXG4gIF8kZGlzY29ubmVjdGFibGVDaGlsZHJlbj86IFNldDxEaXNjb25uZWN0YWJsZT4gPSB1bmRlZmluZWQ7XG5cbiAgcHJvdGVjdGVkIF9zYW5pdGl6ZXI6IFZhbHVlU2FuaXRpemVyIHwgdW5kZWZpbmVkO1xuXG4gIGdldCB0YWdOYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQudGFnTmFtZTtcbiAgfVxuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQuXyRpc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzdHJpbmdzOiBSZWFkb25seUFycmF5PHN0cmluZz4sXG4gICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSxcbiAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLl8kcGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgaWYgKHN0cmluZ3MubGVuZ3RoID4gMiB8fCBzdHJpbmdzWzBdICE9PSAnJyB8fCBzdHJpbmdzWzFdICE9PSAnJykge1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gbmV3IEFycmF5KHN0cmluZ3MubGVuZ3RoIC0gMSkuZmlsbChuZXcgU3RyaW5nKCkpO1xuICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gbm90aGluZztcbiAgICB9XG4gICAgaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgICAgdGhpcy5fc2FuaXRpemVyID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiB0aGlzIHBhcnQgYnkgcmVzb2x2aW5nIHRoZSB2YWx1ZSBmcm9tIHBvc3NpYmx5IG11bHRpcGxlXG4gICAqIHZhbHVlcyBhbmQgc3RhdGljIHN0cmluZ3MgYW5kIGNvbW1pdHRpbmcgaXQgdG8gdGhlIERPTS5cbiAgICogSWYgdGhpcyBwYXJ0IGlzIHNpbmdsZS12YWx1ZWQsIGB0aGlzLl9zdHJpbmdzYCB3aWxsIGJlIHVuZGVmaW5lZCwgYW5kIHRoZVxuICAgKiBtZXRob2Qgd2lsbCBiZSBjYWxsZWQgd2l0aCBhIHNpbmdsZSB2YWx1ZSBhcmd1bWVudC4gSWYgdGhpcyBwYXJ0IGlzXG4gICAqIG11bHRpLXZhbHVlLCBgdGhpcy5fc3RyaW5nc2Agd2lsbCBiZSBkZWZpbmVkLCBhbmQgdGhlIG1ldGhvZCBpcyBjYWxsZWRcbiAgICogd2l0aCB0aGUgdmFsdWUgYXJyYXkgb2YgdGhlIHBhcnQncyBvd25pbmcgVGVtcGxhdGVJbnN0YW5jZSwgYW5kIGFuIG9mZnNldFxuICAgKiBpbnRvIHRoZSB2YWx1ZSBhcnJheSBmcm9tIHdoaWNoIHRoZSB2YWx1ZXMgc2hvdWxkIGJlIHJlYWQuXG4gICAqIFRoaXMgbWV0aG9kIGlzIG92ZXJsb2FkZWQgdGhpcyB3YXkgdG8gZWxpbWluYXRlIHNob3J0LWxpdmVkIGFycmF5IHNsaWNlc1xuICAgKiBvZiB0aGUgdGVtcGxhdGUgaW5zdGFuY2UgdmFsdWVzLCBhbmQgYWxsb3cgYSBmYXN0LXBhdGggZm9yIHNpbmdsZS12YWx1ZWRcbiAgICogcGFydHMuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgcGFydCB2YWx1ZSwgb3IgYW4gYXJyYXkgb2YgdmFsdWVzIGZvciBtdWx0aS12YWx1ZWQgcGFydHNcbiAgICogQHBhcmFtIHZhbHVlSW5kZXggdGhlIGluZGV4IHRvIHN0YXJ0IHJlYWRpbmcgdmFsdWVzIGZyb20uIGB1bmRlZmluZWRgIGZvclxuICAgKiAgIHNpbmdsZS12YWx1ZWQgcGFydHNcbiAgICogQHBhcmFtIG5vQ29tbWl0IGNhdXNlcyB0aGUgcGFydCB0byBub3QgY29tbWl0IGl0cyB2YWx1ZSB0byB0aGUgRE9NLiBVc2VkXG4gICAqICAgaW4gaHlkcmF0aW9uIHRvIHByaW1lIGF0dHJpYnV0ZSBwYXJ0cyB3aXRoIHRoZWlyIGZpcnN0LXJlbmRlcmVkIHZhbHVlLFxuICAgKiAgIGJ1dCBub3Qgc2V0IHRoZSBhdHRyaWJ1dGUsIGFuZCBpbiBTU1IgdG8gbm8tb3AgdGhlIERPTSBvcGVyYXRpb24gYW5kXG4gICAqICAgY2FwdHVyZSB0aGUgdmFsdWUgZm9yIHNlcmlhbGl6YXRpb24uXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgXyRzZXRWYWx1ZShcbiAgICB2YWx1ZTogdW5rbm93biB8IEFycmF5PHVua25vd24+LFxuICAgIGRpcmVjdGl2ZVBhcmVudDogRGlyZWN0aXZlUGFyZW50ID0gdGhpcyxcbiAgICB2YWx1ZUluZGV4PzogbnVtYmVyLFxuICAgIG5vQ29tbWl0PzogYm9vbGVhblxuICApIHtcbiAgICBjb25zdCBzdHJpbmdzID0gdGhpcy5zdHJpbmdzO1xuXG4gICAgLy8gV2hldGhlciBhbnkgb2YgdGhlIHZhbHVlcyBoYXMgY2hhbmdlZCwgZm9yIGRpcnR5LWNoZWNraW5nXG4gICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xuXG4gICAgaWYgKHN0cmluZ3MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gU2luZ2xlLXZhbHVlIGJpbmRpbmcgY2FzZVxuICAgICAgdmFsdWUgPSByZXNvbHZlRGlyZWN0aXZlKHRoaXMsIHZhbHVlLCBkaXJlY3RpdmVQYXJlbnQsIDApO1xuICAgICAgY2hhbmdlID1cbiAgICAgICAgIWlzUHJpbWl0aXZlKHZhbHVlKSB8fFxuICAgICAgICAodmFsdWUgIT09IHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAmJiB2YWx1ZSAhPT0gbm9DaGFuZ2UpO1xuICAgICAgaWYgKGNoYW5nZSkge1xuICAgICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSW50ZXJwb2xhdGlvbiBjYXNlXG4gICAgICBjb25zdCB2YWx1ZXMgPSB2YWx1ZSBhcyBBcnJheTx1bmtub3duPjtcbiAgICAgIHZhbHVlID0gc3RyaW5nc1swXTtcblxuICAgICAgbGV0IGksIHY7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgdiA9IHJlc29sdmVEaXJlY3RpdmUodGhpcywgdmFsdWVzW3ZhbHVlSW5kZXghICsgaV0sIGRpcmVjdGl2ZVBhcmVudCwgaSk7XG5cbiAgICAgICAgaWYgKHYgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHVzZXItcHJvdmlkZWQgdmFsdWUgaXMgYG5vQ2hhbmdlYCwgdXNlIHRoZSBwcmV2aW91cyB2YWx1ZVxuICAgICAgICAgIHYgPSAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIEFycmF5PHVua25vd24+KVtpXTtcbiAgICAgICAgfVxuICAgICAgICBjaGFuZ2UgfHw9XG4gICAgICAgICAgIWlzUHJpbWl0aXZlKHYpIHx8IHYgIT09ICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgQXJyYXk8dW5rbm93bj4pW2ldO1xuICAgICAgICBpZiAodiA9PT0gbm90aGluZykge1xuICAgICAgICAgIHZhbHVlID0gbm90aGluZztcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSAhPT0gbm90aGluZykge1xuICAgICAgICAgIHZhbHVlICs9ICh2ID8/ICcnKSArIHN0cmluZ3NbaSArIDFdO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdlIGFsd2F5cyByZWNvcmQgZWFjaCB2YWx1ZSwgZXZlbiBpZiBvbmUgaXMgYG5vdGhpbmdgLCBmb3IgZnV0dXJlXG4gICAgICAgIC8vIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAgICAgICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgQXJyYXk8dW5rbm93bj4pW2ldID0gdjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNoYW5nZSAmJiAhbm9Db21taXQpIHtcbiAgICAgIHRoaXMuX2NvbW1pdFZhbHVlKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jb21taXRWYWx1ZSh2YWx1ZTogdW5rbm93bikge1xuICAgIGlmICh2YWx1ZSA9PT0gbm90aGluZykge1xuICAgICAgKHdyYXAodGhpcy5lbGVtZW50KSBhcyBFbGVtZW50KS5yZW1vdmVBdHRyaWJ1dGUodGhpcy5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgICAgICBpZiAodGhpcy5fc2FuaXRpemVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLl9zYW5pdGl6ZXIgPSBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwoXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgICAgICAnYXR0cmlidXRlJ1xuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgPSB0aGlzLl9zYW5pdGl6ZXIodmFsdWUgPz8gJycpO1xuICAgICAgfVxuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAnY29tbWl0IGF0dHJpYnV0ZScsXG4gICAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxuICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgICAgKHdyYXAodGhpcy5lbGVtZW50KSBhcyBFbGVtZW50KS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgKHZhbHVlID8/ICcnKSBhcyBzdHJpbmdcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIHtQcm9wZXJ0eVBhcnR9O1xuY2xhc3MgUHJvcGVydHlQYXJ0IGV4dGVuZHMgQXR0cmlidXRlUGFydCB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IHR5cGUgPSBQUk9QRVJUWV9QQVJUO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgX2NvbW1pdFZhbHVlKHZhbHVlOiB1bmtub3duKSB7XG4gICAgaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgICAgaWYgKHRoaXMuX3Nhbml0aXplciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuX3Nhbml0aXplciA9IHNhbml0aXplckZhY3RvcnlJbnRlcm5hbChcbiAgICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICAgICdwcm9wZXJ0eSdcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdGhpcy5fc2FuaXRpemVyKHZhbHVlKTtcbiAgICB9XG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICdjb21taXQgcHJvcGVydHknLFxuICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgIH0pO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgKHRoaXMuZWxlbWVudCBhcyBhbnkpW3RoaXMubmFtZV0gPSB2YWx1ZSA9PT0gbm90aGluZyA/IHVuZGVmaW5lZCA6IHZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIHtCb29sZWFuQXR0cmlidXRlUGFydH07XG5jbGFzcyBCb29sZWFuQXR0cmlidXRlUGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xuICBvdmVycmlkZSByZWFkb25seSB0eXBlID0gQk9PTEVBTl9BVFRSSUJVVEVfUEFSVDtcblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIF9jb21taXRWYWx1ZSh2YWx1ZTogdW5rbm93bikge1xuICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICBraW5kOiAnY29tbWl0IGJvb2xlYW4gYXR0cmlidXRlJyxcbiAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgIHZhbHVlOiAhISh2YWx1ZSAmJiB2YWx1ZSAhPT0gbm90aGluZyksXG4gICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgIH0pO1xuICAgICh3cmFwKHRoaXMuZWxlbWVudCkgYXMgRWxlbWVudCkudG9nZ2xlQXR0cmlidXRlKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgISF2YWx1ZSAmJiB2YWx1ZSAhPT0gbm90aGluZ1xuICAgICk7XG4gIH1cbn1cblxudHlwZSBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMgPSBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0ICZcbiAgUGFydGlhbDxBZGRFdmVudExpc3RlbmVyT3B0aW9ucz47XG5cbi8qKlxuICogQW4gQXR0cmlidXRlUGFydCB0aGF0IG1hbmFnZXMgYW4gZXZlbnQgbGlzdGVuZXIgdmlhIGFkZC9yZW1vdmVFdmVudExpc3RlbmVyLlxuICpcbiAqIFRoaXMgcGFydCB3b3JrcyBieSBhZGRpbmcgaXRzZWxmIGFzIHRoZSBldmVudCBsaXN0ZW5lciBvbiBhbiBlbGVtZW50LCB0aGVuXG4gKiBkZWxlZ2F0aW5nIHRvIHRoZSB2YWx1ZSBwYXNzZWQgdG8gaXQuIFRoaXMgcmVkdWNlcyB0aGUgbnVtYmVyIG9mIGNhbGxzIHRvXG4gKiBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lciBpZiB0aGUgbGlzdGVuZXIgY2hhbmdlcyBmcmVxdWVudGx5LCBzdWNoIGFzIHdoZW4gYW5cbiAqIGlubGluZSBmdW5jdGlvbiBpcyB1c2VkIGFzIGEgbGlzdGVuZXIuXG4gKlxuICogQmVjYXVzZSBldmVudCBvcHRpb25zIGFyZSBwYXNzZWQgd2hlbiBhZGRpbmcgbGlzdGVuZXJzLCB3ZSBtdXN0IHRha2UgY2FzZVxuICogdG8gYWRkIGFuZCByZW1vdmUgdGhlIHBhcnQgYXMgYSBsaXN0ZW5lciB3aGVuIHRoZSBldmVudCBvcHRpb25zIGNoYW5nZS5cbiAqL1xuZXhwb3J0IHR5cGUge0V2ZW50UGFydH07XG5jbGFzcyBFdmVudFBhcnQgZXh0ZW5kcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkgdHlwZSA9IEVWRU5UX1BBUlQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHN0cmluZ3M6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPixcbiAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlLFxuICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIoZWxlbWVudCwgbmFtZSwgc3RyaW5ncywgcGFyZW50LCBvcHRpb25zKTtcblxuICAgIGlmIChERVZfTU9ERSAmJiB0aGlzLnN0cmluZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgQSBcXGA8JHtlbGVtZW50LmxvY2FsTmFtZX0+XFxgIGhhcyBhIFxcYEAke25hbWV9PS4uLlxcYCBsaXN0ZW5lciB3aXRoIGAgK1xuICAgICAgICAgICdpbnZhbGlkIGNvbnRlbnQuIEV2ZW50IGxpc3RlbmVycyBpbiB0ZW1wbGF0ZXMgbXVzdCBoYXZlIGV4YWN0bHkgJyArXG4gICAgICAgICAgJ29uZSBleHByZXNzaW9uIGFuZCBubyBzdXJyb3VuZGluZyB0ZXh0LidcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gRXZlbnRQYXJ0IGRvZXMgbm90IHVzZSB0aGUgYmFzZSBfJHNldFZhbHVlL19yZXNvbHZlVmFsdWUgaW1wbGVtZW50YXRpb25cbiAgLy8gc2luY2UgdGhlIGRpcnR5IGNoZWNraW5nIGlzIG1vcmUgY29tcGxleFxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIF8kc2V0VmFsdWUoXG4gICAgbmV3TGlzdGVuZXI6IHVua25vd24sXG4gICAgZGlyZWN0aXZlUGFyZW50OiBEaXJlY3RpdmVQYXJlbnQgPSB0aGlzXG4gICkge1xuICAgIG5ld0xpc3RlbmVyID1cbiAgICAgIHJlc29sdmVEaXJlY3RpdmUodGhpcywgbmV3TGlzdGVuZXIsIGRpcmVjdGl2ZVBhcmVudCwgMCkgPz8gbm90aGluZztcbiAgICBpZiAobmV3TGlzdGVuZXIgPT09IG5vQ2hhbmdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG9sZExpc3RlbmVyID0gdGhpcy5fJGNvbW1pdHRlZFZhbHVlO1xuXG4gICAgLy8gSWYgdGhlIG5ldyB2YWx1ZSBpcyBub3RoaW5nIG9yIGFueSBvcHRpb25zIGNoYW5nZSB3ZSBoYXZlIHRvIHJlbW92ZSB0aGVcbiAgICAvLyBwYXJ0IGFzIGEgbGlzdGVuZXIuXG4gICAgY29uc3Qgc2hvdWxkUmVtb3ZlTGlzdGVuZXIgPVxuICAgICAgKG5ld0xpc3RlbmVyID09PSBub3RoaW5nICYmIG9sZExpc3RlbmVyICE9PSBub3RoaW5nKSB8fFxuICAgICAgKG5ld0xpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucykuY2FwdHVyZSAhPT1cbiAgICAgICAgKG9sZExpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucykuY2FwdHVyZSB8fFxuICAgICAgKG5ld0xpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucykub25jZSAhPT1cbiAgICAgICAgKG9sZExpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucykub25jZSB8fFxuICAgICAgKG5ld0xpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucykucGFzc2l2ZSAhPT1cbiAgICAgICAgKG9sZExpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucykucGFzc2l2ZTtcblxuICAgIC8vIElmIHRoZSBuZXcgdmFsdWUgaXMgbm90IG5vdGhpbmcgYW5kIHdlIHJlbW92ZWQgdGhlIGxpc3RlbmVyLCB3ZSBoYXZlXG4gICAgLy8gdG8gYWRkIHRoZSBwYXJ0IGFzIGEgbGlzdGVuZXIuXG4gICAgY29uc3Qgc2hvdWxkQWRkTGlzdGVuZXIgPVxuICAgICAgbmV3TGlzdGVuZXIgIT09IG5vdGhpbmcgJiZcbiAgICAgIChvbGRMaXN0ZW5lciA9PT0gbm90aGluZyB8fCBzaG91bGRSZW1vdmVMaXN0ZW5lcik7XG5cbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ2NvbW1pdCBldmVudCBsaXN0ZW5lcicsXG4gICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICB2YWx1ZTogbmV3TGlzdGVuZXIsXG4gICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgcmVtb3ZlTGlzdGVuZXI6IHNob3VsZFJlbW92ZUxpc3RlbmVyLFxuICAgICAgICBhZGRMaXN0ZW5lcjogc2hvdWxkQWRkTGlzdGVuZXIsXG4gICAgICAgIG9sZExpc3RlbmVyLFxuICAgICAgfSk7XG4gICAgaWYgKHNob3VsZFJlbW92ZUxpc3RlbmVyKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB0aGlzLFxuICAgICAgICBvbGRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnNcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChzaG91bGRBZGRMaXN0ZW5lcikge1xuICAgICAgLy8gQmV3YXJlOiBJRTExIGFuZCBDaHJvbWUgNDEgZG9uJ3QgbGlrZSB1c2luZyB0aGUgbGlzdGVuZXIgYXMgdGhlXG4gICAgICAvLyBvcHRpb25zIG9iamVjdC4gRmlndXJlIG91dCBob3cgdG8gZGVhbCB3LyB0aGlzIGluIElFMTEgLSBtYXliZVxuICAgICAgLy8gcGF0Y2ggYWRkRXZlbnRMaXN0ZW5lcj9cbiAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgIHRoaXMsXG4gICAgICAgIG5ld0xpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9uc1xuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gbmV3TGlzdGVuZXI7XG4gIH1cblxuICBoYW5kbGVFdmVudChldmVudDogRXZlbnQpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlLmNhbGwodGhpcy5vcHRpb25zPy5ob3N0ID8/IHRoaXMuZWxlbWVudCwgZXZlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIEV2ZW50TGlzdGVuZXJPYmplY3QpLmhhbmRsZUV2ZW50KGV2ZW50KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUge0VsZW1lbnRQYXJ0fTtcbmNsYXNzIEVsZW1lbnRQYXJ0IGltcGxlbWVudHMgRGlzY29ubmVjdGFibGUge1xuICByZWFkb25seSB0eXBlID0gRUxFTUVOVF9QQVJUO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX19kaXJlY3RpdmU/OiBEaXJlY3RpdmU7XG5cbiAgLy8gVGhpcyBpcyB0byBlbnN1cmUgdGhhdCBldmVyeSBQYXJ0IGhhcyBhIF8kY29tbWl0dGVkVmFsdWVcbiAgXyRjb21taXR0ZWRWYWx1ZTogdW5kZWZpbmVkO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRwYXJlbnQhOiBEaXNjb25uZWN0YWJsZTtcblxuICAvKiogQGludGVybmFsICovXG4gIF8kZGlzY29ubmVjdGFibGVDaGlsZHJlbj86IFNldDxEaXNjb25uZWN0YWJsZT4gPSB1bmRlZmluZWQ7XG5cbiAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWxlbWVudDogRWxlbWVudCxcbiAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlLFxuICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWRcbiAgKSB7XG4gICAgdGhpcy5fJHBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB9XG5cbiAgLy8gU2VlIGNvbW1lbnQgaW4gRGlzY29ubmVjdGFibGUgaW50ZXJmYWNlIGZvciB3aHkgdGhpcyBpcyBhIGdldHRlclxuICBnZXQgXyRpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fJHBhcmVudC5fJGlzQ29ubmVjdGVkO1xuICB9XG5cbiAgXyRzZXRWYWx1ZSh2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICBraW5kOiAnY29tbWl0IHRvIGVsZW1lbnQgYmluZGluZycsXG4gICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgIH0pO1xuICAgIHJlc29sdmVEaXJlY3RpdmUodGhpcywgdmFsdWUpO1xuICB9XG59XG5cbi8qKlxuICogRU5EIFVTRVJTIFNIT1VMRCBOT1QgUkVMWSBPTiBUSElTIE9CSkVDVC5cbiAqXG4gKiBQcml2YXRlIGV4cG9ydHMgZm9yIHVzZSBieSBvdGhlciBMaXQgcGFja2FnZXMsIG5vdCBpbnRlbmRlZCBmb3IgdXNlIGJ5XG4gKiBleHRlcm5hbCB1c2Vycy5cbiAqXG4gKiBXZSBjdXJyZW50bHkgZG8gbm90IG1ha2UgYSBtYW5nbGVkIHJvbGx1cCBidWlsZCBvZiB0aGUgbGl0LXNzciBjb2RlLiBJbiBvcmRlclxuICogdG8ga2VlcCBhIG51bWJlciBvZiAob3RoZXJ3aXNlIHByaXZhdGUpIHRvcC1sZXZlbCBleHBvcnRzIG1hbmdsZWQgaW4gdGhlXG4gKiBjbGllbnQgc2lkZSBjb2RlLCB3ZSBleHBvcnQgYSBfJExIIG9iamVjdCBjb250YWluaW5nIHRob3NlIG1lbWJlcnMgKG9yXG4gKiBoZWxwZXIgbWV0aG9kcyBmb3IgYWNjZXNzaW5nIHByaXZhdGUgZmllbGRzIG9mIHRob3NlIG1lbWJlcnMpLCBhbmQgdGhlblxuICogcmUtZXhwb3J0IHRoZW0gZm9yIHVzZSBpbiBsaXQtc3NyLiBUaGlzIGtlZXBzIGxpdC1zc3IgYWdub3N0aWMgdG8gd2hldGhlciB0aGVcbiAqIGNsaWVudC1zaWRlIGNvZGUgaXMgYmVpbmcgdXNlZCBpbiBgZGV2YCBtb2RlIG9yIGBwcm9kYCBtb2RlLlxuICpcbiAqIFRoaXMgaGFzIGEgdW5pcXVlIG5hbWUsIHRvIGRpc2FtYmlndWF0ZSBpdCBmcm9tIHByaXZhdGUgZXhwb3J0cyBpblxuICogbGl0LWVsZW1lbnQsIHdoaWNoIHJlLWV4cG9ydHMgYWxsIG9mIGxpdC1odG1sLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBfJExIID0ge1xuICAvLyBVc2VkIGluIGxpdC1zc3JcbiAgX2JvdW5kQXR0cmlidXRlU3VmZml4OiBib3VuZEF0dHJpYnV0ZVN1ZmZpeCxcbiAgX21hcmtlcjogbWFya2VyLFxuICBfbWFya2VyTWF0Y2g6IG1hcmtlck1hdGNoLFxuICBfSFRNTF9SRVNVTFQ6IEhUTUxfUkVTVUxULFxuICBfZ2V0VGVtcGxhdGVIdG1sOiBnZXRUZW1wbGF0ZUh0bWwsXG4gIC8vIFVzZWQgaW4gdGVzdHMgYW5kIHByaXZhdGUtc3NyLXN1cHBvcnRcbiAgX1RlbXBsYXRlSW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2UsXG4gIF9pc0l0ZXJhYmxlOiBpc0l0ZXJhYmxlLFxuICBfcmVzb2x2ZURpcmVjdGl2ZTogcmVzb2x2ZURpcmVjdGl2ZSxcbiAgX0NoaWxkUGFydDogQ2hpbGRQYXJ0LFxuICBfQXR0cmlidXRlUGFydDogQXR0cmlidXRlUGFydCxcbiAgX0Jvb2xlYW5BdHRyaWJ1dGVQYXJ0OiBCb29sZWFuQXR0cmlidXRlUGFydCxcbiAgX0V2ZW50UGFydDogRXZlbnRQYXJ0LFxuICBfUHJvcGVydHlQYXJ0OiBQcm9wZXJ0eVBhcnQsXG4gIF9FbGVtZW50UGFydDogRWxlbWVudFBhcnQsXG59O1xuXG4vLyBBcHBseSBwb2x5ZmlsbHMgaWYgYXZhaWxhYmxlXG5jb25zdCBwb2x5ZmlsbFN1cHBvcnQgPSBERVZfTU9ERVxuICA/IGdsb2JhbC5saXRIdG1sUG9seWZpbGxTdXBwb3J0RGV2TW9kZVxuICA6IGdsb2JhbC5saXRIdG1sUG9seWZpbGxTdXBwb3J0O1xucG9seWZpbGxTdXBwb3J0Py4oVGVtcGxhdGUsIENoaWxkUGFydCk7XG5cbi8vIElNUE9SVEFOVDogZG8gbm90IGNoYW5nZSB0aGUgcHJvcGVydHkgbmFtZSBvciB0aGUgYXNzaWdubWVudCBleHByZXNzaW9uLlxuLy8gVGhpcyBsaW5lIHdpbGwgYmUgdXNlZCBpbiByZWdleGVzIHRvIHNlYXJjaCBmb3IgbGl0LWh0bWwgdXNhZ2UuXG4oZ2xvYmFsLmxpdEh0bWxWZXJzaW9ucyA/Pz0gW10pLnB1c2goJzMuMi4xJyk7XG5pZiAoREVWX01PREUgJiYgZ2xvYmFsLmxpdEh0bWxWZXJzaW9ucy5sZW5ndGggPiAxKSB7XG4gIGlzc3VlV2FybmluZyEoXG4gICAgJ211bHRpcGxlLXZlcnNpb25zJyxcbiAgICBgTXVsdGlwbGUgdmVyc2lvbnMgb2YgTGl0IGxvYWRlZC4gYCArXG4gICAgICBgTG9hZGluZyBtdWx0aXBsZSB2ZXJzaW9ucyBpcyBub3QgcmVjb21tZW5kZWQuYFxuICApO1xufVxuXG4vKipcbiAqIFJlbmRlcnMgYSB2YWx1ZSwgdXN1YWxseSBhIGxpdC1odG1sIFRlbXBsYXRlUmVzdWx0LCB0byB0aGUgY29udGFpbmVyLlxuICpcbiAqIFRoaXMgZXhhbXBsZSByZW5kZXJzIHRoZSB0ZXh0IFwiSGVsbG8sIFpvZSFcIiBpbnNpZGUgYSBwYXJhZ3JhcGggdGFnLCBhcHBlbmRpbmdcbiAqIGl0IHRvIHRoZSBjb250YWluZXIgYGRvY3VtZW50LmJvZHlgLlxuICpcbiAqIGBgYGpzXG4gKiBpbXBvcnQge2h0bWwsIHJlbmRlcn0gZnJvbSAnbGl0JztcbiAqXG4gKiBjb25zdCBuYW1lID0gXCJab2VcIjtcbiAqIHJlbmRlcihodG1sYDxwPkhlbGxvLCAke25hbWV9ITwvcD5gLCBkb2N1bWVudC5ib2R5KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB2YWx1ZSBBbnkgW3JlbmRlcmFibGVcbiAqICAgdmFsdWVdKGh0dHBzOi8vbGl0LmRldi9kb2NzL3RlbXBsYXRlcy9leHByZXNzaW9ucy8jY2hpbGQtZXhwcmVzc2lvbnMpLFxuICogICB0eXBpY2FsbHkgYSB7QGxpbmtjb2RlIFRlbXBsYXRlUmVzdWx0fSBjcmVhdGVkIGJ5IGV2YWx1YXRpbmcgYSB0ZW1wbGF0ZSB0YWdcbiAqICAgbGlrZSB7QGxpbmtjb2RlIGh0bWx9IG9yIHtAbGlua2NvZGUgc3ZnfS5cbiAqIEBwYXJhbSBjb250YWluZXIgQSBET00gY29udGFpbmVyIHRvIHJlbmRlciB0by4gVGhlIGZpcnN0IHJlbmRlciB3aWxsIGFwcGVuZFxuICogICB0aGUgcmVuZGVyZWQgdmFsdWUgdG8gdGhlIGNvbnRhaW5lciwgYW5kIHN1YnNlcXVlbnQgcmVuZGVycyB3aWxsXG4gKiAgIGVmZmljaWVudGx5IHVwZGF0ZSB0aGUgcmVuZGVyZWQgdmFsdWUgaWYgdGhlIHNhbWUgcmVzdWx0IHR5cGUgd2FzXG4gKiAgIHByZXZpb3VzbHkgcmVuZGVyZWQgdGhlcmUuXG4gKiBAcGFyYW0gb3B0aW9ucyBTZWUge0BsaW5rY29kZSBSZW5kZXJPcHRpb25zfSBmb3Igb3B0aW9ucyBkb2N1bWVudGF0aW9uLlxuICogQHNlZVxuICoge0BsaW5rIGh0dHBzOi8vbGl0LmRldi9kb2NzL2xpYnJhcmllcy9zdGFuZGFsb25lLXRlbXBsYXRlcy8jcmVuZGVyaW5nLWxpdC1odG1sLXRlbXBsYXRlc3wgUmVuZGVyaW5nIExpdCBIVE1MIFRlbXBsYXRlc31cbiAqL1xuZXhwb3J0IGNvbnN0IHJlbmRlciA9IChcbiAgdmFsdWU6IHVua25vd24sXG4gIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LFxuICBvcHRpb25zPzogUmVuZGVyT3B0aW9uc1xuKTogUm9vdFBhcnQgPT4ge1xuICBpZiAoREVWX01PREUgJiYgY29udGFpbmVyID09IG51bGwpIHtcbiAgICAvLyBHaXZlIGEgY2xlYXJlciBlcnJvciBtZXNzYWdlIHRoYW5cbiAgICAvLyAgICAgVW5jYXVnaHQgVHlwZUVycm9yOiBDYW5ub3QgcmVhZCBwcm9wZXJ0aWVzIG9mIG51bGwgKHJlYWRpbmdcbiAgICAvLyAgICAgJ18kbGl0UGFydCQnKVxuICAgIC8vIHdoaWNoIHJlYWRzIGxpa2UgYW4gaW50ZXJuYWwgTGl0IGVycm9yLlxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBjb250YWluZXIgdG8gcmVuZGVyIGludG8gbWF5IG5vdCBiZSAke2NvbnRhaW5lcn1gKTtcbiAgfVxuICBjb25zdCByZW5kZXJJZCA9IERFVl9NT0RFID8gZGVidWdMb2dSZW5kZXJJZCsrIDogMDtcbiAgY29uc3QgcGFydE93bmVyTm9kZSA9IG9wdGlvbnM/LnJlbmRlckJlZm9yZSA/PyBjb250YWluZXI7XG4gIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIGxldCBwYXJ0OiBDaGlsZFBhcnQgPSAocGFydE93bmVyTm9kZSBhcyBhbnkpWydfJGxpdFBhcnQkJ107XG4gIGRlYnVnTG9nRXZlbnQgJiZcbiAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgIGtpbmQ6ICdiZWdpbiByZW5kZXInLFxuICAgICAgaWQ6IHJlbmRlcklkLFxuICAgICAgdmFsdWUsXG4gICAgICBjb250YWluZXIsXG4gICAgICBvcHRpb25zLFxuICAgICAgcGFydCxcbiAgICB9KTtcbiAgaWYgKHBhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGVuZE5vZGUgPSBvcHRpb25zPy5yZW5kZXJCZWZvcmUgPz8gbnVsbDtcbiAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgKHBhcnRPd25lck5vZGUgYXMgYW55KVsnXyRsaXRQYXJ0JCddID0gcGFydCA9IG5ldyBDaGlsZFBhcnQoXG4gICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCBlbmROb2RlKSxcbiAgICAgIGVuZE5vZGUsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICBvcHRpb25zID8/IHt9XG4gICAgKTtcbiAgfVxuICBwYXJ0Ll8kc2V0VmFsdWUodmFsdWUpO1xuICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgZGVidWdMb2dFdmVudCh7XG4gICAgICBraW5kOiAnZW5kIHJlbmRlcicsXG4gICAgICBpZDogcmVuZGVySWQsXG4gICAgICB2YWx1ZSxcbiAgICAgIGNvbnRhaW5lcixcbiAgICAgIG9wdGlvbnMsXG4gICAgICBwYXJ0LFxuICAgIH0pO1xuICByZXR1cm4gcGFydCBhcyBSb290UGFydDtcbn07XG5cbmlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgcmVuZGVyLnNldFNhbml0aXplciA9IHNldFNhbml0aXplcjtcbiAgcmVuZGVyLmNyZWF0ZVNhbml0aXplciA9IGNyZWF0ZVNhbml0aXplcjtcbiAgaWYgKERFVl9NT0RFKSB7XG4gICAgcmVuZGVyLl90ZXN0T25seUNsZWFyU2FuaXRpemVyRmFjdG9yeURvTm90Q2FsbE9yRWxzZSA9XG4gICAgICBfdGVzdE9ubHlDbGVhclNhbml0aXplckZhY3RvcnlEb05vdENhbGxPckVsc2U7XG4gIH1cbn1cbiIsICIvKiogUmVzdWx0IGFsbG93cyBlYXNpZXIgaGFuZGxpbmcgb2YgcmV0dXJuaW5nIGVpdGhlciBhbiBlcnJvciBvciBhIHZhbHVlIGZyb20gYVxuICogZnVuY3Rpb24uICovXG5leHBvcnQgdHlwZSBSZXN1bHQ8VD4gPSB7IG9rOiB0cnVlOyB2YWx1ZTogVCB9IHwgeyBvazogZmFsc2U7IGVycm9yOiBFcnJvciB9O1xuXG5leHBvcnQgZnVuY3Rpb24gb2s8VD4odmFsdWU6IFQpOiBSZXN1bHQ8VD4ge1xuICByZXR1cm4geyBvazogdHJ1ZSwgdmFsdWU6IHZhbHVlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcnJvcjxUPih2YWx1ZTogc3RyaW5nIHwgRXJyb3IpOiBSZXN1bHQ8VD4ge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogbmV3IEVycm9yKHZhbHVlKSB9O1xuICB9XG4gIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IHZhbHVlIH07XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IE9wIH0gZnJvbSBcIi4uL29wcy9vcHNcIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vcmVzdWx0XCI7XG5cbmV4cG9ydCB0eXBlIFBvc3RBY3RvbldvcmsgPSBcIlwiIHwgXCJwYWludENoYXJ0XCIgfCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrO1xuICAvLyBUT0RPIC0gRG8gd2UgbmVlZCBhIFBvc3RBY3Rpb25Gb2N1czogbnVtYmVyIHdoaWNoIHBvaW50cyB0byB0aGUgVGFzayB3ZSBzaG91bGQgbW92ZSB0aGUgZm9jdXMgdG8/XG4gIHVuZG86IGJvb2xlYW47IC8vIElmIHRydWUgaW5jbHVkZSBpbiB1bmRvL3JlZG8gYWN0aW9ucy5cbiAgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+O1xufVxuXG5leHBvcnQgY2xhc3MgTk9PUEFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkRvZXMgbm90aGluZ1wiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIHJldHVybiBvayhuZXcgTk9PUEFjdGlvbigpKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWN0aW9uRnJvbU9wIHtcbiAgbmFtZTogc3RyaW5nID0gXCJBY3Rpb25Gcm9tT3BcIjtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiQWN0aW9uIGNvbnN0cnVjdGVkIGRpcmVjdGx5IGZyb20gYW4gT3AuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrO1xuICB1bmRvOiBib29sZWFuO1xuXG4gIG9wOiBPcDtcblxuICBjb25zdHJ1Y3RvcihvcDogT3AsIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrLCB1bmRvOiBib29sZWFuKSB7XG4gICAgdGhpcy5wb3N0QWN0aW9uV29yayA9IHBvc3RBY3Rpb25Xb3JrO1xuICAgIHRoaXMudW5kbyA9IHVuZG87XG4gICAgdGhpcy5vcCA9IG9wO1xuICB9XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBjb25zdCByZXQgPSB0aGlzLm9wLmFwcGx5VG8oZXhwbGFuTWFpbi5wbGFuKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0dXJuIG9rKFxuICAgICAgbmV3IEFjdGlvbkZyb21PcChyZXQudmFsdWUuaW52ZXJzZSwgdGhpcy5wb3N0QWN0aW9uV29yaywgdGhpcy51bmRvKVxuICAgICk7XG4gIH1cbn1cbiIsICIvKiogT25lIHZlcnRleCBvZiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgVmVydGV4ID0gb2JqZWN0O1xuXG4vKiogRXZlcnkgVmVydGV4IGluIGEgZ3JhcGguICovXG5leHBvcnQgdHlwZSBWZXJ0aWNlcyA9IFZlcnRleFtdO1xuXG4vKiogQSBzdWJzZXQgb2YgVmVydGljZXMgcmVmZXJyZWQgdG8gYnkgdGhlaXIgaW5kZXggbnVtYmVyLiAqL1xuZXhwb3J0IHR5cGUgVmVydGV4SW5kaWNlcyA9IG51bWJlcltdO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQge1xuICBpOiBudW1iZXI7XG4gIGo6IG51bWJlcjtcbn1cblxuLyoqIE9uZSBlZGdlIG9mIGEgZ3JhcGgsIHdoaWNoIGlzIGEgZGlyZWN0ZWQgY29ubmVjdGlvbiBmcm9tIHRoZSBpJ3RoIFZlcnRleCB0b1xudGhlIGondGggVmVydGV4LCB3aGVyZSB0aGUgVmVydGV4IGlzIHN0b3JlZCBpbiBhIFZlcnRpY2VzLlxuICovXG5leHBvcnQgY2xhc3MgRGlyZWN0ZWRFZGdlIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIgPSAwLCBqOiBudW1iZXIgPSAwKSB7XG4gICAgdGhpcy5pID0gaTtcbiAgICB0aGlzLmogPSBqO1xuICB9XG5cbiAgZXF1YWwocmhzOiBEaXJlY3RlZEVkZ2UpOiBib29sZWFuIHtcbiAgICByZXR1cm4gcmhzLmkgPT09IHRoaXMuaSAmJiByaHMuaiA9PT0gdGhpcy5qO1xuICB9XG5cbiAgdG9KU09OKCk6IERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBpOiB0aGlzLmksXG4gICAgICBqOiB0aGlzLmosXG4gICAgfTtcbiAgfVxufVxuXG4vKiogRXZlcnkgRWdkZSBpbiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgRWRnZXMgPSBEaXJlY3RlZEVkZ2VbXTtcblxuLyoqIEEgZ3JhcGggaXMganVzdCBhIGNvbGxlY3Rpb24gb2YgVmVydGljZXMgYW5kIEVkZ2VzIGJldHdlZW4gdGhvc2UgdmVydGljZXMuICovXG5leHBvcnQgdHlwZSBEaXJlY3RlZEdyYXBoID0ge1xuICBWZXJ0aWNlczogVmVydGljZXM7XG4gIEVkZ2VzOiBFZGdlcztcbn07XG5cbi8qKlxuIEdyb3VwcyB0aGUgRWRnZXMgYnkgdGhlaXIgYGlgIHZhbHVlLlxuXG4gQHBhcmFtIGVkZ2VzIC0gQWxsIHRoZSBFZ2VzIGluIGEgRGlyZWN0ZWRHcmFwaC5cbiBAcmV0dXJucyBBIG1hcCBmcm9tIHRoZSBWZXJ0ZXggaW5kZXggdG8gYWxsIHRoZSBFZGdlcyB0aGF0IHN0YXJ0IGF0XG4gICBhdCB0aGF0IFZlcnRleCBpbmRleC5cbiAqL1xuZXhwb3J0IGNvbnN0IGVkZ2VzQnlTcmNUb01hcCA9IChlZGdlczogRWRnZXMpOiBNYXA8bnVtYmVyLCBFZGdlcz4gPT4ge1xuICBjb25zdCByZXQgPSBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCk7XG5cbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgY29uc3QgYXJyID0gcmV0LmdldChlLmkpIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5zZXQoZS5pLCBhcnIpO1xuICB9KTtcblxuICByZXR1cm4gcmV0O1xufTtcblxuLyoqXG4gICBHcm91cHMgdGhlIEVkZ2VzIGJ5IHRoZWlyIGBqYCB2YWx1ZS5cbiAgXG4gICBAcGFyYW0gZWRnZXMgLSBBbGwgdGhlIEVkZ2VzIGluIGEgRGlyZWN0ZWRHcmFwaC5cbiAgIEByZXR1cm5zIEEgbWFwIGZyb20gdGhlIFZlcnRleCBpbmRleCB0byBhbGwgdGhlIEVkZ2VzIHRoYXQgZW5kIGF0XG4gICAgIGF0IHRoYXQgVmVydGV4IGluZGV4LlxuICAgKi9cblxuZXhwb3J0IGNvbnN0IGVkZ2VzQnlEc3RUb01hcCA9IChlZGdlczogRWRnZXMpOiBNYXA8bnVtYmVyLCBFZGdlcz4gPT4ge1xuICBjb25zdCByZXQgPSBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCk7XG5cbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgY29uc3QgYXJyID0gcmV0LmdldChlLmopIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5zZXQoZS5qLCBhcnIpO1xuICB9KTtcblxuICByZXR1cm4gcmV0O1xufTtcblxuZXhwb3J0IHR5cGUgU3JjQW5kRHN0UmV0dXJuID0ge1xuICBieVNyYzogTWFwPG51bWJlciwgRWRnZXM+O1xuICBieURzdDogTWFwPG51bWJlciwgRWRnZXM+O1xufTtcblxuZXhwb3J0IGNvbnN0IGVkZ2VzQnlTcmNBbmREc3RUb01hcCA9IChlZGdlczogRWRnZXMpOiBTcmNBbmREc3RSZXR1cm4gPT4ge1xuICBjb25zdCByZXQgPSB7XG4gICAgYnlTcmM6IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKSxcbiAgICBieURzdDogbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpLFxuICB9O1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGxldCBhcnIgPSByZXQuYnlTcmMuZ2V0KGUuaSkgfHwgW107XG4gICAgYXJyLnB1c2goZSk7XG4gICAgcmV0LmJ5U3JjLnNldChlLmksIGFycik7XG4gICAgYXJyID0gcmV0LmJ5RHN0LmdldChlLmopIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5ieURzdC5zZXQoZS5qLCBhcnIpO1xuICB9KTtcblxuICByZXR1cm4gcmV0O1xufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcblxuLy8gT3BlcmF0aW9ucyBvbiBQbGFucy4gTm90ZSB0aGV5IGFyZSByZXZlcnNpYmxlLCBzbyB3ZSBjYW4gaGF2ZSBhbiAndW5kbycgbGlzdC5cblxuLy8gQWxzbywgc29tZSBvcGVyYXRpb25zIG1pZ2h0IGhhdmUgJ3BhcnRpYWxzJywgaS5lLiByZXR1cm4gYSBsaXN0IG9mIHZhbGlkXG4vLyBvcHRpb25zIHRoYXQgY2FuIGJlIHBhc3NlZCB0byB0aGUgb3BlcmF0aW9uLiBGb3IgZXhhbXBsZSwgYWRkaW5nIGFcbi8vIHByZWRlY2Vzc29yIGNvdWxkIGxpc3QgYWxsIHRoZSBUYXNrcyB0aGF0IHdvdWxkIG5vdCBmb3JtIGEgbG9vcCwgaS5lLiBleGNsdWRlXG4vLyBhbGwgZGVzY2VuZGVudHMsIGFuZCB0aGUgVGFzayBpdHNlbGYsIGZyb20gdGhlIGxpc3Qgb2Ygb3B0aW9ucy5cbi8vXG4vLyAqIENoYW5nZSBzdHJpbmcgdmFsdWUgaW4gYSBUYXNrLlxuLy8gKiBDaGFuZ2UgZHVyYXRpb24gdmFsdWUgaW4gYSBUYXNrLlxuLy8gKiBJbnNlcnQgbmV3IGVtcHR5IFRhc2sgYWZ0ZXIgSW5kZXguXG4vLyAqIFNwbGl0IGEgVGFzay4gKFByZWRlY2Vzc29yIHRha2VzIGFsbCBpbmNvbWluZyBlZGdlcywgc291cmNlIHRhc2tzIGFsbCBvdXRnb2luZyBlZGdlcykuXG4vL1xuLy8gKiBEdXBsaWNhdGUgYSBUYXNrIChhbGwgZWRnZXMgYXJlIGR1cGxpY2F0ZWQgZnJvbSB0aGUgc291cmNlIFRhc2spLlxuLy8gKiBEZWxldGUgcHJlZGVjZXNzb3IgdG8gYSBUYXNrLlxuLy8gKiBEZWxldGUgc3VjY2Vzc29yIHRvIGEgVGFzay5cbi8vICogRGVsZXRlIGEgVGFzay5cblxuLy8gTmVlZCBVbmRvL1JlZG8gU3RhY2tzLlxuLy8gVGhlc2UgcmVjb3JkIHRoZSBzdWItb3BzIGZvciBlYWNoIGxhcmdlIG9wLiBFLmcuIGFuIGluc2VydCB0YXNrIG9wIGlzIG1hZGVcbi8vIG9mIHRocmVlIHN1Yi1vcHM6XG4vLyAgICAxLiBpbnNlcnQgdGFzayBpbnRvIFZlcnRpY2VzIGFuZCByZW51bWJlciBFZGdlc1xuLy8gICAgMi4gQWRkIGVkZ2UgZnJvbSBTdGFydCB0byBOZXcgVGFza1xuLy8gICAgMy4gQWRkIGVkZ2UgZnJvbSBOZXcgVGFzayB0byBGaW5pc2hcbi8vXG4vLyBFYWNoIHN1Yi1vcDpcbi8vICAgIDEuIFJlY29yZHMgYWxsIHRoZSBpbmZvIGl0IG5lZWRzIHRvIHdvcmsuXG4vLyAgICAyLiBDYW4gYmUgXCJhcHBsaWVkXCIgdG8gYSBQbGFuLlxuLy8gICAgMy4gQ2FuIGdlbmVyYXRlIGl0cyBpbnZlcnNlIHN1Yi1vcC5cblxuLy8gVGhlIHJlc3VsdHMgZnJvbSBhcHBseWluZyBhIFN1Yk9wLiBUaGlzIGlzIHRoZSBvbmx5IHdheSB0byBnZXQgdGhlIGludmVyc2Ugb2Zcbi8vIGEgU3ViT3Agc2luY2UgdGhlIFN1Yk9wIGludmVyc2UgbWlnaHQgZGVwZW5kIG9uIHRoZSBzdGF0ZSBvZiB0aGUgUGxhbiBhdCB0aGVcbi8vIHRpbWUgdGhlIFN1Yk9wIHdhcyBhcHBsaWVkLlxuZXhwb3J0IGludGVyZmFjZSBTdWJPcFJlc3VsdCB7XG4gIHBsYW46IFBsYW47XG4gIGludmVyc2U6IFN1Yk9wO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN1Yk9wIHtcbiAgLy8gSWYgdGhlIGFwcGx5IHJldHVybnMgYW4gZXJyb3IgaXQgaXMgZ3VhcmFudGVlZCBub3QgdG8gaGF2ZSBtb2RpZmllZCB0aGVcbiAgLy8gUGxhbi5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcFJlc3VsdCB7XG4gIHBsYW46IFBsYW47XG4gIGludmVyc2U6IE9wO1xufVxuXG4vLyBPcCBhcmUgb3BlcmF0aW9ucyBhcmUgYXBwbGllZCB0byBtYWtlIGNoYW5nZXMgdG8gYSBQbGFuLlxuZXhwb3J0IGNsYXNzIE9wIHtcbiAgc3ViT3BzOiBTdWJPcFtdID0gW107XG5cbiAgY29uc3RydWN0b3Ioc3ViT3BzOiBTdWJPcFtdKSB7XG4gICAgdGhpcy5zdWJPcHMgPSBzdWJPcHM7XG4gIH1cblxuICAvLyBSZXZlcnRzIGFsbCBTdWJPcHMgdXAgdG8gdGhlIGdpdmVuIGluZGV4LlxuICBhcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4oXG4gICAgcGxhbjogUGxhbixcbiAgICBpbnZlcnNlU3ViT3BzOiBTdWJPcFtdXG4gICk6IFJlc3VsdDxQbGFuPiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnZlcnNlU3ViT3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlID0gaW52ZXJzZVN1Yk9wc1tpXS5hcHBseVRvKHBsYW4pO1xuICAgICAgaWYgKCFlLm9rKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgICAgcGxhbiA9IGUudmFsdWUucGxhbjtcbiAgICB9XG5cbiAgICByZXR1cm4gb2socGxhbik7XG4gIH1cblxuICAvLyBBcHBsaWVzIHRoZSBPcCB0byBhIFBsYW4uXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGludmVyc2VTdWJPcHM6IFN1Yk9wW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc3ViT3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlID0gdGhpcy5zdWJPcHNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICAvLyBSZXZlcnQgYWxsIHRoZSBTdWJPcHMgYXBwbGllZCB1cCB0byB0aGlzIHBvaW50IHRvIGdldCB0aGUgUGxhbiBiYWNrIGluIGFcbiAgICAgICAgLy8gZ29vZCBwbGFjZS5cbiAgICAgICAgY29uc3QgcmV2ZXJ0RXJyID0gdGhpcy5hcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4ocGxhbiwgaW52ZXJzZVN1Yk9wcyk7XG4gICAgICAgIGlmICghcmV2ZXJ0RXJyLm9rKSB7XG4gICAgICAgICAgcmV0dXJuIHJldmVydEVycjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgICBpbnZlcnNlU3ViT3BzLnVuc2hpZnQoZS52YWx1ZS5pbnZlcnNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IG5ldyBPcChpbnZlcnNlU3ViT3BzKSxcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBBbGxPcHNSZXN1bHQgPSB7XG4gIG9wczogT3BbXTtcbiAgcGxhbjogUGxhbjtcbn07XG5cbmNvbnN0IGFwcGx5QWxsSW52ZXJzZU9wc1RvUGxhbiA9IChpbnZlcnNlczogT3BbXSwgcGxhbjogUGxhbik6IFJlc3VsdDxQbGFuPiA9PiB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaW52ZXJzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByZXMgPSBpbnZlcnNlc1tpXS5hcHBseVRvKHBsYW4pO1xuICAgIGlmICghcmVzLm9rKSB7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBwbGFuID0gcmVzLnZhbHVlLnBsYW47XG4gIH1cblxuICByZXR1cm4gb2socGxhbik7XG59O1xuXG4vLyBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgYXBwbHlpbmcgbXVsdGlwbGUgT3BzIHRvIGEgcGxhbiwgdXNlZCBtb3N0bHkgZm9yXG4vLyB0ZXN0aW5nLlxuZXhwb3J0IGNvbnN0IGFwcGx5QWxsT3BzVG9QbGFuID0gKFxuICBvcHM6IE9wW10sXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxBbGxPcHNSZXN1bHQ+ID0+IHtcbiAgY29uc3QgaW52ZXJzZXM6IE9wW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByZXMgPSBvcHNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgY29uc3QgaW52ZXJzZVJlcyA9IGFwcGx5QWxsSW52ZXJzZU9wc1RvUGxhbihpbnZlcnNlcywgcGxhbik7XG4gICAgICBpZiAoIWludmVyc2VSZXMub2spIHtcbiAgICAgICAgLy8gVE9ETyBDYW4gd2Ugd3JhcCB0aGUgRXJyb3IgaW4gYW5vdGhlciBlcnJvciB0byBtYWtlIGl0IGNsZWFyIHRoaXNcbiAgICAgICAgLy8gZXJyb3IgaGFwcGVuZWQgd2hlbiB0cnlpbmcgdG8gY2xlYW4gdXAgZnJvbSB0aGUgcHJldmlvdXMgRXJyb3Igd2hlblxuICAgICAgICAvLyB0aGUgYXBwbHkoKSBmYWlsZWQuXG4gICAgICAgIHJldHVybiBpbnZlcnNlUmVzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgaW52ZXJzZXMudW5zaGlmdChyZXMudmFsdWUuaW52ZXJzZSk7XG4gICAgcGxhbiA9IHJlcy52YWx1ZS5wbGFuO1xuICB9XG5cbiAgcmV0dXJuIG9rKHtcbiAgICBvcHM6IGludmVyc2VzLFxuICAgIHBsYW46IHBsYW4sXG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGFwcGx5QWxsT3BzVG9QbGFuQW5kVGhlbkludmVyc2UgPSAoXG4gIG9wczogT3BbXSxcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PEFsbE9wc1Jlc3VsdD4gPT4ge1xuICBjb25zdCByZXMgPSBhcHBseUFsbE9wc1RvUGxhbihvcHMsIHBsYW4pO1xuICBpZiAoIXJlcy5vaykge1xuICAgIHJldHVybiByZXM7XG4gIH1cbiAgcmV0dXJuIGFwcGx5QWxsT3BzVG9QbGFuKHJlcy52YWx1ZS5vcHMsIHJlcy52YWx1ZS5wbGFuKTtcbn07XG4vLyBOb09wIGlzIGEgbm8tb3AuXG5leHBvcnQgZnVuY3Rpb24gTm9PcCgpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW10pO1xufVxuIiwgIi8vIENoYW5nZU1ldHJpY1ZhbHVlXG5cbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBlcnJvciwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBPcCwgU3ViT3AsIFN1Yk9wUmVzdWx0IH0gZnJvbSBcIi4vb3BzLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiBtZXRyaWMga2V5LlxuICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbiA9IG1ldHJpY0RlZmluaXRpb247XG4gICAgdGhpcy50YXNrTWV0cmljVmFsdWVzID0gdGFza01ldHJpY1ZhbHVlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmIChwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uYW1lfSBhbHJlYWR5IGV4aXN0cyBhcyBhIE1ldHJpY2ApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUsIHRoaXMubWV0cmljRGVmaW5pdGlvbik7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGFkZCB0aGlzIG1ldHJpYyBhbmQgc2V0IGl0IHRvIHRoZSBkZWZhdWx0LFxuICAgIC8vIHVubGVzcyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrTWV0cmljVmFsdWVzLCBpbiB3aGljaCBjYXNlIHdlIHdpbGxcbiAgICAvLyB1c2UgdGhhdCB2YWx1ZSwgaS5lLiB0aGlzIEFkZE1ldHJpY1N1Yk9wIGlzIGFjdHVhbGx5IGEgcmV2ZXJ0IG9mIGFcbiAgICAvLyBEZWxldGVNZXRyaWNTdWJPcC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIHRhc2suc2V0TWV0cmljKFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcy5nZXQoaW5kZXgpIHx8IHRoaXMubWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZU1ldHJpY1N1Yk9wKHRoaXMubmFtZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZU1ldHJpY1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcblxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYFRoZSBtZXRyaWMgd2l0aCBuYW1lICR7dGhpcy5uYW1lfSBkb2VzIG5vdCBleGlzdCBhbmQgY2FuJ3QgYmUgZGVsZXRlZC5gXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFRoZSBzdGF0aWMgTWV0cmljICR7dGhpcy5uYW1lfSBjYW4ndCBiZSBkZWxldGVkLmApO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBmcm9tIHJlc291cmNlIGRlZmluaXRpb25zLlxuICAgIHBsYW4uZGVsZXRlTWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuXG4gICAgY29uc3QgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWU6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHJlbW92ZSBgdGhpcy5uYW1lYCBmcm9tIHRoZSBtZXRyaWMgd2hpbGUgYWxzb1xuICAgIC8vIGJ1aWxkaW5nIHVwIHRoZSBpbmZvIG5lZWRlZCBmb3IgYSByZXZlcnQuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMubmFtZSk7XG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZS5zZXQoaW5kZXgsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRhc2suZGVsZXRlTWV0cmljKHRoaXMubmFtZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShtZXRyaWNEZWZpbml0aW9uLCB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZSksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICBtZXRyaWNWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VOYW1lOiBNYXA8bnVtYmVyLCBudW1iZXI+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZE1ldHJpY1N1Yk9wKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgbWV0cmljRGVmaW5pdGlvbixcbiAgICAgIG1ldHJpY1ZhbHVlc0ZvckRlbGV0ZWRSZXNvdXJjZU5hbWVcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgb2xkTmFtZTogc3RyaW5nO1xuICBuZXdOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob2xkTmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLm9sZE5hbWUgPSBvbGROYW1lO1xuICAgIHRoaXMubmV3TmFtZSA9IG5ld05hbWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAocGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmV3TmFtZSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmV3TmFtZX0gYWxyZWFkeSBleGlzdHMgYXMgYSBtZXRyaWMuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0cmljRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm9sZE5hbWUpO1xuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm9sZE5hbWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgTWV0cmljYCk7XG4gICAgfVxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFN0YXRpYyBtZXRyaWMgJHt0aGlzLm9sZE5hbWV9IGNhbid0IGJlIHJlbmFtZWQuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmV3TmFtZSwgbWV0cmljRGVmaW5pdGlvbik7XG4gICAgcGxhbi5kZWxldGVNZXRyaWNEZWZpbml0aW9uKHRoaXMub2xkTmFtZSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIHJlbmFtZSB0aGlzIG1ldHJpYy5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5vbGROYW1lKSB8fCBtZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgICB0YXNrLnNldE1ldHJpYyh0aGlzLm5ld05hbWUsIHZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlTWV0cmljKHRoaXMub2xkTmFtZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVuYW1lTWV0cmljU3ViT3AodGhpcy5uZXdOYW1lLCB0aGlzLm9sZE5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiBtZXRyaWMga2V5LlxuICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbiA9IG1ldHJpY0RlZmluaXRpb247XG4gICAgdGhpcy50YXNrTWV0cmljVmFsdWVzID0gdGFza01ldHJpY1ZhbHVlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG9sZE1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcbiAgICBpZiAob2xkTWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cbiAgICBpZiAob2xkTWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBTdGF0aWMgbWV0cmljICR7dGhpcy5uYW1lfSBjYW4ndCBiZSB1cGRhdGVkLmApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUsIHRoaXMubWV0cmljRGVmaW5pdGlvbik7XG5cbiAgICBjb25zdCB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgdXBkYXRlIHRoZSBtZXRyaWMgdmFsdWVzIHRvIHJlZmxlY3QgdGhlIG5ld1xuICAgIC8vIG1ldHJpYyBkZWZpbml0aW9uLCB1bmxlc3MgdGhlcmUgaXMgbWF0Y2hpbmcgZW50cnkgaW4gdGFza01ldHJpY1ZhbHVlcywgaW5cbiAgICAvLyB3aGljaCBjYXNlIHdlIHdpbGwgdXNlIHRoYXQgdmFsdWUsIGkuZS4gdGhpcyBVcGRhdGVNZXRyaWNTdWJPcCBpc1xuICAgIC8vIGFjdHVhbGx5IGEgcmV2ZXJ0IG9mIGFub3RoZXIgVXBkYXRlTWV0cmljU3ViT3AuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMubmFtZSkhO1xuXG4gICAgICBsZXQgbmV3VmFsdWU6IG51bWJlcjtcbiAgICAgIGlmICh0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuaGFzKGluZGV4KSkge1xuICAgICAgICAvLyB0YXNrTWV0cmljVmFsdWVzIGhhcyBhIHZhbHVlIHRoZW4gdXNlIHRoYXQsIGFzIHRoaXMgaXMgYW4gaW52ZXJzZVxuICAgICAgICAvLyBvcGVyYXRpb24uXG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy50YXNrTWV0cmljVmFsdWVzLmdldChpbmRleCkhO1xuICAgICAgfSBlbHNlIGlmIChvbGRWYWx1ZSA9PT0gb2xkTWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0KSB7XG4gICAgICAgIC8vIElmIHRoZSBvbGRWYWx1ZSBpcyB0aGUgZGVmYXVsdCwgY2hhbmdlIGl0IHRvIHRoZSBuZXcgZGVmYXVsdC5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24uZGVmYXVsdDtcbiAgICAgICAgdGFza01ldHJpY1ZhbHVlcy5zZXQoaW5kZXgsIG9sZFZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENsYW1wLlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5yYW5nZS5jbGFtcChvbGRWYWx1ZSk7XG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLnByZWNpc2lvbi5yb3VuZChuZXdWYWx1ZSk7XG4gICAgICAgIHRhc2tNZXRyaWNWYWx1ZXMuc2V0KGluZGV4LCBvbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgICB0YXNrLnNldE1ldHJpYyh0aGlzLm5hbWUsIG5ld1ZhbHVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZE1ldHJpY0RlZmluaXRpb24sIHRhc2tNZXRyaWNWYWx1ZXMpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZShcbiAgICBvbGRNZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgVXBkYXRlTWV0cmljU3ViT3AoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICBvbGRNZXRyaWNEZWZpbml0aW9uLFxuICAgICAgdGFza01ldHJpY1ZhbHVlc1xuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldE1ldHJpY1ZhbHVlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmFsdWU6IG51bWJlcjtcbiAgdGFza0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyLCB0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgbWV0cmljc0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcbiAgICBpZiAobWV0cmljc0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YXNrID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF07XG4gICAgY29uc3Qgb2xkVmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpIHx8IG1ldHJpY3NEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgdGFzay5zZXRNZXRyaWMoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICBtZXRyaWNzRGVmaW5pdGlvbi5wcmVjaXNpb24ucm91bmQoXG4gICAgICAgIG1ldHJpY3NEZWZpbml0aW9uLnJhbmdlLmNsYW1wKHRoaXMudmFsdWUpXG4gICAgICApXG4gICAgKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRWYWx1ZSkgfSk7XG4gIH1cblxuICBpbnZlcnNlKHZhbHVlOiBudW1iZXIpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRNZXRyaWNWYWx1ZVN1Yk9wKHRoaXMubmFtZSwgdmFsdWUsIHRoaXMudGFza0luZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkTWV0cmljT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvblxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgQWRkTWV0cmljU3ViT3AobmFtZSwgbWV0cmljRGVmaW5pdGlvbildKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZU1ldHJpY09wKG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IERlbGV0ZU1ldHJpY1N1Yk9wKG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5hbWVNZXRyaWNPcChvbGROYW1lOiBzdHJpbmcsIG5ld05hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJlbmFtZU1ldHJpY1N1Yk9wKG9sZE5hbWUsIG5ld05hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBVcGRhdGVNZXRyaWNPcChcbiAgbmFtZTogc3RyaW5nLFxuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBVcGRhdGVNZXRyaWNTdWJPcChuYW1lLCBtZXRyaWNEZWZpbml0aW9uKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0TWV0cmljVmFsdWVPcChcbiAgbmFtZTogc3RyaW5nLFxuICB2YWx1ZTogbnVtYmVyLFxuICB0YXNrSW5kZXg6IG51bWJlclxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0TWV0cmljVmFsdWVTdWJPcChuYW1lLCB2YWx1ZSwgdGFza0luZGV4KV0pO1xufVxuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IENoYXJ0LCBUYXNrLCBUYXNrU3RhdGUgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IE9wLCBTdWJPcCwgU3ViT3BSZXN1bHQgfSBmcm9tIFwiLi9vcHMudHNcIjtcbmltcG9ydCB7IFNldE1ldHJpY1ZhbHVlT3AsIFNldE1ldHJpY1ZhbHVlU3ViT3AgfSBmcm9tIFwiLi9tZXRyaWNzLnRzXCI7XG5cbi8qKiBBIHZhbHVlIG9mIC0xIGZvciBqIG1lYW5zIHRoZSBGaW5pc2ggTWlsZXN0b25lLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIERpcmVjdGVkRWRnZUZvclBsYW4oXG4gIGk6IG51bWJlcixcbiAgajogbnVtYmVyLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8RGlyZWN0ZWRFZGdlPiB7XG4gIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgaWYgKGogPT09IC0xKSB7XG4gICAgaiA9IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gIH1cbiAgaWYgKGkgPCAwIHx8IGkgPj0gY2hhcnQuVmVydGljZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYGkgaW5kZXggb3V0IG9mIHJhbmdlOiAke2l9IG5vdCBpbiBbMCwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxfV1gXG4gICAgKTtcbiAgfVxuICBpZiAoaiA8IDAgfHwgaiA+PSBjaGFydC5WZXJ0aWNlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgaiBpbmRleCBvdXQgb2YgcmFuZ2U6ICR7an0gbm90IGluIFswLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDF9XWBcbiAgICApO1xuICB9XG4gIGlmIChpID09PSBqKSB7XG4gICAgcmV0dXJuIGVycm9yKGBBIFRhc2sgY2FuIG5vdCBkZXBlbmQgb24gaXRzZWxmOiAke2l9ID09PSAke2p9YCk7XG4gIH1cbiAgcmV0dXJuIG9rKG5ldyBEaXJlY3RlZEVkZ2UoaSwgaikpO1xufVxuXG5leHBvcnQgY2xhc3MgQWRkRWRnZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpOiBudW1iZXIgPSAwO1xuICBqOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGk6IG51bWJlciwgajogbnVtYmVyKSB7XG4gICAgdGhpcy5pID0gaTtcbiAgICB0aGlzLmogPSBqO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHRoaXMuaSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaSA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaiA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaiA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG5cbiAgICBjb25zdCBlID0gRGlyZWN0ZWRFZGdlRm9yUGxhbih0aGlzLmksIHRoaXMuaiwgcGxhbik7XG4gICAgaWYgKCFlLm9rKSB7XG4gICAgICByZXR1cm4gZTtcbiAgICB9XG5cbiAgICAvLyBPbmx5IGFkZCB0aGUgZWRnZSBpZiBpdCBkb2Vzbid0IGV4aXN0cyBhbHJlYWR5LlxuICAgIGlmICghcGxhbi5jaGFydC5FZGdlcy5maW5kKCh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiB2YWx1ZS5lcXVhbChlLnZhbHVlKSkpIHtcbiAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaChlLnZhbHVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW1vdmVFZGdlU3VwT3AodGhpcy5pLCB0aGlzLmopO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW1vdmVFZGdlU3VwT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyLCBqOiBudW1iZXIpIHtcbiAgICB0aGlzLmkgPSBpO1xuICAgIHRoaXMuaiA9IGo7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5pID09PSAtMSkge1xuICAgICAgdGhpcy5pID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5qID09PSAtMSkge1xuICAgICAgdGhpcy5qID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIGNvbnN0IGUgPSBEaXJlY3RlZEVkZ2VGb3JQbGFuKHRoaXMuaSwgdGhpcy5qLCBwbGFuKTtcbiAgICBpZiAoIWUub2spIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH1cbiAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAodjogRGlyZWN0ZWRFZGdlKTogYm9vbGVhbiA9PiAhdi5lcXVhbChlLnZhbHVlKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRFZGdlU3ViT3AodGhpcy5pLCB0aGlzLmopO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKGluZGV4OiBudW1iZXIsIGNoYXJ0OiBDaGFydCk6IFJlc3VsdDxudWxsPiB7XG4gIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPiBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyKSB7XG4gICAgcmV0dXJuIGVycm9yKGAke2luZGV4fSBpcyBub3QgaW4gcmFuZ2UgWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMn1dYCk7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufVxuXG5mdW5jdGlvbiBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZShcbiAgaW5kZXg6IG51bWJlcixcbiAgY2hhcnQ6IENoYXJ0XG4pOiBSZXN1bHQ8bnVsbD4ge1xuICBpZiAoaW5kZXggPCAxIHx8IGluZGV4ID4gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMikge1xuICAgIHJldHVybiBlcnJvcihgJHtpbmRleH0gaXMgbm90IGluIHJhbmdlIFsxLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDJ9XWApO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZFRhc2tBZnRlclN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcbiAgZnVsbFRhc2tUb0JlUmVzdG9yZWQ6IEZ1bGxUYXNrVG9CZVJlc3RvcmVkIHwgbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBpbmRleDogbnVtYmVyLFxuICAgIGZ1bGxUYXNrVG9CZVJlc3RvcmVkOiBGdWxsVGFza1RvQmVSZXN0b3JlZCB8IG51bGwgPSBudWxsXG4gICkge1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgICB0aGlzLmZ1bGxUYXNrVG9CZVJlc3RvcmVkID0gZnVsbFRhc2tUb0JlUmVzdG9yZWQ7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy5pbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBsZXQgdGFzayA9IHBsYW4ubmV3VGFzaygpO1xuICAgIGlmICh0aGlzLmZ1bGxUYXNrVG9CZVJlc3RvcmVkICE9PSBudWxsKSB7XG4gICAgICB0YXNrID0gdGhpcy5mdWxsVGFza1RvQmVSZXN0b3JlZC50YXNrO1xuICAgIH1cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4ICsgMSwgMCwgdGFzayk7XG5cbiAgICAvLyBVcGRhdGUgRWRnZXMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+PSB0aGlzLmluZGV4ICsgMSkge1xuICAgICAgICBlZGdlLmkrKztcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPj0gdGhpcy5pbmRleCArIDEpIHtcbiAgICAgICAgZWRnZS5qKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQgIT09IG51bGwpIHtcbiAgICAgIGNoYXJ0LkVkZ2VzLnB1c2goLi4udGhpcy5mdWxsVGFza1RvQmVSZXN0b3JlZC5lZGdlcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVRhc2tTdWJPcCh0aGlzLmluZGV4ICsgMSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIER1cFRhc2tTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgY29weSA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy5pbmRleF0uZHVwKCk7XG4gICAgLy8gSW5zZXJ0IHRoZSBkdXBsaWNhdGUgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIFRhc2sgaXQgaXMgY29waWVkIGZyb20uXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5zcGxpY2UodGhpcy5pbmRleCwgMCwgY29weSk7XG5cbiAgICAvLyBVcGRhdGUgRWRnZXMuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5pKys7XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmorKztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVRhc2tTdWJPcCh0aGlzLmluZGV4ICsgMSk7XG4gIH1cbn1cblxudHlwZSBTdWJzdGl0dXRpb24gPSBNYXA8RGlyZWN0ZWRFZGdlLCBEaXJlY3RlZEVkZ2U+O1xuXG5leHBvcnQgY2xhc3MgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZnJvbVRhc2tJbmRleDogbnVtYmVyID0gMDtcbiAgdG9UYXNrSW5kZXg6IG51bWJlciA9IDA7XG4gIGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb247XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZnJvbVRhc2tJbmRleDogbnVtYmVyLFxuICAgIHRvVGFza0luZGV4OiBudW1iZXIsXG4gICAgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbiA9IG5ldyBNYXAoKVxuICApIHtcbiAgICB0aGlzLmZyb21UYXNrSW5kZXggPSBmcm9tVGFza0luZGV4O1xuICAgIHRoaXMudG9UYXNrSW5kZXggPSB0b1Rhc2tJbmRleDtcbiAgICB0aGlzLmFjdHVhbE1vdmVzID0gYWN0dWFsTW92ZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgbGV0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMuZnJvbVRhc2tJbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLnRvVGFza0luZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYWN0dWFsTW92ZXMudmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbiA9IG5ldyBNYXAoKTtcbiAgICAgIC8vIFVwZGF0ZSBhbGwgRWRnZXMgdGhhdCBzdGFydCBhdCAnZnJvbVRhc2tJbmRleCcgYW5kIGNoYW5nZSB0aGUgc3RhcnQgdG8gJ3RvVGFza0luZGV4Jy5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgICAvLyBTa2lwIHRoZSBjb3JuZXIgY2FzZSB0aGVyZSBmcm9tVGFza0luZGV4IHBvaW50cyB0byBUYXNrSW5kZXguXG4gICAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbVRhc2tJbmRleCAmJiBlZGdlLmogPT09IHRoaXMudG9UYXNrSW5kZXgpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbVRhc2tJbmRleCkge1xuICAgICAgICAgIGFjdHVhbE1vdmVzLnNldChcbiAgICAgICAgICAgIG5ldyBEaXJlY3RlZEVkZ2UodGhpcy50b1Rhc2tJbmRleCwgZWRnZS5qKSxcbiAgICAgICAgICAgIG5ldyBEaXJlY3RlZEVkZ2UoZWRnZS5pLCBlZGdlLmopXG4gICAgICAgICAgKTtcbiAgICAgICAgICBlZGdlLmkgPSB0aGlzLnRvVGFza0luZGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb2soe1xuICAgICAgICBwbGFuOiBwbGFuLFxuICAgICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoXG4gICAgICAgICAgdGhpcy50b1Rhc2tJbmRleCxcbiAgICAgICAgICB0aGlzLmZyb21UYXNrSW5kZXgsXG4gICAgICAgICAgYWN0dWFsTW92ZXNcbiAgICAgICAgKSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG5ld0VkZ2UgPSB0aGlzLmFjdHVhbE1vdmVzLmdldChwbGFuLmNoYXJ0LkVkZ2VzW2ldKTtcbiAgICAgICAgaWYgKG5ld0VkZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXNbaV0gPSBuZXdFZGdlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvayh7XG4gICAgICAgIHBsYW46IHBsYW4sXG4gICAgICAgIGludmVyc2U6IG5ldyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wKFxuICAgICAgICAgIHRoaXMudG9UYXNrSW5kZXgsXG4gICAgICAgICAgdGhpcy5mcm9tVGFza0luZGV4XG4gICAgICAgICksXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBpbnZlcnNlKFxuICAgIHRvVGFza0luZGV4OiBudW1iZXIsXG4gICAgZnJvbVRhc2tJbmRleDogbnVtYmVyLFxuICAgIGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb25cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcChcbiAgICAgIHRvVGFza0luZGV4LFxuICAgICAgZnJvbVRhc2tJbmRleCxcbiAgICAgIGFjdHVhbE1vdmVzXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29weUFsbEVkZ2VzRnJvbVRvU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGZyb21JbmRleDogbnVtYmVyID0gMDtcbiAgdG9JbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3Rvcihmcm9tSW5kZXg6IG51bWJlciwgdG9JbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5mcm9tSW5kZXggPSBmcm9tSW5kZXg7XG4gICAgdGhpcy50b0luZGV4ID0gdG9JbmRleDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMuZnJvbUluZGV4LCBwbGFuLmNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdFZGdlczogRGlyZWN0ZWRFZGdlW10gPSBbXTtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzLmZvckVhY2goKGVkZ2U6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgaWYgKGVkZ2UuaSA9PT0gdGhpcy5mcm9tSW5kZXgpIHtcbiAgICAgICAgbmV3RWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKHRoaXMudG9JbmRleCwgZWRnZS5qKSk7XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID09PSB0aGlzLmZyb21JbmRleCkge1xuICAgICAgICBuZXdFZGdlcy5wdXNoKG5ldyBEaXJlY3RlZEVkZ2UoZWRnZS5pLCB0aGlzLnRvSW5kZXgpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2goLi4ubmV3RWRnZXMpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogbmV3IFJlbW92ZUFsbEVkZ2VzU3ViT3AobmV3RWRnZXMpIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW1vdmVBbGxFZGdlc1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBlZGdlczogRGlyZWN0ZWRFZGdlW107XG5cbiAgY29uc3RydWN0b3IoZWRnZXM6IERpcmVjdGVkRWRnZVtdKSB7XG4gICAgdGhpcy5lZGdlcyA9IGVkZ2VzO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgKGVkZ2U6IERpcmVjdGVkRWRnZSkgPT5cbiAgICAgICAgLTEgPT09XG4gICAgICAgIHRoaXMuZWRnZXMuZmluZEluZGV4KCh0b0JlUmVtb3ZlZDogRGlyZWN0ZWRFZGdlKSA9PlxuICAgICAgICAgIGVkZ2UuZXF1YWwodG9CZVJlbW92ZWQpXG4gICAgICAgIClcbiAgICApO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogbmV3IEFkZEFsbEVkZ2VzU3ViT3AodGhpcy5lZGdlcykgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFkZEFsbEVkZ2VzU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXTtcblxuICBjb25zdHJ1Y3RvcihlZGdlczogRGlyZWN0ZWRFZGdlW10pIHtcbiAgICB0aGlzLmVkZ2VzID0gZWRnZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2goLi4udGhpcy5lZGdlcyk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgUmVtb3ZlQWxsRWRnZXNTdWJPcCh0aGlzLmVkZ2VzKSB9KTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgRnVsbFRhc2tUb0JlUmVzdG9yZWQge1xuICBlZGdlczogRGlyZWN0ZWRFZGdlW107XG4gIHRhc2s6IFRhc2s7XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVUYXNrU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy5pbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGNvbnN0IGVkZ2VzVG9CZVJlc3RvcmVkID0gY2hhcnQuRWRnZXMuZmlsdGVyKChkZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoZGUuaSA9PT0gdGhpcy5pbmRleCB8fCBkZS5qID09PSB0aGlzLmluZGV4KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgLy8gRmlyc3QgcmVtb3ZlIGFsbCBlZGdlcyB0byBhbmQgZnJvbSB0aGUgdGFzay5cbiAgICBjaGFydC5FZGdlcyA9IGNoYXJ0LkVkZ2VzLmZpbHRlcigoZGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgaWYgKGRlLmkgPT09IHRoaXMuaW5kZXggfHwgZGUuaiA9PT0gdGhpcy5pbmRleCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcblxuICAgIC8vIFVwZGF0ZSBlZGdlcyBmb3IgdGFza3MgdGhhdCB3aWxsIGVuZCB1cCBhdCBhIG5ldyBpbmRleC5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmktLTtcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2Uuai0tO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRhc2tUb0JlUmVzdG9yZWQgPSBjaGFydC5WZXJ0aWNlcy5zcGxpY2UodGhpcy5pbmRleCwgMSk7XG4gICAgY29uc3QgZnVsbFRhc2tUb0JlUmVzdG9yZWQgPSB7XG4gICAgICBlZGdlczogZWRnZXNUb0JlUmVzdG9yZWQsXG4gICAgICB0YXNrOiB0YXNrVG9CZVJlc3RvcmVkWzBdLFxuICAgIH07XG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKGZ1bGxUYXNrVG9CZVJlc3RvcmVkKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoZnVsbFRhc2tUb0JlUmVzdG9yZWQ6IEZ1bGxUYXNrVG9CZVJlc3RvcmVkKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkVGFza0FmdGVyU3ViT3AodGhpcy5pbmRleCAtIDEsIGZ1bGxUYXNrVG9CZVJlc3RvcmVkKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmF0aW9uYWxpemVFZGdlc1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3Qgc3JjQW5kRHN0ID0gZWRnZXNCeVNyY0FuZERzdFRvTWFwKHBsYW4uY2hhcnQuRWRnZXMpO1xuICAgIGNvbnN0IFN0YXJ0ID0gMDtcbiAgICBjb25zdCBGaW5pc2ggPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG5cbiAgICAvLyBsb29wIG92ZXIgYWxsIHZlcnRpY3MgZnJvbSBbU3RhcnQsIEZpbmlzaCkgYW5kIGxvb2sgZm9yIHRoZWlyXG4gICAgLy8gZGVzdGluYXRpb25zLiBJZiB0aGV5IGhhdmUgbm9uZSB0aGVuIGFkZCBpbiBhbiBlZGdlIHRvIEZpbmlzaC4gSWYgdGhleVxuICAgIC8vIGhhdmUgbW9yZSB0aGFuIG9uZSB0aGVuIHJlbW92ZSBhbnkgbGlua3MgdG8gRmluaXNoLlxuICAgIGZvciAobGV0IGkgPSBTdGFydDsgaSA8IEZpbmlzaDsgaSsrKSB7XG4gICAgICBjb25zdCBkZXN0aW5hdGlvbnMgPSBzcmNBbmREc3QuYnlTcmMuZ2V0KGkpO1xuICAgICAgaWYgKGRlc3RpbmF0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHRvQmVBZGRlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoaSwgRmluaXNoKTtcbiAgICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKHRvQmVBZGRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBcmUgdGhlcmUgYW55IHVuZWVkZWQgRWdkZXMgdG8gRmluaXNoPyBJZiBzbyBmaWx0ZXIgdGhlbSBvdXQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBkZXN0aW5hdGlvbnMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5maW5kKCh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiB2YWx1ZS5qID09PSBGaW5pc2gpXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHRvQmVSZW1vdmVkID0gbmV3IERpcmVjdGVkRWRnZShpLCBGaW5pc2gpO1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgICAgICAgICh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiAhdG9CZVJlbW92ZWQuZXF1YWwodmFsdWUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGxvb3Agb3ZlciBhbGwgdmVydGljcyBmcm9tKFN0YXJ0LCBGaW5pc2hdIGFuZCBsb29rIGZvciB0aGVpciBzb3VyY2VzLiBJZlxuICAgIC8vIHRoZXkgaGF2ZSBub25lIHRoZW4gYWRkIGluIGFuIGVkZ2UgZnJvbSBTdGFydC4gSWYgdGhleSBoYXZlIG1vcmUgdGhhbiBvbmVcbiAgICAvLyB0aGVuIHJlbW92ZSBhbnkgbGlua3MgZnJvbSBTdGFydC5cbiAgICBmb3IgKGxldCBpID0gU3RhcnQgKyAxOyBpIDwgRmluaXNoOyBpKyspIHtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9ucyA9IHNyY0FuZERzdC5ieURzdC5nZXQoaSk7XG4gICAgICBpZiAoZGVzdGluYXRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgdG9CZUFkZGVkID0gbmV3IERpcmVjdGVkRWRnZShTdGFydCwgaSk7XG4gICAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCh0b0JlQWRkZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXJlIHRoZXJlIGFueSB1bi1uZWVkZWQgRWdkZXMgZnJvbSBTdGFydD8gSWYgc28gZmlsdGVyIHRoZW0gb3V0LlxuICAgICAgICBpZiAoXG4gICAgICAgICAgZGVzdGluYXRpb25zLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICBkZXN0aW5hdGlvbnMuZmluZCgodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gdmFsdWUuaSA9PT0gU3RhcnQpXG4gICAgICAgICkge1xuICAgICAgICAgIGNvbnN0IHRvQmVSZW1vdmVkID0gbmV3IERpcmVjdGVkRWRnZShTdGFydCwgaSk7XG4gICAgICAgICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgICAgICAgKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+ICF0b0JlUmVtb3ZlZC5lcXVhbCh2YWx1ZSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwbGFuLmNoYXJ0LkVkZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIEZpbmlzaCkpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0VGFza05hbWVTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgdGFza0luZGV4OiBudW1iZXI7XG4gIG5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih0YXNrSW5kZXg6IG51bWJlciwgbmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMudGFza0luZGV4LCBwbGFuLmNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgY29uc3Qgb2xkTmFtZSA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLm5hbWU7XG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0ubmFtZSA9IHRoaXMubmFtZTtcbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGROYW1lKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2Uob2xkTmFtZTogc3RyaW5nKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0VGFza05hbWVTdWJPcCh0aGlzLnRhc2tJbmRleCwgb2xkTmFtZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFRhc2tTdGF0ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICB0YXNrU3RhdGU6IFRhc2tTdGF0ZTtcbiAgdGFza0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IodGFza0luZGV4OiBudW1iZXIsIHRhc2tTdGF0ZTogVGFza1N0YXRlKSB7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gICAgdGhpcy50YXNrU3RhdGUgPSB0YXNrU3RhdGU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLnRhc2tJbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGNvbnN0IG9sZFN0YXRlID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0uc3RhdGU7XG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0uc3RhdGUgPSB0aGlzLnRhc2tTdGF0ZTtcbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRTdGF0ZSksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKHRhc2tTdGF0ZTogVGFza1N0YXRlKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0VGFza1N0YXRlU3ViT3AodGhpcy50YXNrSW5kZXgsIHRhc2tTdGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEluc2VydE5ld0VtcHR5TWlsZXN0b25lQWZ0ZXJPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICAgIG5ldyBBZGRUYXNrQWZ0ZXJTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AoMCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCh0YXNrSW5kZXggKyAxLCAtMSksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldFRhc2tOYW1lT3AodGFza0luZGV4OiBudW1iZXIsIG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldFRhc2tOYW1lU3ViT3AodGFza0luZGV4LCBuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0VGFza1N0YXRlT3AodGFza0luZGV4OiBudW1iZXIsIHRhc2tTdGF0ZTogVGFza1N0YXRlKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0VGFza1N0YXRlU3ViT3AodGFza0luZGV4LCB0YXNrU3RhdGUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTcGxpdFRhc2tPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgY29uc3Qgc3ViT3BzOiBTdWJPcFtdID0gW1xuICAgIG5ldyBEdXBUYXNrU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKHRhc2tJbmRleCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgXTtcblxuICByZXR1cm4gbmV3IE9wKHN1Yk9wcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEdXBUYXNrT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIGNvbnN0IHN1Yk9wczogU3ViT3BbXSA9IFtcbiAgICBuZXcgRHVwVGFza1N1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IENvcHlBbGxFZGdlc0Zyb21Ub1N1Yk9wKHRhc2tJbmRleCwgdGFza0luZGV4ICsgMSksXG4gIF07XG5cbiAgcmV0dXJuIG5ldyBPcChzdWJPcHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlVGFza09wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IERlbGV0ZVRhc2tTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRFZGdlT3AoZnJvbVRhc2tJbmRleDogbnVtYmVyLCB0b1Rhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcChmcm9tVGFza0luZGV4LCB0b1Rhc2tJbmRleCksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJhdGlvbmFsaXplRWRnZXNPcCgpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVtb3ZlRWRnZU9wKGk6IG51bWJlciwgajogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IFJlbW92ZUVkZ2VTdXBPcChpLCBqKSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICAgIG5ldyBBZGRUYXNrQWZ0ZXJTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBTZXRNZXRyaWNWYWx1ZVN1Yk9wKFwiRHVyYXRpb25cIiwgMTAsIHRhc2tJbmRleCArIDEpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AoMCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCh0YXNrSW5kZXggKyAxLCAtMSksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cbiIsICJpbXBvcnQgeyBBZGREZXBlbmRlbmN5RGlhbG9nIH0gZnJvbSBcIi4uLy4uL2FkZC1kZXBlbmRlbmN5LWRpYWxvZy9hZGQtZGVwZW5kZW5jeS1kaWFsb2dcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBBZGRFZGdlT3AgfSBmcm9tIFwiLi4vLi4vb3BzL2NoYXJ0XCI7XG5pbXBvcnQgeyBlcnJvciwgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgQWN0aW9uRnJvbU9wLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgQWRkUHJlZGVjZXNzb3JBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID1cbiAgICBcIlByb21wdHMgZm9yIGFuZCBhZGRzIGEgcHJlZGVjZXNzb3IgdG8gdGhlIGN1cnJlbnQgVGFzay5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuICB1bmRvOiBib29sZWFuID0gdHJ1ZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGlmIChleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoXCJBIFRhc2sgbXVzdCBiZSBzZWxlY3RlZC5cIikpO1xuICAgIH1cbiAgICBjb25zdCBwcmVkVGFza0luZGV4ID0gYXdhaXQgZXhwbGFuTWFpblxuICAgICAgLnF1ZXJ5U2VsZWN0b3I8QWRkRGVwZW5kZW5jeURpYWxvZz4oXCJhZGQtZGVwZW5kZW5jeS1kaWFsb2dcIikhXG4gICAgICAuc2VsZWN0RGVwZW5kZW5jeShleHBsYW5NYWluLnBsYW4uY2hhcnQsIGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrLCBcInByZWRcIik7XG4gICAgaWYgKHByZWRUYXNrSW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIk5vIHByZWRlY2Vzc29yIHdhcyBzZWxlY3RlZC5cIikpO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBBZGRFZGdlT3AocHJlZFRhc2tJbmRleCwgZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2spLmFwcGx5VG8oXG4gICAgICBleHBsYW5NYWluLnBsYW5cbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKFxuICAgICAgICByZXQudmFsdWUuaW52ZXJzZSxcbiAgICAgICAgKHRoaXMucG9zdEFjdGlvbldvcmsgPSB0aGlzLnBvc3RBY3Rpb25Xb3JrKSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBZGREZXBlbmRlbmN5RGlhbG9nIH0gZnJvbSBcIi4uLy4uL2FkZC1kZXBlbmRlbmN5LWRpYWxvZy9hZGQtZGVwZW5kZW5jeS1kaWFsb2dcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBBZGRFZGdlT3AgfSBmcm9tIFwiLi4vLi4vb3BzL2NoYXJ0XCI7XG5pbXBvcnQgeyBlcnJvciwgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgQWN0aW9uRnJvbU9wLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgQWRkU3VjY2Vzc29yQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiUHJvbXB0cyBmb3IgYW5kIGFkZHMgYSBzdWNjZXNzb3IgdG8gdGhlIGN1cnJlbnQgVGFzay5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuICB1bmRvOiBib29sZWFuID0gdHJ1ZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGlmIChleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoXCJBIFRhc2sgbXVzdCBiZSBzZWxlY3RlZC5cIikpO1xuICAgIH1cbiAgICBjb25zdCBzdWNjVGFza0luZGV4ID0gYXdhaXQgZXhwbGFuTWFpblxuICAgICAgLnF1ZXJ5U2VsZWN0b3I8QWRkRGVwZW5kZW5jeURpYWxvZz4oXCJhZGQtZGVwZW5kZW5jeS1kaWFsb2dcIikhXG4gICAgICAuc2VsZWN0RGVwZW5kZW5jeShleHBsYW5NYWluLnBsYW4uY2hhcnQsIGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrLCBcInN1Y2NcIik7XG4gICAgaWYgKHN1Y2NUYXNrSW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIk5vIHN1Y2Nlc3NvciB3YXMgc2VsZWN0ZWQuXCIpKTtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gQWRkRWRnZU9wKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrLCBzdWNjVGFza0luZGV4KS5hcHBseVRvKFxuICAgICAgZXhwbGFuTWFpbi5wbGFuXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0dXJuIG9rKFxuICAgICAgbmV3IEFjdGlvbkZyb21PcChcbiAgICAgICAgcmV0LnZhbHVlLmludmVyc2UsXG4gICAgICAgICh0aGlzLnBvc3RBY3Rpb25Xb3JrID0gdGhpcy5wb3N0QWN0aW9uV29yayksXG4gICAgICAgIHRydWVcbiAgICAgIClcbiAgICApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBTZWFyY2hUYXNrUGFuZWwgfSBmcm9tIFwiLi4vLi4vc2VhcmNoL3NlYXJjaC10YXNrLXBhbmVsXCI7XG5pbXBvcnQgeyBBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBHb1RvU2VhcmNoQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiTW92ZXMgZm9jdXMgdG8gc2VhcmNoIGNvbnRyb2wuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGFzeW5jIGRvKF9leHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcjxTZWFyY2hUYXNrUGFuZWw+KFwic2VhcmNoLXRhc2stcGFuZWxcIikhXG4gICAgICAuc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoXCJuYW1lLW9ubHlcIik7XG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHb1RvRnVsbFNlYXJjaEFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPVxuICAgIFwiTW92ZXMgZm9jdXMgdG8gc2VhcmNoIGNvbnRyb2wgYW5kIGRvZXMgYSBmdWxsIHNlYXJjaCBvZiBhbGwgcmVzb3VyY2UgdmFsdWVzLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhfZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3I8U2VhcmNoVGFza1BhbmVsPihcInNlYXJjaC10YXNrLXBhbmVsXCIpIVxuICAgICAgLnNldEtleWJvYXJkRm9jdXNUb0lucHV0KFwiZnVsbC1pbmZvXCIpO1xuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgSGVscEFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkRpc3BsYXlzIHRoZSBoZWxwIGRpYWxvZy5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBleHBsYW5NYWluXG4gICAgICAucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJrZXlib2FyZC1tYXAtZGlhbG9nXCIpIVxuICAgICAgLnNob3dNb2RhbCgpO1xuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgUmVzZXRab29tQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiVW5kb2VzIHRoZSB6b29tLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGFpbnRDaGFydFwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBleHBsYW5NYWluLmRpc3BsYXlSYW5nZSA9IG51bGw7XG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7XG4gIERlbGV0ZVRhc2tPcCxcbiAgRHVwVGFza09wLFxuICBJbnNlcnROZXdFbXB0eU1pbGVzdG9uZUFmdGVyT3AsXG4gIEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AsXG4gIFNwbGl0VGFza09wLFxufSBmcm9tIFwiLi4vLi4vb3BzL2NoYXJ0XCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wIH0gZnJvbSBcIi4uLy4uL29wcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBlcnJvciwgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgQWN0aW9uRnJvbU9wLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgU3BsaXRUYXNrQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiU3BsaXRzIGEgdGFzay5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuICB1bmRvOiBib29sZWFuID0gdHJ1ZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGlmIChleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoXCJBIHRhc2sgbXVzdCBiZSBzZWxlY3RlZCBmaXJzdC5cIikpO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBTcGxpdFRhc2tPcChleHBsYW5NYWluLnNlbGVjdGVkVGFzaykuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRHVwVGFza0FjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkR1cGxpY2F0ZXMgYSB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgdGFzayBtdXN0IGJlIHNlbGVjdGVkIGZpcnN0LlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IER1cFRhc2tPcChleHBsYW5NYWluLnNlbGVjdGVkVGFzaykuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTmV3VGFza0FjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkNyZWF0ZXMgYSBuZXcgdGFzay5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuICB1bmRvOiBib29sZWFuID0gdHJ1ZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGxldCByZXQgPSBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wKDApLmFwcGx5VG8oZXhwbGFuTWFpbi5wbGFuKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0dXJuIG9rKFxuICAgICAgbmV3IEFjdGlvbkZyb21PcChyZXQudmFsdWUuaW52ZXJzZSwgdGhpcy5wb3N0QWN0aW9uV29yaywgdGhpcy51bmRvKVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVRhc2tBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJEZWxldGVzIGEgdGFzay5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuICB1bmRvOiBib29sZWFuID0gdHJ1ZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGlmIChleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoXCJBIHRhc2sgbXVzdCBiZSBzZWxlY3RlZCBmaXJzdC5cIikpO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBEZWxldGVUYXNrT3AoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2spLmFwcGx5VG8oZXhwbGFuTWFpbi5wbGFuKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2sgPSAtMTtcbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuIiwgIi8qKiBXaGVuIHRoZSBnaXZlbiBlbGVtZW50IGlzIGNsaWNrZWQsIHRoZW4gdG9nZ2xlIHRoZSBgZGFya21vZGVgIGNsYXNzIG9uIHRoZVxuICogYm9keSBlbGVtZW50LiAqL1xuZXhwb3J0IGNvbnN0IHRvZ2dsZVRoZW1lID0gKCkgPT4ge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoXCJkYXJrbW9kZVwiKTtcbn07XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyB0b2dnbGVUaGVtZSB9IGZyb20gXCIuLi8uLi9zdHlsZS90b2dnbGVyL3RvZ2dsZXJcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIFRvZ2dsZURhcmtNb2RlQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiVG9nZ2xlcyBkYXJrIG1vZGUuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwYWludENoYXJ0XCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgdG9nZ2xlVGhlbWUoKTtcbiAgICAvLyBUb2dnbGVEYXJrTW9kZUFjdGlvbiBpcyBpdHMgb3duIGludmVyc2UuXG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyB0b2dnbGVUaGVtZSB9IGZyb20gXCIuLi8uLi9zdHlsZS90b2dnbGVyL3RvZ2dsZXJcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIFRvZ2dsZVJhZGFyQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiVG9nZ2xlcyB0aGUgcmFkYXIgdmlldy5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBleHBsYW5NYWluLnRvZ2dsZVJhZGFyKCk7XG4gICAgLy8gVG9nZ2xlUmFkYXJBY3Rpb24gaXMgaXRzIG93biBpbnZlcnNlLlxuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBOT09QQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuaW1wb3J0IHsgdW5kbyB9IGZyb20gXCIuLi9leGVjdXRlXCI7XG5cbmV4cG9ydCBjbGFzcyBVbmRvQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiVW5kb2VzIHRoZSBsYXN0IGFjdGlvbi5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBjb25zdCByZXQgPSB1bmRvKGV4cGxhbk1haW4pO1xuXG4gICAgLy8gVW5kbyBpcyBub3QgYSByZXZlcnNpYmxlIGFjdGlvbi5cbiAgICByZXR1cm4gb2sobmV3IE5PT1BBY3Rpb24oKSk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb24udHNcIjtcbmltcG9ydCB7IEFkZFByZWRlY2Vzc29yQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy9hZGRQcmVkZWNlc3Nvci50c1wiO1xuaW1wb3J0IHsgQWRkU3VjY2Vzc29yQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy9hZGRTdWNjZXNzb3IudHNcIjtcbmltcG9ydCB7XG4gIEdvVG9GdWxsU2VhcmNoQWN0aW9uLFxuICBHb1RvU2VhcmNoQWN0aW9uLFxufSBmcm9tIFwiLi9hY3Rpb25zL2dvdG9TZWFyY2gudHNcIjtcbmltcG9ydCB7IEhlbHBBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL2hlbHAudHNcIjtcbmltcG9ydCB7IFJlc2V0Wm9vbUFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvcmVzZXRab29tLnRzXCI7XG5pbXBvcnQge1xuICBEZWxldGVUYXNrQWN0aW9uLFxuICBEdXBUYXNrQWN0aW9uLFxuICBOZXdUYXNrQWN0aW9uLFxuICBTcGxpdFRhc2tBY3Rpb24sXG59IGZyb20gXCIuL2FjdGlvbnMvdGFza3MudHNcIjtcbmltcG9ydCB7IFRvZ2dsZURhcmtNb2RlQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy90b2dnbGVEYXJrTW9kZS50c1wiO1xuaW1wb3J0IHsgVG9nZ2xlUmFkYXJBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3RvZ2dsZVJhZGFyLnRzXCI7XG5pbXBvcnQgeyBVbmRvQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy91bmRvLnRzXCI7XG5cbmV4cG9ydCB0eXBlIEFjdGlvbk5hbWVzID1cbiAgfCBcIlRvZ2dsZURhcmtNb2RlQWN0aW9uXCJcbiAgfCBcIlRvZ2dsZVJhZGFyQWN0aW9uXCJcbiAgfCBcIlJlc2V0Wm9vbUFjdGlvblwiXG4gIHwgXCJVbmRvQWN0aW9uXCJcbiAgfCBcIkhlbHBBY3Rpb25cIlxuICB8IFwiU3BsaXRUYXNrQWN0aW9uXCJcbiAgfCBcIkR1cFRhc2tBY3Rpb25cIlxuICB8IFwiTmV3VGFza0FjdGlvblwiXG4gIHwgXCJEZWxldGVUYXNrQWN0aW9uXCJcbiAgfCBcIkdvVG9TZWFyY2hBY3Rpb25cIlxuICB8IFwiR29Ub0Z1bGxTZWFyY2hBY3Rpb25cIlxuICB8IFwiQWRkUHJlZGVjZXNzb3JBY3Rpb25cIlxuICB8IFwiQWRkU3VjY2Vzc29yQWN0aW9uXCI7XG5cbmV4cG9ydCBjb25zdCBBY3Rpb25SZWdpc3RyeTogUmVjb3JkPEFjdGlvbk5hbWVzLCBBY3Rpb24+ID0ge1xuICBUb2dnbGVEYXJrTW9kZUFjdGlvbjogbmV3IFRvZ2dsZURhcmtNb2RlQWN0aW9uKCksXG4gIFRvZ2dsZVJhZGFyQWN0aW9uOiBuZXcgVG9nZ2xlUmFkYXJBY3Rpb24oKSxcbiAgUmVzZXRab29tQWN0aW9uOiBuZXcgUmVzZXRab29tQWN0aW9uKCksXG4gIFVuZG9BY3Rpb246IG5ldyBVbmRvQWN0aW9uKCksXG4gIEhlbHBBY3Rpb246IG5ldyBIZWxwQWN0aW9uKCksXG4gIFNwbGl0VGFza0FjdGlvbjogbmV3IFNwbGl0VGFza0FjdGlvbigpLFxuICBEdXBUYXNrQWN0aW9uOiBuZXcgRHVwVGFza0FjdGlvbigpLFxuICBOZXdUYXNrQWN0aW9uOiBuZXcgTmV3VGFza0FjdGlvbigpLFxuICBEZWxldGVUYXNrQWN0aW9uOiBuZXcgRGVsZXRlVGFza0FjdGlvbigpLFxuICBHb1RvU2VhcmNoQWN0aW9uOiBuZXcgR29Ub1NlYXJjaEFjdGlvbigpLFxuICBHb1RvRnVsbFNlYXJjaEFjdGlvbjogbmV3IEdvVG9GdWxsU2VhcmNoQWN0aW9uKCksXG4gIEFkZFByZWRlY2Vzc29yQWN0aW9uOiBuZXcgQWRkUHJlZGVjZXNzb3JBY3Rpb24oKSxcbiAgQWRkU3VjY2Vzc29yQWN0aW9uOiBuZXcgQWRkU3VjY2Vzc29yQWN0aW9uKCksXG59O1xuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluLnRzXCI7XG5pbXBvcnQgeyBPcCB9IGZyb20gXCIuLi9vcHMvb3BzLnRzXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Gcm9tT3AsIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi9hY3Rpb24udHNcIjtcbmltcG9ydCB7IEFjdGlvbk5hbWVzLCBBY3Rpb25SZWdpc3RyeSB9IGZyb20gXCIuL3JlZ2lzdHJ5LnRzXCI7XG5cbmNvbnN0IHVuZG9TdGFjazogQWN0aW9uW10gPSBbXTtcblxuZXhwb3J0IGNvbnN0IHVuZG8gPSBhc3luYyAoZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PG51bGw+PiA9PiB7XG4gIGNvbnN0IGFjdGlvbiA9IHVuZG9TdGFjay5wb3AoKSE7XG4gIGlmICghYWN0aW9uKSB7XG4gICAgcmV0dXJuIG9rKG51bGwpO1xuICB9XG5cbiAgcmV0dXJuIGF3YWl0IGV4ZWN1dGVVbmRvKGFjdGlvbiwgZXhwbGFuTWFpbik7XG59O1xuXG5leHBvcnQgY29uc3QgZXhlY3V0ZSA9IGFzeW5jIChcbiAgbmFtZTogQWN0aW9uTmFtZXMsXG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW5cbik6IFByb21pc2U8UmVzdWx0PG51bGw+PiA9PiB7XG4gIGNvbnN0IGFjdGlvbiA9IEFjdGlvblJlZ2lzdHJ5W25hbWVdO1xuICBjb25zdCByZXQgPSBhd2FpdCBhY3Rpb24uZG8oZXhwbGFuTWFpbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuICBzd2l0Y2ggKGFjdGlvbi5wb3N0QWN0aW9uV29yaykge1xuICAgIGNhc2UgXCJcIjpcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJwYWludENoYXJ0XCI6XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiOlxuICAgICAgZXhwbGFuTWFpbi5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuICBpZiAoYWN0aW9uLnVuZG8pIHtcbiAgICB1bmRvU3RhY2sucHVzaChyZXQudmFsdWUpO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleGVjdXRlT3AgPSBhc3luYyAoXG4gIG9wOiBPcCxcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmssXG4gIHVuZG86IGJvb2xlYW4sXG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW5cbik6IFByb21pc2U8UmVzdWx0PG51bGw+PiA9PiB7XG4gIGNvbnN0IGFjdGlvbiA9IG5ldyBBY3Rpb25Gcm9tT3Aob3AsIHBvc3RBY3Rpb25Xb3JrLCB1bmRvKTtcbiAgY29uc3QgcmV0ID0gYXdhaXQgYWN0aW9uLmRvKGV4cGxhbk1haW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgc3dpdGNoIChhY3Rpb24ucG9zdEFjdGlvbldvcmspIHtcbiAgICBjYXNlIFwiXCI6XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwYWludENoYXJ0XCI6XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiOlxuICAgICAgZXhwbGFuTWFpbi5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG4gIGlmIChhY3Rpb24udW5kbykge1xuICAgIHVuZG9TdGFjay5wdXNoKHJldC52YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufTtcblxuY29uc3QgZXhlY3V0ZVVuZG8gPSBhc3luYyAoXG4gIGFjdGlvbjogQWN0aW9uLFxuICBleHBsYW5NYWluOiBFeHBsYW5NYWluXG4pOiBQcm9taXNlPFJlc3VsdDxudWxsPj4gPT4ge1xuICBjb25zdCByZXQgPSBhd2FpdCBhY3Rpb24uZG8oZXhwbGFuTWFpbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuICBzd2l0Y2ggKGFjdGlvbi5wb3N0QWN0aW9uV29yaykge1xuICAgIGNhc2UgXCJcIjpcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInBhaW50Q2hhcnRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI6XG4gICAgICBleHBsYW5NYWluLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufTtcbiIsICJpbXBvcnQgeyBleGVjdXRlIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlXCI7XG5pbXBvcnQgeyBBY3Rpb25OYW1lcyB9IGZyb20gXCIuLi9hY3Rpb24vcmVnaXN0cnlcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5cbmV4cG9ydCBjb25zdCBLZXlNYXA6IE1hcDxzdHJpbmcsIEFjdGlvbk5hbWVzPiA9IG5ldyBNYXAoW1xuICBbXCJzaGlmdC1jdHJsLVJcIiwgXCJUb2dnbGVSYWRhckFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC1NXCIsIFwiVG9nZ2xlRGFya01vZGVBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtWlwiLCBcIlJlc2V0Wm9vbUFjdGlvblwiXSxcbiAgW1wiY3RybC16XCIsIFwiVW5kb0FjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC1IXCIsIFwiSGVscEFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC18XCIsIFwiU3BsaXRUYXNrQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLV9cIiwgXCJEdXBUYXNrQWN0aW9uXCJdLFxuICBbXCJhbHQtSW5zZXJ0XCIsIFwiTmV3VGFza0FjdGlvblwiXSxcbiAgW1wiYWx0LURlbGV0ZVwiLCBcIkRlbGV0ZVRhc2tBY3Rpb25cIl0sXG4gIFtcImN0cmwtZlwiLCBcIkdvVG9TZWFyY2hBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtRlwiLCBcIkdvVG9GdWxsU2VhcmNoQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLTxcIiwgXCJBZGRQcmVkZWNlc3NvckFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC0+XCIsIFwiQWRkU3VjY2Vzc29yQWN0aW9uXCJdLFxuXSk7XG5cbmxldCBleHBsYW5NYWluOiBFeHBsYW5NYWluO1xuXG5leHBvcnQgY29uc3QgU3RhcnRLZXlib2FyZEhhbmRsaW5nID0gKGVtOiBFeHBsYW5NYWluKSA9PiB7XG4gIGV4cGxhbk1haW4gPSBlbTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgb25LZXlEb3duKTtcbn07XG5cbmNvbnN0IG9uS2V5RG93biA9IGFzeW5jIChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gIGNvbnN0IGtleW5hbWUgPSBgJHtlLnNoaWZ0S2V5ID8gXCJzaGlmdC1cIiA6IFwiXCJ9JHtlLmN0cmxLZXkgPyBcImN0cmwtXCIgOiBcIlwifSR7ZS5tZXRhS2V5ID8gXCJtZXRhLVwiIDogXCJcIn0ke2UuYWx0S2V5ID8gXCJhbHQtXCIgOiBcIlwifSR7ZS5rZXl9YDtcbiAgY29uc29sZS5sb2coa2V5bmFtZSk7XG4gIGNvbnN0IGFjdGlvbk5hbWUgPSBLZXlNYXAuZ2V0KGtleW5hbWUpO1xuICBpZiAoYWN0aW9uTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZShhY3Rpb25OYW1lLCBleHBsYW5NYWluKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICB9XG59O1xuIiwgImltcG9ydCB7IGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHsgS2V5TWFwIH0gZnJvbSBcIi4uL2tleW1hcC9rZXltYXAudHNcIjtcbmltcG9ydCB7IEFjdGlvblJlZ2lzdHJ5IH0gZnJvbSBcIi4uL2FjdGlvbi9yZWdpc3RyeVwiO1xuXG5jbGFzcyBLZXlib2FyZE1hcERpYWxvZyBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgY29uc3Qga2V5bWFwRW50cmllcyA9IFsuLi5LZXlNYXAuZW50cmllcygpXTtcbiAgICBrZXltYXBFbnRyaWVzLnNvcnQoKTtcbiAgICByZW5kZXIoXG4gICAgICBodG1sYFxuICAgICAgICA8ZGlhbG9nPlxuICAgICAgICAgIDx0YWJsZT5cbiAgICAgICAgICAgICR7a2V5bWFwRW50cmllcy5tYXAoXG4gICAgICAgICAgICAgIChba2V5LCBhY3Rpb25OYW1lXSkgPT5cbiAgICAgICAgICAgICAgICBodG1sYDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0ZD4ke2tleX08L3RkPlxuICAgICAgICAgICAgICAgICAgPHRkPiR7QWN0aW9uUmVnaXN0cnlbYWN0aW9uTmFtZV0uZGVzY3JpcHRpb259PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaWFsb2c+XG4gICAgICBgLFxuICAgICAgdGhpc1xuICAgICk7XG4gIH1cblxuICBzaG93TW9kYWwoKSB7XG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImRpYWxvZ1wiKSEuc2hvd01vZGFsKCk7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwia2V5Ym9hcmQtbWFwLWRpYWxvZ1wiLCBLZXlib2FyZE1hcERpYWxvZyk7XG4iLCAiaW1wb3J0IHtcbiAgVmVydGV4LFxuICBWZXJ0ZXhJbmRpY2VzLFxuICBEaXJlY3RlZEVkZ2UsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbiAgZWRnZXNCeURzdFRvTWFwLFxufSBmcm9tIFwiLi4vZGFnXCI7XG5cbi8qKiBBIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGFwcGxpZWQgdG8gYSBWZXJ0ZXgsIHVzZWQgaW4gbGF0ZXIgZnVuY3Rpb25zIGxpa2VcbkRlcHRoIEZpcnN0IFNlYXJjaCB0byBkbyB3b3JrIG9uIGV2ZXJ5IFZlcnRleCBpbiBhIERpcmVjdGVkR3JhcGguXG4gKi9cbmV4cG9ydCB0eXBlIHZlcnRleEZ1bmN0aW9uID0gKHY6IFZlcnRleCwgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbjtcblxuLyoqIFJldHVybnMgdGhlIGluZGV4IG9mIGFsbCBWZXJ0aWNlcyB0aGF0IGhhdmUgbm8gaW5jb21pbmcgZWRnZS5cbiAqL1xuZXhwb3J0IGNvbnN0IHNldE9mVmVydGljZXNXaXRoTm9JbmNvbWluZ0VkZ2UgPSAoXG4gIGc6IERpcmVjdGVkR3JhcGgsXG4pOiBWZXJ0ZXhJbmRpY2VzID0+IHtcbiAgY29uc3Qgbm9kZXNXaXRoSW5jb21pbmdFZGdlcyA9IGVkZ2VzQnlEc3RUb01hcChnLkVkZ2VzKTtcbiAgY29uc3QgcmV0OiBWZXJ0ZXhJbmRpY2VzID0gW107XG4gIGcuVmVydGljZXMuZm9yRWFjaCgoXzogVmVydGV4LCBpOiBudW1iZXIpID0+IHtcbiAgICBpZiAoIW5vZGVzV2l0aEluY29taW5nRWRnZXMuaGFzKGkpKSB7XG4gICAgICByZXQucHVzaChpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcblxuLyoqIERlc2NlbmRzIHRoZSBncmFwaCBpbiBEZXB0aCBGaXJzdCBTZWFyY2ggYW5kIGFwcGxpZXMgdGhlIGZ1bmN0aW9uIGBmYCB0b1xuZWFjaCBub2RlLlxuICovXG5leHBvcnQgY29uc3QgZGVwdGhGaXJzdFNlYXJjaCA9IChnOiBEaXJlY3RlZEdyYXBoLCBmOiB2ZXJ0ZXhGdW5jdGlvbikgPT4ge1xuICBzZXRPZlZlcnRpY2VzV2l0aE5vSW5jb21pbmdFZGdlKGcpLmZvckVhY2goKHZlcnRleEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBkZXB0aEZpcnN0U2VhcmNoRnJvbUluZGV4KGcsIHZlcnRleEluZGV4LCBmKTtcbiAgfSk7XG59O1xuXG4vKiogRGVwdGggRmlyc3QgU2VhcmNoIHN0YXJ0aW5nIGF0IFZlcnRleCBgc3RhcnRfaW5kZXhgLiAqL1xuZXhwb3J0IGNvbnN0IGRlcHRoRmlyc3RTZWFyY2hGcm9tSW5kZXggPSAoXG4gIGc6IERpcmVjdGVkR3JhcGgsXG4gIHN0YXJ0X2luZGV4OiBudW1iZXIsXG4gIGY6IHZlcnRleEZ1bmN0aW9uLFxuKSA9PiB7XG4gIGNvbnN0IGVkZ2VzQnlTcmMgPSBlZGdlc0J5U3JjVG9NYXAoZy5FZGdlcyk7XG5cbiAgY29uc3QgdmlzaXQgPSAodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGlmIChmKGcuVmVydGljZXNbdmVydGV4SW5kZXhdLCB2ZXJ0ZXhJbmRleCkgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5leHQgPSBlZGdlc0J5U3JjLmdldCh2ZXJ0ZXhJbmRleCk7XG4gICAgaWYgKG5leHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBuZXh0LmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgdmlzaXQoZS5qKTtcbiAgICB9KTtcbiAgfTtcblxuICB2aXNpdChzdGFydF9pbmRleCk7XG59O1xuIiwgImltcG9ydCB7XG4gIERpcmVjdGVkRWRnZSxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeURzdFRvTWFwLFxuICBlZGdlc0J5U3JjVG9NYXAsXG59IGZyb20gXCIuLi9kYWdcIjtcbmltcG9ydCB7IGRlcHRoRmlyc3RTZWFyY2hGcm9tSW5kZXggfSBmcm9tIFwiLi9kZnNcIjtcblxuLyoqIFJldHVybnMgdGhlIGluZGljZXMgb2YgYWxsIHRoZSBzdWNjZXNzb3JzIG9mIHRoZSB0YXNrIGF0IHRoZSBnaXZlbiBpbmRleC5cbiAqICBOb3RlIHRoYXQgaW5jbHVkZXMgdGhlIGdpdmVuIGluZGV4IGl0c2VsZi5cbiAqL1xuZXhwb3J0IGNvbnN0IGFsbFN1Y2Nlc3NvcnMgPSAoXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoXG4pOiBudW1iZXJbXSA9PiB7XG4gIGlmICh0YXNrSW5kZXggPj0gZGlyZWN0ZWRHcmFwaC5WZXJ0aWNlcy5sZW5ndGggLSAxIHx8IHRhc2tJbmRleCA8PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IGFsbENoaWxkcmVuOiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoKTtcbiAgZGVwdGhGaXJzdFNlYXJjaEZyb21JbmRleChcbiAgICBkaXJlY3RlZEdyYXBoLFxuICAgIHRhc2tJbmRleCxcbiAgICAoXzogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBhbGxDaGlsZHJlbi5hZGQoaW5kZXgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICApO1xuICBhbGxDaGlsZHJlbi5kZWxldGUoZGlyZWN0ZWRHcmFwaC5WZXJ0aWNlcy5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIFsuLi5hbGxDaGlsZHJlbi52YWx1ZXMoKV07XG59O1xuXG5leHBvcnQgY29uc3QgYWxsUHJlZGVjZXNzb3JzID0gKFxuICB0YXNrSW5kZXg6IG51bWJlcixcbiAgZGlyZWN0ZWRHcmFwaDogRGlyZWN0ZWRHcmFwaFxuKTogbnVtYmVyW10gPT4ge1xuICBpZiAodGFza0luZGV4ID49IGRpcmVjdGVkR3JhcGguVmVydGljZXMubGVuZ3RoIC0gMSB8fCB0YXNrSW5kZXggPD0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCBwcmVkZWNlc3NvcnNUb0NoZWNrID0gW3Rhc2tJbmRleF07XG4gIGNvbnN0IHJldDogU2V0PG51bWJlcj4gPSBuZXcgU2V0KCk7XG4gIGNvbnN0IGJ5RGVzdCA9IGVkZ2VzQnlEc3RUb01hcChkaXJlY3RlZEdyYXBoLkVkZ2VzKTtcbiAgd2hpbGUgKHByZWRlY2Vzc29yc1RvQ2hlY2subGVuZ3RoICE9PSAwKSB7XG4gICAgY29uc3Qgbm9kZSA9IHByZWRlY2Vzc29yc1RvQ2hlY2sucG9wKCkhO1xuICAgIHJldC5hZGQobm9kZSk7XG4gICAgY29uc3QgcHJlZGVjZXNzb3JzID0gYnlEZXN0LmdldChub2RlKTtcbiAgICBpZiAocHJlZGVjZXNzb3JzKSB7XG4gICAgICBwcmVkZWNlc3NvcnNUb0NoZWNrLnB1c2goLi4ucHJlZGVjZXNzb3JzLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLmkpKTtcbiAgICB9XG4gIH1cbiAgcmV0LmRlbGV0ZSgwKTtcbiAgcmV0dXJuIFsuLi5yZXQudmFsdWVzKCldO1xufTtcblxuLyoqIFJldHVybnMgdGhlIGluZGljZXMgb2YgYWxsIHRoZSB0YXNrcyBpbiB0aGUgZ3JhcGgsIGV4cGVjdCB0aGUgZmlyc3QgYW5kIHRoZVxuICogIGxhc3QuICovXG5leHBvcnQgY29uc3QgYWxsVGFza3MgPSAoZGlyZWN0ZWRHcmFwaDogRGlyZWN0ZWRHcmFwaCk6IG51bWJlcltdID0+IHtcbiAgY29uc3QgcmV0ID0gW107XG4gIGZvciAobGV0IGluZGV4ID0gMTsgaW5kZXggPCBkaXJlY3RlZEdyYXBoLlZlcnRpY2VzLmxlbmd0aCAtIDE7IGluZGV4KyspIHtcbiAgICByZXQucHVzaChpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCBjb25zdCBkaWZmZXJlbmNlID0gKGE6IG51bWJlcltdLCBiOiBudW1iZXJbXSk6IG51bWJlcltdID0+IHtcbiAgY29uc3QgYlNldCA9IG5ldyBTZXQoYik7XG4gIHJldHVybiBhLmZpbHRlcigoaTogbnVtYmVyKSA9PiBiU2V0LmhhcyhpKSA9PT0gZmFsc2UpO1xufTtcblxuZXhwb3J0IGNvbnN0IGFsbFBvdGVudGlhbFN1Y2Nlc3NvcnMgPSAoXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoXG4pOiBudW1iZXJbXSA9PiB7XG4gIC8vIFJlbW92ZSBhbGwgZGlyZWN0IHN1Y2Nlc3NvcnMgYWxzby5cbiAgY29uc3QgYnlTcmMgPSBlZGdlc0J5U3JjVG9NYXAoZGlyZWN0ZWRHcmFwaC5FZGdlcyk7XG4gIGNvbnN0IGRpcmVjdFN1Y2MgPSBieVNyYy5nZXQodGFza0luZGV4KSB8fCBbXTtcbiAgY29uc3QgZGlyZWN0U3VjY0FycmF5ID0gZGlyZWN0U3VjYy5tYXAoKGU6IERpcmVjdGVkRWRnZSkgPT4gZS5qKTtcblxuICByZXR1cm4gZGlmZmVyZW5jZShhbGxUYXNrcyhkaXJlY3RlZEdyYXBoKSwgW1xuICAgIC4uLmFsbFByZWRlY2Vzc29ycyh0YXNrSW5kZXgsIGRpcmVjdGVkR3JhcGgpLFxuICAgIC4uLmRpcmVjdFN1Y2NBcnJheSxcbiAgXSk7XG59O1xuXG5leHBvcnQgY29uc3QgYWxsUG90ZW50aWFsUHJlZGVjZXNzb3JzID0gKFxuICB0YXNrSW5kZXg6IG51bWJlcixcbiAgZGlyZWN0ZWRHcmFwaDogRGlyZWN0ZWRHcmFwaFxuKTogbnVtYmVyW10gPT4ge1xuICAvLyBSZW1vdmUgYWxsIGRpcmVjdCBwcmVkZWNlc3NvcnMgYWxzby5cbiAgY29uc3QgYnlEZXN0ID0gZWRnZXNCeURzdFRvTWFwKGRpcmVjdGVkR3JhcGguRWRnZXMpO1xuICBjb25zdCBkaXJlY3RQcmVkID0gYnlEZXN0LmdldCh0YXNrSW5kZXgpIHx8IFtdO1xuICBjb25zdCBkaXJlY3RQcmVkQXJyYXkgPSBkaXJlY3RQcmVkLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLmkpO1xuICBjb25zdCBhbGxTdWNjID0gYWxsU3VjY2Vzc29ycyh0YXNrSW5kZXgsIGRpcmVjdGVkR3JhcGgpO1xuICBjb25zdCBhbGwgPSBhbGxUYXNrcyhkaXJlY3RlZEdyYXBoKTtcbiAgY29uc3QgdG9CZVN1YnRyYWN0ZWQgPSBbLi4uYWxsU3VjYywgLi4uZGlyZWN0UHJlZEFycmF5XTtcbiAgcmV0dXJuIGRpZmZlcmVuY2UoYWxsLCB0b0JlU3VidHJhY3RlZCk7XG59O1xuIiwgImltcG9ydCB7IFRhc2tTZWFyY2hDb250cm9sIH0gZnJvbSBcIi4uL3NlYXJjaC90YXNrLXNlYXJjaC1jb250cm9sc1wiO1xuaW1wb3J0IHsgQ2hhcnQgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnRcIjtcbmltcG9ydCB7IERlcFR5cGUgfSBmcm9tIFwiLi4vZGVwZW5kZW5jaWVzL2RlcGVuZGVuY2llcy1wYW5lbFwiO1xuaW1wb3J0IHtcbiAgYWxsUG90ZW50aWFsU3VjY2Vzc29ycyxcbiAgYWxsUG90ZW50aWFsUHJlZGVjZXNzb3JzLFxufSBmcm9tIFwiLi4vZGFnL2FsZ29yaXRobXMvY2lyY3VsYXJcIjtcblxuZXhwb3J0IGNsYXNzIEFkZERlcGVuZGVuY3lEaWFsb2cgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIHByaXZhdGUgdGl0bGVFbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHRhc2tTZWFyY2hDb250cm9sOiBUYXNrU2VhcmNoQ29udHJvbCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGRpYWxvZzogSFRNTERpYWxvZ0VsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZXNvbHZlOiAodmFsdWU6IG51bWJlciB8IHVuZGVmaW5lZCkgPT4gdm9pZCA9ICgpID0+IHt9O1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMudGl0bGVFbGVtZW50ID0gdGhpcy5xdWVyeVNlbGVjdG9yKFwiaDJcIikhO1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2wgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJ0YXNrLXNlYXJjaC1jb250cm9sXCIpITtcbiAgICB0aGlzLmRpYWxvZyA9IHRoaXMucXVlcnlTZWxlY3RvcihcImRpYWxvZ1wiKSE7XG4gICAgdGhpcy5kaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcihcImNhbmNlbFwiLCAoKSA9PiB0aGlzLnJlc29sdmUodW5kZWZpbmVkKSk7XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbC5hZGRFdmVudExpc3RlbmVyKFwidGFzay1jaGFuZ2VcIiwgKGUpID0+IHtcbiAgICAgIHRoaXMuZGlhbG9nIS5jbG9zZSgpO1xuICAgICAgdGhpcy5yZXNvbHZlKGUuZGV0YWlsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBQb3B1bGF0ZXMgdGhlIGRpYWxvZyBhbmQgc2hvd3MgaXQgYXMgYSBNb2RhbCBkaWFsb2cgYW5kIHJldHVybnMgYSBQcm9taXNlXG4gICAqICB0aGF0IHJlc29sdmVzIG9uIHN1Y2Nlc3MgdG8gYSB0YXNrSW5kZXgsIG9yIHVuZGVmaW5lZCBpZiB0aGUgdXNlclxuICAgKiAgY2FuY2VsbGVkIG91dCBvZiB0aGUgZmxvdy5cbiAgICovXG4gIHB1YmxpYyBzZWxlY3REZXBlbmRlbmN5KFxuICAgIGNoYXJ0OiBDaGFydCxcbiAgICB0YXNrSW5kZXg6IG51bWJlcixcbiAgICBkZXBUeXBlOiBEZXBUeXBlXG4gICk6IFByb21pc2U8bnVtYmVyIHwgdW5kZWZpbmVkPiB7XG4gICAgdGhpcy50aXRsZUVsZW1lbnQhLnRleHRDb250ZW50ID0gZGVwVHlwZTtcblxuICAgIGxldCBpbmNsdWRlZEluZGV4ZXMgPSBbXTtcbiAgICBpZiAoZGVwVHlwZSA9PT0gXCJwcmVkXCIpIHtcbiAgICAgIGluY2x1ZGVkSW5kZXhlcyA9IGFsbFBvdGVudGlhbFByZWRlY2Vzc29ycyh0YXNrSW5kZXgsIGNoYXJ0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5jbHVkZWRJbmRleGVzID0gYWxsUG90ZW50aWFsU3VjY2Vzc29ycyh0YXNrSW5kZXgsIGNoYXJ0KTtcbiAgICB9XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEudGFza3MgPSBjaGFydC5WZXJ0aWNlcztcbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sIS5pbmNsdWRlZEluZGV4ZXMgPSBpbmNsdWRlZEluZGV4ZXM7XG5cbiAgICAvLyBUT0RPIC0gQWxsb3cgYm90aCB0eXBlcyBvZiBzZWFyY2ggaW4gdGhlIGRlcGVuZGVuY3kgZGlhbG9nLlxuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLnNldEtleWJvYXJkRm9jdXNUb0lucHV0KFwibmFtZS1vbmx5XCIpO1xuICAgIGNvbnN0IHJldCA9IG5ldyBQcm9taXNlPG51bWJlciB8IHVuZGVmaW5lZD4oKHJlc29sdmUsIF9yZWplY3QpID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICB0aGlzLmRpYWxvZyEuc2hvd01vZGFsKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJhZGQtZGVwZW5kZW5jeS1kaWFsb2dcIiwgQWRkRGVwZW5kZW5jeURpYWxvZyk7XG4iLCAiaW1wb3J0IHtcbiAgVmVydGV4LFxuICBWZXJ0ZXhJbmRpY2VzLFxuICBEaXJlY3RlZEdyYXBoLFxuICBlZGdlc0J5U3JjVG9NYXAsXG59IGZyb20gXCIuLi9kYWcudHNcIjtcblxuLyoqXG5UaGUgcmV0dXJuIHR5cGUgZm9yIHRoZSBUb3Bsb2dpY2FsU29ydCBmdW5jdGlvbi4gXG4gKi9cbnR5cGUgVFNSZXR1cm4gPSB7XG4gIGhhc0N5Y2xlczogYm9vbGVhbjtcblxuICBjeWNsZTogVmVydGV4SW5kaWNlcztcblxuICBvcmRlcjogVmVydGV4SW5kaWNlcztcbn07XG5cbi8qKlxuUmV0dXJucyBhIHRvcG9sb2dpY2FsIHNvcnQgb3JkZXIgZm9yIGEgRGlyZWN0ZWRHcmFwaCwgb3IgdGhlIG1lbWJlcnMgb2YgYSBjeWNsZSBpZiBhXG50b3BvbG9naWNhbCBzb3J0IGNhbid0IGJlIGRvbmUuXG4gXG4gVGhlIHRvcG9sb2dpY2FsIHNvcnQgY29tZXMgZnJvbTpcblxuICAgIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmcjRGVwdGgtZmlyc3Rfc2VhcmNoXG5cbkwgXHUyMTkwIEVtcHR5IGxpc3QgdGhhdCB3aWxsIGNvbnRhaW4gdGhlIHNvcnRlZCBub2Rlc1xud2hpbGUgZXhpc3RzIG5vZGVzIHdpdGhvdXQgYSBwZXJtYW5lbnQgbWFyayBkb1xuICAgIHNlbGVjdCBhbiB1bm1hcmtlZCBub2RlIG5cbiAgICB2aXNpdChuKVxuXG5mdW5jdGlvbiB2aXNpdChub2RlIG4pXG4gICAgaWYgbiBoYXMgYSBwZXJtYW5lbnQgbWFyayB0aGVuXG4gICAgICAgIHJldHVyblxuICAgIGlmIG4gaGFzIGEgdGVtcG9yYXJ5IG1hcmsgdGhlblxuICAgICAgICBzdG9wICAgKGdyYXBoIGhhcyBhdCBsZWFzdCBvbmUgY3ljbGUpXG5cbiAgICBtYXJrIG4gd2l0aCBhIHRlbXBvcmFyeSBtYXJrXG5cbiAgICBmb3IgZWFjaCBub2RlIG0gd2l0aCBhbiBlZGdlIGZyb20gbiB0byBtIGRvXG4gICAgICAgIHZpc2l0KG0pXG5cbiAgICByZW1vdmUgdGVtcG9yYXJ5IG1hcmsgZnJvbSBuXG4gICAgbWFyayBuIHdpdGggYSBwZXJtYW5lbnQgbWFya1xuICAgIGFkZCBuIHRvIGhlYWQgb2YgTFxuXG4gKi9cbmV4cG9ydCBjb25zdCB0b3BvbG9naWNhbFNvcnQgPSAoZzogRGlyZWN0ZWRHcmFwaCk6IFRTUmV0dXJuID0+IHtcbiAgY29uc3QgcmV0OiBUU1JldHVybiA9IHtcbiAgICBoYXNDeWNsZXM6IGZhbHNlLFxuICAgIGN5Y2xlOiBbXSxcbiAgICBvcmRlcjogW10sXG4gIH07XG5cbiAgY29uc3QgZWRnZU1hcCA9IGVkZ2VzQnlTcmNUb01hcChnLkVkZ2VzKTtcblxuICBjb25zdCBub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrID0gbmV3IFNldDxudW1iZXI+KCk7XG4gIGcuVmVydGljZXMuZm9yRWFjaCgoXzogVmVydGV4LCBpbmRleDogbnVtYmVyKSA9PlxuICAgIG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuYWRkKGluZGV4KVxuICApO1xuXG4gIGNvbnN0IGhhc1Blcm1hbmVudE1hcmsgPSAoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgIHJldHVybiAhbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5oYXMoaW5kZXgpO1xuICB9O1xuXG4gIGNvbnN0IHRlbXBvcmFyeU1hcmsgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuICBjb25zdCB2aXNpdCA9IChpbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKGhhc1Blcm1hbmVudE1hcmsoaW5kZXgpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRlbXBvcmFyeU1hcmsuaGFzKGluZGV4KSkge1xuICAgICAgLy8gV2Ugb25seSByZXR1cm4gZmFsc2Ugb24gZmluZGluZyBhIGxvb3AsIHdoaWNoIGlzIHN0b3JlZCBpblxuICAgICAgLy8gdGVtcG9yYXJ5TWFyay5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGVtcG9yYXJ5TWFyay5hZGQoaW5kZXgpO1xuXG4gICAgY29uc3QgbmV4dEVkZ2VzID0gZWRnZU1hcC5nZXQoaW5kZXgpO1xuICAgIGlmIChuZXh0RWRnZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXh0RWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZSA9IG5leHRFZGdlc1tpXTtcbiAgICAgICAgaWYgKCF2aXNpdChlLmopKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGVtcG9yYXJ5TWFyay5kZWxldGUoaW5kZXgpO1xuICAgIG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuZGVsZXRlKGluZGV4KTtcbiAgICByZXQub3JkZXIudW5zaGlmdChpbmRleCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gV2Ugd2lsbCBwcmVzdW1lIHRoYXQgVmVydGV4WzBdIGlzIHRoZSBzdGFydCBub2RlIGFuZCB0aGF0IHdlIHNob3VsZCBzdGFydCB0aGVyZS5cbiAgY29uc3Qgb2sgPSB2aXNpdCgwKTtcbiAgaWYgKCFvaykge1xuICAgIHJldC5oYXNDeWNsZXMgPSB0cnVlO1xuICAgIHJldC5jeWNsZSA9IFsuLi50ZW1wb3JhcnlNYXJrLmtleXMoKV07XG4gIH1cblxuICByZXR1cm4gcmV0O1xufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7XG4gIFZlcnRleEluZGljZXMsXG4gIEVkZ2VzLFxuICBEaXJlY3RlZEdyYXBoLFxuICBlZGdlc0J5U3JjVG9NYXAsXG4gIGVkZ2VzQnlEc3RUb01hcCxcbiAgRGlyZWN0ZWRFZGdlLFxuICBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkLFxufSBmcm9tIFwiLi4vZGFnL2RhZ1wiO1xuXG5pbXBvcnQgeyB0b3BvbG9naWNhbFNvcnQgfSBmcm9tIFwiLi4vZGFnL2FsZ29yaXRobXMvdG9wb3NvcnQudHNcIjtcbmltcG9ydCB7IE1ldHJpY1ZhbHVlcyB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcblxuZXhwb3J0IHR5cGUgVGFza1N0YXRlID0gXCJ1bnN0YXJ0ZWRcIiB8IFwic3RhcnRlZFwiIHwgXCJjb21wbGV0ZVwiO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9UQVNLX05BTUUgPSBcIlRhc2sgTmFtZVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tTZXJpYWxpemVkIHtcbiAgcmVzb3VyY2VzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuICBtZXRyaWNzOiBNZXRyaWNWYWx1ZXM7XG4gIG5hbWU6IHN0cmluZztcbiAgc3RhdGU6IFRhc2tTdGF0ZTtcbn1cblxuLy8gRG8gd2UgY3JlYXRlIHN1Yi1jbGFzc2VzIGFuZCB0aGVuIHNlcmlhbGl6ZSBzZXBhcmF0ZWx5PyBPciBkbyB3ZSBoYXZlIGFcbi8vIGNvbmZpZyBhYm91dCB3aGljaCB0eXBlIG9mIER1cmF0aW9uU2FtcGxlciBpcyBiZWluZyB1c2VkP1xuLy9cbi8vIFdlIGNhbiB1c2UgdHJhZGl0aW9uYWwgb3B0aW1pc3RpYy9wZXNzaW1pc3RpYyB2YWx1ZS4gT3IgSmFjb2JpYW4nc1xuLy8gdW5jZXJ0YWludGx5IG11bHRpcGxpZXJzIFsxLjEsIDEuNSwgMiwgNV0gYW5kIHRoZWlyIGludmVyc2VzIHRvIGdlbmVyYXRlIGFuXG4vLyBvcHRpbWlzdGljIHBlc3NpbWlzdGljLlxuXG4vKiogVGFzayBpcyBhIFZlcnRleCB3aXRoIGRldGFpbHMgYWJvdXQgdGhlIFRhc2sgdG8gY29tcGxldGUuICovXG5leHBvcnQgY2xhc3MgVGFzayB7XG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9IFwiXCIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IERFRkFVTFRfVEFTS19OQU1FO1xuICAgIHRoaXMubWV0cmljcyA9IHt9O1xuICAgIHRoaXMucmVzb3VyY2VzID0ge307XG4gIH1cblxuICAvLyBSZXNvdXJjZSBrZXlzIGFuZCB2YWx1ZXMuIFRoZSBwYXJlbnQgcGxhbiBjb250YWlucyBhbGwgdGhlIHJlc291cmNlXG4gIC8vIGRlZmluaXRpb25zLlxuXG4gIHJlc291cmNlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcblxuICBtZXRyaWNzOiBNZXRyaWNWYWx1ZXM7XG5cbiAgbmFtZTogc3RyaW5nO1xuXG4gIHN0YXRlOiBUYXNrU3RhdGUgPSBcInVuc3RhcnRlZFwiO1xuXG4gIHRvSlNPTigpOiBUYXNrU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc291cmNlczogdGhpcy5yZXNvdXJjZXMsXG4gICAgICBtZXRyaWNzOiB0aGlzLm1ldHJpY3MsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGdldCBkdXJhdGlvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldE1ldHJpYyhcIkR1cmF0aW9uXCIpITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgZHVyYXRpb24odmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgdmFsdWUpO1xuICB9XG5cbiAgcHVibGljIGdldE1ldHJpYyhrZXk6IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMubWV0cmljc1trZXldO1xuICB9XG5cbiAgcHVibGljIHNldE1ldHJpYyhrZXk6IHN0cmluZywgdmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMubWV0cmljc1trZXldID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZGVsZXRlTWV0cmljKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMubWV0cmljc1trZXldO1xuICB9XG5cbiAgcHVibGljIGdldFJlc291cmNlKGtleTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZXNba2V5XTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRSZXNvdXJjZShrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMucmVzb3VyY2VzW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVSZXNvdXJjZShrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLnJlc291cmNlc1trZXldO1xuICB9XG5cbiAgcHVibGljIGR1cCgpOiBUYXNrIHtcbiAgICBjb25zdCByZXQgPSBuZXcgVGFzaygpO1xuICAgIHJldC5yZXNvdXJjZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnJlc291cmNlcyk7XG4gICAgcmV0Lm1ldHJpY3MgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm1ldHJpY3MpO1xuICAgIHJldC5uYW1lID0gdGhpcy5uYW1lO1xuICAgIHJldC5zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUYXNrcyA9IFRhc2tbXTtcblxuZXhwb3J0IGludGVyZmFjZSBDaGFydFNlcmlhbGl6ZWQge1xuICB2ZXJ0aWNlczogVGFza1NlcmlhbGl6ZWRbXTtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVNlcmlhbGl6ZWRbXTtcbn1cblxuLyoqIEEgQ2hhcnQgaXMgYSBEaXJlY3RlZEdyYXBoLCBidXQgd2l0aCBUYXNrcyBmb3IgVmVydGljZXMuICovXG5leHBvcnQgY2xhc3MgQ2hhcnQge1xuICBWZXJ0aWNlczogVGFza3M7XG4gIEVkZ2VzOiBFZGdlcztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBzdGFydCA9IG5ldyBUYXNrKFwiU3RhcnRcIik7XG4gICAgc3RhcnQuc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgMCk7XG4gICAgY29uc3QgZmluaXNoID0gbmV3IFRhc2soXCJGaW5pc2hcIik7XG4gICAgZmluaXNoLnNldE1ldHJpYyhcIkR1cmF0aW9uXCIsIDApO1xuICAgIHRoaXMuVmVydGljZXMgPSBbc3RhcnQsIGZpbmlzaF07XG4gICAgdGhpcy5FZGdlcyA9IFtuZXcgRGlyZWN0ZWRFZGdlKDAsIDEpXTtcbiAgfVxuXG4gIHRvSlNPTigpOiBDaGFydFNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJ0aWNlczogdGhpcy5WZXJ0aWNlcy5tYXAoKHQ6IFRhc2spID0+IHQudG9KU09OKCkpLFxuICAgICAgZWRnZXM6IHRoaXMuRWRnZXMubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUudG9KU09OKCkpLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVG9wb2xvZ2ljYWxPcmRlciA9IFZlcnRleEluZGljZXM7XG5cbmV4cG9ydCB0eXBlIFZhbGlkYXRlUmVzdWx0ID0gUmVzdWx0PFRvcG9sb2dpY2FsT3JkZXI+O1xuXG4vKiogVmFsaWRhdGVzIGEgRGlyZWN0ZWRHcmFwaCBpcyBhIHZhbGlkIENoYXJ0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ2hhcnQoZzogRGlyZWN0ZWRHcmFwaCk6IFZhbGlkYXRlUmVzdWx0IHtcbiAgaWYgKGcuVmVydGljZXMubGVuZ3RoIDwgMikge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIFwiQ2hhcnQgbXVzdCBjb250YWluIGF0IGxlYXN0IHR3byBub2RlLCB0aGUgc3RhcnQgYW5kIGZpbmlzaCB0YXNrcy5cIlxuICAgICk7XG4gIH1cblxuICBjb25zdCBlZGdlc0J5RHN0ID0gZWRnZXNCeURzdFRvTWFwKGcuRWRnZXMpO1xuICBjb25zdCBlZGdlc0J5U3JjID0gZWRnZXNCeVNyY1RvTWFwKGcuRWRnZXMpO1xuXG4gIC8vIFRoZSBmaXJzdCBWZXJ0ZXgsIFRfMCBha2EgdGhlIFN0YXJ0IE1pbGVzdG9uZSwgbXVzdCBoYXZlIDAgaW5jb21pbmcgZWRnZXMuXG4gIGlmIChlZGdlc0J5RHN0LmdldCgwKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFwiVGhlIHN0YXJ0IG5vZGUgKDApIGhhcyBhbiBpbmNvbWluZyBlZGdlLlwiKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfMCBzaG91bGQgaGF2ZSAwIGluY29taW5nIGVkZ2VzLlxuICBmb3IgKGxldCBpID0gMTsgaSA8IGcuVmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeURzdC5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0ICgwKSB0aGF0IGhhcyBubyBpbmNvbWluZyBlZGdlczogJHtpfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlIGxhc3QgVmVydGV4LCBUX2ZpbmlzaCwgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIG11c3QgaGF2ZSAwIG91dGdvaW5nIGVkZ2VzLlxuICBpZiAoZWRnZXNCeVNyYy5nZXQoZy5WZXJ0aWNlcy5sZW5ndGggLSAxKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgXCJUaGUgbGFzdCBub2RlLCB3aGljaCBzaG91bGQgYmUgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIGhhcyBhbiBvdXRnb2luZyBlZGdlLlwiXG4gICAgKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfZmluaXNoIHNob3VsZCBoYXZlIDAgb3V0Z29pbmcgZWRnZXMuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZy5WZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeVNyYy5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0IFRfZmluaXNoIHRoYXQgaGFzIG5vIG91dGdvaW5nIGVkZ2VzOiAke2l9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBudW1WZXJ0aWNlcyA9IGcuVmVydGljZXMubGVuZ3RoO1xuICAvLyBBbmQgYWxsIGVkZ2VzIG1ha2Ugc2Vuc2UsIGkuZS4gdGhleSBhbGwgcG9pbnQgdG8gdmVydGV4ZXMgdGhhdCBleGlzdC5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBnLkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGcuRWRnZXNbaV07XG4gICAgaWYgKFxuICAgICAgZWxlbWVudC5pIDwgMCB8fFxuICAgICAgZWxlbWVudC5pID49IG51bVZlcnRpY2VzIHx8XG4gICAgICBlbGVtZW50LmogPCAwIHx8XG4gICAgICBlbGVtZW50LmogPj0gbnVtVmVydGljZXNcbiAgICApIHtcbiAgICAgIHJldHVybiBlcnJvcihgRWRnZSAke2VsZW1lbnR9IHBvaW50cyB0byBhIG5vbi1leGlzdGVudCBWZXJ0ZXguYCk7XG4gICAgfVxuICB9XG5cbiAgLy8gTm93IHdlIGNvbmZpcm0gdGhhdCB3ZSBoYXZlIGEgRGlyZWN0ZWQgQWN5Y2xpYyBHcmFwaCwgaS5lLiB0aGUgZ3JhcGggaGFzIG5vXG4gIC8vIGN5Y2xlcyBieSBjcmVhdGluZyBhIHRvcG9sb2dpY2FsIHNvcnQgc3RhcnRpbmcgYXQgVF8wXG4gIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmcjRGVwdGgtZmlyc3Rfc2VhcmNoXG4gIGNvbnN0IHRzUmV0ID0gdG9wb2xvZ2ljYWxTb3J0KGcpO1xuICBpZiAodHNSZXQuaGFzQ3ljbGVzKSB7XG4gICAgcmV0dXJuIGVycm9yKGBDaGFydCBoYXMgY3ljbGU6ICR7Wy4uLnRzUmV0LmN5Y2xlXS5qb2luKFwiLCBcIil9YCk7XG4gIH1cblxuICByZXR1cm4gb2sodHNSZXQub3JkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2hhcnRWYWxpZGF0ZShjOiBDaGFydCk6IFZhbGlkYXRlUmVzdWx0IHtcbiAgY29uc3QgcmV0ID0gdmFsaWRhdGVDaGFydChjKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIGlmIChjLlZlcnRpY2VzWzBdLmR1cmF0aW9uICE9PSAwKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYFN0YXJ0IE1pbGVzdG9uZSBtdXN0IGhhdmUgZHVyYXRpb24gb2YgMCwgaW5zdGVhZCBnb3QgJHtjLlZlcnRpY2VzWzBdLmR1cmF0aW9ufWBcbiAgICApO1xuICB9XG4gIGlmIChjLlZlcnRpY2VzW2MuVmVydGljZXMubGVuZ3RoIC0gMV0uZHVyYXRpb24gIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgRmluaXNoIE1pbGVzdG9uZSBtdXN0IGhhdmUgZHVyYXRpb24gb2YgMCwgaW5zdGVhZCBnb3QgJHtcbiAgICAgICAgYy5WZXJ0aWNlc1tjLlZlcnRpY2VzLmxlbmd0aCAtIDFdLmR1cmF0aW9uXG4gICAgICB9YFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cbiIsICJpbXBvcnQgeyBSb3VuZGVyIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlY2lzaW9uU2VyaWFsaXplZCB7XG4gIHByZWNpc2lvbjogbnVtYmVyO1xufVxuZXhwb3J0IGNsYXNzIFByZWNpc2lvbiB7XG4gIHByaXZhdGUgbXVsdGlwbGllcjogbnVtYmVyO1xuICBwcml2YXRlIF9wcmVjaXNpb246IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihwcmVjaXNpb246IG51bWJlciA9IDApIHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShwcmVjaXNpb24pKSB7XG4gICAgICBwcmVjaXNpb24gPSAwO1xuICAgIH1cbiAgICB0aGlzLl9wcmVjaXNpb24gPSBNYXRoLmFicyhNYXRoLnRydW5jKHByZWNpc2lvbikpO1xuICAgIHRoaXMubXVsdGlwbGllciA9IDEwICoqIHRoaXMuX3ByZWNpc2lvbjtcbiAgfVxuXG4gIHJvdW5kKHg6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGgudHJ1bmMoeCAqIHRoaXMubXVsdGlwbGllcikgLyB0aGlzLm11bHRpcGxpZXI7XG4gIH1cblxuICByb3VuZGVyKCk6IFJvdW5kZXIge1xuICAgIHJldHVybiAoeDogbnVtYmVyKTogbnVtYmVyID0+IHRoaXMucm91bmQoeCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHByZWNpc2lvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9wcmVjaXNpb247XG4gIH1cblxuICB0b0pTT04oKTogUHJlY2lzaW9uU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByZWNpc2lvbjogdGhpcy5fcHJlY2lzaW9uLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogUHJlY2lzaW9uU2VyaWFsaXplZCB8IHVuZGVmaW5lZCk6IFByZWNpc2lvbiB7XG4gICAgaWYgKHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBQcmVjaXNpb24oKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcmVjaXNpb24ocy5wcmVjaXNpb24pO1xuICB9XG59XG4iLCAiLy8gVXRpbGl0aWVzIGZvciBkZWFsaW5nIHdpdGggYSByYW5nZSBvZiBudW1iZXJzLlxuXG5leHBvcnQgaW50ZXJmYWNlIE1ldHJpY1JhbmdlU2VyaWFsaXplZCB7XG4gIG1pbjogbnVtYmVyO1xuICBtYXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IGNsYW1wID0gKHg6IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgaWYgKHggPiBtYXgpIHtcbiAgICByZXR1cm4gbWF4O1xuICB9XG4gIGlmICh4IDwgbWluKSB7XG4gICAgcmV0dXJuIG1pbjtcbiAgfVxuICByZXR1cm4geDtcbn07XG5cbi8vIFJhbmdlIGRlZmluZXMgYSByYW5nZSBvZiBudW1iZXJzLCBmcm9tIFttaW4sIG1heF0gaW5jbHVzaXZlLlxuZXhwb3J0IGNsYXNzIE1ldHJpY1JhbmdlIHtcbiAgcHJpdmF0ZSBfbWluOiBudW1iZXIgPSAtTnVtYmVyLk1BWF9WQUxVRTtcbiAgcHJpdmF0ZSBfbWF4OiBudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFO1xuXG4gIGNvbnN0cnVjdG9yKG1pbjogbnVtYmVyID0gLU51bWJlci5NQVhfVkFMVUUsIG1heDogbnVtYmVyID0gTnVtYmVyLk1BWF9WQUxVRSkge1xuICAgIGlmIChtYXggPCBtaW4pIHtcbiAgICAgIFttaW4sIG1heF0gPSBbbWF4LCBtaW5dO1xuICAgIH1cbiAgICB0aGlzLl9taW4gPSBtaW47XG4gICAgdGhpcy5fbWF4ID0gbWF4O1xuICB9XG5cbiAgY2xhbXAodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIGNsYW1wKHZhbHVlLCB0aGlzLl9taW4sIHRoaXMuX21heCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1pbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9taW47XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1heCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9tYXg7XG4gIH1cblxuICB0b0pTT04oKTogTWV0cmljUmFuZ2VTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWluOiB0aGlzLl9taW4sXG4gICAgICBtYXg6IHRoaXMuX21heCxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIEZyb21KU09OKHM6IE1ldHJpY1JhbmdlU2VyaWFsaXplZCB8IHVuZGVmaW5lZCk6IE1ldHJpY1JhbmdlIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IE1ldHJpY1JhbmdlKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTWV0cmljUmFuZ2Uocy5taW4sIHMubWF4KTtcbiAgfVxufVxuIiwgIi8vIE1ldHJpY3MgZGVmaW5lIGZsb2F0aW5nIHBvaW50IHZhbHVlcyB0aGF0IGFyZSB0cmFja2VkIHBlciBUYXNrLlxuXG5pbXBvcnQgeyBQcmVjaXNpb24sIFByZWNpc2lvblNlcmlhbGl6ZWQgfSBmcm9tIFwiLi4vcHJlY2lzaW9uL3ByZWNpc2lvbi50c1wiO1xuaW1wb3J0IHsgY2xhbXAsIE1ldHJpY1JhbmdlLCBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQgfSBmcm9tIFwiLi9yYW5nZS50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlU2VyaWFsaXplZDtcbiAgZGVmYXVsdDogbnVtYmVyO1xuICBwcmVjaXNpb246IFByZWNpc2lvblNlcmlhbGl6ZWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRyaWNEZWZpbml0aW9uIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlO1xuICBkZWZhdWx0OiBudW1iZXI7XG4gIGlzU3RhdGljOiBib29sZWFuO1xuICBwcmVjaXNpb246IFByZWNpc2lvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZWZhdWx0VmFsdWU6IG51bWJlcixcbiAgICByYW5nZTogTWV0cmljUmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoKSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlLFxuICAgIHByZWNpc2lvbjogUHJlY2lzaW9uID0gbmV3IFByZWNpc2lvbigxKVxuICApIHtcbiAgICB0aGlzLnJhbmdlID0gcmFuZ2U7XG4gICAgdGhpcy5kZWZhdWx0ID0gY2xhbXAoZGVmYXVsdFZhbHVlLCByYW5nZS5taW4sIHJhbmdlLm1heCk7XG4gICAgdGhpcy5pc1N0YXRpYyA9IGlzU3RhdGljO1xuICAgIHRoaXMucHJlY2lzaW9uID0gcHJlY2lzaW9uO1xuICB9XG5cbiAgdG9KU09OKCk6IE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmFuZ2U6IHRoaXMucmFuZ2UudG9KU09OKCksXG4gICAgICBkZWZhdWx0OiB0aGlzLmRlZmF1bHQsXG4gICAgICBwcmVjaXNpb246IHRoaXMucHJlY2lzaW9uLnRvSlNPTigpLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQgfCB1bmRlZmluZWQpOiBNZXRyaWNEZWZpbml0aW9uIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IE1ldHJpY0RlZmluaXRpb24oMCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTWV0cmljRGVmaW5pdGlvbihcbiAgICAgIHMuZGVmYXVsdCB8fCAwLFxuICAgICAgTWV0cmljUmFuZ2UuRnJvbUpTT04ocy5yYW5nZSksXG4gICAgICBmYWxzZSxcbiAgICAgIFByZWNpc2lvbi5Gcm9tSlNPTihzLnByZWNpc2lvbilcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBNZXRyaWNEZWZpbml0aW9uIH07XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZCA9IHtcbiAgW2tleTogc3RyaW5nXTogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQ7XG59O1xuXG5leHBvcnQgdHlwZSBNZXRyaWNWYWx1ZXMgPSB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9O1xuIiwgIi8vIEVhY2ggUmVzb3Vyc2UgaGFzIGEga2V5LCB3aGljaCBpcyB0aGUgbmFtZSwgYW5kIGEgbGlzdCBvZiBhY2NlcHRhYmxlIHZhbHVlcy5cbi8vIFRoZSBsaXN0IG9mIHZhbHVlcyBjYW4gbmV2ZXIgYmUgZW1wdHksIGFuZCB0aGUgZmlyc3QgdmFsdWUgaW4gYHZhbHVlc2AgaXMgdGhlXG4vLyBkZWZhdWx0IHZhbHVlIGZvciBhIFJlc291cmNlLlxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9SRVNPVVJDRV9WQUxVRSA9IFwiXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZCB7XG4gIHZhbHVlczogc3RyaW5nW107XG59XG5cbmV4cG9ydCBjbGFzcyBSZXNvdXJjZURlZmluaXRpb24ge1xuICB2YWx1ZXM6IHN0cmluZ1tdO1xuICBpc1N0YXRpYzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICB2YWx1ZXM6IHN0cmluZ1tdID0gW0RFRkFVTFRfUkVTT1VSQ0VfVkFMVUVdLFxuICAgIGlzU3RhdGljOiBib29sZWFuID0gZmFsc2VcbiAgKSB7XG4gICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgdGhpcy5pc1N0YXRpYyA9IGlzU3RhdGljO1xuICB9XG5cbiAgdG9KU09OKCk6IFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZXM6IHRoaXMudmFsdWVzLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZCk6IFJlc291cmNlRGVmaW5pdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBSZXNvdXJjZURlZmluaXRpb24ocy52YWx1ZXMpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFJlc291cmNlRGVmaW5pdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IFJlc291cmNlRGVmaW5pdGlvbiB9O1xuZXhwb3J0IHR5cGUgUmVzb3VyY2VEZWZpbml0aW9uc1NlcmlhbGl6ZWQgPSB7XG4gIFtrZXk6IHN0cmluZ106IFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQ7XG59O1xuIiwgIi8qKlxuICogVHJpYW5ndWxhciBpcyB0aGUgaW52ZXJzZSBDdW11bGF0aXZlIERlbnNpdHkgRnVuY3Rpb24gKENERikgZm9yIHRoZVxuICogdHJpYW5ndWxhciBkaXN0cmlidXRpb24uXG4gKlxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVHJpYW5ndWxhcl9kaXN0cmlidXRpb24jR2VuZXJhdGluZ19yYW5kb21fdmFyaWF0ZXNcbiAqXG4gKiBUaGUgaW52ZXJzZSBvZiB0aGUgQ0RGIGlzIHVzZWZ1bCBmb3IgZ2VuZXJhdGluZyBzYW1wbGVzIGZyb20gdGhlXG4gKiBkaXN0cmlidXRpb24sIGkuZS4gcGFzc2luZyBpbiB2YWx1ZXMgZnJvbSB0aGUgdW5pZm9ybSBkaXN0cmlidXRpb24gWzAsIDFdXG4gKiB3aWxsIHByb2R1Y2Ugc2FtcGxlIHRoYXQgbG9vayBsaWtlIHRoZXkgY29tZSBmcm9tIHRoZSB0cmlhbmd1bGFyXG4gKiBkaXN0cmlidXRpb24uXG4gKlxuICpcbiAqL1xuXG5leHBvcnQgY2xhc3MgVHJpYW5ndWxhciB7XG4gIHByaXZhdGUgYTogbnVtYmVyO1xuICBwcml2YXRlIGI6IG51bWJlcjtcbiAgcHJpdmF0ZSBjOiBudW1iZXI7XG4gIHByaXZhdGUgRl9jOiBudW1iZXI7XG5cbiAgLyoqICBUaGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24gaXMgYSBjb250aW51b3VzIHByb2JhYmlsaXR5IGRpc3RyaWJ1dGlvbiB3aXRoXG4gIGxvd2VyIGxpbWl0IGBhYCwgdXBwZXIgbGltaXQgYGJgLCBhbmQgbW9kZSBgY2AsIHdoZXJlIGEgPCBiIGFuZCBhIFx1MjI2NCBjIFx1MjI2NCBiLiAqL1xuICBjb25zdHJ1Y3RvcihhOiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyKSB7XG4gICAgdGhpcy5hID0gYTtcbiAgICB0aGlzLmIgPSBiO1xuICAgIHRoaXMuYyA9IGM7XG5cbiAgICAvLyBGX2MgaXMgdGhlIGN1dG9mZiBpbiB0aGUgZG9tYWluIHdoZXJlIHdlIHN3aXRjaCBiZXR3ZWVuIHRoZSB0d28gaGFsdmVzIG9mXG4gICAgLy8gdGhlIHRyaWFuZ2xlLlxuICAgIHRoaXMuRl9jID0gKGMgLSBhKSAvIChiIC0gYSk7XG4gIH1cblxuICAvKiogIFByb2R1Y2UgYSBzYW1wbGUgZnJvbSB0aGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24uIFRoZSB2YWx1ZSBvZiAncCdcbiAgIHNob3VsZCBiZSBpbiBbMCwgMS4wXS4gKi9cbiAgc2FtcGxlKHA6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKHAgPCAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9IGVsc2UgaWYgKHAgPiAxLjApIHtcbiAgICAgIHJldHVybiAxLjA7XG4gICAgfSBlbHNlIGlmIChwIDwgdGhpcy5GX2MpIHtcbiAgICAgIHJldHVybiB0aGlzLmEgKyBNYXRoLnNxcnQocCAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYyAtIHRoaXMuYSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLmIgLSBNYXRoLnNxcnQoKDEgLSBwKSAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYiAtIHRoaXMuYykpXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IFRyaWFuZ3VsYXIgfSBmcm9tIFwiLi90cmlhbmd1bGFyLnRzXCI7XG5cbmV4cG9ydCB0eXBlIFVuY2VydGFpbnR5ID0gXCJsb3dcIiB8IFwibW9kZXJhdGVcIiB8IFwiaGlnaFwiIHwgXCJleHRyZW1lXCI7XG5cbmV4cG9ydCBjb25zdCBVbmNlcnRhaW50eVRvTnVtOiBSZWNvcmQ8VW5jZXJ0YWludHksIG51bWJlcj4gPSB7XG4gIGxvdzogMS4xLFxuICBtb2RlcmF0ZTogMS41LFxuICBoaWdoOiAyLFxuICBleHRyZW1lOiA1LFxufTtcblxuZXhwb3J0IGNsYXNzIEphY29iaWFuIHtcbiAgcHJpdmF0ZSB0cmlhbmd1bGFyOiBUcmlhbmd1bGFyO1xuICBjb25zdHJ1Y3RvcihleHBlY3RlZDogbnVtYmVyLCB1bmNlcnRhaW50eTogVW5jZXJ0YWludHkpIHtcbiAgICBjb25zdCBtdWwgPSBVbmNlcnRhaW50eVRvTnVtW3VuY2VydGFpbnR5XTtcbiAgICB0aGlzLnRyaWFuZ3VsYXIgPSBuZXcgVHJpYW5ndWxhcihleHBlY3RlZCAvIG11bCwgZXhwZWN0ZWQgKiBtdWwsIGV4cGVjdGVkKTtcbiAgfVxuXG4gIHNhbXBsZShwOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnRyaWFuZ3VsYXIuc2FtcGxlKHApO1xuICB9XG59XG4iLCAiaW1wb3J0IHtcbiAgQ2hhcnQsXG4gIENoYXJ0U2VyaWFsaXplZCxcbiAgVGFzayxcbiAgVGFza1NlcmlhbGl6ZWQsXG4gIHZhbGlkYXRlQ2hhcnQsXG59IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7XG4gIE1ldHJpY0RlZmluaXRpb24sXG4gIE1ldHJpY0RlZmluaXRpb25zLFxuICBNZXRyaWNEZWZpbml0aW9uc1NlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IE1ldHJpY1JhbmdlIH0gZnJvbSBcIi4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFJhdGlvbmFsaXplRWRnZXNPcCB9IGZyb20gXCIuLi9vcHMvY2hhcnQudHNcIjtcbmltcG9ydCB7XG4gIFJlc291cmNlRGVmaW5pdGlvbixcbiAgUmVzb3VyY2VEZWZpbml0aW9ucyxcbiAgUmVzb3VyY2VEZWZpbml0aW9uc1NlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgVW5jZXJ0YWludHlUb051bSB9IGZyb20gXCIuLi9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhbi50c1wiO1xuXG5leHBvcnQgdHlwZSBTdGF0aWNNZXRyaWNLZXlzID0gXCJEdXJhdGlvblwiIHwgXCJQZXJjZW50IENvbXBsZXRlXCI7XG5cbmV4cG9ydCBjb25zdCBTdGF0aWNNZXRyaWNEZWZpbml0aW9uczogTWV0cmljRGVmaW5pdGlvbnMgPSB7XG4gIC8vIEhvdyBsb25nIGEgdGFzayB3aWxsIHRha2UsIGluIGRheXMuXG4gIER1cmF0aW9uOiBuZXcgTWV0cmljRGVmaW5pdGlvbigwLCBuZXcgTWV0cmljUmFuZ2UoMCksIHRydWUpLFxuICAvLyBUaGUgcGVyY2VudCBjb21wbGV0ZSBmb3IgYSB0YXNrLlxuICBQZXJjZW50OiBuZXcgTWV0cmljRGVmaW5pdGlvbigwLCBuZXcgTWV0cmljUmFuZ2UoMCwgMTAwKSwgdHJ1ZSksXG59O1xuXG5leHBvcnQgY29uc3QgU3RhdGljUmVzb3VyY2VEZWZpbml0aW9uczogUmVzb3VyY2VEZWZpbml0aW9ucyA9IHtcbiAgVW5jZXJ0YWludHk6IG5ldyBSZXNvdXJjZURlZmluaXRpb24oT2JqZWN0LmtleXMoVW5jZXJ0YWludHlUb051bSksIHRydWUpLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBQbGFuU2VyaWFsaXplZCB7XG4gIGNoYXJ0OiBDaGFydFNlcmlhbGl6ZWQ7XG4gIHJlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnNTZXJpYWxpemVkO1xuICBtZXRyaWNEZWZpbml0aW9uczogTWV0cmljRGVmaW5pdGlvbnNTZXJpYWxpemVkO1xufVxuXG5leHBvcnQgY2xhc3MgUGxhbiB7XG4gIGNoYXJ0OiBDaGFydDtcblxuICByZXNvdXJjZURlZmluaXRpb25zOiBSZXNvdXJjZURlZmluaXRpb25zO1xuXG4gIG1ldHJpY0RlZmluaXRpb25zOiBNZXRyaWNEZWZpbml0aW9ucztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNoYXJ0ID0gbmV3IENoYXJ0KCk7XG5cbiAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zKTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljTWV0cmljRGVmaW5pdGlvbnMpO1xuICAgIHRoaXMuYXBwbHlNZXRyaWNzQW5kUmVzb3VyY2VzVG9WZXJ0aWNlcygpO1xuICB9XG5cbiAgYXBwbHlNZXRyaWNzQW5kUmVzb3VyY2VzVG9WZXJ0aWNlcygpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLm1ldHJpY0RlZmluaXRpb25zKS5mb3JFYWNoKChtZXRyaWNOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IG1kID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uc1ttZXRyaWNOYW1lXSE7XG4gICAgICB0aGlzLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgICAgdGFzay5zZXRNZXRyaWMobWV0cmljTmFtZSwgbWQuZGVmYXVsdCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBPYmplY3QuZW50cmllcyh0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMpLmZvckVhY2goXG4gICAgICAoW2tleSwgcmVzb3VyY2VEZWZpbml0aW9uXSkgPT4ge1xuICAgICAgICB0aGlzLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgICAgICB0YXNrLnNldFJlc291cmNlKGtleSwgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1swXSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICB0b0pTT04oKTogUGxhblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBjaGFydDogdGhpcy5jaGFydC50b0pTT04oKSxcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbnM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXModGhpcy5yZXNvdXJjZURlZmluaXRpb25zKS5maWx0ZXIoXG4gICAgICAgICAgKFtrZXksIHJlc291cmNlRGVmaW5pdGlvbl0pID0+ICFyZXNvdXJjZURlZmluaXRpb24uaXNTdGF0aWNcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIG1ldHJpY0RlZmluaXRpb25zOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpXG4gICAgICAgICAgLmZpbHRlcigoW2tleSwgbWV0cmljRGVmaW5pdGlvbl0pID0+ICFtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKVxuICAgICAgICAgIC5tYXAoKFtrZXksIG1ldHJpY0RlZmluaXRpb25dKSA9PiBba2V5LCBtZXRyaWNEZWZpbml0aW9uLnRvSlNPTigpXSlcbiAgICAgICksXG4gICAgfTtcbiAgfVxuXG4gIGdldE1ldHJpY0RlZmluaXRpb24oa2V5OiBzdHJpbmcpOiBNZXRyaWNEZWZpbml0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgc2V0TWV0cmljRGVmaW5pdGlvbihrZXk6IHN0cmluZywgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbikge1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XSA9IG1ldHJpY0RlZmluaXRpb247XG4gIH1cblxuICBkZWxldGVNZXRyaWNEZWZpbml0aW9uKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIGdldFJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZyk6IFJlc291cmNlRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgc2V0UmVzb3VyY2VEZWZpbml0aW9uKGtleTogc3RyaW5nLCB2YWx1ZTogUmVzb3VyY2VEZWZpbml0aW9uKSB7XG4gICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGRlbGV0ZVJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYSBuZXcgVGFzayB3aXRoIGRlZmF1bHRzIGZvciBhbGwgbWV0cmljcyBhbmQgcmVzb3VyY2VzLlxuICBuZXdUYXNrKCk6IFRhc2sge1xuICAgIGNvbnN0IHJldCA9IG5ldyBUYXNrKCk7XG4gICAgT2JqZWN0LmtleXModGhpcy5tZXRyaWNEZWZpbml0aW9ucykuZm9yRWFjaCgobWV0cmljTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBtZCA9IHRoaXMuZ2V0TWV0cmljRGVmaW5pdGlvbihtZXRyaWNOYW1lKSE7XG4gICAgICByZXQuc2V0TWV0cmljKG1ldHJpY05hbWUsIG1kLmRlZmF1bHQpO1xuICAgIH0pO1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZm9yRWFjaChcbiAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiB7XG4gICAgICAgIHJldC5zZXRSZXNvdXJjZShrZXksIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbMF0pO1xuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgRnJvbUpTT04gPSAodGV4dDogc3RyaW5nKTogUmVzdWx0PFBsYW4+ID0+IHtcbiAgY29uc3QgcGxhblNlcmlhbGl6ZWQ6IFBsYW5TZXJpYWxpemVkID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgY29uc3QgcGxhbiA9IG5ldyBQbGFuKCk7XG5cbiAgcGxhbi5jaGFydC5WZXJ0aWNlcyA9IHBsYW5TZXJpYWxpemVkLmNoYXJ0LnZlcnRpY2VzLm1hcChcbiAgICAodGFza1NlcmlhbGl6ZWQ6IFRhc2tTZXJpYWxpemVkKTogVGFzayA9PiB7XG4gICAgICBjb25zdCB0YXNrID0gbmV3IFRhc2sodGFza1NlcmlhbGl6ZWQubmFtZSk7XG4gICAgICB0YXNrLnN0YXRlID0gdGFza1NlcmlhbGl6ZWQuc3RhdGU7XG4gICAgICB0YXNrLm1ldHJpY3MgPSB0YXNrU2VyaWFsaXplZC5tZXRyaWNzO1xuICAgICAgdGFzay5yZXNvdXJjZXMgPSB0YXNrU2VyaWFsaXplZC5yZXNvdXJjZXM7XG5cbiAgICAgIHJldHVybiB0YXNrO1xuICAgIH1cbiAgKTtcbiAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW5TZXJpYWxpemVkLmNoYXJ0LmVkZ2VzLm1hcChcbiAgICAoZGlyZWN0ZWRFZGdlU2VyaWFsaXplZDogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCk6IERpcmVjdGVkRWRnZSA9PlxuICAgICAgbmV3IERpcmVjdGVkRWRnZShkaXJlY3RlZEVkZ2VTZXJpYWxpemVkLmksIGRpcmVjdGVkRWRnZVNlcmlhbGl6ZWQuailcbiAgKTtcblxuICBjb25zdCBkZXNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhwbGFuU2VyaWFsaXplZC5tZXRyaWNEZWZpbml0aW9ucykubWFwKFxuICAgICAgKFtrZXksIHNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uXSkgPT4gW1xuICAgICAgICBrZXksXG4gICAgICAgIE1ldHJpY0RlZmluaXRpb24uRnJvbUpTT04oc2VyaWFsaXplZE1ldHJpY0RlZmluaXRpb24pLFxuICAgICAgXVxuICAgIClcbiAgKTtcblxuICBwbGFuLm1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICB7fSxcbiAgICBTdGF0aWNNZXRyaWNEZWZpbml0aW9ucyxcbiAgICBkZXNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uc1xuICApO1xuXG4gIGNvbnN0IGRlc2VyaWFsaXplZFJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMocGxhblNlcmlhbGl6ZWQucmVzb3VyY2VEZWZpbml0aW9ucykubWFwKFxuICAgICAgKFtrZXksIHNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25dKSA9PiBbXG4gICAgICAgIGtleSxcbiAgICAgICAgUmVzb3VyY2VEZWZpbml0aW9uLkZyb21KU09OKHNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb24pLFxuICAgICAgXVxuICAgIClcbiAgKTtcblxuICBwbGFuLnJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgIHt9LFxuICAgIFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnMsXG4gICAgZGVzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9uc1xuICApO1xuXG4gIGNvbnN0IHJldCA9IFJhdGlvbmFsaXplRWRnZXNPcCgpLmFwcGx5VG8ocGxhbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGNvbnN0IHJldFZhbCA9IHZhbGlkYXRlQ2hhcnQocGxhbi5jaGFydCk7XG4gIGlmICghcmV0VmFsLm9rKSB7XG4gICAgcmV0dXJuIHJldFZhbDtcbiAgfVxuICByZXR1cm4gb2socGxhbik7XG59O1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuXCI7XG5pbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza05hbWVDaGFuZ2VEZXRhaWxzIHtcbiAgbmFtZTogc3RyaW5nO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYXNrUmVzb3VyY2VWYWx1ZUNoYW5nZURldGFpbHMge1xuICBuYW1lOiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tNZXRyaWNWYWx1ZUNoYW5nZURldGFpbHMge1xuICBuYW1lOiBzdHJpbmc7XG4gIHZhbHVlOiBudW1iZXI7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xufVxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXAge1xuICAgIFwidGFzay1uYW1lLWNoYW5nZVwiOiBDdXN0b21FdmVudDxUYXNrTmFtZUNoYW5nZURldGFpbHM+O1xuICAgIFwidGFzay1yZXNvdXJjZS12YWx1ZS1jaGFuZ2VcIjogQ3VzdG9tRXZlbnQ8VGFza1Jlc291cmNlVmFsdWVDaGFuZ2VEZXRhaWxzPjtcbiAgICBcInRhc2stbWV0cmljLXZhbHVlLWNoYW5nZVwiOiBDdXN0b21FdmVudDxUYXNrTWV0cmljVmFsdWVDaGFuZ2VEZXRhaWxzPjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2VsZWN0ZWRUYXNrUGFuZWwgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIHBsYW46IFBsYW4gPSBuZXcgUGxhbigpO1xuICB0YXNrSW5kZXg6IG51bWJlciA9IC0xO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICB1cGRhdGVTZWxlY3RlZFRhc2tQYW5lbChwbGFuOiBQbGFuLCB0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMucGxhbiA9IHBsYW47XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICAvKlxuICAgIFRPRE8gLSBEbyB0aGUgZm9sbG93aW5nIHdoZW4gc2VsZWN0aW5nIGEgbmV3IHRhc2suXG4gICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID1cbiAgICAgICAgICBzZWxlY3RlZFRhc2tQYW5lbC5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiI3Rhc2stbmFtZVwiKSE7XG4gICAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgICAgIGlucHV0LnNlbGVjdCgpO1xuICAgICAgfSwgMCk7XG4gICAgICAqL1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJlbmRlcih0aGlzLnRlbXBsYXRlKCksIHRoaXMpO1xuICB9XG5cbiAgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGNvbnN0IHRhc2tJbmRleCA9IHRoaXMudGFza0luZGV4O1xuICAgIGlmICh0YXNrSW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm4gaHRtbGBObyB0YXNrIHNlbGVjdGVkLmA7XG4gICAgfVxuICAgIGNvbnN0IHRhc2sgPSB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XTtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDx0YWJsZT5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZD5OYW1lPC90ZD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICBpZD1cInRhc2stbmFtZVwiXG4gICAgICAgICAgICAgIC52YWx1ZT1cIiR7dGFzay5uYW1lfVwiXG4gICAgICAgICAgICAgIEBjaGFuZ2U9JHsoZTogRXZlbnQpID0+XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50PFRhc2tOYW1lQ2hhbmdlRGV0YWlscz4oXCJ0YXNrLW5hbWUtY2hhbmdlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICAke09iamVjdC5lbnRyaWVzKHRoaXMucGxhbi5yZXNvdXJjZURlZmluaXRpb25zKS5tYXAoXG4gICAgICAgICAgKFtyZXNvdXJjZUtleSwgZGVmbl0pID0+XG4gICAgICAgICAgICBodG1sYCA8dHI+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiJHtyZXNvdXJjZUtleX1cIj4ke3Jlc291cmNlS2V5fTwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICAgICAgICBpZD1cIiR7cmVzb3VyY2VLZXl9XCJcbiAgICAgICAgICAgICAgICAgIEBjaGFuZ2U9JHthc3luYyAoZTogRXZlbnQpID0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJ0YXNrLXJlc291cmNlLXZhbHVlLWNoYW5nZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByZXNvdXJjZUtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAke2RlZm4udmFsdWVzLm1hcChcbiAgICAgICAgICAgICAgICAgICAgKHJlc291cmNlVmFsdWU6IHN0cmluZykgPT5cbiAgICAgICAgICAgICAgICAgICAgICBodG1sYDxvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9JHtyZXNvdXJjZVZhbHVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdGVkPSR7dGFzay5yZXNvdXJjZXNbcmVzb3VyY2VLZXldID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAke3Jlc291cmNlVmFsdWV9XG4gICAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+YFxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+YFxuICAgICAgICApfVxuICAgICAgICAke09iamVjdC5rZXlzKHRoaXMucGxhbi5tZXRyaWNEZWZpbml0aW9ucykubWFwKFxuICAgICAgICAgIChrZXk6IHN0cmluZykgPT5cbiAgICAgICAgICAgIGh0bWxgIDx0cj5cbiAgICAgICAgICAgICAgPHRkPjxsYWJlbCBmb3I9XCIke2tleX1cIj4ke2tleX08L2xhYmVsPjwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgIGlkPVwiJHtrZXl9XCJcbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgLnZhbHVlPVwiJHt0YXNrLm1ldHJpY3Nba2V5XX1cIlxuICAgICAgICAgICAgICAgICAgQGNoYW5nZT0ke2FzeW5jIChlOiBFdmVudCkgPT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChcInRhc2stbWV0cmljLXZhbHVlLWNoYW5nZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogKyhlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgKX1cbiAgICAgIDwvdGFibGU+XG4gICAgYDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJzZWxlY3RlZC10YXNrLXBhbmVsXCIsIFNlbGVjdGVkVGFza1BhbmVsKTtcbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpbi50c1wiO1xuaW1wb3J0IHsgU2VhcmNoVHlwZSwgVGFza1NlYXJjaENvbnRyb2wgfSBmcm9tIFwiLi90YXNrLXNlYXJjaC1jb250cm9scy50c1wiO1xuXG4vKiogVXNlcyBhIHRhc2stc2VhcmNoLWNvbnRyb2wgdG8gc2VhcmNoIHRocm91Z2ggYWxsIFRhc2tzLiAqL1xuZXhwb3J0IGNsYXNzIFNlYXJjaFRhc2tQYW5lbCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpbiB8IG51bGwgPSBudWxsO1xuICB0YXNrU2VhcmNoQ29udHJvbDogVGFza1NlYXJjaENvbnRyb2wgfCBudWxsID0gbnVsbDtcblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICB0aGlzLmV4cGxhbk1haW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZXhwbGFuLW1haW5cIik7XG4gICAgaWYgKCF0aGlzLmV4cGxhbk1haW4pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCA9IHRoaXMucXVlcnlTZWxlY3RvcihcInRhc2stc2VhcmNoLWNvbnRyb2xcIik7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwidGFzay1jaGFuZ2VcIiwgKGUpID0+XG4gICAgICB0aGlzLmV4cGxhbk1haW4hLnNldEZvY3VzT25UYXNrKGUuZGV0YWlsKVxuICAgICk7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwidGFzay1mb2N1c1wiLCAoZSkgPT5cbiAgICAgIHRoaXMuc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoXCJmdWxsLWluZm9cIilcbiAgICApO1xuICB9XG5cbiAgc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoc2VhcmNoVHlwZTogU2VhcmNoVHlwZSkge1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLnRhc2tzID0gdGhpcy5leHBsYW5NYWluIS5wbGFuLmNoYXJ0LlZlcnRpY2VzO1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLmluY2x1ZGVkSW5kZXhlcyA9IFtdO1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLnNldEtleWJvYXJkRm9jdXNUb0lucHV0KHNlYXJjaFR5cGUpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcInNlYXJjaC10YXNrLXBhbmVsXCIsIFNlYXJjaFRhc2tQYW5lbCk7XG4iLCAiaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IGZ1enp5c29ydCBmcm9tIFwiZnV6enlzb3J0XCI7XG5pbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJ0YXNrLWNoYW5nZVwiOiBDdXN0b21FdmVudDxudW1iZXI+O1xuICAgIFwidGFzay1mb2N1c1wiOiBDdXN0b21FdmVudDxudWxsPjtcbiAgfVxufVxuXG4vKiogVGhlIGluZGV4ZXMgcmV0dXJuZWQgYnkgZnV6enlzb3J0IGlzIGp1c3QgYSBsaXN0IG9mIHRoZSBpbmRleGVzIG9mIHRoZSB0aGVcbiAqICBpbmRpdmlkdWFsIGNoYXJzIHRoYXQgaGF2ZSBiZWVuIG1hdGNoZWQuIFdlIG5lZWQgdG8gdHVybiB0aGF0IGludG8gcGFpcnMgb2ZcbiAqICBudW1iZXJzIHdlIGNhbiBwYXNzIHRvIFN0cmluZy5wcm90b3R5cGUuc2xpY2UoKS5cbiAqXG4gKiAgVGhlIG9ic2VydmF0aW9uIGhlcmUgaXMgdGhhdCBpZiB0aGUgdGFyZ2V0IHN0cmluZyBpcyBcIkhlbGxvXCIgYW5kIHRoZSBpbmRpY2VzXG4gKiAgYXJlIFsyLDNdIHRoZW4gaXQgZG9lc24ndCBtYXR0ZXIgaWYgd2UgbWFya3VwIHRoZSBoaWdobGlnaHRlZCB0YXJnZXQgYXNcbiAqICBcIkhlPGI+bGw8L2I+b1wiIG9yIFwiSGU8Yj5sPC9iPjxiPmw8L2I+b1wiLiBUaGF0IGlzLCB3ZSBjYW4gc2ltcGxpZnkgaWYgd2VcbiAqICBhbHdheXMgc2xpY2Ugb3V0IGVhY2ggY2hhcmFjdGVyIGluIHRoZSB0YXJnZXQgc3RyaW5nIHRoYXQgbmVlZHMgdG8gYmVcbiAqICBoaWdobGlnaHRlZC5cbiAqXG4gKiAgU28gaW5kZXhlc1RvUmFuZ2VzIHJldHVybnMgYW4gYXJyYXkgb2YgaW5kZXhlcywgdGhhdCBpZiB0YWtlbiBpbiBwYWlycywgd2lsbFxuICogIGFsdGVybmF0ZWx5IHNsaWNlIG9mZiBwYXJ0cyBvZiB0YXJnZXQgdGhhdCBuZWVkIHRvIGJlIGVtcGhhc2l6ZWQuXG4gKlxuICogIEluIHRoZSBhYm92ZSBleGFtcGxlIHRhcmdldCA9IFwiSGVsbG9cIiBhbmQgaW5kZXhlcyA9IFsyLDNdLCB0aGVuXG4gKiAgaW5kZXhlc1RvUmFuZ2VzIHdpbGwgcmV0dXJuXCJcbiAqXG4gKiAgICAgWzAsMiwzLDMsNCw1XVxuICpcbiAqICB3aGljaCB3aWxsIGdlbmVyYXRlIHRoZSBmb2xsb3dpbmcgcGFpcnMgYXMgYXJncyB0byBzbGljZTpcbiAqXG4gKiAgICAgWzAsMl0gSGVcbiAqICAgICBbMiwzXSBsICAgI1xuICogICAgIFszLDNdXG4gKiAgICAgWzMsNF0gbCAgICNcbiAqICAgICBbNCw1XSBvXG4gKlxuICogTm90ZSB0aGF0IGlmIHdlIGFsdGVybmF0ZSBib2xkaW5nIHRoZW4gb25seSB0aGUgdHdvICdsJ3MgZ2V0IGVtcGhhc2l6ZWQsXG4gKiB3aGljaCBpcyB3aGF0IHdlIHdhbnQgKERlbm90ZWQgYnkgIyBhYm92ZSkuXG4gKi9cbmNvbnN0IGluZGV4ZXNUb1JhbmdlcyA9IChcbiAgaW5kZXhlczogUmVhZG9ubHk8bnVtYmVyW10+LFxuICBsZW46IG51bWJlclxuKTogbnVtYmVyW10gPT4ge1xuICAvLyBDb252ZXJ0IGVhY2ggaW5kZXggb2YgYSBoaWdobGlnaHRlZCBjaGFyIGludG8gYSBwYWlyIG9mIG51bWJlcnMgd2UgY2FuIHBhc3NcbiAgLy8gdG8gc2xpY2UsIGFuZCB0aGVuIGZsYXR0ZW4uXG4gIGNvbnN0IHJhbmdlcyA9IGluZGV4ZXMubWFwKCh4OiBudW1iZXIpID0+IFt4LCB4ICsgMV0pLmZsYXQoKTtcblxuICAvLyBOb3cgcHJlcGVuZCB3aXRoIDAgYW5kIGFwcGVuZCAnbGVuJyBzbyB0aGF0IHdlIGhhdmUgcGFpcnMgdGhhdCB3aWxsIHNsaWNlXG4gIC8vIHRhcmdldCBmdWxseSBpbnRvIHN1YnN0cmluZ3MuIFJlbWVtYmVyIHRoYXQgc2xpY2UgcmV0dXJuIGNoYXJzIGluIFthLCBiKSxcbiAgLy8gaS5lLiBTdHJpbmcuc2xpY2UoYSxiKSB3aGVyZSBiIGlzIG9uZSBiZXlvbmQgdGhlIGxhc3QgY2hhciBpbiB0aGUgc3RyaW5nIHdlXG4gIC8vIHdhbnQgdG8gaW5jbHVkZS5cbiAgcmV0dXJuIFswLCAuLi5yYW5nZXMsIGxlbl07XG59O1xuXG4vKiogUmV0dXJucyB0aGUgdGFyZ2V0IHN0cmluZyBoaWdobGlnaHRlZCBhcm91bmQgdGhlIGdpdmVuIGNoYXJhY3RlciBpbmRleGVzIGluXG4gKiAgdGhlIHJhbmdlcyBhcnJheS4gKi9cbmNvbnN0IGhpZ2hsaWdodCA9IChyYW5nZXM6IG51bWJlcltdLCB0YXJnZXQ6IHN0cmluZyk6IFRlbXBsYXRlUmVzdWx0W10gPT4ge1xuICBjb25zdCByZXQ6IFRlbXBsYXRlUmVzdWx0W10gPSBbXTtcbiAgbGV0IGluSGlnaGxpZ2h0ID0gZmFsc2U7XG5cbiAgLy8gUnVuIGRvd24gcmFuZ2VzIHdpdGggYSBzbGlkaW5nIHdpbmRvdyBvZiBsZW5ndGggMiBhbmQgdXNlIHRoYXQgYXMgdGhlXG4gIC8vIGFyZ3VtZW50cyB0byBzbGljZS4gQWx0ZXJuYXRlIGhpZ2hsaWdodGluZyBlYWNoIHNlZ21lbnQuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGNvbnN0IHN1YiA9IHRhcmdldC5zbGljZShyYW5nZXNbaV0sIHJhbmdlc1tpICsgMV0pO1xuICAgIGlmIChpbkhpZ2hsaWdodCkge1xuICAgICAgcmV0LnB1c2goaHRtbGA8Yj4ke3N1Yn08L2I+YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldC5wdXNoKGh0bWxgJHtzdWJ9YCk7XG4gICAgfVxuICAgIGluSGlnaGxpZ2h0ID0gIWluSGlnaGxpZ2h0O1xuICB9XG4gIHJldHVybiByZXQ7XG59O1xuXG4vKiogUmV0dXJucyB0aGUgdGFyZ2V0IHN0cmluZyBoaWdobGlnaHRlZCBhcm91bmQgdGhlIGdpdmVuIGNoYXJhY3RlciBpbmRleGVzLlxuICogIE5vdGUgdGhhdCB3ZSBkb24ndCB1c2UgZnV6enlzb3J0J3MgaGlnaGxpZ2h0IGJlY2F1c2Ugd2UgaGF2ZW4ndCBzYW5pdGl6ZWRcbiAqICB0aGUgbmFtZXMuXG4gKi9cbmNvbnN0IGhpZ2hsaWdodGVkVGFyZ2V0ID0gKFxuICBpbmRleGVzOiBSZWFkb25seTxudW1iZXJbXT4sXG4gIHRhcmdldDogc3RyaW5nXG4pOiBUZW1wbGF0ZVJlc3VsdFtdID0+IHtcbiAgcmV0dXJuIGhpZ2hsaWdodChpbmRleGVzVG9SYW5nZXMoaW5kZXhlcywgdGFyZ2V0Lmxlbmd0aCksIHRhcmdldCk7XG59O1xuXG5jb25zdCB0ZW1wbGF0ZSA9IChzZWFyY2hUYXNrUGFuZWw6IFRhc2tTZWFyY2hDb250cm9sKSA9PiBodG1sYFxuICA8aW5wdXRcbiAgICB0eXBlPVwidGV4dFwiXG4gICAgQGlucHV0PVwiJHsoZTogSW5wdXRFdmVudCkgPT4gc2VhcmNoVGFza1BhbmVsLm9uSW5wdXQoZSl9XCJcbiAgICBAa2V5ZG93bj1cIiR7KGU6IEtleWJvYXJkRXZlbnQpID0+IHNlYXJjaFRhc2tQYW5lbC5vbktleURvd24oZSl9XCJcbiAgICBAYmx1cj1cIiR7KCkgPT4gc2VhcmNoVGFza1BhbmVsLmxvc3NPZkZvY3VzKCl9XCJcbiAgICBAZm9jdXM9XCIkeygpID0+IHNlYXJjaFRhc2tQYW5lbC5zZWFyY2hJbnB1dFJlY2VpdmVkRm9jdXMoKX1cIlxuICAvPlxuICA8dWw+XG4gICAgJHtzZWFyY2hUYXNrUGFuZWwuc2VhcmNoUmVzdWx0cy5tYXAoXG4gICAgICAodGFzazogRnV6enlzb3J0LktleVJlc3VsdDxUYXNrPiwgaW5kZXg6IG51bWJlcikgPT5cbiAgICAgICAgaHRtbGAgPGxpXG4gICAgICAgICAgQGNsaWNrPVwiJHsoKSA9PiBzZWFyY2hUYXNrUGFuZWwuc2VsZWN0U2VhcmNoUmVzdWx0KGluZGV4KX1cIlxuICAgICAgICAgID9kYXRhLWZvY3VzPSR7aW5kZXggPT09IHNlYXJjaFRhc2tQYW5lbC5mb2N1c0luZGV4fVxuICAgICAgICA+XG4gICAgICAgICAgJHtoaWdobGlnaHRlZFRhcmdldCh0YXNrLmluZGV4ZXMsIHRhc2sudGFyZ2V0KX1cbiAgICAgICAgPC9saT5gXG4gICAgKX1cbiAgPC91bD5cbmA7XG5cbmV4cG9ydCB0eXBlIFNlYXJjaFR5cGUgPSBcIm5hbWUtb25seVwiIHwgXCJmdWxsLWluZm9cIjtcblxuY29uc3Qgc2VhcmNoU3RyaW5nRnJvbVRhc2tCdWlsZGVyID0gKFxuICBmdWxsVGFza0xpc3Q6IFRhc2tbXSxcbiAgc2VhcmNoVHlwZTogU2VhcmNoVHlwZSxcbiAgaW5jbHVkZWRJbmRleGVzOiBTZXQ8bnVtYmVyPixcbiAgbWF4TmFtZUxlbmd0aDogbnVtYmVyXG4pOiAoKHRhc2s6IFRhc2spID0+IHN0cmluZykgPT4ge1xuICBpZiAoc2VhcmNoVHlwZSA9PT0gXCJmdWxsLWluZm9cIikge1xuICAgIHJldHVybiAodGFzazogVGFzayk6IHN0cmluZyA9PiB7XG4gICAgICBpZiAoaW5jbHVkZWRJbmRleGVzLnNpemUgIT09IDApIHtcbiAgICAgICAgY29uc3QgdGFza0luZGV4ID0gZnVsbFRhc2tMaXN0LmluZGV4T2YodGFzayk7XG4gICAgICAgIGlmICghaW5jbHVkZWRJbmRleGVzLmhhcyh0YXNrSW5kZXgpKSB7XG4gICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHRhc2sucmVzb3VyY2VzKTtcbiAgICAgIHJlc291cmNlS2V5cy5zb3J0KCk7XG4gICAgICByZXR1cm4gYCR7dGFzay5uYW1lfSAke1wiLVwiLnJlcGVhdChtYXhOYW1lTGVuZ3RoIC0gdGFzay5uYW1lLmxlbmd0aCArIDIpfSAke3Jlc291cmNlS2V5c1xuICAgICAgICAubWFwKChrZXk6IHN0cmluZykgPT4gdGFzay5yZXNvdXJjZXNba2V5XSlcbiAgICAgICAgLmpvaW4oXCIgXCIpfWA7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKHRhc2s6IFRhc2spOiBzdHJpbmcgPT4ge1xuICAgICAgaWYgKGluY2x1ZGVkSW5kZXhlcy5zaXplICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IHRhc2tJbmRleCA9IGZ1bGxUYXNrTGlzdC5pbmRleE9mKHRhc2spO1xuICAgICAgICBpZiAoIWluY2x1ZGVkSW5kZXhlcy5oYXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGFzay5uYW1lO1xuICAgIH07XG4gIH1cbn07XG5cbmV4cG9ydCBjbGFzcyBUYXNrU2VhcmNoQ29udHJvbCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgX3Rhc2tzOiBUYXNrW10gPSBbXTtcbiAgX2luY2x1ZGVkSW5kZXhlczogU2V0PG51bWJlcj4gPSBuZXcgU2V0KCk7XG4gIGZvY3VzSW5kZXg6IG51bWJlciA9IDA7XG4gIHNlYXJjaFJlc3VsdHM6IEZ1enp5c29ydC5LZXlSZXN1bHRzPFRhc2s+IHwgW10gPSBbXTtcbiAgc2VhcmNoVHlwZTogU2VhcmNoVHlwZSA9IFwibmFtZS1vbmx5XCI7XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIG9uSW5wdXQoZTogSW5wdXRFdmVudCkge1xuICAgIGNvbnN0IG1heE5hbWVMZW5ndGggPSB0aGlzLl90YXNrcy5yZWR1Y2U8bnVtYmVyPihcbiAgICAgIChwcmV2OiBudW1iZXIsIHRhc2s6IFRhc2spOiBudW1iZXIgPT5cbiAgICAgICAgdGFzay5uYW1lLmxlbmd0aCA+IHByZXYgPyB0YXNrLm5hbWUubGVuZ3RoIDogcHJldixcbiAgICAgIDBcbiAgICApO1xuICAgIHRoaXMuc2VhcmNoUmVzdWx0cyA9IGZ1enp5c29ydC5nbzxUYXNrPihcbiAgICAgIChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSxcbiAgICAgIHRoaXMuX3Rhc2tzLnNsaWNlKDEsIC0xKSwgLy8gUmVtb3ZlIFN0YXJ0IGFuZCBGaW5pc2ggZnJvbSBzZWFyY2ggcmFuZ2UuXG4gICAgICB7XG4gICAgICAgIGtleTogc2VhcmNoU3RyaW5nRnJvbVRhc2tCdWlsZGVyKFxuICAgICAgICAgIHRoaXMuX3Rhc2tzLFxuICAgICAgICAgIHRoaXMuc2VhcmNoVHlwZSxcbiAgICAgICAgICB0aGlzLl9pbmNsdWRlZEluZGV4ZXMsXG4gICAgICAgICAgbWF4TmFtZUxlbmd0aFxuICAgICAgICApLFxuICAgICAgICBsaW1pdDogMTUsXG4gICAgICAgIHRocmVzaG9sZDogMC4yLFxuICAgICAgfVxuICAgICk7XG4gICAgdGhpcy5mb2N1c0luZGV4ID0gMDtcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgb25LZXlEb3duKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAodGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUT0RPIC0gZXh0cmFjdCBmcm9tIHRoZSB0d28gcGxhY2VzIHdlIGRvIHRoaXMuXG4gICAgY29uc3Qga2V5bmFtZSA9IGAke2Uuc2hpZnRLZXkgPyBcInNoaWZ0LVwiIDogXCJcIn0ke2UuY3RybEtleSA/IFwiY3RybC1cIiA6IFwiXCJ9JHtlLm1ldGFLZXkgPyBcIm1ldGEtXCIgOiBcIlwifSR7ZS5hbHRLZXkgPyBcImFsdC1cIiA6IFwiXCJ9JHtlLmtleX1gO1xuICAgIHN3aXRjaCAoa2V5bmFtZSkge1xuICAgICAgY2FzZSBcIkFycm93RG93blwiOlxuICAgICAgICB0aGlzLmZvY3VzSW5kZXggPSAodGhpcy5mb2N1c0luZGV4ICsgMSkgJSB0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93VXBcIjpcbiAgICAgICAgdGhpcy5mb2N1c0luZGV4ID1cbiAgICAgICAgICAodGhpcy5mb2N1c0luZGV4IC0gMSArIHRoaXMuc2VhcmNoUmVzdWx0cy5sZW5ndGgpICVcbiAgICAgICAgICB0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkVudGVyXCI6XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VsZWN0U2VhcmNoUmVzdWx0KHRoaXMuZm9jdXNJbmRleCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgc2VsZWN0U2VhcmNoUmVzdWx0KGluZGV4OiBudW1iZXIpIHtcbiAgICBjb25zdCB0YXNrSW5kZXggPSB0aGlzLl90YXNrcy5pbmRleE9mKHRoaXMuc2VhcmNoUmVzdWx0c1tpbmRleF0ub2JqKTtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8bnVtYmVyPihcInRhc2stY2hhbmdlXCIsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgZGV0YWlsOiB0YXNrSW5kZXgsXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gW107XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIHNlYXJjaElucHV0UmVjZWl2ZWRGb2N1cygpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8bnVtYmVyPihcInRhc2stZm9jdXNcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoc2VhcmNoVHlwZTogU2VhcmNoVHlwZSkge1xuICAgIHRoaXMuc2VhcmNoVHlwZSA9IHNlYXJjaFR5cGU7XG4gICAgY29uc3QgaW5wdXRDb250cm9sID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiaW5wdXRcIikhO1xuICAgIGlucHV0Q29udHJvbC5mb2N1cygpO1xuICAgIGlucHV0Q29udHJvbC5zZWxlY3QoKTtcbiAgfVxuXG4gIGxvc3NPZkZvY3VzKCkge1xuICAgIHRoaXMuc2VhcmNoUmVzdWx0cyA9IFtdO1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBwdWJsaWMgc2V0IHRhc2tzKHRhc2tzOiBUYXNrW10pIHtcbiAgICB0aGlzLl90YXNrcyA9IHRhc2tzO1xuICB9XG5cbiAgcHVibGljIHNldCBpbmNsdWRlZEluZGV4ZXModjogbnVtYmVyW10pIHtcbiAgICB0aGlzLl9pbmNsdWRlZEluZGV4ZXMgPSBuZXcgU2V0KHYpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcInRhc2stc2VhcmNoLWNvbnRyb2xcIiwgVGFza1NlYXJjaENvbnRyb2wpO1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcblxuZXhwb3J0IHR5cGUgRGVwVHlwZSA9IFwicHJlZFwiIHwgXCJzdWNjXCI7XG5cbmV4cG9ydCBjb25zdCBkZXBEaXNwbGF5TmFtZTogUmVjb3JkPERlcFR5cGUsIHN0cmluZz4gPSB7XG4gIHByZWQ6IFwiUHJlZGVjZXNzb3JzXCIsXG4gIHN1Y2M6IFwiU3VjY2Vzc29yc1wiLFxufTtcblxuaW50ZXJmYWNlIERlcGVuZW5jeUV2ZW50IHtcbiAgdGFza0luZGV4OiBudW1iZXI7XG4gIGRlcFR5cGU6IERlcFR5cGU7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJkZWxldGUtZGVwZW5kZW5jeVwiOiBDdXN0b21FdmVudDxEZXBlbmVuY3lFdmVudD47XG4gICAgXCJhZGQtZGVwZW5kZW5jeVwiOiBDdXN0b21FdmVudDxEZXBlbmVuY3lFdmVudD47XG4gIH1cbn1cblxuY29uc3Qga2luZFRlbXBsYXRlID0gKFxuICBkZXBlbmRlbmNpZXNDb250cm9sOiBEZXBlbmRlbmNpZXNQYW5lbCxcbiAgZGVwVHlwZTogRGVwVHlwZSxcbiAgaW5kZXhlczogbnVtYmVyW11cbik6IFRlbXBsYXRlUmVzdWx0ID0+IGh0bWxgXG4gIDx0cj5cbiAgICA8dGg+JHtkZXBEaXNwbGF5TmFtZVtkZXBUeXBlXX08L3RoPlxuICAgIDx0aD48L3RoPlxuICA8L3RyPlxuICAke2luZGV4ZXMubWFwKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSBkZXBlbmRlbmNpZXNDb250cm9sLnRhc2tzW3Rhc2tJbmRleF07XG4gICAgcmV0dXJuIGh0bWxgPHRyPlxuICAgICAgPHRkPiR7dGFzay5uYW1lfTwvdGQ+XG4gICAgICA8dGQ+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzcz1cImRlbGV0ZVwiXG4gICAgICAgICAgdGl0bGU9XCJEZWxldGUgdGhlIGRlcGVuZGVuY3kgb24gJHt0YXNrLm5hbWV9XCJcbiAgICAgICAgICBAY2xpY2s9JHsoKSA9PiBkZXBlbmRlbmNpZXNDb250cm9sLmRlbGV0ZURlcCh0YXNrSW5kZXgsIGRlcFR5cGUpfVxuICAgICAgICA+XG4gICAgICAgICAgXHUyNzE3XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC90ZD5cbiAgICA8L3RyPmA7XG4gIH0pfVxuICA8dHI+XG4gICAgPHRkPjwvdGQ+XG4gICAgPHRkPlxuICAgICAgPGJ1dHRvblxuICAgICAgICBAY2xpY2s9JHsoKSA9PiBkZXBlbmRlbmNpZXNDb250cm9sLmFkZERlcChkZXBUeXBlKX1cbiAgICAgICAgdGl0bGU9XCJBZGQgZGVwZW5kZW5jeS5cIlxuICAgICAgPlxuICAgICAgICArXG4gICAgICA8L2J1dHRvbj5cbiAgICA8L3RkPlxuICA8L3RyPlxuYDtcblxuY29uc3QgdGVtcGxhdGUgPSAoXG4gIGRlcGVuZGVuY2llc0NvbnRyb2w6IERlcGVuZGVuY2llc1BhbmVsXG4pOiBUZW1wbGF0ZVJlc3VsdCA9PiBodG1sYFxuICA8dGFibGU+XG4gICAgJHtraW5kVGVtcGxhdGUoXG4gICAgICBkZXBlbmRlbmNpZXNDb250cm9sLFxuICAgICAgXCJwcmVkXCIsXG4gICAgICBkZXBlbmRlbmNpZXNDb250cm9sLnByZWRJbmRleGVzXG4gICAgKX1cbiAgICAke2tpbmRUZW1wbGF0ZShcbiAgICAgIGRlcGVuZGVuY2llc0NvbnRyb2wsXG4gICAgICBcInN1Y2NcIixcbiAgICAgIGRlcGVuZGVuY2llc0NvbnRyb2wuc3VjY0luZGV4ZXNcbiAgICApfVxuICA8L3RhYmxlPlxuYDtcblxuZXhwb3J0IGNsYXNzIERlcGVuZGVuY2llc1BhbmVsIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICB0YXNrczogVGFza1tdID0gW107XG4gIHByZWRJbmRleGVzOiBudW1iZXJbXSA9IFtdO1xuICBzdWNjSW5kZXhlczogbnVtYmVyW10gPSBbXTtcblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgcHVibGljIHNldFRhc2tzQW5kSW5kaWNlcyhcbiAgICB0YXNrczogVGFza1tdLFxuICAgIHByZWRJbmRleGVzOiBudW1iZXJbXSxcbiAgICBzdWNjSW5kZXhlczogbnVtYmVyW11cbiAgKSB7XG4gICAgdGhpcy50YXNrcyA9IHRhc2tzO1xuICAgIHRoaXMucHJlZEluZGV4ZXMgPSBwcmVkSW5kZXhlcztcbiAgICB0aGlzLnN1Y2NJbmRleGVzID0gc3VjY0luZGV4ZXM7XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVEZXAodGFza0luZGV4OiBudW1iZXIsIGRlcFR5cGU6IERlcFR5cGUpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJkZWxldGUtZGVwZW5kZW5jeVwiLCB7XG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgIGRlcFR5cGU6IGRlcFR5cGUsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgYWRkRGVwKGRlcFR5cGU6IERlcFR5cGUpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJhZGQtZGVwZW5kZW5jeVwiLCB7XG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGRldGFpbDoge1xuICAgICAgICAgIHRhc2tJbmRleDogLTEsXG4gICAgICAgICAgZGVwVHlwZTogZGVwVHlwZSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJkZXBlbmRlbmNpZXMtcGFuZWxcIiwgRGVwZW5kZW5jaWVzUGFuZWwpO1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IE9wLCBTdWJPcCwgU3ViT3BSZXN1bHQgfSBmcm9tIFwiLi9vcHMudHNcIjtcbmltcG9ydCB7XG4gIERFRkFVTFRfUkVTT1VSQ0VfVkFMVUUsXG4gIFJlc291cmNlRGVmaW5pdGlvbixcbn0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcblxuZXhwb3J0IGNsYXNzIEFkZFJlc291cmNlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gIHRhc2tSZXNvdXJjZVZhbHVlczogTWFwPG51bWJlciwgc3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdGFza1Jlc291cmNlVmFsdWVzOiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gbmV3IE1hcDxudW1iZXIsIHN0cmluZz4oKSAvLyBTaG91bGQgb25seSBiZSBzdXBwbGllZCBieSBpbnZlcnNlIGFjdGlvbnMuXG4gICkge1xuICAgIHRoaXMua2V5ID0gbmFtZTtcbiAgICB0aGlzLnRhc2tSZXNvdXJjZVZhbHVlcyA9IHRhc2tSZXNvdXJjZVZhbHVlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBhbHJlYWR5IGV4aXN0cyBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXksIG5ldyBSZXNvdXJjZURlZmluaXRpb24oKSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGFkZCB0aGlzIGtleSBhbmQgc2V0IGl0IHRvIHRoZSBkZWZhdWx0LCB1bmxlc3NcbiAgICAvLyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrUmVzb3VyY2VWYWx1ZXMsIGluIHdoaWNoIGNhc2Ugd2Ugd2lsbCB1c2UgdGhhdCB2YWx1ZS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIHRhc2suc2V0UmVzb3VyY2UoXG4gICAgICAgIHRoaXMua2V5LFxuICAgICAgICB0aGlzLnRhc2tSZXNvdXJjZVZhbHVlcy5nZXQoaW5kZXgpIHx8IERFRkFVTFRfUkVTT1VSQ0VfVkFMVUVcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlUmVzb3VyY2VTdXBPcCh0aGlzLmtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVJlc291cmNlU3VwT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMua2V5ID0gbmFtZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHJlc291cmNlRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYFRoZSByZXNvdXJjZSB3aXRoIG5hbWUgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYW5kIGNhbid0IGJlIGRlbGV0ZWQuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZnJvbSByZXNvdXJjZSBkZWZpbml0aW9ucy5cbiAgICBwbGFuLmRlbGV0ZU1ldHJpY0RlZmluaXRpb24odGhpcy5rZXkpO1xuXG4gICAgY29uc3QgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZTogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXAoKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgcmVtb3ZlIGB0aGlzLmtleWAgZnJvbSB0aGUgcmVzb3VyY2VzIHdoaWxlIGFsc29cbiAgICAvLyBidWlsZGluZyB1cCB0aGUgaW5mbyBuZWVkZWQgZm9yIGEgcmV2ZXJ0LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFO1xuICAgICAgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZS5zZXQoaW5kZXgsIHZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlUmVzb3VyY2UodGhpcy5rZXkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UodGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZSksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoXG4gICAgcmVzb3VyY2VWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VLZXk6IE1hcDxudW1iZXIsIHN0cmluZz5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkUmVzb3VyY2VTdWJPcCh0aGlzLmtleSwgcmVzb3VyY2VWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VLZXkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW10gLy8gVGhpcyBzaG91bGQgb25seSBiZSBzdXBwbGllZCB3aGVuIGJlaW5nIGNvbnN0cnVjdGVkIGFzIGEgaW52ZXJzZSBvcGVyYXRpb24uXG4gICkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UgPSBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXNuJ3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cbiAgICBjb25zdCBleGlzdGluZ0luZGV4ID0gZGVmaW5pdGlvbi52YWx1ZXMuZmluZEluZGV4KFxuICAgICAgKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlID09PSB0aGlzLnZhbHVlXG4gICAgKTtcbiAgICBpZiAoZXhpc3RpbmdJbmRleCAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy52YWx1ZX0gYWxyZWFkeSBleGlzdHMgYXMgYSB2YWx1ZSBpbiB0aGUgUmVzb3VyY2UgJHt0aGlzLmtleX0uYFxuICAgICAgKTtcbiAgICB9XG4gICAgZGVmaW5pdGlvbi52YWx1ZXMucHVzaCh0aGlzLnZhbHVlKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgc2V0IHRoZSB2YWx1ZSBmb3IgdGhlIGdpdmVuIGtleSBmb3IgYWxsIHRoZVxuICAgIC8vIHRhc2tzIGxpc3RlZCBpbiBgaW5kaWNlc09mVGFza3NUb0NoYW5nZWAuXG4gICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uc2V0UmVzb3VyY2UodGhpcy5rZXksIHRoaXMudmFsdWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy52YWx1ZSxcbiAgICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW11cbiAgKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZSA9IGluZGljZXNPZlRhc2tzVG9DaGFuZ2U7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lc24ndCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlSW5kZXggPSBkZWZpbml0aW9uLnZhbHVlcy5maW5kSW5kZXgoXG4gICAgICAodmFsdWU6IHN0cmluZykgPT4gdmFsdWUgPT09IHRoaXMudmFsdWVcbiAgICApO1xuICAgIGlmICh2YWx1ZUluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLnZhbHVlfSBkb2VzIG5vdCBleGlzdCBhcyBhIHZhbHVlIGluIHRoZSBSZXNvdXJjZSAke3RoaXMua2V5fS5gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBSZXNvdXJjZXMgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSB2YWx1ZS4gJHt0aGlzLnZhbHVlfSBvbmx5IGhhcyBvbmUgdmFsdWUsIHNvIGl0IGNhbid0IGJlIGRlbGV0ZWQuIGBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZGVmaW5pdGlvbi52YWx1ZXMuc3BsaWNlKHZhbHVlSW5kZXgsIDEpO1xuXG4gICAgLy8gTm93IGl0ZXJhdGUgdGhvdWdoIGFsbCB0aGUgdGFza3MgYW5kIGNoYW5nZSBhbGwgdGFza3MgdGhhdCBoYXZlXG4gICAgLy8gXCJrZXk6dmFsdWVcIiB0byBpbnN0ZWFkIGJlIFwia2V5OmRlZmF1bHRcIi4gUmVjb3JkIHdoaWNoIHRhc2tzIGdvdCBjaGFuZ2VkXG4gICAgLy8gc28gdGhhdCB3ZSBjYW4gdXNlIHRoYXQgaW5mb3JtYXRpb24gd2hlbiB3ZSBjcmVhdGUgdGhlIGludmVydCBvcGVyYXRpb24uXG5cbiAgICBjb25zdCBpbmRpY2VzT2ZUYXNrc1dpdGhNYXRjaGluZ1Jlc291cmNlVmFsdWVzOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCByZXNvdXJjZVZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSk7XG4gICAgICBpZiAocmVzb3VyY2VWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gU2luY2UgdGhlIHZhbHVlIGlzIG5vIGxvbmdlciB2YWxpZCB3ZSBjaGFuZ2UgaXQgYmFjayB0byB0aGUgZGVmYXVsdC5cbiAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5rZXksIGRlZmluaXRpb24udmFsdWVzWzBdKTtcblxuICAgICAgLy8gUmVjb3JkIHdoaWNoIHRhc2sgd2UganVzdCBjaGFuZ2VkLlxuICAgICAgaW5kaWNlc09mVGFza3NXaXRoTWF0Y2hpbmdSZXNvdXJjZVZhbHVlcy5wdXNoKGluZGV4KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKGluZGljZXNPZlRhc2tzV2l0aE1hdGNoaW5nUmVzb3VyY2VWYWx1ZXMpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy52YWx1ZSxcbiAgICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2VcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVSZXNvdXJjZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBvbGRLZXk6IHN0cmluZztcbiAgbmV3S2V5OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob2xkS2V5OiBzdHJpbmcsIG5ld0tleTogc3RyaW5nKSB7XG4gICAgdGhpcy5vbGRLZXkgPSBvbGRLZXk7XG4gICAgdGhpcy5uZXdLZXkgPSBuZXdLZXk7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBvbGREZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5vbGRLZXkpO1xuICAgIGlmIChvbGREZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm9sZEtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIC8vIENvbmZpcm0gdGhlIG5ld0tleSBpcyBub3QgYWxyZWFkeSB1c2VkLlxuICAgIGNvbnN0IG5ld0tleURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLm5ld0tleSk7XG4gICAgaWYgKG5ld0tleURlZmluaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmV3S2V5fSBhbHJlYWR5IGV4aXN0cyBhcyBhIHJlc291cmNlIG5hbWUuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5kZWxldGVSZXNvdXJjZURlZmluaXRpb24odGhpcy5vbGRLZXkpO1xuICAgIHBsYW4uc2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMubmV3S2V5LCBvbGREZWZpbml0aW9uKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgY2hhbmdlIG9sZEtleSAtPiBuZXdrZXkgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPVxuICAgICAgICB0YXNrLmdldFJlc291cmNlKHRoaXMub2xkS2V5KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFO1xuICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLm5ld0tleSwgY3VycmVudFZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlUmVzb3VyY2UodGhpcy5vbGRLZXkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZVJlc291cmNlU3ViT3AodGhpcy5uZXdLZXksIHRoaXMub2xkS2V5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIG9sZFZhbHVlOiBzdHJpbmc7XG4gIG5ld1ZhbHVlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcsIG5ld1ZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLm9sZFZhbHVlID0gb2xkVmFsdWU7XG4gICAgdGhpcy5uZXdWYWx1ZSA9IG5ld1ZhbHVlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZm91bmRNYXRjaCA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZm91bmRNYXRjaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBvbGRWYWx1ZSBpcyBpbiB0aGVyZS5cbiAgICBjb25zdCBvbGRWYWx1ZUluZGV4ID0gZm91bmRNYXRjaC52YWx1ZXMuaW5kZXhPZih0aGlzLm9sZFZhbHVlKTtcblxuICAgIGlmIChvbGRWYWx1ZUluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBhIHZhbHVlICR7dGhpcy5vbGRWYWx1ZX1gKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBuZXdWYWx1ZSBpcyBub3QgaW4gdGhlcmUuXG4gICAgY29uc3QgbmV3VmFsdWVJbmRleCA9IGZvdW5kTWF0Y2gudmFsdWVzLmluZGV4T2YodGhpcy5uZXdWYWx1ZSk7XG4gICAgaWYgKG5ld1ZhbHVlSW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGFscmVhZHkgaGFzIGEgdmFsdWUgJHt0aGlzLm5ld1ZhbHVlfWApO1xuICAgIH1cblxuICAgIC8vIFN3YXAgdGhlIHZhbHVlcy5cbiAgICBmb3VuZE1hdGNoLnZhbHVlcy5zcGxpY2Uob2xkVmFsdWVJbmRleCwgMSwgdGhpcy5uZXdWYWx1ZSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGNoYW5nZSBvbGRWYWx1ZSAtPiBuZXdWYWx1ZSBmb3IgdGhlIGdpdmVuIHJlc291cmNlIGtleS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpO1xuICAgICAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gdGhpcy5vbGRWYWx1ZSkge1xuICAgICAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLm5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW5hbWVSZXNvdXJjZU9wdGlvblN1Yk9wKFxuICAgICAgdGhpcy5rZXksXG4gICAgICB0aGlzLm5ld1ZhbHVlLFxuICAgICAgdGhpcy5vbGRWYWx1ZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgb2xkSW5kZXg6IG51bWJlcjtcbiAgbmV3SW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgb2xkVmFsdWU6IG51bWJlciwgbmV3VmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMub2xkSW5kZXggPSBvbGRWYWx1ZTtcbiAgICB0aGlzLm5ld0luZGV4ID0gbmV3VmFsdWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9sZEluZGV4ID4gZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIGF0IGluZGV4ICR7dGhpcy5vbGRJbmRleH1gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy5uZXdJbmRleCA+IGRlZmluaXRpb24udmFsdWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy5rZXl9IGRvZXMgbm90IGhhdmUgYSB2YWx1ZSBhdCBpbmRleCAke3RoaXMubmV3SW5kZXh9YFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHRoZSB2YWx1ZXMuXG4gICAgY29uc3QgdG1wID0gZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5vbGRJbmRleF07XG4gICAgZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5vbGRJbmRleF0gPSBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm5ld0luZGV4XTtcbiAgICBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm5ld0luZGV4XSA9IHRtcDtcblxuICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgd2l0aCBUYXNrcyBiZWNhdXNlIHRoZSBpbmRleCBvZiBhIHZhbHVlIGlzXG4gICAgLy8gaXJyZWxldmFudCBzaW5jZSB3ZSBzdG9yZSB0aGUgdmFsdWUgaXRzZWxmLCBub3QgdGhlIGluZGV4LlxuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wKHRoaXMua2V5LCB0aGlzLm5ld0luZGV4LCB0aGlzLm9sZEluZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgdGFza0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHRhc2tJbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZm91bmRNYXRjaCA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZm91bmRNYXRjaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICBjb25zdCBmb3VuZFZhbHVlTWF0Y2ggPSBmb3VuZE1hdGNoLnZhbHVlcy5maW5kSW5kZXgoKHY6IHN0cmluZykgPT4ge1xuICAgICAgcmV0dXJuIHYgPT09IHRoaXMudmFsdWU7XG4gICAgfSk7XG4gICAgaWYgKGZvdW5kVmFsdWVNYXRjaCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIG9mICR7dGhpcy52YWx1ZX1gKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGFza0luZGV4IDwgMCB8fCB0aGlzLnRhc2tJbmRleCA+PSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGVycm9yKGBUaGVyZSBpcyBubyBUYXNrIGF0IGluZGV4ICR7dGhpcy50YXNrSW5kZXh9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFzayA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdO1xuICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSkhO1xuICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5rZXksIHRoaXMudmFsdWUpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZFZhbHVlKSB9KTtcbiAgfVxuXG4gIGludmVyc2Uob2xkVmFsdWU6IHN0cmluZyk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFJlc291cmNlVmFsdWVTdWJPcCh0aGlzLmtleSwgb2xkVmFsdWUsIHRoaXMudGFza0luZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkUmVzb3VyY2VPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRSZXNvdXJjZVN1Yk9wKG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVSZXNvdXJjZU9wKG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IERlbGV0ZVJlc291cmNlU3VwT3AobmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZFJlc291cmNlT3B0aW9uT3Aoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgdmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVSZXNvdXJjZU9wdGlvbk9wKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgRGVsZXRlUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIHZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lUmVzb3VyY2VPcHRpb25PcChcbiAga2V5OiBzdHJpbmcsXG4gIG9sZFZhbHVlOiBzdHJpbmcsXG4gIG5ld1ZhbHVlOiBzdHJpbmdcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJlbmFtZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5hbWVSZXNvdXJjZU9wKG9sZFZhbHVlOiBzdHJpbmcsIG5ld1ZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVSZXNvdXJjZVN1Yk9wKG9sZFZhbHVlLCBuZXdWYWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1vdmVSZXNvdXJjZU9wdGlvbk9wKFxuICBrZXk6IHN0cmluZyxcbiAgb2xkSW5kZXg6IG51bWJlcixcbiAgbmV3SW5kZXg6IG51bWJlclxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgTW92ZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCBvbGRJbmRleCwgbmV3SW5kZXgpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRSZXNvdXJjZVZhbHVlT3AoXG4gIGtleTogc3RyaW5nLFxuICB2YWx1ZTogc3RyaW5nLFxuICB0YXNrSW5kZXg6IG51bWJlclxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wKGtleSwgdmFsdWUsIHRhc2tJbmRleCldKTtcbn1cbiIsICIvKiogQSBjb29yZGluYXRlIHBvaW50IG9uIHRoZSByZW5kZXJpbmcgc3VyZmFjZS4gKi9cbmV4cG9ydCBjbGFzcyBQb2ludCB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICB9XG5cbiAgYWRkKHg6IG51bWJlciwgeTogbnVtYmVyKTogUG9pbnQge1xuICAgIHRoaXMueCArPSB4O1xuICAgIHRoaXMueSArPSB5O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc3VtKHJoczogUG9pbnQpOiBQb2ludCB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLnggKyByaHMueCwgdGhpcy55ICsgcmhzLnkpO1xuICB9XG5cbiAgZXF1YWwocmhzOiBQb2ludCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnggPT09IHJocy54ICYmIHRoaXMueSA9PT0gcmhzLnk7XG4gIH1cblxuICBzZXQocmhzOiBQb2ludCk6IFBvaW50IHtcbiAgICB0aGlzLnggPSByaHMueDtcbiAgICB0aGlzLnkgPSByaHMueTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGR1cCgpOiBQb2ludCB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLngsIHRoaXMueSk7XG4gIH1cbn1cbiIsICIvKipcbiAqIEZ1bmN0aW9uYWxpdHkgZm9yIGNyZWF0aW5nIGRyYWdnYWJsZSBkaXZpZGVycyBiZXR3ZWVuIGVsZW1lbnRzIG9uIGEgcGFnZS5cbiAqL1xuaW1wb3J0IHsgY2xhbXAgfSBmcm9tIFwiLi4vLi4vbWV0cmljcy9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi4vc2NhbGUvcG9pbnQudHNcIjtcblxuLy8gVmFsdWVzIGFyZSByZXR1cm5lZCBhcyBwZXJjZW50YWdlcyBhcm91bmQgdGhlIGN1cnJlbnQgbW91c2UgbG9jYXRpb24uIFRoYXRcbi8vIGlzLCBpZiB3ZSBhcmUgaW4gXCJjb2x1bW5cIiBtb2RlIHRoZW4gYGJlZm9yZWAgd291bGQgZXF1YWwgdGhlIG1vdXNlIHBvc2l0aW9uXG4vLyBhcyBhICUgb2YgdGhlIHdpZHRoIG9mIHRoZSBwYXJlbnQgZWxlbWVudCBmcm9tIHRoZSBsZWZ0IGhhbmQgc2lkZSBvZiB0aGVcbi8vIHBhcmVudCBlbGVtZW50LiBUaGUgYGFmdGVyYCB2YWx1ZSBpcyBqdXN0IDEwMC1iZWZvcmUuXG5leHBvcnQgaW50ZXJmYWNlIERpdmlkZXJNb3ZlUmVzdWx0IHtcbiAgYmVmb3JlOiBudW1iZXI7XG4gIGFmdGVyOiBudW1iZXI7XG59XG5cbmV4cG9ydCB0eXBlIERpdmlkZXJUeXBlID0gXCJjb2x1bW5cIiB8IFwicm93XCI7XG5cbmV4cG9ydCBjb25zdCBESVZJREVSX01PVkVfRVZFTlQgPSBcImRpdmlkZXJfbW92ZVwiO1xuXG5leHBvcnQgY29uc3QgUkVTSVpJTkdfQ0xBU1MgPSBcInJlc2l6aW5nXCI7XG5cbmludGVyZmFjZSBSZWN0IHtcbiAgdG9wOiBudW1iZXI7XG4gIGxlZnQ6IG51bWJlcjtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG59XG5cbi8qKiBSZXR1cm5zIGEgYm91bmRpbmcgcmVjdGFuZ2xlIGZvciBhbiBlbGVtZW50IGluIFBhZ2UgY29vcmRpbmF0ZXMsIGFzIG9wcG9zZWRcbiAqIHRvIFZpZXdQb3J0IGNvb3JkaW5hdGVzLCB3aGljaCBpcyB3aGF0IGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIHJldHVybnMuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQYWdlUmVjdCA9IChlbGU6IEhUTUxFbGVtZW50KTogUmVjdCA9PiB7XG4gIGNvbnN0IHZpZXdwb3J0UmVjdCA9IGVsZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgcmV0dXJuIHtcbiAgICB0b3A6IHZpZXdwb3J0UmVjdC50b3AgKyB3aW5kb3cuc2Nyb2xsWSxcbiAgICBsZWZ0OiB2aWV3cG9ydFJlY3QubGVmdCArIHdpbmRvdy5zY3JvbGxYLFxuICAgIHdpZHRoOiB2aWV3cG9ydFJlY3Qud2lkdGgsXG4gICAgaGVpZ2h0OiB2aWV3cG9ydFJlY3QuaGVpZ2h0LFxuICB9O1xufTtcblxuLyoqIERpdmlkZXJNb3ZlIGlzIGNvcmUgZnVuY3Rpb25hbGl0eSBmb3IgY3JlYXRpbmcgZHJhZ2dhYmxlIGRpdmlkZXJzIGJldHdlZW5cbiAqIGVsZW1lbnRzIG9uIGEgcGFnZS5cbiAqXG4gKiBDb25zdHJ1Y3QgYSBEaXZpZGVyTW9kZSB3aXRoIGEgcGFyZW50IGVsZW1lbnQgYW5kIGEgZGl2aWRlciBlbGVtZW50LCB3aGVyZVxuICogdGhlIGRpdmlkZXIgZWxlbWVudCBpcyB0aGUgZWxlbWVudCBiZXR3ZWVuIG90aGVyIHBhZ2UgZWxlbWVudHMgdGhhdCBpc1xuICogZXhwZWN0ZWQgdG8gYmUgZHJhZ2dlZC4gRm9yIGV4YW1wbGUsIGluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSAjY29udGFpbmVyXG4gKiB3b3VsZCBiZSB0aGUgYHBhcmVudGAsIGFuZCAjZGl2aWRlciB3b3VsZCBiZSB0aGUgYGRpdmlkZXJgIGVsZW1lbnQuXG4gKlxuICogIDxkaXYgaWQ9Y29udGFpbmVyPlxuICogICAgPGRpdiBpZD1sZWZ0PjwvZGl2PiAgPGRpdiBpZD1kaXZpZGVyPjwvZGl2PiA8ZGl2IGlkPXJpZ2h0PjwvZGl2P1xuICogIDwvZGl2PlxuICpcbiAqIERpdmlkZXJNb2RlIHdhaXRzIGZvciBhIG1vdXNlZG93biBldmVudCBvbiB0aGUgYGRpdmlkZXJgIGVsZW1lbnQgYW5kIHRoZW5cbiAqIHdhdGNoZXMgbW91c2UgZXZlbnRzIGZvciB0aGUgZ2l2ZW4gcGFyZW50IEhUTUxFbGVtZW50IGFuZCBlbWl0cyBldmVudHMgYXJvdW5kXG4gKiBkcmFnZ2luZy5cbiAqXG4gKiBUaGUgZW1pdHRlZCBldmVudCBpcyBcImRpdmlkZXJfbW92ZVwiIGFuZCBpcyBhIEN1c3RvbUV2ZW50PERpdmlkZXJNb3ZlUmVzdWx0Pi5cbiAqXG4gKiBJdCBpcyB1cCB0byB0aGUgdXNlciBvZiBEaXZpZGVyTW92ZSB0byBsaXN0ZW4gZm9yIHRoZSBcImRpdmlkZXJfbW92ZVwiIGV2ZW50c1xuICogYW5kIHVwZGF0ZSB0aGUgQ1NTIG9mIHRoZSBwYWdlIGFwcHJvcHJpYXRlbHkgdG8gcmVmbGVjdCB0aGUgcG9zaXRpb24gb2YgdGhlXG4gKiBkaXZpZGVyLlxuICpcbiAqIE9uY2UgdGhlIG1vdXNlIGlzIGRvd24gYW4gZXZlbnQgd2lsbCBiZSBlbWl0dGVkIHBlcmlvZGljYWxseSBhcyB0aGUgbW91c2VcbiAqIG1vdmVzLlxuICpcbiAqIE9uY2UgdGhlIG1vdXNlIGlzIHJlbGVhc2VkLCBvciBpZiB0aGUgbW91c2UgZXhpdHMgdGhlIHBhcmVudCBIVE1MRWxlbWVudCwgb25lXG4gKiBsYXN0IGV2ZW50IGlzIGVtaXR0ZWQuXG4gKlxuICogV2hpbGUgZHJhZ2dpbmcgdGhlIGRpdmlkZXIsIHRoZSBcInJlc2l6aW5nXCIgY2xhc3Mgd2lsbCBiZSBhZGRlZCB0byB0aGUgcGFyZW50XG4gKiBlbGVtZW50LiBUaGlzIGNhbiBiZSB1c2VkIHRvIHNldCBhIHN0eWxlLCBlLmcuICd1c2VyLXNlbGVjdDogbm9uZScuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXZpZGVyTW92ZSB7XG4gIC8qKiBUaGUgcG9pbnQgd2hlcmUgZHJhZ2dpbmcgc3RhcnRlZCwgaW4gUGFnZSBjb29yZGluYXRlcy4gKi9cbiAgYmVnaW46IFBvaW50IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBkaW1lbnNpb25zIG9mIHRoZSBwYXJlbnQgZWxlbWVudCBpbiBQYWdlIGNvb3JkaW5hdGVzIGFzIG9mIG1vdXNlZG93blxuICAgKiBvbiB0aGUgZGl2aWRlci4uICovXG4gIHBhcmVudFJlY3Q6IFJlY3QgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGN1cnJlbnQgbW91c2UgcG9zaXRpb24gaW4gUGFnZSBjb29yZGluYXRlcy4gKi9cbiAgY3VycmVudE1vdmVMb2NhdGlvbjogUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG5cbiAgLyoqIFRoZSBsYXN0IG1vdXNlIHBvc2l0aW9uIGluIFBhZ2UgY29vcmRpbmF0ZXMgcmVwb3J0ZWQgdmlhIEN1c3RvbUV2ZW50LiAqL1xuICBsYXN0TW92ZVNlbnQ6IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuXG4gIC8qKiBUaGUgcGFyZW50IGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgZGl2aWRlci4gKi9cbiAgcGFyZW50OiBIVE1MRWxlbWVudDtcblxuICAvKiogVGhlIGRpdmlkZXIgZWxlbWVudCB0byBiZSBkcmFnZ2VkIGFjcm9zcyB0aGUgcGFyZW50IGVsZW1lbnQuICovXG4gIGRpdmlkZXI6IEhUTUxFbGVtZW50O1xuXG4gIC8qKiBUaGUgaGFuZGxlIG9mIHRoZSB3aW5kb3cuc2V0SW50ZXJ2YWwoKS4gKi9cbiAgaW50ZXJudmFsSGFuZGxlOiBudW1iZXIgPSAwO1xuXG4gIC8qKiBUaGUgdHlwZSBvZiBkaXZpZGVyLCBlaXRoZXIgdmVydGljYWwgKFwiY29sdW1uXCIpLCBvciBob3Jpem9udGFsIChcInJvd1wiKS4gKi9cbiAgZGl2aWRlclR5cGU6IERpdmlkZXJUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHBhcmVudDogSFRNTEVsZW1lbnQsXG4gICAgZGl2aWRlcjogSFRNTEVsZW1lbnQsXG4gICAgZGl2aWRlclR5cGU6IERpdmlkZXJUeXBlID0gXCJjb2x1bW5cIlxuICApIHtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLmRpdmlkZXIgPSBkaXZpZGVyO1xuICAgIHRoaXMuZGl2aWRlclR5cGUgPSBkaXZpZGVyVHlwZTtcbiAgICB0aGlzLmRpdmlkZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGRldGFjaCgpIHtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZGl2aWRlci5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICB9XG5cbiAgb25UaW1lb3V0KCkge1xuICAgIGlmICghdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLmVxdWFsKHRoaXMubGFzdE1vdmVTZW50KSkge1xuICAgICAgbGV0IGRpZmZQZXJjZW50OiBudW1iZXIgPSAwO1xuICAgICAgaWYgKHRoaXMuZGl2aWRlclR5cGUgPT09IFwiY29sdW1uXCIpIHtcbiAgICAgICAgZGlmZlBlcmNlbnQgPVxuICAgICAgICAgICgxMDAgKiAodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnggLSB0aGlzLnBhcmVudFJlY3QhLmxlZnQpKSAvXG4gICAgICAgICAgdGhpcy5wYXJlbnRSZWN0IS53aWR0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpZmZQZXJjZW50ID1cbiAgICAgICAgICAoMTAwICogKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi55IC0gdGhpcy5wYXJlbnRSZWN0IS50b3ApKSAvXG4gICAgICAgICAgdGhpcy5wYXJlbnRSZWN0IS5oZWlnaHQ7XG4gICAgICB9XG4gICAgICAvLyBUT0RPIC0gU2hvdWxkIGNsYW1wIGJlIHNldHRhYmxlIGluIHRoZSBjb25zdHJ1Y3Rvcj9cbiAgICAgIGRpZmZQZXJjZW50ID0gY2xhbXAoZGlmZlBlcmNlbnQsIDUsIDk1KTtcblxuICAgICAgdGhpcy5wYXJlbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50PERpdmlkZXJNb3ZlUmVzdWx0PihESVZJREVSX01PVkVfRVZFTlQsIHtcbiAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgIGJlZm9yZTogZGlmZlBlcmNlbnQsXG4gICAgICAgICAgICBhZnRlcjogMTAwIC0gZGlmZlBlcmNlbnQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICB0aGlzLmxhc3RNb3ZlU2VudC5zZXQodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBtb3VzZW1vdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54ID0gZS5wYWdlWDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSA9IGUucGFnZVk7XG4gIH1cblxuICBtb3VzZWRvd24oZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuaW50ZXJudmFsSGFuZGxlID0gd2luZG93LnNldEludGVydmFsKHRoaXMub25UaW1lb3V0LmJpbmQodGhpcyksIDE2KTtcbiAgICB0aGlzLnBhcmVudFJlY3QgPSBnZXRQYWdlUmVjdCh0aGlzLnBhcmVudCk7XG5cbiAgICB0aGlzLnBhcmVudC5jbGFzc0xpc3QuYWRkKFJFU0laSU5HX0NMQVNTKTtcblxuICAgIHRoaXMucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmVnaW4gPSBuZXcgUG9pbnQoZS5wYWdlWCwgZS5wYWdlWSk7XG4gIH1cblxuICBtb3VzZXVwKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZpbmlzaGVkKG5ldyBQb2ludChlLnBhZ2VYLCBlLnBhZ2VZKSk7XG4gIH1cblxuICBtb3VzZWxlYXZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZpbmlzaGVkKG5ldyBQb2ludChlLnBhZ2VYLCBlLnBhZ2VZKSk7XG4gIH1cblxuICBmaW5pc2hlZChlbmQ6IFBvaW50KSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuXG4gICAgdGhpcy5wYXJlbnQuY2xhc3NMaXN0LnJlbW92ZShSRVNJWklOR19DTEFTUyk7XG5cbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBlbmQ7XG4gICAgdGhpcy5vblRpbWVvdXQoKTtcbiAgICB0aGlzLmJlZ2luID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgdGhpcy5sYXN0TW92ZVNlbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuLi9zY2FsZS9wb2ludC50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYWdSYW5nZSB7XG4gIGJlZ2luOiBQb2ludDtcbiAgZW5kOiBQb2ludDtcbn1cblxuZXhwb3J0IGNvbnN0IERSQUdfUkFOR0VfRVZFTlQgPSBcImRyYWdyYW5nZVwiO1xuXG4vKiogTW91c2VNb3ZlIHdhdGNoZXMgbW91c2UgZXZlbnRzIGZvciBhIGdpdmVuIEhUTUxFbGVtZW50IGFuZCBlbWl0c1xuICogZXZlbnRzIGFyb3VuZCBkcmFnZ2luZy5cbiAqXG4gKiBUaGUgZW1pdHRlZCBldmVudCBpcyBcImRyYWdyYW5nZVwiIGFuZCBpcyBhIEN1c3RvbUV2ZW50PERyYWdSYW5nZT4uXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcHJlc3NlZCBkb3duIGluIHRoZSBIVE1MRWxlbWVudCBhbiBldmVudCB3aWxsIGJlXG4gKiBlbWl0dGVkIHBlcmlvZGljYWxseSBhcyB0aGUgbW91c2UgbW92ZXMuXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcmVsZWFzZWQsIG9yIGV4aXRzIHRoZSBIVE1MRWxlbWVudCBvbmUgbGFzdCBldmVudFxuICogaXMgZW1pdHRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vdXNlRHJhZyB7XG4gIGJlZ2luOiBQb2ludCB8IG51bGwgPSBudWxsO1xuICBjdXJyZW50TW92ZUxvY2F0aW9uOiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgbGFzdE1vdmVTZW50OiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgZWxlOiBIVE1MRWxlbWVudDtcbiAgaW50ZXJudmFsSGFuZGxlOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGVsZTogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZSA9IGVsZTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXRhY2goKSB7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICB9XG5cbiAgb25UaW1lb3V0KCkge1xuICAgIGlmICghdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLmVxdWFsKHRoaXMubGFzdE1vdmVTZW50KSkge1xuICAgICAgdGhpcy5lbGUuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50PERyYWdSYW5nZT4oRFJBR19SQU5HRV9FVkVOVCwge1xuICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgYmVnaW46IHRoaXMuYmVnaW4hLmR1cCgpLFxuICAgICAgICAgICAgZW5kOiB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24uZHVwKCksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICB0aGlzLmxhc3RNb3ZlU2VudC5zZXQodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBtb3VzZW1vdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54ID0gZS5vZmZzZXRYO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi55ID0gZS5vZmZzZXRZO1xuICB9XG5cbiAgbW91c2Vkb3duKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmludGVybnZhbEhhbmRsZSA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLm9uVGltZW91dC5iaW5kKHRoaXMpLCAxNik7XG4gICAgdGhpcy5iZWdpbiA9IG5ldyBQb2ludChlLm9mZnNldFgsIGUub2Zmc2V0WSk7XG4gIH1cblxuICBtb3VzZXVwKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmZpbmlzaGVkKG5ldyBQb2ludChlLm9mZnNldFgsIGUub2Zmc2V0WSkpO1xuICB9XG5cbiAgbW91c2VsZWF2ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maW5pc2hlZChuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpKTtcbiAgfVxuXG4gIGZpbmlzaGVkKGVuZDogUG9pbnQpIHtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVybnZhbEhhbmRsZSk7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gZW5kO1xuICAgIHRoaXMub25UaW1lb3V0KCk7XG4gICAgdGhpcy5iZWdpbiA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHRoaXMubGFzdE1vdmVTZW50ID0gbmV3IFBvaW50KDAsIDApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi4vc2NhbGUvcG9pbnQudHNcIjtcblxuLyoqIE1vdXNlTW92ZSB3YXRjaGVzIG1vdXNlIGV2ZW50cyBmb3IgYSBnaXZlbiBIVE1MRWxlbWVudCBhbmQgcmVjb3JkcyB0aGUgbW9zdFxuICogIHJlY2VudCBsb2NhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vdXNlTW92ZSB7XG4gIGN1cnJlbnRNb3ZlTG9jYXRpb246IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuICBsYXN0UmVhZExvY2F0aW9uOiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgZWxlOiBIVE1MRWxlbWVudDtcblxuICBjb25zdHJ1Y3RvcihlbGU6IEhUTUxFbGVtZW50KSB7XG4gICAgdGhpcy5lbGUgPSBlbGU7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXRhY2goKSB7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIG1vdXNlbW92ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnggPSBlLm9mZnNldFg7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnkgPSBlLm9mZnNldFk7XG4gIH1cblxuICAvKiogUmV0dXJucyBhIFBvaW50IGlmIHRoZSBtb3VzZSBoYWQgbW92ZWQgc2luY2UgdGhlIGxhc3QgcmVhZCwgb3RoZXJ3aXNlXG4gICAqIHJldHVybnMgbnVsbC5cbiAgICovXG4gIHJlYWRMb2NhdGlvbigpOiBQb2ludCB8IG51bGwge1xuICAgIGlmICh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24uZXF1YWwodGhpcy5sYXN0UmVhZExvY2F0aW9uKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRoaXMubGFzdFJlYWRMb2NhdGlvbi5zZXQodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uKTtcbiAgICByZXR1cm4gdGhpcy5sYXN0UmVhZExvY2F0aW9uLmR1cCgpO1xuICB9XG59XG4iLCAiZXhwb3J0IGNvbnN0IE1JTl9ESVNQTEFZX1JBTkdFID0gNztcblxuLyoqIFJlcHJlc2VudHMgYSByYW5nZSBvZiBkYXlzIG92ZXIgd2hpY2ggdG8gZGlzcGxheSBhIHpvb21lZCBpbiB2aWV3LCB1c2luZ1xuICogdGhlIGhhbGYtb3BlbiBpbnRlcnZhbCBbYmVnaW4sIGVuZCkuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXNwbGF5UmFuZ2Uge1xuICBwcml2YXRlIF9iZWdpbjogbnVtYmVyO1xuICBwcml2YXRlIF9lbmQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihiZWdpbjogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xuICAgIHRoaXMuX2JlZ2luID0gYmVnaW47XG4gICAgdGhpcy5fZW5kID0gZW5kO1xuICAgIGlmICh0aGlzLl9iZWdpbiA+IHRoaXMuX2VuZCkge1xuICAgICAgW3RoaXMuX2VuZCwgdGhpcy5fYmVnaW5dID0gW3RoaXMuX2JlZ2luLCB0aGlzLl9lbmRdO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZW5kIC0gdGhpcy5fYmVnaW4gPCBNSU5fRElTUExBWV9SQU5HRSkge1xuICAgICAgdGhpcy5fZW5kID0gdGhpcy5fYmVnaW4gKyBNSU5fRElTUExBWV9SQU5HRTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgaW4oeDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHggPj0gdGhpcy5fYmVnaW4gJiYgeCA8PSB0aGlzLl9lbmQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJlZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2JlZ2luO1xuICB9XG5cbiAgcHVibGljIGdldCBlbmQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZW5kO1xuICB9XG5cbiAgcHVibGljIGdldCByYW5nZUluRGF5cygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9lbmQgLSB0aGlzLl9iZWdpbjtcbiAgfVxufVxuIiwgImltcG9ydCB7IERpcmVjdGVkRWRnZSwgRWRnZXMgfSBmcm9tIFwiLi4vLi4vZGFnL2RhZ1wiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IFNwYW4gfSBmcm9tIFwiLi4vLi4vc2xhY2svc2xhY2tcIjtcbmltcG9ydCB7IENoYXJ0LCBUYXNrLCBUYXNrcywgdmFsaWRhdGVDaGFydCB9IGZyb20gXCIuLi9jaGFydFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoYXJ0TGlrZSB7XG4gIFZlcnRpY2VzOiBUYXNrcztcbiAgRWRnZXM6IEVkZ2VzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZpbHRlclJlc3VsdCB7XG4gIGNoYXJ0TGlrZTogQ2hhcnRMaWtlO1xuICBkaXNwbGF5T3JkZXI6IG51bWJlcltdO1xuICBlbXBoYXNpemVkVGFza3M6IG51bWJlcltdO1xuICBzcGFuczogU3BhbltdO1xuICBsYWJlbHM6IHN0cmluZ1tdO1xuICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPjtcbiAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj47XG4gIHNlbGVjdGVkVGFza0luZGV4OiBudW1iZXI7XG59XG5cbi8qKiBVc2VkIGZvciBmaWx0ZXJpbmcgdGFza3MsIHJldHVybnMgVHJ1ZSBpZiB0aGUgdGFzayBpcyB0byBiZSBpbmNsdWRlZCBpbiB0aGVcbiAqIGZpbHRlcmVkIHJlc3VsdHMuICovXG5leHBvcnQgdHlwZSBGaWx0ZXJGdW5jID0gKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IGJvb2xlYW47XG5cbi8qKiBGaWx0ZXJzIHRoZSBjb250ZW50cyBvZiB0aGUgQ2hhcnQgYmFzZWQgb24gdGhlIGZpbHRlckZ1bmMuXG4gKlxuICogc2VsZWN0ZWRUYXNrSW5kZXggd2lsbCBiZSByZXR1cm5lZCBhcyAtMSBpZiB0aGUgc2VsZWN0ZWQgdGFzayBnZXRzIGZpbHRlcmVkXG4gKiBvdXQuXG4gKi9cbmV4cG9ydCBjb25zdCBmaWx0ZXIgPSAoXG4gIGNoYXJ0OiBDaGFydCxcbiAgZmlsdGVyRnVuYzogRmlsdGVyRnVuYyB8IG51bGwsXG4gIGVtcGhhc2l6ZWRUYXNrczogbnVtYmVyW10sXG4gIHNwYW5zOiBTcGFuW10sXG4gIGxhYmVsczogc3RyaW5nW10sXG4gIHNlbGVjdGVkVGFza0luZGV4OiBudW1iZXJcbik6IFJlc3VsdDxGaWx0ZXJSZXN1bHQ+ID0+IHtcbiAgY29uc3QgdnJldCA9IHZhbGlkYXRlQ2hhcnQoY2hhcnQpO1xuICBpZiAoIXZyZXQub2spIHtcbiAgICByZXR1cm4gdnJldDtcbiAgfVxuICBjb25zdCB0b3BvbG9naWNhbE9yZGVyID0gdnJldC52YWx1ZTtcbiAgaWYgKGZpbHRlckZ1bmMgPT09IG51bGwpIHtcbiAgICBjb25zdCBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY2hhcnQuVmVydGljZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleC5zZXQoaW5kZXgsIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIGNoYXJ0TGlrZTogY2hhcnQsXG4gICAgICBkaXNwbGF5T3JkZXI6IHZyZXQudmFsdWUsXG4gICAgICBlbXBoYXNpemVkVGFza3M6IGVtcGhhc2l6ZWRUYXNrcyxcbiAgICAgIHNwYW5zOiBzcGFucyxcbiAgICAgIGxhYmVsczogbGFiZWxzLFxuICAgICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LFxuICAgICAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXg6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXgsXG4gICAgfSk7XG4gIH1cbiAgY29uc3QgdGFza3M6IFRhc2tzID0gW107XG4gIGNvbnN0IGVkZ2VzOiBFZGdlcyA9IFtdO1xuICBjb25zdCBkaXNwbGF5T3JkZXI6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGZpbHRlcmVkU3BhbnM6IFNwYW5bXSA9IFtdO1xuICBjb25zdCBmaWx0ZXJlZExhYmVsczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gIGNvbnN0IGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcblxuICAvLyBGaXJzdCBmaWx0ZXIgdGhlIHRhc2tzLlxuICBjaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBvcmlnaW5hbEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBpZiAoZmlsdGVyRnVuYyh0YXNrLCBvcmlnaW5hbEluZGV4KSkge1xuICAgICAgdGFza3MucHVzaCh0YXNrKTtcbiAgICAgIGZpbHRlcmVkU3BhbnMucHVzaChzcGFuc1tvcmlnaW5hbEluZGV4XSk7XG4gICAgICBmaWx0ZXJlZExhYmVscy5wdXNoKGxhYmVsc1tvcmlnaW5hbEluZGV4XSk7XG4gICAgICBjb25zdCBuZXdJbmRleCA9IHRhc2tzLmxlbmd0aCAtIDE7XG4gICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguc2V0KG9yaWdpbmFsSW5kZXgsIG5ld0luZGV4KTtcbiAgICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LnNldChuZXdJbmRleCwgb3JpZ2luYWxJbmRleCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBOb3cgZmlsdGVyIHRoZSBlZGdlcyB3aGlsZSBhbHNvIHJld3JpdGluZyB0aGVtLlxuICBjaGFydC5FZGdlcy5mb3JFYWNoKChkaXJlY3RlZEVkZ2U6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGlmIChcbiAgICAgICFmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguaGFzKGRpcmVjdGVkRWRnZS5pKSB8fFxuICAgICAgIWZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5oYXMoZGlyZWN0ZWRFZGdlLmopXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVkZ2VzLnB1c2goXG4gICAgICBuZXcgRGlyZWN0ZWRFZGdlKFxuICAgICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KGRpcmVjdGVkRWRnZS5pKSxcbiAgICAgICAgZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChkaXJlY3RlZEVkZ2UuailcbiAgICAgIClcbiAgICApO1xuICB9KTtcblxuICAvLyBOb3cgZmlsdGVyIGFuZCByZWluZGV4IHRoZSB0b3BvbG9naWNhbC9kaXNwbGF5IG9yZGVyLlxuICB0b3BvbG9naWNhbE9yZGVyLmZvckVhY2goKG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrOiBUYXNrID0gY2hhcnQuVmVydGljZXNbb3JpZ2luYWxUYXNrSW5kZXhdO1xuICAgIGlmICghZmlsdGVyRnVuYyh0YXNrLCBvcmlnaW5hbFRhc2tJbmRleCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZGlzcGxheU9yZGVyLnB1c2goZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChvcmlnaW5hbFRhc2tJbmRleCkhKTtcbiAgfSk7XG5cbiAgLy8gUmUtaW5kZXggaGlnaGxpZ2h0ZWQgdGFza3MuXG4gIGNvbnN0IHVwZGF0ZWRFbXBoYXNpemVkVGFza3MgPSBlbXBoYXNpemVkVGFza3MubWFwKFxuICAgIChvcmlnaW5hbFRhc2tJbmRleDogbnVtYmVyKTogbnVtYmVyID0+XG4gICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KG9yaWdpbmFsVGFza0luZGV4KSFcbiAgKTtcblxuICByZXR1cm4gb2soe1xuICAgIGNoYXJ0TGlrZToge1xuICAgICAgRWRnZXM6IGVkZ2VzLFxuICAgICAgVmVydGljZXM6IHRhc2tzLFxuICAgIH0sXG4gICAgZGlzcGxheU9yZGVyOiBkaXNwbGF5T3JkZXIsXG4gICAgZW1waGFzaXplZFRhc2tzOiB1cGRhdGVkRW1waGFzaXplZFRhc2tzLFxuICAgIHNwYW5zOiBmaWx0ZXJlZFNwYW5zLFxuICAgIGxhYmVsczogZmlsdGVyZWRMYWJlbHMsXG4gICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LFxuICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4OiBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXgsXG4gICAgc2VsZWN0ZWRUYXNrSW5kZXg6IGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5nZXQoc2VsZWN0ZWRUYXNrSW5kZXgpIHx8IC0xLFxuICB9KTtcbn07XG4iLCAiLyoqIEBtb2R1bGUga2RcbiAqIEEgay1kIHRyZWUgaW1wbGVtZW50YXRpb24sIHdoaWNoIGlzIHVzZWQgdG8gZmluZCB0aGUgY2xvc2VzdCBwb2ludCBpblxuICogc29tZXRoaW5nIGxpa2UgYSAyRCBzY2F0dGVyIHBsb3QuIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9LLWRfdHJlZVxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBGb3JrZWQgZnJvbSBodHRwczovL3NraWEuZ29vZ2xlc291cmNlLmNvbS9idWlsZGJvdC8rL3JlZnMvaGVhZHMvbWFpbi9wZXJmL21vZHVsZXMvcGxvdC1zaW1wbGUtc2sva2QudHMuXG4gKlxuICogRm9ya2VkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL1BhbmRpbm9zYXVydXMva2QtdHJlZS1qYXZhc2NyaXB0IGFuZFxuICogdGhlbiBtYXNzaXZlbHkgdHJpbW1lZCBkb3duIHRvIGp1c3QgZmluZCB0aGUgc2luZ2xlIGNsb3Nlc3QgcG9pbnQsIGFuZCBhbHNvXG4gKiBwb3J0ZWQgdG8gRVM2IHN5bnRheCwgdGhlbiBwb3J0ZWQgdG8gVHlwZVNjcmlwdC5cbiAqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUGFuZGlub3NhdXJ1cy9rZC10cmVlLWphdmFzY3JpcHQgaXMgYSBmb3JrIG9mXG4gKiBodHRwczovL2dpdGh1Yi5jb20vdWJpbGFicy9rZC10cmVlLWphdmFzY3JpcHRcbiAqXG4gKiBAYXV0aG9yIE1pcmNlYSBQcmljb3AgPHByaWNvcEB1YmlsYWJzLm5ldD4sIDIwMTJcbiAqIEBhdXRob3IgTWFydGluIEtsZXBwZSA8a2xlcHBlQHViaWxhYnMubmV0PiwgMjAxMlxuICogQGF1dGhvciBVYmlsYWJzIGh0dHA6Ly91YmlsYWJzLm5ldCwgMjAxMlxuICogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgPGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwPlxuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgS0RQb2ludCB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xufVxuXG50eXBlIERpbWVuc2lvbnMgPSBrZXlvZiBLRFBvaW50O1xuXG5jb25zdCBkZWZhdWx0TWV0cmljID0gKGE6IEtEUG9pbnQsIGI6IEtEUG9pbnQpOiBudW1iZXIgPT5cbiAgKGEueCAtIGIueCkgKiAoYS54IC0gYi54KSArIChhLnkgLSBiLnkpICogKGEueSAtIGIueSk7XG5cbmNvbnN0IGRlZmF1bHREaW1lbnNpb25zOiBEaW1lbnNpb25zW10gPSBbXCJ4XCIsIFwieVwiXTtcblxuLyoqIEBjbGFzcyBBIHNpbmdsZSBub2RlIGluIHRoZSBrLWQgVHJlZS4gKi9cbmNsYXNzIE5vZGU8SXRlbSBleHRlbmRzIEtEUG9pbnQ+IHtcbiAgb2JqOiBJdGVtO1xuXG4gIGxlZnQ6IE5vZGU8SXRlbT4gfCBudWxsID0gbnVsbDtcblxuICByaWdodDogTm9kZTxJdGVtPiB8IG51bGwgPSBudWxsO1xuXG4gIHBhcmVudDogTm9kZTxJdGVtPiB8IG51bGw7XG5cbiAgZGltZW5zaW9uOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Iob2JqOiBJdGVtLCBkaW1lbnNpb246IG51bWJlciwgcGFyZW50OiBOb2RlPEl0ZW0+IHwgbnVsbCkge1xuICAgIHRoaXMub2JqID0gb2JqO1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMuZGltZW5zaW9uID0gZGltZW5zaW9uO1xuICB9XG59XG5cbi8qKlxuICogQGNsYXNzIFRoZSBrLWQgdHJlZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEtEVHJlZTxQb2ludCBleHRlbmRzIEtEUG9pbnQ+IHtcbiAgcHJpdmF0ZSBkaW1lbnNpb25zOiBEaW1lbnNpb25zW107XG5cbiAgcHJpdmF0ZSByb290OiBOb2RlPFBvaW50PiB8IG51bGw7XG5cbiAgcHJpdmF0ZSBtZXRyaWM6IChhOiBLRFBvaW50LCBiOiBLRFBvaW50KSA9PiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gcG9pbnRzIC0gQW4gYXJyYXkgb2YgcG9pbnRzLCBzb21ldGhpbmcgd2l0aCB0aGUgc2hhcGVcbiAgICogICAgIHt4OngsIHk6eX0uXG4gICAqIEBwYXJhbSB7QXJyYXl9IGRpbWVuc2lvbnMgLSBUaGUgZGltZW5zaW9ucyB0byB1c2UgaW4gb3VyIHBvaW50cywgZm9yXG4gICAqICAgICBleGFtcGxlIFsneCcsICd5J10uXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1ldHJpYyAtIEEgZnVuY3Rpb24gdGhhdCBjYWxjdWxhdGVzIHRoZSBkaXN0YW5jZVxuICAgKiAgICAgYmV0d2VlbiB0d28gcG9pbnRzLlxuICAgKi9cbiAgY29uc3RydWN0b3IocG9pbnRzOiBQb2ludFtdKSB7XG4gICAgdGhpcy5kaW1lbnNpb25zID0gZGVmYXVsdERpbWVuc2lvbnM7XG4gICAgdGhpcy5tZXRyaWMgPSBkZWZhdWx0TWV0cmljO1xuICAgIHRoaXMucm9vdCA9IHRoaXMuX2J1aWxkVHJlZShwb2ludHMsIDAsIG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgdGhlIG5lYXJlc3QgTm9kZSB0byB0aGUgZ2l2ZW4gcG9pbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwb2ludCAtIHt4OngsIHk6eX1cbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIGNsb3Nlc3QgcG9pbnQgb2JqZWN0IHBhc3NlZCBpbnRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICogICAgIFdlIHBhc3MgYmFjayB0aGUgb3JpZ2luYWwgb2JqZWN0IHNpbmNlIGl0IG1pZ2h0IGhhdmUgZXh0cmEgaW5mb1xuICAgKiAgICAgYmV5b25kIGp1c3QgdGhlIGNvb3JkaW5hdGVzLCBzdWNoIGFzIHRyYWNlIGlkLlxuICAgKi9cbiAgbmVhcmVzdChwb2ludDogS0RQb2ludCk6IFBvaW50IHtcbiAgICBsZXQgYmVzdE5vZGUgPSB7XG4gICAgICBub2RlOiB0aGlzLnJvb3QsXG4gICAgICBkaXN0YW5jZTogTnVtYmVyLk1BWF9WQUxVRSxcbiAgICB9O1xuXG4gICAgY29uc3Qgc2F2ZU5vZGUgPSAobm9kZTogTm9kZTxQb2ludD4sIGRpc3RhbmNlOiBudW1iZXIpID0+IHtcbiAgICAgIGJlc3ROb2RlID0ge1xuICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICBkaXN0YW5jZTogZGlzdGFuY2UsXG4gICAgICB9O1xuICAgIH07XG5cbiAgICBjb25zdCBuZWFyZXN0U2VhcmNoID0gKG5vZGU6IE5vZGU8UG9pbnQ+KSA9PiB7XG4gICAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbnNbbm9kZS5kaW1lbnNpb25dO1xuICAgICAgY29uc3Qgb3duRGlzdGFuY2UgPSB0aGlzLm1ldHJpYyhwb2ludCwgbm9kZS5vYmopO1xuXG4gICAgICBpZiAobm9kZS5yaWdodCA9PT0gbnVsbCAmJiBub2RlLmxlZnQgPT09IG51bGwpIHtcbiAgICAgICAgaWYgKG93bkRpc3RhbmNlIDwgYmVzdE5vZGUuZGlzdGFuY2UpIHtcbiAgICAgICAgICBzYXZlTm9kZShub2RlLCBvd25EaXN0YW5jZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsZXQgYmVzdENoaWxkID0gbnVsbDtcbiAgICAgIGxldCBvdGhlckNoaWxkID0gbnVsbDtcbiAgICAgIC8vIElmIHdlIGdldCBoZXJlIHdlIGtub3cgdGhhdCBhdCBsZWFzdCBvbmUgb2YgLmxlZnQgYW5kIC5yaWdodCBpc1xuICAgICAgLy8gbm9uLW51bGwsIHNvIGJlc3RDaGlsZCBpcyBndWFyYW50ZWVkIHRvIGJlIG5vbi1udWxsLlxuICAgICAgaWYgKG5vZGUucmlnaHQgPT09IG51bGwpIHtcbiAgICAgICAgYmVzdENoaWxkID0gbm9kZS5sZWZ0O1xuICAgICAgfSBlbHNlIGlmIChub2RlLmxlZnQgPT09IG51bGwpIHtcbiAgICAgICAgYmVzdENoaWxkID0gbm9kZS5yaWdodDtcbiAgICAgIH0gZWxzZSBpZiAocG9pbnRbZGltZW5zaW9uXSA8IG5vZGUub2JqW2RpbWVuc2lvbl0pIHtcbiAgICAgICAgYmVzdENoaWxkID0gbm9kZS5sZWZ0O1xuICAgICAgICBvdGhlckNoaWxkID0gbm9kZS5yaWdodDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJlc3RDaGlsZCA9IG5vZGUucmlnaHQ7XG4gICAgICAgIG90aGVyQ2hpbGQgPSBub2RlLmxlZnQ7XG4gICAgICB9XG5cbiAgICAgIG5lYXJlc3RTZWFyY2goYmVzdENoaWxkISk7XG5cbiAgICAgIGlmIChvd25EaXN0YW5jZSA8IGJlc3ROb2RlLmRpc3RhbmNlKSB7XG4gICAgICAgIHNhdmVOb2RlKG5vZGUsIG93bkRpc3RhbmNlKTtcbiAgICAgIH1cblxuICAgICAgLy8gRmluZCBkaXN0YW5jZSB0byBoeXBlcnBsYW5lLlxuICAgICAgY29uc3QgcG9pbnRPbkh5cGVycGxhbmUgPSB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDAsXG4gICAgICB9O1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRpbWVuc2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGkgPT09IG5vZGUuZGltZW5zaW9uKSB7XG4gICAgICAgICAgcG9pbnRPbkh5cGVycGxhbmVbdGhpcy5kaW1lbnNpb25zW2ldXSA9IHBvaW50W3RoaXMuZGltZW5zaW9uc1tpXV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcG9pbnRPbkh5cGVycGxhbmVbdGhpcy5kaW1lbnNpb25zW2ldXSA9IG5vZGUub2JqW3RoaXMuZGltZW5zaW9uc1tpXV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIGh5cGVycGxhbmUgaXMgY2xvc2VyIHRoYW4gdGhlIGN1cnJlbnQgYmVzdCBwb2ludCB0aGVuIHdlXG4gICAgICAvLyBuZWVkIHRvIHNlYXJjaCBkb3duIHRoZSBvdGhlciBzaWRlIG9mIHRoZSB0cmVlLlxuICAgICAgaWYgKFxuICAgICAgICBvdGhlckNoaWxkICE9PSBudWxsICYmXG4gICAgICAgIHRoaXMubWV0cmljKHBvaW50T25IeXBlcnBsYW5lLCBub2RlLm9iaikgPCBiZXN0Tm9kZS5kaXN0YW5jZVxuICAgICAgKSB7XG4gICAgICAgIG5lYXJlc3RTZWFyY2gob3RoZXJDaGlsZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICh0aGlzLnJvb3QpIHtcbiAgICAgIG5lYXJlc3RTZWFyY2godGhpcy5yb290KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYmVzdE5vZGUubm9kZSEub2JqO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyB0aGUgZnJvbSBwYXJlbnQgTm9kZSBvbiBkb3duLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSBwb2ludHMgLSBBbiBhcnJheSBvZiB7eDp4LCB5Onl9LlxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVwdGggLSBUaGUgY3VycmVudCBkZXB0aCBmcm9tIHRoZSByb290IG5vZGUuXG4gICAqIEBwYXJhbSB7Tm9kZX0gcGFyZW50IC0gVGhlIHBhcmVudCBOb2RlLlxuICAgKi9cbiAgcHJpdmF0ZSBfYnVpbGRUcmVlKFxuICAgIHBvaW50czogUG9pbnRbXSxcbiAgICBkZXB0aDogbnVtYmVyLFxuICAgIHBhcmVudDogTm9kZTxQb2ludD4gfCBudWxsXG4gICk6IE5vZGU8UG9pbnQ+IHwgbnVsbCB7XG4gICAgLy8gRXZlcnkgc3RlcCBkZWVwZXIgaW50byB0aGUgdHJlZSB3ZSBzd2l0Y2ggdG8gdXNpbmcgYW5vdGhlciBheGlzLlxuICAgIGNvbnN0IGRpbSA9IGRlcHRoICUgdGhpcy5kaW1lbnNpb25zLmxlbmd0aDtcblxuICAgIGlmIChwb2ludHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHBvaW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBuZXcgTm9kZShwb2ludHNbMF0sIGRpbSwgcGFyZW50KTtcbiAgICB9XG5cbiAgICBwb2ludHMuc29ydCgoYSwgYikgPT4gYVt0aGlzLmRpbWVuc2lvbnNbZGltXV0gLSBiW3RoaXMuZGltZW5zaW9uc1tkaW1dXSk7XG5cbiAgICBjb25zdCBtZWRpYW4gPSBNYXRoLmZsb29yKHBvaW50cy5sZW5ndGggLyAyKTtcbiAgICBjb25zdCBub2RlID0gbmV3IE5vZGUocG9pbnRzW21lZGlhbl0sIGRpbSwgcGFyZW50KTtcbiAgICBub2RlLmxlZnQgPSB0aGlzLl9idWlsZFRyZWUocG9pbnRzLnNsaWNlKDAsIG1lZGlhbiksIGRlcHRoICsgMSwgbm9kZSk7XG4gICAgbm9kZS5yaWdodCA9IHRoaXMuX2J1aWxkVHJlZShwb2ludHMuc2xpY2UobWVkaWFuICsgMSksIGRlcHRoICsgMSwgbm9kZSk7XG5cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxufVxuIiwgImltcG9ydCB7IGNsYW1wIH0gZnJvbSBcIi4uLy4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFJlbmRlck9wdGlvbnMgfSBmcm9tIFwiLi4vcmVuZGVyZXIudHNcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4vcG9pbnQudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEYXlSb3cge1xuICBkYXk6IG51bWJlcjtcbiAgcm93OiBudW1iZXI7XG59XG5cbi8qKiBGZWF0dXJlcyBvZiB0aGUgY2hhcnQgd2UgY2FuIGFzayBmb3IgY29vcmRpbmF0ZXMgb2YsIHdoZXJlIHRoZSB2YWx1ZSByZXR1cm5lZCBpc1xuICogdGhlIHRvcCBsZWZ0IGNvb3JkaW5hdGUgb2YgdGhlIGZlYXR1cmUuXG4gKi9cbmV4cG9ydCBlbnVtIEZlYXR1cmUge1xuICB0YXNrTGluZVN0YXJ0LFxuICB0ZXh0U3RhcnQsXG4gIGdyb3VwVGV4dFN0YXJ0LFxuICBwZXJjZW50U3RhcnQsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9wLFxuICB2ZXJ0aWNhbEFycm93RGVzdEJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdCxcbiAgdmVydGljYWxBcnJvd1N0YXJ0LFxuICBob3Jpem9udGFsQXJyb3dTdGFydCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lVG9wLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tLFxuICBob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmUsXG4gIGdyb3VwRW52ZWxvcGVTdGFydCxcbiAgdGFza0VudmVsb3BlVG9wLFxuXG4gIGRpc3BsYXlSYW5nZVRvcCxcbiAgdGFza1Jvd0JvdHRvbSxcblxuICB0aW1lTWFya1N0YXJ0LFxuICB0aW1lTWFya0VuZCxcbiAgdGltZVRleHRTdGFydCxcblxuICBncm91cFRpdGxlVGV4dFN0YXJ0LFxuXG4gIHRhc2tzQ2xpcFJlY3RPcmlnaW4sXG4gIGdyb3VwQnlPcmlnaW4sXG59XG5cbi8qKiBTaXplcyBvZiBmZWF0dXJlcyBvZiBhIHJlbmRlcmVkIGNoYXJ0LiAqL1xuZXhwb3J0IGVudW0gTWV0cmljIHtcbiAgdGFza0xpbmVIZWlnaHQsXG4gIHBlcmNlbnRIZWlnaHQsXG4gIGFycm93SGVhZEhlaWdodCxcbiAgYXJyb3dIZWFkV2lkdGgsXG4gIG1pbGVzdG9uZURpYW1ldGVyLFxuICBsaW5lRGFzaExpbmUsXG4gIGxpbmVEYXNoR2FwLFxuICB0ZXh0WE9mZnNldCxcbiAgcm93SGVpZ2h0LFxufVxuXG4vKiogTWFrZXMgYSBudW1iZXIgb2RkLCBhZGRzIG9uZSBpZiBldmVuLiAqL1xuY29uc3QgbWFrZU9kZCA9IChuOiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICBpZiAobiAlIDIgPT09IDApIHtcbiAgICByZXR1cm4gbiArIDE7XG4gIH1cbiAgcmV0dXJuIG47XG59O1xuXG4vKiogU2NhbGUgY29uc29saWRhdGVzIGFsbCBjYWxjdWxhdGlvbnMgYXJvdW5kIHJlbmRlcmluZyBhIGNoYXJ0IG9udG8gYSBzdXJmYWNlLiAqL1xuZXhwb3J0IGNsYXNzIFNjYWxlIHtcbiAgcHJpdmF0ZSBkYXlXaWR0aFB4OiBudW1iZXI7XG4gIHByaXZhdGUgcm93SGVpZ2h0UHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBibG9ja1NpemVQeDogbnVtYmVyO1xuICBwcml2YXRlIHRhc2tIZWlnaHRQeDogbnVtYmVyO1xuICBwcml2YXRlIGxpbmVXaWR0aFB4OiBudW1iZXI7XG4gIHByaXZhdGUgbWFyZ2luU2l6ZVB4OiBudW1iZXI7XG4gIHByaXZhdGUgdGltZWxpbmVIZWlnaHRQeDogbnVtYmVyO1xuICBwcml2YXRlIG9yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgdG90YWxOdW1iZXJPZkRheXM6IG51bWJlcjtcbiAgcHJpdmF0ZSBncm91cEJ5Q29sdW1uV2lkdGhQeDogbnVtYmVyO1xuXG4gIHByaXZhdGUgdGltZWxpbmVPcmlnaW46IFBvaW50O1xuICBwcml2YXRlIHRhc2tzT3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSBncm91cEJ5T3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSB0YXNrc0NsaXBSZWN0T3JpZ2luOiBQb2ludDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICAgIGNhbnZhc1dpZHRoUHg6IG51bWJlcixcbiAgICB0b3RhbE51bWJlck9mRGF5czogbnVtYmVyLFxuICAgIG1heEdyb3VwTmFtZUxlbmd0aDogbnVtYmVyID0gMFxuICApIHtcbiAgICB0aGlzLnRvdGFsTnVtYmVyT2ZEYXlzID0gdG90YWxOdW1iZXJPZkRheXM7XG4gICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCA9IG1heEdyb3VwTmFtZUxlbmd0aCAqIG9wdHMuZm9udFNpemVQeDtcblxuICAgIHRoaXMuYmxvY2tTaXplUHggPSBNYXRoLmZsb29yKG9wdHMuZm9udFNpemVQeCAvIDMpO1xuICAgIHRoaXMudGFza0hlaWdodFB4ID0gbWFrZU9kZChNYXRoLmZsb29yKCh0aGlzLmJsb2NrU2l6ZVB4ICogMykgLyA0KSk7XG4gICAgdGhpcy5saW5lV2lkdGhQeCA9IG1ha2VPZGQoTWF0aC5mbG9vcih0aGlzLnRhc2tIZWlnaHRQeCAvIDMpKTtcbiAgICBjb25zdCBtaWxlc3RvbmVSYWRpdXMgPSBNYXRoLmNlaWwodGhpcy50YXNrSGVpZ2h0UHggLyAyKSArIHRoaXMubGluZVdpZHRoUHg7XG4gICAgdGhpcy5tYXJnaW5TaXplUHggPSBtaWxlc3RvbmVSYWRpdXM7XG4gICAgdGhpcy50aW1lbGluZUhlaWdodFB4ID0gb3B0cy5oYXNUaW1lbGluZVxuICAgICAgPyBNYXRoLmNlaWwoKG9wdHMuZm9udFNpemVQeCAqIDQpIC8gMylcbiAgICAgIDogMDtcblxuICAgIHRoaXMudGltZWxpbmVPcmlnaW4gPSBuZXcgUG9pbnQobWlsZXN0b25lUmFkaXVzLCAwKTtcbiAgICB0aGlzLmdyb3VwQnlPcmlnaW4gPSBuZXcgUG9pbnQoMCwgbWlsZXN0b25lUmFkaXVzICsgdGhpcy50aW1lbGluZUhlaWdodFB4KTtcblxuICAgIGxldCBiZWdpbk9mZnNldCA9IDA7XG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlID09PSBudWxsIHx8IG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwiaGlnaGxpZ2h0XCIpIHtcbiAgICAgIC8vIERvIG5vdCBmb3JjZSBkYXlXaWR0aFB4IHRvIGFuIGludGVnZXIsIGl0IGNvdWxkIGdvIHRvIDAgYW5kIGNhdXNlIGFsbFxuICAgICAgLy8gdGFza3MgdG8gYmUgcmVuZGVyZWQgYXQgMCB3aWR0aC5cbiAgICAgIHRoaXMuZGF5V2lkdGhQeCA9XG4gICAgICAgIChjYW52YXNXaWR0aFB4IC0gdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIDIgKiB0aGlzLm1hcmdpblNpemVQeCkgL1xuICAgICAgICB0b3RhbE51bWJlck9mRGF5cztcbiAgICAgIHRoaXMub3JpZ2luID0gbmV3IFBvaW50KDAsIDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTaG91bGQgd2Ugc2V0IHgtbWFyZ2lucyB0byAwIGlmIGEgU3ViUmFuZ2UgaXMgcmVxdWVzdGVkP1xuICAgICAgLy8gT3Igc2hvdWxkIHdlIHRvdGFsbHkgZHJvcCBhbGwgbWFyZ2lucyBmcm9tIGhlcmUgYW5kIGp1c3QgdXNlXG4gICAgICAvLyBDU1MgbWFyZ2lucyBvbiB0aGUgY2FudmFzIGVsZW1lbnQ/XG4gICAgICB0aGlzLmRheVdpZHRoUHggPVxuICAgICAgICAoY2FudmFzV2lkdGhQeCAtIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggLSAyICogdGhpcy5tYXJnaW5TaXplUHgpIC9cbiAgICAgICAgb3B0cy5kaXNwbGF5UmFuZ2UucmFuZ2VJbkRheXM7XG4gICAgICBiZWdpbk9mZnNldCA9IE1hdGguZmxvb3IoXG4gICAgICAgIHRoaXMuZGF5V2lkdGhQeCAqIG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luICsgdGhpcy5tYXJnaW5TaXplUHhcbiAgICAgICk7XG4gICAgICB0aGlzLm9yaWdpbiA9IG5ldyBQb2ludCgtYmVnaW5PZmZzZXQgKyB0aGlzLm1hcmdpblNpemVQeCwgMCk7XG4gICAgfVxuXG4gICAgdGhpcy50YXNrc09yaWdpbiA9IG5ldyBQb2ludChcbiAgICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggLSBiZWdpbk9mZnNldCArIG1pbGVzdG9uZVJhZGl1cyxcbiAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCArIG1pbGVzdG9uZVJhZGl1c1xuICAgICk7XG5cbiAgICB0aGlzLnRhc2tzQ2xpcFJlY3RPcmlnaW4gPSBuZXcgUG9pbnQoXG4gICAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4LFxuICAgICAgdGhpcy50aW1lbGluZUhlaWdodFB4XG4gICAgKTtcblxuICAgIGlmIChvcHRzLmhhc1RleHQpIHtcbiAgICAgIHRoaXMucm93SGVpZ2h0UHggPSA2ICogdGhpcy5ibG9ja1NpemVQeDsgLy8gVGhpcyBtaWdodCBhbHNvIGJlIGAoY2FudmFzSGVpZ2h0UHggLSAyICogb3B0cy5tYXJnaW5TaXplUHgpIC8gbnVtYmVyU3dpbUxhbmVzYCBpZiBoZWlnaHQgaXMgc3VwcGxpZWQ/XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucm93SGVpZ2h0UHggPSAxLjEgKiB0aGlzLmJsb2NrU2l6ZVB4O1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSBjaGFydC4gTm90ZSB0aGF0IGl0J3Mgbm90IGNvbnN0cmFpbmVkIGJ5IHRoZSBjYW52YXMuICovXG4gIHB1YmxpYyBoZWlnaHQobWF4Um93czogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gKFxuICAgICAgbWF4Um93cyAqIHRoaXMucm93SGVpZ2h0UHggKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHggKyAyICogdGhpcy5tYXJnaW5TaXplUHhcbiAgICApO1xuICB9XG5cbiAgcHVibGljIGRheVJvd0Zyb21Qb2ludChwb2ludDogUG9pbnQpOiBEYXlSb3cge1xuICAgIC8vIFRoaXMgc2hvdWxkIGFsc28gY2xhbXAgdGhlIHJldHVybmVkICd4JyB2YWx1ZSB0byBbMCwgbWF4Um93cykuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRheTogY2xhbXAoXG4gICAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgICAgKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICogcG9pbnQueCAtXG4gICAgICAgICAgICB0aGlzLm9yaWdpbi54IC1cbiAgICAgICAgICAgIHRoaXMubWFyZ2luU2l6ZVB4IC1cbiAgICAgICAgICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHgpIC9cbiAgICAgICAgICAgIHRoaXMuZGF5V2lkdGhQeFxuICAgICAgICApLFxuICAgICAgICAwLFxuICAgICAgICB0aGlzLnRvdGFsTnVtYmVyT2ZEYXlzXG4gICAgICApLFxuICAgICAgcm93OiBNYXRoLmZsb29yKFxuICAgICAgICAod2luZG93LmRldmljZVBpeGVsUmF0aW8gKiBwb2ludC55IC1cbiAgICAgICAgICB0aGlzLm9yaWdpbi55IC1cbiAgICAgICAgICB0aGlzLm1hcmdpblNpemVQeCAtXG4gICAgICAgICAgdGhpcy50aW1lbGluZUhlaWdodFB4KSAvXG4gICAgICAgICAgdGhpcy5yb3dIZWlnaHRQeFxuICAgICAgKSxcbiAgICB9O1xuICB9XG5cbiAgLyoqIFRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlIGJvdW5kaW5nIGJveCBmb3IgYSBzaW5nbGUgdGFzay4gKi9cbiAgcHJpdmF0ZSB0YXNrUm93RW52ZWxvcGVTdGFydChyb3c6IG51bWJlciwgZGF5OiBudW1iZXIpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLnN1bShcbiAgICAgIG5ldyBQb2ludChcbiAgICAgICAgTWF0aC5mbG9vcihcbiAgICAgICAgICBkYXkgKiB0aGlzLmRheVdpZHRoUHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHhcbiAgICAgICAgKSxcbiAgICAgICAgTWF0aC5mbG9vcihcbiAgICAgICAgICByb3cgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHhcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gIHByaXZhdGUgZ3JvdXBSb3dFbnZlbG9wZVN0YXJ0KHJvdzogbnVtYmVyLCBkYXk6IG51bWJlcik6IFBvaW50IHtcbiAgICByZXR1cm4gdGhpcy5ncm91cEJ5T3JpZ2luLnN1bShcbiAgICAgIG5ldyBQb2ludChcbiAgICAgICAgMCxcbiAgICAgICAgcm93ICogdGhpcy5yb3dIZWlnaHRQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4XG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgZ3JvdXBIZWFkZXJTdGFydCgpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLnN1bShuZXcgUG9pbnQodGhpcy5tYXJnaW5TaXplUHgsIHRoaXMubWFyZ2luU2l6ZVB4KSk7XG4gIH1cblxuICBwcml2YXRlIHRpbWVFbnZlbG9wZVN0YXJ0KGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5zdW0oXG4gICAgICBuZXcgUG9pbnQoXG4gICAgICAgIGRheSAqIHRoaXMuZGF5V2lkdGhQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCxcbiAgICAgICAgMFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgY29vcmRpbmF0ZSBvZiB0aGUgaXRlbSAqL1xuICBmZWF0dXJlKHJvdzogbnVtYmVyLCBkYXk6IG51bWJlciwgY29vcmQ6IEZlYXR1cmUpOiBQb2ludCB7XG4gICAgc3dpdGNoIChjb29yZCkge1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tMaW5lU3RhcnQ6XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3A6XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5yb3dIZWlnaHRQeCAtIHRoaXMuYmxvY2tTaXplUHhcbiAgICAgICAgKTtcblxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0Qm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKDAsIHRoaXMucm93SGVpZ2h0UHgpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4LFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHhcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cFRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeCxcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4XG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUucGVyY2VudFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5yb3dIZWlnaHRQeCAtIHRoaXMubGluZVdpZHRoUHhcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0OlxuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgTWF0aC5mbG9vcih0aGlzLnJvd0hlaWdodFB4IC0gMC41ICogdGhpcy5ibG9ja1NpemVQeCkgLSAxXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcCkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcCkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3RUb01pbGVzdG9uZTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0KS5hZGQoXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcblxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0KS5hZGQoXG4gICAgICAgICAgdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgICAwXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza0VudmVsb3BlVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBFbnZlbG9wZVN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cFJvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRpbWVNYXJrU3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZU1hcmtFbmQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSkuYWRkKDAsIHRoaXMucm93SGVpZ2h0UHggKiAocm93ICsgMSkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRpbWVUZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSkuYWRkKHRoaXMuYmxvY2tTaXplUHgsIDApO1xuXG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBUaXRsZVRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBIZWFkZXJTdGFydCgpLmFkZCh0aGlzLmJsb2NrU2l6ZVB4LCAwKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5kaXNwbGF5UmFuZ2VUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza1Jvd0JvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93ICsgMSwgZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrc0NsaXBSZWN0T3JpZ2luOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrc0NsaXBSZWN0T3JpZ2luO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwQnlPcmlnaW46XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwQnlPcmlnaW47XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBUaGUgbGluZSBiZWxvdyB3aWxsIG5vdCBjb21waWxlIGlmIHlvdSBtaXNzZWQgYW4gZW51bSBpbiB0aGUgc3dpdGNoIGFib3ZlLlxuICAgICAgICBjb29yZCBzYXRpc2ZpZXMgbmV2ZXI7XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQoMCwgMCk7XG4gICAgfVxuICB9XG5cbiAgbWV0cmljKGZlYXR1cmU6IE1ldHJpYyk6IG51bWJlciB7XG4gICAgc3dpdGNoIChmZWF0dXJlKSB7XG4gICAgICBjYXNlIE1ldHJpYy50YXNrTGluZUhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza0hlaWdodFB4O1xuICAgICAgY2FzZSBNZXRyaWMucGVyY2VudEhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMubGluZVdpZHRoUHg7XG4gICAgICBjYXNlIE1ldHJpYy5hcnJvd0hlYWRIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tIZWlnaHRQeDtcbiAgICAgIGNhc2UgTWV0cmljLmFycm93SGVhZFdpZHRoOlxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4KTtcbiAgICAgIGNhc2UgTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyOlxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4KTtcbiAgICAgIGNhc2UgTWV0cmljLmxpbmVEYXNoTGluZTpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy5saW5lRGFzaEdhcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy50ZXh0WE9mZnNldDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy5yb3dIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLnJvd0hlaWdodFB4O1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gVGhlIGxpbmUgYmVsb3cgd2lsbCBub3QgY29tcGlsZSBpZiB5b3UgbWlzc2VkIGFuIGVudW0gaW4gdGhlIHN3aXRjaCBhYm92ZS5cbiAgICAgICAgZmVhdHVyZSBzYXRpc2ZpZXMgbmV2ZXI7XG4gICAgICAgIHJldHVybiAwLjA7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHsgVGFzaywgdmFsaWRhdGVDaGFydCB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgQ2hhcnRMaWtlLCBmaWx0ZXIsIEZpbHRlckZ1bmMgfSBmcm9tIFwiLi4vY2hhcnQvZmlsdGVyL2ZpbHRlci50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBWZXJ0ZXhJbmRpY2VzIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBSZXNvdXJjZURlZmluaXRpb24gfSBmcm9tIFwiLi4vcmVzb3VyY2VzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBvayB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFNwYW4gfSBmcm9tIFwiLi4vc2xhY2svc2xhY2sudHNcIjtcbmltcG9ydCB7IEtEVHJlZSB9IGZyb20gXCIuL2tkL2tkLnRzXCI7XG5pbXBvcnQgeyBEaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi9yYW5nZS9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi9zY2FsZS9wb2ludC50c1wiO1xuaW1wb3J0IHsgRmVhdHVyZSwgTWV0cmljLCBTY2FsZSB9IGZyb20gXCIuL3NjYWxlL3NjYWxlLnRzXCI7XG5cbnR5cGUgRGlyZWN0aW9uID0gXCJ1cFwiIHwgXCJkb3duXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29sb3JzIHtcbiAgc3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlTXV0ZWQ6IHN0cmluZztcbiAgb25TdXJmYWNlSGlnaGxpZ2h0OiBzdHJpbmc7XG4gIG92ZXJsYXk6IHN0cmluZztcbiAgZ3JvdXBDb2xvcjogc3RyaW5nO1xuICBoaWdobGlnaHQ6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgVGFza0luZGV4VG9Sb3cgPSBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4vKiogRnVuY3Rpb24gdXNlIHRvIHByb2R1Y2UgYSB0ZXh0IGxhYmVsIGZvciBhIHRhc2sgYW5kIGl0cyBzbGFjay4gKi9cbmV4cG9ydCB0eXBlIFRhc2tMYWJlbCA9ICh0YXNrSW5kZXg6IG51bWJlcikgPT4gc3RyaW5nO1xuXG4vKiogQ29udHJvbHMgb2YgdGhlIGRpc3BsYXlSYW5nZSBpbiBSZW5kZXJPcHRpb25zIGlzIHVzZWQuXG4gKlxuICogIFwicmVzdHJpY3RcIjogT25seSBkaXNwbGF5IHRoZSBwYXJ0cyBvZiB0aGUgY2hhcnQgdGhhdCBhcHBlYXIgaW4gdGhlIHJhbmdlLlxuICpcbiAqICBcImhpZ2hsaWdodFwiOiBEaXNwbGF5IHRoZSBmdWxsIHJhbmdlIG9mIHRoZSBkYXRhLCBidXQgaGlnaGxpZ2h0IHRoZSByYW5nZS5cbiAqL1xuZXhwb3J0IHR5cGUgRGlzcGxheVJhbmdlVXNhZ2UgPSBcInJlc3RyaWN0XCIgfCBcImhpZ2hsaWdodFwiO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFRhc2tMYWJlbDogVGFza0xhYmVsID0gKHRhc2tJbmRleDogbnVtYmVyKTogc3RyaW5nID0+XG4gIHRhc2tJbmRleC50b0ZpeGVkKDApO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlck9wdGlvbnMge1xuICAvKiogVGhlIHRleHQgZm9udCBzaXplLCB0aGlzIGRyaXZlcyB0aGUgc2l6ZSBvZiBhbGwgb3RoZXIgY2hhcnQgZmVhdHVyZXMuXG4gICAqICovXG4gIGZvbnRTaXplUHg6IG51bWJlcjtcblxuICAvKiogRGlzcGxheSB0ZXh0IGlmIHRydWUuICovXG4gIGhhc1RleHQ6IGJvb2xlYW47XG5cbiAgLyoqIElmIHN1cHBsaWVkIHRoZW4gb25seSB0aGUgdGFza3MgaW4gdGhlIGdpdmVuIHJhbmdlIHdpbGwgYmUgZGlzcGxheWVkLiAqL1xuICBkaXNwbGF5UmFuZ2U6IERpc3BsYXlSYW5nZSB8IG51bGw7XG5cbiAgLyoqIENvbnRyb2xzIGhvdyB0aGUgYGRpc3BsYXlSYW5nZWAgaXMgdXNlZCBpZiBzdXBwbGllZC4gKi9cbiAgZGlzcGxheVJhbmdlVXNhZ2U6IERpc3BsYXlSYW5nZVVzYWdlO1xuXG4gIC8qKiBUaGUgY29sb3IgdGhlbWUuICovXG4gIGNvbG9yczogQ29sb3JzO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZGlzcGxheSB0aW1lcyBhdCB0aGUgdG9wIG9mIHRoZSBjaGFydC4gKi9cbiAgaGFzVGltZWxpbmU6IGJvb2xlYW47XG5cbiAgLyoqIElmIHRydWUgdGhlbiBkaXNwbGF5IHRoZSB0YXNrIGJhcnMuICovXG4gIGhhc1Rhc2tzOiBib29sZWFuO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZHJhdyB2ZXJ0aWNhbCBsaW5lcyBmcm9tIHRoZSB0aW1lbGluZSBkb3duIHRvIHRhc2sgc3RhcnQgYW5kXG4gICAqIGZpbmlzaCBwb2ludHMuICovXG4gIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IGJvb2xlYW47XG5cbiAgLyoqIERyYXcgZGVwZW5kZW5jeSBlZGdlcyBiZXR3ZWVuIHRhc2tzIGlmIHRydWUuICovXG4gIGhhc0VkZ2VzOiBib29sZWFuO1xuXG4gIC8qKiBGdW5jdGlvbiB0aGF0IHByb2R1Y2VzIGRpc3BsYXkgdGV4dCBmb3IgYSBUYXNrIGFuZCBpdHMgYXNzb2NpYXRlZCBTbGFjay4gKi9cbiAgdGFza0xhYmVsOiBUYXNrTGFiZWw7XG5cbiAgLyoqIFRoZSBpbmRpY2VzIG9mIHRhc2tzIHRoYXQgc2hvdWxkIGJlIGVtcGhhc2l6ZWQgd2hlbiBkcmF3LCB0eXBpY2FsbHkgdXNlZFxuICAgKiB0byBkZW5vdGUgdGhlIGNyaXRpY2FsIHBhdGguICovXG4gIHRhc2tFbXBoYXNpemU6IG51bWJlcltdO1xuXG4gIC8qKiBGaWx0ZXIgdGhlIFRhc2tzIHRvIGJlIGRpc3BsYXllZC4gKi9cbiAgZmlsdGVyRnVuYzogRmlsdGVyRnVuYyB8IG51bGw7XG5cbiAgLyoqIEdyb3VwIHRoZSB0YXNrcyB0b2dldGhlciB2ZXJ0aWNhbGx5IGJhc2VkIG9uIHRoZSBnaXZlbiByZXNvdXJjZS4gSWYgdGhlXG4gICAqIGVtcHR5IHN0cmluZyBpcyBzdXBwbGllZCB0aGVuIGp1c3QgZGlzcGxheSBieSB0b3BvbG9naWNhbCBvcmRlci5cbiAgICovXG4gIGdyb3VwQnlSZXNvdXJjZTogc3RyaW5nO1xuXG4gIC8qKiBUYXNrIHRvIGhpZ2hsaWdodC4gKi9cbiAgaGlnaGxpZ2h0ZWRUYXNrOiBudWxsIHwgbnVtYmVyO1xuXG4gIC8qKiBUaGUgaW5kZXggb2YgdGhlIHNlbGVjdGVkIHRhc2ssIG9yIC0xIGlmIG5vIHRhc2sgaXMgc2VsZWN0ZWQuIFRoaXMgaXNcbiAgICogYWx3YXlzIGFuIGluZGV4IGludG8gdGhlIG9yaWdpbmFsIGNoYXJ0LCBhbmQgbm90IGFuIGluZGV4IGludG8gYSBmaWx0ZXJlZFxuICAgKiBjaGFydC5cbiAgICovXG4gIHNlbGVjdGVkVGFza0luZGV4OiBudW1iZXI7XG59XG5cbmNvbnN0IHZlcnRpY2FsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKFxuICB0YXNrOiBUYXNrLFxuICBkaXJlY3Rpb246IERpcmVjdGlvblxuKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVCb3R0b207XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVUb3A7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0O1xuICB9XG59O1xuXG5jb25zdCB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKFxuICB0YXNrOiBUYXNrLFxuICBkaXJlY3Rpb246IERpcmVjdGlvblxuKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVUb3A7XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVCb3R0b207XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wO1xuICAgIH1cbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdEJvdHRvbTtcbiAgfVxufTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuY29uc3QgaG9yaXpvbnRhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9ICh0YXNrOiBUYXNrKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0O1xuICB9XG59O1xuXG5jb25zdCBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAodGFzazogVGFzayk6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3RUb01pbGVzdG9uZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0O1xuICB9XG59O1xuXG4vKipcbiAqIENvbXB1dGUgd2hhdCB0aGUgaGVpZ2h0IG9mIHRoZSBjYW52YXMgc2hvdWxkIGJlLiBOb3RlIHRoYXQgdGhlIHZhbHVlIGRvZXNuJ3RcbiAqIGtub3cgYWJvdXQgYHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvYCwgc28gaWYgdGhlIGNhbnZhcyBpcyBhbHJlYWR5IHNjYWxlZCBieVxuICogYHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvYCB0aGVuIHNvIHdpbGwgdGhlIHJlc3VsdCBvZiB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VnZ2VzdGVkQ2FudmFzSGVpZ2h0KFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxuICBzcGFuczogU3BhbltdLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBtYXhSb3dzOiBudW1iZXJcbik6IG51bWJlciB7XG4gIGlmICghb3B0cy5oYXNUYXNrcykge1xuICAgIG1heFJvd3MgPSAwO1xuICB9XG4gIHJldHVybiBuZXcgU2NhbGUoXG4gICAgb3B0cyxcbiAgICBjYW52YXMud2lkdGgsXG4gICAgc3BhbnNbc3BhbnMubGVuZ3RoIC0gMV0uZmluaXNoICsgMVxuICApLmhlaWdodChtYXhSb3dzKTtcbn1cblxuLy8gVGhlIGxvY2F0aW9uLCBpbiBjYW52YXMgcGl4ZWwgY29vcmRpbmF0ZXMsIG9mIGVhY2ggdGFzayBiYXIuIFNob3VsZCB1c2UgdGhlXG4vLyB0ZXh0IG9mIHRoZSB0YXNrIGxhYmVsIGFzIHRoZSBsb2NhdGlvbiwgc2luY2UgdGhhdCdzIGFsd2F5cyBkcmF3biBpbiB0aGUgdmlld1xuLy8gaWYgcG9zc2libGUuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tMb2NhdGlvbiB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuXG4gIC8vIFRoYXQgaW5kZXggb2YgdGhlIHRhc2sgaW4gdGhlIHVuZmlsdGVyZWQgQ2hhcnQuXG4gIG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXI7XG59XG5cbnR5cGUgVXBkYXRlVHlwZSA9IFwibW91c2Vtb3ZlXCIgfCBcIm1vdXNlZG93blwiO1xuXG4vLyBBIGZ1bmMgdGhhdCB0YWtlcyBhIFBvaW50IGFuZCByZWRyYXdzIHRoZSBoaWdobGlnaHRlZCB0YXNrIGlmIG5lZWRlZCwgcmV0dXJuc1xuLy8gdGhlIGluZGV4IG9mIHRoZSB0YXNrIHRoYXQgaXMgaGlnaGxpZ2h0ZWQuXG5leHBvcnQgdHlwZSBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgPSAoXG4gIHBvaW50OiBQb2ludCxcbiAgdXBkYXRlVHlwZTogVXBkYXRlVHlwZVxuKSA9PiBudW1iZXIgfCBudWxsO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlclJlc3VsdCB7XG4gIHNjYWxlOiBTY2FsZTtcbiAgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zOiBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgfCBudWxsO1xuICBzZWxlY3RlZFRhc2tMb2NhdGlvbjogUG9pbnQgfCBudWxsO1xufVxuXG4vLyBUT0RPIC0gUGFzcyBpbiBtYXggcm93cywgYW5kIGEgbWFwcGluZyB0aGF0IG1hcHMgZnJvbSB0YXNrSW5kZXggdG8gcm93LFxuLy8gYmVjYXVzZSB0d28gZGlmZmVyZW50IHRhc2tzIG1pZ2h0IGJlIHBsYWNlZCBvbiB0aGUgc2FtZSByb3cuIEFsc28gd2Ugc2hvdWxkXG4vLyBwYXNzIGluIG1heCByb3dzPyBPciBzaG91bGQgdGhhdCBjb21lIGZyb20gdGhlIGFib3ZlIG1hcHBpbmc/XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyVGFza3NUb0NhbnZhcyhcbiAgcGFyZW50OiBIVE1MRWxlbWVudCxcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHBsYW46IFBsYW4sXG4gIHNwYW5zOiBTcGFuW10sXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIG92ZXJsYXk6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCA9IG51bGxcbik6IFJlc3VsdDxSZW5kZXJSZXN1bHQ+IHtcbiAgY29uc3QgdnJldCA9IHZhbGlkYXRlQ2hhcnQocGxhbi5jaGFydCk7XG4gIGlmICghdnJldC5vaykge1xuICAgIHJldHVybiB2cmV0O1xuICB9XG5cbiAgY29uc3QgdGFza0xvY2F0aW9uczogVGFza0xvY2F0aW9uW10gPSBbXTtcblxuICBjb25zdCBvcmlnaW5hbExhYmVscyA9IHBsYW4uY2hhcnQuVmVydGljZXMubWFwKFxuICAgICh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4gb3B0cy50YXNrTGFiZWwodGFza0luZGV4KVxuICApO1xuXG4gIC8vIEFwcGx5IHRoZSBmaWx0ZXIgYW5kIHdvcmsgd2l0aCB0aGUgQ2hhcnRMaWtlIHJldHVybiBmcm9tIHRoaXMgcG9pbnQgb24uXG4gIC8vIEZpdGxlciBhbHNvIG5lZWRzIHRvIGJlIGFwcGxpZWQgdG8gc3BhbnMuXG4gIGNvbnN0IGZyZXQgPSBmaWx0ZXIoXG4gICAgcGxhbi5jaGFydCxcbiAgICBvcHRzLmZpbHRlckZ1bmMsXG4gICAgb3B0cy50YXNrRW1waGFzaXplLFxuICAgIHNwYW5zLFxuICAgIG9yaWdpbmFsTGFiZWxzLFxuICAgIG9wdHMuc2VsZWN0ZWRUYXNrSW5kZXhcbiAgKTtcbiAgaWYgKCFmcmV0Lm9rKSB7XG4gICAgcmV0dXJuIGZyZXQ7XG4gIH1cbiAgY29uc3QgY2hhcnRMaWtlID0gZnJldC52YWx1ZS5jaGFydExpa2U7XG4gIGNvbnN0IGxhYmVscyA9IGZyZXQudmFsdWUubGFiZWxzO1xuICBjb25zdCByZXNvdXJjZURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbihvcHRzLmdyb3VwQnlSZXNvdXJjZSk7XG4gIGNvbnN0IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4ID1cbiAgICBmcmV0LnZhbHVlLmZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4O1xuICBjb25zdCBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleCA9XG4gICAgZnJldC52YWx1ZS5mcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleDtcblxuICAvLyBTZWxlY3RlZCB0YXNrLCBhcyBhbiBpbmRleCBpbnRvIHRoZSB1bmZpbHRlcmVkIENoYXJ0LlxuICBsZXQgbGFzdFNlbGVjdGVkVGFza0luZGV4ID0gb3B0cy5zZWxlY3RlZFRhc2tJbmRleDtcblxuICAvLyBIaWdobGlnaHRlZCB0YXNrcy5cbiAgY29uc3QgZW1waGFzaXplZFRhc2tzOiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoZnJldC52YWx1ZS5lbXBoYXNpemVkVGFza3MpO1xuICBzcGFucyA9IGZyZXQudmFsdWUuc3BhbnM7XG5cbiAgLy8gQ2FsY3VsYXRlIGhvdyB3aWRlIHdlIG5lZWQgdG8gbWFrZSB0aGUgZ3JvdXBCeSBjb2x1bW4uXG4gIGxldCBtYXhHcm91cE5hbWVMZW5ndGggPSAwO1xuICBpZiAob3B0cy5ncm91cEJ5UmVzb3VyY2UgIT09IFwiXCIgJiYgb3B0cy5oYXNUZXh0KSB7XG4gICAgbWF4R3JvdXBOYW1lTGVuZ3RoID0gb3B0cy5ncm91cEJ5UmVzb3VyY2UubGVuZ3RoO1xuICAgIGlmIChyZXNvdXJjZURlZmluaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlcy5mb3JFYWNoKCh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIG1heEdyb3VwTmFtZUxlbmd0aCA9IE1hdGgubWF4KG1heEdyb3VwTmFtZUxlbmd0aCwgdmFsdWUubGVuZ3RoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHRvdGFsTnVtYmVyT2ZSb3dzID0gc3BhbnMubGVuZ3RoO1xuICBjb25zdCB0b3RhbE51bWJlck9mRGF5cyA9IHNwYW5zW3NwYW5zLmxlbmd0aCAtIDFdLmZpbmlzaDtcbiAgY29uc3Qgc2NhbGUgPSBuZXcgU2NhbGUoXG4gICAgb3B0cyxcbiAgICBjYW52YXMud2lkdGgsXG4gICAgdG90YWxOdW1iZXJPZkRheXMgKyAxLFxuICAgIG1heEdyb3VwTmFtZUxlbmd0aFxuICApO1xuXG4gIGNvbnN0IHRhc2tMaW5lSGVpZ2h0ID0gc2NhbGUubWV0cmljKE1ldHJpYy50YXNrTGluZUhlaWdodCk7XG4gIGNvbnN0IGRpYW1vbmREaWFtZXRlciA9IHNjYWxlLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpO1xuICBjb25zdCBwZXJjZW50SGVpZ2h0ID0gc2NhbGUubWV0cmljKE1ldHJpYy5wZXJjZW50SGVpZ2h0KTtcbiAgY29uc3QgYXJyb3dIZWFkSGVpZ2h0ID0gc2NhbGUubWV0cmljKE1ldHJpYy5hcnJvd0hlYWRIZWlnaHQpO1xuICBjb25zdCBhcnJvd0hlYWRXaWR0aCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMuYXJyb3dIZWFkV2lkdGgpO1xuICBjb25zdCBkYXlzV2l0aFRpbWVNYXJrZXJzOiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoKTtcbiAgY29uc3QgdGlyZXQgPSB0YXNrSW5kZXhUb1Jvd0Zyb21Hcm91cEJ5KFxuICAgIG9wdHMsXG4gICAgcmVzb3VyY2VEZWZpbml0aW9uLFxuICAgIGNoYXJ0TGlrZSxcbiAgICBmcmV0LnZhbHVlLmRpc3BsYXlPcmRlclxuICApO1xuICBpZiAoIXRpcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHRpcmV0O1xuICB9XG4gIGNvbnN0IHRhc2tJbmRleFRvUm93ID0gdGlyZXQudmFsdWUudGFza0luZGV4VG9Sb3c7XG4gIGNvbnN0IHJvd1JhbmdlcyA9IHRpcmV0LnZhbHVlLnJvd1JhbmdlcztcblxuICAvLyBTZXQgdXAgY2FudmFzIGJhc2ljcy5cbiAgY2xlYXJDYW52YXMoY3R4LCBvcHRzLCBjYW52YXMpO1xuICBzZXRGb250U2l6ZShjdHgsIG9wdHMpO1xuXG4gIGNvbnN0IGNsaXBSZWdpb24gPSBuZXcgUGF0aDJEKCk7XG4gIGNvbnN0IGNsaXBPcmlnaW4gPSBzY2FsZS5mZWF0dXJlKDAsIDAsIEZlYXR1cmUudGFza3NDbGlwUmVjdE9yaWdpbik7XG4gIGNvbnN0IGNsaXBXaWR0aCA9IGNhbnZhcy53aWR0aCAtIGNsaXBPcmlnaW4ueDtcbiAgY2xpcFJlZ2lvbi5yZWN0KGNsaXBPcmlnaW4ueCwgMCwgY2xpcFdpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAvLyBEcmF3IGJpZyByZWQgcmVjdCBvdmVyIHdoZXJlIHRoZSBjbGlwIHJlZ2lvbiB3aWxsIGJlLlxuICBpZiAoMCkge1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2UoY2xpcFJlZ2lvbik7XG4gIH1cblxuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG5cbiAgaWYgKHJvd1JhbmdlcyAhPT0gbnVsbCkge1xuICAgIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgICBkcmF3U3dpbUxhbmVIaWdobGlnaHRzKFxuICAgICAgICBjdHgsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICByb3dSYW5nZXMsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzLFxuICAgICAgICBvcHRzLmNvbG9ycy5ncm91cENvbG9yXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChyZXNvdXJjZURlZmluaXRpb24gIT09IHVuZGVmaW5lZCAmJiBvcHRzLmhhc1RleHQpIHtcbiAgICAgIGRyYXdTd2ltTGFuZUxhYmVscyhjdHgsIG9wdHMsIHJlc291cmNlRGVmaW5pdGlvbiwgc2NhbGUsIHJvd1Jhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuXG4gIGN0eC5zYXZlKCk7XG4gIGN0eC5jbGlwKGNsaXBSZWdpb24pO1xuXG4gIGludGVyZmFjZSBSZWN0Q29ybmVycyB7XG4gICAgdG9wTGVmdDogUG9pbnQ7XG4gICAgYm90dG9tUmlnaHQ6IFBvaW50O1xuICB9XG4gIGNvbnN0IHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnM6IE1hcDxudW1iZXIsIFJlY3RDb3JuZXJzPiA9IG5ldyBNYXAoKTtcblxuICAvLyBEcmF3IHRhc2tzIGluIHRoZWlyIHJvd3MuXG4gIGNoYXJ0TGlrZS5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHJvdyA9IHRhc2tJbmRleFRvUm93LmdldCh0YXNrSW5kZXgpITtcbiAgICBjb25zdCBzcGFuID0gc3BhbnNbdGFza0luZGV4XTtcbiAgICBjb25zdCB0YXNrU3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgc3Bhbi5zdGFydCwgRmVhdHVyZS50YXNrTGluZVN0YXJ0KTtcbiAgICBjb25zdCB0YXNrRW5kID0gc2NhbGUuZmVhdHVyZShyb3csIHNwYW4uZmluaXNoLCBGZWF0dXJlLnRhc2tMaW5lU3RhcnQpO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuXG4gICAgLy8gRHJhdyBpbiB0aW1lIG1hcmtlcnMgaWYgZGlzcGxheWVkLlxuICAgIC8vIFRPRE8gLSBNYWtlIHN1cmUgdGhleSBkb24ndCBvdmVybGFwLlxuICAgIGlmIChvcHRzLmRyYXdUaW1lTWFya2Vyc09uVGFza3MpIHtcbiAgICAgIGRyYXdUaW1lTWFya2VyQXREYXlUb1Rhc2soXG4gICAgICAgIGN0eCxcbiAgICAgICAgcm93LFxuICAgICAgICBzcGFuLnN0YXJ0LFxuICAgICAgICB0YXNrLFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgZGF5c1dpdGhUaW1lTWFya2Vyc1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoZW1waGFzaXplZFRhc2tzLmhhcyh0YXNrSW5kZXgpKSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICAgIH1cbiAgICBjb25zdCBoaWdobGlnaHRUb3BMZWZ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvdyxcbiAgICAgIHNwYW4uc3RhcnQsXG4gICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICk7XG4gICAgY29uc3QgaGlnaGxpZ2h0Qm90dG9tUmlnaHQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgcm93ICsgMSxcbiAgICAgIHNwYW4uZmluaXNoLFxuICAgICAgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3BcbiAgICApO1xuXG4gICAgdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5zZXQodGFza0luZGV4LCB7XG4gICAgICB0b3BMZWZ0OiBoaWdobGlnaHRUb3BMZWZ0LFxuICAgICAgYm90dG9tUmlnaHQ6IGhpZ2hsaWdodEJvdHRvbVJpZ2h0LFxuICAgIH0pO1xuICAgIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgICBpZiAodGFza1N0YXJ0LnggPT09IHRhc2tFbmQueCkge1xuICAgICAgICBkcmF3TWlsZXN0b25lKGN0eCwgdGFza1N0YXJ0LCBkaWFtb25kRGlhbWV0ZXIsIHBlcmNlbnRIZWlnaHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHJhd1Rhc2tCYXIoY3R4LCB0YXNrU3RhcnQsIHRhc2tFbmQsIHRhc2tMaW5lSGVpZ2h0KTtcbiAgICAgIH1cblxuICAgICAgLy8gU2tpcCBkcmF3aW5nIHRoZSB0ZXh0IG9mIHRoZSBTdGFydCBhbmQgRmluaXNoIHRhc2tzLlxuICAgICAgaWYgKHRhc2tJbmRleCAhPT0gMCAmJiB0YXNrSW5kZXggIT09IHRvdGFsTnVtYmVyT2ZSb3dzIC0gMSkge1xuICAgICAgICBkcmF3VGFza1RleHQoXG4gICAgICAgICAgY3R4LFxuICAgICAgICAgIG9wdHMsXG4gICAgICAgICAgc2NhbGUsXG4gICAgICAgICAgcm93LFxuICAgICAgICAgIHNwYW4sXG4gICAgICAgICAgdGFzayxcbiAgICAgICAgICB0YXNrSW5kZXgsXG4gICAgICAgICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXguZ2V0KHRhc2tJbmRleCkhLFxuICAgICAgICAgIGNsaXBXaWR0aCxcbiAgICAgICAgICBsYWJlbHMsXG4gICAgICAgICAgdGFza0xvY2F0aW9uc1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuXG4gIC8vIE5vdyBkcmF3IGFsbCB0aGUgYXJyb3dzLCBpLmUuIGVkZ2VzLlxuICBpZiAob3B0cy5oYXNFZGdlcyAmJiBvcHRzLmhhc1Rhc2tzKSB7XG4gICAgY29uc3QgaGlnaGxpZ2h0ZWRFZGdlczogRGlyZWN0ZWRFZGdlW10gPSBbXTtcbiAgICBjb25zdCBub3JtYWxFZGdlczogRGlyZWN0ZWRFZGdlW10gPSBbXTtcbiAgICBjaGFydExpa2UuRWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoZW1waGFzaXplZFRhc2tzLmhhcyhlLmkpICYmIGVtcGhhc2l6ZWRUYXNrcy5oYXMoZS5qKSkge1xuICAgICAgICBoaWdobGlnaHRlZEVkZ2VzLnB1c2goZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub3JtYWxFZGdlcy5wdXNoKGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG4gICAgZHJhd0VkZ2VzKFxuICAgICAgY3R4LFxuICAgICAgb3B0cyxcbiAgICAgIG5vcm1hbEVkZ2VzLFxuICAgICAgc3BhbnMsXG4gICAgICBjaGFydExpa2UuVmVydGljZXMsXG4gICAgICBzY2FsZSxcbiAgICAgIHRhc2tJbmRleFRvUm93LFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHQsXG4gICAgICBlbXBoYXNpemVkVGFza3NcbiAgICApO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICBkcmF3RWRnZXMoXG4gICAgICBjdHgsXG4gICAgICBvcHRzLFxuICAgICAgaGlnaGxpZ2h0ZWRFZGdlcyxcbiAgICAgIHNwYW5zLFxuICAgICAgY2hhcnRMaWtlLlZlcnRpY2VzLFxuICAgICAgc2NhbGUsXG4gICAgICB0YXNrSW5kZXhUb1JvdyxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0LFxuICAgICAgZW1waGFzaXplZFRhc2tzXG4gICAgKTtcbiAgfVxuXG4gIC8vIFJlbW92ZSB0aGUgY2xpcCByZWdpb24uXG4gIGN0eC5yZXN0b3JlKCk7XG5cbiAgLy8gTm93IGRyYXcgdGhlIHJhbmdlIGhpZ2hsaWdodHMgaWYgcmVxdWlyZWQuXG4gIGlmIChvcHRzLmRpc3BsYXlSYW5nZSAhPT0gbnVsbCAmJiBvcHRzLmRpc3BsYXlSYW5nZVVzYWdlID09PSBcImhpZ2hsaWdodFwiKSB7XG4gICAgLy8gRHJhdyBhIHJlY3Qgb3ZlciBlYWNoIHNpZGUgdGhhdCBpc24ndCBpbiB0aGUgcmFuZ2UuXG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luID4gMCkge1xuICAgICAgZHJhd1JhbmdlT3ZlcmxheShcbiAgICAgICAgY3R4LFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgMCxcbiAgICAgICAgb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4sXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZSb3dzXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuZW5kIDwgdG90YWxOdW1iZXJPZkRheXMpIHtcbiAgICAgIGRyYXdSYW5nZU92ZXJsYXkoXG4gICAgICAgIGN0eCxcbiAgICAgICAgb3B0cyxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIG9wdHMuZGlzcGxheVJhbmdlLmVuZCxcbiAgICAgICAgdG90YWxOdW1iZXJPZkRheXMgKyAxLFxuICAgICAgICB0b3RhbE51bWJlck9mUm93c1xuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBsZXQgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zOiBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgfCBudWxsID0gbnVsbDtcbiAgbGV0IHNlbGVjdGVkVGFza0xvY2F0aW9uOiBQb2ludCB8IG51bGwgPSBudWxsO1xuXG4gIGlmIChvdmVybGF5ICE9PSBudWxsKSB7XG4gICAgY29uc3Qgb3ZlcmxheUN0eCA9IG92ZXJsYXkuZ2V0Q29udGV4dChcIjJkXCIpITtcblxuICAgIC8vIEFkZCBpbiBhbGwgZm91ciBjb3JuZXJzIG9mIGV2ZXJ5IFRhc2sgdG8gdGFza0xvY2F0aW9ucy5cbiAgICB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmZvckVhY2goXG4gICAgICAocmM6IFJlY3RDb3JuZXJzLCBmaWx0ZXJlZFRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsVGFza0luZGV4ID1cbiAgICAgICAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleC5nZXQoZmlsdGVyZWRUYXNrSW5kZXgpITtcbiAgICAgICAgdGFza0xvY2F0aW9ucy5wdXNoKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHg6IHJjLmJvdHRvbVJpZ2h0LngsXG4gICAgICAgICAgICB5OiByYy5ib3R0b21SaWdodC55LFxuICAgICAgICAgICAgb3JpZ2luYWxUYXNrSW5kZXg6IG9yaWdpbmFsVGFza0luZGV4LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgeDogcmMudG9wTGVmdC54LFxuICAgICAgICAgICAgeTogcmMudG9wTGVmdC55LFxuICAgICAgICAgICAgb3JpZ2luYWxUYXNrSW5kZXg6IG9yaWdpbmFsVGFza0luZGV4LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgeDogcmMuYm90dG9tUmlnaHQueCxcbiAgICAgICAgICAgIHk6IHJjLnRvcExlZnQueSxcbiAgICAgICAgICAgIG9yaWdpbmFsVGFza0luZGV4OiBvcmlnaW5hbFRhc2tJbmRleCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHg6IHJjLnRvcExlZnQueCxcbiAgICAgICAgICAgIHk6IHJjLmJvdHRvbVJpZ2h0LnksXG4gICAgICAgICAgICBvcmlnaW5hbFRhc2tJbmRleDogb3JpZ2luYWxUYXNrSW5kZXgsXG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gICAgY29uc3QgdGFza0xvY2F0aW9uS0RUcmVlID0gbmV3IEtEVHJlZSh0YXNrTG9jYXRpb25zKTtcblxuICAgIC8vIEFsd2F5cyByZWNvcmVkIGluIHRoZSBvcmlnaW5hbCB1bmZpbHRlcmVkIHRhc2sgaW5kZXguXG4gICAgbGV0IGxhc3RIaWdobGlnaHRlZFRhc2tJbmRleCA9IC0xO1xuXG4gICAgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zID0gKFxuICAgICAgcG9pbnQ6IFBvaW50LFxuICAgICAgdXBkYXRlVHlwZTogVXBkYXRlVHlwZVxuICAgICk6IG51bWJlciB8IG51bGwgPT4ge1xuICAgICAgLy8gRmlyc3QgY29udmVydCBwb2ludCBpbiBvZmZzZXQgY29vcmRzIGludG8gY2FudmFzIGNvb3Jkcy5cbiAgICAgIHBvaW50LnggPSBwb2ludC54ICogd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgICBwb2ludC55ID0gcG9pbnQueSAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgY29uc3QgdGFza0xvY2F0aW9uID0gdGFza0xvY2F0aW9uS0RUcmVlLm5lYXJlc3QocG9pbnQpO1xuICAgICAgY29uc3Qgb3JpZ2luYWxUYXNrSW5kZXggPSB0YXNrTG9jYXRpb24ub3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgICBpZiAodXBkYXRlVHlwZSA9PT0gXCJtb3VzZW1vdmVcIikge1xuICAgICAgICBpZiAob3JpZ2luYWxUYXNrSW5kZXggPT09IGxhc3RIaWdobGlnaHRlZFRhc2tJbmRleCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG9yaWdpbmFsVGFza0luZGV4ID09PSBsYXN0U2VsZWN0ZWRUYXNrSW5kZXgpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHVwZGF0ZVR5cGUgPT09IFwibW91c2Vtb3ZlXCIpIHtcbiAgICAgICAgbGFzdEhpZ2hsaWdodGVkVGFza0luZGV4ID0gb3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYXN0U2VsZWN0ZWRUYXNrSW5kZXggPSBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgIH1cblxuICAgICAgb3ZlcmxheUN0eC5jbGVhclJlY3QoMCwgMCwgb3ZlcmxheS53aWR0aCwgb3ZlcmxheS5oZWlnaHQpO1xuXG4gICAgICAvLyBEcmF3IGJvdGggaGlnaGxpZ2h0IGFuZCBzZWxlY3Rpb24uXG5cbiAgICAgIC8vIERyYXcgaGlnaGxpZ2h0LlxuICAgICAgbGV0IGNvcm5lcnMgPSB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmdldChcbiAgICAgICAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXguZ2V0KGxhc3RIaWdobGlnaHRlZFRhc2tJbmRleCkhXG4gICAgICApO1xuICAgICAgaWYgKGNvcm5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkcmF3VGFza0hpZ2hsaWdodChcbiAgICAgICAgICBvdmVybGF5Q3R4LFxuICAgICAgICAgIGNvcm5lcnMudG9wTGVmdCxcbiAgICAgICAgICBjb3JuZXJzLmJvdHRvbVJpZ2h0LFxuICAgICAgICAgIG9wdHMuY29sb3JzLmhpZ2hsaWdodCxcbiAgICAgICAgICBzY2FsZS5tZXRyaWModGFza0xpbmVIZWlnaHQpXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIERyYXcgc2VsZWN0aW9uLlxuICAgICAgY29ybmVycyA9IHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMuZ2V0KFxuICAgICAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5nZXQobGFzdFNlbGVjdGVkVGFza0luZGV4KSFcbiAgICAgICk7XG4gICAgICBpZiAoY29ybmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRyYXdTZWxlY3Rpb25IaWdobGlnaHQoXG4gICAgICAgICAgb3ZlcmxheUN0eCxcbiAgICAgICAgICBjb3JuZXJzLnRvcExlZnQsXG4gICAgICAgICAgY29ybmVycy5ib3R0b21SaWdodCxcbiAgICAgICAgICBvcHRzLmNvbG9ycy5oaWdobGlnaHRcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9yaWdpbmFsVGFza0luZGV4O1xuICAgIH07XG5cbiAgICAvLyBEcmF3IHNlbGVjdGlvbi5cbiAgICBjb25zdCBjb3JuZXJzID0gdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5nZXQoXG4gICAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5nZXQobGFzdFNlbGVjdGVkVGFza0luZGV4KSFcbiAgICApO1xuICAgIGlmIChjb3JuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGRyYXdTZWxlY3Rpb25IaWdobGlnaHQoXG4gICAgICAgIG92ZXJsYXlDdHgsXG4gICAgICAgIGNvcm5lcnMudG9wTGVmdCxcbiAgICAgICAgY29ybmVycy5ib3R0b21SaWdodCxcbiAgICAgICAgb3B0cy5jb2xvcnMuaGlnaGxpZ2h0XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGhpZ2hlc3QgdGFzayBvZiBhbGwgdGhlIHRhc2tzIGRpc3BsYXllZC5cbiAgdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5mb3JFYWNoKChyYzogUmVjdENvcm5lcnMpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWRUYXNrTG9jYXRpb24gPT09IG51bGwpIHtcbiAgICAgIHNlbGVjdGVkVGFza0xvY2F0aW9uID0gcmMudG9wTGVmdDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHJjLnRvcExlZnQueSA8IHNlbGVjdGVkVGFza0xvY2F0aW9uLnkpIHtcbiAgICAgIHNlbGVjdGVkVGFza0xvY2F0aW9uID0gcmMudG9wTGVmdDtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBvayh7XG4gICAgc2NhbGU6IHNjYWxlLFxuICAgIHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvczogdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zLFxuICAgIHNlbGVjdGVkVGFza0xvY2F0aW9uOiBzZWxlY3RlZFRhc2tMb2NhdGlvbixcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdFZGdlcyhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSxcbiAgc3BhbnM6IFNwYW5bXSxcbiAgdGFza3M6IFRhc2tbXSxcbiAgc2NhbGU6IFNjYWxlLFxuICB0YXNrSW5kZXhUb1JvdzogVGFza0luZGV4VG9Sb3csXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyLFxuICB0YXNrSGlnaGxpZ2h0czogU2V0PG51bWJlcj5cbikge1xuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBjb25zdCBzcmNTbGFjazogU3BhbiA9IHNwYW5zW2UuaV07XG4gICAgY29uc3QgZHN0U2xhY2s6IFNwYW4gPSBzcGFuc1tlLmpdO1xuICAgIGNvbnN0IHNyY1Rhc2s6IFRhc2sgPSB0YXNrc1tlLmldO1xuICAgIGNvbnN0IGRzdFRhc2s6IFRhc2sgPSB0YXNrc1tlLmpdO1xuICAgIGNvbnN0IHNyY1JvdyA9IHRhc2tJbmRleFRvUm93LmdldChlLmkpITtcbiAgICBjb25zdCBkc3RSb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQoZS5qKSE7XG4gICAgY29uc3Qgc3JjRGF5ID0gc3JjU2xhY2suZmluaXNoO1xuICAgIGNvbnN0IGRzdERheSA9IGRzdFNsYWNrLnN0YXJ0O1xuXG4gICAgaWYgKHRhc2tIaWdobGlnaHRzLmhhcyhlLmkpICYmIHRhc2tIaWdobGlnaHRzLmhhcyhlLmopKSB7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIH1cblxuICAgIGRyYXdBcnJvd0JldHdlZW5UYXNrcyhcbiAgICAgIGN0eCxcbiAgICAgIHNyY0RheSxcbiAgICAgIGRzdERheSxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkcmF3UmFuZ2VPdmVybGF5KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgc2NhbGU6IFNjYWxlLFxuICBiZWdpbkRheTogbnVtYmVyLFxuICBlbmREYXk6IG51bWJlcixcbiAgdG90YWxOdW1iZXJPZlJvd3M6IG51bWJlclxuKSB7XG4gIGNvbnN0IHRvcExlZnQgPSBzY2FsZS5mZWF0dXJlKDAsIGJlZ2luRGF5LCBGZWF0dXJlLmRpc3BsYXlSYW5nZVRvcCk7XG4gIGNvbnN0IGJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICB0b3RhbE51bWJlck9mUm93cyxcbiAgICBlbmREYXksXG4gICAgRmVhdHVyZS50YXNrUm93Qm90dG9tXG4gICk7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vdmVybGF5O1xuICBjdHguZmlsbFJlY3QoXG4gICAgdG9wTGVmdC54LFxuICAgIHRvcExlZnQueSxcbiAgICBib3R0b21SaWdodC54IC0gdG9wTGVmdC54LFxuICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgKTtcbiAgY29uc29sZS5sb2coXCJkcmF3UmFuZ2VPdmVybGF5XCIsIHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcbn1cblxuZnVuY3Rpb24gZHJhd0Fycm93QmV0d2VlblRhc2tzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc3JjRGF5OiBudW1iZXIsXG4gIGRzdERheTogbnVtYmVyLFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNUYXNrOiBUYXNrLFxuICBkc3RSb3c6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXJcbikge1xuICBpZiAoc3JjRGF5ID09PSBkc3REYXkpIHtcbiAgICBkcmF3VmVydGljYWxBcnJvd1RvVGFzayhcbiAgICAgIGN0eCxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjRGF5LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdERheSxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgZHJhd0xTaGFwZWRBcnJvd1RvVGFzayhcbiAgICAgIGN0eCxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjRGF5LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBkc3REYXksXG4gICAgICBhcnJvd0hlYWRIZWlnaHQsXG4gICAgICBhcnJvd0hlYWRXaWR0aFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYXJDYW52YXMoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50XG4pIHtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLnN1cmZhY2U7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG59XG5cbmZ1bmN0aW9uIHNldEZvbnRTaXplKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBvcHRzOiBSZW5kZXJPcHRpb25zKSB7XG4gIGN0eC5mb250ID0gYCR7b3B0cy5mb250U2l6ZVB4fXB4IHNlcmlmYDtcbn1cblxuLy8gRHJhdyBMIHNoYXBlZCBhcnJvdywgZmlyc3QgZ29pbmcgYmV0d2VlbiByb3dzLCB0aGVuIGdvaW5nIGJldHdlZW4gZGF5cy5cbmZ1bmN0aW9uIGRyYXdMU2hhcGVkQXJyb3dUb1Rhc2soXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNEYXk6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdFRhc2s6IFRhc2ssXG4gIGRzdERheTogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlcixcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlclxuKSB7XG4gIC8vIERyYXcgdmVydGljYWwgcGFydCBvZiB0aGUgXCJMXCIuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY29uc3QgZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSBzcmNSb3cgPCBkc3RSb3cgPyBcImRvd25cIiA6IFwidXBcIjtcbiAgY29uc3QgdmVydExpbmVTdGFydCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgc3JjUm93LFxuICAgIHNyY0RheSxcbiAgICB2ZXJ0aWNhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihzcmNUYXNrLCBkaXJlY3Rpb24pXG4gICk7XG4gIGNvbnN0IHZlcnRMaW5lRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICBkc3RSb3csXG4gICAgc3JjRGF5LFxuICAgIGhvcml6b250YWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihkc3RUYXNrKVxuICApO1xuICBjdHgubW92ZVRvKHZlcnRMaW5lU3RhcnQueCArIDAuNSwgdmVydExpbmVTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIHZlcnRMaW5lRW5kLnkpO1xuXG4gIC8vIERyYXcgaG9yaXpvbnRhbCBwYXJ0IG9mIHRoZSBcIkxcIi5cbiAgY29uc3QgaG9yekxpbmVTdGFydCA9IHZlcnRMaW5lRW5kO1xuICBjb25zdCBob3J6TGluZUVuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIGRzdERheSxcbiAgICBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oZHN0VGFzaylcbiAgKTtcbiAgY3R4Lm1vdmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIGhvcnpMaW5lU3RhcnQueSk7XG4gIGN0eC5saW5lVG8oaG9yekxpbmVFbmQueCArIDAuNSwgaG9yekxpbmVFbmQueSk7XG5cbiAgLy8gRHJhdyB0aGUgYXJyb3doZWFkLiBUaGlzIGFycm93IGhlYWQgd2lsbCBhbHdheXMgcG9pbnQgdG8gdGhlIHJpZ2h0XG4gIC8vIHNpbmNlIHRoYXQncyBob3cgdGltZSBmbG93cy5cbiAgY3R4Lm1vdmVUbyhob3J6TGluZUVuZC54ICsgMC41LCBob3J6TGluZUVuZC55KTtcbiAgY3R4LmxpbmVUbyhcbiAgICBob3J6TGluZUVuZC54IC0gYXJyb3dIZWFkSGVpZ2h0ICsgMC41LFxuICAgIGhvcnpMaW5lRW5kLnkgKyBhcnJvd0hlYWRXaWR0aFxuICApO1xuICBjdHgubW92ZVRvKGhvcnpMaW5lRW5kLnggKyAwLjUsIGhvcnpMaW5lRW5kLnkpO1xuICBjdHgubGluZVRvKFxuICAgIGhvcnpMaW5lRW5kLnggLSBhcnJvd0hlYWRIZWlnaHQgKyAwLjUsXG4gICAgaG9yekxpbmVFbmQueSAtIGFycm93SGVhZFdpZHRoXG4gICk7XG4gIGN0eC5zdHJva2UoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1ZlcnRpY2FsQXJyb3dUb1Rhc2soXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNEYXk6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdERheTogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGNvbnN0IGRpcmVjdGlvbjogRGlyZWN0aW9uID0gc3JjUm93IDwgZHN0Um93ID8gXCJkb3duXCIgOiBcInVwXCI7XG4gIGNvbnN0IGFycm93U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHNyY1JvdyxcbiAgICBzcmNEYXksXG4gICAgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oc3JjVGFzaywgZGlyZWN0aW9uKVxuICApO1xuICBjb25zdCBhcnJvd0VuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIGRzdERheSxcbiAgICB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKGRzdFRhc2ssIGRpcmVjdGlvbilcbiAgKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8oYXJyb3dTdGFydC54ICsgMC41LCBhcnJvd1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKGFycm93RW5kLnggKyAwLjUsIGFycm93RW5kLnkpO1xuXG4gIC8vIERyYXcgdGhlIGFycm93aGVhZC5cbiAgY29uc3QgZGVsdGFZID0gZGlyZWN0aW9uID09PSBcImRvd25cIiA/IC1hcnJvd0hlYWRIZWlnaHQgOiBhcnJvd0hlYWRIZWlnaHQ7XG4gIGN0eC5tb3ZlVG8oYXJyb3dFbmQueCArIDAuNSwgYXJyb3dFbmQueSk7XG4gIGN0eC5saW5lVG8oYXJyb3dFbmQueCAtIGFycm93SGVhZFdpZHRoICsgMC41LCBhcnJvd0VuZC55ICsgZGVsdGFZKTtcbiAgY3R4Lm1vdmVUbyhhcnJvd0VuZC54ICsgMC41LCBhcnJvd0VuZC55KTtcbiAgY3R4LmxpbmVUbyhhcnJvd0VuZC54ICsgYXJyb3dIZWFkV2lkdGggKyAwLjUsIGFycm93RW5kLnkgKyBkZWx0YVkpO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUYXNrVGV4dChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93OiBudW1iZXIsXG4gIHNwYW46IFNwYW4sXG4gIHRhc2s6IFRhc2ssXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBvcmlnaW5hbFRhc2tJbmRleDogbnVtYmVyLFxuICBjbGlwV2lkdGg6IG51bWJlcixcbiAgbGFiZWxzOiBzdHJpbmdbXSxcbiAgdGFza0xvY2F0aW9uczogVGFza0xvY2F0aW9uW11cbikge1xuICBpZiAoIW9wdHMuaGFzVGV4dCkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBsYWJlbCA9IGxhYmVsc1t0YXNrSW5kZXhdO1xuXG4gIGxldCB4U3RhcnRJblRpbWUgPSBzcGFuLnN0YXJ0O1xuICBsZXQgeFBpeGVsRGVsdGEgPSAwO1xuICAvLyBEZXRlcm1pbmUgd2hlcmUgb24gdGhlIHgtYXhpcyB0byBzdGFydCBkcmF3aW5nIHRoZSB0YXNrIHRleHQuXG4gIGlmIChvcHRzLmRpc3BsYXlSYW5nZSAhPT0gbnVsbCAmJiBvcHRzLmRpc3BsYXlSYW5nZVVzYWdlID09PSBcInJlc3RyaWN0XCIpIHtcbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuaW4oc3Bhbi5zdGFydCkpIHtcbiAgICAgIHhTdGFydEluVGltZSA9IHNwYW4uc3RhcnQ7XG4gICAgICB4UGl4ZWxEZWx0YSA9IDA7XG4gICAgfSBlbHNlIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5pbihzcGFuLmZpbmlzaCkpIHtcbiAgICAgIHhTdGFydEluVGltZSA9IHNwYW4uZmluaXNoO1xuICAgICAgY29uc3QgbWVhcyA9IGN0eC5tZWFzdXJlVGV4dChsYWJlbCk7XG4gICAgICB4UGl4ZWxEZWx0YSA9IC1tZWFzLndpZHRoIC0gMiAqIHNjYWxlLm1ldHJpYyhNZXRyaWMudGV4dFhPZmZzZXQpO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBzcGFuLnN0YXJ0IDwgb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gJiZcbiAgICAgIHNwYW4uZmluaXNoID4gb3B0cy5kaXNwbGF5UmFuZ2UuZW5kXG4gICAgKSB7XG4gICAgICB4U3RhcnRJblRpbWUgPSBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbjtcbiAgICAgIHhQaXhlbERlbHRhID0gY2xpcFdpZHRoIC8gMjtcbiAgICB9XG4gIH1cbiAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xuICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgeFN0YXJ0SW5UaW1lLCBGZWF0dXJlLnRleHRTdGFydCk7XG4gIGNvbnN0IHRleHRYID0gdGV4dFN0YXJ0LnggKyB4UGl4ZWxEZWx0YTtcbiAgY29uc3QgdGV4dFkgPSB0ZXh0U3RhcnQueTtcbiAgY3R4LmZpbGxUZXh0KGxhYmVsLCB0ZXh0U3RhcnQueCArIHhQaXhlbERlbHRhLCB0ZXh0U3RhcnQueSk7XG4gIHRhc2tMb2NhdGlvbnMucHVzaCh7XG4gICAgeDogdGV4dFgsXG4gICAgeTogdGV4dFksXG4gICAgb3JpZ2luYWxUYXNrSW5kZXg6IG9yaWdpbmFsVGFza0luZGV4LFxuICB9KTtcbn1cblxuZnVuY3Rpb24gZHJhd1Rhc2tCYXIoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICB0YXNrU3RhcnQ6IFBvaW50LFxuICB0YXNrRW5kOiBQb2ludCxcbiAgdGFza0xpbmVIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGN0eC5maWxsUmVjdChcbiAgICB0YXNrU3RhcnQueCxcbiAgICB0YXNrU3RhcnQueSxcbiAgICB0YXNrRW5kLnggLSB0YXNrU3RhcnQueCxcbiAgICB0YXNrTGluZUhlaWdodFxuICApO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza0hpZ2hsaWdodChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIGhpZ2hsaWdodFN0YXJ0OiBQb2ludCxcbiAgaGlnaGxpZ2h0RW5kOiBQb2ludCxcbiAgY29sb3I6IHN0cmluZyxcbiAgYm9yZGVyV2lkdGg6IG51bWJlclxuKSB7XG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICBjdHgubGluZVdpZHRoID0gYm9yZGVyV2lkdGg7XG4gIGN0eC5zdHJva2VSZWN0KFxuICAgIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0U3RhcnQueSxcbiAgICBoaWdobGlnaHRFbmQueCAtIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0RW5kLnkgLSBoaWdobGlnaHRTdGFydC55XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdTZWxlY3Rpb25IaWdobGlnaHQoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBoaWdobGlnaHRTdGFydDogUG9pbnQsXG4gIGhpZ2hsaWdodEVuZDogUG9pbnQsXG4gIGNvbG9yOiBzdHJpbmdcbikge1xuICBjdHguZmlsbFN0eWxlID0gY29sb3I7XG4gIGN0eC5maWxsUmVjdChcbiAgICBoaWdobGlnaHRTdGFydC54LFxuICAgIGhpZ2hsaWdodFN0YXJ0LnksXG4gICAgaGlnaGxpZ2h0RW5kLnggLSBoaWdobGlnaHRTdGFydC54LFxuICAgIGhpZ2hsaWdodEVuZC55IC0gaGlnaGxpZ2h0U3RhcnQueVxuICApO1xufVxuXG5mdW5jdGlvbiBkcmF3TWlsZXN0b25lKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgdGFza1N0YXJ0OiBQb2ludCxcbiAgZGlhbW9uZERpYW1ldGVyOiBudW1iZXIsXG4gIHBlcmNlbnRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmxpbmVXaWR0aCA9IHBlcmNlbnRIZWlnaHQgLyAyO1xuICBjdHgubW92ZVRvKHRhc2tTdGFydC54LCB0YXNrU3RhcnQueSAtIGRpYW1vbmREaWFtZXRlcik7XG4gIGN0eC5saW5lVG8odGFza1N0YXJ0LnggKyBkaWFtb25kRGlhbWV0ZXIsIHRhc2tTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh0YXNrU3RhcnQueCwgdGFza1N0YXJ0LnkgKyBkaWFtb25kRGlhbWV0ZXIpO1xuICBjdHgubGluZVRvKHRhc2tTdGFydC54IC0gZGlhbW9uZERpYW1ldGVyLCB0YXNrU3RhcnQueSk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbiAgY3R4LnN0cm9rZSgpO1xufVxuXG5jb25zdCBkcmF3VGltZU1hcmtlckF0RGF5VG9UYXNrID0gKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgcm93OiBudW1iZXIsXG4gIGRheTogbnVtYmVyLFxuICB0YXNrOiBUYXNrLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBzY2FsZTogU2NhbGUsXG4gIGRheXNXaXRoVGltZU1hcmtlcnM6IFNldDxudW1iZXI+XG4pID0+IHtcbiAgaWYgKGRheXNXaXRoVGltZU1hcmtlcnMuaGFzKGRheSkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZGF5c1dpdGhUaW1lTWFya2Vycy5hZGQoZGF5KTtcbiAgY29uc3QgdGltZU1hcmtTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudGltZU1hcmtTdGFydCk7XG4gIGNvbnN0IHRpbWVNYXJrRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICByb3csXG4gICAgZGF5LFxuICAgIHZlcnRpY2FsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24odGFzaywgXCJkb3duXCIpXG4gICk7XG4gIGN0eC5saW5lV2lkdGggPSAwLjU7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm92ZXJsYXk7XG5cbiAgY3R4Lm1vdmVUbyh0aW1lTWFya1N0YXJ0LnggKyAwLjUsIHRpbWVNYXJrU3RhcnQueSk7XG4gIGN0eC5saW5lVG8odGltZU1hcmtTdGFydC54ICsgMC41LCB0aW1lTWFya0VuZC55KTtcbiAgY3R4LnN0cm9rZSgpO1xuXG4gIGN0eC5zZXRMaW5lRGFzaChbXSk7XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gIGNvbnN0IHRleHRTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudGltZVRleHRTdGFydCk7XG4gIGlmIChvcHRzLmhhc1RleHQgJiYgb3B0cy5oYXNUaW1lbGluZSkge1xuICAgIGN0eC5maWxsVGV4dChgJHtkYXl9YCwgdGV4dFN0YXJ0LngsIHRleHRTdGFydC55KTtcbiAgfVxufTtcblxuLyoqIFJlcHJlc2VudHMgYSBoYWxmLW9wZW4gaW50ZXJ2YWwgb2Ygcm93cywgZS5nLiBbc3RhcnQsIGZpbmlzaCkuICovXG5pbnRlcmZhY2UgUm93UmFuZ2Uge1xuICBzdGFydDogbnVtYmVyO1xuICBmaW5pc2g6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIFRhc2tJbmRleFRvUm93UmV0dXJuIHtcbiAgdGFza0luZGV4VG9Sb3c6IFRhc2tJbmRleFRvUm93O1xuXG4gIC8qKiBNYXBzIGVhY2ggcmVzb3VyY2UgdmFsdWUgaW5kZXggdG8gYSByYW5nZSBvZiByb3dzLiAqL1xuICByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPiB8IG51bGw7XG5cbiAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb24gfCBudWxsO1xufVxuXG5jb25zdCB0YXNrSW5kZXhUb1Jvd0Zyb21Hcm91cEJ5ID0gKFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICByZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCxcbiAgY2hhcnRMaWtlOiBDaGFydExpa2UsXG4gIGRpc3BsYXlPcmRlcjogVmVydGV4SW5kaWNlc1xuKTogUmVzdWx0PFRhc2tJbmRleFRvUm93UmV0dXJuPiA9PiB7XG4gIC8vIGRpc3BsYXlPcmRlciBtYXBzIGZyb20gcm93IHRvIHRhc2sgaW5kZXgsIHRoaXMgd2lsbCBwcm9kdWNlIHRoZSBpbnZlcnNlIG1hcHBpbmcuXG4gIGNvbnN0IHRhc2tJbmRleFRvUm93ID0gbmV3IE1hcChcbiAgICAvLyBUaGlzIGxvb2tzIGJhY2t3YXJkcywgYnV0IGl0IGlzbid0LiBSZW1lbWJlciB0aGF0IHRoZSBtYXAgY2FsbGJhY2sgdGFrZXNcbiAgICAvLyAodmFsdWUsIGluZGV4KSBhcyBpdHMgYXJndW1lbnRzLlxuICAgIGRpc3BsYXlPcmRlci5tYXAoKHRhc2tJbmRleDogbnVtYmVyLCByb3c6IG51bWJlcikgPT4gW3Rhc2tJbmRleCwgcm93XSlcbiAgKTtcblxuICBpZiAocmVzb3VyY2VEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gb2soe1xuICAgICAgdGFza0luZGV4VG9Sb3c6IHRhc2tJbmRleFRvUm93LFxuICAgICAgcm93UmFuZ2VzOiBudWxsLFxuICAgICAgcmVzb3VyY2VEZWZpbml0aW9uOiBudWxsLFxuICAgIH0pO1xuICB9XG5cbiAgY29uc3Qgc3RhcnRUYXNrSW5kZXggPSAwO1xuICBjb25zdCBmaW5pc2hUYXNrSW5kZXggPSBjaGFydExpa2UuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgY29uc3QgaWdub3JhYmxlID0gW3N0YXJ0VGFza0luZGV4LCBmaW5pc2hUYXNrSW5kZXhdO1xuXG4gIC8vIEdyb3VwIGFsbCB0YXNrcyBieSB0aGVpciByZXNvdXJjZSB2YWx1ZSwgd2hpbGUgcHJlc2VydmluZyBkaXNwbGF5T3JkZXJcbiAgLy8gb3JkZXIgd2l0aCB0aGUgZ3JvdXBzLlxuICBjb25zdCBncm91cHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyW10+KCk7XG4gIGRpc3BsYXlPcmRlci5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHJlc291cmNlVmFsdWUgPVxuICAgICAgY2hhcnRMaWtlLlZlcnRpY2VzW3Rhc2tJbmRleF0uZ2V0UmVzb3VyY2Uob3B0cy5ncm91cEJ5UmVzb3VyY2UpIHx8IFwiXCI7XG4gICAgY29uc3QgZ3JvdXBNZW1iZXJzID0gZ3JvdXBzLmdldChyZXNvdXJjZVZhbHVlKSB8fCBbXTtcbiAgICBncm91cE1lbWJlcnMucHVzaCh0YXNrSW5kZXgpO1xuICAgIGdyb3Vwcy5zZXQocmVzb3VyY2VWYWx1ZSwgZ3JvdXBNZW1iZXJzKTtcbiAgfSk7XG5cbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcblxuICAvLyBVZ2gsIFN0YXJ0IGFuZCBGaW5pc2ggVGFza3MgbmVlZCB0byBiZSBtYXBwZWQsIGJ1dCBzaG91bGQgbm90IGJlIGRvbmUgdmlhXG4gIC8vIHJlc291cmNlIHZhbHVlLCBzbyBTdGFydCBzaG91bGQgYWx3YXlzIGJlIGZpcnN0LlxuICByZXQuc2V0KDAsIDApO1xuXG4gIC8vIE5vdyBpbmNyZW1lbnQgdXAgdGhlIHJvd3MgYXMgd2UgbW92ZSB0aHJvdWdoIGFsbCB0aGUgZ3JvdXBzLlxuICBsZXQgcm93ID0gMTtcbiAgLy8gQW5kIHRyYWNrIGhvdyBtYW55IHJvd3MgYXJlIGluIGVhY2ggZ3JvdXAuXG4gIGNvbnN0IHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+ID0gbmV3IE1hcCgpO1xuICByZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmZvckVhY2goXG4gICAgKHJlc291cmNlVmFsdWU6IHN0cmluZywgcmVzb3VyY2VJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBzdGFydE9mUm93ID0gcm93O1xuICAgICAgKGdyb3Vwcy5nZXQocmVzb3VyY2VWYWx1ZSkgfHwgW10pLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmFibGUuaW5jbHVkZXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXQuc2V0KHRhc2tJbmRleCwgcm93KTtcbiAgICAgICAgcm93Kys7XG4gICAgICB9KTtcbiAgICAgIHJvd1Jhbmdlcy5zZXQocmVzb3VyY2VJbmRleCwgeyBzdGFydDogc3RhcnRPZlJvdywgZmluaXNoOiByb3cgfSk7XG4gICAgfVxuICApO1xuICByZXQuc2V0KGZpbmlzaFRhc2tJbmRleCwgcm93KTtcblxuICByZXR1cm4gb2soe1xuICAgIHRhc2tJbmRleFRvUm93OiByZXQsXG4gICAgcm93UmFuZ2VzOiByb3dSYW5nZXMsXG4gICAgcmVzb3VyY2VEZWZpbml0aW9uOiByZXNvdXJjZURlZmluaXRpb24sXG4gIH0pO1xufTtcblxuY29uc3QgZHJhd1N3aW1MYW5lSGlnaGxpZ2h0cyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4sXG4gIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXIsXG4gIGdyb3VwQ29sb3I6IHN0cmluZ1xuKSA9PiB7XG4gIGN0eC5maWxsU3R5bGUgPSBncm91cENvbG9yO1xuXG4gIGxldCBncm91cCA9IDA7XG4gIHJvd1Jhbmdlcy5mb3JFYWNoKChyb3dSYW5nZTogUm93UmFuZ2UpID0+IHtcbiAgICBjb25zdCB0b3BMZWZ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvd1JhbmdlLnN0YXJ0LFxuICAgICAgMCxcbiAgICAgIEZlYXR1cmUuZ3JvdXBFbnZlbG9wZVN0YXJ0XG4gICAgKTtcbiAgICBjb25zdCBib3R0b21SaWdodCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3dSYW5nZS5maW5pc2gsXG4gICAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICk7XG4gICAgZ3JvdXArKztcbiAgICAvLyBPbmx5IGhpZ2hsaWdodCBldmVyeSBvdGhlciBncm91cCBiYWNrZ3JvdWQgd2l0aCB0aGUgZ3JvdXBDb2xvci5cbiAgICBpZiAoZ3JvdXAgJSAyID09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY3R4LmZpbGxSZWN0KFxuICAgICAgdG9wTGVmdC54LFxuICAgICAgdG9wTGVmdC55LFxuICAgICAgYm90dG9tUmlnaHQueCAtIHRvcExlZnQueCxcbiAgICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgICApO1xuICB9KTtcbn07XG5cbmNvbnN0IGRyYXdTd2ltTGFuZUxhYmVscyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uLFxuICBzY2FsZTogU2NhbGUsXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+XG4pID0+IHtcbiAgaWYgKHJvd1JhbmdlcykgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGNvbnN0IGdyb3VwQnlPcmlnaW4gPSBzY2FsZS5mZWF0dXJlKDAsIDAsIEZlYXR1cmUuZ3JvdXBCeU9yaWdpbik7XG5cbiAgaWYgKG9wdHMuaGFzVGltZWxpbmUpIHtcbiAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJib3R0b21cIjtcbiAgICBjdHguZmlsbFRleHQob3B0cy5ncm91cEJ5UmVzb3VyY2UsIGdyb3VwQnlPcmlnaW4ueCwgZ3JvdXBCeU9yaWdpbi55KTtcbiAgfVxuXG4gIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gICAgcm93UmFuZ2VzLmZvckVhY2goKHJvd1JhbmdlOiBSb3dSYW5nZSwgcmVzb3VyY2VJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAocm93UmFuZ2Uuc3RhcnQgPT09IHJvd1JhbmdlLmZpbmlzaCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgICByb3dSYW5nZS5zdGFydCxcbiAgICAgICAgMCxcbiAgICAgICAgRmVhdHVyZS5ncm91cFRleHRTdGFydFxuICAgICAgKTtcbiAgICAgIGN0eC5maWxsVGV4dChcbiAgICAgICAgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1tyZXNvdXJjZUluZGV4XSxcbiAgICAgICAgdGV4dFN0YXJ0LngsXG4gICAgICAgIHRleHRTdGFydC55XG4gICAgICApO1xuICAgIH0pO1xuICB9XG59O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgVGFzaywgQ2hhcnQsIENoYXJ0VmFsaWRhdGUgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgZWRnZXNCeVNyY0FuZERzdFRvTWFwIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFJvdW5kZXIgfSBmcm9tIFwiLi4vdHlwZXMvdHlwZXMudHNcIjtcblxuLyoqIFNwYW4gcmVwcmVzZW50cyB3aGVuIGEgdGFzayB3aWxsIGJlIGRvbmUsIGkuZS4gaXQgY29udGFpbnMgdGhlIHRpbWUgdGhlIHRhc2tcbiAqIGlzIGV4cGVjdGVkIHRvIGJlZ2luIGFuZCBlbmQuICovXG5leHBvcnQgY2xhc3MgU3BhbiB7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGZpbmlzaDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXJ0OiBudW1iZXIgPSAwLCBmaW5pc2g6IG51bWJlciA9IDApIHtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgdGhpcy5maW5pc2ggPSBmaW5pc2g7XG4gIH1cbn1cblxuLyoqIFRoZSBzdGFuZGFyZCBzbGFjayBjYWxjdWxhdGlvbiB2YWx1ZXMuICovXG5leHBvcnQgY2xhc3MgU2xhY2sge1xuICBlYXJseTogU3BhbiA9IG5ldyBTcGFuKCk7XG4gIGxhdGU6IFNwYW4gPSBuZXcgU3BhbigpO1xuICBzbGFjazogbnVtYmVyID0gMDtcbn1cblxuZXhwb3J0IHR5cGUgVGFza0R1cmF0aW9uID0gKHQ6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKSA9PiBudW1iZXI7XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0VGFza0R1cmF0aW9uID0gKHQ6IFRhc2spOiBudW1iZXIgPT4ge1xuICByZXR1cm4gdC5kdXJhdGlvbjtcbn07XG5cbmV4cG9ydCB0eXBlIFNsYWNrUmVzdWx0ID0gUmVzdWx0PFNsYWNrW10+O1xuXG4vLyBDYWxjdWxhdGUgdGhlIHNsYWNrIGZvciBlYWNoIFRhc2sgaW4gdGhlIENoYXJ0LlxuZXhwb3J0IGZ1bmN0aW9uIENvbXB1dGVTbGFjayhcbiAgYzogQ2hhcnQsXG4gIHRhc2tEdXJhdGlvbjogVGFza0R1cmF0aW9uID0gZGVmYXVsdFRhc2tEdXJhdGlvbixcbiAgcm91bmQ6IFJvdW5kZXJcbik6IFNsYWNrUmVzdWx0IHtcbiAgLy8gQ3JlYXRlIGEgU2xhY2sgZm9yIGVhY2ggVGFzay5cbiAgY29uc3Qgc2xhY2tzOiBTbGFja1tdID0gbmV3IEFycmF5KGMuVmVydGljZXMubGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjLlZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgc2xhY2tzW2ldID0gbmV3IFNsYWNrKCk7XG4gIH1cblxuICBjb25zdCByID0gQ2hhcnRWYWxpZGF0ZShjKTtcbiAgaWYgKCFyLm9rKSB7XG4gICAgcmV0dXJuIGVycm9yKHIuZXJyb3IpO1xuICB9XG5cbiAgY29uc3QgZWRnZXMgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAoYy5FZGdlcyk7XG5cbiAgY29uc3QgdG9wb2xvZ2ljYWxPcmRlciA9IHIudmFsdWU7XG5cbiAgLy8gRmlyc3QgZ28gZm9yd2FyZCB0aHJvdWdoIHRoZSB0b3BvbG9naWNhbCBzb3J0IGFuZCBmaW5kIHRoZSBlYXJseSBzdGFydCBmb3JcbiAgLy8gZWFjaCB0YXNrLCB3aGljaCBpcyB0aGUgbWF4IG9mIGFsbCB0aGUgcHJlZGVjZXNzb3JzIGVhcmx5IGZpbmlzaCB2YWx1ZXMuXG4gIC8vIFNpbmNlIHdlIGtub3cgdGhlIGR1cmF0aW9uIHdlIGNhbiBhbHNvIGNvbXB1dGUgdGhlIGVhcmx5IGZpbmlzaC5cbiAgdG9wb2xvZ2ljYWxPcmRlci5zbGljZSgxKS5mb3JFYWNoKCh2ZXJ0ZXhJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzayA9IGMuVmVydGljZXNbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHNsYWNrID0gc2xhY2tzW3ZlcnRleEluZGV4XTtcbiAgICBzbGFjay5lYXJseS5zdGFydCA9IE1hdGgubWF4KFxuICAgICAgLi4uZWRnZXMuYnlEc3QuZ2V0KHZlcnRleEluZGV4KSEubWFwKChlOiBEaXJlY3RlZEVkZ2UpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBwcmVkZWNlc3NvclNsYWNrID0gc2xhY2tzW2UuaV07XG4gICAgICAgIHJldHVybiBwcmVkZWNlc3NvclNsYWNrLmVhcmx5LmZpbmlzaDtcbiAgICAgIH0pXG4gICAgKTtcbiAgICBzbGFjay5lYXJseS5maW5pc2ggPSByb3VuZChcbiAgICAgIHNsYWNrLmVhcmx5LnN0YXJ0ICsgdGFza0R1cmF0aW9uKHRhc2ssIHZlcnRleEluZGV4KVxuICAgICk7XG4gIH0pO1xuXG4gIC8vIE5vdyBiYWNrd2FyZHMgdGhyb3VnaCB0aGUgdG9wb2xvZ2ljYWwgc29ydCBhbmQgZmluZCB0aGUgbGF0ZSBmaW5pc2ggb2YgZWFjaFxuICAvLyB0YXNrLCB3aGljaCBpcyB0aGUgbWluIG9mIGFsbCB0aGUgc3VjY2Vzc29yIHRhc2tzIGxhdGUgc3RhcnRzLiBBZ2FpbiBzaW5jZVxuICAvLyB3ZSBrbm93IHRoZSBkdXJhdGlvbiB3ZSBjYW4gYWxzbyBjb21wdXRlIHRoZSBsYXRlIHN0YXJ0LiBGaW5hbGx5LCBzaW5jZSB3ZVxuICAvLyBub3cgaGF2ZSBhbGwgdGhlIGVhcmx5L2xhdGUgYW5kIHN0YXJ0L2ZpbmlzaCB2YWx1ZXMgd2UgY2FuIG5vdyBjYWxjdWF0ZSB0aGVcbiAgLy8gc2xhY2suXG4gIHRvcG9sb2dpY2FsT3JkZXIucmV2ZXJzZSgpLmZvckVhY2goKHZlcnRleEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrID0gYy5WZXJ0aWNlc1t2ZXJ0ZXhJbmRleF07XG4gICAgY29uc3Qgc2xhY2sgPSBzbGFja3NbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHN1Y2Nlc3NvcnMgPSBlZGdlcy5ieVNyYy5nZXQodmVydGV4SW5kZXgpO1xuICAgIGlmICghc3VjY2Vzc29ycykge1xuICAgICAgc2xhY2subGF0ZS5maW5pc2ggPSBzbGFjay5lYXJseS5maW5pc2g7XG4gICAgICBzbGFjay5sYXRlLnN0YXJ0ID0gc2xhY2suZWFybHkuc3RhcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNsYWNrLmxhdGUuZmluaXNoID0gTWF0aC5taW4oXG4gICAgICAgIC4uLmVkZ2VzLmJ5U3JjLmdldCh2ZXJ0ZXhJbmRleCkhLm1hcCgoZTogRGlyZWN0ZWRFZGdlKTogbnVtYmVyID0+IHtcbiAgICAgICAgICBjb25zdCBzdWNjZXNzb3JTbGFjayA9IHNsYWNrc1tlLmpdO1xuICAgICAgICAgIHJldHVybiBzdWNjZXNzb3JTbGFjay5sYXRlLnN0YXJ0O1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHNsYWNrLmxhdGUuc3RhcnQgPSByb3VuZChcbiAgICAgICAgc2xhY2subGF0ZS5maW5pc2ggLSB0YXNrRHVyYXRpb24odGFzaywgdmVydGV4SW5kZXgpXG4gICAgICApO1xuICAgICAgc2xhY2suc2xhY2sgPSByb3VuZChzbGFjay5sYXRlLmZpbmlzaCAtIHNsYWNrLmVhcmx5LmZpbmlzaCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gb2soc2xhY2tzKTtcbn1cblxuZXhwb3J0IGNvbnN0IENyaXRpY2FsUGF0aCA9IChzbGFja3M6IFNsYWNrW10sIHJvdW5kOiBSb3VuZGVyKTogbnVtYmVyW10gPT4ge1xuICBjb25zdCByZXQ6IG51bWJlcltdID0gW107XG4gIHNsYWNrcy5mb3JFYWNoKChzbGFjazogU2xhY2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICBpZiAoXG4gICAgICByb3VuZChzbGFjay5sYXRlLmZpbmlzaCAtIHNsYWNrLmVhcmx5LmZpbmlzaCkgPCBOdW1iZXIuRVBTSUxPTiAmJlxuICAgICAgcm91bmQoc2xhY2suZWFybHkuZmluaXNoIC0gc2xhY2suZWFybHkuc3RhcnQpID4gTnVtYmVyLkVQU0lMT05cbiAgICApIHtcbiAgICAgIHJldC5wdXNoKGluZGV4KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcbiIsICIvLyBXaGVuIGFkZGluZyBwcm9wZXJ0aWVzIHRvIENvbG9yVGhlbWUgYWxzbyBtYWtlIHN1cmUgdG8gYWRkIGEgY29ycmVzcG9uZGluZ1xuLy8gQ1NTIEBwcm9wZXJ0eSBkZWNsYXJhdGlvbi5cbi8vXG4vLyBOb3RlIHRoYXQgZWFjaCBwcm9wZXJ0eSBhc3N1bWVzIHRoZSBwcmVzZW5jZSBvZiBhIENTUyB2YXJpYWJsZSBvZiB0aGUgc2FtZSBuYW1lXG4vLyB3aXRoIGEgcHJlY2VlZGluZyBgLS1gLlxuZXhwb3J0IGludGVyZmFjZSBUaGVtZSB7XG4gIHN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZU11dGVkOiBzdHJpbmc7XG4gIG9uU3VyZmFjZVNlY29uZGFyeTogc3RyaW5nO1xuICBvdmVybGF5OiBzdHJpbmc7XG4gIGdyb3VwQ29sb3I6IHN0cmluZztcbiAgaGlnaGxpZ2h0OiBzdHJpbmc7XG59XG5cbnR5cGUgVGhlbWVQcm9wID0ga2V5b2YgVGhlbWU7XG5cbmNvbnN0IGNvbG9yVGhlbWVQcm90b3R5cGU6IFRoZW1lID0ge1xuICBzdXJmYWNlOiBcIlwiLFxuICBvblN1cmZhY2U6IFwiXCIsXG4gIG9uU3VyZmFjZU11dGVkOiBcIlwiLFxuICBvblN1cmZhY2VTZWNvbmRhcnk6IFwiXCIsXG4gIG92ZXJsYXk6IFwiXCIsXG4gIGdyb3VwQ29sb3I6IFwiXCIsXG4gIGhpZ2hsaWdodDogXCJcIixcbn07XG5cbmV4cG9ydCBjb25zdCBjb2xvclRoZW1lRnJvbUVsZW1lbnQgPSAoZWxlOiBIVE1MRWxlbWVudCk6IFRoZW1lID0+IHtcbiAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZSk7XG4gIGNvbnN0IHJldCA9IE9iamVjdC5hc3NpZ24oe30sIGNvbG9yVGhlbWVQcm90b3R5cGUpO1xuICBPYmplY3Qua2V5cyhyZXQpLmZvckVhY2goKG5hbWU6IHN0cmluZykgPT4ge1xuICAgIHJldFtuYW1lIGFzIFRoZW1lUHJvcF0gPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGAtLSR7bmFtZX1gKTtcbiAgfSk7XG4gIHJldHVybiByZXQ7XG59O1xuIiwgImltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnRcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuXCI7XG5pbXBvcnQgeyBQcmVjaXNpb24gfSBmcm9tIFwiLi4vcHJlY2lzaW9uL3ByZWNpc2lvblwiO1xuaW1wb3J0IHsgQ29tcHV0ZVNsYWNrLCBDcml0aWNhbFBhdGggfSBmcm9tIFwiLi4vc2xhY2svc2xhY2tcIjtcbmltcG9ydCB7IEphY29iaWFuLCBVbmNlcnRhaW50eSB9IGZyb20gXCIuLi9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhblwiO1xuXG5jb25zdCBNQVhfUkFORE9NID0gMTAwMDtcblxuY29uc3QgcHJlY2lzaW9uID0gbmV3IFByZWNpc2lvbigyKTtcblxuY29uc3Qgcm5kSW50ID0gKG46IG51bWJlcik6IG51bWJlciA9PiB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuKTtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3JpdGljYWxQYXRoRW50cnkge1xuICBjb3VudDogbnVtYmVyO1xuICB0YXNrczogbnVtYmVyW107XG4gIGR1cmF0aW9uczogbnVtYmVyW107XG59XG5cbi8qKlxuICogU2ltdWxhdGUgdGhlIHVuY2VydGFpbnR5IGluIHRoZSBwbGFuIGFuZCBnZW5lcmF0ZSBwb3NzaWJsZSBhbHRlcm5hdGUgY3JpdGljYWxcbiAqIHBhdGhzLlxuICovXG5leHBvcnQgY29uc3Qgc2ltdWxhdGlvbiA9IChcbiAgcGxhbjogUGxhbixcbiAgbnVtU2ltdWxhdGlvbkxvb3BzOiBudW1iZXJcbik6IE1hcDxzdHJpbmcsIENyaXRpY2FsUGF0aEVudHJ5PiA9PiB7XG4gIC8vIFNpbXVsYXRlIHRoZSB1bmNlcnRhaW50eSBpbiB0aGUgcGxhbiBhbmQgZ2VuZXJhdGUgcG9zc2libGUgYWx0ZXJuYXRlXG4gIC8vIGNyaXRpY2FsIHBhdGhzLlxuXG4gIGNvbnN0IGFsbENyaXRpY2FsUGF0aHMgPSBuZXcgTWFwPHN0cmluZywgQ3JpdGljYWxQYXRoRW50cnk+KCk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1TaW11bGF0aW9uTG9vcHM7IGkrKykge1xuICAgIC8vIEdlbmVyYXRlIHJhbmRvbSBkdXJhdGlvbnMgYmFzZWQgb24gZWFjaCBUYXNrcyB1bmNlcnRhaW50eS5cbiAgICBjb25zdCBkdXJhdGlvbnMgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLm1hcCgodDogVGFzaykgPT4ge1xuICAgICAgY29uc3QgcmF3RHVyYXRpb24gPSBuZXcgSmFjb2JpYW4oXG4gICAgICAgIHQuZHVyYXRpb24sXG4gICAgICAgIHQuZ2V0UmVzb3VyY2UoXCJVbmNlcnRhaW50eVwiKSBhcyBVbmNlcnRhaW50eVxuICAgICAgKS5zYW1wbGUocm5kSW50KE1BWF9SQU5ET00pIC8gTUFYX1JBTkRPTSk7XG4gICAgICByZXR1cm4gcHJlY2lzaW9uLnJvdW5kKHJhd0R1cmF0aW9uKTtcbiAgICB9KTtcblxuICAgIC8vIENvbXB1dGUgdGhlIHNsYWNrIGJhc2VkIG9uIHRob3NlIHJhbmRvbSBkdXJhdGlvbnMuXG4gICAgY29uc3Qgc2xhY2tzUmV0ID0gQ29tcHV0ZVNsYWNrKFxuICAgICAgcGxhbi5jaGFydCxcbiAgICAgICh0OiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4gZHVyYXRpb25zW3Rhc2tJbmRleF0sXG4gICAgICBwcmVjaXNpb24ucm91bmRlcigpXG4gICAgKTtcbiAgICBpZiAoIXNsYWNrc1JldC5vaykge1xuICAgICAgdGhyb3cgc2xhY2tzUmV0LmVycm9yO1xuICAgIH1cblxuICAgIGNvbnN0IGNyaXRpY2FsUGF0aCA9IENyaXRpY2FsUGF0aChzbGFja3NSZXQudmFsdWUsIHByZWNpc2lvbi5yb3VuZGVyKCkpO1xuICAgIGNvbnN0IGNyaXRpY2FsUGF0aEFzU3RyaW5nID0gYCR7Y3JpdGljYWxQYXRofWA7XG4gICAgbGV0IHBhdGhFbnRyeSA9IGFsbENyaXRpY2FsUGF0aHMuZ2V0KGNyaXRpY2FsUGF0aEFzU3RyaW5nKTtcbiAgICBpZiAocGF0aEVudHJ5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHBhdGhFbnRyeSA9IHtcbiAgICAgICAgY291bnQ6IDAsXG4gICAgICAgIHRhc2tzOiBjcml0aWNhbFBhdGgsXG4gICAgICAgIGR1cmF0aW9uczogZHVyYXRpb25zLFxuICAgICAgfTtcbiAgICAgIGFsbENyaXRpY2FsUGF0aHMuc2V0KGNyaXRpY2FsUGF0aEFzU3RyaW5nLCBwYXRoRW50cnkpO1xuICAgIH1cbiAgICBwYXRoRW50cnkuY291bnQrKztcbiAgfVxuXG4gIHJldHVybiBhbGxDcml0aWNhbFBhdGhzO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBDcml0aWNhbFBhdGhUYXNrRW50cnkge1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgZHVyYXRpb246IG51bWJlcjtcbiAgbnVtVGltZXNBcHBlYXJlZDogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgY3JpdGljYWxUYXNrRnJlcXVlbmNpZXMgPSAoXG4gIGFsbENyaXRpY2FsUGF0aHM6IE1hcDxzdHJpbmcsIENyaXRpY2FsUGF0aEVudHJ5PixcbiAgcGxhbjogUGxhblxuKTogQ3JpdGljYWxQYXRoVGFza0VudHJ5W10gPT4ge1xuICBjb25zdCBjcml0aWFsVGFza3M6IE1hcDxudW1iZXIsIENyaXRpY2FsUGF0aFRhc2tFbnRyeT4gPSBuZXcgTWFwKCk7XG5cbiAgYWxsQ3JpdGljYWxQYXRocy5mb3JFYWNoKCh2YWx1ZTogQ3JpdGljYWxQYXRoRW50cnkpID0+IHtcbiAgICB2YWx1ZS50YXNrcy5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgbGV0IHRhc2tFbnRyeSA9IGNyaXRpYWxUYXNrcy5nZXQodGFza0luZGV4KTtcbiAgICAgIGlmICh0YXNrRW50cnkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0YXNrRW50cnkgPSB7XG4gICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgZHVyYXRpb246IHBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5kdXJhdGlvbixcbiAgICAgICAgICBudW1UaW1lc0FwcGVhcmVkOiAwLFxuICAgICAgICB9O1xuICAgICAgICBjcml0aWFsVGFza3Muc2V0KHRhc2tJbmRleCwgdGFza0VudHJ5KTtcbiAgICAgIH1cbiAgICAgIHRhc2tFbnRyeS5udW1UaW1lc0FwcGVhcmVkICs9IHZhbHVlLmNvdW50O1xuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gWy4uLmNyaXRpYWxUYXNrcy52YWx1ZXMoKV0uc29ydChcbiAgICAoYTogQ3JpdGljYWxQYXRoVGFza0VudHJ5LCBiOiBDcml0aWNhbFBhdGhUYXNrRW50cnkpOiBudW1iZXIgPT4ge1xuICAgICAgcmV0dXJuIGIuZHVyYXRpb24gLSBhLmR1cmF0aW9uO1xuICAgIH1cbiAgKTtcbn07XG4iLCAiaW1wb3J0IHtcbiAgRHVwVGFza09wLFxuICBJbnNlcnROZXdFbXB0eU1pbGVzdG9uZUFmdGVyT3AsXG4gIFNldFRhc2tOYW1lT3AsXG4gIFNwbGl0VGFza09wLFxufSBmcm9tIFwiLi4vb3BzL2NoYXJ0XCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wIH0gZnJvbSBcIi4uL29wcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBPcCwgYXBwbHlBbGxPcHNUb1BsYW4gfSBmcm9tIFwiLi4vb3BzL29wc1wiO1xuaW1wb3J0IHtcbiAgQWRkUmVzb3VyY2VPcCxcbiAgQWRkUmVzb3VyY2VPcHRpb25PcCxcbiAgU2V0UmVzb3VyY2VWYWx1ZU9wLFxufSBmcm9tIFwiLi4vb3BzL3Jlc291cmNlc1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW5cIjtcblxuY29uc3QgcGVvcGxlOiBzdHJpbmdbXSA9IFtcIkZyZWRcIiwgXCJCYXJuZXlcIiwgXCJXaWxtYVwiLCBcIkJldHR5XCJdO1xuXG5jb25zdCBEVVJBVElPTiA9IDEwMDtcblxuY29uc3Qgcm5kSW50ID0gKG46IG51bWJlcik6IG51bWJlciA9PiB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuKTtcbn07XG5cbmNvbnN0IHJuZER1cmF0aW9uID0gKCk6IG51bWJlciA9PiB7XG4gIHJldHVybiBybmRJbnQoRFVSQVRJT04pO1xufTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlU3RhcnRlclBsYW4gPSAoKTogUGxhbiA9PiB7XG4gIGNvbnN0IHBsYW4gPSBuZXcgUGxhbigpO1xuICBsZXQgdGFza0lEID0gMDtcblxuICBjb25zdCBvcHM6IE9wW10gPSBbQWRkUmVzb3VyY2VPcChcIlBlcnNvblwiKV07XG5cbiAgcGVvcGxlLmZvckVhY2goKHBlcnNvbjogc3RyaW5nKSA9PiB7XG4gICAgb3BzLnB1c2goQWRkUmVzb3VyY2VPcHRpb25PcChcIlBlcnNvblwiLCBwZXJzb24pKTtcbiAgfSk7XG5cbiAgb3BzLnB1c2goXG4gICAgSW5zZXJ0TmV3RW1wdHlNaWxlc3RvbmVBZnRlck9wKDApLFxuICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCAxMCwgMSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIFwiRnJlZFwiLCAxKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcImxvd1wiLCAxKVxuICApO1xuXG4gIGNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKG9wcywgcGxhbik7XG5cbiAgaWYgKCFyZXMub2spIHtcbiAgICBjb25zb2xlLmxvZyhyZXMuZXJyb3IpO1xuICB9XG4gIHJldHVybiBwbGFuO1xufTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlUmFuZG9tUGxhbiA9ICgpOiBQbGFuID0+IHtcbiAgY29uc3QgcGxhbiA9IG5ldyBQbGFuKCk7XG4gIGxldCB0YXNrSUQgPSAwO1xuXG4gIGNvbnN0IG9wczogT3BbXSA9IFtBZGRSZXNvdXJjZU9wKFwiUGVyc29uXCIpXTtcblxuICBwZW9wbGUuZm9yRWFjaCgocGVyc29uOiBzdHJpbmcpID0+IHtcbiAgICBvcHMucHVzaChBZGRSZXNvdXJjZU9wdGlvbk9wKFwiUGVyc29uXCIsIHBlcnNvbikpO1xuICB9KTtcblxuICBvcHMucHVzaChcbiAgICBJbnNlcnROZXdFbXB0eU1pbGVzdG9uZUFmdGVyT3AoMCksXG4gICAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIHJuZER1cmF0aW9uKCksIDEpLFxuICAgIFNldFRhc2tOYW1lT3AoMSwgcmFuZG9tVGFza05hbWUoKSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIHBlb3BsZVtybmRJbnQocGVvcGxlLmxlbmd0aCldLCAxKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcIm1vZGVyYXRlXCIsIDEpXG4gICk7XG5cbiAgbGV0IG51bVRhc2tzID0gMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNTsgaSsrKSB7XG4gICAgbGV0IGluZGV4ID0gcm5kSW50KG51bVRhc2tzKSArIDE7XG4gICAgb3BzLnB1c2goXG4gICAgICBTcGxpdFRhc2tPcChpbmRleCksXG4gICAgICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgaW5kZXggKyAxKSxcbiAgICAgIFNldFRhc2tOYW1lT3AoaW5kZXggKyAxLCByYW5kb21UYXNrTmFtZSgpKSxcbiAgICAgIFNldFJlc291cmNlVmFsdWVPcChcIlBlcnNvblwiLCBwZW9wbGVbcm5kSW50KHBlb3BsZS5sZW5ndGgpXSwgaW5kZXggKyAxKSxcbiAgICAgIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibW9kZXJhdGVcIiwgaW5kZXggKyAxKVxuICAgICk7XG4gICAgbnVtVGFza3MrKztcbiAgICBpbmRleCA9IHJuZEludChudW1UYXNrcykgKyAxO1xuICAgIG9wcy5wdXNoKFxuICAgICAgRHVwVGFza09wKGluZGV4KSxcbiAgICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCBybmREdXJhdGlvbigpLCBpbmRleCArIDEpLFxuICAgICAgU2V0VGFza05hbWVPcChpbmRleCArIDEsIHJhbmRvbVRhc2tOYW1lKCkpLFxuICAgICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIHBlb3BsZVtybmRJbnQocGVvcGxlLmxlbmd0aCldLCBpbmRleCArIDEpLFxuICAgICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCBpbmRleCArIDEpXG4gICAgKTtcbiAgICBudW1UYXNrcysrO1xuICB9XG5cbiAgY29uc3QgcmVzID0gYXBwbHlBbGxPcHNUb1BsYW4ob3BzLCBwbGFuKTtcblxuICBpZiAoIXJlcy5vaykge1xuICAgIGNvbnNvbGUubG9nKHJlcy5lcnJvcik7XG4gIH1cbiAgcmV0dXJuIHBsYW47XG59O1xuXG5jb25zdCBwYXJ0cyA9IFtcbiAgXCJsb3JlbVwiLFxuICBcImlwc3VtXCIsXG4gIFwiZG9sb3JcIixcbiAgXCJzaXRcIixcbiAgXCJhbWV0XCIsXG4gIFwiY29uc2VjdGV0dXJcIixcbiAgXCJhZGlwaXNjaW5nXCIsXG4gIFwiZWxpdFwiLFxuICBcInNlZFwiLFxuICBcImRvXCIsXG4gIFwiZWl1c21vZFwiLFxuICBcInRlbXBvclwiLFxuICBcImluY2lkaWR1bnRcIixcbiAgXCJ1dFwiLFxuICBcImxhYm9yZVwiLFxuICBcImV0XCIsXG4gIFwiZG9sb3JlXCIsXG4gIFwibWFnbmFcIixcbiAgXCJhbGlxdWFcIixcbiAgXCJ1dFwiLFxuICBcImVuaW1cIixcbiAgXCJhZFwiLFxuICBcIm1pbmltXCIsXG4gIFwidmVuaWFtXCIsXG4gIFwicXVpc1wiLFxuICBcIm5vc3RydWRcIixcbiAgXCJleGVyY2l0YXRpb25cIixcbiAgXCJ1bGxhbWNvXCIsXG4gIFwibGFib3Jpc1wiLFxuICBcIm5pc2lcIixcbiAgXCJ1dFwiLFxuICBcImFsaXF1aXBcIixcbiAgXCJleFwiLFxuICBcImVhXCIsXG4gIFwiY29tbW9kb1wiLFxuICBcImNvbnNlcXVhdFwiLFxuICBcImV1aXNcIixcbiAgXCJhdXRlXCIsXG4gIFwiaXJ1cmVcIixcbiAgXCJkb2xvclwiLFxuICBcImluXCIsXG4gIFwicmVwcmVoZW5kZXJpdFwiLFxuICBcImluXCIsXG4gIFwidm9sdXB0YXRlXCIsXG4gIFwidmVsaXRcIixcbiAgXCJlc3NlXCIsXG4gIFwiY2lsbHVtXCIsXG4gIFwiZG9sb3JlXCIsXG4gIFwiZXVcIixcbiAgXCJmdWdpYXRcIixcbiAgXCJudWxsYVwiLFxuICBcInBhcmlhdHVyXCIsXG4gIFwiZXhjZXB0ZXVyXCIsXG4gIFwic2ludFwiLFxuICBcIm9jY2FlY2F0XCIsXG4gIFwiY3VwaWRhdGF0XCIsXG4gIFwibm9uXCIsXG4gIFwicHJvaWRlbnRcIixcbiAgXCJzdW50XCIsXG4gIFwiaW5cIixcbiAgXCJjdWxwYVwiLFxuICBcInF1aVwiLFxuICBcIm9mZmljaWFcIixcbiAgXCJkZXNlcnVudFwiLFxuICBcIm1vbGxpdFwiLFxuICBcImFuaW1cIixcbiAgXCJpZFwiLFxuICBcImVzdFwiLFxuICBcImxhYm9ydW1cIixcbl07XG5cbmNvbnN0IHBhcnRzTGVuZ3RoID0gcGFydHMubGVuZ3RoO1xuXG5jb25zdCByYW5kb21UYXNrTmFtZSA9ICgpOiBzdHJpbmcgPT5cbiAgYCR7cGFydHNbcm5kSW50KHBhcnRzTGVuZ3RoKV19ICR7cGFydHNbcm5kSW50KHBhcnRzTGVuZ3RoKV19YDtcbiIsICJpbXBvcnQgeyBSZXN1bHQgfSBmcm9tIFwiLi4vcmVzdWx0XCI7XG5cbi8vIERpc3BsYXlzIHRoZSBnaXZlbiBlcnJvci5cbi8vIFRPRE8gLSBNYWtlIHRoaXMgYSBwb3AtdXAgb3Igc29tZXRoaW5nLlxuZXhwb3J0IGNvbnN0IHJlcG9ydEVycm9yID0gKGVycm9yOiBFcnJvcikgPT4ge1xuICBjb25zb2xlLmxvZyhlcnJvcik7XG59O1xuXG4vLyBSZXBvcnRzIHRoZSBlcnJvciBpZiB0aGUgZ2l2ZW4gUmVzdWx0IGlzIG5vdCBvay5cbmV4cG9ydCBjb25zdCByZXBvcnRPbkVycm9yID0gPFQ+KHJldDogUmVzdWx0PFQ+KSA9PiB7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmVwb3J0RXJyb3IocmV0LmVycm9yKTtcbiAgfVxufTtcbiIsICJpbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBGaWx0ZXJGdW5jIH0gZnJvbSBcIi4uL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgZWRnZXNCeVNyY0FuZERzdFRvTWFwIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi4vb3BzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IE9wIH0gZnJvbSBcIi4uL29wcy9vcHMudHNcIjtcbmltcG9ydCB7IFNldFJlc291cmNlVmFsdWVPcCB9IGZyb20gXCIuLi9vcHMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBGcm9tSlNPTiwgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IFByZWNpc2lvbiB9IGZyb20gXCIuLi9wcmVjaXNpb24vcHJlY2lzaW9uLnRzXCI7XG5pbXBvcnQge1xuICBESVZJREVSX01PVkVfRVZFTlQsXG4gIERpdmlkZXJNb3ZlLFxuICBEaXZpZGVyTW92ZVJlc3VsdCxcbn0gZnJvbSBcIi4uL3JlbmRlcmVyL2RpdmlkZXJtb3ZlL2RpdmlkZXJtb3ZlLnRzXCI7XG5pbXBvcnQge1xuICBEUkFHX1JBTkdFX0VWRU5ULFxuICBEcmFnUmFuZ2UsXG4gIE1vdXNlRHJhZyxcbn0gZnJvbSBcIi4uL3JlbmRlcmVyL21vdXNlZHJhZy9tb3VzZWRyYWcudHNcIjtcbmltcG9ydCB7IE1vdXNlTW92ZSB9IGZyb20gXCIuLi9yZW5kZXJlci9tb3VzZW1vdmUvbW91c2Vtb3ZlLnRzXCI7XG5pbXBvcnQgeyBEaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi4vcmVuZGVyZXIvcmFuZ2UvcmFuZ2UudHNcIjtcbmltcG9ydCB7XG4gIFJlbmRlck9wdGlvbnMsXG4gIFJlbmRlclJlc3VsdCxcbiAgVGFza0xhYmVsLFxuICBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MsXG4gIHJlbmRlclRhc2tzVG9DYW52YXMsXG4gIHN1Z2dlc3RlZENhbnZhc0hlaWdodCxcbn0gZnJvbSBcIi4uL3JlbmRlcmVyL3JlbmRlcmVyLnRzXCI7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuLi9yZW5kZXJlci9zY2FsZS9wb2ludC50c1wiO1xuaW1wb3J0IHsgU2NhbGUgfSBmcm9tIFwiLi4vcmVuZGVyZXIvc2NhbGUvc2NhbGUudHNcIjtcbmltcG9ydCB7IFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IENvbXB1dGVTbGFjaywgQ3JpdGljYWxQYXRoLCBTbGFjaywgU3BhbiB9IGZyb20gXCIuLi9zbGFjay9zbGFjay50c1wiO1xuaW1wb3J0IHsgVGhlbWUsIGNvbG9yVGhlbWVGcm9tRWxlbWVudCB9IGZyb20gXCIuLi9zdHlsZS90aGVtZS90aGVtZS50c1wiO1xuaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHtcbiAgQ3JpdGljYWxQYXRoVGFza0VudHJ5LFxuICBjcml0aWNhbFRhc2tGcmVxdWVuY2llcyxcbiAgc2ltdWxhdGlvbixcbn0gZnJvbSBcIi4uL3NpbXVsYXRpb24vc2ltdWxhdGlvbi50c1wiO1xuaW1wb3J0IHtcbiAgZ2VuZXJhdGVSYW5kb21QbGFuLFxuICBnZW5lcmF0ZVN0YXJ0ZXJQbGFuLFxufSBmcm9tIFwiLi4vZ2VuZXJhdGUvZ2VuZXJhdGUudHNcIjtcbmltcG9ydCB7IGV4ZWN1dGUsIGV4ZWN1dGVPcCB9IGZyb20gXCIuLi9hY3Rpb24vZXhlY3V0ZS50c1wiO1xuaW1wb3J0IHsgQWN0aW9uRnJvbU9wIH0gZnJvbSBcIi4uL2FjdGlvbi9hY3Rpb24udHNcIjtcbmltcG9ydCB7IFN0YXJ0S2V5Ym9hcmRIYW5kbGluZyB9IGZyb20gXCIuLi9rZXltYXAva2V5bWFwLnRzXCI7XG5pbXBvcnQge1xuICBEZWxldGVUYXNrT3AsXG4gIFJlbW92ZUVkZ2VPcCxcbiAgUmVtb3ZlRWRnZVN1cE9wLFxuICBTZXRUYXNrTmFtZU9wLFxufSBmcm9tIFwiLi4vb3BzL2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBEZXBlbmRlbmNpZXNQYW5lbCB9IGZyb20gXCIuLi9kZXBlbmRlbmNpZXMvZGVwZW5kZW5jaWVzLXBhbmVsLnRzXCI7XG5pbXBvcnQge1xuICBhbGxQb3RlbnRpYWxTdWNjZXNzb3JzLFxuICBhbGxQb3RlbnRpYWxQcmVkZWNlc3NvcnMsXG4gIGFsbFByZWRlY2Vzc29ycyxcbiAgYWxsU3VjY2Vzc29ycyxcbn0gZnJvbSBcIi4uL2RhZy9hbGdvcml0aG1zL2NpcmN1bGFyLnRzXCI7XG5pbXBvcnQgeyBBY3Rpb25OYW1lcyB9IGZyb20gXCIuLi9hY3Rpb24vcmVnaXN0cnkudHNcIjtcbmltcG9ydCB7XG4gIFNlbGVjdGVkVGFza1BhbmVsLFxuICBUYXNrTWV0cmljVmFsdWVDaGFuZ2VEZXRhaWxzLFxuICBUYXNrTmFtZUNoYW5nZURldGFpbHMsXG4gIFRhc2tSZXNvdXJjZVZhbHVlQ2hhbmdlRGV0YWlscyxcbn0gZnJvbSBcIi4uL3NlbGVjdGVkLXRhc2stcGFuZWwvc2VsZWN0ZWQtdGFzay1wYW5lbC50c1wiO1xuaW1wb3J0IHsgcmVwb3J0T25FcnJvciB9IGZyb20gXCIuLi9yZXBvcnQtZXJyb3IvcmVwb3J0LWVycm9yLnRzXCI7XG5cbmNvbnN0IEZPTlRfU0laRV9QWCA9IDMyO1xuXG5jb25zdCBOVU1fU0lNVUxBVElPTl9MT09QUyA9IDEwMDtcblxuY29uc3QgcHJlY2lzaW9uID0gbmV3IFByZWNpc2lvbigyKTtcblxuaW50ZXJmYWNlIENyaXRpY2FsUGF0aEVudHJ5IHtcbiAgY291bnQ6IG51bWJlcjtcbiAgdGFza3M6IG51bWJlcltdO1xuICBkdXJhdGlvbnM6IG51bWJlcltdO1xufVxuXG5jb25zdCBjcml0aWNhbFBhdGhzVGVtcGxhdGUgPSAoXG4gIGFsbENyaXRpY2FsUGF0aHM6IE1hcDxzdHJpbmcsIENyaXRpY2FsUGF0aEVudHJ5PixcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpblxuKTogVGVtcGxhdGVSZXN1bHQgPT4gaHRtbGBcbiAgPHVsPlxuICAgICR7QXJyYXkuZnJvbShhbGxDcml0aWNhbFBhdGhzLmVudHJpZXMoKSkubWFwKFxuICAgICAgKFtrZXksIHZhbHVlXSkgPT5cbiAgICAgICAgaHRtbGA8bGlcbiAgICAgICAgICBAY2xpY2s9JHsoKSA9PlxuICAgICAgICAgICAgZXhwbGFuTWFpbi5vblBvdGVudGlhbENyaXRpY2lhbFBhdGhDbGljayhrZXksIGFsbENyaXRpY2FsUGF0aHMpfVxuICAgICAgICA+XG4gICAgICAgICAgJHt2YWx1ZS5jb3VudH0gOiAke2tleX1cbiAgICAgICAgPC9saT5gXG4gICAgKX1cbiAgPC91bD5cbmA7XG5cbmNvbnN0IGNyaXRpY2FsVGFza0ZyZXF1ZW5jaWVzVGVtcGxhdGUgPSAoXG4gIHBsYW46IFBsYW4sXG4gIGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmc6IENyaXRpY2FsUGF0aFRhc2tFbnRyeVtdXG4pID0+XG4gIGh0bWxgPHRyPlxuICAgICAgPHRoPk5hbWU8L3RoPlxuICAgICAgPHRoPkR1cmF0aW9uPC90aD5cbiAgICAgIDx0aD5GcmVxdWVuY3kgKCUpPC90aD5cbiAgICA8L3RyPlxuICAgICR7Y3JpdGljYWxUYXNrc0R1cmF0aW9uRGVzY2VuZGluZy5tYXAoXG4gICAgICAodGFza0VudHJ5OiBDcml0aWNhbFBhdGhUYXNrRW50cnkpID0+XG4gICAgICAgIGh0bWxgPHRyPlxuICAgICAgICAgIDx0ZD4ke3BsYW4uY2hhcnQuVmVydGljZXNbdGFza0VudHJ5LnRhc2tJbmRleF0ubmFtZX08L3RkPlxuICAgICAgICAgIDx0ZD4ke3Rhc2tFbnRyeS5kdXJhdGlvbn08L3RkPlxuICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICR7TWF0aC5mbG9vcihcbiAgICAgICAgICAgICAgKDEwMCAqIHRhc2tFbnRyeS5udW1UaW1lc0FwcGVhcmVkKSAvIE5VTV9TSU1VTEFUSU9OX0xPT1BTXG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgIDwvdHI+YFxuICAgICl9IGA7XG5cbmV4cG9ydCBjbGFzcyBFeHBsYW5NYWluIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAvKiogVGhlIFBsYW4gYmVpbmcgZWRpdGVkLiAqL1xuICBwbGFuOiBQbGFuID0gbmV3IFBsYW4oKTtcblxuICAvKiogVGhlIHN0YXJ0IGFuZCBmaW5pc2ggdGltZSBmb3IgZWFjaCBUYXNrIGluIHRoZSBQbGFuLiAqL1xuICBzcGFuczogU3BhbltdID0gW107XG5cbiAgLyoqIFRoZSB0YXNrIGluZGljZXMgb2YgdGFza3Mgb24gdGhlIGNyaXRpY2FsIHBhdGguICovXG4gIGNyaXRpY2FsUGF0aDogbnVtYmVyW10gPSBbXTtcblxuICAvKiogVGhlIHNlbGVjdGlvbiAoaW4gdGltZSkgb2YgdGhlIFBsYW4gY3VycmVudGx5IGJlaW5nIHZpZXdlZC4gKi9cbiAgZGlzcGxheVJhbmdlOiBEaXNwbGF5UmFuZ2UgfCBudWxsID0gbnVsbDtcblxuICAvKiogU2NhbGUgZm9yIHRoZSByYWRhciB2aWV3LCB1c2VkIGZvciBkcmFnIHNlbGVjdGluZyBhIGRpc3BsYXlSYW5nZS4gKi9cbiAgcmFkYXJTY2FsZTogU2NhbGUgfCBudWxsID0gbnVsbDtcblxuICAvKiogQWxsIG9mIHRoZSB0eXBlcyBvZiByZXNvdXJjZXMgaW4gdGhlIHBsYW4uICovXG4gIGdyb3VwQnlPcHRpb25zOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8qKiBXaGljaCBvZiB0aGUgcmVzb3VyY2VzIGFyZSB3ZSBjdXJyZW50bHkgZ3JvdXBpbmcgYnksIHdoZXJlIDAgbWVhbnMgbm9cbiAgICogZ3JvdXBpbmcgaXMgZG9uZS4gKi9cbiAgZ3JvdXBCeU9wdGlvbnNJbmRleDogbnVtYmVyID0gMDtcblxuICAvKiogVGhlIGN1cnJlbnRseSBzZWxlY3RlZCB0YXNrLCBhcyBhbiBpbmRleC4gKi9cbiAgc2VsZWN0ZWRUYXNrOiBudW1iZXIgPSAtMTtcblxuICAvLyBVSSBmZWF0dXJlcyB0aGF0IGNhbiBiZSB0b2dnbGVkIG9uIGFuZCBvZmYuXG4gIHRvcFRpbWVsaW5lOiBib29sZWFuID0gZmFsc2U7XG4gIGNyaXRpY2FsUGF0aHNPbmx5OiBib29sZWFuID0gZmFsc2U7XG4gIGZvY3VzT25UYXNrOiBib29sZWFuID0gZmFsc2U7XG4gIG1vdXNlTW92ZTogTW91c2VNb3ZlIHwgbnVsbCA9IG51bGw7XG5cbiAgZGVwZW5kZW5jaWVzUGFuZWw6IERlcGVuZGVuY2llc1BhbmVsIHwgbnVsbCA9IG51bGw7XG5cbiAgZG93bmxvYWRMaW5rOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gIHNlbGVjdGVkVGFza1BhbmVsOiBTZWxlY3RlZFRhc2tQYW5lbCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBDYWxsYmFjayB0byBjYWxsIHdoZW4gYSBtb3VzZSBtb3ZlcyBvdmVyIHRoZSBjaGFydC4gKi9cbiAgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zOiBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgfCBudWxsID0gbnVsbDtcblxuICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICB0aGlzLmRvd25sb2FkTGluayA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MQW5jaG9yRWxlbWVudD4oXCIjZG93bmxvYWRcIikhO1xuICAgIHRoaXMuZG93bmxvYWRMaW5rLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLnByZXBhcmVEb3dubG9hZCgpO1xuICAgIH0pO1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzUGFuZWwgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJkZXBlbmRlbmNpZXMtcGFuZWxcIikhO1xuXG4gICAgdGhpcy5kZXBlbmRlbmNpZXNQYW5lbCEuYWRkRXZlbnRMaXN0ZW5lcihcImFkZC1kZXBlbmRlbmN5XCIsIGFzeW5jIChlKSA9PiB7XG4gICAgICBsZXQgYWN0aW9uTmFtZTogQWN0aW9uTmFtZXMgPSBcIkFkZFByZWRlY2Vzc29yQWN0aW9uXCI7XG4gICAgICBpZiAoZS5kZXRhaWwuZGVwVHlwZSA9PT0gXCJzdWNjXCIpIHtcbiAgICAgICAgYWN0aW9uTmFtZSA9IFwiQWRkU3VjY2Vzc29yQWN0aW9uXCI7XG4gICAgICB9XG4gICAgICBjb25zdCByZXQgPSBhd2FpdCBleGVjdXRlKGFjdGlvbk5hbWUsIHRoaXMpO1xuICAgICAgaWYgKCFyZXQub2spIHtcbiAgICAgICAgY29uc29sZS5sb2cocmV0LmVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuZGVwZW5kZW5jaWVzUGFuZWwhLmFkZEV2ZW50TGlzdGVuZXIoXCJkZWxldGUtZGVwZW5kZW5jeVwiLCBhc3luYyAoZSkgPT4ge1xuICAgICAgbGV0IFtpLCBqXSA9IFtlLmRldGFpbC50YXNrSW5kZXgsIHRoaXMuc2VsZWN0ZWRUYXNrXTtcbiAgICAgIGlmIChlLmRldGFpbC5kZXBUeXBlID09PSBcInN1Y2NcIikge1xuICAgICAgICBbaSwgal0gPSBbaiwgaV07XG4gICAgICB9XG4gICAgICBjb25zdCBvcCA9IFJlbW92ZUVkZ2VPcChpLCBqKTtcbiAgICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGVPcChvcCwgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIiwgdHJ1ZSwgdGhpcyk7XG4gICAgICBpZiAoIXJldC5vaykge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5zZWxlY3RlZFRhc2tQYW5lbCA9IHRoaXMucXVlcnlTZWxlY3RvcihcInNlbGVjdGVkLXRhc2stcGFuZWxcIikhO1xuICAgIHRoaXMuc2VsZWN0ZWRUYXNrUGFuZWwuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwidGFzay1uYW1lLWNoYW5nZVwiLFxuICAgICAgYXN5bmMgKGU6IEN1c3RvbUV2ZW50PFRhc2tOYW1lQ2hhbmdlRGV0YWlscz4pID0+IHtcbiAgICAgICAgY29uc3Qgb3AgPSBTZXRUYXNrTmFtZU9wKGUuZGV0YWlsLnRhc2tJbmRleCwgZS5kZXRhaWwubmFtZSk7XG4gICAgICAgIHJlcG9ydE9uRXJyb3IoYXdhaXQgZXhlY3V0ZU9wKG9wLCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLCB0cnVlLCB0aGlzKSk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMuc2VsZWN0ZWRUYXNrUGFuZWwuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwidGFzay1yZXNvdXJjZS12YWx1ZS1jaGFuZ2VcIixcbiAgICAgIGFzeW5jIChlOiBDdXN0b21FdmVudDxUYXNrUmVzb3VyY2VWYWx1ZUNoYW5nZURldGFpbHM+KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbmFtZSwgdmFsdWUsIHRhc2tJbmRleCB9ID0gZS5kZXRhaWw7XG4gICAgICAgIGNvbnN0IG9wID0gU2V0UmVzb3VyY2VWYWx1ZU9wKG5hbWUsIHZhbHVlLCB0YXNrSW5kZXgpO1xuICAgICAgICByZXBvcnRPbkVycm9yKGF3YWl0IGV4ZWN1dGVPcChvcCwgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIiwgdHJ1ZSwgdGhpcykpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnNlbGVjdGVkVGFza1BhbmVsLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcInRhc2stbWV0cmljLXZhbHVlLWNoYW5nZVwiLFxuICAgICAgYXN5bmMgKGU6IEN1c3RvbUV2ZW50PFRhc2tNZXRyaWNWYWx1ZUNoYW5nZURldGFpbHM+KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbmFtZSwgdmFsdWUsIHRhc2tJbmRleCB9ID0gZS5kZXRhaWw7XG4gICAgICAgIGNvbnN0IG9wID0gU2V0TWV0cmljVmFsdWVPcChuYW1lLCB2YWx1ZSwgdGFza0luZGV4KTtcbiAgICAgICAgcmVwb3J0T25FcnJvcihhd2FpdCBleGVjdXRlT3Aob3AsIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCIsIHRydWUsIHRoaXMpKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5wbGFuID0gZ2VuZXJhdGVTdGFydGVyUGxhbigpO1xuICAgIHRoaXMucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuXG4gICAgLy8gRHJhZ2dpbmcgb24gdGhlIHJhZGFyLlxuICAgIGNvbnN0IHJhZGFyID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcIiNyYWRhclwiKSE7XG4gICAgbmV3IE1vdXNlRHJhZyhyYWRhcik7XG4gICAgcmFkYXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIERSQUdfUkFOR0VfRVZFTlQsXG4gICAgICB0aGlzLmRyYWdSYW5nZUhhbmRsZXIuYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXG4gICAgKTtcblxuICAgIC8vIERpdmlkZXIgZHJhZ2dpbmcuXG4gICAgY29uc3QgZGl2aWRlciA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCJ2ZXJ0aWNhbC1kaXZpZGVyXCIpITtcbiAgICBuZXcgRGl2aWRlck1vdmUoZG9jdW1lbnQuYm9keSwgZGl2aWRlciwgXCJjb2x1bW5cIik7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoRElWSURFUl9NT1ZFX0VWRU5ULCAoKFxuICAgICAgZTogQ3VzdG9tRXZlbnQ8RGl2aWRlck1vdmVSZXN1bHQ+XG4gICAgKSA9PiB7XG4gICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KFxuICAgICAgICBcImdyaWQtdGVtcGxhdGUtY29sdW1uc1wiLFxuICAgICAgICBgY2FsYygke2UuZGV0YWlsLmJlZm9yZX0lIC0gMTVweCkgMTBweCBhdXRvYFxuICAgICAgKTtcbiAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIH0pIGFzIEV2ZW50TGlzdGVuZXIpO1xuXG4gICAgLy8gQnV0dG9uc1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNyZXNldC16b29tXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgZXhlY3V0ZShcIlJlc2V0Wm9vbUFjdGlvblwiLCB0aGlzKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNkYXJrLW1vZGUtdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgZXhlY3V0ZShcIlRvZ2dsZURhcmtNb2RlQWN0aW9uXCIsIHRoaXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3JhZGFyLXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIGV4ZWN1dGUoXCJUb2dnbGVSYWRhckFjdGlvblwiLCB0aGlzKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiN0b3AtdGltZWxpbmUtdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJjbGlja1wiLFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnRvcFRpbWVsaW5lID0gIXRoaXMudG9wVGltZWxpbmU7XG4gICAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZ3JvdXAtYnktdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy50b2dnbGVHcm91cEJ5KCk7XG4gICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNjcml0aWNhbC1wYXRocy10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcImNsaWNrXCIsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMudG9nZ2xlQ3JpdGljYWxQYXRoc09ubHkoKTtcbiAgICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IG92ZXJsYXlDYW52YXMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTENhbnZhc0VsZW1lbnQ+KFwiI292ZXJsYXlcIikhO1xuICAgIHRoaXMubW91c2VNb3ZlID0gbmV3IE1vdXNlTW92ZShvdmVybGF5Q2FudmFzKTtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG5cbiAgICBvdmVybGF5Q2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHAgPSBuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICAgICAgaWYgKHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRUYXNrID1cbiAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyhwLCBcIm1vdXNlZG93blwiKSB8fCAtMTtcbiAgICAgICAgdGhpcy51cGRhdGVUYXNrUGFuZWxzKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIG92ZXJsYXlDYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBwID0gbmV3IFBvaW50KGUub2Zmc2V0WCwgZS5vZmZzZXRZKTtcbiAgICAgIGlmICh0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnNldEZvY3VzT25UYXNrKFxuICAgICAgICAgIHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zKHAsIFwibW91c2Vkb3duXCIpIHx8IC0xXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnVwZGF0ZVRhc2tQYW5lbHModGhpcy5zZWxlY3RlZFRhc2spO1xuXG4gICAgLy8gUmVhY3QgdG8gdGhlIHVwbG9hZCBpbnB1dC5cbiAgICBjb25zdCBmaWxlVXBsb2FkID1cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTElucHV0RWxlbWVudD4oXCIjZmlsZS11cGxvYWRcIikhO1xuICAgIGZpbGVVcGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBqc29uID0gYXdhaXQgZmlsZVVwbG9hZC5maWxlcyFbMF0udGV4dCgpO1xuICAgICAgY29uc3QgcmV0ID0gRnJvbUpTT04oanNvbik7XG4gICAgICBpZiAoIXJldC5vaykge1xuICAgICAgICB0aHJvdyByZXQuZXJyb3I7XG4gICAgICB9XG4gICAgICB0aGlzLnBsYW4gPSByZXQudmFsdWU7XG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3NpbXVsYXRlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5zaW11bGF0ZSgpO1xuICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZm9jdXMtb24tc2VsZWN0ZWQtdGFza1wiKSEuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGVGb2N1c09uVGFzaygpO1xuICAgICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2dlbi1yYW5kb20tcGxhblwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucGxhbiA9IGdlbmVyYXRlUmFuZG9tUGxhbigpO1xuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMucGFpbnRDaGFydC5iaW5kKHRoaXMpKTtcbiAgICBTdGFydEtleWJvYXJkSGFuZGxpbmcodGhpcyk7XG4gIH1cblxuICBwcmVwYXJlRG93bmxvYWQoKSB7XG4gICAgY29uc3QgZG93bmxvYWRCbG9iID0gbmV3IEJsb2IoW0pTT04uc3RyaW5naWZ5KHRoaXMucGxhbiwgbnVsbCwgXCIgIFwiKV0sIHtcbiAgICAgIHR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgIH0pO1xuICAgIHRoaXMuZG93bmxvYWRMaW5rIS5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChkb3dubG9hZEJsb2IpO1xuICB9XG5cbiAgdXBkYXRlVGFza1BhbmVscyh0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuc2VsZWN0ZWRUYXNrID0gdGFza0luZGV4O1xuICAgIHRoaXMuc2VsZWN0ZWRUYXNrUGFuZWwhLnVwZGF0ZVNlbGVjdGVkVGFza1BhbmVsKFxuICAgICAgdGhpcy5wbGFuLFxuICAgICAgdGhpcy5zZWxlY3RlZFRhc2tcbiAgICApO1xuICAgIGNvbnN0IGVkZ2VzID0gZWRnZXNCeVNyY0FuZERzdFRvTWFwKHRoaXMucGxhbi5jaGFydC5FZGdlcyk7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXNQYW5lbCEuc2V0VGFza3NBbmRJbmRpY2VzKFxuICAgICAgdGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzLFxuICAgICAgKGVkZ2VzLmJ5RHN0LmdldCh0YXNrSW5kZXgpIHx8IFtdKS5tYXAoKGU6IERpcmVjdGVkRWRnZSkgPT4gZS5pKSxcbiAgICAgIChlZGdlcy5ieVNyYy5nZXQodGFza0luZGV4KSB8fCBbXSkubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUuailcbiAgICApO1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzUGFuZWwhLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICBcImhpZGRlblwiLFxuICAgICAgdGhpcy5zZWxlY3RlZFRhc2sgPT09IC0xXG4gICAgKTtcbiAgfVxuXG4gIHNldEZvY3VzT25UYXNrKGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnNlbGVjdGVkVGFzayA9IGluZGV4O1xuICAgIHRoaXMuZm9yY2VGb2N1c09uVGFzaygpO1xuICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIHRoaXMudXBkYXRlVGFza1BhbmVscyh0aGlzLnNlbGVjdGVkVGFzayk7XG4gIH1cblxuICBhc3luYyBkZWxldGVUYXNrKHRhc2tJbmRleDogbnVtYmVyKTogUHJvbWlzZTxSZXN1bHQ8bnVsbD4+IHtcbiAgICBjb25zdCBvcCA9IERlbGV0ZVRhc2tPcCh0YXNrSW5kZXgpO1xuICAgIHJldHVybiBhd2FpdCBleGVjdXRlT3Aob3AsIFwicGFpbnRDaGFydFwiLCB0cnVlLCB0aGlzKTtcbiAgfVxuXG4gIC8vIFRPRE8gLSBUdXJuIHRoaXMgb24gYW5kIG9mZiBiYXNlZCBvbiBtb3VzZSBlbnRlcmluZyB0aGUgY2FudmFzIGFyZWEuXG4gIG9uTW91c2VNb3ZlKCkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5tb3VzZU1vdmUhLnJlYWRMb2NhdGlvbigpO1xuICAgIGlmIChsb2NhdGlvbiAhPT0gbnVsbCAmJiB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MobG9jYXRpb24sIFwibW91c2Vtb3ZlXCIpO1xuICAgIH1cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBwbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCkge1xuICAgIHRoaXMucmFkYXJTY2FsZSA9IG51bGw7XG4gICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuZ3JvdXBCeU9wdGlvbnMgPSBbXCJcIiwgLi4uT2JqZWN0LmtleXModGhpcy5wbGFuLnJlc291cmNlRGVmaW5pdGlvbnMpXTtcbiAgICB0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXggPSAwO1xuICAgIHRoaXMucmVjYWxjdWxhdGVTcGFuc0FuZENyaXRpY2FsUGF0aCgpO1xuICB9XG5cbiAgcmVjYWxjdWxhdGVTcGFuc0FuZENyaXRpY2FsUGF0aCgpIHtcbiAgICBsZXQgc2xhY2tzOiBTbGFja1tdID0gW107XG5cbiAgICBjb25zdCBzbGFja1Jlc3VsdCA9IENvbXB1dGVTbGFjayhcbiAgICAgIHRoaXMucGxhbi5jaGFydCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHByZWNpc2lvbi5yb3VuZGVyKClcbiAgICApO1xuICAgIGlmICghc2xhY2tSZXN1bHQub2spIHtcbiAgICAgIGNvbnNvbGUuZXJyb3Ioc2xhY2tSZXN1bHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzbGFja3MgPSBzbGFja1Jlc3VsdC52YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLnNwYW5zID0gc2xhY2tzLm1hcCgodmFsdWU6IFNsYWNrKTogU3BhbiA9PiB7XG4gICAgICByZXR1cm4gdmFsdWUuZWFybHk7XG4gICAgfSk7XG4gICAgdGhpcy5jcml0aWNhbFBhdGggPSBDcml0aWNhbFBhdGgoc2xhY2tzLCBwcmVjaXNpb24ucm91bmRlcigpKTtcbiAgICB0aGlzLnVwZGF0ZVRhc2tQYW5lbHModGhpcy5zZWxlY3RlZFRhc2spO1xuICB9XG5cbiAgZ2V0VGFza0xhYmVsbGVyKCk6IFRhc2tMYWJlbCB7XG4gICAgcmV0dXJuICh0YXNrSW5kZXg6IG51bWJlcik6IHN0cmluZyA9PlxuICAgICAgYCR7dGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0ubmFtZX1gO1xuICB9XG5cbiAgZHJhZ1JhbmdlSGFuZGxlcihlOiBDdXN0b21FdmVudDxEcmFnUmFuZ2U+KSB7XG4gICAgaWYgKHRoaXMucmFkYXJTY2FsZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBiZWdpbiA9IHRoaXMucmFkYXJTY2FsZS5kYXlSb3dGcm9tUG9pbnQoZS5kZXRhaWwuYmVnaW4pO1xuICAgIGNvbnN0IGVuZCA9IHRoaXMucmFkYXJTY2FsZS5kYXlSb3dGcm9tUG9pbnQoZS5kZXRhaWwuZW5kKTtcbiAgICB0aGlzLmRpc3BsYXlSYW5nZSA9IG5ldyBEaXNwbGF5UmFuZ2UoYmVnaW4uZGF5LCBlbmQuZGF5KTtcbiAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgfVxuXG4gIHRvZ2dsZVJhZGFyKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcInJhZGFyLXBhcmVudFwiKSEuY2xhc3NMaXN0LnRvZ2dsZShcImhpZGRlblwiKTtcbiAgfVxuXG4gIHRvZ2dsZUdyb3VwQnkoKSB7XG4gICAgdGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4ID1cbiAgICAgICh0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXggKyAxKSAlIHRoaXMuZ3JvdXBCeU9wdGlvbnMubGVuZ3RoO1xuICB9XG5cbiAgdG9nZ2xlQ3JpdGljYWxQYXRoc09ubHkoKSB7XG4gICAgdGhpcy5jcml0aWNhbFBhdGhzT25seSA9ICF0aGlzLmNyaXRpY2FsUGF0aHNPbmx5O1xuICB9XG5cbiAgdG9nZ2xlRm9jdXNPblRhc2soKSB7XG4gICAgdGhpcy5mb2N1c09uVGFzayA9ICF0aGlzLmZvY3VzT25UYXNrO1xuICAgIGlmICghdGhpcy5mb2N1c09uVGFzaykge1xuICAgICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGZvcmNlRm9jdXNPblRhc2soKSB7XG4gICAgdGhpcy5mb2N1c09uVGFzayA9IHRydWU7XG4gIH1cblxuICBwYWludENoYXJ0KCkge1xuICAgIGNvbnNvbGUudGltZShcInBhaW50Q2hhcnRcIik7XG5cbiAgICBjb25zdCB0aGVtZUNvbG9yczogVGhlbWUgPSBjb2xvclRoZW1lRnJvbUVsZW1lbnQoZG9jdW1lbnQuYm9keSk7XG5cbiAgICBsZXQgZmlsdGVyRnVuYzogRmlsdGVyRnVuYyB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IHN0YXJ0QW5kRmluaXNoID0gWzAsIHRoaXMucGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxXTtcbiAgICBpZiAodGhpcy5jcml0aWNhbFBhdGhzT25seSkge1xuICAgICAgY29uc3QgaGlnaGxpZ2h0U2V0ID0gbmV3IFNldCh0aGlzLmNyaXRpY2FsUGF0aCk7XG4gICAgICBmaWx0ZXJGdW5jID0gKHRhc2s6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGlmIChzdGFydEFuZEZpbmlzaC5pbmNsdWRlcyh0YXNrSW5kZXgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhpZ2hsaWdodFNldC5oYXModGFza0luZGV4KTtcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0aGlzLmZvY3VzT25UYXNrICYmIHRoaXMuc2VsZWN0ZWRUYXNrICE9IC0xKSB7XG4gICAgICAvLyBGaW5kIGFsbCBwcmVkZWNlc3NvciBhbmQgc3VjY2Vzc29ycyBvZiB0aGUgZ2l2ZW4gdGFzay5cbiAgICAgIGNvbnN0IG5laWdoYm9yU2V0ID0gbmV3IFNldCgpO1xuICAgICAgbmVpZ2hib3JTZXQuYWRkKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgICAgIGxldCBlYXJsaWVzdFN0YXJ0ID0gdGhpcy5zcGFuc1t0aGlzLnNlbGVjdGVkVGFza10uc3RhcnQ7XG4gICAgICBsZXQgbGF0ZXN0RmluaXNoID0gdGhpcy5zcGFuc1t0aGlzLnNlbGVjdGVkVGFza10uZmluaXNoO1xuICAgICAgdGhpcy5wbGFuLmNoYXJ0LkVkZ2VzLmZvckVhY2goKGVkZ2U6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLnNlbGVjdGVkVGFzaykge1xuICAgICAgICAgIG5laWdoYm9yU2V0LmFkZChlZGdlLmopO1xuICAgICAgICAgIGlmIChsYXRlc3RGaW5pc2ggPCB0aGlzLnNwYW5zW2VkZ2Uual0uZmluaXNoKSB7XG4gICAgICAgICAgICBsYXRlc3RGaW5pc2ggPSB0aGlzLnNwYW5zW2VkZ2Uual0uZmluaXNoO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZWRnZS5qID09PSB0aGlzLnNlbGVjdGVkVGFzaykge1xuICAgICAgICAgIG5laWdoYm9yU2V0LmFkZChlZGdlLmkpO1xuICAgICAgICAgIGlmIChlYXJsaWVzdFN0YXJ0ID4gdGhpcy5zcGFuc1tlZGdlLmldLnN0YXJ0KSB7XG4gICAgICAgICAgICBlYXJsaWVzdFN0YXJ0ID0gdGhpcy5zcGFuc1tlZGdlLmldLnN0YXJ0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvLyBUT0RPIC0gU2luY2Ugd2Ugb3ZlcndyaXRlIGRpc3BsYXlSYW5nZSB0aGF0IG1lYW5zIGRyYWdnaW5nIG9uIHRoZSByYWRhclxuICAgICAgLy8gd2lsbCBub3Qgd29yayB3aGVuIGZvY3VzaW5nIG9uIGEgc2VsZWN0ZWQgdGFzay4gQnVnIG9yIGZlYXR1cmU/XG4gICAgICB0aGlzLmRpc3BsYXlSYW5nZSA9IG5ldyBEaXNwbGF5UmFuZ2UoZWFybGllc3RTdGFydCAtIDEsIGxhdGVzdEZpbmlzaCArIDEpO1xuXG4gICAgICBmaWx0ZXJGdW5jID0gKHRhc2s6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGlmIChzdGFydEFuZEZpbmlzaC5pbmNsdWRlcyh0YXNrSW5kZXgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmVpZ2hib3JTZXQuaGFzKHRhc2tJbmRleCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHJhZGFyT3B0czogUmVuZGVyT3B0aW9ucyA9IHtcbiAgICAgIGZvbnRTaXplUHg6IDYsXG4gICAgICBoYXNUZXh0OiBmYWxzZSxcbiAgICAgIGRpc3BsYXlSYW5nZTogdGhpcy5kaXNwbGF5UmFuZ2UsXG4gICAgICBkaXNwbGF5UmFuZ2VVc2FnZTogXCJoaWdobGlnaHRcIixcbiAgICAgIGNvbG9yczoge1xuICAgICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlTXV0ZWQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZU11dGVkLFxuICAgICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgICAgZ3JvdXBDb2xvcjogdGhlbWVDb2xvcnMuZ3JvdXBDb2xvcixcbiAgICAgICAgaGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5oaWdobGlnaHQsXG4gICAgICB9LFxuICAgICAgaGFzVGltZWxpbmU6IGZhbHNlLFxuICAgICAgaGFzVGFza3M6IHRydWUsXG4gICAgICBoYXNFZGdlczogZmFsc2UsXG4gICAgICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiBmYWxzZSxcbiAgICAgIHRhc2tMYWJlbDogdGhpcy5nZXRUYXNrTGFiZWxsZXIoKSxcbiAgICAgIHRhc2tFbXBoYXNpemU6IHRoaXMuY3JpdGljYWxQYXRoLFxuICAgICAgZmlsdGVyRnVuYzogbnVsbCxcbiAgICAgIGdyb3VwQnlSZXNvdXJjZTogdGhpcy5ncm91cEJ5T3B0aW9uc1t0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXhdLFxuICAgICAgaGlnaGxpZ2h0ZWRUYXNrOiBudWxsLFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXg6IHRoaXMuc2VsZWN0ZWRUYXNrLFxuICAgIH07XG5cbiAgICBjb25zdCB6b29tT3B0czogUmVuZGVyT3B0aW9ucyA9IHtcbiAgICAgIGZvbnRTaXplUHg6IEZPTlRfU0laRV9QWCxcbiAgICAgIGhhc1RleHQ6IHRydWUsXG4gICAgICBkaXNwbGF5UmFuZ2U6IHRoaXMuZGlzcGxheVJhbmdlLFxuICAgICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwicmVzdHJpY3RcIixcbiAgICAgIGNvbG9yczoge1xuICAgICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlTXV0ZWQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZU11dGVkLFxuICAgICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgICAgZ3JvdXBDb2xvcjogdGhlbWVDb2xvcnMuZ3JvdXBDb2xvcixcbiAgICAgICAgaGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5oaWdobGlnaHQsXG4gICAgICB9LFxuICAgICAgaGFzVGltZWxpbmU6IHRoaXMudG9wVGltZWxpbmUsXG4gICAgICBoYXNUYXNrczogdHJ1ZSxcbiAgICAgIGhhc0VkZ2VzOiB0cnVlLFxuICAgICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogdHJ1ZSxcbiAgICAgIHRhc2tMYWJlbDogdGhpcy5nZXRUYXNrTGFiZWxsZXIoKSxcbiAgICAgIHRhc2tFbXBoYXNpemU6IHRoaXMuY3JpdGljYWxQYXRoLFxuICAgICAgZmlsdGVyRnVuYzogZmlsdGVyRnVuYyxcbiAgICAgIGdyb3VwQnlSZXNvdXJjZTogdGhpcy5ncm91cEJ5T3B0aW9uc1t0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXhdLFxuICAgICAgaGlnaGxpZ2h0ZWRUYXNrOiAxLFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXg6IHRoaXMuc2VsZWN0ZWRUYXNrLFxuICAgIH07XG5cbiAgICBjb25zdCB0aW1lbGluZU9wdHM6IFJlbmRlck9wdGlvbnMgPSB7XG4gICAgICBmb250U2l6ZVB4OiBGT05UX1NJWkVfUFgsXG4gICAgICBoYXNUZXh0OiB0cnVlLFxuICAgICAgZGlzcGxheVJhbmdlOiB0aGlzLmRpc3BsYXlSYW5nZSxcbiAgICAgIGRpc3BsYXlSYW5nZVVzYWdlOiBcInJlc3RyaWN0XCIsXG4gICAgICBjb2xvcnM6IHtcbiAgICAgICAgc3VyZmFjZTogdGhlbWVDb2xvcnMuc3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlOiB0aGVtZUNvbG9ycy5vblN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZU11dGVkOiB0aGVtZUNvbG9ycy5vblN1cmZhY2VNdXRlZCxcbiAgICAgICAgb25TdXJmYWNlSGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5vblN1cmZhY2VTZWNvbmRhcnksXG4gICAgICAgIG92ZXJsYXk6IHRoZW1lQ29sb3JzLm92ZXJsYXksXG4gICAgICAgIGdyb3VwQ29sb3I6IHRoZW1lQ29sb3JzLmdyb3VwQ29sb3IsXG4gICAgICAgIGhpZ2hsaWdodDogdGhlbWVDb2xvcnMuaGlnaGxpZ2h0LFxuICAgICAgfSxcbiAgICAgIGhhc1RpbWVsaW5lOiB0cnVlLFxuICAgICAgaGFzVGFza3M6IGZhbHNlLFxuICAgICAgaGFzRWRnZXM6IHRydWUsXG4gICAgICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiB0cnVlLFxuICAgICAgdGFza0xhYmVsOiB0aGlzLmdldFRhc2tMYWJlbGxlcigpLFxuICAgICAgdGFza0VtcGhhc2l6ZTogdGhpcy5jcml0aWNhbFBhdGgsXG4gICAgICBmaWx0ZXJGdW5jOiBmaWx0ZXJGdW5jLFxuICAgICAgZ3JvdXBCeVJlc291cmNlOiB0aGlzLmdyb3VwQnlPcHRpb25zW3RoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gICAgICBoaWdobGlnaHRlZFRhc2s6IG51bGwsXG4gICAgICBzZWxlY3RlZFRhc2tJbmRleDogdGhpcy5zZWxlY3RlZFRhc2ssXG4gICAgfTtcblxuICAgIGNvbnN0IHJldCA9IHRoaXMucGFpbnRPbmVDaGFydChcIiNyYWRhclwiLCByYWRhck9wdHMpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucmFkYXJTY2FsZSA9IHJldC52YWx1ZS5zY2FsZTtcblxuICAgIHRoaXMucGFpbnRPbmVDaGFydChcIiN0aW1lbGluZVwiLCB0aW1lbGluZU9wdHMpO1xuICAgIGNvbnN0IHpvb21SZXQgPSB0aGlzLnBhaW50T25lQ2hhcnQoXCIjem9vbWVkXCIsIHpvb21PcHRzLCBcIiNvdmVybGF5XCIpO1xuICAgIGlmICh6b29tUmV0Lm9rKSB7XG4gICAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyA9XG4gICAgICAgIHpvb21SZXQudmFsdWUudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zO1xuICAgICAgaWYgKHpvb21SZXQudmFsdWUuc2VsZWN0ZWRUYXNrTG9jYXRpb24gIT09IG51bGwpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImNoYXJ0LXBhcmVudFwiKSEuc2Nyb2xsKHtcbiAgICAgICAgICB0b3A6IHpvb21SZXQudmFsdWUuc2VsZWN0ZWRUYXNrTG9jYXRpb24ueSxcbiAgICAgICAgICBiZWhhdmlvcjogXCJzbW9vdGhcIixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS50aW1lRW5kKFwicGFpbnRDaGFydFwiKTtcbiAgfVxuXG4gIHByZXBhcmVDYW52YXMoXG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcbiAgICBjYW52YXNXaWR0aDogbnVtYmVyLFxuICAgIGNhbnZhc0hlaWdodDogbnVtYmVyLFxuICAgIHdpZHRoOiBudW1iZXIsXG4gICAgaGVpZ2h0OiBudW1iZXJcbiAgKTogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHtcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXNXaWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0O1xuICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcblxuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikhO1xuICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcblxuICAgIHJldHVybiBjdHg7XG4gIH1cblxuICBwYWludE9uZUNoYXJ0KFxuICAgIGNhbnZhc0lEOiBzdHJpbmcsXG4gICAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgICBvdmVybGF5SUQ6IHN0cmluZyA9IFwiXCJcbiAgKTogUmVzdWx0PFJlbmRlclJlc3VsdD4ge1xuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MQ2FudmFzRWxlbWVudD4oY2FudmFzSUQpITtcbiAgICBjb25zdCBwYXJlbnQgPSBjYW52YXMhLnBhcmVudEVsZW1lbnQhO1xuICAgIGNvbnN0IHJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgY29uc3Qgd2lkdGggPSBwYXJlbnQuY2xpZW50V2lkdGggLSBGT05UX1NJWkVfUFg7XG4gICAgbGV0IGhlaWdodCA9IHBhcmVudC5jbGllbnRIZWlnaHQ7XG4gICAgY29uc3QgY2FudmFzV2lkdGggPSBNYXRoLmNlaWwod2lkdGggKiByYXRpbyk7XG4gICAgbGV0IGNhbnZhc0hlaWdodCA9IE1hdGguY2VpbChoZWlnaHQgKiByYXRpbyk7XG5cbiAgICBjb25zdCBuZXdIZWlnaHQgPSBzdWdnZXN0ZWRDYW52YXNIZWlnaHQoXG4gICAgICBjYW52YXMsXG4gICAgICB0aGlzLnNwYW5zLFxuICAgICAgb3B0cyxcbiAgICAgIHRoaXMucGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggKyAyIC8vIFRPRE8gLSBXaHkgZG8gd2UgbmVlZCB0aGUgKzIgaGVyZSE/XG4gICAgKTtcbiAgICBjYW52YXNIZWlnaHQgPSBuZXdIZWlnaHQ7XG4gICAgaGVpZ2h0ID0gbmV3SGVpZ2h0IC8gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG5cbiAgICBsZXQgb3ZlcmxheTogSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBpZiAob3ZlcmxheUlEKSB7XG4gICAgICBvdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MQ2FudmFzRWxlbWVudD4ob3ZlcmxheUlEKSE7XG4gICAgICB0aGlzLnByZXBhcmVDYW52YXMob3ZlcmxheSwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCwgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuICAgIGNvbnN0IGN0eCA9IHRoaXMucHJlcGFyZUNhbnZhcyhcbiAgICAgIGNhbnZhcyxcbiAgICAgIGNhbnZhc1dpZHRoLFxuICAgICAgY2FudmFzSGVpZ2h0LFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHRcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlbmRlclRhc2tzVG9DYW52YXMoXG4gICAgICBwYXJlbnQsXG4gICAgICBjYW52YXMsXG4gICAgICBjdHgsXG4gICAgICB0aGlzLnBsYW4sXG4gICAgICB0aGlzLnNwYW5zLFxuICAgICAgb3B0cyxcbiAgICAgIG92ZXJsYXlcbiAgICApO1xuICB9XG5cbiAgb25Qb3RlbnRpYWxDcml0aWNpYWxQYXRoQ2xpY2soXG4gICAga2V5OiBzdHJpbmcsXG4gICAgYWxsQ3JpdGljYWxQYXRoczogTWFwPHN0cmluZywgQ3JpdGljYWxQYXRoRW50cnk+XG4gICkge1xuICAgIGNvbnN0IGNyaXRpY2FsUGF0aEVudHJ5ID0gYWxsQ3JpdGljYWxQYXRocy5nZXQoa2V5KSE7XG4gICAgY3JpdGljYWxQYXRoRW50cnkuZHVyYXRpb25zLmZvckVhY2goXG4gICAgICAoZHVyYXRpb246IG51bWJlciwgdGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgdGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMucmVjYWxjdWxhdGVTcGFuc0FuZENyaXRpY2FsUGF0aCgpO1xuICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICB9XG5cbiAgc2ltdWxhdGUoKSB7XG4gICAgLy8gUnVuIHRoZSBzaW11bGF0aW9uLlxuICAgIGNvbnN0IGFsbENyaXRpY2FsUGF0aHMgPSBzaW11bGF0aW9uKHRoaXMucGxhbiwgTlVNX1NJTVVMQVRJT05fTE9PUFMpO1xuXG4gICAgLy8gRGlzcGxheSBhbGwgdGhlIHBvdGVudGlhbCBjcml0aWNhbCBwYXRocyBmb3VuZC5cbiAgICByZW5kZXIoXG4gICAgICBjcml0aWNhbFBhdGhzVGVtcGxhdGUoYWxsQ3JpdGljYWxQYXRocywgdGhpcyksXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcIiNjcml0aWNhbFBhdGhzXCIpIVxuICAgICk7XG5cbiAgICAvLyBGaW5kIGhvdyBvZnRlbiBlYWNoIHRhc2sgYXBwZWFycyBvbiBhbGwgdGhlIHBvdGVudGlhbCBjcml0aWNhbCBwYXRoLlxuICAgIGNvbnN0IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcgPSBjcml0aWNhbFRhc2tGcmVxdWVuY2llcyhcbiAgICAgIGFsbENyaXRpY2FsUGF0aHMsXG4gICAgICB0aGlzLnBsYW5cbiAgICApO1xuXG4gICAgLy8gRGlzcGxheSBhIHRhYmxlIG9mIHRhc2tzIG9uIGFsbCBwb3RlbnRpYWwgY3JpdGljYWwgcGF0aHMuXG4gICAgcmVuZGVyKFxuICAgICAgY3JpdGljYWxUYXNrRnJlcXVlbmNpZXNUZW1wbGF0ZShcbiAgICAgICAgdGhpcy5wbGFuLFxuICAgICAgICBjcml0aWNhbFRhc2tzRHVyYXRpb25EZXNjZW5kaW5nXG4gICAgICApLFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCIjY3JpdGljYWxUYXNrc1wiKSFcbiAgICApO1xuXG4gICAgLy8gUmVzZXQgdGhlIHNwYW5zIHVzaW5nIHRoZSBvcmlnaW5hbCBkdXJhdGlvbnMuXG4gICAgdGhpcy5yZWNhbGN1bGF0ZVNwYW5zQW5kQ3JpdGljYWxQYXRoKCk7XG5cbiAgICAvLyBIaWdobGlnaHQgYWxsIHRoZSB0YXNrcyB0aGF0IGNvdWxkIGFwcGVhciBvbiB0aGUgY3JpdGljYWwgcGF0aC5cbiAgICB0aGlzLmNyaXRpY2FsUGF0aCA9IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcubWFwKFxuICAgICAgKHRhc2tFbnRyeTogQ3JpdGljYWxQYXRoVGFza0VudHJ5KSA9PiB0YXNrRW50cnkudGFza0luZGV4XG4gICAgKTtcbiAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50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VUFBTSxNQUFNLGtCQUFrQixLQUFLLElBQUk7QUFFdkMsUUFBSSxDQUFDLElBQUksSUFBSTtBQUNYLGNBQVEsSUFBSSxJQUFJLEtBQUs7QUFBQSxJQUN2QjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBRUEsTUFBTSxRQUFRO0FBQUEsSUFDWjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUVBLE1BQU0sY0FBYyxNQUFNO0FBRTFCLE1BQU0saUJBQWlCLE1BQ3JCLEdBQUcsTUFBTUEsUUFBTyxXQUFXLENBQUMsQ0FBQyxJ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UUFDRSxzQkFBc0Isa0JBQWtCLElBQUk7QUFBQSxRQUM1QyxTQUFTLGNBQTJCLGdCQUFnQjtBQUFBLE1BQ3REO0FBR0EsWUFBTSxrQ0FBa0M7QUFBQSxRQUN0QztBQUFBLFFBQ0EsS0FBSztBQUFBLE1BQ1A7QUFHQTtBQUFBLFFBQ0U7QUFBQSxVQUNFLEtBQUs7QUFBQSxVQUNMO0FBQUEsUUFDRjtBQUFBLFFBQ0EsU0FBUyxjQUEyQixnQkFBZ0I7QUFBQSxNQUN0RDtBQUdBLFdBQUssZ0NBQWdDO0FBR3JDLFdBQUssZUFBZSxnQ0FBZ0M7QUFBQSxRQUNsRCxDQUFDLGNBQXFDLFVBQVU7QUFBQSxNQUNsRDtBQUNBLFdBQUssV0FBVztBQUFBLElBQ2xCO0FBQUEsRUFDRjtBQUVBLGlCQUFlLE9BQU8sZUFBZSxVQUFVOyIsCiAgIm5hbWVzIjogWyJfIiwgInJlc3VsdCIsICJpIiwgImhpZ2hsaWdodCIsICJwYXJ0cyIsICJSZXN1bHQiLCAiYSIsICJiIiwgInMiLCAic2NvcmUiLCAiaiIsICJ4IiwgInIiLCAiZSIsICJvIiwgInYiLCAiYyIsICJmIiwgImdsb2JhbCIsICJnbG9iYWxUaGlzIiwgInRydXN0ZWRUeXBlcyIsICJwb2xpY3kiLCAiY3JlYXRlUG9saWN5IiwgImNyZWF0ZUhUTUwiLCAicyIsICJib3VuZEF0dHJpYnV0ZVN1ZmZpeCIsICJtYXJrZXIiLCAiTWF0aCIsICJyYW5kb20iLCAidG9GaXhlZCIsICJzbGljZSIsICJtYXJrZXJNYXRjaCIsICJub2RlTWFya2VyIiwgImQiLCAiZG9jdW1lbnQiLCAiY3JlYXRlTWFya2VyIiwgImNyZWF0ZUNvbW1lbnQiLCAiaXNQcmltaXRpdmUiLCAidmFsdWUiLCAiaXNBcnJheSIsICJBcnJheSIsICJpc0l0ZXJhYmxlIiwgIlN5bWJvbCIsICJpdGVyYXRvciIsICJTUEFDRV9DSEFSIiwgInRleHRFbmRSZWdleCIsICJjb21tZW50RW5kUmVnZXgiLCAiY29tbWVudDJFbmRSZWdleCIsICJ0YWdFbmRSZWdleCIsICJSZWdFeHAiLCAic2luZ2xlUXVvdGVBdHRyRW5kUmVnZXgiLCAiZG91YmxlUXVvdGVBdHRyRW5kUmVnZXgiLCAicmF3VGV4dEVsZW1lbnQiLCAidGFnIiwgInR5cGUiLCAic3RyaW5ncyIsICJ2YWx1ZXMiLCAiXyRsaXRUeXBlJCIsICJodG1sIiwgInN2ZyIsICJtYXRobWwiLCAibm9DaGFuZ2UiLCAiZm9yIiwgIm5vdGhpbmciLCAidGVtcGxhdGVDYWNoZSIsICJXZWFrTWFwIiwgIndhbGtlciIsICJjcmVhdGVUcmVlV2Fsa2VyIiwgInRydXN0RnJvbVRlbXBsYXRlU3RyaW5nIiwgInRzYSIsICJzdHJpbmdGcm9tVFNBIiwgImhhc093blByb3BlcnR5IiwgIkVycm9yIiwgImdldFRlbXBsYXRlSHRtbCIsICJsIiwgImxlbmd0aCIsICJhdHRyTmFtZXMiLCAicmF3VGV4dEVuZFJlZ2V4IiwgInJlZ2V4IiwgImkiLCAiYXR0ck5hbWUiLCAibWF0Y2giLCAiYXR0ck5hbWVFbmRJbmRleCIsICJsYXN0SW5kZXgiLCAiZXhlYyIsICJ0ZXN0IiwgImVuZCIsICJzdGFydHNXaXRoIiwgInB1c2giLCAiVGVtcGxhdGUiLCAiY29uc3RydWN0b3IiLCAib3B0aW9ucyIsICJub2RlIiwgInRoaXMiLCAicGFydHMiLCAibm9kZUluZGV4IiwgImF0dHJOYW1lSW5kZXgiLCAicGFydENvdW50IiwgImVsIiwgImNyZWF0ZUVsZW1lbnQiLCAiY3VycmVudE5vZGUiLCAiY29udGVudCIsICJ3cmFwcGVyIiwgImZpcnN0Q2hpbGQiLCAicmVwbGFjZVdpdGgiLCAiY2hpbGROb2RlcyIsICJuZXh0Tm9kZSIsICJub2RlVHlwZSIsICJoYXNBdHRyaWJ1dGVzIiwgIm5hbWUiLCAiZ2V0QXR0cmlidXRlTmFtZXMiLCAiZW5kc1dpdGgiLCAicmVhbE5hbWUiLCAic3RhdGljcyIsICJnZXRBdHRyaWJ1dGUiLCAic3BsaXQiLCAibSIsICJpbmRleCIsICJjdG9yIiwgIlByb3BlcnR5UGFydCIsICJCb29sZWFuQXR0cmlidXRlUGFydCIsICJFdmVudFBhcnQiLCAiQXR0cmlidXRlUGFydCIsICJyZW1vdmVBdHRyaWJ1dGUiLCAidGFnTmFtZSIsICJ0ZXh0Q29udGVudCIsICJlbXB0eVNjcmlwdCIsICJhcHBlbmQiLCAiZGF0YSIsICJpbmRleE9mIiwgIl9vcHRpb25zIiwgImlubmVySFRNTCIsICJyZXNvbHZlRGlyZWN0aXZlIiwgInBhcnQiLCAicGFyZW50IiwgImF0dHJpYnV0ZUluZGV4IiwgImN1cnJlbnREaXJlY3RpdmUiLCAiX19kaXJlY3RpdmVzIiwgIl9fZGlyZWN0aXZlIiwgIm5leHREaXJlY3RpdmVDb25zdHJ1Y3RvciIsICJfJGluaXRpYWxpemUiLCAiXyRyZXNvbHZlIiwgIlRlbXBsYXRlSW5zdGFuY2UiLCAidGVtcGxhdGUiLCAiXyRwYXJ0cyIsICJfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4iLCAiXyR0ZW1wbGF0ZSIsICJfJHBhcmVudCIsICJwYXJlbnROb2RlIiwgIl8kaXNDb25uZWN0ZWQiLCAiZnJhZ21lbnQiLCAiY3JlYXRpb25TY29wZSIsICJpbXBvcnROb2RlIiwgInBhcnRJbmRleCIsICJ0ZW1wbGF0ZVBhcnQiLCAiQ2hpbGRQYXJ0IiwgIm5leHRTaWJsaW5nIiwgIkVsZW1lbnRQYXJ0IiwgIl8kc2V0VmFsdWUiLCAiX19pc0Nvbm5lY3RlZCIsICJzdGFydE5vZGUiLCAiZW5kTm9kZSIsICJfJGNvbW1pdHRlZFZhbHVlIiwgIl8kc3RhcnROb2RlIiwgIl8kZW5kTm9kZSIsICJpc0Nvbm5lY3RlZCIsICJkaXJlY3RpdmVQYXJlbnQiLCAiXyRjbGVhciIsICJfY29tbWl0VGV4dCIsICJfY29tbWl0VGVtcGxhdGVSZXN1bHQiLCAiX2NvbW1pdE5vZGUiLCAiX2NvbW1pdEl0ZXJhYmxlIiwgImluc2VydEJlZm9yZSIsICJfaW5zZXJ0IiwgImNyZWF0ZVRleHROb2RlIiwgInJlc3VsdCIsICJfJGdldFRlbXBsYXRlIiwgImgiLCAiX3VwZGF0ZSIsICJpbnN0YW5jZSIsICJfY2xvbmUiLCAiZ2V0IiwgInNldCIsICJpdGVtUGFydHMiLCAiaXRlbVBhcnQiLCAiaXRlbSIsICJzdGFydCIsICJmcm9tIiwgIl8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQiLCAibiIsICJyZW1vdmUiLCAiZWxlbWVudCIsICJmaWxsIiwgIlN0cmluZyIsICJ2YWx1ZUluZGV4IiwgIm5vQ29tbWl0IiwgImNoYW5nZSIsICJ2IiwgIl9jb21taXRWYWx1ZSIsICJzZXRBdHRyaWJ1dGUiLCAidG9nZ2xlQXR0cmlidXRlIiwgInN1cGVyIiwgIm5ld0xpc3RlbmVyIiwgIm9sZExpc3RlbmVyIiwgInNob3VsZFJlbW92ZUxpc3RlbmVyIiwgImNhcHR1cmUiLCAib25jZSIsICJwYXNzaXZlIiwgInNob3VsZEFkZExpc3RlbmVyIiwgInJlbW92ZUV2ZW50TGlzdGVuZXIiLCAiYWRkRXZlbnRMaXN0ZW5lciIsICJldmVudCIsICJjYWxsIiwgImhvc3QiLCAiaGFuZGxlRXZlbnQiLCAicG9seWZpbGxTdXBwb3J0IiwgImdsb2JhbCIsICJsaXRIdG1sUG9seWZpbGxTdXBwb3J0IiwgIlRlbXBsYXRlIiwgIkNoaWxkUGFydCIsICJsaXRIdG1sVmVyc2lvbnMiLCAicHVzaCIsICJyZW5kZXIiLCAidmFsdWUiLCAiY29udGFpbmVyIiwgIm9wdGlvbnMiLCAicGFydE93bmVyTm9kZSIsICJyZW5kZXJCZWZvcmUiLCAicGFydCIsICJlbmROb2RlIiwgImluc2VydEJlZm9yZSIsICJjcmVhdGVNYXJrZXIiLCAiXyRzZXRWYWx1ZSIsICJleHBsYW5NYWluIiwgInVuZG8iLCAiaSIsICJqIiwgImUiLCAiaSIsICJlIiwgImkiLCAiaiIsICJlIiwgInYiLCAiaSIsICJqIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgInVuZG8iLCAiZSIsICJnIiwgImYiLCAiZSIsICJfIiwgImUiLCAiYSIsICJiIiwgImkiLCAiZSIsICJnIiwgIl8iLCAiaSIsICJlIiwgIm9rIiwgInQiLCAiZSIsICJnIiwgImkiLCAiYyIsICJwcmVjaXNpb24iLCAieCIsICJzIiwgIngiLCAicyIsICJwcmVjaXNpb24iLCAicyIsICJzIiwgImEiLCAiYiIsICJjIiwgInAiLCAicCIsICJlIiwgImUiLCAieCIsICJpIiwgImUiLCAiZnV6enlzb3J0IiwgInYiLCAidGVtcGxhdGUiLCAidiIsICJ4IiwgInkiLCAiZSIsICJlIiwgImUiLCAieCIsICJmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleCIsICJhIiwgImIiLCAiaSIsICJuIiwgImUiLCAiY29ybmVycyIsICJyb3ciLCAidCIsICJjIiwgImkiLCAiciIsICJlIiwgIm4iLCAiaSIsICJ0IiwgImEiLCAiYiIsICJybmRJbnQiLCAibiIsICJpIiwgImVycm9yIiwgInByZWNpc2lvbiIsICJleHBsYW5NYWluIiwgImUiLCAiaSIsICJqIiwgInAiXQp9Cg==
