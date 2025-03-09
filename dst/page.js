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
            for (var i3 = 0; i3 < targetsLen; ++i3) {
              var obj = targets[i3];
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
            outer: for (var i3 = 0; i3 < targetsLen; ++i3) {
              var obj = targets[i3];
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
              if (containsSpace) for (let i4 = 0; i4 < preparedSearch.spaceSearches.length; i4++) keysSpacesBestScores[i4] = NEGATIVE_INFINITY;
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
                if (containsSpace) for (let i4 = 0; i4 < preparedSearch.spaceSearches.length; i4++) {
                  if (allowPartialMatchScores[i4] > -1e3) {
                    if (keysSpacesBestScores[i4] > NEGATIVE_INFINITY) {
                      var tmp = (keysSpacesBestScores[i4] + allowPartialMatchScores[i4]) / 4;
                      if (tmp > keysSpacesBestScores[i4]) keysSpacesBestScores[i4] = tmp;
                    }
                  }
                  if (allowPartialMatchScores[i4] > keysSpacesBestScores[i4]) keysSpacesBestScores[i4] = allowPartialMatchScores[i4];
                }
              }
              if (containsSpace) {
                for (let i4 = 0; i4 < preparedSearch.spaceSearches.length; i4++) {
                  if (keysSpacesBestScores[i4] === NEGATIVE_INFINITY) continue outer;
                }
              } else {
                var hasAtLeast1Match = false;
                for (let i4 = 0; i4 < keysLen; i4++) {
                  if (tmpResults[i4]._score !== NEGATIVE_INFINITY) {
                    hasAtLeast1Match = true;
                    break;
                  }
                }
                if (!hasAtLeast1Match) continue;
              }
              var objResults = new KeysResult(keysLen);
              for (let i4 = 0; i4 < keysLen; i4++) {
                objResults[i4] = tmpResults[i4];
              }
              if (containsSpace) {
                var score = 0;
                for (let i4 = 0; i4 < preparedSearch.spaceSearches.length; i4++) score += keysSpacesBestScores[i4];
              } else {
                var score = NEGATIVE_INFINITY;
                for (let i4 = 0; i4 < keysLen; i4++) {
                  var result = objResults[i4];
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
            for (var i3 = 0; i3 < targetsLen; ++i3) {
              var target = targets[i3];
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
          for (var i3 = resultsLen - 1; i3 >= 0; --i3) results[i3] = q.poll();
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
          for (var i3 = 0; i3 < targetLen; ++i3) {
            var char = target[i3];
            if (indexes[indexesI] === i3) {
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
                  parts2.push(target.substr(i3 + 1));
                } else {
                  highlighted += char + close + target.substr(i3 + 1);
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
        class Result25 {
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
          const result = new Result25();
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
            for (var i3 = 0; i3 < searches.length; i3++) {
              if (searches[i3] === "") continue;
              var _info = prepareLowerInfo(searches[i3]);
              spaceSearches.push({ lowerCodes: _info.lowerCodes, _lower: searches[i3].toLowerCase(), containsSpace: false });
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
            for (var i3 = 0; i3 < targets.length; i3++) {
              var obj = targets[i3];
              var target = getValue(obj, options.key);
              if (target == NULL) continue;
              if (!isPrepared(target)) target = getPrepared(target);
              var result = new_result(target.target, { _score: target._score, obj });
              results.push(result);
              if (results.length >= limit) return results;
            }
          } else if (options?.keys) {
            for (var i3 = 0; i3 < targets.length; i3++) {
              var obj = targets[i3];
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
            for (var i3 = 0; i3 < targets.length; i3++) {
              var target = targets[i3];
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
            for (var i3 = 0; i3 < nextBeginningIndexes.length; i3 = nextBeginningIndexes[i3]) {
              if (i3 <= substringIndex) continue;
              for (var s2 = 0; s2 < searchLen; s2++) if (searchLowerCodes[s2] !== prepared._targetLowerCodes[i3 + s2]) break;
              if (s2 === searchLen) {
                substringIndex = i3;
                isSubstringBeginning = true;
                break;
              }
            }
          }
          var calculateScore = (matches) => {
            var score2 = 0;
            var extraMatchGroupCount = 0;
            for (var i4 = 1; i4 < searchLen; ++i4) {
              if (matches[i4] - matches[i4 - 1] !== 1) {
                score2 -= matches[i4];
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
              for (var i4 = nextBeginningIndexes[0]; i4 < targetLen; i4 = nextBeginningIndexes[i4]) ++uniqueBeginningIndexes;
              if (uniqueBeginningIndexes > 24) score2 *= (uniqueBeginningIndexes - 24) * 10;
            }
            score2 -= (targetLen - searchLen) / 2;
            if (isSubstring) score2 /= 1 + searchLen * searchLen * 1;
            if (isSubstringBeginning) score2 /= 1 + searchLen * searchLen * 1;
            score2 -= (targetLen - searchLen) / 2;
            return score2;
          };
          if (!successStrict) {
            if (isSubstring) for (var i3 = 0; i3 < searchLen; ++i3) matchesSimple[i3] = substringIndex + i3;
            var matchesBest = matchesSimple;
            var score = calculateScore(matchesBest);
          } else {
            if (isSubstringBeginning) {
              for (var i3 = 0; i3 < searchLen; ++i3) matchesSimple[i3] = substringIndex + i3;
              var matchesBest = matchesSimple;
              var score = calculateScore(matchesSimple);
            } else {
              var matchesBest = matchesStrict;
              var score = calculateScore(matchesStrict);
            }
          }
          prepared._score = score;
          for (var i3 = 0; i3 < searchLen; ++i3) prepared._indexes[i3] = matchesBest[i3];
          prepared._indexes.len = searchLen;
          const result = new Result25();
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
            for (let i4 = changeslen - 1; i4 >= 0; i4--) target._nextBeginningIndexes[nextBeginningIndexesChanges[i4 * 2 + 0]] = nextBeginningIndexesChanges[i4 * 2 + 1];
          };
          var hasAtLeast1Match = false;
          for (var i3 = 0; i3 < searchesLen; ++i3) {
            allowPartialMatchScores[i3] = NEGATIVE_INFINITY;
            var search = searches[i3];
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
            var isTheLastSearch = i3 === searchesLen - 1;
            if (!isTheLastSearch) {
              var indexes = result._indexes;
              var indexesIsConsecutiveSubstring = true;
              for (let i4 = 0; i4 < indexes.len - 1; i4++) {
                if (indexes[i4 + 1] - indexes[i4] !== 1) {
                  indexesIsConsecutiveSubstring = false;
                  break;
                }
              }
              if (indexesIsConsecutiveSubstring) {
                var newBeginningIndex = indexes[indexes.len - 1] + 1;
                var toReplace = target._nextBeginningIndexes[newBeginningIndex - 1];
                for (let i4 = newBeginningIndex - 1; i4 >= 0; i4--) {
                  if (toReplace !== target._nextBeginningIndexes[i4]) break;
                  target._nextBeginningIndexes[i4] = newBeginningIndex;
                  nextBeginningIndexesChanges[changeslen * 2 + 0] = i4;
                  nextBeginningIndexesChanges[changeslen * 2 + 1] = toReplace;
                  changeslen++;
                }
              }
            }
            score += result._score / searchesLen;
            allowPartialMatchScores[i3] = result._score / searchesLen;
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
              for (var i3 = 0; i3 < searchesLen; ++i3) {
                allowPartialMatchScores[i3] = allowSpacesResult._score / searchesLen;
              }
            }
            return allowSpacesResult;
          }
          if (allowPartialMatch) result = target;
          result._score = score;
          var i3 = 0;
          for (let index of seen_indexes) result._indexes[i3++] = index;
          result._indexes.len = i3;
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
          for (var i3 = 0; i3 < strLen; ++i3) {
            var lowerCode = lowerCodes[i3] = lower.charCodeAt(i3);
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
          for (var i3 = 0; i3 < targetLen; ++i3) {
            var targetCode = target.charCodeAt(i3);
            var isUpper = targetCode >= 65 && targetCode <= 90;
            var isAlphanum = isUpper || targetCode >= 97 && targetCode <= 122 || targetCode >= 48 && targetCode <= 57;
            var isBeginning = isUpper && !wasUpper || !wasAlphanum || !isAlphanum;
            wasUpper = isUpper;
            wasAlphanum = isAlphanum;
            if (isBeginning) beginningIndexes[beginningIndexesLen++] = i3;
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
          for (var i3 = 0; i3 < targetLen; ++i3) {
            if (lastIsBeginning > i3) {
              nextBeginningIndexes[i3] = lastIsBeginning;
            } else {
              lastIsBeginning = beginningIndexes[++lastIsBeginningI];
              nextBeginningIndexes[i3] = lastIsBeginning === void 0 ? targetLen : lastIsBeginning;
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
          var i3 = -1;
          while (obj && ++i3 < len) obj = obj[segs[i3]];
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
          var e3 = [], o2 = 0, a2 = {}, v2 = (r3) => {
            for (var a3 = 0, v3 = e3[a3], c2 = 1; c2 < o2; ) {
              var s2 = c2 + 1;
              a3 = c2, s2 < o2 && e3[s2]._score < e3[c2]._score && (a3 = s2), e3[a3 - 1 >> 1] = e3[a3], c2 = 1 + (a3 << 1);
            }
            for (var f3 = a3 - 1 >> 1; a3 > 0 && v3._score < e3[f3]._score; f3 = (a3 = f3) - 1 >> 1) e3[a3] = e3[f3];
            e3[a3] = v3;
          };
          return a2.add = (r3) => {
            var a3 = o2;
            e3[o2++] = r3;
            for (var v3 = a3 - 1 >> 1; a3 > 0 && r3._score < e3[v3]._score; v3 = (a3 = v3) - 1 >> 1) e3[a3] = e3[v3];
            e3[a3] = r3;
          }, a2.poll = (r3) => {
            if (0 !== o2) {
              var a3 = e3[0];
              return e3[0] = e3[--o2], v2(), a3;
            }
          }, a2.peek = (r3) => {
            if (0 !== o2) return e3[0];
          }, a2.replaceTop = (r3) => {
            e3[0] = r3, v2();
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
  var s = i ? i.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
  var e = "$lit$";
  var h = `lit$${Math.random().toFixed(9).slice(2)}$`;
  var o = "?" + h;
  var n = `<${o}>`;
  var r = document;
  var l = () => r.createComment("");
  var c = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
  var a = Array.isArray;
  var u = (t4) => a(t4) || "function" == typeof t4?.[Symbol.iterator];
  var d = "[ 	\n\f\r]";
  var f = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
  var v = /-->/g;
  var _ = />/g;
  var m = RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
  var p = /'/g;
  var g = /"/g;
  var $ = /^(?:script|style|textarea|title)$/i;
  var y = (t4) => (i3, ...s2) => ({ _$litType$: t4, strings: i3, values: s2 });
  var x = y(1);
  var b = y(2);
  var w = y(3);
  var T = Symbol.for("lit-noChange");
  var E = Symbol.for("lit-nothing");
  var A = /* @__PURE__ */ new WeakMap();
  var C = r.createTreeWalker(r, 129);
  function P(t4, i3) {
    if (!a(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== s ? s.createHTML(i3) : i3;
  }
  var V = (t4, i3) => {
    const s2 = t4.length - 1, o2 = [];
    let r2, l3 = 2 === i3 ? "<svg>" : 3 === i3 ? "<math>" : "", c2 = f;
    for (let i4 = 0; i4 < s2; i4++) {
      const s3 = t4[i4];
      let a2, u3, d2 = -1, y2 = 0;
      for (; y2 < s3.length && (c2.lastIndex = y2, u3 = c2.exec(s3), null !== u3); ) y2 = c2.lastIndex, c2 === f ? "!--" === u3[1] ? c2 = v : void 0 !== u3[1] ? c2 = _ : void 0 !== u3[2] ? ($.test(u3[2]) && (r2 = RegExp("</" + u3[2], "g")), c2 = m) : void 0 !== u3[3] && (c2 = m) : c2 === m ? ">" === u3[0] ? (c2 = r2 ?? f, d2 = -1) : void 0 === u3[1] ? d2 = -2 : (d2 = c2.lastIndex - u3[2].length, a2 = u3[1], c2 = void 0 === u3[3] ? m : '"' === u3[3] ? g : p) : c2 === g || c2 === p ? c2 = m : c2 === v || c2 === _ ? c2 = f : (c2 = m, r2 = void 0);
      const x2 = c2 === m && t4[i4 + 1].startsWith("/>") ? " " : "";
      l3 += c2 === f ? s3 + n : d2 >= 0 ? (o2.push(a2), s3.slice(0, d2) + e + s3.slice(d2) + h + x2) : s3 + h + (-2 === d2 ? i4 : x2);
    }
    return [P(t4, l3 + (t4[s2] || "<?>") + (2 === i3 ? "</svg>" : 3 === i3 ? "</math>" : "")), o2];
  };
  var N = class _N {
    constructor({ strings: t4, _$litType$: s2 }, n2) {
      let r2;
      this.parts = [];
      let c2 = 0, a2 = 0;
      const u3 = t4.length - 1, d2 = this.parts, [f3, v2] = V(t4, s2);
      if (this.el = _N.createElement(f3, n2), C.currentNode = this.el.content, 2 === s2 || 3 === s2) {
        const t5 = this.el.content.firstChild;
        t5.replaceWith(...t5.childNodes);
      }
      for (; null !== (r2 = C.nextNode()) && d2.length < u3; ) {
        if (1 === r2.nodeType) {
          if (r2.hasAttributes()) for (const t5 of r2.getAttributeNames()) if (t5.endsWith(e)) {
            const i3 = v2[a2++], s3 = r2.getAttribute(t5).split(h), e3 = /([.?@])?(.*)/.exec(i3);
            d2.push({ type: 1, index: c2, name: e3[2], strings: s3, ctor: "." === e3[1] ? H : "?" === e3[1] ? I : "@" === e3[1] ? L : k }), r2.removeAttribute(t5);
          } else t5.startsWith(h) && (d2.push({ type: 6, index: c2 }), r2.removeAttribute(t5));
          if ($.test(r2.tagName)) {
            const t5 = r2.textContent.split(h), s3 = t5.length - 1;
            if (s3 > 0) {
              r2.textContent = i ? i.emptyScript : "";
              for (let i3 = 0; i3 < s3; i3++) r2.append(t5[i3], l()), C.nextNode(), d2.push({ type: 2, index: ++c2 });
              r2.append(t5[s3], l());
            }
          }
        } else if (8 === r2.nodeType) if (r2.data === o) d2.push({ type: 2, index: c2 });
        else {
          let t5 = -1;
          for (; -1 !== (t5 = r2.data.indexOf(h, t5 + 1)); ) d2.push({ type: 7, index: c2 }), t5 += h.length - 1;
        }
        c2++;
      }
    }
    static createElement(t4, i3) {
      const s2 = r.createElement("template");
      return s2.innerHTML = t4, s2;
    }
  };
  function S(t4, i3, s2 = t4, e3) {
    if (i3 === T) return i3;
    let h2 = void 0 !== e3 ? s2._$Co?.[e3] : s2._$Cl;
    const o2 = c(i3) ? void 0 : i3._$litDirective$;
    return h2?.constructor !== o2 && (h2?._$AO?.(false), void 0 === o2 ? h2 = void 0 : (h2 = new o2(t4), h2._$AT(t4, s2, e3)), void 0 !== e3 ? (s2._$Co ??= [])[e3] = h2 : s2._$Cl = h2), void 0 !== h2 && (i3 = S(t4, h2._$AS(t4, i3.values), h2, e3)), i3;
  }
  var M = class {
    constructor(t4, i3) {
      this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i3;
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    u(t4) {
      const { el: { content: i3 }, parts: s2 } = this._$AD, e3 = (t4?.creationScope ?? r).importNode(i3, true);
      C.currentNode = e3;
      let h2 = C.nextNode(), o2 = 0, n2 = 0, l3 = s2[0];
      for (; void 0 !== l3; ) {
        if (o2 === l3.index) {
          let i4;
          2 === l3.type ? i4 = new R(h2, h2.nextSibling, this, t4) : 1 === l3.type ? i4 = new l3.ctor(h2, l3.name, l3.strings, this, t4) : 6 === l3.type && (i4 = new z(h2, this, t4)), this._$AV.push(i4), l3 = s2[++n2];
        }
        o2 !== l3?.index && (h2 = C.nextNode(), o2++);
      }
      return C.currentNode = r, e3;
    }
    p(t4) {
      let i3 = 0;
      for (const s2 of this._$AV) void 0 !== s2 && (void 0 !== s2.strings ? (s2._$AI(t4, s2, i3), i3 += s2.strings.length - 2) : s2._$AI(t4[i3])), i3++;
    }
  };
  var R = class _R {
    get _$AU() {
      return this._$AM?._$AU ?? this._$Cv;
    }
    constructor(t4, i3, s2, e3) {
      this.type = 2, this._$AH = E, this._$AN = void 0, this._$AA = t4, this._$AB = i3, this._$AM = s2, this.options = e3, this._$Cv = e3?.isConnected ?? true;
    }
    get parentNode() {
      let t4 = this._$AA.parentNode;
      const i3 = this._$AM;
      return void 0 !== i3 && 11 === t4?.nodeType && (t4 = i3.parentNode), t4;
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(t4, i3 = this) {
      t4 = S(this, t4, i3), c(t4) ? t4 === E || null == t4 || "" === t4 ? (this._$AH !== E && this._$AR(), this._$AH = E) : t4 !== this._$AH && t4 !== T && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : u(t4) ? this.k(t4) : this._(t4);
    }
    O(t4) {
      return this._$AA.parentNode.insertBefore(t4, this._$AB);
    }
    T(t4) {
      this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
    }
    _(t4) {
      this._$AH !== E && c(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(r.createTextNode(t4)), this._$AH = t4;
    }
    $(t4) {
      const { values: i3, _$litType$: s2 } = t4, e3 = "number" == typeof s2 ? this._$AC(t4) : (void 0 === s2.el && (s2.el = N.createElement(P(s2.h, s2.h[0]), this.options)), s2);
      if (this._$AH?._$AD === e3) this._$AH.p(i3);
      else {
        const t5 = new M(e3, this), s3 = t5.u(this.options);
        t5.p(i3), this.T(s3), this._$AH = t5;
      }
    }
    _$AC(t4) {
      let i3 = A.get(t4.strings);
      return void 0 === i3 && A.set(t4.strings, i3 = new N(t4)), i3;
    }
    k(t4) {
      a(this._$AH) || (this._$AH = [], this._$AR());
      const i3 = this._$AH;
      let s2, e3 = 0;
      for (const h2 of t4) e3 === i3.length ? i3.push(s2 = new _R(this.O(l()), this.O(l()), this, this.options)) : s2 = i3[e3], s2._$AI(h2), e3++;
      e3 < i3.length && (this._$AR(s2 && s2._$AB.nextSibling, e3), i3.length = e3);
    }
    _$AR(t4 = this._$AA.nextSibling, i3) {
      for (this._$AP?.(false, true, i3); t4 && t4 !== this._$AB; ) {
        const i4 = t4.nextSibling;
        t4.remove(), t4 = i4;
      }
    }
    setConnected(t4) {
      void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
    }
  };
  var k = class {
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    constructor(t4, i3, s2, e3, h2) {
      this.type = 1, this._$AH = E, this._$AN = void 0, this.element = t4, this.name = i3, this._$AM = e3, this.options = h2, s2.length > 2 || "" !== s2[0] || "" !== s2[1] ? (this._$AH = Array(s2.length - 1).fill(new String()), this.strings = s2) : this._$AH = E;
    }
    _$AI(t4, i3 = this, s2, e3) {
      const h2 = this.strings;
      let o2 = false;
      if (void 0 === h2) t4 = S(this, t4, i3, 0), o2 = !c(t4) || t4 !== this._$AH && t4 !== T, o2 && (this._$AH = t4);
      else {
        const e4 = t4;
        let n2, r2;
        for (t4 = h2[0], n2 = 0; n2 < h2.length - 1; n2++) r2 = S(this, e4[s2 + n2], i3, n2), r2 === T && (r2 = this._$AH[n2]), o2 ||= !c(r2) || r2 !== this._$AH[n2], r2 === E ? t4 = E : t4 !== E && (t4 += (r2 ?? "") + h2[n2 + 1]), this._$AH[n2] = r2;
      }
      o2 && !e3 && this.j(t4);
    }
    j(t4) {
      t4 === E ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
    }
  };
  var H = class extends k {
    constructor() {
      super(...arguments), this.type = 3;
    }
    j(t4) {
      this.element[this.name] = t4 === E ? void 0 : t4;
    }
  };
  var I = class extends k {
    constructor() {
      super(...arguments), this.type = 4;
    }
    j(t4) {
      this.element.toggleAttribute(this.name, !!t4 && t4 !== E);
    }
  };
  var L = class extends k {
    constructor(t4, i3, s2, e3, h2) {
      super(t4, i3, s2, e3, h2), this.type = 5;
    }
    _$AI(t4, i3 = this) {
      if ((t4 = S(this, t4, i3, 0) ?? E) === T) return;
      const s2 = this._$AH, e3 = t4 === E && s2 !== E || t4.capture !== s2.capture || t4.once !== s2.once || t4.passive !== s2.passive, h2 = t4 !== E && (s2 === E || e3);
      e3 && this.element.removeEventListener(this.name, this, s2), h2 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
    }
    handleEvent(t4) {
      "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
    }
  };
  var z = class {
    constructor(t4, i3, s2) {
      this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i3, this.options = s2;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t4) {
      S(this, t4);
    }
  };
  var Z = { M: e, P: h, A: o, C: 1, L: V, R: M, D: u, V: S, I: R, H: k, N: I, U: L, B: H, F: z };
  var j = t.litHtmlPolyfillSupport;
  j?.(N, R), (t.litHtmlVersions ??= []).push("3.2.1");
  var B = (t4, i3, s2) => {
    const e3 = s2?.renderBefore ?? i3;
    let h2 = e3._$litPart$;
    if (void 0 === h2) {
      const t5 = s2?.renderBefore ?? null;
      e3._$litPart$ = h2 = new R(i3.insertBefore(l(), t5), t5, void 0, s2 ?? {});
    }
    return h2._$AI(t4), h2;
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
      explanMain2.plan = ret.value.plan;
      return ok(
        new _ActionFromOp(ret.value.inverse, this.postActionWork, this.undo)
      );
    }
  };

  // src/dag/dag.ts
  var DirectedEdge = class _DirectedEdge {
    i = 0;
    j = 0;
    constructor(i3 = 0, j2 = 0) {
      this.i = i3;
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
    static fromJSON(des) {
      return new _DirectedEdge(des.i, des.j);
    }
  };
  var edgesBySrcToMap = (edges) => {
    const ret = /* @__PURE__ */ new Map();
    edges.forEach((e3) => {
      const arr = ret.get(e3.i) || [];
      arr.push(e3);
      ret.set(e3.i, arr);
    });
    return ret;
  };
  var edgesByDstToMap = (edges) => {
    const ret = /* @__PURE__ */ new Map();
    edges.forEach((e3) => {
      const arr = ret.get(e3.j) || [];
      arr.push(e3);
      ret.set(e3.j, arr);
    });
    return ret;
  };
  var edgesBySrcAndDstToMap = (edges) => {
    const ret = {
      bySrc: /* @__PURE__ */ new Map(),
      byDst: /* @__PURE__ */ new Map()
    };
    edges.forEach((e3) => {
      let arr = ret.bySrc.get(e3.i) || [];
      arr.push(e3);
      ret.bySrc.set(e3.i, arr);
      arr = ret.byDst.get(e3.j) || [];
      arr.push(e3);
      ret.byDst.set(e3.j, arr);
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
      for (let i3 = 0; i3 < inverseSubOps.length; i3++) {
        const e3 = inverseSubOps[i3].applyTo(plan);
        if (!e3.ok) {
          return e3;
        }
        plan = e3.value.plan;
      }
      return ok(plan);
    }
    // Applies the Op to a Plan.
    applyTo(plan) {
      const inverseSubOps = [];
      for (let i3 = 0; i3 < this.subOps.length; i3++) {
        const e3 = this.subOps[i3].applyTo(plan);
        if (!e3.ok) {
          const revertErr = this.applyAllInverseSubOpsToPlan(plan, inverseSubOps);
          if (!revertErr.ok) {
            return revertErr;
          }
          return e3;
        }
        plan = e3.value.plan;
        inverseSubOps.unshift(e3.value.inverse);
      }
      return ok({
        plan,
        inverse: new _Op(inverseSubOps)
      });
    }
  };
  var applyAllInverseOpsToPlan = (inverses, plan) => {
    for (let i3 = 0; i3 < inverses.length; i3++) {
      const res = inverses[i3].applyTo(plan);
      if (!res.ok) {
        return res;
      }
      plan = res.value.plan;
    }
    return ok(plan);
  };
  var applyAllOpsToPlan = (ops, plan) => {
    const inverses = [];
    for (let i3 = 0; i3 < ops.length; i3++) {
      const res = ops[i3].applyTo(plan);
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
  var AddMetricSubOp = class {
    name;
    metricDefinition;
    // Maps an index of a Task to a value for the given metric key.
    taskMetricValues;
    constructor(name, metricDefinition, taskMetricValues = /* @__PURE__ */ new Map()) {
      this.name = name;
      this.metricDefinition = metricDefinition;
      this.taskMetricValues = taskMetricValues;
    }
    applyTo(plan) {
      if (plan.getMetricDefinition(this.name) !== void 0) {
        return error(`${this.name} already exists as a Metric`);
      }
      plan.setMetricDefinition(this.name, this.metricDefinition);
      plan.chart.Vertices.forEach((task, index) => {
        task.setMetric(
          this.name,
          this.taskMetricValues.get(index) || this.metricDefinition.default
        );
      });
      return ok({ plan, inverse: this.inverse() });
    }
    inverse() {
      return new DeleteMetricSubOp(this.name);
    }
  };
  var DeleteMetricSubOp = class {
    name;
    constructor(name) {
      this.name = name;
    }
    applyTo(plan) {
      const metricDefinition = plan.getMetricDefinition(this.name);
      if (metricDefinition === void 0) {
        return error(
          `The metric with name ${this.name} does not exist and can't be deleted.`
        );
      }
      if (metricDefinition.isStatic) {
        return error(`The static Metric ${this.name} can't be deleted.`);
      }
      plan.deleteMetricDefinition(this.name);
      const taskIndexToDeletedMetricValue = /* @__PURE__ */ new Map();
      plan.chart.Vertices.forEach((task, index) => {
        const value = task.getMetric(this.name);
        if (value !== void 0) {
          taskIndexToDeletedMetricValue.set(index, value);
        }
        task.deleteMetric(this.name);
      });
      return ok({
        plan,
        inverse: this.inverse(metricDefinition, taskIndexToDeletedMetricValue)
      });
    }
    inverse(metricDefinition, metricValuesForDeletedResourceName) {
      return new AddMetricSubOp(
        this.name,
        metricDefinition,
        metricValuesForDeletedResourceName
      );
    }
  };
  var RenameMetricSubOp = class _RenameMetricSubOp {
    oldName;
    newName;
    constructor(oldName, newName) {
      this.oldName = oldName;
      this.newName = newName;
    }
    applyTo(plan) {
      if (plan.getMetricDefinition(this.newName) !== void 0) {
        return error(`${this.newName} already exists as a metric.`);
      }
      const metricDefinition = plan.getMetricDefinition(this.oldName);
      if (metricDefinition === void 0) {
        return error(`${this.oldName} does not exist as a Metric`);
      }
      if (metricDefinition.isStatic) {
        return error(`Static metric ${this.oldName} can't be renamed.`);
      }
      plan.setMetricDefinition(this.newName, metricDefinition);
      plan.deleteMetricDefinition(this.oldName);
      plan.chart.Vertices.forEach((task) => {
        const value = task.getMetric(this.oldName) || metricDefinition.default;
        task.setMetric(this.newName, value);
        task.deleteMetric(this.oldName);
      });
      return ok({ plan, inverse: this.inverse() });
    }
    inverse() {
      return new _RenameMetricSubOp(this.newName, this.oldName);
    }
  };
  var UpdateMetricSubOp = class _UpdateMetricSubOp {
    name;
    metricDefinition;
    // Maps an index of a Task to a value for the given metric key.
    taskMetricValues;
    constructor(name, metricDefinition, taskMetricValues = /* @__PURE__ */ new Map()) {
      this.name = name;
      this.metricDefinition = metricDefinition;
      this.taskMetricValues = taskMetricValues;
    }
    applyTo(plan) {
      const oldMetricDefinition = plan.getMetricDefinition(this.name);
      if (oldMetricDefinition === void 0) {
        return error(`${this.name} does not exist as a Metric`);
      }
      if (oldMetricDefinition.isStatic) {
        return error(`Static metric ${this.name} can't be updated.`);
      }
      this.metricDefinition.default = this.metricDefinition.range.clamp(
        this.metricDefinition.default
      );
      plan.setMetricDefinition(this.name, this.metricDefinition);
      const taskMetricValues = /* @__PURE__ */ new Map();
      plan.chart.Vertices.forEach((task, index) => {
        const oldValue = task.getMetric(this.name);
        let newValue;
        if (this.taskMetricValues.has(index)) {
          newValue = this.taskMetricValues.get(index);
        } else if (oldValue === oldMetricDefinition.default && this.metricDefinition.range.min <= oldValue && this.metricDefinition.range.max > oldValue) {
          newValue = this.metricDefinition.default;
          taskMetricValues.set(index, oldValue);
        } else {
          newValue = this.metricDefinition.range.clamp(oldValue);
          newValue = this.metricDefinition.precision.round(newValue);
          taskMetricValues.set(index, oldValue);
        }
        task.setMetric(this.name, newValue);
      });
      return ok({
        plan,
        inverse: this.inverse(oldMetricDefinition, taskMetricValues)
      });
    }
    inverse(oldMetricDefinition, taskMetricValues) {
      return new _UpdateMetricSubOp(
        this.name,
        oldMetricDefinition,
        taskMetricValues
      );
    }
  };
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
      task.setMetric(this.name, metricsDefinition.clampAndRound(this.value));
      return ok({ plan, inverse: this.inverse(oldValue) });
    }
    inverse(value) {
      return new _SetMetricValueSubOp(this.name, value, this.taskIndex);
    }
  };
  function AddMetricOp(name, metricDefinition) {
    return new Op([new AddMetricSubOp(name, metricDefinition)]);
  }
  function DeleteMetricOp(name) {
    return new Op([new DeleteMetricSubOp(name)]);
  }
  function RenameMetricOp(oldName, newName) {
    return new Op([new RenameMetricSubOp(oldName, newName)]);
  }
  function UpdateMetricOp(name, metricDefinition) {
    return new Op([new UpdateMetricSubOp(name, metricDefinition)]);
  }
  function SetMetricValueOp(name, value, taskIndex) {
    return new Op([new SetMetricValueSubOp(name, value, taskIndex)]);
  }

  // src/ops/chart.ts
  function DirectedEdgeForPlan(i3, j2, plan) {
    const chart = plan.chart;
    if (j2 === -1) {
      j2 = chart.Vertices.length - 1;
    }
    if (i3 < 0 || i3 >= chart.Vertices.length) {
      return error(
        `i index out of range: ${i3} not in [0, ${chart.Vertices.length - 1}]`
      );
    }
    if (j2 < 0 || j2 >= chart.Vertices.length) {
      return error(
        `j index out of range: ${j2} not in [0, ${chart.Vertices.length - 1}]`
      );
    }
    if (i3 === j2) {
      return error(`A Task can not depend on itself: ${i3} === ${j2}`);
    }
    return ok(new DirectedEdge(i3, j2));
  }
  var AddEdgeSubOp = class {
    i = 0;
    j = 0;
    constructor(i3, j2) {
      this.i = i3;
      this.j = j2;
    }
    applyTo(plan) {
      if (this.i === -1) {
        this.i = plan.chart.Vertices.length - 1;
      }
      if (this.j === -1) {
        this.j = plan.chart.Vertices.length - 1;
      }
      const e3 = DirectedEdgeForPlan(this.i, this.j, plan);
      if (!e3.ok) {
        return e3;
      }
      if (!plan.chart.Edges.find((value) => value.equal(e3.value))) {
        plan.chart.Edges.push(e3.value);
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
    constructor(i3, j2) {
      this.i = i3;
      this.j = j2;
    }
    applyTo(plan) {
      if (this.i === -1) {
        this.i = plan.chart.Vertices.length - 1;
      }
      if (this.j === -1) {
        this.j = plan.chart.Vertices.length - 1;
      }
      const e3 = DirectedEdgeForPlan(this.i, this.j, plan);
      if (!e3.ok) {
        return e3;
      }
      plan.chart.Edges = plan.chart.Edges.filter(
        (v2) => !v2.equal(e3.value)
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
      for (let i3 = 0; i3 < chart.Edges.length; i3++) {
        const edge = chart.Edges[i3];
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
      for (let i3 = 0; i3 < chart.Edges.length; i3++) {
        const edge = chart.Edges[i3];
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
        for (let i3 = 0; i3 < chart.Edges.length; i3++) {
          const edge = chart.Edges[i3];
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
        for (let i3 = 0; i3 < chart.Edges.length; i3++) {
          const newEdge = this.actualMoves.get(plan.chart.Edges[i3]);
          if (newEdge !== void 0) {
            plan.chart.Edges[i3] = newEdge;
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
      for (let i3 = 0; i3 < chart.Edges.length; i3++) {
        const edge = chart.Edges[i3];
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
      for (let i3 = Start; i3 < Finish; i3++) {
        const destinations = srcAndDst.bySrc.get(i3);
        if (destinations === void 0) {
          const toBeAdded = new DirectedEdge(i3, Finish);
          plan.chart.Edges.push(toBeAdded);
        } else {
          if (destinations.length > 1 && destinations.find((value) => value.j === Finish)) {
            const toBeRemoved = new DirectedEdge(i3, Finish);
            plan.chart.Edges = plan.chart.Edges.filter(
              (value) => !toBeRemoved.equal(value)
            );
          }
        }
      }
      for (let i3 = Start + 1; i3 < Finish; i3++) {
        const destinations = srcAndDst.byDst.get(i3);
        if (destinations === void 0) {
          const toBeAdded = new DirectedEdge(Start, i3);
          plan.chart.Edges.push(toBeAdded);
        } else {
          if (destinations.length > 1 && destinations.find((value) => value.i === Start)) {
            const toBeRemoved = new DirectedEdge(Start, i3);
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
  function RemoveEdgeOp(i3, j2) {
    return new Op([
      new RationalizeEdgesSubOp(),
      new RemoveEdgeSupOp(i3, j2),
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
  var darkModeLocalStorageKey = "explan-darkmode";
  var toggleTheme = () => {
    window.localStorage.setItem(
      darkModeLocalStorageKey,
      document.body.classList.toggle("darkmode") ? "1" : "0"
    );
  };
  var applyStoredTheme = () => {
    document.body.classList.toggle(
      "darkmode",
      window.localStorage.getItem(darkModeLocalStorageKey) === "1"
    );
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

  // src/action/actions/toggleFocus.ts
  var ToggleFocusAction = class {
    description = "Toggles the focus view.";
    postActionWork = "paintChart";
    undo = false;
    async do(explanMain2) {
      explanMain2.toggleFocusOnTask();
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
    AddSuccessorAction: new AddSuccessorAction(),
    ToggleFocusAction: new ToggleFocusAction()
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
        document.dispatchEvent(new CustomEvent("plan-definition-changed"));
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
        document.dispatchEvent(new CustomEvent("plan-definition-changed"));
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
        document.dispatchEvent(new CustomEvent("plan-definition-changed"));
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
    ["shift-ctrl->", "AddSuccessorAction"],
    ["shift-ctrl-:", "ToggleFocusAction"]
  ]);
  var explanMain;
  var StartKeyboardHandling = (em) => {
    explanMain = em;
    document.addEventListener("keydown", onKeyDown);
  };
  var onKeyDown = async (e3) => {
    const keyname = `${e3.shiftKey ? "shift-" : ""}${e3.ctrlKey ? "ctrl-" : ""}${e3.metaKey ? "meta-" : ""}${e3.altKey ? "alt-" : ""}${e3.key}`;
    console.log(keyname);
    const actionName = KeyMap.get(keyname);
    if (actionName === void 0) {
      return;
    }
    e3.stopPropagation();
    e3.preventDefault();
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

  // src/date-control-utils/date-control-utils.ts
  var dateControlValue = (d2) => `${d2.getFullYear()}-${("" + (d2.getMonth() + 1)).padStart(2, "0")}-${("" + d2.getDate()).padStart(2, "0")}`;
  var dateControlDateRe = /\d{4}-\d{2}-\d{2}/;

  // src/date-picker/date-picker.ts
  var DatePicker = class extends HTMLElement {
    _value = null;
    set value(v2) {
      this._value = v2;
      this.render();
    }
    render() {
      B(this.template(), this);
    }
    template() {
      if (this._value === null) {
        return x``;
      }
      const kind = this._value.unit.kind();
      if (kind === "Unitless") {
        return x` <input
        type="text"
        .value=${this._value.dateOffset}
        @input=${(e3) => this.inputChanged(e3)}
      />`;
      } else {
        return x`
        <input
          type="date"
          .value=${dateControlValue(
          this._value.unit.asDate(this._value.dateOffset)
        )}
          @input=${(e3) => this.inputChanged(e3)}
        />
      `;
      }
    }
    inputChanged(e3) {
      const ret = this._value.unit.parse(e3.target.value);
      if (!ret.ok) {
        console.log(ret.error);
      } else {
        this.dispatchEvent(
          new CustomEvent("date-picker-input", {
            bubbles: true,
            detail: ret.value
          })
        );
      }
    }
  };
  customElements.define("date-picker", DatePicker);

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
        for (let i3 = 0; i3 < nextEdges.length; i3++) {
          const e3 = nextEdges[i3];
          if (!visit(e3.j)) {
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
    // Resource keys and values. The parent plan contains all the resource
    // definitions.
    resources;
    metrics;
    name;
    id;
    constructor(name = "") {
      this.name = name || DEFAULT_TASK_NAME;
      this.metrics = {};
      this.resources = {};
      this.id = crypto.randomUUID();
    }
    toJSON() {
      return {
        resources: this.resources,
        metrics: this.metrics,
        name: this.name,
        id: this.id
      };
    }
    static fromJSON(taskSerialized) {
      const ret = new _Task(taskSerialized.name);
      ret.id = taskSerialized.id;
      ret.resources = taskSerialized.resources;
      ret.metrics = taskSerialized.metrics;
      return ret;
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
      return ret;
    }
  };
  var Chart = class _Chart {
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
        vertices: this.Vertices.map((t4) => t4.toJSON()),
        edges: this.Edges.map((e3) => e3.toJSON())
      };
    }
    static fromJSON(chartSerialized) {
      const ret = new _Chart();
      ret.Vertices = chartSerialized.vertices.map(
        (ts) => Task.fromJSON(ts)
      );
      ret.Edges = chartSerialized.edges.map(
        (directedEdgeSerialized) => DirectedEdge.fromJSON(directedEdgeSerialized)
      );
      return ret;
    }
  };
  function validateDirectedGraph(g2) {
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
    for (let i3 = 1; i3 < g2.Vertices.length; i3++) {
      if (edgesByDst.get(i3) === void 0) {
        return error(
          `Found node that isn't (0) that has no incoming edges: ${i3}`
        );
      }
    }
    if (edgesBySrc.get(g2.Vertices.length - 1) !== void 0) {
      return error(
        "The last node, which should be the Finish Milestone, has an outgoing edge."
      );
    }
    for (let i3 = 0; i3 < g2.Vertices.length - 1; i3++) {
      if (edgesBySrc.get(i3) === void 0) {
        return error(
          `Found node that isn't T_finish that has no outgoing edges: ${i3}`
        );
      }
    }
    const numVertices = g2.Vertices.length;
    for (let i3 = 0; i3 < g2.Edges.length; i3++) {
      const element = g2.Edges[i3];
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
    const ret = validateDirectedGraph(c2);
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
    const allIDs = /* @__PURE__ */ new Set();
    for (let taskIndex = 0; taskIndex < c2.Vertices.length; taskIndex++) {
      const task = c2.Vertices[taskIndex];
      if (allIDs.has(task.id)) {
        return error(new Error(`Two tasks contain the same ID: ${task.id}`));
      }
      allIDs.add(task.id);
    }
    return ret;
  }

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
  function ComputeSlack(c2, taskDuration = null, round, override = null) {
    if (taskDuration === null) {
      taskDuration = (taskIndex) => c2.Vertices[taskIndex].duration;
    }
    const slacks = new Array(c2.Vertices.length);
    for (let i3 = 0; i3 < c2.Vertices.length; i3++) {
      slacks[i3] = new Slack();
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
        ...edges.byDst.get(vertexIndex).map((e3) => {
          const predecessorSlack = slacks[e3.i];
          return predecessorSlack.early.finish;
        })
      );
      const overrideValue = override?.(task.id);
      if (overrideValue !== void 0) {
        slack.early.start = overrideValue;
      }
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
        const overrideValue = override?.(task.id);
        if (overrideValue !== void 0) {
          slack.late = slack.early;
          slack.slack = 0;
        } else {
          const lateStarts = edges.bySrc.get(vertexIndex).map((e3) => {
            if (override?.(c2.Vertices[e3.j].id) !== void 0) {
              return null;
            }
            const successorSlack = slacks[e3.j];
            return successorSlack.late.start;
          }).filter((value) => value !== null);
          if (lateStarts.length === 0) {
            slack.late.finish = slack.early.finish;
          } else {
            slack.late.finish = Math.min(...lateStarts);
          }
          slack.late.start = round(slack.late.finish - taskDuration(vertexIndex));
          slack.slack = round(slack.late.finish - slack.early.finish);
        }
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

  // src/task_completion/task_completion.ts
  var toJSON = (taskCompletion) => {
    const ret = {
      stage: taskCompletion.stage,
      start: 0,
      finish: 0,
      percentComplete: 0
    };
    switch (taskCompletion.stage) {
      case "unstarted":
        break;
      case "started":
        ret.start = taskCompletion.start;
        ret.percentComplete = taskCompletion.percentComplete;
        break;
      case "finished":
        ret.start = taskCompletion.span.start;
        ret.finish = taskCompletion.span.finish;
        break;
      default:
        taskCompletion;
        break;
    }
    return ret;
  };
  var fromJSON = (taskCompletionSerialized) => {
    const unstarted2 = { stage: "unstarted" };
    switch (taskCompletionSerialized.stage) {
      case "unstarted":
        return {
          stage: "unstarted"
        };
      case "started":
        if (taskCompletionSerialized.start === void 0) {
          return unstarted2;
        }
        return {
          stage: "started",
          start: taskCompletionSerialized.start,
          percentComplete: taskCompletionSerialized.percentComplete
        };
      case "finished":
        if (taskCompletionSerialized.start === void 0 || taskCompletionSerialized.finish === void 0) {
          return unstarted2;
        }
        return {
          stage: "finished",
          span: new Span(
            taskCompletionSerialized.start,
            taskCompletionSerialized.finish
          )
        };
      default:
        return unstarted2;
    }
  };
  var taskCompletionsToJSON = (t4) => {
    return Object.fromEntries(
      Object.entries(t4).map(([key, taskCompletion]) => [
        key,
        toJSON(taskCompletion)
      ])
    );
  };
  var taskCompletionsFromJSON = (t4) => {
    return Object.fromEntries(
      Object.entries(t4).map(([key, taskCompletionSerialized]) => [
        key,
        fromJSON(taskCompletionSerialized)
      ])
    );
  };

  // src/plan_status/plan_status.ts
  var statusToDate = (status) => {
    if (status.stage === "unstarted") {
      return /* @__PURE__ */ new Date();
    }
    return new Date(status.start);
  };
  var unstarted = { stage: "unstarted", start: 0 };
  var toJSON2 = (p2) => {
    const ret = {
      stage: "unstarted",
      start: 0
    };
    if (p2.stage === "started") {
      ret.stage = "started";
      ret.start = p2.start.valueOf();
    }
    return ret;
  };
  var fromJSON2 = (p2) => {
    const unstarted2 = { stage: "unstarted", start: 0 };
    if (p2.stage === void 0) {
      return unstarted2;
    }
    if (p2.stage === "started") {
      if (p2.start === void 0) {
        return unstarted2;
      }
      return {
        stage: "started",
        start: p2.start
      };
    }
    return unstarted2;
  };

  // src/ops/plan.ts
  var SetTaskCompletionSubOp = class _SetTaskCompletionSubOp {
    taskIndex;
    value;
    constructor(taskIndex, value) {
      this.taskIndex = taskIndex;
      this.value = value;
    }
    applyTo(plan) {
      if (this.value.stage !== "unstarted" && plan.status.stage === "unstarted") {
        return error(
          new Error("Can't start a task if the plan hasn't been started.")
        );
      }
      const task = plan.chart.Vertices[this.taskIndex];
      const ret = plan.getTaskCompletion(this.taskIndex);
      if (!ret.ok) {
        return ret;
      }
      const oldTaskStatus = fromJSON(toJSON(ret.value));
      const setRet = plan.setTaskCompletion(this.taskIndex, this.value);
      if (!setRet.ok) {
        return setRet;
      }
      return ok({
        plan,
        inverse: new _SetTaskCompletionSubOp(this.taskIndex, oldTaskStatus)
      });
    }
  };
  function SetTaskCompletionOp(taskIndex, value) {
    return new Op([new SetTaskCompletionSubOp(taskIndex, value)]);
  }

  // src/task-completion-panel/task-completion-panel.ts
  var TaskCompletionPanel = class extends HTMLElement {
    explanMain = null;
    span = null;
    taskIndex = 0;
    taskCompletion = null;
    planDefinitionChangedCallback;
    constructor() {
      super();
      this.planDefinitionChangedCallback = () => {
        this.updateOnInput();
      };
    }
    connectedCallback() {
      document.addEventListener(
        "plan-definition-changed",
        this.planDefinitionChangedCallback
      );
    }
    disconnectedCallback() {
      document.removeEventListener(
        "plan-definition-changed",
        this.planDefinitionChangedCallback
      );
    }
    update(explanMain2, taskIndex, span) {
      this.explanMain = explanMain2;
      this.taskIndex = taskIndex;
      this.span = span;
      this.updateOnInput();
    }
    updateOnInput() {
      const ret = this.explanMain.plan.getTaskCompletion(this.taskIndex);
      if (ret.ok) {
        this.taskCompletion = ret.value;
      }
      B(this.template(), this);
    }
    template() {
      if (this.taskCompletion === null) {
        return x``;
      }
      switch (this.taskCompletion.stage) {
        case "unstarted":
          return x`<div>
          <label>
            <input type="checkbox" @change=${() => this.start()} />
            Started
          </label>
        </div>`;
          break;
        case "started":
          return x`<div>
          <label>
            <input type="checkbox" checked @change=${() => this.unstart()} />
            Started
          </label>

          <date-picker
            .value=${{
            unit: this.explanMain.plan.durationUnits,
            dateOffset: this.taskCompletion.start
          }}
            @date-picker-input=${(e3) => this.startDateChanged(e3)}
          ></date-picker>

          <label>
            Percent Complete
            <input
              type="number"
              .value=${this.taskCompletion.percentComplete}
              @input=${(e3) => this.percentChange(e3)}
            />
          </label>

          <label>
            <input type="checkbox" @change=${() => this.finish()} />
            Finished
          </label>
        </div>`;
          break;
        case "finished":
          return x`<div>
          <label>
            <input type="checkbox" checked @change=${() => this.unstart()} />
            Started
          </label>
          <date-picker
            .value=${{
            unit: this.explanMain.plan.durationUnits,
            dateOffset: this.taskCompletion.span.start
          }}
            @date-picker-input=${(e3) => this.startDateChanged(e3)}
          ></date-picker>

          <label>
            <input type="checkbox" checked @change=${() => this.unfinish()} />
            Finished
          </label>
          <date-picker
            .value=${{
            unit: this.explanMain.plan.durationUnits,
            dateOffset: this.taskCompletion.span.finish
          }}
            @date-picker-input=${(e3) => this.finishDateChanged(e3)}
          ></date-picker>
        </div>`;
          break;
        default:
          this.taskCompletion;
          return x``;
          break;
      }
    }
    async taskCompletionChanged(t4) {
      const ret = await executeOp(
        SetTaskCompletionOp(this.taskIndex, t4),
        "planDefinitionChanged",
        true,
        this.explanMain
      );
      if (!ret.ok) {
        console.log(ret.error);
      }
    }
    async start() {
      this.taskCompletionChanged({
        stage: "started",
        start: this.span.start,
        percentComplete: 10
      });
    }
    unstart() {
      this.taskCompletionChanged({
        stage: "unstarted"
      });
    }
    finish() {
      if (this.taskCompletion.stage === "started") {
        this.taskCompletionChanged({
          stage: "finished",
          // TODO Make sure finish > start.
          // TODO Make finish default to "today"?
          span: new Span(this.taskCompletion.start, this.span.finish)
        });
      }
    }
    unfinish() {
      if (this.taskCompletion.stage === "finished") {
        this.taskCompletionChanged({
          stage: "started",
          // TODO Make sure finish > start.
          // TODO Make finish default to "today"?
          percentComplete: 90,
          start: this.taskCompletion.span.start
        });
      }
    }
    percentChange(e3) {
      const dup2 = fromJSON(toJSON(this.taskCompletion));
      if (dup2.stage === "started") {
        dup2.percentComplete = e3.target.valueAsNumber;
        this.taskCompletionChanged(dup2);
      }
    }
    startDateChanged(e3) {
      const dup2 = fromJSON(toJSON(this.taskCompletion));
      if (dup2.stage === "finished") {
        dup2.span.start = e3.detail;
      } else if (dup2.stage === "started") {
        dup2.start = e3.detail;
      }
      this.taskCompletionChanged(dup2);
    }
    finishDateChanged(e3) {
      const dup2 = fromJSON(toJSON(this.taskCompletion));
      if (dup2.stage === "finished") {
        dup2.span.finish = e3.detail;
      }
      this.taskCompletionChanged(dup2);
    }
  };
  customElements.define("task-completion-panel", TaskCompletionPanel);

  // src/edit-plan-start/edit-plan-start.ts
  var EditPlanStartDialog = class extends HTMLElement {
    status = unstarted;
    dialog = null;
    resolve = () => {
    };
    constructor() {
      super();
    }
    connectedCallback() {
      this.render();
      this.dialog = this.querySelector("dialog");
      this.dialog.addEventListener("cancel", () => this.resolve(void 0));
    }
    start(status) {
      const ret = new Promise((resolve, _reject) => {
        this.resolve = resolve;
        this.dialog.showModal();
      });
      return ret;
    }
    render() {
      B(this.template(), this);
    }
    close() {
      this.querySelector("dialog").close();
      this.resolve(this.status);
    }
    cancel() {
      this.querySelector("dialog").close();
      this.resolve(void 0);
    }
    dateControlValue() {
      const d2 = new Date(this.status.start);
      return dateControlValue(d2);
    }
    startChanged(e3) {
      if (e3.target.checked) {
        this.status.stage = "started";
      } else {
        this.status.stage = "unstarted";
      }
      this.render();
    }
    dateChanged(e3) {
      const date = e3.target.valueAsDate;
      if (date === null) {
        this.status.start = 0;
      } else {
        date.setHours(date.getHours() + 12);
        this.status.start = date.getTime();
      }
      this.render();
    }
    template() {
      return x`
      <dialog>
        <h3>Plan Status</h3>
        <span>
          <input
            type="checkbox"
            .checked=${this.status.stage === "started"}
            @input=${(e3) => this.startChanged(e3)}
          />
          Started
        </span>
        <div class="${this.status.stage === "started" ? "" : "hidden"}">
          <input
            type="date"
            value=${this.dateControlValue()}
            @input=${(e3) => this.dateChanged(e3)}
          />
        </div>
        <div class="dialog-footer">
          <button @click=${() => this.close()}>Cancel</button>
          <button @click=${() => this.close()}>OK</button>
        </div>
      </dialog>
    `;
    }
  };
  customElements.define("edit-plan-start", EditPlanStartDialog);

  // src/resources/resources.ts
  var DEFAULT_RESOURCE_VALUE = "";
  var ResourceDefinition = class _ResourceDefinition {
    values;
    // True if the Resource is built in and can't be edited or deleted.
    isStatic;
    constructor(values = [DEFAULT_RESOURCE_VALUE], isStatic = false) {
      this.values = values;
      this.isStatic = isStatic;
    }
    toJSON() {
      return {
        values: this.values,
        static: this.isStatic
      };
    }
    static fromJSON(s2) {
      return new _ResourceDefinition(s2.values, s2.static);
    }
  };

  // src/icons/icons.ts
  var icon = (name) => {
    return x`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <use href=#${name}>
  </svg>`;
  };

  // src/ops/resources.ts
  var AddResourceSubOp = class {
    key;
    deleteResourceUndoState;
    constructor(name, deleteResourceUndoState = null) {
      this.key = name;
      this.deleteResourceUndoState = deleteResourceUndoState;
    }
    applyTo(plan) {
      const foundMatch = plan.getResourceDefinition(this.key);
      if (foundMatch !== void 0) {
        return error(`${this.key} already exists as a Resource`);
      }
      plan.setResourceDefinition(
        this.key,
        this.deleteResourceUndoState && this.deleteResourceUndoState.resourceDefinition || new ResourceDefinition()
      );
      plan.chart.Vertices.forEach((task, index) => {
        task.setResource(
          this.key,
          this.deleteResourceUndoState && this.deleteResourceUndoState.taskIndexToDeletedResourceValue.get(
            index
          ) || DEFAULT_RESOURCE_VALUE
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
      plan.deleteResourceDefinition(this.key);
      const taskIndexToDeletedResourceValue = /* @__PURE__ */ new Map();
      plan.chart.Vertices.forEach((task, index) => {
        const value = task.getResource(this.key) || DEFAULT_RESOURCE_VALUE;
        taskIndexToDeletedResourceValue.set(index, value);
        task.deleteResource(this.key);
      });
      const deleteResourceUndoState = {
        resourceDefinition,
        taskIndexToDeletedResourceValue
      };
      return ok({
        plan,
        inverse: this.inverse(deleteResourceUndoState)
      });
    }
    inverse(deleteResourceUndoState) {
      return new AddResourceSubOp(this.key, deleteResourceUndoState);
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
        if (resourceValue !== this.value) {
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
  var RenameResourceSubOp = class _RenameResourceSubOp {
    oldKey;
    newKey;
    constructor(oldKey, newKey) {
      this.oldKey = oldKey;
      this.newKey = newKey;
    }
    applyTo(plan) {
      const oldDefinition = plan.getResourceDefinition(this.oldKey);
      if (oldDefinition === void 0) {
        return error(`${this.oldKey} does not exist as a Resource`);
      }
      const newKeyDefinition = plan.getResourceDefinition(this.newKey);
      if (newKeyDefinition !== void 0) {
        return error(`${this.newKey} already exists as a resource name.`);
      }
      plan.deleteResourceDefinition(this.oldKey);
      plan.setResourceDefinition(this.newKey, oldDefinition);
      plan.chart.Vertices.forEach((task) => {
        const currentValue = task.getResource(this.oldKey) || DEFAULT_RESOURCE_VALUE;
        task.setResource(this.newKey, currentValue);
        task.deleteResource(this.oldKey);
      });
      return ok({ plan, inverse: this.inverse() });
    }
    inverse() {
      return new _RenameResourceSubOp(this.newKey, this.oldKey);
    }
  };
  var RenameResourceOptionSubOp = class _RenameResourceOptionSubOp {
    key;
    oldValue;
    newValue;
    constructor(key, oldValue, newValue) {
      this.key = key;
      this.oldValue = oldValue;
      this.newValue = newValue;
    }
    applyTo(plan) {
      const foundMatch = plan.getResourceDefinition(this.key);
      if (foundMatch === void 0) {
        return error(`${this.key} does not exist as a Resource`);
      }
      const oldValueIndex = foundMatch.values.indexOf(this.oldValue);
      if (oldValueIndex === -1) {
        return error(`${this.key} does not a value ${this.oldValue}`);
      }
      const newValueIndex = foundMatch.values.indexOf(this.newValue);
      if (newValueIndex !== -1) {
        return error(`${this.key} already has a value ${this.newValue}`);
      }
      foundMatch.values.splice(oldValueIndex, 1, this.newValue);
      plan.chart.Vertices.forEach((task) => {
        const currentValue = task.getResource(this.key);
        if (currentValue === this.oldValue) {
          task.setResource(this.key, this.newValue);
        }
      });
      return ok({ plan, inverse: this.inverse() });
    }
    inverse() {
      return new _RenameResourceOptionSubOp(
        this.key,
        this.newValue,
        this.oldValue
      );
    }
  };
  var MoveResourceOptionSubOp = class _MoveResourceOptionSubOp {
    key;
    oldIndex;
    newIndex;
    constructor(key, oldValue, newValue) {
      this.key = key;
      this.oldIndex = oldValue;
      this.newIndex = newValue;
    }
    applyTo(plan) {
      const definition = plan.getResourceDefinition(this.key);
      if (definition === void 0) {
        return error(`${this.key} does not exist as a Resource`);
      }
      if (this.newIndex < 0) {
        return error(`${this.newIndex} is not a valid target value.`);
      }
      if (this.oldIndex > definition.values.length - 1) {
        return error(
          `${this.key} does not have a value at index ${this.oldIndex}`
        );
      }
      if (this.newIndex > definition.values.length - 1) {
        return error(
          `${this.key} does not have a value at index ${this.newIndex}`
        );
      }
      const tmp = definition.values[this.oldIndex];
      definition.values[this.oldIndex] = definition.values[this.newIndex];
      definition.values[this.newIndex] = tmp;
      return ok({ plan, inverse: this.inverse() });
    }
    inverse() {
      return new _MoveResourceOptionSubOp(this.key, this.newIndex, this.oldIndex);
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
  function DeleteResourceOp(name) {
    return new Op([new DeleteResourceSupOp(name)]);
  }
  function AddResourceOptionOp(key, value) {
    return new Op([new AddResourceOptionSubOp(key, value)]);
  }
  function DeleteResourceOptionOp(key, value) {
    return new Op([new DeleteResourceOptionSubOp(key, value)]);
  }
  function RenameResourceOptionOp(key, oldValue, newValue) {
    return new Op([new RenameResourceOptionSubOp(key, oldValue, newValue)]);
  }
  function RenameResourceOp(oldValue, newValue) {
    return new Op([new RenameResourceSubOp(oldValue, newValue)]);
  }
  function MoveResourceOptionOp(key, oldIndex, newIndex) {
    return new Op([new MoveResourceOptionSubOp(key, oldIndex, newIndex)]);
  }
  function SetResourceValueOp(key, value, taskIndex) {
    return new Op([new SetResourceValueSubOp(key, value, taskIndex)]);
  }

  // node_modules/lit-html/directive.js
  var t2 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
  var e2 = (t4) => (...e3) => ({ _$litDirective$: t4, values: e3 });
  var i2 = class {
    constructor(t4) {
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AT(t4, e3, i3) {
      this._$Ct = t4, this._$AM = e3, this._$Ci = i3;
    }
    _$AS(t4, e3) {
      return this.update(t4, e3);
    }
    update(t4, e3) {
      return this.render(...e3);
    }
  };

  // node_modules/lit-html/directive-helpers.js
  var { I: t3 } = Z;
  var f2 = (o2) => void 0 === o2.strings;
  var u2 = {};
  var m2 = (o2, t4 = u2) => o2._$AH = t4;

  // node_modules/lit-html/directives/live.js
  var l2 = e2(class extends i2 {
    constructor(r2) {
      if (super(r2), r2.type !== t2.PROPERTY && r2.type !== t2.ATTRIBUTE && r2.type !== t2.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
      if (!f2(r2)) throw Error("`live` bindings can only contain a single expression");
    }
    render(r2) {
      return r2;
    }
    update(i3, [t4]) {
      if (t4 === T || t4 === E) return t4;
      const o2 = i3.element, l3 = i3.name;
      if (i3.type === t2.PROPERTY) {
        if (t4 === o2[l3]) return T;
      } else if (i3.type === t2.BOOLEAN_ATTRIBUTE) {
        if (!!t4 === o2.hasAttribute(l3)) return T;
      } else if (i3.type === t2.ATTRIBUTE && o2.getAttribute(l3) === t4 + "") return T;
      return m2(i3), t4;
    }
  });

  // src/edit-resource-definition/edit-resource-definition.ts
  var EditResourceDefinition = class extends HTMLElement {
    explanMain = null;
    resourceDefinition = new ResourceDefinition();
    name = "";
    planDefinitionChangedCallback;
    newValueCounter = 0;
    constructor() {
      super();
      this.planDefinitionChangedCallback = () => {
        this.render();
      };
    }
    connectedCallback() {
      document.addEventListener(
        "plan-definition-changed",
        this.planDefinitionChangedCallback
      );
    }
    disconnectedCallback() {
      document.removeEventListener(
        "plan-definition-changed",
        this.planDefinitionChangedCallback
      );
    }
    showModal(explanMain2, name, resourceDefinition) {
      this.explanMain = explanMain2;
      this.resourceDefinition = resourceDefinition;
      this.name = name;
      this.render();
      this.querySelector("dialog").showModal();
    }
    render() {
      B(this.template(), this);
    }
    cancel() {
      this.querySelector("dialog").close();
    }
    async executeOp(op) {
      const ret = await executeOp(
        op,
        "planDefinitionChanged",
        true,
        this.explanMain
      );
      if (!ret.ok) {
        window.alert(ret.error);
      }
      return ret;
    }
    async changeResourceName(e3, newName, oldName) {
      const ret = await this.executeOp(RenameResourceOp(oldName, newName));
      if (!ret.ok) {
        window.alert(ret.error);
        this.name = oldName;
        this.render();
      }
      this.name = newName;
    }
    async changeResourceValueName(e3, newValue, oldValue) {
      const ret = await this.executeOp(
        RenameResourceOptionOp(this.name, oldValue, newValue)
      );
      if (!ret.ok) {
        window.alert(ret.error);
        e3.target.value = oldValue;
        this.render();
      }
    }
    getProposedResourceName() {
      this.newValueCounter++;
      return `New Value ${this.newValueCounter}`;
    }
    async newResourceValue() {
      this.newValueCounter = 0;
      let newResourceName = this.getProposedResourceName();
      while (this.explanMain.plan.resourceDefinitions[this.name].values.findIndex(
        (value) => value === newResourceName
      ) != -1) {
        newResourceName = this.getProposedResourceName();
      }
      await this.executeOp(AddResourceOptionOp(this.name, newResourceName));
    }
    async moveUp(value, valueIndex) {
      await this.executeOp(
        MoveResourceOptionOp(this.name, valueIndex, valueIndex - 1)
      );
    }
    async moveDown(value, valueIndex) {
      await this.executeOp(
        MoveResourceOptionOp(this.name, valueIndex, valueIndex + 1)
      );
    }
    async moveToTop(value, valueIndex) {
      await this.executeOp(MoveResourceOptionOp(this.name, valueIndex, 0));
    }
    async moveToBottom(value, valueIndex) {
      await this.executeOp(
        MoveResourceOptionOp(
          this.name,
          valueIndex,
          this.explanMain.plan.resourceDefinitions[this.name].values.length - 1
        )
      );
    }
    async deleteResourceValue(value, valueIndex) {
      await this.executeOp(DeleteResourceOptionOp(this.name, value));
    }
    template() {
      return x`
      <dialog>
        <label>
          Name:
          <input
            type="text"
            .value=${l2(this.name)}
            data-old-name=${this.name}
            @change=${(e3) => {
        const ele = e3.target;
        this.changeResourceName(e3, ele.value, ele.dataset.oldName || "");
      }}
          />
        </label>
        <table>
          ${this.resourceDefinition.values.map(
        (value, valueIndex) => {
          return x`<tr>
                <td>
                  <input
                    data-old-value=${value}
                    @change=${(e3) => {
            const ele = e3.target;
            this.changeResourceValueName(
              e3,
              ele.value,
              ele.dataset.oldValue || ""
            );
          }}
                    .value=${l2(value)}
                    type="text"
                  />
                </td>
                <td>
                  <button
                    @click=${() => this.moveUp(value, valueIndex)}
                    class="icon-button"
                    .disabled=${valueIndex === 0}
                  >
                    ${icon("keyboard-up-icon")}
                  </button>
                </td>
                <td>
                  <button
                    .disabled=${valueIndex === this.resourceDefinition.values.length - 1}
                    class="icon-button"
                    @click=${() => this.moveDown(value, valueIndex)}
                  >
                    ${icon("keyboard-down-icon")}
                  </button>
                </td>
                <td>
                  <button
                    .disabled=${valueIndex === this.resourceDefinition.values.length - 1}
                    class="icon-button"
                    @click=${() => this.moveToBottom(value, valueIndex)}
                  >
                    ${icon("keyboard-double-down-icon")}
                  </button>
                </td>
                <td>
                  <button
                    .disabled=${valueIndex === 0}
                    class="icon-button"
                    @click=${() => this.moveToTop(value, valueIndex)}
                  >
                    ${icon("keyboard-double-up-icon")}
                  </button>
                </td>
                <td>
                  <button
                    .disabled=${this.resourceDefinition.values.length === 1}
                    class="icon-button"
                    @click=${() => this.deleteResourceValue(value, valueIndex)}
                  >
                    ${icon("delete-icon")}
                  </button>
                </td>
              </tr>`;
        }
      )}
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <button
                @click=${() => {
        this.newResourceValue();
      }}
              >
                New
              </button>
            </td>
          </tr>
        </table>
        <div class="dialog-footer">
          <button @click=${() => this.cancel()}>Close</button>
        </div>
      </dialog>
    `;
    }
  };
  customElements.define("edit-resource-definition", EditResourceDefinition);

  // src/metrics/range.ts
  var displayValue = (x2) => {
    if (x2 === Number.MAX_VALUE) {
      return "(max float)";
    } else if (x2 === -Number.MAX_VALUE) {
      return "(min float)";
    } else {
      return x2.toString();
    }
  };
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
    static fromJSON(s2) {
      if (s2 === void 0) {
        return new _MetricRange();
      }
      return new _MetricRange(s2.min, s2.max);
    }
  };

  // src/precision/precision.ts
  var Precision = class _Precision {
    _precision;
    constructor(precision2 = 0) {
      if (!Number.isFinite(precision2)) {
        precision2 = 0;
      }
      this._precision = Math.abs(Math.trunc(precision2));
    }
    round(x2) {
      return +x2.toFixed(this._precision);
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
    static fromJSON(s2) {
      if (s2 === void 0) {
        return new _Precision();
      }
      return new _Precision(s2.precision);
    }
  };

  // src/metrics/metrics.ts
  var MetricDefinition = class _MetricDefinition {
    range;
    default;
    isStatic;
    precision;
    constructor(defaultValue, range = new MetricRange(), isStatic = false, precision2 = new Precision(1)) {
      this.precision = precision2;
      this.range = range;
      this.default = defaultValue;
      this.isStatic = isStatic;
      this.rationalize();
    }
    rationalize() {
      this.range = new MetricRange(
        this.precision.round(this.range.min),
        this.precision.round(this.range.max)
      );
      this.default = this.clampAndRound(this.default);
    }
    clampAndRound(x2) {
      return this.precision.round(this.range.clamp(x2));
    }
    toJSON() {
      return {
        range: this.range.toJSON(),
        default: this.default,
        precision: this.precision.toJSON()
      };
    }
    static fromJSON(s2) {
      if (s2 === void 0) {
        return new _MetricDefinition(0);
      }
      return new _MetricDefinition(
        s2.default || 0,
        MetricRange.fromJSON(s2.range),
        false,
        Precision.fromJSON(s2.precision)
      );
    }
  };

  // src/edit-metrics-dialog/edit-metrics-dialog.ts
  var EditMetricsDialog = class extends HTMLElement {
    explanMain = null;
    planDefinitionChangedCallback;
    constructor() {
      super();
      this.planDefinitionChangedCallback = () => {
        if (this.explanMain !== null) {
          this.render();
        }
      };
    }
    connectedCallback() {
      document.addEventListener(
        "plan-definition-changed",
        this.planDefinitionChangedCallback
      );
    }
    disconnectedCallback() {
      document.removeEventListener(
        "plan-definition-changed",
        this.planDefinitionChangedCallback
      );
    }
    render() {
      B(this.template(), this);
    }
    showModal(explanMain2) {
      this.explanMain = explanMain2;
      this.render();
      this.querySelector("dialog").showModal();
    }
    cancel() {
      this.querySelector("dialog").close();
    }
    template() {
      const md = this.explanMain.plan.metricDefinitions;
      const allKeysSorted = Object.keys(md).sort(
        (keyA, keyB) => {
          const a2 = md[keyA];
          const b2 = md[keyB];
          if (a2.isStatic === b2.isStatic) {
            return keyA.localeCompare(keyB);
          }
          if (a2.isStatic) {
            return -1;
          }
          return 1;
        }
      );
      return x` <dialog>
      <table>
        <tr>
          <th>Name</th>
          <th>Min</th>
          <th>Max</th>
          <th>Default</th>
          <th></th>
          <th></th>
        </tr>

        ${allKeysSorted.map((metricName) => {
        const metricDefn = this.explanMain.plan.metricDefinitions[metricName];
        return x`
            <tr>
              <td>${metricName}</td>
              <td>${displayValue(metricDefn.range.min)}</td>
              <td>${displayValue(metricDefn.range.max)}</td>
              <td>${metricDefn.default}</td>
              <td>
                ${this.delButtonIfNotStatic(metricName, metricDefn.isStatic)}
              </td>
              <td>
                ${this.editButtonIfNotStatic(metricName, metricDefn.isStatic)}
              </td>
            </tr>
          `;
      })}
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td>
            <button
              class="icon-button"
              title="Add a new Resource."
              @click=${() => {
        this.newMetric();
      }}
            >
              ${icon("add-icon")}
            </button>
          </td>
        </tr>
      </table>
      <div class="dialog-footer">
        <button @click=${() => this.cancel()}>Close</button>
      </div>
    </dialog>`;
    }
    delButtonIfNotStatic(name, isStatic) {
      if (isStatic) {
        return x``;
      }
      return x`<button
      class="icon-button"
      title="Delete this metric."
      @click=${() => this.deleteMetric(name)}
    >
      ${icon("delete-icon")}
    </button>`;
    }
    async deleteMetric(name) {
      const ret = await executeOp(
        DeleteMetricOp(name),
        "planDefinitionChanged",
        true,
        this.explanMain
      );
      if (!ret.ok) {
        console.log(ret.error);
      }
      this.render();
    }
    editButtonIfNotStatic(name, isStatic) {
      if (isStatic) {
        return x``;
      }
      return x`<button
      class="icon-button"
      title="Edit the resource definition."
      @click=${() => this.editMetric(name)}
    >
      ${icon("edit-icon")}
    </button>`;
    }
    editMetric(name) {
      this.cancel();
      this.explanMain.querySelector(
        "edit-metric-definition"
      ).showModal(this.explanMain, name);
    }
    async newMetric() {
      const name = window.prompt("Metric name:", "");
      if (name === null) {
        return;
      }
      const ret = await executeOp(
        AddMetricOp(name, new MetricDefinition(0)),
        "planDefinitionChanged",
        true,
        this.explanMain
      );
      if (!ret.ok) {
        window.alert(ret.error);
        console.log(ret.error);
      }
      this.render();
    }
  };
  customElements.define("edit-metrics-dialog", EditMetricsDialog);

  // src/report-error/report-error.ts
  var reportError = (error2) => {
    console.log(error2);
  };
  var reportOnError = (ret) => {
    if (!ret.ok) {
      reportError(ret.error);
    }
  };

  // src/edit-metric-definition/edit-metric-definition.ts
  var EditMetricDefinition = class extends HTMLElement {
    explanMain = null;
    metricName = "";
    planDefinitionChangedCallback;
    constructor() {
      super();
      this.planDefinitionChangedCallback = () => {
        this.render();
      };
    }
    connectedCallback() {
      document.addEventListener(
        "plan-definition-changed",
        this.planDefinitionChangedCallback
      );
    }
    disconnectedCallback() {
      document.removeEventListener(
        "plan-definition-changed",
        this.planDefinitionChangedCallback
      );
    }
    render() {
      B(this.template(), this);
    }
    template() {
      const defn = this.explanMain?.plan.metricDefinitions[this.metricName];
      if (!defn) {
        return x``;
      }
      return x`<dialog>
      <table>
        <tr>
          <th>Name</th>
          <td>
            <input
              .value=${l2(this.metricName)}
              @change=${(e3) => this.nameChange(e3)}
            />
          </td>
          <td></td>
        </tr>
        <tr>
          <th>Min</th>
          <td>
            <input
              .value=${l2(displayValue(defn.range.min))}
              ?disabled=${defn.range.min === -Number.MAX_VALUE}
              @change=${(e3) => this.minChange(e3)}
            />
          </td>
          <td>
            <label>
              <input
                type="checkbox"
                ?checked=${defn.range.min !== -Number.MAX_VALUE}
                @change=${(e3) => {
        this.minLimitChange(e3);
      }}
              />
              Limit</label
            >
          </td>
        </tr>
        <tr>
          <th>Max</th>
          <td>
            <input
              .value=${l2(displayValue(defn.range.max))}
              ?disabled=${defn.range.max === Number.MAX_VALUE}
              @change=${(e3) => this.maxChange(e3)}
            />
          </td>
          <td>
            <label>
              <input
                type="checkbox"
                ?checked=${defn.range.max !== Number.MAX_VALUE}
                @change=${(e3) => {
        this.maxLimitChange(e3);
      }}
              />
              Limit</label
            >
          </td>
        </tr>
        <tr>
          <th>Precision</th>
          <td>
            <input
              .value=${l2(defn.precision.precision)}
              @change=${(e3) => {
        this.precisionChange(e3);
      }}
            />
          </td>
          <td></td>
        </tr>
        <tr>
          <th>Default</th>
          <td>
            <input
              .value=${l2(defn.default)}
              @change=${(e3) => {
        this.defaultChange(e3);
      }}
            />
          </td>
          <td></td>
        </tr>
      </table>
      <div class="dialog-footer">
        <button @click=${() => this.cancel()}>Close</button>
      </div>
    </dialog>`;
    }
    async executeOp(op) {
      const ret = await executeOp(
        op,
        "planDefinitionChanged",
        true,
        this.explanMain
      );
      if (!ret.ok) {
        window.alert(ret.error);
      }
      return ret;
    }
    async minLimitChange(e3) {
      const ele = e3.target;
      const defn = this.getDefinitionCopy();
      if (ele.checked) {
        const newMin = 0 < defn.range.max ? 0 : defn.range.max - 1;
        defn.range = new MetricRange(newMin, defn.range.max);
      } else {
        defn.range = new MetricRange(-Number.MAX_VALUE, defn.range.max);
      }
      this.updateMetricDefinition(defn);
    }
    async maxLimitChange(e3) {
      const ele = e3.target;
      const defn = this.getDefinitionCopy();
      if (ele.checked) {
        const newMax = 100 > defn.range.min ? 100 : defn.range.min + 1;
        defn.range = new MetricRange(defn.range.min, newMax);
      } else {
        defn.range = new MetricRange(defn.range.min, Number.MAX_VALUE);
      }
      this.updateMetricDefinition(defn);
    }
    async nameChange(e3) {
      const ele = e3.target;
      const oldName = this.metricName;
      const newName = ele.value;
      this.metricName = newName;
      const ret = await this.executeOp(RenameMetricOp(oldName, newName));
      if (!ret.ok) {
        this.metricName = oldName;
      }
      this.render();
    }
    async defaultChange(e3) {
      const ele = e3.target;
      const defn = this.getDefinitionCopy();
      defn.default = +ele.value;
      this.updateMetricDefinition(defn);
    }
    async precisionChange(e3) {
      const ele = e3.target;
      const defn = this.getDefinitionCopy();
      defn.precision = new Precision(+ele.value);
      this.updateMetricDefinition(defn);
    }
    async minChange(e3) {
      const ele = e3.target;
      const newValue = +ele.value;
      const definitionCopy = this.getDefinitionCopy();
      definitionCopy.range = new MetricRange(newValue, definitionCopy.range.max);
      this.updateMetricDefinition(definitionCopy);
    }
    async maxChange(e3) {
      const ele = e3.target;
      const newValue = +ele.value;
      const definitionCopy = this.getDefinitionCopy();
      definitionCopy.range = new MetricRange(definitionCopy.range.min, newValue);
      this.updateMetricDefinition(definitionCopy);
    }
    async updateMetricDefinition(newDef) {
      newDef.rationalize();
      const ret = await this.executeOp(UpdateMetricOp(this.metricName, newDef));
      if (!ret.ok) {
        reportError(ret.error);
      }
      this.render();
    }
    getDefinitionCopy() {
      const defn = this.explanMain?.plan.metricDefinitions[this.metricName];
      return MetricDefinition.fromJSON(defn?.toJSON());
    }
    cancel() {
      this.querySelector("dialog").close();
    }
    showModal(explanMain2, metricName) {
      this.explanMain = explanMain2;
      this.metricName = metricName;
      this.render();
      this.querySelector("dialog").showModal();
    }
  };
  customElements.define("edit-metric-definition", EditMetricDefinition);

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
          class="icon-button"
          title="Delete the dependency on ${task.name}"
          @click=${() => dependenciesControl.deleteDep(taskIndex, depType)}
        >
          ${icon("delete-icon")}
        </button>
      </td>
    </tr>`;
  })}
  <tr>
    <td></td>
    <td>
      <button
        class="icon-button"
        @click=${() => dependenciesControl.addDep(depType)}
        title="Add dependency."
      >
        ${icon("add-icon")}
      </button>
    </td>
  </tr>
`;
  var template = (dependenciesControl) => x`
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
      B(template(this), this);
    }
    setTasksAndIndices(tasks, predIndexes, succIndexes) {
      this.tasks = tasks;
      this.predIndexes = predIndexes;
      this.succIndexes = succIndexes;
      B(template(this), this);
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

  // src/dag/algorithms/dfs.ts
  var depthFirstSearchFromIndex = (g2, start_index, f3) => {
    const edgesBySrc = edgesBySrcToMap(g2.Edges);
    const visit = (vertexIndex) => {
      if (f3(g2.Vertices[vertexIndex], vertexIndex) === false) {
        return;
      }
      const next = edgesBySrc.get(vertexIndex);
      if (next === void 0) {
        return;
      }
      next.forEach((e3) => {
        visit(e3.j);
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
        predecessorsToCheck.push(...predecessors.map((e3) => e3.i));
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
    return a2.filter((i3) => bSet.has(i3) === false);
  };
  var allPotentialSuccessors = (taskIndex, directedGraph) => {
    const bySrc = edgesBySrcToMap(directedGraph.Edges);
    const directSucc = bySrc.get(taskIndex) || [];
    const directSuccArray = directSucc.map((e3) => e3.j);
    return difference(allTasks(directedGraph), [
      ...allPredecessors(taskIndex, directedGraph),
      ...directSuccArray
    ]);
  };
  var allPotentialPredecessors = (taskIndex, directedGraph) => {
    const byDest = edgesByDstToMap(directedGraph.Edges);
    const directPred = byDest.get(taskIndex) || [];
    const directPredArray = directPred.map((e3) => e3.i);
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
      this.taskSearchControl.addEventListener("task-change", (e3) => {
        this.dialog.close();
        this.resolve(e3.detail.taskIndex);
      });
    }
    /** Populates the dialog and shows it as a Modal dialog and returns a Promise
     *  that resolves on success to a taskIndex, or undefined if the user
     *  cancelled out of the flow.
     */
    selectDependency(chart, taskIndex, depType) {
      this.titleElement.textContent = depDisplayName[depType];
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

  // src/edit-resources-dialog/edit-resources-dialog.ts
  var MAX_SHORT_STRING = 80;
  var EditResourcesDialog = class extends HTMLElement {
    explanMain = null;
    planDefinitionChangedCallback;
    constructor() {
      super();
      this.planDefinitionChangedCallback = () => {
        if (this.explanMain !== null) {
          this.render();
        }
      };
    }
    connectedCallback() {
      document.addEventListener(
        "plan-definition-changed",
        this.planDefinitionChangedCallback
      );
    }
    disconnectedCallback() {
      document.removeEventListener(
        "plan-definition-changed",
        this.planDefinitionChangedCallback
      );
    }
    showModal(explanMain2) {
      this.explanMain = explanMain2;
      this.render();
      this.querySelector("dialog").showModal();
    }
    render() {
      B(this.template(), this);
    }
    valuesToShortString(values) {
      let ret = values.join(", ");
      if (ret.length > MAX_SHORT_STRING) {
        ret = ret.slice(0, MAX_SHORT_STRING) + " ...";
      }
      return ret;
    }
    delButtonIfNotStatic(name, isStatic) {
      if (isStatic) {
        return x``;
      }
      return x`<button
      class="icon-button"
      title="Delete this resource."
      @click=${() => this.deleteResource(name)}
    >
      ${icon("delete-icon")}
    </button>`;
    }
    editButtonIfNotStatic(name, isStatic) {
      if (isStatic) {
        return x``;
      }
      return x`<button
      class="icon-button"
      title="Edit the resource definition."
      @click=${() => this.editResource(name)}
    >
      ${icon("edit-icon")}
    </button>`;
    }
    async deleteResource(name) {
      const ret = await executeOp(
        DeleteResourceOp(name),
        "planDefinitionChanged",
        true,
        this.explanMain
      );
      if (!ret.ok) {
        console.log(ret.error);
      }
      this.render();
    }
    close() {
      this.querySelector("dialog").close();
    }
    editResource(name) {
      this.close();
      this.explanMain.querySelector(
        "edit-resource-definition"
      ).showModal(
        this.explanMain,
        name,
        this.explanMain.plan.resourceDefinitions[name]
      );
    }
    async newResource() {
      const name = window.prompt("Resource name:", "");
      if (name === null) {
        return;
      }
      const ret = await executeOp(
        AddResourceOp(name),
        "planDefinitionChanged",
        true,
        this.explanMain
      );
      if (!ret.ok) {
        window.alert(ret.error);
        console.log(ret.error);
      }
      this.render();
    }
    template() {
      const rd = this.explanMain.plan.resourceDefinitions;
      const allKeysSorted = Object.keys(rd).sort(
        (keyA, keyB) => {
          const a2 = rd[keyA];
          const b2 = rd[keyB];
          if (a2.isStatic === b2.isStatic) {
            return keyA.localeCompare(keyB);
          }
          if (a2.isStatic) {
            return -1;
          }
          return 1;
        }
      );
      return x`
      <dialog>
        <h3>Resources</h3>
        <table>
          <tr>
            <th>Name</th>
            <th>Values</th>
            <th>Delete</th>
            <th>Edit</th>
          </tr>
          ${allKeysSorted.map((name) => {
        const defn = rd[name];
        return x`<tr>
              <td>${name}</td>
              <td>${this.valuesToShortString(defn.values)}</td>
              <td>${this.delButtonIfNotStatic(name, defn.isStatic)}</td>
              <td>${this.editButtonIfNotStatic(name, defn.isStatic)}</td>
            </tr>`;
      })}
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <button
                class="icon-button"
                title="Add a new Resource."
                @click=${() => {
        this.newResource();
      }}
              >
                ${icon("add-icon")}
              </button>
            </td>
          </tr>
        </table>
        <div class="dialog-footer">
          <button @click=${() => this.close()}>Close</button>
        </div>
      </dialog>
    `;
    }
  };
  customElements.define("edit-resources-dialog", EditResourcesDialog);

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

  // src/units/weekdays.ts
  var Weekdays = class {
    start;
    /**
     * Maps from a number of weekdays (from this.start) to a number of days (which
     * ignores includes weekends.
     */
    cache;
    lastCacheEntry;
    constructor(start) {
      this.start = start;
      this.cache = /* @__PURE__ */ new Map();
      this.cache.set(0, 0);
      this.lastCacheEntry = 0;
    }
    dateToWeekday(s2) {
      if (!dateControlDateRe.test(s2)) {
        return error(new Error(`${s2} is not a valid date`));
      }
      const date = new Date(s2);
      if (date <= this.start) {
        return error(new Error(`${date} comes before ${this.start}`));
      }
      let start = new Date(this.start.getTime());
      let formattedDate = dateControlValue(start);
      let weekDay = 0;
      while (formattedDate < s2) {
        const oldDate = start.getDate();
        start.setDate(oldDate + 1);
        const dayOfWeek = start.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          continue;
        }
        weekDay += 1;
        formattedDate = dateControlValue(start);
      }
      return ok(weekDay);
    }
    weekdaysToDays(numWeekdays) {
      if (numWeekdays < 0) {
        return 0;
      }
      numWeekdays = Math.trunc(numWeekdays);
      const cacheValue = this.cache.get(numWeekdays);
      if (cacheValue !== void 0) {
        return cacheValue;
      }
      let start = new Date(this.start.getTime());
      let weekday = this.lastCacheEntry;
      let day = this.cache.get(weekday);
      start.setDate(start.getDate() + day);
      while (weekday !== numWeekdays) {
        const oldDate = start.getDate();
        start.setDate(oldDate + 1);
        day += 1;
        const dayOfWeek = start.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          continue;
        }
        weekday += 1;
        this.cache.set(weekday, day);
      }
      this.lastCacheEntry = weekday;
      return day;
    }
  };

  // src/units/unit.ts
  var UnitBase = class {
    start;
    metricDefn;
    unitType;
    constructor(start, metricDefn, unitType) {
      this.start = start;
      this.metricDefn = metricDefn;
      this.unitType = unitType;
    }
    displayTime(t4, locale) {
      throw new Error("Method implemented in subclasses.");
    }
    asDate(t4) {
      throw new Error("Method implemented in subclasses.");
    }
    parse(s2) {
      throw new Error("Method implemented in subclasses.");
    }
    kind() {
      return this.unitType;
    }
    toJSON() {
      return { unitType: this.unitType };
    }
    static fromJSON(s2, start, metricDefn) {
      return UnitBuilders[toUnit(s2.unitType)](start, metricDefn);
    }
  };
  var UNIT_TYPES = ["Unitless", "Days", "Weekdays"];
  var UnitBuilders = {
    Unitless: (start, metricDefn) => new Unitless(start, metricDefn),
    Days: (start, metricDefn) => new Days(start, metricDefn),
    Weekdays: (start, metricDefn) => new WeekDays(start, metricDefn)
  };
  var toUnit = (s2) => {
    if (UNIT_TYPES.some((t4) => t4 === s2)) {
      return s2;
    }
    return "Unitless";
  };
  var Unitless = class extends UnitBase {
    constructor(start, metricDefn) {
      super(start, metricDefn, "Unitless");
    }
    displayTime(t4, locale) {
      return this.metricDefn.clampAndRound(t4).toString();
    }
    asDate(t4) {
      return this.start;
    }
    parse(s2) {
      const parsed = +s2;
      if (Number.isNaN(parsed)) {
        return error(new Error(`Invalid number value: ${s2}`));
      }
      return ok(this.metricDefn.clampAndRound(parsed));
    }
  };
  var Days = class extends UnitBase {
    constructor(start, metricDefn) {
      super(start, metricDefn, "Days");
    }
    displayTime(t4, locale) {
      return this.asDate(t4).toLocaleDateString(locale);
    }
    asDate(t4) {
      const d2 = new Date(this.start.getTime());
      d2.setDate(d2.getDate() + t4);
      return d2;
    }
    parse(s2) {
      if (!dateControlDateRe.test(s2)) {
        return error(new Error(`${s2} is not a valid date`));
      }
      const d2 = new Date(s2);
      return ok(
        this.metricDefn.clampAndRound(
          (d2.getTime() - this.start.getTime()) / (1e3 * 60 * 60 * 24)
        )
      );
    }
  };
  var WeekDays = class extends UnitBase {
    weekdays;
    constructor(start, metricDefn) {
      super(start, metricDefn, "Weekdays");
      this.weekdays = new Weekdays(start);
    }
    // Locale only used for testing.
    displayTime(t4, locale) {
      return this.asDate(t4).toLocaleDateString(locale);
    }
    asDate(t4) {
      const d2 = new Date(this.start.getTime());
      d2.setDate(d2.getDate() + this.weekdays.weekdaysToDays(t4));
      return d2;
    }
    parse(s2) {
      return this.weekdays.dateToWeekday(s2);
    }
  };

  // src/plan/plan.ts
  var StaticMetricDefinitions = {
    // How long a task will take, in days.
    Duration: new MetricDefinition(0, new MetricRange(0), true),
    // The percent complete for a task.
    "Percent Complete": new MetricDefinition(0, new MetricRange(0, 100), true)
  };
  var StaticResourceDefinitions = {
    Uncertainty: new ResourceDefinition(Object.keys(UncertaintyToNum), true)
  };
  var Plan = class _Plan {
    chart;
    // Controls how time is displayed.
    durationUnits;
    _status = { stage: "unstarted", start: 0 };
    taskCompletion = {};
    resourceDefinitions;
    metricDefinitions;
    get status() {
      return this._status;
    }
    set status(value) {
      this._status = value;
      this.durationUnits = new Days(
        new Date(statusToDate(this.status)),
        this.getStaticMetricDefinition("Duration")
      );
    }
    setTaskCompletion(index, value) {
      const task = this.chart.Vertices[index];
      if (task === void 0) {
        return error(new Error(`${index} is not a valid Task index.`));
      }
      this.taskCompletion[task.id] = value;
      return ok(null);
    }
    getTaskCompletion(index) {
      const task = this.chart.Vertices[index];
      if (task === void 0) {
        return error(new Error(`${index} is not a valid Task index.`));
      }
      return ok(this.taskCompletion[task.id] || { stage: "unstarted" });
    }
    constructor() {
      this.chart = new Chart();
      this.resourceDefinitions = Object.assign({}, StaticResourceDefinitions);
      this.metricDefinitions = Object.assign({}, StaticMetricDefinitions);
      this.durationUnits = new Days(
        new Date(statusToDate(this.status)),
        this.getStaticMetricDefinition("Duration")
      );
      this.applyMetricsAndResourcesToVertices();
    }
    setDurationUnits(unitType) {
      this.durationUnits = UnitBuilders[unitType](
        new Date(statusToDate(this.status)),
        this.getStaticMetricDefinition("Duration")
      );
    }
    getStaticMetricDefinition(name) {
      return this.metricDefinitions[name];
    }
    getStaticResourceDefinition(name) {
      return this.resourceDefinitions[name];
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
    toJSON() {
      return {
        status: toJSON2(this.status),
        taskCompletion: taskCompletionsToJSON(this.taskCompletion),
        durationUnits: this.durationUnits.toJSON(),
        chart: this.chart.toJSON(),
        resourceDefinitions: Object.fromEntries(
          Object.entries(this.resourceDefinitions).filter(([_2, resourceDefinition]) => !resourceDefinition.isStatic).map(([key, resourceDefinition]) => [
            key,
            resourceDefinition.toJSON()
          ])
        ),
        metricDefinitions: Object.fromEntries(
          Object.entries(this.metricDefinitions).filter(([_2, metricDefinition]) => !metricDefinition.isStatic).map(([key, metricDefinition]) => [key, metricDefinition.toJSON()])
        )
      };
    }
    static fromJSON(planSerialized) {
      const ret = new _Plan();
      ret.chart = Chart.fromJSON(planSerialized.chart);
      ret.status = fromJSON2(planSerialized.status);
      ret.taskCompletion = taskCompletionsFromJSON(planSerialized.taskCompletion);
      const deserializedMetricDefinitions = Object.fromEntries(
        Object.entries(planSerialized.metricDefinitions).map(
          ([key, serializedMetricDefinition]) => [
            key,
            MetricDefinition.fromJSON(serializedMetricDefinition)
          ]
        )
      );
      ret.metricDefinitions = Object.assign(
        {},
        StaticMetricDefinitions,
        deserializedMetricDefinitions
      );
      const deserializedResourceDefinitions = Object.fromEntries(
        Object.entries(planSerialized.resourceDefinitions).map(
          ([key, serializedResourceDefinition]) => [
            key,
            ResourceDefinition.fromJSON(serializedResourceDefinition)
          ]
        )
      );
      ret.resourceDefinitions = Object.assign(
        {},
        StaticResourceDefinitions,
        deserializedResourceDefinitions
      );
      ret.durationUnits = UnitBase.fromJSON(
        planSerialized.durationUnits,
        new Date(statusToDate(ret.status)),
        ret.getStaticMetricDefinition("Duration")
      );
      return ret;
    }
    static FromJSONText = (text) => {
      const planSerialized = JSON.parse(text);
      const plan = _Plan.fromJSON(planSerialized);
      const ret = RationalizeEdgesOp().applyTo(plan);
      if (!ret.ok) {
        return ret;
      }
      const retVal = ChartValidate(plan.chart);
      if (!retVal.ok) {
        return retVal;
      }
      return ok(plan);
    };
  };

  // src/selected-task-panel/selected-task-panel.ts
  var SelectedTaskPanel = class extends HTMLElement {
    plan = new Plan();
    taskIndex = -1;
    planDefinitionChangedCallback;
    constructor() {
      super();
      this.planDefinitionChangedCallback = () => {
        this.render();
      };
    }
    connectedCallback() {
      this.render();
      document.addEventListener(
        "plan-definition-changed",
        this.planDefinitionChangedCallback
      );
    }
    disconnectedCallback() {
      document.removeEventListener(
        "plan-definition-changed",
        this.planDefinitionChangedCallback
      );
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
              .value="${l2(task.name)}"
              @change=${(e3) => this.dispatchEvent(
        new CustomEvent("task-name-change", {
          bubbles: true,
          detail: {
            taskIndex,
            name: e3.target.value
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
                  @change=${async (e3) => this.dispatchEvent(
          new CustomEvent("task-resource-value-change", {
            bubbles: true,
            detail: {
              taskIndex,
              value: e3.target.value,
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
                  .value=${l2(task.metrics[key])}
                  type="number"
                  @change=${async (e3) => this.dispatchEvent(
          new CustomEvent("task-metric-value-change", {
            bubbles: true,
            detail: {
              taskIndex,
              value: +e3.target.value,
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

  // src/simulation/simulation.ts
  var MAX_RANDOM = 1e3;
  var precision = new Precision(2);
  var rndInt = (n2) => {
    return Math.floor(Math.random() * n2);
  };
  var simulation = (chart, numSimulationLoops, originalCriticalPath) => {
    const allCriticalPaths = /* @__PURE__ */ new Map();
    allCriticalPaths.set(`${originalCriticalPath}`, {
      count: 0,
      criticalPath: originalCriticalPath.slice(),
      durations: chart.Vertices.map((task) => task.duration)
    });
    for (let i3 = 0; i3 < numSimulationLoops; i3++) {
      const durations = chart.Vertices.map((t4) => {
        const rawDuration = new Jacobian(
          t4.duration,
          // Acceptable direct access to duration.
          t4.getResource("Uncertainty")
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
      this.results = simulation(chart, numSimulationLoops, originalCriticalPath);
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
      if (removed.length === 0 && added.length === 0) {
        return x`Original Critical Path`;
      }
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
      this.addEventListener("task-change", (e3) => {
        this.explanMain.setSelection(e3.detail.taskIndex, e3.detail.focus, true);
      });
      this.addEventListener(
        "task-focus",
        (e3) => this.setKeyboardFocusToInput("full-info")
      );
    }
    setKeyboardFocusToInput(searchType) {
      this.taskSearchControl.tasks = this.explanMain.plan.chart.Vertices;
      this.taskSearchControl.includedIndexes = this.explanMain.plan.chart.Vertices.map(
        (_2, index) => index
      ).slice(1, -1);
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
    for (let i3 = 0; i3 < ranges.length - 1; i3++) {
      const sub = target.slice(ranges[i3], ranges[i3 + 1]);
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
  var searchResults = (searchTaskPanel) => searchTaskPanel.searchResults.map(
    (task, index) => x` <li
        tabindex="0"
        @click="${(e3) => searchTaskPanel.selectSearchResult(index, false)}"
        ?data-focus=${index === searchTaskPanel.focusIndex}
        data-index=${index}
      >
        ${highlightedTarget(task.indexes, task.target)}
      </li>`
  );
  var template2 = (searchTaskPanel) => x`
  <input
    autocomplete="off"
    name="task_search"
    id="search_input"
    placeholder="Search"
    type="text"
    @input="${(e3) => searchTaskPanel.onInput(e3.target.value)}"
    @keydown="${(e3) => searchTaskPanel.onKeyDown(e3)}"
    @focus="${() => searchTaskPanel.searchInputReceivedFocus()}"
  />
  <ul>
    ${searchResults(searchTaskPanel)}
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
  var taskListToSearchResults = (tasks, taskToSearchString, includedIndexes) => {
    return tasks.filter((_task, index) => includedIndexes.has(index)).map((t4) => {
      return {
        obj: t4,
        indexes: [],
        target: taskToSearchString(t4)
      };
    });
  };
  var TaskSearchControl = class extends HTMLElement {
    _tasks = [];
    _includedIndexes = /* @__PURE__ */ new Set();
    focusIndex = 0;
    searchResults = [];
    searchType = "name-only";
    taskToSearchString = (task) => "";
    connectedCallback() {
      B(template2(this), this);
    }
    onInput(inputString) {
      if (inputString === "") {
        this.searchResults = taskListToSearchResults(
          this._tasks,
          this.taskToSearchString,
          this._includedIndexes
        );
      } else {
        this.searchResults = import_fuzzysort.default.go(
          inputString,
          this._tasks.slice(1, -1),
          // Remove Start and Finish from search range.
          {
            key: this.taskToSearchString,
            limit: this._tasks.length,
            threshold: 0.2
          }
        );
      }
      this.focusIndex = 0;
      B(template2(this), this);
    }
    onKeyDown(e3) {
      if (this.searchResults.length === 0) {
        return;
      }
      const keyname = `${e3.shiftKey ? "shift-" : ""}${e3.ctrlKey ? "ctrl-" : ""}${e3.metaKey ? "meta-" : ""}${e3.altKey ? "alt-" : ""}${e3.key}`;
      switch (keyname) {
        case "ArrowDown":
          this.focusIndex = (this.focusIndex + 1) % this.searchResults.length;
          e3.stopPropagation();
          e3.preventDefault();
          break;
        case "ArrowUp":
          this.focusIndex = (this.focusIndex - 1 + this.searchResults.length) % this.searchResults.length;
          e3.stopPropagation();
          e3.preventDefault();
          break;
        case "Enter":
          if (this.searchResults.length === 0) {
            return;
          }
          this.selectSearchResult(this.focusIndex, false);
          e3.stopPropagation();
          e3.preventDefault();
          break;
        case "ctrl-Enter":
          if (this.searchResults.length === 0) {
            return;
          }
          this.selectSearchResult(this.focusIndex, true);
          e3.stopPropagation();
          e3.preventDefault();
          break;
        default:
          break;
      }
      console.log(this.focusIndex);
      B(template2(this), this);
    }
    selectSearchResult(index, focus) {
      const taskIndex = this._tasks.indexOf(this.searchResults[index].obj);
      this.dispatchEvent(
        new CustomEvent("task-change", {
          bubbles: true,
          detail: {
            taskIndex,
            focus
          }
        })
      );
      this.searchResults = [];
      B(template2(this), this);
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
      this.onInput(inputControl.value);
      B(template2(this), this);
    }
    set tasks(tasks) {
      this._tasks = tasks;
      this.buildTaskToSearchString();
    }
    set includedIndexes(v2) {
      this._includedIndexes = new Set(v2);
      this.buildTaskToSearchString();
    }
    buildTaskToSearchString() {
      const maxNameLength = this._tasks.reduce(
        (prev, task) => task.name.length > prev ? task.name.length : prev,
        0
      );
      this.taskToSearchString = searchStringFromTaskBuilder(
        this._tasks,
        this.searchType,
        this._includedIndexes,
        maxNameLength
      );
      this.onInput("");
    }
  };
  customElements.define("task-search-control", TaskSearchControl);

  // src/point/point.ts
  var pt = (x2, y2) => {
    return { x: x2, y: y2 };
  };
  var add = (p1, p2) => {
    const [x2, y2] = p2;
    return {
      x: p1.x + x2,
      y: p1.y + y2
    };
  };
  var equal = (p1, p2) => p1.x === p2.x && p1.y === p2.y;
  var dup = (p2) => {
    return { x: p2.x, y: p2.y };
  };
  var difference2 = (p1, p2) => {
    return [p2.x - p1.x, p2.y - p1.y];
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
    currentMoveLocation = pt(0, 0);
    /** The last mouse position in Page coordinates reported via CustomEvent. */
    lastMoveSent = pt(0, 0);
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
      if (!equal(this.currentMoveLocation, this.lastMoveSent)) {
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
        this.lastMoveSent = dup(this.currentMoveLocation);
      }
    }
    mousemove(e3) {
      if (this.begin === null) {
        return;
      }
      this.currentMoveLocation.x = e3.pageX;
      this.currentMoveLocation.y = e3.pageY;
    }
    mousedown(e3) {
      this.internvalHandle = window.setInterval(this.onTimeout.bind(this), 16);
      this.parentRect = getPageRect(this.parent);
      this.parent.classList.add(RESIZING_CLASS);
      this.parent.addEventListener("mousemove", this.mousemove.bind(this));
      this.parent.addEventListener("mouseup", this.mouseup.bind(this));
      this.parent.addEventListener("mouseleave", this.mouseleave.bind(this));
      this.begin = pt(e3.pageX, e3.pageY);
    }
    mouseup(e3) {
      if (this.begin === null) {
        return;
      }
      this.finished(pt(e3.pageX, e3.pageY));
    }
    mouseleave(e3) {
      if (this.begin === null) {
        return;
      }
      this.finished(pt(e3.pageX, e3.pageY));
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
      this.currentMoveLocation = pt(0, 0);
      this.lastMoveSent = pt(0, 0);
    }
  };

  // src/renderer/mousedrag/mousedrag.ts
  var DRAG_RANGE_EVENT = "dragrange";
  var MouseDrag = class {
    begin = null;
    currentMoveLocation = pt(0, 0);
    lastMoveSent = pt(0, 0);
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
      if (!equal(this.currentMoveLocation, this.lastMoveSent)) {
        this.ele.dispatchEvent(
          new CustomEvent(DRAG_RANGE_EVENT, {
            detail: {
              begin: dup(this.begin),
              end: dup(this.currentMoveLocation)
            }
          })
        );
        this.lastMoveSent = dup(this.currentMoveLocation);
      }
    }
    mousemove(e3) {
      if (this.begin === null) {
        return;
      }
      this.currentMoveLocation.x = e3.offsetX;
      this.currentMoveLocation.y = e3.offsetY;
    }
    mousedown(e3) {
      this.internvalHandle = window.setInterval(this.onTimeout.bind(this), 16);
      this.begin = pt(e3.offsetX, e3.offsetY);
    }
    mouseup(e3) {
      this.finished(pt(e3.offsetX, e3.offsetY));
    }
    mouseleave(e3) {
      if (this.begin === null) {
        return;
      }
      this.finished(pt(e3.offsetX, e3.offsetY));
    }
    finished(end) {
      window.clearInterval(this.internvalHandle);
      this.currentMoveLocation = end;
      this.onTimeout();
      this.begin = null;
      this.currentMoveLocation = pt(0, 0);
      this.lastMoveSent = pt(0, 0);
    }
  };

  // src/renderer/mousemove/mousemove.ts
  var MouseMove = class {
    currentMoveLocation = pt(0, 0);
    lastReadLocation = pt(0, 0);
    ele;
    constructor(ele) {
      this.ele = ele;
      ele.addEventListener("mousemove", this.mousemove.bind(this));
    }
    detach() {
      this.ele.removeEventListener("mousemove", this.mousemove.bind(this));
    }
    mousemove(e3) {
      this.currentMoveLocation.x = e3.offsetX;
      this.currentMoveLocation.y = e3.offsetY;
    }
    /** Returns a Point if the mouse had moved since the last read, otherwise
     * returns null.
     */
    readLocation() {
      if (equal(this.currentMoveLocation, this.lastReadLocation)) {
        return null;
      }
      this.lastReadLocation = dup(this.currentMoveLocation);
      return dup(this.lastReadLocation);
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
    const vret = ChartValidate(chart);
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
      this.timelineOrigin = pt(milestoneRadius, 0);
      this.groupByOrigin = pt(0, milestoneRadius + this.timelineHeightPx);
      let beginOffset = 0;
      if (opts.displayRange === null || opts.displayRangeUsage === "highlight") {
        this.dayWidthPx = (canvasWidthPx - this.groupByColumnWidthPx - 2 * this.marginSizePx) / totalNumberOfDays;
        this.origin = pt(0, 0);
      } else {
        this.dayWidthPx = (canvasWidthPx - this.groupByColumnWidthPx - 2 * this.marginSizePx) / opts.displayRange.rangeInDays;
        beginOffset = Math.floor(
          this.dayWidthPx * opts.displayRange.begin + this.marginSizePx
        );
        this.origin = pt(-beginOffset + this.marginSizePx, 0);
      }
      this.tasksOrigin = pt(
        this.groupByColumnWidthPx - beginOffset + milestoneRadius,
        this.timelineHeightPx + milestoneRadius
      );
      this.tasksClipRectOrigin = pt(
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
      return add(this.origin, [
        Math.floor(
          day * this.dayWidthPx + this.marginSizePx + this.groupByColumnWidthPx
        ),
        Math.floor(
          row * this.rowHeightPx + this.marginSizePx + this.timelineHeightPx
        )
      ]);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    groupRowEnvelopeStart(row, day) {
      return add(this.groupByOrigin, [
        0,
        row * this.rowHeightPx + this.marginSizePx + this.timelineHeightPx
      ]);
    }
    groupHeaderStart() {
      return add(this.origin, [this.marginSizePx, this.marginSizePx]);
    }
    timeEnvelopeStart(day) {
      return add(this.origin, [
        day * this.dayWidthPx + this.marginSizePx + this.groupByColumnWidthPx,
        0
      ]);
    }
    /** Returns the coordinate of the item */
    feature(row, day, coord) {
      switch (coord) {
        case 0 /* taskLineStart */:
        case 4 /* verticalArrowDestTop */:
        case 7 /* verticalArrowStart */:
          return add(this.taskRowEnvelopeStart(row, day), [
            0,
            this.rowHeightPx - this.blockSizePx
          ]);
        case 5 /* verticalArrowDestBottom */:
          return add(this.taskRowEnvelopeStart(row, day), [0, this.rowHeightPx]);
        case 1 /* textStart */:
          return add(this.taskRowEnvelopeStart(row, day), [
            this.blockSizePx,
            this.blockSizePx
          ]);
        case 2 /* groupTextStart */:
          return add(this.groupRowEnvelopeStart(row, day), [
            this.blockSizePx,
            this.blockSizePx
          ]);
        case 3 /* percentStart */:
          return add(this.taskRowEnvelopeStart(row, day), [
            0,
            this.rowHeightPx - this.lineWidthPx
          ]);
        case 6 /* horizontalArrowDest */:
        case 8 /* horizontalArrowStart */:
          return add(this.taskRowEnvelopeStart(row, day), [
            0,
            Math.floor(this.rowHeightPx - 0.5 * this.blockSizePx) - 1
          ]);
        case 9 /* verticalArrowDestToMilestoneTop */:
          return add(this.feature(row, day, 4 /* verticalArrowDestTop */), [
            0,
            -1 * this.metric(4 /* milestoneDiameter */)
          ]);
        case 10 /* verticalArrowDestToMilestoneBottom */:
          return add(this.feature(row, day, 4 /* verticalArrowDestTop */), [
            0,
            this.metric(4 /* milestoneDiameter */)
          ]);
        case 11 /* horizontalArrowDestToMilestone */:
          return add(this.feature(row, day, 6 /* horizontalArrowDest */), [
            -1 * this.metric(4 /* milestoneDiameter */),
            -1 * this.metric(4 /* milestoneDiameter */)
          ]);
        case 12 /* verticalArrowStartFromMilestoneTop */:
          return add(this.feature(row, day, 7 /* verticalArrowStart */), [
            0,
            -1 * this.metric(4 /* milestoneDiameter */)
          ]);
        case 13 /* verticalArrowStartFromMilestoneBottom */:
          return add(this.feature(row, day, 7 /* verticalArrowStart */), [
            0,
            this.metric(4 /* milestoneDiameter */)
          ]);
        case 14 /* horizontalArrowStartFromMilestone */:
          return add(this.feature(row, day, 8 /* horizontalArrowStart */), [
            this.metric(4 /* milestoneDiameter */),
            0
          ]);
        case 16 /* taskEnvelopeTop */:
          return this.taskRowEnvelopeStart(row, day);
        case 15 /* groupEnvelopeStart */:
          return this.groupRowEnvelopeStart(row, day);
        case 19 /* timeMarkStart */:
          return this.timeEnvelopeStart(day);
        case 20 /* timeMarkEnd */:
          return add(this.timeEnvelopeStart(day), [
            0,
            this.rowHeightPx * (row + 1)
          ]);
        case 21 /* timeTextStart */:
          return add(this.timeEnvelopeStart(day), [this.blockSizePx, 0]);
        case 22 /* groupTitleTextStart */:
          return add(this.groupHeaderStart(), [this.blockSizePx, 0]);
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
          return pt(0, 0);
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
        case 8 /* minTaskWidthPx */:
          return this.blockSizePx * 10;
        case 9 /* rowHeight */:
          return this.rowHeightPx;
        default:
          feature;
          return 0;
      }
    }
  };

  // src/hitrect/hitrect.ts
  var withinY = (y2, rect) => {
    return rect.topLeft.y <= y2 && rect.bottomRight.y >= y2;
  };
  var withinX = (x2, rect) => {
    return rect.topLeft.x <= x2 && rect.bottomRight.x >= x2;
  };
  var HitRect = class {
    rects;
    constructor(rects) {
      this.rects = rects.sort((a2, b2) => a2.topLeft.y - b2.topLeft.y);
    }
    /** Returns the index of the Rect that p is in, otherwise returns -1. */
    hit(p2) {
      let start = 0;
      let end = this.rects.length - 1;
      while (start <= end) {
        let mid = Math.floor((start + end) / 2);
        if (withinY(p2.y, this.rects[mid])) {
          if (withinX(p2.x, this.rects[mid])) {
            return this.rects[mid];
          }
          return null;
        } else if (this.rects[mid].topLeft.y < p2.y) {
          start = mid + 1;
        } else {
          end = mid - 1;
        }
      }
      return null;
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
    const vret = ChartValidate(plan.chart);
    if (!vret.ok) {
      return vret;
    }
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
    const minTaskWidthPx = scale.metric(8 /* minTaskWidthPx */);
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
    const timeMarkerRanges = [];
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
          daysWithTimeMarkers,
          timeMarkerRanges
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
      let highlightBottomRight = scale.feature(
        row + 1,
        span.finish,
        16 /* taskEnvelopeTop */
      );
      const [width, _2] = difference2(highlightTopLeft, highlightBottomRight);
      if (width < minTaskWidthPx) {
        highlightBottomRight.x = highlightTopLeft.x + minTaskWidthPx;
      }
      taskIndexToTaskHighlightCorners.set(taskIndex, {
        topLeft: highlightTopLeft,
        bottomRight: highlightBottomRight,
        filteredTaskIndex: taskIndex
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
            labels
          );
        }
      }
    });
    ctx.lineWidth = 1;
    ctx.strokeStyle = opts.colors.onSurfaceMuted;
    if (opts.hasEdges && opts.hasTasks) {
      const highlightedEdges = [];
      const normalEdges = [];
      chartLike.Edges.forEach((e3) => {
        if (emphasizedTasks.has(e3.i) && emphasizedTasks.has(e3.j)) {
          highlightedEdges.push(e3);
        } else {
          normalEdges.push(e3);
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
      const taskLocationKDTree = new HitRect([
        ...taskIndexToTaskHighlightCorners.values()
      ]);
      let lastHighlightedTaskIndex = -1;
      updateHighlightFromMousePos = (point, updateType) => {
        point.x = point.x * window.devicePixelRatio;
        point.y = point.y * window.devicePixelRatio;
        const taskLocation = taskLocationKDTree.hit(point);
        const originalTaskIndex = taskLocation === null ? -1 : fromFilteredIndexToOriginalIndex.get(
          taskLocation.filteredTaskIndex
        );
        if (originalTaskIndex === 0 || originalTaskIndex === plan.chart.Vertices.length - 1) {
          return null;
        }
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
    if (opts.selectedTaskIndex !== -1 && fromOriginalIndexToFilteredIndex.has(opts.selectedTaskIndex)) {
      selectedTaskLocation = taskIndexToTaskHighlightCorners.get(
        fromOriginalIndexToFilteredIndex.get(opts.selectedTaskIndex)
        // Convert
      ).topLeft;
    }
    let returnedLocation = null;
    if (selectedTaskLocation !== null) {
      returnedLocation = pt(
        selectedTaskLocation.x / window.devicePixelRatio,
        selectedTaskLocation.y / window.devicePixelRatio
      );
    }
    return ok({
      scale,
      updateHighlightFromMousePos,
      selectedTaskLocation: returnedLocation
    });
  }
  function drawEdges(ctx, opts, edges, spans, tasks, scale, taskIndexToRow, arrowHeadWidth, arrowHeadHeight, taskHighlights) {
    edges.forEach((e3) => {
      const srcSlack = spans[e3.i];
      const dstSlack = spans[e3.j];
      const srcTask = tasks[e3.i];
      const dstTask = tasks[e3.j];
      const srcRow = taskIndexToRow.get(e3.i);
      const dstRow = taskIndexToRow.get(e3.j);
      const srcDay = srcSlack.finish;
      const dstDay = dstSlack.start;
      if (taskHighlights.has(e3.i) && taskHighlights.has(e3.j)) {
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
  function drawTaskText(ctx, opts, scale, row, span, task, taskIndex, originalTaskIndex, clipWidth, labels) {
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
  var drawTimeMarkerAtDayToTask = (ctx, row, day, task, opts, scale, daysWithTimeMarkers, timeMarkerRanges) => {
    if (daysWithTimeMarkers.has(day)) {
      return;
    }
    daysWithTimeMarkers.add(day);
    const timeMarkStart = scale.feature(row, day, 19 /* timeMarkStart */);
    if (timeMarkerRanges.findIndex(
      ([begin, end]) => timeMarkStart.x >= begin && timeMarkStart.x <= end
    ) !== -1) {
      return;
    }
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
    const label = opts.durationDisplay(day);
    const meas = ctx.measureText(label);
    const textBegin = timeMarkStart.x;
    const textEnd = textStart.x + meas.width;
    if (opts.hasText && opts.hasTimeline && // Don't draw the label if it overlaps any existing labelss.
    timeMarkerRanges.findIndex(([begin, end]) => {
      return textBegin <= begin && textEnd >= begin || textBegin <= end && textEnd >= end;
    }) === -1) {
      ctx.fillText(`${label}`, textStart.x, textStart.y);
      timeMarkerRanges.push([textBegin, textEnd]);
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
  var DURATION = 10;
  var rndInt2 = (n2) => {
    return Math.floor(Math.random() * n2);
  };
  var rndDuration = () => {
    return rndInt2(DURATION);
  };
  var generateStarterPlan = () => {
    const plan = new Plan();
    const res = applyAllOpsToPlan(
      [
        InsertNewEmptyMilestoneAfterOp(0),
        SetMetricValueOp("Duration", 10, 1),
        SetResourceValueOp("Uncertainty", "low", 1)
      ],
      plan
    );
    if (!res.ok) {
      console.log(res.error);
    }
    return plan;
  };
  var generateRandomPlan = () => {
    const plan = new Plan();
    const ops = [AddResourceOp("Person")];
    people.forEach((person) => {
      ops.push(AddResourceOptionOp("Person", person));
    });
    ops.push(DeleteResourceOptionOp("Person", ""));
    ops.push(
      AddMetricOp("Cost ($/hr)", new MetricDefinition(15, new MetricRange(0))),
      InsertNewEmptyMilestoneAfterOp(0),
      SetMetricValueOp("Duration", rndDuration(), 1),
      SetTaskNameOp(1, randomTaskName()),
      SetResourceValueOp("Person", people[rndInt2(people.length)], 1),
      SetResourceValueOp("Uncertainty", "moderate", 1)
    );
    let numTasks = 1;
    for (let i3 = 0; i3 < 50; i3++) {
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

  // src/explanMain/explanMain.ts
  var FONT_SIZE_PX = 32;
  var NUM_SIMULATION_LOOPS = 100;
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
    taskCompletionPanel = null;
    alternateTaskDurations = null;
    simulationPanel = null;
    /** Callback to call when a mouse moves over the chart. */
    updateHighlightFromMousePos = null;
    connectedCallback() {
      this.simulationPanel = this.querySelector("simulation-panel");
      this.simulationPanel.addEventListener("simulation-select", (e3) => {
        this.alternateTaskDurations = e3.detail.durations;
        this.criticalPath = e3.detail.criticalPath;
        this.recalculateSpansAndCriticalPath();
        this.paintChart();
      });
      this.downloadLink = this.querySelector("#download");
      this.downloadLink.addEventListener("click", () => {
        this.prepareDownload();
      });
      this.dependenciesPanel = this.querySelector("dependencies-panel");
      this.dependenciesPanel.addEventListener("add-dependency", async (e3) => {
        let actionName = "AddPredecessorAction";
        if (e3.detail.depType === "succ") {
          actionName = "AddSuccessorAction";
        }
        const ret = await execute(actionName, this);
        if (!ret.ok) {
          console.log(ret.error);
        }
      });
      this.dependenciesPanel.addEventListener("delete-dependency", async (e3) => {
        let [i3, j2] = [e3.detail.taskIndex, this.selectedTask];
        if (e3.detail.depType === "succ") {
          [i3, j2] = [j2, i3];
        }
        const op = RemoveEdgeOp(i3, j2);
        const ret = await executeOp(op, "planDefinitionChanged", true, this);
        if (!ret.ok) {
          console.log(ret.error);
        }
      });
      this.selectedTaskPanel = this.querySelector("selected-task-panel");
      this.selectedTaskPanel.addEventListener(
        "task-name-change",
        async (e3) => {
          const op = SetTaskNameOp(e3.detail.taskIndex, e3.detail.name);
          reportOnError(await executeOp(op, "planDefinitionChanged", true, this));
        }
      );
      this.selectedTaskPanel.addEventListener(
        "task-resource-value-change",
        async (e3) => {
          const { name, value, taskIndex } = e3.detail;
          const op = SetResourceValueOp(name, value, taskIndex);
          reportOnError(await executeOp(op, "planDefinitionChanged", true, this));
        }
      );
      this.selectedTaskPanel.addEventListener(
        "task-metric-value-change",
        async (e3) => {
          const { name, value, taskIndex } = e3.detail;
          const op = SetMetricValueOp(name, value, taskIndex);
          reportOnError(await executeOp(op, "planDefinitionChanged", true, this));
        }
      );
      this.taskCompletionPanel = this.querySelector("task-completion-panel");
      const radar = this.querySelector("#radar");
      new MouseDrag(radar);
      radar.addEventListener(
        DRAG_RANGE_EVENT,
        this.dragRangeHandler.bind(this)
      );
      const divider = this.querySelector("vertical-divider");
      new DividerMove(document.body, divider, "column");
      document.body.addEventListener(DIVIDER_MOVE_EVENT, (e3) => {
        this.style.setProperty(
          "grid-template-columns",
          `calc(${e3.detail.before}% - 15px) 10px auto`
        );
        this.paintChart();
      });
      this.querySelector("#reset-zoom").addEventListener("click", () => {
        execute("ResetZoomAction", this);
      });
      this.querySelector("#dark-mode-toggle").addEventListener("click", () => {
        execute("ToggleDarkModeAction", this);
      });
      applyStoredTheme();
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
      overlayCanvas.addEventListener("mousedown", (e3) => {
        const p2 = pt(e3.offsetX, e3.offsetY);
        if (this.updateHighlightFromMousePos !== null) {
          this.setSelection(
            this.updateHighlightFromMousePos(p2, "mousedown") || -1,
            false
          );
        }
      });
      overlayCanvas.addEventListener("dblclick", (e3) => {
        const p2 = pt(e3.offsetX, e3.offsetY);
        if (this.updateHighlightFromMousePos !== null) {
          const taskIndex = this.updateHighlightFromMousePos(p2, "mousedown") || -1;
          if (taskIndex === -1) {
            execute("ResetZoomAction", this);
          }
          this.setSelection(taskIndex, true, true);
        }
      });
      const fileUpload = document.querySelector("#file-upload");
      fileUpload.addEventListener("change", async () => {
        const json = await fileUpload.files[0].text();
        const ret = Plan.FromJSONText(json);
        if (!ret.ok) {
          throw ret.error;
        }
        this.plan = ret.value;
        this.planDefinitionHasBeenChanged();
      });
      this.querySelector("#simulate").addEventListener("click", () => {
        this.recalculateSpansAndCriticalPath();
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
      this.querySelector("#edit-resources").addEventListener("click", () => {
        this.querySelector(
          "edit-resources-dialog"
        ).showModal(this);
      });
      this.querySelector("#edit-metrics").addEventListener("click", () => {
        this.querySelector("edit-metrics-dialog").showModal(
          this
        );
      });
      this.querySelector("#edit-plan-start").addEventListener(
        "click",
        async () => {
          const ret = await this.querySelector(
            "edit-plan-start"
          ).start(this.plan.status);
          if (ret === void 0) {
            return;
          }
          this.plan.status = ret;
          this.planDefinitionHasBeenChanged();
        }
      );
      this.plan = generateStarterPlan();
      this.updateTaskPanels(this.selectedTask);
      this.planDefinitionHasBeenChanged();
      window.addEventListener("resize", () => this.paintChart());
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
      this.taskCompletionPanel.update(
        this,
        this.selectedTask,
        this.spans[this.selectedTask]
      );
      const edges = edgesBySrcAndDstToMap(this.plan.chart.Edges);
      this.dependenciesPanel.setTasksAndIndices(
        this.plan.chart.Vertices,
        (edges.byDst.get(taskIndex) || []).map((e3) => e3.i),
        (edges.bySrc.get(taskIndex) || []).map((e3) => e3.j)
      );
      this.dependenciesPanel.classList.toggle(
        "hidden",
        this.selectedTask === -1
      );
    }
    setSelection(index, focus, scrollToSelected = false) {
      this.selectedTask = index;
      if (focus) {
        this.forceFocusOnTask();
      }
      if (this.selectedTask === -1) {
        this.focusOnTask = false;
      }
      this.paintChart(scrollToSelected);
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
      if (this.groupByOptionsIndex >= this.groupByOptions.length) {
        this.groupByOptionsIndex = 0;
      }
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
      const rounder = this.plan.getStaticMetricDefinition("Duration").precision.rounder();
      const slackResult = ComputeSlack(
        this.plan.chart,
        this.getTaskDurationFunc(),
        rounder
      );
      if (!slackResult.ok) {
        console.error(slackResult);
      } else {
        slacks = slackResult.value;
      }
      this.spans = slacks.map((value) => {
        return value.early;
      });
      this.criticalPath = CriticalPath(slacks, rounder);
      this.updateTaskPanels(this.selectedTask);
    }
    getTaskLabeller() {
      return (taskIndex) => `${this.plan.chart.Vertices[taskIndex].name}`;
    }
    dragRangeHandler(e3) {
      if (this.radarScale === null) {
        return;
      }
      const begin = this.radarScale.dayRowFromPoint(e3.detail.begin);
      const end = this.radarScale.dayRowFromPoint(e3.detail.end);
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
    paintChart(scrollToSelected = false) {
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
      const durationDisplay = (t4) => this.plan.durationUnits.displayTime(t4);
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
        selectedTaskIndex: this.selectedTask,
        durationDisplay
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
        selectedTaskIndex: this.selectedTask,
        durationDisplay
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
        selectedTaskIndex: this.selectedTask,
        durationDisplay
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
        if (zoomRet.value.selectedTaskLocation !== null && scrollToSelected) {
          let top = 0;
          if (!this.focusOnTask) {
            top = zoomRet.value.selectedTaskLocation.y;
          }
          document.querySelector("chart-parent").scrollTo({
            top,
            left: 0,
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
/*! Bundled license information:

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/live.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2Z1enp5c29ydC9mdXp6eXNvcnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL3NyYy9saXQtaHRtbC50cyIsICIuLi9zcmMvcmVzdWx0LnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9uLnRzIiwgIi4uL3NyYy9kYWcvZGFnLnRzIiwgIi4uL3NyYy9vcHMvb3BzLnRzIiwgIi4uL3NyYy9vcHMvbWV0cmljcy50cyIsICIuLi9zcmMvb3BzL2NoYXJ0LnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9hZGRQcmVkZWNlc3Nvci50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvYWRkU3VjY2Vzc29yLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9nb3RvU2VhcmNoLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9oZWxwLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9yZXNldFpvb20udHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3Rhc2tzLnRzIiwgIi4uL3NyYy9zdHlsZS90b2dnbGVyL3RvZ2dsZXIudHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3RvZ2dsZURhcmtNb2RlLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy90b2dnbGVGb2N1cy50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvdG9nZ2xlUmFkYXIudHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3VuZG8udHMiLCAiLi4vc3JjL2FjdGlvbi9yZWdpc3RyeS50cyIsICIuLi9zcmMvYWN0aW9uL2V4ZWN1dGUudHMiLCAiLi4vc3JjL2tleW1hcC9rZXltYXAudHMiLCAiLi4vc3JjL2hlbHAvaGVscC50cyIsICIuLi9zcmMvZGF0ZS1jb250cm9sLXV0aWxzL2RhdGUtY29udHJvbC11dGlscy50cyIsICIuLi9zcmMvZGF0ZS1waWNrZXIvZGF0ZS1waWNrZXIudHMiLCAiLi4vc3JjL2RhZy9hbGdvcml0aG1zL3RvcG9zb3J0LnRzIiwgIi4uL3NyYy9jaGFydC9jaGFydC50cyIsICIuLi9zcmMvc2xhY2svc2xhY2sudHMiLCAiLi4vc3JjL3Rhc2tfY29tcGxldGlvbi90YXNrX2NvbXBsZXRpb24udHMiLCAiLi4vc3JjL3BsYW5fc3RhdHVzL3BsYW5fc3RhdHVzLnRzIiwgIi4uL3NyYy9vcHMvcGxhbi50cyIsICIuLi9zcmMvdGFzay1jb21wbGV0aW9uLXBhbmVsL3Rhc2stY29tcGxldGlvbi1wYW5lbC50cyIsICIuLi9zcmMvZWRpdC1wbGFuLXN0YXJ0L2VkaXQtcGxhbi1zdGFydC50cyIsICIuLi9zcmMvcmVzb3VyY2VzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvaWNvbnMvaWNvbnMudHMiLCAiLi4vc3JjL29wcy9yZXNvdXJjZXMudHMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL3NyYy9kaXJlY3RpdmUudHMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL3NyYy9kaXJlY3RpdmUtaGVscGVycy50cyIsICIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvc3JjL2RpcmVjdGl2ZXMvbGl2ZS50cyIsICIuLi9zcmMvZWRpdC1yZXNvdXJjZS1kZWZpbml0aW9uL2VkaXQtcmVzb3VyY2UtZGVmaW5pdGlvbi50cyIsICIuLi9zcmMvbWV0cmljcy9yYW5nZS50cyIsICIuLi9zcmMvcHJlY2lzaW9uL3ByZWNpc2lvbi50cyIsICIuLi9zcmMvbWV0cmljcy9tZXRyaWNzLnRzIiwgIi4uL3NyYy9lZGl0LW1ldHJpY3MtZGlhbG9nL2VkaXQtbWV0cmljcy1kaWFsb2cudHMiLCAiLi4vc3JjL3JlcG9ydC1lcnJvci9yZXBvcnQtZXJyb3IudHMiLCAiLi4vc3JjL2VkaXQtbWV0cmljLWRlZmluaXRpb24vZWRpdC1tZXRyaWMtZGVmaW5pdGlvbi50cyIsICIuLi9zcmMvZGVwZW5kZW5jaWVzL2RlcGVuZGVuY2llcy1wYW5lbC50cyIsICIuLi9zcmMvZGFnL2FsZ29yaXRobXMvZGZzLnRzIiwgIi4uL3NyYy9kYWcvYWxnb3JpdGhtcy9jaXJjdWxhci50cyIsICIuLi9zcmMvYWRkLWRlcGVuZGVuY3ktZGlhbG9nL2FkZC1kZXBlbmRlbmN5LWRpYWxvZy50cyIsICIuLi9zcmMvZWRpdC1yZXNvdXJjZXMtZGlhbG9nL2VkaXQtcmVzb3VyY2VzLWRpYWxvZy50cyIsICIuLi9zcmMvc3RhdHMvY2RmL3RyaWFuZ3VsYXIvdHJpYW5ndWxhci50cyIsICIuLi9zcmMvc3RhdHMvY2RmL3RyaWFuZ3VsYXIvamFjb2JpYW4udHMiLCAiLi4vc3JjL3VuaXRzL3dlZWtkYXlzLnRzIiwgIi4uL3NyYy91bml0cy91bml0LnRzIiwgIi4uL3NyYy9wbGFuL3BsYW4udHMiLCAiLi4vc3JjL3NlbGVjdGVkLXRhc2stcGFuZWwvc2VsZWN0ZWQtdGFzay1wYW5lbC50cyIsICIuLi9zcmMvc2ltdWxhdGlvbi9zaW11bGF0aW9uLnRzIiwgIi4uL3NyYy9zaW11bGF0aW9uLXBhbmVsL3NpbXVsYXRpb24tcGFuZWwudHMiLCAiLi4vc3JjL3NlYXJjaC9zZWFyY2gtdGFzay1wYW5lbC50cyIsICIuLi9zcmMvc2VhcmNoL3Rhc2stc2VhcmNoLWNvbnRyb2xzLnRzIiwgIi4uL3NyYy9wb2ludC9wb2ludC50cyIsICIuLi9zcmMvcmVuZGVyZXIvZGl2aWRlcm1vdmUvZGl2aWRlcm1vdmUudHMiLCAiLi4vc3JjL3JlbmRlcmVyL21vdXNlZHJhZy9tb3VzZWRyYWcudHMiLCAiLi4vc3JjL3JlbmRlcmVyL21vdXNlbW92ZS9tb3VzZW1vdmUudHMiLCAiLi4vc3JjL3JlbmRlcmVyL3JhbmdlL3JhbmdlLnRzIiwgIi4uL3NyYy9jaGFydC9maWx0ZXIvZmlsdGVyLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9zY2FsZS9zY2FsZS50cyIsICIuLi9zcmMvaGl0cmVjdC9oaXRyZWN0LnRzIiwgIi4uL3NyYy9yZW5kZXJlci9yZW5kZXJlci50cyIsICIuLi9zcmMvc3R5bGUvdGhlbWUvdGhlbWUudHMiLCAiLi4vc3JjL2dlbmVyYXRlL2dlbmVyYXRlLnRzIiwgIi4uL3NyYy9leHBsYW5NYWluL2V4cGxhbk1haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYXJ6aGVyL2Z1enp5c29ydCB2My4wLjJcclxuXHJcbi8vIFVNRCAoVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uKSBmb3IgZnV6enlzb3J0XHJcbjsoKHJvb3QsIFVNRCkgPT4ge1xyXG4gIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKFtdLCBVTUQpXHJcbiAgZWxzZSBpZih0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBVTUQoKVxyXG4gIGVsc2Ugcm9vdFsnZnV6enlzb3J0J10gPSBVTUQoKVxyXG59KSh0aGlzLCBfID0+IHtcclxuICAndXNlIHN0cmljdCdcclxuXHJcbiAgdmFyIHNpbmdsZSA9IChzZWFyY2gsIHRhcmdldCkgPT4ge1xyXG4gICAgaWYoIXNlYXJjaCB8fCAhdGFyZ2V0KSByZXR1cm4gTlVMTFxyXG5cclxuICAgIHZhciBwcmVwYXJlZFNlYXJjaCA9IGdldFByZXBhcmVkU2VhcmNoKHNlYXJjaClcclxuICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuXHJcbiAgICB2YXIgc2VhcmNoQml0ZmxhZ3MgPSBwcmVwYXJlZFNlYXJjaC5iaXRmbGFnc1xyXG4gICAgaWYoKHNlYXJjaEJpdGZsYWdzICYgdGFyZ2V0Ll9iaXRmbGFncykgIT09IHNlYXJjaEJpdGZsYWdzKSByZXR1cm4gTlVMTFxyXG5cclxuICAgIHJldHVybiBhbGdvcml0aG0ocHJlcGFyZWRTZWFyY2gsIHRhcmdldClcclxuICB9XHJcblxyXG4gIHZhciBnbyA9IChzZWFyY2gsIHRhcmdldHMsIG9wdGlvbnMpID0+IHtcclxuICAgIGlmKCFzZWFyY2gpIHJldHVybiBvcHRpb25zPy5hbGwgPyBhbGwodGFyZ2V0cywgb3B0aW9ucykgOiBub1Jlc3VsdHNcclxuXHJcbiAgICB2YXIgcHJlcGFyZWRTZWFyY2ggPSBnZXRQcmVwYXJlZFNlYXJjaChzZWFyY2gpXHJcbiAgICB2YXIgc2VhcmNoQml0ZmxhZ3MgPSBwcmVwYXJlZFNlYXJjaC5iaXRmbGFnc1xyXG4gICAgdmFyIGNvbnRhaW5zU3BhY2UgID0gcHJlcGFyZWRTZWFyY2guY29udGFpbnNTcGFjZVxyXG5cclxuICAgIHZhciB0aHJlc2hvbGQgPSBkZW5vcm1hbGl6ZVNjb3JlKCBvcHRpb25zPy50aHJlc2hvbGQgfHwgMCApXHJcbiAgICB2YXIgbGltaXQgICAgID0gb3B0aW9ucz8ubGltaXQgfHwgSU5GSU5JVFlcclxuXHJcbiAgICB2YXIgcmVzdWx0c0xlbiA9IDA7IHZhciBsaW1pdGVkQ291bnQgPSAwXHJcbiAgICB2YXIgdGFyZ2V0c0xlbiA9IHRhcmdldHMubGVuZ3RoXHJcblxyXG4gICAgZnVuY3Rpb24gcHVzaF9yZXN1bHQocmVzdWx0KSB7XHJcbiAgICAgIGlmKHJlc3VsdHNMZW4gPCBsaW1pdCkgeyBxLmFkZChyZXN1bHQpOyArK3Jlc3VsdHNMZW4gfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICArK2xpbWl0ZWRDb3VudFxyXG4gICAgICAgIGlmKHJlc3VsdC5fc2NvcmUgPiBxLnBlZWsoKS5fc2NvcmUpIHEucmVwbGFjZVRvcChyZXN1bHQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGlzIGNvZGUgaXMgY29weS9wYXN0ZWQgMyB0aW1lcyBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucyBbb3B0aW9ucy5rZXksIG9wdGlvbnMua2V5cywgbm8ga2V5c11cclxuXHJcbiAgICAvLyBvcHRpb25zLmtleVxyXG4gICAgaWYob3B0aW9ucz8ua2V5KSB7XHJcbiAgICAgIHZhciBrZXkgPSBvcHRpb25zLmtleVxyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0c0xlbjsgKytpKSB7IHZhciBvYmogPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwga2V5KVxyXG4gICAgICAgIGlmKCF0YXJnZXQpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG5cclxuICAgICAgICBpZigoc2VhcmNoQml0ZmxhZ3MgJiB0YXJnZXQuX2JpdGZsYWdzKSAhPT0gc2VhcmNoQml0ZmxhZ3MpIGNvbnRpbnVlXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0KVxyXG4gICAgICAgIGlmKHJlc3VsdCA9PT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBpZihyZXN1bHQuX3Njb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZVxyXG5cclxuICAgICAgICByZXN1bHQub2JqID0gb2JqXHJcbiAgICAgICAgcHVzaF9yZXN1bHQocmVzdWx0KVxyXG4gICAgICB9XHJcblxyXG4gICAgLy8gb3B0aW9ucy5rZXlzXHJcbiAgICB9IGVsc2UgaWYob3B0aW9ucz8ua2V5cykge1xyXG4gICAgICB2YXIga2V5cyA9IG9wdGlvbnMua2V5c1xyXG4gICAgICB2YXIga2V5c0xlbiA9IGtleXMubGVuZ3RoXHJcblxyXG4gICAgICBvdXRlcjogZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldHNMZW47ICsraSkgeyB2YXIgb2JqID0gdGFyZ2V0c1tpXVxyXG5cclxuICAgICAgICB7IC8vIGVhcmx5IG91dCBiYXNlZCBvbiBiaXRmbGFnc1xyXG4gICAgICAgICAgdmFyIGtleXNCaXRmbGFncyA9IDBcclxuICAgICAgICAgIGZvciAodmFyIGtleUkgPSAwOyBrZXlJIDwga2V5c0xlbjsgKytrZXlJKSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSBrZXlzW2tleUldXHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIGtleSlcclxuICAgICAgICAgICAgaWYoIXRhcmdldCkgeyB0bXBUYXJnZXRzW2tleUldID0gbm9UYXJnZXQ7IGNvbnRpbnVlIH1cclxuICAgICAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG4gICAgICAgICAgICB0bXBUYXJnZXRzW2tleUldID0gdGFyZ2V0XHJcblxyXG4gICAgICAgICAgICBrZXlzQml0ZmxhZ3MgfD0gdGFyZ2V0Ll9iaXRmbGFnc1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmKChzZWFyY2hCaXRmbGFncyAmIGtleXNCaXRmbGFncykgIT09IHNlYXJjaEJpdGZsYWdzKSBjb250aW51ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoY29udGFpbnNTcGFjZSkgZm9yKGxldCBpPTA7IGk8cHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlcy5sZW5ndGg7IGkrKykga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPSBORUdBVElWRV9JTkZJTklUWVxyXG5cclxuICAgICAgICBmb3IgKHZhciBrZXlJID0gMDsga2V5SSA8IGtleXNMZW47ICsra2V5SSkge1xyXG4gICAgICAgICAgdGFyZ2V0ID0gdG1wVGFyZ2V0c1trZXlJXVxyXG4gICAgICAgICAgaWYodGFyZ2V0ID09PSBub1RhcmdldCkgeyB0bXBSZXN1bHRzW2tleUldID0gbm9UYXJnZXQ7IGNvbnRpbnVlIH1cclxuXHJcbiAgICAgICAgICB0bXBSZXN1bHRzW2tleUldID0gYWxnb3JpdGhtKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQsIC8qYWxsb3dTcGFjZXM9Ki9mYWxzZSwgLyphbGxvd1BhcnRpYWxNYXRjaD0qL2NvbnRhaW5zU3BhY2UpXHJcbiAgICAgICAgICBpZih0bXBSZXN1bHRzW2tleUldID09PSBOVUxMKSB7IHRtcFJlc3VsdHNba2V5SV0gPSBub1RhcmdldDsgY29udGludWUgfVxyXG5cclxuICAgICAgICAgIC8vIHRvZG86IHRoaXMgc2VlbXMgd2VpcmQgYW5kIHdyb25nLiBsaWtlIHdoYXQgaWYgb3VyIGZpcnN0IG1hdGNoIHdhc24ndCBnb29kLiB0aGlzIHNob3VsZCBqdXN0IHJlcGxhY2UgaXQgaW5zdGVhZCBvZiBhdmVyYWdpbmcgd2l0aCBpdFxyXG4gICAgICAgICAgLy8gaWYgb3VyIHNlY29uZCBtYXRjaCBpc24ndCBnb29kIHdlIGlnbm9yZSBpdCBpbnN0ZWFkIG9mIGF2ZXJhZ2luZyB3aXRoIGl0XHJcbiAgICAgICAgICBpZihjb250YWluc1NwYWNlKSBmb3IobGV0IGk9MDsgaTxwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmKGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldID4gLTEwMDApIHtcclxuICAgICAgICAgICAgICBpZihrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA+IE5FR0FUSVZFX0lORklOSVRZKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG1wID0gKGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldICsgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0pIC8gNC8qYm9udXMgc2NvcmUgZm9yIGhhdmluZyBtdWx0aXBsZSBtYXRjaGVzKi9cclxuICAgICAgICAgICAgICAgIGlmKHRtcCA+IGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldKSBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA9IHRtcFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA+IGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldKSBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA9IGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihjb250YWluc1NwYWNlKSB7XHJcbiAgICAgICAgICBmb3IobGV0IGk9MDsgaTxwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzLmxlbmd0aDsgaSsrKSB7IGlmKGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldID09PSBORUdBVElWRV9JTkZJTklUWSkgY29udGludWUgb3V0ZXIgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgaGFzQXRMZWFzdDFNYXRjaCA9IGZhbHNlXHJcbiAgICAgICAgICBmb3IobGV0IGk9MDsgaSA8IGtleXNMZW47IGkrKykgeyBpZih0bXBSZXN1bHRzW2ldLl9zY29yZSAhPT0gTkVHQVRJVkVfSU5GSU5JVFkpIHsgaGFzQXRMZWFzdDFNYXRjaCA9IHRydWU7IGJyZWFrIH0gfVxyXG4gICAgICAgICAgaWYoIWhhc0F0TGVhc3QxTWF0Y2gpIGNvbnRpbnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgb2JqUmVzdWx0cyA9IG5ldyBLZXlzUmVzdWx0KGtleXNMZW4pXHJcbiAgICAgICAgZm9yKGxldCBpPTA7IGkgPCBrZXlzTGVuOyBpKyspIHsgb2JqUmVzdWx0c1tpXSA9IHRtcFJlc3VsdHNbaV0gfVxyXG5cclxuICAgICAgICBpZihjb250YWluc1NwYWNlKSB7XHJcbiAgICAgICAgICB2YXIgc2NvcmUgPSAwXHJcbiAgICAgICAgICBmb3IobGV0IGk9MDsgaTxwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzLmxlbmd0aDsgaSsrKSBzY29yZSArPSBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyB0b2RvIGNvdWxkIHJld3JpdGUgdGhpcyBzY29yaW5nIHRvIGJlIG1vcmUgc2ltaWxhciB0byB3aGVuIHRoZXJlJ3Mgc3BhY2VzXHJcbiAgICAgICAgICAvLyBpZiB3ZSBtYXRjaCBtdWx0aXBsZSBrZXlzIGdpdmUgdXMgYm9udXMgcG9pbnRzXHJcbiAgICAgICAgICB2YXIgc2NvcmUgPSBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgICAgICAgZm9yKGxldCBpPTA7IGk8a2V5c0xlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBvYmpSZXN1bHRzW2ldXHJcbiAgICAgICAgICAgIGlmKHJlc3VsdC5fc2NvcmUgPiAtMTAwMCkge1xyXG4gICAgICAgICAgICAgIGlmKHNjb3JlID4gTkVHQVRJVkVfSU5GSU5JVFkpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0bXAgPSAoc2NvcmUgKyByZXN1bHQuX3Njb3JlKSAvIDQvKmJvbnVzIHNjb3JlIGZvciBoYXZpbmcgbXVsdGlwbGUgbWF0Y2hlcyovXHJcbiAgICAgICAgICAgICAgICBpZih0bXAgPiBzY29yZSkgc2NvcmUgPSB0bXBcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYocmVzdWx0Ll9zY29yZSA+IHNjb3JlKSBzY29yZSA9IHJlc3VsdC5fc2NvcmVcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG9ialJlc3VsdHMub2JqID0gb2JqXHJcbiAgICAgICAgb2JqUmVzdWx0cy5fc2NvcmUgPSBzY29yZVxyXG4gICAgICAgIGlmKG9wdGlvbnM/LnNjb3JlRm4pIHtcclxuICAgICAgICAgIHNjb3JlID0gb3B0aW9ucy5zY29yZUZuKG9ialJlc3VsdHMpXHJcbiAgICAgICAgICBpZighc2NvcmUpIGNvbnRpbnVlXHJcbiAgICAgICAgICBzY29yZSA9IGRlbm9ybWFsaXplU2NvcmUoc2NvcmUpXHJcbiAgICAgICAgICBvYmpSZXN1bHRzLl9zY29yZSA9IHNjb3JlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihzY29yZSA8IHRocmVzaG9sZCkgY29udGludWVcclxuICAgICAgICBwdXNoX3Jlc3VsdChvYmpSZXN1bHRzKVxyXG4gICAgICB9XHJcblxyXG4gICAgLy8gbm8ga2V5c1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldHNMZW47ICsraSkgeyB2YXIgdGFyZ2V0ID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIGlmKCF0YXJnZXQpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG5cclxuICAgICAgICBpZigoc2VhcmNoQml0ZmxhZ3MgJiB0YXJnZXQuX2JpdGZsYWdzKSAhPT0gc2VhcmNoQml0ZmxhZ3MpIGNvbnRpbnVlXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0KVxyXG4gICAgICAgIGlmKHJlc3VsdCA9PT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBpZihyZXN1bHQuX3Njb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZVxyXG5cclxuICAgICAgICBwdXNoX3Jlc3VsdChyZXN1bHQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZihyZXN1bHRzTGVuID09PSAwKSByZXR1cm4gbm9SZXN1bHRzXHJcbiAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShyZXN1bHRzTGVuKVxyXG4gICAgZm9yKHZhciBpID0gcmVzdWx0c0xlbiAtIDE7IGkgPj0gMDsgLS1pKSByZXN1bHRzW2ldID0gcS5wb2xsKClcclxuICAgIHJlc3VsdHMudG90YWwgPSByZXN1bHRzTGVuICsgbGltaXRlZENvdW50XHJcbiAgICByZXR1cm4gcmVzdWx0c1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIHRoaXMgaXMgd3JpdHRlbiBhcyAxIGZ1bmN0aW9uIGluc3RlYWQgb2YgMiBmb3IgbWluaWZpY2F0aW9uLiBwZXJmIHNlZW1zIGZpbmUgLi4uXHJcbiAgLy8gZXhjZXB0IHdoZW4gbWluaWZpZWQuIHRoZSBwZXJmIGlzIHZlcnkgc2xvd1xyXG4gIHZhciBoaWdobGlnaHQgPSAocmVzdWx0LCBvcGVuPSc8Yj4nLCBjbG9zZT0nPC9iPicpID0+IHtcclxuICAgIHZhciBjYWxsYmFjayA9IHR5cGVvZiBvcGVuID09PSAnZnVuY3Rpb24nID8gb3BlbiA6IHVuZGVmaW5lZFxyXG5cclxuICAgIHZhciB0YXJnZXQgICAgICA9IHJlc3VsdC50YXJnZXRcclxuICAgIHZhciB0YXJnZXRMZW4gICA9IHRhcmdldC5sZW5ndGhcclxuICAgIHZhciBpbmRleGVzICAgICA9IHJlc3VsdC5pbmRleGVzXHJcbiAgICB2YXIgaGlnaGxpZ2h0ZWQgPSAnJ1xyXG4gICAgdmFyIG1hdGNoSSAgICAgID0gMFxyXG4gICAgdmFyIGluZGV4ZXNJICAgID0gMFxyXG4gICAgdmFyIG9wZW5lZCAgICAgID0gZmFsc2VcclxuICAgIHZhciBwYXJ0cyAgICAgICA9IFtdXHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldExlbjsgKytpKSB7IHZhciBjaGFyID0gdGFyZ2V0W2ldXHJcbiAgICAgIGlmKGluZGV4ZXNbaW5kZXhlc0ldID09PSBpKSB7XHJcbiAgICAgICAgKytpbmRleGVzSVxyXG4gICAgICAgIGlmKCFvcGVuZWQpIHsgb3BlbmVkID0gdHJ1ZVxyXG4gICAgICAgICAgaWYoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgcGFydHMucHVzaChoaWdobGlnaHRlZCk7IGhpZ2hsaWdodGVkID0gJydcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IG9wZW5cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGluZGV4ZXNJID09PSBpbmRleGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgaWYoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgKz0gY2hhclxyXG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGNhbGxiYWNrKGhpZ2hsaWdodGVkLCBtYXRjaEkrKykpOyBoaWdobGlnaHRlZCA9ICcnXHJcbiAgICAgICAgICAgIHBhcnRzLnB1c2godGFyZ2V0LnN1YnN0cihpKzEpKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgKz0gY2hhciArIGNsb3NlICsgdGFyZ2V0LnN1YnN0cihpKzEpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZihvcGVuZWQpIHsgb3BlbmVkID0gZmFsc2VcclxuICAgICAgICAgIGlmKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHBhcnRzLnB1c2goY2FsbGJhY2soaGlnaGxpZ2h0ZWQsIG1hdGNoSSsrKSk7IGhpZ2hsaWdodGVkID0gJydcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IGNsb3NlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGhpZ2hsaWdodGVkICs9IGNoYXJcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY2FsbGJhY2sgPyBwYXJ0cyA6IGhpZ2hsaWdodGVkXHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIHByZXBhcmUgPSAodGFyZ2V0KSA9PiB7XHJcbiAgICBpZih0eXBlb2YgdGFyZ2V0ID09PSAnbnVtYmVyJykgdGFyZ2V0ID0gJycrdGFyZ2V0XHJcbiAgICBlbHNlIGlmKHR5cGVvZiB0YXJnZXQgIT09ICdzdHJpbmcnKSB0YXJnZXQgPSAnJ1xyXG4gICAgdmFyIGluZm8gPSBwcmVwYXJlTG93ZXJJbmZvKHRhcmdldClcclxuICAgIHJldHVybiBuZXdfcmVzdWx0KHRhcmdldCwge190YXJnZXRMb3dlcjppbmZvLl9sb3dlciwgX3RhcmdldExvd2VyQ29kZXM6aW5mby5sb3dlckNvZGVzLCBfYml0ZmxhZ3M6aW5mby5iaXRmbGFnc30pXHJcbiAgfVxyXG5cclxuICB2YXIgY2xlYW51cCA9ICgpID0+IHsgcHJlcGFyZWRDYWNoZS5jbGVhcigpOyBwcmVwYXJlZFNlYXJjaENhY2hlLmNsZWFyKCkgfVxyXG5cclxuXHJcbiAgLy8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcclxuICAvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxyXG4gIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcbiAgLy8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcclxuXHJcblxyXG4gIGNsYXNzIFJlc3VsdCB7XHJcbiAgICBnZXQgWydpbmRleGVzJ10oKSB7IHJldHVybiB0aGlzLl9pbmRleGVzLnNsaWNlKDAsIHRoaXMuX2luZGV4ZXMubGVuKS5zb3J0KChhLGIpPT5hLWIpIH1cclxuICAgIHNldCBbJ2luZGV4ZXMnXShpbmRleGVzKSB7IHJldHVybiB0aGlzLl9pbmRleGVzID0gaW5kZXhlcyB9XHJcbiAgICBbJ2hpZ2hsaWdodCddKG9wZW4sIGNsb3NlKSB7IHJldHVybiBoaWdobGlnaHQodGhpcywgb3BlbiwgY2xvc2UpIH1cclxuICAgIGdldCBbJ3Njb3JlJ10oKSB7IHJldHVybiBub3JtYWxpemVTY29yZSh0aGlzLl9zY29yZSkgfVxyXG4gICAgc2V0IFsnc2NvcmUnXShzY29yZSkgeyB0aGlzLl9zY29yZSA9IGRlbm9ybWFsaXplU2NvcmUoc2NvcmUpIH1cclxuICB9XHJcblxyXG4gIGNsYXNzIEtleXNSZXN1bHQgZXh0ZW5kcyBBcnJheSB7XHJcbiAgICBnZXQgWydzY29yZSddKCkgeyByZXR1cm4gbm9ybWFsaXplU2NvcmUodGhpcy5fc2NvcmUpIH1cclxuICAgIHNldCBbJ3Njb3JlJ10oc2NvcmUpIHsgdGhpcy5fc2NvcmUgPSBkZW5vcm1hbGl6ZVNjb3JlKHNjb3JlKSB9XHJcbiAgfVxyXG5cclxuICB2YXIgbmV3X3Jlc3VsdCA9ICh0YXJnZXQsIG9wdGlvbnMpID0+IHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBSZXN1bHQoKVxyXG4gICAgcmVzdWx0Wyd0YXJnZXQnXSAgICAgICAgICAgICA9IHRhcmdldFxyXG4gICAgcmVzdWx0WydvYmonXSAgICAgICAgICAgICAgICA9IG9wdGlvbnMub2JqICAgICAgICAgICAgICAgICAgID8/IE5VTExcclxuICAgIHJlc3VsdC5fc2NvcmUgICAgICAgICAgICAgICAgPSBvcHRpb25zLl9zY29yZSAgICAgICAgICAgICAgICA/PyBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgcmVzdWx0Ll9pbmRleGVzICAgICAgICAgICAgICA9IG9wdGlvbnMuX2luZGV4ZXMgICAgICAgICAgICAgID8/IFtdXHJcbiAgICByZXN1bHQuX3RhcmdldExvd2VyICAgICAgICAgID0gb3B0aW9ucy5fdGFyZ2V0TG93ZXIgICAgICAgICAgPz8gJydcclxuICAgIHJlc3VsdC5fdGFyZ2V0TG93ZXJDb2RlcyAgICAgPSBvcHRpb25zLl90YXJnZXRMb3dlckNvZGVzICAgICA/PyBOVUxMXHJcbiAgICByZXN1bHQuX25leHRCZWdpbm5pbmdJbmRleGVzID0gb3B0aW9ucy5fbmV4dEJlZ2lubmluZ0luZGV4ZXMgPz8gTlVMTFxyXG4gICAgcmVzdWx0Ll9iaXRmbGFncyAgICAgICAgICAgICA9IG9wdGlvbnMuX2JpdGZsYWdzICAgICAgICAgICAgID8/IDBcclxuICAgIHJldHVybiByZXN1bHRcclxuICB9XHJcblxyXG5cclxuICB2YXIgbm9ybWFsaXplU2NvcmUgPSBzY29yZSA9PiB7XHJcbiAgICBpZihzY29yZSA9PT0gTkVHQVRJVkVfSU5GSU5JVFkpIHJldHVybiAwXHJcbiAgICBpZihzY29yZSA+IDEpIHJldHVybiBzY29yZVxyXG4gICAgcmV0dXJuIE1hdGguRSAqKiAoICgoLXNjb3JlICsgMSkqKi4wNDMwNyAtIDEpICogLTIpXHJcbiAgfVxyXG4gIHZhciBkZW5vcm1hbGl6ZVNjb3JlID0gbm9ybWFsaXplZFNjb3JlID0+IHtcclxuICAgIGlmKG5vcm1hbGl6ZWRTY29yZSA9PT0gMCkgcmV0dXJuIE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICBpZihub3JtYWxpemVkU2NvcmUgPiAxKSByZXR1cm4gbm9ybWFsaXplZFNjb3JlXHJcbiAgICByZXR1cm4gMSAtIE1hdGgucG93KChNYXRoLmxvZyhub3JtYWxpemVkU2NvcmUpIC8gLTIgKyAxKSwgMSAvIDAuMDQzMDcpXHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIHByZXBhcmVTZWFyY2ggPSAoc2VhcmNoKSA9PiB7XHJcbiAgICBpZih0eXBlb2Ygc2VhcmNoID09PSAnbnVtYmVyJykgc2VhcmNoID0gJycrc2VhcmNoXHJcbiAgICBlbHNlIGlmKHR5cGVvZiBzZWFyY2ggIT09ICdzdHJpbmcnKSBzZWFyY2ggPSAnJ1xyXG4gICAgc2VhcmNoID0gc2VhcmNoLnRyaW0oKVxyXG4gICAgdmFyIGluZm8gPSBwcmVwYXJlTG93ZXJJbmZvKHNlYXJjaClcclxuXHJcbiAgICB2YXIgc3BhY2VTZWFyY2hlcyA9IFtdXHJcbiAgICBpZihpbmZvLmNvbnRhaW5zU3BhY2UpIHtcclxuICAgICAgdmFyIHNlYXJjaGVzID0gc2VhcmNoLnNwbGl0KC9cXHMrLylcclxuICAgICAgc2VhcmNoZXMgPSBbLi4ubmV3IFNldChzZWFyY2hlcyldIC8vIGRpc3RpbmN0XHJcbiAgICAgIGZvcih2YXIgaT0wOyBpPHNlYXJjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYoc2VhcmNoZXNbaV0gPT09ICcnKSBjb250aW51ZVxyXG4gICAgICAgIHZhciBfaW5mbyA9IHByZXBhcmVMb3dlckluZm8oc2VhcmNoZXNbaV0pXHJcbiAgICAgICAgc3BhY2VTZWFyY2hlcy5wdXNoKHtsb3dlckNvZGVzOl9pbmZvLmxvd2VyQ29kZXMsIF9sb3dlcjpzZWFyY2hlc1tpXS50b0xvd2VyQ2FzZSgpLCBjb250YWluc1NwYWNlOmZhbHNlfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7bG93ZXJDb2RlczogaW5mby5sb3dlckNvZGVzLCBfbG93ZXI6IGluZm8uX2xvd2VyLCBjb250YWluc1NwYWNlOiBpbmZvLmNvbnRhaW5zU3BhY2UsIGJpdGZsYWdzOiBpbmZvLmJpdGZsYWdzLCBzcGFjZVNlYXJjaGVzOiBzcGFjZVNlYXJjaGVzfVxyXG4gIH1cclxuXHJcblxyXG5cclxuICB2YXIgZ2V0UHJlcGFyZWQgPSAodGFyZ2V0KSA9PiB7XHJcbiAgICBpZih0YXJnZXQubGVuZ3RoID4gOTk5KSByZXR1cm4gcHJlcGFyZSh0YXJnZXQpIC8vIGRvbid0IGNhY2hlIGh1Z2UgdGFyZ2V0c1xyXG4gICAgdmFyIHRhcmdldFByZXBhcmVkID0gcHJlcGFyZWRDYWNoZS5nZXQodGFyZ2V0KVxyXG4gICAgaWYodGFyZ2V0UHJlcGFyZWQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRhcmdldFByZXBhcmVkXHJcbiAgICB0YXJnZXRQcmVwYXJlZCA9IHByZXBhcmUodGFyZ2V0KVxyXG4gICAgcHJlcGFyZWRDYWNoZS5zZXQodGFyZ2V0LCB0YXJnZXRQcmVwYXJlZClcclxuICAgIHJldHVybiB0YXJnZXRQcmVwYXJlZFxyXG4gIH1cclxuICB2YXIgZ2V0UHJlcGFyZWRTZWFyY2ggPSAoc2VhcmNoKSA9PiB7XHJcbiAgICBpZihzZWFyY2gubGVuZ3RoID4gOTk5KSByZXR1cm4gcHJlcGFyZVNlYXJjaChzZWFyY2gpIC8vIGRvbid0IGNhY2hlIGh1Z2Ugc2VhcmNoZXNcclxuICAgIHZhciBzZWFyY2hQcmVwYXJlZCA9IHByZXBhcmVkU2VhcmNoQ2FjaGUuZ2V0KHNlYXJjaClcclxuICAgIGlmKHNlYXJjaFByZXBhcmVkICE9PSB1bmRlZmluZWQpIHJldHVybiBzZWFyY2hQcmVwYXJlZFxyXG4gICAgc2VhcmNoUHJlcGFyZWQgPSBwcmVwYXJlU2VhcmNoKHNlYXJjaClcclxuICAgIHByZXBhcmVkU2VhcmNoQ2FjaGUuc2V0KHNlYXJjaCwgc2VhcmNoUHJlcGFyZWQpXHJcbiAgICByZXR1cm4gc2VhcmNoUHJlcGFyZWRcclxuICB9XHJcblxyXG5cclxuICB2YXIgYWxsID0gKHRhcmdldHMsIG9wdGlvbnMpID0+IHtcclxuICAgIHZhciByZXN1bHRzID0gW107IHJlc3VsdHMudG90YWwgPSB0YXJnZXRzLmxlbmd0aCAvLyB0aGlzIHRvdGFsIGNhbiBiZSB3cm9uZyBpZiBzb21lIHRhcmdldHMgYXJlIHNraXBwZWRcclxuXHJcbiAgICB2YXIgbGltaXQgPSBvcHRpb25zPy5saW1pdCB8fCBJTkZJTklUWVxyXG5cclxuICAgIGlmKG9wdGlvbnM/LmtleSkge1xyXG4gICAgICBmb3IodmFyIGk9MDtpPHRhcmdldHMubGVuZ3RoO2krKykgeyB2YXIgb2JqID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIG9wdGlvbnMua2V5KVxyXG4gICAgICAgIGlmKHRhcmdldCA9PSBOVUxMKSBjb250aW51ZVxyXG4gICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3X3Jlc3VsdCh0YXJnZXQudGFyZ2V0LCB7X3Njb3JlOiB0YXJnZXQuX3Njb3JlLCBvYmo6IG9ian0pXHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7IGlmKHJlc3VsdHMubGVuZ3RoID49IGxpbWl0KSByZXR1cm4gcmVzdWx0c1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYob3B0aW9ucz8ua2V5cykge1xyXG4gICAgICBmb3IodmFyIGk9MDtpPHRhcmdldHMubGVuZ3RoO2krKykgeyB2YXIgb2JqID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIHZhciBvYmpSZXN1bHRzID0gbmV3IEtleXNSZXN1bHQob3B0aW9ucy5rZXlzLmxlbmd0aClcclxuICAgICAgICBmb3IgKHZhciBrZXlJID0gb3B0aW9ucy5rZXlzLmxlbmd0aCAtIDE7IGtleUkgPj0gMDsgLS1rZXlJKSB7XHJcbiAgICAgICAgICB2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBvcHRpb25zLmtleXNba2V5SV0pXHJcbiAgICAgICAgICBpZighdGFyZ2V0KSB7IG9ialJlc3VsdHNba2V5SV0gPSBub1RhcmdldDsgY29udGludWUgfVxyXG4gICAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG4gICAgICAgICAgdGFyZ2V0Ll9zY29yZSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgICAgICB0YXJnZXQuX2luZGV4ZXMubGVuID0gMFxyXG4gICAgICAgICAgb2JqUmVzdWx0c1trZXlJXSA9IHRhcmdldFxyXG4gICAgICAgIH1cclxuICAgICAgICBvYmpSZXN1bHRzLm9iaiA9IG9ialxyXG4gICAgICAgIG9ialJlc3VsdHMuX3Njb3JlID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgICByZXN1bHRzLnB1c2gob2JqUmVzdWx0cyk7IGlmKHJlc3VsdHMubGVuZ3RoID49IGxpbWl0KSByZXR1cm4gcmVzdWx0c1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IodmFyIGk9MDtpPHRhcmdldHMubGVuZ3RoO2krKykgeyB2YXIgdGFyZ2V0ID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIGlmKHRhcmdldCA9PSBOVUxMKSBjb250aW51ZVxyXG4gICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuICAgICAgICB0YXJnZXQuX3Njb3JlID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgICB0YXJnZXQuX2luZGV4ZXMubGVuID0gMFxyXG4gICAgICAgIHJlc3VsdHMucHVzaCh0YXJnZXQpOyBpZihyZXN1bHRzLmxlbmd0aCA+PSBsaW1pdCkgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHRzXHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIGFsZ29yaXRobSA9IChwcmVwYXJlZFNlYXJjaCwgcHJlcGFyZWQsIGFsbG93U3BhY2VzPWZhbHNlLCBhbGxvd1BhcnRpYWxNYXRjaD1mYWxzZSkgPT4ge1xyXG4gICAgaWYoYWxsb3dTcGFjZXM9PT1mYWxzZSAmJiBwcmVwYXJlZFNlYXJjaC5jb250YWluc1NwYWNlKSByZXR1cm4gYWxnb3JpdGhtU3BhY2VzKHByZXBhcmVkU2VhcmNoLCBwcmVwYXJlZCwgYWxsb3dQYXJ0aWFsTWF0Y2gpXHJcblxyXG4gICAgdmFyIHNlYXJjaExvd2VyICAgICAgPSBwcmVwYXJlZFNlYXJjaC5fbG93ZXJcclxuICAgIHZhciBzZWFyY2hMb3dlckNvZGVzID0gcHJlcGFyZWRTZWFyY2gubG93ZXJDb2Rlc1xyXG4gICAgdmFyIHNlYXJjaExvd2VyQ29kZSAgPSBzZWFyY2hMb3dlckNvZGVzWzBdXHJcbiAgICB2YXIgdGFyZ2V0TG93ZXJDb2RlcyA9IHByZXBhcmVkLl90YXJnZXRMb3dlckNvZGVzXHJcbiAgICB2YXIgc2VhcmNoTGVuICAgICAgICA9IHNlYXJjaExvd2VyQ29kZXMubGVuZ3RoXHJcbiAgICB2YXIgdGFyZ2V0TGVuICAgICAgICA9IHRhcmdldExvd2VyQ29kZXMubGVuZ3RoXHJcbiAgICB2YXIgc2VhcmNoSSAgICAgICAgICA9IDAgLy8gd2hlcmUgd2UgYXRcclxuICAgIHZhciB0YXJnZXRJICAgICAgICAgID0gMCAvLyB3aGVyZSB5b3UgYXRcclxuICAgIHZhciBtYXRjaGVzU2ltcGxlTGVuID0gMFxyXG5cclxuICAgIC8vIHZlcnkgYmFzaWMgZnV6enkgbWF0Y2g7IHRvIHJlbW92ZSBub24tbWF0Y2hpbmcgdGFyZ2V0cyBBU0FQIVxyXG4gICAgLy8gd2FsayB0aHJvdWdoIHRhcmdldC4gZmluZCBzZXF1ZW50aWFsIG1hdGNoZXMuXHJcbiAgICAvLyBpZiBhbGwgY2hhcnMgYXJlbid0IGZvdW5kIHRoZW4gZXhpdFxyXG4gICAgZm9yKDs7KSB7XHJcbiAgICAgIHZhciBpc01hdGNoID0gc2VhcmNoTG93ZXJDb2RlID09PSB0YXJnZXRMb3dlckNvZGVzW3RhcmdldEldXHJcbiAgICAgIGlmKGlzTWF0Y2gpIHtcclxuICAgICAgICBtYXRjaGVzU2ltcGxlW21hdGNoZXNTaW1wbGVMZW4rK10gPSB0YXJnZXRJXHJcbiAgICAgICAgKytzZWFyY2hJOyBpZihzZWFyY2hJID09PSBzZWFyY2hMZW4pIGJyZWFrXHJcbiAgICAgICAgc2VhcmNoTG93ZXJDb2RlID0gc2VhcmNoTG93ZXJDb2Rlc1tzZWFyY2hJXVxyXG4gICAgICB9XHJcbiAgICAgICsrdGFyZ2V0STsgaWYodGFyZ2V0SSA+PSB0YXJnZXRMZW4pIHJldHVybiBOVUxMIC8vIEZhaWxlZCB0byBmaW5kIHNlYXJjaElcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VhcmNoSSA9IDBcclxuICAgIHZhciBzdWNjZXNzU3RyaWN0ID0gZmFsc2VcclxuICAgIHZhciBtYXRjaGVzU3RyaWN0TGVuID0gMFxyXG5cclxuICAgIHZhciBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVkLl9uZXh0QmVnaW5uaW5nSW5kZXhlc1xyXG4gICAgaWYobmV4dEJlZ2lubmluZ0luZGV4ZXMgPT09IE5VTEwpIG5leHRCZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZWQuX25leHRCZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZU5leHRCZWdpbm5pbmdJbmRleGVzKHByZXBhcmVkLnRhcmdldClcclxuICAgIHRhcmdldEkgPSBtYXRjaGVzU2ltcGxlWzBdPT09MCA/IDAgOiBuZXh0QmVnaW5uaW5nSW5kZXhlc1ttYXRjaGVzU2ltcGxlWzBdLTFdXHJcblxyXG4gICAgLy8gT3VyIHRhcmdldCBzdHJpbmcgc3VjY2Vzc2Z1bGx5IG1hdGNoZWQgYWxsIGNoYXJhY3RlcnMgaW4gc2VxdWVuY2UhXHJcbiAgICAvLyBMZXQncyB0cnkgYSBtb3JlIGFkdmFuY2VkIGFuZCBzdHJpY3QgdGVzdCB0byBpbXByb3ZlIHRoZSBzY29yZVxyXG4gICAgLy8gb25seSBjb3VudCBpdCBhcyBhIG1hdGNoIGlmIGl0J3MgY29uc2VjdXRpdmUgb3IgYSBiZWdpbm5pbmcgY2hhcmFjdGVyIVxyXG4gICAgdmFyIGJhY2t0cmFja0NvdW50ID0gMFxyXG4gICAgaWYodGFyZ2V0SSAhPT0gdGFyZ2V0TGVuKSBmb3IoOzspIHtcclxuICAgICAgaWYodGFyZ2V0SSA+PSB0YXJnZXRMZW4pIHtcclxuICAgICAgICAvLyBXZSBmYWlsZWQgdG8gZmluZCBhIGdvb2Qgc3BvdCBmb3IgdGhpcyBzZWFyY2ggY2hhciwgZ28gYmFjayB0byB0aGUgcHJldmlvdXMgc2VhcmNoIGNoYXIgYW5kIGZvcmNlIGl0IGZvcndhcmRcclxuICAgICAgICBpZihzZWFyY2hJIDw9IDApIGJyZWFrIC8vIFdlIGZhaWxlZCB0byBwdXNoIGNoYXJzIGZvcndhcmQgZm9yIGEgYmV0dGVyIG1hdGNoXHJcblxyXG4gICAgICAgICsrYmFja3RyYWNrQ291bnQ7IGlmKGJhY2t0cmFja0NvdW50ID4gMjAwKSBicmVhayAvLyBleHBvbmVudGlhbCBiYWNrdHJhY2tpbmcgaXMgdGFraW5nIHRvbyBsb25nLCBqdXN0IGdpdmUgdXAgYW5kIHJldHVybiBhIGJhZCBtYXRjaFxyXG5cclxuICAgICAgICAtLXNlYXJjaElcclxuICAgICAgICB2YXIgbGFzdE1hdGNoID0gbWF0Y2hlc1N0cmljdFstLW1hdGNoZXNTdHJpY3RMZW5dXHJcbiAgICAgICAgdGFyZ2V0SSA9IG5leHRCZWdpbm5pbmdJbmRleGVzW2xhc3RNYXRjaF1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGlzTWF0Y2ggPSBzZWFyY2hMb3dlckNvZGVzW3NlYXJjaEldID09PSB0YXJnZXRMb3dlckNvZGVzW3RhcmdldEldXHJcbiAgICAgICAgaWYoaXNNYXRjaCkge1xyXG4gICAgICAgICAgbWF0Y2hlc1N0cmljdFttYXRjaGVzU3RyaWN0TGVuKytdID0gdGFyZ2V0SVxyXG4gICAgICAgICAgKytzZWFyY2hJOyBpZihzZWFyY2hJID09PSBzZWFyY2hMZW4pIHsgc3VjY2Vzc1N0cmljdCA9IHRydWU7IGJyZWFrIH1cclxuICAgICAgICAgICsrdGFyZ2V0SVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0YXJnZXRJID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNbdGFyZ2V0SV1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayBpZiBpdCdzIGEgc3Vic3RyaW5nIG1hdGNoXHJcbiAgICB2YXIgc3Vic3RyaW5nSW5kZXggPSBzZWFyY2hMZW4gPD0gMSA/IC0xIDogcHJlcGFyZWQuX3RhcmdldExvd2VyLmluZGV4T2Yoc2VhcmNoTG93ZXIsIG1hdGNoZXNTaW1wbGVbMF0pIC8vIHBlcmY6IHRoaXMgaXMgc2xvd1xyXG4gICAgdmFyIGlzU3Vic3RyaW5nID0gISF+c3Vic3RyaW5nSW5kZXhcclxuICAgIHZhciBpc1N1YnN0cmluZ0JlZ2lubmluZyA9ICFpc1N1YnN0cmluZyA/IGZhbHNlIDogc3Vic3RyaW5nSW5kZXg9PT0wIHx8IHByZXBhcmVkLl9uZXh0QmVnaW5uaW5nSW5kZXhlc1tzdWJzdHJpbmdJbmRleC0xXSA9PT0gc3Vic3RyaW5nSW5kZXhcclxuXHJcbiAgICAvLyBpZiBpdCdzIGEgc3Vic3RyaW5nIG1hdGNoIGJ1dCBub3QgYXQgYSBiZWdpbm5pbmcgaW5kZXgsIGxldCdzIHRyeSB0byBmaW5kIGEgc3Vic3RyaW5nIHN0YXJ0aW5nIGF0IGEgYmVnaW5uaW5nIGluZGV4IGZvciBhIGJldHRlciBzY29yZVxyXG4gICAgaWYoaXNTdWJzdHJpbmcgJiYgIWlzU3Vic3RyaW5nQmVnaW5uaW5nKSB7XHJcbiAgICAgIGZvcih2YXIgaT0wOyBpPG5leHRCZWdpbm5pbmdJbmRleGVzLmxlbmd0aDsgaT1uZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSkge1xyXG4gICAgICAgIGlmKGkgPD0gc3Vic3RyaW5nSW5kZXgpIGNvbnRpbnVlXHJcblxyXG4gICAgICAgIGZvcih2YXIgcz0wOyBzPHNlYXJjaExlbjsgcysrKSBpZihzZWFyY2hMb3dlckNvZGVzW3NdICE9PSBwcmVwYXJlZC5fdGFyZ2V0TG93ZXJDb2Rlc1tpK3NdKSBicmVha1xyXG4gICAgICAgIGlmKHMgPT09IHNlYXJjaExlbikgeyBzdWJzdHJpbmdJbmRleCA9IGk7IGlzU3Vic3RyaW5nQmVnaW5uaW5nID0gdHJ1ZTsgYnJlYWsgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGFsbHkgdXAgdGhlIHNjb3JlICYga2VlcCB0cmFjayBvZiBtYXRjaGVzIGZvciBoaWdobGlnaHRpbmcgbGF0ZXJcclxuICAgIC8vIGlmIGl0J3MgYSBzaW1wbGUgbWF0Y2gsIHdlJ2xsIHN3aXRjaCB0byBhIHN1YnN0cmluZyBtYXRjaCBpZiBhIHN1YnN0cmluZyBleGlzdHNcclxuICAgIC8vIGlmIGl0J3MgYSBzdHJpY3QgbWF0Y2gsIHdlJ2xsIHN3aXRjaCB0byBhIHN1YnN0cmluZyBtYXRjaCBvbmx5IGlmIHRoYXQncyBhIGJldHRlciBzY29yZVxyXG5cclxuICAgIHZhciBjYWxjdWxhdGVTY29yZSA9IG1hdGNoZXMgPT4ge1xyXG4gICAgICB2YXIgc2NvcmUgPSAwXHJcblxyXG4gICAgICB2YXIgZXh0cmFNYXRjaEdyb3VwQ291bnQgPSAwXHJcbiAgICAgIGZvcih2YXIgaSA9IDE7IGkgPCBzZWFyY2hMZW47ICsraSkge1xyXG4gICAgICAgIGlmKG1hdGNoZXNbaV0gLSBtYXRjaGVzW2ktMV0gIT09IDEpIHtzY29yZSAtPSBtYXRjaGVzW2ldOyArK2V4dHJhTWF0Y2hHcm91cENvdW50fVxyXG4gICAgICB9XHJcbiAgICAgIHZhciB1bm1hdGNoZWREaXN0YW5jZSA9IG1hdGNoZXNbc2VhcmNoTGVuLTFdIC0gbWF0Y2hlc1swXSAtIChzZWFyY2hMZW4tMSlcclxuXHJcbiAgICAgIHNjb3JlIC09ICgxMit1bm1hdGNoZWREaXN0YW5jZSkgKiBleHRyYU1hdGNoR3JvdXBDb3VudCAvLyBwZW5hbGl0eSBmb3IgbW9yZSBncm91cHNcclxuXHJcbiAgICAgIGlmKG1hdGNoZXNbMF0gIT09IDApIHNjb3JlIC09IG1hdGNoZXNbMF0qbWF0Y2hlc1swXSouMiAvLyBwZW5hbGl0eSBmb3Igbm90IHN0YXJ0aW5nIG5lYXIgdGhlIGJlZ2lubmluZ1xyXG5cclxuICAgICAgaWYoIXN1Y2Nlc3NTdHJpY3QpIHtcclxuICAgICAgICBzY29yZSAqPSAxMDAwXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gc3VjY2Vzc1N0cmljdCBvbiBhIHRhcmdldCB3aXRoIHRvbyBtYW55IGJlZ2lubmluZyBpbmRleGVzIGxvc2VzIHBvaW50cyBmb3IgYmVpbmcgYSBiYWQgdGFyZ2V0XHJcbiAgICAgICAgdmFyIHVuaXF1ZUJlZ2lubmluZ0luZGV4ZXMgPSAxXHJcbiAgICAgICAgZm9yKHZhciBpID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNbMF07IGkgPCB0YXJnZXRMZW47IGk9bmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0pICsrdW5pcXVlQmVnaW5uaW5nSW5kZXhlc1xyXG5cclxuICAgICAgICBpZih1bmlxdWVCZWdpbm5pbmdJbmRleGVzID4gMjQpIHNjb3JlICo9ICh1bmlxdWVCZWdpbm5pbmdJbmRleGVzLTI0KSoxMCAvLyBxdWl0ZSBhcmJpdHJhcnkgbnVtYmVycyBoZXJlIC4uLlxyXG4gICAgICB9XHJcblxyXG4gICAgICBzY29yZSAtPSAodGFyZ2V0TGVuIC0gc2VhcmNoTGVuKS8yIC8vIHBlbmFsaXR5IGZvciBsb25nZXIgdGFyZ2V0c1xyXG5cclxuICAgICAgaWYoaXNTdWJzdHJpbmcpICAgICAgICAgIHNjb3JlIC89IDErc2VhcmNoTGVuKnNlYXJjaExlbioxIC8vIGJvbnVzIGZvciBiZWluZyBhIGZ1bGwgc3Vic3RyaW5nXHJcbiAgICAgIGlmKGlzU3Vic3RyaW5nQmVnaW5uaW5nKSBzY29yZSAvPSAxK3NlYXJjaExlbipzZWFyY2hMZW4qMSAvLyBib251cyBmb3Igc3Vic3RyaW5nIHN0YXJ0aW5nIG9uIGEgYmVnaW5uaW5nSW5kZXhcclxuXHJcbiAgICAgIHNjb3JlIC09ICh0YXJnZXRMZW4gLSBzZWFyY2hMZW4pLzIgLy8gcGVuYWxpdHkgZm9yIGxvbmdlciB0YXJnZXRzXHJcblxyXG4gICAgICByZXR1cm4gc2NvcmVcclxuICAgIH1cclxuXHJcbiAgICBpZighc3VjY2Vzc1N0cmljdCkge1xyXG4gICAgICBpZihpc1N1YnN0cmluZykgZm9yKHZhciBpPTA7IGk8c2VhcmNoTGVuOyArK2kpIG1hdGNoZXNTaW1wbGVbaV0gPSBzdWJzdHJpbmdJbmRleCtpIC8vIGF0IHRoaXMgcG9pbnQgaXQncyBzYWZlIHRvIG92ZXJ3cml0ZSBtYXRjaGVoc1NpbXBsZSB3aXRoIHN1YnN0ciBtYXRjaGVzXHJcbiAgICAgIHZhciBtYXRjaGVzQmVzdCA9IG1hdGNoZXNTaW1wbGVcclxuICAgICAgdmFyIHNjb3JlID0gY2FsY3VsYXRlU2NvcmUobWF0Y2hlc0Jlc3QpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZihpc1N1YnN0cmluZ0JlZ2lubmluZykge1xyXG4gICAgICAgIGZvcih2YXIgaT0wOyBpPHNlYXJjaExlbjsgKytpKSBtYXRjaGVzU2ltcGxlW2ldID0gc3Vic3RyaW5nSW5kZXgraSAvLyBhdCB0aGlzIHBvaW50IGl0J3Mgc2FmZSB0byBvdmVyd3JpdGUgbWF0Y2hlaHNTaW1wbGUgd2l0aCBzdWJzdHIgbWF0Y2hlc1xyXG4gICAgICAgIHZhciBtYXRjaGVzQmVzdCA9IG1hdGNoZXNTaW1wbGVcclxuICAgICAgICB2YXIgc2NvcmUgPSBjYWxjdWxhdGVTY29yZShtYXRjaGVzU2ltcGxlKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBtYXRjaGVzQmVzdCA9IG1hdGNoZXNTdHJpY3RcclxuICAgICAgICB2YXIgc2NvcmUgPSBjYWxjdWxhdGVTY29yZShtYXRjaGVzU3RyaWN0KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJlcGFyZWQuX3Njb3JlID0gc2NvcmVcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc2VhcmNoTGVuOyArK2kpIHByZXBhcmVkLl9pbmRleGVzW2ldID0gbWF0Y2hlc0Jlc3RbaV1cclxuICAgIHByZXBhcmVkLl9pbmRleGVzLmxlbiA9IHNlYXJjaExlblxyXG5cclxuICAgIGNvbnN0IHJlc3VsdCAgICA9IG5ldyBSZXN1bHQoKVxyXG4gICAgcmVzdWx0LnRhcmdldCAgID0gcHJlcGFyZWQudGFyZ2V0XHJcbiAgICByZXN1bHQuX3Njb3JlICAgPSBwcmVwYXJlZC5fc2NvcmVcclxuICAgIHJlc3VsdC5faW5kZXhlcyA9IHByZXBhcmVkLl9pbmRleGVzXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbiAgfVxyXG4gIHZhciBhbGdvcml0aG1TcGFjZXMgPSAocHJlcGFyZWRTZWFyY2gsIHRhcmdldCwgYWxsb3dQYXJ0aWFsTWF0Y2gpID0+IHtcclxuICAgIHZhciBzZWVuX2luZGV4ZXMgPSBuZXcgU2V0KClcclxuICAgIHZhciBzY29yZSA9IDBcclxuICAgIHZhciByZXN1bHQgPSBOVUxMXHJcblxyXG4gICAgdmFyIGZpcnN0X3NlZW5faW5kZXhfbGFzdF9zZWFyY2ggPSAwXHJcbiAgICB2YXIgc2VhcmNoZXMgPSBwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzXHJcbiAgICB2YXIgc2VhcmNoZXNMZW4gPSBzZWFyY2hlcy5sZW5ndGhcclxuICAgIHZhciBjaGFuZ2VzbGVuID0gMFxyXG5cclxuICAgIC8vIFJldHVybiBfbmV4dEJlZ2lubmluZ0luZGV4ZXMgYmFjayB0byBpdHMgbm9ybWFsIHN0YXRlXHJcbiAgICB2YXIgcmVzZXROZXh0QmVnaW5uaW5nSW5kZXhlcyA9ICgpID0+IHtcclxuICAgICAgZm9yKGxldCBpPWNoYW5nZXNsZW4tMTsgaT49MDsgaS0tKSB0YXJnZXQuX25leHRCZWdpbm5pbmdJbmRleGVzW25leHRCZWdpbm5pbmdJbmRleGVzQ2hhbmdlc1tpKjIgKyAwXV0gPSBuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXNbaSoyICsgMV1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgaGFzQXRMZWFzdDFNYXRjaCA9IGZhbHNlXHJcbiAgICBmb3IodmFyIGk9MDsgaTxzZWFyY2hlc0xlbjsgKytpKSB7XHJcbiAgICAgIGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgdmFyIHNlYXJjaCA9IHNlYXJjaGVzW2ldXHJcblxyXG4gICAgICByZXN1bHQgPSBhbGdvcml0aG0oc2VhcmNoLCB0YXJnZXQpXHJcbiAgICAgIGlmKGFsbG93UGFydGlhbE1hdGNoKSB7XHJcbiAgICAgICAgaWYocmVzdWx0ID09PSBOVUxMKSBjb250aW51ZVxyXG4gICAgICAgIGhhc0F0TGVhc3QxTWF0Y2ggPSB0cnVlXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYocmVzdWx0ID09PSBOVUxMKSB7cmVzZXROZXh0QmVnaW5uaW5nSW5kZXhlcygpOyByZXR1cm4gTlVMTH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgbm90IHRoZSBsYXN0IHNlYXJjaCwgd2UgbmVlZCB0byBtdXRhdGUgX25leHRCZWdpbm5pbmdJbmRleGVzIGZvciB0aGUgbmV4dCBzZWFyY2hcclxuICAgICAgdmFyIGlzVGhlTGFzdFNlYXJjaCA9IGkgPT09IHNlYXJjaGVzTGVuIC0gMVxyXG4gICAgICBpZighaXNUaGVMYXN0U2VhcmNoKSB7XHJcbiAgICAgICAgdmFyIGluZGV4ZXMgPSByZXN1bHQuX2luZGV4ZXNcclxuXHJcbiAgICAgICAgdmFyIGluZGV4ZXNJc0NvbnNlY3V0aXZlU3Vic3RyaW5nID0gdHJ1ZVxyXG4gICAgICAgIGZvcihsZXQgaT0wOyBpPGluZGV4ZXMubGVuLTE7IGkrKykge1xyXG4gICAgICAgICAgaWYoaW5kZXhlc1tpKzFdIC0gaW5kZXhlc1tpXSAhPT0gMSkge1xyXG4gICAgICAgICAgICBpbmRleGVzSXNDb25zZWN1dGl2ZVN1YnN0cmluZyA9IGZhbHNlOyBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGluZGV4ZXNJc0NvbnNlY3V0aXZlU3Vic3RyaW5nKSB7XHJcbiAgICAgICAgICB2YXIgbmV3QmVnaW5uaW5nSW5kZXggPSBpbmRleGVzW2luZGV4ZXMubGVuLTFdICsgMVxyXG4gICAgICAgICAgdmFyIHRvUmVwbGFjZSA9IHRhcmdldC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNbbmV3QmVnaW5uaW5nSW5kZXgtMV1cclxuICAgICAgICAgIGZvcihsZXQgaT1uZXdCZWdpbm5pbmdJbmRleC0xOyBpPj0wOyBpLS0pIHtcclxuICAgICAgICAgICAgaWYodG9SZXBsYWNlICE9PSB0YXJnZXQuX25leHRCZWdpbm5pbmdJbmRleGVzW2ldKSBicmVha1xyXG4gICAgICAgICAgICB0YXJnZXQuX25leHRCZWdpbm5pbmdJbmRleGVzW2ldID0gbmV3QmVnaW5uaW5nSW5kZXhcclxuICAgICAgICAgICAgbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzW2NoYW5nZXNsZW4qMiArIDBdID0gaVxyXG4gICAgICAgICAgICBuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXNbY2hhbmdlc2xlbioyICsgMV0gPSB0b1JlcGxhY2VcclxuICAgICAgICAgICAgY2hhbmdlc2xlbisrXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBzY29yZSArPSByZXN1bHQuX3Njb3JlIC8gc2VhcmNoZXNMZW5cclxuICAgICAgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0gPSByZXN1bHQuX3Njb3JlIC8gc2VhcmNoZXNMZW5cclxuXHJcbiAgICAgIC8vIGRvY2sgcG9pbnRzIGJhc2VkIG9uIG9yZGVyIG90aGVyd2lzZSBcImMgbWFuXCIgcmV0dXJucyBNYW5pZmVzdC5jcHAgaW5zdGVhZCBvZiBDaGVhdE1hbmFnZXIuaFxyXG4gICAgICBpZihyZXN1bHQuX2luZGV4ZXNbMF0gPCBmaXJzdF9zZWVuX2luZGV4X2xhc3Rfc2VhcmNoKSB7XHJcbiAgICAgICAgc2NvcmUgLT0gKGZpcnN0X3NlZW5faW5kZXhfbGFzdF9zZWFyY2ggLSByZXN1bHQuX2luZGV4ZXNbMF0pICogMlxyXG4gICAgICB9XHJcbiAgICAgIGZpcnN0X3NlZW5faW5kZXhfbGFzdF9zZWFyY2ggPSByZXN1bHQuX2luZGV4ZXNbMF1cclxuXHJcbiAgICAgIGZvcih2YXIgaj0wOyBqPHJlc3VsdC5faW5kZXhlcy5sZW47ICsraikgc2Vlbl9pbmRleGVzLmFkZChyZXN1bHQuX2luZGV4ZXNbal0pXHJcbiAgICB9XHJcblxyXG4gICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2ggJiYgIWhhc0F0TGVhc3QxTWF0Y2gpIHJldHVybiBOVUxMXHJcblxyXG4gICAgcmVzZXROZXh0QmVnaW5uaW5nSW5kZXhlcygpXHJcblxyXG4gICAgLy8gYWxsb3dzIGEgc2VhcmNoIHdpdGggc3BhY2VzIHRoYXQncyBhbiBleGFjdCBzdWJzdHJpbmcgdG8gc2NvcmUgd2VsbFxyXG4gICAgdmFyIGFsbG93U3BhY2VzUmVzdWx0ID0gYWxnb3JpdGhtKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQsIC8qYWxsb3dTcGFjZXM9Ki90cnVlKVxyXG4gICAgaWYoYWxsb3dTcGFjZXNSZXN1bHQgIT09IE5VTEwgJiYgYWxsb3dTcGFjZXNSZXN1bHQuX3Njb3JlID4gc2NvcmUpIHtcclxuICAgICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2gpIHtcclxuICAgICAgICBmb3IodmFyIGk9MDsgaTxzZWFyY2hlc0xlbjsgKytpKSB7XHJcbiAgICAgICAgICBhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA9IGFsbG93U3BhY2VzUmVzdWx0Ll9zY29yZSAvIHNlYXJjaGVzTGVuXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhbGxvd1NwYWNlc1Jlc3VsdFxyXG4gICAgfVxyXG5cclxuICAgIGlmKGFsbG93UGFydGlhbE1hdGNoKSByZXN1bHQgPSB0YXJnZXRcclxuICAgIHJlc3VsdC5fc2NvcmUgPSBzY29yZVxyXG5cclxuICAgIHZhciBpID0gMFxyXG4gICAgZm9yIChsZXQgaW5kZXggb2Ygc2Vlbl9pbmRleGVzKSByZXN1bHQuX2luZGV4ZXNbaSsrXSA9IGluZGV4XHJcbiAgICByZXN1bHQuX2luZGV4ZXMubGVuID0gaVxyXG5cclxuICAgIHJldHVybiByZXN1bHRcclxuICB9XHJcblxyXG4gIC8vIHdlIHVzZSB0aGlzIGluc3RlYWQgb2YganVzdCAubm9ybWFsaXplKCdORkQnKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCAnJykgYmVjYXVzZSB0aGF0IHNjcmV3cyB3aXRoIGphcGFuZXNlIGNoYXJhY3RlcnNcclxuICB2YXIgcmVtb3ZlX2FjY2VudHMgPSAoc3RyKSA9PiBzdHIucmVwbGFjZSgvXFxwe1NjcmlwdD1MYXRpbn0rL2d1LCBtYXRjaCA9PiBtYXRjaC5ub3JtYWxpemUoJ05GRCcpKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCAnJylcclxuXHJcbiAgdmFyIHByZXBhcmVMb3dlckluZm8gPSAoc3RyKSA9PiB7XHJcbiAgICBzdHIgPSByZW1vdmVfYWNjZW50cyhzdHIpXHJcbiAgICB2YXIgc3RyTGVuID0gc3RyLmxlbmd0aFxyXG4gICAgdmFyIGxvd2VyID0gc3RyLnRvTG93ZXJDYXNlKClcclxuICAgIHZhciBsb3dlckNvZGVzID0gW10gLy8gbmV3IEFycmF5KHN0ckxlbikgICAgc3BhcnNlIGFycmF5IGlzIHRvbyBzbG93XHJcbiAgICB2YXIgYml0ZmxhZ3MgPSAwXHJcbiAgICB2YXIgY29udGFpbnNTcGFjZSA9IGZhbHNlIC8vIHNwYWNlIGlzbid0IHN0b3JlZCBpbiBiaXRmbGFncyBiZWNhdXNlIG9mIGhvdyBzZWFyY2hpbmcgd2l0aCBhIHNwYWNlIHdvcmtzXHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHN0ckxlbjsgKytpKSB7XHJcbiAgICAgIHZhciBsb3dlckNvZGUgPSBsb3dlckNvZGVzW2ldID0gbG93ZXIuY2hhckNvZGVBdChpKVxyXG5cclxuICAgICAgaWYobG93ZXJDb2RlID09PSAzMikge1xyXG4gICAgICAgIGNvbnRhaW5zU3BhY2UgPSB0cnVlXHJcbiAgICAgICAgY29udGludWUgLy8gaXQncyBpbXBvcnRhbnQgdGhhdCB3ZSBkb24ndCBzZXQgYW55IGJpdGZsYWdzIGZvciBzcGFjZVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgYml0ID0gbG93ZXJDb2RlPj05NyYmbG93ZXJDb2RlPD0xMjIgPyBsb3dlckNvZGUtOTcgLy8gYWxwaGFiZXRcclxuICAgICAgICAgICAgICA6IGxvd2VyQ29kZT49NDgmJmxvd2VyQ29kZTw9NTcgID8gMjYgICAgICAgICAgIC8vIG51bWJlcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDMgYml0cyBhdmFpbGFibGVcclxuICAgICAgICAgICAgICA6IGxvd2VyQ29kZTw9MTI3ICAgICAgICAgICAgICAgID8gMzAgICAgICAgICAgIC8vIG90aGVyIGFzY2lpXHJcbiAgICAgICAgICAgICAgOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDMxICAgICAgICAgICAvLyBvdGhlciB1dGY4XHJcbiAgICAgIGJpdGZsYWdzIHw9IDE8PGJpdFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7bG93ZXJDb2Rlczpsb3dlckNvZGVzLCBiaXRmbGFnczpiaXRmbGFncywgY29udGFpbnNTcGFjZTpjb250YWluc1NwYWNlLCBfbG93ZXI6bG93ZXJ9XHJcbiAgfVxyXG4gIHZhciBwcmVwYXJlQmVnaW5uaW5nSW5kZXhlcyA9ICh0YXJnZXQpID0+IHtcclxuICAgIHZhciB0YXJnZXRMZW4gPSB0YXJnZXQubGVuZ3RoXHJcbiAgICB2YXIgYmVnaW5uaW5nSW5kZXhlcyA9IFtdOyB2YXIgYmVnaW5uaW5nSW5kZXhlc0xlbiA9IDBcclxuICAgIHZhciB3YXNVcHBlciA9IGZhbHNlXHJcbiAgICB2YXIgd2FzQWxwaGFudW0gPSBmYWxzZVxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldExlbjsgKytpKSB7XHJcbiAgICAgIHZhciB0YXJnZXRDb2RlID0gdGFyZ2V0LmNoYXJDb2RlQXQoaSlcclxuICAgICAgdmFyIGlzVXBwZXIgPSB0YXJnZXRDb2RlPj02NSYmdGFyZ2V0Q29kZTw9OTBcclxuICAgICAgdmFyIGlzQWxwaGFudW0gPSBpc1VwcGVyIHx8IHRhcmdldENvZGU+PTk3JiZ0YXJnZXRDb2RlPD0xMjIgfHwgdGFyZ2V0Q29kZT49NDgmJnRhcmdldENvZGU8PTU3XHJcbiAgICAgIHZhciBpc0JlZ2lubmluZyA9IGlzVXBwZXIgJiYgIXdhc1VwcGVyIHx8ICF3YXNBbHBoYW51bSB8fCAhaXNBbHBoYW51bVxyXG4gICAgICB3YXNVcHBlciA9IGlzVXBwZXJcclxuICAgICAgd2FzQWxwaGFudW0gPSBpc0FscGhhbnVtXHJcbiAgICAgIGlmKGlzQmVnaW5uaW5nKSBiZWdpbm5pbmdJbmRleGVzW2JlZ2lubmluZ0luZGV4ZXNMZW4rK10gPSBpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gYmVnaW5uaW5nSW5kZXhlc1xyXG4gIH1cclxuICB2YXIgcHJlcGFyZU5leHRCZWdpbm5pbmdJbmRleGVzID0gKHRhcmdldCkgPT4ge1xyXG4gICAgdGFyZ2V0ID0gcmVtb3ZlX2FjY2VudHModGFyZ2V0KVxyXG4gICAgdmFyIHRhcmdldExlbiA9IHRhcmdldC5sZW5ndGhcclxuICAgIHZhciBiZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZUJlZ2lubmluZ0luZGV4ZXModGFyZ2V0KVxyXG4gICAgdmFyIG5leHRCZWdpbm5pbmdJbmRleGVzID0gW10gLy8gbmV3IEFycmF5KHRhcmdldExlbikgICAgIHNwYXJzZSBhcnJheSBpcyB0b28gc2xvd1xyXG4gICAgdmFyIGxhc3RJc0JlZ2lubmluZyA9IGJlZ2lubmluZ0luZGV4ZXNbMF1cclxuICAgIHZhciBsYXN0SXNCZWdpbm5pbmdJID0gMFxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldExlbjsgKytpKSB7XHJcbiAgICAgIGlmKGxhc3RJc0JlZ2lubmluZyA+IGkpIHtcclxuICAgICAgICBuZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSA9IGxhc3RJc0JlZ2lubmluZ1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxhc3RJc0JlZ2lubmluZyA9IGJlZ2lubmluZ0luZGV4ZXNbKytsYXN0SXNCZWdpbm5pbmdJXVxyXG4gICAgICAgIG5leHRCZWdpbm5pbmdJbmRleGVzW2ldID0gbGFzdElzQmVnaW5uaW5nPT09dW5kZWZpbmVkID8gdGFyZ2V0TGVuIDogbGFzdElzQmVnaW5uaW5nXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBuZXh0QmVnaW5uaW5nSW5kZXhlc1xyXG4gIH1cclxuXHJcbiAgdmFyIHByZXBhcmVkQ2FjaGUgICAgICAgPSBuZXcgTWFwKClcclxuICB2YXIgcHJlcGFyZWRTZWFyY2hDYWNoZSA9IG5ldyBNYXAoKVxyXG5cclxuICAvLyB0aGUgdGhlb3J5IGJlaGluZCB0aGVzZSBiZWluZyBnbG9iYWxzIGlzIHRvIHJlZHVjZSBnYXJiYWdlIGNvbGxlY3Rpb24gYnkgbm90IG1ha2luZyBuZXcgYXJyYXlzXHJcbiAgdmFyIG1hdGNoZXNTaW1wbGUgPSBbXTsgdmFyIG1hdGNoZXNTdHJpY3QgPSBbXVxyXG4gIHZhciBuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXMgPSBbXSAvLyBhbGxvd3Mgc3RyYXcgYmVycnkgdG8gbWF0Y2ggc3RyYXdiZXJyeSB3ZWxsLCBieSBtb2RpZnlpbmcgdGhlIGVuZCBvZiBhIHN1YnN0cmluZyB0byBiZSBjb25zaWRlcmVkIGEgYmVnaW5uaW5nIGluZGV4IGZvciB0aGUgcmVzdCBvZiB0aGUgc2VhcmNoXHJcbiAgdmFyIGtleXNTcGFjZXNCZXN0U2NvcmVzID0gW107IHZhciBhbGxvd1BhcnRpYWxNYXRjaFNjb3JlcyA9IFtdXHJcbiAgdmFyIHRtcFRhcmdldHMgPSBbXTsgdmFyIHRtcFJlc3VsdHMgPSBbXVxyXG5cclxuICAvLyBwcm9wID0gJ2tleScgICAgICAgICAgICAgICAgICAyLjVtcyBvcHRpbWl6ZWQgZm9yIHRoaXMgY2FzZSwgc2VlbXMgdG8gYmUgYWJvdXQgYXMgZmFzdCBhcyBkaXJlY3Qgb2JqW3Byb3BdXHJcbiAgLy8gcHJvcCA9ICdrZXkxLmtleTInICAgICAgICAgICAgMTBtc1xyXG4gIC8vIHByb3AgPSBbJ2tleTEnLCAna2V5MiddICAgICAgIDI3bXNcclxuICAvLyBwcm9wID0gb2JqID0+IG9iai50YWdzLmpvaW4oKSA/P21zXHJcbiAgdmFyIGdldFZhbHVlID0gKG9iaiwgcHJvcCkgPT4ge1xyXG4gICAgdmFyIHRtcCA9IG9ialtwcm9wXTsgaWYodG1wICE9PSB1bmRlZmluZWQpIHJldHVybiB0bXBcclxuICAgIGlmKHR5cGVvZiBwcm9wID09PSAnZnVuY3Rpb24nKSByZXR1cm4gcHJvcChvYmopIC8vIHRoaXMgc2hvdWxkIHJ1biBmaXJzdC4gYnV0IHRoYXQgbWFrZXMgc3RyaW5nIHByb3BzIHNsb3dlclxyXG4gICAgdmFyIHNlZ3MgPSBwcm9wXHJcbiAgICBpZighQXJyYXkuaXNBcnJheShwcm9wKSkgc2VncyA9IHByb3Auc3BsaXQoJy4nKVxyXG4gICAgdmFyIGxlbiA9IHNlZ3MubGVuZ3RoXHJcbiAgICB2YXIgaSA9IC0xXHJcbiAgICB3aGlsZSAob2JqICYmICgrK2kgPCBsZW4pKSBvYmogPSBvYmpbc2Vnc1tpXV1cclxuICAgIHJldHVybiBvYmpcclxuICB9XHJcblxyXG4gIHZhciBpc1ByZXBhcmVkID0gKHgpID0+IHsgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgeC5fYml0ZmxhZ3MgPT09ICdudW1iZXInIH1cclxuICB2YXIgSU5GSU5JVFkgPSBJbmZpbml0eTsgdmFyIE5FR0FUSVZFX0lORklOSVRZID0gLUlORklOSVRZXHJcbiAgdmFyIG5vUmVzdWx0cyA9IFtdOyBub1Jlc3VsdHMudG90YWwgPSAwXHJcbiAgdmFyIE5VTEwgPSBudWxsXHJcblxyXG4gIHZhciBub1RhcmdldCA9IHByZXBhcmUoJycpXHJcblxyXG4gIC8vIEhhY2tlZCB2ZXJzaW9uIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9sZW1pcmUvRmFzdFByaW9yaXR5UXVldWUuanNcclxuICB2YXIgZmFzdHByaW9yaXR5cXVldWU9cj0+e3ZhciBlPVtdLG89MCxhPXt9LHY9cj0+e2Zvcih2YXIgYT0wLHY9ZVthXSxjPTE7YzxvOyl7dmFyIHM9YysxO2E9YyxzPG8mJmVbc10uX3Njb3JlPGVbY10uX3Njb3JlJiYoYT1zKSxlW2EtMT4+MV09ZVthXSxjPTErKGE8PDEpfWZvcih2YXIgZj1hLTE+PjE7YT4wJiZ2Ll9zY29yZTxlW2ZdLl9zY29yZTtmPShhPWYpLTE+PjEpZVthXT1lW2ZdO2VbYV09dn07cmV0dXJuIGEuYWRkPShyPT57dmFyIGE9bztlW28rK109cjtmb3IodmFyIHY9YS0xPj4xO2E+MCYmci5fc2NvcmU8ZVt2XS5fc2NvcmU7dj0oYT12KS0xPj4xKWVbYV09ZVt2XTtlW2FdPXJ9KSxhLnBvbGw9KHI9PntpZigwIT09byl7dmFyIGE9ZVswXTtyZXR1cm4gZVswXT1lWy0tb10sdigpLGF9fSksYS5wZWVrPShyPT57aWYoMCE9PW8pcmV0dXJuIGVbMF19KSxhLnJlcGxhY2VUb3A9KHI9PntlWzBdPXIsdigpfSksYX1cclxuICB2YXIgcSA9IGZhc3Rwcmlvcml0eXF1ZXVlKCkgLy8gcmV1c2UgdGhpc1xyXG5cclxuICAvLyBmdXp6eXNvcnQgaXMgd3JpdHRlbiB0aGlzIHdheSBmb3IgbWluaWZpY2F0aW9uLiBhbGwgbmFtZXMgYXJlIG1hbmdlbGVkIHVubGVzcyBxdW90ZWRcclxuICByZXR1cm4geydzaW5nbGUnOnNpbmdsZSwgJ2dvJzpnbywgJ3ByZXBhcmUnOnByZXBhcmUsICdjbGVhbnVwJzpjbGVhbnVwfVxyXG59KSAvLyBVTURcclxuIiwgIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDE3IEdvb2dsZSBMTENcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBCU0QtMy1DbGF1c2VcbiAqL1xuXG4vLyBJTVBPUlRBTlQ6IHRoZXNlIGltcG9ydHMgbXVzdCBiZSB0eXBlLW9ubHlcbmltcG9ydCB0eXBlIHtEaXJlY3RpdmUsIERpcmVjdGl2ZVJlc3VsdCwgUGFydEluZm99IGZyb20gJy4vZGlyZWN0aXZlLmpzJztcbmltcG9ydCB0eXBlIHtUcnVzdGVkSFRNTCwgVHJ1c3RlZFR5cGVzV2luZG93fSBmcm9tICd0cnVzdGVkLXR5cGVzL2xpYic7XG5cbmNvbnN0IERFVl9NT0RFID0gdHJ1ZTtcbmNvbnN0IEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUyA9IHRydWU7XG5jb25zdCBFTkFCTEVfU0hBRFlET01fTk9QQVRDSCA9IHRydWU7XG5jb25zdCBOT0RFX01PREUgPSBmYWxzZTtcblxuLy8gQWxsb3dzIG1pbmlmaWVycyB0byByZW5hbWUgcmVmZXJlbmNlcyB0byBnbG9iYWxUaGlzXG5jb25zdCBnbG9iYWwgPSBnbG9iYWxUaGlzO1xuXG4vKipcbiAqIENvbnRhaW5zIHR5cGVzIHRoYXQgYXJlIHBhcnQgb2YgdGhlIHVuc3RhYmxlIGRlYnVnIEFQSS5cbiAqXG4gKiBFdmVyeXRoaW5nIGluIHRoaXMgQVBJIGlzIG5vdCBzdGFibGUgYW5kIG1heSBjaGFuZ2Ugb3IgYmUgcmVtb3ZlZCBpbiB0aGUgZnV0dXJlLFxuICogZXZlbiBvbiBwYXRjaCByZWxlYXNlcy5cbiAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1uYW1lc3BhY2VcbmV4cG9ydCBuYW1lc3BhY2UgTGl0VW5zdGFibGUge1xuICAvKipcbiAgICogV2hlbiBMaXQgaXMgcnVubmluZyBpbiBkZXYgbW9kZSBhbmQgYHdpbmRvdy5lbWl0TGl0RGVidWdMb2dFdmVudHNgIGlzIHRydWUsXG4gICAqIHdlIHdpbGwgZW1pdCAnbGl0LWRlYnVnJyBldmVudHMgdG8gd2luZG93LCB3aXRoIGxpdmUgZGV0YWlscyBhYm91dCB0aGUgdXBkYXRlIGFuZCByZW5kZXJcbiAgICogbGlmZWN5Y2xlLiBUaGVzZSBjYW4gYmUgdXNlZnVsIGZvciB3cml0aW5nIGRlYnVnIHRvb2xpbmcgYW5kIHZpc3VhbGl6YXRpb25zLlxuICAgKlxuICAgKiBQbGVhc2UgYmUgYXdhcmUgdGhhdCBydW5uaW5nIHdpdGggd2luZG93LmVtaXRMaXREZWJ1Z0xvZ0V2ZW50cyBoYXMgcGVyZm9ybWFuY2Ugb3ZlcmhlYWQsXG4gICAqIG1ha2luZyBjZXJ0YWluIG9wZXJhdGlvbnMgdGhhdCBhcmUgbm9ybWFsbHkgdmVyeSBjaGVhcCAobGlrZSBhIG5vLW9wIHJlbmRlcikgbXVjaCBzbG93ZXIsXG4gICAqIGJlY2F1c2Ugd2UgbXVzdCBjb3B5IGRhdGEgYW5kIGRpc3BhdGNoIGV2ZW50cy5cbiAgICovXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbmFtZXNwYWNlXG4gIGV4cG9ydCBuYW1lc3BhY2UgRGVidWdMb2cge1xuICAgIGV4cG9ydCB0eXBlIEVudHJ5ID1cbiAgICAgIHwgVGVtcGxhdGVQcmVwXG4gICAgICB8IFRlbXBsYXRlSW5zdGFudGlhdGVkXG4gICAgICB8IFRlbXBsYXRlSW5zdGFudGlhdGVkQW5kVXBkYXRlZFxuICAgICAgfCBUZW1wbGF0ZVVwZGF0aW5nXG4gICAgICB8IEJlZ2luUmVuZGVyXG4gICAgICB8IEVuZFJlbmRlclxuICAgICAgfCBDb21taXRQYXJ0RW50cnlcbiAgICAgIHwgU2V0UGFydFZhbHVlO1xuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVQcmVwIHtcbiAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBwcmVwJztcbiAgICAgIHRlbXBsYXRlOiBUZW1wbGF0ZTtcbiAgICAgIHN0cmluZ3M6IFRlbXBsYXRlU3RyaW5nc0FycmF5O1xuICAgICAgY2xvbmFibGVUZW1wbGF0ZTogSFRNTFRlbXBsYXRlRWxlbWVudDtcbiAgICAgIHBhcnRzOiBUZW1wbGF0ZVBhcnRbXTtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBCZWdpblJlbmRlciB7XG4gICAgICBraW5kOiAnYmVnaW4gcmVuZGVyJztcbiAgICAgIGlkOiBudW1iZXI7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50O1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIHBhcnQ6IENoaWxkUGFydCB8IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBFbmRSZW5kZXIge1xuICAgICAga2luZDogJ2VuZCByZW5kZXInO1xuICAgICAgaWQ6IG51bWJlcjtcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgY29udGFpbmVyOiBIVE1MRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQ7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgcGFydDogQ2hpbGRQYXJ0O1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlSW5zdGFudGlhdGVkIHtcbiAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBpbnN0YW50aWF0ZWQnO1xuICAgICAgdGVtcGxhdGU6IFRlbXBsYXRlIHwgQ29tcGlsZWRUZW1wbGF0ZTtcbiAgICAgIGluc3RhbmNlOiBUZW1wbGF0ZUluc3RhbmNlO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIGZyYWdtZW50OiBOb2RlO1xuICAgICAgcGFydHM6IEFycmF5PFBhcnQgfCB1bmRlZmluZWQ+O1xuICAgICAgdmFsdWVzOiB1bmtub3duW107XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVJbnN0YW50aWF0ZWRBbmRVcGRhdGVkIHtcbiAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBpbnN0YW50aWF0ZWQgYW5kIHVwZGF0ZWQnO1xuICAgICAgdGVtcGxhdGU6IFRlbXBsYXRlIHwgQ29tcGlsZWRUZW1wbGF0ZTtcbiAgICAgIGluc3RhbmNlOiBUZW1wbGF0ZUluc3RhbmNlO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIGZyYWdtZW50OiBOb2RlO1xuICAgICAgcGFydHM6IEFycmF5PFBhcnQgfCB1bmRlZmluZWQ+O1xuICAgICAgdmFsdWVzOiB1bmtub3duW107XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVVcGRhdGluZyB7XG4gICAgICBraW5kOiAndGVtcGxhdGUgdXBkYXRpbmcnO1xuICAgICAgdGVtcGxhdGU6IFRlbXBsYXRlIHwgQ29tcGlsZWRUZW1wbGF0ZTtcbiAgICAgIGluc3RhbmNlOiBUZW1wbGF0ZUluc3RhbmNlO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIHBhcnRzOiBBcnJheTxQYXJ0IHwgdW5kZWZpbmVkPjtcbiAgICAgIHZhbHVlczogdW5rbm93bltdO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIFNldFBhcnRWYWx1ZSB7XG4gICAgICBraW5kOiAnc2V0IHBhcnQnO1xuICAgICAgcGFydDogUGFydDtcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgdmFsdWVJbmRleDogbnVtYmVyO1xuICAgICAgdmFsdWVzOiB1bmtub3duW107XG4gICAgICB0ZW1wbGF0ZUluc3RhbmNlOiBUZW1wbGF0ZUluc3RhbmNlO1xuICAgIH1cblxuICAgIGV4cG9ydCB0eXBlIENvbW1pdFBhcnRFbnRyeSA9XG4gICAgICB8IENvbW1pdE5vdGhpbmdUb0NoaWxkRW50cnlcbiAgICAgIHwgQ29tbWl0VGV4dFxuICAgICAgfCBDb21taXROb2RlXG4gICAgICB8IENvbW1pdEF0dHJpYnV0ZVxuICAgICAgfCBDb21taXRQcm9wZXJ0eVxuICAgICAgfCBDb21taXRCb29sZWFuQXR0cmlidXRlXG4gICAgICB8IENvbW1pdEV2ZW50TGlzdGVuZXJcbiAgICAgIHwgQ29tbWl0VG9FbGVtZW50QmluZGluZztcblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0Tm90aGluZ1RvQ2hpbGRFbnRyeSB7XG4gICAgICBraW5kOiAnY29tbWl0IG5vdGhpbmcgdG8gY2hpbGQnO1xuICAgICAgc3RhcnQ6IENoaWxkTm9kZTtcbiAgICAgIGVuZDogQ2hpbGROb2RlIHwgbnVsbDtcbiAgICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUgfCB1bmRlZmluZWQ7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0VGV4dCB7XG4gICAgICBraW5kOiAnY29tbWl0IHRleHQnO1xuICAgICAgbm9kZTogVGV4dDtcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdE5vZGUge1xuICAgICAga2luZDogJ2NvbW1pdCBub2RlJztcbiAgICAgIHN0YXJ0OiBOb2RlO1xuICAgICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSB8IHVuZGVmaW5lZDtcbiAgICAgIHZhbHVlOiBOb2RlO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdEF0dHJpYnV0ZSB7XG4gICAgICBraW5kOiAnY29tbWl0IGF0dHJpYnV0ZSc7XG4gICAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0UHJvcGVydHkge1xuICAgICAga2luZDogJ2NvbW1pdCBwcm9wZXJ0eSc7XG4gICAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0Qm9vbGVhbkF0dHJpYnV0ZSB7XG4gICAgICBraW5kOiAnY29tbWl0IGJvb2xlYW4gYXR0cmlidXRlJztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICB2YWx1ZTogYm9vbGVhbjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRFdmVudExpc3RlbmVyIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgZXZlbnQgbGlzdGVuZXInO1xuICAgICAgZWxlbWVudDogRWxlbWVudDtcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgb2xkTGlzdGVuZXI6IHVua25vd247XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgLy8gVHJ1ZSBpZiB3ZSdyZSByZW1vdmluZyB0aGUgb2xkIGV2ZW50IGxpc3RlbmVyIChlLmcuIGJlY2F1c2Ugc2V0dGluZ3MgY2hhbmdlZCwgb3IgdmFsdWUgaXMgbm90aGluZylcbiAgICAgIHJlbW92ZUxpc3RlbmVyOiBib29sZWFuO1xuICAgICAgLy8gVHJ1ZSBpZiB3ZSdyZSBhZGRpbmcgYSBuZXcgZXZlbnQgbGlzdGVuZXIgKGUuZy4gYmVjYXVzZSBmaXJzdCByZW5kZXIsIG9yIHNldHRpbmdzIGNoYW5nZWQpXG4gICAgICBhZGRMaXN0ZW5lcjogYm9vbGVhbjtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdFRvRWxlbWVudEJpbmRpbmcge1xuICAgICAga2luZDogJ2NvbW1pdCB0byBlbGVtZW50IGJpbmRpbmcnO1xuICAgICAgZWxlbWVudDogRWxlbWVudDtcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cbn1cblxuaW50ZXJmYWNlIERlYnVnTG9nZ2luZ1dpbmRvdyB7XG4gIC8vIEV2ZW4gaW4gZGV2IG1vZGUsIHdlIGdlbmVyYWxseSBkb24ndCB3YW50IHRvIGVtaXQgdGhlc2UgZXZlbnRzLCBhcyB0aGF0J3NcbiAgLy8gYW5vdGhlciBsZXZlbCBvZiBjb3N0LCBzbyBvbmx5IGVtaXQgdGhlbSB3aGVuIERFVl9NT0RFIGlzIHRydWUgX2FuZF8gd2hlblxuICAvLyB3aW5kb3cuZW1pdExpdERlYnVnRXZlbnRzIGlzIHRydWUuXG4gIGVtaXRMaXREZWJ1Z0xvZ0V2ZW50cz86IGJvb2xlYW47XG59XG5cbi8qKlxuICogVXNlZnVsIGZvciB2aXN1YWxpemluZyBhbmQgbG9nZ2luZyBpbnNpZ2h0cyBpbnRvIHdoYXQgdGhlIExpdCB0ZW1wbGF0ZSBzeXN0ZW0gaXMgZG9pbmcuXG4gKlxuICogQ29tcGlsZWQgb3V0IG9mIHByb2QgbW9kZSBidWlsZHMuXG4gKi9cbmNvbnN0IGRlYnVnTG9nRXZlbnQgPSBERVZfTU9ERVxuICA/IChldmVudDogTGl0VW5zdGFibGUuRGVidWdMb2cuRW50cnkpID0+IHtcbiAgICAgIGNvbnN0IHNob3VsZEVtaXQgPSAoZ2xvYmFsIGFzIHVua25vd24gYXMgRGVidWdMb2dnaW5nV2luZG93KVxuICAgICAgICAuZW1pdExpdERlYnVnTG9nRXZlbnRzO1xuICAgICAgaWYgKCFzaG91bGRFbWl0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGdsb2JhbC5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQ8TGl0VW5zdGFibGUuRGVidWdMb2cuRW50cnk+KCdsaXQtZGVidWcnLCB7XG4gICAgICAgICAgZGV0YWlsOiBldmVudCxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICA6IHVuZGVmaW5lZDtcbi8vIFVzZWQgZm9yIGNvbm5lY3RpbmcgYmVnaW5SZW5kZXIgYW5kIGVuZFJlbmRlciBldmVudHMgd2hlbiB0aGVyZSBhcmUgbmVzdGVkXG4vLyByZW5kZXJzIHdoZW4gZXJyb3JzIGFyZSB0aHJvd24gcHJldmVudGluZyBhbiBlbmRSZW5kZXIgZXZlbnQgZnJvbSBiZWluZ1xuLy8gY2FsbGVkLlxubGV0IGRlYnVnTG9nUmVuZGVySWQgPSAwO1xuXG5sZXQgaXNzdWVXYXJuaW5nOiAoY29kZTogc3RyaW5nLCB3YXJuaW5nOiBzdHJpbmcpID0+IHZvaWQ7XG5cbmlmIChERVZfTU9ERSkge1xuICBnbG9iYWwubGl0SXNzdWVkV2FybmluZ3MgPz89IG5ldyBTZXQoKTtcblxuICAvLyBJc3N1ZSBhIHdhcm5pbmcsIGlmIHdlIGhhdmVuJ3QgYWxyZWFkeS5cbiAgaXNzdWVXYXJuaW5nID0gKGNvZGU6IHN0cmluZywgd2FybmluZzogc3RyaW5nKSA9PiB7XG4gICAgd2FybmluZyArPSBjb2RlXG4gICAgICA/IGAgU2VlIGh0dHBzOi8vbGl0LmRldi9tc2cvJHtjb2RlfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gXG4gICAgICA6ICcnO1xuICAgIGlmICghZ2xvYmFsLmxpdElzc3VlZFdhcm5pbmdzIS5oYXMod2FybmluZykpIHtcbiAgICAgIGNvbnNvbGUud2Fybih3YXJuaW5nKTtcbiAgICAgIGdsb2JhbC5saXRJc3N1ZWRXYXJuaW5ncyEuYWRkKHdhcm5pbmcpO1xuICAgIH1cbiAgfTtcblxuICBpc3N1ZVdhcm5pbmcoXG4gICAgJ2Rldi1tb2RlJyxcbiAgICBgTGl0IGlzIGluIGRldiBtb2RlLiBOb3QgcmVjb21tZW5kZWQgZm9yIHByb2R1Y3Rpb24hYFxuICApO1xufVxuXG5jb25zdCB3cmFwID1cbiAgRU5BQkxFX1NIQURZRE9NX05PUEFUQ0ggJiZcbiAgZ2xvYmFsLlNoYWR5RE9NPy5pblVzZSAmJlxuICBnbG9iYWwuU2hhZHlET00/Lm5vUGF0Y2ggPT09IHRydWVcbiAgICA/IChnbG9iYWwuU2hhZHlET00hLndyYXAgYXMgPFQgZXh0ZW5kcyBOb2RlPihub2RlOiBUKSA9PiBUKVxuICAgIDogPFQgZXh0ZW5kcyBOb2RlPihub2RlOiBUKSA9PiBub2RlO1xuXG5jb25zdCB0cnVzdGVkVHlwZXMgPSAoZ2xvYmFsIGFzIHVua25vd24gYXMgVHJ1c3RlZFR5cGVzV2luZG93KS50cnVzdGVkVHlwZXM7XG5cbi8qKlxuICogT3VyIFRydXN0ZWRUeXBlUG9saWN5IGZvciBIVE1MIHdoaWNoIGlzIGRlY2xhcmVkIHVzaW5nIHRoZSBodG1sIHRlbXBsYXRlXG4gKiB0YWcgZnVuY3Rpb24uXG4gKlxuICogVGhhdCBIVE1MIGlzIGEgZGV2ZWxvcGVyLWF1dGhvcmVkIGNvbnN0YW50LCBhbmQgaXMgcGFyc2VkIHdpdGggaW5uZXJIVE1MXG4gKiBiZWZvcmUgYW55IHVudHJ1c3RlZCBleHByZXNzaW9ucyBoYXZlIGJlZW4gbWl4ZWQgaW4uIFRoZXJlZm9yIGl0IGlzXG4gKiBjb25zaWRlcmVkIHNhZmUgYnkgY29uc3RydWN0aW9uLlxuICovXG5jb25zdCBwb2xpY3kgPSB0cnVzdGVkVHlwZXNcbiAgPyB0cnVzdGVkVHlwZXMuY3JlYXRlUG9saWN5KCdsaXQtaHRtbCcsIHtcbiAgICAgIGNyZWF0ZUhUTUw6IChzKSA9PiBzLFxuICAgIH0pXG4gIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFVzZWQgdG8gc2FuaXRpemUgYW55IHZhbHVlIGJlZm9yZSBpdCBpcyB3cml0dGVuIGludG8gdGhlIERPTS4gVGhpcyBjYW4gYmVcbiAqIHVzZWQgdG8gaW1wbGVtZW50IGEgc2VjdXJpdHkgcG9saWN5IG9mIGFsbG93ZWQgYW5kIGRpc2FsbG93ZWQgdmFsdWVzIGluXG4gKiBvcmRlciB0byBwcmV2ZW50IFhTUyBhdHRhY2tzLlxuICpcbiAqIE9uZSB3YXkgb2YgdXNpbmcgdGhpcyBjYWxsYmFjayB3b3VsZCBiZSB0byBjaGVjayBhdHRyaWJ1dGVzIGFuZCBwcm9wZXJ0aWVzXG4gKiBhZ2FpbnN0IGEgbGlzdCBvZiBoaWdoIHJpc2sgZmllbGRzLCBhbmQgcmVxdWlyZSB0aGF0IHZhbHVlcyB3cml0dGVuIHRvIHN1Y2hcbiAqIGZpZWxkcyBiZSBpbnN0YW5jZXMgb2YgYSBjbGFzcyB3aGljaCBpcyBzYWZlIGJ5IGNvbnN0cnVjdGlvbi4gQ2xvc3VyZSdzIFNhZmVcbiAqIEhUTUwgVHlwZXMgaXMgb25lIGltcGxlbWVudGF0aW9uIG9mIHRoaXMgdGVjaG5pcXVlIChcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvc2FmZS1odG1sLXR5cGVzL2Jsb2IvbWFzdGVyL2RvYy9zYWZlaHRtbC10eXBlcy5tZCkuXG4gKiBUaGUgVHJ1c3RlZFR5cGVzIHBvbHlmaWxsIGluIEFQSS1vbmx5IG1vZGUgY291bGQgYWxzbyBiZSB1c2VkIGFzIGEgYmFzaXNcbiAqIGZvciB0aGlzIHRlY2huaXF1ZSAoaHR0cHM6Ly9naXRodWIuY29tL1dJQ0cvdHJ1c3RlZC10eXBlcykuXG4gKlxuICogQHBhcmFtIG5vZGUgVGhlIEhUTUwgbm9kZSAodXN1YWxseSBlaXRoZXIgYSAjdGV4dCBub2RlIG9yIGFuIEVsZW1lbnQpIHRoYXRcbiAqICAgICBpcyBiZWluZyB3cml0dGVuIHRvLiBOb3RlIHRoYXQgdGhpcyBpcyBqdXN0IGFuIGV4ZW1wbGFyIG5vZGUsIHRoZSB3cml0ZVxuICogICAgIG1heSB0YWtlIHBsYWNlIGFnYWluc3QgYW5vdGhlciBpbnN0YW5jZSBvZiB0aGUgc2FtZSBjbGFzcyBvZiBub2RlLlxuICogQHBhcmFtIG5hbWUgVGhlIG5hbWUgb2YgYW4gYXR0cmlidXRlIG9yIHByb3BlcnR5IChmb3IgZXhhbXBsZSwgJ2hyZWYnKS5cbiAqIEBwYXJhbSB0eXBlIEluZGljYXRlcyB3aGV0aGVyIHRoZSB3cml0ZSB0aGF0J3MgYWJvdXQgdG8gYmUgcGVyZm9ybWVkIHdpbGxcbiAqICAgICBiZSB0byBhIHByb3BlcnR5IG9yIGEgbm9kZS5cbiAqIEByZXR1cm4gQSBmdW5jdGlvbiB0aGF0IHdpbGwgc2FuaXRpemUgdGhpcyBjbGFzcyBvZiB3cml0ZXMuXG4gKi9cbmV4cG9ydCB0eXBlIFNhbml0aXplckZhY3RvcnkgPSAoXG4gIG5vZGU6IE5vZGUsXG4gIG5hbWU6IHN0cmluZyxcbiAgdHlwZTogJ3Byb3BlcnR5JyB8ICdhdHRyaWJ1dGUnXG4pID0+IFZhbHVlU2FuaXRpemVyO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gd2hpY2ggY2FuIHNhbml0aXplIHZhbHVlcyB0aGF0IHdpbGwgYmUgd3JpdHRlbiB0byBhIHNwZWNpZmljIGtpbmRcbiAqIG9mIERPTSBzaW5rLlxuICpcbiAqIFNlZSBTYW5pdGl6ZXJGYWN0b3J5LlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2FuaXRpemUuIFdpbGwgYmUgdGhlIGFjdHVhbCB2YWx1ZSBwYXNzZWQgaW50b1xuICogICAgIHRoZSBsaXQtaHRtbCB0ZW1wbGF0ZSBsaXRlcmFsLCBzbyB0aGlzIGNvdWxkIGJlIG9mIGFueSB0eXBlLlxuICogQHJldHVybiBUaGUgdmFsdWUgdG8gd3JpdGUgdG8gdGhlIERPTS4gVXN1YWxseSB0aGUgc2FtZSBhcyB0aGUgaW5wdXQgdmFsdWUsXG4gKiAgICAgdW5sZXNzIHNhbml0aXphdGlvbiBpcyBuZWVkZWQuXG4gKi9cbmV4cG9ydCB0eXBlIFZhbHVlU2FuaXRpemVyID0gKHZhbHVlOiB1bmtub3duKSA9PiB1bmtub3duO1xuXG5jb25zdCBpZGVudGl0eUZ1bmN0aW9uOiBWYWx1ZVNhbml0aXplciA9ICh2YWx1ZTogdW5rbm93bikgPT4gdmFsdWU7XG5jb25zdCBub29wU2FuaXRpemVyOiBTYW5pdGl6ZXJGYWN0b3J5ID0gKFxuICBfbm9kZTogTm9kZSxcbiAgX25hbWU6IHN0cmluZyxcbiAgX3R5cGU6ICdwcm9wZXJ0eScgfCAnYXR0cmlidXRlJ1xuKSA9PiBpZGVudGl0eUZ1bmN0aW9uO1xuXG4vKiogU2V0cyB0aGUgZ2xvYmFsIHNhbml0aXplciBmYWN0b3J5LiAqL1xuY29uc3Qgc2V0U2FuaXRpemVyID0gKG5ld1Nhbml0aXplcjogU2FuaXRpemVyRmFjdG9yeSkgPT4ge1xuICBpZiAoIUVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoc2FuaXRpemVyRmFjdG9yeUludGVybmFsICE9PSBub29wU2FuaXRpemVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYEF0dGVtcHRlZCB0byBvdmVyd3JpdGUgZXhpc3RpbmcgbGl0LWh0bWwgc2VjdXJpdHkgcG9saWN5LmAgK1xuICAgICAgICBgIHNldFNhbml0aXplRE9NVmFsdWVGYWN0b3J5IHNob3VsZCBiZSBjYWxsZWQgYXQgbW9zdCBvbmNlLmBcbiAgICApO1xuICB9XG4gIHNhbml0aXplckZhY3RvcnlJbnRlcm5hbCA9IG5ld1Nhbml0aXplcjtcbn07XG5cbi8qKlxuICogT25seSB1c2VkIGluIGludGVybmFsIHRlc3RzLCBub3QgYSBwYXJ0IG9mIHRoZSBwdWJsaWMgQVBJLlxuICovXG5jb25zdCBfdGVzdE9ubHlDbGVhclNhbml0aXplckZhY3RvcnlEb05vdENhbGxPckVsc2UgPSAoKSA9PiB7XG4gIHNhbml0aXplckZhY3RvcnlJbnRlcm5hbCA9IG5vb3BTYW5pdGl6ZXI7XG59O1xuXG5jb25zdCBjcmVhdGVTYW5pdGl6ZXI6IFNhbml0aXplckZhY3RvcnkgPSAobm9kZSwgbmFtZSwgdHlwZSkgPT4ge1xuICByZXR1cm4gc2FuaXRpemVyRmFjdG9yeUludGVybmFsKG5vZGUsIG5hbWUsIHR5cGUpO1xufTtcblxuLy8gQWRkZWQgdG8gYW4gYXR0cmlidXRlIG5hbWUgdG8gbWFyayB0aGUgYXR0cmlidXRlIGFzIGJvdW5kIHNvIHdlIGNhbiBmaW5kXG4vLyBpdCBlYXNpbHkuXG5jb25zdCBib3VuZEF0dHJpYnV0ZVN1ZmZpeCA9ICckbGl0JCc7XG5cbi8vIFRoaXMgbWFya2VyIGlzIHVzZWQgaW4gbWFueSBzeW50YWN0aWMgcG9zaXRpb25zIGluIEhUTUwsIHNvIGl0IG11c3QgYmVcbi8vIGEgdmFsaWQgZWxlbWVudCBuYW1lIGFuZCBhdHRyaWJ1dGUgbmFtZS4gV2UgZG9uJ3Qgc3VwcG9ydCBkeW5hbWljIG5hbWVzICh5ZXQpXG4vLyBidXQgdGhpcyBhdCBsZWFzdCBlbnN1cmVzIHRoYXQgdGhlIHBhcnNlIHRyZWUgaXMgY2xvc2VyIHRvIHRoZSB0ZW1wbGF0ZVxuLy8gaW50ZW50aW9uLlxuY29uc3QgbWFya2VyID0gYGxpdCQke01hdGgucmFuZG9tKCkudG9GaXhlZCg5KS5zbGljZSgyKX0kYDtcblxuLy8gU3RyaW5nIHVzZWQgdG8gdGVsbCBpZiBhIGNvbW1lbnQgaXMgYSBtYXJrZXIgY29tbWVudFxuY29uc3QgbWFya2VyTWF0Y2ggPSAnPycgKyBtYXJrZXI7XG5cbi8vIFRleHQgdXNlZCB0byBpbnNlcnQgYSBjb21tZW50IG1hcmtlciBub2RlLiBXZSB1c2UgcHJvY2Vzc2luZyBpbnN0cnVjdGlvblxuLy8gc3ludGF4IGJlY2F1c2UgaXQncyBzbGlnaHRseSBzbWFsbGVyLCBidXQgcGFyc2VzIGFzIGEgY29tbWVudCBub2RlLlxuY29uc3Qgbm9kZU1hcmtlciA9IGA8JHttYXJrZXJNYXRjaH0+YDtcblxuY29uc3QgZCA9XG4gIE5PREVfTU9ERSAmJiBnbG9iYWwuZG9jdW1lbnQgPT09IHVuZGVmaW5lZFxuICAgID8gKHtcbiAgICAgICAgY3JlYXRlVHJlZVdhbGtlcigpIHtcbiAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH0sXG4gICAgICB9IGFzIHVua25vd24gYXMgRG9jdW1lbnQpXG4gICAgOiBkb2N1bWVudDtcblxuLy8gQ3JlYXRlcyBhIGR5bmFtaWMgbWFya2VyLiBXZSBuZXZlciBoYXZlIHRvIHNlYXJjaCBmb3IgdGhlc2UgaW4gdGhlIERPTS5cbmNvbnN0IGNyZWF0ZU1hcmtlciA9ICgpID0+IGQuY3JlYXRlQ29tbWVudCgnJyk7XG5cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXR5cGVvZi1vcGVyYXRvclxudHlwZSBQcmltaXRpdmUgPSBudWxsIHwgdW5kZWZpbmVkIHwgYm9vbGVhbiB8IG51bWJlciB8IHN0cmluZyB8IHN5bWJvbCB8IGJpZ2ludDtcbmNvbnN0IGlzUHJpbWl0aXZlID0gKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUHJpbWl0aXZlID0+XG4gIHZhbHVlID09PSBudWxsIHx8ICh0eXBlb2YgdmFsdWUgIT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlICE9ICdmdW5jdGlvbicpO1xuY29uc3QgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5jb25zdCBpc0l0ZXJhYmxlID0gKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgSXRlcmFibGU8dW5rbm93bj4gPT5cbiAgaXNBcnJheSh2YWx1ZSkgfHxcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgdHlwZW9mICh2YWx1ZSBhcyBhbnkpPy5bU3ltYm9sLml0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJztcblxuY29uc3QgU1BBQ0VfQ0hBUiA9IGBbIFxcdFxcblxcZlxccl1gO1xuY29uc3QgQVRUUl9WQUxVRV9DSEFSID0gYFteIFxcdFxcblxcZlxcclwiJ1xcYDw+PV1gO1xuY29uc3QgTkFNRV9DSEFSID0gYFteXFxcXHNcIic+PS9dYDtcblxuLy8gVGhlc2UgcmVnZXhlcyByZXByZXNlbnQgdGhlIGZpdmUgcGFyc2luZyBzdGF0ZXMgdGhhdCB3ZSBjYXJlIGFib3V0IGluIHRoZVxuLy8gVGVtcGxhdGUncyBIVE1MIHNjYW5uZXIuIFRoZXkgbWF0Y2ggdGhlICplbmQqIG9mIHRoZSBzdGF0ZSB0aGV5J3JlIG5hbWVkXG4vLyBhZnRlci5cbi8vIERlcGVuZGluZyBvbiB0aGUgbWF0Y2gsIHdlIHRyYW5zaXRpb24gdG8gYSBuZXcgc3RhdGUuIElmIHRoZXJlJ3Mgbm8gbWF0Y2gsXG4vLyB3ZSBzdGF5IGluIHRoZSBzYW1lIHN0YXRlLlxuLy8gTm90ZSB0aGF0IHRoZSByZWdleGVzIGFyZSBzdGF0ZWZ1bC4gV2UgdXRpbGl6ZSBsYXN0SW5kZXggYW5kIHN5bmMgaXRcbi8vIGFjcm9zcyB0aGUgbXVsdGlwbGUgcmVnZXhlcyB1c2VkLiBJbiBhZGRpdGlvbiB0byB0aGUgZml2ZSByZWdleGVzIGJlbG93XG4vLyB3ZSBhbHNvIGR5bmFtaWNhbGx5IGNyZWF0ZSBhIHJlZ2V4IHRvIGZpbmQgdGhlIG1hdGNoaW5nIGVuZCB0YWdzIGZvciByYXdcbi8vIHRleHQgZWxlbWVudHMuXG5cbi8qKlxuICogRW5kIG9mIHRleHQgaXM6IGA8YCBmb2xsb3dlZCBieTpcbiAqICAgKGNvbW1lbnQgc3RhcnQpIG9yICh0YWcpIG9yIChkeW5hbWljIHRhZyBiaW5kaW5nKVxuICovXG5jb25zdCB0ZXh0RW5kUmVnZXggPSAvPCg/OighLS18XFwvW15hLXpBLVpdKXwoXFwvP1thLXpBLVpdW14+XFxzXSopfChcXC8/JCkpL2c7XG5jb25zdCBDT01NRU5UX1NUQVJUID0gMTtcbmNvbnN0IFRBR19OQU1FID0gMjtcbmNvbnN0IERZTkFNSUNfVEFHX05BTUUgPSAzO1xuXG5jb25zdCBjb21tZW50RW5kUmVnZXggPSAvLS0+L2c7XG4vKipcbiAqIENvbW1lbnRzIG5vdCBzdGFydGVkIHdpdGggPCEtLSwgbGlrZSA8L3ssIGNhbiBiZSBlbmRlZCBieSBhIHNpbmdsZSBgPmBcbiAqL1xuY29uc3QgY29tbWVudDJFbmRSZWdleCA9IC8+L2c7XG5cbi8qKlxuICogVGhlIHRhZ0VuZCByZWdleCBtYXRjaGVzIHRoZSBlbmQgb2YgdGhlIFwiaW5zaWRlIGFuIG9wZW5pbmdcIiB0YWcgc3ludGF4XG4gKiBwb3NpdGlvbi4gSXQgZWl0aGVyIG1hdGNoZXMgYSBgPmAsIGFuIGF0dHJpYnV0ZS1saWtlIHNlcXVlbmNlLCBvciB0aGUgZW5kXG4gKiBvZiB0aGUgc3RyaW5nIGFmdGVyIGEgc3BhY2UgKGF0dHJpYnV0ZS1uYW1lIHBvc2l0aW9uIGVuZGluZykuXG4gKlxuICogU2VlIGF0dHJpYnV0ZXMgaW4gdGhlIEhUTUwgc3BlYzpcbiAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9zeW50YXguaHRtbCNlbGVtZW50cy1hdHRyaWJ1dGVzXG4gKlxuICogXCIgXFx0XFxuXFxmXFxyXCIgYXJlIEhUTUwgc3BhY2UgY2hhcmFjdGVyczpcbiAqIGh0dHBzOi8vaW5mcmEuc3BlYy53aGF0d2cub3JnLyNhc2NpaS13aGl0ZXNwYWNlXG4gKlxuICogU28gYW4gYXR0cmlidXRlIGlzOlxuICogICogVGhlIG5hbWU6IGFueSBjaGFyYWN0ZXIgZXhjZXB0IGEgd2hpdGVzcGFjZSBjaGFyYWN0ZXIsIChcIiksICgnKSwgXCI+XCIsXG4gKiAgICBcIj1cIiwgb3IgXCIvXCIuIE5vdGU6IHRoaXMgaXMgZGlmZmVyZW50IGZyb20gdGhlIEhUTUwgc3BlYyB3aGljaCBhbHNvIGV4Y2x1ZGVzIGNvbnRyb2wgY2hhcmFjdGVycy5cbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieSBcIj1cIlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5OlxuICogICAgKiBBbnkgY2hhcmFjdGVyIGV4Y2VwdCBzcGFjZSwgKCcpLCAoXCIpLCBcIjxcIiwgXCI+XCIsIFwiPVwiLCAoYCksIG9yXG4gKiAgICAqIChcIikgdGhlbiBhbnkgbm9uLShcIiksIG9yXG4gKiAgICAqICgnKSB0aGVuIGFueSBub24tKCcpXG4gKi9cbmNvbnN0IHRhZ0VuZFJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgYD58JHtTUEFDRV9DSEFSfSg/Oigke05BTUVfQ0hBUn0rKSgke1NQQUNFX0NIQVJ9Kj0ke1NQQUNFX0NIQVJ9Kig/OiR7QVRUUl9WQUxVRV9DSEFSfXwoXCJ8Jyl8KSl8JClgLFxuICAnZydcbik7XG5jb25zdCBFTlRJUkVfTUFUQ0ggPSAwO1xuY29uc3QgQVRUUklCVVRFX05BTUUgPSAxO1xuY29uc3QgU1BBQ0VTX0FORF9FUVVBTFMgPSAyO1xuY29uc3QgUVVPVEVfQ0hBUiA9IDM7XG5cbmNvbnN0IHNpbmdsZVF1b3RlQXR0ckVuZFJlZ2V4ID0gLycvZztcbmNvbnN0IGRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4ID0gL1wiL2c7XG4vKipcbiAqIE1hdGNoZXMgdGhlIHJhdyB0ZXh0IGVsZW1lbnRzLlxuICpcbiAqIENvbW1lbnRzIGFyZSBub3QgcGFyc2VkIHdpdGhpbiByYXcgdGV4dCBlbGVtZW50cywgc28gd2UgbmVlZCB0byBzZWFyY2ggdGhlaXJcbiAqIHRleHQgY29udGVudCBmb3IgbWFya2VyIHN0cmluZ3MuXG4gKi9cbmNvbnN0IHJhd1RleHRFbGVtZW50ID0gL14oPzpzY3JpcHR8c3R5bGV8dGV4dGFyZWF8dGl0bGUpJC9pO1xuXG4vKiogVGVtcGxhdGVSZXN1bHQgdHlwZXMgKi9cbmNvbnN0IEhUTUxfUkVTVUxUID0gMTtcbmNvbnN0IFNWR19SRVNVTFQgPSAyO1xuY29uc3QgTUFUSE1MX1JFU1VMVCA9IDM7XG5cbnR5cGUgUmVzdWx0VHlwZSA9IHR5cGVvZiBIVE1MX1JFU1VMVCB8IHR5cGVvZiBTVkdfUkVTVUxUIHwgdHlwZW9mIE1BVEhNTF9SRVNVTFQ7XG5cbi8vIFRlbXBsYXRlUGFydCB0eXBlc1xuLy8gSU1QT1JUQU5UOiB0aGVzZSBtdXN0IG1hdGNoIHRoZSB2YWx1ZXMgaW4gUGFydFR5cGVcbmNvbnN0IEFUVFJJQlVURV9QQVJUID0gMTtcbmNvbnN0IENISUxEX1BBUlQgPSAyO1xuY29uc3QgUFJPUEVSVFlfUEFSVCA9IDM7XG5jb25zdCBCT09MRUFOX0FUVFJJQlVURV9QQVJUID0gNDtcbmNvbnN0IEVWRU5UX1BBUlQgPSA1O1xuY29uc3QgRUxFTUVOVF9QQVJUID0gNjtcbmNvbnN0IENPTU1FTlRfUEFSVCA9IDc7XG5cbi8qKlxuICogVGhlIHJldHVybiB0eXBlIG9mIHRoZSB0ZW1wbGF0ZSB0YWcgZnVuY3Rpb25zLCB7QGxpbmtjb2RlIGh0bWx9IGFuZFxuICoge0BsaW5rY29kZSBzdmd9IHdoZW4gaXQgaGFzbid0IGJlZW4gY29tcGlsZWQgYnkgQGxpdC1sYWJzL2NvbXBpbGVyLlxuICpcbiAqIEEgYFRlbXBsYXRlUmVzdWx0YCBvYmplY3QgaG9sZHMgYWxsIHRoZSBpbmZvcm1hdGlvbiBhYm91dCBhIHRlbXBsYXRlXG4gKiBleHByZXNzaW9uIHJlcXVpcmVkIHRvIHJlbmRlciBpdDogdGhlIHRlbXBsYXRlIHN0cmluZ3MsIGV4cHJlc3Npb24gdmFsdWVzLFxuICogYW5kIHR5cGUgb2YgdGVtcGxhdGUgKGh0bWwgb3Igc3ZnKS5cbiAqXG4gKiBgVGVtcGxhdGVSZXN1bHRgIG9iamVjdHMgZG8gbm90IGNyZWF0ZSBhbnkgRE9NIG9uIHRoZWlyIG93bi4gVG8gY3JlYXRlIG9yXG4gKiB1cGRhdGUgRE9NIHlvdSBuZWVkIHRvIHJlbmRlciB0aGUgYFRlbXBsYXRlUmVzdWx0YC4gU2VlXG4gKiBbUmVuZGVyaW5nXShodHRwczovL2xpdC5kZXYvZG9jcy9jb21wb25lbnRzL3JlbmRlcmluZykgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICovXG5leHBvcnQgdHlwZSBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQ8VCBleHRlbmRzIFJlc3VsdFR5cGUgPSBSZXN1bHRUeXBlPiA9IHtcbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgWydfJGxpdFR5cGUkJ106IFQ7XG4gIHN0cmluZ3M6IFRlbXBsYXRlU3RyaW5nc0FycmF5O1xuICB2YWx1ZXM6IHVua25vd25bXTtcbn07XG5cbi8qKlxuICogVGhpcyBpcyBhIHRlbXBsYXRlIHJlc3VsdCB0aGF0IG1heSBiZSBlaXRoZXIgdW5jb21waWxlZCBvciBjb21waWxlZC5cbiAqXG4gKiBJbiB0aGUgZnV0dXJlLCBUZW1wbGF0ZVJlc3VsdCB3aWxsIGJlIHRoaXMgdHlwZS4gSWYgeW91IHdhbnQgdG8gZXhwbGljaXRseVxuICogbm90ZSB0aGF0IGEgdGVtcGxhdGUgcmVzdWx0IGlzIHBvdGVudGlhbGx5IGNvbXBpbGVkLCB5b3UgY2FuIHJlZmVyZW5jZSB0aGlzXG4gKiB0eXBlIGFuZCBpdCB3aWxsIGNvbnRpbnVlIHRvIGJlaGF2ZSB0aGUgc2FtZSB0aHJvdWdoIHRoZSBuZXh0IG1ham9yIHZlcnNpb25cbiAqIG9mIExpdC4gVGhpcyBjYW4gYmUgdXNlZnVsIGZvciBjb2RlIHRoYXQgd2FudHMgdG8gcHJlcGFyZSBmb3IgdGhlIG5leHRcbiAqIG1ham9yIHZlcnNpb24gb2YgTGl0LlxuICovXG5leHBvcnQgdHlwZSBNYXliZUNvbXBpbGVkVGVtcGxhdGVSZXN1bHQ8VCBleHRlbmRzIFJlc3VsdFR5cGUgPSBSZXN1bHRUeXBlPiA9XG4gIHwgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0PFQ+XG4gIHwgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdDtcblxuLyoqXG4gKiBUaGUgcmV0dXJuIHR5cGUgb2YgdGhlIHRlbXBsYXRlIHRhZyBmdW5jdGlvbnMsIHtAbGlua2NvZGUgaHRtbH0gYW5kXG4gKiB7QGxpbmtjb2RlIHN2Z30uXG4gKlxuICogQSBgVGVtcGxhdGVSZXN1bHRgIG9iamVjdCBob2xkcyBhbGwgdGhlIGluZm9ybWF0aW9uIGFib3V0IGEgdGVtcGxhdGVcbiAqIGV4cHJlc3Npb24gcmVxdWlyZWQgdG8gcmVuZGVyIGl0OiB0aGUgdGVtcGxhdGUgc3RyaW5ncywgZXhwcmVzc2lvbiB2YWx1ZXMsXG4gKiBhbmQgdHlwZSBvZiB0ZW1wbGF0ZSAoaHRtbCBvciBzdmcpLlxuICpcbiAqIGBUZW1wbGF0ZVJlc3VsdGAgb2JqZWN0cyBkbyBub3QgY3JlYXRlIGFueSBET00gb24gdGhlaXIgb3duLiBUbyBjcmVhdGUgb3JcbiAqIHVwZGF0ZSBET00geW91IG5lZWQgdG8gcmVuZGVyIHRoZSBgVGVtcGxhdGVSZXN1bHRgLiBTZWVcbiAqIFtSZW5kZXJpbmddKGh0dHBzOi8vbGl0LmRldi9kb2NzL2NvbXBvbmVudHMvcmVuZGVyaW5nKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiBJbiBMaXQgNCwgdGhpcyB0eXBlIHdpbGwgYmUgYW4gYWxpYXMgb2ZcbiAqIE1heWJlQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdCwgc28gdGhhdCBjb2RlIHdpbGwgZ2V0IHR5cGUgZXJyb3JzIGlmIGl0IGFzc3VtZXNcbiAqIHRoYXQgTGl0IHRlbXBsYXRlcyBhcmUgbm90IGNvbXBpbGVkLiBXaGVuIGRlbGliZXJhdGVseSB3b3JraW5nIHdpdGggb25seVxuICogb25lLCB1c2UgZWl0aGVyIHtAbGlua2NvZGUgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdH0gb3JcbiAqIHtAbGlua2NvZGUgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0fSBleHBsaWNpdGx5LlxuICovXG5leHBvcnQgdHlwZSBUZW1wbGF0ZVJlc3VsdDxUIGV4dGVuZHMgUmVzdWx0VHlwZSA9IFJlc3VsdFR5cGU+ID1cbiAgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0PFQ+O1xuXG5leHBvcnQgdHlwZSBIVE1MVGVtcGxhdGVSZXN1bHQgPSBUZW1wbGF0ZVJlc3VsdDx0eXBlb2YgSFRNTF9SRVNVTFQ+O1xuXG5leHBvcnQgdHlwZSBTVkdUZW1wbGF0ZVJlc3VsdCA9IFRlbXBsYXRlUmVzdWx0PHR5cGVvZiBTVkdfUkVTVUxUPjtcblxuZXhwb3J0IHR5cGUgTWF0aE1MVGVtcGxhdGVSZXN1bHQgPSBUZW1wbGF0ZVJlc3VsdDx0eXBlb2YgTUFUSE1MX1JFU1VMVD47XG5cbi8qKlxuICogQSBUZW1wbGF0ZVJlc3VsdCB0aGF0IGhhcyBiZWVuIGNvbXBpbGVkIGJ5IEBsaXQtbGFicy9jb21waWxlciwgc2tpcHBpbmcgdGhlXG4gKiBwcmVwYXJlIHN0ZXAuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdCB7XG4gIC8vIFRoaXMgaXMgYSBmYWN0b3J5IGluIG9yZGVyIHRvIG1ha2UgdGVtcGxhdGUgaW5pdGlhbGl6YXRpb24gbGF6eVxuICAvLyBhbmQgYWxsb3cgU2hhZHlSZW5kZXJPcHRpb25zIHNjb3BlIHRvIGJlIHBhc3NlZCBpbi5cbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgWydfJGxpdFR5cGUkJ106IENvbXBpbGVkVGVtcGxhdGU7XG4gIHZhbHVlczogdW5rbm93bltdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVkVGVtcGxhdGUgZXh0ZW5kcyBPbWl0PFRlbXBsYXRlLCAnZWwnPiB7XG4gIC8vIGVsIGlzIG92ZXJyaWRkZW4gdG8gYmUgb3B0aW9uYWwuIFdlIGluaXRpYWxpemUgaXQgb24gZmlyc3QgcmVuZGVyXG4gIGVsPzogSFRNTFRlbXBsYXRlRWxlbWVudDtcblxuICAvLyBUaGUgcHJlcGFyZWQgSFRNTCBzdHJpbmcgdG8gY3JlYXRlIGEgdGVtcGxhdGUgZWxlbWVudCBmcm9tLlxuICAvLyBUaGUgdHlwZSBpcyBhIFRlbXBsYXRlU3RyaW5nc0FycmF5IHRvIGd1YXJhbnRlZSB0aGF0IHRoZSB2YWx1ZSBjYW1lIGZyb21cbiAgLy8gc291cmNlIGNvZGUsIHByZXZlbnRpbmcgYSBKU09OIGluamVjdGlvbiBhdHRhY2suXG4gIGg6IFRlbXBsYXRlU3RyaW5nc0FycmF5O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHRlbXBsYXRlIGxpdGVyYWwgdGFnIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFRlbXBsYXRlUmVzdWx0IHdpdGhcbiAqIHRoZSBnaXZlbiByZXN1bHQgdHlwZS5cbiAqL1xuY29uc3QgdGFnID1cbiAgPFQgZXh0ZW5kcyBSZXN1bHRUeXBlPih0eXBlOiBUKSA9PlxuICAoc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXksIC4uLnZhbHVlczogdW5rbm93bltdKTogVGVtcGxhdGVSZXN1bHQ8VD4gPT4ge1xuICAgIC8vIFdhcm4gYWdhaW5zdCB0ZW1wbGF0ZXMgb2N0YWwgZXNjYXBlIHNlcXVlbmNlc1xuICAgIC8vIFdlIGRvIHRoaXMgaGVyZSByYXRoZXIgdGhhbiBpbiByZW5kZXIgc28gdGhhdCB0aGUgd2FybmluZyBpcyBjbG9zZXIgdG8gdGhlXG4gICAgLy8gdGVtcGxhdGUgZGVmaW5pdGlvbi5cbiAgICBpZiAoREVWX01PREUgJiYgc3RyaW5ncy5zb21lKChzKSA9PiBzID09PSB1bmRlZmluZWQpKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdTb21lIHRlbXBsYXRlIHN0cmluZ3MgYXJlIHVuZGVmaW5lZC5cXG4nICtcbiAgICAgICAgICAnVGhpcyBpcyBwcm9iYWJseSBjYXVzZWQgYnkgaWxsZWdhbCBvY3RhbCBlc2NhcGUgc2VxdWVuY2VzLidcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgLy8gSW1wb3J0IHN0YXRpYy1odG1sLmpzIHJlc3VsdHMgaW4gYSBjaXJjdWxhciBkZXBlbmRlbmN5IHdoaWNoIGczIGRvZXNuJ3RcbiAgICAgIC8vIGhhbmRsZS4gSW5zdGVhZCB3ZSBrbm93IHRoYXQgc3RhdGljIHZhbHVlcyBtdXN0IGhhdmUgdGhlIGZpZWxkXG4gICAgICAvLyBgXyRsaXRTdGF0aWMkYC5cbiAgICAgIGlmIChcbiAgICAgICAgdmFsdWVzLnNvbWUoKHZhbCkgPT4gKHZhbCBhcyB7XyRsaXRTdGF0aWMkOiB1bmtub3dufSk/LlsnXyRsaXRTdGF0aWMkJ10pXG4gICAgICApIHtcbiAgICAgICAgaXNzdWVXYXJuaW5nKFxuICAgICAgICAgICcnLFxuICAgICAgICAgIGBTdGF0aWMgdmFsdWVzICdsaXRlcmFsJyBvciAndW5zYWZlU3RhdGljJyBjYW5ub3QgYmUgdXNlZCBhcyB2YWx1ZXMgdG8gbm9uLXN0YXRpYyB0ZW1wbGF0ZXMuXFxuYCArXG4gICAgICAgICAgICBgUGxlYXNlIHVzZSB0aGUgc3RhdGljICdodG1sJyB0YWcgZnVuY3Rpb24uIFNlZSBodHRwczovL2xpdC5kZXYvZG9jcy90ZW1wbGF0ZXMvZXhwcmVzc2lvbnMvI3N0YXRpYy1leHByZXNzaW9uc2BcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgICBbJ18kbGl0VHlwZSQnXTogdHlwZSxcbiAgICAgIHN0cmluZ3MsXG4gICAgICB2YWx1ZXMsXG4gICAgfTtcbiAgfTtcblxuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhbiBIVE1MIHRlbXBsYXRlIHRoYXQgY2FuIGVmZmljaWVudGx5XG4gKiByZW5kZXIgdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqXG4gKiBgYGB0c1xuICogY29uc3QgaGVhZGVyID0gKHRpdGxlOiBzdHJpbmcpID0+IGh0bWxgPGgxPiR7dGl0bGV9PC9oMT5gO1xuICogYGBgXG4gKlxuICogVGhlIGBodG1sYCB0YWcgcmV0dXJucyBhIGRlc2NyaXB0aW9uIG9mIHRoZSBET00gdG8gcmVuZGVyIGFzIGEgdmFsdWUuIEl0IGlzXG4gKiBsYXp5LCBtZWFuaW5nIG5vIHdvcmsgaXMgZG9uZSB1bnRpbCB0aGUgdGVtcGxhdGUgaXMgcmVuZGVyZWQuIFdoZW4gcmVuZGVyaW5nLFxuICogaWYgYSB0ZW1wbGF0ZSBjb21lcyBmcm9tIHRoZSBzYW1lIGV4cHJlc3Npb24gYXMgYSBwcmV2aW91c2x5IHJlbmRlcmVkIHJlc3VsdCxcbiAqIGl0J3MgZWZmaWNpZW50bHkgdXBkYXRlZCBpbnN0ZWFkIG9mIHJlcGxhY2VkLlxuICovXG5leHBvcnQgY29uc3QgaHRtbCA9IHRhZyhIVE1MX1JFU1VMVCk7XG5cbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgYW4gU1ZHIGZyYWdtZW50IHRoYXQgY2FuIGVmZmljaWVudGx5IHJlbmRlclxuICogdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqXG4gKiBgYGB0c1xuICogY29uc3QgcmVjdCA9IHN2Z2A8cmVjdCB3aWR0aD1cIjEwXCIgaGVpZ2h0PVwiMTBcIj48L3JlY3Q+YDtcbiAqXG4gKiBjb25zdCBteUltYWdlID0gaHRtbGBcbiAqICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDEwIDEwXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuICogICAgICR7cmVjdH1cbiAqICAgPC9zdmc+YDtcbiAqIGBgYFxuICpcbiAqIFRoZSBgc3ZnYCAqdGFnIGZ1bmN0aW9uKiBzaG91bGQgb25seSBiZSB1c2VkIGZvciBTVkcgZnJhZ21lbnRzLCBvciBlbGVtZW50c1xuICogdGhhdCB3b3VsZCBiZSBjb250YWluZWQgKippbnNpZGUqKiBhbiBgPHN2Zz5gIEhUTUwgZWxlbWVudC4gQSBjb21tb24gZXJyb3IgaXNcbiAqIHBsYWNpbmcgYW4gYDxzdmc+YCAqZWxlbWVudCogaW4gYSB0ZW1wbGF0ZSB0YWdnZWQgd2l0aCB0aGUgYHN2Z2AgdGFnXG4gKiBmdW5jdGlvbi4gVGhlIGA8c3ZnPmAgZWxlbWVudCBpcyBhbiBIVE1MIGVsZW1lbnQgYW5kIHNob3VsZCBiZSB1c2VkIHdpdGhpbiBhXG4gKiB0ZW1wbGF0ZSB0YWdnZWQgd2l0aCB0aGUge0BsaW5rY29kZSBodG1sfSB0YWcgZnVuY3Rpb24uXG4gKlxuICogSW4gTGl0RWxlbWVudCB1c2FnZSwgaXQncyBpbnZhbGlkIHRvIHJldHVybiBhbiBTVkcgZnJhZ21lbnQgZnJvbSB0aGVcbiAqIGByZW5kZXIoKWAgbWV0aG9kLCBhcyB0aGUgU1ZHIGZyYWdtZW50IHdpbGwgYmUgY29udGFpbmVkIHdpdGhpbiB0aGUgZWxlbWVudCdzXG4gKiBzaGFkb3cgcm9vdCBhbmQgdGh1cyBub3QgYmUgcHJvcGVybHkgY29udGFpbmVkIHdpdGhpbiBhbiBgPHN2Zz5gIEhUTUxcbiAqIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBjb25zdCBzdmcgPSB0YWcoU1ZHX1JFU1VMVCk7XG5cbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgTWF0aE1MIGZyYWdtZW50IHRoYXQgY2FuIGVmZmljaWVudGx5IHJlbmRlclxuICogdG8gYW5kIHVwZGF0ZSBhIGNvbnRhaW5lci5cbiAqXG4gKiBgYGB0c1xuICogY29uc3QgbnVtID0gbWF0aG1sYDxtbj4xPC9tbj5gO1xuICpcbiAqIGNvbnN0IGVxID0gaHRtbGBcbiAqICAgPG1hdGg+XG4gKiAgICAgJHtudW19XG4gKiAgIDwvbWF0aD5gO1xuICogYGBgXG4gKlxuICogVGhlIGBtYXRobWxgICp0YWcgZnVuY3Rpb24qIHNob3VsZCBvbmx5IGJlIHVzZWQgZm9yIE1hdGhNTCBmcmFnbWVudHMsIG9yXG4gKiBlbGVtZW50cyB0aGF0IHdvdWxkIGJlIGNvbnRhaW5lZCAqKmluc2lkZSoqIGEgYDxtYXRoPmAgSFRNTCBlbGVtZW50LiBBIGNvbW1vblxuICogZXJyb3IgaXMgcGxhY2luZyBhIGA8bWF0aD5gICplbGVtZW50KiBpbiBhIHRlbXBsYXRlIHRhZ2dlZCB3aXRoIHRoZSBgbWF0aG1sYFxuICogdGFnIGZ1bmN0aW9uLiBUaGUgYDxtYXRoPmAgZWxlbWVudCBpcyBhbiBIVE1MIGVsZW1lbnQgYW5kIHNob3VsZCBiZSB1c2VkXG4gKiB3aXRoaW4gYSB0ZW1wbGF0ZSB0YWdnZWQgd2l0aCB0aGUge0BsaW5rY29kZSBodG1sfSB0YWcgZnVuY3Rpb24uXG4gKlxuICogSW4gTGl0RWxlbWVudCB1c2FnZSwgaXQncyBpbnZhbGlkIHRvIHJldHVybiBhbiBNYXRoTUwgZnJhZ21lbnQgZnJvbSB0aGVcbiAqIGByZW5kZXIoKWAgbWV0aG9kLCBhcyB0aGUgTWF0aE1MIGZyYWdtZW50IHdpbGwgYmUgY29udGFpbmVkIHdpdGhpbiB0aGVcbiAqIGVsZW1lbnQncyBzaGFkb3cgcm9vdCBhbmQgdGh1cyBub3QgYmUgcHJvcGVybHkgY29udGFpbmVkIHdpdGhpbiBhIGA8bWF0aD5gXG4gKiBIVE1MIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBjb25zdCBtYXRobWwgPSB0YWcoTUFUSE1MX1JFU1VMVCk7XG5cbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgdGhhdCBhIHZhbHVlIHdhcyBoYW5kbGVkIGJ5IGEgZGlyZWN0aXZlIGFuZFxuICogc2hvdWxkIG5vdCBiZSB3cml0dGVuIHRvIHRoZSBET00uXG4gKi9cbmV4cG9ydCBjb25zdCBub0NoYW5nZSA9IFN5bWJvbC5mb3IoJ2xpdC1ub0NoYW5nZScpO1xuXG4vKipcbiAqIEEgc2VudGluZWwgdmFsdWUgdGhhdCBzaWduYWxzIGEgQ2hpbGRQYXJ0IHRvIGZ1bGx5IGNsZWFyIGl0cyBjb250ZW50LlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBidXR0b24gPSBodG1sYCR7XG4gKiAgdXNlci5pc0FkbWluXG4gKiAgICA/IGh0bWxgPGJ1dHRvbj5ERUxFVEU8L2J1dHRvbj5gXG4gKiAgICA6IG5vdGhpbmdcbiAqIH1gO1xuICogYGBgXG4gKlxuICogUHJlZmVyIHVzaW5nIGBub3RoaW5nYCBvdmVyIG90aGVyIGZhbHN5IHZhbHVlcyBhcyBpdCBwcm92aWRlcyBhIGNvbnNpc3RlbnRcbiAqIGJlaGF2aW9yIGJldHdlZW4gdmFyaW91cyBleHByZXNzaW9uIGJpbmRpbmcgY29udGV4dHMuXG4gKlxuICogSW4gY2hpbGQgZXhwcmVzc2lvbnMsIGB1bmRlZmluZWRgLCBgbnVsbGAsIGAnJ2AsIGFuZCBgbm90aGluZ2AgYWxsIGJlaGF2ZSB0aGVcbiAqIHNhbWUgYW5kIHJlbmRlciBubyBub2Rlcy4gSW4gYXR0cmlidXRlIGV4cHJlc3Npb25zLCBgbm90aGluZ2AgX3JlbW92ZXNfIHRoZVxuICogYXR0cmlidXRlLCB3aGlsZSBgdW5kZWZpbmVkYCBhbmQgYG51bGxgIHdpbGwgcmVuZGVyIGFuIGVtcHR5IHN0cmluZy4gSW5cbiAqIHByb3BlcnR5IGV4cHJlc3Npb25zIGBub3RoaW5nYCBiZWNvbWVzIGB1bmRlZmluZWRgLlxuICovXG5leHBvcnQgY29uc3Qgbm90aGluZyA9IFN5bWJvbC5mb3IoJ2xpdC1ub3RoaW5nJyk7XG5cbi8qKlxuICogVGhlIGNhY2hlIG9mIHByZXBhcmVkIHRlbXBsYXRlcywga2V5ZWQgYnkgdGhlIHRhZ2dlZCBUZW1wbGF0ZVN0cmluZ3NBcnJheVxuICogYW5kIF9ub3RfIGFjY291bnRpbmcgZm9yIHRoZSBzcGVjaWZpYyB0ZW1wbGF0ZSB0YWcgdXNlZC4gVGhpcyBtZWFucyB0aGF0XG4gKiB0ZW1wbGF0ZSB0YWdzIGNhbm5vdCBiZSBkeW5hbWljIC0gdGhleSBtdXN0IHN0YXRpY2FsbHkgYmUgb25lIG9mIGh0bWwsIHN2ZyxcbiAqIG9yIGF0dHIuIFRoaXMgcmVzdHJpY3Rpb24gc2ltcGxpZmllcyB0aGUgY2FjaGUgbG9va3VwLCB3aGljaCBpcyBvbiB0aGUgaG90XG4gKiBwYXRoIGZvciByZW5kZXJpbmcuXG4gKi9cbmNvbnN0IHRlbXBsYXRlQ2FjaGUgPSBuZXcgV2Vha01hcDxUZW1wbGF0ZVN0cmluZ3NBcnJheSwgVGVtcGxhdGU+KCk7XG5cbi8qKlxuICogT2JqZWN0IHNwZWNpZnlpbmcgb3B0aW9ucyBmb3IgY29udHJvbGxpbmcgbGl0LWh0bWwgcmVuZGVyaW5nLiBOb3RlIHRoYXRcbiAqIHdoaWxlIGByZW5kZXJgIG1heSBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgb24gdGhlIHNhbWUgYGNvbnRhaW5lcmAgKGFuZFxuICogYHJlbmRlckJlZm9yZWAgcmVmZXJlbmNlIG5vZGUpIHRvIGVmZmljaWVudGx5IHVwZGF0ZSB0aGUgcmVuZGVyZWQgY29udGVudCxcbiAqIG9ubHkgdGhlIG9wdGlvbnMgcGFzc2VkIGluIGR1cmluZyB0aGUgZmlyc3QgcmVuZGVyIGFyZSByZXNwZWN0ZWQgZHVyaW5nXG4gKiB0aGUgbGlmZXRpbWUgb2YgcmVuZGVycyB0byB0aGF0IHVuaXF1ZSBgY29udGFpbmVyYCArIGByZW5kZXJCZWZvcmVgXG4gKiBjb21iaW5hdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJPcHRpb25zIHtcbiAgLyoqXG4gICAqIEFuIG9iamVjdCB0byB1c2UgYXMgdGhlIGB0aGlzYCB2YWx1ZSBmb3IgZXZlbnQgbGlzdGVuZXJzLiBJdCdzIG9mdGVuXG4gICAqIHVzZWZ1bCB0byBzZXQgdGhpcyB0byB0aGUgaG9zdCBjb21wb25lbnQgcmVuZGVyaW5nIGEgdGVtcGxhdGUuXG4gICAqL1xuICBob3N0Pzogb2JqZWN0O1xuICAvKipcbiAgICogQSBET00gbm9kZSBiZWZvcmUgd2hpY2ggdG8gcmVuZGVyIGNvbnRlbnQgaW4gdGhlIGNvbnRhaW5lci5cbiAgICovXG4gIHJlbmRlckJlZm9yZT86IENoaWxkTm9kZSB8IG51bGw7XG4gIC8qKlxuICAgKiBOb2RlIHVzZWQgZm9yIGNsb25pbmcgdGhlIHRlbXBsYXRlIChgaW1wb3J0Tm9kZWAgd2lsbCBiZSBjYWxsZWQgb24gdGhpc1xuICAgKiBub2RlKS4gVGhpcyBjb250cm9scyB0aGUgYG93bmVyRG9jdW1lbnRgIG9mIHRoZSByZW5kZXJlZCBET00sIGFsb25nIHdpdGhcbiAgICogYW55IGluaGVyaXRlZCBjb250ZXh0LiBEZWZhdWx0cyB0byB0aGUgZ2xvYmFsIGBkb2N1bWVudGAuXG4gICAqL1xuICBjcmVhdGlvblNjb3BlPzoge2ltcG9ydE5vZGUobm9kZTogTm9kZSwgZGVlcD86IGJvb2xlYW4pOiBOb2RlfTtcbiAgLyoqXG4gICAqIFRoZSBpbml0aWFsIGNvbm5lY3RlZCBzdGF0ZSBmb3IgdGhlIHRvcC1sZXZlbCBwYXJ0IGJlaW5nIHJlbmRlcmVkLiBJZiBub1xuICAgKiBgaXNDb25uZWN0ZWRgIG9wdGlvbiBpcyBzZXQsIGBBc3luY0RpcmVjdGl2ZWBzIHdpbGwgYmUgY29ubmVjdGVkIGJ5XG4gICAqIGRlZmF1bHQuIFNldCB0byBgZmFsc2VgIGlmIHRoZSBpbml0aWFsIHJlbmRlciBvY2N1cnMgaW4gYSBkaXNjb25uZWN0ZWQgdHJlZVxuICAgKiBhbmQgYEFzeW5jRGlyZWN0aXZlYHMgc2hvdWxkIHNlZSBgaXNDb25uZWN0ZWQgPT09IGZhbHNlYCBmb3IgdGhlaXIgaW5pdGlhbFxuICAgKiByZW5kZXIuIFRoZSBgcGFydC5zZXRDb25uZWN0ZWQoKWAgbWV0aG9kIG11c3QgYmUgdXNlZCBzdWJzZXF1ZW50IHRvIGluaXRpYWxcbiAgICogcmVuZGVyIHRvIGNoYW5nZSB0aGUgY29ubmVjdGVkIHN0YXRlIG9mIHRoZSBwYXJ0LlxuICAgKi9cbiAgaXNDb25uZWN0ZWQ/OiBib29sZWFuO1xufVxuXG5jb25zdCB3YWxrZXIgPSBkLmNyZWF0ZVRyZWVXYWxrZXIoXG4gIGQsXG4gIDEyOSAvKiBOb2RlRmlsdGVyLlNIT1dfe0VMRU1FTlR8Q09NTUVOVH0gKi9cbik7XG5cbmxldCBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWw6IFNhbml0aXplckZhY3RvcnkgPSBub29wU2FuaXRpemVyO1xuXG4vL1xuLy8gQ2xhc3NlcyBvbmx5IGJlbG93IGhlcmUsIGNvbnN0IHZhcmlhYmxlIGRlY2xhcmF0aW9ucyBvbmx5IGFib3ZlIGhlcmUuLi5cbi8vXG4vLyBLZWVwaW5nIHZhcmlhYmxlIGRlY2xhcmF0aW9ucyBhbmQgY2xhc3NlcyB0b2dldGhlciBpbXByb3ZlcyBtaW5pZmljYXRpb24uXG4vLyBJbnRlcmZhY2VzIGFuZCB0eXBlIGFsaWFzZXMgY2FuIGJlIGludGVybGVhdmVkIGZyZWVseS5cbi8vXG5cbi8vIFR5cGUgZm9yIGNsYXNzZXMgdGhhdCBoYXZlIGEgYF9kaXJlY3RpdmVgIG9yIGBfZGlyZWN0aXZlc1tdYCBmaWVsZCwgdXNlZCBieVxuLy8gYHJlc29sdmVEaXJlY3RpdmVgXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGl2ZVBhcmVudCB7XG4gIF8kcGFyZW50PzogRGlyZWN0aXZlUGFyZW50O1xuICBfJGlzQ29ubmVjdGVkOiBib29sZWFuO1xuICBfX2RpcmVjdGl2ZT86IERpcmVjdGl2ZTtcbiAgX19kaXJlY3RpdmVzPzogQXJyYXk8RGlyZWN0aXZlIHwgdW5kZWZpbmVkPjtcbn1cblxuZnVuY3Rpb24gdHJ1c3RGcm9tVGVtcGxhdGVTdHJpbmcoXG4gIHRzYTogVGVtcGxhdGVTdHJpbmdzQXJyYXksXG4gIHN0cmluZ0Zyb21UU0E6IHN0cmluZ1xuKTogVHJ1c3RlZEhUTUwge1xuICAvLyBBIHNlY3VyaXR5IGNoZWNrIHRvIHByZXZlbnQgc3Bvb2Zpbmcgb2YgTGl0IHRlbXBsYXRlIHJlc3VsdHMuXG4gIC8vIEluIHRoZSBmdXR1cmUsIHdlIG1heSBiZSBhYmxlIHRvIHJlcGxhY2UgdGhpcyB3aXRoIEFycmF5LmlzVGVtcGxhdGVPYmplY3QsXG4gIC8vIHRob3VnaCB3ZSBtaWdodCBuZWVkIHRvIG1ha2UgdGhhdCBjaGVjayBpbnNpZGUgb2YgdGhlIGh0bWwgYW5kIHN2Z1xuICAvLyBmdW5jdGlvbnMsIGJlY2F1c2UgcHJlY29tcGlsZWQgdGVtcGxhdGVzIGRvbid0IGNvbWUgaW4gYXNcbiAgLy8gVGVtcGxhdGVTdHJpbmdBcnJheSBvYmplY3RzLlxuICBpZiAoIWlzQXJyYXkodHNhKSB8fCAhdHNhLmhhc093blByb3BlcnR5KCdyYXcnKSkge1xuICAgIGxldCBtZXNzYWdlID0gJ2ludmFsaWQgdGVtcGxhdGUgc3RyaW5ncyBhcnJheSc7XG4gICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICBtZXNzYWdlID0gYFxuICAgICAgICAgIEludGVybmFsIEVycm9yOiBleHBlY3RlZCB0ZW1wbGF0ZSBzdHJpbmdzIHRvIGJlIGFuIGFycmF5XG4gICAgICAgICAgd2l0aCBhICdyYXcnIGZpZWxkLiBGYWtpbmcgYSB0ZW1wbGF0ZSBzdHJpbmdzIGFycmF5IGJ5XG4gICAgICAgICAgY2FsbGluZyBodG1sIG9yIHN2ZyBsaWtlIGFuIG9yZGluYXJ5IGZ1bmN0aW9uIGlzIGVmZmVjdGl2ZWx5XG4gICAgICAgICAgdGhlIHNhbWUgYXMgY2FsbGluZyB1bnNhZmVIdG1sIGFuZCBjYW4gbGVhZCB0byBtYWpvciBzZWN1cml0eVxuICAgICAgICAgIGlzc3VlcywgZS5nLiBvcGVuaW5nIHlvdXIgY29kZSB1cCB0byBYU1MgYXR0YWNrcy5cbiAgICAgICAgICBJZiB5b3UncmUgdXNpbmcgdGhlIGh0bWwgb3Igc3ZnIHRhZ2dlZCB0ZW1wbGF0ZSBmdW5jdGlvbnMgbm9ybWFsbHlcbiAgICAgICAgICBhbmQgc3RpbGwgc2VlaW5nIHRoaXMgZXJyb3IsIHBsZWFzZSBmaWxlIGEgYnVnIGF0XG4gICAgICAgICAgaHR0cHM6Ly9naXRodWIuY29tL2xpdC9saXQvaXNzdWVzL25ldz90ZW1wbGF0ZT1idWdfcmVwb3J0Lm1kXG4gICAgICAgICAgYW5kIGluY2x1ZGUgaW5mb3JtYXRpb24gYWJvdXQgeW91ciBidWlsZCB0b29saW5nLCBpZiBhbnkuXG4gICAgICAgIGBcbiAgICAgICAgLnRyaW0oKVxuICAgICAgICAucmVwbGFjZSgvXFxuICovZywgJ1xcbicpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIH1cbiAgcmV0dXJuIHBvbGljeSAhPT0gdW5kZWZpbmVkXG4gICAgPyBwb2xpY3kuY3JlYXRlSFRNTChzdHJpbmdGcm9tVFNBKVxuICAgIDogKHN0cmluZ0Zyb21UU0EgYXMgdW5rbm93biBhcyBUcnVzdGVkSFRNTCk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBIVE1MIHN0cmluZyBmb3IgdGhlIGdpdmVuIFRlbXBsYXRlU3RyaW5nc0FycmF5IGFuZCByZXN1bHQgdHlwZVxuICogKEhUTUwgb3IgU1ZHKSwgYWxvbmcgd2l0aCB0aGUgY2FzZS1zZW5zaXRpdmUgYm91bmQgYXR0cmlidXRlIG5hbWVzIGluXG4gKiB0ZW1wbGF0ZSBvcmRlci4gVGhlIEhUTUwgY29udGFpbnMgY29tbWVudCBtYXJrZXJzIGRlbm90aW5nIHRoZSBgQ2hpbGRQYXJ0YHNcbiAqIGFuZCBzdWZmaXhlcyBvbiBib3VuZCBhdHRyaWJ1dGVzIGRlbm90aW5nIHRoZSBgQXR0cmlidXRlUGFydHNgLlxuICpcbiAqIEBwYXJhbSBzdHJpbmdzIHRlbXBsYXRlIHN0cmluZ3MgYXJyYXlcbiAqIEBwYXJhbSB0eXBlIEhUTUwgb3IgU1ZHXG4gKiBAcmV0dXJuIEFycmF5IGNvbnRhaW5pbmcgYFtodG1sLCBhdHRyTmFtZXNdYCAoYXJyYXkgcmV0dXJuZWQgZm9yIHRlcnNlbmVzcyxcbiAqICAgICB0byBhdm9pZCBvYmplY3QgZmllbGRzIHNpbmNlIHRoaXMgY29kZSBpcyBzaGFyZWQgd2l0aCBub24tbWluaWZpZWQgU1NSXG4gKiAgICAgY29kZSlcbiAqL1xuY29uc3QgZ2V0VGVtcGxhdGVIdG1sID0gKFxuICBzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSxcbiAgdHlwZTogUmVzdWx0VHlwZVxuKTogW1RydXN0ZWRIVE1MLCBBcnJheTxzdHJpbmc+XSA9PiB7XG4gIC8vIEluc2VydCBtYWtlcnMgaW50byB0aGUgdGVtcGxhdGUgSFRNTCB0byByZXByZXNlbnQgdGhlIHBvc2l0aW9uIG9mXG4gIC8vIGJpbmRpbmdzLiBUaGUgZm9sbG93aW5nIGNvZGUgc2NhbnMgdGhlIHRlbXBsYXRlIHN0cmluZ3MgdG8gZGV0ZXJtaW5lIHRoZVxuICAvLyBzeW50YWN0aWMgcG9zaXRpb24gb2YgdGhlIGJpbmRpbmdzLiBUaGV5IGNhbiBiZSBpbiB0ZXh0IHBvc2l0aW9uLCB3aGVyZVxuICAvLyB3ZSBpbnNlcnQgYW4gSFRNTCBjb21tZW50LCBhdHRyaWJ1dGUgdmFsdWUgcG9zaXRpb24sIHdoZXJlIHdlIGluc2VydCBhXG4gIC8vIHNlbnRpbmVsIHN0cmluZyBhbmQgcmUtd3JpdGUgdGhlIGF0dHJpYnV0ZSBuYW1lLCBvciBpbnNpZGUgYSB0YWcgd2hlcmVcbiAgLy8gd2UgaW5zZXJ0IHRoZSBzZW50aW5lbCBzdHJpbmcuXG4gIGNvbnN0IGwgPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gIC8vIFN0b3JlcyB0aGUgY2FzZS1zZW5zaXRpdmUgYm91bmQgYXR0cmlidXRlIG5hbWVzIGluIHRoZSBvcmRlciBvZiB0aGVpclxuICAvLyBwYXJ0cy4gRWxlbWVudFBhcnRzIGFyZSBhbHNvIHJlZmxlY3RlZCBpbiB0aGlzIGFycmF5IGFzIHVuZGVmaW5lZFxuICAvLyByYXRoZXIgdGhhbiBhIHN0cmluZywgdG8gZGlzYW1iaWd1YXRlIGZyb20gYXR0cmlidXRlIGJpbmRpbmdzLlxuICBjb25zdCBhdHRyTmFtZXM6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgbGV0IGh0bWwgPVxuICAgIHR5cGUgPT09IFNWR19SRVNVTFQgPyAnPHN2Zz4nIDogdHlwZSA9PT0gTUFUSE1MX1JFU1VMVCA/ICc8bWF0aD4nIDogJyc7XG5cbiAgLy8gV2hlbiB3ZSdyZSBpbnNpZGUgYSByYXcgdGV4dCB0YWcgKG5vdCBpdCdzIHRleHQgY29udGVudCksIHRoZSByZWdleFxuICAvLyB3aWxsIHN0aWxsIGJlIHRhZ1JlZ2V4IHNvIHdlIGNhbiBmaW5kIGF0dHJpYnV0ZXMsIGJ1dCB3aWxsIHN3aXRjaCB0b1xuICAvLyB0aGlzIHJlZ2V4IHdoZW4gdGhlIHRhZyBlbmRzLlxuICBsZXQgcmF3VGV4dEVuZFJlZ2V4OiBSZWdFeHAgfCB1bmRlZmluZWQ7XG5cbiAgLy8gVGhlIGN1cnJlbnQgcGFyc2luZyBzdGF0ZSwgcmVwcmVzZW50ZWQgYXMgYSByZWZlcmVuY2UgdG8gb25lIG9mIHRoZVxuICAvLyByZWdleGVzXG4gIGxldCByZWdleCA9IHRleHRFbmRSZWdleDtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgIGNvbnN0IHMgPSBzdHJpbmdzW2ldO1xuICAgIC8vIFRoZSBpbmRleCBvZiB0aGUgZW5kIG9mIHRoZSBsYXN0IGF0dHJpYnV0ZSBuYW1lLiBXaGVuIHRoaXMgaXNcbiAgICAvLyBwb3NpdGl2ZSBhdCBlbmQgb2YgYSBzdHJpbmcsIGl0IG1lYW5zIHdlJ3JlIGluIGFuIGF0dHJpYnV0ZSB2YWx1ZVxuICAgIC8vIHBvc2l0aW9uIGFuZCBuZWVkIHRvIHJld3JpdGUgdGhlIGF0dHJpYnV0ZSBuYW1lLlxuICAgIC8vIFdlIGFsc28gdXNlIGEgc3BlY2lhbCB2YWx1ZSBvZiAtMiB0byBpbmRpY2F0ZSB0aGF0IHdlIGVuY291bnRlcmVkXG4gICAgLy8gdGhlIGVuZCBvZiBhIHN0cmluZyBpbiBhdHRyaWJ1dGUgbmFtZSBwb3NpdGlvbi5cbiAgICBsZXQgYXR0ck5hbWVFbmRJbmRleCA9IC0xO1xuICAgIGxldCBhdHRyTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGxldCBsYXN0SW5kZXggPSAwO1xuICAgIGxldCBtYXRjaCE6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG5cbiAgICAvLyBUaGUgY29uZGl0aW9ucyBpbiB0aGlzIGxvb3AgaGFuZGxlIHRoZSBjdXJyZW50IHBhcnNlIHN0YXRlLCBhbmQgdGhlXG4gICAgLy8gYXNzaWdubWVudHMgdG8gdGhlIGByZWdleGAgdmFyaWFibGUgYXJlIHRoZSBzdGF0ZSB0cmFuc2l0aW9ucy5cbiAgICB3aGlsZSAobGFzdEluZGV4IDwgcy5sZW5ndGgpIHtcbiAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBzdGFydCBzZWFyY2hpbmcgZnJvbSB3aGVyZSB3ZSBwcmV2aW91c2x5IGxlZnQgb2ZmXG4gICAgICByZWdleC5sYXN0SW5kZXggPSBsYXN0SW5kZXg7XG4gICAgICBtYXRjaCA9IHJlZ2V4LmV4ZWMocyk7XG4gICAgICBpZiAobWF0Y2ggPT09IG51bGwpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBsYXN0SW5kZXggPSByZWdleC5sYXN0SW5kZXg7XG4gICAgICBpZiAocmVnZXggPT09IHRleHRFbmRSZWdleCkge1xuICAgICAgICBpZiAobWF0Y2hbQ09NTUVOVF9TVEFSVF0gPT09ICchLS0nKSB7XG4gICAgICAgICAgcmVnZXggPSBjb21tZW50RW5kUmVnZXg7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbQ09NTUVOVF9TVEFSVF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIFdlIHN0YXJ0ZWQgYSB3ZWlyZCBjb21tZW50LCBsaWtlIDwve1xuICAgICAgICAgIHJlZ2V4ID0gY29tbWVudDJFbmRSZWdleDtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFtUQUdfTkFNRV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChyYXdUZXh0RWxlbWVudC50ZXN0KG1hdGNoW1RBR19OQU1FXSkpIHtcbiAgICAgICAgICAgIC8vIFJlY29yZCBpZiB3ZSBlbmNvdW50ZXIgYSByYXctdGV4dCBlbGVtZW50LiBXZSdsbCBzd2l0Y2ggdG9cbiAgICAgICAgICAgIC8vIHRoaXMgcmVnZXggYXQgdGhlIGVuZCBvZiB0aGUgdGFnLlxuICAgICAgICAgICAgcmF3VGV4dEVuZFJlZ2V4ID0gbmV3IFJlZ0V4cChgPC8ke21hdGNoW1RBR19OQU1FXX1gLCAnZycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWdleCA9IHRhZ0VuZFJlZ2V4O1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoW0RZTkFNSUNfVEFHX05BTUVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAoREVWX01PREUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0JpbmRpbmdzIGluIHRhZyBuYW1lcyBhcmUgbm90IHN1cHBvcnRlZC4gUGxlYXNlIHVzZSBzdGF0aWMgdGVtcGxhdGVzIGluc3RlYWQuICcgK1xuICAgICAgICAgICAgICAgICdTZWUgaHR0cHM6Ly9saXQuZGV2L2RvY3MvdGVtcGxhdGVzL2V4cHJlc3Npb25zLyNzdGF0aWMtZXhwcmVzc2lvbnMnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWdleCA9IHRhZ0VuZFJlZ2V4O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHJlZ2V4ID09PSB0YWdFbmRSZWdleCkge1xuICAgICAgICBpZiAobWF0Y2hbRU5USVJFX01BVENIXSA9PT0gJz4nKSB7XG4gICAgICAgICAgLy8gRW5kIG9mIGEgdGFnLiBJZiB3ZSBoYWQgc3RhcnRlZCBhIHJhdy10ZXh0IGVsZW1lbnQsIHVzZSB0aGF0XG4gICAgICAgICAgLy8gcmVnZXhcbiAgICAgICAgICByZWdleCA9IHJhd1RleHRFbmRSZWdleCA/PyB0ZXh0RW5kUmVnZXg7XG4gICAgICAgICAgLy8gV2UgbWF5IGJlIGVuZGluZyBhbiB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUsIHNvIG1ha2Ugc3VyZSB3ZVxuICAgICAgICAgIC8vIGNsZWFyIGFueSBwZW5kaW5nIGF0dHJOYW1lRW5kSW5kZXhcbiAgICAgICAgICBhdHRyTmFtZUVuZEluZGV4ID0gLTE7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbQVRUUklCVVRFX05BTUVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBBdHRyaWJ1dGUgbmFtZSBwb3NpdGlvblxuICAgICAgICAgIGF0dHJOYW1lRW5kSW5kZXggPSAtMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhdHRyTmFtZUVuZEluZGV4ID0gcmVnZXgubGFzdEluZGV4IC0gbWF0Y2hbU1BBQ0VTX0FORF9FUVVBTFNdLmxlbmd0aDtcbiAgICAgICAgICBhdHRyTmFtZSA9IG1hdGNoW0FUVFJJQlVURV9OQU1FXTtcbiAgICAgICAgICByZWdleCA9XG4gICAgICAgICAgICBtYXRjaFtRVU9URV9DSEFSXSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgID8gdGFnRW5kUmVnZXhcbiAgICAgICAgICAgICAgOiBtYXRjaFtRVU9URV9DSEFSXSA9PT0gJ1wiJ1xuICAgICAgICAgICAgICAgID8gZG91YmxlUXVvdGVBdHRyRW5kUmVnZXhcbiAgICAgICAgICAgICAgICA6IHNpbmdsZVF1b3RlQXR0ckVuZFJlZ2V4O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICByZWdleCA9PT0gZG91YmxlUXVvdGVBdHRyRW5kUmVnZXggfHxcbiAgICAgICAgcmVnZXggPT09IHNpbmdsZVF1b3RlQXR0ckVuZFJlZ2V4XG4gICAgICApIHtcbiAgICAgICAgcmVnZXggPSB0YWdFbmRSZWdleDtcbiAgICAgIH0gZWxzZSBpZiAocmVnZXggPT09IGNvbW1lbnRFbmRSZWdleCB8fCByZWdleCA9PT0gY29tbWVudDJFbmRSZWdleCkge1xuICAgICAgICByZWdleCA9IHRleHRFbmRSZWdleDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE5vdCBvbmUgb2YgdGhlIGZpdmUgc3RhdGUgcmVnZXhlcywgc28gaXQgbXVzdCBiZSB0aGUgZHluYW1pY2FsbHlcbiAgICAgICAgLy8gY3JlYXRlZCByYXcgdGV4dCByZWdleCBhbmQgd2UncmUgYXQgdGhlIGNsb3NlIG9mIHRoYXQgZWxlbWVudC5cbiAgICAgICAgcmVnZXggPSB0YWdFbmRSZWdleDtcbiAgICAgICAgcmF3VGV4dEVuZFJlZ2V4ID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgLy8gSWYgd2UgaGF2ZSBhIGF0dHJOYW1lRW5kSW5kZXgsIHdoaWNoIGluZGljYXRlcyB0aGF0IHdlIHNob3VsZFxuICAgICAgLy8gcmV3cml0ZSB0aGUgYXR0cmlidXRlIG5hbWUsIGFzc2VydCB0aGF0IHdlJ3JlIGluIGEgdmFsaWQgYXR0cmlidXRlXG4gICAgICAvLyBwb3NpdGlvbiAtIGVpdGhlciBpbiBhIHRhZywgb3IgYSBxdW90ZWQgYXR0cmlidXRlIHZhbHVlLlxuICAgICAgY29uc29sZS5hc3NlcnQoXG4gICAgICAgIGF0dHJOYW1lRW5kSW5kZXggPT09IC0xIHx8XG4gICAgICAgICAgcmVnZXggPT09IHRhZ0VuZFJlZ2V4IHx8XG4gICAgICAgICAgcmVnZXggPT09IHNpbmdsZVF1b3RlQXR0ckVuZFJlZ2V4IHx8XG4gICAgICAgICAgcmVnZXggPT09IGRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4LFxuICAgICAgICAndW5leHBlY3RlZCBwYXJzZSBzdGF0ZSBCJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBXZSBoYXZlIGZvdXIgY2FzZXM6XG4gICAgLy8gIDEuIFdlJ3JlIGluIHRleHQgcG9zaXRpb24sIGFuZCBub3QgaW4gYSByYXcgdGV4dCBlbGVtZW50XG4gICAgLy8gICAgIChyZWdleCA9PT0gdGV4dEVuZFJlZ2V4KTogaW5zZXJ0IGEgY29tbWVudCBtYXJrZXIuXG4gICAgLy8gIDIuIFdlIGhhdmUgYSBub24tbmVnYXRpdmUgYXR0ck5hbWVFbmRJbmRleCB3aGljaCBtZWFucyB3ZSBuZWVkIHRvXG4gICAgLy8gICAgIHJld3JpdGUgdGhlIGF0dHJpYnV0ZSBuYW1lIHRvIGFkZCBhIGJvdW5kIGF0dHJpYnV0ZSBzdWZmaXguXG4gICAgLy8gIDMuIFdlJ3JlIGF0IHRoZSBub24tZmlyc3QgYmluZGluZyBpbiBhIG11bHRpLWJpbmRpbmcgYXR0cmlidXRlLCB1c2UgYVxuICAgIC8vICAgICBwbGFpbiBtYXJrZXIuXG4gICAgLy8gIDQuIFdlJ3JlIHNvbWV3aGVyZSBlbHNlIGluc2lkZSB0aGUgdGFnLiBJZiB3ZSdyZSBpbiBhdHRyaWJ1dGUgbmFtZVxuICAgIC8vICAgICBwb3NpdGlvbiAoYXR0ck5hbWVFbmRJbmRleCA9PT0gLTIpLCBhZGQgYSBzZXF1ZW50aWFsIHN1ZmZpeCB0b1xuICAgIC8vICAgICBnZW5lcmF0ZSBhIHVuaXF1ZSBhdHRyaWJ1dGUgbmFtZS5cblxuICAgIC8vIERldGVjdCBhIGJpbmRpbmcgbmV4dCB0byBzZWxmLWNsb3NpbmcgdGFnIGVuZCBhbmQgaW5zZXJ0IGEgc3BhY2UgdG9cbiAgICAvLyBzZXBhcmF0ZSB0aGUgbWFya2VyIGZyb20gdGhlIHRhZyBlbmQ6XG4gICAgY29uc3QgZW5kID1cbiAgICAgIHJlZ2V4ID09PSB0YWdFbmRSZWdleCAmJiBzdHJpbmdzW2kgKyAxXS5zdGFydHNXaXRoKCcvPicpID8gJyAnIDogJyc7XG4gICAgaHRtbCArPVxuICAgICAgcmVnZXggPT09IHRleHRFbmRSZWdleFxuICAgICAgICA/IHMgKyBub2RlTWFya2VyXG4gICAgICAgIDogYXR0ck5hbWVFbmRJbmRleCA+PSAwXG4gICAgICAgICAgPyAoYXR0ck5hbWVzLnB1c2goYXR0ck5hbWUhKSxcbiAgICAgICAgICAgIHMuc2xpY2UoMCwgYXR0ck5hbWVFbmRJbmRleCkgK1xuICAgICAgICAgICAgICBib3VuZEF0dHJpYnV0ZVN1ZmZpeCArXG4gICAgICAgICAgICAgIHMuc2xpY2UoYXR0ck5hbWVFbmRJbmRleCkpICtcbiAgICAgICAgICAgIG1hcmtlciArXG4gICAgICAgICAgICBlbmRcbiAgICAgICAgICA6IHMgKyBtYXJrZXIgKyAoYXR0ck5hbWVFbmRJbmRleCA9PT0gLTIgPyBpIDogZW5kKTtcbiAgfVxuXG4gIGNvbnN0IGh0bWxSZXN1bHQ6IHN0cmluZyB8IFRydXN0ZWRIVE1MID1cbiAgICBodG1sICtcbiAgICAoc3RyaW5nc1tsXSB8fCAnPD8+JykgK1xuICAgICh0eXBlID09PSBTVkdfUkVTVUxUID8gJzwvc3ZnPicgOiB0eXBlID09PSBNQVRITUxfUkVTVUxUID8gJzwvbWF0aD4nIDogJycpO1xuXG4gIC8vIFJldHVybmVkIGFzIGFuIGFycmF5IGZvciB0ZXJzZW5lc3NcbiAgcmV0dXJuIFt0cnVzdEZyb21UZW1wbGF0ZVN0cmluZyhzdHJpbmdzLCBodG1sUmVzdWx0KSwgYXR0ck5hbWVzXTtcbn07XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCB0eXBlIHtUZW1wbGF0ZX07XG5jbGFzcyBUZW1wbGF0ZSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgZWwhOiBIVE1MVGVtcGxhdGVFbGVtZW50O1xuXG4gIHBhcnRzOiBBcnJheTxUZW1wbGF0ZVBhcnQ+ID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICB7c3RyaW5ncywgWydfJGxpdFR5cGUkJ106IHR5cGV9OiBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQsXG4gICAgb3B0aW9ucz86IFJlbmRlck9wdGlvbnNcbiAgKSB7XG4gICAgbGV0IG5vZGU6IE5vZGUgfCBudWxsO1xuICAgIGxldCBub2RlSW5kZXggPSAwO1xuICAgIGxldCBhdHRyTmFtZUluZGV4ID0gMDtcbiAgICBjb25zdCBwYXJ0Q291bnQgPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgY29uc3QgcGFydHMgPSB0aGlzLnBhcnRzO1xuXG4gICAgLy8gQ3JlYXRlIHRlbXBsYXRlIGVsZW1lbnRcbiAgICBjb25zdCBbaHRtbCwgYXR0ck5hbWVzXSA9IGdldFRlbXBsYXRlSHRtbChzdHJpbmdzLCB0eXBlKTtcbiAgICB0aGlzLmVsID0gVGVtcGxhdGUuY3JlYXRlRWxlbWVudChodG1sLCBvcHRpb25zKTtcbiAgICB3YWxrZXIuY3VycmVudE5vZGUgPSB0aGlzLmVsLmNvbnRlbnQ7XG5cbiAgICAvLyBSZS1wYXJlbnQgU1ZHIG9yIE1hdGhNTCBub2RlcyBpbnRvIHRlbXBsYXRlIHJvb3RcbiAgICBpZiAodHlwZSA9PT0gU1ZHX1JFU1VMVCB8fCB0eXBlID09PSBNQVRITUxfUkVTVUxUKSB7XG4gICAgICBjb25zdCB3cmFwcGVyID0gdGhpcy5lbC5jb250ZW50LmZpcnN0Q2hpbGQhO1xuICAgICAgd3JhcHBlci5yZXBsYWNlV2l0aCguLi53cmFwcGVyLmNoaWxkTm9kZXMpO1xuICAgIH1cblxuICAgIC8vIFdhbGsgdGhlIHRlbXBsYXRlIHRvIGZpbmQgYmluZGluZyBtYXJrZXJzIGFuZCBjcmVhdGUgVGVtcGxhdGVQYXJ0c1xuICAgIHdoaWxlICgobm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpKSAhPT0gbnVsbCAmJiBwYXJ0cy5sZW5ndGggPCBwYXJ0Q291bnQpIHtcbiAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgICAgIGNvbnN0IHRhZyA9IChub2RlIGFzIEVsZW1lbnQpLmxvY2FsTmFtZTtcbiAgICAgICAgICAvLyBXYXJuIGlmIGB0ZXh0YXJlYWAgaW5jbHVkZXMgYW4gZXhwcmVzc2lvbiBhbmQgdGhyb3cgaWYgYHRlbXBsYXRlYFxuICAgICAgICAgIC8vIGRvZXMgc2luY2UgdGhlc2UgYXJlIG5vdCBzdXBwb3J0ZWQuIFdlIGRvIHRoaXMgYnkgY2hlY2tpbmdcbiAgICAgICAgICAvLyBpbm5lckhUTUwgZm9yIGFueXRoaW5nIHRoYXQgbG9va3MgbGlrZSBhIG1hcmtlci4gVGhpcyBjYXRjaGVzXG4gICAgICAgICAgLy8gY2FzZXMgbGlrZSBiaW5kaW5ncyBpbiB0ZXh0YXJlYSB0aGVyZSBtYXJrZXJzIHR1cm4gaW50byB0ZXh0IG5vZGVzLlxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIC9eKD86dGV4dGFyZWF8dGVtcGxhdGUpJC9pIS50ZXN0KHRhZykgJiZcbiAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLmlubmVySFRNTC5pbmNsdWRlcyhtYXJrZXIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBjb25zdCBtID1cbiAgICAgICAgICAgICAgYEV4cHJlc3Npb25zIGFyZSBub3Qgc3VwcG9ydGVkIGluc2lkZSBcXGAke3RhZ31cXGAgYCArXG4gICAgICAgICAgICAgIGBlbGVtZW50cy4gU2VlIGh0dHBzOi8vbGl0LmRldi9tc2cvZXhwcmVzc2lvbi1pbi0ke3RhZ30gZm9yIG1vcmUgYCArXG4gICAgICAgICAgICAgIGBpbmZvcm1hdGlvbi5gO1xuICAgICAgICAgICAgaWYgKHRhZyA9PT0gJ3RlbXBsYXRlJykge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobSk7XG4gICAgICAgICAgICB9IGVsc2UgaXNzdWVXYXJuaW5nKCcnLCBtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyAoanVzdGluZmFnbmFuaSk6IGZvciBhdHRlbXB0ZWQgZHluYW1pYyB0YWcgbmFtZXMsIHdlIGRvbid0XG4gICAgICAgIC8vIGluY3JlbWVudCB0aGUgYmluZGluZ0luZGV4LCBhbmQgaXQnbGwgYmUgb2ZmIGJ5IDEgaW4gdGhlIGVsZW1lbnRcbiAgICAgICAgLy8gYW5kIG9mZiBieSB0d28gYWZ0ZXIgaXQuXG4gICAgICAgIGlmICgobm9kZSBhcyBFbGVtZW50KS5oYXNBdHRyaWJ1dGVzKCkpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgKG5vZGUgYXMgRWxlbWVudCkuZ2V0QXR0cmlidXRlTmFtZXMoKSkge1xuICAgICAgICAgICAgaWYgKG5hbWUuZW5kc1dpdGgoYm91bmRBdHRyaWJ1dGVTdWZmaXgpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHJlYWxOYW1lID0gYXR0ck5hbWVzW2F0dHJOYW1lSW5kZXgrK107XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gKG5vZGUgYXMgRWxlbWVudCkuZ2V0QXR0cmlidXRlKG5hbWUpITtcbiAgICAgICAgICAgICAgY29uc3Qgc3RhdGljcyA9IHZhbHVlLnNwbGl0KG1hcmtlcik7XG4gICAgICAgICAgICAgIGNvbnN0IG0gPSAvKFsuP0BdKT8oLiopLy5leGVjKHJlYWxOYW1lKSE7XG4gICAgICAgICAgICAgIHBhcnRzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IEFUVFJJQlVURV9QQVJULFxuICAgICAgICAgICAgICAgIGluZGV4OiBub2RlSW5kZXgsXG4gICAgICAgICAgICAgICAgbmFtZTogbVsyXSxcbiAgICAgICAgICAgICAgICBzdHJpbmdzOiBzdGF0aWNzLFxuICAgICAgICAgICAgICAgIGN0b3I6XG4gICAgICAgICAgICAgICAgICBtWzFdID09PSAnLidcbiAgICAgICAgICAgICAgICAgICAgPyBQcm9wZXJ0eVBhcnRcbiAgICAgICAgICAgICAgICAgICAgOiBtWzFdID09PSAnPydcbiAgICAgICAgICAgICAgICAgICAgICA/IEJvb2xlYW5BdHRyaWJ1dGVQYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgOiBtWzFdID09PSAnQCdcbiAgICAgICAgICAgICAgICAgICAgICAgID8gRXZlbnRQYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICA6IEF0dHJpYnV0ZVBhcnQsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5hbWUuc3RhcnRzV2l0aChtYXJrZXIpKSB7XG4gICAgICAgICAgICAgIHBhcnRzLnB1c2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IEVMRU1FTlRfUEFSVCxcbiAgICAgICAgICAgICAgICBpbmRleDogbm9kZUluZGV4LFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPIChqdXN0aW5mYWduYW5pKTogYmVuY2htYXJrIHRoZSByZWdleCBhZ2FpbnN0IHRlc3RpbmcgZm9yIGVhY2hcbiAgICAgICAgLy8gb2YgdGhlIDMgcmF3IHRleHQgZWxlbWVudCBuYW1lcy5cbiAgICAgICAgaWYgKHJhd1RleHRFbGVtZW50LnRlc3QoKG5vZGUgYXMgRWxlbWVudCkudGFnTmFtZSkpIHtcbiAgICAgICAgICAvLyBGb3IgcmF3IHRleHQgZWxlbWVudHMgd2UgbmVlZCB0byBzcGxpdCB0aGUgdGV4dCBjb250ZW50IG9uXG4gICAgICAgICAgLy8gbWFya2VycywgY3JlYXRlIGEgVGV4dCBub2RlIGZvciBlYWNoIHNlZ21lbnQsIGFuZCBjcmVhdGVcbiAgICAgICAgICAvLyBhIFRlbXBsYXRlUGFydCBmb3IgZWFjaCBtYXJrZXIuXG4gICAgICAgICAgY29uc3Qgc3RyaW5ncyA9IChub2RlIGFzIEVsZW1lbnQpLnRleHRDb250ZW50IS5zcGxpdChtYXJrZXIpO1xuICAgICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICAgICAgICBpZiAobGFzdEluZGV4ID4gMCkge1xuICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkudGV4dENvbnRlbnQgPSB0cnVzdGVkVHlwZXNcbiAgICAgICAgICAgICAgPyAodHJ1c3RlZFR5cGVzLmVtcHR5U2NyaXB0IGFzIHVua25vd24gYXMgJycpXG4gICAgICAgICAgICAgIDogJyc7XG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSBhIG5ldyB0ZXh0IG5vZGUgZm9yIGVhY2ggbGl0ZXJhbCBzZWN0aW9uXG4gICAgICAgICAgICAvLyBUaGVzZSBub2RlcyBhcmUgYWxzbyB1c2VkIGFzIHRoZSBtYXJrZXJzIGZvciBub2RlIHBhcnRzXG4gICAgICAgICAgICAvLyBXZSBjYW4ndCB1c2UgZW1wdHkgdGV4dCBub2RlcyBhcyBtYXJrZXJzIGJlY2F1c2UgdGhleSdyZVxuICAgICAgICAgICAgLy8gbm9ybWFsaXplZCB3aGVuIGNsb25pbmcgaW4gSUUgKGNvdWxkIHNpbXBsaWZ5IHdoZW5cbiAgICAgICAgICAgIC8vIElFIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQpXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhc3RJbmRleDsgaSsrKSB7XG4gICAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLmFwcGVuZChzdHJpbmdzW2ldLCBjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgICAgICAgIC8vIFdhbGsgcGFzdCB0aGUgbWFya2VyIG5vZGUgd2UganVzdCBhZGRlZFxuICAgICAgICAgICAgICB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgICAgcGFydHMucHVzaCh7dHlwZTogQ0hJTERfUEFSVCwgaW5kZXg6ICsrbm9kZUluZGV4fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBOb3RlIGJlY2F1c2UgdGhpcyBtYXJrZXIgaXMgYWRkZWQgYWZ0ZXIgdGhlIHdhbGtlcidzIGN1cnJlbnRcbiAgICAgICAgICAgIC8vIG5vZGUsIGl0IHdpbGwgYmUgd2Fsa2VkIHRvIGluIHRoZSBvdXRlciBsb29wIChhbmQgaWdub3JlZCksIHNvXG4gICAgICAgICAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIGFkanVzdCBub2RlSW5kZXggaGVyZVxuICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkuYXBwZW5kKHN0cmluZ3NbbGFzdEluZGV4XSwgY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSA4KSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSAobm9kZSBhcyBDb21tZW50KS5kYXRhO1xuICAgICAgICBpZiAoZGF0YSA9PT0gbWFya2VyTWF0Y2gpIHtcbiAgICAgICAgICBwYXJ0cy5wdXNoKHt0eXBlOiBDSElMRF9QQVJULCBpbmRleDogbm9kZUluZGV4fSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IGkgPSAtMTtcbiAgICAgICAgICB3aGlsZSAoKGkgPSAobm9kZSBhcyBDb21tZW50KS5kYXRhLmluZGV4T2YobWFya2VyLCBpICsgMSkpICE9PSAtMSkge1xuICAgICAgICAgICAgLy8gQ29tbWVudCBub2RlIGhhcyBhIGJpbmRpbmcgbWFya2VyIGluc2lkZSwgbWFrZSBhbiBpbmFjdGl2ZSBwYXJ0XG4gICAgICAgICAgICAvLyBUaGUgYmluZGluZyB3b24ndCB3b3JrLCBidXQgc3Vic2VxdWVudCBiaW5kaW5ncyB3aWxsXG4gICAgICAgICAgICBwYXJ0cy5wdXNoKHt0eXBlOiBDT01NRU5UX1BBUlQsIGluZGV4OiBub2RlSW5kZXh9KTtcbiAgICAgICAgICAgIC8vIE1vdmUgdG8gdGhlIGVuZCBvZiB0aGUgbWF0Y2hcbiAgICAgICAgICAgIGkgKz0gbWFya2VyLmxlbmd0aCAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBub2RlSW5kZXgrKztcbiAgICB9XG5cbiAgICBpZiAoREVWX01PREUpIHtcbiAgICAgIC8vIElmIHRoZXJlIHdhcyBhIGR1cGxpY2F0ZSBhdHRyaWJ1dGUgb24gYSB0YWcsIHRoZW4gd2hlbiB0aGUgdGFnIGlzXG4gICAgICAvLyBwYXJzZWQgaW50byBhbiBlbGVtZW50IHRoZSBhdHRyaWJ1dGUgZ2V0cyBkZS1kdXBsaWNhdGVkLiBXZSBjYW4gZGV0ZWN0XG4gICAgICAvLyB0aGlzIG1pc21hdGNoIGlmIHdlIGhhdmVuJ3QgcHJlY2lzZWx5IGNvbnN1bWVkIGV2ZXJ5IGF0dHJpYnV0ZSBuYW1lXG4gICAgICAvLyB3aGVuIHByZXBhcmluZyB0aGUgdGVtcGxhdGUuIFRoaXMgd29ya3MgYmVjYXVzZSBgYXR0ck5hbWVzYCBpcyBidWlsdFxuICAgICAgLy8gZnJvbSB0aGUgdGVtcGxhdGUgc3RyaW5nIGFuZCBgYXR0ck5hbWVJbmRleGAgY29tZXMgZnJvbSBwcm9jZXNzaW5nIHRoZVxuICAgICAgLy8gcmVzdWx0aW5nIERPTS5cbiAgICAgIGlmIChhdHRyTmFtZXMubGVuZ3RoICE9PSBhdHRyTmFtZUluZGV4KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRGV0ZWN0ZWQgZHVwbGljYXRlIGF0dHJpYnV0ZSBiaW5kaW5ncy4gVGhpcyBvY2N1cnMgaWYgeW91ciB0ZW1wbGF0ZSBgICtcbiAgICAgICAgICAgIGBoYXMgZHVwbGljYXRlIGF0dHJpYnV0ZXMgb24gYW4gZWxlbWVudCB0YWcuIEZvciBleGFtcGxlIGAgK1xuICAgICAgICAgICAgYFwiPGlucHV0ID9kaXNhYmxlZD1cXCR7dHJ1ZX0gP2Rpc2FibGVkPVxcJHtmYWxzZX0+XCIgY29udGFpbnMgYSBgICtcbiAgICAgICAgICAgIGBkdXBsaWNhdGUgXCJkaXNhYmxlZFwiIGF0dHJpYnV0ZS4gVGhlIGVycm9yIHdhcyBkZXRlY3RlZCBpbiBgICtcbiAgICAgICAgICAgIGB0aGUgZm9sbG93aW5nIHRlbXBsYXRlOiBcXG5gICtcbiAgICAgICAgICAgICdgJyArXG4gICAgICAgICAgICBzdHJpbmdzLmpvaW4oJyR7Li4ufScpICtcbiAgICAgICAgICAgICdgJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdlIGNvdWxkIHNldCB3YWxrZXIuY3VycmVudE5vZGUgdG8gYW5vdGhlciBub2RlIGhlcmUgdG8gcHJldmVudCBhIG1lbW9yeVxuICAgIC8vIGxlYWssIGJ1dCBldmVyeSB0aW1lIHdlIHByZXBhcmUgYSB0ZW1wbGF0ZSwgd2UgaW1tZWRpYXRlbHkgcmVuZGVyIGl0XG4gICAgLy8gYW5kIHJlLXVzZSB0aGUgd2Fsa2VyIGluIG5ldyBUZW1wbGF0ZUluc3RhbmNlLl9jbG9uZSgpLlxuICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICBraW5kOiAndGVtcGxhdGUgcHJlcCcsXG4gICAgICAgIHRlbXBsYXRlOiB0aGlzLFxuICAgICAgICBjbG9uYWJsZVRlbXBsYXRlOiB0aGlzLmVsLFxuICAgICAgICBwYXJ0czogdGhpcy5wYXJ0cyxcbiAgICAgICAgc3RyaW5ncyxcbiAgICAgIH0pO1xuICB9XG5cbiAgLy8gT3ZlcnJpZGRlbiB2aWEgYGxpdEh0bWxQb2x5ZmlsbFN1cHBvcnRgIHRvIHByb3ZpZGUgcGxhdGZvcm0gc3VwcG9ydC5cbiAgLyoqIEBub2NvbGxhcHNlICovXG4gIHN0YXRpYyBjcmVhdGVFbGVtZW50KGh0bWw6IFRydXN0ZWRIVE1MLCBfb3B0aW9ucz86IFJlbmRlck9wdGlvbnMpIHtcbiAgICBjb25zdCBlbCA9IGQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICBlbC5pbm5lckhUTUwgPSBodG1sIGFzIHVua25vd24gYXMgc3RyaW5nO1xuICAgIHJldHVybiBlbDtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERpc2Nvbm5lY3RhYmxlIHtcbiAgXyRwYXJlbnQ/OiBEaXNjb25uZWN0YWJsZTtcbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPjtcbiAgLy8gUmF0aGVyIHRoYW4gaG9sZCBjb25uZWN0aW9uIHN0YXRlIG9uIGluc3RhbmNlcywgRGlzY29ubmVjdGFibGVzIHJlY3Vyc2l2ZWx5XG4gIC8vIGZldGNoIHRoZSBjb25uZWN0aW9uIHN0YXRlIGZyb20gdGhlIFJvb3RQYXJ0IHRoZXkgYXJlIGNvbm5lY3RlZCBpbiB2aWFcbiAgLy8gZ2V0dGVycyB1cCB0aGUgRGlzY29ubmVjdGFibGUgdHJlZSB2aWEgXyRwYXJlbnQgcmVmZXJlbmNlcy4gVGhpcyBwdXNoZXMgdGhlXG4gIC8vIGNvc3Qgb2YgdHJhY2tpbmcgdGhlIGlzQ29ubmVjdGVkIHN0YXRlIHRvIGBBc3luY0RpcmVjdGl2ZXNgLCBhbmQgYXZvaWRzXG4gIC8vIG5lZWRpbmcgdG8gcGFzcyBhbGwgRGlzY29ubmVjdGFibGVzIChwYXJ0cywgdGVtcGxhdGUgaW5zdGFuY2VzLCBhbmRcbiAgLy8gZGlyZWN0aXZlcykgdGhlaXIgY29ubmVjdGlvbiBzdGF0ZSBlYWNoIHRpbWUgaXQgY2hhbmdlcywgd2hpY2ggd291bGQgYmVcbiAgLy8gY29zdGx5IGZvciB0cmVlcyB0aGF0IGhhdmUgbm8gQXN5bmNEaXJlY3RpdmVzLlxuICBfJGlzQ29ubmVjdGVkOiBib29sZWFuO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlRGlyZWN0aXZlKFxuICBwYXJ0OiBDaGlsZFBhcnQgfCBBdHRyaWJ1dGVQYXJ0IHwgRWxlbWVudFBhcnQsXG4gIHZhbHVlOiB1bmtub3duLFxuICBwYXJlbnQ6IERpcmVjdGl2ZVBhcmVudCA9IHBhcnQsXG4gIGF0dHJpYnV0ZUluZGV4PzogbnVtYmVyXG4pOiB1bmtub3duIHtcbiAgLy8gQmFpbCBlYXJseSBpZiB0aGUgdmFsdWUgaXMgZXhwbGljaXRseSBub0NoYW5nZS4gTm90ZSwgdGhpcyBtZWFucyBhbnlcbiAgLy8gbmVzdGVkIGRpcmVjdGl2ZSBpcyBzdGlsbCBhdHRhY2hlZCBhbmQgaXMgbm90IHJ1bi5cbiAgaWYgKHZhbHVlID09PSBub0NoYW5nZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBsZXQgY3VycmVudERpcmVjdGl2ZSA9XG4gICAgYXR0cmlidXRlSW5kZXggIT09IHVuZGVmaW5lZFxuICAgICAgPyAocGFyZW50IGFzIEF0dHJpYnV0ZVBhcnQpLl9fZGlyZWN0aXZlcz8uW2F0dHJpYnV0ZUluZGV4XVxuICAgICAgOiAocGFyZW50IGFzIENoaWxkUGFydCB8IEVsZW1lbnRQYXJ0IHwgRGlyZWN0aXZlKS5fX2RpcmVjdGl2ZTtcbiAgY29uc3QgbmV4dERpcmVjdGl2ZUNvbnN0cnVjdG9yID0gaXNQcmltaXRpdmUodmFsdWUpXG4gICAgPyB1bmRlZmluZWRcbiAgICA6IC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgICAodmFsdWUgYXMgRGlyZWN0aXZlUmVzdWx0KVsnXyRsaXREaXJlY3RpdmUkJ107XG4gIGlmIChjdXJyZW50RGlyZWN0aXZlPy5jb25zdHJ1Y3RvciAhPT0gbmV4dERpcmVjdGl2ZUNvbnN0cnVjdG9yKSB7XG4gICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICBjdXJyZW50RGlyZWN0aXZlPy5bJ18kbm90aWZ5RGlyZWN0aXZlQ29ubmVjdGlvbkNoYW5nZWQnXT8uKGZhbHNlKTtcbiAgICBpZiAobmV4dERpcmVjdGl2ZUNvbnN0cnVjdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGN1cnJlbnREaXJlY3RpdmUgPSB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnREaXJlY3RpdmUgPSBuZXcgbmV4dERpcmVjdGl2ZUNvbnN0cnVjdG9yKHBhcnQgYXMgUGFydEluZm8pO1xuICAgICAgY3VycmVudERpcmVjdGl2ZS5fJGluaXRpYWxpemUocGFydCwgcGFyZW50LCBhdHRyaWJ1dGVJbmRleCk7XG4gICAgfVxuICAgIGlmIChhdHRyaWJ1dGVJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAoKHBhcmVudCBhcyBBdHRyaWJ1dGVQYXJ0KS5fX2RpcmVjdGl2ZXMgPz89IFtdKVthdHRyaWJ1dGVJbmRleF0gPVxuICAgICAgICBjdXJyZW50RGlyZWN0aXZlO1xuICAgIH0gZWxzZSB7XG4gICAgICAocGFyZW50IGFzIENoaWxkUGFydCB8IERpcmVjdGl2ZSkuX19kaXJlY3RpdmUgPSBjdXJyZW50RGlyZWN0aXZlO1xuICAgIH1cbiAgfVxuICBpZiAoY3VycmVudERpcmVjdGl2ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFsdWUgPSByZXNvbHZlRGlyZWN0aXZlKFxuICAgICAgcGFydCxcbiAgICAgIGN1cnJlbnREaXJlY3RpdmUuXyRyZXNvbHZlKHBhcnQsICh2YWx1ZSBhcyBEaXJlY3RpdmVSZXN1bHQpLnZhbHVlcyksXG4gICAgICBjdXJyZW50RGlyZWN0aXZlLFxuICAgICAgYXR0cmlidXRlSW5kZXhcbiAgICApO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZXhwb3J0IHR5cGUge1RlbXBsYXRlSW5zdGFuY2V9O1xuLyoqXG4gKiBBbiB1cGRhdGVhYmxlIGluc3RhbmNlIG9mIGEgVGVtcGxhdGUuIEhvbGRzIHJlZmVyZW5jZXMgdG8gdGhlIFBhcnRzIHVzZWQgdG9cbiAqIHVwZGF0ZSB0aGUgdGVtcGxhdGUgaW5zdGFuY2UuXG4gKi9cbmNsYXNzIFRlbXBsYXRlSW5zdGFuY2UgaW1wbGVtZW50cyBEaXNjb25uZWN0YWJsZSB7XG4gIF8kdGVtcGxhdGU6IFRlbXBsYXRlO1xuICBfJHBhcnRzOiBBcnJheTxQYXJ0IHwgdW5kZWZpbmVkPiA9IFtdO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRwYXJlbnQ6IENoaWxkUGFydDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+ID0gdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKHRlbXBsYXRlOiBUZW1wbGF0ZSwgcGFyZW50OiBDaGlsZFBhcnQpIHtcbiAgICB0aGlzLl8kdGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICB0aGlzLl8kcGFyZW50ID0gcGFyZW50O1xuICB9XG5cbiAgLy8gQ2FsbGVkIGJ5IENoaWxkUGFydCBwYXJlbnROb2RlIGdldHRlclxuICBnZXQgcGFyZW50Tm9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fJHBhcmVudC5wYXJlbnROb2RlO1xuICB9XG5cbiAgLy8gU2VlIGNvbW1lbnQgaW4gRGlzY29ubmVjdGFibGUgaW50ZXJmYWNlIGZvciB3aHkgdGhpcyBpcyBhIGdldHRlclxuICBnZXQgXyRpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fJHBhcmVudC5fJGlzQ29ubmVjdGVkO1xuICB9XG5cbiAgLy8gVGhpcyBtZXRob2QgaXMgc2VwYXJhdGUgZnJvbSB0aGUgY29uc3RydWN0b3IgYmVjYXVzZSB3ZSBuZWVkIHRvIHJldHVybiBhXG4gIC8vIERvY3VtZW50RnJhZ21lbnQgYW5kIHdlIGRvbid0IHdhbnQgdG8gaG9sZCBvbnRvIGl0IHdpdGggYW4gaW5zdGFuY2UgZmllbGQuXG4gIF9jbG9uZShvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qge1xuICAgICAgZWw6IHtjb250ZW50fSxcbiAgICAgIHBhcnRzOiBwYXJ0cyxcbiAgICB9ID0gdGhpcy5fJHRlbXBsYXRlO1xuICAgIGNvbnN0IGZyYWdtZW50ID0gKG9wdGlvbnM/LmNyZWF0aW9uU2NvcGUgPz8gZCkuaW1wb3J0Tm9kZShjb250ZW50LCB0cnVlKTtcbiAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBmcmFnbWVudDtcblxuICAgIGxldCBub2RlID0gd2Fsa2VyLm5leHROb2RlKCkhO1xuICAgIGxldCBub2RlSW5kZXggPSAwO1xuICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgIGxldCB0ZW1wbGF0ZVBhcnQgPSBwYXJ0c1swXTtcblxuICAgIHdoaWxlICh0ZW1wbGF0ZVBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKG5vZGVJbmRleCA9PT0gdGVtcGxhdGVQYXJ0LmluZGV4KSB7XG4gICAgICAgIGxldCBwYXJ0OiBQYXJ0IHwgdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGVtcGxhdGVQYXJ0LnR5cGUgPT09IENISUxEX1BBUlQpIHtcbiAgICAgICAgICBwYXJ0ID0gbmV3IENoaWxkUGFydChcbiAgICAgICAgICAgIG5vZGUgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgICBub2RlLm5leHRTaWJsaW5nLFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRlbXBsYXRlUGFydC50eXBlID09PSBBVFRSSUJVVEVfUEFSVCkge1xuICAgICAgICAgIHBhcnQgPSBuZXcgdGVtcGxhdGVQYXJ0LmN0b3IoXG4gICAgICAgICAgICBub2RlIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgICAgdGVtcGxhdGVQYXJ0Lm5hbWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVBhcnQuc3RyaW5ncyxcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBvcHRpb25zXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0ZW1wbGF0ZVBhcnQudHlwZSA9PT0gRUxFTUVOVF9QQVJUKSB7XG4gICAgICAgICAgcGFydCA9IG5ldyBFbGVtZW50UGFydChub2RlIGFzIEhUTUxFbGVtZW50LCB0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl8kcGFydHMucHVzaChwYXJ0KTtcbiAgICAgICAgdGVtcGxhdGVQYXJ0ID0gcGFydHNbKytwYXJ0SW5kZXhdO1xuICAgICAgfVxuICAgICAgaWYgKG5vZGVJbmRleCAhPT0gdGVtcGxhdGVQYXJ0Py5pbmRleCkge1xuICAgICAgICBub2RlID0gd2Fsa2VyLm5leHROb2RlKCkhO1xuICAgICAgICBub2RlSW5kZXgrKztcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gV2UgbmVlZCB0byBzZXQgdGhlIGN1cnJlbnROb2RlIGF3YXkgZnJvbSB0aGUgY2xvbmVkIHRyZWUgc28gdGhhdCB3ZVxuICAgIC8vIGRvbid0IGhvbGQgb250byB0aGUgdHJlZSBldmVuIGlmIHRoZSB0cmVlIGlzIGRldGFjaGVkIGFuZCBzaG91bGQgYmVcbiAgICAvLyBmcmVlZC5cbiAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBkO1xuICAgIHJldHVybiBmcmFnbWVudDtcbiAgfVxuXG4gIF91cGRhdGUodmFsdWVzOiBBcnJheTx1bmtub3duPikge1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgdGhpcy5fJHBhcnRzKSB7XG4gICAgICBpZiAocGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICAgIGtpbmQ6ICdzZXQgcGFydCcsXG4gICAgICAgICAgICBwYXJ0LFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlc1tpXSxcbiAgICAgICAgICAgIHZhbHVlSW5kZXg6IGksXG4gICAgICAgICAgICB2YWx1ZXMsXG4gICAgICAgICAgICB0ZW1wbGF0ZUluc3RhbmNlOiB0aGlzLFxuICAgICAgICAgIH0pO1xuICAgICAgICBpZiAoKHBhcnQgYXMgQXR0cmlidXRlUGFydCkuc3RyaW5ncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgKHBhcnQgYXMgQXR0cmlidXRlUGFydCkuXyRzZXRWYWx1ZSh2YWx1ZXMsIHBhcnQgYXMgQXR0cmlidXRlUGFydCwgaSk7XG4gICAgICAgICAgLy8gVGhlIG51bWJlciBvZiB2YWx1ZXMgdGhlIHBhcnQgY29uc3VtZXMgaXMgcGFydC5zdHJpbmdzLmxlbmd0aCAtIDFcbiAgICAgICAgICAvLyBzaW5jZSB2YWx1ZXMgYXJlIGluIGJldHdlZW4gdGVtcGxhdGUgc3BhbnMuIFdlIGluY3JlbWVudCBpIGJ5IDFcbiAgICAgICAgICAvLyBsYXRlciBpbiB0aGUgbG9vcCwgc28gaW5jcmVtZW50IGl0IGJ5IHBhcnQuc3RyaW5ncy5sZW5ndGggLSAyIGhlcmVcbiAgICAgICAgICBpICs9IChwYXJ0IGFzIEF0dHJpYnV0ZVBhcnQpLnN0cmluZ3MhLmxlbmd0aCAtIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFydC5fJHNldFZhbHVlKHZhbHVlc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gIH1cbn1cblxuLypcbiAqIFBhcnRzXG4gKi9cbnR5cGUgQXR0cmlidXRlVGVtcGxhdGVQYXJ0ID0ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgQVRUUklCVVRFX1BBUlQ7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgY3RvcjogdHlwZW9mIEF0dHJpYnV0ZVBhcnQ7XG4gIHJlYWRvbmx5IHN0cmluZ3M6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPjtcbn07XG50eXBlIENoaWxkVGVtcGxhdGVQYXJ0ID0ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgQ0hJTERfUEFSVDtcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbn07XG50eXBlIEVsZW1lbnRUZW1wbGF0ZVBhcnQgPSB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBFTEVNRU5UX1BBUlQ7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG59O1xudHlwZSBDb21tZW50VGVtcGxhdGVQYXJ0ID0ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgQ09NTUVOVF9QQVJUO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xufTtcblxuLyoqXG4gKiBBIFRlbXBsYXRlUGFydCByZXByZXNlbnRzIGEgZHluYW1pYyBwYXJ0IGluIGEgdGVtcGxhdGUsIGJlZm9yZSB0aGUgdGVtcGxhdGVcbiAqIGlzIGluc3RhbnRpYXRlZC4gV2hlbiBhIHRlbXBsYXRlIGlzIGluc3RhbnRpYXRlZCBQYXJ0cyBhcmUgY3JlYXRlZCBmcm9tXG4gKiBUZW1wbGF0ZVBhcnRzLlxuICovXG50eXBlIFRlbXBsYXRlUGFydCA9XG4gIHwgQ2hpbGRUZW1wbGF0ZVBhcnRcbiAgfCBBdHRyaWJ1dGVUZW1wbGF0ZVBhcnRcbiAgfCBFbGVtZW50VGVtcGxhdGVQYXJ0XG4gIHwgQ29tbWVudFRlbXBsYXRlUGFydDtcblxuZXhwb3J0IHR5cGUgUGFydCA9XG4gIHwgQ2hpbGRQYXJ0XG4gIHwgQXR0cmlidXRlUGFydFxuICB8IFByb3BlcnR5UGFydFxuICB8IEJvb2xlYW5BdHRyaWJ1dGVQYXJ0XG4gIHwgRWxlbWVudFBhcnRcbiAgfCBFdmVudFBhcnQ7XG5cbmV4cG9ydCB0eXBlIHtDaGlsZFBhcnR9O1xuY2xhc3MgQ2hpbGRQYXJ0IGltcGxlbWVudHMgRGlzY29ubmVjdGFibGUge1xuICByZWFkb25seSB0eXBlID0gQ0hJTERfUEFSVDtcbiAgcmVhZG9ubHkgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgXyRjb21taXR0ZWRWYWx1ZTogdW5rbm93biA9IG5vdGhpbmc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX19kaXJlY3RpdmU/OiBEaXJlY3RpdmU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRzdGFydE5vZGU6IENoaWxkTm9kZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGVuZE5vZGU6IENoaWxkTm9kZSB8IG51bGw7XG4gIHByaXZhdGUgX3RleHRTYW5pdGl6ZXI6IFZhbHVlU2FuaXRpemVyIHwgdW5kZWZpbmVkO1xuICAvKiogQGludGVybmFsICovXG4gIF8kcGFyZW50OiBEaXNjb25uZWN0YWJsZSB8IHVuZGVmaW5lZDtcbiAgLyoqXG4gICAqIENvbm5lY3Rpb24gc3RhdGUgZm9yIFJvb3RQYXJ0cyBvbmx5IChpLmUuIENoaWxkUGFydCB3aXRob3V0IF8kcGFyZW50XG4gICAqIHJldHVybmVkIGZyb20gdG9wLWxldmVsIGByZW5kZXJgKS4gVGhpcyBmaWVsZCBpcyB1bnVzZWQgb3RoZXJ3aXNlLiBUaGVcbiAgICogaW50ZW50aW9uIHdvdWxkIGJlIGNsZWFyZXIgaWYgd2UgbWFkZSBgUm9vdFBhcnRgIGEgc3ViY2xhc3Mgb2YgYENoaWxkUGFydGBcbiAgICogd2l0aCB0aGlzIGZpZWxkIChhbmQgYSBkaWZmZXJlbnQgXyRpc0Nvbm5lY3RlZCBnZXR0ZXIpLCBidXQgdGhlIHN1YmNsYXNzXG4gICAqIGNhdXNlZCBhIHBlcmYgcmVncmVzc2lvbiwgcG9zc2libHkgZHVlIHRvIG1ha2luZyBjYWxsIHNpdGVzIHBvbHltb3JwaGljLlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9faXNDb25uZWN0ZWQ6IGJvb2xlYW47XG5cbiAgLy8gU2VlIGNvbW1lbnQgaW4gRGlzY29ubmVjdGFibGUgaW50ZXJmYWNlIGZvciB3aHkgdGhpcyBpcyBhIGdldHRlclxuICBnZXQgXyRpc0Nvbm5lY3RlZCgpIHtcbiAgICAvLyBDaGlsZFBhcnRzIHRoYXQgYXJlIG5vdCBhdCB0aGUgcm9vdCBzaG91bGQgYWx3YXlzIGJlIGNyZWF0ZWQgd2l0aCBhXG4gICAgLy8gcGFyZW50OyBvbmx5IFJvb3RDaGlsZE5vZGUncyB3b24ndCwgc28gdGhleSByZXR1cm4gdGhlIGxvY2FsIGlzQ29ubmVjdGVkXG4gICAgLy8gc3RhdGVcbiAgICByZXR1cm4gdGhpcy5fJHBhcmVudD8uXyRpc0Nvbm5lY3RlZCA/PyB0aGlzLl9faXNDb25uZWN0ZWQ7XG4gIH1cblxuICAvLyBUaGUgZm9sbG93aW5nIGZpZWxkcyB3aWxsIGJlIHBhdGNoZWQgb250byBDaGlsZFBhcnRzIHdoZW4gcmVxdWlyZWQgYnlcbiAgLy8gQXN5bmNEaXJlY3RpdmVcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+ID0gdW5kZWZpbmVkO1xuICAvKiogQGludGVybmFsICovXG4gIF8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQ/KFxuICAgIGlzQ29ubmVjdGVkOiBib29sZWFuLFxuICAgIHJlbW92ZUZyb21QYXJlbnQ/OiBib29sZWFuLFxuICAgIGZyb20/OiBudW1iZXJcbiAgKTogdm9pZDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHJlcGFyZW50RGlzY29ubmVjdGFibGVzPyhwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlKTogdm9pZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzdGFydE5vZGU6IENoaWxkTm9kZSxcbiAgICBlbmROb2RlOiBDaGlsZE5vZGUgfCBudWxsLFxuICAgIHBhcmVudDogVGVtcGxhdGVJbnN0YW5jZSB8IENoaWxkUGFydCB8IHVuZGVmaW5lZCxcbiAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHRoaXMuXyRzdGFydE5vZGUgPSBzdGFydE5vZGU7XG4gICAgdGhpcy5fJGVuZE5vZGUgPSBlbmROb2RlO1xuICAgIHRoaXMuXyRwYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAvLyBOb3RlIF9faXNDb25uZWN0ZWQgaXMgb25seSBldmVyIGFjY2Vzc2VkIG9uIFJvb3RQYXJ0cyAoaS5lLiB3aGVuIHRoZXJlIGlzXG4gICAgLy8gbm8gXyRwYXJlbnQpOyB0aGUgdmFsdWUgb24gYSBub24tcm9vdC1wYXJ0IGlzIFwiZG9uJ3QgY2FyZVwiLCBidXQgY2hlY2tpbmdcbiAgICAvLyBmb3IgcGFyZW50IHdvdWxkIGJlIG1vcmUgY29kZVxuICAgIHRoaXMuX19pc0Nvbm5lY3RlZCA9IG9wdGlvbnM/LmlzQ29ubmVjdGVkID8/IHRydWU7XG4gICAgaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgICAgLy8gRXhwbGljaXRseSBpbml0aWFsaXplIGZvciBjb25zaXN0ZW50IGNsYXNzIHNoYXBlLlxuICAgICAgdGhpcy5fdGV4dFNhbml0aXplciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhlIHBhcmVudCBub2RlIGludG8gd2hpY2ggdGhlIHBhcnQgcmVuZGVycyBpdHMgY29udGVudC5cbiAgICpcbiAgICogQSBDaGlsZFBhcnQncyBjb250ZW50IGNvbnNpc3RzIG9mIGEgcmFuZ2Ugb2YgYWRqYWNlbnQgY2hpbGQgbm9kZXMgb2ZcbiAgICogYC5wYXJlbnROb2RlYCwgcG9zc2libHkgYm9yZGVyZWQgYnkgJ21hcmtlciBub2RlcycgKGAuc3RhcnROb2RlYCBhbmRcbiAgICogYC5lbmROb2RlYCkuXG4gICAqXG4gICAqIC0gSWYgYm90aCBgLnN0YXJ0Tm9kZWAgYW5kIGAuZW5kTm9kZWAgYXJlIG5vbi1udWxsLCB0aGVuIHRoZSBwYXJ0J3MgY29udGVudFxuICAgKiBjb25zaXN0cyBvZiBhbGwgc2libGluZ3MgYmV0d2VlbiBgLnN0YXJ0Tm9kZWAgYW5kIGAuZW5kTm9kZWAsIGV4Y2x1c2l2ZWx5LlxuICAgKlxuICAgKiAtIElmIGAuc3RhcnROb2RlYCBpcyBub24tbnVsbCBidXQgYC5lbmROb2RlYCBpcyBudWxsLCB0aGVuIHRoZSBwYXJ0J3NcbiAgICogY29udGVudCBjb25zaXN0cyBvZiBhbGwgc2libGluZ3MgZm9sbG93aW5nIGAuc3RhcnROb2RlYCwgdXAgdG8gYW5kXG4gICAqIGluY2x1ZGluZyB0aGUgbGFzdCBjaGlsZCBvZiBgLnBhcmVudE5vZGVgLiBJZiBgLmVuZE5vZGVgIGlzIG5vbi1udWxsLCB0aGVuXG4gICAqIGAuc3RhcnROb2RlYCB3aWxsIGFsd2F5cyBiZSBub24tbnVsbC5cbiAgICpcbiAgICogLSBJZiBib3RoIGAuZW5kTm9kZWAgYW5kIGAuc3RhcnROb2RlYCBhcmUgbnVsbCwgdGhlbiB0aGUgcGFydCdzIGNvbnRlbnRcbiAgICogY29uc2lzdHMgb2YgYWxsIGNoaWxkIG5vZGVzIG9mIGAucGFyZW50Tm9kZWAuXG4gICAqL1xuICBnZXQgcGFyZW50Tm9kZSgpOiBOb2RlIHtcbiAgICBsZXQgcGFyZW50Tm9kZTogTm9kZSA9IHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkucGFyZW50Tm9kZSE7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5fJHBhcmVudDtcbiAgICBpZiAoXG4gICAgICBwYXJlbnQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgcGFyZW50Tm9kZT8ubm9kZVR5cGUgPT09IDExIC8qIE5vZGUuRE9DVU1FTlRfRlJBR01FTlQgKi9cbiAgICApIHtcbiAgICAgIC8vIElmIHRoZSBwYXJlbnROb2RlIGlzIGEgRG9jdW1lbnRGcmFnbWVudCwgaXQgbWF5IGJlIGJlY2F1c2UgdGhlIERPTSBpc1xuICAgICAgLy8gc3RpbGwgaW4gdGhlIGNsb25lZCBmcmFnbWVudCBkdXJpbmcgaW5pdGlhbCByZW5kZXI7IGlmIHNvLCBnZXQgdGhlIHJlYWxcbiAgICAgIC8vIHBhcmVudE5vZGUgdGhlIHBhcnQgd2lsbCBiZSBjb21taXR0ZWQgaW50byBieSBhc2tpbmcgdGhlIHBhcmVudC5cbiAgICAgIHBhcmVudE5vZGUgPSAocGFyZW50IGFzIENoaWxkUGFydCB8IFRlbXBsYXRlSW5zdGFuY2UpLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIHJldHVybiBwYXJlbnROb2RlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBwYXJ0J3MgbGVhZGluZyBtYXJrZXIgbm9kZSwgaWYgYW55LiBTZWUgYC5wYXJlbnROb2RlYCBmb3IgbW9yZVxuICAgKiBpbmZvcm1hdGlvbi5cbiAgICovXG4gIGdldCBzdGFydE5vZGUoKTogTm9kZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl8kc3RhcnROb2RlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBwYXJ0J3MgdHJhaWxpbmcgbWFya2VyIG5vZGUsIGlmIGFueS4gU2VlIGAucGFyZW50Tm9kZWAgZm9yIG1vcmVcbiAgICogaW5mb3JtYXRpb24uXG4gICAqL1xuICBnZXQgZW5kTm9kZSgpOiBOb2RlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuXyRlbmROb2RlO1xuICB9XG5cbiAgXyRzZXRWYWx1ZSh2YWx1ZTogdW5rbm93biwgZGlyZWN0aXZlUGFyZW50OiBEaXJlY3RpdmVQYXJlbnQgPSB0aGlzKTogdm9pZCB7XG4gICAgaWYgKERFVl9NT0RFICYmIHRoaXMucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVGhpcyBcXGBDaGlsZFBhcnRcXGAgaGFzIG5vIFxcYHBhcmVudE5vZGVcXGAgYW5kIHRoZXJlZm9yZSBjYW5ub3QgYWNjZXB0IGEgdmFsdWUuIFRoaXMgbGlrZWx5IG1lYW5zIHRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIHBhcnQgd2FzIG1hbmlwdWxhdGVkIGluIGFuIHVuc3VwcG9ydGVkIHdheSBvdXRzaWRlIG9mIExpdCdzIGNvbnRyb2wgc3VjaCB0aGF0IHRoZSBwYXJ0J3MgbWFya2VyIG5vZGVzIHdlcmUgZWplY3RlZCBmcm9tIERPTS4gRm9yIGV4YW1wbGUsIHNldHRpbmcgdGhlIGVsZW1lbnQncyBcXGBpbm5lckhUTUxcXGAgb3IgXFxgdGV4dENvbnRlbnRcXGAgY2FuIGRvIHRoaXMuYFxuICAgICAgKTtcbiAgICB9XG4gICAgdmFsdWUgPSByZXNvbHZlRGlyZWN0aXZlKHRoaXMsIHZhbHVlLCBkaXJlY3RpdmVQYXJlbnQpO1xuICAgIGlmIChpc1ByaW1pdGl2ZSh2YWx1ZSkpIHtcbiAgICAgIC8vIE5vbi1yZW5kZXJpbmcgY2hpbGQgdmFsdWVzLiBJdCdzIGltcG9ydGFudCB0aGF0IHRoZXNlIGRvIG5vdCByZW5kZXJcbiAgICAgIC8vIGVtcHR5IHRleHQgbm9kZXMgdG8gYXZvaWQgaXNzdWVzIHdpdGggcHJldmVudGluZyBkZWZhdWx0IDxzbG90PlxuICAgICAgLy8gZmFsbGJhY2sgY29udGVudC5cbiAgICAgIGlmICh2YWx1ZSA9PT0gbm90aGluZyB8fCB2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09PSAnJykge1xuICAgICAgICBpZiAodGhpcy5fJGNvbW1pdHRlZFZhbHVlICE9PSBub3RoaW5nKSB7XG4gICAgICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAgICAgIGtpbmQ6ICdjb21taXQgbm90aGluZyB0byBjaGlsZCcsXG4gICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLl8kc3RhcnROb2RlLFxuICAgICAgICAgICAgICBlbmQ6IHRoaXMuXyRlbmROb2RlLFxuICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMuXyRwYXJlbnQsXG4gICAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuXyRjbGVhcigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IG5vdGhpbmc7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlICE9PSB0aGlzLl8kY29tbWl0dGVkVmFsdWUgJiYgdmFsdWUgIT09IG5vQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMuX2NvbW1pdFRleHQodmFsdWUpO1xuICAgICAgfVxuICAgICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICB9IGVsc2UgaWYgKCh2YWx1ZSBhcyBUZW1wbGF0ZVJlc3VsdClbJ18kbGl0VHlwZSQnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9jb21taXRUZW1wbGF0ZVJlc3VsdCh2YWx1ZSBhcyBUZW1wbGF0ZVJlc3VsdCk7XG4gICAgfSBlbHNlIGlmICgodmFsdWUgYXMgTm9kZSkubm9kZVR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKERFVl9NT0RFICYmIHRoaXMub3B0aW9ucz8uaG9zdCA9PT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5fY29tbWl0VGV4dChcbiAgICAgICAgICBgW3Byb2JhYmxlIG1pc3Rha2U6IHJlbmRlcmVkIGEgdGVtcGxhdGUncyBob3N0IGluIGl0c2VsZiBgICtcbiAgICAgICAgICAgIGAoY29tbW9ubHkgY2F1c2VkIGJ5IHdyaXRpbmcgXFwke3RoaXN9IGluIGEgdGVtcGxhdGVdYFxuICAgICAgICApO1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgYEF0dGVtcHRlZCB0byByZW5kZXIgdGhlIHRlbXBsYXRlIGhvc3RgLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIGBpbnNpZGUgaXRzZWxmLiBUaGlzIGlzIGFsbW9zdCBhbHdheXMgYSBtaXN0YWtlLCBhbmQgaW4gZGV2IG1vZGUgYCxcbiAgICAgICAgICBgd2UgcmVuZGVyIHNvbWUgd2FybmluZyB0ZXh0LiBJbiBwcm9kdWN0aW9uIGhvd2V2ZXIsIHdlJ2xsIGAsXG4gICAgICAgICAgYHJlbmRlciBpdCwgd2hpY2ggd2lsbCB1c3VhbGx5IHJlc3VsdCBpbiBhbiBlcnJvciwgYW5kIHNvbWV0aW1lcyBgLFxuICAgICAgICAgIGBpbiB0aGUgZWxlbWVudCBkaXNhcHBlYXJpbmcgZnJvbSB0aGUgRE9NLmBcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29tbWl0Tm9kZSh2YWx1ZSBhcyBOb2RlKTtcbiAgICB9IGVsc2UgaWYgKGlzSXRlcmFibGUodmFsdWUpKSB7XG4gICAgICB0aGlzLl9jb21taXRJdGVyYWJsZSh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZhbGxiYWNrLCB3aWxsIHJlbmRlciB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gICAgICB0aGlzLl9jb21taXRUZXh0KHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9pbnNlcnQ8VCBleHRlbmRzIE5vZGU+KG5vZGU6IFQpIHtcbiAgICByZXR1cm4gd3JhcCh3cmFwKHRoaXMuXyRzdGFydE5vZGUpLnBhcmVudE5vZGUhKS5pbnNlcnRCZWZvcmUoXG4gICAgICBub2RlLFxuICAgICAgdGhpcy5fJGVuZE5vZGVcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tbWl0Tm9kZSh2YWx1ZTogTm9kZSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICB0aGlzLl8kY2xlYXIoKTtcbiAgICAgIGlmIChcbiAgICAgICAgRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTICYmXG4gICAgICAgIHNhbml0aXplckZhY3RvcnlJbnRlcm5hbCAhPT0gbm9vcFNhbml0aXplclxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHBhcmVudE5vZGVOYW1lID0gdGhpcy5fJHN0YXJ0Tm9kZS5wYXJlbnROb2RlPy5ub2RlTmFtZTtcbiAgICAgICAgaWYgKHBhcmVudE5vZGVOYW1lID09PSAnU1RZTEUnIHx8IHBhcmVudE5vZGVOYW1lID09PSAnU0NSSVBUJykge1xuICAgICAgICAgIGxldCBtZXNzYWdlID0gJ0ZvcmJpZGRlbic7XG4gICAgICAgICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAgICAgICBpZiAocGFyZW50Tm9kZU5hbWUgPT09ICdTVFlMRScpIHtcbiAgICAgICAgICAgICAgbWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgYExpdCBkb2VzIG5vdCBzdXBwb3J0IGJpbmRpbmcgaW5zaWRlIHN0eWxlIG5vZGVzLiBgICtcbiAgICAgICAgICAgICAgICBgVGhpcyBpcyBhIHNlY3VyaXR5IHJpc2ssIGFzIHN0eWxlIGluamVjdGlvbiBhdHRhY2tzIGNhbiBgICtcbiAgICAgICAgICAgICAgICBgZXhmaWx0cmF0ZSBkYXRhIGFuZCBzcG9vZiBVSXMuIGAgK1xuICAgICAgICAgICAgICAgIGBDb25zaWRlciBpbnN0ZWFkIHVzaW5nIGNzc1xcYC4uLlxcYCBsaXRlcmFscyBgICtcbiAgICAgICAgICAgICAgICBgdG8gY29tcG9zZSBzdHlsZXMsIGFuZCBkbyBkeW5hbWljIHN0eWxpbmcgd2l0aCBgICtcbiAgICAgICAgICAgICAgICBgY3NzIGN1c3RvbSBwcm9wZXJ0aWVzLCA6OnBhcnRzLCA8c2xvdD5zLCBgICtcbiAgICAgICAgICAgICAgICBgYW5kIGJ5IG11dGF0aW5nIHRoZSBET00gcmF0aGVyIHRoYW4gc3R5bGVzaGVldHMuYDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGBMaXQgZG9lcyBub3Qgc3VwcG9ydCBiaW5kaW5nIGluc2lkZSBzY3JpcHQgbm9kZXMuIGAgK1xuICAgICAgICAgICAgICAgIGBUaGlzIGlzIGEgc2VjdXJpdHkgcmlzaywgYXMgaXQgY291bGQgYWxsb3cgYXJiaXRyYXJ5IGAgK1xuICAgICAgICAgICAgICAgIGBjb2RlIGV4ZWN1dGlvbi5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ2NvbW1pdCBub2RlJyxcbiAgICAgICAgICBzdGFydDogdGhpcy5fJHN0YXJ0Tm9kZSxcbiAgICAgICAgICBwYXJlbnQ6IHRoaXMuXyRwYXJlbnQsXG4gICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSB0aGlzLl9pbnNlcnQodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1pdFRleHQodmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICAvLyBJZiB0aGUgY29tbWl0dGVkIHZhbHVlIGlzIGEgcHJpbWl0aXZlIGl0IG1lYW5zIHdlIGNhbGxlZCBfY29tbWl0VGV4dCBvblxuICAgIC8vIHRoZSBwcmV2aW91cyByZW5kZXIsIGFuZCB3ZSBrbm93IHRoYXQgdGhpcy5fJHN0YXJ0Tm9kZS5uZXh0U2libGluZyBpcyBhXG4gICAgLy8gVGV4dCBub2RlLiBXZSBjYW4gbm93IGp1c3QgcmVwbGFjZSB0aGUgdGV4dCBjb250ZW50ICguZGF0YSkgb2YgdGhlIG5vZGUuXG4gICAgaWYgKFxuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlICE9PSBub3RoaW5nICYmXG4gICAgICBpc1ByaW1pdGl2ZSh0aGlzLl8kY29tbWl0dGVkVmFsdWUpXG4gICAgKSB7XG4gICAgICBjb25zdCBub2RlID0gd3JhcCh0aGlzLl8kc3RhcnROb2RlKS5uZXh0U2libGluZyBhcyBUZXh0O1xuICAgICAgaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgICAgICBpZiAodGhpcy5fdGV4dFNhbml0aXplciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5fdGV4dFNhbml0aXplciA9IGNyZWF0ZVNhbml0aXplcihub2RlLCAnZGF0YScsICdwcm9wZXJ0eScpO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlID0gdGhpcy5fdGV4dFNhbml0aXplcih2YWx1ZSk7XG4gICAgICB9XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICdjb21taXQgdGV4dCcsXG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgICAgKG5vZGUgYXMgVGV4dCkuZGF0YSA9IHZhbHVlIGFzIHN0cmluZztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IGQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgICAgICB0aGlzLl9jb21taXROb2RlKHRleHROb2RlKTtcbiAgICAgICAgLy8gV2hlbiBzZXR0aW5nIHRleHQgY29udGVudCwgZm9yIHNlY3VyaXR5IHB1cnBvc2VzIGl0IG1hdHRlcnMgYSBsb3RcbiAgICAgICAgLy8gd2hhdCB0aGUgcGFyZW50IGlzLiBGb3IgZXhhbXBsZSwgPHN0eWxlPiBhbmQgPHNjcmlwdD4gbmVlZCB0byBiZVxuICAgICAgICAvLyBoYW5kbGVkIHdpdGggY2FyZSwgd2hpbGUgPHNwYW4+IGRvZXMgbm90LiBTbyBmaXJzdCB3ZSBuZWVkIHRvIHB1dCBhXG4gICAgICAgIC8vIHRleHQgbm9kZSBpbnRvIHRoZSBkb2N1bWVudCwgdGhlbiB3ZSBjYW4gc2FuaXRpemUgaXRzIGNvbnRlbnQuXG4gICAgICAgIGlmICh0aGlzLl90ZXh0U2FuaXRpemVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLl90ZXh0U2FuaXRpemVyID0gY3JlYXRlU2FuaXRpemVyKHRleHROb2RlLCAnZGF0YScsICdwcm9wZXJ0eScpO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlID0gdGhpcy5fdGV4dFNhbml0aXplcih2YWx1ZSk7XG4gICAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICAgIGtpbmQ6ICdjb21taXQgdGV4dCcsXG4gICAgICAgICAgICBub2RlOiB0ZXh0Tm9kZSxcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIH0pO1xuICAgICAgICB0ZXh0Tm9kZS5kYXRhID0gdmFsdWUgYXMgc3RyaW5nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY29tbWl0Tm9kZShkLmNyZWF0ZVRleHROb2RlKHZhbHVlIGFzIHN0cmluZykpO1xuICAgICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAgICBraW5kOiAnY29tbWl0IHRleHQnLFxuICAgICAgICAgICAgbm9kZTogd3JhcCh0aGlzLl8kc3RhcnROb2RlKS5uZXh0U2libGluZyBhcyBUZXh0LFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tbWl0VGVtcGxhdGVSZXN1bHQoXG4gICAgcmVzdWx0OiBUZW1wbGF0ZVJlc3VsdCB8IENvbXBpbGVkVGVtcGxhdGVSZXN1bHRcbiAgKTogdm9pZCB7XG4gICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICBjb25zdCB7dmFsdWVzLCBbJ18kbGl0VHlwZSQnXTogdHlwZX0gPSByZXN1bHQ7XG4gICAgLy8gSWYgJGxpdFR5cGUkIGlzIGEgbnVtYmVyLCByZXN1bHQgaXMgYSBwbGFpbiBUZW1wbGF0ZVJlc3VsdCBhbmQgd2UgZ2V0XG4gICAgLy8gdGhlIHRlbXBsYXRlIGZyb20gdGhlIHRlbXBsYXRlIGNhY2hlLiBJZiBub3QsIHJlc3VsdCBpcyBhXG4gICAgLy8gQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdCBhbmQgXyRsaXRUeXBlJCBpcyBhIENvbXBpbGVkVGVtcGxhdGUgYW5kIHdlIG5lZWRcbiAgICAvLyB0byBjcmVhdGUgdGhlIDx0ZW1wbGF0ZT4gZWxlbWVudCB0aGUgZmlyc3QgdGltZSB3ZSBzZWUgaXQuXG4gICAgY29uc3QgdGVtcGxhdGU6IFRlbXBsYXRlIHwgQ29tcGlsZWRUZW1wbGF0ZSA9XG4gICAgICB0eXBlb2YgdHlwZSA9PT0gJ251bWJlcidcbiAgICAgICAgPyB0aGlzLl8kZ2V0VGVtcGxhdGUocmVzdWx0IGFzIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdClcbiAgICAgICAgOiAodHlwZS5lbCA9PT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAodHlwZS5lbCA9IFRlbXBsYXRlLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgIHRydXN0RnJvbVRlbXBsYXRlU3RyaW5nKHR5cGUuaCwgdHlwZS5oWzBdKSxcbiAgICAgICAgICAgICAgdGhpcy5vcHRpb25zXG4gICAgICAgICAgICApKSxcbiAgICAgICAgICB0eXBlKTtcblxuICAgIGlmICgodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIFRlbXBsYXRlSW5zdGFuY2UpPy5fJHRlbXBsYXRlID09PSB0ZW1wbGF0ZSkge1xuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAndGVtcGxhdGUgdXBkYXRpbmcnLFxuICAgICAgICAgIHRlbXBsYXRlLFxuICAgICAgICAgIGluc3RhbmNlOiB0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgVGVtcGxhdGVJbnN0YW5jZSxcbiAgICAgICAgICBwYXJ0czogKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBUZW1wbGF0ZUluc3RhbmNlKS5fJHBhcnRzLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICB2YWx1ZXMsXG4gICAgICAgIH0pO1xuICAgICAgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBUZW1wbGF0ZUluc3RhbmNlKS5fdXBkYXRlKHZhbHVlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IFRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGUgYXMgVGVtcGxhdGUsIHRoaXMpO1xuICAgICAgY29uc3QgZnJhZ21lbnQgPSBpbnN0YW5jZS5fY2xvbmUodGhpcy5vcHRpb25zKTtcbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ3RlbXBsYXRlIGluc3RhbnRpYXRlZCcsXG4gICAgICAgICAgdGVtcGxhdGUsXG4gICAgICAgICAgaW5zdGFuY2UsXG4gICAgICAgICAgcGFydHM6IGluc3RhbmNlLl8kcGFydHMsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgfSk7XG4gICAgICBpbnN0YW5jZS5fdXBkYXRlKHZhbHVlcyk7XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBpbnN0YW50aWF0ZWQgYW5kIHVwZGF0ZWQnLFxuICAgICAgICAgIHRlbXBsYXRlLFxuICAgICAgICAgIGluc3RhbmNlLFxuICAgICAgICAgIHBhcnRzOiBpbnN0YW5jZS5fJHBhcnRzLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICB2YWx1ZXMsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5fY29tbWl0Tm9kZShmcmFnbWVudCk7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBpbnN0YW5jZTtcbiAgICB9XG4gIH1cblxuICAvLyBPdmVycmlkZGVuIHZpYSBgbGl0SHRtbFBvbHlmaWxsU3VwcG9ydGAgdG8gcHJvdmlkZSBwbGF0Zm9ybSBzdXBwb3J0LlxuICAvKiogQGludGVybmFsICovXG4gIF8kZ2V0VGVtcGxhdGUocmVzdWx0OiBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQpIHtcbiAgICBsZXQgdGVtcGxhdGUgPSB0ZW1wbGF0ZUNhY2hlLmdldChyZXN1bHQuc3RyaW5ncyk7XG4gICAgaWYgKHRlbXBsYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRlbXBsYXRlQ2FjaGUuc2V0KHJlc3VsdC5zdHJpbmdzLCAodGVtcGxhdGUgPSBuZXcgVGVtcGxhdGUocmVzdWx0KSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH1cblxuICBwcml2YXRlIF9jb21taXRJdGVyYWJsZSh2YWx1ZTogSXRlcmFibGU8dW5rbm93bj4pOiB2b2lkIHtcbiAgICAvLyBGb3IgYW4gSXRlcmFibGUsIHdlIGNyZWF0ZSBhIG5ldyBJbnN0YW5jZVBhcnQgcGVyIGl0ZW0sIHRoZW4gc2V0IGl0c1xuICAgIC8vIHZhbHVlIHRvIHRoZSBpdGVtLiBUaGlzIGlzIGEgbGl0dGxlIGJpdCBvZiBvdmVyaGVhZCBmb3IgZXZlcnkgaXRlbSBpblxuICAgIC8vIGFuIEl0ZXJhYmxlLCBidXQgaXQgbGV0cyB1cyByZWN1cnNlIGVhc2lseSBhbmQgZWZmaWNpZW50bHkgdXBkYXRlIEFycmF5c1xuICAgIC8vIG9mIFRlbXBsYXRlUmVzdWx0cyB0aGF0IHdpbGwgYmUgY29tbW9ubHkgcmV0dXJuZWQgZnJvbSBleHByZXNzaW9ucyBsaWtlOlxuICAgIC8vIGFycmF5Lm1hcCgoaSkgPT4gaHRtbGAke2l9YCksIGJ5IHJldXNpbmcgZXhpc3RpbmcgVGVtcGxhdGVJbnN0YW5jZXMuXG5cbiAgICAvLyBJZiB2YWx1ZSBpcyBhbiBhcnJheSwgdGhlbiB0aGUgcHJldmlvdXMgcmVuZGVyIHdhcyBvZiBhblxuICAgIC8vIGl0ZXJhYmxlIGFuZCB2YWx1ZSB3aWxsIGNvbnRhaW4gdGhlIENoaWxkUGFydHMgZnJvbSB0aGUgcHJldmlvdXNcbiAgICAvLyByZW5kZXIuIElmIHZhbHVlIGlzIG5vdCBhbiBhcnJheSwgY2xlYXIgdGhpcyBwYXJ0IGFuZCBtYWtlIGEgbmV3XG4gICAgLy8gYXJyYXkgZm9yIENoaWxkUGFydHMuXG4gICAgaWYgKCFpc0FycmF5KHRoaXMuXyRjb21taXR0ZWRWYWx1ZSkpIHtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IFtdO1xuICAgICAgdGhpcy5fJGNsZWFyKCk7XG4gICAgfVxuXG4gICAgLy8gTGV0cyB1cyBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IGl0ZW1zIHdlIHN0YW1wZWQgc28gd2UgY2FuIGNsZWFyIGxlZnRvdmVyXG4gICAgLy8gaXRlbXMgZnJvbSBhIHByZXZpb3VzIHJlbmRlclxuICAgIGNvbnN0IGl0ZW1QYXJ0cyA9IHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBDaGlsZFBhcnRbXTtcbiAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICBsZXQgaXRlbVBhcnQ6IENoaWxkUGFydCB8IHVuZGVmaW5lZDtcblxuICAgIGZvciAoY29uc3QgaXRlbSBvZiB2YWx1ZSkge1xuICAgICAgaWYgKHBhcnRJbmRleCA9PT0gaXRlbVBhcnRzLmxlbmd0aCkge1xuICAgICAgICAvLyBJZiBubyBleGlzdGluZyBwYXJ0LCBjcmVhdGUgYSBuZXcgb25lXG4gICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiB0ZXN0IHBlcmYgaW1wYWN0IG9mIGFsd2F5cyBjcmVhdGluZyB0d28gcGFydHNcbiAgICAgICAgLy8gaW5zdGVhZCBvZiBzaGFyaW5nIHBhcnRzIGJldHdlZW4gbm9kZXNcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2xpdC9saXQvaXNzdWVzLzEyNjZcbiAgICAgICAgaXRlbVBhcnRzLnB1c2goXG4gICAgICAgICAgKGl0ZW1QYXJ0ID0gbmV3IENoaWxkUGFydChcbiAgICAgICAgICAgIHRoaXMuX2luc2VydChjcmVhdGVNYXJrZXIoKSksXG4gICAgICAgICAgICB0aGlzLl9pbnNlcnQoY3JlYXRlTWFya2VyKCkpLFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc1xuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZXVzZSBhbiBleGlzdGluZyBwYXJ0XG4gICAgICAgIGl0ZW1QYXJ0ID0gaXRlbVBhcnRzW3BhcnRJbmRleF07XG4gICAgICB9XG4gICAgICBpdGVtUGFydC5fJHNldFZhbHVlKGl0ZW0pO1xuICAgICAgcGFydEluZGV4Kys7XG4gICAgfVxuXG4gICAgaWYgKHBhcnRJbmRleCA8IGl0ZW1QYXJ0cy5sZW5ndGgpIHtcbiAgICAgIC8vIGl0ZW1QYXJ0cyBhbHdheXMgaGF2ZSBlbmQgbm9kZXNcbiAgICAgIHRoaXMuXyRjbGVhcihcbiAgICAgICAgaXRlbVBhcnQgJiYgd3JhcChpdGVtUGFydC5fJGVuZE5vZGUhKS5uZXh0U2libGluZyxcbiAgICAgICAgcGFydEluZGV4XG4gICAgICApO1xuICAgICAgLy8gVHJ1bmNhdGUgdGhlIHBhcnRzIGFycmF5IHNvIF92YWx1ZSByZWZsZWN0cyB0aGUgY3VycmVudCBzdGF0ZVxuICAgICAgaXRlbVBhcnRzLmxlbmd0aCA9IHBhcnRJbmRleDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgbm9kZXMgY29udGFpbmVkIHdpdGhpbiB0aGlzIFBhcnQgZnJvbSB0aGUgRE9NLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnQgU3RhcnQgbm9kZSB0byBjbGVhciBmcm9tLCBmb3IgY2xlYXJpbmcgYSBzdWJzZXQgb2YgdGhlIHBhcnQnc1xuICAgKiAgICAgRE9NICh1c2VkIHdoZW4gdHJ1bmNhdGluZyBpdGVyYWJsZXMpXG4gICAqIEBwYXJhbSBmcm9tICBXaGVuIGBzdGFydGAgaXMgc3BlY2lmaWVkLCB0aGUgaW5kZXggd2l0aGluIHRoZSBpdGVyYWJsZSBmcm9tXG4gICAqICAgICB3aGljaCBDaGlsZFBhcnRzIGFyZSBiZWluZyByZW1vdmVkLCB1c2VkIGZvciBkaXNjb25uZWN0aW5nIGRpcmVjdGl2ZXMgaW5cbiAgICogICAgIHRob3NlIFBhcnRzLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF8kY2xlYXIoXG4gICAgc3RhcnQ6IENoaWxkTm9kZSB8IG51bGwgPSB3cmFwKHRoaXMuXyRzdGFydE5vZGUpLm5leHRTaWJsaW5nLFxuICAgIGZyb20/OiBudW1iZXJcbiAgKSB7XG4gICAgdGhpcy5fJG5vdGlmeUNvbm5lY3Rpb25DaGFuZ2VkPy4oZmFsc2UsIHRydWUsIGZyb20pO1xuICAgIHdoaWxlIChzdGFydCAmJiBzdGFydCAhPT0gdGhpcy5fJGVuZE5vZGUpIHtcbiAgICAgIGNvbnN0IG4gPSB3cmFwKHN0YXJ0ISkubmV4dFNpYmxpbmc7XG4gICAgICAod3JhcChzdGFydCEpIGFzIEVsZW1lbnQpLnJlbW92ZSgpO1xuICAgICAgc3RhcnQgPSBuO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogSW1wbGVtZW50YXRpb24gb2YgUm9vdFBhcnQncyBgaXNDb25uZWN0ZWRgLiBOb3RlIHRoYXQgdGhpcyBtZXRob2RcbiAgICogc2hvdWxkIG9ubHkgYmUgY2FsbGVkIG9uIGBSb290UGFydGBzICh0aGUgYENoaWxkUGFydGAgcmV0dXJuZWQgZnJvbSBhXG4gICAqIHRvcC1sZXZlbCBgcmVuZGVyKClgIGNhbGwpLiBJdCBoYXMgbm8gZWZmZWN0IG9uIG5vbi1yb290IENoaWxkUGFydHMuXG4gICAqIEBwYXJhbSBpc0Nvbm5lY3RlZCBXaGV0aGVyIHRvIHNldFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHNldENvbm5lY3RlZChpc0Nvbm5lY3RlZDogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLl8kcGFyZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX19pc0Nvbm5lY3RlZCA9IGlzQ29ubmVjdGVkO1xuICAgICAgdGhpcy5fJG5vdGlmeUNvbm5lY3Rpb25DaGFuZ2VkPy4oaXNDb25uZWN0ZWQpO1xuICAgIH0gZWxzZSBpZiAoREVWX01PREUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ3BhcnQuc2V0Q29ubmVjdGVkKCkgbWF5IG9ubHkgYmUgY2FsbGVkIG9uIGEgJyArXG4gICAgICAgICAgJ1Jvb3RQYXJ0IHJldHVybmVkIGZyb20gcmVuZGVyKCkuJ1xuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBIHRvcC1sZXZlbCBgQ2hpbGRQYXJ0YCByZXR1cm5lZCBmcm9tIGByZW5kZXJgIHRoYXQgbWFuYWdlcyB0aGUgY29ubmVjdGVkXG4gKiBzdGF0ZSBvZiBgQXN5bmNEaXJlY3RpdmVgcyBjcmVhdGVkIHRocm91Z2hvdXQgdGhlIHRyZWUgYmVsb3cgaXQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUm9vdFBhcnQgZXh0ZW5kcyBDaGlsZFBhcnQge1xuICAvKipcbiAgICogU2V0cyB0aGUgY29ubmVjdGlvbiBzdGF0ZSBmb3IgYEFzeW5jRGlyZWN0aXZlYHMgY29udGFpbmVkIHdpdGhpbiB0aGlzIHJvb3RcbiAgICogQ2hpbGRQYXJ0LlxuICAgKlxuICAgKiBsaXQtaHRtbCBkb2VzIG5vdCBhdXRvbWF0aWNhbGx5IG1vbml0b3IgdGhlIGNvbm5lY3RlZG5lc3Mgb2YgRE9NIHJlbmRlcmVkO1xuICAgKiBhcyBzdWNoLCBpdCBpcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIGNhbGxlciB0byBgcmVuZGVyYCB0byBlbnN1cmUgdGhhdFxuICAgKiBgcGFydC5zZXRDb25uZWN0ZWQoZmFsc2UpYCBpcyBjYWxsZWQgYmVmb3JlIHRoZSBwYXJ0IG9iamVjdCBpcyBwb3RlbnRpYWxseVxuICAgKiBkaXNjYXJkZWQsIHRvIGVuc3VyZSB0aGF0IGBBc3luY0RpcmVjdGl2ZWBzIGhhdmUgYSBjaGFuY2UgdG8gZGlzcG9zZSBvZlxuICAgKiBhbnkgcmVzb3VyY2VzIGJlaW5nIGhlbGQuIElmIGEgYFJvb3RQYXJ0YCB0aGF0IHdhcyBwcmV2aW91c2x5XG4gICAqIGRpc2Nvbm5lY3RlZCBpcyBzdWJzZXF1ZW50bHkgcmUtY29ubmVjdGVkIChhbmQgaXRzIGBBc3luY0RpcmVjdGl2ZWBzIHNob3VsZFxuICAgKiByZS1jb25uZWN0KSwgYHNldENvbm5lY3RlZCh0cnVlKWAgc2hvdWxkIGJlIGNhbGxlZC5cbiAgICpcbiAgICogQHBhcmFtIGlzQ29ubmVjdGVkIFdoZXRoZXIgZGlyZWN0aXZlcyB3aXRoaW4gdGhpcyB0cmVlIHNob3VsZCBiZSBjb25uZWN0ZWRcbiAgICogb3Igbm90XG4gICAqL1xuICBzZXRDb25uZWN0ZWQoaXNDb25uZWN0ZWQ6IGJvb2xlYW4pOiB2b2lkO1xufVxuXG5leHBvcnQgdHlwZSB7QXR0cmlidXRlUGFydH07XG5jbGFzcyBBdHRyaWJ1dGVQYXJ0IGltcGxlbWVudHMgRGlzY29ubmVjdGFibGUge1xuICByZWFkb25seSB0eXBlOlxuICAgIHwgdHlwZW9mIEFUVFJJQlVURV9QQVJUXG4gICAgfCB0eXBlb2YgUFJPUEVSVFlfUEFSVFxuICAgIHwgdHlwZW9mIEJPT0xFQU5fQVRUUklCVVRFX1BBUlRcbiAgICB8IHR5cGVvZiBFVkVOVF9QQVJUID0gQVRUUklCVVRFX1BBUlQ7XG4gIHJlYWRvbmx5IGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIElmIHRoaXMgYXR0cmlidXRlIHBhcnQgcmVwcmVzZW50cyBhbiBpbnRlcnBvbGF0aW9uLCB0aGlzIGNvbnRhaW5zIHRoZVxuICAgKiBzdGF0aWMgc3RyaW5ncyBvZiB0aGUgaW50ZXJwb2xhdGlvbi4gRm9yIHNpbmdsZS12YWx1ZSwgY29tcGxldGUgYmluZGluZ3MsXG4gICAqIHRoaXMgaXMgdW5kZWZpbmVkLlxuICAgKi9cbiAgcmVhZG9ubHkgc3RyaW5ncz86IFJlYWRvbmx5QXJyYXk8c3RyaW5nPjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGNvbW1pdHRlZFZhbHVlOiB1bmtub3duIHwgQXJyYXk8dW5rbm93bj4gPSBub3RoaW5nO1xuICAvKiogQGludGVybmFsICovXG4gIF9fZGlyZWN0aXZlcz86IEFycmF5PERpcmVjdGl2ZSB8IHVuZGVmaW5lZD47XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlO1xuICAvKiogQGludGVybmFsICovXG4gIF8kZGlzY29ubmVjdGFibGVDaGlsZHJlbj86IFNldDxEaXNjb25uZWN0YWJsZT4gPSB1bmRlZmluZWQ7XG5cbiAgcHJvdGVjdGVkIF9zYW5pdGl6ZXI6IFZhbHVlU2FuaXRpemVyIHwgdW5kZWZpbmVkO1xuXG4gIGdldCB0YWdOYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQudGFnTmFtZTtcbiAgfVxuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQuXyRpc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzdHJpbmdzOiBSZWFkb25seUFycmF5PHN0cmluZz4sXG4gICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSxcbiAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLl8kcGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgaWYgKHN0cmluZ3MubGVuZ3RoID4gMiB8fCBzdHJpbmdzWzBdICE9PSAnJyB8fCBzdHJpbmdzWzFdICE9PSAnJykge1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gbmV3IEFycmF5KHN0cmluZ3MubGVuZ3RoIC0gMSkuZmlsbChuZXcgU3RyaW5nKCkpO1xuICAgICAgdGhpcy5zdHJpbmdzID0gc3RyaW5ncztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gbm90aGluZztcbiAgICB9XG4gICAgaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgICAgdGhpcy5fc2FuaXRpemVyID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiB0aGlzIHBhcnQgYnkgcmVzb2x2aW5nIHRoZSB2YWx1ZSBmcm9tIHBvc3NpYmx5IG11bHRpcGxlXG4gICAqIHZhbHVlcyBhbmQgc3RhdGljIHN0cmluZ3MgYW5kIGNvbW1pdHRpbmcgaXQgdG8gdGhlIERPTS5cbiAgICogSWYgdGhpcyBwYXJ0IGlzIHNpbmdsZS12YWx1ZWQsIGB0aGlzLl9zdHJpbmdzYCB3aWxsIGJlIHVuZGVmaW5lZCwgYW5kIHRoZVxuICAgKiBtZXRob2Qgd2lsbCBiZSBjYWxsZWQgd2l0aCBhIHNpbmdsZSB2YWx1ZSBhcmd1bWVudC4gSWYgdGhpcyBwYXJ0IGlzXG4gICAqIG11bHRpLXZhbHVlLCBgdGhpcy5fc3RyaW5nc2Agd2lsbCBiZSBkZWZpbmVkLCBhbmQgdGhlIG1ldGhvZCBpcyBjYWxsZWRcbiAgICogd2l0aCB0aGUgdmFsdWUgYXJyYXkgb2YgdGhlIHBhcnQncyBvd25pbmcgVGVtcGxhdGVJbnN0YW5jZSwgYW5kIGFuIG9mZnNldFxuICAgKiBpbnRvIHRoZSB2YWx1ZSBhcnJheSBmcm9tIHdoaWNoIHRoZSB2YWx1ZXMgc2hvdWxkIGJlIHJlYWQuXG4gICAqIFRoaXMgbWV0aG9kIGlzIG92ZXJsb2FkZWQgdGhpcyB3YXkgdG8gZWxpbWluYXRlIHNob3J0LWxpdmVkIGFycmF5IHNsaWNlc1xuICAgKiBvZiB0aGUgdGVtcGxhdGUgaW5zdGFuY2UgdmFsdWVzLCBhbmQgYWxsb3cgYSBmYXN0LXBhdGggZm9yIHNpbmdsZS12YWx1ZWRcbiAgICogcGFydHMuXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgcGFydCB2YWx1ZSwgb3IgYW4gYXJyYXkgb2YgdmFsdWVzIGZvciBtdWx0aS12YWx1ZWQgcGFydHNcbiAgICogQHBhcmFtIHZhbHVlSW5kZXggdGhlIGluZGV4IHRvIHN0YXJ0IHJlYWRpbmcgdmFsdWVzIGZyb20uIGB1bmRlZmluZWRgIGZvclxuICAgKiAgIHNpbmdsZS12YWx1ZWQgcGFydHNcbiAgICogQHBhcmFtIG5vQ29tbWl0IGNhdXNlcyB0aGUgcGFydCB0byBub3QgY29tbWl0IGl0cyB2YWx1ZSB0byB0aGUgRE9NLiBVc2VkXG4gICAqICAgaW4gaHlkcmF0aW9uIHRvIHByaW1lIGF0dHJpYnV0ZSBwYXJ0cyB3aXRoIHRoZWlyIGZpcnN0LXJlbmRlcmVkIHZhbHVlLFxuICAgKiAgIGJ1dCBub3Qgc2V0IHRoZSBhdHRyaWJ1dGUsIGFuZCBpbiBTU1IgdG8gbm8tb3AgdGhlIERPTSBvcGVyYXRpb24gYW5kXG4gICAqICAgY2FwdHVyZSB0aGUgdmFsdWUgZm9yIHNlcmlhbGl6YXRpb24uXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgXyRzZXRWYWx1ZShcbiAgICB2YWx1ZTogdW5rbm93biB8IEFycmF5PHVua25vd24+LFxuICAgIGRpcmVjdGl2ZVBhcmVudDogRGlyZWN0aXZlUGFyZW50ID0gdGhpcyxcbiAgICB2YWx1ZUluZGV4PzogbnVtYmVyLFxuICAgIG5vQ29tbWl0PzogYm9vbGVhblxuICApIHtcbiAgICBjb25zdCBzdHJpbmdzID0gdGhpcy5zdHJpbmdzO1xuXG4gICAgLy8gV2hldGhlciBhbnkgb2YgdGhlIHZhbHVlcyBoYXMgY2hhbmdlZCwgZm9yIGRpcnR5LWNoZWNraW5nXG4gICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xuXG4gICAgaWYgKHN0cmluZ3MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gU2luZ2xlLXZhbHVlIGJpbmRpbmcgY2FzZVxuICAgICAgdmFsdWUgPSByZXNvbHZlRGlyZWN0aXZlKHRoaXMsIHZhbHVlLCBkaXJlY3RpdmVQYXJlbnQsIDApO1xuICAgICAgY2hhbmdlID1cbiAgICAgICAgIWlzUHJpbWl0aXZlKHZhbHVlKSB8fFxuICAgICAgICAodmFsdWUgIT09IHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAmJiB2YWx1ZSAhPT0gbm9DaGFuZ2UpO1xuICAgICAgaWYgKGNoYW5nZSkge1xuICAgICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSW50ZXJwb2xhdGlvbiBjYXNlXG4gICAgICBjb25zdCB2YWx1ZXMgPSB2YWx1ZSBhcyBBcnJheTx1bmtub3duPjtcbiAgICAgIHZhbHVlID0gc3RyaW5nc1swXTtcblxuICAgICAgbGV0IGksIHY7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgc3RyaW5ncy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgdiA9IHJlc29sdmVEaXJlY3RpdmUodGhpcywgdmFsdWVzW3ZhbHVlSW5kZXghICsgaV0sIGRpcmVjdGl2ZVBhcmVudCwgaSk7XG5cbiAgICAgICAgaWYgKHYgPT09IG5vQ2hhbmdlKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHVzZXItcHJvdmlkZWQgdmFsdWUgaXMgYG5vQ2hhbmdlYCwgdXNlIHRoZSBwcmV2aW91cyB2YWx1ZVxuICAgICAgICAgIHYgPSAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIEFycmF5PHVua25vd24+KVtpXTtcbiAgICAgICAgfVxuICAgICAgICBjaGFuZ2UgfHw9XG4gICAgICAgICAgIWlzUHJpbWl0aXZlKHYpIHx8IHYgIT09ICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgQXJyYXk8dW5rbm93bj4pW2ldO1xuICAgICAgICBpZiAodiA9PT0gbm90aGluZykge1xuICAgICAgICAgIHZhbHVlID0gbm90aGluZztcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSAhPT0gbm90aGluZykge1xuICAgICAgICAgIHZhbHVlICs9ICh2ID8/ICcnKSArIHN0cmluZ3NbaSArIDFdO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdlIGFsd2F5cyByZWNvcmQgZWFjaCB2YWx1ZSwgZXZlbiBpZiBvbmUgaXMgYG5vdGhpbmdgLCBmb3IgZnV0dXJlXG4gICAgICAgIC8vIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAgICAgICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgQXJyYXk8dW5rbm93bj4pW2ldID0gdjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNoYW5nZSAmJiAhbm9Db21taXQpIHtcbiAgICAgIHRoaXMuX2NvbW1pdFZhbHVlKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jb21taXRWYWx1ZSh2YWx1ZTogdW5rbm93bikge1xuICAgIGlmICh2YWx1ZSA9PT0gbm90aGluZykge1xuICAgICAgKHdyYXAodGhpcy5lbGVtZW50KSBhcyBFbGVtZW50KS5yZW1vdmVBdHRyaWJ1dGUodGhpcy5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgICAgICBpZiAodGhpcy5fc2FuaXRpemVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLl9zYW5pdGl6ZXIgPSBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwoXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgICAgICAnYXR0cmlidXRlJ1xuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgPSB0aGlzLl9zYW5pdGl6ZXIodmFsdWUgPz8gJycpO1xuICAgICAgfVxuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAnY29tbWl0IGF0dHJpYnV0ZScsXG4gICAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxuICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgICAgKHdyYXAodGhpcy5lbGVtZW50KSBhcyBFbGVtZW50KS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgKHZhbHVlID8/ICcnKSBhcyBzdHJpbmdcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIHtQcm9wZXJ0eVBhcnR9O1xuY2xhc3MgUHJvcGVydHlQYXJ0IGV4dGVuZHMgQXR0cmlidXRlUGFydCB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IHR5cGUgPSBQUk9QRVJUWV9QQVJUO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgX2NvbW1pdFZhbHVlKHZhbHVlOiB1bmtub3duKSB7XG4gICAgaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICAgICAgaWYgKHRoaXMuX3Nhbml0aXplciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuX3Nhbml0aXplciA9IHNhbml0aXplckZhY3RvcnlJbnRlcm5hbChcbiAgICAgICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICAgICdwcm9wZXJ0eSdcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdGhpcy5fc2FuaXRpemVyKHZhbHVlKTtcbiAgICB9XG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICdjb21taXQgcHJvcGVydHknLFxuICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgIH0pO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgKHRoaXMuZWxlbWVudCBhcyBhbnkpW3RoaXMubmFtZV0gPSB2YWx1ZSA9PT0gbm90aGluZyA/IHVuZGVmaW5lZCA6IHZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIHtCb29sZWFuQXR0cmlidXRlUGFydH07XG5jbGFzcyBCb29sZWFuQXR0cmlidXRlUGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xuICBvdmVycmlkZSByZWFkb25seSB0eXBlID0gQk9PTEVBTl9BVFRSSUJVVEVfUEFSVDtcblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIF9jb21taXRWYWx1ZSh2YWx1ZTogdW5rbm93bikge1xuICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICBraW5kOiAnY29tbWl0IGJvb2xlYW4gYXR0cmlidXRlJyxcbiAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgIHZhbHVlOiAhISh2YWx1ZSAmJiB2YWx1ZSAhPT0gbm90aGluZyksXG4gICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgIH0pO1xuICAgICh3cmFwKHRoaXMuZWxlbWVudCkgYXMgRWxlbWVudCkudG9nZ2xlQXR0cmlidXRlKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgISF2YWx1ZSAmJiB2YWx1ZSAhPT0gbm90aGluZ1xuICAgICk7XG4gIH1cbn1cblxudHlwZSBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMgPSBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0ICZcbiAgUGFydGlhbDxBZGRFdmVudExpc3RlbmVyT3B0aW9ucz47XG5cbi8qKlxuICogQW4gQXR0cmlidXRlUGFydCB0aGF0IG1hbmFnZXMgYW4gZXZlbnQgbGlzdGVuZXIgdmlhIGFkZC9yZW1vdmVFdmVudExpc3RlbmVyLlxuICpcbiAqIFRoaXMgcGFydCB3b3JrcyBieSBhZGRpbmcgaXRzZWxmIGFzIHRoZSBldmVudCBsaXN0ZW5lciBvbiBhbiBlbGVtZW50LCB0aGVuXG4gKiBkZWxlZ2F0aW5nIHRvIHRoZSB2YWx1ZSBwYXNzZWQgdG8gaXQuIFRoaXMgcmVkdWNlcyB0aGUgbnVtYmVyIG9mIGNhbGxzIHRvXG4gKiBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lciBpZiB0aGUgbGlzdGVuZXIgY2hhbmdlcyBmcmVxdWVudGx5LCBzdWNoIGFzIHdoZW4gYW5cbiAqIGlubGluZSBmdW5jdGlvbiBpcyB1c2VkIGFzIGEgbGlzdGVuZXIuXG4gKlxuICogQmVjYXVzZSBldmVudCBvcHRpb25zIGFyZSBwYXNzZWQgd2hlbiBhZGRpbmcgbGlzdGVuZXJzLCB3ZSBtdXN0IHRha2UgY2FzZVxuICogdG8gYWRkIGFuZCByZW1vdmUgdGhlIHBhcnQgYXMgYSBsaXN0ZW5lciB3aGVuIHRoZSBldmVudCBvcHRpb25zIGNoYW5nZS5cbiAqL1xuZXhwb3J0IHR5cGUge0V2ZW50UGFydH07XG5jbGFzcyBFdmVudFBhcnQgZXh0ZW5kcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkgdHlwZSA9IEVWRU5UX1BBUlQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHN0cmluZ3M6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPixcbiAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlLFxuICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIoZWxlbWVudCwgbmFtZSwgc3RyaW5ncywgcGFyZW50LCBvcHRpb25zKTtcblxuICAgIGlmIChERVZfTU9ERSAmJiB0aGlzLnN0cmluZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgQSBcXGA8JHtlbGVtZW50LmxvY2FsTmFtZX0+XFxgIGhhcyBhIFxcYEAke25hbWV9PS4uLlxcYCBsaXN0ZW5lciB3aXRoIGAgK1xuICAgICAgICAgICdpbnZhbGlkIGNvbnRlbnQuIEV2ZW50IGxpc3RlbmVycyBpbiB0ZW1wbGF0ZXMgbXVzdCBoYXZlIGV4YWN0bHkgJyArXG4gICAgICAgICAgJ29uZSBleHByZXNzaW9uIGFuZCBubyBzdXJyb3VuZGluZyB0ZXh0LidcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gRXZlbnRQYXJ0IGRvZXMgbm90IHVzZSB0aGUgYmFzZSBfJHNldFZhbHVlL19yZXNvbHZlVmFsdWUgaW1wbGVtZW50YXRpb25cbiAgLy8gc2luY2UgdGhlIGRpcnR5IGNoZWNraW5nIGlzIG1vcmUgY29tcGxleFxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIF8kc2V0VmFsdWUoXG4gICAgbmV3TGlzdGVuZXI6IHVua25vd24sXG4gICAgZGlyZWN0aXZlUGFyZW50OiBEaXJlY3RpdmVQYXJlbnQgPSB0aGlzXG4gICkge1xuICAgIG5ld0xpc3RlbmVyID1cbiAgICAgIHJlc29sdmVEaXJlY3RpdmUodGhpcywgbmV3TGlzdGVuZXIsIGRpcmVjdGl2ZVBhcmVudCwgMCkgPz8gbm90aGluZztcbiAgICBpZiAobmV3TGlzdGVuZXIgPT09IG5vQ2hhbmdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG9sZExpc3RlbmVyID0gdGhpcy5fJGNvbW1pdHRlZFZhbHVlO1xuXG4gICAgLy8gSWYgdGhlIG5ldyB2YWx1ZSBpcyBub3RoaW5nIG9yIGFueSBvcHRpb25zIGNoYW5nZSB3ZSBoYXZlIHRvIHJlbW92ZSB0aGVcbiAgICAvLyBwYXJ0IGFzIGEgbGlzdGVuZXIuXG4gICAgY29uc3Qgc2hvdWxkUmVtb3ZlTGlzdGVuZXIgPVxuICAgICAgKG5ld0xpc3RlbmVyID09PSBub3RoaW5nICYmIG9sZExpc3RlbmVyICE9PSBub3RoaW5nKSB8fFxuICAgICAgKG5ld0xpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucykuY2FwdHVyZSAhPT1cbiAgICAgICAgKG9sZExpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucykuY2FwdHVyZSB8fFxuICAgICAgKG5ld0xpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucykub25jZSAhPT1cbiAgICAgICAgKG9sZExpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucykub25jZSB8fFxuICAgICAgKG5ld0xpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucykucGFzc2l2ZSAhPT1cbiAgICAgICAgKG9sZExpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucykucGFzc2l2ZTtcblxuICAgIC8vIElmIHRoZSBuZXcgdmFsdWUgaXMgbm90IG5vdGhpbmcgYW5kIHdlIHJlbW92ZWQgdGhlIGxpc3RlbmVyLCB3ZSBoYXZlXG4gICAgLy8gdG8gYWRkIHRoZSBwYXJ0IGFzIGEgbGlzdGVuZXIuXG4gICAgY29uc3Qgc2hvdWxkQWRkTGlzdGVuZXIgPVxuICAgICAgbmV3TGlzdGVuZXIgIT09IG5vdGhpbmcgJiZcbiAgICAgIChvbGRMaXN0ZW5lciA9PT0gbm90aGluZyB8fCBzaG91bGRSZW1vdmVMaXN0ZW5lcik7XG5cbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ2NvbW1pdCBldmVudCBsaXN0ZW5lcicsXG4gICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICB2YWx1ZTogbmV3TGlzdGVuZXIsXG4gICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgcmVtb3ZlTGlzdGVuZXI6IHNob3VsZFJlbW92ZUxpc3RlbmVyLFxuICAgICAgICBhZGRMaXN0ZW5lcjogc2hvdWxkQWRkTGlzdGVuZXIsXG4gICAgICAgIG9sZExpc3RlbmVyLFxuICAgICAgfSk7XG4gICAgaWYgKHNob3VsZFJlbW92ZUxpc3RlbmVyKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB0aGlzLFxuICAgICAgICBvbGRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnNcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChzaG91bGRBZGRMaXN0ZW5lcikge1xuICAgICAgLy8gQmV3YXJlOiBJRTExIGFuZCBDaHJvbWUgNDEgZG9uJ3QgbGlrZSB1c2luZyB0aGUgbGlzdGVuZXIgYXMgdGhlXG4gICAgICAvLyBvcHRpb25zIG9iamVjdC4gRmlndXJlIG91dCBob3cgdG8gZGVhbCB3LyB0aGlzIGluIElFMTEgLSBtYXliZVxuICAgICAgLy8gcGF0Y2ggYWRkRXZlbnRMaXN0ZW5lcj9cbiAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgIHRoaXMsXG4gICAgICAgIG5ld0xpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9uc1xuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gbmV3TGlzdGVuZXI7XG4gIH1cblxuICBoYW5kbGVFdmVudChldmVudDogRXZlbnQpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlLmNhbGwodGhpcy5vcHRpb25zPy5ob3N0ID8/IHRoaXMuZWxlbWVudCwgZXZlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIEV2ZW50TGlzdGVuZXJPYmplY3QpLmhhbmRsZUV2ZW50KGV2ZW50KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUge0VsZW1lbnRQYXJ0fTtcbmNsYXNzIEVsZW1lbnRQYXJ0IGltcGxlbWVudHMgRGlzY29ubmVjdGFibGUge1xuICByZWFkb25seSB0eXBlID0gRUxFTUVOVF9QQVJUO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX19kaXJlY3RpdmU/OiBEaXJlY3RpdmU7XG5cbiAgLy8gVGhpcyBpcyB0byBlbnN1cmUgdGhhdCBldmVyeSBQYXJ0IGhhcyBhIF8kY29tbWl0dGVkVmFsdWVcbiAgXyRjb21taXR0ZWRWYWx1ZTogdW5kZWZpbmVkO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRwYXJlbnQhOiBEaXNjb25uZWN0YWJsZTtcblxuICAvKiogQGludGVybmFsICovXG4gIF8kZGlzY29ubmVjdGFibGVDaGlsZHJlbj86IFNldDxEaXNjb25uZWN0YWJsZT4gPSB1bmRlZmluZWQ7XG5cbiAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWxlbWVudDogRWxlbWVudCxcbiAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlLFxuICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWRcbiAgKSB7XG4gICAgdGhpcy5fJHBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB9XG5cbiAgLy8gU2VlIGNvbW1lbnQgaW4gRGlzY29ubmVjdGFibGUgaW50ZXJmYWNlIGZvciB3aHkgdGhpcyBpcyBhIGdldHRlclxuICBnZXQgXyRpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fJHBhcmVudC5fJGlzQ29ubmVjdGVkO1xuICB9XG5cbiAgXyRzZXRWYWx1ZSh2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICBraW5kOiAnY29tbWl0IHRvIGVsZW1lbnQgYmluZGluZycsXG4gICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgIH0pO1xuICAgIHJlc29sdmVEaXJlY3RpdmUodGhpcywgdmFsdWUpO1xuICB9XG59XG5cbi8qKlxuICogRU5EIFVTRVJTIFNIT1VMRCBOT1QgUkVMWSBPTiBUSElTIE9CSkVDVC5cbiAqXG4gKiBQcml2YXRlIGV4cG9ydHMgZm9yIHVzZSBieSBvdGhlciBMaXQgcGFja2FnZXMsIG5vdCBpbnRlbmRlZCBmb3IgdXNlIGJ5XG4gKiBleHRlcm5hbCB1c2Vycy5cbiAqXG4gKiBXZSBjdXJyZW50bHkgZG8gbm90IG1ha2UgYSBtYW5nbGVkIHJvbGx1cCBidWlsZCBvZiB0aGUgbGl0LXNzciBjb2RlLiBJbiBvcmRlclxuICogdG8ga2VlcCBhIG51bWJlciBvZiAob3RoZXJ3aXNlIHByaXZhdGUpIHRvcC1sZXZlbCBleHBvcnRzIG1hbmdsZWQgaW4gdGhlXG4gKiBjbGllbnQgc2lkZSBjb2RlLCB3ZSBleHBvcnQgYSBfJExIIG9iamVjdCBjb250YWluaW5nIHRob3NlIG1lbWJlcnMgKG9yXG4gKiBoZWxwZXIgbWV0aG9kcyBmb3IgYWNjZXNzaW5nIHByaXZhdGUgZmllbGRzIG9mIHRob3NlIG1lbWJlcnMpLCBhbmQgdGhlblxuICogcmUtZXhwb3J0IHRoZW0gZm9yIHVzZSBpbiBsaXQtc3NyLiBUaGlzIGtlZXBzIGxpdC1zc3IgYWdub3N0aWMgdG8gd2hldGhlciB0aGVcbiAqIGNsaWVudC1zaWRlIGNvZGUgaXMgYmVpbmcgdXNlZCBpbiBgZGV2YCBtb2RlIG9yIGBwcm9kYCBtb2RlLlxuICpcbiAqIFRoaXMgaGFzIGEgdW5pcXVlIG5hbWUsIHRvIGRpc2FtYmlndWF0ZSBpdCBmcm9tIHByaXZhdGUgZXhwb3J0cyBpblxuICogbGl0LWVsZW1lbnQsIHdoaWNoIHJlLWV4cG9ydHMgYWxsIG9mIGxpdC1odG1sLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBfJExIID0ge1xuICAvLyBVc2VkIGluIGxpdC1zc3JcbiAgX2JvdW5kQXR0cmlidXRlU3VmZml4OiBib3VuZEF0dHJpYnV0ZVN1ZmZpeCxcbiAgX21hcmtlcjogbWFya2VyLFxuICBfbWFya2VyTWF0Y2g6IG1hcmtlck1hdGNoLFxuICBfSFRNTF9SRVNVTFQ6IEhUTUxfUkVTVUxULFxuICBfZ2V0VGVtcGxhdGVIdG1sOiBnZXRUZW1wbGF0ZUh0bWwsXG4gIC8vIFVzZWQgaW4gdGVzdHMgYW5kIHByaXZhdGUtc3NyLXN1cHBvcnRcbiAgX1RlbXBsYXRlSW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2UsXG4gIF9pc0l0ZXJhYmxlOiBpc0l0ZXJhYmxlLFxuICBfcmVzb2x2ZURpcmVjdGl2ZTogcmVzb2x2ZURpcmVjdGl2ZSxcbiAgX0NoaWxkUGFydDogQ2hpbGRQYXJ0LFxuICBfQXR0cmlidXRlUGFydDogQXR0cmlidXRlUGFydCxcbiAgX0Jvb2xlYW5BdHRyaWJ1dGVQYXJ0OiBCb29sZWFuQXR0cmlidXRlUGFydCxcbiAgX0V2ZW50UGFydDogRXZlbnRQYXJ0LFxuICBfUHJvcGVydHlQYXJ0OiBQcm9wZXJ0eVBhcnQsXG4gIF9FbGVtZW50UGFydDogRWxlbWVudFBhcnQsXG59O1xuXG4vLyBBcHBseSBwb2x5ZmlsbHMgaWYgYXZhaWxhYmxlXG5jb25zdCBwb2x5ZmlsbFN1cHBvcnQgPSBERVZfTU9ERVxuICA/IGdsb2JhbC5saXRIdG1sUG9seWZpbGxTdXBwb3J0RGV2TW9kZVxuICA6IGdsb2JhbC5saXRIdG1sUG9seWZpbGxTdXBwb3J0O1xucG9seWZpbGxTdXBwb3J0Py4oVGVtcGxhdGUsIENoaWxkUGFydCk7XG5cbi8vIElNUE9SVEFOVDogZG8gbm90IGNoYW5nZSB0aGUgcHJvcGVydHkgbmFtZSBvciB0aGUgYXNzaWdubWVudCBleHByZXNzaW9uLlxuLy8gVGhpcyBsaW5lIHdpbGwgYmUgdXNlZCBpbiByZWdleGVzIHRvIHNlYXJjaCBmb3IgbGl0LWh0bWwgdXNhZ2UuXG4oZ2xvYmFsLmxpdEh0bWxWZXJzaW9ucyA/Pz0gW10pLnB1c2goJzMuMi4xJyk7XG5pZiAoREVWX01PREUgJiYgZ2xvYmFsLmxpdEh0bWxWZXJzaW9ucy5sZW5ndGggPiAxKSB7XG4gIGlzc3VlV2FybmluZyEoXG4gICAgJ211bHRpcGxlLXZlcnNpb25zJyxcbiAgICBgTXVsdGlwbGUgdmVyc2lvbnMgb2YgTGl0IGxvYWRlZC4gYCArXG4gICAgICBgTG9hZGluZyBtdWx0aXBsZSB2ZXJzaW9ucyBpcyBub3QgcmVjb21tZW5kZWQuYFxuICApO1xufVxuXG4vKipcbiAqIFJlbmRlcnMgYSB2YWx1ZSwgdXN1YWxseSBhIGxpdC1odG1sIFRlbXBsYXRlUmVzdWx0LCB0byB0aGUgY29udGFpbmVyLlxuICpcbiAqIFRoaXMgZXhhbXBsZSByZW5kZXJzIHRoZSB0ZXh0IFwiSGVsbG8sIFpvZSFcIiBpbnNpZGUgYSBwYXJhZ3JhcGggdGFnLCBhcHBlbmRpbmdcbiAqIGl0IHRvIHRoZSBjb250YWluZXIgYGRvY3VtZW50LmJvZHlgLlxuICpcbiAqIGBgYGpzXG4gKiBpbXBvcnQge2h0bWwsIHJlbmRlcn0gZnJvbSAnbGl0JztcbiAqXG4gKiBjb25zdCBuYW1lID0gXCJab2VcIjtcbiAqIHJlbmRlcihodG1sYDxwPkhlbGxvLCAke25hbWV9ITwvcD5gLCBkb2N1bWVudC5ib2R5KTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB2YWx1ZSBBbnkgW3JlbmRlcmFibGVcbiAqICAgdmFsdWVdKGh0dHBzOi8vbGl0LmRldi9kb2NzL3RlbXBsYXRlcy9leHByZXNzaW9ucy8jY2hpbGQtZXhwcmVzc2lvbnMpLFxuICogICB0eXBpY2FsbHkgYSB7QGxpbmtjb2RlIFRlbXBsYXRlUmVzdWx0fSBjcmVhdGVkIGJ5IGV2YWx1YXRpbmcgYSB0ZW1wbGF0ZSB0YWdcbiAqICAgbGlrZSB7QGxpbmtjb2RlIGh0bWx9IG9yIHtAbGlua2NvZGUgc3ZnfS5cbiAqIEBwYXJhbSBjb250YWluZXIgQSBET00gY29udGFpbmVyIHRvIHJlbmRlciB0by4gVGhlIGZpcnN0IHJlbmRlciB3aWxsIGFwcGVuZFxuICogICB0aGUgcmVuZGVyZWQgdmFsdWUgdG8gdGhlIGNvbnRhaW5lciwgYW5kIHN1YnNlcXVlbnQgcmVuZGVycyB3aWxsXG4gKiAgIGVmZmljaWVudGx5IHVwZGF0ZSB0aGUgcmVuZGVyZWQgdmFsdWUgaWYgdGhlIHNhbWUgcmVzdWx0IHR5cGUgd2FzXG4gKiAgIHByZXZpb3VzbHkgcmVuZGVyZWQgdGhlcmUuXG4gKiBAcGFyYW0gb3B0aW9ucyBTZWUge0BsaW5rY29kZSBSZW5kZXJPcHRpb25zfSBmb3Igb3B0aW9ucyBkb2N1bWVudGF0aW9uLlxuICogQHNlZVxuICoge0BsaW5rIGh0dHBzOi8vbGl0LmRldi9kb2NzL2xpYnJhcmllcy9zdGFuZGFsb25lLXRlbXBsYXRlcy8jcmVuZGVyaW5nLWxpdC1odG1sLXRlbXBsYXRlc3wgUmVuZGVyaW5nIExpdCBIVE1MIFRlbXBsYXRlc31cbiAqL1xuZXhwb3J0IGNvbnN0IHJlbmRlciA9IChcbiAgdmFsdWU6IHVua25vd24sXG4gIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50LFxuICBvcHRpb25zPzogUmVuZGVyT3B0aW9uc1xuKTogUm9vdFBhcnQgPT4ge1xuICBpZiAoREVWX01PREUgJiYgY29udGFpbmVyID09IG51bGwpIHtcbiAgICAvLyBHaXZlIGEgY2xlYXJlciBlcnJvciBtZXNzYWdlIHRoYW5cbiAgICAvLyAgICAgVW5jYXVnaHQgVHlwZUVycm9yOiBDYW5ub3QgcmVhZCBwcm9wZXJ0aWVzIG9mIG51bGwgKHJlYWRpbmdcbiAgICAvLyAgICAgJ18kbGl0UGFydCQnKVxuICAgIC8vIHdoaWNoIHJlYWRzIGxpa2UgYW4gaW50ZXJuYWwgTGl0IGVycm9yLlxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBjb250YWluZXIgdG8gcmVuZGVyIGludG8gbWF5IG5vdCBiZSAke2NvbnRhaW5lcn1gKTtcbiAgfVxuICBjb25zdCByZW5kZXJJZCA9IERFVl9NT0RFID8gZGVidWdMb2dSZW5kZXJJZCsrIDogMDtcbiAgY29uc3QgcGFydE93bmVyTm9kZSA9IG9wdGlvbnM/LnJlbmRlckJlZm9yZSA/PyBjb250YWluZXI7XG4gIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIGxldCBwYXJ0OiBDaGlsZFBhcnQgPSAocGFydE93bmVyTm9kZSBhcyBhbnkpWydfJGxpdFBhcnQkJ107XG4gIGRlYnVnTG9nRXZlbnQgJiZcbiAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgIGtpbmQ6ICdiZWdpbiByZW5kZXInLFxuICAgICAgaWQ6IHJlbmRlcklkLFxuICAgICAgdmFsdWUsXG4gICAgICBjb250YWluZXIsXG4gICAgICBvcHRpb25zLFxuICAgICAgcGFydCxcbiAgICB9KTtcbiAgaWYgKHBhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGVuZE5vZGUgPSBvcHRpb25zPy5yZW5kZXJCZWZvcmUgPz8gbnVsbDtcbiAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgKHBhcnRPd25lck5vZGUgYXMgYW55KVsnXyRsaXRQYXJ0JCddID0gcGFydCA9IG5ldyBDaGlsZFBhcnQoXG4gICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCBlbmROb2RlKSxcbiAgICAgIGVuZE5vZGUsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICBvcHRpb25zID8/IHt9XG4gICAgKTtcbiAgfVxuICBwYXJ0Ll8kc2V0VmFsdWUodmFsdWUpO1xuICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgZGVidWdMb2dFdmVudCh7XG4gICAgICBraW5kOiAnZW5kIHJlbmRlcicsXG4gICAgICBpZDogcmVuZGVySWQsXG4gICAgICB2YWx1ZSxcbiAgICAgIGNvbnRhaW5lcixcbiAgICAgIG9wdGlvbnMsXG4gICAgICBwYXJ0LFxuICAgIH0pO1xuICByZXR1cm4gcGFydCBhcyBSb290UGFydDtcbn07XG5cbmlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgcmVuZGVyLnNldFNhbml0aXplciA9IHNldFNhbml0aXplcjtcbiAgcmVuZGVyLmNyZWF0ZVNhbml0aXplciA9IGNyZWF0ZVNhbml0aXplcjtcbiAgaWYgKERFVl9NT0RFKSB7XG4gICAgcmVuZGVyLl90ZXN0T25seUNsZWFyU2FuaXRpemVyRmFjdG9yeURvTm90Q2FsbE9yRWxzZSA9XG4gICAgICBfdGVzdE9ubHlDbGVhclNhbml0aXplckZhY3RvcnlEb05vdENhbGxPckVsc2U7XG4gIH1cbn1cbiIsICIvKiogUmVzdWx0IGFsbG93cyBlYXNpZXIgaGFuZGxpbmcgb2YgcmV0dXJuaW5nIGVpdGhlciBhbiBlcnJvciBvciBhIHZhbHVlIGZyb20gYVxuICogZnVuY3Rpb24uICovXG5leHBvcnQgdHlwZSBSZXN1bHQ8VD4gPSB7IG9rOiB0cnVlOyB2YWx1ZTogVCB9IHwgeyBvazogZmFsc2U7IGVycm9yOiBFcnJvciB9O1xuXG5leHBvcnQgZnVuY3Rpb24gb2s8VD4odmFsdWU6IFQpOiBSZXN1bHQ8VD4ge1xuICByZXR1cm4geyBvazogdHJ1ZSwgdmFsdWU6IHZhbHVlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcnJvcjxUPih2YWx1ZTogc3RyaW5nIHwgRXJyb3IpOiBSZXN1bHQ8VD4ge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogbmV3IEVycm9yKHZhbHVlKSB9O1xuICB9XG4gIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IHZhbHVlIH07XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IE9wIH0gZnJvbSBcIi4uL29wcy9vcHNcIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vcmVzdWx0XCI7XG5cbmV4cG9ydCB0eXBlIFBvc3RBY3RvbldvcmsgPSBcIlwiIHwgXCJwYWludENoYXJ0XCIgfCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrO1xuICAvLyBUT0RPIC0gRG8gd2UgbmVlZCBhIFBvc3RBY3Rpb25Gb2N1czogbnVtYmVyIHdoaWNoIHBvaW50cyB0byB0aGUgVGFzayB3ZSBzaG91bGQgbW92ZSB0aGUgZm9jdXMgdG8/XG4gIHVuZG86IGJvb2xlYW47IC8vIElmIHRydWUgaW5jbHVkZSBpbiB1bmRvL3JlZG8gYWN0aW9ucy5cbiAgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+O1xufVxuXG5leHBvcnQgY2xhc3MgTk9PUEFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkRvZXMgbm90aGluZ1wiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIHJldHVybiBvayhuZXcgTk9PUEFjdGlvbigpKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWN0aW9uRnJvbU9wIHtcbiAgbmFtZTogc3RyaW5nID0gXCJBY3Rpb25Gcm9tT3BcIjtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiQWN0aW9uIGNvbnN0cnVjdGVkIGRpcmVjdGx5IGZyb20gYW4gT3AuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrO1xuICB1bmRvOiBib29sZWFuO1xuXG4gIG9wOiBPcDtcblxuICBjb25zdHJ1Y3RvcihvcDogT3AsIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrLCB1bmRvOiBib29sZWFuKSB7XG4gICAgdGhpcy5wb3N0QWN0aW9uV29yayA9IHBvc3RBY3Rpb25Xb3JrO1xuICAgIHRoaXMudW5kbyA9IHVuZG87XG4gICAgdGhpcy5vcCA9IG9wO1xuICB9XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBjb25zdCByZXQgPSB0aGlzLm9wLmFwcGx5VG8oZXhwbGFuTWFpbi5wbGFuKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgZXhwbGFuTWFpbi5wbGFuID0gcmV0LnZhbHVlLnBsYW47XG4gICAgcmV0dXJuIG9rKFxuICAgICAgbmV3IEFjdGlvbkZyb21PcChyZXQudmFsdWUuaW52ZXJzZSwgdGhpcy5wb3N0QWN0aW9uV29yaywgdGhpcy51bmRvKVxuICAgICk7XG4gIH1cbn1cbiIsICIvKiogT25lIHZlcnRleCBvZiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgVmVydGV4ID0gb2JqZWN0O1xuXG4vKiogRXZlcnkgVmVydGV4IGluIGEgZ3JhcGguICovXG5leHBvcnQgdHlwZSBWZXJ0aWNlcyA9IFZlcnRleFtdO1xuXG4vKiogQSBzdWJzZXQgb2YgVmVydGljZXMgcmVmZXJyZWQgdG8gYnkgdGhlaXIgaW5kZXggbnVtYmVyLiAqL1xuZXhwb3J0IHR5cGUgVmVydGV4SW5kaWNlcyA9IG51bWJlcltdO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQge1xuICBpOiBudW1iZXI7XG4gIGo6IG51bWJlcjtcbn1cblxuLyoqIE9uZSBlZGdlIG9mIGEgZ3JhcGgsIHdoaWNoIGlzIGEgZGlyZWN0ZWQgY29ubmVjdGlvbiBmcm9tIHRoZSBpJ3RoIFZlcnRleCB0b1xudGhlIGondGggVmVydGV4LCB3aGVyZSB0aGUgVmVydGV4IGlzIHN0b3JlZCBpbiBhIFZlcnRpY2VzLlxuICovXG5leHBvcnQgY2xhc3MgRGlyZWN0ZWRFZGdlIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIgPSAwLCBqOiBudW1iZXIgPSAwKSB7XG4gICAgdGhpcy5pID0gaTtcbiAgICB0aGlzLmogPSBqO1xuICB9XG5cbiAgZXF1YWwocmhzOiBEaXJlY3RlZEVkZ2UpOiBib29sZWFuIHtcbiAgICByZXR1cm4gcmhzLmkgPT09IHRoaXMuaSAmJiByaHMuaiA9PT0gdGhpcy5qO1xuICB9XG5cbiAgdG9KU09OKCk6IERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBpOiB0aGlzLmksXG4gICAgICBqOiB0aGlzLmosXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSlNPTihkZXM6IERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQpOiBEaXJlY3RlZEVkZ2Uge1xuICAgIHJldHVybiBuZXcgRGlyZWN0ZWRFZGdlKGRlcy5pLCBkZXMuaik7XG4gIH1cbn1cblxuLyoqIEV2ZXJ5IEVnZGUgaW4gYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIEVkZ2VzID0gRGlyZWN0ZWRFZGdlW107XG5cbi8qKiBBIGdyYXBoIGlzIGp1c3QgYSBjb2xsZWN0aW9uIG9mIFZlcnRpY2VzIGFuZCBFZGdlcyBiZXR3ZWVuIHRob3NlIHZlcnRpY2VzLiAqL1xuZXhwb3J0IHR5cGUgRGlyZWN0ZWRHcmFwaCA9IHtcbiAgVmVydGljZXM6IFZlcnRpY2VzO1xuICBFZGdlczogRWRnZXM7XG59O1xuXG4vKipcbiBHcm91cHMgdGhlIEVkZ2VzIGJ5IHRoZWlyIGBpYCB2YWx1ZS5cblxuIEBwYXJhbSBlZGdlcyAtIEFsbCB0aGUgRWdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gQHJldHVybnMgQSBtYXAgZnJvbSB0aGUgVmVydGV4IGluZGV4IHRvIGFsbCB0aGUgRWRnZXMgdGhhdCBzdGFydCBhdFxuICAgYXQgdGhhdCBWZXJ0ZXggaW5kZXguXG4gKi9cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjVG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5pKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaSwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKlxuICAgR3JvdXBzIHRoZSBFZGdlcyBieSB0aGVpciBgamAgdmFsdWUuXG4gIFxuICAgQHBhcmFtIGVkZ2VzIC0gQWxsIHRoZSBFZGdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gICBAcmV0dXJucyBBIG1hcCBmcm9tIHRoZSBWZXJ0ZXggaW5kZXggdG8gYWxsIHRoZSBFZGdlcyB0aGF0IGVuZCBhdFxuICAgICBhdCB0aGF0IFZlcnRleCBpbmRleC5cbiAgICovXG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5RHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCB0eXBlIFNyY0FuZERzdFJldHVybiA9IHtcbiAgYnlTcmM6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbiAgYnlEc3Q6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbn07XG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogU3JjQW5kRHN0UmV0dXJuID0+IHtcbiAgY29uc3QgcmV0ID0ge1xuICAgIGJ5U3JjOiBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCksXG4gICAgYnlEc3Q6IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKSxcbiAgfTtcblxuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBsZXQgYXJyID0gcmV0LmJ5U3JjLmdldChlLmkpIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5ieVNyYy5zZXQoZS5pLCBhcnIpO1xuICAgIGFyciA9IHJldC5ieURzdC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuYnlEc3Quc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvayB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5cbi8vIE9wZXJhdGlvbnMgb24gUGxhbnMuIE5vdGUgdGhleSBhcmUgcmV2ZXJzaWJsZSwgc28gd2UgY2FuIGhhdmUgYW4gJ3VuZG8nIGxpc3QuXG5cbi8vIEFsc28sIHNvbWUgb3BlcmF0aW9ucyBtaWdodCBoYXZlICdwYXJ0aWFscycsIGkuZS4gcmV0dXJuIGEgbGlzdCBvZiB2YWxpZFxuLy8gb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlIG9wZXJhdGlvbi4gRm9yIGV4YW1wbGUsIGFkZGluZyBhXG4vLyBwcmVkZWNlc3NvciBjb3VsZCBsaXN0IGFsbCB0aGUgVGFza3MgdGhhdCB3b3VsZCBub3QgZm9ybSBhIGxvb3AsIGkuZS4gZXhjbHVkZVxuLy8gYWxsIGRlc2NlbmRlbnRzLCBhbmQgdGhlIFRhc2sgaXRzZWxmLCBmcm9tIHRoZSBsaXN0IG9mIG9wdGlvbnMuXG4vL1xuLy8gKiBDaGFuZ2Ugc3RyaW5nIHZhbHVlIGluIGEgVGFzay5cbi8vICogQ2hhbmdlIGR1cmF0aW9uIHZhbHVlIGluIGEgVGFzay5cbi8vICogSW5zZXJ0IG5ldyBlbXB0eSBUYXNrIGFmdGVyIEluZGV4LlxuLy8gKiBTcGxpdCBhIFRhc2suIChQcmVkZWNlc3NvciB0YWtlcyBhbGwgaW5jb21pbmcgZWRnZXMsIHNvdXJjZSB0YXNrcyBhbGwgb3V0Z29pbmcgZWRnZXMpLlxuLy9cbi8vICogRHVwbGljYXRlIGEgVGFzayAoYWxsIGVkZ2VzIGFyZSBkdXBsaWNhdGVkIGZyb20gdGhlIHNvdXJjZSBUYXNrKS5cbi8vICogRGVsZXRlIHByZWRlY2Vzc29yIHRvIGEgVGFzay5cbi8vICogRGVsZXRlIHN1Y2Nlc3NvciB0byBhIFRhc2suXG4vLyAqIERlbGV0ZSBhIFRhc2suXG5cbi8vIE5lZWQgVW5kby9SZWRvIFN0YWNrcy5cbi8vIFRoZXNlIHJlY29yZCB0aGUgc3ViLW9wcyBmb3IgZWFjaCBsYXJnZSBvcC4gRS5nLiBhbiBpbnNlcnQgdGFzayBvcCBpcyBtYWRlXG4vLyBvZiB0aHJlZSBzdWItb3BzOlxuLy8gICAgMS4gaW5zZXJ0IHRhc2sgaW50byBWZXJ0aWNlcyBhbmQgcmVudW1iZXIgRWRnZXNcbi8vICAgIDIuIEFkZCBlZGdlIGZyb20gU3RhcnQgdG8gTmV3IFRhc2tcbi8vICAgIDMuIEFkZCBlZGdlIGZyb20gTmV3IFRhc2sgdG8gRmluaXNoXG4vL1xuLy8gRWFjaCBzdWItb3A6XG4vLyAgICAxLiBSZWNvcmRzIGFsbCB0aGUgaW5mbyBpdCBuZWVkcyB0byB3b3JrLlxuLy8gICAgMi4gQ2FuIGJlIFwiYXBwbGllZFwiIHRvIGEgUGxhbi5cbi8vICAgIDMuIENhbiBnZW5lcmF0ZSBpdHMgaW52ZXJzZSBzdWItb3AuXG5cbi8vIFRoZSByZXN1bHRzIGZyb20gYXBwbHlpbmcgYSBTdWJPcC4gVGhpcyBpcyB0aGUgb25seSB3YXkgdG8gZ2V0IHRoZSBpbnZlcnNlIG9mXG4vLyBhIFN1Yk9wIHNpbmNlIHRoZSBTdWJPcCBpbnZlcnNlIG1pZ2h0IGRlcGVuZCBvbiB0aGUgc3RhdGUgb2YgdGhlIFBsYW4gYXQgdGhlXG4vLyB0aW1lIHRoZSBTdWJPcCB3YXMgYXBwbGllZC5cbmV4cG9ydCBpbnRlcmZhY2UgU3ViT3BSZXN1bHQge1xuICBwbGFuOiBQbGFuO1xuICBpbnZlcnNlOiBTdWJPcDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdWJPcCB7XG4gIC8vIElmIHRoZSBhcHBseSByZXR1cm5zIGFuIGVycm9yIGl0IGlzIGd1YXJhbnRlZWQgbm90IHRvIGhhdmUgbW9kaWZpZWQgdGhlXG4gIC8vIFBsYW4uXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3BSZXN1bHQge1xuICBwbGFuOiBQbGFuO1xuICBpbnZlcnNlOiBPcDtcbn1cblxuLy8gT3AgYXJlIG9wZXJhdGlvbnMgYXJlIGFwcGxpZWQgdG8gbWFrZSBjaGFuZ2VzIHRvIGEgUGxhbi5cbmV4cG9ydCBjbGFzcyBPcCB7XG4gIHN1Yk9wczogU3ViT3BbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHN1Yk9wczogU3ViT3BbXSkge1xuICAgIHRoaXMuc3ViT3BzID0gc3ViT3BzO1xuICB9XG5cbiAgLy8gUmV2ZXJ0cyBhbGwgU3ViT3BzIHVwIHRvIHRoZSBnaXZlbiBpbmRleC5cbiAgYXBwbHlBbGxJbnZlcnNlU3ViT3BzVG9QbGFuKFxuICAgIHBsYW46IFBsYW4sXG4gICAgaW52ZXJzZVN1Yk9wczogU3ViT3BbXVxuICApOiBSZXN1bHQ8UGxhbj4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW52ZXJzZVN1Yk9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZSA9IGludmVyc2VTdWJPcHNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHBsYW4pO1xuICB9XG5cbiAgLy8gQXBwbGllcyB0aGUgT3AgdG8gYSBQbGFuLlxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8T3BSZXN1bHQ+IHtcbiAgICBjb25zdCBpbnZlcnNlU3ViT3BzOiBTdWJPcFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1Yk9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZSA9IHRoaXMuc3ViT3BzW2ldLmFwcGx5VG8ocGxhbik7XG4gICAgICBpZiAoIWUub2spIHtcbiAgICAgICAgLy8gUmV2ZXJ0IGFsbCB0aGUgU3ViT3BzIGFwcGxpZWQgdXAgdG8gdGhpcyBwb2ludCB0byBnZXQgdGhlIFBsYW4gYmFjayBpbiBhXG4gICAgICAgIC8vIGdvb2QgcGxhY2UuXG4gICAgICAgIGNvbnN0IHJldmVydEVyciA9IHRoaXMuYXBwbHlBbGxJbnZlcnNlU3ViT3BzVG9QbGFuKHBsYW4sIGludmVyc2VTdWJPcHMpO1xuICAgICAgICBpZiAoIXJldmVydEVyci5vaykge1xuICAgICAgICAgIHJldHVybiByZXZlcnRFcnI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgICBwbGFuID0gZS52YWx1ZS5wbGFuO1xuICAgICAgaW52ZXJzZVN1Yk9wcy51bnNoaWZ0KGUudmFsdWUuaW52ZXJzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiBuZXcgT3AoaW52ZXJzZVN1Yk9wcyksXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQWxsT3BzUmVzdWx0ID0ge1xuICBvcHM6IE9wW107XG4gIHBsYW46IFBsYW47XG59O1xuXG5jb25zdCBhcHBseUFsbEludmVyc2VPcHNUb1BsYW4gPSAoaW52ZXJzZXM6IE9wW10sIHBsYW46IFBsYW4pOiBSZXN1bHQ8UGxhbj4gPT4ge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGludmVyc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gaW52ZXJzZXNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgcGxhbiA9IHJlcy52YWx1ZS5wbGFuO1xuICB9XG5cbiAgcmV0dXJuIG9rKHBsYW4pO1xufTtcblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGFwcGx5aW5nIG11bHRpcGxlIE9wcyB0byBhIHBsYW4sIHVzZWQgbW9zdGx5IGZvclxuLy8gdGVzdGluZy5cbmV4cG9ydCBjb25zdCBhcHBseUFsbE9wc1RvUGxhbiA9IChcbiAgb3BzOiBPcFtdLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8QWxsT3BzUmVzdWx0PiA9PiB7XG4gIGNvbnN0IGludmVyc2VzOiBPcFtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gb3BzW2ldLmFwcGx5VG8ocGxhbik7XG4gICAgaWYgKCFyZXMub2spIHtcbiAgICAgIGNvbnN0IGludmVyc2VSZXMgPSBhcHBseUFsbEludmVyc2VPcHNUb1BsYW4oaW52ZXJzZXMsIHBsYW4pO1xuICAgICAgaWYgKCFpbnZlcnNlUmVzLm9rKSB7XG4gICAgICAgIC8vIFRPRE8gQ2FuIHdlIHdyYXAgdGhlIEVycm9yIGluIGFub3RoZXIgZXJyb3IgdG8gbWFrZSBpdCBjbGVhciB0aGlzXG4gICAgICAgIC8vIGVycm9yIGhhcHBlbmVkIHdoZW4gdHJ5aW5nIHRvIGNsZWFuIHVwIGZyb20gdGhlIHByZXZpb3VzIEVycm9yIHdoZW5cbiAgICAgICAgLy8gdGhlIGFwcGx5KCkgZmFpbGVkLlxuICAgICAgICByZXR1cm4gaW52ZXJzZVJlcztcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIGludmVyc2VzLnVuc2hpZnQocmVzLnZhbHVlLmludmVyc2UpO1xuICAgIHBsYW4gPSByZXMudmFsdWUucGxhbjtcbiAgfVxuXG4gIHJldHVybiBvayh7XG4gICAgb3BzOiBpbnZlcnNlcyxcbiAgICBwbGFuOiBwbGFuLFxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBhcHBseUFsbE9wc1RvUGxhbkFuZFRoZW5JbnZlcnNlID0gKFxuICBvcHM6IE9wW10sXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxBbGxPcHNSZXN1bHQ+ID0+IHtcbiAgY29uc3QgcmVzID0gYXBwbHlBbGxPcHNUb1BsYW4ob3BzLCBwbGFuKTtcbiAgaWYgKCFyZXMub2spIHtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIHJldHVybiBhcHBseUFsbE9wc1RvUGxhbihyZXMudmFsdWUub3BzLCByZXMudmFsdWUucGxhbik7XG59O1xuLy8gTm9PcCBpcyBhIG5vLW9wLlxuZXhwb3J0IGZ1bmN0aW9uIE5vT3AoKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtdKTtcbn1cbiIsICIvLyBDaGFuZ2VNZXRyaWNWYWx1ZVxuXG5pbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNEZWZpbml0aW9uIH0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgZXJyb3IsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuXG5leHBvcnQgY2xhc3MgQWRkTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbjtcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbWV0cmljIGtleS5cbiAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24gPSBtZXRyaWNEZWZpbml0aW9uO1xuICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcyA9IHRhc2tNZXRyaWNWYWx1ZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAocGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gYWxyZWFkeSBleGlzdHMgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG5cbiAgICBwbGFuLnNldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lLCB0aGlzLm1ldHJpY0RlZmluaXRpb24pO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBhZGQgdGhpcyBtZXRyaWMgYW5kIHNldCBpdCB0byB0aGUgZGVmYXVsdCxcbiAgICAvLyB1bmxlc3MgdGhlcmUgaXMgbWF0Y2hpbmcgZW50cnkgaW4gdGFza01ldHJpY1ZhbHVlcywgaW4gd2hpY2ggY2FzZSB3ZSB3aWxsXG4gICAgLy8gdXNlIHRoYXQgdmFsdWUsIGkuZS4gdGhpcyBBZGRNZXRyaWNTdWJPcCBpcyBhY3R1YWxseSBhIHJldmVydCBvZiBhXG4gICAgLy8gRGVsZXRlTWV0cmljU3ViT3AuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICB0YXNrLnNldE1ldHJpYyhcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuZ2V0KGluZGV4KSB8fCB0aGlzLm1ldHJpY0RlZmluaXRpb24uZGVmYXVsdFxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVNZXRyaWNTdWJPcCh0aGlzLm5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBtZXRyaWNEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG5cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBUaGUgbWV0cmljIHdpdGggbmFtZSAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYW5kIGNhbid0IGJlIGRlbGV0ZWQuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBUaGUgc3RhdGljIE1ldHJpYyAke3RoaXMubmFtZX0gY2FuJ3QgYmUgZGVsZXRlZC5gKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZnJvbSByZXNvdXJjZSBkZWZpbml0aW9ucy5cbiAgICBwbGFuLmRlbGV0ZU1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcblxuICAgIGNvbnN0IHRhc2tJbmRleFRvRGVsZXRlZE1ldHJpY1ZhbHVlOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gTm93IGxvb2sgYXQgYWxsIFRhc2tzIGFuZCByZW1vdmUgYHRoaXMubmFtZWAgZnJvbSB0aGUgbWV0cmljIHdoaWxlIGFsc29cbiAgICAvLyBidWlsZGluZyB1cCB0aGUgaW5mbyBuZWVkZWQgZm9yIGEgcmV2ZXJ0LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpO1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWUuc2V0KGluZGV4LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICB0YXNrLmRlbGV0ZU1ldHJpYyh0aGlzLm5hbWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UobWV0cmljRGVmaW5pdGlvbiwgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWUpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKFxuICAgIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24sXG4gICAgbWV0cmljVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlTmFtZTogTWFwPG51bWJlciwgbnVtYmVyPlxuICApOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRNZXRyaWNTdWJPcChcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIG1ldHJpY0RlZmluaXRpb24sXG4gICAgICBtZXRyaWNWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VOYW1lXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG9sZE5hbWU6IHN0cmluZztcbiAgbmV3TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9sZE5hbWU6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5vbGROYW1lID0gb2xkTmFtZTtcbiAgICB0aGlzLm5ld05hbWUgPSBuZXdOYW1lO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5ld05hbWUpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld05hbWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgbWV0cmljLmApO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5vbGROYW1lKTtcbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5vbGROYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBTdGF0aWMgbWV0cmljICR7dGhpcy5vbGROYW1lfSBjYW4ndCBiZSByZW5hbWVkLmApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5ld05hbWUsIG1ldHJpY0RlZmluaXRpb24pO1xuICAgIHBsYW4uZGVsZXRlTWV0cmljRGVmaW5pdGlvbih0aGlzLm9sZE5hbWUpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCByZW5hbWUgdGhpcyBtZXRyaWMuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMub2xkTmFtZSkgfHwgbWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgICAgdGFzay5zZXRNZXRyaWModGhpcy5uZXdOYW1lLCB2YWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZU1ldHJpYyh0aGlzLm9sZE5hbWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZU1ldHJpY1N1Yk9wKHRoaXMubmV3TmFtZSwgdGhpcy5vbGROYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVXBkYXRlTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbjtcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbWV0cmljIGtleS5cbiAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24gPSBtZXRyaWNEZWZpbml0aW9uO1xuICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcyA9IHRhc2tNZXRyaWNWYWx1ZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBvbGRNZXRyaWNEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG4gICAgaWYgKG9sZE1ldHJpY0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG4gICAgaWYgKG9sZE1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBlcnJvcihgU3RhdGljIG1ldHJpYyAke3RoaXMubmFtZX0gY2FuJ3QgYmUgdXBkYXRlZC5gKTtcbiAgICB9XG5cbiAgICAvLyBSYXRpb25hbGl6ZSBkZWZhdWx0IHNob3VsZCBiZSBpbiBbbWluLCBtYXhdLlxuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0ID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLnJhbmdlLmNsYW1wKFxuICAgICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uLmRlZmF1bHRcbiAgICApO1xuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSwgdGhpcy5tZXRyaWNEZWZpbml0aW9uKTtcblxuICAgIGNvbnN0IHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCB1cGRhdGUgdGhlIG1ldHJpYyB2YWx1ZXMgdG8gcmVmbGVjdCB0aGUgbmV3XG4gICAgLy8gbWV0cmljIGRlZmluaXRpb24sIHVubGVzcyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrTWV0cmljVmFsdWVzLCBpblxuICAgIC8vIHdoaWNoIGNhc2Ugd2Ugd2lsbCB1c2UgdGhhdCB2YWx1ZSwgaS5lLiB0aGlzIFVwZGF0ZU1ldHJpY1N1Yk9wIGlzXG4gICAgLy8gYWN0dWFsbHkgYSByZXZlcnQgb2YgYW5vdGhlciBVcGRhdGVNZXRyaWNTdWJPcC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKSE7XG5cbiAgICAgIGxldCBuZXdWYWx1ZTogbnVtYmVyO1xuICAgICAgaWYgKHRoaXMudGFza01ldHJpY1ZhbHVlcy5oYXMoaW5kZXgpKSB7XG4gICAgICAgIC8vIHRhc2tNZXRyaWNWYWx1ZXMgaGFzIGEgdmFsdWUgdGhlbiB1c2UgdGhhdCwgYXMgdGhpcyBpcyBhbiBpbnZlcnNlXG4gICAgICAgIC8vIG9wZXJhdGlvbi5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuZ2V0KGluZGV4KSE7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBvbGRWYWx1ZSA9PT0gb2xkTWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0ICYmXG4gICAgICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbi5yYW5nZS5taW4gPD0gb2xkVmFsdWUgJiZcbiAgICAgICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uLnJhbmdlLm1heCA+IG9sZFZhbHVlXG4gICAgICApIHtcbiAgICAgICAgLy8gSWYgdGhlIG9sZFZhbHVlIGlzIHRoZSBkZWZhdWx0LCBjaGFuZ2UgaXQgdG8gdGhlIG5ldyBkZWZhdWx0LCBidXQgb25seSBpZiB0aGVcbiAgICAgICAgLy8gbmV3IGRlZmF1bHQgaXMgaW4gdGhlIHJhbmdlLlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgICAgICB0YXNrTWV0cmljVmFsdWVzLnNldChpbmRleCwgb2xkVmFsdWUpO1xuXG4gICAgICAgIC8vIFdoYXQgbWlnaHQgaGF2ZSBjaGFuZ2VkIGlzIHRoZSBtaW4gb3IgbWF4IG5ld1ZhbHVlLCB3aGljaCBtaWdodCBtYWtlXG4gICAgICAgIC8vIHRoZSBkZWZhdWx0IHZhbHVlIGludmFsaWQuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDbGFtcC5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24ucmFuZ2UuY2xhbXAob2xkVmFsdWUpO1xuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5wcmVjaXNpb24ucm91bmQobmV3VmFsdWUpO1xuICAgICAgICB0YXNrTWV0cmljVmFsdWVzLnNldChpbmRleCwgb2xkVmFsdWUpO1xuICAgICAgfVxuICAgICAgdGFzay5zZXRNZXRyaWModGhpcy5uYW1lLCBuZXdWYWx1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRNZXRyaWNEZWZpbml0aW9uLCB0YXNrTWV0cmljVmFsdWVzKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoXG4gICAgb2xkTWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFVwZGF0ZU1ldHJpY1N1Yk9wKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgb2xkTWV0cmljRGVmaW5pdGlvbixcbiAgICAgIHRhc2tNZXRyaWNWYWx1ZXNcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRNZXRyaWNWYWx1ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG4gIHZhbHVlOiBudW1iZXI7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgdmFsdWU6IG51bWJlciwgdGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG1ldHJpY3NEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG4gICAgaWYgKG1ldHJpY3NEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5hbWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgTWV0cmljYCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFzayA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdO1xuICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKSB8fCBtZXRyaWNzRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgIHRhc2suc2V0TWV0cmljKHRoaXMubmFtZSwgbWV0cmljc0RlZmluaXRpb24uY2xhbXBBbmRSb3VuZCh0aGlzLnZhbHVlKSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkVmFsdWUpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSh2YWx1ZTogbnVtYmVyKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0TWV0cmljVmFsdWVTdWJPcCh0aGlzLm5hbWUsIHZhbHVlLCB0aGlzLnRhc2tJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZE1ldHJpY09wKFxuICBuYW1lOiBzdHJpbmcsXG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb25cbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZE1ldHJpY1N1Yk9wKG5hbWUsIG1ldHJpY0RlZmluaXRpb24pXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVNZXRyaWNPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVNZXRyaWNTdWJPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lTWV0cmljT3Aob2xkTmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVNZXRyaWNTdWJPcChvbGROYW1lLCBuZXdOYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVXBkYXRlTWV0cmljT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvblxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgVXBkYXRlTWV0cmljU3ViT3AobmFtZSwgbWV0cmljRGVmaW5pdGlvbildKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldE1ldHJpY1ZhbHVlT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgdmFsdWU6IG51bWJlcixcbiAgdGFza0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AobmFtZSwgdmFsdWUsIHRhc2tJbmRleCldKTtcbn1cbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgZWRnZXNCeVNyY0FuZERzdFRvTWFwIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBDaGFydCwgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuaW1wb3J0IHsgU2V0TWV0cmljVmFsdWVPcCwgU2V0TWV0cmljVmFsdWVTdWJPcCB9IGZyb20gXCIuL21ldHJpY3MudHNcIjtcblxuLyoqIEEgdmFsdWUgb2YgLTEgZm9yIGogbWVhbnMgdGhlIEZpbmlzaCBNaWxlc3RvbmUuICovXG5leHBvcnQgZnVuY3Rpb24gRGlyZWN0ZWRFZGdlRm9yUGxhbihcbiAgaTogbnVtYmVyLFxuICBqOiBudW1iZXIsXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxEaXJlY3RlZEVkZ2U+IHtcbiAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICBpZiAoaiA9PT0gLTEpIHtcbiAgICBqID0gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgfVxuICBpZiAoaSA8IDAgfHwgaSA+PSBjaGFydC5WZXJ0aWNlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgaSBpbmRleCBvdXQgb2YgcmFuZ2U6ICR7aX0gbm90IGluIFswLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDF9XWBcbiAgICApO1xuICB9XG4gIGlmIChqIDwgMCB8fCBqID49IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBqIGluZGV4IG91dCBvZiByYW5nZTogJHtqfSBub3QgaW4gWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMX1dYFxuICAgICk7XG4gIH1cbiAgaWYgKGkgPT09IGopIHtcbiAgICByZXR1cm4gZXJyb3IoYEEgVGFzayBjYW4gbm90IGRlcGVuZCBvbiBpdHNlbGY6ICR7aX0gPT09ICR7an1gKTtcbiAgfVxuICByZXR1cm4gb2sobmV3IERpcmVjdGVkRWRnZShpLCBqKSk7XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRFZGdlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyLCBqOiBudW1iZXIpIHtcbiAgICB0aGlzLmkgPSBpO1xuICAgIHRoaXMuaiA9IGo7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5pID09PSAtMSkge1xuICAgICAgdGhpcy5pID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cbiAgICBpZiAodGhpcy5qID09PSAtMSkge1xuICAgICAgdGhpcy5qID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICAgIH1cblxuICAgIGNvbnN0IGUgPSBEaXJlY3RlZEVkZ2VGb3JQbGFuKHRoaXMuaSwgdGhpcy5qLCBwbGFuKTtcbiAgICBpZiAoIWUub2spIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIC8vIE9ubHkgYWRkIHRoZSBlZGdlIGlmIGl0IGRvZXNuJ3QgZXhpc3RzIGFscmVhZHkuXG4gICAgaWYgKCFwbGFuLmNoYXJ0LkVkZ2VzLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmVxdWFsKGUudmFsdWUpKSkge1xuICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKGUudmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbW92ZUVkZ2VTdXBPcCh0aGlzLmksIHRoaXMuaik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW92ZUVkZ2VTdXBPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmICh0aGlzLmkgPT09IC0xKSB7XG4gICAgICB0aGlzLmkgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuICAgIGlmICh0aGlzLmogPT09IC0xKSB7XG4gICAgICB0aGlzLmogPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuXG4gICAgY29uc3QgZSA9IERpcmVjdGVkRWRnZUZvclBsYW4odGhpcy5pLCB0aGlzLmosIHBsYW4pO1xuICAgIGlmICghZS5vaykge1xuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgICh2OiBEaXJlY3RlZEVkZ2UpOiBib29sZWFuID0+ICF2LmVxdWFsKGUudmFsdWUpXG4gICAgKTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZEVkZ2VTdWJPcCh0aGlzLmksIHRoaXMuaik7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5kZXhJblJhbmdlRm9yVmVydGljZXMoaW5kZXg6IG51bWJlciwgY2hhcnQ6IENoYXJ0KTogUmVzdWx0PG51bGw+IHtcbiAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDIpIHtcbiAgICByZXR1cm4gZXJyb3IoYCR7aW5kZXh9IGlzIG5vdCBpbiByYW5nZSBbMCwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyfV1gKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59XG5cbmZ1bmN0aW9uIGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKFxuICBpbmRleDogbnVtYmVyLFxuICBjaGFydDogQ2hhcnRcbik6IFJlc3VsdDxudWxsPiB7XG4gIGlmIChpbmRleCA8IDEgfHwgaW5kZXggPiBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyKSB7XG4gICAgcmV0dXJuIGVycm9yKGAke2luZGV4fSBpcyBub3QgaW4gcmFuZ2UgWzEsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMn1dYCk7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufVxuXG5leHBvcnQgY2xhc3MgQWRkVGFza0FmdGVyU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuICBmdWxsVGFza1RvQmVSZXN0b3JlZDogRnVsbFRhc2tUb0JlUmVzdG9yZWQgfCBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGluZGV4OiBudW1iZXIsXG4gICAgZnVsbFRhc2tUb0JlUmVzdG9yZWQ6IEZ1bGxUYXNrVG9CZVJlc3RvcmVkIHwgbnVsbCA9IG51bGxcbiAgKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQgPSBmdWxsVGFza1RvQmVSZXN0b3JlZDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGxldCB0YXNrID0gcGxhbi5uZXdUYXNrKCk7XG4gICAgaWYgKHRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQgIT09IG51bGwpIHtcbiAgICAgIHRhc2sgPSB0aGlzLmZ1bGxUYXNrVG9CZVJlc3RvcmVkLnRhc2s7XG4gICAgfVxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXggKyAxLCAwLCB0YXNrKTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID49IHRoaXMuaW5kZXggKyAxKSB7XG4gICAgICAgIGVkZ2UuaSsrO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA+PSB0aGlzLmluZGV4ICsgMSkge1xuICAgICAgICBlZGdlLmorKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5mdWxsVGFza1RvQmVSZXN0b3JlZCAhPT0gbnVsbCkge1xuICAgICAgY2hhcnQuRWRnZXMucHVzaCguLi50aGlzLmZ1bGxUYXNrVG9CZVJlc3RvcmVkLmVkZ2VzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlVGFza1N1Yk9wKHRoaXMuaW5kZXggKyAxKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRHVwVGFza1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjb25zdCBjb3B5ID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLmluZGV4XS5kdXAoKTtcbiAgICAvLyBJbnNlcnQgdGhlIGR1cGxpY2F0ZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgVGFzayBpdCBpcyBjb3BpZWQgZnJvbS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAwLCBjb3B5KTtcblxuICAgIC8vIFVwZGF0ZSBFZGdlcy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICBpZiAoZWRnZS5pID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmkrKztcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaisrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlVGFza1N1Yk9wKHRoaXMuaW5kZXggKyAxKTtcbiAgfVxufVxuXG50eXBlIFN1YnN0aXR1dGlvbiA9IE1hcDxEaXJlY3RlZEVkZ2UsIERpcmVjdGVkRWRnZT47XG5cbmV4cG9ydCBjbGFzcyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBmcm9tVGFza0luZGV4OiBudW1iZXIgPSAwO1xuICB0b1Rhc2tJbmRleDogbnVtYmVyID0gMDtcbiAgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBmcm9tVGFza0luZGV4OiBudW1iZXIsXG4gICAgdG9UYXNrSW5kZXg6IG51bWJlcixcbiAgICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uID0gbmV3IE1hcCgpXG4gICkge1xuICAgIHRoaXMuZnJvbVRhc2tJbmRleCA9IGZyb21UYXNrSW5kZXg7XG4gICAgdGhpcy50b1Rhc2tJbmRleCA9IHRvVGFza0luZGV4O1xuICAgIHRoaXMuYWN0dWFsTW92ZXMgPSBhY3R1YWxNb3ZlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBsZXQgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUodGhpcy5mcm9tVGFza0luZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzRXhjbHVzaXZlKHRoaXMudG9UYXNrSW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hY3R1YWxNb3Zlcy52YWx1ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zdCBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uID0gbmV3IE1hcCgpO1xuICAgICAgLy8gVXBkYXRlIGFsbCBFZGdlcyB0aGF0IHN0YXJ0IGF0ICdmcm9tVGFza0luZGV4JyBhbmQgY2hhbmdlIHRoZSBzdGFydCB0byAndG9UYXNrSW5kZXgnLlxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlZGdlID0gY2hhcnQuRWRnZXNbaV07XG4gICAgICAgIC8vIFNraXAgdGhlIGNvcm5lciBjYXNlIHRoZXJlIGZyb21UYXNrSW5kZXggcG9pbnRzIHRvIFRhc2tJbmRleC5cbiAgICAgICAgaWYgKGVkZ2UuaSA9PT0gdGhpcy5mcm9tVGFza0luZGV4ICYmIGVkZ2UuaiA9PT0gdGhpcy50b1Rhc2tJbmRleCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVkZ2UuaSA9PT0gdGhpcy5mcm9tVGFza0luZGV4KSB7XG4gICAgICAgICAgYWN0dWFsTW92ZXMuc2V0KFxuICAgICAgICAgICAgbmV3IERpcmVjdGVkRWRnZSh0aGlzLnRvVGFza0luZGV4LCBlZGdlLmopLFxuICAgICAgICAgICAgbmV3IERpcmVjdGVkRWRnZShlZGdlLmksIGVkZ2UuailcbiAgICAgICAgICApO1xuICAgICAgICAgIGVkZ2UuaSA9IHRoaXMudG9UYXNrSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvayh7XG4gICAgICAgIHBsYW46IHBsYW4sXG4gICAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShcbiAgICAgICAgICB0aGlzLnRvVGFza0luZGV4LFxuICAgICAgICAgIHRoaXMuZnJvbVRhc2tJbmRleCxcbiAgICAgICAgICBhY3R1YWxNb3Zlc1xuICAgICAgICApLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbmV3RWRnZSA9IHRoaXMuYWN0dWFsTW92ZXMuZ2V0KHBsYW4uY2hhcnQuRWRnZXNbaV0pO1xuICAgICAgICBpZiAobmV3RWRnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcGxhbi5jaGFydC5FZGdlc1tpXSA9IG5ld0VkZ2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9rKHtcbiAgICAgICAgcGxhbjogcGxhbixcbiAgICAgICAgaW52ZXJzZTogbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AoXG4gICAgICAgICAgdGhpcy50b1Rhc2tJbmRleCxcbiAgICAgICAgICB0aGlzLmZyb21UYXNrSW5kZXhcbiAgICAgICAgKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGludmVyc2UoXG4gICAgdG9UYXNrSW5kZXg6IG51bWJlcixcbiAgICBmcm9tVGFza0luZGV4OiBudW1iZXIsXG4gICAgYWN0dWFsTW92ZXM6IFN1YnN0aXR1dGlvblxuICApOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wKFxuICAgICAgdG9UYXNrSW5kZXgsXG4gICAgICBmcm9tVGFza0luZGV4LFxuICAgICAgYWN0dWFsTW92ZXNcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb3B5QWxsRWRnZXNGcm9tVG9TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZnJvbUluZGV4OiBudW1iZXIgPSAwO1xuICB0b0luZGV4OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGZyb21JbmRleDogbnVtYmVyLCB0b0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmZyb21JbmRleCA9IGZyb21JbmRleDtcbiAgICB0aGlzLnRvSW5kZXggPSB0b0luZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy5mcm9tSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGNvbnN0IG5ld0VkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIHBsYW4uY2hhcnQuRWRnZXMuZm9yRWFjaCgoZWRnZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21JbmRleCkge1xuICAgICAgICBuZXdFZGdlcy5wdXNoKG5ldyBEaXJlY3RlZEVkZ2UodGhpcy50b0luZGV4LCBlZGdlLmopKTtcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlLmogPT09IHRoaXMuZnJvbUluZGV4KSB7XG4gICAgICAgIG5ld0VkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZShlZGdlLmksIHRoaXMudG9JbmRleCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCguLi5uZXdFZGdlcyk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgUmVtb3ZlQWxsRWRnZXNTdWJPcChuZXdFZGdlcykgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbW92ZUFsbEVkZ2VzU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXTtcblxuICBjb25zdHJ1Y3RvcihlZGdlczogRGlyZWN0ZWRFZGdlW10pIHtcbiAgICB0aGlzLmVkZ2VzID0gZWRnZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAoZWRnZTogRGlyZWN0ZWRFZGdlKSA9PlxuICAgICAgICAtMSA9PT1cbiAgICAgICAgdGhpcy5lZGdlcy5maW5kSW5kZXgoKHRvQmVSZW1vdmVkOiBEaXJlY3RlZEVkZ2UpID0+XG4gICAgICAgICAgZWRnZS5lcXVhbCh0b0JlUmVtb3ZlZClcbiAgICAgICAgKVxuICAgICk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiBuZXcgQWRkQWxsRWRnZXNTdWJPcCh0aGlzLmVkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCguLi50aGlzLmVkZ2VzKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBSZW1vdmVBbGxFZGdlc1N1Yk9wKHRoaXMuZWRnZXMpIH0pO1xuICB9XG59XG5cbmludGVyZmFjZSBGdWxsVGFza1RvQmVSZXN0b3JlZCB7XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXTtcbiAgdGFzazogVGFzaztcbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVRhc2tTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGNoYXJ0ID0gcGxhbi5jaGFydDtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmluZGV4LCBjaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgZWRnZXNUb0JlUmVzdG9yZWQgPSBjaGFydC5FZGdlcy5maWx0ZXIoKGRlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChkZS5pID09PSB0aGlzLmluZGV4IHx8IGRlLmogPT09IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICAvLyBGaXJzdCByZW1vdmUgYWxsIGVkZ2VzIHRvIGFuZCBmcm9tIHRoZSB0YXNrLlxuICAgIGNoYXJ0LkVkZ2VzID0gY2hhcnQuRWRnZXMuZmlsdGVyKChkZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoZGUuaSA9PT0gdGhpcy5pbmRleCB8fCBkZS5qID09PSB0aGlzLmluZGV4KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIGVkZ2VzIGZvciB0YXNrcyB0aGF0IHdpbGwgZW5kIHVwIGF0IGEgbmV3IGluZGV4LlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgIGlmIChlZGdlLmkgPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaS0tO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5qLS07XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdGFza1RvQmVSZXN0b3JlZCA9IGNoYXJ0LlZlcnRpY2VzLnNwbGljZSh0aGlzLmluZGV4LCAxKTtcbiAgICBjb25zdCBmdWxsVGFza1RvQmVSZXN0b3JlZCA9IHtcbiAgICAgIGVkZ2VzOiBlZGdlc1RvQmVSZXN0b3JlZCxcbiAgICAgIHRhc2s6IHRhc2tUb0JlUmVzdG9yZWRbMF0sXG4gICAgfTtcbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoZnVsbFRhc2tUb0JlUmVzdG9yZWQpIH0pO1xuICB9XG5cbiAgaW52ZXJzZShmdWxsVGFza1RvQmVSZXN0b3JlZDogRnVsbFRhc2tUb0JlUmVzdG9yZWQpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRUYXNrQWZ0ZXJTdWJPcCh0aGlzLmluZGV4IC0gMSwgZnVsbFRhc2tUb0JlUmVzdG9yZWQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBzcmNBbmREc3QgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAocGxhbi5jaGFydC5FZGdlcyk7XG4gICAgY29uc3QgU3RhcnQgPSAwO1xuICAgIGNvbnN0IEZpbmlzaCA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcblxuICAgIC8vIGxvb3Agb3ZlciBhbGwgdmVydGljcyBmcm9tIFtTdGFydCwgRmluaXNoKSBhbmQgbG9vayBmb3IgdGhlaXJcbiAgICAvLyBkZXN0aW5hdGlvbnMuIElmIHRoZXkgaGF2ZSBub25lIHRoZW4gYWRkIGluIGFuIGVkZ2UgdG8gRmluaXNoLiBJZiB0aGV5XG4gICAgLy8gaGF2ZSBtb3JlIHRoYW4gb25lIHRoZW4gcmVtb3ZlIGFueSBsaW5rcyB0byBGaW5pc2guXG4gICAgZm9yIChsZXQgaSA9IFN0YXJ0OyBpIDwgRmluaXNoOyBpKyspIHtcbiAgICAgIGNvbnN0IGRlc3RpbmF0aW9ucyA9IHNyY0FuZERzdC5ieVNyYy5nZXQoaSk7XG4gICAgICBpZiAoZGVzdGluYXRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgdG9CZUFkZGVkID0gbmV3IERpcmVjdGVkRWRnZShpLCBGaW5pc2gpO1xuICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2godG9CZUFkZGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFyZSB0aGVyZSBhbnkgdW5lZWRlZCBFZ2RlcyB0byBGaW5pc2g/IElmIHNvIGZpbHRlciB0aGVtIG91dC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgZGVzdGluYXRpb25zLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmogPT09IEZpbmlzaClcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgdG9CZVJlbW92ZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKGksIEZpbmlzaCk7XG4gICAgICAgICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgICAgICAgKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+ICF0b0JlUmVtb3ZlZC5lcXVhbCh2YWx1ZSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbG9vcCBvdmVyIGFsbCB2ZXJ0aWNzIGZyb20oU3RhcnQsIEZpbmlzaF0gYW5kIGxvb2sgZm9yIHRoZWlyIHNvdXJjZXMuIElmXG4gICAgLy8gdGhleSBoYXZlIG5vbmUgdGhlbiBhZGQgaW4gYW4gZWRnZSBmcm9tIFN0YXJ0LiBJZiB0aGV5IGhhdmUgbW9yZSB0aGFuIG9uZVxuICAgIC8vIHRoZW4gcmVtb3ZlIGFueSBsaW5rcyBmcm9tIFN0YXJ0LlxuICAgIGZvciAobGV0IGkgPSBTdGFydCArIDE7IGkgPCBGaW5pc2g7IGkrKykge1xuICAgICAgY29uc3QgZGVzdGluYXRpb25zID0gc3JjQW5kRHN0LmJ5RHN0LmdldChpKTtcbiAgICAgIGlmIChkZXN0aW5hdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB0b0JlQWRkZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBpKTtcbiAgICAgICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKHRvQmVBZGRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBcmUgdGhlcmUgYW55IHVuLW5lZWRlZCBFZ2RlcyBmcm9tIFN0YXJ0PyBJZiBzbyBmaWx0ZXIgdGhlbSBvdXQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBkZXN0aW5hdGlvbnMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5maW5kKCh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiB2YWx1ZS5pID09PSBTdGFydClcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgdG9CZVJlbW92ZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBpKTtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAgICAgICAodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gIXRvQmVSZW1vdmVkLmVxdWFsKHZhbHVlKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBsYW4uY2hhcnQuRWRnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZShTdGFydCwgRmluaXNoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRUYXNrTmFtZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHRhc2tJbmRleDogbnVtYmVyLCBuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy50YXNrSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBjb25zdCBvbGROYW1lID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF0ubmFtZTtcbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5uYW1lID0gdGhpcy5uYW1lO1xuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZE5hbWUpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZShvbGROYW1lOiBzdHJpbmcpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRUYXNrTmFtZVN1Yk9wKHRoaXMudGFza0luZGV4LCBvbGROYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gSW5zZXJ0TmV3RW1wdHlNaWxlc3RvbmVBZnRlck9wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IEFkZFRhc2tBZnRlclN1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCgwLCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKHRhc2tJbmRleCArIDEsIC0xKSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0VGFza05hbWVPcCh0YXNrSW5kZXg6IG51bWJlciwgbmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0VGFza05hbWVTdWJPcCh0YXNrSW5kZXgsIG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTcGxpdFRhc2tPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgY29uc3Qgc3ViT3BzOiBTdWJPcFtdID0gW1xuICAgIG5ldyBEdXBUYXNrU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKHRhc2tJbmRleCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgXTtcblxuICByZXR1cm4gbmV3IE9wKHN1Yk9wcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEdXBUYXNrT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIGNvbnN0IHN1Yk9wczogU3ViT3BbXSA9IFtcbiAgICBuZXcgRHVwVGFza1N1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IENvcHlBbGxFZGdlc0Zyb21Ub1N1Yk9wKHRhc2tJbmRleCwgdGFza0luZGV4ICsgMSksXG4gIF07XG5cbiAgcmV0dXJuIG5ldyBPcChzdWJPcHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlVGFza09wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IERlbGV0ZVRhc2tTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRFZGdlT3AoZnJvbVRhc2tJbmRleDogbnVtYmVyLCB0b1Rhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcChmcm9tVGFza0luZGV4LCB0b1Rhc2tJbmRleCksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJhdGlvbmFsaXplRWRnZXNPcCgpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVtb3ZlRWRnZU9wKGk6IG51bWJlciwgajogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IFJlbW92ZUVkZ2VTdXBPcChpLCBqKSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICAgIG5ldyBBZGRUYXNrQWZ0ZXJTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBTZXRNZXRyaWNWYWx1ZVN1Yk9wKFwiRHVyYXRpb25cIiwgMTAsIHRhc2tJbmRleCArIDEpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AoMCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCh0YXNrSW5kZXggKyAxLCAtMSksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cbiIsICJpbXBvcnQgeyBBZGREZXBlbmRlbmN5RGlhbG9nIH0gZnJvbSBcIi4uLy4uL2FkZC1kZXBlbmRlbmN5LWRpYWxvZy9hZGQtZGVwZW5kZW5jeS1kaWFsb2dcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBBZGRFZGdlT3AgfSBmcm9tIFwiLi4vLi4vb3BzL2NoYXJ0XCI7XG5pbXBvcnQgeyBlcnJvciwgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgQWN0aW9uRnJvbU9wLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgQWRkUHJlZGVjZXNzb3JBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID1cbiAgICBcIlByb21wdHMgZm9yIGFuZCBhZGRzIGEgcHJlZGVjZXNzb3IgdG8gdGhlIGN1cnJlbnQgVGFzay5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuICB1bmRvOiBib29sZWFuID0gdHJ1ZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGlmIChleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoXCJBIFRhc2sgbXVzdCBiZSBzZWxlY3RlZC5cIikpO1xuICAgIH1cbiAgICBjb25zdCBwcmVkVGFza0luZGV4ID0gYXdhaXQgZXhwbGFuTWFpblxuICAgICAgLnF1ZXJ5U2VsZWN0b3I8QWRkRGVwZW5kZW5jeURpYWxvZz4oXCJhZGQtZGVwZW5kZW5jeS1kaWFsb2dcIikhXG4gICAgICAuc2VsZWN0RGVwZW5kZW5jeShleHBsYW5NYWluLnBsYW4uY2hhcnQsIGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrLCBcInByZWRcIik7XG4gICAgaWYgKHByZWRUYXNrSW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIk5vIHByZWRlY2Vzc29yIHdhcyBzZWxlY3RlZC5cIikpO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBBZGRFZGdlT3AocHJlZFRhc2tJbmRleCwgZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2spLmFwcGx5VG8oXG4gICAgICBleHBsYW5NYWluLnBsYW5cbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKFxuICAgICAgICByZXQudmFsdWUuaW52ZXJzZSxcbiAgICAgICAgKHRoaXMucG9zdEFjdGlvbldvcmsgPSB0aGlzLnBvc3RBY3Rpb25Xb3JrKSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBZGREZXBlbmRlbmN5RGlhbG9nIH0gZnJvbSBcIi4uLy4uL2FkZC1kZXBlbmRlbmN5LWRpYWxvZy9hZGQtZGVwZW5kZW5jeS1kaWFsb2dcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBBZGRFZGdlT3AgfSBmcm9tIFwiLi4vLi4vb3BzL2NoYXJ0XCI7XG5pbXBvcnQgeyBlcnJvciwgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgQWN0aW9uRnJvbU9wLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgQWRkU3VjY2Vzc29yQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiUHJvbXB0cyBmb3IgYW5kIGFkZHMgYSBzdWNjZXNzb3IgdG8gdGhlIGN1cnJlbnQgVGFzay5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuICB1bmRvOiBib29sZWFuID0gdHJ1ZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGlmIChleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoXCJBIFRhc2sgbXVzdCBiZSBzZWxlY3RlZC5cIikpO1xuICAgIH1cbiAgICBjb25zdCBzdWNjVGFza0luZGV4ID0gYXdhaXQgZXhwbGFuTWFpblxuICAgICAgLnF1ZXJ5U2VsZWN0b3I8QWRkRGVwZW5kZW5jeURpYWxvZz4oXCJhZGQtZGVwZW5kZW5jeS1kaWFsb2dcIikhXG4gICAgICAuc2VsZWN0RGVwZW5kZW5jeShleHBsYW5NYWluLnBsYW4uY2hhcnQsIGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrLCBcInN1Y2NcIik7XG4gICAgaWYgKHN1Y2NUYXNrSW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIk5vIHN1Y2Nlc3NvciB3YXMgc2VsZWN0ZWQuXCIpKTtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gQWRkRWRnZU9wKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrLCBzdWNjVGFza0luZGV4KS5hcHBseVRvKFxuICAgICAgZXhwbGFuTWFpbi5wbGFuXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0dXJuIG9rKFxuICAgICAgbmV3IEFjdGlvbkZyb21PcChcbiAgICAgICAgcmV0LnZhbHVlLmludmVyc2UsXG4gICAgICAgICh0aGlzLnBvc3RBY3Rpb25Xb3JrID0gdGhpcy5wb3N0QWN0aW9uV29yayksXG4gICAgICAgIHRydWVcbiAgICAgIClcbiAgICApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBTZWFyY2hUYXNrUGFuZWwgfSBmcm9tIFwiLi4vLi4vc2VhcmNoL3NlYXJjaC10YXNrLXBhbmVsXCI7XG5pbXBvcnQgeyBBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBHb1RvU2VhcmNoQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiTW92ZXMgZm9jdXMgdG8gc2VhcmNoIGNvbnRyb2wuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGFzeW5jIGRvKF9leHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcjxTZWFyY2hUYXNrUGFuZWw+KFwic2VhcmNoLXRhc2stcGFuZWxcIikhXG4gICAgICAuc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoXCJuYW1lLW9ubHlcIik7XG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHb1RvRnVsbFNlYXJjaEFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPVxuICAgIFwiTW92ZXMgZm9jdXMgdG8gc2VhcmNoIGNvbnRyb2wgYW5kIGRvZXMgYSBmdWxsIHNlYXJjaCBvZiBhbGwgcmVzb3VyY2UgdmFsdWVzLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhfZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3I8U2VhcmNoVGFza1BhbmVsPihcInNlYXJjaC10YXNrLXBhbmVsXCIpIVxuICAgICAgLnNldEtleWJvYXJkRm9jdXNUb0lucHV0KFwiZnVsbC1pbmZvXCIpO1xuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgSGVscEFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkRpc3BsYXlzIHRoZSBoZWxwIGRpYWxvZy5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBleHBsYW5NYWluXG4gICAgICAucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJrZXlib2FyZC1tYXAtZGlhbG9nXCIpIVxuICAgICAgLnNob3dNb2RhbCgpO1xuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgUmVzZXRab29tQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiVW5kb2VzIHRoZSB6b29tLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGFpbnRDaGFydFwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBleHBsYW5NYWluLmRpc3BsYXlSYW5nZSA9IG51bGw7XG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7XG4gIERlbGV0ZVRhc2tPcCxcbiAgRHVwVGFza09wLFxuICBJbnNlcnROZXdFbXB0eU1pbGVzdG9uZUFmdGVyT3AsXG4gIEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AsXG4gIFNwbGl0VGFza09wLFxufSBmcm9tIFwiLi4vLi4vb3BzL2NoYXJ0XCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wIH0gZnJvbSBcIi4uLy4uL29wcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBTZXRUYXNrQ29tcGxldGlvbk9wIH0gZnJvbSBcIi4uLy4uL29wcy9wbGFuXCI7XG5pbXBvcnQgeyBlcnJvciwgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgQWN0aW9uRnJvbU9wLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgU3BsaXRUYXNrQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiU3BsaXRzIGEgdGFzay5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuICB1bmRvOiBib29sZWFuID0gdHJ1ZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGlmIChleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoXCJBIHRhc2sgbXVzdCBiZSBzZWxlY3RlZCBmaXJzdC5cIikpO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBTcGxpdFRhc2tPcChleHBsYW5NYWluLnNlbGVjdGVkVGFzaykuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRHVwVGFza0FjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkR1cGxpY2F0ZXMgYSB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgdGFzayBtdXN0IGJlIHNlbGVjdGVkIGZpcnN0LlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IER1cFRhc2tPcChleHBsYW5NYWluLnNlbGVjdGVkVGFzaykuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTmV3VGFza0FjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkNyZWF0ZXMgYSBuZXcgdGFzay5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuICB1bmRvOiBib29sZWFuID0gdHJ1ZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGxldCByZXQgPSBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wKDApLmFwcGx5VG8oZXhwbGFuTWFpbi5wbGFuKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0dXJuIG9rKFxuICAgICAgbmV3IEFjdGlvbkZyb21PcChyZXQudmFsdWUuaW52ZXJzZSwgdGhpcy5wb3N0QWN0aW9uV29yaywgdGhpcy51bmRvKVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVRhc2tBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJEZWxldGVzIGEgdGFzay5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuICB1bmRvOiBib29sZWFuID0gdHJ1ZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGlmIChleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoXCJBIHRhc2sgbXVzdCBiZSBzZWxlY3RlZCBmaXJzdC5cIikpO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBEZWxldGVUYXNrT3AoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2spLmFwcGx5VG8oZXhwbGFuTWFpbi5wbGFuKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2sgPSAtMTtcbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuIiwgImNvbnN0IGRhcmtNb2RlTG9jYWxTdG9yYWdlS2V5ID0gXCJleHBsYW4tZGFya21vZGVcIjtcblxuLyoqIFdoZW4gdGhlIGdpdmVuIGVsZW1lbnQgaXMgY2xpY2tlZCwgdGhlbiB0b2dnbGUgdGhlIGBkYXJrbW9kZWAgY2xhc3Mgb24gdGhlXG4gKiBib2R5IGVsZW1lbnQuICovXG5leHBvcnQgY29uc3QgdG9nZ2xlVGhlbWUgPSAoKSA9PiB7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcbiAgICBkYXJrTW9kZUxvY2FsU3RvcmFnZUtleSxcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoXCJkYXJrbW9kZVwiKSA/IFwiMVwiIDogXCIwXCJcbiAgKTtcbn07XG5cbmV4cG9ydCBjb25zdCBhcHBseVN0b3JlZFRoZW1lID0gKCkgPT4ge1xuICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoXG4gICAgXCJkYXJrbW9kZVwiLFxuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShkYXJrTW9kZUxvY2FsU3RvcmFnZUtleSkgPT09IFwiMVwiXG4gICk7XG59O1xuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgdG9nZ2xlVGhlbWUgfSBmcm9tIFwiLi4vLi4vc3R5bGUvdG9nZ2xlci90b2dnbGVyXCI7XG5pbXBvcnQgeyBBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBUb2dnbGVEYXJrTW9kZUFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIlRvZ2dsZXMgZGFyayBtb2RlLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGFpbnRDaGFydFwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIHRvZ2dsZVRoZW1lKCk7XG4gICAgLy8gVG9nZ2xlRGFya01vZGVBY3Rpb24gaXMgaXRzIG93biBpbnZlcnNlLlxuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgVG9nZ2xlRm9jdXNBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJUb2dnbGVzIHRoZSBmb2N1cyB2aWV3LlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGFpbnRDaGFydFwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBleHBsYW5NYWluLnRvZ2dsZUZvY3VzT25UYXNrKCk7XG4gICAgLy8gVG9nZ2xlRm9jdXNBY3Rpb24gaXMgaXRzIG93biBpbnZlcnNlLlxuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgdG9nZ2xlVGhlbWUgfSBmcm9tIFwiLi4vLi4vc3R5bGUvdG9nZ2xlci90b2dnbGVyXCI7XG5pbXBvcnQgeyBBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBUb2dnbGVSYWRhckFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIlRvZ2dsZXMgdGhlIHJhZGFyIHZpZXcuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgZXhwbGFuTWFpbi50b2dnbGVSYWRhcigpO1xuICAgIC8vIFRvZ2dsZVJhZGFyQWN0aW9uIGlzIGl0cyBvd24gaW52ZXJzZS5cbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgTk9PUEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcbmltcG9ydCB7IHVuZG8gfSBmcm9tIFwiLi4vZXhlY3V0ZVwiO1xuXG5leHBvcnQgY2xhc3MgVW5kb0FjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIlVuZG9lcyB0aGUgbGFzdCBhY3Rpb24uXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgY29uc3QgcmV0ID0gdW5kbyhleHBsYW5NYWluKTtcblxuICAgIC8vIFVuZG8gaXMgbm90IGEgcmV2ZXJzaWJsZSBhY3Rpb24uXG4gICAgcmV0dXJuIG9rKG5ldyBOT09QQWN0aW9uKCkpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9uLnRzXCI7XG5pbXBvcnQgeyBBZGRQcmVkZWNlc3NvckFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvYWRkUHJlZGVjZXNzb3IudHNcIjtcbmltcG9ydCB7IEFkZFN1Y2Nlc3NvckFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvYWRkU3VjY2Vzc29yLnRzXCI7XG5pbXBvcnQge1xuICBHb1RvRnVsbFNlYXJjaEFjdGlvbixcbiAgR29Ub1NlYXJjaEFjdGlvbixcbn0gZnJvbSBcIi4vYWN0aW9ucy9nb3RvU2VhcmNoLnRzXCI7XG5pbXBvcnQgeyBIZWxwQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy9oZWxwLnRzXCI7XG5pbXBvcnQgeyBSZXNldFpvb21BY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3Jlc2V0Wm9vbS50c1wiO1xuaW1wb3J0IHtcbiAgRGVsZXRlVGFza0FjdGlvbixcbiAgRHVwVGFza0FjdGlvbixcbiAgTmV3VGFza0FjdGlvbixcbiAgU3BsaXRUYXNrQWN0aW9uLFxufSBmcm9tIFwiLi9hY3Rpb25zL3Rhc2tzLnRzXCI7XG5pbXBvcnQgeyBUb2dnbGVEYXJrTW9kZUFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvdG9nZ2xlRGFya01vZGUudHNcIjtcbmltcG9ydCB7IFRvZ2dsZUZvY3VzQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy90b2dnbGVGb2N1cy50c1wiO1xuaW1wb3J0IHsgVG9nZ2xlUmFkYXJBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3RvZ2dsZVJhZGFyLnRzXCI7XG5pbXBvcnQgeyBVbmRvQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy91bmRvLnRzXCI7XG5cbmV4cG9ydCB0eXBlIEFjdGlvbk5hbWVzID1cbiAgfCBcIlRvZ2dsZURhcmtNb2RlQWN0aW9uXCJcbiAgfCBcIlRvZ2dsZVJhZGFyQWN0aW9uXCJcbiAgfCBcIlJlc2V0Wm9vbUFjdGlvblwiXG4gIHwgXCJVbmRvQWN0aW9uXCJcbiAgfCBcIkhlbHBBY3Rpb25cIlxuICB8IFwiU3BsaXRUYXNrQWN0aW9uXCJcbiAgfCBcIkR1cFRhc2tBY3Rpb25cIlxuICB8IFwiTmV3VGFza0FjdGlvblwiXG4gIHwgXCJEZWxldGVUYXNrQWN0aW9uXCJcbiAgfCBcIkdvVG9TZWFyY2hBY3Rpb25cIlxuICB8IFwiR29Ub0Z1bGxTZWFyY2hBY3Rpb25cIlxuICB8IFwiQWRkUHJlZGVjZXNzb3JBY3Rpb25cIlxuICB8IFwiQWRkU3VjY2Vzc29yQWN0aW9uXCJcbiAgfCBcIlRvZ2dsZUZvY3VzQWN0aW9uXCI7XG5cbmV4cG9ydCBjb25zdCBBY3Rpb25SZWdpc3RyeTogUmVjb3JkPEFjdGlvbk5hbWVzLCBBY3Rpb24+ID0ge1xuICBUb2dnbGVEYXJrTW9kZUFjdGlvbjogbmV3IFRvZ2dsZURhcmtNb2RlQWN0aW9uKCksXG4gIFRvZ2dsZVJhZGFyQWN0aW9uOiBuZXcgVG9nZ2xlUmFkYXJBY3Rpb24oKSxcbiAgUmVzZXRab29tQWN0aW9uOiBuZXcgUmVzZXRab29tQWN0aW9uKCksXG4gIFVuZG9BY3Rpb246IG5ldyBVbmRvQWN0aW9uKCksXG4gIEhlbHBBY3Rpb246IG5ldyBIZWxwQWN0aW9uKCksXG4gIFNwbGl0VGFza0FjdGlvbjogbmV3IFNwbGl0VGFza0FjdGlvbigpLFxuICBEdXBUYXNrQWN0aW9uOiBuZXcgRHVwVGFza0FjdGlvbigpLFxuICBOZXdUYXNrQWN0aW9uOiBuZXcgTmV3VGFza0FjdGlvbigpLFxuICBEZWxldGVUYXNrQWN0aW9uOiBuZXcgRGVsZXRlVGFza0FjdGlvbigpLFxuICBHb1RvU2VhcmNoQWN0aW9uOiBuZXcgR29Ub1NlYXJjaEFjdGlvbigpLFxuICBHb1RvRnVsbFNlYXJjaEFjdGlvbjogbmV3IEdvVG9GdWxsU2VhcmNoQWN0aW9uKCksXG4gIEFkZFByZWRlY2Vzc29yQWN0aW9uOiBuZXcgQWRkUHJlZGVjZXNzb3JBY3Rpb24oKSxcbiAgQWRkU3VjY2Vzc29yQWN0aW9uOiBuZXcgQWRkU3VjY2Vzc29yQWN0aW9uKCksXG4gIFRvZ2dsZUZvY3VzQWN0aW9uOiBuZXcgVG9nZ2xlRm9jdXNBY3Rpb24oKSxcbn07XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi9leHBsYW5NYWluL2V4cGxhbk1haW4udHNcIjtcbmltcG9ydCB7IE9wIH0gZnJvbSBcIi4uL29wcy9vcHMudHNcIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBBY3Rpb24sIEFjdGlvbkZyb21PcCwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuL2FjdGlvbi50c1wiO1xuaW1wb3J0IHsgQWN0aW9uTmFtZXMsIEFjdGlvblJlZ2lzdHJ5IH0gZnJvbSBcIi4vcmVnaXN0cnkudHNcIjtcblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwIHtcbiAgICBcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCI6IEN1c3RvbUV2ZW50PG51bGw+O1xuICB9XG59XG5cbmNvbnN0IHVuZG9TdGFjazogQWN0aW9uW10gPSBbXTtcblxuZXhwb3J0IGNvbnN0IHVuZG8gPSBhc3luYyAoZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PG51bGw+PiA9PiB7XG4gIGNvbnN0IGFjdGlvbiA9IHVuZG9TdGFjay5wb3AoKSE7XG4gIGlmICghYWN0aW9uKSB7XG4gICAgcmV0dXJuIG9rKG51bGwpO1xuICB9XG5cbiAgcmV0dXJuIGF3YWl0IGV4ZWN1dGVVbmRvKGFjdGlvbiwgZXhwbGFuTWFpbik7XG59O1xuXG5leHBvcnQgY29uc3QgZXhlY3V0ZSA9IGFzeW5jIChcbiAgbmFtZTogQWN0aW9uTmFtZXMsXG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW5cbik6IFByb21pc2U8UmVzdWx0PG51bGw+PiA9PiB7XG4gIGNvbnN0IGFjdGlvbiA9IEFjdGlvblJlZ2lzdHJ5W25hbWVdO1xuICBjb25zdCByZXQgPSBhd2FpdCBhY3Rpb24uZG8oZXhwbGFuTWFpbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuICBzd2l0Y2ggKGFjdGlvbi5wb3N0QWN0aW9uV29yaykge1xuICAgIGNhc2UgXCJcIjpcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJwYWludENoYXJ0XCI6XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiOlxuICAgICAgZXhwbGFuTWFpbi5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIC8vIFNlbmQgYW4gZXZlbnQgaW4gY2FzZSB3ZSBoYXZlIGFueSBkaWFsb2dzIHVwIHRoYXQgbmVlZCB0byByZS1yZW5kZXIgaWZcbiAgICAgIC8vIHRoZSBwbGFuIGNoYW5nZWQsIHBvc3NpYmxlIHNpbmNlIEN0cmwtWiB3b3JrcyBmcm9tIGFueXdoZXJlLlxuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiKSk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgYnJlYWs7XG4gIH1cbiAgaWYgKGFjdGlvbi51bmRvKSB7XG4gICAgdW5kb1N0YWNrLnB1c2gocmV0LnZhbHVlKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59O1xuXG5leHBvcnQgY29uc3QgZXhlY3V0ZU9wID0gYXN5bmMgKFxuICBvcDogT3AsXG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrLFxuICB1bmRvOiBib29sZWFuLFxuICBleHBsYW5NYWluOiBFeHBsYW5NYWluXG4pOiBQcm9taXNlPFJlc3VsdDxudWxsPj4gPT4ge1xuICBjb25zdCBhY3Rpb24gPSBuZXcgQWN0aW9uRnJvbU9wKG9wLCBwb3N0QWN0aW9uV29yaywgdW5kbyk7XG4gIGNvbnN0IHJldCA9IGF3YWl0IGFjdGlvbi5kbyhleHBsYW5NYWluKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIHN3aXRjaCAoYWN0aW9uLnBvc3RBY3Rpb25Xb3JrKSB7XG4gICAgY2FzZSBcIlwiOlxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFwicGFpbnRDaGFydFwiOlxuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICAvLyBTZW5kIGFuIGV2ZW50IGluIGNhc2Ugd2UgaGF2ZSBhbnkgZGlhbG9ncyB1cCB0aGF0IG5lZWQgdG8gcmUtcmVuZGVyIGlmXG4gICAgICAvLyB0aGUgcGxhbiBjaGFuZ2VkLCBwb3NzaWJsZSBzaW5jZSBDdHJsLVogd29ya3MgZnJvbSBhbnl3aGVyZS5cbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KFwicGxhbi1kZWZpbml0aW9uLWNoYW5nZWRcIikpO1xuXG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuICBpZiAoYWN0aW9uLnVuZG8pIHtcbiAgICB1bmRvU3RhY2sucHVzaChyZXQudmFsdWUpO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn07XG5cbmNvbnN0IGV4ZWN1dGVVbmRvID0gYXN5bmMgKFxuICBhY3Rpb246IEFjdGlvbixcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpblxuKTogUHJvbWlzZTxSZXN1bHQ8bnVsbD4+ID0+IHtcbiAgY29uc3QgcmV0ID0gYXdhaXQgYWN0aW9uLmRvKGV4cGxhbk1haW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgc3dpdGNoIChhY3Rpb24ucG9zdEFjdGlvbldvcmspIHtcbiAgICBjYXNlIFwiXCI6XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwYWludENoYXJ0XCI6XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiOlxuICAgICAgZXhwbGFuTWFpbi5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIC8vIFNlbmQgYW4gZXZlbnQgaW4gY2FzZSB3ZSBoYXZlIGFueSBkaWFsb2dzIHVwIHRoYXQgbmVlZCB0byByZS1yZW5kZXIgaWZcbiAgICAgIC8vIHRoZSBwbGFuIGNoYW5nZWQsIHBvc3NpYmxlIHNpbmNlIEN0cmwtWiB3b3JrcyBmcm9tIGFueXdoZXJlLlxuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiKSk7XG5cbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn07XG4iLCAiaW1wb3J0IHsgZXhlY3V0ZSB9IGZyb20gXCIuLi9hY3Rpb24vZXhlY3V0ZVwiO1xuaW1wb3J0IHsgQWN0aW9uTmFtZXMgfSBmcm9tIFwiLi4vYWN0aW9uL3JlZ2lzdHJ5XCI7XG5pbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuXG5leHBvcnQgY29uc3QgS2V5TWFwOiBNYXA8c3RyaW5nLCBBY3Rpb25OYW1lcz4gPSBuZXcgTWFwKFtcbiAgW1wic2hpZnQtY3RybC1SXCIsIFwiVG9nZ2xlUmFkYXJBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtTVwiLCBcIlRvZ2dsZURhcmtNb2RlQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLVpcIiwgXCJSZXNldFpvb21BY3Rpb25cIl0sXG4gIFtcImN0cmwtelwiLCBcIlVuZG9BY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtSFwiLCBcIkhlbHBBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtfFwiLCBcIlNwbGl0VGFza0FjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC1fXCIsIFwiRHVwVGFza0FjdGlvblwiXSxcbiAgW1wiYWx0LUluc2VydFwiLCBcIk5ld1Rhc2tBY3Rpb25cIl0sXG4gIFtcImFsdC1EZWxldGVcIiwgXCJEZWxldGVUYXNrQWN0aW9uXCJdLFxuICBbXCJjdHJsLWZcIiwgXCJHb1RvU2VhcmNoQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLUZcIiwgXCJHb1RvRnVsbFNlYXJjaEFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC08XCIsIFwiQWRkUHJlZGVjZXNzb3JBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtPlwiLCBcIkFkZFN1Y2Nlc3NvckFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC06XCIsIFwiVG9nZ2xlRm9jdXNBY3Rpb25cIl0sXG5dKTtcblxubGV0IGV4cGxhbk1haW46IEV4cGxhbk1haW47XG5cbmV4cG9ydCBjb25zdCBTdGFydEtleWJvYXJkSGFuZGxpbmcgPSAoZW06IEV4cGxhbk1haW4pID0+IHtcbiAgZXhwbGFuTWFpbiA9IGVtO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBvbktleURvd24pO1xufTtcblxuY29uc3Qgb25LZXlEb3duID0gYXN5bmMgKGU6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgY29uc3Qga2V5bmFtZSA9IGAke2Uuc2hpZnRLZXkgPyBcInNoaWZ0LVwiIDogXCJcIn0ke2UuY3RybEtleSA/IFwiY3RybC1cIiA6IFwiXCJ9JHtlLm1ldGFLZXkgPyBcIm1ldGEtXCIgOiBcIlwifSR7ZS5hbHRLZXkgPyBcImFsdC1cIiA6IFwiXCJ9JHtlLmtleX1gO1xuICBjb25zb2xlLmxvZyhrZXluYW1lKTtcbiAgY29uc3QgYWN0aW9uTmFtZSA9IEtleU1hcC5nZXQoa2V5bmFtZSk7XG4gIGlmIChhY3Rpb25OYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zdCByZXQgPSBhd2FpdCBleGVjdXRlKGFjdGlvbk5hbWUsIGV4cGxhbk1haW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIGNvbnNvbGUubG9nKHJldC5lcnJvcik7XG4gIH1cbn07XG4iLCAiaW1wb3J0IHsgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQgeyBLZXlNYXAgfSBmcm9tIFwiLi4va2V5bWFwL2tleW1hcC50c1wiO1xuaW1wb3J0IHsgQWN0aW9uUmVnaXN0cnkgfSBmcm9tIFwiLi4vYWN0aW9uL3JlZ2lzdHJ5XCI7XG5cbmNsYXNzIEtleWJvYXJkTWFwRGlhbG9nIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBjb25zdCBrZXltYXBFbnRyaWVzID0gWy4uLktleU1hcC5lbnRyaWVzKCldO1xuICAgIGtleW1hcEVudHJpZXMuc29ydCgpO1xuICAgIHJlbmRlcihcbiAgICAgIGh0bWxgXG4gICAgICAgIDxkaWFsb2c+XG4gICAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICAgJHtrZXltYXBFbnRyaWVzLm1hcChcbiAgICAgICAgICAgICAgKFtrZXksIGFjdGlvbk5hbWVdKSA9PlxuICAgICAgICAgICAgICAgIGh0bWxgPHRyPlxuICAgICAgICAgICAgICAgICAgPHRkPiR7a2V5fTwvdGQ+XG4gICAgICAgICAgICAgICAgICA8dGQ+JHtBY3Rpb25SZWdpc3RyeVthY3Rpb25OYW1lXS5kZXNjcmlwdGlvbn08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+YFxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8L2RpYWxvZz5cbiAgICAgIGAsXG4gICAgICB0aGlzXG4gICAgKTtcbiAgfVxuXG4gIHNob3dNb2RhbCgpIHtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5zaG93TW9kYWwoKTtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJrZXlib2FyZC1tYXAtZGlhbG9nXCIsIEtleWJvYXJkTWFwRGlhbG9nKTtcbiIsICIvLyBDb252ZXJ0cyBhIERhdGUgaW50byBhIGZvcm0gdG8gZmVlZCB0byBhbiBIVE1MRGF0ZUlucHV0LlxuZXhwb3J0IGNvbnN0IGRhdGVDb250cm9sVmFsdWUgPSAoZDogRGF0ZSk6IHN0cmluZyA9PlxuICBgJHtkLmdldEZ1bGxZZWFyKCl9LSR7KFwiXCIgKyAoZC5nZXRNb250aCgpICsgMSkpLnBhZFN0YXJ0KDIsIFwiMFwiKX0tJHsoXCJcIiArIGQuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCBcIjBcIil9YDtcblxuZXhwb3J0IGNvbnN0IGRhdGVDb250cm9sRGF0ZVJlID0gL1xcZHs0fS1cXGR7Mn0tXFxkezJ9LztcbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgVW5pdEJhc2UgfSBmcm9tIFwiLi4vdW5pdHMvdW5pdC50c1wiO1xuaW1wb3J0IHsgZGF0ZUNvbnRyb2xWYWx1ZSB9IGZyb20gXCIuLi9kYXRlLWNvbnRyb2wtdXRpbHMvZGF0ZS1jb250cm9sLXV0aWxzLnRzXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJkYXRlLXBpY2tlci1pbnB1dFwiOiBDdXN0b21FdmVudDxudW1iZXI+O1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF0ZVBpY2tlclZhbHVlIHtcbiAgdW5pdDogVW5pdEJhc2U7XG4gIGRhdGVPZmZzZXQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIERhdGVQaWNrZXIgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIF92YWx1ZTogRGF0ZVBpY2tlclZhbHVlIHwgbnVsbCA9IG51bGw7XG5cbiAgcHVibGljIHNldCB2YWx1ZSh2OiBEYXRlUGlja2VyVmFsdWUpIHtcbiAgICB0aGlzLl92YWx1ZSA9IHY7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyKCkge1xuICAgIHJlbmRlcih0aGlzLnRlbXBsYXRlKCksIHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSB0ZW1wbGF0ZSgpOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgaWYgKHRoaXMuX3ZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gaHRtbGBgO1xuICAgIH1cbiAgICBjb25zdCBraW5kID0gdGhpcy5fdmFsdWUudW5pdC5raW5kKCk7XG4gICAgaWYgKGtpbmQgPT09IFwiVW5pdGxlc3NcIikge1xuICAgICAgcmV0dXJuIGh0bWxgIDxpbnB1dFxuICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgIC52YWx1ZT0ke3RoaXMuX3ZhbHVlLmRhdGVPZmZzZXR9XG4gICAgICAgIEBpbnB1dD0keyhlOiBJbnB1dEV2ZW50KSA9PiB0aGlzLmlucHV0Q2hhbmdlZChlKX1cbiAgICAgIC8+YDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGh0bWxgXG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIHR5cGU9XCJkYXRlXCJcbiAgICAgICAgICAudmFsdWU9JHtkYXRlQ29udHJvbFZhbHVlKFxuICAgICAgICAgICAgdGhpcy5fdmFsdWUudW5pdC5hc0RhdGUodGhpcy5fdmFsdWUuZGF0ZU9mZnNldClcbiAgICAgICAgICApfVxuICAgICAgICAgIEBpbnB1dD0keyhlOiBJbnB1dEV2ZW50KSA9PiB0aGlzLmlucHV0Q2hhbmdlZChlKX1cbiAgICAgICAgLz5cbiAgICAgIGA7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbnB1dENoYW5nZWQoZTogSW5wdXRFdmVudCkge1xuICAgIGNvbnN0IHJldCA9IHRoaXMuX3ZhbHVlIS51bml0LnBhcnNlKChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIGNvbnNvbGUubG9nKHJldC5lcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50PG51bWJlcj4oXCJkYXRlLXBpY2tlci1pbnB1dFwiLCB7XG4gICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICBkZXRhaWw6IHJldC52YWx1ZSxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImRhdGUtcGlja2VyXCIsIERhdGVQaWNrZXIpO1xuIiwgImltcG9ydCB7XG4gIFZlcnRleCxcbiAgVmVydGV4SW5kaWNlcyxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeVNyY1RvTWFwLFxufSBmcm9tIFwiLi4vZGFnLnRzXCI7XG5cbi8qKlxuVGhlIHJldHVybiB0eXBlIGZvciB0aGUgVG9wbG9naWNhbFNvcnQgZnVuY3Rpb24uIFxuICovXG50eXBlIFRTUmV0dXJuID0ge1xuICBoYXNDeWNsZXM6IGJvb2xlYW47XG5cbiAgY3ljbGU6IFZlcnRleEluZGljZXM7XG5cbiAgb3JkZXI6IFZlcnRleEluZGljZXM7XG59O1xuXG4vKipcblJldHVybnMgYSB0b3BvbG9naWNhbCBzb3J0IG9yZGVyIGZvciBhIERpcmVjdGVkR3JhcGgsIG9yIHRoZSBtZW1iZXJzIG9mIGEgY3ljbGUgaWYgYVxudG9wb2xvZ2ljYWwgc29ydCBjYW4ndCBiZSBkb25lLlxuIFxuIFRoZSB0b3BvbG9naWNhbCBzb3J0IGNvbWVzIGZyb206XG5cbiAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ub3BvbG9naWNhbF9zb3J0aW5nI0RlcHRoLWZpcnN0X3NlYXJjaFxuXG5MIFx1MjE5MCBFbXB0eSBsaXN0IHRoYXQgd2lsbCBjb250YWluIHRoZSBzb3J0ZWQgbm9kZXNcbndoaWxlIGV4aXN0cyBub2RlcyB3aXRob3V0IGEgcGVybWFuZW50IG1hcmsgZG9cbiAgICBzZWxlY3QgYW4gdW5tYXJrZWQgbm9kZSBuXG4gICAgdmlzaXQobilcblxuZnVuY3Rpb24gdmlzaXQobm9kZSBuKVxuICAgIGlmIG4gaGFzIGEgcGVybWFuZW50IG1hcmsgdGhlblxuICAgICAgICByZXR1cm5cbiAgICBpZiBuIGhhcyBhIHRlbXBvcmFyeSBtYXJrIHRoZW5cbiAgICAgICAgc3RvcCAgIChncmFwaCBoYXMgYXQgbGVhc3Qgb25lIGN5Y2xlKVxuXG4gICAgbWFyayBuIHdpdGggYSB0ZW1wb3JhcnkgbWFya1xuXG4gICAgZm9yIGVhY2ggbm9kZSBtIHdpdGggYW4gZWRnZSBmcm9tIG4gdG8gbSBkb1xuICAgICAgICB2aXNpdChtKVxuXG4gICAgcmVtb3ZlIHRlbXBvcmFyeSBtYXJrIGZyb20gblxuICAgIG1hcmsgbiB3aXRoIGEgcGVybWFuZW50IG1hcmtcbiAgICBhZGQgbiB0byBoZWFkIG9mIExcblxuICovXG5leHBvcnQgY29uc3QgdG9wb2xvZ2ljYWxTb3J0ID0gKGc6IERpcmVjdGVkR3JhcGgpOiBUU1JldHVybiA9PiB7XG4gIGNvbnN0IHJldDogVFNSZXR1cm4gPSB7XG4gICAgaGFzQ3ljbGVzOiBmYWxzZSxcbiAgICBjeWNsZTogW10sXG4gICAgb3JkZXI6IFtdLFxuICB9O1xuXG4gIGNvbnN0IGVkZ2VNYXAgPSBlZGdlc0J5U3JjVG9NYXAoZy5FZGdlcyk7XG5cbiAgY29uc3Qgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyayA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICBnLlZlcnRpY2VzLmZvckVhY2goKF86IFZlcnRleCwgaW5kZXg6IG51bWJlcikgPT5cbiAgICBub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrLmFkZChpbmRleClcbiAgKTtcblxuICBjb25zdCBoYXNQZXJtYW5lbnRNYXJrID0gKGluZGV4OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gIW5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuaGFzKGluZGV4KTtcbiAgfTtcblxuICBjb25zdCB0ZW1wb3JhcnlNYXJrID0gbmV3IFNldDxudW1iZXI+KCk7XG5cbiAgY29uc3QgdmlzaXQgPSAoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgIGlmIChoYXNQZXJtYW5lbnRNYXJrKGluZGV4KSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICh0ZW1wb3JhcnlNYXJrLmhhcyhpbmRleCkpIHtcbiAgICAgIC8vIFdlIG9ubHkgcmV0dXJuIGZhbHNlIG9uIGZpbmRpbmcgYSBsb29wLCB3aGljaCBpcyBzdG9yZWQgaW5cbiAgICAgIC8vIHRlbXBvcmFyeU1hcmsuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRlbXBvcmFyeU1hcmsuYWRkKGluZGV4KTtcblxuICAgIGNvbnN0IG5leHRFZGdlcyA9IGVkZ2VNYXAuZ2V0KGluZGV4KTtcbiAgICBpZiAobmV4dEVkZ2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV4dEVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGUgPSBuZXh0RWRnZXNbaV07XG4gICAgICAgIGlmICghdmlzaXQoZS5qKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRlbXBvcmFyeU1hcmsuZGVsZXRlKGluZGV4KTtcbiAgICBub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrLmRlbGV0ZShpbmRleCk7XG4gICAgcmV0Lm9yZGVyLnVuc2hpZnQoaW5kZXgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIFdlIHdpbGwgcHJlc3VtZSB0aGF0IFZlcnRleFswXSBpcyB0aGUgc3RhcnQgbm9kZSBhbmQgdGhhdCB3ZSBzaG91bGQgc3RhcnQgdGhlcmUuXG4gIGNvbnN0IG9rID0gdmlzaXQoMCk7XG4gIGlmICghb2spIHtcbiAgICByZXQuaGFzQ3ljbGVzID0gdHJ1ZTtcbiAgICByZXQuY3ljbGUgPSBbLi4udGVtcG9yYXJ5TWFyay5rZXlzKCldO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQge1xuICBWZXJ0ZXhJbmRpY2VzLFxuICBFZGdlcyxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeVNyY1RvTWFwLFxuICBlZGdlc0J5RHN0VG9NYXAsXG4gIERpcmVjdGVkRWRnZSxcbiAgRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL2RhZy9kYWdcIjtcblxuaW1wb3J0IHsgdG9wb2xvZ2ljYWxTb3J0IH0gZnJvbSBcIi4uL2RhZy9hbGdvcml0aG1zL3RvcG9zb3J0LnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNWYWx1ZXMgfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBUYXNrRHVyYXRpb24gfSBmcm9tIFwiLi4vdHlwZXMvdHlwZXMudHNcIjtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfVEFTS19OQU1FID0gXCJUYXNrIE5hbWVcIjtcblxuZXhwb3J0IGludGVyZmFjZSBUYXNrU2VyaWFsaXplZCB7XG4gIHJlc291cmNlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbiAgbWV0cmljczogTWV0cmljVmFsdWVzO1xuICBuYW1lOiBzdHJpbmc7XG4gIGlkOiBzdHJpbmc7XG59XG5cbi8vIERvIHdlIGNyZWF0ZSBzdWItY2xhc3NlcyBhbmQgdGhlbiBzZXJpYWxpemUgc2VwYXJhdGVseT8gT3IgZG8gd2UgaGF2ZSBhXG4vLyBjb25maWcgYWJvdXQgd2hpY2ggdHlwZSBvZiBEdXJhdGlvblNhbXBsZXIgaXMgYmVpbmcgdXNlZD9cbi8vXG4vLyBXZSBjYW4gdXNlIHRyYWRpdGlvbmFsIG9wdGltaXN0aWMvcGVzc2ltaXN0aWMgdmFsdWUuIE9yIEphY29iaWFuJ3Ncbi8vIHVuY2VydGFpbnRseSBtdWx0aXBsaWVycyBbMS4xLCAxLjUsIDIsIDVdIGFuZCB0aGVpciBpbnZlcnNlcyB0byBnZW5lcmF0ZSBhblxuLy8gb3B0aW1pc3RpYyBwZXNzaW1pc3RpYy5cblxuLyoqIFRhc2sgaXMgYSBWZXJ0ZXggd2l0aCBkZXRhaWxzIGFib3V0IHRoZSBUYXNrIHRvIGNvbXBsZXRlLiAqL1xuZXhwb3J0IGNsYXNzIFRhc2sge1xuICAvLyBSZXNvdXJjZSBrZXlzIGFuZCB2YWx1ZXMuIFRoZSBwYXJlbnQgcGxhbiBjb250YWlucyBhbGwgdGhlIHJlc291cmNlXG4gIC8vIGRlZmluaXRpb25zLlxuICByZXNvdXJjZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG4gIG1ldHJpY3M6IE1ldHJpY1ZhbHVlcztcbiAgbmFtZTogc3RyaW5nO1xuICBpZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9IFwiXCIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IERFRkFVTFRfVEFTS19OQU1FO1xuICAgIHRoaXMubWV0cmljcyA9IHt9O1xuICAgIHRoaXMucmVzb3VyY2VzID0ge307XG4gICAgdGhpcy5pZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gIH1cblxuICB0b0pTT04oKTogVGFza1NlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICByZXNvdXJjZXM6IHRoaXMucmVzb3VyY2VzLFxuICAgICAgbWV0cmljczogdGhpcy5tZXRyaWNzLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSlNPTih0YXNrU2VyaWFsaXplZDogVGFza1NlcmlhbGl6ZWQpOiBUYXNrIHtcbiAgICBjb25zdCByZXQgPSBuZXcgVGFzayh0YXNrU2VyaWFsaXplZC5uYW1lKTtcbiAgICByZXQuaWQgPSB0YXNrU2VyaWFsaXplZC5pZDtcbiAgICByZXQucmVzb3VyY2VzID0gdGFza1NlcmlhbGl6ZWQucmVzb3VyY2VzO1xuICAgIHJldC5tZXRyaWNzID0gdGFza1NlcmlhbGl6ZWQubWV0cmljcztcblxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGR1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWV0cmljKFwiRHVyYXRpb25cIikhO1xuICB9XG5cbiAgcHVibGljIHNldCBkdXJhdGlvbih2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRNZXRyaWMoXCJEdXJhdGlvblwiLCB2YWx1ZSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0TWV0cmljKGtleTogc3RyaW5nKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNzW2tleV07XG4gIH1cblxuICBwdWJsaWMgc2V0TWV0cmljKGtleTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5tZXRyaWNzW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVNZXRyaWMoa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5tZXRyaWNzW2tleV07XG4gIH1cblxuICBwdWJsaWMgZ2V0UmVzb3VyY2Uoa2V5OiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlc1trZXldO1xuICB9XG5cbiAgcHVibGljIHNldFJlc291cmNlKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5yZXNvdXJjZXNba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGRlbGV0ZVJlc291cmNlKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMucmVzb3VyY2VzW2tleV07XG4gIH1cblxuICBwdWJsaWMgZHVwKCk6IFRhc2sge1xuICAgIGNvbnN0IHJldCA9IG5ldyBUYXNrKCk7XG4gICAgcmV0LnJlc291cmNlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucmVzb3VyY2VzKTtcbiAgICByZXQubWV0cmljcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMubWV0cmljcyk7XG4gICAgcmV0Lm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUYXNrcyA9IFRhc2tbXTtcblxuZXhwb3J0IGludGVyZmFjZSBDaGFydFNlcmlhbGl6ZWQge1xuICB2ZXJ0aWNlczogVGFza1NlcmlhbGl6ZWRbXTtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVNlcmlhbGl6ZWRbXTtcbn1cblxuLyoqIEEgQ2hhcnQgaXMgYSBEaXJlY3RlZEdyYXBoLCBidXQgd2l0aCBUYXNrcyBmb3IgVmVydGljZXMuICovXG5leHBvcnQgY2xhc3MgQ2hhcnQge1xuICBWZXJ0aWNlczogVGFza3M7XG4gIEVkZ2VzOiBFZGdlcztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBzdGFydCA9IG5ldyBUYXNrKFwiU3RhcnRcIik7XG4gICAgc3RhcnQuc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgMCk7XG4gICAgY29uc3QgZmluaXNoID0gbmV3IFRhc2soXCJGaW5pc2hcIik7XG4gICAgZmluaXNoLnNldE1ldHJpYyhcIkR1cmF0aW9uXCIsIDApO1xuICAgIHRoaXMuVmVydGljZXMgPSBbc3RhcnQsIGZpbmlzaF07XG4gICAgdGhpcy5FZGdlcyA9IFtuZXcgRGlyZWN0ZWRFZGdlKDAsIDEpXTtcbiAgfVxuXG4gIHRvSlNPTigpOiBDaGFydFNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJ0aWNlczogdGhpcy5WZXJ0aWNlcy5tYXAoKHQ6IFRhc2spID0+IHQudG9KU09OKCkpLFxuICAgICAgZWRnZXM6IHRoaXMuRWRnZXMubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUudG9KU09OKCkpLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZnJvbUpTT04oY2hhcnRTZXJpYWxpemVkOiBDaGFydFNlcmlhbGl6ZWQpOiBDaGFydCB7XG4gICAgY29uc3QgcmV0ID0gbmV3IENoYXJ0KCk7XG4gICAgcmV0LlZlcnRpY2VzID0gY2hhcnRTZXJpYWxpemVkLnZlcnRpY2VzLm1hcCgodHM6IFRhc2tTZXJpYWxpemVkKSA9PlxuICAgICAgVGFzay5mcm9tSlNPTih0cylcbiAgICApO1xuICAgIHJldC5FZGdlcyA9IGNoYXJ0U2VyaWFsaXplZC5lZGdlcy5tYXAoXG4gICAgICAoZGlyZWN0ZWRFZGdlU2VyaWFsaXplZDogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCkgPT5cbiAgICAgICAgRGlyZWN0ZWRFZGdlLmZyb21KU09OKGRpcmVjdGVkRWRnZVNlcmlhbGl6ZWQpXG4gICAgKTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFRvcG9sb2dpY2FsT3JkZXIgPSBWZXJ0ZXhJbmRpY2VzO1xuXG5leHBvcnQgdHlwZSBWYWxpZGF0ZVJlc3VsdCA9IFJlc3VsdDxUb3BvbG9naWNhbE9yZGVyPjtcblxuLyoqIFZhbGlkYXRlcyB0aGUgRGlyZWN0ZWRHcmFwaCBjb21wb25lbnQgb2YgYSBDaGFydCBpcyB2YWxpZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZURpcmVjdGVkR3JhcGgoZzogRGlyZWN0ZWRHcmFwaCk6IFZhbGlkYXRlUmVzdWx0IHtcbiAgaWYgKGcuVmVydGljZXMubGVuZ3RoIDwgMikge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIFwiQ2hhcnQgbXVzdCBjb250YWluIGF0IGxlYXN0IHR3byBub2RlLCB0aGUgc3RhcnQgYW5kIGZpbmlzaCB0YXNrcy5cIlxuICAgICk7XG4gIH1cblxuICBjb25zdCBlZGdlc0J5RHN0ID0gZWRnZXNCeURzdFRvTWFwKGcuRWRnZXMpO1xuICBjb25zdCBlZGdlc0J5U3JjID0gZWRnZXNCeVNyY1RvTWFwKGcuRWRnZXMpO1xuXG4gIC8vIFRoZSBmaXJzdCBWZXJ0ZXgsIFRfMCBha2EgdGhlIFN0YXJ0IE1pbGVzdG9uZSwgbXVzdCBoYXZlIDAgaW5jb21pbmcgZWRnZXMuXG4gIGlmIChlZGdlc0J5RHN0LmdldCgwKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFwiVGhlIHN0YXJ0IG5vZGUgKDApIGhhcyBhbiBpbmNvbWluZyBlZGdlLlwiKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfMCBzaG91bGQgaGF2ZSAwIGluY29taW5nIGVkZ2VzLlxuICBmb3IgKGxldCBpID0gMTsgaSA8IGcuVmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeURzdC5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0ICgwKSB0aGF0IGhhcyBubyBpbmNvbWluZyBlZGdlczogJHtpfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlIGxhc3QgVmVydGV4LCBUX2ZpbmlzaCwgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIG11c3QgaGF2ZSAwIG91dGdvaW5nIGVkZ2VzLlxuICBpZiAoZWRnZXNCeVNyYy5nZXQoZy5WZXJ0aWNlcy5sZW5ndGggLSAxKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgXCJUaGUgbGFzdCBub2RlLCB3aGljaCBzaG91bGQgYmUgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIGhhcyBhbiBvdXRnb2luZyBlZGdlLlwiXG4gICAgKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfZmluaXNoIHNob3VsZCBoYXZlIDAgb3V0Z29pbmcgZWRnZXMuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZy5WZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeVNyYy5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0IFRfZmluaXNoIHRoYXQgaGFzIG5vIG91dGdvaW5nIGVkZ2VzOiAke2l9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBudW1WZXJ0aWNlcyA9IGcuVmVydGljZXMubGVuZ3RoO1xuICAvLyBBbmQgYWxsIGVkZ2VzIG1ha2Ugc2Vuc2UsIGkuZS4gdGhleSBhbGwgcG9pbnQgdG8gdmVydGV4ZXMgdGhhdCBleGlzdC5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBnLkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGcuRWRnZXNbaV07XG4gICAgaWYgKFxuICAgICAgZWxlbWVudC5pIDwgMCB8fFxuICAgICAgZWxlbWVudC5pID49IG51bVZlcnRpY2VzIHx8XG4gICAgICBlbGVtZW50LmogPCAwIHx8XG4gICAgICBlbGVtZW50LmogPj0gbnVtVmVydGljZXNcbiAgICApIHtcbiAgICAgIHJldHVybiBlcnJvcihgRWRnZSAke2VsZW1lbnR9IHBvaW50cyB0byBhIG5vbi1leGlzdGVudCBWZXJ0ZXguYCk7XG4gICAgfVxuICB9XG5cbiAgLy8gTm93IHdlIGNvbmZpcm0gdGhhdCB3ZSBoYXZlIGEgRGlyZWN0ZWQgQWN5Y2xpYyBHcmFwaCwgaS5lLiB0aGUgZ3JhcGggaGFzIG5vXG4gIC8vIGN5Y2xlcyBieSBjcmVhdGluZyBhIHRvcG9sb2dpY2FsIHNvcnQgc3RhcnRpbmcgYXQgVF8wXG4gIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmcjRGVwdGgtZmlyc3Rfc2VhcmNoXG4gIGNvbnN0IHRzUmV0ID0gdG9wb2xvZ2ljYWxTb3J0KGcpO1xuICBpZiAodHNSZXQuaGFzQ3ljbGVzKSB7XG4gICAgcmV0dXJuIGVycm9yKGBDaGFydCBoYXMgY3ljbGU6ICR7Wy4uLnRzUmV0LmN5Y2xlXS5qb2luKFwiLCBcIil9YCk7XG4gIH1cblxuICByZXR1cm4gb2sodHNSZXQub3JkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2hhcnRWYWxpZGF0ZShcbiAgYzogQ2hhcnQsXG4gIHRhc2tEdXJhdGlvbjogVGFza0R1cmF0aW9uIHwgbnVsbCA9IG51bGxcbik6IFZhbGlkYXRlUmVzdWx0IHtcbiAgaWYgKHRhc2tEdXJhdGlvbiA9PT0gbnVsbCkge1xuICAgIHRhc2tEdXJhdGlvbiA9ICh0YXNrSW5kZXg6IG51bWJlcikgPT4gYy5WZXJ0aWNlc1t0YXNrSW5kZXhdLmR1cmF0aW9uO1xuICB9XG4gIGNvbnN0IHJldCA9IHZhbGlkYXRlRGlyZWN0ZWRHcmFwaChjKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIGlmICh0YXNrRHVyYXRpb24oMCkgIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgU3RhcnQgTWlsZXN0b25lIG11c3QgaGF2ZSBkdXJhdGlvbiBvZiAwLCBpbnN0ZWFkIGdvdCAke3Rhc2tEdXJhdGlvbigwKX1gXG4gICAgKTtcbiAgfVxuICBpZiAodGFza0R1cmF0aW9uKGMuVmVydGljZXMubGVuZ3RoIC0gMSkgIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgRmluaXNoIE1pbGVzdG9uZSBtdXN0IGhhdmUgZHVyYXRpb24gb2YgMCwgaW5zdGVhZCBnb3QgJHt0YXNrRHVyYXRpb24oXG4gICAgICAgIGMuVmVydGljZXMubGVuZ3RoIC0gMVxuICAgICAgKX1gXG4gICAgKTtcbiAgfVxuICBjb25zdCBhbGxJRHMgPSBuZXcgU2V0KCk7XG4gIGZvciAobGV0IHRhc2tJbmRleCA9IDA7IHRhc2tJbmRleCA8IGMuVmVydGljZXMubGVuZ3RoOyB0YXNrSW5kZXgrKykge1xuICAgIGNvbnN0IHRhc2sgPSBjLlZlcnRpY2VzW3Rhc2tJbmRleF07XG4gICAgaWYgKGFsbElEcy5oYXModGFzay5pZCkpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoYFR3byB0YXNrcyBjb250YWluIHRoZSBzYW1lIElEOiAke3Rhc2suaWR9YCkpO1xuICAgIH1cbiAgICBhbGxJRHMuYWRkKHRhc2suaWQpO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBUYXNrLCBDaGFydCwgQ2hhcnRWYWxpZGF0ZSB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUm91bmRlciwgVGFza0R1cmF0aW9uIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzLnRzXCI7XG5cbi8qKiBTcGFuIHJlcHJlc2VudHMgd2hlbiBhIHRhc2sgd2lsbCBiZSBkb25lLCBpLmUuIGl0IGNvbnRhaW5zIHRoZSB0aW1lIHRoZSB0YXNrXG4gKiBpcyBleHBlY3RlZCB0byBiZWdpbiBhbmQgZW5kLiAqL1xuZXhwb3J0IGNsYXNzIFNwYW4ge1xuICBzdGFydDogbnVtYmVyO1xuICBmaW5pc2g6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihzdGFydDogbnVtYmVyID0gMCwgZmluaXNoOiBudW1iZXIgPSAwKSB7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMuZmluaXNoID0gZmluaXNoO1xuICB9XG59XG5cbi8qKiBUaGUgc3RhbmRhcmQgc2xhY2sgY2FsY3VsYXRpb24gdmFsdWVzLiAqL1xuZXhwb3J0IGNsYXNzIFNsYWNrIHtcbiAgZWFybHk6IFNwYW4gPSBuZXcgU3BhbigpO1xuICBsYXRlOiBTcGFuID0gbmV3IFNwYW4oKTtcbiAgc2xhY2s6IG51bWJlciA9IDA7XG59XG5cbmV4cG9ydCB0eXBlIFNsYWNrUmVzdWx0ID0gUmVzdWx0PFNsYWNrW10+O1xuXG5leHBvcnQgdHlwZSBTbGFja0Vhcmx5U3RhcnRPdmVycmlkZSA9ICh0YXNrSUQ6IHN0cmluZykgPT4gbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4vLyBDYWxjdWxhdGUgdGhlIHNsYWNrIGZvciBlYWNoIFRhc2sgaW4gdGhlIENoYXJ0LlxuZXhwb3J0IGZ1bmN0aW9uIENvbXB1dGVTbGFjayhcbiAgYzogQ2hhcnQsXG4gIHRhc2tEdXJhdGlvbjogVGFza0R1cmF0aW9uIHwgbnVsbCA9IG51bGwsXG4gIHJvdW5kOiBSb3VuZGVyLFxuICBvdmVycmlkZTogU2xhY2tFYXJseVN0YXJ0T3ZlcnJpZGUgfCBudWxsID0gbnVsbFxuKTogU2xhY2tSZXN1bHQge1xuICBpZiAodGFza0R1cmF0aW9uID09PSBudWxsKSB7XG4gICAgdGFza0R1cmF0aW9uID0gKHRhc2tJbmRleDogbnVtYmVyKSA9PiBjLlZlcnRpY2VzW3Rhc2tJbmRleF0uZHVyYXRpb247XG4gIH1cblxuICAvLyBDcmVhdGUgYSBTbGFjayBmb3IgZWFjaCBUYXNrLlxuICBjb25zdCBzbGFja3M6IFNsYWNrW10gPSBuZXcgQXJyYXkoYy5WZXJ0aWNlcy5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGMuVmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzbGFja3NbaV0gPSBuZXcgU2xhY2soKTtcbiAgfVxuXG4gIGNvbnN0IHIgPSBDaGFydFZhbGlkYXRlKGMsIHRhc2tEdXJhdGlvbik7XG4gIGlmICghci5vaykge1xuICAgIHJldHVybiBlcnJvcihyLmVycm9yKTtcbiAgfVxuXG4gIGNvbnN0IGVkZ2VzID0gZWRnZXNCeVNyY0FuZERzdFRvTWFwKGMuRWRnZXMpO1xuXG4gIGNvbnN0IHRvcG9sb2dpY2FsT3JkZXIgPSByLnZhbHVlO1xuXG4gIC8vIEZpcnN0IGdvIGZvcndhcmQgdGhyb3VnaCB0aGUgdG9wb2xvZ2ljYWwgc29ydCBhbmQgZmluZCB0aGUgZWFybHkgc3RhcnQgZm9yXG4gIC8vIGVhY2ggdGFzaywgd2hpY2ggaXMgdGhlIG1heCBvZiBhbGwgdGhlIHByZWRlY2Vzc29ycyBlYXJseSBmaW5pc2ggdmFsdWVzLlxuICAvLyBTaW5jZSB3ZSBrbm93IHRoZSBkdXJhdGlvbiB3ZSBjYW4gYWxzbyBjb21wdXRlIHRoZSBlYXJseSBmaW5pc2guXG4gIHRvcG9sb2dpY2FsT3JkZXIuc2xpY2UoMSkuZm9yRWFjaCgodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSBjLlZlcnRpY2VzW3ZlcnRleEluZGV4XTtcbiAgICBjb25zdCBzbGFjayA9IHNsYWNrc1t2ZXJ0ZXhJbmRleF07XG4gICAgc2xhY2suZWFybHkuc3RhcnQgPSBNYXRoLm1heChcbiAgICAgIC4uLmVkZ2VzLmJ5RHN0LmdldCh2ZXJ0ZXhJbmRleCkhLm1hcCgoZTogRGlyZWN0ZWRFZGdlKTogbnVtYmVyID0+IHtcbiAgICAgICAgY29uc3QgcHJlZGVjZXNzb3JTbGFjayA9IHNsYWNrc1tlLmldO1xuICAgICAgICByZXR1cm4gcHJlZGVjZXNzb3JTbGFjay5lYXJseS5maW5pc2g7XG4gICAgICB9KVxuICAgICk7XG4gICAgY29uc3Qgb3ZlcnJpZGVWYWx1ZSA9IG92ZXJyaWRlPy4odGFzay5pZCk7XG4gICAgaWYgKG92ZXJyaWRlVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc2xhY2suZWFybHkuc3RhcnQgPSBvdmVycmlkZVZhbHVlO1xuICAgIH1cbiAgICBzbGFjay5lYXJseS5maW5pc2ggPSByb3VuZChzbGFjay5lYXJseS5zdGFydCArIHRhc2tEdXJhdGlvbih2ZXJ0ZXhJbmRleCkpO1xuICB9KTtcblxuICAvLyBOb3cgYmFja3dhcmRzIHRocm91Z2ggdGhlIHRvcG9sb2dpY2FsIHNvcnQgYW5kIGZpbmQgdGhlIGxhdGUgZmluaXNoIG9mIGVhY2hcbiAgLy8gdGFzaywgd2hpY2ggaXMgdGhlIG1pbiBvZiBhbGwgdGhlIHN1Y2Nlc3NvciB0YXNrcyBsYXRlIHN0YXJ0cy4gQWdhaW4gc2luY2VcbiAgLy8gd2Uga25vdyB0aGUgZHVyYXRpb24gd2UgY2FuIGFsc28gY29tcHV0ZSB0aGUgbGF0ZSBzdGFydC4gRmluYWxseSwgc2luY2Ugd2VcbiAgLy8gbm93IGhhdmUgYWxsIHRoZSBlYXJseS9sYXRlIGFuZCBzdGFydC9maW5pc2ggdmFsdWVzIHdlIGNhbiBub3cgY2FsY3VhdGUgdGhlXG4gIC8vIHNsYWNrLlxuICB0b3BvbG9naWNhbE9yZGVyLnJldmVyc2UoKS5mb3JFYWNoKCh2ZXJ0ZXhJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzayA9IGMuVmVydGljZXNbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHNsYWNrID0gc2xhY2tzW3ZlcnRleEluZGV4XTtcbiAgICBjb25zdCBzdWNjZXNzb3JzID0gZWRnZXMuYnlTcmMuZ2V0KHZlcnRleEluZGV4KTtcbiAgICBpZiAoIXN1Y2Nlc3NvcnMpIHtcbiAgICAgIHNsYWNrLmxhdGUuZmluaXNoID0gc2xhY2suZWFybHkuZmluaXNoO1xuICAgICAgc2xhY2subGF0ZS5zdGFydCA9IHNsYWNrLmVhcmx5LnN0YXJ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBvdmVycmlkZVZhbHVlID0gb3ZlcnJpZGU/Lih0YXNrLmlkKTtcbiAgICAgIGlmIChvdmVycmlkZVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gU2luY2UgdGhpcyB0YXNrIGhhcyBiZWVuIHN0YXJ0ZWQsIHdlIHNldCBsYXRlXG4gICAgICAgIC8vIHN0YXJ0L2ZpbmlzaCB0byBlYXJseSBzdGFydC9maW5pc2guXG4gICAgICAgIHNsYWNrLmxhdGUgPSBzbGFjay5lYXJseTtcbiAgICAgICAgc2xhY2suc2xhY2sgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGF0ZVN0YXJ0cyA9IGVkZ2VzLmJ5U3JjXG4gICAgICAgICAgLmdldCh2ZXJ0ZXhJbmRleCkhXG4gICAgICAgICAgLm1hcCgoZTogRGlyZWN0ZWRFZGdlKTogbnVtYmVyIHwgbnVsbCA9PiB7XG4gICAgICAgICAgICAvLyBOZWVkIHRvIGlnbm9yZSB2YWx1ZXMgZnJvbSBzdGFydGVkIHRhc2tzP1xuICAgICAgICAgICAgaWYgKG92ZXJyaWRlPy4oYy5WZXJ0aWNlc1tlLmpdLmlkKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzdWNjZXNzb3JTbGFjayA9IHNsYWNrc1tlLmpdO1xuICAgICAgICAgICAgcmV0dXJuIHN1Y2Nlc3NvclNsYWNrLmxhdGUuc3RhcnQ7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZmlsdGVyKCh2YWx1ZSkgPT4gdmFsdWUgIT09IG51bGwpIGFzIG51bWJlcltdO1xuICAgICAgICBpZiAobGF0ZVN0YXJ0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBzbGFjay5sYXRlLmZpbmlzaCA9IHNsYWNrLmVhcmx5LmZpbmlzaDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzbGFjay5sYXRlLmZpbmlzaCA9IE1hdGgubWluKC4uLmxhdGVTdGFydHMpO1xuICAgICAgICB9XG4gICAgICAgIHNsYWNrLmxhdGUuc3RhcnQgPSByb3VuZChzbGFjay5sYXRlLmZpbmlzaCAtIHRhc2tEdXJhdGlvbih2ZXJ0ZXhJbmRleCkpO1xuICAgICAgICBzbGFjay5zbGFjayA9IHJvdW5kKHNsYWNrLmxhdGUuZmluaXNoIC0gc2xhY2suZWFybHkuZmluaXNoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBvayhzbGFja3MpO1xufVxuXG5leHBvcnQgY29uc3QgQ3JpdGljYWxQYXRoID0gKHNsYWNrczogU2xhY2tbXSwgcm91bmQ6IFJvdW5kZXIpOiBudW1iZXJbXSA9PiB7XG4gIGNvbnN0IHJldDogbnVtYmVyW10gPSBbXTtcbiAgc2xhY2tzLmZvckVhY2goKHNsYWNrOiBTbGFjaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGlmIChcbiAgICAgIHJvdW5kKHNsYWNrLmxhdGUuZmluaXNoIC0gc2xhY2suZWFybHkuZmluaXNoKSA8IE51bWJlci5FUFNJTE9OICYmXG4gICAgICByb3VuZChzbGFjay5lYXJseS5maW5pc2ggLSBzbGFjay5lYXJseS5zdGFydCkgPiBOdW1iZXIuRVBTSUxPTlxuICAgICkge1xuICAgICAgcmV0LnB1c2goaW5kZXgpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXQ7XG59O1xuIiwgImltcG9ydCB7IFNwYW4gfSBmcm9tIFwiLi4vc2xhY2svc2xhY2tcIjtcblxuLy8gVGhlIGNvbXBsZXRpb24gc3RhdHVzIG9mIGEgVGFzay4gVGhlIHZhbHVlIG9mIGBzdGFydGAgYW5kIHZhbHVlcyBpbiBgc3BhbmBcbi8vIGFuZCBkdXJhdGlvbiBvZmZzZXRzLCBqdXN0IGxpa2Ugd2hhdCBhcmUgdXNlZCBpbiB0aGUgU3BhbnMgdXNlZCBpbiByZW5kZXJpbmcuXG5leHBvcnQgdHlwZSBUYXNrQ29tcGxldGlvbiA9XG4gIHwgeyBzdGFnZTogXCJ1bnN0YXJ0ZWRcIiB9XG4gIHwge1xuICAgICAgc3RhZ2U6IFwic3RhcnRlZFwiO1xuICAgICAgc3RhcnQ6IG51bWJlcjtcbiAgICAgIHBlcmNlbnRDb21wbGV0ZTogbnVtYmVyO1xuICAgIH1cbiAgfCB7XG4gICAgICBzdGFnZTogXCJmaW5pc2hlZFwiO1xuICAgICAgc3BhbjogU3BhbjtcbiAgICB9O1xuXG5leHBvcnQgdHlwZSBUYXNrQ29tcGxldGlvblNlcmlhbGl6ZWQgPSB7XG4gIHN0YWdlOiBzdHJpbmc7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIHBlcmNlbnRDb21wbGV0ZTogbnVtYmVyO1xuICBmaW5pc2g6IG51bWJlcjtcbn07XG5cbmV4cG9ydCBjb25zdCB0YXNrVW5zdGFydGVkID0geyBzdGFnZTogXCJ1bnN0YXJ0ZWRcIiB9O1xuXG5leHBvcnQgdHlwZSBUYXNrQ29tcGxldGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IFRhc2tDb21wbGV0aW9uIH07XG5leHBvcnQgdHlwZSBUYXNrQ29tcGxldGlvbnNTZXJpYWxpemVkID0ge1xuICBba2V5OiBzdHJpbmddOiBUYXNrQ29tcGxldGlvblNlcmlhbGl6ZWQ7XG59O1xuXG5leHBvcnQgY29uc3QgdG9KU09OID0gKFxuICB0YXNrQ29tcGxldGlvbjogVGFza0NvbXBsZXRpb25cbik6IFRhc2tDb21wbGV0aW9uU2VyaWFsaXplZCA9PiB7XG4gIGNvbnN0IHJldDogVGFza0NvbXBsZXRpb25TZXJpYWxpemVkID0ge1xuICAgIHN0YWdlOiB0YXNrQ29tcGxldGlvbi5zdGFnZSBhcyBzdHJpbmcsXG4gICAgc3RhcnQ6IDAsXG4gICAgZmluaXNoOiAwLFxuICAgIHBlcmNlbnRDb21wbGV0ZTogMCxcbiAgfTtcblxuICBzd2l0Y2ggKHRhc2tDb21wbGV0aW9uLnN0YWdlKSB7XG4gICAgY2FzZSBcInVuc3RhcnRlZFwiOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInN0YXJ0ZWRcIjpcbiAgICAgIHJldC5zdGFydCA9IHRhc2tDb21wbGV0aW9uLnN0YXJ0O1xuICAgICAgcmV0LnBlcmNlbnRDb21wbGV0ZSA9IHRhc2tDb21wbGV0aW9uLnBlcmNlbnRDb21wbGV0ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJmaW5pc2hlZFwiOlxuICAgICAgcmV0LnN0YXJ0ID0gdGFza0NvbXBsZXRpb24uc3Bhbi5zdGFydDtcbiAgICAgIHJldC5maW5pc2ggPSB0YXNrQ29tcGxldGlvbi5zcGFuLmZpbmlzaDtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0YXNrQ29tcGxldGlvbiBzYXRpc2ZpZXMgbmV2ZXI7XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gcmV0O1xufTtcblxuZXhwb3J0IGNvbnN0IGZyb21KU09OID0gKFxuICB0YXNrQ29tcGxldGlvblNlcmlhbGl6ZWQ6IFRhc2tDb21wbGV0aW9uU2VyaWFsaXplZFxuKTogVGFza0NvbXBsZXRpb24gPT4ge1xuICBjb25zdCB1bnN0YXJ0ZWQ6IFRhc2tDb21wbGV0aW9uID0geyBzdGFnZTogXCJ1bnN0YXJ0ZWRcIiB9O1xuICBzd2l0Y2ggKHRhc2tDb21wbGV0aW9uU2VyaWFsaXplZC5zdGFnZSkge1xuICAgIGNhc2UgXCJ1bnN0YXJ0ZWRcIjpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YWdlOiBcInVuc3RhcnRlZFwiLFxuICAgICAgfTtcbiAgICBjYXNlIFwic3RhcnRlZFwiOlxuICAgICAgaWYgKHRhc2tDb21wbGV0aW9uU2VyaWFsaXplZC5zdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bnN0YXJ0ZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGFnZTogXCJzdGFydGVkXCIsXG4gICAgICAgIHN0YXJ0OiB0YXNrQ29tcGxldGlvblNlcmlhbGl6ZWQuc3RhcnQsXG4gICAgICAgIHBlcmNlbnRDb21wbGV0ZTogdGFza0NvbXBsZXRpb25TZXJpYWxpemVkLnBlcmNlbnRDb21wbGV0ZSxcbiAgICAgIH07XG4gICAgY2FzZSBcImZpbmlzaGVkXCI6XG4gICAgICBpZiAoXG4gICAgICAgIHRhc2tDb21wbGV0aW9uU2VyaWFsaXplZC5zdGFydCA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgIHRhc2tDb21wbGV0aW9uU2VyaWFsaXplZC5maW5pc2ggPT09IHVuZGVmaW5lZFxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiB1bnN0YXJ0ZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGFnZTogXCJmaW5pc2hlZFwiLFxuICAgICAgICBzcGFuOiBuZXcgU3BhbihcbiAgICAgICAgICB0YXNrQ29tcGxldGlvblNlcmlhbGl6ZWQuc3RhcnQsXG4gICAgICAgICAgdGFza0NvbXBsZXRpb25TZXJpYWxpemVkLmZpbmlzaFxuICAgICAgICApLFxuICAgICAgfTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHVuc3RhcnRlZDtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHRhc2tDb21wbGV0aW9uc1RvSlNPTiA9IChcbiAgdDogVGFza0NvbXBsZXRpb25zXG4pOiBUYXNrQ29tcGxldGlvbnNTZXJpYWxpemVkID0+IHtcbiAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyh0KS5tYXAoKFtrZXksIHRhc2tDb21wbGV0aW9uXSkgPT4gW1xuICAgICAga2V5LFxuICAgICAgdG9KU09OKHRhc2tDb21wbGV0aW9uKSxcbiAgICBdKVxuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IHRhc2tDb21wbGV0aW9uc0Zyb21KU09OID0gKFxuICB0OiBUYXNrQ29tcGxldGlvbnNTZXJpYWxpemVkXG4pOiBUYXNrQ29tcGxldGlvbnMgPT4ge1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKHQpLm1hcCgoW2tleSwgdGFza0NvbXBsZXRpb25TZXJpYWxpemVkXSkgPT4gW1xuICAgICAga2V5LFxuICAgICAgZnJvbUpTT04odGFza0NvbXBsZXRpb25TZXJpYWxpemVkKSxcbiAgICBdKVxuICApO1xufTtcbiIsICJleHBvcnQgdHlwZSBQbGFuU3RhdHVzID1cbiAgfCB7IHN0YWdlOiBcInVuc3RhcnRlZFwiOyBzdGFydDogMCB9XG4gIHwge1xuICAgICAgc3RhZ2U6IFwic3RhcnRlZFwiO1xuICAgICAgc3RhcnQ6IG51bWJlcjsgLy8gTnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBzaW5jZSB0aGUgZXBvY2guXG4gICAgfTtcblxuZXhwb3J0IGNvbnN0IHN0YXR1c1RvRGF0ZSA9IChzdGF0dXM6IFBsYW5TdGF0dXMpOiBEYXRlID0+IHtcbiAgaWYgKHN0YXR1cy5zdGFnZSA9PT0gXCJ1bnN0YXJ0ZWRcIikge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpO1xuICB9XG4gIHJldHVybiBuZXcgRGF0ZShzdGF0dXMuc3RhcnQpO1xufTtcblxuZXhwb3J0IGNvbnN0IHVuc3RhcnRlZDogUGxhblN0YXR1cyA9IHsgc3RhZ2U6IFwidW5zdGFydGVkXCIsIHN0YXJ0OiAwIH07XG5cbmV4cG9ydCB0eXBlIFBsYW5TdGF0dXNTZXJpYWxpemVkID0ge1xuICBzdGFnZTogc3RyaW5nO1xuICBzdGFydDogbnVtYmVyO1xufTtcblxuZXhwb3J0IGNvbnN0IHRvSlNPTiA9IChwOiBQbGFuU3RhdHVzKTogUGxhblN0YXR1c1NlcmlhbGl6ZWQgPT4ge1xuICBjb25zdCByZXQ6IFBsYW5TdGF0dXNTZXJpYWxpemVkID0ge1xuICAgIHN0YWdlOiBcInVuc3RhcnRlZFwiLFxuICAgIHN0YXJ0OiAwLFxuICB9O1xuICBpZiAocC5zdGFnZSA9PT0gXCJzdGFydGVkXCIpIHtcbiAgICByZXQuc3RhZ2UgPSBcInN0YXJ0ZWRcIjtcbiAgICByZXQuc3RhcnQgPSBwLnN0YXJ0LnZhbHVlT2YoKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufTtcblxuZXhwb3J0IGNvbnN0IGZyb21KU09OID0gKHA6IFBsYW5TdGF0dXNTZXJpYWxpemVkKTogUGxhblN0YXR1cyA9PiB7XG4gIGNvbnN0IHVuc3RhcnRlZDogUGxhblN0YXR1cyA9IHsgc3RhZ2U6IFwidW5zdGFydGVkXCIsIHN0YXJ0OiAwIH07XG5cbiAgaWYgKHAuc3RhZ2UgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB1bnN0YXJ0ZWQ7XG4gIH1cbiAgaWYgKHAuc3RhZ2UgPT09IFwic3RhcnRlZFwiKSB7XG4gICAgaWYgKHAuc3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuc3RhcnRlZDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YWdlOiBcInN0YXJ0ZWRcIixcbiAgICAgIHN0YXJ0OiBwLnN0YXJ0LFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHVuc3RhcnRlZDtcbn07XG4iLCAiLy8gT3BzIGZvciB1cGRhdGluZyBhIFBsYW4ncyBzdGFydCBzdGF0dXMgYW5kIHRoZSBjb21wbGV0aW9uIHN0YXR1cyBvZiBUYXNrcy5cblxuaW1wb3J0IHsgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydFwiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW5cIjtcbmltcG9ydCB7IFBsYW5TdGF0dXMsIGZyb21KU09OLCB0b0pTT04gfSBmcm9tIFwiLi4vcGxhbl9zdGF0dXMvcGxhbl9zdGF0dXNcIjtcbmltcG9ydCB7IFJlc3VsdCwgZXJyb3IsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdFwiO1xuaW1wb3J0IHtcbiAgVGFza0NvbXBsZXRpb24sXG4gIFRhc2tDb21wbGV0aW9ucyxcbiAgdGFza0NvbXBsZXRpb25zRnJvbUpTT04sXG4gIHRhc2tDb21wbGV0aW9uc1RvSlNPTixcbiAgdGFza1Vuc3RhcnRlZCxcbn0gZnJvbSBcIi4uL3Rhc2tfY29tcGxldGlvbi90YXNrX2NvbXBsZXRpb25cIjtcbmltcG9ydCB7IE9wLCBTdWJPcCwgU3ViT3BSZXN1bHQgfSBmcm9tIFwiLi9vcHNcIjtcbmltcG9ydCB7XG4gIHRvSlNPTiBhcyB0YXNrVG9KU09OLFxuICBmcm9tSlNPTiBhcyB0YXNrRnJvbUpTT04sXG59IGZyb20gXCIuLi90YXNrX2NvbXBsZXRpb24vdGFza19jb21wbGV0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBTZXRQbGFuU3RhcnRTdGF0ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICB2YWx1ZTogUGxhblN0YXR1cztcbiAgdGFza0NvbXBsZXRpb25zOiBUYXNrQ29tcGxldGlvbnMgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICB2YWx1ZTogUGxhblN0YXR1cyxcbiAgICB0YXNrQ29tcGxldGlvbnM6IFRhc2tDb21wbGV0aW9ucyB8IG51bGwgPSBudWxsXG4gICkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnRhc2tDb21wbGV0aW9ucyA9IHRhc2tDb21wbGV0aW9ucztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG9sZFN0YXR1cyA9IGZyb21KU09OKHRvSlNPTihwbGFuLnN0YXR1cykpO1xuICAgIHBsYW4uc3RhdHVzID0gdGhpcy52YWx1ZTtcblxuICAgIGNvbnN0IHRhc2tDb21wbGV0aW9uc1NuYXBzaG90ID0gdGFza0NvbXBsZXRpb25zRnJvbUpTT04oXG4gICAgICB0YXNrQ29tcGxldGlvbnNUb0pTT04ocGxhbi50YXNrQ29tcGxldGlvbilcbiAgICApO1xuXG4gICAgaWYgKHRoaXMudGFza0NvbXBsZXRpb25zICE9PSBudWxsKSB7XG4gICAgICBwbGFuLnRhc2tDb21wbGV0aW9uID0gdGhpcy50YXNrQ29tcGxldGlvbnM7XG4gICAgfVxuXG4gICAgaWYgKHBsYW4uc3RhdHVzLnN0YWdlID09PSBcInVuc3RhcnRlZFwiKSB7XG4gICAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIHNldCB0aGUgVGFza0NvbXBsZXRpb24gdG8gdW5zdGFydGVkLlxuICAgICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHBsYW4udGFza0NvbXBsZXRpb25bdGFzay5pZF0gPSB7IHN0YWdlOiBcInVuc3RhcnRlZFwiIH07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IG5ldyBTZXRQbGFuU3RhcnRTdGF0ZVN1Yk9wKG9sZFN0YXR1cywgdGFza0NvbXBsZXRpb25zU25hcHNob3QpLFxuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVQbGFuU3RhcnREYXRlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIHN0YXJ0OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc3RhcnQ6IG51bWJlcikge1xuICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmIChwbGFuLnN0YXR1cy5zdGFnZSAhPT0gXCJzdGFydGVkXCIpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoXCJDYW4ndCBzZXQgc3RhcnQgZGF0ZSBvbiBhbiB1bnN0YXJ0ZWQgcGxhbi5cIikpO1xuICAgIH1cbiAgICBjb25zdCBvbGRTdGFydCA9IHBsYW4uc3RhdHVzLnN0YXJ0O1xuICAgIHBsYW4uc3RhdHVzLnN0YXJ0ID0gdGhpcy5zdGFydDtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogbmV3IFVwZGF0ZVBsYW5TdGFydERhdGVTdWJPcChvbGRTdGFydCksXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFRhc2tDb21wbGV0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuICB2YWx1ZTogVGFza0NvbXBsZXRpb247XG5cbiAgY29uc3RydWN0b3IodGFza0luZGV4OiBudW1iZXIsIHZhbHVlOiBUYXNrQ29tcGxldGlvbikge1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmICh0aGlzLnZhbHVlLnN0YWdlICE9PSBcInVuc3RhcnRlZFwiICYmIHBsYW4uc3RhdHVzLnN0YWdlID09PSBcInVuc3RhcnRlZFwiKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIG5ldyBFcnJvcihcIkNhbid0IHN0YXJ0IGEgdGFzayBpZiB0aGUgcGxhbiBoYXNuJ3QgYmVlbiBzdGFydGVkLlwiKVxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgdGFzayA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdO1xuICAgIGNvbnN0IHJldCA9IHBsYW4uZ2V0VGFza0NvbXBsZXRpb24odGhpcy50YXNrSW5kZXgpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGNvbnN0IG9sZFRhc2tTdGF0dXMgPSB0YXNrRnJvbUpTT04odGFza1RvSlNPTihyZXQudmFsdWUpKTtcbiAgICBjb25zdCBzZXRSZXQgPSBwbGFuLnNldFRhc2tDb21wbGV0aW9uKHRoaXMudGFza0luZGV4LCB0aGlzLnZhbHVlKTtcbiAgICBpZiAoIXNldFJldC5vaykge1xuICAgICAgcmV0dXJuIHNldFJldDtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IG5ldyBTZXRUYXNrQ29tcGxldGlvblN1Yk9wKHRoaXMudGFza0luZGV4LCBvbGRUYXNrU3RhdHVzKSxcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0VGFza0NvbXBsZXRpb25PcChcbiAgdGFza0luZGV4OiBudW1iZXIsXG4gIHZhbHVlOiBUYXNrQ29tcGxldGlvblxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0VGFza0NvbXBsZXRpb25TdWJPcCh0YXNrSW5kZXgsIHZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0UGxhblN0YXJ0U3RhdGVPcCh2YWx1ZTogUGxhblN0YXR1cyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldFBsYW5TdGFydFN0YXRlU3ViT3AodmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBVcGRhdGVQbGFuU3RhcnREYXRlT3Aoc3RhcnQ6IG51bWJlcik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFVwZGF0ZVBsYW5TdGFydERhdGVTdWJPcChzdGFydCldKTtcbn1cbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHtcbiAgVGFza0NvbXBsZXRpb24sXG4gIGZyb21KU09OLFxuICB0b0pTT04sXG59IGZyb20gXCIuLi90YXNrX2NvbXBsZXRpb24vdGFza19jb21wbGV0aW9uLnRzXCI7XG5pbXBvcnQgeyBTcGFuIH0gZnJvbSBcIi4uL3NsYWNrL3NsYWNrLnRzXCI7XG5pbXBvcnQgeyBTZXRUYXNrQ29tcGxldGlvbk9wIH0gZnJvbSBcIi4uL29wcy9wbGFuLnRzXCI7XG5pbXBvcnQgeyBleGVjdXRlT3AgfSBmcm9tIFwiLi4vYWN0aW9uL2V4ZWN1dGUudHNcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBUYXNrQ29tcGxldGlvblBhbmVsIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBleHBsYW5NYWluOiBFeHBsYW5NYWluIHwgbnVsbCA9IG51bGw7XG4gIHNwYW46IFNwYW4gfCBudWxsID0gbnVsbDtcbiAgdGFza0luZGV4OiBudW1iZXIgPSAwO1xuICB0YXNrQ29tcGxldGlvbjogVGFza0NvbXBsZXRpb24gfCBudWxsID0gbnVsbDtcbiAgcGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2s6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVPbklucHV0KCk7XG4gICAgfTtcbiAgfVxuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCIsXG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrXG4gICAgKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICBcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCIsXG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrXG4gICAgKTtcbiAgfVxuXG4gIHVwZGF0ZShleHBsYW5NYWluOiBFeHBsYW5NYWluLCB0YXNrSW5kZXg6IG51bWJlciwgc3BhbjogU3Bhbikge1xuICAgIHRoaXMuZXhwbGFuTWFpbiA9IGV4cGxhbk1haW47XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gICAgdGhpcy5zcGFuID0gc3BhbjtcbiAgICB0aGlzLnVwZGF0ZU9uSW5wdXQoKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlT25JbnB1dCgpIHtcbiAgICBjb25zdCByZXQgPSB0aGlzLmV4cGxhbk1haW4hLnBsYW4hLmdldFRhc2tDb21wbGV0aW9uKHRoaXMudGFza0luZGV4KTtcbiAgICBpZiAocmV0Lm9rKSB7XG4gICAgICB0aGlzLnRhc2tDb21wbGV0aW9uID0gcmV0LnZhbHVlO1xuICAgIH1cbiAgICByZW5kZXIodGhpcy50ZW1wbGF0ZSgpLCB0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGlmICh0aGlzLnRhc2tDb21wbGV0aW9uID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gaHRtbGBgO1xuICAgIH1cbiAgICBzd2l0Y2ggKHRoaXMudGFza0NvbXBsZXRpb24uc3RhZ2UpIHtcbiAgICAgIGNhc2UgXCJ1bnN0YXJ0ZWRcIjpcbiAgICAgICAgcmV0dXJuIGh0bWxgPGRpdj5cbiAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgQGNoYW5nZT0keygpID0+IHRoaXMuc3RhcnQoKX0gLz5cbiAgICAgICAgICAgIFN0YXJ0ZWRcbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5gO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInN0YXJ0ZWRcIjpcbiAgICAgICAgcmV0dXJuIGh0bWxgPGRpdj5cbiAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2hlY2tlZCBAY2hhbmdlPSR7KCkgPT4gdGhpcy51bnN0YXJ0KCl9IC8+XG4gICAgICAgICAgICBTdGFydGVkXG4gICAgICAgICAgPC9sYWJlbD5cblxuICAgICAgICAgIDxkYXRlLXBpY2tlclxuICAgICAgICAgICAgLnZhbHVlPSR7e1xuICAgICAgICAgICAgICB1bml0OiB0aGlzLmV4cGxhbk1haW4hLnBsYW4hLmR1cmF0aW9uVW5pdHMsXG4gICAgICAgICAgICAgIGRhdGVPZmZzZXQ6IHRoaXMudGFza0NvbXBsZXRpb24uc3RhcnQsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgQGRhdGUtcGlja2VyLWlucHV0PSR7KGU6IEN1c3RvbUV2ZW50PG51bWJlcj4pID0+XG4gICAgICAgICAgICAgIHRoaXMuc3RhcnREYXRlQ2hhbmdlZChlKX1cbiAgICAgICAgICA+PC9kYXRlLXBpY2tlcj5cblxuICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgIFBlcmNlbnQgQ29tcGxldGVcbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgLnZhbHVlPSR7dGhpcy50YXNrQ29tcGxldGlvbi5wZXJjZW50Q29tcGxldGV9XG4gICAgICAgICAgICAgIEBpbnB1dD0keyhlOiBJbnB1dEV2ZW50KSA9PiB0aGlzLnBlcmNlbnRDaGFuZ2UoZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG5cbiAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgQGNoYW5nZT0keygpID0+IHRoaXMuZmluaXNoKCl9IC8+XG4gICAgICAgICAgICBGaW5pc2hlZFxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDwvZGl2PmA7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiZmluaXNoZWRcIjpcbiAgICAgICAgcmV0dXJuIGh0bWxgPGRpdj5cbiAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2hlY2tlZCBAY2hhbmdlPSR7KCkgPT4gdGhpcy51bnN0YXJ0KCl9IC8+XG4gICAgICAgICAgICBTdGFydGVkXG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8ZGF0ZS1waWNrZXJcbiAgICAgICAgICAgIC52YWx1ZT0ke3tcbiAgICAgICAgICAgICAgdW5pdDogdGhpcy5leHBsYW5NYWluIS5wbGFuIS5kdXJhdGlvblVuaXRzLFxuICAgICAgICAgICAgICBkYXRlT2Zmc2V0OiB0aGlzLnRhc2tDb21wbGV0aW9uLnNwYW4uc3RhcnQsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgQGRhdGUtcGlja2VyLWlucHV0PSR7KGU6IEN1c3RvbUV2ZW50PG51bWJlcj4pID0+XG4gICAgICAgICAgICAgIHRoaXMuc3RhcnREYXRlQ2hhbmdlZChlKX1cbiAgICAgICAgICA+PC9kYXRlLXBpY2tlcj5cblxuICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjaGVja2VkIEBjaGFuZ2U9JHsoKSA9PiB0aGlzLnVuZmluaXNoKCl9IC8+XG4gICAgICAgICAgICBGaW5pc2hlZFxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGRhdGUtcGlja2VyXG4gICAgICAgICAgICAudmFsdWU9JHt7XG4gICAgICAgICAgICAgIHVuaXQ6IHRoaXMuZXhwbGFuTWFpbiEucGxhbiEuZHVyYXRpb25Vbml0cyxcbiAgICAgICAgICAgICAgZGF0ZU9mZnNldDogdGhpcy50YXNrQ29tcGxldGlvbi5zcGFuLmZpbmlzaCxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBAZGF0ZS1waWNrZXItaW5wdXQ9JHsoZTogQ3VzdG9tRXZlbnQ8bnVtYmVyPikgPT5cbiAgICAgICAgICAgICAgdGhpcy5maW5pc2hEYXRlQ2hhbmdlZChlKX1cbiAgICAgICAgICA+PC9kYXRlLXBpY2tlcj5cbiAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIENvbmZpcm0gd2UndmUgY292ZXJlZCBhbGwgc3dpdGNoIHN0YXRlbWVudCBwb3NzaWJpbGl0ZXMuXG4gICAgICAgIHRoaXMudGFza0NvbXBsZXRpb24gc2F0aXNmaWVzIG5ldmVyO1xuICAgICAgICByZXR1cm4gaHRtbGBgO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHRhc2tDb21wbGV0aW9uQ2hhbmdlZCh0OiBUYXNrQ29tcGxldGlvbikge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGVPcChcbiAgICAgIFNldFRhc2tDb21wbGV0aW9uT3AodGhpcy50YXNrSW5kZXgsIHQpLFxuICAgICAgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIixcbiAgICAgIHRydWUsXG4gICAgICB0aGlzLmV4cGxhbk1haW4hXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgY29uc29sZS5sb2cocmV0LmVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHN0YXJ0KCkge1xuICAgIHRoaXMudGFza0NvbXBsZXRpb25DaGFuZ2VkKHtcbiAgICAgIHN0YWdlOiBcInN0YXJ0ZWRcIixcbiAgICAgIHN0YXJ0OiB0aGlzLnNwYW4hLnN0YXJ0LFxuICAgICAgcGVyY2VudENvbXBsZXRlOiAxMCxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgdW5zdGFydCgpIHtcbiAgICB0aGlzLnRhc2tDb21wbGV0aW9uQ2hhbmdlZCh7XG4gICAgICBzdGFnZTogXCJ1bnN0YXJ0ZWRcIixcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZmluaXNoKCkge1xuICAgIGlmICh0aGlzLnRhc2tDb21wbGV0aW9uIS5zdGFnZSA9PT0gXCJzdGFydGVkXCIpIHtcbiAgICAgIHRoaXMudGFza0NvbXBsZXRpb25DaGFuZ2VkKHtcbiAgICAgICAgc3RhZ2U6IFwiZmluaXNoZWRcIixcbiAgICAgICAgLy8gVE9ETyBNYWtlIHN1cmUgZmluaXNoID4gc3RhcnQuXG4gICAgICAgIC8vIFRPRE8gTWFrZSBmaW5pc2ggZGVmYXVsdCB0byBcInRvZGF5XCI/XG4gICAgICAgIHNwYW46IG5ldyBTcGFuKHRoaXMudGFza0NvbXBsZXRpb24hLnN0YXJ0LCB0aGlzLnNwYW4hLmZpbmlzaCksXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHVuZmluaXNoKCkge1xuICAgIGlmICh0aGlzLnRhc2tDb21wbGV0aW9uIS5zdGFnZSA9PT0gXCJmaW5pc2hlZFwiKSB7XG4gICAgICB0aGlzLnRhc2tDb21wbGV0aW9uQ2hhbmdlZCh7XG4gICAgICAgIHN0YWdlOiBcInN0YXJ0ZWRcIixcbiAgICAgICAgLy8gVE9ETyBNYWtlIHN1cmUgZmluaXNoID4gc3RhcnQuXG4gICAgICAgIC8vIFRPRE8gTWFrZSBmaW5pc2ggZGVmYXVsdCB0byBcInRvZGF5XCI/XG4gICAgICAgIHBlcmNlbnRDb21wbGV0ZTogOTAsXG4gICAgICAgIHN0YXJ0OiB0aGlzLnRhc2tDb21wbGV0aW9uIS5zcGFuLnN0YXJ0LFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwZXJjZW50Q2hhbmdlKGU6IElucHV0RXZlbnQpIHtcbiAgICBjb25zdCBkdXAgPSBmcm9tSlNPTih0b0pTT04odGhpcy50YXNrQ29tcGxldGlvbiEpKTtcbiAgICBpZiAoZHVwLnN0YWdlID09PSBcInN0YXJ0ZWRcIikge1xuICAgICAgZHVwLnBlcmNlbnRDb21wbGV0ZSA9IChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZUFzTnVtYmVyO1xuICAgICAgdGhpcy50YXNrQ29tcGxldGlvbkNoYW5nZWQoZHVwKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHN0YXJ0RGF0ZUNoYW5nZWQoZTogQ3VzdG9tRXZlbnQ8bnVtYmVyPikge1xuICAgIGNvbnN0IGR1cCA9IGZyb21KU09OKHRvSlNPTih0aGlzLnRhc2tDb21wbGV0aW9uISkpO1xuICAgIGlmIChkdXAuc3RhZ2UgPT09IFwiZmluaXNoZWRcIikge1xuICAgICAgZHVwLnNwYW4uc3RhcnQgPSBlLmRldGFpbDtcbiAgICB9IGVsc2UgaWYgKGR1cC5zdGFnZSA9PT0gXCJzdGFydGVkXCIpIHtcbiAgICAgIGR1cC5zdGFydCA9IGUuZGV0YWlsO1xuICAgIH1cbiAgICB0aGlzLnRhc2tDb21wbGV0aW9uQ2hhbmdlZChkdXApO1xuICB9XG5cbiAgcHJpdmF0ZSBmaW5pc2hEYXRlQ2hhbmdlZChlOiBDdXN0b21FdmVudDxudW1iZXI+KSB7XG4gICAgY29uc3QgZHVwID0gZnJvbUpTT04odG9KU09OKHRoaXMudGFza0NvbXBsZXRpb24hKSk7XG4gICAgaWYgKGR1cC5zdGFnZSA9PT0gXCJmaW5pc2hlZFwiKSB7XG4gICAgICBkdXAuc3Bhbi5maW5pc2ggPSBlLmRldGFpbDtcbiAgICB9XG4gICAgdGhpcy50YXNrQ29tcGxldGlvbkNoYW5nZWQoZHVwKTtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJ0YXNrLWNvbXBsZXRpb24tcGFuZWxcIiwgVGFza0NvbXBsZXRpb25QYW5lbCk7XG4iLCAiaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHsgQWRkUmVzb3VyY2VPcCwgRGVsZXRlUmVzb3VyY2VPcCB9IGZyb20gXCIuLi9vcHMvcmVzb3VyY2VzXCI7XG5pbXBvcnQgeyBleGVjdXRlT3AgfSBmcm9tIFwiLi4vYWN0aW9uL2V4ZWN1dGVcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBFZGl0UmVzb3VyY2VEZWZpbml0aW9uIH0gZnJvbSBcIi4uL2VkaXQtcmVzb3VyY2UtZGVmaW5pdGlvbi9lZGl0LXJlc291cmNlLWRlZmluaXRpb25cIjtcbmltcG9ydCB7IGljb24gfSBmcm9tIFwiLi4vaWNvbnMvaWNvbnNcIjtcbmltcG9ydCB7IFBsYW5TdGF0dXMsIHVuc3RhcnRlZCB9IGZyb20gXCIuLi9wbGFuX3N0YXR1cy9wbGFuX3N0YXR1c1wiO1xuaW1wb3J0IHsgZGF0ZUNvbnRyb2xWYWx1ZSB9IGZyb20gXCIuLi9kYXRlLWNvbnRyb2wtdXRpbHMvZGF0ZS1jb250cm9sLXV0aWxzXCI7XG5cbi8vIExvbmdlc3QgcmVwcmVzZW50YXRpb24gd2UnbGwgc2hvdyBmb3IgYWxsIHRoZSBvcHRpb25zIG9mIGEgUmVzb3VyY2UuXG5jb25zdCBNQVhfU0hPUlRfU1RSSU5HID0gODA7XG5cbmV4cG9ydCBjbGFzcyBFZGl0UGxhblN0YXJ0RGlhbG9nIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBwcml2YXRlIHN0YXR1czogUGxhblN0YXR1cyA9IHVuc3RhcnRlZDtcbiAgcHJpdmF0ZSBkaWFsb2c6IEhUTUxEaWFsb2dFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcmVzb2x2ZTogKHZhbHVlOiBQbGFuU3RhdHVzIHwgdW5kZWZpbmVkKSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgdGhpcy5kaWFsb2cgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpITtcbiAgICB0aGlzLmRpYWxvZy5hZGRFdmVudExpc3RlbmVyKFwiY2FuY2VsXCIsICgpID0+IHRoaXMucmVzb2x2ZSh1bmRlZmluZWQpKTtcbiAgfVxuXG4gIHN0YXJ0KHN0YXR1czogUGxhblN0YXR1cyk6IFByb21pc2U8UGxhblN0YXR1cyB8IHVuZGVmaW5lZD4ge1xuICAgIGNvbnN0IHJldCA9IG5ldyBQcm9taXNlPFBsYW5TdGF0dXMgfCB1bmRlZmluZWQ+KChyZXNvbHZlLCBfcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgdGhpcy5kaWFsb2chLnNob3dNb2RhbCgpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlcigpIHtcbiAgICByZW5kZXIodGhpcy50ZW1wbGF0ZSgpLCB0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgY2xvc2UoKSB7XG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImRpYWxvZ1wiKSEuY2xvc2UoKTtcbiAgICB0aGlzLnJlc29sdmUodGhpcy5zdGF0dXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBjYW5jZWwoKSB7XG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImRpYWxvZ1wiKSEuY2xvc2UoKTtcbiAgICB0aGlzLnJlc29sdmUodW5kZWZpbmVkKTtcbiAgfVxuXG4gIHByaXZhdGUgZGF0ZUNvbnRyb2xWYWx1ZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0aGlzLnN0YXR1cy5zdGFydCk7XG4gICAgcmV0dXJuIGRhdGVDb250cm9sVmFsdWUoZCk7XG4gIH1cblxuICBwcml2YXRlIHN0YXJ0Q2hhbmdlZChlOiBJbnB1dEV2ZW50KSB7XG4gICAgaWYgKChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5jaGVja2VkKSB7XG4gICAgICB0aGlzLnN0YXR1cy5zdGFnZSA9IFwic3RhcnRlZFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXR1cy5zdGFnZSA9IFwidW5zdGFydGVkXCI7XG4gICAgfVxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBwcml2YXRlIGRhdGVDaGFuZ2VkKGU6IElucHV0RXZlbnQpIHtcbiAgICBjb25zdCBkYXRlID0gKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlQXNEYXRlO1xuICAgIGlmIChkYXRlID09PSBudWxsKSB7XG4gICAgICB0aGlzLnN0YXR1cy5zdGFydCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGUuc2V0SG91cnMoZGF0ZS5nZXRIb3VycygpICsgMTIpO1xuICAgICAgdGhpcy5zdGF0dXMuc3RhcnQgPSBkYXRlLmdldFRpbWUoKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIHJldHVybiBodG1sYFxuICAgICAgPGRpYWxvZz5cbiAgICAgICAgPGgzPlBsYW4gU3RhdHVzPC9oMz5cbiAgICAgICAgPHNwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgLmNoZWNrZWQ9JHt0aGlzLnN0YXR1cy5zdGFnZSA9PT0gXCJzdGFydGVkXCJ9XG4gICAgICAgICAgICBAaW5wdXQ9JHsoZTogSW5wdXRFdmVudCkgPT4gdGhpcy5zdGFydENoYW5nZWQoZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICBTdGFydGVkXG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7dGhpcy5zdGF0dXMuc3RhZ2UgPT09IFwic3RhcnRlZFwiID8gXCJcIiA6IFwiaGlkZGVuXCJ9XCI+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwiZGF0ZVwiXG4gICAgICAgICAgICB2YWx1ZT0ke3RoaXMuZGF0ZUNvbnRyb2xWYWx1ZSgpfVxuICAgICAgICAgICAgQGlucHV0PSR7KGU6IElucHV0RXZlbnQpID0+IHRoaXMuZGF0ZUNoYW5nZWQoZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJkaWFsb2ctZm9vdGVyXCI+XG4gICAgICAgICAgPGJ1dHRvbiBAY2xpY2s9JHsoKSA9PiB0aGlzLmNsb3NlKCl9PkNhbmNlbDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gQGNsaWNrPSR7KCkgPT4gdGhpcy5jbG9zZSgpfT5PSzwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGlhbG9nPlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwiZWRpdC1wbGFuLXN0YXJ0XCIsIEVkaXRQbGFuU3RhcnREaWFsb2cpO1xuIiwgIi8vIEVhY2ggUmVzb3Vyc2UgaGFzIGEga2V5LCB3aGljaCBpcyB0aGUgbmFtZSwgYW5kIGEgbGlzdCBvZiBhY2NlcHRhYmxlIHZhbHVlcy5cbi8vIFRoZSBsaXN0IG9mIHZhbHVlcyBjYW4gbmV2ZXIgYmUgZW1wdHksIGFuZCB0aGUgZmlyc3QgdmFsdWUgaW4gYHZhbHVlc2AgaXMgdGhlXG4vLyBkZWZhdWx0IHZhbHVlIGZvciBhIFJlc291cmNlLlxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9SRVNPVVJDRV9WQUxVRSA9IFwiXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZCB7XG4gIHZhbHVlczogc3RyaW5nW107XG4gIHN0YXRpYzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFJlc291cmNlRGVmaW5pdGlvbiB7XG4gIHZhbHVlczogc3RyaW5nW107XG5cbiAgLy8gVHJ1ZSBpZiB0aGUgUmVzb3VyY2UgaXMgYnVpbHQgaW4gYW5kIGNhbid0IGJlIGVkaXRlZCBvciBkZWxldGVkLlxuICBpc1N0YXRpYzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICB2YWx1ZXM6IHN0cmluZ1tdID0gW0RFRkFVTFRfUkVTT1VSQ0VfVkFMVUVdLFxuICAgIGlzU3RhdGljOiBib29sZWFuID0gZmFsc2VcbiAgKSB7XG4gICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgdGhpcy5pc1N0YXRpYyA9IGlzU3RhdGljO1xuICB9XG5cbiAgdG9KU09OKCk6IFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZXM6IHRoaXMudmFsdWVzLFxuICAgICAgc3RhdGljOiB0aGlzLmlzU3RhdGljLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZnJvbUpTT04oczogUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZCk6IFJlc291cmNlRGVmaW5pdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBSZXNvdXJjZURlZmluaXRpb24ocy52YWx1ZXMsIHMuc3RhdGljKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBSZXNvdXJjZURlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb24gfTtcbmV4cG9ydCB0eXBlIFJlc291cmNlRGVmaW5pdGlvbnNTZXJpYWxpemVkID0ge1xuICBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkO1xufTtcbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCB9IGZyb20gXCJsaXQtaHRtbFwiO1xuXG4vLyBMb29rIG9uIHRoZSBtYWluIGluZGV4IHBhZ2UgZm9yIGFsbCB0aGUgYWxsb3dlZCBuYW1lcy5cbi8vXG4vLyBJbnN0YW50aWF0ZXMgYW4gU1ZHIGljb24gdmlhIHRoZSA8dXNlPiB0YWcuXG5leHBvcnQgY29uc3QgaWNvbiA9IChuYW1lOiBzdHJpbmcpOiBUZW1wbGF0ZVJlc3VsdCA9PiB7XG4gIHJldHVybiBodG1sYFxuICA8c3ZnXG4gICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG4gICAgd2lkdGg9XCIyNFwiXG4gICAgaGVpZ2h0PVwiMjRcIlxuICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICA+XG4gICAgPHVzZSBocmVmPSMke25hbWV9PlxuICA8L3N2Zz5gO1xufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQge1xuICBPcCxcbiAgU3ViT3AsXG4gIFN1Yk9wUmVzdWx0LFxuICBhcHBseUFsbE9wc1RvUGxhbkFuZFRoZW5JbnZlcnNlLFxufSBmcm9tIFwiLi9vcHMudHNcIjtcbmltcG9ydCB7XG4gIERFRkFVTFRfUkVTT1VSQ0VfVkFMVUUsXG4gIFJlc291cmNlRGVmaW5pdGlvbixcbn0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcblxuZXhwb3J0IGNsYXNzIEFkZFJlc291cmNlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuXG4gIGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlOiBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlOiBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSB8IG51bGwgPSBudWxsXG4gICkge1xuICAgIHRoaXMua2V5ID0gbmFtZTtcbiAgICB0aGlzLmRlbGV0ZVJlc291cmNlVW5kb1N0YXRlID0gZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBmb3VuZE1hdGNoID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChmb3VuZE1hdGNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gYWxyZWFkeSBleGlzdHMgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0UmVzb3VyY2VEZWZpbml0aW9uKFxuICAgICAgdGhpcy5rZXksXG4gICAgICAodGhpcy5kZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSAmJlxuICAgICAgICB0aGlzLmRlbGV0ZVJlc291cmNlVW5kb1N0YXRlLnJlc291cmNlRGVmaW5pdGlvbikgfHxcbiAgICAgICAgbmV3IFJlc291cmNlRGVmaW5pdGlvbigpXG4gICAgKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgYWRkIHRoaXMga2V5IGFuZCBzZXQgaXQgdG8gdGhlIGRlZmF1bHQsIHVubGVzc1xuICAgIC8vIHRoZXJlIGlzIG1hdGNoaW5nIGVudHJ5IGluIHRhc2tSZXNvdXJjZVZhbHVlcywgaW4gd2hpY2ggY2FzZSB3ZSB3aWxsIHVzZSB0aGF0IHZhbHVlLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgdGFzay5zZXRSZXNvdXJjZShcbiAgICAgICAgdGhpcy5rZXksXG4gICAgICAgICh0aGlzLmRlbGV0ZVJlc291cmNlVW5kb1N0YXRlICYmXG4gICAgICAgICAgdGhpcy5kZWxldGVSZXNvdXJjZVVuZG9TdGF0ZS50YXNrSW5kZXhUb0RlbGV0ZWRSZXNvdXJjZVZhbHVlLmdldChcbiAgICAgICAgICAgIGluZGV4XG4gICAgICAgICAgKSkgfHxcbiAgICAgICAgICBERUZBVUxUX1JFU09VUkNFX1ZBTFVFXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVJlc291cmNlU3VwT3AodGhpcy5rZXkpO1xuICB9XG59XG5cbmludGVyZmFjZSBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSB7XG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uO1xuICB0YXNrSW5kZXhUb0RlbGV0ZWRSZXNvdXJjZVZhbHVlOiBNYXA8bnVtYmVyLCBzdHJpbmc+O1xufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlUmVzb3VyY2VTdXBPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5rZXkgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmVzb3VyY2VEZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChyZXNvdXJjZURlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgVGhlIHJlc291cmNlIHdpdGggbmFtZSAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhbmQgY2FuJ3QgYmUgZGVsZXRlZC5gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBmcm9tIHJlc291cmNlIGRlZmluaXRpb25zLlxuICAgIHBsYW4uZGVsZXRlUmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcblxuICAgIGNvbnN0IHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWU6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHJlbW92ZSBgdGhpcy5rZXlgIGZyb20gdGhlIHJlc291cmNlcyB3aGlsZSBhbHNvXG4gICAgLy8gYnVpbGRpbmcgdXAgdGhlIGluZm8gbmVlZGVkIGZvciBhIHJldmVydC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRTtcbiAgICAgIHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWUuc2V0KGluZGV4LCB2YWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZVJlc291cmNlKHRoaXMua2V5KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlOiBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSA9IHtcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbjogcmVzb3VyY2VEZWZpbml0aW9uLFxuICAgICAgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZTogdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGUpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlOiBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFJlc291cmNlU3ViT3AodGhpcy5rZXksIGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSA9IFtdIC8vIFRoaXMgc2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgd2hlbiBiZWluZyBjb25zdHJ1Y3RlZCBhcyBhIGludmVyc2Ugb3BlcmF0aW9uLlxuICApIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlID0gaW5kaWNlc09mVGFza3NUb0NoYW5nZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGRlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGRlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2Vzbid0IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG4gICAgY29uc3QgZXhpc3RpbmdJbmRleCA9IGRlZmluaXRpb24udmFsdWVzLmZpbmRJbmRleChcbiAgICAgICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSA9PT0gdGhpcy52YWx1ZVxuICAgICk7XG4gICAgaWYgKGV4aXN0aW5nSW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMudmFsdWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgdmFsdWUgaW4gdGhlIFJlc291cmNlICR7dGhpcy5rZXl9LmBcbiAgICAgICk7XG4gICAgfVxuICAgIGRlZmluaXRpb24udmFsdWVzLnB1c2godGhpcy52YWx1ZSk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHNldCB0aGUgdmFsdWUgZm9yIHRoZSBnaXZlbiBrZXkgZm9yIGFsbCB0aGVcbiAgICAvLyB0YXNrcyBsaXN0ZWQgaW4gYGluZGljZXNPZlRhc2tzVG9DaGFuZ2VgLlxuICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZS5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLnZhbHVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3AoXG4gICAgICB0aGlzLmtleSxcbiAgICAgIHRoaXMudmFsdWUsXG4gICAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2VcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSA9IFtdXG4gICkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UgPSBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXNuJ3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZUluZGV4ID0gZGVmaW5pdGlvbi52YWx1ZXMuZmluZEluZGV4KFxuICAgICAgKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlID09PSB0aGlzLnZhbHVlXG4gICAgKTtcbiAgICBpZiAodmFsdWVJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy52YWx1ZX0gZG9lcyBub3QgZXhpc3QgYXMgYSB2YWx1ZSBpbiB0aGUgUmVzb3VyY2UgJHt0aGlzLmtleX0uYFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGRlZmluaXRpb24udmFsdWVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgUmVzb3VyY2VzIG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgdmFsdWUuICR7dGhpcy52YWx1ZX0gb25seSBoYXMgb25lIHZhbHVlLCBzbyBpdCBjYW4ndCBiZSBkZWxldGVkLiBgXG4gICAgICApO1xuICAgIH1cblxuICAgIGRlZmluaXRpb24udmFsdWVzLnNwbGljZSh2YWx1ZUluZGV4LCAxKTtcblxuICAgIC8vIE5vdyBpdGVyYXRlIHRob3VnaCBhbGwgdGhlIHRhc2tzIGFuZCBjaGFuZ2UgYWxsIHRhc2tzIHRoYXQgaGF2ZVxuICAgIC8vIFwia2V5OnZhbHVlXCIgdG8gaW5zdGVhZCBiZSBcImtleTpkZWZhdWx0XCIuIFJlY29yZCB3aGljaCB0YXNrcyBnb3QgY2hhbmdlZFxuICAgIC8vIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGF0IGluZm9ybWF0aW9uIHdoZW4gd2UgY3JlYXRlIHRoZSBpbnZlcnQgb3BlcmF0aW9uLlxuXG4gICAgY29uc3QgaW5kaWNlc09mVGFza3NXaXRoTWF0Y2hpbmdSZXNvdXJjZVZhbHVlczogbnVtYmVyW10gPSBbXTtcblxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgcmVzb3VyY2VWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpO1xuICAgICAgaWYgKHJlc291cmNlVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocmVzb3VyY2VWYWx1ZSAhPT0gdGhpcy52YWx1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFNpbmNlIHRoZSB2YWx1ZSBpcyBubyBsb25nZXIgdmFsaWQgd2UgY2hhbmdlIGl0IGJhY2sgdG8gdGhlIGRlZmF1bHQuXG4gICAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCBkZWZpbml0aW9uLnZhbHVlc1swXSk7XG5cbiAgICAgIC8vIFJlY29yZCB3aGljaCB0YXNrIHdlIGp1c3QgY2hhbmdlZC5cbiAgICAgIGluZGljZXNPZlRhc2tzV2l0aE1hdGNoaW5nUmVzb3VyY2VWYWx1ZXMucHVzaChpbmRleCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShpbmRpY2VzT2ZUYXNrc1dpdGhNYXRjaGluZ1Jlc291cmNlVmFsdWVzKSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW52ZXJzZShpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFJlc291cmNlT3B0aW9uU3ViT3AoXG4gICAgICB0aGlzLmtleSxcbiAgICAgIHRoaXMudmFsdWUsXG4gICAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lUmVzb3VyY2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgb2xkS2V5OiBzdHJpbmc7XG4gIG5ld0tleTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9sZEtleTogc3RyaW5nLCBuZXdLZXk6IHN0cmluZykge1xuICAgIHRoaXMub2xkS2V5ID0gb2xkS2V5O1xuICAgIHRoaXMubmV3S2V5ID0gbmV3S2V5O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3Qgb2xkRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMub2xkS2V5KTtcbiAgICBpZiAob2xkRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5vbGRLZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBuZXdLZXkgaXMgbm90IGFscmVhZHkgdXNlZC5cbiAgICBjb25zdCBuZXdLZXlEZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5uZXdLZXkpO1xuICAgIGlmIChuZXdLZXlEZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld0tleX0gYWxyZWFkeSBleGlzdHMgYXMgYSByZXNvdXJjZSBuYW1lLmApO1xuICAgIH1cblxuICAgIHBsYW4uZGVsZXRlUmVzb3VyY2VEZWZpbml0aW9uKHRoaXMub2xkS2V5KTtcbiAgICBwbGFuLnNldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLm5ld0tleSwgb2xkRGVmaW5pdGlvbik7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGNoYW5nZSBvbGRLZXkgLT4gbmV3a2V5IGZvciB0aGUgZ2l2ZW4gcmVzb3VyY2Uga2V5LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFZhbHVlID1cbiAgICAgICAgdGFzay5nZXRSZXNvdXJjZSh0aGlzLm9sZEtleSkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRTtcbiAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5uZXdLZXksIGN1cnJlbnRWYWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZVJlc291cmNlKHRoaXMub2xkS2V5KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW5hbWVSZXNvdXJjZVN1Yk9wKHRoaXMubmV3S2V5LCB0aGlzLm9sZEtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmFtZVJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICBvbGRWYWx1ZTogc3RyaW5nO1xuICBuZXdWYWx1ZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGtleTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nLCBuZXdWYWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy5vbGRWYWx1ZSA9IG9sZFZhbHVlO1xuICAgIHRoaXMubmV3VmFsdWUgPSBuZXdWYWx1ZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlybSB0aGUgb2xkVmFsdWUgaXMgaW4gdGhlcmUuXG4gICAgY29uc3Qgb2xkVmFsdWVJbmRleCA9IGZvdW5kTWF0Y2gudmFsdWVzLmluZGV4T2YodGhpcy5vbGRWYWx1ZSk7XG5cbiAgICBpZiAob2xkVmFsdWVJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgYSB2YWx1ZSAke3RoaXMub2xkVmFsdWV9YCk7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlybSB0aGUgbmV3VmFsdWUgaXMgbm90IGluIHRoZXJlLlxuICAgIGNvbnN0IG5ld1ZhbHVlSW5kZXggPSBmb3VuZE1hdGNoLnZhbHVlcy5pbmRleE9mKHRoaXMubmV3VmFsdWUpO1xuICAgIGlmIChuZXdWYWx1ZUluZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBhbHJlYWR5IGhhcyBhIHZhbHVlICR7dGhpcy5uZXdWYWx1ZX1gKTtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHRoZSB2YWx1ZXMuXG4gICAgZm91bmRNYXRjaC52YWx1ZXMuc3BsaWNlKG9sZFZhbHVlSW5kZXgsIDEsIHRoaXMubmV3VmFsdWUpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBjaGFuZ2Ugb2xkVmFsdWUgLT4gbmV3VmFsdWUgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KTtcbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHRoaXMub2xkVmFsdWUpIHtcbiAgICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLmtleSwgdGhpcy5uZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy5uZXdWYWx1ZSxcbiAgICAgIHRoaXMub2xkVmFsdWVcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNb3ZlUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIG9sZEluZGV4OiBudW1iZXI7XG4gIG5ld0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBudW1iZXIsIG5ld1ZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLm9sZEluZGV4ID0gb2xkVmFsdWU7XG4gICAgdGhpcy5uZXdJbmRleCA9IG5ld1ZhbHVlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5uZXdJbmRleCA8IDApIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld0luZGV4fSBpcyBub3QgYSB2YWxpZCB0YXJnZXQgdmFsdWUuYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub2xkSW5kZXggPiBkZWZpbml0aW9uLnZhbHVlcy5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMua2V5fSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUgYXQgaW5kZXggJHt0aGlzLm9sZEluZGV4fWBcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh0aGlzLm5ld0luZGV4ID4gZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIGF0IGluZGV4ICR7dGhpcy5uZXdJbmRleH1gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFN3YXAgdGhlIHZhbHVlcy5cbiAgICBjb25zdCB0bXAgPSBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm9sZEluZGV4XTtcbiAgICBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm9sZEluZGV4XSA9IGRlZmluaXRpb24udmFsdWVzW3RoaXMubmV3SW5kZXhdO1xuICAgIGRlZmluaXRpb24udmFsdWVzW3RoaXMubmV3SW5kZXhdID0gdG1wO1xuXG4gICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyB3aXRoIFRhc2tzIGJlY2F1c2UgdGhlIGluZGV4IG9mIGEgdmFsdWUgaXNcbiAgICAvLyBpcnJlbGV2YW50IHNpbmNlIHdlIHN0b3JlIHRoZSB2YWx1ZSBpdHNlbGYsIG5vdCB0aGUgaW5kZXguXG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgTW92ZVJlc291cmNlT3B0aW9uU3ViT3AodGhpcy5rZXksIHRoaXMubmV3SW5kZXgsIHRoaXMub2xkSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRSZXNvdXJjZVZhbHVlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZywgdGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBmb3VuZE1hdGNoID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChmb3VuZE1hdGNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIGNvbnN0IGZvdW5kVmFsdWVNYXRjaCA9IGZvdW5kTWF0Y2gudmFsdWVzLmZpbmRJbmRleCgodjogc3RyaW5nKSA9PiB7XG4gICAgICByZXR1cm4gdiA9PT0gdGhpcy52YWx1ZTtcbiAgICB9KTtcbiAgICBpZiAoZm91bmRWYWx1ZU1hdGNoID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUgb2YgJHt0aGlzLnZhbHVlfWApO1xuICAgIH1cbiAgICBpZiAodGhpcy50YXNrSW5kZXggPCAwIHx8IHRoaXMudGFza0luZGV4ID49IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFRoZXJlIGlzIG5vIFRhc2sgYXQgaW5kZXggJHt0aGlzLnRhc2tJbmRleH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YXNrID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF07XG4gICAgY29uc3Qgb2xkVmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KSE7XG4gICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLmtleSwgdGhpcy52YWx1ZSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkVmFsdWUpIH0pO1xuICB9XG5cbiAgaW52ZXJzZShvbGRWYWx1ZTogc3RyaW5nKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wKHRoaXMua2V5LCBvbGRWYWx1ZSwgdGhpcy50YXNrSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRSZXNvdXJjZU9wKG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZFJlc291cmNlU3ViT3AobmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZVJlc291cmNlT3AobmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgRGVsZXRlUmVzb3VyY2VTdXBPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkUmVzb3VyY2VPcHRpb25PcChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZFJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCB2YWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZVJlc291cmNlT3B0aW9uT3Aoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgdmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5hbWVSZXNvdXJjZU9wdGlvbk9wKFxuICBrZXk6IHN0cmluZyxcbiAgb2xkVmFsdWU6IHN0cmluZyxcbiAgbmV3VmFsdWU6IHN0cmluZ1xuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmFtZVJlc291cmNlT3Aob2xkVmFsdWU6IHN0cmluZywgbmV3VmFsdWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJlbmFtZVJlc291cmNlU3ViT3Aob2xkVmFsdWUsIG5ld1ZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTW92ZVJlc291cmNlT3B0aW9uT3AoXG4gIGtleTogc3RyaW5nLFxuICBvbGRJbmRleDogbnVtYmVyLFxuICBuZXdJbmRleDogbnVtYmVyXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBNb3ZlUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIG9sZEluZGV4LCBuZXdJbmRleCldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldFJlc291cmNlVmFsdWVPcChcbiAga2V5OiBzdHJpbmcsXG4gIHZhbHVlOiBzdHJpbmcsXG4gIHRhc2tJbmRleDogbnVtYmVyXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRSZXNvdXJjZVZhbHVlU3ViT3Aoa2V5LCB2YWx1ZSwgdGFza0luZGV4KV0pO1xufVxuIiwgIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDE3IEdvb2dsZSBMTENcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBCU0QtMy1DbGF1c2VcbiAqL1xuXG5pbXBvcnQge0Rpc2Nvbm5lY3RhYmxlLCBQYXJ0fSBmcm9tICcuL2xpdC1odG1sLmpzJztcblxuZXhwb3J0IHtcbiAgQXR0cmlidXRlUGFydCxcbiAgQm9vbGVhbkF0dHJpYnV0ZVBhcnQsXG4gIENoaWxkUGFydCxcbiAgRWxlbWVudFBhcnQsXG4gIEV2ZW50UGFydCxcbiAgUGFydCxcbiAgUHJvcGVydHlQYXJ0LFxufSBmcm9tICcuL2xpdC1odG1sLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVDbGFzcyB7XG4gIG5ldyAocGFydDogUGFydEluZm8pOiBEaXJlY3RpdmU7XG59XG5cbi8qKlxuICogVGhpcyB1dGlsaXR5IHR5cGUgZXh0cmFjdHMgdGhlIHNpZ25hdHVyZSBvZiBhIGRpcmVjdGl2ZSBjbGFzcydzIHJlbmRlcigpXG4gKiBtZXRob2Qgc28gd2UgY2FuIHVzZSBpdCBmb3IgdGhlIHR5cGUgb2YgdGhlIGdlbmVyYXRlZCBkaXJlY3RpdmUgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCB0eXBlIERpcmVjdGl2ZVBhcmFtZXRlcnM8QyBleHRlbmRzIERpcmVjdGl2ZT4gPSBQYXJhbWV0ZXJzPENbJ3JlbmRlciddPjtcblxuLyoqXG4gKiBBIGdlbmVyYXRlZCBkaXJlY3RpdmUgZnVuY3Rpb24gZG9lc24ndCBldmFsdWF0ZSB0aGUgZGlyZWN0aXZlLCBidXQganVzdFxuICogcmV0dXJucyBhIERpcmVjdGl2ZVJlc3VsdCBvYmplY3QgdGhhdCBjYXB0dXJlcyB0aGUgYXJndW1lbnRzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGl2ZVJlc3VsdDxDIGV4dGVuZHMgRGlyZWN0aXZlQ2xhc3MgPSBEaXJlY3RpdmVDbGFzcz4ge1xuICAvKipcbiAgICogVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBbJ18kbGl0RGlyZWN0aXZlJCddOiBDO1xuICAvKiogQGludGVybmFsICovXG4gIHZhbHVlczogRGlyZWN0aXZlUGFyYW1ldGVyczxJbnN0YW5jZVR5cGU8Qz4+O1xufVxuXG5leHBvcnQgY29uc3QgUGFydFR5cGUgPSB7XG4gIEFUVFJJQlVURTogMSxcbiAgQ0hJTEQ6IDIsXG4gIFBST1BFUlRZOiAzLFxuICBCT09MRUFOX0FUVFJJQlVURTogNCxcbiAgRVZFTlQ6IDUsXG4gIEVMRU1FTlQ6IDYsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBQYXJ0VHlwZSA9ICh0eXBlb2YgUGFydFR5cGUpW2tleW9mIHR5cGVvZiBQYXJ0VHlwZV07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hpbGRQYXJ0SW5mbyB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBQYXJ0VHlwZS5DSElMRDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBdHRyaWJ1dGVQYXJ0SW5mbyB7XG4gIHJlYWRvbmx5IHR5cGU6XG4gICAgfCB0eXBlb2YgUGFydFR5cGUuQVRUUklCVVRFXG4gICAgfCB0eXBlb2YgUGFydFR5cGUuUFJPUEVSVFlcbiAgICB8IHR5cGVvZiBQYXJ0VHlwZS5CT09MRUFOX0FUVFJJQlVURVxuICAgIHwgdHlwZW9mIFBhcnRUeXBlLkVWRU5UO1xuICByZWFkb25seSBzdHJpbmdzPzogUmVhZG9ubHlBcnJheTxzdHJpbmc+O1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IHRhZ05hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbGVtZW50UGFydEluZm8ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgUGFydFR5cGUuRUxFTUVOVDtcbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgcGFydCBhIGRpcmVjdGl2ZSBpcyBib3VuZCB0by5cbiAqXG4gKiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2hlY2tpbmcgdGhhdCBhIGRpcmVjdGl2ZSBpcyBhdHRhY2hlZCB0byBhIHZhbGlkIHBhcnQsXG4gKiBzdWNoIGFzIHdpdGggZGlyZWN0aXZlIHRoYXQgY2FuIG9ubHkgYmUgdXNlZCBvbiBhdHRyaWJ1dGUgYmluZGluZ3MuXG4gKi9cbmV4cG9ydCB0eXBlIFBhcnRJbmZvID0gQ2hpbGRQYXJ0SW5mbyB8IEF0dHJpYnV0ZVBhcnRJbmZvIHwgRWxlbWVudFBhcnRJbmZvO1xuXG4vKipcbiAqIENyZWF0ZXMgYSB1c2VyLWZhY2luZyBkaXJlY3RpdmUgZnVuY3Rpb24gZnJvbSBhIERpcmVjdGl2ZSBjbGFzcy4gVGhpc1xuICogZnVuY3Rpb24gaGFzIHRoZSBzYW1lIHBhcmFtZXRlcnMgYXMgdGhlIGRpcmVjdGl2ZSdzIHJlbmRlcigpIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGRpcmVjdGl2ZSA9XG4gIDxDIGV4dGVuZHMgRGlyZWN0aXZlQ2xhc3M+KGM6IEMpID0+XG4gICguLi52YWx1ZXM6IERpcmVjdGl2ZVBhcmFtZXRlcnM8SW5zdGFuY2VUeXBlPEM+Pik6IERpcmVjdGl2ZVJlc3VsdDxDPiA9PiAoe1xuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgWydfJGxpdERpcmVjdGl2ZSQnXTogYyxcbiAgICB2YWx1ZXMsXG4gIH0pO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGNyZWF0aW5nIGN1c3RvbSBkaXJlY3RpdmVzLiBVc2VycyBzaG91bGQgZXh0ZW5kIHRoaXMgY2xhc3MsXG4gKiBpbXBsZW1lbnQgYHJlbmRlcmAgYW5kL29yIGB1cGRhdGVgLCBhbmQgdGhlbiBwYXNzIHRoZWlyIHN1YmNsYXNzIHRvXG4gKiBgZGlyZWN0aXZlYC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERpcmVjdGl2ZSBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgLy9AaW50ZXJuYWxcbiAgX19wYXJ0ITogUGFydDtcbiAgLy9AaW50ZXJuYWxcbiAgX19hdHRyaWJ1dGVJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAvL0BpbnRlcm5hbFxuICBfX2RpcmVjdGl2ZT86IERpcmVjdGl2ZTtcblxuICAvL0BpbnRlcm5hbFxuICBfJHBhcmVudCE6IERpc2Nvbm5lY3RhYmxlO1xuXG4gIC8vIFRoZXNlIHdpbGwgb25seSBleGlzdCBvbiB0aGUgQXN5bmNEaXJlY3RpdmUgc3ViY2xhc3NcbiAgLy9AaW50ZXJuYWxcbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPjtcbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgLy9AaW50ZXJuYWxcbiAgWydfJG5vdGlmeURpcmVjdGl2ZUNvbm5lY3Rpb25DaGFuZ2VkJ10/KGlzQ29ubmVjdGVkOiBib29sZWFuKTogdm9pZDtcblxuICBjb25zdHJ1Y3RvcihfcGFydEluZm86IFBhcnRJbmZvKSB7fVxuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQuXyRpc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRpbml0aWFsaXplKFxuICAgIHBhcnQ6IFBhcnQsXG4gICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSxcbiAgICBhdHRyaWJ1dGVJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHRoaXMuX19wYXJ0ID0gcGFydDtcbiAgICB0aGlzLl8kcGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMuX19hdHRyaWJ1dGVJbmRleCA9IGF0dHJpYnV0ZUluZGV4O1xuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRyZXNvbHZlKHBhcnQ6IFBhcnQsIHByb3BzOiBBcnJheTx1bmtub3duPik6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZShwYXJ0LCBwcm9wcyk7XG4gIH1cblxuICBhYnN0cmFjdCByZW5kZXIoLi4ucHJvcHM6IEFycmF5PHVua25vd24+KTogdW5rbm93bjtcblxuICB1cGRhdGUoX3BhcnQ6IFBhcnQsIHByb3BzOiBBcnJheTx1bmtub3duPik6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLnJlbmRlciguLi5wcm9wcyk7XG4gIH1cbn1cbiIsICIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAyMCBHb29nbGUgTExDXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQlNELTMtQ2xhdXNlXG4gKi9cblxuaW1wb3J0IHtcbiAgXyRMSCxcbiAgUGFydCxcbiAgRGlyZWN0aXZlUGFyZW50LFxuICBDb21waWxlZFRlbXBsYXRlUmVzdWx0LFxuICBNYXliZUNvbXBpbGVkVGVtcGxhdGVSZXN1bHQsXG4gIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCxcbn0gZnJvbSAnLi9saXQtaHRtbC5qcyc7XG5pbXBvcnQge1xuICBEaXJlY3RpdmVSZXN1bHQsXG4gIERpcmVjdGl2ZUNsYXNzLFxuICBQYXJ0SW5mbyxcbiAgQXR0cmlidXRlUGFydEluZm8sXG59IGZyb20gJy4vZGlyZWN0aXZlLmpzJztcbnR5cGUgUHJpbWl0aXZlID0gbnVsbCB8IHVuZGVmaW5lZCB8IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmcgfCBzeW1ib2wgfCBiaWdpbnQ7XG5cbmNvbnN0IHtfQ2hpbGRQYXJ0OiBDaGlsZFBhcnR9ID0gXyRMSDtcblxudHlwZSBDaGlsZFBhcnQgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIENoaWxkUGFydD47XG5cbmNvbnN0IEVOQUJMRV9TSEFEWURPTV9OT1BBVENIID0gdHJ1ZTtcblxuY29uc3Qgd3JhcCA9XG4gIEVOQUJMRV9TSEFEWURPTV9OT1BBVENIICYmXG4gIHdpbmRvdy5TaGFkeURPTT8uaW5Vc2UgJiZcbiAgd2luZG93LlNoYWR5RE9NPy5ub1BhdGNoID09PSB0cnVlXG4gICAgPyB3aW5kb3cuU2hhZHlET00hLndyYXBcbiAgICA6IChub2RlOiBOb2RlKSA9PiBub2RlO1xuXG4vKipcbiAqIFRlc3RzIGlmIGEgdmFsdWUgaXMgYSBwcmltaXRpdmUgdmFsdWUuXG4gKlxuICogU2VlIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXR5cGVvZi1vcGVyYXRvclxuICovXG5leHBvcnQgY29uc3QgaXNQcmltaXRpdmUgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBQcmltaXRpdmUgPT5cbiAgdmFsdWUgPT09IG51bGwgfHwgKHR5cGVvZiB2YWx1ZSAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUgIT0gJ2Z1bmN0aW9uJyk7XG5cbmV4cG9ydCBjb25zdCBUZW1wbGF0ZVJlc3VsdFR5cGUgPSB7XG4gIEhUTUw6IDEsXG4gIFNWRzogMixcbiAgTUFUSE1MOiAzLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IHR5cGUgVGVtcGxhdGVSZXN1bHRUeXBlID1cbiAgKHR5cGVvZiBUZW1wbGF0ZVJlc3VsdFR5cGUpW2tleW9mIHR5cGVvZiBUZW1wbGF0ZVJlc3VsdFR5cGVdO1xuXG50eXBlIElzVGVtcGxhdGVSZXN1bHQgPSB7XG4gICh2YWw6IHVua25vd24pOiB2YWwgaXMgTWF5YmVDb21waWxlZFRlbXBsYXRlUmVzdWx0O1xuICA8VCBleHRlbmRzIFRlbXBsYXRlUmVzdWx0VHlwZT4oXG4gICAgdmFsOiB1bmtub3duLFxuICAgIHR5cGU6IFRcbiAgKTogdmFsIGlzIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUPjtcbn07XG5cbi8qKlxuICogVGVzdHMgaWYgYSB2YWx1ZSBpcyBhIFRlbXBsYXRlUmVzdWx0IG9yIGEgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzVGVtcGxhdGVSZXN1bHQ6IElzVGVtcGxhdGVSZXN1bHQgPSAoXG4gIHZhbHVlOiB1bmtub3duLFxuICB0eXBlPzogVGVtcGxhdGVSZXN1bHRUeXBlXG4pOiB2YWx1ZSBpcyBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQgPT5cbiAgdHlwZSA9PT0gdW5kZWZpbmVkXG4gICAgPyAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgICAgKHZhbHVlIGFzIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCk/LlsnXyRsaXRUeXBlJCddICE9PSB1bmRlZmluZWRcbiAgICA6ICh2YWx1ZSBhcyBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQpPy5bJ18kbGl0VHlwZSQnXSA9PT0gdHlwZTtcblxuLyoqXG4gKiBUZXN0cyBpZiBhIHZhbHVlIGlzIGEgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdCA9IChcbiAgdmFsdWU6IHVua25vd25cbik6IHZhbHVlIGlzIENvbXBpbGVkVGVtcGxhdGVSZXN1bHQgPT4ge1xuICByZXR1cm4gKHZhbHVlIGFzIENvbXBpbGVkVGVtcGxhdGVSZXN1bHQpPy5bJ18kbGl0VHlwZSQnXT8uaCAhPSBudWxsO1xufTtcblxuLyoqXG4gKiBUZXN0cyBpZiBhIHZhbHVlIGlzIGEgRGlyZWN0aXZlUmVzdWx0LlxuICovXG5leHBvcnQgY29uc3QgaXNEaXJlY3RpdmVSZXN1bHQgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBEaXJlY3RpdmVSZXN1bHQgPT5cbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgKHZhbHVlIGFzIERpcmVjdGl2ZVJlc3VsdCk/LlsnXyRsaXREaXJlY3RpdmUkJ10gIT09IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIERpcmVjdGl2ZSBjbGFzcyBmb3IgYSBEaXJlY3RpdmVSZXN1bHRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldERpcmVjdGl2ZUNsYXNzID0gKHZhbHVlOiB1bmtub3duKTogRGlyZWN0aXZlQ2xhc3MgfCB1bmRlZmluZWQgPT5cbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgKHZhbHVlIGFzIERpcmVjdGl2ZVJlc3VsdCk/LlsnXyRsaXREaXJlY3RpdmUkJ107XG5cbi8qKlxuICogVGVzdHMgd2hldGhlciBhIHBhcnQgaGFzIG9ubHkgYSBzaW5nbGUtZXhwcmVzc2lvbiB3aXRoIG5vIHN0cmluZ3MgdG9cbiAqIGludGVycG9sYXRlIGJldHdlZW4uXG4gKlxuICogT25seSBBdHRyaWJ1dGVQYXJ0IGFuZCBQcm9wZXJ0eVBhcnQgY2FuIGhhdmUgbXVsdGlwbGUgZXhwcmVzc2lvbnMuXG4gKiBNdWx0aS1leHByZXNzaW9uIHBhcnRzIGhhdmUgYSBgc3RyaW5nc2AgcHJvcGVydHkgYW5kIHNpbmdsZS1leHByZXNzaW9uXG4gKiBwYXJ0cyBkbyBub3QuXG4gKi9cbmV4cG9ydCBjb25zdCBpc1NpbmdsZUV4cHJlc3Npb24gPSAocGFydDogUGFydEluZm8pID0+XG4gIChwYXJ0IGFzIEF0dHJpYnV0ZVBhcnRJbmZvKS5zdHJpbmdzID09PSB1bmRlZmluZWQ7XG5cbmNvbnN0IGNyZWF0ZU1hcmtlciA9ICgpID0+IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpO1xuXG4vKipcbiAqIEluc2VydHMgYSBDaGlsZFBhcnQgaW50byB0aGUgZ2l2ZW4gY29udGFpbmVyIENoaWxkUGFydCdzIERPTSwgZWl0aGVyIGF0IHRoZVxuICogZW5kIG9mIHRoZSBjb250YWluZXIgQ2hpbGRQYXJ0LCBvciBiZWZvcmUgdGhlIG9wdGlvbmFsIGByZWZQYXJ0YC5cbiAqXG4gKiBUaGlzIGRvZXMgbm90IGFkZCB0aGUgcGFydCB0byB0aGUgY29udGFpbmVyUGFydCdzIGNvbW1pdHRlZCB2YWx1ZS4gVGhhdCBtdXN0XG4gKiBiZSBkb25lIGJ5IGNhbGxlcnMuXG4gKlxuICogQHBhcmFtIGNvbnRhaW5lclBhcnQgUGFydCB3aXRoaW4gd2hpY2ggdG8gYWRkIHRoZSBuZXcgQ2hpbGRQYXJ0XG4gKiBAcGFyYW0gcmVmUGFydCBQYXJ0IGJlZm9yZSB3aGljaCB0byBhZGQgdGhlIG5ldyBDaGlsZFBhcnQ7IHdoZW4gb21pdHRlZCB0aGVcbiAqICAgICBwYXJ0IGFkZGVkIHRvIHRoZSBlbmQgb2YgdGhlIGBjb250YWluZXJQYXJ0YFxuICogQHBhcmFtIHBhcnQgUGFydCB0byBpbnNlcnQsIG9yIHVuZGVmaW5lZCB0byBjcmVhdGUgYSBuZXcgcGFydFxuICovXG5leHBvcnQgY29uc3QgaW5zZXJ0UGFydCA9IChcbiAgY29udGFpbmVyUGFydDogQ2hpbGRQYXJ0LFxuICByZWZQYXJ0PzogQ2hpbGRQYXJ0LFxuICBwYXJ0PzogQ2hpbGRQYXJ0XG4pOiBDaGlsZFBhcnQgPT4ge1xuICBjb25zdCBjb250YWluZXIgPSB3cmFwKGNvbnRhaW5lclBhcnQuXyRzdGFydE5vZGUpLnBhcmVudE5vZGUhO1xuXG4gIGNvbnN0IHJlZk5vZGUgPVxuICAgIHJlZlBhcnQgPT09IHVuZGVmaW5lZCA/IGNvbnRhaW5lclBhcnQuXyRlbmROb2RlIDogcmVmUGFydC5fJHN0YXJ0Tm9kZTtcblxuICBpZiAocGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qgc3RhcnROb2RlID0gd3JhcChjb250YWluZXIpLmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgcmVmTm9kZSk7XG4gICAgY29uc3QgZW5kTm9kZSA9IHdyYXAoY29udGFpbmVyKS5pbnNlcnRCZWZvcmUoY3JlYXRlTWFya2VyKCksIHJlZk5vZGUpO1xuICAgIHBhcnQgPSBuZXcgQ2hpbGRQYXJ0KFxuICAgICAgc3RhcnROb2RlLFxuICAgICAgZW5kTm9kZSxcbiAgICAgIGNvbnRhaW5lclBhcnQsXG4gICAgICBjb250YWluZXJQYXJ0Lm9wdGlvbnNcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGVuZE5vZGUgPSB3cmFwKHBhcnQuXyRlbmROb2RlISkubmV4dFNpYmxpbmc7XG4gICAgY29uc3Qgb2xkUGFyZW50ID0gcGFydC5fJHBhcmVudDtcbiAgICBjb25zdCBwYXJlbnRDaGFuZ2VkID0gb2xkUGFyZW50ICE9PSBjb250YWluZXJQYXJ0O1xuICAgIGlmIChwYXJlbnRDaGFuZ2VkKSB7XG4gICAgICBwYXJ0Ll8kcmVwYXJlbnREaXNjb25uZWN0YWJsZXM/Lihjb250YWluZXJQYXJ0KTtcbiAgICAgIC8vIE5vdGUgdGhhdCBhbHRob3VnaCBgXyRyZXBhcmVudERpc2Nvbm5lY3RhYmxlc2AgdXBkYXRlcyB0aGUgcGFydCdzXG4gICAgICAvLyBgXyRwYXJlbnRgIHJlZmVyZW5jZSBhZnRlciB1bmxpbmtpbmcgZnJvbSBpdHMgY3VycmVudCBwYXJlbnQsIHRoYXRcbiAgICAgIC8vIG1ldGhvZCBvbmx5IGV4aXN0cyBpZiBEaXNjb25uZWN0YWJsZXMgYXJlIHByZXNlbnQsIHNvIHdlIG5lZWQgdG9cbiAgICAgIC8vIHVuY29uZGl0aW9uYWxseSBzZXQgaXQgaGVyZVxuICAgICAgcGFydC5fJHBhcmVudCA9IGNvbnRhaW5lclBhcnQ7XG4gICAgICAvLyBTaW5jZSB0aGUgXyRpc0Nvbm5lY3RlZCBnZXR0ZXIgaXMgc29tZXdoYXQgY29zdGx5LCBvbmx5XG4gICAgICAvLyByZWFkIGl0IG9uY2Ugd2Uga25vdyB0aGUgc3VidHJlZSBoYXMgZGlyZWN0aXZlcyB0aGF0IG5lZWRcbiAgICAgIC8vIHRvIGJlIG5vdGlmaWVkXG4gICAgICBsZXQgbmV3Q29ubmVjdGlvblN0YXRlO1xuICAgICAgaWYgKFxuICAgICAgICBwYXJ0Ll8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAobmV3Q29ubmVjdGlvblN0YXRlID0gY29udGFpbmVyUGFydC5fJGlzQ29ubmVjdGVkKSAhPT1cbiAgICAgICAgICBvbGRQYXJlbnQhLl8kaXNDb25uZWN0ZWRcbiAgICAgICkge1xuICAgICAgICBwYXJ0Ll8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQobmV3Q29ubmVjdGlvblN0YXRlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVuZE5vZGUgIT09IHJlZk5vZGUgfHwgcGFyZW50Q2hhbmdlZCkge1xuICAgICAgbGV0IHN0YXJ0OiBOb2RlIHwgbnVsbCA9IHBhcnQuXyRzdGFydE5vZGU7XG4gICAgICB3aGlsZSAoc3RhcnQgIT09IGVuZE5vZGUpIHtcbiAgICAgICAgY29uc3QgbjogTm9kZSB8IG51bGwgPSB3cmFwKHN0YXJ0ISkubmV4dFNpYmxpbmc7XG4gICAgICAgIHdyYXAoY29udGFpbmVyKS5pbnNlcnRCZWZvcmUoc3RhcnQhLCByZWZOb2RlKTtcbiAgICAgICAgc3RhcnQgPSBuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXJ0O1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIFBhcnQuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZCB0byBzZXQvdXBkYXRlIHRoZSB2YWx1ZSBvZiB1c2VyLWNyZWF0ZWRcbiAqIHBhcnRzIChpLmUuIHRob3NlIGNyZWF0ZWQgdXNpbmcgYGluc2VydFBhcnRgKTsgaXQgc2hvdWxkIG5vdCBiZSB1c2VkXG4gKiBieSBkaXJlY3RpdmVzIHRvIHNldCB0aGUgdmFsdWUgb2YgdGhlIGRpcmVjdGl2ZSdzIGNvbnRhaW5lciBwYXJ0LiBEaXJlY3RpdmVzXG4gKiBzaG91bGQgcmV0dXJuIGEgdmFsdWUgZnJvbSBgdXBkYXRlYC9gcmVuZGVyYCB0byB1cGRhdGUgdGhlaXIgcGFydCBzdGF0ZS5cbiAqXG4gKiBGb3IgZGlyZWN0aXZlcyB0aGF0IHJlcXVpcmUgc2V0dGluZyB0aGVpciBwYXJ0IHZhbHVlIGFzeW5jaHJvbm91c2x5LCB0aGV5XG4gKiBzaG91bGQgZXh0ZW5kIGBBc3luY0RpcmVjdGl2ZWAgYW5kIGNhbGwgYHRoaXMuc2V0VmFsdWUoKWAuXG4gKlxuICogQHBhcmFtIHBhcnQgUGFydCB0byBzZXRcbiAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byBzZXRcbiAqIEBwYXJhbSBpbmRleCBGb3IgYEF0dHJpYnV0ZVBhcnRgcywgdGhlIGluZGV4IHRvIHNldFxuICogQHBhcmFtIGRpcmVjdGl2ZVBhcmVudCBVc2VkIGludGVybmFsbHk7IHNob3VsZCBub3QgYmUgc2V0IGJ5IHVzZXJcbiAqL1xuZXhwb3J0IGNvbnN0IHNldENoaWxkUGFydFZhbHVlID0gPFQgZXh0ZW5kcyBDaGlsZFBhcnQ+KFxuICBwYXJ0OiBULFxuICB2YWx1ZTogdW5rbm93bixcbiAgZGlyZWN0aXZlUGFyZW50OiBEaXJlY3RpdmVQYXJlbnQgPSBwYXJ0XG4pOiBUID0+IHtcbiAgcGFydC5fJHNldFZhbHVlKHZhbHVlLCBkaXJlY3RpdmVQYXJlbnQpO1xuICByZXR1cm4gcGFydDtcbn07XG5cbi8vIEEgc2VudGluZWwgdmFsdWUgdGhhdCBjYW4gbmV2ZXIgYXBwZWFyIGFzIGEgcGFydCB2YWx1ZSBleGNlcHQgd2hlbiBzZXQgYnlcbi8vIGxpdmUoKS4gVXNlZCB0byBmb3JjZSBhIGRpcnR5LWNoZWNrIHRvIGZhaWwgYW5kIGNhdXNlIGEgcmUtcmVuZGVyLlxuY29uc3QgUkVTRVRfVkFMVUUgPSB7fTtcblxuLyoqXG4gKiBTZXRzIHRoZSBjb21taXR0ZWQgdmFsdWUgb2YgYSBDaGlsZFBhcnQgZGlyZWN0bHkgd2l0aG91dCB0cmlnZ2VyaW5nIHRoZVxuICogY29tbWl0IHN0YWdlIG9mIHRoZSBwYXJ0LlxuICpcbiAqIFRoaXMgaXMgdXNlZnVsIGluIGNhc2VzIHdoZXJlIGEgZGlyZWN0aXZlIG5lZWRzIHRvIHVwZGF0ZSB0aGUgcGFydCBzdWNoXG4gKiB0aGF0IHRoZSBuZXh0IHVwZGF0ZSBkZXRlY3RzIGEgdmFsdWUgY2hhbmdlIG9yIG5vdC4gV2hlbiB2YWx1ZSBpcyBvbWl0dGVkLFxuICogdGhlIG5leHQgdXBkYXRlIHdpbGwgYmUgZ3VhcmFudGVlZCB0byBiZSBkZXRlY3RlZCBhcyBhIGNoYW5nZS5cbiAqXG4gKiBAcGFyYW0gcGFydFxuICogQHBhcmFtIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBzZXRDb21taXR0ZWRWYWx1ZSA9IChwYXJ0OiBQYXJ0LCB2YWx1ZTogdW5rbm93biA9IFJFU0VUX1ZBTFVFKSA9PlxuICAocGFydC5fJGNvbW1pdHRlZFZhbHVlID0gdmFsdWUpO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGNvbW1pdHRlZCB2YWx1ZSBvZiBhIENoaWxkUGFydC5cbiAqXG4gKiBUaGUgY29tbWl0dGVkIHZhbHVlIGlzIHVzZWQgZm9yIGNoYW5nZSBkZXRlY3Rpb24gYW5kIGVmZmljaWVudCB1cGRhdGVzIG9mXG4gKiB0aGUgcGFydC4gSXQgY2FuIGRpZmZlciBmcm9tIHRoZSB2YWx1ZSBzZXQgYnkgdGhlIHRlbXBsYXRlIG9yIGRpcmVjdGl2ZSBpblxuICogY2FzZXMgd2hlcmUgdGhlIHRlbXBsYXRlIHZhbHVlIGlzIHRyYW5zZm9ybWVkIGJlZm9yZSBiZWluZyBjb21taXR0ZWQuXG4gKlxuICogLSBgVGVtcGxhdGVSZXN1bHRgcyBhcmUgY29tbWl0dGVkIGFzIGEgYFRlbXBsYXRlSW5zdGFuY2VgXG4gKiAtIEl0ZXJhYmxlcyBhcmUgY29tbWl0dGVkIGFzIGBBcnJheTxDaGlsZFBhcnQ+YFxuICogLSBBbGwgb3RoZXIgdHlwZXMgYXJlIGNvbW1pdHRlZCBhcyB0aGUgdGVtcGxhdGUgdmFsdWUgb3IgdmFsdWUgcmV0dXJuZWQgb3JcbiAqICAgc2V0IGJ5IGEgZGlyZWN0aXZlLlxuICpcbiAqIEBwYXJhbSBwYXJ0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRDb21taXR0ZWRWYWx1ZSA9IChwYXJ0OiBDaGlsZFBhcnQpID0+IHBhcnQuXyRjb21taXR0ZWRWYWx1ZTtcblxuLyoqXG4gKiBSZW1vdmVzIGEgQ2hpbGRQYXJ0IGZyb20gdGhlIERPTSwgaW5jbHVkaW5nIGFueSBvZiBpdHMgY29udGVudC5cbiAqXG4gKiBAcGFyYW0gcGFydCBUaGUgUGFydCB0byByZW1vdmVcbiAqL1xuZXhwb3J0IGNvbnN0IHJlbW92ZVBhcnQgPSAocGFydDogQ2hpbGRQYXJ0KSA9PiB7XG4gIHBhcnQuXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZD8uKGZhbHNlLCB0cnVlKTtcbiAgbGV0IHN0YXJ0OiBDaGlsZE5vZGUgfCBudWxsID0gcGFydC5fJHN0YXJ0Tm9kZTtcbiAgY29uc3QgZW5kOiBDaGlsZE5vZGUgfCBudWxsID0gd3JhcChwYXJ0Ll8kZW5kTm9kZSEpLm5leHRTaWJsaW5nO1xuICB3aGlsZSAoc3RhcnQgIT09IGVuZCkge1xuICAgIGNvbnN0IG46IENoaWxkTm9kZSB8IG51bGwgPSB3cmFwKHN0YXJ0ISkubmV4dFNpYmxpbmc7XG4gICAgKHdyYXAoc3RhcnQhKSBhcyBDaGlsZE5vZGUpLnJlbW92ZSgpO1xuICAgIHN0YXJ0ID0gbjtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGNsZWFyUGFydCA9IChwYXJ0OiBDaGlsZFBhcnQpID0+IHtcbiAgcGFydC5fJGNsZWFyKCk7XG59O1xuIiwgIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDIwIEdvb2dsZSBMTENcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBCU0QtMy1DbGF1c2VcbiAqL1xuXG5pbXBvcnQge0F0dHJpYnV0ZVBhcnQsIG5vQ2hhbmdlLCBub3RoaW5nfSBmcm9tICcuLi9saXQtaHRtbC5qcyc7XG5pbXBvcnQge1xuICBkaXJlY3RpdmUsXG4gIERpcmVjdGl2ZSxcbiAgRGlyZWN0aXZlUGFyYW1ldGVycyxcbiAgUGFydEluZm8sXG4gIFBhcnRUeXBlLFxufSBmcm9tICcuLi9kaXJlY3RpdmUuanMnO1xuaW1wb3J0IHtpc1NpbmdsZUV4cHJlc3Npb24sIHNldENvbW1pdHRlZFZhbHVlfSBmcm9tICcuLi9kaXJlY3RpdmUtaGVscGVycy5qcyc7XG5cbmNsYXNzIExpdmVEaXJlY3RpdmUgZXh0ZW5kcyBEaXJlY3RpdmUge1xuICBjb25zdHJ1Y3RvcihwYXJ0SW5mbzogUGFydEluZm8pIHtcbiAgICBzdXBlcihwYXJ0SW5mbyk7XG4gICAgaWYgKFxuICAgICAgIShcbiAgICAgICAgcGFydEluZm8udHlwZSA9PT0gUGFydFR5cGUuUFJPUEVSVFkgfHxcbiAgICAgICAgcGFydEluZm8udHlwZSA9PT0gUGFydFR5cGUuQVRUUklCVVRFIHx8XG4gICAgICAgIHBhcnRJbmZvLnR5cGUgPT09IFBhcnRUeXBlLkJPT0xFQU5fQVRUUklCVVRFXG4gICAgICApXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdUaGUgYGxpdmVgIGRpcmVjdGl2ZSBpcyBub3QgYWxsb3dlZCBvbiBjaGlsZCBvciBldmVudCBiaW5kaW5ncydcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICghaXNTaW5nbGVFeHByZXNzaW9uKHBhcnRJbmZvKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgbGl2ZWAgYmluZGluZ3MgY2FuIG9ubHkgY29udGFpbiBhIHNpbmdsZSBleHByZXNzaW9uJyk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKHZhbHVlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdXBkYXRlKHBhcnQ6IEF0dHJpYnV0ZVBhcnQsIFt2YWx1ZV06IERpcmVjdGl2ZVBhcmFtZXRlcnM8dGhpcz4pIHtcbiAgICBpZiAodmFsdWUgPT09IG5vQ2hhbmdlIHx8IHZhbHVlID09PSBub3RoaW5nKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGNvbnN0IGVsZW1lbnQgPSBwYXJ0LmVsZW1lbnQ7XG4gICAgY29uc3QgbmFtZSA9IHBhcnQubmFtZTtcblxuICAgIGlmIChwYXJ0LnR5cGUgPT09IFBhcnRUeXBlLlBST1BFUlRZKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgaWYgKHZhbHVlID09PSAoZWxlbWVudCBhcyBhbnkpW25hbWVdKSB7XG4gICAgICAgIHJldHVybiBub0NoYW5nZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHBhcnQudHlwZSA9PT0gUGFydFR5cGUuQk9PTEVBTl9BVFRSSUJVVEUpIHtcbiAgICAgIGlmICghIXZhbHVlID09PSBlbGVtZW50Lmhhc0F0dHJpYnV0ZShuYW1lKSkge1xuICAgICAgICByZXR1cm4gbm9DaGFuZ2U7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChwYXJ0LnR5cGUgPT09IFBhcnRUeXBlLkFUVFJJQlVURSkge1xuICAgICAgaWYgKGVsZW1lbnQuZ2V0QXR0cmlidXRlKG5hbWUpID09PSBTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBub0NoYW5nZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVzZXRzIHRoZSBwYXJ0J3MgdmFsdWUsIGNhdXNpbmcgaXRzIGRpcnR5LWNoZWNrIHRvIGZhaWwgc28gdGhhdCBpdFxuICAgIC8vIGFsd2F5cyBzZXRzIHRoZSB2YWx1ZS5cbiAgICBzZXRDb21taXR0ZWRWYWx1ZShwYXJ0KTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVja3MgYmluZGluZyB2YWx1ZXMgYWdhaW5zdCBsaXZlIERPTSB2YWx1ZXMsIGluc3RlYWQgb2YgcHJldmlvdXNseSBib3VuZFxuICogdmFsdWVzLCB3aGVuIGRldGVybWluaW5nIHdoZXRoZXIgdG8gdXBkYXRlIHRoZSB2YWx1ZS5cbiAqXG4gKiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2FzZXMgd2hlcmUgdGhlIERPTSB2YWx1ZSBtYXkgY2hhbmdlIGZyb20gb3V0c2lkZSBvZlxuICogbGl0LWh0bWwsIHN1Y2ggYXMgd2l0aCBhIGJpbmRpbmcgdG8gYW4gYDxpbnB1dD5gIGVsZW1lbnQncyBgdmFsdWVgIHByb3BlcnR5LFxuICogYSBjb250ZW50IGVkaXRhYmxlIGVsZW1lbnRzIHRleHQsIG9yIHRvIGEgY3VzdG9tIGVsZW1lbnQgdGhhdCBjaGFuZ2VzIGl0J3NcbiAqIG93biBwcm9wZXJ0aWVzIG9yIGF0dHJpYnV0ZXMuXG4gKlxuICogSW4gdGhlc2UgY2FzZXMgaWYgdGhlIERPTSB2YWx1ZSBjaGFuZ2VzLCBidXQgdGhlIHZhbHVlIHNldCB0aHJvdWdoIGxpdC1odG1sXG4gKiBiaW5kaW5ncyBoYXNuJ3QsIGxpdC1odG1sIHdvbid0IGtub3cgdG8gdXBkYXRlIHRoZSBET00gdmFsdWUgYW5kIHdpbGwgbGVhdmVcbiAqIGl0IGFsb25lLiBJZiB0aGlzIGlzIG5vdCB3aGF0IHlvdSB3YW50LS1pZiB5b3Ugd2FudCB0byBvdmVyd3JpdGUgdGhlIERPTVxuICogdmFsdWUgd2l0aCB0aGUgYm91bmQgdmFsdWUgbm8gbWF0dGVyIHdoYXQtLXVzZSB0aGUgYGxpdmUoKWAgZGlyZWN0aXZlOlxuICpcbiAqIGBgYGpzXG4gKiBodG1sYDxpbnB1dCAudmFsdWU9JHtsaXZlKHgpfT5gXG4gKiBgYGBcbiAqXG4gKiBgbGl2ZSgpYCBwZXJmb3JtcyBhIHN0cmljdCBlcXVhbGl0eSBjaGVjayBhZ2FpbnN0IHRoZSBsaXZlIERPTSB2YWx1ZSwgYW5kIGlmXG4gKiB0aGUgbmV3IHZhbHVlIGlzIGVxdWFsIHRvIHRoZSBsaXZlIHZhbHVlLCBkb2VzIG5vdGhpbmcuIFRoaXMgbWVhbnMgdGhhdFxuICogYGxpdmUoKWAgc2hvdWxkIG5vdCBiZSB1c2VkIHdoZW4gdGhlIGJpbmRpbmcgd2lsbCBjYXVzZSBhIHR5cGUgY29udmVyc2lvbi4gSWZcbiAqIHlvdSB1c2UgYGxpdmUoKWAgd2l0aCBhbiBhdHRyaWJ1dGUgYmluZGluZywgbWFrZSBzdXJlIHRoYXQgb25seSBzdHJpbmdzIGFyZVxuICogcGFzc2VkIGluLCBvciB0aGUgYmluZGluZyB3aWxsIHVwZGF0ZSBldmVyeSByZW5kZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBsaXZlID0gZGlyZWN0aXZlKExpdmVEaXJlY3RpdmUpO1xuXG4vKipcbiAqIFRoZSB0eXBlIG9mIHRoZSBjbGFzcyB0aGF0IHBvd2VycyB0aGlzIGRpcmVjdGl2ZS4gTmVjZXNzYXJ5IGZvciBuYW1pbmcgdGhlXG4gKiBkaXJlY3RpdmUncyByZXR1cm4gdHlwZS5cbiAqL1xuZXhwb3J0IHR5cGUge0xpdmVEaXJlY3RpdmV9O1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IFJlc291cmNlRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzXCI7XG5pbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgaWNvbiB9IGZyb20gXCIuLi9pY29ucy9pY29uc1wiO1xuaW1wb3J0IHsgZXhlY3V0ZU9wIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlXCI7XG5pbXBvcnQge1xuICBBZGRSZXNvdXJjZU9wdGlvbk9wLFxuICBEZWxldGVSZXNvdXJjZU9wdGlvbk9wLFxuICBNb3ZlUmVzb3VyY2VPcHRpb25PcCxcbiAgUmVuYW1lUmVzb3VyY2VPcCxcbiAgUmVuYW1lUmVzb3VyY2VPcHRpb25PcCxcbn0gZnJvbSBcIi4uL29wcy9yZXNvdXJjZXNcIjtcbmltcG9ydCB7IE9wIH0gZnJvbSBcIi4uL29wcy9vcHNcIjtcbmltcG9ydCB7IFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHRcIjtcbmltcG9ydCB7IGxpdmUgfSBmcm9tIFwibGl0LWh0bWwvZGlyZWN0aXZlcy9saXZlLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBFZGl0UmVzb3VyY2VEZWZpbml0aW9uIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBleHBsYW5NYWluOiBFeHBsYW5NYWluIHwgbnVsbCA9IG51bGw7XG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uID0gbmV3IFJlc291cmNlRGVmaW5pdGlvbigpO1xuICBuYW1lOiBzdHJpbmcgPSBcIlwiO1xuICBwbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFjazogKCkgPT4gdm9pZDtcbiAgbmV3VmFsdWVDb3VudGVyID0gMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH07XG4gIH1cblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBzaG93TW9kYWwoXG4gICAgZXhwbGFuTWFpbjogRXhwbGFuTWFpbixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb25cbiAgKSB7XG4gICAgdGhpcy5leHBsYW5NYWluID0gZXhwbGFuTWFpbjtcbiAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbiA9IHJlc291cmNlRGVmaW5pdGlvbjtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImRpYWxvZ1wiKSEuc2hvd01vZGFsKCk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlcigpIHtcbiAgICByZW5kZXIodGhpcy50ZW1wbGF0ZSgpLCB0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgY2FuY2VsKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLmNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGV4ZWN1dGVPcChvcDogT3ApOiBQcm9taXNlPFJlc3VsdDxudWxsPj4ge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGVPcChcbiAgICAgIG9wLFxuICAgICAgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIixcbiAgICAgIHRydWUsXG4gICAgICB0aGlzLmV4cGxhbk1haW4hXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgd2luZG93LmFsZXJ0KHJldC5lcnJvcik7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNoYW5nZVJlc291cmNlTmFtZShlOiBFdmVudCwgbmV3TmFtZTogc3RyaW5nLCBvbGROYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZXQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVPcChSZW5hbWVSZXNvdXJjZU9wKG9sZE5hbWUsIG5ld05hbWUpKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgd2luZG93LmFsZXJ0KHJldC5lcnJvcik7XG4gICAgICB0aGlzLm5hbWUgPSBvbGROYW1lO1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG4gICAgdGhpcy5uYW1lID0gbmV3TmFtZTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2hhbmdlUmVzb3VyY2VWYWx1ZU5hbWUoXG4gICAgZTogRXZlbnQsXG4gICAgbmV3VmFsdWU6IHN0cmluZyxcbiAgICBvbGRWYWx1ZTogc3RyaW5nXG4gICkge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IHRoaXMuZXhlY3V0ZU9wKFxuICAgICAgUmVuYW1lUmVzb3VyY2VPcHRpb25PcCh0aGlzLm5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSlcbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICB3aW5kb3cuYWxlcnQocmV0LmVycm9yKTtcbiAgICAgIChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSA9IG9sZFZhbHVlO1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFByb3Bvc2VkUmVzb3VyY2VOYW1lKCk6IHN0cmluZyB7XG4gICAgdGhpcy5uZXdWYWx1ZUNvdW50ZXIrKztcbiAgICByZXR1cm4gYE5ldyBWYWx1ZSAke3RoaXMubmV3VmFsdWVDb3VudGVyfWA7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG5ld1Jlc291cmNlVmFsdWUoKSB7XG4gICAgdGhpcy5uZXdWYWx1ZUNvdW50ZXIgPSAwO1xuICAgIC8vIENvbWUgdXAgd2l0aCBhIHVuaXF1ZSBuYW1lIHRvIGFkZCwgc2luY2UgYWxsIHJlc291cmNlIHZhbHVlcyBtdXN0IGJlXG4gICAgLy8gdW5pcXVlIGZvciBhIGdpdmVuIHJlc291cmNlIG5hbWUuXG4gICAgbGV0IG5ld1Jlc291cmNlTmFtZSA9IHRoaXMuZ2V0UHJvcG9zZWRSZXNvdXJjZU5hbWUoKTtcbiAgICB3aGlsZSAoXG4gICAgICB0aGlzLmV4cGxhbk1haW4hLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9uc1t0aGlzLm5hbWVdLnZhbHVlcy5maW5kSW5kZXgoXG4gICAgICAgICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSA9PT0gbmV3UmVzb3VyY2VOYW1lXG4gICAgICApICE9IC0xXG4gICAgKSB7XG4gICAgICBuZXdSZXNvdXJjZU5hbWUgPSB0aGlzLmdldFByb3Bvc2VkUmVzb3VyY2VOYW1lKCk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoQWRkUmVzb3VyY2VPcHRpb25PcCh0aGlzLm5hbWUsIG5ld1Jlc291cmNlTmFtZSkpO1xuICB9XG4gIHByaXZhdGUgYXN5bmMgbW92ZVVwKHZhbHVlOiBzdHJpbmcsIHZhbHVlSW5kZXg6IG51bWJlcikge1xuICAgIGF3YWl0IHRoaXMuZXhlY3V0ZU9wKFxuICAgICAgTW92ZVJlc291cmNlT3B0aW9uT3AodGhpcy5uYW1lLCB2YWx1ZUluZGV4LCB2YWx1ZUluZGV4IC0gMSlcbiAgICApO1xuICB9XG4gIHByaXZhdGUgYXN5bmMgbW92ZURvd24odmFsdWU6IHN0cmluZywgdmFsdWVJbmRleDogbnVtYmVyKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoXG4gICAgICBNb3ZlUmVzb3VyY2VPcHRpb25PcCh0aGlzLm5hbWUsIHZhbHVlSW5kZXgsIHZhbHVlSW5kZXggKyAxKVxuICAgICk7XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyBtb3ZlVG9Ub3AodmFsdWU6IHN0cmluZywgdmFsdWVJbmRleDogbnVtYmVyKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoTW92ZVJlc291cmNlT3B0aW9uT3AodGhpcy5uYW1lLCB2YWx1ZUluZGV4LCAwKSk7XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyBtb3ZlVG9Cb3R0b20odmFsdWU6IHN0cmluZywgdmFsdWVJbmRleDogbnVtYmVyKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoXG4gICAgICBNb3ZlUmVzb3VyY2VPcHRpb25PcChcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB2YWx1ZUluZGV4LFxuICAgICAgICB0aGlzLmV4cGxhbk1haW4hLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9uc1t0aGlzLm5hbWVdIS52YWx1ZXMubGVuZ3RoIC0gMVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyBkZWxldGVSZXNvdXJjZVZhbHVlKHZhbHVlOiBzdHJpbmcsIHZhbHVlSW5kZXg6IG51bWJlcikge1xuICAgIGF3YWl0IHRoaXMuZXhlY3V0ZU9wKERlbGV0ZVJlc291cmNlT3B0aW9uT3AodGhpcy5uYW1lLCB2YWx1ZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSB0ZW1wbGF0ZSgpOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8ZGlhbG9nPlxuICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgTmFtZTpcbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUodGhpcy5uYW1lKX1cbiAgICAgICAgICAgIGRhdGEtb2xkLW5hbWU9JHt0aGlzLm5hbWV9XG4gICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGVsZSA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgICAgICAgIHRoaXMuY2hhbmdlUmVzb3VyY2VOYW1lKGUsIGVsZS52YWx1ZSwgZWxlLmRhdGFzZXQub2xkTmFtZSB8fCBcIlwiKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICR7dGhpcy5yZXNvdXJjZURlZmluaXRpb24udmFsdWVzLm1hcChcbiAgICAgICAgICAgICh2YWx1ZTogc3RyaW5nLCB2YWx1ZUluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGh0bWxgPHRyPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICBkYXRhLW9sZC12YWx1ZT0ke3ZhbHVlfVxuICAgICAgICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZVJlc291cmNlVmFsdWVOYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZS5kYXRhc2V0Lm9sZFZhbHVlIHx8IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAudmFsdWU9JHtsaXZlKHZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5tb3ZlVXAodmFsdWUsIHZhbHVlSW5kZXgpfVxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgLmRpc2FibGVkPSR7dmFsdWVJbmRleCA9PT0gMH1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgJHtpY29uKFwia2V5Ym9hcmQtdXAtaWNvblwiKX1cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAuZGlzYWJsZWQ9JHt2YWx1ZUluZGV4ID09PVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHRoaXMubW92ZURvd24odmFsdWUsIHZhbHVlSW5kZXgpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAke2ljb24oXCJrZXlib2FyZC1kb3duLWljb25cIil9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgLmRpc2FibGVkPSR7dmFsdWVJbmRleCA9PT1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmxlbmd0aCAtIDF9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBAY2xpY2s9JHsoKSA9PiB0aGlzLm1vdmVUb0JvdHRvbSh2YWx1ZSwgdmFsdWVJbmRleCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICR7aWNvbihcImtleWJvYXJkLWRvdWJsZS1kb3duLWljb25cIil9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgLmRpc2FibGVkPSR7dmFsdWVJbmRleCA9PT0gMH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHRoaXMubW92ZVRvVG9wKHZhbHVlLCB2YWx1ZUluZGV4KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgJHtpY29uKFwia2V5Ym9hcmQtZG91YmxlLXVwLWljb25cIil9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgLmRpc2FibGVkPSR7dGhpcy5yZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmxlbmd0aCA9PT0gMX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHRoaXMuZGVsZXRlUmVzb3VyY2VWYWx1ZSh2YWx1ZSwgdmFsdWVJbmRleCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICR7aWNvbihcImRlbGV0ZS1pY29uXCIpfVxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgPC90cj5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICl9XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMubmV3UmVzb3VyY2VWYWx1ZSgpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBOZXdcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJkaWFsb2ctZm9vdGVyXCI+XG4gICAgICAgICAgPGJ1dHRvbiBAY2xpY2s9JHsoKSA9PiB0aGlzLmNhbmNlbCgpfT5DbG9zZTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGlhbG9nPlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwiZWRpdC1yZXNvdXJjZS1kZWZpbml0aW9uXCIsIEVkaXRSZXNvdXJjZURlZmluaXRpb24pO1xuIiwgIi8vIFV0aWxpdGllcyBmb3IgZGVhbGluZyB3aXRoIGEgcmFuZ2Ugb2YgbnVtYmVycy5cblxuZXhwb3J0IGludGVyZmFjZSBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQge1xuICBtaW46IG51bWJlcjtcbiAgbWF4OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBkaXNwbGF5VmFsdWUgPSAoeDogbnVtYmVyKTogc3RyaW5nID0+IHtcbiAgaWYgKHggPT09IE51bWJlci5NQVhfVkFMVUUpIHtcbiAgICByZXR1cm4gXCIobWF4IGZsb2F0KVwiO1xuICB9IGVsc2UgaWYgKHggPT09IC1OdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgcmV0dXJuIFwiKG1pbiBmbG9hdClcIjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4geC50b1N0cmluZygpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgY2xhbXAgPSAoeDogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICBpZiAoeCA+IG1heCkge1xuICAgIHJldHVybiBtYXg7XG4gIH1cbiAgaWYgKHggPCBtaW4pIHtcbiAgICByZXR1cm4gbWluO1xuICB9XG4gIHJldHVybiB4O1xufTtcblxuLy8gUmFuZ2UgZGVmaW5lcyBhIHJhbmdlIG9mIG51bWJlcnMsIGZyb20gW21pbiwgbWF4XSBpbmNsdXNpdmUuXG5leHBvcnQgY2xhc3MgTWV0cmljUmFuZ2Uge1xuICBwcml2YXRlIF9taW46IG51bWJlciA9IC1OdW1iZXIuTUFYX1ZBTFVFO1xuICBwcml2YXRlIF9tYXg6IG51bWJlciA9IE51bWJlci5NQVhfVkFMVUU7XG5cbiAgY29uc3RydWN0b3IobWluOiBudW1iZXIgPSAtTnVtYmVyLk1BWF9WQUxVRSwgbWF4OiBudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgaWYgKG1heCA8IG1pbikge1xuICAgICAgW21pbiwgbWF4XSA9IFttYXgsIG1pbl07XG4gICAgfVxuICAgIHRoaXMuX21pbiA9IG1pbjtcbiAgICB0aGlzLl9tYXggPSBtYXg7XG4gIH1cblxuICBjbGFtcCh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gY2xhbXAodmFsdWUsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWluKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21pbjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWF4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21heDtcbiAgfVxuXG4gIHRvSlNPTigpOiBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBtaW46IHRoaXMuX21pbixcbiAgICAgIG1heDogdGhpcy5fbWF4LFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZnJvbUpTT04oczogTWV0cmljUmFuZ2VTZXJpYWxpemVkIHwgdW5kZWZpbmVkKTogTWV0cmljUmFuZ2Uge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgTWV0cmljUmFuZ2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBNZXRyaWNSYW5nZShzLm1pbiwgcy5tYXgpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgUm91bmRlciB9IGZyb20gXCIuLi90eXBlcy90eXBlc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByZWNpc2lvblNlcmlhbGl6ZWQge1xuICBwcmVjaXNpb246IG51bWJlcjtcbn1cbmV4cG9ydCBjbGFzcyBQcmVjaXNpb24ge1xuICBwcml2YXRlIF9wcmVjaXNpb246IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihwcmVjaXNpb246IG51bWJlciA9IDApIHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShwcmVjaXNpb24pKSB7XG4gICAgICBwcmVjaXNpb24gPSAwO1xuICAgIH1cbiAgICB0aGlzLl9wcmVjaXNpb24gPSBNYXRoLmFicyhNYXRoLnRydW5jKHByZWNpc2lvbikpO1xuICB9XG5cbiAgcm91bmQoeDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gK3gudG9GaXhlZCh0aGlzLl9wcmVjaXNpb24pO1xuICB9XG5cbiAgcm91bmRlcigpOiBSb3VuZGVyIHtcbiAgICByZXR1cm4gKHg6IG51bWJlcik6IG51bWJlciA9PiB0aGlzLnJvdW5kKHgpO1xuICB9XG5cbiAgcHVibGljIGdldCBwcmVjaXNpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcHJlY2lzaW9uO1xuICB9XG5cbiAgdG9KU09OKCk6IFByZWNpc2lvblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBwcmVjaXNpb246IHRoaXMuX3ByZWNpc2lvbixcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGZyb21KU09OKHM6IFByZWNpc2lvblNlcmlhbGl6ZWQgfCB1bmRlZmluZWQpOiBQcmVjaXNpb24ge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgUHJlY2lzaW9uKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJlY2lzaW9uKHMucHJlY2lzaW9uKTtcbiAgfVxufVxuIiwgIi8vIE1ldHJpY3MgZGVmaW5lIGZsb2F0aW5nIHBvaW50IHZhbHVlcyB0aGF0IGFyZSB0cmFja2VkIHBlciBUYXNrLlxuXG5pbXBvcnQgeyBQcmVjaXNpb24sIFByZWNpc2lvblNlcmlhbGl6ZWQgfSBmcm9tIFwiLi4vcHJlY2lzaW9uL3ByZWNpc2lvbi50c1wiO1xuaW1wb3J0IHsgY2xhbXAsIE1ldHJpY1JhbmdlLCBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQgfSBmcm9tIFwiLi9yYW5nZS50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlU2VyaWFsaXplZDtcbiAgZGVmYXVsdDogbnVtYmVyO1xuICBwcmVjaXNpb246IFByZWNpc2lvblNlcmlhbGl6ZWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRyaWNEZWZpbml0aW9uIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlO1xuICBkZWZhdWx0OiBudW1iZXI7XG4gIGlzU3RhdGljOiBib29sZWFuO1xuICBwcmVjaXNpb246IFByZWNpc2lvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZWZhdWx0VmFsdWU6IG51bWJlcixcbiAgICByYW5nZTogTWV0cmljUmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoKSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlLFxuICAgIHByZWNpc2lvbjogUHJlY2lzaW9uID0gbmV3IFByZWNpc2lvbigxKVxuICApIHtcbiAgICB0aGlzLnByZWNpc2lvbiA9IHByZWNpc2lvbjtcbiAgICB0aGlzLnJhbmdlID0gcmFuZ2U7XG4gICAgdGhpcy5kZWZhdWx0ID0gZGVmYXVsdFZhbHVlO1xuICAgIHRoaXMuaXNTdGF0aWMgPSBpc1N0YXRpYztcbiAgICB0aGlzLnJhdGlvbmFsaXplKCk7XG4gIH1cblxuICByYXRpb25hbGl6ZSgpIHtcbiAgICAvLyBtaW4gYW5kIG1heCBzaG91bGQgYmUgcm91bmRlZCB0byBwcmVjaXNpb24gZmlyc3QuIGFuZCB0aGVuIGNsYW1wIGFuZFxuICAgIC8vIHByZWNpc2lvbiBhcHBsaWVkIHRvIHRoZSBkZWZhdWx0LlxuICAgIHRoaXMucmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoXG4gICAgICB0aGlzLnByZWNpc2lvbi5yb3VuZCh0aGlzLnJhbmdlLm1pbiksXG4gICAgICB0aGlzLnByZWNpc2lvbi5yb3VuZCh0aGlzLnJhbmdlLm1heClcbiAgICApO1xuICAgIC8vIG1pbiBhbmQgbWF4IHNob3VsZCBiZSByb3VuZGVkIHRvIHByZWNpc2lvbiBmaXJzdC4gYW5kIHRoZW4gY2xhbXAgYW5kXG4gICAgLy8gcHJlY2lzaW9uIGFwcGxpZWQgdG8gdGhlIGRlZmF1bHQuXG4gICAgdGhpcy5kZWZhdWx0ID0gdGhpcy5jbGFtcEFuZFJvdW5kKHRoaXMuZGVmYXVsdCk7XG4gIH1cblxuICBjbGFtcEFuZFJvdW5kKHg6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucHJlY2lzaW9uLnJvdW5kKHRoaXMucmFuZ2UuY2xhbXAoeCkpO1xuICB9XG5cbiAgdG9KU09OKCk6IE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmFuZ2U6IHRoaXMucmFuZ2UudG9KU09OKCksXG4gICAgICBkZWZhdWx0OiB0aGlzLmRlZmF1bHQsXG4gICAgICBwcmVjaXNpb246IHRoaXMucHJlY2lzaW9uLnRvSlNPTigpLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZnJvbUpTT04oczogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQgfCB1bmRlZmluZWQpOiBNZXRyaWNEZWZpbml0aW9uIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IE1ldHJpY0RlZmluaXRpb24oMCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTWV0cmljRGVmaW5pdGlvbihcbiAgICAgIHMuZGVmYXVsdCB8fCAwLFxuICAgICAgTWV0cmljUmFuZ2UuZnJvbUpTT04ocy5yYW5nZSksXG4gICAgICBmYWxzZSxcbiAgICAgIFByZWNpc2lvbi5mcm9tSlNPTihzLnByZWNpc2lvbilcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBNZXRyaWNEZWZpbml0aW9uIH07XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZCA9IHtcbiAgW2tleTogc3RyaW5nXTogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQ7XG59O1xuXG5leHBvcnQgdHlwZSBNZXRyaWNWYWx1ZXMgPSB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9O1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBpY29uIH0gZnJvbSBcIi4uL2ljb25zL2ljb25zXCI7XG5pbXBvcnQgeyBkaXNwbGF5VmFsdWUgfSBmcm9tIFwiLi4vbWV0cmljcy9yYW5nZVwiO1xuaW1wb3J0IHsgZXhlY3V0ZU9wIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlXCI7XG5pbXBvcnQgeyBBZGRNZXRyaWNPcCwgRGVsZXRlTWV0cmljT3AgfSBmcm9tIFwiLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBFZGl0TWV0cmljRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9lZGl0LW1ldHJpYy1kZWZpbml0aW9uL2VkaXQtbWV0cmljLWRlZmluaXRpb25cIjtcblxuZXhwb3J0IGNsYXNzIEVkaXRNZXRyaWNzRGlhbG9nIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBleHBsYW5NYWluOiBFeHBsYW5NYWluIHwgbnVsbCA9IG51bGw7XG4gIHBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLmV4cGxhbk1haW4gIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwicGxhbi1kZWZpbml0aW9uLWNoYW5nZWRcIixcbiAgICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2tcbiAgICApO1xuICB9XG5cbiAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwicGxhbi1kZWZpbml0aW9uLWNoYW5nZWRcIixcbiAgICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2tcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXIoKSB7XG4gICAgcmVuZGVyKHRoaXMudGVtcGxhdGUoKSwgdGhpcyk7XG4gIH1cblxuICBzaG93TW9kYWwoZXhwbGFuTWFpbjogRXhwbGFuTWFpbikge1xuICAgIHRoaXMuZXhwbGFuTWFpbiA9IGV4cGxhbk1haW47XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5zaG93TW9kYWwoKTtcbiAgfVxuXG4gIHByaXZhdGUgY2FuY2VsKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLmNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIHRlbXBsYXRlKCk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdCBtZCA9IHRoaXMuZXhwbGFuTWFpbiEucGxhbi5tZXRyaWNEZWZpbml0aW9ucztcbiAgICBjb25zdCBhbGxLZXlzU29ydGVkID0gT2JqZWN0LmtleXMobWQpLnNvcnQoXG4gICAgICAoa2V5QTogc3RyaW5nLCBrZXlCOiBzdHJpbmcpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBhID0gbWRba2V5QV07XG4gICAgICAgIGNvbnN0IGIgPSBtZFtrZXlCXTtcbiAgICAgICAgaWYgKGEuaXNTdGF0aWMgPT09IGIuaXNTdGF0aWMpIHtcbiAgICAgICAgICByZXR1cm4ga2V5QS5sb2NhbGVDb21wYXJlKGtleUIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhLmlzU3RhdGljKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIGh0bWxgIDxkaWFsb2c+XG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+TmFtZTwvdGg+XG4gICAgICAgICAgPHRoPk1pbjwvdGg+XG4gICAgICAgICAgPHRoPk1heDwvdGg+XG4gICAgICAgICAgPHRoPkRlZmF1bHQ8L3RoPlxuICAgICAgICAgIDx0aD48L3RoPlxuICAgICAgICAgIDx0aD48L3RoPlxuICAgICAgICA8L3RyPlxuXG4gICAgICAgICR7YWxsS2V5c1NvcnRlZC5tYXAoKG1ldHJpY05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGNvbnN0IG1ldHJpY0RlZm4gPVxuICAgICAgICAgICAgdGhpcy5leHBsYW5NYWluIS5wbGFuLm1ldHJpY0RlZmluaXRpb25zW21ldHJpY05hbWVdO1xuICAgICAgICAgIHJldHVybiBodG1sYFxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICA8dGQ+JHttZXRyaWNOYW1lfTwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD4ke2Rpc3BsYXlWYWx1ZShtZXRyaWNEZWZuLnJhbmdlLm1pbil9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPiR7ZGlzcGxheVZhbHVlKG1ldHJpY0RlZm4ucmFuZ2UubWF4KX08L3RkPlxuICAgICAgICAgICAgICA8dGQ+JHttZXRyaWNEZWZuLmRlZmF1bHR9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICR7dGhpcy5kZWxCdXR0b25JZk5vdFN0YXRpYyhtZXRyaWNOYW1lLCBtZXRyaWNEZWZuLmlzU3RhdGljKX1cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICR7dGhpcy5lZGl0QnV0dG9uSWZOb3RTdGF0aWMobWV0cmljTmFtZSwgbWV0cmljRGVmbi5pc1N0YXRpYyl9XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgIGA7XG4gICAgICAgIH0pfVxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgdGl0bGU9XCJBZGQgYSBuZXcgUmVzb3VyY2UuXCJcbiAgICAgICAgICAgICAgQGNsaWNrPSR7KCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubmV3TWV0cmljKCk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICR7aWNvbihcImFkZC1pY29uXCIpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgICA8ZGl2IGNsYXNzPVwiZGlhbG9nLWZvb3RlclwiPlxuICAgICAgICA8YnV0dG9uIEBjbGljaz0keygpID0+IHRoaXMuY2FuY2VsKCl9PkNsb3NlPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2RpYWxvZz5gO1xuICB9XG5cbiAgcHJpdmF0ZSBkZWxCdXR0b25JZk5vdFN0YXRpYyhcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgaXNTdGF0aWM6IGJvb2xlYW5cbiAgKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGlmIChpc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGh0bWxgYDtcbiAgICB9XG4gICAgcmV0dXJuIGh0bWxgPGJ1dHRvblxuICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICB0aXRsZT1cIkRlbGV0ZSB0aGlzIG1ldHJpYy5cIlxuICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5kZWxldGVNZXRyaWMobmFtZSl9XG4gICAgPlxuICAgICAgJHtpY29uKFwiZGVsZXRlLWljb25cIil9XG4gICAgPC9idXR0b24+YDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZGVsZXRlTWV0cmljKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGVPcChcbiAgICAgIERlbGV0ZU1ldHJpY09wKG5hbWUpLFxuICAgICAgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIixcbiAgICAgIHRydWUsXG4gICAgICB0aGlzLmV4cGxhbk1haW4hXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgY29uc29sZS5sb2cocmV0LmVycm9yKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgZWRpdEJ1dHRvbklmTm90U3RhdGljKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBpc1N0YXRpYzogYm9vbGVhblxuICApOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgaWYgKGlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gaHRtbGBgO1xuICAgIH1cbiAgICByZXR1cm4gaHRtbGA8YnV0dG9uXG4gICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgIHRpdGxlPVwiRWRpdCB0aGUgcmVzb3VyY2UgZGVmaW5pdGlvbi5cIlxuICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5lZGl0TWV0cmljKG5hbWUpfVxuICAgID5cbiAgICAgICR7aWNvbihcImVkaXQtaWNvblwiKX1cbiAgICA8L2J1dHRvbj5gO1xuICB9XG5cbiAgcHJpdmF0ZSBlZGl0TWV0cmljKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgdGhpcy5leHBsYW5NYWluIS5xdWVyeVNlbGVjdG9yPEVkaXRNZXRyaWNEZWZpbml0aW9uPihcbiAgICAgIFwiZWRpdC1tZXRyaWMtZGVmaW5pdGlvblwiXG4gICAgKSEuc2hvd01vZGFsKHRoaXMuZXhwbGFuTWFpbiEsIG5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBuZXdNZXRyaWMoKSB7XG4gICAgY29uc3QgbmFtZSA9IHdpbmRvdy5wcm9tcHQoXCJNZXRyaWMgbmFtZTpcIiwgXCJcIik7XG4gICAgaWYgKG5hbWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZU9wKFxuICAgICAgQWRkTWV0cmljT3AobmFtZSwgbmV3IE1ldHJpY0RlZmluaXRpb24oMCkpLFxuICAgICAgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIixcbiAgICAgIHRydWUsXG4gICAgICB0aGlzLmV4cGxhbk1haW4hXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgd2luZG93LmFsZXJ0KHJldC5lcnJvcik7XG4gICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImVkaXQtbWV0cmljcy1kaWFsb2dcIiwgRWRpdE1ldHJpY3NEaWFsb2cpO1xuIiwgImltcG9ydCB7IFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHRcIjtcblxuLy8gRGlzcGxheXMgdGhlIGdpdmVuIGVycm9yLlxuLy8gVE9ETyAtIE1ha2UgdGhpcyBhIHBvcC11cCBvciBzb21ldGhpbmcuXG5leHBvcnQgY29uc3QgcmVwb3J0RXJyb3IgPSAoZXJyb3I6IEVycm9yKSA9PiB7XG4gIGNvbnNvbGUubG9nKGVycm9yKTtcbn07XG5cbi8vIFJlcG9ydHMgdGhlIGVycm9yIGlmIHRoZSBnaXZlbiBSZXN1bHQgaXMgbm90IG9rLlxuZXhwb3J0IGNvbnN0IHJlcG9ydE9uRXJyb3IgPSA8VD4ocmV0OiBSZXN1bHQ8VD4pID0+IHtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXBvcnRFcnJvcihyZXQuZXJyb3IpO1xuICB9XG59O1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBsaXZlIH0gZnJvbSBcImxpdC1odG1sL2RpcmVjdGl2ZXMvbGl2ZS5qc1wiO1xuaW1wb3J0IHsgTWV0cmljUmFuZ2UsIGRpc3BsYXlWYWx1ZSB9IGZyb20gXCIuLi9tZXRyaWNzL3JhbmdlXCI7XG5pbXBvcnQgeyBSZW5hbWVNZXRyaWNPcCwgVXBkYXRlTWV0cmljT3AgfSBmcm9tIFwiLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBSZXN1bHQgfSBmcm9tIFwiLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBPcCB9IGZyb20gXCIuLi9vcHMvb3BzXCI7XG5pbXBvcnQgeyBleGVjdXRlT3AgfSBmcm9tIFwiLi4vYWN0aW9uL2V4ZWN1dGVcIjtcbmltcG9ydCB7IHJlcG9ydEVycm9yIH0gZnJvbSBcIi4uL3JlcG9ydC1lcnJvci9yZXBvcnQtZXJyb3JcIjtcbmltcG9ydCB7IFByZWNpc2lvbiB9IGZyb20gXCIuLi9wcmVjaXNpb24vcHJlY2lzaW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBFZGl0TWV0cmljRGVmaW5pdGlvbiBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpbiB8IG51bGwgPSBudWxsO1xuICBtZXRyaWNOYW1lOiBzdHJpbmcgPSBcIlwiO1xuICBwbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFjazogKCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH07XG4gIH1cblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlcigpIHtcbiAgICByZW5kZXIodGhpcy50ZW1wbGF0ZSgpLCB0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGNvbnN0IGRlZm4gPSB0aGlzLmV4cGxhbk1haW4/LnBsYW4ubWV0cmljRGVmaW5pdGlvbnNbdGhpcy5tZXRyaWNOYW1lXTtcbiAgICBpZiAoIWRlZm4pIHtcbiAgICAgIHJldHVybiBodG1sYGA7XG4gICAgfVxuICAgIHJldHVybiBodG1sYDxkaWFsb2c+XG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+TmFtZTwvdGg+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUodGhpcy5tZXRyaWNOYW1lKX1cbiAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4gdGhpcy5uYW1lQ2hhbmdlKGUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPk1pbjwvdGg+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUoZGlzcGxheVZhbHVlKGRlZm4ucmFuZ2UubWluKSl9XG4gICAgICAgICAgICAgID9kaXNhYmxlZD0ke2RlZm4ucmFuZ2UubWluID09PSAtTnVtYmVyLk1BWF9WQUxVRX1cbiAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4gdGhpcy5taW5DaGFuZ2UoZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgID9jaGVja2VkPSR7ZGVmbi5yYW5nZS5taW4gIT09IC1OdW1iZXIuTUFYX1ZBTFVFfVxuICAgICAgICAgICAgICAgIEBjaGFuZ2U9JHsoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMubWluTGltaXRDaGFuZ2UoZSk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgTGltaXQ8L2xhYmVsXG4gICAgICAgICAgICA+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD5NYXg8L3RoPlxuICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAudmFsdWU9JHtsaXZlKGRpc3BsYXlWYWx1ZShkZWZuLnJhbmdlLm1heCkpfVxuICAgICAgICAgICAgICA/ZGlzYWJsZWQ9JHtkZWZuLnJhbmdlLm1heCA9PT0gTnVtYmVyLk1BWF9WQUxVRX1cbiAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4gdGhpcy5tYXhDaGFuZ2UoZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgID9jaGVja2VkPSR7ZGVmbi5yYW5nZS5tYXggIT09IE51bWJlci5NQVhfVkFMVUV9XG4gICAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy5tYXhMaW1pdENoYW5nZShlKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICBMaW1pdDwvbGFiZWxcbiAgICAgICAgICAgID5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPlByZWNpc2lvbjwvdGg+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUoZGVmbi5wcmVjaXNpb24ucHJlY2lzaW9uKX1cbiAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlY2lzaW9uQ2hhbmdlKGUpO1xuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPkRlZmF1bHQ8L3RoPlxuICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAudmFsdWU9JHtsaXZlKGRlZm4uZGVmYXVsdCl9XG4gICAgICAgICAgICAgIEBjaGFuZ2U9JHsoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHRDaGFuZ2UoZSk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICA8L3RhYmxlPlxuICAgICAgPGRpdiBjbGFzcz1cImRpYWxvZy1mb290ZXJcIj5cbiAgICAgICAgPGJ1dHRvbiBAY2xpY2s9JHsoKSA9PiB0aGlzLmNhbmNlbCgpfT5DbG9zZTwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaWFsb2c+YDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZXhlY3V0ZU9wKG9wOiBPcCk6IFByb21pc2U8UmVzdWx0PG51bGw+PiB7XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZU9wKFxuICAgICAgb3AsXG4gICAgICBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLFxuICAgICAgdHJ1ZSxcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiFcbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICB3aW5kb3cuYWxlcnQocmV0LmVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWluTGltaXRDaGFuZ2UoZTogRXZlbnQpIHtcbiAgICBjb25zdCBlbGUgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IGRlZm4gPSB0aGlzLmdldERlZmluaXRpb25Db3B5KCk7XG4gICAgaWYgKGVsZS5jaGVja2VkKSB7XG4gICAgICBjb25zdCBuZXdNaW4gPSAwIDwgZGVmbi5yYW5nZS5tYXggPyAwIDogZGVmbi5yYW5nZS5tYXggLSAxO1xuICAgICAgZGVmbi5yYW5nZSA9IG5ldyBNZXRyaWNSYW5nZShuZXdNaW4sIGRlZm4ucmFuZ2UubWF4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmbi5yYW5nZSA9IG5ldyBNZXRyaWNSYW5nZSgtTnVtYmVyLk1BWF9WQUxVRSwgZGVmbi5yYW5nZS5tYXgpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZU1ldHJpY0RlZmluaXRpb24oZGVmbik7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1heExpbWl0Q2hhbmdlKGU6IEV2ZW50KSB7XG4gICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBkZWZuID0gdGhpcy5nZXREZWZpbml0aW9uQ29weSgpO1xuICAgIGlmIChlbGUuY2hlY2tlZCkge1xuICAgICAgY29uc3QgbmV3TWF4ID0gMTAwID4gZGVmbi5yYW5nZS5taW4gPyAxMDAgOiBkZWZuLnJhbmdlLm1pbiArIDE7XG4gICAgICBkZWZuLnJhbmdlID0gbmV3IE1ldHJpY1JhbmdlKGRlZm4ucmFuZ2UubWluLCBuZXdNYXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZuLnJhbmdlID0gbmV3IE1ldHJpY1JhbmdlKGRlZm4ucmFuZ2UubWluLCBOdW1iZXIuTUFYX1ZBTFVFKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVNZXRyaWNEZWZpbml0aW9uKGRlZm4pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBuYW1lQ2hhbmdlKGU6IEV2ZW50KSB7XG4gICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBvbGROYW1lID0gdGhpcy5tZXRyaWNOYW1lO1xuICAgIGNvbnN0IG5ld05hbWUgPSBlbGUudmFsdWU7XG4gICAgdGhpcy5tZXRyaWNOYW1lID0gbmV3TmFtZTtcbiAgICBjb25zdCByZXQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVPcChSZW5hbWVNZXRyaWNPcChvbGROYW1lLCBuZXdOYW1lKSk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHRoaXMubWV0cmljTmFtZSA9IG9sZE5hbWU7XG4gICAgfVxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGRlZmF1bHRDaGFuZ2UoZTogRXZlbnQpIHtcbiAgICBjb25zdCBlbGUgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IGRlZm4gPSB0aGlzLmdldERlZmluaXRpb25Db3B5KCk7XG4gICAgZGVmbi5kZWZhdWx0ID0gK2VsZS52YWx1ZTtcbiAgICB0aGlzLnVwZGF0ZU1ldHJpY0RlZmluaXRpb24oZGVmbik7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHByZWNpc2lvbkNoYW5nZShlOiBFdmVudCkge1xuICAgIGNvbnN0IGVsZSA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgY29uc3QgZGVmbiA9IHRoaXMuZ2V0RGVmaW5pdGlvbkNvcHkoKTtcbiAgICBkZWZuLnByZWNpc2lvbiA9IG5ldyBQcmVjaXNpb24oK2VsZS52YWx1ZSk7XG4gICAgdGhpcy51cGRhdGVNZXRyaWNEZWZpbml0aW9uKGRlZm4pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBtaW5DaGFuZ2UoZTogRXZlbnQpIHtcbiAgICBjb25zdCBlbGUgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gK2VsZS52YWx1ZTtcbiAgICBjb25zdCBkZWZpbml0aW9uQ29weSA9IHRoaXMuZ2V0RGVmaW5pdGlvbkNvcHkoKTtcbiAgICBkZWZpbml0aW9uQ29weS5yYW5nZSA9IG5ldyBNZXRyaWNSYW5nZShuZXdWYWx1ZSwgZGVmaW5pdGlvbkNvcHkhLnJhbmdlLm1heCk7XG4gICAgdGhpcy51cGRhdGVNZXRyaWNEZWZpbml0aW9uKGRlZmluaXRpb25Db3B5KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWF4Q2hhbmdlKGU6IEV2ZW50KSB7XG4gICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBuZXdWYWx1ZSA9ICtlbGUudmFsdWU7XG4gICAgY29uc3QgZGVmaW5pdGlvbkNvcHkgPSB0aGlzLmdldERlZmluaXRpb25Db3B5KCk7XG4gICAgZGVmaW5pdGlvbkNvcHkucmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoZGVmaW5pdGlvbkNvcHkhLnJhbmdlLm1pbiwgbmV3VmFsdWUpO1xuICAgIHRoaXMudXBkYXRlTWV0cmljRGVmaW5pdGlvbihkZWZpbml0aW9uQ29weSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHVwZGF0ZU1ldHJpY0RlZmluaXRpb24obmV3RGVmOiBNZXRyaWNEZWZpbml0aW9uKSB7XG4gICAgbmV3RGVmLnJhdGlvbmFsaXplKCk7XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5leGVjdXRlT3AoVXBkYXRlTWV0cmljT3AodGhpcy5tZXRyaWNOYW1lLCBuZXdEZWYpKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmVwb3J0RXJyb3IocmV0LmVycm9yKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RGVmaW5pdGlvbkNvcHkoKTogTWV0cmljRGVmaW5pdGlvbiB7XG4gICAgY29uc3QgZGVmbiA9IHRoaXMuZXhwbGFuTWFpbj8ucGxhbi5tZXRyaWNEZWZpbml0aW9uc1t0aGlzLm1ldHJpY05hbWVdO1xuICAgIHJldHVybiBNZXRyaWNEZWZpbml0aW9uLmZyb21KU09OKGRlZm4/LnRvSlNPTigpKTtcbiAgfVxuXG4gIHByaXZhdGUgY2FuY2VsKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLmNsb3NlKCk7XG4gIH1cblxuICBwdWJsaWMgc2hvd01vZGFsKGV4cGxhbk1haW46IEV4cGxhbk1haW4sIG1ldHJpY05hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZXhwbGFuTWFpbiA9IGV4cGxhbk1haW47XG4gICAgdGhpcy5tZXRyaWNOYW1lID0gbWV0cmljTmFtZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLnNob3dNb2RhbCgpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImVkaXQtbWV0cmljLWRlZmluaXRpb25cIiwgRWRpdE1ldHJpY0RlZmluaXRpb24pO1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IGljb24gfSBmcm9tIFwiLi4vaWNvbnMvaWNvbnMudHNcIjtcblxuZXhwb3J0IHR5cGUgRGVwVHlwZSA9IFwicHJlZFwiIHwgXCJzdWNjXCI7XG5cbmV4cG9ydCBjb25zdCBkZXBEaXNwbGF5TmFtZTogUmVjb3JkPERlcFR5cGUsIHN0cmluZz4gPSB7XG4gIHByZWQ6IFwiUHJlZGVjZXNzb3JzXCIsXG4gIHN1Y2M6IFwiU3VjY2Vzc29yc1wiLFxufTtcblxuaW50ZXJmYWNlIERlcGVuZW5jeUV2ZW50IHtcbiAgdGFza0luZGV4OiBudW1iZXI7XG4gIGRlcFR5cGU6IERlcFR5cGU7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJkZWxldGUtZGVwZW5kZW5jeVwiOiBDdXN0b21FdmVudDxEZXBlbmVuY3lFdmVudD47XG4gICAgXCJhZGQtZGVwZW5kZW5jeVwiOiBDdXN0b21FdmVudDxEZXBlbmVuY3lFdmVudD47XG4gIH1cbn1cblxuY29uc3Qga2luZFRlbXBsYXRlID0gKFxuICBkZXBlbmRlbmNpZXNDb250cm9sOiBEZXBlbmRlbmNpZXNQYW5lbCxcbiAgZGVwVHlwZTogRGVwVHlwZSxcbiAgaW5kZXhlczogbnVtYmVyW11cbik6IFRlbXBsYXRlUmVzdWx0ID0+IGh0bWxgXG4gIDx0cj5cbiAgICA8dGg+JHtkZXBEaXNwbGF5TmFtZVtkZXBUeXBlXX08L3RoPlxuICAgIDx0aD48L3RoPlxuICA8L3RyPlxuICAke2luZGV4ZXMubWFwKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSBkZXBlbmRlbmNpZXNDb250cm9sLnRhc2tzW3Rhc2tJbmRleF07XG4gICAgcmV0dXJuIGh0bWxgPHRyPlxuICAgICAgPHRkPiR7dGFzay5uYW1lfTwvdGQ+XG4gICAgICA8dGQ+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICB0aXRsZT1cIkRlbGV0ZSB0aGUgZGVwZW5kZW5jeSBvbiAke3Rhc2submFtZX1cIlxuICAgICAgICAgIEBjbGljaz0keygpID0+IGRlcGVuZGVuY2llc0NvbnRyb2wuZGVsZXRlRGVwKHRhc2tJbmRleCwgZGVwVHlwZSl9XG4gICAgICAgID5cbiAgICAgICAgICAke2ljb24oXCJkZWxldGUtaWNvblwiKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L3RkPlxuICAgIDwvdHI+YDtcbiAgfSl9XG4gIDx0cj5cbiAgICA8dGQ+PC90ZD5cbiAgICA8dGQ+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIGNsYXNzPVwiaWNvbi1idXR0b25cIlxuICAgICAgICBAY2xpY2s9JHsoKSA9PiBkZXBlbmRlbmNpZXNDb250cm9sLmFkZERlcChkZXBUeXBlKX1cbiAgICAgICAgdGl0bGU9XCJBZGQgZGVwZW5kZW5jeS5cIlxuICAgICAgPlxuICAgICAgICAke2ljb24oXCJhZGQtaWNvblwiKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvdGQ+XG4gIDwvdHI+XG5gO1xuXG5jb25zdCB0ZW1wbGF0ZSA9IChcbiAgZGVwZW5kZW5jaWVzQ29udHJvbDogRGVwZW5kZW5jaWVzUGFuZWxcbik6IFRlbXBsYXRlUmVzdWx0ID0+IGh0bWxgXG4gIDx0YWJsZT5cbiAgICAke2tpbmRUZW1wbGF0ZShcbiAgICAgIGRlcGVuZGVuY2llc0NvbnRyb2wsXG4gICAgICBcInByZWRcIixcbiAgICAgIGRlcGVuZGVuY2llc0NvbnRyb2wucHJlZEluZGV4ZXNcbiAgICApfVxuICAgICR7a2luZFRlbXBsYXRlKFxuICAgICAgZGVwZW5kZW5jaWVzQ29udHJvbCxcbiAgICAgIFwic3VjY1wiLFxuICAgICAgZGVwZW5kZW5jaWVzQ29udHJvbC5zdWNjSW5kZXhlc1xuICAgICl9XG4gIDwvdGFibGU+XG5gO1xuXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jaWVzUGFuZWwgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIHRhc2tzOiBUYXNrW10gPSBbXTtcbiAgcHJlZEluZGV4ZXM6IG51bWJlcltdID0gW107XG4gIHN1Y2NJbmRleGVzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBwdWJsaWMgc2V0VGFza3NBbmRJbmRpY2VzKFxuICAgIHRhc2tzOiBUYXNrW10sXG4gICAgcHJlZEluZGV4ZXM6IG51bWJlcltdLFxuICAgIHN1Y2NJbmRleGVzOiBudW1iZXJbXVxuICApIHtcbiAgICB0aGlzLnRhc2tzID0gdGFza3M7XG4gICAgdGhpcy5wcmVkSW5kZXhlcyA9IHByZWRJbmRleGVzO1xuICAgIHRoaXMuc3VjY0luZGV4ZXMgPSBzdWNjSW5kZXhlcztcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgcHVibGljIGRlbGV0ZURlcCh0YXNrSW5kZXg6IG51bWJlciwgZGVwVHlwZTogRGVwVHlwZSkge1xuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgIG5ldyBDdXN0b21FdmVudChcImRlbGV0ZS1kZXBlbmRlbmN5XCIsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgZGVwVHlwZTogZGVwVHlwZSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBhZGREZXAoZGVwVHlwZTogRGVwVHlwZSkge1xuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgIG5ldyBDdXN0b21FdmVudChcImFkZC1kZXBlbmRlbmN5XCIsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgdGFza0luZGV4OiAtMSxcbiAgICAgICAgICBkZXBUeXBlOiBkZXBUeXBlLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImRlcGVuZGVuY2llcy1wYW5lbFwiLCBEZXBlbmRlbmNpZXNQYW5lbCk7XG4iLCAiaW1wb3J0IHtcbiAgVmVydGV4LFxuICBWZXJ0ZXhJbmRpY2VzLFxuICBEaXJlY3RlZEVkZ2UsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbiAgZWRnZXNCeURzdFRvTWFwLFxufSBmcm9tIFwiLi4vZGFnXCI7XG5cbi8qKiBBIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGFwcGxpZWQgdG8gYSBWZXJ0ZXgsIHVzZWQgaW4gbGF0ZXIgZnVuY3Rpb25zIGxpa2VcbkRlcHRoIEZpcnN0IFNlYXJjaCB0byBkbyB3b3JrIG9uIGV2ZXJ5IFZlcnRleCBpbiBhIERpcmVjdGVkR3JhcGguXG4gKi9cbmV4cG9ydCB0eXBlIHZlcnRleEZ1bmN0aW9uID0gKHY6IFZlcnRleCwgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbjtcblxuLyoqIFJldHVybnMgdGhlIGluZGV4IG9mIGFsbCBWZXJ0aWNlcyB0aGF0IGhhdmUgbm8gaW5jb21pbmcgZWRnZS5cbiAqL1xuZXhwb3J0IGNvbnN0IHNldE9mVmVydGljZXNXaXRoTm9JbmNvbWluZ0VkZ2UgPSAoXG4gIGc6IERpcmVjdGVkR3JhcGgsXG4pOiBWZXJ0ZXhJbmRpY2VzID0+IHtcbiAgY29uc3Qgbm9kZXNXaXRoSW5jb21pbmdFZGdlcyA9IGVkZ2VzQnlEc3RUb01hcChnLkVkZ2VzKTtcbiAgY29uc3QgcmV0OiBWZXJ0ZXhJbmRpY2VzID0gW107XG4gIGcuVmVydGljZXMuZm9yRWFjaCgoXzogVmVydGV4LCBpOiBudW1iZXIpID0+IHtcbiAgICBpZiAoIW5vZGVzV2l0aEluY29taW5nRWRnZXMuaGFzKGkpKSB7XG4gICAgICByZXQucHVzaChpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcblxuLyoqIERlc2NlbmRzIHRoZSBncmFwaCBpbiBEZXB0aCBGaXJzdCBTZWFyY2ggYW5kIGFwcGxpZXMgdGhlIGZ1bmN0aW9uIGBmYCB0b1xuZWFjaCBub2RlLlxuICovXG5leHBvcnQgY29uc3QgZGVwdGhGaXJzdFNlYXJjaCA9IChnOiBEaXJlY3RlZEdyYXBoLCBmOiB2ZXJ0ZXhGdW5jdGlvbikgPT4ge1xuICBzZXRPZlZlcnRpY2VzV2l0aE5vSW5jb21pbmdFZGdlKGcpLmZvckVhY2goKHZlcnRleEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBkZXB0aEZpcnN0U2VhcmNoRnJvbUluZGV4KGcsIHZlcnRleEluZGV4LCBmKTtcbiAgfSk7XG59O1xuXG4vKiogRGVwdGggRmlyc3QgU2VhcmNoIHN0YXJ0aW5nIGF0IFZlcnRleCBgc3RhcnRfaW5kZXhgLiAqL1xuZXhwb3J0IGNvbnN0IGRlcHRoRmlyc3RTZWFyY2hGcm9tSW5kZXggPSAoXG4gIGc6IERpcmVjdGVkR3JhcGgsXG4gIHN0YXJ0X2luZGV4OiBudW1iZXIsXG4gIGY6IHZlcnRleEZ1bmN0aW9uLFxuKSA9PiB7XG4gIGNvbnN0IGVkZ2VzQnlTcmMgPSBlZGdlc0J5U3JjVG9NYXAoZy5FZGdlcyk7XG5cbiAgY29uc3QgdmlzaXQgPSAodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGlmIChmKGcuVmVydGljZXNbdmVydGV4SW5kZXhdLCB2ZXJ0ZXhJbmRleCkgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5leHQgPSBlZGdlc0J5U3JjLmdldCh2ZXJ0ZXhJbmRleCk7XG4gICAgaWYgKG5leHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBuZXh0LmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgdmlzaXQoZS5qKTtcbiAgICB9KTtcbiAgfTtcblxuICB2aXNpdChzdGFydF9pbmRleCk7XG59O1xuIiwgImltcG9ydCB7XG4gIERpcmVjdGVkRWRnZSxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeURzdFRvTWFwLFxuICBlZGdlc0J5U3JjVG9NYXAsXG59IGZyb20gXCIuLi9kYWdcIjtcbmltcG9ydCB7IGRlcHRoRmlyc3RTZWFyY2hGcm9tSW5kZXggfSBmcm9tIFwiLi9kZnNcIjtcblxuLyoqIFJldHVybnMgdGhlIGluZGljZXMgb2YgYWxsIHRoZSBzdWNjZXNzb3JzIG9mIHRoZSB0YXNrIGF0IHRoZSBnaXZlbiBpbmRleC5cbiAqICBOb3RlIHRoYXQgaW5jbHVkZXMgdGhlIGdpdmVuIGluZGV4IGl0c2VsZi5cbiAqL1xuZXhwb3J0IGNvbnN0IGFsbFN1Y2Nlc3NvcnMgPSAoXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoXG4pOiBudW1iZXJbXSA9PiB7XG4gIGlmICh0YXNrSW5kZXggPj0gZGlyZWN0ZWRHcmFwaC5WZXJ0aWNlcy5sZW5ndGggLSAxIHx8IHRhc2tJbmRleCA8PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IGFsbENoaWxkcmVuOiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoKTtcbiAgZGVwdGhGaXJzdFNlYXJjaEZyb21JbmRleChcbiAgICBkaXJlY3RlZEdyYXBoLFxuICAgIHRhc2tJbmRleCxcbiAgICAoXzogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBhbGxDaGlsZHJlbi5hZGQoaW5kZXgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICApO1xuICBhbGxDaGlsZHJlbi5kZWxldGUoZGlyZWN0ZWRHcmFwaC5WZXJ0aWNlcy5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIFsuLi5hbGxDaGlsZHJlbi52YWx1ZXMoKV07XG59O1xuXG5leHBvcnQgY29uc3QgYWxsUHJlZGVjZXNzb3JzID0gKFxuICB0YXNrSW5kZXg6IG51bWJlcixcbiAgZGlyZWN0ZWRHcmFwaDogRGlyZWN0ZWRHcmFwaFxuKTogbnVtYmVyW10gPT4ge1xuICBpZiAodGFza0luZGV4ID49IGRpcmVjdGVkR3JhcGguVmVydGljZXMubGVuZ3RoIC0gMSB8fCB0YXNrSW5kZXggPD0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCBwcmVkZWNlc3NvcnNUb0NoZWNrID0gW3Rhc2tJbmRleF07XG4gIGNvbnN0IHJldDogU2V0PG51bWJlcj4gPSBuZXcgU2V0KCk7XG4gIGNvbnN0IGJ5RGVzdCA9IGVkZ2VzQnlEc3RUb01hcChkaXJlY3RlZEdyYXBoLkVkZ2VzKTtcbiAgd2hpbGUgKHByZWRlY2Vzc29yc1RvQ2hlY2subGVuZ3RoICE9PSAwKSB7XG4gICAgY29uc3Qgbm9kZSA9IHByZWRlY2Vzc29yc1RvQ2hlY2sucG9wKCkhO1xuICAgIHJldC5hZGQobm9kZSk7XG4gICAgY29uc3QgcHJlZGVjZXNzb3JzID0gYnlEZXN0LmdldChub2RlKTtcbiAgICBpZiAocHJlZGVjZXNzb3JzKSB7XG4gICAgICBwcmVkZWNlc3NvcnNUb0NoZWNrLnB1c2goLi4ucHJlZGVjZXNzb3JzLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLmkpKTtcbiAgICB9XG4gIH1cbiAgcmV0LmRlbGV0ZSgwKTtcbiAgcmV0dXJuIFsuLi5yZXQudmFsdWVzKCldO1xufTtcblxuLyoqIFJldHVybnMgdGhlIGluZGljZXMgb2YgYWxsIHRoZSB0YXNrcyBpbiB0aGUgZ3JhcGgsIGV4cGVjdCB0aGUgZmlyc3QgYW5kIHRoZVxuICogIGxhc3QuICovXG5leHBvcnQgY29uc3QgYWxsVGFza3MgPSAoZGlyZWN0ZWRHcmFwaDogRGlyZWN0ZWRHcmFwaCk6IG51bWJlcltdID0+IHtcbiAgY29uc3QgcmV0ID0gW107XG4gIGZvciAobGV0IGluZGV4ID0gMTsgaW5kZXggPCBkaXJlY3RlZEdyYXBoLlZlcnRpY2VzLmxlbmd0aCAtIDE7IGluZGV4KyspIHtcbiAgICByZXQucHVzaChpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCBjb25zdCBkaWZmZXJlbmNlID0gKGE6IG51bWJlcltdLCBiOiBudW1iZXJbXSk6IG51bWJlcltdID0+IHtcbiAgY29uc3QgYlNldCA9IG5ldyBTZXQoYik7XG4gIHJldHVybiBhLmZpbHRlcigoaTogbnVtYmVyKSA9PiBiU2V0LmhhcyhpKSA9PT0gZmFsc2UpO1xufTtcblxuZXhwb3J0IGNvbnN0IGFsbFBvdGVudGlhbFN1Y2Nlc3NvcnMgPSAoXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoXG4pOiBudW1iZXJbXSA9PiB7XG4gIC8vIFJlbW92ZSBhbGwgZGlyZWN0IHN1Y2Nlc3NvcnMgYWxzby5cbiAgY29uc3QgYnlTcmMgPSBlZGdlc0J5U3JjVG9NYXAoZGlyZWN0ZWRHcmFwaC5FZGdlcyk7XG4gIGNvbnN0IGRpcmVjdFN1Y2MgPSBieVNyYy5nZXQodGFza0luZGV4KSB8fCBbXTtcbiAgY29uc3QgZGlyZWN0U3VjY0FycmF5ID0gZGlyZWN0U3VjYy5tYXAoKGU6IERpcmVjdGVkRWRnZSkgPT4gZS5qKTtcblxuICByZXR1cm4gZGlmZmVyZW5jZShhbGxUYXNrcyhkaXJlY3RlZEdyYXBoKSwgW1xuICAgIC4uLmFsbFByZWRlY2Vzc29ycyh0YXNrSW5kZXgsIGRpcmVjdGVkR3JhcGgpLFxuICAgIC4uLmRpcmVjdFN1Y2NBcnJheSxcbiAgXSk7XG59O1xuXG5leHBvcnQgY29uc3QgYWxsUG90ZW50aWFsUHJlZGVjZXNzb3JzID0gKFxuICB0YXNrSW5kZXg6IG51bWJlcixcbiAgZGlyZWN0ZWRHcmFwaDogRGlyZWN0ZWRHcmFwaFxuKTogbnVtYmVyW10gPT4ge1xuICAvLyBSZW1vdmUgYWxsIGRpcmVjdCBwcmVkZWNlc3NvcnMgYWxzby5cbiAgY29uc3QgYnlEZXN0ID0gZWRnZXNCeURzdFRvTWFwKGRpcmVjdGVkR3JhcGguRWRnZXMpO1xuICBjb25zdCBkaXJlY3RQcmVkID0gYnlEZXN0LmdldCh0YXNrSW5kZXgpIHx8IFtdO1xuICBjb25zdCBkaXJlY3RQcmVkQXJyYXkgPSBkaXJlY3RQcmVkLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLmkpO1xuICBjb25zdCBhbGxTdWNjID0gYWxsU3VjY2Vzc29ycyh0YXNrSW5kZXgsIGRpcmVjdGVkR3JhcGgpO1xuICBjb25zdCBhbGwgPSBhbGxUYXNrcyhkaXJlY3RlZEdyYXBoKTtcbiAgY29uc3QgdG9CZVN1YnRyYWN0ZWQgPSBbLi4uYWxsU3VjYywgLi4uZGlyZWN0UHJlZEFycmF5XTtcbiAgcmV0dXJuIGRpZmZlcmVuY2UoYWxsLCB0b0JlU3VidHJhY3RlZCk7XG59O1xuIiwgImltcG9ydCB7IFRhc2tTZWFyY2hDb250cm9sIH0gZnJvbSBcIi4uL3NlYXJjaC90YXNrLXNlYXJjaC1jb250cm9sc1wiO1xuaW1wb3J0IHsgQ2hhcnQgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnRcIjtcbmltcG9ydCB7IERlcFR5cGUsIGRlcERpc3BsYXlOYW1lIH0gZnJvbSBcIi4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmNpZXMtcGFuZWxcIjtcbmltcG9ydCB7XG4gIGFsbFBvdGVudGlhbFN1Y2Nlc3NvcnMsXG4gIGFsbFBvdGVudGlhbFByZWRlY2Vzc29ycyxcbn0gZnJvbSBcIi4uL2RhZy9hbGdvcml0aG1zL2NpcmN1bGFyXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGREZXBlbmRlbmN5RGlhbG9nIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBwcml2YXRlIHRpdGxlRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSB0YXNrU2VhcmNoQ29udHJvbDogVGFza1NlYXJjaENvbnRyb2wgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBkaWFsb2c6IEhUTUxEaWFsb2dFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcmVzb2x2ZTogKHZhbHVlOiBudW1iZXIgfCB1bmRlZmluZWQpID0+IHZvaWQgPSAoKSA9PiB7fTtcblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICB0aGlzLnRpdGxlRWxlbWVudCA9IHRoaXMucXVlcnlTZWxlY3RvcihcImgyXCIpITtcbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sID0gdGhpcy5xdWVyeVNlbGVjdG9yKFwidGFzay1zZWFyY2gtY29udHJvbFwiKSE7XG4gICAgdGhpcy5kaWFsb2cgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJkaWFsb2dcIikhO1xuICAgIHRoaXMuZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoXCJjYW5jZWxcIiwgKCkgPT4gdGhpcy5yZXNvbHZlKHVuZGVmaW5lZCkpO1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2wuYWRkRXZlbnRMaXN0ZW5lcihcInRhc2stY2hhbmdlXCIsIChlKSA9PiB7XG4gICAgICB0aGlzLmRpYWxvZyEuY2xvc2UoKTtcbiAgICAgIHRoaXMucmVzb2x2ZShlLmRldGFpbC50YXNrSW5kZXgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFBvcHVsYXRlcyB0aGUgZGlhbG9nIGFuZCBzaG93cyBpdCBhcyBhIE1vZGFsIGRpYWxvZyBhbmQgcmV0dXJucyBhIFByb21pc2VcbiAgICogIHRoYXQgcmVzb2x2ZXMgb24gc3VjY2VzcyB0byBhIHRhc2tJbmRleCwgb3IgdW5kZWZpbmVkIGlmIHRoZSB1c2VyXG4gICAqICBjYW5jZWxsZWQgb3V0IG9mIHRoZSBmbG93LlxuICAgKi9cbiAgcHVibGljIHNlbGVjdERlcGVuZGVuY3koXG4gICAgY2hhcnQ6IENoYXJ0LFxuICAgIHRhc2tJbmRleDogbnVtYmVyLFxuICAgIGRlcFR5cGU6IERlcFR5cGVcbiAgKTogUHJvbWlzZTxudW1iZXIgfCB1bmRlZmluZWQ+IHtcbiAgICB0aGlzLnRpdGxlRWxlbWVudCEudGV4dENvbnRlbnQgPSBkZXBEaXNwbGF5TmFtZVtkZXBUeXBlXTtcblxuICAgIGxldCBpbmNsdWRlZEluZGV4ZXMgPSBbXTtcbiAgICBpZiAoZGVwVHlwZSA9PT0gXCJwcmVkXCIpIHtcbiAgICAgIGluY2x1ZGVkSW5kZXhlcyA9IGFsbFBvdGVudGlhbFByZWRlY2Vzc29ycyh0YXNrSW5kZXgsIGNoYXJ0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5jbHVkZWRJbmRleGVzID0gYWxsUG90ZW50aWFsU3VjY2Vzc29ycyh0YXNrSW5kZXgsIGNoYXJ0KTtcbiAgICB9XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEudGFza3MgPSBjaGFydC5WZXJ0aWNlcztcbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sIS5pbmNsdWRlZEluZGV4ZXMgPSBpbmNsdWRlZEluZGV4ZXM7XG5cbiAgICAvLyBUT0RPIC0gQWxsb3cgYm90aCB0eXBlcyBvZiBzZWFyY2ggaW4gdGhlIGRlcGVuZGVuY3kgZGlhbG9nLlxuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLnNldEtleWJvYXJkRm9jdXNUb0lucHV0KFwibmFtZS1vbmx5XCIpO1xuICAgIGNvbnN0IHJldCA9IG5ldyBQcm9taXNlPG51bWJlciB8IHVuZGVmaW5lZD4oKHJlc29sdmUsIF9yZWplY3QpID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICB0aGlzLmRpYWxvZyEuc2hvd01vZGFsKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJhZGQtZGVwZW5kZW5jeS1kaWFsb2dcIiwgQWRkRGVwZW5kZW5jeURpYWxvZyk7XG4iLCAiaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHsgQWRkUmVzb3VyY2VPcCwgRGVsZXRlUmVzb3VyY2VPcCB9IGZyb20gXCIuLi9vcHMvcmVzb3VyY2VzXCI7XG5pbXBvcnQgeyBleGVjdXRlT3AgfSBmcm9tIFwiLi4vYWN0aW9uL2V4ZWN1dGVcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBFZGl0UmVzb3VyY2VEZWZpbml0aW9uIH0gZnJvbSBcIi4uL2VkaXQtcmVzb3VyY2UtZGVmaW5pdGlvbi9lZGl0LXJlc291cmNlLWRlZmluaXRpb25cIjtcbmltcG9ydCB7IGljb24gfSBmcm9tIFwiLi4vaWNvbnMvaWNvbnNcIjtcblxuLy8gTG9uZ2VzdCByZXByZXNlbnRhdGlvbiB3ZSdsbCBzaG93IGZvciBhbGwgdGhlIG9wdGlvbnMgb2YgYSBSZXNvdXJjZS5cbmNvbnN0IE1BWF9TSE9SVF9TVFJJTkcgPSA4MDtcblxuZXhwb3J0IGNsYXNzIEVkaXRSZXNvdXJjZXNEaWFsb2cgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW4gfCBudWxsID0gbnVsbDtcbiAgcGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2s6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuZXhwbGFuTWFpbiAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBzaG93TW9kYWwoZXhwbGFuTWFpbjogRXhwbGFuTWFpbikge1xuICAgIHRoaXMuZXhwbGFuTWFpbiA9IGV4cGxhbk1haW47XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5zaG93TW9kYWwoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyKCkge1xuICAgIHJlbmRlcih0aGlzLnRlbXBsYXRlKCksIHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSB2YWx1ZXNUb1Nob3J0U3RyaW5nKHZhbHVlczogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgIGxldCByZXQgPSB2YWx1ZXMuam9pbihcIiwgXCIpO1xuICAgIGlmIChyZXQubGVuZ3RoID4gTUFYX1NIT1JUX1NUUklORykge1xuICAgICAgcmV0ID0gcmV0LnNsaWNlKDAsIE1BWF9TSE9SVF9TVFJJTkcpICsgXCIgLi4uXCI7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBwcml2YXRlIGRlbEJ1dHRvbklmTm90U3RhdGljKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBpc1N0YXRpYzogYm9vbGVhblxuICApOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgaWYgKGlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gaHRtbGBgO1xuICAgIH1cbiAgICByZXR1cm4gaHRtbGA8YnV0dG9uXG4gICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgIHRpdGxlPVwiRGVsZXRlIHRoaXMgcmVzb3VyY2UuXCJcbiAgICAgIEBjbGljaz0keygpID0+IHRoaXMuZGVsZXRlUmVzb3VyY2UobmFtZSl9XG4gICAgPlxuICAgICAgJHtpY29uKFwiZGVsZXRlLWljb25cIil9XG4gICAgPC9idXR0b24+YDtcbiAgfVxuXG4gIHByaXZhdGUgZWRpdEJ1dHRvbklmTm90U3RhdGljKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBpc1N0YXRpYzogYm9vbGVhblxuICApOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgaWYgKGlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gaHRtbGBgO1xuICAgIH1cbiAgICByZXR1cm4gaHRtbGA8YnV0dG9uXG4gICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgIHRpdGxlPVwiRWRpdCB0aGUgcmVzb3VyY2UgZGVmaW5pdGlvbi5cIlxuICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5lZGl0UmVzb3VyY2UobmFtZSl9XG4gICAgPlxuICAgICAgJHtpY29uKFwiZWRpdC1pY29uXCIpfVxuICAgIDwvYnV0dG9uPmA7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGRlbGV0ZVJlc291cmNlKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGVPcChcbiAgICAgIERlbGV0ZVJlc291cmNlT3AobmFtZSksXG4gICAgICBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLFxuICAgICAgdHJ1ZSxcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiFcbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9zZSgpIHtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5jbG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBlZGl0UmVzb3VyY2UobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICAgIHRoaXMuZXhwbGFuTWFpbiEucXVlcnlTZWxlY3RvcjxFZGl0UmVzb3VyY2VEZWZpbml0aW9uPihcbiAgICAgIFwiZWRpdC1yZXNvdXJjZS1kZWZpbml0aW9uXCJcbiAgICApIS5zaG93TW9kYWwoXG4gICAgICB0aGlzLmV4cGxhbk1haW4hLFxuICAgICAgbmFtZSxcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiEucGxhbi5yZXNvdXJjZURlZmluaXRpb25zW25hbWVdXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbmV3UmVzb3VyY2UoKSB7XG4gICAgY29uc3QgbmFtZSA9IHdpbmRvdy5wcm9tcHQoXCJSZXNvdXJjZSBuYW1lOlwiLCBcIlwiKTtcbiAgICBpZiAobmFtZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBhd2FpdCBleGVjdXRlT3AoXG4gICAgICBBZGRSZXNvdXJjZU9wKG5hbWUpLFxuICAgICAgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIixcbiAgICAgIHRydWUsXG4gICAgICB0aGlzLmV4cGxhbk1haW4hXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgd2luZG93LmFsZXJ0KHJldC5lcnJvcik7XG4gICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSB0ZW1wbGF0ZSgpOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgY29uc3QgcmQgPSB0aGlzLmV4cGxhbk1haW4hLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucztcbiAgICBjb25zdCBhbGxLZXlzU29ydGVkID0gT2JqZWN0LmtleXMocmQpLnNvcnQoXG4gICAgICAoa2V5QTogc3RyaW5nLCBrZXlCOiBzdHJpbmcpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBhID0gcmRba2V5QV07XG4gICAgICAgIGNvbnN0IGIgPSByZFtrZXlCXTtcbiAgICAgICAgaWYgKGEuaXNTdGF0aWMgPT09IGIuaXNTdGF0aWMpIHtcbiAgICAgICAgICByZXR1cm4ga2V5QS5sb2NhbGVDb21wYXJlKGtleUIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhLmlzU3RhdGljKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuICAgICk7XG5cbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxkaWFsb2c+XG4gICAgICAgIDxoMz5SZXNvdXJjZXM8L2gzPlxuICAgICAgICA8dGFibGU+XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRoPk5hbWU8L3RoPlxuICAgICAgICAgICAgPHRoPlZhbHVlczwvdGg+XG4gICAgICAgICAgICA8dGg+RGVsZXRlPC90aD5cbiAgICAgICAgICAgIDx0aD5FZGl0PC90aD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgICR7YWxsS2V5c1NvcnRlZC5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRlZm4gPSByZFtuYW1lXTtcbiAgICAgICAgICAgIHJldHVybiBodG1sYDx0cj5cbiAgICAgICAgICAgICAgPHRkPiR7bmFtZX08L3RkPlxuICAgICAgICAgICAgICA8dGQ+JHt0aGlzLnZhbHVlc1RvU2hvcnRTdHJpbmcoZGVmbi52YWx1ZXMpfTwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD4ke3RoaXMuZGVsQnV0dG9uSWZOb3RTdGF0aWMobmFtZSwgZGVmbi5pc1N0YXRpYyl9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPiR7dGhpcy5lZGl0QnV0dG9uSWZOb3RTdGF0aWMobmFtZSwgZGVmbi5pc1N0YXRpYyl9PC90ZD5cbiAgICAgICAgICAgIDwvdHI+YDtcbiAgICAgICAgICB9KX1cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICB0aXRsZT1cIkFkZCBhIG5ldyBSZXNvdXJjZS5cIlxuICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMubmV3UmVzb3VyY2UoKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgJHtpY29uKFwiYWRkLWljb25cIil9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZGlhbG9nLWZvb3RlclwiPlxuICAgICAgICAgIDxidXR0b24gQGNsaWNrPSR7KCkgPT4gdGhpcy5jbG9zZSgpfT5DbG9zZTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGlhbG9nPlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwiZWRpdC1yZXNvdXJjZXMtZGlhbG9nXCIsIEVkaXRSZXNvdXJjZXNEaWFsb2cpO1xuIiwgIi8qKlxuICogVHJpYW5ndWxhciBpcyB0aGUgaW52ZXJzZSBDdW11bGF0aXZlIERlbnNpdHkgRnVuY3Rpb24gKENERikgZm9yIHRoZVxuICogdHJpYW5ndWxhciBkaXN0cmlidXRpb24uXG4gKlxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVHJpYW5ndWxhcl9kaXN0cmlidXRpb24jR2VuZXJhdGluZ19yYW5kb21fdmFyaWF0ZXNcbiAqXG4gKiBUaGUgaW52ZXJzZSBvZiB0aGUgQ0RGIGlzIHVzZWZ1bCBmb3IgZ2VuZXJhdGluZyBzYW1wbGVzIGZyb20gdGhlXG4gKiBkaXN0cmlidXRpb24sIGkuZS4gcGFzc2luZyBpbiB2YWx1ZXMgZnJvbSB0aGUgdW5pZm9ybSBkaXN0cmlidXRpb24gWzAsIDFdXG4gKiB3aWxsIHByb2R1Y2Ugc2FtcGxlIHRoYXQgbG9vayBsaWtlIHRoZXkgY29tZSBmcm9tIHRoZSB0cmlhbmd1bGFyXG4gKiBkaXN0cmlidXRpb24uXG4gKlxuICpcbiAqL1xuXG5leHBvcnQgY2xhc3MgVHJpYW5ndWxhciB7XG4gIHByaXZhdGUgYTogbnVtYmVyO1xuICBwcml2YXRlIGI6IG51bWJlcjtcbiAgcHJpdmF0ZSBjOiBudW1iZXI7XG4gIHByaXZhdGUgRl9jOiBudW1iZXI7XG5cbiAgLyoqICBUaGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24gaXMgYSBjb250aW51b3VzIHByb2JhYmlsaXR5IGRpc3RyaWJ1dGlvbiB3aXRoXG4gIGxvd2VyIGxpbWl0IGBhYCwgdXBwZXIgbGltaXQgYGJgLCBhbmQgbW9kZSBgY2AsIHdoZXJlIGEgPCBiIGFuZCBhIFx1MjI2NCBjIFx1MjI2NCBiLiAqL1xuICBjb25zdHJ1Y3RvcihhOiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyKSB7XG4gICAgdGhpcy5hID0gYTtcbiAgICB0aGlzLmIgPSBiO1xuICAgIHRoaXMuYyA9IGM7XG5cbiAgICAvLyBGX2MgaXMgdGhlIGN1dG9mZiBpbiB0aGUgZG9tYWluIHdoZXJlIHdlIHN3aXRjaCBiZXR3ZWVuIHRoZSB0d28gaGFsdmVzIG9mXG4gICAgLy8gdGhlIHRyaWFuZ2xlLlxuICAgIHRoaXMuRl9jID0gKGMgLSBhKSAvIChiIC0gYSk7XG4gIH1cblxuICAvKiogIFByb2R1Y2UgYSBzYW1wbGUgZnJvbSB0aGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24uIFRoZSB2YWx1ZSBvZiAncCdcbiAgIHNob3VsZCBiZSBpbiBbMCwgMS4wXS4gKi9cbiAgc2FtcGxlKHA6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKHAgPCAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9IGVsc2UgaWYgKHAgPiAxLjApIHtcbiAgICAgIHJldHVybiAxLjA7XG4gICAgfSBlbHNlIGlmIChwIDwgdGhpcy5GX2MpIHtcbiAgICAgIHJldHVybiB0aGlzLmEgKyBNYXRoLnNxcnQocCAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYyAtIHRoaXMuYSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLmIgLSBNYXRoLnNxcnQoKDEgLSBwKSAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYiAtIHRoaXMuYykpXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IFRyaWFuZ3VsYXIgfSBmcm9tIFwiLi90cmlhbmd1bGFyLnRzXCI7XG5cbmV4cG9ydCB0eXBlIFVuY2VydGFpbnR5ID0gXCJsb3dcIiB8IFwibW9kZXJhdGVcIiB8IFwiaGlnaFwiIHwgXCJleHRyZW1lXCI7XG5cbmV4cG9ydCBjb25zdCBVbmNlcnRhaW50eVRvTnVtOiBSZWNvcmQ8VW5jZXJ0YWludHksIG51bWJlcj4gPSB7XG4gIGxvdzogMS4xLFxuICBtb2RlcmF0ZTogMS41LFxuICBoaWdoOiAyLFxuICBleHRyZW1lOiA1LFxufTtcblxuZXhwb3J0IGNsYXNzIEphY29iaWFuIHtcbiAgcHJpdmF0ZSB0cmlhbmd1bGFyOiBUcmlhbmd1bGFyO1xuICBjb25zdHJ1Y3RvcihleHBlY3RlZDogbnVtYmVyLCB1bmNlcnRhaW50eTogVW5jZXJ0YWludHkpIHtcbiAgICBjb25zdCBtdWwgPSBVbmNlcnRhaW50eVRvTnVtW3VuY2VydGFpbnR5XTtcbiAgICB0aGlzLnRyaWFuZ3VsYXIgPSBuZXcgVHJpYW5ndWxhcihleHBlY3RlZCAvIG11bCwgZXhwZWN0ZWQgKiBtdWwsIGV4cGVjdGVkKTtcbiAgfVxuXG4gIHNhbXBsZShwOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnRyaWFuZ3VsYXIuc2FtcGxlKHApO1xuICB9XG59XG4iLCAiaW1wb3J0IHtcbiAgZGF0ZUNvbnRyb2xEYXRlUmUsXG4gIGRhdGVDb250cm9sVmFsdWUsXG59IGZyb20gXCIuLi9kYXRlLWNvbnRyb2wtdXRpbHMvZGF0ZS1jb250cm9sLXV0aWxzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIGVycm9yLCBvayB9IGZyb20gXCIuLi9yZXN1bHRcIjtcblxuZXhwb3J0IGNsYXNzIFdlZWtkYXlzIHtcbiAgc3RhcnQ6IERhdGU7XG5cbiAgLyoqXG4gICAqIE1hcHMgZnJvbSBhIG51bWJlciBvZiB3ZWVrZGF5cyAoZnJvbSB0aGlzLnN0YXJ0KSB0byBhIG51bWJlciBvZiBkYXlzICh3aGljaFxuICAgKiBpZ25vcmVzIGluY2x1ZGVzIHdlZWtlbmRzLlxuICAgKi9cbiAgY2FjaGU6IE1hcDxudW1iZXIsIG51bWJlcj47XG4gIGxhc3RDYWNoZUVudHJ5OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc3RhcnQ6IERhdGUpIHtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgdGhpcy5jYWNoZSA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmNhY2hlLnNldCgwLCAwKTtcbiAgICB0aGlzLmxhc3RDYWNoZUVudHJ5ID0gMDtcbiAgfVxuXG4gIGRhdGVUb1dlZWtkYXkoczogc3RyaW5nKTogUmVzdWx0PG51bWJlcj4ge1xuICAgIGlmICghZGF0ZUNvbnRyb2xEYXRlUmUudGVzdChzKSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihgJHtzfSBpcyBub3QgYSB2YWxpZCBkYXRlYCkpO1xuICAgIH1cbiAgICAvLyBUaGlzIHNob3VsZCBiZSBkb25lIGZhc3RlciwgcG9zc2libHkgdy9jYWNoaW5nLlxuXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHMpO1xuICAgIGlmIChkYXRlIDw9IHRoaXMuc3RhcnQpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoYCR7ZGF0ZX0gY29tZXMgYmVmb3JlICR7dGhpcy5zdGFydH1gKSk7XG4gICAgfVxuICAgIGxldCBzdGFydCA9IG5ldyBEYXRlKHRoaXMuc3RhcnQuZ2V0VGltZSgpKTtcbiAgICBsZXQgZm9ybWF0dGVkRGF0ZSA9IGRhdGVDb250cm9sVmFsdWUoc3RhcnQpO1xuICAgIGxldCB3ZWVrRGF5ID0gMDtcbiAgICB3aGlsZSAoZm9ybWF0dGVkRGF0ZSA8IHMpIHtcbiAgICAgIGNvbnN0IG9sZERhdGUgPSBzdGFydC5nZXREYXRlKCk7XG4gICAgICBzdGFydC5zZXREYXRlKG9sZERhdGUgKyAxKTtcblxuICAgICAgY29uc3QgZGF5T2ZXZWVrID0gc3RhcnQuZ2V0RGF5KCk7XG4gICAgICBpZiAoZGF5T2ZXZWVrID09PSAwIHx8IGRheU9mV2VlayA9PT0gNikge1xuICAgICAgICAvLyBTdW4gb3IgU2F0LlxuICAgICAgICAvLyBUT0RPIC0gSGVyZSBpcyB3aGVyZSBob2xpZGF5IGNoZWNrcyB3b3VsZCBnby5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHdlZWtEYXkgKz0gMTtcbiAgICAgIGZvcm1hdHRlZERhdGUgPSBkYXRlQ29udHJvbFZhbHVlKHN0YXJ0KTtcbiAgICB9XG4gICAgcmV0dXJuIG9rKHdlZWtEYXkpO1xuICB9XG5cbiAgd2Vla2RheXNUb0RheXMobnVtV2Vla2RheXM6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKG51bVdlZWtkYXlzIDwgMCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIG51bVdlZWtkYXlzID0gTWF0aC50cnVuYyhudW1XZWVrZGF5cyk7XG4gICAgY29uc3QgY2FjaGVWYWx1ZSA9IHRoaXMuY2FjaGUuZ2V0KG51bVdlZWtkYXlzKTtcbiAgICBpZiAoY2FjaGVWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gY2FjaGVWYWx1ZTtcbiAgICB9XG5cbiAgICBsZXQgc3RhcnQgPSBuZXcgRGF0ZSh0aGlzLnN0YXJ0LmdldFRpbWUoKSk7XG4gICAgbGV0IHdlZWtkYXkgPSB0aGlzLmxhc3RDYWNoZUVudHJ5O1xuICAgIGxldCBkYXkgPSB0aGlzLmNhY2hlLmdldCh3ZWVrZGF5KSE7XG4gICAgc3RhcnQuc2V0RGF0ZShzdGFydC5nZXREYXRlKCkgKyBkYXkpO1xuXG4gICAgd2hpbGUgKHdlZWtkYXkgIT09IG51bVdlZWtkYXlzKSB7XG4gICAgICBjb25zdCBvbGREYXRlID0gc3RhcnQuZ2V0RGF0ZSgpO1xuICAgICAgc3RhcnQuc2V0RGF0ZShvbGREYXRlICsgMSk7XG4gICAgICBkYXkgKz0gMTtcblxuICAgICAgY29uc3QgZGF5T2ZXZWVrID0gc3RhcnQuZ2V0RGF5KCk7XG4gICAgICBpZiAoZGF5T2ZXZWVrID09PSAwIHx8IGRheU9mV2VlayA9PT0gNikge1xuICAgICAgICAvLyBTdW4gb3IgU2F0LlxuICAgICAgICAvLyBUT0RPIC0gSGVyZSBpcyB3aGVyZSBob2xpZGF5IGNoZWNrcyB3b3VsZCBnby5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB3ZWVrZGF5ICs9IDE7XG4gICAgICB0aGlzLmNhY2hlLnNldCh3ZWVrZGF5LCBkYXkpO1xuICAgIH1cbiAgICB0aGlzLmxhc3RDYWNoZUVudHJ5ID0gd2Vla2RheTtcbiAgICByZXR1cm4gZGF5O1xuICB9XG59XG4iLCAiaW1wb3J0IHsgZGF0ZUNvbnRyb2xEYXRlUmUgfSBmcm9tIFwiLi4vZGF0ZS1jb250cm9sLXV0aWxzL2RhdGUtY29udHJvbC11dGlsc1wiO1xuaW1wb3J0IHsgTWV0cmljRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3NcIjtcbmltcG9ydCB7IFJlc3VsdCwgZXJyb3IsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgcGFyc2VEdXJhdGlvbiB9IGZyb20gXCIuL3BhcnNlXCI7XG5pbXBvcnQgeyBXZWVrZGF5cyB9IGZyb20gXCIuL3dlZWtkYXlzXCI7XG5cbi8vIFVuaXQgZGVzY3JpYmVzIGhvdyB0aGUgZHVyYXRpb24gdmFsdWVzIGFyZSB0byBiZSBpbnRlcnByZXRlZC5cbmFic3RyYWN0IGNsYXNzIFVuaXQge1xuICAvLyBDb252ZXJ0IGEgZHVyYXRpb24gaW50byBhIGRpc3BsYXlhYmxlIHN0cmluZy5cbiAgYWJzdHJhY3QgZGlzcGxheVRpbWUodDogbnVtYmVyLCBsb2NhbGU/OiBJbnRsLkxvY2FsZXNBcmd1bWVudCk6IHN0cmluZztcblxuICAvLyBQYXJzZSBhIGR1cmF0aW9uLCBlaXRoZXIgYXMgYSByYXcgbnVtYmVyLCBvciBpbiBhIHNob3J0aGFuZCBkdXJhdGlvbiwgc3VjaFxuICAvLyBhcyAxZCwgMmQsIDV5LlxuICBhYnN0cmFjdCBwYXJzZShzOiBzdHJpbmcpOiBSZXN1bHQ8bnVtYmVyPjtcblxuICAvLyBUT0RPIC0gTmVlZHMgYSBtZXRob2QgdG8gZ28gZnJvbSBEYXRlKCkgdG8gZHVyYXRpb24uXG59XG5cbi8vIFRoZSBmb3JtIGEgVW5pdCB0YWtlcyB3aGVuIHNlcmlhbGl6ZWQgdG8gSlNPTi5cbi8vXG4vLyBOb3RlIHdlIGRvbid0IHNlcmlhbGl6ZSB0aGUgTWV0cmljRGVmaW5pdGlvbiBzaW5jZSB0aGF0IGNvbWVzIGZyb20gdGhlXG4vLyBcIkR1cmF0aW9uXCIgc3RhdGljIG1ldHJpYy5cbmV4cG9ydCBpbnRlcmZhY2UgVW5pdFNlcmlhbGl6ZWQge1xuICB1bml0VHlwZTogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgVW5pdEJhc2UgaW1wbGVtZW50cyBVbml0IHtcbiAgcHJvdGVjdGVkIHN0YXJ0OiBEYXRlO1xuICBwcm90ZWN0ZWQgbWV0cmljRGVmbjogTWV0cmljRGVmaW5pdGlvbjtcbiAgcHJvdGVjdGVkIHVuaXRUeXBlOiBVbml0VHlwZXM7XG5cbiAgY29uc3RydWN0b3Ioc3RhcnQ6IERhdGUsIG1ldHJpY0RlZm46IE1ldHJpY0RlZmluaXRpb24sIHVuaXRUeXBlOiBVbml0VHlwZXMpIHtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgdGhpcy5tZXRyaWNEZWZuID0gbWV0cmljRGVmbjtcbiAgICB0aGlzLnVuaXRUeXBlID0gdW5pdFR5cGU7XG4gIH1cblxuICBkaXNwbGF5VGltZSh0OiBudW1iZXIsIGxvY2FsZT86IEludGwuTG9jYWxlc0FyZ3VtZW50KTogc3RyaW5nIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2QgaW1wbGVtZW50ZWQgaW4gc3ViY2xhc3Nlcy5cIik7XG4gIH1cblxuICBhc0RhdGUodDogbnVtYmVyKTogRGF0ZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIGltcGxlbWVudGVkIGluIHN1YmNsYXNzZXMuXCIpO1xuICB9XG5cbiAgcGFyc2Uoczogc3RyaW5nKTogUmVzdWx0PG51bWJlcj4ge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBpbXBsZW1lbnRlZCBpbiBzdWJjbGFzc2VzLlwiKTtcbiAgfVxuXG4gIGtpbmQoKTogVW5pdFR5cGVzIHtcbiAgICByZXR1cm4gdGhpcy51bml0VHlwZTtcbiAgfVxuXG4gIHRvSlNPTigpOiBVbml0U2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHsgdW5pdFR5cGU6IHRoaXMudW5pdFR5cGUgfTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSlNPTihcbiAgICBzOiBVbml0U2VyaWFsaXplZCxcbiAgICBzdGFydDogRGF0ZSxcbiAgICBtZXRyaWNEZWZuOiBNZXRyaWNEZWZpbml0aW9uXG4gICk6IFVuaXRCYXNlIHtcbiAgICByZXR1cm4gVW5pdEJ1aWxkZXJzW3RvVW5pdChzLnVuaXRUeXBlKV0oc3RhcnQsIG1ldHJpY0RlZm4pO1xuICB9XG59XG5cbmNvbnN0IFVOSVRfVFlQRVMgPSBbXCJVbml0bGVzc1wiLCBcIkRheXNcIiwgXCJXZWVrZGF5c1wiXSBhcyBjb25zdDtcblxuLy8gQWxsIHR5cGVzIG9mIGR1cmF0aW9uIHVuaXRzIGF2YWlsYWJsZS5cbmV4cG9ydCB0eXBlIFVuaXRUeXBlcyA9ICh0eXBlb2YgVU5JVF9UWVBFUylbbnVtYmVyXTtcblxuLy8gRGVzY3JpYmVzIGVhY2ggdHlwZSBvZiBVbml0IGF2YWlsYWJsZS5cbmV4cG9ydCBjb25zdCBVbml0RGVzY3JpcHRpb25zOiBSZWNvcmQ8VW5pdFR5cGVzLCBzdHJpbmc+ID0ge1xuICBVbml0bGVzczogXCJVbml0bGVzcyBkdXJhdGlvbnMuXCIsXG4gIERheXM6IFwiRGF5cywgd2l0aCA3IGRheXMgYSB3ZWVrLlwiLFxuICBXZWVrZGF5czogXCJEYXlzLCB3aXRoIDUgZGF5cyBhIHdlZWsuXCIsXG59O1xuXG4vLyBCdWlsZGVycyBmb3IgZWFjaCB0eXBlIG9mIFVuaXQuXG5leHBvcnQgY29uc3QgVW5pdEJ1aWxkZXJzOiBSZWNvcmQ8XG4gIFVuaXRUeXBlcyxcbiAgKHN0YXJ0OiBEYXRlLCBtZXRyaWNEZWZuOiBNZXRyaWNEZWZpbml0aW9uKSA9PiBVbml0QmFzZVxuPiA9IHtcbiAgVW5pdGxlc3M6IChzdGFydDogRGF0ZSwgbWV0cmljRGVmbjogTWV0cmljRGVmaW5pdGlvbikgPT5cbiAgICBuZXcgVW5pdGxlc3Moc3RhcnQsIG1ldHJpY0RlZm4pLFxuICBEYXlzOiAoc3RhcnQ6IERhdGUsIG1ldHJpY0RlZm46IE1ldHJpY0RlZmluaXRpb24pID0+XG4gICAgbmV3IERheXMoc3RhcnQsIG1ldHJpY0RlZm4pLFxuICBXZWVrZGF5czogKHN0YXJ0OiBEYXRlLCBtZXRyaWNEZWZuOiBNZXRyaWNEZWZpbml0aW9uKSA9PlxuICAgIG5ldyBXZWVrRGF5cyhzdGFydCwgbWV0cmljRGVmbiksXG59O1xuXG4vLyBQYXJzZSBzdHJpbmcgaW50byBhIHZhbGlkIFVuaXRUeXBlcy5cbmV4cG9ydCBjb25zdCB0b1VuaXQgPSAoczogc3RyaW5nKTogVW5pdFR5cGVzID0+IHtcbiAgaWYgKFVOSVRfVFlQRVMuc29tZSgodDogVW5pdFR5cGVzKSA9PiB0ID09PSBzKSkge1xuICAgIHJldHVybiBzIGFzIFVuaXRUeXBlcztcbiAgfVxuICByZXR1cm4gXCJVbml0bGVzc1wiO1xufTtcblxuLy8gVW5pdGxlc3MuXG5leHBvcnQgY2xhc3MgVW5pdGxlc3MgZXh0ZW5kcyBVbml0QmFzZSBpbXBsZW1lbnRzIFVuaXQge1xuICBjb25zdHJ1Y3RvcihzdGFydDogRGF0ZSwgbWV0cmljRGVmbjogTWV0cmljRGVmaW5pdGlvbikge1xuICAgIHN1cGVyKHN0YXJ0LCBtZXRyaWNEZWZuLCBcIlVuaXRsZXNzXCIpO1xuICB9XG5cbiAgZGlzcGxheVRpbWUodDogbnVtYmVyLCBsb2NhbGU/OiBJbnRsLkxvY2FsZXNBcmd1bWVudCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubWV0cmljRGVmbi5jbGFtcEFuZFJvdW5kKHQpLnRvU3RyaW5nKCk7XG4gIH1cblxuICBhc0RhdGUodDogbnVtYmVyKTogRGF0ZSB7XG4gICAgLy8gU2hvdWxkIG5ldmVyIGJlIGNhbGxlZC5cbiAgICByZXR1cm4gdGhpcy5zdGFydDtcbiAgfVxuXG4gIHBhcnNlKHM6IHN0cmluZyk6IFJlc3VsdDxudW1iZXI+IHtcbiAgICBjb25zdCBwYXJzZWQgPSArcztcbiAgICBpZiAoTnVtYmVyLmlzTmFOKHBhcnNlZCkpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoYEludmFsaWQgbnVtYmVyIHZhbHVlOiAke3N9YCkpO1xuICAgIH1cbiAgICByZXR1cm4gb2sodGhpcy5tZXRyaWNEZWZuLmNsYW1wQW5kUm91bmQocGFyc2VkKSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERheXMgZXh0ZW5kcyBVbml0QmFzZSBpbXBsZW1lbnRzIFVuaXQge1xuICBjb25zdHJ1Y3RvcihzdGFydDogRGF0ZSwgbWV0cmljRGVmbjogTWV0cmljRGVmaW5pdGlvbikge1xuICAgIHN1cGVyKHN0YXJ0LCBtZXRyaWNEZWZuLCBcIkRheXNcIik7XG4gIH1cblxuICBkaXNwbGF5VGltZSh0OiBudW1iZXIsIGxvY2FsZT86IEludGwuTG9jYWxlc0FyZ3VtZW50KTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5hc0RhdGUodCkudG9Mb2NhbGVEYXRlU3RyaW5nKGxvY2FsZSk7XG4gIH1cblxuICBhc0RhdGUodDogbnVtYmVyKTogRGF0ZSB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRoaXMuc3RhcnQuZ2V0VGltZSgpKTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgKyB0KTtcbiAgICByZXR1cm4gZDtcbiAgfVxuXG4gIHBhcnNlKHM6IHN0cmluZyk6IFJlc3VsdDxudW1iZXI+IHtcbiAgICBpZiAoIWRhdGVDb250cm9sRGF0ZVJlLnRlc3QocykpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoYCR7c30gaXMgbm90IGEgdmFsaWQgZGF0ZWApKTtcbiAgICB9XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHMpO1xuXG4gICAgcmV0dXJuIG9rKFxuICAgICAgdGhpcy5tZXRyaWNEZWZuLmNsYW1wQW5kUm91bmQoXG4gICAgICAgIChkLmdldFRpbWUoKSAtIHRoaXMuc3RhcnQuZ2V0VGltZSgpKSAvICgxMDAwICogNjAgKiA2MCAqIDI0KVxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFdlZWtEYXlzIGV4dGVuZHMgVW5pdEJhc2UgaW1wbGVtZW50cyBVbml0IHtcbiAgd2Vla2RheXM6IFdlZWtkYXlzO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXJ0OiBEYXRlLCBtZXRyaWNEZWZuOiBNZXRyaWNEZWZpbml0aW9uKSB7XG4gICAgc3VwZXIoc3RhcnQsIG1ldHJpY0RlZm4sIFwiV2Vla2RheXNcIik7XG4gICAgdGhpcy53ZWVrZGF5cyA9IG5ldyBXZWVrZGF5cyhzdGFydCk7XG4gIH1cblxuICAvLyBMb2NhbGUgb25seSB1c2VkIGZvciB0ZXN0aW5nLlxuICBkaXNwbGF5VGltZSh0OiBudW1iZXIsIGxvY2FsZT86IEludGwuTG9jYWxlc0FyZ3VtZW50KTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5hc0RhdGUodCkudG9Mb2NhbGVEYXRlU3RyaW5nKGxvY2FsZSk7XG4gIH1cblxuICBhc0RhdGUodDogbnVtYmVyKTogRGF0ZSB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRoaXMuc3RhcnQuZ2V0VGltZSgpKTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgKyB0aGlzLndlZWtkYXlzLndlZWtkYXlzVG9EYXlzKHQpKTtcbiAgICByZXR1cm4gZDtcbiAgfVxuXG4gIHBhcnNlKHM6IHN0cmluZyk6IFJlc3VsdDxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy53ZWVrZGF5cy5kYXRlVG9XZWVrZGF5KHMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsga2V5ZWQgfSBmcm9tIFwibGl0LWh0bWwvZGlyZWN0aXZlcy9rZXllZC5qc1wiO1xuaW1wb3J0IHsgQ2hhcnQsIENoYXJ0U2VyaWFsaXplZCwgQ2hhcnRWYWxpZGF0ZSwgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHtcbiAgTWV0cmljRGVmaW5pdGlvbixcbiAgTWV0cmljRGVmaW5pdGlvbnMsXG4gIE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgTWV0cmljUmFuZ2UgfSBmcm9tIFwiLi4vbWV0cmljcy9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUmF0aW9uYWxpemVFZGdlc09wIH0gZnJvbSBcIi4uL29wcy9jaGFydC50c1wiO1xuaW1wb3J0IHtcbiAgUGxhblN0YXR1cyxcbiAgUGxhblN0YXR1c1NlcmlhbGl6ZWQsXG4gIHRvSlNPTiBhcyBzdGF0dXNUb0pTT04sXG4gIGZyb21KU09OIGFzIHN0YXR1c0Zyb21KU09OLFxuICBzdGF0dXNUb0RhdGUsXG59IGZyb20gXCIuLi9wbGFuX3N0YXR1cy9wbGFuX3N0YXR1cy50c1wiO1xuaW1wb3J0IHtcbiAgUmVzb3VyY2VEZWZpbml0aW9uLFxuICBSZXNvdXJjZURlZmluaXRpb25zLFxuICBSZXNvdXJjZURlZmluaXRpb25zU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgZXJyb3IsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgVW5jZXJ0YWludHlUb051bSB9IGZyb20gXCIuLi9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhbi50c1wiO1xuaW1wb3J0IHtcbiAgVGFza0NvbXBsZXRpb25zLFxuICBUYXNrQ29tcGxldGlvbnNTZXJpYWxpemVkLFxuICB0YXNrQ29tcGxldGlvbnNUb0pTT04sXG4gIHRhc2tDb21wbGV0aW9uc0Zyb21KU09OLFxuICBUYXNrQ29tcGxldGlvbixcbn0gZnJvbSBcIi4uL3Rhc2tfY29tcGxldGlvbi90YXNrX2NvbXBsZXRpb24udHNcIjtcbmltcG9ydCB7XG4gIERheXMsXG4gIFVuaXRCYXNlLFxuICBVbml0QnVpbGRlcnMsXG4gIFVuaXRTZXJpYWxpemVkLFxuICBVbml0VHlwZXMsXG59IGZyb20gXCIuLi91bml0cy91bml0LnRzXCI7XG5cbmV4cG9ydCB0eXBlIFN0YXRpY01ldHJpY0tleXMgPSBcIkR1cmF0aW9uXCIgfCBcIlBlcmNlbnQgQ29tcGxldGVcIjtcblxuZXhwb3J0IGNvbnN0IFN0YXRpY01ldHJpY0RlZmluaXRpb25zOiBSZWNvcmQ8XG4gIFN0YXRpY01ldHJpY0tleXMsXG4gIE1ldHJpY0RlZmluaXRpb25cbj4gPSB7XG4gIC8vIEhvdyBsb25nIGEgdGFzayB3aWxsIHRha2UsIGluIGRheXMuXG4gIER1cmF0aW9uOiBuZXcgTWV0cmljRGVmaW5pdGlvbigwLCBuZXcgTWV0cmljUmFuZ2UoMCksIHRydWUpLFxuICAvLyBUaGUgcGVyY2VudCBjb21wbGV0ZSBmb3IgYSB0YXNrLlxuICBcIlBlcmNlbnQgQ29tcGxldGVcIjogbmV3IE1ldHJpY0RlZmluaXRpb24oMCwgbmV3IE1ldHJpY1JhbmdlKDAsIDEwMCksIHRydWUpLFxufTtcblxuZXhwb3J0IHR5cGUgU3RhdGljUmVzb3VyY2VLZXlzID0gXCJVbmNlcnRhaW50eVwiO1xuXG5leHBvcnQgY29uc3QgU3RhdGljUmVzb3VyY2VEZWZpbml0aW9uczogUmVjb3JkPFxuICBTdGF0aWNSZXNvdXJjZUtleXMsXG4gIFJlc291cmNlRGVmaW5pdGlvblxuPiA9IHtcbiAgVW5jZXJ0YWludHk6IG5ldyBSZXNvdXJjZURlZmluaXRpb24oT2JqZWN0LmtleXMoVW5jZXJ0YWludHlUb051bSksIHRydWUpLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBQbGFuU2VyaWFsaXplZCB7XG4gIHN0YXR1czogUGxhblN0YXR1c1NlcmlhbGl6ZWQ7XG4gIHRhc2tDb21wbGV0aW9uOiBUYXNrQ29tcGxldGlvbnNTZXJpYWxpemVkO1xuICBkdXJhdGlvblVuaXRzOiBVbml0U2VyaWFsaXplZDtcbiAgY2hhcnQ6IENoYXJ0U2VyaWFsaXplZDtcbiAgcmVzb3VyY2VEZWZpbml0aW9uczogUmVzb3VyY2VEZWZpbml0aW9uc1NlcmlhbGl6ZWQ7XG4gIG1ldHJpY0RlZmluaXRpb25zOiBNZXRyaWNEZWZpbml0aW9uc1NlcmlhbGl6ZWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBQbGFuIHtcbiAgY2hhcnQ6IENoYXJ0O1xuXG4gIC8vIENvbnRyb2xzIGhvdyB0aW1lIGlzIGRpc3BsYXllZC5cbiAgZHVyYXRpb25Vbml0czogVW5pdEJhc2U7XG5cbiAgX3N0YXR1czogUGxhblN0YXR1cyA9IHsgc3RhZ2U6IFwidW5zdGFydGVkXCIsIHN0YXJ0OiAwIH07XG5cbiAgdGFza0NvbXBsZXRpb246IFRhc2tDb21wbGV0aW9ucyA9IHt9O1xuXG4gIHJlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnM7XG5cbiAgbWV0cmljRGVmaW5pdGlvbnM6IE1ldHJpY0RlZmluaXRpb25zO1xuXG4gIHB1YmxpYyBnZXQgc3RhdHVzKCk6IFBsYW5TdGF0dXMge1xuICAgIHJldHVybiB0aGlzLl9zdGF0dXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHN0YXR1cyh2YWx1ZTogUGxhblN0YXR1cykge1xuICAgIHRoaXMuX3N0YXR1cyA9IHZhbHVlO1xuICAgIHRoaXMuZHVyYXRpb25Vbml0cyA9IG5ldyBEYXlzKFxuICAgICAgbmV3IERhdGUoc3RhdHVzVG9EYXRlKHRoaXMuc3RhdHVzKSksXG4gICAgICB0aGlzLmdldFN0YXRpY01ldHJpY0RlZmluaXRpb24oXCJEdXJhdGlvblwiKVxuICAgICk7XG4gIH1cblxuICBzZXRUYXNrQ29tcGxldGlvbihpbmRleDogbnVtYmVyLCB2YWx1ZTogVGFza0NvbXBsZXRpb24pOiBSZXN1bHQ8bnVsbD4ge1xuICAgIGNvbnN0IHRhc2sgPSB0aGlzLmNoYXJ0LlZlcnRpY2VzW2luZGV4XTtcbiAgICBpZiAodGFzayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKGAke2luZGV4fSBpcyBub3QgYSB2YWxpZCBUYXNrIGluZGV4LmApKTtcbiAgICB9XG4gICAgdGhpcy50YXNrQ29tcGxldGlvblt0YXNrLmlkXSA9IHZhbHVlO1xuICAgIHJldHVybiBvayhudWxsKTtcbiAgfVxuXG4gIGdldFRhc2tDb21wbGV0aW9uKGluZGV4OiBudW1iZXIpOiBSZXN1bHQ8VGFza0NvbXBsZXRpb24+IHtcbiAgICBjb25zdCB0YXNrID0gdGhpcy5jaGFydC5WZXJ0aWNlc1tpbmRleF07XG4gICAgaWYgKHRhc2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihgJHtpbmRleH0gaXMgbm90IGEgdmFsaWQgVGFzayBpbmRleC5gKSk7XG4gICAgfVxuICAgIHJldHVybiBvayh0aGlzLnRhc2tDb21wbGV0aW9uW3Rhc2suaWRdIHx8IHsgc3RhZ2U6IFwidW5zdGFydGVkXCIgfSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNoYXJ0ID0gbmV3IENoYXJ0KCk7XG4gICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljUmVzb3VyY2VEZWZpbml0aW9ucyk7XG4gICAgdGhpcy5tZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIFN0YXRpY01ldHJpY0RlZmluaXRpb25zKTtcbiAgICB0aGlzLmR1cmF0aW9uVW5pdHMgPSBuZXcgRGF5cyhcbiAgICAgIG5ldyBEYXRlKHN0YXR1c1RvRGF0ZSh0aGlzLnN0YXR1cykpLFxuICAgICAgdGhpcy5nZXRTdGF0aWNNZXRyaWNEZWZpbml0aW9uKFwiRHVyYXRpb25cIilcbiAgICApO1xuXG4gICAgdGhpcy5hcHBseU1ldHJpY3NBbmRSZXNvdXJjZXNUb1ZlcnRpY2VzKCk7XG4gIH1cblxuICBzZXREdXJhdGlvblVuaXRzKHVuaXRUeXBlOiBVbml0VHlwZXMpIHtcbiAgICB0aGlzLmR1cmF0aW9uVW5pdHMgPSBVbml0QnVpbGRlcnNbdW5pdFR5cGVdKFxuICAgICAgbmV3IERhdGUoc3RhdHVzVG9EYXRlKHRoaXMuc3RhdHVzKSksXG4gICAgICB0aGlzLmdldFN0YXRpY01ldHJpY0RlZmluaXRpb24oXCJEdXJhdGlvblwiKVxuICAgICk7XG4gIH1cblxuICBnZXRTdGF0aWNNZXRyaWNEZWZpbml0aW9uKG5hbWU6IFN0YXRpY01ldHJpY0tleXMpOiBNZXRyaWNEZWZpbml0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNEZWZpbml0aW9uc1tuYW1lXTtcbiAgfVxuXG4gIGdldFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbihuYW1lOiBTdGF0aWNSZXNvdXJjZUtleXMpOiBSZXNvdXJjZURlZmluaXRpb24ge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNbbmFtZV07XG4gIH1cblxuICBhcHBseU1ldHJpY3NBbmRSZXNvdXJjZXNUb1ZlcnRpY2VzKCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpLmZvckVhY2goKG1ldHJpY05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgbWQgPSB0aGlzLm1ldHJpY0RlZmluaXRpb25zW21ldHJpY05hbWVdITtcbiAgICAgIHRoaXMuY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgICB0YXNrLnNldE1ldHJpYyhtZXRyaWNOYW1lLCBtZC5kZWZhdWx0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZm9yRWFjaChcbiAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiB7XG4gICAgICAgIHRoaXMuY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgICAgIHRhc2suc2V0UmVzb3VyY2Uoa2V5LCByZXNvdXJjZURlZmluaXRpb24udmFsdWVzWzBdKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIGdldE1ldHJpY0RlZmluaXRpb24oa2V5OiBzdHJpbmcpOiBNZXRyaWNEZWZpbml0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgc2V0TWV0cmljRGVmaW5pdGlvbihrZXk6IHN0cmluZywgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbikge1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XSA9IG1ldHJpY0RlZmluaXRpb247XG4gIH1cblxuICBkZWxldGVNZXRyaWNEZWZpbml0aW9uKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIGdldFJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZyk6IFJlc291cmNlRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgc2V0UmVzb3VyY2VEZWZpbml0aW9uKGtleTogc3RyaW5nLCB2YWx1ZTogUmVzb3VyY2VEZWZpbml0aW9uKSB7XG4gICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGRlbGV0ZVJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYSBuZXcgVGFzayB3aXRoIGRlZmF1bHRzIGZvciBhbGwgbWV0cmljcyBhbmQgcmVzb3VyY2VzLlxuICBuZXdUYXNrKCk6IFRhc2sge1xuICAgIGNvbnN0IHJldCA9IG5ldyBUYXNrKCk7XG4gICAgT2JqZWN0LmtleXModGhpcy5tZXRyaWNEZWZpbml0aW9ucykuZm9yRWFjaCgobWV0cmljTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBtZCA9IHRoaXMuZ2V0TWV0cmljRGVmaW5pdGlvbihtZXRyaWNOYW1lKSE7XG4gICAgICByZXQuc2V0TWV0cmljKG1ldHJpY05hbWUsIG1kLmRlZmF1bHQpO1xuICAgIH0pO1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZm9yRWFjaChcbiAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiB7XG4gICAgICAgIHJldC5zZXRSZXNvdXJjZShrZXksIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbMF0pO1xuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHRvSlNPTigpOiBQbGFuU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1czogc3RhdHVzVG9KU09OKHRoaXMuc3RhdHVzKSxcbiAgICAgIHRhc2tDb21wbGV0aW9uOiB0YXNrQ29tcGxldGlvbnNUb0pTT04odGhpcy50YXNrQ29tcGxldGlvbiksXG4gICAgICBkdXJhdGlvblVuaXRzOiB0aGlzLmR1cmF0aW9uVW5pdHMudG9KU09OKCksXG4gICAgICBjaGFydDogdGhpcy5jaGFydC50b0pTT04oKSxcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbnM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXModGhpcy5yZXNvdXJjZURlZmluaXRpb25zKVxuICAgICAgICAgIC5maWx0ZXIoKFtfLCByZXNvdXJjZURlZmluaXRpb25dKSA9PiAhcmVzb3VyY2VEZWZpbml0aW9uLmlzU3RhdGljKVxuICAgICAgICAgIC5tYXAoKFtrZXksIHJlc291cmNlRGVmaW5pdGlvbl0pID0+IFtcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIHJlc291cmNlRGVmaW5pdGlvbi50b0pTT04oKSxcbiAgICAgICAgICBdKVxuICAgICAgKSxcbiAgICAgIG1ldHJpY0RlZmluaXRpb25zOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpXG4gICAgICAgICAgLmZpbHRlcigoW18sIG1ldHJpY0RlZmluaXRpb25dKSA9PiAhbWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYylcbiAgICAgICAgICAubWFwKChba2V5LCBtZXRyaWNEZWZpbml0aW9uXSkgPT4gW2tleSwgbWV0cmljRGVmaW5pdGlvbi50b0pTT04oKV0pXG4gICAgICApLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZnJvbUpTT04ocGxhblNlcmlhbGl6ZWQ6IFBsYW5TZXJpYWxpemVkKTogUGxhbiB7XG4gICAgY29uc3QgcmV0ID0gbmV3IFBsYW4oKTtcbiAgICByZXQuY2hhcnQgPSBDaGFydC5mcm9tSlNPTihwbGFuU2VyaWFsaXplZC5jaGFydCk7XG4gICAgcmV0LnN0YXR1cyA9IHN0YXR1c0Zyb21KU09OKHBsYW5TZXJpYWxpemVkLnN0YXR1cyk7XG4gICAgcmV0LnRhc2tDb21wbGV0aW9uID0gdGFza0NvbXBsZXRpb25zRnJvbUpTT04ocGxhblNlcmlhbGl6ZWQudGFza0NvbXBsZXRpb24pO1xuICAgIGNvbnN0IGRlc2VyaWFsaXplZE1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgT2JqZWN0LmVudHJpZXMocGxhblNlcmlhbGl6ZWQubWV0cmljRGVmaW5pdGlvbnMpLm1hcChcbiAgICAgICAgKFtrZXksIHNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uXSkgPT4gW1xuICAgICAgICAgIGtleSxcbiAgICAgICAgICBNZXRyaWNEZWZpbml0aW9uLmZyb21KU09OKHNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uKSxcbiAgICAgICAgXVxuICAgICAgKVxuICAgICk7XG4gICAgcmV0Lm1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHt9LFxuICAgICAgU3RhdGljTWV0cmljRGVmaW5pdGlvbnMsXG4gICAgICBkZXNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uc1xuICAgICk7XG5cbiAgICBjb25zdCBkZXNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25zID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgT2JqZWN0LmVudHJpZXMocGxhblNlcmlhbGl6ZWQucmVzb3VyY2VEZWZpbml0aW9ucykubWFwKFxuICAgICAgICAoW2tleSwgc2VyaWFsaXplZFJlc291cmNlRGVmaW5pdGlvbl0pID0+IFtcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgUmVzb3VyY2VEZWZpbml0aW9uLmZyb21KU09OKHNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb24pLFxuICAgICAgICBdXG4gICAgICApXG4gICAgKTtcbiAgICByZXQucmVzb3VyY2VEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICB7fSxcbiAgICAgIFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnMsXG4gICAgICBkZXNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25zXG4gICAgKTtcblxuICAgIHJldC5kdXJhdGlvblVuaXRzID0gVW5pdEJhc2UuZnJvbUpTT04oXG4gICAgICBwbGFuU2VyaWFsaXplZC5kdXJhdGlvblVuaXRzLFxuICAgICAgbmV3IERhdGUoc3RhdHVzVG9EYXRlKHJldC5zdGF0dXMpKSxcbiAgICAgIHJldC5nZXRTdGF0aWNNZXRyaWNEZWZpbml0aW9uKFwiRHVyYXRpb25cIilcbiAgICApO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHN0YXRpYyBGcm9tSlNPTlRleHQgPSAodGV4dDogc3RyaW5nKTogUmVzdWx0PFBsYW4+ID0+IHtcbiAgICBjb25zdCBwbGFuU2VyaWFsaXplZDogUGxhblNlcmlhbGl6ZWQgPSBKU09OLnBhcnNlKHRleHQpO1xuICAgIGNvbnN0IHBsYW4gPSBQbGFuLmZyb21KU09OKHBsYW5TZXJpYWxpemVkKTtcblxuICAgIGNvbnN0IHJldCA9IFJhdGlvbmFsaXplRWRnZXNPcCgpLmFwcGx5VG8ocGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgcmV0VmFsID0gQ2hhcnRWYWxpZGF0ZShwbGFuLmNoYXJ0KTtcbiAgICBpZiAoIXJldFZhbC5vaykge1xuICAgICAgcmV0dXJuIHJldFZhbDtcbiAgICB9XG4gICAgcmV0dXJuIG9rKHBsYW4pO1xuICB9O1xufVxuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuXCI7XG5pbXBvcnQgeyBsaXZlIH0gZnJvbSBcImxpdC1odG1sL2RpcmVjdGl2ZXMvbGl2ZS5qc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tOYW1lQ2hhbmdlRGV0YWlscyB7XG4gIG5hbWU6IHN0cmluZztcbiAgdGFza0luZGV4OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza1Jlc291cmNlVmFsdWVDaGFuZ2VEZXRhaWxzIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYXNrTWV0cmljVmFsdWVDaGFuZ2VEZXRhaWxzIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogbnVtYmVyO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwIHtcbiAgICBcInRhc2stbmFtZS1jaGFuZ2VcIjogQ3VzdG9tRXZlbnQ8VGFza05hbWVDaGFuZ2VEZXRhaWxzPjtcbiAgICBcInRhc2stcmVzb3VyY2UtdmFsdWUtY2hhbmdlXCI6IEN1c3RvbUV2ZW50PFRhc2tSZXNvdXJjZVZhbHVlQ2hhbmdlRGV0YWlscz47XG4gICAgXCJ0YXNrLW1ldHJpYy12YWx1ZS1jaGFuZ2VcIjogQ3VzdG9tRXZlbnQ8VGFza01ldHJpY1ZhbHVlQ2hhbmdlRGV0YWlscz47XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNlbGVjdGVkVGFza1BhbmVsIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBwbGFuOiBQbGFuID0gbmV3IFBsYW4oKTtcbiAgdGFza0luZGV4OiBudW1iZXIgPSAtMTtcbiAgcGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2s6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9O1xuICB9XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICB1cGRhdGVTZWxlY3RlZFRhc2tQYW5lbChwbGFuOiBQbGFuLCB0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMucGxhbiA9IHBsYW47XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICAvKlxuICAgIFRPRE8gLSBEbyB0aGUgZm9sbG93aW5nIHdoZW4gc2VsZWN0aW5nIGEgbmV3IHRhc2suXG4gICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID1cbiAgICAgICAgICBzZWxlY3RlZFRhc2tQYW5lbC5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiI3Rhc2stbmFtZVwiKSE7XG4gICAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgICAgIGlucHV0LnNlbGVjdCgpO1xuICAgICAgfSwgMCk7XG4gICAgICAqL1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJlbmRlcih0aGlzLnRlbXBsYXRlKCksIHRoaXMpO1xuICB9XG5cbiAgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGNvbnN0IHRhc2tJbmRleCA9IHRoaXMudGFza0luZGV4O1xuICAgIGlmICh0YXNrSW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm4gaHRtbGBObyB0YXNrIHNlbGVjdGVkLmA7XG4gICAgfVxuICAgIGNvbnN0IHRhc2sgPSB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XTtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDx0YWJsZT5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZD5OYW1lPC90ZD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICBpZD1cInRhc2stbmFtZVwiXG4gICAgICAgICAgICAgIC52YWx1ZT1cIiR7bGl2ZSh0YXNrLm5hbWUpfVwiXG4gICAgICAgICAgICAgIEBjaGFuZ2U9JHsoZTogRXZlbnQpID0+XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50PFRhc2tOYW1lQ2hhbmdlRGV0YWlscz4oXCJ0YXNrLW5hbWUtY2hhbmdlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICAke09iamVjdC5lbnRyaWVzKHRoaXMucGxhbi5yZXNvdXJjZURlZmluaXRpb25zKS5tYXAoXG4gICAgICAgICAgKFtyZXNvdXJjZUtleSwgZGVmbl0pID0+XG4gICAgICAgICAgICBodG1sYCA8dHI+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiJHtyZXNvdXJjZUtleX1cIj4ke3Jlc291cmNlS2V5fTwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICAgICAgICBpZD1cIiR7cmVzb3VyY2VLZXl9XCJcbiAgICAgICAgICAgICAgICAgIEBjaGFuZ2U9JHthc3luYyAoZTogRXZlbnQpID0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJ0YXNrLXJlc291cmNlLXZhbHVlLWNoYW5nZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByZXNvdXJjZUtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAke2RlZm4udmFsdWVzLm1hcChcbiAgICAgICAgICAgICAgICAgICAgKHJlc291cmNlVmFsdWU6IHN0cmluZykgPT5cbiAgICAgICAgICAgICAgICAgICAgICBodG1sYDxvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9JHtyZXNvdXJjZVZhbHVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdGVkPSR7dGFzay5yZXNvdXJjZXNbcmVzb3VyY2VLZXldID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAke3Jlc291cmNlVmFsdWV9XG4gICAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+YFxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+YFxuICAgICAgICApfVxuICAgICAgICAke09iamVjdC5rZXlzKHRoaXMucGxhbi5tZXRyaWNEZWZpbml0aW9ucykubWFwKFxuICAgICAgICAgIChrZXk6IHN0cmluZykgPT5cbiAgICAgICAgICAgIGh0bWxgIDx0cj5cbiAgICAgICAgICAgICAgPHRkPjxsYWJlbCBmb3I9XCIke2tleX1cIj4ke2tleX08L2xhYmVsPjwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgIGlkPVwiJHtrZXl9XCJcbiAgICAgICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUodGFzay5tZXRyaWNzW2tleV0pfVxuICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICBAY2hhbmdlPSR7YXN5bmMgKGU6IEV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwidGFzay1tZXRyaWMtdmFsdWUtY2hhbmdlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiArKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+YFxuICAgICAgICApfVxuICAgICAgPC90YWJsZT5cbiAgICBgO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcInNlbGVjdGVkLXRhc2stcGFuZWxcIiwgU2VsZWN0ZWRUYXNrUGFuZWwpO1xuIiwgImltcG9ydCB7IENoYXJ0LCBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0XCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhblwiO1xuaW1wb3J0IHsgUHJlY2lzaW9uIH0gZnJvbSBcIi4uL3ByZWNpc2lvbi9wcmVjaXNpb25cIjtcbmltcG9ydCB7IENvbXB1dGVTbGFjaywgQ3JpdGljYWxQYXRoIH0gZnJvbSBcIi4uL3NsYWNrL3NsYWNrXCI7XG5pbXBvcnQgeyBKYWNvYmlhbiwgVW5jZXJ0YWludHkgfSBmcm9tIFwiLi4vc3RhdHMvY2RmL3RyaWFuZ3VsYXIvamFjb2JpYW5cIjtcblxuY29uc3QgTUFYX1JBTkRPTSA9IDEwMDA7XG5cbmNvbnN0IHByZWNpc2lvbiA9IG5ldyBQcmVjaXNpb24oMik7XG5cbmNvbnN0IHJuZEludCA9IChuOiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbik7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIENyaXRpY2FsUGF0aEVudHJ5IHtcbiAgY291bnQ6IG51bWJlcjtcbiAgY3JpdGljYWxQYXRoOiBudW1iZXJbXTtcbiAgZHVyYXRpb25zOiBudW1iZXJbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDcml0aWNhbFBhdGhUYXNrRW50cnkge1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgZHVyYXRpb246IG51bWJlcjtcbiAgbnVtVGltZXNBcHBlYXJlZDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNpbXVsYXRpb25SZXN1bHRzIHtcbiAgcGF0aHM6IE1hcDxzdHJpbmcsIENyaXRpY2FsUGF0aEVudHJ5PjtcbiAgdGFza3M6IENyaXRpY2FsUGF0aFRhc2tFbnRyeVtdO1xufVxuXG4vKipcbiAqIFNpbXVsYXRlIHRoZSB1bmNlcnRhaW50eSBpbiB0aGUgcGxhbiBhbmQgZ2VuZXJhdGUgcG9zc2libGUgYWx0ZXJuYXRlIGNyaXRpY2FsXG4gKiBwYXRocy5cbiAqL1xuZXhwb3J0IGNvbnN0IHNpbXVsYXRpb24gPSAoXG4gIGNoYXJ0OiBDaGFydCxcbiAgbnVtU2ltdWxhdGlvbkxvb3BzOiBudW1iZXIsXG4gIG9yaWdpbmFsQ3JpdGljYWxQYXRoOiBudW1iZXJbXVxuKTogU2ltdWxhdGlvblJlc3VsdHMgPT4ge1xuICBjb25zdCBhbGxDcml0aWNhbFBhdGhzID0gbmV3IE1hcDxzdHJpbmcsIENyaXRpY2FsUGF0aEVudHJ5PigpO1xuICBhbGxDcml0aWNhbFBhdGhzLnNldChgJHtvcmlnaW5hbENyaXRpY2FsUGF0aH1gLCB7XG4gICAgY291bnQ6IDAsXG4gICAgY3JpdGljYWxQYXRoOiBvcmlnaW5hbENyaXRpY2FsUGF0aC5zbGljZSgpLFxuICAgIGR1cmF0aW9uczogY2hhcnQuVmVydGljZXMubWFwKCh0YXNrOiBUYXNrKSA9PiB0YXNrLmR1cmF0aW9uKSxcbiAgfSk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1TaW11bGF0aW9uTG9vcHM7IGkrKykge1xuICAgIC8vIEdlbmVyYXRlIHJhbmRvbSBkdXJhdGlvbnMgYmFzZWQgb24gZWFjaCBUYXNrcyB1bmNlcnRhaW50eS5cbiAgICBjb25zdCBkdXJhdGlvbnMgPSBjaGFydC5WZXJ0aWNlcy5tYXAoKHQ6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IHJhd0R1cmF0aW9uID0gbmV3IEphY29iaWFuKFxuICAgICAgICB0LmR1cmF0aW9uLCAvLyBBY2NlcHRhYmxlIGRpcmVjdCBhY2Nlc3MgdG8gZHVyYXRpb24uXG4gICAgICAgIHQuZ2V0UmVzb3VyY2UoXCJVbmNlcnRhaW50eVwiKSBhcyBVbmNlcnRhaW50eVxuICAgICAgKS5zYW1wbGUocm5kSW50KE1BWF9SQU5ET00pIC8gTUFYX1JBTkRPTSk7XG4gICAgICByZXR1cm4gcHJlY2lzaW9uLnJvdW5kKHJhd0R1cmF0aW9uKTtcbiAgICB9KTtcblxuICAgIC8vIENvbXB1dGUgdGhlIHNsYWNrIGJhc2VkIG9uIHRob3NlIHJhbmRvbSBkdXJhdGlvbnMuXG4gICAgY29uc3Qgc2xhY2tzUmV0ID0gQ29tcHV0ZVNsYWNrKFxuICAgICAgY2hhcnQsXG4gICAgICAodGFza0luZGV4OiBudW1iZXIpID0+IGR1cmF0aW9uc1t0YXNrSW5kZXhdLFxuICAgICAgcHJlY2lzaW9uLnJvdW5kZXIoKVxuICAgICk7XG4gICAgaWYgKCFzbGFja3NSZXQub2spIHtcbiAgICAgIHRocm93IHNsYWNrc1JldC5lcnJvcjtcbiAgICB9XG5cbiAgICBjb25zdCBjcml0aWNhbFBhdGggPSBDcml0aWNhbFBhdGgoc2xhY2tzUmV0LnZhbHVlLCBwcmVjaXNpb24ucm91bmRlcigpKTtcbiAgICBjb25zdCBjcml0aWNhbFBhdGhBc1N0cmluZyA9IGAke2NyaXRpY2FsUGF0aH1gO1xuICAgIGxldCBwYXRoRW50cnkgPSBhbGxDcml0aWNhbFBhdGhzLmdldChjcml0aWNhbFBhdGhBc1N0cmluZyk7XG4gICAgaWYgKHBhdGhFbnRyeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXRoRW50cnkgPSB7XG4gICAgICAgIGNvdW50OiAwLFxuICAgICAgICBjcml0aWNhbFBhdGg6IGNyaXRpY2FsUGF0aCxcbiAgICAgICAgZHVyYXRpb25zOiBkdXJhdGlvbnMsXG4gICAgICB9O1xuICAgICAgYWxsQ3JpdGljYWxQYXRocy5zZXQoY3JpdGljYWxQYXRoQXNTdHJpbmcsIHBhdGhFbnRyeSk7XG4gICAgfVxuICAgIHBhdGhFbnRyeS5jb3VudCsrO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwYXRoczogYWxsQ3JpdGljYWxQYXRocyxcbiAgICB0YXNrczogY3JpdGljYWxUYXNrRnJlcXVlbmNpZXMoYWxsQ3JpdGljYWxQYXRocywgY2hhcnQpLFxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGNyaXRpY2FsVGFza0ZyZXF1ZW5jaWVzID0gKFxuICBhbGxDcml0aWNhbFBhdGhzOiBNYXA8c3RyaW5nLCBDcml0aWNhbFBhdGhFbnRyeT4sXG4gIGNoYXJ0OiBDaGFydFxuKTogQ3JpdGljYWxQYXRoVGFza0VudHJ5W10gPT4ge1xuICBjb25zdCBjcml0aWFsVGFza3M6IE1hcDxudW1iZXIsIENyaXRpY2FsUGF0aFRhc2tFbnRyeT4gPSBuZXcgTWFwKCk7XG5cbiAgYWxsQ3JpdGljYWxQYXRocy5mb3JFYWNoKCh2YWx1ZTogQ3JpdGljYWxQYXRoRW50cnkpID0+IHtcbiAgICB2YWx1ZS5jcml0aWNhbFBhdGguZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGxldCB0YXNrRW50cnkgPSBjcml0aWFsVGFza3MuZ2V0KHRhc2tJbmRleCk7XG4gICAgICBpZiAodGFza0VudHJ5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGFza0VudHJ5ID0ge1xuICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgIGR1cmF0aW9uOiBjaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLmR1cmF0aW9uLFxuICAgICAgICAgIG51bVRpbWVzQXBwZWFyZWQ6IDAsXG4gICAgICAgIH07XG4gICAgICAgIGNyaXRpYWxUYXNrcy5zZXQodGFza0luZGV4LCB0YXNrRW50cnkpO1xuICAgICAgfVxuICAgICAgdGFza0VudHJ5Lm51bVRpbWVzQXBwZWFyZWQgKz0gdmFsdWUuY291bnQ7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBbLi4uY3JpdGlhbFRhc2tzLnZhbHVlcygpXS5zb3J0KFxuICAgIChhOiBDcml0aWNhbFBhdGhUYXNrRW50cnksIGI6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSk6IG51bWJlciA9PiB7XG4gICAgICByZXR1cm4gYi5kdXJhdGlvbiAtIGEuZHVyYXRpb247XG4gICAgfVxuICApO1xufTtcbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhblwiO1xuaW1wb3J0IHtcbiAgQ3JpdGljYWxQYXRoRW50cnksXG4gIENyaXRpY2FsUGF0aFRhc2tFbnRyeSxcbiAgU2ltdWxhdGlvblJlc3VsdHMsXG4gIHNpbXVsYXRpb24sXG59IGZyb20gXCIuLi9zaW11bGF0aW9uL3NpbXVsYXRpb25cIjtcbmltcG9ydCB7IENoYXJ0IH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0XCI7XG5pbXBvcnQgeyBkaWZmZXJlbmNlIH0gZnJvbSBcIi4uL2RhZy9hbGdvcml0aG1zL2NpcmN1bGFyXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2ltdWxhdGlvblNlbGVjdERldGFpbHMge1xuICBkdXJhdGlvbnM6IG51bWJlcltdIHwgbnVsbDtcbiAgY3JpdGljYWxQYXRoOiBudW1iZXJbXTtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwIHtcbiAgICBcInNpbXVsYXRpb24tc2VsZWN0XCI6IEN1c3RvbUV2ZW50PFNpbXVsYXRpb25TZWxlY3REZXRhaWxzPjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2ltdWxhdGlvblBhbmVsIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICByZXN1bHRzOiBTaW11bGF0aW9uUmVzdWx0cyA9IHtcbiAgICBwYXRoczogbmV3IE1hcCgpLFxuICAgIHRhc2tzOiBbXSxcbiAgfTtcbiAgY2hhcnQ6IENoYXJ0IHwgbnVsbCA9IG51bGw7XG4gIG51bVNpbXVsYXRpb25Mb29wczogbnVtYmVyID0gMDtcbiAgb3JpZ2luYWxDcml0aWNhbFBhdGg6IG51bWJlcltdID0gW107XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHNpbXVsYXRlKFxuICAgIGNoYXJ0OiBDaGFydCxcbiAgICBudW1TaW11bGF0aW9uTG9vcHM6IG51bWJlcixcbiAgICBvcmlnaW5hbENyaXRpY2FsUGF0aDogbnVtYmVyW11cbiAgKTogbnVtYmVyW10ge1xuICAgIHRoaXMucmVzdWx0cyA9IHNpbXVsYXRpb24oY2hhcnQsIG51bVNpbXVsYXRpb25Mb29wcywgb3JpZ2luYWxDcml0aWNhbFBhdGgpO1xuICAgIHRoaXMuY2hhcnQgPSBjaGFydDtcbiAgICB0aGlzLm51bVNpbXVsYXRpb25Mb29wcyA9IG51bVNpbXVsYXRpb25Mb29wcztcbiAgICB0aGlzLm9yaWdpbmFsQ3JpdGljYWxQYXRoID0gb3JpZ2luYWxDcml0aWNhbFBhdGg7XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHJldHVybiB0aGlzLnJlc3VsdHMudGFza3MubWFwKFxuICAgICAgKHRhc2tFbnRyeTogQ3JpdGljYWxQYXRoVGFza0VudHJ5KSA9PiB0YXNrRW50cnkudGFza0luZGV4XG4gICAgKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMucmVzdWx0cyA9IHtcbiAgICAgIHBhdGhzOiBuZXcgTWFwKCksXG4gICAgICB0YXNrczogW10sXG4gICAgfTtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8U2ltdWxhdGlvblNlbGVjdERldGFpbHM+KFwic2ltdWxhdGlvbi1zZWxlY3RcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBkdXJhdGlvbnM6IG51bGwsXG4gICAgICAgICAgY3JpdGljYWxQYXRoOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcGF0aENsaWNrZWQoa2V5OiBzdHJpbmcpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8U2ltdWxhdGlvblNlbGVjdERldGFpbHM+KFwic2ltdWxhdGlvbi1zZWxlY3RcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBkdXJhdGlvbnM6IHRoaXMucmVzdWx0cy5wYXRocy5nZXQoa2V5KSEuZHVyYXRpb25zLFxuICAgICAgICAgIGNyaXRpY2FsUGF0aDogdGhpcy5yZXN1bHRzLnBhdGhzLmdldChrZXkpIS5jcml0aWNhbFBhdGgsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmVuZGVyKHRoaXMudGVtcGxhdGUoKSwgdGhpcyk7XG4gIH1cblxuICBkaXNwbGF5Q3JpdGljYWxQYXRoRGlmZmVyZW5jZXMoY3JpdGljYWxQYXRoOiBudW1iZXJbXSk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdCByZW1vdmVkID0gZGlmZmVyZW5jZSh0aGlzLm9yaWdpbmFsQ3JpdGljYWxQYXRoLCBjcml0aWNhbFBhdGgpO1xuICAgIGNvbnN0IGFkZGVkID0gZGlmZmVyZW5jZShjcml0aWNhbFBhdGgsIHRoaXMub3JpZ2luYWxDcml0aWNhbFBhdGgpO1xuICAgIGlmIChyZW1vdmVkLmxlbmd0aCA9PT0gMCAmJiBhZGRlZC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBodG1sYE9yaWdpbmFsIENyaXRpY2FsIFBhdGhgO1xuICAgIH1cbiAgICByZXR1cm4gaHRtbGBcbiAgICAgICR7YWRkZWQubWFwKFxuICAgICAgICAodGFza0luZGV4OiBudW1iZXIpID0+IGh0bWxgXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJhZGRlZFwiPiske3RoaXMuY2hhcnQhLlZlcnRpY2VzW3Rhc2tJbmRleF0ubmFtZX08L3NwYW4+XG4gICAgICAgIGBcbiAgICAgICl9XG4gICAgICAke3JlbW92ZWQubWFwKFxuICAgICAgICAodGFza0luZGV4OiBudW1iZXIpID0+IGh0bWxgXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJyZW1vdmVkXCI+LSR7dGhpcy5jaGFydCEuVmVydGljZXNbdGFza0luZGV4XS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgYFxuICAgICAgKX1cbiAgICBgO1xuICB9XG5cbiAgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGlmICh0aGlzLnJlc3VsdHMucGF0aHMuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIGh0bWxgYDtcbiAgICB9XG4gICAgY29uc3QgcGF0aEtleXMgPSBbLi4udGhpcy5yZXN1bHRzLnBhdGhzLmtleXMoKV07XG4gICAgY29uc3Qgc29ydGVkUGF0aEtleXMgPSBwYXRoS2V5cy5zb3J0KChhOiBzdHJpbmcsIGI6IHN0cmluZykgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdGhpcy5yZXN1bHRzLnBhdGhzLmdldChiKSEuY291bnQgLSB0aGlzLnJlc3VsdHMucGF0aHMuZ2V0KGEpIS5jb3VudFxuICAgICAgKTtcbiAgICB9KTtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxidXR0b25cbiAgICAgICAgQGNsaWNrPSR7KCkgPT4ge1xuICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgQ2xlYXJcbiAgICAgIDwvYnV0dG9uPlxuXG4gICAgICA8dGFibGUgY2xhc3M9XCJwYXRoc1wiPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPkNvdW50PC90aD5cbiAgICAgICAgICA8dGg+Q3JpdGljYWwgUGF0aDwvdGg+XG4gICAgICAgIDwvdHI+XG4gICAgICAgICR7c29ydGVkUGF0aEtleXMubWFwKFxuICAgICAgICAgIChrZXk6IHN0cmluZykgPT5cbiAgICAgICAgICAgIGh0bWxgPHRyIEBjbGljaz0keygpID0+IHRoaXMucGF0aENsaWNrZWQoa2V5KX0+XG4gICAgICAgICAgICAgIDx0ZD4ke3RoaXMucmVzdWx0cy5wYXRocy5nZXQoa2V5KSEuY291bnR9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICR7dGhpcy5kaXNwbGF5Q3JpdGljYWxQYXRoRGlmZmVyZW5jZXMoXG4gICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHMucGF0aHMuZ2V0KGtleSkhLmNyaXRpY2FsUGF0aFxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgKX1cbiAgICAgIDwvdGFibGU+XG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+TmFtZTwvdGg+XG4gICAgICAgICAgPHRoPkR1cmF0aW9uPC90aD5cbiAgICAgICAgICA8dGg+RnJlcXVlbmN5ICglKTwvdGg+XG4gICAgICAgIDwvdHI+XG4gICAgICAgICR7dGhpcy5yZXN1bHRzLnRhc2tzLm1hcChcbiAgICAgICAgICAodGFza0VudHJ5OiBDcml0aWNhbFBhdGhUYXNrRW50cnkpID0+XG4gICAgICAgICAgICBodG1sYDx0cj5cbiAgICAgICAgICAgICAgPHRkPiR7dGhpcy5jaGFydCEuVmVydGljZXNbdGFza0VudHJ5LnRhc2tJbmRleF0ubmFtZX08L3RkPlxuICAgICAgICAgICAgICA8dGQ+JHt0YXNrRW50cnkuZHVyYXRpb259PC90ZD5cbiAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICR7TWF0aC5mbG9vcihcbiAgICAgICAgICAgICAgICAgICgxMDAgKiB0YXNrRW50cnkubnVtVGltZXNBcHBlYXJlZCkgLyB0aGlzLm51bVNpbXVsYXRpb25Mb29wc1xuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgKX1cbiAgICAgIDwvdGFibGU+XG4gICAgYDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJzaW11bGF0aW9uLXBhbmVsXCIsIFNpbXVsYXRpb25QYW5lbCk7XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi9leHBsYW5NYWluL2V4cGxhbk1haW4udHNcIjtcbmltcG9ydCB7IFNlYXJjaFR5cGUsIFRhc2tTZWFyY2hDb250cm9sIH0gZnJvbSBcIi4vdGFzay1zZWFyY2gtY29udHJvbHMudHNcIjtcblxuLyoqIFVzZXMgYSB0YXNrLXNlYXJjaC1jb250cm9sIHRvIHNlYXJjaCB0aHJvdWdoIGFsbCBUYXNrcy4gKi9cbmV4cG9ydCBjbGFzcyBTZWFyY2hUYXNrUGFuZWwgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW4gfCBudWxsID0gbnVsbDtcbiAgdGFza1NlYXJjaENvbnRyb2w6IFRhc2tTZWFyY2hDb250cm9sIHwgbnVsbCA9IG51bGw7XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5leHBsYW5NYWluID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImV4cGxhbi1tYWluXCIpO1xuICAgIGlmICghdGhpcy5leHBsYW5NYWluKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2wgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJ0YXNrLXNlYXJjaC1jb250cm9sXCIpO1xuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcInRhc2stY2hhbmdlXCIsIChlKSA9PiB7XG4gICAgICB0aGlzLmV4cGxhbk1haW4hLnNldFNlbGVjdGlvbihlLmRldGFpbC50YXNrSW5kZXgsIGUuZGV0YWlsLmZvY3VzLCB0cnVlKTtcbiAgICB9KTtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJ0YXNrLWZvY3VzXCIsIChlKSA9PlxuICAgICAgdGhpcy5zZXRLZXlib2FyZEZvY3VzVG9JbnB1dChcImZ1bGwtaW5mb1wiKVxuICAgICk7XG4gIH1cblxuICBzZXRLZXlib2FyZEZvY3VzVG9JbnB1dChzZWFyY2hUeXBlOiBTZWFyY2hUeXBlKSB7XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEudGFza3MgPSB0aGlzLmV4cGxhbk1haW4hLnBsYW4uY2hhcnQuVmVydGljZXM7XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEuaW5jbHVkZWRJbmRleGVzID1cbiAgICAgIHRoaXMuZXhwbGFuTWFpbiEucGxhbi5jaGFydC5WZXJ0aWNlcy5tYXAoXG4gICAgICAgIChfLCBpbmRleDogbnVtYmVyKSA9PiBpbmRleFxuICAgICAgKS5zbGljZSgxLCAtMSk7XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEuc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoc2VhcmNoVHlwZSk7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwic2VhcmNoLXRhc2stcGFuZWxcIiwgU2VhcmNoVGFza1BhbmVsKTtcbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQgZnV6enlzb3J0IGZyb20gXCJmdXp6eXNvcnRcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcblxuaW50ZXJmYWNlIFRhc2tDaGFuZ2VEZXRhaWwge1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgZm9jdXM6IGJvb2xlYW47XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJ0YXNrLWNoYW5nZVwiOiBDdXN0b21FdmVudDxUYXNrQ2hhbmdlRGV0YWlsPjtcbiAgICBcInRhc2stZm9jdXNcIjogQ3VzdG9tRXZlbnQ8bnVsbD47XG4gIH1cbn1cblxuLyoqIFRoZSBpbmRleGVzIHJldHVybmVkIGJ5IGZ1enp5c29ydCBpcyBqdXN0IGEgbGlzdCBvZiB0aGUgaW5kZXhlcyBvZiB0aGUgdGhlXG4gKiAgaW5kaXZpZHVhbCBjaGFycyB0aGF0IGhhdmUgYmVlbiBtYXRjaGVkLiBXZSBuZWVkIHRvIHR1cm4gdGhhdCBpbnRvIHBhaXJzIG9mXG4gKiAgbnVtYmVycyB3ZSBjYW4gcGFzcyB0byBTdHJpbmcucHJvdG90eXBlLnNsaWNlKCkuXG4gKlxuICogIFRoZSBvYnNlcnZhdGlvbiBoZXJlIGlzIHRoYXQgaWYgdGhlIHRhcmdldCBzdHJpbmcgaXMgXCJIZWxsb1wiIGFuZCB0aGUgaW5kaWNlc1xuICogIGFyZSBbMiwzXSB0aGVuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHdlIG1hcmt1cCB0aGUgaGlnaGxpZ2h0ZWQgdGFyZ2V0IGFzXG4gKiAgXCJIZTxiPmxsPC9iPm9cIiBvciBcIkhlPGI+bDwvYj48Yj5sPC9iPm9cIi4gVGhhdCBpcywgd2UgY2FuIHNpbXBsaWZ5IGlmIHdlXG4gKiAgYWx3YXlzIHNsaWNlIG91dCBlYWNoIGNoYXJhY3RlciBpbiB0aGUgdGFyZ2V0IHN0cmluZyB0aGF0IG5lZWRzIHRvIGJlXG4gKiAgaGlnaGxpZ2h0ZWQuXG4gKlxuICogIFNvIGluZGV4ZXNUb1JhbmdlcyByZXR1cm5zIGFuIGFycmF5IG9mIGluZGV4ZXMsIHRoYXQgaWYgdGFrZW4gaW4gcGFpcnMsIHdpbGxcbiAqICBhbHRlcm5hdGVseSBzbGljZSBvZmYgcGFydHMgb2YgdGFyZ2V0IHRoYXQgbmVlZCB0byBiZSBlbXBoYXNpemVkLlxuICpcbiAqICBJbiB0aGUgYWJvdmUgZXhhbXBsZSB0YXJnZXQgPSBcIkhlbGxvXCIgYW5kIGluZGV4ZXMgPSBbMiwzXSwgdGhlblxuICogIGluZGV4ZXNUb1JhbmdlcyB3aWxsIHJldHVyblwiXG4gKlxuICogICAgIFswLDIsMywzLDQsNV1cbiAqXG4gKiAgd2hpY2ggd2lsbCBnZW5lcmF0ZSB0aGUgZm9sbG93aW5nIHBhaXJzIGFzIGFyZ3MgdG8gc2xpY2U6XG4gKlxuICogICAgIFswLDJdIEhlXG4gKiAgICAgWzIsM10gbCAgICNcbiAqICAgICBbMywzXVxuICogICAgIFszLDRdIGwgICAjXG4gKiAgICAgWzQsNV0gb1xuICpcbiAqIE5vdGUgdGhhdCBpZiB3ZSBhbHRlcm5hdGUgYm9sZGluZyB0aGVuIG9ubHkgdGhlIHR3byAnbCdzIGdldCBlbXBoYXNpemVkLFxuICogd2hpY2ggaXMgd2hhdCB3ZSB3YW50IChEZW5vdGVkIGJ5ICMgYWJvdmUpLlxuICovXG5jb25zdCBpbmRleGVzVG9SYW5nZXMgPSAoXG4gIGluZGV4ZXM6IFJlYWRvbmx5PG51bWJlcltdPixcbiAgbGVuOiBudW1iZXJcbik6IG51bWJlcltdID0+IHtcbiAgLy8gQ29udmVydCBlYWNoIGluZGV4IG9mIGEgaGlnaGxpZ2h0ZWQgY2hhciBpbnRvIGEgcGFpciBvZiBudW1iZXJzIHdlIGNhbiBwYXNzXG4gIC8vIHRvIHNsaWNlLCBhbmQgdGhlbiBmbGF0dGVuLlxuICBjb25zdCByYW5nZXMgPSBpbmRleGVzLm1hcCgoeDogbnVtYmVyKSA9PiBbeCwgeCArIDFdKS5mbGF0KCk7XG5cbiAgLy8gTm93IHByZXBlbmQgd2l0aCAwIGFuZCBhcHBlbmQgJ2xlbicgc28gdGhhdCB3ZSBoYXZlIHBhaXJzIHRoYXQgd2lsbCBzbGljZVxuICAvLyB0YXJnZXQgZnVsbHkgaW50byBzdWJzdHJpbmdzLiBSZW1lbWJlciB0aGF0IHNsaWNlIHJldHVybnMgY2hhcnMgaW4gW2EsIGIpLFxuICAvLyBpLmUuIFN0cmluZy5zbGljZShhLGIpIHdoZXJlIGIgaXMgb25lIGJleW9uZCB0aGUgbGFzdCBjaGFyIGluIHRoZSBzdHJpbmcgd2VcbiAgLy8gd2FudCB0byBpbmNsdWRlLlxuICByZXR1cm4gWzAsIC4uLnJhbmdlcywgbGVuXTtcbn07XG5cbi8qKiBSZXR1cm5zIHRoZSB0YXJnZXQgc3RyaW5nIGhpZ2hsaWdodGVkIGFyb3VuZCB0aGUgZ2l2ZW4gY2hhcmFjdGVyIGluZGV4ZXMgaW5cbiAqICB0aGUgcmFuZ2VzIGFycmF5LlxuICpcbiAqICBXZSBkb24ndCB1c2UgdGhlIGhpZ2hsaWdodGluZyBmcm9tIGZ1enp5c29ydC5cbiAqL1xuY29uc3QgaGlnaGxpZ2h0ID0gKHJhbmdlczogbnVtYmVyW10sIHRhcmdldDogc3RyaW5nKTogVGVtcGxhdGVSZXN1bHRbXSA9PiB7XG4gIGNvbnN0IHJldDogVGVtcGxhdGVSZXN1bHRbXSA9IFtdO1xuICBsZXQgaW5IaWdobGlnaHQgPSBmYWxzZTtcblxuICAvLyBSdW4gZG93biByYW5nZXMgd2l0aCBhIHNsaWRpbmcgd2luZG93IG9mIGxlbmd0aCAyIGFuZCB1c2UgdGhhdCBhcyB0aGVcbiAgLy8gYXJndW1lbnRzIHRvIHNsaWNlLiBBbHRlcm5hdGUgaGlnaGxpZ2h0aW5nIGVhY2ggc2VnbWVudC5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgY29uc3Qgc3ViID0gdGFyZ2V0LnNsaWNlKHJhbmdlc1tpXSwgcmFuZ2VzW2kgKyAxXSk7XG4gICAgaWYgKGluSGlnaGxpZ2h0KSB7XG4gICAgICByZXQucHVzaChodG1sYDxiPiR7c3VifTwvYj5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0LnB1c2goaHRtbGAke3N1Yn1gKTtcbiAgICB9XG4gICAgaW5IaWdobGlnaHQgPSAhaW5IaWdobGlnaHQ7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKiBSZXR1cm5zIHRoZSB0YXJnZXQgc3RyaW5nIGhpZ2hsaWdodGVkIGFyb3VuZCB0aGUgZ2l2ZW4gY2hhcmFjdGVyIGluZGV4ZXMuXG4gKiAgTm90ZSB0aGF0IHdlIGRvbid0IHVzZSBmdXp6eXNvcnQncyBoaWdobGlnaHQgYmVjYXVzZSB3ZSBoYXZlbid0IHNhbml0aXplZFxuICogIHRoZSBuYW1lcy5cbiAqL1xuY29uc3QgaGlnaGxpZ2h0ZWRUYXJnZXQgPSAoXG4gIGluZGV4ZXM6IFJlYWRvbmx5PG51bWJlcltdPixcbiAgdGFyZ2V0OiBzdHJpbmdcbik6IFRlbXBsYXRlUmVzdWx0W10gPT4ge1xuICByZXR1cm4gaGlnaGxpZ2h0KGluZGV4ZXNUb1JhbmdlcyhpbmRleGVzLCB0YXJnZXQubGVuZ3RoKSwgdGFyZ2V0KTtcbn07XG5cbmNvbnN0IHNlYXJjaFJlc3VsdHMgPSAoc2VhcmNoVGFza1BhbmVsOiBUYXNrU2VhcmNoQ29udHJvbCk6IFRlbXBsYXRlUmVzdWx0W10gPT5cbiAgc2VhcmNoVGFza1BhbmVsLnNlYXJjaFJlc3VsdHMubWFwKFxuICAgICh0YXNrOiBTZWFyY2hSZXN1bHQsIGluZGV4OiBudW1iZXIpID0+XG4gICAgICBodG1sYCA8bGlcbiAgICAgICAgdGFiaW5kZXg9XCIwXCJcbiAgICAgICAgQGNsaWNrPVwiJHsoZTogRXZlbnQpID0+XG4gICAgICAgICAgc2VhcmNoVGFza1BhbmVsLnNlbGVjdFNlYXJjaFJlc3VsdChpbmRleCwgZmFsc2UpfVwiXG4gICAgICAgID9kYXRhLWZvY3VzPSR7aW5kZXggPT09IHNlYXJjaFRhc2tQYW5lbC5mb2N1c0luZGV4fVxuICAgICAgICBkYXRhLWluZGV4PSR7aW5kZXh9XG4gICAgICA+XG4gICAgICAgICR7aGlnaGxpZ2h0ZWRUYXJnZXQodGFzay5pbmRleGVzLCB0YXNrLnRhcmdldCl9XG4gICAgICA8L2xpPmBcbiAgKTtcblxuY29uc3QgdGVtcGxhdGUgPSAoc2VhcmNoVGFza1BhbmVsOiBUYXNrU2VhcmNoQ29udHJvbCk6IFRlbXBsYXRlUmVzdWx0ID0+IGh0bWxgXG4gIDxpbnB1dFxuICAgIGF1dG9jb21wbGV0ZT1cIm9mZlwiXG4gICAgbmFtZT1cInRhc2tfc2VhcmNoXCJcbiAgICBpZD1cInNlYXJjaF9pbnB1dFwiXG4gICAgcGxhY2Vob2xkZXI9XCJTZWFyY2hcIlxuICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICBAaW5wdXQ9XCIkeyhlOiBJbnB1dEV2ZW50KSA9PlxuICAgICAgc2VhcmNoVGFza1BhbmVsLm9uSW5wdXQoKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKX1cIlxuICAgIEBrZXlkb3duPVwiJHsoZTogS2V5Ym9hcmRFdmVudCkgPT4gc2VhcmNoVGFza1BhbmVsLm9uS2V5RG93bihlKX1cIlxuICAgIEBmb2N1cz1cIiR7KCkgPT4gc2VhcmNoVGFza1BhbmVsLnNlYXJjaElucHV0UmVjZWl2ZWRGb2N1cygpfVwiXG4gIC8+XG4gIDx1bD5cbiAgICAke3NlYXJjaFJlc3VsdHMoc2VhcmNoVGFza1BhbmVsKX1cbiAgPC91bD5cbmA7XG5cbmV4cG9ydCB0eXBlIFNlYXJjaFR5cGUgPSBcIm5hbWUtb25seVwiIHwgXCJmdWxsLWluZm9cIjtcblxuY29uc3Qgc2VhcmNoU3RyaW5nRnJvbVRhc2tCdWlsZGVyID0gKFxuICBmdWxsVGFza0xpc3Q6IFRhc2tbXSxcbiAgc2VhcmNoVHlwZTogU2VhcmNoVHlwZSxcbiAgaW5jbHVkZWRJbmRleGVzOiBTZXQ8bnVtYmVyPixcbiAgbWF4TmFtZUxlbmd0aDogbnVtYmVyXG4pOiAoKHRhc2s6IFRhc2spID0+IHN0cmluZykgPT4ge1xuICBpZiAoc2VhcmNoVHlwZSA9PT0gXCJmdWxsLWluZm9cIikge1xuICAgIHJldHVybiAodGFzazogVGFzayk6IHN0cmluZyA9PiB7XG4gICAgICBpZiAoaW5jbHVkZWRJbmRleGVzLnNpemUgIT09IDApIHtcbiAgICAgICAgY29uc3QgdGFza0luZGV4ID0gZnVsbFRhc2tMaXN0LmluZGV4T2YodGFzayk7XG4gICAgICAgIGlmICghaW5jbHVkZWRJbmRleGVzLmhhcyh0YXNrSW5kZXgpKSB7XG4gICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHRhc2sucmVzb3VyY2VzKTtcbiAgICAgIHJlc291cmNlS2V5cy5zb3J0KCk7XG4gICAgICByZXR1cm4gYCR7dGFzay5uYW1lfSAke1wiLVwiLnJlcGVhdChtYXhOYW1lTGVuZ3RoIC0gdGFzay5uYW1lLmxlbmd0aCArIDIpfSAke3Jlc291cmNlS2V5c1xuICAgICAgICAubWFwKChrZXk6IHN0cmluZykgPT4gdGFzay5yZXNvdXJjZXNba2V5XSlcbiAgICAgICAgLmpvaW4oXCIgXCIpfWA7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKHRhc2s6IFRhc2spOiBzdHJpbmcgPT4ge1xuICAgICAgaWYgKGluY2x1ZGVkSW5kZXhlcy5zaXplICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IHRhc2tJbmRleCA9IGZ1bGxUYXNrTGlzdC5pbmRleE9mKHRhc2spO1xuICAgICAgICBpZiAoIWluY2x1ZGVkSW5kZXhlcy5oYXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGFzay5uYW1lO1xuICAgIH07XG4gIH1cbn07XG5cbmludGVyZmFjZSBTZWFyY2hSZXN1bHQge1xuICBvYmo6IFRhc2s7XG4gIGluZGV4ZXM6IFJlYWRvbmx5QXJyYXk8bnVtYmVyPjtcbiAgdGFyZ2V0OiBzdHJpbmc7XG59XG5cbmNvbnN0IHRhc2tMaXN0VG9TZWFyY2hSZXN1bHRzID0gKFxuICB0YXNrczogVGFza1tdLFxuICB0YXNrVG9TZWFyY2hTdHJpbmc6ICh0YXNrOiBUYXNrKSA9PiBzdHJpbmcsXG4gIGluY2x1ZGVkSW5kZXhlczogU2V0PG51bWJlcj5cbik6IFNlYXJjaFJlc3VsdFtdID0+IHtcbiAgcmV0dXJuIHRhc2tzXG4gICAgLmZpbHRlcigoX3Rhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IGluY2x1ZGVkSW5kZXhlcy5oYXMoaW5kZXgpKVxuICAgIC5tYXAoKHQ6IFRhc2spID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9iajogdCxcbiAgICAgICAgaW5kZXhlczogW10sXG4gICAgICAgIHRhcmdldDogdGFza1RvU2VhcmNoU3RyaW5nKHQpLFxuICAgICAgfTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ29udHJvbCBmb3IgdXNpbmcgZnV6enkgc2VhcmNoIG9uIGEgbGlzdCBvZiB0YXNrcy5cbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBUYXNrU2VhcmNoQ29udHJvbCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgX3Rhc2tzOiBUYXNrW10gPSBbXTtcbiAgX2luY2x1ZGVkSW5kZXhlczogU2V0PG51bWJlcj4gPSBuZXcgU2V0KCk7XG4gIGZvY3VzSW5kZXg6IG51bWJlciA9IDA7XG4gIHNlYXJjaFJlc3VsdHM6IFJlYWRvbmx5QXJyYXk8U2VhcmNoUmVzdWx0PiA9IFtdO1xuICBzZWFyY2hUeXBlOiBTZWFyY2hUeXBlID0gXCJuYW1lLW9ubHlcIjtcbiAgdGFza1RvU2VhcmNoU3RyaW5nOiAodGFzazogVGFzaykgPT4gc3RyaW5nID0gKHRhc2s6IFRhc2spID0+IFwiXCI7XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIG9uSW5wdXQoaW5wdXRTdHJpbmc6IHN0cmluZykge1xuICAgIGlmIChpbnB1dFN0cmluZyA9PT0gXCJcIikge1xuICAgICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gdGFza0xpc3RUb1NlYXJjaFJlc3VsdHMoXG4gICAgICAgIHRoaXMuX3Rhc2tzLFxuICAgICAgICB0aGlzLnRhc2tUb1NlYXJjaFN0cmluZyxcbiAgICAgICAgdGhpcy5faW5jbHVkZWRJbmRleGVzXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlYXJjaFJlc3VsdHMgPSBmdXp6eXNvcnQuZ288VGFzaz4oXG4gICAgICAgIGlucHV0U3RyaW5nLFxuICAgICAgICB0aGlzLl90YXNrcy5zbGljZSgxLCAtMSksIC8vIFJlbW92ZSBTdGFydCBhbmQgRmluaXNoIGZyb20gc2VhcmNoIHJhbmdlLlxuICAgICAgICB7XG4gICAgICAgICAga2V5OiB0aGlzLnRhc2tUb1NlYXJjaFN0cmluZyxcbiAgICAgICAgICBsaW1pdDogdGhpcy5fdGFza3MubGVuZ3RoLFxuICAgICAgICAgIHRocmVzaG9sZDogMC4yLFxuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLmZvY3VzSW5kZXggPSAwO1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBvbktleURvd24oZTogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmICh0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFRPRE8gLSBleHRyYWN0IGZyb20gdGhlIHR3byBwbGFjZXMgd2UgZG8gdGhpcy5cbiAgICBjb25zdCBrZXluYW1lID0gYCR7ZS5zaGlmdEtleSA/IFwic2hpZnQtXCIgOiBcIlwifSR7ZS5jdHJsS2V5ID8gXCJjdHJsLVwiIDogXCJcIn0ke2UubWV0YUtleSA/IFwibWV0YS1cIiA6IFwiXCJ9JHtlLmFsdEtleSA/IFwiYWx0LVwiIDogXCJcIn0ke2Uua2V5fWA7XG4gICAgc3dpdGNoIChrZXluYW1lKSB7XG4gICAgICBjYXNlIFwiQXJyb3dEb3duXCI6XG4gICAgICAgIHRoaXMuZm9jdXNJbmRleCA9ICh0aGlzLmZvY3VzSW5kZXggKyAxKSAlIHRoaXMuc2VhcmNoUmVzdWx0cy5sZW5ndGg7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dVcFwiOlxuICAgICAgICB0aGlzLmZvY3VzSW5kZXggPVxuICAgICAgICAgICh0aGlzLmZvY3VzSW5kZXggLSAxICsgdGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aCkgJVxuICAgICAgICAgIHRoaXMuc2VhcmNoUmVzdWx0cy5sZW5ndGg7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiRW50ZXJcIjpcbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoUmVzdWx0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZWxlY3RTZWFyY2hSZXN1bHQodGhpcy5mb2N1c0luZGV4LCBmYWxzZSk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiY3RybC1FbnRlclwiOlxuICAgICAgICBpZiAodGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNlbGVjdFNlYXJjaFJlc3VsdCh0aGlzLmZvY3VzSW5kZXgsIHRydWUpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgY29uc29sZS5sb2codGhpcy5mb2N1c0luZGV4KTtcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgc2VsZWN0U2VhcmNoUmVzdWx0KGluZGV4OiBudW1iZXIsIGZvY3VzOiBib29sZWFuKSB7XG4gICAgY29uc3QgdGFza0luZGV4ID0gdGhpcy5fdGFza3MuaW5kZXhPZih0aGlzLnNlYXJjaFJlc3VsdHNbaW5kZXhdLm9iaik7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgbmV3IEN1c3RvbUV2ZW50PFRhc2tDaGFuZ2VEZXRhaWw+KFwidGFzay1jaGFuZ2VcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICB0YXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICAgICAgICBmb2N1czogZm9jdXMsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gW107XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIHNlYXJjaElucHV0UmVjZWl2ZWRGb2N1cygpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8bnVtYmVyPihcInRhc2stZm9jdXNcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoc2VhcmNoVHlwZTogU2VhcmNoVHlwZSkge1xuICAgIHRoaXMuc2VhcmNoVHlwZSA9IHNlYXJjaFR5cGU7XG4gICAgY29uc3QgaW5wdXRDb250cm9sID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiaW5wdXRcIikhO1xuICAgIGlucHV0Q29udHJvbC5mb2N1cygpO1xuICAgIGlucHV0Q29udHJvbC5zZWxlY3QoKTtcbiAgICB0aGlzLm9uSW5wdXQoaW5wdXRDb250cm9sLnZhbHVlKTtcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgcHVibGljIHNldCB0YXNrcyh0YXNrczogVGFza1tdKSB7XG4gICAgdGhpcy5fdGFza3MgPSB0YXNrcztcbiAgICB0aGlzLmJ1aWxkVGFza1RvU2VhcmNoU3RyaW5nKCk7XG4gIH1cblxuICBwdWJsaWMgc2V0IGluY2x1ZGVkSW5kZXhlcyh2OiBudW1iZXJbXSkge1xuICAgIHRoaXMuX2luY2x1ZGVkSW5kZXhlcyA9IG5ldyBTZXQodik7XG4gICAgdGhpcy5idWlsZFRhc2tUb1NlYXJjaFN0cmluZygpO1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZFRhc2tUb1NlYXJjaFN0cmluZygpIHtcbiAgICBjb25zdCBtYXhOYW1lTGVuZ3RoID0gdGhpcy5fdGFza3MucmVkdWNlPG51bWJlcj4oXG4gICAgICAocHJldjogbnVtYmVyLCB0YXNrOiBUYXNrKTogbnVtYmVyID0+XG4gICAgICAgIHRhc2submFtZS5sZW5ndGggPiBwcmV2ID8gdGFzay5uYW1lLmxlbmd0aCA6IHByZXYsXG4gICAgICAwXG4gICAgKTtcbiAgICB0aGlzLnRhc2tUb1NlYXJjaFN0cmluZyA9IHNlYXJjaFN0cmluZ0Zyb21UYXNrQnVpbGRlcihcbiAgICAgIHRoaXMuX3Rhc2tzLFxuICAgICAgdGhpcy5zZWFyY2hUeXBlLFxuICAgICAgdGhpcy5faW5jbHVkZWRJbmRleGVzLFxuICAgICAgbWF4TmFtZUxlbmd0aFxuICAgICk7XG4gICAgdGhpcy5vbklucHV0KFwiXCIpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcInRhc2stc2VhcmNoLWNvbnRyb2xcIiwgVGFza1NlYXJjaENvbnRyb2wpO1xuIiwgIi8qKiBBIGNvb3JkaW5hdGUgcG9pbnQgb24gdGhlIHJlbmRlcmluZyBzdXJmYWNlLiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIFBvaW50IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBwdCA9ICh4OiBudW1iZXIsIHk6IG51bWJlcik6IFBvaW50ID0+IHtcbiAgcmV0dXJuIHsgeDogeCwgeTogeSB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHB0dCA9IChwOiBbbnVtYmVyLCBudW1iZXJdKTogUG9pbnQgPT4ge1xuICBjb25zdCBbeCwgeV0gPSBwO1xuICByZXR1cm4geyB4OiB4LCB5OiB5IH07XG59O1xuXG5leHBvcnQgY29uc3Qgc3VtID0gKHAxOiBQb2ludCwgcDI6IFBvaW50KTogUG9pbnQgPT4ge1xuICByZXR1cm4ge1xuICAgIHg6IHAxLnggKyBwMi54LFxuICAgIHk6IHAxLnkgKyBwMi55LFxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGFkZCA9IChwMTogUG9pbnQsIHAyOiBbbnVtYmVyLCBudW1iZXJdKTogUG9pbnQgPT4ge1xuICBjb25zdCBbeDIsIHkyXSA9IHAyO1xuICByZXR1cm4ge1xuICAgIHg6IHAxLnggKyB4MixcbiAgICB5OiBwMS55ICsgeTIsXG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgZXF1YWwgPSAocDE6IFBvaW50LCBwMjogUG9pbnQpOiBib29sZWFuID0+XG4gIHAxLnggPT09IHAyLnggJiYgcDEueSA9PT0gcDIueTtcblxuZXhwb3J0IGNvbnN0IGR1cCA9IChwOiBQb2ludCk6IFBvaW50ID0+IHtcbiAgcmV0dXJuIHsgeDogcC54LCB5OiBwLnkgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBkaWZmZXJlbmNlID0gKHAxOiBQb2ludCwgcDI6IFBvaW50KTogW251bWJlciwgbnVtYmVyXSA9PiB7XG4gIHJldHVybiBbcDIueCAtIHAxLngsIHAyLnkgLSBwMS55XTtcbn07XG4iLCAiLyoqXG4gKiBGdW5jdGlvbmFsaXR5IGZvciBjcmVhdGluZyBkcmFnZ2FibGUgZGl2aWRlcnMgYmV0d2VlbiBlbGVtZW50cyBvbiBhIHBhZ2UuXG4gKi9cbmltcG9ydCB7IGNsYW1wIH0gZnJvbSBcIi4uLy4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFBvaW50LCBkdXAsIGVxdWFsLCBwdCB9IGZyb20gXCIuLi8uLi9wb2ludC9wb2ludC50c1wiO1xuXG4vLyBWYWx1ZXMgYXJlIHJldHVybmVkIGFzIHBlcmNlbnRhZ2VzIGFyb3VuZCB0aGUgY3VycmVudCBtb3VzZSBsb2NhdGlvbi4gVGhhdFxuLy8gaXMsIGlmIHdlIGFyZSBpbiBcImNvbHVtblwiIG1vZGUgdGhlbiBgYmVmb3JlYCB3b3VsZCBlcXVhbCB0aGUgbW91c2UgcG9zaXRpb25cbi8vIGFzIGEgJSBvZiB0aGUgd2lkdGggb2YgdGhlIHBhcmVudCBlbGVtZW50IGZyb20gdGhlIGxlZnQgaGFuZCBzaWRlIG9mIHRoZVxuLy8gcGFyZW50IGVsZW1lbnQuIFRoZSBgYWZ0ZXJgIHZhbHVlIGlzIGp1c3QgMTAwLWJlZm9yZS5cbmV4cG9ydCBpbnRlcmZhY2UgRGl2aWRlck1vdmVSZXN1bHQge1xuICBiZWZvcmU6IG51bWJlcjtcbiAgYWZ0ZXI6IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgRGl2aWRlclR5cGUgPSBcImNvbHVtblwiIHwgXCJyb3dcIjtcblxuZXhwb3J0IGNvbnN0IERJVklERVJfTU9WRV9FVkVOVCA9IFwiZGl2aWRlcl9tb3ZlXCI7XG5cbmV4cG9ydCBjb25zdCBSRVNJWklOR19DTEFTUyA9IFwicmVzaXppbmdcIjtcblxuaW50ZXJmYWNlIFJlY3Qge1xuICB0b3A6IG51bWJlcjtcbiAgbGVmdDogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbn1cblxuLyoqIFJldHVybnMgYSBib3VuZGluZyByZWN0YW5nbGUgZm9yIGFuIGVsZW1lbnQgaW4gUGFnZSBjb29yZGluYXRlcywgYXMgb3Bwb3NlZFxuICogdG8gVmlld1BvcnQgY29vcmRpbmF0ZXMsIHdoaWNoIGlzIHdoYXQgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgcmV0dXJucy5cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFBhZ2VSZWN0ID0gKGVsZTogSFRNTEVsZW1lbnQpOiBSZWN0ID0+IHtcbiAgY29uc3Qgdmlld3BvcnRSZWN0ID0gZWxlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZXR1cm4ge1xuICAgIHRvcDogdmlld3BvcnRSZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZLFxuICAgIGxlZnQ6IHZpZXdwb3J0UmVjdC5sZWZ0ICsgd2luZG93LnNjcm9sbFgsXG4gICAgd2lkdGg6IHZpZXdwb3J0UmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHZpZXdwb3J0UmVjdC5oZWlnaHQsXG4gIH07XG59O1xuXG4vKiogRGl2aWRlck1vdmUgaXMgY29yZSBmdW5jdGlvbmFsaXR5IGZvciBjcmVhdGluZyBkcmFnZ2FibGUgZGl2aWRlcnMgYmV0d2VlblxuICogZWxlbWVudHMgb24gYSBwYWdlLlxuICpcbiAqIENvbnN0cnVjdCBhIERpdmlkZXJNb2RlIHdpdGggYSBwYXJlbnQgZWxlbWVudCBhbmQgYSBkaXZpZGVyIGVsZW1lbnQsIHdoZXJlXG4gKiB0aGUgZGl2aWRlciBlbGVtZW50IGlzIHRoZSBlbGVtZW50IGJldHdlZW4gb3RoZXIgcGFnZSBlbGVtZW50cyB0aGF0IGlzXG4gKiBleHBlY3RlZCB0byBiZSBkcmFnZ2VkLiBGb3IgZXhhbXBsZSwgaW4gdGhlIGZvbGxvd2luZyBleGFtcGxlICNjb250YWluZXJcbiAqIHdvdWxkIGJlIHRoZSBgcGFyZW50YCwgYW5kICNkaXZpZGVyIHdvdWxkIGJlIHRoZSBgZGl2aWRlcmAgZWxlbWVudC5cbiAqXG4gKiAgPGRpdiBpZD1jb250YWluZXI+XG4gKiAgICA8ZGl2IGlkPWxlZnQ+PC9kaXY+ICA8ZGl2IGlkPWRpdmlkZXI+PC9kaXY+IDxkaXYgaWQ9cmlnaHQ+PC9kaXY/XG4gKiAgPC9kaXY+XG4gKlxuICogRGl2aWRlck1vZGUgd2FpdHMgZm9yIGEgbW91c2Vkb3duIGV2ZW50IG9uIHRoZSBgZGl2aWRlcmAgZWxlbWVudCBhbmQgdGhlblxuICogd2F0Y2hlcyBtb3VzZSBldmVudHMgZm9yIHRoZSBnaXZlbiBwYXJlbnQgSFRNTEVsZW1lbnQgYW5kIGVtaXRzIGV2ZW50cyBhcm91bmRcbiAqIGRyYWdnaW5nLlxuICpcbiAqIFRoZSBlbWl0dGVkIGV2ZW50IGlzIFwiZGl2aWRlcl9tb3ZlXCIgYW5kIGlzIGEgQ3VzdG9tRXZlbnQ8RGl2aWRlck1vdmVSZXN1bHQ+LlxuICpcbiAqIEl0IGlzIHVwIHRvIHRoZSB1c2VyIG9mIERpdmlkZXJNb3ZlIHRvIGxpc3RlbiBmb3IgdGhlIFwiZGl2aWRlcl9tb3ZlXCIgZXZlbnRzXG4gKiBhbmQgdXBkYXRlIHRoZSBDU1Mgb2YgdGhlIHBhZ2UgYXBwcm9wcmlhdGVseSB0byByZWZsZWN0IHRoZSBwb3NpdGlvbiBvZiB0aGVcbiAqIGRpdmlkZXIuXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgZG93biBhbiBldmVudCB3aWxsIGJlIGVtaXR0ZWQgcGVyaW9kaWNhbGx5IGFzIHRoZSBtb3VzZVxuICogbW92ZXMuXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcmVsZWFzZWQsIG9yIGlmIHRoZSBtb3VzZSBleGl0cyB0aGUgcGFyZW50IEhUTUxFbGVtZW50LCBvbmVcbiAqIGxhc3QgZXZlbnQgaXMgZW1pdHRlZC5cbiAqXG4gKiBXaGlsZSBkcmFnZ2luZyB0aGUgZGl2aWRlciwgdGhlIFwicmVzaXppbmdcIiBjbGFzcyB3aWxsIGJlIGFkZGVkIHRvIHRoZSBwYXJlbnRcbiAqIGVsZW1lbnQuIFRoaXMgY2FuIGJlIHVzZWQgdG8gc2V0IGEgc3R5bGUsIGUuZy4gJ3VzZXItc2VsZWN0OiBub25lJy5cbiAqL1xuZXhwb3J0IGNsYXNzIERpdmlkZXJNb3ZlIHtcbiAgLyoqIFRoZSBwb2ludCB3aGVyZSBkcmFnZ2luZyBzdGFydGVkLCBpbiBQYWdlIGNvb3JkaW5hdGVzLiAqL1xuICBiZWdpbjogUG9pbnQgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGRpbWVuc2lvbnMgb2YgdGhlIHBhcmVudCBlbGVtZW50IGluIFBhZ2UgY29vcmRpbmF0ZXMgYXMgb2YgbW91c2Vkb3duXG4gICAqIG9uIHRoZSBkaXZpZGVyLi4gKi9cbiAgcGFyZW50UmVjdDogUmVjdCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgY3VycmVudCBtb3VzZSBwb3NpdGlvbiBpbiBQYWdlIGNvb3JkaW5hdGVzLiAqL1xuICBjdXJyZW50TW92ZUxvY2F0aW9uOiBQb2ludCA9IHB0KDAsIDApO1xuXG4gIC8qKiBUaGUgbGFzdCBtb3VzZSBwb3NpdGlvbiBpbiBQYWdlIGNvb3JkaW5hdGVzIHJlcG9ydGVkIHZpYSBDdXN0b21FdmVudC4gKi9cbiAgbGFzdE1vdmVTZW50OiBQb2ludCA9IHB0KDAsIDApO1xuXG4gIC8qKiBUaGUgcGFyZW50IGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgZGl2aWRlci4gKi9cbiAgcGFyZW50OiBIVE1MRWxlbWVudDtcblxuICAvKiogVGhlIGRpdmlkZXIgZWxlbWVudCB0byBiZSBkcmFnZ2VkIGFjcm9zcyB0aGUgcGFyZW50IGVsZW1lbnQuICovXG4gIGRpdmlkZXI6IEhUTUxFbGVtZW50O1xuXG4gIC8qKiBUaGUgaGFuZGxlIG9mIHRoZSB3aW5kb3cuc2V0SW50ZXJ2YWwoKS4gKi9cbiAgaW50ZXJudmFsSGFuZGxlOiBudW1iZXIgPSAwO1xuXG4gIC8qKiBUaGUgdHlwZSBvZiBkaXZpZGVyLCBlaXRoZXIgdmVydGljYWwgKFwiY29sdW1uXCIpLCBvciBob3Jpem9udGFsIChcInJvd1wiKS4gKi9cbiAgZGl2aWRlclR5cGU6IERpdmlkZXJUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHBhcmVudDogSFRNTEVsZW1lbnQsXG4gICAgZGl2aWRlcjogSFRNTEVsZW1lbnQsXG4gICAgZGl2aWRlclR5cGU6IERpdmlkZXJUeXBlID0gXCJjb2x1bW5cIlxuICApIHtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLmRpdmlkZXIgPSBkaXZpZGVyO1xuICAgIHRoaXMuZGl2aWRlclR5cGUgPSBkaXZpZGVyVHlwZTtcbiAgICB0aGlzLmRpdmlkZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGRldGFjaCgpIHtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZGl2aWRlci5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICB9XG5cbiAgb25UaW1lb3V0KCkge1xuICAgIGlmICghZXF1YWwodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLCB0aGlzLmxhc3RNb3ZlU2VudCkpIHtcbiAgICAgIGxldCBkaWZmUGVyY2VudDogbnVtYmVyID0gMDtcbiAgICAgIGlmICh0aGlzLmRpdmlkZXJUeXBlID09PSBcImNvbHVtblwiKSB7XG4gICAgICAgIGRpZmZQZXJjZW50ID1cbiAgICAgICAgICAoMTAwICogKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54IC0gdGhpcy5wYXJlbnRSZWN0IS5sZWZ0KSkgL1xuICAgICAgICAgIHRoaXMucGFyZW50UmVjdCEud2lkdGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaWZmUGVyY2VudCA9XG4gICAgICAgICAgKDEwMCAqICh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSAtIHRoaXMucGFyZW50UmVjdCEudG9wKSkgL1xuICAgICAgICAgIHRoaXMucGFyZW50UmVjdCEuaGVpZ2h0O1xuICAgICAgfVxuICAgICAgLy8gVE9ETyAtIFNob3VsZCBjbGFtcCBiZSBzZXR0YWJsZSBpbiB0aGUgY29uc3RydWN0b3I/XG4gICAgICBkaWZmUGVyY2VudCA9IGNsYW1wKGRpZmZQZXJjZW50LCA1LCA5NSk7XG5cbiAgICAgIHRoaXMucGFyZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudDxEaXZpZGVyTW92ZVJlc3VsdD4oRElWSURFUl9NT1ZFX0VWRU5ULCB7XG4gICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICBiZWZvcmU6IGRpZmZQZXJjZW50LFxuICAgICAgICAgICAgYWZ0ZXI6IDEwMCAtIGRpZmZQZXJjZW50LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgdGhpcy5sYXN0TW92ZVNlbnQgPSBkdXAodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBtb3VzZW1vdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54ID0gZS5wYWdlWDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSA9IGUucGFnZVk7XG4gIH1cblxuICBtb3VzZWRvd24oZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuaW50ZXJudmFsSGFuZGxlID0gd2luZG93LnNldEludGVydmFsKHRoaXMub25UaW1lb3V0LmJpbmQodGhpcyksIDE2KTtcbiAgICB0aGlzLnBhcmVudFJlY3QgPSBnZXRQYWdlUmVjdCh0aGlzLnBhcmVudCk7XG5cbiAgICB0aGlzLnBhcmVudC5jbGFzc0xpc3QuYWRkKFJFU0laSU5HX0NMQVNTKTtcblxuICAgIHRoaXMucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmVnaW4gPSBwdChlLnBhZ2VYLCBlLnBhZ2VZKTtcbiAgfVxuXG4gIG1vdXNldXAoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZmluaXNoZWQocHQoZS5wYWdlWCwgZS5wYWdlWSkpO1xuICB9XG5cbiAgbW91c2VsZWF2ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maW5pc2hlZChwdChlLnBhZ2VYLCBlLnBhZ2VZKSk7XG4gIH1cblxuICBmaW5pc2hlZChlbmQ6IFBvaW50KSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuXG4gICAgdGhpcy5wYXJlbnQuY2xhc3NMaXN0LnJlbW92ZShSRVNJWklOR19DTEFTUyk7XG5cbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBlbmQ7XG4gICAgdGhpcy5vblRpbWVvdXQoKTtcbiAgICB0aGlzLmJlZ2luID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBwdCgwLCAwKTtcbiAgICB0aGlzLmxhc3RNb3ZlU2VudCA9IHB0KDAsIDApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgUG9pbnQsIGR1cCwgZXF1YWwsIHB0IH0gZnJvbSBcIi4uLy4uL3BvaW50L3BvaW50LnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhZ1JhbmdlIHtcbiAgYmVnaW46IFBvaW50O1xuICBlbmQ6IFBvaW50O1xufVxuXG5leHBvcnQgY29uc3QgRFJBR19SQU5HRV9FVkVOVCA9IFwiZHJhZ3JhbmdlXCI7XG5cbi8qKiBNb3VzZU1vdmUgd2F0Y2hlcyBtb3VzZSBldmVudHMgZm9yIGEgZ2l2ZW4gSFRNTEVsZW1lbnQgYW5kIGVtaXRzXG4gKiBldmVudHMgYXJvdW5kIGRyYWdnaW5nLlxuICpcbiAqIFRoZSBlbWl0dGVkIGV2ZW50IGlzIFwiZHJhZ3JhbmdlXCIgYW5kIGlzIGEgQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPi5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyBwcmVzc2VkIGRvd24gaW4gdGhlIEhUTUxFbGVtZW50IGFuIGV2ZW50IHdpbGwgYmVcbiAqIGVtaXR0ZWQgcGVyaW9kaWNhbGx5IGFzIHRoZSBtb3VzZSBtb3Zlcy5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyByZWxlYXNlZCwgb3IgZXhpdHMgdGhlIEhUTUxFbGVtZW50IG9uZSBsYXN0IGV2ZW50XG4gKiBpcyBlbWl0dGVkLlxuICovXG5leHBvcnQgY2xhc3MgTW91c2VEcmFnIHtcbiAgYmVnaW46IFBvaW50IHwgbnVsbCA9IG51bGw7XG4gIGN1cnJlbnRNb3ZlTG9jYXRpb246IFBvaW50ID0gcHQoMCwgMCk7XG4gIGxhc3RNb3ZlU2VudDogUG9pbnQgPSBwdCgwLCAwKTtcbiAgZWxlOiBIVE1MRWxlbWVudDtcbiAgaW50ZXJudmFsSGFuZGxlOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGVsZTogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZSA9IGVsZTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXRhY2goKSB7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICB9XG5cbiAgb25UaW1lb3V0KCkge1xuICAgIGlmICghZXF1YWwodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLCB0aGlzLmxhc3RNb3ZlU2VudCkpIHtcbiAgICAgIHRoaXMuZWxlLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudDxEcmFnUmFuZ2U+KERSQUdfUkFOR0VfRVZFTlQsIHtcbiAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgIGJlZ2luOiBkdXAodGhpcy5iZWdpbiEpLFxuICAgICAgICAgICAgZW5kOiBkdXAodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHRoaXMubGFzdE1vdmVTZW50ID0gZHVwKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgbW91c2Vtb3ZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCA9IGUub2Zmc2V0WDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSA9IGUub2Zmc2V0WTtcbiAgfVxuXG4gIG1vdXNlZG93bihlOiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5pbnRlcm52YWxIYW5kbGUgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5vblRpbWVvdXQuYmluZCh0aGlzKSwgMTYpO1xuICAgIHRoaXMuYmVnaW4gPSBwdChlLm9mZnNldFgsIGUub2Zmc2V0WSk7XG4gIH1cblxuICBtb3VzZXVwKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmZpbmlzaGVkKHB0KGUub2Zmc2V0WCwgZS5vZmZzZXRZKSk7XG4gIH1cblxuICBtb3VzZWxlYXZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZpbmlzaGVkKHB0KGUub2Zmc2V0WCwgZS5vZmZzZXRZKSk7XG4gIH1cblxuICBmaW5pc2hlZChlbmQ6IFBvaW50KSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IGVuZDtcbiAgICB0aGlzLm9uVGltZW91dCgpO1xuICAgIHRoaXMuYmVnaW4gPSBudWxsO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IHB0KDAsIDApO1xuICAgIHRoaXMubGFzdE1vdmVTZW50ID0gcHQoMCwgMCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBQb2ludCwgZHVwLCBlcXVhbCwgcHQgfSBmcm9tIFwiLi4vLi4vcG9pbnQvcG9pbnQudHNcIjtcblxuLyoqIE1vdXNlTW92ZSB3YXRjaGVzIG1vdXNlIGV2ZW50cyBmb3IgYSBnaXZlbiBIVE1MRWxlbWVudCBhbmQgcmVjb3JkcyB0aGUgbW9zdFxuICogIHJlY2VudCBsb2NhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vdXNlTW92ZSB7XG4gIGN1cnJlbnRNb3ZlTG9jYXRpb246IFBvaW50ID0gcHQoMCwgMCk7XG4gIGxhc3RSZWFkTG9jYXRpb246IFBvaW50ID0gcHQoMCwgMCk7XG4gIGVsZTogSFRNTEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoZWxlOiBIVE1MRWxlbWVudCkge1xuICAgIHRoaXMuZWxlID0gZWxlO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZGV0YWNoKCkge1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBtb3VzZW1vdmUoZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54ID0gZS5vZmZzZXRYO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi55ID0gZS5vZmZzZXRZO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYSBQb2ludCBpZiB0aGUgbW91c2UgaGFkIG1vdmVkIHNpbmNlIHRoZSBsYXN0IHJlYWQsIG90aGVyd2lzZVxuICAgKiByZXR1cm5zIG51bGwuXG4gICAqL1xuICByZWFkTG9jYXRpb24oKTogUG9pbnQgfCBudWxsIHtcbiAgICBpZiAoZXF1YWwodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLCB0aGlzLmxhc3RSZWFkTG9jYXRpb24pKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5sYXN0UmVhZExvY2F0aW9uID0gZHVwKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbik7XG4gICAgcmV0dXJuIGR1cCh0aGlzLmxhc3RSZWFkTG9jYXRpb24pO1xuICB9XG59XG4iLCAiZXhwb3J0IGNvbnN0IE1JTl9ESVNQTEFZX1JBTkdFID0gNztcblxuLyoqIFJlcHJlc2VudHMgYSByYW5nZSBvZiBkYXlzIG92ZXIgd2hpY2ggdG8gZGlzcGxheSBhIHpvb21lZCBpbiB2aWV3LCB1c2luZ1xuICogdGhlIGhhbGYtb3BlbiBpbnRlcnZhbCBbYmVnaW4sIGVuZCkuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXNwbGF5UmFuZ2Uge1xuICBwcml2YXRlIF9iZWdpbjogbnVtYmVyO1xuICBwcml2YXRlIF9lbmQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihiZWdpbjogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xuICAgIHRoaXMuX2JlZ2luID0gYmVnaW47XG4gICAgdGhpcy5fZW5kID0gZW5kO1xuICAgIGlmICh0aGlzLl9iZWdpbiA+IHRoaXMuX2VuZCkge1xuICAgICAgW3RoaXMuX2VuZCwgdGhpcy5fYmVnaW5dID0gW3RoaXMuX2JlZ2luLCB0aGlzLl9lbmRdO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZW5kIC0gdGhpcy5fYmVnaW4gPCBNSU5fRElTUExBWV9SQU5HRSkge1xuICAgICAgdGhpcy5fZW5kID0gdGhpcy5fYmVnaW4gKyBNSU5fRElTUExBWV9SQU5HRTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgaW4oeDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHggPj0gdGhpcy5fYmVnaW4gJiYgeCA8PSB0aGlzLl9lbmQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJlZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2JlZ2luO1xuICB9XG5cbiAgcHVibGljIGdldCBlbmQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZW5kO1xuICB9XG5cbiAgcHVibGljIGdldCByYW5nZUluRGF5cygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9lbmQgLSB0aGlzLl9iZWdpbjtcbiAgfVxufVxuIiwgImltcG9ydCB7IERpcmVjdGVkRWRnZSwgRWRnZXMgfSBmcm9tIFwiLi4vLi4vZGFnL2RhZ1wiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IFNwYW4gfSBmcm9tIFwiLi4vLi4vc2xhY2svc2xhY2tcIjtcbmltcG9ydCB7IENoYXJ0LCBDaGFydFZhbGlkYXRlLCBUYXNrLCBUYXNrcyB9IGZyb20gXCIuLi9jaGFydFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoYXJ0TGlrZSB7XG4gIFZlcnRpY2VzOiBUYXNrcztcbiAgRWRnZXM6IEVkZ2VzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZpbHRlclJlc3VsdCB7XG4gIGNoYXJ0TGlrZTogQ2hhcnRMaWtlO1xuICBkaXNwbGF5T3JkZXI6IG51bWJlcltdO1xuICBlbXBoYXNpemVkVGFza3M6IG51bWJlcltdO1xuICBzcGFuczogU3BhbltdO1xuICBsYWJlbHM6IHN0cmluZ1tdO1xuICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPjtcbiAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj47XG4gIHNlbGVjdGVkVGFza0luZGV4OiBudW1iZXI7XG59XG5cbi8qKiBVc2VkIGZvciBmaWx0ZXJpbmcgdGFza3MsIHJldHVybnMgVHJ1ZSBpZiB0aGUgdGFzayBpcyB0byBiZSBpbmNsdWRlZCBpbiB0aGVcbiAqIGZpbHRlcmVkIHJlc3VsdHMuICovXG5leHBvcnQgdHlwZSBGaWx0ZXJGdW5jID0gKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IGJvb2xlYW47XG5cbi8qKiBGaWx0ZXJzIHRoZSBjb250ZW50cyBvZiB0aGUgQ2hhcnQgYmFzZWQgb24gdGhlIGZpbHRlckZ1bmMuXG4gKlxuICogc2VsZWN0ZWRUYXNrSW5kZXggd2lsbCBiZSByZXR1cm5lZCBhcyAtMSBpZiB0aGUgc2VsZWN0ZWQgdGFzayBnZXRzIGZpbHRlcmVkXG4gKiBvdXQuXG4gKi9cbmV4cG9ydCBjb25zdCBmaWx0ZXIgPSAoXG4gIGNoYXJ0OiBDaGFydCxcbiAgZmlsdGVyRnVuYzogRmlsdGVyRnVuYyB8IG51bGwsXG4gIGVtcGhhc2l6ZWRUYXNrczogbnVtYmVyW10sXG4gIHNwYW5zOiBTcGFuW10sXG4gIGxhYmVsczogc3RyaW5nW10sXG4gIHNlbGVjdGVkVGFza0luZGV4OiBudW1iZXJcbik6IFJlc3VsdDxGaWx0ZXJSZXN1bHQ+ID0+IHtcbiAgY29uc3QgdnJldCA9IENoYXJ0VmFsaWRhdGUoY2hhcnQpO1xuICBpZiAoIXZyZXQub2spIHtcbiAgICByZXR1cm4gdnJldDtcbiAgfVxuICBjb25zdCB0b3BvbG9naWNhbE9yZGVyID0gdnJldC52YWx1ZTtcbiAgaWYgKGZpbHRlckZ1bmMgPT09IG51bGwpIHtcbiAgICBjb25zdCBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY2hhcnQuVmVydGljZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleC5zZXQoaW5kZXgsIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIGNoYXJ0TGlrZTogY2hhcnQsXG4gICAgICBkaXNwbGF5T3JkZXI6IHZyZXQudmFsdWUsXG4gICAgICBlbXBoYXNpemVkVGFza3M6IGVtcGhhc2l6ZWRUYXNrcyxcbiAgICAgIHNwYW5zOiBzcGFucyxcbiAgICAgIGxhYmVsczogbGFiZWxzLFxuICAgICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LFxuICAgICAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXg6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXgsXG4gICAgfSk7XG4gIH1cbiAgY29uc3QgdGFza3M6IFRhc2tzID0gW107XG4gIGNvbnN0IGVkZ2VzOiBFZGdlcyA9IFtdO1xuICBjb25zdCBkaXNwbGF5T3JkZXI6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGZpbHRlcmVkU3BhbnM6IFNwYW5bXSA9IFtdO1xuICBjb25zdCBmaWx0ZXJlZExhYmVsczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gIGNvbnN0IGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcblxuICAvLyBGaXJzdCBmaWx0ZXIgdGhlIHRhc2tzLlxuICBjaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBvcmlnaW5hbEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBpZiAoZmlsdGVyRnVuYyh0YXNrLCBvcmlnaW5hbEluZGV4KSkge1xuICAgICAgdGFza3MucHVzaCh0YXNrKTtcbiAgICAgIGZpbHRlcmVkU3BhbnMucHVzaChzcGFuc1tvcmlnaW5hbEluZGV4XSk7XG4gICAgICBmaWx0ZXJlZExhYmVscy5wdXNoKGxhYmVsc1tvcmlnaW5hbEluZGV4XSk7XG4gICAgICBjb25zdCBuZXdJbmRleCA9IHRhc2tzLmxlbmd0aCAtIDE7XG4gICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguc2V0KG9yaWdpbmFsSW5kZXgsIG5ld0luZGV4KTtcbiAgICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LnNldChuZXdJbmRleCwgb3JpZ2luYWxJbmRleCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBOb3cgZmlsdGVyIHRoZSBlZGdlcyB3aGlsZSBhbHNvIHJld3JpdGluZyB0aGVtLlxuICBjaGFydC5FZGdlcy5mb3JFYWNoKChkaXJlY3RlZEVkZ2U6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGlmIChcbiAgICAgICFmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguaGFzKGRpcmVjdGVkRWRnZS5pKSB8fFxuICAgICAgIWZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5oYXMoZGlyZWN0ZWRFZGdlLmopXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVkZ2VzLnB1c2goXG4gICAgICBuZXcgRGlyZWN0ZWRFZGdlKFxuICAgICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KGRpcmVjdGVkRWRnZS5pKSxcbiAgICAgICAgZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChkaXJlY3RlZEVkZ2UuailcbiAgICAgIClcbiAgICApO1xuICB9KTtcblxuICAvLyBOb3cgZmlsdGVyIGFuZCByZWluZGV4IHRoZSB0b3BvbG9naWNhbC9kaXNwbGF5IG9yZGVyLlxuICB0b3BvbG9naWNhbE9yZGVyLmZvckVhY2goKG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrOiBUYXNrID0gY2hhcnQuVmVydGljZXNbb3JpZ2luYWxUYXNrSW5kZXhdO1xuICAgIGlmICghZmlsdGVyRnVuYyh0YXNrLCBvcmlnaW5hbFRhc2tJbmRleCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZGlzcGxheU9yZGVyLnB1c2goZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChvcmlnaW5hbFRhc2tJbmRleCkhKTtcbiAgfSk7XG5cbiAgLy8gUmUtaW5kZXggaGlnaGxpZ2h0ZWQgdGFza3MuXG4gIGNvbnN0IHVwZGF0ZWRFbXBoYXNpemVkVGFza3MgPSBlbXBoYXNpemVkVGFza3MubWFwKFxuICAgIChvcmlnaW5hbFRhc2tJbmRleDogbnVtYmVyKTogbnVtYmVyID0+XG4gICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KG9yaWdpbmFsVGFza0luZGV4KSFcbiAgKTtcblxuICByZXR1cm4gb2soe1xuICAgIGNoYXJ0TGlrZToge1xuICAgICAgRWRnZXM6IGVkZ2VzLFxuICAgICAgVmVydGljZXM6IHRhc2tzLFxuICAgIH0sXG4gICAgZGlzcGxheU9yZGVyOiBkaXNwbGF5T3JkZXIsXG4gICAgZW1waGFzaXplZFRhc2tzOiB1cGRhdGVkRW1waGFzaXplZFRhc2tzLFxuICAgIHNwYW5zOiBmaWx0ZXJlZFNwYW5zLFxuICAgIGxhYmVsczogZmlsdGVyZWRMYWJlbHMsXG4gICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LFxuICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4OiBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXgsXG4gICAgc2VsZWN0ZWRUYXNrSW5kZXg6IGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5nZXQoc2VsZWN0ZWRUYXNrSW5kZXgpIHx8IC0xLFxuICB9KTtcbn07XG4iLCAiaW1wb3J0IHsgY2xhbXAgfSBmcm9tIFwiLi4vLi4vbWV0cmljcy9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUmVuZGVyT3B0aW9ucyB9IGZyb20gXCIuLi9yZW5kZXJlci50c1wiO1xuaW1wb3J0IHsgUG9pbnQsIGFkZCwgcHQgfSBmcm9tIFwiLi4vLi4vcG9pbnQvcG9pbnQudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEYXlSb3cge1xuICBkYXk6IG51bWJlcjtcbiAgcm93OiBudW1iZXI7XG59XG5cbi8qKiBGZWF0dXJlcyBvZiB0aGUgY2hhcnQgd2UgY2FuIGFzayBmb3IgY29vcmRpbmF0ZXMgb2YsIHdoZXJlIHRoZSB2YWx1ZSByZXR1cm5lZCBpc1xuICogdGhlIHRvcCBsZWZ0IGNvb3JkaW5hdGUgb2YgdGhlIGZlYXR1cmUuXG4gKi9cbmV4cG9ydCBlbnVtIEZlYXR1cmUge1xuICB0YXNrTGluZVN0YXJ0LFxuICB0ZXh0U3RhcnQsXG4gIGdyb3VwVGV4dFN0YXJ0LFxuICBwZXJjZW50U3RhcnQsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9wLFxuICB2ZXJ0aWNhbEFycm93RGVzdEJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdCxcbiAgdmVydGljYWxBcnJvd1N0YXJ0LFxuICBob3Jpem9udGFsQXJyb3dTdGFydCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lVG9wLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tLFxuICBob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmUsXG4gIGdyb3VwRW52ZWxvcGVTdGFydCxcbiAgdGFza0VudmVsb3BlVG9wLFxuXG4gIGRpc3BsYXlSYW5nZVRvcCxcbiAgdGFza1Jvd0JvdHRvbSxcblxuICB0aW1lTWFya1N0YXJ0LFxuICB0aW1lTWFya0VuZCxcbiAgdGltZVRleHRTdGFydCxcblxuICBncm91cFRpdGxlVGV4dFN0YXJ0LFxuXG4gIHRhc2tzQ2xpcFJlY3RPcmlnaW4sXG4gIGdyb3VwQnlPcmlnaW4sXG59XG5cbi8qKiBTaXplcyBvZiBmZWF0dXJlcyBvZiBhIHJlbmRlcmVkIGNoYXJ0LiAqL1xuZXhwb3J0IGVudW0gTWV0cmljIHtcbiAgdGFza0xpbmVIZWlnaHQsXG4gIHBlcmNlbnRIZWlnaHQsXG4gIGFycm93SGVhZEhlaWdodCxcbiAgYXJyb3dIZWFkV2lkdGgsXG4gIG1pbGVzdG9uZURpYW1ldGVyLFxuICBsaW5lRGFzaExpbmUsXG4gIGxpbmVEYXNoR2FwLFxuICB0ZXh0WE9mZnNldCxcbiAgbWluVGFza1dpZHRoUHgsXG4gIHJvd0hlaWdodCxcbn1cblxuLyoqIE1ha2VzIGEgbnVtYmVyIG9kZCwgYWRkcyBvbmUgaWYgZXZlbi4gKi9cbmNvbnN0IG1ha2VPZGQgPSAobjogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgaWYgKG4gJSAyID09PSAwKSB7XG4gICAgcmV0dXJuIG4gKyAxO1xuICB9XG4gIHJldHVybiBuO1xufTtcblxuLyoqIFNjYWxlIGNvbnNvbGlkYXRlcyBhbGwgY2FsY3VsYXRpb25zIGFyb3VuZCByZW5kZXJpbmcgYSBjaGFydCBvbnRvIGEgc3VyZmFjZS4gKi9cbmV4cG9ydCBjbGFzcyBTY2FsZSB7XG4gIHByaXZhdGUgZGF5V2lkdGhQeDogbnVtYmVyO1xuICBwcml2YXRlIHJvd0hlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgYmxvY2tTaXplUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSB0YXNrSGVpZ2h0UHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBsaW5lV2lkdGhQeDogbnVtYmVyO1xuICBwcml2YXRlIG1hcmdpblNpemVQeDogbnVtYmVyO1xuICBwcml2YXRlIHRpbWVsaW5lSGVpZ2h0UHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBvcmlnaW46IFBvaW50O1xuICBwcml2YXRlIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXI7XG4gIHByaXZhdGUgZ3JvdXBCeUNvbHVtbldpZHRoUHg6IG51bWJlcjtcblxuICBwcml2YXRlIHRpbWVsaW5lT3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSB0YXNrc09yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgZ3JvdXBCeU9yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgdGFza3NDbGlwUmVjdE9yaWdpbjogUG9pbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgICBjYW52YXNXaWR0aFB4OiBudW1iZXIsXG4gICAgdG90YWxOdW1iZXJPZkRheXM6IG51bWJlcixcbiAgICBtYXhHcm91cE5hbWVMZW5ndGg6IG51bWJlciA9IDBcbiAgKSB7XG4gICAgdGhpcy50b3RhbE51bWJlck9mRGF5cyA9IHRvdGFsTnVtYmVyT2ZEYXlzO1xuICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggPSBtYXhHcm91cE5hbWVMZW5ndGggKiBvcHRzLmZvbnRTaXplUHg7XG5cbiAgICB0aGlzLmJsb2NrU2l6ZVB4ID0gTWF0aC5mbG9vcihvcHRzLmZvbnRTaXplUHggLyAzKTtcbiAgICB0aGlzLnRhc2tIZWlnaHRQeCA9IG1ha2VPZGQoTWF0aC5mbG9vcigodGhpcy5ibG9ja1NpemVQeCAqIDMpIC8gNCkpO1xuICAgIHRoaXMubGluZVdpZHRoUHggPSBtYWtlT2RkKE1hdGguZmxvb3IodGhpcy50YXNrSGVpZ2h0UHggLyAzKSk7XG4gICAgY29uc3QgbWlsZXN0b25lUmFkaXVzID0gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4IC8gMikgKyB0aGlzLmxpbmVXaWR0aFB4O1xuICAgIHRoaXMubWFyZ2luU2l6ZVB4ID0gbWlsZXN0b25lUmFkaXVzO1xuICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCA9IG9wdHMuaGFzVGltZWxpbmVcbiAgICAgID8gTWF0aC5jZWlsKChvcHRzLmZvbnRTaXplUHggKiA0KSAvIDMpXG4gICAgICA6IDA7XG5cbiAgICB0aGlzLnRpbWVsaW5lT3JpZ2luID0gcHQobWlsZXN0b25lUmFkaXVzLCAwKTtcbiAgICB0aGlzLmdyb3VwQnlPcmlnaW4gPSBwdCgwLCBtaWxlc3RvbmVSYWRpdXMgKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHgpO1xuXG4gICAgbGV0IGJlZ2luT2Zmc2V0ID0gMDtcbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UgPT09IG51bGwgfHwgb3B0cy5kaXNwbGF5UmFuZ2VVc2FnZSA9PT0gXCJoaWdobGlnaHRcIikge1xuICAgICAgLy8gRG8gbm90IGZvcmNlIGRheVdpZHRoUHggdG8gYW4gaW50ZWdlciwgaXQgY291bGQgZ28gdG8gMCBhbmQgY2F1c2UgYWxsXG4gICAgICAvLyB0YXNrcyB0byBiZSByZW5kZXJlZCBhdCAwIHdpZHRoLlxuICAgICAgdGhpcy5kYXlXaWR0aFB4ID1cbiAgICAgICAgKGNhbnZhc1dpZHRoUHggLSB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gMiAqIHRoaXMubWFyZ2luU2l6ZVB4KSAvXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzO1xuICAgICAgdGhpcy5vcmlnaW4gPSBwdCgwLCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2hvdWxkIHdlIHNldCB4LW1hcmdpbnMgdG8gMCBpZiBhIFN1YlJhbmdlIGlzIHJlcXVlc3RlZD9cbiAgICAgIC8vIE9yIHNob3VsZCB3ZSB0b3RhbGx5IGRyb3AgYWxsIG1hcmdpbnMgZnJvbSBoZXJlIGFuZCBqdXN0IHVzZVxuICAgICAgLy8gQ1NTIG1hcmdpbnMgb24gdGhlIGNhbnZhcyBlbGVtZW50P1xuICAgICAgdGhpcy5kYXlXaWR0aFB4ID1cbiAgICAgICAgKGNhbnZhc1dpZHRoUHggLSB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gMiAqIHRoaXMubWFyZ2luU2l6ZVB4KSAvXG4gICAgICAgIG9wdHMuZGlzcGxheVJhbmdlLnJhbmdlSW5EYXlzO1xuICAgICAgYmVnaW5PZmZzZXQgPSBNYXRoLmZsb29yKFxuICAgICAgICB0aGlzLmRheVdpZHRoUHggKiBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiArIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgICApO1xuICAgICAgdGhpcy5vcmlnaW4gPSBwdCgtYmVnaW5PZmZzZXQgKyB0aGlzLm1hcmdpblNpemVQeCwgMCk7XG4gICAgfVxuXG4gICAgdGhpcy50YXNrc09yaWdpbiA9IHB0KFxuICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIGJlZ2luT2Zmc2V0ICsgbWlsZXN0b25lUmFkaXVzLFxuICAgICAgdGhpcy50aW1lbGluZUhlaWdodFB4ICsgbWlsZXN0b25lUmFkaXVzXG4gICAgKTtcblxuICAgIHRoaXMudGFza3NDbGlwUmVjdE9yaWdpbiA9IHB0KFxuICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCxcbiAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICk7XG5cbiAgICBpZiAob3B0cy5oYXNUZXh0KSB7XG4gICAgICB0aGlzLnJvd0hlaWdodFB4ID0gNiAqIHRoaXMuYmxvY2tTaXplUHg7IC8vIFRoaXMgbWlnaHQgYWxzbyBiZSBgKGNhbnZhc0hlaWdodFB4IC0gMiAqIG9wdHMubWFyZ2luU2l6ZVB4KSAvIG51bWJlclN3aW1MYW5lc2AgaWYgaGVpZ2h0IGlzIHN1cHBsaWVkP1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJvd0hlaWdodFB4ID0gMS4xICogdGhpcy5ibG9ja1NpemVQeDtcbiAgICB9XG4gIH1cblxuICAvKiogVGhlIGhlaWdodCBvZiB0aGUgY2hhcnQuIE5vdGUgdGhhdCBpdCdzIG5vdCBjb25zdHJhaW5lZCBieSB0aGUgY2FudmFzLiAqL1xuICBwdWJsaWMgaGVpZ2h0KG1heFJvd3M6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIChcbiAgICAgIG1heFJvd3MgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4ICsgMiAqIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBkYXlSb3dGcm9tUG9pbnQocG9pbnQ6IFBvaW50KTogRGF5Um93IHtcbiAgICAvLyBUaGlzIHNob3VsZCBhbHNvIGNsYW1wIHRoZSByZXR1cm5lZCAneCcgdmFsdWUgdG8gWzAsIG1heFJvd3MpLlxuICAgIHJldHVybiB7XG4gICAgICBkYXk6IGNsYW1wKFxuICAgICAgICBNYXRoLmZsb29yKFxuICAgICAgICAgICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAqIHBvaW50LnggLVxuICAgICAgICAgICAgdGhpcy5vcmlnaW4ueCAtXG4gICAgICAgICAgICB0aGlzLm1hcmdpblNpemVQeCAtXG4gICAgICAgICAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4KSAvXG4gICAgICAgICAgICB0aGlzLmRheVdpZHRoUHhcbiAgICAgICAgKSxcbiAgICAgICAgMCxcbiAgICAgICAgdGhpcy50b3RhbE51bWJlck9mRGF5c1xuICAgICAgKSxcbiAgICAgIHJvdzogTWF0aC5mbG9vcihcbiAgICAgICAgKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICogcG9pbnQueSAtXG4gICAgICAgICAgdGhpcy5vcmlnaW4ueSAtXG4gICAgICAgICAgdGhpcy5tYXJnaW5TaXplUHggLVxuICAgICAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCkgL1xuICAgICAgICAgIHRoaXMucm93SGVpZ2h0UHhcbiAgICAgICksXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBUaGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3ggZm9yIGEgc2luZ2xlIHRhc2suICovXG4gIHByaXZhdGUgdGFza1Jvd0VudmVsb3BlU3RhcnQocm93OiBudW1iZXIsIGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiBhZGQodGhpcy5vcmlnaW4sIFtcbiAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgIGRheSAqIHRoaXMuZGF5V2lkdGhQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeFxuICAgICAgKSxcbiAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgIHJvdyAqIHRoaXMucm93SGVpZ2h0UHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICAgKSxcbiAgICBdKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgcHJpdmF0ZSBncm91cFJvd0VudmVsb3BlU3RhcnQocm93OiBudW1iZXIsIGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiBhZGQodGhpcy5ncm91cEJ5T3JpZ2luLCBbXG4gICAgICAwLFxuICAgICAgcm93ICogdGhpcy5yb3dIZWlnaHRQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4LFxuICAgIF0pO1xuICB9XG5cbiAgcHJpdmF0ZSBncm91cEhlYWRlclN0YXJ0KCk6IFBvaW50IHtcbiAgICByZXR1cm4gYWRkKHRoaXMub3JpZ2luLCBbdGhpcy5tYXJnaW5TaXplUHgsIHRoaXMubWFyZ2luU2l6ZVB4XSk7XG4gIH1cblxuICBwcml2YXRlIHRpbWVFbnZlbG9wZVN0YXJ0KGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiBhZGQodGhpcy5vcmlnaW4sIFtcbiAgICAgIGRheSAqIHRoaXMuZGF5V2lkdGhQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCxcbiAgICAgIDAsXG4gICAgXSk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgY29vcmRpbmF0ZSBvZiB0aGUgaXRlbSAqL1xuICBmZWF0dXJlKHJvdzogbnVtYmVyLCBkYXk6IG51bWJlciwgY29vcmQ6IEZlYXR1cmUpOiBQb2ludCB7XG4gICAgc3dpdGNoIChjb29yZCkge1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tMaW5lU3RhcnQ6XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3A6XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0OlxuICAgICAgICByZXR1cm4gYWRkKHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLCBbXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4IC0gdGhpcy5ibG9ja1NpemVQeCxcbiAgICAgICAgXSk7XG5cbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdEJvdHRvbTpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KSwgWzAsIHRoaXMucm93SGVpZ2h0UHhdKTtcbiAgICAgIGNhc2UgRmVhdHVyZS50ZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiBhZGQodGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSksIFtcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4LFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHgsXG4gICAgICAgIF0pO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gYWRkKHRoaXMuZ3JvdXBSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KSwgW1xuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHgsXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeCxcbiAgICAgICAgXSk7XG4gICAgICBjYXNlIEZlYXR1cmUucGVyY2VudFN0YXJ0OlxuICAgICAgICByZXR1cm4gYWRkKHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLCBbXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4IC0gdGhpcy5saW5lV2lkdGhQeCxcbiAgICAgICAgXSk7XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdDpcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydDpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KSwgW1xuICAgICAgICAgIDAsXG4gICAgICAgICAgTWF0aC5mbG9vcih0aGlzLnJvd0hlaWdodFB4IC0gMC41ICogdGhpcy5ibG9ja1NpemVQeCkgLSAxLFxuICAgICAgICBdKTtcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lVG9wOlxuICAgICAgICByZXR1cm4gYWRkKHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcCksIFtcbiAgICAgICAgICAwLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgXSk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbTpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3ApLCBbXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICBdKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0VG9NaWxlc3RvbmU6XG4gICAgICAgIHJldHVybiBhZGQodGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3QpLCBbXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgXSk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcDpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0KSwgW1xuICAgICAgICAgIDAsXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICBdKTtcblxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVCb3R0b206XG4gICAgICAgIHJldHVybiBhZGQodGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydCksIFtcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlciksXG4gICAgICAgIF0pO1xuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZTpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQpLCBbXG4gICAgICAgICAgdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgICAwLFxuICAgICAgICBdKTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cEVudmVsb3BlU3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwUm93RW52ZWxvcGVTdGFydChyb3csIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZU1hcmtTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50aW1lTWFya0VuZDpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSksIFtcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMucm93SGVpZ2h0UHggKiAocm93ICsgMSksXG4gICAgICAgIF0pO1xuICAgICAgY2FzZSBGZWF0dXJlLnRpbWVUZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiBhZGQodGhpcy50aW1lRW52ZWxvcGVTdGFydChkYXkpLCBbdGhpcy5ibG9ja1NpemVQeCwgMF0pO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwVGl0bGVUZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiBhZGQodGhpcy5ncm91cEhlYWRlclN0YXJ0KCksIFt0aGlzLmJsb2NrU2l6ZVB4LCAwXSk7XG4gICAgICBjYXNlIEZlYXR1cmUuZGlzcGxheVJhbmdlVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy50aW1lRW52ZWxvcGVTdGFydChkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tSb3dCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdyArIDEsIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza3NDbGlwUmVjdE9yaWdpbjpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza3NDbGlwUmVjdE9yaWdpbjtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cEJ5T3JpZ2luOlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cEJ5T3JpZ2luO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gVGhlIGxpbmUgYmVsb3cgd2lsbCBub3QgY29tcGlsZSBpZiB5b3UgbWlzc2VkIGFuIGVudW0gaW4gdGhlIHN3aXRjaCBhYm92ZS5cbiAgICAgICAgY29vcmQgc2F0aXNmaWVzIG5ldmVyO1xuICAgICAgICByZXR1cm4gcHQoMCwgMCk7XG4gICAgfVxuICB9XG5cbiAgbWV0cmljKGZlYXR1cmU6IE1ldHJpYyk6IG51bWJlciB7XG4gICAgc3dpdGNoIChmZWF0dXJlKSB7XG4gICAgICBjYXNlIE1ldHJpYy50YXNrTGluZUhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza0hlaWdodFB4O1xuICAgICAgY2FzZSBNZXRyaWMucGVyY2VudEhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMubGluZVdpZHRoUHg7XG4gICAgICBjYXNlIE1ldHJpYy5hcnJvd0hlYWRIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tIZWlnaHRQeDtcbiAgICAgIGNhc2UgTWV0cmljLmFycm93SGVhZFdpZHRoOlxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4KTtcbiAgICAgIGNhc2UgTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyOlxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4KTtcbiAgICAgIGNhc2UgTWV0cmljLmxpbmVEYXNoTGluZTpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy5saW5lRGFzaEdhcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy50ZXh0WE9mZnNldDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy5taW5UYXNrV2lkdGhQeDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHggKiAxMDtcbiAgICAgIGNhc2UgTWV0cmljLnJvd0hlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMucm93SGVpZ2h0UHg7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBUaGUgbGluZSBiZWxvdyB3aWxsIG5vdCBjb21waWxlIGlmIHlvdSBtaXNzZWQgYW4gZW51bSBpbiB0aGUgc3dpdGNoIGFib3ZlLlxuICAgICAgICBmZWF0dXJlIHNhdGlzZmllcyBuZXZlcjtcbiAgICAgICAgcmV0dXJuIDAuMDtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuLi9wb2ludC9wb2ludFwiO1xuaW1wb3J0IHsgUmVjdCB9IGZyb20gXCIuLi9yZWN0L3JlY3RcIjtcblxuY29uc3Qgd2l0aGluWSA9ICh5OiBudW1iZXIsIHJlY3Q6IFJlY3QpOiBib29sZWFuID0+IHtcbiAgcmV0dXJuIHJlY3QudG9wTGVmdC55IDw9IHkgJiYgcmVjdC5ib3R0b21SaWdodC55ID49IHk7XG59O1xuXG5jb25zdCB3aXRoaW5YID0gKHg6IG51bWJlciwgcmVjdDogUmVjdCk6IGJvb2xlYW4gPT4ge1xuICByZXR1cm4gcmVjdC50b3BMZWZ0LnggPD0geCAmJiByZWN0LmJvdHRvbVJpZ2h0LnggPj0geDtcbn07XG5cbmV4cG9ydCBjbGFzcyBIaXRSZWN0PFIgZXh0ZW5kcyBSZWN0PiB7XG4gIHJlY3RzOiBSW107XG4gIGNvbnN0cnVjdG9yKHJlY3RzOiBSW10pIHtcbiAgICB0aGlzLnJlY3RzID0gcmVjdHMuc29ydCgoYTogUiwgYjogUik6IG51bWJlciA9PiBhLnRvcExlZnQueSAtIGIudG9wTGVmdC55KTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgUmVjdCB0aGF0IHAgaXMgaW4sIG90aGVyd2lzZSByZXR1cm5zIC0xLiAqL1xuICBoaXQocDogUG9pbnQpOiBSIHwgbnVsbCB7XG4gICAgbGV0IHN0YXJ0ID0gMDtcbiAgICBsZXQgZW5kID0gdGhpcy5yZWN0cy5sZW5ndGggLSAxO1xuXG4gICAgd2hpbGUgKHN0YXJ0IDw9IGVuZCkge1xuICAgICAgLy8gRmluZCB0aGUgbWlkIGluZGV4XG4gICAgICBsZXQgbWlkID0gTWF0aC5mbG9vcigoc3RhcnQgKyBlbmQpIC8gMik7XG5cbiAgICAgIC8vIElmIGVsZW1lbnQgaXMgcHJlc2VudCBhdFxuICAgICAgLy8gbWlkLCByZXR1cm4gVHJ1ZVxuICAgICAgaWYgKHdpdGhpblkocC55LCB0aGlzLnJlY3RzW21pZF0pKSB7XG4gICAgICAgIGlmICh3aXRoaW5YKHAueCwgdGhpcy5yZWN0c1ttaWRdKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnJlY3RzW21pZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICAvLyBFbHNlIGxvb2sgaW4gbGVmdCBvclxuICAgICAgLy8gcmlnaHQgaGFsZiBhY2NvcmRpbmdseVxuICAgICAgZWxzZSBpZiAodGhpcy5yZWN0c1ttaWRdLnRvcExlZnQueSA8IHAueSkge1xuICAgICAgICBzdGFydCA9IG1pZCArIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbmQgPSBtaWQgLSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQ2hhcnRWYWxpZGF0ZSwgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgQ2hhcnRMaWtlLCBmaWx0ZXIsIEZpbHRlckZ1bmMgfSBmcm9tIFwiLi4vY2hhcnQvZmlsdGVyL2ZpbHRlci50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBWZXJ0ZXhJbmRpY2VzIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBSZXNvdXJjZURlZmluaXRpb24gfSBmcm9tIFwiLi4vcmVzb3VyY2VzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBvayB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFNwYW4gfSBmcm9tIFwiLi4vc2xhY2svc2xhY2sudHNcIjtcbmltcG9ydCB7IFRhc2tEdXJhdGlvbiB9IGZyb20gXCIuLi90eXBlcy90eXBlcy50c1wiO1xuaW1wb3J0IHsgUmVjdCB9IGZyb20gXCIuLi9yZWN0L3JlY3QudHNcIjtcbmltcG9ydCB7IEtEVHJlZSB9IGZyb20gXCIuL2tkL2tkLnRzXCI7XG5pbXBvcnQgeyBEaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi9yYW5nZS9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUG9pbnQsIGRpZmZlcmVuY2UsIHB0IH0gZnJvbSBcIi4uL3BvaW50L3BvaW50LnRzXCI7XG5pbXBvcnQgeyBGZWF0dXJlLCBNZXRyaWMsIFNjYWxlIH0gZnJvbSBcIi4vc2NhbGUvc2NhbGUudHNcIjtcbmltcG9ydCB7IEhpdFJlY3QgfSBmcm9tIFwiLi4vaGl0cmVjdC9oaXRyZWN0LnRzXCI7XG5cbnR5cGUgRGlyZWN0aW9uID0gXCJ1cFwiIHwgXCJkb3duXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29sb3JzIHtcbiAgc3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlTXV0ZWQ6IHN0cmluZztcbiAgb25TdXJmYWNlSGlnaGxpZ2h0OiBzdHJpbmc7XG4gIG92ZXJsYXk6IHN0cmluZztcbiAgZ3JvdXBDb2xvcjogc3RyaW5nO1xuICBoaWdobGlnaHQ6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgVGFza0luZGV4VG9Sb3cgPSBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4vKiogRnVuY3Rpb24gdXNlIHRvIHByb2R1Y2UgYSB0ZXh0IGxhYmVsIGZvciBhIHRhc2sgYW5kIGl0cyBzbGFjay4gKi9cbmV4cG9ydCB0eXBlIFRhc2tMYWJlbCA9ICh0YXNrSW5kZXg6IG51bWJlcikgPT4gc3RyaW5nO1xuXG4vKiogQ29udHJvbHMgb2YgdGhlIGRpc3BsYXlSYW5nZSBpbiBSZW5kZXJPcHRpb25zIGlzIHVzZWQuXG4gKlxuICogIFwicmVzdHJpY3RcIjogT25seSBkaXNwbGF5IHRoZSBwYXJ0cyBvZiB0aGUgY2hhcnQgdGhhdCBhcHBlYXIgaW4gdGhlIHJhbmdlLlxuICpcbiAqICBcImhpZ2hsaWdodFwiOiBEaXNwbGF5IHRoZSBmdWxsIHJhbmdlIG9mIHRoZSBkYXRhLCBidXQgaGlnaGxpZ2h0IHRoZSByYW5nZS5cbiAqL1xuZXhwb3J0IHR5cGUgRGlzcGxheVJhbmdlVXNhZ2UgPSBcInJlc3RyaWN0XCIgfCBcImhpZ2hsaWdodFwiO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFRhc2tMYWJlbDogVGFza0xhYmVsID0gKHRhc2tJbmRleDogbnVtYmVyKTogc3RyaW5nID0+XG4gIHRhc2tJbmRleC50b0ZpeGVkKDApO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlck9wdGlvbnMge1xuICAvKiogVGhlIHRleHQgZm9udCBzaXplLCB0aGlzIGRyaXZlcyB0aGUgc2l6ZSBvZiBhbGwgb3RoZXIgY2hhcnQgZmVhdHVyZXMuXG4gICAqICovXG4gIGZvbnRTaXplUHg6IG51bWJlcjtcblxuICAvKiogRGlzcGxheSB0ZXh0IGlmIHRydWUuICovXG4gIGhhc1RleHQ6IGJvb2xlYW47XG5cbiAgLyoqIElmIHN1cHBsaWVkIHRoZW4gb25seSB0aGUgdGFza3MgaW4gdGhlIGdpdmVuIHJhbmdlIHdpbGwgYmUgZGlzcGxheWVkLiAqL1xuICBkaXNwbGF5UmFuZ2U6IERpc3BsYXlSYW5nZSB8IG51bGw7XG5cbiAgLyoqIENvbnRyb2xzIGhvdyB0aGUgYGRpc3BsYXlSYW5nZWAgaXMgdXNlZCBpZiBzdXBwbGllZC4gKi9cbiAgZGlzcGxheVJhbmdlVXNhZ2U6IERpc3BsYXlSYW5nZVVzYWdlO1xuXG4gIC8qKiBUaGUgY29sb3IgdGhlbWUuICovXG4gIGNvbG9yczogQ29sb3JzO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZGlzcGxheSB0aW1lcyBhdCB0aGUgdG9wIG9mIHRoZSBjaGFydC4gKi9cbiAgaGFzVGltZWxpbmU6IGJvb2xlYW47XG5cbiAgLyoqIElmIHRydWUgdGhlbiBkaXNwbGF5IHRoZSB0YXNrIGJhcnMuICovXG4gIGhhc1Rhc2tzOiBib29sZWFuO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZHJhdyB2ZXJ0aWNhbCBsaW5lcyBmcm9tIHRoZSB0aW1lbGluZSBkb3duIHRvIHRhc2sgc3RhcnQgYW5kXG4gICAqIGZpbmlzaCBwb2ludHMuICovXG4gIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IGJvb2xlYW47XG5cbiAgLyoqIERyYXcgZGVwZW5kZW5jeSBlZGdlcyBiZXR3ZWVuIHRhc2tzIGlmIHRydWUuICovXG4gIGhhc0VkZ2VzOiBib29sZWFuO1xuXG4gIC8qKiBGdW5jdGlvbiB0aGF0IHByb2R1Y2VzIGRpc3BsYXkgdGV4dCBmb3IgYSBUYXNrIGFuZCBpdHMgYXNzb2NpYXRlZCBTbGFjay4gKi9cbiAgdGFza0xhYmVsOiBUYXNrTGFiZWw7XG5cbiAgLyoqIFJldHVybnMgdGhlIGR1cmF0aW9uIGZvciBhIGdpdmVuIHRhc2suICovXG4gIHRhc2tEdXJhdGlvbjogVGFza0R1cmF0aW9uO1xuXG4gIC8qKiBUaGUgaW5kaWNlcyBvZiB0YXNrcyB0aGF0IHNob3VsZCBiZSBlbXBoYXNpemVkIHdoZW4gZHJhdywgdHlwaWNhbGx5IHVzZWRcbiAgICogdG8gZGVub3RlIHRoZSBjcml0aWNhbCBwYXRoLiAqL1xuICB0YXNrRW1waGFzaXplOiBudW1iZXJbXTtcblxuICAvKiogRmlsdGVyIHRoZSBUYXNrcyB0byBiZSBkaXNwbGF5ZWQuICovXG4gIGZpbHRlckZ1bmM6IEZpbHRlckZ1bmMgfCBudWxsO1xuXG4gIC8qKiBHcm91cCB0aGUgdGFza3MgdG9nZXRoZXIgdmVydGljYWxseSBiYXNlZCBvbiB0aGUgZ2l2ZW4gcmVzb3VyY2UuIElmIHRoZVxuICAgKiBlbXB0eSBzdHJpbmcgaXMgc3VwcGxpZWQgdGhlbiBqdXN0IGRpc3BsYXkgYnkgdG9wb2xvZ2ljYWwgb3JkZXIuXG4gICAqL1xuICBncm91cEJ5UmVzb3VyY2U6IHN0cmluZztcblxuICAvKiogVGFzayB0byBoaWdobGlnaHQuICovXG4gIGhpZ2hsaWdodGVkVGFzazogbnVsbCB8IG51bWJlcjtcblxuICAvKiogVGhlIGluZGV4IG9mIHRoZSBzZWxlY3RlZCB0YXNrLCBvciAtMSBpZiBubyB0YXNrIGlzIHNlbGVjdGVkLiBUaGlzIGlzXG4gICAqIGFsd2F5cyBhbiBpbmRleCBpbnRvIHRoZSBvcmlnaW5hbCBjaGFydCwgYW5kIG5vdCBhbiBpbmRleCBpbnRvIGEgZmlsdGVyZWRcbiAgICogY2hhcnQuXG4gICAqL1xuICBzZWxlY3RlZFRhc2tJbmRleDogbnVtYmVyO1xuXG4gIC8qKiBDb252ZXJ0cyB0aGUgdGltZXMgaW4gYSBjaGFydCBpbnRvIGEgZGlzcGxheWFibGUgc3RyaW5nLiAqL1xuICBkdXJhdGlvbkRpc3BsYXk6IChkOiBudW1iZXIpID0+IHN0cmluZztcbn1cblxuY29uc3QgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAoXG4gIHRhc2s6IFRhc2ssXG4gIGRpcmVjdGlvbjogRGlyZWN0aW9uXG4pOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIikge1xuICAgICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZUJvdHRvbTtcbiAgICB9XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQ7XG4gIH1cbn07XG5cbmNvbnN0IHZlcnRpY2FsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAoXG4gIHRhc2s6IFRhc2ssXG4gIGRpcmVjdGlvbjogRGlyZWN0aW9uXG4pOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIikge1xuICAgICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcDtcbiAgICB9XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIikge1xuICAgICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3A7XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0Qm90dG9tO1xuICB9XG59O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5jb25zdCBob3Jpem9udGFsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKHRhc2s6IFRhc2spOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQ7XG4gIH1cbn07XG5cbmNvbnN0IGhvcml6b250YWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9ICh0YXNrOiBUYXNrKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3Q7XG4gIH1cbn07XG5cbi8qKlxuICogQ29tcHV0ZSB3aGF0IHRoZSBoZWlnaHQgb2YgdGhlIGNhbnZhcyBzaG91bGQgYmUuIE5vdGUgdGhhdCB0aGUgdmFsdWUgZG9lc24ndFxuICoga25vdyBhYm91dCBgd2luZG93LmRldmljZVBpeGVsUmF0aW9gLCBzbyBpZiB0aGUgY2FudmFzIGlzIGFscmVhZHkgc2NhbGVkIGJ5XG4gKiBgd2luZG93LmRldmljZVBpeGVsUmF0aW9gIHRoZW4gc28gd2lsbCB0aGUgcmVzdWx0IG9mIHRoaXMgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWdnZXN0ZWRDYW52YXNIZWlnaHQoXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gIHNwYW5zOiBTcGFuW10sXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIG1heFJvd3M6IG51bWJlclxuKTogbnVtYmVyIHtcbiAgaWYgKCFvcHRzLmhhc1Rhc2tzKSB7XG4gICAgbWF4Um93cyA9IDA7XG4gIH1cbiAgcmV0dXJuIG5ldyBTY2FsZShcbiAgICBvcHRzLFxuICAgIGNhbnZhcy53aWR0aCxcbiAgICBzcGFuc1tzcGFucy5sZW5ndGggLSAxXS5maW5pc2ggKyAxXG4gICkuaGVpZ2h0KG1heFJvd3MpO1xufVxuXG4vLyBUaGUgbG9jYXRpb24sIGluIGNhbnZhcyBwaXhlbCBjb29yZGluYXRlcywgb2YgZWFjaCB0YXNrIGJhci4gU2hvdWxkIHVzZSB0aGVcbi8vIHRleHQgb2YgdGhlIHRhc2sgbGFiZWwgYXMgdGhlIGxvY2F0aW9uLCBzaW5jZSB0aGF0J3MgYWx3YXlzIGRyYXduIGluIHRoZSB2aWV3XG4vLyBpZiBwb3NzaWJsZS5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza0xvY2F0aW9uIHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG5cbiAgLy8gVGhhdCBpbmRleCBvZiB0aGUgdGFzayBpbiB0aGUgdW5maWx0ZXJlZCBDaGFydC5cbiAgb3JpZ2luYWxUYXNrSW5kZXg6IG51bWJlcjtcbn1cblxudHlwZSBVcGRhdGVUeXBlID0gXCJtb3VzZW1vdmVcIiB8IFwibW91c2Vkb3duXCI7XG5cbi8vIEEgZnVuYyB0aGF0IHRha2VzIGEgUG9pbnQgYW5kIHJlZHJhd3MgdGhlIGhpZ2hsaWdodGVkIHRhc2sgaWYgbmVlZGVkLCByZXR1cm5zXG4vLyB0aGUgaW5kZXggb2YgdGhlIHRhc2sgdGhhdCBpcyBoaWdobGlnaHRlZC5cbmV4cG9ydCB0eXBlIFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyA9IChcbiAgcG9pbnQ6IFBvaW50LFxuICB1cGRhdGVUeXBlOiBVcGRhdGVUeXBlXG4pID0+IG51bWJlciB8IG51bGw7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyUmVzdWx0IHtcbiAgc2NhbGU6IFNjYWxlO1xuICB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M6IFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyB8IG51bGw7XG4gIHNlbGVjdGVkVGFza0xvY2F0aW9uOiBQb2ludCB8IG51bGw7XG59XG5cbi8vIEEgc3BhbiBvbiB0aGUgeC1heGlzLlxudHlwZSB4UmFuZ2UgPSBbbnVtYmVyLCBudW1iZXJdO1xuXG4vLyBUT0RPIC0gUGFzcyBpbiBtYXggcm93cywgYW5kIGEgbWFwcGluZyB0aGF0IG1hcHMgZnJvbSB0YXNrSW5kZXggdG8gcm93LFxuLy8gYmVjYXVzZSB0d28gZGlmZmVyZW50IHRhc2tzIG1pZ2h0IGJlIHBsYWNlZCBvbiB0aGUgc2FtZSByb3cuIEFsc28gd2Ugc2hvdWxkXG4vLyBwYXNzIGluIG1heCByb3dzPyBPciBzaG91bGQgdGhhdCBjb21lIGZyb20gdGhlIGFib3ZlIG1hcHBpbmc/XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyVGFza3NUb0NhbnZhcyhcbiAgcGFyZW50OiBIVE1MRWxlbWVudCxcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHBsYW46IFBsYW4sXG4gIHNwYW5zOiBTcGFuW10sXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIG92ZXJsYXk6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCA9IG51bGxcbik6IFJlc3VsdDxSZW5kZXJSZXN1bHQ+IHtcbiAgY29uc3QgdnJldCA9IENoYXJ0VmFsaWRhdGUocGxhbi5jaGFydCk7XG4gIGlmICghdnJldC5vaykge1xuICAgIHJldHVybiB2cmV0O1xuICB9XG5cbiAgY29uc3Qgb3JpZ2luYWxMYWJlbHMgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLm1hcChcbiAgICAodGFzazogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IG9wdHMudGFza0xhYmVsKHRhc2tJbmRleClcbiAgKTtcblxuICAvLyBBcHBseSB0aGUgZmlsdGVyIGFuZCB3b3JrIHdpdGggdGhlIENoYXJ0TGlrZSByZXR1cm4gZnJvbSB0aGlzIHBvaW50IG9uLlxuICAvLyBGaXRsZXIgYWxzbyBuZWVkcyB0byBiZSBhcHBsaWVkIHRvIHNwYW5zLlxuICBjb25zdCBmcmV0ID0gZmlsdGVyKFxuICAgIHBsYW4uY2hhcnQsXG4gICAgb3B0cy5maWx0ZXJGdW5jLFxuICAgIG9wdHMudGFza0VtcGhhc2l6ZSxcbiAgICBzcGFucyxcbiAgICBvcmlnaW5hbExhYmVscyxcbiAgICBvcHRzLnNlbGVjdGVkVGFza0luZGV4XG4gICk7XG4gIGlmICghZnJldC5vaykge1xuICAgIHJldHVybiBmcmV0O1xuICB9XG4gIGNvbnN0IGNoYXJ0TGlrZSA9IGZyZXQudmFsdWUuY2hhcnRMaWtlO1xuICBjb25zdCBsYWJlbHMgPSBmcmV0LnZhbHVlLmxhYmVscztcbiAgY29uc3QgcmVzb3VyY2VEZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24ob3B0cy5ncm91cEJ5UmVzb3VyY2UpO1xuICBjb25zdCBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleCA9XG4gICAgZnJldC52YWx1ZS5mcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDtcbiAgY29uc3QgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXggPVxuICAgIGZyZXQudmFsdWUuZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXg7XG5cbiAgLy8gU2VsZWN0ZWQgdGFzaywgYXMgYW4gaW5kZXggaW50byB0aGUgdW5maWx0ZXJlZCBDaGFydC5cbiAgbGV0IGxhc3RTZWxlY3RlZFRhc2tJbmRleCA9IG9wdHMuc2VsZWN0ZWRUYXNrSW5kZXg7XG5cbiAgLy8gSGlnaGxpZ2h0ZWQgdGFza3MuXG4gIGNvbnN0IGVtcGhhc2l6ZWRUYXNrczogU2V0PG51bWJlcj4gPSBuZXcgU2V0KGZyZXQudmFsdWUuZW1waGFzaXplZFRhc2tzKTtcbiAgc3BhbnMgPSBmcmV0LnZhbHVlLnNwYW5zO1xuXG4gIC8vIENhbGN1bGF0ZSBob3cgd2lkZSB3ZSBuZWVkIHRvIG1ha2UgdGhlIGdyb3VwQnkgY29sdW1uLlxuICBsZXQgbWF4R3JvdXBOYW1lTGVuZ3RoID0gMDtcbiAgaWYgKG9wdHMuZ3JvdXBCeVJlc291cmNlICE9PSBcIlwiICYmIG9wdHMuaGFzVGV4dCkge1xuICAgIG1heEdyb3VwTmFtZUxlbmd0aCA9IG9wdHMuZ3JvdXBCeVJlc291cmNlLmxlbmd0aDtcbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMuZm9yRWFjaCgodmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgICBtYXhHcm91cE5hbWVMZW5ndGggPSBNYXRoLm1heChtYXhHcm91cE5hbWVMZW5ndGgsIHZhbHVlLmxlbmd0aCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCB0b3RhbE51bWJlck9mUm93cyA9IHNwYW5zLmxlbmd0aDtcbiAgY29uc3QgdG90YWxOdW1iZXJPZkRheXMgPSBzcGFuc1tzcGFucy5sZW5ndGggLSAxXS5maW5pc2g7XG4gIGNvbnN0IHNjYWxlID0gbmV3IFNjYWxlKFxuICAgIG9wdHMsXG4gICAgY2FudmFzLndpZHRoLFxuICAgIHRvdGFsTnVtYmVyT2ZEYXlzICsgMSxcbiAgICBtYXhHcm91cE5hbWVMZW5ndGhcbiAgKTtcblxuICBjb25zdCB0YXNrTGluZUhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMudGFza0xpbmVIZWlnaHQpO1xuICBjb25zdCBkaWFtb25kRGlhbWV0ZXIgPSBzY2FsZS5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKTtcbiAgY29uc3QgcGVyY2VudEhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMucGVyY2VudEhlaWdodCk7XG4gIGNvbnN0IGFycm93SGVhZEhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMuYXJyb3dIZWFkSGVpZ2h0KTtcbiAgY29uc3QgYXJyb3dIZWFkV2lkdGggPSBzY2FsZS5tZXRyaWMoTWV0cmljLmFycm93SGVhZFdpZHRoKTtcbiAgY29uc3QgbWluVGFza1dpZHRoUHggPSBzY2FsZS5tZXRyaWMoTWV0cmljLm1pblRhc2tXaWR0aFB4KTtcblxuICBjb25zdCBkYXlzV2l0aFRpbWVNYXJrZXJzOiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoKTtcbiAgY29uc3QgdGlyZXQgPSB0YXNrSW5kZXhUb1Jvd0Zyb21Hcm91cEJ5KFxuICAgIG9wdHMsXG4gICAgcmVzb3VyY2VEZWZpbml0aW9uLFxuICAgIGNoYXJ0TGlrZSxcbiAgICBmcmV0LnZhbHVlLmRpc3BsYXlPcmRlclxuICApO1xuICBpZiAoIXRpcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHRpcmV0O1xuICB9XG4gIGNvbnN0IHRhc2tJbmRleFRvUm93ID0gdGlyZXQudmFsdWUudGFza0luZGV4VG9Sb3c7XG4gIGNvbnN0IHJvd1JhbmdlcyA9IHRpcmV0LnZhbHVlLnJvd1JhbmdlcztcblxuICAvLyBTZXQgdXAgY2FudmFzIGJhc2ljcy5cbiAgY2xlYXJDYW52YXMoY3R4LCBvcHRzLCBjYW52YXMpO1xuICBzZXRGb250U2l6ZShjdHgsIG9wdHMpO1xuXG4gIGNvbnN0IGNsaXBSZWdpb24gPSBuZXcgUGF0aDJEKCk7XG4gIGNvbnN0IGNsaXBPcmlnaW4gPSBzY2FsZS5mZWF0dXJlKDAsIDAsIEZlYXR1cmUudGFza3NDbGlwUmVjdE9yaWdpbik7XG4gIGNvbnN0IGNsaXBXaWR0aCA9IGNhbnZhcy53aWR0aCAtIGNsaXBPcmlnaW4ueDtcbiAgY2xpcFJlZ2lvbi5yZWN0KGNsaXBPcmlnaW4ueCwgMCwgY2xpcFdpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAvLyBEcmF3IGJpZyByZWQgcmVjdCBvdmVyIHdoZXJlIHRoZSBjbGlwIHJlZ2lvbiB3aWxsIGJlLlxuICBpZiAoMCkge1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2UoY2xpcFJlZ2lvbik7XG4gIH1cblxuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG5cbiAgaWYgKHJvd1JhbmdlcyAhPT0gbnVsbCkge1xuICAgIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgICBkcmF3U3dpbUxhbmVIaWdobGlnaHRzKFxuICAgICAgICBjdHgsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICByb3dSYW5nZXMsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzLFxuICAgICAgICBvcHRzLmNvbG9ycy5ncm91cENvbG9yXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChyZXNvdXJjZURlZmluaXRpb24gIT09IHVuZGVmaW5lZCAmJiBvcHRzLmhhc1RleHQpIHtcbiAgICAgIGRyYXdTd2ltTGFuZUxhYmVscyhjdHgsIG9wdHMsIHJlc291cmNlRGVmaW5pdGlvbiwgc2NhbGUsIHJvd1Jhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuXG4gIGN0eC5zYXZlKCk7XG4gIGN0eC5jbGlwKGNsaXBSZWdpb24pO1xuXG4gIGludGVyZmFjZSBSZWN0V2l0aEZpbHRlcmVkVGFza0luZGV4IGV4dGVuZHMgUmVjdCB7XG4gICAgZmlsdGVyZWRUYXNrSW5kZXg6IG51bWJlcjtcbiAgfVxuICBjb25zdCB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzOiBNYXA8XG4gICAgbnVtYmVyLFxuICAgIFJlY3RXaXRoRmlsdGVyZWRUYXNrSW5kZXhcbiAgPiA9IG5ldyBNYXAoKTtcblxuICAvLyBLZWVwIHRyYWNrIG9mIHdoZXJlIHdlIGRyYXcgdGltZWxpbmUgbGFiZWxzLCB0byBhdm9pZCBvdmVybGFwcy5cbiAgY29uc3QgdGltZU1hcmtlclJhbmdlczogeFJhbmdlW10gPSBbXTtcblxuICAvLyBEcmF3IHRhc2tzIGluIHRoZWlyIHJvd3MuXG4gIGNoYXJ0TGlrZS5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHJvdyA9IHRhc2tJbmRleFRvUm93LmdldCh0YXNrSW5kZXgpITtcbiAgICBjb25zdCBzcGFuID0gc3BhbnNbdGFza0luZGV4XTtcbiAgICBjb25zdCB0YXNrU3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgc3Bhbi5zdGFydCwgRmVhdHVyZS50YXNrTGluZVN0YXJ0KTtcbiAgICBjb25zdCB0YXNrRW5kID0gc2NhbGUuZmVhdHVyZShyb3csIHNwYW4uZmluaXNoLCBGZWF0dXJlLnRhc2tMaW5lU3RhcnQpO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuXG4gICAgLy8gRHJhdyBpbiB0aW1lIG1hcmtlcnMgaWYgZGlzcGxheWVkLlxuICAgIC8vIFRPRE8gLSBNYWtlIHN1cmUgdGhleSBkb24ndCBvdmVybGFwLlxuICAgIGlmIChvcHRzLmRyYXdUaW1lTWFya2Vyc09uVGFza3MpIHtcbiAgICAgIGRyYXdUaW1lTWFya2VyQXREYXlUb1Rhc2soXG4gICAgICAgIGN0eCxcbiAgICAgICAgcm93LFxuICAgICAgICBzcGFuLnN0YXJ0LFxuICAgICAgICB0YXNrLFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgZGF5c1dpdGhUaW1lTWFya2VycyxcbiAgICAgICAgdGltZU1hcmtlclJhbmdlc1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoZW1waGFzaXplZFRhc2tzLmhhcyh0YXNrSW5kZXgpKSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICAgIH1cbiAgICBjb25zdCBoaWdobGlnaHRUb3BMZWZ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvdyxcbiAgICAgIHNwYW4uc3RhcnQsXG4gICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICk7XG4gICAgbGV0IGhpZ2hsaWdodEJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvdyArIDEsXG4gICAgICBzcGFuLmZpbmlzaCxcbiAgICAgIEZlYXR1cmUudGFza0VudmVsb3BlVG9wXG4gICAgKTtcblxuICAgIC8vIFBhZCBoaWdobGlnaHRCb3R0b21SaWdodCBpZiB0b28gc21hbGwuXG4gICAgY29uc3QgW3dpZHRoLCBfXSA9IGRpZmZlcmVuY2UoaGlnaGxpZ2h0VG9wTGVmdCwgaGlnaGxpZ2h0Qm90dG9tUmlnaHQpO1xuICAgIGlmICh3aWR0aCA8IG1pblRhc2tXaWR0aFB4KSB7XG4gICAgICBoaWdobGlnaHRCb3R0b21SaWdodC54ID0gaGlnaGxpZ2h0VG9wTGVmdC54ICsgbWluVGFza1dpZHRoUHg7XG4gICAgfVxuXG4gICAgdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5zZXQodGFza0luZGV4LCB7XG4gICAgICB0b3BMZWZ0OiBoaWdobGlnaHRUb3BMZWZ0LFxuICAgICAgYm90dG9tUmlnaHQ6IGhpZ2hsaWdodEJvdHRvbVJpZ2h0LFxuICAgICAgZmlsdGVyZWRUYXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICB9KTtcbiAgICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgICAgaWYgKHRhc2tTdGFydC54ID09PSB0YXNrRW5kLngpIHtcbiAgICAgICAgZHJhd01pbGVzdG9uZShjdHgsIHRhc2tTdGFydCwgZGlhbW9uZERpYW1ldGVyLCBwZXJjZW50SGVpZ2h0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyYXdUYXNrQmFyKGN0eCwgdGFza1N0YXJ0LCB0YXNrRW5kLCB0YXNrTGluZUhlaWdodCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNraXAgZHJhd2luZyB0aGUgdGV4dCBvZiB0aGUgU3RhcnQgYW5kIEZpbmlzaCB0YXNrcy5cbiAgICAgIGlmICh0YXNrSW5kZXggIT09IDAgJiYgdGFza0luZGV4ICE9PSB0b3RhbE51bWJlck9mUm93cyAtIDEpIHtcbiAgICAgICAgZHJhd1Rhc2tUZXh0KFxuICAgICAgICAgIGN0eCxcbiAgICAgICAgICBvcHRzLFxuICAgICAgICAgIHNjYWxlLFxuICAgICAgICAgIHJvdyxcbiAgICAgICAgICBzcGFuLFxuICAgICAgICAgIHRhc2ssXG4gICAgICAgICAgdGFza0luZGV4LFxuICAgICAgICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LmdldCh0YXNrSW5kZXgpISxcbiAgICAgICAgICBjbGlwV2lkdGgsXG4gICAgICAgICAgbGFiZWxzXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBjdHgubGluZVdpZHRoID0gMTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG5cbiAgLy8gTm93IGRyYXcgYWxsIHRoZSBhcnJvd3MsIGkuZS4gZWRnZXMuXG4gIGlmIChvcHRzLmhhc0VkZ2VzICYmIG9wdHMuaGFzVGFza3MpIHtcbiAgICBjb25zdCBoaWdobGlnaHRlZEVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIGNvbnN0IG5vcm1hbEVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIGNoYXJ0TGlrZS5FZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChlbXBoYXNpemVkVGFza3MuaGFzKGUuaSkgJiYgZW1waGFzaXplZFRhc2tzLmhhcyhlLmopKSB7XG4gICAgICAgIGhpZ2hsaWdodGVkRWRnZXMucHVzaChlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vcm1hbEVkZ2VzLnB1c2goZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcbiAgICBkcmF3RWRnZXMoXG4gICAgICBjdHgsXG4gICAgICBvcHRzLFxuICAgICAgbm9ybWFsRWRnZXMsXG4gICAgICBzcGFucyxcbiAgICAgIGNoYXJ0TGlrZS5WZXJ0aWNlcyxcbiAgICAgIHNjYWxlLFxuICAgICAgdGFza0luZGV4VG9Sb3csXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodCxcbiAgICAgIGVtcGhhc2l6ZWRUYXNrc1xuICAgICk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgIGRyYXdFZGdlcyhcbiAgICAgIGN0eCxcbiAgICAgIG9wdHMsXG4gICAgICBoaWdobGlnaHRlZEVkZ2VzLFxuICAgICAgc3BhbnMsXG4gICAgICBjaGFydExpa2UuVmVydGljZXMsXG4gICAgICBzY2FsZSxcbiAgICAgIHRhc2tJbmRleFRvUm93LFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHQsXG4gICAgICBlbXBoYXNpemVkVGFza3NcbiAgICApO1xuICB9XG5cbiAgLy8gUmVtb3ZlIHRoZSBjbGlwIHJlZ2lvbi5cbiAgY3R4LnJlc3RvcmUoKTtcblxuICAvLyBOb3cgZHJhdyB0aGUgcmFuZ2UgaGlnaGxpZ2h0cyBpZiByZXF1aXJlZC5cbiAgaWYgKG9wdHMuZGlzcGxheVJhbmdlICE9PSBudWxsICYmIG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwiaGlnaGxpZ2h0XCIpIHtcbiAgICAvLyBEcmF3IGEgcmVjdCBvdmVyIGVhY2ggc2lkZSB0aGF0IGlzbid0IGluIHRoZSByYW5nZS5cbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gPiAwKSB7XG4gICAgICBkcmF3UmFuZ2VPdmVybGF5KFxuICAgICAgICBjdHgsXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICAwLFxuICAgICAgICBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbixcbiAgICAgICAgdG90YWxOdW1iZXJPZlJvd3NcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5lbmQgPCB0b3RhbE51bWJlck9mRGF5cykge1xuICAgICAgZHJhd1JhbmdlT3ZlcmxheShcbiAgICAgICAgY3R4LFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgb3B0cy5kaXNwbGF5UmFuZ2UuZW5kLFxuICAgICAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZSb3dzXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGxldCB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M6IFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyB8IG51bGwgPSBudWxsO1xuICBsZXQgc2VsZWN0ZWRUYXNrTG9jYXRpb246IFBvaW50IHwgbnVsbCA9IG51bGw7XG5cbiAgaWYgKG92ZXJsYXkgIT09IG51bGwpIHtcbiAgICBjb25zdCBvdmVybGF5Q3R4ID0gb3ZlcmxheS5nZXRDb250ZXh0KFwiMmRcIikhO1xuXG4gICAgY29uc3QgdGFza0xvY2F0aW9uS0RUcmVlID0gbmV3IEhpdFJlY3Q8UmVjdFdpdGhGaWx0ZXJlZFRhc2tJbmRleD4oW1xuICAgICAgLi4udGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy52YWx1ZXMoKSxcbiAgICBdKTtcblxuICAgIC8vIEFsd2F5cyByZWNvcmVkIGluIHRoZSBvcmlnaW5hbCB1bmZpbHRlcmVkIHRhc2sgaW5kZXguXG4gICAgbGV0IGxhc3RIaWdobGlnaHRlZFRhc2tJbmRleCA9IC0xO1xuXG4gICAgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zID0gKFxuICAgICAgcG9pbnQ6IFBvaW50LFxuICAgICAgdXBkYXRlVHlwZTogVXBkYXRlVHlwZVxuICAgICk6IG51bWJlciB8IG51bGwgPT4ge1xuICAgICAgLy8gRmlyc3QgY29udmVydCBwb2ludCBpbiBvZmZzZXQgY29vcmRzIGludG8gY2FudmFzIGNvb3Jkcy5cbiAgICAgIHBvaW50LnggPSBwb2ludC54ICogd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgICBwb2ludC55ID0gcG9pbnQueSAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgY29uc3QgdGFza0xvY2F0aW9uID0gdGFza0xvY2F0aW9uS0RUcmVlLmhpdChwb2ludCk7XG4gICAgICBjb25zdCBvcmlnaW5hbFRhc2tJbmRleCA9XG4gICAgICAgIHRhc2tMb2NhdGlvbiA9PT0gbnVsbFxuICAgICAgICAgID8gLTFcbiAgICAgICAgICA6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LmdldChcbiAgICAgICAgICAgICAgdGFza0xvY2F0aW9uIS5maWx0ZXJlZFRhc2tJbmRleFxuICAgICAgICAgICAgKSE7XG5cbiAgICAgIC8vIERvIG5vdCBhbGxvdyBoaWdobGlnaHRpbmcgb3IgY2xpY2tpbmcgdGhlIFN0YXJ0IGFuZCBGaW5pc2ggdGFza3MuXG4gICAgICBpZiAoXG4gICAgICAgIG9yaWdpbmFsVGFza0luZGV4ID09PSAwIHx8XG4gICAgICAgIG9yaWdpbmFsVGFza0luZGV4ID09PSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDFcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICh1cGRhdGVUeXBlID09PSBcIm1vdXNlbW92ZVwiKSB7XG4gICAgICAgIGlmIChvcmlnaW5hbFRhc2tJbmRleCA9PT0gbGFzdEhpZ2hsaWdodGVkVGFza0luZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsVGFza0luZGV4O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAob3JpZ2luYWxUYXNrSW5kZXggPT09IGxhc3RTZWxlY3RlZFRhc2tJbmRleCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodXBkYXRlVHlwZSA9PT0gXCJtb3VzZW1vdmVcIikge1xuICAgICAgICBsYXN0SGlnaGxpZ2h0ZWRUYXNrSW5kZXggPSBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhc3RTZWxlY3RlZFRhc2tJbmRleCA9IG9yaWdpbmFsVGFza0luZGV4O1xuICAgICAgfVxuXG4gICAgICBvdmVybGF5Q3R4LmNsZWFyUmVjdCgwLCAwLCBvdmVybGF5LndpZHRoLCBvdmVybGF5LmhlaWdodCk7XG5cbiAgICAgIC8vIERyYXcgYm90aCBoaWdobGlnaHQgYW5kIHNlbGVjdGlvbi5cblxuICAgICAgLy8gRHJhdyBoaWdobGlnaHQuXG4gICAgICBsZXQgY29ybmVycyA9IHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMuZ2V0KFxuICAgICAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5nZXQobGFzdEhpZ2hsaWdodGVkVGFza0luZGV4KSFcbiAgICAgICk7XG4gICAgICBpZiAoY29ybmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRyYXdUYXNrSGlnaGxpZ2h0KFxuICAgICAgICAgIG92ZXJsYXlDdHgsXG4gICAgICAgICAgY29ybmVycy50b3BMZWZ0LFxuICAgICAgICAgIGNvcm5lcnMuYm90dG9tUmlnaHQsXG4gICAgICAgICAgb3B0cy5jb2xvcnMuaGlnaGxpZ2h0LFxuICAgICAgICAgIHNjYWxlLm1ldHJpYyh0YXNrTGluZUhlaWdodClcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gRHJhdyBzZWxlY3Rpb24uXG4gICAgICBjb3JuZXJzID0gdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5nZXQoXG4gICAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4LmdldChsYXN0U2VsZWN0ZWRUYXNrSW5kZXgpIVxuICAgICAgKTtcbiAgICAgIGlmIChjb3JuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZHJhd1NlbGVjdGlvbkhpZ2hsaWdodChcbiAgICAgICAgICBvdmVybGF5Q3R4LFxuICAgICAgICAgIGNvcm5lcnMudG9wTGVmdCxcbiAgICAgICAgICBjb3JuZXJzLmJvdHRvbVJpZ2h0LFxuICAgICAgICAgIG9wdHMuY29sb3JzLmhpZ2hsaWdodFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgfTtcblxuICAgIC8vIERyYXcgc2VsZWN0aW9uLlxuICAgIGNvbnN0IGNvcm5lcnMgPSB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmdldChcbiAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4LmdldChsYXN0U2VsZWN0ZWRUYXNrSW5kZXgpIVxuICAgICk7XG4gICAgaWYgKGNvcm5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZHJhd1NlbGVjdGlvbkhpZ2hsaWdodChcbiAgICAgICAgb3ZlcmxheUN0eCxcbiAgICAgICAgY29ybmVycy50b3BMZWZ0LFxuICAgICAgICBjb3JuZXJzLmJvdHRvbVJpZ2h0LFxuICAgICAgICBvcHRzLmNvbG9ycy5oaWdobGlnaHRcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgaGlnaGVzdCB0YXNrIG9mIGFsbCB0aGUgdGFza3MgZGlzcGxheWVkLlxuICB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmZvckVhY2goKHJjOiBSZWN0KSA9PiB7XG4gICAgaWYgKHNlbGVjdGVkVGFza0xvY2F0aW9uID09PSBudWxsKSB7XG4gICAgICBzZWxlY3RlZFRhc2tMb2NhdGlvbiA9IHJjLnRvcExlZnQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChyYy50b3BMZWZ0LnkgPCBzZWxlY3RlZFRhc2tMb2NhdGlvbi55KSB7XG4gICAgICBzZWxlY3RlZFRhc2tMb2NhdGlvbiA9IHJjLnRvcExlZnQ7XG4gICAgfVxuICB9KTtcblxuICBpZiAoXG4gICAgb3B0cy5zZWxlY3RlZFRhc2tJbmRleCAhPT0gLTEgJiZcbiAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5oYXMob3B0cy5zZWxlY3RlZFRhc2tJbmRleClcbiAgKSB7XG4gICAgc2VsZWN0ZWRUYXNrTG9jYXRpb24gPSB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmdldChcbiAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4LmdldChvcHRzLnNlbGVjdGVkVGFza0luZGV4KSEgLy8gQ29udmVydFxuICAgICkhLnRvcExlZnQ7XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIHNlbGVjdGVkIHRhc2sgbG9jYXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzLCBub3QgaW4gY2FudmFzXG4gIC8vIHVuaXRzLlxuICBsZXQgcmV0dXJuZWRMb2NhdGlvbjogUG9pbnQgfCBudWxsID0gbnVsbDtcbiAgaWYgKHNlbGVjdGVkVGFza0xvY2F0aW9uICE9PSBudWxsKSB7XG4gICAgcmV0dXJuZWRMb2NhdGlvbiA9IHB0KFxuICAgICAgc2VsZWN0ZWRUYXNrTG9jYXRpb24ueCAvIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLFxuICAgICAgc2VsZWN0ZWRUYXNrTG9jYXRpb24ueSAvIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBvayh7XG4gICAgc2NhbGU6IHNjYWxlLFxuICAgIHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvczogdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zLFxuICAgIHNlbGVjdGVkVGFza0xvY2F0aW9uOiByZXR1cm5lZExvY2F0aW9uLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gZHJhd0VkZ2VzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdLFxuICBzcGFuczogU3BhbltdLFxuICB0YXNrczogVGFza1tdLFxuICBzY2FsZTogU2NhbGUsXG4gIHRhc2tJbmRleFRvUm93OiBUYXNrSW5kZXhUb1JvdyxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXIsXG4gIHRhc2tIaWdobGlnaHRzOiBTZXQ8bnVtYmVyPlxuKSB7XG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IHNyY1NsYWNrOiBTcGFuID0gc3BhbnNbZS5pXTtcbiAgICBjb25zdCBkc3RTbGFjazogU3BhbiA9IHNwYW5zW2Uual07XG4gICAgY29uc3Qgc3JjVGFzazogVGFzayA9IHRhc2tzW2UuaV07XG4gICAgY29uc3QgZHN0VGFzazogVGFzayA9IHRhc2tzW2Uual07XG4gICAgY29uc3Qgc3JjUm93ID0gdGFza0luZGV4VG9Sb3cuZ2V0KGUuaSkhO1xuICAgIGNvbnN0IGRzdFJvdyA9IHRhc2tJbmRleFRvUm93LmdldChlLmopITtcbiAgICBjb25zdCBzcmNEYXkgPSBzcmNTbGFjay5maW5pc2g7XG4gICAgY29uc3QgZHN0RGF5ID0gZHN0U2xhY2suc3RhcnQ7XG5cbiAgICBpZiAodGFza0hpZ2hsaWdodHMuaGFzKGUuaSkgJiYgdGFza0hpZ2hsaWdodHMuaGFzKGUuaikpIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG4gICAgfVxuXG4gICAgZHJhd0Fycm93QmV0d2VlblRhc2tzKFxuICAgICAgY3R4LFxuICAgICAgc3JjRGF5LFxuICAgICAgZHN0RGF5LFxuICAgICAgc2NhbGUsXG4gICAgICBzcmNSb3csXG4gICAgICBzcmNUYXNrLFxuICAgICAgZHN0Um93LFxuICAgICAgZHN0VGFzayxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0XG4gICAgKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdSYW5nZU92ZXJsYXkoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBzY2FsZTogU2NhbGUsXG4gIGJlZ2luRGF5OiBudW1iZXIsXG4gIGVuZERheTogbnVtYmVyLFxuICB0b3RhbE51bWJlck9mUm93czogbnVtYmVyXG4pIHtcbiAgY29uc3QgdG9wTGVmdCA9IHNjYWxlLmZlYXR1cmUoMCwgYmVnaW5EYXksIEZlYXR1cmUuZGlzcGxheVJhbmdlVG9wKTtcbiAgY29uc3QgYm90dG9tUmlnaHQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHRvdGFsTnVtYmVyT2ZSb3dzLFxuICAgIGVuZERheSxcbiAgICBGZWF0dXJlLnRhc2tSb3dCb3R0b21cbiAgKTtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm92ZXJsYXk7XG4gIGN0eC5maWxsUmVjdChcbiAgICB0b3BMZWZ0LngsXG4gICAgdG9wTGVmdC55LFxuICAgIGJvdHRvbVJpZ2h0LnggLSB0b3BMZWZ0LngsXG4gICAgYm90dG9tUmlnaHQueSAtIHRvcExlZnQueVxuICApO1xuICBjb25zb2xlLmxvZyhcImRyYXdSYW5nZU92ZXJsYXlcIiwgdG9wTGVmdCwgYm90dG9tUmlnaHQpO1xufVxuXG5mdW5jdGlvbiBkcmF3QXJyb3dCZXR3ZWVuVGFza3MoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzcmNEYXk6IG51bWJlcixcbiAgZHN0RGF5OiBudW1iZXIsXG4gIHNjYWxlOiBTY2FsZSxcbiAgc3JjUm93OiBudW1iZXIsXG4gIHNyY1Rhc2s6IFRhc2ssXG4gIGRzdFJvdzogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGlmIChzcmNEYXkgPT09IGRzdERheSkge1xuICAgIGRyYXdWZXJ0aWNhbEFycm93VG9UYXNrKFxuICAgICAgY3R4LFxuICAgICAgc2NhbGUsXG4gICAgICBzcmNSb3csXG4gICAgICBzcmNEYXksXG4gICAgICBzcmNUYXNrLFxuICAgICAgZHN0Um93LFxuICAgICAgZHN0RGF5LFxuICAgICAgZHN0VGFzayxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0XG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBkcmF3TFNoYXBlZEFycm93VG9UYXNrKFxuICAgICAgY3R4LFxuICAgICAgc2NhbGUsXG4gICAgICBzcmNSb3csXG4gICAgICBzcmNEYXksXG4gICAgICBzcmNUYXNrLFxuICAgICAgZHN0Um93LFxuICAgICAgZHN0VGFzayxcbiAgICAgIGRzdERheSxcbiAgICAgIGFycm93SGVhZEhlaWdodCxcbiAgICAgIGFycm93SGVhZFdpZHRoXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjbGVhckNhbnZhcyhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnRcbikge1xuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMuc3VyZmFjZTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbn1cblxuZnVuY3Rpb24gc2V0Rm9udFNpemUoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIG9wdHM6IFJlbmRlck9wdGlvbnMpIHtcbiAgY3R4LmZvbnQgPSBgJHtvcHRzLmZvbnRTaXplUHh9cHggc2VyaWZgO1xufVxuXG4vLyBEcmF3IEwgc2hhcGVkIGFycm93LCBmaXJzdCBnb2luZyBiZXR3ZWVuIHJvd3MsIHRoZW4gZ29pbmcgYmV0d2VlbiBkYXlzLlxuZnVuY3Rpb24gZHJhd0xTaGFwZWRBcnJvd1RvVGFzayhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNjYWxlOiBTY2FsZSxcbiAgc3JjUm93OiBudW1iZXIsXG4gIHNyY0RheTogbnVtYmVyLFxuICBzcmNUYXNrOiBUYXNrLFxuICBkc3RSb3c6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgZHN0RGF5OiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyLFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyXG4pIHtcbiAgLy8gRHJhdyB2ZXJ0aWNhbCBwYXJ0IG9mIHRoZSBcIkxcIi5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjb25zdCBkaXJlY3Rpb246IERpcmVjdGlvbiA9IHNyY1JvdyA8IGRzdFJvdyA/IFwiZG93blwiIDogXCJ1cFwiO1xuICBjb25zdCB2ZXJ0TGluZVN0YXJ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICBzcmNSb3csXG4gICAgc3JjRGF5LFxuICAgIHZlcnRpY2FsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKHNyY1Rhc2ssIGRpcmVjdGlvbilcbiAgKTtcbiAgY29uc3QgdmVydExpbmVFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIGRzdFJvdyxcbiAgICBzcmNEYXksXG4gICAgaG9yaXpvbnRhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKGRzdFRhc2spXG4gICk7XG4gIGN0eC5tb3ZlVG8odmVydExpbmVTdGFydC54ICsgMC41LCB2ZXJ0TGluZVN0YXJ0LnkpO1xuICBjdHgubGluZVRvKHZlcnRMaW5lU3RhcnQueCArIDAuNSwgdmVydExpbmVFbmQueSk7XG5cbiAgLy8gRHJhdyBob3Jpem9udGFsIHBhcnQgb2YgdGhlIFwiTFwiLlxuICBjb25zdCBob3J6TGluZVN0YXJ0ID0gdmVydExpbmVFbmQ7XG4gIGNvbnN0IGhvcnpMaW5lRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICBkc3RSb3csXG4gICAgZHN0RGF5LFxuICAgIGhvcml6b250YWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihkc3RUYXNrKVxuICApO1xuICBjdHgubW92ZVRvKHZlcnRMaW5lU3RhcnQueCArIDAuNSwgaG9yekxpbmVTdGFydC55KTtcbiAgY3R4LmxpbmVUbyhob3J6TGluZUVuZC54ICsgMC41LCBob3J6TGluZUVuZC55KTtcblxuICAvLyBEcmF3IHRoZSBhcnJvd2hlYWQuIFRoaXMgYXJyb3cgaGVhZCB3aWxsIGFsd2F5cyBwb2ludCB0byB0aGUgcmlnaHRcbiAgLy8gc2luY2UgdGhhdCdzIGhvdyB0aW1lIGZsb3dzLlxuICBjdHgubW92ZVRvKGhvcnpMaW5lRW5kLnggKyAwLjUsIGhvcnpMaW5lRW5kLnkpO1xuICBjdHgubGluZVRvKFxuICAgIGhvcnpMaW5lRW5kLnggLSBhcnJvd0hlYWRIZWlnaHQgKyAwLjUsXG4gICAgaG9yekxpbmVFbmQueSArIGFycm93SGVhZFdpZHRoXG4gICk7XG4gIGN0eC5tb3ZlVG8oaG9yekxpbmVFbmQueCArIDAuNSwgaG9yekxpbmVFbmQueSk7XG4gIGN0eC5saW5lVG8oXG4gICAgaG9yekxpbmVFbmQueCAtIGFycm93SGVhZEhlaWdodCArIDAuNSxcbiAgICBob3J6TGluZUVuZC55IC0gYXJyb3dIZWFkV2lkdGhcbiAgKTtcbiAgY3R4LnN0cm9rZSgpO1xufVxuXG5mdW5jdGlvbiBkcmF3VmVydGljYWxBcnJvd1RvVGFzayhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNjYWxlOiBTY2FsZSxcbiAgc3JjUm93OiBudW1iZXIsXG4gIHNyY0RheTogbnVtYmVyLFxuICBzcmNUYXNrOiBUYXNrLFxuICBkc3RSb3c6IG51bWJlcixcbiAgZHN0RGF5OiBudW1iZXIsXG4gIGRzdFRhc2s6IFRhc2ssXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyXG4pIHtcbiAgY29uc3QgZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSBzcmNSb3cgPCBkc3RSb3cgPyBcImRvd25cIiA6IFwidXBcIjtcbiAgY29uc3QgYXJyb3dTdGFydCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgc3JjUm93LFxuICAgIHNyY0RheSxcbiAgICB2ZXJ0aWNhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihzcmNUYXNrLCBkaXJlY3Rpb24pXG4gICk7XG4gIGNvbnN0IGFycm93RW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICBkc3RSb3csXG4gICAgZHN0RGF5LFxuICAgIHZlcnRpY2FsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oZHN0VGFzaywgZGlyZWN0aW9uKVxuICApO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4Lm1vdmVUbyhhcnJvd1N0YXJ0LnggKyAwLjUsIGFycm93U3RhcnQueSk7XG4gIGN0eC5saW5lVG8oYXJyb3dFbmQueCArIDAuNSwgYXJyb3dFbmQueSk7XG5cbiAgLy8gRHJhdyB0aGUgYXJyb3doZWFkLlxuICBjb25zdCBkZWx0YVkgPSBkaXJlY3Rpb24gPT09IFwiZG93blwiID8gLWFycm93SGVhZEhlaWdodCA6IGFycm93SGVhZEhlaWdodDtcbiAgY3R4Lm1vdmVUbyhhcnJvd0VuZC54ICsgMC41LCBhcnJvd0VuZC55KTtcbiAgY3R4LmxpbmVUbyhhcnJvd0VuZC54IC0gYXJyb3dIZWFkV2lkdGggKyAwLjUsIGFycm93RW5kLnkgKyBkZWx0YVkpO1xuICBjdHgubW92ZVRvKGFycm93RW5kLnggKyAwLjUsIGFycm93RW5kLnkpO1xuICBjdHgubGluZVRvKGFycm93RW5kLnggKyBhcnJvd0hlYWRXaWR0aCArIDAuNSwgYXJyb3dFbmQueSArIGRlbHRhWSk7XG4gIGN0eC5zdHJva2UoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1Rhc2tUZXh0KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgc2NhbGU6IFNjYWxlLFxuICByb3c6IG51bWJlcixcbiAgc3BhbjogU3BhbixcbiAgdGFzazogVGFzayxcbiAgdGFza0luZGV4OiBudW1iZXIsXG4gIG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXIsXG4gIGNsaXBXaWR0aDogbnVtYmVyLFxuICBsYWJlbHM6IHN0cmluZ1tdXG4pIHtcbiAgaWYgKCFvcHRzLmhhc1RleHQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgbGFiZWwgPSBsYWJlbHNbdGFza0luZGV4XTtcblxuICBsZXQgeFN0YXJ0SW5UaW1lID0gc3Bhbi5zdGFydDtcbiAgbGV0IHhQaXhlbERlbHRhID0gMDtcbiAgLy8gRGV0ZXJtaW5lIHdoZXJlIG9uIHRoZSB4LWF4aXMgdG8gc3RhcnQgZHJhd2luZyB0aGUgdGFzayB0ZXh0LlxuICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UgIT09IG51bGwgJiYgb3B0cy5kaXNwbGF5UmFuZ2VVc2FnZSA9PT0gXCJyZXN0cmljdFwiKSB7XG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmluKHNwYW4uc3RhcnQpKSB7XG4gICAgICB4U3RhcnRJblRpbWUgPSBzcGFuLnN0YXJ0O1xuICAgICAgeFBpeGVsRGVsdGEgPSAwO1xuICAgIH0gZWxzZSBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuaW4oc3Bhbi5maW5pc2gpKSB7XG4gICAgICB4U3RhcnRJblRpbWUgPSBzcGFuLmZpbmlzaDtcbiAgICAgIGNvbnN0IG1lYXMgPSBjdHgubWVhc3VyZVRleHQobGFiZWwpO1xuICAgICAgeFBpeGVsRGVsdGEgPSAtbWVhcy53aWR0aCAtIDIgKiBzY2FsZS5tZXRyaWMoTWV0cmljLnRleHRYT2Zmc2V0KTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgc3Bhbi5zdGFydCA8IG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luICYmXG4gICAgICBzcGFuLmZpbmlzaCA+IG9wdHMuZGlzcGxheVJhbmdlLmVuZFxuICAgICkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW47XG4gICAgICB4UGl4ZWxEZWx0YSA9IGNsaXBXaWR0aCAvIDI7XG4gICAgfVxuICB9XG4gIGN0eC5saW5lV2lkdGggPSAxO1xuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcbiAgY29uc3QgdGV4dFN0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIHhTdGFydEluVGltZSwgRmVhdHVyZS50ZXh0U3RhcnQpO1xuICBjb25zdCB0ZXh0WCA9IHRleHRTdGFydC54ICsgeFBpeGVsRGVsdGE7XG4gIGNvbnN0IHRleHRZID0gdGV4dFN0YXJ0Lnk7XG4gIGN0eC5maWxsVGV4dChsYWJlbCwgdGV4dFN0YXJ0LnggKyB4UGl4ZWxEZWx0YSwgdGV4dFN0YXJ0LnkpO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza0JhcihcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHRhc2tTdGFydDogUG9pbnQsXG4gIHRhc2tFbmQ6IFBvaW50LFxuICB0YXNrTGluZUhlaWdodDogbnVtYmVyXG4pIHtcbiAgY3R4LmZpbGxSZWN0KFxuICAgIHRhc2tTdGFydC54LFxuICAgIHRhc2tTdGFydC55LFxuICAgIHRhc2tFbmQueCAtIHRhc2tTdGFydC54LFxuICAgIHRhc2tMaW5lSGVpZ2h0XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUYXNrSGlnaGxpZ2h0KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgaGlnaGxpZ2h0U3RhcnQ6IFBvaW50LFxuICBoaWdobGlnaHRFbmQ6IFBvaW50LFxuICBjb2xvcjogc3RyaW5nLFxuICBib3JkZXJXaWR0aDogbnVtYmVyXG4pIHtcbiAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gIGN0eC5saW5lV2lkdGggPSBib3JkZXJXaWR0aDtcbiAgY3R4LnN0cm9rZVJlY3QoXG4gICAgaGlnaGxpZ2h0U3RhcnQueCxcbiAgICBoaWdobGlnaHRTdGFydC55LFxuICAgIGhpZ2hsaWdodEVuZC54IC0gaGlnaGxpZ2h0U3RhcnQueCxcbiAgICBoaWdobGlnaHRFbmQueSAtIGhpZ2hsaWdodFN0YXJ0LnlcbiAgKTtcbn1cblxuZnVuY3Rpb24gZHJhd1NlbGVjdGlvbkhpZ2hsaWdodChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIGhpZ2hsaWdodFN0YXJ0OiBQb2ludCxcbiAgaGlnaGxpZ2h0RW5kOiBQb2ludCxcbiAgY29sb3I6IHN0cmluZ1xuKSB7XG4gIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgY3R4LmZpbGxSZWN0KFxuICAgIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0U3RhcnQueSxcbiAgICBoaWdobGlnaHRFbmQueCAtIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0RW5kLnkgLSBoaWdobGlnaHRTdGFydC55XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdNaWxlc3RvbmUoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICB0YXNrU3RhcnQ6IFBvaW50LFxuICBkaWFtb25kRGlhbWV0ZXI6IG51bWJlcixcbiAgcGVyY2VudEhlaWdodDogbnVtYmVyXG4pIHtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubGluZVdpZHRoID0gcGVyY2VudEhlaWdodCAvIDI7XG4gIGN0eC5tb3ZlVG8odGFza1N0YXJ0LngsIHRhc2tTdGFydC55IC0gZGlhbW9uZERpYW1ldGVyKTtcbiAgY3R4LmxpbmVUbyh0YXNrU3RhcnQueCArIGRpYW1vbmREaWFtZXRlciwgdGFza1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKHRhc2tTdGFydC54LCB0YXNrU3RhcnQueSArIGRpYW1vbmREaWFtZXRlcik7XG4gIGN0eC5saW5lVG8odGFza1N0YXJ0LnggLSBkaWFtb25kRGlhbWV0ZXIsIHRhc2tTdGFydC55KTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmNvbnN0IGRyYXdUaW1lTWFya2VyQXREYXlUb1Rhc2sgPSAoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICByb3c6IG51bWJlcixcbiAgZGF5OiBudW1iZXIsXG4gIHRhc2s6IFRhc2ssXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgZGF5c1dpdGhUaW1lTWFya2VyczogU2V0PG51bWJlcj4sXG4gIHRpbWVNYXJrZXJSYW5nZXM6IHhSYW5nZVtdXG4pID0+IHtcbiAgaWYgKGRheXNXaXRoVGltZU1hcmtlcnMuaGFzKGRheSkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZGF5c1dpdGhUaW1lTWFya2Vycy5hZGQoZGF5KTtcbiAgY29uc3QgdGltZU1hcmtTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudGltZU1hcmtTdGFydCk7XG5cbiAgLy8gRG9uJ3QgYm90aGVyIGRyYXdpbmcgdGhlIGxpbmUgaWYgaXQncyB1bmRlciBhbiBleGlzdGluZyB0aW1lIGxhYmVsLlxuICBpZiAoXG4gICAgdGltZU1hcmtlclJhbmdlcy5maW5kSW5kZXgoXG4gICAgICAoW2JlZ2luLCBlbmRdKSA9PiB0aW1lTWFya1N0YXJ0LnggPj0gYmVnaW4gJiYgdGltZU1hcmtTdGFydC54IDw9IGVuZFxuICAgICkgIT09IC0xXG4gICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHRpbWVNYXJrRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICByb3csXG4gICAgZGF5LFxuICAgIHZlcnRpY2FsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24odGFzaywgXCJkb3duXCIpXG4gICk7XG4gIGN0eC5saW5lV2lkdGggPSAwLjU7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm92ZXJsYXk7XG5cbiAgY3R4Lm1vdmVUbyh0aW1lTWFya1N0YXJ0LnggKyAwLjUsIHRpbWVNYXJrU3RhcnQueSk7XG4gIGN0eC5saW5lVG8odGltZU1hcmtTdGFydC54ICsgMC41LCB0aW1lTWFya0VuZC55KTtcbiAgY3R4LnN0cm9rZSgpO1xuXG4gIGN0eC5zZXRMaW5lRGFzaChbXSk7XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gIGNvbnN0IHRleHRTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudGltZVRleHRTdGFydCk7XG4gIGNvbnN0IGxhYmVsID0gb3B0cy5kdXJhdGlvbkRpc3BsYXkoZGF5KTtcbiAgY29uc3QgbWVhcyA9IGN0eC5tZWFzdXJlVGV4dChsYWJlbCk7XG4gIGNvbnN0IHRleHRCZWdpbiA9IHRpbWVNYXJrU3RhcnQueDtcbiAgY29uc3QgdGV4dEVuZCA9IHRleHRTdGFydC54ICsgbWVhcy53aWR0aDtcbiAgaWYgKFxuICAgIG9wdHMuaGFzVGV4dCAmJlxuICAgIG9wdHMuaGFzVGltZWxpbmUgJiZcbiAgICAvLyBEb24ndCBkcmF3IHRoZSBsYWJlbCBpZiBpdCBvdmVybGFwcyBhbnkgZXhpc3RpbmcgbGFiZWxzcy5cbiAgICB0aW1lTWFya2VyUmFuZ2VzLmZpbmRJbmRleCgoW2JlZ2luLCBlbmRdKSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAodGV4dEJlZ2luIDw9IGJlZ2luICYmIHRleHRFbmQgPj0gYmVnaW4pIHx8XG4gICAgICAgICh0ZXh0QmVnaW4gPD0gZW5kICYmIHRleHRFbmQgPj0gZW5kKVxuICAgICAgKTtcbiAgICB9KSA9PT0gLTFcbiAgKSB7XG4gICAgY3R4LmZpbGxUZXh0KGAke2xhYmVsfWAsIHRleHRTdGFydC54LCB0ZXh0U3RhcnQueSk7XG4gICAgdGltZU1hcmtlclJhbmdlcy5wdXNoKFt0ZXh0QmVnaW4sIHRleHRFbmRdKTtcbiAgfVxufTtcblxuLyoqIFJlcHJlc2VudHMgYSBoYWxmLW9wZW4gaW50ZXJ2YWwgb2Ygcm93cywgZS5nLiBbc3RhcnQsIGZpbmlzaCkuICovXG5pbnRlcmZhY2UgUm93UmFuZ2Uge1xuICBzdGFydDogbnVtYmVyO1xuICBmaW5pc2g6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIFRhc2tJbmRleFRvUm93UmV0dXJuIHtcbiAgdGFza0luZGV4VG9Sb3c6IFRhc2tJbmRleFRvUm93O1xuXG4gIC8qKiBNYXBzIGVhY2ggcmVzb3VyY2UgdmFsdWUgaW5kZXggdG8gYSByYW5nZSBvZiByb3dzLiAqL1xuICByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPiB8IG51bGw7XG5cbiAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb24gfCBudWxsO1xufVxuXG5jb25zdCB0YXNrSW5kZXhUb1Jvd0Zyb21Hcm91cEJ5ID0gKFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICByZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCxcbiAgY2hhcnRMaWtlOiBDaGFydExpa2UsXG4gIGRpc3BsYXlPcmRlcjogVmVydGV4SW5kaWNlc1xuKTogUmVzdWx0PFRhc2tJbmRleFRvUm93UmV0dXJuPiA9PiB7XG4gIC8vIGRpc3BsYXlPcmRlciBtYXBzIGZyb20gcm93IHRvIHRhc2sgaW5kZXgsIHRoaXMgd2lsbCBwcm9kdWNlIHRoZSBpbnZlcnNlIG1hcHBpbmcuXG4gIGNvbnN0IHRhc2tJbmRleFRvUm93ID0gbmV3IE1hcChcbiAgICAvLyBUaGlzIGxvb2tzIGJhY2t3YXJkcywgYnV0IGl0IGlzbid0LiBSZW1lbWJlciB0aGF0IHRoZSBtYXAgY2FsbGJhY2sgdGFrZXNcbiAgICAvLyAodmFsdWUsIGluZGV4KSBhcyBpdHMgYXJndW1lbnRzLlxuICAgIGRpc3BsYXlPcmRlci5tYXAoKHRhc2tJbmRleDogbnVtYmVyLCByb3c6IG51bWJlcikgPT4gW3Rhc2tJbmRleCwgcm93XSlcbiAgKTtcblxuICBpZiAocmVzb3VyY2VEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gb2soe1xuICAgICAgdGFza0luZGV4VG9Sb3c6IHRhc2tJbmRleFRvUm93LFxuICAgICAgcm93UmFuZ2VzOiBudWxsLFxuICAgICAgcmVzb3VyY2VEZWZpbml0aW9uOiBudWxsLFxuICAgIH0pO1xuICB9XG5cbiAgY29uc3Qgc3RhcnRUYXNrSW5kZXggPSAwO1xuICBjb25zdCBmaW5pc2hUYXNrSW5kZXggPSBjaGFydExpa2UuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgY29uc3QgaWdub3JhYmxlID0gW3N0YXJ0VGFza0luZGV4LCBmaW5pc2hUYXNrSW5kZXhdO1xuXG4gIC8vIEdyb3VwIGFsbCB0YXNrcyBieSB0aGVpciByZXNvdXJjZSB2YWx1ZSwgd2hpbGUgcHJlc2VydmluZyBkaXNwbGF5T3JkZXJcbiAgLy8gb3JkZXIgd2l0aCB0aGUgZ3JvdXBzLlxuICBjb25zdCBncm91cHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyW10+KCk7XG4gIGRpc3BsYXlPcmRlci5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHJlc291cmNlVmFsdWUgPVxuICAgICAgY2hhcnRMaWtlLlZlcnRpY2VzW3Rhc2tJbmRleF0uZ2V0UmVzb3VyY2Uob3B0cy5ncm91cEJ5UmVzb3VyY2UpIHx8IFwiXCI7XG4gICAgY29uc3QgZ3JvdXBNZW1iZXJzID0gZ3JvdXBzLmdldChyZXNvdXJjZVZhbHVlKSB8fCBbXTtcbiAgICBncm91cE1lbWJlcnMucHVzaCh0YXNrSW5kZXgpO1xuICAgIGdyb3Vwcy5zZXQocmVzb3VyY2VWYWx1ZSwgZ3JvdXBNZW1iZXJzKTtcbiAgfSk7XG5cbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcblxuICAvLyBVZ2gsIFN0YXJ0IGFuZCBGaW5pc2ggVGFza3MgbmVlZCB0byBiZSBtYXBwZWQsIGJ1dCBzaG91bGQgbm90IGJlIGRvbmUgdmlhXG4gIC8vIHJlc291cmNlIHZhbHVlLCBzbyBTdGFydCBzaG91bGQgYWx3YXlzIGJlIGZpcnN0LlxuICByZXQuc2V0KDAsIDApO1xuXG4gIC8vIE5vdyBpbmNyZW1lbnQgdXAgdGhlIHJvd3MgYXMgd2UgbW92ZSB0aHJvdWdoIGFsbCB0aGUgZ3JvdXBzLlxuICBsZXQgcm93ID0gMTtcbiAgLy8gQW5kIHRyYWNrIGhvdyBtYW55IHJvd3MgYXJlIGluIGVhY2ggZ3JvdXAuXG4gIGNvbnN0IHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+ID0gbmV3IE1hcCgpO1xuICByZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmZvckVhY2goXG4gICAgKHJlc291cmNlVmFsdWU6IHN0cmluZywgcmVzb3VyY2VJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBzdGFydE9mUm93ID0gcm93O1xuICAgICAgKGdyb3Vwcy5nZXQocmVzb3VyY2VWYWx1ZSkgfHwgW10pLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmFibGUuaW5jbHVkZXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXQuc2V0KHRhc2tJbmRleCwgcm93KTtcbiAgICAgICAgcm93Kys7XG4gICAgICB9KTtcbiAgICAgIHJvd1Jhbmdlcy5zZXQocmVzb3VyY2VJbmRleCwgeyBzdGFydDogc3RhcnRPZlJvdywgZmluaXNoOiByb3cgfSk7XG4gICAgfVxuICApO1xuICByZXQuc2V0KGZpbmlzaFRhc2tJbmRleCwgcm93KTtcblxuICByZXR1cm4gb2soe1xuICAgIHRhc2tJbmRleFRvUm93OiByZXQsXG4gICAgcm93UmFuZ2VzOiByb3dSYW5nZXMsXG4gICAgcmVzb3VyY2VEZWZpbml0aW9uOiByZXNvdXJjZURlZmluaXRpb24sXG4gIH0pO1xufTtcblxuY29uc3QgZHJhd1N3aW1MYW5lSGlnaGxpZ2h0cyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4sXG4gIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXIsXG4gIGdyb3VwQ29sb3I6IHN0cmluZ1xuKSA9PiB7XG4gIGN0eC5maWxsU3R5bGUgPSBncm91cENvbG9yO1xuXG4gIGxldCBncm91cCA9IDA7XG4gIHJvd1Jhbmdlcy5mb3JFYWNoKChyb3dSYW5nZTogUm93UmFuZ2UpID0+IHtcbiAgICBjb25zdCB0b3BMZWZ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvd1JhbmdlLnN0YXJ0LFxuICAgICAgMCxcbiAgICAgIEZlYXR1cmUuZ3JvdXBFbnZlbG9wZVN0YXJ0XG4gICAgKTtcbiAgICBjb25zdCBib3R0b21SaWdodCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3dSYW5nZS5maW5pc2gsXG4gICAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICk7XG4gICAgZ3JvdXArKztcbiAgICAvLyBPbmx5IGhpZ2hsaWdodCBldmVyeSBvdGhlciBncm91cCBiYWNrZ3JvdWQgd2l0aCB0aGUgZ3JvdXBDb2xvci5cbiAgICBpZiAoZ3JvdXAgJSAyID09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY3R4LmZpbGxSZWN0KFxuICAgICAgdG9wTGVmdC54LFxuICAgICAgdG9wTGVmdC55LFxuICAgICAgYm90dG9tUmlnaHQueCAtIHRvcExlZnQueCxcbiAgICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgICApO1xuICB9KTtcbn07XG5cbmNvbnN0IGRyYXdTd2ltTGFuZUxhYmVscyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uLFxuICBzY2FsZTogU2NhbGUsXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+XG4pID0+IHtcbiAgaWYgKHJvd1JhbmdlcykgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGNvbnN0IGdyb3VwQnlPcmlnaW4gPSBzY2FsZS5mZWF0dXJlKDAsIDAsIEZlYXR1cmUuZ3JvdXBCeU9yaWdpbik7XG5cbiAgaWYgKG9wdHMuaGFzVGltZWxpbmUpIHtcbiAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJib3R0b21cIjtcbiAgICBjdHguZmlsbFRleHQob3B0cy5ncm91cEJ5UmVzb3VyY2UsIGdyb3VwQnlPcmlnaW4ueCwgZ3JvdXBCeU9yaWdpbi55KTtcbiAgfVxuXG4gIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gICAgcm93UmFuZ2VzLmZvckVhY2goKHJvd1JhbmdlOiBSb3dSYW5nZSwgcmVzb3VyY2VJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAocm93UmFuZ2Uuc3RhcnQgPT09IHJvd1JhbmdlLmZpbmlzaCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgICByb3dSYW5nZS5zdGFydCxcbiAgICAgICAgMCxcbiAgICAgICAgRmVhdHVyZS5ncm91cFRleHRTdGFydFxuICAgICAgKTtcbiAgICAgIGN0eC5maWxsVGV4dChcbiAgICAgICAgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1tyZXNvdXJjZUluZGV4XSxcbiAgICAgICAgdGV4dFN0YXJ0LngsXG4gICAgICAgIHRleHRTdGFydC55XG4gICAgICApO1xuICAgIH0pO1xuICB9XG59O1xuIiwgIi8vIFdoZW4gYWRkaW5nIHByb3BlcnRpZXMgdG8gQ29sb3JUaGVtZSBhbHNvIG1ha2Ugc3VyZSB0byBhZGQgYSBjb3JyZXNwb25kaW5nXG4vLyBDU1MgQHByb3BlcnR5IGRlY2xhcmF0aW9uLlxuLy9cbi8vIE5vdGUgdGhhdCBlYWNoIHByb3BlcnR5IGFzc3VtZXMgdGhlIHByZXNlbmNlIG9mIGEgQ1NTIHZhcmlhYmxlIG9mIHRoZSBzYW1lIG5hbWVcbi8vIHdpdGggYSBwcmVjZWVkaW5nIGAtLWAuXG5leHBvcnQgaW50ZXJmYWNlIFRoZW1lIHtcbiAgc3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlTXV0ZWQ6IHN0cmluZztcbiAgb25TdXJmYWNlU2Vjb25kYXJ5OiBzdHJpbmc7XG4gIG92ZXJsYXk6IHN0cmluZztcbiAgZ3JvdXBDb2xvcjogc3RyaW5nO1xuICBoaWdobGlnaHQ6IHN0cmluZztcbiAgYWRkZWQ6IHN0cmluZztcbiAgcmVtb3ZlZDogc3RyaW5nO1xufVxuXG50eXBlIFRoZW1lUHJvcCA9IGtleW9mIFRoZW1lO1xuXG5jb25zdCBjb2xvclRoZW1lUHJvdG90eXBlOiBUaGVtZSA9IHtcbiAgc3VyZmFjZTogXCJcIixcbiAgb25TdXJmYWNlOiBcIlwiLFxuICBvblN1cmZhY2VNdXRlZDogXCJcIixcbiAgb25TdXJmYWNlU2Vjb25kYXJ5OiBcIlwiLFxuICBvdmVybGF5OiBcIlwiLFxuICBncm91cENvbG9yOiBcIlwiLFxuICBoaWdobGlnaHQ6IFwiXCIsXG4gIGFkZGVkOiBcIlwiLFxuICByZW1vdmVkOiBcIlwiLFxufTtcblxuZXhwb3J0IGNvbnN0IGNvbG9yVGhlbWVGcm9tRWxlbWVudCA9IChlbGU6IEhUTUxFbGVtZW50KTogVGhlbWUgPT4ge1xuICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlKTtcbiAgY29uc3QgcmV0ID0gT2JqZWN0LmFzc2lnbih7fSwgY29sb3JUaGVtZVByb3RvdHlwZSk7XG4gIE9iamVjdC5rZXlzKHJldCkuZm9yRWFjaCgobmFtZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0W25hbWUgYXMgVGhlbWVQcm9wXSA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoYC0tJHtuYW1lfWApO1xuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHsgTWV0cmljRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3NcIjtcbmltcG9ydCB7IE1ldHJpY1JhbmdlIH0gZnJvbSBcIi4uL21ldHJpY3MvcmFuZ2VcIjtcbmltcG9ydCB7XG4gIER1cFRhc2tPcCxcbiAgSW5zZXJ0TmV3RW1wdHlNaWxlc3RvbmVBZnRlck9wLFxuICBTZXRUYXNrTmFtZU9wLFxuICBTcGxpdFRhc2tPcCxcbn0gZnJvbSBcIi4uL29wcy9jaGFydFwiO1xuaW1wb3J0IHsgQWRkTWV0cmljT3AsIFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IE9wLCBhcHBseUFsbE9wc1RvUGxhbiB9IGZyb20gXCIuLi9vcHMvb3BzXCI7XG5pbXBvcnQge1xuICBBZGRSZXNvdXJjZU9wLFxuICBBZGRSZXNvdXJjZU9wdGlvbk9wLFxuICBEZWxldGVSZXNvdXJjZU9wdGlvbk9wLFxuICBSZW5hbWVSZXNvdXJjZU9wdGlvbk9wLFxuICBTZXRSZXNvdXJjZVZhbHVlT3AsXG59IGZyb20gXCIuLi9vcHMvcmVzb3VyY2VzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhblwiO1xuXG5jb25zdCBwZW9wbGU6IHN0cmluZ1tdID0gW1wiRnJlZFwiLCBcIkJhcm5leVwiLCBcIldpbG1hXCIsIFwiQmV0dHlcIl07XG5cbmNvbnN0IERVUkFUSU9OID0gMTA7XG5cbmNvbnN0IHJuZEludCA9IChuOiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbik7XG59O1xuXG5jb25zdCBybmREdXJhdGlvbiA9ICgpOiBudW1iZXIgPT4ge1xuICByZXR1cm4gcm5kSW50KERVUkFUSU9OKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZVN0YXJ0ZXJQbGFuID0gKCk6IFBsYW4gPT4ge1xuICBjb25zdCBwbGFuID0gbmV3IFBsYW4oKTtcbiAgY29uc3QgcmVzID0gYXBwbHlBbGxPcHNUb1BsYW4oXG4gICAgW1xuICAgICAgSW5zZXJ0TmV3RW1wdHlNaWxlc3RvbmVBZnRlck9wKDApLFxuICAgICAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIDEwLCAxKSxcbiAgICAgIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibG93XCIsIDEpLFxuICAgIF0sXG4gICAgcGxhblxuICApO1xuXG4gIGlmICghcmVzLm9rKSB7XG4gICAgY29uc29sZS5sb2cocmVzLmVycm9yKTtcbiAgfVxuICByZXR1cm4gcGxhbjtcbn07XG5cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZVJhbmRvbVBsYW4gPSAoKTogUGxhbiA9PiB7XG4gIGNvbnN0IHBsYW4gPSBuZXcgUGxhbigpO1xuXG4gIGNvbnN0IG9wczogT3BbXSA9IFtBZGRSZXNvdXJjZU9wKFwiUGVyc29uXCIpXTtcblxuICBwZW9wbGUuZm9yRWFjaCgocGVyc29uOiBzdHJpbmcpID0+IHtcbiAgICBvcHMucHVzaChBZGRSZXNvdXJjZU9wdGlvbk9wKFwiUGVyc29uXCIsIHBlcnNvbikpO1xuICB9KTtcbiAgb3BzLnB1c2goRGVsZXRlUmVzb3VyY2VPcHRpb25PcChcIlBlcnNvblwiLCBcIlwiKSk7XG5cbiAgb3BzLnB1c2goXG4gICAgQWRkTWV0cmljT3AoXCJDb3N0ICgkL2hyKVwiLCBuZXcgTWV0cmljRGVmaW5pdGlvbigxNSwgbmV3IE1ldHJpY1JhbmdlKDApKSksXG4gICAgSW5zZXJ0TmV3RW1wdHlNaWxlc3RvbmVBZnRlck9wKDApLFxuICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCBybmREdXJhdGlvbigpLCAxKSxcbiAgICBTZXRUYXNrTmFtZU9wKDEsIHJhbmRvbVRhc2tOYW1lKCkpLFxuICAgIFNldFJlc291cmNlVmFsdWVPcChcIlBlcnNvblwiLCBwZW9wbGVbcm5kSW50KHBlb3BsZS5sZW5ndGgpXSwgMSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCAxKVxuICApO1xuXG4gIGxldCBudW1UYXNrcyA9IDE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNTA7IGkrKykge1xuICAgIGxldCBpbmRleCA9IHJuZEludChudW1UYXNrcykgKyAxO1xuICAgIG9wcy5wdXNoKFxuICAgICAgU3BsaXRUYXNrT3AoaW5kZXgpLFxuICAgICAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIHJuZER1cmF0aW9uKCksIGluZGV4ICsgMSksXG4gICAgICBTZXRUYXNrTmFtZU9wKGluZGV4ICsgMSwgcmFuZG9tVGFza05hbWUoKSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIGluZGV4ICsgMSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcIm1vZGVyYXRlXCIsIGluZGV4ICsgMSlcbiAgICApO1xuICAgIG51bVRhc2tzKys7XG4gICAgaW5kZXggPSBybmRJbnQobnVtVGFza3MpICsgMTtcbiAgICBvcHMucHVzaChcbiAgICAgIER1cFRhc2tPcChpbmRleCksXG4gICAgICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgaW5kZXggKyAxKSxcbiAgICAgIFNldFRhc2tOYW1lT3AoaW5kZXggKyAxLCByYW5kb21UYXNrTmFtZSgpKSxcbiAgICAgIFNldFJlc291cmNlVmFsdWVPcChcIlBlcnNvblwiLCBwZW9wbGVbcm5kSW50KHBlb3BsZS5sZW5ndGgpXSwgaW5kZXggKyAxKSxcbiAgICAgIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibW9kZXJhdGVcIiwgaW5kZXggKyAxKVxuICAgICk7XG4gICAgbnVtVGFza3MrKztcbiAgfVxuXG4gIGNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKG9wcywgcGxhbik7XG5cbiAgaWYgKCFyZXMub2spIHtcbiAgICBjb25zb2xlLmxvZyhyZXMuZXJyb3IpO1xuICB9XG4gIHJldHVybiBwbGFuO1xufTtcblxuY29uc3QgcGFydHMgPSBbXG4gIFwibG9yZW1cIixcbiAgXCJpcHN1bVwiLFxuICBcImRvbG9yXCIsXG4gIFwic2l0XCIsXG4gIFwiYW1ldFwiLFxuICBcImNvbnNlY3RldHVyXCIsXG4gIFwiYWRpcGlzY2luZ1wiLFxuICBcImVsaXRcIixcbiAgXCJzZWRcIixcbiAgXCJkb1wiLFxuICBcImVpdXNtb2RcIixcbiAgXCJ0ZW1wb3JcIixcbiAgXCJpbmNpZGlkdW50XCIsXG4gIFwidXRcIixcbiAgXCJsYWJvcmVcIixcbiAgXCJldFwiLFxuICBcImRvbG9yZVwiLFxuICBcIm1hZ25hXCIsXG4gIFwiYWxpcXVhXCIsXG4gIFwidXRcIixcbiAgXCJlbmltXCIsXG4gIFwiYWRcIixcbiAgXCJtaW5pbVwiLFxuICBcInZlbmlhbVwiLFxuICBcInF1aXNcIixcbiAgXCJub3N0cnVkXCIsXG4gIFwiZXhlcmNpdGF0aW9uXCIsXG4gIFwidWxsYW1jb1wiLFxuICBcImxhYm9yaXNcIixcbiAgXCJuaXNpXCIsXG4gIFwidXRcIixcbiAgXCJhbGlxdWlwXCIsXG4gIFwiZXhcIixcbiAgXCJlYVwiLFxuICBcImNvbW1vZG9cIixcbiAgXCJjb25zZXF1YXRcIixcbiAgXCJldWlzXCIsXG4gIFwiYXV0ZVwiLFxuICBcImlydXJlXCIsXG4gIFwiZG9sb3JcIixcbiAgXCJpblwiLFxuICBcInJlcHJlaGVuZGVyaXRcIixcbiAgXCJpblwiLFxuICBcInZvbHVwdGF0ZVwiLFxuICBcInZlbGl0XCIsXG4gIFwiZXNzZVwiLFxuICBcImNpbGx1bVwiLFxuICBcImRvbG9yZVwiLFxuICBcImV1XCIsXG4gIFwiZnVnaWF0XCIsXG4gIFwibnVsbGFcIixcbiAgXCJwYXJpYXR1clwiLFxuICBcImV4Y2VwdGV1clwiLFxuICBcInNpbnRcIixcbiAgXCJvY2NhZWNhdFwiLFxuICBcImN1cGlkYXRhdFwiLFxuICBcIm5vblwiLFxuICBcInByb2lkZW50XCIsXG4gIFwic3VudFwiLFxuICBcImluXCIsXG4gIFwiY3VscGFcIixcbiAgXCJxdWlcIixcbiAgXCJvZmZpY2lhXCIsXG4gIFwiZGVzZXJ1bnRcIixcbiAgXCJtb2xsaXRcIixcbiAgXCJhbmltXCIsXG4gIFwiaWRcIixcbiAgXCJlc3RcIixcbiAgXCJsYWJvcnVtXCIsXG5dO1xuXG5jb25zdCBwYXJ0c0xlbmd0aCA9IHBhcnRzLmxlbmd0aDtcblxuY29uc3QgcmFuZG9tVGFza05hbWUgPSAoKTogc3RyaW5nID0+XG4gIGAke3BhcnRzW3JuZEludChwYXJ0c0xlbmd0aCldfSAke3BhcnRzW3JuZEludChwYXJ0c0xlbmd0aCldfWA7XG4iLCAiaW1wb3J0IHsgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgRmlsdGVyRnVuYyB9IGZyb20gXCIuLi9jaGFydC9maWx0ZXIvZmlsdGVyLnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wIH0gZnJvbSBcIi4uL29wcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBTZXRSZXNvdXJjZVZhbHVlT3AgfSBmcm9tIFwiLi4vb3BzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7XG4gIERJVklERVJfTU9WRV9FVkVOVCxcbiAgRGl2aWRlck1vdmUsXG4gIERpdmlkZXJNb3ZlUmVzdWx0LFxufSBmcm9tIFwiLi4vcmVuZGVyZXIvZGl2aWRlcm1vdmUvZGl2aWRlcm1vdmUudHNcIjtcbmltcG9ydCB7XG4gIERSQUdfUkFOR0VfRVZFTlQsXG4gIERyYWdSYW5nZSxcbiAgTW91c2VEcmFnLFxufSBmcm9tIFwiLi4vcmVuZGVyZXIvbW91c2VkcmFnL21vdXNlZHJhZy50c1wiO1xuaW1wb3J0IHsgTW91c2VNb3ZlIH0gZnJvbSBcIi4uL3JlbmRlcmVyL21vdXNlbW92ZS9tb3VzZW1vdmUudHNcIjtcbmltcG9ydCB7IERpc3BsYXlSYW5nZSB9IGZyb20gXCIuLi9yZW5kZXJlci9yYW5nZS9yYW5nZS50c1wiO1xuaW1wb3J0IHtcbiAgUmVuZGVyT3B0aW9ucyxcbiAgUmVuZGVyUmVzdWx0LFxuICBUYXNrTGFiZWwsXG4gIFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyxcbiAgcmVuZGVyVGFza3NUb0NhbnZhcyxcbiAgc3VnZ2VzdGVkQ2FudmFzSGVpZ2h0LFxufSBmcm9tIFwiLi4vcmVuZGVyZXIvcmVuZGVyZXIudHNcIjtcbmltcG9ydCB7IHB0IH0gZnJvbSBcIi4uL3BvaW50L3BvaW50LnRzXCI7XG5pbXBvcnQgeyBTY2FsZSB9IGZyb20gXCIuLi9yZW5kZXJlci9zY2FsZS9zY2FsZS50c1wiO1xuaW1wb3J0IHsgUmVzdWx0IH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgQ29tcHV0ZVNsYWNrLCBDcml0aWNhbFBhdGgsIFNsYWNrLCBTcGFuIH0gZnJvbSBcIi4uL3NsYWNrL3NsYWNrLnRzXCI7XG5pbXBvcnQgeyBUaGVtZSwgY29sb3JUaGVtZUZyb21FbGVtZW50IH0gZnJvbSBcIi4uL3N0eWxlL3RoZW1lL3RoZW1lLnRzXCI7XG5pbXBvcnQge1xuICBnZW5lcmF0ZVJhbmRvbVBsYW4sXG4gIGdlbmVyYXRlU3RhcnRlclBsYW4sXG59IGZyb20gXCIuLi9nZW5lcmF0ZS9nZW5lcmF0ZS50c1wiO1xuaW1wb3J0IHsgZXhlY3V0ZSwgZXhlY3V0ZU9wIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlLnRzXCI7XG5pbXBvcnQgeyBTdGFydEtleWJvYXJkSGFuZGxpbmcgfSBmcm9tIFwiLi4va2V5bWFwL2tleW1hcC50c1wiO1xuaW1wb3J0IHsgUmVtb3ZlRWRnZU9wLCBTZXRUYXNrTmFtZU9wIH0gZnJvbSBcIi4uL29wcy9jaGFydC50c1wiO1xuaW1wb3J0IHsgRGVwZW5kZW5jaWVzUGFuZWwgfSBmcm9tIFwiLi4vZGVwZW5kZW5jaWVzL2RlcGVuZGVuY2llcy1wYW5lbC50c1wiO1xuaW1wb3J0IHsgQWN0aW9uTmFtZXMgfSBmcm9tIFwiLi4vYWN0aW9uL3JlZ2lzdHJ5LnRzXCI7XG5pbXBvcnQge1xuICBTZWxlY3RlZFRhc2tQYW5lbCxcbiAgVGFza01ldHJpY1ZhbHVlQ2hhbmdlRGV0YWlscyxcbiAgVGFza05hbWVDaGFuZ2VEZXRhaWxzLFxuICBUYXNrUmVzb3VyY2VWYWx1ZUNoYW5nZURldGFpbHMsXG59IGZyb20gXCIuLi9zZWxlY3RlZC10YXNrLXBhbmVsL3NlbGVjdGVkLXRhc2stcGFuZWwudHNcIjtcbmltcG9ydCB7IHJlcG9ydE9uRXJyb3IgfSBmcm9tIFwiLi4vcmVwb3J0LWVycm9yL3JlcG9ydC1lcnJvci50c1wiO1xuaW1wb3J0IHsgVGFza0R1cmF0aW9uIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyBTaW11bGF0aW9uUGFuZWwgfSBmcm9tIFwiLi4vc2ltdWxhdGlvbi1wYW5lbC9zaW11bGF0aW9uLXBhbmVsLnRzXCI7XG5pbXBvcnQgeyBhcHBseVN0b3JlZFRoZW1lIH0gZnJvbSBcIi4uL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlci50c1wiO1xuaW1wb3J0IHsgRWRpdFJlc291cmNlc0RpYWxvZyB9IGZyb20gXCIuLi9lZGl0LXJlc291cmNlcy1kaWFsb2cvZWRpdC1yZXNvdXJjZXMtZGlhbG9nLnRzXCI7XG5pbXBvcnQgeyBFZGl0TWV0cmljc0RpYWxvZyB9IGZyb20gXCIuLi9lZGl0LW1ldHJpY3MtZGlhbG9nL2VkaXQtbWV0cmljcy1kaWFsb2cudHNcIjtcbmltcG9ydCB7IEVkaXRQbGFuU3RhcnREaWFsb2cgfSBmcm9tIFwiLi4vZWRpdC1wbGFuLXN0YXJ0L2VkaXQtcGxhbi1zdGFydC50c1wiO1xuaW1wb3J0IHsgVGFza0NvbXBsZXRpb25QYW5lbCB9IGZyb20gXCIuLi90YXNrLWNvbXBsZXRpb24tcGFuZWwvdGFzay1jb21wbGV0aW9uLXBhbmVsLnRzXCI7XG5cbmNvbnN0IEZPTlRfU0laRV9QWCA9IDMyO1xuXG5jb25zdCBOVU1fU0lNVUxBVElPTl9MT09QUyA9IDEwMDtcblxuZXhwb3J0IGNsYXNzIEV4cGxhbk1haW4gZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIC8qKiBUaGUgUGxhbiBiZWluZyBlZGl0ZWQuICovXG4gIHBsYW46IFBsYW4gPSBuZXcgUGxhbigpO1xuXG4gIC8qKiBUaGUgc3RhcnQgYW5kIGZpbmlzaCB0aW1lIGZvciBlYWNoIFRhc2sgaW4gdGhlIFBsYW4uICovXG4gIHNwYW5zOiBTcGFuW10gPSBbXTtcblxuICAvKiogVGhlIHRhc2sgaW5kaWNlcyBvZiB0YXNrcyBvbiB0aGUgY3JpdGljYWwgcGF0aC4gKi9cbiAgY3JpdGljYWxQYXRoOiBudW1iZXJbXSA9IFtdO1xuXG4gIC8qKiBUaGUgc2VsZWN0aW9uIChpbiB0aW1lKSBvZiB0aGUgUGxhbiBjdXJyZW50bHkgYmVpbmcgdmlld2VkLiAqL1xuICBkaXNwbGF5UmFuZ2U6IERpc3BsYXlSYW5nZSB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBTY2FsZSBmb3IgdGhlIHJhZGFyIHZpZXcsIHVzZWQgZm9yIGRyYWcgc2VsZWN0aW5nIGEgZGlzcGxheVJhbmdlLiAqL1xuICByYWRhclNjYWxlOiBTY2FsZSB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBBbGwgb2YgdGhlIHR5cGVzIG9mIHJlc291cmNlcyBpbiB0aGUgcGxhbi4gKi9cbiAgZ3JvdXBCeU9wdGlvbnM6IHN0cmluZ1tdID0gW107XG5cbiAgLyoqIFdoaWNoIG9mIHRoZSByZXNvdXJjZXMgYXJlIHdlIGN1cnJlbnRseSBncm91cGluZyBieSwgd2hlcmUgMCBtZWFucyBub1xuICAgKiBncm91cGluZyBpcyBkb25lLiAqL1xuICBncm91cEJ5T3B0aW9uc0luZGV4OiBudW1iZXIgPSAwO1xuXG4gIC8qKiBUaGUgY3VycmVudGx5IHNlbGVjdGVkIHRhc2ssIGFzIGFuIGluZGV4LiAqL1xuICBzZWxlY3RlZFRhc2s6IG51bWJlciA9IC0xO1xuXG4gIC8vIFVJIGZlYXR1cmVzIHRoYXQgY2FuIGJlIHRvZ2dsZWQgb24gYW5kIG9mZi5cbiAgdG9wVGltZWxpbmU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgY3JpdGljYWxQYXRoc09ubHk6IGJvb2xlYW4gPSBmYWxzZTtcbiAgZm9jdXNPblRhc2s6IGJvb2xlYW4gPSBmYWxzZTtcbiAgbW91c2VNb3ZlOiBNb3VzZU1vdmUgfCBudWxsID0gbnVsbDtcblxuICBkZXBlbmRlbmNpZXNQYW5lbDogRGVwZW5kZW5jaWVzUGFuZWwgfCBudWxsID0gbnVsbDtcblxuICBkb3dubG9hZExpbms6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgc2VsZWN0ZWRUYXNrUGFuZWw6IFNlbGVjdGVkVGFza1BhbmVsIHwgbnVsbCA9IG51bGw7XG5cbiAgdGFza0NvbXBsZXRpb25QYW5lbDogVGFza0NvbXBsZXRpb25QYW5lbCB8IG51bGwgPSBudWxsO1xuXG4gIGFsdGVybmF0ZVRhc2tEdXJhdGlvbnM6IG51bWJlcltdIHwgbnVsbCA9IG51bGw7XG5cbiAgc2ltdWxhdGlvblBhbmVsOiBTaW11bGF0aW9uUGFuZWwgfCBudWxsID0gbnVsbDtcblxuICAvKiogQ2FsbGJhY2sgdG8gY2FsbCB3aGVuIGEgbW91c2UgbW92ZXMgb3ZlciB0aGUgY2hhcnQuICovXG4gIHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvczogVXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zIHwgbnVsbCA9IG51bGw7XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgdGhpcy5zaW11bGF0aW9uUGFuZWwgPVxuICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yPFNpbXVsYXRpb25QYW5lbD4oXCJzaW11bGF0aW9uLXBhbmVsXCIpO1xuICAgIHRoaXMuc2ltdWxhdGlvblBhbmVsIS5hZGRFdmVudExpc3RlbmVyKFwic2ltdWxhdGlvbi1zZWxlY3RcIiwgKGUpID0+IHtcbiAgICAgIHRoaXMuYWx0ZXJuYXRlVGFza0R1cmF0aW9ucyA9IGUuZGV0YWlsLmR1cmF0aW9ucztcbiAgICAgIHRoaXMuY3JpdGljYWxQYXRoID0gZS5kZXRhaWwuY3JpdGljYWxQYXRoO1xuICAgICAgdGhpcy5yZWNhbGN1bGF0ZVNwYW5zQW5kQ3JpdGljYWxQYXRoKCk7XG4gICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZG93bmxvYWRMaW5rID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxBbmNob3JFbGVtZW50PihcIiNkb3dubG9hZFwiKSE7XG4gICAgdGhpcy5kb3dubG9hZExpbmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucHJlcGFyZURvd25sb2FkKCk7XG4gICAgfSk7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXNQYW5lbCA9IHRoaXMucXVlcnlTZWxlY3RvcihcImRlcGVuZGVuY2llcy1wYW5lbFwiKSE7XG5cbiAgICB0aGlzLmRlcGVuZGVuY2llc1BhbmVsIS5hZGRFdmVudExpc3RlbmVyKFwiYWRkLWRlcGVuZGVuY3lcIiwgYXN5bmMgKGUpID0+IHtcbiAgICAgIGxldCBhY3Rpb25OYW1lOiBBY3Rpb25OYW1lcyA9IFwiQWRkUHJlZGVjZXNzb3JBY3Rpb25cIjtcbiAgICAgIGlmIChlLmRldGFpbC5kZXBUeXBlID09PSBcInN1Y2NcIikge1xuICAgICAgICBhY3Rpb25OYW1lID0gXCJBZGRTdWNjZXNzb3JBY3Rpb25cIjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGUoYWN0aW9uTmFtZSwgdGhpcyk7XG4gICAgICBpZiAoIXJldC5vaykge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5kZXBlbmRlbmNpZXNQYW5lbCEuYWRkRXZlbnRMaXN0ZW5lcihcImRlbGV0ZS1kZXBlbmRlbmN5XCIsIGFzeW5jIChlKSA9PiB7XG4gICAgICBsZXQgW2ksIGpdID0gW2UuZGV0YWlsLnRhc2tJbmRleCwgdGhpcy5zZWxlY3RlZFRhc2tdO1xuICAgICAgaWYgKGUuZGV0YWlsLmRlcFR5cGUgPT09IFwic3VjY1wiKSB7XG4gICAgICAgIFtpLCBqXSA9IFtqLCBpXTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG9wID0gUmVtb3ZlRWRnZU9wKGksIGopO1xuICAgICAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZU9wKG9wLCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLCB0cnVlLCB0aGlzKTtcbiAgICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJldC5lcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnNlbGVjdGVkVGFza1BhbmVsID0gdGhpcy5xdWVyeVNlbGVjdG9yKFwic2VsZWN0ZWQtdGFzay1wYW5lbFwiKSE7XG4gICAgdGhpcy5zZWxlY3RlZFRhc2tQYW5lbC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJ0YXNrLW5hbWUtY2hhbmdlXCIsXG4gICAgICBhc3luYyAoZTogQ3VzdG9tRXZlbnQ8VGFza05hbWVDaGFuZ2VEZXRhaWxzPikgPT4ge1xuICAgICAgICBjb25zdCBvcCA9IFNldFRhc2tOYW1lT3AoZS5kZXRhaWwudGFza0luZGV4LCBlLmRldGFpbC5uYW1lKTtcbiAgICAgICAgcmVwb3J0T25FcnJvcihhd2FpdCBleGVjdXRlT3Aob3AsIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCIsIHRydWUsIHRoaXMpKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5zZWxlY3RlZFRhc2tQYW5lbC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJ0YXNrLXJlc291cmNlLXZhbHVlLWNoYW5nZVwiLFxuICAgICAgYXN5bmMgKGU6IEN1c3RvbUV2ZW50PFRhc2tSZXNvdXJjZVZhbHVlQ2hhbmdlRGV0YWlscz4pID0+IHtcbiAgICAgICAgY29uc3QgeyBuYW1lLCB2YWx1ZSwgdGFza0luZGV4IH0gPSBlLmRldGFpbDtcbiAgICAgICAgY29uc3Qgb3AgPSBTZXRSZXNvdXJjZVZhbHVlT3AobmFtZSwgdmFsdWUsIHRhc2tJbmRleCk7XG4gICAgICAgIHJlcG9ydE9uRXJyb3IoYXdhaXQgZXhlY3V0ZU9wKG9wLCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLCB0cnVlLCB0aGlzKSk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMuc2VsZWN0ZWRUYXNrUGFuZWwuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwidGFzay1tZXRyaWMtdmFsdWUtY2hhbmdlXCIsXG4gICAgICBhc3luYyAoZTogQ3VzdG9tRXZlbnQ8VGFza01ldHJpY1ZhbHVlQ2hhbmdlRGV0YWlscz4pID0+IHtcbiAgICAgICAgY29uc3QgeyBuYW1lLCB2YWx1ZSwgdGFza0luZGV4IH0gPSBlLmRldGFpbDtcbiAgICAgICAgY29uc3Qgb3AgPSBTZXRNZXRyaWNWYWx1ZU9wKG5hbWUsIHZhbHVlLCB0YXNrSW5kZXgpO1xuICAgICAgICByZXBvcnRPbkVycm9yKGF3YWl0IGV4ZWN1dGVPcChvcCwgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIiwgdHJ1ZSwgdGhpcykpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnRhc2tDb21wbGV0aW9uUGFuZWwgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJ0YXNrLWNvbXBsZXRpb24tcGFuZWxcIik7XG5cbiAgICAvLyBEcmFnZ2luZyBvbiB0aGUgcmFkYXIuXG4gICAgY29uc3QgcmFkYXIgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KFwiI3JhZGFyXCIpITtcbiAgICBuZXcgTW91c2VEcmFnKHJhZGFyKTtcbiAgICByYWRhci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgRFJBR19SQU5HRV9FVkVOVCxcbiAgICAgIHRoaXMuZHJhZ1JhbmdlSGFuZGxlci5iaW5kKHRoaXMpIGFzIEV2ZW50TGlzdGVuZXJcbiAgICApO1xuXG4gICAgLy8gRGl2aWRlciBkcmFnZ2luZy5cbiAgICBjb25zdCBkaXZpZGVyID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcInZlcnRpY2FsLWRpdmlkZXJcIikhO1xuICAgIG5ldyBEaXZpZGVyTW92ZShkb2N1bWVudC5ib2R5LCBkaXZpZGVyLCBcImNvbHVtblwiKTtcblxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihESVZJREVSX01PVkVfRVZFTlQsICgoXG4gICAgICBlOiBDdXN0b21FdmVudDxEaXZpZGVyTW92ZVJlc3VsdD5cbiAgICApID0+IHtcbiAgICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkoXG4gICAgICAgIFwiZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zXCIsXG4gICAgICAgIGBjYWxjKCR7ZS5kZXRhaWwuYmVmb3JlfSUgLSAxNXB4KSAxMHB4IGF1dG9gXG4gICAgICApO1xuICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgfSkgYXMgRXZlbnRMaXN0ZW5lcik7XG5cbiAgICAvLyBCdXR0b25zXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3Jlc2V0LXpvb21cIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBleGVjdXRlKFwiUmVzZXRab29tQWN0aW9uXCIsIHRoaXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2RhcmstbW9kZS10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBleGVjdXRlKFwiVG9nZ2xlRGFya01vZGVBY3Rpb25cIiwgdGhpcyk7XG4gICAgfSk7XG4gICAgYXBwbHlTdG9yZWRUaGVtZSgpO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3JhZGFyLXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIGV4ZWN1dGUoXCJUb2dnbGVSYWRhckFjdGlvblwiLCB0aGlzKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiN0b3AtdGltZWxpbmUtdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJjbGlja1wiLFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnRvcFRpbWVsaW5lID0gIXRoaXMudG9wVGltZWxpbmU7XG4gICAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZ3JvdXAtYnktdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy50b2dnbGVHcm91cEJ5KCk7XG4gICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNjcml0aWNhbC1wYXRocy10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcImNsaWNrXCIsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMudG9nZ2xlQ3JpdGljYWxQYXRoc09ubHkoKTtcbiAgICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IG92ZXJsYXlDYW52YXMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTENhbnZhc0VsZW1lbnQ+KFwiI292ZXJsYXlcIikhO1xuICAgIHRoaXMubW91c2VNb3ZlID0gbmV3IE1vdXNlTW92ZShvdmVybGF5Q2FudmFzKTtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG5cbiAgICBvdmVybGF5Q2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHAgPSBwdChlLm9mZnNldFgsIGUub2Zmc2V0WSk7XG4gICAgICBpZiAodGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5zZXRTZWxlY3Rpb24oXG4gICAgICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MocCwgXCJtb3VzZWRvd25cIikgfHwgLTEsXG4gICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIG92ZXJsYXlDYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBwID0gcHQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICAgICAgaWYgKHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHRhc2tJbmRleCA9XG4gICAgICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MocCwgXCJtb3VzZWRvd25cIikgfHwgLTE7XG4gICAgICAgIGlmICh0YXNrSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgZXhlY3V0ZShcIlJlc2V0Wm9vbUFjdGlvblwiLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFNlbGVjdGlvbih0YXNrSW5kZXgsIHRydWUsIHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUmVhY3QgdG8gdGhlIHVwbG9hZCBpbnB1dC5cbiAgICBjb25zdCBmaWxlVXBsb2FkID1cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTElucHV0RWxlbWVudD4oXCIjZmlsZS11cGxvYWRcIikhO1xuICAgIGZpbGVVcGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBqc29uID0gYXdhaXQgZmlsZVVwbG9hZC5maWxlcyFbMF0udGV4dCgpO1xuICAgICAgY29uc3QgcmV0ID0gUGxhbi5Gcm9tSlNPTlRleHQoanNvbik7XG4gICAgICBpZiAoIXJldC5vaykge1xuICAgICAgICB0aHJvdyByZXQuZXJyb3I7XG4gICAgICB9XG4gICAgICB0aGlzLnBsYW4gPSByZXQudmFsdWU7XG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaW11bGF0ZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucmVjYWxjdWxhdGVTcGFuc0FuZENyaXRpY2FsUGF0aCgpO1xuICAgICAgdGhpcy5jcml0aWNhbFBhdGggPSB0aGlzLnNpbXVsYXRpb25QYW5lbCEuc2ltdWxhdGUoXG4gICAgICAgIHRoaXMucGxhbi5jaGFydCxcbiAgICAgICAgTlVNX1NJTVVMQVRJT05fTE9PUFMsXG4gICAgICAgIHRoaXMuY3JpdGljYWxQYXRoXG4gICAgICApO1xuICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZm9jdXMtb24tc2VsZWN0ZWQtdGFza1wiKSEuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGVGb2N1c09uVGFzaygpO1xuICAgICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2dlbi1yYW5kb20tcGxhblwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucGxhbiA9IGdlbmVyYXRlUmFuZG9tUGxhbigpO1xuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZWRpdC1yZXNvdXJjZXNcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8RWRpdFJlc291cmNlc0RpYWxvZz4oXG4gICAgICAgIFwiZWRpdC1yZXNvdXJjZXMtZGlhbG9nXCJcbiAgICAgICkhLnNob3dNb2RhbCh0aGlzKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNlZGl0LW1ldHJpY3NcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8RWRpdE1ldHJpY3NEaWFsb2c+KFwiZWRpdC1tZXRyaWNzLWRpYWxvZ1wiKSEuc2hvd01vZGFsKFxuICAgICAgICB0aGlzXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2VkaXQtcGxhbi1zdGFydFwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5xdWVyeVNlbGVjdG9yPEVkaXRQbGFuU3RhcnREaWFsb2c+KFxuICAgICAgICAgIFwiZWRpdC1wbGFuLXN0YXJ0XCJcbiAgICAgICAgKSEuc3RhcnQodGhpcy5wbGFuLnN0YXR1cyk7XG4gICAgICAgIGlmIChyZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPIENoYW5nZSB0aGUgc3RhdHVzXG4gICAgICAgIHRoaXMucGxhbi5zdGF0dXMgPSByZXQ7XG4gICAgICAgIHRoaXMucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnBsYW4gPSBnZW5lcmF0ZVN0YXJ0ZXJQbGFuKCk7XG4gICAgdGhpcy51cGRhdGVUYXNrUGFuZWxzKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgICB0aGlzLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpID0+IHRoaXMucGFpbnRDaGFydCgpKTtcbiAgICBTdGFydEtleWJvYXJkSGFuZGxpbmcodGhpcyk7XG4gIH1cblxuICBwcmVwYXJlRG93bmxvYWQoKSB7XG4gICAgY29uc3QgZG93bmxvYWRCbG9iID0gbmV3IEJsb2IoW0pTT04uc3RyaW5naWZ5KHRoaXMucGxhbiwgbnVsbCwgXCIgIFwiKV0sIHtcbiAgICAgIHR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgIH0pO1xuICAgIHRoaXMuZG93bmxvYWRMaW5rIS5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChkb3dubG9hZEJsb2IpO1xuICB9XG5cbiAgdXBkYXRlVGFza1BhbmVscyh0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuc2VsZWN0ZWRUYXNrID0gdGFza0luZGV4O1xuICAgIHRoaXMuc2VsZWN0ZWRUYXNrUGFuZWwhLnVwZGF0ZVNlbGVjdGVkVGFza1BhbmVsKFxuICAgICAgdGhpcy5wbGFuLFxuICAgICAgdGhpcy5zZWxlY3RlZFRhc2tcbiAgICApO1xuICAgIHRoaXMudGFza0NvbXBsZXRpb25QYW5lbCEudXBkYXRlKFxuICAgICAgdGhpcyxcbiAgICAgIHRoaXMuc2VsZWN0ZWRUYXNrLFxuICAgICAgdGhpcy5zcGFuc1t0aGlzLnNlbGVjdGVkVGFza11cbiAgICApO1xuICAgIGNvbnN0IGVkZ2VzID0gZWRnZXNCeVNyY0FuZERzdFRvTWFwKHRoaXMucGxhbi5jaGFydC5FZGdlcyk7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXNQYW5lbCEuc2V0VGFza3NBbmRJbmRpY2VzKFxuICAgICAgdGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzLFxuICAgICAgKGVkZ2VzLmJ5RHN0LmdldCh0YXNrSW5kZXgpIHx8IFtdKS5tYXAoKGU6IERpcmVjdGVkRWRnZSkgPT4gZS5pKSxcbiAgICAgIChlZGdlcy5ieVNyYy5nZXQodGFza0luZGV4KSB8fCBbXSkubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUuailcbiAgICApO1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzUGFuZWwhLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICBcImhpZGRlblwiLFxuICAgICAgdGhpcy5zZWxlY3RlZFRhc2sgPT09IC0xXG4gICAgKTtcbiAgfVxuXG4gIHNldFNlbGVjdGlvbihcbiAgICBpbmRleDogbnVtYmVyLFxuICAgIGZvY3VzOiBib29sZWFuLFxuICAgIHNjcm9sbFRvU2VsZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZVxuICApIHtcbiAgICB0aGlzLnNlbGVjdGVkVGFzayA9IGluZGV4O1xuICAgIGlmIChmb2N1cykge1xuICAgICAgdGhpcy5mb3JjZUZvY3VzT25UYXNrKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnNlbGVjdGVkVGFzayA9PT0gLTEpIHtcbiAgICAgIHRoaXMuZm9jdXNPblRhc2sgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5wYWludENoYXJ0KHNjcm9sbFRvU2VsZWN0ZWQpO1xuICAgIHRoaXMudXBkYXRlVGFza1BhbmVscyh0aGlzLnNlbGVjdGVkVGFzayk7XG4gIH1cblxuICAvLyBUT0RPIC0gVHVybiB0aGlzIG9uIGFuZCBvZmYgYmFzZWQgb24gbW91c2UgZW50ZXJpbmcgdGhlIGNhbnZhcyBhcmVhLlxuICBvbk1vdXNlTW92ZSgpIHtcbiAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMubW91c2VNb3ZlIS5yZWFkTG9jYXRpb24oKTtcbiAgICBpZiAobG9jYXRpb24gIT09IG51bGwgJiYgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgIT09IG51bGwpIHtcbiAgICAgIHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zKGxvY2F0aW9uLCBcIm1vdXNlbW92ZVwiKTtcbiAgICB9XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgcGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpIHtcbiAgICB0aGlzLnJhZGFyU2NhbGUgPSBudWxsO1xuICAgIHRoaXMuZGlzcGxheVJhbmdlID0gbnVsbDtcbiAgICB0aGlzLmFsdGVybmF0ZVRhc2tEdXJhdGlvbnMgPSBudWxsO1xuICAgIHRoaXMuZ3JvdXBCeU9wdGlvbnMgPSBbXCJcIiwgLi4uT2JqZWN0LmtleXModGhpcy5wbGFuLnJlc291cmNlRGVmaW5pdGlvbnMpXTtcbiAgICBpZiAodGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4ID49IHRoaXMuZ3JvdXBCeU9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXggPSAwO1xuICAgIH1cblxuICAgIHRoaXMucmVjYWxjdWxhdGVTcGFuc0FuZENyaXRpY2FsUGF0aCgpO1xuICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICB9XG5cbiAgZ2V0VGFza0R1cmF0aW9uRnVuYygpOiBUYXNrRHVyYXRpb24ge1xuICAgIGlmICh0aGlzLmFsdGVybmF0ZVRhc2tEdXJhdGlvbnMgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiAodGFza0luZGV4OiBudW1iZXIpID0+IHRoaXMuYWx0ZXJuYXRlVGFza0R1cmF0aW9ucyFbdGFza0luZGV4XTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICh0YXNrSW5kZXg6IG51bWJlcikgPT5cbiAgICAgICAgdGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uZHVyYXRpb247XG4gICAgfVxuICB9XG5cbiAgcmVjYWxjdWxhdGVTcGFuc0FuZENyaXRpY2FsUGF0aCgpIHtcbiAgICBsZXQgc2xhY2tzOiBTbGFja1tdID0gW107XG5cbiAgICBjb25zdCByb3VuZGVyID0gdGhpcy5wbGFuXG4gICAgICAuZ2V0U3RhdGljTWV0cmljRGVmaW5pdGlvbihcIkR1cmF0aW9uXCIpXG4gICAgICAucHJlY2lzaW9uLnJvdW5kZXIoKTtcblxuICAgIGNvbnN0IHNsYWNrUmVzdWx0ID0gQ29tcHV0ZVNsYWNrKFxuICAgICAgdGhpcy5wbGFuLmNoYXJ0LFxuICAgICAgdGhpcy5nZXRUYXNrRHVyYXRpb25GdW5jKCksXG4gICAgICByb3VuZGVyXG4gICAgKTtcbiAgICBpZiAoIXNsYWNrUmVzdWx0Lm9rKSB7XG4gICAgICBjb25zb2xlLmVycm9yKHNsYWNrUmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2xhY2tzID0gc2xhY2tSZXN1bHQudmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5zcGFucyA9IHNsYWNrcy5tYXAoKHZhbHVlOiBTbGFjayk6IFNwYW4gPT4ge1xuICAgICAgcmV0dXJuIHZhbHVlLmVhcmx5O1xuICAgIH0pO1xuICAgIHRoaXMuY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrcywgcm91bmRlcik7XG4gICAgdGhpcy51cGRhdGVUYXNrUGFuZWxzKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgfVxuXG4gIGdldFRhc2tMYWJlbGxlcigpOiBUYXNrTGFiZWwge1xuICAgIHJldHVybiAodGFza0luZGV4OiBudW1iZXIpOiBzdHJpbmcgPT5cbiAgICAgIGAke3RoaXMucGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLm5hbWV9YDtcbiAgfVxuXG4gIGRyYWdSYW5nZUhhbmRsZXIoZTogQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPikge1xuICAgIGlmICh0aGlzLnJhZGFyU2NhbGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYmVnaW4gPSB0aGlzLnJhZGFyU2NhbGUuZGF5Um93RnJvbVBvaW50KGUuZGV0YWlsLmJlZ2luKTtcbiAgICBjb25zdCBlbmQgPSB0aGlzLnJhZGFyU2NhbGUuZGF5Um93RnJvbVBvaW50KGUuZGV0YWlsLmVuZCk7XG4gICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBuZXcgRGlzcGxheVJhbmdlKGJlZ2luLmRheSwgZW5kLmRheSk7XG4gICAgdGhpcy5wYWludENoYXJ0KCk7XG4gIH1cblxuICB0b2dnbGVSYWRhcigpIHtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJyYWRhci1wYXJlbnRcIikhLmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gIH1cblxuICB0b2dnbGVHcm91cEJ5KCkge1xuICAgIHRoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleCA9XG4gICAgICAodGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4ICsgMSkgJSB0aGlzLmdyb3VwQnlPcHRpb25zLmxlbmd0aDtcbiAgfVxuXG4gIHRvZ2dsZUNyaXRpY2FsUGF0aHNPbmx5KCkge1xuICAgIHRoaXMuY3JpdGljYWxQYXRoc09ubHkgPSAhdGhpcy5jcml0aWNhbFBhdGhzT25seTtcbiAgfVxuXG4gIHRvZ2dsZUZvY3VzT25UYXNrKCkge1xuICAgIHRoaXMuZm9jdXNPblRhc2sgPSAhdGhpcy5mb2N1c09uVGFzaztcbiAgICBpZiAoIXRoaXMuZm9jdXNPblRhc2spIHtcbiAgICAgIHRoaXMuZGlzcGxheVJhbmdlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBmb3JjZUZvY3VzT25UYXNrKCkge1xuICAgIHRoaXMuZm9jdXNPblRhc2sgPSB0cnVlO1xuICB9XG5cbiAgcGFpbnRDaGFydChzY3JvbGxUb1NlbGVjdGVkOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zb2xlLnRpbWUoXCJwYWludENoYXJ0XCIpO1xuXG4gICAgY29uc3QgdGhlbWVDb2xvcnM6IFRoZW1lID0gY29sb3JUaGVtZUZyb21FbGVtZW50KGRvY3VtZW50LmJvZHkpO1xuXG4gICAgbGV0IGZpbHRlckZ1bmM6IEZpbHRlckZ1bmMgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBzdGFydEFuZEZpbmlzaCA9IFswLCB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMV07XG4gICAgaWYgKHRoaXMuY3JpdGljYWxQYXRoc09ubHkpIHtcbiAgICAgIGNvbnN0IGhpZ2hsaWdodFNldCA9IG5ldyBTZXQodGhpcy5jcml0aWNhbFBhdGgpO1xuICAgICAgZmlsdGVyRnVuYyA9ICh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgICAgICBpZiAoc3RhcnRBbmRGaW5pc2guaW5jbHVkZXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaWdobGlnaHRTZXQuaGFzKHRhc2tJbmRleCk7XG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5mb2N1c09uVGFzayAmJiB0aGlzLnNlbGVjdGVkVGFzayAhPSAtMSkge1xuICAgICAgLy8gRmluZCBhbGwgcHJlZGVjZXNzb3IgYW5kIHN1Y2Nlc3NvcnMgb2YgdGhlIGdpdmVuIHRhc2suXG4gICAgICBjb25zdCBuZWlnaGJvclNldCA9IG5ldyBTZXQoKTtcbiAgICAgIG5laWdoYm9yU2V0LmFkZCh0aGlzLnNlbGVjdGVkVGFzayk7XG4gICAgICBsZXQgZWFybGllc3RTdGFydCA9IHRoaXMuc3BhbnNbdGhpcy5zZWxlY3RlZFRhc2tdLnN0YXJ0O1xuICAgICAgbGV0IGxhdGVzdEZpbmlzaCA9IHRoaXMuc3BhbnNbdGhpcy5zZWxlY3RlZFRhc2tdLmZpbmlzaDtcbiAgICAgIHRoaXMucGxhbi5jaGFydC5FZGdlcy5mb3JFYWNoKChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgICAgaWYgKGVkZ2UuaSA9PT0gdGhpcy5zZWxlY3RlZFRhc2spIHtcbiAgICAgICAgICBuZWlnaGJvclNldC5hZGQoZWRnZS5qKTtcbiAgICAgICAgICBpZiAobGF0ZXN0RmluaXNoIDwgdGhpcy5zcGFuc1tlZGdlLmpdLmZpbmlzaCkge1xuICAgICAgICAgICAgbGF0ZXN0RmluaXNoID0gdGhpcy5zcGFuc1tlZGdlLmpdLmZpbmlzaDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVkZ2UuaiA9PT0gdGhpcy5zZWxlY3RlZFRhc2spIHtcbiAgICAgICAgICBuZWlnaGJvclNldC5hZGQoZWRnZS5pKTtcbiAgICAgICAgICBpZiAoZWFybGllc3RTdGFydCA+IHRoaXMuc3BhbnNbZWRnZS5pXS5zdGFydCkge1xuICAgICAgICAgICAgZWFybGllc3RTdGFydCA9IHRoaXMuc3BhbnNbZWRnZS5pXS5zdGFydDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gVE9ETyAtIFNpbmNlIHdlIG92ZXJ3cml0ZSBkaXNwbGF5UmFuZ2UgdGhhdCBtZWFucyBkcmFnZ2luZyBvbiB0aGUgcmFkYXJcbiAgICAgIC8vIHdpbGwgbm90IHdvcmsgd2hlbiBmb2N1c2luZyBvbiBhIHNlbGVjdGVkIHRhc2suIEJ1ZyBvciBmZWF0dXJlP1xuICAgICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBuZXcgRGlzcGxheVJhbmdlKGVhcmxpZXN0U3RhcnQgLSAxLCBsYXRlc3RGaW5pc2ggKyAxKTtcblxuICAgICAgZmlsdGVyRnVuYyA9IChfdGFzazogVGFzaywgdGFza0luZGV4OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICAgICAgaWYgKHN0YXJ0QW5kRmluaXNoLmluY2x1ZGVzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZWlnaGJvclNldC5oYXModGFza0luZGV4KTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgZHVyYXRpb25EaXNwbGF5ID0gKHQ6IG51bWJlcikgPT5cbiAgICAgIHRoaXMucGxhbi5kdXJhdGlvblVuaXRzLmRpc3BsYXlUaW1lKHQpO1xuXG4gICAgY29uc3QgcmFkYXJPcHRzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgICAgZm9udFNpemVQeDogNixcbiAgICAgIGhhc1RleHQ6IGZhbHNlLFxuICAgICAgZGlzcGxheVJhbmdlOiB0aGlzLmRpc3BsYXlSYW5nZSxcbiAgICAgIGRpc3BsYXlSYW5nZVVzYWdlOiBcImhpZ2hsaWdodFwiLFxuICAgICAgY29sb3JzOiB7XG4gICAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZTogdGhlbWVDb2xvcnMub25TdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2VNdXRlZDogdGhlbWVDb2xvcnMub25TdXJmYWNlTXV0ZWQsXG4gICAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgICBvdmVybGF5OiB0aGVtZUNvbG9ycy5vdmVybGF5LFxuICAgICAgICBncm91cENvbG9yOiB0aGVtZUNvbG9ycy5ncm91cENvbG9yLFxuICAgICAgICBoaWdobGlnaHQ6IHRoZW1lQ29sb3JzLmhpZ2hsaWdodCxcbiAgICAgIH0sXG4gICAgICBoYXNUaW1lbGluZTogZmFsc2UsXG4gICAgICBoYXNUYXNrczogdHJ1ZSxcbiAgICAgIGhhc0VkZ2VzOiBmYWxzZSxcbiAgICAgIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IGZhbHNlLFxuICAgICAgdGFza0xhYmVsOiB0aGlzLmdldFRhc2tMYWJlbGxlcigpLFxuICAgICAgdGFza0R1cmF0aW9uOiB0aGlzLmdldFRhc2tEdXJhdGlvbkZ1bmMoKSxcbiAgICAgIHRhc2tFbXBoYXNpemU6IHRoaXMuY3JpdGljYWxQYXRoLFxuICAgICAgZmlsdGVyRnVuYzogbnVsbCxcbiAgICAgIGdyb3VwQnlSZXNvdXJjZTogdGhpcy5ncm91cEJ5T3B0aW9uc1t0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXhdLFxuICAgICAgaGlnaGxpZ2h0ZWRUYXNrOiBudWxsLFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXg6IHRoaXMuc2VsZWN0ZWRUYXNrLFxuICAgICAgZHVyYXRpb25EaXNwbGF5OiBkdXJhdGlvbkRpc3BsYXksXG4gICAgfTtcblxuICAgIGNvbnN0IHpvb21PcHRzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgICAgZm9udFNpemVQeDogRk9OVF9TSVpFX1BYLFxuICAgICAgaGFzVGV4dDogdHJ1ZSxcbiAgICAgIGRpc3BsYXlSYW5nZTogdGhpcy5kaXNwbGF5UmFuZ2UsXG4gICAgICBkaXNwbGF5UmFuZ2VVc2FnZTogXCJyZXN0cmljdFwiLFxuICAgICAgY29sb3JzOiB7XG4gICAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZTogdGhlbWVDb2xvcnMub25TdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2VNdXRlZDogdGhlbWVDb2xvcnMub25TdXJmYWNlTXV0ZWQsXG4gICAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgICBvdmVybGF5OiB0aGVtZUNvbG9ycy5vdmVybGF5LFxuICAgICAgICBncm91cENvbG9yOiB0aGVtZUNvbG9ycy5ncm91cENvbG9yLFxuICAgICAgICBoaWdobGlnaHQ6IHRoZW1lQ29sb3JzLmhpZ2hsaWdodCxcbiAgICAgIH0sXG4gICAgICBoYXNUaW1lbGluZTogdGhpcy50b3BUaW1lbGluZSxcbiAgICAgIGhhc1Rhc2tzOiB0cnVlLFxuICAgICAgaGFzRWRnZXM6IHRydWUsXG4gICAgICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiB0cnVlLFxuICAgICAgdGFza0xhYmVsOiB0aGlzLmdldFRhc2tMYWJlbGxlcigpLFxuICAgICAgdGFza0R1cmF0aW9uOiB0aGlzLmdldFRhc2tEdXJhdGlvbkZ1bmMoKSxcbiAgICAgIHRhc2tFbXBoYXNpemU6IHRoaXMuY3JpdGljYWxQYXRoLFxuICAgICAgZmlsdGVyRnVuYzogZmlsdGVyRnVuYyxcbiAgICAgIGdyb3VwQnlSZXNvdXJjZTogdGhpcy5ncm91cEJ5T3B0aW9uc1t0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXhdLFxuICAgICAgaGlnaGxpZ2h0ZWRUYXNrOiAxLFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXg6IHRoaXMuc2VsZWN0ZWRUYXNrLFxuICAgICAgZHVyYXRpb25EaXNwbGF5OiBkdXJhdGlvbkRpc3BsYXksXG4gICAgfTtcblxuICAgIGNvbnN0IHRpbWVsaW5lT3B0czogUmVuZGVyT3B0aW9ucyA9IHtcbiAgICAgIGZvbnRTaXplUHg6IEZPTlRfU0laRV9QWCxcbiAgICAgIGhhc1RleHQ6IHRydWUsXG4gICAgICBkaXNwbGF5UmFuZ2U6IHRoaXMuZGlzcGxheVJhbmdlLFxuICAgICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwicmVzdHJpY3RcIixcbiAgICAgIGNvbG9yczoge1xuICAgICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlTXV0ZWQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZU11dGVkLFxuICAgICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgICAgZ3JvdXBDb2xvcjogdGhlbWVDb2xvcnMuZ3JvdXBDb2xvcixcbiAgICAgICAgaGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5oaWdobGlnaHQsXG4gICAgICB9LFxuICAgICAgaGFzVGltZWxpbmU6IHRydWUsXG4gICAgICBoYXNUYXNrczogZmFsc2UsXG4gICAgICBoYXNFZGdlczogdHJ1ZSxcbiAgICAgIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IHRydWUsXG4gICAgICB0YXNrTGFiZWw6IHRoaXMuZ2V0VGFza0xhYmVsbGVyKCksXG4gICAgICB0YXNrRHVyYXRpb246IHRoaXMuZ2V0VGFza0R1cmF0aW9uRnVuYygpLFxuICAgICAgdGFza0VtcGhhc2l6ZTogdGhpcy5jcml0aWNhbFBhdGgsXG4gICAgICBmaWx0ZXJGdW5jOiBmaWx0ZXJGdW5jLFxuICAgICAgZ3JvdXBCeVJlc291cmNlOiB0aGlzLmdyb3VwQnlPcHRpb25zW3RoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gICAgICBoaWdobGlnaHRlZFRhc2s6IG51bGwsXG4gICAgICBzZWxlY3RlZFRhc2tJbmRleDogdGhpcy5zZWxlY3RlZFRhc2ssXG4gICAgICBkdXJhdGlvbkRpc3BsYXk6IGR1cmF0aW9uRGlzcGxheSxcbiAgICB9O1xuXG4gICAgY29uc3QgcmV0ID0gdGhpcy5wYWludE9uZUNoYXJ0KFwiI3JhZGFyXCIsIHJhZGFyT3B0cyk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yYWRhclNjYWxlID0gcmV0LnZhbHVlLnNjYWxlO1xuXG4gICAgdGhpcy5wYWludE9uZUNoYXJ0KFwiI3RpbWVsaW5lXCIsIHRpbWVsaW5lT3B0cyk7XG4gICAgY29uc3Qgem9vbVJldCA9IHRoaXMucGFpbnRPbmVDaGFydChcIiN6b29tZWRcIiwgem9vbU9wdHMsIFwiI292ZXJsYXlcIik7XG4gICAgaWYgKHpvb21SZXQub2spIHtcbiAgICAgIHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zID1cbiAgICAgICAgem9vbVJldC52YWx1ZS51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M7XG4gICAgICBpZiAoem9vbVJldC52YWx1ZS5zZWxlY3RlZFRhc2tMb2NhdGlvbiAhPT0gbnVsbCAmJiBzY3JvbGxUb1NlbGVjdGVkKSB7XG4gICAgICAgIGxldCB0b3AgPSAwO1xuICAgICAgICBpZiAoIXRoaXMuZm9jdXNPblRhc2spIHtcbiAgICAgICAgICB0b3AgPSB6b29tUmV0LnZhbHVlLnNlbGVjdGVkVGFza0xvY2F0aW9uLnk7XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImNoYXJ0LXBhcmVudFwiKSEuc2Nyb2xsVG8oe1xuICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgYmVoYXZpb3I6IFwic21vb3RoXCIsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUudGltZUVuZChcInBhaW50Q2hhcnRcIik7XG4gIH1cblxuICBwcmVwYXJlQ2FudmFzKFxuICAgIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gICAgY2FudmFzV2lkdGg6IG51bWJlcixcbiAgICBjYW52YXNIZWlnaHQ6IG51bWJlcixcbiAgICB3aWR0aDogbnVtYmVyLFxuICAgIGhlaWdodDogbnVtYmVyXG4gICk6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzV2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGNhbnZhc0hlaWdodDtcbiAgICBjYW52YXMuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gICAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG5cbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpITtcbiAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cbiAgICByZXR1cm4gY3R4O1xuICB9XG5cbiAgcGFpbnRPbmVDaGFydChcbiAgICBjYW52YXNJRDogc3RyaW5nLFxuICAgIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gICAgb3ZlcmxheUlEOiBzdHJpbmcgPSBcIlwiXG4gICk6IFJlc3VsdDxSZW5kZXJSZXN1bHQ+IHtcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTENhbnZhc0VsZW1lbnQ+KGNhbnZhc0lEKSE7XG4gICAgY29uc3QgcGFyZW50ID0gY2FudmFzIS5wYXJlbnRFbGVtZW50ITtcbiAgICBjb25zdCByYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgIGNvbnN0IHdpZHRoID0gcGFyZW50LmNsaWVudFdpZHRoIC0gRk9OVF9TSVpFX1BYO1xuICAgIGxldCBoZWlnaHQgPSBwYXJlbnQuY2xpZW50SGVpZ2h0O1xuICAgIGNvbnN0IGNhbnZhc1dpZHRoID0gTWF0aC5jZWlsKHdpZHRoICogcmF0aW8pO1xuICAgIGxldCBjYW52YXNIZWlnaHQgPSBNYXRoLmNlaWwoaGVpZ2h0ICogcmF0aW8pO1xuXG4gICAgY29uc3QgbmV3SGVpZ2h0ID0gc3VnZ2VzdGVkQ2FudmFzSGVpZ2h0KFxuICAgICAgY2FudmFzLFxuICAgICAgdGhpcy5zcGFucyxcbiAgICAgIG9wdHMsXG4gICAgICB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoICsgMiAvLyBUT0RPIC0gV2h5IGRvIHdlIG5lZWQgdGhlICsyIGhlcmUhP1xuICAgICk7XG4gICAgY2FudmFzSGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICAgIGhlaWdodCA9IG5ld0hlaWdodCAvIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuXG4gICAgbGV0IG92ZXJsYXk6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKG92ZXJsYXlJRCkge1xuICAgICAgb3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTENhbnZhc0VsZW1lbnQ+KG92ZXJsYXlJRCkhO1xuICAgICAgdGhpcy5wcmVwYXJlQ2FudmFzKG92ZXJsYXksIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cbiAgICBjb25zdCBjdHggPSB0aGlzLnByZXBhcmVDYW52YXMoXG4gICAgICBjYW52YXMsXG4gICAgICBjYW52YXNXaWR0aCxcbiAgICAgIGNhbnZhc0hlaWdodCxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgKTtcblxuICAgIHJldHVybiByZW5kZXJUYXNrc1RvQ2FudmFzKFxuICAgICAgcGFyZW50LFxuICAgICAgY2FudmFzLFxuICAgICAgY3R4LFxuICAgICAgdGhpcy5wbGFuLFxuICAgICAgdGhpcy5zcGFucyxcbiAgICAgIG9wdHMsXG4gICAgICBvdmVybGF5XG4gICAgKTtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJleHBsYW4tbWFpblwiLCBFeHBsYW5NYWluKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUdDLE9BQUMsQ0FBQyxNQUFNLFFBQVE7QUFDZixZQUFHLE9BQU8sV0FBVyxjQUFjLE9BQU8sSUFBSyxRQUFPLENBQUMs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RjtBQUFBLEVBQ0Y7QUFFQSxpQkFBZSxPQUFPLGVBQWUsVUFBVTsiLAogICJuYW1lcyI6IFsiXyIsICJyZXN1bHQiLCAiaSIsICJoaWdobGlnaHQiLCAicGFydHMiLCAiUmVzdWx0IiwgImEiLCAiYiIsICJzIiwgInNjb3JlIiwgImoiLCAieCIsICJyIiwgImUiLCAibyIsICJ2IiwgImMiLCAiZiIsICJnbG9iYWwiLCAiZ2xvYmFsVGhpcyIsICJ0cnVzdGVkVHlwZXMiLCAicG9saWN5IiwgImNyZWF0ZVBvbGljeSIsICJjcmVhdGVIVE1MIiwgInMiLCAiYm91bmRBdHRyaWJ1dGVTdWZmaXgiLCAibWFya2VyIiwgIk1hdGgiLCAicmFuZG9tIiwgInRvRml4ZWQiLCAic2xpY2UiLCAibWFya2VyTWF0Y2giLCAibm9kZU1hcmtlciIsICJkIiwgImRvY3VtZW50IiwgImNyZWF0ZU1hcmtlciIsICJjcmVhdGVDb21tZW50IiwgImlzUHJpbWl0aXZlIiwgInZhbHVlIiwgImlzQXJyYXkiLCAiQXJyYXkiLCAiaXNJdGVyYWJsZSIsICJTeW1ib2wiLCAiaXRlcmF0b3IiLCAiU1BBQ0VfQ0hBUiIsICJ0ZXh0RW5kUmVnZXgiLCAiY29tbWVudEVuZFJlZ2V4IiwgImNvbW1lbnQyRW5kUmVnZXgiLCAidGFnRW5kUmVnZXgiLCAiUmVnRXhwIiwgInNpbmdsZVF1b3RlQXR0ckVuZFJlZ2V4IiwgImRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4IiwgInJhd1RleHRFbGVtZW50IiwgInRhZyIsICJ0eXBlIiwgInN0cmluZ3MiLCAidmFsdWVzIiwgIl8kbGl0VHlwZSQiLCAiaHRtbCIsICJzdmciLCAibWF0aG1sIiwgIm5vQ2hhbmdlIiwgImZvciIsICJub3RoaW5nIiwgInRlbXBsYXRlQ2FjaGUiLCAiV2Vha01hcCIsICJ3YWxrZXIiLCAiY3JlYXRlVHJlZVdhbGtlciIsICJ0cnVzdEZyb21UZW1wbGF0ZVN0cmluZyIsICJ0c2EiLCAic3RyaW5nRnJvbVRTQSIsICJoYXNPd25Qcm9wZXJ0eSIsICJFcnJvciIsICJnZXRUZW1wbGF0ZUh0bWwiLCAibCIsICJsZW5ndGgiLCAiYXR0ck5hbWVzIiwgInJhd1RleHRFbmRSZWdleCIsICJyZWdleCIsICJpIiwgImF0dHJOYW1lIiwgIm1hdGNoIiwgImF0dHJOYW1lRW5kSW5kZXgiLCAibGFzdEluZGV4IiwgImV4ZWMiLCAidGVzdCIsICJlbmQiLCAic3RhcnRzV2l0aCIsICJwdXNoIiwgIlRlbXBsYXRlIiwgImNvbnN0cnVjdG9yIiwgIm9wdGlvbnMiLCAibm9kZSIsICJ0aGlzIiwgInBhcnRzIiwgIm5vZGVJbmRleCIsICJhdHRyTmFtZUluZGV4IiwgInBhcnRDb3VudCIsICJlbCIsICJjcmVhdGVFbGVtZW50IiwgImN1cnJlbnROb2RlIiwgImNvbnRlbnQiLCAid3JhcHBlciIsICJmaXJzdENoaWxkIiwgInJlcGxhY2VXaXRoIiwgImNoaWxkTm9kZXMiLCAibmV4dE5vZGUiLCAibm9kZVR5cGUiLCAiaGFzQXR0cmlidXRlcyIsICJuYW1lIiwgImdldEF0dHJpYnV0ZU5hbWVzIiwgImVuZHNXaXRoIiwgInJlYWxOYW1lIiwgInN0YXRpY3MiLCAiZ2V0QXR0cmlidXRlIiwgInNwbGl0IiwgIm0iLCAiaW5kZXgiLCAiY3RvciIsICJQcm9wZXJ0eVBhcnQiLCAiQm9vbGVhbkF0dHJpYnV0ZVBhcnQiLCAiRXZlbnRQYXJ0IiwgIkF0dHJpYnV0ZVBhcnQiLCAicmVtb3ZlQXR0cmlidXRlIiwgInRhZ05hbWUiLCAidGV4dENvbnRlbnQiLCAiZW1wdHlTY3JpcHQiLCAiYXBwZW5kIiwgImRhdGEiLCAiaW5kZXhPZiIsICJfb3B0aW9ucyIsICJpbm5lckhUTUwiLCAicmVzb2x2ZURpcmVjdGl2ZSIsICJwYXJ0IiwgInBhcmVudCIsICJhdHRyaWJ1dGVJbmRleCIsICJjdXJyZW50RGlyZWN0aXZlIiwgIl9fZGlyZWN0aXZlcyIsICJfX2RpcmVjdGl2ZSIsICJuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IiLCAiXyRpbml0aWFsaXplIiwgIl8kcmVzb2x2ZSIsICJUZW1wbGF0ZUluc3RhbmNlIiwgInRlbXBsYXRlIiwgIl8kcGFydHMiLCAiXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuIiwgIl8kdGVtcGxhdGUiLCAiXyRwYXJlbnQiLCAicGFyZW50Tm9kZSIsICJfJGlzQ29ubmVjdGVkIiwgImZyYWdtZW50IiwgImNyZWF0aW9uU2NvcGUiLCAiaW1wb3J0Tm9kZSIsICJwYXJ0SW5kZXgiLCAidGVtcGxhdGVQYXJ0IiwgIkNoaWxkUGFydCIsICJuZXh0U2libGluZyIsICJFbGVtZW50UGFydCIsICJfJHNldFZhbHVlIiwgIl9faXNDb25uZWN0ZWQiLCAic3RhcnROb2RlIiwgImVuZE5vZGUiLCAiXyRjb21taXR0ZWRWYWx1ZSIsICJfJHN0YXJ0Tm9kZSIsICJfJGVuZE5vZGUiLCAiaXNDb25uZWN0ZWQiLCAiZGlyZWN0aXZlUGFyZW50IiwgIl8kY2xlYXIiLCAiX2NvbW1pdFRleHQiLCAiX2NvbW1pdFRlbXBsYXRlUmVzdWx0IiwgIl9jb21taXROb2RlIiwgIl9jb21taXRJdGVyYWJsZSIsICJpbnNlcnRCZWZvcmUiLCAiX2luc2VydCIsICJjcmVhdGVUZXh0Tm9kZSIsICJyZXN1bHQiLCAiXyRnZXRUZW1wbGF0ZSIsICJoIiwgIl91cGRhdGUiLCAiaW5zdGFuY2UiLCAiX2Nsb25lIiwgImdldCIsICJzZXQiLCAiaXRlbVBhcnRzIiwgIml0ZW1QYXJ0IiwgIml0ZW0iLCAic3RhcnQiLCAiZnJvbSIsICJfJG5vdGlmeUNvbm5lY3Rpb25DaGFuZ2VkIiwgIm4iLCAicmVtb3ZlIiwgImVsZW1lbnQiLCAiZmlsbCIsICJTdHJpbmciLCAidmFsdWVJbmRleCIsICJub0NvbW1pdCIsICJjaGFuZ2UiLCAidiIsICJfY29tbWl0VmFsdWUiLCAic2V0QXR0cmlidXRlIiwgInRvZ2dsZUF0dHJpYnV0ZSIsICJzdXBlciIsICJuZXdMaXN0ZW5lciIsICJvbGRMaXN0ZW5lciIsICJzaG91bGRSZW1vdmVMaXN0ZW5lciIsICJjYXB0dXJlIiwgIm9uY2UiLCAicGFzc2l2ZSIsICJzaG91bGRBZGRMaXN0ZW5lciIsICJyZW1vdmVFdmVudExpc3RlbmVyIiwgImFkZEV2ZW50TGlzdGVuZXIiLCAiZXZlbnQiLCAiY2FsbCIsICJob3N0IiwgImhhbmRsZUV2ZW50IiwgIl8kTEgiLCAiX2JvdW5kQXR0cmlidXRlU3VmZml4IiwgIl9tYXJrZXIiLCAiX21hcmtlck1hdGNoIiwgIl9IVE1MX1JFU1VMVCIsICJfZ2V0VGVtcGxhdGVIdG1sIiwgIl9UZW1wbGF0ZUluc3RhbmNlIiwgIl9pc0l0ZXJhYmxlIiwgIl9yZXNvbHZlRGlyZWN0aXZlIiwgIl9DaGlsZFBhcnQiLCAiX0F0dHJpYnV0ZVBhcnQiLCAiX0Jvb2xlYW5BdHRyaWJ1dGVQYXJ0IiwgIl9FdmVudFBhcnQiLCAiX1Byb3BlcnR5UGFydCIsICJfRWxlbWVudFBhcnQiLCAicG9seWZpbGxTdXBwb3J0IiwgImxpdEh0bWxQb2x5ZmlsbFN1cHBvcnQiLCAibGl0SHRtbFZlcnNpb25zIiwgInJlbmRlciIsICJjb250YWluZXIiLCAicGFydE93bmVyTm9kZSIsICJyZW5kZXJCZWZvcmUiLCAiZXhwbGFuTWFpbiIsICJ1bmRvIiwgImkiLCAiaiIsICJlIiwgImkiLCAiZSIsICJpIiwgImoiLCAiZSIsICJ2IiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAidW5kbyIsICJlIiwgImQiLCAidiIsICJlIiwgImciLCAiXyIsICJpIiwgImUiLCAib2siLCAidCIsICJlIiwgImciLCAiaSIsICJjIiwgImMiLCAiaSIsICJyIiwgImUiLCAidW5zdGFydGVkIiwgInQiLCAidG9KU09OIiwgInAiLCAiZnJvbUpTT04iLCAidW5zdGFydGVkIiwgImV4cGxhbk1haW4iLCAiZSIsICJ0IiwgImR1cCIsICJkIiwgImUiLCAicyIsICJ2IiwgIlBhcnRUeXBlIiwgIkFUVFJJQlVURSIsICJDSElMRCIsICJQUk9QRVJUWSIsICJCT09MRUFOX0FUVFJJQlVURSIsICJFVkVOVCIsICJFTEVNRU5UIiwgImRpcmVjdGl2ZSIsICJjIiwgInZhbHVlcyIsICJfJGxpdERpcmVjdGl2ZSQiLCAiRGlyZWN0aXZlIiwgIl9wYXJ0SW5mbyIsICJfJGlzQ29ubmVjdGVkIiwgInRoaXMiLCAiXyRwYXJlbnQiLCAicGFydCIsICJwYXJlbnQiLCAiYXR0cmlidXRlSW5kZXgiLCAiX19wYXJ0IiwgIl9fYXR0cmlidXRlSW5kZXgiLCAicHJvcHMiLCAidXBkYXRlIiwgIl9wYXJ0IiwgInJlbmRlciIsICJfQ2hpbGRQYXJ0IiwgIkNoaWxkUGFydCIsICJfJExIIiwgImlzU2luZ2xlRXhwcmVzc2lvbiIsICJwYXJ0IiwgInN0cmluZ3MiLCAiUkVTRVRfVkFMVUUiLCAic2V0Q29tbWl0dGVkVmFsdWUiLCAicGFydCIsICJ2YWx1ZSIsICJfJGNvbW1pdHRlZFZhbHVlIiwgImxpdmUiLCAiZGlyZWN0aXZlIiwgIkRpcmVjdGl2ZSIsICJwYXJ0SW5mbyIsICJzdXBlciIsICJ0eXBlIiwgIlBhcnRUeXBlIiwgIlBST1BFUlRZIiwgIkFUVFJJQlVURSIsICJCT09MRUFOX0FUVFJJQlVURSIsICJFcnJvciIsICJpc1NpbmdsZUV4cHJlc3Npb24iLCAidmFsdWUiLCAicGFydCIsICJub0NoYW5nZSIsICJub3RoaW5nIiwgImVsZW1lbnQiLCAibmFtZSIsICJoYXNBdHRyaWJ1dGUiLCAiZ2V0QXR0cmlidXRlIiwgIlN0cmluZyIsICJzZXRDb21taXR0ZWRWYWx1ZSIsICJleHBsYW5NYWluIiwgImUiLCAibCIsICJ4IiwgInMiLCAicHJlY2lzaW9uIiwgIngiLCAicyIsICJwcmVjaXNpb24iLCAieCIsICJzIiwgImV4cGxhbk1haW4iLCAiYSIsICJiIiwgImVycm9yIiwgImwiLCAiZSIsICJleHBsYW5NYWluIiwgImciLCAiZiIsICJlIiwgIl8iLCAiZSIsICJhIiwgImIiLCAiaSIsICJlIiwgImV4cGxhbk1haW4iLCAiYSIsICJiIiwgImEiLCAiYiIsICJjIiwgInAiLCAicCIsICJzIiwgInQiLCAicyIsICJzIiwgInQiLCAiZCIsICJ0b0pTT04iLCAiXyIsICJmcm9tSlNPTiIsICJsIiwgImUiLCAibiIsICJpIiwgInQiLCAiYSIsICJiIiwgImEiLCAiYiIsICJlIiwgIl8iLCAieCIsICJpIiwgImUiLCAidGVtcGxhdGUiLCAidCIsICJmdXp6eXNvcnQiLCAidiIsICJ4IiwgInkiLCAicCIsICJkaWZmZXJlbmNlIiwgImUiLCAiZSIsICJlIiwgIngiLCAiZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXgiLCAibiIsICJ5IiwgIngiLCAiYSIsICJiIiwgInAiLCAiXyIsICJkaWZmZXJlbmNlIiwgImUiLCAiY29ybmVycyIsICJyb3ciLCAicm5kSW50IiwgIm4iLCAiaSIsICJlIiwgImkiLCAiaiIsICJwIiwgInQiXQp9Cg==
