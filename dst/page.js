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
        class Result19 {
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
          const result = new Result19();
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
          const result = new Result19();
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
  function InsertNewEmptyTaskAfterOp(taskIndex) {
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
  function RationalizeEdgesOp() {
    return new Op([new RationalizeEdgesSubOp()]);
  }

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
  var generateRandomPlan = () => {
    const plan = new Plan();
    let taskID = 0;
    const ops = [AddResourceOp("Person")];
    people.forEach((person) => {
      ops.push(AddResourceOptionOp("Person", person));
    });
    ops.push(
      InsertNewEmptyTaskAfterOp(0),
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

  // src/action/action.ts
  var NOOPAction = class _NOOPAction {
    description = "Does nothing";
    postActionWork = "";
    undo = false;
    do(explanMain2) {
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
    do(explanMain2) {
      const ret = this.op.applyTo(explanMain2.plan);
      if (!ret.ok) {
        return ret;
      }
      return ok(
        new _ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
      );
    }
  };

  // src/action/actions/gotoSearch.ts
  var GoToSearchAction = class {
    description = "Moves focus to search control.";
    postActionWork = "";
    undo = false;
    do(_explanMain) {
      document.querySelector("search-task-panel").setKeyboardFocusToInput("name-only");
      return ok(this);
    }
  };
  var GoToFullSearchAction = class {
    description = "Moves focus to search control and does a full search of all resource values.";
    postActionWork = "";
    undo = false;
    do(_explanMain) {
      document.querySelector("search-task-panel").setKeyboardFocusToInput("full-info");
      return ok(this);
    }
  };

  // src/action/actions/help.ts
  var HelpAction = class {
    description = "Displays the help dialog.";
    postActionWork = "";
    undo = false;
    do(explanMain2) {
      explanMain2.querySelector("keyboard-map-dialog").showModal();
      return ok(this);
    }
  };

  // src/action/actions/resetZoom.ts
  var ResetZoomAction = class {
    description = "Undoes the zoom.";
    postActionWork = "paintChart";
    undo = false;
    do(explanMain2) {
      explanMain2.displayRange = null;
      return ok(this);
    }
  };

  // src/action/actions/tasks.ts
  var SplitTaskAction = class {
    description = "Splits a task.";
    postActionWork = "planDefinitionChanged";
    undo = true;
    do(explanMain2) {
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
    do(explanMain2) {
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
    do(explanMain2) {
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
    do(explanMain2) {
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
    do(explanMain2) {
      toggleTheme();
      return ok(this);
    }
  };

  // src/action/actions/toggleRadar.ts
  var ToggleRadarAction = class {
    description = "Toggles the radar view.";
    postActionWork = "";
    undo = false;
    do(explanMain2) {
      explanMain2.toggleRadar();
      return ok(this);
    }
  };

  // src/action/actions/undo.ts
  var UndoAction = class {
    description = "Undoes the last action.";
    postActionWork = "";
    undo = false;
    do(explanMain2) {
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
    GoToFullSearchAction: new GoToFullSearchAction()
  };

  // src/action/execute.ts
  var undoStack = [];
  var undo = (explanMain2) => {
    const action = undoStack.pop();
    if (!action) {
      return ok(null);
    }
    return executeUndo(action, explanMain2);
  };
  var execute = (name, explanMain2) => {
    const action = ActionRegistry[name];
    const ret = action.do(explanMain2);
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
  var executeOp = (op, postActionWork, undo2, explanMain2) => {
    const action = new ActionFromOp(op, postActionWork, undo2);
    const ret = action.do(explanMain2);
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
  var executeUndo = (action, explanMain2) => {
    const ret = action.do(explanMain2);
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
    ["shift-ctrl-F", "GoToFullSearchAction"]
  ]);
  var explanMain;
  var StartKeyboardHandling = (em) => {
    explanMain = em;
    document.addEventListener("keydown", onKeyDown);
  };
  var onKeyDown = (e2) => {
    const keyname = `${e2.shiftKey ? "shift-" : ""}${e2.ctrlKey ? "ctrl-" : ""}${e2.metaKey ? "meta-" : ""}${e2.altKey ? "alt-" : ""}${e2.key}`;
    console.log(keyname);
    const actionName = KeyMap.get(keyname);
    if (actionName === void 0) {
      return;
    }
    e2.stopPropagation();
    e2.preventDefault();
    const ret = execute(actionName, explanMain);
    if (!ret.ok) {
      console.log(ret.error);
    }
  };

  // src/explanMain/explanMain.ts
  var FONT_SIZE_PX = 32;
  var NUM_SIMULATION_LOOPS = 100;
  var precision2 = new Precision(2);
  var buildSelectedTaskPanel = (plan, selectedTaskPanel, explanMain2) => {
    const selectedTaskPanelTemplate = (task, plan2) => x`
    <table>
      <tr>
        <td>Name</td>
        <td>
          <input
            type="text"
            .value="${task.name}"
            @change=${(e2) => {
      explanMain2.taskNameChanged(
        explanMain2.selectedTask,
        e2.target.value
      );
    }}
          />
        </td>
      </tr>
      ${Object.entries(plan2.resourceDefinitions).map(
      ([resourceKey, defn]) => x` <tr>
            <td>
              <label for="${resourceKey}">${resourceKey}</label>
            </td>
            <td>
              <select
                id="${resourceKey}"
                @change=${(e2) => {
        const ret = explanMain2.taskResourceValueChanged(
          explanMain2.selectedTask,
          resourceKey,
          e2.target.value
        );
        if (!ret.ok) {
          console.log(ret);
          e2.preventDefault();
        }
      }}
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
      ${Object.keys(plan2.metricDefinitions).map(
      (key) => x` <tr>
            <td><label for="${key}">${key}</label></td>
            <td>
              <input
                id="${key}"
                type="number"
                .value="${task.metrics[key]}"
                @change=${(e2) => {
        const ret = explanMain2.taskMetricValueChanged(
          explanMain2.selectedTask,
          key,
          e2.target.value
        );
        if (!ret.ok) {
          console.log(ret);
          e2.preventDefault();
        }
      }}
              />
            </td>
          </tr>`
    )}
    </table>
  `;
    const updateSelectedTaskPanel = (taskIndex) => {
      if (taskIndex === -1) {
        B(x`No task selected.`, selectedTaskPanel);
        return;
      }
      const task = plan.chart.Vertices[taskIndex];
      console.log(task);
      B(selectedTaskPanelTemplate(task, plan), selectedTaskPanel);
    };
    return updateSelectedTaskPanel;
  };
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
    /** Callback to call when the selected task changes. */
    updateSelectedTaskPanel = null;
    /** Callback to call when a mouse moves over the chart. */
    updateHighlightFromMousePos = null;
    connectedCallback() {
      this.plan = generateRandomPlan();
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
          this.updateSelectedTaskPanel(this.selectedTask);
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
      this.updateSelectedTaskPanel = buildSelectedTaskPanel(
        this.plan,
        this.querySelector("selected-task-panel"),
        this
      );
      this.updateSelectedTaskPanel(this.selectedTask);
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
    setFocusOnTask(index) {
      this.selectedTask = index;
      this.forceFocusOnTask();
      this.paintChart();
      this.updateSelectedTaskPanel(this.selectedTask);
    }
    taskResourceValueChanged(taskIndex, resourceKey, resourceValue) {
      const op = SetResourceValueOp(resourceKey, resourceValue, taskIndex);
      return executeOp(op, "planDefinitionChanged", true, this);
    }
    taskMetricValueChanged(taskIndex, metricKey, metricValue) {
      const op = SetMetricValueOp(metricKey, +metricValue, taskIndex);
      return executeOp(op, "planDefinitionChanged", true, this);
    }
    taskNameChanged(taskIndex, name) {
      const op = SetTaskNameOp(taskIndex, name);
      return executeOp(op, "paintChart", true, this);
    }
    deleteTask(taskIndex) {
      const op = DeleteTaskOp(taskIndex);
      return executeOp(op, "paintChart", true, this);
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
      this.updateSelectedTaskPanel = buildSelectedTaskPanel(
        this.plan,
        this.querySelector("selected-task-panel"),
        this
      );
      this.recalculateSpansAndCriticalPath();
    }
    recalculateSpansAndCriticalPath() {
      const download = document.querySelector("#download");
      const downloadBlob = new Blob([JSON.stringify(this.plan, null, "  ")], {
        type: "application/json"
      });
      download.href = URL.createObjectURL(downloadBlob);
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
      this.updateSelectedTaskPanel(this.selectedTask);
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
    @input="${(e2) => {
    searchTaskPanel.onInput(e2);
  }}"
    @keydown="${(e2) => {
    searchTaskPanel.onKeyDown(e2);
  }}"
    @blur="${() => {
    searchTaskPanel.lossOfFocus();
  }}"
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
        this._tasks.slice(1, -2),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2Z1enp5c29ydC9mdXp6eXNvcnQuanMiLCAiLi4vc3JjL3Jlc3VsdC50cyIsICIuLi9zcmMvb3BzL29wcy50cyIsICIuLi9zcmMvb3BzL21ldHJpY3MudHMiLCAiLi4vc3JjL3Jlc291cmNlcy9yZXNvdXJjZXMudHMiLCAiLi4vc3JjL29wcy9yZXNvdXJjZXMudHMiLCAiLi4vc3JjL2RhZy9kYWcudHMiLCAiLi4vc3JjL2RhZy9hbGdvcml0aG1zL3RvcG9zb3J0LnRzIiwgIi4uL3NyYy9jaGFydC9jaGFydC50cyIsICIuLi9zcmMvcHJlY2lzaW9uL3ByZWNpc2lvbi50cyIsICIuLi9zcmMvbWV0cmljcy9yYW5nZS50cyIsICIuLi9zcmMvbWV0cmljcy9tZXRyaWNzLnRzIiwgIi4uL3NyYy9vcHMvY2hhcnQudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL3RyaWFuZ3VsYXIudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzIiwgIi4uL3NyYy9wbGFuL3BsYW4udHMiLCAiLi4vc3JjL3JlbmRlcmVyL3NjYWxlL3BvaW50LnRzIiwgIi4uL3NyYy9yZW5kZXJlci9kaXZpZGVybW92ZS9kaXZpZGVybW92ZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvbW91c2VkcmFnL21vdXNlZHJhZy50cyIsICIuLi9zcmMvcmVuZGVyZXIvbW91c2Vtb3ZlL21vdXNlbW92ZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvcmFuZ2UvcmFuZ2UudHMiLCAiLi4vc3JjL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHMiLCAiLi4vc3JjL3JlbmRlcmVyL2tkL2tkLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9zY2FsZS9zY2FsZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvcmVuZGVyZXIudHMiLCAiLi4vc3JjL3NsYWNrL3NsYWNrLnRzIiwgIi4uL3NyYy9zdHlsZS90aGVtZS90aGVtZS50cyIsICIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvc3JjL2xpdC1odG1sLnRzIiwgIi4uL3NyYy9zaW11bGF0aW9uL3NpbXVsYXRpb24udHMiLCAiLi4vc3JjL2dlbmVyYXRlL2dlbmVyYXRlLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9uLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9nb3RvU2VhcmNoLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9oZWxwLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9yZXNldFpvb20udHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3Rhc2tzLnRzIiwgIi4uL3NyYy9zdHlsZS90b2dnbGVyL3RvZ2dsZXIudHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3RvZ2dsZURhcmtNb2RlLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy90b2dnbGVSYWRhci50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvdW5kby50cyIsICIuLi9zcmMvYWN0aW9uL3JlZ2lzdHJ5LnRzIiwgIi4uL3NyYy9hY3Rpb24vZXhlY3V0ZS50cyIsICIuLi9zcmMva2V5bWFwL2tleW1hcC50cyIsICIuLi9zcmMvZXhwbGFuTWFpbi9leHBsYW5NYWluLnRzIiwgIi4uL3NyYy9oZWxwL2hlbHAudHMiLCAiLi4vc3JjL3NlYXJjaC9zZWFyY2gtdGFzay1wYW5lbC50cyIsICIuLi9zcmMvc2VhcmNoL3Rhc2stc2VhcmNoLWNvbnRyb2xzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBodHRwczovL2dpdGh1Yi5jb20vZmFyemhlci9mdXp6eXNvcnQgdjMuMC4yXHJcblxyXG4vLyBVTUQgKFVuaXZlcnNhbCBNb2R1bGUgRGVmaW5pdGlvbikgZm9yIGZ1enp5c29ydFxyXG47KChyb290LCBVTUQpID0+IHtcclxuICBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShbXSwgVU1EKVxyXG4gIGVsc2UgaWYodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzID0gVU1EKClcclxuICBlbHNlIHJvb3RbJ2Z1enp5c29ydCddID0gVU1EKClcclxufSkodGhpcywgXyA9PiB7XHJcbiAgJ3VzZSBzdHJpY3QnXHJcblxyXG4gIHZhciBzaW5nbGUgPSAoc2VhcmNoLCB0YXJnZXQpID0+IHtcclxuICAgIGlmKCFzZWFyY2ggfHwgIXRhcmdldCkgcmV0dXJuIE5VTExcclxuXHJcbiAgICB2YXIgcHJlcGFyZWRTZWFyY2ggPSBnZXRQcmVwYXJlZFNlYXJjaChzZWFyY2gpXHJcbiAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgdmFyIHNlYXJjaEJpdGZsYWdzID0gcHJlcGFyZWRTZWFyY2guYml0ZmxhZ3NcclxuICAgIGlmKChzZWFyY2hCaXRmbGFncyAmIHRhcmdldC5fYml0ZmxhZ3MpICE9PSBzZWFyY2hCaXRmbGFncykgcmV0dXJuIE5VTExcclxuXHJcbiAgICByZXR1cm4gYWxnb3JpdGhtKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQpXHJcbiAgfVxyXG5cclxuICB2YXIgZ28gPSAoc2VhcmNoLCB0YXJnZXRzLCBvcHRpb25zKSA9PiB7XHJcbiAgICBpZighc2VhcmNoKSByZXR1cm4gb3B0aW9ucz8uYWxsID8gYWxsKHRhcmdldHMsIG9wdGlvbnMpIDogbm9SZXN1bHRzXHJcblxyXG4gICAgdmFyIHByZXBhcmVkU2VhcmNoID0gZ2V0UHJlcGFyZWRTZWFyY2goc2VhcmNoKVxyXG4gICAgdmFyIHNlYXJjaEJpdGZsYWdzID0gcHJlcGFyZWRTZWFyY2guYml0ZmxhZ3NcclxuICAgIHZhciBjb250YWluc1NwYWNlICA9IHByZXBhcmVkU2VhcmNoLmNvbnRhaW5zU3BhY2VcclxuXHJcbiAgICB2YXIgdGhyZXNob2xkID0gZGVub3JtYWxpemVTY29yZSggb3B0aW9ucz8udGhyZXNob2xkIHx8IDAgKVxyXG4gICAgdmFyIGxpbWl0ICAgICA9IG9wdGlvbnM/LmxpbWl0IHx8IElORklOSVRZXHJcblxyXG4gICAgdmFyIHJlc3VsdHNMZW4gPSAwOyB2YXIgbGltaXRlZENvdW50ID0gMFxyXG4gICAgdmFyIHRhcmdldHNMZW4gPSB0YXJnZXRzLmxlbmd0aFxyXG5cclxuICAgIGZ1bmN0aW9uIHB1c2hfcmVzdWx0KHJlc3VsdCkge1xyXG4gICAgICBpZihyZXN1bHRzTGVuIDwgbGltaXQpIHsgcS5hZGQocmVzdWx0KTsgKytyZXN1bHRzTGVuIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgKytsaW1pdGVkQ291bnRcclxuICAgICAgICBpZihyZXN1bHQuX3Njb3JlID4gcS5wZWVrKCkuX3Njb3JlKSBxLnJlcGxhY2VUb3AocmVzdWx0KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBjb2RlIGlzIGNvcHkvcGFzdGVkIDMgdGltZXMgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgW29wdGlvbnMua2V5LCBvcHRpb25zLmtleXMsIG5vIGtleXNdXHJcblxyXG4gICAgLy8gb3B0aW9ucy5rZXlcclxuICAgIGlmKG9wdGlvbnM/LmtleSkge1xyXG4gICAgICB2YXIga2V5ID0gb3B0aW9ucy5rZXlcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldHNMZW47ICsraSkgeyB2YXIgb2JqID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIGtleSlcclxuICAgICAgICBpZighdGFyZ2V0KSBjb250aW51ZVxyXG4gICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuXHJcbiAgICAgICAgaWYoKHNlYXJjaEJpdGZsYWdzICYgdGFyZ2V0Ll9iaXRmbGFncykgIT09IHNlYXJjaEJpdGZsYWdzKSBjb250aW51ZVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBhbGdvcml0aG0ocHJlcGFyZWRTZWFyY2gsIHRhcmdldClcclxuICAgICAgICBpZihyZXN1bHQgPT09IE5VTEwpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYocmVzdWx0Ll9zY29yZSA8IHRocmVzaG9sZCkgY29udGludWVcclxuXHJcbiAgICAgICAgcmVzdWx0Lm9iaiA9IG9ialxyXG4gICAgICAgIHB1c2hfcmVzdWx0KHJlc3VsdClcclxuICAgICAgfVxyXG5cclxuICAgIC8vIG9wdGlvbnMua2V5c1xyXG4gICAgfSBlbHNlIGlmKG9wdGlvbnM/LmtleXMpIHtcclxuICAgICAgdmFyIGtleXMgPSBvcHRpb25zLmtleXNcclxuICAgICAgdmFyIGtleXNMZW4gPSBrZXlzLmxlbmd0aFxyXG5cclxuICAgICAgb3V0ZXI6IGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRzTGVuOyArK2kpIHsgdmFyIG9iaiA9IHRhcmdldHNbaV1cclxuXHJcbiAgICAgICAgeyAvLyBlYXJseSBvdXQgYmFzZWQgb24gYml0ZmxhZ3NcclxuICAgICAgICAgIHZhciBrZXlzQml0ZmxhZ3MgPSAwXHJcbiAgICAgICAgICBmb3IgKHZhciBrZXlJID0gMDsga2V5SSA8IGtleXNMZW47ICsra2V5SSkge1xyXG4gICAgICAgICAgICB2YXIga2V5ID0ga2V5c1trZXlJXVxyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBrZXkpXHJcbiAgICAgICAgICAgIGlmKCF0YXJnZXQpIHsgdG1wVGFyZ2V0c1trZXlJXSA9IG5vVGFyZ2V0OyBjb250aW51ZSB9XHJcbiAgICAgICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuICAgICAgICAgICAgdG1wVGFyZ2V0c1trZXlJXSA9IHRhcmdldFxyXG5cclxuICAgICAgICAgICAga2V5c0JpdGZsYWdzIHw9IHRhcmdldC5fYml0ZmxhZ3NcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZigoc2VhcmNoQml0ZmxhZ3MgJiBrZXlzQml0ZmxhZ3MpICE9PSBzZWFyY2hCaXRmbGFncykgY29udGludWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGNvbnRhaW5zU3BhY2UpIGZvcihsZXQgaT0wOyBpPHByZXBhcmVkU2VhcmNoLnNwYWNlU2VhcmNoZXMubGVuZ3RoOyBpKyspIGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuXHJcbiAgICAgICAgZm9yICh2YXIga2V5SSA9IDA7IGtleUkgPCBrZXlzTGVuOyArK2tleUkpIHtcclxuICAgICAgICAgIHRhcmdldCA9IHRtcFRhcmdldHNba2V5SV1cclxuICAgICAgICAgIGlmKHRhcmdldCA9PT0gbm9UYXJnZXQpIHsgdG1wUmVzdWx0c1trZXlJXSA9IG5vVGFyZ2V0OyBjb250aW51ZSB9XHJcblxyXG4gICAgICAgICAgdG1wUmVzdWx0c1trZXlJXSA9IGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0LCAvKmFsbG93U3BhY2VzPSovZmFsc2UsIC8qYWxsb3dQYXJ0aWFsTWF0Y2g9Ki9jb250YWluc1NwYWNlKVxyXG4gICAgICAgICAgaWYodG1wUmVzdWx0c1trZXlJXSA9PT0gTlVMTCkgeyB0bXBSZXN1bHRzW2tleUldID0gbm9UYXJnZXQ7IGNvbnRpbnVlIH1cclxuXHJcbiAgICAgICAgICAvLyB0b2RvOiB0aGlzIHNlZW1zIHdlaXJkIGFuZCB3cm9uZy4gbGlrZSB3aGF0IGlmIG91ciBmaXJzdCBtYXRjaCB3YXNuJ3QgZ29vZC4gdGhpcyBzaG91bGQganVzdCByZXBsYWNlIGl0IGluc3RlYWQgb2YgYXZlcmFnaW5nIHdpdGggaXRcclxuICAgICAgICAgIC8vIGlmIG91ciBzZWNvbmQgbWF0Y2ggaXNuJ3QgZ29vZCB3ZSBpZ25vcmUgaXQgaW5zdGVhZCBvZiBhdmVyYWdpbmcgd2l0aCBpdFxyXG4gICAgICAgICAgaWYoY29udGFpbnNTcGFjZSkgZm9yKGxldCBpPTA7IGk8cHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZihhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA+IC0xMDAwKSB7XHJcbiAgICAgICAgICAgICAgaWYoa2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPiBORUdBVElWRV9JTkZJTklUWSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRtcCA9IChrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSArIGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldKSAvIDQvKmJvbnVzIHNjb3JlIGZvciBoYXZpbmcgbXVsdGlwbGUgbWF0Y2hlcyovXHJcbiAgICAgICAgICAgICAgICBpZih0bXAgPiBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSkga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPSB0bXBcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0gPiBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSkga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPSBhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoY29udGFpbnNTcGFjZSkge1xyXG4gICAgICAgICAgZm9yKGxldCBpPTA7IGk8cHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlcy5sZW5ndGg7IGkrKykgeyBpZihrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA9PT0gTkVHQVRJVkVfSU5GSU5JVFkpIGNvbnRpbnVlIG91dGVyIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdmFyIGhhc0F0TGVhc3QxTWF0Y2ggPSBmYWxzZVxyXG4gICAgICAgICAgZm9yKGxldCBpPTA7IGkgPCBrZXlzTGVuOyBpKyspIHsgaWYodG1wUmVzdWx0c1tpXS5fc2NvcmUgIT09IE5FR0FUSVZFX0lORklOSVRZKSB7IGhhc0F0TGVhc3QxTWF0Y2ggPSB0cnVlOyBicmVhayB9IH1cclxuICAgICAgICAgIGlmKCFoYXNBdExlYXN0MU1hdGNoKSBjb250aW51ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIG9ialJlc3VsdHMgPSBuZXcgS2V5c1Jlc3VsdChrZXlzTGVuKVxyXG4gICAgICAgIGZvcihsZXQgaT0wOyBpIDwga2V5c0xlbjsgaSsrKSB7IG9ialJlc3VsdHNbaV0gPSB0bXBSZXN1bHRzW2ldIH1cclxuXHJcbiAgICAgICAgaWYoY29udGFpbnNTcGFjZSkge1xyXG4gICAgICAgICAgdmFyIHNjb3JlID0gMFxyXG4gICAgICAgICAgZm9yKGxldCBpPTA7IGk8cHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlcy5sZW5ndGg7IGkrKykgc2NvcmUgKz0ga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gdG9kbyBjb3VsZCByZXdyaXRlIHRoaXMgc2NvcmluZyB0byBiZSBtb3JlIHNpbWlsYXIgdG8gd2hlbiB0aGVyZSdzIHNwYWNlc1xyXG4gICAgICAgICAgLy8gaWYgd2UgbWF0Y2ggbXVsdGlwbGUga2V5cyBnaXZlIHVzIGJvbnVzIHBvaW50c1xyXG4gICAgICAgICAgdmFyIHNjb3JlID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgICAgIGZvcihsZXQgaT0wOyBpPGtleXNMZW47IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gb2JqUmVzdWx0c1tpXVxyXG4gICAgICAgICAgICBpZihyZXN1bHQuX3Njb3JlID4gLTEwMDApIHtcclxuICAgICAgICAgICAgICBpZihzY29yZSA+IE5FR0FUSVZFX0lORklOSVRZKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG1wID0gKHNjb3JlICsgcmVzdWx0Ll9zY29yZSkgLyA0Lypib251cyBzY29yZSBmb3IgaGF2aW5nIG11bHRpcGxlIG1hdGNoZXMqL1xyXG4gICAgICAgICAgICAgICAgaWYodG1wID4gc2NvcmUpIHNjb3JlID0gdG1wXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHJlc3VsdC5fc2NvcmUgPiBzY29yZSkgc2NvcmUgPSByZXN1bHQuX3Njb3JlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvYmpSZXN1bHRzLm9iaiA9IG9ialxyXG4gICAgICAgIG9ialJlc3VsdHMuX3Njb3JlID0gc2NvcmVcclxuICAgICAgICBpZihvcHRpb25zPy5zY29yZUZuKSB7XHJcbiAgICAgICAgICBzY29yZSA9IG9wdGlvbnMuc2NvcmVGbihvYmpSZXN1bHRzKVxyXG4gICAgICAgICAgaWYoIXNjb3JlKSBjb250aW51ZVxyXG4gICAgICAgICAgc2NvcmUgPSBkZW5vcm1hbGl6ZVNjb3JlKHNjb3JlKVxyXG4gICAgICAgICAgb2JqUmVzdWx0cy5fc2NvcmUgPSBzY29yZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoc2NvcmUgPCB0aHJlc2hvbGQpIGNvbnRpbnVlXHJcbiAgICAgICAgcHVzaF9yZXN1bHQob2JqUmVzdWx0cylcclxuICAgICAgfVxyXG5cclxuICAgIC8vIG5vIGtleXNcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRzTGVuOyArK2kpIHsgdmFyIHRhcmdldCA9IHRhcmdldHNbaV1cclxuICAgICAgICBpZighdGFyZ2V0KSBjb250aW51ZVxyXG4gICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuXHJcbiAgICAgICAgaWYoKHNlYXJjaEJpdGZsYWdzICYgdGFyZ2V0Ll9iaXRmbGFncykgIT09IHNlYXJjaEJpdGZsYWdzKSBjb250aW51ZVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBhbGdvcml0aG0ocHJlcGFyZWRTZWFyY2gsIHRhcmdldClcclxuICAgICAgICBpZihyZXN1bHQgPT09IE5VTEwpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYocmVzdWx0Ll9zY29yZSA8IHRocmVzaG9sZCkgY29udGludWVcclxuXHJcbiAgICAgICAgcHVzaF9yZXN1bHQocmVzdWx0KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYocmVzdWx0c0xlbiA9PT0gMCkgcmV0dXJuIG5vUmVzdWx0c1xyXG4gICAgdmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkocmVzdWx0c0xlbilcclxuICAgIGZvcih2YXIgaSA9IHJlc3VsdHNMZW4gLSAxOyBpID49IDA7IC0taSkgcmVzdWx0c1tpXSA9IHEucG9sbCgpXHJcbiAgICByZXN1bHRzLnRvdGFsID0gcmVzdWx0c0xlbiArIGxpbWl0ZWRDb3VudFxyXG4gICAgcmV0dXJuIHJlc3VsdHNcclxuICB9XHJcblxyXG5cclxuICAvLyB0aGlzIGlzIHdyaXR0ZW4gYXMgMSBmdW5jdGlvbiBpbnN0ZWFkIG9mIDIgZm9yIG1pbmlmaWNhdGlvbi4gcGVyZiBzZWVtcyBmaW5lIC4uLlxyXG4gIC8vIGV4Y2VwdCB3aGVuIG1pbmlmaWVkLiB0aGUgcGVyZiBpcyB2ZXJ5IHNsb3dcclxuICB2YXIgaGlnaGxpZ2h0ID0gKHJlc3VsdCwgb3Blbj0nPGI+JywgY2xvc2U9JzwvYj4nKSA9PiB7XHJcbiAgICB2YXIgY2FsbGJhY2sgPSB0eXBlb2Ygb3BlbiA9PT0gJ2Z1bmN0aW9uJyA/IG9wZW4gOiB1bmRlZmluZWRcclxuXHJcbiAgICB2YXIgdGFyZ2V0ICAgICAgPSByZXN1bHQudGFyZ2V0XHJcbiAgICB2YXIgdGFyZ2V0TGVuICAgPSB0YXJnZXQubGVuZ3RoXHJcbiAgICB2YXIgaW5kZXhlcyAgICAgPSByZXN1bHQuaW5kZXhlc1xyXG4gICAgdmFyIGhpZ2hsaWdodGVkID0gJydcclxuICAgIHZhciBtYXRjaEkgICAgICA9IDBcclxuICAgIHZhciBpbmRleGVzSSAgICA9IDBcclxuICAgIHZhciBvcGVuZWQgICAgICA9IGZhbHNlXHJcbiAgICB2YXIgcGFydHMgICAgICAgPSBbXVxyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRMZW47ICsraSkgeyB2YXIgY2hhciA9IHRhcmdldFtpXVxyXG4gICAgICBpZihpbmRleGVzW2luZGV4ZXNJXSA9PT0gaSkge1xyXG4gICAgICAgICsraW5kZXhlc0lcclxuICAgICAgICBpZighb3BlbmVkKSB7IG9wZW5lZCA9IHRydWVcclxuICAgICAgICAgIGlmKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHBhcnRzLnB1c2goaGlnaGxpZ2h0ZWQpOyBoaWdobGlnaHRlZCA9ICcnXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoaWdobGlnaHRlZCArPSBvcGVuXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihpbmRleGVzSSA9PT0gaW5kZXhlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIGlmKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IGNoYXJcclxuICAgICAgICAgICAgcGFydHMucHVzaChjYWxsYmFjayhoaWdobGlnaHRlZCwgbWF0Y2hJKyspKTsgaGlnaGxpZ2h0ZWQgPSAnJ1xyXG4gICAgICAgICAgICBwYXJ0cy5wdXNoKHRhcmdldC5zdWJzdHIoaSsxKSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IGNoYXIgKyBjbG9zZSArIHRhcmdldC5zdWJzdHIoaSsxKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYob3BlbmVkKSB7IG9wZW5lZCA9IGZhbHNlXHJcbiAgICAgICAgICBpZihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGNhbGxiYWNrKGhpZ2hsaWdodGVkLCBtYXRjaEkrKykpOyBoaWdobGlnaHRlZCA9ICcnXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoaWdobGlnaHRlZCArPSBjbG9zZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBoaWdobGlnaHRlZCArPSBjaGFyXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNhbGxiYWNrID8gcGFydHMgOiBoaWdobGlnaHRlZFxyXG4gIH1cclxuXHJcblxyXG4gIHZhciBwcmVwYXJlID0gKHRhcmdldCkgPT4ge1xyXG4gICAgaWYodHlwZW9mIHRhcmdldCA9PT0gJ251bWJlcicpIHRhcmdldCA9ICcnK3RhcmdldFxyXG4gICAgZWxzZSBpZih0eXBlb2YgdGFyZ2V0ICE9PSAnc3RyaW5nJykgdGFyZ2V0ID0gJydcclxuICAgIHZhciBpbmZvID0gcHJlcGFyZUxvd2VySW5mbyh0YXJnZXQpXHJcbiAgICByZXR1cm4gbmV3X3Jlc3VsdCh0YXJnZXQsIHtfdGFyZ2V0TG93ZXI6aW5mby5fbG93ZXIsIF90YXJnZXRMb3dlckNvZGVzOmluZm8ubG93ZXJDb2RlcywgX2JpdGZsYWdzOmluZm8uYml0ZmxhZ3N9KVxyXG4gIH1cclxuXHJcbiAgdmFyIGNsZWFudXAgPSAoKSA9PiB7IHByZXBhcmVkQ2FjaGUuY2xlYXIoKTsgcHJlcGFyZWRTZWFyY2hDYWNoZS5jbGVhcigpIH1cclxuXHJcblxyXG4gIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcbiAgLy8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcclxuICAvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxyXG4gIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcblxyXG5cclxuICBjbGFzcyBSZXN1bHQge1xyXG4gICAgZ2V0IFsnaW5kZXhlcyddKCkgeyByZXR1cm4gdGhpcy5faW5kZXhlcy5zbGljZSgwLCB0aGlzLl9pbmRleGVzLmxlbikuc29ydCgoYSxiKT0+YS1iKSB9XHJcbiAgICBzZXQgWydpbmRleGVzJ10oaW5kZXhlcykgeyByZXR1cm4gdGhpcy5faW5kZXhlcyA9IGluZGV4ZXMgfVxyXG4gICAgWydoaWdobGlnaHQnXShvcGVuLCBjbG9zZSkgeyByZXR1cm4gaGlnaGxpZ2h0KHRoaXMsIG9wZW4sIGNsb3NlKSB9XHJcbiAgICBnZXQgWydzY29yZSddKCkgeyByZXR1cm4gbm9ybWFsaXplU2NvcmUodGhpcy5fc2NvcmUpIH1cclxuICAgIHNldCBbJ3Njb3JlJ10oc2NvcmUpIHsgdGhpcy5fc2NvcmUgPSBkZW5vcm1hbGl6ZVNjb3JlKHNjb3JlKSB9XHJcbiAgfVxyXG5cclxuICBjbGFzcyBLZXlzUmVzdWx0IGV4dGVuZHMgQXJyYXkge1xyXG4gICAgZ2V0IFsnc2NvcmUnXSgpIHsgcmV0dXJuIG5vcm1hbGl6ZVNjb3JlKHRoaXMuX3Njb3JlKSB9XHJcbiAgICBzZXQgWydzY29yZSddKHNjb3JlKSB7IHRoaXMuX3Njb3JlID0gZGVub3JtYWxpemVTY29yZShzY29yZSkgfVxyXG4gIH1cclxuXHJcbiAgdmFyIG5ld19yZXN1bHQgPSAodGFyZ2V0LCBvcHRpb25zKSA9PiB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgUmVzdWx0KClcclxuICAgIHJlc3VsdFsndGFyZ2V0J10gICAgICAgICAgICAgPSB0YXJnZXRcclxuICAgIHJlc3VsdFsnb2JqJ10gICAgICAgICAgICAgICAgPSBvcHRpb25zLm9iaiAgICAgICAgICAgICAgICAgICA/PyBOVUxMXHJcbiAgICByZXN1bHQuX3Njb3JlICAgICAgICAgICAgICAgID0gb3B0aW9ucy5fc2NvcmUgICAgICAgICAgICAgICAgPz8gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgIHJlc3VsdC5faW5kZXhlcyAgICAgICAgICAgICAgPSBvcHRpb25zLl9pbmRleGVzICAgICAgICAgICAgICA/PyBbXVxyXG4gICAgcmVzdWx0Ll90YXJnZXRMb3dlciAgICAgICAgICA9IG9wdGlvbnMuX3RhcmdldExvd2VyICAgICAgICAgID8/ICcnXHJcbiAgICByZXN1bHQuX3RhcmdldExvd2VyQ29kZXMgICAgID0gb3B0aW9ucy5fdGFyZ2V0TG93ZXJDb2RlcyAgICAgPz8gTlVMTFxyXG4gICAgcmVzdWx0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlcyA9IG9wdGlvbnMuX25leHRCZWdpbm5pbmdJbmRleGVzID8/IE5VTExcclxuICAgIHJlc3VsdC5fYml0ZmxhZ3MgICAgICAgICAgICAgPSBvcHRpb25zLl9iaXRmbGFncyAgICAgICAgICAgICA/PyAwXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIG5vcm1hbGl6ZVNjb3JlID0gc2NvcmUgPT4ge1xyXG4gICAgaWYoc2NvcmUgPT09IE5FR0FUSVZFX0lORklOSVRZKSByZXR1cm4gMFxyXG4gICAgaWYoc2NvcmUgPiAxKSByZXR1cm4gc2NvcmVcclxuICAgIHJldHVybiBNYXRoLkUgKiogKCAoKC1zY29yZSArIDEpKiouMDQzMDcgLSAxKSAqIC0yKVxyXG4gIH1cclxuICB2YXIgZGVub3JtYWxpemVTY29yZSA9IG5vcm1hbGl6ZWRTY29yZSA9PiB7XHJcbiAgICBpZihub3JtYWxpemVkU2NvcmUgPT09IDApIHJldHVybiBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgaWYobm9ybWFsaXplZFNjb3JlID4gMSkgcmV0dXJuIG5vcm1hbGl6ZWRTY29yZVxyXG4gICAgcmV0dXJuIDEgLSBNYXRoLnBvdygoTWF0aC5sb2cobm9ybWFsaXplZFNjb3JlKSAvIC0yICsgMSksIDEgLyAwLjA0MzA3KVxyXG4gIH1cclxuXHJcblxyXG4gIHZhciBwcmVwYXJlU2VhcmNoID0gKHNlYXJjaCkgPT4ge1xyXG4gICAgaWYodHlwZW9mIHNlYXJjaCA9PT0gJ251bWJlcicpIHNlYXJjaCA9ICcnK3NlYXJjaFxyXG4gICAgZWxzZSBpZih0eXBlb2Ygc2VhcmNoICE9PSAnc3RyaW5nJykgc2VhcmNoID0gJydcclxuICAgIHNlYXJjaCA9IHNlYXJjaC50cmltKClcclxuICAgIHZhciBpbmZvID0gcHJlcGFyZUxvd2VySW5mbyhzZWFyY2gpXHJcblxyXG4gICAgdmFyIHNwYWNlU2VhcmNoZXMgPSBbXVxyXG4gICAgaWYoaW5mby5jb250YWluc1NwYWNlKSB7XHJcbiAgICAgIHZhciBzZWFyY2hlcyA9IHNlYXJjaC5zcGxpdCgvXFxzKy8pXHJcbiAgICAgIHNlYXJjaGVzID0gWy4uLm5ldyBTZXQoc2VhcmNoZXMpXSAvLyBkaXN0aW5jdFxyXG4gICAgICBmb3IodmFyIGk9MDsgaTxzZWFyY2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmKHNlYXJjaGVzW2ldID09PSAnJykgY29udGludWVcclxuICAgICAgICB2YXIgX2luZm8gPSBwcmVwYXJlTG93ZXJJbmZvKHNlYXJjaGVzW2ldKVxyXG4gICAgICAgIHNwYWNlU2VhcmNoZXMucHVzaCh7bG93ZXJDb2RlczpfaW5mby5sb3dlckNvZGVzLCBfbG93ZXI6c2VhcmNoZXNbaV0udG9Mb3dlckNhc2UoKSwgY29udGFpbnNTcGFjZTpmYWxzZX0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge2xvd2VyQ29kZXM6IGluZm8ubG93ZXJDb2RlcywgX2xvd2VyOiBpbmZvLl9sb3dlciwgY29udGFpbnNTcGFjZTogaW5mby5jb250YWluc1NwYWNlLCBiaXRmbGFnczogaW5mby5iaXRmbGFncywgc3BhY2VTZWFyY2hlczogc3BhY2VTZWFyY2hlc31cclxuICB9XHJcblxyXG5cclxuXHJcbiAgdmFyIGdldFByZXBhcmVkID0gKHRhcmdldCkgPT4ge1xyXG4gICAgaWYodGFyZ2V0Lmxlbmd0aCA+IDk5OSkgcmV0dXJuIHByZXBhcmUodGFyZ2V0KSAvLyBkb24ndCBjYWNoZSBodWdlIHRhcmdldHNcclxuICAgIHZhciB0YXJnZXRQcmVwYXJlZCA9IHByZXBhcmVkQ2FjaGUuZ2V0KHRhcmdldClcclxuICAgIGlmKHRhcmdldFByZXBhcmVkICE9PSB1bmRlZmluZWQpIHJldHVybiB0YXJnZXRQcmVwYXJlZFxyXG4gICAgdGFyZ2V0UHJlcGFyZWQgPSBwcmVwYXJlKHRhcmdldClcclxuICAgIHByZXBhcmVkQ2FjaGUuc2V0KHRhcmdldCwgdGFyZ2V0UHJlcGFyZWQpXHJcbiAgICByZXR1cm4gdGFyZ2V0UHJlcGFyZWRcclxuICB9XHJcbiAgdmFyIGdldFByZXBhcmVkU2VhcmNoID0gKHNlYXJjaCkgPT4ge1xyXG4gICAgaWYoc2VhcmNoLmxlbmd0aCA+IDk5OSkgcmV0dXJuIHByZXBhcmVTZWFyY2goc2VhcmNoKSAvLyBkb24ndCBjYWNoZSBodWdlIHNlYXJjaGVzXHJcbiAgICB2YXIgc2VhcmNoUHJlcGFyZWQgPSBwcmVwYXJlZFNlYXJjaENhY2hlLmdldChzZWFyY2gpXHJcbiAgICBpZihzZWFyY2hQcmVwYXJlZCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gc2VhcmNoUHJlcGFyZWRcclxuICAgIHNlYXJjaFByZXBhcmVkID0gcHJlcGFyZVNlYXJjaChzZWFyY2gpXHJcbiAgICBwcmVwYXJlZFNlYXJjaENhY2hlLnNldChzZWFyY2gsIHNlYXJjaFByZXBhcmVkKVxyXG4gICAgcmV0dXJuIHNlYXJjaFByZXBhcmVkXHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIGFsbCA9ICh0YXJnZXRzLCBvcHRpb25zKSA9PiB7XHJcbiAgICB2YXIgcmVzdWx0cyA9IFtdOyByZXN1bHRzLnRvdGFsID0gdGFyZ2V0cy5sZW5ndGggLy8gdGhpcyB0b3RhbCBjYW4gYmUgd3JvbmcgaWYgc29tZSB0YXJnZXRzIGFyZSBza2lwcGVkXHJcblxyXG4gICAgdmFyIGxpbWl0ID0gb3B0aW9ucz8ubGltaXQgfHwgSU5GSU5JVFlcclxuXHJcbiAgICBpZihvcHRpb25zPy5rZXkpIHtcclxuICAgICAgZm9yKHZhciBpPTA7aTx0YXJnZXRzLmxlbmd0aDtpKyspIHsgdmFyIG9iaiA9IHRhcmdldHNbaV1cclxuICAgICAgICB2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBvcHRpb25zLmtleSlcclxuICAgICAgICBpZih0YXJnZXQgPT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ld19yZXN1bHQodGFyZ2V0LnRhcmdldCwge19zY29yZTogdGFyZ2V0Ll9zY29yZSwgb2JqOiBvYmp9KVxyXG4gICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpOyBpZihyZXN1bHRzLmxlbmd0aCA+PSBsaW1pdCkgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmKG9wdGlvbnM/LmtleXMpIHtcclxuICAgICAgZm9yKHZhciBpPTA7aTx0YXJnZXRzLmxlbmd0aDtpKyspIHsgdmFyIG9iaiA9IHRhcmdldHNbaV1cclxuICAgICAgICB2YXIgb2JqUmVzdWx0cyA9IG5ldyBLZXlzUmVzdWx0KG9wdGlvbnMua2V5cy5sZW5ndGgpXHJcbiAgICAgICAgZm9yICh2YXIga2V5SSA9IG9wdGlvbnMua2V5cy5sZW5ndGggLSAxOyBrZXlJID49IDA7IC0ta2V5SSkge1xyXG4gICAgICAgICAgdmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwgb3B0aW9ucy5rZXlzW2tleUldKVxyXG4gICAgICAgICAgaWYoIXRhcmdldCkgeyBvYmpSZXN1bHRzW2tleUldID0gbm9UYXJnZXQ7IGNvbnRpbnVlIH1cclxuICAgICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuICAgICAgICAgIHRhcmdldC5fc2NvcmUgPSBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgICAgICAgdGFyZ2V0Ll9pbmRleGVzLmxlbiA9IDBcclxuICAgICAgICAgIG9ialJlc3VsdHNba2V5SV0gPSB0YXJnZXRcclxuICAgICAgICB9XHJcbiAgICAgICAgb2JqUmVzdWx0cy5vYmogPSBvYmpcclxuICAgICAgICBvYmpSZXN1bHRzLl9zY29yZSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKG9ialJlc3VsdHMpOyBpZihyZXN1bHRzLmxlbmd0aCA+PSBsaW1pdCkgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yKHZhciBpPTA7aTx0YXJnZXRzLmxlbmd0aDtpKyspIHsgdmFyIHRhcmdldCA9IHRhcmdldHNbaV1cclxuICAgICAgICBpZih0YXJnZXQgPT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcbiAgICAgICAgdGFyZ2V0Ll9zY29yZSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgICAgdGFyZ2V0Ll9pbmRleGVzLmxlbiA9IDBcclxuICAgICAgICByZXN1bHRzLnB1c2godGFyZ2V0KTsgaWYocmVzdWx0cy5sZW5ndGggPj0gbGltaXQpIHJldHVybiByZXN1bHRzXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0c1xyXG4gIH1cclxuXHJcblxyXG4gIHZhciBhbGdvcml0aG0gPSAocHJlcGFyZWRTZWFyY2gsIHByZXBhcmVkLCBhbGxvd1NwYWNlcz1mYWxzZSwgYWxsb3dQYXJ0aWFsTWF0Y2g9ZmFsc2UpID0+IHtcclxuICAgIGlmKGFsbG93U3BhY2VzPT09ZmFsc2UgJiYgcHJlcGFyZWRTZWFyY2guY29udGFpbnNTcGFjZSkgcmV0dXJuIGFsZ29yaXRobVNwYWNlcyhwcmVwYXJlZFNlYXJjaCwgcHJlcGFyZWQsIGFsbG93UGFydGlhbE1hdGNoKVxyXG5cclxuICAgIHZhciBzZWFyY2hMb3dlciAgICAgID0gcHJlcGFyZWRTZWFyY2guX2xvd2VyXHJcbiAgICB2YXIgc2VhcmNoTG93ZXJDb2RlcyA9IHByZXBhcmVkU2VhcmNoLmxvd2VyQ29kZXNcclxuICAgIHZhciBzZWFyY2hMb3dlckNvZGUgID0gc2VhcmNoTG93ZXJDb2Rlc1swXVxyXG4gICAgdmFyIHRhcmdldExvd2VyQ29kZXMgPSBwcmVwYXJlZC5fdGFyZ2V0TG93ZXJDb2Rlc1xyXG4gICAgdmFyIHNlYXJjaExlbiAgICAgICAgPSBzZWFyY2hMb3dlckNvZGVzLmxlbmd0aFxyXG4gICAgdmFyIHRhcmdldExlbiAgICAgICAgPSB0YXJnZXRMb3dlckNvZGVzLmxlbmd0aFxyXG4gICAgdmFyIHNlYXJjaEkgICAgICAgICAgPSAwIC8vIHdoZXJlIHdlIGF0XHJcbiAgICB2YXIgdGFyZ2V0SSAgICAgICAgICA9IDAgLy8gd2hlcmUgeW91IGF0XHJcbiAgICB2YXIgbWF0Y2hlc1NpbXBsZUxlbiA9IDBcclxuXHJcbiAgICAvLyB2ZXJ5IGJhc2ljIGZ1enp5IG1hdGNoOyB0byByZW1vdmUgbm9uLW1hdGNoaW5nIHRhcmdldHMgQVNBUCFcclxuICAgIC8vIHdhbGsgdGhyb3VnaCB0YXJnZXQuIGZpbmQgc2VxdWVudGlhbCBtYXRjaGVzLlxyXG4gICAgLy8gaWYgYWxsIGNoYXJzIGFyZW4ndCBmb3VuZCB0aGVuIGV4aXRcclxuICAgIGZvcig7Oykge1xyXG4gICAgICB2YXIgaXNNYXRjaCA9IHNlYXJjaExvd2VyQ29kZSA9PT0gdGFyZ2V0TG93ZXJDb2Rlc1t0YXJnZXRJXVxyXG4gICAgICBpZihpc01hdGNoKSB7XHJcbiAgICAgICAgbWF0Y2hlc1NpbXBsZVttYXRjaGVzU2ltcGxlTGVuKytdID0gdGFyZ2V0SVxyXG4gICAgICAgICsrc2VhcmNoSTsgaWYoc2VhcmNoSSA9PT0gc2VhcmNoTGVuKSBicmVha1xyXG4gICAgICAgIHNlYXJjaExvd2VyQ29kZSA9IHNlYXJjaExvd2VyQ29kZXNbc2VhcmNoSV1cclxuICAgICAgfVxyXG4gICAgICArK3RhcmdldEk7IGlmKHRhcmdldEkgPj0gdGFyZ2V0TGVuKSByZXR1cm4gTlVMTCAvLyBGYWlsZWQgdG8gZmluZCBzZWFyY2hJXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlYXJjaEkgPSAwXHJcbiAgICB2YXIgc3VjY2Vzc1N0cmljdCA9IGZhbHNlXHJcbiAgICB2YXIgbWF0Y2hlc1N0cmljdExlbiA9IDBcclxuXHJcbiAgICB2YXIgbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBwcmVwYXJlZC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNcclxuICAgIGlmKG5leHRCZWdpbm5pbmdJbmRleGVzID09PSBOVUxMKSBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVkLl9uZXh0QmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVOZXh0QmVnaW5uaW5nSW5kZXhlcyhwcmVwYXJlZC50YXJnZXQpXHJcbiAgICB0YXJnZXRJID0gbWF0Y2hlc1NpbXBsZVswXT09PTAgPyAwIDogbmV4dEJlZ2lubmluZ0luZGV4ZXNbbWF0Y2hlc1NpbXBsZVswXS0xXVxyXG5cclxuICAgIC8vIE91ciB0YXJnZXQgc3RyaW5nIHN1Y2Nlc3NmdWxseSBtYXRjaGVkIGFsbCBjaGFyYWN0ZXJzIGluIHNlcXVlbmNlIVxyXG4gICAgLy8gTGV0J3MgdHJ5IGEgbW9yZSBhZHZhbmNlZCBhbmQgc3RyaWN0IHRlc3QgdG8gaW1wcm92ZSB0aGUgc2NvcmVcclxuICAgIC8vIG9ubHkgY291bnQgaXQgYXMgYSBtYXRjaCBpZiBpdCdzIGNvbnNlY3V0aXZlIG9yIGEgYmVnaW5uaW5nIGNoYXJhY3RlciFcclxuICAgIHZhciBiYWNrdHJhY2tDb3VudCA9IDBcclxuICAgIGlmKHRhcmdldEkgIT09IHRhcmdldExlbikgZm9yKDs7KSB7XHJcbiAgICAgIGlmKHRhcmdldEkgPj0gdGFyZ2V0TGVuKSB7XHJcbiAgICAgICAgLy8gV2UgZmFpbGVkIHRvIGZpbmQgYSBnb29kIHNwb3QgZm9yIHRoaXMgc2VhcmNoIGNoYXIsIGdvIGJhY2sgdG8gdGhlIHByZXZpb3VzIHNlYXJjaCBjaGFyIGFuZCBmb3JjZSBpdCBmb3J3YXJkXHJcbiAgICAgICAgaWYoc2VhcmNoSSA8PSAwKSBicmVhayAvLyBXZSBmYWlsZWQgdG8gcHVzaCBjaGFycyBmb3J3YXJkIGZvciBhIGJldHRlciBtYXRjaFxyXG5cclxuICAgICAgICArK2JhY2t0cmFja0NvdW50OyBpZihiYWNrdHJhY2tDb3VudCA+IDIwMCkgYnJlYWsgLy8gZXhwb25lbnRpYWwgYmFja3RyYWNraW5nIGlzIHRha2luZyB0b28gbG9uZywganVzdCBnaXZlIHVwIGFuZCByZXR1cm4gYSBiYWQgbWF0Y2hcclxuXHJcbiAgICAgICAgLS1zZWFyY2hJXHJcbiAgICAgICAgdmFyIGxhc3RNYXRjaCA9IG1hdGNoZXNTdHJpY3RbLS1tYXRjaGVzU3RyaWN0TGVuXVxyXG4gICAgICAgIHRhcmdldEkgPSBuZXh0QmVnaW5uaW5nSW5kZXhlc1tsYXN0TWF0Y2hdXHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBpc01hdGNoID0gc2VhcmNoTG93ZXJDb2Rlc1tzZWFyY2hJXSA9PT0gdGFyZ2V0TG93ZXJDb2Rlc1t0YXJnZXRJXVxyXG4gICAgICAgIGlmKGlzTWF0Y2gpIHtcclxuICAgICAgICAgIG1hdGNoZXNTdHJpY3RbbWF0Y2hlc1N0cmljdExlbisrXSA9IHRhcmdldElcclxuICAgICAgICAgICsrc2VhcmNoSTsgaWYoc2VhcmNoSSA9PT0gc2VhcmNoTGVuKSB7IHN1Y2Nlc3NTdHJpY3QgPSB0cnVlOyBicmVhayB9XHJcbiAgICAgICAgICArK3RhcmdldElcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGFyZ2V0SSA9IG5leHRCZWdpbm5pbmdJbmRleGVzW3RhcmdldEldXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgaXQncyBhIHN1YnN0cmluZyBtYXRjaFxyXG4gICAgdmFyIHN1YnN0cmluZ0luZGV4ID0gc2VhcmNoTGVuIDw9IDEgPyAtMSA6IHByZXBhcmVkLl90YXJnZXRMb3dlci5pbmRleE9mKHNlYXJjaExvd2VyLCBtYXRjaGVzU2ltcGxlWzBdKSAvLyBwZXJmOiB0aGlzIGlzIHNsb3dcclxuICAgIHZhciBpc1N1YnN0cmluZyA9ICEhfnN1YnN0cmluZ0luZGV4XHJcbiAgICB2YXIgaXNTdWJzdHJpbmdCZWdpbm5pbmcgPSAhaXNTdWJzdHJpbmcgPyBmYWxzZSA6IHN1YnN0cmluZ0luZGV4PT09MCB8fCBwcmVwYXJlZC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNbc3Vic3RyaW5nSW5kZXgtMV0gPT09IHN1YnN0cmluZ0luZGV4XHJcblxyXG4gICAgLy8gaWYgaXQncyBhIHN1YnN0cmluZyBtYXRjaCBidXQgbm90IGF0IGEgYmVnaW5uaW5nIGluZGV4LCBsZXQncyB0cnkgdG8gZmluZCBhIHN1YnN0cmluZyBzdGFydGluZyBhdCBhIGJlZ2lubmluZyBpbmRleCBmb3IgYSBiZXR0ZXIgc2NvcmVcclxuICAgIGlmKGlzU3Vic3RyaW5nICYmICFpc1N1YnN0cmluZ0JlZ2lubmluZykge1xyXG4gICAgICBmb3IodmFyIGk9MDsgaTxuZXh0QmVnaW5uaW5nSW5kZXhlcy5sZW5ndGg7IGk9bmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0pIHtcclxuICAgICAgICBpZihpIDw9IHN1YnN0cmluZ0luZGV4KSBjb250aW51ZVxyXG5cclxuICAgICAgICBmb3IodmFyIHM9MDsgczxzZWFyY2hMZW47IHMrKykgaWYoc2VhcmNoTG93ZXJDb2Rlc1tzXSAhPT0gcHJlcGFyZWQuX3RhcmdldExvd2VyQ29kZXNbaStzXSkgYnJlYWtcclxuICAgICAgICBpZihzID09PSBzZWFyY2hMZW4pIHsgc3Vic3RyaW5nSW5kZXggPSBpOyBpc1N1YnN0cmluZ0JlZ2lubmluZyA9IHRydWU7IGJyZWFrIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHRhbGx5IHVwIHRoZSBzY29yZSAmIGtlZXAgdHJhY2sgb2YgbWF0Y2hlcyBmb3IgaGlnaGxpZ2h0aW5nIGxhdGVyXHJcbiAgICAvLyBpZiBpdCdzIGEgc2ltcGxlIG1hdGNoLCB3ZSdsbCBzd2l0Y2ggdG8gYSBzdWJzdHJpbmcgbWF0Y2ggaWYgYSBzdWJzdHJpbmcgZXhpc3RzXHJcbiAgICAvLyBpZiBpdCdzIGEgc3RyaWN0IG1hdGNoLCB3ZSdsbCBzd2l0Y2ggdG8gYSBzdWJzdHJpbmcgbWF0Y2ggb25seSBpZiB0aGF0J3MgYSBiZXR0ZXIgc2NvcmVcclxuXHJcbiAgICB2YXIgY2FsY3VsYXRlU2NvcmUgPSBtYXRjaGVzID0+IHtcclxuICAgICAgdmFyIHNjb3JlID0gMFxyXG5cclxuICAgICAgdmFyIGV4dHJhTWF0Y2hHcm91cENvdW50ID0gMFxyXG4gICAgICBmb3IodmFyIGkgPSAxOyBpIDwgc2VhcmNoTGVuOyArK2kpIHtcclxuICAgICAgICBpZihtYXRjaGVzW2ldIC0gbWF0Y2hlc1tpLTFdICE9PSAxKSB7c2NvcmUgLT0gbWF0Y2hlc1tpXTsgKytleHRyYU1hdGNoR3JvdXBDb3VudH1cclxuICAgICAgfVxyXG4gICAgICB2YXIgdW5tYXRjaGVkRGlzdGFuY2UgPSBtYXRjaGVzW3NlYXJjaExlbi0xXSAtIG1hdGNoZXNbMF0gLSAoc2VhcmNoTGVuLTEpXHJcblxyXG4gICAgICBzY29yZSAtPSAoMTIrdW5tYXRjaGVkRGlzdGFuY2UpICogZXh0cmFNYXRjaEdyb3VwQ291bnQgLy8gcGVuYWxpdHkgZm9yIG1vcmUgZ3JvdXBzXHJcblxyXG4gICAgICBpZihtYXRjaGVzWzBdICE9PSAwKSBzY29yZSAtPSBtYXRjaGVzWzBdKm1hdGNoZXNbMF0qLjIgLy8gcGVuYWxpdHkgZm9yIG5vdCBzdGFydGluZyBuZWFyIHRoZSBiZWdpbm5pbmdcclxuXHJcbiAgICAgIGlmKCFzdWNjZXNzU3RyaWN0KSB7XHJcbiAgICAgICAgc2NvcmUgKj0gMTAwMFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIHN1Y2Nlc3NTdHJpY3Qgb24gYSB0YXJnZXQgd2l0aCB0b28gbWFueSBiZWdpbm5pbmcgaW5kZXhlcyBsb3NlcyBwb2ludHMgZm9yIGJlaW5nIGEgYmFkIHRhcmdldFxyXG4gICAgICAgIHZhciB1bmlxdWVCZWdpbm5pbmdJbmRleGVzID0gMVxyXG4gICAgICAgIGZvcih2YXIgaSA9IG5leHRCZWdpbm5pbmdJbmRleGVzWzBdOyBpIDwgdGFyZ2V0TGVuOyBpPW5leHRCZWdpbm5pbmdJbmRleGVzW2ldKSArK3VuaXF1ZUJlZ2lubmluZ0luZGV4ZXNcclxuXHJcbiAgICAgICAgaWYodW5pcXVlQmVnaW5uaW5nSW5kZXhlcyA+IDI0KSBzY29yZSAqPSAodW5pcXVlQmVnaW5uaW5nSW5kZXhlcy0yNCkqMTAgLy8gcXVpdGUgYXJiaXRyYXJ5IG51bWJlcnMgaGVyZSAuLi5cclxuICAgICAgfVxyXG5cclxuICAgICAgc2NvcmUgLT0gKHRhcmdldExlbiAtIHNlYXJjaExlbikvMiAvLyBwZW5hbGl0eSBmb3IgbG9uZ2VyIHRhcmdldHNcclxuXHJcbiAgICAgIGlmKGlzU3Vic3RyaW5nKSAgICAgICAgICBzY29yZSAvPSAxK3NlYXJjaExlbipzZWFyY2hMZW4qMSAvLyBib251cyBmb3IgYmVpbmcgYSBmdWxsIHN1YnN0cmluZ1xyXG4gICAgICBpZihpc1N1YnN0cmluZ0JlZ2lubmluZykgc2NvcmUgLz0gMStzZWFyY2hMZW4qc2VhcmNoTGVuKjEgLy8gYm9udXMgZm9yIHN1YnN0cmluZyBzdGFydGluZyBvbiBhIGJlZ2lubmluZ0luZGV4XHJcblxyXG4gICAgICBzY29yZSAtPSAodGFyZ2V0TGVuIC0gc2VhcmNoTGVuKS8yIC8vIHBlbmFsaXR5IGZvciBsb25nZXIgdGFyZ2V0c1xyXG5cclxuICAgICAgcmV0dXJuIHNjb3JlXHJcbiAgICB9XHJcblxyXG4gICAgaWYoIXN1Y2Nlc3NTdHJpY3QpIHtcclxuICAgICAgaWYoaXNTdWJzdHJpbmcpIGZvcih2YXIgaT0wOyBpPHNlYXJjaExlbjsgKytpKSBtYXRjaGVzU2ltcGxlW2ldID0gc3Vic3RyaW5nSW5kZXgraSAvLyBhdCB0aGlzIHBvaW50IGl0J3Mgc2FmZSB0byBvdmVyd3JpdGUgbWF0Y2hlaHNTaW1wbGUgd2l0aCBzdWJzdHIgbWF0Y2hlc1xyXG4gICAgICB2YXIgbWF0Y2hlc0Jlc3QgPSBtYXRjaGVzU2ltcGxlXHJcbiAgICAgIHZhciBzY29yZSA9IGNhbGN1bGF0ZVNjb3JlKG1hdGNoZXNCZXN0KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYoaXNTdWJzdHJpbmdCZWdpbm5pbmcpIHtcclxuICAgICAgICBmb3IodmFyIGk9MDsgaTxzZWFyY2hMZW47ICsraSkgbWF0Y2hlc1NpbXBsZVtpXSA9IHN1YnN0cmluZ0luZGV4K2kgLy8gYXQgdGhpcyBwb2ludCBpdCdzIHNhZmUgdG8gb3ZlcndyaXRlIG1hdGNoZWhzU2ltcGxlIHdpdGggc3Vic3RyIG1hdGNoZXNcclxuICAgICAgICB2YXIgbWF0Y2hlc0Jlc3QgPSBtYXRjaGVzU2ltcGxlXHJcbiAgICAgICAgdmFyIHNjb3JlID0gY2FsY3VsYXRlU2NvcmUobWF0Y2hlc1NpbXBsZSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgbWF0Y2hlc0Jlc3QgPSBtYXRjaGVzU3RyaWN0XHJcbiAgICAgICAgdmFyIHNjb3JlID0gY2FsY3VsYXRlU2NvcmUobWF0Y2hlc1N0cmljdClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByZXBhcmVkLl9zY29yZSA9IHNjb3JlXHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHNlYXJjaExlbjsgKytpKSBwcmVwYXJlZC5faW5kZXhlc1tpXSA9IG1hdGNoZXNCZXN0W2ldXHJcbiAgICBwcmVwYXJlZC5faW5kZXhlcy5sZW4gPSBzZWFyY2hMZW5cclxuXHJcbiAgICBjb25zdCByZXN1bHQgICAgPSBuZXcgUmVzdWx0KClcclxuICAgIHJlc3VsdC50YXJnZXQgICA9IHByZXBhcmVkLnRhcmdldFxyXG4gICAgcmVzdWx0Ll9zY29yZSAgID0gcHJlcGFyZWQuX3Njb3JlXHJcbiAgICByZXN1bHQuX2luZGV4ZXMgPSBwcmVwYXJlZC5faW5kZXhlc1xyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG4gIH1cclxuICB2YXIgYWxnb3JpdGhtU3BhY2VzID0gKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQsIGFsbG93UGFydGlhbE1hdGNoKSA9PiB7XHJcbiAgICB2YXIgc2Vlbl9pbmRleGVzID0gbmV3IFNldCgpXHJcbiAgICB2YXIgc2NvcmUgPSAwXHJcbiAgICB2YXIgcmVzdWx0ID0gTlVMTFxyXG5cclxuICAgIHZhciBmaXJzdF9zZWVuX2luZGV4X2xhc3Rfc2VhcmNoID0gMFxyXG4gICAgdmFyIHNlYXJjaGVzID0gcHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlc1xyXG4gICAgdmFyIHNlYXJjaGVzTGVuID0gc2VhcmNoZXMubGVuZ3RoXHJcbiAgICB2YXIgY2hhbmdlc2xlbiA9IDBcclxuXHJcbiAgICAvLyBSZXR1cm4gX25leHRCZWdpbm5pbmdJbmRleGVzIGJhY2sgdG8gaXRzIG5vcm1hbCBzdGF0ZVxyXG4gICAgdmFyIHJlc2V0TmV4dEJlZ2lubmluZ0luZGV4ZXMgPSAoKSA9PiB7XHJcbiAgICAgIGZvcihsZXQgaT1jaGFuZ2VzbGVuLTE7IGk+PTA7IGktLSkgdGFyZ2V0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlc1tuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXNbaSoyICsgMF1dID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzW2kqMiArIDFdXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhhc0F0TGVhc3QxTWF0Y2ggPSBmYWxzZVxyXG4gICAgZm9yKHZhciBpPTA7IGk8c2VhcmNoZXNMZW47ICsraSkge1xyXG4gICAgICBhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgIHZhciBzZWFyY2ggPSBzZWFyY2hlc1tpXVxyXG5cclxuICAgICAgcmVzdWx0ID0gYWxnb3JpdGhtKHNlYXJjaCwgdGFyZ2V0KVxyXG4gICAgICBpZihhbGxvd1BhcnRpYWxNYXRjaCkge1xyXG4gICAgICAgIGlmKHJlc3VsdCA9PT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBoYXNBdExlYXN0MU1hdGNoID0gdHJ1ZVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmKHJlc3VsdCA9PT0gTlVMTCkge3Jlc2V0TmV4dEJlZ2lubmluZ0luZGV4ZXMoKTsgcmV0dXJuIE5VTEx9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGlmIG5vdCB0aGUgbGFzdCBzZWFyY2gsIHdlIG5lZWQgdG8gbXV0YXRlIF9uZXh0QmVnaW5uaW5nSW5kZXhlcyBmb3IgdGhlIG5leHQgc2VhcmNoXHJcbiAgICAgIHZhciBpc1RoZUxhc3RTZWFyY2ggPSBpID09PSBzZWFyY2hlc0xlbiAtIDFcclxuICAgICAgaWYoIWlzVGhlTGFzdFNlYXJjaCkge1xyXG4gICAgICAgIHZhciBpbmRleGVzID0gcmVzdWx0Ll9pbmRleGVzXHJcblxyXG4gICAgICAgIHZhciBpbmRleGVzSXNDb25zZWN1dGl2ZVN1YnN0cmluZyA9IHRydWVcclxuICAgICAgICBmb3IobGV0IGk9MDsgaTxpbmRleGVzLmxlbi0xOyBpKyspIHtcclxuICAgICAgICAgIGlmKGluZGV4ZXNbaSsxXSAtIGluZGV4ZXNbaV0gIT09IDEpIHtcclxuICAgICAgICAgICAgaW5kZXhlc0lzQ29uc2VjdXRpdmVTdWJzdHJpbmcgPSBmYWxzZTsgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihpbmRleGVzSXNDb25zZWN1dGl2ZVN1YnN0cmluZykge1xyXG4gICAgICAgICAgdmFyIG5ld0JlZ2lubmluZ0luZGV4ID0gaW5kZXhlc1tpbmRleGVzLmxlbi0xXSArIDFcclxuICAgICAgICAgIHZhciB0b1JlcGxhY2UgPSB0YXJnZXQuX25leHRCZWdpbm5pbmdJbmRleGVzW25ld0JlZ2lubmluZ0luZGV4LTFdXHJcbiAgICAgICAgICBmb3IobGV0IGk9bmV3QmVnaW5uaW5nSW5kZXgtMTsgaT49MDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGlmKHRvUmVwbGFjZSAhPT0gdGFyZ2V0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSkgYnJlYWtcclxuICAgICAgICAgICAgdGFyZ2V0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSA9IG5ld0JlZ2lubmluZ0luZGV4XHJcbiAgICAgICAgICAgIG5leHRCZWdpbm5pbmdJbmRleGVzQ2hhbmdlc1tjaGFuZ2VzbGVuKjIgKyAwXSA9IGlcclxuICAgICAgICAgICAgbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzW2NoYW5nZXNsZW4qMiArIDFdID0gdG9SZXBsYWNlXHJcbiAgICAgICAgICAgIGNoYW5nZXNsZW4rK1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgc2NvcmUgKz0gcmVzdWx0Ll9zY29yZSAvIHNlYXJjaGVzTGVuXHJcbiAgICAgIGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldID0gcmVzdWx0Ll9zY29yZSAvIHNlYXJjaGVzTGVuXHJcblxyXG4gICAgICAvLyBkb2NrIHBvaW50cyBiYXNlZCBvbiBvcmRlciBvdGhlcndpc2UgXCJjIG1hblwiIHJldHVybnMgTWFuaWZlc3QuY3BwIGluc3RlYWQgb2YgQ2hlYXRNYW5hZ2VyLmhcclxuICAgICAgaWYocmVzdWx0Ll9pbmRleGVzWzBdIDwgZmlyc3Rfc2Vlbl9pbmRleF9sYXN0X3NlYXJjaCkge1xyXG4gICAgICAgIHNjb3JlIC09IChmaXJzdF9zZWVuX2luZGV4X2xhc3Rfc2VhcmNoIC0gcmVzdWx0Ll9pbmRleGVzWzBdKSAqIDJcclxuICAgICAgfVxyXG4gICAgICBmaXJzdF9zZWVuX2luZGV4X2xhc3Rfc2VhcmNoID0gcmVzdWx0Ll9pbmRleGVzWzBdXHJcblxyXG4gICAgICBmb3IodmFyIGo9MDsgajxyZXN1bHQuX2luZGV4ZXMubGVuOyArK2opIHNlZW5faW5kZXhlcy5hZGQocmVzdWx0Ll9pbmRleGVzW2pdKVxyXG4gICAgfVxyXG5cclxuICAgIGlmKGFsbG93UGFydGlhbE1hdGNoICYmICFoYXNBdExlYXN0MU1hdGNoKSByZXR1cm4gTlVMTFxyXG5cclxuICAgIHJlc2V0TmV4dEJlZ2lubmluZ0luZGV4ZXMoKVxyXG5cclxuICAgIC8vIGFsbG93cyBhIHNlYXJjaCB3aXRoIHNwYWNlcyB0aGF0J3MgYW4gZXhhY3Qgc3Vic3RyaW5nIHRvIHNjb3JlIHdlbGxcclxuICAgIHZhciBhbGxvd1NwYWNlc1Jlc3VsdCA9IGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0LCAvKmFsbG93U3BhY2VzPSovdHJ1ZSlcclxuICAgIGlmKGFsbG93U3BhY2VzUmVzdWx0ICE9PSBOVUxMICYmIGFsbG93U3BhY2VzUmVzdWx0Ll9zY29yZSA+IHNjb3JlKSB7XHJcbiAgICAgIGlmKGFsbG93UGFydGlhbE1hdGNoKSB7XHJcbiAgICAgICAgZm9yKHZhciBpPTA7IGk8c2VhcmNoZXNMZW47ICsraSkge1xyXG4gICAgICAgICAgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0gPSBhbGxvd1NwYWNlc1Jlc3VsdC5fc2NvcmUgLyBzZWFyY2hlc0xlblxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYWxsb3dTcGFjZXNSZXN1bHRcclxuICAgIH1cclxuXHJcbiAgICBpZihhbGxvd1BhcnRpYWxNYXRjaCkgcmVzdWx0ID0gdGFyZ2V0XHJcbiAgICByZXN1bHQuX3Njb3JlID0gc2NvcmVcclxuXHJcbiAgICB2YXIgaSA9IDBcclxuICAgIGZvciAobGV0IGluZGV4IG9mIHNlZW5faW5kZXhlcykgcmVzdWx0Ll9pbmRleGVzW2krK10gPSBpbmRleFxyXG4gICAgcmVzdWx0Ll9pbmRleGVzLmxlbiA9IGlcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbiAgfVxyXG5cclxuICAvLyB3ZSB1c2UgdGhpcyBpbnN0ZWFkIG9mIGp1c3QgLm5vcm1hbGl6ZSgnTkZEJykucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgJycpIGJlY2F1c2UgdGhhdCBzY3Jld3Mgd2l0aCBqYXBhbmVzZSBjaGFyYWN0ZXJzXHJcbiAgdmFyIHJlbW92ZV9hY2NlbnRzID0gKHN0cikgPT4gc3RyLnJlcGxhY2UoL1xccHtTY3JpcHQ9TGF0aW59Ky9ndSwgbWF0Y2ggPT4gbWF0Y2gubm9ybWFsaXplKCdORkQnKSkucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgJycpXHJcblxyXG4gIHZhciBwcmVwYXJlTG93ZXJJbmZvID0gKHN0cikgPT4ge1xyXG4gICAgc3RyID0gcmVtb3ZlX2FjY2VudHMoc3RyKVxyXG4gICAgdmFyIHN0ckxlbiA9IHN0ci5sZW5ndGhcclxuICAgIHZhciBsb3dlciA9IHN0ci50b0xvd2VyQ2FzZSgpXHJcbiAgICB2YXIgbG93ZXJDb2RlcyA9IFtdIC8vIG5ldyBBcnJheShzdHJMZW4pICAgIHNwYXJzZSBhcnJheSBpcyB0b28gc2xvd1xyXG4gICAgdmFyIGJpdGZsYWdzID0gMFxyXG4gICAgdmFyIGNvbnRhaW5zU3BhY2UgPSBmYWxzZSAvLyBzcGFjZSBpc24ndCBzdG9yZWQgaW4gYml0ZmxhZ3MgYmVjYXVzZSBvZiBob3cgc2VhcmNoaW5nIHdpdGggYSBzcGFjZSB3b3Jrc1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzdHJMZW47ICsraSkge1xyXG4gICAgICB2YXIgbG93ZXJDb2RlID0gbG93ZXJDb2Rlc1tpXSA9IGxvd2VyLmNoYXJDb2RlQXQoaSlcclxuXHJcbiAgICAgIGlmKGxvd2VyQ29kZSA9PT0gMzIpIHtcclxuICAgICAgICBjb250YWluc1NwYWNlID0gdHJ1ZVxyXG4gICAgICAgIGNvbnRpbnVlIC8vIGl0J3MgaW1wb3J0YW50IHRoYXQgd2UgZG9uJ3Qgc2V0IGFueSBiaXRmbGFncyBmb3Igc3BhY2VcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGJpdCA9IGxvd2VyQ29kZT49OTcmJmxvd2VyQ29kZTw9MTIyID8gbG93ZXJDb2RlLTk3IC8vIGFscGhhYmV0XHJcbiAgICAgICAgICAgICAgOiBsb3dlckNvZGU+PTQ4JiZsb3dlckNvZGU8PTU3ICA/IDI2ICAgICAgICAgICAvLyBudW1iZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAzIGJpdHMgYXZhaWxhYmxlXHJcbiAgICAgICAgICAgICAgOiBsb3dlckNvZGU8PTEyNyAgICAgICAgICAgICAgICA/IDMwICAgICAgICAgICAvLyBvdGhlciBhc2NpaVxyXG4gICAgICAgICAgICAgIDogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAzMSAgICAgICAgICAgLy8gb3RoZXIgdXRmOFxyXG4gICAgICBiaXRmbGFncyB8PSAxPDxiaXRcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge2xvd2VyQ29kZXM6bG93ZXJDb2RlcywgYml0ZmxhZ3M6Yml0ZmxhZ3MsIGNvbnRhaW5zU3BhY2U6Y29udGFpbnNTcGFjZSwgX2xvd2VyOmxvd2VyfVxyXG4gIH1cclxuICB2YXIgcHJlcGFyZUJlZ2lubmluZ0luZGV4ZXMgPSAodGFyZ2V0KSA9PiB7XHJcbiAgICB2YXIgdGFyZ2V0TGVuID0gdGFyZ2V0Lmxlbmd0aFxyXG4gICAgdmFyIGJlZ2lubmluZ0luZGV4ZXMgPSBbXTsgdmFyIGJlZ2lubmluZ0luZGV4ZXNMZW4gPSAwXHJcbiAgICB2YXIgd2FzVXBwZXIgPSBmYWxzZVxyXG4gICAgdmFyIHdhc0FscGhhbnVtID0gZmFsc2VcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRMZW47ICsraSkge1xyXG4gICAgICB2YXIgdGFyZ2V0Q29kZSA9IHRhcmdldC5jaGFyQ29kZUF0KGkpXHJcbiAgICAgIHZhciBpc1VwcGVyID0gdGFyZ2V0Q29kZT49NjUmJnRhcmdldENvZGU8PTkwXHJcbiAgICAgIHZhciBpc0FscGhhbnVtID0gaXNVcHBlciB8fCB0YXJnZXRDb2RlPj05NyYmdGFyZ2V0Q29kZTw9MTIyIHx8IHRhcmdldENvZGU+PTQ4JiZ0YXJnZXRDb2RlPD01N1xyXG4gICAgICB2YXIgaXNCZWdpbm5pbmcgPSBpc1VwcGVyICYmICF3YXNVcHBlciB8fCAhd2FzQWxwaGFudW0gfHwgIWlzQWxwaGFudW1cclxuICAgICAgd2FzVXBwZXIgPSBpc1VwcGVyXHJcbiAgICAgIHdhc0FscGhhbnVtID0gaXNBbHBoYW51bVxyXG4gICAgICBpZihpc0JlZ2lubmluZykgYmVnaW5uaW5nSW5kZXhlc1tiZWdpbm5pbmdJbmRleGVzTGVuKytdID0gaVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJlZ2lubmluZ0luZGV4ZXNcclxuICB9XHJcbiAgdmFyIHByZXBhcmVOZXh0QmVnaW5uaW5nSW5kZXhlcyA9ICh0YXJnZXQpID0+IHtcclxuICAgIHRhcmdldCA9IHJlbW92ZV9hY2NlbnRzKHRhcmdldClcclxuICAgIHZhciB0YXJnZXRMZW4gPSB0YXJnZXQubGVuZ3RoXHJcbiAgICB2YXIgYmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVCZWdpbm5pbmdJbmRleGVzKHRhcmdldClcclxuICAgIHZhciBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IFtdIC8vIG5ldyBBcnJheSh0YXJnZXRMZW4pICAgICBzcGFyc2UgYXJyYXkgaXMgdG9vIHNsb3dcclxuICAgIHZhciBsYXN0SXNCZWdpbm5pbmcgPSBiZWdpbm5pbmdJbmRleGVzWzBdXHJcbiAgICB2YXIgbGFzdElzQmVnaW5uaW5nSSA9IDBcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRMZW47ICsraSkge1xyXG4gICAgICBpZihsYXN0SXNCZWdpbm5pbmcgPiBpKSB7XHJcbiAgICAgICAgbmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0gPSBsYXN0SXNCZWdpbm5pbmdcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsYXN0SXNCZWdpbm5pbmcgPSBiZWdpbm5pbmdJbmRleGVzWysrbGFzdElzQmVnaW5uaW5nSV1cclxuICAgICAgICBuZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSA9IGxhc3RJc0JlZ2lubmluZz09PXVuZGVmaW5lZCA/IHRhcmdldExlbiA6IGxhc3RJc0JlZ2lubmluZ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV4dEJlZ2lubmluZ0luZGV4ZXNcclxuICB9XHJcblxyXG4gIHZhciBwcmVwYXJlZENhY2hlICAgICAgID0gbmV3IE1hcCgpXHJcbiAgdmFyIHByZXBhcmVkU2VhcmNoQ2FjaGUgPSBuZXcgTWFwKClcclxuXHJcbiAgLy8gdGhlIHRoZW9yeSBiZWhpbmQgdGhlc2UgYmVpbmcgZ2xvYmFscyBpcyB0byByZWR1Y2UgZ2FyYmFnZSBjb2xsZWN0aW9uIGJ5IG5vdCBtYWtpbmcgbmV3IGFycmF5c1xyXG4gIHZhciBtYXRjaGVzU2ltcGxlID0gW107IHZhciBtYXRjaGVzU3RyaWN0ID0gW11cclxuICB2YXIgbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzID0gW10gLy8gYWxsb3dzIHN0cmF3IGJlcnJ5IHRvIG1hdGNoIHN0cmF3YmVycnkgd2VsbCwgYnkgbW9kaWZ5aW5nIHRoZSBlbmQgb2YgYSBzdWJzdHJpbmcgdG8gYmUgY29uc2lkZXJlZCBhIGJlZ2lubmluZyBpbmRleCBmb3IgdGhlIHJlc3Qgb2YgdGhlIHNlYXJjaFxyXG4gIHZhciBrZXlzU3BhY2VzQmVzdFNjb3JlcyA9IFtdOyB2YXIgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXMgPSBbXVxyXG4gIHZhciB0bXBUYXJnZXRzID0gW107IHZhciB0bXBSZXN1bHRzID0gW11cclxuXHJcbiAgLy8gcHJvcCA9ICdrZXknICAgICAgICAgICAgICAgICAgMi41bXMgb3B0aW1pemVkIGZvciB0aGlzIGNhc2UsIHNlZW1zIHRvIGJlIGFib3V0IGFzIGZhc3QgYXMgZGlyZWN0IG9ialtwcm9wXVxyXG4gIC8vIHByb3AgPSAna2V5MS5rZXkyJyAgICAgICAgICAgIDEwbXNcclxuICAvLyBwcm9wID0gWydrZXkxJywgJ2tleTInXSAgICAgICAyN21zXHJcbiAgLy8gcHJvcCA9IG9iaiA9PiBvYmoudGFncy5qb2luKCkgPz9tc1xyXG4gIHZhciBnZXRWYWx1ZSA9IChvYmosIHByb3ApID0+IHtcclxuICAgIHZhciB0bXAgPSBvYmpbcHJvcF07IGlmKHRtcCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdG1wXHJcbiAgICBpZih0eXBlb2YgcHJvcCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHByb3Aob2JqKSAvLyB0aGlzIHNob3VsZCBydW4gZmlyc3QuIGJ1dCB0aGF0IG1ha2VzIHN0cmluZyBwcm9wcyBzbG93ZXJcclxuICAgIHZhciBzZWdzID0gcHJvcFxyXG4gICAgaWYoIUFycmF5LmlzQXJyYXkocHJvcCkpIHNlZ3MgPSBwcm9wLnNwbGl0KCcuJylcclxuICAgIHZhciBsZW4gPSBzZWdzLmxlbmd0aFxyXG4gICAgdmFyIGkgPSAtMVxyXG4gICAgd2hpbGUgKG9iaiAmJiAoKytpIDwgbGVuKSkgb2JqID0gb2JqW3NlZ3NbaV1dXHJcbiAgICByZXR1cm4gb2JqXHJcbiAgfVxyXG5cclxuICB2YXIgaXNQcmVwYXJlZCA9ICh4KSA9PiB7IHJldHVybiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHguX2JpdGZsYWdzID09PSAnbnVtYmVyJyB9XHJcbiAgdmFyIElORklOSVRZID0gSW5maW5pdHk7IHZhciBORUdBVElWRV9JTkZJTklUWSA9IC1JTkZJTklUWVxyXG4gIHZhciBub1Jlc3VsdHMgPSBbXTsgbm9SZXN1bHRzLnRvdGFsID0gMFxyXG4gIHZhciBOVUxMID0gbnVsbFxyXG5cclxuICB2YXIgbm9UYXJnZXQgPSBwcmVwYXJlKCcnKVxyXG5cclxuICAvLyBIYWNrZWQgdmVyc2lvbiBvZiBodHRwczovL2dpdGh1Yi5jb20vbGVtaXJlL0Zhc3RQcmlvcml0eVF1ZXVlLmpzXHJcbiAgdmFyIGZhc3Rwcmlvcml0eXF1ZXVlPXI9Pnt2YXIgZT1bXSxvPTAsYT17fSx2PXI9Pntmb3IodmFyIGE9MCx2PWVbYV0sYz0xO2M8bzspe3ZhciBzPWMrMTthPWMsczxvJiZlW3NdLl9zY29yZTxlW2NdLl9zY29yZSYmKGE9cyksZVthLTE+PjFdPWVbYV0sYz0xKyhhPDwxKX1mb3IodmFyIGY9YS0xPj4xO2E+MCYmdi5fc2NvcmU8ZVtmXS5fc2NvcmU7Zj0oYT1mKS0xPj4xKWVbYV09ZVtmXTtlW2FdPXZ9O3JldHVybiBhLmFkZD0ocj0+e3ZhciBhPW87ZVtvKytdPXI7Zm9yKHZhciB2PWEtMT4+MTthPjAmJnIuX3Njb3JlPGVbdl0uX3Njb3JlO3Y9KGE9diktMT4+MSllW2FdPWVbdl07ZVthXT1yfSksYS5wb2xsPShyPT57aWYoMCE9PW8pe3ZhciBhPWVbMF07cmV0dXJuIGVbMF09ZVstLW9dLHYoKSxhfX0pLGEucGVlaz0ocj0+e2lmKDAhPT1vKXJldHVybiBlWzBdfSksYS5yZXBsYWNlVG9wPShyPT57ZVswXT1yLHYoKX0pLGF9XHJcbiAgdmFyIHEgPSBmYXN0cHJpb3JpdHlxdWV1ZSgpIC8vIHJldXNlIHRoaXNcclxuXHJcbiAgLy8gZnV6enlzb3J0IGlzIHdyaXR0ZW4gdGhpcyB3YXkgZm9yIG1pbmlmaWNhdGlvbi4gYWxsIG5hbWVzIGFyZSBtYW5nZWxlZCB1bmxlc3MgcXVvdGVkXHJcbiAgcmV0dXJuIHsnc2luZ2xlJzpzaW5nbGUsICdnbyc6Z28sICdwcmVwYXJlJzpwcmVwYXJlLCAnY2xlYW51cCc6Y2xlYW51cH1cclxufSkgLy8gVU1EXHJcbiIsICIvKiogUmVzdWx0IGFsbG93cyBlYXNpZXIgaGFuZGxpbmcgb2YgcmV0dXJuaW5nIGVpdGhlciBhbiBlcnJvciBvciBhIHZhbHVlIGZyb20gYVxuICogZnVuY3Rpb24uICovXG5leHBvcnQgdHlwZSBSZXN1bHQ8VD4gPSB7IG9rOiB0cnVlOyB2YWx1ZTogVCB9IHwgeyBvazogZmFsc2U7IGVycm9yOiBFcnJvciB9O1xuXG5leHBvcnQgZnVuY3Rpb24gb2s8VD4odmFsdWU6IFQpOiBSZXN1bHQ8VD4ge1xuICByZXR1cm4geyBvazogdHJ1ZSwgdmFsdWU6IHZhbHVlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcnJvcjxUPih2YWx1ZTogc3RyaW5nIHwgRXJyb3IpOiBSZXN1bHQ8VD4ge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogbmV3IEVycm9yKHZhbHVlKSB9O1xuICB9XG4gIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IHZhbHVlIH07XG59XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvayB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5cbi8vIE9wZXJhdGlvbnMgb24gUGxhbnMuIE5vdGUgdGhleSBhcmUgcmV2ZXJzaWJsZSwgc28gd2UgY2FuIGhhdmUgYW4gJ3VuZG8nIGxpc3QuXG5cbi8vIEFsc28sIHNvbWUgb3BlcmF0aW9ucyBtaWdodCBoYXZlICdwYXJ0aWFscycsIGkuZS4gcmV0dXJuIGEgbGlzdCBvZiB2YWxpZFxuLy8gb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlIG9wZXJhdGlvbi4gRm9yIGV4YW1wbGUsIGFkZGluZyBhXG4vLyBwcmVkZWNlc3NvciBjb3VsZCBsaXN0IGFsbCB0aGUgVGFza3MgdGhhdCB3b3VsZCBub3QgZm9ybSBhIGxvb3AsIGkuZS4gZXhjbHVkZVxuLy8gYWxsIGRlc2NlbmRlbnRzLCBhbmQgdGhlIFRhc2sgaXRzZWxmLCBmcm9tIHRoZSBsaXN0IG9mIG9wdGlvbnMuXG4vL1xuLy8gKiBDaGFuZ2Ugc3RyaW5nIHZhbHVlIGluIGEgVGFzay5cbi8vICogQ2hhbmdlIGR1cmF0aW9uIHZhbHVlIGluIGEgVGFzay5cbi8vICogSW5zZXJ0IG5ldyBlbXB0eSBUYXNrIGFmdGVyIEluZGV4LlxuLy8gKiBTcGxpdCBhIFRhc2suIChQcmVkZWNlc3NvciB0YWtlcyBhbGwgaW5jb21pbmcgZWRnZXMsIHNvdXJjZSB0YXNrcyBhbGwgb3V0Z29pbmcgZWRnZXMpLlxuLy9cbi8vICogRHVwbGljYXRlIGEgVGFzayAoYWxsIGVkZ2VzIGFyZSBkdXBsaWNhdGVkIGZyb20gdGhlIHNvdXJjZSBUYXNrKS5cbi8vICogRGVsZXRlIHByZWRlY2Vzc29yIHRvIGEgVGFzay5cbi8vICogRGVsZXRlIHN1Y2Nlc3NvciB0byBhIFRhc2suXG4vLyAqIERlbGV0ZSBhIFRhc2suXG5cbi8vIE5lZWQgVW5kby9SZWRvIFN0YWNrcy5cbi8vIFRoZXNlIHJlY29yZCB0aGUgc3ViLW9wcyBmb3IgZWFjaCBsYXJnZSBvcC4gRS5nLiBhbiBpbnNlcnQgdGFzayBvcCBpcyBtYWRlXG4vLyBvZiB0aHJlZSBzdWItb3BzOlxuLy8gICAgMS4gaW5zZXJ0IHRhc2sgaW50byBWZXJ0aWNlcyBhbmQgcmVudW1iZXIgRWRnZXNcbi8vICAgIDIuIEFkZCBlZGdlIGZyb20gU3RhcnQgdG8gTmV3IFRhc2tcbi8vICAgIDMuIEFkZCBlZGdlIGZyb20gTmV3IFRhc2sgdG8gRmluaXNoXG4vL1xuLy8gRWFjaCBzdWItb3A6XG4vLyAgICAxLiBSZWNvcmRzIGFsbCB0aGUgaW5mbyBpdCBuZWVkcyB0byB3b3JrLlxuLy8gICAgMi4gQ2FuIGJlIFwiYXBwbGllZFwiIHRvIGEgUGxhbi5cbi8vICAgIDMuIENhbiBnZW5lcmF0ZSBpdHMgaW52ZXJzZSBzdWItb3AuXG5cbi8vIFRoZSByZXN1bHRzIGZyb20gYXBwbHlpbmcgYSBTdWJPcC4gVGhpcyBpcyB0aGUgb25seSB3YXkgdG8gZ2V0IHRoZSBpbnZlcnNlIG9mXG4vLyBhIFN1Yk9wIHNpbmNlIHRoZSBTdWJPcCBpbnZlcnNlIG1pZ2h0IGRlcGVuZCBvbiB0aGUgc3RhdGUgb2YgdGhlIFBsYW4gYXQgdGhlXG4vLyB0aW1lIHRoZSBTdWJPcCB3YXMgYXBwbGllZC5cbmV4cG9ydCBpbnRlcmZhY2UgU3ViT3BSZXN1bHQge1xuICBwbGFuOiBQbGFuO1xuICBpbnZlcnNlOiBTdWJPcDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdWJPcCB7XG4gIC8vIElmIHRoZSBhcHBseSByZXR1cm5zIGFuIGVycm9yIGl0IGlzIGd1YXJhbnRlZWQgbm90IHRvIGhhdmUgbW9kaWZpZWQgdGhlXG4gIC8vIFBsYW4uXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3BSZXN1bHQge1xuICBwbGFuOiBQbGFuO1xuICBpbnZlcnNlOiBPcDtcbn1cblxuLy8gT3AgYXJlIG9wZXJhdGlvbnMgYXJlIGFwcGxpZWQgdG8gbWFrZSBjaGFuZ2VzIHRvIGEgUGxhbi5cbmV4cG9ydCBjbGFzcyBPcCB7XG4gIHN1Yk9wczogU3ViT3BbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHN1Yk9wczogU3ViT3BbXSkge1xuICAgIHRoaXMuc3ViT3BzID0gc3ViT3BzO1xuICB9XG5cbiAgLy8gUmV2ZXJ0cyBhbGwgU3ViT3BzIHVwIHRvIHRoZSBnaXZlbiBpbmRleC5cbiAgYXBwbHlBbGxJbnZlcnNlU3ViT3BzVG9QbGFuKFxuICAgIHBsYW46IFBsYW4sXG4gICAgaW52ZXJzZVN1Yk9wczogU3ViT3BbXVxuICApOiBSZXN1bHQ8UGxhbj4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW52ZXJzZVN1Yk9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZSA9IGludmVyc2VTdWJPcHNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHBsYW4pO1xuICB9XG5cbiAgLy8gQXBwbGllcyB0aGUgT3AgdG8gYSBQbGFuLlxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8T3BSZXN1bHQ+IHtcbiAgICBjb25zdCBpbnZlcnNlU3ViT3BzOiBTdWJPcFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1Yk9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZSA9IHRoaXMuc3ViT3BzW2ldLmFwcGx5VG8ocGxhbik7XG4gICAgICBpZiAoIWUub2spIHtcbiAgICAgICAgLy8gUmV2ZXJ0IGFsbCB0aGUgU3ViT3BzIGFwcGxpZWQgdXAgdG8gdGhpcyBwb2ludCB0byBnZXQgdGhlIFBsYW4gYmFjayBpbiBhXG4gICAgICAgIC8vIGdvb2QgcGxhY2UuXG4gICAgICAgIGNvbnN0IHJldmVydEVyciA9IHRoaXMuYXBwbHlBbGxJbnZlcnNlU3ViT3BzVG9QbGFuKHBsYW4sIGludmVyc2VTdWJPcHMpO1xuICAgICAgICBpZiAoIXJldmVydEVyci5vaykge1xuICAgICAgICAgIHJldHVybiByZXZlcnRFcnI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgICBwbGFuID0gZS52YWx1ZS5wbGFuO1xuICAgICAgaW52ZXJzZVN1Yk9wcy51bnNoaWZ0KGUudmFsdWUuaW52ZXJzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiBuZXcgT3AoaW52ZXJzZVN1Yk9wcyksXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQWxsT3BzUmVzdWx0ID0ge1xuICBvcHM6IE9wW107XG4gIHBsYW46IFBsYW47XG59O1xuXG5jb25zdCBhcHBseUFsbEludmVyc2VPcHNUb1BsYW4gPSAoaW52ZXJzZXM6IE9wW10sIHBsYW46IFBsYW4pOiBSZXN1bHQ8UGxhbj4gPT4ge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGludmVyc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gaW52ZXJzZXNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgcGxhbiA9IHJlcy52YWx1ZS5wbGFuO1xuICB9XG5cbiAgcmV0dXJuIG9rKHBsYW4pO1xufTtcblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGFwcGx5aW5nIG11bHRpcGxlIE9wcyB0byBhIHBsYW4sIHVzZWQgbW9zdGx5IGZvclxuLy8gdGVzdGluZy5cbmV4cG9ydCBjb25zdCBhcHBseUFsbE9wc1RvUGxhbiA9IChcbiAgb3BzOiBPcFtdLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8QWxsT3BzUmVzdWx0PiA9PiB7XG4gIGNvbnN0IGludmVyc2VzOiBPcFtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gb3BzW2ldLmFwcGx5VG8ocGxhbik7XG4gICAgaWYgKCFyZXMub2spIHtcbiAgICAgIGNvbnN0IGludmVyc2VSZXMgPSBhcHBseUFsbEludmVyc2VPcHNUb1BsYW4oaW52ZXJzZXMsIHBsYW4pO1xuICAgICAgaWYgKCFpbnZlcnNlUmVzLm9rKSB7XG4gICAgICAgIC8vIFRPRE8gQ2FuIHdlIHdyYXAgdGhlIEVycm9yIGluIGFub3RoZXIgZXJyb3IgdG8gbWFrZSBpdCBjbGVhciB0aGlzXG4gICAgICAgIC8vIGVycm9yIGhhcHBlbmVkIHdoZW4gdHJ5aW5nIHRvIGNsZWFuIHVwIGZyb20gdGhlIHByZXZpb3VzIEVycm9yIHdoZW5cbiAgICAgICAgLy8gdGhlIGFwcGx5KCkgZmFpbGVkLlxuICAgICAgICByZXR1cm4gaW52ZXJzZVJlcztcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIGludmVyc2VzLnVuc2hpZnQocmVzLnZhbHVlLmludmVyc2UpO1xuICAgIHBsYW4gPSByZXMudmFsdWUucGxhbjtcbiAgfVxuXG4gIHJldHVybiBvayh7XG4gICAgb3BzOiBpbnZlcnNlcyxcbiAgICBwbGFuOiBwbGFuLFxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBhcHBseUFsbE9wc1RvUGxhbkFuZFRoZW5JbnZlcnNlID0gKFxuICBvcHM6IE9wW10sXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxBbGxPcHNSZXN1bHQ+ID0+IHtcbiAgY29uc3QgcmVzID0gYXBwbHlBbGxPcHNUb1BsYW4ob3BzLCBwbGFuKTtcbiAgaWYgKCFyZXMub2spIHtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIHJldHVybiBhcHBseUFsbE9wc1RvUGxhbihyZXMudmFsdWUub3BzLCByZXMudmFsdWUucGxhbik7XG59O1xuLy8gTm9PcCBpcyBhIG5vLW9wLlxuZXhwb3J0IGZ1bmN0aW9uIE5vT3AoKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtdKTtcbn1cbiIsICIvLyBDaGFuZ2VNZXRyaWNWYWx1ZVxuXG5pbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNEZWZpbml0aW9uIH0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgZXJyb3IsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuXG5leHBvcnQgY2xhc3MgQWRkTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbjtcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbWV0cmljIGtleS5cbiAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24gPSBtZXRyaWNEZWZpbml0aW9uO1xuICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcyA9IHRhc2tNZXRyaWNWYWx1ZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAocGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gYWxyZWFkeSBleGlzdHMgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG5cbiAgICBwbGFuLnNldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lLCB0aGlzLm1ldHJpY0RlZmluaXRpb24pO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBhZGQgdGhpcyBtZXRyaWMgYW5kIHNldCBpdCB0byB0aGUgZGVmYXVsdCxcbiAgICAvLyB1bmxlc3MgdGhlcmUgaXMgbWF0Y2hpbmcgZW50cnkgaW4gdGFza01ldHJpY1ZhbHVlcywgaW4gd2hpY2ggY2FzZSB3ZSB3aWxsXG4gICAgLy8gdXNlIHRoYXQgdmFsdWUsIGkuZS4gdGhpcyBBZGRNZXRyaWNTdWJPcCBpcyBhY3R1YWxseSBhIHJldmVydCBvZiBhXG4gICAgLy8gRGVsZXRlTWV0cmljU3ViT3AuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICB0YXNrLnNldE1ldHJpYyhcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuZ2V0KGluZGV4KSB8fCB0aGlzLm1ldHJpY0RlZmluaXRpb24uZGVmYXVsdFxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVNZXRyaWNTdWJPcCh0aGlzLm5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBtZXRyaWNEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG5cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBUaGUgbWV0cmljIHdpdGggbmFtZSAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYW5kIGNhbid0IGJlIGRlbGV0ZWQuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBUaGUgc3RhdGljIE1ldHJpYyAke3RoaXMubmFtZX0gY2FuJ3QgYmUgZGVsZXRlZC5gKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZnJvbSByZXNvdXJjZSBkZWZpbml0aW9ucy5cbiAgICBwbGFuLmRlbGV0ZU1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcblxuICAgIGNvbnN0IHRhc2tJbmRleFRvRGVsZXRlZE1ldHJpY1ZhbHVlOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gTm93IGxvb2sgYXQgYWxsIFRhc2tzIGFuZCByZW1vdmUgYHRoaXMubmFtZWAgZnJvbSB0aGUgbWV0cmljIHdoaWxlIGFsc29cbiAgICAvLyBidWlsZGluZyB1cCB0aGUgaW5mbyBuZWVkZWQgZm9yIGEgcmV2ZXJ0LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpO1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWUuc2V0KGluZGV4LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICB0YXNrLmRlbGV0ZU1ldHJpYyh0aGlzLm5hbWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UobWV0cmljRGVmaW5pdGlvbiwgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWUpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKFxuICAgIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24sXG4gICAgbWV0cmljVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlTmFtZTogTWFwPG51bWJlciwgbnVtYmVyPlxuICApOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRNZXRyaWNTdWJPcChcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIG1ldHJpY0RlZmluaXRpb24sXG4gICAgICBtZXRyaWNWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VOYW1lXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG9sZE5hbWU6IHN0cmluZztcbiAgbmV3TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9sZE5hbWU6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5vbGROYW1lID0gb2xkTmFtZTtcbiAgICB0aGlzLm5ld05hbWUgPSBuZXdOYW1lO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5ld05hbWUpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld05hbWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgbWV0cmljLmApO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5vbGROYW1lKTtcbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5vbGROYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBTdGF0aWMgbWV0cmljICR7dGhpcy5vbGROYW1lfSBjYW4ndCBiZSByZW5hbWVkLmApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5ld05hbWUsIG1ldHJpY0RlZmluaXRpb24pO1xuICAgIHBsYW4uZGVsZXRlTWV0cmljRGVmaW5pdGlvbih0aGlzLm9sZE5hbWUpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCByZW5hbWUgdGhpcyBtZXRyaWMuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMub2xkTmFtZSkgfHwgbWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgICAgdGFzay5zZXRNZXRyaWModGhpcy5uZXdOYW1lLCB2YWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZU1ldHJpYyh0aGlzLm9sZE5hbWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZU1ldHJpY1N1Yk9wKHRoaXMubmV3TmFtZSwgdGhpcy5vbGROYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVXBkYXRlTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbjtcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbWV0cmljIGtleS5cbiAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24gPSBtZXRyaWNEZWZpbml0aW9uO1xuICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcyA9IHRhc2tNZXRyaWNWYWx1ZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBvbGRNZXRyaWNEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG4gICAgaWYgKG9sZE1ldHJpY0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG4gICAgaWYgKG9sZE1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBlcnJvcihgU3RhdGljIG1ldHJpYyAke3RoaXMubmFtZX0gY2FuJ3QgYmUgdXBkYXRlZC5gKTtcbiAgICB9XG5cbiAgICBwbGFuLnNldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lLCB0aGlzLm1ldHJpY0RlZmluaXRpb24pO1xuXG4gICAgY29uc3QgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIHVwZGF0ZSB0aGUgbWV0cmljIHZhbHVlcyB0byByZWZsZWN0IHRoZSBuZXdcbiAgICAvLyBtZXRyaWMgZGVmaW5pdGlvbiwgdW5sZXNzIHRoZXJlIGlzIG1hdGNoaW5nIGVudHJ5IGluIHRhc2tNZXRyaWNWYWx1ZXMsIGluXG4gICAgLy8gd2hpY2ggY2FzZSB3ZSB3aWxsIHVzZSB0aGF0IHZhbHVlLCBpLmUuIHRoaXMgVXBkYXRlTWV0cmljU3ViT3AgaXNcbiAgICAvLyBhY3R1YWxseSBhIHJldmVydCBvZiBhbm90aGVyIFVwZGF0ZU1ldHJpY1N1Yk9wLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpITtcblxuICAgICAgbGV0IG5ld1ZhbHVlOiBudW1iZXI7XG4gICAgICBpZiAodGhpcy50YXNrTWV0cmljVmFsdWVzLmhhcyhpbmRleCkpIHtcbiAgICAgICAgLy8gdGFza01ldHJpY1ZhbHVlcyBoYXMgYSB2YWx1ZSB0aGVuIHVzZSB0aGF0LCBhcyB0aGlzIGlzIGFuIGludmVyc2VcbiAgICAgICAgLy8gb3BlcmF0aW9uLlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMudGFza01ldHJpY1ZhbHVlcy5nZXQoaW5kZXgpITtcbiAgICAgIH0gZWxzZSBpZiAob2xkVmFsdWUgPT09IG9sZE1ldHJpY0RlZmluaXRpb24uZGVmYXVsdCkge1xuICAgICAgICAvLyBJZiB0aGUgb2xkVmFsdWUgaXMgdGhlIGRlZmF1bHQsIGNoYW5nZSBpdCB0byB0aGUgbmV3IGRlZmF1bHQuXG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgICAgIHRhc2tNZXRyaWNWYWx1ZXMuc2V0KGluZGV4LCBvbGRWYWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDbGFtcC5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24ucmFuZ2UuY2xhbXAob2xkVmFsdWUpO1xuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5wcmVjaXNpb24ucm91bmQobmV3VmFsdWUpO1xuICAgICAgICB0YXNrTWV0cmljVmFsdWVzLnNldChpbmRleCwgb2xkVmFsdWUpO1xuICAgICAgfVxuICAgICAgdGFzay5zZXRNZXRyaWModGhpcy5uYW1lLCBuZXdWYWx1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRNZXRyaWNEZWZpbml0aW9uLCB0YXNrTWV0cmljVmFsdWVzKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoXG4gICAgb2xkTWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFVwZGF0ZU1ldHJpY1N1Yk9wKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgb2xkTWV0cmljRGVmaW5pdGlvbixcbiAgICAgIHRhc2tNZXRyaWNWYWx1ZXNcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRNZXRyaWNWYWx1ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG4gIHZhbHVlOiBudW1iZXI7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgdmFsdWU6IG51bWJlciwgdGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG1ldHJpY3NEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG4gICAgaWYgKG1ldHJpY3NEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5hbWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgTWV0cmljYCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFzayA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdO1xuICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKSB8fCBtZXRyaWNzRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgIHRhc2suc2V0TWV0cmljKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgbWV0cmljc0RlZmluaXRpb24ucHJlY2lzaW9uLnJvdW5kKFxuICAgICAgICBtZXRyaWNzRGVmaW5pdGlvbi5yYW5nZS5jbGFtcCh0aGlzLnZhbHVlKVxuICAgICAgKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkVmFsdWUpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSh2YWx1ZTogbnVtYmVyKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0TWV0cmljVmFsdWVTdWJPcCh0aGlzLm5hbWUsIHZhbHVlLCB0aGlzLnRhc2tJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZE1ldHJpY09wKFxuICBuYW1lOiBzdHJpbmcsXG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb25cbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZE1ldHJpY1N1Yk9wKG5hbWUsIG1ldHJpY0RlZmluaXRpb24pXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVNZXRyaWNPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVNZXRyaWNTdWJPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lTWV0cmljT3Aob2xkTmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVNZXRyaWNTdWJPcChvbGROYW1lLCBuZXdOYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVXBkYXRlTWV0cmljT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvblxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgVXBkYXRlTWV0cmljU3ViT3AobmFtZSwgbWV0cmljRGVmaW5pdGlvbildKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldE1ldHJpY1ZhbHVlT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgdmFsdWU6IG51bWJlcixcbiAgdGFza0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AobmFtZSwgdmFsdWUsIHRhc2tJbmRleCldKTtcbn1cbiIsICIvLyBFYWNoIFJlc291cnNlIGhhcyBhIGtleSwgd2hpY2ggaXMgdGhlIG5hbWUsIGFuZCBhIGxpc3Qgb2YgYWNjZXB0YWJsZSB2YWx1ZXMuXG4vLyBUaGUgbGlzdCBvZiB2YWx1ZXMgY2FuIG5ldmVyIGJlIGVtcHR5LCBhbmQgdGhlIGZpcnN0IHZhbHVlIGluIGB2YWx1ZXNgIGlzIHRoZVxuLy8gZGVmYXVsdCB2YWx1ZSBmb3IgYSBSZXNvdXJjZS5cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUkVTT1VSQ0VfVkFMVUUgPSBcIlwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICB2YWx1ZXM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgY2xhc3MgUmVzb3VyY2VEZWZpbml0aW9uIHtcbiAgdmFsdWVzOiBzdHJpbmdbXTtcbiAgaXNTdGF0aWM6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgdmFsdWVzOiBzdHJpbmdbXSA9IFtERUZBVUxUX1JFU09VUkNFX1ZBTFVFXSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIHRoaXMudmFsdWVzID0gdmFsdWVzO1xuICAgIHRoaXMuaXNTdGF0aWMgPSBpc1N0YXRpYztcbiAgfVxuXG4gIHRvSlNPTigpOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWVzOiB0aGlzLnZhbHVlcyxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIEZyb21KU09OKHM6IFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQpOiBSZXNvdXJjZURlZmluaXRpb24ge1xuICAgIHJldHVybiBuZXcgUmVzb3VyY2VEZWZpbml0aW9uKHMudmFsdWVzKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBSZXNvdXJjZURlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb24gfTtcbmV4cG9ydCB0eXBlIFJlc291cmNlRGVmaW5pdGlvbnNTZXJpYWxpemVkID0ge1xuICBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkO1xufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBPcCwgU3ViT3AsIFN1Yk9wUmVzdWx0IH0gZnJvbSBcIi4vb3BzLnRzXCI7XG5pbXBvcnQge1xuICBERUZBVUxUX1JFU09VUkNFX1ZBTFVFLFxuICBSZXNvdXJjZURlZmluaXRpb24sXG59IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRSZXNvdXJjZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gcmVzb3VyY2Uga2V5LlxuICB0YXNrUmVzb3VyY2VWYWx1ZXM6IE1hcDxudW1iZXIsIHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHRhc2tSZXNvdXJjZVZhbHVlczogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXA8bnVtYmVyLCBzdHJpbmc+KCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLmtleSA9IG5hbWU7XG4gICAgdGhpcy50YXNrUmVzb3VyY2VWYWx1ZXMgPSB0YXNrUmVzb3VyY2VWYWx1ZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBmb3VuZE1hdGNoID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChmb3VuZE1hdGNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gYWxyZWFkeSBleGlzdHMgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5LCBuZXcgUmVzb3VyY2VEZWZpbml0aW9uKCkpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBhZGQgdGhpcyBrZXkgYW5kIHNldCBpdCB0byB0aGUgZGVmYXVsdCwgdW5sZXNzXG4gICAgLy8gdGhlcmUgaXMgbWF0Y2hpbmcgZW50cnkgaW4gdGFza1Jlc291cmNlVmFsdWVzLCBpbiB3aGljaCBjYXNlIHdlIHdpbGwgdXNlIHRoYXQgdmFsdWUuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICB0YXNrLnNldFJlc291cmNlKFxuICAgICAgICB0aGlzLmtleSxcbiAgICAgICAgdGhpcy50YXNrUmVzb3VyY2VWYWx1ZXMuZ2V0KGluZGV4KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVJlc291cmNlU3VwT3AodGhpcy5rZXkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVSZXNvdXJjZVN1cE9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmtleSA9IG5hbWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXNvdXJjZURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBUaGUgcmVzb3VyY2Ugd2l0aCBuYW1lICR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFuZCBjYW4ndCBiZSBkZWxldGVkLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGZyb20gcmVzb3VyY2UgZGVmaW5pdGlvbnMuXG4gICAgcGxhbi5kZWxldGVNZXRyaWNEZWZpbml0aW9uKHRoaXMua2V5KTtcblxuICAgIGNvbnN0IHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWU6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHJlbW92ZSBgdGhpcy5rZXlgIGZyb20gdGhlIHJlc291cmNlcyB3aGlsZSBhbHNvXG4gICAgLy8gYnVpbGRpbmcgdXAgdGhlIGluZm8gbmVlZGVkIGZvciBhIHJldmVydC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRTtcbiAgICAgIHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWUuc2V0KGluZGV4LCB2YWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZVJlc291cmNlKHRoaXMua2V5KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWUpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKFxuICAgIHJlc291cmNlVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlS2V5OiBNYXA8bnVtYmVyLCBzdHJpbmc+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFJlc291cmNlU3ViT3AodGhpcy5rZXksIHJlc291cmNlVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlS2V5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSA9IFtdIC8vIFRoaXMgc2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgd2hlbiBiZWluZyBjb25zdHJ1Y3RlZCBhcyBhIGludmVyc2Ugb3BlcmF0aW9uLlxuICApIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlID0gaW5kaWNlc09mVGFza3NUb0NoYW5nZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGRlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGRlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2Vzbid0IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG4gICAgY29uc3QgZXhpc3RpbmdJbmRleCA9IGRlZmluaXRpb24udmFsdWVzLmZpbmRJbmRleChcbiAgICAgICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSA9PT0gdGhpcy52YWx1ZVxuICAgICk7XG4gICAgaWYgKGV4aXN0aW5nSW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMudmFsdWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgdmFsdWUgaW4gdGhlIFJlc291cmNlICR7dGhpcy5rZXl9LmBcbiAgICAgICk7XG4gICAgfVxuICAgIGRlZmluaXRpb24udmFsdWVzLnB1c2godGhpcy52YWx1ZSk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHNldCB0aGUgdmFsdWUgZm9yIHRoZSBnaXZlbiBrZXkgZm9yIGFsbCB0aGVcbiAgICAvLyB0YXNrcyBsaXN0ZWQgaW4gYGluZGljZXNPZlRhc2tzVG9DaGFuZ2VgLlxuICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZS5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLnZhbHVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3AoXG4gICAgICB0aGlzLmtleSxcbiAgICAgIHRoaXMudmFsdWUsXG4gICAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2VcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSA9IFtdXG4gICkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UgPSBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXNuJ3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZUluZGV4ID0gZGVmaW5pdGlvbi52YWx1ZXMuZmluZEluZGV4KFxuICAgICAgKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlID09PSB0aGlzLnZhbHVlXG4gICAgKTtcbiAgICBpZiAodmFsdWVJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy52YWx1ZX0gZG9lcyBub3QgZXhpc3QgYXMgYSB2YWx1ZSBpbiB0aGUgUmVzb3VyY2UgJHt0aGlzLmtleX0uYFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGRlZmluaXRpb24udmFsdWVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgUmVzb3VyY2VzIG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgdmFsdWUuICR7dGhpcy52YWx1ZX0gb25seSBoYXMgb25lIHZhbHVlLCBzbyBpdCBjYW4ndCBiZSBkZWxldGVkLiBgXG4gICAgICApO1xuICAgIH1cblxuICAgIGRlZmluaXRpb24udmFsdWVzLnNwbGljZSh2YWx1ZUluZGV4LCAxKTtcblxuICAgIC8vIE5vdyBpdGVyYXRlIHRob3VnaCBhbGwgdGhlIHRhc2tzIGFuZCBjaGFuZ2UgYWxsIHRhc2tzIHRoYXQgaGF2ZVxuICAgIC8vIFwia2V5OnZhbHVlXCIgdG8gaW5zdGVhZCBiZSBcImtleTpkZWZhdWx0XCIuIFJlY29yZCB3aGljaCB0YXNrcyBnb3QgY2hhbmdlZFxuICAgIC8vIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGF0IGluZm9ybWF0aW9uIHdoZW4gd2UgY3JlYXRlIHRoZSBpbnZlcnQgb3BlcmF0aW9uLlxuXG4gICAgY29uc3QgaW5kaWNlc09mVGFza3NXaXRoTWF0Y2hpbmdSZXNvdXJjZVZhbHVlczogbnVtYmVyW10gPSBbXTtcblxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgcmVzb3VyY2VWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpO1xuICAgICAgaWYgKHJlc291cmNlVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFNpbmNlIHRoZSB2YWx1ZSBpcyBubyBsb25nZXIgdmFsaWQgd2UgY2hhbmdlIGl0IGJhY2sgdG8gdGhlIGRlZmF1bHQuXG4gICAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCBkZWZpbml0aW9uLnZhbHVlc1swXSk7XG5cbiAgICAgIC8vIFJlY29yZCB3aGljaCB0YXNrIHdlIGp1c3QgY2hhbmdlZC5cbiAgICAgIGluZGljZXNPZlRhc2tzV2l0aE1hdGNoaW5nUmVzb3VyY2VWYWx1ZXMucHVzaChpbmRleCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShpbmRpY2VzT2ZUYXNrc1dpdGhNYXRjaGluZ1Jlc291cmNlVmFsdWVzKSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW52ZXJzZShpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFJlc291cmNlT3B0aW9uU3ViT3AoXG4gICAgICB0aGlzLmtleSxcbiAgICAgIHRoaXMudmFsdWUsXG4gICAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lUmVzb3VyY2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgb2xkS2V5OiBzdHJpbmc7XG4gIG5ld0tleTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9sZEtleTogc3RyaW5nLCBuZXdLZXk6IHN0cmluZykge1xuICAgIHRoaXMub2xkS2V5ID0gb2xkS2V5O1xuICAgIHRoaXMubmV3S2V5ID0gbmV3S2V5O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3Qgb2xkRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMub2xkS2V5KTtcbiAgICBpZiAob2xkRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5vbGRLZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBuZXdLZXkgaXMgbm90IGFscmVhZHkgdXNlZC5cbiAgICBjb25zdCBuZXdLZXlEZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5uZXdLZXkpO1xuICAgIGlmIChuZXdLZXlEZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld0tleX0gYWxyZWFkeSBleGlzdHMgYXMgYSByZXNvdXJjZSBuYW1lLmApO1xuICAgIH1cblxuICAgIHBsYW4uZGVsZXRlUmVzb3VyY2VEZWZpbml0aW9uKHRoaXMub2xkS2V5KTtcbiAgICBwbGFuLnNldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLm5ld0tleSwgb2xkRGVmaW5pdGlvbik7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGNoYW5nZSBvbGRLZXkgLT4gbmV3a2V5IGZvciB0aGUgZ2l2ZW4gcmVzb3VyY2Uga2V5LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFZhbHVlID1cbiAgICAgICAgdGFzay5nZXRSZXNvdXJjZSh0aGlzLm9sZEtleSkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRTtcbiAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5uZXdLZXksIGN1cnJlbnRWYWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZVJlc291cmNlKHRoaXMub2xkS2V5KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW5hbWVSZXNvdXJjZVN1Yk9wKHRoaXMubmV3S2V5LCB0aGlzLm9sZEtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmFtZVJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICBvbGRWYWx1ZTogc3RyaW5nO1xuICBuZXdWYWx1ZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGtleTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nLCBuZXdWYWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy5vbGRWYWx1ZSA9IG9sZFZhbHVlO1xuICAgIHRoaXMubmV3VmFsdWUgPSBuZXdWYWx1ZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlybSB0aGUgb2xkVmFsdWUgaXMgaW4gdGhlcmUuXG4gICAgY29uc3Qgb2xkVmFsdWVJbmRleCA9IGZvdW5kTWF0Y2gudmFsdWVzLmluZGV4T2YodGhpcy5vbGRWYWx1ZSk7XG5cbiAgICBpZiAob2xkVmFsdWVJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgYSB2YWx1ZSAke3RoaXMub2xkVmFsdWV9YCk7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlybSB0aGUgbmV3VmFsdWUgaXMgbm90IGluIHRoZXJlLlxuICAgIGNvbnN0IG5ld1ZhbHVlSW5kZXggPSBmb3VuZE1hdGNoLnZhbHVlcy5pbmRleE9mKHRoaXMubmV3VmFsdWUpO1xuICAgIGlmIChuZXdWYWx1ZUluZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBhbHJlYWR5IGhhcyBhIHZhbHVlICR7dGhpcy5uZXdWYWx1ZX1gKTtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHRoZSB2YWx1ZXMuXG4gICAgZm91bmRNYXRjaC52YWx1ZXMuc3BsaWNlKG9sZFZhbHVlSW5kZXgsIDEsIHRoaXMubmV3VmFsdWUpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBjaGFuZ2Ugb2xkVmFsdWUgLT4gbmV3VmFsdWUgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KTtcbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHRoaXMub2xkVmFsdWUpIHtcbiAgICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLmtleSwgdGhpcy5uZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy5uZXdWYWx1ZSxcbiAgICAgIHRoaXMub2xkVmFsdWVcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNb3ZlUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIG9sZEluZGV4OiBudW1iZXI7XG4gIG5ld0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBudW1iZXIsIG5ld1ZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLm9sZEluZGV4ID0gb2xkVmFsdWU7XG4gICAgdGhpcy5uZXdJbmRleCA9IG5ld1ZhbHVlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vbGRJbmRleCA+IGRlZmluaXRpb24udmFsdWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy5rZXl9IGRvZXMgbm90IGhhdmUgYSB2YWx1ZSBhdCBpbmRleCAke3RoaXMub2xkSW5kZXh9YFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubmV3SW5kZXggPiBkZWZpbml0aW9uLnZhbHVlcy5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMua2V5fSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUgYXQgaW5kZXggJHt0aGlzLm5ld0luZGV4fWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gU3dhcCB0aGUgdmFsdWVzLlxuICAgIGNvbnN0IHRtcCA9IGRlZmluaXRpb24udmFsdWVzW3RoaXMub2xkSW5kZXhdO1xuICAgIGRlZmluaXRpb24udmFsdWVzW3RoaXMub2xkSW5kZXhdID0gZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5uZXdJbmRleF07XG4gICAgZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5uZXdJbmRleF0gPSB0bXA7XG5cbiAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIHdpdGggVGFza3MgYmVjYXVzZSB0aGUgaW5kZXggb2YgYSB2YWx1ZSBpc1xuICAgIC8vIGlycmVsZXZhbnQgc2luY2Ugd2Ugc3RvcmUgdGhlIHZhbHVlIGl0c2VsZiwgbm90IHRoZSBpbmRleC5cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBNb3ZlUmVzb3VyY2VPcHRpb25TdWJPcCh0aGlzLmtleSwgdGhpcy5uZXdJbmRleCwgdGhpcy5vbGRJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFJlc291cmNlVmFsdWVTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCB0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgY29uc3QgZm91bmRWYWx1ZU1hdGNoID0gZm91bmRNYXRjaC52YWx1ZXMuZmluZEluZGV4KCh2OiBzdHJpbmcpID0+IHtcbiAgICAgIHJldHVybiB2ID09PSB0aGlzLnZhbHVlO1xuICAgIH0pO1xuICAgIGlmIChmb3VuZFZhbHVlTWF0Y2ggPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGhhdmUgYSB2YWx1ZSBvZiAke3RoaXMudmFsdWV9YCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRhc2tJbmRleCA8IDAgfHwgdGhpcy50YXNrSW5kZXggPj0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBlcnJvcihgVGhlcmUgaXMgbm8gVGFzayBhdCBpbmRleCAke3RoaXMudGFza0luZGV4fWApO1xuICAgIH1cblxuICAgIGNvbnN0IHRhc2sgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XTtcbiAgICBjb25zdCBvbGRWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpITtcbiAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLnZhbHVlKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRWYWx1ZSkgfSk7XG4gIH1cblxuICBpbnZlcnNlKG9sZFZhbHVlOiBzdHJpbmcpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRSZXNvdXJjZVZhbHVlU3ViT3AodGhpcy5rZXksIG9sZFZhbHVlLCB0aGlzLnRhc2tJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZFJlc291cmNlT3AobmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgQWRkUmVzb3VyY2VTdWJPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlUmVzb3VyY2VPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVSZXNvdXJjZVN1cE9wKG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRSZXNvdXJjZU9wdGlvbk9wKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgQWRkUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIHZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlUmVzb3VyY2VPcHRpb25PcChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCB2YWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmFtZVJlc291cmNlT3B0aW9uT3AoXG4gIGtleTogc3RyaW5nLFxuICBvbGRWYWx1ZTogc3RyaW5nLFxuICBuZXdWYWx1ZTogc3RyaW5nXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lUmVzb3VyY2VPcChvbGRWYWx1ZTogc3RyaW5nLCBuZXdWYWx1ZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmVuYW1lUmVzb3VyY2VTdWJPcChvbGRWYWx1ZSwgbmV3VmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNb3ZlUmVzb3VyY2VPcHRpb25PcChcbiAga2V5OiBzdHJpbmcsXG4gIG9sZEluZGV4OiBudW1iZXIsXG4gIG5ld0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgb2xkSW5kZXgsIG5ld0luZGV4KV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0UmVzb3VyY2VWYWx1ZU9wKFxuICBrZXk6IHN0cmluZyxcbiAgdmFsdWU6IHN0cmluZyxcbiAgdGFza0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldFJlc291cmNlVmFsdWVTdWJPcChrZXksIHZhbHVlLCB0YXNrSW5kZXgpXSk7XG59XG4iLCAiLyoqIE9uZSB2ZXJ0ZXggb2YgYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleCA9IG9iamVjdDtcblxuLyoqIEV2ZXJ5IFZlcnRleCBpbiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgVmVydGljZXMgPSBWZXJ0ZXhbXTtcblxuLyoqIEEgc3Vic2V0IG9mIFZlcnRpY2VzIHJlZmVycmVkIHRvIGJ5IHRoZWlyIGluZGV4IG51bWJlci4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleEluZGljZXMgPSBudW1iZXJbXTtcblxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIHtcbiAgaTogbnVtYmVyO1xuICBqOiBudW1iZXI7XG59XG5cbi8qKiBPbmUgZWRnZSBvZiBhIGdyYXBoLCB3aGljaCBpcyBhIGRpcmVjdGVkIGNvbm5lY3Rpb24gZnJvbSB0aGUgaSd0aCBWZXJ0ZXggdG9cbnRoZSBqJ3RoIFZlcnRleCwgd2hlcmUgdGhlIFZlcnRleCBpcyBzdG9yZWQgaW4gYSBWZXJ0aWNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIERpcmVjdGVkRWRnZSB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyID0gMCwgajogbnVtYmVyID0gMCkge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGVxdWFsKHJoczogRGlyZWN0ZWRFZGdlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJocy5pID09PSB0aGlzLmkgJiYgcmhzLmogPT09IHRoaXMuajtcbiAgfVxuXG4gIHRvSlNPTigpOiBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgaTogdGhpcy5pLFxuICAgICAgajogdGhpcy5qLFxuICAgIH07XG4gIH1cbn1cblxuLyoqIEV2ZXJ5IEVnZGUgaW4gYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIEVkZ2VzID0gRGlyZWN0ZWRFZGdlW107XG5cbi8qKiBBIGdyYXBoIGlzIGp1c3QgYSBjb2xsZWN0aW9uIG9mIFZlcnRpY2VzIGFuZCBFZGdlcyBiZXR3ZWVuIHRob3NlIHZlcnRpY2VzLiAqL1xuZXhwb3J0IHR5cGUgRGlyZWN0ZWRHcmFwaCA9IHtcbiAgVmVydGljZXM6IFZlcnRpY2VzO1xuICBFZGdlczogRWRnZXM7XG59O1xuXG4vKipcbiBHcm91cHMgdGhlIEVkZ2VzIGJ5IHRoZWlyIGBpYCB2YWx1ZS5cblxuIEBwYXJhbSBlZGdlcyAtIEFsbCB0aGUgRWdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gQHJldHVybnMgQSBtYXAgZnJvbSB0aGUgVmVydGV4IGluZGV4IHRvIGFsbCB0aGUgRWRnZXMgdGhhdCBzdGFydCBhdFxuICAgYXQgdGhhdCBWZXJ0ZXggaW5kZXguXG4gKi9cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjVG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5pKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaSwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKlxuICAgR3JvdXBzIHRoZSBFZGdlcyBieSB0aGVpciBgamAgdmFsdWUuXG4gIFxuICAgQHBhcmFtIGVkZ2VzIC0gQWxsIHRoZSBFZGdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gICBAcmV0dXJucyBBIG1hcCBmcm9tIHRoZSBWZXJ0ZXggaW5kZXggdG8gYWxsIHRoZSBFZGdlcyB0aGF0IGVuZCBhdFxuICAgICBhdCB0aGF0IFZlcnRleCBpbmRleC5cbiAgICovXG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5RHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCB0eXBlIFNyY0FuZERzdFJldHVybiA9IHtcbiAgYnlTcmM6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbiAgYnlEc3Q6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbn07XG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogU3JjQW5kRHN0UmV0dXJuID0+IHtcbiAgY29uc3QgcmV0ID0ge1xuICAgIGJ5U3JjOiBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCksXG4gICAgYnlEc3Q6IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKSxcbiAgfTtcblxuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBsZXQgYXJyID0gcmV0LmJ5U3JjLmdldChlLmkpIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5ieVNyYy5zZXQoZS5pLCBhcnIpO1xuICAgIGFyciA9IHJldC5ieURzdC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuYnlEc3Quc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHtcbiAgVmVydGV4LFxuICBWZXJ0ZXhJbmRpY2VzLFxuICBEaXJlY3RlZEdyYXBoLFxuICBlZGdlc0J5U3JjVG9NYXAsXG59IGZyb20gXCIuLi9kYWcudHNcIjtcblxuLyoqXG5UaGUgcmV0dXJuIHR5cGUgZm9yIHRoZSBUb3Bsb2dpY2FsU29ydCBmdW5jdGlvbi4gXG4gKi9cbnR5cGUgVFNSZXR1cm4gPSB7XG4gIGhhc0N5Y2xlczogYm9vbGVhbjtcblxuICBjeWNsZTogVmVydGV4SW5kaWNlcztcblxuICBvcmRlcjogVmVydGV4SW5kaWNlcztcbn07XG5cbi8qKlxuUmV0dXJucyBhIHRvcG9sb2dpY2FsIHNvcnQgb3JkZXIgZm9yIGEgRGlyZWN0ZWRHcmFwaCwgb3IgdGhlIG1lbWJlcnMgb2YgYSBjeWNsZSBpZiBhXG50b3BvbG9naWNhbCBzb3J0IGNhbid0IGJlIGRvbmUuXG4gXG4gVGhlIHRvcG9sb2dpY2FsIHNvcnQgY29tZXMgZnJvbTpcblxuICAgIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmcjRGVwdGgtZmlyc3Rfc2VhcmNoXG5cbkwgXHUyMTkwIEVtcHR5IGxpc3QgdGhhdCB3aWxsIGNvbnRhaW4gdGhlIHNvcnRlZCBub2Rlc1xud2hpbGUgZXhpc3RzIG5vZGVzIHdpdGhvdXQgYSBwZXJtYW5lbnQgbWFyayBkb1xuICAgIHNlbGVjdCBhbiB1bm1hcmtlZCBub2RlIG5cbiAgICB2aXNpdChuKVxuXG5mdW5jdGlvbiB2aXNpdChub2RlIG4pXG4gICAgaWYgbiBoYXMgYSBwZXJtYW5lbnQgbWFyayB0aGVuXG4gICAgICAgIHJldHVyblxuICAgIGlmIG4gaGFzIGEgdGVtcG9yYXJ5IG1hcmsgdGhlblxuICAgICAgICBzdG9wICAgKGdyYXBoIGhhcyBhdCBsZWFzdCBvbmUgY3ljbGUpXG5cbiAgICBtYXJrIG4gd2l0aCBhIHRlbXBvcmFyeSBtYXJrXG5cbiAgICBmb3IgZWFjaCBub2RlIG0gd2l0aCBhbiBlZGdlIGZyb20gbiB0byBtIGRvXG4gICAgICAgIHZpc2l0KG0pXG5cbiAgICByZW1vdmUgdGVtcG9yYXJ5IG1hcmsgZnJvbSBuXG4gICAgbWFyayBuIHdpdGggYSBwZXJtYW5lbnQgbWFya1xuICAgIGFkZCBuIHRvIGhlYWQgb2YgTFxuXG4gKi9cbmV4cG9ydCBjb25zdCB0b3BvbG9naWNhbFNvcnQgPSAoZzogRGlyZWN0ZWRHcmFwaCk6IFRTUmV0dXJuID0+IHtcbiAgY29uc3QgcmV0OiBUU1JldHVybiA9IHtcbiAgICBoYXNDeWNsZXM6IGZhbHNlLFxuICAgIGN5Y2xlOiBbXSxcbiAgICBvcmRlcjogW10sXG4gIH07XG5cbiAgY29uc3QgZWRnZU1hcCA9IGVkZ2VzQnlTcmNUb01hcChnLkVkZ2VzKTtcblxuICBjb25zdCBub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrID0gbmV3IFNldDxudW1iZXI+KCk7XG4gIGcuVmVydGljZXMuZm9yRWFjaCgoXzogVmVydGV4LCBpbmRleDogbnVtYmVyKSA9PlxuICAgIG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuYWRkKGluZGV4KVxuICApO1xuXG4gIGNvbnN0IGhhc1Blcm1hbmVudE1hcmsgPSAoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgIHJldHVybiAhbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5oYXMoaW5kZXgpO1xuICB9O1xuXG4gIGNvbnN0IHRlbXBvcmFyeU1hcmsgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuICBjb25zdCB2aXNpdCA9IChpbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKGhhc1Blcm1hbmVudE1hcmsoaW5kZXgpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRlbXBvcmFyeU1hcmsuaGFzKGluZGV4KSkge1xuICAgICAgLy8gV2Ugb25seSByZXR1cm4gZmFsc2Ugb24gZmluZGluZyBhIGxvb3AsIHdoaWNoIGlzIHN0b3JlZCBpblxuICAgICAgLy8gdGVtcG9yYXJ5TWFyay5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGVtcG9yYXJ5TWFyay5hZGQoaW5kZXgpO1xuXG4gICAgY29uc3QgbmV4dEVkZ2VzID0gZWRnZU1hcC5nZXQoaW5kZXgpO1xuICAgIGlmIChuZXh0RWRnZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXh0RWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZSA9IG5leHRFZGdlc1tpXTtcbiAgICAgICAgaWYgKCF2aXNpdChlLmopKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGVtcG9yYXJ5TWFyay5kZWxldGUoaW5kZXgpO1xuICAgIG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuZGVsZXRlKGluZGV4KTtcbiAgICByZXQub3JkZXIudW5zaGlmdChpbmRleCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gV2Ugd2lsbCBwcmVzdW1lIHRoYXQgVmVydGV4WzBdIGlzIHRoZSBzdGFydCBub2RlIGFuZCB0aGF0IHdlIHNob3VsZCBzdGFydCB0aGVyZS5cbiAgY29uc3Qgb2sgPSB2aXNpdCgwKTtcbiAgaWYgKCFvaykge1xuICAgIHJldC5oYXNDeWNsZXMgPSB0cnVlO1xuICAgIHJldC5jeWNsZSA9IFsuLi50ZW1wb3JhcnlNYXJrLmtleXMoKV07XG4gIH1cblxuICByZXR1cm4gcmV0O1xufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7XG4gIFZlcnRleEluZGljZXMsXG4gIEVkZ2VzLFxuICBEaXJlY3RlZEdyYXBoLFxuICBlZGdlc0J5U3JjVG9NYXAsXG4gIGVkZ2VzQnlEc3RUb01hcCxcbiAgRGlyZWN0ZWRFZGdlLFxuICBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkLFxufSBmcm9tIFwiLi4vZGFnL2RhZ1wiO1xuXG5pbXBvcnQgeyB0b3BvbG9naWNhbFNvcnQgfSBmcm9tIFwiLi4vZGFnL2FsZ29yaXRobXMvdG9wb3NvcnQudHNcIjtcbmltcG9ydCB7IE1ldHJpY1ZhbHVlcyB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcblxuZXhwb3J0IHR5cGUgVGFza1N0YXRlID0gXCJ1bnN0YXJ0ZWRcIiB8IFwic3RhcnRlZFwiIHwgXCJjb21wbGV0ZVwiO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9UQVNLX05BTUUgPSBcIlRhc2sgTmFtZVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tTZXJpYWxpemVkIHtcbiAgcmVzb3VyY2VzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuICBtZXRyaWNzOiBNZXRyaWNWYWx1ZXM7XG4gIG5hbWU6IHN0cmluZztcbiAgc3RhdGU6IFRhc2tTdGF0ZTtcbn1cblxuLy8gRG8gd2UgY3JlYXRlIHN1Yi1jbGFzc2VzIGFuZCB0aGVuIHNlcmlhbGl6ZSBzZXBhcmF0ZWx5PyBPciBkbyB3ZSBoYXZlIGFcbi8vIGNvbmZpZyBhYm91dCB3aGljaCB0eXBlIG9mIER1cmF0aW9uU2FtcGxlciBpcyBiZWluZyB1c2VkP1xuLy9cbi8vIFdlIGNhbiB1c2UgdHJhZGl0aW9uYWwgb3B0aW1pc3RpYy9wZXNzaW1pc3RpYyB2YWx1ZS4gT3IgSmFjb2JpYW4nc1xuLy8gdW5jZXJ0YWludGx5IG11bHRpcGxpZXJzIFsxLjEsIDEuNSwgMiwgNV0gYW5kIHRoZWlyIGludmVyc2VzIHRvIGdlbmVyYXRlIGFuXG4vLyBvcHRpbWlzdGljIHBlc3NpbWlzdGljLlxuXG4vKiogVGFzayBpcyBhIFZlcnRleCB3aXRoIGRldGFpbHMgYWJvdXQgdGhlIFRhc2sgdG8gY29tcGxldGUuICovXG5leHBvcnQgY2xhc3MgVGFzayB7XG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9IFwiXCIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IERFRkFVTFRfVEFTS19OQU1FO1xuICAgIHRoaXMubWV0cmljcyA9IHt9O1xuICAgIHRoaXMucmVzb3VyY2VzID0ge307XG4gIH1cblxuICAvLyBSZXNvdXJjZSBrZXlzIGFuZCB2YWx1ZXMuIFRoZSBwYXJlbnQgcGxhbiBjb250YWlucyBhbGwgdGhlIHJlc291cmNlXG4gIC8vIGRlZmluaXRpb25zLlxuXG4gIHJlc291cmNlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcblxuICBtZXRyaWNzOiBNZXRyaWNWYWx1ZXM7XG5cbiAgbmFtZTogc3RyaW5nO1xuXG4gIHN0YXRlOiBUYXNrU3RhdGUgPSBcInVuc3RhcnRlZFwiO1xuXG4gIHRvSlNPTigpOiBUYXNrU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc291cmNlczogdGhpcy5yZXNvdXJjZXMsXG4gICAgICBtZXRyaWNzOiB0aGlzLm1ldHJpY3MsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGdldCBkdXJhdGlvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldE1ldHJpYyhcIkR1cmF0aW9uXCIpITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgZHVyYXRpb24odmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgdmFsdWUpO1xuICB9XG5cbiAgcHVibGljIGdldE1ldHJpYyhrZXk6IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMubWV0cmljc1trZXldO1xuICB9XG5cbiAgcHVibGljIHNldE1ldHJpYyhrZXk6IHN0cmluZywgdmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMubWV0cmljc1trZXldID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZGVsZXRlTWV0cmljKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMubWV0cmljc1trZXldO1xuICB9XG5cbiAgcHVibGljIGdldFJlc291cmNlKGtleTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZXNba2V5XTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRSZXNvdXJjZShrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMucmVzb3VyY2VzW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVSZXNvdXJjZShrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLnJlc291cmNlc1trZXldO1xuICB9XG5cbiAgcHVibGljIGR1cCgpOiBUYXNrIHtcbiAgICBjb25zdCByZXQgPSBuZXcgVGFzaygpO1xuICAgIHJldC5yZXNvdXJjZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnJlc291cmNlcyk7XG4gICAgcmV0Lm1ldHJpY3MgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm1ldHJpY3MpO1xuICAgIHJldC5uYW1lID0gdGhpcy5uYW1lO1xuICAgIHJldC5zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUYXNrcyA9IFRhc2tbXTtcblxuZXhwb3J0IGludGVyZmFjZSBDaGFydFNlcmlhbGl6ZWQge1xuICB2ZXJ0aWNlczogVGFza1NlcmlhbGl6ZWRbXTtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVNlcmlhbGl6ZWRbXTtcbn1cblxuLyoqIEEgQ2hhcnQgaXMgYSBEaXJlY3RlZEdyYXBoLCBidXQgd2l0aCBUYXNrcyBmb3IgVmVydGljZXMuICovXG5leHBvcnQgY2xhc3MgQ2hhcnQge1xuICBWZXJ0aWNlczogVGFza3M7XG4gIEVkZ2VzOiBFZGdlcztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBzdGFydCA9IG5ldyBUYXNrKFwiU3RhcnRcIik7XG4gICAgc3RhcnQuc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgMCk7XG4gICAgY29uc3QgZmluaXNoID0gbmV3IFRhc2soXCJGaW5pc2hcIik7XG4gICAgZmluaXNoLnNldE1ldHJpYyhcIkR1cmF0aW9uXCIsIDApO1xuICAgIHRoaXMuVmVydGljZXMgPSBbc3RhcnQsIGZpbmlzaF07XG4gICAgdGhpcy5FZGdlcyA9IFtuZXcgRGlyZWN0ZWRFZGdlKDAsIDEpXTtcbiAgfVxuXG4gIHRvSlNPTigpOiBDaGFydFNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJ0aWNlczogdGhpcy5WZXJ0aWNlcy5tYXAoKHQ6IFRhc2spID0+IHQudG9KU09OKCkpLFxuICAgICAgZWRnZXM6IHRoaXMuRWRnZXMubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUudG9KU09OKCkpLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVG9wb2xvZ2ljYWxPcmRlciA9IFZlcnRleEluZGljZXM7XG5cbmV4cG9ydCB0eXBlIFZhbGlkYXRlUmVzdWx0ID0gUmVzdWx0PFRvcG9sb2dpY2FsT3JkZXI+O1xuXG4vKiogVmFsaWRhdGVzIGEgRGlyZWN0ZWRHcmFwaCBpcyBhIHZhbGlkIENoYXJ0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ2hhcnQoZzogRGlyZWN0ZWRHcmFwaCk6IFZhbGlkYXRlUmVzdWx0IHtcbiAgaWYgKGcuVmVydGljZXMubGVuZ3RoIDwgMikge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIFwiQ2hhcnQgbXVzdCBjb250YWluIGF0IGxlYXN0IHR3byBub2RlLCB0aGUgc3RhcnQgYW5kIGZpbmlzaCB0YXNrcy5cIlxuICAgICk7XG4gIH1cblxuICBjb25zdCBlZGdlc0J5RHN0ID0gZWRnZXNCeURzdFRvTWFwKGcuRWRnZXMpO1xuICBjb25zdCBlZGdlc0J5U3JjID0gZWRnZXNCeVNyY1RvTWFwKGcuRWRnZXMpO1xuXG4gIC8vIFRoZSBmaXJzdCBWZXJ0ZXgsIFRfMCBha2EgdGhlIFN0YXJ0IE1pbGVzdG9uZSwgbXVzdCBoYXZlIDAgaW5jb21pbmcgZWRnZXMuXG4gIGlmIChlZGdlc0J5RHN0LmdldCgwKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFwiVGhlIHN0YXJ0IG5vZGUgKDApIGhhcyBhbiBpbmNvbWluZyBlZGdlLlwiKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfMCBzaG91bGQgaGF2ZSAwIGluY29taW5nIGVkZ2VzLlxuICBmb3IgKGxldCBpID0gMTsgaSA8IGcuVmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeURzdC5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0ICgwKSB0aGF0IGhhcyBubyBpbmNvbWluZyBlZGdlczogJHtpfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlIGxhc3QgVmVydGV4LCBUX2ZpbmlzaCwgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIG11c3QgaGF2ZSAwIG91dGdvaW5nIGVkZ2VzLlxuICBpZiAoZWRnZXNCeVNyYy5nZXQoZy5WZXJ0aWNlcy5sZW5ndGggLSAxKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgXCJUaGUgbGFzdCBub2RlLCB3aGljaCBzaG91bGQgYmUgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIGhhcyBhbiBvdXRnb2luZyBlZGdlLlwiXG4gICAgKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfZmluaXNoIHNob3VsZCBoYXZlIDAgb3V0Z29pbmcgZWRnZXMuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZy5WZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeVNyYy5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0IFRfZmluaXNoIHRoYXQgaGFzIG5vIG91dGdvaW5nIGVkZ2VzOiAke2l9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBudW1WZXJ0aWNlcyA9IGcuVmVydGljZXMubGVuZ3RoO1xuICAvLyBBbmQgYWxsIGVkZ2VzIG1ha2Ugc2Vuc2UsIGkuZS4gdGhleSBhbGwgcG9pbnQgdG8gdmVydGV4ZXMgdGhhdCBleGlzdC5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBnLkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGcuRWRnZXNbaV07XG4gICAgaWYgKFxuICAgICAgZWxlbWVudC5pIDwgMCB8fFxuICAgICAgZWxlbWVudC5pID49IG51bVZlcnRpY2VzIHx8XG4gICAgICBlbGVtZW50LmogPCAwIHx8XG4gICAgICBlbGVtZW50LmogPj0gbnVtVmVydGljZXNcbiAgICApIHtcbiAgICAgIHJldHVybiBlcnJvcihgRWRnZSAke2VsZW1lbnR9IHBvaW50cyB0byBhIG5vbi1leGlzdGVudCBWZXJ0ZXguYCk7XG4gICAgfVxuICB9XG5cbiAgLy8gTm93IHdlIGNvbmZpcm0gdGhhdCB3ZSBoYXZlIGEgRGlyZWN0ZWQgQWN5Y2xpYyBHcmFwaCwgaS5lLiB0aGUgZ3JhcGggaGFzIG5vXG4gIC8vIGN5Y2xlcyBieSBjcmVhdGluZyBhIHRvcG9sb2dpY2FsIHNvcnQgc3RhcnRpbmcgYXQgVF8wXG4gIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmcjRGVwdGgtZmlyc3Rfc2VhcmNoXG4gIGNvbnN0IHRzUmV0ID0gdG9wb2xvZ2ljYWxTb3J0KGcpO1xuICBpZiAodHNSZXQuaGFzQ3ljbGVzKSB7XG4gICAgcmV0dXJuIGVycm9yKGBDaGFydCBoYXMgY3ljbGU6ICR7Wy4uLnRzUmV0LmN5Y2xlXS5qb2luKFwiLCBcIil9YCk7XG4gIH1cblxuICByZXR1cm4gb2sodHNSZXQub3JkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2hhcnRWYWxpZGF0ZShjOiBDaGFydCk6IFZhbGlkYXRlUmVzdWx0IHtcbiAgY29uc3QgcmV0ID0gdmFsaWRhdGVDaGFydChjKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIGlmIChjLlZlcnRpY2VzWzBdLmR1cmF0aW9uICE9PSAwKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYFN0YXJ0IE1pbGVzdG9uZSBtdXN0IGhhdmUgZHVyYXRpb24gb2YgMCwgaW5zdGVhZCBnb3QgJHtjLlZlcnRpY2VzWzBdLmR1cmF0aW9ufWBcbiAgICApO1xuICB9XG4gIGlmIChjLlZlcnRpY2VzW2MuVmVydGljZXMubGVuZ3RoIC0gMV0uZHVyYXRpb24gIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgRmluaXNoIE1pbGVzdG9uZSBtdXN0IGhhdmUgZHVyYXRpb24gb2YgMCwgaW5zdGVhZCBnb3QgJHtcbiAgICAgICAgYy5WZXJ0aWNlc1tjLlZlcnRpY2VzLmxlbmd0aCAtIDFdLmR1cmF0aW9uXG4gICAgICB9YFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cbiIsICJpbXBvcnQgeyBSb3VuZGVyIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlY2lzaW9uU2VyaWFsaXplZCB7XG4gIHByZWNpc2lvbjogbnVtYmVyO1xufVxuZXhwb3J0IGNsYXNzIFByZWNpc2lvbiB7XG4gIHByaXZhdGUgbXVsdGlwbGllcjogbnVtYmVyO1xuICBwcml2YXRlIF9wcmVjaXNpb246IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihwcmVjaXNpb246IG51bWJlciA9IDApIHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShwcmVjaXNpb24pKSB7XG4gICAgICBwcmVjaXNpb24gPSAwO1xuICAgIH1cbiAgICB0aGlzLl9wcmVjaXNpb24gPSBNYXRoLmFicyhNYXRoLnRydW5jKHByZWNpc2lvbikpO1xuICAgIHRoaXMubXVsdGlwbGllciA9IDEwICoqIHRoaXMuX3ByZWNpc2lvbjtcbiAgfVxuXG4gIHJvdW5kKHg6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGgudHJ1bmMoeCAqIHRoaXMubXVsdGlwbGllcikgLyB0aGlzLm11bHRpcGxpZXI7XG4gIH1cblxuICByb3VuZGVyKCk6IFJvdW5kZXIge1xuICAgIHJldHVybiAoeDogbnVtYmVyKTogbnVtYmVyID0+IHRoaXMucm91bmQoeCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHByZWNpc2lvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9wcmVjaXNpb247XG4gIH1cblxuICB0b0pTT04oKTogUHJlY2lzaW9uU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByZWNpc2lvbjogdGhpcy5fcHJlY2lzaW9uLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogUHJlY2lzaW9uU2VyaWFsaXplZCB8IHVuZGVmaW5lZCk6IFByZWNpc2lvbiB7XG4gICAgaWYgKHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBQcmVjaXNpb24oKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcmVjaXNpb24ocy5wcmVjaXNpb24pO1xuICB9XG59XG4iLCAiLy8gVXRpbGl0aWVzIGZvciBkZWFsaW5nIHdpdGggYSByYW5nZSBvZiBudW1iZXJzLlxuXG5leHBvcnQgaW50ZXJmYWNlIE1ldHJpY1JhbmdlU2VyaWFsaXplZCB7XG4gIG1pbjogbnVtYmVyO1xuICBtYXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IGNsYW1wID0gKHg6IG51bWJlciwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgaWYgKHggPiBtYXgpIHtcbiAgICByZXR1cm4gbWF4O1xuICB9XG4gIGlmICh4IDwgbWluKSB7XG4gICAgcmV0dXJuIG1pbjtcbiAgfVxuICByZXR1cm4geDtcbn07XG5cbi8vIFJhbmdlIGRlZmluZXMgYSByYW5nZSBvZiBudW1iZXJzLCBmcm9tIFttaW4sIG1heF0gaW5jbHVzaXZlLlxuZXhwb3J0IGNsYXNzIE1ldHJpY1JhbmdlIHtcbiAgcHJpdmF0ZSBfbWluOiBudW1iZXIgPSAtTnVtYmVyLk1BWF9WQUxVRTtcbiAgcHJpdmF0ZSBfbWF4OiBudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFO1xuXG4gIGNvbnN0cnVjdG9yKG1pbjogbnVtYmVyID0gLU51bWJlci5NQVhfVkFMVUUsIG1heDogbnVtYmVyID0gTnVtYmVyLk1BWF9WQUxVRSkge1xuICAgIGlmIChtYXggPCBtaW4pIHtcbiAgICAgIFttaW4sIG1heF0gPSBbbWF4LCBtaW5dO1xuICAgIH1cbiAgICB0aGlzLl9taW4gPSBtaW47XG4gICAgdGhpcy5fbWF4ID0gbWF4O1xuICB9XG5cbiAgY2xhbXAodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIGNsYW1wKHZhbHVlLCB0aGlzLl9taW4sIHRoaXMuX21heCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1pbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9taW47XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1heCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9tYXg7XG4gIH1cblxuICB0b0pTT04oKTogTWV0cmljUmFuZ2VTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWluOiB0aGlzLl9taW4sXG4gICAgICBtYXg6IHRoaXMuX21heCxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIEZyb21KU09OKHM6IE1ldHJpY1JhbmdlU2VyaWFsaXplZCB8IHVuZGVmaW5lZCk6IE1ldHJpY1JhbmdlIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IE1ldHJpY1JhbmdlKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTWV0cmljUmFuZ2Uocy5taW4sIHMubWF4KTtcbiAgfVxufVxuIiwgIi8vIE1ldHJpY3MgZGVmaW5lIGZsb2F0aW5nIHBvaW50IHZhbHVlcyB0aGF0IGFyZSB0cmFja2VkIHBlciBUYXNrLlxuXG5pbXBvcnQgeyBQcmVjaXNpb24sIFByZWNpc2lvblNlcmlhbGl6ZWQgfSBmcm9tIFwiLi4vcHJlY2lzaW9uL3ByZWNpc2lvbi50c1wiO1xuaW1wb3J0IHsgY2xhbXAsIE1ldHJpY1JhbmdlLCBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQgfSBmcm9tIFwiLi9yYW5nZS50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlU2VyaWFsaXplZDtcbiAgZGVmYXVsdDogbnVtYmVyO1xuICBwcmVjaXNpb246IFByZWNpc2lvblNlcmlhbGl6ZWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRyaWNEZWZpbml0aW9uIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlO1xuICBkZWZhdWx0OiBudW1iZXI7XG4gIGlzU3RhdGljOiBib29sZWFuO1xuICBwcmVjaXNpb246IFByZWNpc2lvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZWZhdWx0VmFsdWU6IG51bWJlcixcbiAgICByYW5nZTogTWV0cmljUmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoKSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlLFxuICAgIHByZWNpc2lvbjogUHJlY2lzaW9uID0gbmV3IFByZWNpc2lvbigxKVxuICApIHtcbiAgICB0aGlzLnJhbmdlID0gcmFuZ2U7XG4gICAgdGhpcy5kZWZhdWx0ID0gY2xhbXAoZGVmYXVsdFZhbHVlLCByYW5nZS5taW4sIHJhbmdlLm1heCk7XG4gICAgdGhpcy5pc1N0YXRpYyA9IGlzU3RhdGljO1xuICAgIHRoaXMucHJlY2lzaW9uID0gcHJlY2lzaW9uO1xuICB9XG5cbiAgdG9KU09OKCk6IE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmFuZ2U6IHRoaXMucmFuZ2UudG9KU09OKCksXG4gICAgICBkZWZhdWx0OiB0aGlzLmRlZmF1bHQsXG4gICAgICBwcmVjaXNpb246IHRoaXMucHJlY2lzaW9uLnRvSlNPTigpLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQgfCB1bmRlZmluZWQpOiBNZXRyaWNEZWZpbml0aW9uIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IE1ldHJpY0RlZmluaXRpb24oMCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTWV0cmljRGVmaW5pdGlvbihcbiAgICAgIHMuZGVmYXVsdCB8fCAwLFxuICAgICAgTWV0cmljUmFuZ2UuRnJvbUpTT04ocy5yYW5nZSksXG4gICAgICBmYWxzZSxcbiAgICAgIFByZWNpc2lvbi5Gcm9tSlNPTihzLnByZWNpc2lvbilcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBNZXRyaWNEZWZpbml0aW9uIH07XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZCA9IHtcbiAgW2tleTogc3RyaW5nXTogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQ7XG59O1xuXG5leHBvcnQgdHlwZSBNZXRyaWNWYWx1ZXMgPSB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IENoYXJ0LCBUYXNrLCBUYXNrU3RhdGUgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IE9wLCBTdWJPcCwgU3ViT3BSZXN1bHQgfSBmcm9tIFwiLi9vcHMudHNcIjtcblxuLyoqIEEgdmFsdWUgb2YgLTEgZm9yIGogbWVhbnMgdGhlIEZpbmlzaCBNaWxlc3RvbmUuICovXG5leHBvcnQgZnVuY3Rpb24gRGlyZWN0ZWRFZGdlRm9yUGxhbihcbiAgaTogbnVtYmVyLFxuICBqOiBudW1iZXIsXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxEaXJlY3RlZEVkZ2U+IHtcbiAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICBpZiAoaiA9PT0gLTEpIHtcbiAgICBqID0gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgfVxuICBpZiAoaSA8IDAgfHwgaSA+PSBjaGFydC5WZXJ0aWNlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgaSBpbmRleCBvdXQgb2YgcmFuZ2U6ICR7aX0gbm90IGluIFswLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDF9XWBcbiAgICApO1xuICB9XG4gIGlmIChqIDwgMCB8fCBqID49IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBqIGluZGV4IG91dCBvZiByYW5nZTogJHtqfSBub3QgaW4gWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMX1dYFxuICAgICk7XG4gIH1cbiAgaWYgKGkgPT09IGopIHtcbiAgICByZXR1cm4gZXJyb3IoYEEgVGFzayBjYW4gbm90IGRlcGVuZCBvbiBpdHNlbGY6ICR7aX0gPT09ICR7an1gKTtcbiAgfVxuICByZXR1cm4gb2sobmV3IERpcmVjdGVkRWRnZShpLCBqKSk7XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRFZGdlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyLCBqOiBudW1iZXIpIHtcbiAgICB0aGlzLmkgPSBpO1xuICAgIHRoaXMuaiA9IGo7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5pID09PSAtMSkge1xuICAgICAgdGhpcy5pID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5qID09PSAtMSkge1xuICAgICAgdGhpcy5qID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIGNvbnN0IGUgPSBEaXJlY3RlZEVkZ2VGb3JQbGFuKHRoaXMuaSwgdGhpcy5qLCBwbGFuKTtcbiAgICBpZiAoIWUub2spIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIC8vIE9ubHkgYWRkIHRoZSBlZGdlIGlmIGl0IGRvZXNuJ3QgZXhpc3RzIGFscmVhZHkuXG4gICAgaWYgKCFwbGFuLmNoYXJ0LkVkZ2VzLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmVxdWFsKGUudmFsdWUpKSkge1xuICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKGUudmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbW92ZUVkZ2VTdXBPcCh0aGlzLmksIHRoaXMuaik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW92ZUVkZ2VTdXBPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmICh0aGlzLmkgPT09IC0xKSB7XG4gICAgICB0aGlzLmkgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuICAgIGlmICh0aGlzLmogPT09IC0xKSB7XG4gICAgICB0aGlzLmogPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuXG4gICAgY29uc3QgZSA9IERpcmVjdGVkRWRnZUZvclBsYW4odGhpcy5pLCB0aGlzLmosIHBsYW4pO1xuICAgIGlmICghZS5vaykge1xuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgICh2OiBEaXJlY3RlZEVkZ2UpOiBib29sZWFuID0+ICF2LmVxdWFsKGUudmFsdWUpXG4gICAgKTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZEVkZ2VTdWJPcCh0aGlzLmksIHRoaXMuaik7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5kZXhJblJhbmdlRm9yVmVydGljZXMoaW5kZXg6IG51bWJlciwgY2hhcnQ6IENoYXJ0KTogUmVzdWx0PG51bGw+IHtcbiAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDIpIHtcbiAgICByZXR1cm4gZXJyb3IoYCR7aW5kZXh9IGlzIG5vdCBpbiByYW5nZSBbMCwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyfV1gKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59XG5cbmZ1bmN0aW9uIGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKFxuICBpbmRleDogbnVtYmVyLFxuICBjaGFydDogQ2hhcnRcbik6IFJlc3VsdDxudWxsPiB7XG4gIGlmIChpbmRleCA8IDEgfHwgaW5kZXggPiBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyKSB7XG4gICAgcmV0dXJuIGVycm9yKGAke2luZGV4fSBpcyBub3QgaW4gcmFuZ2UgWzEsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMn1dYCk7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufVxuXG5leHBvcnQgY2xhc3MgQWRkVGFza0FmdGVyU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuICBmdWxsVGFza1RvQmVSZXN0b3JlZDogRnVsbFRhc2tUb0JlUmVzdG9yZWQgfCBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGluZGV4OiBudW1iZXIsXG4gICAgZnVsbFRhc2tUb0JlUmVzdG9yZWQ6IEZ1bGxUYXNrVG9CZVJlc3RvcmVkIHwgbnVsbCA9IG51bGxcbiAgKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQgPSBmdWxsVGFza1RvQmVSZXN0b3JlZDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGxldCB0YXNrID0gcGxhbi5uZXdUYXNrKCk7XG4gICAgaWYgKHRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQgIT09IG51bGwpIHtcbiAgICAgIHRhc2sgPSB0aGlzLmZ1bGxUYXNrVG9CZVJlc3RvcmVkLnRhc2s7XG4gICAgfVxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXggKyAxLCAwLCB0YXNrKTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID49IHRoaXMuaW5kZXggKyAxKSB7XG4gICAgICAgIGVkZ2UuaSsrO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA+PSB0aGlzLmluZGV4ICsgMSkge1xuICAgICAgICBlZGdlLmorKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5mdWxsVGFza1RvQmVSZXN0b3JlZCAhPT0gbnVsbCkge1xuICAgICAgY2hhcnQuRWRnZXMucHVzaCguLi50aGlzLmZ1bGxUYXNrVG9CZVJlc3RvcmVkLmVkZ2VzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlVGFza1N1Yk9wKHRoaXMuaW5kZXggKyAxKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRHVwVGFza1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjb25zdCBjb3B5ID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLmluZGV4XS5kdXAoKTtcbiAgICAvLyBJbnNlcnQgdGhlIGR1cGxpY2F0ZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgVGFzayBpdCBpcyBjb3BpZWQgZnJvbS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAwLCBjb3B5KTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmkrKztcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaisrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlVGFza1N1Yk9wKHRoaXMuaW5kZXggKyAxKTtcbiAgfVxufVxuXG50eXBlIFN1YnN0aXR1dGlvbiA9IE1hcDxEaXJlY3RlZEVkZ2UsIERpcmVjdGVkRWRnZT47XG5cbmV4cG9ydCBjbGFzcyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBmcm9tVGFza0luZGV4OiBudW1iZXIgPSAwO1xuICB0b1Rhc2tJbmRleDogbnVtYmVyID0gMDtcbiAgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBmcm9tVGFza0luZGV4OiBudW1iZXIsXG4gICAgdG9UYXNrSW5kZXg6IG51bWJlcixcbiAgICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uID0gbmV3IE1hcCgpXG4gICkge1xuICAgIHRoaXMuZnJvbVRhc2tJbmRleCA9IGZyb21UYXNrSW5kZXg7XG4gICAgdGhpcy50b1Rhc2tJbmRleCA9IHRvVGFza0luZGV4O1xuICAgIHRoaXMuYWN0dWFsTW92ZXMgPSBhY3R1YWxNb3ZlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBsZXQgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUodGhpcy5mcm9tVGFza0luZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMudG9UYXNrSW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hY3R1YWxNb3Zlcy52YWx1ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zdCBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uID0gbmV3IE1hcCgpO1xuICAgICAgLy8gVXBkYXRlIGFsbCBFZGdlcyB0aGF0IHN0YXJ0IGF0ICdmcm9tVGFza0luZGV4JyBhbmQgY2hhbmdlIHRoZSBzdGFydCB0byAndG9UYXNrSW5kZXgnLlxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICAgIC8vIFNraXAgdGhlIGNvcm5lciBjYXNlIHRoZXJlIGZyb21UYXNrSW5kZXggcG9pbnRzIHRvIFRhc2tJbmRleC5cbiAgICAgICAgaWYgKGVkZ2UuaSA9PT0gdGhpcy5mcm9tVGFza0luZGV4ICYmIGVkZ2UuaiA9PT0gdGhpcy50b1Rhc2tJbmRleCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVkZ2UuaSA9PT0gdGhpcy5mcm9tVGFza0luZGV4KSB7XG4gICAgICAgICAgYWN0dWFsTW92ZXMuc2V0KFxuICAgICAgICAgICAgbmV3IERpcmVjdGVkRWRnZSh0aGlzLnRvVGFza0luZGV4LCBlZGdlLmopLFxuICAgICAgICAgICAgbmV3IERpcmVjdGVkRWRnZShlZGdlLmksIGVkZ2UuailcbiAgICAgICAgICApO1xuICAgICAgICAgIGVkZ2UuaSA9IHRoaXMudG9UYXNrSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvayh7XG4gICAgICAgIHBsYW46IHBsYW4sXG4gICAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShcbiAgICAgICAgICB0aGlzLnRvVGFza0luZGV4LFxuICAgICAgICAgIHRoaXMuZnJvbVRhc2tJbmRleCxcbiAgICAgICAgICBhY3R1YWxNb3Zlc1xuICAgICAgICApLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbmV3RWRnZSA9IHRoaXMuYWN0dWFsTW92ZXMuZ2V0KHBsYW4uY2hhcnQuRWRnZXNbaV0pO1xuICAgICAgICBpZiAobmV3RWRnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcGxhbi5jaGFydC5FZGdlc1tpXSA9IG5ld0VkZ2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9rKHtcbiAgICAgICAgcGxhbjogcGxhbixcbiAgICAgICAgaW52ZXJzZTogbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AoXG4gICAgICAgICAgdGhpcy50b1Rhc2tJbmRleCxcbiAgICAgICAgICB0aGlzLmZyb21UYXNrSW5kZXhcbiAgICAgICAgKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGludmVyc2UoXG4gICAgdG9UYXNrSW5kZXg6IG51bWJlcixcbiAgICBmcm9tVGFza0luZGV4OiBudW1iZXIsXG4gICAgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvblxuICApOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wKFxuICAgICAgdG9UYXNrSW5kZXgsXG4gICAgICBmcm9tVGFza0luZGV4LFxuICAgICAgYWN0dWFsTW92ZXNcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb3B5QWxsRWRnZXNGcm9tVG9TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZnJvbUluZGV4OiBudW1iZXIgPSAwO1xuICB0b0luZGV4OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGZyb21JbmRleDogbnVtYmVyLCB0b0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmZyb21JbmRleCA9IGZyb21JbmRleDtcbiAgICB0aGlzLnRvSW5kZXggPSB0b0luZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy5mcm9tSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGNvbnN0IG5ld0VkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIHBsYW4uY2hhcnQuRWRnZXMuZm9yRWFjaCgoZWRnZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21JbmRleCkge1xuICAgICAgICBuZXdFZGdlcy5wdXNoKG5ldyBEaXJlY3RlZEVkZ2UodGhpcy50b0luZGV4LCBlZGdlLmopKTtcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPT09IHRoaXMuZnJvbUluZGV4KSB7XG4gICAgICAgIG5ld0VkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZShlZGdlLmksIHRoaXMudG9JbmRleCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCguLi5uZXdFZGdlcyk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgUmVtb3ZlQWxsRWRnZXNTdWJPcChuZXdFZGdlcykgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW92ZUFsbEVkZ2VzU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXTtcblxuICBjb25zdHJ1Y3RvcihlZGdlczogRGlyZWN0ZWRFZGdlW10pIHtcbiAgICB0aGlzLmVkZ2VzID0gZWRnZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAoZWRnZTogRGlyZWN0ZWRFZGdlKSA9PlxuICAgICAgICAtMSA9PT1cbiAgICAgICAgdGhpcy5lZGdlcy5maW5kSW5kZXgoKHRvQmVSZW1vdmVkOiBEaXJlY3RlZEVkZ2UpID0+XG4gICAgICAgICAgZWRnZS5lcXVhbCh0b0JlUmVtb3ZlZClcbiAgICAgICAgKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgQWRkQWxsRWRnZXNTdWJPcCh0aGlzLmVkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCguLi50aGlzLmVkZ2VzKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBSZW1vdmVBbGxFZGdlc1N1Yk9wKHRoaXMuZWRnZXMpIH0pO1xuICB9XG59XG5cbmludGVyZmFjZSBGdWxsVGFza1RvQmVSZXN0b3JlZCB7XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXTtcbiAgdGFzazogVGFzaztcbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVRhc2tTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgZWRnZXNUb0JlUmVzdG9yZWQgPSBjaGFydC5FZGdlcy5maWx0ZXIoKGRlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChkZS5pID09PSB0aGlzLmluZGV4IHx8IGRlLmogPT09IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICAvLyBGaXJzdCByZW1vdmUgYWxsIGVkZ2VzIHRvIGFuZCBmcm9tIHRoZSB0YXNrLlxuICAgIGNoYXJ0LkVkZ2VzID0gY2hhcnQuRWRnZXMuZmlsdGVyKChkZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoZGUuaSA9PT0gdGhpcy5pbmRleCB8fCBkZS5qID09PSB0aGlzLmluZGV4KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIGVkZ2VzIGZvciB0YXNrcyB0aGF0IHdpbGwgZW5kIHVwIGF0IGEgbmV3IGluZGV4LlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgIGlmIChlZGdlLmkgPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaS0tO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5qLS07XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdGFza1RvQmVSZXN0b3JlZCA9IGNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAxKTtcbiAgICBjb25zdCBmdWxsVGFza1RvQmVSZXN0b3JlZCA9IHtcbiAgICAgIGVkZ2VzOiBlZGdlc1RvQmVSZXN0b3JlZCxcbiAgICAgIHRhc2s6IHRhc2tUb0JlUmVzdG9yZWRbMF0sXG4gICAgfTtcbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoZnVsbFRhc2tUb0JlUmVzdG9yZWQpIH0pO1xuICB9XG5cbiAgaW52ZXJzZShmdWxsVGFza1RvQmVSZXN0b3JlZDogRnVsbFRhc2tUb0JlUmVzdG9yZWQpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRUYXNrQWZ0ZXJTdWJPcCh0aGlzLmluZGV4IC0gMSwgZnVsbFRhc2tUb0JlUmVzdG9yZWQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBzcmNBbmREc3QgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAocGxhbi5jaGFydC5FZGdlcyk7XG4gICAgY29uc3QgU3RhcnQgPSAwO1xuICAgIGNvbnN0IEZpbmlzaCA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcblxuICAgIC8vIGxvb3Agb3ZlciBhbGwgdmVydGljcyBmcm9tIFtTdGFydCwgRmluaXNoKSBhbmQgbG9vayBmb3IgdGhlaXJcbiAgICAvLyBkZXN0aW5hdGlvbnMuIElmIHRoZXkgaGF2ZSBub25lIHRoZW4gYWRkIGluIGFuIGVkZ2UgdG8gRmluaXNoLiBJZiB0aGV5XG4gICAgLy8gaGF2ZSBtb3JlIHRoYW4gb25lIHRoZW4gcmVtb3ZlIGFueSBsaW5rcyB0byBGaW5pc2guXG4gICAgZm9yIChsZXQgaSA9IFN0YXJ0OyBpIDwgRmluaXNoOyBpKyspIHtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9ucyA9IHNyY0FuZERzdC5ieVNyYy5nZXQoaSk7XG4gICAgICBpZiAoZGVzdGluYXRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgdG9CZUFkZGVkID0gbmV3IERpcmVjdGVkRWRnZShpLCBGaW5pc2gpO1xuICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2godG9CZUFkZGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFyZSB0aGVyZSBhbnkgdW5lZWRlZCBFZ2RlcyB0byBGaW5pc2g/IElmIHNvIGZpbHRlciB0aGVtIG91dC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgZGVzdGluYXRpb25zLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmogPT09IEZpbmlzaClcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgdG9CZVJlbW92ZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKGksIEZpbmlzaCk7XG4gICAgICAgICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgICAgICAgKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+ICF0b0JlUmVtb3ZlZC5lcXVhbCh2YWx1ZSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbG9vcCBvdmVyIGFsbCB2ZXJ0aWNzIGZyb20oU3RhcnQsIEZpbmlzaF0gYW5kIGxvb2sgZm9yIHRoZWlyIHNvdXJjZXMuIElmXG4gICAgLy8gdGhleSBoYXZlIG5vbmUgdGhlbiBhZGQgaW4gYW4gZWRnZSBmcm9tIFN0YXJ0LiBJZiB0aGV5IGhhdmUgbW9yZSB0aGFuIG9uZVxuICAgIC8vIHRoZW4gcmVtb3ZlIGFueSBsaW5rcyBmcm9tIFN0YXJ0LlxuICAgIGZvciAobGV0IGkgPSBTdGFydCArIDE7IGkgPCBGaW5pc2g7IGkrKykge1xuICAgICAgY29uc3QgZGVzdGluYXRpb25zID0gc3JjQW5kRHN0LmJ5RHN0LmdldChpKTtcbiAgICAgIGlmIChkZXN0aW5hdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB0b0JlQWRkZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBpKTtcbiAgICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKHRvQmVBZGRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBcmUgdGhlcmUgYW55IHVuLW5lZWRlZCBFZ2RlcyBmcm9tIFN0YXJ0PyBJZiBzbyBmaWx0ZXIgdGhlbSBvdXQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBkZXN0aW5hdGlvbnMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5maW5kKCh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiB2YWx1ZS5pID09PSBTdGFydClcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgdG9CZVJlbW92ZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBpKTtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAgICAgICAodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gIXRvQmVSZW1vdmVkLmVxdWFsKHZhbHVlKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBsYW4uY2hhcnQuRWRnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZShTdGFydCwgRmluaXNoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRUYXNrTmFtZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHRhc2tJbmRleDogbnVtYmVyLCBuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy50YXNrSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBjb25zdCBvbGROYW1lID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0ubmFtZTtcbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5uYW1lID0gdGhpcy5uYW1lO1xuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZE5hbWUpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZShvbGROYW1lOiBzdHJpbmcpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRUYXNrTmFtZVN1Yk9wKHRoaXMudGFza0luZGV4LCBvbGROYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0VGFza1N0YXRlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIHRhc2tTdGF0ZTogVGFza1N0YXRlO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih0YXNrSW5kZXg6IG51bWJlciwgdGFza1N0YXRlOiBUYXNrU3RhdGUpIHtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgICB0aGlzLnRhc2tTdGF0ZSA9IHRhc2tTdGF0ZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMudGFza0luZGV4LCBwbGFuLmNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgY29uc3Qgb2xkU3RhdGUgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5zdGF0ZTtcbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5zdGF0ZSA9IHRoaXMudGFza1N0YXRlO1xuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZFN0YXRlKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UodGFza1N0YXRlOiBUYXNrU3RhdGUpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRUYXNrU3RhdGVTdWJPcCh0aGlzLnRhc2tJbmRleCwgdGFza1N0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICAgIG5ldyBBZGRUYXNrQWZ0ZXJTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AoMCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCh0YXNrSW5kZXggKyAxLCAtMSksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldFRhc2tOYW1lT3AodGFza0luZGV4OiBudW1iZXIsIG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldFRhc2tOYW1lU3ViT3AodGFza0luZGV4LCBuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0VGFza1N0YXRlT3AodGFza0luZGV4OiBudW1iZXIsIHRhc2tTdGF0ZTogVGFza1N0YXRlKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0VGFza1N0YXRlU3ViT3AodGFza0luZGV4LCB0YXNrU3RhdGUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTcGxpdFRhc2tPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgY29uc3Qgc3ViT3BzOiBTdWJPcFtdID0gW1xuICAgIG5ldyBEdXBUYXNrU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKHRhc2tJbmRleCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgXTtcblxuICByZXR1cm4gbmV3IE9wKHN1Yk9wcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEdXBUYXNrT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIGNvbnN0IHN1Yk9wczogU3ViT3BbXSA9IFtcbiAgICBuZXcgRHVwVGFza1N1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IENvcHlBbGxFZGdlc0Zyb21Ub1N1Yk9wKHRhc2tJbmRleCwgdGFza0luZGV4ICsgMSksXG4gIF07XG5cbiAgcmV0dXJuIG5ldyBPcChzdWJPcHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlVGFza09wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IERlbGV0ZVRhc2tTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRFZGdlT3AoZnJvbVRhc2tJbmRleDogbnVtYmVyLCB0b1Rhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcChmcm9tVGFza0luZGV4LCB0b1Rhc2tJbmRleCksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJhdGlvbmFsaXplRWRnZXNPcCgpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKV0pO1xufVxuIiwgIi8qKlxuICogVHJpYW5ndWxhciBpcyB0aGUgaW52ZXJzZSBDdW11bGF0aXZlIERlbnNpdHkgRnVuY3Rpb24gKENERikgZm9yIHRoZVxuICogdHJpYW5ndWxhciBkaXN0cmlidXRpb24uXG4gKlxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVHJpYW5ndWxhcl9kaXN0cmlidXRpb24jR2VuZXJhdGluZ19yYW5kb21fdmFyaWF0ZXNcbiAqXG4gKiBUaGUgaW52ZXJzZSBvZiB0aGUgQ0RGIGlzIHVzZWZ1bCBmb3IgZ2VuZXJhdGluZyBzYW1wbGVzIGZyb20gdGhlXG4gKiBkaXN0cmlidXRpb24sIGkuZS4gcGFzc2luZyBpbiB2YWx1ZXMgZnJvbSB0aGUgdW5pZm9ybSBkaXN0cmlidXRpb24gWzAsIDFdXG4gKiB3aWxsIHByb2R1Y2Ugc2FtcGxlIHRoYXQgbG9vayBsaWtlIHRoZXkgY29tZSBmcm9tIHRoZSB0cmlhbmd1bGFyXG4gKiBkaXN0cmlidXRpb24uXG4gKlxuICpcbiAqL1xuXG5leHBvcnQgY2xhc3MgVHJpYW5ndWxhciB7XG4gIHByaXZhdGUgYTogbnVtYmVyO1xuICBwcml2YXRlIGI6IG51bWJlcjtcbiAgcHJpdmF0ZSBjOiBudW1iZXI7XG4gIHByaXZhdGUgRl9jOiBudW1iZXI7XG5cbiAgLyoqICBUaGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24gaXMgYSBjb250aW51b3VzIHByb2JhYmlsaXR5IGRpc3RyaWJ1dGlvbiB3aXRoXG4gIGxvd2VyIGxpbWl0IGBhYCwgdXBwZXIgbGltaXQgYGJgLCBhbmQgbW9kZSBgY2AsIHdoZXJlIGEgPCBiIGFuZCBhIFx1MjI2NCBjIFx1MjI2NCBiLiAqL1xuICBjb25zdHJ1Y3RvcihhOiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyKSB7XG4gICAgdGhpcy5hID0gYTtcbiAgICB0aGlzLmIgPSBiO1xuICAgIHRoaXMuYyA9IGM7XG5cbiAgICAvLyBGX2MgaXMgdGhlIGN1dG9mZiBpbiB0aGUgZG9tYWluIHdoZXJlIHdlIHN3aXRjaCBiZXR3ZWVuIHRoZSB0d28gaGFsdmVzIG9mXG4gICAgLy8gdGhlIHRyaWFuZ2xlLlxuICAgIHRoaXMuRl9jID0gKGMgLSBhKSAvIChiIC0gYSk7XG4gIH1cblxuICAvKiogIFByb2R1Y2UgYSBzYW1wbGUgZnJvbSB0aGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24uIFRoZSB2YWx1ZSBvZiAncCdcbiAgIHNob3VsZCBiZSBpbiBbMCwgMS4wXS4gKi9cbiAgc2FtcGxlKHA6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKHAgPCAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9IGVsc2UgaWYgKHAgPiAxLjApIHtcbiAgICAgIHJldHVybiAxLjA7XG4gICAgfSBlbHNlIGlmIChwIDwgdGhpcy5GX2MpIHtcbiAgICAgIHJldHVybiB0aGlzLmEgKyBNYXRoLnNxcnQocCAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYyAtIHRoaXMuYSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLmIgLSBNYXRoLnNxcnQoKDEgLSBwKSAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYiAtIHRoaXMuYykpXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IFRyaWFuZ3VsYXIgfSBmcm9tIFwiLi90cmlhbmd1bGFyLnRzXCI7XG5cbmV4cG9ydCB0eXBlIFVuY2VydGFpbnR5ID0gXCJsb3dcIiB8IFwibW9kZXJhdGVcIiB8IFwiaGlnaFwiIHwgXCJleHRyZW1lXCI7XG5cbmV4cG9ydCBjb25zdCBVbmNlcnRhaW50eVRvTnVtOiBSZWNvcmQ8VW5jZXJ0YWludHksIG51bWJlcj4gPSB7XG4gIGxvdzogMS4xLFxuICBtb2RlcmF0ZTogMS41LFxuICBoaWdoOiAyLFxuICBleHRyZW1lOiA1LFxufTtcblxuZXhwb3J0IGNsYXNzIEphY29iaWFuIHtcbiAgcHJpdmF0ZSB0cmlhbmd1bGFyOiBUcmlhbmd1bGFyO1xuICBjb25zdHJ1Y3RvcihleHBlY3RlZDogbnVtYmVyLCB1bmNlcnRhaW50eTogVW5jZXJ0YWludHkpIHtcbiAgICBjb25zdCBtdWwgPSBVbmNlcnRhaW50eVRvTnVtW3VuY2VydGFpbnR5XTtcbiAgICB0aGlzLnRyaWFuZ3VsYXIgPSBuZXcgVHJpYW5ndWxhcihleHBlY3RlZCAvIG11bCwgZXhwZWN0ZWQgKiBtdWwsIGV4cGVjdGVkKTtcbiAgfVxuXG4gIHNhbXBsZShwOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnRyaWFuZ3VsYXIuc2FtcGxlKHApO1xuICB9XG59XG4iLCAiaW1wb3J0IHtcbiAgQ2hhcnQsXG4gIENoYXJ0U2VyaWFsaXplZCxcbiAgVGFzayxcbiAgVGFza1NlcmlhbGl6ZWQsXG4gIHZhbGlkYXRlQ2hhcnQsXG59IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7XG4gIE1ldHJpY0RlZmluaXRpb24sXG4gIE1ldHJpY0RlZmluaXRpb25zLFxuICBNZXRyaWNEZWZpbml0aW9uc1NlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IE1ldHJpY1JhbmdlIH0gZnJvbSBcIi4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFJhdGlvbmFsaXplRWRnZXNPcCB9IGZyb20gXCIuLi9vcHMvY2hhcnQudHNcIjtcbmltcG9ydCB7XG4gIFJlc291cmNlRGVmaW5pdGlvbixcbiAgUmVzb3VyY2VEZWZpbml0aW9ucyxcbiAgUmVzb3VyY2VEZWZpbml0aW9uc1NlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgVW5jZXJ0YWludHlUb051bSB9IGZyb20gXCIuLi9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhbi50c1wiO1xuXG5leHBvcnQgdHlwZSBTdGF0aWNNZXRyaWNLZXlzID0gXCJEdXJhdGlvblwiIHwgXCJQZXJjZW50IENvbXBsZXRlXCI7XG5cbmV4cG9ydCBjb25zdCBTdGF0aWNNZXRyaWNEZWZpbml0aW9uczogTWV0cmljRGVmaW5pdGlvbnMgPSB7XG4gIC8vIEhvdyBsb25nIGEgdGFzayB3aWxsIHRha2UsIGluIGRheXMuXG4gIER1cmF0aW9uOiBuZXcgTWV0cmljRGVmaW5pdGlvbigwLCBuZXcgTWV0cmljUmFuZ2UoMCksIHRydWUpLFxuICAvLyBUaGUgcGVyY2VudCBjb21wbGV0ZSBmb3IgYSB0YXNrLlxuICBQZXJjZW50OiBuZXcgTWV0cmljRGVmaW5pdGlvbigwLCBuZXcgTWV0cmljUmFuZ2UoMCwgMTAwKSwgdHJ1ZSksXG59O1xuXG5leHBvcnQgY29uc3QgU3RhdGljUmVzb3VyY2VEZWZpbml0aW9uczogUmVzb3VyY2VEZWZpbml0aW9ucyA9IHtcbiAgVW5jZXJ0YWludHk6IG5ldyBSZXNvdXJjZURlZmluaXRpb24oT2JqZWN0LmtleXMoVW5jZXJ0YWludHlUb051bSksIHRydWUpLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBQbGFuU2VyaWFsaXplZCB7XG4gIGNoYXJ0OiBDaGFydFNlcmlhbGl6ZWQ7XG4gIHJlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnNTZXJpYWxpemVkO1xuICBtZXRyaWNEZWZpbml0aW9uczogTWV0cmljRGVmaW5pdGlvbnNTZXJpYWxpemVkO1xufVxuXG5leHBvcnQgY2xhc3MgUGxhbiB7XG4gIGNoYXJ0OiBDaGFydDtcblxuICByZXNvdXJjZURlZmluaXRpb25zOiBSZXNvdXJjZURlZmluaXRpb25zO1xuXG4gIG1ldHJpY0RlZmluaXRpb25zOiBNZXRyaWNEZWZpbml0aW9ucztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNoYXJ0ID0gbmV3IENoYXJ0KCk7XG5cbiAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zKTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljTWV0cmljRGVmaW5pdGlvbnMpO1xuICAgIHRoaXMuYXBwbHlNZXRyaWNzQW5kUmVzb3VyY2VzVG9WZXJ0aWNlcygpO1xuICB9XG5cbiAgYXBwbHlNZXRyaWNzQW5kUmVzb3VyY2VzVG9WZXJ0aWNlcygpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLm1ldHJpY0RlZmluaXRpb25zKS5mb3JFYWNoKChtZXRyaWNOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IG1kID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uc1ttZXRyaWNOYW1lXSE7XG4gICAgICB0aGlzLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgICAgdGFzay5zZXRNZXRyaWMobWV0cmljTmFtZSwgbWQuZGVmYXVsdCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBPYmplY3QuZW50cmllcyh0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMpLmZvckVhY2goXG4gICAgICAoW2tleSwgcmVzb3VyY2VEZWZpbml0aW9uXSkgPT4ge1xuICAgICAgICB0aGlzLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgICAgICB0YXNrLnNldFJlc291cmNlKGtleSwgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1swXSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICB0b0pTT04oKTogUGxhblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBjaGFydDogdGhpcy5jaGFydC50b0pTT04oKSxcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbnM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXModGhpcy5yZXNvdXJjZURlZmluaXRpb25zKS5maWx0ZXIoXG4gICAgICAgICAgKFtrZXksIHJlc291cmNlRGVmaW5pdGlvbl0pID0+ICFyZXNvdXJjZURlZmluaXRpb24uaXNTdGF0aWNcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIG1ldHJpY0RlZmluaXRpb25zOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpXG4gICAgICAgICAgLmZpbHRlcigoW2tleSwgbWV0cmljRGVmaW5pdGlvbl0pID0+ICFtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKVxuICAgICAgICAgIC5tYXAoKFtrZXksIG1ldHJpY0RlZmluaXRpb25dKSA9PiBba2V5LCBtZXRyaWNEZWZpbml0aW9uLnRvSlNPTigpXSlcbiAgICAgICksXG4gICAgfTtcbiAgfVxuXG4gIGdldE1ldHJpY0RlZmluaXRpb24oa2V5OiBzdHJpbmcpOiBNZXRyaWNEZWZpbml0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgc2V0TWV0cmljRGVmaW5pdGlvbihrZXk6IHN0cmluZywgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbikge1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XSA9IG1ldHJpY0RlZmluaXRpb247XG4gIH1cblxuICBkZWxldGVNZXRyaWNEZWZpbml0aW9uKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIGdldFJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZyk6IFJlc291cmNlRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgc2V0UmVzb3VyY2VEZWZpbml0aW9uKGtleTogc3RyaW5nLCB2YWx1ZTogUmVzb3VyY2VEZWZpbml0aW9uKSB7XG4gICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGRlbGV0ZVJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYSBuZXcgVGFzayB3aXRoIGRlZmF1bHRzIGZvciBhbGwgbWV0cmljcyBhbmQgcmVzb3VyY2VzLlxuICBuZXdUYXNrKCk6IFRhc2sge1xuICAgIGNvbnN0IHJldCA9IG5ldyBUYXNrKCk7XG4gICAgT2JqZWN0LmtleXModGhpcy5tZXRyaWNEZWZpbml0aW9ucykuZm9yRWFjaCgobWV0cmljTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBtZCA9IHRoaXMuZ2V0TWV0cmljRGVmaW5pdGlvbihtZXRyaWNOYW1lKSE7XG4gICAgICByZXQuc2V0TWV0cmljKG1ldHJpY05hbWUsIG1kLmRlZmF1bHQpO1xuICAgIH0pO1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZm9yRWFjaChcbiAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiB7XG4gICAgICAgIHJldC5zZXRSZXNvdXJjZShrZXksIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbMF0pO1xuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgRnJvbUpTT04gPSAodGV4dDogc3RyaW5nKTogUmVzdWx0PFBsYW4+ID0+IHtcbiAgY29uc3QgcGxhblNlcmlhbGl6ZWQ6IFBsYW5TZXJpYWxpemVkID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgY29uc3QgcGxhbiA9IG5ldyBQbGFuKCk7XG5cbiAgcGxhbi5jaGFydC5WZXJ0aWNlcyA9IHBsYW5TZXJpYWxpemVkLmNoYXJ0LnZlcnRpY2VzLm1hcChcbiAgICAodGFza1NlcmlhbGl6ZWQ6IFRhc2tTZXJpYWxpemVkKTogVGFzayA9PiB7XG4gICAgICBjb25zdCB0YXNrID0gbmV3IFRhc2sodGFza1NlcmlhbGl6ZWQubmFtZSk7XG4gICAgICB0YXNrLnN0YXRlID0gdGFza1NlcmlhbGl6ZWQuc3RhdGU7XG4gICAgICB0YXNrLm1ldHJpY3MgPSB0YXNrU2VyaWFsaXplZC5tZXRyaWNzO1xuICAgICAgdGFzay5yZXNvdXJjZXMgPSB0YXNrU2VyaWFsaXplZC5yZXNvdXJjZXM7XG5cbiAgICAgIHJldHVybiB0YXNrO1xuICAgIH1cbiAgKTtcbiAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW5TZXJpYWxpemVkLmNoYXJ0LmVkZ2VzLm1hcChcbiAgICAoZGlyZWN0ZWRFZGdlU2VyaWFsaXplZDogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCk6IERpcmVjdGVkRWRnZSA9PlxuICAgICAgbmV3IERpcmVjdGVkRWRnZShkaXJlY3RlZEVkZ2VTZXJpYWxpemVkLmksIGRpcmVjdGVkRWRnZVNlcmlhbGl6ZWQuailcbiAgKTtcblxuICBjb25zdCBkZXNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhwbGFuU2VyaWFsaXplZC5tZXRyaWNEZWZpbml0aW9ucykubWFwKFxuICAgICAgKFtrZXksIHNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uXSkgPT4gW1xuICAgICAgICBrZXksXG4gICAgICAgIE1ldHJpY0RlZmluaXRpb24uRnJvbUpTT04oc2VyaWFsaXplZE1ldHJpY0RlZmluaXRpb24pLFxuICAgICAgXVxuICAgIClcbiAgKTtcblxuICBwbGFuLm1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICB7fSxcbiAgICBTdGF0aWNNZXRyaWNEZWZpbml0aW9ucyxcbiAgICBkZXNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uc1xuICApO1xuXG4gIGNvbnN0IGRlc2VyaWFsaXplZFJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMocGxhblNlcmlhbGl6ZWQucmVzb3VyY2VEZWZpbml0aW9ucykubWFwKFxuICAgICAgKFtrZXksIHNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25dKSA9PiBbXG4gICAgICAgIGtleSxcbiAgICAgICAgUmVzb3VyY2VEZWZpbml0aW9uLkZyb21KU09OKHNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb24pLFxuICAgICAgXVxuICAgIClcbiAgKTtcblxuICBwbGFuLnJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgIHt9LFxuICAgIFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnMsXG4gICAgZGVzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9uc1xuICApO1xuXG4gIGNvbnN0IHJldCA9IFJhdGlvbmFsaXplRWRnZXNPcCgpLmFwcGx5VG8ocGxhbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGNvbnN0IHJldFZhbCA9IHZhbGlkYXRlQ2hhcnQocGxhbi5jaGFydCk7XG4gIGlmICghcmV0VmFsLm9rKSB7XG4gICAgcmV0dXJuIHJldFZhbDtcbiAgfVxuICByZXR1cm4gb2socGxhbik7XG59O1xuIiwgIi8qKiBBIGNvb3JkaW5hdGUgcG9pbnQgb24gdGhlIHJlbmRlcmluZyBzdXJmYWNlLiAqL1xuZXhwb3J0IGNsYXNzIFBvaW50IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gIH1cblxuICBhZGQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBQb2ludCB7XG4gICAgdGhpcy54ICs9IHg7XG4gICAgdGhpcy55ICs9IHk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzdW0ocmhzOiBQb2ludCk6IFBvaW50IHtcbiAgICByZXR1cm4gbmV3IFBvaW50KHRoaXMueCArIHJocy54LCB0aGlzLnkgKyByaHMueSk7XG4gIH1cblxuICBlcXVhbChyaHM6IFBvaW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMueCA9PT0gcmhzLnggJiYgdGhpcy55ID09PSByaHMueTtcbiAgfVxuXG4gIHNldChyaHM6IFBvaW50KTogUG9pbnQge1xuICAgIHRoaXMueCA9IHJocy54O1xuICAgIHRoaXMueSA9IHJocy55O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZHVwKCk6IFBvaW50IHtcbiAgICByZXR1cm4gbmV3IFBvaW50KHRoaXMueCwgdGhpcy55KTtcbiAgfVxufVxuIiwgIi8qKlxuICogRnVuY3Rpb25hbGl0eSBmb3IgY3JlYXRpbmcgZHJhZ2dhYmxlIGRpdmlkZXJzIGJldHdlZW4gZWxlbWVudHMgb24gYSBwYWdlLlxuICovXG5pbXBvcnQgeyBjbGFtcCB9IGZyb20gXCIuLi8uLi9tZXRyaWNzL3JhbmdlLnRzXCI7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuLi9zY2FsZS9wb2ludC50c1wiO1xuXG4vLyBWYWx1ZXMgYXJlIHJldHVybmVkIGFzIHBlcmNlbnRhZ2VzIGFyb3VuZCB0aGUgY3VycmVudCBtb3VzZSBsb2NhdGlvbi4gVGhhdFxuLy8gaXMsIGlmIHdlIGFyZSBpbiBcImNvbHVtblwiIG1vZGUgdGhlbiBgYmVmb3JlYCB3b3VsZCBlcXVhbCB0aGUgbW91c2UgcG9zaXRpb25cbi8vIGFzIGEgJSBvZiB0aGUgd2lkdGggb2YgdGhlIHBhcmVudCBlbGVtZW50IGZyb20gdGhlIGxlZnQgaGFuZCBzaWRlIG9mIHRoZVxuLy8gcGFyZW50IGVsZW1lbnQuIFRoZSBgYWZ0ZXJgIHZhbHVlIGlzIGp1c3QgMTAwLWJlZm9yZS5cbmV4cG9ydCBpbnRlcmZhY2UgRGl2aWRlck1vdmVSZXN1bHQge1xuICBiZWZvcmU6IG51bWJlcjtcbiAgYWZ0ZXI6IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgRGl2aWRlclR5cGUgPSBcImNvbHVtblwiIHwgXCJyb3dcIjtcblxuZXhwb3J0IGNvbnN0IERJVklERVJfTU9WRV9FVkVOVCA9IFwiZGl2aWRlcl9tb3ZlXCI7XG5cbmV4cG9ydCBjb25zdCBSRVNJWklOR19DTEFTUyA9IFwicmVzaXppbmdcIjtcblxuaW50ZXJmYWNlIFJlY3Qge1xuICB0b3A6IG51bWJlcjtcbiAgbGVmdDogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbn1cblxuLyoqIFJldHVybnMgYSBib3VuZGluZyByZWN0YW5nbGUgZm9yIGFuIGVsZW1lbnQgaW4gUGFnZSBjb29yZGluYXRlcywgYXMgb3Bwb3NlZFxuICogdG8gVmlld1BvcnQgY29vcmRpbmF0ZXMsIHdoaWNoIGlzIHdoYXQgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgcmV0dXJucy5cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFBhZ2VSZWN0ID0gKGVsZTogSFRNTEVsZW1lbnQpOiBSZWN0ID0+IHtcbiAgY29uc3Qgdmlld3BvcnRSZWN0ID0gZWxlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZXR1cm4ge1xuICAgIHRvcDogdmlld3BvcnRSZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZLFxuICAgIGxlZnQ6IHZpZXdwb3J0UmVjdC5sZWZ0ICsgd2luZG93LnNjcm9sbFgsXG4gICAgd2lkdGg6IHZpZXdwb3J0UmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHZpZXdwb3J0UmVjdC5oZWlnaHQsXG4gIH07XG59O1xuXG4vKiogRGl2aWRlck1vdmUgaXMgY29yZSBmdW5jdGlvbmFsaXR5IGZvciBjcmVhdGluZyBkcmFnZ2FibGUgZGl2aWRlcnMgYmV0d2VlblxuICogZWxlbWVudHMgb24gYSBwYWdlLlxuICpcbiAqIENvbnN0cnVjdCBhIERpdmlkZXJNb2RlIHdpdGggYSBwYXJlbnQgZWxlbWVudCBhbmQgYSBkaXZpZGVyIGVsZW1lbnQsIHdoZXJlXG4gKiB0aGUgZGl2aWRlciBlbGVtZW50IGlzIHRoZSBlbGVtZW50IGJldHdlZW4gb3RoZXIgcGFnZSBlbGVtZW50cyB0aGF0IGlzXG4gKiBleHBlY3RlZCB0byBiZSBkcmFnZ2VkLiBGb3IgZXhhbXBsZSwgaW4gdGhlIGZvbGxvd2luZyBleGFtcGxlICNjb250YWluZXJcbiAqIHdvdWxkIGJlIHRoZSBgcGFyZW50YCwgYW5kICNkaXZpZGVyIHdvdWxkIGJlIHRoZSBgZGl2aWRlcmAgZWxlbWVudC5cbiAqXG4gKiAgPGRpdiBpZD1jb250YWluZXI+XG4gKiAgICA8ZGl2IGlkPWxlZnQ+PC9kaXY+ICA8ZGl2IGlkPWRpdmlkZXI+PC9kaXY+IDxkaXYgaWQ9cmlnaHQ+PC9kaXY/XG4gKiAgPC9kaXY+XG4gKlxuICogRGl2aWRlck1vZGUgd2FpdHMgZm9yIGEgbW91c2Vkb3duIGV2ZW50IG9uIHRoZSBgZGl2aWRlcmAgZWxlbWVudCBhbmQgdGhlblxuICogd2F0Y2hlcyBtb3VzZSBldmVudHMgZm9yIHRoZSBnaXZlbiBwYXJlbnQgSFRNTEVsZW1lbnQgYW5kIGVtaXRzIGV2ZW50cyBhcm91bmRcbiAqIGRyYWdnaW5nLlxuICpcbiAqIFRoZSBlbWl0dGVkIGV2ZW50IGlzIFwiZGl2aWRlcl9tb3ZlXCIgYW5kIGlzIGEgQ3VzdG9tRXZlbnQ8RGl2aWRlck1vdmVSZXN1bHQ+LlxuICpcbiAqIEl0IGlzIHVwIHRvIHRoZSB1c2VyIG9mIERpdmlkZXJNb3ZlIHRvIGxpc3RlbiBmb3IgdGhlIFwiZGl2aWRlcl9tb3ZlXCIgZXZlbnRzXG4gKiBhbmQgdXBkYXRlIHRoZSBDU1Mgb2YgdGhlIHBhZ2UgYXBwcm9wcmlhdGVseSB0byByZWZsZWN0IHRoZSBwb3NpdGlvbiBvZiB0aGVcbiAqIGRpdmlkZXIuXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgZG93biBhbiBldmVudCB3aWxsIGJlIGVtaXR0ZWQgcGVyaW9kaWNhbGx5IGFzIHRoZSBtb3VzZVxuICogbW92ZXMuXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcmVsZWFzZWQsIG9yIGlmIHRoZSBtb3VzZSBleGl0cyB0aGUgcGFyZW50IEhUTUxFbGVtZW50LCBvbmVcbiAqIGxhc3QgZXZlbnQgaXMgZW1pdHRlZC5cbiAqXG4gKiBXaGlsZSBkcmFnZ2luZyB0aGUgZGl2aWRlciwgdGhlIFwicmVzaXppbmdcIiBjbGFzcyB3aWxsIGJlIGFkZGVkIHRvIHRoZSBwYXJlbnRcbiAqIGVsZW1lbnQuIFRoaXMgY2FuIGJlIHVzZWQgdG8gc2V0IGEgc3R5bGUsIGUuZy4gJ3VzZXItc2VsZWN0OiBub25lJy5cbiAqL1xuZXhwb3J0IGNsYXNzIERpdmlkZXJNb3ZlIHtcbiAgLyoqIFRoZSBwb2ludCB3aGVyZSBkcmFnZ2luZyBzdGFydGVkLCBpbiBQYWdlIGNvb3JkaW5hdGVzLiAqL1xuICBiZWdpbjogUG9pbnQgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGRpbWVuc2lvbnMgb2YgdGhlIHBhcmVudCBlbGVtZW50IGluIFBhZ2UgY29vcmRpbmF0ZXMgYXMgb2YgbW91c2Vkb3duXG4gICAqIG9uIHRoZSBkaXZpZGVyLi4gKi9cbiAgcGFyZW50UmVjdDogUmVjdCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgY3VycmVudCBtb3VzZSBwb3NpdGlvbiBpbiBQYWdlIGNvb3JkaW5hdGVzLiAqL1xuICBjdXJyZW50TW92ZUxvY2F0aW9uOiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcblxuICAvKiogVGhlIGxhc3QgbW91c2UgcG9zaXRpb24gaW4gUGFnZSBjb29yZGluYXRlcyByZXBvcnRlZCB2aWEgQ3VzdG9tRXZlbnQuICovXG4gIGxhc3RNb3ZlU2VudDogUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG5cbiAgLyoqIFRoZSBwYXJlbnQgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSBkaXZpZGVyLiAqL1xuICBwYXJlbnQ6IEhUTUxFbGVtZW50O1xuXG4gIC8qKiBUaGUgZGl2aWRlciBlbGVtZW50IHRvIGJlIGRyYWdnZWQgYWNyb3NzIHRoZSBwYXJlbnQgZWxlbWVudC4gKi9cbiAgZGl2aWRlcjogSFRNTEVsZW1lbnQ7XG5cbiAgLyoqIFRoZSBoYW5kbGUgb2YgdGhlIHdpbmRvdy5zZXRJbnRlcnZhbCgpLiAqL1xuICBpbnRlcm52YWxIYW5kbGU6IG51bWJlciA9IDA7XG5cbiAgLyoqIFRoZSB0eXBlIG9mIGRpdmlkZXIsIGVpdGhlciB2ZXJ0aWNhbCAoXCJjb2x1bW5cIiksIG9yIGhvcml6b250YWwgKFwicm93XCIpLiAqL1xuICBkaXZpZGVyVHlwZTogRGl2aWRlclR5cGU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcGFyZW50OiBIVE1MRWxlbWVudCxcbiAgICBkaXZpZGVyOiBIVE1MRWxlbWVudCxcbiAgICBkaXZpZGVyVHlwZTogRGl2aWRlclR5cGUgPSBcImNvbHVtblwiXG4gICkge1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMuZGl2aWRlciA9IGRpdmlkZXI7XG4gICAgdGhpcy5kaXZpZGVyVHlwZSA9IGRpdmlkZXJUeXBlO1xuICAgIHRoaXMuZGl2aWRlci5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZGV0YWNoKCkge1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5kaXZpZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVybnZhbEhhbmRsZSk7XG4gIH1cblxuICBvblRpbWVvdXQoKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24uZXF1YWwodGhpcy5sYXN0TW92ZVNlbnQpKSB7XG4gICAgICBsZXQgZGlmZlBlcmNlbnQ6IG51bWJlciA9IDA7XG4gICAgICBpZiAodGhpcy5kaXZpZGVyVHlwZSA9PT0gXCJjb2x1bW5cIikge1xuICAgICAgICBkaWZmUGVyY2VudCA9XG4gICAgICAgICAgKDEwMCAqICh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCAtIHRoaXMucGFyZW50UmVjdCEubGVmdCkpIC9cbiAgICAgICAgICB0aGlzLnBhcmVudFJlY3QhLndpZHRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlmZlBlcmNlbnQgPVxuICAgICAgICAgICgxMDAgKiAodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnkgLSB0aGlzLnBhcmVudFJlY3QhLnRvcCkpIC9cbiAgICAgICAgICB0aGlzLnBhcmVudFJlY3QhLmhlaWdodDtcbiAgICAgIH1cbiAgICAgIC8vIFRPRE8gLSBTaG91bGQgY2xhbXAgYmUgc2V0dGFibGUgaW4gdGhlIGNvbnN0cnVjdG9yP1xuICAgICAgZGlmZlBlcmNlbnQgPSBjbGFtcChkaWZmUGVyY2VudCwgNSwgOTUpO1xuXG4gICAgICB0aGlzLnBhcmVudC5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQ8RGl2aWRlck1vdmVSZXN1bHQ+KERJVklERVJfTU9WRV9FVkVOVCwge1xuICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgYmVmb3JlOiBkaWZmUGVyY2VudCxcbiAgICAgICAgICAgIGFmdGVyOiAxMDAgLSBkaWZmUGVyY2VudCxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHRoaXMubGFzdE1vdmVTZW50LnNldCh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIG1vdXNlbW92ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnggPSBlLnBhZ2VYO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi55ID0gZS5wYWdlWTtcbiAgfVxuXG4gIG1vdXNlZG93bihlOiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5pbnRlcm52YWxIYW5kbGUgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5vblRpbWVvdXQuYmluZCh0aGlzKSwgMTYpO1xuICAgIHRoaXMucGFyZW50UmVjdCA9IGdldFBhZ2VSZWN0KHRoaXMucGFyZW50KTtcblxuICAgIHRoaXMucGFyZW50LmNsYXNzTGlzdC5hZGQoUkVTSVpJTkdfQ0xBU1MpO1xuXG4gICAgdGhpcy5wYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5iZWdpbiA9IG5ldyBQb2ludChlLnBhZ2VYLCBlLnBhZ2VZKTtcbiAgfVxuXG4gIG1vdXNldXAoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZmluaXNoZWQobmV3IFBvaW50KGUucGFnZVgsIGUucGFnZVkpKTtcbiAgfVxuXG4gIG1vdXNlbGVhdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZmluaXNoZWQobmV3IFBvaW50KGUucGFnZVgsIGUucGFnZVkpKTtcbiAgfVxuXG4gIGZpbmlzaGVkKGVuZDogUG9pbnQpIHtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVybnZhbEhhbmRsZSk7XG5cbiAgICB0aGlzLnBhcmVudC5jbGFzc0xpc3QucmVtb3ZlKFJFU0laSU5HX0NMQVNTKTtcblxuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IGVuZDtcbiAgICB0aGlzLm9uVGltZW91dCgpO1xuICAgIHRoaXMuYmVnaW4gPSBudWxsO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICB0aGlzLmxhc3RNb3ZlU2VudCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4uL3NjYWxlL3BvaW50LnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhZ1JhbmdlIHtcbiAgYmVnaW46IFBvaW50O1xuICBlbmQ6IFBvaW50O1xufVxuXG5leHBvcnQgY29uc3QgRFJBR19SQU5HRV9FVkVOVCA9IFwiZHJhZ3JhbmdlXCI7XG5cbi8qKiBNb3VzZU1vdmUgd2F0Y2hlcyBtb3VzZSBldmVudHMgZm9yIGEgZ2l2ZW4gSFRNTEVsZW1lbnQgYW5kIGVtaXRzXG4gKiBldmVudHMgYXJvdW5kIGRyYWdnaW5nLlxuICpcbiAqIFRoZSBlbWl0dGVkIGV2ZW50IGlzIFwiZHJhZ3JhbmdlXCIgYW5kIGlzIGEgQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPi5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyBwcmVzc2VkIGRvd24gaW4gdGhlIEhUTUxFbGVtZW50IGFuIGV2ZW50IHdpbGwgYmVcbiAqIGVtaXR0ZWQgcGVyaW9kaWNhbGx5IGFzIHRoZSBtb3VzZSBtb3Zlcy5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyByZWxlYXNlZCwgb3IgZXhpdHMgdGhlIEhUTUxFbGVtZW50IG9uZSBsYXN0IGV2ZW50XG4gKiBpcyBlbWl0dGVkLlxuICovXG5leHBvcnQgY2xhc3MgTW91c2VEcmFnIHtcbiAgYmVnaW46IFBvaW50IHwgbnVsbCA9IG51bGw7XG4gIGN1cnJlbnRNb3ZlTG9jYXRpb246IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuICBsYXN0TW92ZVNlbnQ6IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuICBlbGU6IEhUTUxFbGVtZW50O1xuICBpbnRlcm52YWxIYW5kbGU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoZWxlOiBIVE1MRWxlbWVudCkge1xuICAgIHRoaXMuZWxlID0gZWxlO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGRldGFjaCgpIHtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVybnZhbEhhbmRsZSk7XG4gIH1cblxuICBvblRpbWVvdXQoKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24uZXF1YWwodGhpcy5sYXN0TW92ZVNlbnQpKSB7XG4gICAgICB0aGlzLmVsZS5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPihEUkFHX1JBTkdFX0VWRU5ULCB7XG4gICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICBiZWdpbjogdGhpcy5iZWdpbiEuZHVwKCksXG4gICAgICAgICAgICBlbmQ6IHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi5kdXAoKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHRoaXMubGFzdE1vdmVTZW50LnNldCh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIG1vdXNlbW92ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnggPSBlLm9mZnNldFg7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnkgPSBlLm9mZnNldFk7XG4gIH1cblxuICBtb3VzZWRvd24oZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuaW50ZXJudmFsSGFuZGxlID0gd2luZG93LnNldEludGVydmFsKHRoaXMub25UaW1lb3V0LmJpbmQodGhpcyksIDE2KTtcbiAgICB0aGlzLmJlZ2luID0gbmV3IFBvaW50KGUub2Zmc2V0WCwgZS5vZmZzZXRZKTtcbiAgfVxuXG4gIG1vdXNldXAoZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuZmluaXNoZWQobmV3IFBvaW50KGUub2Zmc2V0WCwgZS5vZmZzZXRZKSk7XG4gIH1cblxuICBtb3VzZWxlYXZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZpbmlzaGVkKG5ldyBQb2ludChlLm9mZnNldFgsIGUub2Zmc2V0WSkpO1xuICB9XG5cbiAgZmluaXNoZWQoZW5kOiBQb2ludCkge1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBlbmQ7XG4gICAgdGhpcy5vblRpbWVvdXQoKTtcbiAgICB0aGlzLmJlZ2luID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgdGhpcy5sYXN0TW92ZVNlbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuLi9zY2FsZS9wb2ludC50c1wiO1xuXG4vKiogTW91c2VNb3ZlIHdhdGNoZXMgbW91c2UgZXZlbnRzIGZvciBhIGdpdmVuIEhUTUxFbGVtZW50IGFuZCByZWNvcmRzIHRoZSBtb3N0XG4gKiAgcmVjZW50IGxvY2F0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgTW91c2VNb3ZlIHtcbiAgY3VycmVudE1vdmVMb2NhdGlvbjogUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIGxhc3RSZWFkTG9jYXRpb246IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuICBlbGU6IEhUTUxFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKGVsZTogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZSA9IGVsZTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGRldGFjaCgpIHtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgbW91c2Vtb3ZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCA9IGUub2Zmc2V0WDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSA9IGUub2Zmc2V0WTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIGEgUG9pbnQgaWYgdGhlIG1vdXNlIGhhZCBtb3ZlZCBzaW5jZSB0aGUgbGFzdCByZWFkLCBvdGhlcndpc2VcbiAgICogcmV0dXJucyBudWxsLlxuICAgKi9cbiAgcmVhZExvY2F0aW9uKCk6IFBvaW50IHwgbnVsbCB7XG4gICAgaWYgKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi5lcXVhbCh0aGlzLmxhc3RSZWFkTG9jYXRpb24pKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5sYXN0UmVhZExvY2F0aW9uLnNldCh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24pO1xuICAgIHJldHVybiB0aGlzLmxhc3RSZWFkTG9jYXRpb24uZHVwKCk7XG4gIH1cbn1cbiIsICJleHBvcnQgY29uc3QgTUlOX0RJU1BMQVlfUkFOR0UgPSA3O1xuXG4vKiogUmVwcmVzZW50cyBhIHJhbmdlIG9mIGRheXMgb3ZlciB3aGljaCB0byBkaXNwbGF5IGEgem9vbWVkIGluIHZpZXcsIHVzaW5nXG4gKiB0aGUgaGFsZi1vcGVuIGludGVydmFsIFtiZWdpbiwgZW5kKS5cbiAqL1xuZXhwb3J0IGNsYXNzIERpc3BsYXlSYW5nZSB7XG4gIHByaXZhdGUgX2JlZ2luOiBudW1iZXI7XG4gIHByaXZhdGUgX2VuZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGJlZ2luOiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gICAgdGhpcy5fYmVnaW4gPSBiZWdpbjtcbiAgICB0aGlzLl9lbmQgPSBlbmQ7XG4gICAgaWYgKHRoaXMuX2JlZ2luID4gdGhpcy5fZW5kKSB7XG4gICAgICBbdGhpcy5fZW5kLCB0aGlzLl9iZWdpbl0gPSBbdGhpcy5fYmVnaW4sIHRoaXMuX2VuZF07XG4gICAgfVxuICAgIGlmICh0aGlzLl9lbmQgLSB0aGlzLl9iZWdpbiA8IE1JTl9ESVNQTEFZX1JBTkdFKSB7XG4gICAgICB0aGlzLl9lbmQgPSB0aGlzLl9iZWdpbiArIE1JTl9ESVNQTEFZX1JBTkdFO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBpbih4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4geCA+PSB0aGlzLl9iZWdpbiAmJiB4IDw9IHRoaXMuX2VuZDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYmVnaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fYmVnaW47XG4gIH1cblxuICBwdWJsaWMgZ2V0IGVuZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9lbmQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHJhbmdlSW5EYXlzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZCAtIHRoaXMuX2JlZ2luO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBFZGdlcyB9IGZyb20gXCIuLi8uLi9kYWcvZGFnXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgU3BhbiB9IGZyb20gXCIuLi8uLi9zbGFjay9zbGFja1wiO1xuaW1wb3J0IHsgQ2hhcnQsIFRhc2ssIFRhc2tzLCB2YWxpZGF0ZUNoYXJ0IH0gZnJvbSBcIi4uL2NoYXJ0XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhcnRMaWtlIHtcbiAgVmVydGljZXM6IFRhc2tzO1xuICBFZGdlczogRWRnZXM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmlsdGVyUmVzdWx0IHtcbiAgY2hhcnRMaWtlOiBDaGFydExpa2U7XG4gIGRpc3BsYXlPcmRlcjogbnVtYmVyW107XG4gIGVtcGhhc2l6ZWRUYXNrczogbnVtYmVyW107XG4gIHNwYW5zOiBTcGFuW107XG4gIGxhYmVsczogc3RyaW5nW107XG4gIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4OiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPjtcbiAgc2VsZWN0ZWRUYXNrSW5kZXg6IG51bWJlcjtcbn1cblxuLyoqIFVzZWQgZm9yIGZpbHRlcmluZyB0YXNrcywgcmV0dXJucyBUcnVlIGlmIHRoZSB0YXNrIGlzIHRvIGJlIGluY2x1ZGVkIGluIHRoZVxuICogZmlsdGVyZWQgcmVzdWx0cy4gKi9cbmV4cG9ydCB0eXBlIEZpbHRlckZ1bmMgPSAodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbjtcblxuLyoqIEZpbHRlcnMgdGhlIGNvbnRlbnRzIG9mIHRoZSBDaGFydCBiYXNlZCBvbiB0aGUgZmlsdGVyRnVuYy5cbiAqXG4gKiBzZWxlY3RlZFRhc2tJbmRleCB3aWxsIGJlIHJldHVybmVkIGFzIC0xIGlmIHRoZSBzZWxlY3RlZCB0YXNrIGdldHMgZmlsdGVyZWRcbiAqIG91dC5cbiAqL1xuZXhwb3J0IGNvbnN0IGZpbHRlciA9IChcbiAgY2hhcnQ6IENoYXJ0LFxuICBmaWx0ZXJGdW5jOiBGaWx0ZXJGdW5jIHwgbnVsbCxcbiAgZW1waGFzaXplZFRhc2tzOiBudW1iZXJbXSxcbiAgc3BhbnM6IFNwYW5bXSxcbiAgbGFiZWxzOiBzdHJpbmdbXSxcbiAgc2VsZWN0ZWRUYXNrSW5kZXg6IG51bWJlclxuKTogUmVzdWx0PEZpbHRlclJlc3VsdD4gPT4ge1xuICBjb25zdCB2cmV0ID0gdmFsaWRhdGVDaGFydChjaGFydCk7XG4gIGlmICghdnJldC5vaykge1xuICAgIHJldHVybiB2cmV0O1xuICB9XG4gIGNvbnN0IHRvcG9sb2dpY2FsT3JkZXIgPSB2cmV0LnZhbHVlO1xuICBpZiAoZmlsdGVyRnVuYyA9PT0gbnVsbCkge1xuICAgIGNvbnN0IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4OiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjaGFydC5WZXJ0aWNlcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LnNldChpbmRleCwgaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gb2soe1xuICAgICAgY2hhcnRMaWtlOiBjaGFydCxcbiAgICAgIGRpc3BsYXlPcmRlcjogdnJldC52YWx1ZSxcbiAgICAgIGVtcGhhc2l6ZWRUYXNrczogZW1waGFzaXplZFRhc2tzLFxuICAgICAgc3BhbnM6IHNwYW5zLFxuICAgICAgbGFiZWxzOiBsYWJlbHMsXG4gICAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXgsXG4gICAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleDogZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXgsXG4gICAgICBzZWxlY3RlZFRhc2tJbmRleCxcbiAgICB9KTtcbiAgfVxuICBjb25zdCB0YXNrczogVGFza3MgPSBbXTtcbiAgY29uc3QgZWRnZXM6IEVkZ2VzID0gW107XG4gIGNvbnN0IGRpc3BsYXlPcmRlcjogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgZmlsdGVyZWRTcGFuczogU3BhbltdID0gW107XG4gIGNvbnN0IGZpbHRlcmVkTGFiZWxzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcbiAgY29uc3QgZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4OiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuXG4gIC8vIEZpcnN0IGZpbHRlciB0aGUgdGFza3MuXG4gIGNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIG9yaWdpbmFsSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGlmIChmaWx0ZXJGdW5jKHRhc2ssIG9yaWdpbmFsSW5kZXgpKSB7XG4gICAgICB0YXNrcy5wdXNoKHRhc2spO1xuICAgICAgZmlsdGVyZWRTcGFucy5wdXNoKHNwYW5zW29yaWdpbmFsSW5kZXhdKTtcbiAgICAgIGZpbHRlcmVkTGFiZWxzLnB1c2gobGFiZWxzW29yaWdpbmFsSW5kZXhdKTtcbiAgICAgIGNvbnN0IG5ld0luZGV4ID0gdGFza3MubGVuZ3RoIC0gMTtcbiAgICAgIGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5zZXQob3JpZ2luYWxJbmRleCwgbmV3SW5kZXgpO1xuICAgICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXguc2V0KG5ld0luZGV4LCBvcmlnaW5hbEluZGV4KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIE5vdyBmaWx0ZXIgdGhlIGVkZ2VzIHdoaWxlIGFsc28gcmV3cml0aW5nIHRoZW0uXG4gIGNoYXJ0LkVkZ2VzLmZvckVhY2goKGRpcmVjdGVkRWRnZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgaWYgKFxuICAgICAgIWZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5oYXMoZGlyZWN0ZWRFZGdlLmkpIHx8XG4gICAgICAhZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmhhcyhkaXJlY3RlZEVkZ2UuailcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWRnZXMucHVzaChcbiAgICAgIG5ldyBEaXJlY3RlZEVkZ2UoXG4gICAgICAgIGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5nZXQoZGlyZWN0ZWRFZGdlLmkpLFxuICAgICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KGRpcmVjdGVkRWRnZS5qKVxuICAgICAgKVxuICAgICk7XG4gIH0pO1xuXG4gIC8vIE5vdyBmaWx0ZXIgYW5kIHJlaW5kZXggdGhlIHRvcG9sb2dpY2FsL2Rpc3BsYXkgb3JkZXIuXG4gIHRvcG9sb2dpY2FsT3JkZXIuZm9yRWFjaCgob3JpZ2luYWxUYXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2s6IFRhc2sgPSBjaGFydC5WZXJ0aWNlc1tvcmlnaW5hbFRhc2tJbmRleF07XG4gICAgaWYgKCFmaWx0ZXJGdW5jKHRhc2ssIG9yaWdpbmFsVGFza0luZGV4KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkaXNwbGF5T3JkZXIucHVzaChmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KG9yaWdpbmFsVGFza0luZGV4KSEpO1xuICB9KTtcblxuICAvLyBSZS1pbmRleCBoaWdobGlnaHRlZCB0YXNrcy5cbiAgY29uc3QgdXBkYXRlZEVtcGhhc2l6ZWRUYXNrcyA9IGVtcGhhc2l6ZWRUYXNrcy5tYXAoXG4gICAgKG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXIpOiBudW1iZXIgPT5cbiAgICAgIGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5nZXQob3JpZ2luYWxUYXNrSW5kZXgpIVxuICApO1xuXG4gIHJldHVybiBvayh7XG4gICAgY2hhcnRMaWtlOiB7XG4gICAgICBFZGdlczogZWRnZXMsXG4gICAgICBWZXJ0aWNlczogdGFza3MsXG4gICAgfSxcbiAgICBkaXNwbGF5T3JkZXI6IGRpc3BsYXlPcmRlcixcbiAgICBlbXBoYXNpemVkVGFza3M6IHVwZGF0ZWRFbXBoYXNpemVkVGFza3MsXG4gICAgc3BhbnM6IGZpbHRlcmVkU3BhbnMsXG4gICAgbGFiZWxzOiBmaWx0ZXJlZExhYmVscyxcbiAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXgsXG4gICAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXg6IGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleCxcbiAgICBzZWxlY3RlZFRhc2tJbmRleDogZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChzZWxlY3RlZFRhc2tJbmRleCkgfHwgLTEsXG4gIH0pO1xufTtcbiIsICIvKiogQG1vZHVsZSBrZFxuICogQSBrLWQgdHJlZSBpbXBsZW1lbnRhdGlvbiwgd2hpY2ggaXMgdXNlZCB0byBmaW5kIHRoZSBjbG9zZXN0IHBvaW50IGluXG4gKiBzb21ldGhpbmcgbGlrZSBhIDJEIHNjYXR0ZXIgcGxvdC4gU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0stZF90cmVlXG4gKiBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEZvcmtlZCBmcm9tIGh0dHBzOi8vc2tpYS5nb29nbGVzb3VyY2UuY29tL2J1aWxkYm90LysvcmVmcy9oZWFkcy9tYWluL3BlcmYvbW9kdWxlcy9wbG90LXNpbXBsZS1zay9rZC50cy5cbiAqXG4gKiBGb3JrZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vUGFuZGlub3NhdXJ1cy9rZC10cmVlLWphdmFzY3JpcHQgYW5kXG4gKiB0aGVuIG1hc3NpdmVseSB0cmltbWVkIGRvd24gdG8ganVzdCBmaW5kIHRoZSBzaW5nbGUgY2xvc2VzdCBwb2ludCwgYW5kIGFsc29cbiAqIHBvcnRlZCB0byBFUzYgc3ludGF4LCB0aGVuIHBvcnRlZCB0byBUeXBlU2NyaXB0LlxuICpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9QYW5kaW5vc2F1cnVzL2tkLXRyZWUtamF2YXNjcmlwdCBpcyBhIGZvcmsgb2ZcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS91YmlsYWJzL2tkLXRyZWUtamF2YXNjcmlwdFxuICpcbiAqIEBhdXRob3IgTWlyY2VhIFByaWNvcCA8cHJpY29wQHViaWxhYnMubmV0PiwgMjAxMlxuICogQGF1dGhvciBNYXJ0aW4gS2xlcHBlIDxrbGVwcGVAdWJpbGFicy5uZXQ+LCAyMDEyXG4gKiBAYXV0aG9yIFViaWxhYnMgaHR0cDovL3ViaWxhYnMubmV0LCAyMDEyXG4gKiBAbGljZW5zZSBNSVQgTGljZW5zZSA8aHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHA+XG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBLRFBvaW50IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG59XG5cbnR5cGUgRGltZW5zaW9ucyA9IGtleW9mIEtEUG9pbnQ7XG5cbmNvbnN0IGRlZmF1bHRNZXRyaWMgPSAoYTogS0RQb2ludCwgYjogS0RQb2ludCk6IG51bWJlciA9PlxuICAoYS54IC0gYi54KSAqIChhLnggLSBiLngpICsgKGEueSAtIGIueSkgKiAoYS55IC0gYi55KTtcblxuY29uc3QgZGVmYXVsdERpbWVuc2lvbnM6IERpbWVuc2lvbnNbXSA9IFtcInhcIiwgXCJ5XCJdO1xuXG4vKiogQGNsYXNzIEEgc2luZ2xlIG5vZGUgaW4gdGhlIGstZCBUcmVlLiAqL1xuY2xhc3MgTm9kZTxJdGVtIGV4dGVuZHMgS0RQb2ludD4ge1xuICBvYmo6IEl0ZW07XG5cbiAgbGVmdDogTm9kZTxJdGVtPiB8IG51bGwgPSBudWxsO1xuXG4gIHJpZ2h0OiBOb2RlPEl0ZW0+IHwgbnVsbCA9IG51bGw7XG5cbiAgcGFyZW50OiBOb2RlPEl0ZW0+IHwgbnVsbDtcblxuICBkaW1lbnNpb246IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihvYmo6IEl0ZW0sIGRpbWVuc2lvbjogbnVtYmVyLCBwYXJlbnQ6IE5vZGU8SXRlbT4gfCBudWxsKSB7XG4gICAgdGhpcy5vYmogPSBvYmo7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5kaW1lbnNpb24gPSBkaW1lbnNpb247XG4gIH1cbn1cblxuLyoqXG4gKiBAY2xhc3MgVGhlIGstZCB0cmVlLlxuICovXG5leHBvcnQgY2xhc3MgS0RUcmVlPFBvaW50IGV4dGVuZHMgS0RQb2ludD4ge1xuICBwcml2YXRlIGRpbWVuc2lvbnM6IERpbWVuc2lvbnNbXTtcblxuICBwcml2YXRlIHJvb3Q6IE5vZGU8UG9pbnQ+IHwgbnVsbDtcblxuICBwcml2YXRlIG1ldHJpYzogKGE6IEtEUG9pbnQsIGI6IEtEUG9pbnQpID0+IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSBwb2ludHMgLSBBbiBhcnJheSBvZiBwb2ludHMsIHNvbWV0aGluZyB3aXRoIHRoZSBzaGFwZVxuICAgKiAgICAge3g6eCwgeTp5fS5cbiAgICogQHBhcmFtIHtBcnJheX0gZGltZW5zaW9ucyAtIFRoZSBkaW1lbnNpb25zIHRvIHVzZSBpbiBvdXIgcG9pbnRzLCBmb3JcbiAgICogICAgIGV4YW1wbGUgWyd4JywgJ3knXS5cbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gbWV0cmljIC0gQSBmdW5jdGlvbiB0aGF0IGNhbGN1bGF0ZXMgdGhlIGRpc3RhbmNlXG4gICAqICAgICBiZXR3ZWVuIHR3byBwb2ludHMuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwb2ludHM6IFBvaW50W10pIHtcbiAgICB0aGlzLmRpbWVuc2lvbnMgPSBkZWZhdWx0RGltZW5zaW9ucztcbiAgICB0aGlzLm1ldHJpYyA9IGRlZmF1bHRNZXRyaWM7XG4gICAgdGhpcy5yb290ID0gdGhpcy5fYnVpbGRUcmVlKHBvaW50cywgMCwgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUgbmVhcmVzdCBOb2RlIHRvIHRoZSBnaXZlbiBwb2ludC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHBvaW50IC0ge3g6eCwgeTp5fVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgY2xvc2VzdCBwb2ludCBvYmplY3QgcGFzc2VkIGludG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgKiAgICAgV2UgcGFzcyBiYWNrIHRoZSBvcmlnaW5hbCBvYmplY3Qgc2luY2UgaXQgbWlnaHQgaGF2ZSBleHRyYSBpbmZvXG4gICAqICAgICBiZXlvbmQganVzdCB0aGUgY29vcmRpbmF0ZXMsIHN1Y2ggYXMgdHJhY2UgaWQuXG4gICAqL1xuICBuZWFyZXN0KHBvaW50OiBLRFBvaW50KTogUG9pbnQge1xuICAgIGxldCBiZXN0Tm9kZSA9IHtcbiAgICAgIG5vZGU6IHRoaXMucm9vdCxcbiAgICAgIGRpc3RhbmNlOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgIH07XG5cbiAgICBjb25zdCBzYXZlTm9kZSA9IChub2RlOiBOb2RlPFBvaW50PiwgZGlzdGFuY2U6IG51bWJlcikgPT4ge1xuICAgICAgYmVzdE5vZGUgPSB7XG4gICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgIGRpc3RhbmNlOiBkaXN0YW5jZSxcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGNvbnN0IG5lYXJlc3RTZWFyY2ggPSAobm9kZTogTm9kZTxQb2ludD4pID0+IHtcbiAgICAgIGNvbnN0IGRpbWVuc2lvbiA9IHRoaXMuZGltZW5zaW9uc1tub2RlLmRpbWVuc2lvbl07XG4gICAgICBjb25zdCBvd25EaXN0YW5jZSA9IHRoaXMubWV0cmljKHBvaW50LCBub2RlLm9iaik7XG5cbiAgICAgIGlmIChub2RlLnJpZ2h0ID09PSBudWxsICYmIG5vZGUubGVmdCA9PT0gbnVsbCkge1xuICAgICAgICBpZiAob3duRGlzdGFuY2UgPCBiZXN0Tm9kZS5kaXN0YW5jZSkge1xuICAgICAgICAgIHNhdmVOb2RlKG5vZGUsIG93bkRpc3RhbmNlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBiZXN0Q2hpbGQgPSBudWxsO1xuICAgICAgbGV0IG90aGVyQ2hpbGQgPSBudWxsO1xuICAgICAgLy8gSWYgd2UgZ2V0IGhlcmUgd2Uga25vdyB0aGF0IGF0IGxlYXN0IG9uZSBvZiAubGVmdCBhbmQgLnJpZ2h0IGlzXG4gICAgICAvLyBub24tbnVsbCwgc28gYmVzdENoaWxkIGlzIGd1YXJhbnRlZWQgdG8gYmUgbm9uLW51bGwuXG4gICAgICBpZiAobm9kZS5yaWdodCA9PT0gbnVsbCkge1xuICAgICAgICBiZXN0Q2hpbGQgPSBub2RlLmxlZnQ7XG4gICAgICB9IGVsc2UgaWYgKG5vZGUubGVmdCA9PT0gbnVsbCkge1xuICAgICAgICBiZXN0Q2hpbGQgPSBub2RlLnJpZ2h0O1xuICAgICAgfSBlbHNlIGlmIChwb2ludFtkaW1lbnNpb25dIDwgbm9kZS5vYmpbZGltZW5zaW9uXSkge1xuICAgICAgICBiZXN0Q2hpbGQgPSBub2RlLmxlZnQ7XG4gICAgICAgIG90aGVyQ2hpbGQgPSBub2RlLnJpZ2h0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYmVzdENoaWxkID0gbm9kZS5yaWdodDtcbiAgICAgICAgb3RoZXJDaGlsZCA9IG5vZGUubGVmdDtcbiAgICAgIH1cblxuICAgICAgbmVhcmVzdFNlYXJjaChiZXN0Q2hpbGQhKTtcblxuICAgICAgaWYgKG93bkRpc3RhbmNlIDwgYmVzdE5vZGUuZGlzdGFuY2UpIHtcbiAgICAgICAgc2F2ZU5vZGUobm9kZSwgb3duRGlzdGFuY2UpO1xuICAgICAgfVxuXG4gICAgICAvLyBGaW5kIGRpc3RhbmNlIHRvIGh5cGVycGxhbmUuXG4gICAgICBjb25zdCBwb2ludE9uSHlwZXJwbGFuZSA9IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMCxcbiAgICAgIH07XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGltZW5zaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaSA9PT0gbm9kZS5kaW1lbnNpb24pIHtcbiAgICAgICAgICBwb2ludE9uSHlwZXJwbGFuZVt0aGlzLmRpbWVuc2lvbnNbaV1dID0gcG9pbnRbdGhpcy5kaW1lbnNpb25zW2ldXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwb2ludE9uSHlwZXJwbGFuZVt0aGlzLmRpbWVuc2lvbnNbaV1dID0gbm9kZS5vYmpbdGhpcy5kaW1lbnNpb25zW2ldXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgaHlwZXJwbGFuZSBpcyBjbG9zZXIgdGhhbiB0aGUgY3VycmVudCBiZXN0IHBvaW50IHRoZW4gd2VcbiAgICAgIC8vIG5lZWQgdG8gc2VhcmNoIGRvd24gdGhlIG90aGVyIHNpZGUgb2YgdGhlIHRyZWUuXG4gICAgICBpZiAoXG4gICAgICAgIG90aGVyQ2hpbGQgIT09IG51bGwgJiZcbiAgICAgICAgdGhpcy5tZXRyaWMocG9pbnRPbkh5cGVycGxhbmUsIG5vZGUub2JqKSA8IGJlc3ROb2RlLmRpc3RhbmNlXG4gICAgICApIHtcbiAgICAgICAgbmVhcmVzdFNlYXJjaChvdGhlckNoaWxkKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHRoaXMucm9vdCkge1xuICAgICAgbmVhcmVzdFNlYXJjaCh0aGlzLnJvb3QpO1xuICAgIH1cblxuICAgIHJldHVybiBiZXN0Tm9kZS5ub2RlIS5vYmo7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIHRoZSBmcm9tIHBhcmVudCBOb2RlIG9uIGRvd24uXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IHBvaW50cyAtIEFuIGFycmF5IG9mIHt4OngsIHk6eX0uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkZXB0aCAtIFRoZSBjdXJyZW50IGRlcHRoIGZyb20gdGhlIHJvb3Qgbm9kZS5cbiAgICogQHBhcmFtIHtOb2RlfSBwYXJlbnQgLSBUaGUgcGFyZW50IE5vZGUuXG4gICAqL1xuICBwcml2YXRlIF9idWlsZFRyZWUoXG4gICAgcG9pbnRzOiBQb2ludFtdLFxuICAgIGRlcHRoOiBudW1iZXIsXG4gICAgcGFyZW50OiBOb2RlPFBvaW50PiB8IG51bGxcbiAgKTogTm9kZTxQb2ludD4gfCBudWxsIHtcbiAgICAvLyBFdmVyeSBzdGVwIGRlZXBlciBpbnRvIHRoZSB0cmVlIHdlIHN3aXRjaCB0byB1c2luZyBhbm90aGVyIGF4aXMuXG4gICAgY29uc3QgZGltID0gZGVwdGggJSB0aGlzLmRpbWVuc2lvbnMubGVuZ3RoO1xuXG4gICAgaWYgKHBvaW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocG9pbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIG5ldyBOb2RlKHBvaW50c1swXSwgZGltLCBwYXJlbnQpO1xuICAgIH1cblxuICAgIHBvaW50cy5zb3J0KChhLCBiKSA9PiBhW3RoaXMuZGltZW5zaW9uc1tkaW1dXSAtIGJbdGhpcy5kaW1lbnNpb25zW2RpbV1dKTtcblxuICAgIGNvbnN0IG1lZGlhbiA9IE1hdGguZmxvb3IocG9pbnRzLmxlbmd0aCAvIDIpO1xuICAgIGNvbnN0IG5vZGUgPSBuZXcgTm9kZShwb2ludHNbbWVkaWFuXSwgZGltLCBwYXJlbnQpO1xuICAgIG5vZGUubGVmdCA9IHRoaXMuX2J1aWxkVHJlZShwb2ludHMuc2xpY2UoMCwgbWVkaWFuKSwgZGVwdGggKyAxLCBub2RlKTtcbiAgICBub2RlLnJpZ2h0ID0gdGhpcy5fYnVpbGRUcmVlKHBvaW50cy5zbGljZShtZWRpYW4gKyAxKSwgZGVwdGggKyAxLCBub2RlKTtcblxuICAgIHJldHVybiBub2RlO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgY2xhbXAgfSBmcm9tIFwiLi4vLi4vbWV0cmljcy9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUmVuZGVyT3B0aW9ucyB9IGZyb20gXCIuLi9yZW5kZXJlci50c1wiO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi9wb2ludC50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIERheVJvdyB7XG4gIGRheTogbnVtYmVyO1xuICByb3c6IG51bWJlcjtcbn1cblxuLyoqIEZlYXR1cmVzIG9mIHRoZSBjaGFydCB3ZSBjYW4gYXNrIGZvciBjb29yZGluYXRlcyBvZiwgd2hlcmUgdGhlIHZhbHVlIHJldHVybmVkIGlzXG4gKiB0aGUgdG9wIGxlZnQgY29vcmRpbmF0ZSBvZiB0aGUgZmVhdHVyZS5cbiAqL1xuZXhwb3J0IGVudW0gRmVhdHVyZSB7XG4gIHRhc2tMaW5lU3RhcnQsXG4gIHRleHRTdGFydCxcbiAgZ3JvdXBUZXh0U3RhcnQsXG4gIHBlcmNlbnRTdGFydCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb3AsXG4gIHZlcnRpY2FsQXJyb3dEZXN0Qm90dG9tLFxuICBob3Jpem9udGFsQXJyb3dEZXN0LFxuICB2ZXJ0aWNhbEFycm93U3RhcnQsXG4gIGhvcml6b250YWxBcnJvd1N0YXJ0LFxuICB2ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lVG9wLFxuICB2ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lQm90dG9tLFxuICBob3Jpem9udGFsQXJyb3dEZXN0VG9NaWxlc3RvbmUsXG4gIHZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVUb3AsXG4gIHZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVCb3R0b20sXG4gIGhvcml6b250YWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZSxcbiAgZ3JvdXBFbnZlbG9wZVN0YXJ0LFxuICB0YXNrRW52ZWxvcGVUb3AsXG5cbiAgZGlzcGxheVJhbmdlVG9wLFxuICB0YXNrUm93Qm90dG9tLFxuXG4gIHRpbWVNYXJrU3RhcnQsXG4gIHRpbWVNYXJrRW5kLFxuICB0aW1lVGV4dFN0YXJ0LFxuXG4gIGdyb3VwVGl0bGVUZXh0U3RhcnQsXG5cbiAgdGFza3NDbGlwUmVjdE9yaWdpbixcbiAgZ3JvdXBCeU9yaWdpbixcbn1cblxuLyoqIFNpemVzIG9mIGZlYXR1cmVzIG9mIGEgcmVuZGVyZWQgY2hhcnQuICovXG5leHBvcnQgZW51bSBNZXRyaWMge1xuICB0YXNrTGluZUhlaWdodCxcbiAgcGVyY2VudEhlaWdodCxcbiAgYXJyb3dIZWFkSGVpZ2h0LFxuICBhcnJvd0hlYWRXaWR0aCxcbiAgbWlsZXN0b25lRGlhbWV0ZXIsXG4gIGxpbmVEYXNoTGluZSxcbiAgbGluZURhc2hHYXAsXG4gIHRleHRYT2Zmc2V0LFxuICByb3dIZWlnaHQsXG59XG5cbi8qKiBNYWtlcyBhIG51bWJlciBvZGQsIGFkZHMgb25lIGlmIGV2ZW4uICovXG5jb25zdCBtYWtlT2RkID0gKG46IG51bWJlcik6IG51bWJlciA9PiB7XG4gIGlmIChuICUgMiA9PT0gMCkge1xuICAgIHJldHVybiBuICsgMTtcbiAgfVxuICByZXR1cm4gbjtcbn07XG5cbi8qKiBTY2FsZSBjb25zb2xpZGF0ZXMgYWxsIGNhbGN1bGF0aW9ucyBhcm91bmQgcmVuZGVyaW5nIGEgY2hhcnQgb250byBhIHN1cmZhY2UuICovXG5leHBvcnQgY2xhc3MgU2NhbGUge1xuICBwcml2YXRlIGRheVdpZHRoUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSByb3dIZWlnaHRQeDogbnVtYmVyO1xuICBwcml2YXRlIGJsb2NrU2l6ZVB4OiBudW1iZXI7XG4gIHByaXZhdGUgdGFza0hlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgbGluZVdpZHRoUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBtYXJnaW5TaXplUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSB0aW1lbGluZUhlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgb3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSB0b3RhbE51bWJlck9mRGF5czogbnVtYmVyO1xuICBwcml2YXRlIGdyb3VwQnlDb2x1bW5XaWR0aFB4OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSB0aW1lbGluZU9yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgdGFza3NPcmlnaW46IFBvaW50O1xuICBwcml2YXRlIGdyb3VwQnlPcmlnaW46IFBvaW50O1xuICBwcml2YXRlIHRhc2tzQ2xpcFJlY3RPcmlnaW46IFBvaW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gICAgY2FudmFzV2lkdGhQeDogbnVtYmVyLFxuICAgIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXIsXG4gICAgbWF4R3JvdXBOYW1lTGVuZ3RoOiBudW1iZXIgPSAwXG4gICkge1xuICAgIHRoaXMudG90YWxOdW1iZXJPZkRheXMgPSB0b3RhbE51bWJlck9mRGF5cztcbiAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4ID0gbWF4R3JvdXBOYW1lTGVuZ3RoICogb3B0cy5mb250U2l6ZVB4O1xuXG4gICAgdGhpcy5ibG9ja1NpemVQeCA9IE1hdGguZmxvb3Iob3B0cy5mb250U2l6ZVB4IC8gMyk7XG4gICAgdGhpcy50YXNrSGVpZ2h0UHggPSBtYWtlT2RkKE1hdGguZmxvb3IoKHRoaXMuYmxvY2tTaXplUHggKiAzKSAvIDQpKTtcbiAgICB0aGlzLmxpbmVXaWR0aFB4ID0gbWFrZU9kZChNYXRoLmZsb29yKHRoaXMudGFza0hlaWdodFB4IC8gMykpO1xuICAgIGNvbnN0IG1pbGVzdG9uZVJhZGl1cyA9IE1hdGguY2VpbCh0aGlzLnRhc2tIZWlnaHRQeCAvIDIpICsgdGhpcy5saW5lV2lkdGhQeDtcbiAgICB0aGlzLm1hcmdpblNpemVQeCA9IG1pbGVzdG9uZVJhZGl1cztcbiAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHggPSBvcHRzLmhhc1RpbWVsaW5lXG4gICAgICA/IE1hdGguY2VpbCgob3B0cy5mb250U2l6ZVB4ICogNCkgLyAzKVxuICAgICAgOiAwO1xuXG4gICAgdGhpcy50aW1lbGluZU9yaWdpbiA9IG5ldyBQb2ludChtaWxlc3RvbmVSYWRpdXMsIDApO1xuICAgIHRoaXMuZ3JvdXBCeU9yaWdpbiA9IG5ldyBQb2ludCgwLCBtaWxlc3RvbmVSYWRpdXMgKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHgpO1xuXG4gICAgbGV0IGJlZ2luT2Zmc2V0ID0gMDtcbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UgPT09IG51bGwgfHwgb3B0cy5kaXNwbGF5UmFuZ2VVc2FnZSA9PT0gXCJoaWdobGlnaHRcIikge1xuICAgICAgLy8gRG8gbm90IGZvcmNlIGRheVdpZHRoUHggdG8gYW4gaW50ZWdlciwgaXQgY291bGQgZ28gdG8gMCBhbmQgY2F1c2UgYWxsXG4gICAgICAvLyB0YXNrcyB0byBiZSByZW5kZXJlZCBhdCAwIHdpZHRoLlxuICAgICAgdGhpcy5kYXlXaWR0aFB4ID1cbiAgICAgICAgKGNhbnZhc1dpZHRoUHggLSB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gMiAqIHRoaXMubWFyZ2luU2l6ZVB4KSAvXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzO1xuICAgICAgdGhpcy5vcmlnaW4gPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNob3VsZCB3ZSBzZXQgeC1tYXJnaW5zIHRvIDAgaWYgYSBTdWJSYW5nZSBpcyByZXF1ZXN0ZWQ/XG4gICAgICAvLyBPciBzaG91bGQgd2UgdG90YWxseSBkcm9wIGFsbCBtYXJnaW5zIGZyb20gaGVyZSBhbmQganVzdCB1c2VcbiAgICAgIC8vIENTUyBtYXJnaW5zIG9uIHRoZSBjYW52YXMgZWxlbWVudD9cbiAgICAgIHRoaXMuZGF5V2lkdGhQeCA9XG4gICAgICAgIChjYW52YXNXaWR0aFB4IC0gdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIDIgKiB0aGlzLm1hcmdpblNpemVQeCkgL1xuICAgICAgICBvcHRzLmRpc3BsYXlSYW5nZS5yYW5nZUluRGF5cztcbiAgICAgIGJlZ2luT2Zmc2V0ID0gTWF0aC5mbG9vcihcbiAgICAgICAgdGhpcy5kYXlXaWR0aFB4ICogb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gKyB0aGlzLm1hcmdpblNpemVQeFxuICAgICAgKTtcbiAgICAgIHRoaXMub3JpZ2luID0gbmV3IFBvaW50KC1iZWdpbk9mZnNldCArIHRoaXMubWFyZ2luU2l6ZVB4LCAwKTtcbiAgICB9XG5cbiAgICB0aGlzLnRhc2tzT3JpZ2luID0gbmV3IFBvaW50KFxuICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIGJlZ2luT2Zmc2V0ICsgbWlsZXN0b25lUmFkaXVzLFxuICAgICAgdGhpcy50aW1lbGluZUhlaWdodFB4ICsgbWlsZXN0b25lUmFkaXVzXG4gICAgKTtcblxuICAgIHRoaXMudGFza3NDbGlwUmVjdE9yaWdpbiA9IG5ldyBQb2ludChcbiAgICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHgsXG4gICAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHhcbiAgICApO1xuXG4gICAgaWYgKG9wdHMuaGFzVGV4dCkge1xuICAgICAgdGhpcy5yb3dIZWlnaHRQeCA9IDYgKiB0aGlzLmJsb2NrU2l6ZVB4OyAvLyBUaGlzIG1pZ2h0IGFsc28gYmUgYChjYW52YXNIZWlnaHRQeCAtIDIgKiBvcHRzLm1hcmdpblNpemVQeCkgLyBudW1iZXJTd2ltTGFuZXNgIGlmIGhlaWdodCBpcyBzdXBwbGllZD9cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yb3dIZWlnaHRQeCA9IDEuMSAqIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIGNoYXJ0LiBOb3RlIHRoYXQgaXQncyBub3QgY29uc3RyYWluZWQgYnkgdGhlIGNhbnZhcy4gKi9cbiAgcHVibGljIGhlaWdodChtYXhSb3dzOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiAoXG4gICAgICBtYXhSb3dzICogdGhpcy5yb3dIZWlnaHRQeCArIHRoaXMudGltZWxpbmVIZWlnaHRQeCArIDIgKiB0aGlzLm1hcmdpblNpemVQeFxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgZGF5Um93RnJvbVBvaW50KHBvaW50OiBQb2ludCk6IERheVJvdyB7XG4gICAgLy8gVGhpcyBzaG91bGQgYWxzbyBjbGFtcCB0aGUgcmV0dXJuZWQgJ3gnIHZhbHVlIHRvIFswLCBtYXhSb3dzKS5cbiAgICByZXR1cm4ge1xuICAgICAgZGF5OiBjbGFtcChcbiAgICAgICAgTWF0aC5mbG9vcihcbiAgICAgICAgICAod2luZG93LmRldmljZVBpeGVsUmF0aW8gKiBwb2ludC54IC1cbiAgICAgICAgICAgIHRoaXMub3JpZ2luLnggLVxuICAgICAgICAgICAgdGhpcy5tYXJnaW5TaXplUHggLVxuICAgICAgICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCkgL1xuICAgICAgICAgICAgdGhpcy5kYXlXaWR0aFB4XG4gICAgICAgICksXG4gICAgICAgIDAsXG4gICAgICAgIHRoaXMudG90YWxOdW1iZXJPZkRheXNcbiAgICAgICksXG4gICAgICByb3c6IE1hdGguZmxvb3IoXG4gICAgICAgICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAqIHBvaW50LnkgLVxuICAgICAgICAgIHRoaXMub3JpZ2luLnkgLVxuICAgICAgICAgIHRoaXMubWFyZ2luU2l6ZVB4IC1cbiAgICAgICAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHgpIC9cbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4XG4gICAgICApLFxuICAgIH07XG4gIH1cblxuICAvKiogVGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94IGZvciBhIHNpbmdsZSB0YXNrLiAqL1xuICBwcml2YXRlIHRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdzogbnVtYmVyLCBkYXk6IG51bWJlcik6IFBvaW50IHtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uc3VtKFxuICAgICAgbmV3IFBvaW50KFxuICAgICAgICBNYXRoLmZsb29yKFxuICAgICAgICAgIGRheSAqIHRoaXMuZGF5V2lkdGhQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeFxuICAgICAgICApLFxuICAgICAgICBNYXRoLmZsb29yKFxuICAgICAgICAgIHJvdyAqIHRoaXMucm93SGVpZ2h0UHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgcHJpdmF0ZSBncm91cFJvd0VudmVsb3BlU3RhcnQocm93OiBudW1iZXIsIGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLmdyb3VwQnlPcmlnaW4uc3VtKFxuICAgICAgbmV3IFBvaW50KFxuICAgICAgICAwLFxuICAgICAgICByb3cgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHhcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBncm91cEhlYWRlclN0YXJ0KCk6IFBvaW50IHtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uc3VtKG5ldyBQb2ludCh0aGlzLm1hcmdpblNpemVQeCwgdGhpcy5tYXJnaW5TaXplUHgpKTtcbiAgfVxuXG4gIHByaXZhdGUgdGltZUVudmVsb3BlU3RhcnQoZGF5OiBudW1iZXIpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLnN1bShcbiAgICAgIG5ldyBQb2ludChcbiAgICAgICAgZGF5ICogdGhpcy5kYXlXaWR0aFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4LFxuICAgICAgICAwXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBjb29yZGluYXRlIG9mIHRoZSBpdGVtICovXG4gIGZlYXR1cmUocm93OiBudW1iZXIsIGRheTogbnVtYmVyLCBjb29yZDogRmVhdHVyZSk6IFBvaW50IHtcbiAgICBzd2l0Y2ggKGNvb3JkKSB7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza0xpbmVTdGFydDpcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcDpcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4IC0gdGhpcy5ibG9ja1NpemVQeFxuICAgICAgICApO1xuXG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoMCwgdGhpcy5yb3dIZWlnaHRQeCk7XG4gICAgICBjYXNlIEZlYXR1cmUudGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHgsXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeFxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cFJvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4LFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHhcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5wZXJjZW50U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4IC0gdGhpcy5saW5lV2lkdGhQeFxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3Q6XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICBNYXRoLmZsb29yKHRoaXMucm93SGVpZ2h0UHggLSAwLjUgKiB0aGlzLmJsb2NrU2l6ZVB4KSAtIDFcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wKS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lQm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wKS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3QpLmFkZChcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlciksXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuXG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZUJvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmU6XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQpLmFkZChcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICAgIDBcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cEVudmVsb3BlU3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwUm93RW52ZWxvcGVTdGFydChyb3csIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZU1hcmtTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50aW1lTWFya0VuZDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KS5hZGQoMCwgdGhpcy5yb3dIZWlnaHRQeCAqIChyb3cgKyAxKSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZVRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KS5hZGQodGhpcy5ibG9ja1NpemVQeCwgMCk7XG5cbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cFRpdGxlVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cEhlYWRlclN0YXJ0KCkuYWRkKHRoaXMuYmxvY2tTaXplUHgsIDApO1xuICAgICAgY2FzZSBGZWF0dXJlLmRpc3BsYXlSYW5nZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrUm93Qm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3cgKyAxLCBkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tzQ2xpcFJlY3RPcmlnaW46XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tzQ2xpcFJlY3RPcmlnaW47XG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBCeU9yaWdpbjpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBCeU9yaWdpbjtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFRoZSBsaW5lIGJlbG93IHdpbGwgbm90IGNvbXBpbGUgaWYgeW91IG1pc3NlZCBhbiBlbnVtIGluIHRoZSBzd2l0Y2ggYWJvdmUuXG4gICAgICAgIGNvb3JkIHNhdGlzZmllcyBuZXZlcjtcbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludCgwLCAwKTtcbiAgICB9XG4gIH1cblxuICBtZXRyaWMoZmVhdHVyZTogTWV0cmljKTogbnVtYmVyIHtcbiAgICBzd2l0Y2ggKGZlYXR1cmUpIHtcbiAgICAgIGNhc2UgTWV0cmljLnRhc2tMaW5lSGVpZ2h0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrSGVpZ2h0UHg7XG4gICAgICBjYXNlIE1ldHJpYy5wZXJjZW50SGVpZ2h0OlxuICAgICAgICByZXR1cm4gdGhpcy5saW5lV2lkdGhQeDtcbiAgICAgIGNhc2UgTWV0cmljLmFycm93SGVhZEhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza0hlaWdodFB4O1xuICAgICAgY2FzZSBNZXRyaWMuYXJyb3dIZWFkV2lkdGg6XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy50YXNrSGVpZ2h0UHgpO1xuICAgICAgY2FzZSBNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXI6XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy50YXNrSGVpZ2h0UHgpO1xuICAgICAgY2FzZSBNZXRyaWMubGluZURhc2hMaW5lOlxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja1NpemVQeDtcbiAgICAgIGNhc2UgTWV0cmljLmxpbmVEYXNoR2FwOlxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja1NpemVQeDtcbiAgICAgIGNhc2UgTWV0cmljLnRleHRYT2Zmc2V0OlxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja1NpemVQeDtcbiAgICAgIGNhc2UgTWV0cmljLnJvd0hlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMucm93SGVpZ2h0UHg7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBUaGUgbGluZSBiZWxvdyB3aWxsIG5vdCBjb21waWxlIGlmIHlvdSBtaXNzZWQgYW4gZW51bSBpbiB0aGUgc3dpdGNoIGFib3ZlLlxuICAgICAgICBmZWF0dXJlIHNhdGlzZmllcyBuZXZlcjtcbiAgICAgICAgcmV0dXJuIDAuMDtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBUYXNrLCB2YWxpZGF0ZUNoYXJ0IH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBDaGFydExpa2UsIGZpbHRlciwgRmlsdGVyRnVuYyB9IGZyb20gXCIuLi9jaGFydC9maWx0ZXIvZmlsdGVyLnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIFZlcnRleEluZGljZXMgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IFJlc291cmNlRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgU3BhbiB9IGZyb20gXCIuLi9zbGFjay9zbGFjay50c1wiO1xuaW1wb3J0IHsgS0RUcmVlIH0gZnJvbSBcIi4va2Qva2QudHNcIjtcbmltcG9ydCB7IERpc3BsYXlSYW5nZSB9IGZyb20gXCIuL3JhbmdlL3JhbmdlLnRzXCI7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuL3NjYWxlL3BvaW50LnRzXCI7XG5pbXBvcnQgeyBGZWF0dXJlLCBNZXRyaWMsIFNjYWxlIH0gZnJvbSBcIi4vc2NhbGUvc2NhbGUudHNcIjtcblxudHlwZSBEaXJlY3Rpb24gPSBcInVwXCIgfCBcImRvd25cIjtcblxuZXhwb3J0IGludGVyZmFjZSBDb2xvcnMge1xuICBzdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2VNdXRlZDogc3RyaW5nO1xuICBvblN1cmZhY2VIaWdobGlnaHQ6IHN0cmluZztcbiAgb3ZlcmxheTogc3RyaW5nO1xuICBncm91cENvbG9yOiBzdHJpbmc7XG4gIGhpZ2hsaWdodDogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBUYXNrSW5kZXhUb1JvdyA9IE1hcDxudW1iZXIsIG51bWJlcj47XG5cbi8qKiBGdW5jdGlvbiB1c2UgdG8gcHJvZHVjZSBhIHRleHQgbGFiZWwgZm9yIGEgdGFzayBhbmQgaXRzIHNsYWNrLiAqL1xuZXhwb3J0IHR5cGUgVGFza0xhYmVsID0gKHRhc2tJbmRleDogbnVtYmVyKSA9PiBzdHJpbmc7XG5cbi8qKiBDb250cm9scyBvZiB0aGUgZGlzcGxheVJhbmdlIGluIFJlbmRlck9wdGlvbnMgaXMgdXNlZC5cbiAqXG4gKiAgXCJyZXN0cmljdFwiOiBPbmx5IGRpc3BsYXkgdGhlIHBhcnRzIG9mIHRoZSBjaGFydCB0aGF0IGFwcGVhciBpbiB0aGUgcmFuZ2UuXG4gKlxuICogIFwiaGlnaGxpZ2h0XCI6IERpc3BsYXkgdGhlIGZ1bGwgcmFuZ2Ugb2YgdGhlIGRhdGEsIGJ1dCBoaWdobGlnaHQgdGhlIHJhbmdlLlxuICovXG5leHBvcnQgdHlwZSBEaXNwbGF5UmFuZ2VVc2FnZSA9IFwicmVzdHJpY3RcIiB8IFwiaGlnaGxpZ2h0XCI7XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0VGFza0xhYmVsOiBUYXNrTGFiZWwgPSAodGFza0luZGV4OiBudW1iZXIpOiBzdHJpbmcgPT5cbiAgdGFza0luZGV4LnRvRml4ZWQoMCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyT3B0aW9ucyB7XG4gIC8qKiBUaGUgdGV4dCBmb250IHNpemUsIHRoaXMgZHJpdmVzIHRoZSBzaXplIG9mIGFsbCBvdGhlciBjaGFydCBmZWF0dXJlcy5cbiAgICogKi9cbiAgZm9udFNpemVQeDogbnVtYmVyO1xuXG4gIC8qKiBEaXNwbGF5IHRleHQgaWYgdHJ1ZS4gKi9cbiAgaGFzVGV4dDogYm9vbGVhbjtcblxuICAvKiogSWYgc3VwcGxpZWQgdGhlbiBvbmx5IHRoZSB0YXNrcyBpbiB0aGUgZ2l2ZW4gcmFuZ2Ugd2lsbCBiZSBkaXNwbGF5ZWQuICovXG4gIGRpc3BsYXlSYW5nZTogRGlzcGxheVJhbmdlIHwgbnVsbDtcblxuICAvKiogQ29udHJvbHMgaG93IHRoZSBgZGlzcGxheVJhbmdlYCBpcyB1c2VkIGlmIHN1cHBsaWVkLiAqL1xuICBkaXNwbGF5UmFuZ2VVc2FnZTogRGlzcGxheVJhbmdlVXNhZ2U7XG5cbiAgLyoqIFRoZSBjb2xvciB0aGVtZS4gKi9cbiAgY29sb3JzOiBDb2xvcnM7XG5cbiAgLyoqIElmIHRydWUgdGhlbiBkaXNwbGF5IHRpbWVzIGF0IHRoZSB0b3Agb2YgdGhlIGNoYXJ0LiAqL1xuICBoYXNUaW1lbGluZTogYm9vbGVhbjtcblxuICAvKiogSWYgdHJ1ZSB0aGVuIGRpc3BsYXkgdGhlIHRhc2sgYmFycy4gKi9cbiAgaGFzVGFza3M6IGJvb2xlYW47XG5cbiAgLyoqIElmIHRydWUgdGhlbiBkcmF3IHZlcnRpY2FsIGxpbmVzIGZyb20gdGhlIHRpbWVsaW5lIGRvd24gdG8gdGFzayBzdGFydCBhbmRcbiAgICogZmluaXNoIHBvaW50cy4gKi9cbiAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogYm9vbGVhbjtcblxuICAvKiogRHJhdyBkZXBlbmRlbmN5IGVkZ2VzIGJldHdlZW4gdGFza3MgaWYgdHJ1ZS4gKi9cbiAgaGFzRWRnZXM6IGJvb2xlYW47XG5cbiAgLyoqIEZ1bmN0aW9uIHRoYXQgcHJvZHVjZXMgZGlzcGxheSB0ZXh0IGZvciBhIFRhc2sgYW5kIGl0cyBhc3NvY2lhdGVkIFNsYWNrLiAqL1xuICB0YXNrTGFiZWw6IFRhc2tMYWJlbDtcblxuICAvKiogVGhlIGluZGljZXMgb2YgdGFza3MgdGhhdCBzaG91bGQgYmUgZW1waGFzaXplZCB3aGVuIGRyYXcsIHR5cGljYWxseSB1c2VkXG4gICAqIHRvIGRlbm90ZSB0aGUgY3JpdGljYWwgcGF0aC4gKi9cbiAgdGFza0VtcGhhc2l6ZTogbnVtYmVyW107XG5cbiAgLyoqIEZpbHRlciB0aGUgVGFza3MgdG8gYmUgZGlzcGxheWVkLiAqL1xuICBmaWx0ZXJGdW5jOiBGaWx0ZXJGdW5jIHwgbnVsbDtcblxuICAvKiogR3JvdXAgdGhlIHRhc2tzIHRvZ2V0aGVyIHZlcnRpY2FsbHkgYmFzZWQgb24gdGhlIGdpdmVuIHJlc291cmNlLiBJZiB0aGVcbiAgICogZW1wdHkgc3RyaW5nIGlzIHN1cHBsaWVkIHRoZW4ganVzdCBkaXNwbGF5IGJ5IHRvcG9sb2dpY2FsIG9yZGVyLlxuICAgKi9cbiAgZ3JvdXBCeVJlc291cmNlOiBzdHJpbmc7XG5cbiAgLyoqIFRhc2sgdG8gaGlnaGxpZ2h0LiAqL1xuICBoaWdobGlnaHRlZFRhc2s6IG51bGwgfCBudW1iZXI7XG5cbiAgLyoqIFRoZSBpbmRleCBvZiB0aGUgc2VsZWN0ZWQgdGFzaywgb3IgLTEgaWYgbm8gdGFzayBpcyBzZWxlY3RlZC4gVGhpcyBpc1xuICAgKiBhbHdheXMgYW4gaW5kZXggaW50byB0aGUgb3JpZ2luYWwgY2hhcnQsIGFuZCBub3QgYW4gaW5kZXggaW50byBhIGZpbHRlcmVkXG4gICAqIGNoYXJ0LlxuICAgKi9cbiAgc2VsZWN0ZWRUYXNrSW5kZXg6IG51bWJlcjtcbn1cblxuY29uc3QgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAoXG4gIHRhc2s6IFRhc2ssXG4gIGRpcmVjdGlvbjogRGlyZWN0aW9uXG4pOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIikge1xuICAgICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZUJvdHRvbTtcbiAgICB9XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQ7XG4gIH1cbn07XG5cbmNvbnN0IHZlcnRpY2FsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAoXG4gIHRhc2s6IFRhc2ssXG4gIGRpcmVjdGlvbjogRGlyZWN0aW9uXG4pOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIikge1xuICAgICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcDtcbiAgICB9XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIikge1xuICAgICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3A7XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0Qm90dG9tO1xuICB9XG59O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5jb25zdCBob3Jpem9udGFsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKHRhc2s6IFRhc2spOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQ7XG4gIH1cbn07XG5cbmNvbnN0IGhvcml6b250YWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9ICh0YXNrOiBUYXNrKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3Q7XG4gIH1cbn07XG5cbi8qKlxuICogQ29tcHV0ZSB3aGF0IHRoZSBoZWlnaHQgb2YgdGhlIGNhbnZhcyBzaG91bGQgYmUuIE5vdGUgdGhhdCB0aGUgdmFsdWUgZG9lc24ndFxuICoga25vdyBhYm91dCBgd2luZG93LmRldmljZVBpeGVsUmF0aW9gLCBzbyBpZiB0aGUgY2FudmFzIGlzIGFscmVhZHkgc2NhbGVkIGJ5XG4gKiBgd2luZG93LmRldmljZVBpeGVsUmF0aW9gIHRoZW4gc28gd2lsbCB0aGUgcmVzdWx0IG9mIHRoaXMgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWdnZXN0ZWRDYW52YXNIZWlnaHQoXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gIHNwYW5zOiBTcGFuW10sXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIG1heFJvd3M6IG51bWJlclxuKTogbnVtYmVyIHtcbiAgaWYgKCFvcHRzLmhhc1Rhc2tzKSB7XG4gICAgbWF4Um93cyA9IDA7XG4gIH1cbiAgcmV0dXJuIG5ldyBTY2FsZShcbiAgICBvcHRzLFxuICAgIGNhbnZhcy53aWR0aCxcbiAgICBzcGFuc1tzcGFucy5sZW5ndGggLSAxXS5maW5pc2ggKyAxXG4gICkuaGVpZ2h0KG1heFJvd3MpO1xufVxuXG4vLyBUaGUgbG9jYXRpb24sIGluIGNhbnZhcyBwaXhlbCBjb29yZGluYXRlcywgb2YgZWFjaCB0YXNrIGJhci4gU2hvdWxkIHVzZSB0aGVcbi8vIHRleHQgb2YgdGhlIHRhc2sgbGFiZWwgYXMgdGhlIGxvY2F0aW9uLCBzaW5jZSB0aGF0J3MgYWx3YXlzIGRyYXduIGluIHRoZSB2aWV3XG4vLyBpZiBwb3NzaWJsZS5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza0xvY2F0aW9uIHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG5cbiAgLy8gVGhhdCBpbmRleCBvZiB0aGUgdGFzayBpbiB0aGUgdW5maWx0ZXJlZCBDaGFydC5cbiAgb3JpZ2luYWxUYXNrSW5kZXg6IG51bWJlcjtcbn1cblxudHlwZSBVcGRhdGVUeXBlID0gXCJtb3VzZW1vdmVcIiB8IFwibW91c2Vkb3duXCI7XG5cbi8vIEEgZnVuYyB0aGF0IHRha2VzIGEgUG9pbnQgYW5kIHJlZHJhd3MgdGhlIGhpZ2hsaWdodGVkIHRhc2sgaWYgbmVlZGVkLCByZXR1cm5zXG4vLyB0aGUgaW5kZXggb2YgdGhlIHRhc2sgdGhhdCBpcyBoaWdobGlnaHRlZC5cbmV4cG9ydCB0eXBlIFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyA9IChcbiAgcG9pbnQ6IFBvaW50LFxuICB1cGRhdGVUeXBlOiBVcGRhdGVUeXBlXG4pID0+IG51bWJlciB8IG51bGw7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyUmVzdWx0IHtcbiAgc2NhbGU6IFNjYWxlO1xuICB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M6IFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyB8IG51bGw7XG4gIHNlbGVjdGVkVGFza0xvY2F0aW9uOiBQb2ludCB8IG51bGw7XG59XG5cbi8vIFRPRE8gLSBQYXNzIGluIG1heCByb3dzLCBhbmQgYSBtYXBwaW5nIHRoYXQgbWFwcyBmcm9tIHRhc2tJbmRleCB0byByb3csXG4vLyBiZWNhdXNlIHR3byBkaWZmZXJlbnQgdGFza3MgbWlnaHQgYmUgcGxhY2VkIG9uIHRoZSBzYW1lIHJvdy4gQWxzbyB3ZSBzaG91bGRcbi8vIHBhc3MgaW4gbWF4IHJvd3M/IE9yIHNob3VsZCB0aGF0IGNvbWUgZnJvbSB0aGUgYWJvdmUgbWFwcGluZz9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJUYXNrc1RvQ2FudmFzKFxuICBwYXJlbnQ6IEhUTUxFbGVtZW50LFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgcGxhbjogUGxhbixcbiAgc3BhbnM6IFNwYW5bXSxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgb3ZlcmxheTogSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsID0gbnVsbFxuKTogUmVzdWx0PFJlbmRlclJlc3VsdD4ge1xuICBjb25zdCB2cmV0ID0gdmFsaWRhdGVDaGFydChwbGFuLmNoYXJ0KTtcbiAgaWYgKCF2cmV0Lm9rKSB7XG4gICAgcmV0dXJuIHZyZXQ7XG4gIH1cblxuICBjb25zdCB0YXNrTG9jYXRpb25zOiBUYXNrTG9jYXRpb25bXSA9IFtdO1xuXG4gIGNvbnN0IG9yaWdpbmFsTGFiZWxzID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5tYXAoXG4gICAgKHRhc2s6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKSA9PiBvcHRzLnRhc2tMYWJlbCh0YXNrSW5kZXgpXG4gICk7XG5cbiAgLy8gQXBwbHkgdGhlIGZpbHRlciBhbmQgd29yayB3aXRoIHRoZSBDaGFydExpa2UgcmV0dXJuIGZyb20gdGhpcyBwb2ludCBvbi5cbiAgLy8gRml0bGVyIGFsc28gbmVlZHMgdG8gYmUgYXBwbGllZCB0byBzcGFucy5cbiAgY29uc3QgZnJldCA9IGZpbHRlcihcbiAgICBwbGFuLmNoYXJ0LFxuICAgIG9wdHMuZmlsdGVyRnVuYyxcbiAgICBvcHRzLnRhc2tFbXBoYXNpemUsXG4gICAgc3BhbnMsXG4gICAgb3JpZ2luYWxMYWJlbHMsXG4gICAgb3B0cy5zZWxlY3RlZFRhc2tJbmRleFxuICApO1xuICBpZiAoIWZyZXQub2spIHtcbiAgICByZXR1cm4gZnJldDtcbiAgfVxuICBjb25zdCBjaGFydExpa2UgPSBmcmV0LnZhbHVlLmNoYXJ0TGlrZTtcbiAgY29uc3QgbGFiZWxzID0gZnJldC52YWx1ZS5sYWJlbHM7XG4gIGNvbnN0IHJlc291cmNlRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKG9wdHMuZ3JvdXBCeVJlc291cmNlKTtcbiAgY29uc3QgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXggPVxuICAgIGZyZXQudmFsdWUuZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg7XG4gIGNvbnN0IGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4ID1cbiAgICBmcmV0LnZhbHVlLmZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4O1xuXG4gIC8vIFNlbGVjdGVkIHRhc2ssIGFzIGFuIGluZGV4IGludG8gdGhlIHVuZmlsdGVyZWQgQ2hhcnQuXG4gIGxldCBsYXN0U2VsZWN0ZWRUYXNrSW5kZXggPSBvcHRzLnNlbGVjdGVkVGFza0luZGV4O1xuXG4gIC8vIEhpZ2hsaWdodGVkIHRhc2tzLlxuICBjb25zdCBlbXBoYXNpemVkVGFza3M6IFNldDxudW1iZXI+ID0gbmV3IFNldChmcmV0LnZhbHVlLmVtcGhhc2l6ZWRUYXNrcyk7XG4gIHNwYW5zID0gZnJldC52YWx1ZS5zcGFucztcblxuICAvLyBDYWxjdWxhdGUgaG93IHdpZGUgd2UgbmVlZCB0byBtYWtlIHRoZSBncm91cEJ5IGNvbHVtbi5cbiAgbGV0IG1heEdyb3VwTmFtZUxlbmd0aCA9IDA7XG4gIGlmIChvcHRzLmdyb3VwQnlSZXNvdXJjZSAhPT0gXCJcIiAmJiBvcHRzLmhhc1RleHQpIHtcbiAgICBtYXhHcm91cE5hbWVMZW5ndGggPSBvcHRzLmdyb3VwQnlSZXNvdXJjZS5sZW5ndGg7XG4gICAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmZvckVhY2goKHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgbWF4R3JvdXBOYW1lTGVuZ3RoID0gTWF0aC5tYXgobWF4R3JvdXBOYW1lTGVuZ3RoLCB2YWx1ZS5sZW5ndGgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgdG90YWxOdW1iZXJPZlJvd3MgPSBzcGFucy5sZW5ndGg7XG4gIGNvbnN0IHRvdGFsTnVtYmVyT2ZEYXlzID0gc3BhbnNbc3BhbnMubGVuZ3RoIC0gMV0uZmluaXNoO1xuICBjb25zdCBzY2FsZSA9IG5ldyBTY2FsZShcbiAgICBvcHRzLFxuICAgIGNhbnZhcy53aWR0aCxcbiAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgbWF4R3JvdXBOYW1lTGVuZ3RoXG4gICk7XG5cbiAgY29uc3QgdGFza0xpbmVIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLnRhc2tMaW5lSGVpZ2h0KTtcbiAgY29uc3QgZGlhbW9uZERpYW1ldGVyID0gc2NhbGUubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcik7XG4gIGNvbnN0IHBlcmNlbnRIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLnBlcmNlbnRIZWlnaHQpO1xuICBjb25zdCBhcnJvd0hlYWRIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLmFycm93SGVhZEhlaWdodCk7XG4gIGNvbnN0IGFycm93SGVhZFdpZHRoID0gc2NhbGUubWV0cmljKE1ldHJpYy5hcnJvd0hlYWRXaWR0aCk7XG4gIGNvbnN0IGRheXNXaXRoVGltZU1hcmtlcnM6IFNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuICBjb25zdCB0aXJldCA9IHRhc2tJbmRleFRvUm93RnJvbUdyb3VwQnkoXG4gICAgb3B0cyxcbiAgICByZXNvdXJjZURlZmluaXRpb24sXG4gICAgY2hhcnRMaWtlLFxuICAgIGZyZXQudmFsdWUuZGlzcGxheU9yZGVyXG4gICk7XG4gIGlmICghdGlyZXQub2spIHtcbiAgICByZXR1cm4gdGlyZXQ7XG4gIH1cbiAgY29uc3QgdGFza0luZGV4VG9Sb3cgPSB0aXJldC52YWx1ZS50YXNrSW5kZXhUb1JvdztcbiAgY29uc3Qgcm93UmFuZ2VzID0gdGlyZXQudmFsdWUucm93UmFuZ2VzO1xuXG4gIC8vIFNldCB1cCBjYW52YXMgYmFzaWNzLlxuICBjbGVhckNhbnZhcyhjdHgsIG9wdHMsIGNhbnZhcyk7XG4gIHNldEZvbnRTaXplKGN0eCwgb3B0cyk7XG5cbiAgY29uc3QgY2xpcFJlZ2lvbiA9IG5ldyBQYXRoMkQoKTtcbiAgY29uc3QgY2xpcE9yaWdpbiA9IHNjYWxlLmZlYXR1cmUoMCwgMCwgRmVhdHVyZS50YXNrc0NsaXBSZWN0T3JpZ2luKTtcbiAgY29uc3QgY2xpcFdpZHRoID0gY2FudmFzLndpZHRoIC0gY2xpcE9yaWdpbi54O1xuICBjbGlwUmVnaW9uLnJlY3QoY2xpcE9yaWdpbi54LCAwLCBjbGlwV2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gIC8vIERyYXcgYmlnIHJlZCByZWN0IG92ZXIgd2hlcmUgdGhlIGNsaXAgcmVnaW9uIHdpbGwgYmUuXG4gIGlmICgwKSB7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZWRcIjtcbiAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnN0cm9rZShjbGlwUmVnaW9uKTtcbiAgfVxuXG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcblxuICBpZiAocm93UmFuZ2VzICE9PSBudWxsKSB7XG4gICAgaWYgKG9wdHMuaGFzVGFza3MpIHtcbiAgICAgIGRyYXdTd2ltTGFuZUhpZ2hsaWdodHMoXG4gICAgICAgIGN0eCxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIHJvd1JhbmdlcyxcbiAgICAgICAgdG90YWxOdW1iZXJPZkRheXMsXG4gICAgICAgIG9wdHMuY29sb3JzLmdyb3VwQ29sb3JcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiAhPT0gdW5kZWZpbmVkICYmIG9wdHMuaGFzVGV4dCkge1xuICAgICAgZHJhd1N3aW1MYW5lTGFiZWxzKGN0eCwgb3B0cywgcmVzb3VyY2VEZWZpbml0aW9uLCBzY2FsZSwgcm93UmFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG5cbiAgY3R4LnNhdmUoKTtcbiAgY3R4LmNsaXAoY2xpcFJlZ2lvbik7XG5cbiAgaW50ZXJmYWNlIFJlY3RDb3JuZXJzIHtcbiAgICB0b3BMZWZ0OiBQb2ludDtcbiAgICBib3R0b21SaWdodDogUG9pbnQ7XG4gIH1cbiAgY29uc3QgdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVyczogTWFwPG51bWJlciwgUmVjdENvcm5lcnM+ID0gbmV3IE1hcCgpO1xuXG4gIC8vIERyYXcgdGFza3MgaW4gdGhlaXIgcm93cy5cbiAgY2hhcnRMaWtlLlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3Qgcm93ID0gdGFza0luZGV4VG9Sb3cuZ2V0KHRhc2tJbmRleCkhO1xuICAgIGNvbnN0IHNwYW4gPSBzcGFuc1t0YXNrSW5kZXhdO1xuICAgIGNvbnN0IHRhc2tTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCBzcGFuLnN0YXJ0LCBGZWF0dXJlLnRhc2tMaW5lU3RhcnQpO1xuICAgIGNvbnN0IHRhc2tFbmQgPSBzY2FsZS5mZWF0dXJlKHJvdywgc3Bhbi5maW5pc2gsIEZlYXR1cmUudGFza0xpbmVTdGFydCk7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG5cbiAgICAvLyBEcmF3IGluIHRpbWUgbWFya2VycyBpZiBkaXNwbGF5ZWQuXG4gICAgLy8gVE9ETyAtIE1ha2Ugc3VyZSB0aGV5IGRvbid0IG92ZXJsYXAuXG4gICAgaWYgKG9wdHMuZHJhd1RpbWVNYXJrZXJzT25UYXNrcykge1xuICAgICAgZHJhd1RpbWVNYXJrZXJBdERheVRvVGFzayhcbiAgICAgICAgY3R4LFxuICAgICAgICByb3csXG4gICAgICAgIHNwYW4uc3RhcnQsXG4gICAgICAgIHRhc2ssXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICBkYXlzV2l0aFRpbWVNYXJrZXJzXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChlbXBoYXNpemVkVGFza3MuaGFzKHRhc2tJbmRleCkpIHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gICAgfVxuICAgIGNvbnN0IGhpZ2hsaWdodFRvcExlZnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgcm93LFxuICAgICAgc3Bhbi5zdGFydCxcbiAgICAgIEZlYXR1cmUudGFza0VudmVsb3BlVG9wXG4gICAgKTtcbiAgICBjb25zdCBoaWdobGlnaHRCb3R0b21SaWdodCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3cgKyAxLFxuICAgICAgc3Bhbi5maW5pc2gsXG4gICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICk7XG5cbiAgICB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLnNldCh0YXNrSW5kZXgsIHtcbiAgICAgIHRvcExlZnQ6IGhpZ2hsaWdodFRvcExlZnQsXG4gICAgICBib3R0b21SaWdodDogaGlnaGxpZ2h0Qm90dG9tUmlnaHQsXG4gICAgfSk7XG4gICAgaWYgKG9wdHMuaGFzVGFza3MpIHtcbiAgICAgIGlmICh0YXNrU3RhcnQueCA9PT0gdGFza0VuZC54KSB7XG4gICAgICAgIGRyYXdNaWxlc3RvbmUoY3R4LCB0YXNrU3RhcnQsIGRpYW1vbmREaWFtZXRlciwgcGVyY2VudEhlaWdodCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcmF3VGFza0JhcihjdHgsIHRhc2tTdGFydCwgdGFza0VuZCwgdGFza0xpbmVIZWlnaHQpO1xuICAgICAgfVxuXG4gICAgICAvLyBTa2lwIGRyYXdpbmcgdGhlIHRleHQgb2YgdGhlIFN0YXJ0IGFuZCBGaW5pc2ggdGFza3MuXG4gICAgICBpZiAodGFza0luZGV4ICE9PSAwICYmIHRhc2tJbmRleCAhPT0gdG90YWxOdW1iZXJPZlJvd3MgLSAxKSB7XG4gICAgICAgIGRyYXdUYXNrVGV4dChcbiAgICAgICAgICBjdHgsXG4gICAgICAgICAgb3B0cyxcbiAgICAgICAgICBzY2FsZSxcbiAgICAgICAgICByb3csXG4gICAgICAgICAgc3BhbixcbiAgICAgICAgICB0YXNrLFxuICAgICAgICAgIHRhc2tJbmRleCxcbiAgICAgICAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleC5nZXQodGFza0luZGV4KSEsXG4gICAgICAgICAgY2xpcFdpZHRoLFxuICAgICAgICAgIGxhYmVscyxcbiAgICAgICAgICB0YXNrTG9jYXRpb25zXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBjdHgubGluZVdpZHRoID0gMTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG5cbiAgLy8gTm93IGRyYXcgYWxsIHRoZSBhcnJvd3MsIGkuZS4gZWRnZXMuXG4gIGlmIChvcHRzLmhhc0VkZ2VzICYmIG9wdHMuaGFzVGFza3MpIHtcbiAgICBjb25zdCBoaWdobGlnaHRlZEVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIGNvbnN0IG5vcm1hbEVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIGNoYXJ0TGlrZS5FZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChlbXBoYXNpemVkVGFza3MuaGFzKGUuaSkgJiYgZW1waGFzaXplZFRhc2tzLmhhcyhlLmopKSB7XG4gICAgICAgIGhpZ2hsaWdodGVkRWRnZXMucHVzaChlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vcm1hbEVkZ2VzLnB1c2goZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcbiAgICBkcmF3RWRnZXMoXG4gICAgICBjdHgsXG4gICAgICBvcHRzLFxuICAgICAgbm9ybWFsRWRnZXMsXG4gICAgICBzcGFucyxcbiAgICAgIGNoYXJ0TGlrZS5WZXJ0aWNlcyxcbiAgICAgIHNjYWxlLFxuICAgICAgdGFza0luZGV4VG9Sb3csXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodCxcbiAgICAgIGVtcGhhc2l6ZWRUYXNrc1xuICAgICk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgIGRyYXdFZGdlcyhcbiAgICAgIGN0eCxcbiAgICAgIG9wdHMsXG4gICAgICBoaWdobGlnaHRlZEVkZ2VzLFxuICAgICAgc3BhbnMsXG4gICAgICBjaGFydExpa2UuVmVydGljZXMsXG4gICAgICBzY2FsZSxcbiAgICAgIHRhc2tJbmRleFRvUm93LFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHQsXG4gICAgICBlbXBoYXNpemVkVGFza3NcbiAgICApO1xuICB9XG5cbiAgLy8gUmVtb3ZlIHRoZSBjbGlwIHJlZ2lvbi5cbiAgY3R4LnJlc3RvcmUoKTtcblxuICAvLyBOb3cgZHJhdyB0aGUgcmFuZ2UgaGlnaGxpZ2h0cyBpZiByZXF1aXJlZC5cbiAgaWYgKG9wdHMuZGlzcGxheVJhbmdlICE9PSBudWxsICYmIG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwiaGlnaGxpZ2h0XCIpIHtcbiAgICAvLyBEcmF3IGEgcmVjdCBvdmVyIGVhY2ggc2lkZSB0aGF0IGlzbid0IGluIHRoZSByYW5nZS5cbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gPiAwKSB7XG4gICAgICBkcmF3UmFuZ2VPdmVybGF5KFxuICAgICAgICBjdHgsXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICAwLFxuICAgICAgICBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbixcbiAgICAgICAgdG90YWxOdW1iZXJPZlJvd3NcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5lbmQgPCB0b3RhbE51bWJlck9mRGF5cykge1xuICAgICAgZHJhd1JhbmdlT3ZlcmxheShcbiAgICAgICAgY3R4LFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgb3B0cy5kaXNwbGF5UmFuZ2UuZW5kLFxuICAgICAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZSb3dzXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGxldCB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M6IFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyB8IG51bGwgPSBudWxsO1xuICBsZXQgc2VsZWN0ZWRUYXNrTG9jYXRpb246IFBvaW50IHwgbnVsbCA9IG51bGw7XG5cbiAgaWYgKG92ZXJsYXkgIT09IG51bGwpIHtcbiAgICBjb25zdCBvdmVybGF5Q3R4ID0gb3ZlcmxheS5nZXRDb250ZXh0KFwiMmRcIikhO1xuXG4gICAgLy8gQWRkIGluIGFsbCBmb3VyIGNvcm5lcnMgb2YgZXZlcnkgVGFzayB0byB0YXNrTG9jYXRpb25zLlxuICAgIHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMuZm9yRWFjaChcbiAgICAgIChyYzogUmVjdENvcm5lcnMsIGZpbHRlcmVkVGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxUYXNrSW5kZXggPVxuICAgICAgICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LmdldChmaWx0ZXJlZFRhc2tJbmRleCkhO1xuICAgICAgICB0YXNrTG9jYXRpb25zLnB1c2goXG4gICAgICAgICAge1xuICAgICAgICAgICAgeDogcmMuYm90dG9tUmlnaHQueCxcbiAgICAgICAgICAgIHk6IHJjLmJvdHRvbVJpZ2h0LnksXG4gICAgICAgICAgICBvcmlnaW5hbFRhc2tJbmRleDogb3JpZ2luYWxUYXNrSW5kZXgsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB4OiByYy50b3BMZWZ0LngsXG4gICAgICAgICAgICB5OiByYy50b3BMZWZ0LnksXG4gICAgICAgICAgICBvcmlnaW5hbFRhc2tJbmRleDogb3JpZ2luYWxUYXNrSW5kZXgsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB4OiByYy5ib3R0b21SaWdodC54LFxuICAgICAgICAgICAgeTogcmMudG9wTGVmdC55LFxuICAgICAgICAgICAgb3JpZ2luYWxUYXNrSW5kZXg6IG9yaWdpbmFsVGFza0luZGV4LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgeDogcmMudG9wTGVmdC54LFxuICAgICAgICAgICAgeTogcmMuYm90dG9tUmlnaHQueSxcbiAgICAgICAgICAgIG9yaWdpbmFsVGFza0luZGV4OiBvcmlnaW5hbFRhc2tJbmRleCxcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcbiAgICBjb25zdCB0YXNrTG9jYXRpb25LRFRyZWUgPSBuZXcgS0RUcmVlKHRhc2tMb2NhdGlvbnMpO1xuXG4gICAgLy8gQWx3YXlzIHJlY29yZWQgaW4gdGhlIG9yaWdpbmFsIHVuZmlsdGVyZWQgdGFzayBpbmRleC5cbiAgICBsZXQgbGFzdEhpZ2hsaWdodGVkVGFza0luZGV4ID0gLTE7XG5cbiAgICB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgPSAoXG4gICAgICBwb2ludDogUG9pbnQsXG4gICAgICB1cGRhdGVUeXBlOiBVcGRhdGVUeXBlXG4gICAgKTogbnVtYmVyIHwgbnVsbCA9PiB7XG4gICAgICAvLyBGaXJzdCBjb252ZXJ0IHBvaW50IGluIG9mZnNldCBjb29yZHMgaW50byBjYW52YXMgY29vcmRzLlxuICAgICAgcG9pbnQueCA9IHBvaW50LnggKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgIHBvaW50LnkgPSBwb2ludC55ICogd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgICBjb25zdCB0YXNrTG9jYXRpb24gPSB0YXNrTG9jYXRpb25LRFRyZWUubmVhcmVzdChwb2ludCk7XG4gICAgICBjb25zdCBvcmlnaW5hbFRhc2tJbmRleCA9IHRhc2tMb2NhdGlvbi5vcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgIGlmICh1cGRhdGVUeXBlID09PSBcIm1vdXNlbW92ZVwiKSB7XG4gICAgICAgIGlmIChvcmlnaW5hbFRhc2tJbmRleCA9PT0gbGFzdEhpZ2hsaWdodGVkVGFza0luZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsVGFza0luZGV4O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAob3JpZ2luYWxUYXNrSW5kZXggPT09IGxhc3RTZWxlY3RlZFRhc2tJbmRleCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodXBkYXRlVHlwZSA9PT0gXCJtb3VzZW1vdmVcIikge1xuICAgICAgICBsYXN0SGlnaGxpZ2h0ZWRUYXNrSW5kZXggPSBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhc3RTZWxlY3RlZFRhc2tJbmRleCA9IG9yaWdpbmFsVGFza0luZGV4O1xuICAgICAgfVxuXG4gICAgICBvdmVybGF5Q3R4LmNsZWFyUmVjdCgwLCAwLCBvdmVybGF5LndpZHRoLCBvdmVybGF5LmhlaWdodCk7XG5cbiAgICAgIC8vIERyYXcgYm90aCBoaWdobGlnaHQgYW5kIHNlbGVjdGlvbi5cblxuICAgICAgLy8gRHJhdyBoaWdobGlnaHQuXG4gICAgICBsZXQgY29ybmVycyA9IHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMuZ2V0KFxuICAgICAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5nZXQobGFzdEhpZ2hsaWdodGVkVGFza0luZGV4KSFcbiAgICAgICk7XG4gICAgICBpZiAoY29ybmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRyYXdUYXNrSGlnaGxpZ2h0KFxuICAgICAgICAgIG92ZXJsYXlDdHgsXG4gICAgICAgICAgY29ybmVycy50b3BMZWZ0LFxuICAgICAgICAgIGNvcm5lcnMuYm90dG9tUmlnaHQsXG4gICAgICAgICAgb3B0cy5jb2xvcnMuaGlnaGxpZ2h0LFxuICAgICAgICAgIHNjYWxlLm1ldHJpYyh0YXNrTGluZUhlaWdodClcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gRHJhdyBzZWxlY3Rpb24uXG4gICAgICBjb3JuZXJzID0gdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5nZXQoXG4gICAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4LmdldChsYXN0U2VsZWN0ZWRUYXNrSW5kZXgpIVxuICAgICAgKTtcbiAgICAgIGlmIChjb3JuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZHJhd1NlbGVjdGlvbkhpZ2hsaWdodChcbiAgICAgICAgICBvdmVybGF5Q3R4LFxuICAgICAgICAgIGNvcm5lcnMudG9wTGVmdCxcbiAgICAgICAgICBjb3JuZXJzLmJvdHRvbVJpZ2h0LFxuICAgICAgICAgIG9wdHMuY29sb3JzLmhpZ2hsaWdodFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgfTtcblxuICAgIC8vIERyYXcgc2VsZWN0aW9uLlxuICAgIGNvbnN0IGNvcm5lcnMgPSB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmdldChcbiAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4LmdldChsYXN0U2VsZWN0ZWRUYXNrSW5kZXgpIVxuICAgICk7XG4gICAgaWYgKGNvcm5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZHJhd1NlbGVjdGlvbkhpZ2hsaWdodChcbiAgICAgICAgb3ZlcmxheUN0eCxcbiAgICAgICAgY29ybmVycy50b3BMZWZ0LFxuICAgICAgICBjb3JuZXJzLmJvdHRvbVJpZ2h0LFxuICAgICAgICBvcHRzLmNvbG9ycy5oaWdobGlnaHRcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgaGlnaGVzdCB0YXNrIG9mIGFsbCB0aGUgdGFza3MgZGlzcGxheWVkLlxuICB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmZvckVhY2goKHJjOiBSZWN0Q29ybmVycykgPT4ge1xuICAgIGlmIChzZWxlY3RlZFRhc2tMb2NhdGlvbiA9PT0gbnVsbCkge1xuICAgICAgc2VsZWN0ZWRUYXNrTG9jYXRpb24gPSByYy50b3BMZWZ0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAocmMudG9wTGVmdC55IDwgc2VsZWN0ZWRUYXNrTG9jYXRpb24ueSkge1xuICAgICAgc2VsZWN0ZWRUYXNrTG9jYXRpb24gPSByYy50b3BMZWZ0O1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG9rKHtcbiAgICBzY2FsZTogc2NhbGUsXG4gICAgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zOiB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MsXG4gICAgc2VsZWN0ZWRUYXNrTG9jYXRpb246IHNlbGVjdGVkVGFza0xvY2F0aW9uLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gZHJhd0VkZ2VzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdLFxuICBzcGFuczogU3BhbltdLFxuICB0YXNrczogVGFza1tdLFxuICBzY2FsZTogU2NhbGUsXG4gIHRhc2tJbmRleFRvUm93OiBUYXNrSW5kZXhUb1JvdyxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXIsXG4gIHRhc2tIaWdobGlnaHRzOiBTZXQ8bnVtYmVyPlxuKSB7XG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IHNyY1NsYWNrOiBTcGFuID0gc3BhbnNbZS5pXTtcbiAgICBjb25zdCBkc3RTbGFjazogU3BhbiA9IHNwYW5zW2Uual07XG4gICAgY29uc3Qgc3JjVGFzazogVGFzayA9IHRhc2tzW2UuaV07XG4gICAgY29uc3QgZHN0VGFzazogVGFzayA9IHRhc2tzW2Uual07XG4gICAgY29uc3Qgc3JjUm93ID0gdGFza0luZGV4VG9Sb3cuZ2V0KGUuaSkhO1xuICAgIGNvbnN0IGRzdFJvdyA9IHRhc2tJbmRleFRvUm93LmdldChlLmopITtcbiAgICBjb25zdCBzcmNEYXkgPSBzcmNTbGFjay5maW5pc2g7XG4gICAgY29uc3QgZHN0RGF5ID0gZHN0U2xhY2suc3RhcnQ7XG5cbiAgICBpZiAodGFza0hpZ2hsaWdodHMuaGFzKGUuaSkgJiYgdGFza0hpZ2hsaWdodHMuaGFzKGUuaikpIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG4gICAgfVxuXG4gICAgZHJhd0Fycm93QmV0d2VlblRhc2tzKFxuICAgICAgY3R4LFxuICAgICAgc3JjRGF5LFxuICAgICAgZHN0RGF5LFxuICAgICAgc2NhbGUsXG4gICAgICBzcmNSb3csXG4gICAgICBzcmNUYXNrLFxuICAgICAgZHN0Um93LFxuICAgICAgZHN0VGFzayxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0XG4gICAgKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdSYW5nZU92ZXJsYXkoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBzY2FsZTogU2NhbGUsXG4gIGJlZ2luRGF5OiBudW1iZXIsXG4gIGVuZERheTogbnVtYmVyLFxuICB0b3RhbE51bWJlck9mUm93czogbnVtYmVyXG4pIHtcbiAgY29uc3QgdG9wTGVmdCA9IHNjYWxlLmZlYXR1cmUoMCwgYmVnaW5EYXksIEZlYXR1cmUuZGlzcGxheVJhbmdlVG9wKTtcbiAgY29uc3QgYm90dG9tUmlnaHQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHRvdGFsTnVtYmVyT2ZSb3dzLFxuICAgIGVuZERheSxcbiAgICBGZWF0dXJlLnRhc2tSb3dCb3R0b21cbiAgKTtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm92ZXJsYXk7XG4gIGN0eC5maWxsUmVjdChcbiAgICB0b3BMZWZ0LngsXG4gICAgdG9wTGVmdC55LFxuICAgIGJvdHRvbVJpZ2h0LnggLSB0b3BMZWZ0LngsXG4gICAgYm90dG9tUmlnaHQueSAtIHRvcExlZnQueVxuICApO1xuICBjb25zb2xlLmxvZyhcImRyYXdSYW5nZU92ZXJsYXlcIiwgdG9wTGVmdCwgYm90dG9tUmlnaHQpO1xufVxuXG5mdW5jdGlvbiBkcmF3QXJyb3dCZXR3ZWVuVGFza3MoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzcmNEYXk6IG51bWJlcixcbiAgZHN0RGF5OiBudW1iZXIsXG4gIHNjYWxlOiBTY2FsZSxcbiAgc3JjUm93OiBudW1iZXIsXG4gIHNyY1Rhc2s6IFRhc2ssXG4gIGRzdFJvdzogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGlmIChzcmNEYXkgPT09IGRzdERheSkge1xuICAgIGRyYXdWZXJ0aWNhbEFycm93VG9UYXNrKFxuICAgICAgY3R4LFxuICAgICAgc2NhbGUsXG4gICAgICBzcmNSb3csXG4gICAgICBzcmNEYXksXG4gICAgICBzcmNUYXNrLFxuICAgICAgZHN0Um93LFxuICAgICAgZHN0RGF5LFxuICAgICAgZHN0VGFzayxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0XG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBkcmF3TFNoYXBlZEFycm93VG9UYXNrKFxuICAgICAgY3R4LFxuICAgICAgc2NhbGUsXG4gICAgICBzcmNSb3csXG4gICAgICBzcmNEYXksXG4gICAgICBzcmNUYXNrLFxuICAgICAgZHN0Um93LFxuICAgICAgZHN0VGFzayxcbiAgICAgIGRzdERheSxcbiAgICAgIGFycm93SGVhZEhlaWdodCxcbiAgICAgIGFycm93SGVhZFdpZHRoXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjbGVhckNhbnZhcyhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnRcbikge1xuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMuc3VyZmFjZTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbn1cblxuZnVuY3Rpb24gc2V0Rm9udFNpemUoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIG9wdHM6IFJlbmRlck9wdGlvbnMpIHtcbiAgY3R4LmZvbnQgPSBgJHtvcHRzLmZvbnRTaXplUHh9cHggc2VyaWZgO1xufVxuXG4vLyBEcmF3IEwgc2hhcGVkIGFycm93LCBmaXJzdCBnb2luZyBiZXR3ZWVuIHJvd3MsIHRoZW4gZ29pbmcgYmV0d2VlbiBkYXlzLlxuZnVuY3Rpb24gZHJhd0xTaGFwZWRBcnJvd1RvVGFzayhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNjYWxlOiBTY2FsZSxcbiAgc3JjUm93OiBudW1iZXIsXG4gIHNyY0RheTogbnVtYmVyLFxuICBzcmNUYXNrOiBUYXNrLFxuICBkc3RSb3c6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgZHN0RGF5OiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyLFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyXG4pIHtcbiAgLy8gRHJhdyB2ZXJ0aWNhbCBwYXJ0IG9mIHRoZSBcIkxcIi5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjb25zdCBkaXJlY3Rpb246IERpcmVjdGlvbiA9IHNyY1JvdyA8IGRzdFJvdyA/IFwiZG93blwiIDogXCJ1cFwiO1xuICBjb25zdCB2ZXJ0TGluZVN0YXJ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICBzcmNSb3csXG4gICAgc3JjRGF5LFxuICAgIHZlcnRpY2FsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKHNyY1Rhc2ssIGRpcmVjdGlvbilcbiAgKTtcbiAgY29uc3QgdmVydExpbmVFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIGRzdFJvdyxcbiAgICBzcmNEYXksXG4gICAgaG9yaXpvbnRhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKGRzdFRhc2spXG4gICk7XG4gIGN0eC5tb3ZlVG8odmVydExpbmVTdGFydC54ICsgMC41LCB2ZXJ0TGluZVN0YXJ0LnkpO1xuICBjdHgubGluZVRvKHZlcnRMaW5lU3RhcnQueCArIDAuNSwgdmVydExpbmVFbmQueSk7XG5cbiAgLy8gRHJhdyBob3Jpem9udGFsIHBhcnQgb2YgdGhlIFwiTFwiLlxuICBjb25zdCBob3J6TGluZVN0YXJ0ID0gdmVydExpbmVFbmQ7XG4gIGNvbnN0IGhvcnpMaW5lRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICBkc3RSb3csXG4gICAgZHN0RGF5LFxuICAgIGhvcml6b250YWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihkc3RUYXNrKVxuICApO1xuICBjdHgubW92ZVRvKHZlcnRMaW5lU3RhcnQueCArIDAuNSwgaG9yekxpbmVTdGFydC55KTtcbiAgY3R4LmxpbmVUbyhob3J6TGluZUVuZC54ICsgMC41LCBob3J6TGluZUVuZC55KTtcblxuICAvLyBEcmF3IHRoZSBhcnJvd2hlYWQuIFRoaXMgYXJyb3cgaGVhZCB3aWxsIGFsd2F5cyBwb2ludCB0byB0aGUgcmlnaHRcbiAgLy8gc2luY2UgdGhhdCdzIGhvdyB0aW1lIGZsb3dzLlxuICBjdHgubW92ZVRvKGhvcnpMaW5lRW5kLnggKyAwLjUsIGhvcnpMaW5lRW5kLnkpO1xuICBjdHgubGluZVRvKFxuICAgIGhvcnpMaW5lRW5kLnggLSBhcnJvd0hlYWRIZWlnaHQgKyAwLjUsXG4gICAgaG9yekxpbmVFbmQueSArIGFycm93SGVhZFdpZHRoXG4gICk7XG4gIGN0eC5tb3ZlVG8oaG9yekxpbmVFbmQueCArIDAuNSwgaG9yekxpbmVFbmQueSk7XG4gIGN0eC5saW5lVG8oXG4gICAgaG9yekxpbmVFbmQueCAtIGFycm93SGVhZEhlaWdodCArIDAuNSxcbiAgICBob3J6TGluZUVuZC55IC0gYXJyb3dIZWFkV2lkdGhcbiAgKTtcbiAgY3R4LnN0cm9rZSgpO1xufVxuXG5mdW5jdGlvbiBkcmF3VmVydGljYWxBcnJvd1RvVGFzayhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNjYWxlOiBTY2FsZSxcbiAgc3JjUm93OiBudW1iZXIsXG4gIHNyY0RheTogbnVtYmVyLFxuICBzcmNUYXNrOiBUYXNrLFxuICBkc3RSb3c6IG51bWJlcixcbiAgZHN0RGF5OiBudW1iZXIsXG4gIGRzdFRhc2s6IFRhc2ssXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyXG4pIHtcbiAgY29uc3QgZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSBzcmNSb3cgPCBkc3RSb3cgPyBcImRvd25cIiA6IFwidXBcIjtcbiAgY29uc3QgYXJyb3dTdGFydCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgc3JjUm93LFxuICAgIHNyY0RheSxcbiAgICB2ZXJ0aWNhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihzcmNUYXNrLCBkaXJlY3Rpb24pXG4gICk7XG4gIGNvbnN0IGFycm93RW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICBkc3RSb3csXG4gICAgZHN0RGF5LFxuICAgIHZlcnRpY2FsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oZHN0VGFzaywgZGlyZWN0aW9uKVxuICApO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4Lm1vdmVUbyhhcnJvd1N0YXJ0LnggKyAwLjUsIGFycm93U3RhcnQueSk7XG4gIGN0eC5saW5lVG8oYXJyb3dFbmQueCArIDAuNSwgYXJyb3dFbmQueSk7XG5cbiAgLy8gRHJhdyB0aGUgYXJyb3doZWFkLlxuICBjb25zdCBkZWx0YVkgPSBkaXJlY3Rpb24gPT09IFwiZG93blwiID8gLWFycm93SGVhZEhlaWdodCA6IGFycm93SGVhZEhlaWdodDtcbiAgY3R4Lm1vdmVUbyhhcnJvd0VuZC54ICsgMC41LCBhcnJvd0VuZC55KTtcbiAgY3R4LmxpbmVUbyhhcnJvd0VuZC54IC0gYXJyb3dIZWFkV2lkdGggKyAwLjUsIGFycm93RW5kLnkgKyBkZWx0YVkpO1xuICBjdHgubW92ZVRvKGFycm93RW5kLnggKyAwLjUsIGFycm93RW5kLnkpO1xuICBjdHgubGluZVRvKGFycm93RW5kLnggKyBhcnJvd0hlYWRXaWR0aCArIDAuNSwgYXJyb3dFbmQueSArIGRlbHRhWSk7XG4gIGN0eC5zdHJva2UoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1Rhc2tUZXh0KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgc2NhbGU6IFNjYWxlLFxuICByb3c6IG51bWJlcixcbiAgc3BhbjogU3BhbixcbiAgdGFzazogVGFzayxcbiAgdGFza0luZGV4OiBudW1iZXIsXG4gIG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXIsXG4gIGNsaXBXaWR0aDogbnVtYmVyLFxuICBsYWJlbHM6IHN0cmluZ1tdLFxuICB0YXNrTG9jYXRpb25zOiBUYXNrTG9jYXRpb25bXVxuKSB7XG4gIGlmICghb3B0cy5oYXNUZXh0KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGxhYmVsID0gbGFiZWxzW3Rhc2tJbmRleF07XG5cbiAgbGV0IHhTdGFydEluVGltZSA9IHNwYW4uc3RhcnQ7XG4gIGxldCB4UGl4ZWxEZWx0YSA9IDA7XG4gIC8vIERldGVybWluZSB3aGVyZSBvbiB0aGUgeC1heGlzIHRvIHN0YXJ0IGRyYXdpbmcgdGhlIHRhc2sgdGV4dC5cbiAgaWYgKG9wdHMuZGlzcGxheVJhbmdlICE9PSBudWxsICYmIG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwicmVzdHJpY3RcIikge1xuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5pbihzcGFuLnN0YXJ0KSkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gc3Bhbi5zdGFydDtcbiAgICAgIHhQaXhlbERlbHRhID0gMDtcbiAgICB9IGVsc2UgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmluKHNwYW4uZmluaXNoKSkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gc3Bhbi5maW5pc2g7XG4gICAgICBjb25zdCBtZWFzID0gY3R4Lm1lYXN1cmVUZXh0KGxhYmVsKTtcbiAgICAgIHhQaXhlbERlbHRhID0gLW1lYXMud2lkdGggLSAyICogc2NhbGUubWV0cmljKE1ldHJpYy50ZXh0WE9mZnNldCk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHNwYW4uc3RhcnQgPCBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiAmJlxuICAgICAgc3Bhbi5maW5pc2ggPiBvcHRzLmRpc3BsYXlSYW5nZS5lbmRcbiAgICApIHtcbiAgICAgIHhTdGFydEluVGltZSA9IG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luO1xuICAgICAgeFBpeGVsRGVsdGEgPSBjbGlwV2lkdGggLyAyO1xuICAgIH1cbiAgfVxuICBjdHgubGluZVdpZHRoID0gMTtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gIGNvbnN0IHRleHRTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCB4U3RhcnRJblRpbWUsIEZlYXR1cmUudGV4dFN0YXJ0KTtcbiAgY29uc3QgdGV4dFggPSB0ZXh0U3RhcnQueCArIHhQaXhlbERlbHRhO1xuICBjb25zdCB0ZXh0WSA9IHRleHRTdGFydC55O1xuICBjdHguZmlsbFRleHQobGFiZWwsIHRleHRTdGFydC54ICsgeFBpeGVsRGVsdGEsIHRleHRTdGFydC55KTtcbiAgdGFza0xvY2F0aW9ucy5wdXNoKHtcbiAgICB4OiB0ZXh0WCxcbiAgICB5OiB0ZXh0WSxcbiAgICBvcmlnaW5hbFRhc2tJbmRleDogb3JpZ2luYWxUYXNrSW5kZXgsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza0JhcihcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHRhc2tTdGFydDogUG9pbnQsXG4gIHRhc2tFbmQ6IFBvaW50LFxuICB0YXNrTGluZUhlaWdodDogbnVtYmVyXG4pIHtcbiAgY3R4LmZpbGxSZWN0KFxuICAgIHRhc2tTdGFydC54LFxuICAgIHRhc2tTdGFydC55LFxuICAgIHRhc2tFbmQueCAtIHRhc2tTdGFydC54LFxuICAgIHRhc2tMaW5lSGVpZ2h0XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUYXNrSGlnaGxpZ2h0KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgaGlnaGxpZ2h0U3RhcnQ6IFBvaW50LFxuICBoaWdobGlnaHRFbmQ6IFBvaW50LFxuICBjb2xvcjogc3RyaW5nLFxuICBib3JkZXJXaWR0aDogbnVtYmVyXG4pIHtcbiAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gIGN0eC5saW5lV2lkdGggPSBib3JkZXJXaWR0aDtcbiAgY3R4LnN0cm9rZVJlY3QoXG4gICAgaGlnaGxpZ2h0U3RhcnQueCxcbiAgICBoaWdobGlnaHRTdGFydC55LFxuICAgIGhpZ2hsaWdodEVuZC54IC0gaGlnaGxpZ2h0U3RhcnQueCxcbiAgICBoaWdobGlnaHRFbmQueSAtIGhpZ2hsaWdodFN0YXJ0LnlcbiAgKTtcbn1cblxuZnVuY3Rpb24gZHJhd1NlbGVjdGlvbkhpZ2hsaWdodChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIGhpZ2hsaWdodFN0YXJ0OiBQb2ludCxcbiAgaGlnaGxpZ2h0RW5kOiBQb2ludCxcbiAgY29sb3I6IHN0cmluZ1xuKSB7XG4gIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgY3R4LmZpbGxSZWN0KFxuICAgIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0U3RhcnQueSxcbiAgICBoaWdobGlnaHRFbmQueCAtIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0RW5kLnkgLSBoaWdobGlnaHRTdGFydC55XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdNaWxlc3RvbmUoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICB0YXNrU3RhcnQ6IFBvaW50LFxuICBkaWFtb25kRGlhbWV0ZXI6IG51bWJlcixcbiAgcGVyY2VudEhlaWdodDogbnVtYmVyXG4pIHtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubGluZVdpZHRoID0gcGVyY2VudEhlaWdodCAvIDI7XG4gIGN0eC5tb3ZlVG8odGFza1N0YXJ0LngsIHRhc2tTdGFydC55IC0gZGlhbW9uZERpYW1ldGVyKTtcbiAgY3R4LmxpbmVUbyh0YXNrU3RhcnQueCArIGRpYW1vbmREaWFtZXRlciwgdGFza1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKHRhc2tTdGFydC54LCB0YXNrU3RhcnQueSArIGRpYW1vbmREaWFtZXRlcik7XG4gIGN0eC5saW5lVG8odGFza1N0YXJ0LnggLSBkaWFtb25kRGlhbWV0ZXIsIHRhc2tTdGFydC55KTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmNvbnN0IGRyYXdUaW1lTWFya2VyQXREYXlUb1Rhc2sgPSAoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICByb3c6IG51bWJlcixcbiAgZGF5OiBudW1iZXIsXG4gIHRhc2s6IFRhc2ssXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgZGF5c1dpdGhUaW1lTWFya2VyczogU2V0PG51bWJlcj5cbikgPT4ge1xuICBpZiAoZGF5c1dpdGhUaW1lTWFya2Vycy5oYXMoZGF5KSkge1xuICAgIHJldHVybjtcbiAgfVxuICBkYXlzV2l0aFRpbWVNYXJrZXJzLmFkZChkYXkpO1xuICBjb25zdCB0aW1lTWFya1N0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS50aW1lTWFya1N0YXJ0KTtcbiAgY29uc3QgdGltZU1hcmtFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHJvdyxcbiAgICBkYXksXG4gICAgdmVydGljYWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbih0YXNrLCBcImRvd25cIilcbiAgKTtcbiAgY3R4LmxpbmVXaWR0aCA9IDAuNTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub3ZlcmxheTtcblxuICBjdHgubW92ZVRvKHRpbWVNYXJrU3RhcnQueCArIDAuNSwgdGltZU1hcmtTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh0aW1lTWFya1N0YXJ0LnggKyAwLjUsIHRpbWVNYXJrRW5kLnkpO1xuICBjdHguc3Ryb2tlKCk7XG5cbiAgY3R4LnNldExpbmVEYXNoKFtdKTtcblxuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcbiAgY29uc3QgdGV4dFN0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS50aW1lVGV4dFN0YXJ0KTtcbiAgaWYgKG9wdHMuaGFzVGV4dCAmJiBvcHRzLmhhc1RpbWVsaW5lKSB7XG4gICAgY3R4LmZpbGxUZXh0KGAke2RheX1gLCB0ZXh0U3RhcnQueCwgdGV4dFN0YXJ0LnkpO1xuICB9XG59O1xuXG4vKiogUmVwcmVzZW50cyBhIGhhbGYtb3BlbiBpbnRlcnZhbCBvZiByb3dzLCBlLmcuIFtzdGFydCwgZmluaXNoKS4gKi9cbmludGVyZmFjZSBSb3dSYW5nZSB7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGZpbmlzaDogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgVGFza0luZGV4VG9Sb3dSZXR1cm4ge1xuICB0YXNrSW5kZXhUb1JvdzogVGFza0luZGV4VG9Sb3c7XG5cbiAgLyoqIE1hcHMgZWFjaCByZXNvdXJjZSB2YWx1ZSBpbmRleCB0byBhIHJhbmdlIG9mIHJvd3MuICovXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+IHwgbnVsbDtcblxuICByZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvbiB8IG51bGw7XG59XG5cbmNvbnN0IHRhc2tJbmRleFRvUm93RnJvbUdyb3VwQnkgPSAoXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uIHwgdW5kZWZpbmVkLFxuICBjaGFydExpa2U6IENoYXJ0TGlrZSxcbiAgZGlzcGxheU9yZGVyOiBWZXJ0ZXhJbmRpY2VzXG4pOiBSZXN1bHQ8VGFza0luZGV4VG9Sb3dSZXR1cm4+ID0+IHtcbiAgLy8gZGlzcGxheU9yZGVyIG1hcHMgZnJvbSByb3cgdG8gdGFzayBpbmRleCwgdGhpcyB3aWxsIHByb2R1Y2UgdGhlIGludmVyc2UgbWFwcGluZy5cbiAgY29uc3QgdGFza0luZGV4VG9Sb3cgPSBuZXcgTWFwKFxuICAgIC8vIFRoaXMgbG9va3MgYmFja3dhcmRzLCBidXQgaXQgaXNuJ3QuIFJlbWVtYmVyIHRoYXQgdGhlIG1hcCBjYWxsYmFjayB0YWtlc1xuICAgIC8vICh2YWx1ZSwgaW5kZXgpIGFzIGl0cyBhcmd1bWVudHMuXG4gICAgZGlzcGxheU9yZGVyLm1hcCgodGFza0luZGV4OiBudW1iZXIsIHJvdzogbnVtYmVyKSA9PiBbdGFza0luZGV4LCByb3ddKVxuICApO1xuXG4gIGlmIChyZXNvdXJjZURlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBvayh7XG4gICAgICB0YXNrSW5kZXhUb1JvdzogdGFza0luZGV4VG9Sb3csXG4gICAgICByb3dSYW5nZXM6IG51bGwsXG4gICAgICByZXNvdXJjZURlZmluaXRpb246IG51bGwsXG4gICAgfSk7XG4gIH1cblxuICBjb25zdCBzdGFydFRhc2tJbmRleCA9IDA7XG4gIGNvbnN0IGZpbmlzaFRhc2tJbmRleCA9IGNoYXJ0TGlrZS5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICBjb25zdCBpZ25vcmFibGUgPSBbc3RhcnRUYXNrSW5kZXgsIGZpbmlzaFRhc2tJbmRleF07XG5cbiAgLy8gR3JvdXAgYWxsIHRhc2tzIGJ5IHRoZWlyIHJlc291cmNlIHZhbHVlLCB3aGlsZSBwcmVzZXJ2aW5nIGRpc3BsYXlPcmRlclxuICAvLyBvcmRlciB3aXRoIHRoZSBncm91cHMuXG4gIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXJbXT4oKTtcbiAgZGlzcGxheU9yZGVyLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgcmVzb3VyY2VWYWx1ZSA9XG4gICAgICBjaGFydExpa2UuVmVydGljZXNbdGFza0luZGV4XS5nZXRSZXNvdXJjZShvcHRzLmdyb3VwQnlSZXNvdXJjZSkgfHwgXCJcIjtcbiAgICBjb25zdCBncm91cE1lbWJlcnMgPSBncm91cHMuZ2V0KHJlc291cmNlVmFsdWUpIHx8IFtdO1xuICAgIGdyb3VwTWVtYmVycy5wdXNoKHRhc2tJbmRleCk7XG4gICAgZ3JvdXBzLnNldChyZXNvdXJjZVZhbHVlLCBncm91cE1lbWJlcnMpO1xuICB9KTtcblxuICBjb25zdCByZXQgPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPigpO1xuXG4gIC8vIFVnaCwgU3RhcnQgYW5kIEZpbmlzaCBUYXNrcyBuZWVkIHRvIGJlIG1hcHBlZCwgYnV0IHNob3VsZCBub3QgYmUgZG9uZSB2aWFcbiAgLy8gcmVzb3VyY2UgdmFsdWUsIHNvIFN0YXJ0IHNob3VsZCBhbHdheXMgYmUgZmlyc3QuXG4gIHJldC5zZXQoMCwgMCk7XG5cbiAgLy8gTm93IGluY3JlbWVudCB1cCB0aGUgcm93cyBhcyB3ZSBtb3ZlIHRocm91Z2ggYWxsIHRoZSBncm91cHMuXG4gIGxldCByb3cgPSAxO1xuICAvLyBBbmQgdHJhY2sgaG93IG1hbnkgcm93cyBhcmUgaW4gZWFjaCBncm91cC5cbiAgY29uc3Qgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4gPSBuZXcgTWFwKCk7XG4gIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMuZm9yRWFjaChcbiAgICAocmVzb3VyY2VWYWx1ZTogc3RyaW5nLCByZXNvdXJjZUluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0T2ZSb3cgPSByb3c7XG4gICAgICAoZ3JvdXBzLmdldChyZXNvdXJjZVZhbHVlKSB8fCBbXSkuZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgaWYgKGlnbm9yYWJsZS5pbmNsdWRlcyh0YXNrSW5kZXgpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldC5zZXQodGFza0luZGV4LCByb3cpO1xuICAgICAgICByb3crKztcbiAgICAgIH0pO1xuICAgICAgcm93UmFuZ2VzLnNldChyZXNvdXJjZUluZGV4LCB7IHN0YXJ0OiBzdGFydE9mUm93LCBmaW5pc2g6IHJvdyB9KTtcbiAgICB9XG4gICk7XG4gIHJldC5zZXQoZmluaXNoVGFza0luZGV4LCByb3cpO1xuXG4gIHJldHVybiBvayh7XG4gICAgdGFza0luZGV4VG9Sb3c6IHJldCxcbiAgICByb3dSYW5nZXM6IHJvd1JhbmdlcyxcbiAgICByZXNvdXJjZURlZmluaXRpb246IHJlc291cmNlRGVmaW5pdGlvbixcbiAgfSk7XG59O1xuXG5jb25zdCBkcmF3U3dpbUxhbmVIaWdobGlnaHRzID0gKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc2NhbGU6IFNjYWxlLFxuICByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPixcbiAgdG90YWxOdW1iZXJPZkRheXM6IG51bWJlcixcbiAgZ3JvdXBDb2xvcjogc3RyaW5nXG4pID0+IHtcbiAgY3R4LmZpbGxTdHlsZSA9IGdyb3VwQ29sb3I7XG5cbiAgbGV0IGdyb3VwID0gMDtcbiAgcm93UmFuZ2VzLmZvckVhY2goKHJvd1JhbmdlOiBSb3dSYW5nZSkgPT4ge1xuICAgIGNvbnN0IHRvcExlZnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgcm93UmFuZ2Uuc3RhcnQsXG4gICAgICAwLFxuICAgICAgRmVhdHVyZS5ncm91cEVudmVsb3BlU3RhcnRcbiAgICApO1xuICAgIGNvbnN0IGJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvd1JhbmdlLmZpbmlzaCxcbiAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzICsgMSxcbiAgICAgIEZlYXR1cmUudGFza0VudmVsb3BlVG9wXG4gICAgKTtcbiAgICBncm91cCsrO1xuICAgIC8vIE9ubHkgaGlnaGxpZ2h0IGV2ZXJ5IG90aGVyIGdyb3VwIGJhY2tncm91ZCB3aXRoIHRoZSBncm91cENvbG9yLlxuICAgIGlmIChncm91cCAlIDIgPT0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjdHguZmlsbFJlY3QoXG4gICAgICB0b3BMZWZ0LngsXG4gICAgICB0b3BMZWZ0LnksXG4gICAgICBib3R0b21SaWdodC54IC0gdG9wTGVmdC54LFxuICAgICAgYm90dG9tUmlnaHQueSAtIHRvcExlZnQueVxuICAgICk7XG4gIH0pO1xufTtcblxuY29uc3QgZHJhd1N3aW1MYW5lTGFiZWxzID0gKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb24sXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT5cbikgPT4ge1xuICBpZiAocm93UmFuZ2VzKSBjdHgubGluZVdpZHRoID0gMTtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY29uc3QgZ3JvdXBCeU9yaWdpbiA9IHNjYWxlLmZlYXR1cmUoMCwgMCwgRmVhdHVyZS5ncm91cEJ5T3JpZ2luKTtcblxuICBpZiAob3B0cy5oYXNUaW1lbGluZSkge1xuICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcImJvdHRvbVwiO1xuICAgIGN0eC5maWxsVGV4dChvcHRzLmdyb3VwQnlSZXNvdXJjZSwgZ3JvdXBCeU9yaWdpbi54LCBncm91cEJ5T3JpZ2luLnkpO1xuICB9XG5cbiAgaWYgKG9wdHMuaGFzVGFza3MpIHtcbiAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcbiAgICByb3dSYW5nZXMuZm9yRWFjaCgocm93UmFuZ2U6IFJvd1JhbmdlLCByZXNvdXJjZUluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGlmIChyb3dSYW5nZS5zdGFydCA9PT0gcm93UmFuZ2UuZmluaXNoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRleHRTdGFydCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICAgIHJvd1JhbmdlLnN0YXJ0LFxuICAgICAgICAwLFxuICAgICAgICBGZWF0dXJlLmdyb3VwVGV4dFN0YXJ0XG4gICAgICApO1xuICAgICAgY3R4LmZpbGxUZXh0KFxuICAgICAgICByZXNvdXJjZURlZmluaXRpb24udmFsdWVzW3Jlc291cmNlSW5kZXhdLFxuICAgICAgICB0ZXh0U3RhcnQueCxcbiAgICAgICAgdGV4dFN0YXJ0LnlcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbn07XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBUYXNrLCBDaGFydCwgQ2hhcnRWYWxpZGF0ZSB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUm91bmRlciB9IGZyb20gXCIuLi90eXBlcy90eXBlcy50c1wiO1xuXG4vKiogU3BhbiByZXByZXNlbnRzIHdoZW4gYSB0YXNrIHdpbGwgYmUgZG9uZSwgaS5lLiBpdCBjb250YWlucyB0aGUgdGltZSB0aGUgdGFza1xuICogaXMgZXhwZWN0ZWQgdG8gYmVnaW4gYW5kIGVuZC4gKi9cbmV4cG9ydCBjbGFzcyBTcGFuIHtcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZmluaXNoOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc3RhcnQ6IG51bWJlciA9IDAsIGZpbmlzaDogbnVtYmVyID0gMCkge1xuICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICB0aGlzLmZpbmlzaCA9IGZpbmlzaDtcbiAgfVxufVxuXG4vKiogVGhlIHN0YW5kYXJkIHNsYWNrIGNhbGN1bGF0aW9uIHZhbHVlcy4gKi9cbmV4cG9ydCBjbGFzcyBTbGFjayB7XG4gIGVhcmx5OiBTcGFuID0gbmV3IFNwYW4oKTtcbiAgbGF0ZTogU3BhbiA9IG5ldyBTcGFuKCk7XG4gIHNsYWNrOiBudW1iZXIgPSAwO1xufVxuXG5leHBvcnQgdHlwZSBUYXNrRHVyYXRpb24gPSAodDogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IG51bWJlcjtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUYXNrRHVyYXRpb24gPSAodDogVGFzayk6IG51bWJlciA9PiB7XG4gIHJldHVybiB0LmR1cmF0aW9uO1xufTtcblxuZXhwb3J0IHR5cGUgU2xhY2tSZXN1bHQgPSBSZXN1bHQ8U2xhY2tbXT47XG5cbi8vIENhbGN1bGF0ZSB0aGUgc2xhY2sgZm9yIGVhY2ggVGFzayBpbiB0aGUgQ2hhcnQuXG5leHBvcnQgZnVuY3Rpb24gQ29tcHV0ZVNsYWNrKFxuICBjOiBDaGFydCxcbiAgdGFza0R1cmF0aW9uOiBUYXNrRHVyYXRpb24gPSBkZWZhdWx0VGFza0R1cmF0aW9uLFxuICByb3VuZDogUm91bmRlclxuKTogU2xhY2tSZXN1bHQge1xuICAvLyBDcmVhdGUgYSBTbGFjayBmb3IgZWFjaCBUYXNrLlxuICBjb25zdCBzbGFja3M6IFNsYWNrW10gPSBuZXcgQXJyYXkoYy5WZXJ0aWNlcy5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGMuVmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzbGFja3NbaV0gPSBuZXcgU2xhY2soKTtcbiAgfVxuXG4gIGNvbnN0IHIgPSBDaGFydFZhbGlkYXRlKGMpO1xuICBpZiAoIXIub2spIHtcbiAgICByZXR1cm4gZXJyb3Ioci5lcnJvcik7XG4gIH1cblxuICBjb25zdCBlZGdlcyA9IGVkZ2VzQnlTcmNBbmREc3RUb01hcChjLkVkZ2VzKTtcblxuICBjb25zdCB0b3BvbG9naWNhbE9yZGVyID0gci52YWx1ZTtcblxuICAvLyBGaXJzdCBnbyBmb3J3YXJkIHRocm91Z2ggdGhlIHRvcG9sb2dpY2FsIHNvcnQgYW5kIGZpbmQgdGhlIGVhcmx5IHN0YXJ0IGZvclxuICAvLyBlYWNoIHRhc2ssIHdoaWNoIGlzIHRoZSBtYXggb2YgYWxsIHRoZSBwcmVkZWNlc3NvcnMgZWFybHkgZmluaXNoIHZhbHVlcy5cbiAgLy8gU2luY2Ugd2Uga25vdyB0aGUgZHVyYXRpb24gd2UgY2FuIGFsc28gY29tcHV0ZSB0aGUgZWFybHkgZmluaXNoLlxuICB0b3BvbG9naWNhbE9yZGVyLnNsaWNlKDEpLmZvckVhY2goKHZlcnRleEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrID0gYy5WZXJ0aWNlc1t2ZXJ0ZXhJbmRleF07XG4gICAgY29uc3Qgc2xhY2sgPSBzbGFja3NbdmVydGV4SW5kZXhdO1xuICAgIHNsYWNrLmVhcmx5LnN0YXJ0ID0gTWF0aC5tYXgoXG4gICAgICAuLi5lZGdlcy5ieURzdC5nZXQodmVydGV4SW5kZXgpIS5tYXAoKGU6IERpcmVjdGVkRWRnZSk6IG51bWJlciA9PiB7XG4gICAgICAgIGNvbnN0IHByZWRlY2Vzc29yU2xhY2sgPSBzbGFja3NbZS5pXTtcbiAgICAgICAgcmV0dXJuIHByZWRlY2Vzc29yU2xhY2suZWFybHkuZmluaXNoO1xuICAgICAgfSlcbiAgICApO1xuICAgIHNsYWNrLmVhcmx5LmZpbmlzaCA9IHJvdW5kKFxuICAgICAgc2xhY2suZWFybHkuc3RhcnQgKyB0YXNrRHVyYXRpb24odGFzaywgdmVydGV4SW5kZXgpXG4gICAgKTtcbiAgfSk7XG5cbiAgLy8gTm93IGJhY2t3YXJkcyB0aHJvdWdoIHRoZSB0b3BvbG9naWNhbCBzb3J0IGFuZCBmaW5kIHRoZSBsYXRlIGZpbmlzaCBvZiBlYWNoXG4gIC8vIHRhc2ssIHdoaWNoIGlzIHRoZSBtaW4gb2YgYWxsIHRoZSBzdWNjZXNzb3IgdGFza3MgbGF0ZSBzdGFydHMuIEFnYWluIHNpbmNlXG4gIC8vIHdlIGtub3cgdGhlIGR1cmF0aW9uIHdlIGNhbiBhbHNvIGNvbXB1dGUgdGhlIGxhdGUgc3RhcnQuIEZpbmFsbHksIHNpbmNlIHdlXG4gIC8vIG5vdyBoYXZlIGFsbCB0aGUgZWFybHkvbGF0ZSBhbmQgc3RhcnQvZmluaXNoIHZhbHVlcyB3ZSBjYW4gbm93IGNhbGN1YXRlIHRoZVxuICAvLyBzbGFjay5cbiAgdG9wb2xvZ2ljYWxPcmRlci5yZXZlcnNlKCkuZm9yRWFjaCgodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSBjLlZlcnRpY2VzW3ZlcnRleEluZGV4XTtcbiAgICBjb25zdCBzbGFjayA9IHNsYWNrc1t2ZXJ0ZXhJbmRleF07XG4gICAgY29uc3Qgc3VjY2Vzc29ycyA9IGVkZ2VzLmJ5U3JjLmdldCh2ZXJ0ZXhJbmRleCk7XG4gICAgaWYgKCFzdWNjZXNzb3JzKSB7XG4gICAgICBzbGFjay5sYXRlLmZpbmlzaCA9IHNsYWNrLmVhcmx5LmZpbmlzaDtcbiAgICAgIHNsYWNrLmxhdGUuc3RhcnQgPSBzbGFjay5lYXJseS5zdGFydDtcbiAgICB9IGVsc2Uge1xuICAgICAgc2xhY2subGF0ZS5maW5pc2ggPSBNYXRoLm1pbihcbiAgICAgICAgLi4uZWRnZXMuYnlTcmMuZ2V0KHZlcnRleEluZGV4KSEubWFwKChlOiBEaXJlY3RlZEVkZ2UpOiBudW1iZXIgPT4ge1xuICAgICAgICAgIGNvbnN0IHN1Y2Nlc3NvclNsYWNrID0gc2xhY2tzW2Uual07XG4gICAgICAgICAgcmV0dXJuIHN1Y2Nlc3NvclNsYWNrLmxhdGUuc3RhcnQ7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgc2xhY2subGF0ZS5zdGFydCA9IHJvdW5kKFxuICAgICAgICBzbGFjay5sYXRlLmZpbmlzaCAtIHRhc2tEdXJhdGlvbih0YXNrLCB2ZXJ0ZXhJbmRleClcbiAgICAgICk7XG4gICAgICBzbGFjay5zbGFjayA9IHJvdW5kKHNsYWNrLmxhdGUuZmluaXNoIC0gc2xhY2suZWFybHkuZmluaXNoKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBvayhzbGFja3MpO1xufVxuXG5leHBvcnQgY29uc3QgQ3JpdGljYWxQYXRoID0gKHNsYWNrczogU2xhY2tbXSwgcm91bmQ6IFJvdW5kZXIpOiBudW1iZXJbXSA9PiB7XG4gIGNvbnN0IHJldDogbnVtYmVyW10gPSBbXTtcbiAgc2xhY2tzLmZvckVhY2goKHNsYWNrOiBTbGFjaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGlmIChcbiAgICAgIHJvdW5kKHNsYWNrLmxhdGUuZmluaXNoIC0gc2xhY2suZWFybHkuZmluaXNoKSA8IE51bWJlci5FUFNJTE9OICYmXG4gICAgICByb3VuZChzbGFjay5lYXJseS5maW5pc2ggLSBzbGFjay5lYXJseS5zdGFydCkgPiBOdW1iZXIuRVBTSUxPTlxuICAgICkge1xuICAgICAgcmV0LnB1c2goaW5kZXgpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXQ7XG59O1xuIiwgIi8vIFdoZW4gYWRkaW5nIHByb3BlcnRpZXMgdG8gQ29sb3JUaGVtZSBhbHNvIG1ha2Ugc3VyZSB0byBhZGQgYSBjb3JyZXNwb25kaW5nXG4vLyBDU1MgQHByb3BlcnR5IGRlY2xhcmF0aW9uLlxuLy9cbi8vIE5vdGUgdGhhdCBlYWNoIHByb3BlcnR5IGFzc3VtZXMgdGhlIHByZXNlbmNlIG9mIGEgQ1NTIHZhcmlhYmxlIG9mIHRoZSBzYW1lIG5hbWVcbi8vIHdpdGggYSBwcmVjZWVkaW5nIGAtLWAuXG5leHBvcnQgaW50ZXJmYWNlIFRoZW1lIHtcbiAgc3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlTXV0ZWQ6IHN0cmluZztcbiAgb25TdXJmYWNlU2Vjb25kYXJ5OiBzdHJpbmc7XG4gIG92ZXJsYXk6IHN0cmluZztcbiAgZ3JvdXBDb2xvcjogc3RyaW5nO1xuICBoaWdobGlnaHQ6IHN0cmluZztcbn1cblxudHlwZSBUaGVtZVByb3AgPSBrZXlvZiBUaGVtZTtcblxuY29uc3QgY29sb3JUaGVtZVByb3RvdHlwZTogVGhlbWUgPSB7XG4gIHN1cmZhY2U6IFwiXCIsXG4gIG9uU3VyZmFjZTogXCJcIixcbiAgb25TdXJmYWNlTXV0ZWQ6IFwiXCIsXG4gIG9uU3VyZmFjZVNlY29uZGFyeTogXCJcIixcbiAgb3ZlcmxheTogXCJcIixcbiAgZ3JvdXBDb2xvcjogXCJcIixcbiAgaGlnaGxpZ2h0OiBcIlwiLFxufTtcblxuZXhwb3J0IGNvbnN0IGNvbG9yVGhlbWVGcm9tRWxlbWVudCA9IChlbGU6IEhUTUxFbGVtZW50KTogVGhlbWUgPT4ge1xuICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlKTtcbiAgY29uc3QgcmV0ID0gT2JqZWN0LmFzc2lnbih7fSwgY29sb3JUaGVtZVByb3RvdHlwZSk7XG4gIE9iamVjdC5rZXlzKHJldCkuZm9yRWFjaCgobmFtZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0W25hbWUgYXMgVGhlbWVQcm9wXSA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoYC0tJHtuYW1lfWApO1xuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTcgR29vZ2xlIExMQ1xuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEJTRC0zLUNsYXVzZVxuICovXG5cbi8vIElNUE9SVEFOVDogdGhlc2UgaW1wb3J0cyBtdXN0IGJlIHR5cGUtb25seVxuaW1wb3J0IHR5cGUge0RpcmVjdGl2ZSwgRGlyZWN0aXZlUmVzdWx0LCBQYXJ0SW5mb30gZnJvbSAnLi9kaXJlY3RpdmUuanMnO1xuaW1wb3J0IHR5cGUge1RydXN0ZWRIVE1MLCBUcnVzdGVkVHlwZXNXaW5kb3d9IGZyb20gJ3RydXN0ZWQtdHlwZXMvbGliJztcblxuY29uc3QgREVWX01PREUgPSB0cnVlO1xuY29uc3QgRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTID0gdHJ1ZTtcbmNvbnN0IEVOQUJMRV9TSEFEWURPTV9OT1BBVENIID0gdHJ1ZTtcbmNvbnN0IE5PREVfTU9ERSA9IGZhbHNlO1xuXG4vLyBBbGxvd3MgbWluaWZpZXJzIHRvIHJlbmFtZSByZWZlcmVuY2VzIHRvIGdsb2JhbFRoaXNcbmNvbnN0IGdsb2JhbCA9IGdsb2JhbFRoaXM7XG5cbi8qKlxuICogQ29udGFpbnMgdHlwZXMgdGhhdCBhcmUgcGFydCBvZiB0aGUgdW5zdGFibGUgZGVidWcgQVBJLlxuICpcbiAqIEV2ZXJ5dGhpbmcgaW4gdGhpcyBBUEkgaXMgbm90IHN0YWJsZSBhbmQgbWF5IGNoYW5nZSBvciBiZSByZW1vdmVkIGluIHRoZSBmdXR1cmUsXG4gKiBldmVuIG9uIHBhdGNoIHJlbGVhc2VzLlxuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5hbWVzcGFjZVxuZXhwb3J0IG5hbWVzcGFjZSBMaXRVbnN0YWJsZSB7XG4gIC8qKlxuICAgKiBXaGVuIExpdCBpcyBydW5uaW5nIGluIGRldiBtb2RlIGFuZCBgd2luZG93LmVtaXRMaXREZWJ1Z0xvZ0V2ZW50c2AgaXMgdHJ1ZSxcbiAgICogd2Ugd2lsbCBlbWl0ICdsaXQtZGVidWcnIGV2ZW50cyB0byB3aW5kb3csIHdpdGggbGl2ZSBkZXRhaWxzIGFib3V0IHRoZSB1cGRhdGUgYW5kIHJlbmRlclxuICAgKiBsaWZlY3ljbGUuIFRoZXNlIGNhbiBiZSB1c2VmdWwgZm9yIHdyaXRpbmcgZGVidWcgdG9vbGluZyBhbmQgdmlzdWFsaXphdGlvbnMuXG4gICAqXG4gICAqIFBsZWFzZSBiZSBhd2FyZSB0aGF0IHJ1bm5pbmcgd2l0aCB3aW5kb3cuZW1pdExpdERlYnVnTG9nRXZlbnRzIGhhcyBwZXJmb3JtYW5jZSBvdmVyaGVhZCxcbiAgICogbWFraW5nIGNlcnRhaW4gb3BlcmF0aW9ucyB0aGF0IGFyZSBub3JtYWxseSB2ZXJ5IGNoZWFwIChsaWtlIGEgbm8tb3AgcmVuZGVyKSBtdWNoIHNsb3dlcixcbiAgICogYmVjYXVzZSB3ZSBtdXN0IGNvcHkgZGF0YSBhbmQgZGlzcGF0Y2ggZXZlbnRzLlxuICAgKi9cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1uYW1lc3BhY2VcbiAgZXhwb3J0IG5hbWVzcGFjZSBEZWJ1Z0xvZyB7XG4gICAgZXhwb3J0IHR5cGUgRW50cnkgPVxuICAgICAgfCBUZW1wbGF0ZVByZXBcbiAgICAgIHwgVGVtcGxhdGVJbnN0YW50aWF0ZWRcbiAgICAgIHwgVGVtcGxhdGVJbnN0YW50aWF0ZWRBbmRVcGRhdGVkXG4gICAgICB8IFRlbXBsYXRlVXBkYXRpbmdcbiAgICAgIHwgQmVnaW5SZW5kZXJcbiAgICAgIHwgRW5kUmVuZGVyXG4gICAgICB8IENvbW1pdFBhcnRFbnRyeVxuICAgICAgfCBTZXRQYXJ0VmFsdWU7XG4gICAgZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZVByZXAge1xuICAgICAga2luZDogJ3RlbXBsYXRlIHByZXAnO1xuICAgICAgdGVtcGxhdGU6IFRlbXBsYXRlO1xuICAgICAgc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXk7XG4gICAgICBjbG9uYWJsZVRlbXBsYXRlOiBIVE1MVGVtcGxhdGVFbGVtZW50O1xuICAgICAgcGFydHM6IFRlbXBsYXRlUGFydFtdO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIEJlZ2luUmVuZGVyIHtcbiAgICAgIGtpbmQ6ICdiZWdpbiByZW5kZXInO1xuICAgICAgaWQ6IG51bWJlcjtcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgY29udGFpbmVyOiBIVE1MRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQ7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgcGFydDogQ2hpbGRQYXJ0IHwgdW5kZWZpbmVkO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIEVuZFJlbmRlciB7XG4gICAgICBraW5kOiAnZW5kIHJlbmRlcic7XG4gICAgICBpZDogbnVtYmVyO1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBjb250YWluZXI6IEhUTUxFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudDtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBwYXJ0OiBDaGlsZFBhcnQ7XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVJbnN0YW50aWF0ZWQge1xuICAgICAga2luZDogJ3RlbXBsYXRlIGluc3RhbnRpYXRlZCc7XG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBDb21waWxlZFRlbXBsYXRlO1xuICAgICAgaW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2U7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgZnJhZ21lbnQ6IE5vZGU7XG4gICAgICBwYXJ0czogQXJyYXk8UGFydCB8IHVuZGVmaW5lZD47XG4gICAgICB2YWx1ZXM6IHVua25vd25bXTtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZUluc3RhbnRpYXRlZEFuZFVwZGF0ZWQge1xuICAgICAga2luZDogJ3RlbXBsYXRlIGluc3RhbnRpYXRlZCBhbmQgdXBkYXRlZCc7XG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBDb21waWxlZFRlbXBsYXRlO1xuICAgICAgaW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2U7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgZnJhZ21lbnQ6IE5vZGU7XG4gICAgICBwYXJ0czogQXJyYXk8UGFydCB8IHVuZGVmaW5lZD47XG4gICAgICB2YWx1ZXM6IHVua25vd25bXTtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZVVwZGF0aW5nIHtcbiAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSB1cGRhdGluZyc7XG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBDb21waWxlZFRlbXBsYXRlO1xuICAgICAgaW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2U7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgcGFydHM6IEFycmF5PFBhcnQgfCB1bmRlZmluZWQ+O1xuICAgICAgdmFsdWVzOiB1bmtub3duW107XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgU2V0UGFydFZhbHVlIHtcbiAgICAgIGtpbmQ6ICdzZXQgcGFydCc7XG4gICAgICBwYXJ0OiBQYXJ0O1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICB2YWx1ZUluZGV4OiBudW1iZXI7XG4gICAgICB2YWx1ZXM6IHVua25vd25bXTtcbiAgICAgIHRlbXBsYXRlSW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2U7XG4gICAgfVxuXG4gICAgZXhwb3J0IHR5cGUgQ29tbWl0UGFydEVudHJ5ID1cbiAgICAgIHwgQ29tbWl0Tm90aGluZ1RvQ2hpbGRFbnRyeVxuICAgICAgfCBDb21taXRUZXh0XG4gICAgICB8IENvbW1pdE5vZGVcbiAgICAgIHwgQ29tbWl0QXR0cmlidXRlXG4gICAgICB8IENvbW1pdFByb3BlcnR5XG4gICAgICB8IENvbW1pdEJvb2xlYW5BdHRyaWJ1dGVcbiAgICAgIHwgQ29tbWl0RXZlbnRMaXN0ZW5lclxuICAgICAgfCBDb21taXRUb0VsZW1lbnRCaW5kaW5nO1xuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXROb3RoaW5nVG9DaGlsZEVudHJ5IHtcbiAgICAgIGtpbmQ6ICdjb21taXQgbm90aGluZyB0byBjaGlsZCc7XG4gICAgICBzdGFydDogQ2hpbGROb2RlO1xuICAgICAgZW5kOiBDaGlsZE5vZGUgfCBudWxsO1xuICAgICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSB8IHVuZGVmaW5lZDtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRUZXh0IHtcbiAgICAgIGtpbmQ6ICdjb21taXQgdGV4dCc7XG4gICAgICBub2RlOiBUZXh0O1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0Tm9kZSB7XG4gICAgICBraW5kOiAnY29tbWl0IG5vZGUnO1xuICAgICAgc3RhcnQ6IE5vZGU7XG4gICAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlIHwgdW5kZWZpbmVkO1xuICAgICAgdmFsdWU6IE5vZGU7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0QXR0cmlidXRlIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgYXR0cmlidXRlJztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRQcm9wZXJ0eSB7XG4gICAgICBraW5kOiAnY29tbWl0IHByb3BlcnR5JztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRCb29sZWFuQXR0cmlidXRlIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgYm9vbGVhbiBhdHRyaWJ1dGUnO1xuICAgICAgZWxlbWVudDogRWxlbWVudDtcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgIHZhbHVlOiBib29sZWFuO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdEV2ZW50TGlzdGVuZXIge1xuICAgICAga2luZDogJ2NvbW1pdCBldmVudCBsaXN0ZW5lcic7XG4gICAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBvbGRMaXN0ZW5lcjogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICAvLyBUcnVlIGlmIHdlJ3JlIHJlbW92aW5nIHRoZSBvbGQgZXZlbnQgbGlzdGVuZXIgKGUuZy4gYmVjYXVzZSBzZXR0aW5ncyBjaGFuZ2VkLCBvciB2YWx1ZSBpcyBub3RoaW5nKVxuICAgICAgcmVtb3ZlTGlzdGVuZXI6IGJvb2xlYW47XG4gICAgICAvLyBUcnVlIGlmIHdlJ3JlIGFkZGluZyBhIG5ldyBldmVudCBsaXN0ZW5lciAoZS5nLiBiZWNhdXNlIGZpcnN0IHJlbmRlciwgb3Igc2V0dGluZ3MgY2hhbmdlZClcbiAgICAgIGFkZExpc3RlbmVyOiBib29sZWFuO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0VG9FbGVtZW50QmluZGluZyB7XG4gICAgICBraW5kOiAnY29tbWl0IHRvIGVsZW1lbnQgYmluZGluZyc7XG4gICAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufVxuXG5pbnRlcmZhY2UgRGVidWdMb2dnaW5nV2luZG93IHtcbiAgLy8gRXZlbiBpbiBkZXYgbW9kZSwgd2UgZ2VuZXJhbGx5IGRvbid0IHdhbnQgdG8gZW1pdCB0aGVzZSBldmVudHMsIGFzIHRoYXQnc1xuICAvLyBhbm90aGVyIGxldmVsIG9mIGNvc3QsIHNvIG9ubHkgZW1pdCB0aGVtIHdoZW4gREVWX01PREUgaXMgdHJ1ZSBfYW5kXyB3aGVuXG4gIC8vIHdpbmRvdy5lbWl0TGl0RGVidWdFdmVudHMgaXMgdHJ1ZS5cbiAgZW1pdExpdERlYnVnTG9nRXZlbnRzPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBVc2VmdWwgZm9yIHZpc3VhbGl6aW5nIGFuZCBsb2dnaW5nIGluc2lnaHRzIGludG8gd2hhdCB0aGUgTGl0IHRlbXBsYXRlIHN5c3RlbSBpcyBkb2luZy5cbiAqXG4gKiBDb21waWxlZCBvdXQgb2YgcHJvZCBtb2RlIGJ1aWxkcy5cbiAqL1xuY29uc3QgZGVidWdMb2dFdmVudCA9IERFVl9NT0RFXG4gID8gKGV2ZW50OiBMaXRVbnN0YWJsZS5EZWJ1Z0xvZy5FbnRyeSkgPT4ge1xuICAgICAgY29uc3Qgc2hvdWxkRW1pdCA9IChnbG9iYWwgYXMgdW5rbm93biBhcyBEZWJ1Z0xvZ2dpbmdXaW5kb3cpXG4gICAgICAgIC5lbWl0TGl0RGVidWdMb2dFdmVudHM7XG4gICAgICBpZiAoIXNob3VsZEVtaXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZ2xvYmFsLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudDxMaXRVbnN0YWJsZS5EZWJ1Z0xvZy5FbnRyeT4oJ2xpdC1kZWJ1ZycsIHtcbiAgICAgICAgICBkZXRhaWw6IGV2ZW50LFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gIDogdW5kZWZpbmVkO1xuLy8gVXNlZCBmb3IgY29ubmVjdGluZyBiZWdpblJlbmRlciBhbmQgZW5kUmVuZGVyIGV2ZW50cyB3aGVuIHRoZXJlIGFyZSBuZXN0ZWRcbi8vIHJlbmRlcnMgd2hlbiBlcnJvcnMgYXJlIHRocm93biBwcmV2ZW50aW5nIGFuIGVuZFJlbmRlciBldmVudCBmcm9tIGJlaW5nXG4vLyBjYWxsZWQuXG5sZXQgZGVidWdMb2dSZW5kZXJJZCA9IDA7XG5cbmxldCBpc3N1ZVdhcm5pbmc6IChjb2RlOiBzdHJpbmcsIHdhcm5pbmc6IHN0cmluZykgPT4gdm9pZDtcblxuaWYgKERFVl9NT0RFKSB7XG4gIGdsb2JhbC5saXRJc3N1ZWRXYXJuaW5ncyA/Pz0gbmV3IFNldCgpO1xuXG4gIC8vIElzc3VlIGEgd2FybmluZywgaWYgd2UgaGF2ZW4ndCBhbHJlYWR5LlxuICBpc3N1ZVdhcm5pbmcgPSAoY29kZTogc3RyaW5nLCB3YXJuaW5nOiBzdHJpbmcpID0+IHtcbiAgICB3YXJuaW5nICs9IGNvZGVcbiAgICAgID8gYCBTZWUgaHR0cHM6Ly9saXQuZGV2L21zZy8ke2NvZGV9IGZvciBtb3JlIGluZm9ybWF0aW9uLmBcbiAgICAgIDogJyc7XG4gICAgaWYgKCFnbG9iYWwubGl0SXNzdWVkV2FybmluZ3MhLmhhcyh3YXJuaW5nKSkge1xuICAgICAgY29uc29sZS53YXJuKHdhcm5pbmcpO1xuICAgICAgZ2xvYmFsLmxpdElzc3VlZFdhcm5pbmdzIS5hZGQod2FybmluZyk7XG4gICAgfVxuICB9O1xuXG4gIGlzc3VlV2FybmluZyhcbiAgICAnZGV2LW1vZGUnLFxuICAgIGBMaXQgaXMgaW4gZGV2IG1vZGUuIE5vdCByZWNvbW1lbmRlZCBmb3IgcHJvZHVjdGlvbiFgXG4gICk7XG59XG5cbmNvbnN0IHdyYXAgPVxuICBFTkFCTEVfU0hBRFlET01fTk9QQVRDSCAmJlxuICBnbG9iYWwuU2hhZHlET00/LmluVXNlICYmXG4gIGdsb2JhbC5TaGFkeURPTT8ubm9QYXRjaCA9PT0gdHJ1ZVxuICAgID8gKGdsb2JhbC5TaGFkeURPTSEud3JhcCBhcyA8VCBleHRlbmRzIE5vZGU+KG5vZGU6IFQpID0+IFQpXG4gICAgOiA8VCBleHRlbmRzIE5vZGU+KG5vZGU6IFQpID0+IG5vZGU7XG5cbmNvbnN0IHRydXN0ZWRUeXBlcyA9IChnbG9iYWwgYXMgdW5rbm93biBhcyBUcnVzdGVkVHlwZXNXaW5kb3cpLnRydXN0ZWRUeXBlcztcblxuLyoqXG4gKiBPdXIgVHJ1c3RlZFR5cGVQb2xpY3kgZm9yIEhUTUwgd2hpY2ggaXMgZGVjbGFyZWQgdXNpbmcgdGhlIGh0bWwgdGVtcGxhdGVcbiAqIHRhZyBmdW5jdGlvbi5cbiAqXG4gKiBUaGF0IEhUTUwgaXMgYSBkZXZlbG9wZXItYXV0aG9yZWQgY29uc3RhbnQsIGFuZCBpcyBwYXJzZWQgd2l0aCBpbm5lckhUTUxcbiAqIGJlZm9yZSBhbnkgdW50cnVzdGVkIGV4cHJlc3Npb25zIGhhdmUgYmVlbiBtaXhlZCBpbi4gVGhlcmVmb3IgaXQgaXNcbiAqIGNvbnNpZGVyZWQgc2FmZSBieSBjb25zdHJ1Y3Rpb24uXG4gKi9cbmNvbnN0IHBvbGljeSA9IHRydXN0ZWRUeXBlc1xuICA/IHRydXN0ZWRUeXBlcy5jcmVhdGVQb2xpY3koJ2xpdC1odG1sJywge1xuICAgICAgY3JlYXRlSFRNTDogKHMpID0+IHMsXG4gICAgfSlcbiAgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVXNlZCB0byBzYW5pdGl6ZSBhbnkgdmFsdWUgYmVmb3JlIGl0IGlzIHdyaXR0ZW4gaW50byB0aGUgRE9NLiBUaGlzIGNhbiBiZVxuICogdXNlZCB0byBpbXBsZW1lbnQgYSBzZWN1cml0eSBwb2xpY3kgb2YgYWxsb3dlZCBhbmQgZGlzYWxsb3dlZCB2YWx1ZXMgaW5cbiAqIG9yZGVyIHRvIHByZXZlbnQgWFNTIGF0dGFja3MuXG4gKlxuICogT25lIHdheSBvZiB1c2luZyB0aGlzIGNhbGxiYWNrIHdvdWxkIGJlIHRvIGNoZWNrIGF0dHJpYnV0ZXMgYW5kIHByb3BlcnRpZXNcbiAqIGFnYWluc3QgYSBsaXN0IG9mIGhpZ2ggcmlzayBmaWVsZHMsIGFuZCByZXF1aXJlIHRoYXQgdmFsdWVzIHdyaXR0ZW4gdG8gc3VjaFxuICogZmllbGRzIGJlIGluc3RhbmNlcyBvZiBhIGNsYXNzIHdoaWNoIGlzIHNhZmUgYnkgY29uc3RydWN0aW9uLiBDbG9zdXJlJ3MgU2FmZVxuICogSFRNTCBUeXBlcyBpcyBvbmUgaW1wbGVtZW50YXRpb24gb2YgdGhpcyB0ZWNobmlxdWUgKFxuICogaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9zYWZlLWh0bWwtdHlwZXMvYmxvYi9tYXN0ZXIvZG9jL3NhZmVodG1sLXR5cGVzLm1kKS5cbiAqIFRoZSBUcnVzdGVkVHlwZXMgcG9seWZpbGwgaW4gQVBJLW9ubHkgbW9kZSBjb3VsZCBhbHNvIGJlIHVzZWQgYXMgYSBiYXNpc1xuICogZm9yIHRoaXMgdGVjaG5pcXVlIChodHRwczovL2dpdGh1Yi5jb20vV0lDRy90cnVzdGVkLXR5cGVzKS5cbiAqXG4gKiBAcGFyYW0gbm9kZSBUaGUgSFRNTCBub2RlICh1c3VhbGx5IGVpdGhlciBhICN0ZXh0IG5vZGUgb3IgYW4gRWxlbWVudCkgdGhhdFxuICogICAgIGlzIGJlaW5nIHdyaXR0ZW4gdG8uIE5vdGUgdGhhdCB0aGlzIGlzIGp1c3QgYW4gZXhlbXBsYXIgbm9kZSwgdGhlIHdyaXRlXG4gKiAgICAgbWF5IHRha2UgcGxhY2UgYWdhaW5zdCBhbm90aGVyIGluc3RhbmNlIG9mIHRoZSBzYW1lIGNsYXNzIG9mIG5vZGUuXG4gKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiBhbiBhdHRyaWJ1dGUgb3IgcHJvcGVydHkgKGZvciBleGFtcGxlLCAnaHJlZicpLlxuICogQHBhcmFtIHR5cGUgSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHdyaXRlIHRoYXQncyBhYm91dCB0byBiZSBwZXJmb3JtZWQgd2lsbFxuICogICAgIGJlIHRvIGEgcHJvcGVydHkgb3IgYSBub2RlLlxuICogQHJldHVybiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBzYW5pdGl6ZSB0aGlzIGNsYXNzIG9mIHdyaXRlcy5cbiAqL1xuZXhwb3J0IHR5cGUgU2FuaXRpemVyRmFjdG9yeSA9IChcbiAgbm9kZTogTm9kZSxcbiAgbmFtZTogc3RyaW5nLFxuICB0eXBlOiAncHJvcGVydHknIHwgJ2F0dHJpYnV0ZSdcbikgPT4gVmFsdWVTYW5pdGl6ZXI7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB3aGljaCBjYW4gc2FuaXRpemUgdmFsdWVzIHRoYXQgd2lsbCBiZSB3cml0dGVuIHRvIGEgc3BlY2lmaWMga2luZFxuICogb2YgRE9NIHNpbmsuXG4gKlxuICogU2VlIFNhbml0aXplckZhY3RvcnkuXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBzYW5pdGl6ZS4gV2lsbCBiZSB0aGUgYWN0dWFsIHZhbHVlIHBhc3NlZCBpbnRvXG4gKiAgICAgdGhlIGxpdC1odG1sIHRlbXBsYXRlIGxpdGVyYWwsIHNvIHRoaXMgY291bGQgYmUgb2YgYW55IHR5cGUuXG4gKiBAcmV0dXJuIFRoZSB2YWx1ZSB0byB3cml0ZSB0byB0aGUgRE9NLiBVc3VhbGx5IHRoZSBzYW1lIGFzIHRoZSBpbnB1dCB2YWx1ZSxcbiAqICAgICB1bmxlc3Mgc2FuaXRpemF0aW9uIGlzIG5lZWRlZC5cbiAqL1xuZXhwb3J0IHR5cGUgVmFsdWVTYW5pdGl6ZXIgPSAodmFsdWU6IHVua25vd24pID0+IHVua25vd247XG5cbmNvbnN0IGlkZW50aXR5RnVuY3Rpb246IFZhbHVlU2FuaXRpemVyID0gKHZhbHVlOiB1bmtub3duKSA9PiB2YWx1ZTtcbmNvbnN0IG5vb3BTYW5pdGl6ZXI6IFNhbml0aXplckZhY3RvcnkgPSAoXG4gIF9ub2RlOiBOb2RlLFxuICBfbmFtZTogc3RyaW5nLFxuICBfdHlwZTogJ3Byb3BlcnR5JyB8ICdhdHRyaWJ1dGUnXG4pID0+IGlkZW50aXR5RnVuY3Rpb247XG5cbi8qKiBTZXRzIHRoZSBnbG9iYWwgc2FuaXRpemVyIGZhY3RvcnkuICovXG5jb25zdCBzZXRTYW5pdGl6ZXIgPSAobmV3U2FuaXRpemVyOiBTYW5pdGl6ZXJGYWN0b3J5KSA9PiB7XG4gIGlmICghRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwgIT09IG5vb3BTYW5pdGl6ZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgQXR0ZW1wdGVkIHRvIG92ZXJ3cml0ZSBleGlzdGluZyBsaXQtaHRtbCBzZWN1cml0eSBwb2xpY3kuYCArXG4gICAgICAgIGAgc2V0U2FuaXRpemVET01WYWx1ZUZhY3Rvcnkgc2hvdWxkIGJlIGNhbGxlZCBhdCBtb3N0IG9uY2UuYFxuICAgICk7XG4gIH1cbiAgc2FuaXRpemVyRmFjdG9yeUludGVybmFsID0gbmV3U2FuaXRpemVyO1xufTtcblxuLyoqXG4gKiBPbmx5IHVzZWQgaW4gaW50ZXJuYWwgdGVzdHMsIG5vdCBhIHBhcnQgb2YgdGhlIHB1YmxpYyBBUEkuXG4gKi9cbmNvbnN0IF90ZXN0T25seUNsZWFyU2FuaXRpemVyRmFjdG9yeURvTm90Q2FsbE9yRWxzZSA9ICgpID0+IHtcbiAgc2FuaXRpemVyRmFjdG9yeUludGVybmFsID0gbm9vcFNhbml0aXplcjtcbn07XG5cbmNvbnN0IGNyZWF0ZVNhbml0aXplcjogU2FuaXRpemVyRmFjdG9yeSA9IChub2RlLCBuYW1lLCB0eXBlKSA9PiB7XG4gIHJldHVybiBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwobm9kZSwgbmFtZSwgdHlwZSk7XG59O1xuXG4vLyBBZGRlZCB0byBhbiBhdHRyaWJ1dGUgbmFtZSB0byBtYXJrIHRoZSBhdHRyaWJ1dGUgYXMgYm91bmQgc28gd2UgY2FuIGZpbmRcbi8vIGl0IGVhc2lseS5cbmNvbnN0IGJvdW5kQXR0cmlidXRlU3VmZml4ID0gJyRsaXQkJztcblxuLy8gVGhpcyBtYXJrZXIgaXMgdXNlZCBpbiBtYW55IHN5bnRhY3RpYyBwb3NpdGlvbnMgaW4gSFRNTCwgc28gaXQgbXVzdCBiZVxuLy8gYSB2YWxpZCBlbGVtZW50IG5hbWUgYW5kIGF0dHJpYnV0ZSBuYW1lLiBXZSBkb24ndCBzdXBwb3J0IGR5bmFtaWMgbmFtZXMgKHlldClcbi8vIGJ1dCB0aGlzIGF0IGxlYXN0IGVuc3VyZXMgdGhhdCB0aGUgcGFyc2UgdHJlZSBpcyBjbG9zZXIgdG8gdGhlIHRlbXBsYXRlXG4vLyBpbnRlbnRpb24uXG5jb25zdCBtYXJrZXIgPSBgbGl0JCR7TWF0aC5yYW5kb20oKS50b0ZpeGVkKDkpLnNsaWNlKDIpfSRgO1xuXG4vLyBTdHJpbmcgdXNlZCB0byB0ZWxsIGlmIGEgY29tbWVudCBpcyBhIG1hcmtlciBjb21tZW50XG5jb25zdCBtYXJrZXJNYXRjaCA9ICc/JyArIG1hcmtlcjtcblxuLy8gVGV4dCB1c2VkIHRvIGluc2VydCBhIGNvbW1lbnQgbWFya2VyIG5vZGUuIFdlIHVzZSBwcm9jZXNzaW5nIGluc3RydWN0aW9uXG4vLyBzeW50YXggYmVjYXVzZSBpdCdzIHNsaWdodGx5IHNtYWxsZXIsIGJ1dCBwYXJzZXMgYXMgYSBjb21tZW50IG5vZGUuXG5jb25zdCBub2RlTWFya2VyID0gYDwke21hcmtlck1hdGNofT5gO1xuXG5jb25zdCBkID1cbiAgTk9ERV9NT0RFICYmIGdsb2JhbC5kb2N1bWVudCA9PT0gdW5kZWZpbmVkXG4gICAgPyAoe1xuICAgICAgICBjcmVhdGVUcmVlV2Fsa2VyKCkge1xuICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfSxcbiAgICAgIH0gYXMgdW5rbm93biBhcyBEb2N1bWVudClcbiAgICA6IGRvY3VtZW50O1xuXG4vLyBDcmVhdGVzIGEgZHluYW1pYyBtYXJrZXIuIFdlIG5ldmVyIGhhdmUgdG8gc2VhcmNoIGZvciB0aGVzZSBpbiB0aGUgRE9NLlxuY29uc3QgY3JlYXRlTWFya2VyID0gKCkgPT4gZC5jcmVhdGVDb21tZW50KCcnKTtcblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdHlwZW9mLW9wZXJhdG9yXG50eXBlIFByaW1pdGl2ZSA9IG51bGwgfCB1bmRlZmluZWQgfCBib29sZWFuIHwgbnVtYmVyIHwgc3RyaW5nIHwgc3ltYm9sIHwgYmlnaW50O1xuY29uc3QgaXNQcmltaXRpdmUgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBQcmltaXRpdmUgPT5cbiAgdmFsdWUgPT09IG51bGwgfHwgKHR5cGVvZiB2YWx1ZSAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUgIT0gJ2Z1bmN0aW9uJyk7XG5jb25zdCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbmNvbnN0IGlzSXRlcmFibGUgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBJdGVyYWJsZTx1bmtub3duPiA9PlxuICBpc0FycmF5KHZhbHVlKSB8fFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICB0eXBlb2YgKHZhbHVlIGFzIGFueSk/LltTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nO1xuXG5jb25zdCBTUEFDRV9DSEFSID0gYFsgXFx0XFxuXFxmXFxyXWA7XG5jb25zdCBBVFRSX1ZBTFVFX0NIQVIgPSBgW14gXFx0XFxuXFxmXFxyXCInXFxgPD49XWA7XG5jb25zdCBOQU1FX0NIQVIgPSBgW15cXFxcc1wiJz49L11gO1xuXG4vLyBUaGVzZSByZWdleGVzIHJlcHJlc2VudCB0aGUgZml2ZSBwYXJzaW5nIHN0YXRlcyB0aGF0IHdlIGNhcmUgYWJvdXQgaW4gdGhlXG4vLyBUZW1wbGF0ZSdzIEhUTUwgc2Nhbm5lci4gVGhleSBtYXRjaCB0aGUgKmVuZCogb2YgdGhlIHN0YXRlIHRoZXkncmUgbmFtZWRcbi8vIGFmdGVyLlxuLy8gRGVwZW5kaW5nIG9uIHRoZSBtYXRjaCwgd2UgdHJhbnNpdGlvbiB0byBhIG5ldyBzdGF0ZS4gSWYgdGhlcmUncyBubyBtYXRjaCxcbi8vIHdlIHN0YXkgaW4gdGhlIHNhbWUgc3RhdGUuXG4vLyBOb3RlIHRoYXQgdGhlIHJlZ2V4ZXMgYXJlIHN0YXRlZnVsLiBXZSB1dGlsaXplIGxhc3RJbmRleCBhbmQgc3luYyBpdFxuLy8gYWNyb3NzIHRoZSBtdWx0aXBsZSByZWdleGVzIHVzZWQuIEluIGFkZGl0aW9uIHRvIHRoZSBmaXZlIHJlZ2V4ZXMgYmVsb3dcbi8vIHdlIGFsc28gZHluYW1pY2FsbHkgY3JlYXRlIGEgcmVnZXggdG8gZmluZCB0aGUgbWF0Y2hpbmcgZW5kIHRhZ3MgZm9yIHJhd1xuLy8gdGV4dCBlbGVtZW50cy5cblxuLyoqXG4gKiBFbmQgb2YgdGV4dCBpczogYDxgIGZvbGxvd2VkIGJ5OlxuICogICAoY29tbWVudCBzdGFydCkgb3IgKHRhZykgb3IgKGR5bmFtaWMgdGFnIGJpbmRpbmcpXG4gKi9cbmNvbnN0IHRleHRFbmRSZWdleCA9IC88KD86KCEtLXxcXC9bXmEtekEtWl0pfChcXC8/W2EtekEtWl1bXj5cXHNdKil8KFxcLz8kKSkvZztcbmNvbnN0IENPTU1FTlRfU1RBUlQgPSAxO1xuY29uc3QgVEFHX05BTUUgPSAyO1xuY29uc3QgRFlOQU1JQ19UQUdfTkFNRSA9IDM7XG5cbmNvbnN0IGNvbW1lbnRFbmRSZWdleCA9IC8tLT4vZztcbi8qKlxuICogQ29tbWVudHMgbm90IHN0YXJ0ZWQgd2l0aCA8IS0tLCBsaWtlIDwveywgY2FuIGJlIGVuZGVkIGJ5IGEgc2luZ2xlIGA+YFxuICovXG5jb25zdCBjb21tZW50MkVuZFJlZ2V4ID0gLz4vZztcblxuLyoqXG4gKiBUaGUgdGFnRW5kIHJlZ2V4IG1hdGNoZXMgdGhlIGVuZCBvZiB0aGUgXCJpbnNpZGUgYW4gb3BlbmluZ1wiIHRhZyBzeW50YXhcbiAqIHBvc2l0aW9uLiBJdCBlaXRoZXIgbWF0Y2hlcyBhIGA+YCwgYW4gYXR0cmlidXRlLWxpa2Ugc2VxdWVuY2UsIG9yIHRoZSBlbmRcbiAqIG9mIHRoZSBzdHJpbmcgYWZ0ZXIgYSBzcGFjZSAoYXR0cmlidXRlLW5hbWUgcG9zaXRpb24gZW5kaW5nKS5cbiAqXG4gKiBTZWUgYXR0cmlidXRlcyBpbiB0aGUgSFRNTCBzcGVjOlxuICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L3N5bnRheC5odG1sI2VsZW1lbnRzLWF0dHJpYnV0ZXNcbiAqXG4gKiBcIiBcXHRcXG5cXGZcXHJcIiBhcmUgSFRNTCBzcGFjZSBjaGFyYWN0ZXJzOlxuICogaHR0cHM6Ly9pbmZyYS5zcGVjLndoYXR3Zy5vcmcvI2FzY2lpLXdoaXRlc3BhY2VcbiAqXG4gKiBTbyBhbiBhdHRyaWJ1dGUgaXM6XG4gKiAgKiBUaGUgbmFtZTogYW55IGNoYXJhY3RlciBleGNlcHQgYSB3aGl0ZXNwYWNlIGNoYXJhY3RlciwgKFwiKSwgKCcpLCBcIj5cIixcbiAqICAgIFwiPVwiLCBvciBcIi9cIi4gTm90ZTogdGhpcyBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgSFRNTCBzcGVjIHdoaWNoIGFsc28gZXhjbHVkZXMgY29udHJvbCBjaGFyYWN0ZXJzLlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5IFwiPVwiXG4gKiAgKiBGb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVyc1xuICogICogRm9sbG93ZWQgYnk6XG4gKiAgICAqIEFueSBjaGFyYWN0ZXIgZXhjZXB0IHNwYWNlLCAoJyksIChcIiksIFwiPFwiLCBcIj5cIiwgXCI9XCIsIChgKSwgb3JcbiAqICAgICogKFwiKSB0aGVuIGFueSBub24tKFwiKSwgb3JcbiAqICAgICogKCcpIHRoZW4gYW55IG5vbi0oJylcbiAqL1xuY29uc3QgdGFnRW5kUmVnZXggPSBuZXcgUmVnRXhwKFxuICBgPnwke1NQQUNFX0NIQVJ9KD86KCR7TkFNRV9DSEFSfSspKCR7U1BBQ0VfQ0hBUn0qPSR7U1BBQ0VfQ0hBUn0qKD86JHtBVFRSX1ZBTFVFX0NIQVJ9fChcInwnKXwpKXwkKWAsXG4gICdnJ1xuKTtcbmNvbnN0IEVOVElSRV9NQVRDSCA9IDA7XG5jb25zdCBBVFRSSUJVVEVfTkFNRSA9IDE7XG5jb25zdCBTUEFDRVNfQU5EX0VRVUFMUyA9IDI7XG5jb25zdCBRVU9URV9DSEFSID0gMztcblxuY29uc3Qgc2luZ2xlUXVvdGVBdHRyRW5kUmVnZXggPSAvJy9nO1xuY29uc3QgZG91YmxlUXVvdGVBdHRyRW5kUmVnZXggPSAvXCIvZztcbi8qKlxuICogTWF0Y2hlcyB0aGUgcmF3IHRleHQgZWxlbWVudHMuXG4gKlxuICogQ29tbWVudHMgYXJlIG5vdCBwYXJzZWQgd2l0aGluIHJhdyB0ZXh0IGVsZW1lbnRzLCBzbyB3ZSBuZWVkIHRvIHNlYXJjaCB0aGVpclxuICogdGV4dCBjb250ZW50IGZvciBtYXJrZXIgc3RyaW5ncy5cbiAqL1xuY29uc3QgcmF3VGV4dEVsZW1lbnQgPSAvXig/OnNjcmlwdHxzdHlsZXx0ZXh0YXJlYXx0aXRsZSkkL2k7XG5cbi8qKiBUZW1wbGF0ZVJlc3VsdCB0eXBlcyAqL1xuY29uc3QgSFRNTF9SRVNVTFQgPSAxO1xuY29uc3QgU1ZHX1JFU1VMVCA9IDI7XG5jb25zdCBNQVRITUxfUkVTVUxUID0gMztcblxudHlwZSBSZXN1bHRUeXBlID0gdHlwZW9mIEhUTUxfUkVTVUxUIHwgdHlwZW9mIFNWR19SRVNVTFQgfCB0eXBlb2YgTUFUSE1MX1JFU1VMVDtcblxuLy8gVGVtcGxhdGVQYXJ0IHR5cGVzXG4vLyBJTVBPUlRBTlQ6IHRoZXNlIG11c3QgbWF0Y2ggdGhlIHZhbHVlcyBpbiBQYXJ0VHlwZVxuY29uc3QgQVRUUklCVVRFX1BBUlQgPSAxO1xuY29uc3QgQ0hJTERfUEFSVCA9IDI7XG5jb25zdCBQUk9QRVJUWV9QQVJUID0gMztcbmNvbnN0IEJPT0xFQU5fQVRUUklCVVRFX1BBUlQgPSA0O1xuY29uc3QgRVZFTlRfUEFSVCA9IDU7XG5jb25zdCBFTEVNRU5UX1BBUlQgPSA2O1xuY29uc3QgQ09NTUVOVF9QQVJUID0gNztcblxuLyoqXG4gKiBUaGUgcmV0dXJuIHR5cGUgb2YgdGhlIHRlbXBsYXRlIHRhZyBmdW5jdGlvbnMsIHtAbGlua2NvZGUgaHRtbH0gYW5kXG4gKiB7QGxpbmtjb2RlIHN2Z30gd2hlbiBpdCBoYXNuJ3QgYmVlbiBjb21waWxlZCBieSBAbGl0LWxhYnMvY29tcGlsZXIuXG4gKlxuICogQSBgVGVtcGxhdGVSZXN1bHRgIG9iamVjdCBob2xkcyBhbGwgdGhlIGluZm9ybWF0aW9uIGFib3V0IGEgdGVtcGxhdGVcbiAqIGV4cHJlc3Npb24gcmVxdWlyZWQgdG8gcmVuZGVyIGl0OiB0aGUgdGVtcGxhdGUgc3RyaW5ncywgZXhwcmVzc2lvbiB2YWx1ZXMsXG4gKiBhbmQgdHlwZSBvZiB0ZW1wbGF0ZSAoaHRtbCBvciBzdmcpLlxuICpcbiAqIGBUZW1wbGF0ZVJlc3VsdGAgb2JqZWN0cyBkbyBub3QgY3JlYXRlIGFueSBET00gb24gdGhlaXIgb3duLiBUbyBjcmVhdGUgb3JcbiAqIHVwZGF0ZSBET00geW91IG5lZWQgdG8gcmVuZGVyIHRoZSBgVGVtcGxhdGVSZXN1bHRgLiBTZWVcbiAqIFtSZW5kZXJpbmddKGh0dHBzOi8vbGl0LmRldi9kb2NzL2NvbXBvbmVudHMvcmVuZGVyaW5nKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKi9cbmV4cG9ydCB0eXBlIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUIGV4dGVuZHMgUmVzdWx0VHlwZSA9IFJlc3VsdFR5cGU+ID0ge1xuICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICBbJ18kbGl0VHlwZSQnXTogVDtcbiAgc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXk7XG4gIHZhbHVlczogdW5rbm93bltdO1xufTtcblxuLyoqXG4gKiBUaGlzIGlzIGEgdGVtcGxhdGUgcmVzdWx0IHRoYXQgbWF5IGJlIGVpdGhlciB1bmNvbXBpbGVkIG9yIGNvbXBpbGVkLlxuICpcbiAqIEluIHRoZSBmdXR1cmUsIFRlbXBsYXRlUmVzdWx0IHdpbGwgYmUgdGhpcyB0eXBlLiBJZiB5b3Ugd2FudCB0byBleHBsaWNpdGx5XG4gKiBub3RlIHRoYXQgYSB0ZW1wbGF0ZSByZXN1bHQgaXMgcG90ZW50aWFsbHkgY29tcGlsZWQsIHlvdSBjYW4gcmVmZXJlbmNlIHRoaXNcbiAqIHR5cGUgYW5kIGl0IHdpbGwgY29udGludWUgdG8gYmVoYXZlIHRoZSBzYW1lIHRocm91Z2ggdGhlIG5leHQgbWFqb3IgdmVyc2lvblxuICogb2YgTGl0LiBUaGlzIGNhbiBiZSB1c2VmdWwgZm9yIGNvZGUgdGhhdCB3YW50cyB0byBwcmVwYXJlIGZvciB0aGUgbmV4dFxuICogbWFqb3IgdmVyc2lvbiBvZiBMaXQuXG4gKi9cbmV4cG9ydCB0eXBlIE1heWJlQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUIGV4dGVuZHMgUmVzdWx0VHlwZSA9IFJlc3VsdFR5cGU+ID1cbiAgfCBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQ8VD5cbiAgfCBDb21waWxlZFRlbXBsYXRlUmVzdWx0O1xuXG4vKipcbiAqIFRoZSByZXR1cm4gdHlwZSBvZiB0aGUgdGVtcGxhdGUgdGFnIGZ1bmN0aW9ucywge0BsaW5rY29kZSBodG1sfSBhbmRcbiAqIHtAbGlua2NvZGUgc3ZnfS5cbiAqXG4gKiBBIGBUZW1wbGF0ZVJlc3VsdGAgb2JqZWN0IGhvbGRzIGFsbCB0aGUgaW5mb3JtYXRpb24gYWJvdXQgYSB0ZW1wbGF0ZVxuICogZXhwcmVzc2lvbiByZXF1aXJlZCB0byByZW5kZXIgaXQ6IHRoZSB0ZW1wbGF0ZSBzdHJpbmdzLCBleHByZXNzaW9uIHZhbHVlcyxcbiAqIGFuZCB0eXBlIG9mIHRlbXBsYXRlIChodG1sIG9yIHN2ZykuXG4gKlxuICogYFRlbXBsYXRlUmVzdWx0YCBvYmplY3RzIGRvIG5vdCBjcmVhdGUgYW55IERPTSBvbiB0aGVpciBvd24uIFRvIGNyZWF0ZSBvclxuICogdXBkYXRlIERPTSB5b3UgbmVlZCB0byByZW5kZXIgdGhlIGBUZW1wbGF0ZVJlc3VsdGAuIFNlZVxuICogW1JlbmRlcmluZ10oaHR0cHM6Ly9saXQuZGV2L2RvY3MvY29tcG9uZW50cy9yZW5kZXJpbmcpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIEluIExpdCA0LCB0aGlzIHR5cGUgd2lsbCBiZSBhbiBhbGlhcyBvZlxuICogTWF5YmVDb21waWxlZFRlbXBsYXRlUmVzdWx0LCBzbyB0aGF0IGNvZGUgd2lsbCBnZXQgdHlwZSBlcnJvcnMgaWYgaXQgYXNzdW1lc1xuICogdGhhdCBMaXQgdGVtcGxhdGVzIGFyZSBub3QgY29tcGlsZWQuIFdoZW4gZGVsaWJlcmF0ZWx5IHdvcmtpbmcgd2l0aCBvbmx5XG4gKiBvbmUsIHVzZSBlaXRoZXIge0BsaW5rY29kZSBDb21waWxlZFRlbXBsYXRlUmVzdWx0fSBvclxuICoge0BsaW5rY29kZSBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHR9IGV4cGxpY2l0bHkuXG4gKi9cbmV4cG9ydCB0eXBlIFRlbXBsYXRlUmVzdWx0PFQgZXh0ZW5kcyBSZXN1bHRUeXBlID0gUmVzdWx0VHlwZT4gPVxuICBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQ8VD47XG5cbmV4cG9ydCB0eXBlIEhUTUxUZW1wbGF0ZVJlc3VsdCA9IFRlbXBsYXRlUmVzdWx0PHR5cGVvZiBIVE1MX1JFU1VMVD47XG5cbmV4cG9ydCB0eXBlIFNWR1RlbXBsYXRlUmVzdWx0ID0gVGVtcGxhdGVSZXN1bHQ8dHlwZW9mIFNWR19SRVNVTFQ+O1xuXG5leHBvcnQgdHlwZSBNYXRoTUxUZW1wbGF0ZVJlc3VsdCA9IFRlbXBsYXRlUmVzdWx0PHR5cGVvZiBNQVRITUxfUkVTVUxUPjtcblxuLyoqXG4gKiBBIFRlbXBsYXRlUmVzdWx0IHRoYXQgaGFzIGJlZW4gY29tcGlsZWQgYnkgQGxpdC1sYWJzL2NvbXBpbGVyLCBza2lwcGluZyB0aGVcbiAqIHByZXBhcmUgc3RlcC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21waWxlZFRlbXBsYXRlUmVzdWx0IHtcbiAgLy8gVGhpcyBpcyBhIGZhY3RvcnkgaW4gb3JkZXIgdG8gbWFrZSB0ZW1wbGF0ZSBpbml0aWFsaXphdGlvbiBsYXp5XG4gIC8vIGFuZCBhbGxvdyBTaGFkeVJlbmRlck9wdGlvbnMgc2NvcGUgdG8gYmUgcGFzc2VkIGluLlxuICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICBbJ18kbGl0VHlwZSQnXTogQ29tcGlsZWRUZW1wbGF0ZTtcbiAgdmFsdWVzOiB1bmtub3duW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZWRUZW1wbGF0ZSBleHRlbmRzIE9taXQ8VGVtcGxhdGUsICdlbCc+IHtcbiAgLy8gZWwgaXMgb3ZlcnJpZGRlbiB0byBiZSBvcHRpb25hbC4gV2UgaW5pdGlhbGl6ZSBpdCBvbiBmaXJzdCByZW5kZXJcbiAgZWw/OiBIVE1MVGVtcGxhdGVFbGVtZW50O1xuXG4gIC8vIFRoZSBwcmVwYXJlZCBIVE1MIHN0cmluZyB0byBjcmVhdGUgYSB0ZW1wbGF0ZSBlbGVtZW50IGZyb20uXG4gIC8vIFRoZSB0eXBlIGlzIGEgVGVtcGxhdGVTdHJpbmdzQXJyYXkgdG8gZ3VhcmFudGVlIHRoYXQgdGhlIHZhbHVlIGNhbWUgZnJvbVxuICAvLyBzb3VyY2UgY29kZSwgcHJldmVudGluZyBhIEpTT04gaW5qZWN0aW9uIGF0dGFjay5cbiAgaDogVGVtcGxhdGVTdHJpbmdzQXJyYXk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgdGVtcGxhdGUgbGl0ZXJhbCB0YWcgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgVGVtcGxhdGVSZXN1bHQgd2l0aFxuICogdGhlIGdpdmVuIHJlc3VsdCB0eXBlLlxuICovXG5jb25zdCB0YWcgPVxuICA8VCBleHRlbmRzIFJlc3VsdFR5cGU+KHR5cGU6IFQpID0+XG4gIChzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4udmFsdWVzOiB1bmtub3duW10pOiBUZW1wbGF0ZVJlc3VsdDxUPiA9PiB7XG4gICAgLy8gV2FybiBhZ2FpbnN0IHRlbXBsYXRlcyBvY3RhbCBlc2NhcGUgc2VxdWVuY2VzXG4gICAgLy8gV2UgZG8gdGhpcyBoZXJlIHJhdGhlciB0aGFuIGluIHJlbmRlciBzbyB0aGF0IHRoZSB3YXJuaW5nIGlzIGNsb3NlciB0byB0aGVcbiAgICAvLyB0ZW1wbGF0ZSBkZWZpbml0aW9uLlxuICAgIGlmIChERVZfTU9ERSAmJiBzdHJpbmdzLnNvbWUoKHMpID0+IHMgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgJ1NvbWUgdGVtcGxhdGUgc3RyaW5ncyBhcmUgdW5kZWZpbmVkLlxcbicgK1xuICAgICAgICAgICdUaGlzIGlzIHByb2JhYmx5IGNhdXNlZCBieSBpbGxlZ2FsIG9jdGFsIGVzY2FwZSBzZXF1ZW5jZXMuJ1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAvLyBJbXBvcnQgc3RhdGljLWh0bWwuanMgcmVzdWx0cyBpbiBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgd2hpY2ggZzMgZG9lc24ndFxuICAgICAgLy8gaGFuZGxlLiBJbnN0ZWFkIHdlIGtub3cgdGhhdCBzdGF0aWMgdmFsdWVzIG11c3QgaGF2ZSB0aGUgZmllbGRcbiAgICAgIC8vIGBfJGxpdFN0YXRpYyRgLlxuICAgICAgaWYgKFxuICAgICAgICB2YWx1ZXMuc29tZSgodmFsKSA9PiAodmFsIGFzIHtfJGxpdFN0YXRpYyQ6IHVua25vd259KT8uWydfJGxpdFN0YXRpYyQnXSlcbiAgICAgICkge1xuICAgICAgICBpc3N1ZVdhcm5pbmcoXG4gICAgICAgICAgJycsXG4gICAgICAgICAgYFN0YXRpYyB2YWx1ZXMgJ2xpdGVyYWwnIG9yICd1bnNhZmVTdGF0aWMnIGNhbm5vdCBiZSB1c2VkIGFzIHZhbHVlcyB0byBub24tc3RhdGljIHRlbXBsYXRlcy5cXG5gICtcbiAgICAgICAgICAgIGBQbGVhc2UgdXNlIHRoZSBzdGF0aWMgJ2h0bWwnIHRhZyBmdW5jdGlvbi4gU2VlIGh0dHBzOi8vbGl0LmRldi9kb2NzL3RlbXBsYXRlcy9leHByZXNzaW9ucy8jc3RhdGljLWV4cHJlc3Npb25zYFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICAgIFsnXyRsaXRUeXBlJCddOiB0eXBlLFxuICAgICAgc3RyaW5ncyxcbiAgICAgIHZhbHVlcyxcbiAgICB9O1xuICB9O1xuXG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIEhUTUwgdGVtcGxhdGUgdGhhdCBjYW4gZWZmaWNpZW50bHlcbiAqIHJlbmRlciB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBoZWFkZXIgPSAodGl0bGU6IHN0cmluZykgPT4gaHRtbGA8aDE+JHt0aXRsZX08L2gxPmA7XG4gKiBgYGBcbiAqXG4gKiBUaGUgYGh0bWxgIHRhZyByZXR1cm5zIGEgZGVzY3JpcHRpb24gb2YgdGhlIERPTSB0byByZW5kZXIgYXMgYSB2YWx1ZS4gSXQgaXNcbiAqIGxhenksIG1lYW5pbmcgbm8gd29yayBpcyBkb25lIHVudGlsIHRoZSB0ZW1wbGF0ZSBpcyByZW5kZXJlZC4gV2hlbiByZW5kZXJpbmcsXG4gKiBpZiBhIHRlbXBsYXRlIGNvbWVzIGZyb20gdGhlIHNhbWUgZXhwcmVzc2lvbiBhcyBhIHByZXZpb3VzbHkgcmVuZGVyZWQgcmVzdWx0LFxuICogaXQncyBlZmZpY2llbnRseSB1cGRhdGVkIGluc3RlYWQgb2YgcmVwbGFjZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBodG1sID0gdGFnKEhUTUxfUkVTVUxUKTtcblxuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhbiBTVkcgZnJhZ21lbnQgdGhhdCBjYW4gZWZmaWNpZW50bHkgcmVuZGVyXG4gKiB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCByZWN0ID0gc3ZnYDxyZWN0IHdpZHRoPVwiMTBcIiBoZWlnaHQ9XCIxMFwiPjwvcmVjdD5gO1xuICpcbiAqIGNvbnN0IG15SW1hZ2UgPSBodG1sYFxuICogICA8c3ZnIHZpZXdCb3g9XCIwIDAgMTAgMTBcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gKiAgICAgJHtyZWN0fVxuICogICA8L3N2Zz5gO1xuICogYGBgXG4gKlxuICogVGhlIGBzdmdgICp0YWcgZnVuY3Rpb24qIHNob3VsZCBvbmx5IGJlIHVzZWQgZm9yIFNWRyBmcmFnbWVudHMsIG9yIGVsZW1lbnRzXG4gKiB0aGF0IHdvdWxkIGJlIGNvbnRhaW5lZCAqKmluc2lkZSoqIGFuIGA8c3ZnPmAgSFRNTCBlbGVtZW50LiBBIGNvbW1vbiBlcnJvciBpc1xuICogcGxhY2luZyBhbiBgPHN2Zz5gICplbGVtZW50KiBpbiBhIHRlbXBsYXRlIHRhZ2dlZCB3aXRoIHRoZSBgc3ZnYCB0YWdcbiAqIGZ1bmN0aW9uLiBUaGUgYDxzdmc+YCBlbGVtZW50IGlzIGFuIEhUTUwgZWxlbWVudCBhbmQgc2hvdWxkIGJlIHVzZWQgd2l0aGluIGFcbiAqIHRlbXBsYXRlIHRhZ2dlZCB3aXRoIHRoZSB7QGxpbmtjb2RlIGh0bWx9IHRhZyBmdW5jdGlvbi5cbiAqXG4gKiBJbiBMaXRFbGVtZW50IHVzYWdlLCBpdCdzIGludmFsaWQgdG8gcmV0dXJuIGFuIFNWRyBmcmFnbWVudCBmcm9tIHRoZVxuICogYHJlbmRlcigpYCBtZXRob2QsIGFzIHRoZSBTVkcgZnJhZ21lbnQgd2lsbCBiZSBjb250YWluZWQgd2l0aGluIHRoZSBlbGVtZW50J3NcbiAqIHNoYWRvdyByb290IGFuZCB0aHVzIG5vdCBiZSBwcm9wZXJseSBjb250YWluZWQgd2l0aGluIGFuIGA8c3ZnPmAgSFRNTFxuICogZWxlbWVudC5cbiAqL1xuZXhwb3J0IGNvbnN0IHN2ZyA9IHRhZyhTVkdfUkVTVUxUKTtcblxuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBNYXRoTUwgZnJhZ21lbnQgdGhhdCBjYW4gZWZmaWNpZW50bHkgcmVuZGVyXG4gKiB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBudW0gPSBtYXRobWxgPG1uPjE8L21uPmA7XG4gKlxuICogY29uc3QgZXEgPSBodG1sYFxuICogICA8bWF0aD5cbiAqICAgICAke251bX1cbiAqICAgPC9tYXRoPmA7XG4gKiBgYGBcbiAqXG4gKiBUaGUgYG1hdGhtbGAgKnRhZyBmdW5jdGlvbiogc2hvdWxkIG9ubHkgYmUgdXNlZCBmb3IgTWF0aE1MIGZyYWdtZW50cywgb3JcbiAqIGVsZW1lbnRzIHRoYXQgd291bGQgYmUgY29udGFpbmVkICoqaW5zaWRlKiogYSBgPG1hdGg+YCBIVE1MIGVsZW1lbnQuIEEgY29tbW9uXG4gKiBlcnJvciBpcyBwbGFjaW5nIGEgYDxtYXRoPmAgKmVsZW1lbnQqIGluIGEgdGVtcGxhdGUgdGFnZ2VkIHdpdGggdGhlIGBtYXRobWxgXG4gKiB0YWcgZnVuY3Rpb24uIFRoZSBgPG1hdGg+YCBlbGVtZW50IGlzIGFuIEhUTUwgZWxlbWVudCBhbmQgc2hvdWxkIGJlIHVzZWRcbiAqIHdpdGhpbiBhIHRlbXBsYXRlIHRhZ2dlZCB3aXRoIHRoZSB7QGxpbmtjb2RlIGh0bWx9IHRhZyBmdW5jdGlvbi5cbiAqXG4gKiBJbiBMaXRFbGVtZW50IHVzYWdlLCBpdCdzIGludmFsaWQgdG8gcmV0dXJuIGFuIE1hdGhNTCBmcmFnbWVudCBmcm9tIHRoZVxuICogYHJlbmRlcigpYCBtZXRob2QsIGFzIHRoZSBNYXRoTUwgZnJhZ21lbnQgd2lsbCBiZSBjb250YWluZWQgd2l0aGluIHRoZVxuICogZWxlbWVudCdzIHNoYWRvdyByb290IGFuZCB0aHVzIG5vdCBiZSBwcm9wZXJseSBjb250YWluZWQgd2l0aGluIGEgYDxtYXRoPmBcbiAqIEhUTUwgZWxlbWVudC5cbiAqL1xuZXhwb3J0IGNvbnN0IG1hdGhtbCA9IHRhZyhNQVRITUxfUkVTVUxUKTtcblxuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHRoYXQgc2lnbmFscyB0aGF0IGEgdmFsdWUgd2FzIGhhbmRsZWQgYnkgYSBkaXJlY3RpdmUgYW5kXG4gKiBzaG91bGQgbm90IGJlIHdyaXR0ZW4gdG8gdGhlIERPTS5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vQ2hhbmdlID0gU3ltYm9sLmZvcignbGl0LW5vQ2hhbmdlJyk7XG5cbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgYSBDaGlsZFBhcnQgdG8gZnVsbHkgY2xlYXIgaXRzIGNvbnRlbnQuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IGJ1dHRvbiA9IGh0bWxgJHtcbiAqICB1c2VyLmlzQWRtaW5cbiAqICAgID8gaHRtbGA8YnV0dG9uPkRFTEVURTwvYnV0dG9uPmBcbiAqICAgIDogbm90aGluZ1xuICogfWA7XG4gKiBgYGBcbiAqXG4gKiBQcmVmZXIgdXNpbmcgYG5vdGhpbmdgIG92ZXIgb3RoZXIgZmFsc3kgdmFsdWVzIGFzIGl0IHByb3ZpZGVzIGEgY29uc2lzdGVudFxuICogYmVoYXZpb3IgYmV0d2VlbiB2YXJpb3VzIGV4cHJlc3Npb24gYmluZGluZyBjb250ZXh0cy5cbiAqXG4gKiBJbiBjaGlsZCBleHByZXNzaW9ucywgYHVuZGVmaW5lZGAsIGBudWxsYCwgYCcnYCwgYW5kIGBub3RoaW5nYCBhbGwgYmVoYXZlIHRoZVxuICogc2FtZSBhbmQgcmVuZGVyIG5vIG5vZGVzLiBJbiBhdHRyaWJ1dGUgZXhwcmVzc2lvbnMsIGBub3RoaW5nYCBfcmVtb3Zlc18gdGhlXG4gKiBhdHRyaWJ1dGUsIHdoaWxlIGB1bmRlZmluZWRgIGFuZCBgbnVsbGAgd2lsbCByZW5kZXIgYW4gZW1wdHkgc3RyaW5nLiBJblxuICogcHJvcGVydHkgZXhwcmVzc2lvbnMgYG5vdGhpbmdgIGJlY29tZXMgYHVuZGVmaW5lZGAuXG4gKi9cbmV4cG9ydCBjb25zdCBub3RoaW5nID0gU3ltYm9sLmZvcignbGl0LW5vdGhpbmcnKTtcblxuLyoqXG4gKiBUaGUgY2FjaGUgb2YgcHJlcGFyZWQgdGVtcGxhdGVzLCBrZXllZCBieSB0aGUgdGFnZ2VkIFRlbXBsYXRlU3RyaW5nc0FycmF5XG4gKiBhbmQgX25vdF8gYWNjb3VudGluZyBmb3IgdGhlIHNwZWNpZmljIHRlbXBsYXRlIHRhZyB1c2VkLiBUaGlzIG1lYW5zIHRoYXRcbiAqIHRlbXBsYXRlIHRhZ3MgY2Fubm90IGJlIGR5bmFtaWMgLSB0aGV5IG11c3Qgc3RhdGljYWxseSBiZSBvbmUgb2YgaHRtbCwgc3ZnLFxuICogb3IgYXR0ci4gVGhpcyByZXN0cmljdGlvbiBzaW1wbGlmaWVzIHRoZSBjYWNoZSBsb29rdXAsIHdoaWNoIGlzIG9uIHRoZSBob3RcbiAqIHBhdGggZm9yIHJlbmRlcmluZy5cbiAqL1xuY29uc3QgdGVtcGxhdGVDYWNoZSA9IG5ldyBXZWFrTWFwPFRlbXBsYXRlU3RyaW5nc0FycmF5LCBUZW1wbGF0ZT4oKTtcblxuLyoqXG4gKiBPYmplY3Qgc3BlY2lmeWluZyBvcHRpb25zIGZvciBjb250cm9sbGluZyBsaXQtaHRtbCByZW5kZXJpbmcuIE5vdGUgdGhhdFxuICogd2hpbGUgYHJlbmRlcmAgbWF5IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBvbiB0aGUgc2FtZSBgY29udGFpbmVyYCAoYW5kXG4gKiBgcmVuZGVyQmVmb3JlYCByZWZlcmVuY2Ugbm9kZSkgdG8gZWZmaWNpZW50bHkgdXBkYXRlIHRoZSByZW5kZXJlZCBjb250ZW50LFxuICogb25seSB0aGUgb3B0aW9ucyBwYXNzZWQgaW4gZHVyaW5nIHRoZSBmaXJzdCByZW5kZXIgYXJlIHJlc3BlY3RlZCBkdXJpbmdcbiAqIHRoZSBsaWZldGltZSBvZiByZW5kZXJzIHRvIHRoYXQgdW5pcXVlIGBjb250YWluZXJgICsgYHJlbmRlckJlZm9yZWBcbiAqIGNvbWJpbmF0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlck9wdGlvbnMge1xuICAvKipcbiAgICogQW4gb2JqZWN0IHRvIHVzZSBhcyB0aGUgYHRoaXNgIHZhbHVlIGZvciBldmVudCBsaXN0ZW5lcnMuIEl0J3Mgb2Z0ZW5cbiAgICogdXNlZnVsIHRvIHNldCB0aGlzIHRvIHRoZSBob3N0IGNvbXBvbmVudCByZW5kZXJpbmcgYSB0ZW1wbGF0ZS5cbiAgICovXG4gIGhvc3Q/OiBvYmplY3Q7XG4gIC8qKlxuICAgKiBBIERPTSBub2RlIGJlZm9yZSB3aGljaCB0byByZW5kZXIgY29udGVudCBpbiB0aGUgY29udGFpbmVyLlxuICAgKi9cbiAgcmVuZGVyQmVmb3JlPzogQ2hpbGROb2RlIHwgbnVsbDtcbiAgLyoqXG4gICAqIE5vZGUgdXNlZCBmb3IgY2xvbmluZyB0aGUgdGVtcGxhdGUgKGBpbXBvcnROb2RlYCB3aWxsIGJlIGNhbGxlZCBvbiB0aGlzXG4gICAqIG5vZGUpLiBUaGlzIGNvbnRyb2xzIHRoZSBgb3duZXJEb2N1bWVudGAgb2YgdGhlIHJlbmRlcmVkIERPTSwgYWxvbmcgd2l0aFxuICAgKiBhbnkgaW5oZXJpdGVkIGNvbnRleHQuIERlZmF1bHRzIHRvIHRoZSBnbG9iYWwgYGRvY3VtZW50YC5cbiAgICovXG4gIGNyZWF0aW9uU2NvcGU/OiB7aW1wb3J0Tm9kZShub2RlOiBOb2RlLCBkZWVwPzogYm9vbGVhbik6IE5vZGV9O1xuICAvKipcbiAgICogVGhlIGluaXRpYWwgY29ubmVjdGVkIHN0YXRlIGZvciB0aGUgdG9wLWxldmVsIHBhcnQgYmVpbmcgcmVuZGVyZWQuIElmIG5vXG4gICAqIGBpc0Nvbm5lY3RlZGAgb3B0aW9uIGlzIHNldCwgYEFzeW5jRGlyZWN0aXZlYHMgd2lsbCBiZSBjb25uZWN0ZWQgYnlcbiAgICogZGVmYXVsdC4gU2V0IHRvIGBmYWxzZWAgaWYgdGhlIGluaXRpYWwgcmVuZGVyIG9jY3VycyBpbiBhIGRpc2Nvbm5lY3RlZCB0cmVlXG4gICAqIGFuZCBgQXN5bmNEaXJlY3RpdmVgcyBzaG91bGQgc2VlIGBpc0Nvbm5lY3RlZCA9PT0gZmFsc2VgIGZvciB0aGVpciBpbml0aWFsXG4gICAqIHJlbmRlci4gVGhlIGBwYXJ0LnNldENvbm5lY3RlZCgpYCBtZXRob2QgbXVzdCBiZSB1c2VkIHN1YnNlcXVlbnQgdG8gaW5pdGlhbFxuICAgKiByZW5kZXIgdG8gY2hhbmdlIHRoZSBjb25uZWN0ZWQgc3RhdGUgb2YgdGhlIHBhcnQuXG4gICAqL1xuICBpc0Nvbm5lY3RlZD86IGJvb2xlYW47XG59XG5cbmNvbnN0IHdhbGtlciA9IGQuY3JlYXRlVHJlZVdhbGtlcihcbiAgZCxcbiAgMTI5IC8qIE5vZGVGaWx0ZXIuU0hPV197RUxFTUVOVHxDT01NRU5UfSAqL1xuKTtcblxubGV0IHNhbml0aXplckZhY3RvcnlJbnRlcm5hbDogU2FuaXRpemVyRmFjdG9yeSA9IG5vb3BTYW5pdGl6ZXI7XG5cbi8vXG4vLyBDbGFzc2VzIG9ubHkgYmVsb3cgaGVyZSwgY29uc3QgdmFyaWFibGUgZGVjbGFyYXRpb25zIG9ubHkgYWJvdmUgaGVyZS4uLlxuLy9cbi8vIEtlZXBpbmcgdmFyaWFibGUgZGVjbGFyYXRpb25zIGFuZCBjbGFzc2VzIHRvZ2V0aGVyIGltcHJvdmVzIG1pbmlmaWNhdGlvbi5cbi8vIEludGVyZmFjZXMgYW5kIHR5cGUgYWxpYXNlcyBjYW4gYmUgaW50ZXJsZWF2ZWQgZnJlZWx5LlxuLy9cblxuLy8gVHlwZSBmb3IgY2xhc3NlcyB0aGF0IGhhdmUgYSBgX2RpcmVjdGl2ZWAgb3IgYF9kaXJlY3RpdmVzW11gIGZpZWxkLCB1c2VkIGJ5XG4vLyBgcmVzb2x2ZURpcmVjdGl2ZWBcbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0aXZlUGFyZW50IHtcbiAgXyRwYXJlbnQ/OiBEaXJlY3RpdmVQYXJlbnQ7XG4gIF8kaXNDb25uZWN0ZWQ6IGJvb2xlYW47XG4gIF9fZGlyZWN0aXZlPzogRGlyZWN0aXZlO1xuICBfX2RpcmVjdGl2ZXM/OiBBcnJheTxEaXJlY3RpdmUgfCB1bmRlZmluZWQ+O1xufVxuXG5mdW5jdGlvbiB0cnVzdEZyb21UZW1wbGF0ZVN0cmluZyhcbiAgdHNhOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSxcbiAgc3RyaW5nRnJvbVRTQTogc3RyaW5nXG4pOiBUcnVzdGVkSFRNTCB7XG4gIC8vIEEgc2VjdXJpdHkgY2hlY2sgdG8gcHJldmVudCBzcG9vZmluZyBvZiBMaXQgdGVtcGxhdGUgcmVzdWx0cy5cbiAgLy8gSW4gdGhlIGZ1dHVyZSwgd2UgbWF5IGJlIGFibGUgdG8gcmVwbGFjZSB0aGlzIHdpdGggQXJyYXkuaXNUZW1wbGF0ZU9iamVjdCxcbiAgLy8gdGhvdWdoIHdlIG1pZ2h0IG5lZWQgdG8gbWFrZSB0aGF0IGNoZWNrIGluc2lkZSBvZiB0aGUgaHRtbCBhbmQgc3ZnXG4gIC8vIGZ1bmN0aW9ucywgYmVjYXVzZSBwcmVjb21waWxlZCB0ZW1wbGF0ZXMgZG9uJ3QgY29tZSBpbiBhc1xuICAvLyBUZW1wbGF0ZVN0cmluZ0FycmF5IG9iamVjdHMuXG4gIGlmICghaXNBcnJheSh0c2EpIHx8ICF0c2EuaGFzT3duUHJvcGVydHkoJ3JhdycpKSB7XG4gICAgbGV0IG1lc3NhZ2UgPSAnaW52YWxpZCB0ZW1wbGF0ZSBzdHJpbmdzIGFycmF5JztcbiAgICBpZiAoREVWX01PREUpIHtcbiAgICAgIG1lc3NhZ2UgPSBgXG4gICAgICAgICAgSW50ZXJuYWwgRXJyb3I6IGV4cGVjdGVkIHRlbXBsYXRlIHN0cmluZ3MgdG8gYmUgYW4gYXJyYXlcbiAgICAgICAgICB3aXRoIGEgJ3JhdycgZmllbGQuIEZha2luZyBhIHRlbXBsYXRlIHN0cmluZ3MgYXJyYXkgYnlcbiAgICAgICAgICBjYWxsaW5nIGh0bWwgb3Igc3ZnIGxpa2UgYW4gb3JkaW5hcnkgZnVuY3Rpb24gaXMgZWZmZWN0aXZlbHlcbiAgICAgICAgICB0aGUgc2FtZSBhcyBjYWxsaW5nIHVuc2FmZUh0bWwgYW5kIGNhbiBsZWFkIHRvIG1ham9yIHNlY3VyaXR5XG4gICAgICAgICAgaXNzdWVzLCBlLmcuIG9wZW5pbmcgeW91ciBjb2RlIHVwIHRvIFhTUyBhdHRhY2tzLlxuICAgICAgICAgIElmIHlvdSdyZSB1c2luZyB0aGUgaHRtbCBvciBzdmcgdGFnZ2VkIHRlbXBsYXRlIGZ1bmN0aW9ucyBub3JtYWxseVxuICAgICAgICAgIGFuZCBzdGlsbCBzZWVpbmcgdGhpcyBlcnJvciwgcGxlYXNlIGZpbGUgYSBidWcgYXRcbiAgICAgICAgICBodHRwczovL2dpdGh1Yi5jb20vbGl0L2xpdC9pc3N1ZXMvbmV3P3RlbXBsYXRlPWJ1Z19yZXBvcnQubWRcbiAgICAgICAgICBhbmQgaW5jbHVkZSBpbmZvcm1hdGlvbiBhYm91dCB5b3VyIGJ1aWxkIHRvb2xpbmcsIGlmIGFueS5cbiAgICAgICAgYFxuICAgICAgICAudHJpbSgpXG4gICAgICAgIC5yZXBsYWNlKC9cXG4gKi9nLCAnXFxuJyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgfVxuICByZXR1cm4gcG9saWN5ICE9PSB1bmRlZmluZWRcbiAgICA/IHBvbGljeS5jcmVhdGVIVE1MKHN0cmluZ0Zyb21UU0EpXG4gICAgOiAoc3RyaW5nRnJvbVRTQSBhcyB1bmtub3duIGFzIFRydXN0ZWRIVE1MKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIEhUTUwgc3RyaW5nIGZvciB0aGUgZ2l2ZW4gVGVtcGxhdGVTdHJpbmdzQXJyYXkgYW5kIHJlc3VsdCB0eXBlXG4gKiAoSFRNTCBvciBTVkcpLCBhbG9uZyB3aXRoIHRoZSBjYXNlLXNlbnNpdGl2ZSBib3VuZCBhdHRyaWJ1dGUgbmFtZXMgaW5cbiAqIHRlbXBsYXRlIG9yZGVyLiBUaGUgSFRNTCBjb250YWlucyBjb21tZW50IG1hcmtlcnMgZGVub3RpbmcgdGhlIGBDaGlsZFBhcnRgc1xuICogYW5kIHN1ZmZpeGVzIG9uIGJvdW5kIGF0dHJpYnV0ZXMgZGVub3RpbmcgdGhlIGBBdHRyaWJ1dGVQYXJ0c2AuXG4gKlxuICogQHBhcmFtIHN0cmluZ3MgdGVtcGxhdGUgc3RyaW5ncyBhcnJheVxuICogQHBhcmFtIHR5cGUgSFRNTCBvciBTVkdcbiAqIEByZXR1cm4gQXJyYXkgY29udGFpbmluZyBgW2h0bWwsIGF0dHJOYW1lc11gIChhcnJheSByZXR1cm5lZCBmb3IgdGVyc2VuZXNzLFxuICogICAgIHRvIGF2b2lkIG9iamVjdCBmaWVsZHMgc2luY2UgdGhpcyBjb2RlIGlzIHNoYXJlZCB3aXRoIG5vbi1taW5pZmllZCBTU1JcbiAqICAgICBjb2RlKVxuICovXG5jb25zdCBnZXRUZW1wbGF0ZUh0bWwgPSAoXG4gIHN0cmluZ3M6IFRlbXBsYXRlU3RyaW5nc0FycmF5LFxuICB0eXBlOiBSZXN1bHRUeXBlXG4pOiBbVHJ1c3RlZEhUTUwsIEFycmF5PHN0cmluZz5dID0+IHtcbiAgLy8gSW5zZXJ0IG1ha2VycyBpbnRvIHRoZSB0ZW1wbGF0ZSBIVE1MIHRvIHJlcHJlc2VudCB0aGUgcG9zaXRpb24gb2ZcbiAgLy8gYmluZGluZ3MuIFRoZSBmb2xsb3dpbmcgY29kZSBzY2FucyB0aGUgdGVtcGxhdGUgc3RyaW5ncyB0byBkZXRlcm1pbmUgdGhlXG4gIC8vIHN5bnRhY3RpYyBwb3NpdGlvbiBvZiB0aGUgYmluZGluZ3MuIFRoZXkgY2FuIGJlIGluIHRleHQgcG9zaXRpb24sIHdoZXJlXG4gIC8vIHdlIGluc2VydCBhbiBIVE1MIGNvbW1lbnQsIGF0dHJpYnV0ZSB2YWx1ZSBwb3NpdGlvbiwgd2hlcmUgd2UgaW5zZXJ0IGFcbiAgLy8gc2VudGluZWwgc3RyaW5nIGFuZCByZS13cml0ZSB0aGUgYXR0cmlidXRlIG5hbWUsIG9yIGluc2lkZSBhIHRhZyB3aGVyZVxuICAvLyB3ZSBpbnNlcnQgdGhlIHNlbnRpbmVsIHN0cmluZy5cbiAgY29uc3QgbCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgLy8gU3RvcmVzIHRoZSBjYXNlLXNlbnNpdGl2ZSBib3VuZCBhdHRyaWJ1dGUgbmFtZXMgaW4gdGhlIG9yZGVyIG9mIHRoZWlyXG4gIC8vIHBhcnRzLiBFbGVtZW50UGFydHMgYXJlIGFsc28gcmVmbGVjdGVkIGluIHRoaXMgYXJyYXkgYXMgdW5kZWZpbmVkXG4gIC8vIHJhdGhlciB0aGFuIGEgc3RyaW5nLCB0byBkaXNhbWJpZ3VhdGUgZnJvbSBhdHRyaWJ1dGUgYmluZGluZ3MuXG4gIGNvbnN0IGF0dHJOYW1lczogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICBsZXQgaHRtbCA9XG4gICAgdHlwZSA9PT0gU1ZHX1JFU1VMVCA/ICc8c3ZnPicgOiB0eXBlID09PSBNQVRITUxfUkVTVUxUID8gJzxtYXRoPicgOiAnJztcblxuICAvLyBXaGVuIHdlJ3JlIGluc2lkZSBhIHJhdyB0ZXh0IHRhZyAobm90IGl0J3MgdGV4dCBjb250ZW50KSwgdGhlIHJlZ2V4XG4gIC8vIHdpbGwgc3RpbGwgYmUgdGFnUmVnZXggc28gd2UgY2FuIGZpbmQgYXR0cmlidXRlcywgYnV0IHdpbGwgc3dpdGNoIHRvXG4gIC8vIHRoaXMgcmVnZXggd2hlbiB0aGUgdGFnIGVuZHMuXG4gIGxldCByYXdUZXh0RW5kUmVnZXg6IFJlZ0V4cCB8IHVuZGVmaW5lZDtcblxuICAvLyBUaGUgY3VycmVudCBwYXJzaW5nIHN0YXRlLCByZXByZXNlbnRlZCBhcyBhIHJlZmVyZW5jZSB0byBvbmUgb2YgdGhlXG4gIC8vIHJlZ2V4ZXNcbiAgbGV0IHJlZ2V4ID0gdGV4dEVuZFJlZ2V4O1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgY29uc3QgcyA9IHN0cmluZ3NbaV07XG4gICAgLy8gVGhlIGluZGV4IG9mIHRoZSBlbmQgb2YgdGhlIGxhc3QgYXR0cmlidXRlIG5hbWUuIFdoZW4gdGhpcyBpc1xuICAgIC8vIHBvc2l0aXZlIGF0IGVuZCBvZiBhIHN0cmluZywgaXQgbWVhbnMgd2UncmUgaW4gYW4gYXR0cmlidXRlIHZhbHVlXG4gICAgLy8gcG9zaXRpb24gYW5kIG5lZWQgdG8gcmV3cml0ZSB0aGUgYXR0cmlidXRlIG5hbWUuXG4gICAgLy8gV2UgYWxzbyB1c2UgYSBzcGVjaWFsIHZhbHVlIG9mIC0yIHRvIGluZGljYXRlIHRoYXQgd2UgZW5jb3VudGVyZWRcbiAgICAvLyB0aGUgZW5kIG9mIGEgc3RyaW5nIGluIGF0dHJpYnV0ZSBuYW1lIHBvc2l0aW9uLlxuICAgIGxldCBhdHRyTmFtZUVuZEluZGV4ID0gLTE7XG4gICAgbGV0IGF0dHJOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgbGV0IGxhc3RJbmRleCA9IDA7XG4gICAgbGV0IG1hdGNoITogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcblxuICAgIC8vIFRoZSBjb25kaXRpb25zIGluIHRoaXMgbG9vcCBoYW5kbGUgdGhlIGN1cnJlbnQgcGFyc2Ugc3RhdGUsIGFuZCB0aGVcbiAgICAvLyBhc3NpZ25tZW50cyB0byB0aGUgYHJlZ2V4YCB2YXJpYWJsZSBhcmUgdGhlIHN0YXRlIHRyYW5zaXRpb25zLlxuICAgIHdoaWxlIChsYXN0SW5kZXggPCBzLmxlbmd0aCkge1xuICAgICAgLy8gTWFrZSBzdXJlIHdlIHN0YXJ0IHNlYXJjaGluZyBmcm9tIHdoZXJlIHdlIHByZXZpb3VzbHkgbGVmdCBvZmZcbiAgICAgIHJlZ2V4Lmxhc3RJbmRleCA9IGxhc3RJbmRleDtcbiAgICAgIG1hdGNoID0gcmVnZXguZXhlYyhzKTtcbiAgICAgIGlmIChtYXRjaCA9PT0gbnVsbCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGxhc3RJbmRleCA9IHJlZ2V4Lmxhc3RJbmRleDtcbiAgICAgIGlmIChyZWdleCA9PT0gdGV4dEVuZFJlZ2V4KSB7XG4gICAgICAgIGlmIChtYXRjaFtDT01NRU5UX1NUQVJUXSA9PT0gJyEtLScpIHtcbiAgICAgICAgICByZWdleCA9IGNvbW1lbnRFbmRSZWdleDtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFtDT01NRU5UX1NUQVJUXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gV2Ugc3RhcnRlZCBhIHdlaXJkIGNvbW1lbnQsIGxpa2UgPC97XG4gICAgICAgICAgcmVnZXggPSBjb21tZW50MkVuZFJlZ2V4O1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoW1RBR19OQU1FXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKHJhd1RleHRFbGVtZW50LnRlc3QobWF0Y2hbVEFHX05BTUVdKSkge1xuICAgICAgICAgICAgLy8gUmVjb3JkIGlmIHdlIGVuY291bnRlciBhIHJhdy10ZXh0IGVsZW1lbnQuIFdlJ2xsIHN3aXRjaCB0b1xuICAgICAgICAgICAgLy8gdGhpcyByZWdleCBhdCB0aGUgZW5kIG9mIHRoZSB0YWcuXG4gICAgICAgICAgICByYXdUZXh0RW5kUmVnZXggPSBuZXcgUmVnRXhwKGA8LyR7bWF0Y2hbVEFHX05BTUVdfWAsICdnJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZ2V4ID0gdGFnRW5kUmVnZXg7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbRFlOQU1JQ19UQUdfTkFNRV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnQmluZGluZ3MgaW4gdGFnIG5hbWVzIGFyZSBub3Qgc3VwcG9ydGVkLiBQbGVhc2UgdXNlIHN0YXRpYyB0ZW1wbGF0ZXMgaW5zdGVhZC4gJyArXG4gICAgICAgICAgICAgICAgJ1NlZSBodHRwczovL2xpdC5kZXYvZG9jcy90ZW1wbGF0ZXMvZXhwcmVzc2lvbnMvI3N0YXRpYy1leHByZXNzaW9ucydcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZ2V4ID0gdGFnRW5kUmVnZXg7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocmVnZXggPT09IHRhZ0VuZFJlZ2V4KSB7XG4gICAgICAgIGlmIChtYXRjaFtFTlRJUkVfTUFUQ0hdID09PSAnPicpIHtcbiAgICAgICAgICAvLyBFbmQgb2YgYSB0YWcuIElmIHdlIGhhZCBzdGFydGVkIGEgcmF3LXRleHQgZWxlbWVudCwgdXNlIHRoYXRcbiAgICAgICAgICAvLyByZWdleFxuICAgICAgICAgIHJlZ2V4ID0gcmF3VGV4dEVuZFJlZ2V4ID8/IHRleHRFbmRSZWdleDtcbiAgICAgICAgICAvLyBXZSBtYXkgYmUgZW5kaW5nIGFuIHVucXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZSwgc28gbWFrZSBzdXJlIHdlXG4gICAgICAgICAgLy8gY2xlYXIgYW55IHBlbmRpbmcgYXR0ck5hbWVFbmRJbmRleFxuICAgICAgICAgIGF0dHJOYW1lRW5kSW5kZXggPSAtMTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFtBVFRSSUJVVEVfTkFNRV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIEF0dHJpYnV0ZSBuYW1lIHBvc2l0aW9uXG4gICAgICAgICAgYXR0ck5hbWVFbmRJbmRleCA9IC0yO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF0dHJOYW1lRW5kSW5kZXggPSByZWdleC5sYXN0SW5kZXggLSBtYXRjaFtTUEFDRVNfQU5EX0VRVUFMU10ubGVuZ3RoO1xuICAgICAgICAgIGF0dHJOYW1lID0gbWF0Y2hbQVRUUklCVVRFX05BTUVdO1xuICAgICAgICAgIHJlZ2V4ID1cbiAgICAgICAgICAgIG1hdGNoW1FVT1RFX0NIQVJdID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgPyB0YWdFbmRSZWdleFxuICAgICAgICAgICAgICA6IG1hdGNoW1FVT1RFX0NIQVJdID09PSAnXCInXG4gICAgICAgICAgICAgICAgPyBkb3VibGVRdW90ZUF0dHJFbmRSZWdleFxuICAgICAgICAgICAgICAgIDogc2luZ2xlUXVvdGVBdHRyRW5kUmVnZXg7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHJlZ2V4ID09PSBkb3VibGVRdW90ZUF0dHJFbmRSZWdleCB8fFxuICAgICAgICByZWdleCA9PT0gc2luZ2xlUXVvdGVBdHRyRW5kUmVnZXhcbiAgICAgICkge1xuICAgICAgICByZWdleCA9IHRhZ0VuZFJlZ2V4O1xuICAgICAgfSBlbHNlIGlmIChyZWdleCA9PT0gY29tbWVudEVuZFJlZ2V4IHx8IHJlZ2V4ID09PSBjb21tZW50MkVuZFJlZ2V4KSB7XG4gICAgICAgIHJlZ2V4ID0gdGV4dEVuZFJlZ2V4O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTm90IG9uZSBvZiB0aGUgZml2ZSBzdGF0ZSByZWdleGVzLCBzbyBpdCBtdXN0IGJlIHRoZSBkeW5hbWljYWxseVxuICAgICAgICAvLyBjcmVhdGVkIHJhdyB0ZXh0IHJlZ2V4IGFuZCB3ZSdyZSBhdCB0aGUgY2xvc2Ugb2YgdGhhdCBlbGVtZW50LlxuICAgICAgICByZWdleCA9IHRhZ0VuZFJlZ2V4O1xuICAgICAgICByYXdUZXh0RW5kUmVnZXggPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAvLyBJZiB3ZSBoYXZlIGEgYXR0ck5hbWVFbmRJbmRleCwgd2hpY2ggaW5kaWNhdGVzIHRoYXQgd2Ugc2hvdWxkXG4gICAgICAvLyByZXdyaXRlIHRoZSBhdHRyaWJ1dGUgbmFtZSwgYXNzZXJ0IHRoYXQgd2UncmUgaW4gYSB2YWxpZCBhdHRyaWJ1dGVcbiAgICAgIC8vIHBvc2l0aW9uIC0gZWl0aGVyIGluIGEgdGFnLCBvciBhIHF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUuXG4gICAgICBjb25zb2xlLmFzc2VydChcbiAgICAgICAgYXR0ck5hbWVFbmRJbmRleCA9PT0gLTEgfHxcbiAgICAgICAgICByZWdleCA9PT0gdGFnRW5kUmVnZXggfHxcbiAgICAgICAgICByZWdleCA9PT0gc2luZ2xlUXVvdGVBdHRyRW5kUmVnZXggfHxcbiAgICAgICAgICByZWdleCA9PT0gZG91YmxlUXVvdGVBdHRyRW5kUmVnZXgsXG4gICAgICAgICd1bmV4cGVjdGVkIHBhcnNlIHN0YXRlIEInXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFdlIGhhdmUgZm91ciBjYXNlczpcbiAgICAvLyAgMS4gV2UncmUgaW4gdGV4dCBwb3NpdGlvbiwgYW5kIG5vdCBpbiBhIHJhdyB0ZXh0IGVsZW1lbnRcbiAgICAvLyAgICAgKHJlZ2V4ID09PSB0ZXh0RW5kUmVnZXgpOiBpbnNlcnQgYSBjb21tZW50IG1hcmtlci5cbiAgICAvLyAgMi4gV2UgaGF2ZSBhIG5vbi1uZWdhdGl2ZSBhdHRyTmFtZUVuZEluZGV4IHdoaWNoIG1lYW5zIHdlIG5lZWQgdG9cbiAgICAvLyAgICAgcmV3cml0ZSB0aGUgYXR0cmlidXRlIG5hbWUgdG8gYWRkIGEgYm91bmQgYXR0cmlidXRlIHN1ZmZpeC5cbiAgICAvLyAgMy4gV2UncmUgYXQgdGhlIG5vbi1maXJzdCBiaW5kaW5nIGluIGEgbXVsdGktYmluZGluZyBhdHRyaWJ1dGUsIHVzZSBhXG4gICAgLy8gICAgIHBsYWluIG1hcmtlci5cbiAgICAvLyAgNC4gV2UncmUgc29tZXdoZXJlIGVsc2UgaW5zaWRlIHRoZSB0YWcuIElmIHdlJ3JlIGluIGF0dHJpYnV0ZSBuYW1lXG4gICAgLy8gICAgIHBvc2l0aW9uIChhdHRyTmFtZUVuZEluZGV4ID09PSAtMiksIGFkZCBhIHNlcXVlbnRpYWwgc3VmZml4IHRvXG4gICAgLy8gICAgIGdlbmVyYXRlIGEgdW5pcXVlIGF0dHJpYnV0ZSBuYW1lLlxuXG4gICAgLy8gRGV0ZWN0IGEgYmluZGluZyBuZXh0IHRvIHNlbGYtY2xvc2luZyB0YWcgZW5kIGFuZCBpbnNlcnQgYSBzcGFjZSB0b1xuICAgIC8vIHNlcGFyYXRlIHRoZSBtYXJrZXIgZnJvbSB0aGUgdGFnIGVuZDpcbiAgICBjb25zdCBlbmQgPVxuICAgICAgcmVnZXggPT09IHRhZ0VuZFJlZ2V4ICYmIHN0cmluZ3NbaSArIDFdLnN0YXJ0c1dpdGgoJy8+JykgPyAnICcgOiAnJztcbiAgICBodG1sICs9XG4gICAgICByZWdleCA9PT0gdGV4dEVuZFJlZ2V4XG4gICAgICAgID8gcyArIG5vZGVNYXJrZXJcbiAgICAgICAgOiBhdHRyTmFtZUVuZEluZGV4ID49IDBcbiAgICAgICAgICA/IChhdHRyTmFtZXMucHVzaChhdHRyTmFtZSEpLFxuICAgICAgICAgICAgcy5zbGljZSgwLCBhdHRyTmFtZUVuZEluZGV4KSArXG4gICAgICAgICAgICAgIGJvdW5kQXR0cmlidXRlU3VmZml4ICtcbiAgICAgICAgICAgICAgcy5zbGljZShhdHRyTmFtZUVuZEluZGV4KSkgK1xuICAgICAgICAgICAgbWFya2VyICtcbiAgICAgICAgICAgIGVuZFxuICAgICAgICAgIDogcyArIG1hcmtlciArIChhdHRyTmFtZUVuZEluZGV4ID09PSAtMiA/IGkgOiBlbmQpO1xuICB9XG5cbiAgY29uc3QgaHRtbFJlc3VsdDogc3RyaW5nIHwgVHJ1c3RlZEhUTUwgPVxuICAgIGh0bWwgK1xuICAgIChzdHJpbmdzW2xdIHx8ICc8Pz4nKSArXG4gICAgKHR5cGUgPT09IFNWR19SRVNVTFQgPyAnPC9zdmc+JyA6IHR5cGUgPT09IE1BVEhNTF9SRVNVTFQgPyAnPC9tYXRoPicgOiAnJyk7XG5cbiAgLy8gUmV0dXJuZWQgYXMgYW4gYXJyYXkgZm9yIHRlcnNlbmVzc1xuICByZXR1cm4gW3RydXN0RnJvbVRlbXBsYXRlU3RyaW5nKHN0cmluZ3MsIGh0bWxSZXN1bHQpLCBhdHRyTmFtZXNdO1xufTtcblxuLyoqIEBpbnRlcm5hbCAqL1xuZXhwb3J0IHR5cGUge1RlbXBsYXRlfTtcbmNsYXNzIFRlbXBsYXRlIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBlbCE6IEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XG5cbiAgcGFydHM6IEFycmF5PFRlbXBsYXRlUGFydD4gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIHtzdHJpbmdzLCBbJ18kbGl0VHlwZSQnXTogdHlwZX06IFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCxcbiAgICBvcHRpb25zPzogUmVuZGVyT3B0aW9uc1xuICApIHtcbiAgICBsZXQgbm9kZTogTm9kZSB8IG51bGw7XG4gICAgbGV0IG5vZGVJbmRleCA9IDA7XG4gICAgbGV0IGF0dHJOYW1lSW5kZXggPSAwO1xuICAgIGNvbnN0IHBhcnRDb3VudCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICBjb25zdCBwYXJ0cyA9IHRoaXMucGFydHM7XG5cbiAgICAvLyBDcmVhdGUgdGVtcGxhdGUgZWxlbWVudFxuICAgIGNvbnN0IFtodG1sLCBhdHRyTmFtZXNdID0gZ2V0VGVtcGxhdGVIdG1sKHN0cmluZ3MsIHR5cGUpO1xuICAgIHRoaXMuZWwgPSBUZW1wbGF0ZS5jcmVhdGVFbGVtZW50KGh0bWwsIG9wdGlvbnMpO1xuICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IHRoaXMuZWwuY29udGVudDtcblxuICAgIC8vIFJlLXBhcmVudCBTVkcgb3IgTWF0aE1MIG5vZGVzIGludG8gdGVtcGxhdGUgcm9vdFxuICAgIGlmICh0eXBlID09PSBTVkdfUkVTVUxUIHx8IHR5cGUgPT09IE1BVEhNTF9SRVNVTFQpIHtcbiAgICAgIGNvbnN0IHdyYXBwZXIgPSB0aGlzLmVsLmNvbnRlbnQuZmlyc3RDaGlsZCE7XG4gICAgICB3cmFwcGVyLnJlcGxhY2VXaXRoKC4uLndyYXBwZXIuY2hpbGROb2Rlcyk7XG4gICAgfVxuXG4gICAgLy8gV2FsayB0aGUgdGVtcGxhdGUgdG8gZmluZCBiaW5kaW5nIG1hcmtlcnMgYW5kIGNyZWF0ZSBUZW1wbGF0ZVBhcnRzXG4gICAgd2hpbGUgKChub2RlID0gd2Fsa2VyLm5leHROb2RlKCkpICE9PSBudWxsICYmIHBhcnRzLmxlbmd0aCA8IHBhcnRDb3VudCkge1xuICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAgICAgY29uc3QgdGFnID0gKG5vZGUgYXMgRWxlbWVudCkubG9jYWxOYW1lO1xuICAgICAgICAgIC8vIFdhcm4gaWYgYHRleHRhcmVhYCBpbmNsdWRlcyBhbiBleHByZXNzaW9uIGFuZCB0aHJvdyBpZiBgdGVtcGxhdGVgXG4gICAgICAgICAgLy8gZG9lcyBzaW5jZSB0aGVzZSBhcmUgbm90IHN1cHBvcnRlZC4gV2UgZG8gdGhpcyBieSBjaGVja2luZ1xuICAgICAgICAgIC8vIGlubmVySFRNTCBmb3IgYW55dGhpbmcgdGhhdCBsb29rcyBsaWtlIGEgbWFya2VyLiBUaGlzIGNhdGNoZXNcbiAgICAgICAgICAvLyBjYXNlcyBsaWtlIGJpbmRpbmdzIGluIHRleHRhcmVhIHRoZXJlIG1hcmtlcnMgdHVybiBpbnRvIHRleHQgbm9kZXMuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgL14oPzp0ZXh0YXJlYXx0ZW1wbGF0ZSkkL2khLnRlc3QodGFnKSAmJlxuICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkuaW5uZXJIVE1MLmluY2x1ZGVzKG1hcmtlcilcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IG0gPVxuICAgICAgICAgICAgICBgRXhwcmVzc2lvbnMgYXJlIG5vdCBzdXBwb3J0ZWQgaW5zaWRlIFxcYCR7dGFnfVxcYCBgICtcbiAgICAgICAgICAgICAgYGVsZW1lbnRzLiBTZWUgaHR0cHM6Ly9saXQuZGV2L21zZy9leHByZXNzaW9uLWluLSR7dGFnfSBmb3IgbW9yZSBgICtcbiAgICAgICAgICAgICAgYGluZm9ybWF0aW9uLmA7XG4gICAgICAgICAgICBpZiAodGFnID09PSAndGVtcGxhdGUnKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtKTtcbiAgICAgICAgICAgIH0gZWxzZSBpc3N1ZVdhcm5pbmcoJycsIG0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPIChqdXN0aW5mYWduYW5pKTogZm9yIGF0dGVtcHRlZCBkeW5hbWljIHRhZyBuYW1lcywgd2UgZG9uJ3RcbiAgICAgICAgLy8gaW5jcmVtZW50IHRoZSBiaW5kaW5nSW5kZXgsIGFuZCBpdCdsbCBiZSBvZmYgYnkgMSBpbiB0aGUgZWxlbWVudFxuICAgICAgICAvLyBhbmQgb2ZmIGJ5IHR3byBhZnRlciBpdC5cbiAgICAgICAgaWYgKChub2RlIGFzIEVsZW1lbnQpLmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiAobm9kZSBhcyBFbGVtZW50KS5nZXRBdHRyaWJ1dGVOYW1lcygpKSB7XG4gICAgICAgICAgICBpZiAobmFtZS5lbmRzV2l0aChib3VuZEF0dHJpYnV0ZVN1ZmZpeCkpIHtcbiAgICAgICAgICAgICAgY29uc3QgcmVhbE5hbWUgPSBhdHRyTmFtZXNbYXR0ck5hbWVJbmRleCsrXTtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSAobm9kZSBhcyBFbGVtZW50KS5nZXRBdHRyaWJ1dGUobmFtZSkhO1xuICAgICAgICAgICAgICBjb25zdCBzdGF0aWNzID0gdmFsdWUuc3BsaXQobWFya2VyKTtcbiAgICAgICAgICAgICAgY29uc3QgbSA9IC8oWy4/QF0pPyguKikvLmV4ZWMocmVhbE5hbWUpITtcbiAgICAgICAgICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogQVRUUklCVVRFX1BBUlQsXG4gICAgICAgICAgICAgICAgaW5kZXg6IG5vZGVJbmRleCxcbiAgICAgICAgICAgICAgICBuYW1lOiBtWzJdLFxuICAgICAgICAgICAgICAgIHN0cmluZ3M6IHN0YXRpY3MsXG4gICAgICAgICAgICAgICAgY3RvcjpcbiAgICAgICAgICAgICAgICAgIG1bMV0gPT09ICcuJ1xuICAgICAgICAgICAgICAgICAgICA/IFByb3BlcnR5UGFydFxuICAgICAgICAgICAgICAgICAgICA6IG1bMV0gPT09ICc/J1xuICAgICAgICAgICAgICAgICAgICAgID8gQm9vbGVhbkF0dHJpYnV0ZVBhcnRcbiAgICAgICAgICAgICAgICAgICAgICA6IG1bMV0gPT09ICdAJ1xuICAgICAgICAgICAgICAgICAgICAgICAgPyBFdmVudFBhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIDogQXR0cmlidXRlUGFydCxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmFtZS5zdGFydHNXaXRoKG1hcmtlcikpIHtcbiAgICAgICAgICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogRUxFTUVOVF9QQVJULFxuICAgICAgICAgICAgICAgIGluZGV4OiBub2RlSW5kZXgsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiBiZW5jaG1hcmsgdGhlIHJlZ2V4IGFnYWluc3QgdGVzdGluZyBmb3IgZWFjaFxuICAgICAgICAvLyBvZiB0aGUgMyByYXcgdGV4dCBlbGVtZW50IG5hbWVzLlxuICAgICAgICBpZiAocmF3VGV4dEVsZW1lbnQudGVzdCgobm9kZSBhcyBFbGVtZW50KS50YWdOYW1lKSkge1xuICAgICAgICAgIC8vIEZvciByYXcgdGV4dCBlbGVtZW50cyB3ZSBuZWVkIHRvIHNwbGl0IHRoZSB0ZXh0IGNvbnRlbnQgb25cbiAgICAgICAgICAvLyBtYXJrZXJzLCBjcmVhdGUgYSBUZXh0IG5vZGUgZm9yIGVhY2ggc2VnbWVudCwgYW5kIGNyZWF0ZVxuICAgICAgICAgIC8vIGEgVGVtcGxhdGVQYXJ0IGZvciBlYWNoIG1hcmtlci5cbiAgICAgICAgICBjb25zdCBzdHJpbmdzID0gKG5vZGUgYXMgRWxlbWVudCkudGV4dENvbnRlbnQhLnNwbGl0KG1hcmtlcik7XG4gICAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICAgIGlmIChsYXN0SW5kZXggPiAwKSB7XG4gICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS50ZXh0Q29udGVudCA9IHRydXN0ZWRUeXBlc1xuICAgICAgICAgICAgICA/ICh0cnVzdGVkVHlwZXMuZW1wdHlTY3JpcHQgYXMgdW5rbm93biBhcyAnJylcbiAgICAgICAgICAgICAgOiAnJztcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbmV3IHRleHQgbm9kZSBmb3IgZWFjaCBsaXRlcmFsIHNlY3Rpb25cbiAgICAgICAgICAgIC8vIFRoZXNlIG5vZGVzIGFyZSBhbHNvIHVzZWQgYXMgdGhlIG1hcmtlcnMgZm9yIG5vZGUgcGFydHNcbiAgICAgICAgICAgIC8vIFdlIGNhbid0IHVzZSBlbXB0eSB0ZXh0IG5vZGVzIGFzIG1hcmtlcnMgYmVjYXVzZSB0aGV5J3JlXG4gICAgICAgICAgICAvLyBub3JtYWxpemVkIHdoZW4gY2xvbmluZyBpbiBJRSAoY291bGQgc2ltcGxpZnkgd2hlblxuICAgICAgICAgICAgLy8gSUUgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZClcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFzdEluZGV4OyBpKyspIHtcbiAgICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkuYXBwZW5kKHN0cmluZ3NbaV0sIGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgICAgICAgLy8gV2FsayBwYXN0IHRoZSBtYXJrZXIgbm9kZSB3ZSBqdXN0IGFkZGVkXG4gICAgICAgICAgICAgIHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgICBwYXJ0cy5wdXNoKHt0eXBlOiBDSElMRF9QQVJULCBpbmRleDogKytub2RlSW5kZXh9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE5vdGUgYmVjYXVzZSB0aGlzIG1hcmtlciBpcyBhZGRlZCBhZnRlciB0aGUgd2Fsa2VyJ3MgY3VycmVudFxuICAgICAgICAgICAgLy8gbm9kZSwgaXQgd2lsbCBiZSB3YWxrZWQgdG8gaW4gdGhlIG91dGVyIGxvb3AgKGFuZCBpZ25vcmVkKSwgc29cbiAgICAgICAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gYWRqdXN0IG5vZGVJbmRleCBoZXJlXG4gICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5hcHBlbmQoc3RyaW5nc1tsYXN0SW5kZXhdLCBjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDgpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IChub2RlIGFzIENvbW1lbnQpLmRhdGE7XG4gICAgICAgIGlmIChkYXRhID09PSBtYXJrZXJNYXRjaCkge1xuICAgICAgICAgIHBhcnRzLnB1c2goe3R5cGU6IENISUxEX1BBUlQsIGluZGV4OiBub2RlSW5kZXh9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXQgaSA9IC0xO1xuICAgICAgICAgIHdoaWxlICgoaSA9IChub2RlIGFzIENvbW1lbnQpLmRhdGEuaW5kZXhPZihtYXJrZXIsIGkgKyAxKSkgIT09IC0xKSB7XG4gICAgICAgICAgICAvLyBDb21tZW50IG5vZGUgaGFzIGEgYmluZGluZyBtYXJrZXIgaW5zaWRlLCBtYWtlIGFuIGluYWN0aXZlIHBhcnRcbiAgICAgICAgICAgIC8vIFRoZSBiaW5kaW5nIHdvbid0IHdvcmssIGJ1dCBzdWJzZXF1ZW50IGJpbmRpbmdzIHdpbGxcbiAgICAgICAgICAgIHBhcnRzLnB1c2goe3R5cGU6IENPTU1FTlRfUEFSVCwgaW5kZXg6IG5vZGVJbmRleH0pO1xuICAgICAgICAgICAgLy8gTW92ZSB0byB0aGUgZW5kIG9mIHRoZSBtYXRjaFxuICAgICAgICAgICAgaSArPSBtYXJrZXIubGVuZ3RoIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5vZGVJbmRleCsrO1xuICAgIH1cblxuICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgLy8gSWYgdGhlcmUgd2FzIGEgZHVwbGljYXRlIGF0dHJpYnV0ZSBvbiBhIHRhZywgdGhlbiB3aGVuIHRoZSB0YWcgaXNcbiAgICAgIC8vIHBhcnNlZCBpbnRvIGFuIGVsZW1lbnQgdGhlIGF0dHJpYnV0ZSBnZXRzIGRlLWR1cGxpY2F0ZWQuIFdlIGNhbiBkZXRlY3RcbiAgICAgIC8vIHRoaXMgbWlzbWF0Y2ggaWYgd2UgaGF2ZW4ndCBwcmVjaXNlbHkgY29uc3VtZWQgZXZlcnkgYXR0cmlidXRlIG5hbWVcbiAgICAgIC8vIHdoZW4gcHJlcGFyaW5nIHRoZSB0ZW1wbGF0ZS4gVGhpcyB3b3JrcyBiZWNhdXNlIGBhdHRyTmFtZXNgIGlzIGJ1aWx0XG4gICAgICAvLyBmcm9tIHRoZSB0ZW1wbGF0ZSBzdHJpbmcgYW5kIGBhdHRyTmFtZUluZGV4YCBjb21lcyBmcm9tIHByb2Nlc3NpbmcgdGhlXG4gICAgICAvLyByZXN1bHRpbmcgRE9NLlxuICAgICAgaWYgKGF0dHJOYW1lcy5sZW5ndGggIT09IGF0dHJOYW1lSW5kZXgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBEZXRlY3RlZCBkdXBsaWNhdGUgYXR0cmlidXRlIGJpbmRpbmdzLiBUaGlzIG9jY3VycyBpZiB5b3VyIHRlbXBsYXRlIGAgK1xuICAgICAgICAgICAgYGhhcyBkdXBsaWNhdGUgYXR0cmlidXRlcyBvbiBhbiBlbGVtZW50IHRhZy4gRm9yIGV4YW1wbGUgYCArXG4gICAgICAgICAgICBgXCI8aW5wdXQgP2Rpc2FibGVkPVxcJHt0cnVlfSA/ZGlzYWJsZWQ9XFwke2ZhbHNlfT5cIiBjb250YWlucyBhIGAgK1xuICAgICAgICAgICAgYGR1cGxpY2F0ZSBcImRpc2FibGVkXCIgYXR0cmlidXRlLiBUaGUgZXJyb3Igd2FzIGRldGVjdGVkIGluIGAgK1xuICAgICAgICAgICAgYHRoZSBmb2xsb3dpbmcgdGVtcGxhdGU6IFxcbmAgK1xuICAgICAgICAgICAgJ2AnICtcbiAgICAgICAgICAgIHN0cmluZ3Muam9pbignJHsuLi59JykgK1xuICAgICAgICAgICAgJ2AnXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2UgY291bGQgc2V0IHdhbGtlci5jdXJyZW50Tm9kZSB0byBhbm90aGVyIG5vZGUgaGVyZSB0byBwcmV2ZW50IGEgbWVtb3J5XG4gICAgLy8gbGVhaywgYnV0IGV2ZXJ5IHRpbWUgd2UgcHJlcGFyZSBhIHRlbXBsYXRlLCB3ZSBpbW1lZGlhdGVseSByZW5kZXIgaXRcbiAgICAvLyBhbmQgcmUtdXNlIHRoZSB3YWxrZXIgaW4gbmV3IFRlbXBsYXRlSW5zdGFuY2UuX2Nsb25lKCkuXG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBwcmVwJyxcbiAgICAgICAgdGVtcGxhdGU6IHRoaXMsXG4gICAgICAgIGNsb25hYmxlVGVtcGxhdGU6IHRoaXMuZWwsXG4gICAgICAgIHBhcnRzOiB0aGlzLnBhcnRzLFxuICAgICAgICBzdHJpbmdzLFxuICAgICAgfSk7XG4gIH1cblxuICAvLyBPdmVycmlkZGVuIHZpYSBgbGl0SHRtbFBvbHlmaWxsU3VwcG9ydGAgdG8gcHJvdmlkZSBwbGF0Zm9ybSBzdXBwb3J0LlxuICAvKiogQG5vY29sbGFwc2UgKi9cbiAgc3RhdGljIGNyZWF0ZUVsZW1lbnQoaHRtbDogVHJ1c3RlZEhUTUwsIF9vcHRpb25zPzogUmVuZGVyT3B0aW9ucykge1xuICAgIGNvbnN0IGVsID0gZC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgIGVsLmlubmVySFRNTCA9IGh0bWwgYXMgdW5rbm93biBhcyBzdHJpbmc7XG4gICAgcmV0dXJuIGVsO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlzY29ubmVjdGFibGUge1xuICBfJHBhcmVudD86IERpc2Nvbm5lY3RhYmxlO1xuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+O1xuICAvLyBSYXRoZXIgdGhhbiBob2xkIGNvbm5lY3Rpb24gc3RhdGUgb24gaW5zdGFuY2VzLCBEaXNjb25uZWN0YWJsZXMgcmVjdXJzaXZlbHlcbiAgLy8gZmV0Y2ggdGhlIGNvbm5lY3Rpb24gc3RhdGUgZnJvbSB0aGUgUm9vdFBhcnQgdGhleSBhcmUgY29ubmVjdGVkIGluIHZpYVxuICAvLyBnZXR0ZXJzIHVwIHRoZSBEaXNjb25uZWN0YWJsZSB0cmVlIHZpYSBfJHBhcmVudCByZWZlcmVuY2VzLiBUaGlzIHB1c2hlcyB0aGVcbiAgLy8gY29zdCBvZiB0cmFja2luZyB0aGUgaXNDb25uZWN0ZWQgc3RhdGUgdG8gYEFzeW5jRGlyZWN0aXZlc2AsIGFuZCBhdm9pZHNcbiAgLy8gbmVlZGluZyB0byBwYXNzIGFsbCBEaXNjb25uZWN0YWJsZXMgKHBhcnRzLCB0ZW1wbGF0ZSBpbnN0YW5jZXMsIGFuZFxuICAvLyBkaXJlY3RpdmVzKSB0aGVpciBjb25uZWN0aW9uIHN0YXRlIGVhY2ggdGltZSBpdCBjaGFuZ2VzLCB3aGljaCB3b3VsZCBiZVxuICAvLyBjb3N0bHkgZm9yIHRyZWVzIHRoYXQgaGF2ZSBubyBBc3luY0RpcmVjdGl2ZXMuXG4gIF8kaXNDb25uZWN0ZWQ6IGJvb2xlYW47XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVEaXJlY3RpdmUoXG4gIHBhcnQ6IENoaWxkUGFydCB8IEF0dHJpYnV0ZVBhcnQgfCBFbGVtZW50UGFydCxcbiAgdmFsdWU6IHVua25vd24sXG4gIHBhcmVudDogRGlyZWN0aXZlUGFyZW50ID0gcGFydCxcbiAgYXR0cmlidXRlSW5kZXg/OiBudW1iZXJcbik6IHVua25vd24ge1xuICAvLyBCYWlsIGVhcmx5IGlmIHRoZSB2YWx1ZSBpcyBleHBsaWNpdGx5IG5vQ2hhbmdlLiBOb3RlLCB0aGlzIG1lYW5zIGFueVxuICAvLyBuZXN0ZWQgZGlyZWN0aXZlIGlzIHN0aWxsIGF0dGFjaGVkIGFuZCBpcyBub3QgcnVuLlxuICBpZiAodmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGxldCBjdXJyZW50RGlyZWN0aXZlID1cbiAgICBhdHRyaWJ1dGVJbmRleCAhPT0gdW5kZWZpbmVkXG4gICAgICA/IChwYXJlbnQgYXMgQXR0cmlidXRlUGFydCkuX19kaXJlY3RpdmVzPy5bYXR0cmlidXRlSW5kZXhdXG4gICAgICA6IChwYXJlbnQgYXMgQ2hpbGRQYXJ0IHwgRWxlbWVudFBhcnQgfCBEaXJlY3RpdmUpLl9fZGlyZWN0aXZlO1xuICBjb25zdCBuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IgPSBpc1ByaW1pdGl2ZSh2YWx1ZSlcbiAgICA/IHVuZGVmaW5lZFxuICAgIDogLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICAgICh2YWx1ZSBhcyBEaXJlY3RpdmVSZXN1bHQpWydfJGxpdERpcmVjdGl2ZSQnXTtcbiAgaWYgKGN1cnJlbnREaXJlY3RpdmU/LmNvbnN0cnVjdG9yICE9PSBuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IpIHtcbiAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIGN1cnJlbnREaXJlY3RpdmU/LlsnXyRub3RpZnlEaXJlY3RpdmVDb25uZWN0aW9uQ2hhbmdlZCddPy4oZmFsc2UpO1xuICAgIGlmIChuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY3VycmVudERpcmVjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudERpcmVjdGl2ZSA9IG5ldyBuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IocGFydCBhcyBQYXJ0SW5mbyk7XG4gICAgICBjdXJyZW50RGlyZWN0aXZlLl8kaW5pdGlhbGl6ZShwYXJ0LCBwYXJlbnQsIGF0dHJpYnV0ZUluZGV4KTtcbiAgICB9XG4gICAgaWYgKGF0dHJpYnV0ZUluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICgocGFyZW50IGFzIEF0dHJpYnV0ZVBhcnQpLl9fZGlyZWN0aXZlcyA/Pz0gW10pW2F0dHJpYnV0ZUluZGV4XSA9XG4gICAgICAgIGN1cnJlbnREaXJlY3RpdmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIChwYXJlbnQgYXMgQ2hpbGRQYXJ0IHwgRGlyZWN0aXZlKS5fX2RpcmVjdGl2ZSA9IGN1cnJlbnREaXJlY3RpdmU7XG4gICAgfVxuICB9XG4gIGlmIChjdXJyZW50RGlyZWN0aXZlICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YWx1ZSA9IHJlc29sdmVEaXJlY3RpdmUoXG4gICAgICBwYXJ0LFxuICAgICAgY3VycmVudERpcmVjdGl2ZS5fJHJlc29sdmUocGFydCwgKHZhbHVlIGFzIERpcmVjdGl2ZVJlc3VsdCkudmFsdWVzKSxcbiAgICAgIGN1cnJlbnREaXJlY3RpdmUsXG4gICAgICBhdHRyaWJ1dGVJbmRleFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgdHlwZSB7VGVtcGxhdGVJbnN0YW5jZX07XG4vKipcbiAqIEFuIHVwZGF0ZWFibGUgaW5zdGFuY2Ugb2YgYSBUZW1wbGF0ZS4gSG9sZHMgcmVmZXJlbmNlcyB0byB0aGUgUGFydHMgdXNlZCB0b1xuICogdXBkYXRlIHRoZSB0ZW1wbGF0ZSBpbnN0YW5jZS5cbiAqL1xuY2xhc3MgVGVtcGxhdGVJbnN0YW5jZSBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgXyR0ZW1wbGF0ZTogVGVtcGxhdGU7XG4gIF8kcGFydHM6IEFycmF5PFBhcnQgfCB1bmRlZmluZWQ+ID0gW107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHBhcmVudDogQ2hpbGRQYXJ0O1xuICAvKiogQGludGVybmFsICovXG4gIF8kZGlzY29ubmVjdGFibGVDaGlsZHJlbj86IFNldDxEaXNjb25uZWN0YWJsZT4gPSB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IodGVtcGxhdGU6IFRlbXBsYXRlLCBwYXJlbnQ6IENoaWxkUGFydCkge1xuICAgIHRoaXMuXyR0ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIHRoaXMuXyRwYXJlbnQgPSBwYXJlbnQ7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgQ2hpbGRQYXJ0IHBhcmVudE5vZGUgZ2V0dGVyXG4gIGdldCBwYXJlbnROb2RlKCkge1xuICAgIHJldHVybiB0aGlzLl8kcGFyZW50LnBhcmVudE5vZGU7XG4gIH1cblxuICAvLyBTZWUgY29tbWVudCBpbiBEaXNjb25uZWN0YWJsZSBpbnRlcmZhY2UgZm9yIHdoeSB0aGlzIGlzIGEgZ2V0dGVyXG4gIGdldCBfJGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl8kcGFyZW50Ll8kaXNDb25uZWN0ZWQ7XG4gIH1cblxuICAvLyBUaGlzIG1ldGhvZCBpcyBzZXBhcmF0ZSBmcm9tIHRoZSBjb25zdHJ1Y3RvciBiZWNhdXNlIHdlIG5lZWQgdG8gcmV0dXJuIGFcbiAgLy8gRG9jdW1lbnRGcmFnbWVudCBhbmQgd2UgZG9uJ3Qgd2FudCB0byBob2xkIG9udG8gaXQgd2l0aCBhbiBpbnN0YW5jZSBmaWVsZC5cbiAgX2Nsb25lKG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQpIHtcbiAgICBjb25zdCB7XG4gICAgICBlbDoge2NvbnRlbnR9LFxuICAgICAgcGFydHM6IHBhcnRzLFxuICAgIH0gPSB0aGlzLl8kdGVtcGxhdGU7XG4gICAgY29uc3QgZnJhZ21lbnQgPSAob3B0aW9ucz8uY3JlYXRpb25TY29wZSA/PyBkKS5pbXBvcnROb2RlKGNvbnRlbnQsIHRydWUpO1xuICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IGZyYWdtZW50O1xuXG4gICAgbGV0IG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKSE7XG4gICAgbGV0IG5vZGVJbmRleCA9IDA7XG4gICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgbGV0IHRlbXBsYXRlUGFydCA9IHBhcnRzWzBdO1xuXG4gICAgd2hpbGUgKHRlbXBsYXRlUGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAobm9kZUluZGV4ID09PSB0ZW1wbGF0ZVBhcnQuaW5kZXgpIHtcbiAgICAgICAgbGV0IHBhcnQ6IFBhcnQgfCB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0ZW1wbGF0ZVBhcnQudHlwZSA9PT0gQ0hJTERfUEFSVCkge1xuICAgICAgICAgIHBhcnQgPSBuZXcgQ2hpbGRQYXJ0KFxuICAgICAgICAgICAgbm9kZSBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICAgIG5vZGUubmV4dFNpYmxpbmcsXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGVtcGxhdGVQYXJ0LnR5cGUgPT09IEFUVFJJQlVURV9QQVJUKSB7XG4gICAgICAgICAgcGFydCA9IG5ldyB0ZW1wbGF0ZVBhcnQuY3RvcihcbiAgICAgICAgICAgIG5vZGUgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgICB0ZW1wbGF0ZVBhcnQubmFtZSxcbiAgICAgICAgICAgIHRlbXBsYXRlUGFydC5zdHJpbmdzLFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRlbXBsYXRlUGFydC50eXBlID09PSBFTEVNRU5UX1BBUlQpIHtcbiAgICAgICAgICBwYXJ0ID0gbmV3IEVsZW1lbnRQYXJ0KG5vZGUgYXMgSFRNTEVsZW1lbnQsIHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuXyRwYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICB0ZW1wbGF0ZVBhcnQgPSBwYXJ0c1srK3BhcnRJbmRleF07XG4gICAgICB9XG4gICAgICBpZiAobm9kZUluZGV4ICE9PSB0ZW1wbGF0ZVBhcnQ/LmluZGV4KSB7XG4gICAgICAgIG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKSE7XG4gICAgICAgIG5vZGVJbmRleCsrO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBXZSBuZWVkIHRvIHNldCB0aGUgY3VycmVudE5vZGUgYXdheSBmcm9tIHRoZSBjbG9uZWQgdHJlZSBzbyB0aGF0IHdlXG4gICAgLy8gZG9uJ3QgaG9sZCBvbnRvIHRoZSB0cmVlIGV2ZW4gaWYgdGhlIHRyZWUgaXMgZGV0YWNoZWQgYW5kIHNob3VsZCBiZVxuICAgIC8vIGZyZWVkLlxuICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IGQ7XG4gICAgcmV0dXJuIGZyYWdtZW50O1xuICB9XG5cbiAgX3VwZGF0ZSh2YWx1ZXM6IEFycmF5PHVua25vd24+KSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcGFydCBvZiB0aGlzLl8kcGFydHMpIHtcbiAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgICAga2luZDogJ3NldCBwYXJ0JyxcbiAgICAgICAgICAgIHBhcnQsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVzW2ldLFxuICAgICAgICAgICAgdmFsdWVJbmRleDogaSxcbiAgICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgICAgIHRlbXBsYXRlSW5zdGFuY2U6IHRoaXMsXG4gICAgICAgICAgfSk7XG4gICAgICAgIGlmICgocGFydCBhcyBBdHRyaWJ1dGVQYXJ0KS5zdHJpbmdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAocGFydCBhcyBBdHRyaWJ1dGVQYXJ0KS5fJHNldFZhbHVlKHZhbHVlcywgcGFydCBhcyBBdHRyaWJ1dGVQYXJ0LCBpKTtcbiAgICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIHZhbHVlcyB0aGUgcGFydCBjb25zdW1lcyBpcyBwYXJ0LnN0cmluZ3MubGVuZ3RoIC0gMVxuICAgICAgICAgIC8vIHNpbmNlIHZhbHVlcyBhcmUgaW4gYmV0d2VlbiB0ZW1wbGF0ZSBzcGFucy4gV2UgaW5jcmVtZW50IGkgYnkgMVxuICAgICAgICAgIC8vIGxhdGVyIGluIHRoZSBsb29wLCBzbyBpbmNyZW1lbnQgaXQgYnkgcGFydC5zdHJpbmdzLmxlbmd0aCAtIDIgaGVyZVxuICAgICAgICAgIGkgKz0gKHBhcnQgYXMgQXR0cmlidXRlUGFydCkuc3RyaW5ncyEubGVuZ3RoIC0gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXJ0Ll8kc2V0VmFsdWUodmFsdWVzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgfVxufVxuXG4vKlxuICogUGFydHNcbiAqL1xudHlwZSBBdHRyaWJ1dGVUZW1wbGF0ZVBhcnQgPSB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBBVFRSSUJVVEVfUEFSVDtcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICByZWFkb25seSBjdG9yOiB0eXBlb2YgQXR0cmlidXRlUGFydDtcbiAgcmVhZG9ubHkgc3RyaW5nczogUmVhZG9ubHlBcnJheTxzdHJpbmc+O1xufTtcbnR5cGUgQ2hpbGRUZW1wbGF0ZVBhcnQgPSB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBDSElMRF9QQVJUO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xufTtcbnR5cGUgRWxlbWVudFRlbXBsYXRlUGFydCA9IHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIEVMRU1FTlRfUEFSVDtcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbn07XG50eXBlIENvbW1lbnRUZW1wbGF0ZVBhcnQgPSB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBDT01NRU5UX1BBUlQ7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG59O1xuXG4vKipcbiAqIEEgVGVtcGxhdGVQYXJ0IHJlcHJlc2VudHMgYSBkeW5hbWljIHBhcnQgaW4gYSB0ZW1wbGF0ZSwgYmVmb3JlIHRoZSB0ZW1wbGF0ZVxuICogaXMgaW5zdGFudGlhdGVkLiBXaGVuIGEgdGVtcGxhdGUgaXMgaW5zdGFudGlhdGVkIFBhcnRzIGFyZSBjcmVhdGVkIGZyb21cbiAqIFRlbXBsYXRlUGFydHMuXG4gKi9cbnR5cGUgVGVtcGxhdGVQYXJ0ID1cbiAgfCBDaGlsZFRlbXBsYXRlUGFydFxuICB8IEF0dHJpYnV0ZVRlbXBsYXRlUGFydFxuICB8IEVsZW1lbnRUZW1wbGF0ZVBhcnRcbiAgfCBDb21tZW50VGVtcGxhdGVQYXJ0O1xuXG5leHBvcnQgdHlwZSBQYXJ0ID1cbiAgfCBDaGlsZFBhcnRcbiAgfCBBdHRyaWJ1dGVQYXJ0XG4gIHwgUHJvcGVydHlQYXJ0XG4gIHwgQm9vbGVhbkF0dHJpYnV0ZVBhcnRcbiAgfCBFbGVtZW50UGFydFxuICB8IEV2ZW50UGFydDtcblxuZXhwb3J0IHR5cGUge0NoaWxkUGFydH07XG5jbGFzcyBDaGlsZFBhcnQgaW1wbGVtZW50cyBEaXNjb25uZWN0YWJsZSB7XG4gIHJlYWRvbmx5IHR5cGUgPSBDSElMRF9QQVJUO1xuICByZWFkb25seSBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICBfJGNvbW1pdHRlZFZhbHVlOiB1bmtub3duID0gbm90aGluZztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfX2RpcmVjdGl2ZT86IERpcmVjdGl2ZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHN0YXJ0Tm9kZTogQ2hpbGROb2RlO1xuICAvKiogQGludGVybmFsICovXG4gIF8kZW5kTm9kZTogQ2hpbGROb2RlIHwgbnVsbDtcbiAgcHJpdmF0ZSBfdGV4dFNhbml0aXplcjogVmFsdWVTYW5pdGl6ZXIgfCB1bmRlZmluZWQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlIHwgdW5kZWZpbmVkO1xuICAvKipcbiAgICogQ29ubmVjdGlvbiBzdGF0ZSBmb3IgUm9vdFBhcnRzIG9ubHkgKGkuZS4gQ2hpbGRQYXJ0IHdpdGhvdXQgXyRwYXJlbnRcbiAgICogcmV0dXJuZWQgZnJvbSB0b3AtbGV2ZWwgYHJlbmRlcmApLiBUaGlzIGZpZWxkIGlzIHVudXNlZCBvdGhlcndpc2UuIFRoZVxuICAgKiBpbnRlbnRpb24gd291bGQgYmUgY2xlYXJlciBpZiB3ZSBtYWRlIGBSb290UGFydGAgYSBzdWJjbGFzcyBvZiBgQ2hpbGRQYXJ0YFxuICAgKiB3aXRoIHRoaXMgZmllbGQgKGFuZCBhIGRpZmZlcmVudCBfJGlzQ29ubmVjdGVkIGdldHRlciksIGJ1dCB0aGUgc3ViY2xhc3NcbiAgICogY2F1c2VkIGEgcGVyZiByZWdyZXNzaW9uLCBwb3NzaWJseSBkdWUgdG8gbWFraW5nIGNhbGwgc2l0ZXMgcG9seW1vcnBoaWMuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX19pc0Nvbm5lY3RlZDogYm9vbGVhbjtcblxuICAvLyBTZWUgY29tbWVudCBpbiBEaXNjb25uZWN0YWJsZSBpbnRlcmZhY2UgZm9yIHdoeSB0aGlzIGlzIGEgZ2V0dGVyXG4gIGdldCBfJGlzQ29ubmVjdGVkKCkge1xuICAgIC8vIENoaWxkUGFydHMgdGhhdCBhcmUgbm90IGF0IHRoZSByb290IHNob3VsZCBhbHdheXMgYmUgY3JlYXRlZCB3aXRoIGFcbiAgICAvLyBwYXJlbnQ7IG9ubHkgUm9vdENoaWxkTm9kZSdzIHdvbid0LCBzbyB0aGV5IHJldHVybiB0aGUgbG9jYWwgaXNDb25uZWN0ZWRcbiAgICAvLyBzdGF0ZVxuICAgIHJldHVybiB0aGlzLl8kcGFyZW50Py5fJGlzQ29ubmVjdGVkID8/IHRoaXMuX19pc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIC8vIFRoZSBmb2xsb3dpbmcgZmllbGRzIHdpbGwgYmUgcGF0Y2hlZCBvbnRvIENoaWxkUGFydHMgd2hlbiByZXF1aXJlZCBieVxuICAvLyBBc3luY0RpcmVjdGl2ZVxuICAvKiogQGludGVybmFsICovXG4gIF8kZGlzY29ubmVjdGFibGVDaGlsZHJlbj86IFNldDxEaXNjb25uZWN0YWJsZT4gPSB1bmRlZmluZWQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZD8oXG4gICAgaXNDb25uZWN0ZWQ6IGJvb2xlYW4sXG4gICAgcmVtb3ZlRnJvbVBhcmVudD86IGJvb2xlYW4sXG4gICAgZnJvbT86IG51bWJlclxuICApOiB2b2lkO1xuICAvKiogQGludGVybmFsICovXG4gIF8kcmVwYXJlbnREaXNjb25uZWN0YWJsZXM/KHBhcmVudDogRGlzY29ubmVjdGFibGUpOiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHN0YXJ0Tm9kZTogQ2hpbGROb2RlLFxuICAgIGVuZE5vZGU6IENoaWxkTm9kZSB8IG51bGwsXG4gICAgcGFyZW50OiBUZW1wbGF0ZUluc3RhbmNlIHwgQ2hpbGRQYXJ0IHwgdW5kZWZpbmVkLFxuICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWRcbiAgKSB7XG4gICAgdGhpcy5fJHN0YXJ0Tm9kZSA9IHN0YXJ0Tm9kZTtcbiAgICB0aGlzLl8kZW5kTm9kZSA9IGVuZE5vZGU7XG4gICAgdGhpcy5fJHBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIC8vIE5vdGUgX19pc0Nvbm5lY3RlZCBpcyBvbmx5IGV2ZXIgYWNjZXNzZWQgb24gUm9vdFBhcnRzIChpLmUuIHdoZW4gdGhlcmUgaXNcbiAgICAvLyBubyBfJHBhcmVudCk7IHRoZSB2YWx1ZSBvbiBhIG5vbi1yb290LXBhcnQgaXMgXCJkb24ndCBjYXJlXCIsIGJ1dCBjaGVja2luZ1xuICAgIC8vIGZvciBwYXJlbnQgd291bGQgYmUgbW9yZSBjb2RlXG4gICAgdGhpcy5fX2lzQ29ubmVjdGVkID0gb3B0aW9ucz8uaXNDb25uZWN0ZWQgPz8gdHJ1ZTtcbiAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICAvLyBFeHBsaWNpdGx5IGluaXRpYWxpemUgZm9yIGNvbnNpc3RlbnQgY2xhc3Mgc2hhcGUuXG4gICAgICB0aGlzLl90ZXh0U2FuaXRpemVyID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcGFyZW50IG5vZGUgaW50byB3aGljaCB0aGUgcGFydCByZW5kZXJzIGl0cyBjb250ZW50LlxuICAgKlxuICAgKiBBIENoaWxkUGFydCdzIGNvbnRlbnQgY29uc2lzdHMgb2YgYSByYW5nZSBvZiBhZGphY2VudCBjaGlsZCBub2RlcyBvZlxuICAgKiBgLnBhcmVudE5vZGVgLCBwb3NzaWJseSBib3JkZXJlZCBieSAnbWFya2VyIG5vZGVzJyAoYC5zdGFydE5vZGVgIGFuZFxuICAgKiBgLmVuZE5vZGVgKS5cbiAgICpcbiAgICogLSBJZiBib3RoIGAuc3RhcnROb2RlYCBhbmQgYC5lbmROb2RlYCBhcmUgbm9uLW51bGwsIHRoZW4gdGhlIHBhcnQncyBjb250ZW50XG4gICAqIGNvbnNpc3RzIG9mIGFsbCBzaWJsaW5ncyBiZXR3ZWVuIGAuc3RhcnROb2RlYCBhbmQgYC5lbmROb2RlYCwgZXhjbHVzaXZlbHkuXG4gICAqXG4gICAqIC0gSWYgYC5zdGFydE5vZGVgIGlzIG5vbi1udWxsIGJ1dCBgLmVuZE5vZGVgIGlzIG51bGwsIHRoZW4gdGhlIHBhcnQnc1xuICAgKiBjb250ZW50IGNvbnNpc3RzIG9mIGFsbCBzaWJsaW5ncyBmb2xsb3dpbmcgYC5zdGFydE5vZGVgLCB1cCB0byBhbmRcbiAgICogaW5jbHVkaW5nIHRoZSBsYXN0IGNoaWxkIG9mIGAucGFyZW50Tm9kZWAuIElmIGAuZW5kTm9kZWAgaXMgbm9uLW51bGwsIHRoZW5cbiAgICogYC5zdGFydE5vZGVgIHdpbGwgYWx3YXlzIGJlIG5vbi1udWxsLlxuICAgKlxuICAgKiAtIElmIGJvdGggYC5lbmROb2RlYCBhbmQgYC5zdGFydE5vZGVgIGFyZSBudWxsLCB0aGVuIHRoZSBwYXJ0J3MgY29udGVudFxuICAgKiBjb25zaXN0cyBvZiBhbGwgY2hpbGQgbm9kZXMgb2YgYC5wYXJlbnROb2RlYC5cbiAgICovXG4gIGdldCBwYXJlbnROb2RlKCk6IE5vZGUge1xuICAgIGxldCBwYXJlbnROb2RlOiBOb2RlID0gd3JhcCh0aGlzLl8kc3RhcnROb2RlKS5wYXJlbnROb2RlITtcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl8kcGFyZW50O1xuICAgIGlmIChcbiAgICAgIHBhcmVudCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBwYXJlbnROb2RlPy5ub2RlVHlwZSA9PT0gMTEgLyogTm9kZS5ET0NVTUVOVF9GUkFHTUVOVCAqL1xuICAgICkge1xuICAgICAgLy8gSWYgdGhlIHBhcmVudE5vZGUgaXMgYSBEb2N1bWVudEZyYWdtZW50LCBpdCBtYXkgYmUgYmVjYXVzZSB0aGUgRE9NIGlzXG4gICAgICAvLyBzdGlsbCBpbiB0aGUgY2xvbmVkIGZyYWdtZW50IGR1cmluZyBpbml0aWFsIHJlbmRlcjsgaWYgc28sIGdldCB0aGUgcmVhbFxuICAgICAgLy8gcGFyZW50Tm9kZSB0aGUgcGFydCB3aWxsIGJlIGNvbW1pdHRlZCBpbnRvIGJ5IGFza2luZyB0aGUgcGFyZW50LlxuICAgICAgcGFyZW50Tm9kZSA9IChwYXJlbnQgYXMgQ2hpbGRQYXJ0IHwgVGVtcGxhdGVJbnN0YW5jZSkucGFyZW50Tm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmVudE5vZGU7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHBhcnQncyBsZWFkaW5nIG1hcmtlciBub2RlLCBpZiBhbnkuIFNlZSBgLnBhcmVudE5vZGVgIGZvciBtb3JlXG4gICAqIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgZ2V0IHN0YXJ0Tm9kZSgpOiBOb2RlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuXyRzdGFydE5vZGU7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHBhcnQncyB0cmFpbGluZyBtYXJrZXIgbm9kZSwgaWYgYW55LiBTZWUgYC5wYXJlbnROb2RlYCBmb3IgbW9yZVxuICAgKiBpbmZvcm1hdGlvbi5cbiAgICovXG4gIGdldCBlbmROb2RlKCk6IE5vZGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fJGVuZE5vZGU7XG4gIH1cblxuICBfJHNldFZhbHVlKHZhbHVlOiB1bmtub3duLCBkaXJlY3RpdmVQYXJlbnQ6IERpcmVjdGl2ZVBhcmVudCA9IHRoaXMpOiB2b2lkIHtcbiAgICBpZiAoREVWX01PREUgJiYgdGhpcy5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBUaGlzIFxcYENoaWxkUGFydFxcYCBoYXMgbm8gXFxgcGFyZW50Tm9kZVxcYCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBhY2NlcHQgYSB2YWx1ZS4gVGhpcyBsaWtlbHkgbWVhbnMgdGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgcGFydCB3YXMgbWFuaXB1bGF0ZWQgaW4gYW4gdW5zdXBwb3J0ZWQgd2F5IG91dHNpZGUgb2YgTGl0J3MgY29udHJvbCBzdWNoIHRoYXQgdGhlIHBhcnQncyBtYXJrZXIgbm9kZXMgd2VyZSBlamVjdGVkIGZyb20gRE9NLiBGb3IgZXhhbXBsZSwgc2V0dGluZyB0aGUgZWxlbWVudCdzIFxcYGlubmVySFRNTFxcYCBvciBcXGB0ZXh0Q29udGVudFxcYCBjYW4gZG8gdGhpcy5gXG4gICAgICApO1xuICAgIH1cbiAgICB2YWx1ZSA9IHJlc29sdmVEaXJlY3RpdmUodGhpcywgdmFsdWUsIGRpcmVjdGl2ZVBhcmVudCk7XG4gICAgaWYgKGlzUHJpbWl0aXZlKHZhbHVlKSkge1xuICAgICAgLy8gTm9uLXJlbmRlcmluZyBjaGlsZCB2YWx1ZXMuIEl0J3MgaW1wb3J0YW50IHRoYXQgdGhlc2UgZG8gbm90IHJlbmRlclxuICAgICAgLy8gZW1wdHkgdGV4dCBub2RlcyB0byBhdm9pZCBpc3N1ZXMgd2l0aCBwcmV2ZW50aW5nIGRlZmF1bHQgPHNsb3Q+XG4gICAgICAvLyBmYWxsYmFjayBjb250ZW50LlxuICAgICAgaWYgKHZhbHVlID09PSBub3RoaW5nIHx8IHZhbHVlID09IG51bGwgfHwgdmFsdWUgPT09ICcnKSB7XG4gICAgICAgIGlmICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgIT09IG5vdGhpbmcpIHtcbiAgICAgICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICAgICAga2luZDogJ2NvbW1pdCBub3RoaW5nIHRvIGNoaWxkJyxcbiAgICAgICAgICAgICAgc3RhcnQ6IHRoaXMuXyRzdGFydE5vZGUsXG4gICAgICAgICAgICAgIGVuZDogdGhpcy5fJGVuZE5vZGUsXG4gICAgICAgICAgICAgIHBhcmVudDogdGhpcy5fJHBhcmVudCxcbiAgICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5fJGNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gbm90aGluZztcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgIT09IHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAmJiB2YWx1ZSAhPT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgICB9XG4gICAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIH0gZWxzZSBpZiAoKHZhbHVlIGFzIFRlbXBsYXRlUmVzdWx0KVsnXyRsaXRUeXBlJCddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX2NvbW1pdFRlbXBsYXRlUmVzdWx0KHZhbHVlIGFzIFRlbXBsYXRlUmVzdWx0KTtcbiAgICB9IGVsc2UgaWYgKCh2YWx1ZSBhcyBOb2RlKS5ub2RlVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoREVWX01PREUgJiYgdGhpcy5vcHRpb25zPy5ob3N0ID09PSB2YWx1ZSkge1xuICAgICAgICB0aGlzLl9jb21taXRUZXh0KFxuICAgICAgICAgIGBbcHJvYmFibGUgbWlzdGFrZTogcmVuZGVyZWQgYSB0ZW1wbGF0ZSdzIGhvc3QgaW4gaXRzZWxmIGAgK1xuICAgICAgICAgICAgYChjb21tb25seSBjYXVzZWQgYnkgd3JpdGluZyBcXCR7dGhpc30gaW4gYSB0ZW1wbGF0ZV1gXG4gICAgICAgICk7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBgQXR0ZW1wdGVkIHRvIHJlbmRlciB0aGUgdGVtcGxhdGUgaG9zdGAsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgYGluc2lkZSBpdHNlbGYuIFRoaXMgaXMgYWxtb3N0IGFsd2F5cyBhIG1pc3Rha2UsIGFuZCBpbiBkZXYgbW9kZSBgLFxuICAgICAgICAgIGB3ZSByZW5kZXIgc29tZSB3YXJuaW5nIHRleHQuIEluIHByb2R1Y3Rpb24gaG93ZXZlciwgd2UnbGwgYCxcbiAgICAgICAgICBgcmVuZGVyIGl0LCB3aGljaCB3aWxsIHVzdWFsbHkgcmVzdWx0IGluIGFuIGVycm9yLCBhbmQgc29tZXRpbWVzIGAsXG4gICAgICAgICAgYGluIHRoZSBlbGVtZW50IGRpc2FwcGVhcmluZyBmcm9tIHRoZSBET00uYFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9jb21taXROb2RlKHZhbHVlIGFzIE5vZGUpO1xuICAgIH0gZWxzZSBpZiAoaXNJdGVyYWJsZSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuX2NvbW1pdEl0ZXJhYmxlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRmFsbGJhY2ssIHdpbGwgcmVuZGVyIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb25cbiAgICAgIHRoaXMuX2NvbW1pdFRleHQodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2luc2VydDxUIGV4dGVuZHMgTm9kZT4obm9kZTogVCkge1xuICAgIHJldHVybiB3cmFwKHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkucGFyZW50Tm9kZSEpLmluc2VydEJlZm9yZShcbiAgICAgIG5vZGUsXG4gICAgICB0aGlzLl8kZW5kTm9kZVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9jb21taXROb2RlKHZhbHVlOiBOb2RlKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgIHRoaXMuXyRjbGVhcigpO1xuICAgICAgaWYgKFxuICAgICAgICBFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MgJiZcbiAgICAgICAgc2FuaXRpemVyRmFjdG9yeUludGVybmFsICE9PSBub29wU2FuaXRpemVyXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgcGFyZW50Tm9kZU5hbWUgPSB0aGlzLl8kc3RhcnROb2RlLnBhcmVudE5vZGU/Lm5vZGVOYW1lO1xuICAgICAgICBpZiAocGFyZW50Tm9kZU5hbWUgPT09ICdTVFlMRScgfHwgcGFyZW50Tm9kZU5hbWUgPT09ICdTQ1JJUFQnKSB7XG4gICAgICAgICAgbGV0IG1lc3NhZ2UgPSAnRm9yYmlkZGVuJztcbiAgICAgICAgICBpZiAoREVWX01PREUpIHtcbiAgICAgICAgICAgIGlmIChwYXJlbnROb2RlTmFtZSA9PT0gJ1NUWUxFJykge1xuICAgICAgICAgICAgICBtZXNzYWdlID1cbiAgICAgICAgICAgICAgICBgTGl0IGRvZXMgbm90IHN1cHBvcnQgYmluZGluZyBpbnNpZGUgc3R5bGUgbm9kZXMuIGAgK1xuICAgICAgICAgICAgICAgIGBUaGlzIGlzIGEgc2VjdXJpdHkgcmlzaywgYXMgc3R5bGUgaW5qZWN0aW9uIGF0dGFja3MgY2FuIGAgK1xuICAgICAgICAgICAgICAgIGBleGZpbHRyYXRlIGRhdGEgYW5kIHNwb29mIFVJcy4gYCArXG4gICAgICAgICAgICAgICAgYENvbnNpZGVyIGluc3RlYWQgdXNpbmcgY3NzXFxgLi4uXFxgIGxpdGVyYWxzIGAgK1xuICAgICAgICAgICAgICAgIGB0byBjb21wb3NlIHN0eWxlcywgYW5kIGRvIGR5bmFtaWMgc3R5bGluZyB3aXRoIGAgK1xuICAgICAgICAgICAgICAgIGBjc3MgY3VzdG9tIHByb3BlcnRpZXMsIDo6cGFydHMsIDxzbG90PnMsIGAgK1xuICAgICAgICAgICAgICAgIGBhbmQgYnkgbXV0YXRpbmcgdGhlIERPTSByYXRoZXIgdGhhbiBzdHlsZXNoZWV0cy5gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgYExpdCBkb2VzIG5vdCBzdXBwb3J0IGJpbmRpbmcgaW5zaWRlIHNjcmlwdCBub2Rlcy4gYCArXG4gICAgICAgICAgICAgICAgYFRoaXMgaXMgYSBzZWN1cml0eSByaXNrLCBhcyBpdCBjb3VsZCBhbGxvdyBhcmJpdHJhcnkgYCArXG4gICAgICAgICAgICAgICAgYGNvZGUgZXhlY3V0aW9uLmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAnY29tbWl0IG5vZGUnLFxuICAgICAgICAgIHN0YXJ0OiB0aGlzLl8kc3RhcnROb2RlLFxuICAgICAgICAgIHBhcmVudDogdGhpcy5fJHBhcmVudCxcbiAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IHRoaXMuX2luc2VydCh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29tbWl0VGV4dCh2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIC8vIElmIHRoZSBjb21taXR0ZWQgdmFsdWUgaXMgYSBwcmltaXRpdmUgaXQgbWVhbnMgd2UgY2FsbGVkIF9jb21taXRUZXh0IG9uXG4gICAgLy8gdGhlIHByZXZpb3VzIHJlbmRlciwgYW5kIHdlIGtub3cgdGhhdCB0aGlzLl8kc3RhcnROb2RlLm5leHRTaWJsaW5nIGlzIGFcbiAgICAvLyBUZXh0IG5vZGUuIFdlIGNhbiBub3cganVzdCByZXBsYWNlIHRoZSB0ZXh0IGNvbnRlbnQgKC5kYXRhKSBvZiB0aGUgbm9kZS5cbiAgICBpZiAoXG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgIT09IG5vdGhpbmcgJiZcbiAgICAgIGlzUHJpbWl0aXZlKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSlcbiAgICApIHtcbiAgICAgIGNvbnN0IG5vZGUgPSB3cmFwKHRoaXMuXyRzdGFydE5vZGUpLm5leHRTaWJsaW5nIGFzIFRleHQ7XG4gICAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICAgIGlmICh0aGlzLl90ZXh0U2FuaXRpemVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLl90ZXh0U2FuaXRpemVyID0gY3JlYXRlU2FuaXRpemVyKG5vZGUsICdkYXRhJywgJ3Byb3BlcnR5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgPSB0aGlzLl90ZXh0U2FuaXRpemVyKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ2NvbW1pdCB0ZXh0JyxcbiAgICAgICAgICBub2RlLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgICAobm9kZSBhcyBUZXh0KS5kYXRhID0gdmFsdWUgYXMgc3RyaW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICAgIGNvbnN0IHRleHROb2RlID0gZC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgICAgIHRoaXMuX2NvbW1pdE5vZGUodGV4dE5vZGUpO1xuICAgICAgICAvLyBXaGVuIHNldHRpbmcgdGV4dCBjb250ZW50LCBmb3Igc2VjdXJpdHkgcHVycG9zZXMgaXQgbWF0dGVycyBhIGxvdFxuICAgICAgICAvLyB3aGF0IHRoZSBwYXJlbnQgaXMuIEZvciBleGFtcGxlLCA8c3R5bGU+IGFuZCA8c2NyaXB0PiBuZWVkIHRvIGJlXG4gICAgICAgIC8vIGhhbmRsZWQgd2l0aCBjYXJlLCB3aGlsZSA8c3Bhbj4gZG9lcyBub3QuIFNvIGZpcnN0IHdlIG5lZWQgdG8gcHV0IGFcbiAgICAgICAgLy8gdGV4dCBub2RlIGludG8gdGhlIGRvY3VtZW50LCB0aGVuIHdlIGNhbiBzYW5pdGl6ZSBpdHMgY29udGVudC5cbiAgICAgICAgaWYgKHRoaXMuX3RleHRTYW5pdGl6ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuX3RleHRTYW5pdGl6ZXIgPSBjcmVhdGVTYW5pdGl6ZXIodGV4dE5vZGUsICdkYXRhJywgJ3Byb3BlcnR5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgPSB0aGlzLl90ZXh0U2FuaXRpemVyKHZhbHVlKTtcbiAgICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgICAga2luZDogJ2NvbW1pdCB0ZXh0JyxcbiAgICAgICAgICAgIG5vZGU6IHRleHROb2RlLFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgfSk7XG4gICAgICAgIHRleHROb2RlLmRhdGEgPSB2YWx1ZSBhcyBzdHJpbmc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jb21taXROb2RlKGQuY3JlYXRlVGV4dE5vZGUodmFsdWUgYXMgc3RyaW5nKSk7XG4gICAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICAgIGtpbmQ6ICdjb21taXQgdGV4dCcsXG4gICAgICAgICAgICBub2RlOiB3cmFwKHRoaXMuXyRzdGFydE5vZGUpLm5leHRTaWJsaW5nIGFzIFRleHQsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9jb21taXRUZW1wbGF0ZVJlc3VsdChcbiAgICByZXN1bHQ6IFRlbXBsYXRlUmVzdWx0IHwgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdFxuICApOiB2b2lkIHtcbiAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIGNvbnN0IHt2YWx1ZXMsIFsnXyRsaXRUeXBlJCddOiB0eXBlfSA9IHJlc3VsdDtcbiAgICAvLyBJZiAkbGl0VHlwZSQgaXMgYSBudW1iZXIsIHJlc3VsdCBpcyBhIHBsYWluIFRlbXBsYXRlUmVzdWx0IGFuZCB3ZSBnZXRcbiAgICAvLyB0aGUgdGVtcGxhdGUgZnJvbSB0aGUgdGVtcGxhdGUgY2FjaGUuIElmIG5vdCwgcmVzdWx0IGlzIGFcbiAgICAvLyBDb21waWxlZFRlbXBsYXRlUmVzdWx0IGFuZCBfJGxpdFR5cGUkIGlzIGEgQ29tcGlsZWRUZW1wbGF0ZSBhbmQgd2UgbmVlZFxuICAgIC8vIHRvIGNyZWF0ZSB0aGUgPHRlbXBsYXRlPiBlbGVtZW50IHRoZSBmaXJzdCB0aW1lIHdlIHNlZSBpdC5cbiAgICBjb25zdCB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBDb21waWxlZFRlbXBsYXRlID1cbiAgICAgIHR5cGVvZiB0eXBlID09PSAnbnVtYmVyJ1xuICAgICAgICA/IHRoaXMuXyRnZXRUZW1wbGF0ZShyZXN1bHQgYXMgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0KVxuICAgICAgICA6ICh0eXBlLmVsID09PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICh0eXBlLmVsID0gVGVtcGxhdGUuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgdHJ1c3RGcm9tVGVtcGxhdGVTdHJpbmcodHlwZS5oLCB0eXBlLmhbMF0pLFxuICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNcbiAgICAgICAgICAgICkpLFxuICAgICAgICAgIHR5cGUpO1xuXG4gICAgaWYgKCh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgVGVtcGxhdGVJbnN0YW5jZSk/Ll8kdGVtcGxhdGUgPT09IHRlbXBsYXRlKSB7XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSB1cGRhdGluZycsXG4gICAgICAgICAgdGVtcGxhdGUsXG4gICAgICAgICAgaW5zdGFuY2U6IHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBUZW1wbGF0ZUluc3RhbmNlLFxuICAgICAgICAgIHBhcnRzOiAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIFRlbXBsYXRlSW5zdGFuY2UpLl8kcGFydHMsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgfSk7XG4gICAgICAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIFRlbXBsYXRlSW5zdGFuY2UpLl91cGRhdGUodmFsdWVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZSBhcyBUZW1wbGF0ZSwgdGhpcyk7XG4gICAgICBjb25zdCBmcmFnbWVudCA9IGluc3RhbmNlLl9jbG9uZSh0aGlzLm9wdGlvbnMpO1xuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAndGVtcGxhdGUgaW5zdGFudGlhdGVkJyxcbiAgICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgICBpbnN0YW5jZSxcbiAgICAgICAgICBwYXJ0czogaW5zdGFuY2UuXyRwYXJ0cyxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgdmFsdWVzLFxuICAgICAgICB9KTtcbiAgICAgIGluc3RhbmNlLl91cGRhdGUodmFsdWVzKTtcbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ3RlbXBsYXRlIGluc3RhbnRpYXRlZCBhbmQgdXBkYXRlZCcsXG4gICAgICAgICAgdGVtcGxhdGUsXG4gICAgICAgICAgaW5zdGFuY2UsXG4gICAgICAgICAgcGFydHM6IGluc3RhbmNlLl8kcGFydHMsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgfSk7XG4gICAgICB0aGlzLl9jb21taXROb2RlKGZyYWdtZW50KTtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IGluc3RhbmNlO1xuICAgIH1cbiAgfVxuXG4gIC8vIE92ZXJyaWRkZW4gdmlhIGBsaXRIdG1sUG9seWZpbGxTdXBwb3J0YCB0byBwcm92aWRlIHBsYXRmb3JtIHN1cHBvcnQuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRnZXRUZW1wbGF0ZShyZXN1bHQ6IFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IHRlbXBsYXRlQ2FjaGUuZ2V0KHJlc3VsdC5zdHJpbmdzKTtcbiAgICBpZiAodGVtcGxhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGVtcGxhdGVDYWNoZS5zZXQocmVzdWx0LnN0cmluZ3MsICh0ZW1wbGF0ZSA9IG5ldyBUZW1wbGF0ZShyZXN1bHQpKSk7XG4gICAgfVxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1pdEl0ZXJhYmxlKHZhbHVlOiBJdGVyYWJsZTx1bmtub3duPik6IHZvaWQge1xuICAgIC8vIEZvciBhbiBJdGVyYWJsZSwgd2UgY3JlYXRlIGEgbmV3IEluc3RhbmNlUGFydCBwZXIgaXRlbSwgdGhlbiBzZXQgaXRzXG4gICAgLy8gdmFsdWUgdG8gdGhlIGl0ZW0uIFRoaXMgaXMgYSBsaXR0bGUgYml0IG9mIG92ZXJoZWFkIGZvciBldmVyeSBpdGVtIGluXG4gICAgLy8gYW4gSXRlcmFibGUsIGJ1dCBpdCBsZXRzIHVzIHJlY3Vyc2UgZWFzaWx5IGFuZCBlZmZpY2llbnRseSB1cGRhdGUgQXJyYXlzXG4gICAgLy8gb2YgVGVtcGxhdGVSZXN1bHRzIHRoYXQgd2lsbCBiZSBjb21tb25seSByZXR1cm5lZCBmcm9tIGV4cHJlc3Npb25zIGxpa2U6XG4gICAgLy8gYXJyYXkubWFwKChpKSA9PiBodG1sYCR7aX1gKSwgYnkgcmV1c2luZyBleGlzdGluZyBUZW1wbGF0ZUluc3RhbmNlcy5cblxuICAgIC8vIElmIHZhbHVlIGlzIGFuIGFycmF5LCB0aGVuIHRoZSBwcmV2aW91cyByZW5kZXIgd2FzIG9mIGFuXG4gICAgLy8gaXRlcmFibGUgYW5kIHZhbHVlIHdpbGwgY29udGFpbiB0aGUgQ2hpbGRQYXJ0cyBmcm9tIHRoZSBwcmV2aW91c1xuICAgIC8vIHJlbmRlci4gSWYgdmFsdWUgaXMgbm90IGFuIGFycmF5LCBjbGVhciB0aGlzIHBhcnQgYW5kIG1ha2UgYSBuZXdcbiAgICAvLyBhcnJheSBmb3IgQ2hpbGRQYXJ0cy5cbiAgICBpZiAoIWlzQXJyYXkodGhpcy5fJGNvbW1pdHRlZFZhbHVlKSkge1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gW107XG4gICAgICB0aGlzLl8kY2xlYXIoKTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIHVzIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgaXRlbXMgd2Ugc3RhbXBlZCBzbyB3ZSBjYW4gY2xlYXIgbGVmdG92ZXJcbiAgICAvLyBpdGVtcyBmcm9tIGEgcHJldmlvdXMgcmVuZGVyXG4gICAgY29uc3QgaXRlbVBhcnRzID0gdGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIENoaWxkUGFydFtdO1xuICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgIGxldCBpdGVtUGFydDogQ2hpbGRQYXJ0IHwgdW5kZWZpbmVkO1xuXG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHZhbHVlKSB7XG4gICAgICBpZiAocGFydEluZGV4ID09PSBpdGVtUGFydHMubGVuZ3RoKSB7XG4gICAgICAgIC8vIElmIG5vIGV4aXN0aW5nIHBhcnQsIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgICAgLy8gVE9ETyAoanVzdGluZmFnbmFuaSk6IHRlc3QgcGVyZiBpbXBhY3Qgb2YgYWx3YXlzIGNyZWF0aW5nIHR3byBwYXJ0c1xuICAgICAgICAvLyBpbnN0ZWFkIG9mIHNoYXJpbmcgcGFydHMgYmV0d2VlbiBub2Rlc1xuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbGl0L2xpdC9pc3N1ZXMvMTI2NlxuICAgICAgICBpdGVtUGFydHMucHVzaChcbiAgICAgICAgICAoaXRlbVBhcnQgPSBuZXcgQ2hpbGRQYXJ0KFxuICAgICAgICAgICAgdGhpcy5faW5zZXJ0KGNyZWF0ZU1hcmtlcigpKSxcbiAgICAgICAgICAgIHRoaXMuX2luc2VydChjcmVhdGVNYXJrZXIoKSksXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zXG4gICAgICAgICAgKSlcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFJldXNlIGFuIGV4aXN0aW5nIHBhcnRcbiAgICAgICAgaXRlbVBhcnQgPSBpdGVtUGFydHNbcGFydEluZGV4XTtcbiAgICAgIH1cbiAgICAgIGl0ZW1QYXJ0Ll8kc2V0VmFsdWUoaXRlbSk7XG4gICAgICBwYXJ0SW5kZXgrKztcbiAgICB9XG5cbiAgICBpZiAocGFydEluZGV4IDwgaXRlbVBhcnRzLmxlbmd0aCkge1xuICAgICAgLy8gaXRlbVBhcnRzIGFsd2F5cyBoYXZlIGVuZCBub2Rlc1xuICAgICAgdGhpcy5fJGNsZWFyKFxuICAgICAgICBpdGVtUGFydCAmJiB3cmFwKGl0ZW1QYXJ0Ll8kZW5kTm9kZSEpLm5leHRTaWJsaW5nLFxuICAgICAgICBwYXJ0SW5kZXhcbiAgICAgICk7XG4gICAgICAvLyBUcnVuY2F0ZSB0aGUgcGFydHMgYXJyYXkgc28gX3ZhbHVlIHJlZmxlY3RzIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgICBpdGVtUGFydHMubGVuZ3RoID0gcGFydEluZGV4O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBub2RlcyBjb250YWluZWQgd2l0aGluIHRoaXMgUGFydCBmcm9tIHRoZSBET00uXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydCBTdGFydCBub2RlIHRvIGNsZWFyIGZyb20sIGZvciBjbGVhcmluZyBhIHN1YnNldCBvZiB0aGUgcGFydCdzXG4gICAqICAgICBET00gKHVzZWQgd2hlbiB0cnVuY2F0aW5nIGl0ZXJhYmxlcylcbiAgICogQHBhcmFtIGZyb20gIFdoZW4gYHN0YXJ0YCBpcyBzcGVjaWZpZWQsIHRoZSBpbmRleCB3aXRoaW4gdGhlIGl0ZXJhYmxlIGZyb21cbiAgICogICAgIHdoaWNoIENoaWxkUGFydHMgYXJlIGJlaW5nIHJlbW92ZWQsIHVzZWQgZm9yIGRpc2Nvbm5lY3RpbmcgZGlyZWN0aXZlcyBpblxuICAgKiAgICAgdGhvc2UgUGFydHMuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgXyRjbGVhcihcbiAgICBzdGFydDogQ2hpbGROb2RlIHwgbnVsbCA9IHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkubmV4dFNpYmxpbmcsXG4gICAgZnJvbT86IG51bWJlclxuICApIHtcbiAgICB0aGlzLl8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQ/LihmYWxzZSwgdHJ1ZSwgZnJvbSk7XG4gICAgd2hpbGUgKHN0YXJ0ICYmIHN0YXJ0ICE9PSB0aGlzLl8kZW5kTm9kZSkge1xuICAgICAgY29uc3QgbiA9IHdyYXAoc3RhcnQhKS5uZXh0U2libGluZztcbiAgICAgICh3cmFwKHN0YXJ0ISkgYXMgRWxlbWVudCkucmVtb3ZlKCk7XG4gICAgICBzdGFydCA9IG47XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBvZiBSb290UGFydCdzIGBpc0Nvbm5lY3RlZGAuIE5vdGUgdGhhdCB0aGlzIG1ldGhvZFxuICAgKiBzaG91bGQgb25seSBiZSBjYWxsZWQgb24gYFJvb3RQYXJ0YHMgKHRoZSBgQ2hpbGRQYXJ0YCByZXR1cm5lZCBmcm9tIGFcbiAgICogdG9wLWxldmVsIGByZW5kZXIoKWAgY2FsbCkuIEl0IGhhcyBubyBlZmZlY3Qgb24gbm9uLXJvb3QgQ2hpbGRQYXJ0cy5cbiAgICogQHBhcmFtIGlzQ29ubmVjdGVkIFdoZXRoZXIgdG8gc2V0XG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgc2V0Q29ubmVjdGVkKGlzQ29ubmVjdGVkOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuXyRwYXJlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fX2lzQ29ubmVjdGVkID0gaXNDb25uZWN0ZWQ7XG4gICAgICB0aGlzLl8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQ/Lihpc0Nvbm5lY3RlZCk7XG4gICAgfSBlbHNlIGlmIChERVZfTU9ERSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAncGFydC5zZXRDb25uZWN0ZWQoKSBtYXkgb25seSBiZSBjYWxsZWQgb24gYSAnICtcbiAgICAgICAgICAnUm9vdFBhcnQgcmV0dXJuZWQgZnJvbSByZW5kZXIoKS4nXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEEgdG9wLWxldmVsIGBDaGlsZFBhcnRgIHJldHVybmVkIGZyb20gYHJlbmRlcmAgdGhhdCBtYW5hZ2VzIHRoZSBjb25uZWN0ZWRcbiAqIHN0YXRlIG9mIGBBc3luY0RpcmVjdGl2ZWBzIGNyZWF0ZWQgdGhyb3VnaG91dCB0aGUgdHJlZSBiZWxvdyBpdC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSb290UGFydCBleHRlbmRzIENoaWxkUGFydCB7XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjb25uZWN0aW9uIHN0YXRlIGZvciBgQXN5bmNEaXJlY3RpdmVgcyBjb250YWluZWQgd2l0aGluIHRoaXMgcm9vdFxuICAgKiBDaGlsZFBhcnQuXG4gICAqXG4gICAqIGxpdC1odG1sIGRvZXMgbm90IGF1dG9tYXRpY2FsbHkgbW9uaXRvciB0aGUgY29ubmVjdGVkbmVzcyBvZiBET00gcmVuZGVyZWQ7XG4gICAqIGFzIHN1Y2gsIGl0IGlzIHRoZSByZXNwb25zaWJpbGl0eSBvZiB0aGUgY2FsbGVyIHRvIGByZW5kZXJgIHRvIGVuc3VyZSB0aGF0XG4gICAqIGBwYXJ0LnNldENvbm5lY3RlZChmYWxzZSlgIGlzIGNhbGxlZCBiZWZvcmUgdGhlIHBhcnQgb2JqZWN0IGlzIHBvdGVudGlhbGx5XG4gICAqIGRpc2NhcmRlZCwgdG8gZW5zdXJlIHRoYXQgYEFzeW5jRGlyZWN0aXZlYHMgaGF2ZSBhIGNoYW5jZSB0byBkaXNwb3NlIG9mXG4gICAqIGFueSByZXNvdXJjZXMgYmVpbmcgaGVsZC4gSWYgYSBgUm9vdFBhcnRgIHRoYXQgd2FzIHByZXZpb3VzbHlcbiAgICogZGlzY29ubmVjdGVkIGlzIHN1YnNlcXVlbnRseSByZS1jb25uZWN0ZWQgKGFuZCBpdHMgYEFzeW5jRGlyZWN0aXZlYHMgc2hvdWxkXG4gICAqIHJlLWNvbm5lY3QpLCBgc2V0Q29ubmVjdGVkKHRydWUpYCBzaG91bGQgYmUgY2FsbGVkLlxuICAgKlxuICAgKiBAcGFyYW0gaXNDb25uZWN0ZWQgV2hldGhlciBkaXJlY3RpdmVzIHdpdGhpbiB0aGlzIHRyZWUgc2hvdWxkIGJlIGNvbm5lY3RlZFxuICAgKiBvciBub3RcbiAgICovXG4gIHNldENvbm5lY3RlZChpc0Nvbm5lY3RlZDogYm9vbGVhbik6IHZvaWQ7XG59XG5cbmV4cG9ydCB0eXBlIHtBdHRyaWJ1dGVQYXJ0fTtcbmNsYXNzIEF0dHJpYnV0ZVBhcnQgaW1wbGVtZW50cyBEaXNjb25uZWN0YWJsZSB7XG4gIHJlYWRvbmx5IHR5cGU6XG4gICAgfCB0eXBlb2YgQVRUUklCVVRFX1BBUlRcbiAgICB8IHR5cGVvZiBQUk9QRVJUWV9QQVJUXG4gICAgfCB0eXBlb2YgQk9PTEVBTl9BVFRSSUJVVEVfUEFSVFxuICAgIHwgdHlwZW9mIEVWRU5UX1BBUlQgPSBBVFRSSUJVVEVfUEFSVDtcbiAgcmVhZG9ubHkgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogSWYgdGhpcyBhdHRyaWJ1dGUgcGFydCByZXByZXNlbnRzIGFuIGludGVycG9sYXRpb24sIHRoaXMgY29udGFpbnMgdGhlXG4gICAqIHN0YXRpYyBzdHJpbmdzIG9mIHRoZSBpbnRlcnBvbGF0aW9uLiBGb3Igc2luZ2xlLXZhbHVlLCBjb21wbGV0ZSBiaW5kaW5ncyxcbiAgICogdGhpcyBpcyB1bmRlZmluZWQuXG4gICAqL1xuICByZWFkb25seSBzdHJpbmdzPzogUmVhZG9ubHlBcnJheTxzdHJpbmc+O1xuICAvKiogQGludGVybmFsICovXG4gIF8kY29tbWl0dGVkVmFsdWU6IHVua25vd24gfCBBcnJheTx1bmtub3duPiA9IG5vdGhpbmc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX19kaXJlY3RpdmVzPzogQXJyYXk8RGlyZWN0aXZlIHwgdW5kZWZpbmVkPjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHBhcmVudDogRGlzY29ubmVjdGFibGU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPiA9IHVuZGVmaW5lZDtcblxuICBwcm90ZWN0ZWQgX3Nhbml0aXplcjogVmFsdWVTYW5pdGl6ZXIgfCB1bmRlZmluZWQ7XG5cbiAgZ2V0IHRhZ05hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC50YWdOYW1lO1xuICB9XG5cbiAgLy8gU2VlIGNvbW1lbnQgaW4gRGlzY29ubmVjdGFibGUgaW50ZXJmYWNlIGZvciB3aHkgdGhpcyBpcyBhIGdldHRlclxuICBnZXQgXyRpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fJHBhcmVudC5fJGlzQ29ubmVjdGVkO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHN0cmluZ3M6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPixcbiAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlLFxuICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWRcbiAgKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuXyRwYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICBpZiAoc3RyaW5ncy5sZW5ndGggPiAyIHx8IHN0cmluZ3NbMF0gIT09ICcnIHx8IHN0cmluZ3NbMV0gIT09ICcnKSB7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBuZXcgQXJyYXkoc3RyaW5ncy5sZW5ndGggLSAxKS5maWxsKG5ldyBTdHJpbmcoKSk7XG4gICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBub3RoaW5nO1xuICAgIH1cbiAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICB0aGlzLl9zYW5pdGl6ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoaXMgcGFydCBieSByZXNvbHZpbmcgdGhlIHZhbHVlIGZyb20gcG9zc2libHkgbXVsdGlwbGVcbiAgICogdmFsdWVzIGFuZCBzdGF0aWMgc3RyaW5ncyBhbmQgY29tbWl0dGluZyBpdCB0byB0aGUgRE9NLlxuICAgKiBJZiB0aGlzIHBhcnQgaXMgc2luZ2xlLXZhbHVlZCwgYHRoaXMuX3N0cmluZ3NgIHdpbGwgYmUgdW5kZWZpbmVkLCBhbmQgdGhlXG4gICAqIG1ldGhvZCB3aWxsIGJlIGNhbGxlZCB3aXRoIGEgc2luZ2xlIHZhbHVlIGFyZ3VtZW50LiBJZiB0aGlzIHBhcnQgaXNcbiAgICogbXVsdGktdmFsdWUsIGB0aGlzLl9zdHJpbmdzYCB3aWxsIGJlIGRlZmluZWQsIGFuZCB0aGUgbWV0aG9kIGlzIGNhbGxlZFxuICAgKiB3aXRoIHRoZSB2YWx1ZSBhcnJheSBvZiB0aGUgcGFydCdzIG93bmluZyBUZW1wbGF0ZUluc3RhbmNlLCBhbmQgYW4gb2Zmc2V0XG4gICAqIGludG8gdGhlIHZhbHVlIGFycmF5IGZyb20gd2hpY2ggdGhlIHZhbHVlcyBzaG91bGQgYmUgcmVhZC5cbiAgICogVGhpcyBtZXRob2QgaXMgb3ZlcmxvYWRlZCB0aGlzIHdheSB0byBlbGltaW5hdGUgc2hvcnQtbGl2ZWQgYXJyYXkgc2xpY2VzXG4gICAqIG9mIHRoZSB0ZW1wbGF0ZSBpbnN0YW5jZSB2YWx1ZXMsIGFuZCBhbGxvdyBhIGZhc3QtcGF0aCBmb3Igc2luZ2xlLXZhbHVlZFxuICAgKiBwYXJ0cy5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBwYXJ0IHZhbHVlLCBvciBhbiBhcnJheSBvZiB2YWx1ZXMgZm9yIG11bHRpLXZhbHVlZCBwYXJ0c1xuICAgKiBAcGFyYW0gdmFsdWVJbmRleCB0aGUgaW5kZXggdG8gc3RhcnQgcmVhZGluZyB2YWx1ZXMgZnJvbS4gYHVuZGVmaW5lZGAgZm9yXG4gICAqICAgc2luZ2xlLXZhbHVlZCBwYXJ0c1xuICAgKiBAcGFyYW0gbm9Db21taXQgY2F1c2VzIHRoZSBwYXJ0IHRvIG5vdCBjb21taXQgaXRzIHZhbHVlIHRvIHRoZSBET00uIFVzZWRcbiAgICogICBpbiBoeWRyYXRpb24gdG8gcHJpbWUgYXR0cmlidXRlIHBhcnRzIHdpdGggdGhlaXIgZmlyc3QtcmVuZGVyZWQgdmFsdWUsXG4gICAqICAgYnV0IG5vdCBzZXQgdGhlIGF0dHJpYnV0ZSwgYW5kIGluIFNTUiB0byBuby1vcCB0aGUgRE9NIG9wZXJhdGlvbiBhbmRcbiAgICogICBjYXB0dXJlIHRoZSB2YWx1ZSBmb3Igc2VyaWFsaXphdGlvbi5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfJHNldFZhbHVlKFxuICAgIHZhbHVlOiB1bmtub3duIHwgQXJyYXk8dW5rbm93bj4sXG4gICAgZGlyZWN0aXZlUGFyZW50OiBEaXJlY3RpdmVQYXJlbnQgPSB0aGlzLFxuICAgIHZhbHVlSW5kZXg/OiBudW1iZXIsXG4gICAgbm9Db21taXQ/OiBib29sZWFuXG4gICkge1xuICAgIGNvbnN0IHN0cmluZ3MgPSB0aGlzLnN0cmluZ3M7XG5cbiAgICAvLyBXaGV0aGVyIGFueSBvZiB0aGUgdmFsdWVzIGhhcyBjaGFuZ2VkLCBmb3IgZGlydHktY2hlY2tpbmdcbiAgICBsZXQgY2hhbmdlID0gZmFsc2U7XG5cbiAgICBpZiAoc3RyaW5ncyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBTaW5nbGUtdmFsdWUgYmluZGluZyBjYXNlXG4gICAgICB2YWx1ZSA9IHJlc29sdmVEaXJlY3RpdmUodGhpcywgdmFsdWUsIGRpcmVjdGl2ZVBhcmVudCwgMCk7XG4gICAgICBjaGFuZ2UgPVxuICAgICAgICAhaXNQcmltaXRpdmUodmFsdWUpIHx8XG4gICAgICAgICh2YWx1ZSAhPT0gdGhpcy5fJGNvbW1pdHRlZFZhbHVlICYmIHZhbHVlICE9PSBub0NoYW5nZSk7XG4gICAgICBpZiAoY2hhbmdlKSB7XG4gICAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbnRlcnBvbGF0aW9uIGNhc2VcbiAgICAgIGNvbnN0IHZhbHVlcyA9IHZhbHVlIGFzIEFycmF5PHVua25vd24+O1xuICAgICAgdmFsdWUgPSBzdHJpbmdzWzBdO1xuXG4gICAgICBsZXQgaSwgdjtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICB2ID0gcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCB2YWx1ZXNbdmFsdWVJbmRleCEgKyBpXSwgZGlyZWN0aXZlUGFyZW50LCBpKTtcblxuICAgICAgICBpZiAodiA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgdXNlci1wcm92aWRlZCB2YWx1ZSBpcyBgbm9DaGFuZ2VgLCB1c2UgdGhlIHByZXZpb3VzIHZhbHVlXG4gICAgICAgICAgdiA9ICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgQXJyYXk8dW5rbm93bj4pW2ldO1xuICAgICAgICB9XG4gICAgICAgIGNoYW5nZSB8fD1cbiAgICAgICAgICAhaXNQcmltaXRpdmUodikgfHwgdiAhPT0gKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBBcnJheTx1bmtub3duPilbaV07XG4gICAgICAgIGlmICh2ID09PSBub3RoaW5nKSB7XG4gICAgICAgICAgdmFsdWUgPSBub3RoaW5nO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlICE9PSBub3RoaW5nKSB7XG4gICAgICAgICAgdmFsdWUgKz0gKHYgPz8gJycpICsgc3RyaW5nc1tpICsgMV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gV2UgYWx3YXlzIHJlY29yZCBlYWNoIHZhbHVlLCBldmVuIGlmIG9uZSBpcyBgbm90aGluZ2AsIGZvciBmdXR1cmVcbiAgICAgICAgLy8gY2hhbmdlIGRldGVjdGlvbi5cbiAgICAgICAgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBBcnJheTx1bmtub3duPilbaV0gPSB2O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2hhbmdlICYmICFub0NvbW1pdCkge1xuICAgICAgdGhpcy5fY29tbWl0VmFsdWUodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbW1pdFZhbHVlKHZhbHVlOiB1bmtub3duKSB7XG4gICAgaWYgKHZhbHVlID09PSBub3RoaW5nKSB7XG4gICAgICAod3JhcCh0aGlzLmVsZW1lbnQpIGFzIEVsZW1lbnQpLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICAgIGlmICh0aGlzLl9zYW5pdGl6ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuX3Nhbml0aXplciA9IHNhbml0aXplckZhY3RvcnlJbnRlcm5hbChcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgICAgICdhdHRyaWJ1dGUnXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZSA9IHRoaXMuX3Nhbml0aXplcih2YWx1ZSA/PyAnJyk7XG4gICAgICB9XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICdjb21taXQgYXR0cmlidXRlJyxcbiAgICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgICAod3JhcCh0aGlzLmVsZW1lbnQpIGFzIEVsZW1lbnQpLnNldEF0dHJpYnV0ZShcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICAodmFsdWUgPz8gJycpIGFzIHN0cmluZ1xuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUge1Byb3BlcnR5UGFydH07XG5jbGFzcyBQcm9wZXJ0eVBhcnQgZXh0ZW5kcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkgdHlwZSA9IFBST1BFUlRZX1BBUlQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfY29tbWl0VmFsdWUodmFsdWU6IHVua25vd24pIHtcbiAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICBpZiAodGhpcy5fc2FuaXRpemVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fc2FuaXRpemVyID0gc2FuaXRpemVyRmFjdG9yeUludGVybmFsKFxuICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgICAgJ3Byb3BlcnR5J1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSB0aGlzLl9zYW5pdGl6ZXIodmFsdWUpO1xuICAgIH1cbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ2NvbW1pdCBwcm9wZXJ0eScsXG4gICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgfSk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAodGhpcy5lbGVtZW50IGFzIGFueSlbdGhpcy5uYW1lXSA9IHZhbHVlID09PSBub3RoaW5nID8gdW5kZWZpbmVkIDogdmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUge0Jvb2xlYW5BdHRyaWJ1dGVQYXJ0fTtcbmNsYXNzIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0IGV4dGVuZHMgQXR0cmlidXRlUGFydCB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IHR5cGUgPSBCT09MRUFOX0FUVFJJQlVURV9QQVJUO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgX2NvbW1pdFZhbHVlKHZhbHVlOiB1bmtub3duKSB7XG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICdjb21taXQgYm9vbGVhbiBhdHRyaWJ1dGUnLFxuICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgdmFsdWU6ICEhKHZhbHVlICYmIHZhbHVlICE9PSBub3RoaW5nKSxcbiAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgfSk7XG4gICAgKHdyYXAodGhpcy5lbGVtZW50KSBhcyBFbGVtZW50KS50b2dnbGVBdHRyaWJ1dGUoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICAhIXZhbHVlICYmIHZhbHVlICE9PSBub3RoaW5nXG4gICAgKTtcbiAgfVxufVxuXG50eXBlIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucyA9IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgJlxuICBQYXJ0aWFsPEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zPjtcblxuLyoqXG4gKiBBbiBBdHRyaWJ1dGVQYXJ0IHRoYXQgbWFuYWdlcyBhbiBldmVudCBsaXN0ZW5lciB2aWEgYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIuXG4gKlxuICogVGhpcyBwYXJ0IHdvcmtzIGJ5IGFkZGluZyBpdHNlbGYgYXMgdGhlIGV2ZW50IGxpc3RlbmVyIG9uIGFuIGVsZW1lbnQsIHRoZW5cbiAqIGRlbGVnYXRpbmcgdG8gdGhlIHZhbHVlIHBhc3NlZCB0byBpdC4gVGhpcyByZWR1Y2VzIHRoZSBudW1iZXIgb2YgY2FsbHMgdG9cbiAqIGFkZC9yZW1vdmVFdmVudExpc3RlbmVyIGlmIHRoZSBsaXN0ZW5lciBjaGFuZ2VzIGZyZXF1ZW50bHksIHN1Y2ggYXMgd2hlbiBhblxuICogaW5saW5lIGZ1bmN0aW9uIGlzIHVzZWQgYXMgYSBsaXN0ZW5lci5cbiAqXG4gKiBCZWNhdXNlIGV2ZW50IG9wdGlvbnMgYXJlIHBhc3NlZCB3aGVuIGFkZGluZyBsaXN0ZW5lcnMsIHdlIG11c3QgdGFrZSBjYXNlXG4gKiB0byBhZGQgYW5kIHJlbW92ZSB0aGUgcGFydCBhcyBhIGxpc3RlbmVyIHdoZW4gdGhlIGV2ZW50IG9wdGlvbnMgY2hhbmdlLlxuICovXG5leHBvcnQgdHlwZSB7RXZlbnRQYXJ0fTtcbmNsYXNzIEV2ZW50UGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xuICBvdmVycmlkZSByZWFkb25seSB0eXBlID0gRVZFTlRfUEFSVDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3RyaW5nczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LFxuICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUsXG4gICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzLCBwYXJlbnQsIG9wdGlvbnMpO1xuXG4gICAgaWYgKERFVl9NT0RFICYmIHRoaXMuc3RyaW5ncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBBIFxcYDwke2VsZW1lbnQubG9jYWxOYW1lfT5cXGAgaGFzIGEgXFxgQCR7bmFtZX09Li4uXFxgIGxpc3RlbmVyIHdpdGggYCArXG4gICAgICAgICAgJ2ludmFsaWQgY29udGVudC4gRXZlbnQgbGlzdGVuZXJzIGluIHRlbXBsYXRlcyBtdXN0IGhhdmUgZXhhY3RseSAnICtcbiAgICAgICAgICAnb25lIGV4cHJlc3Npb24gYW5kIG5vIHN1cnJvdW5kaW5nIHRleHQuJ1xuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvLyBFdmVudFBhcnQgZG9lcyBub3QgdXNlIHRoZSBiYXNlIF8kc2V0VmFsdWUvX3Jlc29sdmVWYWx1ZSBpbXBsZW1lbnRhdGlvblxuICAvLyBzaW5jZSB0aGUgZGlydHkgY2hlY2tpbmcgaXMgbW9yZSBjb21wbGV4XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgXyRzZXRWYWx1ZShcbiAgICBuZXdMaXN0ZW5lcjogdW5rbm93bixcbiAgICBkaXJlY3RpdmVQYXJlbnQ6IERpcmVjdGl2ZVBhcmVudCA9IHRoaXNcbiAgKSB7XG4gICAgbmV3TGlzdGVuZXIgPVxuICAgICAgcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCBuZXdMaXN0ZW5lciwgZGlyZWN0aXZlUGFyZW50LCAwKSA/PyBub3RoaW5nO1xuICAgIGlmIChuZXdMaXN0ZW5lciA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgb2xkTGlzdGVuZXIgPSB0aGlzLl8kY29tbWl0dGVkVmFsdWU7XG5cbiAgICAvLyBJZiB0aGUgbmV3IHZhbHVlIGlzIG5vdGhpbmcgb3IgYW55IG9wdGlvbnMgY2hhbmdlIHdlIGhhdmUgdG8gcmVtb3ZlIHRoZVxuICAgIC8vIHBhcnQgYXMgYSBsaXN0ZW5lci5cbiAgICBjb25zdCBzaG91bGRSZW1vdmVMaXN0ZW5lciA9XG4gICAgICAobmV3TGlzdGVuZXIgPT09IG5vdGhpbmcgJiYgb2xkTGlzdGVuZXIgIT09IG5vdGhpbmcpIHx8XG4gICAgICAobmV3TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5jYXB0dXJlICE9PVxuICAgICAgICAob2xkTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5jYXB0dXJlIHx8XG4gICAgICAobmV3TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5vbmNlICE9PVxuICAgICAgICAob2xkTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5vbmNlIHx8XG4gICAgICAobmV3TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5wYXNzaXZlICE9PVxuICAgICAgICAob2xkTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5wYXNzaXZlO1xuXG4gICAgLy8gSWYgdGhlIG5ldyB2YWx1ZSBpcyBub3Qgbm90aGluZyBhbmQgd2UgcmVtb3ZlZCB0aGUgbGlzdGVuZXIsIHdlIGhhdmVcbiAgICAvLyB0byBhZGQgdGhlIHBhcnQgYXMgYSBsaXN0ZW5lci5cbiAgICBjb25zdCBzaG91bGRBZGRMaXN0ZW5lciA9XG4gICAgICBuZXdMaXN0ZW5lciAhPT0gbm90aGluZyAmJlxuICAgICAgKG9sZExpc3RlbmVyID09PSBub3RoaW5nIHx8IHNob3VsZFJlbW92ZUxpc3RlbmVyKTtcblxuICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICBraW5kOiAnY29tbWl0IGV2ZW50IGxpc3RlbmVyJyxcbiAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgIHZhbHVlOiBuZXdMaXN0ZW5lcixcbiAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICByZW1vdmVMaXN0ZW5lcjogc2hvdWxkUmVtb3ZlTGlzdGVuZXIsXG4gICAgICAgIGFkZExpc3RlbmVyOiBzaG91bGRBZGRMaXN0ZW5lcixcbiAgICAgICAgb2xkTGlzdGVuZXIsXG4gICAgICB9KTtcbiAgICBpZiAoc2hvdWxkUmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgIHRoaXMsXG4gICAgICAgIG9sZExpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9uc1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHNob3VsZEFkZExpc3RlbmVyKSB7XG4gICAgICAvLyBCZXdhcmU6IElFMTEgYW5kIENocm9tZSA0MSBkb24ndCBsaWtlIHVzaW5nIHRoZSBsaXN0ZW5lciBhcyB0aGVcbiAgICAgIC8vIG9wdGlvbnMgb2JqZWN0LiBGaWd1cmUgb3V0IGhvdyB0byBkZWFsIHcvIHRoaXMgaW4gSUUxMSAtIG1heWJlXG4gICAgICAvLyBwYXRjaCBhZGRFdmVudExpc3RlbmVyP1xuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgdGhpcyxcbiAgICAgICAgbmV3TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBuZXdMaXN0ZW5lcjtcbiAgfVxuXG4gIGhhbmRsZUV2ZW50KGV2ZW50OiBFdmVudCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUuY2FsbCh0aGlzLm9wdGlvbnM/Lmhvc3QgPz8gdGhpcy5lbGVtZW50LCBldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgRXZlbnRMaXN0ZW5lck9iamVjdCkuaGFuZGxlRXZlbnQoZXZlbnQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgdHlwZSB7RWxlbWVudFBhcnR9O1xuY2xhc3MgRWxlbWVudFBhcnQgaW1wbGVtZW50cyBEaXNjb25uZWN0YWJsZSB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFTEVNRU5UX1BBUlQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfX2RpcmVjdGl2ZT86IERpcmVjdGl2ZTtcblxuICAvLyBUaGlzIGlzIHRvIGVuc3VyZSB0aGF0IGV2ZXJ5IFBhcnQgaGFzIGEgXyRjb21taXR0ZWRWYWx1ZVxuICBfJGNvbW1pdHRlZFZhbHVlOiB1bmRlZmluZWQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHBhcmVudCE6IERpc2Nvbm5lY3RhYmxlO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPiA9IHVuZGVmaW5lZDtcblxuICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50LFxuICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUsXG4gICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICB0aGlzLl8kcGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxuICAvLyBTZWUgY29tbWVudCBpbiBEaXNjb25uZWN0YWJsZSBpbnRlcmZhY2UgZm9yIHdoeSB0aGlzIGlzIGEgZ2V0dGVyXG4gIGdldCBfJGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl8kcGFyZW50Ll8kaXNDb25uZWN0ZWQ7XG4gIH1cblxuICBfJHNldFZhbHVlKHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICdjb21taXQgdG8gZWxlbWVudCBiaW5kaW5nJyxcbiAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgfSk7XG4gICAgcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBFTkQgVVNFUlMgU0hPVUxEIE5PVCBSRUxZIE9OIFRISVMgT0JKRUNULlxuICpcbiAqIFByaXZhdGUgZXhwb3J0cyBmb3IgdXNlIGJ5IG90aGVyIExpdCBwYWNrYWdlcywgbm90IGludGVuZGVkIGZvciB1c2UgYnlcbiAqIGV4dGVybmFsIHVzZXJzLlxuICpcbiAqIFdlIGN1cnJlbnRseSBkbyBub3QgbWFrZSBhIG1hbmdsZWQgcm9sbHVwIGJ1aWxkIG9mIHRoZSBsaXQtc3NyIGNvZGUuIEluIG9yZGVyXG4gKiB0byBrZWVwIGEgbnVtYmVyIG9mIChvdGhlcndpc2UgcHJpdmF0ZSkgdG9wLWxldmVsIGV4cG9ydHMgbWFuZ2xlZCBpbiB0aGVcbiAqIGNsaWVudCBzaWRlIGNvZGUsIHdlIGV4cG9ydCBhIF8kTEggb2JqZWN0IGNvbnRhaW5pbmcgdGhvc2UgbWVtYmVycyAob3JcbiAqIGhlbHBlciBtZXRob2RzIGZvciBhY2Nlc3NpbmcgcHJpdmF0ZSBmaWVsZHMgb2YgdGhvc2UgbWVtYmVycyksIGFuZCB0aGVuXG4gKiByZS1leHBvcnQgdGhlbSBmb3IgdXNlIGluIGxpdC1zc3IuIFRoaXMga2VlcHMgbGl0LXNzciBhZ25vc3RpYyB0byB3aGV0aGVyIHRoZVxuICogY2xpZW50LXNpZGUgY29kZSBpcyBiZWluZyB1c2VkIGluIGBkZXZgIG1vZGUgb3IgYHByb2RgIG1vZGUuXG4gKlxuICogVGhpcyBoYXMgYSB1bmlxdWUgbmFtZSwgdG8gZGlzYW1iaWd1YXRlIGl0IGZyb20gcHJpdmF0ZSBleHBvcnRzIGluXG4gKiBsaXQtZWxlbWVudCwgd2hpY2ggcmUtZXhwb3J0cyBhbGwgb2YgbGl0LWh0bWwuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IF8kTEggPSB7XG4gIC8vIFVzZWQgaW4gbGl0LXNzclxuICBfYm91bmRBdHRyaWJ1dGVTdWZmaXg6IGJvdW5kQXR0cmlidXRlU3VmZml4LFxuICBfbWFya2VyOiBtYXJrZXIsXG4gIF9tYXJrZXJNYXRjaDogbWFya2VyTWF0Y2gsXG4gIF9IVE1MX1JFU1VMVDogSFRNTF9SRVNVTFQsXG4gIF9nZXRUZW1wbGF0ZUh0bWw6IGdldFRlbXBsYXRlSHRtbCxcbiAgLy8gVXNlZCBpbiB0ZXN0cyBhbmQgcHJpdmF0ZS1zc3Itc3VwcG9ydFxuICBfVGVtcGxhdGVJbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZSxcbiAgX2lzSXRlcmFibGU6IGlzSXRlcmFibGUsXG4gIF9yZXNvbHZlRGlyZWN0aXZlOiByZXNvbHZlRGlyZWN0aXZlLFxuICBfQ2hpbGRQYXJ0OiBDaGlsZFBhcnQsXG4gIF9BdHRyaWJ1dGVQYXJ0OiBBdHRyaWJ1dGVQYXJ0LFxuICBfQm9vbGVhbkF0dHJpYnV0ZVBhcnQ6IEJvb2xlYW5BdHRyaWJ1dGVQYXJ0LFxuICBfRXZlbnRQYXJ0OiBFdmVudFBhcnQsXG4gIF9Qcm9wZXJ0eVBhcnQ6IFByb3BlcnR5UGFydCxcbiAgX0VsZW1lbnRQYXJ0OiBFbGVtZW50UGFydCxcbn07XG5cbi8vIEFwcGx5IHBvbHlmaWxscyBpZiBhdmFpbGFibGVcbmNvbnN0IHBvbHlmaWxsU3VwcG9ydCA9IERFVl9NT0RFXG4gID8gZ2xvYmFsLmxpdEh0bWxQb2x5ZmlsbFN1cHBvcnREZXZNb2RlXG4gIDogZ2xvYmFsLmxpdEh0bWxQb2x5ZmlsbFN1cHBvcnQ7XG5wb2x5ZmlsbFN1cHBvcnQ/LihUZW1wbGF0ZSwgQ2hpbGRQYXJ0KTtcblxuLy8gSU1QT1JUQU5UOiBkbyBub3QgY2hhbmdlIHRoZSBwcm9wZXJ0eSBuYW1lIG9yIHRoZSBhc3NpZ25tZW50IGV4cHJlc3Npb24uXG4vLyBUaGlzIGxpbmUgd2lsbCBiZSB1c2VkIGluIHJlZ2V4ZXMgdG8gc2VhcmNoIGZvciBsaXQtaHRtbCB1c2FnZS5cbihnbG9iYWwubGl0SHRtbFZlcnNpb25zID8/PSBbXSkucHVzaCgnMy4yLjEnKTtcbmlmIChERVZfTU9ERSAmJiBnbG9iYWwubGl0SHRtbFZlcnNpb25zLmxlbmd0aCA+IDEpIHtcbiAgaXNzdWVXYXJuaW5nIShcbiAgICAnbXVsdGlwbGUtdmVyc2lvbnMnLFxuICAgIGBNdWx0aXBsZSB2ZXJzaW9ucyBvZiBMaXQgbG9hZGVkLiBgICtcbiAgICAgIGBMb2FkaW5nIG11bHRpcGxlIHZlcnNpb25zIGlzIG5vdCByZWNvbW1lbmRlZC5gXG4gICk7XG59XG5cbi8qKlxuICogUmVuZGVycyBhIHZhbHVlLCB1c3VhbGx5IGEgbGl0LWh0bWwgVGVtcGxhdGVSZXN1bHQsIHRvIHRoZSBjb250YWluZXIuXG4gKlxuICogVGhpcyBleGFtcGxlIHJlbmRlcnMgdGhlIHRleHQgXCJIZWxsbywgWm9lIVwiIGluc2lkZSBhIHBhcmFncmFwaCB0YWcsIGFwcGVuZGluZ1xuICogaXQgdG8gdGhlIGNvbnRhaW5lciBgZG9jdW1lbnQuYm9keWAuXG4gKlxuICogYGBganNcbiAqIGltcG9ydCB7aHRtbCwgcmVuZGVyfSBmcm9tICdsaXQnO1xuICpcbiAqIGNvbnN0IG5hbWUgPSBcIlpvZVwiO1xuICogcmVuZGVyKGh0bWxgPHA+SGVsbG8sICR7bmFtZX0hPC9wPmAsIGRvY3VtZW50LmJvZHkpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHZhbHVlIEFueSBbcmVuZGVyYWJsZVxuICogICB2YWx1ZV0oaHR0cHM6Ly9saXQuZGV2L2RvY3MvdGVtcGxhdGVzL2V4cHJlc3Npb25zLyNjaGlsZC1leHByZXNzaW9ucyksXG4gKiAgIHR5cGljYWxseSBhIHtAbGlua2NvZGUgVGVtcGxhdGVSZXN1bHR9IGNyZWF0ZWQgYnkgZXZhbHVhdGluZyBhIHRlbXBsYXRlIHRhZ1xuICogICBsaWtlIHtAbGlua2NvZGUgaHRtbH0gb3Ige0BsaW5rY29kZSBzdmd9LlxuICogQHBhcmFtIGNvbnRhaW5lciBBIERPTSBjb250YWluZXIgdG8gcmVuZGVyIHRvLiBUaGUgZmlyc3QgcmVuZGVyIHdpbGwgYXBwZW5kXG4gKiAgIHRoZSByZW5kZXJlZCB2YWx1ZSB0byB0aGUgY29udGFpbmVyLCBhbmQgc3Vic2VxdWVudCByZW5kZXJzIHdpbGxcbiAqICAgZWZmaWNpZW50bHkgdXBkYXRlIHRoZSByZW5kZXJlZCB2YWx1ZSBpZiB0aGUgc2FtZSByZXN1bHQgdHlwZSB3YXNcbiAqICAgcHJldmlvdXNseSByZW5kZXJlZCB0aGVyZS5cbiAqIEBwYXJhbSBvcHRpb25zIFNlZSB7QGxpbmtjb2RlIFJlbmRlck9wdGlvbnN9IGZvciBvcHRpb25zIGRvY3VtZW50YXRpb24uXG4gKiBAc2VlXG4gKiB7QGxpbmsgaHR0cHM6Ly9saXQuZGV2L2RvY3MvbGlicmFyaWVzL3N0YW5kYWxvbmUtdGVtcGxhdGVzLyNyZW5kZXJpbmctbGl0LWh0bWwtdGVtcGxhdGVzfCBSZW5kZXJpbmcgTGl0IEhUTUwgVGVtcGxhdGVzfVxuICovXG5leHBvcnQgY29uc3QgcmVuZGVyID0gKFxuICB2YWx1ZTogdW5rbm93bixcbiAgY29udGFpbmVyOiBIVE1MRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsXG4gIG9wdGlvbnM/OiBSZW5kZXJPcHRpb25zXG4pOiBSb290UGFydCA9PiB7XG4gIGlmIChERVZfTU9ERSAmJiBjb250YWluZXIgPT0gbnVsbCkge1xuICAgIC8vIEdpdmUgYSBjbGVhcmVyIGVycm9yIG1lc3NhZ2UgdGhhblxuICAgIC8vICAgICBVbmNhdWdodCBUeXBlRXJyb3I6IENhbm5vdCByZWFkIHByb3BlcnRpZXMgb2YgbnVsbCAocmVhZGluZ1xuICAgIC8vICAgICAnXyRsaXRQYXJ0JCcpXG4gICAgLy8gd2hpY2ggcmVhZHMgbGlrZSBhbiBpbnRlcm5hbCBMaXQgZXJyb3IuXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgVGhlIGNvbnRhaW5lciB0byByZW5kZXIgaW50byBtYXkgbm90IGJlICR7Y29udGFpbmVyfWApO1xuICB9XG4gIGNvbnN0IHJlbmRlcklkID0gREVWX01PREUgPyBkZWJ1Z0xvZ1JlbmRlcklkKysgOiAwO1xuICBjb25zdCBwYXJ0T3duZXJOb2RlID0gb3B0aW9ucz8ucmVuZGVyQmVmb3JlID8/IGNvbnRhaW5lcjtcbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgbGV0IHBhcnQ6IENoaWxkUGFydCA9IChwYXJ0T3duZXJOb2RlIGFzIGFueSlbJ18kbGl0UGFydCQnXTtcbiAgZGVidWdMb2dFdmVudCAmJlxuICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAga2luZDogJ2JlZ2luIHJlbmRlcicsXG4gICAgICBpZDogcmVuZGVySWQsXG4gICAgICB2YWx1ZSxcbiAgICAgIGNvbnRhaW5lcixcbiAgICAgIG9wdGlvbnMsXG4gICAgICBwYXJ0LFxuICAgIH0pO1xuICBpZiAocGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgZW5kTm9kZSA9IG9wdGlvbnM/LnJlbmRlckJlZm9yZSA/PyBudWxsO1xuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAocGFydE93bmVyTm9kZSBhcyBhbnkpWydfJGxpdFBhcnQkJ10gPSBwYXJ0ID0gbmV3IENoaWxkUGFydChcbiAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoY3JlYXRlTWFya2VyKCksIGVuZE5vZGUpLFxuICAgICAgZW5kTm9kZSxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIG9wdGlvbnMgPz8ge31cbiAgICApO1xuICB9XG4gIHBhcnQuXyRzZXRWYWx1ZSh2YWx1ZSk7XG4gIGRlYnVnTG9nRXZlbnQgJiZcbiAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgIGtpbmQ6ICdlbmQgcmVuZGVyJyxcbiAgICAgIGlkOiByZW5kZXJJZCxcbiAgICAgIHZhbHVlLFxuICAgICAgY29udGFpbmVyLFxuICAgICAgb3B0aW9ucyxcbiAgICAgIHBhcnQsXG4gICAgfSk7XG4gIHJldHVybiBwYXJ0IGFzIFJvb3RQYXJ0O1xufTtcblxuaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICByZW5kZXIuc2V0U2FuaXRpemVyID0gc2V0U2FuaXRpemVyO1xuICByZW5kZXIuY3JlYXRlU2FuaXRpemVyID0gY3JlYXRlU2FuaXRpemVyO1xuICBpZiAoREVWX01PREUpIHtcbiAgICByZW5kZXIuX3Rlc3RPbmx5Q2xlYXJTYW5pdGl6ZXJGYWN0b3J5RG9Ob3RDYWxsT3JFbHNlID1cbiAgICAgIF90ZXN0T25seUNsZWFyU2FuaXRpemVyRmFjdG9yeURvTm90Q2FsbE9yRWxzZTtcbiAgfVxufVxuIiwgImltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnRcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuXCI7XG5pbXBvcnQgeyBQcmVjaXNpb24gfSBmcm9tIFwiLi4vcHJlY2lzaW9uL3ByZWNpc2lvblwiO1xuaW1wb3J0IHsgQ29tcHV0ZVNsYWNrLCBDcml0aWNhbFBhdGggfSBmcm9tIFwiLi4vc2xhY2svc2xhY2tcIjtcbmltcG9ydCB7IEphY29iaWFuLCBVbmNlcnRhaW50eSB9IGZyb20gXCIuLi9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhblwiO1xuXG5jb25zdCBNQVhfUkFORE9NID0gMTAwMDtcblxuY29uc3QgcHJlY2lzaW9uID0gbmV3IFByZWNpc2lvbigyKTtcblxuY29uc3Qgcm5kSW50ID0gKG46IG51bWJlcik6IG51bWJlciA9PiB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuKTtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3JpdGljYWxQYXRoRW50cnkge1xuICBjb3VudDogbnVtYmVyO1xuICB0YXNrczogbnVtYmVyW107XG4gIGR1cmF0aW9uczogbnVtYmVyW107XG59XG5cbi8qKlxuICogU2ltdWxhdGUgdGhlIHVuY2VydGFpbnR5IGluIHRoZSBwbGFuIGFuZCBnZW5lcmF0ZSBwb3NzaWJsZSBhbHRlcm5hdGUgY3JpdGljYWxcbiAqIHBhdGhzLlxuICovXG5leHBvcnQgY29uc3Qgc2ltdWxhdGlvbiA9IChcbiAgcGxhbjogUGxhbixcbiAgbnVtU2ltdWxhdGlvbkxvb3BzOiBudW1iZXJcbik6IE1hcDxzdHJpbmcsIENyaXRpY2FsUGF0aEVudHJ5PiA9PiB7XG4gIC8vIFNpbXVsYXRlIHRoZSB1bmNlcnRhaW50eSBpbiB0aGUgcGxhbiBhbmQgZ2VuZXJhdGUgcG9zc2libGUgYWx0ZXJuYXRlXG4gIC8vIGNyaXRpY2FsIHBhdGhzLlxuXG4gIGNvbnN0IGFsbENyaXRpY2FsUGF0aHMgPSBuZXcgTWFwPHN0cmluZywgQ3JpdGljYWxQYXRoRW50cnk+KCk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1TaW11bGF0aW9uTG9vcHM7IGkrKykge1xuICAgIC8vIEdlbmVyYXRlIHJhbmRvbSBkdXJhdGlvbnMgYmFzZWQgb24gZWFjaCBUYXNrcyB1bmNlcnRhaW50eS5cbiAgICBjb25zdCBkdXJhdGlvbnMgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLm1hcCgodDogVGFzaykgPT4ge1xuICAgICAgY29uc3QgcmF3RHVyYXRpb24gPSBuZXcgSmFjb2JpYW4oXG4gICAgICAgIHQuZHVyYXRpb24sXG4gICAgICAgIHQuZ2V0UmVzb3VyY2UoXCJVbmNlcnRhaW50eVwiKSBhcyBVbmNlcnRhaW50eVxuICAgICAgKS5zYW1wbGUocm5kSW50KE1BWF9SQU5ET00pIC8gTUFYX1JBTkRPTSk7XG4gICAgICByZXR1cm4gcHJlY2lzaW9uLnJvdW5kKHJhd0R1cmF0aW9uKTtcbiAgICB9KTtcblxuICAgIC8vIENvbXB1dGUgdGhlIHNsYWNrIGJhc2VkIG9uIHRob3NlIHJhbmRvbSBkdXJhdGlvbnMuXG4gICAgY29uc3Qgc2xhY2tzUmV0ID0gQ29tcHV0ZVNsYWNrKFxuICAgICAgcGxhbi5jaGFydCxcbiAgICAgICh0OiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4gZHVyYXRpb25zW3Rhc2tJbmRleF0sXG4gICAgICBwcmVjaXNpb24ucm91bmRlcigpXG4gICAgKTtcbiAgICBpZiAoIXNsYWNrc1JldC5vaykge1xuICAgICAgdGhyb3cgc2xhY2tzUmV0LmVycm9yO1xuICAgIH1cblxuICAgIGNvbnN0IGNyaXRpY2FsUGF0aCA9IENyaXRpY2FsUGF0aChzbGFja3NSZXQudmFsdWUsIHByZWNpc2lvbi5yb3VuZGVyKCkpO1xuICAgIGNvbnN0IGNyaXRpY2FsUGF0aEFzU3RyaW5nID0gYCR7Y3JpdGljYWxQYXRofWA7XG4gICAgbGV0IHBhdGhFbnRyeSA9IGFsbENyaXRpY2FsUGF0aHMuZ2V0KGNyaXRpY2FsUGF0aEFzU3RyaW5nKTtcbiAgICBpZiAocGF0aEVudHJ5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHBhdGhFbnRyeSA9IHtcbiAgICAgICAgY291bnQ6IDAsXG4gICAgICAgIHRhc2tzOiBjcml0aWNhbFBhdGgsXG4gICAgICAgIGR1cmF0aW9uczogZHVyYXRpb25zLFxuICAgICAgfTtcbiAgICAgIGFsbENyaXRpY2FsUGF0aHMuc2V0KGNyaXRpY2FsUGF0aEFzU3RyaW5nLCBwYXRoRW50cnkpO1xuICAgIH1cbiAgICBwYXRoRW50cnkuY291bnQrKztcbiAgfVxuXG4gIHJldHVybiBhbGxDcml0aWNhbFBhdGhzO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBDcml0aWNhbFBhdGhUYXNrRW50cnkge1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgZHVyYXRpb246IG51bWJlcjtcbiAgbnVtVGltZXNBcHBlYXJlZDogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgY3JpdGljYWxUYXNrRnJlcXVlbmNpZXMgPSAoXG4gIGFsbENyaXRpY2FsUGF0aHM6IE1hcDxzdHJpbmcsIENyaXRpY2FsUGF0aEVudHJ5PixcbiAgcGxhbjogUGxhblxuKTogQ3JpdGljYWxQYXRoVGFza0VudHJ5W10gPT4ge1xuICBjb25zdCBjcml0aWFsVGFza3M6IE1hcDxudW1iZXIsIENyaXRpY2FsUGF0aFRhc2tFbnRyeT4gPSBuZXcgTWFwKCk7XG5cbiAgYWxsQ3JpdGljYWxQYXRocy5mb3JFYWNoKCh2YWx1ZTogQ3JpdGljYWxQYXRoRW50cnkpID0+IHtcbiAgICB2YWx1ZS50YXNrcy5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgbGV0IHRhc2tFbnRyeSA9IGNyaXRpYWxUYXNrcy5nZXQodGFza0luZGV4KTtcbiAgICAgIGlmICh0YXNrRW50cnkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0YXNrRW50cnkgPSB7XG4gICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgZHVyYXRpb246IHBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5kdXJhdGlvbixcbiAgICAgICAgICBudW1UaW1lc0FwcGVhcmVkOiAwLFxuICAgICAgICB9O1xuICAgICAgICBjcml0aWFsVGFza3Muc2V0KHRhc2tJbmRleCwgdGFza0VudHJ5KTtcbiAgICAgIH1cbiAgICAgIHRhc2tFbnRyeS5udW1UaW1lc0FwcGVhcmVkICs9IHZhbHVlLmNvdW50O1xuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gWy4uLmNyaXRpYWxUYXNrcy52YWx1ZXMoKV0uc29ydChcbiAgICAoYTogQ3JpdGljYWxQYXRoVGFza0VudHJ5LCBiOiBDcml0aWNhbFBhdGhUYXNrRW50cnkpOiBudW1iZXIgPT4ge1xuICAgICAgcmV0dXJuIGIuZHVyYXRpb24gLSBhLmR1cmF0aW9uO1xuICAgIH1cbiAgKTtcbn07XG4iLCAiaW1wb3J0IHtcbiAgRHVwVGFza09wLFxuICBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wLFxuICBTZXRUYXNrTmFtZU9wLFxuICBTcGxpdFRhc2tPcCxcbn0gZnJvbSBcIi4uL29wcy9jaGFydFwiO1xuaW1wb3J0IHsgU2V0TWV0cmljVmFsdWVPcCB9IGZyb20gXCIuLi9vcHMvbWV0cmljc1wiO1xuaW1wb3J0IHsgT3AsIGFwcGx5QWxsT3BzVG9QbGFuIH0gZnJvbSBcIi4uL29wcy9vcHNcIjtcbmltcG9ydCB7XG4gIEFkZFJlc291cmNlT3AsXG4gIEFkZFJlc291cmNlT3B0aW9uT3AsXG4gIFNldFJlc291cmNlVmFsdWVPcCxcbn0gZnJvbSBcIi4uL29wcy9yZXNvdXJjZXNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuXCI7XG5cbmNvbnN0IHBlb3BsZTogc3RyaW5nW10gPSBbXCJGcmVkXCIsIFwiQmFybmV5XCIsIFwiV2lsbWFcIiwgXCJCZXR0eVwiXTtcblxuY29uc3QgRFVSQVRJT04gPSAxMDA7XG5cbmNvbnN0IHJuZEludCA9IChuOiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbik7XG59O1xuXG5jb25zdCBybmREdXJhdGlvbiA9ICgpOiBudW1iZXIgPT4ge1xuICByZXR1cm4gcm5kSW50KERVUkFUSU9OKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZVJhbmRvbVBsYW4gPSAoKTogUGxhbiA9PiB7XG4gIGNvbnN0IHBsYW4gPSBuZXcgUGxhbigpO1xuICBsZXQgdGFza0lEID0gMDtcblxuICBjb25zdCBvcHM6IE9wW10gPSBbQWRkUmVzb3VyY2VPcChcIlBlcnNvblwiKV07XG5cbiAgcGVvcGxlLmZvckVhY2goKHBlcnNvbjogc3RyaW5nKSA9PiB7XG4gICAgb3BzLnB1c2goQWRkUmVzb3VyY2VPcHRpb25PcChcIlBlcnNvblwiLCBwZXJzb24pKTtcbiAgfSk7XG5cbiAgb3BzLnB1c2goXG4gICAgSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCgwKSxcbiAgICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgMSksXG4gICAgU2V0VGFza05hbWVPcCgxLCByYW5kb21UYXNrTmFtZSgpKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIDEpLFxuICAgIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibW9kZXJhdGVcIiwgMSlcbiAgKTtcblxuICBsZXQgbnVtVGFza3MgPSAxO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDE1OyBpKyspIHtcbiAgICBsZXQgaW5kZXggPSBybmRJbnQobnVtVGFza3MpICsgMTtcbiAgICBvcHMucHVzaChcbiAgICAgIFNwbGl0VGFza09wKGluZGV4KSxcbiAgICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCBybmREdXJhdGlvbigpLCBpbmRleCArIDEpLFxuICAgICAgU2V0VGFza05hbWVPcChpbmRleCArIDEsIHJhbmRvbVRhc2tOYW1lKCkpLFxuICAgICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIHBlb3BsZVtybmRJbnQocGVvcGxlLmxlbmd0aCldLCBpbmRleCArIDEpLFxuICAgICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCBpbmRleCArIDEpXG4gICAgKTtcbiAgICBudW1UYXNrcysrO1xuICAgIGluZGV4ID0gcm5kSW50KG51bVRhc2tzKSArIDE7XG4gICAgb3BzLnB1c2goXG4gICAgICBEdXBUYXNrT3AoaW5kZXgpLFxuICAgICAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIHJuZER1cmF0aW9uKCksIGluZGV4ICsgMSksXG4gICAgICBTZXRUYXNrTmFtZU9wKGluZGV4ICsgMSwgcmFuZG9tVGFza05hbWUoKSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIGluZGV4ICsgMSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcIm1vZGVyYXRlXCIsIGluZGV4ICsgMSlcbiAgICApO1xuICAgIG51bVRhc2tzKys7XG4gIH1cblxuICBjb25zdCByZXMgPSBhcHBseUFsbE9wc1RvUGxhbihvcHMsIHBsYW4pO1xuXG4gIGlmICghcmVzLm9rKSB7XG4gICAgY29uc29sZS5sb2cocmVzLmVycm9yKTtcbiAgfVxuICByZXR1cm4gcGxhbjtcbn07XG5cbmNvbnN0IHBhcnRzID0gW1xuICBcImxvcmVtXCIsXG4gIFwiaXBzdW1cIixcbiAgXCJkb2xvclwiLFxuICBcInNpdFwiLFxuICBcImFtZXRcIixcbiAgXCJjb25zZWN0ZXR1clwiLFxuICBcImFkaXBpc2NpbmdcIixcbiAgXCJlbGl0XCIsXG4gIFwic2VkXCIsXG4gIFwiZG9cIixcbiAgXCJlaXVzbW9kXCIsXG4gIFwidGVtcG9yXCIsXG4gIFwiaW5jaWRpZHVudFwiLFxuICBcInV0XCIsXG4gIFwibGFib3JlXCIsXG4gIFwiZXRcIixcbiAgXCJkb2xvcmVcIixcbiAgXCJtYWduYVwiLFxuICBcImFsaXF1YVwiLFxuICBcInV0XCIsXG4gIFwiZW5pbVwiLFxuICBcImFkXCIsXG4gIFwibWluaW1cIixcbiAgXCJ2ZW5pYW1cIixcbiAgXCJxdWlzXCIsXG4gIFwibm9zdHJ1ZFwiLFxuICBcImV4ZXJjaXRhdGlvblwiLFxuICBcInVsbGFtY29cIixcbiAgXCJsYWJvcmlzXCIsXG4gIFwibmlzaVwiLFxuICBcInV0XCIsXG4gIFwiYWxpcXVpcFwiLFxuICBcImV4XCIsXG4gIFwiZWFcIixcbiAgXCJjb21tb2RvXCIsXG4gIFwiY29uc2VxdWF0XCIsXG4gIFwiZXVpc1wiLFxuICBcImF1dGVcIixcbiAgXCJpcnVyZVwiLFxuICBcImRvbG9yXCIsXG4gIFwiaW5cIixcbiAgXCJyZXByZWhlbmRlcml0XCIsXG4gIFwiaW5cIixcbiAgXCJ2b2x1cHRhdGVcIixcbiAgXCJ2ZWxpdFwiLFxuICBcImVzc2VcIixcbiAgXCJjaWxsdW1cIixcbiAgXCJkb2xvcmVcIixcbiAgXCJldVwiLFxuICBcImZ1Z2lhdFwiLFxuICBcIm51bGxhXCIsXG4gIFwicGFyaWF0dXJcIixcbiAgXCJleGNlcHRldXJcIixcbiAgXCJzaW50XCIsXG4gIFwib2NjYWVjYXRcIixcbiAgXCJjdXBpZGF0YXRcIixcbiAgXCJub25cIixcbiAgXCJwcm9pZGVudFwiLFxuICBcInN1bnRcIixcbiAgXCJpblwiLFxuICBcImN1bHBhXCIsXG4gIFwicXVpXCIsXG4gIFwib2ZmaWNpYVwiLFxuICBcImRlc2VydW50XCIsXG4gIFwibW9sbGl0XCIsXG4gIFwiYW5pbVwiLFxuICBcImlkXCIsXG4gIFwiZXN0XCIsXG4gIFwibGFib3J1bVwiLFxuXTtcblxuY29uc3QgcGFydHNMZW5ndGggPSBwYXJ0cy5sZW5ndGg7XG5cbmNvbnN0IHJhbmRvbVRhc2tOYW1lID0gKCk6IHN0cmluZyA9PlxuICBgJHtwYXJ0c1tybmRJbnQocGFydHNMZW5ndGgpXX0gJHtwYXJ0c1tybmRJbnQocGFydHNMZW5ndGgpXX1gO1xuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBPcCB9IGZyb20gXCIuLi9vcHMvb3BzXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uL3Jlc3VsdFwiO1xuXG5leHBvcnQgdHlwZSBQb3N0QWN0b25Xb3JrID0gXCJcIiB8IFwicGFpbnRDaGFydFwiIHwgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjtcblxuZXhwb3J0IGludGVyZmFjZSBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yaztcbiAgdW5kbzogYm9vbGVhbjsgLy8gSWYgdHJ1ZSBpbmNsdWRlIGluIHVuZG8vcmVkbyBhY3Rpb25zLlxuICBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUmVzdWx0PEFjdGlvbj47XG59XG5cbmV4cG9ydCBjbGFzcyBOT09QQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiRG9lcyBub3RoaW5nXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgcmV0dXJuIG9rKG5ldyBOT09QQWN0aW9uKCkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25Gcm9tT3Age1xuICBuYW1lOiBzdHJpbmcgPSBcIkFjdGlvbkZyb21PcFwiO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJBY3Rpb24gY29uc3RydWN0ZWQgZGlyZWN0bHkgZnJvbSBhbiBPcC5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3Rvbldvcms7XG4gIHVuZG86IGJvb2xlYW47XG5cbiAgb3A6IE9wO1xuXG4gIGNvbnN0cnVjdG9yKG9wOiBPcCwgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmssIHVuZG86IGJvb2xlYW4pIHtcbiAgICB0aGlzLnBvc3RBY3Rpb25Xb3JrID0gcG9zdEFjdGlvbldvcms7XG4gICAgdGhpcy51bmRvID0gdW5kbztcbiAgICB0aGlzLm9wID0gb3A7XG4gIH1cblxuICBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUmVzdWx0PEFjdGlvbj4ge1xuICAgIGNvbnN0IHJldCA9IHRoaXMub3AuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgU2VhcmNoVGFza1BhbmVsIH0gZnJvbSBcIi4uLy4uL3NlYXJjaC9zZWFyY2gtdGFzay1wYW5lbFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgR29Ub1NlYXJjaEFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIk1vdmVzIGZvY3VzIHRvIHNlYXJjaCBjb250cm9sLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBkbyhfZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFJlc3VsdDxBY3Rpb24+IHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3I8U2VhcmNoVGFza1BhbmVsPihcInNlYXJjaC10YXNrLXBhbmVsXCIpIVxuICAgICAgLnNldEtleWJvYXJkRm9jdXNUb0lucHV0KFwibmFtZS1vbmx5XCIpO1xuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgR29Ub0Z1bGxTZWFyY2hBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID1cbiAgICBcIk1vdmVzIGZvY3VzIHRvIHNlYXJjaCBjb250cm9sIGFuZCBkb2VzIGEgZnVsbCBzZWFyY2ggb2YgYWxsIHJlc291cmNlIHZhbHVlcy5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgZG8oX2V4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yPFNlYXJjaFRhc2tQYW5lbD4oXCJzZWFyY2gtdGFzay1wYW5lbFwiKSFcbiAgICAgIC5zZXRLZXlib2FyZEZvY3VzVG9JbnB1dChcImZ1bGwtaW5mb1wiKTtcbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIEhlbHBBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJEaXNwbGF5cyB0aGUgaGVscCBkaWFsb2cuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgZXhwbGFuTWFpblxuICAgICAgLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwia2V5Ym9hcmQtbWFwLWRpYWxvZ1wiKSFcbiAgICAgIC5zaG93TW9kYWwoKTtcbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIFJlc2V0Wm9vbUFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIlVuZG9lcyB0aGUgem9vbS5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBhaW50Q2hhcnRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgZXhwbGFuTWFpbi5kaXNwbGF5UmFuZ2UgPSBudWxsO1xuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQge1xuICBEZWxldGVUYXNrT3AsXG4gIER1cFRhc2tPcCxcbiAgSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCxcbiAgU3BsaXRUYXNrT3AsXG59IGZyb20gXCIuLi8uLi9vcHMvY2hhcnRcIjtcbmltcG9ydCB7IFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi4vLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IGVycm9yLCBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Gcm9tT3AsIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBTcGxpdFRhc2tBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJTcGxpdHMgYSB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgdGFzayBtdXN0IGJlIHNlbGVjdGVkIGZpcnN0LlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IFNwbGl0VGFza09wKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrKS5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXBUYXNrQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiRHVwbGljYXRlcyBhIHRhc2suXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IHRydWU7XG5cbiAgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFJlc3VsdDxBY3Rpb24+IHtcbiAgICBpZiAoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2sgPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiQSB0YXNrIG11c3QgYmUgc2VsZWN0ZWQgZmlyc3QuXCIpKTtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gRHVwVGFza09wKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrKS5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOZXdUYXNrQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiQ3JlYXRlcyBhIG5ldyB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgbGV0IHJldCA9IEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AoMCkuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlVGFza0FjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkRlbGV0ZXMgYSB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgdGFzayBtdXN0IGJlIHNlbGVjdGVkIGZpcnN0LlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IERlbGV0ZVRhc2tPcChleHBsYW5NYWluLnNlbGVjdGVkVGFzaykuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9IC0xO1xuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG4iLCAiLyoqIFdoZW4gdGhlIGdpdmVuIGVsZW1lbnQgaXMgY2xpY2tlZCwgdGhlbiB0b2dnbGUgdGhlIGBkYXJrbW9kZWAgY2xhc3Mgb24gdGhlXG4gKiBib2R5IGVsZW1lbnQuICovXG5leHBvcnQgY29uc3QgdG9nZ2xlVGhlbWUgPSAoKSA9PiB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcImRhcmttb2RlXCIpO1xufTtcbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IHRvZ2dsZVRoZW1lIH0gZnJvbSBcIi4uLy4uL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlclwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgVG9nZ2xlRGFya01vZGVBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJUb2dnbGVzIGRhcmsgbW9kZS5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBhaW50Q2hhcnRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFJlc3VsdDxBY3Rpb24+IHtcbiAgICB0b2dnbGVUaGVtZSgpO1xuICAgIC8vIFRvZ2dsZURhcmtNb2RlQWN0aW9uIGlzIGl0cyBvd24gaW52ZXJzZS5cbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IHRvZ2dsZVRoZW1lIH0gZnJvbSBcIi4uLy4uL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlclwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgVG9nZ2xlUmFkYXJBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJUb2dnbGVzIHRoZSByYWRhciB2aWV3LlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUmVzdWx0PEFjdGlvbj4ge1xuICAgIGV4cGxhbk1haW4udG9nZ2xlUmFkYXIoKTtcbiAgICAvLyBUb2dnbGVSYWRhckFjdGlvbiBpcyBpdHMgb3duIGludmVyc2UuXG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIE5PT1BBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5pbXBvcnQgeyB1bmRvIH0gZnJvbSBcIi4uL2V4ZWN1dGVcIjtcblxuZXhwb3J0IGNsYXNzIFVuZG9BY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJVbmRvZXMgdGhlIGxhc3QgYWN0aW9uLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUmVzdWx0PEFjdGlvbj4ge1xuICAgIGNvbnN0IHJldCA9IHVuZG8oZXhwbGFuTWFpbik7XG5cbiAgICAvLyBVbmRvIGlzIG5vdCBhIHJldmVyc2libGUgYWN0aW9uLlxuICAgIHJldHVybiBvayhuZXcgTk9PUEFjdGlvbigpKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbi50c1wiO1xuaW1wb3J0IHtcbiAgR29Ub0Z1bGxTZWFyY2hBY3Rpb24sXG4gIEdvVG9TZWFyY2hBY3Rpb24sXG59IGZyb20gXCIuL2FjdGlvbnMvZ290b1NlYXJjaC50c1wiO1xuaW1wb3J0IHsgSGVscEFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvaGVscC50c1wiO1xuaW1wb3J0IHsgUmVzZXRab29tQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy9yZXNldFpvb20udHNcIjtcbmltcG9ydCB7XG4gIERlbGV0ZVRhc2tBY3Rpb24sXG4gIER1cFRhc2tBY3Rpb24sXG4gIE5ld1Rhc2tBY3Rpb24sXG4gIFNwbGl0VGFza0FjdGlvbixcbn0gZnJvbSBcIi4vYWN0aW9ucy90YXNrcy50c1wiO1xuaW1wb3J0IHsgVG9nZ2xlRGFya01vZGVBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3RvZ2dsZURhcmtNb2RlLnRzXCI7XG5pbXBvcnQgeyBUb2dnbGVSYWRhckFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvdG9nZ2xlUmFkYXIudHNcIjtcbmltcG9ydCB7IFVuZG9BY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3VuZG8udHNcIjtcblxuZXhwb3J0IHR5cGUgQWN0aW9uTmFtZXMgPVxuICB8IFwiVG9nZ2xlRGFya01vZGVBY3Rpb25cIlxuICB8IFwiVG9nZ2xlUmFkYXJBY3Rpb25cIlxuICB8IFwiUmVzZXRab29tQWN0aW9uXCJcbiAgfCBcIlVuZG9BY3Rpb25cIlxuICB8IFwiSGVscEFjdGlvblwiXG4gIHwgXCJTcGxpdFRhc2tBY3Rpb25cIlxuICB8IFwiRHVwVGFza0FjdGlvblwiXG4gIHwgXCJOZXdUYXNrQWN0aW9uXCJcbiAgfCBcIkRlbGV0ZVRhc2tBY3Rpb25cIlxuICB8IFwiR29Ub1NlYXJjaEFjdGlvblwiXG4gIHwgXCJHb1RvRnVsbFNlYXJjaEFjdGlvblwiO1xuXG5leHBvcnQgY29uc3QgQWN0aW9uUmVnaXN0cnk6IFJlY29yZDxBY3Rpb25OYW1lcywgQWN0aW9uPiA9IHtcbiAgVG9nZ2xlRGFya01vZGVBY3Rpb246IG5ldyBUb2dnbGVEYXJrTW9kZUFjdGlvbigpLFxuICBUb2dnbGVSYWRhckFjdGlvbjogbmV3IFRvZ2dsZVJhZGFyQWN0aW9uKCksXG4gIFJlc2V0Wm9vbUFjdGlvbjogbmV3IFJlc2V0Wm9vbUFjdGlvbigpLFxuICBVbmRvQWN0aW9uOiBuZXcgVW5kb0FjdGlvbigpLFxuICBIZWxwQWN0aW9uOiBuZXcgSGVscEFjdGlvbigpLFxuICBTcGxpdFRhc2tBY3Rpb246IG5ldyBTcGxpdFRhc2tBY3Rpb24oKSxcbiAgRHVwVGFza0FjdGlvbjogbmV3IER1cFRhc2tBY3Rpb24oKSxcbiAgTmV3VGFza0FjdGlvbjogbmV3IE5ld1Rhc2tBY3Rpb24oKSxcbiAgRGVsZXRlVGFza0FjdGlvbjogbmV3IERlbGV0ZVRhc2tBY3Rpb24oKSxcbiAgR29Ub1NlYXJjaEFjdGlvbjogbmV3IEdvVG9TZWFyY2hBY3Rpb24oKSxcbiAgR29Ub0Z1bGxTZWFyY2hBY3Rpb246IG5ldyBHb1RvRnVsbFNlYXJjaEFjdGlvbigpLFxufTtcbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpbi50c1wiO1xuaW1wb3J0IHsgT3AgfSBmcm9tIFwiLi4vb3BzL29wcy50c1wiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IEFjdGlvbiwgQWN0aW9uRnJvbU9wLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4vYWN0aW9uLnRzXCI7XG5pbXBvcnQgeyBBY3Rpb25OYW1lcywgQWN0aW9uUmVnaXN0cnkgfSBmcm9tIFwiLi9yZWdpc3RyeS50c1wiO1xuXG5jb25zdCB1bmRvU3RhY2s6IEFjdGlvbltdID0gW107XG5cbmV4cG9ydCBjb25zdCB1bmRvID0gKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8bnVsbD4gPT4ge1xuICBjb25zdCBhY3Rpb24gPSB1bmRvU3RhY2sucG9wKCkhO1xuICBpZiAoIWFjdGlvbikge1xuICAgIHJldHVybiBvayhudWxsKTtcbiAgfVxuXG4gIHJldHVybiBleGVjdXRlVW5kbyhhY3Rpb24sIGV4cGxhbk1haW4pO1xufTtcblxuZXhwb3J0IGNvbnN0IGV4ZWN1dGUgPSAoXG4gIG5hbWU6IEFjdGlvbk5hbWVzLFxuICBleHBsYW5NYWluOiBFeHBsYW5NYWluXG4pOiBSZXN1bHQ8bnVsbD4gPT4ge1xuICBjb25zdCBhY3Rpb24gPSBBY3Rpb25SZWdpc3RyeVtuYW1lXTtcbiAgY29uc3QgcmV0ID0gYWN0aW9uLmRvKGV4cGxhbk1haW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgc3dpdGNoIChhY3Rpb24ucG9zdEFjdGlvbldvcmspIHtcbiAgICBjYXNlIFwiXCI6XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwicGFpbnRDaGFydFwiOlxuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgYnJlYWs7XG4gIH1cbiAgaWYgKGFjdGlvbi51bmRvKSB7XG4gICAgdW5kb1N0YWNrLnB1c2gocmV0LnZhbHVlKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59O1xuXG5leHBvcnQgY29uc3QgZXhlY3V0ZU9wID0gKFxuICBvcDogT3AsXG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrLFxuICB1bmRvOiBib29sZWFuLFxuICBleHBsYW5NYWluOiBFeHBsYW5NYWluXG4pOiBSZXN1bHQ8bnVsbD4gPT4ge1xuICBjb25zdCBhY3Rpb24gPSBuZXcgQWN0aW9uRnJvbU9wKG9wLCBwb3N0QWN0aW9uV29yaywgdW5kbyk7XG4gIGNvbnN0IHJldCA9IGFjdGlvbi5kbyhleHBsYW5NYWluKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIHN3aXRjaCAoYWN0aW9uLnBvc3RBY3Rpb25Xb3JrKSB7XG4gICAgY2FzZSBcIlwiOlxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFwicGFpbnRDaGFydFwiOlxuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuICBpZiAoYWN0aW9uLnVuZG8pIHtcbiAgICB1bmRvU3RhY2sucHVzaChyZXQudmFsdWUpO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn07XG5cbmNvbnN0IGV4ZWN1dGVVbmRvID0gKGFjdGlvbjogQWN0aW9uLCBleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUmVzdWx0PG51bGw+ID0+IHtcbiAgY29uc3QgcmV0ID0gYWN0aW9uLmRvKGV4cGxhbk1haW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgc3dpdGNoIChhY3Rpb24ucG9zdEFjdGlvbldvcmspIHtcbiAgICBjYXNlIFwiXCI6XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwYWludENoYXJ0XCI6XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiOlxuICAgICAgZXhwbGFuTWFpbi5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn07XG4iLCAiaW1wb3J0IHsgZXhlY3V0ZSB9IGZyb20gXCIuLi9hY3Rpb24vZXhlY3V0ZVwiO1xuaW1wb3J0IHsgQWN0aW9uTmFtZXMgfSBmcm9tIFwiLi4vYWN0aW9uL3JlZ2lzdHJ5XCI7XG5pbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuXG5leHBvcnQgY29uc3QgS2V5TWFwOiBNYXA8c3RyaW5nLCBBY3Rpb25OYW1lcz4gPSBuZXcgTWFwKFtcbiAgW1wic2hpZnQtY3RybC1SXCIsIFwiVG9nZ2xlUmFkYXJBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtTVwiLCBcIlRvZ2dsZURhcmtNb2RlQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLVpcIiwgXCJSZXNldFpvb21BY3Rpb25cIl0sXG4gIFtcImN0cmwtelwiLCBcIlVuZG9BY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtSFwiLCBcIkhlbHBBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtfFwiLCBcIlNwbGl0VGFza0FjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC1fXCIsIFwiRHVwVGFza0FjdGlvblwiXSxcbiAgW1wiYWx0LUluc2VydFwiLCBcIk5ld1Rhc2tBY3Rpb25cIl0sXG4gIFtcImFsdC1EZWxldGVcIiwgXCJEZWxldGVUYXNrQWN0aW9uXCJdLFxuICBbXCJjdHJsLWZcIiwgXCJHb1RvU2VhcmNoQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLUZcIiwgXCJHb1RvRnVsbFNlYXJjaEFjdGlvblwiXSxcbl0pO1xuXG5sZXQgZXhwbGFuTWFpbjogRXhwbGFuTWFpbjtcblxuZXhwb3J0IGNvbnN0IFN0YXJ0S2V5Ym9hcmRIYW5kbGluZyA9IChlbTogRXhwbGFuTWFpbikgPT4ge1xuICBleHBsYW5NYWluID0gZW07XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIG9uS2V5RG93bik7XG59O1xuXG5jb25zdCBvbktleURvd24gPSAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICBjb25zdCBrZXluYW1lID0gYCR7ZS5zaGlmdEtleSA/IFwic2hpZnQtXCIgOiBcIlwifSR7ZS5jdHJsS2V5ID8gXCJjdHJsLVwiIDogXCJcIn0ke2UubWV0YUtleSA/IFwibWV0YS1cIiA6IFwiXCJ9JHtlLmFsdEtleSA/IFwiYWx0LVwiIDogXCJcIn0ke2Uua2V5fWA7XG4gIGNvbnNvbGUubG9nKGtleW5hbWUpO1xuICBjb25zdCBhY3Rpb25OYW1lID0gS2V5TWFwLmdldChrZXluYW1lKTtcbiAgaWYgKGFjdGlvbk5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnN0IHJldCA9IGV4ZWN1dGUoYWN0aW9uTmFtZSwgZXhwbGFuTWFpbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgY29uc29sZS5sb2cocmV0LmVycm9yKTtcbiAgfVxufTtcbiIsICJpbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBGaWx0ZXJGdW5jIH0gZnJvbSBcIi4uL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wIH0gZnJvbSBcIi4uL29wcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBPcCB9IGZyb20gXCIuLi9vcHMvb3BzLnRzXCI7XG5pbXBvcnQgeyBTZXRSZXNvdXJjZVZhbHVlT3AgfSBmcm9tIFwiLi4vb3BzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgRnJvbUpTT04sIFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBQcmVjaXNpb24gfSBmcm9tIFwiLi4vcHJlY2lzaW9uL3ByZWNpc2lvbi50c1wiO1xuaW1wb3J0IHtcbiAgRElWSURFUl9NT1ZFX0VWRU5ULFxuICBEaXZpZGVyTW92ZSxcbiAgRGl2aWRlck1vdmVSZXN1bHQsXG59IGZyb20gXCIuLi9yZW5kZXJlci9kaXZpZGVybW92ZS9kaXZpZGVybW92ZS50c1wiO1xuaW1wb3J0IHtcbiAgRFJBR19SQU5HRV9FVkVOVCxcbiAgRHJhZ1JhbmdlLFxuICBNb3VzZURyYWcsXG59IGZyb20gXCIuLi9yZW5kZXJlci9tb3VzZWRyYWcvbW91c2VkcmFnLnRzXCI7XG5pbXBvcnQgeyBNb3VzZU1vdmUgfSBmcm9tIFwiLi4vcmVuZGVyZXIvbW91c2Vtb3ZlL21vdXNlbW92ZS50c1wiO1xuaW1wb3J0IHsgRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4uL3JlbmRlcmVyL3JhbmdlL3JhbmdlLnRzXCI7XG5pbXBvcnQge1xuICBSZW5kZXJPcHRpb25zLFxuICBSZW5kZXJSZXN1bHQsXG4gIFRhc2tMYWJlbCxcbiAgVXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zLFxuICByZW5kZXJUYXNrc1RvQ2FudmFzLFxuICBzdWdnZXN0ZWRDYW52YXNIZWlnaHQsXG59IGZyb20gXCIuLi9yZW5kZXJlci9yZW5kZXJlci50c1wiO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi4vcmVuZGVyZXIvc2NhbGUvcG9pbnQudHNcIjtcbmltcG9ydCB7IFNjYWxlIH0gZnJvbSBcIi4uL3JlbmRlcmVyL3NjYWxlL3NjYWxlLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBDb21wdXRlU2xhY2ssIENyaXRpY2FsUGF0aCwgU2xhY2ssIFNwYW4gfSBmcm9tIFwiLi4vc2xhY2svc2xhY2sudHNcIjtcbmltcG9ydCB7IFRoZW1lLCBjb2xvclRoZW1lRnJvbUVsZW1lbnQgfSBmcm9tIFwiLi4vc3R5bGUvdGhlbWUvdGhlbWUudHNcIjtcbmltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7XG4gIENyaXRpY2FsUGF0aFRhc2tFbnRyeSxcbiAgY3JpdGljYWxUYXNrRnJlcXVlbmNpZXMsXG4gIHNpbXVsYXRpb24sXG59IGZyb20gXCIuLi9zaW11bGF0aW9uL3NpbXVsYXRpb24udHNcIjtcbmltcG9ydCB7IGdlbmVyYXRlUmFuZG9tUGxhbiB9IGZyb20gXCIuLi9nZW5lcmF0ZS9nZW5lcmF0ZS50c1wiO1xuaW1wb3J0IHsgZXhlY3V0ZSwgZXhlY3V0ZU9wIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlLnRzXCI7XG5pbXBvcnQgeyBBY3Rpb25Gcm9tT3AgfSBmcm9tIFwiLi4vYWN0aW9uL2FjdGlvbi50c1wiO1xuaW1wb3J0IHsgU3RhcnRLZXlib2FyZEhhbmRsaW5nIH0gZnJvbSBcIi4uL2tleW1hcC9rZXltYXAudHNcIjtcbmltcG9ydCB7IERlbGV0ZVRhc2tPcCwgU2V0VGFza05hbWVPcCB9IGZyb20gXCIuLi9vcHMvY2hhcnQudHNcIjtcblxuY29uc3QgRk9OVF9TSVpFX1BYID0gMzI7XG5cbmNvbnN0IE5VTV9TSU1VTEFUSU9OX0xPT1BTID0gMTAwO1xuXG5jb25zdCBwcmVjaXNpb24gPSBuZXcgUHJlY2lzaW9uKDIpO1xuXG4vKiogVHlwZSBvZiBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCB0YXNrIGhhcyBjaGFuZ2VkLiAqL1xudHlwZSBVcGRhdGVTZWxlY3RlZFRhc2tQYW5lbCA9ICh0YXNrSW5kZXg6IG51bWJlcikgPT4gdm9pZDtcblxuaW50ZXJmYWNlIENyaXRpY2FsUGF0aEVudHJ5IHtcbiAgY291bnQ6IG51bWJlcjtcbiAgdGFza3M6IG51bWJlcltdO1xuICBkdXJhdGlvbnM6IG51bWJlcltdO1xufVxuXG4vLyBCdWlsZHMgdGhlIHRhc2sgcGFuZWwgd2hpY2ggdGhlbiByZXR1cm5zIGEgY2xvc3VyZSB1c2VkIHRvIHVwZGF0ZSB0aGUgcGFuZWxcbi8vIHdpdGggaW5mbyBmcm9tIGEgc3BlY2lmaWMgVGFzay5cbmNvbnN0IGJ1aWxkU2VsZWN0ZWRUYXNrUGFuZWwgPSAoXG4gIHBsYW46IFBsYW4sXG4gIHNlbGVjdGVkVGFza1BhbmVsOiBIVE1MRWxlbWVudCxcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpblxuKTogVXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWwgPT4ge1xuICBjb25zdCBzZWxlY3RlZFRhc2tQYW5lbFRlbXBsYXRlID0gKFxuICAgIHRhc2s6IFRhc2ssXG4gICAgcGxhbjogUGxhblxuICApOiBUZW1wbGF0ZVJlc3VsdCA9PiBodG1sYFxuICAgIDx0YWJsZT5cbiAgICAgIDx0cj5cbiAgICAgICAgPHRkPk5hbWU8L3RkPlxuICAgICAgICA8dGQ+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAudmFsdWU9XCIke3Rhc2submFtZX1cIlxuICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICBleHBsYW5NYWluLnRhc2tOYW1lQ2hhbmdlZChcbiAgICAgICAgICAgICAgICBleHBsYW5NYWluLnNlbGVjdGVkVGFzayxcbiAgICAgICAgICAgICAgICAoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWVcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC90ZD5cbiAgICAgIDwvdHI+XG4gICAgICAke09iamVjdC5lbnRyaWVzKHBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucykubWFwKFxuICAgICAgICAoW3Jlc291cmNlS2V5LCBkZWZuXSkgPT5cbiAgICAgICAgICBodG1sYCA8dHI+XG4gICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCIke3Jlc291cmNlS2V5fVwiPiR7cmVzb3VyY2VLZXl9PC9sYWJlbD5cbiAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgICBpZD1cIiR7cmVzb3VyY2VLZXl9XCJcbiAgICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZXQgPSBleHBsYW5NYWluLnRhc2tSZXNvdXJjZVZhbHVlQ2hhbmdlZChcbiAgICAgICAgICAgICAgICAgICAgZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2ssXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlS2V5LFxuICAgICAgICAgICAgICAgICAgICAoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWVcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICBpZiAoIXJldC5vaykge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIHBvcHVwIGVycm9yIG1lc3NhZ2UuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJldCk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgJHtkZWZuLnZhbHVlcy5tYXAoXG4gICAgICAgICAgICAgICAgICAocmVzb3VyY2VWYWx1ZTogc3RyaW5nKSA9PlxuICAgICAgICAgICAgICAgICAgICBodG1sYDxvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICBuYW1lPSR7cmVzb3VyY2VWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0ZWQ9JHt0YXNrLnJlc291cmNlc1tyZXNvdXJjZUtleV0gPT09IHJlc291cmNlVmFsdWV9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAke3Jlc291cmNlVmFsdWV9XG4gICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPmBcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPC90cj5gXG4gICAgICApfVxuICAgICAgJHtPYmplY3Qua2V5cyhwbGFuLm1ldHJpY0RlZmluaXRpb25zKS5tYXAoXG4gICAgICAgIChrZXk6IHN0cmluZykgPT5cbiAgICAgICAgICBodG1sYCA8dHI+XG4gICAgICAgICAgICA8dGQ+PGxhYmVsIGZvcj1cIiR7a2V5fVwiPiR7a2V5fTwvbGFiZWw+PC90ZD5cbiAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgaWQ9XCIke2tleX1cIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIC52YWx1ZT1cIiR7dGFzay5tZXRyaWNzW2tleV19XCJcbiAgICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZXQgPSBleHBsYW5NYWluLnRhc2tNZXRyaWNWYWx1ZUNoYW5nZWQoXG4gICAgICAgICAgICAgICAgICAgIGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrLFxuICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgIChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gcG9wdXAgZXJyb3IgbWVzc2FnZS5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmV0KTtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDwvdHI+YFxuICAgICAgKX1cbiAgICA8L3RhYmxlPlxuICBgO1xuXG4gIGNvbnN0IHVwZGF0ZVNlbGVjdGVkVGFza1BhbmVsID0gKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKHRhc2tJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJlbmRlcihodG1sYE5vIHRhc2sgc2VsZWN0ZWQuYCwgc2VsZWN0ZWRUYXNrUGFuZWwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0YXNrID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdO1xuICAgIGNvbnNvbGUubG9nKHRhc2spO1xuICAgIHJlbmRlcihzZWxlY3RlZFRhc2tQYW5lbFRlbXBsYXRlKHRhc2ssIHBsYW4pLCBzZWxlY3RlZFRhc2tQYW5lbCk7XG4gIH07XG5cbiAgcmV0dXJuIHVwZGF0ZVNlbGVjdGVkVGFza1BhbmVsO1xufTtcblxuY29uc3QgY3JpdGljYWxQYXRoc1RlbXBsYXRlID0gKFxuICBhbGxDcml0aWNhbFBhdGhzOiBNYXA8c3RyaW5nLCBDcml0aWNhbFBhdGhFbnRyeT4sXG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW5cbik6IFRlbXBsYXRlUmVzdWx0ID0+IGh0bWxgXG4gIDx1bD5cbiAgICAke0FycmF5LmZyb20oYWxsQ3JpdGljYWxQYXRocy5lbnRyaWVzKCkpLm1hcChcbiAgICAgIChba2V5LCB2YWx1ZV0pID0+XG4gICAgICAgIGh0bWxgPGxpXG4gICAgICAgICAgQGNsaWNrPSR7KCkgPT5cbiAgICAgICAgICAgIGV4cGxhbk1haW4ub25Qb3RlbnRpYWxDcml0aWNpYWxQYXRoQ2xpY2soa2V5LCBhbGxDcml0aWNhbFBhdGhzKX1cbiAgICAgICAgPlxuICAgICAgICAgICR7dmFsdWUuY291bnR9IDogJHtrZXl9XG4gICAgICAgIDwvbGk+YFxuICAgICl9XG4gIDwvdWw+XG5gO1xuXG5jb25zdCBjcml0aWNhbFRhc2tGcmVxdWVuY2llc1RlbXBsYXRlID0gKFxuICBwbGFuOiBQbGFuLFxuICBjcml0aWNhbFRhc2tzRHVyYXRpb25EZXNjZW5kaW5nOiBDcml0aWNhbFBhdGhUYXNrRW50cnlbXVxuKSA9PlxuICBodG1sYDx0cj5cbiAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgIDx0aD5EdXJhdGlvbjwvdGg+XG4gICAgICA8dGg+RnJlcXVlbmN5ICglKTwvdGg+XG4gICAgPC90cj5cbiAgICAke2NyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcubWFwKFxuICAgICAgKHRhc2tFbnRyeTogQ3JpdGljYWxQYXRoVGFza0VudHJ5KSA9PlxuICAgICAgICBodG1sYDx0cj5cbiAgICAgICAgICA8dGQ+JHtwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tFbnRyeS50YXNrSW5kZXhdLm5hbWV9PC90ZD5cbiAgICAgICAgICA8dGQ+JHt0YXNrRW50cnkuZHVyYXRpb259PC90ZD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAke01hdGguZmxvb3IoXG4gICAgICAgICAgICAgICgxMDAgKiB0YXNrRW50cnkubnVtVGltZXNBcHBlYXJlZCkgLyBOVU1fU0lNVUxBVElPTl9MT09QU1xuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPmBcbiAgICApfSBgO1xuXG5leHBvcnQgY2xhc3MgRXhwbGFuTWFpbiBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgLyoqIFRoZSBQbGFuIGJlaW5nIGVkaXRlZC4gKi9cbiAgcGxhbjogUGxhbiA9IG5ldyBQbGFuKCk7XG5cbiAgLyoqIFRoZSBzdGFydCBhbmQgZmluaXNoIHRpbWUgZm9yIGVhY2ggVGFzayBpbiB0aGUgUGxhbi4gKi9cbiAgc3BhbnM6IFNwYW5bXSA9IFtdO1xuXG4gIC8qKiBUaGUgdGFzayBpbmRpY2VzIG9mIHRhc2tzIG9uIHRoZSBjcml0aWNhbCBwYXRoLiAqL1xuICBjcml0aWNhbFBhdGg6IG51bWJlcltdID0gW107XG5cbiAgLyoqIFRoZSBzZWxlY3Rpb24gKGluIHRpbWUpIG9mIHRoZSBQbGFuIGN1cnJlbnRseSBiZWluZyB2aWV3ZWQuICovXG4gIGRpc3BsYXlSYW5nZTogRGlzcGxheVJhbmdlIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFNjYWxlIGZvciB0aGUgcmFkYXIgdmlldywgdXNlZCBmb3IgZHJhZyBzZWxlY3RpbmcgYSBkaXNwbGF5UmFuZ2UuICovXG4gIHJhZGFyU2NhbGU6IFNjYWxlIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEFsbCBvZiB0aGUgdHlwZXMgb2YgcmVzb3VyY2VzIGluIHRoZSBwbGFuLiAqL1xuICBncm91cEJ5T3B0aW9uczogc3RyaW5nW10gPSBbXTtcblxuICAvKiogV2hpY2ggb2YgdGhlIHJlc291cmNlcyBhcmUgd2UgY3VycmVudGx5IGdyb3VwaW5nIGJ5LCB3aGVyZSAwIG1lYW5zIG5vXG4gICAqIGdyb3VwaW5nIGlzIGRvbmUuICovXG4gIGdyb3VwQnlPcHRpb25zSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgLyoqIFRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdGFzaywgYXMgYW4gaW5kZXguICovXG4gIHNlbGVjdGVkVGFzazogbnVtYmVyID0gLTE7XG5cbiAgLy8gVUkgZmVhdHVyZXMgdGhhdCBjYW4gYmUgdG9nZ2xlZCBvbiBhbmQgb2ZmLlxuICB0b3BUaW1lbGluZTogYm9vbGVhbiA9IGZhbHNlO1xuICBjcml0aWNhbFBhdGhzT25seTogYm9vbGVhbiA9IGZhbHNlO1xuICBmb2N1c09uVGFzazogYm9vbGVhbiA9IGZhbHNlO1xuICBtb3VzZU1vdmU6IE1vdXNlTW92ZSB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBDYWxsYmFjayB0byBjYWxsIHdoZW4gdGhlIHNlbGVjdGVkIHRhc2sgY2hhbmdlcy4gKi9cbiAgdXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWw6IFVwZGF0ZVNlbGVjdGVkVGFza1BhbmVsIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIENhbGxiYWNrIHRvIGNhbGwgd2hlbiBhIG1vdXNlIG1vdmVzIG92ZXIgdGhlIGNoYXJ0LiAqL1xuICB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M6IFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyB8IG51bGwgPSBudWxsO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgIHRoaXMucGxhbiA9IGdlbmVyYXRlUmFuZG9tUGxhbigpO1xuICAgIHRoaXMucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuXG4gICAgLy8gRHJhZ2dpbmcgb24gdGhlIHJhZGFyLlxuICAgIGNvbnN0IHJhZGFyID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcIiNyYWRhclwiKSE7XG4gICAgbmV3IE1vdXNlRHJhZyhyYWRhcik7XG4gICAgcmFkYXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIERSQUdfUkFOR0VfRVZFTlQsXG4gICAgICB0aGlzLmRyYWdSYW5nZUhhbmRsZXIuYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXG4gICAgKTtcblxuICAgIC8vIERpdmlkZXIgZHJhZ2dpbmcuXG4gICAgY29uc3QgZGl2aWRlciA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCJ2ZXJ0aWNhbC1kaXZpZGVyXCIpITtcbiAgICBuZXcgRGl2aWRlck1vdmUoZG9jdW1lbnQuYm9keSwgZGl2aWRlciwgXCJjb2x1bW5cIik7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoRElWSURFUl9NT1ZFX0VWRU5ULCAoKFxuICAgICAgZTogQ3VzdG9tRXZlbnQ8RGl2aWRlck1vdmVSZXN1bHQ+XG4gICAgKSA9PiB7XG4gICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KFxuICAgICAgICBcImdyaWQtdGVtcGxhdGUtY29sdW1uc1wiLFxuICAgICAgICBgY2FsYygke2UuZGV0YWlsLmJlZm9yZX0lIC0gMTVweCkgMTBweCBhdXRvYFxuICAgICAgKTtcbiAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIH0pIGFzIEV2ZW50TGlzdGVuZXIpO1xuXG4gICAgLy8gQnV0dG9uc1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNyZXNldC16b29tXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgZXhlY3V0ZShcIlJlc2V0Wm9vbUFjdGlvblwiLCB0aGlzKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNkYXJrLW1vZGUtdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgZXhlY3V0ZShcIlRvZ2dsZURhcmtNb2RlQWN0aW9uXCIsIHRoaXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3JhZGFyLXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIGV4ZWN1dGUoXCJUb2dnbGVSYWRhckFjdGlvblwiLCB0aGlzKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiN0b3AtdGltZWxpbmUtdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJjbGlja1wiLFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnRvcFRpbWVsaW5lID0gIXRoaXMudG9wVGltZWxpbmU7XG4gICAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZ3JvdXAtYnktdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy50b2dnbGVHcm91cEJ5KCk7XG4gICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNjcml0aWNhbC1wYXRocy10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcImNsaWNrXCIsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMudG9nZ2xlQ3JpdGljYWxQYXRoc09ubHkoKTtcbiAgICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IG92ZXJsYXlDYW52YXMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTENhbnZhc0VsZW1lbnQ+KFwiI292ZXJsYXlcIikhO1xuICAgIHRoaXMubW91c2VNb3ZlID0gbmV3IE1vdXNlTW92ZShvdmVybGF5Q2FudmFzKTtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG5cbiAgICBvdmVybGF5Q2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHAgPSBuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICAgICAgaWYgKHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRUYXNrID1cbiAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyhwLCBcIm1vdXNlZG93blwiKSB8fCAtMTtcbiAgICAgICAgdGhpcy51cGRhdGVTZWxlY3RlZFRhc2tQYW5lbCEodGhpcy5zZWxlY3RlZFRhc2spO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgb3ZlcmxheUNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHAgPSBuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICAgICAgaWYgKHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2V0Rm9jdXNPblRhc2soXG4gICAgICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MocCwgXCJtb3VzZWRvd25cIikgfHwgLTFcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWwgPSBidWlsZFNlbGVjdGVkVGFza1BhbmVsKFxuICAgICAgdGhpcy5wbGFuLFxuICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwic2VsZWN0ZWQtdGFzay1wYW5lbFwiKSEsXG4gICAgICB0aGlzXG4gICAgKTtcblxuICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWwodGhpcy5zZWxlY3RlZFRhc2spO1xuXG4gICAgLy8gUmVhY3QgdG8gdGhlIHVwbG9hZCBpbnB1dC5cbiAgICBjb25zdCBmaWxlVXBsb2FkID1cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTElucHV0RWxlbWVudD4oXCIjZmlsZS11cGxvYWRcIikhO1xuICAgIGZpbGVVcGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBqc29uID0gYXdhaXQgZmlsZVVwbG9hZC5maWxlcyFbMF0udGV4dCgpO1xuICAgICAgY29uc3QgcmV0ID0gRnJvbUpTT04oanNvbik7XG4gICAgICBpZiAoIXJldC5vaykge1xuICAgICAgICB0aHJvdyByZXQuZXJyb3I7XG4gICAgICB9XG4gICAgICB0aGlzLnBsYW4gPSByZXQudmFsdWU7XG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3NpbXVsYXRlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5zaW11bGF0ZSgpO1xuICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZm9jdXMtb24tc2VsZWN0ZWQtdGFza1wiKSEuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGVGb2N1c09uVGFzaygpO1xuICAgICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2dlbi1yYW5kb20tcGxhblwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucGxhbiA9IGdlbmVyYXRlUmFuZG9tUGxhbigpO1xuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMucGFpbnRDaGFydC5iaW5kKHRoaXMpKTtcbiAgICBTdGFydEtleWJvYXJkSGFuZGxpbmcodGhpcyk7XG4gIH1cblxuICBzZXRGb2N1c09uVGFzayhpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZWxlY3RlZFRhc2sgPSBpbmRleDtcbiAgICB0aGlzLmZvcmNlRm9jdXNPblRhc2soKTtcbiAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB0aGlzLnVwZGF0ZVNlbGVjdGVkVGFza1BhbmVsISh0aGlzLnNlbGVjdGVkVGFzayk7XG4gIH1cblxuICB0YXNrUmVzb3VyY2VWYWx1ZUNoYW5nZWQoXG4gICAgdGFza0luZGV4OiBudW1iZXIsXG4gICAgcmVzb3VyY2VLZXk6IHN0cmluZyxcbiAgICByZXNvdXJjZVZhbHVlOiBzdHJpbmdcbiAgKTogUmVzdWx0PG51bGw+IHtcbiAgICBjb25zdCBvcCA9IFNldFJlc291cmNlVmFsdWVPcChyZXNvdXJjZUtleSwgcmVzb3VyY2VWYWx1ZSwgdGFza0luZGV4KTtcbiAgICByZXR1cm4gZXhlY3V0ZU9wKG9wLCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLCB0cnVlLCB0aGlzKTtcbiAgfVxuXG4gIHRhc2tNZXRyaWNWYWx1ZUNoYW5nZWQoXG4gICAgdGFza0luZGV4OiBudW1iZXIsXG4gICAgbWV0cmljS2V5OiBzdHJpbmcsXG4gICAgbWV0cmljVmFsdWU6IHN0cmluZ1xuICApOiBSZXN1bHQ8bnVsbD4ge1xuICAgIGNvbnN0IG9wID0gU2V0TWV0cmljVmFsdWVPcChtZXRyaWNLZXksICttZXRyaWNWYWx1ZSwgdGFza0luZGV4KTtcbiAgICByZXR1cm4gZXhlY3V0ZU9wKG9wLCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLCB0cnVlLCB0aGlzKTtcbiAgfVxuXG4gIHRhc2tOYW1lQ2hhbmdlZCh0YXNrSW5kZXg6IG51bWJlciwgbmFtZTogc3RyaW5nKTogUmVzdWx0PG51bGw+IHtcbiAgICBjb25zdCBvcCA9IFNldFRhc2tOYW1lT3AodGFza0luZGV4LCBuYW1lKTtcbiAgICByZXR1cm4gZXhlY3V0ZU9wKG9wLCBcInBhaW50Q2hhcnRcIiwgdHJ1ZSwgdGhpcyk7XG4gIH1cblxuICBkZWxldGVUYXNrKHRhc2tJbmRleDogbnVtYmVyKTogUmVzdWx0PG51bGw+IHtcbiAgICBjb25zdCBvcCA9IERlbGV0ZVRhc2tPcCh0YXNrSW5kZXgpO1xuICAgIHJldHVybiBleGVjdXRlT3Aob3AsIFwicGFpbnRDaGFydFwiLCB0cnVlLCB0aGlzKTtcbiAgfVxuXG4gIC8vIFRPRE8gLSBUdXJuIHRoaXMgb24gYW5kIG9mZiBiYXNlZCBvbiBtb3VzZSBlbnRlcmluZyB0aGUgY2FudmFzIGFyZWEuXG4gIG9uTW91c2VNb3ZlKCkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5tb3VzZU1vdmUhLnJlYWRMb2NhdGlvbigpO1xuICAgIGlmIChsb2NhdGlvbiAhPT0gbnVsbCAmJiB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MobG9jYXRpb24sIFwibW91c2Vtb3ZlXCIpO1xuICAgIH1cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBwbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCkge1xuICAgIHRoaXMucmFkYXJTY2FsZSA9IG51bGw7XG4gICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuZ3JvdXBCeU9wdGlvbnMgPSBbXCJcIiwgLi4uT2JqZWN0LmtleXModGhpcy5wbGFuLnJlc291cmNlRGVmaW5pdGlvbnMpXTtcbiAgICB0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXggPSAwO1xuICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWwgPSBidWlsZFNlbGVjdGVkVGFza1BhbmVsKFxuICAgICAgdGhpcy5wbGFuLFxuICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwic2VsZWN0ZWQtdGFzay1wYW5lbFwiKSEsXG4gICAgICB0aGlzXG4gICAgKTtcbiAgICB0aGlzLnJlY2FsY3VsYXRlU3BhbnNBbmRDcml0aWNhbFBhdGgoKTtcbiAgfVxuXG4gIHJlY2FsY3VsYXRlU3BhbnNBbmRDcml0aWNhbFBhdGgoKSB7XG4gICAgLy8gUG9wdWxhdGUgdGhlIGRvd25sb2FkIGxpbmsuXG4gICAgLy8gVE9ETyAtIE9ubHkgZG8gdGhpcyBvbiBkZW1hbmQuXG4gICAgY29uc3QgZG93bmxvYWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxMaW5rRWxlbWVudD4oXCIjZG93bmxvYWRcIikhO1xuICAgIGNvbnN0IGRvd25sb2FkQmxvYiA9IG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeSh0aGlzLnBsYW4sIG51bGwsIFwiICBcIildLCB7XG4gICAgICB0eXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICB9KTtcbiAgICBkb3dubG9hZC5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChkb3dubG9hZEJsb2IpO1xuXG4gICAgbGV0IHNsYWNrczogU2xhY2tbXSA9IFtdO1xuXG4gICAgY29uc3Qgc2xhY2tSZXN1bHQgPSBDb21wdXRlU2xhY2soXG4gICAgICB0aGlzLnBsYW4uY2hhcnQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICBwcmVjaXNpb24ucm91bmRlcigpXG4gICAgKTtcbiAgICBpZiAoIXNsYWNrUmVzdWx0Lm9rKSB7XG4gICAgICBjb25zb2xlLmVycm9yKHNsYWNrUmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2xhY2tzID0gc2xhY2tSZXN1bHQudmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5zcGFucyA9IHNsYWNrcy5tYXAoKHZhbHVlOiBTbGFjayk6IFNwYW4gPT4ge1xuICAgICAgcmV0dXJuIHZhbHVlLmVhcmx5O1xuICAgIH0pO1xuICAgIHRoaXMuY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrcywgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG4gICAgdGhpcy51cGRhdGVTZWxlY3RlZFRhc2tQYW5lbCEodGhpcy5zZWxlY3RlZFRhc2spO1xuICB9XG5cbiAgZ2V0VGFza0xhYmVsbGVyKCk6IFRhc2tMYWJlbCB7XG4gICAgcmV0dXJuICh0YXNrSW5kZXg6IG51bWJlcik6IHN0cmluZyA9PlxuICAgICAgYCR7dGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0ubmFtZX1gO1xuICB9XG5cbiAgZHJhZ1JhbmdlSGFuZGxlcihlOiBDdXN0b21FdmVudDxEcmFnUmFuZ2U+KSB7XG4gICAgaWYgKHRoaXMucmFkYXJTY2FsZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBiZWdpbiA9IHRoaXMucmFkYXJTY2FsZS5kYXlSb3dGcm9tUG9pbnQoZS5kZXRhaWwuYmVnaW4pO1xuICAgIGNvbnN0IGVuZCA9IHRoaXMucmFkYXJTY2FsZS5kYXlSb3dGcm9tUG9pbnQoZS5kZXRhaWwuZW5kKTtcbiAgICB0aGlzLmRpc3BsYXlSYW5nZSA9IG5ldyBEaXNwbGF5UmFuZ2UoYmVnaW4uZGF5LCBlbmQuZGF5KTtcbiAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgfVxuXG4gIHRvZ2dsZVJhZGFyKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcInJhZGFyLXBhcmVudFwiKSEuY2xhc3NMaXN0LnRvZ2dsZShcImhpZGRlblwiKTtcbiAgfVxuXG4gIHRvZ2dsZUdyb3VwQnkoKSB7XG4gICAgdGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4ID1cbiAgICAgICh0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXggKyAxKSAlIHRoaXMuZ3JvdXBCeU9wdGlvbnMubGVuZ3RoO1xuICB9XG5cbiAgdG9nZ2xlQ3JpdGljYWxQYXRoc09ubHkoKSB7XG4gICAgdGhpcy5jcml0aWNhbFBhdGhzT25seSA9ICF0aGlzLmNyaXRpY2FsUGF0aHNPbmx5O1xuICB9XG5cbiAgdG9nZ2xlRm9jdXNPblRhc2soKSB7XG4gICAgdGhpcy5mb2N1c09uVGFzayA9ICF0aGlzLmZvY3VzT25UYXNrO1xuICAgIGlmICghdGhpcy5mb2N1c09uVGFzaykge1xuICAgICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGZvcmNlRm9jdXNPblRhc2soKSB7XG4gICAgdGhpcy5mb2N1c09uVGFzayA9IHRydWU7XG4gIH1cblxuICBwYWludENoYXJ0KCkge1xuICAgIGNvbnNvbGUudGltZShcInBhaW50Q2hhcnRcIik7XG5cbiAgICBjb25zdCB0aGVtZUNvbG9yczogVGhlbWUgPSBjb2xvclRoZW1lRnJvbUVsZW1lbnQoZG9jdW1lbnQuYm9keSk7XG5cbiAgICBsZXQgZmlsdGVyRnVuYzogRmlsdGVyRnVuYyB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IHN0YXJ0QW5kRmluaXNoID0gWzAsIHRoaXMucGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxXTtcbiAgICBpZiAodGhpcy5jcml0aWNhbFBhdGhzT25seSkge1xuICAgICAgY29uc3QgaGlnaGxpZ2h0U2V0ID0gbmV3IFNldCh0aGlzLmNyaXRpY2FsUGF0aCk7XG4gICAgICBmaWx0ZXJGdW5jID0gKHRhc2s6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGlmIChzdGFydEFuZEZpbmlzaC5pbmNsdWRlcyh0YXNrSW5kZXgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhpZ2hsaWdodFNldC5oYXModGFza0luZGV4KTtcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0aGlzLmZvY3VzT25UYXNrICYmIHRoaXMuc2VsZWN0ZWRUYXNrICE9IC0xKSB7XG4gICAgICAvLyBGaW5kIGFsbCBwcmVkZWNlc3NvciBhbmQgc3VjY2Vzc29ycyBvZiB0aGUgZ2l2ZW4gdGFzay5cbiAgICAgIGNvbnN0IG5laWdoYm9yU2V0ID0gbmV3IFNldCgpO1xuICAgICAgbmVpZ2hib3JTZXQuYWRkKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgICAgIGxldCBlYXJsaWVzdFN0YXJ0ID0gdGhpcy5zcGFuc1t0aGlzLnNlbGVjdGVkVGFza10uc3RhcnQ7XG4gICAgICBsZXQgbGF0ZXN0RmluaXNoID0gdGhpcy5zcGFuc1t0aGlzLnNlbGVjdGVkVGFza10uZmluaXNoO1xuICAgICAgdGhpcy5wbGFuLmNoYXJ0LkVkZ2VzLmZvckVhY2goKGVkZ2U6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLnNlbGVjdGVkVGFzaykge1xuICAgICAgICAgIG5laWdoYm9yU2V0LmFkZChlZGdlLmopO1xuICAgICAgICAgIGlmIChsYXRlc3RGaW5pc2ggPCB0aGlzLnNwYW5zW2VkZ2Uual0uZmluaXNoKSB7XG4gICAgICAgICAgICBsYXRlc3RGaW5pc2ggPSB0aGlzLnNwYW5zW2VkZ2Uual0uZmluaXNoO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZWRnZS5qID09PSB0aGlzLnNlbGVjdGVkVGFzaykge1xuICAgICAgICAgIG5laWdoYm9yU2V0LmFkZChlZGdlLmkpO1xuICAgICAgICAgIGlmIChlYXJsaWVzdFN0YXJ0ID4gdGhpcy5zcGFuc1tlZGdlLmldLnN0YXJ0KSB7XG4gICAgICAgICAgICBlYXJsaWVzdFN0YXJ0ID0gdGhpcy5zcGFuc1tlZGdlLmldLnN0YXJ0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvLyBUT0RPIC0gU2luY2Ugd2Ugb3ZlcndyaXRlIGRpc3BsYXlSYW5nZSB0aGF0IG1lYW5zIGRyYWdnaW5nIG9uIHRoZSByYWRhclxuICAgICAgLy8gd2lsbCBub3Qgd29yayB3aGVuIGZvY3VzaW5nIG9uIGEgc2VsZWN0ZWQgdGFzay4gQnVnIG9yIGZlYXR1cmU/XG4gICAgICB0aGlzLmRpc3BsYXlSYW5nZSA9IG5ldyBEaXNwbGF5UmFuZ2UoZWFybGllc3RTdGFydCAtIDEsIGxhdGVzdEZpbmlzaCArIDEpO1xuXG4gICAgICBmaWx0ZXJGdW5jID0gKHRhc2s6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGlmIChzdGFydEFuZEZpbmlzaC5pbmNsdWRlcyh0YXNrSW5kZXgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmVpZ2hib3JTZXQuaGFzKHRhc2tJbmRleCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHJhZGFyT3B0czogUmVuZGVyT3B0aW9ucyA9IHtcbiAgICAgIGZvbnRTaXplUHg6IDYsXG4gICAgICBoYXNUZXh0OiBmYWxzZSxcbiAgICAgIGRpc3BsYXlSYW5nZTogdGhpcy5kaXNwbGF5UmFuZ2UsXG4gICAgICBkaXNwbGF5UmFuZ2VVc2FnZTogXCJoaWdobGlnaHRcIixcbiAgICAgIGNvbG9yczoge1xuICAgICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlTXV0ZWQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZU11dGVkLFxuICAgICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgICAgZ3JvdXBDb2xvcjogdGhlbWVDb2xvcnMuZ3JvdXBDb2xvcixcbiAgICAgICAgaGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5oaWdobGlnaHQsXG4gICAgICB9LFxuICAgICAgaGFzVGltZWxpbmU6IGZhbHNlLFxuICAgICAgaGFzVGFza3M6IHRydWUsXG4gICAgICBoYXNFZGdlczogZmFsc2UsXG4gICAgICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiBmYWxzZSxcbiAgICAgIHRhc2tMYWJlbDogdGhpcy5nZXRUYXNrTGFiZWxsZXIoKSxcbiAgICAgIHRhc2tFbXBoYXNpemU6IHRoaXMuY3JpdGljYWxQYXRoLFxuICAgICAgZmlsdGVyRnVuYzogbnVsbCxcbiAgICAgIGdyb3VwQnlSZXNvdXJjZTogdGhpcy5ncm91cEJ5T3B0aW9uc1t0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXhdLFxuICAgICAgaGlnaGxpZ2h0ZWRUYXNrOiBudWxsLFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXg6IHRoaXMuc2VsZWN0ZWRUYXNrLFxuICAgIH07XG5cbiAgICBjb25zdCB6b29tT3B0czogUmVuZGVyT3B0aW9ucyA9IHtcbiAgICAgIGZvbnRTaXplUHg6IEZPTlRfU0laRV9QWCxcbiAgICAgIGhhc1RleHQ6IHRydWUsXG4gICAgICBkaXNwbGF5UmFuZ2U6IHRoaXMuZGlzcGxheVJhbmdlLFxuICAgICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwicmVzdHJpY3RcIixcbiAgICAgIGNvbG9yczoge1xuICAgICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlTXV0ZWQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZU11dGVkLFxuICAgICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgICAgZ3JvdXBDb2xvcjogdGhlbWVDb2xvcnMuZ3JvdXBDb2xvcixcbiAgICAgICAgaGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5oaWdobGlnaHQsXG4gICAgICB9LFxuICAgICAgaGFzVGltZWxpbmU6IHRoaXMudG9wVGltZWxpbmUsXG4gICAgICBoYXNUYXNrczogdHJ1ZSxcbiAgICAgIGhhc0VkZ2VzOiB0cnVlLFxuICAgICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogdHJ1ZSxcbiAgICAgIHRhc2tMYWJlbDogdGhpcy5nZXRUYXNrTGFiZWxsZXIoKSxcbiAgICAgIHRhc2tFbXBoYXNpemU6IHRoaXMuY3JpdGljYWxQYXRoLFxuICAgICAgZmlsdGVyRnVuYzogZmlsdGVyRnVuYyxcbiAgICAgIGdyb3VwQnlSZXNvdXJjZTogdGhpcy5ncm91cEJ5T3B0aW9uc1t0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXhdLFxuICAgICAgaGlnaGxpZ2h0ZWRUYXNrOiAxLFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXg6IHRoaXMuc2VsZWN0ZWRUYXNrLFxuICAgIH07XG5cbiAgICBjb25zdCB0aW1lbGluZU9wdHM6IFJlbmRlck9wdGlvbnMgPSB7XG4gICAgICBmb250U2l6ZVB4OiBGT05UX1NJWkVfUFgsXG4gICAgICBoYXNUZXh0OiB0cnVlLFxuICAgICAgZGlzcGxheVJhbmdlOiB0aGlzLmRpc3BsYXlSYW5nZSxcbiAgICAgIGRpc3BsYXlSYW5nZVVzYWdlOiBcInJlc3RyaWN0XCIsXG4gICAgICBjb2xvcnM6IHtcbiAgICAgICAgc3VyZmFjZTogdGhlbWVDb2xvcnMuc3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlOiB0aGVtZUNvbG9ycy5vblN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZU11dGVkOiB0aGVtZUNvbG9ycy5vblN1cmZhY2VNdXRlZCxcbiAgICAgICAgb25TdXJmYWNlSGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5vblN1cmZhY2VTZWNvbmRhcnksXG4gICAgICAgIG92ZXJsYXk6IHRoZW1lQ29sb3JzLm92ZXJsYXksXG4gICAgICAgIGdyb3VwQ29sb3I6IHRoZW1lQ29sb3JzLmdyb3VwQ29sb3IsXG4gICAgICAgIGhpZ2hsaWdodDogdGhlbWVDb2xvcnMuaGlnaGxpZ2h0LFxuICAgICAgfSxcbiAgICAgIGhhc1RpbWVsaW5lOiB0cnVlLFxuICAgICAgaGFzVGFza3M6IGZhbHNlLFxuICAgICAgaGFzRWRnZXM6IHRydWUsXG4gICAgICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiB0cnVlLFxuICAgICAgdGFza0xhYmVsOiB0aGlzLmdldFRhc2tMYWJlbGxlcigpLFxuICAgICAgdGFza0VtcGhhc2l6ZTogdGhpcy5jcml0aWNhbFBhdGgsXG4gICAgICBmaWx0ZXJGdW5jOiBmaWx0ZXJGdW5jLFxuICAgICAgZ3JvdXBCeVJlc291cmNlOiB0aGlzLmdyb3VwQnlPcHRpb25zW3RoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gICAgICBoaWdobGlnaHRlZFRhc2s6IG51bGwsXG4gICAgICBzZWxlY3RlZFRhc2tJbmRleDogdGhpcy5zZWxlY3RlZFRhc2ssXG4gICAgfTtcblxuICAgIGNvbnN0IHJldCA9IHRoaXMucGFpbnRPbmVDaGFydChcIiNyYWRhclwiLCByYWRhck9wdHMpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucmFkYXJTY2FsZSA9IHJldC52YWx1ZS5zY2FsZTtcblxuICAgIHRoaXMucGFpbnRPbmVDaGFydChcIiN0aW1lbGluZVwiLCB0aW1lbGluZU9wdHMpO1xuICAgIGNvbnN0IHpvb21SZXQgPSB0aGlzLnBhaW50T25lQ2hhcnQoXCIjem9vbWVkXCIsIHpvb21PcHRzLCBcIiNvdmVybGF5XCIpO1xuICAgIGlmICh6b29tUmV0Lm9rKSB7XG4gICAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyA9XG4gICAgICAgIHpvb21SZXQudmFsdWUudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zO1xuICAgICAgaWYgKHpvb21SZXQudmFsdWUuc2VsZWN0ZWRUYXNrTG9jYXRpb24gIT09IG51bGwpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImNoYXJ0LXBhcmVudFwiKSEuc2Nyb2xsKHtcbiAgICAgICAgICB0b3A6IHpvb21SZXQudmFsdWUuc2VsZWN0ZWRUYXNrTG9jYXRpb24ueSxcbiAgICAgICAgICBiZWhhdmlvcjogXCJzbW9vdGhcIixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS50aW1lRW5kKFwicGFpbnRDaGFydFwiKTtcbiAgfVxuXG4gIHByZXBhcmVDYW52YXMoXG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcbiAgICBjYW52YXNXaWR0aDogbnVtYmVyLFxuICAgIGNhbnZhc0hlaWdodDogbnVtYmVyLFxuICAgIHdpZHRoOiBudW1iZXIsXG4gICAgaGVpZ2h0OiBudW1iZXJcbiAgKTogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHtcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXNXaWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0O1xuICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcblxuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikhO1xuICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcblxuICAgIHJldHVybiBjdHg7XG4gIH1cblxuICBwYWludE9uZUNoYXJ0KFxuICAgIGNhbnZhc0lEOiBzdHJpbmcsXG4gICAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgICBvdmVybGF5SUQ6IHN0cmluZyA9IFwiXCJcbiAgKTogUmVzdWx0PFJlbmRlclJlc3VsdD4ge1xuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MQ2FudmFzRWxlbWVudD4oY2FudmFzSUQpITtcbiAgICBjb25zdCBwYXJlbnQgPSBjYW52YXMhLnBhcmVudEVsZW1lbnQhO1xuICAgIGNvbnN0IHJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgY29uc3Qgd2lkdGggPSBwYXJlbnQuY2xpZW50V2lkdGggLSBGT05UX1NJWkVfUFg7XG4gICAgbGV0IGhlaWdodCA9IHBhcmVudC5jbGllbnRIZWlnaHQ7XG4gICAgY29uc3QgY2FudmFzV2lkdGggPSBNYXRoLmNlaWwod2lkdGggKiByYXRpbyk7XG4gICAgbGV0IGNhbnZhc0hlaWdodCA9IE1hdGguY2VpbChoZWlnaHQgKiByYXRpbyk7XG5cbiAgICBjb25zdCBuZXdIZWlnaHQgPSBzdWdnZXN0ZWRDYW52YXNIZWlnaHQoXG4gICAgICBjYW52YXMsXG4gICAgICB0aGlzLnNwYW5zLFxuICAgICAgb3B0cyxcbiAgICAgIHRoaXMucGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggKyAyIC8vIFRPRE8gLSBXaHkgZG8gd2UgbmVlZCB0aGUgKzIgaGVyZSE/XG4gICAgKTtcbiAgICBjYW52YXNIZWlnaHQgPSBuZXdIZWlnaHQ7XG4gICAgaGVpZ2h0ID0gbmV3SGVpZ2h0IC8gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG5cbiAgICBsZXQgb3ZlcmxheTogSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBpZiAob3ZlcmxheUlEKSB7XG4gICAgICBvdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MQ2FudmFzRWxlbWVudD4ob3ZlcmxheUlEKSE7XG4gICAgICB0aGlzLnByZXBhcmVDYW52YXMob3ZlcmxheSwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCwgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuICAgIGNvbnN0IGN0eCA9IHRoaXMucHJlcGFyZUNhbnZhcyhcbiAgICAgIGNhbnZhcyxcbiAgICAgIGNhbnZhc1dpZHRoLFxuICAgICAgY2FudmFzSGVpZ2h0LFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHRcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlbmRlclRhc2tzVG9DYW52YXMoXG4gICAgICBwYXJlbnQsXG4gICAgICBjYW52YXMsXG4gICAgICBjdHgsXG4gICAgICB0aGlzLnBsYW4sXG4gICAgICB0aGlzLnNwYW5zLFxuICAgICAgb3B0cyxcbiAgICAgIG92ZXJsYXlcbiAgICApO1xuICB9XG5cbiAgb25Qb3RlbnRpYWxDcml0aWNpYWxQYXRoQ2xpY2soXG4gICAga2V5OiBzdHJpbmcsXG4gICAgYWxsQ3JpdGljYWxQYXRoczogTWFwPHN0cmluZywgQ3JpdGljYWxQYXRoRW50cnk+XG4gICkge1xuICAgIGNvbnN0IGNyaXRpY2FsUGF0aEVudHJ5ID0gYWxsQ3JpdGljYWxQYXRocy5nZXQoa2V5KSE7XG4gICAgY3JpdGljYWxQYXRoRW50cnkuZHVyYXRpb25zLmZvckVhY2goXG4gICAgICAoZHVyYXRpb246IG51bWJlciwgdGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgdGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMucmVjYWxjdWxhdGVTcGFuc0FuZENyaXRpY2FsUGF0aCgpO1xuICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICB9XG5cbiAgc2ltdWxhdGUoKSB7XG4gICAgLy8gUnVuIHRoZSBzaW11bGF0aW9uLlxuICAgIGNvbnN0IGFsbENyaXRpY2FsUGF0aHMgPSBzaW11bGF0aW9uKHRoaXMucGxhbiwgTlVNX1NJTVVMQVRJT05fTE9PUFMpO1xuXG4gICAgLy8gRGlzcGxheSBhbGwgdGhlIHBvdGVudGlhbCBjcml0aWNhbCBwYXRocyBmb3VuZC5cbiAgICByZW5kZXIoXG4gICAgICBjcml0aWNhbFBhdGhzVGVtcGxhdGUoYWxsQ3JpdGljYWxQYXRocywgdGhpcyksXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcIiNjcml0aWNhbFBhdGhzXCIpIVxuICAgICk7XG5cbiAgICAvLyBGaW5kIGhvdyBvZnRlbiBlYWNoIHRhc2sgYXBwZWFycyBvbiBhbGwgdGhlIHBvdGVudGlhbCBjcml0aWNhbCBwYXRoLlxuICAgIGNvbnN0IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcgPSBjcml0aWNhbFRhc2tGcmVxdWVuY2llcyhcbiAgICAgIGFsbENyaXRpY2FsUGF0aHMsXG4gICAgICB0aGlzLnBsYW5cbiAgICApO1xuXG4gICAgLy8gRGlzcGxheSBhIHRhYmxlIG9mIHRhc2tzIG9uIGFsbCBwb3RlbnRpYWwgY3JpdGljYWwgcGF0aHMuXG4gICAgcmVuZGVyKFxuICAgICAgY3JpdGljYWxUYXNrRnJlcXVlbmNpZXNUZW1wbGF0ZShcbiAgICAgICAgdGhpcy5wbGFuLFxuICAgICAgICBjcml0aWNhbFRhc2tzRHVyYXRpb25EZXNjZW5kaW5nXG4gICAgICApLFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCIjY3JpdGljYWxUYXNrc1wiKSFcbiAgICApO1xuXG4gICAgLy8gUmVzZXQgdGhlIHNwYW5zIHVzaW5nIHRoZSBvcmlnaW5hbCBkdXJhdGlvbnMuXG4gICAgdGhpcy5yZWNhbGN1bGF0ZVNwYW5zQW5kQ3JpdGljYWxQYXRoKCk7XG5cbiAgICAvLyBIaWdobGlnaHQgYWxsIHRoZSB0YXNrcyB0aGF0IGNvdWxkIGFwcGVhciBvbiB0aGUgY3JpdGljYWwgcGF0aC5cbiAgICB0aGlzLmNyaXRpY2FsUGF0aCA9IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcubWFwKFxuICAgICAgKHRhc2tFbnRyeTogQ3JpdGljYWxQYXRoVGFza0VudHJ5KSA9PiB0YXNrRW50cnkudGFza0luZGV4XG4gICAgKTtcbiAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJleHBsYW4tbWFpblwiLCBFeHBsYW5NYWluKTtcbiIsICJpbXBvcnQgeyBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IEtleU1hcCB9IGZyb20gXCIuLi9rZXltYXAva2V5bWFwLnRzXCI7XG5pbXBvcnQgeyBBY3Rpb25SZWdpc3RyeSB9IGZyb20gXCIuLi9hY3Rpb24vcmVnaXN0cnlcIjtcblxuY2xhc3MgS2V5Ym9hcmRNYXBEaWFsb2cgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIGNvbnN0IGtleW1hcEVudHJpZXMgPSBbLi4uS2V5TWFwLmVudHJpZXMoKV07XG4gICAga2V5bWFwRW50cmllcy5zb3J0KCk7XG4gICAgcmVuZGVyKFxuICAgICAgaHRtbGBcbiAgICAgICAgPGRpYWxvZz5cbiAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICAke2tleW1hcEVudHJpZXMubWFwKFxuICAgICAgICAgICAgICAoW2tleSwgYWN0aW9uTmFtZV0pID0+XG4gICAgICAgICAgICAgICAgaHRtbGA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGQ+JHtrZXl9PC90ZD5cbiAgICAgICAgICAgICAgICAgIDx0ZD4ke0FjdGlvblJlZ2lzdHJ5W2FjdGlvbk5hbWVdLmRlc2NyaXB0aW9ufTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5gXG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgIDwvZGlhbG9nPlxuICAgICAgYCxcbiAgICAgIHRoaXNcbiAgICApO1xuICB9XG5cbiAgc2hvd01vZGFsKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLnNob3dNb2RhbCgpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImtleWJvYXJkLW1hcC1kaWFsb2dcIiwgS2V5Ym9hcmRNYXBEaWFsb2cpO1xuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluLnRzXCI7XG5pbXBvcnQgeyBTZWFyY2hUeXBlLCBUYXNrU2VhcmNoQ29udHJvbCB9IGZyb20gXCIuL3Rhc2stc2VhcmNoLWNvbnRyb2xzLnRzXCI7XG5cbi8qKiBVc2VzIGEgdGFzay1zZWFyY2gtY29udHJvbCB0byBzZWFyY2ggdGhyb3VnaCBhbGwgVGFza3MuICovXG5leHBvcnQgY2xhc3MgU2VhcmNoVGFza1BhbmVsIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBleHBsYW5NYWluOiBFeHBsYW5NYWluIHwgbnVsbCA9IG51bGw7XG4gIHRhc2tTZWFyY2hDb250cm9sOiBUYXNrU2VhcmNoQ29udHJvbCB8IG51bGwgPSBudWxsO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMuZXhwbGFuTWFpbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJleHBsYW4tbWFpblwiKTtcbiAgICBpZiAoIXRoaXMuZXhwbGFuTWFpbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sID0gdGhpcy5xdWVyeVNlbGVjdG9yKFwidGFzay1zZWFyY2gtY29udHJvbFwiKTtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJ0YXNrLWNoYW5nZVwiLCAoZSkgPT5cbiAgICAgIHRoaXMuZXhwbGFuTWFpbiEuc2V0Rm9jdXNPblRhc2soZS5kZXRhaWwpXG4gICAgKTtcbiAgfVxuXG4gIHNldEtleWJvYXJkRm9jdXNUb0lucHV0KHNlYXJjaFR5cGU6IFNlYXJjaFR5cGUpIHtcbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sIS50YXNrcyA9IHRoaXMuZXhwbGFuTWFpbiEucGxhbi5jaGFydC5WZXJ0aWNlcztcbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sIS5pbmNsdWRlZEluZGV4ZXMgPSBbXTtcbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sIS5zZXRLZXlib2FyZEZvY3VzVG9JbnB1dChzZWFyY2hUeXBlKTtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJzZWFyY2gtdGFzay1wYW5lbFwiLCBTZWFyY2hUYXNrUGFuZWwpO1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCBmdXp6eXNvcnQgZnJvbSBcImZ1enp5c29ydFwiO1xuaW1wb3J0IHsgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXAge1xuICAgIFwidGFzay1jaGFuZ2VcIjogQ3VzdG9tRXZlbnQ8bnVtYmVyPjtcbiAgfVxufVxuXG4vKiogVGhlIGluZGV4ZXMgcmV0dXJuZWQgYnkgZnV6enlzb3J0IGlzIGp1c3QgYSBsaXN0IG9mIHRoZSBpbmRleGVzIG9mIHRoZSB0aGVcbiAqICBpbmRpdmlkdWFsIGNoYXJzIHRoYXQgaGF2ZSBiZWVuIG1hdGNoZWQuIFdlIG5lZWQgdG8gdHVybiB0aGF0IGludG8gcGFpcnMgb2ZcbiAqICBudW1iZXJzIHdlIGNhbiBwYXNzIHRvIFN0cmluZy5wcm90b3R5cGUuc2xpY2UoKS5cbiAqXG4gKiAgVGhlIG9ic2VydmF0aW9uIGhlcmUgaXMgdGhhdCBpZiB0aGUgdGFyZ2V0IHN0cmluZyBpcyBcIkhlbGxvXCIgYW5kIHRoZSBpbmRpY2VzXG4gKiAgYXJlIFsyLDNdIHRoZW4gaXQgZG9lc24ndCBtYXR0ZXIgaWYgd2UgbWFya3VwIHRoZSBoaWdobGlnaHRlZCB0YXJnZXQgYXNcbiAqICBcIkhlPGI+bGw8L2I+b1wiIG9yIFwiSGU8Yj5sPC9iPjxiPmw8L2I+b1wiLiBUaGF0IGlzLCB3ZSBjYW4gc2ltcGxpZnkgaWYgd2VcbiAqICBhbHdheXMgc2xpY2Ugb3V0IGVhY2ggY2hhcmFjdGVyIGluIHRoZSB0YXJnZXQgc3RyaW5nIHRoYXQgbmVlZHMgdG8gYmVcbiAqICBoaWdobGlnaHRlZC5cbiAqXG4gKiAgU28gaW5kZXhlc1RvUmFuZ2VzIHJldHVybnMgYW4gYXJyYXkgb2YgaW5kZXhlcywgdGhhdCBpZiB0YWtlbiBpbiBwYWlycywgd2lsbFxuICogIGFsdGVybmF0ZWx5IHNsaWNlIG9mZiBwYXJ0cyBvZiB0YXJnZXQgdGhhdCBuZWVkIHRvIGJlIGVtcGhhc2l6ZWQuXG4gKlxuICogIEluIHRoZSBhYm92ZSBleGFtcGxlIHRhcmdldCA9IFwiSGVsbG9cIiBhbmQgaW5kZXhlcyA9IFsyLDNdLCB0aGVuXG4gKiAgaW5kZXhlc1RvUmFuZ2VzIHdpbGwgcmV0dXJuXCJcbiAqXG4gKiAgICAgWzAsMiwzLDMsNCw1XVxuICpcbiAqICB3aGljaCB3aWxsIGdlbmVyYXRlIHRoZSBmb2xsb3dpbmcgcGFpcnMgYXMgYXJncyB0byBzbGljZTpcbiAqXG4gKiAgICAgWzAsMl0gSGVcbiAqICAgICBbMiwzXSBsICAgI1xuICogICAgIFszLDNdXG4gKiAgICAgWzMsNF0gbCAgICNcbiAqICAgICBbNCw1XSBvXG4gKlxuICogTm90ZSB0aGF0IGlmIHdlIGFsdGVybmF0ZSBib2xkaW5nIHRoZW4gb25seSB0aGUgdHdvICdsJ3MgZ2V0IGVtcGhhc2l6ZWQsXG4gKiB3aGljaCBpcyB3aGF0IHdlIHdhbnQgKERlbm90ZWQgYnkgIyBhYm92ZSkuXG4gKi9cbmNvbnN0IGluZGV4ZXNUb1JhbmdlcyA9IChcbiAgaW5kZXhlczogUmVhZG9ubHk8bnVtYmVyW10+LFxuICBsZW46IG51bWJlclxuKTogbnVtYmVyW10gPT4ge1xuICAvLyBDb252ZXJ0IGVhY2ggaW5kZXggb2YgYSBoaWdobGlnaHRlZCBjaGFyIGludG8gYSBwYWlyIG9mIG51bWJlcnMgd2UgY2FuIHBhc3NcbiAgLy8gdG8gc2xpY2UsIGFuZCB0aGVuIGZsYXR0ZW4uXG4gIGNvbnN0IHJhbmdlcyA9IGluZGV4ZXMubWFwKCh4OiBudW1iZXIpID0+IFt4LCB4ICsgMV0pLmZsYXQoKTtcblxuICAvLyBOb3cgcHJlcGVuZCB3aXRoIDAgYW5kIGFwcGVuZCAnbGVuJyBzbyB0aGF0IHdlIGhhdmUgcGFpcnMgdGhhdCB3aWxsIHNsaWNlXG4gIC8vIHRhcmdldCBmdWxseSBpbnRvIHN1YnN0cmluZ3MuIFJlbWVtYmVyIHRoYXQgc2xpY2UgcmV0dXJuIGNoYXJzIGluIFthLCBiKSxcbiAgLy8gaS5lLiBTdHJpbmcuc2xpY2UoYSxiKSB3aGVyZSBiIGlzIG9uZSBiZXlvbmQgdGhlIGxhc3QgY2hhciBpbiB0aGUgc3RyaW5nIHdlXG4gIC8vIHdhbnQgdG8gaW5jbHVkZS5cbiAgcmV0dXJuIFswLCAuLi5yYW5nZXMsIGxlbl07XG59O1xuXG4vKiogUmV0dXJucyB0aGUgdGFyZ2V0IHN0cmluZyBoaWdobGlnaHRlZCBhcm91bmQgdGhlIGdpdmVuIGNoYXJhY3RlciBpbmRleGVzIGluXG4gKiAgdGhlIHJhbmdlcyBhcnJheS4gKi9cbmNvbnN0IGhpZ2hsaWdodCA9IChyYW5nZXM6IG51bWJlcltdLCB0YXJnZXQ6IHN0cmluZyk6IFRlbXBsYXRlUmVzdWx0W10gPT4ge1xuICBjb25zdCByZXQ6IFRlbXBsYXRlUmVzdWx0W10gPSBbXTtcbiAgbGV0IGluSGlnaGxpZ2h0ID0gZmFsc2U7XG5cbiAgLy8gUnVuIGRvd24gcmFuZ2VzIHdpdGggYSBzbGlkaW5nIHdpbmRvdyBvZiBsZW5ndGggMiBhbmQgdXNlIHRoYXQgYXMgdGhlXG4gIC8vIGFyZ3VtZW50cyB0byBzbGljZS4gQWx0ZXJuYXRlIGhpZ2hsaWdodGluZyBlYWNoIHNlZ21lbnQuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGNvbnN0IHN1YiA9IHRhcmdldC5zbGljZShyYW5nZXNbaV0sIHJhbmdlc1tpICsgMV0pO1xuICAgIGlmIChpbkhpZ2hsaWdodCkge1xuICAgICAgcmV0LnB1c2goaHRtbGA8Yj4ke3N1Yn08L2I+YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldC5wdXNoKGh0bWxgJHtzdWJ9YCk7XG4gICAgfVxuICAgIGluSGlnaGxpZ2h0ID0gIWluSGlnaGxpZ2h0O1xuICB9XG4gIHJldHVybiByZXQ7XG59O1xuXG4vKiogUmV0dXJucyB0aGUgdGFyZ2V0IHN0cmluZyBoaWdobGlnaHRlZCBhcm91bmQgdGhlIGdpdmVuIGNoYXJhY3RlciBpbmRleGVzLlxuICogIE5vdGUgdGhhdCB3ZSBkb24ndCB1c2UgZnV6enlzb3J0J3MgaGlnaGxpZ2h0IGJlY2F1c2Ugd2UgaGF2ZW4ndCBzYW5pdGl6ZWRcbiAqICB0aGUgbmFtZXMuXG4gKi9cbmNvbnN0IGhpZ2hsaWdodGVkVGFyZ2V0ID0gKFxuICBpbmRleGVzOiBSZWFkb25seTxudW1iZXJbXT4sXG4gIHRhcmdldDogc3RyaW5nXG4pOiBUZW1wbGF0ZVJlc3VsdFtdID0+IHtcbiAgcmV0dXJuIGhpZ2hsaWdodChpbmRleGVzVG9SYW5nZXMoaW5kZXhlcywgdGFyZ2V0Lmxlbmd0aCksIHRhcmdldCk7XG59O1xuXG5jb25zdCB0ZW1wbGF0ZSA9IChzZWFyY2hUYXNrUGFuZWw6IFRhc2tTZWFyY2hDb250cm9sKSA9PiBodG1sYFxuICA8aW5wdXRcbiAgICB0eXBlPVwidGV4dFwiXG4gICAgQGlucHV0PVwiJHsoZTogSW5wdXRFdmVudCkgPT4ge1xuICAgICAgc2VhcmNoVGFza1BhbmVsLm9uSW5wdXQoZSk7XG4gICAgfX1cIlxuICAgIEBrZXlkb3duPVwiJHsoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgc2VhcmNoVGFza1BhbmVsLm9uS2V5RG93bihlKTtcbiAgICB9fVwiXG4gICAgQGJsdXI9XCIkeygpID0+IHtcbiAgICAgIHNlYXJjaFRhc2tQYW5lbC5sb3NzT2ZGb2N1cygpO1xuICAgIH19XCJcbiAgLz5cbiAgPHVsPlxuICAgICR7c2VhcmNoVGFza1BhbmVsLnNlYXJjaFJlc3VsdHMubWFwKFxuICAgICAgKHRhc2s6IEZ1enp5c29ydC5LZXlSZXN1bHQ8VGFzaz4sIGluZGV4OiBudW1iZXIpID0+XG4gICAgICAgIGh0bWxgIDxsaVxuICAgICAgICAgIEBjbGljaz1cIiR7KCkgPT4gc2VhcmNoVGFza1BhbmVsLnNlbGVjdFNlYXJjaFJlc3VsdChpbmRleCl9XCJcbiAgICAgICAgICA/ZGF0YS1mb2N1cz0ke2luZGV4ID09PSBzZWFyY2hUYXNrUGFuZWwuZm9jdXNJbmRleH1cbiAgICAgICAgPlxuICAgICAgICAgICR7aGlnaGxpZ2h0ZWRUYXJnZXQodGFzay5pbmRleGVzLCB0YXNrLnRhcmdldCl9XG4gICAgICAgIDwvbGk+YFxuICAgICl9XG4gIDwvdWw+XG5gO1xuXG5leHBvcnQgdHlwZSBTZWFyY2hUeXBlID0gXCJuYW1lLW9ubHlcIiB8IFwiZnVsbC1pbmZvXCI7XG5cbmNvbnN0IHNlYXJjaFN0cmluZ0Zyb21UYXNrQnVpbGRlciA9IChcbiAgZnVsbFRhc2tMaXN0OiBUYXNrW10sXG4gIHNlYXJjaFR5cGU6IFNlYXJjaFR5cGUsXG4gIGluY2x1ZGVkSW5kZXhlczogU2V0PG51bWJlcj4sXG4gIG1heE5hbWVMZW5ndGg6IG51bWJlclxuKTogKCh0YXNrOiBUYXNrKSA9PiBzdHJpbmcpID0+IHtcbiAgaWYgKHNlYXJjaFR5cGUgPT09IFwiZnVsbC1pbmZvXCIpIHtcbiAgICByZXR1cm4gKHRhc2s6IFRhc2spOiBzdHJpbmcgPT4ge1xuICAgICAgaWYgKGluY2x1ZGVkSW5kZXhlcy5zaXplICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IHRhc2tJbmRleCA9IGZ1bGxUYXNrTGlzdC5pbmRleE9mKHRhc2spO1xuICAgICAgICBpZiAoIWluY2x1ZGVkSW5kZXhlcy5oYXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCByZXNvdXJjZUtleXMgPSBPYmplY3Qua2V5cyh0YXNrLnJlc291cmNlcyk7XG4gICAgICByZXNvdXJjZUtleXMuc29ydCgpO1xuICAgICAgcmV0dXJuIGAke3Rhc2submFtZX0gJHtcIi1cIi5yZXBlYXQobWF4TmFtZUxlbmd0aCAtIHRhc2submFtZS5sZW5ndGggKyAyKX0gJHtyZXNvdXJjZUtleXNcbiAgICAgICAgLm1hcCgoa2V5OiBzdHJpbmcpID0+IHRhc2sucmVzb3VyY2VzW2tleV0pXG4gICAgICAgIC5qb2luKFwiIFwiKX1gO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICh0YXNrOiBUYXNrKTogc3RyaW5nID0+IHtcbiAgICAgIGlmIChpbmNsdWRlZEluZGV4ZXMuc2l6ZSAhPT0gMCkge1xuICAgICAgICBjb25zdCB0YXNrSW5kZXggPSBmdWxsVGFza0xpc3QuaW5kZXhPZih0YXNrKTtcbiAgICAgICAgaWYgKCFpbmNsdWRlZEluZGV4ZXMuaGFzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRhc2submFtZTtcbiAgICB9O1xuICB9XG59O1xuXG5leHBvcnQgY2xhc3MgVGFza1NlYXJjaENvbnRyb2wgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIF90YXNrczogVGFza1tdID0gW107XG4gIF9pbmNsdWRlZEluZGV4ZXM6IFNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuICBmb2N1c0luZGV4OiBudW1iZXIgPSAwO1xuICBzZWFyY2hSZXN1bHRzOiBGdXp6eXNvcnQuS2V5UmVzdWx0czxUYXNrPiB8IFtdID0gW107XG4gIHNlYXJjaFR5cGU6IFNlYXJjaFR5cGUgPSBcIm5hbWUtb25seVwiO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBvbklucHV0KGU6IElucHV0RXZlbnQpIHtcbiAgICBjb25zdCBtYXhOYW1lTGVuZ3RoID0gdGhpcy5fdGFza3MucmVkdWNlPG51bWJlcj4oXG4gICAgICAocHJldjogbnVtYmVyLCB0YXNrOiBUYXNrKTogbnVtYmVyID0+XG4gICAgICAgIHRhc2submFtZS5sZW5ndGggPiBwcmV2ID8gdGFzay5uYW1lLmxlbmd0aCA6IHByZXYsXG4gICAgICAwXG4gICAgKTtcbiAgICB0aGlzLnNlYXJjaFJlc3VsdHMgPSBmdXp6eXNvcnQuZ288VGFzaz4oXG4gICAgICAoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUsXG4gICAgICB0aGlzLl90YXNrcy5zbGljZSgxLCAtMiksIC8vIFJlbW92ZSBTdGFydCBhbmQgRmluaXNoIGZyb20gc2VhcmNoIHJhbmdlLlxuICAgICAge1xuICAgICAgICBrZXk6IHNlYXJjaFN0cmluZ0Zyb21UYXNrQnVpbGRlcihcbiAgICAgICAgICB0aGlzLl90YXNrcyxcbiAgICAgICAgICB0aGlzLnNlYXJjaFR5cGUsXG4gICAgICAgICAgdGhpcy5faW5jbHVkZWRJbmRleGVzLFxuICAgICAgICAgIG1heE5hbWVMZW5ndGhcbiAgICAgICAgKSxcbiAgICAgICAgbGltaXQ6IDE1LFxuICAgICAgICB0aHJlc2hvbGQ6IDAuMixcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMuZm9jdXNJbmRleCA9IDA7XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIG9uS2V5RG93bihlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKHRoaXMuc2VhcmNoUmVzdWx0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gVE9ETyAtIGV4dHJhY3QgZnJvbSB0aGUgdHdvIHBsYWNlcyB3ZSBkbyB0aGlzLlxuICAgIGNvbnN0IGtleW5hbWUgPSBgJHtlLnNoaWZ0S2V5ID8gXCJzaGlmdC1cIiA6IFwiXCJ9JHtlLmN0cmxLZXkgPyBcImN0cmwtXCIgOiBcIlwifSR7ZS5tZXRhS2V5ID8gXCJtZXRhLVwiIDogXCJcIn0ke2UuYWx0S2V5ID8gXCJhbHQtXCIgOiBcIlwifSR7ZS5rZXl9YDtcbiAgICBzd2l0Y2ggKGtleW5hbWUpIHtcbiAgICAgIGNhc2UgXCJBcnJvd0Rvd25cIjpcbiAgICAgICAgdGhpcy5mb2N1c0luZGV4ID0gKHRoaXMuZm9jdXNJbmRleCArIDEpICUgdGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aDtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgIHRoaXMuZm9jdXNJbmRleCA9XG4gICAgICAgICAgKHRoaXMuZm9jdXNJbmRleCAtIDEgKyB0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoKSAlXG4gICAgICAgICAgdGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aDtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJFbnRlclwiOlxuICAgICAgICBpZiAodGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNlbGVjdFNlYXJjaFJlc3VsdCh0aGlzLmZvY3VzSW5kZXgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIHNlbGVjdFNlYXJjaFJlc3VsdChpbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3QgdGFza0luZGV4ID0gdGhpcy5fdGFza3MuaW5kZXhPZih0aGlzLnNlYXJjaFJlc3VsdHNbaW5kZXhdLm9iaik7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgbmV3IEN1c3RvbUV2ZW50PG51bWJlcj4oXCJ0YXNrLWNoYW5nZVwiLCB7XG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGRldGFpbDogdGFza0luZGV4LFxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuc2VhcmNoUmVzdWx0cyA9IFtdO1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBzZXRLZXlib2FyZEZvY3VzVG9JbnB1dChzZWFyY2hUeXBlOiBTZWFyY2hUeXBlKSB7XG4gICAgdGhpcy5zZWFyY2hUeXBlID0gc2VhcmNoVHlwZTtcbiAgICBjb25zdCBpbnB1dENvbnRyb2wgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTElucHV0RWxlbWVudD4oXCJpbnB1dFwiKSE7XG4gICAgaW5wdXRDb250cm9sLmZvY3VzKCk7XG4gICAgaW5wdXRDb250cm9sLnNlbGVjdCgpO1xuICB9XG5cbiAgbG9zc09mRm9jdXMoKSB7XG4gICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gW107XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgdGFza3ModGFza3M6IFRhc2tbXSkge1xuICAgIHRoaXMuX3Rhc2tzID0gdGFza3M7XG4gIH1cblxuICBwdWJsaWMgc2V0IGluY2x1ZGVkSW5kZXhlcyh2OiBudW1iZXJbXSkge1xuICAgIHRoaXMuX2luY2x1ZGVkSW5kZXhlcyA9IG5ldyBTZXQodik7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwidGFzay1zZWFyY2gtY29udHJvbFwiLCBUYXNrU2VhcmNoQ29udHJvbCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFHQyxPQUFDLENBQUMsTUFBTSxRQUFRO0FBQ2YsWUFBRyxPQUFPLFdBQVcsY0FBYyxPQUFPLElBQUssUUFBTyxDQUFDLEdBQUcsR0FBRztBQUFBLGlCQUNyRCxPQUFPLFdBQVcsWUFBWSxPQUFPLFFBQVMsUUFBTyxVQUFVLElBQUk7QUFBQSxZQUN0RSxNQUFLLFdBQVcsSUFBSSxJQUFJO0FBQUEsTUFDL0IsR0FBRyxTQUFNLENBQUFBLE9BQUs7QUFDWjtBQUVBLFlBQUksU0FBUyxDQUFDLFFBQVEsV0FBVztBQUMvQixjQUFHLENBQUMsVUFBVSxDQUFDLE9BQVEsUUFBTztBQUU5QixjQUFJLGlCQUFpQixrQkFBa0IsTUFBTTtBQUM3QyxjQUFHLENBQUMsV0FBVyxNQUFNLEVBQUcsVUFBUyxZQUFZLE1BQU07QUFFbkQsY0FBSSxpQkFBaUIsZUFBZTtBQUNwQyxlQUFJLGlCQUFpQixPQUFPLGVBQWUsZUFBZ0IsUUFBTztBQUVsRSxpQkFBTyxVQUFVLGdCQUFnQixNQUFNO0FBQUEsUUFDekM7QUFFQSxZQUFJLEtBQUssQ0FBQyxRQUFRLFNBQVMsWUFBWTtBQUNyQyxjQUFHLENBQUMsT0FBUSxRQUFPLFNBQVMsTUFBTSxJQUFJLFNBQVMsT0FBTyxJQUFJO0FBRTFELGNBQUksaUJBQWlCLGtCQUFrQixNQUFNO0FBQzdDLGNBQUksaUJBQWlCLGVBQWU7QUFDcEMsY0FBSSxnQkFBaUIsZUFBZTtBQUVwQyxjQUFJLFlBQVksaUJBQWtCLFNBQVMsYUFBYSxDQUFFO0FBQzFELGNB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QUcsSUFBSTtBQUFBLElBQzdCO0FBQUEsSUFFQSx3QkFBd0IsWUFBd0I7QUFDOUMsV0FBSyxhQUFhO0FBQ2xCLFlBQU0sZUFBZSxLQUFLLGNBQWdDLE9BQU87QUFDakUsbUJBQWEsTUFBTTtBQUNuQixtQkFBYSxPQUFPO0FBQUEsSUFDdEI7QUFBQSxJQUVBLGNBQWM7QUFDWixXQUFLLGdCQUFnQixDQUFDO0FBQ3RCLFFBQU8sU0FBUyxJQUFJLEdBQUcsSUFBSTtBQUFBLElBQzdCO0FBQUEsSUFFQSxJQUFXLE1BQU0sT0FBZTtBQUM5QixXQUFLLFNBQVM7QUFBQSxJQUNoQjtBQUFBLElBRUEsSUFBVyxnQkFBZ0JFLElBQWE7QUFDdEMsV0FBSyxtQkFBbUIsSUFBSSxJQUFJQSxFQUFDO0FBQUEsSUFDbkM7QUFBQSxFQUNGO0FBRUEsaUJBQWUsT0FBTyx1QkFBdUIsaUJBQWlCOyIsCiAgIm5hbWVzIjogWyJfIiwgInJlc3VsdCIsICJpIiwgImhpZ2hsaWdodCIsICJwYXJ0cyIsICJSZXN1bHQiLCAiYSIsICJiIiwgInMiLCAic2NvcmUiLCAiaiIsICJ4IiwgInIiLCAiZSIsICJvIiwgInYiLCAiYyIsICJmIiwgImkiLCAiZSIsICJzIiwgInYiLCAiaSIsICJqIiwgImUiLCAiZyIsICJfIiwgImkiLCAiZSIsICJvayIsICJ0IiwgImUiLCAiZyIsICJpIiwgImMiLCAicHJlY2lzaW9uIiwgIngiLCAicyIsICJ4IiwgInMiLCAicHJlY2lzaW9uIiwgInMiLCAiaSIsICJqIiwgImUiLCAidiIsICJhIiwgImIiLCAiYyIsICJwIiwgInAiLCAieCIsICJ5IiwgImUiLCAiZSIsICJlIiwgIngiLCAiZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXgiLCAiYSIsICJiIiwgImkiLCAibiIsICJlIiwgImNvcm5lcnMiLCAicm93IiwgInQiLCAiYyIsICJpIiwgInIiLCAiZSIsICJnbG9iYWwiLCAiZ2xvYmFsVGhpcyIsICJ0cnVzdGVkVHlwZXMiLCAicG9saWN5IiwgImNyZWF0ZVBvbGljeSIsICJjcmVhdGVIVE1MIiwgInMiLCAiYm91bmRBdHRyaWJ1dGVTdWZmaXgiLCAibWFya2VyIiwgIk1hdGgiLCAicmFuZG9tIiwgInRvRml4ZWQiLCAic2xpY2UiLCAibWFya2VyTWF0Y2giLCAibm9kZU1hcmtlciIsICJkIiwgImRvY3VtZW50IiwgImNyZWF0ZU1hcmtlciIsICJjcmVhdGVDb21tZW50IiwgImlzUHJpbWl0aXZlIiwgInZhbHVlIiwgImlzQXJyYXkiLCAiQXJyYXkiLCAiaXNJdGVyYWJsZSIsICJTeW1ib2wiLCAiaXRlcmF0b3IiLCAiU1BBQ0VfQ0hBUiIsICJ0ZXh0RW5kUmVnZXgiLCAiY29tbWVudEVuZFJlZ2V4IiwgImNvbW1lbnQyRW5kUmVnZXgiLCAidGFnRW5kUmVnZXgiLCAiUmVnRXhwIiwgInNpbmdsZVF1b3RlQXR0ckVuZFJlZ2V4IiwgImRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4IiwgInJhd1RleHRFbGVtZW50IiwgInRhZyIsICJ0eXBlIiwgInN0cmluZ3MiLCAidmFsdWVzIiwgIl8kbGl0VHlwZSQiLCAiaHRtbCIsICJzdmciLCAibWF0aG1sIiwgIm5vQ2hhbmdlIiwgImZvciIsICJub3RoaW5nIiwgInRlbXBsYXRlQ2FjaGUiLCAiV2Vha01hcCIsICJ3YWxrZXIiLCAiY3JlYXRlVHJlZVdhbGtlciIsICJ0cnVzdEZyb21UZW1wbGF0ZVN0cmluZyIsICJ0c2EiLCAic3RyaW5nRnJvbVRTQSIsICJoYXNPd25Qcm9wZXJ0eSIsICJFcnJvciIsICJnZXRUZW1wbGF0ZUh0bWwiLCAibCIsICJsZW5ndGgiLCAiYXR0ck5hbWVzIiwgInJhd1RleHRFbmRSZWdleCIsICJyZWdleCIsICJpIiwgImF0dHJOYW1lIiwgIm1hdGNoIiwgImF0dHJOYW1lRW5kSW5kZXgiLCAibGFzdEluZGV4IiwgImV4ZWMiLCAidGVzdCIsICJlbmQiLCAic3RhcnRzV2l0aCIsICJwdXNoIiwgIlRlbXBsYXRlIiwgImNvbnN0cnVjdG9yIiwgIm9wdGlvbnMiLCAibm9kZSIsICJ0aGlzIiwgInBhcnRzIiwgIm5vZGVJbmRleCIsICJhdHRyTmFtZUluZGV4IiwgInBhcnRDb3VudCIsICJlbCIsICJjcmVhdGVFbGVtZW50IiwgImN1cnJlbnROb2RlIiwgImNvbnRlbnQiLCAid3JhcHBlciIsICJmaXJzdENoaWxkIiwgInJlcGxhY2VXaXRoIiwgImNoaWxkTm9kZXMiLCAibmV4dE5vZGUiLCAibm9kZVR5cGUiLCAiaGFzQXR0cmlidXRlcyIsICJuYW1lIiwgImdldEF0dHJpYnV0ZU5hbWVzIiwgImVuZHNXaXRoIiwgInJlYWxOYW1lIiwgInN0YXRpY3MiLCAiZ2V0QXR0cmlidXRlIiwgInNwbGl0IiwgIm0iLCAiaW5kZXgiLCAiY3RvciIsICJQcm9wZXJ0eVBhcnQiLCAiQm9vbGVhbkF0dHJpYnV0ZVBhcnQiLCAiRXZlbnRQYXJ0IiwgIkF0dHJpYnV0ZVBhcnQiLCAicmVtb3ZlQXR0cmlidXRlIiwgInRhZ05hbWUiLCAidGV4dENvbnRlbnQiLCAiZW1wdHlTY3JpcHQiLCAiYXBwZW5kIiwgImRhdGEiLCAiaW5kZXhPZiIsICJfb3B0aW9ucyIsICJpbm5lckhUTUwiLCAicmVzb2x2ZURpcmVjdGl2ZSIsICJwYXJ0IiwgInBhcmVudCIsICJhdHRyaWJ1dGVJbmRleCIsICJjdXJyZW50RGlyZWN0aXZlIiwgIl9fZGlyZWN0aXZlcyIsICJfX2RpcmVjdGl2ZSIsICJuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IiLCAiXyRpbml0aWFsaXplIiwgIl8kcmVzb2x2ZSIsICJUZW1wbGF0ZUluc3RhbmNlIiwgInRlbXBsYXRlIiwgIl8kcGFydHMiLCAiXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuIiwgIl8kdGVtcGxhdGUiLCAiXyRwYXJlbnQiLCAicGFyZW50Tm9kZSIsICJfJGlzQ29ubmVjdGVkIiwgImZyYWdtZW50IiwgImNyZWF0aW9uU2NvcGUiLCAiaW1wb3J0Tm9kZSIsICJwYXJ0SW5kZXgiLCAidGVtcGxhdGVQYXJ0IiwgIkNoaWxkUGFydCIsICJuZXh0U2libGluZyIsICJFbGVtZW50UGFydCIsICJfJHNldFZhbHVlIiwgIl9faXNDb25uZWN0ZWQiLCAic3RhcnROb2RlIiwgImVuZE5vZGUiLCAiXyRjb21taXR0ZWRWYWx1ZSIsICJfJHN0YXJ0Tm9kZSIsICJfJGVuZE5vZGUiLCAiaXNDb25uZWN0ZWQiLCAiZGlyZWN0aXZlUGFyZW50IiwgIl8kY2xlYXIiLCAiX2NvbW1pdFRleHQiLCAiX2NvbW1pdFRlbXBsYXRlUmVzdWx0IiwgIl9jb21taXROb2RlIiwgIl9jb21taXRJdGVyYWJsZSIsICJpbnNlcnRCZWZvcmUiLCAiX2luc2VydCIsICJjcmVhdGVUZXh0Tm9kZSIsICJyZXN1bHQiLCAiXyRnZXRUZW1wbGF0ZSIsICJoIiwgIl91cGRhdGUiLCAiaW5zdGFuY2UiLCAiX2Nsb25lIiwgImdldCIsICJzZXQiLCAiaXRlbVBhcnRzIiwgIml0ZW1QYXJ0IiwgIml0ZW0iLCAic3RhcnQiLCAiZnJvbSIsICJfJG5vdGlmeUNvbm5lY3Rpb25DaGFuZ2VkIiwgIm4iLCAicmVtb3ZlIiwgImVsZW1lbnQiLCAiZmlsbCIsICJTdHJpbmciLCAidmFsdWVJbmRleCIsICJub0NvbW1pdCIsICJjaGFuZ2UiLCAidiIsICJfY29tbWl0VmFsdWUiLCAic2V0QXR0cmlidXRlIiwgInRvZ2dsZUF0dHJpYnV0ZSIsICJzdXBlciIsICJuZXdMaXN0ZW5lciIsICJvbGRMaXN0ZW5lciIsICJzaG91bGRSZW1vdmVMaXN0ZW5lciIsICJjYXB0dXJlIiwgIm9uY2UiLCAicGFzc2l2ZSIsICJzaG91bGRBZGRMaXN0ZW5lciIsICJyZW1vdmVFdmVudExpc3RlbmVyIiwgImFkZEV2ZW50TGlzdGVuZXIiLCAiZXZlbnQiLCAiY2FsbCIsICJob3N0IiwgImhhbmRsZUV2ZW50IiwgInBvbHlmaWxsU3VwcG9ydCIsICJnbG9iYWwiLCAibGl0SHRtbFBvbHlmaWxsU3VwcG9ydCIsICJUZW1wbGF0ZSIsICJDaGlsZFBhcnQiLCAibGl0SHRtbFZlcnNpb25zIiwgInB1c2giLCAicmVuZGVyIiwgInZhbHVlIiwgImNvbnRhaW5lciIsICJvcHRpb25zIiwgInBhcnRPd25lck5vZGUiLCAicmVuZGVyQmVmb3JlIiwgInBhcnQiLCAiZW5kTm9kZSIsICJpbnNlcnRCZWZvcmUiLCAiY3JlYXRlTWFya2VyIiwgIl8kc2V0VmFsdWUiLCAibiIsICJpIiwgInQiLCAiYSIsICJiIiwgInJuZEludCIsICJuIiwgImkiLCAiZXhwbGFuTWFpbiIsICJ1bmRvIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAidW5kbyIsICJlIiwgInByZWNpc2lvbiIsICJleHBsYW5NYWluIiwgInBsYW4iLCAiZSIsICJwIiwgImUiLCAieCIsICJpIiwgImUiLCAiZnV6enlzb3J0IiwgInYiXQp9Cg==
