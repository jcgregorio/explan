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
        class Result22 {
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
          const result = new Result22();
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
          const result = new Result22();
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
  var DirectedEdge = class {
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
        values: this.values
      };
    }
    static FromJSON(s2) {
      return new _ResourceDefinition(s2.values);
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
    static FromJSON(s2) {
      if (s2 === void 0) {
        return new _MetricRange();
      }
      return new _MetricRange(s2.min, s2.max);
    }
  };

  // src/precision/precision.ts
  var Precision = class _Precision {
    _precision;
    constructor(precision3 = 0) {
      if (!Number.isFinite(precision3)) {
        precision3 = 0;
      }
      this._precision = Math.abs(Math.trunc(precision3));
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
    static FromJSON(s2) {
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
    constructor(defaultValue, range = new MetricRange(), isStatic = false, precision3 = new Precision(1)) {
      this.precision = precision3;
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
      return MetricDefinition.FromJSON(defn?.toJSON());
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
        vertices: this.Vertices.map((t4) => t4.toJSON()),
        edges: this.Edges.map((e3) => e3.toJSON())
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
          ...edges.bySrc.get(vertexIndex).map((e3) => {
            const successorSlack = slacks[e3.j];
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
  var template2 = (searchTaskPanel) => x`
  <input
    placeholder="Search"
    type="text"
    @input="${(e3) => searchTaskPanel.onInput(e3)}"
    @keydown="${(e3) => searchTaskPanel.onKeyDown(e3)}"
    @blur="${() => searchTaskPanel.lossOfFocus()}"
    @focus="${() => searchTaskPanel.searchInputReceivedFocus()}"
  />
  <ul>
    ${searchTaskPanel.searchResults.map(
    (task, index) => x` <li
          @click="${() => searchTaskPanel.selectSearchResult(index, false)}"
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
      B(template2(this), this);
    }
    onInput(e3) {
      const maxNameLength = this._tasks.reduce(
        (prev, task) => task.name.length > prev ? task.name.length : prev,
        0
      );
      this.searchResults = import_fuzzysort.default.go(
        e3.target.value,
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
    }
    lossOfFocus() {
      this.searchResults = [];
      B(template2(this), this);
    }
    set tasks(tasks) {
      this._tasks = tasks;
    }
    set includedIndexes(v2) {
      this._includedIndexes = new Set(v2);
    }
  };
  customElements.define("task-search-control", TaskSearchControl);

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
      this.begin = new Point(e3.pageX, e3.pageY);
    }
    mouseup(e3) {
      if (this.begin === null) {
        return;
      }
      this.finished(new Point(e3.pageX, e3.pageY));
    }
    mouseleave(e3) {
      if (this.begin === null) {
        return;
      }
      this.finished(new Point(e3.pageX, e3.pageY));
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
    mousemove(e3) {
      if (this.begin === null) {
        return;
      }
      this.currentMoveLocation.x = e3.offsetX;
      this.currentMoveLocation.y = e3.offsetY;
    }
    mousedown(e3) {
      this.internvalHandle = window.setInterval(this.onTimeout.bind(this), 16);
      this.begin = new Point(e3.offsetX, e3.offsetY);
    }
    mouseup(e3) {
      this.finished(new Point(e3.offsetX, e3.offsetY));
    }
    mouseleave(e3) {
      if (this.begin === null) {
        return;
      }
      this.finished(new Point(e3.offsetX, e3.offsetY));
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
    mousemove(e3) {
      this.currentMoveLocation.x = e3.offsetX;
      this.currentMoveLocation.y = e3.offsetY;
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
        for (let i3 = 0; i3 < this.dimensions.length; i3++) {
          if (i3 === node.dimension) {
            pointOnHyperplane[this.dimensions[i3]] = point[this.dimensions[i3]];
          } else {
            pointOnHyperplane[this.dimensions[i3]] = node.obj[this.dimensions[i3]];
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
      returnedLocation = new Point(
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
    for (let i3 = 0; i3 < 15; i3++) {
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
        const p2 = new Point(e3.offsetX, e3.offsetY);
        if (this.updateHighlightFromMousePos !== null) {
          this.setSelection(
            this.updateHighlightFromMousePos(p2, "mousedown") || -1,
            false
          );
        }
      });
      overlayCanvas.addEventListener("dblclick", (e3) => {
        const p2 = new Point(e3.offsetX, e3.offsetY);
        if (this.updateHighlightFromMousePos !== null) {
          this.setSelection(
            this.updateHighlightFromMousePos(p2, "mousedown") || -1,
            true,
            true
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2Z1enp5c29ydC9mdXp6eXNvcnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL3NyYy9saXQtaHRtbC50cyIsICIuLi9zcmMvcmVzdWx0LnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9uLnRzIiwgIi4uL3NyYy9kYWcvZGFnLnRzIiwgIi4uL3NyYy9vcHMvb3BzLnRzIiwgIi4uL3NyYy9vcHMvbWV0cmljcy50cyIsICIuLi9zcmMvb3BzL2NoYXJ0LnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9hZGRQcmVkZWNlc3Nvci50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvYWRkU3VjY2Vzc29yLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9nb3RvU2VhcmNoLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9oZWxwLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9yZXNldFpvb20udHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3Rhc2tzLnRzIiwgIi4uL3NyYy9zdHlsZS90b2dnbGVyL3RvZ2dsZXIudHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3RvZ2dsZURhcmtNb2RlLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy90b2dnbGVGb2N1cy50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvdG9nZ2xlUmFkYXIudHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3VuZG8udHMiLCAiLi4vc3JjL2FjdGlvbi9yZWdpc3RyeS50cyIsICIuLi9zcmMvYWN0aW9uL2V4ZWN1dGUudHMiLCAiLi4vc3JjL2tleW1hcC9rZXltYXAudHMiLCAiLi4vc3JjL2hlbHAvaGVscC50cyIsICIuLi9zcmMvcmVzb3VyY2VzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvaWNvbnMvaWNvbnMudHMiLCAiLi4vc3JjL29wcy9yZXNvdXJjZXMudHMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL3NyYy9kaXJlY3RpdmUudHMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL3NyYy9kaXJlY3RpdmUtaGVscGVycy50cyIsICIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvc3JjL2RpcmVjdGl2ZXMvbGl2ZS50cyIsICIuLi9zcmMvZWRpdC1yZXNvdXJjZS1kZWZpbml0aW9uL2VkaXQtcmVzb3VyY2UtZGVmaW5pdGlvbi50cyIsICIuLi9zcmMvbWV0cmljcy9yYW5nZS50cyIsICIuLi9zcmMvcHJlY2lzaW9uL3ByZWNpc2lvbi50cyIsICIuLi9zcmMvbWV0cmljcy9tZXRyaWNzLnRzIiwgIi4uL3NyYy9lZGl0LW1ldHJpY3MtZGlhbG9nL2VkaXQtbWV0cmljcy1kaWFsb2cudHMiLCAiLi4vc3JjL3JlcG9ydC1lcnJvci9yZXBvcnQtZXJyb3IudHMiLCAiLi4vc3JjL2VkaXQtbWV0cmljLWRlZmluaXRpb24vZWRpdC1tZXRyaWMtZGVmaW5pdGlvbi50cyIsICIuLi9zcmMvZGVwZW5kZW5jaWVzL2RlcGVuZGVuY2llcy1wYW5lbC50cyIsICIuLi9zcmMvZGFnL2FsZ29yaXRobXMvZGZzLnRzIiwgIi4uL3NyYy9kYWcvYWxnb3JpdGhtcy9jaXJjdWxhci50cyIsICIuLi9zcmMvYWRkLWRlcGVuZGVuY3ktZGlhbG9nL2FkZC1kZXBlbmRlbmN5LWRpYWxvZy50cyIsICIuLi9zcmMvZWRpdC1yZXNvdXJjZXMtZGlhbG9nL2VkaXQtcmVzb3VyY2VzLWRpYWxvZy50cyIsICIuLi9zcmMvZGFnL2FsZ29yaXRobXMvdG9wb3NvcnQudHMiLCAiLi4vc3JjL2NoYXJ0L2NoYXJ0LnRzIiwgIi4uL3NyYy9zdGF0cy9jZGYvdHJpYW5ndWxhci90cmlhbmd1bGFyLnRzIiwgIi4uL3NyYy9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhbi50cyIsICIuLi9zcmMvcGxhbi9wbGFuLnRzIiwgIi4uL3NyYy9zZWxlY3RlZC10YXNrLXBhbmVsL3NlbGVjdGVkLXRhc2stcGFuZWwudHMiLCAiLi4vc3JjL3NsYWNrL3NsYWNrLnRzIiwgIi4uL3NyYy9zaW11bGF0aW9uL3NpbXVsYXRpb24udHMiLCAiLi4vc3JjL3NpbXVsYXRpb24tcGFuZWwvc2ltdWxhdGlvbi1wYW5lbC50cyIsICIuLi9zcmMvc2VhcmNoL3NlYXJjaC10YXNrLXBhbmVsLnRzIiwgIi4uL3NyYy9zZWFyY2gvdGFzay1zZWFyY2gtY29udHJvbHMudHMiLCAiLi4vc3JjL3JlbmRlcmVyL3NjYWxlL3BvaW50LnRzIiwgIi4uL3NyYy9yZW5kZXJlci9kaXZpZGVybW92ZS9kaXZpZGVybW92ZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvbW91c2VkcmFnL21vdXNlZHJhZy50cyIsICIuLi9zcmMvcmVuZGVyZXIvbW91c2Vtb3ZlL21vdXNlbW92ZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvcmFuZ2UvcmFuZ2UudHMiLCAiLi4vc3JjL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHMiLCAiLi4vc3JjL3JlbmRlcmVyL2tkL2tkLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9zY2FsZS9zY2FsZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvcmVuZGVyZXIudHMiLCAiLi4vc3JjL3N0eWxlL3RoZW1lL3RoZW1lLnRzIiwgIi4uL3NyYy9nZW5lcmF0ZS9nZW5lcmF0ZS50cyIsICIuLi9zcmMvZXhwbGFuTWFpbi9leHBsYW5NYWluLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBodHRwczovL2dpdGh1Yi5jb20vZmFyemhlci9mdXp6eXNvcnQgdjMuMC4yXHJcblxyXG4vLyBVTUQgKFVuaXZlcnNhbCBNb2R1bGUgRGVmaW5pdGlvbikgZm9yIGZ1enp5c29ydFxyXG47KChyb290LCBVTUQpID0+IHtcclxuICBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShbXSwgVU1EKVxyXG4gIGVsc2UgaWYodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzID0gVU1EKClcclxuICBlbHNlIHJvb3RbJ2Z1enp5c29ydCddID0gVU1EKClcclxufSkodGhpcywgXyA9PiB7XHJcbiAgJ3VzZSBzdHJpY3QnXHJcblxyXG4gIHZhciBzaW5nbGUgPSAoc2VhcmNoLCB0YXJnZXQpID0+IHtcclxuICAgIGlmKCFzZWFyY2ggfHwgIXRhcmdldCkgcmV0dXJuIE5VTExcclxuXHJcbiAgICB2YXIgcHJlcGFyZWRTZWFyY2ggPSBnZXRQcmVwYXJlZFNlYXJjaChzZWFyY2gpXHJcbiAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgdmFyIHNlYXJjaEJpdGZsYWdzID0gcHJlcGFyZWRTZWFyY2guYml0ZmxhZ3NcclxuICAgIGlmKChzZWFyY2hCaXRmbGFncyAmIHRhcmdldC5fYml0ZmxhZ3MpICE9PSBzZWFyY2hCaXRmbGFncykgcmV0dXJuIE5VTExcclxuXHJcbiAgICByZXR1cm4gYWxnb3JpdGhtKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQpXHJcbiAgfVxyXG5cclxuICB2YXIgZ28gPSAoc2VhcmNoLCB0YXJnZXRzLCBvcHRpb25zKSA9PiB7XHJcbiAgICBpZighc2VhcmNoKSByZXR1cm4gb3B0aW9ucz8uYWxsID8gYWxsKHRhcmdldHMsIG9wdGlvbnMpIDogbm9SZXN1bHRzXHJcblxyXG4gICAgdmFyIHByZXBhcmVkU2VhcmNoID0gZ2V0UHJlcGFyZWRTZWFyY2goc2VhcmNoKVxyXG4gICAgdmFyIHNlYXJjaEJpdGZsYWdzID0gcHJlcGFyZWRTZWFyY2guYml0ZmxhZ3NcclxuICAgIHZhciBjb250YWluc1NwYWNlICA9IHByZXBhcmVkU2VhcmNoLmNvbnRhaW5zU3BhY2VcclxuXHJcbiAgICB2YXIgdGhyZXNob2xkID0gZGVub3JtYWxpemVTY29yZSggb3B0aW9ucz8udGhyZXNob2xkIHx8IDAgKVxyXG4gICAgdmFyIGxpbWl0ICAgICA9IG9wdGlvbnM/LmxpbWl0IHx8IElORklOSVRZXHJcblxyXG4gICAgdmFyIHJlc3VsdHNMZW4gPSAwOyB2YXIgbGltaXRlZENvdW50ID0gMFxyXG4gICAgdmFyIHRhcmdldHNMZW4gPSB0YXJnZXRzLmxlbmd0aFxyXG5cclxuICAgIGZ1bmN0aW9uIHB1c2hfcmVzdWx0KHJlc3VsdCkge1xyXG4gICAgICBpZihyZXN1bHRzTGVuIDwgbGltaXQpIHsgcS5hZGQocmVzdWx0KTsgKytyZXN1bHRzTGVuIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgKytsaW1pdGVkQ291bnRcclxuICAgICAgICBpZihyZXN1bHQuX3Njb3JlID4gcS5wZWVrKCkuX3Njb3JlKSBxLnJlcGxhY2VUb3AocmVzdWx0KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBjb2RlIGlzIGNvcHkvcGFzdGVkIDMgdGltZXMgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgW29wdGlvbnMua2V5LCBvcHRpb25zLmtleXMsIG5vIGtleXNdXHJcblxyXG4gICAgLy8gb3B0aW9ucy5rZXlcclxuICAgIGlmKG9wdGlvbnM/LmtleSkge1xyXG4gICAgICB2YXIga2V5ID0gb3B0aW9ucy5rZXlcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldHNMZW47ICsraSkgeyB2YXIgb2JqID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIGtleSlcclxuICAgICAgICBpZighdGFyZ2V0KSBjb250aW51ZVxyXG4gICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuXHJcbiAgICAgICAgaWYoKHNlYXJjaEJpdGZsYWdzICYgdGFyZ2V0Ll9iaXRmbGFncykgIT09IHNlYXJjaEJpdGZsYWdzKSBjb250aW51ZVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBhbGdvcml0aG0ocHJlcGFyZWRTZWFyY2gsIHRhcmdldClcclxuICAgICAgICBpZihyZXN1bHQgPT09IE5VTEwpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYocmVzdWx0Ll9zY29yZSA8IHRocmVzaG9sZCkgY29udGludWVcclxuXHJcbiAgICAgICAgcmVzdWx0Lm9iaiA9IG9ialxyXG4gICAgICAgIHB1c2hfcmVzdWx0KHJlc3VsdClcclxuICAgICAgfVxyXG5cclxuICAgIC8vIG9wdGlvbnMua2V5c1xyXG4gICAgfSBlbHNlIGlmKG9wdGlvbnM/LmtleXMpIHtcclxuICAgICAgdmFyIGtleXMgPSBvcHRpb25zLmtleXNcclxuICAgICAgdmFyIGtleXNMZW4gPSBrZXlzLmxlbmd0aFxyXG5cclxuICAgICAgb3V0ZXI6IGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRzTGVuOyArK2kpIHsgdmFyIG9iaiA9IHRhcmdldHNbaV1cclxuXHJcbiAgICAgICAgeyAvLyBlYXJseSBvdXQgYmFzZWQgb24gYml0ZmxhZ3NcclxuICAgICAgICAgIHZhciBrZXlzQml0ZmxhZ3MgPSAwXHJcbiAgICAgICAgICBmb3IgKHZhciBrZXlJID0gMDsga2V5SSA8IGtleXNMZW47ICsra2V5SSkge1xyXG4gICAgICAgICAgICB2YXIga2V5ID0ga2V5c1trZXlJXVxyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBrZXkpXHJcbiAgICAgICAgICAgIGlmKCF0YXJnZXQpIHsgdG1wVGFyZ2V0c1trZXlJXSA9IG5vVGFyZ2V0OyBjb250aW51ZSB9XHJcbiAgICAgICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuICAgICAgICAgICAgdG1wVGFyZ2V0c1trZXlJXSA9IHRhcmdldFxyXG5cclxuICAgICAgICAgICAga2V5c0JpdGZsYWdzIHw9IHRhcmdldC5fYml0ZmxhZ3NcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZigoc2VhcmNoQml0ZmxhZ3MgJiBrZXlzQml0ZmxhZ3MpICE9PSBzZWFyY2hCaXRmbGFncykgY29udGludWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGNvbnRhaW5zU3BhY2UpIGZvcihsZXQgaT0wOyBpPHByZXBhcmVkU2VhcmNoLnNwYWNlU2VhcmNoZXMubGVuZ3RoOyBpKyspIGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuXHJcbiAgICAgICAgZm9yICh2YXIga2V5SSA9IDA7IGtleUkgPCBrZXlzTGVuOyArK2tleUkpIHtcclxuICAgICAgICAgIHRhcmdldCA9IHRtcFRhcmdldHNba2V5SV1cclxuICAgICAgICAgIGlmKHRhcmdldCA9PT0gbm9UYXJnZXQpIHsgdG1wUmVzdWx0c1trZXlJXSA9IG5vVGFyZ2V0OyBjb250aW51ZSB9XHJcblxyXG4gICAgICAgICAgdG1wUmVzdWx0c1trZXlJXSA9IGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0LCAvKmFsbG93U3BhY2VzPSovZmFsc2UsIC8qYWxsb3dQYXJ0aWFsTWF0Y2g9Ki9jb250YWluc1NwYWNlKVxyXG4gICAgICAgICAgaWYodG1wUmVzdWx0c1trZXlJXSA9PT0gTlVMTCkgeyB0bXBSZXN1bHRzW2tleUldID0gbm9UYXJnZXQ7IGNvbnRpbnVlIH1cclxuXHJcbiAgICAgICAgICAvLyB0b2RvOiB0aGlzIHNlZW1zIHdlaXJkIGFuZCB3cm9uZy4gbGlrZSB3aGF0IGlmIG91ciBmaXJzdCBtYXRjaCB3YXNuJ3QgZ29vZC4gdGhpcyBzaG91bGQganVzdCByZXBsYWNlIGl0IGluc3RlYWQgb2YgYXZlcmFnaW5nIHdpdGggaXRcclxuICAgICAgICAgIC8vIGlmIG91ciBzZWNvbmQgbWF0Y2ggaXNuJ3QgZ29vZCB3ZSBpZ25vcmUgaXQgaW5zdGVhZCBvZiBhdmVyYWdpbmcgd2l0aCBpdFxyXG4gICAgICAgICAgaWYoY29udGFpbnNTcGFjZSkgZm9yKGxldCBpPTA7IGk8cHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZihhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA+IC0xMDAwKSB7XHJcbiAgICAgICAgICAgICAgaWYoa2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPiBORUdBVElWRV9JTkZJTklUWSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRtcCA9IChrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSArIGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldKSAvIDQvKmJvbnVzIHNjb3JlIGZvciBoYXZpbmcgbXVsdGlwbGUgbWF0Y2hlcyovXHJcbiAgICAgICAgICAgICAgICBpZih0bXAgPiBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSkga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPSB0bXBcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0gPiBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSkga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPSBhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoY29udGFpbnNTcGFjZSkge1xyXG4gICAgICAgICAgZm9yKGxldCBpPTA7IGk8cHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlcy5sZW5ndGg7IGkrKykgeyBpZihrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA9PT0gTkVHQVRJVkVfSU5GSU5JVFkpIGNvbnRpbnVlIG91dGVyIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdmFyIGhhc0F0TGVhc3QxTWF0Y2ggPSBmYWxzZVxyXG4gICAgICAgICAgZm9yKGxldCBpPTA7IGkgPCBrZXlzTGVuOyBpKyspIHsgaWYodG1wUmVzdWx0c1tpXS5fc2NvcmUgIT09IE5FR0FUSVZFX0lORklOSVRZKSB7IGhhc0F0TGVhc3QxTWF0Y2ggPSB0cnVlOyBicmVhayB9IH1cclxuICAgICAgICAgIGlmKCFoYXNBdExlYXN0MU1hdGNoKSBjb250aW51ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIG9ialJlc3VsdHMgPSBuZXcgS2V5c1Jlc3VsdChrZXlzTGVuKVxyXG4gICAgICAgIGZvcihsZXQgaT0wOyBpIDwga2V5c0xlbjsgaSsrKSB7IG9ialJlc3VsdHNbaV0gPSB0bXBSZXN1bHRzW2ldIH1cclxuXHJcbiAgICAgICAgaWYoY29udGFpbnNTcGFjZSkge1xyXG4gICAgICAgICAgdmFyIHNjb3JlID0gMFxyXG4gICAgICAgICAgZm9yKGxldCBpPTA7IGk8cHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlcy5sZW5ndGg7IGkrKykgc2NvcmUgKz0ga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gdG9kbyBjb3VsZCByZXdyaXRlIHRoaXMgc2NvcmluZyB0byBiZSBtb3JlIHNpbWlsYXIgdG8gd2hlbiB0aGVyZSdzIHNwYWNlc1xyXG4gICAgICAgICAgLy8gaWYgd2UgbWF0Y2ggbXVsdGlwbGUga2V5cyBnaXZlIHVzIGJvbnVzIHBvaW50c1xyXG4gICAgICAgICAgdmFyIHNjb3JlID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgICAgIGZvcihsZXQgaT0wOyBpPGtleXNMZW47IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gb2JqUmVzdWx0c1tpXVxyXG4gICAgICAgICAgICBpZihyZXN1bHQuX3Njb3JlID4gLTEwMDApIHtcclxuICAgICAgICAgICAgICBpZihzY29yZSA+IE5FR0FUSVZFX0lORklOSVRZKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG1wID0gKHNjb3JlICsgcmVzdWx0Ll9zY29yZSkgLyA0Lypib251cyBzY29yZSBmb3IgaGF2aW5nIG11bHRpcGxlIG1hdGNoZXMqL1xyXG4gICAgICAgICAgICAgICAgaWYodG1wID4gc2NvcmUpIHNjb3JlID0gdG1wXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHJlc3VsdC5fc2NvcmUgPiBzY29yZSkgc2NvcmUgPSByZXN1bHQuX3Njb3JlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvYmpSZXN1bHRzLm9iaiA9IG9ialxyXG4gICAgICAgIG9ialJlc3VsdHMuX3Njb3JlID0gc2NvcmVcclxuICAgICAgICBpZihvcHRpb25zPy5zY29yZUZuKSB7XHJcbiAgICAgICAgICBzY29yZSA9IG9wdGlvbnMuc2NvcmVGbihvYmpSZXN1bHRzKVxyXG4gICAgICAgICAgaWYoIXNjb3JlKSBjb250aW51ZVxyXG4gICAgICAgICAgc2NvcmUgPSBkZW5vcm1hbGl6ZVNjb3JlKHNjb3JlKVxyXG4gICAgICAgICAgb2JqUmVzdWx0cy5fc2NvcmUgPSBzY29yZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoc2NvcmUgPCB0aHJlc2hvbGQpIGNvbnRpbnVlXHJcbiAgICAgICAgcHVzaF9yZXN1bHQob2JqUmVzdWx0cylcclxuICAgICAgfVxyXG5cclxuICAgIC8vIG5vIGtleXNcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRzTGVuOyArK2kpIHsgdmFyIHRhcmdldCA9IHRhcmdldHNbaV1cclxuICAgICAgICBpZighdGFyZ2V0KSBjb250aW51ZVxyXG4gICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuXHJcbiAgICAgICAgaWYoKHNlYXJjaEJpdGZsYWdzICYgdGFyZ2V0Ll9iaXRmbGFncykgIT09IHNlYXJjaEJpdGZsYWdzKSBjb250aW51ZVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBhbGdvcml0aG0ocHJlcGFyZWRTZWFyY2gsIHRhcmdldClcclxuICAgICAgICBpZihyZXN1bHQgPT09IE5VTEwpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYocmVzdWx0Ll9zY29yZSA8IHRocmVzaG9sZCkgY29udGludWVcclxuXHJcbiAgICAgICAgcHVzaF9yZXN1bHQocmVzdWx0KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYocmVzdWx0c0xlbiA9PT0gMCkgcmV0dXJuIG5vUmVzdWx0c1xyXG4gICAgdmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkocmVzdWx0c0xlbilcclxuICAgIGZvcih2YXIgaSA9IHJlc3VsdHNMZW4gLSAxOyBpID49IDA7IC0taSkgcmVzdWx0c1tpXSA9IHEucG9sbCgpXHJcbiAgICByZXN1bHRzLnRvdGFsID0gcmVzdWx0c0xlbiArIGxpbWl0ZWRDb3VudFxyXG4gICAgcmV0dXJuIHJlc3VsdHNcclxuICB9XHJcblxyXG5cclxuICAvLyB0aGlzIGlzIHdyaXR0ZW4gYXMgMSBmdW5jdGlvbiBpbnN0ZWFkIG9mIDIgZm9yIG1pbmlmaWNhdGlvbi4gcGVyZiBzZWVtcyBmaW5lIC4uLlxyXG4gIC8vIGV4Y2VwdCB3aGVuIG1pbmlmaWVkLiB0aGUgcGVyZiBpcyB2ZXJ5IHNsb3dcclxuICB2YXIgaGlnaGxpZ2h0ID0gKHJlc3VsdCwgb3Blbj0nPGI+JywgY2xvc2U9JzwvYj4nKSA9PiB7XHJcbiAgICB2YXIgY2FsbGJhY2sgPSB0eXBlb2Ygb3BlbiA9PT0gJ2Z1bmN0aW9uJyA/IG9wZW4gOiB1bmRlZmluZWRcclxuXHJcbiAgICB2YXIgdGFyZ2V0ICAgICAgPSByZXN1bHQudGFyZ2V0XHJcbiAgICB2YXIgdGFyZ2V0TGVuICAgPSB0YXJnZXQubGVuZ3RoXHJcbiAgICB2YXIgaW5kZXhlcyAgICAgPSByZXN1bHQuaW5kZXhlc1xyXG4gICAgdmFyIGhpZ2hsaWdodGVkID0gJydcclxuICAgIHZhciBtYXRjaEkgICAgICA9IDBcclxuICAgIHZhciBpbmRleGVzSSAgICA9IDBcclxuICAgIHZhciBvcGVuZWQgICAgICA9IGZhbHNlXHJcbiAgICB2YXIgcGFydHMgICAgICAgPSBbXVxyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRMZW47ICsraSkgeyB2YXIgY2hhciA9IHRhcmdldFtpXVxyXG4gICAgICBpZihpbmRleGVzW2luZGV4ZXNJXSA9PT0gaSkge1xyXG4gICAgICAgICsraW5kZXhlc0lcclxuICAgICAgICBpZighb3BlbmVkKSB7IG9wZW5lZCA9IHRydWVcclxuICAgICAgICAgIGlmKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHBhcnRzLnB1c2goaGlnaGxpZ2h0ZWQpOyBoaWdobGlnaHRlZCA9ICcnXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoaWdobGlnaHRlZCArPSBvcGVuXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihpbmRleGVzSSA9PT0gaW5kZXhlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIGlmKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IGNoYXJcclxuICAgICAgICAgICAgcGFydHMucHVzaChjYWxsYmFjayhoaWdobGlnaHRlZCwgbWF0Y2hJKyspKTsgaGlnaGxpZ2h0ZWQgPSAnJ1xyXG4gICAgICAgICAgICBwYXJ0cy5wdXNoKHRhcmdldC5zdWJzdHIoaSsxKSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IGNoYXIgKyBjbG9zZSArIHRhcmdldC5zdWJzdHIoaSsxKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYob3BlbmVkKSB7IG9wZW5lZCA9IGZhbHNlXHJcbiAgICAgICAgICBpZihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGNhbGxiYWNrKGhpZ2hsaWdodGVkLCBtYXRjaEkrKykpOyBoaWdobGlnaHRlZCA9ICcnXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoaWdobGlnaHRlZCArPSBjbG9zZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBoaWdobGlnaHRlZCArPSBjaGFyXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNhbGxiYWNrID8gcGFydHMgOiBoaWdobGlnaHRlZFxyXG4gIH1cclxuXHJcblxyXG4gIHZhciBwcmVwYXJlID0gKHRhcmdldCkgPT4ge1xyXG4gICAgaWYodHlwZW9mIHRhcmdldCA9PT0gJ251bWJlcicpIHRhcmdldCA9ICcnK3RhcmdldFxyXG4gICAgZWxzZSBpZih0eXBlb2YgdGFyZ2V0ICE9PSAnc3RyaW5nJykgdGFyZ2V0ID0gJydcclxuICAgIHZhciBpbmZvID0gcHJlcGFyZUxvd2VySW5mbyh0YXJnZXQpXHJcbiAgICByZXR1cm4gbmV3X3Jlc3VsdCh0YXJnZXQsIHtfdGFyZ2V0TG93ZXI6aW5mby5fbG93ZXIsIF90YXJnZXRMb3dlckNvZGVzOmluZm8ubG93ZXJDb2RlcywgX2JpdGZsYWdzOmluZm8uYml0ZmxhZ3N9KVxyXG4gIH1cclxuXHJcbiAgdmFyIGNsZWFudXAgPSAoKSA9PiB7IHByZXBhcmVkQ2FjaGUuY2xlYXIoKTsgcHJlcGFyZWRTZWFyY2hDYWNoZS5jbGVhcigpIH1cclxuXHJcblxyXG4gIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcbiAgLy8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcclxuICAvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxyXG4gIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcblxyXG5cclxuICBjbGFzcyBSZXN1bHQge1xyXG4gICAgZ2V0IFsnaW5kZXhlcyddKCkgeyByZXR1cm4gdGhpcy5faW5kZXhlcy5zbGljZSgwLCB0aGlzLl9pbmRleGVzLmxlbikuc29ydCgoYSxiKT0+YS1iKSB9XHJcbiAgICBzZXQgWydpbmRleGVzJ10oaW5kZXhlcykgeyByZXR1cm4gdGhpcy5faW5kZXhlcyA9IGluZGV4ZXMgfVxyXG4gICAgWydoaWdobGlnaHQnXShvcGVuLCBjbG9zZSkgeyByZXR1cm4gaGlnaGxpZ2h0KHRoaXMsIG9wZW4sIGNsb3NlKSB9XHJcbiAgICBnZXQgWydzY29yZSddKCkgeyByZXR1cm4gbm9ybWFsaXplU2NvcmUodGhpcy5fc2NvcmUpIH1cclxuICAgIHNldCBbJ3Njb3JlJ10oc2NvcmUpIHsgdGhpcy5fc2NvcmUgPSBkZW5vcm1hbGl6ZVNjb3JlKHNjb3JlKSB9XHJcbiAgfVxyXG5cclxuICBjbGFzcyBLZXlzUmVzdWx0IGV4dGVuZHMgQXJyYXkge1xyXG4gICAgZ2V0IFsnc2NvcmUnXSgpIHsgcmV0dXJuIG5vcm1hbGl6ZVNjb3JlKHRoaXMuX3Njb3JlKSB9XHJcbiAgICBzZXQgWydzY29yZSddKHNjb3JlKSB7IHRoaXMuX3Njb3JlID0gZGVub3JtYWxpemVTY29yZShzY29yZSkgfVxyXG4gIH1cclxuXHJcbiAgdmFyIG5ld19yZXN1bHQgPSAodGFyZ2V0LCBvcHRpb25zKSA9PiB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgUmVzdWx0KClcclxuICAgIHJlc3VsdFsndGFyZ2V0J10gICAgICAgICAgICAgPSB0YXJnZXRcclxuICAgIHJlc3VsdFsnb2JqJ10gICAgICAgICAgICAgICAgPSBvcHRpb25zLm9iaiAgICAgICAgICAgICAgICAgICA/PyBOVUxMXHJcbiAgICByZXN1bHQuX3Njb3JlICAgICAgICAgICAgICAgID0gb3B0aW9ucy5fc2NvcmUgICAgICAgICAgICAgICAgPz8gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgIHJlc3VsdC5faW5kZXhlcyAgICAgICAgICAgICAgPSBvcHRpb25zLl9pbmRleGVzICAgICAgICAgICAgICA/PyBbXVxyXG4gICAgcmVzdWx0Ll90YXJnZXRMb3dlciAgICAgICAgICA9IG9wdGlvbnMuX3RhcmdldExvd2VyICAgICAgICAgID8/ICcnXHJcbiAgICByZXN1bHQuX3RhcmdldExvd2VyQ29kZXMgICAgID0gb3B0aW9ucy5fdGFyZ2V0TG93ZXJDb2RlcyAgICAgPz8gTlVMTFxyXG4gICAgcmVzdWx0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlcyA9IG9wdGlvbnMuX25leHRCZWdpbm5pbmdJbmRleGVzID8/IE5VTExcclxuICAgIHJlc3VsdC5fYml0ZmxhZ3MgICAgICAgICAgICAgPSBvcHRpb25zLl9iaXRmbGFncyAgICAgICAgICAgICA/PyAwXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIG5vcm1hbGl6ZVNjb3JlID0gc2NvcmUgPT4ge1xyXG4gICAgaWYoc2NvcmUgPT09IE5FR0FUSVZFX0lORklOSVRZKSByZXR1cm4gMFxyXG4gICAgaWYoc2NvcmUgPiAxKSByZXR1cm4gc2NvcmVcclxuICAgIHJldHVybiBNYXRoLkUgKiogKCAoKC1zY29yZSArIDEpKiouMDQzMDcgLSAxKSAqIC0yKVxyXG4gIH1cclxuICB2YXIgZGVub3JtYWxpemVTY29yZSA9IG5vcm1hbGl6ZWRTY29yZSA9PiB7XHJcbiAgICBpZihub3JtYWxpemVkU2NvcmUgPT09IDApIHJldHVybiBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgaWYobm9ybWFsaXplZFNjb3JlID4gMSkgcmV0dXJuIG5vcm1hbGl6ZWRTY29yZVxyXG4gICAgcmV0dXJuIDEgLSBNYXRoLnBvdygoTWF0aC5sb2cobm9ybWFsaXplZFNjb3JlKSAvIC0yICsgMSksIDEgLyAwLjA0MzA3KVxyXG4gIH1cclxuXHJcblxyXG4gIHZhciBwcmVwYXJlU2VhcmNoID0gKHNlYXJjaCkgPT4ge1xyXG4gICAgaWYodHlwZW9mIHNlYXJjaCA9PT0gJ251bWJlcicpIHNlYXJjaCA9ICcnK3NlYXJjaFxyXG4gICAgZWxzZSBpZih0eXBlb2Ygc2VhcmNoICE9PSAnc3RyaW5nJykgc2VhcmNoID0gJydcclxuICAgIHNlYXJjaCA9IHNlYXJjaC50cmltKClcclxuICAgIHZhciBpbmZvID0gcHJlcGFyZUxvd2VySW5mbyhzZWFyY2gpXHJcblxyXG4gICAgdmFyIHNwYWNlU2VhcmNoZXMgPSBbXVxyXG4gICAgaWYoaW5mby5jb250YWluc1NwYWNlKSB7XHJcbiAgICAgIHZhciBzZWFyY2hlcyA9IHNlYXJjaC5zcGxpdCgvXFxzKy8pXHJcbiAgICAgIHNlYXJjaGVzID0gWy4uLm5ldyBTZXQoc2VhcmNoZXMpXSAvLyBkaXN0aW5jdFxyXG4gICAgICBmb3IodmFyIGk9MDsgaTxzZWFyY2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmKHNlYXJjaGVzW2ldID09PSAnJykgY29udGludWVcclxuICAgICAgICB2YXIgX2luZm8gPSBwcmVwYXJlTG93ZXJJbmZvKHNlYXJjaGVzW2ldKVxyXG4gICAgICAgIHNwYWNlU2VhcmNoZXMucHVzaCh7bG93ZXJDb2RlczpfaW5mby5sb3dlckNvZGVzLCBfbG93ZXI6c2VhcmNoZXNbaV0udG9Mb3dlckNhc2UoKSwgY29udGFpbnNTcGFjZTpmYWxzZX0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge2xvd2VyQ29kZXM6IGluZm8ubG93ZXJDb2RlcywgX2xvd2VyOiBpbmZvLl9sb3dlciwgY29udGFpbnNTcGFjZTogaW5mby5jb250YWluc1NwYWNlLCBiaXRmbGFnczogaW5mby5iaXRmbGFncywgc3BhY2VTZWFyY2hlczogc3BhY2VTZWFyY2hlc31cclxuICB9XHJcblxyXG5cclxuXHJcbiAgdmFyIGdldFByZXBhcmVkID0gKHRhcmdldCkgPT4ge1xyXG4gICAgaWYodGFyZ2V0Lmxlbmd0aCA+IDk5OSkgcmV0dXJuIHByZXBhcmUodGFyZ2V0KSAvLyBkb24ndCBjYWNoZSBodWdlIHRhcmdldHNcclxuICAgIHZhciB0YXJnZXRQcmVwYXJlZCA9IHByZXBhcmVkQ2FjaGUuZ2V0KHRhcmdldClcclxuICAgIGlmKHRhcmdldFByZXBhcmVkICE9PSB1bmRlZmluZWQpIHJldHVybiB0YXJnZXRQcmVwYXJlZFxyXG4gICAgdGFyZ2V0UHJlcGFyZWQgPSBwcmVwYXJlKHRhcmdldClcclxuICAgIHByZXBhcmVkQ2FjaGUuc2V0KHRhcmdldCwgdGFyZ2V0UHJlcGFyZWQpXHJcbiAgICByZXR1cm4gdGFyZ2V0UHJlcGFyZWRcclxuICB9XHJcbiAgdmFyIGdldFByZXBhcmVkU2VhcmNoID0gKHNlYXJjaCkgPT4ge1xyXG4gICAgaWYoc2VhcmNoLmxlbmd0aCA+IDk5OSkgcmV0dXJuIHByZXBhcmVTZWFyY2goc2VhcmNoKSAvLyBkb24ndCBjYWNoZSBodWdlIHNlYXJjaGVzXHJcbiAgICB2YXIgc2VhcmNoUHJlcGFyZWQgPSBwcmVwYXJlZFNlYXJjaENhY2hlLmdldChzZWFyY2gpXHJcbiAgICBpZihzZWFyY2hQcmVwYXJlZCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gc2VhcmNoUHJlcGFyZWRcclxuICAgIHNlYXJjaFByZXBhcmVkID0gcHJlcGFyZVNlYXJjaChzZWFyY2gpXHJcbiAgICBwcmVwYXJlZFNlYXJjaENhY2hlLnNldChzZWFyY2gsIHNlYXJjaFByZXBhcmVkKVxyXG4gICAgcmV0dXJuIHNlYXJjaFByZXBhcmVkXHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIGFsbCA9ICh0YXJnZXRzLCBvcHRpb25zKSA9PiB7XHJcbiAgICB2YXIgcmVzdWx0cyA9IFtdOyByZXN1bHRzLnRvdGFsID0gdGFyZ2V0cy5sZW5ndGggLy8gdGhpcyB0b3RhbCBjYW4gYmUgd3JvbmcgaWYgc29tZSB0YXJnZXRzIGFyZSBza2lwcGVkXHJcblxyXG4gICAgdmFyIGxpbWl0ID0gb3B0aW9ucz8ubGltaXQgfHwgSU5GSU5JVFlcclxuXHJcbiAgICBpZihvcHRpb25zPy5rZXkpIHtcclxuICAgICAgZm9yKHZhciBpPTA7aTx0YXJnZXRzLmxlbmd0aDtpKyspIHsgdmFyIG9iaiA9IHRhcmdldHNbaV1cclxuICAgICAgICB2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBvcHRpb25zLmtleSlcclxuICAgICAgICBpZih0YXJnZXQgPT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ld19yZXN1bHQodGFyZ2V0LnRhcmdldCwge19zY29yZTogdGFyZ2V0Ll9zY29yZSwgb2JqOiBvYmp9KVxyXG4gICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpOyBpZihyZXN1bHRzLmxlbmd0aCA+PSBsaW1pdCkgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmKG9wdGlvbnM/LmtleXMpIHtcclxuICAgICAgZm9yKHZhciBpPTA7aTx0YXJnZXRzLmxlbmd0aDtpKyspIHsgdmFyIG9iaiA9IHRhcmdldHNbaV1cclxuICAgICAgICB2YXIgb2JqUmVzdWx0cyA9IG5ldyBLZXlzUmVzdWx0KG9wdGlvbnMua2V5cy5sZW5ndGgpXHJcbiAgICAgICAgZm9yICh2YXIga2V5SSA9IG9wdGlvbnMua2V5cy5sZW5ndGggLSAxOyBrZXlJID49IDA7IC0ta2V5SSkge1xyXG4gICAgICAgICAgdmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwgb3B0aW9ucy5rZXlzW2tleUldKVxyXG4gICAgICAgICAgaWYoIXRhcmdldCkgeyBvYmpSZXN1bHRzW2tleUldID0gbm9UYXJnZXQ7IGNvbnRpbnVlIH1cclxuICAgICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuICAgICAgICAgIHRhcmdldC5fc2NvcmUgPSBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgICAgICAgdGFyZ2V0Ll9pbmRleGVzLmxlbiA9IDBcclxuICAgICAgICAgIG9ialJlc3VsdHNba2V5SV0gPSB0YXJnZXRcclxuICAgICAgICB9XHJcbiAgICAgICAgb2JqUmVzdWx0cy5vYmogPSBvYmpcclxuICAgICAgICBvYmpSZXN1bHRzLl9zY29yZSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKG9ialJlc3VsdHMpOyBpZihyZXN1bHRzLmxlbmd0aCA+PSBsaW1pdCkgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yKHZhciBpPTA7aTx0YXJnZXRzLmxlbmd0aDtpKyspIHsgdmFyIHRhcmdldCA9IHRhcmdldHNbaV1cclxuICAgICAgICBpZih0YXJnZXQgPT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcbiAgICAgICAgdGFyZ2V0Ll9zY29yZSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgICAgdGFyZ2V0Ll9pbmRleGVzLmxlbiA9IDBcclxuICAgICAgICByZXN1bHRzLnB1c2godGFyZ2V0KTsgaWYocmVzdWx0cy5sZW5ndGggPj0gbGltaXQpIHJldHVybiByZXN1bHRzXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0c1xyXG4gIH1cclxuXHJcblxyXG4gIHZhciBhbGdvcml0aG0gPSAocHJlcGFyZWRTZWFyY2gsIHByZXBhcmVkLCBhbGxvd1NwYWNlcz1mYWxzZSwgYWxsb3dQYXJ0aWFsTWF0Y2g9ZmFsc2UpID0+IHtcclxuICAgIGlmKGFsbG93U3BhY2VzPT09ZmFsc2UgJiYgcHJlcGFyZWRTZWFyY2guY29udGFpbnNTcGFjZSkgcmV0dXJuIGFsZ29yaXRobVNwYWNlcyhwcmVwYXJlZFNlYXJjaCwgcHJlcGFyZWQsIGFsbG93UGFydGlhbE1hdGNoKVxyXG5cclxuICAgIHZhciBzZWFyY2hMb3dlciAgICAgID0gcHJlcGFyZWRTZWFyY2guX2xvd2VyXHJcbiAgICB2YXIgc2VhcmNoTG93ZXJDb2RlcyA9IHByZXBhcmVkU2VhcmNoLmxvd2VyQ29kZXNcclxuICAgIHZhciBzZWFyY2hMb3dlckNvZGUgID0gc2VhcmNoTG93ZXJDb2Rlc1swXVxyXG4gICAgdmFyIHRhcmdldExvd2VyQ29kZXMgPSBwcmVwYXJlZC5fdGFyZ2V0TG93ZXJDb2Rlc1xyXG4gICAgdmFyIHNlYXJjaExlbiAgICAgICAgPSBzZWFyY2hMb3dlckNvZGVzLmxlbmd0aFxyXG4gICAgdmFyIHRhcmdldExlbiAgICAgICAgPSB0YXJnZXRMb3dlckNvZGVzLmxlbmd0aFxyXG4gICAgdmFyIHNlYXJjaEkgICAgICAgICAgPSAwIC8vIHdoZXJlIHdlIGF0XHJcbiAgICB2YXIgdGFyZ2V0SSAgICAgICAgICA9IDAgLy8gd2hlcmUgeW91IGF0XHJcbiAgICB2YXIgbWF0Y2hlc1NpbXBsZUxlbiA9IDBcclxuXHJcbiAgICAvLyB2ZXJ5IGJhc2ljIGZ1enp5IG1hdGNoOyB0byByZW1vdmUgbm9uLW1hdGNoaW5nIHRhcmdldHMgQVNBUCFcclxuICAgIC8vIHdhbGsgdGhyb3VnaCB0YXJnZXQuIGZpbmQgc2VxdWVudGlhbCBtYXRjaGVzLlxyXG4gICAgLy8gaWYgYWxsIGNoYXJzIGFyZW4ndCBmb3VuZCB0aGVuIGV4aXRcclxuICAgIGZvcig7Oykge1xyXG4gICAgICB2YXIgaXNNYXRjaCA9IHNlYXJjaExvd2VyQ29kZSA9PT0gdGFyZ2V0TG93ZXJDb2Rlc1t0YXJnZXRJXVxyXG4gICAgICBpZihpc01hdGNoKSB7XHJcbiAgICAgICAgbWF0Y2hlc1NpbXBsZVttYXRjaGVzU2ltcGxlTGVuKytdID0gdGFyZ2V0SVxyXG4gICAgICAgICsrc2VhcmNoSTsgaWYoc2VhcmNoSSA9PT0gc2VhcmNoTGVuKSBicmVha1xyXG4gICAgICAgIHNlYXJjaExvd2VyQ29kZSA9IHNlYXJjaExvd2VyQ29kZXNbc2VhcmNoSV1cclxuICAgICAgfVxyXG4gICAgICArK3RhcmdldEk7IGlmKHRhcmdldEkgPj0gdGFyZ2V0TGVuKSByZXR1cm4gTlVMTCAvLyBGYWlsZWQgdG8gZmluZCBzZWFyY2hJXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlYXJjaEkgPSAwXHJcbiAgICB2YXIgc3VjY2Vzc1N0cmljdCA9IGZhbHNlXHJcbiAgICB2YXIgbWF0Y2hlc1N0cmljdExlbiA9IDBcclxuXHJcbiAgICB2YXIgbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBwcmVwYXJlZC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNcclxuICAgIGlmKG5leHRCZWdpbm5pbmdJbmRleGVzID09PSBOVUxMKSBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVkLl9uZXh0QmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVOZXh0QmVnaW5uaW5nSW5kZXhlcyhwcmVwYXJlZC50YXJnZXQpXHJcbiAgICB0YXJnZXRJID0gbWF0Y2hlc1NpbXBsZVswXT09PTAgPyAwIDogbmV4dEJlZ2lubmluZ0luZGV4ZXNbbWF0Y2hlc1NpbXBsZVswXS0xXVxyXG5cclxuICAgIC8vIE91ciB0YXJnZXQgc3RyaW5nIHN1Y2Nlc3NmdWxseSBtYXRjaGVkIGFsbCBjaGFyYWN0ZXJzIGluIHNlcXVlbmNlIVxyXG4gICAgLy8gTGV0J3MgdHJ5IGEgbW9yZSBhZHZhbmNlZCBhbmQgc3RyaWN0IHRlc3QgdG8gaW1wcm92ZSB0aGUgc2NvcmVcclxuICAgIC8vIG9ubHkgY291bnQgaXQgYXMgYSBtYXRjaCBpZiBpdCdzIGNvbnNlY3V0aXZlIG9yIGEgYmVnaW5uaW5nIGNoYXJhY3RlciFcclxuICAgIHZhciBiYWNrdHJhY2tDb3VudCA9IDBcclxuICAgIGlmKHRhcmdldEkgIT09IHRhcmdldExlbikgZm9yKDs7KSB7XHJcbiAgICAgIGlmKHRhcmdldEkgPj0gdGFyZ2V0TGVuKSB7XHJcbiAgICAgICAgLy8gV2UgZmFpbGVkIHRvIGZpbmQgYSBnb29kIHNwb3QgZm9yIHRoaXMgc2VhcmNoIGNoYXIsIGdvIGJhY2sgdG8gdGhlIHByZXZpb3VzIHNlYXJjaCBjaGFyIGFuZCBmb3JjZSBpdCBmb3J3YXJkXHJcbiAgICAgICAgaWYoc2VhcmNoSSA8PSAwKSBicmVhayAvLyBXZSBmYWlsZWQgdG8gcHVzaCBjaGFycyBmb3J3YXJkIGZvciBhIGJldHRlciBtYXRjaFxyXG5cclxuICAgICAgICArK2JhY2t0cmFja0NvdW50OyBpZihiYWNrdHJhY2tDb3VudCA+IDIwMCkgYnJlYWsgLy8gZXhwb25lbnRpYWwgYmFja3RyYWNraW5nIGlzIHRha2luZyB0b28gbG9uZywganVzdCBnaXZlIHVwIGFuZCByZXR1cm4gYSBiYWQgbWF0Y2hcclxuXHJcbiAgICAgICAgLS1zZWFyY2hJXHJcbiAgICAgICAgdmFyIGxhc3RNYXRjaCA9IG1hdGNoZXNTdHJpY3RbLS1tYXRjaGVzU3RyaWN0TGVuXVxyXG4gICAgICAgIHRhcmdldEkgPSBuZXh0QmVnaW5uaW5nSW5kZXhlc1tsYXN0TWF0Y2hdXHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBpc01hdGNoID0gc2VhcmNoTG93ZXJDb2Rlc1tzZWFyY2hJXSA9PT0gdGFyZ2V0TG93ZXJDb2Rlc1t0YXJnZXRJXVxyXG4gICAgICAgIGlmKGlzTWF0Y2gpIHtcclxuICAgICAgICAgIG1hdGNoZXNTdHJpY3RbbWF0Y2hlc1N0cmljdExlbisrXSA9IHRhcmdldElcclxuICAgICAgICAgICsrc2VhcmNoSTsgaWYoc2VhcmNoSSA9PT0gc2VhcmNoTGVuKSB7IHN1Y2Nlc3NTdHJpY3QgPSB0cnVlOyBicmVhayB9XHJcbiAgICAgICAgICArK3RhcmdldElcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGFyZ2V0SSA9IG5leHRCZWdpbm5pbmdJbmRleGVzW3RhcmdldEldXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgaXQncyBhIHN1YnN0cmluZyBtYXRjaFxyXG4gICAgdmFyIHN1YnN0cmluZ0luZGV4ID0gc2VhcmNoTGVuIDw9IDEgPyAtMSA6IHByZXBhcmVkLl90YXJnZXRMb3dlci5pbmRleE9mKHNlYXJjaExvd2VyLCBtYXRjaGVzU2ltcGxlWzBdKSAvLyBwZXJmOiB0aGlzIGlzIHNsb3dcclxuICAgIHZhciBpc1N1YnN0cmluZyA9ICEhfnN1YnN0cmluZ0luZGV4XHJcbiAgICB2YXIgaXNTdWJzdHJpbmdCZWdpbm5pbmcgPSAhaXNTdWJzdHJpbmcgPyBmYWxzZSA6IHN1YnN0cmluZ0luZGV4PT09MCB8fCBwcmVwYXJlZC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNbc3Vic3RyaW5nSW5kZXgtMV0gPT09IHN1YnN0cmluZ0luZGV4XHJcblxyXG4gICAgLy8gaWYgaXQncyBhIHN1YnN0cmluZyBtYXRjaCBidXQgbm90IGF0IGEgYmVnaW5uaW5nIGluZGV4LCBsZXQncyB0cnkgdG8gZmluZCBhIHN1YnN0cmluZyBzdGFydGluZyBhdCBhIGJlZ2lubmluZyBpbmRleCBmb3IgYSBiZXR0ZXIgc2NvcmVcclxuICAgIGlmKGlzU3Vic3RyaW5nICYmICFpc1N1YnN0cmluZ0JlZ2lubmluZykge1xyXG4gICAgICBmb3IodmFyIGk9MDsgaTxuZXh0QmVnaW5uaW5nSW5kZXhlcy5sZW5ndGg7IGk9bmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0pIHtcclxuICAgICAgICBpZihpIDw9IHN1YnN0cmluZ0luZGV4KSBjb250aW51ZVxyXG5cclxuICAgICAgICBmb3IodmFyIHM9MDsgczxzZWFyY2hMZW47IHMrKykgaWYoc2VhcmNoTG93ZXJDb2Rlc1tzXSAhPT0gcHJlcGFyZWQuX3RhcmdldExvd2VyQ29kZXNbaStzXSkgYnJlYWtcclxuICAgICAgICBpZihzID09PSBzZWFyY2hMZW4pIHsgc3Vic3RyaW5nSW5kZXggPSBpOyBpc1N1YnN0cmluZ0JlZ2lubmluZyA9IHRydWU7IGJyZWFrIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHRhbGx5IHVwIHRoZSBzY29yZSAmIGtlZXAgdHJhY2sgb2YgbWF0Y2hlcyBmb3IgaGlnaGxpZ2h0aW5nIGxhdGVyXHJcbiAgICAvLyBpZiBpdCdzIGEgc2ltcGxlIG1hdGNoLCB3ZSdsbCBzd2l0Y2ggdG8gYSBzdWJzdHJpbmcgbWF0Y2ggaWYgYSBzdWJzdHJpbmcgZXhpc3RzXHJcbiAgICAvLyBpZiBpdCdzIGEgc3RyaWN0IG1hdGNoLCB3ZSdsbCBzd2l0Y2ggdG8gYSBzdWJzdHJpbmcgbWF0Y2ggb25seSBpZiB0aGF0J3MgYSBiZXR0ZXIgc2NvcmVcclxuXHJcbiAgICB2YXIgY2FsY3VsYXRlU2NvcmUgPSBtYXRjaGVzID0+IHtcclxuICAgICAgdmFyIHNjb3JlID0gMFxyXG5cclxuICAgICAgdmFyIGV4dHJhTWF0Y2hHcm91cENvdW50ID0gMFxyXG4gICAgICBmb3IodmFyIGkgPSAxOyBpIDwgc2VhcmNoTGVuOyArK2kpIHtcclxuICAgICAgICBpZihtYXRjaGVzW2ldIC0gbWF0Y2hlc1tpLTFdICE9PSAxKSB7c2NvcmUgLT0gbWF0Y2hlc1tpXTsgKytleHRyYU1hdGNoR3JvdXBDb3VudH1cclxuICAgICAgfVxyXG4gICAgICB2YXIgdW5tYXRjaGVkRGlzdGFuY2UgPSBtYXRjaGVzW3NlYXJjaExlbi0xXSAtIG1hdGNoZXNbMF0gLSAoc2VhcmNoTGVuLTEpXHJcblxyXG4gICAgICBzY29yZSAtPSAoMTIrdW5tYXRjaGVkRGlzdGFuY2UpICogZXh0cmFNYXRjaEdyb3VwQ291bnQgLy8gcGVuYWxpdHkgZm9yIG1vcmUgZ3JvdXBzXHJcblxyXG4gICAgICBpZihtYXRjaGVzWzBdICE9PSAwKSBzY29yZSAtPSBtYXRjaGVzWzBdKm1hdGNoZXNbMF0qLjIgLy8gcGVuYWxpdHkgZm9yIG5vdCBzdGFydGluZyBuZWFyIHRoZSBiZWdpbm5pbmdcclxuXHJcbiAgICAgIGlmKCFzdWNjZXNzU3RyaWN0KSB7XHJcbiAgICAgICAgc2NvcmUgKj0gMTAwMFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIHN1Y2Nlc3NTdHJpY3Qgb24gYSB0YXJnZXQgd2l0aCB0b28gbWFueSBiZWdpbm5pbmcgaW5kZXhlcyBsb3NlcyBwb2ludHMgZm9yIGJlaW5nIGEgYmFkIHRhcmdldFxyXG4gICAgICAgIHZhciB1bmlxdWVCZWdpbm5pbmdJbmRleGVzID0gMVxyXG4gICAgICAgIGZvcih2YXIgaSA9IG5leHRCZWdpbm5pbmdJbmRleGVzWzBdOyBpIDwgdGFyZ2V0TGVuOyBpPW5leHRCZWdpbm5pbmdJbmRleGVzW2ldKSArK3VuaXF1ZUJlZ2lubmluZ0luZGV4ZXNcclxuXHJcbiAgICAgICAgaWYodW5pcXVlQmVnaW5uaW5nSW5kZXhlcyA+IDI0KSBzY29yZSAqPSAodW5pcXVlQmVnaW5uaW5nSW5kZXhlcy0yNCkqMTAgLy8gcXVpdGUgYXJiaXRyYXJ5IG51bWJlcnMgaGVyZSAuLi5cclxuICAgICAgfVxyXG5cclxuICAgICAgc2NvcmUgLT0gKHRhcmdldExlbiAtIHNlYXJjaExlbikvMiAvLyBwZW5hbGl0eSBmb3IgbG9uZ2VyIHRhcmdldHNcclxuXHJcbiAgICAgIGlmKGlzU3Vic3RyaW5nKSAgICAgICAgICBzY29yZSAvPSAxK3NlYXJjaExlbipzZWFyY2hMZW4qMSAvLyBib251cyBmb3IgYmVpbmcgYSBmdWxsIHN1YnN0cmluZ1xyXG4gICAgICBpZihpc1N1YnN0cmluZ0JlZ2lubmluZykgc2NvcmUgLz0gMStzZWFyY2hMZW4qc2VhcmNoTGVuKjEgLy8gYm9udXMgZm9yIHN1YnN0cmluZyBzdGFydGluZyBvbiBhIGJlZ2lubmluZ0luZGV4XHJcblxyXG4gICAgICBzY29yZSAtPSAodGFyZ2V0TGVuIC0gc2VhcmNoTGVuKS8yIC8vIHBlbmFsaXR5IGZvciBsb25nZXIgdGFyZ2V0c1xyXG5cclxuICAgICAgcmV0dXJuIHNjb3JlXHJcbiAgICB9XHJcblxyXG4gICAgaWYoIXN1Y2Nlc3NTdHJpY3QpIHtcclxuICAgICAgaWYoaXNTdWJzdHJpbmcpIGZvcih2YXIgaT0wOyBpPHNlYXJjaExlbjsgKytpKSBtYXRjaGVzU2ltcGxlW2ldID0gc3Vic3RyaW5nSW5kZXgraSAvLyBhdCB0aGlzIHBvaW50IGl0J3Mgc2FmZSB0byBvdmVyd3JpdGUgbWF0Y2hlaHNTaW1wbGUgd2l0aCBzdWJzdHIgbWF0Y2hlc1xyXG4gICAgICB2YXIgbWF0Y2hlc0Jlc3QgPSBtYXRjaGVzU2ltcGxlXHJcbiAgICAgIHZhciBzY29yZSA9IGNhbGN1bGF0ZVNjb3JlKG1hdGNoZXNCZXN0KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYoaXNTdWJzdHJpbmdCZWdpbm5pbmcpIHtcclxuICAgICAgICBmb3IodmFyIGk9MDsgaTxzZWFyY2hMZW47ICsraSkgbWF0Y2hlc1NpbXBsZVtpXSA9IHN1YnN0cmluZ0luZGV4K2kgLy8gYXQgdGhpcyBwb2ludCBpdCdzIHNhZmUgdG8gb3ZlcndyaXRlIG1hdGNoZWhzU2ltcGxlIHdpdGggc3Vic3RyIG1hdGNoZXNcclxuICAgICAgICB2YXIgbWF0Y2hlc0Jlc3QgPSBtYXRjaGVzU2ltcGxlXHJcbiAgICAgICAgdmFyIHNjb3JlID0gY2FsY3VsYXRlU2NvcmUobWF0Y2hlc1NpbXBsZSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgbWF0Y2hlc0Jlc3QgPSBtYXRjaGVzU3RyaWN0XHJcbiAgICAgICAgdmFyIHNjb3JlID0gY2FsY3VsYXRlU2NvcmUobWF0Y2hlc1N0cmljdClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByZXBhcmVkLl9zY29yZSA9IHNjb3JlXHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHNlYXJjaExlbjsgKytpKSBwcmVwYXJlZC5faW5kZXhlc1tpXSA9IG1hdGNoZXNCZXN0W2ldXHJcbiAgICBwcmVwYXJlZC5faW5kZXhlcy5sZW4gPSBzZWFyY2hMZW5cclxuXHJcbiAgICBjb25zdCByZXN1bHQgICAgPSBuZXcgUmVzdWx0KClcclxuICAgIHJlc3VsdC50YXJnZXQgICA9IHByZXBhcmVkLnRhcmdldFxyXG4gICAgcmVzdWx0Ll9zY29yZSAgID0gcHJlcGFyZWQuX3Njb3JlXHJcbiAgICByZXN1bHQuX2luZGV4ZXMgPSBwcmVwYXJlZC5faW5kZXhlc1xyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG4gIH1cclxuICB2YXIgYWxnb3JpdGhtU3BhY2VzID0gKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQsIGFsbG93UGFydGlhbE1hdGNoKSA9PiB7XHJcbiAgICB2YXIgc2Vlbl9pbmRleGVzID0gbmV3IFNldCgpXHJcbiAgICB2YXIgc2NvcmUgPSAwXHJcbiAgICB2YXIgcmVzdWx0ID0gTlVMTFxyXG5cclxuICAgIHZhciBmaXJzdF9zZWVuX2luZGV4X2xhc3Rfc2VhcmNoID0gMFxyXG4gICAgdmFyIHNlYXJjaGVzID0gcHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlc1xyXG4gICAgdmFyIHNlYXJjaGVzTGVuID0gc2VhcmNoZXMubGVuZ3RoXHJcbiAgICB2YXIgY2hhbmdlc2xlbiA9IDBcclxuXHJcbiAgICAvLyBSZXR1cm4gX25leHRCZWdpbm5pbmdJbmRleGVzIGJhY2sgdG8gaXRzIG5vcm1hbCBzdGF0ZVxyXG4gICAgdmFyIHJlc2V0TmV4dEJlZ2lubmluZ0luZGV4ZXMgPSAoKSA9PiB7XHJcbiAgICAgIGZvcihsZXQgaT1jaGFuZ2VzbGVuLTE7IGk+PTA7IGktLSkgdGFyZ2V0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlc1tuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXNbaSoyICsgMF1dID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzW2kqMiArIDFdXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhhc0F0TGVhc3QxTWF0Y2ggPSBmYWxzZVxyXG4gICAgZm9yKHZhciBpPTA7IGk8c2VhcmNoZXNMZW47ICsraSkge1xyXG4gICAgICBhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgIHZhciBzZWFyY2ggPSBzZWFyY2hlc1tpXVxyXG5cclxuICAgICAgcmVzdWx0ID0gYWxnb3JpdGhtKHNlYXJjaCwgdGFyZ2V0KVxyXG4gICAgICBpZihhbGxvd1BhcnRpYWxNYXRjaCkge1xyXG4gICAgICAgIGlmKHJlc3VsdCA9PT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBoYXNBdExlYXN0MU1hdGNoID0gdHJ1ZVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmKHJlc3VsdCA9PT0gTlVMTCkge3Jlc2V0TmV4dEJlZ2lubmluZ0luZGV4ZXMoKTsgcmV0dXJuIE5VTEx9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGlmIG5vdCB0aGUgbGFzdCBzZWFyY2gsIHdlIG5lZWQgdG8gbXV0YXRlIF9uZXh0QmVnaW5uaW5nSW5kZXhlcyBmb3IgdGhlIG5leHQgc2VhcmNoXHJcbiAgICAgIHZhciBpc1RoZUxhc3RTZWFyY2ggPSBpID09PSBzZWFyY2hlc0xlbiAtIDFcclxuICAgICAgaWYoIWlzVGhlTGFzdFNlYXJjaCkge1xyXG4gICAgICAgIHZhciBpbmRleGVzID0gcmVzdWx0Ll9pbmRleGVzXHJcblxyXG4gICAgICAgIHZhciBpbmRleGVzSXNDb25zZWN1dGl2ZVN1YnN0cmluZyA9IHRydWVcclxuICAgICAgICBmb3IobGV0IGk9MDsgaTxpbmRleGVzLmxlbi0xOyBpKyspIHtcclxuICAgICAgICAgIGlmKGluZGV4ZXNbaSsxXSAtIGluZGV4ZXNbaV0gIT09IDEpIHtcclxuICAgICAgICAgICAgaW5kZXhlc0lzQ29uc2VjdXRpdmVTdWJzdHJpbmcgPSBmYWxzZTsgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihpbmRleGVzSXNDb25zZWN1dGl2ZVN1YnN0cmluZykge1xyXG4gICAgICAgICAgdmFyIG5ld0JlZ2lubmluZ0luZGV4ID0gaW5kZXhlc1tpbmRleGVzLmxlbi0xXSArIDFcclxuICAgICAgICAgIHZhciB0b1JlcGxhY2UgPSB0YXJnZXQuX25leHRCZWdpbm5pbmdJbmRleGVzW25ld0JlZ2lubmluZ0luZGV4LTFdXHJcbiAgICAgICAgICBmb3IobGV0IGk9bmV3QmVnaW5uaW5nSW5kZXgtMTsgaT49MDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGlmKHRvUmVwbGFjZSAhPT0gdGFyZ2V0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSkgYnJlYWtcclxuICAgICAgICAgICAgdGFyZ2V0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSA9IG5ld0JlZ2lubmluZ0luZGV4XHJcbiAgICAgICAgICAgIG5leHRCZWdpbm5pbmdJbmRleGVzQ2hhbmdlc1tjaGFuZ2VzbGVuKjIgKyAwXSA9IGlcclxuICAgICAgICAgICAgbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzW2NoYW5nZXNsZW4qMiArIDFdID0gdG9SZXBsYWNlXHJcbiAgICAgICAgICAgIGNoYW5nZXNsZW4rK1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgc2NvcmUgKz0gcmVzdWx0Ll9zY29yZSAvIHNlYXJjaGVzTGVuXHJcbiAgICAgIGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldID0gcmVzdWx0Ll9zY29yZSAvIHNlYXJjaGVzTGVuXHJcblxyXG4gICAgICAvLyBkb2NrIHBvaW50cyBiYXNlZCBvbiBvcmRlciBvdGhlcndpc2UgXCJjIG1hblwiIHJldHVybnMgTWFuaWZlc3QuY3BwIGluc3RlYWQgb2YgQ2hlYXRNYW5hZ2VyLmhcclxuICAgICAgaWYocmVzdWx0Ll9pbmRleGVzWzBdIDwgZmlyc3Rfc2Vlbl9pbmRleF9sYXN0X3NlYXJjaCkge1xyXG4gICAgICAgIHNjb3JlIC09IChmaXJzdF9zZWVuX2luZGV4X2xhc3Rfc2VhcmNoIC0gcmVzdWx0Ll9pbmRleGVzWzBdKSAqIDJcclxuICAgICAgfVxyXG4gICAgICBmaXJzdF9zZWVuX2luZGV4X2xhc3Rfc2VhcmNoID0gcmVzdWx0Ll9pbmRleGVzWzBdXHJcblxyXG4gICAgICBmb3IodmFyIGo9MDsgajxyZXN1bHQuX2luZGV4ZXMubGVuOyArK2opIHNlZW5faW5kZXhlcy5hZGQocmVzdWx0Ll9pbmRleGVzW2pdKVxyXG4gICAgfVxyXG5cclxuICAgIGlmKGFsbG93UGFydGlhbE1hdGNoICYmICFoYXNBdExlYXN0MU1hdGNoKSByZXR1cm4gTlVMTFxyXG5cclxuICAgIHJlc2V0TmV4dEJlZ2lubmluZ0luZGV4ZXMoKVxyXG5cclxuICAgIC8vIGFsbG93cyBhIHNlYXJjaCB3aXRoIHNwYWNlcyB0aGF0J3MgYW4gZXhhY3Qgc3Vic3RyaW5nIHRvIHNjb3JlIHdlbGxcclxuICAgIHZhciBhbGxvd1NwYWNlc1Jlc3VsdCA9IGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0LCAvKmFsbG93U3BhY2VzPSovdHJ1ZSlcclxuICAgIGlmKGFsbG93U3BhY2VzUmVzdWx0ICE9PSBOVUxMICYmIGFsbG93U3BhY2VzUmVzdWx0Ll9zY29yZSA+IHNjb3JlKSB7XHJcbiAgICAgIGlmKGFsbG93UGFydGlhbE1hdGNoKSB7XHJcbiAgICAgICAgZm9yKHZhciBpPTA7IGk8c2VhcmNoZXNMZW47ICsraSkge1xyXG4gICAgICAgICAgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0gPSBhbGxvd1NwYWNlc1Jlc3VsdC5fc2NvcmUgLyBzZWFyY2hlc0xlblxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYWxsb3dTcGFjZXNSZXN1bHRcclxuICAgIH1cclxuXHJcbiAgICBpZihhbGxvd1BhcnRpYWxNYXRjaCkgcmVzdWx0ID0gdGFyZ2V0XHJcbiAgICByZXN1bHQuX3Njb3JlID0gc2NvcmVcclxuXHJcbiAgICB2YXIgaSA9IDBcclxuICAgIGZvciAobGV0IGluZGV4IG9mIHNlZW5faW5kZXhlcykgcmVzdWx0Ll9pbmRleGVzW2krK10gPSBpbmRleFxyXG4gICAgcmVzdWx0Ll9pbmRleGVzLmxlbiA9IGlcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbiAgfVxyXG5cclxuICAvLyB3ZSB1c2UgdGhpcyBpbnN0ZWFkIG9mIGp1c3QgLm5vcm1hbGl6ZSgnTkZEJykucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgJycpIGJlY2F1c2UgdGhhdCBzY3Jld3Mgd2l0aCBqYXBhbmVzZSBjaGFyYWN0ZXJzXHJcbiAgdmFyIHJlbW92ZV9hY2NlbnRzID0gKHN0cikgPT4gc3RyLnJlcGxhY2UoL1xccHtTY3JpcHQ9TGF0aW59Ky9ndSwgbWF0Y2ggPT4gbWF0Y2gubm9ybWFsaXplKCdORkQnKSkucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgJycpXHJcblxyXG4gIHZhciBwcmVwYXJlTG93ZXJJbmZvID0gKHN0cikgPT4ge1xyXG4gICAgc3RyID0gcmVtb3ZlX2FjY2VudHMoc3RyKVxyXG4gICAgdmFyIHN0ckxlbiA9IHN0ci5sZW5ndGhcclxuICAgIHZhciBsb3dlciA9IHN0ci50b0xvd2VyQ2FzZSgpXHJcbiAgICB2YXIgbG93ZXJDb2RlcyA9IFtdIC8vIG5ldyBBcnJheShzdHJMZW4pICAgIHNwYXJzZSBhcnJheSBpcyB0b28gc2xvd1xyXG4gICAgdmFyIGJpdGZsYWdzID0gMFxyXG4gICAgdmFyIGNvbnRhaW5zU3BhY2UgPSBmYWxzZSAvLyBzcGFjZSBpc24ndCBzdG9yZWQgaW4gYml0ZmxhZ3MgYmVjYXVzZSBvZiBob3cgc2VhcmNoaW5nIHdpdGggYSBzcGFjZSB3b3Jrc1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzdHJMZW47ICsraSkge1xyXG4gICAgICB2YXIgbG93ZXJDb2RlID0gbG93ZXJDb2Rlc1tpXSA9IGxvd2VyLmNoYXJDb2RlQXQoaSlcclxuXHJcbiAgICAgIGlmKGxvd2VyQ29kZSA9PT0gMzIpIHtcclxuICAgICAgICBjb250YWluc1NwYWNlID0gdHJ1ZVxyXG4gICAgICAgIGNvbnRpbnVlIC8vIGl0J3MgaW1wb3J0YW50IHRoYXQgd2UgZG9uJ3Qgc2V0IGFueSBiaXRmbGFncyBmb3Igc3BhY2VcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGJpdCA9IGxvd2VyQ29kZT49OTcmJmxvd2VyQ29kZTw9MTIyID8gbG93ZXJDb2RlLTk3IC8vIGFscGhhYmV0XHJcbiAgICAgICAgICAgICAgOiBsb3dlckNvZGU+PTQ4JiZsb3dlckNvZGU8PTU3ICA/IDI2ICAgICAgICAgICAvLyBudW1iZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAzIGJpdHMgYXZhaWxhYmxlXHJcbiAgICAgICAgICAgICAgOiBsb3dlckNvZGU8PTEyNyAgICAgICAgICAgICAgICA/IDMwICAgICAgICAgICAvLyBvdGhlciBhc2NpaVxyXG4gICAgICAgICAgICAgIDogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAzMSAgICAgICAgICAgLy8gb3RoZXIgdXRmOFxyXG4gICAgICBiaXRmbGFncyB8PSAxPDxiaXRcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge2xvd2VyQ29kZXM6bG93ZXJDb2RlcywgYml0ZmxhZ3M6Yml0ZmxhZ3MsIGNvbnRhaW5zU3BhY2U6Y29udGFpbnNTcGFjZSwgX2xvd2VyOmxvd2VyfVxyXG4gIH1cclxuICB2YXIgcHJlcGFyZUJlZ2lubmluZ0luZGV4ZXMgPSAodGFyZ2V0KSA9PiB7XHJcbiAgICB2YXIgdGFyZ2V0TGVuID0gdGFyZ2V0Lmxlbmd0aFxyXG4gICAgdmFyIGJlZ2lubmluZ0luZGV4ZXMgPSBbXTsgdmFyIGJlZ2lubmluZ0luZGV4ZXNMZW4gPSAwXHJcbiAgICB2YXIgd2FzVXBwZXIgPSBmYWxzZVxyXG4gICAgdmFyIHdhc0FscGhhbnVtID0gZmFsc2VcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRMZW47ICsraSkge1xyXG4gICAgICB2YXIgdGFyZ2V0Q29kZSA9IHRhcmdldC5jaGFyQ29kZUF0KGkpXHJcbiAgICAgIHZhciBpc1VwcGVyID0gdGFyZ2V0Q29kZT49NjUmJnRhcmdldENvZGU8PTkwXHJcbiAgICAgIHZhciBpc0FscGhhbnVtID0gaXNVcHBlciB8fCB0YXJnZXRDb2RlPj05NyYmdGFyZ2V0Q29kZTw9MTIyIHx8IHRhcmdldENvZGU+PTQ4JiZ0YXJnZXRDb2RlPD01N1xyXG4gICAgICB2YXIgaXNCZWdpbm5pbmcgPSBpc1VwcGVyICYmICF3YXNVcHBlciB8fCAhd2FzQWxwaGFudW0gfHwgIWlzQWxwaGFudW1cclxuICAgICAgd2FzVXBwZXIgPSBpc1VwcGVyXHJcbiAgICAgIHdhc0FscGhhbnVtID0gaXNBbHBoYW51bVxyXG4gICAgICBpZihpc0JlZ2lubmluZykgYmVnaW5uaW5nSW5kZXhlc1tiZWdpbm5pbmdJbmRleGVzTGVuKytdID0gaVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJlZ2lubmluZ0luZGV4ZXNcclxuICB9XHJcbiAgdmFyIHByZXBhcmVOZXh0QmVnaW5uaW5nSW5kZXhlcyA9ICh0YXJnZXQpID0+IHtcclxuICAgIHRhcmdldCA9IHJlbW92ZV9hY2NlbnRzKHRhcmdldClcclxuICAgIHZhciB0YXJnZXRMZW4gPSB0YXJnZXQubGVuZ3RoXHJcbiAgICB2YXIgYmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVCZWdpbm5pbmdJbmRleGVzKHRhcmdldClcclxuICAgIHZhciBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IFtdIC8vIG5ldyBBcnJheSh0YXJnZXRMZW4pICAgICBzcGFyc2UgYXJyYXkgaXMgdG9vIHNsb3dcclxuICAgIHZhciBsYXN0SXNCZWdpbm5pbmcgPSBiZWdpbm5pbmdJbmRleGVzWzBdXHJcbiAgICB2YXIgbGFzdElzQmVnaW5uaW5nSSA9IDBcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRMZW47ICsraSkge1xyXG4gICAgICBpZihsYXN0SXNCZWdpbm5pbmcgPiBpKSB7XHJcbiAgICAgICAgbmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0gPSBsYXN0SXNCZWdpbm5pbmdcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsYXN0SXNCZWdpbm5pbmcgPSBiZWdpbm5pbmdJbmRleGVzWysrbGFzdElzQmVnaW5uaW5nSV1cclxuICAgICAgICBuZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSA9IGxhc3RJc0JlZ2lubmluZz09PXVuZGVmaW5lZCA/IHRhcmdldExlbiA6IGxhc3RJc0JlZ2lubmluZ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV4dEJlZ2lubmluZ0luZGV4ZXNcclxuICB9XHJcblxyXG4gIHZhciBwcmVwYXJlZENhY2hlICAgICAgID0gbmV3IE1hcCgpXHJcbiAgdmFyIHByZXBhcmVkU2VhcmNoQ2FjaGUgPSBuZXcgTWFwKClcclxuXHJcbiAgLy8gdGhlIHRoZW9yeSBiZWhpbmQgdGhlc2UgYmVpbmcgZ2xvYmFscyBpcyB0byByZWR1Y2UgZ2FyYmFnZSBjb2xsZWN0aW9uIGJ5IG5vdCBtYWtpbmcgbmV3IGFycmF5c1xyXG4gIHZhciBtYXRjaGVzU2ltcGxlID0gW107IHZhciBtYXRjaGVzU3RyaWN0ID0gW11cclxuICB2YXIgbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzID0gW10gLy8gYWxsb3dzIHN0cmF3IGJlcnJ5IHRvIG1hdGNoIHN0cmF3YmVycnkgd2VsbCwgYnkgbW9kaWZ5aW5nIHRoZSBlbmQgb2YgYSBzdWJzdHJpbmcgdG8gYmUgY29uc2lkZXJlZCBhIGJlZ2lubmluZyBpbmRleCBmb3IgdGhlIHJlc3Qgb2YgdGhlIHNlYXJjaFxyXG4gIHZhciBrZXlzU3BhY2VzQmVzdFNjb3JlcyA9IFtdOyB2YXIgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXMgPSBbXVxyXG4gIHZhciB0bXBUYXJnZXRzID0gW107IHZhciB0bXBSZXN1bHRzID0gW11cclxuXHJcbiAgLy8gcHJvcCA9ICdrZXknICAgICAgICAgICAgICAgICAgMi41bXMgb3B0aW1pemVkIGZvciB0aGlzIGNhc2UsIHNlZW1zIHRvIGJlIGFib3V0IGFzIGZhc3QgYXMgZGlyZWN0IG9ialtwcm9wXVxyXG4gIC8vIHByb3AgPSAna2V5MS5rZXkyJyAgICAgICAgICAgIDEwbXNcclxuICAvLyBwcm9wID0gWydrZXkxJywgJ2tleTInXSAgICAgICAyN21zXHJcbiAgLy8gcHJvcCA9IG9iaiA9PiBvYmoudGFncy5qb2luKCkgPz9tc1xyXG4gIHZhciBnZXRWYWx1ZSA9IChvYmosIHByb3ApID0+IHtcclxuICAgIHZhciB0bXAgPSBvYmpbcHJvcF07IGlmKHRtcCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdG1wXHJcbiAgICBpZih0eXBlb2YgcHJvcCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHByb3Aob2JqKSAvLyB0aGlzIHNob3VsZCBydW4gZmlyc3QuIGJ1dCB0aGF0IG1ha2VzIHN0cmluZyBwcm9wcyBzbG93ZXJcclxuICAgIHZhciBzZWdzID0gcHJvcFxyXG4gICAgaWYoIUFycmF5LmlzQXJyYXkocHJvcCkpIHNlZ3MgPSBwcm9wLnNwbGl0KCcuJylcclxuICAgIHZhciBsZW4gPSBzZWdzLmxlbmd0aFxyXG4gICAgdmFyIGkgPSAtMVxyXG4gICAgd2hpbGUgKG9iaiAmJiAoKytpIDwgbGVuKSkgb2JqID0gb2JqW3NlZ3NbaV1dXHJcbiAgICByZXR1cm4gb2JqXHJcbiAgfVxyXG5cclxuICB2YXIgaXNQcmVwYXJlZCA9ICh4KSA9PiB7IHJldHVybiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHguX2JpdGZsYWdzID09PSAnbnVtYmVyJyB9XHJcbiAgdmFyIElORklOSVRZID0gSW5maW5pdHk7IHZhciBORUdBVElWRV9JTkZJTklUWSA9IC1JTkZJTklUWVxyXG4gIHZhciBub1Jlc3VsdHMgPSBbXTsgbm9SZXN1bHRzLnRvdGFsID0gMFxyXG4gIHZhciBOVUxMID0gbnVsbFxyXG5cclxuICB2YXIgbm9UYXJnZXQgPSBwcmVwYXJlKCcnKVxyXG5cclxuICAvLyBIYWNrZWQgdmVyc2lvbiBvZiBodHRwczovL2dpdGh1Yi5jb20vbGVtaXJlL0Zhc3RQcmlvcml0eVF1ZXVlLmpzXHJcbiAgdmFyIGZhc3Rwcmlvcml0eXF1ZXVlPXI9Pnt2YXIgZT1bXSxvPTAsYT17fSx2PXI9Pntmb3IodmFyIGE9MCx2PWVbYV0sYz0xO2M8bzspe3ZhciBzPWMrMTthPWMsczxvJiZlW3NdLl9zY29yZTxlW2NdLl9zY29yZSYmKGE9cyksZVthLTE+PjFdPWVbYV0sYz0xKyhhPDwxKX1mb3IodmFyIGY9YS0xPj4xO2E+MCYmdi5fc2NvcmU8ZVtmXS5fc2NvcmU7Zj0oYT1mKS0xPj4xKWVbYV09ZVtmXTtlW2FdPXZ9O3JldHVybiBhLmFkZD0ocj0+e3ZhciBhPW87ZVtvKytdPXI7Zm9yKHZhciB2PWEtMT4+MTthPjAmJnIuX3Njb3JlPGVbdl0uX3Njb3JlO3Y9KGE9diktMT4+MSllW2FdPWVbdl07ZVthXT1yfSksYS5wb2xsPShyPT57aWYoMCE9PW8pe3ZhciBhPWVbMF07cmV0dXJuIGVbMF09ZVstLW9dLHYoKSxhfX0pLGEucGVlaz0ocj0+e2lmKDAhPT1vKXJldHVybiBlWzBdfSksYS5yZXBsYWNlVG9wPShyPT57ZVswXT1yLHYoKX0pLGF9XHJcbiAgdmFyIHEgPSBmYXN0cHJpb3JpdHlxdWV1ZSgpIC8vIHJldXNlIHRoaXNcclxuXHJcbiAgLy8gZnV6enlzb3J0IGlzIHdyaXR0ZW4gdGhpcyB3YXkgZm9yIG1pbmlmaWNhdGlvbi4gYWxsIG5hbWVzIGFyZSBtYW5nZWxlZCB1bmxlc3MgcXVvdGVkXHJcbiAgcmV0dXJuIHsnc2luZ2xlJzpzaW5nbGUsICdnbyc6Z28sICdwcmVwYXJlJzpwcmVwYXJlLCAnY2xlYW51cCc6Y2xlYW51cH1cclxufSkgLy8gVU1EXHJcbiIsICIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxNyBHb29nbGUgTExDXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQlNELTMtQ2xhdXNlXG4gKi9cblxuLy8gSU1QT1JUQU5UOiB0aGVzZSBpbXBvcnRzIG11c3QgYmUgdHlwZS1vbmx5XG5pbXBvcnQgdHlwZSB7RGlyZWN0aXZlLCBEaXJlY3RpdmVSZXN1bHQsIFBhcnRJbmZvfSBmcm9tICcuL2RpcmVjdGl2ZS5qcyc7XG5pbXBvcnQgdHlwZSB7VHJ1c3RlZEhUTUwsIFRydXN0ZWRUeXBlc1dpbmRvd30gZnJvbSAndHJ1c3RlZC10eXBlcy9saWInO1xuXG5jb25zdCBERVZfTU9ERSA9IHRydWU7XG5jb25zdCBFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MgPSB0cnVlO1xuY29uc3QgRU5BQkxFX1NIQURZRE9NX05PUEFUQ0ggPSB0cnVlO1xuY29uc3QgTk9ERV9NT0RFID0gZmFsc2U7XG5cbi8vIEFsbG93cyBtaW5pZmllcnMgdG8gcmVuYW1lIHJlZmVyZW5jZXMgdG8gZ2xvYmFsVGhpc1xuY29uc3QgZ2xvYmFsID0gZ2xvYmFsVGhpcztcblxuLyoqXG4gKiBDb250YWlucyB0eXBlcyB0aGF0IGFyZSBwYXJ0IG9mIHRoZSB1bnN0YWJsZSBkZWJ1ZyBBUEkuXG4gKlxuICogRXZlcnl0aGluZyBpbiB0aGlzIEFQSSBpcyBub3Qgc3RhYmxlIGFuZCBtYXkgY2hhbmdlIG9yIGJlIHJlbW92ZWQgaW4gdGhlIGZ1dHVyZSxcbiAqIGV2ZW4gb24gcGF0Y2ggcmVsZWFzZXMuXG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbmFtZXNwYWNlXG5leHBvcnQgbmFtZXNwYWNlIExpdFVuc3RhYmxlIHtcbiAgLyoqXG4gICAqIFdoZW4gTGl0IGlzIHJ1bm5pbmcgaW4gZGV2IG1vZGUgYW5kIGB3aW5kb3cuZW1pdExpdERlYnVnTG9nRXZlbnRzYCBpcyB0cnVlLFxuICAgKiB3ZSB3aWxsIGVtaXQgJ2xpdC1kZWJ1ZycgZXZlbnRzIHRvIHdpbmRvdywgd2l0aCBsaXZlIGRldGFpbHMgYWJvdXQgdGhlIHVwZGF0ZSBhbmQgcmVuZGVyXG4gICAqIGxpZmVjeWNsZS4gVGhlc2UgY2FuIGJlIHVzZWZ1bCBmb3Igd3JpdGluZyBkZWJ1ZyB0b29saW5nIGFuZCB2aXN1YWxpemF0aW9ucy5cbiAgICpcbiAgICogUGxlYXNlIGJlIGF3YXJlIHRoYXQgcnVubmluZyB3aXRoIHdpbmRvdy5lbWl0TGl0RGVidWdMb2dFdmVudHMgaGFzIHBlcmZvcm1hbmNlIG92ZXJoZWFkLFxuICAgKiBtYWtpbmcgY2VydGFpbiBvcGVyYXRpb25zIHRoYXQgYXJlIG5vcm1hbGx5IHZlcnkgY2hlYXAgKGxpa2UgYSBuby1vcCByZW5kZXIpIG11Y2ggc2xvd2VyLFxuICAgKiBiZWNhdXNlIHdlIG11c3QgY29weSBkYXRhIGFuZCBkaXNwYXRjaCBldmVudHMuXG4gICAqL1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5hbWVzcGFjZVxuICBleHBvcnQgbmFtZXNwYWNlIERlYnVnTG9nIHtcbiAgICBleHBvcnQgdHlwZSBFbnRyeSA9XG4gICAgICB8IFRlbXBsYXRlUHJlcFxuICAgICAgfCBUZW1wbGF0ZUluc3RhbnRpYXRlZFxuICAgICAgfCBUZW1wbGF0ZUluc3RhbnRpYXRlZEFuZFVwZGF0ZWRcbiAgICAgIHwgVGVtcGxhdGVVcGRhdGluZ1xuICAgICAgfCBCZWdpblJlbmRlclxuICAgICAgfCBFbmRSZW5kZXJcbiAgICAgIHwgQ29tbWl0UGFydEVudHJ5XG4gICAgICB8IFNldFBhcnRWYWx1ZTtcbiAgICBleHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlUHJlcCB7XG4gICAgICBraW5kOiAndGVtcGxhdGUgcHJlcCc7XG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGU7XG4gICAgICBzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheTtcbiAgICAgIGNsb25hYmxlVGVtcGxhdGU6IEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XG4gICAgICBwYXJ0czogVGVtcGxhdGVQYXJ0W107XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQmVnaW5SZW5kZXIge1xuICAgICAga2luZDogJ2JlZ2luIHJlbmRlcic7XG4gICAgICBpZDogbnVtYmVyO1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBjb250YWluZXI6IEhUTUxFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudDtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBwYXJ0OiBDaGlsZFBhcnQgfCB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgRW5kUmVuZGVyIHtcbiAgICAgIGtpbmQ6ICdlbmQgcmVuZGVyJztcbiAgICAgIGlkOiBudW1iZXI7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50O1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIHBhcnQ6IENoaWxkUGFydDtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZUluc3RhbnRpYXRlZCB7XG4gICAgICBraW5kOiAndGVtcGxhdGUgaW5zdGFudGlhdGVkJztcbiAgICAgIHRlbXBsYXRlOiBUZW1wbGF0ZSB8IENvbXBpbGVkVGVtcGxhdGU7XG4gICAgICBpbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZTtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBmcmFnbWVudDogTm9kZTtcbiAgICAgIHBhcnRzOiBBcnJheTxQYXJ0IHwgdW5kZWZpbmVkPjtcbiAgICAgIHZhbHVlczogdW5rbm93bltdO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlSW5zdGFudGlhdGVkQW5kVXBkYXRlZCB7XG4gICAgICBraW5kOiAndGVtcGxhdGUgaW5zdGFudGlhdGVkIGFuZCB1cGRhdGVkJztcbiAgICAgIHRlbXBsYXRlOiBUZW1wbGF0ZSB8IENvbXBpbGVkVGVtcGxhdGU7XG4gICAgICBpbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZTtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBmcmFnbWVudDogTm9kZTtcbiAgICAgIHBhcnRzOiBBcnJheTxQYXJ0IHwgdW5kZWZpbmVkPjtcbiAgICAgIHZhbHVlczogdW5rbm93bltdO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlVXBkYXRpbmcge1xuICAgICAga2luZDogJ3RlbXBsYXRlIHVwZGF0aW5nJztcbiAgICAgIHRlbXBsYXRlOiBUZW1wbGF0ZSB8IENvbXBpbGVkVGVtcGxhdGU7XG4gICAgICBpbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZTtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBwYXJ0czogQXJyYXk8UGFydCB8IHVuZGVmaW5lZD47XG4gICAgICB2YWx1ZXM6IHVua25vd25bXTtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBTZXRQYXJ0VmFsdWUge1xuICAgICAga2luZDogJ3NldCBwYXJ0JztcbiAgICAgIHBhcnQ6IFBhcnQ7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIHZhbHVlSW5kZXg6IG51bWJlcjtcbiAgICAgIHZhbHVlczogdW5rbm93bltdO1xuICAgICAgdGVtcGxhdGVJbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZTtcbiAgICB9XG5cbiAgICBleHBvcnQgdHlwZSBDb21taXRQYXJ0RW50cnkgPVxuICAgICAgfCBDb21taXROb3RoaW5nVG9DaGlsZEVudHJ5XG4gICAgICB8IENvbW1pdFRleHRcbiAgICAgIHwgQ29tbWl0Tm9kZVxuICAgICAgfCBDb21taXRBdHRyaWJ1dGVcbiAgICAgIHwgQ29tbWl0UHJvcGVydHlcbiAgICAgIHwgQ29tbWl0Qm9vbGVhbkF0dHJpYnV0ZVxuICAgICAgfCBDb21taXRFdmVudExpc3RlbmVyXG4gICAgICB8IENvbW1pdFRvRWxlbWVudEJpbmRpbmc7XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdE5vdGhpbmdUb0NoaWxkRW50cnkge1xuICAgICAga2luZDogJ2NvbW1pdCBub3RoaW5nIHRvIGNoaWxkJztcbiAgICAgIHN0YXJ0OiBDaGlsZE5vZGU7XG4gICAgICBlbmQ6IENoaWxkTm9kZSB8IG51bGw7XG4gICAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlIHwgdW5kZWZpbmVkO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdFRleHQge1xuICAgICAga2luZDogJ2NvbW1pdCB0ZXh0JztcbiAgICAgIG5vZGU6IFRleHQ7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXROb2RlIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgbm9kZSc7XG4gICAgICBzdGFydDogTm9kZTtcbiAgICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUgfCB1bmRlZmluZWQ7XG4gICAgICB2YWx1ZTogTm9kZTtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRBdHRyaWJ1dGUge1xuICAgICAga2luZDogJ2NvbW1pdCBhdHRyaWJ1dGUnO1xuICAgICAgZWxlbWVudDogRWxlbWVudDtcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdFByb3BlcnR5IHtcbiAgICAgIGtpbmQ6ICdjb21taXQgcHJvcGVydHknO1xuICAgICAgZWxlbWVudDogRWxlbWVudDtcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdEJvb2xlYW5BdHRyaWJ1dGUge1xuICAgICAga2luZDogJ2NvbW1pdCBib29sZWFuIGF0dHJpYnV0ZSc7XG4gICAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgdmFsdWU6IGJvb2xlYW47XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0RXZlbnRMaXN0ZW5lciB7XG4gICAgICBraW5kOiAnY29tbWl0IGV2ZW50IGxpc3RlbmVyJztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9sZExpc3RlbmVyOiB1bmtub3duO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIC8vIFRydWUgaWYgd2UncmUgcmVtb3ZpbmcgdGhlIG9sZCBldmVudCBsaXN0ZW5lciAoZS5nLiBiZWNhdXNlIHNldHRpbmdzIGNoYW5nZWQsIG9yIHZhbHVlIGlzIG5vdGhpbmcpXG4gICAgICByZW1vdmVMaXN0ZW5lcjogYm9vbGVhbjtcbiAgICAgIC8vIFRydWUgaWYgd2UncmUgYWRkaW5nIGEgbmV3IGV2ZW50IGxpc3RlbmVyIChlLmcuIGJlY2F1c2UgZmlyc3QgcmVuZGVyLCBvciBzZXR0aW5ncyBjaGFuZ2VkKVxuICAgICAgYWRkTGlzdGVuZXI6IGJvb2xlYW47XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRUb0VsZW1lbnRCaW5kaW5nIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgdG8gZWxlbWVudCBiaW5kaW5nJztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG5cbmludGVyZmFjZSBEZWJ1Z0xvZ2dpbmdXaW5kb3cge1xuICAvLyBFdmVuIGluIGRldiBtb2RlLCB3ZSBnZW5lcmFsbHkgZG9uJ3Qgd2FudCB0byBlbWl0IHRoZXNlIGV2ZW50cywgYXMgdGhhdCdzXG4gIC8vIGFub3RoZXIgbGV2ZWwgb2YgY29zdCwgc28gb25seSBlbWl0IHRoZW0gd2hlbiBERVZfTU9ERSBpcyB0cnVlIF9hbmRfIHdoZW5cbiAgLy8gd2luZG93LmVtaXRMaXREZWJ1Z0V2ZW50cyBpcyB0cnVlLlxuICBlbWl0TGl0RGVidWdMb2dFdmVudHM/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFVzZWZ1bCBmb3IgdmlzdWFsaXppbmcgYW5kIGxvZ2dpbmcgaW5zaWdodHMgaW50byB3aGF0IHRoZSBMaXQgdGVtcGxhdGUgc3lzdGVtIGlzIGRvaW5nLlxuICpcbiAqIENvbXBpbGVkIG91dCBvZiBwcm9kIG1vZGUgYnVpbGRzLlxuICovXG5jb25zdCBkZWJ1Z0xvZ0V2ZW50ID0gREVWX01PREVcbiAgPyAoZXZlbnQ6IExpdFVuc3RhYmxlLkRlYnVnTG9nLkVudHJ5KSA9PiB7XG4gICAgICBjb25zdCBzaG91bGRFbWl0ID0gKGdsb2JhbCBhcyB1bmtub3duIGFzIERlYnVnTG9nZ2luZ1dpbmRvdylcbiAgICAgICAgLmVtaXRMaXREZWJ1Z0xvZ0V2ZW50cztcbiAgICAgIGlmICghc2hvdWxkRW1pdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBnbG9iYWwuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50PExpdFVuc3RhYmxlLkRlYnVnTG9nLkVudHJ5PignbGl0LWRlYnVnJywge1xuICAgICAgICAgIGRldGFpbDogZXZlbnQsXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgOiB1bmRlZmluZWQ7XG4vLyBVc2VkIGZvciBjb25uZWN0aW5nIGJlZ2luUmVuZGVyIGFuZCBlbmRSZW5kZXIgZXZlbnRzIHdoZW4gdGhlcmUgYXJlIG5lc3RlZFxuLy8gcmVuZGVycyB3aGVuIGVycm9ycyBhcmUgdGhyb3duIHByZXZlbnRpbmcgYW4gZW5kUmVuZGVyIGV2ZW50IGZyb20gYmVpbmdcbi8vIGNhbGxlZC5cbmxldCBkZWJ1Z0xvZ1JlbmRlcklkID0gMDtcblxubGV0IGlzc3VlV2FybmluZzogKGNvZGU6IHN0cmluZywgd2FybmluZzogc3RyaW5nKSA9PiB2b2lkO1xuXG5pZiAoREVWX01PREUpIHtcbiAgZ2xvYmFsLmxpdElzc3VlZFdhcm5pbmdzID8/PSBuZXcgU2V0KCk7XG5cbiAgLy8gSXNzdWUgYSB3YXJuaW5nLCBpZiB3ZSBoYXZlbid0IGFscmVhZHkuXG4gIGlzc3VlV2FybmluZyA9IChjb2RlOiBzdHJpbmcsIHdhcm5pbmc6IHN0cmluZykgPT4ge1xuICAgIHdhcm5pbmcgKz0gY29kZVxuICAgICAgPyBgIFNlZSBodHRwczovL2xpdC5kZXYvbXNnLyR7Y29kZX0gZm9yIG1vcmUgaW5mb3JtYXRpb24uYFxuICAgICAgOiAnJztcbiAgICBpZiAoIWdsb2JhbC5saXRJc3N1ZWRXYXJuaW5ncyEuaGFzKHdhcm5pbmcpKSB7XG4gICAgICBjb25zb2xlLndhcm4od2FybmluZyk7XG4gICAgICBnbG9iYWwubGl0SXNzdWVkV2FybmluZ3MhLmFkZCh3YXJuaW5nKTtcbiAgICB9XG4gIH07XG5cbiAgaXNzdWVXYXJuaW5nKFxuICAgICdkZXYtbW9kZScsXG4gICAgYExpdCBpcyBpbiBkZXYgbW9kZS4gTm90IHJlY29tbWVuZGVkIGZvciBwcm9kdWN0aW9uIWBcbiAgKTtcbn1cblxuY29uc3Qgd3JhcCA9XG4gIEVOQUJMRV9TSEFEWURPTV9OT1BBVENIICYmXG4gIGdsb2JhbC5TaGFkeURPTT8uaW5Vc2UgJiZcbiAgZ2xvYmFsLlNoYWR5RE9NPy5ub1BhdGNoID09PSB0cnVlXG4gICAgPyAoZ2xvYmFsLlNoYWR5RE9NIS53cmFwIGFzIDxUIGV4dGVuZHMgTm9kZT4obm9kZTogVCkgPT4gVClcbiAgICA6IDxUIGV4dGVuZHMgTm9kZT4obm9kZTogVCkgPT4gbm9kZTtcblxuY29uc3QgdHJ1c3RlZFR5cGVzID0gKGdsb2JhbCBhcyB1bmtub3duIGFzIFRydXN0ZWRUeXBlc1dpbmRvdykudHJ1c3RlZFR5cGVzO1xuXG4vKipcbiAqIE91ciBUcnVzdGVkVHlwZVBvbGljeSBmb3IgSFRNTCB3aGljaCBpcyBkZWNsYXJlZCB1c2luZyB0aGUgaHRtbCB0ZW1wbGF0ZVxuICogdGFnIGZ1bmN0aW9uLlxuICpcbiAqIFRoYXQgSFRNTCBpcyBhIGRldmVsb3Blci1hdXRob3JlZCBjb25zdGFudCwgYW5kIGlzIHBhcnNlZCB3aXRoIGlubmVySFRNTFxuICogYmVmb3JlIGFueSB1bnRydXN0ZWQgZXhwcmVzc2lvbnMgaGF2ZSBiZWVuIG1peGVkIGluLiBUaGVyZWZvciBpdCBpc1xuICogY29uc2lkZXJlZCBzYWZlIGJ5IGNvbnN0cnVjdGlvbi5cbiAqL1xuY29uc3QgcG9saWN5ID0gdHJ1c3RlZFR5cGVzXG4gID8gdHJ1c3RlZFR5cGVzLmNyZWF0ZVBvbGljeSgnbGl0LWh0bWwnLCB7XG4gICAgICBjcmVhdGVIVE1MOiAocykgPT4gcyxcbiAgICB9KVxuICA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBVc2VkIHRvIHNhbml0aXplIGFueSB2YWx1ZSBiZWZvcmUgaXQgaXMgd3JpdHRlbiBpbnRvIHRoZSBET00uIFRoaXMgY2FuIGJlXG4gKiB1c2VkIHRvIGltcGxlbWVudCBhIHNlY3VyaXR5IHBvbGljeSBvZiBhbGxvd2VkIGFuZCBkaXNhbGxvd2VkIHZhbHVlcyBpblxuICogb3JkZXIgdG8gcHJldmVudCBYU1MgYXR0YWNrcy5cbiAqXG4gKiBPbmUgd2F5IG9mIHVzaW5nIHRoaXMgY2FsbGJhY2sgd291bGQgYmUgdG8gY2hlY2sgYXR0cmlidXRlcyBhbmQgcHJvcGVydGllc1xuICogYWdhaW5zdCBhIGxpc3Qgb2YgaGlnaCByaXNrIGZpZWxkcywgYW5kIHJlcXVpcmUgdGhhdCB2YWx1ZXMgd3JpdHRlbiB0byBzdWNoXG4gKiBmaWVsZHMgYmUgaW5zdGFuY2VzIG9mIGEgY2xhc3Mgd2hpY2ggaXMgc2FmZSBieSBjb25zdHJ1Y3Rpb24uIENsb3N1cmUncyBTYWZlXG4gKiBIVE1MIFR5cGVzIGlzIG9uZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIHRlY2huaXF1ZSAoXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3NhZmUtaHRtbC10eXBlcy9ibG9iL21hc3Rlci9kb2Mvc2FmZWh0bWwtdHlwZXMubWQpLlxuICogVGhlIFRydXN0ZWRUeXBlcyBwb2x5ZmlsbCBpbiBBUEktb25seSBtb2RlIGNvdWxkIGFsc28gYmUgdXNlZCBhcyBhIGJhc2lzXG4gKiBmb3IgdGhpcyB0ZWNobmlxdWUgKGh0dHBzOi8vZ2l0aHViLmNvbS9XSUNHL3RydXN0ZWQtdHlwZXMpLlxuICpcbiAqIEBwYXJhbSBub2RlIFRoZSBIVE1MIG5vZGUgKHVzdWFsbHkgZWl0aGVyIGEgI3RleHQgbm9kZSBvciBhbiBFbGVtZW50KSB0aGF0XG4gKiAgICAgaXMgYmVpbmcgd3JpdHRlbiB0by4gTm90ZSB0aGF0IHRoaXMgaXMganVzdCBhbiBleGVtcGxhciBub2RlLCB0aGUgd3JpdGVcbiAqICAgICBtYXkgdGFrZSBwbGFjZSBhZ2FpbnN0IGFub3RoZXIgaW5zdGFuY2Ugb2YgdGhlIHNhbWUgY2xhc3Mgb2Ygbm9kZS5cbiAqIEBwYXJhbSBuYW1lIFRoZSBuYW1lIG9mIGFuIGF0dHJpYnV0ZSBvciBwcm9wZXJ0eSAoZm9yIGV4YW1wbGUsICdocmVmJykuXG4gKiBAcGFyYW0gdHlwZSBJbmRpY2F0ZXMgd2hldGhlciB0aGUgd3JpdGUgdGhhdCdzIGFib3V0IHRvIGJlIHBlcmZvcm1lZCB3aWxsXG4gKiAgICAgYmUgdG8gYSBwcm9wZXJ0eSBvciBhIG5vZGUuXG4gKiBAcmV0dXJuIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHNhbml0aXplIHRoaXMgY2xhc3Mgb2Ygd3JpdGVzLlxuICovXG5leHBvcnQgdHlwZSBTYW5pdGl6ZXJGYWN0b3J5ID0gKFxuICBub2RlOiBOb2RlLFxuICBuYW1lOiBzdHJpbmcsXG4gIHR5cGU6ICdwcm9wZXJ0eScgfCAnYXR0cmlidXRlJ1xuKSA9PiBWYWx1ZVNhbml0aXplcjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHdoaWNoIGNhbiBzYW5pdGl6ZSB2YWx1ZXMgdGhhdCB3aWxsIGJlIHdyaXR0ZW4gdG8gYSBzcGVjaWZpYyBraW5kXG4gKiBvZiBET00gc2luay5cbiAqXG4gKiBTZWUgU2FuaXRpemVyRmFjdG9yeS5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHNhbml0aXplLiBXaWxsIGJlIHRoZSBhY3R1YWwgdmFsdWUgcGFzc2VkIGludG9cbiAqICAgICB0aGUgbGl0LWh0bWwgdGVtcGxhdGUgbGl0ZXJhbCwgc28gdGhpcyBjb3VsZCBiZSBvZiBhbnkgdHlwZS5cbiAqIEByZXR1cm4gVGhlIHZhbHVlIHRvIHdyaXRlIHRvIHRoZSBET00uIFVzdWFsbHkgdGhlIHNhbWUgYXMgdGhlIGlucHV0IHZhbHVlLFxuICogICAgIHVubGVzcyBzYW5pdGl6YXRpb24gaXMgbmVlZGVkLlxuICovXG5leHBvcnQgdHlwZSBWYWx1ZVNhbml0aXplciA9ICh2YWx1ZTogdW5rbm93bikgPT4gdW5rbm93bjtcblxuY29uc3QgaWRlbnRpdHlGdW5jdGlvbjogVmFsdWVTYW5pdGl6ZXIgPSAodmFsdWU6IHVua25vd24pID0+IHZhbHVlO1xuY29uc3Qgbm9vcFNhbml0aXplcjogU2FuaXRpemVyRmFjdG9yeSA9IChcbiAgX25vZGU6IE5vZGUsXG4gIF9uYW1lOiBzdHJpbmcsXG4gIF90eXBlOiAncHJvcGVydHknIHwgJ2F0dHJpYnV0ZSdcbikgPT4gaWRlbnRpdHlGdW5jdGlvbjtcblxuLyoqIFNldHMgdGhlIGdsb2JhbCBzYW5pdGl6ZXIgZmFjdG9yeS4gKi9cbmNvbnN0IHNldFNhbml0aXplciA9IChuZXdTYW5pdGl6ZXI6IFNhbml0aXplckZhY3RvcnkpID0+IHtcbiAgaWYgKCFFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHNhbml0aXplckZhY3RvcnlJbnRlcm5hbCAhPT0gbm9vcFNhbml0aXplcikge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBBdHRlbXB0ZWQgdG8gb3ZlcndyaXRlIGV4aXN0aW5nIGxpdC1odG1sIHNlY3VyaXR5IHBvbGljeS5gICtcbiAgICAgICAgYCBzZXRTYW5pdGl6ZURPTVZhbHVlRmFjdG9yeSBzaG91bGQgYmUgY2FsbGVkIGF0IG1vc3Qgb25jZS5gXG4gICAgKTtcbiAgfVxuICBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwgPSBuZXdTYW5pdGl6ZXI7XG59O1xuXG4vKipcbiAqIE9ubHkgdXNlZCBpbiBpbnRlcm5hbCB0ZXN0cywgbm90IGEgcGFydCBvZiB0aGUgcHVibGljIEFQSS5cbiAqL1xuY29uc3QgX3Rlc3RPbmx5Q2xlYXJTYW5pdGl6ZXJGYWN0b3J5RG9Ob3RDYWxsT3JFbHNlID0gKCkgPT4ge1xuICBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwgPSBub29wU2FuaXRpemVyO1xufTtcblxuY29uc3QgY3JlYXRlU2FuaXRpemVyOiBTYW5pdGl6ZXJGYWN0b3J5ID0gKG5vZGUsIG5hbWUsIHR5cGUpID0+IHtcbiAgcmV0dXJuIHNhbml0aXplckZhY3RvcnlJbnRlcm5hbChub2RlLCBuYW1lLCB0eXBlKTtcbn07XG5cbi8vIEFkZGVkIHRvIGFuIGF0dHJpYnV0ZSBuYW1lIHRvIG1hcmsgdGhlIGF0dHJpYnV0ZSBhcyBib3VuZCBzbyB3ZSBjYW4gZmluZFxuLy8gaXQgZWFzaWx5LlxuY29uc3QgYm91bmRBdHRyaWJ1dGVTdWZmaXggPSAnJGxpdCQnO1xuXG4vLyBUaGlzIG1hcmtlciBpcyB1c2VkIGluIG1hbnkgc3ludGFjdGljIHBvc2l0aW9ucyBpbiBIVE1MLCBzbyBpdCBtdXN0IGJlXG4vLyBhIHZhbGlkIGVsZW1lbnQgbmFtZSBhbmQgYXR0cmlidXRlIG5hbWUuIFdlIGRvbid0IHN1cHBvcnQgZHluYW1pYyBuYW1lcyAoeWV0KVxuLy8gYnV0IHRoaXMgYXQgbGVhc3QgZW5zdXJlcyB0aGF0IHRoZSBwYXJzZSB0cmVlIGlzIGNsb3NlciB0byB0aGUgdGVtcGxhdGVcbi8vIGludGVudGlvbi5cbmNvbnN0IG1hcmtlciA9IGBsaXQkJHtNYXRoLnJhbmRvbSgpLnRvRml4ZWQoOSkuc2xpY2UoMil9JGA7XG5cbi8vIFN0cmluZyB1c2VkIHRvIHRlbGwgaWYgYSBjb21tZW50IGlzIGEgbWFya2VyIGNvbW1lbnRcbmNvbnN0IG1hcmtlck1hdGNoID0gJz8nICsgbWFya2VyO1xuXG4vLyBUZXh0IHVzZWQgdG8gaW5zZXJ0IGEgY29tbWVudCBtYXJrZXIgbm9kZS4gV2UgdXNlIHByb2Nlc3NpbmcgaW5zdHJ1Y3Rpb25cbi8vIHN5bnRheCBiZWNhdXNlIGl0J3Mgc2xpZ2h0bHkgc21hbGxlciwgYnV0IHBhcnNlcyBhcyBhIGNvbW1lbnQgbm9kZS5cbmNvbnN0IG5vZGVNYXJrZXIgPSBgPCR7bWFya2VyTWF0Y2h9PmA7XG5cbmNvbnN0IGQgPVxuICBOT0RFX01PREUgJiYgZ2xvYmFsLmRvY3VtZW50ID09PSB1bmRlZmluZWRcbiAgICA/ICh7XG4gICAgICAgIGNyZWF0ZVRyZWVXYWxrZXIoKSB7XG4gICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9LFxuICAgICAgfSBhcyB1bmtub3duIGFzIERvY3VtZW50KVxuICAgIDogZG9jdW1lbnQ7XG5cbi8vIENyZWF0ZXMgYSBkeW5hbWljIG1hcmtlci4gV2UgbmV2ZXIgaGF2ZSB0byBzZWFyY2ggZm9yIHRoZXNlIGluIHRoZSBET00uXG5jb25zdCBjcmVhdGVNYXJrZXIgPSAoKSA9PiBkLmNyZWF0ZUNvbW1lbnQoJycpO1xuXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10eXBlb2Ytb3BlcmF0b3JcbnR5cGUgUHJpbWl0aXZlID0gbnVsbCB8IHVuZGVmaW5lZCB8IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmcgfCBzeW1ib2wgfCBiaWdpbnQ7XG5jb25zdCBpc1ByaW1pdGl2ZSA9ICh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFByaW1pdGl2ZSA9PlxuICB2YWx1ZSA9PT0gbnVsbCB8fCAodHlwZW9mIHZhbHVlICE9ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZSAhPSAnZnVuY3Rpb24nKTtcbmNvbnN0IGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuY29uc3QgaXNJdGVyYWJsZSA9ICh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIEl0ZXJhYmxlPHVua25vd24+ID0+XG4gIGlzQXJyYXkodmFsdWUpIHx8XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIHR5cGVvZiAodmFsdWUgYXMgYW55KT8uW1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbic7XG5cbmNvbnN0IFNQQUNFX0NIQVIgPSBgWyBcXHRcXG5cXGZcXHJdYDtcbmNvbnN0IEFUVFJfVkFMVUVfQ0hBUiA9IGBbXiBcXHRcXG5cXGZcXHJcIidcXGA8Pj1dYDtcbmNvbnN0IE5BTUVfQ0hBUiA9IGBbXlxcXFxzXCInPj0vXWA7XG5cbi8vIFRoZXNlIHJlZ2V4ZXMgcmVwcmVzZW50IHRoZSBmaXZlIHBhcnNpbmcgc3RhdGVzIHRoYXQgd2UgY2FyZSBhYm91dCBpbiB0aGVcbi8vIFRlbXBsYXRlJ3MgSFRNTCBzY2FubmVyLiBUaGV5IG1hdGNoIHRoZSAqZW5kKiBvZiB0aGUgc3RhdGUgdGhleSdyZSBuYW1lZFxuLy8gYWZ0ZXIuXG4vLyBEZXBlbmRpbmcgb24gdGhlIG1hdGNoLCB3ZSB0cmFuc2l0aW9uIHRvIGEgbmV3IHN0YXRlLiBJZiB0aGVyZSdzIG5vIG1hdGNoLFxuLy8gd2Ugc3RheSBpbiB0aGUgc2FtZSBzdGF0ZS5cbi8vIE5vdGUgdGhhdCB0aGUgcmVnZXhlcyBhcmUgc3RhdGVmdWwuIFdlIHV0aWxpemUgbGFzdEluZGV4IGFuZCBzeW5jIGl0XG4vLyBhY3Jvc3MgdGhlIG11bHRpcGxlIHJlZ2V4ZXMgdXNlZC4gSW4gYWRkaXRpb24gdG8gdGhlIGZpdmUgcmVnZXhlcyBiZWxvd1xuLy8gd2UgYWxzbyBkeW5hbWljYWxseSBjcmVhdGUgYSByZWdleCB0byBmaW5kIHRoZSBtYXRjaGluZyBlbmQgdGFncyBmb3IgcmF3XG4vLyB0ZXh0IGVsZW1lbnRzLlxuXG4vKipcbiAqIEVuZCBvZiB0ZXh0IGlzOiBgPGAgZm9sbG93ZWQgYnk6XG4gKiAgIChjb21tZW50IHN0YXJ0KSBvciAodGFnKSBvciAoZHluYW1pYyB0YWcgYmluZGluZylcbiAqL1xuY29uc3QgdGV4dEVuZFJlZ2V4ID0gLzwoPzooIS0tfFxcL1teYS16QS1aXSl8KFxcLz9bYS16QS1aXVtePlxcc10qKXwoXFwvPyQpKS9nO1xuY29uc3QgQ09NTUVOVF9TVEFSVCA9IDE7XG5jb25zdCBUQUdfTkFNRSA9IDI7XG5jb25zdCBEWU5BTUlDX1RBR19OQU1FID0gMztcblxuY29uc3QgY29tbWVudEVuZFJlZ2V4ID0gLy0tPi9nO1xuLyoqXG4gKiBDb21tZW50cyBub3Qgc3RhcnRlZCB3aXRoIDwhLS0sIGxpa2UgPC97LCBjYW4gYmUgZW5kZWQgYnkgYSBzaW5nbGUgYD5gXG4gKi9cbmNvbnN0IGNvbW1lbnQyRW5kUmVnZXggPSAvPi9nO1xuXG4vKipcbiAqIFRoZSB0YWdFbmQgcmVnZXggbWF0Y2hlcyB0aGUgZW5kIG9mIHRoZSBcImluc2lkZSBhbiBvcGVuaW5nXCIgdGFnIHN5bnRheFxuICogcG9zaXRpb24uIEl0IGVpdGhlciBtYXRjaGVzIGEgYD5gLCBhbiBhdHRyaWJ1dGUtbGlrZSBzZXF1ZW5jZSwgb3IgdGhlIGVuZFxuICogb2YgdGhlIHN0cmluZyBhZnRlciBhIHNwYWNlIChhdHRyaWJ1dGUtbmFtZSBwb3NpdGlvbiBlbmRpbmcpLlxuICpcbiAqIFNlZSBhdHRyaWJ1dGVzIGluIHRoZSBIVE1MIHNwZWM6XG4gKiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvc3ludGF4Lmh0bWwjZWxlbWVudHMtYXR0cmlidXRlc1xuICpcbiAqIFwiIFxcdFxcblxcZlxcclwiIGFyZSBIVE1MIHNwYWNlIGNoYXJhY3RlcnM6XG4gKiBodHRwczovL2luZnJhLnNwZWMud2hhdHdnLm9yZy8jYXNjaWktd2hpdGVzcGFjZVxuICpcbiAqIFNvIGFuIGF0dHJpYnV0ZSBpczpcbiAqICAqIFRoZSBuYW1lOiBhbnkgY2hhcmFjdGVyIGV4Y2VwdCBhIHdoaXRlc3BhY2UgY2hhcmFjdGVyLCAoXCIpLCAoJyksIFwiPlwiLFxuICogICAgXCI9XCIsIG9yIFwiL1wiLiBOb3RlOiB0aGlzIGlzIGRpZmZlcmVudCBmcm9tIHRoZSBIVE1MIHNwZWMgd2hpY2ggYWxzbyBleGNsdWRlcyBjb250cm9sIGNoYXJhY3RlcnMuXG4gKiAgKiBGb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVyc1xuICogICogRm9sbG93ZWQgYnkgXCI9XCJcbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieTpcbiAqICAgICogQW55IGNoYXJhY3RlciBleGNlcHQgc3BhY2UsICgnKSwgKFwiKSwgXCI8XCIsIFwiPlwiLCBcIj1cIiwgKGApLCBvclxuICogICAgKiAoXCIpIHRoZW4gYW55IG5vbi0oXCIpLCBvclxuICogICAgKiAoJykgdGhlbiBhbnkgbm9uLSgnKVxuICovXG5jb25zdCB0YWdFbmRSZWdleCA9IG5ldyBSZWdFeHAoXG4gIGA+fCR7U1BBQ0VfQ0hBUn0oPzooJHtOQU1FX0NIQVJ9KykoJHtTUEFDRV9DSEFSfSo9JHtTUEFDRV9DSEFSfSooPzoke0FUVFJfVkFMVUVfQ0hBUn18KFwifCcpfCkpfCQpYCxcbiAgJ2cnXG4pO1xuY29uc3QgRU5USVJFX01BVENIID0gMDtcbmNvbnN0IEFUVFJJQlVURV9OQU1FID0gMTtcbmNvbnN0IFNQQUNFU19BTkRfRVFVQUxTID0gMjtcbmNvbnN0IFFVT1RFX0NIQVIgPSAzO1xuXG5jb25zdCBzaW5nbGVRdW90ZUF0dHJFbmRSZWdleCA9IC8nL2c7XG5jb25zdCBkb3VibGVRdW90ZUF0dHJFbmRSZWdleCA9IC9cIi9nO1xuLyoqXG4gKiBNYXRjaGVzIHRoZSByYXcgdGV4dCBlbGVtZW50cy5cbiAqXG4gKiBDb21tZW50cyBhcmUgbm90IHBhcnNlZCB3aXRoaW4gcmF3IHRleHQgZWxlbWVudHMsIHNvIHdlIG5lZWQgdG8gc2VhcmNoIHRoZWlyXG4gKiB0ZXh0IGNvbnRlbnQgZm9yIG1hcmtlciBzdHJpbmdzLlxuICovXG5jb25zdCByYXdUZXh0RWxlbWVudCA9IC9eKD86c2NyaXB0fHN0eWxlfHRleHRhcmVhfHRpdGxlKSQvaTtcblxuLyoqIFRlbXBsYXRlUmVzdWx0IHR5cGVzICovXG5jb25zdCBIVE1MX1JFU1VMVCA9IDE7XG5jb25zdCBTVkdfUkVTVUxUID0gMjtcbmNvbnN0IE1BVEhNTF9SRVNVTFQgPSAzO1xuXG50eXBlIFJlc3VsdFR5cGUgPSB0eXBlb2YgSFRNTF9SRVNVTFQgfCB0eXBlb2YgU1ZHX1JFU1VMVCB8IHR5cGVvZiBNQVRITUxfUkVTVUxUO1xuXG4vLyBUZW1wbGF0ZVBhcnQgdHlwZXNcbi8vIElNUE9SVEFOVDogdGhlc2UgbXVzdCBtYXRjaCB0aGUgdmFsdWVzIGluIFBhcnRUeXBlXG5jb25zdCBBVFRSSUJVVEVfUEFSVCA9IDE7XG5jb25zdCBDSElMRF9QQVJUID0gMjtcbmNvbnN0IFBST1BFUlRZX1BBUlQgPSAzO1xuY29uc3QgQk9PTEVBTl9BVFRSSUJVVEVfUEFSVCA9IDQ7XG5jb25zdCBFVkVOVF9QQVJUID0gNTtcbmNvbnN0IEVMRU1FTlRfUEFSVCA9IDY7XG5jb25zdCBDT01NRU5UX1BBUlQgPSA3O1xuXG4vKipcbiAqIFRoZSByZXR1cm4gdHlwZSBvZiB0aGUgdGVtcGxhdGUgdGFnIGZ1bmN0aW9ucywge0BsaW5rY29kZSBodG1sfSBhbmRcbiAqIHtAbGlua2NvZGUgc3ZnfSB3aGVuIGl0IGhhc24ndCBiZWVuIGNvbXBpbGVkIGJ5IEBsaXQtbGFicy9jb21waWxlci5cbiAqXG4gKiBBIGBUZW1wbGF0ZVJlc3VsdGAgb2JqZWN0IGhvbGRzIGFsbCB0aGUgaW5mb3JtYXRpb24gYWJvdXQgYSB0ZW1wbGF0ZVxuICogZXhwcmVzc2lvbiByZXF1aXJlZCB0byByZW5kZXIgaXQ6IHRoZSB0ZW1wbGF0ZSBzdHJpbmdzLCBleHByZXNzaW9uIHZhbHVlcyxcbiAqIGFuZCB0eXBlIG9mIHRlbXBsYXRlIChodG1sIG9yIHN2ZykuXG4gKlxuICogYFRlbXBsYXRlUmVzdWx0YCBvYmplY3RzIGRvIG5vdCBjcmVhdGUgYW55IERPTSBvbiB0aGVpciBvd24uIFRvIGNyZWF0ZSBvclxuICogdXBkYXRlIERPTSB5b3UgbmVlZCB0byByZW5kZXIgdGhlIGBUZW1wbGF0ZVJlc3VsdGAuIFNlZVxuICogW1JlbmRlcmluZ10oaHR0cHM6Ly9saXQuZGV2L2RvY3MvY29tcG9uZW50cy9yZW5kZXJpbmcpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqL1xuZXhwb3J0IHR5cGUgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0PFQgZXh0ZW5kcyBSZXN1bHRUeXBlID0gUmVzdWx0VHlwZT4gPSB7XG4gIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gIFsnXyRsaXRUeXBlJCddOiBUO1xuICBzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheTtcbiAgdmFsdWVzOiB1bmtub3duW107XG59O1xuXG4vKipcbiAqIFRoaXMgaXMgYSB0ZW1wbGF0ZSByZXN1bHQgdGhhdCBtYXkgYmUgZWl0aGVyIHVuY29tcGlsZWQgb3IgY29tcGlsZWQuXG4gKlxuICogSW4gdGhlIGZ1dHVyZSwgVGVtcGxhdGVSZXN1bHQgd2lsbCBiZSB0aGlzIHR5cGUuIElmIHlvdSB3YW50IHRvIGV4cGxpY2l0bHlcbiAqIG5vdGUgdGhhdCBhIHRlbXBsYXRlIHJlc3VsdCBpcyBwb3RlbnRpYWxseSBjb21waWxlZCwgeW91IGNhbiByZWZlcmVuY2UgdGhpc1xuICogdHlwZSBhbmQgaXQgd2lsbCBjb250aW51ZSB0byBiZWhhdmUgdGhlIHNhbWUgdGhyb3VnaCB0aGUgbmV4dCBtYWpvciB2ZXJzaW9uXG4gKiBvZiBMaXQuIFRoaXMgY2FuIGJlIHVzZWZ1bCBmb3IgY29kZSB0aGF0IHdhbnRzIHRvIHByZXBhcmUgZm9yIHRoZSBuZXh0XG4gKiBtYWpvciB2ZXJzaW9uIG9mIExpdC5cbiAqL1xuZXhwb3J0IHR5cGUgTWF5YmVDb21waWxlZFRlbXBsYXRlUmVzdWx0PFQgZXh0ZW5kcyBSZXN1bHRUeXBlID0gUmVzdWx0VHlwZT4gPVxuICB8IFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUPlxuICB8IENvbXBpbGVkVGVtcGxhdGVSZXN1bHQ7XG5cbi8qKlxuICogVGhlIHJldHVybiB0eXBlIG9mIHRoZSB0ZW1wbGF0ZSB0YWcgZnVuY3Rpb25zLCB7QGxpbmtjb2RlIGh0bWx9IGFuZFxuICoge0BsaW5rY29kZSBzdmd9LlxuICpcbiAqIEEgYFRlbXBsYXRlUmVzdWx0YCBvYmplY3QgaG9sZHMgYWxsIHRoZSBpbmZvcm1hdGlvbiBhYm91dCBhIHRlbXBsYXRlXG4gKiBleHByZXNzaW9uIHJlcXVpcmVkIHRvIHJlbmRlciBpdDogdGhlIHRlbXBsYXRlIHN0cmluZ3MsIGV4cHJlc3Npb24gdmFsdWVzLFxuICogYW5kIHR5cGUgb2YgdGVtcGxhdGUgKGh0bWwgb3Igc3ZnKS5cbiAqXG4gKiBgVGVtcGxhdGVSZXN1bHRgIG9iamVjdHMgZG8gbm90IGNyZWF0ZSBhbnkgRE9NIG9uIHRoZWlyIG93bi4gVG8gY3JlYXRlIG9yXG4gKiB1cGRhdGUgRE9NIHlvdSBuZWVkIHRvIHJlbmRlciB0aGUgYFRlbXBsYXRlUmVzdWx0YC4gU2VlXG4gKiBbUmVuZGVyaW5nXShodHRwczovL2xpdC5kZXYvZG9jcy9jb21wb25lbnRzL3JlbmRlcmluZykgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogSW4gTGl0IDQsIHRoaXMgdHlwZSB3aWxsIGJlIGFuIGFsaWFzIG9mXG4gKiBNYXliZUNvbXBpbGVkVGVtcGxhdGVSZXN1bHQsIHNvIHRoYXQgY29kZSB3aWxsIGdldCB0eXBlIGVycm9ycyBpZiBpdCBhc3N1bWVzXG4gKiB0aGF0IExpdCB0ZW1wbGF0ZXMgYXJlIG5vdCBjb21waWxlZC4gV2hlbiBkZWxpYmVyYXRlbHkgd29ya2luZyB3aXRoIG9ubHlcbiAqIG9uZSwgdXNlIGVpdGhlciB7QGxpbmtjb2RlIENvbXBpbGVkVGVtcGxhdGVSZXN1bHR9IG9yXG4gKiB7QGxpbmtjb2RlIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdH0gZXhwbGljaXRseS5cbiAqL1xuZXhwb3J0IHR5cGUgVGVtcGxhdGVSZXN1bHQ8VCBleHRlbmRzIFJlc3VsdFR5cGUgPSBSZXN1bHRUeXBlPiA9XG4gIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUPjtcblxuZXhwb3J0IHR5cGUgSFRNTFRlbXBsYXRlUmVzdWx0ID0gVGVtcGxhdGVSZXN1bHQ8dHlwZW9mIEhUTUxfUkVTVUxUPjtcblxuZXhwb3J0IHR5cGUgU1ZHVGVtcGxhdGVSZXN1bHQgPSBUZW1wbGF0ZVJlc3VsdDx0eXBlb2YgU1ZHX1JFU1VMVD47XG5cbmV4cG9ydCB0eXBlIE1hdGhNTFRlbXBsYXRlUmVzdWx0ID0gVGVtcGxhdGVSZXN1bHQ8dHlwZW9mIE1BVEhNTF9SRVNVTFQ+O1xuXG4vKipcbiAqIEEgVGVtcGxhdGVSZXN1bHQgdGhhdCBoYXMgYmVlbiBjb21waWxlZCBieSBAbGl0LWxhYnMvY29tcGlsZXIsIHNraXBwaW5nIHRoZVxuICogcHJlcGFyZSBzdGVwLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVkVGVtcGxhdGVSZXN1bHQge1xuICAvLyBUaGlzIGlzIGEgZmFjdG9yeSBpbiBvcmRlciB0byBtYWtlIHRlbXBsYXRlIGluaXRpYWxpemF0aW9uIGxhenlcbiAgLy8gYW5kIGFsbG93IFNoYWR5UmVuZGVyT3B0aW9ucyBzY29wZSB0byBiZSBwYXNzZWQgaW4uXG4gIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gIFsnXyRsaXRUeXBlJCddOiBDb21waWxlZFRlbXBsYXRlO1xuICB2YWx1ZXM6IHVua25vd25bXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlZFRlbXBsYXRlIGV4dGVuZHMgT21pdDxUZW1wbGF0ZSwgJ2VsJz4ge1xuICAvLyBlbCBpcyBvdmVycmlkZGVuIHRvIGJlIG9wdGlvbmFsLiBXZSBpbml0aWFsaXplIGl0IG9uIGZpcnN0IHJlbmRlclxuICBlbD86IEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XG5cbiAgLy8gVGhlIHByZXBhcmVkIEhUTUwgc3RyaW5nIHRvIGNyZWF0ZSBhIHRlbXBsYXRlIGVsZW1lbnQgZnJvbS5cbiAgLy8gVGhlIHR5cGUgaXMgYSBUZW1wbGF0ZVN0cmluZ3NBcnJheSB0byBndWFyYW50ZWUgdGhhdCB0aGUgdmFsdWUgY2FtZSBmcm9tXG4gIC8vIHNvdXJjZSBjb2RlLCBwcmV2ZW50aW5nIGEgSlNPTiBpbmplY3Rpb24gYXR0YWNrLlxuICBoOiBUZW1wbGF0ZVN0cmluZ3NBcnJheTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSB0ZW1wbGF0ZSBsaXRlcmFsIHRhZyBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBUZW1wbGF0ZVJlc3VsdCB3aXRoXG4gKiB0aGUgZ2l2ZW4gcmVzdWx0IHR5cGUuXG4gKi9cbmNvbnN0IHRhZyA9XG4gIDxUIGV4dGVuZHMgUmVzdWx0VHlwZT4odHlwZTogVCkgPT5cbiAgKHN0cmluZ3M6IFRlbXBsYXRlU3RyaW5nc0FycmF5LCAuLi52YWx1ZXM6IHVua25vd25bXSk6IFRlbXBsYXRlUmVzdWx0PFQ+ID0+IHtcbiAgICAvLyBXYXJuIGFnYWluc3QgdGVtcGxhdGVzIG9jdGFsIGVzY2FwZSBzZXF1ZW5jZXNcbiAgICAvLyBXZSBkbyB0aGlzIGhlcmUgcmF0aGVyIHRoYW4gaW4gcmVuZGVyIHNvIHRoYXQgdGhlIHdhcm5pbmcgaXMgY2xvc2VyIHRvIHRoZVxuICAgIC8vIHRlbXBsYXRlIGRlZmluaXRpb24uXG4gICAgaWYgKERFVl9NT0RFICYmIHN0cmluZ3Muc29tZSgocykgPT4gcyA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAnU29tZSB0ZW1wbGF0ZSBzdHJpbmdzIGFyZSB1bmRlZmluZWQuXFxuJyArXG4gICAgICAgICAgJ1RoaXMgaXMgcHJvYmFibHkgY2F1c2VkIGJ5IGlsbGVnYWwgb2N0YWwgZXNjYXBlIHNlcXVlbmNlcy4nXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoREVWX01PREUpIHtcbiAgICAgIC8vIEltcG9ydCBzdGF0aWMtaHRtbC5qcyByZXN1bHRzIGluIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSB3aGljaCBnMyBkb2Vzbid0XG4gICAgICAvLyBoYW5kbGUuIEluc3RlYWQgd2Uga25vdyB0aGF0IHN0YXRpYyB2YWx1ZXMgbXVzdCBoYXZlIHRoZSBmaWVsZFxuICAgICAgLy8gYF8kbGl0U3RhdGljJGAuXG4gICAgICBpZiAoXG4gICAgICAgIHZhbHVlcy5zb21lKCh2YWwpID0+ICh2YWwgYXMge18kbGl0U3RhdGljJDogdW5rbm93bn0pPy5bJ18kbGl0U3RhdGljJCddKVxuICAgICAgKSB7XG4gICAgICAgIGlzc3VlV2FybmluZyhcbiAgICAgICAgICAnJyxcbiAgICAgICAgICBgU3RhdGljIHZhbHVlcyAnbGl0ZXJhbCcgb3IgJ3Vuc2FmZVN0YXRpYycgY2Fubm90IGJlIHVzZWQgYXMgdmFsdWVzIHRvIG5vbi1zdGF0aWMgdGVtcGxhdGVzLlxcbmAgK1xuICAgICAgICAgICAgYFBsZWFzZSB1c2UgdGhlIHN0YXRpYyAnaHRtbCcgdGFnIGZ1bmN0aW9uLiBTZWUgaHR0cHM6Ly9saXQuZGV2L2RvY3MvdGVtcGxhdGVzL2V4cHJlc3Npb25zLyNzdGF0aWMtZXhwcmVzc2lvbnNgXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgICAgWydfJGxpdFR5cGUkJ106IHR5cGUsXG4gICAgICBzdHJpbmdzLFxuICAgICAgdmFsdWVzLFxuICAgIH07XG4gIH07XG5cbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgYW4gSFRNTCB0ZW1wbGF0ZSB0aGF0IGNhbiBlZmZpY2llbnRseVxuICogcmVuZGVyIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IGhlYWRlciA9ICh0aXRsZTogc3RyaW5nKSA9PiBodG1sYDxoMT4ke3RpdGxlfTwvaDE+YDtcbiAqIGBgYFxuICpcbiAqIFRoZSBgaHRtbGAgdGFnIHJldHVybnMgYSBkZXNjcmlwdGlvbiBvZiB0aGUgRE9NIHRvIHJlbmRlciBhcyBhIHZhbHVlLiBJdCBpc1xuICogbGF6eSwgbWVhbmluZyBubyB3b3JrIGlzIGRvbmUgdW50aWwgdGhlIHRlbXBsYXRlIGlzIHJlbmRlcmVkLiBXaGVuIHJlbmRlcmluZyxcbiAqIGlmIGEgdGVtcGxhdGUgY29tZXMgZnJvbSB0aGUgc2FtZSBleHByZXNzaW9uIGFzIGEgcHJldmlvdXNseSByZW5kZXJlZCByZXN1bHQsXG4gKiBpdCdzIGVmZmljaWVudGx5IHVwZGF0ZWQgaW5zdGVhZCBvZiByZXBsYWNlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGh0bWwgPSB0YWcoSFRNTF9SRVNVTFQpO1xuXG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIFNWRyBmcmFnbWVudCB0aGF0IGNhbiBlZmZpY2llbnRseSByZW5kZXJcbiAqIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IHJlY3QgPSBzdmdgPHJlY3Qgd2lkdGg9XCIxMFwiIGhlaWdodD1cIjEwXCI+PC9yZWN0PmA7XG4gKlxuICogY29uc3QgbXlJbWFnZSA9IGh0bWxgXG4gKiAgIDxzdmcgdmlld0JveD1cIjAgMCAxMCAxMFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAqICAgICAke3JlY3R9XG4gKiAgIDwvc3ZnPmA7XG4gKiBgYGBcbiAqXG4gKiBUaGUgYHN2Z2AgKnRhZyBmdW5jdGlvbiogc2hvdWxkIG9ubHkgYmUgdXNlZCBmb3IgU1ZHIGZyYWdtZW50cywgb3IgZWxlbWVudHNcbiAqIHRoYXQgd291bGQgYmUgY29udGFpbmVkICoqaW5zaWRlKiogYW4gYDxzdmc+YCBIVE1MIGVsZW1lbnQuIEEgY29tbW9uIGVycm9yIGlzXG4gKiBwbGFjaW5nIGFuIGA8c3ZnPmAgKmVsZW1lbnQqIGluIGEgdGVtcGxhdGUgdGFnZ2VkIHdpdGggdGhlIGBzdmdgIHRhZ1xuICogZnVuY3Rpb24uIFRoZSBgPHN2Zz5gIGVsZW1lbnQgaXMgYW4gSFRNTCBlbGVtZW50IGFuZCBzaG91bGQgYmUgdXNlZCB3aXRoaW4gYVxuICogdGVtcGxhdGUgdGFnZ2VkIHdpdGggdGhlIHtAbGlua2NvZGUgaHRtbH0gdGFnIGZ1bmN0aW9uLlxuICpcbiAqIEluIExpdEVsZW1lbnQgdXNhZ2UsIGl0J3MgaW52YWxpZCB0byByZXR1cm4gYW4gU1ZHIGZyYWdtZW50IGZyb20gdGhlXG4gKiBgcmVuZGVyKClgIG1ldGhvZCwgYXMgdGhlIFNWRyBmcmFnbWVudCB3aWxsIGJlIGNvbnRhaW5lZCB3aXRoaW4gdGhlIGVsZW1lbnQnc1xuICogc2hhZG93IHJvb3QgYW5kIHRodXMgbm90IGJlIHByb3Blcmx5IGNvbnRhaW5lZCB3aXRoaW4gYW4gYDxzdmc+YCBIVE1MXG4gKiBlbGVtZW50LlxuICovXG5leHBvcnQgY29uc3Qgc3ZnID0gdGFnKFNWR19SRVNVTFQpO1xuXG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIE1hdGhNTCBmcmFnbWVudCB0aGF0IGNhbiBlZmZpY2llbnRseSByZW5kZXJcbiAqIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IG51bSA9IG1hdGhtbGA8bW4+MTwvbW4+YDtcbiAqXG4gKiBjb25zdCBlcSA9IGh0bWxgXG4gKiAgIDxtYXRoPlxuICogICAgICR7bnVtfVxuICogICA8L21hdGg+YDtcbiAqIGBgYFxuICpcbiAqIFRoZSBgbWF0aG1sYCAqdGFnIGZ1bmN0aW9uKiBzaG91bGQgb25seSBiZSB1c2VkIGZvciBNYXRoTUwgZnJhZ21lbnRzLCBvclxuICogZWxlbWVudHMgdGhhdCB3b3VsZCBiZSBjb250YWluZWQgKippbnNpZGUqKiBhIGA8bWF0aD5gIEhUTUwgZWxlbWVudC4gQSBjb21tb25cbiAqIGVycm9yIGlzIHBsYWNpbmcgYSBgPG1hdGg+YCAqZWxlbWVudCogaW4gYSB0ZW1wbGF0ZSB0YWdnZWQgd2l0aCB0aGUgYG1hdGhtbGBcbiAqIHRhZyBmdW5jdGlvbi4gVGhlIGA8bWF0aD5gIGVsZW1lbnQgaXMgYW4gSFRNTCBlbGVtZW50IGFuZCBzaG91bGQgYmUgdXNlZFxuICogd2l0aGluIGEgdGVtcGxhdGUgdGFnZ2VkIHdpdGggdGhlIHtAbGlua2NvZGUgaHRtbH0gdGFnIGZ1bmN0aW9uLlxuICpcbiAqIEluIExpdEVsZW1lbnQgdXNhZ2UsIGl0J3MgaW52YWxpZCB0byByZXR1cm4gYW4gTWF0aE1MIGZyYWdtZW50IGZyb20gdGhlXG4gKiBgcmVuZGVyKClgIG1ldGhvZCwgYXMgdGhlIE1hdGhNTCBmcmFnbWVudCB3aWxsIGJlIGNvbnRhaW5lZCB3aXRoaW4gdGhlXG4gKiBlbGVtZW50J3Mgc2hhZG93IHJvb3QgYW5kIHRodXMgbm90IGJlIHByb3Blcmx5IGNvbnRhaW5lZCB3aXRoaW4gYSBgPG1hdGg+YFxuICogSFRNTCBlbGVtZW50LlxuICovXG5leHBvcnQgY29uc3QgbWF0aG1sID0gdGFnKE1BVEhNTF9SRVNVTFQpO1xuXG4vKipcbiAqIEEgc2VudGluZWwgdmFsdWUgdGhhdCBzaWduYWxzIHRoYXQgYSB2YWx1ZSB3YXMgaGFuZGxlZCBieSBhIGRpcmVjdGl2ZSBhbmRcbiAqIHNob3VsZCBub3QgYmUgd3JpdHRlbiB0byB0aGUgRE9NLlxuICovXG5leHBvcnQgY29uc3Qgbm9DaGFuZ2UgPSBTeW1ib2wuZm9yKCdsaXQtbm9DaGFuZ2UnKTtcblxuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHRoYXQgc2lnbmFscyBhIENoaWxkUGFydCB0byBmdWxseSBjbGVhciBpdHMgY29udGVudC5cbiAqXG4gKiBgYGB0c1xuICogY29uc3QgYnV0dG9uID0gaHRtbGAke1xuICogIHVzZXIuaXNBZG1pblxuICogICAgPyBodG1sYDxidXR0b24+REVMRVRFPC9idXR0b24+YFxuICogICAgOiBub3RoaW5nXG4gKiB9YDtcbiAqIGBgYFxuICpcbiAqIFByZWZlciB1c2luZyBgbm90aGluZ2Agb3ZlciBvdGhlciBmYWxzeSB2YWx1ZXMgYXMgaXQgcHJvdmlkZXMgYSBjb25zaXN0ZW50XG4gKiBiZWhhdmlvciBiZXR3ZWVuIHZhcmlvdXMgZXhwcmVzc2lvbiBiaW5kaW5nIGNvbnRleHRzLlxuICpcbiAqIEluIGNoaWxkIGV4cHJlc3Npb25zLCBgdW5kZWZpbmVkYCwgYG51bGxgLCBgJydgLCBhbmQgYG5vdGhpbmdgIGFsbCBiZWhhdmUgdGhlXG4gKiBzYW1lIGFuZCByZW5kZXIgbm8gbm9kZXMuIEluIGF0dHJpYnV0ZSBleHByZXNzaW9ucywgYG5vdGhpbmdgIF9yZW1vdmVzXyB0aGVcbiAqIGF0dHJpYnV0ZSwgd2hpbGUgYHVuZGVmaW5lZGAgYW5kIGBudWxsYCB3aWxsIHJlbmRlciBhbiBlbXB0eSBzdHJpbmcuIEluXG4gKiBwcm9wZXJ0eSBleHByZXNzaW9ucyBgbm90aGluZ2AgYmVjb21lcyBgdW5kZWZpbmVkYC5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vdGhpbmcgPSBTeW1ib2wuZm9yKCdsaXQtbm90aGluZycpO1xuXG4vKipcbiAqIFRoZSBjYWNoZSBvZiBwcmVwYXJlZCB0ZW1wbGF0ZXMsIGtleWVkIGJ5IHRoZSB0YWdnZWQgVGVtcGxhdGVTdHJpbmdzQXJyYXlcbiAqIGFuZCBfbm90XyBhY2NvdW50aW5nIGZvciB0aGUgc3BlY2lmaWMgdGVtcGxhdGUgdGFnIHVzZWQuIFRoaXMgbWVhbnMgdGhhdFxuICogdGVtcGxhdGUgdGFncyBjYW5ub3QgYmUgZHluYW1pYyAtIHRoZXkgbXVzdCBzdGF0aWNhbGx5IGJlIG9uZSBvZiBodG1sLCBzdmcsXG4gKiBvciBhdHRyLiBUaGlzIHJlc3RyaWN0aW9uIHNpbXBsaWZpZXMgdGhlIGNhY2hlIGxvb2t1cCwgd2hpY2ggaXMgb24gdGhlIGhvdFxuICogcGF0aCBmb3IgcmVuZGVyaW5nLlxuICovXG5jb25zdCB0ZW1wbGF0ZUNhY2hlID0gbmV3IFdlYWtNYXA8VGVtcGxhdGVTdHJpbmdzQXJyYXksIFRlbXBsYXRlPigpO1xuXG4vKipcbiAqIE9iamVjdCBzcGVjaWZ5aW5nIG9wdGlvbnMgZm9yIGNvbnRyb2xsaW5nIGxpdC1odG1sIHJlbmRlcmluZy4gTm90ZSB0aGF0XG4gKiB3aGlsZSBgcmVuZGVyYCBtYXkgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIG9uIHRoZSBzYW1lIGBjb250YWluZXJgIChhbmRcbiAqIGByZW5kZXJCZWZvcmVgIHJlZmVyZW5jZSBub2RlKSB0byBlZmZpY2llbnRseSB1cGRhdGUgdGhlIHJlbmRlcmVkIGNvbnRlbnQsXG4gKiBvbmx5IHRoZSBvcHRpb25zIHBhc3NlZCBpbiBkdXJpbmcgdGhlIGZpcnN0IHJlbmRlciBhcmUgcmVzcGVjdGVkIGR1cmluZ1xuICogdGhlIGxpZmV0aW1lIG9mIHJlbmRlcnMgdG8gdGhhdCB1bmlxdWUgYGNvbnRhaW5lcmAgKyBgcmVuZGVyQmVmb3JlYFxuICogY29tYmluYXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBBbiBvYmplY3QgdG8gdXNlIGFzIHRoZSBgdGhpc2AgdmFsdWUgZm9yIGV2ZW50IGxpc3RlbmVycy4gSXQncyBvZnRlblxuICAgKiB1c2VmdWwgdG8gc2V0IHRoaXMgdG8gdGhlIGhvc3QgY29tcG9uZW50IHJlbmRlcmluZyBhIHRlbXBsYXRlLlxuICAgKi9cbiAgaG9zdD86IG9iamVjdDtcbiAgLyoqXG4gICAqIEEgRE9NIG5vZGUgYmVmb3JlIHdoaWNoIHRvIHJlbmRlciBjb250ZW50IGluIHRoZSBjb250YWluZXIuXG4gICAqL1xuICByZW5kZXJCZWZvcmU/OiBDaGlsZE5vZGUgfCBudWxsO1xuICAvKipcbiAgICogTm9kZSB1c2VkIGZvciBjbG9uaW5nIHRoZSB0ZW1wbGF0ZSAoYGltcG9ydE5vZGVgIHdpbGwgYmUgY2FsbGVkIG9uIHRoaXNcbiAgICogbm9kZSkuIFRoaXMgY29udHJvbHMgdGhlIGBvd25lckRvY3VtZW50YCBvZiB0aGUgcmVuZGVyZWQgRE9NLCBhbG9uZyB3aXRoXG4gICAqIGFueSBpbmhlcml0ZWQgY29udGV4dC4gRGVmYXVsdHMgdG8gdGhlIGdsb2JhbCBgZG9jdW1lbnRgLlxuICAgKi9cbiAgY3JlYXRpb25TY29wZT86IHtpbXBvcnROb2RlKG5vZGU6IE5vZGUsIGRlZXA/OiBib29sZWFuKTogTm9kZX07XG4gIC8qKlxuICAgKiBUaGUgaW5pdGlhbCBjb25uZWN0ZWQgc3RhdGUgZm9yIHRoZSB0b3AtbGV2ZWwgcGFydCBiZWluZyByZW5kZXJlZC4gSWYgbm9cbiAgICogYGlzQ29ubmVjdGVkYCBvcHRpb24gaXMgc2V0LCBgQXN5bmNEaXJlY3RpdmVgcyB3aWxsIGJlIGNvbm5lY3RlZCBieVxuICAgKiBkZWZhdWx0LiBTZXQgdG8gYGZhbHNlYCBpZiB0aGUgaW5pdGlhbCByZW5kZXIgb2NjdXJzIGluIGEgZGlzY29ubmVjdGVkIHRyZWVcbiAgICogYW5kIGBBc3luY0RpcmVjdGl2ZWBzIHNob3VsZCBzZWUgYGlzQ29ubmVjdGVkID09PSBmYWxzZWAgZm9yIHRoZWlyIGluaXRpYWxcbiAgICogcmVuZGVyLiBUaGUgYHBhcnQuc2V0Q29ubmVjdGVkKClgIG1ldGhvZCBtdXN0IGJlIHVzZWQgc3Vic2VxdWVudCB0byBpbml0aWFsXG4gICAqIHJlbmRlciB0byBjaGFuZ2UgdGhlIGNvbm5lY3RlZCBzdGF0ZSBvZiB0aGUgcGFydC5cbiAgICovXG4gIGlzQ29ubmVjdGVkPzogYm9vbGVhbjtcbn1cblxuY29uc3Qgd2Fsa2VyID0gZC5jcmVhdGVUcmVlV2Fsa2VyKFxuICBkLFxuICAxMjkgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR9ICovXG4pO1xuXG5sZXQgc2FuaXRpemVyRmFjdG9yeUludGVybmFsOiBTYW5pdGl6ZXJGYWN0b3J5ID0gbm9vcFNhbml0aXplcjtcblxuLy9cbi8vIENsYXNzZXMgb25seSBiZWxvdyBoZXJlLCBjb25zdCB2YXJpYWJsZSBkZWNsYXJhdGlvbnMgb25seSBhYm92ZSBoZXJlLi4uXG4vL1xuLy8gS2VlcGluZyB2YXJpYWJsZSBkZWNsYXJhdGlvbnMgYW5kIGNsYXNzZXMgdG9nZXRoZXIgaW1wcm92ZXMgbWluaWZpY2F0aW9uLlxuLy8gSW50ZXJmYWNlcyBhbmQgdHlwZSBhbGlhc2VzIGNhbiBiZSBpbnRlcmxlYXZlZCBmcmVlbHkuXG4vL1xuXG4vLyBUeXBlIGZvciBjbGFzc2VzIHRoYXQgaGF2ZSBhIGBfZGlyZWN0aXZlYCBvciBgX2RpcmVjdGl2ZXNbXWAgZmllbGQsIHVzZWQgYnlcbi8vIGByZXNvbHZlRGlyZWN0aXZlYFxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVQYXJlbnQge1xuICBfJHBhcmVudD86IERpcmVjdGl2ZVBhcmVudDtcbiAgXyRpc0Nvbm5lY3RlZDogYm9vbGVhbjtcbiAgX19kaXJlY3RpdmU/OiBEaXJlY3RpdmU7XG4gIF9fZGlyZWN0aXZlcz86IEFycmF5PERpcmVjdGl2ZSB8IHVuZGVmaW5lZD47XG59XG5cbmZ1bmN0aW9uIHRydXN0RnJvbVRlbXBsYXRlU3RyaW5nKFxuICB0c2E6IFRlbXBsYXRlU3RyaW5nc0FycmF5LFxuICBzdHJpbmdGcm9tVFNBOiBzdHJpbmdcbik6IFRydXN0ZWRIVE1MIHtcbiAgLy8gQSBzZWN1cml0eSBjaGVjayB0byBwcmV2ZW50IHNwb29maW5nIG9mIExpdCB0ZW1wbGF0ZSByZXN1bHRzLlxuICAvLyBJbiB0aGUgZnV0dXJlLCB3ZSBtYXkgYmUgYWJsZSB0byByZXBsYWNlIHRoaXMgd2l0aCBBcnJheS5pc1RlbXBsYXRlT2JqZWN0LFxuICAvLyB0aG91Z2ggd2UgbWlnaHQgbmVlZCB0byBtYWtlIHRoYXQgY2hlY2sgaW5zaWRlIG9mIHRoZSBodG1sIGFuZCBzdmdcbiAgLy8gZnVuY3Rpb25zLCBiZWNhdXNlIHByZWNvbXBpbGVkIHRlbXBsYXRlcyBkb24ndCBjb21lIGluIGFzXG4gIC8vIFRlbXBsYXRlU3RyaW5nQXJyYXkgb2JqZWN0cy5cbiAgaWYgKCFpc0FycmF5KHRzYSkgfHwgIXRzYS5oYXNPd25Qcm9wZXJ0eSgncmF3JykpIHtcbiAgICBsZXQgbWVzc2FnZSA9ICdpbnZhbGlkIHRlbXBsYXRlIHN0cmluZ3MgYXJyYXknO1xuICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgbWVzc2FnZSA9IGBcbiAgICAgICAgICBJbnRlcm5hbCBFcnJvcjogZXhwZWN0ZWQgdGVtcGxhdGUgc3RyaW5ncyB0byBiZSBhbiBhcnJheVxuICAgICAgICAgIHdpdGggYSAncmF3JyBmaWVsZC4gRmFraW5nIGEgdGVtcGxhdGUgc3RyaW5ncyBhcnJheSBieVxuICAgICAgICAgIGNhbGxpbmcgaHRtbCBvciBzdmcgbGlrZSBhbiBvcmRpbmFyeSBmdW5jdGlvbiBpcyBlZmZlY3RpdmVseVxuICAgICAgICAgIHRoZSBzYW1lIGFzIGNhbGxpbmcgdW5zYWZlSHRtbCBhbmQgY2FuIGxlYWQgdG8gbWFqb3Igc2VjdXJpdHlcbiAgICAgICAgICBpc3N1ZXMsIGUuZy4gb3BlbmluZyB5b3VyIGNvZGUgdXAgdG8gWFNTIGF0dGFja3MuXG4gICAgICAgICAgSWYgeW91J3JlIHVzaW5nIHRoZSBodG1sIG9yIHN2ZyB0YWdnZWQgdGVtcGxhdGUgZnVuY3Rpb25zIG5vcm1hbGx5XG4gICAgICAgICAgYW5kIHN0aWxsIHNlZWluZyB0aGlzIGVycm9yLCBwbGVhc2UgZmlsZSBhIGJ1ZyBhdFxuICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9saXQvbGl0L2lzc3Vlcy9uZXc/dGVtcGxhdGU9YnVnX3JlcG9ydC5tZFxuICAgICAgICAgIGFuZCBpbmNsdWRlIGluZm9ybWF0aW9uIGFib3V0IHlvdXIgYnVpbGQgdG9vbGluZywgaWYgYW55LlxuICAgICAgICBgXG4gICAgICAgIC50cmltKClcbiAgICAgICAgLnJlcGxhY2UoL1xcbiAqL2csICdcXG4nKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICB9XG4gIHJldHVybiBwb2xpY3kgIT09IHVuZGVmaW5lZFxuICAgID8gcG9saWN5LmNyZWF0ZUhUTUwoc3RyaW5nRnJvbVRTQSlcbiAgICA6IChzdHJpbmdGcm9tVFNBIGFzIHVua25vd24gYXMgVHJ1c3RlZEhUTUwpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gSFRNTCBzdHJpbmcgZm9yIHRoZSBnaXZlbiBUZW1wbGF0ZVN0cmluZ3NBcnJheSBhbmQgcmVzdWx0IHR5cGVcbiAqIChIVE1MIG9yIFNWRyksIGFsb25nIHdpdGggdGhlIGNhc2Utc2Vuc2l0aXZlIGJvdW5kIGF0dHJpYnV0ZSBuYW1lcyBpblxuICogdGVtcGxhdGUgb3JkZXIuIFRoZSBIVE1MIGNvbnRhaW5zIGNvbW1lbnQgbWFya2VycyBkZW5vdGluZyB0aGUgYENoaWxkUGFydGBzXG4gKiBhbmQgc3VmZml4ZXMgb24gYm91bmQgYXR0cmlidXRlcyBkZW5vdGluZyB0aGUgYEF0dHJpYnV0ZVBhcnRzYC5cbiAqXG4gKiBAcGFyYW0gc3RyaW5ncyB0ZW1wbGF0ZSBzdHJpbmdzIGFycmF5XG4gKiBAcGFyYW0gdHlwZSBIVE1MIG9yIFNWR1xuICogQHJldHVybiBBcnJheSBjb250YWluaW5nIGBbaHRtbCwgYXR0ck5hbWVzXWAgKGFycmF5IHJldHVybmVkIGZvciB0ZXJzZW5lc3MsXG4gKiAgICAgdG8gYXZvaWQgb2JqZWN0IGZpZWxkcyBzaW5jZSB0aGlzIGNvZGUgaXMgc2hhcmVkIHdpdGggbm9uLW1pbmlmaWVkIFNTUlxuICogICAgIGNvZGUpXG4gKi9cbmNvbnN0IGdldFRlbXBsYXRlSHRtbCA9IChcbiAgc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXksXG4gIHR5cGU6IFJlc3VsdFR5cGVcbik6IFtUcnVzdGVkSFRNTCwgQXJyYXk8c3RyaW5nPl0gPT4ge1xuICAvLyBJbnNlcnQgbWFrZXJzIGludG8gdGhlIHRlbXBsYXRlIEhUTUwgdG8gcmVwcmVzZW50IHRoZSBwb3NpdGlvbiBvZlxuICAvLyBiaW5kaW5ncy4gVGhlIGZvbGxvd2luZyBjb2RlIHNjYW5zIHRoZSB0ZW1wbGF0ZSBzdHJpbmdzIHRvIGRldGVybWluZSB0aGVcbiAgLy8gc3ludGFjdGljIHBvc2l0aW9uIG9mIHRoZSBiaW5kaW5ncy4gVGhleSBjYW4gYmUgaW4gdGV4dCBwb3NpdGlvbiwgd2hlcmVcbiAgLy8gd2UgaW5zZXJ0IGFuIEhUTUwgY29tbWVudCwgYXR0cmlidXRlIHZhbHVlIHBvc2l0aW9uLCB3aGVyZSB3ZSBpbnNlcnQgYVxuICAvLyBzZW50aW5lbCBzdHJpbmcgYW5kIHJlLXdyaXRlIHRoZSBhdHRyaWJ1dGUgbmFtZSwgb3IgaW5zaWRlIGEgdGFnIHdoZXJlXG4gIC8vIHdlIGluc2VydCB0aGUgc2VudGluZWwgc3RyaW5nLlxuICBjb25zdCBsID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAvLyBTdG9yZXMgdGhlIGNhc2Utc2Vuc2l0aXZlIGJvdW5kIGF0dHJpYnV0ZSBuYW1lcyBpbiB0aGUgb3JkZXIgb2YgdGhlaXJcbiAgLy8gcGFydHMuIEVsZW1lbnRQYXJ0cyBhcmUgYWxzbyByZWZsZWN0ZWQgaW4gdGhpcyBhcnJheSBhcyB1bmRlZmluZWRcbiAgLy8gcmF0aGVyIHRoYW4gYSBzdHJpbmcsIHRvIGRpc2FtYmlndWF0ZSBmcm9tIGF0dHJpYnV0ZSBiaW5kaW5ncy5cbiAgY29uc3QgYXR0ck5hbWVzOiBBcnJheTxzdHJpbmc+ID0gW107XG4gIGxldCBodG1sID1cbiAgICB0eXBlID09PSBTVkdfUkVTVUxUID8gJzxzdmc+JyA6IHR5cGUgPT09IE1BVEhNTF9SRVNVTFQgPyAnPG1hdGg+JyA6ICcnO1xuXG4gIC8vIFdoZW4gd2UncmUgaW5zaWRlIGEgcmF3IHRleHQgdGFnIChub3QgaXQncyB0ZXh0IGNvbnRlbnQpLCB0aGUgcmVnZXhcbiAgLy8gd2lsbCBzdGlsbCBiZSB0YWdSZWdleCBzbyB3ZSBjYW4gZmluZCBhdHRyaWJ1dGVzLCBidXQgd2lsbCBzd2l0Y2ggdG9cbiAgLy8gdGhpcyByZWdleCB3aGVuIHRoZSB0YWcgZW5kcy5cbiAgbGV0IHJhd1RleHRFbmRSZWdleDogUmVnRXhwIHwgdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBjdXJyZW50IHBhcnNpbmcgc3RhdGUsIHJlcHJlc2VudGVkIGFzIGEgcmVmZXJlbmNlIHRvIG9uZSBvZiB0aGVcbiAgLy8gcmVnZXhlc1xuICBsZXQgcmVnZXggPSB0ZXh0RW5kUmVnZXg7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICBjb25zdCBzID0gc3RyaW5nc1tpXTtcbiAgICAvLyBUaGUgaW5kZXggb2YgdGhlIGVuZCBvZiB0aGUgbGFzdCBhdHRyaWJ1dGUgbmFtZS4gV2hlbiB0aGlzIGlzXG4gICAgLy8gcG9zaXRpdmUgYXQgZW5kIG9mIGEgc3RyaW5nLCBpdCBtZWFucyB3ZSdyZSBpbiBhbiBhdHRyaWJ1dGUgdmFsdWVcbiAgICAvLyBwb3NpdGlvbiBhbmQgbmVlZCB0byByZXdyaXRlIHRoZSBhdHRyaWJ1dGUgbmFtZS5cbiAgICAvLyBXZSBhbHNvIHVzZSBhIHNwZWNpYWwgdmFsdWUgb2YgLTIgdG8gaW5kaWNhdGUgdGhhdCB3ZSBlbmNvdW50ZXJlZFxuICAgIC8vIHRoZSBlbmQgb2YgYSBzdHJpbmcgaW4gYXR0cmlidXRlIG5hbWUgcG9zaXRpb24uXG4gICAgbGV0IGF0dHJOYW1lRW5kSW5kZXggPSAtMTtcbiAgICBsZXQgYXR0ck5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBsZXQgbGFzdEluZGV4ID0gMDtcbiAgICBsZXQgbWF0Y2ghOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuXG4gICAgLy8gVGhlIGNvbmRpdGlvbnMgaW4gdGhpcyBsb29wIGhhbmRsZSB0aGUgY3VycmVudCBwYXJzZSBzdGF0ZSwgYW5kIHRoZVxuICAgIC8vIGFzc2lnbm1lbnRzIHRvIHRoZSBgcmVnZXhgIHZhcmlhYmxlIGFyZSB0aGUgc3RhdGUgdHJhbnNpdGlvbnMuXG4gICAgd2hpbGUgKGxhc3RJbmRleCA8IHMubGVuZ3RoKSB7XG4gICAgICAvLyBNYWtlIHN1cmUgd2Ugc3RhcnQgc2VhcmNoaW5nIGZyb20gd2hlcmUgd2UgcHJldmlvdXNseSBsZWZ0IG9mZlxuICAgICAgcmVnZXgubGFzdEluZGV4ID0gbGFzdEluZGV4O1xuICAgICAgbWF0Y2ggPSByZWdleC5leGVjKHMpO1xuICAgICAgaWYgKG1hdGNoID09PSBudWxsKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgbGFzdEluZGV4ID0gcmVnZXgubGFzdEluZGV4O1xuICAgICAgaWYgKHJlZ2V4ID09PSB0ZXh0RW5kUmVnZXgpIHtcbiAgICAgICAgaWYgKG1hdGNoW0NPTU1FTlRfU1RBUlRdID09PSAnIS0tJykge1xuICAgICAgICAgIHJlZ2V4ID0gY29tbWVudEVuZFJlZ2V4O1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoW0NPTU1FTlRfU1RBUlRdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBXZSBzdGFydGVkIGEgd2VpcmQgY29tbWVudCwgbGlrZSA8L3tcbiAgICAgICAgICByZWdleCA9IGNvbW1lbnQyRW5kUmVnZXg7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbVEFHX05BTUVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAocmF3VGV4dEVsZW1lbnQudGVzdChtYXRjaFtUQUdfTkFNRV0pKSB7XG4gICAgICAgICAgICAvLyBSZWNvcmQgaWYgd2UgZW5jb3VudGVyIGEgcmF3LXRleHQgZWxlbWVudC4gV2UnbGwgc3dpdGNoIHRvXG4gICAgICAgICAgICAvLyB0aGlzIHJlZ2V4IGF0IHRoZSBlbmQgb2YgdGhlIHRhZy5cbiAgICAgICAgICAgIHJhd1RleHRFbmRSZWdleCA9IG5ldyBSZWdFeHAoYDwvJHttYXRjaFtUQUdfTkFNRV19YCwgJ2cnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVnZXggPSB0YWdFbmRSZWdleDtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFtEWU5BTUlDX1RBR19OQU1FXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICdCaW5kaW5ncyBpbiB0YWcgbmFtZXMgYXJlIG5vdCBzdXBwb3J0ZWQuIFBsZWFzZSB1c2Ugc3RhdGljIHRlbXBsYXRlcyBpbnN0ZWFkLiAnICtcbiAgICAgICAgICAgICAgICAnU2VlIGh0dHBzOi8vbGl0LmRldi9kb2NzL3RlbXBsYXRlcy9leHByZXNzaW9ucy8jc3RhdGljLWV4cHJlc3Npb25zJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVnZXggPSB0YWdFbmRSZWdleDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChyZWdleCA9PT0gdGFnRW5kUmVnZXgpIHtcbiAgICAgICAgaWYgKG1hdGNoW0VOVElSRV9NQVRDSF0gPT09ICc+Jykge1xuICAgICAgICAgIC8vIEVuZCBvZiBhIHRhZy4gSWYgd2UgaGFkIHN0YXJ0ZWQgYSByYXctdGV4dCBlbGVtZW50LCB1c2UgdGhhdFxuICAgICAgICAgIC8vIHJlZ2V4XG4gICAgICAgICAgcmVnZXggPSByYXdUZXh0RW5kUmVnZXggPz8gdGV4dEVuZFJlZ2V4O1xuICAgICAgICAgIC8vIFdlIG1heSBiZSBlbmRpbmcgYW4gdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlLCBzbyBtYWtlIHN1cmUgd2VcbiAgICAgICAgICAvLyBjbGVhciBhbnkgcGVuZGluZyBhdHRyTmFtZUVuZEluZGV4XG4gICAgICAgICAgYXR0ck5hbWVFbmRJbmRleCA9IC0xO1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoW0FUVFJJQlVURV9OQU1FXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gQXR0cmlidXRlIG5hbWUgcG9zaXRpb25cbiAgICAgICAgICBhdHRyTmFtZUVuZEluZGV4ID0gLTI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXR0ck5hbWVFbmRJbmRleCA9IHJlZ2V4Lmxhc3RJbmRleCAtIG1hdGNoW1NQQUNFU19BTkRfRVFVQUxTXS5sZW5ndGg7XG4gICAgICAgICAgYXR0ck5hbWUgPSBtYXRjaFtBVFRSSUJVVEVfTkFNRV07XG4gICAgICAgICAgcmVnZXggPVxuICAgICAgICAgICAgbWF0Y2hbUVVPVEVfQ0hBUl0gPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICA/IHRhZ0VuZFJlZ2V4XG4gICAgICAgICAgICAgIDogbWF0Y2hbUVVPVEVfQ0hBUl0gPT09ICdcIidcbiAgICAgICAgICAgICAgICA/IGRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4XG4gICAgICAgICAgICAgICAgOiBzaW5nbGVRdW90ZUF0dHJFbmRSZWdleDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgcmVnZXggPT09IGRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4IHx8XG4gICAgICAgIHJlZ2V4ID09PSBzaW5nbGVRdW90ZUF0dHJFbmRSZWdleFxuICAgICAgKSB7XG4gICAgICAgIHJlZ2V4ID0gdGFnRW5kUmVnZXg7XG4gICAgICB9IGVsc2UgaWYgKHJlZ2V4ID09PSBjb21tZW50RW5kUmVnZXggfHwgcmVnZXggPT09IGNvbW1lbnQyRW5kUmVnZXgpIHtcbiAgICAgICAgcmVnZXggPSB0ZXh0RW5kUmVnZXg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOb3Qgb25lIG9mIHRoZSBmaXZlIHN0YXRlIHJlZ2V4ZXMsIHNvIGl0IG11c3QgYmUgdGhlIGR5bmFtaWNhbGx5XG4gICAgICAgIC8vIGNyZWF0ZWQgcmF3IHRleHQgcmVnZXggYW5kIHdlJ3JlIGF0IHRoZSBjbG9zZSBvZiB0aGF0IGVsZW1lbnQuXG4gICAgICAgIHJlZ2V4ID0gdGFnRW5kUmVnZXg7XG4gICAgICAgIHJhd1RleHRFbmRSZWdleCA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoREVWX01PREUpIHtcbiAgICAgIC8vIElmIHdlIGhhdmUgYSBhdHRyTmFtZUVuZEluZGV4LCB3aGljaCBpbmRpY2F0ZXMgdGhhdCB3ZSBzaG91bGRcbiAgICAgIC8vIHJld3JpdGUgdGhlIGF0dHJpYnV0ZSBuYW1lLCBhc3NlcnQgdGhhdCB3ZSdyZSBpbiBhIHZhbGlkIGF0dHJpYnV0ZVxuICAgICAgLy8gcG9zaXRpb24gLSBlaXRoZXIgaW4gYSB0YWcsIG9yIGEgcXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZS5cbiAgICAgIGNvbnNvbGUuYXNzZXJ0KFxuICAgICAgICBhdHRyTmFtZUVuZEluZGV4ID09PSAtMSB8fFxuICAgICAgICAgIHJlZ2V4ID09PSB0YWdFbmRSZWdleCB8fFxuICAgICAgICAgIHJlZ2V4ID09PSBzaW5nbGVRdW90ZUF0dHJFbmRSZWdleCB8fFxuICAgICAgICAgIHJlZ2V4ID09PSBkb3VibGVRdW90ZUF0dHJFbmRSZWdleCxcbiAgICAgICAgJ3VuZXhwZWN0ZWQgcGFyc2Ugc3RhdGUgQidcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gV2UgaGF2ZSBmb3VyIGNhc2VzOlxuICAgIC8vICAxLiBXZSdyZSBpbiB0ZXh0IHBvc2l0aW9uLCBhbmQgbm90IGluIGEgcmF3IHRleHQgZWxlbWVudFxuICAgIC8vICAgICAocmVnZXggPT09IHRleHRFbmRSZWdleCk6IGluc2VydCBhIGNvbW1lbnQgbWFya2VyLlxuICAgIC8vICAyLiBXZSBoYXZlIGEgbm9uLW5lZ2F0aXZlIGF0dHJOYW1lRW5kSW5kZXggd2hpY2ggbWVhbnMgd2UgbmVlZCB0b1xuICAgIC8vICAgICByZXdyaXRlIHRoZSBhdHRyaWJ1dGUgbmFtZSB0byBhZGQgYSBib3VuZCBhdHRyaWJ1dGUgc3VmZml4LlxuICAgIC8vICAzLiBXZSdyZSBhdCB0aGUgbm9uLWZpcnN0IGJpbmRpbmcgaW4gYSBtdWx0aS1iaW5kaW5nIGF0dHJpYnV0ZSwgdXNlIGFcbiAgICAvLyAgICAgcGxhaW4gbWFya2VyLlxuICAgIC8vICA0LiBXZSdyZSBzb21ld2hlcmUgZWxzZSBpbnNpZGUgdGhlIHRhZy4gSWYgd2UncmUgaW4gYXR0cmlidXRlIG5hbWVcbiAgICAvLyAgICAgcG9zaXRpb24gKGF0dHJOYW1lRW5kSW5kZXggPT09IC0yKSwgYWRkIGEgc2VxdWVudGlhbCBzdWZmaXggdG9cbiAgICAvLyAgICAgZ2VuZXJhdGUgYSB1bmlxdWUgYXR0cmlidXRlIG5hbWUuXG5cbiAgICAvLyBEZXRlY3QgYSBiaW5kaW5nIG5leHQgdG8gc2VsZi1jbG9zaW5nIHRhZyBlbmQgYW5kIGluc2VydCBhIHNwYWNlIHRvXG4gICAgLy8gc2VwYXJhdGUgdGhlIG1hcmtlciBmcm9tIHRoZSB0YWcgZW5kOlxuICAgIGNvbnN0IGVuZCA9XG4gICAgICByZWdleCA9PT0gdGFnRW5kUmVnZXggJiYgc3RyaW5nc1tpICsgMV0uc3RhcnRzV2l0aCgnLz4nKSA/ICcgJyA6ICcnO1xuICAgIGh0bWwgKz1cbiAgICAgIHJlZ2V4ID09PSB0ZXh0RW5kUmVnZXhcbiAgICAgICAgPyBzICsgbm9kZU1hcmtlclxuICAgICAgICA6IGF0dHJOYW1lRW5kSW5kZXggPj0gMFxuICAgICAgICAgID8gKGF0dHJOYW1lcy5wdXNoKGF0dHJOYW1lISksXG4gICAgICAgICAgICBzLnNsaWNlKDAsIGF0dHJOYW1lRW5kSW5kZXgpICtcbiAgICAgICAgICAgICAgYm91bmRBdHRyaWJ1dGVTdWZmaXggK1xuICAgICAgICAgICAgICBzLnNsaWNlKGF0dHJOYW1lRW5kSW5kZXgpKSArXG4gICAgICAgICAgICBtYXJrZXIgK1xuICAgICAgICAgICAgZW5kXG4gICAgICAgICAgOiBzICsgbWFya2VyICsgKGF0dHJOYW1lRW5kSW5kZXggPT09IC0yID8gaSA6IGVuZCk7XG4gIH1cblxuICBjb25zdCBodG1sUmVzdWx0OiBzdHJpbmcgfCBUcnVzdGVkSFRNTCA9XG4gICAgaHRtbCArXG4gICAgKHN0cmluZ3NbbF0gfHwgJzw/PicpICtcbiAgICAodHlwZSA9PT0gU1ZHX1JFU1VMVCA/ICc8L3N2Zz4nIDogdHlwZSA9PT0gTUFUSE1MX1JFU1VMVCA/ICc8L21hdGg+JyA6ICcnKTtcblxuICAvLyBSZXR1cm5lZCBhcyBhbiBhcnJheSBmb3IgdGVyc2VuZXNzXG4gIHJldHVybiBbdHJ1c3RGcm9tVGVtcGxhdGVTdHJpbmcoc3RyaW5ncywgaHRtbFJlc3VsdCksIGF0dHJOYW1lc107XG59O1xuXG4vKiogQGludGVybmFsICovXG5leHBvcnQgdHlwZSB7VGVtcGxhdGV9O1xuY2xhc3MgVGVtcGxhdGUge1xuICAvKiogQGludGVybmFsICovXG4gIGVsITogSFRNTFRlbXBsYXRlRWxlbWVudDtcblxuICBwYXJ0czogQXJyYXk8VGVtcGxhdGVQYXJ0PiA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAge3N0cmluZ3MsIFsnXyRsaXRUeXBlJCddOiB0eXBlfTogVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0LFxuICAgIG9wdGlvbnM/OiBSZW5kZXJPcHRpb25zXG4gICkge1xuICAgIGxldCBub2RlOiBOb2RlIHwgbnVsbDtcbiAgICBsZXQgbm9kZUluZGV4ID0gMDtcbiAgICBsZXQgYXR0ck5hbWVJbmRleCA9IDA7XG4gICAgY29uc3QgcGFydENvdW50ID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgIGNvbnN0IHBhcnRzID0gdGhpcy5wYXJ0cztcblxuICAgIC8vIENyZWF0ZSB0ZW1wbGF0ZSBlbGVtZW50XG4gICAgY29uc3QgW2h0bWwsIGF0dHJOYW1lc10gPSBnZXRUZW1wbGF0ZUh0bWwoc3RyaW5ncywgdHlwZSk7XG4gICAgdGhpcy5lbCA9IFRlbXBsYXRlLmNyZWF0ZUVsZW1lbnQoaHRtbCwgb3B0aW9ucyk7XG4gICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gdGhpcy5lbC5jb250ZW50O1xuXG4gICAgLy8gUmUtcGFyZW50IFNWRyBvciBNYXRoTUwgbm9kZXMgaW50byB0ZW1wbGF0ZSByb290XG4gICAgaWYgKHR5cGUgPT09IFNWR19SRVNVTFQgfHwgdHlwZSA9PT0gTUFUSE1MX1JFU1VMVCkge1xuICAgICAgY29uc3Qgd3JhcHBlciA9IHRoaXMuZWwuY29udGVudC5maXJzdENoaWxkITtcbiAgICAgIHdyYXBwZXIucmVwbGFjZVdpdGgoLi4ud3JhcHBlci5jaGlsZE5vZGVzKTtcbiAgICB9XG5cbiAgICAvLyBXYWxrIHRoZSB0ZW1wbGF0ZSB0byBmaW5kIGJpbmRpbmcgbWFya2VycyBhbmQgY3JlYXRlIFRlbXBsYXRlUGFydHNcbiAgICB3aGlsZSAoKG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKSkgIT09IG51bGwgJiYgcGFydHMubGVuZ3RoIDwgcGFydENvdW50KSB7XG4gICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICBpZiAoREVWX01PREUpIHtcbiAgICAgICAgICBjb25zdCB0YWcgPSAobm9kZSBhcyBFbGVtZW50KS5sb2NhbE5hbWU7XG4gICAgICAgICAgLy8gV2FybiBpZiBgdGV4dGFyZWFgIGluY2x1ZGVzIGFuIGV4cHJlc3Npb24gYW5kIHRocm93IGlmIGB0ZW1wbGF0ZWBcbiAgICAgICAgICAvLyBkb2VzIHNpbmNlIHRoZXNlIGFyZSBub3Qgc3VwcG9ydGVkLiBXZSBkbyB0aGlzIGJ5IGNoZWNraW5nXG4gICAgICAgICAgLy8gaW5uZXJIVE1MIGZvciBhbnl0aGluZyB0aGF0IGxvb2tzIGxpa2UgYSBtYXJrZXIuIFRoaXMgY2F0Y2hlc1xuICAgICAgICAgIC8vIGNhc2VzIGxpa2UgYmluZGluZ3MgaW4gdGV4dGFyZWEgdGhlcmUgbWFya2VycyB0dXJuIGludG8gdGV4dCBub2Rlcy5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAvXig/OnRleHRhcmVhfHRlbXBsYXRlKSQvaSEudGVzdCh0YWcpICYmXG4gICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5pbm5lckhUTUwuaW5jbHVkZXMobWFya2VyKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgY29uc3QgbSA9XG4gICAgICAgICAgICAgIGBFeHByZXNzaW9ucyBhcmUgbm90IHN1cHBvcnRlZCBpbnNpZGUgXFxgJHt0YWd9XFxgIGAgK1xuICAgICAgICAgICAgICBgZWxlbWVudHMuIFNlZSBodHRwczovL2xpdC5kZXYvbXNnL2V4cHJlc3Npb24taW4tJHt0YWd9IGZvciBtb3JlIGAgK1xuICAgICAgICAgICAgICBgaW5mb3JtYXRpb24uYDtcbiAgICAgICAgICAgIGlmICh0YWcgPT09ICd0ZW1wbGF0ZScpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG0pO1xuICAgICAgICAgICAgfSBlbHNlIGlzc3VlV2FybmluZygnJywgbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiBmb3IgYXR0ZW1wdGVkIGR5bmFtaWMgdGFnIG5hbWVzLCB3ZSBkb24ndFxuICAgICAgICAvLyBpbmNyZW1lbnQgdGhlIGJpbmRpbmdJbmRleCwgYW5kIGl0J2xsIGJlIG9mZiBieSAxIGluIHRoZSBlbGVtZW50XG4gICAgICAgIC8vIGFuZCBvZmYgYnkgdHdvIGFmdGVyIGl0LlxuICAgICAgICBpZiAoKG5vZGUgYXMgRWxlbWVudCkuaGFzQXR0cmlidXRlcygpKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIChub2RlIGFzIEVsZW1lbnQpLmdldEF0dHJpYnV0ZU5hbWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChuYW1lLmVuZHNXaXRoKGJvdW5kQXR0cmlidXRlU3VmZml4KSkge1xuICAgICAgICAgICAgICBjb25zdCByZWFsTmFtZSA9IGF0dHJOYW1lc1thdHRyTmFtZUluZGV4KytdO1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IChub2RlIGFzIEVsZW1lbnQpLmdldEF0dHJpYnV0ZShuYW1lKSE7XG4gICAgICAgICAgICAgIGNvbnN0IHN0YXRpY3MgPSB2YWx1ZS5zcGxpdChtYXJrZXIpO1xuICAgICAgICAgICAgICBjb25zdCBtID0gLyhbLj9AXSk/KC4qKS8uZXhlYyhyZWFsTmFtZSkhO1xuICAgICAgICAgICAgICBwYXJ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBBVFRSSUJVVEVfUEFSVCxcbiAgICAgICAgICAgICAgICBpbmRleDogbm9kZUluZGV4LFxuICAgICAgICAgICAgICAgIG5hbWU6IG1bMl0sXG4gICAgICAgICAgICAgICAgc3RyaW5nczogc3RhdGljcyxcbiAgICAgICAgICAgICAgICBjdG9yOlxuICAgICAgICAgICAgICAgICAgbVsxXSA9PT0gJy4nXG4gICAgICAgICAgICAgICAgICAgID8gUHJvcGVydHlQYXJ0XG4gICAgICAgICAgICAgICAgICAgIDogbVsxXSA9PT0gJz8nXG4gICAgICAgICAgICAgICAgICAgICAgPyBCb29sZWFuQXR0cmlidXRlUGFydFxuICAgICAgICAgICAgICAgICAgICAgIDogbVsxXSA9PT0gJ0AnXG4gICAgICAgICAgICAgICAgICAgICAgICA/IEV2ZW50UGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBBdHRyaWJ1dGVQYXJ0LFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuYW1lLnN0YXJ0c1dpdGgobWFya2VyKSkge1xuICAgICAgICAgICAgICBwYXJ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBFTEVNRU5UX1BBUlQsXG4gICAgICAgICAgICAgICAgaW5kZXg6IG5vZGVJbmRleCxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyAoanVzdGluZmFnbmFuaSk6IGJlbmNobWFyayB0aGUgcmVnZXggYWdhaW5zdCB0ZXN0aW5nIGZvciBlYWNoXG4gICAgICAgIC8vIG9mIHRoZSAzIHJhdyB0ZXh0IGVsZW1lbnQgbmFtZXMuXG4gICAgICAgIGlmIChyYXdUZXh0RWxlbWVudC50ZXN0KChub2RlIGFzIEVsZW1lbnQpLnRhZ05hbWUpKSB7XG4gICAgICAgICAgLy8gRm9yIHJhdyB0ZXh0IGVsZW1lbnRzIHdlIG5lZWQgdG8gc3BsaXQgdGhlIHRleHQgY29udGVudCBvblxuICAgICAgICAgIC8vIG1hcmtlcnMsIGNyZWF0ZSBhIFRleHQgbm9kZSBmb3IgZWFjaCBzZWdtZW50LCBhbmQgY3JlYXRlXG4gICAgICAgICAgLy8gYSBUZW1wbGF0ZVBhcnQgZm9yIGVhY2ggbWFya2VyLlxuICAgICAgICAgIGNvbnN0IHN0cmluZ3MgPSAobm9kZSBhcyBFbGVtZW50KS50ZXh0Q29udGVudCEuc3BsaXQobWFya2VyKTtcbiAgICAgICAgICBjb25zdCBsYXN0SW5kZXggPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgaWYgKGxhc3RJbmRleCA+IDApIHtcbiAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLnRleHRDb250ZW50ID0gdHJ1c3RlZFR5cGVzXG4gICAgICAgICAgICAgID8gKHRydXN0ZWRUeXBlcy5lbXB0eVNjcmlwdCBhcyB1bmtub3duIGFzICcnKVxuICAgICAgICAgICAgICA6ICcnO1xuICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBuZXcgdGV4dCBub2RlIGZvciBlYWNoIGxpdGVyYWwgc2VjdGlvblxuICAgICAgICAgICAgLy8gVGhlc2Ugbm9kZXMgYXJlIGFsc28gdXNlZCBhcyB0aGUgbWFya2VycyBmb3Igbm9kZSBwYXJ0c1xuICAgICAgICAgICAgLy8gV2UgY2FuJ3QgdXNlIGVtcHR5IHRleHQgbm9kZXMgYXMgbWFya2VycyBiZWNhdXNlIHRoZXkncmVcbiAgICAgICAgICAgIC8vIG5vcm1hbGl6ZWQgd2hlbiBjbG9uaW5nIGluIElFIChjb3VsZCBzaW1wbGlmeSB3aGVuXG4gICAgICAgICAgICAvLyBJRSBpcyBubyBsb25nZXIgc3VwcG9ydGVkKVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXN0SW5kZXg7IGkrKykge1xuICAgICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5hcHBlbmQoc3RyaW5nc1tpXSwgY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICAgICAgICAvLyBXYWxrIHBhc3QgdGhlIG1hcmtlciBub2RlIHdlIGp1c3QgYWRkZWRcbiAgICAgICAgICAgICAgd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgICAgICAgIHBhcnRzLnB1c2goe3R5cGU6IENISUxEX1BBUlQsIGluZGV4OiArK25vZGVJbmRleH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTm90ZSBiZWNhdXNlIHRoaXMgbWFya2VyIGlzIGFkZGVkIGFmdGVyIHRoZSB3YWxrZXIncyBjdXJyZW50XG4gICAgICAgICAgICAvLyBub2RlLCBpdCB3aWxsIGJlIHdhbGtlZCB0byBpbiB0aGUgb3V0ZXIgbG9vcCAoYW5kIGlnbm9yZWQpLCBzb1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBhZGp1c3Qgbm9kZUluZGV4IGhlcmVcbiAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLmFwcGVuZChzdHJpbmdzW2xhc3RJbmRleF0sIGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCkge1xuICAgICAgICBjb25zdCBkYXRhID0gKG5vZGUgYXMgQ29tbWVudCkuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgPT09IG1hcmtlck1hdGNoKSB7XG4gICAgICAgICAgcGFydHMucHVzaCh7dHlwZTogQ0hJTERfUEFSVCwgaW5kZXg6IG5vZGVJbmRleH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBpID0gLTE7XG4gICAgICAgICAgd2hpbGUgKChpID0gKG5vZGUgYXMgQ29tbWVudCkuZGF0YS5pbmRleE9mKG1hcmtlciwgaSArIDEpKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIC8vIENvbW1lbnQgbm9kZSBoYXMgYSBiaW5kaW5nIG1hcmtlciBpbnNpZGUsIG1ha2UgYW4gaW5hY3RpdmUgcGFydFxuICAgICAgICAgICAgLy8gVGhlIGJpbmRpbmcgd29uJ3Qgd29yaywgYnV0IHN1YnNlcXVlbnQgYmluZGluZ3Mgd2lsbFxuICAgICAgICAgICAgcGFydHMucHVzaCh7dHlwZTogQ09NTUVOVF9QQVJULCBpbmRleDogbm9kZUluZGV4fSk7XG4gICAgICAgICAgICAvLyBNb3ZlIHRvIHRoZSBlbmQgb2YgdGhlIG1hdGNoXG4gICAgICAgICAgICBpICs9IG1hcmtlci5sZW5ndGggLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9kZUluZGV4Kys7XG4gICAgfVxuXG4gICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAvLyBJZiB0aGVyZSB3YXMgYSBkdXBsaWNhdGUgYXR0cmlidXRlIG9uIGEgdGFnLCB0aGVuIHdoZW4gdGhlIHRhZyBpc1xuICAgICAgLy8gcGFyc2VkIGludG8gYW4gZWxlbWVudCB0aGUgYXR0cmlidXRlIGdldHMgZGUtZHVwbGljYXRlZC4gV2UgY2FuIGRldGVjdFxuICAgICAgLy8gdGhpcyBtaXNtYXRjaCBpZiB3ZSBoYXZlbid0IHByZWNpc2VseSBjb25zdW1lZCBldmVyeSBhdHRyaWJ1dGUgbmFtZVxuICAgICAgLy8gd2hlbiBwcmVwYXJpbmcgdGhlIHRlbXBsYXRlLiBUaGlzIHdvcmtzIGJlY2F1c2UgYGF0dHJOYW1lc2AgaXMgYnVpbHRcbiAgICAgIC8vIGZyb20gdGhlIHRlbXBsYXRlIHN0cmluZyBhbmQgYGF0dHJOYW1lSW5kZXhgIGNvbWVzIGZyb20gcHJvY2Vzc2luZyB0aGVcbiAgICAgIC8vIHJlc3VsdGluZyBET00uXG4gICAgICBpZiAoYXR0ck5hbWVzLmxlbmd0aCAhPT0gYXR0ck5hbWVJbmRleCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYERldGVjdGVkIGR1cGxpY2F0ZSBhdHRyaWJ1dGUgYmluZGluZ3MuIFRoaXMgb2NjdXJzIGlmIHlvdXIgdGVtcGxhdGUgYCArXG4gICAgICAgICAgICBgaGFzIGR1cGxpY2F0ZSBhdHRyaWJ1dGVzIG9uIGFuIGVsZW1lbnQgdGFnLiBGb3IgZXhhbXBsZSBgICtcbiAgICAgICAgICAgIGBcIjxpbnB1dCA/ZGlzYWJsZWQ9XFwke3RydWV9ID9kaXNhYmxlZD1cXCR7ZmFsc2V9PlwiIGNvbnRhaW5zIGEgYCArXG4gICAgICAgICAgICBgZHVwbGljYXRlIFwiZGlzYWJsZWRcIiBhdHRyaWJ1dGUuIFRoZSBlcnJvciB3YXMgZGV0ZWN0ZWQgaW4gYCArXG4gICAgICAgICAgICBgdGhlIGZvbGxvd2luZyB0ZW1wbGF0ZTogXFxuYCArXG4gICAgICAgICAgICAnYCcgK1xuICAgICAgICAgICAgc3RyaW5ncy5qb2luKCckey4uLn0nKSArXG4gICAgICAgICAgICAnYCdcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXZSBjb3VsZCBzZXQgd2Fsa2VyLmN1cnJlbnROb2RlIHRvIGFub3RoZXIgbm9kZSBoZXJlIHRvIHByZXZlbnQgYSBtZW1vcnlcbiAgICAvLyBsZWFrLCBidXQgZXZlcnkgdGltZSB3ZSBwcmVwYXJlIGEgdGVtcGxhdGUsIHdlIGltbWVkaWF0ZWx5IHJlbmRlciBpdFxuICAgIC8vIGFuZCByZS11c2UgdGhlIHdhbGtlciBpbiBuZXcgVGVtcGxhdGVJbnN0YW5jZS5fY2xvbmUoKS5cbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ3RlbXBsYXRlIHByZXAnLFxuICAgICAgICB0ZW1wbGF0ZTogdGhpcyxcbiAgICAgICAgY2xvbmFibGVUZW1wbGF0ZTogdGhpcy5lbCxcbiAgICAgICAgcGFydHM6IHRoaXMucGFydHMsXG4gICAgICAgIHN0cmluZ3MsXG4gICAgICB9KTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRkZW4gdmlhIGBsaXRIdG1sUG9seWZpbGxTdXBwb3J0YCB0byBwcm92aWRlIHBsYXRmb3JtIHN1cHBvcnQuXG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgY3JlYXRlRWxlbWVudChodG1sOiBUcnVzdGVkSFRNTCwgX29wdGlvbnM/OiBSZW5kZXJPcHRpb25zKSB7XG4gICAgY29uc3QgZWwgPSBkLmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gICAgZWwuaW5uZXJIVE1MID0gaHRtbCBhcyB1bmtub3duIGFzIHN0cmluZztcbiAgICByZXR1cm4gZWw7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBEaXNjb25uZWN0YWJsZSB7XG4gIF8kcGFyZW50PzogRGlzY29ubmVjdGFibGU7XG4gIF8kZGlzY29ubmVjdGFibGVDaGlsZHJlbj86IFNldDxEaXNjb25uZWN0YWJsZT47XG4gIC8vIFJhdGhlciB0aGFuIGhvbGQgY29ubmVjdGlvbiBzdGF0ZSBvbiBpbnN0YW5jZXMsIERpc2Nvbm5lY3RhYmxlcyByZWN1cnNpdmVseVxuICAvLyBmZXRjaCB0aGUgY29ubmVjdGlvbiBzdGF0ZSBmcm9tIHRoZSBSb290UGFydCB0aGV5IGFyZSBjb25uZWN0ZWQgaW4gdmlhXG4gIC8vIGdldHRlcnMgdXAgdGhlIERpc2Nvbm5lY3RhYmxlIHRyZWUgdmlhIF8kcGFyZW50IHJlZmVyZW5jZXMuIFRoaXMgcHVzaGVzIHRoZVxuICAvLyBjb3N0IG9mIHRyYWNraW5nIHRoZSBpc0Nvbm5lY3RlZCBzdGF0ZSB0byBgQXN5bmNEaXJlY3RpdmVzYCwgYW5kIGF2b2lkc1xuICAvLyBuZWVkaW5nIHRvIHBhc3MgYWxsIERpc2Nvbm5lY3RhYmxlcyAocGFydHMsIHRlbXBsYXRlIGluc3RhbmNlcywgYW5kXG4gIC8vIGRpcmVjdGl2ZXMpIHRoZWlyIGNvbm5lY3Rpb24gc3RhdGUgZWFjaCB0aW1lIGl0IGNoYW5nZXMsIHdoaWNoIHdvdWxkIGJlXG4gIC8vIGNvc3RseSBmb3IgdHJlZXMgdGhhdCBoYXZlIG5vIEFzeW5jRGlyZWN0aXZlcy5cbiAgXyRpc0Nvbm5lY3RlZDogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZURpcmVjdGl2ZShcbiAgcGFydDogQ2hpbGRQYXJ0IHwgQXR0cmlidXRlUGFydCB8IEVsZW1lbnRQYXJ0LFxuICB2YWx1ZTogdW5rbm93bixcbiAgcGFyZW50OiBEaXJlY3RpdmVQYXJlbnQgPSBwYXJ0LFxuICBhdHRyaWJ1dGVJbmRleD86IG51bWJlclxuKTogdW5rbm93biB7XG4gIC8vIEJhaWwgZWFybHkgaWYgdGhlIHZhbHVlIGlzIGV4cGxpY2l0bHkgbm9DaGFuZ2UuIE5vdGUsIHRoaXMgbWVhbnMgYW55XG4gIC8vIG5lc3RlZCBkaXJlY3RpdmUgaXMgc3RpbGwgYXR0YWNoZWQgYW5kIGlzIG5vdCBydW4uXG4gIGlmICh2YWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgbGV0IGN1cnJlbnREaXJlY3RpdmUgPVxuICAgIGF0dHJpYnV0ZUluZGV4ICE9PSB1bmRlZmluZWRcbiAgICAgID8gKHBhcmVudCBhcyBBdHRyaWJ1dGVQYXJ0KS5fX2RpcmVjdGl2ZXM/LlthdHRyaWJ1dGVJbmRleF1cbiAgICAgIDogKHBhcmVudCBhcyBDaGlsZFBhcnQgfCBFbGVtZW50UGFydCB8IERpcmVjdGl2ZSkuX19kaXJlY3RpdmU7XG4gIGNvbnN0IG5leHREaXJlY3RpdmVDb25zdHJ1Y3RvciA9IGlzUHJpbWl0aXZlKHZhbHVlKVxuICAgID8gdW5kZWZpbmVkXG4gICAgOiAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgICAgKHZhbHVlIGFzIERpcmVjdGl2ZVJlc3VsdClbJ18kbGl0RGlyZWN0aXZlJCddO1xuICBpZiAoY3VycmVudERpcmVjdGl2ZT8uY29uc3RydWN0b3IgIT09IG5leHREaXJlY3RpdmVDb25zdHJ1Y3Rvcikge1xuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgY3VycmVudERpcmVjdGl2ZT8uWydfJG5vdGlmeURpcmVjdGl2ZUNvbm5lY3Rpb25DaGFuZ2VkJ10/LihmYWxzZSk7XG4gICAgaWYgKG5leHREaXJlY3RpdmVDb25zdHJ1Y3RvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjdXJyZW50RGlyZWN0aXZlID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50RGlyZWN0aXZlID0gbmV3IG5leHREaXJlY3RpdmVDb25zdHJ1Y3RvcihwYXJ0IGFzIFBhcnRJbmZvKTtcbiAgICAgIGN1cnJlbnREaXJlY3RpdmUuXyRpbml0aWFsaXplKHBhcnQsIHBhcmVudCwgYXR0cmlidXRlSW5kZXgpO1xuICAgIH1cbiAgICBpZiAoYXR0cmlidXRlSW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgKChwYXJlbnQgYXMgQXR0cmlidXRlUGFydCkuX19kaXJlY3RpdmVzID8/PSBbXSlbYXR0cmlidXRlSW5kZXhdID1cbiAgICAgICAgY3VycmVudERpcmVjdGl2ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHBhcmVudCBhcyBDaGlsZFBhcnQgfCBEaXJlY3RpdmUpLl9fZGlyZWN0aXZlID0gY3VycmVudERpcmVjdGl2ZTtcbiAgICB9XG4gIH1cbiAgaWYgKGN1cnJlbnREaXJlY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbHVlID0gcmVzb2x2ZURpcmVjdGl2ZShcbiAgICAgIHBhcnQsXG4gICAgICBjdXJyZW50RGlyZWN0aXZlLl8kcmVzb2x2ZShwYXJ0LCAodmFsdWUgYXMgRGlyZWN0aXZlUmVzdWx0KS52YWx1ZXMpLFxuICAgICAgY3VycmVudERpcmVjdGl2ZSxcbiAgICAgIGF0dHJpYnV0ZUluZGV4XG4gICAgKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCB0eXBlIHtUZW1wbGF0ZUluc3RhbmNlfTtcbi8qKlxuICogQW4gdXBkYXRlYWJsZSBpbnN0YW5jZSBvZiBhIFRlbXBsYXRlLiBIb2xkcyByZWZlcmVuY2VzIHRvIHRoZSBQYXJ0cyB1c2VkIHRvXG4gKiB1cGRhdGUgdGhlIHRlbXBsYXRlIGluc3RhbmNlLlxuICovXG5jbGFzcyBUZW1wbGF0ZUluc3RhbmNlIGltcGxlbWVudHMgRGlzY29ubmVjdGFibGUge1xuICBfJHRlbXBsYXRlOiBUZW1wbGF0ZTtcbiAgXyRwYXJ0czogQXJyYXk8UGFydCB8IHVuZGVmaW5lZD4gPSBbXTtcblxuICAvKiogQGludGVybmFsICovXG4gIF8kcGFyZW50OiBDaGlsZFBhcnQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPiA9IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZTogVGVtcGxhdGUsIHBhcmVudDogQ2hpbGRQYXJ0KSB7XG4gICAgdGhpcy5fJHRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgdGhpcy5fJHBhcmVudCA9IHBhcmVudDtcbiAgfVxuXG4gIC8vIENhbGxlZCBieSBDaGlsZFBhcnQgcGFyZW50Tm9kZSBnZXR0ZXJcbiAgZ2V0IHBhcmVudE5vZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQucGFyZW50Tm9kZTtcbiAgfVxuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQuXyRpc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIC8vIFRoaXMgbWV0aG9kIGlzIHNlcGFyYXRlIGZyb20gdGhlIGNvbnN0cnVjdG9yIGJlY2F1c2Ugd2UgbmVlZCB0byByZXR1cm4gYVxuICAvLyBEb2N1bWVudEZyYWdtZW50IGFuZCB3ZSBkb24ndCB3YW50IHRvIGhvbGQgb250byBpdCB3aXRoIGFuIGluc3RhbmNlIGZpZWxkLlxuICBfY2xvbmUob3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGVsOiB7Y29udGVudH0sXG4gICAgICBwYXJ0czogcGFydHMsXG4gICAgfSA9IHRoaXMuXyR0ZW1wbGF0ZTtcbiAgICBjb25zdCBmcmFnbWVudCA9IChvcHRpb25zPy5jcmVhdGlvblNjb3BlID8/IGQpLmltcG9ydE5vZGUoY29udGVudCwgdHJ1ZSk7XG4gICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gZnJhZ21lbnQ7XG5cbiAgICBsZXQgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpITtcbiAgICBsZXQgbm9kZUluZGV4ID0gMDtcbiAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICBsZXQgdGVtcGxhdGVQYXJ0ID0gcGFydHNbMF07XG5cbiAgICB3aGlsZSAodGVtcGxhdGVQYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChub2RlSW5kZXggPT09IHRlbXBsYXRlUGFydC5pbmRleCkge1xuICAgICAgICBsZXQgcGFydDogUGFydCB8IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRlbXBsYXRlUGFydC50eXBlID09PSBDSElMRF9QQVJUKSB7XG4gICAgICAgICAgcGFydCA9IG5ldyBDaGlsZFBhcnQoXG4gICAgICAgICAgICBub2RlIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgICAgbm9kZS5uZXh0U2libGluZyxcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBvcHRpb25zXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0ZW1wbGF0ZVBhcnQudHlwZSA9PT0gQVRUUklCVVRFX1BBUlQpIHtcbiAgICAgICAgICBwYXJ0ID0gbmV3IHRlbXBsYXRlUGFydC5jdG9yKFxuICAgICAgICAgICAgbm9kZSBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICAgIHRlbXBsYXRlUGFydC5uYW1lLFxuICAgICAgICAgICAgdGVtcGxhdGVQYXJ0LnN0cmluZ3MsXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGVtcGxhdGVQYXJ0LnR5cGUgPT09IEVMRU1FTlRfUEFSVCkge1xuICAgICAgICAgIHBhcnQgPSBuZXcgRWxlbWVudFBhcnQobm9kZSBhcyBIVE1MRWxlbWVudCwgdGhpcywgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fJHBhcnRzLnB1c2gocGFydCk7XG4gICAgICAgIHRlbXBsYXRlUGFydCA9IHBhcnRzWysrcGFydEluZGV4XTtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlSW5kZXggIT09IHRlbXBsYXRlUGFydD8uaW5kZXgpIHtcbiAgICAgICAgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpITtcbiAgICAgICAgbm9kZUluZGV4Kys7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFdlIG5lZWQgdG8gc2V0IHRoZSBjdXJyZW50Tm9kZSBhd2F5IGZyb20gdGhlIGNsb25lZCB0cmVlIHNvIHRoYXQgd2VcbiAgICAvLyBkb24ndCBob2xkIG9udG8gdGhlIHRyZWUgZXZlbiBpZiB0aGUgdHJlZSBpcyBkZXRhY2hlZCBhbmQgc2hvdWxkIGJlXG4gICAgLy8gZnJlZWQuXG4gICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gZDtcbiAgICByZXR1cm4gZnJhZ21lbnQ7XG4gIH1cblxuICBfdXBkYXRlKHZhbHVlczogQXJyYXk8dW5rbm93bj4pIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwYXJ0IG9mIHRoaXMuXyRwYXJ0cykge1xuICAgICAgaWYgKHBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAgICBraW5kOiAnc2V0IHBhcnQnLFxuICAgICAgICAgICAgcGFydCxcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZXNbaV0sXG4gICAgICAgICAgICB2YWx1ZUluZGV4OiBpLFxuICAgICAgICAgICAgdmFsdWVzLFxuICAgICAgICAgICAgdGVtcGxhdGVJbnN0YW5jZTogdGhpcyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKChwYXJ0IGFzIEF0dHJpYnV0ZVBhcnQpLnN0cmluZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIChwYXJ0IGFzIEF0dHJpYnV0ZVBhcnQpLl8kc2V0VmFsdWUodmFsdWVzLCBwYXJ0IGFzIEF0dHJpYnV0ZVBhcnQsIGkpO1xuICAgICAgICAgIC8vIFRoZSBudW1iZXIgb2YgdmFsdWVzIHRoZSBwYXJ0IGNvbnN1bWVzIGlzIHBhcnQuc3RyaW5ncy5sZW5ndGggLSAxXG4gICAgICAgICAgLy8gc2luY2UgdmFsdWVzIGFyZSBpbiBiZXR3ZWVuIHRlbXBsYXRlIHNwYW5zLiBXZSBpbmNyZW1lbnQgaSBieSAxXG4gICAgICAgICAgLy8gbGF0ZXIgaW4gdGhlIGxvb3AsIHNvIGluY3JlbWVudCBpdCBieSBwYXJ0LnN0cmluZ3MubGVuZ3RoIC0gMiBoZXJlXG4gICAgICAgICAgaSArPSAocGFydCBhcyBBdHRyaWJ1dGVQYXJ0KS5zdHJpbmdzIS5sZW5ndGggLSAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcnQuXyRzZXRWYWx1ZSh2YWx1ZXNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICB9XG59XG5cbi8qXG4gKiBQYXJ0c1xuICovXG50eXBlIEF0dHJpYnV0ZVRlbXBsYXRlUGFydCA9IHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIEFUVFJJQlVURV9QQVJUO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGN0b3I6IHR5cGVvZiBBdHRyaWJ1dGVQYXJ0O1xuICByZWFkb25seSBzdHJpbmdzOiBSZWFkb25seUFycmF5PHN0cmluZz47XG59O1xudHlwZSBDaGlsZFRlbXBsYXRlUGFydCA9IHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIENISUxEX1BBUlQ7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG59O1xudHlwZSBFbGVtZW50VGVtcGxhdGVQYXJ0ID0ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgRUxFTUVOVF9QQVJUO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xufTtcbnR5cGUgQ29tbWVudFRlbXBsYXRlUGFydCA9IHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIENPTU1FTlRfUEFSVDtcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbn07XG5cbi8qKlxuICogQSBUZW1wbGF0ZVBhcnQgcmVwcmVzZW50cyBhIGR5bmFtaWMgcGFydCBpbiBhIHRlbXBsYXRlLCBiZWZvcmUgdGhlIHRlbXBsYXRlXG4gKiBpcyBpbnN0YW50aWF0ZWQuIFdoZW4gYSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQgUGFydHMgYXJlIGNyZWF0ZWQgZnJvbVxuICogVGVtcGxhdGVQYXJ0cy5cbiAqL1xudHlwZSBUZW1wbGF0ZVBhcnQgPVxuICB8IENoaWxkVGVtcGxhdGVQYXJ0XG4gIHwgQXR0cmlidXRlVGVtcGxhdGVQYXJ0XG4gIHwgRWxlbWVudFRlbXBsYXRlUGFydFxuICB8IENvbW1lbnRUZW1wbGF0ZVBhcnQ7XG5cbmV4cG9ydCB0eXBlIFBhcnQgPVxuICB8IENoaWxkUGFydFxuICB8IEF0dHJpYnV0ZVBhcnRcbiAgfCBQcm9wZXJ0eVBhcnRcbiAgfCBCb29sZWFuQXR0cmlidXRlUGFydFxuICB8IEVsZW1lbnRQYXJ0XG4gIHwgRXZlbnRQYXJ0O1xuXG5leHBvcnQgdHlwZSB7Q2hpbGRQYXJ0fTtcbmNsYXNzIENoaWxkUGFydCBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgcmVhZG9ubHkgdHlwZSA9IENISUxEX1BBUlQ7XG4gIHJlYWRvbmx5IG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gIF8kY29tbWl0dGVkVmFsdWU6IHVua25vd24gPSBub3RoaW5nO1xuICAvKiogQGludGVybmFsICovXG4gIF9fZGlyZWN0aXZlPzogRGlyZWN0aXZlO1xuICAvKiogQGludGVybmFsICovXG4gIF8kc3RhcnROb2RlOiBDaGlsZE5vZGU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRlbmROb2RlOiBDaGlsZE5vZGUgfCBudWxsO1xuICBwcml2YXRlIF90ZXh0U2FuaXRpemVyOiBWYWx1ZVNhbml0aXplciB8IHVuZGVmaW5lZDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHBhcmVudDogRGlzY29ubmVjdGFibGUgfCB1bmRlZmluZWQ7XG4gIC8qKlxuICAgKiBDb25uZWN0aW9uIHN0YXRlIGZvciBSb290UGFydHMgb25seSAoaS5lLiBDaGlsZFBhcnQgd2l0aG91dCBfJHBhcmVudFxuICAgKiByZXR1cm5lZCBmcm9tIHRvcC1sZXZlbCBgcmVuZGVyYCkuIFRoaXMgZmllbGQgaXMgdW51c2VkIG90aGVyd2lzZS4gVGhlXG4gICAqIGludGVudGlvbiB3b3VsZCBiZSBjbGVhcmVyIGlmIHdlIG1hZGUgYFJvb3RQYXJ0YCBhIHN1YmNsYXNzIG9mIGBDaGlsZFBhcnRgXG4gICAqIHdpdGggdGhpcyBmaWVsZCAoYW5kIGEgZGlmZmVyZW50IF8kaXNDb25uZWN0ZWQgZ2V0dGVyKSwgYnV0IHRoZSBzdWJjbGFzc1xuICAgKiBjYXVzZWQgYSBwZXJmIHJlZ3Jlc3Npb24sIHBvc3NpYmx5IGR1ZSB0byBtYWtpbmcgY2FsbCBzaXRlcyBwb2x5bW9ycGhpYy5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBfX2lzQ29ubmVjdGVkOiBib29sZWFuO1xuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgLy8gQ2hpbGRQYXJ0cyB0aGF0IGFyZSBub3QgYXQgdGhlIHJvb3Qgc2hvdWxkIGFsd2F5cyBiZSBjcmVhdGVkIHdpdGggYVxuICAgIC8vIHBhcmVudDsgb25seSBSb290Q2hpbGROb2RlJ3Mgd29uJ3QsIHNvIHRoZXkgcmV0dXJuIHRoZSBsb2NhbCBpc0Nvbm5lY3RlZFxuICAgIC8vIHN0YXRlXG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQ/Ll8kaXNDb25uZWN0ZWQgPz8gdGhpcy5fX2lzQ29ubmVjdGVkO1xuICB9XG5cbiAgLy8gVGhlIGZvbGxvd2luZyBmaWVsZHMgd2lsbCBiZSBwYXRjaGVkIG9udG8gQ2hpbGRQYXJ0cyB3aGVuIHJlcXVpcmVkIGJ5XG4gIC8vIEFzeW5jRGlyZWN0aXZlXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPiA9IHVuZGVmaW5lZDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJG5vdGlmeUNvbm5lY3Rpb25DaGFuZ2VkPyhcbiAgICBpc0Nvbm5lY3RlZDogYm9vbGVhbixcbiAgICByZW1vdmVGcm9tUGFyZW50PzogYm9vbGVhbixcbiAgICBmcm9tPzogbnVtYmVyXG4gICk6IHZvaWQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRyZXBhcmVudERpc2Nvbm5lY3RhYmxlcz8ocGFyZW50OiBEaXNjb25uZWN0YWJsZSk6IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgc3RhcnROb2RlOiBDaGlsZE5vZGUsXG4gICAgZW5kTm9kZTogQ2hpbGROb2RlIHwgbnVsbCxcbiAgICBwYXJlbnQ6IFRlbXBsYXRlSW5zdGFuY2UgfCBDaGlsZFBhcnQgfCB1bmRlZmluZWQsXG4gICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICB0aGlzLl8kc3RhcnROb2RlID0gc3RhcnROb2RlO1xuICAgIHRoaXMuXyRlbmROb2RlID0gZW5kTm9kZTtcbiAgICB0aGlzLl8kcGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgLy8gTm90ZSBfX2lzQ29ubmVjdGVkIGlzIG9ubHkgZXZlciBhY2Nlc3NlZCBvbiBSb290UGFydHMgKGkuZS4gd2hlbiB0aGVyZSBpc1xuICAgIC8vIG5vIF8kcGFyZW50KTsgdGhlIHZhbHVlIG9uIGEgbm9uLXJvb3QtcGFydCBpcyBcImRvbid0IGNhcmVcIiwgYnV0IGNoZWNraW5nXG4gICAgLy8gZm9yIHBhcmVudCB3b3VsZCBiZSBtb3JlIGNvZGVcbiAgICB0aGlzLl9faXNDb25uZWN0ZWQgPSBvcHRpb25zPy5pc0Nvbm5lY3RlZCA/PyB0cnVlO1xuICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgIC8vIEV4cGxpY2l0bHkgaW5pdGlhbGl6ZSBmb3IgY29uc2lzdGVudCBjbGFzcyBzaGFwZS5cbiAgICAgIHRoaXMuX3RleHRTYW5pdGl6ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBwYXJlbnQgbm9kZSBpbnRvIHdoaWNoIHRoZSBwYXJ0IHJlbmRlcnMgaXRzIGNvbnRlbnQuXG4gICAqXG4gICAqIEEgQ2hpbGRQYXJ0J3MgY29udGVudCBjb25zaXN0cyBvZiBhIHJhbmdlIG9mIGFkamFjZW50IGNoaWxkIG5vZGVzIG9mXG4gICAqIGAucGFyZW50Tm9kZWAsIHBvc3NpYmx5IGJvcmRlcmVkIGJ5ICdtYXJrZXIgbm9kZXMnIChgLnN0YXJ0Tm9kZWAgYW5kXG4gICAqIGAuZW5kTm9kZWApLlxuICAgKlxuICAgKiAtIElmIGJvdGggYC5zdGFydE5vZGVgIGFuZCBgLmVuZE5vZGVgIGFyZSBub24tbnVsbCwgdGhlbiB0aGUgcGFydCdzIGNvbnRlbnRcbiAgICogY29uc2lzdHMgb2YgYWxsIHNpYmxpbmdzIGJldHdlZW4gYC5zdGFydE5vZGVgIGFuZCBgLmVuZE5vZGVgLCBleGNsdXNpdmVseS5cbiAgICpcbiAgICogLSBJZiBgLnN0YXJ0Tm9kZWAgaXMgbm9uLW51bGwgYnV0IGAuZW5kTm9kZWAgaXMgbnVsbCwgdGhlbiB0aGUgcGFydCdzXG4gICAqIGNvbnRlbnQgY29uc2lzdHMgb2YgYWxsIHNpYmxpbmdzIGZvbGxvd2luZyBgLnN0YXJ0Tm9kZWAsIHVwIHRvIGFuZFxuICAgKiBpbmNsdWRpbmcgdGhlIGxhc3QgY2hpbGQgb2YgYC5wYXJlbnROb2RlYC4gSWYgYC5lbmROb2RlYCBpcyBub24tbnVsbCwgdGhlblxuICAgKiBgLnN0YXJ0Tm9kZWAgd2lsbCBhbHdheXMgYmUgbm9uLW51bGwuXG4gICAqXG4gICAqIC0gSWYgYm90aCBgLmVuZE5vZGVgIGFuZCBgLnN0YXJ0Tm9kZWAgYXJlIG51bGwsIHRoZW4gdGhlIHBhcnQncyBjb250ZW50XG4gICAqIGNvbnNpc3RzIG9mIGFsbCBjaGlsZCBub2RlcyBvZiBgLnBhcmVudE5vZGVgLlxuICAgKi9cbiAgZ2V0IHBhcmVudE5vZGUoKTogTm9kZSB7XG4gICAgbGV0IHBhcmVudE5vZGU6IE5vZGUgPSB3cmFwKHRoaXMuXyRzdGFydE5vZGUpLnBhcmVudE5vZGUhO1xuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuXyRwYXJlbnQ7XG4gICAgaWYgKFxuICAgICAgcGFyZW50ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHBhcmVudE5vZGU/Lm5vZGVUeXBlID09PSAxMSAvKiBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UICovXG4gICAgKSB7XG4gICAgICAvLyBJZiB0aGUgcGFyZW50Tm9kZSBpcyBhIERvY3VtZW50RnJhZ21lbnQsIGl0IG1heSBiZSBiZWNhdXNlIHRoZSBET00gaXNcbiAgICAgIC8vIHN0aWxsIGluIHRoZSBjbG9uZWQgZnJhZ21lbnQgZHVyaW5nIGluaXRpYWwgcmVuZGVyOyBpZiBzbywgZ2V0IHRoZSByZWFsXG4gICAgICAvLyBwYXJlbnROb2RlIHRoZSBwYXJ0IHdpbGwgYmUgY29tbWl0dGVkIGludG8gYnkgYXNraW5nIHRoZSBwYXJlbnQuXG4gICAgICBwYXJlbnROb2RlID0gKHBhcmVudCBhcyBDaGlsZFBhcnQgfCBUZW1wbGF0ZUluc3RhbmNlKS5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gcGFyZW50Tm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcGFydCdzIGxlYWRpbmcgbWFya2VyIG5vZGUsIGlmIGFueS4gU2VlIGAucGFyZW50Tm9kZWAgZm9yIG1vcmVcbiAgICogaW5mb3JtYXRpb24uXG4gICAqL1xuICBnZXQgc3RhcnROb2RlKCk6IE5vZGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fJHN0YXJ0Tm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcGFydCdzIHRyYWlsaW5nIG1hcmtlciBub2RlLCBpZiBhbnkuIFNlZSBgLnBhcmVudE5vZGVgIGZvciBtb3JlXG4gICAqIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgZ2V0IGVuZE5vZGUoKTogTm9kZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl8kZW5kTm9kZTtcbiAgfVxuXG4gIF8kc2V0VmFsdWUodmFsdWU6IHVua25vd24sIGRpcmVjdGl2ZVBhcmVudDogRGlyZWN0aXZlUGFyZW50ID0gdGhpcyk6IHZvaWQge1xuICAgIGlmIChERVZfTU9ERSAmJiB0aGlzLnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFRoaXMgXFxgQ2hpbGRQYXJ0XFxgIGhhcyBubyBcXGBwYXJlbnROb2RlXFxgIGFuZCB0aGVyZWZvcmUgY2Fubm90IGFjY2VwdCBhIHZhbHVlLiBUaGlzIGxpa2VseSBtZWFucyB0aGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBwYXJ0IHdhcyBtYW5pcHVsYXRlZCBpbiBhbiB1bnN1cHBvcnRlZCB3YXkgb3V0c2lkZSBvZiBMaXQncyBjb250cm9sIHN1Y2ggdGhhdCB0aGUgcGFydCdzIG1hcmtlciBub2RlcyB3ZXJlIGVqZWN0ZWQgZnJvbSBET00uIEZvciBleGFtcGxlLCBzZXR0aW5nIHRoZSBlbGVtZW50J3MgXFxgaW5uZXJIVE1MXFxgIG9yIFxcYHRleHRDb250ZW50XFxgIGNhbiBkbyB0aGlzLmBcbiAgICAgICk7XG4gICAgfVxuICAgIHZhbHVlID0gcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCB2YWx1ZSwgZGlyZWN0aXZlUGFyZW50KTtcbiAgICBpZiAoaXNQcmltaXRpdmUodmFsdWUpKSB7XG4gICAgICAvLyBOb24tcmVuZGVyaW5nIGNoaWxkIHZhbHVlcy4gSXQncyBpbXBvcnRhbnQgdGhhdCB0aGVzZSBkbyBub3QgcmVuZGVyXG4gICAgICAvLyBlbXB0eSB0ZXh0IG5vZGVzIHRvIGF2b2lkIGlzc3VlcyB3aXRoIHByZXZlbnRpbmcgZGVmYXVsdCA8c2xvdD5cbiAgICAgIC8vIGZhbGxiYWNrIGNvbnRlbnQuXG4gICAgICBpZiAodmFsdWUgPT09IG5vdGhpbmcgfHwgdmFsdWUgPT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgaWYgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAhPT0gbm90aGluZykge1xuICAgICAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgICAgICBraW5kOiAnY29tbWl0IG5vdGhpbmcgdG8gY2hpbGQnLFxuICAgICAgICAgICAgICBzdGFydDogdGhpcy5fJHN0YXJ0Tm9kZSxcbiAgICAgICAgICAgICAgZW5kOiB0aGlzLl8kZW5kTm9kZSxcbiAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLl8kcGFyZW50LFxuICAgICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLl8kY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBub3RoaW5nO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSAhPT0gdGhpcy5fJGNvbW1pdHRlZFZhbHVlICYmIHZhbHVlICE9PSBub0NoYW5nZSkge1xuICAgICAgICB0aGlzLl9jb21taXRUZXh0KHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgfSBlbHNlIGlmICgodmFsdWUgYXMgVGVtcGxhdGVSZXN1bHQpWydfJGxpdFR5cGUkJ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fY29tbWl0VGVtcGxhdGVSZXN1bHQodmFsdWUgYXMgVGVtcGxhdGVSZXN1bHQpO1xuICAgIH0gZWxzZSBpZiAoKHZhbHVlIGFzIE5vZGUpLm5vZGVUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChERVZfTU9ERSAmJiB0aGlzLm9wdGlvbnM/Lmhvc3QgPT09IHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2NvbW1pdFRleHQoXG4gICAgICAgICAgYFtwcm9iYWJsZSBtaXN0YWtlOiByZW5kZXJlZCBhIHRlbXBsYXRlJ3MgaG9zdCBpbiBpdHNlbGYgYCArXG4gICAgICAgICAgICBgKGNvbW1vbmx5IGNhdXNlZCBieSB3cml0aW5nIFxcJHt0aGlzfSBpbiBhIHRlbXBsYXRlXWBcbiAgICAgICAgKTtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGBBdHRlbXB0ZWQgdG8gcmVuZGVyIHRoZSB0ZW1wbGF0ZSBob3N0YCxcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBgaW5zaWRlIGl0c2VsZi4gVGhpcyBpcyBhbG1vc3QgYWx3YXlzIGEgbWlzdGFrZSwgYW5kIGluIGRldiBtb2RlIGAsXG4gICAgICAgICAgYHdlIHJlbmRlciBzb21lIHdhcm5pbmcgdGV4dC4gSW4gcHJvZHVjdGlvbiBob3dldmVyLCB3ZSdsbCBgLFxuICAgICAgICAgIGByZW5kZXIgaXQsIHdoaWNoIHdpbGwgdXN1YWxseSByZXN1bHQgaW4gYW4gZXJyb3IsIGFuZCBzb21ldGltZXMgYCxcbiAgICAgICAgICBgaW4gdGhlIGVsZW1lbnQgZGlzYXBwZWFyaW5nIGZyb20gdGhlIERPTS5gXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NvbW1pdE5vZGUodmFsdWUgYXMgTm9kZSk7XG4gICAgfSBlbHNlIGlmIChpc0l0ZXJhYmxlKHZhbHVlKSkge1xuICAgICAgdGhpcy5fY29tbWl0SXRlcmFibGUodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBGYWxsYmFjaywgd2lsbCByZW5kZXIgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvblxuICAgICAgdGhpcy5fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfaW5zZXJ0PFQgZXh0ZW5kcyBOb2RlPihub2RlOiBUKSB7XG4gICAgcmV0dXJuIHdyYXAod3JhcCh0aGlzLl8kc3RhcnROb2RlKS5wYXJlbnROb2RlISkuaW5zZXJ0QmVmb3JlKFxuICAgICAgbm9kZSxcbiAgICAgIHRoaXMuXyRlbmROb2RlXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1pdE5vZGUodmFsdWU6IE5vZGUpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fJGNvbW1pdHRlZFZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgdGhpcy5fJGNsZWFyKCk7XG4gICAgICBpZiAoXG4gICAgICAgIEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUyAmJlxuICAgICAgICBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwgIT09IG5vb3BTYW5pdGl6ZXJcbiAgICAgICkge1xuICAgICAgICBjb25zdCBwYXJlbnROb2RlTmFtZSA9IHRoaXMuXyRzdGFydE5vZGUucGFyZW50Tm9kZT8ubm9kZU5hbWU7XG4gICAgICAgIGlmIChwYXJlbnROb2RlTmFtZSA9PT0gJ1NUWUxFJyB8fCBwYXJlbnROb2RlTmFtZSA9PT0gJ1NDUklQVCcpIHtcbiAgICAgICAgICBsZXQgbWVzc2FnZSA9ICdGb3JiaWRkZW4nO1xuICAgICAgICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgICAgICAgaWYgKHBhcmVudE5vZGVOYW1lID09PSAnU1RZTEUnKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGBMaXQgZG9lcyBub3Qgc3VwcG9ydCBiaW5kaW5nIGluc2lkZSBzdHlsZSBub2Rlcy4gYCArXG4gICAgICAgICAgICAgICAgYFRoaXMgaXMgYSBzZWN1cml0eSByaXNrLCBhcyBzdHlsZSBpbmplY3Rpb24gYXR0YWNrcyBjYW4gYCArXG4gICAgICAgICAgICAgICAgYGV4ZmlsdHJhdGUgZGF0YSBhbmQgc3Bvb2YgVUlzLiBgICtcbiAgICAgICAgICAgICAgICBgQ29uc2lkZXIgaW5zdGVhZCB1c2luZyBjc3NcXGAuLi5cXGAgbGl0ZXJhbHMgYCArXG4gICAgICAgICAgICAgICAgYHRvIGNvbXBvc2Ugc3R5bGVzLCBhbmQgZG8gZHluYW1pYyBzdHlsaW5nIHdpdGggYCArXG4gICAgICAgICAgICAgICAgYGNzcyBjdXN0b20gcHJvcGVydGllcywgOjpwYXJ0cywgPHNsb3Q+cywgYCArXG4gICAgICAgICAgICAgICAgYGFuZCBieSBtdXRhdGluZyB0aGUgRE9NIHJhdGhlciB0aGFuIHN0eWxlc2hlZXRzLmA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtZXNzYWdlID1cbiAgICAgICAgICAgICAgICBgTGl0IGRvZXMgbm90IHN1cHBvcnQgYmluZGluZyBpbnNpZGUgc2NyaXB0IG5vZGVzLiBgICtcbiAgICAgICAgICAgICAgICBgVGhpcyBpcyBhIHNlY3VyaXR5IHJpc2ssIGFzIGl0IGNvdWxkIGFsbG93IGFyYml0cmFyeSBgICtcbiAgICAgICAgICAgICAgICBgY29kZSBleGVjdXRpb24uYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICdjb21taXQgbm9kZScsXG4gICAgICAgICAgc3RhcnQ6IHRoaXMuXyRzdGFydE5vZGUsXG4gICAgICAgICAgcGFyZW50OiB0aGlzLl8kcGFyZW50LFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gdGhpcy5faW5zZXJ0KHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb21taXRUZXh0KHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgLy8gSWYgdGhlIGNvbW1pdHRlZCB2YWx1ZSBpcyBhIHByaW1pdGl2ZSBpdCBtZWFucyB3ZSBjYWxsZWQgX2NvbW1pdFRleHQgb25cbiAgICAvLyB0aGUgcHJldmlvdXMgcmVuZGVyLCBhbmQgd2Uga25vdyB0aGF0IHRoaXMuXyRzdGFydE5vZGUubmV4dFNpYmxpbmcgaXMgYVxuICAgIC8vIFRleHQgbm9kZS4gV2UgY2FuIG5vdyBqdXN0IHJlcGxhY2UgdGhlIHRleHQgY29udGVudCAoLmRhdGEpIG9mIHRoZSBub2RlLlxuICAgIGlmIChcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAhPT0gbm90aGluZyAmJlxuICAgICAgaXNQcmltaXRpdmUodGhpcy5fJGNvbW1pdHRlZFZhbHVlKVxuICAgICkge1xuICAgICAgY29uc3Qgbm9kZSA9IHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkubmV4dFNpYmxpbmcgYXMgVGV4dDtcbiAgICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgICAgaWYgKHRoaXMuX3RleHRTYW5pdGl6ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuX3RleHRTYW5pdGl6ZXIgPSBjcmVhdGVTYW5pdGl6ZXIobm9kZSwgJ2RhdGEnLCAncHJvcGVydHknKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZSA9IHRoaXMuX3RleHRTYW5pdGl6ZXIodmFsdWUpO1xuICAgICAgfVxuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAnY29tbWl0IHRleHQnLFxuICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICAgIChub2RlIGFzIFRleHQpLmRhdGEgPSB2YWx1ZSBhcyBzdHJpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgICAgY29uc3QgdGV4dE5vZGUgPSBkLmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICAgICAgdGhpcy5fY29tbWl0Tm9kZSh0ZXh0Tm9kZSk7XG4gICAgICAgIC8vIFdoZW4gc2V0dGluZyB0ZXh0IGNvbnRlbnQsIGZvciBzZWN1cml0eSBwdXJwb3NlcyBpdCBtYXR0ZXJzIGEgbG90XG4gICAgICAgIC8vIHdoYXQgdGhlIHBhcmVudCBpcy4gRm9yIGV4YW1wbGUsIDxzdHlsZT4gYW5kIDxzY3JpcHQ+IG5lZWQgdG8gYmVcbiAgICAgICAgLy8gaGFuZGxlZCB3aXRoIGNhcmUsIHdoaWxlIDxzcGFuPiBkb2VzIG5vdC4gU28gZmlyc3Qgd2UgbmVlZCB0byBwdXQgYVxuICAgICAgICAvLyB0ZXh0IG5vZGUgaW50byB0aGUgZG9jdW1lbnQsIHRoZW4gd2UgY2FuIHNhbml0aXplIGl0cyBjb250ZW50LlxuICAgICAgICBpZiAodGhpcy5fdGV4dFNhbml0aXplciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5fdGV4dFNhbml0aXplciA9IGNyZWF0ZVNhbml0aXplcih0ZXh0Tm9kZSwgJ2RhdGEnLCAncHJvcGVydHknKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZSA9IHRoaXMuX3RleHRTYW5pdGl6ZXIodmFsdWUpO1xuICAgICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAgICBraW5kOiAnY29tbWl0IHRleHQnLFxuICAgICAgICAgICAgbm9kZTogdGV4dE5vZGUsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgdGV4dE5vZGUuZGF0YSA9IHZhbHVlIGFzIHN0cmluZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NvbW1pdE5vZGUoZC5jcmVhdGVUZXh0Tm9kZSh2YWx1ZSBhcyBzdHJpbmcpKTtcbiAgICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgICAga2luZDogJ2NvbW1pdCB0ZXh0JyxcbiAgICAgICAgICAgIG5vZGU6IHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkubmV4dFNpYmxpbmcgYXMgVGV4dCxcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1pdFRlbXBsYXRlUmVzdWx0KFxuICAgIHJlc3VsdDogVGVtcGxhdGVSZXN1bHQgfCBDb21waWxlZFRlbXBsYXRlUmVzdWx0XG4gICk6IHZvaWQge1xuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgY29uc3Qge3ZhbHVlcywgWydfJGxpdFR5cGUkJ106IHR5cGV9ID0gcmVzdWx0O1xuICAgIC8vIElmICRsaXRUeXBlJCBpcyBhIG51bWJlciwgcmVzdWx0IGlzIGEgcGxhaW4gVGVtcGxhdGVSZXN1bHQgYW5kIHdlIGdldFxuICAgIC8vIHRoZSB0ZW1wbGF0ZSBmcm9tIHRoZSB0ZW1wbGF0ZSBjYWNoZS4gSWYgbm90LCByZXN1bHQgaXMgYVxuICAgIC8vIENvbXBpbGVkVGVtcGxhdGVSZXN1bHQgYW5kIF8kbGl0VHlwZSQgaXMgYSBDb21waWxlZFRlbXBsYXRlIGFuZCB3ZSBuZWVkXG4gICAgLy8gdG8gY3JlYXRlIHRoZSA8dGVtcGxhdGU+IGVsZW1lbnQgdGhlIGZpcnN0IHRpbWUgd2Ugc2VlIGl0LlxuICAgIGNvbnN0IHRlbXBsYXRlOiBUZW1wbGF0ZSB8IENvbXBpbGVkVGVtcGxhdGUgPVxuICAgICAgdHlwZW9mIHR5cGUgPT09ICdudW1iZXInXG4gICAgICAgID8gdGhpcy5fJGdldFRlbXBsYXRlKHJlc3VsdCBhcyBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQpXG4gICAgICAgIDogKHR5cGUuZWwgPT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgKHR5cGUuZWwgPSBUZW1wbGF0ZS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICB0cnVzdEZyb21UZW1wbGF0ZVN0cmluZyh0eXBlLmgsIHR5cGUuaFswXSksXG4gICAgICAgICAgICAgIHRoaXMub3B0aW9uc1xuICAgICAgICAgICAgKSksXG4gICAgICAgICAgdHlwZSk7XG5cbiAgICBpZiAoKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBUZW1wbGF0ZUluc3RhbmNlKT8uXyR0ZW1wbGF0ZSA9PT0gdGVtcGxhdGUpIHtcbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ3RlbXBsYXRlIHVwZGF0aW5nJyxcbiAgICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgICBpbnN0YW5jZTogdGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIFRlbXBsYXRlSW5zdGFuY2UsXG4gICAgICAgICAgcGFydHM6ICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgVGVtcGxhdGVJbnN0YW5jZSkuXyRwYXJ0cyxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgdmFsdWVzLFxuICAgICAgICB9KTtcbiAgICAgICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgVGVtcGxhdGVJbnN0YW5jZSkuX3VwZGF0ZSh2YWx1ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlIGFzIFRlbXBsYXRlLCB0aGlzKTtcbiAgICAgIGNvbnN0IGZyYWdtZW50ID0gaW5zdGFuY2UuX2Nsb25lKHRoaXMub3B0aW9ucyk7XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBpbnN0YW50aWF0ZWQnLFxuICAgICAgICAgIHRlbXBsYXRlLFxuICAgICAgICAgIGluc3RhbmNlLFxuICAgICAgICAgIHBhcnRzOiBpbnN0YW5jZS5fJHBhcnRzLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICB2YWx1ZXMsXG4gICAgICAgIH0pO1xuICAgICAgaW5zdGFuY2UuX3VwZGF0ZSh2YWx1ZXMpO1xuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAndGVtcGxhdGUgaW5zdGFudGlhdGVkIGFuZCB1cGRhdGVkJyxcbiAgICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgICBpbnN0YW5jZSxcbiAgICAgICAgICBwYXJ0czogaW5zdGFuY2UuXyRwYXJ0cyxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgdmFsdWVzLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXMuX2NvbW1pdE5vZGUoZnJhZ21lbnQpO1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gaW5zdGFuY2U7XG4gICAgfVxuICB9XG5cbiAgLy8gT3ZlcnJpZGRlbiB2aWEgYGxpdEh0bWxQb2x5ZmlsbFN1cHBvcnRgIHRvIHByb3ZpZGUgcGxhdGZvcm0gc3VwcG9ydC5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGdldFRlbXBsYXRlKHJlc3VsdDogVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0KSB7XG4gICAgbGV0IHRlbXBsYXRlID0gdGVtcGxhdGVDYWNoZS5nZXQocmVzdWx0LnN0cmluZ3MpO1xuICAgIGlmICh0ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0ZW1wbGF0ZUNhY2hlLnNldChyZXN1bHQuc3RyaW5ncywgKHRlbXBsYXRlID0gbmV3IFRlbXBsYXRlKHJlc3VsdCkpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tbWl0SXRlcmFibGUodmFsdWU6IEl0ZXJhYmxlPHVua25vd24+KTogdm9pZCB7XG4gICAgLy8gRm9yIGFuIEl0ZXJhYmxlLCB3ZSBjcmVhdGUgYSBuZXcgSW5zdGFuY2VQYXJ0IHBlciBpdGVtLCB0aGVuIHNldCBpdHNcbiAgICAvLyB2YWx1ZSB0byB0aGUgaXRlbS4gVGhpcyBpcyBhIGxpdHRsZSBiaXQgb2Ygb3ZlcmhlYWQgZm9yIGV2ZXJ5IGl0ZW0gaW5cbiAgICAvLyBhbiBJdGVyYWJsZSwgYnV0IGl0IGxldHMgdXMgcmVjdXJzZSBlYXNpbHkgYW5kIGVmZmljaWVudGx5IHVwZGF0ZSBBcnJheXNcbiAgICAvLyBvZiBUZW1wbGF0ZVJlc3VsdHMgdGhhdCB3aWxsIGJlIGNvbW1vbmx5IHJldHVybmVkIGZyb20gZXhwcmVzc2lvbnMgbGlrZTpcbiAgICAvLyBhcnJheS5tYXAoKGkpID0+IGh0bWxgJHtpfWApLCBieSByZXVzaW5nIGV4aXN0aW5nIFRlbXBsYXRlSW5zdGFuY2VzLlxuXG4gICAgLy8gSWYgdmFsdWUgaXMgYW4gYXJyYXksIHRoZW4gdGhlIHByZXZpb3VzIHJlbmRlciB3YXMgb2YgYW5cbiAgICAvLyBpdGVyYWJsZSBhbmQgdmFsdWUgd2lsbCBjb250YWluIHRoZSBDaGlsZFBhcnRzIGZyb20gdGhlIHByZXZpb3VzXG4gICAgLy8gcmVuZGVyLiBJZiB2YWx1ZSBpcyBub3QgYW4gYXJyYXksIGNsZWFyIHRoaXMgcGFydCBhbmQgbWFrZSBhIG5ld1xuICAgIC8vIGFycmF5IGZvciBDaGlsZFBhcnRzLlxuICAgIGlmICghaXNBcnJheSh0aGlzLl8kY29tbWl0dGVkVmFsdWUpKSB7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBbXTtcbiAgICAgIHRoaXMuXyRjbGVhcigpO1xuICAgIH1cblxuICAgIC8vIExldHMgdXMga2VlcCB0cmFjayBvZiBob3cgbWFueSBpdGVtcyB3ZSBzdGFtcGVkIHNvIHdlIGNhbiBjbGVhciBsZWZ0b3ZlclxuICAgIC8vIGl0ZW1zIGZyb20gYSBwcmV2aW91cyByZW5kZXJcbiAgICBjb25zdCBpdGVtUGFydHMgPSB0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgQ2hpbGRQYXJ0W107XG4gICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgbGV0IGl0ZW1QYXJ0OiBDaGlsZFBhcnQgfCB1bmRlZmluZWQ7XG5cbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdmFsdWUpIHtcbiAgICAgIGlmIChwYXJ0SW5kZXggPT09IGl0ZW1QYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gSWYgbm8gZXhpc3RpbmcgcGFydCwgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgICAvLyBUT0RPIChqdXN0aW5mYWduYW5pKTogdGVzdCBwZXJmIGltcGFjdCBvZiBhbHdheXMgY3JlYXRpbmcgdHdvIHBhcnRzXG4gICAgICAgIC8vIGluc3RlYWQgb2Ygc2hhcmluZyBwYXJ0cyBiZXR3ZWVuIG5vZGVzXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9saXQvbGl0L2lzc3Vlcy8xMjY2XG4gICAgICAgIGl0ZW1QYXJ0cy5wdXNoKFxuICAgICAgICAgIChpdGVtUGFydCA9IG5ldyBDaGlsZFBhcnQoXG4gICAgICAgICAgICB0aGlzLl9pbnNlcnQoY3JlYXRlTWFya2VyKCkpLFxuICAgICAgICAgICAgdGhpcy5faW5zZXJ0KGNyZWF0ZU1hcmtlcigpKSxcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gUmV1c2UgYW4gZXhpc3RpbmcgcGFydFxuICAgICAgICBpdGVtUGFydCA9IGl0ZW1QYXJ0c1twYXJ0SW5kZXhdO1xuICAgICAgfVxuICAgICAgaXRlbVBhcnQuXyRzZXRWYWx1ZShpdGVtKTtcbiAgICAgIHBhcnRJbmRleCsrO1xuICAgIH1cblxuICAgIGlmIChwYXJ0SW5kZXggPCBpdGVtUGFydHMubGVuZ3RoKSB7XG4gICAgICAvLyBpdGVtUGFydHMgYWx3YXlzIGhhdmUgZW5kIG5vZGVzXG4gICAgICB0aGlzLl8kY2xlYXIoXG4gICAgICAgIGl0ZW1QYXJ0ICYmIHdyYXAoaXRlbVBhcnQuXyRlbmROb2RlISkubmV4dFNpYmxpbmcsXG4gICAgICAgIHBhcnRJbmRleFxuICAgICAgKTtcbiAgICAgIC8vIFRydW5jYXRlIHRoZSBwYXJ0cyBhcnJheSBzbyBfdmFsdWUgcmVmbGVjdHMgdGhlIGN1cnJlbnQgc3RhdGVcbiAgICAgIGl0ZW1QYXJ0cy5sZW5ndGggPSBwYXJ0SW5kZXg7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIG5vZGVzIGNvbnRhaW5lZCB3aXRoaW4gdGhpcyBQYXJ0IGZyb20gdGhlIERPTS5cbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0IFN0YXJ0IG5vZGUgdG8gY2xlYXIgZnJvbSwgZm9yIGNsZWFyaW5nIGEgc3Vic2V0IG9mIHRoZSBwYXJ0J3NcbiAgICogICAgIERPTSAodXNlZCB3aGVuIHRydW5jYXRpbmcgaXRlcmFibGVzKVxuICAgKiBAcGFyYW0gZnJvbSAgV2hlbiBgc3RhcnRgIGlzIHNwZWNpZmllZCwgdGhlIGluZGV4IHdpdGhpbiB0aGUgaXRlcmFibGUgZnJvbVxuICAgKiAgICAgd2hpY2ggQ2hpbGRQYXJ0cyBhcmUgYmVpbmcgcmVtb3ZlZCwgdXNlZCBmb3IgZGlzY29ubmVjdGluZyBkaXJlY3RpdmVzIGluXG4gICAqICAgICB0aG9zZSBQYXJ0cy5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfJGNsZWFyKFxuICAgIHN0YXJ0OiBDaGlsZE5vZGUgfCBudWxsID0gd3JhcCh0aGlzLl8kc3RhcnROb2RlKS5uZXh0U2libGluZyxcbiAgICBmcm9tPzogbnVtYmVyXG4gICkge1xuICAgIHRoaXMuXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZD8uKGZhbHNlLCB0cnVlLCBmcm9tKTtcbiAgICB3aGlsZSAoc3RhcnQgJiYgc3RhcnQgIT09IHRoaXMuXyRlbmROb2RlKSB7XG4gICAgICBjb25zdCBuID0gd3JhcChzdGFydCEpLm5leHRTaWJsaW5nO1xuICAgICAgKHdyYXAoc3RhcnQhKSBhcyBFbGVtZW50KS5yZW1vdmUoKTtcbiAgICAgIHN0YXJ0ID0gbjtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIFJvb3RQYXJ0J3MgYGlzQ29ubmVjdGVkYC4gTm90ZSB0aGF0IHRoaXMgbWV0aG9kXG4gICAqIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBvbiBgUm9vdFBhcnRgcyAodGhlIGBDaGlsZFBhcnRgIHJldHVybmVkIGZyb20gYVxuICAgKiB0b3AtbGV2ZWwgYHJlbmRlcigpYCBjYWxsKS4gSXQgaGFzIG5vIGVmZmVjdCBvbiBub24tcm9vdCBDaGlsZFBhcnRzLlxuICAgKiBAcGFyYW0gaXNDb25uZWN0ZWQgV2hldGhlciB0byBzZXRcbiAgICogQGludGVybmFsXG4gICAqL1xuICBzZXRDb25uZWN0ZWQoaXNDb25uZWN0ZWQ6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5fJHBhcmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9faXNDb25uZWN0ZWQgPSBpc0Nvbm5lY3RlZDtcbiAgICAgIHRoaXMuXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZD8uKGlzQ29ubmVjdGVkKTtcbiAgICB9IGVsc2UgaWYgKERFVl9NT0RFKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdwYXJ0LnNldENvbm5lY3RlZCgpIG1heSBvbmx5IGJlIGNhbGxlZCBvbiBhICcgK1xuICAgICAgICAgICdSb290UGFydCByZXR1cm5lZCBmcm9tIHJlbmRlcigpLidcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQSB0b3AtbGV2ZWwgYENoaWxkUGFydGAgcmV0dXJuZWQgZnJvbSBgcmVuZGVyYCB0aGF0IG1hbmFnZXMgdGhlIGNvbm5lY3RlZFxuICogc3RhdGUgb2YgYEFzeW5jRGlyZWN0aXZlYHMgY3JlYXRlZCB0aHJvdWdob3V0IHRoZSB0cmVlIGJlbG93IGl0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJvb3RQYXJ0IGV4dGVuZHMgQ2hpbGRQYXJ0IHtcbiAgLyoqXG4gICAqIFNldHMgdGhlIGNvbm5lY3Rpb24gc3RhdGUgZm9yIGBBc3luY0RpcmVjdGl2ZWBzIGNvbnRhaW5lZCB3aXRoaW4gdGhpcyByb290XG4gICAqIENoaWxkUGFydC5cbiAgICpcbiAgICogbGl0LWh0bWwgZG9lcyBub3QgYXV0b21hdGljYWxseSBtb25pdG9yIHRoZSBjb25uZWN0ZWRuZXNzIG9mIERPTSByZW5kZXJlZDtcbiAgICogYXMgc3VjaCwgaXQgaXMgdGhlIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSBjYWxsZXIgdG8gYHJlbmRlcmAgdG8gZW5zdXJlIHRoYXRcbiAgICogYHBhcnQuc2V0Q29ubmVjdGVkKGZhbHNlKWAgaXMgY2FsbGVkIGJlZm9yZSB0aGUgcGFydCBvYmplY3QgaXMgcG90ZW50aWFsbHlcbiAgICogZGlzY2FyZGVkLCB0byBlbnN1cmUgdGhhdCBgQXN5bmNEaXJlY3RpdmVgcyBoYXZlIGEgY2hhbmNlIHRvIGRpc3Bvc2Ugb2ZcbiAgICogYW55IHJlc291cmNlcyBiZWluZyBoZWxkLiBJZiBhIGBSb290UGFydGAgdGhhdCB3YXMgcHJldmlvdXNseVxuICAgKiBkaXNjb25uZWN0ZWQgaXMgc3Vic2VxdWVudGx5IHJlLWNvbm5lY3RlZCAoYW5kIGl0cyBgQXN5bmNEaXJlY3RpdmVgcyBzaG91bGRcbiAgICogcmUtY29ubmVjdCksIGBzZXRDb25uZWN0ZWQodHJ1ZSlgIHNob3VsZCBiZSBjYWxsZWQuXG4gICAqXG4gICAqIEBwYXJhbSBpc0Nvbm5lY3RlZCBXaGV0aGVyIGRpcmVjdGl2ZXMgd2l0aGluIHRoaXMgdHJlZSBzaG91bGQgYmUgY29ubmVjdGVkXG4gICAqIG9yIG5vdFxuICAgKi9cbiAgc2V0Q29ubmVjdGVkKGlzQ29ubmVjdGVkOiBib29sZWFuKTogdm9pZDtcbn1cblxuZXhwb3J0IHR5cGUge0F0dHJpYnV0ZVBhcnR9O1xuY2xhc3MgQXR0cmlidXRlUGFydCBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgcmVhZG9ubHkgdHlwZTpcbiAgICB8IHR5cGVvZiBBVFRSSUJVVEVfUEFSVFxuICAgIHwgdHlwZW9mIFBST1BFUlRZX1BBUlRcbiAgICB8IHR5cGVvZiBCT09MRUFOX0FUVFJJQlVURV9QQVJUXG4gICAgfCB0eXBlb2YgRVZFTlRfUEFSVCA9IEFUVFJJQlVURV9QQVJUO1xuICByZWFkb25seSBlbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICByZWFkb25seSBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBJZiB0aGlzIGF0dHJpYnV0ZSBwYXJ0IHJlcHJlc2VudHMgYW4gaW50ZXJwb2xhdGlvbiwgdGhpcyBjb250YWlucyB0aGVcbiAgICogc3RhdGljIHN0cmluZ3Mgb2YgdGhlIGludGVycG9sYXRpb24uIEZvciBzaW5nbGUtdmFsdWUsIGNvbXBsZXRlIGJpbmRpbmdzLFxuICAgKiB0aGlzIGlzIHVuZGVmaW5lZC5cbiAgICovXG4gIHJlYWRvbmx5IHN0cmluZ3M/OiBSZWFkb25seUFycmF5PHN0cmluZz47XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRjb21taXR0ZWRWYWx1ZTogdW5rbm93biB8IEFycmF5PHVua25vd24+ID0gbm90aGluZztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfX2RpcmVjdGl2ZXM/OiBBcnJheTxEaXJlY3RpdmUgfCB1bmRlZmluZWQ+O1xuICAvKiogQGludGVybmFsICovXG4gIF8kcGFyZW50OiBEaXNjb25uZWN0YWJsZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+ID0gdW5kZWZpbmVkO1xuXG4gIHByb3RlY3RlZCBfc2FuaXRpemVyOiBWYWx1ZVNhbml0aXplciB8IHVuZGVmaW5lZDtcblxuICBnZXQgdGFnTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnRhZ05hbWU7XG4gIH1cblxuICAvLyBTZWUgY29tbWVudCBpbiBEaXNjb25uZWN0YWJsZSBpbnRlcmZhY2UgZm9yIHdoeSB0aGlzIGlzIGEgZ2V0dGVyXG4gIGdldCBfJGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl8kcGFyZW50Ll8kaXNDb25uZWN0ZWQ7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3RyaW5nczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LFxuICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUsXG4gICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5fJHBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIGlmIChzdHJpbmdzLmxlbmd0aCA+IDIgfHwgc3RyaW5nc1swXSAhPT0gJycgfHwgc3RyaW5nc1sxXSAhPT0gJycpIHtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IG5ldyBBcnJheShzdHJpbmdzLmxlbmd0aCAtIDEpLmZpbGwobmV3IFN0cmluZygpKTtcbiAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IG5vdGhpbmc7XG4gICAgfVxuICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgIHRoaXMuX3Nhbml0aXplciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgdGhpcyBwYXJ0IGJ5IHJlc29sdmluZyB0aGUgdmFsdWUgZnJvbSBwb3NzaWJseSBtdWx0aXBsZVxuICAgKiB2YWx1ZXMgYW5kIHN0YXRpYyBzdHJpbmdzIGFuZCBjb21taXR0aW5nIGl0IHRvIHRoZSBET00uXG4gICAqIElmIHRoaXMgcGFydCBpcyBzaW5nbGUtdmFsdWVkLCBgdGhpcy5fc3RyaW5nc2Agd2lsbCBiZSB1bmRlZmluZWQsIGFuZCB0aGVcbiAgICogbWV0aG9kIHdpbGwgYmUgY2FsbGVkIHdpdGggYSBzaW5nbGUgdmFsdWUgYXJndW1lbnQuIElmIHRoaXMgcGFydCBpc1xuICAgKiBtdWx0aS12YWx1ZSwgYHRoaXMuX3N0cmluZ3NgIHdpbGwgYmUgZGVmaW5lZCwgYW5kIHRoZSBtZXRob2QgaXMgY2FsbGVkXG4gICAqIHdpdGggdGhlIHZhbHVlIGFycmF5IG9mIHRoZSBwYXJ0J3Mgb3duaW5nIFRlbXBsYXRlSW5zdGFuY2UsIGFuZCBhbiBvZmZzZXRcbiAgICogaW50byB0aGUgdmFsdWUgYXJyYXkgZnJvbSB3aGljaCB0aGUgdmFsdWVzIHNob3VsZCBiZSByZWFkLlxuICAgKiBUaGlzIG1ldGhvZCBpcyBvdmVybG9hZGVkIHRoaXMgd2F5IHRvIGVsaW1pbmF0ZSBzaG9ydC1saXZlZCBhcnJheSBzbGljZXNcbiAgICogb2YgdGhlIHRlbXBsYXRlIGluc3RhbmNlIHZhbHVlcywgYW5kIGFsbG93IGEgZmFzdC1wYXRoIGZvciBzaW5nbGUtdmFsdWVkXG4gICAqIHBhcnRzLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHBhcnQgdmFsdWUsIG9yIGFuIGFycmF5IG9mIHZhbHVlcyBmb3IgbXVsdGktdmFsdWVkIHBhcnRzXG4gICAqIEBwYXJhbSB2YWx1ZUluZGV4IHRoZSBpbmRleCB0byBzdGFydCByZWFkaW5nIHZhbHVlcyBmcm9tLiBgdW5kZWZpbmVkYCBmb3JcbiAgICogICBzaW5nbGUtdmFsdWVkIHBhcnRzXG4gICAqIEBwYXJhbSBub0NvbW1pdCBjYXVzZXMgdGhlIHBhcnQgdG8gbm90IGNvbW1pdCBpdHMgdmFsdWUgdG8gdGhlIERPTS4gVXNlZFxuICAgKiAgIGluIGh5ZHJhdGlvbiB0byBwcmltZSBhdHRyaWJ1dGUgcGFydHMgd2l0aCB0aGVpciBmaXJzdC1yZW5kZXJlZCB2YWx1ZSxcbiAgICogICBidXQgbm90IHNldCB0aGUgYXR0cmlidXRlLCBhbmQgaW4gU1NSIHRvIG5vLW9wIHRoZSBET00gb3BlcmF0aW9uIGFuZFxuICAgKiAgIGNhcHR1cmUgdGhlIHZhbHVlIGZvciBzZXJpYWxpemF0aW9uLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF8kc2V0VmFsdWUoXG4gICAgdmFsdWU6IHVua25vd24gfCBBcnJheTx1bmtub3duPixcbiAgICBkaXJlY3RpdmVQYXJlbnQ6IERpcmVjdGl2ZVBhcmVudCA9IHRoaXMsXG4gICAgdmFsdWVJbmRleD86IG51bWJlcixcbiAgICBub0NvbW1pdD86IGJvb2xlYW5cbiAgKSB7XG4gICAgY29uc3Qgc3RyaW5ncyA9IHRoaXMuc3RyaW5ncztcblxuICAgIC8vIFdoZXRoZXIgYW55IG9mIHRoZSB2YWx1ZXMgaGFzIGNoYW5nZWQsIGZvciBkaXJ0eS1jaGVja2luZ1xuICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcblxuICAgIGlmIChzdHJpbmdzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFNpbmdsZS12YWx1ZSBiaW5kaW5nIGNhc2VcbiAgICAgIHZhbHVlID0gcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCB2YWx1ZSwgZGlyZWN0aXZlUGFyZW50LCAwKTtcbiAgICAgIGNoYW5nZSA9XG4gICAgICAgICFpc1ByaW1pdGl2ZSh2YWx1ZSkgfHxcbiAgICAgICAgKHZhbHVlICE9PSB0aGlzLl8kY29tbWl0dGVkVmFsdWUgJiYgdmFsdWUgIT09IG5vQ2hhbmdlKTtcbiAgICAgIGlmIChjaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gdmFsdWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEludGVycG9sYXRpb24gY2FzZVxuICAgICAgY29uc3QgdmFsdWVzID0gdmFsdWUgYXMgQXJyYXk8dW5rbm93bj47XG4gICAgICB2YWx1ZSA9IHN0cmluZ3NbMF07XG5cbiAgICAgIGxldCBpLCB2O1xuICAgICAgZm9yIChpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIHYgPSByZXNvbHZlRGlyZWN0aXZlKHRoaXMsIHZhbHVlc1t2YWx1ZUluZGV4ISArIGldLCBkaXJlY3RpdmVQYXJlbnQsIGkpO1xuXG4gICAgICAgIGlmICh2ID09PSBub0NoYW5nZSkge1xuICAgICAgICAgIC8vIElmIHRoZSB1c2VyLXByb3ZpZGVkIHZhbHVlIGlzIGBub0NoYW5nZWAsIHVzZSB0aGUgcHJldmlvdXMgdmFsdWVcbiAgICAgICAgICB2ID0gKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBBcnJheTx1bmtub3duPilbaV07XG4gICAgICAgIH1cbiAgICAgICAgY2hhbmdlIHx8PVxuICAgICAgICAgICFpc1ByaW1pdGl2ZSh2KSB8fCB2ICE9PSAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIEFycmF5PHVua25vd24+KVtpXTtcbiAgICAgICAgaWYgKHYgPT09IG5vdGhpbmcpIHtcbiAgICAgICAgICB2YWx1ZSA9IG5vdGhpbmc7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgIT09IG5vdGhpbmcpIHtcbiAgICAgICAgICB2YWx1ZSArPSAodiA/PyAnJykgKyBzdHJpbmdzW2kgKyAxXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSBhbHdheXMgcmVjb3JkIGVhY2ggdmFsdWUsIGV2ZW4gaWYgb25lIGlzIGBub3RoaW5nYCwgZm9yIGZ1dHVyZVxuICAgICAgICAvLyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgICAgICAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIEFycmF5PHVua25vd24+KVtpXSA9IHY7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjaGFuZ2UgJiYgIW5vQ29tbWl0KSB7XG4gICAgICB0aGlzLl9jb21taXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29tbWl0VmFsdWUodmFsdWU6IHVua25vd24pIHtcbiAgICBpZiAodmFsdWUgPT09IG5vdGhpbmcpIHtcbiAgICAgICh3cmFwKHRoaXMuZWxlbWVudCkgYXMgRWxlbWVudCkucmVtb3ZlQXR0cmlidXRlKHRoaXMubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgICAgaWYgKHRoaXMuX3Nhbml0aXplciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5fc2FuaXRpemVyID0gc2FuaXRpemVyRmFjdG9yeUludGVybmFsKFxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICAgICAgJ2F0dHJpYnV0ZSdcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlID0gdGhpcy5fc2FuaXRpemVyKHZhbHVlID8/ICcnKTtcbiAgICAgIH1cbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ2NvbW1pdCBhdHRyaWJ1dGUnLFxuICAgICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICAgICh3cmFwKHRoaXMuZWxlbWVudCkgYXMgRWxlbWVudCkuc2V0QXR0cmlidXRlKFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgICh2YWx1ZSA/PyAnJykgYXMgc3RyaW5nXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgdHlwZSB7UHJvcGVydHlQYXJ0fTtcbmNsYXNzIFByb3BlcnR5UGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xuICBvdmVycmlkZSByZWFkb25seSB0eXBlID0gUFJPUEVSVFlfUEFSVDtcblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIF9jb21taXRWYWx1ZSh2YWx1ZTogdW5rbm93bikge1xuICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgIGlmICh0aGlzLl9zYW5pdGl6ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLl9zYW5pdGl6ZXIgPSBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwoXG4gICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgICAncHJvcGVydHknXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB2YWx1ZSA9IHRoaXMuX3Nhbml0aXplcih2YWx1ZSk7XG4gICAgfVxuICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICBraW5kOiAnY29tbWl0IHByb3BlcnR5JyxcbiAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICB9KTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICh0aGlzLmVsZW1lbnQgYXMgYW55KVt0aGlzLm5hbWVdID0gdmFsdWUgPT09IG5vdGhpbmcgPyB1bmRlZmluZWQgOiB2YWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSB7Qm9vbGVhbkF0dHJpYnV0ZVBhcnR9O1xuY2xhc3MgQm9vbGVhbkF0dHJpYnV0ZVBhcnQgZXh0ZW5kcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkgdHlwZSA9IEJPT0xFQU5fQVRUUklCVVRFX1BBUlQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfY29tbWl0VmFsdWUodmFsdWU6IHVua25vd24pIHtcbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ2NvbW1pdCBib29sZWFuIGF0dHJpYnV0ZScsXG4gICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICB2YWx1ZTogISEodmFsdWUgJiYgdmFsdWUgIT09IG5vdGhpbmcpLFxuICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICB9KTtcbiAgICAod3JhcCh0aGlzLmVsZW1lbnQpIGFzIEVsZW1lbnQpLnRvZ2dsZUF0dHJpYnV0ZShcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgICEhdmFsdWUgJiYgdmFsdWUgIT09IG5vdGhpbmdcbiAgICApO1xuICB9XG59XG5cbnR5cGUgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zID0gRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCAmXG4gIFBhcnRpYWw8QWRkRXZlbnRMaXN0ZW5lck9wdGlvbnM+O1xuXG4vKipcbiAqIEFuIEF0dHJpYnV0ZVBhcnQgdGhhdCBtYW5hZ2VzIGFuIGV2ZW50IGxpc3RlbmVyIHZpYSBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lci5cbiAqXG4gKiBUaGlzIHBhcnQgd29ya3MgYnkgYWRkaW5nIGl0c2VsZiBhcyB0aGUgZXZlbnQgbGlzdGVuZXIgb24gYW4gZWxlbWVudCwgdGhlblxuICogZGVsZWdhdGluZyB0byB0aGUgdmFsdWUgcGFzc2VkIHRvIGl0LiBUaGlzIHJlZHVjZXMgdGhlIG51bWJlciBvZiBjYWxscyB0b1xuICogYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIgaWYgdGhlIGxpc3RlbmVyIGNoYW5nZXMgZnJlcXVlbnRseSwgc3VjaCBhcyB3aGVuIGFuXG4gKiBpbmxpbmUgZnVuY3Rpb24gaXMgdXNlZCBhcyBhIGxpc3RlbmVyLlxuICpcbiAqIEJlY2F1c2UgZXZlbnQgb3B0aW9ucyBhcmUgcGFzc2VkIHdoZW4gYWRkaW5nIGxpc3RlbmVycywgd2UgbXVzdCB0YWtlIGNhc2VcbiAqIHRvIGFkZCBhbmQgcmVtb3ZlIHRoZSBwYXJ0IGFzIGEgbGlzdGVuZXIgd2hlbiB0aGUgZXZlbnQgb3B0aW9ucyBjaGFuZ2UuXG4gKi9cbmV4cG9ydCB0eXBlIHtFdmVudFBhcnR9O1xuY2xhc3MgRXZlbnRQYXJ0IGV4dGVuZHMgQXR0cmlidXRlUGFydCB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IHR5cGUgPSBFVkVOVF9QQVJUO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzdHJpbmdzOiBSZWFkb25seUFycmF5PHN0cmluZz4sXG4gICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSxcbiAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MsIHBhcmVudCwgb3B0aW9ucyk7XG5cbiAgICBpZiAoREVWX01PREUgJiYgdGhpcy5zdHJpbmdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEEgXFxgPCR7ZWxlbWVudC5sb2NhbE5hbWV9PlxcYCBoYXMgYSBcXGBAJHtuYW1lfT0uLi5cXGAgbGlzdGVuZXIgd2l0aCBgICtcbiAgICAgICAgICAnaW52YWxpZCBjb250ZW50LiBFdmVudCBsaXN0ZW5lcnMgaW4gdGVtcGxhdGVzIG11c3QgaGF2ZSBleGFjdGx5ICcgK1xuICAgICAgICAgICdvbmUgZXhwcmVzc2lvbiBhbmQgbm8gc3Vycm91bmRpbmcgdGV4dC4nXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIEV2ZW50UGFydCBkb2VzIG5vdCB1c2UgdGhlIGJhc2UgXyRzZXRWYWx1ZS9fcmVzb2x2ZVZhbHVlIGltcGxlbWVudGF0aW9uXG4gIC8vIHNpbmNlIHRoZSBkaXJ0eSBjaGVja2luZyBpcyBtb3JlIGNvbXBsZXhcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfJHNldFZhbHVlKFxuICAgIG5ld0xpc3RlbmVyOiB1bmtub3duLFxuICAgIGRpcmVjdGl2ZVBhcmVudDogRGlyZWN0aXZlUGFyZW50ID0gdGhpc1xuICApIHtcbiAgICBuZXdMaXN0ZW5lciA9XG4gICAgICByZXNvbHZlRGlyZWN0aXZlKHRoaXMsIG5ld0xpc3RlbmVyLCBkaXJlY3RpdmVQYXJlbnQsIDApID8/IG5vdGhpbmc7XG4gICAgaWYgKG5ld0xpc3RlbmVyID09PSBub0NoYW5nZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBvbGRMaXN0ZW5lciA9IHRoaXMuXyRjb21taXR0ZWRWYWx1ZTtcblxuICAgIC8vIElmIHRoZSBuZXcgdmFsdWUgaXMgbm90aGluZyBvciBhbnkgb3B0aW9ucyBjaGFuZ2Ugd2UgaGF2ZSB0byByZW1vdmUgdGhlXG4gICAgLy8gcGFydCBhcyBhIGxpc3RlbmVyLlxuICAgIGNvbnN0IHNob3VsZFJlbW92ZUxpc3RlbmVyID1cbiAgICAgIChuZXdMaXN0ZW5lciA9PT0gbm90aGluZyAmJiBvbGRMaXN0ZW5lciAhPT0gbm90aGluZykgfHxcbiAgICAgIChuZXdMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLmNhcHR1cmUgIT09XG4gICAgICAgIChvbGRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLmNhcHR1cmUgfHxcbiAgICAgIChuZXdMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLm9uY2UgIT09XG4gICAgICAgIChvbGRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLm9uY2UgfHxcbiAgICAgIChuZXdMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLnBhc3NpdmUgIT09XG4gICAgICAgIChvbGRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLnBhc3NpdmU7XG5cbiAgICAvLyBJZiB0aGUgbmV3IHZhbHVlIGlzIG5vdCBub3RoaW5nIGFuZCB3ZSByZW1vdmVkIHRoZSBsaXN0ZW5lciwgd2UgaGF2ZVxuICAgIC8vIHRvIGFkZCB0aGUgcGFydCBhcyBhIGxpc3RlbmVyLlxuICAgIGNvbnN0IHNob3VsZEFkZExpc3RlbmVyID1cbiAgICAgIG5ld0xpc3RlbmVyICE9PSBub3RoaW5nICYmXG4gICAgICAob2xkTGlzdGVuZXIgPT09IG5vdGhpbmcgfHwgc2hvdWxkUmVtb3ZlTGlzdGVuZXIpO1xuXG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICdjb21taXQgZXZlbnQgbGlzdGVuZXInLFxuICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgdmFsdWU6IG5ld0xpc3RlbmVyLFxuICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgIHJlbW92ZUxpc3RlbmVyOiBzaG91bGRSZW1vdmVMaXN0ZW5lcixcbiAgICAgICAgYWRkTGlzdGVuZXI6IHNob3VsZEFkZExpc3RlbmVyLFxuICAgICAgICBvbGRMaXN0ZW5lcixcbiAgICAgIH0pO1xuICAgIGlmIChzaG91bGRSZW1vdmVMaXN0ZW5lcikge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgdGhpcyxcbiAgICAgICAgb2xkTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoc2hvdWxkQWRkTGlzdGVuZXIpIHtcbiAgICAgIC8vIEJld2FyZTogSUUxMSBhbmQgQ2hyb21lIDQxIGRvbid0IGxpa2UgdXNpbmcgdGhlIGxpc3RlbmVyIGFzIHRoZVxuICAgICAgLy8gb3B0aW9ucyBvYmplY3QuIEZpZ3VyZSBvdXQgaG93IHRvIGRlYWwgdy8gdGhpcyBpbiBJRTExIC0gbWF5YmVcbiAgICAgIC8vIHBhdGNoIGFkZEV2ZW50TGlzdGVuZXI/XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB0aGlzLFxuICAgICAgICBuZXdMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnNcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IG5ld0xpc3RlbmVyO1xuICB9XG5cbiAgaGFuZGxlRXZlbnQoZXZlbnQ6IEV2ZW50KSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZS5jYWxsKHRoaXMub3B0aW9ucz8uaG9zdCA/PyB0aGlzLmVsZW1lbnQsIGV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBFdmVudExpc3RlbmVyT2JqZWN0KS5oYW5kbGVFdmVudChldmVudCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIHtFbGVtZW50UGFydH07XG5jbGFzcyBFbGVtZW50UGFydCBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgcmVhZG9ubHkgdHlwZSA9IEVMRU1FTlRfUEFSVDtcblxuICAvKiogQGludGVybmFsICovXG4gIF9fZGlyZWN0aXZlPzogRGlyZWN0aXZlO1xuXG4gIC8vIFRoaXMgaXMgdG8gZW5zdXJlIHRoYXQgZXZlcnkgUGFydCBoYXMgYSBfJGNvbW1pdHRlZFZhbHVlXG4gIF8kY29tbWl0dGVkVmFsdWU6IHVuZGVmaW5lZDtcblxuICAvKiogQGludGVybmFsICovXG4gIF8kcGFyZW50ITogRGlzY29ubmVjdGFibGU7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+ID0gdW5kZWZpbmVkO1xuXG4gIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsZW1lbnQ6IEVsZW1lbnQsXG4gICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSxcbiAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHRoaXMuXyRwYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQuXyRpc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIF8kc2V0VmFsdWUodmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ2NvbW1pdCB0byBlbGVtZW50IGJpbmRpbmcnLFxuICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICB9KTtcbiAgICByZXNvbHZlRGlyZWN0aXZlKHRoaXMsIHZhbHVlKTtcbiAgfVxufVxuXG4vKipcbiAqIEVORCBVU0VSUyBTSE9VTEQgTk9UIFJFTFkgT04gVEhJUyBPQkpFQ1QuXG4gKlxuICogUHJpdmF0ZSBleHBvcnRzIGZvciB1c2UgYnkgb3RoZXIgTGl0IHBhY2thZ2VzLCBub3QgaW50ZW5kZWQgZm9yIHVzZSBieVxuICogZXh0ZXJuYWwgdXNlcnMuXG4gKlxuICogV2UgY3VycmVudGx5IGRvIG5vdCBtYWtlIGEgbWFuZ2xlZCByb2xsdXAgYnVpbGQgb2YgdGhlIGxpdC1zc3IgY29kZS4gSW4gb3JkZXJcbiAqIHRvIGtlZXAgYSBudW1iZXIgb2YgKG90aGVyd2lzZSBwcml2YXRlKSB0b3AtbGV2ZWwgZXhwb3J0cyBtYW5nbGVkIGluIHRoZVxuICogY2xpZW50IHNpZGUgY29kZSwgd2UgZXhwb3J0IGEgXyRMSCBvYmplY3QgY29udGFpbmluZyB0aG9zZSBtZW1iZXJzIChvclxuICogaGVscGVyIG1ldGhvZHMgZm9yIGFjY2Vzc2luZyBwcml2YXRlIGZpZWxkcyBvZiB0aG9zZSBtZW1iZXJzKSwgYW5kIHRoZW5cbiAqIHJlLWV4cG9ydCB0aGVtIGZvciB1c2UgaW4gbGl0LXNzci4gVGhpcyBrZWVwcyBsaXQtc3NyIGFnbm9zdGljIHRvIHdoZXRoZXIgdGhlXG4gKiBjbGllbnQtc2lkZSBjb2RlIGlzIGJlaW5nIHVzZWQgaW4gYGRldmAgbW9kZSBvciBgcHJvZGAgbW9kZS5cbiAqXG4gKiBUaGlzIGhhcyBhIHVuaXF1ZSBuYW1lLCB0byBkaXNhbWJpZ3VhdGUgaXQgZnJvbSBwcml2YXRlIGV4cG9ydHMgaW5cbiAqIGxpdC1lbGVtZW50LCB3aGljaCByZS1leHBvcnRzIGFsbCBvZiBsaXQtaHRtbC5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgXyRMSCA9IHtcbiAgLy8gVXNlZCBpbiBsaXQtc3NyXG4gIF9ib3VuZEF0dHJpYnV0ZVN1ZmZpeDogYm91bmRBdHRyaWJ1dGVTdWZmaXgsXG4gIF9tYXJrZXI6IG1hcmtlcixcbiAgX21hcmtlck1hdGNoOiBtYXJrZXJNYXRjaCxcbiAgX0hUTUxfUkVTVUxUOiBIVE1MX1JFU1VMVCxcbiAgX2dldFRlbXBsYXRlSHRtbDogZ2V0VGVtcGxhdGVIdG1sLFxuICAvLyBVc2VkIGluIHRlc3RzIGFuZCBwcml2YXRlLXNzci1zdXBwb3J0XG4gIF9UZW1wbGF0ZUluc3RhbmNlOiBUZW1wbGF0ZUluc3RhbmNlLFxuICBfaXNJdGVyYWJsZTogaXNJdGVyYWJsZSxcbiAgX3Jlc29sdmVEaXJlY3RpdmU6IHJlc29sdmVEaXJlY3RpdmUsXG4gIF9DaGlsZFBhcnQ6IENoaWxkUGFydCxcbiAgX0F0dHJpYnV0ZVBhcnQ6IEF0dHJpYnV0ZVBhcnQsXG4gIF9Cb29sZWFuQXR0cmlidXRlUGFydDogQm9vbGVhbkF0dHJpYnV0ZVBhcnQsXG4gIF9FdmVudFBhcnQ6IEV2ZW50UGFydCxcbiAgX1Byb3BlcnR5UGFydDogUHJvcGVydHlQYXJ0LFxuICBfRWxlbWVudFBhcnQ6IEVsZW1lbnRQYXJ0LFxufTtcblxuLy8gQXBwbHkgcG9seWZpbGxzIGlmIGF2YWlsYWJsZVxuY29uc3QgcG9seWZpbGxTdXBwb3J0ID0gREVWX01PREVcbiAgPyBnbG9iYWwubGl0SHRtbFBvbHlmaWxsU3VwcG9ydERldk1vZGVcbiAgOiBnbG9iYWwubGl0SHRtbFBvbHlmaWxsU3VwcG9ydDtcbnBvbHlmaWxsU3VwcG9ydD8uKFRlbXBsYXRlLCBDaGlsZFBhcnQpO1xuXG4vLyBJTVBPUlRBTlQ6IGRvIG5vdCBjaGFuZ2UgdGhlIHByb3BlcnR5IG5hbWUgb3IgdGhlIGFzc2lnbm1lbnQgZXhwcmVzc2lvbi5cbi8vIFRoaXMgbGluZSB3aWxsIGJlIHVzZWQgaW4gcmVnZXhlcyB0byBzZWFyY2ggZm9yIGxpdC1odG1sIHVzYWdlLlxuKGdsb2JhbC5saXRIdG1sVmVyc2lvbnMgPz89IFtdKS5wdXNoKCczLjIuMScpO1xuaWYgKERFVl9NT0RFICYmIGdsb2JhbC5saXRIdG1sVmVyc2lvbnMubGVuZ3RoID4gMSkge1xuICBpc3N1ZVdhcm5pbmchKFxuICAgICdtdWx0aXBsZS12ZXJzaW9ucycsXG4gICAgYE11bHRpcGxlIHZlcnNpb25zIG9mIExpdCBsb2FkZWQuIGAgK1xuICAgICAgYExvYWRpbmcgbXVsdGlwbGUgdmVyc2lvbnMgaXMgbm90IHJlY29tbWVuZGVkLmBcbiAgKTtcbn1cblxuLyoqXG4gKiBSZW5kZXJzIGEgdmFsdWUsIHVzdWFsbHkgYSBsaXQtaHRtbCBUZW1wbGF0ZVJlc3VsdCwgdG8gdGhlIGNvbnRhaW5lci5cbiAqXG4gKiBUaGlzIGV4YW1wbGUgcmVuZGVycyB0aGUgdGV4dCBcIkhlbGxvLCBab2UhXCIgaW5zaWRlIGEgcGFyYWdyYXBoIHRhZywgYXBwZW5kaW5nXG4gKiBpdCB0byB0aGUgY29udGFpbmVyIGBkb2N1bWVudC5ib2R5YC5cbiAqXG4gKiBgYGBqc1xuICogaW1wb3J0IHtodG1sLCByZW5kZXJ9IGZyb20gJ2xpdCc7XG4gKlxuICogY29uc3QgbmFtZSA9IFwiWm9lXCI7XG4gKiByZW5kZXIoaHRtbGA8cD5IZWxsbywgJHtuYW1lfSE8L3A+YCwgZG9jdW1lbnQuYm9keSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gdmFsdWUgQW55IFtyZW5kZXJhYmxlXG4gKiAgIHZhbHVlXShodHRwczovL2xpdC5kZXYvZG9jcy90ZW1wbGF0ZXMvZXhwcmVzc2lvbnMvI2NoaWxkLWV4cHJlc3Npb25zKSxcbiAqICAgdHlwaWNhbGx5IGEge0BsaW5rY29kZSBUZW1wbGF0ZVJlc3VsdH0gY3JlYXRlZCBieSBldmFsdWF0aW5nIGEgdGVtcGxhdGUgdGFnXG4gKiAgIGxpa2Uge0BsaW5rY29kZSBodG1sfSBvciB7QGxpbmtjb2RlIHN2Z30uXG4gKiBAcGFyYW0gY29udGFpbmVyIEEgRE9NIGNvbnRhaW5lciB0byByZW5kZXIgdG8uIFRoZSBmaXJzdCByZW5kZXIgd2lsbCBhcHBlbmRcbiAqICAgdGhlIHJlbmRlcmVkIHZhbHVlIHRvIHRoZSBjb250YWluZXIsIGFuZCBzdWJzZXF1ZW50IHJlbmRlcnMgd2lsbFxuICogICBlZmZpY2llbnRseSB1cGRhdGUgdGhlIHJlbmRlcmVkIHZhbHVlIGlmIHRoZSBzYW1lIHJlc3VsdCB0eXBlIHdhc1xuICogICBwcmV2aW91c2x5IHJlbmRlcmVkIHRoZXJlLlxuICogQHBhcmFtIG9wdGlvbnMgU2VlIHtAbGlua2NvZGUgUmVuZGVyT3B0aW9uc30gZm9yIG9wdGlvbnMgZG9jdW1lbnRhdGlvbi5cbiAqIEBzZWVcbiAqIHtAbGluayBodHRwczovL2xpdC5kZXYvZG9jcy9saWJyYXJpZXMvc3RhbmRhbG9uZS10ZW1wbGF0ZXMvI3JlbmRlcmluZy1saXQtaHRtbC10ZW1wbGF0ZXN8IFJlbmRlcmluZyBMaXQgSFRNTCBUZW1wbGF0ZXN9XG4gKi9cbmV4cG9ydCBjb25zdCByZW5kZXIgPSAoXG4gIHZhbHVlOiB1bmtub3duLFxuICBjb250YWluZXI6IEhUTUxFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCxcbiAgb3B0aW9ucz86IFJlbmRlck9wdGlvbnNcbik6IFJvb3RQYXJ0ID0+IHtcbiAgaWYgKERFVl9NT0RFICYmIGNvbnRhaW5lciA9PSBudWxsKSB7XG4gICAgLy8gR2l2ZSBhIGNsZWFyZXIgZXJyb3IgbWVzc2FnZSB0aGFuXG4gICAgLy8gICAgIFVuY2F1Z2h0IFR5cGVFcnJvcjogQ2Fubm90IHJlYWQgcHJvcGVydGllcyBvZiBudWxsIChyZWFkaW5nXG4gICAgLy8gICAgICdfJGxpdFBhcnQkJylcbiAgICAvLyB3aGljaCByZWFkcyBsaWtlIGFuIGludGVybmFsIExpdCBlcnJvci5cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBUaGUgY29udGFpbmVyIHRvIHJlbmRlciBpbnRvIG1heSBub3QgYmUgJHtjb250YWluZXJ9YCk7XG4gIH1cbiAgY29uc3QgcmVuZGVySWQgPSBERVZfTU9ERSA/IGRlYnVnTG9nUmVuZGVySWQrKyA6IDA7XG4gIGNvbnN0IHBhcnRPd25lck5vZGUgPSBvcHRpb25zPy5yZW5kZXJCZWZvcmUgPz8gY29udGFpbmVyO1xuICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBsZXQgcGFydDogQ2hpbGRQYXJ0ID0gKHBhcnRPd25lck5vZGUgYXMgYW55KVsnXyRsaXRQYXJ0JCddO1xuICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgZGVidWdMb2dFdmVudCh7XG4gICAgICBraW5kOiAnYmVnaW4gcmVuZGVyJyxcbiAgICAgIGlkOiByZW5kZXJJZCxcbiAgICAgIHZhbHVlLFxuICAgICAgY29udGFpbmVyLFxuICAgICAgb3B0aW9ucyxcbiAgICAgIHBhcnQsXG4gICAgfSk7XG4gIGlmIChwYXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBlbmROb2RlID0gb3B0aW9ucz8ucmVuZGVyQmVmb3JlID8/IG51bGw7XG4gICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIChwYXJ0T3duZXJOb2RlIGFzIGFueSlbJ18kbGl0UGFydCQnXSA9IHBhcnQgPSBuZXcgQ2hpbGRQYXJ0KFxuICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgZW5kTm9kZSksXG4gICAgICBlbmROb2RlLFxuICAgICAgdW5kZWZpbmVkLFxuICAgICAgb3B0aW9ucyA/PyB7fVxuICAgICk7XG4gIH1cbiAgcGFydC5fJHNldFZhbHVlKHZhbHVlKTtcbiAgZGVidWdMb2dFdmVudCAmJlxuICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAga2luZDogJ2VuZCByZW5kZXInLFxuICAgICAgaWQ6IHJlbmRlcklkLFxuICAgICAgdmFsdWUsXG4gICAgICBjb250YWluZXIsXG4gICAgICBvcHRpb25zLFxuICAgICAgcGFydCxcbiAgICB9KTtcbiAgcmV0dXJuIHBhcnQgYXMgUm9vdFBhcnQ7XG59O1xuXG5pZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gIHJlbmRlci5zZXRTYW5pdGl6ZXIgPSBzZXRTYW5pdGl6ZXI7XG4gIHJlbmRlci5jcmVhdGVTYW5pdGl6ZXIgPSBjcmVhdGVTYW5pdGl6ZXI7XG4gIGlmIChERVZfTU9ERSkge1xuICAgIHJlbmRlci5fdGVzdE9ubHlDbGVhclNhbml0aXplckZhY3RvcnlEb05vdENhbGxPckVsc2UgPVxuICAgICAgX3Rlc3RPbmx5Q2xlYXJTYW5pdGl6ZXJGYWN0b3J5RG9Ob3RDYWxsT3JFbHNlO1xuICB9XG59XG4iLCAiLyoqIFJlc3VsdCBhbGxvd3MgZWFzaWVyIGhhbmRsaW5nIG9mIHJldHVybmluZyBlaXRoZXIgYW4gZXJyb3Igb3IgYSB2YWx1ZSBmcm9tIGFcbiAqIGZ1bmN0aW9uLiAqL1xuZXhwb3J0IHR5cGUgUmVzdWx0PFQ+ID0geyBvazogdHJ1ZTsgdmFsdWU6IFQgfSB8IHsgb2s6IGZhbHNlOyBlcnJvcjogRXJyb3IgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9rPFQ+KHZhbHVlOiBUKTogUmVzdWx0PFQ+IHtcbiAgcmV0dXJuIHsgb2s6IHRydWUsIHZhbHVlOiB2YWx1ZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXJyb3I8VD4odmFsdWU6IHN0cmluZyB8IEVycm9yKTogUmVzdWx0PFQ+IHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IG5ldyBFcnJvcih2YWx1ZSkgfTtcbiAgfVxuICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiB2YWx1ZSB9O1xufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBPcCB9IGZyb20gXCIuLi9vcHMvb3BzXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uL3Jlc3VsdFwiO1xuXG5leHBvcnQgdHlwZSBQb3N0QWN0b25Xb3JrID0gXCJcIiB8IFwicGFpbnRDaGFydFwiIHwgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjtcblxuZXhwb3J0IGludGVyZmFjZSBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yaztcbiAgLy8gVE9ETyAtIERvIHdlIG5lZWQgYSBQb3N0QWN0aW9uRm9jdXM6IG51bWJlciB3aGljaCBwb2ludHMgdG8gdGhlIFRhc2sgd2Ugc2hvdWxkIG1vdmUgdGhlIGZvY3VzIHRvP1xuICB1bmRvOiBib29sZWFuOyAvLyBJZiB0cnVlIGluY2x1ZGUgaW4gdW5kby9yZWRvIGFjdGlvbnMuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+Pjtcbn1cblxuZXhwb3J0IGNsYXNzIE5PT1BBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJEb2VzIG5vdGhpbmdcIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICByZXR1cm4gb2sobmV3IE5PT1BBY3Rpb24oKSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFjdGlvbkZyb21PcCB7XG4gIG5hbWU6IHN0cmluZyA9IFwiQWN0aW9uRnJvbU9wXCI7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkFjdGlvbiBjb25zdHJ1Y3RlZCBkaXJlY3RseSBmcm9tIGFuIE9wLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yaztcbiAgdW5kbzogYm9vbGVhbjtcblxuICBvcDogT3A7XG5cbiAgY29uc3RydWN0b3Iob3A6IE9wLCBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yaywgdW5kbzogYm9vbGVhbikge1xuICAgIHRoaXMucG9zdEFjdGlvbldvcmsgPSBwb3N0QWN0aW9uV29yaztcbiAgICB0aGlzLnVuZG8gPSB1bmRvO1xuICAgIHRoaXMub3AgPSBvcDtcbiAgfVxuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgY29uc3QgcmV0ID0gdGhpcy5vcC5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGV4cGxhbk1haW4ucGxhbiA9IHJldC52YWx1ZS5wbGFuO1xuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG4iLCAiLyoqIE9uZSB2ZXJ0ZXggb2YgYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleCA9IG9iamVjdDtcblxuLyoqIEV2ZXJ5IFZlcnRleCBpbiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgVmVydGljZXMgPSBWZXJ0ZXhbXTtcblxuLyoqIEEgc3Vic2V0IG9mIFZlcnRpY2VzIHJlZmVycmVkIHRvIGJ5IHRoZWlyIGluZGV4IG51bWJlci4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleEluZGljZXMgPSBudW1iZXJbXTtcblxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIHtcbiAgaTogbnVtYmVyO1xuICBqOiBudW1iZXI7XG59XG5cbi8qKiBPbmUgZWRnZSBvZiBhIGdyYXBoLCB3aGljaCBpcyBhIGRpcmVjdGVkIGNvbm5lY3Rpb24gZnJvbSB0aGUgaSd0aCBWZXJ0ZXggdG9cbnRoZSBqJ3RoIFZlcnRleCwgd2hlcmUgdGhlIFZlcnRleCBpcyBzdG9yZWQgaW4gYSBWZXJ0aWNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIERpcmVjdGVkRWRnZSB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyID0gMCwgajogbnVtYmVyID0gMCkge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGVxdWFsKHJoczogRGlyZWN0ZWRFZGdlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJocy5pID09PSB0aGlzLmkgJiYgcmhzLmogPT09IHRoaXMuajtcbiAgfVxuXG4gIHRvSlNPTigpOiBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgaTogdGhpcy5pLFxuICAgICAgajogdGhpcy5qLFxuICAgIH07XG4gIH1cbn1cblxuLyoqIEV2ZXJ5IEVnZGUgaW4gYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIEVkZ2VzID0gRGlyZWN0ZWRFZGdlW107XG5cbi8qKiBBIGdyYXBoIGlzIGp1c3QgYSBjb2xsZWN0aW9uIG9mIFZlcnRpY2VzIGFuZCBFZGdlcyBiZXR3ZWVuIHRob3NlIHZlcnRpY2VzLiAqL1xuZXhwb3J0IHR5cGUgRGlyZWN0ZWRHcmFwaCA9IHtcbiAgVmVydGljZXM6IFZlcnRpY2VzO1xuICBFZGdlczogRWRnZXM7XG59O1xuXG4vKipcbiBHcm91cHMgdGhlIEVkZ2VzIGJ5IHRoZWlyIGBpYCB2YWx1ZS5cblxuIEBwYXJhbSBlZGdlcyAtIEFsbCB0aGUgRWdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gQHJldHVybnMgQSBtYXAgZnJvbSB0aGUgVmVydGV4IGluZGV4IHRvIGFsbCB0aGUgRWRnZXMgdGhhdCBzdGFydCBhdFxuICAgYXQgdGhhdCBWZXJ0ZXggaW5kZXguXG4gKi9cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjVG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5pKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaSwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKlxuICAgR3JvdXBzIHRoZSBFZGdlcyBieSB0aGVpciBgamAgdmFsdWUuXG4gIFxuICAgQHBhcmFtIGVkZ2VzIC0gQWxsIHRoZSBFZGdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gICBAcmV0dXJucyBBIG1hcCBmcm9tIHRoZSBWZXJ0ZXggaW5kZXggdG8gYWxsIHRoZSBFZGdlcyB0aGF0IGVuZCBhdFxuICAgICBhdCB0aGF0IFZlcnRleCBpbmRleC5cbiAgICovXG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5RHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCB0eXBlIFNyY0FuZERzdFJldHVybiA9IHtcbiAgYnlTcmM6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbiAgYnlEc3Q6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbn07XG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogU3JjQW5kRHN0UmV0dXJuID0+IHtcbiAgY29uc3QgcmV0ID0ge1xuICAgIGJ5U3JjOiBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCksXG4gICAgYnlEc3Q6IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKSxcbiAgfTtcblxuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBsZXQgYXJyID0gcmV0LmJ5U3JjLmdldChlLmkpIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5ieVNyYy5zZXQoZS5pLCBhcnIpO1xuICAgIGFyciA9IHJldC5ieURzdC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuYnlEc3Quc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvayB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5cbi8vIE9wZXJhdGlvbnMgb24gUGxhbnMuIE5vdGUgdGhleSBhcmUgcmV2ZXJzaWJsZSwgc28gd2UgY2FuIGhhdmUgYW4gJ3VuZG8nIGxpc3QuXG5cbi8vIEFsc28sIHNvbWUgb3BlcmF0aW9ucyBtaWdodCBoYXZlICdwYXJ0aWFscycsIGkuZS4gcmV0dXJuIGEgbGlzdCBvZiB2YWxpZFxuLy8gb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlIG9wZXJhdGlvbi4gRm9yIGV4YW1wbGUsIGFkZGluZyBhXG4vLyBwcmVkZWNlc3NvciBjb3VsZCBsaXN0IGFsbCB0aGUgVGFza3MgdGhhdCB3b3VsZCBub3QgZm9ybSBhIGxvb3AsIGkuZS4gZXhjbHVkZVxuLy8gYWxsIGRlc2NlbmRlbnRzLCBhbmQgdGhlIFRhc2sgaXRzZWxmLCBmcm9tIHRoZSBsaXN0IG9mIG9wdGlvbnMuXG4vL1xuLy8gKiBDaGFuZ2Ugc3RyaW5nIHZhbHVlIGluIGEgVGFzay5cbi8vICogQ2hhbmdlIGR1cmF0aW9uIHZhbHVlIGluIGEgVGFzay5cbi8vICogSW5zZXJ0IG5ldyBlbXB0eSBUYXNrIGFmdGVyIEluZGV4LlxuLy8gKiBTcGxpdCBhIFRhc2suIChQcmVkZWNlc3NvciB0YWtlcyBhbGwgaW5jb21pbmcgZWRnZXMsIHNvdXJjZSB0YXNrcyBhbGwgb3V0Z29pbmcgZWRnZXMpLlxuLy9cbi8vICogRHVwbGljYXRlIGEgVGFzayAoYWxsIGVkZ2VzIGFyZSBkdXBsaWNhdGVkIGZyb20gdGhlIHNvdXJjZSBUYXNrKS5cbi8vICogRGVsZXRlIHByZWRlY2Vzc29yIHRvIGEgVGFzay5cbi8vICogRGVsZXRlIHN1Y2Nlc3NvciB0byBhIFRhc2suXG4vLyAqIERlbGV0ZSBhIFRhc2suXG5cbi8vIE5lZWQgVW5kby9SZWRvIFN0YWNrcy5cbi8vIFRoZXNlIHJlY29yZCB0aGUgc3ViLW9wcyBmb3IgZWFjaCBsYXJnZSBvcC4gRS5nLiBhbiBpbnNlcnQgdGFzayBvcCBpcyBtYWRlXG4vLyBvZiB0aHJlZSBzdWItb3BzOlxuLy8gICAgMS4gaW5zZXJ0IHRhc2sgaW50byBWZXJ0aWNlcyBhbmQgcmVudW1iZXIgRWRnZXNcbi8vICAgIDIuIEFkZCBlZGdlIGZyb20gU3RhcnQgdG8gTmV3IFRhc2tcbi8vICAgIDMuIEFkZCBlZGdlIGZyb20gTmV3IFRhc2sgdG8gRmluaXNoXG4vL1xuLy8gRWFjaCBzdWItb3A6XG4vLyAgICAxLiBSZWNvcmRzIGFsbCB0aGUgaW5mbyBpdCBuZWVkcyB0byB3b3JrLlxuLy8gICAgMi4gQ2FuIGJlIFwiYXBwbGllZFwiIHRvIGEgUGxhbi5cbi8vICAgIDMuIENhbiBnZW5lcmF0ZSBpdHMgaW52ZXJzZSBzdWItb3AuXG5cbi8vIFRoZSByZXN1bHRzIGZyb20gYXBwbHlpbmcgYSBTdWJPcC4gVGhpcyBpcyB0aGUgb25seSB3YXkgdG8gZ2V0IHRoZSBpbnZlcnNlIG9mXG4vLyBhIFN1Yk9wIHNpbmNlIHRoZSBTdWJPcCBpbnZlcnNlIG1pZ2h0IGRlcGVuZCBvbiB0aGUgc3RhdGUgb2YgdGhlIFBsYW4gYXQgdGhlXG4vLyB0aW1lIHRoZSBTdWJPcCB3YXMgYXBwbGllZC5cbmV4cG9ydCBpbnRlcmZhY2UgU3ViT3BSZXN1bHQge1xuICBwbGFuOiBQbGFuO1xuICBpbnZlcnNlOiBTdWJPcDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdWJPcCB7XG4gIC8vIElmIHRoZSBhcHBseSByZXR1cm5zIGFuIGVycm9yIGl0IGlzIGd1YXJhbnRlZWQgbm90IHRvIGhhdmUgbW9kaWZpZWQgdGhlXG4gIC8vIFBsYW4uXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3BSZXN1bHQge1xuICBwbGFuOiBQbGFuO1xuICBpbnZlcnNlOiBPcDtcbn1cblxuLy8gT3AgYXJlIG9wZXJhdGlvbnMgYXJlIGFwcGxpZWQgdG8gbWFrZSBjaGFuZ2VzIHRvIGEgUGxhbi5cbmV4cG9ydCBjbGFzcyBPcCB7XG4gIHN1Yk9wczogU3ViT3BbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHN1Yk9wczogU3ViT3BbXSkge1xuICAgIHRoaXMuc3ViT3BzID0gc3ViT3BzO1xuICB9XG5cbiAgLy8gUmV2ZXJ0cyBhbGwgU3ViT3BzIHVwIHRvIHRoZSBnaXZlbiBpbmRleC5cbiAgYXBwbHlBbGxJbnZlcnNlU3ViT3BzVG9QbGFuKFxuICAgIHBsYW46IFBsYW4sXG4gICAgaW52ZXJzZVN1Yk9wczogU3ViT3BbXVxuICApOiBSZXN1bHQ8UGxhbj4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW52ZXJzZVN1Yk9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZSA9IGludmVyc2VTdWJPcHNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHBsYW4pO1xuICB9XG5cbiAgLy8gQXBwbGllcyB0aGUgT3AgdG8gYSBQbGFuLlxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8T3BSZXN1bHQ+IHtcbiAgICBjb25zdCBpbnZlcnNlU3ViT3BzOiBTdWJPcFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1Yk9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZSA9IHRoaXMuc3ViT3BzW2ldLmFwcGx5VG8ocGxhbik7XG4gICAgICBpZiAoIWUub2spIHtcbiAgICAgICAgLy8gUmV2ZXJ0IGFsbCB0aGUgU3ViT3BzIGFwcGxpZWQgdXAgdG8gdGhpcyBwb2ludCB0byBnZXQgdGhlIFBsYW4gYmFjayBpbiBhXG4gICAgICAgIC8vIGdvb2QgcGxhY2UuXG4gICAgICAgIGNvbnN0IHJldmVydEVyciA9IHRoaXMuYXBwbHlBbGxJbnZlcnNlU3ViT3BzVG9QbGFuKHBsYW4sIGludmVyc2VTdWJPcHMpO1xuICAgICAgICBpZiAoIXJldmVydEVyci5vaykge1xuICAgICAgICAgIHJldHVybiByZXZlcnRFcnI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgICBwbGFuID0gZS52YWx1ZS5wbGFuO1xuICAgICAgaW52ZXJzZVN1Yk9wcy51bnNoaWZ0KGUudmFsdWUuaW52ZXJzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiBuZXcgT3AoaW52ZXJzZVN1Yk9wcyksXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQWxsT3BzUmVzdWx0ID0ge1xuICBvcHM6IE9wW107XG4gIHBsYW46IFBsYW47XG59O1xuXG5jb25zdCBhcHBseUFsbEludmVyc2VPcHNUb1BsYW4gPSAoaW52ZXJzZXM6IE9wW10sIHBsYW46IFBsYW4pOiBSZXN1bHQ8UGxhbj4gPT4ge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGludmVyc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gaW52ZXJzZXNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgcGxhbiA9IHJlcy52YWx1ZS5wbGFuO1xuICB9XG5cbiAgcmV0dXJuIG9rKHBsYW4pO1xufTtcblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGFwcGx5aW5nIG11bHRpcGxlIE9wcyB0byBhIHBsYW4sIHVzZWQgbW9zdGx5IGZvclxuLy8gdGVzdGluZy5cbmV4cG9ydCBjb25zdCBhcHBseUFsbE9wc1RvUGxhbiA9IChcbiAgb3BzOiBPcFtdLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8QWxsT3BzUmVzdWx0PiA9PiB7XG4gIGNvbnN0IGludmVyc2VzOiBPcFtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gb3BzW2ldLmFwcGx5VG8ocGxhbik7XG4gICAgaWYgKCFyZXMub2spIHtcbiAgICAgIGNvbnN0IGludmVyc2VSZXMgPSBhcHBseUFsbEludmVyc2VPcHNUb1BsYW4oaW52ZXJzZXMsIHBsYW4pO1xuICAgICAgaWYgKCFpbnZlcnNlUmVzLm9rKSB7XG4gICAgICAgIC8vIFRPRE8gQ2FuIHdlIHdyYXAgdGhlIEVycm9yIGluIGFub3RoZXIgZXJyb3IgdG8gbWFrZSBpdCBjbGVhciB0aGlzXG4gICAgICAgIC8vIGVycm9yIGhhcHBlbmVkIHdoZW4gdHJ5aW5nIHRvIGNsZWFuIHVwIGZyb20gdGhlIHByZXZpb3VzIEVycm9yIHdoZW5cbiAgICAgICAgLy8gdGhlIGFwcGx5KCkgZmFpbGVkLlxuICAgICAgICByZXR1cm4gaW52ZXJzZVJlcztcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIGludmVyc2VzLnVuc2hpZnQocmVzLnZhbHVlLmludmVyc2UpO1xuICAgIHBsYW4gPSByZXMudmFsdWUucGxhbjtcbiAgfVxuXG4gIHJldHVybiBvayh7XG4gICAgb3BzOiBpbnZlcnNlcyxcbiAgICBwbGFuOiBwbGFuLFxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBhcHBseUFsbE9wc1RvUGxhbkFuZFRoZW5JbnZlcnNlID0gKFxuICBvcHM6IE9wW10sXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxBbGxPcHNSZXN1bHQ+ID0+IHtcbiAgY29uc3QgcmVzID0gYXBwbHlBbGxPcHNUb1BsYW4ob3BzLCBwbGFuKTtcbiAgaWYgKCFyZXMub2spIHtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIHJldHVybiBhcHBseUFsbE9wc1RvUGxhbihyZXMudmFsdWUub3BzLCByZXMudmFsdWUucGxhbik7XG59O1xuLy8gTm9PcCBpcyBhIG5vLW9wLlxuZXhwb3J0IGZ1bmN0aW9uIE5vT3AoKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtdKTtcbn1cbiIsICIvLyBDaGFuZ2VNZXRyaWNWYWx1ZVxuXG5pbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNEZWZpbml0aW9uIH0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgZXJyb3IsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuXG5leHBvcnQgY2xhc3MgQWRkTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbjtcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbWV0cmljIGtleS5cbiAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24gPSBtZXRyaWNEZWZpbml0aW9uO1xuICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcyA9IHRhc2tNZXRyaWNWYWx1ZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAocGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gYWxyZWFkeSBleGlzdHMgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG5cbiAgICBwbGFuLnNldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lLCB0aGlzLm1ldHJpY0RlZmluaXRpb24pO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBhZGQgdGhpcyBtZXRyaWMgYW5kIHNldCBpdCB0byB0aGUgZGVmYXVsdCxcbiAgICAvLyB1bmxlc3MgdGhlcmUgaXMgbWF0Y2hpbmcgZW50cnkgaW4gdGFza01ldHJpY1ZhbHVlcywgaW4gd2hpY2ggY2FzZSB3ZSB3aWxsXG4gICAgLy8gdXNlIHRoYXQgdmFsdWUsIGkuZS4gdGhpcyBBZGRNZXRyaWNTdWJPcCBpcyBhY3R1YWxseSBhIHJldmVydCBvZiBhXG4gICAgLy8gRGVsZXRlTWV0cmljU3ViT3AuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICB0YXNrLnNldE1ldHJpYyhcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuZ2V0KGluZGV4KSB8fCB0aGlzLm1ldHJpY0RlZmluaXRpb24uZGVmYXVsdFxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVNZXRyaWNTdWJPcCh0aGlzLm5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBtZXRyaWNEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG5cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBUaGUgbWV0cmljIHdpdGggbmFtZSAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYW5kIGNhbid0IGJlIGRlbGV0ZWQuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBUaGUgc3RhdGljIE1ldHJpYyAke3RoaXMubmFtZX0gY2FuJ3QgYmUgZGVsZXRlZC5gKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZnJvbSByZXNvdXJjZSBkZWZpbml0aW9ucy5cbiAgICBwbGFuLmRlbGV0ZU1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcblxuICAgIGNvbnN0IHRhc2tJbmRleFRvRGVsZXRlZE1ldHJpY1ZhbHVlOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gTm93IGxvb2sgYXQgYWxsIFRhc2tzIGFuZCByZW1vdmUgYHRoaXMubmFtZWAgZnJvbSB0aGUgbWV0cmljIHdoaWxlIGFsc29cbiAgICAvLyBidWlsZGluZyB1cCB0aGUgaW5mbyBuZWVkZWQgZm9yIGEgcmV2ZXJ0LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpO1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWUuc2V0KGluZGV4LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICB0YXNrLmRlbGV0ZU1ldHJpYyh0aGlzLm5hbWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UobWV0cmljRGVmaW5pdGlvbiwgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWUpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKFxuICAgIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24sXG4gICAgbWV0cmljVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlTmFtZTogTWFwPG51bWJlciwgbnVtYmVyPlxuICApOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRNZXRyaWNTdWJPcChcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIG1ldHJpY0RlZmluaXRpb24sXG4gICAgICBtZXRyaWNWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VOYW1lXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG9sZE5hbWU6IHN0cmluZztcbiAgbmV3TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9sZE5hbWU6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5vbGROYW1lID0gb2xkTmFtZTtcbiAgICB0aGlzLm5ld05hbWUgPSBuZXdOYW1lO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5ld05hbWUpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld05hbWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgbWV0cmljLmApO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5vbGROYW1lKTtcbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5vbGROYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBTdGF0aWMgbWV0cmljICR7dGhpcy5vbGROYW1lfSBjYW4ndCBiZSByZW5hbWVkLmApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5ld05hbWUsIG1ldHJpY0RlZmluaXRpb24pO1xuICAgIHBsYW4uZGVsZXRlTWV0cmljRGVmaW5pdGlvbih0aGlzLm9sZE5hbWUpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCByZW5hbWUgdGhpcyBtZXRyaWMuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMub2xkTmFtZSkgfHwgbWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgICAgdGFzay5zZXRNZXRyaWModGhpcy5uZXdOYW1lLCB2YWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZU1ldHJpYyh0aGlzLm9sZE5hbWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZU1ldHJpY1N1Yk9wKHRoaXMubmV3TmFtZSwgdGhpcy5vbGROYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVXBkYXRlTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbjtcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbWV0cmljIGtleS5cbiAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24gPSBtZXRyaWNEZWZpbml0aW9uO1xuICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcyA9IHRhc2tNZXRyaWNWYWx1ZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBvbGRNZXRyaWNEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG4gICAgaWYgKG9sZE1ldHJpY0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG4gICAgaWYgKG9sZE1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBlcnJvcihgU3RhdGljIG1ldHJpYyAke3RoaXMubmFtZX0gY2FuJ3QgYmUgdXBkYXRlZC5gKTtcbiAgICB9XG5cbiAgICAvLyBSYXRpb25hbGl6ZSBkZWZhdWx0IHNob3VsZCBiZSBpbiBbbWluLCBtYXhdLlxuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0ID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLnJhbmdlLmNsYW1wKFxuICAgICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uLmRlZmF1bHRcbiAgICApO1xuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSwgdGhpcy5tZXRyaWNEZWZpbml0aW9uKTtcblxuICAgIGNvbnN0IHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCB1cGRhdGUgdGhlIG1ldHJpYyB2YWx1ZXMgdG8gcmVmbGVjdCB0aGUgbmV3XG4gICAgLy8gbWV0cmljIGRlZmluaXRpb24sIHVubGVzcyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrTWV0cmljVmFsdWVzLCBpblxuICAgIC8vIHdoaWNoIGNhc2Ugd2Ugd2lsbCB1c2UgdGhhdCB2YWx1ZSwgaS5lLiB0aGlzIFVwZGF0ZU1ldHJpY1N1Yk9wIGlzXG4gICAgLy8gYWN0dWFsbHkgYSByZXZlcnQgb2YgYW5vdGhlciBVcGRhdGVNZXRyaWNTdWJPcC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKSE7XG5cbiAgICAgIGxldCBuZXdWYWx1ZTogbnVtYmVyO1xuICAgICAgaWYgKHRoaXMudGFza01ldHJpY1ZhbHVlcy5oYXMoaW5kZXgpKSB7XG4gICAgICAgIC8vIHRhc2tNZXRyaWNWYWx1ZXMgaGFzIGEgdmFsdWUgdGhlbiB1c2UgdGhhdCwgYXMgdGhpcyBpcyBhbiBpbnZlcnNlXG4gICAgICAgIC8vIG9wZXJhdGlvbi5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuZ2V0KGluZGV4KSE7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBvbGRWYWx1ZSA9PT0gb2xkTWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0ICYmXG4gICAgICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbi5yYW5nZS5taW4gPD0gb2xkVmFsdWUgJiZcbiAgICAgICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uLnJhbmdlLm1heCA+IG9sZFZhbHVlXG4gICAgICApIHtcbiAgICAgICAgLy8gSWYgdGhlIG9sZFZhbHVlIGlzIHRoZSBkZWZhdWx0LCBjaGFuZ2UgaXQgdG8gdGhlIG5ldyBkZWZhdWx0LCBidXQgb25seSBpZiB0aGVcbiAgICAgICAgLy8gbmV3IGRlZmF1bHQgaXMgaW4gdGhlIHJhbmdlLlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgICAgICB0YXNrTWV0cmljVmFsdWVzLnNldChpbmRleCwgb2xkVmFsdWUpO1xuXG4gICAgICAgIC8vIFdoYXQgbWlnaHQgaGF2ZSBjaGFuZ2VkIGlzIHRoZSBtaW4gb3IgbWF4IG5ld1ZhbHVlLCB3aGljaCBtaWdodCBtYWtlXG4gICAgICAgIC8vIHRoZSBkZWZhdWx0IHZhbHVlIGludmFsaWQuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDbGFtcC5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24ucmFuZ2UuY2xhbXAob2xkVmFsdWUpO1xuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5wcmVjaXNpb24ucm91bmQobmV3VmFsdWUpO1xuICAgICAgICB0YXNrTWV0cmljVmFsdWVzLnNldChpbmRleCwgb2xkVmFsdWUpO1xuICAgICAgfVxuICAgICAgdGFzay5zZXRNZXRyaWModGhpcy5uYW1lLCBuZXdWYWx1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRNZXRyaWNEZWZpbml0aW9uLCB0YXNrTWV0cmljVmFsdWVzKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoXG4gICAgb2xkTWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFVwZGF0ZU1ldHJpY1N1Yk9wKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgb2xkTWV0cmljRGVmaW5pdGlvbixcbiAgICAgIHRhc2tNZXRyaWNWYWx1ZXNcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRNZXRyaWNWYWx1ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG4gIHZhbHVlOiBudW1iZXI7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgdmFsdWU6IG51bWJlciwgdGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG1ldHJpY3NEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG4gICAgaWYgKG1ldHJpY3NEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5hbWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgTWV0cmljYCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFzayA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdO1xuICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKSB8fCBtZXRyaWNzRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgIHRhc2suc2V0TWV0cmljKHRoaXMubmFtZSwgbWV0cmljc0RlZmluaXRpb24uY2xhbXBBbmRSb3VuZCh0aGlzLnZhbHVlKSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkVmFsdWUpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSh2YWx1ZTogbnVtYmVyKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0TWV0cmljVmFsdWVTdWJPcCh0aGlzLm5hbWUsIHZhbHVlLCB0aGlzLnRhc2tJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZE1ldHJpY09wKFxuICBuYW1lOiBzdHJpbmcsXG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb25cbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZE1ldHJpY1N1Yk9wKG5hbWUsIG1ldHJpY0RlZmluaXRpb24pXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVNZXRyaWNPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVNZXRyaWNTdWJPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lTWV0cmljT3Aob2xkTmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVNZXRyaWNTdWJPcChvbGROYW1lLCBuZXdOYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVXBkYXRlTWV0cmljT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvblxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgVXBkYXRlTWV0cmljU3ViT3AobmFtZSwgbWV0cmljRGVmaW5pdGlvbildKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldE1ldHJpY1ZhbHVlT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgdmFsdWU6IG51bWJlcixcbiAgdGFza0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AobmFtZSwgdmFsdWUsIHRhc2tJbmRleCldKTtcbn1cbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgZWRnZXNCeVNyY0FuZERzdFRvTWFwIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBDaGFydCwgVGFzaywgVGFza1N0YXRlIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBPcCwgU3ViT3AsIFN1Yk9wUmVzdWx0IH0gZnJvbSBcIi4vb3BzLnRzXCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wLCBTZXRNZXRyaWNWYWx1ZVN1Yk9wIH0gZnJvbSBcIi4vbWV0cmljcy50c1wiO1xuXG4vKiogQSB2YWx1ZSBvZiAtMSBmb3IgaiBtZWFucyB0aGUgRmluaXNoIE1pbGVzdG9uZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEaXJlY3RlZEVkZ2VGb3JQbGFuKFxuICBpOiBudW1iZXIsXG4gIGo6IG51bWJlcixcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PERpcmVjdGVkRWRnZT4ge1xuICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gIGlmIChqID09PSAtMSkge1xuICAgIGogPSBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICB9XG4gIGlmIChpIDwgMCB8fCBpID49IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBpIGluZGV4IG91dCBvZiByYW5nZTogJHtpfSBub3QgaW4gWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMX1dYFxuICAgICk7XG4gIH1cbiAgaWYgKGogPCAwIHx8IGogPj0gY2hhcnQuVmVydGljZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYGogaW5kZXggb3V0IG9mIHJhbmdlOiAke2p9IG5vdCBpbiBbMCwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxfV1gXG4gICAgKTtcbiAgfVxuICBpZiAoaSA9PT0gaikge1xuICAgIHJldHVybiBlcnJvcihgQSBUYXNrIGNhbiBub3QgZGVwZW5kIG9uIGl0c2VsZjogJHtpfSA9PT0gJHtqfWApO1xuICB9XG4gIHJldHVybiBvayhuZXcgRGlyZWN0ZWRFZGdlKGksIGopKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZEVkZ2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmICh0aGlzLmkgPT09IC0xKSB7XG4gICAgICB0aGlzLmkgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuICAgIGlmICh0aGlzLmogPT09IC0xKSB7XG4gICAgICB0aGlzLmogPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuXG4gICAgY29uc3QgZSA9IERpcmVjdGVkRWRnZUZvclBsYW4odGhpcy5pLCB0aGlzLmosIHBsYW4pO1xuICAgIGlmICghZS5vaykge1xuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuXG4gICAgLy8gT25seSBhZGQgdGhlIGVkZ2UgaWYgaXQgZG9lc24ndCBleGlzdHMgYWxyZWFkeS5cbiAgICBpZiAoIXBsYW4uY2hhcnQuRWRnZXMuZmluZCgodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gdmFsdWUuZXF1YWwoZS52YWx1ZSkpKSB7XG4gICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2goZS52YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVtb3ZlRWRnZVN1cE9wKHRoaXMuaSwgdGhpcy5qKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVtb3ZlRWRnZVN1cE9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpOiBudW1iZXIgPSAwO1xuICBqOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGk6IG51bWJlciwgajogbnVtYmVyKSB7XG4gICAgdGhpcy5pID0gaTtcbiAgICB0aGlzLmogPSBqO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHRoaXMuaSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaSA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaiA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaiA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG5cbiAgICBjb25zdCBlID0gRGlyZWN0ZWRFZGdlRm9yUGxhbih0aGlzLmksIHRoaXMuaiwgcGxhbik7XG4gICAgaWYgKCFlLm9rKSB7XG4gICAgICByZXR1cm4gZTtcbiAgICB9XG4gICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgKHY6IERpcmVjdGVkRWRnZSk6IGJvb2xlYW4gPT4gIXYuZXF1YWwoZS52YWx1ZSlcbiAgICApO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkRWRnZVN1Yk9wKHRoaXMuaSwgdGhpcy5qKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyhpbmRleDogbnVtYmVyLCBjaGFydDogQ2hhcnQpOiBSZXN1bHQ8bnVsbD4ge1xuICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID4gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMikge1xuICAgIHJldHVybiBlcnJvcihgJHtpbmRleH0gaXMgbm90IGluIHJhbmdlIFswLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDJ9XWApO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn1cblxuZnVuY3Rpb24gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUoXG4gIGluZGV4OiBudW1iZXIsXG4gIGNoYXJ0OiBDaGFydFxuKTogUmVzdWx0PG51bGw+IHtcbiAgaWYgKGluZGV4IDwgMSB8fCBpbmRleCA+IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDIpIHtcbiAgICByZXR1cm4gZXJyb3IoYCR7aW5kZXh9IGlzIG5vdCBpbiByYW5nZSBbMSwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyfV1gKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRUYXNrQWZ0ZXJTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG4gIGZ1bGxUYXNrVG9CZVJlc3RvcmVkOiBGdWxsVGFza1RvQmVSZXN0b3JlZCB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgaW5kZXg6IG51bWJlcixcbiAgICBmdWxsVGFza1RvQmVSZXN0b3JlZDogRnVsbFRhc2tUb0JlUmVzdG9yZWQgfCBudWxsID0gbnVsbFxuICApIHtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5mdWxsVGFza1RvQmVSZXN0b3JlZCA9IGZ1bGxUYXNrVG9CZVJlc3RvcmVkO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgbGV0IHRhc2sgPSBwbGFuLm5ld1Rhc2soKTtcbiAgICBpZiAodGhpcy5mdWxsVGFza1RvQmVSZXN0b3JlZCAhPT0gbnVsbCkge1xuICAgICAgdGFzayA9IHRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQudGFzaztcbiAgICB9XG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5zcGxpY2UodGhpcy5pbmRleCArIDEsIDAsIHRhc2spO1xuXG4gICAgLy8gVXBkYXRlIEVkZ2VzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgIGlmIChlZGdlLmkgPj0gdGhpcy5pbmRleCArIDEpIHtcbiAgICAgICAgZWRnZS5pKys7XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID49IHRoaXMuaW5kZXggKyAxKSB7XG4gICAgICAgIGVkZ2UuaisrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmZ1bGxUYXNrVG9CZVJlc3RvcmVkICE9PSBudWxsKSB7XG4gICAgICBjaGFydC5FZGdlcy5wdXNoKC4uLnRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQuZWRnZXMpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVUYXNrU3ViT3AodGhpcy5pbmRleCArIDEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXBUYXNrU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUodGhpcy5pbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGNvbnN0IGNvcHkgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMuaW5kZXhdLmR1cCgpO1xuICAgIC8vIEluc2VydCB0aGUgZHVwbGljYXRlIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBUYXNrIGl0IGlzIGNvcGllZCBmcm9tLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXgsIDAsIGNvcHkpO1xuXG4gICAgLy8gVXBkYXRlIEVkZ2VzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgIGlmIChlZGdlLmkgPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaSsrO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5qKys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVUYXNrU3ViT3AodGhpcy5pbmRleCArIDEpO1xuICB9XG59XG5cbnR5cGUgU3Vic3RpdHV0aW9uID0gTWFwPERpcmVjdGVkRWRnZSwgRGlyZWN0ZWRFZGdlPjtcblxuZXhwb3J0IGNsYXNzIE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGZyb21UYXNrSW5kZXg6IG51bWJlciA9IDA7XG4gIHRvVGFza0luZGV4OiBudW1iZXIgPSAwO1xuICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGZyb21UYXNrSW5kZXg6IG51bWJlcixcbiAgICB0b1Rhc2tJbmRleDogbnVtYmVyLFxuICAgIGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb24gPSBuZXcgTWFwKClcbiAgKSB7XG4gICAgdGhpcy5mcm9tVGFza0luZGV4ID0gZnJvbVRhc2tJbmRleDtcbiAgICB0aGlzLnRvVGFza0luZGV4ID0gdG9UYXNrSW5kZXg7XG4gICAgdGhpcy5hY3R1YWxNb3ZlcyA9IGFjdHVhbE1vdmVzO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGxldCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLmZyb21UYXNrSW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUodGhpcy50b1Rhc2tJbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmFjdHVhbE1vdmVzLnZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnN0IGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb24gPSBuZXcgTWFwKCk7XG4gICAgICAvLyBVcGRhdGUgYWxsIEVkZ2VzIHRoYXQgc3RhcnQgYXQgJ2Zyb21UYXNrSW5kZXgnIGFuZCBjaGFuZ2UgdGhlIHN0YXJ0IHRvICd0b1Rhc2tJbmRleCcuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgICAgLy8gU2tpcCB0aGUgY29ybmVyIGNhc2UgdGhlcmUgZnJvbVRhc2tJbmRleCBwb2ludHMgdG8gVGFza0luZGV4LlxuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21UYXNrSW5kZXggJiYgZWRnZS5qID09PSB0aGlzLnRvVGFza0luZGV4KSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21UYXNrSW5kZXgpIHtcbiAgICAgICAgICBhY3R1YWxNb3Zlcy5zZXQoXG4gICAgICAgICAgICBuZXcgRGlyZWN0ZWRFZGdlKHRoaXMudG9UYXNrSW5kZXgsIGVkZ2UuaiksXG4gICAgICAgICAgICBuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgZWRnZS5qKVxuICAgICAgICAgICk7XG4gICAgICAgICAgZWRnZS5pID0gdGhpcy50b1Rhc2tJbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9rKHtcbiAgICAgICAgcGxhbjogcGxhbixcbiAgICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKFxuICAgICAgICAgIHRoaXMudG9UYXNrSW5kZXgsXG4gICAgICAgICAgdGhpcy5mcm9tVGFza0luZGV4LFxuICAgICAgICAgIGFjdHVhbE1vdmVzXG4gICAgICAgICksXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBuZXdFZGdlID0gdGhpcy5hY3R1YWxNb3Zlcy5nZXQocGxhbi5jaGFydC5FZGdlc1tpXSk7XG4gICAgICAgIGlmIChuZXdFZGdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzW2ldID0gbmV3RWRnZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2soe1xuICAgICAgICBwbGFuOiBwbGFuLFxuICAgICAgICBpbnZlcnNlOiBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcChcbiAgICAgICAgICB0aGlzLnRvVGFza0luZGV4LFxuICAgICAgICAgIHRoaXMuZnJvbVRhc2tJbmRleFxuICAgICAgICApLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaW52ZXJzZShcbiAgICB0b1Rhc2tJbmRleDogbnVtYmVyLFxuICAgIGZyb21UYXNrSW5kZXg6IG51bWJlcixcbiAgICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uXG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AoXG4gICAgICB0b1Rhc2tJbmRleCxcbiAgICAgIGZyb21UYXNrSW5kZXgsXG4gICAgICBhY3R1YWxNb3Zlc1xuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvcHlBbGxFZGdlc0Zyb21Ub1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBmcm9tSW5kZXg6IG51bWJlciA9IDA7XG4gIHRvSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoZnJvbUluZGV4OiBudW1iZXIsIHRvSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuZnJvbUluZGV4ID0gZnJvbUluZGV4O1xuICAgIHRoaXMudG9JbmRleCA9IHRvSW5kZXg7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmZyb21JbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3RWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgcGxhbi5jaGFydC5FZGdlcy5mb3JFYWNoKChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbUluZGV4KSB7XG4gICAgICAgIG5ld0VkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZSh0aGlzLnRvSW5kZXgsIGVkZ2UuaikpO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA9PT0gdGhpcy5mcm9tSW5kZXgpIHtcbiAgICAgICAgbmV3RWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgdGhpcy50b0luZGV4KSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLm5ld0VkZ2VzKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBSZW1vdmVBbGxFZGdlc1N1Yk9wKG5ld0VkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVtb3ZlQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgIChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+XG4gICAgICAgIC0xID09PVxuICAgICAgICB0aGlzLmVkZ2VzLmZpbmRJbmRleCgodG9CZVJlbW92ZWQ6IERpcmVjdGVkRWRnZSkgPT5cbiAgICAgICAgICBlZGdlLmVxdWFsKHRvQmVSZW1vdmVkKVxuICAgICAgICApXG4gICAgKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBBZGRBbGxFZGdlc1N1Yk9wKHRoaXMuZWRnZXMpIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRBbGxFZGdlc1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBlZGdlczogRGlyZWN0ZWRFZGdlW107XG5cbiAgY29uc3RydWN0b3IoZWRnZXM6IERpcmVjdGVkRWRnZVtdKSB7XG4gICAgdGhpcy5lZGdlcyA9IGVkZ2VzO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLnRoaXMuZWRnZXMpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogbmV3IFJlbW92ZUFsbEVkZ2VzU3ViT3AodGhpcy5lZGdlcykgfSk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIEZ1bGxUYXNrVG9CZVJlc3RvcmVkIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuICB0YXNrOiBUYXNrO1xufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlVGFza1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjb25zdCBlZGdlc1RvQmVSZXN0b3JlZCA9IGNoYXJ0LkVkZ2VzLmZpbHRlcigoZGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgaWYgKGRlLmkgPT09IHRoaXMuaW5kZXggfHwgZGUuaiA9PT0gdGhpcy5pbmRleCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgIC8vIEZpcnN0IHJlbW92ZSBhbGwgZWRnZXMgdG8gYW5kIGZyb20gdGhlIHRhc2suXG4gICAgY2hhcnQuRWRnZXMgPSBjaGFydC5FZGdlcy5maWx0ZXIoKGRlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChkZS5pID09PSB0aGlzLmluZGV4IHx8IGRlLmogPT09IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgZWRnZXMgZm9yIHRhc2tzIHRoYXQgd2lsbCBlbmQgdXAgYXQgYSBuZXcgaW5kZXguXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5pLS07XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmotLTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YXNrVG9CZVJlc3RvcmVkID0gY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXgsIDEpO1xuICAgIGNvbnN0IGZ1bGxUYXNrVG9CZVJlc3RvcmVkID0ge1xuICAgICAgZWRnZXM6IGVkZ2VzVG9CZVJlc3RvcmVkLFxuICAgICAgdGFzazogdGFza1RvQmVSZXN0b3JlZFswXSxcbiAgICB9O1xuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZShmdWxsVGFza1RvQmVSZXN0b3JlZCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKGZ1bGxUYXNrVG9CZVJlc3RvcmVkOiBGdWxsVGFza1RvQmVSZXN0b3JlZCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFRhc2tBZnRlclN1Yk9wKHRoaXMuaW5kZXggLSAxLCBmdWxsVGFza1RvQmVSZXN0b3JlZCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJhdGlvbmFsaXplRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHNyY0FuZERzdCA9IGVkZ2VzQnlTcmNBbmREc3RUb01hcChwbGFuLmNoYXJ0LkVkZ2VzKTtcbiAgICBjb25zdCBTdGFydCA9IDA7XG4gICAgY29uc3QgRmluaXNoID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuXG4gICAgLy8gbG9vcCBvdmVyIGFsbCB2ZXJ0aWNzIGZyb20gW1N0YXJ0LCBGaW5pc2gpIGFuZCBsb29rIGZvciB0aGVpclxuICAgIC8vIGRlc3RpbmF0aW9ucy4gSWYgdGhleSBoYXZlIG5vbmUgdGhlbiBhZGQgaW4gYW4gZWRnZSB0byBGaW5pc2guIElmIHRoZXlcbiAgICAvLyBoYXZlIG1vcmUgdGhhbiBvbmUgdGhlbiByZW1vdmUgYW55IGxpbmtzIHRvIEZpbmlzaC5cbiAgICBmb3IgKGxldCBpID0gU3RhcnQ7IGkgPCBGaW5pc2g7IGkrKykge1xuICAgICAgY29uc3QgZGVzdGluYXRpb25zID0gc3JjQW5kRHN0LmJ5U3JjLmdldChpKTtcbiAgICAgIGlmIChkZXN0aW5hdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB0b0JlQWRkZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKGksIEZpbmlzaCk7XG4gICAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCh0b0JlQWRkZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXJlIHRoZXJlIGFueSB1bmVlZGVkIEVnZGVzIHRvIEZpbmlzaD8gSWYgc28gZmlsdGVyIHRoZW0gb3V0LlxuICAgICAgICBpZiAoXG4gICAgICAgICAgZGVzdGluYXRpb25zLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICBkZXN0aW5hdGlvbnMuZmluZCgodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gdmFsdWUuaiA9PT0gRmluaXNoKVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCB0b0JlUmVtb3ZlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoaSwgRmluaXNoKTtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAgICAgICAodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gIXRvQmVSZW1vdmVkLmVxdWFsKHZhbHVlKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBsb29wIG92ZXIgYWxsIHZlcnRpY3MgZnJvbShTdGFydCwgRmluaXNoXSBhbmQgbG9vayBmb3IgdGhlaXIgc291cmNlcy4gSWZcbiAgICAvLyB0aGV5IGhhdmUgbm9uZSB0aGVuIGFkZCBpbiBhbiBlZGdlIGZyb20gU3RhcnQuIElmIHRoZXkgaGF2ZSBtb3JlIHRoYW4gb25lXG4gICAgLy8gdGhlbiByZW1vdmUgYW55IGxpbmtzIGZyb20gU3RhcnQuXG4gICAgZm9yIChsZXQgaSA9IFN0YXJ0ICsgMTsgaSA8IEZpbmlzaDsgaSsrKSB7XG4gICAgICBjb25zdCBkZXN0aW5hdGlvbnMgPSBzcmNBbmREc3QuYnlEc3QuZ2V0KGkpO1xuICAgICAgaWYgKGRlc3RpbmF0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHRvQmVBZGRlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIGkpO1xuICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2godG9CZUFkZGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFyZSB0aGVyZSBhbnkgdW4tbmVlZGVkIEVnZGVzIGZyb20gU3RhcnQ/IElmIHNvIGZpbHRlciB0aGVtIG91dC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgZGVzdGluYXRpb25zLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmkgPT09IFN0YXJ0KVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCB0b0JlUmVtb3ZlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIGkpO1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgICAgICAgICh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiAhdG9CZVJlbW92ZWQuZXF1YWwodmFsdWUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAocGxhbi5jaGFydC5FZGdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBGaW5pc2gpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFRhc2tOYW1lU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuICBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IodGFza0luZGV4OiBudW1iZXIsIG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLnRhc2tJbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGNvbnN0IG9sZE5hbWUgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5uYW1lO1xuICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkTmFtZSksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKG9sZE5hbWU6IHN0cmluZyk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFRhc2tOYW1lU3ViT3AodGhpcy50YXNrSW5kZXgsIG9sZE5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRUYXNrU3RhdGVTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgdGFza1N0YXRlOiBUYXNrU3RhdGU7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHRhc2tJbmRleDogbnVtYmVyLCB0YXNrU3RhdGU6IFRhc2tTdGF0ZSkge1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICAgIHRoaXMudGFza1N0YXRlID0gdGFza1N0YXRlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy50YXNrSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBjb25zdCBvbGRTdGF0ZSA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLnN0YXRlO1xuICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLnN0YXRlID0gdGhpcy50YXNrU3RhdGU7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkU3RhdGUpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZSh0YXNrU3RhdGU6IFRhc2tTdGF0ZSk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFRhc2tTdGF0ZVN1Yk9wKHRoaXMudGFza0luZGV4LCB0YXNrU3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbnNlcnROZXdFbXB0eU1pbGVzdG9uZUFmdGVyT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgQWRkVGFza0FmdGVyU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKDAsIHRhc2tJbmRleCArIDEpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AodGFza0luZGV4ICsgMSwgLTEpLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRUYXNrTmFtZU9wKHRhc2tJbmRleDogbnVtYmVyLCBuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRUYXNrTmFtZVN1Yk9wKHRhc2tJbmRleCwgbmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldFRhc2tTdGF0ZU9wKHRhc2tJbmRleDogbnVtYmVyLCB0YXNrU3RhdGU6IFRhc2tTdGF0ZSk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldFRhc2tTdGF0ZVN1Yk9wKHRhc2tJbmRleCwgdGFza1N0YXRlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU3BsaXRUYXNrT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIGNvbnN0IHN1Yk9wczogU3ViT3BbXSA9IFtcbiAgICBuZXcgRHVwVGFza1N1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCh0YXNrSW5kZXgsIHRhc2tJbmRleCArIDEpLFxuICAgIG5ldyBNb3ZlQWxsT3V0Z29pbmdFZGdlc0Zyb21Ub1N1Yk9wKHRhc2tJbmRleCwgdGFza0luZGV4ICsgMSksXG4gIF07XG5cbiAgcmV0dXJuIG5ldyBPcChzdWJPcHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRHVwVGFza09wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICBjb25zdCBzdWJPcHM6IFN1Yk9wW10gPSBbXG4gICAgbmV3IER1cFRhc2tTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBDb3B5QWxsRWRnZXNGcm9tVG9TdWJPcCh0YXNrSW5kZXgsIHRhc2tJbmRleCArIDEpLFxuICBdO1xuXG4gIHJldHVybiBuZXcgT3Aoc3ViT3BzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZVRhc2tPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICAgIG5ldyBEZWxldGVUYXNrU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkRWRnZU9wKGZyb21UYXNrSW5kZXg6IG51bWJlciwgdG9UYXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AoZnJvbVRhc2tJbmRleCwgdG9UYXNrSW5kZXgpLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSYXRpb25hbGl6ZUVkZ2VzT3AoKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlbW92ZUVkZ2VPcChpOiBudW1iZXIsIGo6IG51bWJlcik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICAgIG5ldyBSZW1vdmVFZGdlU3VwT3AoaSwgaiksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgQWRkVGFza0FmdGVyU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgU2V0TWV0cmljVmFsdWVTdWJPcChcIkR1cmF0aW9uXCIsIDEwLCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKDAsIHRhc2tJbmRleCArIDEpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AodGFza0luZGV4ICsgMSwgLTEpLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG4iLCAiaW1wb3J0IHsgQWRkRGVwZW5kZW5jeURpYWxvZyB9IGZyb20gXCIuLi8uLi9hZGQtZGVwZW5kZW5jeS1kaWFsb2cvYWRkLWRlcGVuZGVuY3ktZGlhbG9nXCI7XG5pbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgQWRkRWRnZU9wIH0gZnJvbSBcIi4uLy4uL29wcy9jaGFydFwiO1xuaW1wb3J0IHsgZXJyb3IsIG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIEFjdGlvbkZyb21PcCwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIEFkZFByZWRlY2Vzc29yQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9XG4gICAgXCJQcm9tcHRzIGZvciBhbmQgYWRkcyBhIHByZWRlY2Vzc29yIHRvIHRoZSBjdXJyZW50IFRhc2suXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IHRydWU7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBpZiAoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2sgPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiQSBUYXNrIG11c3QgYmUgc2VsZWN0ZWQuXCIpKTtcbiAgICB9XG4gICAgY29uc3QgcHJlZFRhc2tJbmRleCA9IGF3YWl0IGV4cGxhbk1haW5cbiAgICAgIC5xdWVyeVNlbGVjdG9yPEFkZERlcGVuZGVuY3lEaWFsb2c+KFwiYWRkLWRlcGVuZGVuY3ktZGlhbG9nXCIpIVxuICAgICAgLnNlbGVjdERlcGVuZGVuY3koZXhwbGFuTWFpbi5wbGFuLmNoYXJ0LCBleHBsYW5NYWluLnNlbGVjdGVkVGFzaywgXCJwcmVkXCIpO1xuICAgIGlmIChwcmVkVGFza0luZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoXCJObyBwcmVkZWNlc3NvciB3YXMgc2VsZWN0ZWQuXCIpKTtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gQWRkRWRnZU9wKHByZWRUYXNrSW5kZXgsIGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrKS5hcHBseVRvKFxuICAgICAgZXhwbGFuTWFpbi5wbGFuXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0dXJuIG9rKFxuICAgICAgbmV3IEFjdGlvbkZyb21PcChcbiAgICAgICAgcmV0LnZhbHVlLmludmVyc2UsXG4gICAgICAgICh0aGlzLnBvc3RBY3Rpb25Xb3JrID0gdGhpcy5wb3N0QWN0aW9uV29yayksXG4gICAgICAgIHRydWVcbiAgICAgIClcbiAgICApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQWRkRGVwZW5kZW5jeURpYWxvZyB9IGZyb20gXCIuLi8uLi9hZGQtZGVwZW5kZW5jeS1kaWFsb2cvYWRkLWRlcGVuZGVuY3ktZGlhbG9nXCI7XG5pbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgQWRkRWRnZU9wIH0gZnJvbSBcIi4uLy4uL29wcy9jaGFydFwiO1xuaW1wb3J0IHsgZXJyb3IsIG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIEFjdGlvbkZyb21PcCwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIEFkZFN1Y2Nlc3NvckFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIlByb21wdHMgZm9yIGFuZCBhZGRzIGEgc3VjY2Vzc29yIHRvIHRoZSBjdXJyZW50IFRhc2suXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IHRydWU7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBpZiAoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2sgPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiQSBUYXNrIG11c3QgYmUgc2VsZWN0ZWQuXCIpKTtcbiAgICB9XG4gICAgY29uc3Qgc3VjY1Rhc2tJbmRleCA9IGF3YWl0IGV4cGxhbk1haW5cbiAgICAgIC5xdWVyeVNlbGVjdG9yPEFkZERlcGVuZGVuY3lEaWFsb2c+KFwiYWRkLWRlcGVuZGVuY3ktZGlhbG9nXCIpIVxuICAgICAgLnNlbGVjdERlcGVuZGVuY3koZXhwbGFuTWFpbi5wbGFuLmNoYXJ0LCBleHBsYW5NYWluLnNlbGVjdGVkVGFzaywgXCJzdWNjXCIpO1xuICAgIGlmIChzdWNjVGFza0luZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoXCJObyBzdWNjZXNzb3Igd2FzIHNlbGVjdGVkLlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IEFkZEVkZ2VPcChleHBsYW5NYWluLnNlbGVjdGVkVGFzaywgc3VjY1Rhc2tJbmRleCkuYXBwbHlUbyhcbiAgICAgIGV4cGxhbk1haW4ucGxhblxuICAgICk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AoXG4gICAgICAgIHJldC52YWx1ZS5pbnZlcnNlLFxuICAgICAgICAodGhpcy5wb3N0QWN0aW9uV29yayA9IHRoaXMucG9zdEFjdGlvbldvcmspLFxuICAgICAgICB0cnVlXG4gICAgICApXG4gICAgKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgU2VhcmNoVGFza1BhbmVsIH0gZnJvbSBcIi4uLy4uL3NlYXJjaC9zZWFyY2gtdGFzay1wYW5lbFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgR29Ub1NlYXJjaEFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIk1vdmVzIGZvY3VzIHRvIHNlYXJjaCBjb250cm9sLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhfZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3I8U2VhcmNoVGFza1BhbmVsPihcInNlYXJjaC10YXNrLXBhbmVsXCIpIVxuICAgICAgLnNldEtleWJvYXJkRm9jdXNUb0lucHV0KFwibmFtZS1vbmx5XCIpO1xuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgR29Ub0Z1bGxTZWFyY2hBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID1cbiAgICBcIk1vdmVzIGZvY3VzIHRvIHNlYXJjaCBjb250cm9sIGFuZCBkb2VzIGEgZnVsbCBzZWFyY2ggb2YgYWxsIHJlc291cmNlIHZhbHVlcy5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oX2V4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yPFNlYXJjaFRhc2tQYW5lbD4oXCJzZWFyY2gtdGFzay1wYW5lbFwiKSFcbiAgICAgIC5zZXRLZXlib2FyZEZvY3VzVG9JbnB1dChcImZ1bGwtaW5mb1wiKTtcbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIEhlbHBBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJEaXNwbGF5cyB0aGUgaGVscCBkaWFsb2cuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgZXhwbGFuTWFpblxuICAgICAgLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwia2V5Ym9hcmQtbWFwLWRpYWxvZ1wiKSFcbiAgICAgIC5zaG93TW9kYWwoKTtcbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIFJlc2V0Wm9vbUFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIlVuZG9lcyB0aGUgem9vbS5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBhaW50Q2hhcnRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgZXhwbGFuTWFpbi5kaXNwbGF5UmFuZ2UgPSBudWxsO1xuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQge1xuICBEZWxldGVUYXNrT3AsXG4gIER1cFRhc2tPcCxcbiAgSW5zZXJ0TmV3RW1wdHlNaWxlc3RvbmVBZnRlck9wLFxuICBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wLFxuICBTcGxpdFRhc2tPcCxcbn0gZnJvbSBcIi4uLy4uL29wcy9jaGFydFwiO1xuaW1wb3J0IHsgU2V0TWV0cmljVmFsdWVPcCB9IGZyb20gXCIuLi8uLi9vcHMvbWV0cmljc1wiO1xuaW1wb3J0IHsgZXJyb3IsIG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIEFjdGlvbkZyb21PcCwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIFNwbGl0VGFza0FjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIlNwbGl0cyBhIHRhc2suXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IHRydWU7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBpZiAoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2sgPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiQSB0YXNrIG11c3QgYmUgc2VsZWN0ZWQgZmlyc3QuXCIpKTtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gU3BsaXRUYXNrT3AoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2spLmFwcGx5VG8oZXhwbGFuTWFpbi5wbGFuKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0dXJuIG9rKFxuICAgICAgbmV3IEFjdGlvbkZyb21PcChyZXQudmFsdWUuaW52ZXJzZSwgdGhpcy5wb3N0QWN0aW9uV29yaywgdGhpcy51bmRvKVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIER1cFRhc2tBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJEdXBsaWNhdGVzIGEgdGFzay5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuICB1bmRvOiBib29sZWFuID0gdHJ1ZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGlmIChleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoXCJBIHRhc2sgbXVzdCBiZSBzZWxlY3RlZCBmaXJzdC5cIikpO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBEdXBUYXNrT3AoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2spLmFwcGx5VG8oZXhwbGFuTWFpbi5wbGFuKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0dXJuIG9rKFxuICAgICAgbmV3IEFjdGlvbkZyb21PcChyZXQudmFsdWUuaW52ZXJzZSwgdGhpcy5wb3N0QWN0aW9uV29yaywgdGhpcy51bmRvKVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE5ld1Rhc2tBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJDcmVhdGVzIGEgbmV3IHRhc2suXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IHRydWU7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBsZXQgcmV0ID0gSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCgwKS5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVUYXNrQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiRGVsZXRlcyBhIHRhc2suXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IHRydWU7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBpZiAoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2sgPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiQSB0YXNrIG11c3QgYmUgc2VsZWN0ZWQgZmlyc3QuXCIpKTtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gRGVsZXRlVGFza09wKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrKS5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID0gLTE7XG4gICAgcmV0dXJuIG9rKFxuICAgICAgbmV3IEFjdGlvbkZyb21PcChyZXQudmFsdWUuaW52ZXJzZSwgdGhpcy5wb3N0QWN0aW9uV29yaywgdGhpcy51bmRvKVxuICAgICk7XG4gIH1cbn1cbiIsICJjb25zdCBkYXJrTW9kZUxvY2FsU3RvcmFnZUtleSA9IFwiZXhwbGFuLWRhcmttb2RlXCI7XG5cbi8qKiBXaGVuIHRoZSBnaXZlbiBlbGVtZW50IGlzIGNsaWNrZWQsIHRoZW4gdG9nZ2xlIHRoZSBgZGFya21vZGVgIGNsYXNzIG9uIHRoZVxuICogYm9keSBlbGVtZW50LiAqL1xuZXhwb3J0IGNvbnN0IHRvZ2dsZVRoZW1lID0gKCkgPT4ge1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgZGFya01vZGVMb2NhbFN0b3JhZ2VLZXksXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKFwiZGFya21vZGVcIikgPyBcIjFcIiA6IFwiMFwiXG4gICk7XG59O1xuXG5leHBvcnQgY29uc3QgYXBwbHlTdG9yZWRUaGVtZSA9ICgpID0+IHtcbiAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKFxuICAgIFwiZGFya21vZGVcIixcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oZGFya01vZGVMb2NhbFN0b3JhZ2VLZXkpID09PSBcIjFcIlxuICApO1xufTtcbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IHRvZ2dsZVRoZW1lIH0gZnJvbSBcIi4uLy4uL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlclwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgVG9nZ2xlRGFya01vZGVBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJUb2dnbGVzIGRhcmsgbW9kZS5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBhaW50Q2hhcnRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICB0b2dnbGVUaGVtZSgpO1xuICAgIC8vIFRvZ2dsZURhcmtNb2RlQWN0aW9uIGlzIGl0cyBvd24gaW52ZXJzZS5cbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIFRvZ2dsZUZvY3VzQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiVG9nZ2xlcyB0aGUgZm9jdXMgdmlldy5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBhaW50Q2hhcnRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgZXhwbGFuTWFpbi50b2dnbGVGb2N1c09uVGFzaygpO1xuICAgIC8vIFRvZ2dsZUZvY3VzQWN0aW9uIGlzIGl0cyBvd24gaW52ZXJzZS5cbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IHRvZ2dsZVRoZW1lIH0gZnJvbSBcIi4uLy4uL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlclwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgVG9nZ2xlUmFkYXJBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJUb2dnbGVzIHRoZSByYWRhciB2aWV3LlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGV4cGxhbk1haW4udG9nZ2xlUmFkYXIoKTtcbiAgICAvLyBUb2dnbGVSYWRhckFjdGlvbiBpcyBpdHMgb3duIGludmVyc2UuXG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIE5PT1BBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5pbXBvcnQgeyB1bmRvIH0gZnJvbSBcIi4uL2V4ZWN1dGVcIjtcblxuZXhwb3J0IGNsYXNzIFVuZG9BY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJVbmRvZXMgdGhlIGxhc3QgYWN0aW9uLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGNvbnN0IHJldCA9IHVuZG8oZXhwbGFuTWFpbik7XG5cbiAgICAvLyBVbmRvIGlzIG5vdCBhIHJldmVyc2libGUgYWN0aW9uLlxuICAgIHJldHVybiBvayhuZXcgTk9PUEFjdGlvbigpKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbi50c1wiO1xuaW1wb3J0IHsgQWRkUHJlZGVjZXNzb3JBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL2FkZFByZWRlY2Vzc29yLnRzXCI7XG5pbXBvcnQgeyBBZGRTdWNjZXNzb3JBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL2FkZFN1Y2Nlc3Nvci50c1wiO1xuaW1wb3J0IHtcbiAgR29Ub0Z1bGxTZWFyY2hBY3Rpb24sXG4gIEdvVG9TZWFyY2hBY3Rpb24sXG59IGZyb20gXCIuL2FjdGlvbnMvZ290b1NlYXJjaC50c1wiO1xuaW1wb3J0IHsgSGVscEFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvaGVscC50c1wiO1xuaW1wb3J0IHsgUmVzZXRab29tQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy9yZXNldFpvb20udHNcIjtcbmltcG9ydCB7XG4gIERlbGV0ZVRhc2tBY3Rpb24sXG4gIER1cFRhc2tBY3Rpb24sXG4gIE5ld1Rhc2tBY3Rpb24sXG4gIFNwbGl0VGFza0FjdGlvbixcbn0gZnJvbSBcIi4vYWN0aW9ucy90YXNrcy50c1wiO1xuaW1wb3J0IHsgVG9nZ2xlRGFya01vZGVBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3RvZ2dsZURhcmtNb2RlLnRzXCI7XG5pbXBvcnQgeyBUb2dnbGVGb2N1c0FjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvdG9nZ2xlRm9jdXMudHNcIjtcbmltcG9ydCB7IFRvZ2dsZVJhZGFyQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy90b2dnbGVSYWRhci50c1wiO1xuaW1wb3J0IHsgVW5kb0FjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvdW5kby50c1wiO1xuXG5leHBvcnQgdHlwZSBBY3Rpb25OYW1lcyA9XG4gIHwgXCJUb2dnbGVEYXJrTW9kZUFjdGlvblwiXG4gIHwgXCJUb2dnbGVSYWRhckFjdGlvblwiXG4gIHwgXCJSZXNldFpvb21BY3Rpb25cIlxuICB8IFwiVW5kb0FjdGlvblwiXG4gIHwgXCJIZWxwQWN0aW9uXCJcbiAgfCBcIlNwbGl0VGFza0FjdGlvblwiXG4gIHwgXCJEdXBUYXNrQWN0aW9uXCJcbiAgfCBcIk5ld1Rhc2tBY3Rpb25cIlxuICB8IFwiRGVsZXRlVGFza0FjdGlvblwiXG4gIHwgXCJHb1RvU2VhcmNoQWN0aW9uXCJcbiAgfCBcIkdvVG9GdWxsU2VhcmNoQWN0aW9uXCJcbiAgfCBcIkFkZFByZWRlY2Vzc29yQWN0aW9uXCJcbiAgfCBcIkFkZFN1Y2Nlc3NvckFjdGlvblwiXG4gIHwgXCJUb2dnbGVGb2N1c0FjdGlvblwiO1xuXG5leHBvcnQgY29uc3QgQWN0aW9uUmVnaXN0cnk6IFJlY29yZDxBY3Rpb25OYW1lcywgQWN0aW9uPiA9IHtcbiAgVG9nZ2xlRGFya01vZGVBY3Rpb246IG5ldyBUb2dnbGVEYXJrTW9kZUFjdGlvbigpLFxuICBUb2dnbGVSYWRhckFjdGlvbjogbmV3IFRvZ2dsZVJhZGFyQWN0aW9uKCksXG4gIFJlc2V0Wm9vbUFjdGlvbjogbmV3IFJlc2V0Wm9vbUFjdGlvbigpLFxuICBVbmRvQWN0aW9uOiBuZXcgVW5kb0FjdGlvbigpLFxuICBIZWxwQWN0aW9uOiBuZXcgSGVscEFjdGlvbigpLFxuICBTcGxpdFRhc2tBY3Rpb246IG5ldyBTcGxpdFRhc2tBY3Rpb24oKSxcbiAgRHVwVGFza0FjdGlvbjogbmV3IER1cFRhc2tBY3Rpb24oKSxcbiAgTmV3VGFza0FjdGlvbjogbmV3IE5ld1Rhc2tBY3Rpb24oKSxcbiAgRGVsZXRlVGFza0FjdGlvbjogbmV3IERlbGV0ZVRhc2tBY3Rpb24oKSxcbiAgR29Ub1NlYXJjaEFjdGlvbjogbmV3IEdvVG9TZWFyY2hBY3Rpb24oKSxcbiAgR29Ub0Z1bGxTZWFyY2hBY3Rpb246IG5ldyBHb1RvRnVsbFNlYXJjaEFjdGlvbigpLFxuICBBZGRQcmVkZWNlc3NvckFjdGlvbjogbmV3IEFkZFByZWRlY2Vzc29yQWN0aW9uKCksXG4gIEFkZFN1Y2Nlc3NvckFjdGlvbjogbmV3IEFkZFN1Y2Nlc3NvckFjdGlvbigpLFxuICBUb2dnbGVGb2N1c0FjdGlvbjogbmV3IFRvZ2dsZUZvY3VzQWN0aW9uKCksXG59O1xuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluLnRzXCI7XG5pbXBvcnQgeyBPcCB9IGZyb20gXCIuLi9vcHMvb3BzLnRzXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Gcm9tT3AsIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi9hY3Rpb24udHNcIjtcbmltcG9ydCB7IEFjdGlvbk5hbWVzLCBBY3Rpb25SZWdpc3RyeSB9IGZyb20gXCIuL3JlZ2lzdHJ5LnRzXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiOiBDdXN0b21FdmVudDxudWxsPjtcbiAgfVxufVxuXG5jb25zdCB1bmRvU3RhY2s6IEFjdGlvbltdID0gW107XG5cbmV4cG9ydCBjb25zdCB1bmRvID0gYXN5bmMgKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxudWxsPj4gPT4ge1xuICBjb25zdCBhY3Rpb24gPSB1bmRvU3RhY2sucG9wKCkhO1xuICBpZiAoIWFjdGlvbikge1xuICAgIHJldHVybiBvayhudWxsKTtcbiAgfVxuXG4gIHJldHVybiBhd2FpdCBleGVjdXRlVW5kbyhhY3Rpb24sIGV4cGxhbk1haW4pO1xufTtcblxuZXhwb3J0IGNvbnN0IGV4ZWN1dGUgPSBhc3luYyAoXG4gIG5hbWU6IEFjdGlvbk5hbWVzLFxuICBleHBsYW5NYWluOiBFeHBsYW5NYWluXG4pOiBQcm9taXNlPFJlc3VsdDxudWxsPj4gPT4ge1xuICBjb25zdCBhY3Rpb24gPSBBY3Rpb25SZWdpc3RyeVtuYW1lXTtcbiAgY29uc3QgcmV0ID0gYXdhaXQgYWN0aW9uLmRvKGV4cGxhbk1haW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgc3dpdGNoIChhY3Rpb24ucG9zdEFjdGlvbldvcmspIHtcbiAgICBjYXNlIFwiXCI6XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwicGFpbnRDaGFydFwiOlxuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICAvLyBTZW5kIGFuIGV2ZW50IGluIGNhc2Ugd2UgaGF2ZSBhbnkgZGlhbG9ncyB1cCB0aGF0IG5lZWQgdG8gcmUtcmVuZGVyIGlmXG4gICAgICAvLyB0aGUgcGxhbiBjaGFuZ2VkLCBwb3NzaWJsZSBzaW5jZSBDdHJsLVogd29ya3MgZnJvbSBhbnl3aGVyZS5cbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KFwicGxhbi1kZWZpbml0aW9uLWNoYW5nZWRcIikpO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG4gIGlmIChhY3Rpb24udW5kbykge1xuICAgIHVuZG9TdGFjay5wdXNoKHJldC52YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufTtcblxuZXhwb3J0IGNvbnN0IGV4ZWN1dGVPcCA9IGFzeW5jIChcbiAgb3A6IE9wLFxuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayxcbiAgdW5kbzogYm9vbGVhbixcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpblxuKTogUHJvbWlzZTxSZXN1bHQ8bnVsbD4+ID0+IHtcbiAgY29uc3QgYWN0aW9uID0gbmV3IEFjdGlvbkZyb21PcChvcCwgcG9zdEFjdGlvbldvcmssIHVuZG8pO1xuICBjb25zdCByZXQgPSBhd2FpdCBhY3Rpb24uZG8oZXhwbGFuTWFpbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuICBzd2l0Y2ggKGFjdGlvbi5wb3N0QWN0aW9uV29yaykge1xuICAgIGNhc2UgXCJcIjpcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInBhaW50Q2hhcnRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI6XG4gICAgICBleHBsYW5NYWluLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgLy8gU2VuZCBhbiBldmVudCBpbiBjYXNlIHdlIGhhdmUgYW55IGRpYWxvZ3MgdXAgdGhhdCBuZWVkIHRvIHJlLXJlbmRlciBpZlxuICAgICAgLy8gdGhlIHBsYW4gY2hhbmdlZCwgcG9zc2libGUgc2luY2UgQ3RybC1aIHdvcmtzIGZyb20gYW55d2hlcmUuXG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCIpKTtcblxuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgYnJlYWs7XG4gIH1cbiAgaWYgKGFjdGlvbi51bmRvKSB7XG4gICAgdW5kb1N0YWNrLnB1c2gocmV0LnZhbHVlKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59O1xuXG5jb25zdCBleGVjdXRlVW5kbyA9IGFzeW5jIChcbiAgYWN0aW9uOiBBY3Rpb24sXG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW5cbik6IFByb21pc2U8UmVzdWx0PG51bGw+PiA9PiB7XG4gIGNvbnN0IHJldCA9IGF3YWl0IGFjdGlvbi5kbyhleHBsYW5NYWluKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIHN3aXRjaCAoYWN0aW9uLnBvc3RBY3Rpb25Xb3JrKSB7XG4gICAgY2FzZSBcIlwiOlxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFwicGFpbnRDaGFydFwiOlxuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICAvLyBTZW5kIGFuIGV2ZW50IGluIGNhc2Ugd2UgaGF2ZSBhbnkgZGlhbG9ncyB1cCB0aGF0IG5lZWQgdG8gcmUtcmVuZGVyIGlmXG4gICAgICAvLyB0aGUgcGxhbiBjaGFuZ2VkLCBwb3NzaWJsZSBzaW5jZSBDdHJsLVogd29ya3MgZnJvbSBhbnl3aGVyZS5cbiAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KFwicGxhbi1kZWZpbml0aW9uLWNoYW5nZWRcIikpO1xuXG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59O1xuIiwgImltcG9ydCB7IGV4ZWN1dGUgfSBmcm9tIFwiLi4vYWN0aW9uL2V4ZWN1dGVcIjtcbmltcG9ydCB7IEFjdGlvbk5hbWVzIH0gZnJvbSBcIi4uL2FjdGlvbi9yZWdpc3RyeVwiO1xuaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcblxuZXhwb3J0IGNvbnN0IEtleU1hcDogTWFwPHN0cmluZywgQWN0aW9uTmFtZXM+ID0gbmV3IE1hcChbXG4gIFtcInNoaWZ0LWN0cmwtUlwiLCBcIlRvZ2dsZVJhZGFyQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLU1cIiwgXCJUb2dnbGVEYXJrTW9kZUFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC1aXCIsIFwiUmVzZXRab29tQWN0aW9uXCJdLFxuICBbXCJjdHJsLXpcIiwgXCJVbmRvQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLUhcIiwgXCJIZWxwQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLXxcIiwgXCJTcGxpdFRhc2tBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtX1wiLCBcIkR1cFRhc2tBY3Rpb25cIl0sXG4gIFtcImFsdC1JbnNlcnRcIiwgXCJOZXdUYXNrQWN0aW9uXCJdLFxuICBbXCJhbHQtRGVsZXRlXCIsIFwiRGVsZXRlVGFza0FjdGlvblwiXSxcbiAgW1wiY3RybC1mXCIsIFwiR29Ub1NlYXJjaEFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC1GXCIsIFwiR29Ub0Z1bGxTZWFyY2hBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtPFwiLCBcIkFkZFByZWRlY2Vzc29yQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLT5cIiwgXCJBZGRTdWNjZXNzb3JBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtOlwiLCBcIlRvZ2dsZUZvY3VzQWN0aW9uXCJdLFxuXSk7XG5cbmxldCBleHBsYW5NYWluOiBFeHBsYW5NYWluO1xuXG5leHBvcnQgY29uc3QgU3RhcnRLZXlib2FyZEhhbmRsaW5nID0gKGVtOiBFeHBsYW5NYWluKSA9PiB7XG4gIGV4cGxhbk1haW4gPSBlbTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgb25LZXlEb3duKTtcbn07XG5cbmNvbnN0IG9uS2V5RG93biA9IGFzeW5jIChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gIGNvbnN0IGtleW5hbWUgPSBgJHtlLnNoaWZ0S2V5ID8gXCJzaGlmdC1cIiA6IFwiXCJ9JHtlLmN0cmxLZXkgPyBcImN0cmwtXCIgOiBcIlwifSR7ZS5tZXRhS2V5ID8gXCJtZXRhLVwiIDogXCJcIn0ke2UuYWx0S2V5ID8gXCJhbHQtXCIgOiBcIlwifSR7ZS5rZXl9YDtcbiAgY29uc29sZS5sb2coa2V5bmFtZSk7XG4gIGNvbnN0IGFjdGlvbk5hbWUgPSBLZXlNYXAuZ2V0KGtleW5hbWUpO1xuICBpZiAoYWN0aW9uTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZShhY3Rpb25OYW1lLCBleHBsYW5NYWluKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICB9XG59O1xuIiwgImltcG9ydCB7IGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHsgS2V5TWFwIH0gZnJvbSBcIi4uL2tleW1hcC9rZXltYXAudHNcIjtcbmltcG9ydCB7IEFjdGlvblJlZ2lzdHJ5IH0gZnJvbSBcIi4uL2FjdGlvbi9yZWdpc3RyeVwiO1xuXG5jbGFzcyBLZXlib2FyZE1hcERpYWxvZyBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgY29uc3Qga2V5bWFwRW50cmllcyA9IFsuLi5LZXlNYXAuZW50cmllcygpXTtcbiAgICBrZXltYXBFbnRyaWVzLnNvcnQoKTtcbiAgICByZW5kZXIoXG4gICAgICBodG1sYFxuICAgICAgICA8ZGlhbG9nPlxuICAgICAgICAgIDx0YWJsZT5cbiAgICAgICAgICAgICR7a2V5bWFwRW50cmllcy5tYXAoXG4gICAgICAgICAgICAgIChba2V5LCBhY3Rpb25OYW1lXSkgPT5cbiAgICAgICAgICAgICAgICBodG1sYDx0cj5cbiAgICAgICAgICAgICAgICAgIDx0ZD4ke2tleX08L3RkPlxuICAgICAgICAgICAgICAgICAgPHRkPiR7QWN0aW9uUmVnaXN0cnlbYWN0aW9uTmFtZV0uZGVzY3JpcHRpb259PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaWFsb2c+XG4gICAgICBgLFxuICAgICAgdGhpc1xuICAgICk7XG4gIH1cblxuICBzaG93TW9kYWwoKSB7XG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImRpYWxvZ1wiKSEuc2hvd01vZGFsKCk7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwia2V5Ym9hcmQtbWFwLWRpYWxvZ1wiLCBLZXlib2FyZE1hcERpYWxvZyk7XG4iLCAiLy8gRWFjaCBSZXNvdXJzZSBoYXMgYSBrZXksIHdoaWNoIGlzIHRoZSBuYW1lLCBhbmQgYSBsaXN0IG9mIGFjY2VwdGFibGUgdmFsdWVzLlxuLy8gVGhlIGxpc3Qgb2YgdmFsdWVzIGNhbiBuZXZlciBiZSBlbXB0eSwgYW5kIHRoZSBmaXJzdCB2YWx1ZSBpbiBgdmFsdWVzYCBpcyB0aGVcbi8vIGRlZmF1bHQgdmFsdWUgZm9yIGEgUmVzb3VyY2UuXG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFID0gXCJcIjtcblxuZXhwb3J0IGludGVyZmFjZSBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgdmFsdWVzOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGNsYXNzIFJlc291cmNlRGVmaW5pdGlvbiB7XG4gIHZhbHVlczogc3RyaW5nW107XG5cbiAgLy8gVHJ1ZSBpZiB0aGUgUmVzb3VyY2UgaXMgYnVpbHQgaW4gYW5kIGNhbid0IGJlIGVkaXRlZCBvciBkZWxldGVkLlxuICBpc1N0YXRpYzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICB2YWx1ZXM6IHN0cmluZ1tdID0gW0RFRkFVTFRfUkVTT1VSQ0VfVkFMVUVdLFxuICAgIGlzU3RhdGljOiBib29sZWFuID0gZmFsc2VcbiAgKSB7XG4gICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgdGhpcy5pc1N0YXRpYyA9IGlzU3RhdGljO1xuICB9XG5cbiAgdG9KU09OKCk6IFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZXM6IHRoaXMudmFsdWVzLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZCk6IFJlc291cmNlRGVmaW5pdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBSZXNvdXJjZURlZmluaXRpb24ocy52YWx1ZXMpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFJlc291cmNlRGVmaW5pdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IFJlc291cmNlRGVmaW5pdGlvbiB9O1xuZXhwb3J0IHR5cGUgUmVzb3VyY2VEZWZpbml0aW9uc1NlcmlhbGl6ZWQgPSB7XG4gIFtrZXk6IHN0cmluZ106IFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQ7XG59O1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sIH0gZnJvbSBcImxpdC1odG1sXCI7XG5cbi8vIExvb2sgb24gdGhlIG1haW4gaW5kZXggcGFnZSBmb3IgYWxsIHRoZSBhbGxvd2VkIG5hbWVzLlxuLy9cbi8vIEluc3RhbnRpYXRlcyBhbiBTVkcgaWNvbiB2aWEgdGhlIDx1c2U+IHRhZy5cbmV4cG9ydCBjb25zdCBpY29uID0gKG5hbWU6IHN0cmluZyk6IFRlbXBsYXRlUmVzdWx0ID0+IHtcbiAgcmV0dXJuIGh0bWxgXG4gIDxzdmdcbiAgICB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcbiAgICB3aWR0aD1cIjI0XCJcbiAgICBoZWlnaHQ9XCIyNFwiXG4gICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXG4gID5cbiAgICA8dXNlIGhyZWY9IyR7bmFtZX0+XG4gIDwvc3ZnPmA7XG59O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7XG4gIE9wLFxuICBTdWJPcCxcbiAgU3ViT3BSZXN1bHQsXG4gIGFwcGx5QWxsT3BzVG9QbGFuQW5kVGhlbkludmVyc2UsXG59IGZyb20gXCIuL29wcy50c1wiO1xuaW1wb3J0IHtcbiAgREVGQVVMVF9SRVNPVVJDRV9WQUxVRSxcbiAgUmVzb3VyY2VEZWZpbml0aW9uLFxufSBmcm9tIFwiLi4vcmVzb3VyY2VzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuXG5leHBvcnQgY2xhc3MgQWRkUmVzb3VyY2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG5cbiAgZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGU6IGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlIHwgbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGU6IGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlIHwgbnVsbCA9IG51bGxcbiAgKSB7XG4gICAgdGhpcy5rZXkgPSBuYW1lO1xuICAgIHRoaXMuZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGUgPSBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBhbHJlYWR5IGV4aXN0cyBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRSZXNvdXJjZURlZmluaXRpb24oXG4gICAgICB0aGlzLmtleSxcbiAgICAgICh0aGlzLmRlbGV0ZVJlc291cmNlVW5kb1N0YXRlICYmXG4gICAgICAgIHRoaXMuZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGUucmVzb3VyY2VEZWZpbml0aW9uKSB8fFxuICAgICAgICBuZXcgUmVzb3VyY2VEZWZpbml0aW9uKClcbiAgICApO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBhZGQgdGhpcyBrZXkgYW5kIHNldCBpdCB0byB0aGUgZGVmYXVsdCwgdW5sZXNzXG4gICAgLy8gdGhlcmUgaXMgbWF0Y2hpbmcgZW50cnkgaW4gdGFza1Jlc291cmNlVmFsdWVzLCBpbiB3aGljaCBjYXNlIHdlIHdpbGwgdXNlIHRoYXQgdmFsdWUuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICB0YXNrLnNldFJlc291cmNlKFxuICAgICAgICB0aGlzLmtleSxcbiAgICAgICAgKHRoaXMuZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGUgJiZcbiAgICAgICAgICB0aGlzLmRlbGV0ZVJlc291cmNlVW5kb1N0YXRlLnRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWUuZ2V0KFxuICAgICAgICAgICAgaW5kZXhcbiAgICAgICAgICApKSB8fFxuICAgICAgICAgIERFRkFVTFRfUkVTT1VSQ0VfVkFMVUVcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlUmVzb3VyY2VTdXBPcCh0aGlzLmtleSk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlIHtcbiAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb247XG4gIHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWU6IE1hcDxudW1iZXIsIHN0cmluZz47XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVSZXNvdXJjZVN1cE9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmtleSA9IG5hbWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXNvdXJjZURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBUaGUgcmVzb3VyY2Ugd2l0aCBuYW1lICR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFuZCBjYW4ndCBiZSBkZWxldGVkLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGZyb20gcmVzb3VyY2UgZGVmaW5pdGlvbnMuXG4gICAgcGxhbi5kZWxldGVSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuXG4gICAgY29uc3QgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZTogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXAoKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgcmVtb3ZlIGB0aGlzLmtleWAgZnJvbSB0aGUgcmVzb3VyY2VzIHdoaWxlIGFsc29cbiAgICAvLyBidWlsZGluZyB1cCB0aGUgaW5mbyBuZWVkZWQgZm9yIGEgcmV2ZXJ0LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFO1xuICAgICAgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZS5zZXQoaW5kZXgsIHZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlUmVzb3VyY2UodGhpcy5rZXkpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGU6IGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlID0ge1xuICAgICAgcmVzb3VyY2VEZWZpbml0aW9uOiByZXNvdXJjZURlZmluaXRpb24sXG4gICAgICB0YXNrSW5kZXhUb0RlbGV0ZWRSZXNvdXJjZVZhbHVlOiB0YXNrSW5kZXhUb0RlbGV0ZWRSZXNvdXJjZVZhbHVlLFxuICAgIH07XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGU6IGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkUmVzb3VyY2VTdWJPcCh0aGlzLmtleSwgZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW10gLy8gVGhpcyBzaG91bGQgb25seSBiZSBzdXBwbGllZCB3aGVuIGJlaW5nIGNvbnN0cnVjdGVkIGFzIGEgaW52ZXJzZSBvcGVyYXRpb24uXG4gICkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UgPSBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXNuJ3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cbiAgICBjb25zdCBleGlzdGluZ0luZGV4ID0gZGVmaW5pdGlvbi52YWx1ZXMuZmluZEluZGV4KFxuICAgICAgKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlID09PSB0aGlzLnZhbHVlXG4gICAgKTtcbiAgICBpZiAoZXhpc3RpbmdJbmRleCAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy52YWx1ZX0gYWxyZWFkeSBleGlzdHMgYXMgYSB2YWx1ZSBpbiB0aGUgUmVzb3VyY2UgJHt0aGlzLmtleX0uYFxuICAgICAgKTtcbiAgICB9XG4gICAgZGVmaW5pdGlvbi52YWx1ZXMucHVzaCh0aGlzLnZhbHVlKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgc2V0IHRoZSB2YWx1ZSBmb3IgdGhlIGdpdmVuIGtleSBmb3IgYWxsIHRoZVxuICAgIC8vIHRhc2tzIGxpc3RlZCBpbiBgaW5kaWNlc09mVGFza3NUb0NoYW5nZWAuXG4gICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uc2V0UmVzb3VyY2UodGhpcy5rZXksIHRoaXMudmFsdWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy52YWx1ZSxcbiAgICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW11cbiAgKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZSA9IGluZGljZXNPZlRhc2tzVG9DaGFuZ2U7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lc24ndCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlSW5kZXggPSBkZWZpbml0aW9uLnZhbHVlcy5maW5kSW5kZXgoXG4gICAgICAodmFsdWU6IHN0cmluZykgPT4gdmFsdWUgPT09IHRoaXMudmFsdWVcbiAgICApO1xuICAgIGlmICh2YWx1ZUluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLnZhbHVlfSBkb2VzIG5vdCBleGlzdCBhcyBhIHZhbHVlIGluIHRoZSBSZXNvdXJjZSAke3RoaXMua2V5fS5gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBSZXNvdXJjZXMgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSB2YWx1ZS4gJHt0aGlzLnZhbHVlfSBvbmx5IGhhcyBvbmUgdmFsdWUsIHNvIGl0IGNhbid0IGJlIGRlbGV0ZWQuIGBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZGVmaW5pdGlvbi52YWx1ZXMuc3BsaWNlKHZhbHVlSW5kZXgsIDEpO1xuXG4gICAgLy8gTm93IGl0ZXJhdGUgdGhvdWdoIGFsbCB0aGUgdGFza3MgYW5kIGNoYW5nZSBhbGwgdGFza3MgdGhhdCBoYXZlXG4gICAgLy8gXCJrZXk6dmFsdWVcIiB0byBpbnN0ZWFkIGJlIFwia2V5OmRlZmF1bHRcIi4gUmVjb3JkIHdoaWNoIHRhc2tzIGdvdCBjaGFuZ2VkXG4gICAgLy8gc28gdGhhdCB3ZSBjYW4gdXNlIHRoYXQgaW5mb3JtYXRpb24gd2hlbiB3ZSBjcmVhdGUgdGhlIGludmVydCBvcGVyYXRpb24uXG5cbiAgICBjb25zdCBpbmRpY2VzT2ZUYXNrc1dpdGhNYXRjaGluZ1Jlc291cmNlVmFsdWVzOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCByZXNvdXJjZVZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSk7XG4gICAgICBpZiAocmVzb3VyY2VWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChyZXNvdXJjZVZhbHVlICE9PSB0aGlzLnZhbHVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gU2luY2UgdGhlIHZhbHVlIGlzIG5vIGxvbmdlciB2YWxpZCB3ZSBjaGFuZ2UgaXQgYmFjayB0byB0aGUgZGVmYXVsdC5cbiAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5rZXksIGRlZmluaXRpb24udmFsdWVzWzBdKTtcblxuICAgICAgLy8gUmVjb3JkIHdoaWNoIHRhc2sgd2UganVzdCBjaGFuZ2VkLlxuICAgICAgaW5kaWNlc09mVGFza3NXaXRoTWF0Y2hpbmdSZXNvdXJjZVZhbHVlcy5wdXNoKGluZGV4KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKGluZGljZXNPZlRhc2tzV2l0aE1hdGNoaW5nUmVzb3VyY2VWYWx1ZXMpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy52YWx1ZSxcbiAgICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2VcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVSZXNvdXJjZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBvbGRLZXk6IHN0cmluZztcbiAgbmV3S2V5OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob2xkS2V5OiBzdHJpbmcsIG5ld0tleTogc3RyaW5nKSB7XG4gICAgdGhpcy5vbGRLZXkgPSBvbGRLZXk7XG4gICAgdGhpcy5uZXdLZXkgPSBuZXdLZXk7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBvbGREZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5vbGRLZXkpO1xuICAgIGlmIChvbGREZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm9sZEtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIC8vIENvbmZpcm0gdGhlIG5ld0tleSBpcyBub3QgYWxyZWFkeSB1c2VkLlxuICAgIGNvbnN0IG5ld0tleURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLm5ld0tleSk7XG4gICAgaWYgKG5ld0tleURlZmluaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmV3S2V5fSBhbHJlYWR5IGV4aXN0cyBhcyBhIHJlc291cmNlIG5hbWUuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5kZWxldGVSZXNvdXJjZURlZmluaXRpb24odGhpcy5vbGRLZXkpO1xuICAgIHBsYW4uc2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMubmV3S2V5LCBvbGREZWZpbml0aW9uKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgY2hhbmdlIG9sZEtleSAtPiBuZXdrZXkgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPVxuICAgICAgICB0YXNrLmdldFJlc291cmNlKHRoaXMub2xkS2V5KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFO1xuICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLm5ld0tleSwgY3VycmVudFZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlUmVzb3VyY2UodGhpcy5vbGRLZXkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZVJlc291cmNlU3ViT3AodGhpcy5uZXdLZXksIHRoaXMub2xkS2V5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIG9sZFZhbHVlOiBzdHJpbmc7XG4gIG5ld1ZhbHVlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcsIG5ld1ZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLm9sZFZhbHVlID0gb2xkVmFsdWU7XG4gICAgdGhpcy5uZXdWYWx1ZSA9IG5ld1ZhbHVlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZm91bmRNYXRjaCA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZm91bmRNYXRjaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBvbGRWYWx1ZSBpcyBpbiB0aGVyZS5cbiAgICBjb25zdCBvbGRWYWx1ZUluZGV4ID0gZm91bmRNYXRjaC52YWx1ZXMuaW5kZXhPZih0aGlzLm9sZFZhbHVlKTtcblxuICAgIGlmIChvbGRWYWx1ZUluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBhIHZhbHVlICR7dGhpcy5vbGRWYWx1ZX1gKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBuZXdWYWx1ZSBpcyBub3QgaW4gdGhlcmUuXG4gICAgY29uc3QgbmV3VmFsdWVJbmRleCA9IGZvdW5kTWF0Y2gudmFsdWVzLmluZGV4T2YodGhpcy5uZXdWYWx1ZSk7XG4gICAgaWYgKG5ld1ZhbHVlSW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGFscmVhZHkgaGFzIGEgdmFsdWUgJHt0aGlzLm5ld1ZhbHVlfWApO1xuICAgIH1cblxuICAgIC8vIFN3YXAgdGhlIHZhbHVlcy5cbiAgICBmb3VuZE1hdGNoLnZhbHVlcy5zcGxpY2Uob2xkVmFsdWVJbmRleCwgMSwgdGhpcy5uZXdWYWx1ZSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGNoYW5nZSBvbGRWYWx1ZSAtPiBuZXdWYWx1ZSBmb3IgdGhlIGdpdmVuIHJlc291cmNlIGtleS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpO1xuICAgICAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gdGhpcy5vbGRWYWx1ZSkge1xuICAgICAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLm5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW5hbWVSZXNvdXJjZU9wdGlvblN1Yk9wKFxuICAgICAgdGhpcy5rZXksXG4gICAgICB0aGlzLm5ld1ZhbHVlLFxuICAgICAgdGhpcy5vbGRWYWx1ZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgb2xkSW5kZXg6IG51bWJlcjtcbiAgbmV3SW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgb2xkVmFsdWU6IG51bWJlciwgbmV3VmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMub2xkSW5kZXggPSBvbGRWYWx1ZTtcbiAgICB0aGlzLm5ld0luZGV4ID0gbmV3VmFsdWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm5ld0luZGV4IDwgMCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmV3SW5kZXh9IGlzIG5vdCBhIHZhbGlkIHRhcmdldCB2YWx1ZS5gKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vbGRJbmRleCA+IGRlZmluaXRpb24udmFsdWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy5rZXl9IGRvZXMgbm90IGhhdmUgYSB2YWx1ZSBhdCBpbmRleCAke3RoaXMub2xkSW5kZXh9YFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubmV3SW5kZXggPiBkZWZpbml0aW9uLnZhbHVlcy5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMua2V5fSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUgYXQgaW5kZXggJHt0aGlzLm5ld0luZGV4fWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gU3dhcCB0aGUgdmFsdWVzLlxuICAgIGNvbnN0IHRtcCA9IGRlZmluaXRpb24udmFsdWVzW3RoaXMub2xkSW5kZXhdO1xuICAgIGRlZmluaXRpb24udmFsdWVzW3RoaXMub2xkSW5kZXhdID0gZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5uZXdJbmRleF07XG4gICAgZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5uZXdJbmRleF0gPSB0bXA7XG5cbiAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIHdpdGggVGFza3MgYmVjYXVzZSB0aGUgaW5kZXggb2YgYSB2YWx1ZSBpc1xuICAgIC8vIGlycmVsZXZhbnQgc2luY2Ugd2Ugc3RvcmUgdGhlIHZhbHVlIGl0c2VsZiwgbm90IHRoZSBpbmRleC5cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBNb3ZlUmVzb3VyY2VPcHRpb25TdWJPcCh0aGlzLmtleSwgdGhpcy5uZXdJbmRleCwgdGhpcy5vbGRJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFJlc291cmNlVmFsdWVTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCB0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgY29uc3QgZm91bmRWYWx1ZU1hdGNoID0gZm91bmRNYXRjaC52YWx1ZXMuZmluZEluZGV4KCh2OiBzdHJpbmcpID0+IHtcbiAgICAgIHJldHVybiB2ID09PSB0aGlzLnZhbHVlO1xuICAgIH0pO1xuICAgIGlmIChmb3VuZFZhbHVlTWF0Y2ggPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGhhdmUgYSB2YWx1ZSBvZiAke3RoaXMudmFsdWV9YCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRhc2tJbmRleCA8IDAgfHwgdGhpcy50YXNrSW5kZXggPj0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBlcnJvcihgVGhlcmUgaXMgbm8gVGFzayBhdCBpbmRleCAke3RoaXMudGFza0luZGV4fWApO1xuICAgIH1cblxuICAgIGNvbnN0IHRhc2sgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XTtcbiAgICBjb25zdCBvbGRWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpITtcbiAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLnZhbHVlKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRWYWx1ZSkgfSk7XG4gIH1cblxuICBpbnZlcnNlKG9sZFZhbHVlOiBzdHJpbmcpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRSZXNvdXJjZVZhbHVlU3ViT3AodGhpcy5rZXksIG9sZFZhbHVlLCB0aGlzLnRhc2tJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZFJlc291cmNlT3AobmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgQWRkUmVzb3VyY2VTdWJPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlUmVzb3VyY2VPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVSZXNvdXJjZVN1cE9wKG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRSZXNvdXJjZU9wdGlvbk9wKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgQWRkUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIHZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlUmVzb3VyY2VPcHRpb25PcChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCB2YWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmFtZVJlc291cmNlT3B0aW9uT3AoXG4gIGtleTogc3RyaW5nLFxuICBvbGRWYWx1ZTogc3RyaW5nLFxuICBuZXdWYWx1ZTogc3RyaW5nXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lUmVzb3VyY2VPcChvbGRWYWx1ZTogc3RyaW5nLCBuZXdWYWx1ZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmVuYW1lUmVzb3VyY2VTdWJPcChvbGRWYWx1ZSwgbmV3VmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNb3ZlUmVzb3VyY2VPcHRpb25PcChcbiAga2V5OiBzdHJpbmcsXG4gIG9sZEluZGV4OiBudW1iZXIsXG4gIG5ld0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgb2xkSW5kZXgsIG5ld0luZGV4KV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0UmVzb3VyY2VWYWx1ZU9wKFxuICBrZXk6IHN0cmluZyxcbiAgdmFsdWU6IHN0cmluZyxcbiAgdGFza0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldFJlc291cmNlVmFsdWVTdWJPcChrZXksIHZhbHVlLCB0YXNrSW5kZXgpXSk7XG59XG4iLCAiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTcgR29vZ2xlIExMQ1xuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEJTRC0zLUNsYXVzZVxuICovXG5cbmltcG9ydCB7RGlzY29ubmVjdGFibGUsIFBhcnR9IGZyb20gJy4vbGl0LWh0bWwuanMnO1xuXG5leHBvcnQge1xuICBBdHRyaWJ1dGVQYXJ0LFxuICBCb29sZWFuQXR0cmlidXRlUGFydCxcbiAgQ2hpbGRQYXJ0LFxuICBFbGVtZW50UGFydCxcbiAgRXZlbnRQYXJ0LFxuICBQYXJ0LFxuICBQcm9wZXJ0eVBhcnQsXG59IGZyb20gJy4vbGl0LWh0bWwuanMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGl2ZUNsYXNzIHtcbiAgbmV3IChwYXJ0OiBQYXJ0SW5mbyk6IERpcmVjdGl2ZTtcbn1cblxuLyoqXG4gKiBUaGlzIHV0aWxpdHkgdHlwZSBleHRyYWN0cyB0aGUgc2lnbmF0dXJlIG9mIGEgZGlyZWN0aXZlIGNsYXNzJ3MgcmVuZGVyKClcbiAqIG1ldGhvZCBzbyB3ZSBjYW4gdXNlIGl0IGZvciB0aGUgdHlwZSBvZiB0aGUgZ2VuZXJhdGVkIGRpcmVjdGl2ZSBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IHR5cGUgRGlyZWN0aXZlUGFyYW1ldGVyczxDIGV4dGVuZHMgRGlyZWN0aXZlPiA9IFBhcmFtZXRlcnM8Q1sncmVuZGVyJ10+O1xuXG4vKipcbiAqIEEgZ2VuZXJhdGVkIGRpcmVjdGl2ZSBmdW5jdGlvbiBkb2Vzbid0IGV2YWx1YXRlIHRoZSBkaXJlY3RpdmUsIGJ1dCBqdXN0XG4gKiByZXR1cm5zIGEgRGlyZWN0aXZlUmVzdWx0IG9iamVjdCB0aGF0IGNhcHR1cmVzIHRoZSBhcmd1bWVudHMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0aXZlUmVzdWx0PEMgZXh0ZW5kcyBEaXJlY3RpdmVDbGFzcyA9IERpcmVjdGl2ZUNsYXNzPiB7XG4gIC8qKlxuICAgKiBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIFsnXyRsaXREaXJlY3RpdmUkJ106IEM7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgdmFsdWVzOiBEaXJlY3RpdmVQYXJhbWV0ZXJzPEluc3RhbmNlVHlwZTxDPj47XG59XG5cbmV4cG9ydCBjb25zdCBQYXJ0VHlwZSA9IHtcbiAgQVRUUklCVVRFOiAxLFxuICBDSElMRDogMixcbiAgUFJPUEVSVFk6IDMsXG4gIEJPT0xFQU5fQVRUUklCVVRFOiA0LFxuICBFVkVOVDogNSxcbiAgRUxFTUVOVDogNixcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIFBhcnRUeXBlID0gKHR5cGVvZiBQYXJ0VHlwZSlba2V5b2YgdHlwZW9mIFBhcnRUeXBlXTtcblxuZXhwb3J0IGludGVyZmFjZSBDaGlsZFBhcnRJbmZvIHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIFBhcnRUeXBlLkNISUxEO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEF0dHJpYnV0ZVBhcnRJbmZvIHtcbiAgcmVhZG9ubHkgdHlwZTpcbiAgICB8IHR5cGVvZiBQYXJ0VHlwZS5BVFRSSUJVVEVcbiAgICB8IHR5cGVvZiBQYXJ0VHlwZS5QUk9QRVJUWVxuICAgIHwgdHlwZW9mIFBhcnRUeXBlLkJPT0xFQU5fQVRUUklCVVRFXG4gICAgfCB0eXBlb2YgUGFydFR5cGUuRVZFTlQ7XG4gIHJlYWRvbmx5IHN0cmluZ3M/OiBSZWFkb25seUFycmF5PHN0cmluZz47XG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgdGFnTmFtZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVsZW1lbnRQYXJ0SW5mbyB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBQYXJ0VHlwZS5FTEVNRU5UO1xufVxuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBwYXJ0IGEgZGlyZWN0aXZlIGlzIGJvdW5kIHRvLlxuICpcbiAqIFRoaXMgaXMgdXNlZnVsIGZvciBjaGVja2luZyB0aGF0IGEgZGlyZWN0aXZlIGlzIGF0dGFjaGVkIHRvIGEgdmFsaWQgcGFydCxcbiAqIHN1Y2ggYXMgd2l0aCBkaXJlY3RpdmUgdGhhdCBjYW4gb25seSBiZSB1c2VkIG9uIGF0dHJpYnV0ZSBiaW5kaW5ncy5cbiAqL1xuZXhwb3J0IHR5cGUgUGFydEluZm8gPSBDaGlsZFBhcnRJbmZvIHwgQXR0cmlidXRlUGFydEluZm8gfCBFbGVtZW50UGFydEluZm87XG5cbi8qKlxuICogQ3JlYXRlcyBhIHVzZXItZmFjaW5nIGRpcmVjdGl2ZSBmdW5jdGlvbiBmcm9tIGEgRGlyZWN0aXZlIGNsYXNzLiBUaGlzXG4gKiBmdW5jdGlvbiBoYXMgdGhlIHNhbWUgcGFyYW1ldGVycyBhcyB0aGUgZGlyZWN0aXZlJ3MgcmVuZGVyKCkgbWV0aG9kLlxuICovXG5leHBvcnQgY29uc3QgZGlyZWN0aXZlID1cbiAgPEMgZXh0ZW5kcyBEaXJlY3RpdmVDbGFzcz4oYzogQykgPT5cbiAgKC4uLnZhbHVlczogRGlyZWN0aXZlUGFyYW1ldGVyczxJbnN0YW5jZVR5cGU8Qz4+KTogRGlyZWN0aXZlUmVzdWx0PEM+ID0+ICh7XG4gICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICBbJ18kbGl0RGlyZWN0aXZlJCddOiBjLFxuICAgIHZhbHVlcyxcbiAgfSk7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgY3JlYXRpbmcgY3VzdG9tIGRpcmVjdGl2ZXMuIFVzZXJzIHNob3VsZCBleHRlbmQgdGhpcyBjbGFzcyxcbiAqIGltcGxlbWVudCBgcmVuZGVyYCBhbmQvb3IgYHVwZGF0ZWAsIGFuZCB0aGVuIHBhc3MgdGhlaXIgc3ViY2xhc3MgdG9cbiAqIGBkaXJlY3RpdmVgLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRGlyZWN0aXZlIGltcGxlbWVudHMgRGlzY29ubmVjdGFibGUge1xuICAvL0BpbnRlcm5hbFxuICBfX3BhcnQhOiBQYXJ0O1xuICAvL0BpbnRlcm5hbFxuICBfX2F0dHJpYnV0ZUluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gIC8vQGludGVybmFsXG4gIF9fZGlyZWN0aXZlPzogRGlyZWN0aXZlO1xuXG4gIC8vQGludGVybmFsXG4gIF8kcGFyZW50ITogRGlzY29ubmVjdGFibGU7XG5cbiAgLy8gVGhlc2Ugd2lsbCBvbmx5IGV4aXN0IG9uIHRoZSBBc3luY0RpcmVjdGl2ZSBzdWJjbGFzc1xuICAvL0BpbnRlcm5hbFxuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+O1xuICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAvL0BpbnRlcm5hbFxuICBbJ18kbm90aWZ5RGlyZWN0aXZlQ29ubmVjdGlvbkNoYW5nZWQnXT8oaXNDb25uZWN0ZWQ6IGJvb2xlYW4pOiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKF9wYXJ0SW5mbzogUGFydEluZm8pIHt9XG5cbiAgLy8gU2VlIGNvbW1lbnQgaW4gRGlzY29ubmVjdGFibGUgaW50ZXJmYWNlIGZvciB3aHkgdGhpcyBpcyBhIGdldHRlclxuICBnZXQgXyRpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fJHBhcmVudC5fJGlzQ29ubmVjdGVkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGluaXRpYWxpemUoXG4gICAgcGFydDogUGFydCxcbiAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlLFxuICAgIGF0dHJpYnV0ZUluZGV4OiBudW1iZXIgfCB1bmRlZmluZWRcbiAgKSB7XG4gICAgdGhpcy5fX3BhcnQgPSBwYXJ0O1xuICAgIHRoaXMuXyRwYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5fX2F0dHJpYnV0ZUluZGV4ID0gYXR0cmlidXRlSW5kZXg7XG4gIH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHJlc29sdmUocGFydDogUGFydCwgcHJvcHM6IEFycmF5PHVua25vd24+KTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlKHBhcnQsIHByb3BzKTtcbiAgfVxuXG4gIGFic3RyYWN0IHJlbmRlciguLi5wcm9wczogQXJyYXk8dW5rbm93bj4pOiB1bmtub3duO1xuXG4gIHVwZGF0ZShfcGFydDogUGFydCwgcHJvcHM6IEFycmF5PHVua25vd24+KTogdW5rbm93biB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyKC4uLnByb3BzKTtcbiAgfVxufVxuIiwgIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDIwIEdvb2dsZSBMTENcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBCU0QtMy1DbGF1c2VcbiAqL1xuXG5pbXBvcnQge1xuICBfJExILFxuICBQYXJ0LFxuICBEaXJlY3RpdmVQYXJlbnQsXG4gIENvbXBpbGVkVGVtcGxhdGVSZXN1bHQsXG4gIE1heWJlQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdCxcbiAgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0LFxufSBmcm9tICcuL2xpdC1odG1sLmpzJztcbmltcG9ydCB7XG4gIERpcmVjdGl2ZVJlc3VsdCxcbiAgRGlyZWN0aXZlQ2xhc3MsXG4gIFBhcnRJbmZvLFxuICBBdHRyaWJ1dGVQYXJ0SW5mbyxcbn0gZnJvbSAnLi9kaXJlY3RpdmUuanMnO1xudHlwZSBQcmltaXRpdmUgPSBudWxsIHwgdW5kZWZpbmVkIHwgYm9vbGVhbiB8IG51bWJlciB8IHN0cmluZyB8IHN5bWJvbCB8IGJpZ2ludDtcblxuY29uc3Qge19DaGlsZFBhcnQ6IENoaWxkUGFydH0gPSBfJExIO1xuXG50eXBlIENoaWxkUGFydCA9IEluc3RhbmNlVHlwZTx0eXBlb2YgQ2hpbGRQYXJ0PjtcblxuY29uc3QgRU5BQkxFX1NIQURZRE9NX05PUEFUQ0ggPSB0cnVlO1xuXG5jb25zdCB3cmFwID1cbiAgRU5BQkxFX1NIQURZRE9NX05PUEFUQ0ggJiZcbiAgd2luZG93LlNoYWR5RE9NPy5pblVzZSAmJlxuICB3aW5kb3cuU2hhZHlET00/Lm5vUGF0Y2ggPT09IHRydWVcbiAgICA/IHdpbmRvdy5TaGFkeURPTSEud3JhcFxuICAgIDogKG5vZGU6IE5vZGUpID0+IG5vZGU7XG5cbi8qKlxuICogVGVzdHMgaWYgYSB2YWx1ZSBpcyBhIHByaW1pdGl2ZSB2YWx1ZS5cbiAqXG4gKiBTZWUgaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdHlwZW9mLW9wZXJhdG9yXG4gKi9cbmV4cG9ydCBjb25zdCBpc1ByaW1pdGl2ZSA9ICh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFByaW1pdGl2ZSA9PlxuICB2YWx1ZSA9PT0gbnVsbCB8fCAodHlwZW9mIHZhbHVlICE9ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZSAhPSAnZnVuY3Rpb24nKTtcblxuZXhwb3J0IGNvbnN0IFRlbXBsYXRlUmVzdWx0VHlwZSA9IHtcbiAgSFRNTDogMSxcbiAgU1ZHOiAyLFxuICBNQVRITUw6IDMsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBUZW1wbGF0ZVJlc3VsdFR5cGUgPVxuICAodHlwZW9mIFRlbXBsYXRlUmVzdWx0VHlwZSlba2V5b2YgdHlwZW9mIFRlbXBsYXRlUmVzdWx0VHlwZV07XG5cbnR5cGUgSXNUZW1wbGF0ZVJlc3VsdCA9IHtcbiAgKHZhbDogdW5rbm93bik6IHZhbCBpcyBNYXliZUNvbXBpbGVkVGVtcGxhdGVSZXN1bHQ7XG4gIDxUIGV4dGVuZHMgVGVtcGxhdGVSZXN1bHRUeXBlPihcbiAgICB2YWw6IHVua25vd24sXG4gICAgdHlwZTogVFxuICApOiB2YWwgaXMgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0PFQ+O1xufTtcblxuLyoqXG4gKiBUZXN0cyBpZiBhIHZhbHVlIGlzIGEgVGVtcGxhdGVSZXN1bHQgb3IgYSBDb21waWxlZFRlbXBsYXRlUmVzdWx0LlxuICovXG5leHBvcnQgY29uc3QgaXNUZW1wbGF0ZVJlc3VsdDogSXNUZW1wbGF0ZVJlc3VsdCA9IChcbiAgdmFsdWU6IHVua25vd24sXG4gIHR5cGU/OiBUZW1wbGF0ZVJlc3VsdFR5cGVcbik6IHZhbHVlIGlzIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCA9PlxuICB0eXBlID09PSB1bmRlZmluZWRcbiAgICA/IC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgICAodmFsdWUgYXMgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0KT8uWydfJGxpdFR5cGUkJ10gIT09IHVuZGVmaW5lZFxuICAgIDogKHZhbHVlIGFzIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCk/LlsnXyRsaXRUeXBlJCddID09PSB0eXBlO1xuXG4vKipcbiAqIFRlc3RzIGlmIGEgdmFsdWUgaXMgYSBDb21waWxlZFRlbXBsYXRlUmVzdWx0LlxuICovXG5leHBvcnQgY29uc3QgaXNDb21waWxlZFRlbXBsYXRlUmVzdWx0ID0gKFxuICB2YWx1ZTogdW5rbm93blxuKTogdmFsdWUgaXMgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdCA9PiB7XG4gIHJldHVybiAodmFsdWUgYXMgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdCk/LlsnXyRsaXRUeXBlJCddPy5oICE9IG51bGw7XG59O1xuXG4vKipcbiAqIFRlc3RzIGlmIGEgdmFsdWUgaXMgYSBEaXJlY3RpdmVSZXN1bHQuXG4gKi9cbmV4cG9ydCBjb25zdCBpc0RpcmVjdGl2ZVJlc3VsdCA9ICh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIERpcmVjdGl2ZVJlc3VsdCA9PlxuICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAodmFsdWUgYXMgRGlyZWN0aXZlUmVzdWx0KT8uWydfJGxpdERpcmVjdGl2ZSQnXSAhPT0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgRGlyZWN0aXZlIGNsYXNzIGZvciBhIERpcmVjdGl2ZVJlc3VsdFxuICovXG5leHBvcnQgY29uc3QgZ2V0RGlyZWN0aXZlQ2xhc3MgPSAodmFsdWU6IHVua25vd24pOiBEaXJlY3RpdmVDbGFzcyB8IHVuZGVmaW5lZCA9PlxuICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAodmFsdWUgYXMgRGlyZWN0aXZlUmVzdWx0KT8uWydfJGxpdERpcmVjdGl2ZSQnXTtcblxuLyoqXG4gKiBUZXN0cyB3aGV0aGVyIGEgcGFydCBoYXMgb25seSBhIHNpbmdsZS1leHByZXNzaW9uIHdpdGggbm8gc3RyaW5ncyB0b1xuICogaW50ZXJwb2xhdGUgYmV0d2Vlbi5cbiAqXG4gKiBPbmx5IEF0dHJpYnV0ZVBhcnQgYW5kIFByb3BlcnR5UGFydCBjYW4gaGF2ZSBtdWx0aXBsZSBleHByZXNzaW9ucy5cbiAqIE11bHRpLWV4cHJlc3Npb24gcGFydHMgaGF2ZSBhIGBzdHJpbmdzYCBwcm9wZXJ0eSBhbmQgc2luZ2xlLWV4cHJlc3Npb25cbiAqIHBhcnRzIGRvIG5vdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzU2luZ2xlRXhwcmVzc2lvbiA9IChwYXJ0OiBQYXJ0SW5mbykgPT5cbiAgKHBhcnQgYXMgQXR0cmlidXRlUGFydEluZm8pLnN0cmluZ3MgPT09IHVuZGVmaW5lZDtcblxuY29uc3QgY3JlYXRlTWFya2VyID0gKCkgPT4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJyk7XG5cbi8qKlxuICogSW5zZXJ0cyBhIENoaWxkUGFydCBpbnRvIHRoZSBnaXZlbiBjb250YWluZXIgQ2hpbGRQYXJ0J3MgRE9NLCBlaXRoZXIgYXQgdGhlXG4gKiBlbmQgb2YgdGhlIGNvbnRhaW5lciBDaGlsZFBhcnQsIG9yIGJlZm9yZSB0aGUgb3B0aW9uYWwgYHJlZlBhcnRgLlxuICpcbiAqIFRoaXMgZG9lcyBub3QgYWRkIHRoZSBwYXJ0IHRvIHRoZSBjb250YWluZXJQYXJ0J3MgY29tbWl0dGVkIHZhbHVlLiBUaGF0IG11c3RcbiAqIGJlIGRvbmUgYnkgY2FsbGVycy5cbiAqXG4gKiBAcGFyYW0gY29udGFpbmVyUGFydCBQYXJ0IHdpdGhpbiB3aGljaCB0byBhZGQgdGhlIG5ldyBDaGlsZFBhcnRcbiAqIEBwYXJhbSByZWZQYXJ0IFBhcnQgYmVmb3JlIHdoaWNoIHRvIGFkZCB0aGUgbmV3IENoaWxkUGFydDsgd2hlbiBvbWl0dGVkIHRoZVxuICogICAgIHBhcnQgYWRkZWQgdG8gdGhlIGVuZCBvZiB0aGUgYGNvbnRhaW5lclBhcnRgXG4gKiBAcGFyYW0gcGFydCBQYXJ0IHRvIGluc2VydCwgb3IgdW5kZWZpbmVkIHRvIGNyZWF0ZSBhIG5ldyBwYXJ0XG4gKi9cbmV4cG9ydCBjb25zdCBpbnNlcnRQYXJ0ID0gKFxuICBjb250YWluZXJQYXJ0OiBDaGlsZFBhcnQsXG4gIHJlZlBhcnQ/OiBDaGlsZFBhcnQsXG4gIHBhcnQ/OiBDaGlsZFBhcnRcbik6IENoaWxkUGFydCA9PiB7XG4gIGNvbnN0IGNvbnRhaW5lciA9IHdyYXAoY29udGFpbmVyUGFydC5fJHN0YXJ0Tm9kZSkucGFyZW50Tm9kZSE7XG5cbiAgY29uc3QgcmVmTm9kZSA9XG4gICAgcmVmUGFydCA9PT0gdW5kZWZpbmVkID8gY29udGFpbmVyUGFydC5fJGVuZE5vZGUgOiByZWZQYXJ0Ll8kc3RhcnROb2RlO1xuXG4gIGlmIChwYXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBzdGFydE5vZGUgPSB3cmFwKGNvbnRhaW5lcikuaW5zZXJ0QmVmb3JlKGNyZWF0ZU1hcmtlcigpLCByZWZOb2RlKTtcbiAgICBjb25zdCBlbmROb2RlID0gd3JhcChjb250YWluZXIpLmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgcmVmTm9kZSk7XG4gICAgcGFydCA9IG5ldyBDaGlsZFBhcnQoXG4gICAgICBzdGFydE5vZGUsXG4gICAgICBlbmROb2RlLFxuICAgICAgY29udGFpbmVyUGFydCxcbiAgICAgIGNvbnRhaW5lclBhcnQub3B0aW9uc1xuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZW5kTm9kZSA9IHdyYXAocGFydC5fJGVuZE5vZGUhKS5uZXh0U2libGluZztcbiAgICBjb25zdCBvbGRQYXJlbnQgPSBwYXJ0Ll8kcGFyZW50O1xuICAgIGNvbnN0IHBhcmVudENoYW5nZWQgPSBvbGRQYXJlbnQgIT09IGNvbnRhaW5lclBhcnQ7XG4gICAgaWYgKHBhcmVudENoYW5nZWQpIHtcbiAgICAgIHBhcnQuXyRyZXBhcmVudERpc2Nvbm5lY3RhYmxlcz8uKGNvbnRhaW5lclBhcnQpO1xuICAgICAgLy8gTm90ZSB0aGF0IGFsdGhvdWdoIGBfJHJlcGFyZW50RGlzY29ubmVjdGFibGVzYCB1cGRhdGVzIHRoZSBwYXJ0J3NcbiAgICAgIC8vIGBfJHBhcmVudGAgcmVmZXJlbmNlIGFmdGVyIHVubGlua2luZyBmcm9tIGl0cyBjdXJyZW50IHBhcmVudCwgdGhhdFxuICAgICAgLy8gbWV0aG9kIG9ubHkgZXhpc3RzIGlmIERpc2Nvbm5lY3RhYmxlcyBhcmUgcHJlc2VudCwgc28gd2UgbmVlZCB0b1xuICAgICAgLy8gdW5jb25kaXRpb25hbGx5IHNldCBpdCBoZXJlXG4gICAgICBwYXJ0Ll8kcGFyZW50ID0gY29udGFpbmVyUGFydDtcbiAgICAgIC8vIFNpbmNlIHRoZSBfJGlzQ29ubmVjdGVkIGdldHRlciBpcyBzb21ld2hhdCBjb3N0bHksIG9ubHlcbiAgICAgIC8vIHJlYWQgaXQgb25jZSB3ZSBrbm93IHRoZSBzdWJ0cmVlIGhhcyBkaXJlY3RpdmVzIHRoYXQgbmVlZFxuICAgICAgLy8gdG8gYmUgbm90aWZpZWRcbiAgICAgIGxldCBuZXdDb25uZWN0aW9uU3RhdGU7XG4gICAgICBpZiAoXG4gICAgICAgIHBhcnQuXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgIChuZXdDb25uZWN0aW9uU3RhdGUgPSBjb250YWluZXJQYXJ0Ll8kaXNDb25uZWN0ZWQpICE9PVxuICAgICAgICAgIG9sZFBhcmVudCEuXyRpc0Nvbm5lY3RlZFxuICAgICAgKSB7XG4gICAgICAgIHBhcnQuXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZChuZXdDb25uZWN0aW9uU3RhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZW5kTm9kZSAhPT0gcmVmTm9kZSB8fCBwYXJlbnRDaGFuZ2VkKSB7XG4gICAgICBsZXQgc3RhcnQ6IE5vZGUgfCBudWxsID0gcGFydC5fJHN0YXJ0Tm9kZTtcbiAgICAgIHdoaWxlIChzdGFydCAhPT0gZW5kTm9kZSkge1xuICAgICAgICBjb25zdCBuOiBOb2RlIHwgbnVsbCA9IHdyYXAoc3RhcnQhKS5uZXh0U2libGluZztcbiAgICAgICAgd3JhcChjb250YWluZXIpLmluc2VydEJlZm9yZShzdGFydCEsIHJlZk5vZGUpO1xuICAgICAgICBzdGFydCA9IG47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhcnQ7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIHZhbHVlIG9mIGEgUGFydC5cbiAqXG4gKiBOb3RlIHRoYXQgdGhpcyBzaG91bGQgb25seSBiZSB1c2VkIHRvIHNldC91cGRhdGUgdGhlIHZhbHVlIG9mIHVzZXItY3JlYXRlZFxuICogcGFydHMgKGkuZS4gdGhvc2UgY3JlYXRlZCB1c2luZyBgaW5zZXJ0UGFydGApOyBpdCBzaG91bGQgbm90IGJlIHVzZWRcbiAqIGJ5IGRpcmVjdGl2ZXMgdG8gc2V0IHRoZSB2YWx1ZSBvZiB0aGUgZGlyZWN0aXZlJ3MgY29udGFpbmVyIHBhcnQuIERpcmVjdGl2ZXNcbiAqIHNob3VsZCByZXR1cm4gYSB2YWx1ZSBmcm9tIGB1cGRhdGVgL2ByZW5kZXJgIHRvIHVwZGF0ZSB0aGVpciBwYXJ0IHN0YXRlLlxuICpcbiAqIEZvciBkaXJlY3RpdmVzIHRoYXQgcmVxdWlyZSBzZXR0aW5nIHRoZWlyIHBhcnQgdmFsdWUgYXN5bmNocm9ub3VzbHksIHRoZXlcbiAqIHNob3VsZCBleHRlbmQgYEFzeW5jRGlyZWN0aXZlYCBhbmQgY2FsbCBgdGhpcy5zZXRWYWx1ZSgpYC5cbiAqXG4gKiBAcGFyYW0gcGFydCBQYXJ0IHRvIHNldFxuICogQHBhcmFtIHZhbHVlIFZhbHVlIHRvIHNldFxuICogQHBhcmFtIGluZGV4IEZvciBgQXR0cmlidXRlUGFydGBzLCB0aGUgaW5kZXggdG8gc2V0XG4gKiBAcGFyYW0gZGlyZWN0aXZlUGFyZW50IFVzZWQgaW50ZXJuYWxseTsgc2hvdWxkIG5vdCBiZSBzZXQgYnkgdXNlclxuICovXG5leHBvcnQgY29uc3Qgc2V0Q2hpbGRQYXJ0VmFsdWUgPSA8VCBleHRlbmRzIENoaWxkUGFydD4oXG4gIHBhcnQ6IFQsXG4gIHZhbHVlOiB1bmtub3duLFxuICBkaXJlY3RpdmVQYXJlbnQ6IERpcmVjdGl2ZVBhcmVudCA9IHBhcnRcbik6IFQgPT4ge1xuICBwYXJ0Ll8kc2V0VmFsdWUodmFsdWUsIGRpcmVjdGl2ZVBhcmVudCk7XG4gIHJldHVybiBwYXJ0O1xufTtcblxuLy8gQSBzZW50aW5lbCB2YWx1ZSB0aGF0IGNhbiBuZXZlciBhcHBlYXIgYXMgYSBwYXJ0IHZhbHVlIGV4Y2VwdCB3aGVuIHNldCBieVxuLy8gbGl2ZSgpLiBVc2VkIHRvIGZvcmNlIGEgZGlydHktY2hlY2sgdG8gZmFpbCBhbmQgY2F1c2UgYSByZS1yZW5kZXIuXG5jb25zdCBSRVNFVF9WQUxVRSA9IHt9O1xuXG4vKipcbiAqIFNldHMgdGhlIGNvbW1pdHRlZCB2YWx1ZSBvZiBhIENoaWxkUGFydCBkaXJlY3RseSB3aXRob3V0IHRyaWdnZXJpbmcgdGhlXG4gKiBjb21taXQgc3RhZ2Ugb2YgdGhlIHBhcnQuXG4gKlxuICogVGhpcyBpcyB1c2VmdWwgaW4gY2FzZXMgd2hlcmUgYSBkaXJlY3RpdmUgbmVlZHMgdG8gdXBkYXRlIHRoZSBwYXJ0IHN1Y2hcbiAqIHRoYXQgdGhlIG5leHQgdXBkYXRlIGRldGVjdHMgYSB2YWx1ZSBjaGFuZ2Ugb3Igbm90LiBXaGVuIHZhbHVlIGlzIG9taXR0ZWQsXG4gKiB0aGUgbmV4dCB1cGRhdGUgd2lsbCBiZSBndWFyYW50ZWVkIHRvIGJlIGRldGVjdGVkIGFzIGEgY2hhbmdlLlxuICpcbiAqIEBwYXJhbSBwYXJ0XG4gKiBAcGFyYW0gdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IHNldENvbW1pdHRlZFZhbHVlID0gKHBhcnQ6IFBhcnQsIHZhbHVlOiB1bmtub3duID0gUkVTRVRfVkFMVUUpID0+XG4gIChwYXJ0Ll8kY29tbWl0dGVkVmFsdWUgPSB2YWx1ZSk7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY29tbWl0dGVkIHZhbHVlIG9mIGEgQ2hpbGRQYXJ0LlxuICpcbiAqIFRoZSBjb21taXR0ZWQgdmFsdWUgaXMgdXNlZCBmb3IgY2hhbmdlIGRldGVjdGlvbiBhbmQgZWZmaWNpZW50IHVwZGF0ZXMgb2ZcbiAqIHRoZSBwYXJ0LiBJdCBjYW4gZGlmZmVyIGZyb20gdGhlIHZhbHVlIHNldCBieSB0aGUgdGVtcGxhdGUgb3IgZGlyZWN0aXZlIGluXG4gKiBjYXNlcyB3aGVyZSB0aGUgdGVtcGxhdGUgdmFsdWUgaXMgdHJhbnNmb3JtZWQgYmVmb3JlIGJlaW5nIGNvbW1pdHRlZC5cbiAqXG4gKiAtIGBUZW1wbGF0ZVJlc3VsdGBzIGFyZSBjb21taXR0ZWQgYXMgYSBgVGVtcGxhdGVJbnN0YW5jZWBcbiAqIC0gSXRlcmFibGVzIGFyZSBjb21taXR0ZWQgYXMgYEFycmF5PENoaWxkUGFydD5gXG4gKiAtIEFsbCBvdGhlciB0eXBlcyBhcmUgY29tbWl0dGVkIGFzIHRoZSB0ZW1wbGF0ZSB2YWx1ZSBvciB2YWx1ZSByZXR1cm5lZCBvclxuICogICBzZXQgYnkgYSBkaXJlY3RpdmUuXG4gKlxuICogQHBhcmFtIHBhcnRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldENvbW1pdHRlZFZhbHVlID0gKHBhcnQ6IENoaWxkUGFydCkgPT4gcGFydC5fJGNvbW1pdHRlZFZhbHVlO1xuXG4vKipcbiAqIFJlbW92ZXMgYSBDaGlsZFBhcnQgZnJvbSB0aGUgRE9NLCBpbmNsdWRpbmcgYW55IG9mIGl0cyBjb250ZW50LlxuICpcbiAqIEBwYXJhbSBwYXJ0IFRoZSBQYXJ0IHRvIHJlbW92ZVxuICovXG5leHBvcnQgY29uc3QgcmVtb3ZlUGFydCA9IChwYXJ0OiBDaGlsZFBhcnQpID0+IHtcbiAgcGFydC5fJG5vdGlmeUNvbm5lY3Rpb25DaGFuZ2VkPy4oZmFsc2UsIHRydWUpO1xuICBsZXQgc3RhcnQ6IENoaWxkTm9kZSB8IG51bGwgPSBwYXJ0Ll8kc3RhcnROb2RlO1xuICBjb25zdCBlbmQ6IENoaWxkTm9kZSB8IG51bGwgPSB3cmFwKHBhcnQuXyRlbmROb2RlISkubmV4dFNpYmxpbmc7XG4gIHdoaWxlIChzdGFydCAhPT0gZW5kKSB7XG4gICAgY29uc3QgbjogQ2hpbGROb2RlIHwgbnVsbCA9IHdyYXAoc3RhcnQhKS5uZXh0U2libGluZztcbiAgICAod3JhcChzdGFydCEpIGFzIENoaWxkTm9kZSkucmVtb3ZlKCk7XG4gICAgc3RhcnQgPSBuO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgY2xlYXJQYXJ0ID0gKHBhcnQ6IENoaWxkUGFydCkgPT4ge1xuICBwYXJ0Ll8kY2xlYXIoKTtcbn07XG4iLCAiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMjAgR29vZ2xlIExMQ1xuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEJTRC0zLUNsYXVzZVxuICovXG5cbmltcG9ydCB7QXR0cmlidXRlUGFydCwgbm9DaGFuZ2UsIG5vdGhpbmd9IGZyb20gJy4uL2xpdC1odG1sLmpzJztcbmltcG9ydCB7XG4gIGRpcmVjdGl2ZSxcbiAgRGlyZWN0aXZlLFxuICBEaXJlY3RpdmVQYXJhbWV0ZXJzLFxuICBQYXJ0SW5mbyxcbiAgUGFydFR5cGUsXG59IGZyb20gJy4uL2RpcmVjdGl2ZS5qcyc7XG5pbXBvcnQge2lzU2luZ2xlRXhwcmVzc2lvbiwgc2V0Q29tbWl0dGVkVmFsdWV9IGZyb20gJy4uL2RpcmVjdGl2ZS1oZWxwZXJzLmpzJztcblxuY2xhc3MgTGl2ZURpcmVjdGl2ZSBleHRlbmRzIERpcmVjdGl2ZSB7XG4gIGNvbnN0cnVjdG9yKHBhcnRJbmZvOiBQYXJ0SW5mbykge1xuICAgIHN1cGVyKHBhcnRJbmZvKTtcbiAgICBpZiAoXG4gICAgICAhKFxuICAgICAgICBwYXJ0SW5mby50eXBlID09PSBQYXJ0VHlwZS5QUk9QRVJUWSB8fFxuICAgICAgICBwYXJ0SW5mby50eXBlID09PSBQYXJ0VHlwZS5BVFRSSUJVVEUgfHxcbiAgICAgICAgcGFydEluZm8udHlwZSA9PT0gUGFydFR5cGUuQk9PTEVBTl9BVFRSSUJVVEVcbiAgICAgIClcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1RoZSBgbGl2ZWAgZGlyZWN0aXZlIGlzIG5vdCBhbGxvd2VkIG9uIGNoaWxkIG9yIGV2ZW50IGJpbmRpbmdzJ1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKCFpc1NpbmdsZUV4cHJlc3Npb24ocGFydEluZm8pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BsaXZlYCBiaW5kaW5ncyBjYW4gb25seSBjb250YWluIGEgc2luZ2xlIGV4cHJlc3Npb24nKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIodmFsdWU6IHVua25vd24pIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBvdmVycmlkZSB1cGRhdGUocGFydDogQXR0cmlidXRlUGFydCwgW3ZhbHVlXTogRGlyZWN0aXZlUGFyYW1ldGVyczx0aGlzPikge1xuICAgIGlmICh2YWx1ZSA9PT0gbm9DaGFuZ2UgfHwgdmFsdWUgPT09IG5vdGhpbmcpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgY29uc3QgZWxlbWVudCA9IHBhcnQuZWxlbWVudDtcbiAgICBjb25zdCBuYW1lID0gcGFydC5uYW1lO1xuXG4gICAgaWYgKHBhcnQudHlwZSA9PT0gUGFydFR5cGUuUFJPUEVSVFkpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICBpZiAodmFsdWUgPT09IChlbGVtZW50IGFzIGFueSlbbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIG5vQ2hhbmdlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocGFydC50eXBlID09PSBQYXJ0VHlwZS5CT09MRUFOX0FUVFJJQlVURSkge1xuICAgICAgaWYgKCEhdmFsdWUgPT09IGVsZW1lbnQuaGFzQXR0cmlidXRlKG5hbWUpKSB7XG4gICAgICAgIHJldHVybiBub0NoYW5nZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHBhcnQudHlwZSA9PT0gUGFydFR5cGUuQVRUUklCVVRFKSB7XG4gICAgICBpZiAoZWxlbWVudC5nZXRBdHRyaWJ1dGUobmFtZSkgPT09IFN0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIG5vQ2hhbmdlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBSZXNldHMgdGhlIHBhcnQncyB2YWx1ZSwgY2F1c2luZyBpdHMgZGlydHktY2hlY2sgdG8gZmFpbCBzbyB0aGF0IGl0XG4gICAgLy8gYWx3YXlzIHNldHMgdGhlIHZhbHVlLlxuICAgIHNldENvbW1pdHRlZFZhbHVlKHBhcnQpO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIENoZWNrcyBiaW5kaW5nIHZhbHVlcyBhZ2FpbnN0IGxpdmUgRE9NIHZhbHVlcywgaW5zdGVhZCBvZiBwcmV2aW91c2x5IGJvdW5kXG4gKiB2YWx1ZXMsIHdoZW4gZGV0ZXJtaW5pbmcgd2hldGhlciB0byB1cGRhdGUgdGhlIHZhbHVlLlxuICpcbiAqIFRoaXMgaXMgdXNlZnVsIGZvciBjYXNlcyB3aGVyZSB0aGUgRE9NIHZhbHVlIG1heSBjaGFuZ2UgZnJvbSBvdXRzaWRlIG9mXG4gKiBsaXQtaHRtbCwgc3VjaCBhcyB3aXRoIGEgYmluZGluZyB0byBhbiBgPGlucHV0PmAgZWxlbWVudCdzIGB2YWx1ZWAgcHJvcGVydHksXG4gKiBhIGNvbnRlbnQgZWRpdGFibGUgZWxlbWVudHMgdGV4dCwgb3IgdG8gYSBjdXN0b20gZWxlbWVudCB0aGF0IGNoYW5nZXMgaXQnc1xuICogb3duIHByb3BlcnRpZXMgb3IgYXR0cmlidXRlcy5cbiAqXG4gKiBJbiB0aGVzZSBjYXNlcyBpZiB0aGUgRE9NIHZhbHVlIGNoYW5nZXMsIGJ1dCB0aGUgdmFsdWUgc2V0IHRocm91Z2ggbGl0LWh0bWxcbiAqIGJpbmRpbmdzIGhhc24ndCwgbGl0LWh0bWwgd29uJ3Qga25vdyB0byB1cGRhdGUgdGhlIERPTSB2YWx1ZSBhbmQgd2lsbCBsZWF2ZVxuICogaXQgYWxvbmUuIElmIHRoaXMgaXMgbm90IHdoYXQgeW91IHdhbnQtLWlmIHlvdSB3YW50IHRvIG92ZXJ3cml0ZSB0aGUgRE9NXG4gKiB2YWx1ZSB3aXRoIHRoZSBib3VuZCB2YWx1ZSBubyBtYXR0ZXIgd2hhdC0tdXNlIHRoZSBgbGl2ZSgpYCBkaXJlY3RpdmU6XG4gKlxuICogYGBganNcbiAqIGh0bWxgPGlucHV0IC52YWx1ZT0ke2xpdmUoeCl9PmBcbiAqIGBgYFxuICpcbiAqIGBsaXZlKClgIHBlcmZvcm1zIGEgc3RyaWN0IGVxdWFsaXR5IGNoZWNrIGFnYWluc3QgdGhlIGxpdmUgRE9NIHZhbHVlLCBhbmQgaWZcbiAqIHRoZSBuZXcgdmFsdWUgaXMgZXF1YWwgdG8gdGhlIGxpdmUgdmFsdWUsIGRvZXMgbm90aGluZy4gVGhpcyBtZWFucyB0aGF0XG4gKiBgbGl2ZSgpYCBzaG91bGQgbm90IGJlIHVzZWQgd2hlbiB0aGUgYmluZGluZyB3aWxsIGNhdXNlIGEgdHlwZSBjb252ZXJzaW9uLiBJZlxuICogeW91IHVzZSBgbGl2ZSgpYCB3aXRoIGFuIGF0dHJpYnV0ZSBiaW5kaW5nLCBtYWtlIHN1cmUgdGhhdCBvbmx5IHN0cmluZ3MgYXJlXG4gKiBwYXNzZWQgaW4sIG9yIHRoZSBiaW5kaW5nIHdpbGwgdXBkYXRlIGV2ZXJ5IHJlbmRlci5cbiAqL1xuZXhwb3J0IGNvbnN0IGxpdmUgPSBkaXJlY3RpdmUoTGl2ZURpcmVjdGl2ZSk7XG5cbi8qKlxuICogVGhlIHR5cGUgb2YgdGhlIGNsYXNzIHRoYXQgcG93ZXJzIHRoaXMgZGlyZWN0aXZlLiBOZWNlc3NhcnkgZm9yIG5hbWluZyB0aGVcbiAqIGRpcmVjdGl2ZSdzIHJldHVybiB0eXBlLlxuICovXG5leHBvcnQgdHlwZSB7TGl2ZURpcmVjdGl2ZX07XG4iLCAiaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHsgUmVzb3VyY2VEZWZpbml0aW9uIH0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXNcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBpY29uIH0gZnJvbSBcIi4uL2ljb25zL2ljb25zXCI7XG5pbXBvcnQgeyBleGVjdXRlT3AgfSBmcm9tIFwiLi4vYWN0aW9uL2V4ZWN1dGVcIjtcbmltcG9ydCB7XG4gIEFkZFJlc291cmNlT3B0aW9uT3AsXG4gIERlbGV0ZVJlc291cmNlT3B0aW9uT3AsXG4gIE1vdmVSZXNvdXJjZU9wdGlvbk9wLFxuICBSZW5hbWVSZXNvdXJjZU9wLFxuICBSZW5hbWVSZXNvdXJjZU9wdGlvbk9wLFxufSBmcm9tIFwiLi4vb3BzL3Jlc291cmNlc1wiO1xuaW1wb3J0IHsgT3AgfSBmcm9tIFwiLi4vb3BzL29wc1wiO1xuaW1wb3J0IHsgUmVzdWx0IH0gZnJvbSBcIi4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgbGl2ZSB9IGZyb20gXCJsaXQtaHRtbC9kaXJlY3RpdmVzL2xpdmUuanNcIjtcblxuZXhwb3J0IGNsYXNzIEVkaXRSZXNvdXJjZURlZmluaXRpb24gZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW4gfCBudWxsID0gbnVsbDtcbiAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb24gPSBuZXcgUmVzb3VyY2VEZWZpbml0aW9uKCk7XG4gIG5hbWU6IHN0cmluZyA9IFwiXCI7XG4gIHBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrOiAoKSA9PiB2b2lkO1xuICBuZXdWYWx1ZUNvdW50ZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfTtcbiAgfVxuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCIsXG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrXG4gICAgKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICBcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCIsXG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrXG4gICAgKTtcbiAgfVxuXG4gIHNob3dNb2RhbChcbiAgICBleHBsYW5NYWluOiBFeHBsYW5NYWluLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICByZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvblxuICApIHtcbiAgICB0aGlzLmV4cGxhbk1haW4gPSBleHBsYW5NYWluO1xuICAgIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uID0gcmVzb3VyY2VEZWZpbml0aW9uO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5zaG93TW9kYWwoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyKCkge1xuICAgIHJlbmRlcih0aGlzLnRlbXBsYXRlKCksIHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBjYW5jZWwoKSB7XG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImRpYWxvZ1wiKSEuY2xvc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZXhlY3V0ZU9wKG9wOiBPcCk6IFByb21pc2U8UmVzdWx0PG51bGw+PiB7XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZU9wKFxuICAgICAgb3AsXG4gICAgICBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLFxuICAgICAgdHJ1ZSxcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiFcbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICB3aW5kb3cuYWxlcnQocmV0LmVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2hhbmdlUmVzb3VyY2VOYW1lKGU6IEV2ZW50LCBuZXdOYW1lOiBzdHJpbmcsIG9sZE5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IHRoaXMuZXhlY3V0ZU9wKFJlbmFtZVJlc291cmNlT3Aob2xkTmFtZSwgbmV3TmFtZSkpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICB3aW5kb3cuYWxlcnQocmV0LmVycm9yKTtcbiAgICAgIHRoaXMubmFtZSA9IG9sZE5hbWU7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cbiAgICB0aGlzLm5hbWUgPSBuZXdOYW1lO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBjaGFuZ2VSZXNvdXJjZVZhbHVlTmFtZShcbiAgICBlOiBFdmVudCxcbiAgICBuZXdWYWx1ZTogc3RyaW5nLFxuICAgIG9sZFZhbHVlOiBzdHJpbmdcbiAgKSB7XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5leGVjdXRlT3AoXG4gICAgICBSZW5hbWVSZXNvdXJjZU9wdGlvbk9wKHRoaXMubmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKVxuICAgICk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHdpbmRvdy5hbGVydChyZXQuZXJyb3IpO1xuICAgICAgKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlID0gb2xkVmFsdWU7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2V0UHJvcG9zZWRSZXNvdXJjZU5hbWUoKTogc3RyaW5nIHtcbiAgICB0aGlzLm5ld1ZhbHVlQ291bnRlcisrO1xuICAgIHJldHVybiBgTmV3IFZhbHVlICR7dGhpcy5uZXdWYWx1ZUNvdW50ZXJ9YDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbmV3UmVzb3VyY2VWYWx1ZSgpIHtcbiAgICB0aGlzLm5ld1ZhbHVlQ291bnRlciA9IDA7XG4gICAgLy8gQ29tZSB1cCB3aXRoIGEgdW5pcXVlIG5hbWUgdG8gYWRkLCBzaW5jZSBhbGwgcmVzb3VyY2UgdmFsdWVzIG11c3QgYmVcbiAgICAvLyB1bmlxdWUgZm9yIGEgZ2l2ZW4gcmVzb3VyY2UgbmFtZS5cbiAgICBsZXQgbmV3UmVzb3VyY2VOYW1lID0gdGhpcy5nZXRQcm9wb3NlZFJlc291cmNlTmFtZSgpO1xuICAgIHdoaWxlIChcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiEucGxhbi5yZXNvdXJjZURlZmluaXRpb25zW3RoaXMubmFtZV0udmFsdWVzLmZpbmRJbmRleChcbiAgICAgICAgKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlID09PSBuZXdSZXNvdXJjZU5hbWVcbiAgICAgICkgIT0gLTFcbiAgICApIHtcbiAgICAgIG5ld1Jlc291cmNlTmFtZSA9IHRoaXMuZ2V0UHJvcG9zZWRSZXNvdXJjZU5hbWUoKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGVPcChBZGRSZXNvdXJjZU9wdGlvbk9wKHRoaXMubmFtZSwgbmV3UmVzb3VyY2VOYW1lKSk7XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyBtb3ZlVXAodmFsdWU6IHN0cmluZywgdmFsdWVJbmRleDogbnVtYmVyKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoXG4gICAgICBNb3ZlUmVzb3VyY2VPcHRpb25PcCh0aGlzLm5hbWUsIHZhbHVlSW5kZXgsIHZhbHVlSW5kZXggLSAxKVxuICAgICk7XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyBtb3ZlRG93bih2YWx1ZTogc3RyaW5nLCB2YWx1ZUluZGV4OiBudW1iZXIpIHtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGVPcChcbiAgICAgIE1vdmVSZXNvdXJjZU9wdGlvbk9wKHRoaXMubmFtZSwgdmFsdWVJbmRleCwgdmFsdWVJbmRleCArIDEpXG4gICAgKTtcbiAgfVxuICBwcml2YXRlIGFzeW5jIG1vdmVUb1RvcCh2YWx1ZTogc3RyaW5nLCB2YWx1ZUluZGV4OiBudW1iZXIpIHtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGVPcChNb3ZlUmVzb3VyY2VPcHRpb25PcCh0aGlzLm5hbWUsIHZhbHVlSW5kZXgsIDApKTtcbiAgfVxuICBwcml2YXRlIGFzeW5jIG1vdmVUb0JvdHRvbSh2YWx1ZTogc3RyaW5nLCB2YWx1ZUluZGV4OiBudW1iZXIpIHtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGVPcChcbiAgICAgIE1vdmVSZXNvdXJjZU9wdGlvbk9wKFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgIHZhbHVlSW5kZXgsXG4gICAgICAgIHRoaXMuZXhwbGFuTWFpbiEucGxhbi5yZXNvdXJjZURlZmluaXRpb25zW3RoaXMubmFtZV0hLnZhbHVlcy5sZW5ndGggLSAxXG4gICAgICApXG4gICAgKTtcbiAgfVxuICBwcml2YXRlIGFzeW5jIGRlbGV0ZVJlc291cmNlVmFsdWUodmFsdWU6IHN0cmluZywgdmFsdWVJbmRleDogbnVtYmVyKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoRGVsZXRlUmVzb3VyY2VPcHRpb25PcCh0aGlzLm5hbWUsIHZhbHVlKSk7XG4gIH1cblxuICBwcml2YXRlIHRlbXBsYXRlKCk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxkaWFsb2c+XG4gICAgICAgIDxsYWJlbD5cbiAgICAgICAgICBOYW1lOlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgLnZhbHVlPSR7bGl2ZSh0aGlzLm5hbWUpfVxuICAgICAgICAgICAgZGF0YS1vbGQtbmFtZT0ke3RoaXMubmFtZX1cbiAgICAgICAgICAgIEBjaGFuZ2U9JHsoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VSZXNvdXJjZU5hbWUoZSwgZWxlLnZhbHVlLCBlbGUuZGF0YXNldC5vbGROYW1lIHx8IFwiXCIpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8dGFibGU+XG4gICAgICAgICAgJHt0aGlzLnJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMubWFwKFxuICAgICAgICAgICAgKHZhbHVlOiBzdHJpbmcsIHZhbHVlSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gaHRtbGA8dHI+XG4gICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIGRhdGEtb2xkLXZhbHVlPSR7dmFsdWV9XG4gICAgICAgICAgICAgICAgICAgIEBjaGFuZ2U9JHsoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGUgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlUmVzb3VyY2VWYWx1ZU5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlLmRhdGFzZXQub2xkVmFsdWUgfHwgXCJcIlxuICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUodmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBAY2xpY2s9JHsoKSA9PiB0aGlzLm1vdmVVcCh2YWx1ZSwgdmFsdWVJbmRleCl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAuZGlzYWJsZWQ9JHt2YWx1ZUluZGV4ID09PSAwfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAke2ljb24oXCJrZXlib2FyZC11cC1pY29uXCIpfVxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIC5kaXNhYmxlZD0ke3ZhbHVlSW5kZXggPT09XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlcy5sZW5ndGggLSAxfVxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5tb3ZlRG93bih2YWx1ZSwgdmFsdWVJbmRleCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICR7aWNvbihcImtleWJvYXJkLWRvd24taWNvblwiKX1cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAuZGlzYWJsZWQ9JHt2YWx1ZUluZGV4ID09PVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHRoaXMubW92ZVRvQm90dG9tKHZhbHVlLCB2YWx1ZUluZGV4KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgJHtpY29uKFwia2V5Ym9hcmQtZG91YmxlLWRvd24taWNvblwiKX1cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAuZGlzYWJsZWQ9JHt2YWx1ZUluZGV4ID09PSAwfVxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5tb3ZlVG9Ub3AodmFsdWUsIHZhbHVlSW5kZXgpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAke2ljb24oXCJrZXlib2FyZC1kb3VibGUtdXAtaWNvblwiKX1cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAuZGlzYWJsZWQ9JHt0aGlzLnJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoID09PSAxfVxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5kZWxldGVSZXNvdXJjZVZhbHVlKHZhbHVlLCB2YWx1ZUluZGV4KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgJHtpY29uKFwiZGVsZXRlLWljb25cIil9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICA8L3RyPmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgQGNsaWNrPSR7KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy5uZXdSZXNvdXJjZVZhbHVlKCk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIE5ld1xuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPGRpdiBjbGFzcz1cImRpYWxvZy1mb290ZXJcIj5cbiAgICAgICAgICA8YnV0dG9uIEBjbGljaz0keygpID0+IHRoaXMuY2FuY2VsKCl9PkNsb3NlPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaWFsb2c+XG4gICAgYDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJlZGl0LXJlc291cmNlLWRlZmluaXRpb25cIiwgRWRpdFJlc291cmNlRGVmaW5pdGlvbik7XG4iLCAiLy8gVXRpbGl0aWVzIGZvciBkZWFsaW5nIHdpdGggYSByYW5nZSBvZiBudW1iZXJzLlxuXG5leHBvcnQgaW50ZXJmYWNlIE1ldHJpY1JhbmdlU2VyaWFsaXplZCB7XG4gIG1pbjogbnVtYmVyO1xuICBtYXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNvbnN0IGRpc3BsYXlWYWx1ZSA9ICh4OiBudW1iZXIpOiBzdHJpbmcgPT4ge1xuICBpZiAoeCA9PT0gTnVtYmVyLk1BWF9WQUxVRSkge1xuICAgIHJldHVybiBcIihtYXggZmxvYXQpXCI7XG4gIH0gZWxzZSBpZiAoeCA9PT0gLU51bWJlci5NQVhfVkFMVUUpIHtcbiAgICByZXR1cm4gXCIobWluIGZsb2F0KVwiO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB4LnRvU3RyaW5nKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjbGFtcCA9ICh4OiBudW1iZXIsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciA9PiB7XG4gIGlmICh4ID4gbWF4KSB7XG4gICAgcmV0dXJuIG1heDtcbiAgfVxuICBpZiAoeCA8IG1pbikge1xuICAgIHJldHVybiBtaW47XG4gIH1cbiAgcmV0dXJuIHg7XG59O1xuXG4vLyBSYW5nZSBkZWZpbmVzIGEgcmFuZ2Ugb2YgbnVtYmVycywgZnJvbSBbbWluLCBtYXhdIGluY2x1c2l2ZS5cbmV4cG9ydCBjbGFzcyBNZXRyaWNSYW5nZSB7XG4gIHByaXZhdGUgX21pbjogbnVtYmVyID0gLU51bWJlci5NQVhfVkFMVUU7XG4gIHByaXZhdGUgX21heDogbnVtYmVyID0gTnVtYmVyLk1BWF9WQUxVRTtcblxuICBjb25zdHJ1Y3RvcihtaW46IG51bWJlciA9IC1OdW1iZXIuTUFYX1ZBTFVFLCBtYXg6IG51bWJlciA9IE51bWJlci5NQVhfVkFMVUUpIHtcbiAgICBpZiAobWF4IDwgbWluKSB7XG4gICAgICBbbWluLCBtYXhdID0gW21heCwgbWluXTtcbiAgICB9XG4gICAgdGhpcy5fbWluID0gbWluO1xuICAgIHRoaXMuX21heCA9IG1heDtcbiAgfVxuXG4gIGNsYW1wKHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBjbGFtcCh2YWx1ZSwgdGhpcy5fbWluLCB0aGlzLl9tYXgpO1xuICB9XG5cbiAgcHVibGljIGdldCBtaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fbWluO1xuICB9XG5cbiAgcHVibGljIGdldCBtYXgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4O1xuICB9XG5cbiAgdG9KU09OKCk6IE1ldHJpY1JhbmdlU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1pbjogdGhpcy5fbWluLFxuICAgICAgbWF4OiB0aGlzLl9tYXgsXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBGcm9tSlNPTihzOiBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQgfCB1bmRlZmluZWQpOiBNZXRyaWNSYW5nZSB7XG4gICAgaWYgKHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBNZXRyaWNSYW5nZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IE1ldHJpY1JhbmdlKHMubWluLCBzLm1heCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBSb3VuZGVyIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJlY2lzaW9uU2VyaWFsaXplZCB7XG4gIHByZWNpc2lvbjogbnVtYmVyO1xufVxuZXhwb3J0IGNsYXNzIFByZWNpc2lvbiB7XG4gIHByaXZhdGUgX3ByZWNpc2lvbjogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByZWNpc2lvbjogbnVtYmVyID0gMCkge1xuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHByZWNpc2lvbikpIHtcbiAgICAgIHByZWNpc2lvbiA9IDA7XG4gICAgfVxuICAgIHRoaXMuX3ByZWNpc2lvbiA9IE1hdGguYWJzKE1hdGgudHJ1bmMocHJlY2lzaW9uKSk7XG4gIH1cblxuICByb3VuZCh4OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiAreC50b0ZpeGVkKHRoaXMuX3ByZWNpc2lvbik7XG4gIH1cblxuICByb3VuZGVyKCk6IFJvdW5kZXIge1xuICAgIHJldHVybiAoeDogbnVtYmVyKTogbnVtYmVyID0+IHRoaXMucm91bmQoeCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHByZWNpc2lvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9wcmVjaXNpb247XG4gIH1cblxuICB0b0pTT04oKTogUHJlY2lzaW9uU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByZWNpc2lvbjogdGhpcy5fcHJlY2lzaW9uLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogUHJlY2lzaW9uU2VyaWFsaXplZCB8IHVuZGVmaW5lZCk6IFByZWNpc2lvbiB7XG4gICAgaWYgKHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5ldyBQcmVjaXNpb24oKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcmVjaXNpb24ocy5wcmVjaXNpb24pO1xuICB9XG59XG4iLCAiLy8gTWV0cmljcyBkZWZpbmUgZmxvYXRpbmcgcG9pbnQgdmFsdWVzIHRoYXQgYXJlIHRyYWNrZWQgcGVyIFRhc2suXG5cbmltcG9ydCB7IFByZWNpc2lvbiwgUHJlY2lzaW9uU2VyaWFsaXplZCB9IGZyb20gXCIuLi9wcmVjaXNpb24vcHJlY2lzaW9uLnRzXCI7XG5pbXBvcnQgeyBjbGFtcCwgTWV0cmljUmFuZ2UsIE1ldHJpY1JhbmdlU2VyaWFsaXplZCB9IGZyb20gXCIuL3JhbmdlLnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICByYW5nZTogTWV0cmljUmFuZ2VTZXJpYWxpemVkO1xuICBkZWZhdWx0OiBudW1iZXI7XG4gIHByZWNpc2lvbjogUHJlY2lzaW9uU2VyaWFsaXplZDtcbn1cblxuZXhwb3J0IGNsYXNzIE1ldHJpY0RlZmluaXRpb24ge1xuICByYW5nZTogTWV0cmljUmFuZ2U7XG4gIGRlZmF1bHQ6IG51bWJlcjtcbiAgaXNTdGF0aWM6IGJvb2xlYW47XG4gIHByZWNpc2lvbjogUHJlY2lzaW9uO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGRlZmF1bHRWYWx1ZTogbnVtYmVyLFxuICAgIHJhbmdlOiBNZXRyaWNSYW5nZSA9IG5ldyBNZXRyaWNSYW5nZSgpLFxuICAgIGlzU3RhdGljOiBib29sZWFuID0gZmFsc2UsXG4gICAgcHJlY2lzaW9uOiBQcmVjaXNpb24gPSBuZXcgUHJlY2lzaW9uKDEpXG4gICkge1xuICAgIHRoaXMucHJlY2lzaW9uID0gcHJlY2lzaW9uO1xuICAgIHRoaXMucmFuZ2UgPSByYW5nZTtcbiAgICB0aGlzLmRlZmF1bHQgPSBkZWZhdWx0VmFsdWU7XG4gICAgdGhpcy5pc1N0YXRpYyA9IGlzU3RhdGljO1xuICAgIHRoaXMucmF0aW9uYWxpemUoKTtcbiAgfVxuXG4gIHJhdGlvbmFsaXplKCkge1xuICAgIC8vIG1pbiBhbmQgbWF4IHNob3VsZCBiZSByb3VuZGVkIHRvIHByZWNpc2lvbiBmaXJzdC4gYW5kIHRoZW4gY2xhbXAgYW5kXG4gICAgLy8gcHJlY2lzaW9uIGFwcGxpZWQgdG8gdGhlIGRlZmF1bHQuXG4gICAgdGhpcy5yYW5nZSA9IG5ldyBNZXRyaWNSYW5nZShcbiAgICAgIHRoaXMucHJlY2lzaW9uLnJvdW5kKHRoaXMucmFuZ2UubWluKSxcbiAgICAgIHRoaXMucHJlY2lzaW9uLnJvdW5kKHRoaXMucmFuZ2UubWF4KVxuICAgICk7XG4gICAgLy8gbWluIGFuZCBtYXggc2hvdWxkIGJlIHJvdW5kZWQgdG8gcHJlY2lzaW9uIGZpcnN0LiBhbmQgdGhlbiBjbGFtcCBhbmRcbiAgICAvLyBwcmVjaXNpb24gYXBwbGllZCB0byB0aGUgZGVmYXVsdC5cbiAgICB0aGlzLmRlZmF1bHQgPSB0aGlzLmNsYW1wQW5kUm91bmQodGhpcy5kZWZhdWx0KTtcbiAgfVxuXG4gIGNsYW1wQW5kUm91bmQoeDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5wcmVjaXNpb24ucm91bmQodGhpcy5yYW5nZS5jbGFtcCh4KSk7XG4gIH1cblxuICB0b0pTT04oKTogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICByYW5nZTogdGhpcy5yYW5nZS50b0pTT04oKSxcbiAgICAgIGRlZmF1bHQ6IHRoaXMuZGVmYXVsdCxcbiAgICAgIHByZWNpc2lvbjogdGhpcy5wcmVjaXNpb24udG9KU09OKCksXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBGcm9tSlNPTihzOiBNZXRyaWNEZWZpbml0aW9uU2VyaWFsaXplZCB8IHVuZGVmaW5lZCk6IE1ldHJpY0RlZmluaXRpb24ge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgTWV0cmljRGVmaW5pdGlvbigwKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBNZXRyaWNEZWZpbml0aW9uKFxuICAgICAgcy5kZWZhdWx0IHx8IDAsXG4gICAgICBNZXRyaWNSYW5nZS5Gcm9tSlNPTihzLnJhbmdlKSxcbiAgICAgIGZhbHNlLFxuICAgICAgUHJlY2lzaW9uLkZyb21KU09OKHMucHJlY2lzaW9uKVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgTWV0cmljRGVmaW5pdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IE1ldHJpY0RlZmluaXRpb24gfTtcblxuZXhwb3J0IHR5cGUgTWV0cmljRGVmaW5pdGlvbnNTZXJpYWxpemVkID0ge1xuICBba2V5OiBzdHJpbmddOiBNZXRyaWNEZWZpbml0aW9uU2VyaWFsaXplZDtcbn07XG5cbmV4cG9ydCB0eXBlIE1ldHJpY1ZhbHVlcyA9IHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH07XG4iLCAiaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IGljb24gfSBmcm9tIFwiLi4vaWNvbnMvaWNvbnNcIjtcbmltcG9ydCB7IGRpc3BsYXlWYWx1ZSB9IGZyb20gXCIuLi9tZXRyaWNzL3JhbmdlXCI7XG5pbXBvcnQgeyBleGVjdXRlT3AgfSBmcm9tIFwiLi4vYWN0aW9uL2V4ZWN1dGVcIjtcbmltcG9ydCB7IEFkZE1ldHJpY09wLCBEZWxldGVNZXRyaWNPcCB9IGZyb20gXCIuLi9vcHMvbWV0cmljc1wiO1xuaW1wb3J0IHsgTWV0cmljRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3NcIjtcbmltcG9ydCB7IEVkaXRNZXRyaWNEZWZpbml0aW9uIH0gZnJvbSBcIi4uL2VkaXQtbWV0cmljLWRlZmluaXRpb24vZWRpdC1tZXRyaWMtZGVmaW5pdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgRWRpdE1ldHJpY3NEaWFsb2cgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW4gfCBudWxsID0gbnVsbDtcbiAgcGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2s6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuZXhwbGFuTWFpbiAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlcigpIHtcbiAgICByZW5kZXIodGhpcy50ZW1wbGF0ZSgpLCB0aGlzKTtcbiAgfVxuXG4gIHNob3dNb2RhbChleHBsYW5NYWluOiBFeHBsYW5NYWluKSB7XG4gICAgdGhpcy5leHBsYW5NYWluID0gZXhwbGFuTWFpbjtcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLnNob3dNb2RhbCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBjYW5jZWwoKSB7XG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImRpYWxvZ1wiKSEuY2xvc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGNvbnN0IG1kID0gdGhpcy5leHBsYW5NYWluIS5wbGFuLm1ldHJpY0RlZmluaXRpb25zO1xuICAgIGNvbnN0IGFsbEtleXNTb3J0ZWQgPSBPYmplY3Qua2V5cyhtZCkuc29ydChcbiAgICAgIChrZXlBOiBzdHJpbmcsIGtleUI6IHN0cmluZyk6IG51bWJlciA9PiB7XG4gICAgICAgIGNvbnN0IGEgPSBtZFtrZXlBXTtcbiAgICAgICAgY29uc3QgYiA9IG1kW2tleUJdO1xuICAgICAgICBpZiAoYS5pc1N0YXRpYyA9PT0gYi5pc1N0YXRpYykge1xuICAgICAgICAgIHJldHVybiBrZXlBLmxvY2FsZUNvbXBhcmUoa2V5Qik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGEuaXNTdGF0aWMpIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgKTtcbiAgICByZXR1cm4gaHRtbGAgPGRpYWxvZz5cbiAgICAgIDx0YWJsZT5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgICAgICA8dGg+TWluPC90aD5cbiAgICAgICAgICA8dGg+TWF4PC90aD5cbiAgICAgICAgICA8dGg+RGVmYXVsdDwvdGg+XG4gICAgICAgICAgPHRoPjwvdGg+XG4gICAgICAgICAgPHRoPjwvdGg+XG4gICAgICAgIDwvdHI+XG5cbiAgICAgICAgJHthbGxLZXlzU29ydGVkLm1hcCgobWV0cmljTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgY29uc3QgbWV0cmljRGVmbiA9XG4gICAgICAgICAgICB0aGlzLmV4cGxhbk1haW4hLnBsYW4ubWV0cmljRGVmaW5pdGlvbnNbbWV0cmljTmFtZV07XG4gICAgICAgICAgcmV0dXJuIGh0bWxgXG4gICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgIDx0ZD4ke21ldHJpY05hbWV9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPiR7ZGlzcGxheVZhbHVlKG1ldHJpY0RlZm4ucmFuZ2UubWluKX08L3RkPlxuICAgICAgICAgICAgICA8dGQ+JHtkaXNwbGF5VmFsdWUobWV0cmljRGVmbi5yYW5nZS5tYXgpfTwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD4ke21ldHJpY0RlZm4uZGVmYXVsdH08L3RkPlxuICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgJHt0aGlzLmRlbEJ1dHRvbklmTm90U3RhdGljKG1ldHJpY05hbWUsIG1ldHJpY0RlZm4uaXNTdGF0aWMpfVxuICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgJHt0aGlzLmVkaXRCdXR0b25JZk5vdFN0YXRpYyhtZXRyaWNOYW1lLCBtZXRyaWNEZWZuLmlzU3RhdGljKX1cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgYDtcbiAgICAgICAgfSl9XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGNsYXNzPVwiaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgICB0aXRsZT1cIkFkZCBhIG5ldyBSZXNvdXJjZS5cIlxuICAgICAgICAgICAgICBAY2xpY2s9JHsoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXdNZXRyaWMoKTtcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgJHtpY29uKFwiYWRkLWljb25cIil9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgPC90YWJsZT5cbiAgICAgIDxkaXYgY2xhc3M9XCJkaWFsb2ctZm9vdGVyXCI+XG4gICAgICAgIDxidXR0b24gQGNsaWNrPSR7KCkgPT4gdGhpcy5jYW5jZWwoKX0+Q2xvc2U8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGlhbG9nPmA7XG4gIH1cblxuICBwcml2YXRlIGRlbEJ1dHRvbklmTm90U3RhdGljKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBpc1N0YXRpYzogYm9vbGVhblxuICApOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgaWYgKGlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gaHRtbGBgO1xuICAgIH1cbiAgICByZXR1cm4gaHRtbGA8YnV0dG9uXG4gICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgIHRpdGxlPVwiRGVsZXRlIHRoaXMgbWV0cmljLlwiXG4gICAgICBAY2xpY2s9JHsoKSA9PiB0aGlzLmRlbGV0ZU1ldHJpYyhuYW1lKX1cbiAgICA+XG4gICAgICAke2ljb24oXCJkZWxldGUtaWNvblwiKX1cbiAgICA8L2J1dHRvbj5gO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBkZWxldGVNZXRyaWMobmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZU9wKFxuICAgICAgRGVsZXRlTWV0cmljT3AobmFtZSksXG4gICAgICBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLFxuICAgICAgdHJ1ZSxcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiFcbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSBlZGl0QnV0dG9uSWZOb3RTdGF0aWMoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGlzU3RhdGljOiBib29sZWFuXG4gICk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBpZiAoaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBodG1sYGA7XG4gICAgfVxuICAgIHJldHVybiBodG1sYDxidXR0b25cbiAgICAgIGNsYXNzPVwiaWNvbi1idXR0b25cIlxuICAgICAgdGl0bGU9XCJFZGl0IHRoZSByZXNvdXJjZSBkZWZpbml0aW9uLlwiXG4gICAgICBAY2xpY2s9JHsoKSA9PiB0aGlzLmVkaXRNZXRyaWMobmFtZSl9XG4gICAgPlxuICAgICAgJHtpY29uKFwiZWRpdC1pY29uXCIpfVxuICAgIDwvYnV0dG9uPmA7XG4gIH1cblxuICBwcml2YXRlIGVkaXRNZXRyaWMobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5jYW5jZWwoKTtcbiAgICB0aGlzLmV4cGxhbk1haW4hLnF1ZXJ5U2VsZWN0b3I8RWRpdE1ldHJpY0RlZmluaXRpb24+KFxuICAgICAgXCJlZGl0LW1ldHJpYy1kZWZpbml0aW9uXCJcbiAgICApIS5zaG93TW9kYWwodGhpcy5leHBsYW5NYWluISwgbmFtZSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG5ld01ldHJpYygpIHtcbiAgICBjb25zdCBuYW1lID0gd2luZG93LnByb21wdChcIk1ldHJpYyBuYW1lOlwiLCBcIlwiKTtcbiAgICBpZiAobmFtZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBhd2FpdCBleGVjdXRlT3AoXG4gICAgICBBZGRNZXRyaWNPcChuYW1lLCBuZXcgTWV0cmljRGVmaW5pdGlvbigwKSksXG4gICAgICBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLFxuICAgICAgdHJ1ZSxcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiFcbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICB3aW5kb3cuYWxlcnQocmV0LmVycm9yKTtcbiAgICAgIGNvbnNvbGUubG9nKHJldC5lcnJvcik7XG4gICAgfVxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwiZWRpdC1tZXRyaWNzLWRpYWxvZ1wiLCBFZGl0TWV0cmljc0RpYWxvZyk7XG4iLCAiaW1wb3J0IHsgUmVzdWx0IH0gZnJvbSBcIi4uL3Jlc3VsdFwiO1xuXG4vLyBEaXNwbGF5cyB0aGUgZ2l2ZW4gZXJyb3IuXG4vLyBUT0RPIC0gTWFrZSB0aGlzIGEgcG9wLXVwIG9yIHNvbWV0aGluZy5cbmV4cG9ydCBjb25zdCByZXBvcnRFcnJvciA9IChlcnJvcjogRXJyb3IpID0+IHtcbiAgY29uc29sZS5sb2coZXJyb3IpO1xufTtcblxuLy8gUmVwb3J0cyB0aGUgZXJyb3IgaWYgdGhlIGdpdmVuIFJlc3VsdCBpcyBub3Qgb2suXG5leHBvcnQgY29uc3QgcmVwb3J0T25FcnJvciA9IDxUPihyZXQ6IFJlc3VsdDxUPikgPT4ge1xuICBpZiAoIXJldC5vaykge1xuICAgIHJlcG9ydEVycm9yKHJldC5lcnJvcik7XG4gIH1cbn07XG4iLCAiaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IGxpdmUgfSBmcm9tIFwibGl0LWh0bWwvZGlyZWN0aXZlcy9saXZlLmpzXCI7XG5pbXBvcnQgeyBNZXRyaWNSYW5nZSwgZGlzcGxheVZhbHVlIH0gZnJvbSBcIi4uL21ldHJpY3MvcmFuZ2VcIjtcbmltcG9ydCB7IFJlbmFtZU1ldHJpY09wLCBVcGRhdGVNZXRyaWNPcCB9IGZyb20gXCIuLi9vcHMvbWV0cmljc1wiO1xuaW1wb3J0IHsgTWV0cmljRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3NcIjtcbmltcG9ydCB7IFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHRcIjtcbmltcG9ydCB7IE9wIH0gZnJvbSBcIi4uL29wcy9vcHNcIjtcbmltcG9ydCB7IGV4ZWN1dGVPcCB9IGZyb20gXCIuLi9hY3Rpb24vZXhlY3V0ZVwiO1xuaW1wb3J0IHsgcmVwb3J0RXJyb3IgfSBmcm9tIFwiLi4vcmVwb3J0LWVycm9yL3JlcG9ydC1lcnJvclwiO1xuaW1wb3J0IHsgUHJlY2lzaW9uIH0gZnJvbSBcIi4uL3ByZWNpc2lvbi9wcmVjaXNpb25cIjtcblxuZXhwb3J0IGNsYXNzIEVkaXRNZXRyaWNEZWZpbml0aW9uIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBleHBsYW5NYWluOiBFeHBsYW5NYWluIHwgbnVsbCA9IG51bGw7XG4gIG1ldHJpY05hbWU6IHN0cmluZyA9IFwiXCI7XG4gIHBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfTtcbiAgfVxuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCIsXG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrXG4gICAgKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICBcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCIsXG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyKCkge1xuICAgIHJlbmRlcih0aGlzLnRlbXBsYXRlKCksIHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSB0ZW1wbGF0ZSgpOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgY29uc3QgZGVmbiA9IHRoaXMuZXhwbGFuTWFpbj8ucGxhbi5tZXRyaWNEZWZpbml0aW9uc1t0aGlzLm1ldHJpY05hbWVdO1xuICAgIGlmICghZGVmbikge1xuICAgICAgcmV0dXJuIGh0bWxgYDtcbiAgICB9XG4gICAgcmV0dXJuIGh0bWxgPGRpYWxvZz5cbiAgICAgIDx0YWJsZT5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgLnZhbHVlPSR7bGl2ZSh0aGlzLm1ldHJpY05hbWUpfVxuICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB0aGlzLm5hbWVDaGFuZ2UoZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+TWluPC90aD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgLnZhbHVlPSR7bGl2ZShkaXNwbGF5VmFsdWUoZGVmbi5yYW5nZS5taW4pKX1cbiAgICAgICAgICAgICAgP2Rpc2FibGVkPSR7ZGVmbi5yYW5nZS5taW4gPT09IC1OdW1iZXIuTUFYX1ZBTFVFfVxuICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB0aGlzLm1pbkNoYW5nZShlKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgP2NoZWNrZWQ9JHtkZWZuLnJhbmdlLm1pbiAhPT0gLU51bWJlci5NQVhfVkFMVUV9XG4gICAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy5taW5MaW1pdENoYW5nZShlKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICBMaW1pdDwvbGFiZWxcbiAgICAgICAgICAgID5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPk1heDwvdGg+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUoZGlzcGxheVZhbHVlKGRlZm4ucmFuZ2UubWF4KSl9XG4gICAgICAgICAgICAgID9kaXNhYmxlZD0ke2RlZm4ucmFuZ2UubWF4ID09PSBOdW1iZXIuTUFYX1ZBTFVFfVxuICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB0aGlzLm1heENoYW5nZShlKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgP2NoZWNrZWQ9JHtkZWZuLnJhbmdlLm1heCAhPT0gTnVtYmVyLk1BWF9WQUxVRX1cbiAgICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICB0aGlzLm1heExpbWl0Q2hhbmdlKGUpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIExpbWl0PC9sYWJlbFxuICAgICAgICAgICAgPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+UHJlY2lzaW9uPC90aD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgLnZhbHVlPSR7bGl2ZShkZWZuLnByZWNpc2lvbi5wcmVjaXNpb24pfVxuICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVjaXNpb25DaGFuZ2UoZSk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+RGVmYXVsdDwvdGg+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUoZGVmbi5kZWZhdWx0KX1cbiAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVmYXVsdENoYW5nZShlKTtcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgICA8ZGl2IGNsYXNzPVwiZGlhbG9nLWZvb3RlclwiPlxuICAgICAgICA8YnV0dG9uIEBjbGljaz0keygpID0+IHRoaXMuY2FuY2VsKCl9PkNsb3NlPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2RpYWxvZz5gO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBleGVjdXRlT3Aob3A6IE9wKTogUHJvbWlzZTxSZXN1bHQ8bnVsbD4+IHtcbiAgICBjb25zdCByZXQgPSBhd2FpdCBleGVjdXRlT3AoXG4gICAgICBvcCxcbiAgICAgIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCIsXG4gICAgICB0cnVlLFxuICAgICAgdGhpcy5leHBsYW5NYWluIVxuICAgICk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHdpbmRvdy5hbGVydChyZXQuZXJyb3IpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBtaW5MaW1pdENoYW5nZShlOiBFdmVudCkge1xuICAgIGNvbnN0IGVsZSA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgY29uc3QgZGVmbiA9IHRoaXMuZ2V0RGVmaW5pdGlvbkNvcHkoKTtcbiAgICBpZiAoZWxlLmNoZWNrZWQpIHtcbiAgICAgIGNvbnN0IG5ld01pbiA9IDAgPCBkZWZuLnJhbmdlLm1heCA/IDAgOiBkZWZuLnJhbmdlLm1heCAtIDE7XG4gICAgICBkZWZuLnJhbmdlID0gbmV3IE1ldHJpY1JhbmdlKG5ld01pbiwgZGVmbi5yYW5nZS5tYXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZuLnJhbmdlID0gbmV3IE1ldHJpY1JhbmdlKC1OdW1iZXIuTUFYX1ZBTFVFLCBkZWZuLnJhbmdlLm1heCk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlTWV0cmljRGVmaW5pdGlvbihkZWZuKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWF4TGltaXRDaGFuZ2UoZTogRXZlbnQpIHtcbiAgICBjb25zdCBlbGUgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IGRlZm4gPSB0aGlzLmdldERlZmluaXRpb25Db3B5KCk7XG4gICAgaWYgKGVsZS5jaGVja2VkKSB7XG4gICAgICBjb25zdCBuZXdNYXggPSAxMDAgPiBkZWZuLnJhbmdlLm1pbiA/IDEwMCA6IGRlZm4ucmFuZ2UubWluICsgMTtcbiAgICAgIGRlZm4ucmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoZGVmbi5yYW5nZS5taW4sIG5ld01heCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlZm4ucmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoZGVmbi5yYW5nZS5taW4sIE51bWJlci5NQVhfVkFMVUUpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZU1ldHJpY0RlZmluaXRpb24oZGVmbik7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG5hbWVDaGFuZ2UoZTogRXZlbnQpIHtcbiAgICBjb25zdCBlbGUgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IG9sZE5hbWUgPSB0aGlzLm1ldHJpY05hbWU7XG4gICAgY29uc3QgbmV3TmFtZSA9IGVsZS52YWx1ZTtcbiAgICB0aGlzLm1ldHJpY05hbWUgPSBuZXdOYW1lO1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IHRoaXMuZXhlY3V0ZU9wKFJlbmFtZU1ldHJpY09wKG9sZE5hbWUsIG5ld05hbWUpKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgdGhpcy5tZXRyaWNOYW1lID0gb2xkTmFtZTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZGVmYXVsdENoYW5nZShlOiBFdmVudCkge1xuICAgIGNvbnN0IGVsZSA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgY29uc3QgZGVmbiA9IHRoaXMuZ2V0RGVmaW5pdGlvbkNvcHkoKTtcbiAgICBkZWZuLmRlZmF1bHQgPSArZWxlLnZhbHVlO1xuICAgIHRoaXMudXBkYXRlTWV0cmljRGVmaW5pdGlvbihkZWZuKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcHJlY2lzaW9uQ2hhbmdlKGU6IEV2ZW50KSB7XG4gICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBkZWZuID0gdGhpcy5nZXREZWZpbml0aW9uQ29weSgpO1xuICAgIGRlZm4ucHJlY2lzaW9uID0gbmV3IFByZWNpc2lvbigrZWxlLnZhbHVlKTtcbiAgICB0aGlzLnVwZGF0ZU1ldHJpY0RlZmluaXRpb24oZGVmbik7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1pbkNoYW5nZShlOiBFdmVudCkge1xuICAgIGNvbnN0IGVsZSA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgY29uc3QgbmV3VmFsdWUgPSArZWxlLnZhbHVlO1xuICAgIGNvbnN0IGRlZmluaXRpb25Db3B5ID0gdGhpcy5nZXREZWZpbml0aW9uQ29weSgpO1xuICAgIGRlZmluaXRpb25Db3B5LnJhbmdlID0gbmV3IE1ldHJpY1JhbmdlKG5ld1ZhbHVlLCBkZWZpbml0aW9uQ29weSEucmFuZ2UubWF4KTtcbiAgICB0aGlzLnVwZGF0ZU1ldHJpY0RlZmluaXRpb24oZGVmaW5pdGlvbkNvcHkpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBtYXhDaGFuZ2UoZTogRXZlbnQpIHtcbiAgICBjb25zdCBlbGUgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gK2VsZS52YWx1ZTtcbiAgICBjb25zdCBkZWZpbml0aW9uQ29weSA9IHRoaXMuZ2V0RGVmaW5pdGlvbkNvcHkoKTtcbiAgICBkZWZpbml0aW9uQ29weS5yYW5nZSA9IG5ldyBNZXRyaWNSYW5nZShkZWZpbml0aW9uQ29weSEucmFuZ2UubWluLCBuZXdWYWx1ZSk7XG4gICAgdGhpcy51cGRhdGVNZXRyaWNEZWZpbml0aW9uKGRlZmluaXRpb25Db3B5KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgdXBkYXRlTWV0cmljRGVmaW5pdGlvbihuZXdEZWY6IE1ldHJpY0RlZmluaXRpb24pIHtcbiAgICBuZXdEZWYucmF0aW9uYWxpemUoKTtcbiAgICBjb25zdCByZXQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVPcChVcGRhdGVNZXRyaWNPcCh0aGlzLm1ldHJpY05hbWUsIG5ld0RlZikpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXBvcnRFcnJvcihyZXQuZXJyb3IpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXREZWZpbml0aW9uQ29weSgpOiBNZXRyaWNEZWZpbml0aW9uIHtcbiAgICBjb25zdCBkZWZuID0gdGhpcy5leHBsYW5NYWluPy5wbGFuLm1ldHJpY0RlZmluaXRpb25zW3RoaXMubWV0cmljTmFtZV07XG4gICAgcmV0dXJuIE1ldHJpY0RlZmluaXRpb24uRnJvbUpTT04oZGVmbj8udG9KU09OKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBjYW5jZWwoKSB7XG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImRpYWxvZ1wiKSEuY2xvc2UoKTtcbiAgfVxuXG4gIHB1YmxpYyBzaG93TW9kYWwoZXhwbGFuTWFpbjogRXhwbGFuTWFpbiwgbWV0cmljTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5leHBsYW5NYWluID0gZXhwbGFuTWFpbjtcbiAgICB0aGlzLm1ldHJpY05hbWUgPSBtZXRyaWNOYW1lO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImRpYWxvZ1wiKSEuc2hvd01vZGFsKCk7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwiZWRpdC1tZXRyaWMtZGVmaW5pdGlvblwiLCBFZGl0TWV0cmljRGVmaW5pdGlvbik7XG4iLCAiaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHsgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgaWNvbiB9IGZyb20gXCIuLi9pY29ucy9pY29ucy50c1wiO1xuXG5leHBvcnQgdHlwZSBEZXBUeXBlID0gXCJwcmVkXCIgfCBcInN1Y2NcIjtcblxuZXhwb3J0IGNvbnN0IGRlcERpc3BsYXlOYW1lOiBSZWNvcmQ8RGVwVHlwZSwgc3RyaW5nPiA9IHtcbiAgcHJlZDogXCJQcmVkZWNlc3NvcnNcIixcbiAgc3VjYzogXCJTdWNjZXNzb3JzXCIsXG59O1xuXG5pbnRlcmZhY2UgRGVwZW5lbmN5RXZlbnQge1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgZGVwVHlwZTogRGVwVHlwZTtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwIHtcbiAgICBcImRlbGV0ZS1kZXBlbmRlbmN5XCI6IEN1c3RvbUV2ZW50PERlcGVuZW5jeUV2ZW50PjtcbiAgICBcImFkZC1kZXBlbmRlbmN5XCI6IEN1c3RvbUV2ZW50PERlcGVuZW5jeUV2ZW50PjtcbiAgfVxufVxuXG5jb25zdCBraW5kVGVtcGxhdGUgPSAoXG4gIGRlcGVuZGVuY2llc0NvbnRyb2w6IERlcGVuZGVuY2llc1BhbmVsLFxuICBkZXBUeXBlOiBEZXBUeXBlLFxuICBpbmRleGVzOiBudW1iZXJbXVxuKTogVGVtcGxhdGVSZXN1bHQgPT4gaHRtbGBcbiAgPHRyPlxuICAgIDx0aD4ke2RlcERpc3BsYXlOYW1lW2RlcFR5cGVdfTwvdGg+XG4gICAgPHRoPjwvdGg+XG4gIDwvdHI+XG4gICR7aW5kZXhlcy5tYXAoKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzayA9IGRlcGVuZGVuY2llc0NvbnRyb2wudGFza3NbdGFza0luZGV4XTtcbiAgICByZXR1cm4gaHRtbGA8dHI+XG4gICAgICA8dGQ+JHt0YXNrLm5hbWV9PC90ZD5cbiAgICAgIDx0ZD5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIGNsYXNzPVwiaWNvbi1idXR0b25cIlxuICAgICAgICAgIHRpdGxlPVwiRGVsZXRlIHRoZSBkZXBlbmRlbmN5IG9uICR7dGFzay5uYW1lfVwiXG4gICAgICAgICAgQGNsaWNrPSR7KCkgPT4gZGVwZW5kZW5jaWVzQ29udHJvbC5kZWxldGVEZXAodGFza0luZGV4LCBkZXBUeXBlKX1cbiAgICAgICAgPlxuICAgICAgICAgICR7aWNvbihcImRlbGV0ZS1pY29uXCIpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvdGQ+XG4gICAgPC90cj5gO1xuICB9KX1cbiAgPHRyPlxuICAgIDx0ZD48L3RkPlxuICAgIDx0ZD5cbiAgICAgIDxidXR0b25cbiAgICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICAgIEBjbGljaz0keygpID0+IGRlcGVuZGVuY2llc0NvbnRyb2wuYWRkRGVwKGRlcFR5cGUpfVxuICAgICAgICB0aXRsZT1cIkFkZCBkZXBlbmRlbmN5LlwiXG4gICAgICA+XG4gICAgICAgICR7aWNvbihcImFkZC1pY29uXCIpfVxuICAgICAgPC9idXR0b24+XG4gICAgPC90ZD5cbiAgPC90cj5cbmA7XG5cbmNvbnN0IHRlbXBsYXRlID0gKFxuICBkZXBlbmRlbmNpZXNDb250cm9sOiBEZXBlbmRlbmNpZXNQYW5lbFxuKTogVGVtcGxhdGVSZXN1bHQgPT4gaHRtbGBcbiAgPHRhYmxlPlxuICAgICR7a2luZFRlbXBsYXRlKFxuICAgICAgZGVwZW5kZW5jaWVzQ29udHJvbCxcbiAgICAgIFwicHJlZFwiLFxuICAgICAgZGVwZW5kZW5jaWVzQ29udHJvbC5wcmVkSW5kZXhlc1xuICAgICl9XG4gICAgJHtraW5kVGVtcGxhdGUoXG4gICAgICBkZXBlbmRlbmNpZXNDb250cm9sLFxuICAgICAgXCJzdWNjXCIsXG4gICAgICBkZXBlbmRlbmNpZXNDb250cm9sLnN1Y2NJbmRleGVzXG4gICAgKX1cbiAgPC90YWJsZT5cbmA7XG5cbmV4cG9ydCBjbGFzcyBEZXBlbmRlbmNpZXNQYW5lbCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgdGFza3M6IFRhc2tbXSA9IFtdO1xuICBwcmVkSW5kZXhlczogbnVtYmVyW10gPSBbXTtcbiAgc3VjY0luZGV4ZXM6IG51bWJlcltdID0gW107XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRUYXNrc0FuZEluZGljZXMoXG4gICAgdGFza3M6IFRhc2tbXSxcbiAgICBwcmVkSW5kZXhlczogbnVtYmVyW10sXG4gICAgc3VjY0luZGV4ZXM6IG51bWJlcltdXG4gICkge1xuICAgIHRoaXMudGFza3MgPSB0YXNrcztcbiAgICB0aGlzLnByZWRJbmRleGVzID0gcHJlZEluZGV4ZXM7XG4gICAgdGhpcy5zdWNjSW5kZXhlcyA9IHN1Y2NJbmRleGVzO1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBwdWJsaWMgZGVsZXRlRGVwKHRhc2tJbmRleDogbnVtYmVyLCBkZXBUeXBlOiBEZXBUeXBlKSB7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgbmV3IEN1c3RvbUV2ZW50KFwiZGVsZXRlLWRlcGVuZGVuY3lcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICB0YXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICAgICAgICBkZXBUeXBlOiBkZXBUeXBlLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHVibGljIGFkZERlcChkZXBUeXBlOiBEZXBUeXBlKSB7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgbmV3IEN1c3RvbUV2ZW50KFwiYWRkLWRlcGVuZGVuY3lcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICB0YXNrSW5kZXg6IC0xLFxuICAgICAgICAgIGRlcFR5cGU6IGRlcFR5cGUsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwiZGVwZW5kZW5jaWVzLXBhbmVsXCIsIERlcGVuZGVuY2llc1BhbmVsKTtcbiIsICJpbXBvcnQge1xuICBWZXJ0ZXgsXG4gIFZlcnRleEluZGljZXMsXG4gIERpcmVjdGVkRWRnZSxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeVNyY1RvTWFwLFxuICBlZGdlc0J5RHN0VG9NYXAsXG59IGZyb20gXCIuLi9kYWdcIjtcblxuLyoqIEEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgYXBwbGllZCB0byBhIFZlcnRleCwgdXNlZCBpbiBsYXRlciBmdW5jdGlvbnMgbGlrZVxuRGVwdGggRmlyc3QgU2VhcmNoIHRvIGRvIHdvcmsgb24gZXZlcnkgVmVydGV4IGluIGEgRGlyZWN0ZWRHcmFwaC5cbiAqL1xuZXhwb3J0IHR5cGUgdmVydGV4RnVuY3Rpb24gPSAodjogVmVydGV4LCBpbmRleDogbnVtYmVyKSA9PiBib29sZWFuO1xuXG4vKiogUmV0dXJucyB0aGUgaW5kZXggb2YgYWxsIFZlcnRpY2VzIHRoYXQgaGF2ZSBubyBpbmNvbWluZyBlZGdlLlxuICovXG5leHBvcnQgY29uc3Qgc2V0T2ZWZXJ0aWNlc1dpdGhOb0luY29taW5nRWRnZSA9IChcbiAgZzogRGlyZWN0ZWRHcmFwaCxcbik6IFZlcnRleEluZGljZXMgPT4ge1xuICBjb25zdCBub2Rlc1dpdGhJbmNvbWluZ0VkZ2VzID0gZWRnZXNCeURzdFRvTWFwKGcuRWRnZXMpO1xuICBjb25zdCByZXQ6IFZlcnRleEluZGljZXMgPSBbXTtcbiAgZy5WZXJ0aWNlcy5mb3JFYWNoKChfOiBWZXJ0ZXgsIGk6IG51bWJlcikgPT4ge1xuICAgIGlmICghbm9kZXNXaXRoSW5jb21pbmdFZGdlcy5oYXMoaSkpIHtcbiAgICAgIHJldC5wdXNoKGkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXQ7XG59O1xuXG4vKiogRGVzY2VuZHMgdGhlIGdyYXBoIGluIERlcHRoIEZpcnN0IFNlYXJjaCBhbmQgYXBwbGllcyB0aGUgZnVuY3Rpb24gYGZgIHRvXG5lYWNoIG5vZGUuXG4gKi9cbmV4cG9ydCBjb25zdCBkZXB0aEZpcnN0U2VhcmNoID0gKGc6IERpcmVjdGVkR3JhcGgsIGY6IHZlcnRleEZ1bmN0aW9uKSA9PiB7XG4gIHNldE9mVmVydGljZXNXaXRoTm9JbmNvbWluZ0VkZ2UoZykuZm9yRWFjaCgodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGRlcHRoRmlyc3RTZWFyY2hGcm9tSW5kZXgoZywgdmVydGV4SW5kZXgsIGYpO1xuICB9KTtcbn07XG5cbi8qKiBEZXB0aCBGaXJzdCBTZWFyY2ggc3RhcnRpbmcgYXQgVmVydGV4IGBzdGFydF9pbmRleGAuICovXG5leHBvcnQgY29uc3QgZGVwdGhGaXJzdFNlYXJjaEZyb21JbmRleCA9IChcbiAgZzogRGlyZWN0ZWRHcmFwaCxcbiAgc3RhcnRfaW5kZXg6IG51bWJlcixcbiAgZjogdmVydGV4RnVuY3Rpb24sXG4pID0+IHtcbiAgY29uc3QgZWRnZXNCeVNyYyA9IGVkZ2VzQnlTcmNUb01hcChnLkVkZ2VzKTtcblxuICBjb25zdCB2aXNpdCA9ICh2ZXJ0ZXhJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKGYoZy5WZXJ0aWNlc1t2ZXJ0ZXhJbmRleF0sIHZlcnRleEluZGV4KSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbmV4dCA9IGVkZ2VzQnlTcmMuZ2V0KHZlcnRleEluZGV4KTtcbiAgICBpZiAobmV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5leHQuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICB2aXNpdChlLmopO1xuICAgIH0pO1xuICB9O1xuXG4gIHZpc2l0KHN0YXJ0X2luZGV4KTtcbn07XG4iLCAiaW1wb3J0IHtcbiAgRGlyZWN0ZWRFZGdlLFxuICBEaXJlY3RlZEdyYXBoLFxuICBlZGdlc0J5RHN0VG9NYXAsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbn0gZnJvbSBcIi4uL2RhZ1wiO1xuaW1wb3J0IHsgZGVwdGhGaXJzdFNlYXJjaEZyb21JbmRleCB9IGZyb20gXCIuL2Rmc1wiO1xuXG4vKiogUmV0dXJucyB0aGUgaW5kaWNlcyBvZiBhbGwgdGhlIHN1Y2Nlc3NvcnMgb2YgdGhlIHRhc2sgYXQgdGhlIGdpdmVuIGluZGV4LlxuICogIE5vdGUgdGhhdCBpbmNsdWRlcyB0aGUgZ2l2ZW4gaW5kZXggaXRzZWxmLlxuICovXG5leHBvcnQgY29uc3QgYWxsU3VjY2Vzc29ycyA9IChcbiAgdGFza0luZGV4OiBudW1iZXIsXG4gIGRpcmVjdGVkR3JhcGg6IERpcmVjdGVkR3JhcGhcbik6IG51bWJlcltdID0+IHtcbiAgaWYgKHRhc2tJbmRleCA+PSBkaXJlY3RlZEdyYXBoLlZlcnRpY2VzLmxlbmd0aCAtIDEgfHwgdGFza0luZGV4IDw9IDApIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgY29uc3QgYWxsQ2hpbGRyZW46IFNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuICBkZXB0aEZpcnN0U2VhcmNoRnJvbUluZGV4KFxuICAgIGRpcmVjdGVkR3JhcGgsXG4gICAgdGFza0luZGV4LFxuICAgIChfOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGFsbENoaWxkcmVuLmFkZChpbmRleCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICk7XG4gIGFsbENoaWxkcmVuLmRlbGV0ZShkaXJlY3RlZEdyYXBoLlZlcnRpY2VzLmxlbmd0aCAtIDEpO1xuICByZXR1cm4gWy4uLmFsbENoaWxkcmVuLnZhbHVlcygpXTtcbn07XG5cbmV4cG9ydCBjb25zdCBhbGxQcmVkZWNlc3NvcnMgPSAoXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoXG4pOiBudW1iZXJbXSA9PiB7XG4gIGlmICh0YXNrSW5kZXggPj0gZGlyZWN0ZWRHcmFwaC5WZXJ0aWNlcy5sZW5ndGggLSAxIHx8IHRhc2tJbmRleCA8PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IHByZWRlY2Vzc29yc1RvQ2hlY2sgPSBbdGFza0luZGV4XTtcbiAgY29uc3QgcmV0OiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoKTtcbiAgY29uc3QgYnlEZXN0ID0gZWRnZXNCeURzdFRvTWFwKGRpcmVjdGVkR3JhcGguRWRnZXMpO1xuICB3aGlsZSAocHJlZGVjZXNzb3JzVG9DaGVjay5sZW5ndGggIT09IDApIHtcbiAgICBjb25zdCBub2RlID0gcHJlZGVjZXNzb3JzVG9DaGVjay5wb3AoKSE7XG4gICAgcmV0LmFkZChub2RlKTtcbiAgICBjb25zdCBwcmVkZWNlc3NvcnMgPSBieURlc3QuZ2V0KG5vZGUpO1xuICAgIGlmIChwcmVkZWNlc3NvcnMpIHtcbiAgICAgIHByZWRlY2Vzc29yc1RvQ2hlY2sucHVzaCguLi5wcmVkZWNlc3NvcnMubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUuaSkpO1xuICAgIH1cbiAgfVxuICByZXQuZGVsZXRlKDApO1xuICByZXR1cm4gWy4uLnJldC52YWx1ZXMoKV07XG59O1xuXG4vKiogUmV0dXJucyB0aGUgaW5kaWNlcyBvZiBhbGwgdGhlIHRhc2tzIGluIHRoZSBncmFwaCwgZXhwZWN0IHRoZSBmaXJzdCBhbmQgdGhlXG4gKiAgbGFzdC4gKi9cbmV4cG9ydCBjb25zdCBhbGxUYXNrcyA9IChkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoKTogbnVtYmVyW10gPT4ge1xuICBjb25zdCByZXQgPSBbXTtcbiAgZm9yIChsZXQgaW5kZXggPSAxOyBpbmRleCA8IGRpcmVjdGVkR3JhcGguVmVydGljZXMubGVuZ3RoIC0gMTsgaW5kZXgrKykge1xuICAgIHJldC5wdXNoKGluZGV4KTtcbiAgfVxuICByZXR1cm4gcmV0O1xufTtcblxuZXhwb3J0IGNvbnN0IGRpZmZlcmVuY2UgPSAoYTogbnVtYmVyW10sIGI6IG51bWJlcltdKTogbnVtYmVyW10gPT4ge1xuICBjb25zdCBiU2V0ID0gbmV3IFNldChiKTtcbiAgcmV0dXJuIGEuZmlsdGVyKChpOiBudW1iZXIpID0+IGJTZXQuaGFzKGkpID09PSBmYWxzZSk7XG59O1xuXG5leHBvcnQgY29uc3QgYWxsUG90ZW50aWFsU3VjY2Vzc29ycyA9IChcbiAgdGFza0luZGV4OiBudW1iZXIsXG4gIGRpcmVjdGVkR3JhcGg6IERpcmVjdGVkR3JhcGhcbik6IG51bWJlcltdID0+IHtcbiAgLy8gUmVtb3ZlIGFsbCBkaXJlY3Qgc3VjY2Vzc29ycyBhbHNvLlxuICBjb25zdCBieVNyYyA9IGVkZ2VzQnlTcmNUb01hcChkaXJlY3RlZEdyYXBoLkVkZ2VzKTtcbiAgY29uc3QgZGlyZWN0U3VjYyA9IGJ5U3JjLmdldCh0YXNrSW5kZXgpIHx8IFtdO1xuICBjb25zdCBkaXJlY3RTdWNjQXJyYXkgPSBkaXJlY3RTdWNjLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLmopO1xuXG4gIHJldHVybiBkaWZmZXJlbmNlKGFsbFRhc2tzKGRpcmVjdGVkR3JhcGgpLCBbXG4gICAgLi4uYWxsUHJlZGVjZXNzb3JzKHRhc2tJbmRleCwgZGlyZWN0ZWRHcmFwaCksXG4gICAgLi4uZGlyZWN0U3VjY0FycmF5LFxuICBdKTtcbn07XG5cbmV4cG9ydCBjb25zdCBhbGxQb3RlbnRpYWxQcmVkZWNlc3NvcnMgPSAoXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoXG4pOiBudW1iZXJbXSA9PiB7XG4gIC8vIFJlbW92ZSBhbGwgZGlyZWN0IHByZWRlY2Vzc29ycyBhbHNvLlxuICBjb25zdCBieURlc3QgPSBlZGdlc0J5RHN0VG9NYXAoZGlyZWN0ZWRHcmFwaC5FZGdlcyk7XG4gIGNvbnN0IGRpcmVjdFByZWQgPSBieURlc3QuZ2V0KHRhc2tJbmRleCkgfHwgW107XG4gIGNvbnN0IGRpcmVjdFByZWRBcnJheSA9IGRpcmVjdFByZWQubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUuaSk7XG4gIGNvbnN0IGFsbFN1Y2MgPSBhbGxTdWNjZXNzb3JzKHRhc2tJbmRleCwgZGlyZWN0ZWRHcmFwaCk7XG4gIGNvbnN0IGFsbCA9IGFsbFRhc2tzKGRpcmVjdGVkR3JhcGgpO1xuICBjb25zdCB0b0JlU3VidHJhY3RlZCA9IFsuLi5hbGxTdWNjLCAuLi5kaXJlY3RQcmVkQXJyYXldO1xuICByZXR1cm4gZGlmZmVyZW5jZShhbGwsIHRvQmVTdWJ0cmFjdGVkKTtcbn07XG4iLCAiaW1wb3J0IHsgVGFza1NlYXJjaENvbnRyb2wgfSBmcm9tIFwiLi4vc2VhcmNoL3Rhc2stc2VhcmNoLWNvbnRyb2xzXCI7XG5pbXBvcnQgeyBDaGFydCB9IGZyb20gXCIuLi9jaGFydC9jaGFydFwiO1xuaW1wb3J0IHsgRGVwVHlwZSwgZGVwRGlzcGxheU5hbWUgfSBmcm9tIFwiLi4vZGVwZW5kZW5jaWVzL2RlcGVuZGVuY2llcy1wYW5lbFwiO1xuaW1wb3J0IHtcbiAgYWxsUG90ZW50aWFsU3VjY2Vzc29ycyxcbiAgYWxsUG90ZW50aWFsUHJlZGVjZXNzb3JzLFxufSBmcm9tIFwiLi4vZGFnL2FsZ29yaXRobXMvY2lyY3VsYXJcIjtcblxuZXhwb3J0IGNsYXNzIEFkZERlcGVuZGVuY3lEaWFsb2cgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIHByaXZhdGUgdGl0bGVFbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHRhc2tTZWFyY2hDb250cm9sOiBUYXNrU2VhcmNoQ29udHJvbCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGRpYWxvZzogSFRNTERpYWxvZ0VsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZXNvbHZlOiAodmFsdWU6IG51bWJlciB8IHVuZGVmaW5lZCkgPT4gdm9pZCA9ICgpID0+IHt9O1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMudGl0bGVFbGVtZW50ID0gdGhpcy5xdWVyeVNlbGVjdG9yKFwiaDJcIikhO1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2wgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJ0YXNrLXNlYXJjaC1jb250cm9sXCIpITtcbiAgICB0aGlzLmRpYWxvZyA9IHRoaXMucXVlcnlTZWxlY3RvcihcImRpYWxvZ1wiKSE7XG4gICAgdGhpcy5kaWFsb2cuYWRkRXZlbnRMaXN0ZW5lcihcImNhbmNlbFwiLCAoKSA9PiB0aGlzLnJlc29sdmUodW5kZWZpbmVkKSk7XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbC5hZGRFdmVudExpc3RlbmVyKFwidGFzay1jaGFuZ2VcIiwgKGUpID0+IHtcbiAgICAgIHRoaXMuZGlhbG9nIS5jbG9zZSgpO1xuICAgICAgdGhpcy5yZXNvbHZlKGUuZGV0YWlsLnRhc2tJbmRleCk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogUG9wdWxhdGVzIHRoZSBkaWFsb2cgYW5kIHNob3dzIGl0IGFzIGEgTW9kYWwgZGlhbG9nIGFuZCByZXR1cm5zIGEgUHJvbWlzZVxuICAgKiAgdGhhdCByZXNvbHZlcyBvbiBzdWNjZXNzIHRvIGEgdGFza0luZGV4LCBvciB1bmRlZmluZWQgaWYgdGhlIHVzZXJcbiAgICogIGNhbmNlbGxlZCBvdXQgb2YgdGhlIGZsb3cuXG4gICAqL1xuICBwdWJsaWMgc2VsZWN0RGVwZW5kZW5jeShcbiAgICBjaGFydDogQ2hhcnQsXG4gICAgdGFza0luZGV4OiBudW1iZXIsXG4gICAgZGVwVHlwZTogRGVwVHlwZVxuICApOiBQcm9taXNlPG51bWJlciB8IHVuZGVmaW5lZD4ge1xuICAgIHRoaXMudGl0bGVFbGVtZW50IS50ZXh0Q29udGVudCA9IGRlcERpc3BsYXlOYW1lW2RlcFR5cGVdO1xuXG4gICAgbGV0IGluY2x1ZGVkSW5kZXhlcyA9IFtdO1xuICAgIGlmIChkZXBUeXBlID09PSBcInByZWRcIikge1xuICAgICAgaW5jbHVkZWRJbmRleGVzID0gYWxsUG90ZW50aWFsUHJlZGVjZXNzb3JzKHRhc2tJbmRleCwgY2hhcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbmNsdWRlZEluZGV4ZXMgPSBhbGxQb3RlbnRpYWxTdWNjZXNzb3JzKHRhc2tJbmRleCwgY2hhcnQpO1xuICAgIH1cbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sIS50YXNrcyA9IGNoYXJ0LlZlcnRpY2VzO1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLmluY2x1ZGVkSW5kZXhlcyA9IGluY2x1ZGVkSW5kZXhlcztcblxuICAgIC8vIFRPRE8gLSBBbGxvdyBib3RoIHR5cGVzIG9mIHNlYXJjaCBpbiB0aGUgZGVwZW5kZW5jeSBkaWFsb2cuXG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEuc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoXCJuYW1lLW9ubHlcIik7XG4gICAgY29uc3QgcmV0ID0gbmV3IFByb21pc2U8bnVtYmVyIHwgdW5kZWZpbmVkPigocmVzb2x2ZSwgX3JlamVjdCkgPT4ge1xuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHRoaXMuZGlhbG9nIS5zaG93TW9kYWwoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImFkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiLCBBZGREZXBlbmRlbmN5RGlhbG9nKTtcbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQgeyBBZGRSZXNvdXJjZU9wLCBEZWxldGVSZXNvdXJjZU9wIH0gZnJvbSBcIi4uL29wcy9yZXNvdXJjZXNcIjtcbmltcG9ydCB7IGV4ZWN1dGVPcCB9IGZyb20gXCIuLi9hY3Rpb24vZXhlY3V0ZVwiO1xuaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IEVkaXRSZXNvdXJjZURlZmluaXRpb24gfSBmcm9tIFwiLi4vZWRpdC1yZXNvdXJjZS1kZWZpbml0aW9uL2VkaXQtcmVzb3VyY2UtZGVmaW5pdGlvblwiO1xuaW1wb3J0IHsgaWNvbiB9IGZyb20gXCIuLi9pY29ucy9pY29uc1wiO1xuXG4vLyBMb25nZXN0IHJlcHJlc2VudGF0aW9uIHdlJ2xsIHNob3cgZm9yIGFsbCB0aGUgb3B0aW9ucyBvZiBhIFJlc291cmNlLlxuY29uc3QgTUFYX1NIT1JUX1NUUklORyA9IDgwO1xuXG5leHBvcnQgY2xhc3MgRWRpdFJlc291cmNlc0RpYWxvZyBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpbiB8IG51bGwgPSBudWxsO1xuICBwbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFjazogKCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5leHBsYW5NYWluICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCIsXG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrXG4gICAgKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICBcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCIsXG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrXG4gICAgKTtcbiAgfVxuXG4gIHNob3dNb2RhbChleHBsYW5NYWluOiBFeHBsYW5NYWluKSB7XG4gICAgdGhpcy5leHBsYW5NYWluID0gZXhwbGFuTWFpbjtcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLnNob3dNb2RhbCgpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXIoKSB7XG4gICAgcmVuZGVyKHRoaXMudGVtcGxhdGUoKSwgdGhpcyk7XG4gIH1cblxuICBwcml2YXRlIHZhbHVlc1RvU2hvcnRTdHJpbmcodmFsdWVzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gICAgbGV0IHJldCA9IHZhbHVlcy5qb2luKFwiLCBcIik7XG4gICAgaWYgKHJldC5sZW5ndGggPiBNQVhfU0hPUlRfU1RSSU5HKSB7XG4gICAgICByZXQgPSByZXQuc2xpY2UoMCwgTUFYX1NIT1JUX1NUUklORykgKyBcIiAuLi5cIjtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHByaXZhdGUgZGVsQnV0dG9uSWZOb3RTdGF0aWMoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGlzU3RhdGljOiBib29sZWFuXG4gICk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBpZiAoaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBodG1sYGA7XG4gICAgfVxuICAgIHJldHVybiBodG1sYDxidXR0b25cbiAgICAgIGNsYXNzPVwiaWNvbi1idXR0b25cIlxuICAgICAgdGl0bGU9XCJEZWxldGUgdGhpcyByZXNvdXJjZS5cIlxuICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5kZWxldGVSZXNvdXJjZShuYW1lKX1cbiAgICA+XG4gICAgICAke2ljb24oXCJkZWxldGUtaWNvblwiKX1cbiAgICA8L2J1dHRvbj5gO1xuICB9XG5cbiAgcHJpdmF0ZSBlZGl0QnV0dG9uSWZOb3RTdGF0aWMoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGlzU3RhdGljOiBib29sZWFuXG4gICk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBpZiAoaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBodG1sYGA7XG4gICAgfVxuICAgIHJldHVybiBodG1sYDxidXR0b25cbiAgICAgIGNsYXNzPVwiaWNvbi1idXR0b25cIlxuICAgICAgdGl0bGU9XCJFZGl0IHRoZSByZXNvdXJjZSBkZWZpbml0aW9uLlwiXG4gICAgICBAY2xpY2s9JHsoKSA9PiB0aGlzLmVkaXRSZXNvdXJjZShuYW1lKX1cbiAgICA+XG4gICAgICAke2ljb24oXCJlZGl0LWljb25cIil9XG4gICAgPC9idXR0b24+YDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZGVsZXRlUmVzb3VyY2UobmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZU9wKFxuICAgICAgRGVsZXRlUmVzb3VyY2VPcChuYW1lKSxcbiAgICAgIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCIsXG4gICAgICB0cnVlLFxuICAgICAgdGhpcy5leHBsYW5NYWluIVxuICAgICk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIGNvbnNvbGUubG9nKHJldC5lcnJvcik7XG4gICAgfVxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBwcml2YXRlIGNsb3NlKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLmNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIGVkaXRSZXNvdXJjZShuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gICAgdGhpcy5leHBsYW5NYWluIS5xdWVyeVNlbGVjdG9yPEVkaXRSZXNvdXJjZURlZmluaXRpb24+KFxuICAgICAgXCJlZGl0LXJlc291cmNlLWRlZmluaXRpb25cIlxuICAgICkhLnNob3dNb2RhbChcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiEsXG4gICAgICBuYW1lLFxuICAgICAgdGhpcy5leHBsYW5NYWluIS5wbGFuLnJlc291cmNlRGVmaW5pdGlvbnNbbmFtZV1cbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBuZXdSZXNvdXJjZSgpIHtcbiAgICBjb25zdCBuYW1lID0gd2luZG93LnByb21wdChcIlJlc291cmNlIG5hbWU6XCIsIFwiXCIpO1xuICAgIGlmIChuYW1lID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGVPcChcbiAgICAgIEFkZFJlc291cmNlT3AobmFtZSksXG4gICAgICBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLFxuICAgICAgdHJ1ZSxcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiFcbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICB3aW5kb3cuYWxlcnQocmV0LmVycm9yKTtcbiAgICAgIGNvbnNvbGUubG9nKHJldC5lcnJvcik7XG4gICAgfVxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBwcml2YXRlIHRlbXBsYXRlKCk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdCByZCA9IHRoaXMuZXhwbGFuTWFpbiEucGxhbi5yZXNvdXJjZURlZmluaXRpb25zO1xuICAgIGNvbnN0IGFsbEtleXNTb3J0ZWQgPSBPYmplY3Qua2V5cyhyZCkuc29ydChcbiAgICAgIChrZXlBOiBzdHJpbmcsIGtleUI6IHN0cmluZyk6IG51bWJlciA9PiB7XG4gICAgICAgIGNvbnN0IGEgPSByZFtrZXlBXTtcbiAgICAgICAgY29uc3QgYiA9IHJkW2tleUJdO1xuICAgICAgICBpZiAoYS5pc1N0YXRpYyA9PT0gYi5pc1N0YXRpYykge1xuICAgICAgICAgIHJldHVybiBrZXlBLmxvY2FsZUNvbXBhcmUoa2V5Qik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGEuaXNTdGF0aWMpIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHJldHVybiBodG1sYFxuICAgICAgPGRpYWxvZz5cbiAgICAgICAgPGgzPlJlc291cmNlczwvaDM+XG4gICAgICAgIDx0YWJsZT5cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGg+TmFtZTwvdGg+XG4gICAgICAgICAgICA8dGg+VmFsdWVzPC90aD5cbiAgICAgICAgICAgIDx0aD5EZWxldGU8L3RoPlxuICAgICAgICAgICAgPHRoPkVkaXQ8L3RoPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgJHthbGxLZXlzU29ydGVkLm1hcCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGVmbiA9IHJkW25hbWVdO1xuICAgICAgICAgICAgcmV0dXJuIGh0bWxgPHRyPlxuICAgICAgICAgICAgICA8dGQ+JHtuYW1lfTwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD4ke3RoaXMudmFsdWVzVG9TaG9ydFN0cmluZyhkZWZuLnZhbHVlcyl9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPiR7dGhpcy5kZWxCdXR0b25JZk5vdFN0YXRpYyhuYW1lLCBkZWZuLmlzU3RhdGljKX08L3RkPlxuICAgICAgICAgICAgICA8dGQ+JHt0aGlzLmVkaXRCdXR0b25JZk5vdFN0YXRpYyhuYW1lLCBkZWZuLmlzU3RhdGljKX08L3RkPlxuICAgICAgICAgICAgPC90cj5gO1xuICAgICAgICAgIH0pfVxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzPVwiaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgICAgIHRpdGxlPVwiQWRkIGEgbmV3IFJlc291cmNlLlwiXG4gICAgICAgICAgICAgICAgQGNsaWNrPSR7KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy5uZXdSZXNvdXJjZSgpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAke2ljb24oXCJhZGQtaWNvblwiKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJkaWFsb2ctZm9vdGVyXCI+XG4gICAgICAgICAgPGJ1dHRvbiBAY2xpY2s9JHsoKSA9PiB0aGlzLmNsb3NlKCl9PkNsb3NlPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaWFsb2c+XG4gICAgYDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJlZGl0LXJlc291cmNlcy1kaWFsb2dcIiwgRWRpdFJlc291cmNlc0RpYWxvZyk7XG4iLCAiaW1wb3J0IHtcbiAgVmVydGV4LFxuICBWZXJ0ZXhJbmRpY2VzLFxuICBEaXJlY3RlZEdyYXBoLFxuICBlZGdlc0J5U3JjVG9NYXAsXG59IGZyb20gXCIuLi9kYWcudHNcIjtcblxuLyoqXG5UaGUgcmV0dXJuIHR5cGUgZm9yIHRoZSBUb3Bsb2dpY2FsU29ydCBmdW5jdGlvbi4gXG4gKi9cbnR5cGUgVFNSZXR1cm4gPSB7XG4gIGhhc0N5Y2xlczogYm9vbGVhbjtcblxuICBjeWNsZTogVmVydGV4SW5kaWNlcztcblxuICBvcmRlcjogVmVydGV4SW5kaWNlcztcbn07XG5cbi8qKlxuUmV0dXJucyBhIHRvcG9sb2dpY2FsIHNvcnQgb3JkZXIgZm9yIGEgRGlyZWN0ZWRHcmFwaCwgb3IgdGhlIG1lbWJlcnMgb2YgYSBjeWNsZSBpZiBhXG50b3BvbG9naWNhbCBzb3J0IGNhbid0IGJlIGRvbmUuXG4gXG4gVGhlIHRvcG9sb2dpY2FsIHNvcnQgY29tZXMgZnJvbTpcblxuICAgIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmcjRGVwdGgtZmlyc3Rfc2VhcmNoXG5cbkwgXHUyMTkwIEVtcHR5IGxpc3QgdGhhdCB3aWxsIGNvbnRhaW4gdGhlIHNvcnRlZCBub2Rlc1xud2hpbGUgZXhpc3RzIG5vZGVzIHdpdGhvdXQgYSBwZXJtYW5lbnQgbWFyayBkb1xuICAgIHNlbGVjdCBhbiB1bm1hcmtlZCBub2RlIG5cbiAgICB2aXNpdChuKVxuXG5mdW5jdGlvbiB2aXNpdChub2RlIG4pXG4gICAgaWYgbiBoYXMgYSBwZXJtYW5lbnQgbWFyayB0aGVuXG4gICAgICAgIHJldHVyblxuICAgIGlmIG4gaGFzIGEgdGVtcG9yYXJ5IG1hcmsgdGhlblxuICAgICAgICBzdG9wICAgKGdyYXBoIGhhcyBhdCBsZWFzdCBvbmUgY3ljbGUpXG5cbiAgICBtYXJrIG4gd2l0aCBhIHRlbXBvcmFyeSBtYXJrXG5cbiAgICBmb3IgZWFjaCBub2RlIG0gd2l0aCBhbiBlZGdlIGZyb20gbiB0byBtIGRvXG4gICAgICAgIHZpc2l0KG0pXG5cbiAgICByZW1vdmUgdGVtcG9yYXJ5IG1hcmsgZnJvbSBuXG4gICAgbWFyayBuIHdpdGggYSBwZXJtYW5lbnQgbWFya1xuICAgIGFkZCBuIHRvIGhlYWQgb2YgTFxuXG4gKi9cbmV4cG9ydCBjb25zdCB0b3BvbG9naWNhbFNvcnQgPSAoZzogRGlyZWN0ZWRHcmFwaCk6IFRTUmV0dXJuID0+IHtcbiAgY29uc3QgcmV0OiBUU1JldHVybiA9IHtcbiAgICBoYXNDeWNsZXM6IGZhbHNlLFxuICAgIGN5Y2xlOiBbXSxcbiAgICBvcmRlcjogW10sXG4gIH07XG5cbiAgY29uc3QgZWRnZU1hcCA9IGVkZ2VzQnlTcmNUb01hcChnLkVkZ2VzKTtcblxuICBjb25zdCBub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrID0gbmV3IFNldDxudW1iZXI+KCk7XG4gIGcuVmVydGljZXMuZm9yRWFjaCgoXzogVmVydGV4LCBpbmRleDogbnVtYmVyKSA9PlxuICAgIG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuYWRkKGluZGV4KVxuICApO1xuXG4gIGNvbnN0IGhhc1Blcm1hbmVudE1hcmsgPSAoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgIHJldHVybiAhbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5oYXMoaW5kZXgpO1xuICB9O1xuXG4gIGNvbnN0IHRlbXBvcmFyeU1hcmsgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuICBjb25zdCB2aXNpdCA9IChpbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKGhhc1Blcm1hbmVudE1hcmsoaW5kZXgpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRlbXBvcmFyeU1hcmsuaGFzKGluZGV4KSkge1xuICAgICAgLy8gV2Ugb25seSByZXR1cm4gZmFsc2Ugb24gZmluZGluZyBhIGxvb3AsIHdoaWNoIGlzIHN0b3JlZCBpblxuICAgICAgLy8gdGVtcG9yYXJ5TWFyay5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGVtcG9yYXJ5TWFyay5hZGQoaW5kZXgpO1xuXG4gICAgY29uc3QgbmV4dEVkZ2VzID0gZWRnZU1hcC5nZXQoaW5kZXgpO1xuICAgIGlmIChuZXh0RWRnZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXh0RWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZSA9IG5leHRFZGdlc1tpXTtcbiAgICAgICAgaWYgKCF2aXNpdChlLmopKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGVtcG9yYXJ5TWFyay5kZWxldGUoaW5kZXgpO1xuICAgIG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuZGVsZXRlKGluZGV4KTtcbiAgICByZXQub3JkZXIudW5zaGlmdChpbmRleCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gV2Ugd2lsbCBwcmVzdW1lIHRoYXQgVmVydGV4WzBdIGlzIHRoZSBzdGFydCBub2RlIGFuZCB0aGF0IHdlIHNob3VsZCBzdGFydCB0aGVyZS5cbiAgY29uc3Qgb2sgPSB2aXNpdCgwKTtcbiAgaWYgKCFvaykge1xuICAgIHJldC5oYXNDeWNsZXMgPSB0cnVlO1xuICAgIHJldC5jeWNsZSA9IFsuLi50ZW1wb3JhcnlNYXJrLmtleXMoKV07XG4gIH1cblxuICByZXR1cm4gcmV0O1xufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7XG4gIFZlcnRleEluZGljZXMsXG4gIEVkZ2VzLFxuICBEaXJlY3RlZEdyYXBoLFxuICBlZGdlc0J5U3JjVG9NYXAsXG4gIGVkZ2VzQnlEc3RUb01hcCxcbiAgRGlyZWN0ZWRFZGdlLFxuICBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkLFxufSBmcm9tIFwiLi4vZGFnL2RhZ1wiO1xuXG5pbXBvcnQgeyB0b3BvbG9naWNhbFNvcnQgfSBmcm9tIFwiLi4vZGFnL2FsZ29yaXRobXMvdG9wb3NvcnQudHNcIjtcbmltcG9ydCB7IE1ldHJpY1ZhbHVlcyB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IFRhc2tEdXJhdGlvbiB9IGZyb20gXCIuLi90eXBlcy90eXBlcy50c1wiO1xuXG5leHBvcnQgdHlwZSBUYXNrU3RhdGUgPSBcInVuc3RhcnRlZFwiIHwgXCJzdGFydGVkXCIgfCBcImNvbXBsZXRlXCI7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1RBU0tfTkFNRSA9IFwiVGFzayBOYW1lXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza1NlcmlhbGl6ZWQge1xuICByZXNvdXJjZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG4gIG1ldHJpY3M6IE1ldHJpY1ZhbHVlcztcbiAgbmFtZTogc3RyaW5nO1xuICBzdGF0ZTogVGFza1N0YXRlO1xufVxuXG4vLyBEbyB3ZSBjcmVhdGUgc3ViLWNsYXNzZXMgYW5kIHRoZW4gc2VyaWFsaXplIHNlcGFyYXRlbHk/IE9yIGRvIHdlIGhhdmUgYVxuLy8gY29uZmlnIGFib3V0IHdoaWNoIHR5cGUgb2YgRHVyYXRpb25TYW1wbGVyIGlzIGJlaW5nIHVzZWQ/XG4vL1xuLy8gV2UgY2FuIHVzZSB0cmFkaXRpb25hbCBvcHRpbWlzdGljL3Blc3NpbWlzdGljIHZhbHVlLiBPciBKYWNvYmlhbidzXG4vLyB1bmNlcnRhaW50bHkgbXVsdGlwbGllcnMgWzEuMSwgMS41LCAyLCA1XSBhbmQgdGhlaXIgaW52ZXJzZXMgdG8gZ2VuZXJhdGUgYW5cbi8vIG9wdGltaXN0aWMgcGVzc2ltaXN0aWMuXG5cbi8qKiBUYXNrIGlzIGEgVmVydGV4IHdpdGggZGV0YWlscyBhYm91dCB0aGUgVGFzayB0byBjb21wbGV0ZS4gKi9cbmV4cG9ydCBjbGFzcyBUYXNrIHtcbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nID0gXCJcIikge1xuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgREVGQVVMVF9UQVNLX05BTUU7XG4gICAgdGhpcy5tZXRyaWNzID0ge307XG4gICAgdGhpcy5yZXNvdXJjZXMgPSB7fTtcbiAgfVxuXG4gIC8vIFJlc291cmNlIGtleXMgYW5kIHZhbHVlcy4gVGhlIHBhcmVudCBwbGFuIGNvbnRhaW5zIGFsbCB0aGUgcmVzb3VyY2VcbiAgLy8gZGVmaW5pdGlvbnMuXG5cbiAgcmVzb3VyY2VzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuXG4gIG1ldHJpY3M6IE1ldHJpY1ZhbHVlcztcblxuICBuYW1lOiBzdHJpbmc7XG5cbiAgc3RhdGU6IFRhc2tTdGF0ZSA9IFwidW5zdGFydGVkXCI7XG5cbiAgdG9KU09OKCk6IFRhc2tTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzb3VyY2VzOiB0aGlzLnJlc291cmNlcyxcbiAgICAgIG1ldHJpY3M6IHRoaXMubWV0cmljcyxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIHN0YXRlOiB0aGlzLnN0YXRlLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZ2V0IGR1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWV0cmljKFwiRHVyYXRpb25cIikhO1xuICB9XG5cbiAgcHVibGljIHNldCBkdXJhdGlvbih2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRNZXRyaWMoXCJEdXJhdGlvblwiLCB2YWx1ZSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0TWV0cmljKGtleTogc3RyaW5nKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNzW2tleV07XG4gIH1cblxuICBwdWJsaWMgc2V0TWV0cmljKGtleTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5tZXRyaWNzW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVNZXRyaWMoa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5tZXRyaWNzW2tleV07XG4gIH1cblxuICBwdWJsaWMgZ2V0UmVzb3VyY2Uoa2V5OiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlc1trZXldO1xuICB9XG5cbiAgcHVibGljIHNldFJlc291cmNlKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5yZXNvdXJjZXNba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGRlbGV0ZVJlc291cmNlKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMucmVzb3VyY2VzW2tleV07XG4gIH1cblxuICBwdWJsaWMgZHVwKCk6IFRhc2sge1xuICAgIGNvbnN0IHJldCA9IG5ldyBUYXNrKCk7XG4gICAgcmV0LnJlc291cmNlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucmVzb3VyY2VzKTtcbiAgICByZXQubWV0cmljcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMubWV0cmljcyk7XG4gICAgcmV0Lm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0LnN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFRhc2tzID0gVGFza1tdO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoYXJ0U2VyaWFsaXplZCB7XG4gIHZlcnRpY2VzOiBUYXNrU2VyaWFsaXplZFtdO1xuICBlZGdlczogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZFtdO1xufVxuXG4vKiogQSBDaGFydCBpcyBhIERpcmVjdGVkR3JhcGgsIGJ1dCB3aXRoIFRhc2tzIGZvciBWZXJ0aWNlcy4gKi9cbmV4cG9ydCBjbGFzcyBDaGFydCB7XG4gIFZlcnRpY2VzOiBUYXNrcztcbiAgRWRnZXM6IEVkZ2VzO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gbmV3IFRhc2soXCJTdGFydFwiKTtcbiAgICBzdGFydC5zZXRNZXRyaWMoXCJEdXJhdGlvblwiLCAwKTtcbiAgICBjb25zdCBmaW5pc2ggPSBuZXcgVGFzayhcIkZpbmlzaFwiKTtcbiAgICBmaW5pc2guc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgMCk7XG4gICAgdGhpcy5WZXJ0aWNlcyA9IFtzdGFydCwgZmluaXNoXTtcbiAgICB0aGlzLkVkZ2VzID0gW25ldyBEaXJlY3RlZEVkZ2UoMCwgMSldO1xuICB9XG5cbiAgdG9KU09OKCk6IENoYXJ0U2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnRpY2VzOiB0aGlzLlZlcnRpY2VzLm1hcCgodDogVGFzaykgPT4gdC50b0pTT04oKSksXG4gICAgICBlZGdlczogdGhpcy5FZGdlcy5tYXAoKGU6IERpcmVjdGVkRWRnZSkgPT4gZS50b0pTT04oKSksXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUb3BvbG9naWNhbE9yZGVyID0gVmVydGV4SW5kaWNlcztcblxuZXhwb3J0IHR5cGUgVmFsaWRhdGVSZXN1bHQgPSBSZXN1bHQ8VG9wb2xvZ2ljYWxPcmRlcj47XG5cbi8qKiBWYWxpZGF0ZXMgYSBEaXJlY3RlZEdyYXBoIGlzIGEgdmFsaWQgQ2hhcnQuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDaGFydChnOiBEaXJlY3RlZEdyYXBoKTogVmFsaWRhdGVSZXN1bHQge1xuICBpZiAoZy5WZXJ0aWNlcy5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgXCJDaGFydCBtdXN0IGNvbnRhaW4gYXQgbGVhc3QgdHdvIG5vZGUsIHRoZSBzdGFydCBhbmQgZmluaXNoIHRhc2tzLlwiXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IGVkZ2VzQnlEc3QgPSBlZGdlc0J5RHN0VG9NYXAoZy5FZGdlcyk7XG4gIGNvbnN0IGVkZ2VzQnlTcmMgPSBlZGdlc0J5U3JjVG9NYXAoZy5FZGdlcyk7XG5cbiAgLy8gVGhlIGZpcnN0IFZlcnRleCwgVF8wIGFrYSB0aGUgU3RhcnQgTWlsZXN0b25lLCBtdXN0IGhhdmUgMCBpbmNvbWluZyBlZGdlcy5cbiAgaWYgKGVkZ2VzQnlEc3QuZ2V0KDApICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZXJyb3IoXCJUaGUgc3RhcnQgbm9kZSAoMCkgaGFzIGFuIGluY29taW5nIGVkZ2UuXCIpO1xuICB9XG5cbiAgLy8gQW5kIG9ubHkgVF8wIHNob3VsZCBoYXZlIDAgaW5jb21pbmcgZWRnZXMuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgZy5WZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlZGdlc0J5RHN0LmdldChpKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBGb3VuZCBub2RlIHRoYXQgaXNuJ3QgKDApIHRoYXQgaGFzIG5vIGluY29taW5nIGVkZ2VzOiAke2l9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgbGFzdCBWZXJ0ZXgsIFRfZmluaXNoLCB0aGUgRmluaXNoIE1pbGVzdG9uZSwgbXVzdCBoYXZlIDAgb3V0Z29pbmcgZWRnZXMuXG4gIGlmIChlZGdlc0J5U3JjLmdldChnLlZlcnRpY2VzLmxlbmd0aCAtIDEpICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBcIlRoZSBsYXN0IG5vZGUsIHdoaWNoIHNob3VsZCBiZSB0aGUgRmluaXNoIE1pbGVzdG9uZSwgaGFzIGFuIG91dGdvaW5nIGVkZ2UuXCJcbiAgICApO1xuICB9XG5cbiAgLy8gQW5kIG9ubHkgVF9maW5pc2ggc2hvdWxkIGhhdmUgMCBvdXRnb2luZyBlZGdlcy5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBnLlZlcnRpY2VzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGlmIChlZGdlc0J5U3JjLmdldChpKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBGb3VuZCBub2RlIHRoYXQgaXNuJ3QgVF9maW5pc2ggdGhhdCBoYXMgbm8gb3V0Z29pbmcgZWRnZXM6ICR7aX1gXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG51bVZlcnRpY2VzID0gZy5WZXJ0aWNlcy5sZW5ndGg7XG4gIC8vIEFuZCBhbGwgZWRnZXMgbWFrZSBzZW5zZSwgaS5lLiB0aGV5IGFsbCBwb2ludCB0byB2ZXJ0ZXhlcyB0aGF0IGV4aXN0LlxuICBmb3IgKGxldCBpID0gMDsgaSA8IGcuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZy5FZGdlc1tpXTtcbiAgICBpZiAoXG4gICAgICBlbGVtZW50LmkgPCAwIHx8XG4gICAgICBlbGVtZW50LmkgPj0gbnVtVmVydGljZXMgfHxcbiAgICAgIGVsZW1lbnQuaiA8IDAgfHxcbiAgICAgIGVsZW1lbnQuaiA+PSBudW1WZXJ0aWNlc1xuICAgICkge1xuICAgICAgcmV0dXJuIGVycm9yKGBFZGdlICR7ZWxlbWVudH0gcG9pbnRzIHRvIGEgbm9uLWV4aXN0ZW50IFZlcnRleC5gKTtcbiAgICB9XG4gIH1cblxuICAvLyBOb3cgd2UgY29uZmlybSB0aGF0IHdlIGhhdmUgYSBEaXJlY3RlZCBBY3ljbGljIEdyYXBoLCBpLmUuIHRoZSBncmFwaCBoYXMgbm9cbiAgLy8gY3ljbGVzIGJ5IGNyZWF0aW5nIGEgdG9wb2xvZ2ljYWwgc29ydCBzdGFydGluZyBhdCBUXzBcbiAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVG9wb2xvZ2ljYWxfc29ydGluZyNEZXB0aC1maXJzdF9zZWFyY2hcbiAgY29uc3QgdHNSZXQgPSB0b3BvbG9naWNhbFNvcnQoZyk7XG4gIGlmICh0c1JldC5oYXNDeWNsZXMpIHtcbiAgICByZXR1cm4gZXJyb3IoYENoYXJ0IGhhcyBjeWNsZTogJHtbLi4udHNSZXQuY3ljbGVdLmpvaW4oXCIsIFwiKX1gKTtcbiAgfVxuXG4gIHJldHVybiBvayh0c1JldC5vcmRlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGFydFZhbGlkYXRlKFxuICBjOiBDaGFydCxcbiAgdGFza0R1cmF0aW9uOiBUYXNrRHVyYXRpb24gfCBudWxsID0gbnVsbFxuKTogVmFsaWRhdGVSZXN1bHQge1xuICBpZiAodGFza0R1cmF0aW9uID09PSBudWxsKSB7XG4gICAgdGFza0R1cmF0aW9uID0gKHRhc2tJbmRleDogbnVtYmVyKSA9PiBjLlZlcnRpY2VzW3Rhc2tJbmRleF0uZHVyYXRpb247XG4gIH1cbiAgY29uc3QgcmV0ID0gdmFsaWRhdGVDaGFydChjKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIGlmICh0YXNrRHVyYXRpb24oMCkgIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgU3RhcnQgTWlsZXN0b25lIG11c3QgaGF2ZSBkdXJhdGlvbiBvZiAwLCBpbnN0ZWFkIGdvdCAke3Rhc2tEdXJhdGlvbigwKX1gXG4gICAgKTtcbiAgfVxuICBpZiAodGFza0R1cmF0aW9uKGMuVmVydGljZXMubGVuZ3RoIC0gMSkgIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgRmluaXNoIE1pbGVzdG9uZSBtdXN0IGhhdmUgZHVyYXRpb24gb2YgMCwgaW5zdGVhZCBnb3QgJHt0YXNrRHVyYXRpb24oXG4gICAgICAgIGMuVmVydGljZXMubGVuZ3RoIC0gMVxuICAgICAgKX1gXG4gICAgKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuIiwgIi8qKlxuICogVHJpYW5ndWxhciBpcyB0aGUgaW52ZXJzZSBDdW11bGF0aXZlIERlbnNpdHkgRnVuY3Rpb24gKENERikgZm9yIHRoZVxuICogdHJpYW5ndWxhciBkaXN0cmlidXRpb24uXG4gKlxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVHJpYW5ndWxhcl9kaXN0cmlidXRpb24jR2VuZXJhdGluZ19yYW5kb21fdmFyaWF0ZXNcbiAqXG4gKiBUaGUgaW52ZXJzZSBvZiB0aGUgQ0RGIGlzIHVzZWZ1bCBmb3IgZ2VuZXJhdGluZyBzYW1wbGVzIGZyb20gdGhlXG4gKiBkaXN0cmlidXRpb24sIGkuZS4gcGFzc2luZyBpbiB2YWx1ZXMgZnJvbSB0aGUgdW5pZm9ybSBkaXN0cmlidXRpb24gWzAsIDFdXG4gKiB3aWxsIHByb2R1Y2Ugc2FtcGxlIHRoYXQgbG9vayBsaWtlIHRoZXkgY29tZSBmcm9tIHRoZSB0cmlhbmd1bGFyXG4gKiBkaXN0cmlidXRpb24uXG4gKlxuICpcbiAqL1xuXG5leHBvcnQgY2xhc3MgVHJpYW5ndWxhciB7XG4gIHByaXZhdGUgYTogbnVtYmVyO1xuICBwcml2YXRlIGI6IG51bWJlcjtcbiAgcHJpdmF0ZSBjOiBudW1iZXI7XG4gIHByaXZhdGUgRl9jOiBudW1iZXI7XG5cbiAgLyoqICBUaGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24gaXMgYSBjb250aW51b3VzIHByb2JhYmlsaXR5IGRpc3RyaWJ1dGlvbiB3aXRoXG4gIGxvd2VyIGxpbWl0IGBhYCwgdXBwZXIgbGltaXQgYGJgLCBhbmQgbW9kZSBgY2AsIHdoZXJlIGEgPCBiIGFuZCBhIFx1MjI2NCBjIFx1MjI2NCBiLiAqL1xuICBjb25zdHJ1Y3RvcihhOiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyKSB7XG4gICAgdGhpcy5hID0gYTtcbiAgICB0aGlzLmIgPSBiO1xuICAgIHRoaXMuYyA9IGM7XG5cbiAgICAvLyBGX2MgaXMgdGhlIGN1dG9mZiBpbiB0aGUgZG9tYWluIHdoZXJlIHdlIHN3aXRjaCBiZXR3ZWVuIHRoZSB0d28gaGFsdmVzIG9mXG4gICAgLy8gdGhlIHRyaWFuZ2xlLlxuICAgIHRoaXMuRl9jID0gKGMgLSBhKSAvIChiIC0gYSk7XG4gIH1cblxuICAvKiogIFByb2R1Y2UgYSBzYW1wbGUgZnJvbSB0aGUgdHJpYW5ndWxhciBkaXN0cmlidXRpb24uIFRoZSB2YWx1ZSBvZiAncCdcbiAgIHNob3VsZCBiZSBpbiBbMCwgMS4wXS4gKi9cbiAgc2FtcGxlKHA6IG51bWJlcik6IG51bWJlciB7XG4gICAgaWYgKHAgPCAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9IGVsc2UgaWYgKHAgPiAxLjApIHtcbiAgICAgIHJldHVybiAxLjA7XG4gICAgfSBlbHNlIGlmIChwIDwgdGhpcy5GX2MpIHtcbiAgICAgIHJldHVybiB0aGlzLmEgKyBNYXRoLnNxcnQocCAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYyAtIHRoaXMuYSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLmIgLSBNYXRoLnNxcnQoKDEgLSBwKSAqICh0aGlzLmIgLSB0aGlzLmEpICogKHRoaXMuYiAtIHRoaXMuYykpXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IFRyaWFuZ3VsYXIgfSBmcm9tIFwiLi90cmlhbmd1bGFyLnRzXCI7XG5cbmV4cG9ydCB0eXBlIFVuY2VydGFpbnR5ID0gXCJsb3dcIiB8IFwibW9kZXJhdGVcIiB8IFwiaGlnaFwiIHwgXCJleHRyZW1lXCI7XG5cbmV4cG9ydCBjb25zdCBVbmNlcnRhaW50eVRvTnVtOiBSZWNvcmQ8VW5jZXJ0YWludHksIG51bWJlcj4gPSB7XG4gIGxvdzogMS4xLFxuICBtb2RlcmF0ZTogMS41LFxuICBoaWdoOiAyLFxuICBleHRyZW1lOiA1LFxufTtcblxuZXhwb3J0IGNsYXNzIEphY29iaWFuIHtcbiAgcHJpdmF0ZSB0cmlhbmd1bGFyOiBUcmlhbmd1bGFyO1xuICBjb25zdHJ1Y3RvcihleHBlY3RlZDogbnVtYmVyLCB1bmNlcnRhaW50eTogVW5jZXJ0YWludHkpIHtcbiAgICBjb25zdCBtdWwgPSBVbmNlcnRhaW50eVRvTnVtW3VuY2VydGFpbnR5XTtcbiAgICB0aGlzLnRyaWFuZ3VsYXIgPSBuZXcgVHJpYW5ndWxhcihleHBlY3RlZCAvIG11bCwgZXhwZWN0ZWQgKiBtdWwsIGV4cGVjdGVkKTtcbiAgfVxuXG4gIHNhbXBsZShwOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnRyaWFuZ3VsYXIuc2FtcGxlKHApO1xuICB9XG59XG4iLCAiaW1wb3J0IHtcbiAgQ2hhcnQsXG4gIENoYXJ0U2VyaWFsaXplZCxcbiAgVGFzayxcbiAgVGFza1NlcmlhbGl6ZWQsXG4gIHZhbGlkYXRlQ2hhcnQsXG59IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7XG4gIE1ldHJpY0RlZmluaXRpb24sXG4gIE1ldHJpY0RlZmluaXRpb25zLFxuICBNZXRyaWNEZWZpbml0aW9uc1NlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3MudHNcIjtcbmltcG9ydCB7IE1ldHJpY1JhbmdlIH0gZnJvbSBcIi4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFJhdGlvbmFsaXplRWRnZXNPcCB9IGZyb20gXCIuLi9vcHMvY2hhcnQudHNcIjtcbmltcG9ydCB7XG4gIFJlc291cmNlRGVmaW5pdGlvbixcbiAgUmVzb3VyY2VEZWZpbml0aW9ucyxcbiAgUmVzb3VyY2VEZWZpbml0aW9uc1NlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgVW5jZXJ0YWludHlUb051bSB9IGZyb20gXCIuLi9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhbi50c1wiO1xuXG5leHBvcnQgdHlwZSBTdGF0aWNNZXRyaWNLZXlzID0gXCJEdXJhdGlvblwiIHwgXCJQZXJjZW50IENvbXBsZXRlXCI7XG5cbmV4cG9ydCBjb25zdCBTdGF0aWNNZXRyaWNEZWZpbml0aW9uczogTWV0cmljRGVmaW5pdGlvbnMgPSB7XG4gIC8vIEhvdyBsb25nIGEgdGFzayB3aWxsIHRha2UsIGluIGRheXMuXG4gIER1cmF0aW9uOiBuZXcgTWV0cmljRGVmaW5pdGlvbigwLCBuZXcgTWV0cmljUmFuZ2UoMCksIHRydWUpLFxuICAvLyBUaGUgcGVyY2VudCBjb21wbGV0ZSBmb3IgYSB0YXNrLlxuICBQZXJjZW50OiBuZXcgTWV0cmljRGVmaW5pdGlvbigwLCBuZXcgTWV0cmljUmFuZ2UoMCwgMTAwKSwgdHJ1ZSksXG59O1xuXG5leHBvcnQgY29uc3QgU3RhdGljUmVzb3VyY2VEZWZpbml0aW9uczogUmVzb3VyY2VEZWZpbml0aW9ucyA9IHtcbiAgVW5jZXJ0YWludHk6IG5ldyBSZXNvdXJjZURlZmluaXRpb24oT2JqZWN0LmtleXMoVW5jZXJ0YWludHlUb051bSksIHRydWUpLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBQbGFuU2VyaWFsaXplZCB7XG4gIGNoYXJ0OiBDaGFydFNlcmlhbGl6ZWQ7XG4gIHJlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnNTZXJpYWxpemVkO1xuICBtZXRyaWNEZWZpbml0aW9uczogTWV0cmljRGVmaW5pdGlvbnNTZXJpYWxpemVkO1xufVxuXG5leHBvcnQgY2xhc3MgUGxhbiB7XG4gIGNoYXJ0OiBDaGFydDtcblxuICByZXNvdXJjZURlZmluaXRpb25zOiBSZXNvdXJjZURlZmluaXRpb25zO1xuXG4gIG1ldHJpY0RlZmluaXRpb25zOiBNZXRyaWNEZWZpbml0aW9ucztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNoYXJ0ID0gbmV3IENoYXJ0KCk7XG5cbiAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zKTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljTWV0cmljRGVmaW5pdGlvbnMpO1xuICAgIHRoaXMuYXBwbHlNZXRyaWNzQW5kUmVzb3VyY2VzVG9WZXJ0aWNlcygpO1xuICB9XG5cbiAgYXBwbHlNZXRyaWNzQW5kUmVzb3VyY2VzVG9WZXJ0aWNlcygpIHtcbiAgICBPYmplY3Qua2V5cyh0aGlzLm1ldHJpY0RlZmluaXRpb25zKS5mb3JFYWNoKChtZXRyaWNOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IG1kID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uc1ttZXRyaWNOYW1lXSE7XG4gICAgICB0aGlzLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgICAgdGFzay5zZXRNZXRyaWMobWV0cmljTmFtZSwgbWQuZGVmYXVsdCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBPYmplY3QuZW50cmllcyh0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMpLmZvckVhY2goXG4gICAgICAoW2tleSwgcmVzb3VyY2VEZWZpbml0aW9uXSkgPT4ge1xuICAgICAgICB0aGlzLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgICAgICB0YXNrLnNldFJlc291cmNlKGtleSwgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1swXSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICB0b0pTT04oKTogUGxhblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBjaGFydDogdGhpcy5jaGFydC50b0pTT04oKSxcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbnM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXModGhpcy5yZXNvdXJjZURlZmluaXRpb25zKS5maWx0ZXIoXG4gICAgICAgICAgKFtrZXksIHJlc291cmNlRGVmaW5pdGlvbl0pID0+ICFyZXNvdXJjZURlZmluaXRpb24uaXNTdGF0aWNcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIG1ldHJpY0RlZmluaXRpb25zOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpXG4gICAgICAgICAgLmZpbHRlcigoW2tleSwgbWV0cmljRGVmaW5pdGlvbl0pID0+ICFtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKVxuICAgICAgICAgIC5tYXAoKFtrZXksIG1ldHJpY0RlZmluaXRpb25dKSA9PiBba2V5LCBtZXRyaWNEZWZpbml0aW9uLnRvSlNPTigpXSlcbiAgICAgICksXG4gICAgfTtcbiAgfVxuXG4gIGdldE1ldHJpY0RlZmluaXRpb24oa2V5OiBzdHJpbmcpOiBNZXRyaWNEZWZpbml0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgc2V0TWV0cmljRGVmaW5pdGlvbihrZXk6IHN0cmluZywgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbikge1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XSA9IG1ldHJpY0RlZmluaXRpb247XG4gIH1cblxuICBkZWxldGVNZXRyaWNEZWZpbml0aW9uKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIGdldFJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZyk6IFJlc291cmNlRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgc2V0UmVzb3VyY2VEZWZpbml0aW9uKGtleTogc3RyaW5nLCB2YWx1ZTogUmVzb3VyY2VEZWZpbml0aW9uKSB7XG4gICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGRlbGV0ZVJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYSBuZXcgVGFzayB3aXRoIGRlZmF1bHRzIGZvciBhbGwgbWV0cmljcyBhbmQgcmVzb3VyY2VzLlxuICBuZXdUYXNrKCk6IFRhc2sge1xuICAgIGNvbnN0IHJldCA9IG5ldyBUYXNrKCk7XG4gICAgT2JqZWN0LmtleXModGhpcy5tZXRyaWNEZWZpbml0aW9ucykuZm9yRWFjaCgobWV0cmljTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBtZCA9IHRoaXMuZ2V0TWV0cmljRGVmaW5pdGlvbihtZXRyaWNOYW1lKSE7XG4gICAgICByZXQuc2V0TWV0cmljKG1ldHJpY05hbWUsIG1kLmRlZmF1bHQpO1xuICAgIH0pO1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZm9yRWFjaChcbiAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiB7XG4gICAgICAgIHJldC5zZXRSZXNvdXJjZShrZXksIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbMF0pO1xuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgRnJvbUpTT04gPSAodGV4dDogc3RyaW5nKTogUmVzdWx0PFBsYW4+ID0+IHtcbiAgY29uc3QgcGxhblNlcmlhbGl6ZWQ6IFBsYW5TZXJpYWxpemVkID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgY29uc3QgcGxhbiA9IG5ldyBQbGFuKCk7XG5cbiAgcGxhbi5jaGFydC5WZXJ0aWNlcyA9IHBsYW5TZXJpYWxpemVkLmNoYXJ0LnZlcnRpY2VzLm1hcChcbiAgICAodGFza1NlcmlhbGl6ZWQ6IFRhc2tTZXJpYWxpemVkKTogVGFzayA9PiB7XG4gICAgICBjb25zdCB0YXNrID0gbmV3IFRhc2sodGFza1NlcmlhbGl6ZWQubmFtZSk7XG4gICAgICB0YXNrLnN0YXRlID0gdGFza1NlcmlhbGl6ZWQuc3RhdGU7XG4gICAgICB0YXNrLm1ldHJpY3MgPSB0YXNrU2VyaWFsaXplZC5tZXRyaWNzO1xuICAgICAgdGFzay5yZXNvdXJjZXMgPSB0YXNrU2VyaWFsaXplZC5yZXNvdXJjZXM7XG5cbiAgICAgIHJldHVybiB0YXNrO1xuICAgIH1cbiAgKTtcbiAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW5TZXJpYWxpemVkLmNoYXJ0LmVkZ2VzLm1hcChcbiAgICAoZGlyZWN0ZWRFZGdlU2VyaWFsaXplZDogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCk6IERpcmVjdGVkRWRnZSA9PlxuICAgICAgbmV3IERpcmVjdGVkRWRnZShkaXJlY3RlZEVkZ2VTZXJpYWxpemVkLmksIGRpcmVjdGVkRWRnZVNlcmlhbGl6ZWQuailcbiAgKTtcblxuICBjb25zdCBkZXNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhwbGFuU2VyaWFsaXplZC5tZXRyaWNEZWZpbml0aW9ucykubWFwKFxuICAgICAgKFtrZXksIHNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uXSkgPT4gW1xuICAgICAgICBrZXksXG4gICAgICAgIE1ldHJpY0RlZmluaXRpb24uRnJvbUpTT04oc2VyaWFsaXplZE1ldHJpY0RlZmluaXRpb24pLFxuICAgICAgXVxuICAgIClcbiAgKTtcblxuICBwbGFuLm1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICB7fSxcbiAgICBTdGF0aWNNZXRyaWNEZWZpbml0aW9ucyxcbiAgICBkZXNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uc1xuICApO1xuXG4gIGNvbnN0IGRlc2VyaWFsaXplZFJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMocGxhblNlcmlhbGl6ZWQucmVzb3VyY2VEZWZpbml0aW9ucykubWFwKFxuICAgICAgKFtrZXksIHNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25dKSA9PiBbXG4gICAgICAgIGtleSxcbiAgICAgICAgUmVzb3VyY2VEZWZpbml0aW9uLkZyb21KU09OKHNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb24pLFxuICAgICAgXVxuICAgIClcbiAgKTtcblxuICBwbGFuLnJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgIHt9LFxuICAgIFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnMsXG4gICAgZGVzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9uc1xuICApO1xuXG4gIGNvbnN0IHJldCA9IFJhdGlvbmFsaXplRWRnZXNPcCgpLmFwcGx5VG8ocGxhbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGNvbnN0IHJldFZhbCA9IHZhbGlkYXRlQ2hhcnQocGxhbi5jaGFydCk7XG4gIGlmICghcmV0VmFsLm9rKSB7XG4gICAgcmV0dXJuIHJldFZhbDtcbiAgfVxuICByZXR1cm4gb2socGxhbik7XG59O1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuXCI7XG5pbXBvcnQgeyBsaXZlIH0gZnJvbSBcImxpdC1odG1sL2RpcmVjdGl2ZXMvbGl2ZS5qc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tOYW1lQ2hhbmdlRGV0YWlscyB7XG4gIG5hbWU6IHN0cmluZztcbiAgdGFza0luZGV4OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza1Jlc291cmNlVmFsdWVDaGFuZ2VEZXRhaWxzIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYXNrTWV0cmljVmFsdWVDaGFuZ2VEZXRhaWxzIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogbnVtYmVyO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwIHtcbiAgICBcInRhc2stbmFtZS1jaGFuZ2VcIjogQ3VzdG9tRXZlbnQ8VGFza05hbWVDaGFuZ2VEZXRhaWxzPjtcbiAgICBcInRhc2stcmVzb3VyY2UtdmFsdWUtY2hhbmdlXCI6IEN1c3RvbUV2ZW50PFRhc2tSZXNvdXJjZVZhbHVlQ2hhbmdlRGV0YWlscz47XG4gICAgXCJ0YXNrLW1ldHJpYy12YWx1ZS1jaGFuZ2VcIjogQ3VzdG9tRXZlbnQ8VGFza01ldHJpY1ZhbHVlQ2hhbmdlRGV0YWlscz47XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNlbGVjdGVkVGFza1BhbmVsIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBwbGFuOiBQbGFuID0gbmV3IFBsYW4oKTtcbiAgdGFza0luZGV4OiBudW1iZXIgPSAtMTtcbiAgcGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2s6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9O1xuICB9XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICB1cGRhdGVTZWxlY3RlZFRhc2tQYW5lbChwbGFuOiBQbGFuLCB0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMucGxhbiA9IHBsYW47XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICAvKlxuICAgIFRPRE8gLSBEbyB0aGUgZm9sbG93aW5nIHdoZW4gc2VsZWN0aW5nIGEgbmV3IHRhc2suXG4gICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID1cbiAgICAgICAgICBzZWxlY3RlZFRhc2tQYW5lbC5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiI3Rhc2stbmFtZVwiKSE7XG4gICAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgICAgIGlucHV0LnNlbGVjdCgpO1xuICAgICAgfSwgMCk7XG4gICAgICAqL1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJlbmRlcih0aGlzLnRlbXBsYXRlKCksIHRoaXMpO1xuICB9XG5cbiAgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGNvbnN0IHRhc2tJbmRleCA9IHRoaXMudGFza0luZGV4O1xuICAgIGlmICh0YXNrSW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm4gaHRtbGBObyB0YXNrIHNlbGVjdGVkLmA7XG4gICAgfVxuICAgIGNvbnN0IHRhc2sgPSB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XTtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDx0YWJsZT5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZD5OYW1lPC90ZD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICBpZD1cInRhc2stbmFtZVwiXG4gICAgICAgICAgICAgIC52YWx1ZT1cIiR7bGl2ZSh0YXNrLm5hbWUpfVwiXG4gICAgICAgICAgICAgIEBjaGFuZ2U9JHsoZTogRXZlbnQpID0+XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50PFRhc2tOYW1lQ2hhbmdlRGV0YWlscz4oXCJ0YXNrLW5hbWUtY2hhbmdlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICAke09iamVjdC5lbnRyaWVzKHRoaXMucGxhbi5yZXNvdXJjZURlZmluaXRpb25zKS5tYXAoXG4gICAgICAgICAgKFtyZXNvdXJjZUtleSwgZGVmbl0pID0+XG4gICAgICAgICAgICBodG1sYCA8dHI+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiJHtyZXNvdXJjZUtleX1cIj4ke3Jlc291cmNlS2V5fTwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICAgICAgICBpZD1cIiR7cmVzb3VyY2VLZXl9XCJcbiAgICAgICAgICAgICAgICAgIEBjaGFuZ2U9JHthc3luYyAoZTogRXZlbnQpID0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJ0YXNrLXJlc291cmNlLXZhbHVlLWNoYW5nZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByZXNvdXJjZUtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAke2RlZm4udmFsdWVzLm1hcChcbiAgICAgICAgICAgICAgICAgICAgKHJlc291cmNlVmFsdWU6IHN0cmluZykgPT5cbiAgICAgICAgICAgICAgICAgICAgICBodG1sYDxvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9JHtyZXNvdXJjZVZhbHVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdGVkPSR7dGFzay5yZXNvdXJjZXNbcmVzb3VyY2VLZXldID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAke3Jlc291cmNlVmFsdWV9XG4gICAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+YFxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+YFxuICAgICAgICApfVxuICAgICAgICAke09iamVjdC5rZXlzKHRoaXMucGxhbi5tZXRyaWNEZWZpbml0aW9ucykubWFwKFxuICAgICAgICAgIChrZXk6IHN0cmluZykgPT5cbiAgICAgICAgICAgIGh0bWxgIDx0cj5cbiAgICAgICAgICAgICAgPHRkPjxsYWJlbCBmb3I9XCIke2tleX1cIj4ke2tleX08L2xhYmVsPjwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgIGlkPVwiJHtrZXl9XCJcbiAgICAgICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUodGFzay5tZXRyaWNzW2tleV0pfVxuICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICBAY2hhbmdlPSR7YXN5bmMgKGU6IEV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwidGFzay1tZXRyaWMtdmFsdWUtY2hhbmdlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiArKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+YFxuICAgICAgICApfVxuICAgICAgPC90YWJsZT5cbiAgICBgO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcInNlbGVjdGVkLXRhc2stcGFuZWxcIiwgU2VsZWN0ZWRUYXNrUGFuZWwpO1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgVGFzaywgQ2hhcnQsIENoYXJ0VmFsaWRhdGUgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgZWRnZXNCeVNyY0FuZERzdFRvTWFwIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFJvdW5kZXIsIFRhc2tEdXJhdGlvbiB9IGZyb20gXCIuLi90eXBlcy90eXBlcy50c1wiO1xuXG4vKiogU3BhbiByZXByZXNlbnRzIHdoZW4gYSB0YXNrIHdpbGwgYmUgZG9uZSwgaS5lLiBpdCBjb250YWlucyB0aGUgdGltZSB0aGUgdGFza1xuICogaXMgZXhwZWN0ZWQgdG8gYmVnaW4gYW5kIGVuZC4gKi9cbmV4cG9ydCBjbGFzcyBTcGFuIHtcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZmluaXNoOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc3RhcnQ6IG51bWJlciA9IDAsIGZpbmlzaDogbnVtYmVyID0gMCkge1xuICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICB0aGlzLmZpbmlzaCA9IGZpbmlzaDtcbiAgfVxufVxuXG4vKiogVGhlIHN0YW5kYXJkIHNsYWNrIGNhbGN1bGF0aW9uIHZhbHVlcy4gKi9cbmV4cG9ydCBjbGFzcyBTbGFjayB7XG4gIGVhcmx5OiBTcGFuID0gbmV3IFNwYW4oKTtcbiAgbGF0ZTogU3BhbiA9IG5ldyBTcGFuKCk7XG4gIHNsYWNrOiBudW1iZXIgPSAwO1xufVxuXG5leHBvcnQgdHlwZSBTbGFja1Jlc3VsdCA9IFJlc3VsdDxTbGFja1tdPjtcblxuLy8gQ2FsY3VsYXRlIHRoZSBzbGFjayBmb3IgZWFjaCBUYXNrIGluIHRoZSBDaGFydC5cbmV4cG9ydCBmdW5jdGlvbiBDb21wdXRlU2xhY2soXG4gIGM6IENoYXJ0LFxuICB0YXNrRHVyYXRpb246IFRhc2tEdXJhdGlvbiB8IG51bGwgPSBudWxsLFxuICByb3VuZDogUm91bmRlclxuKTogU2xhY2tSZXN1bHQge1xuICBpZiAodGFza0R1cmF0aW9uID09PSBudWxsKSB7XG4gICAgdGFza0R1cmF0aW9uID0gKHRhc2tJbmRleDogbnVtYmVyKSA9PiBjLlZlcnRpY2VzW3Rhc2tJbmRleF0uZHVyYXRpb247XG4gIH1cblxuICAvLyBDcmVhdGUgYSBTbGFjayBmb3IgZWFjaCBUYXNrLlxuICBjb25zdCBzbGFja3M6IFNsYWNrW10gPSBuZXcgQXJyYXkoYy5WZXJ0aWNlcy5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGMuVmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBzbGFja3NbaV0gPSBuZXcgU2xhY2soKTtcbiAgfVxuXG4gIGNvbnN0IHIgPSBDaGFydFZhbGlkYXRlKGMsIHRhc2tEdXJhdGlvbik7XG4gIGlmICghci5vaykge1xuICAgIHJldHVybiBlcnJvcihyLmVycm9yKTtcbiAgfVxuXG4gIGNvbnN0IGVkZ2VzID0gZWRnZXNCeVNyY0FuZERzdFRvTWFwKGMuRWRnZXMpO1xuXG4gIGNvbnN0IHRvcG9sb2dpY2FsT3JkZXIgPSByLnZhbHVlO1xuXG4gIC8vIEZpcnN0IGdvIGZvcndhcmQgdGhyb3VnaCB0aGUgdG9wb2xvZ2ljYWwgc29ydCBhbmQgZmluZCB0aGUgZWFybHkgc3RhcnQgZm9yXG4gIC8vIGVhY2ggdGFzaywgd2hpY2ggaXMgdGhlIG1heCBvZiBhbGwgdGhlIHByZWRlY2Vzc29ycyBlYXJseSBmaW5pc2ggdmFsdWVzLlxuICAvLyBTaW5jZSB3ZSBrbm93IHRoZSBkdXJhdGlvbiB3ZSBjYW4gYWxzbyBjb21wdXRlIHRoZSBlYXJseSBmaW5pc2guXG4gIHRvcG9sb2dpY2FsT3JkZXIuc2xpY2UoMSkuZm9yRWFjaCgodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSBjLlZlcnRpY2VzW3ZlcnRleEluZGV4XTtcbiAgICBjb25zdCBzbGFjayA9IHNsYWNrc1t2ZXJ0ZXhJbmRleF07XG4gICAgc2xhY2suZWFybHkuc3RhcnQgPSBNYXRoLm1heChcbiAgICAgIC4uLmVkZ2VzLmJ5RHN0LmdldCh2ZXJ0ZXhJbmRleCkhLm1hcCgoZTogRGlyZWN0ZWRFZGdlKTogbnVtYmVyID0+IHtcbiAgICAgICAgY29uc3QgcHJlZGVjZXNzb3JTbGFjayA9IHNsYWNrc1tlLmldO1xuICAgICAgICByZXR1cm4gcHJlZGVjZXNzb3JTbGFjay5lYXJseS5maW5pc2g7XG4gICAgICB9KVxuICAgICk7XG4gICAgc2xhY2suZWFybHkuZmluaXNoID0gcm91bmQoc2xhY2suZWFybHkuc3RhcnQgKyB0YXNrRHVyYXRpb24odmVydGV4SW5kZXgpKTtcbiAgfSk7XG5cbiAgLy8gTm93IGJhY2t3YXJkcyB0aHJvdWdoIHRoZSB0b3BvbG9naWNhbCBzb3J0IGFuZCBmaW5kIHRoZSBsYXRlIGZpbmlzaCBvZiBlYWNoXG4gIC8vIHRhc2ssIHdoaWNoIGlzIHRoZSBtaW4gb2YgYWxsIHRoZSBzdWNjZXNzb3IgdGFza3MgbGF0ZSBzdGFydHMuIEFnYWluIHNpbmNlXG4gIC8vIHdlIGtub3cgdGhlIGR1cmF0aW9uIHdlIGNhbiBhbHNvIGNvbXB1dGUgdGhlIGxhdGUgc3RhcnQuIEZpbmFsbHksIHNpbmNlIHdlXG4gIC8vIG5vdyBoYXZlIGFsbCB0aGUgZWFybHkvbGF0ZSBhbmQgc3RhcnQvZmluaXNoIHZhbHVlcyB3ZSBjYW4gbm93IGNhbGN1YXRlIHRoZVxuICAvLyBzbGFjay5cbiAgdG9wb2xvZ2ljYWxPcmRlci5yZXZlcnNlKCkuZm9yRWFjaCgodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSBjLlZlcnRpY2VzW3ZlcnRleEluZGV4XTtcbiAgICBjb25zdCBzbGFjayA9IHNsYWNrc1t2ZXJ0ZXhJbmRleF07XG4gICAgY29uc3Qgc3VjY2Vzc29ycyA9IGVkZ2VzLmJ5U3JjLmdldCh2ZXJ0ZXhJbmRleCk7XG4gICAgaWYgKCFzdWNjZXNzb3JzKSB7XG4gICAgICBzbGFjay5sYXRlLmZpbmlzaCA9IHNsYWNrLmVhcmx5LmZpbmlzaDtcbiAgICAgIHNsYWNrLmxhdGUuc3RhcnQgPSBzbGFjay5lYXJseS5zdGFydDtcbiAgICB9IGVsc2Uge1xuICAgICAgc2xhY2subGF0ZS5maW5pc2ggPSBNYXRoLm1pbihcbiAgICAgICAgLi4uZWRnZXMuYnlTcmMuZ2V0KHZlcnRleEluZGV4KSEubWFwKChlOiBEaXJlY3RlZEVkZ2UpOiBudW1iZXIgPT4ge1xuICAgICAgICAgIGNvbnN0IHN1Y2Nlc3NvclNsYWNrID0gc2xhY2tzW2Uual07XG4gICAgICAgICAgcmV0dXJuIHN1Y2Nlc3NvclNsYWNrLmxhdGUuc3RhcnQ7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgc2xhY2subGF0ZS5zdGFydCA9IHJvdW5kKHNsYWNrLmxhdGUuZmluaXNoIC0gdGFza0R1cmF0aW9uKHZlcnRleEluZGV4KSk7XG4gICAgICBzbGFjay5zbGFjayA9IHJvdW5kKHNsYWNrLmxhdGUuZmluaXNoIC0gc2xhY2suZWFybHkuZmluaXNoKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBvayhzbGFja3MpO1xufVxuXG5leHBvcnQgY29uc3QgQ3JpdGljYWxQYXRoID0gKHNsYWNrczogU2xhY2tbXSwgcm91bmQ6IFJvdW5kZXIpOiBudW1iZXJbXSA9PiB7XG4gIGNvbnN0IHJldDogbnVtYmVyW10gPSBbXTtcbiAgc2xhY2tzLmZvckVhY2goKHNsYWNrOiBTbGFjaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGlmIChcbiAgICAgIHJvdW5kKHNsYWNrLmxhdGUuZmluaXNoIC0gc2xhY2suZWFybHkuZmluaXNoKSA8IE51bWJlci5FUFNJTE9OICYmXG4gICAgICByb3VuZChzbGFjay5lYXJseS5maW5pc2ggLSBzbGFjay5lYXJseS5zdGFydCkgPiBOdW1iZXIuRVBTSUxPTlxuICAgICkge1xuICAgICAgcmV0LnB1c2goaW5kZXgpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXQ7XG59O1xuIiwgImltcG9ydCB7IENoYXJ0LCBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0XCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhblwiO1xuaW1wb3J0IHsgUHJlY2lzaW9uIH0gZnJvbSBcIi4uL3ByZWNpc2lvbi9wcmVjaXNpb25cIjtcbmltcG9ydCB7IENvbXB1dGVTbGFjaywgQ3JpdGljYWxQYXRoIH0gZnJvbSBcIi4uL3NsYWNrL3NsYWNrXCI7XG5pbXBvcnQgeyBKYWNvYmlhbiwgVW5jZXJ0YWludHkgfSBmcm9tIFwiLi4vc3RhdHMvY2RmL3RyaWFuZ3VsYXIvamFjb2JpYW5cIjtcblxuY29uc3QgTUFYX1JBTkRPTSA9IDEwMDA7XG5cbmNvbnN0IHByZWNpc2lvbiA9IG5ldyBQcmVjaXNpb24oMik7XG5cbmNvbnN0IHJuZEludCA9IChuOiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbik7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIENyaXRpY2FsUGF0aEVudHJ5IHtcbiAgY291bnQ6IG51bWJlcjtcbiAgY3JpdGljYWxQYXRoOiBudW1iZXJbXTtcbiAgZHVyYXRpb25zOiBudW1iZXJbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDcml0aWNhbFBhdGhUYXNrRW50cnkge1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgZHVyYXRpb246IG51bWJlcjtcbiAgbnVtVGltZXNBcHBlYXJlZDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNpbXVsYXRpb25SZXN1bHRzIHtcbiAgcGF0aHM6IE1hcDxzdHJpbmcsIENyaXRpY2FsUGF0aEVudHJ5PjtcbiAgdGFza3M6IENyaXRpY2FsUGF0aFRhc2tFbnRyeVtdO1xufVxuXG4vKipcbiAqIFNpbXVsYXRlIHRoZSB1bmNlcnRhaW50eSBpbiB0aGUgcGxhbiBhbmQgZ2VuZXJhdGUgcG9zc2libGUgYWx0ZXJuYXRlIGNyaXRpY2FsXG4gKiBwYXRocy5cbiAqL1xuZXhwb3J0IGNvbnN0IHNpbXVsYXRpb24gPSAoXG4gIGNoYXJ0OiBDaGFydCxcbiAgbnVtU2ltdWxhdGlvbkxvb3BzOiBudW1iZXIsXG4gIG9yaWdpbmFsQ3JpdGljYWxQYXRoOiBudW1iZXJbXVxuKTogU2ltdWxhdGlvblJlc3VsdHMgPT4ge1xuICBjb25zdCBhbGxDcml0aWNhbFBhdGhzID0gbmV3IE1hcDxzdHJpbmcsIENyaXRpY2FsUGF0aEVudHJ5PigpO1xuICBhbGxDcml0aWNhbFBhdGhzLnNldChgJHtvcmlnaW5hbENyaXRpY2FsUGF0aH1gLCB7XG4gICAgY291bnQ6IDAsXG4gICAgY3JpdGljYWxQYXRoOiBvcmlnaW5hbENyaXRpY2FsUGF0aC5zbGljZSgpLFxuICAgIGR1cmF0aW9uczogY2hhcnQuVmVydGljZXMubWFwKCh0YXNrOiBUYXNrKSA9PiB0YXNrLmR1cmF0aW9uKSxcbiAgfSk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1TaW11bGF0aW9uTG9vcHM7IGkrKykge1xuICAgIC8vIEdlbmVyYXRlIHJhbmRvbSBkdXJhdGlvbnMgYmFzZWQgb24gZWFjaCBUYXNrcyB1bmNlcnRhaW50eS5cbiAgICBjb25zdCBkdXJhdGlvbnMgPSBjaGFydC5WZXJ0aWNlcy5tYXAoKHQ6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IHJhd0R1cmF0aW9uID0gbmV3IEphY29iaWFuKFxuICAgICAgICB0LmR1cmF0aW9uLCAvLyBBY2NlcHRhYmxlIGRpcmVjdCBhY2Nlc3MgdG8gZHVyYXRpb24uXG4gICAgICAgIHQuZ2V0UmVzb3VyY2UoXCJVbmNlcnRhaW50eVwiKSBhcyBVbmNlcnRhaW50eVxuICAgICAgKS5zYW1wbGUocm5kSW50KE1BWF9SQU5ET00pIC8gTUFYX1JBTkRPTSk7XG4gICAgICByZXR1cm4gcHJlY2lzaW9uLnJvdW5kKHJhd0R1cmF0aW9uKTtcbiAgICB9KTtcblxuICAgIC8vIENvbXB1dGUgdGhlIHNsYWNrIGJhc2VkIG9uIHRob3NlIHJhbmRvbSBkdXJhdGlvbnMuXG4gICAgY29uc3Qgc2xhY2tzUmV0ID0gQ29tcHV0ZVNsYWNrKFxuICAgICAgY2hhcnQsXG4gICAgICAodGFza0luZGV4OiBudW1iZXIpID0+IGR1cmF0aW9uc1t0YXNrSW5kZXhdLFxuICAgICAgcHJlY2lzaW9uLnJvdW5kZXIoKVxuICAgICk7XG4gICAgaWYgKCFzbGFja3NSZXQub2spIHtcbiAgICAgIHRocm93IHNsYWNrc1JldC5lcnJvcjtcbiAgICB9XG5cbiAgICBjb25zdCBjcml0aWNhbFBhdGggPSBDcml0aWNhbFBhdGgoc2xhY2tzUmV0LnZhbHVlLCBwcmVjaXNpb24ucm91bmRlcigpKTtcbiAgICBjb25zdCBjcml0aWNhbFBhdGhBc1N0cmluZyA9IGAke2NyaXRpY2FsUGF0aH1gO1xuICAgIGxldCBwYXRoRW50cnkgPSBhbGxDcml0aWNhbFBhdGhzLmdldChjcml0aWNhbFBhdGhBc1N0cmluZyk7XG4gICAgaWYgKHBhdGhFbnRyeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXRoRW50cnkgPSB7XG4gICAgICAgIGNvdW50OiAwLFxuICAgICAgICBjcml0aWNhbFBhdGg6IGNyaXRpY2FsUGF0aCxcbiAgICAgICAgZHVyYXRpb25zOiBkdXJhdGlvbnMsXG4gICAgICB9O1xuICAgICAgYWxsQ3JpdGljYWxQYXRocy5zZXQoY3JpdGljYWxQYXRoQXNTdHJpbmcsIHBhdGhFbnRyeSk7XG4gICAgfVxuICAgIHBhdGhFbnRyeS5jb3VudCsrO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwYXRoczogYWxsQ3JpdGljYWxQYXRocyxcbiAgICB0YXNrczogY3JpdGljYWxUYXNrRnJlcXVlbmNpZXMoYWxsQ3JpdGljYWxQYXRocywgY2hhcnQpLFxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGNyaXRpY2FsVGFza0ZyZXF1ZW5jaWVzID0gKFxuICBhbGxDcml0aWNhbFBhdGhzOiBNYXA8c3RyaW5nLCBDcml0aWNhbFBhdGhFbnRyeT4sXG4gIGNoYXJ0OiBDaGFydFxuKTogQ3JpdGljYWxQYXRoVGFza0VudHJ5W10gPT4ge1xuICBjb25zdCBjcml0aWFsVGFza3M6IE1hcDxudW1iZXIsIENyaXRpY2FsUGF0aFRhc2tFbnRyeT4gPSBuZXcgTWFwKCk7XG5cbiAgYWxsQ3JpdGljYWxQYXRocy5mb3JFYWNoKCh2YWx1ZTogQ3JpdGljYWxQYXRoRW50cnkpID0+IHtcbiAgICB2YWx1ZS5jcml0aWNhbFBhdGguZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGxldCB0YXNrRW50cnkgPSBjcml0aWFsVGFza3MuZ2V0KHRhc2tJbmRleCk7XG4gICAgICBpZiAodGFza0VudHJ5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGFza0VudHJ5ID0ge1xuICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgIGR1cmF0aW9uOiBjaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLmR1cmF0aW9uLFxuICAgICAgICAgIG51bVRpbWVzQXBwZWFyZWQ6IDAsXG4gICAgICAgIH07XG4gICAgICAgIGNyaXRpYWxUYXNrcy5zZXQodGFza0luZGV4LCB0YXNrRW50cnkpO1xuICAgICAgfVxuICAgICAgdGFza0VudHJ5Lm51bVRpbWVzQXBwZWFyZWQgKz0gdmFsdWUuY291bnQ7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBbLi4uY3JpdGlhbFRhc2tzLnZhbHVlcygpXS5zb3J0KFxuICAgIChhOiBDcml0aWNhbFBhdGhUYXNrRW50cnksIGI6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSk6IG51bWJlciA9PiB7XG4gICAgICByZXR1cm4gYi5kdXJhdGlvbiAtIGEuZHVyYXRpb247XG4gICAgfVxuICApO1xufTtcbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhblwiO1xuaW1wb3J0IHtcbiAgQ3JpdGljYWxQYXRoRW50cnksXG4gIENyaXRpY2FsUGF0aFRhc2tFbnRyeSxcbiAgU2ltdWxhdGlvblJlc3VsdHMsXG4gIHNpbXVsYXRpb24sXG59IGZyb20gXCIuLi9zaW11bGF0aW9uL3NpbXVsYXRpb25cIjtcbmltcG9ydCB7IENoYXJ0IH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0XCI7XG5pbXBvcnQgeyBkaWZmZXJlbmNlIH0gZnJvbSBcIi4uL2RhZy9hbGdvcml0aG1zL2NpcmN1bGFyXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2ltdWxhdGlvblNlbGVjdERldGFpbHMge1xuICBkdXJhdGlvbnM6IG51bWJlcltdIHwgbnVsbDtcbiAgY3JpdGljYWxQYXRoOiBudW1iZXJbXTtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwIHtcbiAgICBcInNpbXVsYXRpb24tc2VsZWN0XCI6IEN1c3RvbUV2ZW50PFNpbXVsYXRpb25TZWxlY3REZXRhaWxzPjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2ltdWxhdGlvblBhbmVsIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICByZXN1bHRzOiBTaW11bGF0aW9uUmVzdWx0cyA9IHtcbiAgICBwYXRoczogbmV3IE1hcCgpLFxuICAgIHRhc2tzOiBbXSxcbiAgfTtcbiAgY2hhcnQ6IENoYXJ0IHwgbnVsbCA9IG51bGw7XG4gIG51bVNpbXVsYXRpb25Mb29wczogbnVtYmVyID0gMDtcbiAgb3JpZ2luYWxDcml0aWNhbFBhdGg6IG51bWJlcltdID0gW107XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHNpbXVsYXRlKFxuICAgIGNoYXJ0OiBDaGFydCxcbiAgICBudW1TaW11bGF0aW9uTG9vcHM6IG51bWJlcixcbiAgICBvcmlnaW5hbENyaXRpY2FsUGF0aDogbnVtYmVyW11cbiAgKTogbnVtYmVyW10ge1xuICAgIHRoaXMucmVzdWx0cyA9IHNpbXVsYXRpb24oY2hhcnQsIG51bVNpbXVsYXRpb25Mb29wcywgb3JpZ2luYWxDcml0aWNhbFBhdGgpO1xuICAgIHRoaXMuY2hhcnQgPSBjaGFydDtcbiAgICB0aGlzLm51bVNpbXVsYXRpb25Mb29wcyA9IG51bVNpbXVsYXRpb25Mb29wcztcbiAgICB0aGlzLm9yaWdpbmFsQ3JpdGljYWxQYXRoID0gb3JpZ2luYWxDcml0aWNhbFBhdGg7XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHJldHVybiB0aGlzLnJlc3VsdHMudGFza3MubWFwKFxuICAgICAgKHRhc2tFbnRyeTogQ3JpdGljYWxQYXRoVGFza0VudHJ5KSA9PiB0YXNrRW50cnkudGFza0luZGV4XG4gICAgKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMucmVzdWx0cyA9IHtcbiAgICAgIHBhdGhzOiBuZXcgTWFwKCksXG4gICAgICB0YXNrczogW10sXG4gICAgfTtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8U2ltdWxhdGlvblNlbGVjdERldGFpbHM+KFwic2ltdWxhdGlvbi1zZWxlY3RcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBkdXJhdGlvbnM6IG51bGwsXG4gICAgICAgICAgY3JpdGljYWxQYXRoOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcGF0aENsaWNrZWQoa2V5OiBzdHJpbmcpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8U2ltdWxhdGlvblNlbGVjdERldGFpbHM+KFwic2ltdWxhdGlvbi1zZWxlY3RcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBkdXJhdGlvbnM6IHRoaXMucmVzdWx0cy5wYXRocy5nZXQoa2V5KSEuZHVyYXRpb25zLFxuICAgICAgICAgIGNyaXRpY2FsUGF0aDogdGhpcy5yZXN1bHRzLnBhdGhzLmdldChrZXkpIS5jcml0aWNhbFBhdGgsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmVuZGVyKHRoaXMudGVtcGxhdGUoKSwgdGhpcyk7XG4gIH1cblxuICBkaXNwbGF5Q3JpdGljYWxQYXRoRGlmZmVyZW5jZXMoY3JpdGljYWxQYXRoOiBudW1iZXJbXSk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdCByZW1vdmVkID0gZGlmZmVyZW5jZSh0aGlzLm9yaWdpbmFsQ3JpdGljYWxQYXRoLCBjcml0aWNhbFBhdGgpO1xuICAgIGNvbnN0IGFkZGVkID0gZGlmZmVyZW5jZShjcml0aWNhbFBhdGgsIHRoaXMub3JpZ2luYWxDcml0aWNhbFBhdGgpO1xuICAgIGlmIChyZW1vdmVkLmxlbmd0aCA9PT0gMCAmJiBhZGRlZC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBodG1sYE9yaWdpbmFsIENyaXRpY2FsIFBhdGhgO1xuICAgIH1cbiAgICByZXR1cm4gaHRtbGBcbiAgICAgICR7YWRkZWQubWFwKFxuICAgICAgICAodGFza0luZGV4OiBudW1iZXIpID0+IGh0bWxgXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJhZGRlZFwiPiske3RoaXMuY2hhcnQhLlZlcnRpY2VzW3Rhc2tJbmRleF0ubmFtZX08L3NwYW4+XG4gICAgICAgIGBcbiAgICAgICl9XG4gICAgICAke3JlbW92ZWQubWFwKFxuICAgICAgICAodGFza0luZGV4OiBudW1iZXIpID0+IGh0bWxgXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJyZW1vdmVkXCI+LSR7dGhpcy5jaGFydCEuVmVydGljZXNbdGFza0luZGV4XS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgYFxuICAgICAgKX1cbiAgICBgO1xuICB9XG5cbiAgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGlmICh0aGlzLnJlc3VsdHMucGF0aHMuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIGh0bWxgYDtcbiAgICB9XG4gICAgY29uc3QgcGF0aEtleXMgPSBbLi4udGhpcy5yZXN1bHRzLnBhdGhzLmtleXMoKV07XG4gICAgY29uc3Qgc29ydGVkUGF0aEtleXMgPSBwYXRoS2V5cy5zb3J0KChhOiBzdHJpbmcsIGI6IHN0cmluZykgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdGhpcy5yZXN1bHRzLnBhdGhzLmdldChiKSEuY291bnQgLSB0aGlzLnJlc3VsdHMucGF0aHMuZ2V0KGEpIS5jb3VudFxuICAgICAgKTtcbiAgICB9KTtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxidXR0b25cbiAgICAgICAgQGNsaWNrPSR7KCkgPT4ge1xuICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgQ2xlYXJcbiAgICAgIDwvYnV0dG9uPlxuXG4gICAgICA8dGFibGUgY2xhc3M9XCJwYXRoc1wiPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPkNvdW50PC90aD5cbiAgICAgICAgICA8dGg+Q3JpdGljYWwgUGF0aDwvdGg+XG4gICAgICAgIDwvdHI+XG4gICAgICAgICR7c29ydGVkUGF0aEtleXMubWFwKFxuICAgICAgICAgIChrZXk6IHN0cmluZykgPT5cbiAgICAgICAgICAgIGh0bWxgPHRyIEBjbGljaz0keygpID0+IHRoaXMucGF0aENsaWNrZWQoa2V5KX0+XG4gICAgICAgICAgICAgIDx0ZD4ke3RoaXMucmVzdWx0cy5wYXRocy5nZXQoa2V5KSEuY291bnR9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICR7dGhpcy5kaXNwbGF5Q3JpdGljYWxQYXRoRGlmZmVyZW5jZXMoXG4gICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHMucGF0aHMuZ2V0KGtleSkhLmNyaXRpY2FsUGF0aFxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgKX1cbiAgICAgIDwvdGFibGU+XG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+TmFtZTwvdGg+XG4gICAgICAgICAgPHRoPkR1cmF0aW9uPC90aD5cbiAgICAgICAgICA8dGg+RnJlcXVlbmN5ICglKTwvdGg+XG4gICAgICAgIDwvdHI+XG4gICAgICAgICR7dGhpcy5yZXN1bHRzLnRhc2tzLm1hcChcbiAgICAgICAgICAodGFza0VudHJ5OiBDcml0aWNhbFBhdGhUYXNrRW50cnkpID0+XG4gICAgICAgICAgICBodG1sYDx0cj5cbiAgICAgICAgICAgICAgPHRkPiR7dGhpcy5jaGFydCEuVmVydGljZXNbdGFza0VudHJ5LnRhc2tJbmRleF0ubmFtZX08L3RkPlxuICAgICAgICAgICAgICA8dGQ+JHt0YXNrRW50cnkuZHVyYXRpb259PC90ZD5cbiAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICR7TWF0aC5mbG9vcihcbiAgICAgICAgICAgICAgICAgICgxMDAgKiB0YXNrRW50cnkubnVtVGltZXNBcHBlYXJlZCkgLyB0aGlzLm51bVNpbXVsYXRpb25Mb29wc1xuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgKX1cbiAgICAgIDwvdGFibGU+XG4gICAgYDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJzaW11bGF0aW9uLXBhbmVsXCIsIFNpbXVsYXRpb25QYW5lbCk7XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi9leHBsYW5NYWluL2V4cGxhbk1haW4udHNcIjtcbmltcG9ydCB7IFNlYXJjaFR5cGUsIFRhc2tTZWFyY2hDb250cm9sIH0gZnJvbSBcIi4vdGFzay1zZWFyY2gtY29udHJvbHMudHNcIjtcblxuLyoqIFVzZXMgYSB0YXNrLXNlYXJjaC1jb250cm9sIHRvIHNlYXJjaCB0aHJvdWdoIGFsbCBUYXNrcy4gKi9cbmV4cG9ydCBjbGFzcyBTZWFyY2hUYXNrUGFuZWwgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW4gfCBudWxsID0gbnVsbDtcbiAgdGFza1NlYXJjaENvbnRyb2w6IFRhc2tTZWFyY2hDb250cm9sIHwgbnVsbCA9IG51bGw7XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5leHBsYW5NYWluID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImV4cGxhbi1tYWluXCIpO1xuICAgIGlmICghdGhpcy5leHBsYW5NYWluKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2wgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJ0YXNrLXNlYXJjaC1jb250cm9sXCIpO1xuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcInRhc2stY2hhbmdlXCIsIChlKSA9PiB7XG4gICAgICB0aGlzLmV4cGxhbk1haW4hLnNldFNlbGVjdGlvbihlLmRldGFpbC50YXNrSW5kZXgsIGUuZGV0YWlsLmZvY3VzLCB0cnVlKTtcbiAgICB9KTtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJ0YXNrLWZvY3VzXCIsIChlKSA9PlxuICAgICAgdGhpcy5zZXRLZXlib2FyZEZvY3VzVG9JbnB1dChcImZ1bGwtaW5mb1wiKVxuICAgICk7XG4gIH1cblxuICBzZXRLZXlib2FyZEZvY3VzVG9JbnB1dChzZWFyY2hUeXBlOiBTZWFyY2hUeXBlKSB7XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEudGFza3MgPSB0aGlzLmV4cGxhbk1haW4hLnBsYW4uY2hhcnQuVmVydGljZXM7XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEuaW5jbHVkZWRJbmRleGVzID0gW107XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEuc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoc2VhcmNoVHlwZSk7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwic2VhcmNoLXRhc2stcGFuZWxcIiwgU2VhcmNoVGFza1BhbmVsKTtcbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQgZnV6enlzb3J0IGZyb20gXCJmdXp6eXNvcnRcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcblxuaW50ZXJmYWNlIFRhc2tDaGFuZ2VEZXRhaWwge1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgZm9jdXM6IGJvb2xlYW47XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJ0YXNrLWNoYW5nZVwiOiBDdXN0b21FdmVudDxUYXNrQ2hhbmdlRGV0YWlsPjtcbiAgICBcInRhc2stZm9jdXNcIjogQ3VzdG9tRXZlbnQ8bnVsbD47XG4gIH1cbn1cblxuLyoqIFRoZSBpbmRleGVzIHJldHVybmVkIGJ5IGZ1enp5c29ydCBpcyBqdXN0IGEgbGlzdCBvZiB0aGUgaW5kZXhlcyBvZiB0aGUgdGhlXG4gKiAgaW5kaXZpZHVhbCBjaGFycyB0aGF0IGhhdmUgYmVlbiBtYXRjaGVkLiBXZSBuZWVkIHRvIHR1cm4gdGhhdCBpbnRvIHBhaXJzIG9mXG4gKiAgbnVtYmVycyB3ZSBjYW4gcGFzcyB0byBTdHJpbmcucHJvdG90eXBlLnNsaWNlKCkuXG4gKlxuICogIFRoZSBvYnNlcnZhdGlvbiBoZXJlIGlzIHRoYXQgaWYgdGhlIHRhcmdldCBzdHJpbmcgaXMgXCJIZWxsb1wiIGFuZCB0aGUgaW5kaWNlc1xuICogIGFyZSBbMiwzXSB0aGVuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHdlIG1hcmt1cCB0aGUgaGlnaGxpZ2h0ZWQgdGFyZ2V0IGFzXG4gKiAgXCJIZTxiPmxsPC9iPm9cIiBvciBcIkhlPGI+bDwvYj48Yj5sPC9iPm9cIi4gVGhhdCBpcywgd2UgY2FuIHNpbXBsaWZ5IGlmIHdlXG4gKiAgYWx3YXlzIHNsaWNlIG91dCBlYWNoIGNoYXJhY3RlciBpbiB0aGUgdGFyZ2V0IHN0cmluZyB0aGF0IG5lZWRzIHRvIGJlXG4gKiAgaGlnaGxpZ2h0ZWQuXG4gKlxuICogIFNvIGluZGV4ZXNUb1JhbmdlcyByZXR1cm5zIGFuIGFycmF5IG9mIGluZGV4ZXMsIHRoYXQgaWYgdGFrZW4gaW4gcGFpcnMsIHdpbGxcbiAqICBhbHRlcm5hdGVseSBzbGljZSBvZmYgcGFydHMgb2YgdGFyZ2V0IHRoYXQgbmVlZCB0byBiZSBlbXBoYXNpemVkLlxuICpcbiAqICBJbiB0aGUgYWJvdmUgZXhhbXBsZSB0YXJnZXQgPSBcIkhlbGxvXCIgYW5kIGluZGV4ZXMgPSBbMiwzXSwgdGhlblxuICogIGluZGV4ZXNUb1JhbmdlcyB3aWxsIHJldHVyblwiXG4gKlxuICogICAgIFswLDIsMywzLDQsNV1cbiAqXG4gKiAgd2hpY2ggd2lsbCBnZW5lcmF0ZSB0aGUgZm9sbG93aW5nIHBhaXJzIGFzIGFyZ3MgdG8gc2xpY2U6XG4gKlxuICogICAgIFswLDJdIEhlXG4gKiAgICAgWzIsM10gbCAgICNcbiAqICAgICBbMywzXVxuICogICAgIFszLDRdIGwgICAjXG4gKiAgICAgWzQsNV0gb1xuICpcbiAqIE5vdGUgdGhhdCBpZiB3ZSBhbHRlcm5hdGUgYm9sZGluZyB0aGVuIG9ubHkgdGhlIHR3byAnbCdzIGdldCBlbXBoYXNpemVkLFxuICogd2hpY2ggaXMgd2hhdCB3ZSB3YW50IChEZW5vdGVkIGJ5ICMgYWJvdmUpLlxuICovXG5jb25zdCBpbmRleGVzVG9SYW5nZXMgPSAoXG4gIGluZGV4ZXM6IFJlYWRvbmx5PG51bWJlcltdPixcbiAgbGVuOiBudW1iZXJcbik6IG51bWJlcltdID0+IHtcbiAgLy8gQ29udmVydCBlYWNoIGluZGV4IG9mIGEgaGlnaGxpZ2h0ZWQgY2hhciBpbnRvIGEgcGFpciBvZiBudW1iZXJzIHdlIGNhbiBwYXNzXG4gIC8vIHRvIHNsaWNlLCBhbmQgdGhlbiBmbGF0dGVuLlxuICBjb25zdCByYW5nZXMgPSBpbmRleGVzLm1hcCgoeDogbnVtYmVyKSA9PiBbeCwgeCArIDFdKS5mbGF0KCk7XG5cbiAgLy8gTm93IHByZXBlbmQgd2l0aCAwIGFuZCBhcHBlbmQgJ2xlbicgc28gdGhhdCB3ZSBoYXZlIHBhaXJzIHRoYXQgd2lsbCBzbGljZVxuICAvLyB0YXJnZXQgZnVsbHkgaW50byBzdWJzdHJpbmdzLiBSZW1lbWJlciB0aGF0IHNsaWNlIHJldHVybnMgY2hhcnMgaW4gW2EsIGIpLFxuICAvLyBpLmUuIFN0cmluZy5zbGljZShhLGIpIHdoZXJlIGIgaXMgb25lIGJleW9uZCB0aGUgbGFzdCBjaGFyIGluIHRoZSBzdHJpbmcgd2VcbiAgLy8gd2FudCB0byBpbmNsdWRlLlxuICByZXR1cm4gWzAsIC4uLnJhbmdlcywgbGVuXTtcbn07XG5cbi8qKiBSZXR1cm5zIHRoZSB0YXJnZXQgc3RyaW5nIGhpZ2hsaWdodGVkIGFyb3VuZCB0aGUgZ2l2ZW4gY2hhcmFjdGVyIGluZGV4ZXMgaW5cbiAqICB0aGUgcmFuZ2VzIGFycmF5LiAqL1xuY29uc3QgaGlnaGxpZ2h0ID0gKHJhbmdlczogbnVtYmVyW10sIHRhcmdldDogc3RyaW5nKTogVGVtcGxhdGVSZXN1bHRbXSA9PiB7XG4gIGNvbnN0IHJldDogVGVtcGxhdGVSZXN1bHRbXSA9IFtdO1xuICBsZXQgaW5IaWdobGlnaHQgPSBmYWxzZTtcblxuICAvLyBSdW4gZG93biByYW5nZXMgd2l0aCBhIHNsaWRpbmcgd2luZG93IG9mIGxlbmd0aCAyIGFuZCB1c2UgdGhhdCBhcyB0aGVcbiAgLy8gYXJndW1lbnRzIHRvIHNsaWNlLiBBbHRlcm5hdGUgaGlnaGxpZ2h0aW5nIGVhY2ggc2VnbWVudC5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgY29uc3Qgc3ViID0gdGFyZ2V0LnNsaWNlKHJhbmdlc1tpXSwgcmFuZ2VzW2kgKyAxXSk7XG4gICAgaWYgKGluSGlnaGxpZ2h0KSB7XG4gICAgICByZXQucHVzaChodG1sYDxiPiR7c3VifTwvYj5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0LnB1c2goaHRtbGAke3N1Yn1gKTtcbiAgICB9XG4gICAgaW5IaWdobGlnaHQgPSAhaW5IaWdobGlnaHQ7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKiBSZXR1cm5zIHRoZSB0YXJnZXQgc3RyaW5nIGhpZ2hsaWdodGVkIGFyb3VuZCB0aGUgZ2l2ZW4gY2hhcmFjdGVyIGluZGV4ZXMuXG4gKiAgTm90ZSB0aGF0IHdlIGRvbid0IHVzZSBmdXp6eXNvcnQncyBoaWdobGlnaHQgYmVjYXVzZSB3ZSBoYXZlbid0IHNhbml0aXplZFxuICogIHRoZSBuYW1lcy5cbiAqL1xuY29uc3QgaGlnaGxpZ2h0ZWRUYXJnZXQgPSAoXG4gIGluZGV4ZXM6IFJlYWRvbmx5PG51bWJlcltdPixcbiAgdGFyZ2V0OiBzdHJpbmdcbik6IFRlbXBsYXRlUmVzdWx0W10gPT4ge1xuICByZXR1cm4gaGlnaGxpZ2h0KGluZGV4ZXNUb1JhbmdlcyhpbmRleGVzLCB0YXJnZXQubGVuZ3RoKSwgdGFyZ2V0KTtcbn07XG5cbmNvbnN0IHRlbXBsYXRlID0gKHNlYXJjaFRhc2tQYW5lbDogVGFza1NlYXJjaENvbnRyb2wpID0+IGh0bWxgXG4gIDxpbnB1dFxuICAgIHBsYWNlaG9sZGVyPVwiU2VhcmNoXCJcbiAgICB0eXBlPVwidGV4dFwiXG4gICAgQGlucHV0PVwiJHsoZTogSW5wdXRFdmVudCkgPT4gc2VhcmNoVGFza1BhbmVsLm9uSW5wdXQoZSl9XCJcbiAgICBAa2V5ZG93bj1cIiR7KGU6IEtleWJvYXJkRXZlbnQpID0+IHNlYXJjaFRhc2tQYW5lbC5vbktleURvd24oZSl9XCJcbiAgICBAYmx1cj1cIiR7KCkgPT4gc2VhcmNoVGFza1BhbmVsLmxvc3NPZkZvY3VzKCl9XCJcbiAgICBAZm9jdXM9XCIkeygpID0+IHNlYXJjaFRhc2tQYW5lbC5zZWFyY2hJbnB1dFJlY2VpdmVkRm9jdXMoKX1cIlxuICAvPlxuICA8dWw+XG4gICAgJHtzZWFyY2hUYXNrUGFuZWwuc2VhcmNoUmVzdWx0cy5tYXAoXG4gICAgICAodGFzazogRnV6enlzb3J0LktleVJlc3VsdDxUYXNrPiwgaW5kZXg6IG51bWJlcikgPT5cbiAgICAgICAgaHRtbGAgPGxpXG4gICAgICAgICAgQGNsaWNrPVwiJHsoKSA9PiBzZWFyY2hUYXNrUGFuZWwuc2VsZWN0U2VhcmNoUmVzdWx0KGluZGV4LCBmYWxzZSl9XCJcbiAgICAgICAgICA/ZGF0YS1mb2N1cz0ke2luZGV4ID09PSBzZWFyY2hUYXNrUGFuZWwuZm9jdXNJbmRleH1cbiAgICAgICAgPlxuICAgICAgICAgICR7aGlnaGxpZ2h0ZWRUYXJnZXQodGFzay5pbmRleGVzLCB0YXNrLnRhcmdldCl9XG4gICAgICAgIDwvbGk+YFxuICAgICl9XG4gIDwvdWw+XG5gO1xuXG5leHBvcnQgdHlwZSBTZWFyY2hUeXBlID0gXCJuYW1lLW9ubHlcIiB8IFwiZnVsbC1pbmZvXCI7XG5cbmNvbnN0IHNlYXJjaFN0cmluZ0Zyb21UYXNrQnVpbGRlciA9IChcbiAgZnVsbFRhc2tMaXN0OiBUYXNrW10sXG4gIHNlYXJjaFR5cGU6IFNlYXJjaFR5cGUsXG4gIGluY2x1ZGVkSW5kZXhlczogU2V0PG51bWJlcj4sXG4gIG1heE5hbWVMZW5ndGg6IG51bWJlclxuKTogKCh0YXNrOiBUYXNrKSA9PiBzdHJpbmcpID0+IHtcbiAgaWYgKHNlYXJjaFR5cGUgPT09IFwiZnVsbC1pbmZvXCIpIHtcbiAgICByZXR1cm4gKHRhc2s6IFRhc2spOiBzdHJpbmcgPT4ge1xuICAgICAgaWYgKGluY2x1ZGVkSW5kZXhlcy5zaXplICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IHRhc2tJbmRleCA9IGZ1bGxUYXNrTGlzdC5pbmRleE9mKHRhc2spO1xuICAgICAgICBpZiAoIWluY2x1ZGVkSW5kZXhlcy5oYXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCByZXNvdXJjZUtleXMgPSBPYmplY3Qua2V5cyh0YXNrLnJlc291cmNlcyk7XG4gICAgICByZXNvdXJjZUtleXMuc29ydCgpO1xuICAgICAgcmV0dXJuIGAke3Rhc2submFtZX0gJHtcIi1cIi5yZXBlYXQobWF4TmFtZUxlbmd0aCAtIHRhc2submFtZS5sZW5ndGggKyAyKX0gJHtyZXNvdXJjZUtleXNcbiAgICAgICAgLm1hcCgoa2V5OiBzdHJpbmcpID0+IHRhc2sucmVzb3VyY2VzW2tleV0pXG4gICAgICAgIC5qb2luKFwiIFwiKX1gO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICh0YXNrOiBUYXNrKTogc3RyaW5nID0+IHtcbiAgICAgIGlmIChpbmNsdWRlZEluZGV4ZXMuc2l6ZSAhPT0gMCkge1xuICAgICAgICBjb25zdCB0YXNrSW5kZXggPSBmdWxsVGFza0xpc3QuaW5kZXhPZih0YXNrKTtcbiAgICAgICAgaWYgKCFpbmNsdWRlZEluZGV4ZXMuaGFzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRhc2submFtZTtcbiAgICB9O1xuICB9XG59O1xuXG5leHBvcnQgY2xhc3MgVGFza1NlYXJjaENvbnRyb2wgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIF90YXNrczogVGFza1tdID0gW107XG4gIF9pbmNsdWRlZEluZGV4ZXM6IFNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuICBmb2N1c0luZGV4OiBudW1iZXIgPSAwO1xuICBzZWFyY2hSZXN1bHRzOiBGdXp6eXNvcnQuS2V5UmVzdWx0czxUYXNrPiB8IFtdID0gW107XG4gIHNlYXJjaFR5cGU6IFNlYXJjaFR5cGUgPSBcIm5hbWUtb25seVwiO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBvbklucHV0KGU6IElucHV0RXZlbnQpIHtcbiAgICBjb25zdCBtYXhOYW1lTGVuZ3RoID0gdGhpcy5fdGFza3MucmVkdWNlPG51bWJlcj4oXG4gICAgICAocHJldjogbnVtYmVyLCB0YXNrOiBUYXNrKTogbnVtYmVyID0+XG4gICAgICAgIHRhc2submFtZS5sZW5ndGggPiBwcmV2ID8gdGFzay5uYW1lLmxlbmd0aCA6IHByZXYsXG4gICAgICAwXG4gICAgKTtcbiAgICB0aGlzLnNlYXJjaFJlc3VsdHMgPSBmdXp6eXNvcnQuZ288VGFzaz4oXG4gICAgICAoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUsXG4gICAgICB0aGlzLl90YXNrcy5zbGljZSgxLCAtMSksIC8vIFJlbW92ZSBTdGFydCBhbmQgRmluaXNoIGZyb20gc2VhcmNoIHJhbmdlLlxuICAgICAge1xuICAgICAgICBrZXk6IHNlYXJjaFN0cmluZ0Zyb21UYXNrQnVpbGRlcihcbiAgICAgICAgICB0aGlzLl90YXNrcyxcbiAgICAgICAgICB0aGlzLnNlYXJjaFR5cGUsXG4gICAgICAgICAgdGhpcy5faW5jbHVkZWRJbmRleGVzLFxuICAgICAgICAgIG1heE5hbWVMZW5ndGhcbiAgICAgICAgKSxcbiAgICAgICAgbGltaXQ6IDE1LFxuICAgICAgICB0aHJlc2hvbGQ6IDAuMixcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMuZm9jdXNJbmRleCA9IDA7XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIG9uS2V5RG93bihlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKHRoaXMuc2VhcmNoUmVzdWx0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gVE9ETyAtIGV4dHJhY3QgZnJvbSB0aGUgdHdvIHBsYWNlcyB3ZSBkbyB0aGlzLlxuICAgIGNvbnN0IGtleW5hbWUgPSBgJHtlLnNoaWZ0S2V5ID8gXCJzaGlmdC1cIiA6IFwiXCJ9JHtlLmN0cmxLZXkgPyBcImN0cmwtXCIgOiBcIlwifSR7ZS5tZXRhS2V5ID8gXCJtZXRhLVwiIDogXCJcIn0ke2UuYWx0S2V5ID8gXCJhbHQtXCIgOiBcIlwifSR7ZS5rZXl9YDtcbiAgICBzd2l0Y2ggKGtleW5hbWUpIHtcbiAgICAgIGNhc2UgXCJBcnJvd0Rvd25cIjpcbiAgICAgICAgdGhpcy5mb2N1c0luZGV4ID0gKHRoaXMuZm9jdXNJbmRleCArIDEpICUgdGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aDtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgIHRoaXMuZm9jdXNJbmRleCA9XG4gICAgICAgICAgKHRoaXMuZm9jdXNJbmRleCAtIDEgKyB0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoKSAlXG4gICAgICAgICAgdGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aDtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJFbnRlclwiOlxuICAgICAgICBpZiAodGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNlbGVjdFNlYXJjaFJlc3VsdCh0aGlzLmZvY3VzSW5kZXgsIGZhbHNlKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJjdHJsLUVudGVyXCI6XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VsZWN0U2VhcmNoUmVzdWx0KHRoaXMuZm9jdXNJbmRleCwgdHJ1ZSk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgc2VsZWN0U2VhcmNoUmVzdWx0KGluZGV4OiBudW1iZXIsIGZvY3VzOiBib29sZWFuKSB7XG4gICAgY29uc3QgdGFza0luZGV4ID0gdGhpcy5fdGFza3MuaW5kZXhPZih0aGlzLnNlYXJjaFJlc3VsdHNbaW5kZXhdLm9iaik7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgbmV3IEN1c3RvbUV2ZW50PFRhc2tDaGFuZ2VEZXRhaWw+KFwidGFzay1jaGFuZ2VcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICB0YXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICAgICAgICBmb2N1czogZm9jdXMsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gW107XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIHNlYXJjaElucHV0UmVjZWl2ZWRGb2N1cygpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8bnVtYmVyPihcInRhc2stZm9jdXNcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoc2VhcmNoVHlwZTogU2VhcmNoVHlwZSkge1xuICAgIHRoaXMuc2VhcmNoVHlwZSA9IHNlYXJjaFR5cGU7XG4gICAgY29uc3QgaW5wdXRDb250cm9sID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiaW5wdXRcIikhO1xuICAgIGlucHV0Q29udHJvbC5mb2N1cygpO1xuICAgIGlucHV0Q29udHJvbC5zZWxlY3QoKTtcbiAgfVxuXG4gIGxvc3NPZkZvY3VzKCkge1xuICAgIHRoaXMuc2VhcmNoUmVzdWx0cyA9IFtdO1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBwdWJsaWMgc2V0IHRhc2tzKHRhc2tzOiBUYXNrW10pIHtcbiAgICB0aGlzLl90YXNrcyA9IHRhc2tzO1xuICB9XG5cbiAgcHVibGljIHNldCBpbmNsdWRlZEluZGV4ZXModjogbnVtYmVyW10pIHtcbiAgICB0aGlzLl9pbmNsdWRlZEluZGV4ZXMgPSBuZXcgU2V0KHYpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcInRhc2stc2VhcmNoLWNvbnRyb2xcIiwgVGFza1NlYXJjaENvbnRyb2wpO1xuIiwgIi8qKiBBIGNvb3JkaW5hdGUgcG9pbnQgb24gdGhlIHJlbmRlcmluZyBzdXJmYWNlLiAqL1xuZXhwb3J0IGNsYXNzIFBvaW50IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gIH1cblxuICBhZGQoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBQb2ludCB7XG4gICAgdGhpcy54ICs9IHg7XG4gICAgdGhpcy55ICs9IHk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzdW0ocmhzOiBQb2ludCk6IFBvaW50IHtcbiAgICByZXR1cm4gbmV3IFBvaW50KHRoaXMueCArIHJocy54LCB0aGlzLnkgKyByaHMueSk7XG4gIH1cblxuICBlcXVhbChyaHM6IFBvaW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMueCA9PT0gcmhzLnggJiYgdGhpcy55ID09PSByaHMueTtcbiAgfVxuXG4gIHNldChyaHM6IFBvaW50KTogUG9pbnQge1xuICAgIHRoaXMueCA9IHJocy54O1xuICAgIHRoaXMueSA9IHJocy55O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZHVwKCk6IFBvaW50IHtcbiAgICByZXR1cm4gbmV3IFBvaW50KHRoaXMueCwgdGhpcy55KTtcbiAgfVxufVxuIiwgIi8qKlxuICogRnVuY3Rpb25hbGl0eSBmb3IgY3JlYXRpbmcgZHJhZ2dhYmxlIGRpdmlkZXJzIGJldHdlZW4gZWxlbWVudHMgb24gYSBwYWdlLlxuICovXG5pbXBvcnQgeyBjbGFtcCB9IGZyb20gXCIuLi8uLi9tZXRyaWNzL3JhbmdlLnRzXCI7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuLi9zY2FsZS9wb2ludC50c1wiO1xuXG4vLyBWYWx1ZXMgYXJlIHJldHVybmVkIGFzIHBlcmNlbnRhZ2VzIGFyb3VuZCB0aGUgY3VycmVudCBtb3VzZSBsb2NhdGlvbi4gVGhhdFxuLy8gaXMsIGlmIHdlIGFyZSBpbiBcImNvbHVtblwiIG1vZGUgdGhlbiBgYmVmb3JlYCB3b3VsZCBlcXVhbCB0aGUgbW91c2UgcG9zaXRpb25cbi8vIGFzIGEgJSBvZiB0aGUgd2lkdGggb2YgdGhlIHBhcmVudCBlbGVtZW50IGZyb20gdGhlIGxlZnQgaGFuZCBzaWRlIG9mIHRoZVxuLy8gcGFyZW50IGVsZW1lbnQuIFRoZSBgYWZ0ZXJgIHZhbHVlIGlzIGp1c3QgMTAwLWJlZm9yZS5cbmV4cG9ydCBpbnRlcmZhY2UgRGl2aWRlck1vdmVSZXN1bHQge1xuICBiZWZvcmU6IG51bWJlcjtcbiAgYWZ0ZXI6IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgRGl2aWRlclR5cGUgPSBcImNvbHVtblwiIHwgXCJyb3dcIjtcblxuZXhwb3J0IGNvbnN0IERJVklERVJfTU9WRV9FVkVOVCA9IFwiZGl2aWRlcl9tb3ZlXCI7XG5cbmV4cG9ydCBjb25zdCBSRVNJWklOR19DTEFTUyA9IFwicmVzaXppbmdcIjtcblxuaW50ZXJmYWNlIFJlY3Qge1xuICB0b3A6IG51bWJlcjtcbiAgbGVmdDogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbn1cblxuLyoqIFJldHVybnMgYSBib3VuZGluZyByZWN0YW5nbGUgZm9yIGFuIGVsZW1lbnQgaW4gUGFnZSBjb29yZGluYXRlcywgYXMgb3Bwb3NlZFxuICogdG8gVmlld1BvcnQgY29vcmRpbmF0ZXMsIHdoaWNoIGlzIHdoYXQgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgcmV0dXJucy5cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFBhZ2VSZWN0ID0gKGVsZTogSFRNTEVsZW1lbnQpOiBSZWN0ID0+IHtcbiAgY29uc3Qgdmlld3BvcnRSZWN0ID0gZWxlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZXR1cm4ge1xuICAgIHRvcDogdmlld3BvcnRSZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZLFxuICAgIGxlZnQ6IHZpZXdwb3J0UmVjdC5sZWZ0ICsgd2luZG93LnNjcm9sbFgsXG4gICAgd2lkdGg6IHZpZXdwb3J0UmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHZpZXdwb3J0UmVjdC5oZWlnaHQsXG4gIH07XG59O1xuXG4vKiogRGl2aWRlck1vdmUgaXMgY29yZSBmdW5jdGlvbmFsaXR5IGZvciBjcmVhdGluZyBkcmFnZ2FibGUgZGl2aWRlcnMgYmV0d2VlblxuICogZWxlbWVudHMgb24gYSBwYWdlLlxuICpcbiAqIENvbnN0cnVjdCBhIERpdmlkZXJNb2RlIHdpdGggYSBwYXJlbnQgZWxlbWVudCBhbmQgYSBkaXZpZGVyIGVsZW1lbnQsIHdoZXJlXG4gKiB0aGUgZGl2aWRlciBlbGVtZW50IGlzIHRoZSBlbGVtZW50IGJldHdlZW4gb3RoZXIgcGFnZSBlbGVtZW50cyB0aGF0IGlzXG4gKiBleHBlY3RlZCB0byBiZSBkcmFnZ2VkLiBGb3IgZXhhbXBsZSwgaW4gdGhlIGZvbGxvd2luZyBleGFtcGxlICNjb250YWluZXJcbiAqIHdvdWxkIGJlIHRoZSBgcGFyZW50YCwgYW5kICNkaXZpZGVyIHdvdWxkIGJlIHRoZSBgZGl2aWRlcmAgZWxlbWVudC5cbiAqXG4gKiAgPGRpdiBpZD1jb250YWluZXI+XG4gKiAgICA8ZGl2IGlkPWxlZnQ+PC9kaXY+ICA8ZGl2IGlkPWRpdmlkZXI+PC9kaXY+IDxkaXYgaWQ9cmlnaHQ+PC9kaXY/XG4gKiAgPC9kaXY+XG4gKlxuICogRGl2aWRlck1vZGUgd2FpdHMgZm9yIGEgbW91c2Vkb3duIGV2ZW50IG9uIHRoZSBgZGl2aWRlcmAgZWxlbWVudCBhbmQgdGhlblxuICogd2F0Y2hlcyBtb3VzZSBldmVudHMgZm9yIHRoZSBnaXZlbiBwYXJlbnQgSFRNTEVsZW1lbnQgYW5kIGVtaXRzIGV2ZW50cyBhcm91bmRcbiAqIGRyYWdnaW5nLlxuICpcbiAqIFRoZSBlbWl0dGVkIGV2ZW50IGlzIFwiZGl2aWRlcl9tb3ZlXCIgYW5kIGlzIGEgQ3VzdG9tRXZlbnQ8RGl2aWRlck1vdmVSZXN1bHQ+LlxuICpcbiAqIEl0IGlzIHVwIHRvIHRoZSB1c2VyIG9mIERpdmlkZXJNb3ZlIHRvIGxpc3RlbiBmb3IgdGhlIFwiZGl2aWRlcl9tb3ZlXCIgZXZlbnRzXG4gKiBhbmQgdXBkYXRlIHRoZSBDU1Mgb2YgdGhlIHBhZ2UgYXBwcm9wcmlhdGVseSB0byByZWZsZWN0IHRoZSBwb3NpdGlvbiBvZiB0aGVcbiAqIGRpdmlkZXIuXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgZG93biBhbiBldmVudCB3aWxsIGJlIGVtaXR0ZWQgcGVyaW9kaWNhbGx5IGFzIHRoZSBtb3VzZVxuICogbW92ZXMuXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcmVsZWFzZWQsIG9yIGlmIHRoZSBtb3VzZSBleGl0cyB0aGUgcGFyZW50IEhUTUxFbGVtZW50LCBvbmVcbiAqIGxhc3QgZXZlbnQgaXMgZW1pdHRlZC5cbiAqXG4gKiBXaGlsZSBkcmFnZ2luZyB0aGUgZGl2aWRlciwgdGhlIFwicmVzaXppbmdcIiBjbGFzcyB3aWxsIGJlIGFkZGVkIHRvIHRoZSBwYXJlbnRcbiAqIGVsZW1lbnQuIFRoaXMgY2FuIGJlIHVzZWQgdG8gc2V0IGEgc3R5bGUsIGUuZy4gJ3VzZXItc2VsZWN0OiBub25lJy5cbiAqL1xuZXhwb3J0IGNsYXNzIERpdmlkZXJNb3ZlIHtcbiAgLyoqIFRoZSBwb2ludCB3aGVyZSBkcmFnZ2luZyBzdGFydGVkLCBpbiBQYWdlIGNvb3JkaW5hdGVzLiAqL1xuICBiZWdpbjogUG9pbnQgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGRpbWVuc2lvbnMgb2YgdGhlIHBhcmVudCBlbGVtZW50IGluIFBhZ2UgY29vcmRpbmF0ZXMgYXMgb2YgbW91c2Vkb3duXG4gICAqIG9uIHRoZSBkaXZpZGVyLi4gKi9cbiAgcGFyZW50UmVjdDogUmVjdCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgY3VycmVudCBtb3VzZSBwb3NpdGlvbiBpbiBQYWdlIGNvb3JkaW5hdGVzLiAqL1xuICBjdXJyZW50TW92ZUxvY2F0aW9uOiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcblxuICAvKiogVGhlIGxhc3QgbW91c2UgcG9zaXRpb24gaW4gUGFnZSBjb29yZGluYXRlcyByZXBvcnRlZCB2aWEgQ3VzdG9tRXZlbnQuICovXG4gIGxhc3RNb3ZlU2VudDogUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG5cbiAgLyoqIFRoZSBwYXJlbnQgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSBkaXZpZGVyLiAqL1xuICBwYXJlbnQ6IEhUTUxFbGVtZW50O1xuXG4gIC8qKiBUaGUgZGl2aWRlciBlbGVtZW50IHRvIGJlIGRyYWdnZWQgYWNyb3NzIHRoZSBwYXJlbnQgZWxlbWVudC4gKi9cbiAgZGl2aWRlcjogSFRNTEVsZW1lbnQ7XG5cbiAgLyoqIFRoZSBoYW5kbGUgb2YgdGhlIHdpbmRvdy5zZXRJbnRlcnZhbCgpLiAqL1xuICBpbnRlcm52YWxIYW5kbGU6IG51bWJlciA9IDA7XG5cbiAgLyoqIFRoZSB0eXBlIG9mIGRpdmlkZXIsIGVpdGhlciB2ZXJ0aWNhbCAoXCJjb2x1bW5cIiksIG9yIGhvcml6b250YWwgKFwicm93XCIpLiAqL1xuICBkaXZpZGVyVHlwZTogRGl2aWRlclR5cGU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcGFyZW50OiBIVE1MRWxlbWVudCxcbiAgICBkaXZpZGVyOiBIVE1MRWxlbWVudCxcbiAgICBkaXZpZGVyVHlwZTogRGl2aWRlclR5cGUgPSBcImNvbHVtblwiXG4gICkge1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMuZGl2aWRlciA9IGRpdmlkZXI7XG4gICAgdGhpcy5kaXZpZGVyVHlwZSA9IGRpdmlkZXJUeXBlO1xuICAgIHRoaXMuZGl2aWRlci5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZGV0YWNoKCkge1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5kaXZpZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVybnZhbEhhbmRsZSk7XG4gIH1cblxuICBvblRpbWVvdXQoKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24uZXF1YWwodGhpcy5sYXN0TW92ZVNlbnQpKSB7XG4gICAgICBsZXQgZGlmZlBlcmNlbnQ6IG51bWJlciA9IDA7XG4gICAgICBpZiAodGhpcy5kaXZpZGVyVHlwZSA9PT0gXCJjb2x1bW5cIikge1xuICAgICAgICBkaWZmUGVyY2VudCA9XG4gICAgICAgICAgKDEwMCAqICh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCAtIHRoaXMucGFyZW50UmVjdCEubGVmdCkpIC9cbiAgICAgICAgICB0aGlzLnBhcmVudFJlY3QhLndpZHRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlmZlBlcmNlbnQgPVxuICAgICAgICAgICgxMDAgKiAodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnkgLSB0aGlzLnBhcmVudFJlY3QhLnRvcCkpIC9cbiAgICAgICAgICB0aGlzLnBhcmVudFJlY3QhLmhlaWdodDtcbiAgICAgIH1cbiAgICAgIC8vIFRPRE8gLSBTaG91bGQgY2xhbXAgYmUgc2V0dGFibGUgaW4gdGhlIGNvbnN0cnVjdG9yP1xuICAgICAgZGlmZlBlcmNlbnQgPSBjbGFtcChkaWZmUGVyY2VudCwgNSwgOTUpO1xuXG4gICAgICB0aGlzLnBhcmVudC5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQ8RGl2aWRlck1vdmVSZXN1bHQ+KERJVklERVJfTU9WRV9FVkVOVCwge1xuICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgYmVmb3JlOiBkaWZmUGVyY2VudCxcbiAgICAgICAgICAgIGFmdGVyOiAxMDAgLSBkaWZmUGVyY2VudCxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHRoaXMubGFzdE1vdmVTZW50LnNldCh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIG1vdXNlbW92ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnggPSBlLnBhZ2VYO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi55ID0gZS5wYWdlWTtcbiAgfVxuXG4gIG1vdXNlZG93bihlOiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5pbnRlcm52YWxIYW5kbGUgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5vblRpbWVvdXQuYmluZCh0aGlzKSwgMTYpO1xuICAgIHRoaXMucGFyZW50UmVjdCA9IGdldFBhZ2VSZWN0KHRoaXMucGFyZW50KTtcblxuICAgIHRoaXMucGFyZW50LmNsYXNzTGlzdC5hZGQoUkVTSVpJTkdfQ0xBU1MpO1xuXG4gICAgdGhpcy5wYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5iZWdpbiA9IG5ldyBQb2ludChlLnBhZ2VYLCBlLnBhZ2VZKTtcbiAgfVxuXG4gIG1vdXNldXAoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZmluaXNoZWQobmV3IFBvaW50KGUucGFnZVgsIGUucGFnZVkpKTtcbiAgfVxuXG4gIG1vdXNlbGVhdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZmluaXNoZWQobmV3IFBvaW50KGUucGFnZVgsIGUucGFnZVkpKTtcbiAgfVxuXG4gIGZpbmlzaGVkKGVuZDogUG9pbnQpIHtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVybnZhbEhhbmRsZSk7XG5cbiAgICB0aGlzLnBhcmVudC5jbGFzc0xpc3QucmVtb3ZlKFJFU0laSU5HX0NMQVNTKTtcblxuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IGVuZDtcbiAgICB0aGlzLm9uVGltZW91dCgpO1xuICAgIHRoaXMuYmVnaW4gPSBudWxsO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICB0aGlzLmxhc3RNb3ZlU2VudCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4uL3NjYWxlL3BvaW50LnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhZ1JhbmdlIHtcbiAgYmVnaW46IFBvaW50O1xuICBlbmQ6IFBvaW50O1xufVxuXG5leHBvcnQgY29uc3QgRFJBR19SQU5HRV9FVkVOVCA9IFwiZHJhZ3JhbmdlXCI7XG5cbi8qKiBNb3VzZU1vdmUgd2F0Y2hlcyBtb3VzZSBldmVudHMgZm9yIGEgZ2l2ZW4gSFRNTEVsZW1lbnQgYW5kIGVtaXRzXG4gKiBldmVudHMgYXJvdW5kIGRyYWdnaW5nLlxuICpcbiAqIFRoZSBlbWl0dGVkIGV2ZW50IGlzIFwiZHJhZ3JhbmdlXCIgYW5kIGlzIGEgQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPi5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyBwcmVzc2VkIGRvd24gaW4gdGhlIEhUTUxFbGVtZW50IGFuIGV2ZW50IHdpbGwgYmVcbiAqIGVtaXR0ZWQgcGVyaW9kaWNhbGx5IGFzIHRoZSBtb3VzZSBtb3Zlcy5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyByZWxlYXNlZCwgb3IgZXhpdHMgdGhlIEhUTUxFbGVtZW50IG9uZSBsYXN0IGV2ZW50XG4gKiBpcyBlbWl0dGVkLlxuICovXG5leHBvcnQgY2xhc3MgTW91c2VEcmFnIHtcbiAgYmVnaW46IFBvaW50IHwgbnVsbCA9IG51bGw7XG4gIGN1cnJlbnRNb3ZlTG9jYXRpb246IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuICBsYXN0TW92ZVNlbnQ6IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuICBlbGU6IEhUTUxFbGVtZW50O1xuICBpbnRlcm52YWxIYW5kbGU6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoZWxlOiBIVE1MRWxlbWVudCkge1xuICAgIHRoaXMuZWxlID0gZWxlO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGRldGFjaCgpIHtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmludGVybnZhbEhhbmRsZSk7XG4gIH1cblxuICBvblRpbWVvdXQoKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24uZXF1YWwodGhpcy5sYXN0TW92ZVNlbnQpKSB7XG4gICAgICB0aGlzLmVsZS5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPihEUkFHX1JBTkdFX0VWRU5ULCB7XG4gICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICBiZWdpbjogdGhpcy5iZWdpbiEuZHVwKCksXG4gICAgICAgICAgICBlbmQ6IHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi5kdXAoKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHRoaXMubGFzdE1vdmVTZW50LnNldCh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIG1vdXNlbW92ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnggPSBlLm9mZnNldFg7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnkgPSBlLm9mZnNldFk7XG4gIH1cblxuICBtb3VzZWRvd24oZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuaW50ZXJudmFsSGFuZGxlID0gd2luZG93LnNldEludGVydmFsKHRoaXMub25UaW1lb3V0LmJpbmQodGhpcyksIDE2KTtcbiAgICB0aGlzLmJlZ2luID0gbmV3IFBvaW50KGUub2Zmc2V0WCwgZS5vZmZzZXRZKTtcbiAgfVxuXG4gIG1vdXNldXAoZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuZmluaXNoZWQobmV3IFBvaW50KGUub2Zmc2V0WCwgZS5vZmZzZXRZKSk7XG4gIH1cblxuICBtb3VzZWxlYXZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZpbmlzaGVkKG5ldyBQb2ludChlLm9mZnNldFgsIGUub2Zmc2V0WSkpO1xuICB9XG5cbiAgZmluaXNoZWQoZW5kOiBQb2ludCkge1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBlbmQ7XG4gICAgdGhpcy5vblRpbWVvdXQoKTtcbiAgICB0aGlzLmJlZ2luID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgdGhpcy5sYXN0TW92ZVNlbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuLi9zY2FsZS9wb2ludC50c1wiO1xuXG4vKiogTW91c2VNb3ZlIHdhdGNoZXMgbW91c2UgZXZlbnRzIGZvciBhIGdpdmVuIEhUTUxFbGVtZW50IGFuZCByZWNvcmRzIHRoZSBtb3N0XG4gKiAgcmVjZW50IGxvY2F0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgTW91c2VNb3ZlIHtcbiAgY3VycmVudE1vdmVMb2NhdGlvbjogUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIGxhc3RSZWFkTG9jYXRpb246IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuICBlbGU6IEhUTUxFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKGVsZTogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZSA9IGVsZTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGRldGFjaCgpIHtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgbW91c2Vtb3ZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCA9IGUub2Zmc2V0WDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSA9IGUub2Zmc2V0WTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIGEgUG9pbnQgaWYgdGhlIG1vdXNlIGhhZCBtb3ZlZCBzaW5jZSB0aGUgbGFzdCByZWFkLCBvdGhlcndpc2VcbiAgICogcmV0dXJucyBudWxsLlxuICAgKi9cbiAgcmVhZExvY2F0aW9uKCk6IFBvaW50IHwgbnVsbCB7XG4gICAgaWYgKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi5lcXVhbCh0aGlzLmxhc3RSZWFkTG9jYXRpb24pKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5sYXN0UmVhZExvY2F0aW9uLnNldCh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24pO1xuICAgIHJldHVybiB0aGlzLmxhc3RSZWFkTG9jYXRpb24uZHVwKCk7XG4gIH1cbn1cbiIsICJleHBvcnQgY29uc3QgTUlOX0RJU1BMQVlfUkFOR0UgPSA3O1xuXG4vKiogUmVwcmVzZW50cyBhIHJhbmdlIG9mIGRheXMgb3ZlciB3aGljaCB0byBkaXNwbGF5IGEgem9vbWVkIGluIHZpZXcsIHVzaW5nXG4gKiB0aGUgaGFsZi1vcGVuIGludGVydmFsIFtiZWdpbiwgZW5kKS5cbiAqL1xuZXhwb3J0IGNsYXNzIERpc3BsYXlSYW5nZSB7XG4gIHByaXZhdGUgX2JlZ2luOiBudW1iZXI7XG4gIHByaXZhdGUgX2VuZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGJlZ2luOiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gICAgdGhpcy5fYmVnaW4gPSBiZWdpbjtcbiAgICB0aGlzLl9lbmQgPSBlbmQ7XG4gICAgaWYgKHRoaXMuX2JlZ2luID4gdGhpcy5fZW5kKSB7XG4gICAgICBbdGhpcy5fZW5kLCB0aGlzLl9iZWdpbl0gPSBbdGhpcy5fYmVnaW4sIHRoaXMuX2VuZF07XG4gICAgfVxuICAgIGlmICh0aGlzLl9lbmQgLSB0aGlzLl9iZWdpbiA8IE1JTl9ESVNQTEFZX1JBTkdFKSB7XG4gICAgICB0aGlzLl9lbmQgPSB0aGlzLl9iZWdpbiArIE1JTl9ESVNQTEFZX1JBTkdFO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBpbih4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4geCA+PSB0aGlzLl9iZWdpbiAmJiB4IDw9IHRoaXMuX2VuZDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYmVnaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fYmVnaW47XG4gIH1cblxuICBwdWJsaWMgZ2V0IGVuZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9lbmQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHJhbmdlSW5EYXlzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZCAtIHRoaXMuX2JlZ2luO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBFZGdlcyB9IGZyb20gXCIuLi8uLi9kYWcvZGFnXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgU3BhbiB9IGZyb20gXCIuLi8uLi9zbGFjay9zbGFja1wiO1xuaW1wb3J0IHsgQ2hhcnQsIFRhc2ssIFRhc2tzLCB2YWxpZGF0ZUNoYXJ0IH0gZnJvbSBcIi4uL2NoYXJ0XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhcnRMaWtlIHtcbiAgVmVydGljZXM6IFRhc2tzO1xuICBFZGdlczogRWRnZXM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmlsdGVyUmVzdWx0IHtcbiAgY2hhcnRMaWtlOiBDaGFydExpa2U7XG4gIGRpc3BsYXlPcmRlcjogbnVtYmVyW107XG4gIGVtcGhhc2l6ZWRUYXNrczogbnVtYmVyW107XG4gIHNwYW5zOiBTcGFuW107XG4gIGxhYmVsczogc3RyaW5nW107XG4gIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4OiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPjtcbiAgc2VsZWN0ZWRUYXNrSW5kZXg6IG51bWJlcjtcbn1cblxuLyoqIFVzZWQgZm9yIGZpbHRlcmluZyB0YXNrcywgcmV0dXJucyBUcnVlIGlmIHRoZSB0YXNrIGlzIHRvIGJlIGluY2x1ZGVkIGluIHRoZVxuICogZmlsdGVyZWQgcmVzdWx0cy4gKi9cbmV4cG9ydCB0eXBlIEZpbHRlckZ1bmMgPSAodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbjtcblxuLyoqIEZpbHRlcnMgdGhlIGNvbnRlbnRzIG9mIHRoZSBDaGFydCBiYXNlZCBvbiB0aGUgZmlsdGVyRnVuYy5cbiAqXG4gKiBzZWxlY3RlZFRhc2tJbmRleCB3aWxsIGJlIHJldHVybmVkIGFzIC0xIGlmIHRoZSBzZWxlY3RlZCB0YXNrIGdldHMgZmlsdGVyZWRcbiAqIG91dC5cbiAqL1xuZXhwb3J0IGNvbnN0IGZpbHRlciA9IChcbiAgY2hhcnQ6IENoYXJ0LFxuICBmaWx0ZXJGdW5jOiBGaWx0ZXJGdW5jIHwgbnVsbCxcbiAgZW1waGFzaXplZFRhc2tzOiBudW1iZXJbXSxcbiAgc3BhbnM6IFNwYW5bXSxcbiAgbGFiZWxzOiBzdHJpbmdbXSxcbiAgc2VsZWN0ZWRUYXNrSW5kZXg6IG51bWJlclxuKTogUmVzdWx0PEZpbHRlclJlc3VsdD4gPT4ge1xuICBjb25zdCB2cmV0ID0gdmFsaWRhdGVDaGFydChjaGFydCk7XG4gIGlmICghdnJldC5vaykge1xuICAgIHJldHVybiB2cmV0O1xuICB9XG4gIGNvbnN0IHRvcG9sb2dpY2FsT3JkZXIgPSB2cmV0LnZhbHVlO1xuICBpZiAoZmlsdGVyRnVuYyA9PT0gbnVsbCkge1xuICAgIGNvbnN0IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4OiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjaGFydC5WZXJ0aWNlcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LnNldChpbmRleCwgaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gb2soe1xuICAgICAgY2hhcnRMaWtlOiBjaGFydCxcbiAgICAgIGRpc3BsYXlPcmRlcjogdnJldC52YWx1ZSxcbiAgICAgIGVtcGhhc2l6ZWRUYXNrczogZW1waGFzaXplZFRhc2tzLFxuICAgICAgc3BhbnM6IHNwYW5zLFxuICAgICAgbGFiZWxzOiBsYWJlbHMsXG4gICAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXgsXG4gICAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleDogZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXgsXG4gICAgICBzZWxlY3RlZFRhc2tJbmRleCxcbiAgICB9KTtcbiAgfVxuICBjb25zdCB0YXNrczogVGFza3MgPSBbXTtcbiAgY29uc3QgZWRnZXM6IEVkZ2VzID0gW107XG4gIGNvbnN0IGRpc3BsYXlPcmRlcjogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgZmlsdGVyZWRTcGFuczogU3BhbltdID0gW107XG4gIGNvbnN0IGZpbHRlcmVkTGFiZWxzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcbiAgY29uc3QgZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4OiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuXG4gIC8vIEZpcnN0IGZpbHRlciB0aGUgdGFza3MuXG4gIGNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIG9yaWdpbmFsSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGlmIChmaWx0ZXJGdW5jKHRhc2ssIG9yaWdpbmFsSW5kZXgpKSB7XG4gICAgICB0YXNrcy5wdXNoKHRhc2spO1xuICAgICAgZmlsdGVyZWRTcGFucy5wdXNoKHNwYW5zW29yaWdpbmFsSW5kZXhdKTtcbiAgICAgIGZpbHRlcmVkTGFiZWxzLnB1c2gobGFiZWxzW29yaWdpbmFsSW5kZXhdKTtcbiAgICAgIGNvbnN0IG5ld0luZGV4ID0gdGFza3MubGVuZ3RoIC0gMTtcbiAgICAgIGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5zZXQob3JpZ2luYWxJbmRleCwgbmV3SW5kZXgpO1xuICAgICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXguc2V0KG5ld0luZGV4LCBvcmlnaW5hbEluZGV4KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIE5vdyBmaWx0ZXIgdGhlIGVkZ2VzIHdoaWxlIGFsc28gcmV3cml0aW5nIHRoZW0uXG4gIGNoYXJ0LkVkZ2VzLmZvckVhY2goKGRpcmVjdGVkRWRnZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgaWYgKFxuICAgICAgIWZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5oYXMoZGlyZWN0ZWRFZGdlLmkpIHx8XG4gICAgICAhZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmhhcyhkaXJlY3RlZEVkZ2UuailcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWRnZXMucHVzaChcbiAgICAgIG5ldyBEaXJlY3RlZEVkZ2UoXG4gICAgICAgIGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5nZXQoZGlyZWN0ZWRFZGdlLmkpLFxuICAgICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KGRpcmVjdGVkRWRnZS5qKVxuICAgICAgKVxuICAgICk7XG4gIH0pO1xuXG4gIC8vIE5vdyBmaWx0ZXIgYW5kIHJlaW5kZXggdGhlIHRvcG9sb2dpY2FsL2Rpc3BsYXkgb3JkZXIuXG4gIHRvcG9sb2dpY2FsT3JkZXIuZm9yRWFjaCgob3JpZ2luYWxUYXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2s6IFRhc2sgPSBjaGFydC5WZXJ0aWNlc1tvcmlnaW5hbFRhc2tJbmRleF07XG4gICAgaWYgKCFmaWx0ZXJGdW5jKHRhc2ssIG9yaWdpbmFsVGFza0luZGV4KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkaXNwbGF5T3JkZXIucHVzaChmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KG9yaWdpbmFsVGFza0luZGV4KSEpO1xuICB9KTtcblxuICAvLyBSZS1pbmRleCBoaWdobGlnaHRlZCB0YXNrcy5cbiAgY29uc3QgdXBkYXRlZEVtcGhhc2l6ZWRUYXNrcyA9IGVtcGhhc2l6ZWRUYXNrcy5tYXAoXG4gICAgKG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXIpOiBudW1iZXIgPT5cbiAgICAgIGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5nZXQob3JpZ2luYWxUYXNrSW5kZXgpIVxuICApO1xuXG4gIHJldHVybiBvayh7XG4gICAgY2hhcnRMaWtlOiB7XG4gICAgICBFZGdlczogZWRnZXMsXG4gICAgICBWZXJ0aWNlczogdGFza3MsXG4gICAgfSxcbiAgICBkaXNwbGF5T3JkZXI6IGRpc3BsYXlPcmRlcixcbiAgICBlbXBoYXNpemVkVGFza3M6IHVwZGF0ZWRFbXBoYXNpemVkVGFza3MsXG4gICAgc3BhbnM6IGZpbHRlcmVkU3BhbnMsXG4gICAgbGFiZWxzOiBmaWx0ZXJlZExhYmVscyxcbiAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXgsXG4gICAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXg6IGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleCxcbiAgICBzZWxlY3RlZFRhc2tJbmRleDogZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChzZWxlY3RlZFRhc2tJbmRleCkgfHwgLTEsXG4gIH0pO1xufTtcbiIsICIvKiogQG1vZHVsZSBrZFxuICogQSBrLWQgdHJlZSBpbXBsZW1lbnRhdGlvbiwgd2hpY2ggaXMgdXNlZCB0byBmaW5kIHRoZSBjbG9zZXN0IHBvaW50IGluXG4gKiBzb21ldGhpbmcgbGlrZSBhIDJEIHNjYXR0ZXIgcGxvdC4gU2VlIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0stZF90cmVlXG4gKiBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEZvcmtlZCBmcm9tIGh0dHBzOi8vc2tpYS5nb29nbGVzb3VyY2UuY29tL2J1aWxkYm90LysvcmVmcy9oZWFkcy9tYWluL3BlcmYvbW9kdWxlcy9wbG90LXNpbXBsZS1zay9rZC50cy5cbiAqXG4gKiBGb3JrZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vUGFuZGlub3NhdXJ1cy9rZC10cmVlLWphdmFzY3JpcHQgYW5kXG4gKiB0aGVuIG1hc3NpdmVseSB0cmltbWVkIGRvd24gdG8ganVzdCBmaW5kIHRoZSBzaW5nbGUgY2xvc2VzdCBwb2ludCwgYW5kIGFsc29cbiAqIHBvcnRlZCB0byBFUzYgc3ludGF4LCB0aGVuIHBvcnRlZCB0byBUeXBlU2NyaXB0LlxuICpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9QYW5kaW5vc2F1cnVzL2tkLXRyZWUtamF2YXNjcmlwdCBpcyBhIGZvcmsgb2ZcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS91YmlsYWJzL2tkLXRyZWUtamF2YXNjcmlwdFxuICpcbiAqIEBhdXRob3IgTWlyY2VhIFByaWNvcCA8cHJpY29wQHViaWxhYnMubmV0PiwgMjAxMlxuICogQGF1dGhvciBNYXJ0aW4gS2xlcHBlIDxrbGVwcGVAdWJpbGFicy5uZXQ+LCAyMDEyXG4gKiBAYXV0aG9yIFViaWxhYnMgaHR0cDovL3ViaWxhYnMubmV0LCAyMDEyXG4gKiBAbGljZW5zZSBNSVQgTGljZW5zZSA8aHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHA+XG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBLRFBvaW50IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG59XG5cbnR5cGUgRGltZW5zaW9ucyA9IGtleW9mIEtEUG9pbnQ7XG5cbmNvbnN0IGRlZmF1bHRNZXRyaWMgPSAoYTogS0RQb2ludCwgYjogS0RQb2ludCk6IG51bWJlciA9PlxuICAoYS54IC0gYi54KSAqIChhLnggLSBiLngpICsgKGEueSAtIGIueSkgKiAoYS55IC0gYi55KTtcblxuY29uc3QgZGVmYXVsdERpbWVuc2lvbnM6IERpbWVuc2lvbnNbXSA9IFtcInhcIiwgXCJ5XCJdO1xuXG4vKiogQGNsYXNzIEEgc2luZ2xlIG5vZGUgaW4gdGhlIGstZCBUcmVlLiAqL1xuY2xhc3MgTm9kZTxJdGVtIGV4dGVuZHMgS0RQb2ludD4ge1xuICBvYmo6IEl0ZW07XG5cbiAgbGVmdDogTm9kZTxJdGVtPiB8IG51bGwgPSBudWxsO1xuXG4gIHJpZ2h0OiBOb2RlPEl0ZW0+IHwgbnVsbCA9IG51bGw7XG5cbiAgcGFyZW50OiBOb2RlPEl0ZW0+IHwgbnVsbDtcblxuICBkaW1lbnNpb246IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihvYmo6IEl0ZW0sIGRpbWVuc2lvbjogbnVtYmVyLCBwYXJlbnQ6IE5vZGU8SXRlbT4gfCBudWxsKSB7XG4gICAgdGhpcy5vYmogPSBvYmo7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5kaW1lbnNpb24gPSBkaW1lbnNpb247XG4gIH1cbn1cblxuLyoqXG4gKiBAY2xhc3MgVGhlIGstZCB0cmVlLlxuICovXG5leHBvcnQgY2xhc3MgS0RUcmVlPFBvaW50IGV4dGVuZHMgS0RQb2ludD4ge1xuICBwcml2YXRlIGRpbWVuc2lvbnM6IERpbWVuc2lvbnNbXTtcblxuICBwcml2YXRlIHJvb3Q6IE5vZGU8UG9pbnQ+IHwgbnVsbDtcblxuICBwcml2YXRlIG1ldHJpYzogKGE6IEtEUG9pbnQsIGI6IEtEUG9pbnQpID0+IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSBwb2ludHMgLSBBbiBhcnJheSBvZiBwb2ludHMsIHNvbWV0aGluZyB3aXRoIHRoZSBzaGFwZVxuICAgKiAgICAge3g6eCwgeTp5fS5cbiAgICogQHBhcmFtIHtBcnJheX0gZGltZW5zaW9ucyAtIFRoZSBkaW1lbnNpb25zIHRvIHVzZSBpbiBvdXIgcG9pbnRzLCBmb3JcbiAgICogICAgIGV4YW1wbGUgWyd4JywgJ3knXS5cbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gbWV0cmljIC0gQSBmdW5jdGlvbiB0aGF0IGNhbGN1bGF0ZXMgdGhlIGRpc3RhbmNlXG4gICAqICAgICBiZXR3ZWVuIHR3byBwb2ludHMuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwb2ludHM6IFBvaW50W10pIHtcbiAgICB0aGlzLmRpbWVuc2lvbnMgPSBkZWZhdWx0RGltZW5zaW9ucztcbiAgICB0aGlzLm1ldHJpYyA9IGRlZmF1bHRNZXRyaWM7XG4gICAgdGhpcy5yb290ID0gdGhpcy5fYnVpbGRUcmVlKHBvaW50cywgMCwgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUgbmVhcmVzdCBOb2RlIHRvIHRoZSBnaXZlbiBwb2ludC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHBvaW50IC0ge3g6eCwgeTp5fVxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgY2xvc2VzdCBwb2ludCBvYmplY3QgcGFzc2VkIGludG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgKiAgICAgV2UgcGFzcyBiYWNrIHRoZSBvcmlnaW5hbCBvYmplY3Qgc2luY2UgaXQgbWlnaHQgaGF2ZSBleHRyYSBpbmZvXG4gICAqICAgICBiZXlvbmQganVzdCB0aGUgY29vcmRpbmF0ZXMsIHN1Y2ggYXMgdHJhY2UgaWQuXG4gICAqL1xuICBuZWFyZXN0KHBvaW50OiBLRFBvaW50KTogUG9pbnQge1xuICAgIGxldCBiZXN0Tm9kZSA9IHtcbiAgICAgIG5vZGU6IHRoaXMucm9vdCxcbiAgICAgIGRpc3RhbmNlOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgIH07XG5cbiAgICBjb25zdCBzYXZlTm9kZSA9IChub2RlOiBOb2RlPFBvaW50PiwgZGlzdGFuY2U6IG51bWJlcikgPT4ge1xuICAgICAgYmVzdE5vZGUgPSB7XG4gICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgIGRpc3RhbmNlOiBkaXN0YW5jZSxcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGNvbnN0IG5lYXJlc3RTZWFyY2ggPSAobm9kZTogTm9kZTxQb2ludD4pID0+IHtcbiAgICAgIGNvbnN0IGRpbWVuc2lvbiA9IHRoaXMuZGltZW5zaW9uc1tub2RlLmRpbWVuc2lvbl07XG4gICAgICBjb25zdCBvd25EaXN0YW5jZSA9IHRoaXMubWV0cmljKHBvaW50LCBub2RlLm9iaik7XG5cbiAgICAgIGlmIChub2RlLnJpZ2h0ID09PSBudWxsICYmIG5vZGUubGVmdCA9PT0gbnVsbCkge1xuICAgICAgICBpZiAob3duRGlzdGFuY2UgPCBiZXN0Tm9kZS5kaXN0YW5jZSkge1xuICAgICAgICAgIHNhdmVOb2RlKG5vZGUsIG93bkRpc3RhbmNlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBiZXN0Q2hpbGQgPSBudWxsO1xuICAgICAgbGV0IG90aGVyQ2hpbGQgPSBudWxsO1xuICAgICAgLy8gSWYgd2UgZ2V0IGhlcmUgd2Uga25vdyB0aGF0IGF0IGxlYXN0IG9uZSBvZiAubGVmdCBhbmQgLnJpZ2h0IGlzXG4gICAgICAvLyBub24tbnVsbCwgc28gYmVzdENoaWxkIGlzIGd1YXJhbnRlZWQgdG8gYmUgbm9uLW51bGwuXG4gICAgICBpZiAobm9kZS5yaWdodCA9PT0gbnVsbCkge1xuICAgICAgICBiZXN0Q2hpbGQgPSBub2RlLmxlZnQ7XG4gICAgICB9IGVsc2UgaWYgKG5vZGUubGVmdCA9PT0gbnVsbCkge1xuICAgICAgICBiZXN0Q2hpbGQgPSBub2RlLnJpZ2h0O1xuICAgICAgfSBlbHNlIGlmIChwb2ludFtkaW1lbnNpb25dIDwgbm9kZS5vYmpbZGltZW5zaW9uXSkge1xuICAgICAgICBiZXN0Q2hpbGQgPSBub2RlLmxlZnQ7XG4gICAgICAgIG90aGVyQ2hpbGQgPSBub2RlLnJpZ2h0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYmVzdENoaWxkID0gbm9kZS5yaWdodDtcbiAgICAgICAgb3RoZXJDaGlsZCA9IG5vZGUubGVmdDtcbiAgICAgIH1cblxuICAgICAgbmVhcmVzdFNlYXJjaChiZXN0Q2hpbGQhKTtcblxuICAgICAgaWYgKG93bkRpc3RhbmNlIDwgYmVzdE5vZGUuZGlzdGFuY2UpIHtcbiAgICAgICAgc2F2ZU5vZGUobm9kZSwgb3duRGlzdGFuY2UpO1xuICAgICAgfVxuXG4gICAgICAvLyBGaW5kIGRpc3RhbmNlIHRvIGh5cGVycGxhbmUuXG4gICAgICBjb25zdCBwb2ludE9uSHlwZXJwbGFuZSA9IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMCxcbiAgICAgIH07XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZGltZW5zaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaSA9PT0gbm9kZS5kaW1lbnNpb24pIHtcbiAgICAgICAgICBwb2ludE9uSHlwZXJwbGFuZVt0aGlzLmRpbWVuc2lvbnNbaV1dID0gcG9pbnRbdGhpcy5kaW1lbnNpb25zW2ldXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwb2ludE9uSHlwZXJwbGFuZVt0aGlzLmRpbWVuc2lvbnNbaV1dID0gbm9kZS5vYmpbdGhpcy5kaW1lbnNpb25zW2ldXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgaHlwZXJwbGFuZSBpcyBjbG9zZXIgdGhhbiB0aGUgY3VycmVudCBiZXN0IHBvaW50IHRoZW4gd2VcbiAgICAgIC8vIG5lZWQgdG8gc2VhcmNoIGRvd24gdGhlIG90aGVyIHNpZGUgb2YgdGhlIHRyZWUuXG4gICAgICBpZiAoXG4gICAgICAgIG90aGVyQ2hpbGQgIT09IG51bGwgJiZcbiAgICAgICAgdGhpcy5tZXRyaWMocG9pbnRPbkh5cGVycGxhbmUsIG5vZGUub2JqKSA8IGJlc3ROb2RlLmRpc3RhbmNlXG4gICAgICApIHtcbiAgICAgICAgbmVhcmVzdFNlYXJjaChvdGhlckNoaWxkKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHRoaXMucm9vdCkge1xuICAgICAgbmVhcmVzdFNlYXJjaCh0aGlzLnJvb3QpO1xuICAgIH1cblxuICAgIHJldHVybiBiZXN0Tm9kZS5ub2RlIS5vYmo7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIHRoZSBmcm9tIHBhcmVudCBOb2RlIG9uIGRvd24uXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IHBvaW50cyAtIEFuIGFycmF5IG9mIHt4OngsIHk6eX0uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkZXB0aCAtIFRoZSBjdXJyZW50IGRlcHRoIGZyb20gdGhlIHJvb3Qgbm9kZS5cbiAgICogQHBhcmFtIHtOb2RlfSBwYXJlbnQgLSBUaGUgcGFyZW50IE5vZGUuXG4gICAqL1xuICBwcml2YXRlIF9idWlsZFRyZWUoXG4gICAgcG9pbnRzOiBQb2ludFtdLFxuICAgIGRlcHRoOiBudW1iZXIsXG4gICAgcGFyZW50OiBOb2RlPFBvaW50PiB8IG51bGxcbiAgKTogTm9kZTxQb2ludD4gfCBudWxsIHtcbiAgICAvLyBFdmVyeSBzdGVwIGRlZXBlciBpbnRvIHRoZSB0cmVlIHdlIHN3aXRjaCB0byB1c2luZyBhbm90aGVyIGF4aXMuXG4gICAgY29uc3QgZGltID0gZGVwdGggJSB0aGlzLmRpbWVuc2lvbnMubGVuZ3RoO1xuXG4gICAgaWYgKHBvaW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocG9pbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIG5ldyBOb2RlKHBvaW50c1swXSwgZGltLCBwYXJlbnQpO1xuICAgIH1cblxuICAgIHBvaW50cy5zb3J0KChhLCBiKSA9PiBhW3RoaXMuZGltZW5zaW9uc1tkaW1dXSAtIGJbdGhpcy5kaW1lbnNpb25zW2RpbV1dKTtcblxuICAgIGNvbnN0IG1lZGlhbiA9IE1hdGguZmxvb3IocG9pbnRzLmxlbmd0aCAvIDIpO1xuICAgIGNvbnN0IG5vZGUgPSBuZXcgTm9kZShwb2ludHNbbWVkaWFuXSwgZGltLCBwYXJlbnQpO1xuICAgIG5vZGUubGVmdCA9IHRoaXMuX2J1aWxkVHJlZShwb2ludHMuc2xpY2UoMCwgbWVkaWFuKSwgZGVwdGggKyAxLCBub2RlKTtcbiAgICBub2RlLnJpZ2h0ID0gdGhpcy5fYnVpbGRUcmVlKHBvaW50cy5zbGljZShtZWRpYW4gKyAxKSwgZGVwdGggKyAxLCBub2RlKTtcblxuICAgIHJldHVybiBub2RlO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgY2xhbXAgfSBmcm9tIFwiLi4vLi4vbWV0cmljcy9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUmVuZGVyT3B0aW9ucyB9IGZyb20gXCIuLi9yZW5kZXJlci50c1wiO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi9wb2ludC50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIERheVJvdyB7XG4gIGRheTogbnVtYmVyO1xuICByb3c6IG51bWJlcjtcbn1cblxuLyoqIEZlYXR1cmVzIG9mIHRoZSBjaGFydCB3ZSBjYW4gYXNrIGZvciBjb29yZGluYXRlcyBvZiwgd2hlcmUgdGhlIHZhbHVlIHJldHVybmVkIGlzXG4gKiB0aGUgdG9wIGxlZnQgY29vcmRpbmF0ZSBvZiB0aGUgZmVhdHVyZS5cbiAqL1xuZXhwb3J0IGVudW0gRmVhdHVyZSB7XG4gIHRhc2tMaW5lU3RhcnQsXG4gIHRleHRTdGFydCxcbiAgZ3JvdXBUZXh0U3RhcnQsXG4gIHBlcmNlbnRTdGFydCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb3AsXG4gIHZlcnRpY2FsQXJyb3dEZXN0Qm90dG9tLFxuICBob3Jpem9udGFsQXJyb3dEZXN0LFxuICB2ZXJ0aWNhbEFycm93U3RhcnQsXG4gIGhvcml6b250YWxBcnJvd1N0YXJ0LFxuICB2ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lVG9wLFxuICB2ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lQm90dG9tLFxuICBob3Jpem9udGFsQXJyb3dEZXN0VG9NaWxlc3RvbmUsXG4gIHZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVUb3AsXG4gIHZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVCb3R0b20sXG4gIGhvcml6b250YWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZSxcbiAgZ3JvdXBFbnZlbG9wZVN0YXJ0LFxuICB0YXNrRW52ZWxvcGVUb3AsXG5cbiAgZGlzcGxheVJhbmdlVG9wLFxuICB0YXNrUm93Qm90dG9tLFxuXG4gIHRpbWVNYXJrU3RhcnQsXG4gIHRpbWVNYXJrRW5kLFxuICB0aW1lVGV4dFN0YXJ0LFxuXG4gIGdyb3VwVGl0bGVUZXh0U3RhcnQsXG5cbiAgdGFza3NDbGlwUmVjdE9yaWdpbixcbiAgZ3JvdXBCeU9yaWdpbixcbn1cblxuLyoqIFNpemVzIG9mIGZlYXR1cmVzIG9mIGEgcmVuZGVyZWQgY2hhcnQuICovXG5leHBvcnQgZW51bSBNZXRyaWMge1xuICB0YXNrTGluZUhlaWdodCxcbiAgcGVyY2VudEhlaWdodCxcbiAgYXJyb3dIZWFkSGVpZ2h0LFxuICBhcnJvd0hlYWRXaWR0aCxcbiAgbWlsZXN0b25lRGlhbWV0ZXIsXG4gIGxpbmVEYXNoTGluZSxcbiAgbGluZURhc2hHYXAsXG4gIHRleHRYT2Zmc2V0LFxuICByb3dIZWlnaHQsXG59XG5cbi8qKiBNYWtlcyBhIG51bWJlciBvZGQsIGFkZHMgb25lIGlmIGV2ZW4uICovXG5jb25zdCBtYWtlT2RkID0gKG46IG51bWJlcik6IG51bWJlciA9PiB7XG4gIGlmIChuICUgMiA9PT0gMCkge1xuICAgIHJldHVybiBuICsgMTtcbiAgfVxuICByZXR1cm4gbjtcbn07XG5cbi8qKiBTY2FsZSBjb25zb2xpZGF0ZXMgYWxsIGNhbGN1bGF0aW9ucyBhcm91bmQgcmVuZGVyaW5nIGEgY2hhcnQgb250byBhIHN1cmZhY2UuICovXG5leHBvcnQgY2xhc3MgU2NhbGUge1xuICBwcml2YXRlIGRheVdpZHRoUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSByb3dIZWlnaHRQeDogbnVtYmVyO1xuICBwcml2YXRlIGJsb2NrU2l6ZVB4OiBudW1iZXI7XG4gIHByaXZhdGUgdGFza0hlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgbGluZVdpZHRoUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBtYXJnaW5TaXplUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSB0aW1lbGluZUhlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgb3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSB0b3RhbE51bWJlck9mRGF5czogbnVtYmVyO1xuICBwcml2YXRlIGdyb3VwQnlDb2x1bW5XaWR0aFB4OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSB0aW1lbGluZU9yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgdGFza3NPcmlnaW46IFBvaW50O1xuICBwcml2YXRlIGdyb3VwQnlPcmlnaW46IFBvaW50O1xuICBwcml2YXRlIHRhc2tzQ2xpcFJlY3RPcmlnaW46IFBvaW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gICAgY2FudmFzV2lkdGhQeDogbnVtYmVyLFxuICAgIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXIsXG4gICAgbWF4R3JvdXBOYW1lTGVuZ3RoOiBudW1iZXIgPSAwXG4gICkge1xuICAgIHRoaXMudG90YWxOdW1iZXJPZkRheXMgPSB0b3RhbE51bWJlck9mRGF5cztcbiAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4ID0gbWF4R3JvdXBOYW1lTGVuZ3RoICogb3B0cy5mb250U2l6ZVB4O1xuXG4gICAgdGhpcy5ibG9ja1NpemVQeCA9IE1hdGguZmxvb3Iob3B0cy5mb250U2l6ZVB4IC8gMyk7XG4gICAgdGhpcy50YXNrSGVpZ2h0UHggPSBtYWtlT2RkKE1hdGguZmxvb3IoKHRoaXMuYmxvY2tTaXplUHggKiAzKSAvIDQpKTtcbiAgICB0aGlzLmxpbmVXaWR0aFB4ID0gbWFrZU9kZChNYXRoLmZsb29yKHRoaXMudGFza0hlaWdodFB4IC8gMykpO1xuICAgIGNvbnN0IG1pbGVzdG9uZVJhZGl1cyA9IE1hdGguY2VpbCh0aGlzLnRhc2tIZWlnaHRQeCAvIDIpICsgdGhpcy5saW5lV2lkdGhQeDtcbiAgICB0aGlzLm1hcmdpblNpemVQeCA9IG1pbGVzdG9uZVJhZGl1cztcbiAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHggPSBvcHRzLmhhc1RpbWVsaW5lXG4gICAgICA/IE1hdGguY2VpbCgob3B0cy5mb250U2l6ZVB4ICogNCkgLyAzKVxuICAgICAgOiAwO1xuXG4gICAgdGhpcy50aW1lbGluZU9yaWdpbiA9IG5ldyBQb2ludChtaWxlc3RvbmVSYWRpdXMsIDApO1xuICAgIHRoaXMuZ3JvdXBCeU9yaWdpbiA9IG5ldyBQb2ludCgwLCBtaWxlc3RvbmVSYWRpdXMgKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHgpO1xuXG4gICAgbGV0IGJlZ2luT2Zmc2V0ID0gMDtcbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UgPT09IG51bGwgfHwgb3B0cy5kaXNwbGF5UmFuZ2VVc2FnZSA9PT0gXCJoaWdobGlnaHRcIikge1xuICAgICAgLy8gRG8gbm90IGZvcmNlIGRheVdpZHRoUHggdG8gYW4gaW50ZWdlciwgaXQgY291bGQgZ28gdG8gMCBhbmQgY2F1c2UgYWxsXG4gICAgICAvLyB0YXNrcyB0byBiZSByZW5kZXJlZCBhdCAwIHdpZHRoLlxuICAgICAgdGhpcy5kYXlXaWR0aFB4ID1cbiAgICAgICAgKGNhbnZhc1dpZHRoUHggLSB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gMiAqIHRoaXMubWFyZ2luU2l6ZVB4KSAvXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzO1xuICAgICAgdGhpcy5vcmlnaW4gPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNob3VsZCB3ZSBzZXQgeC1tYXJnaW5zIHRvIDAgaWYgYSBTdWJSYW5nZSBpcyByZXF1ZXN0ZWQ/XG4gICAgICAvLyBPciBzaG91bGQgd2UgdG90YWxseSBkcm9wIGFsbCBtYXJnaW5zIGZyb20gaGVyZSBhbmQganVzdCB1c2VcbiAgICAgIC8vIENTUyBtYXJnaW5zIG9uIHRoZSBjYW52YXMgZWxlbWVudD9cbiAgICAgIHRoaXMuZGF5V2lkdGhQeCA9XG4gICAgICAgIChjYW52YXNXaWR0aFB4IC0gdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIDIgKiB0aGlzLm1hcmdpblNpemVQeCkgL1xuICAgICAgICBvcHRzLmRpc3BsYXlSYW5nZS5yYW5nZUluRGF5cztcbiAgICAgIGJlZ2luT2Zmc2V0ID0gTWF0aC5mbG9vcihcbiAgICAgICAgdGhpcy5kYXlXaWR0aFB4ICogb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gKyB0aGlzLm1hcmdpblNpemVQeFxuICAgICAgKTtcbiAgICAgIHRoaXMub3JpZ2luID0gbmV3IFBvaW50KC1iZWdpbk9mZnNldCArIHRoaXMubWFyZ2luU2l6ZVB4LCAwKTtcbiAgICB9XG5cbiAgICB0aGlzLnRhc2tzT3JpZ2luID0gbmV3IFBvaW50KFxuICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIGJlZ2luT2Zmc2V0ICsgbWlsZXN0b25lUmFkaXVzLFxuICAgICAgdGhpcy50aW1lbGluZUhlaWdodFB4ICsgbWlsZXN0b25lUmFkaXVzXG4gICAgKTtcblxuICAgIHRoaXMudGFza3NDbGlwUmVjdE9yaWdpbiA9IG5ldyBQb2ludChcbiAgICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHgsXG4gICAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHhcbiAgICApO1xuXG4gICAgaWYgKG9wdHMuaGFzVGV4dCkge1xuICAgICAgdGhpcy5yb3dIZWlnaHRQeCA9IDYgKiB0aGlzLmJsb2NrU2l6ZVB4OyAvLyBUaGlzIG1pZ2h0IGFsc28gYmUgYChjYW52YXNIZWlnaHRQeCAtIDIgKiBvcHRzLm1hcmdpblNpemVQeCkgLyBudW1iZXJTd2ltTGFuZXNgIGlmIGhlaWdodCBpcyBzdXBwbGllZD9cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yb3dIZWlnaHRQeCA9IDEuMSAqIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIGNoYXJ0LiBOb3RlIHRoYXQgaXQncyBub3QgY29uc3RyYWluZWQgYnkgdGhlIGNhbnZhcy4gKi9cbiAgcHVibGljIGhlaWdodChtYXhSb3dzOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiAoXG4gICAgICBtYXhSb3dzICogdGhpcy5yb3dIZWlnaHRQeCArIHRoaXMudGltZWxpbmVIZWlnaHRQeCArIDIgKiB0aGlzLm1hcmdpblNpemVQeFxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgZGF5Um93RnJvbVBvaW50KHBvaW50OiBQb2ludCk6IERheVJvdyB7XG4gICAgLy8gVGhpcyBzaG91bGQgYWxzbyBjbGFtcCB0aGUgcmV0dXJuZWQgJ3gnIHZhbHVlIHRvIFswLCBtYXhSb3dzKS5cbiAgICByZXR1cm4ge1xuICAgICAgZGF5OiBjbGFtcChcbiAgICAgICAgTWF0aC5mbG9vcihcbiAgICAgICAgICAod2luZG93LmRldmljZVBpeGVsUmF0aW8gKiBwb2ludC54IC1cbiAgICAgICAgICAgIHRoaXMub3JpZ2luLnggLVxuICAgICAgICAgICAgdGhpcy5tYXJnaW5TaXplUHggLVxuICAgICAgICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCkgL1xuICAgICAgICAgICAgdGhpcy5kYXlXaWR0aFB4XG4gICAgICAgICksXG4gICAgICAgIDAsXG4gICAgICAgIHRoaXMudG90YWxOdW1iZXJPZkRheXNcbiAgICAgICksXG4gICAgICByb3c6IE1hdGguZmxvb3IoXG4gICAgICAgICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAqIHBvaW50LnkgLVxuICAgICAgICAgIHRoaXMub3JpZ2luLnkgLVxuICAgICAgICAgIHRoaXMubWFyZ2luU2l6ZVB4IC1cbiAgICAgICAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHgpIC9cbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4XG4gICAgICApLFxuICAgIH07XG4gIH1cblxuICAvKiogVGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94IGZvciBhIHNpbmdsZSB0YXNrLiAqL1xuICBwcml2YXRlIHRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdzogbnVtYmVyLCBkYXk6IG51bWJlcik6IFBvaW50IHtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uc3VtKFxuICAgICAgbmV3IFBvaW50KFxuICAgICAgICBNYXRoLmZsb29yKFxuICAgICAgICAgIGRheSAqIHRoaXMuZGF5V2lkdGhQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeFxuICAgICAgICApLFxuICAgICAgICBNYXRoLmZsb29yKFxuICAgICAgICAgIHJvdyAqIHRoaXMucm93SGVpZ2h0UHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgcHJpdmF0ZSBncm91cFJvd0VudmVsb3BlU3RhcnQocm93OiBudW1iZXIsIGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLmdyb3VwQnlPcmlnaW4uc3VtKFxuICAgICAgbmV3IFBvaW50KFxuICAgICAgICAwLFxuICAgICAgICByb3cgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHhcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBncm91cEhlYWRlclN0YXJ0KCk6IFBvaW50IHtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uc3VtKG5ldyBQb2ludCh0aGlzLm1hcmdpblNpemVQeCwgdGhpcy5tYXJnaW5TaXplUHgpKTtcbiAgfVxuXG4gIHByaXZhdGUgdGltZUVudmVsb3BlU3RhcnQoZGF5OiBudW1iZXIpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luLnN1bShcbiAgICAgIG5ldyBQb2ludChcbiAgICAgICAgZGF5ICogdGhpcy5kYXlXaWR0aFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4LFxuICAgICAgICAwXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBjb29yZGluYXRlIG9mIHRoZSBpdGVtICovXG4gIGZlYXR1cmUocm93OiBudW1iZXIsIGRheTogbnVtYmVyLCBjb29yZDogRmVhdHVyZSk6IFBvaW50IHtcbiAgICBzd2l0Y2ggKGNvb3JkKSB7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza0xpbmVTdGFydDpcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcDpcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4IC0gdGhpcy5ibG9ja1NpemVQeFxuICAgICAgICApO1xuXG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoMCwgdGhpcy5yb3dIZWlnaHRQeCk7XG4gICAgICBjYXNlIEZlYXR1cmUudGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHgsXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeFxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cFJvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4LFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHhcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5wZXJjZW50U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4IC0gdGhpcy5saW5lV2lkdGhQeFxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3Q6XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICBNYXRoLmZsb29yKHRoaXMucm93SGVpZ2h0UHggLSAwLjUgKiB0aGlzLmJsb2NrU2l6ZVB4KSAtIDFcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wKS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lQm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wKS5hZGQoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3QpLmFkZChcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlciksXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuXG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZUJvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmU6XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQpLmFkZChcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICAgIDBcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cEVudmVsb3BlU3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwUm93RW52ZWxvcGVTdGFydChyb3csIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZU1hcmtTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50aW1lTWFya0VuZDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KS5hZGQoMCwgdGhpcy5yb3dIZWlnaHRQeCAqIChyb3cgKyAxKSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZVRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KS5hZGQodGhpcy5ibG9ja1NpemVQeCwgMCk7XG5cbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cFRpdGxlVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cEhlYWRlclN0YXJ0KCkuYWRkKHRoaXMuYmxvY2tTaXplUHgsIDApO1xuICAgICAgY2FzZSBGZWF0dXJlLmRpc3BsYXlSYW5nZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrUm93Qm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3cgKyAxLCBkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tzQ2xpcFJlY3RPcmlnaW46XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tzQ2xpcFJlY3RPcmlnaW47XG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBCeU9yaWdpbjpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBCeU9yaWdpbjtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFRoZSBsaW5lIGJlbG93IHdpbGwgbm90IGNvbXBpbGUgaWYgeW91IG1pc3NlZCBhbiBlbnVtIGluIHRoZSBzd2l0Y2ggYWJvdmUuXG4gICAgICAgIGNvb3JkIHNhdGlzZmllcyBuZXZlcjtcbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludCgwLCAwKTtcbiAgICB9XG4gIH1cblxuICBtZXRyaWMoZmVhdHVyZTogTWV0cmljKTogbnVtYmVyIHtcbiAgICBzd2l0Y2ggKGZlYXR1cmUpIHtcbiAgICAgIGNhc2UgTWV0cmljLnRhc2tMaW5lSGVpZ2h0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrSGVpZ2h0UHg7XG4gICAgICBjYXNlIE1ldHJpYy5wZXJjZW50SGVpZ2h0OlxuICAgICAgICByZXR1cm4gdGhpcy5saW5lV2lkdGhQeDtcbiAgICAgIGNhc2UgTWV0cmljLmFycm93SGVhZEhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza0hlaWdodFB4O1xuICAgICAgY2FzZSBNZXRyaWMuYXJyb3dIZWFkV2lkdGg6XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy50YXNrSGVpZ2h0UHgpO1xuICAgICAgY2FzZSBNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXI6XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy50YXNrSGVpZ2h0UHgpO1xuICAgICAgY2FzZSBNZXRyaWMubGluZURhc2hMaW5lOlxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja1NpemVQeDtcbiAgICAgIGNhc2UgTWV0cmljLmxpbmVEYXNoR2FwOlxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja1NpemVQeDtcbiAgICAgIGNhc2UgTWV0cmljLnRleHRYT2Zmc2V0OlxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja1NpemVQeDtcbiAgICAgIGNhc2UgTWV0cmljLnJvd0hlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMucm93SGVpZ2h0UHg7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBUaGUgbGluZSBiZWxvdyB3aWxsIG5vdCBjb21waWxlIGlmIHlvdSBtaXNzZWQgYW4gZW51bSBpbiB0aGUgc3dpdGNoIGFib3ZlLlxuICAgICAgICBmZWF0dXJlIHNhdGlzZmllcyBuZXZlcjtcbiAgICAgICAgcmV0dXJuIDAuMDtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBUYXNrLCB2YWxpZGF0ZUNoYXJ0IH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBDaGFydExpa2UsIGZpbHRlciwgRmlsdGVyRnVuYyB9IGZyb20gXCIuLi9jaGFydC9maWx0ZXIvZmlsdGVyLnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIFZlcnRleEluZGljZXMgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IFJlc291cmNlRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgU3BhbiB9IGZyb20gXCIuLi9zbGFjay9zbGFjay50c1wiO1xuaW1wb3J0IHsgUmVjdCwgVGFza0R1cmF0aW9uIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyBLRFRyZWUgfSBmcm9tIFwiLi9rZC9rZC50c1wiO1xuaW1wb3J0IHsgRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4vcmFuZ2UvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4vc2NhbGUvcG9pbnQudHNcIjtcbmltcG9ydCB7IEZlYXR1cmUsIE1ldHJpYywgU2NhbGUgfSBmcm9tIFwiLi9zY2FsZS9zY2FsZS50c1wiO1xuXG50eXBlIERpcmVjdGlvbiA9IFwidXBcIiB8IFwiZG93blwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbG9ycyB7XG4gIHN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZU11dGVkOiBzdHJpbmc7XG4gIG9uU3VyZmFjZUhpZ2hsaWdodDogc3RyaW5nO1xuICBvdmVybGF5OiBzdHJpbmc7XG4gIGdyb3VwQ29sb3I6IHN0cmluZztcbiAgaGlnaGxpZ2h0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIFRhc2tJbmRleFRvUm93ID0gTWFwPG51bWJlciwgbnVtYmVyPjtcblxuLyoqIEZ1bmN0aW9uIHVzZSB0byBwcm9kdWNlIGEgdGV4dCBsYWJlbCBmb3IgYSB0YXNrIGFuZCBpdHMgc2xhY2suICovXG5leHBvcnQgdHlwZSBUYXNrTGFiZWwgPSAodGFza0luZGV4OiBudW1iZXIpID0+IHN0cmluZztcblxuLyoqIENvbnRyb2xzIG9mIHRoZSBkaXNwbGF5UmFuZ2UgaW4gUmVuZGVyT3B0aW9ucyBpcyB1c2VkLlxuICpcbiAqICBcInJlc3RyaWN0XCI6IE9ubHkgZGlzcGxheSB0aGUgcGFydHMgb2YgdGhlIGNoYXJ0IHRoYXQgYXBwZWFyIGluIHRoZSByYW5nZS5cbiAqXG4gKiAgXCJoaWdobGlnaHRcIjogRGlzcGxheSB0aGUgZnVsbCByYW5nZSBvZiB0aGUgZGF0YSwgYnV0IGhpZ2hsaWdodCB0aGUgcmFuZ2UuXG4gKi9cbmV4cG9ydCB0eXBlIERpc3BsYXlSYW5nZVVzYWdlID0gXCJyZXN0cmljdFwiIHwgXCJoaWdobGlnaHRcIjtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUYXNrTGFiZWw6IFRhc2tMYWJlbCA9ICh0YXNrSW5kZXg6IG51bWJlcik6IHN0cmluZyA9PlxuICB0YXNrSW5kZXgudG9GaXhlZCgwKTtcblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJPcHRpb25zIHtcbiAgLyoqIFRoZSB0ZXh0IGZvbnQgc2l6ZSwgdGhpcyBkcml2ZXMgdGhlIHNpemUgb2YgYWxsIG90aGVyIGNoYXJ0IGZlYXR1cmVzLlxuICAgKiAqL1xuICBmb250U2l6ZVB4OiBudW1iZXI7XG5cbiAgLyoqIERpc3BsYXkgdGV4dCBpZiB0cnVlLiAqL1xuICBoYXNUZXh0OiBib29sZWFuO1xuXG4gIC8qKiBJZiBzdXBwbGllZCB0aGVuIG9ubHkgdGhlIHRhc2tzIGluIHRoZSBnaXZlbiByYW5nZSB3aWxsIGJlIGRpc3BsYXllZC4gKi9cbiAgZGlzcGxheVJhbmdlOiBEaXNwbGF5UmFuZ2UgfCBudWxsO1xuXG4gIC8qKiBDb250cm9scyBob3cgdGhlIGBkaXNwbGF5UmFuZ2VgIGlzIHVzZWQgaWYgc3VwcGxpZWQuICovXG4gIGRpc3BsYXlSYW5nZVVzYWdlOiBEaXNwbGF5UmFuZ2VVc2FnZTtcblxuICAvKiogVGhlIGNvbG9yIHRoZW1lLiAqL1xuICBjb2xvcnM6IENvbG9ycztcblxuICAvKiogSWYgdHJ1ZSB0aGVuIGRpc3BsYXkgdGltZXMgYXQgdGhlIHRvcCBvZiB0aGUgY2hhcnQuICovXG4gIGhhc1RpbWVsaW5lOiBib29sZWFuO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZGlzcGxheSB0aGUgdGFzayBiYXJzLiAqL1xuICBoYXNUYXNrczogYm9vbGVhbjtcblxuICAvKiogSWYgdHJ1ZSB0aGVuIGRyYXcgdmVydGljYWwgbGluZXMgZnJvbSB0aGUgdGltZWxpbmUgZG93biB0byB0YXNrIHN0YXJ0IGFuZFxuICAgKiBmaW5pc2ggcG9pbnRzLiAqL1xuICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiBib29sZWFuO1xuXG4gIC8qKiBEcmF3IGRlcGVuZGVuY3kgZWRnZXMgYmV0d2VlbiB0YXNrcyBpZiB0cnVlLiAqL1xuICBoYXNFZGdlczogYm9vbGVhbjtcblxuICAvKiogRnVuY3Rpb24gdGhhdCBwcm9kdWNlcyBkaXNwbGF5IHRleHQgZm9yIGEgVGFzayBhbmQgaXRzIGFzc29jaWF0ZWQgU2xhY2suICovXG4gIHRhc2tMYWJlbDogVGFza0xhYmVsO1xuXG4gIC8qKiBSZXR1cm5zIHRoZSBkdXJhdGlvbiBmb3IgYSBnaXZlbiB0YXNrLiAqL1xuICB0YXNrRHVyYXRpb246IFRhc2tEdXJhdGlvbjtcblxuICAvKiogVGhlIGluZGljZXMgb2YgdGFza3MgdGhhdCBzaG91bGQgYmUgZW1waGFzaXplZCB3aGVuIGRyYXcsIHR5cGljYWxseSB1c2VkXG4gICAqIHRvIGRlbm90ZSB0aGUgY3JpdGljYWwgcGF0aC4gKi9cbiAgdGFza0VtcGhhc2l6ZTogbnVtYmVyW107XG5cbiAgLyoqIEZpbHRlciB0aGUgVGFza3MgdG8gYmUgZGlzcGxheWVkLiAqL1xuICBmaWx0ZXJGdW5jOiBGaWx0ZXJGdW5jIHwgbnVsbDtcblxuICAvKiogR3JvdXAgdGhlIHRhc2tzIHRvZ2V0aGVyIHZlcnRpY2FsbHkgYmFzZWQgb24gdGhlIGdpdmVuIHJlc291cmNlLiBJZiB0aGVcbiAgICogZW1wdHkgc3RyaW5nIGlzIHN1cHBsaWVkIHRoZW4ganVzdCBkaXNwbGF5IGJ5IHRvcG9sb2dpY2FsIG9yZGVyLlxuICAgKi9cbiAgZ3JvdXBCeVJlc291cmNlOiBzdHJpbmc7XG5cbiAgLyoqIFRhc2sgdG8gaGlnaGxpZ2h0LiAqL1xuICBoaWdobGlnaHRlZFRhc2s6IG51bGwgfCBudW1iZXI7XG5cbiAgLyoqIFRoZSBpbmRleCBvZiB0aGUgc2VsZWN0ZWQgdGFzaywgb3IgLTEgaWYgbm8gdGFzayBpcyBzZWxlY3RlZC4gVGhpcyBpc1xuICAgKiBhbHdheXMgYW4gaW5kZXggaW50byB0aGUgb3JpZ2luYWwgY2hhcnQsIGFuZCBub3QgYW4gaW5kZXggaW50byBhIGZpbHRlcmVkXG4gICAqIGNoYXJ0LlxuICAgKi9cbiAgc2VsZWN0ZWRUYXNrSW5kZXg6IG51bWJlcjtcbn1cblxuY29uc3QgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAoXG4gIHRhc2s6IFRhc2ssXG4gIGRpcmVjdGlvbjogRGlyZWN0aW9uXG4pOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIikge1xuICAgICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZUJvdHRvbTtcbiAgICB9XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQ7XG4gIH1cbn07XG5cbmNvbnN0IHZlcnRpY2FsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAoXG4gIHRhc2s6IFRhc2ssXG4gIGRpcmVjdGlvbjogRGlyZWN0aW9uXG4pOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIikge1xuICAgICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcDtcbiAgICB9XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIikge1xuICAgICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3A7XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0Qm90dG9tO1xuICB9XG59O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5jb25zdCBob3Jpem9udGFsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKHRhc2s6IFRhc2spOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQ7XG4gIH1cbn07XG5cbmNvbnN0IGhvcml6b250YWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9ICh0YXNrOiBUYXNrKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3Q7XG4gIH1cbn07XG5cbi8qKlxuICogQ29tcHV0ZSB3aGF0IHRoZSBoZWlnaHQgb2YgdGhlIGNhbnZhcyBzaG91bGQgYmUuIE5vdGUgdGhhdCB0aGUgdmFsdWUgZG9lc24ndFxuICoga25vdyBhYm91dCBgd2luZG93LmRldmljZVBpeGVsUmF0aW9gLCBzbyBpZiB0aGUgY2FudmFzIGlzIGFscmVhZHkgc2NhbGVkIGJ5XG4gKiBgd2luZG93LmRldmljZVBpeGVsUmF0aW9gIHRoZW4gc28gd2lsbCB0aGUgcmVzdWx0IG9mIHRoaXMgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWdnZXN0ZWRDYW52YXNIZWlnaHQoXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gIHNwYW5zOiBTcGFuW10sXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIG1heFJvd3M6IG51bWJlclxuKTogbnVtYmVyIHtcbiAgaWYgKCFvcHRzLmhhc1Rhc2tzKSB7XG4gICAgbWF4Um93cyA9IDA7XG4gIH1cbiAgcmV0dXJuIG5ldyBTY2FsZShcbiAgICBvcHRzLFxuICAgIGNhbnZhcy53aWR0aCxcbiAgICBzcGFuc1tzcGFucy5sZW5ndGggLSAxXS5maW5pc2ggKyAxXG4gICkuaGVpZ2h0KG1heFJvd3MpO1xufVxuXG4vLyBUaGUgbG9jYXRpb24sIGluIGNhbnZhcyBwaXhlbCBjb29yZGluYXRlcywgb2YgZWFjaCB0YXNrIGJhci4gU2hvdWxkIHVzZSB0aGVcbi8vIHRleHQgb2YgdGhlIHRhc2sgbGFiZWwgYXMgdGhlIGxvY2F0aW9uLCBzaW5jZSB0aGF0J3MgYWx3YXlzIGRyYXduIGluIHRoZSB2aWV3XG4vLyBpZiBwb3NzaWJsZS5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza0xvY2F0aW9uIHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG5cbiAgLy8gVGhhdCBpbmRleCBvZiB0aGUgdGFzayBpbiB0aGUgdW5maWx0ZXJlZCBDaGFydC5cbiAgb3JpZ2luYWxUYXNrSW5kZXg6IG51bWJlcjtcbn1cblxudHlwZSBVcGRhdGVUeXBlID0gXCJtb3VzZW1vdmVcIiB8IFwibW91c2Vkb3duXCI7XG5cbi8vIEEgZnVuYyB0aGF0IHRha2VzIGEgUG9pbnQgYW5kIHJlZHJhd3MgdGhlIGhpZ2hsaWdodGVkIHRhc2sgaWYgbmVlZGVkLCByZXR1cm5zXG4vLyB0aGUgaW5kZXggb2YgdGhlIHRhc2sgdGhhdCBpcyBoaWdobGlnaHRlZC5cbmV4cG9ydCB0eXBlIFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyA9IChcbiAgcG9pbnQ6IFBvaW50LFxuICB1cGRhdGVUeXBlOiBVcGRhdGVUeXBlXG4pID0+IG51bWJlciB8IG51bGw7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyUmVzdWx0IHtcbiAgc2NhbGU6IFNjYWxlO1xuICB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M6IFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyB8IG51bGw7XG4gIHNlbGVjdGVkVGFza0xvY2F0aW9uOiBQb2ludCB8IG51bGw7XG59XG5cbi8vIFRPRE8gLSBQYXNzIGluIG1heCByb3dzLCBhbmQgYSBtYXBwaW5nIHRoYXQgbWFwcyBmcm9tIHRhc2tJbmRleCB0byByb3csXG4vLyBiZWNhdXNlIHR3byBkaWZmZXJlbnQgdGFza3MgbWlnaHQgYmUgcGxhY2VkIG9uIHRoZSBzYW1lIHJvdy4gQWxzbyB3ZSBzaG91bGRcbi8vIHBhc3MgaW4gbWF4IHJvd3M/IE9yIHNob3VsZCB0aGF0IGNvbWUgZnJvbSB0aGUgYWJvdmUgbWFwcGluZz9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJUYXNrc1RvQ2FudmFzKFxuICBwYXJlbnQ6IEhUTUxFbGVtZW50LFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgcGxhbjogUGxhbixcbiAgc3BhbnM6IFNwYW5bXSxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgb3ZlcmxheTogSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsID0gbnVsbFxuKTogUmVzdWx0PFJlbmRlclJlc3VsdD4ge1xuICBjb25zdCB2cmV0ID0gdmFsaWRhdGVDaGFydChwbGFuLmNoYXJ0KTtcbiAgaWYgKCF2cmV0Lm9rKSB7XG4gICAgcmV0dXJuIHZyZXQ7XG4gIH1cblxuICBjb25zdCB0YXNrTG9jYXRpb25zOiBUYXNrTG9jYXRpb25bXSA9IFtdO1xuXG4gIGNvbnN0IG9yaWdpbmFsTGFiZWxzID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5tYXAoXG4gICAgKHRhc2s6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKSA9PiBvcHRzLnRhc2tMYWJlbCh0YXNrSW5kZXgpXG4gICk7XG5cbiAgLy8gQXBwbHkgdGhlIGZpbHRlciBhbmQgd29yayB3aXRoIHRoZSBDaGFydExpa2UgcmV0dXJuIGZyb20gdGhpcyBwb2ludCBvbi5cbiAgLy8gRml0bGVyIGFsc28gbmVlZHMgdG8gYmUgYXBwbGllZCB0byBzcGFucy5cbiAgY29uc3QgZnJldCA9IGZpbHRlcihcbiAgICBwbGFuLmNoYXJ0LFxuICAgIG9wdHMuZmlsdGVyRnVuYyxcbiAgICBvcHRzLnRhc2tFbXBoYXNpemUsXG4gICAgc3BhbnMsXG4gICAgb3JpZ2luYWxMYWJlbHMsXG4gICAgb3B0cy5zZWxlY3RlZFRhc2tJbmRleFxuICApO1xuICBpZiAoIWZyZXQub2spIHtcbiAgICByZXR1cm4gZnJldDtcbiAgfVxuICBjb25zdCBjaGFydExpa2UgPSBmcmV0LnZhbHVlLmNoYXJ0TGlrZTtcbiAgY29uc3QgbGFiZWxzID0gZnJldC52YWx1ZS5sYWJlbHM7XG4gIGNvbnN0IHJlc291cmNlRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKG9wdHMuZ3JvdXBCeVJlc291cmNlKTtcbiAgY29uc3QgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXggPVxuICAgIGZyZXQudmFsdWUuZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg7XG4gIGNvbnN0IGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4ID1cbiAgICBmcmV0LnZhbHVlLmZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4O1xuXG4gIC8vIFNlbGVjdGVkIHRhc2ssIGFzIGFuIGluZGV4IGludG8gdGhlIHVuZmlsdGVyZWQgQ2hhcnQuXG4gIGxldCBsYXN0U2VsZWN0ZWRUYXNrSW5kZXggPSBvcHRzLnNlbGVjdGVkVGFza0luZGV4O1xuXG4gIC8vIEhpZ2hsaWdodGVkIHRhc2tzLlxuICBjb25zdCBlbXBoYXNpemVkVGFza3M6IFNldDxudW1iZXI+ID0gbmV3IFNldChmcmV0LnZhbHVlLmVtcGhhc2l6ZWRUYXNrcyk7XG4gIHNwYW5zID0gZnJldC52YWx1ZS5zcGFucztcblxuICAvLyBDYWxjdWxhdGUgaG93IHdpZGUgd2UgbmVlZCB0byBtYWtlIHRoZSBncm91cEJ5IGNvbHVtbi5cbiAgbGV0IG1heEdyb3VwTmFtZUxlbmd0aCA9IDA7XG4gIGlmIChvcHRzLmdyb3VwQnlSZXNvdXJjZSAhPT0gXCJcIiAmJiBvcHRzLmhhc1RleHQpIHtcbiAgICBtYXhHcm91cE5hbWVMZW5ndGggPSBvcHRzLmdyb3VwQnlSZXNvdXJjZS5sZW5ndGg7XG4gICAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmZvckVhY2goKHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgbWF4R3JvdXBOYW1lTGVuZ3RoID0gTWF0aC5tYXgobWF4R3JvdXBOYW1lTGVuZ3RoLCB2YWx1ZS5sZW5ndGgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgdG90YWxOdW1iZXJPZlJvd3MgPSBzcGFucy5sZW5ndGg7XG4gIGNvbnN0IHRvdGFsTnVtYmVyT2ZEYXlzID0gc3BhbnNbc3BhbnMubGVuZ3RoIC0gMV0uZmluaXNoO1xuICBjb25zdCBzY2FsZSA9IG5ldyBTY2FsZShcbiAgICBvcHRzLFxuICAgIGNhbnZhcy53aWR0aCxcbiAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgbWF4R3JvdXBOYW1lTGVuZ3RoXG4gICk7XG5cbiAgY29uc3QgdGFza0xpbmVIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLnRhc2tMaW5lSGVpZ2h0KTtcbiAgY29uc3QgZGlhbW9uZERpYW1ldGVyID0gc2NhbGUubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcik7XG4gIGNvbnN0IHBlcmNlbnRIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLnBlcmNlbnRIZWlnaHQpO1xuICBjb25zdCBhcnJvd0hlYWRIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLmFycm93SGVhZEhlaWdodCk7XG4gIGNvbnN0IGFycm93SGVhZFdpZHRoID0gc2NhbGUubWV0cmljKE1ldHJpYy5hcnJvd0hlYWRXaWR0aCk7XG4gIGNvbnN0IGRheXNXaXRoVGltZU1hcmtlcnM6IFNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuICBjb25zdCB0aXJldCA9IHRhc2tJbmRleFRvUm93RnJvbUdyb3VwQnkoXG4gICAgb3B0cyxcbiAgICByZXNvdXJjZURlZmluaXRpb24sXG4gICAgY2hhcnRMaWtlLFxuICAgIGZyZXQudmFsdWUuZGlzcGxheU9yZGVyXG4gICk7XG4gIGlmICghdGlyZXQub2spIHtcbiAgICByZXR1cm4gdGlyZXQ7XG4gIH1cbiAgY29uc3QgdGFza0luZGV4VG9Sb3cgPSB0aXJldC52YWx1ZS50YXNrSW5kZXhUb1JvdztcbiAgY29uc3Qgcm93UmFuZ2VzID0gdGlyZXQudmFsdWUucm93UmFuZ2VzO1xuXG4gIC8vIFNldCB1cCBjYW52YXMgYmFzaWNzLlxuICBjbGVhckNhbnZhcyhjdHgsIG9wdHMsIGNhbnZhcyk7XG4gIHNldEZvbnRTaXplKGN0eCwgb3B0cyk7XG5cbiAgY29uc3QgY2xpcFJlZ2lvbiA9IG5ldyBQYXRoMkQoKTtcbiAgY29uc3QgY2xpcE9yaWdpbiA9IHNjYWxlLmZlYXR1cmUoMCwgMCwgRmVhdHVyZS50YXNrc0NsaXBSZWN0T3JpZ2luKTtcbiAgY29uc3QgY2xpcFdpZHRoID0gY2FudmFzLndpZHRoIC0gY2xpcE9yaWdpbi54O1xuICBjbGlwUmVnaW9uLnJlY3QoY2xpcE9yaWdpbi54LCAwLCBjbGlwV2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gIC8vIERyYXcgYmlnIHJlZCByZWN0IG92ZXIgd2hlcmUgdGhlIGNsaXAgcmVnaW9uIHdpbGwgYmUuXG4gIGlmICgwKSB7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZWRcIjtcbiAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnN0cm9rZShjbGlwUmVnaW9uKTtcbiAgfVxuXG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcblxuICBpZiAocm93UmFuZ2VzICE9PSBudWxsKSB7XG4gICAgaWYgKG9wdHMuaGFzVGFza3MpIHtcbiAgICAgIGRyYXdTd2ltTGFuZUhpZ2hsaWdodHMoXG4gICAgICAgIGN0eCxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIHJvd1JhbmdlcyxcbiAgICAgICAgdG90YWxOdW1iZXJPZkRheXMsXG4gICAgICAgIG9wdHMuY29sb3JzLmdyb3VwQ29sb3JcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiAhPT0gdW5kZWZpbmVkICYmIG9wdHMuaGFzVGV4dCkge1xuICAgICAgZHJhd1N3aW1MYW5lTGFiZWxzKGN0eCwgb3B0cywgcmVzb3VyY2VEZWZpbml0aW9uLCBzY2FsZSwgcm93UmFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG5cbiAgY3R4LnNhdmUoKTtcbiAgY3R4LmNsaXAoY2xpcFJlZ2lvbik7XG5cbiAgY29uc3QgdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVyczogTWFwPG51bWJlciwgUmVjdD4gPSBuZXcgTWFwKCk7XG5cbiAgLy8gRHJhdyB0YXNrcyBpbiB0aGVpciByb3dzLlxuICBjaGFydExpa2UuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCByb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQodGFza0luZGV4KSE7XG4gICAgY29uc3Qgc3BhbiA9IHNwYW5zW3Rhc2tJbmRleF07XG4gICAgY29uc3QgdGFza1N0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIHNwYW4uc3RhcnQsIEZlYXR1cmUudGFza0xpbmVTdGFydCk7XG4gICAgY29uc3QgdGFza0VuZCA9IHNjYWxlLmZlYXR1cmUocm93LCBzcGFuLmZpbmlzaCwgRmVhdHVyZS50YXNrTGluZVN0YXJ0KTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcblxuICAgIC8vIERyYXcgaW4gdGltZSBtYXJrZXJzIGlmIGRpc3BsYXllZC5cbiAgICAvLyBUT0RPIC0gTWFrZSBzdXJlIHRoZXkgZG9uJ3Qgb3ZlcmxhcC5cbiAgICBpZiAob3B0cy5kcmF3VGltZU1hcmtlcnNPblRhc2tzKSB7XG4gICAgICBkcmF3VGltZU1hcmtlckF0RGF5VG9UYXNrKFxuICAgICAgICBjdHgsXG4gICAgICAgIHJvdyxcbiAgICAgICAgc3Bhbi5zdGFydCxcbiAgICAgICAgdGFzayxcbiAgICAgICAgb3B0cyxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIGRheXNXaXRoVGltZU1hcmtlcnNcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGVtcGhhc2l6ZWRUYXNrcy5oYXModGFza0luZGV4KSkge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgICB9XG4gICAgY29uc3QgaGlnaGxpZ2h0VG9wTGVmdCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3csXG4gICAgICBzcGFuLnN0YXJ0LFxuICAgICAgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3BcbiAgICApO1xuICAgIGNvbnN0IGhpZ2hsaWdodEJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvdyArIDEsXG4gICAgICBzcGFuLmZpbmlzaCxcbiAgICAgIEZlYXR1cmUudGFza0VudmVsb3BlVG9wXG4gICAgKTtcblxuICAgIHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMuc2V0KHRhc2tJbmRleCwge1xuICAgICAgdG9wTGVmdDogaGlnaGxpZ2h0VG9wTGVmdCxcbiAgICAgIGJvdHRvbVJpZ2h0OiBoaWdobGlnaHRCb3R0b21SaWdodCxcbiAgICB9KTtcbiAgICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgICAgaWYgKHRhc2tTdGFydC54ID09PSB0YXNrRW5kLngpIHtcbiAgICAgICAgZHJhd01pbGVzdG9uZShjdHgsIHRhc2tTdGFydCwgZGlhbW9uZERpYW1ldGVyLCBwZXJjZW50SGVpZ2h0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyYXdUYXNrQmFyKGN0eCwgdGFza1N0YXJ0LCB0YXNrRW5kLCB0YXNrTGluZUhlaWdodCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNraXAgZHJhd2luZyB0aGUgdGV4dCBvZiB0aGUgU3RhcnQgYW5kIEZpbmlzaCB0YXNrcy5cbiAgICAgIGlmICh0YXNrSW5kZXggIT09IDAgJiYgdGFza0luZGV4ICE9PSB0b3RhbE51bWJlck9mUm93cyAtIDEpIHtcbiAgICAgICAgZHJhd1Rhc2tUZXh0KFxuICAgICAgICAgIGN0eCxcbiAgICAgICAgICBvcHRzLFxuICAgICAgICAgIHNjYWxlLFxuICAgICAgICAgIHJvdyxcbiAgICAgICAgICBzcGFuLFxuICAgICAgICAgIHRhc2ssXG4gICAgICAgICAgdGFza0luZGV4LFxuICAgICAgICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LmdldCh0YXNrSW5kZXgpISxcbiAgICAgICAgICBjbGlwV2lkdGgsXG4gICAgICAgICAgbGFiZWxzLFxuICAgICAgICAgIHRhc2tMb2NhdGlvbnNcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGN0eC5saW5lV2lkdGggPSAxO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcblxuICAvLyBOb3cgZHJhdyBhbGwgdGhlIGFycm93cywgaS5lLiBlZGdlcy5cbiAgaWYgKG9wdHMuaGFzRWRnZXMgJiYgb3B0cy5oYXNUYXNrcykge1xuICAgIGNvbnN0IGhpZ2hsaWdodGVkRWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgY29uc3Qgbm9ybWFsRWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgY2hhcnRMaWtlLkVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgaWYgKGVtcGhhc2l6ZWRUYXNrcy5oYXMoZS5pKSAmJiBlbXBoYXNpemVkVGFza3MuaGFzKGUuaikpIHtcbiAgICAgICAgaGlnaGxpZ2h0ZWRFZGdlcy5wdXNoKGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9ybWFsRWRnZXMucHVzaChlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIGRyYXdFZGdlcyhcbiAgICAgIGN0eCxcbiAgICAgIG9wdHMsXG4gICAgICBub3JtYWxFZGdlcyxcbiAgICAgIHNwYW5zLFxuICAgICAgY2hhcnRMaWtlLlZlcnRpY2VzLFxuICAgICAgc2NhbGUsXG4gICAgICB0YXNrSW5kZXhUb1JvdyxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0LFxuICAgICAgZW1waGFzaXplZFRhc2tzXG4gICAgKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgZHJhd0VkZ2VzKFxuICAgICAgY3R4LFxuICAgICAgb3B0cyxcbiAgICAgIGhpZ2hsaWdodGVkRWRnZXMsXG4gICAgICBzcGFucyxcbiAgICAgIGNoYXJ0TGlrZS5WZXJ0aWNlcyxcbiAgICAgIHNjYWxlLFxuICAgICAgdGFza0luZGV4VG9Sb3csXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodCxcbiAgICAgIGVtcGhhc2l6ZWRUYXNrc1xuICAgICk7XG4gIH1cblxuICAvLyBSZW1vdmUgdGhlIGNsaXAgcmVnaW9uLlxuICBjdHgucmVzdG9yZSgpO1xuXG4gIC8vIE5vdyBkcmF3IHRoZSByYW5nZSBoaWdobGlnaHRzIGlmIHJlcXVpcmVkLlxuICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UgIT09IG51bGwgJiYgb3B0cy5kaXNwbGF5UmFuZ2VVc2FnZSA9PT0gXCJoaWdobGlnaHRcIikge1xuICAgIC8vIERyYXcgYSByZWN0IG92ZXIgZWFjaCBzaWRlIHRoYXQgaXNuJ3QgaW4gdGhlIHJhbmdlLlxuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiA+IDApIHtcbiAgICAgIGRyYXdSYW5nZU92ZXJsYXkoXG4gICAgICAgIGN0eCxcbiAgICAgICAgb3B0cyxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIDAsXG4gICAgICAgIG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luLFxuICAgICAgICB0b3RhbE51bWJlck9mUm93c1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmVuZCA8IHRvdGFsTnVtYmVyT2ZEYXlzKSB7XG4gICAgICBkcmF3UmFuZ2VPdmVybGF5KFxuICAgICAgICBjdHgsXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICBvcHRzLmRpc3BsYXlSYW5nZS5lbmQsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzICsgMSxcbiAgICAgICAgdG90YWxOdW1iZXJPZlJvd3NcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgbGV0IHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvczogVXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zIHwgbnVsbCA9IG51bGw7XG4gIGxldCBzZWxlY3RlZFRhc2tMb2NhdGlvbjogUG9pbnQgfCBudWxsID0gbnVsbDtcblxuICBpZiAob3ZlcmxheSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IG92ZXJsYXlDdHggPSBvdmVybGF5LmdldENvbnRleHQoXCIyZFwiKSE7XG5cbiAgICAvLyBBZGQgaW4gYWxsIGZvdXIgY29ybmVycyBvZiBldmVyeSBUYXNrIHRvIHRhc2tMb2NhdGlvbnMuXG4gICAgdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5mb3JFYWNoKFxuICAgICAgKHJjOiBSZWN0LCBmaWx0ZXJlZFRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsVGFza0luZGV4ID1cbiAgICAgICAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleC5nZXQoZmlsdGVyZWRUYXNrSW5kZXgpITtcbiAgICAgICAgdGFza0xvY2F0aW9ucy5wdXNoKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHg6IHJjLmJvdHRvbVJpZ2h0LngsXG4gICAgICAgICAgICB5OiByYy5ib3R0b21SaWdodC55LFxuICAgICAgICAgICAgb3JpZ2luYWxUYXNrSW5kZXg6IG9yaWdpbmFsVGFza0luZGV4LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgeDogcmMudG9wTGVmdC54LFxuICAgICAgICAgICAgeTogcmMudG9wTGVmdC55LFxuICAgICAgICAgICAgb3JpZ2luYWxUYXNrSW5kZXg6IG9yaWdpbmFsVGFza0luZGV4LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgeDogcmMuYm90dG9tUmlnaHQueCxcbiAgICAgICAgICAgIHk6IHJjLnRvcExlZnQueSxcbiAgICAgICAgICAgIG9yaWdpbmFsVGFza0luZGV4OiBvcmlnaW5hbFRhc2tJbmRleCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHg6IHJjLnRvcExlZnQueCxcbiAgICAgICAgICAgIHk6IHJjLmJvdHRvbVJpZ2h0LnksXG4gICAgICAgICAgICBvcmlnaW5hbFRhc2tJbmRleDogb3JpZ2luYWxUYXNrSW5kZXgsXG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gICAgY29uc3QgdGFza0xvY2F0aW9uS0RUcmVlID0gbmV3IEtEVHJlZSh0YXNrTG9jYXRpb25zKTtcblxuICAgIC8vIEFsd2F5cyByZWNvcmVkIGluIHRoZSBvcmlnaW5hbCB1bmZpbHRlcmVkIHRhc2sgaW5kZXguXG4gICAgbGV0IGxhc3RIaWdobGlnaHRlZFRhc2tJbmRleCA9IC0xO1xuXG4gICAgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zID0gKFxuICAgICAgcG9pbnQ6IFBvaW50LFxuICAgICAgdXBkYXRlVHlwZTogVXBkYXRlVHlwZVxuICAgICk6IG51bWJlciB8IG51bGwgPT4ge1xuICAgICAgLy8gRmlyc3QgY29udmVydCBwb2ludCBpbiBvZmZzZXQgY29vcmRzIGludG8gY2FudmFzIGNvb3Jkcy5cbiAgICAgIHBvaW50LnggPSBwb2ludC54ICogd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgICBwb2ludC55ID0gcG9pbnQueSAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgY29uc3QgdGFza0xvY2F0aW9uID0gdGFza0xvY2F0aW9uS0RUcmVlLm5lYXJlc3QocG9pbnQpO1xuICAgICAgY29uc3Qgb3JpZ2luYWxUYXNrSW5kZXggPSB0YXNrTG9jYXRpb24ub3JpZ2luYWxUYXNrSW5kZXg7XG5cbiAgICAgIC8vIERvIG5vdCBhbGxvdyBoaWdobGlnaHRpbmcgb3IgY2xpY2tpbmcgdGhlIFN0YXJ0IGFuZCBGaW5pc2ggdGFza3MuXG4gICAgICBpZiAoXG4gICAgICAgIG9yaWdpbmFsVGFza0luZGV4ID09PSAwIHx8XG4gICAgICAgIG9yaWdpbmFsVGFza0luZGV4ID09PSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDFcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICh1cGRhdGVUeXBlID09PSBcIm1vdXNlbW92ZVwiKSB7XG4gICAgICAgIGlmIChvcmlnaW5hbFRhc2tJbmRleCA9PT0gbGFzdEhpZ2hsaWdodGVkVGFza0luZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsVGFza0luZGV4O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAob3JpZ2luYWxUYXNrSW5kZXggPT09IGxhc3RTZWxlY3RlZFRhc2tJbmRleCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodXBkYXRlVHlwZSA9PT0gXCJtb3VzZW1vdmVcIikge1xuICAgICAgICBsYXN0SGlnaGxpZ2h0ZWRUYXNrSW5kZXggPSBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhc3RTZWxlY3RlZFRhc2tJbmRleCA9IG9yaWdpbmFsVGFza0luZGV4O1xuICAgICAgfVxuXG4gICAgICBvdmVybGF5Q3R4LmNsZWFyUmVjdCgwLCAwLCBvdmVybGF5LndpZHRoLCBvdmVybGF5LmhlaWdodCk7XG5cbiAgICAgIC8vIERyYXcgYm90aCBoaWdobGlnaHQgYW5kIHNlbGVjdGlvbi5cblxuICAgICAgLy8gRHJhdyBoaWdobGlnaHQuXG4gICAgICBsZXQgY29ybmVycyA9IHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMuZ2V0KFxuICAgICAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5nZXQobGFzdEhpZ2hsaWdodGVkVGFza0luZGV4KSFcbiAgICAgICk7XG4gICAgICBpZiAoY29ybmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRyYXdUYXNrSGlnaGxpZ2h0KFxuICAgICAgICAgIG92ZXJsYXlDdHgsXG4gICAgICAgICAgY29ybmVycy50b3BMZWZ0LFxuICAgICAgICAgIGNvcm5lcnMuYm90dG9tUmlnaHQsXG4gICAgICAgICAgb3B0cy5jb2xvcnMuaGlnaGxpZ2h0LFxuICAgICAgICAgIHNjYWxlLm1ldHJpYyh0YXNrTGluZUhlaWdodClcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gRHJhdyBzZWxlY3Rpb24uXG4gICAgICBjb3JuZXJzID0gdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5nZXQoXG4gICAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4LmdldChsYXN0U2VsZWN0ZWRUYXNrSW5kZXgpIVxuICAgICAgKTtcbiAgICAgIGlmIChjb3JuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZHJhd1NlbGVjdGlvbkhpZ2hsaWdodChcbiAgICAgICAgICBvdmVybGF5Q3R4LFxuICAgICAgICAgIGNvcm5lcnMudG9wTGVmdCxcbiAgICAgICAgICBjb3JuZXJzLmJvdHRvbVJpZ2h0LFxuICAgICAgICAgIG9wdHMuY29sb3JzLmhpZ2hsaWdodFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgfTtcblxuICAgIC8vIERyYXcgc2VsZWN0aW9uLlxuICAgIGNvbnN0IGNvcm5lcnMgPSB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmdldChcbiAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4LmdldChsYXN0U2VsZWN0ZWRUYXNrSW5kZXgpIVxuICAgICk7XG4gICAgaWYgKGNvcm5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZHJhd1NlbGVjdGlvbkhpZ2hsaWdodChcbiAgICAgICAgb3ZlcmxheUN0eCxcbiAgICAgICAgY29ybmVycy50b3BMZWZ0LFxuICAgICAgICBjb3JuZXJzLmJvdHRvbVJpZ2h0LFxuICAgICAgICBvcHRzLmNvbG9ycy5oaWdobGlnaHRcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgaGlnaGVzdCB0YXNrIG9mIGFsbCB0aGUgdGFza3MgZGlzcGxheWVkLlxuICB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmZvckVhY2goKHJjOiBSZWN0KSA9PiB7XG4gICAgaWYgKHNlbGVjdGVkVGFza0xvY2F0aW9uID09PSBudWxsKSB7XG4gICAgICBzZWxlY3RlZFRhc2tMb2NhdGlvbiA9IHJjLnRvcExlZnQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChyYy50b3BMZWZ0LnkgPCBzZWxlY3RlZFRhc2tMb2NhdGlvbi55KSB7XG4gICAgICBzZWxlY3RlZFRhc2tMb2NhdGlvbiA9IHJjLnRvcExlZnQ7XG4gICAgfVxuICB9KTtcblxuICBpZiAoXG4gICAgb3B0cy5zZWxlY3RlZFRhc2tJbmRleCAhPT0gLTEgJiZcbiAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5oYXMob3B0cy5zZWxlY3RlZFRhc2tJbmRleClcbiAgKSB7XG4gICAgc2VsZWN0ZWRUYXNrTG9jYXRpb24gPSB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmdldChcbiAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4LmdldChvcHRzLnNlbGVjdGVkVGFza0luZGV4KSEgLy8gQ29udmVydFxuICAgICkhLnRvcExlZnQ7XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIHNlbGVjdGVkIHRhc2sgbG9jYXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzLCBub3QgaW4gY2FudmFzXG4gIC8vIHVuaXRzLlxuICBsZXQgcmV0dXJuZWRMb2NhdGlvbjogUG9pbnQgfCBudWxsID0gbnVsbDtcbiAgaWYgKHNlbGVjdGVkVGFza0xvY2F0aW9uICE9PSBudWxsKSB7XG4gICAgcmV0dXJuZWRMb2NhdGlvbiA9IG5ldyBQb2ludChcbiAgICAgIHNlbGVjdGVkVGFza0xvY2F0aW9uLnggLyB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyxcbiAgICAgIHNlbGVjdGVkVGFza0xvY2F0aW9uLnkgLyB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb1xuICAgICk7XG4gIH1cblxuICByZXR1cm4gb2soe1xuICAgIHNjYWxlOiBzY2FsZSxcbiAgICB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M6IHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyxcbiAgICBzZWxlY3RlZFRhc2tMb2NhdGlvbjogcmV0dXJuZWRMb2NhdGlvbixcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdFZGdlcyhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSxcbiAgc3BhbnM6IFNwYW5bXSxcbiAgdGFza3M6IFRhc2tbXSxcbiAgc2NhbGU6IFNjYWxlLFxuICB0YXNrSW5kZXhUb1JvdzogVGFza0luZGV4VG9Sb3csXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyLFxuICB0YXNrSGlnaGxpZ2h0czogU2V0PG51bWJlcj5cbikge1xuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBjb25zdCBzcmNTbGFjazogU3BhbiA9IHNwYW5zW2UuaV07XG4gICAgY29uc3QgZHN0U2xhY2s6IFNwYW4gPSBzcGFuc1tlLmpdO1xuICAgIGNvbnN0IHNyY1Rhc2s6IFRhc2sgPSB0YXNrc1tlLmldO1xuICAgIGNvbnN0IGRzdFRhc2s6IFRhc2sgPSB0YXNrc1tlLmpdO1xuICAgIGNvbnN0IHNyY1JvdyA9IHRhc2tJbmRleFRvUm93LmdldChlLmkpITtcbiAgICBjb25zdCBkc3RSb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQoZS5qKSE7XG4gICAgY29uc3Qgc3JjRGF5ID0gc3JjU2xhY2suZmluaXNoO1xuICAgIGNvbnN0IGRzdERheSA9IGRzdFNsYWNrLnN0YXJ0O1xuXG4gICAgaWYgKHRhc2tIaWdobGlnaHRzLmhhcyhlLmkpICYmIHRhc2tIaWdobGlnaHRzLmhhcyhlLmopKSB7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIH1cblxuICAgIGRyYXdBcnJvd0JldHdlZW5UYXNrcyhcbiAgICAgIGN0eCxcbiAgICAgIHNyY0RheSxcbiAgICAgIGRzdERheSxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkcmF3UmFuZ2VPdmVybGF5KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgc2NhbGU6IFNjYWxlLFxuICBiZWdpbkRheTogbnVtYmVyLFxuICBlbmREYXk6IG51bWJlcixcbiAgdG90YWxOdW1iZXJPZlJvd3M6IG51bWJlclxuKSB7XG4gIGNvbnN0IHRvcExlZnQgPSBzY2FsZS5mZWF0dXJlKDAsIGJlZ2luRGF5LCBGZWF0dXJlLmRpc3BsYXlSYW5nZVRvcCk7XG4gIGNvbnN0IGJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICB0b3RhbE51bWJlck9mUm93cyxcbiAgICBlbmREYXksXG4gICAgRmVhdHVyZS50YXNrUm93Qm90dG9tXG4gICk7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vdmVybGF5O1xuICBjdHguZmlsbFJlY3QoXG4gICAgdG9wTGVmdC54LFxuICAgIHRvcExlZnQueSxcbiAgICBib3R0b21SaWdodC54IC0gdG9wTGVmdC54LFxuICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgKTtcbiAgY29uc29sZS5sb2coXCJkcmF3UmFuZ2VPdmVybGF5XCIsIHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcbn1cblxuZnVuY3Rpb24gZHJhd0Fycm93QmV0d2VlblRhc2tzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc3JjRGF5OiBudW1iZXIsXG4gIGRzdERheTogbnVtYmVyLFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNUYXNrOiBUYXNrLFxuICBkc3RSb3c6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXJcbikge1xuICBpZiAoc3JjRGF5ID09PSBkc3REYXkpIHtcbiAgICBkcmF3VmVydGljYWxBcnJvd1RvVGFzayhcbiAgICAgIGN0eCxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjRGF5LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdERheSxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgZHJhd0xTaGFwZWRBcnJvd1RvVGFzayhcbiAgICAgIGN0eCxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjRGF5LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBkc3REYXksXG4gICAgICBhcnJvd0hlYWRIZWlnaHQsXG4gICAgICBhcnJvd0hlYWRXaWR0aFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYXJDYW52YXMoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50XG4pIHtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLnN1cmZhY2U7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG59XG5cbmZ1bmN0aW9uIHNldEZvbnRTaXplKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBvcHRzOiBSZW5kZXJPcHRpb25zKSB7XG4gIGN0eC5mb250ID0gYCR7b3B0cy5mb250U2l6ZVB4fXB4IHNlcmlmYDtcbn1cblxuLy8gRHJhdyBMIHNoYXBlZCBhcnJvdywgZmlyc3QgZ29pbmcgYmV0d2VlbiByb3dzLCB0aGVuIGdvaW5nIGJldHdlZW4gZGF5cy5cbmZ1bmN0aW9uIGRyYXdMU2hhcGVkQXJyb3dUb1Rhc2soXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNEYXk6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdFRhc2s6IFRhc2ssXG4gIGRzdERheTogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlcixcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlclxuKSB7XG4gIC8vIERyYXcgdmVydGljYWwgcGFydCBvZiB0aGUgXCJMXCIuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY29uc3QgZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSBzcmNSb3cgPCBkc3RSb3cgPyBcImRvd25cIiA6IFwidXBcIjtcbiAgY29uc3QgdmVydExpbmVTdGFydCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgc3JjUm93LFxuICAgIHNyY0RheSxcbiAgICB2ZXJ0aWNhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihzcmNUYXNrLCBkaXJlY3Rpb24pXG4gICk7XG4gIGNvbnN0IHZlcnRMaW5lRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICBkc3RSb3csXG4gICAgc3JjRGF5LFxuICAgIGhvcml6b250YWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihkc3RUYXNrKVxuICApO1xuICBjdHgubW92ZVRvKHZlcnRMaW5lU3RhcnQueCArIDAuNSwgdmVydExpbmVTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIHZlcnRMaW5lRW5kLnkpO1xuXG4gIC8vIERyYXcgaG9yaXpvbnRhbCBwYXJ0IG9mIHRoZSBcIkxcIi5cbiAgY29uc3QgaG9yekxpbmVTdGFydCA9IHZlcnRMaW5lRW5kO1xuICBjb25zdCBob3J6TGluZUVuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIGRzdERheSxcbiAgICBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oZHN0VGFzaylcbiAgKTtcbiAgY3R4Lm1vdmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIGhvcnpMaW5lU3RhcnQueSk7XG4gIGN0eC5saW5lVG8oaG9yekxpbmVFbmQueCArIDAuNSwgaG9yekxpbmVFbmQueSk7XG5cbiAgLy8gRHJhdyB0aGUgYXJyb3doZWFkLiBUaGlzIGFycm93IGhlYWQgd2lsbCBhbHdheXMgcG9pbnQgdG8gdGhlIHJpZ2h0XG4gIC8vIHNpbmNlIHRoYXQncyBob3cgdGltZSBmbG93cy5cbiAgY3R4Lm1vdmVUbyhob3J6TGluZUVuZC54ICsgMC41LCBob3J6TGluZUVuZC55KTtcbiAgY3R4LmxpbmVUbyhcbiAgICBob3J6TGluZUVuZC54IC0gYXJyb3dIZWFkSGVpZ2h0ICsgMC41LFxuICAgIGhvcnpMaW5lRW5kLnkgKyBhcnJvd0hlYWRXaWR0aFxuICApO1xuICBjdHgubW92ZVRvKGhvcnpMaW5lRW5kLnggKyAwLjUsIGhvcnpMaW5lRW5kLnkpO1xuICBjdHgubGluZVRvKFxuICAgIGhvcnpMaW5lRW5kLnggLSBhcnJvd0hlYWRIZWlnaHQgKyAwLjUsXG4gICAgaG9yekxpbmVFbmQueSAtIGFycm93SGVhZFdpZHRoXG4gICk7XG4gIGN0eC5zdHJva2UoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1ZlcnRpY2FsQXJyb3dUb1Rhc2soXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNEYXk6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdERheTogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGNvbnN0IGRpcmVjdGlvbjogRGlyZWN0aW9uID0gc3JjUm93IDwgZHN0Um93ID8gXCJkb3duXCIgOiBcInVwXCI7XG4gIGNvbnN0IGFycm93U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHNyY1JvdyxcbiAgICBzcmNEYXksXG4gICAgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oc3JjVGFzaywgZGlyZWN0aW9uKVxuICApO1xuICBjb25zdCBhcnJvd0VuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIGRzdERheSxcbiAgICB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKGRzdFRhc2ssIGRpcmVjdGlvbilcbiAgKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8oYXJyb3dTdGFydC54ICsgMC41LCBhcnJvd1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKGFycm93RW5kLnggKyAwLjUsIGFycm93RW5kLnkpO1xuXG4gIC8vIERyYXcgdGhlIGFycm93aGVhZC5cbiAgY29uc3QgZGVsdGFZID0gZGlyZWN0aW9uID09PSBcImRvd25cIiA/IC1hcnJvd0hlYWRIZWlnaHQgOiBhcnJvd0hlYWRIZWlnaHQ7XG4gIGN0eC5tb3ZlVG8oYXJyb3dFbmQueCArIDAuNSwgYXJyb3dFbmQueSk7XG4gIGN0eC5saW5lVG8oYXJyb3dFbmQueCAtIGFycm93SGVhZFdpZHRoICsgMC41LCBhcnJvd0VuZC55ICsgZGVsdGFZKTtcbiAgY3R4Lm1vdmVUbyhhcnJvd0VuZC54ICsgMC41LCBhcnJvd0VuZC55KTtcbiAgY3R4LmxpbmVUbyhhcnJvd0VuZC54ICsgYXJyb3dIZWFkV2lkdGggKyAwLjUsIGFycm93RW5kLnkgKyBkZWx0YVkpO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUYXNrVGV4dChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93OiBudW1iZXIsXG4gIHNwYW46IFNwYW4sXG4gIHRhc2s6IFRhc2ssXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBvcmlnaW5hbFRhc2tJbmRleDogbnVtYmVyLFxuICBjbGlwV2lkdGg6IG51bWJlcixcbiAgbGFiZWxzOiBzdHJpbmdbXSxcbiAgdGFza0xvY2F0aW9uczogVGFza0xvY2F0aW9uW11cbikge1xuICBpZiAoIW9wdHMuaGFzVGV4dCkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBsYWJlbCA9IGxhYmVsc1t0YXNrSW5kZXhdO1xuXG4gIGxldCB4U3RhcnRJblRpbWUgPSBzcGFuLnN0YXJ0O1xuICBsZXQgeFBpeGVsRGVsdGEgPSAwO1xuICAvLyBEZXRlcm1pbmUgd2hlcmUgb24gdGhlIHgtYXhpcyB0byBzdGFydCBkcmF3aW5nIHRoZSB0YXNrIHRleHQuXG4gIGlmIChvcHRzLmRpc3BsYXlSYW5nZSAhPT0gbnVsbCAmJiBvcHRzLmRpc3BsYXlSYW5nZVVzYWdlID09PSBcInJlc3RyaWN0XCIpIHtcbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuaW4oc3Bhbi5zdGFydCkpIHtcbiAgICAgIHhTdGFydEluVGltZSA9IHNwYW4uc3RhcnQ7XG4gICAgICB4UGl4ZWxEZWx0YSA9IDA7XG4gICAgfSBlbHNlIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5pbihzcGFuLmZpbmlzaCkpIHtcbiAgICAgIHhTdGFydEluVGltZSA9IHNwYW4uZmluaXNoO1xuICAgICAgY29uc3QgbWVhcyA9IGN0eC5tZWFzdXJlVGV4dChsYWJlbCk7XG4gICAgICB4UGl4ZWxEZWx0YSA9IC1tZWFzLndpZHRoIC0gMiAqIHNjYWxlLm1ldHJpYyhNZXRyaWMudGV4dFhPZmZzZXQpO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBzcGFuLnN0YXJ0IDwgb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gJiZcbiAgICAgIHNwYW4uZmluaXNoID4gb3B0cy5kaXNwbGF5UmFuZ2UuZW5kXG4gICAgKSB7XG4gICAgICB4U3RhcnRJblRpbWUgPSBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbjtcbiAgICAgIHhQaXhlbERlbHRhID0gY2xpcFdpZHRoIC8gMjtcbiAgICB9XG4gIH1cbiAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xuICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgeFN0YXJ0SW5UaW1lLCBGZWF0dXJlLnRleHRTdGFydCk7XG4gIGNvbnN0IHRleHRYID0gdGV4dFN0YXJ0LnggKyB4UGl4ZWxEZWx0YTtcbiAgY29uc3QgdGV4dFkgPSB0ZXh0U3RhcnQueTtcbiAgY3R4LmZpbGxUZXh0KGxhYmVsLCB0ZXh0U3RhcnQueCArIHhQaXhlbERlbHRhLCB0ZXh0U3RhcnQueSk7XG4gIHRhc2tMb2NhdGlvbnMucHVzaCh7XG4gICAgeDogdGV4dFgsXG4gICAgeTogdGV4dFksXG4gICAgb3JpZ2luYWxUYXNrSW5kZXg6IG9yaWdpbmFsVGFza0luZGV4LFxuICB9KTtcbn1cblxuZnVuY3Rpb24gZHJhd1Rhc2tCYXIoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICB0YXNrU3RhcnQ6IFBvaW50LFxuICB0YXNrRW5kOiBQb2ludCxcbiAgdGFza0xpbmVIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGN0eC5maWxsUmVjdChcbiAgICB0YXNrU3RhcnQueCxcbiAgICB0YXNrU3RhcnQueSxcbiAgICB0YXNrRW5kLnggLSB0YXNrU3RhcnQueCxcbiAgICB0YXNrTGluZUhlaWdodFxuICApO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza0hpZ2hsaWdodChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIGhpZ2hsaWdodFN0YXJ0OiBQb2ludCxcbiAgaGlnaGxpZ2h0RW5kOiBQb2ludCxcbiAgY29sb3I6IHN0cmluZyxcbiAgYm9yZGVyV2lkdGg6IG51bWJlclxuKSB7XG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICBjdHgubGluZVdpZHRoID0gYm9yZGVyV2lkdGg7XG4gIGN0eC5zdHJva2VSZWN0KFxuICAgIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0U3RhcnQueSxcbiAgICBoaWdobGlnaHRFbmQueCAtIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0RW5kLnkgLSBoaWdobGlnaHRTdGFydC55XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdTZWxlY3Rpb25IaWdobGlnaHQoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBoaWdobGlnaHRTdGFydDogUG9pbnQsXG4gIGhpZ2hsaWdodEVuZDogUG9pbnQsXG4gIGNvbG9yOiBzdHJpbmdcbikge1xuICBjdHguZmlsbFN0eWxlID0gY29sb3I7XG4gIGN0eC5maWxsUmVjdChcbiAgICBoaWdobGlnaHRTdGFydC54LFxuICAgIGhpZ2hsaWdodFN0YXJ0LnksXG4gICAgaGlnaGxpZ2h0RW5kLnggLSBoaWdobGlnaHRTdGFydC54LFxuICAgIGhpZ2hsaWdodEVuZC55IC0gaGlnaGxpZ2h0U3RhcnQueVxuICApO1xufVxuXG5mdW5jdGlvbiBkcmF3TWlsZXN0b25lKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgdGFza1N0YXJ0OiBQb2ludCxcbiAgZGlhbW9uZERpYW1ldGVyOiBudW1iZXIsXG4gIHBlcmNlbnRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmxpbmVXaWR0aCA9IHBlcmNlbnRIZWlnaHQgLyAyO1xuICBjdHgubW92ZVRvKHRhc2tTdGFydC54LCB0YXNrU3RhcnQueSAtIGRpYW1vbmREaWFtZXRlcik7XG4gIGN0eC5saW5lVG8odGFza1N0YXJ0LnggKyBkaWFtb25kRGlhbWV0ZXIsIHRhc2tTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh0YXNrU3RhcnQueCwgdGFza1N0YXJ0LnkgKyBkaWFtb25kRGlhbWV0ZXIpO1xuICBjdHgubGluZVRvKHRhc2tTdGFydC54IC0gZGlhbW9uZERpYW1ldGVyLCB0YXNrU3RhcnQueSk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbiAgY3R4LnN0cm9rZSgpO1xufVxuXG5jb25zdCBkcmF3VGltZU1hcmtlckF0RGF5VG9UYXNrID0gKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgcm93OiBudW1iZXIsXG4gIGRheTogbnVtYmVyLFxuICB0YXNrOiBUYXNrLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBzY2FsZTogU2NhbGUsXG4gIGRheXNXaXRoVGltZU1hcmtlcnM6IFNldDxudW1iZXI+XG4pID0+IHtcbiAgaWYgKGRheXNXaXRoVGltZU1hcmtlcnMuaGFzKGRheSkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZGF5c1dpdGhUaW1lTWFya2Vycy5hZGQoZGF5KTtcbiAgY29uc3QgdGltZU1hcmtTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudGltZU1hcmtTdGFydCk7XG4gIGNvbnN0IHRpbWVNYXJrRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICByb3csXG4gICAgZGF5LFxuICAgIHZlcnRpY2FsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24odGFzaywgXCJkb3duXCIpXG4gICk7XG4gIGN0eC5saW5lV2lkdGggPSAwLjU7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm92ZXJsYXk7XG5cbiAgY3R4Lm1vdmVUbyh0aW1lTWFya1N0YXJ0LnggKyAwLjUsIHRpbWVNYXJrU3RhcnQueSk7XG4gIGN0eC5saW5lVG8odGltZU1hcmtTdGFydC54ICsgMC41LCB0aW1lTWFya0VuZC55KTtcbiAgY3R4LnN0cm9rZSgpO1xuXG4gIGN0eC5zZXRMaW5lRGFzaChbXSk7XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gIGNvbnN0IHRleHRTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudGltZVRleHRTdGFydCk7XG4gIGlmIChvcHRzLmhhc1RleHQgJiYgb3B0cy5oYXNUaW1lbGluZSkge1xuICAgIGN0eC5maWxsVGV4dChgJHtkYXl9YCwgdGV4dFN0YXJ0LngsIHRleHRTdGFydC55KTtcbiAgfVxufTtcblxuLyoqIFJlcHJlc2VudHMgYSBoYWxmLW9wZW4gaW50ZXJ2YWwgb2Ygcm93cywgZS5nLiBbc3RhcnQsIGZpbmlzaCkuICovXG5pbnRlcmZhY2UgUm93UmFuZ2Uge1xuICBzdGFydDogbnVtYmVyO1xuICBmaW5pc2g6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIFRhc2tJbmRleFRvUm93UmV0dXJuIHtcbiAgdGFza0luZGV4VG9Sb3c6IFRhc2tJbmRleFRvUm93O1xuXG4gIC8qKiBNYXBzIGVhY2ggcmVzb3VyY2UgdmFsdWUgaW5kZXggdG8gYSByYW5nZSBvZiByb3dzLiAqL1xuICByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPiB8IG51bGw7XG5cbiAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb24gfCBudWxsO1xufVxuXG5jb25zdCB0YXNrSW5kZXhUb1Jvd0Zyb21Hcm91cEJ5ID0gKFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICByZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCxcbiAgY2hhcnRMaWtlOiBDaGFydExpa2UsXG4gIGRpc3BsYXlPcmRlcjogVmVydGV4SW5kaWNlc1xuKTogUmVzdWx0PFRhc2tJbmRleFRvUm93UmV0dXJuPiA9PiB7XG4gIC8vIGRpc3BsYXlPcmRlciBtYXBzIGZyb20gcm93IHRvIHRhc2sgaW5kZXgsIHRoaXMgd2lsbCBwcm9kdWNlIHRoZSBpbnZlcnNlIG1hcHBpbmcuXG4gIGNvbnN0IHRhc2tJbmRleFRvUm93ID0gbmV3IE1hcChcbiAgICAvLyBUaGlzIGxvb2tzIGJhY2t3YXJkcywgYnV0IGl0IGlzbid0LiBSZW1lbWJlciB0aGF0IHRoZSBtYXAgY2FsbGJhY2sgdGFrZXNcbiAgICAvLyAodmFsdWUsIGluZGV4KSBhcyBpdHMgYXJndW1lbnRzLlxuICAgIGRpc3BsYXlPcmRlci5tYXAoKHRhc2tJbmRleDogbnVtYmVyLCByb3c6IG51bWJlcikgPT4gW3Rhc2tJbmRleCwgcm93XSlcbiAgKTtcblxuICBpZiAocmVzb3VyY2VEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gb2soe1xuICAgICAgdGFza0luZGV4VG9Sb3c6IHRhc2tJbmRleFRvUm93LFxuICAgICAgcm93UmFuZ2VzOiBudWxsLFxuICAgICAgcmVzb3VyY2VEZWZpbml0aW9uOiBudWxsLFxuICAgIH0pO1xuICB9XG5cbiAgY29uc3Qgc3RhcnRUYXNrSW5kZXggPSAwO1xuICBjb25zdCBmaW5pc2hUYXNrSW5kZXggPSBjaGFydExpa2UuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgY29uc3QgaWdub3JhYmxlID0gW3N0YXJ0VGFza0luZGV4LCBmaW5pc2hUYXNrSW5kZXhdO1xuXG4gIC8vIEdyb3VwIGFsbCB0YXNrcyBieSB0aGVpciByZXNvdXJjZSB2YWx1ZSwgd2hpbGUgcHJlc2VydmluZyBkaXNwbGF5T3JkZXJcbiAgLy8gb3JkZXIgd2l0aCB0aGUgZ3JvdXBzLlxuICBjb25zdCBncm91cHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyW10+KCk7XG4gIGRpc3BsYXlPcmRlci5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHJlc291cmNlVmFsdWUgPVxuICAgICAgY2hhcnRMaWtlLlZlcnRpY2VzW3Rhc2tJbmRleF0uZ2V0UmVzb3VyY2Uob3B0cy5ncm91cEJ5UmVzb3VyY2UpIHx8IFwiXCI7XG4gICAgY29uc3QgZ3JvdXBNZW1iZXJzID0gZ3JvdXBzLmdldChyZXNvdXJjZVZhbHVlKSB8fCBbXTtcbiAgICBncm91cE1lbWJlcnMucHVzaCh0YXNrSW5kZXgpO1xuICAgIGdyb3Vwcy5zZXQocmVzb3VyY2VWYWx1ZSwgZ3JvdXBNZW1iZXJzKTtcbiAgfSk7XG5cbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcblxuICAvLyBVZ2gsIFN0YXJ0IGFuZCBGaW5pc2ggVGFza3MgbmVlZCB0byBiZSBtYXBwZWQsIGJ1dCBzaG91bGQgbm90IGJlIGRvbmUgdmlhXG4gIC8vIHJlc291cmNlIHZhbHVlLCBzbyBTdGFydCBzaG91bGQgYWx3YXlzIGJlIGZpcnN0LlxuICByZXQuc2V0KDAsIDApO1xuXG4gIC8vIE5vdyBpbmNyZW1lbnQgdXAgdGhlIHJvd3MgYXMgd2UgbW92ZSB0aHJvdWdoIGFsbCB0aGUgZ3JvdXBzLlxuICBsZXQgcm93ID0gMTtcbiAgLy8gQW5kIHRyYWNrIGhvdyBtYW55IHJvd3MgYXJlIGluIGVhY2ggZ3JvdXAuXG4gIGNvbnN0IHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+ID0gbmV3IE1hcCgpO1xuICByZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmZvckVhY2goXG4gICAgKHJlc291cmNlVmFsdWU6IHN0cmluZywgcmVzb3VyY2VJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBzdGFydE9mUm93ID0gcm93O1xuICAgICAgKGdyb3Vwcy5nZXQocmVzb3VyY2VWYWx1ZSkgfHwgW10pLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmFibGUuaW5jbHVkZXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXQuc2V0KHRhc2tJbmRleCwgcm93KTtcbiAgICAgICAgcm93Kys7XG4gICAgICB9KTtcbiAgICAgIHJvd1Jhbmdlcy5zZXQocmVzb3VyY2VJbmRleCwgeyBzdGFydDogc3RhcnRPZlJvdywgZmluaXNoOiByb3cgfSk7XG4gICAgfVxuICApO1xuICByZXQuc2V0KGZpbmlzaFRhc2tJbmRleCwgcm93KTtcblxuICByZXR1cm4gb2soe1xuICAgIHRhc2tJbmRleFRvUm93OiByZXQsXG4gICAgcm93UmFuZ2VzOiByb3dSYW5nZXMsXG4gICAgcmVzb3VyY2VEZWZpbml0aW9uOiByZXNvdXJjZURlZmluaXRpb24sXG4gIH0pO1xufTtcblxuY29uc3QgZHJhd1N3aW1MYW5lSGlnaGxpZ2h0cyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4sXG4gIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXIsXG4gIGdyb3VwQ29sb3I6IHN0cmluZ1xuKSA9PiB7XG4gIGN0eC5maWxsU3R5bGUgPSBncm91cENvbG9yO1xuXG4gIGxldCBncm91cCA9IDA7XG4gIHJvd1Jhbmdlcy5mb3JFYWNoKChyb3dSYW5nZTogUm93UmFuZ2UpID0+IHtcbiAgICBjb25zdCB0b3BMZWZ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvd1JhbmdlLnN0YXJ0LFxuICAgICAgMCxcbiAgICAgIEZlYXR1cmUuZ3JvdXBFbnZlbG9wZVN0YXJ0XG4gICAgKTtcbiAgICBjb25zdCBib3R0b21SaWdodCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3dSYW5nZS5maW5pc2gsXG4gICAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICk7XG4gICAgZ3JvdXArKztcbiAgICAvLyBPbmx5IGhpZ2hsaWdodCBldmVyeSBvdGhlciBncm91cCBiYWNrZ3JvdWQgd2l0aCB0aGUgZ3JvdXBDb2xvci5cbiAgICBpZiAoZ3JvdXAgJSAyID09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY3R4LmZpbGxSZWN0KFxuICAgICAgdG9wTGVmdC54LFxuICAgICAgdG9wTGVmdC55LFxuICAgICAgYm90dG9tUmlnaHQueCAtIHRvcExlZnQueCxcbiAgICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgICApO1xuICB9KTtcbn07XG5cbmNvbnN0IGRyYXdTd2ltTGFuZUxhYmVscyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uLFxuICBzY2FsZTogU2NhbGUsXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+XG4pID0+IHtcbiAgaWYgKHJvd1JhbmdlcykgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGNvbnN0IGdyb3VwQnlPcmlnaW4gPSBzY2FsZS5mZWF0dXJlKDAsIDAsIEZlYXR1cmUuZ3JvdXBCeU9yaWdpbik7XG5cbiAgaWYgKG9wdHMuaGFzVGltZWxpbmUpIHtcbiAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJib3R0b21cIjtcbiAgICBjdHguZmlsbFRleHQob3B0cy5ncm91cEJ5UmVzb3VyY2UsIGdyb3VwQnlPcmlnaW4ueCwgZ3JvdXBCeU9yaWdpbi55KTtcbiAgfVxuXG4gIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gICAgcm93UmFuZ2VzLmZvckVhY2goKHJvd1JhbmdlOiBSb3dSYW5nZSwgcmVzb3VyY2VJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAocm93UmFuZ2Uuc3RhcnQgPT09IHJvd1JhbmdlLmZpbmlzaCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgICByb3dSYW5nZS5zdGFydCxcbiAgICAgICAgMCxcbiAgICAgICAgRmVhdHVyZS5ncm91cFRleHRTdGFydFxuICAgICAgKTtcbiAgICAgIGN0eC5maWxsVGV4dChcbiAgICAgICAgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1tyZXNvdXJjZUluZGV4XSxcbiAgICAgICAgdGV4dFN0YXJ0LngsXG4gICAgICAgIHRleHRTdGFydC55XG4gICAgICApO1xuICAgIH0pO1xuICB9XG59O1xuIiwgIi8vIFdoZW4gYWRkaW5nIHByb3BlcnRpZXMgdG8gQ29sb3JUaGVtZSBhbHNvIG1ha2Ugc3VyZSB0byBhZGQgYSBjb3JyZXNwb25kaW5nXG4vLyBDU1MgQHByb3BlcnR5IGRlY2xhcmF0aW9uLlxuLy9cbi8vIE5vdGUgdGhhdCBlYWNoIHByb3BlcnR5IGFzc3VtZXMgdGhlIHByZXNlbmNlIG9mIGEgQ1NTIHZhcmlhYmxlIG9mIHRoZSBzYW1lIG5hbWVcbi8vIHdpdGggYSBwcmVjZWVkaW5nIGAtLWAuXG5leHBvcnQgaW50ZXJmYWNlIFRoZW1lIHtcbiAgc3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlTXV0ZWQ6IHN0cmluZztcbiAgb25TdXJmYWNlU2Vjb25kYXJ5OiBzdHJpbmc7XG4gIG92ZXJsYXk6IHN0cmluZztcbiAgZ3JvdXBDb2xvcjogc3RyaW5nO1xuICBoaWdobGlnaHQ6IHN0cmluZztcbiAgYWRkZWQ6IHN0cmluZztcbiAgcmVtb3ZlZDogc3RyaW5nO1xufVxuXG50eXBlIFRoZW1lUHJvcCA9IGtleW9mIFRoZW1lO1xuXG5jb25zdCBjb2xvclRoZW1lUHJvdG90eXBlOiBUaGVtZSA9IHtcbiAgc3VyZmFjZTogXCJcIixcbiAgb25TdXJmYWNlOiBcIlwiLFxuICBvblN1cmZhY2VNdXRlZDogXCJcIixcbiAgb25TdXJmYWNlU2Vjb25kYXJ5OiBcIlwiLFxuICBvdmVybGF5OiBcIlwiLFxuICBncm91cENvbG9yOiBcIlwiLFxuICBoaWdobGlnaHQ6IFwiXCIsXG4gIGFkZGVkOiBcIlwiLFxuICByZW1vdmVkOiBcIlwiLFxufTtcblxuZXhwb3J0IGNvbnN0IGNvbG9yVGhlbWVGcm9tRWxlbWVudCA9IChlbGU6IEhUTUxFbGVtZW50KTogVGhlbWUgPT4ge1xuICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlKTtcbiAgY29uc3QgcmV0ID0gT2JqZWN0LmFzc2lnbih7fSwgY29sb3JUaGVtZVByb3RvdHlwZSk7XG4gIE9iamVjdC5rZXlzKHJldCkuZm9yRWFjaCgobmFtZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0W25hbWUgYXMgVGhlbWVQcm9wXSA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoYC0tJHtuYW1lfWApO1xuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHsgTWV0cmljRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3NcIjtcbmltcG9ydCB7IE1ldHJpY1JhbmdlIH0gZnJvbSBcIi4uL21ldHJpY3MvcmFuZ2VcIjtcbmltcG9ydCB7XG4gIER1cFRhc2tPcCxcbiAgSW5zZXJ0TmV3RW1wdHlNaWxlc3RvbmVBZnRlck9wLFxuICBTZXRUYXNrTmFtZU9wLFxuICBTcGxpdFRhc2tPcCxcbn0gZnJvbSBcIi4uL29wcy9jaGFydFwiO1xuaW1wb3J0IHsgQWRkTWV0cmljT3AsIFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IE9wLCBhcHBseUFsbE9wc1RvUGxhbiB9IGZyb20gXCIuLi9vcHMvb3BzXCI7XG5pbXBvcnQge1xuICBBZGRSZXNvdXJjZU9wLFxuICBBZGRSZXNvdXJjZU9wdGlvbk9wLFxuICBEZWxldGVSZXNvdXJjZU9wdGlvbk9wLFxuICBSZW5hbWVSZXNvdXJjZU9wdGlvbk9wLFxuICBTZXRSZXNvdXJjZVZhbHVlT3AsXG59IGZyb20gXCIuLi9vcHMvcmVzb3VyY2VzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhblwiO1xuXG5jb25zdCBwZW9wbGU6IHN0cmluZ1tdID0gW1wiRnJlZFwiLCBcIkJhcm5leVwiLCBcIldpbG1hXCIsIFwiQmV0dHlcIl07XG5cbmNvbnN0IERVUkFUSU9OID0gMTAwO1xuXG5jb25zdCBybmRJbnQgPSAobjogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG4pO1xufTtcblxuY29uc3Qgcm5kRHVyYXRpb24gPSAoKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIHJuZEludChEVVJBVElPTik7XG59O1xuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVTdGFydGVyUGxhbiA9ICgpOiBQbGFuID0+IHtcbiAgY29uc3QgcGxhbiA9IG5ldyBQbGFuKCk7XG4gIGNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKFxuICAgIFtcbiAgICAgIEluc2VydE5ld0VtcHR5TWlsZXN0b25lQWZ0ZXJPcCgwKSxcbiAgICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCAxMCwgMSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcImxvd1wiLCAxKSxcbiAgICBdLFxuICAgIHBsYW5cbiAgKTtcblxuICBpZiAoIXJlcy5vaykge1xuICAgIGNvbnNvbGUubG9nKHJlcy5lcnJvcik7XG4gIH1cbiAgcmV0dXJuIHBsYW47XG59O1xuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVSYW5kb21QbGFuID0gKCk6IFBsYW4gPT4ge1xuICBjb25zdCBwbGFuID0gbmV3IFBsYW4oKTtcblxuICBjb25zdCBvcHM6IE9wW10gPSBbQWRkUmVzb3VyY2VPcChcIlBlcnNvblwiKV07XG5cbiAgcGVvcGxlLmZvckVhY2goKHBlcnNvbjogc3RyaW5nKSA9PiB7XG4gICAgb3BzLnB1c2goQWRkUmVzb3VyY2VPcHRpb25PcChcIlBlcnNvblwiLCBwZXJzb24pKTtcbiAgfSk7XG4gIG9wcy5wdXNoKERlbGV0ZVJlc291cmNlT3B0aW9uT3AoXCJQZXJzb25cIiwgXCJcIikpO1xuXG4gIG9wcy5wdXNoKFxuICAgIEFkZE1ldHJpY09wKFwiQ29zdCAoJC9ocilcIiwgbmV3IE1ldHJpY0RlZmluaXRpb24oMTUsIG5ldyBNZXRyaWNSYW5nZSgwKSkpLFxuICAgIEluc2VydE5ld0VtcHR5TWlsZXN0b25lQWZ0ZXJPcCgwKSxcbiAgICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgMSksXG4gICAgU2V0VGFza05hbWVPcCgxLCByYW5kb21UYXNrTmFtZSgpKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIDEpLFxuICAgIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibW9kZXJhdGVcIiwgMSlcbiAgKTtcblxuICBsZXQgbnVtVGFza3MgPSAxO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDE1OyBpKyspIHtcbiAgICBsZXQgaW5kZXggPSBybmRJbnQobnVtVGFza3MpICsgMTtcbiAgICBvcHMucHVzaChcbiAgICAgIFNwbGl0VGFza09wKGluZGV4KSxcbiAgICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCBybmREdXJhdGlvbigpLCBpbmRleCArIDEpLFxuICAgICAgU2V0VGFza05hbWVPcChpbmRleCArIDEsIHJhbmRvbVRhc2tOYW1lKCkpLFxuICAgICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIHBlb3BsZVtybmRJbnQocGVvcGxlLmxlbmd0aCldLCBpbmRleCArIDEpLFxuICAgICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCBpbmRleCArIDEpXG4gICAgKTtcbiAgICBudW1UYXNrcysrO1xuICAgIGluZGV4ID0gcm5kSW50KG51bVRhc2tzKSArIDE7XG4gICAgb3BzLnB1c2goXG4gICAgICBEdXBUYXNrT3AoaW5kZXgpLFxuICAgICAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIHJuZER1cmF0aW9uKCksIGluZGV4ICsgMSksXG4gICAgICBTZXRUYXNrTmFtZU9wKGluZGV4ICsgMSwgcmFuZG9tVGFza05hbWUoKSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIGluZGV4ICsgMSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcIm1vZGVyYXRlXCIsIGluZGV4ICsgMSlcbiAgICApO1xuICAgIG51bVRhc2tzKys7XG4gIH1cblxuICBjb25zdCByZXMgPSBhcHBseUFsbE9wc1RvUGxhbihvcHMsIHBsYW4pO1xuXG4gIGlmICghcmVzLm9rKSB7XG4gICAgY29uc29sZS5sb2cocmVzLmVycm9yKTtcbiAgfVxuICByZXR1cm4gcGxhbjtcbn07XG5cbmNvbnN0IHBhcnRzID0gW1xuICBcImxvcmVtXCIsXG4gIFwiaXBzdW1cIixcbiAgXCJkb2xvclwiLFxuICBcInNpdFwiLFxuICBcImFtZXRcIixcbiAgXCJjb25zZWN0ZXR1clwiLFxuICBcImFkaXBpc2NpbmdcIixcbiAgXCJlbGl0XCIsXG4gIFwic2VkXCIsXG4gIFwiZG9cIixcbiAgXCJlaXVzbW9kXCIsXG4gIFwidGVtcG9yXCIsXG4gIFwiaW5jaWRpZHVudFwiLFxuICBcInV0XCIsXG4gIFwibGFib3JlXCIsXG4gIFwiZXRcIixcbiAgXCJkb2xvcmVcIixcbiAgXCJtYWduYVwiLFxuICBcImFsaXF1YVwiLFxuICBcInV0XCIsXG4gIFwiZW5pbVwiLFxuICBcImFkXCIsXG4gIFwibWluaW1cIixcbiAgXCJ2ZW5pYW1cIixcbiAgXCJxdWlzXCIsXG4gIFwibm9zdHJ1ZFwiLFxuICBcImV4ZXJjaXRhdGlvblwiLFxuICBcInVsbGFtY29cIixcbiAgXCJsYWJvcmlzXCIsXG4gIFwibmlzaVwiLFxuICBcInV0XCIsXG4gIFwiYWxpcXVpcFwiLFxuICBcImV4XCIsXG4gIFwiZWFcIixcbiAgXCJjb21tb2RvXCIsXG4gIFwiY29uc2VxdWF0XCIsXG4gIFwiZXVpc1wiLFxuICBcImF1dGVcIixcbiAgXCJpcnVyZVwiLFxuICBcImRvbG9yXCIsXG4gIFwiaW5cIixcbiAgXCJyZXByZWhlbmRlcml0XCIsXG4gIFwiaW5cIixcbiAgXCJ2b2x1cHRhdGVcIixcbiAgXCJ2ZWxpdFwiLFxuICBcImVzc2VcIixcbiAgXCJjaWxsdW1cIixcbiAgXCJkb2xvcmVcIixcbiAgXCJldVwiLFxuICBcImZ1Z2lhdFwiLFxuICBcIm51bGxhXCIsXG4gIFwicGFyaWF0dXJcIixcbiAgXCJleGNlcHRldXJcIixcbiAgXCJzaW50XCIsXG4gIFwib2NjYWVjYXRcIixcbiAgXCJjdXBpZGF0YXRcIixcbiAgXCJub25cIixcbiAgXCJwcm9pZGVudFwiLFxuICBcInN1bnRcIixcbiAgXCJpblwiLFxuICBcImN1bHBhXCIsXG4gIFwicXVpXCIsXG4gIFwib2ZmaWNpYVwiLFxuICBcImRlc2VydW50XCIsXG4gIFwibW9sbGl0XCIsXG4gIFwiYW5pbVwiLFxuICBcImlkXCIsXG4gIFwiZXN0XCIsXG4gIFwibGFib3J1bVwiLFxuXTtcblxuY29uc3QgcGFydHNMZW5ndGggPSBwYXJ0cy5sZW5ndGg7XG5cbmNvbnN0IHJhbmRvbVRhc2tOYW1lID0gKCk6IHN0cmluZyA9PlxuICBgJHtwYXJ0c1tybmRJbnQocGFydHNMZW5ndGgpXX0gJHtwYXJ0c1tybmRJbnQocGFydHNMZW5ndGgpXX1gO1xuIiwgImltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IEZpbHRlckZ1bmMgfSBmcm9tIFwiLi4vY2hhcnQvZmlsdGVyL2ZpbHRlci50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgU2V0TWV0cmljVmFsdWVPcCB9IGZyb20gXCIuLi9vcHMvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgU2V0UmVzb3VyY2VWYWx1ZU9wIH0gZnJvbSBcIi4uL29wcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IEZyb21KU09OLCBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUHJlY2lzaW9uIH0gZnJvbSBcIi4uL3ByZWNpc2lvbi9wcmVjaXNpb24udHNcIjtcbmltcG9ydCB7XG4gIERJVklERVJfTU9WRV9FVkVOVCxcbiAgRGl2aWRlck1vdmUsXG4gIERpdmlkZXJNb3ZlUmVzdWx0LFxufSBmcm9tIFwiLi4vcmVuZGVyZXIvZGl2aWRlcm1vdmUvZGl2aWRlcm1vdmUudHNcIjtcbmltcG9ydCB7XG4gIERSQUdfUkFOR0VfRVZFTlQsXG4gIERyYWdSYW5nZSxcbiAgTW91c2VEcmFnLFxufSBmcm9tIFwiLi4vcmVuZGVyZXIvbW91c2VkcmFnL21vdXNlZHJhZy50c1wiO1xuaW1wb3J0IHsgTW91c2VNb3ZlIH0gZnJvbSBcIi4uL3JlbmRlcmVyL21vdXNlbW92ZS9tb3VzZW1vdmUudHNcIjtcbmltcG9ydCB7IERpc3BsYXlSYW5nZSB9IGZyb20gXCIuLi9yZW5kZXJlci9yYW5nZS9yYW5nZS50c1wiO1xuaW1wb3J0IHtcbiAgUmVuZGVyT3B0aW9ucyxcbiAgUmVuZGVyUmVzdWx0LFxuICBUYXNrTGFiZWwsXG4gIFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyxcbiAgcmVuZGVyVGFza3NUb0NhbnZhcyxcbiAgc3VnZ2VzdGVkQ2FudmFzSGVpZ2h0LFxufSBmcm9tIFwiLi4vcmVuZGVyZXIvcmVuZGVyZXIudHNcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4uL3JlbmRlcmVyL3NjYWxlL3BvaW50LnRzXCI7XG5pbXBvcnQgeyBTY2FsZSB9IGZyb20gXCIuLi9yZW5kZXJlci9zY2FsZS9zY2FsZS50c1wiO1xuaW1wb3J0IHsgUmVzdWx0IH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgQ29tcHV0ZVNsYWNrLCBDcml0aWNhbFBhdGgsIFNsYWNrLCBTcGFuIH0gZnJvbSBcIi4uL3NsYWNrL3NsYWNrLnRzXCI7XG5pbXBvcnQgeyBUaGVtZSwgY29sb3JUaGVtZUZyb21FbGVtZW50IH0gZnJvbSBcIi4uL3N0eWxlL3RoZW1lL3RoZW1lLnRzXCI7XG5pbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQge1xuICBDcml0aWNhbFBhdGhFbnRyeSxcbiAgQ3JpdGljYWxQYXRoVGFza0VudHJ5LFxuICBjcml0aWNhbFRhc2tGcmVxdWVuY2llcyxcbiAgc2ltdWxhdGlvbixcbn0gZnJvbSBcIi4uL3NpbXVsYXRpb24vc2ltdWxhdGlvbi50c1wiO1xuaW1wb3J0IHtcbiAgZ2VuZXJhdGVSYW5kb21QbGFuLFxuICBnZW5lcmF0ZVN0YXJ0ZXJQbGFuLFxufSBmcm9tIFwiLi4vZ2VuZXJhdGUvZ2VuZXJhdGUudHNcIjtcbmltcG9ydCB7IGV4ZWN1dGUsIGV4ZWN1dGVPcCB9IGZyb20gXCIuLi9hY3Rpb24vZXhlY3V0ZS50c1wiO1xuaW1wb3J0IHsgU3RhcnRLZXlib2FyZEhhbmRsaW5nIH0gZnJvbSBcIi4uL2tleW1hcC9rZXltYXAudHNcIjtcbmltcG9ydCB7IERlbGV0ZVRhc2tPcCwgUmVtb3ZlRWRnZU9wLCBTZXRUYXNrTmFtZU9wIH0gZnJvbSBcIi4uL29wcy9jaGFydC50c1wiO1xuaW1wb3J0IHsgRGVwZW5kZW5jaWVzUGFuZWwgfSBmcm9tIFwiLi4vZGVwZW5kZW5jaWVzL2RlcGVuZGVuY2llcy1wYW5lbC50c1wiO1xuaW1wb3J0IHsgQWN0aW9uTmFtZXMgfSBmcm9tIFwiLi4vYWN0aW9uL3JlZ2lzdHJ5LnRzXCI7XG5pbXBvcnQge1xuICBTZWxlY3RlZFRhc2tQYW5lbCxcbiAgVGFza01ldHJpY1ZhbHVlQ2hhbmdlRGV0YWlscyxcbiAgVGFza05hbWVDaGFuZ2VEZXRhaWxzLFxuICBUYXNrUmVzb3VyY2VWYWx1ZUNoYW5nZURldGFpbHMsXG59IGZyb20gXCIuLi9zZWxlY3RlZC10YXNrLXBhbmVsL3NlbGVjdGVkLXRhc2stcGFuZWwudHNcIjtcbmltcG9ydCB7IHJlcG9ydE9uRXJyb3IgfSBmcm9tIFwiLi4vcmVwb3J0LWVycm9yL3JlcG9ydC1lcnJvci50c1wiO1xuaW1wb3J0IHsgVGFza0R1cmF0aW9uIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyBTaW11bGF0aW9uUGFuZWwgfSBmcm9tIFwiLi4vc2ltdWxhdGlvbi1wYW5lbC9zaW11bGF0aW9uLXBhbmVsLnRzXCI7XG5pbXBvcnQgeyBhcHBseVN0b3JlZFRoZW1lIH0gZnJvbSBcIi4uL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlci50c1wiO1xuaW1wb3J0IHsgRWRpdFJlc291cmNlc0RpYWxvZyB9IGZyb20gXCIuLi9lZGl0LXJlc291cmNlcy1kaWFsb2cvZWRpdC1yZXNvdXJjZXMtZGlhbG9nLnRzXCI7XG5pbXBvcnQgeyBFZGl0TWV0cmljc0RpYWxvZyB9IGZyb20gXCIuLi9lZGl0LW1ldHJpY3MtZGlhbG9nL2VkaXQtbWV0cmljcy1kaWFsb2cudHNcIjtcblxuY29uc3QgRk9OVF9TSVpFX1BYID0gMzI7XG5cbmNvbnN0IE5VTV9TSU1VTEFUSU9OX0xPT1BTID0gMTAwO1xuXG5jb25zdCBwcmVjaXNpb24gPSBuZXcgUHJlY2lzaW9uKDIpO1xuXG5leHBvcnQgY2xhc3MgRXhwbGFuTWFpbiBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgLyoqIFRoZSBQbGFuIGJlaW5nIGVkaXRlZC4gKi9cbiAgcGxhbjogUGxhbiA9IG5ldyBQbGFuKCk7XG5cbiAgLyoqIFRoZSBzdGFydCBhbmQgZmluaXNoIHRpbWUgZm9yIGVhY2ggVGFzayBpbiB0aGUgUGxhbi4gKi9cbiAgc3BhbnM6IFNwYW5bXSA9IFtdO1xuXG4gIC8qKiBUaGUgdGFzayBpbmRpY2VzIG9mIHRhc2tzIG9uIHRoZSBjcml0aWNhbCBwYXRoLiAqL1xuICBjcml0aWNhbFBhdGg6IG51bWJlcltdID0gW107XG5cbiAgLyoqIFRoZSBzZWxlY3Rpb24gKGluIHRpbWUpIG9mIHRoZSBQbGFuIGN1cnJlbnRseSBiZWluZyB2aWV3ZWQuICovXG4gIGRpc3BsYXlSYW5nZTogRGlzcGxheVJhbmdlIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFNjYWxlIGZvciB0aGUgcmFkYXIgdmlldywgdXNlZCBmb3IgZHJhZyBzZWxlY3RpbmcgYSBkaXNwbGF5UmFuZ2UuICovXG4gIHJhZGFyU2NhbGU6IFNjYWxlIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEFsbCBvZiB0aGUgdHlwZXMgb2YgcmVzb3VyY2VzIGluIHRoZSBwbGFuLiAqL1xuICBncm91cEJ5T3B0aW9uczogc3RyaW5nW10gPSBbXTtcblxuICAvKiogV2hpY2ggb2YgdGhlIHJlc291cmNlcyBhcmUgd2UgY3VycmVudGx5IGdyb3VwaW5nIGJ5LCB3aGVyZSAwIG1lYW5zIG5vXG4gICAqIGdyb3VwaW5nIGlzIGRvbmUuICovXG4gIGdyb3VwQnlPcHRpb25zSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgLyoqIFRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdGFzaywgYXMgYW4gaW5kZXguICovXG4gIHNlbGVjdGVkVGFzazogbnVtYmVyID0gLTE7XG5cbiAgLy8gVUkgZmVhdHVyZXMgdGhhdCBjYW4gYmUgdG9nZ2xlZCBvbiBhbmQgb2ZmLlxuICB0b3BUaW1lbGluZTogYm9vbGVhbiA9IGZhbHNlO1xuICBjcml0aWNhbFBhdGhzT25seTogYm9vbGVhbiA9IGZhbHNlO1xuICBmb2N1c09uVGFzazogYm9vbGVhbiA9IGZhbHNlO1xuICBtb3VzZU1vdmU6IE1vdXNlTW92ZSB8IG51bGwgPSBudWxsO1xuXG4gIGRlcGVuZGVuY2llc1BhbmVsOiBEZXBlbmRlbmNpZXNQYW5lbCB8IG51bGwgPSBudWxsO1xuXG4gIGRvd25sb2FkTGluazogSFRNTEFuY2hvckVsZW1lbnQgfCBudWxsID0gbnVsbDtcblxuICBzZWxlY3RlZFRhc2tQYW5lbDogU2VsZWN0ZWRUYXNrUGFuZWwgfCBudWxsID0gbnVsbDtcblxuICBhbHRlcm5hdGVUYXNrRHVyYXRpb25zOiBudW1iZXJbXSB8IG51bGwgPSBudWxsO1xuXG4gIHNpbXVsYXRpb25QYW5lbDogU2ltdWxhdGlvblBhbmVsIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIENhbGxiYWNrIHRvIGNhbGwgd2hlbiBhIG1vdXNlIG1vdmVzIG92ZXIgdGhlIGNoYXJ0LiAqL1xuICB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M6IFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyB8IG51bGwgPSBudWxsO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgIHRoaXMuc2ltdWxhdGlvblBhbmVsID1cbiAgICAgIHRoaXMucXVlcnlTZWxlY3RvcjxTaW11bGF0aW9uUGFuZWw+KFwic2ltdWxhdGlvbi1wYW5lbFwiKTtcbiAgICB0aGlzLnNpbXVsYXRpb25QYW5lbCEuYWRkRXZlbnRMaXN0ZW5lcihcInNpbXVsYXRpb24tc2VsZWN0XCIsIChlKSA9PiB7XG4gICAgICB0aGlzLmFsdGVybmF0ZVRhc2tEdXJhdGlvbnMgPSBlLmRldGFpbC5kdXJhdGlvbnM7XG4gICAgICB0aGlzLmNyaXRpY2FsUGF0aCA9IGUuZGV0YWlsLmNyaXRpY2FsUGF0aDtcbiAgICAgIHRoaXMucmVjYWxjdWxhdGVTcGFuc0FuZENyaXRpY2FsUGF0aCgpO1xuICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmRvd25sb2FkTGluayA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MQW5jaG9yRWxlbWVudD4oXCIjZG93bmxvYWRcIikhO1xuICAgIHRoaXMuZG93bmxvYWRMaW5rLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLnByZXBhcmVEb3dubG9hZCgpO1xuICAgIH0pO1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzUGFuZWwgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJkZXBlbmRlbmNpZXMtcGFuZWxcIikhO1xuXG4gICAgdGhpcy5kZXBlbmRlbmNpZXNQYW5lbCEuYWRkRXZlbnRMaXN0ZW5lcihcImFkZC1kZXBlbmRlbmN5XCIsIGFzeW5jIChlKSA9PiB7XG4gICAgICBsZXQgYWN0aW9uTmFtZTogQWN0aW9uTmFtZXMgPSBcIkFkZFByZWRlY2Vzc29yQWN0aW9uXCI7XG4gICAgICBpZiAoZS5kZXRhaWwuZGVwVHlwZSA9PT0gXCJzdWNjXCIpIHtcbiAgICAgICAgYWN0aW9uTmFtZSA9IFwiQWRkU3VjY2Vzc29yQWN0aW9uXCI7XG4gICAgICB9XG4gICAgICBjb25zdCByZXQgPSBhd2FpdCBleGVjdXRlKGFjdGlvbk5hbWUsIHRoaXMpO1xuICAgICAgaWYgKCFyZXQub2spIHtcbiAgICAgICAgY29uc29sZS5sb2cocmV0LmVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuZGVwZW5kZW5jaWVzUGFuZWwhLmFkZEV2ZW50TGlzdGVuZXIoXCJkZWxldGUtZGVwZW5kZW5jeVwiLCBhc3luYyAoZSkgPT4ge1xuICAgICAgbGV0IFtpLCBqXSA9IFtlLmRldGFpbC50YXNrSW5kZXgsIHRoaXMuc2VsZWN0ZWRUYXNrXTtcbiAgICAgIGlmIChlLmRldGFpbC5kZXBUeXBlID09PSBcInN1Y2NcIikge1xuICAgICAgICBbaSwgal0gPSBbaiwgaV07XG4gICAgICB9XG4gICAgICBjb25zdCBvcCA9IFJlbW92ZUVkZ2VPcChpLCBqKTtcbiAgICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGVPcChvcCwgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIiwgdHJ1ZSwgdGhpcyk7XG4gICAgICBpZiAoIXJldC5vaykge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5zZWxlY3RlZFRhc2tQYW5lbCA9IHRoaXMucXVlcnlTZWxlY3RvcihcInNlbGVjdGVkLXRhc2stcGFuZWxcIikhO1xuICAgIHRoaXMuc2VsZWN0ZWRUYXNrUGFuZWwuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwidGFzay1uYW1lLWNoYW5nZVwiLFxuICAgICAgYXN5bmMgKGU6IEN1c3RvbUV2ZW50PFRhc2tOYW1lQ2hhbmdlRGV0YWlscz4pID0+IHtcbiAgICAgICAgY29uc3Qgb3AgPSBTZXRUYXNrTmFtZU9wKGUuZGV0YWlsLnRhc2tJbmRleCwgZS5kZXRhaWwubmFtZSk7XG4gICAgICAgIHJlcG9ydE9uRXJyb3IoYXdhaXQgZXhlY3V0ZU9wKG9wLCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLCB0cnVlLCB0aGlzKSk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMuc2VsZWN0ZWRUYXNrUGFuZWwuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwidGFzay1yZXNvdXJjZS12YWx1ZS1jaGFuZ2VcIixcbiAgICAgIGFzeW5jIChlOiBDdXN0b21FdmVudDxUYXNrUmVzb3VyY2VWYWx1ZUNoYW5nZURldGFpbHM+KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbmFtZSwgdmFsdWUsIHRhc2tJbmRleCB9ID0gZS5kZXRhaWw7XG4gICAgICAgIGNvbnN0IG9wID0gU2V0UmVzb3VyY2VWYWx1ZU9wKG5hbWUsIHZhbHVlLCB0YXNrSW5kZXgpO1xuICAgICAgICByZXBvcnRPbkVycm9yKGF3YWl0IGV4ZWN1dGVPcChvcCwgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIiwgdHJ1ZSwgdGhpcykpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnNlbGVjdGVkVGFza1BhbmVsLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcInRhc2stbWV0cmljLXZhbHVlLWNoYW5nZVwiLFxuICAgICAgYXN5bmMgKGU6IEN1c3RvbUV2ZW50PFRhc2tNZXRyaWNWYWx1ZUNoYW5nZURldGFpbHM+KSA9PiB7XG4gICAgICAgIGNvbnN0IHsgbmFtZSwgdmFsdWUsIHRhc2tJbmRleCB9ID0gZS5kZXRhaWw7XG4gICAgICAgIGNvbnN0IG9wID0gU2V0TWV0cmljVmFsdWVPcChuYW1lLCB2YWx1ZSwgdGFza0luZGV4KTtcbiAgICAgICAgcmVwb3J0T25FcnJvcihhd2FpdCBleGVjdXRlT3Aob3AsIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCIsIHRydWUsIHRoaXMpKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gRHJhZ2dpbmcgb24gdGhlIHJhZGFyLlxuICAgIGNvbnN0IHJhZGFyID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcIiNyYWRhclwiKSE7XG4gICAgbmV3IE1vdXNlRHJhZyhyYWRhcik7XG4gICAgcmFkYXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIERSQUdfUkFOR0VfRVZFTlQsXG4gICAgICB0aGlzLmRyYWdSYW5nZUhhbmRsZXIuYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXG4gICAgKTtcblxuICAgIC8vIERpdmlkZXIgZHJhZ2dpbmcuXG4gICAgY29uc3QgZGl2aWRlciA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCJ2ZXJ0aWNhbC1kaXZpZGVyXCIpITtcbiAgICBuZXcgRGl2aWRlck1vdmUoZG9jdW1lbnQuYm9keSwgZGl2aWRlciwgXCJjb2x1bW5cIik7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoRElWSURFUl9NT1ZFX0VWRU5ULCAoKFxuICAgICAgZTogQ3VzdG9tRXZlbnQ8RGl2aWRlck1vdmVSZXN1bHQ+XG4gICAgKSA9PiB7XG4gICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KFxuICAgICAgICBcImdyaWQtdGVtcGxhdGUtY29sdW1uc1wiLFxuICAgICAgICBgY2FsYygke2UuZGV0YWlsLmJlZm9yZX0lIC0gMTVweCkgMTBweCBhdXRvYFxuICAgICAgKTtcbiAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIH0pIGFzIEV2ZW50TGlzdGVuZXIpO1xuXG4gICAgLy8gQnV0dG9uc1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNyZXNldC16b29tXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgZXhlY3V0ZShcIlJlc2V0Wm9vbUFjdGlvblwiLCB0aGlzKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNkYXJrLW1vZGUtdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgZXhlY3V0ZShcIlRvZ2dsZURhcmtNb2RlQWN0aW9uXCIsIHRoaXMpO1xuICAgIH0pO1xuICAgIGFwcGx5U3RvcmVkVGhlbWUoKTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNyYWRhci10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBleGVjdXRlKFwiVG9nZ2xlUmFkYXJBY3Rpb25cIiwgdGhpcyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjdG9wLXRpbWVsaW5lLXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy50b3BUaW1lbGluZSA9ICF0aGlzLnRvcFRpbWVsaW5lO1xuICAgICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2dyb3VwLWJ5LXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMudG9nZ2xlR3JvdXBCeSgpO1xuICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjY3JpdGljYWwtcGF0aHMtdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJjbGlja1wiLFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnRvZ2dsZUNyaXRpY2FsUGF0aHNPbmx5KCk7XG4gICAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICBjb25zdCBvdmVybGF5Q2FudmFzID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxDYW52YXNFbGVtZW50PihcIiNvdmVybGF5XCIpITtcbiAgICB0aGlzLm1vdXNlTW92ZSA9IG5ldyBNb3VzZU1vdmUob3ZlcmxheUNhbnZhcyk7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcykpO1xuXG4gICAgb3ZlcmxheUNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBwID0gbmV3IFBvaW50KGUub2Zmc2V0WCwgZS5vZmZzZXRZKTtcbiAgICAgIGlmICh0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnNldFNlbGVjdGlvbihcbiAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyhwLCBcIm1vdXNlZG93blwiKSB8fCAtMSxcbiAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgb3ZlcmxheUNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHAgPSBuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICAgICAgaWYgKHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2V0U2VsZWN0aW9uKFxuICAgICAgICAgIHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zKHAsIFwibW91c2Vkb3duXCIpIHx8IC0xLFxuICAgICAgICAgIHRydWUsXG4gICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUmVhY3QgdG8gdGhlIHVwbG9hZCBpbnB1dC5cbiAgICBjb25zdCBmaWxlVXBsb2FkID1cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTElucHV0RWxlbWVudD4oXCIjZmlsZS11cGxvYWRcIikhO1xuICAgIGZpbGVVcGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBqc29uID0gYXdhaXQgZmlsZVVwbG9hZC5maWxlcyFbMF0udGV4dCgpO1xuICAgICAgY29uc3QgcmV0ID0gRnJvbUpTT04oanNvbik7XG4gICAgICBpZiAoIXJldC5vaykge1xuICAgICAgICB0aHJvdyByZXQuZXJyb3I7XG4gICAgICB9XG4gICAgICB0aGlzLnBsYW4gPSByZXQudmFsdWU7XG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaW11bGF0ZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucmVjYWxjdWxhdGVTcGFuc0FuZENyaXRpY2FsUGF0aCgpO1xuICAgICAgdGhpcy5jcml0aWNhbFBhdGggPSB0aGlzLnNpbXVsYXRpb25QYW5lbCEuc2ltdWxhdGUoXG4gICAgICAgIHRoaXMucGxhbi5jaGFydCxcbiAgICAgICAgTlVNX1NJTVVMQVRJT05fTE9PUFMsXG4gICAgICAgIHRoaXMuY3JpdGljYWxQYXRoXG4gICAgICApO1xuICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZm9jdXMtb24tc2VsZWN0ZWQtdGFza1wiKSEuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGVGb2N1c09uVGFzaygpO1xuICAgICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2dlbi1yYW5kb20tcGxhblwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucGxhbiA9IGdlbmVyYXRlUmFuZG9tUGxhbigpO1xuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZWRpdC1yZXNvdXJjZXNcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8RWRpdFJlc291cmNlc0RpYWxvZz4oXG4gICAgICAgIFwiZWRpdC1yZXNvdXJjZXMtZGlhbG9nXCJcbiAgICAgICkhLnNob3dNb2RhbCh0aGlzKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNlZGl0LW1ldHJpY3NcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8RWRpdE1ldHJpY3NEaWFsb2c+KFwiZWRpdC1tZXRyaWNzLWRpYWxvZ1wiKSEuc2hvd01vZGFsKFxuICAgICAgICB0aGlzXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wbGFuID0gZ2VuZXJhdGVTdGFydGVyUGxhbigpO1xuICAgIHRoaXMudXBkYXRlVGFza1BhbmVscyh0aGlzLnNlbGVjdGVkVGFzayk7XG4gICAgdGhpcy5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoKSA9PiB0aGlzLnBhaW50Q2hhcnQoKSk7XG4gICAgU3RhcnRLZXlib2FyZEhhbmRsaW5nKHRoaXMpO1xuICB9XG5cbiAgcHJlcGFyZURvd25sb2FkKCkge1xuICAgIGNvbnN0IGRvd25sb2FkQmxvYiA9IG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeSh0aGlzLnBsYW4sIG51bGwsIFwiICBcIildLCB7XG4gICAgICB0eXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICB9KTtcbiAgICB0aGlzLmRvd25sb2FkTGluayEuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZG93bmxvYWRCbG9iKTtcbiAgfVxuXG4gIHVwZGF0ZVRhc2tQYW5lbHModGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnNlbGVjdGVkVGFzayA9IHRhc2tJbmRleDtcbiAgICB0aGlzLnNlbGVjdGVkVGFza1BhbmVsIS51cGRhdGVTZWxlY3RlZFRhc2tQYW5lbChcbiAgICAgIHRoaXMucGxhbixcbiAgICAgIHRoaXMuc2VsZWN0ZWRUYXNrXG4gICAgKTtcbiAgICBjb25zdCBlZGdlcyA9IGVkZ2VzQnlTcmNBbmREc3RUb01hcCh0aGlzLnBsYW4uY2hhcnQuRWRnZXMpO1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzUGFuZWwhLnNldFRhc2tzQW5kSW5kaWNlcyhcbiAgICAgIHRoaXMucGxhbi5jaGFydC5WZXJ0aWNlcyxcbiAgICAgIChlZGdlcy5ieURzdC5nZXQodGFza0luZGV4KSB8fCBbXSkubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUuaSksXG4gICAgICAoZWRnZXMuYnlTcmMuZ2V0KHRhc2tJbmRleCkgfHwgW10pLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLmopXG4gICAgKTtcbiAgICB0aGlzLmRlcGVuZGVuY2llc1BhbmVsIS5jbGFzc0xpc3QudG9nZ2xlKFxuICAgICAgXCJoaWRkZW5cIixcbiAgICAgIHRoaXMuc2VsZWN0ZWRUYXNrID09PSAtMVxuICAgICk7XG4gIH1cblxuICBzZXRTZWxlY3Rpb24oXG4gICAgaW5kZXg6IG51bWJlcixcbiAgICBmb2N1czogYm9vbGVhbixcbiAgICBzY3JvbGxUb1NlbGVjdGVkOiBib29sZWFuID0gZmFsc2VcbiAgKSB7XG4gICAgdGhpcy5zZWxlY3RlZFRhc2sgPSBpbmRleDtcbiAgICBpZiAoZm9jdXMpIHtcbiAgICAgIHRoaXMuZm9yY2VGb2N1c09uVGFzaygpO1xuICAgIH1cbiAgICB0aGlzLnBhaW50Q2hhcnQoc2Nyb2xsVG9TZWxlY3RlZCk7XG4gICAgdGhpcy51cGRhdGVUYXNrUGFuZWxzKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgfVxuXG4gIC8vIFRPRE8gLSBUdXJuIHRoaXMgb24gYW5kIG9mZiBiYXNlZCBvbiBtb3VzZSBlbnRlcmluZyB0aGUgY2FudmFzIGFyZWEuXG4gIG9uTW91c2VNb3ZlKCkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5tb3VzZU1vdmUhLnJlYWRMb2NhdGlvbigpO1xuICAgIGlmIChsb2NhdGlvbiAhPT0gbnVsbCAmJiB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MobG9jYXRpb24sIFwibW91c2Vtb3ZlXCIpO1xuICAgIH1cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBwbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCkge1xuICAgIHRoaXMucmFkYXJTY2FsZSA9IG51bGw7XG4gICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuYWx0ZXJuYXRlVGFza0R1cmF0aW9ucyA9IG51bGw7XG4gICAgdGhpcy5ncm91cEJ5T3B0aW9ucyA9IFtcIlwiLCAuLi5PYmplY3Qua2V5cyh0aGlzLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucyldO1xuICAgIGlmICh0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXggPj0gdGhpcy5ncm91cEJ5T3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleCA9IDA7XG4gICAgfVxuXG4gICAgdGhpcy5yZWNhbGN1bGF0ZVNwYW5zQW5kQ3JpdGljYWxQYXRoKCk7XG4gICAgdGhpcy5wYWludENoYXJ0KCk7XG4gIH1cblxuICBnZXRUYXNrRHVyYXRpb25GdW5jKCk6IFRhc2tEdXJhdGlvbiB7XG4gICAgaWYgKHRoaXMuYWx0ZXJuYXRlVGFza0R1cmF0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuICh0YXNrSW5kZXg6IG51bWJlcikgPT4gdGhpcy5hbHRlcm5hdGVUYXNrRHVyYXRpb25zIVt0YXNrSW5kZXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKHRhc2tJbmRleDogbnVtYmVyKSA9PlxuICAgICAgICB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5kdXJhdGlvbjtcbiAgICB9XG4gIH1cblxuICByZWNhbGN1bGF0ZVNwYW5zQW5kQ3JpdGljYWxQYXRoKCkge1xuICAgIGxldCBzbGFja3M6IFNsYWNrW10gPSBbXTtcblxuICAgIGNvbnN0IHNsYWNrUmVzdWx0ID0gQ29tcHV0ZVNsYWNrKFxuICAgICAgdGhpcy5wbGFuLmNoYXJ0LFxuICAgICAgdGhpcy5nZXRUYXNrRHVyYXRpb25GdW5jKCksXG4gICAgICBwcmVjaXNpb24ucm91bmRlcigpXG4gICAgKTtcbiAgICBpZiAoIXNsYWNrUmVzdWx0Lm9rKSB7XG4gICAgICBjb25zb2xlLmVycm9yKHNsYWNrUmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2xhY2tzID0gc2xhY2tSZXN1bHQudmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5zcGFucyA9IHNsYWNrcy5tYXAoKHZhbHVlOiBTbGFjayk6IFNwYW4gPT4ge1xuICAgICAgcmV0dXJuIHZhbHVlLmVhcmx5O1xuICAgIH0pO1xuICAgIHRoaXMuY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrcywgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG4gICAgdGhpcy51cGRhdGVUYXNrUGFuZWxzKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgfVxuXG4gIGdldFRhc2tMYWJlbGxlcigpOiBUYXNrTGFiZWwge1xuICAgIHJldHVybiAodGFza0luZGV4OiBudW1iZXIpOiBzdHJpbmcgPT5cbiAgICAgIGAke3RoaXMucGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLm5hbWV9YDtcbiAgfVxuXG4gIGRyYWdSYW5nZUhhbmRsZXIoZTogQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPikge1xuICAgIGlmICh0aGlzLnJhZGFyU2NhbGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYmVnaW4gPSB0aGlzLnJhZGFyU2NhbGUuZGF5Um93RnJvbVBvaW50KGUuZGV0YWlsLmJlZ2luKTtcbiAgICBjb25zdCBlbmQgPSB0aGlzLnJhZGFyU2NhbGUuZGF5Um93RnJvbVBvaW50KGUuZGV0YWlsLmVuZCk7XG4gICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBuZXcgRGlzcGxheVJhbmdlKGJlZ2luLmRheSwgZW5kLmRheSk7XG4gICAgdGhpcy5wYWludENoYXJ0KCk7XG4gIH1cblxuICB0b2dnbGVSYWRhcigpIHtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJyYWRhci1wYXJlbnRcIikhLmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gIH1cblxuICB0b2dnbGVHcm91cEJ5KCkge1xuICAgIHRoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleCA9XG4gICAgICAodGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4ICsgMSkgJSB0aGlzLmdyb3VwQnlPcHRpb25zLmxlbmd0aDtcbiAgfVxuXG4gIHRvZ2dsZUNyaXRpY2FsUGF0aHNPbmx5KCkge1xuICAgIHRoaXMuY3JpdGljYWxQYXRoc09ubHkgPSAhdGhpcy5jcml0aWNhbFBhdGhzT25seTtcbiAgfVxuXG4gIHRvZ2dsZUZvY3VzT25UYXNrKCkge1xuICAgIHRoaXMuZm9jdXNPblRhc2sgPSAhdGhpcy5mb2N1c09uVGFzaztcbiAgICBpZiAoIXRoaXMuZm9jdXNPblRhc2spIHtcbiAgICAgIHRoaXMuZGlzcGxheVJhbmdlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBmb3JjZUZvY3VzT25UYXNrKCkge1xuICAgIHRoaXMuZm9jdXNPblRhc2sgPSB0cnVlO1xuICB9XG5cbiAgcGFpbnRDaGFydChzY3JvbGxUb1NlbGVjdGVkOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zb2xlLnRpbWUoXCJwYWludENoYXJ0XCIpO1xuXG4gICAgY29uc3QgdGhlbWVDb2xvcnM6IFRoZW1lID0gY29sb3JUaGVtZUZyb21FbGVtZW50KGRvY3VtZW50LmJvZHkpO1xuXG4gICAgbGV0IGZpbHRlckZ1bmM6IEZpbHRlckZ1bmMgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBzdGFydEFuZEZpbmlzaCA9IFswLCB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMV07XG4gICAgaWYgKHRoaXMuY3JpdGljYWxQYXRoc09ubHkpIHtcbiAgICAgIGNvbnN0IGhpZ2hsaWdodFNldCA9IG5ldyBTZXQodGhpcy5jcml0aWNhbFBhdGgpO1xuICAgICAgZmlsdGVyRnVuYyA9ICh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgICAgICBpZiAoc3RhcnRBbmRGaW5pc2guaW5jbHVkZXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaWdobGlnaHRTZXQuaGFzKHRhc2tJbmRleCk7XG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5mb2N1c09uVGFzayAmJiB0aGlzLnNlbGVjdGVkVGFzayAhPSAtMSkge1xuICAgICAgLy8gRmluZCBhbGwgcHJlZGVjZXNzb3IgYW5kIHN1Y2Nlc3NvcnMgb2YgdGhlIGdpdmVuIHRhc2suXG4gICAgICBjb25zdCBuZWlnaGJvclNldCA9IG5ldyBTZXQoKTtcbiAgICAgIG5laWdoYm9yU2V0LmFkZCh0aGlzLnNlbGVjdGVkVGFzayk7XG4gICAgICBsZXQgZWFybGllc3RTdGFydCA9IHRoaXMuc3BhbnNbdGhpcy5zZWxlY3RlZFRhc2tdLnN0YXJ0O1xuICAgICAgbGV0IGxhdGVzdEZpbmlzaCA9IHRoaXMuc3BhbnNbdGhpcy5zZWxlY3RlZFRhc2tdLmZpbmlzaDtcbiAgICAgIHRoaXMucGxhbi5jaGFydC5FZGdlcy5mb3JFYWNoKChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgICAgaWYgKGVkZ2UuaSA9PT0gdGhpcy5zZWxlY3RlZFRhc2spIHtcbiAgICAgICAgICBuZWlnaGJvclNldC5hZGQoZWRnZS5qKTtcbiAgICAgICAgICBpZiAobGF0ZXN0RmluaXNoIDwgdGhpcy5zcGFuc1tlZGdlLmpdLmZpbmlzaCkge1xuICAgICAgICAgICAgbGF0ZXN0RmluaXNoID0gdGhpcy5zcGFuc1tlZGdlLmpdLmZpbmlzaDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVkZ2UuaiA9PT0gdGhpcy5zZWxlY3RlZFRhc2spIHtcbiAgICAgICAgICBuZWlnaGJvclNldC5hZGQoZWRnZS5pKTtcbiAgICAgICAgICBpZiAoZWFybGllc3RTdGFydCA+IHRoaXMuc3BhbnNbZWRnZS5pXS5zdGFydCkge1xuICAgICAgICAgICAgZWFybGllc3RTdGFydCA9IHRoaXMuc3BhbnNbZWRnZS5pXS5zdGFydDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gVE9ETyAtIFNpbmNlIHdlIG92ZXJ3cml0ZSBkaXNwbGF5UmFuZ2UgdGhhdCBtZWFucyBkcmFnZ2luZyBvbiB0aGUgcmFkYXJcbiAgICAgIC8vIHdpbGwgbm90IHdvcmsgd2hlbiBmb2N1c2luZyBvbiBhIHNlbGVjdGVkIHRhc2suIEJ1ZyBvciBmZWF0dXJlP1xuICAgICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBuZXcgRGlzcGxheVJhbmdlKGVhcmxpZXN0U3RhcnQgLSAxLCBsYXRlc3RGaW5pc2ggKyAxKTtcblxuICAgICAgZmlsdGVyRnVuYyA9IChfdGFzazogVGFzaywgdGFza0luZGV4OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICAgICAgaWYgKHN0YXJ0QW5kRmluaXNoLmluY2x1ZGVzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZWlnaGJvclNldC5oYXModGFza0luZGV4KTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgcmFkYXJPcHRzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgICAgZm9udFNpemVQeDogNixcbiAgICAgIGhhc1RleHQ6IGZhbHNlLFxuICAgICAgZGlzcGxheVJhbmdlOiB0aGlzLmRpc3BsYXlSYW5nZSxcbiAgICAgIGRpc3BsYXlSYW5nZVVzYWdlOiBcImhpZ2hsaWdodFwiLFxuICAgICAgY29sb3JzOiB7XG4gICAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZTogdGhlbWVDb2xvcnMub25TdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2VNdXRlZDogdGhlbWVDb2xvcnMub25TdXJmYWNlTXV0ZWQsXG4gICAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgICBvdmVybGF5OiB0aGVtZUNvbG9ycy5vdmVybGF5LFxuICAgICAgICBncm91cENvbG9yOiB0aGVtZUNvbG9ycy5ncm91cENvbG9yLFxuICAgICAgICBoaWdobGlnaHQ6IHRoZW1lQ29sb3JzLmhpZ2hsaWdodCxcbiAgICAgIH0sXG4gICAgICBoYXNUaW1lbGluZTogZmFsc2UsXG4gICAgICBoYXNUYXNrczogdHJ1ZSxcbiAgICAgIGhhc0VkZ2VzOiBmYWxzZSxcbiAgICAgIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IGZhbHNlLFxuICAgICAgdGFza0xhYmVsOiB0aGlzLmdldFRhc2tMYWJlbGxlcigpLFxuICAgICAgdGFza0R1cmF0aW9uOiB0aGlzLmdldFRhc2tEdXJhdGlvbkZ1bmMoKSxcbiAgICAgIHRhc2tFbXBoYXNpemU6IHRoaXMuY3JpdGljYWxQYXRoLFxuICAgICAgZmlsdGVyRnVuYzogbnVsbCxcbiAgICAgIGdyb3VwQnlSZXNvdXJjZTogdGhpcy5ncm91cEJ5T3B0aW9uc1t0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXhdLFxuICAgICAgaGlnaGxpZ2h0ZWRUYXNrOiBudWxsLFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXg6IHRoaXMuc2VsZWN0ZWRUYXNrLFxuICAgIH07XG5cbiAgICBjb25zdCB6b29tT3B0czogUmVuZGVyT3B0aW9ucyA9IHtcbiAgICAgIGZvbnRTaXplUHg6IEZPTlRfU0laRV9QWCxcbiAgICAgIGhhc1RleHQ6IHRydWUsXG4gICAgICBkaXNwbGF5UmFuZ2U6IHRoaXMuZGlzcGxheVJhbmdlLFxuICAgICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwicmVzdHJpY3RcIixcbiAgICAgIGNvbG9yczoge1xuICAgICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlTXV0ZWQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZU11dGVkLFxuICAgICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgICAgZ3JvdXBDb2xvcjogdGhlbWVDb2xvcnMuZ3JvdXBDb2xvcixcbiAgICAgICAgaGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5oaWdobGlnaHQsXG4gICAgICB9LFxuICAgICAgaGFzVGltZWxpbmU6IHRoaXMudG9wVGltZWxpbmUsXG4gICAgICBoYXNUYXNrczogdHJ1ZSxcbiAgICAgIGhhc0VkZ2VzOiB0cnVlLFxuICAgICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogdHJ1ZSxcbiAgICAgIHRhc2tMYWJlbDogdGhpcy5nZXRUYXNrTGFiZWxsZXIoKSxcbiAgICAgIHRhc2tEdXJhdGlvbjogdGhpcy5nZXRUYXNrRHVyYXRpb25GdW5jKCksXG4gICAgICB0YXNrRW1waGFzaXplOiB0aGlzLmNyaXRpY2FsUGF0aCxcbiAgICAgIGZpbHRlckZ1bmM6IGZpbHRlckZ1bmMsXG4gICAgICBncm91cEJ5UmVzb3VyY2U6IHRoaXMuZ3JvdXBCeU9wdGlvbnNbdGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4XSxcbiAgICAgIGhpZ2hsaWdodGVkVGFzazogMSxcbiAgICAgIHNlbGVjdGVkVGFza0luZGV4OiB0aGlzLnNlbGVjdGVkVGFzayxcbiAgICB9O1xuXG4gICAgY29uc3QgdGltZWxpbmVPcHRzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgICAgZm9udFNpemVQeDogRk9OVF9TSVpFX1BYLFxuICAgICAgaGFzVGV4dDogdHJ1ZSxcbiAgICAgIGRpc3BsYXlSYW5nZTogdGhpcy5kaXNwbGF5UmFuZ2UsXG4gICAgICBkaXNwbGF5UmFuZ2VVc2FnZTogXCJyZXN0cmljdFwiLFxuICAgICAgY29sb3JzOiB7XG4gICAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZTogdGhlbWVDb2xvcnMub25TdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2VNdXRlZDogdGhlbWVDb2xvcnMub25TdXJmYWNlTXV0ZWQsXG4gICAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgICBvdmVybGF5OiB0aGVtZUNvbG9ycy5vdmVybGF5LFxuICAgICAgICBncm91cENvbG9yOiB0aGVtZUNvbG9ycy5ncm91cENvbG9yLFxuICAgICAgICBoaWdobGlnaHQ6IHRoZW1lQ29sb3JzLmhpZ2hsaWdodCxcbiAgICAgIH0sXG4gICAgICBoYXNUaW1lbGluZTogdHJ1ZSxcbiAgICAgIGhhc1Rhc2tzOiBmYWxzZSxcbiAgICAgIGhhc0VkZ2VzOiB0cnVlLFxuICAgICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogdHJ1ZSxcbiAgICAgIHRhc2tMYWJlbDogdGhpcy5nZXRUYXNrTGFiZWxsZXIoKSxcbiAgICAgIHRhc2tEdXJhdGlvbjogdGhpcy5nZXRUYXNrRHVyYXRpb25GdW5jKCksXG4gICAgICB0YXNrRW1waGFzaXplOiB0aGlzLmNyaXRpY2FsUGF0aCxcbiAgICAgIGZpbHRlckZ1bmM6IGZpbHRlckZ1bmMsXG4gICAgICBncm91cEJ5UmVzb3VyY2U6IHRoaXMuZ3JvdXBCeU9wdGlvbnNbdGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4XSxcbiAgICAgIGhpZ2hsaWdodGVkVGFzazogbnVsbCxcbiAgICAgIHNlbGVjdGVkVGFza0luZGV4OiB0aGlzLnNlbGVjdGVkVGFzayxcbiAgICB9O1xuXG4gICAgY29uc3QgcmV0ID0gdGhpcy5wYWludE9uZUNoYXJ0KFwiI3JhZGFyXCIsIHJhZGFyT3B0cyk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yYWRhclNjYWxlID0gcmV0LnZhbHVlLnNjYWxlO1xuXG4gICAgdGhpcy5wYWludE9uZUNoYXJ0KFwiI3RpbWVsaW5lXCIsIHRpbWVsaW5lT3B0cyk7XG4gICAgY29uc3Qgem9vbVJldCA9IHRoaXMucGFpbnRPbmVDaGFydChcIiN6b29tZWRcIiwgem9vbU9wdHMsIFwiI292ZXJsYXlcIik7XG4gICAgaWYgKHpvb21SZXQub2spIHtcbiAgICAgIHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zID1cbiAgICAgICAgem9vbVJldC52YWx1ZS51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M7XG4gICAgICBpZiAoem9vbVJldC52YWx1ZS5zZWxlY3RlZFRhc2tMb2NhdGlvbiAhPT0gbnVsbCAmJiBzY3JvbGxUb1NlbGVjdGVkKSB7XG4gICAgICAgIGxldCB0b3AgPSAwO1xuICAgICAgICBpZiAoIXRoaXMuZm9jdXNPblRhc2spIHtcbiAgICAgICAgICB0b3AgPSB6b29tUmV0LnZhbHVlLnNlbGVjdGVkVGFza0xvY2F0aW9uLnk7XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImNoYXJ0LXBhcmVudFwiKSEuc2Nyb2xsVG8oe1xuICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgYmVoYXZpb3I6IFwic21vb3RoXCIsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUudGltZUVuZChcInBhaW50Q2hhcnRcIik7XG4gIH1cblxuICBwcmVwYXJlQ2FudmFzKFxuICAgIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gICAgY2FudmFzV2lkdGg6IG51bWJlcixcbiAgICBjYW52YXNIZWlnaHQ6IG51bWJlcixcbiAgICB3aWR0aDogbnVtYmVyLFxuICAgIGhlaWdodDogbnVtYmVyXG4gICk6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzV2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGNhbnZhc0hlaWdodDtcbiAgICBjYW52YXMuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gICAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG5cbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpITtcbiAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cbiAgICByZXR1cm4gY3R4O1xuICB9XG5cbiAgcGFpbnRPbmVDaGFydChcbiAgICBjYW52YXNJRDogc3RyaW5nLFxuICAgIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gICAgb3ZlcmxheUlEOiBzdHJpbmcgPSBcIlwiXG4gICk6IFJlc3VsdDxSZW5kZXJSZXN1bHQ+IHtcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTENhbnZhc0VsZW1lbnQ+KGNhbnZhc0lEKSE7XG4gICAgY29uc3QgcGFyZW50ID0gY2FudmFzIS5wYXJlbnRFbGVtZW50ITtcbiAgICBjb25zdCByYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgIGNvbnN0IHdpZHRoID0gcGFyZW50LmNsaWVudFdpZHRoIC0gRk9OVF9TSVpFX1BYO1xuICAgIGxldCBoZWlnaHQgPSBwYXJlbnQuY2xpZW50SGVpZ2h0O1xuICAgIGNvbnN0IGNhbnZhc1dpZHRoID0gTWF0aC5jZWlsKHdpZHRoICogcmF0aW8pO1xuICAgIGxldCBjYW52YXNIZWlnaHQgPSBNYXRoLmNlaWwoaGVpZ2h0ICogcmF0aW8pO1xuXG4gICAgY29uc3QgbmV3SGVpZ2h0ID0gc3VnZ2VzdGVkQ2FudmFzSGVpZ2h0KFxuICAgICAgY2FudmFzLFxuICAgICAgdGhpcy5zcGFucyxcbiAgICAgIG9wdHMsXG4gICAgICB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoICsgMiAvLyBUT0RPIC0gV2h5IGRvIHdlIG5lZWQgdGhlICsyIGhlcmUhP1xuICAgICk7XG4gICAgY2FudmFzSGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICAgIGhlaWdodCA9IG5ld0hlaWdodCAvIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuXG4gICAgbGV0IG92ZXJsYXk6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKG92ZXJsYXlJRCkge1xuICAgICAgb3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTENhbnZhc0VsZW1lbnQ+KG92ZXJsYXlJRCkhO1xuICAgICAgdGhpcy5wcmVwYXJlQ2FudmFzKG92ZXJsYXksIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cbiAgICBjb25zdCBjdHggPSB0aGlzLnByZXBhcmVDYW52YXMoXG4gICAgICBjYW52YXMsXG4gICAgICBjYW52YXNXaWR0aCxcbiAgICAgIGNhbnZhc0hlaWdodCxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgKTtcblxuICAgIHJldHVybiByZW5kZXJUYXNrc1RvQ2FudmFzKFxuICAgICAgcGFyZW50LFxuICAgICAgY2FudmFzLFxuICAgICAgY3R4LFxuICAgICAgdGhpcy5wbGFuLFxuICAgICAgdGhpcy5zcGFucyxcbiAgICAgIG9wdHMsXG4gICAgICBvdmVybGF5XG4gICAgKTtcbiAgfVxufVxuXG5jdXN0b21FbGVt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TSxTQUFTLEdBQUcsTUFBTTtBQUUvQixZQUFNLE1BQU0sT0FBTyxXQUFXLElBQUk7QUFDbEMsVUFBSSx3QkFBd0I7QUFFNUIsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUVBLGNBQ0UsVUFDQSxNQUNBLFlBQW9CLElBQ0U7QUFDdEIsWUFBTSxTQUFTLEtBQUssY0FBaUMsUUFBUTtBQUM3RCxZQUFNLFNBQVMsT0FBUTtBQUN2QixZQUFNLFFBQVEsT0FBTztBQUNyQixZQUFNLFFBQVEsT0FBTyxjQUFjO0FBQ25DLFVBQUksU0FBUyxPQUFPO0FBQ3BCLFlBQU0sY0FBYyxLQUFLLEtBQUssUUFBUSxLQUFLO0FBQzNDLFVBQUksZUFBZSxLQUFLLEtBQUssU0FBUyxLQUFLO0FBRTNDLFlBQU0sWUFBWTtBQUFBLFFBQ2hCO0FBQUEsUUFDQSxLQUFLO0FBQUEsUUFDTDtBQUFBLFFBQ0EsS0FBSyxLQUFLLE1BQU0sU0FBUyxTQUFTO0FBQUE7QUFBQSxNQUNwQztBQUNBLHFCQUFlO0FBQ2YsZUFBUyxZQUFZLE9BQU87QUFFNUIsVUFBSSxVQUFvQztBQUN4QyxVQUFJLFdBQVc7QUFDYixrQkFBVSxTQUFTLGNBQWlDLFNBQVM7QUFDN0QsYUFBSyxjQUFjLFNBQVMsYUFBYSxjQUFjLE9BQU8sTUFBTTtBQUFBLE1BQ3RFO0FBQ0EsWUFBTSxNQUFNLEtBQUs7QUFBQSxRQUNmO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFFQSxhQUFPO0FBQUEsUUFDTDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQSxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTDtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxpQkFBZSxPQUFPLGVBQWUsVUFBVTsiLAogICJuYW1lcyI6IFsiXyIsICJyZXN1bHQiLCAiaSIsICJoaWdobGlnaHQiLCAicGFydHMiLCAiUmVzdWx0IiwgImEiLCAiYiIsICJzIiwgInNjb3JlIiwgImoiLCAieCIsICJyIiwgImUiLCAibyIsICJ2IiwgImMiLCAiZiIsICJnbG9iYWwiLCAiZ2xvYmFsVGhpcyIsICJ0cnVzdGVkVHlwZXMiLCAicG9saWN5IiwgImNyZWF0ZVBvbGljeSIsICJjcmVhdGVIVE1MIiwgInMiLCAiYm91bmRBdHRyaWJ1dGVTdWZmaXgiLCAibWFya2VyIiwgIk1hdGgiLCAicmFuZG9tIiwgInRvRml4ZWQiLCAic2xpY2UiLCAibWFya2VyTWF0Y2giLCAibm9kZU1hcmtlciIsICJkIiwgImRvY3VtZW50IiwgImNyZWF0ZU1hcmtlciIsICJjcmVhdGVDb21tZW50IiwgImlzUHJpbWl0aXZlIiwgInZhbHVlIiwgImlzQXJyYXkiLCAiQXJyYXkiLCAiaXNJdGVyYWJsZSIsICJTeW1ib2wiLCAiaXRlcmF0b3IiLCAiU1BBQ0VfQ0hBUiIsICJ0ZXh0RW5kUmVnZXgiLCAiY29tbWVudEVuZFJlZ2V4IiwgImNvbW1lbnQyRW5kUmVnZXgiLCAidGFnRW5kUmVnZXgiLCAiUmVnRXhwIiwgInNpbmdsZVF1b3RlQXR0ckVuZFJlZ2V4IiwgImRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4IiwgInJhd1RleHRFbGVtZW50IiwgInRhZyIsICJ0eXBlIiwgInN0cmluZ3MiLCAidmFsdWVzIiwgIl8kbGl0VHlwZSQiLCAiaHRtbCIsICJzdmciLCAibWF0aG1sIiwgIm5vQ2hhbmdlIiwgImZvciIsICJub3RoaW5nIiwgInRlbXBsYXRlQ2FjaGUiLCAiV2Vha01hcCIsICJ3YWxrZXIiLCAiY3JlYXRlVHJlZVdhbGtlciIsICJ0cnVzdEZyb21UZW1wbGF0ZVN0cmluZyIsICJ0c2EiLCAic3RyaW5nRnJvbVRTQSIsICJoYXNPd25Qcm9wZXJ0eSIsICJFcnJvciIsICJnZXRUZW1wbGF0ZUh0bWwiLCAibCIsICJsZW5ndGgiLCAiYXR0ck5hbWVzIiwgInJhd1RleHRFbmRSZWdleCIsICJyZWdleCIsICJpIiwgImF0dHJOYW1lIiwgIm1hdGNoIiwgImF0dHJOYW1lRW5kSW5kZXgiLCAibGFzdEluZGV4IiwgImV4ZWMiLCAidGVzdCIsICJlbmQiLCAic3RhcnRzV2l0aCIsICJwdXNoIiwgIlRlbXBsYXRlIiwgImNvbnN0cnVjdG9yIiwgIm9wdGlvbnMiLCAibm9kZSIsICJ0aGlzIiwgInBhcnRzIiwgIm5vZGVJbmRleCIsICJhdHRyTmFtZUluZGV4IiwgInBhcnRDb3VudCIsICJlbCIsICJjcmVhdGVFbGVtZW50IiwgImN1cnJlbnROb2RlIiwgImNvbnRlbnQiLCAid3JhcHBlciIsICJmaXJzdENoaWxkIiwgInJlcGxhY2VXaXRoIiwgImNoaWxkTm9kZXMiLCAibmV4dE5vZGUiLCAibm9kZVR5cGUiLCAiaGFzQXR0cmlidXRlcyIsICJuYW1lIiwgImdldEF0dHJpYnV0ZU5hbWVzIiwgImVuZHNXaXRoIiwgInJlYWxOYW1lIiwgInN0YXRpY3MiLCAiZ2V0QXR0cmlidXRlIiwgInNwbGl0IiwgIm0iLCAiaW5kZXgiLCAiY3RvciIsICJQcm9wZXJ0eVBhcnQiLCAiQm9vbGVhbkF0dHJpYnV0ZVBhcnQiLCAiRXZlbnRQYXJ0IiwgIkF0dHJpYnV0ZVBhcnQiLCAicmVtb3ZlQXR0cmlidXRlIiwgInRhZ05hbWUiLCAidGV4dENvbnRlbnQiLCAiZW1wdHlTY3JpcHQiLCAiYXBwZW5kIiwgImRhdGEiLCAiaW5kZXhPZiIsICJfb3B0aW9ucyIsICJpbm5lckhUTUwiLCAicmVzb2x2ZURpcmVjdGl2ZSIsICJwYXJ0IiwgInBhcmVudCIsICJhdHRyaWJ1dGVJbmRleCIsICJjdXJyZW50RGlyZWN0aXZlIiwgIl9fZGlyZWN0aXZlcyIsICJfX2RpcmVjdGl2ZSIsICJuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IiLCAiXyRpbml0aWFsaXplIiwgIl8kcmVzb2x2ZSIsICJUZW1wbGF0ZUluc3RhbmNlIiwgInRlbXBsYXRlIiwgIl8kcGFydHMiLCAiXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuIiwgIl8kdGVtcGxhdGUiLCAiXyRwYXJlbnQiLCAicGFyZW50Tm9kZSIsICJfJGlzQ29ubmVjdGVkIiwgImZyYWdtZW50IiwgImNyZWF0aW9uU2NvcGUiLCAiaW1wb3J0Tm9kZSIsICJwYXJ0SW5kZXgiLCAidGVtcGxhdGVQYXJ0IiwgIkNoaWxkUGFydCIsICJuZXh0U2libGluZyIsICJFbGVtZW50UGFydCIsICJfJHNldFZhbHVlIiwgIl9faXNDb25uZWN0ZWQiLCAic3RhcnROb2RlIiwgImVuZE5vZGUiLCAiXyRjb21taXR0ZWRWYWx1ZSIsICJfJHN0YXJ0Tm9kZSIsICJfJGVuZE5vZGUiLCAiaXNDb25uZWN0ZWQiLCAiZGlyZWN0aXZlUGFyZW50IiwgIl8kY2xlYXIiLCAiX2NvbW1pdFRleHQiLCAiX2NvbW1pdFRlbXBsYXRlUmVzdWx0IiwgIl9jb21taXROb2RlIiwgIl9jb21taXRJdGVyYWJsZSIsICJpbnNlcnRCZWZvcmUiLCAiX2luc2VydCIsICJjcmVhdGVUZXh0Tm9kZSIsICJyZXN1bHQiLCAiXyRnZXRUZW1wbGF0ZSIsICJoIiwgIl91cGRhdGUiLCAiaW5zdGFuY2UiLCAiX2Nsb25lIiwgImdldCIsICJzZXQiLCAiaXRlbVBhcnRzIiwgIml0ZW1QYXJ0IiwgIml0ZW0iLCAic3RhcnQiLCAiZnJvbSIsICJfJG5vdGlmeUNvbm5lY3Rpb25DaGFuZ2VkIiwgIm4iLCAicmVtb3ZlIiwgImVsZW1lbnQiLCAiZmlsbCIsICJTdHJpbmciLCAidmFsdWVJbmRleCIsICJub0NvbW1pdCIsICJjaGFuZ2UiLCAidiIsICJfY29tbWl0VmFsdWUiLCAic2V0QXR0cmlidXRlIiwgInRvZ2dsZUF0dHJpYnV0ZSIsICJzdXBlciIsICJuZXdMaXN0ZW5lciIsICJvbGRMaXN0ZW5lciIsICJzaG91bGRSZW1vdmVMaXN0ZW5lciIsICJjYXB0dXJlIiwgIm9uY2UiLCAicGFzc2l2ZSIsICJzaG91bGRBZGRMaXN0ZW5lciIsICJyZW1vdmVFdmVudExpc3RlbmVyIiwgImFkZEV2ZW50TGlzdGVuZXIiLCAiZXZlbnQiLCAiY2FsbCIsICJob3N0IiwgImhhbmRsZUV2ZW50IiwgIl8kTEgiLCAiX2JvdW5kQXR0cmlidXRlU3VmZml4IiwgIl9tYXJrZXIiLCAiX21hcmtlck1hdGNoIiwgIl9IVE1MX1JFU1VMVCIsICJfZ2V0VGVtcGxhdGVIdG1sIiwgIl9UZW1wbGF0ZUluc3RhbmNlIiwgIl9pc0l0ZXJhYmxlIiwgIl9yZXNvbHZlRGlyZWN0aXZlIiwgIl9DaGlsZFBhcnQiLCAiX0F0dHJpYnV0ZVBhcnQiLCAiX0Jvb2xlYW5BdHRyaWJ1dGVQYXJ0IiwgIl9FdmVudFBhcnQiLCAiX1Byb3BlcnR5UGFydCIsICJfRWxlbWVudFBhcnQiLCAicG9seWZpbGxTdXBwb3J0IiwgImxpdEh0bWxQb2x5ZmlsbFN1cHBvcnQiLCAibGl0SHRtbFZlcnNpb25zIiwgInJlbmRlciIsICJjb250YWluZXIiLCAicGFydE93bmVyTm9kZSIsICJyZW5kZXJCZWZvcmUiLCAiZXhwbGFuTWFpbiIsICJ1bmRvIiwgImkiLCAiaiIsICJlIiwgImkiLCAiZSIsICJpIiwgImoiLCAiZSIsICJ2IiwgImkiLCAiaiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgInVuZG8iLCAiZSIsICJzIiwgInYiLCAiUGFydFR5cGUiLCAiQVRUUklCVVRFIiwgIkNISUxEIiwgIlBST1BFUlRZIiwgIkJPT0xFQU5fQVRUUklCVVRFIiwgIkVWRU5UIiwgIkVMRU1FTlQiLCAiZGlyZWN0aXZlIiwgImMiLCAidmFsdWVzIiwgIl8kbGl0RGlyZWN0aXZlJCIsICJEaXJlY3RpdmUiLCAiX3BhcnRJbmZvIiwgIl8kaXNDb25uZWN0ZWQiLCAidGhpcyIsICJfJHBhcmVudCIsICJwYXJ0IiwgInBhcmVudCIsICJhdHRyaWJ1dGVJbmRleCIsICJfX3BhcnQiLCAiX19hdHRyaWJ1dGVJbmRleCIsICJwcm9wcyIsICJ1cGRhdGUiLCAiX3BhcnQiLCAicmVuZGVyIiwgIl9DaGlsZFBhcnQiLCAiQ2hpbGRQYXJ0IiwgIl8kTEgiLCAiaXNTaW5nbGVFeHByZXNzaW9uIiwgInBhcnQiLCAic3RyaW5ncyIsICJSRVNFVF9WQUxVRSIsICJzZXRDb21taXR0ZWRWYWx1ZSIsICJwYXJ0IiwgInZhbHVlIiwgIl8kY29tbWl0dGVkVmFsdWUiLCAibGl2ZSIsICJkaXJlY3RpdmUiLCAiRGlyZWN0aXZlIiwgInBhcnRJbmZvIiwgInN1cGVyIiwgInR5cGUiLCAiUGFydFR5cGUiLCAiUFJPUEVSVFkiLCAiQVRUUklCVVRFIiwgIkJPT0xFQU5fQVRUUklCVVRFIiwgIkVycm9yIiwgImlzU2luZ2xlRXhwcmVzc2lvbiIsICJ2YWx1ZSIsICJwYXJ0IiwgIm5vQ2hhbmdlIiwgIm5vdGhpbmciLCAiZWxlbWVudCIsICJuYW1lIiwgImhhc0F0dHJpYnV0ZSIsICJnZXRBdHRyaWJ1dGUiLCAiU3RyaW5nIiwgInNldENvbW1pdHRlZFZhbHVlIiwgImV4cGxhbk1haW4iLCAiZSIsICJsIiwgIngiLCAicyIsICJwcmVjaXNpb24iLCAieCIsICJzIiwgInByZWNpc2lvbiIsICJ4IiwgInMiLCAiZXhwbGFuTWFpbiIsICJhIiwgImIiLCAiZXJyb3IiLCAibCIsICJlIiwgImV4cGxhbk1haW4iLCAiZyIsICJmIiwgImUiLCAiXyIsICJlIiwgImEiLCAiYiIsICJpIiwgImUiLCAiZXhwbGFuTWFpbiIsICJhIiwgImIiLCAiZyIsICJfIiwgImkiLCAiZSIsICJvayIsICJ0IiwgImUiLCAiZyIsICJpIiwgImMiLCAiYSIsICJiIiwgImMiLCAicCIsICJwIiwgImwiLCAiZSIsICJjIiwgImkiLCAiciIsICJlIiwgIm4iLCAiaSIsICJ0IiwgImEiLCAiYiIsICJhIiwgImIiLCAiZSIsICJ4IiwgImkiLCAidGVtcGxhdGUiLCAiZSIsICJmdXp6eXNvcnQiLCAidiIsICJ4IiwgInkiLCAiZSIsICJlIiwgImUiLCAieCIsICJmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleCIsICJhIiwgImIiLCAiaSIsICJuIiwgImUiLCAiY29ybmVycyIsICJyb3ciLCAicm5kSW50IiwgIm4iLCAiaSIsICJwcmVjaXNpb24iLCAiZSIsICJpIiwgImoiLCAicCJdCn0K
