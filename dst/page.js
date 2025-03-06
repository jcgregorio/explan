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
        class Result24 {
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
          const result = new Result24();
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
          const result = new Result24();
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

  // src/plan_status/plan_status.ts
  var statusToDate = (status) => {
    if (status.stage === "unstarted") {
      return /* @__PURE__ */ new Date();
    }
    return new Date(status.start);
  };
  var unstarted = { stage: "unstarted", start: 0 };
  var toJSON = (p2) => {
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
  var fromJSON = (p2) => {
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
      return `${d2.getFullYear()}-${d2.getMonth()}-${d2.getDay()}`;
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
  var toJSON2 = (taskCompletion) => {
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
  var fromJSON2 = (taskCompletionSerialized) => {
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
        toJSON2(taskCompletion)
      ])
    );
  };
  var taskCompletionsFromJSON = (t4) => {
    return Object.fromEntries(
      Object.entries(t4).map(([key, taskCompletionSerialized]) => [
        key,
        fromJSON2(taskCompletionSerialized)
      ])
    );
  };

  // src/units/parse.ts
  var decimalRegex = /^[\d\.]+$/;
  var parseDuration = (s2, daysInWeek) => {
    s2 = s2.trim();
    if (s2.match(decimalRegex)) {
      return ok(+s2);
    }
    let ret = 0;
    let num = 0;
    const chars = [...s2];
    for (let i3 = 0; i3 < chars.length; i3++) {
      const c2 = chars[i3];
      if (c2 === "d") {
        ret += num;
        num = 0;
      } else if (c2 === "w") {
        ret += num * daysInWeek;
        num = 0;
      } else if (c2 === "m") {
        ret += num * daysInWeek * 4;
        num = 0;
      } else if ("0123456789".includes(c2)) {
        num = num * 10 + +c2;
      } else {
        return error(new Error(`invalid duration format: ${s2}`));
      }
    }
    return ok(ret);
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
    parse(s2) {
      throw new Error("Method implemented in subclasses.");
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
      const d2 = new Date(this.start.getTime());
      d2.setDate(d2.getDate() + t4);
      return d2.toLocaleDateString(locale);
    }
    parse(s2) {
      const d2 = parseDuration(s2, 7);
      if (!d2.ok) {
        return d2;
      }
      return ok(this.metricDefn.clampAndRound(d2.value));
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
      const d2 = new Date(this.start.getTime());
      d2.setDate(d2.getDate() + this.weekdays.weekdaysToDays(t4));
      return d2.toLocaleDateString(locale);
    }
    parse(s2) {
      const d2 = parseDuration(s2, 5);
      if (!d2.ok) {
        return d2;
      }
      return ok(this.metricDefn.clampAndRound(d2.value));
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
        status: toJSON(this.status),
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
      ret.status = fromJSON(planSerialized.status);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2Z1enp5c29ydC9mdXp6eXNvcnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL3NyYy9saXQtaHRtbC50cyIsICIuLi9zcmMvcmVzdWx0LnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9uLnRzIiwgIi4uL3NyYy9kYWcvZGFnLnRzIiwgIi4uL3NyYy9vcHMvb3BzLnRzIiwgIi4uL3NyYy9vcHMvbWV0cmljcy50cyIsICIuLi9zcmMvb3BzL2NoYXJ0LnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9hZGRQcmVkZWNlc3Nvci50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvYWRkU3VjY2Vzc29yLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9nb3RvU2VhcmNoLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9oZWxwLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9yZXNldFpvb20udHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3Rhc2tzLnRzIiwgIi4uL3NyYy9zdHlsZS90b2dnbGVyL3RvZ2dsZXIudHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3RvZ2dsZURhcmtNb2RlLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy90b2dnbGVGb2N1cy50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvdG9nZ2xlUmFkYXIudHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3VuZG8udHMiLCAiLi4vc3JjL2FjdGlvbi9yZWdpc3RyeS50cyIsICIuLi9zcmMvYWN0aW9uL2V4ZWN1dGUudHMiLCAiLi4vc3JjL2tleW1hcC9rZXltYXAudHMiLCAiLi4vc3JjL2hlbHAvaGVscC50cyIsICIuLi9zcmMvcGxhbl9zdGF0dXMvcGxhbl9zdGF0dXMudHMiLCAiLi4vc3JjL2VkaXQtcGxhbi1zdGFydC9lZGl0LXBsYW4tc3RhcnQudHMiLCAiLi4vc3JjL3Jlc291cmNlcy9yZXNvdXJjZXMudHMiLCAiLi4vc3JjL2ljb25zL2ljb25zLnRzIiwgIi4uL3NyYy9vcHMvcmVzb3VyY2VzLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9zcmMvZGlyZWN0aXZlLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9saXQtaHRtbC9zcmMvZGlyZWN0aXZlLWhlbHBlcnMudHMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL3NyYy9kaXJlY3RpdmVzL2xpdmUudHMiLCAiLi4vc3JjL2VkaXQtcmVzb3VyY2UtZGVmaW5pdGlvbi9lZGl0LXJlc291cmNlLWRlZmluaXRpb24udHMiLCAiLi4vc3JjL21ldHJpY3MvcmFuZ2UudHMiLCAiLi4vc3JjL3ByZWNpc2lvbi9wcmVjaXNpb24udHMiLCAiLi4vc3JjL21ldHJpY3MvbWV0cmljcy50cyIsICIuLi9zcmMvZWRpdC1tZXRyaWNzLWRpYWxvZy9lZGl0LW1ldHJpY3MtZGlhbG9nLnRzIiwgIi4uL3NyYy9yZXBvcnQtZXJyb3IvcmVwb3J0LWVycm9yLnRzIiwgIi4uL3NyYy9lZGl0LW1ldHJpYy1kZWZpbml0aW9uL2VkaXQtbWV0cmljLWRlZmluaXRpb24udHMiLCAiLi4vc3JjL2RlcGVuZGVuY2llcy9kZXBlbmRlbmNpZXMtcGFuZWwudHMiLCAiLi4vc3JjL2RhZy9hbGdvcml0aG1zL2Rmcy50cyIsICIuLi9zcmMvZGFnL2FsZ29yaXRobXMvY2lyY3VsYXIudHMiLCAiLi4vc3JjL2FkZC1kZXBlbmRlbmN5LWRpYWxvZy9hZGQtZGVwZW5kZW5jeS1kaWFsb2cudHMiLCAiLi4vc3JjL2VkaXQtcmVzb3VyY2VzLWRpYWxvZy9lZGl0LXJlc291cmNlcy1kaWFsb2cudHMiLCAiLi4vc3JjL2RhZy9hbGdvcml0aG1zL3RvcG9zb3J0LnRzIiwgIi4uL3NyYy9jaGFydC9jaGFydC50cyIsICIuLi9zcmMvc3RhdHMvY2RmL3RyaWFuZ3VsYXIvdHJpYW5ndWxhci50cyIsICIuLi9zcmMvc3RhdHMvY2RmL3RyaWFuZ3VsYXIvamFjb2JpYW4udHMiLCAiLi4vc3JjL3NsYWNrL3NsYWNrLnRzIiwgIi4uL3NyYy90YXNrX2NvbXBsZXRpb24vdGFza19jb21wbGV0aW9uLnRzIiwgIi4uL3NyYy91bml0cy9wYXJzZS50cyIsICIuLi9zcmMvdW5pdHMvd2Vla2RheXMudHMiLCAiLi4vc3JjL3VuaXRzL3VuaXQudHMiLCAiLi4vc3JjL3BsYW4vcGxhbi50cyIsICIuLi9zcmMvc2VsZWN0ZWQtdGFzay1wYW5lbC9zZWxlY3RlZC10YXNrLXBhbmVsLnRzIiwgIi4uL3NyYy9zaW11bGF0aW9uL3NpbXVsYXRpb24udHMiLCAiLi4vc3JjL3NpbXVsYXRpb24tcGFuZWwvc2ltdWxhdGlvbi1wYW5lbC50cyIsICIuLi9zcmMvc2VhcmNoL3NlYXJjaC10YXNrLXBhbmVsLnRzIiwgIi4uL3NyYy9zZWFyY2gvdGFzay1zZWFyY2gtY29udHJvbHMudHMiLCAiLi4vc3JjL3BvaW50L3BvaW50LnRzIiwgIi4uL3NyYy9yZW5kZXJlci9kaXZpZGVybW92ZS9kaXZpZGVybW92ZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvbW91c2VkcmFnL21vdXNlZHJhZy50cyIsICIuLi9zcmMvcmVuZGVyZXIvbW91c2Vtb3ZlL21vdXNlbW92ZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvcmFuZ2UvcmFuZ2UudHMiLCAiLi4vc3JjL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHMiLCAiLi4vc3JjL3JlbmRlcmVyL3NjYWxlL3NjYWxlLnRzIiwgIi4uL3NyYy9oaXRyZWN0L2hpdHJlY3QudHMiLCAiLi4vc3JjL3JlbmRlcmVyL3JlbmRlcmVyLnRzIiwgIi4uL3NyYy9zdHlsZS90aGVtZS90aGVtZS50cyIsICIuLi9zcmMvZ2VuZXJhdGUvZ2VuZXJhdGUudHMiLCAiLi4vc3JjL2V4cGxhbk1haW4vZXhwbGFuTWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gaHR0cHM6Ly9naXRodWIuY29tL2ZhcnpoZXIvZnV6enlzb3J0IHYzLjAuMlxyXG5cclxuLy8gVU1EIChVbml2ZXJzYWwgTW9kdWxlIERlZmluaXRpb24pIGZvciBmdXp6eXNvcnRcclxuOygocm9vdCwgVU1EKSA9PiB7XHJcbiAgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoW10sIFVNRClcclxuICBlbHNlIGlmKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IFVNRCgpXHJcbiAgZWxzZSByb290WydmdXp6eXNvcnQnXSA9IFVNRCgpXHJcbn0pKHRoaXMsIF8gPT4ge1xyXG4gICd1c2Ugc3RyaWN0J1xyXG5cclxuICB2YXIgc2luZ2xlID0gKHNlYXJjaCwgdGFyZ2V0KSA9PiB7XHJcbiAgICBpZighc2VhcmNoIHx8ICF0YXJnZXQpIHJldHVybiBOVUxMXHJcblxyXG4gICAgdmFyIHByZXBhcmVkU2VhcmNoID0gZ2V0UHJlcGFyZWRTZWFyY2goc2VhcmNoKVxyXG4gICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG5cclxuICAgIHZhciBzZWFyY2hCaXRmbGFncyA9IHByZXBhcmVkU2VhcmNoLmJpdGZsYWdzXHJcbiAgICBpZigoc2VhcmNoQml0ZmxhZ3MgJiB0YXJnZXQuX2JpdGZsYWdzKSAhPT0gc2VhcmNoQml0ZmxhZ3MpIHJldHVybiBOVUxMXHJcblxyXG4gICAgcmV0dXJuIGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0KVxyXG4gIH1cclxuXHJcbiAgdmFyIGdvID0gKHNlYXJjaCwgdGFyZ2V0cywgb3B0aW9ucykgPT4ge1xyXG4gICAgaWYoIXNlYXJjaCkgcmV0dXJuIG9wdGlvbnM/LmFsbCA/IGFsbCh0YXJnZXRzLCBvcHRpb25zKSA6IG5vUmVzdWx0c1xyXG5cclxuICAgIHZhciBwcmVwYXJlZFNlYXJjaCA9IGdldFByZXBhcmVkU2VhcmNoKHNlYXJjaClcclxuICAgIHZhciBzZWFyY2hCaXRmbGFncyA9IHByZXBhcmVkU2VhcmNoLmJpdGZsYWdzXHJcbiAgICB2YXIgY29udGFpbnNTcGFjZSAgPSBwcmVwYXJlZFNlYXJjaC5jb250YWluc1NwYWNlXHJcblxyXG4gICAgdmFyIHRocmVzaG9sZCA9IGRlbm9ybWFsaXplU2NvcmUoIG9wdGlvbnM/LnRocmVzaG9sZCB8fCAwIClcclxuICAgIHZhciBsaW1pdCAgICAgPSBvcHRpb25zPy5saW1pdCB8fCBJTkZJTklUWVxyXG5cclxuICAgIHZhciByZXN1bHRzTGVuID0gMDsgdmFyIGxpbWl0ZWRDb3VudCA9IDBcclxuICAgIHZhciB0YXJnZXRzTGVuID0gdGFyZ2V0cy5sZW5ndGhcclxuXHJcbiAgICBmdW5jdGlvbiBwdXNoX3Jlc3VsdChyZXN1bHQpIHtcclxuICAgICAgaWYocmVzdWx0c0xlbiA8IGxpbWl0KSB7IHEuYWRkKHJlc3VsdCk7ICsrcmVzdWx0c0xlbiB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgICsrbGltaXRlZENvdW50XHJcbiAgICAgICAgaWYocmVzdWx0Ll9zY29yZSA+IHEucGVlaygpLl9zY29yZSkgcS5yZXBsYWNlVG9wKHJlc3VsdClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgY29kZSBpcyBjb3B5L3Bhc3RlZCAzIHRpbWVzIGZvciBwZXJmb3JtYW5jZSByZWFzb25zIFtvcHRpb25zLmtleSwgb3B0aW9ucy5rZXlzLCBubyBrZXlzXVxyXG5cclxuICAgIC8vIG9wdGlvbnMua2V5XHJcbiAgICBpZihvcHRpb25zPy5rZXkpIHtcclxuICAgICAgdmFyIGtleSA9IG9wdGlvbnMua2V5XHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRzTGVuOyArK2kpIHsgdmFyIG9iaiA9IHRhcmdldHNbaV1cclxuICAgICAgICB2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBrZXkpXHJcbiAgICAgICAgaWYoIXRhcmdldCkgY29udGludWVcclxuICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgICAgIGlmKChzZWFyY2hCaXRmbGFncyAmIHRhcmdldC5fYml0ZmxhZ3MpICE9PSBzZWFyY2hCaXRmbGFncykgY29udGludWVcclxuICAgICAgICB2YXIgcmVzdWx0ID0gYWxnb3JpdGhtKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQpXHJcbiAgICAgICAgaWYocmVzdWx0ID09PSBOVUxMKSBjb250aW51ZVxyXG4gICAgICAgIGlmKHJlc3VsdC5fc2NvcmUgPCB0aHJlc2hvbGQpIGNvbnRpbnVlXHJcblxyXG4gICAgICAgIHJlc3VsdC5vYmogPSBvYmpcclxuICAgICAgICBwdXNoX3Jlc3VsdChyZXN1bHQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAvLyBvcHRpb25zLmtleXNcclxuICAgIH0gZWxzZSBpZihvcHRpb25zPy5rZXlzKSB7XHJcbiAgICAgIHZhciBrZXlzID0gb3B0aW9ucy5rZXlzXHJcbiAgICAgIHZhciBrZXlzTGVuID0ga2V5cy5sZW5ndGhcclxuXHJcbiAgICAgIG91dGVyOiBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0c0xlbjsgKytpKSB7IHZhciBvYmogPSB0YXJnZXRzW2ldXHJcblxyXG4gICAgICAgIHsgLy8gZWFybHkgb3V0IGJhc2VkIG9uIGJpdGZsYWdzXHJcbiAgICAgICAgICB2YXIga2V5c0JpdGZsYWdzID0gMFxyXG4gICAgICAgICAgZm9yICh2YXIga2V5SSA9IDA7IGtleUkgPCBrZXlzTGVuOyArK2tleUkpIHtcclxuICAgICAgICAgICAgdmFyIGtleSA9IGtleXNba2V5SV1cclxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwga2V5KVxyXG4gICAgICAgICAgICBpZighdGFyZ2V0KSB7IHRtcFRhcmdldHNba2V5SV0gPSBub1RhcmdldDsgY29udGludWUgfVxyXG4gICAgICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcbiAgICAgICAgICAgIHRtcFRhcmdldHNba2V5SV0gPSB0YXJnZXRcclxuXHJcbiAgICAgICAgICAgIGtleXNCaXRmbGFncyB8PSB0YXJnZXQuX2JpdGZsYWdzXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYoKHNlYXJjaEJpdGZsYWdzICYga2V5c0JpdGZsYWdzKSAhPT0gc2VhcmNoQml0ZmxhZ3MpIGNvbnRpbnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihjb250YWluc1NwYWNlKSBmb3IobGV0IGk9MDsgaTxwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzLmxlbmd0aDsgaSsrKSBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA9IE5FR0FUSVZFX0lORklOSVRZXHJcblxyXG4gICAgICAgIGZvciAodmFyIGtleUkgPSAwOyBrZXlJIDwga2V5c0xlbjsgKytrZXlJKSB7XHJcbiAgICAgICAgICB0YXJnZXQgPSB0bXBUYXJnZXRzW2tleUldXHJcbiAgICAgICAgICBpZih0YXJnZXQgPT09IG5vVGFyZ2V0KSB7IHRtcFJlc3VsdHNba2V5SV0gPSBub1RhcmdldDsgY29udGludWUgfVxyXG5cclxuICAgICAgICAgIHRtcFJlc3VsdHNba2V5SV0gPSBhbGdvcml0aG0ocHJlcGFyZWRTZWFyY2gsIHRhcmdldCwgLyphbGxvd1NwYWNlcz0qL2ZhbHNlLCAvKmFsbG93UGFydGlhbE1hdGNoPSovY29udGFpbnNTcGFjZSlcclxuICAgICAgICAgIGlmKHRtcFJlc3VsdHNba2V5SV0gPT09IE5VTEwpIHsgdG1wUmVzdWx0c1trZXlJXSA9IG5vVGFyZ2V0OyBjb250aW51ZSB9XHJcblxyXG4gICAgICAgICAgLy8gdG9kbzogdGhpcyBzZWVtcyB3ZWlyZCBhbmQgd3JvbmcuIGxpa2Ugd2hhdCBpZiBvdXIgZmlyc3QgbWF0Y2ggd2Fzbid0IGdvb2QuIHRoaXMgc2hvdWxkIGp1c3QgcmVwbGFjZSBpdCBpbnN0ZWFkIG9mIGF2ZXJhZ2luZyB3aXRoIGl0XHJcbiAgICAgICAgICAvLyBpZiBvdXIgc2Vjb25kIG1hdGNoIGlzbid0IGdvb2Qgd2UgaWdub3JlIGl0IGluc3RlYWQgb2YgYXZlcmFnaW5nIHdpdGggaXRcclxuICAgICAgICAgIGlmKGNvbnRhaW5zU3BhY2UpIGZvcihsZXQgaT0wOyBpPHByZXBhcmVkU2VhcmNoLnNwYWNlU2VhcmNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0gPiAtMTAwMCkge1xyXG4gICAgICAgICAgICAgIGlmKGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldID4gTkVHQVRJVkVfSU5GSU5JVFkpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0bXAgPSAoa2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gKyBhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSkgLyA0Lypib251cyBzY29yZSBmb3IgaGF2aW5nIG11bHRpcGxlIG1hdGNoZXMqL1xyXG4gICAgICAgICAgICAgICAgaWYodG1wID4ga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0pIGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldID0gdG1wXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldID4ga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0pIGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldID0gYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGNvbnRhaW5zU3BhY2UpIHtcclxuICAgICAgICAgIGZvcihsZXQgaT0wOyBpPHByZXBhcmVkU2VhcmNoLnNwYWNlU2VhcmNoZXMubGVuZ3RoOyBpKyspIHsgaWYoa2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPT09IE5FR0FUSVZFX0lORklOSVRZKSBjb250aW51ZSBvdXRlciB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHZhciBoYXNBdExlYXN0MU1hdGNoID0gZmFsc2VcclxuICAgICAgICAgIGZvcihsZXQgaT0wOyBpIDwga2V5c0xlbjsgaSsrKSB7IGlmKHRtcFJlc3VsdHNbaV0uX3Njb3JlICE9PSBORUdBVElWRV9JTkZJTklUWSkgeyBoYXNBdExlYXN0MU1hdGNoID0gdHJ1ZTsgYnJlYWsgfSB9XHJcbiAgICAgICAgICBpZighaGFzQXRMZWFzdDFNYXRjaCkgY29udGludWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBvYmpSZXN1bHRzID0gbmV3IEtleXNSZXN1bHQoa2V5c0xlbilcclxuICAgICAgICBmb3IobGV0IGk9MDsgaSA8IGtleXNMZW47IGkrKykgeyBvYmpSZXN1bHRzW2ldID0gdG1wUmVzdWx0c1tpXSB9XHJcblxyXG4gICAgICAgIGlmKGNvbnRhaW5zU3BhY2UpIHtcclxuICAgICAgICAgIHZhciBzY29yZSA9IDBcclxuICAgICAgICAgIGZvcihsZXQgaT0wOyBpPHByZXBhcmVkU2VhcmNoLnNwYWNlU2VhcmNoZXMubGVuZ3RoOyBpKyspIHNjb3JlICs9IGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIHRvZG8gY291bGQgcmV3cml0ZSB0aGlzIHNjb3JpbmcgdG8gYmUgbW9yZSBzaW1pbGFyIHRvIHdoZW4gdGhlcmUncyBzcGFjZXNcclxuICAgICAgICAgIC8vIGlmIHdlIG1hdGNoIG11bHRpcGxlIGtleXMgZ2l2ZSB1cyBib251cyBwb2ludHNcclxuICAgICAgICAgIHZhciBzY29yZSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgICAgICBmb3IobGV0IGk9MDsgaTxrZXlzTGVuOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG9ialJlc3VsdHNbaV1cclxuICAgICAgICAgICAgaWYocmVzdWx0Ll9zY29yZSA+IC0xMDAwKSB7XHJcbiAgICAgICAgICAgICAgaWYoc2NvcmUgPiBORUdBVElWRV9JTkZJTklUWSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRtcCA9IChzY29yZSArIHJlc3VsdC5fc2NvcmUpIC8gNC8qYm9udXMgc2NvcmUgZm9yIGhhdmluZyBtdWx0aXBsZSBtYXRjaGVzKi9cclxuICAgICAgICAgICAgICAgIGlmKHRtcCA+IHNjb3JlKSBzY29yZSA9IHRtcFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihyZXN1bHQuX3Njb3JlID4gc2NvcmUpIHNjb3JlID0gcmVzdWx0Ll9zY29yZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb2JqUmVzdWx0cy5vYmogPSBvYmpcclxuICAgICAgICBvYmpSZXN1bHRzLl9zY29yZSA9IHNjb3JlXHJcbiAgICAgICAgaWYob3B0aW9ucz8uc2NvcmVGbikge1xyXG4gICAgICAgICAgc2NvcmUgPSBvcHRpb25zLnNjb3JlRm4ob2JqUmVzdWx0cylcclxuICAgICAgICAgIGlmKCFzY29yZSkgY29udGludWVcclxuICAgICAgICAgIHNjb3JlID0gZGVub3JtYWxpemVTY29yZShzY29yZSlcclxuICAgICAgICAgIG9ialJlc3VsdHMuX3Njb3JlID0gc2NvcmVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHNjb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZVxyXG4gICAgICAgIHB1c2hfcmVzdWx0KG9ialJlc3VsdHMpXHJcbiAgICAgIH1cclxuXHJcbiAgICAvLyBubyBrZXlzXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0c0xlbjsgKytpKSB7IHZhciB0YXJnZXQgPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgaWYoIXRhcmdldCkgY29udGludWVcclxuICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgICAgIGlmKChzZWFyY2hCaXRmbGFncyAmIHRhcmdldC5fYml0ZmxhZ3MpICE9PSBzZWFyY2hCaXRmbGFncykgY29udGludWVcclxuICAgICAgICB2YXIgcmVzdWx0ID0gYWxnb3JpdGhtKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQpXHJcbiAgICAgICAgaWYocmVzdWx0ID09PSBOVUxMKSBjb250aW51ZVxyXG4gICAgICAgIGlmKHJlc3VsdC5fc2NvcmUgPCB0aHJlc2hvbGQpIGNvbnRpbnVlXHJcblxyXG4gICAgICAgIHB1c2hfcmVzdWx0KHJlc3VsdClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmKHJlc3VsdHNMZW4gPT09IDApIHJldHVybiBub1Jlc3VsdHNcclxuICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KHJlc3VsdHNMZW4pXHJcbiAgICBmb3IodmFyIGkgPSByZXN1bHRzTGVuIC0gMTsgaSA+PSAwOyAtLWkpIHJlc3VsdHNbaV0gPSBxLnBvbGwoKVxyXG4gICAgcmVzdWx0cy50b3RhbCA9IHJlc3VsdHNMZW4gKyBsaW1pdGVkQ291bnRcclxuICAgIHJldHVybiByZXN1bHRzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gdGhpcyBpcyB3cml0dGVuIGFzIDEgZnVuY3Rpb24gaW5zdGVhZCBvZiAyIGZvciBtaW5pZmljYXRpb24uIHBlcmYgc2VlbXMgZmluZSAuLi5cclxuICAvLyBleGNlcHQgd2hlbiBtaW5pZmllZC4gdGhlIHBlcmYgaXMgdmVyeSBzbG93XHJcbiAgdmFyIGhpZ2hsaWdodCA9IChyZXN1bHQsIG9wZW49JzxiPicsIGNsb3NlPSc8L2I+JykgPT4ge1xyXG4gICAgdmFyIGNhbGxiYWNrID0gdHlwZW9mIG9wZW4gPT09ICdmdW5jdGlvbicgPyBvcGVuIDogdW5kZWZpbmVkXHJcblxyXG4gICAgdmFyIHRhcmdldCAgICAgID0gcmVzdWx0LnRhcmdldFxyXG4gICAgdmFyIHRhcmdldExlbiAgID0gdGFyZ2V0Lmxlbmd0aFxyXG4gICAgdmFyIGluZGV4ZXMgICAgID0gcmVzdWx0LmluZGV4ZXNcclxuICAgIHZhciBoaWdobGlnaHRlZCA9ICcnXHJcbiAgICB2YXIgbWF0Y2hJICAgICAgPSAwXHJcbiAgICB2YXIgaW5kZXhlc0kgICAgPSAwXHJcbiAgICB2YXIgb3BlbmVkICAgICAgPSBmYWxzZVxyXG4gICAgdmFyIHBhcnRzICAgICAgID0gW11cclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0TGVuOyArK2kpIHsgdmFyIGNoYXIgPSB0YXJnZXRbaV1cclxuICAgICAgaWYoaW5kZXhlc1tpbmRleGVzSV0gPT09IGkpIHtcclxuICAgICAgICArK2luZGV4ZXNJXHJcbiAgICAgICAgaWYoIW9wZW5lZCkgeyBvcGVuZWQgPSB0cnVlXHJcbiAgICAgICAgICBpZihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGhpZ2hsaWdodGVkKTsgaGlnaGxpZ2h0ZWQgPSAnJ1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgKz0gb3BlblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoaW5kZXhlc0kgPT09IGluZGV4ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBpZihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBoaWdobGlnaHRlZCArPSBjaGFyXHJcbiAgICAgICAgICAgIHBhcnRzLnB1c2goY2FsbGJhY2soaGlnaGxpZ2h0ZWQsIG1hdGNoSSsrKSk7IGhpZ2hsaWdodGVkID0gJydcclxuICAgICAgICAgICAgcGFydHMucHVzaCh0YXJnZXQuc3Vic3RyKGkrMSkpXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoaWdobGlnaHRlZCArPSBjaGFyICsgY2xvc2UgKyB0YXJnZXQuc3Vic3RyKGkrMSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmKG9wZW5lZCkgeyBvcGVuZWQgPSBmYWxzZVxyXG4gICAgICAgICAgaWYoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgcGFydHMucHVzaChjYWxsYmFjayhoaWdobGlnaHRlZCwgbWF0Y2hJKyspKTsgaGlnaGxpZ2h0ZWQgPSAnJ1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgKz0gY2xvc2VcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaGlnaGxpZ2h0ZWQgKz0gY2hhclxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjYWxsYmFjayA/IHBhcnRzIDogaGlnaGxpZ2h0ZWRcclxuICB9XHJcblxyXG5cclxuICB2YXIgcHJlcGFyZSA9ICh0YXJnZXQpID0+IHtcclxuICAgIGlmKHR5cGVvZiB0YXJnZXQgPT09ICdudW1iZXInKSB0YXJnZXQgPSAnJyt0YXJnZXRcclxuICAgIGVsc2UgaWYodHlwZW9mIHRhcmdldCAhPT0gJ3N0cmluZycpIHRhcmdldCA9ICcnXHJcbiAgICB2YXIgaW5mbyA9IHByZXBhcmVMb3dlckluZm8odGFyZ2V0KVxyXG4gICAgcmV0dXJuIG5ld19yZXN1bHQodGFyZ2V0LCB7X3RhcmdldExvd2VyOmluZm8uX2xvd2VyLCBfdGFyZ2V0TG93ZXJDb2RlczppbmZvLmxvd2VyQ29kZXMsIF9iaXRmbGFnczppbmZvLmJpdGZsYWdzfSlcclxuICB9XHJcblxyXG4gIHZhciBjbGVhbnVwID0gKCkgPT4geyBwcmVwYXJlZENhY2hlLmNsZWFyKCk7IHByZXBhcmVkU2VhcmNoQ2FjaGUuY2xlYXIoKSB9XHJcblxyXG5cclxuICAvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxyXG4gIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcbiAgLy8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcclxuICAvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxyXG5cclxuXHJcbiAgY2xhc3MgUmVzdWx0IHtcclxuICAgIGdldCBbJ2luZGV4ZXMnXSgpIHsgcmV0dXJuIHRoaXMuX2luZGV4ZXMuc2xpY2UoMCwgdGhpcy5faW5kZXhlcy5sZW4pLnNvcnQoKGEsYik9PmEtYikgfVxyXG4gICAgc2V0IFsnaW5kZXhlcyddKGluZGV4ZXMpIHsgcmV0dXJuIHRoaXMuX2luZGV4ZXMgPSBpbmRleGVzIH1cclxuICAgIFsnaGlnaGxpZ2h0J10ob3BlbiwgY2xvc2UpIHsgcmV0dXJuIGhpZ2hsaWdodCh0aGlzLCBvcGVuLCBjbG9zZSkgfVxyXG4gICAgZ2V0IFsnc2NvcmUnXSgpIHsgcmV0dXJuIG5vcm1hbGl6ZVNjb3JlKHRoaXMuX3Njb3JlKSB9XHJcbiAgICBzZXQgWydzY29yZSddKHNjb3JlKSB7IHRoaXMuX3Njb3JlID0gZGVub3JtYWxpemVTY29yZShzY29yZSkgfVxyXG4gIH1cclxuXHJcbiAgY2xhc3MgS2V5c1Jlc3VsdCBleHRlbmRzIEFycmF5IHtcclxuICAgIGdldCBbJ3Njb3JlJ10oKSB7IHJldHVybiBub3JtYWxpemVTY29yZSh0aGlzLl9zY29yZSkgfVxyXG4gICAgc2V0IFsnc2NvcmUnXShzY29yZSkgeyB0aGlzLl9zY29yZSA9IGRlbm9ybWFsaXplU2NvcmUoc2NvcmUpIH1cclxuICB9XHJcblxyXG4gIHZhciBuZXdfcmVzdWx0ID0gKHRhcmdldCwgb3B0aW9ucykgPT4ge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IFJlc3VsdCgpXHJcbiAgICByZXN1bHRbJ3RhcmdldCddICAgICAgICAgICAgID0gdGFyZ2V0XHJcbiAgICByZXN1bHRbJ29iaiddICAgICAgICAgICAgICAgID0gb3B0aW9ucy5vYmogICAgICAgICAgICAgICAgICAgPz8gTlVMTFxyXG4gICAgcmVzdWx0Ll9zY29yZSAgICAgICAgICAgICAgICA9IG9wdGlvbnMuX3Njb3JlICAgICAgICAgICAgICAgID8/IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICByZXN1bHQuX2luZGV4ZXMgICAgICAgICAgICAgID0gb3B0aW9ucy5faW5kZXhlcyAgICAgICAgICAgICAgPz8gW11cclxuICAgIHJlc3VsdC5fdGFyZ2V0TG93ZXIgICAgICAgICAgPSBvcHRpb25zLl90YXJnZXRMb3dlciAgICAgICAgICA/PyAnJ1xyXG4gICAgcmVzdWx0Ll90YXJnZXRMb3dlckNvZGVzICAgICA9IG9wdGlvbnMuX3RhcmdldExvd2VyQ29kZXMgICAgID8/IE5VTExcclxuICAgIHJlc3VsdC5fbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBvcHRpb25zLl9uZXh0QmVnaW5uaW5nSW5kZXhlcyA/PyBOVUxMXHJcbiAgICByZXN1bHQuX2JpdGZsYWdzICAgICAgICAgICAgID0gb3B0aW9ucy5fYml0ZmxhZ3MgICAgICAgICAgICAgPz8gMFxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG4gIH1cclxuXHJcblxyXG4gIHZhciBub3JtYWxpemVTY29yZSA9IHNjb3JlID0+IHtcclxuICAgIGlmKHNjb3JlID09PSBORUdBVElWRV9JTkZJTklUWSkgcmV0dXJuIDBcclxuICAgIGlmKHNjb3JlID4gMSkgcmV0dXJuIHNjb3JlXHJcbiAgICByZXR1cm4gTWF0aC5FICoqICggKCgtc2NvcmUgKyAxKSoqLjA0MzA3IC0gMSkgKiAtMilcclxuICB9XHJcbiAgdmFyIGRlbm9ybWFsaXplU2NvcmUgPSBub3JtYWxpemVkU2NvcmUgPT4ge1xyXG4gICAgaWYobm9ybWFsaXplZFNjb3JlID09PSAwKSByZXR1cm4gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgIGlmKG5vcm1hbGl6ZWRTY29yZSA+IDEpIHJldHVybiBub3JtYWxpemVkU2NvcmVcclxuICAgIHJldHVybiAxIC0gTWF0aC5wb3coKE1hdGgubG9nKG5vcm1hbGl6ZWRTY29yZSkgLyAtMiArIDEpLCAxIC8gMC4wNDMwNylcclxuICB9XHJcblxyXG5cclxuICB2YXIgcHJlcGFyZVNlYXJjaCA9IChzZWFyY2gpID0+IHtcclxuICAgIGlmKHR5cGVvZiBzZWFyY2ggPT09ICdudW1iZXInKSBzZWFyY2ggPSAnJytzZWFyY2hcclxuICAgIGVsc2UgaWYodHlwZW9mIHNlYXJjaCAhPT0gJ3N0cmluZycpIHNlYXJjaCA9ICcnXHJcbiAgICBzZWFyY2ggPSBzZWFyY2gudHJpbSgpXHJcbiAgICB2YXIgaW5mbyA9IHByZXBhcmVMb3dlckluZm8oc2VhcmNoKVxyXG5cclxuICAgIHZhciBzcGFjZVNlYXJjaGVzID0gW11cclxuICAgIGlmKGluZm8uY29udGFpbnNTcGFjZSkge1xyXG4gICAgICB2YXIgc2VhcmNoZXMgPSBzZWFyY2guc3BsaXQoL1xccysvKVxyXG4gICAgICBzZWFyY2hlcyA9IFsuLi5uZXcgU2V0KHNlYXJjaGVzKV0gLy8gZGlzdGluY3RcclxuICAgICAgZm9yKHZhciBpPTA7IGk8c2VhcmNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZihzZWFyY2hlc1tpXSA9PT0gJycpIGNvbnRpbnVlXHJcbiAgICAgICAgdmFyIF9pbmZvID0gcHJlcGFyZUxvd2VySW5mbyhzZWFyY2hlc1tpXSlcclxuICAgICAgICBzcGFjZVNlYXJjaGVzLnB1c2goe2xvd2VyQ29kZXM6X2luZm8ubG93ZXJDb2RlcywgX2xvd2VyOnNlYXJjaGVzW2ldLnRvTG93ZXJDYXNlKCksIGNvbnRhaW5zU3BhY2U6ZmFsc2V9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtsb3dlckNvZGVzOiBpbmZvLmxvd2VyQ29kZXMsIF9sb3dlcjogaW5mby5fbG93ZXIsIGNvbnRhaW5zU3BhY2U6IGluZm8uY29udGFpbnNTcGFjZSwgYml0ZmxhZ3M6IGluZm8uYml0ZmxhZ3MsIHNwYWNlU2VhcmNoZXM6IHNwYWNlU2VhcmNoZXN9XHJcbiAgfVxyXG5cclxuXHJcblxyXG4gIHZhciBnZXRQcmVwYXJlZCA9ICh0YXJnZXQpID0+IHtcclxuICAgIGlmKHRhcmdldC5sZW5ndGggPiA5OTkpIHJldHVybiBwcmVwYXJlKHRhcmdldCkgLy8gZG9uJ3QgY2FjaGUgaHVnZSB0YXJnZXRzXHJcbiAgICB2YXIgdGFyZ2V0UHJlcGFyZWQgPSBwcmVwYXJlZENhY2hlLmdldCh0YXJnZXQpXHJcbiAgICBpZih0YXJnZXRQcmVwYXJlZCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGFyZ2V0UHJlcGFyZWRcclxuICAgIHRhcmdldFByZXBhcmVkID0gcHJlcGFyZSh0YXJnZXQpXHJcbiAgICBwcmVwYXJlZENhY2hlLnNldCh0YXJnZXQsIHRhcmdldFByZXBhcmVkKVxyXG4gICAgcmV0dXJuIHRhcmdldFByZXBhcmVkXHJcbiAgfVxyXG4gIHZhciBnZXRQcmVwYXJlZFNlYXJjaCA9IChzZWFyY2gpID0+IHtcclxuICAgIGlmKHNlYXJjaC5sZW5ndGggPiA5OTkpIHJldHVybiBwcmVwYXJlU2VhcmNoKHNlYXJjaCkgLy8gZG9uJ3QgY2FjaGUgaHVnZSBzZWFyY2hlc1xyXG4gICAgdmFyIHNlYXJjaFByZXBhcmVkID0gcHJlcGFyZWRTZWFyY2hDYWNoZS5nZXQoc2VhcmNoKVxyXG4gICAgaWYoc2VhcmNoUHJlcGFyZWQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHNlYXJjaFByZXBhcmVkXHJcbiAgICBzZWFyY2hQcmVwYXJlZCA9IHByZXBhcmVTZWFyY2goc2VhcmNoKVxyXG4gICAgcHJlcGFyZWRTZWFyY2hDYWNoZS5zZXQoc2VhcmNoLCBzZWFyY2hQcmVwYXJlZClcclxuICAgIHJldHVybiBzZWFyY2hQcmVwYXJlZFxyXG4gIH1cclxuXHJcblxyXG4gIHZhciBhbGwgPSAodGFyZ2V0cywgb3B0aW9ucykgPT4ge1xyXG4gICAgdmFyIHJlc3VsdHMgPSBbXTsgcmVzdWx0cy50b3RhbCA9IHRhcmdldHMubGVuZ3RoIC8vIHRoaXMgdG90YWwgY2FuIGJlIHdyb25nIGlmIHNvbWUgdGFyZ2V0cyBhcmUgc2tpcHBlZFxyXG5cclxuICAgIHZhciBsaW1pdCA9IG9wdGlvbnM/LmxpbWl0IHx8IElORklOSVRZXHJcblxyXG4gICAgaWYob3B0aW9ucz8ua2V5KSB7XHJcbiAgICAgIGZvcih2YXIgaT0wO2k8dGFyZ2V0cy5sZW5ndGg7aSsrKSB7IHZhciBvYmogPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwgb3B0aW9ucy5rZXkpXHJcbiAgICAgICAgaWYodGFyZ2V0ID09IE5VTEwpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBuZXdfcmVzdWx0KHRhcmdldC50YXJnZXQsIHtfc2NvcmU6IHRhcmdldC5fc2NvcmUsIG9iajogb2JqfSlcclxuICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTsgaWYocmVzdWx0cy5sZW5ndGggPj0gbGltaXQpIHJldHVybiByZXN1bHRzXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZihvcHRpb25zPy5rZXlzKSB7XHJcbiAgICAgIGZvcih2YXIgaT0wO2k8dGFyZ2V0cy5sZW5ndGg7aSsrKSB7IHZhciBvYmogPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgdmFyIG9ialJlc3VsdHMgPSBuZXcgS2V5c1Jlc3VsdChvcHRpb25zLmtleXMubGVuZ3RoKVxyXG4gICAgICAgIGZvciAodmFyIGtleUkgPSBvcHRpb25zLmtleXMubGVuZ3RoIC0gMTsga2V5SSA+PSAwOyAtLWtleUkpIHtcclxuICAgICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIG9wdGlvbnMua2V5c1trZXlJXSlcclxuICAgICAgICAgIGlmKCF0YXJnZXQpIHsgb2JqUmVzdWx0c1trZXlJXSA9IG5vVGFyZ2V0OyBjb250aW51ZSB9XHJcbiAgICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcbiAgICAgICAgICB0YXJnZXQuX3Njb3JlID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgICAgIHRhcmdldC5faW5kZXhlcy5sZW4gPSAwXHJcbiAgICAgICAgICBvYmpSZXN1bHRzW2tleUldID0gdGFyZ2V0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9ialJlc3VsdHMub2JqID0gb2JqXHJcbiAgICAgICAgb2JqUmVzdWx0cy5fc2NvcmUgPSBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgICAgIHJlc3VsdHMucHVzaChvYmpSZXN1bHRzKTsgaWYocmVzdWx0cy5sZW5ndGggPj0gbGltaXQpIHJldHVybiByZXN1bHRzXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvcih2YXIgaT0wO2k8dGFyZ2V0cy5sZW5ndGg7aSsrKSB7IHZhciB0YXJnZXQgPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgaWYodGFyZ2V0ID09IE5VTEwpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG4gICAgICAgIHRhcmdldC5fc2NvcmUgPSBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgICAgIHRhcmdldC5faW5kZXhlcy5sZW4gPSAwXHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRhcmdldCk7IGlmKHJlc3VsdHMubGVuZ3RoID49IGxpbWl0KSByZXR1cm4gcmVzdWx0c1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdHNcclxuICB9XHJcblxyXG5cclxuICB2YXIgYWxnb3JpdGhtID0gKHByZXBhcmVkU2VhcmNoLCBwcmVwYXJlZCwgYWxsb3dTcGFjZXM9ZmFsc2UsIGFsbG93UGFydGlhbE1hdGNoPWZhbHNlKSA9PiB7XHJcbiAgICBpZihhbGxvd1NwYWNlcz09PWZhbHNlICYmIHByZXBhcmVkU2VhcmNoLmNvbnRhaW5zU3BhY2UpIHJldHVybiBhbGdvcml0aG1TcGFjZXMocHJlcGFyZWRTZWFyY2gsIHByZXBhcmVkLCBhbGxvd1BhcnRpYWxNYXRjaClcclxuXHJcbiAgICB2YXIgc2VhcmNoTG93ZXIgICAgICA9IHByZXBhcmVkU2VhcmNoLl9sb3dlclxyXG4gICAgdmFyIHNlYXJjaExvd2VyQ29kZXMgPSBwcmVwYXJlZFNlYXJjaC5sb3dlckNvZGVzXHJcbiAgICB2YXIgc2VhcmNoTG93ZXJDb2RlICA9IHNlYXJjaExvd2VyQ29kZXNbMF1cclxuICAgIHZhciB0YXJnZXRMb3dlckNvZGVzID0gcHJlcGFyZWQuX3RhcmdldExvd2VyQ29kZXNcclxuICAgIHZhciBzZWFyY2hMZW4gICAgICAgID0gc2VhcmNoTG93ZXJDb2Rlcy5sZW5ndGhcclxuICAgIHZhciB0YXJnZXRMZW4gICAgICAgID0gdGFyZ2V0TG93ZXJDb2Rlcy5sZW5ndGhcclxuICAgIHZhciBzZWFyY2hJICAgICAgICAgID0gMCAvLyB3aGVyZSB3ZSBhdFxyXG4gICAgdmFyIHRhcmdldEkgICAgICAgICAgPSAwIC8vIHdoZXJlIHlvdSBhdFxyXG4gICAgdmFyIG1hdGNoZXNTaW1wbGVMZW4gPSAwXHJcblxyXG4gICAgLy8gdmVyeSBiYXNpYyBmdXp6eSBtYXRjaDsgdG8gcmVtb3ZlIG5vbi1tYXRjaGluZyB0YXJnZXRzIEFTQVAhXHJcbiAgICAvLyB3YWxrIHRocm91Z2ggdGFyZ2V0LiBmaW5kIHNlcXVlbnRpYWwgbWF0Y2hlcy5cclxuICAgIC8vIGlmIGFsbCBjaGFycyBhcmVuJ3QgZm91bmQgdGhlbiBleGl0XHJcbiAgICBmb3IoOzspIHtcclxuICAgICAgdmFyIGlzTWF0Y2ggPSBzZWFyY2hMb3dlckNvZGUgPT09IHRhcmdldExvd2VyQ29kZXNbdGFyZ2V0SV1cclxuICAgICAgaWYoaXNNYXRjaCkge1xyXG4gICAgICAgIG1hdGNoZXNTaW1wbGVbbWF0Y2hlc1NpbXBsZUxlbisrXSA9IHRhcmdldElcclxuICAgICAgICArK3NlYXJjaEk7IGlmKHNlYXJjaEkgPT09IHNlYXJjaExlbikgYnJlYWtcclxuICAgICAgICBzZWFyY2hMb3dlckNvZGUgPSBzZWFyY2hMb3dlckNvZGVzW3NlYXJjaEldXHJcbiAgICAgIH1cclxuICAgICAgKyt0YXJnZXRJOyBpZih0YXJnZXRJID49IHRhcmdldExlbikgcmV0dXJuIE5VTEwgLy8gRmFpbGVkIHRvIGZpbmQgc2VhcmNoSVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzZWFyY2hJID0gMFxyXG4gICAgdmFyIHN1Y2Nlc3NTdHJpY3QgPSBmYWxzZVxyXG4gICAgdmFyIG1hdGNoZXNTdHJpY3RMZW4gPSAwXHJcblxyXG4gICAgdmFyIG5leHRCZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZWQuX25leHRCZWdpbm5pbmdJbmRleGVzXHJcbiAgICBpZihuZXh0QmVnaW5uaW5nSW5kZXhlcyA9PT0gTlVMTCkgbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBwcmVwYXJlZC5fbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBwcmVwYXJlTmV4dEJlZ2lubmluZ0luZGV4ZXMocHJlcGFyZWQudGFyZ2V0KVxyXG4gICAgdGFyZ2V0SSA9IG1hdGNoZXNTaW1wbGVbMF09PT0wID8gMCA6IG5leHRCZWdpbm5pbmdJbmRleGVzW21hdGNoZXNTaW1wbGVbMF0tMV1cclxuXHJcbiAgICAvLyBPdXIgdGFyZ2V0IHN0cmluZyBzdWNjZXNzZnVsbHkgbWF0Y2hlZCBhbGwgY2hhcmFjdGVycyBpbiBzZXF1ZW5jZSFcclxuICAgIC8vIExldCdzIHRyeSBhIG1vcmUgYWR2YW5jZWQgYW5kIHN0cmljdCB0ZXN0IHRvIGltcHJvdmUgdGhlIHNjb3JlXHJcbiAgICAvLyBvbmx5IGNvdW50IGl0IGFzIGEgbWF0Y2ggaWYgaXQncyBjb25zZWN1dGl2ZSBvciBhIGJlZ2lubmluZyBjaGFyYWN0ZXIhXHJcbiAgICB2YXIgYmFja3RyYWNrQ291bnQgPSAwXHJcbiAgICBpZih0YXJnZXRJICE9PSB0YXJnZXRMZW4pIGZvcig7Oykge1xyXG4gICAgICBpZih0YXJnZXRJID49IHRhcmdldExlbikge1xyXG4gICAgICAgIC8vIFdlIGZhaWxlZCB0byBmaW5kIGEgZ29vZCBzcG90IGZvciB0aGlzIHNlYXJjaCBjaGFyLCBnbyBiYWNrIHRvIHRoZSBwcmV2aW91cyBzZWFyY2ggY2hhciBhbmQgZm9yY2UgaXQgZm9yd2FyZFxyXG4gICAgICAgIGlmKHNlYXJjaEkgPD0gMCkgYnJlYWsgLy8gV2UgZmFpbGVkIHRvIHB1c2ggY2hhcnMgZm9yd2FyZCBmb3IgYSBiZXR0ZXIgbWF0Y2hcclxuXHJcbiAgICAgICAgKytiYWNrdHJhY2tDb3VudDsgaWYoYmFja3RyYWNrQ291bnQgPiAyMDApIGJyZWFrIC8vIGV4cG9uZW50aWFsIGJhY2t0cmFja2luZyBpcyB0YWtpbmcgdG9vIGxvbmcsIGp1c3QgZ2l2ZSB1cCBhbmQgcmV0dXJuIGEgYmFkIG1hdGNoXHJcblxyXG4gICAgICAgIC0tc2VhcmNoSVxyXG4gICAgICAgIHZhciBsYXN0TWF0Y2ggPSBtYXRjaGVzU3RyaWN0Wy0tbWF0Y2hlc1N0cmljdExlbl1cclxuICAgICAgICB0YXJnZXRJID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNbbGFzdE1hdGNoXVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgaXNNYXRjaCA9IHNlYXJjaExvd2VyQ29kZXNbc2VhcmNoSV0gPT09IHRhcmdldExvd2VyQ29kZXNbdGFyZ2V0SV1cclxuICAgICAgICBpZihpc01hdGNoKSB7XHJcbiAgICAgICAgICBtYXRjaGVzU3RyaWN0W21hdGNoZXNTdHJpY3RMZW4rK10gPSB0YXJnZXRJXHJcbiAgICAgICAgICArK3NlYXJjaEk7IGlmKHNlYXJjaEkgPT09IHNlYXJjaExlbikgeyBzdWNjZXNzU3RyaWN0ID0gdHJ1ZTsgYnJlYWsgfVxyXG4gICAgICAgICAgKyt0YXJnZXRJXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRhcmdldEkgPSBuZXh0QmVnaW5uaW5nSW5kZXhlc1t0YXJnZXRJXVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNoZWNrIGlmIGl0J3MgYSBzdWJzdHJpbmcgbWF0Y2hcclxuICAgIHZhciBzdWJzdHJpbmdJbmRleCA9IHNlYXJjaExlbiA8PSAxID8gLTEgOiBwcmVwYXJlZC5fdGFyZ2V0TG93ZXIuaW5kZXhPZihzZWFyY2hMb3dlciwgbWF0Y2hlc1NpbXBsZVswXSkgLy8gcGVyZjogdGhpcyBpcyBzbG93XHJcbiAgICB2YXIgaXNTdWJzdHJpbmcgPSAhIX5zdWJzdHJpbmdJbmRleFxyXG4gICAgdmFyIGlzU3Vic3RyaW5nQmVnaW5uaW5nID0gIWlzU3Vic3RyaW5nID8gZmFsc2UgOiBzdWJzdHJpbmdJbmRleD09PTAgfHwgcHJlcGFyZWQuX25leHRCZWdpbm5pbmdJbmRleGVzW3N1YnN0cmluZ0luZGV4LTFdID09PSBzdWJzdHJpbmdJbmRleFxyXG5cclxuICAgIC8vIGlmIGl0J3MgYSBzdWJzdHJpbmcgbWF0Y2ggYnV0IG5vdCBhdCBhIGJlZ2lubmluZyBpbmRleCwgbGV0J3MgdHJ5IHRvIGZpbmQgYSBzdWJzdHJpbmcgc3RhcnRpbmcgYXQgYSBiZWdpbm5pbmcgaW5kZXggZm9yIGEgYmV0dGVyIHNjb3JlXHJcbiAgICBpZihpc1N1YnN0cmluZyAmJiAhaXNTdWJzdHJpbmdCZWdpbm5pbmcpIHtcclxuICAgICAgZm9yKHZhciBpPTA7IGk8bmV4dEJlZ2lubmluZ0luZGV4ZXMubGVuZ3RoOyBpPW5leHRCZWdpbm5pbmdJbmRleGVzW2ldKSB7XHJcbiAgICAgICAgaWYoaSA8PSBzdWJzdHJpbmdJbmRleCkgY29udGludWVcclxuXHJcbiAgICAgICAgZm9yKHZhciBzPTA7IHM8c2VhcmNoTGVuOyBzKyspIGlmKHNlYXJjaExvd2VyQ29kZXNbc10gIT09IHByZXBhcmVkLl90YXJnZXRMb3dlckNvZGVzW2krc10pIGJyZWFrXHJcbiAgICAgICAgaWYocyA9PT0gc2VhcmNoTGVuKSB7IHN1YnN0cmluZ0luZGV4ID0gaTsgaXNTdWJzdHJpbmdCZWdpbm5pbmcgPSB0cnVlOyBicmVhayB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB0YWxseSB1cCB0aGUgc2NvcmUgJiBrZWVwIHRyYWNrIG9mIG1hdGNoZXMgZm9yIGhpZ2hsaWdodGluZyBsYXRlclxyXG4gICAgLy8gaWYgaXQncyBhIHNpbXBsZSBtYXRjaCwgd2UnbGwgc3dpdGNoIHRvIGEgc3Vic3RyaW5nIG1hdGNoIGlmIGEgc3Vic3RyaW5nIGV4aXN0c1xyXG4gICAgLy8gaWYgaXQncyBhIHN0cmljdCBtYXRjaCwgd2UnbGwgc3dpdGNoIHRvIGEgc3Vic3RyaW5nIG1hdGNoIG9ubHkgaWYgdGhhdCdzIGEgYmV0dGVyIHNjb3JlXHJcblxyXG4gICAgdmFyIGNhbGN1bGF0ZVNjb3JlID0gbWF0Y2hlcyA9PiB7XHJcbiAgICAgIHZhciBzY29yZSA9IDBcclxuXHJcbiAgICAgIHZhciBleHRyYU1hdGNoR3JvdXBDb3VudCA9IDBcclxuICAgICAgZm9yKHZhciBpID0gMTsgaSA8IHNlYXJjaExlbjsgKytpKSB7XHJcbiAgICAgICAgaWYobWF0Y2hlc1tpXSAtIG1hdGNoZXNbaS0xXSAhPT0gMSkge3Njb3JlIC09IG1hdGNoZXNbaV07ICsrZXh0cmFNYXRjaEdyb3VwQ291bnR9XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHVubWF0Y2hlZERpc3RhbmNlID0gbWF0Y2hlc1tzZWFyY2hMZW4tMV0gLSBtYXRjaGVzWzBdIC0gKHNlYXJjaExlbi0xKVxyXG5cclxuICAgICAgc2NvcmUgLT0gKDEyK3VubWF0Y2hlZERpc3RhbmNlKSAqIGV4dHJhTWF0Y2hHcm91cENvdW50IC8vIHBlbmFsaXR5IGZvciBtb3JlIGdyb3Vwc1xyXG5cclxuICAgICAgaWYobWF0Y2hlc1swXSAhPT0gMCkgc2NvcmUgLT0gbWF0Y2hlc1swXSptYXRjaGVzWzBdKi4yIC8vIHBlbmFsaXR5IGZvciBub3Qgc3RhcnRpbmcgbmVhciB0aGUgYmVnaW5uaW5nXHJcblxyXG4gICAgICBpZighc3VjY2Vzc1N0cmljdCkge1xyXG4gICAgICAgIHNjb3JlICo9IDEwMDBcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBzdWNjZXNzU3RyaWN0IG9uIGEgdGFyZ2V0IHdpdGggdG9vIG1hbnkgYmVnaW5uaW5nIGluZGV4ZXMgbG9zZXMgcG9pbnRzIGZvciBiZWluZyBhIGJhZCB0YXJnZXRcclxuICAgICAgICB2YXIgdW5pcXVlQmVnaW5uaW5nSW5kZXhlcyA9IDFcclxuICAgICAgICBmb3IodmFyIGkgPSBuZXh0QmVnaW5uaW5nSW5kZXhlc1swXTsgaSA8IHRhcmdldExlbjsgaT1uZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSkgKyt1bmlxdWVCZWdpbm5pbmdJbmRleGVzXHJcblxyXG4gICAgICAgIGlmKHVuaXF1ZUJlZ2lubmluZ0luZGV4ZXMgPiAyNCkgc2NvcmUgKj0gKHVuaXF1ZUJlZ2lubmluZ0luZGV4ZXMtMjQpKjEwIC8vIHF1aXRlIGFyYml0cmFyeSBudW1iZXJzIGhlcmUgLi4uXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNjb3JlIC09ICh0YXJnZXRMZW4gLSBzZWFyY2hMZW4pLzIgLy8gcGVuYWxpdHkgZm9yIGxvbmdlciB0YXJnZXRzXHJcblxyXG4gICAgICBpZihpc1N1YnN0cmluZykgICAgICAgICAgc2NvcmUgLz0gMStzZWFyY2hMZW4qc2VhcmNoTGVuKjEgLy8gYm9udXMgZm9yIGJlaW5nIGEgZnVsbCBzdWJzdHJpbmdcclxuICAgICAgaWYoaXNTdWJzdHJpbmdCZWdpbm5pbmcpIHNjb3JlIC89IDErc2VhcmNoTGVuKnNlYXJjaExlbioxIC8vIGJvbnVzIGZvciBzdWJzdHJpbmcgc3RhcnRpbmcgb24gYSBiZWdpbm5pbmdJbmRleFxyXG5cclxuICAgICAgc2NvcmUgLT0gKHRhcmdldExlbiAtIHNlYXJjaExlbikvMiAvLyBwZW5hbGl0eSBmb3IgbG9uZ2VyIHRhcmdldHNcclxuXHJcbiAgICAgIHJldHVybiBzY29yZVxyXG4gICAgfVxyXG5cclxuICAgIGlmKCFzdWNjZXNzU3RyaWN0KSB7XHJcbiAgICAgIGlmKGlzU3Vic3RyaW5nKSBmb3IodmFyIGk9MDsgaTxzZWFyY2hMZW47ICsraSkgbWF0Y2hlc1NpbXBsZVtpXSA9IHN1YnN0cmluZ0luZGV4K2kgLy8gYXQgdGhpcyBwb2ludCBpdCdzIHNhZmUgdG8gb3ZlcndyaXRlIG1hdGNoZWhzU2ltcGxlIHdpdGggc3Vic3RyIG1hdGNoZXNcclxuICAgICAgdmFyIG1hdGNoZXNCZXN0ID0gbWF0Y2hlc1NpbXBsZVxyXG4gICAgICB2YXIgc2NvcmUgPSBjYWxjdWxhdGVTY29yZShtYXRjaGVzQmVzdClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmKGlzU3Vic3RyaW5nQmVnaW5uaW5nKSB7XHJcbiAgICAgICAgZm9yKHZhciBpPTA7IGk8c2VhcmNoTGVuOyArK2kpIG1hdGNoZXNTaW1wbGVbaV0gPSBzdWJzdHJpbmdJbmRleCtpIC8vIGF0IHRoaXMgcG9pbnQgaXQncyBzYWZlIHRvIG92ZXJ3cml0ZSBtYXRjaGVoc1NpbXBsZSB3aXRoIHN1YnN0ciBtYXRjaGVzXHJcbiAgICAgICAgdmFyIG1hdGNoZXNCZXN0ID0gbWF0Y2hlc1NpbXBsZVxyXG4gICAgICAgIHZhciBzY29yZSA9IGNhbGN1bGF0ZVNjb3JlKG1hdGNoZXNTaW1wbGUpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIG1hdGNoZXNCZXN0ID0gbWF0Y2hlc1N0cmljdFxyXG4gICAgICAgIHZhciBzY29yZSA9IGNhbGN1bGF0ZVNjb3JlKG1hdGNoZXNTdHJpY3QpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcmVwYXJlZC5fc2NvcmUgPSBzY29yZVxyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzZWFyY2hMZW47ICsraSkgcHJlcGFyZWQuX2luZGV4ZXNbaV0gPSBtYXRjaGVzQmVzdFtpXVxyXG4gICAgcHJlcGFyZWQuX2luZGV4ZXMubGVuID0gc2VhcmNoTGVuXHJcblxyXG4gICAgY29uc3QgcmVzdWx0ICAgID0gbmV3IFJlc3VsdCgpXHJcbiAgICByZXN1bHQudGFyZ2V0ICAgPSBwcmVwYXJlZC50YXJnZXRcclxuICAgIHJlc3VsdC5fc2NvcmUgICA9IHByZXBhcmVkLl9zY29yZVxyXG4gICAgcmVzdWx0Ll9pbmRleGVzID0gcHJlcGFyZWQuX2luZGV4ZXNcclxuICAgIHJldHVybiByZXN1bHRcclxuICB9XHJcbiAgdmFyIGFsZ29yaXRobVNwYWNlcyA9IChwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0LCBhbGxvd1BhcnRpYWxNYXRjaCkgPT4ge1xyXG4gICAgdmFyIHNlZW5faW5kZXhlcyA9IG5ldyBTZXQoKVxyXG4gICAgdmFyIHNjb3JlID0gMFxyXG4gICAgdmFyIHJlc3VsdCA9IE5VTExcclxuXHJcbiAgICB2YXIgZmlyc3Rfc2Vlbl9pbmRleF9sYXN0X3NlYXJjaCA9IDBcclxuICAgIHZhciBzZWFyY2hlcyA9IHByZXBhcmVkU2VhcmNoLnNwYWNlU2VhcmNoZXNcclxuICAgIHZhciBzZWFyY2hlc0xlbiA9IHNlYXJjaGVzLmxlbmd0aFxyXG4gICAgdmFyIGNoYW5nZXNsZW4gPSAwXHJcblxyXG4gICAgLy8gUmV0dXJuIF9uZXh0QmVnaW5uaW5nSW5kZXhlcyBiYWNrIHRvIGl0cyBub3JtYWwgc3RhdGVcclxuICAgIHZhciByZXNldE5leHRCZWdpbm5pbmdJbmRleGVzID0gKCkgPT4ge1xyXG4gICAgICBmb3IobGV0IGk9Y2hhbmdlc2xlbi0xOyBpPj0wOyBpLS0pIHRhcmdldC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNbbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzW2kqMiArIDBdXSA9IG5leHRCZWdpbm5pbmdJbmRleGVzQ2hhbmdlc1tpKjIgKyAxXVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBoYXNBdExlYXN0MU1hdGNoID0gZmFsc2VcclxuICAgIGZvcih2YXIgaT0wOyBpPHNlYXJjaGVzTGVuOyArK2kpIHtcclxuICAgICAgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0gPSBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgICB2YXIgc2VhcmNoID0gc2VhcmNoZXNbaV1cclxuXHJcbiAgICAgIHJlc3VsdCA9IGFsZ29yaXRobShzZWFyY2gsIHRhcmdldClcclxuICAgICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2gpIHtcclxuICAgICAgICBpZihyZXN1bHQgPT09IE5VTEwpIGNvbnRpbnVlXHJcbiAgICAgICAgaGFzQXRMZWFzdDFNYXRjaCA9IHRydWVcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZihyZXN1bHQgPT09IE5VTEwpIHtyZXNldE5leHRCZWdpbm5pbmdJbmRleGVzKCk7IHJldHVybiBOVUxMfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpZiBub3QgdGhlIGxhc3Qgc2VhcmNoLCB3ZSBuZWVkIHRvIG11dGF0ZSBfbmV4dEJlZ2lubmluZ0luZGV4ZXMgZm9yIHRoZSBuZXh0IHNlYXJjaFxyXG4gICAgICB2YXIgaXNUaGVMYXN0U2VhcmNoID0gaSA9PT0gc2VhcmNoZXNMZW4gLSAxXHJcbiAgICAgIGlmKCFpc1RoZUxhc3RTZWFyY2gpIHtcclxuICAgICAgICB2YXIgaW5kZXhlcyA9IHJlc3VsdC5faW5kZXhlc1xyXG5cclxuICAgICAgICB2YXIgaW5kZXhlc0lzQ29uc2VjdXRpdmVTdWJzdHJpbmcgPSB0cnVlXHJcbiAgICAgICAgZm9yKGxldCBpPTA7IGk8aW5kZXhlcy5sZW4tMTsgaSsrKSB7XHJcbiAgICAgICAgICBpZihpbmRleGVzW2krMV0gLSBpbmRleGVzW2ldICE9PSAxKSB7XHJcbiAgICAgICAgICAgIGluZGV4ZXNJc0NvbnNlY3V0aXZlU3Vic3RyaW5nID0gZmFsc2U7IGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoaW5kZXhlc0lzQ29uc2VjdXRpdmVTdWJzdHJpbmcpIHtcclxuICAgICAgICAgIHZhciBuZXdCZWdpbm5pbmdJbmRleCA9IGluZGV4ZXNbaW5kZXhlcy5sZW4tMV0gKyAxXHJcbiAgICAgICAgICB2YXIgdG9SZXBsYWNlID0gdGFyZ2V0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlc1tuZXdCZWdpbm5pbmdJbmRleC0xXVxyXG4gICAgICAgICAgZm9yKGxldCBpPW5ld0JlZ2lubmluZ0luZGV4LTE7IGk+PTA7IGktLSkge1xyXG4gICAgICAgICAgICBpZih0b1JlcGxhY2UgIT09IHRhcmdldC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0pIGJyZWFrXHJcbiAgICAgICAgICAgIHRhcmdldC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0gPSBuZXdCZWdpbm5pbmdJbmRleFxyXG4gICAgICAgICAgICBuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXNbY2hhbmdlc2xlbioyICsgMF0gPSBpXHJcbiAgICAgICAgICAgIG5leHRCZWdpbm5pbmdJbmRleGVzQ2hhbmdlc1tjaGFuZ2VzbGVuKjIgKyAxXSA9IHRvUmVwbGFjZVxyXG4gICAgICAgICAgICBjaGFuZ2VzbGVuKytcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNjb3JlICs9IHJlc3VsdC5fc2NvcmUgLyBzZWFyY2hlc0xlblxyXG4gICAgICBhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA9IHJlc3VsdC5fc2NvcmUgLyBzZWFyY2hlc0xlblxyXG5cclxuICAgICAgLy8gZG9jayBwb2ludHMgYmFzZWQgb24gb3JkZXIgb3RoZXJ3aXNlIFwiYyBtYW5cIiByZXR1cm5zIE1hbmlmZXN0LmNwcCBpbnN0ZWFkIG9mIENoZWF0TWFuYWdlci5oXHJcbiAgICAgIGlmKHJlc3VsdC5faW5kZXhlc1swXSA8IGZpcnN0X3NlZW5faW5kZXhfbGFzdF9zZWFyY2gpIHtcclxuICAgICAgICBzY29yZSAtPSAoZmlyc3Rfc2Vlbl9pbmRleF9sYXN0X3NlYXJjaCAtIHJlc3VsdC5faW5kZXhlc1swXSkgKiAyXHJcbiAgICAgIH1cclxuICAgICAgZmlyc3Rfc2Vlbl9pbmRleF9sYXN0X3NlYXJjaCA9IHJlc3VsdC5faW5kZXhlc1swXVxyXG5cclxuICAgICAgZm9yKHZhciBqPTA7IGo8cmVzdWx0Ll9pbmRleGVzLmxlbjsgKytqKSBzZWVuX2luZGV4ZXMuYWRkKHJlc3VsdC5faW5kZXhlc1tqXSlcclxuICAgIH1cclxuXHJcbiAgICBpZihhbGxvd1BhcnRpYWxNYXRjaCAmJiAhaGFzQXRMZWFzdDFNYXRjaCkgcmV0dXJuIE5VTExcclxuXHJcbiAgICByZXNldE5leHRCZWdpbm5pbmdJbmRleGVzKClcclxuXHJcbiAgICAvLyBhbGxvd3MgYSBzZWFyY2ggd2l0aCBzcGFjZXMgdGhhdCdzIGFuIGV4YWN0IHN1YnN0cmluZyB0byBzY29yZSB3ZWxsXHJcbiAgICB2YXIgYWxsb3dTcGFjZXNSZXN1bHQgPSBhbGdvcml0aG0ocHJlcGFyZWRTZWFyY2gsIHRhcmdldCwgLyphbGxvd1NwYWNlcz0qL3RydWUpXHJcbiAgICBpZihhbGxvd1NwYWNlc1Jlc3VsdCAhPT0gTlVMTCAmJiBhbGxvd1NwYWNlc1Jlc3VsdC5fc2NvcmUgPiBzY29yZSkge1xyXG4gICAgICBpZihhbGxvd1BhcnRpYWxNYXRjaCkge1xyXG4gICAgICAgIGZvcih2YXIgaT0wOyBpPHNlYXJjaGVzTGVuOyArK2kpIHtcclxuICAgICAgICAgIGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldID0gYWxsb3dTcGFjZXNSZXN1bHQuX3Njb3JlIC8gc2VhcmNoZXNMZW5cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFsbG93U3BhY2VzUmVzdWx0XHJcbiAgICB9XHJcblxyXG4gICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2gpIHJlc3VsdCA9IHRhcmdldFxyXG4gICAgcmVzdWx0Ll9zY29yZSA9IHNjb3JlXHJcblxyXG4gICAgdmFyIGkgPSAwXHJcbiAgICBmb3IgKGxldCBpbmRleCBvZiBzZWVuX2luZGV4ZXMpIHJlc3VsdC5faW5kZXhlc1tpKytdID0gaW5kZXhcclxuICAgIHJlc3VsdC5faW5kZXhlcy5sZW4gPSBpXHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG4gIH1cclxuXHJcbiAgLy8gd2UgdXNlIHRoaXMgaW5zdGVhZCBvZiBqdXN0IC5ub3JtYWxpemUoJ05GRCcpLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csICcnKSBiZWNhdXNlIHRoYXQgc2NyZXdzIHdpdGggamFwYW5lc2UgY2hhcmFjdGVyc1xyXG4gIHZhciByZW1vdmVfYWNjZW50cyA9IChzdHIpID0+IHN0ci5yZXBsYWNlKC9cXHB7U2NyaXB0PUxhdGlufSsvZ3UsIG1hdGNoID0+IG1hdGNoLm5vcm1hbGl6ZSgnTkZEJykpLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csICcnKVxyXG5cclxuICB2YXIgcHJlcGFyZUxvd2VySW5mbyA9IChzdHIpID0+IHtcclxuICAgIHN0ciA9IHJlbW92ZV9hY2NlbnRzKHN0cilcclxuICAgIHZhciBzdHJMZW4gPSBzdHIubGVuZ3RoXHJcbiAgICB2YXIgbG93ZXIgPSBzdHIudG9Mb3dlckNhc2UoKVxyXG4gICAgdmFyIGxvd2VyQ29kZXMgPSBbXSAvLyBuZXcgQXJyYXkoc3RyTGVuKSAgICBzcGFyc2UgYXJyYXkgaXMgdG9vIHNsb3dcclxuICAgIHZhciBiaXRmbGFncyA9IDBcclxuICAgIHZhciBjb250YWluc1NwYWNlID0gZmFsc2UgLy8gc3BhY2UgaXNuJ3Qgc3RvcmVkIGluIGJpdGZsYWdzIGJlY2F1c2Ugb2YgaG93IHNlYXJjaGluZyB3aXRoIGEgc3BhY2Ugd29ya3NcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc3RyTGVuOyArK2kpIHtcclxuICAgICAgdmFyIGxvd2VyQ29kZSA9IGxvd2VyQ29kZXNbaV0gPSBsb3dlci5jaGFyQ29kZUF0KGkpXHJcblxyXG4gICAgICBpZihsb3dlckNvZGUgPT09IDMyKSB7XHJcbiAgICAgICAgY29udGFpbnNTcGFjZSA9IHRydWVcclxuICAgICAgICBjb250aW51ZSAvLyBpdCdzIGltcG9ydGFudCB0aGF0IHdlIGRvbid0IHNldCBhbnkgYml0ZmxhZ3MgZm9yIHNwYWNlXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBiaXQgPSBsb3dlckNvZGU+PTk3JiZsb3dlckNvZGU8PTEyMiA/IGxvd2VyQ29kZS05NyAvLyBhbHBoYWJldFxyXG4gICAgICAgICAgICAgIDogbG93ZXJDb2RlPj00OCYmbG93ZXJDb2RlPD01NyAgPyAyNiAgICAgICAgICAgLy8gbnVtYmVyc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMyBiaXRzIGF2YWlsYWJsZVxyXG4gICAgICAgICAgICAgIDogbG93ZXJDb2RlPD0xMjcgICAgICAgICAgICAgICAgPyAzMCAgICAgICAgICAgLy8gb3RoZXIgYXNjaWlcclxuICAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMzEgICAgICAgICAgIC8vIG90aGVyIHV0ZjhcclxuICAgICAgYml0ZmxhZ3MgfD0gMTw8Yml0XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtsb3dlckNvZGVzOmxvd2VyQ29kZXMsIGJpdGZsYWdzOmJpdGZsYWdzLCBjb250YWluc1NwYWNlOmNvbnRhaW5zU3BhY2UsIF9sb3dlcjpsb3dlcn1cclxuICB9XHJcbiAgdmFyIHByZXBhcmVCZWdpbm5pbmdJbmRleGVzID0gKHRhcmdldCkgPT4ge1xyXG4gICAgdmFyIHRhcmdldExlbiA9IHRhcmdldC5sZW5ndGhcclxuICAgIHZhciBiZWdpbm5pbmdJbmRleGVzID0gW107IHZhciBiZWdpbm5pbmdJbmRleGVzTGVuID0gMFxyXG4gICAgdmFyIHdhc1VwcGVyID0gZmFsc2VcclxuICAgIHZhciB3YXNBbHBoYW51bSA9IGZhbHNlXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0TGVuOyArK2kpIHtcclxuICAgICAgdmFyIHRhcmdldENvZGUgPSB0YXJnZXQuY2hhckNvZGVBdChpKVxyXG4gICAgICB2YXIgaXNVcHBlciA9IHRhcmdldENvZGU+PTY1JiZ0YXJnZXRDb2RlPD05MFxyXG4gICAgICB2YXIgaXNBbHBoYW51bSA9IGlzVXBwZXIgfHwgdGFyZ2V0Q29kZT49OTcmJnRhcmdldENvZGU8PTEyMiB8fCB0YXJnZXRDb2RlPj00OCYmdGFyZ2V0Q29kZTw9NTdcclxuICAgICAgdmFyIGlzQmVnaW5uaW5nID0gaXNVcHBlciAmJiAhd2FzVXBwZXIgfHwgIXdhc0FscGhhbnVtIHx8ICFpc0FscGhhbnVtXHJcbiAgICAgIHdhc1VwcGVyID0gaXNVcHBlclxyXG4gICAgICB3YXNBbHBoYW51bSA9IGlzQWxwaGFudW1cclxuICAgICAgaWYoaXNCZWdpbm5pbmcpIGJlZ2lubmluZ0luZGV4ZXNbYmVnaW5uaW5nSW5kZXhlc0xlbisrXSA9IGlcclxuICAgIH1cclxuICAgIHJldHVybiBiZWdpbm5pbmdJbmRleGVzXHJcbiAgfVxyXG4gIHZhciBwcmVwYXJlTmV4dEJlZ2lubmluZ0luZGV4ZXMgPSAodGFyZ2V0KSA9PiB7XHJcbiAgICB0YXJnZXQgPSByZW1vdmVfYWNjZW50cyh0YXJnZXQpXHJcbiAgICB2YXIgdGFyZ2V0TGVuID0gdGFyZ2V0Lmxlbmd0aFxyXG4gICAgdmFyIGJlZ2lubmluZ0luZGV4ZXMgPSBwcmVwYXJlQmVnaW5uaW5nSW5kZXhlcyh0YXJnZXQpXHJcbiAgICB2YXIgbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBbXSAvLyBuZXcgQXJyYXkodGFyZ2V0TGVuKSAgICAgc3BhcnNlIGFycmF5IGlzIHRvbyBzbG93XHJcbiAgICB2YXIgbGFzdElzQmVnaW5uaW5nID0gYmVnaW5uaW5nSW5kZXhlc1swXVxyXG4gICAgdmFyIGxhc3RJc0JlZ2lubmluZ0kgPSAwXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0TGVuOyArK2kpIHtcclxuICAgICAgaWYobGFzdElzQmVnaW5uaW5nID4gaSkge1xyXG4gICAgICAgIG5leHRCZWdpbm5pbmdJbmRleGVzW2ldID0gbGFzdElzQmVnaW5uaW5nXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGFzdElzQmVnaW5uaW5nID0gYmVnaW5uaW5nSW5kZXhlc1srK2xhc3RJc0JlZ2lubmluZ0ldXHJcbiAgICAgICAgbmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0gPSBsYXN0SXNCZWdpbm5pbmc9PT11bmRlZmluZWQgPyB0YXJnZXRMZW4gOiBsYXN0SXNCZWdpbm5pbmdcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5leHRCZWdpbm5pbmdJbmRleGVzXHJcbiAgfVxyXG5cclxuICB2YXIgcHJlcGFyZWRDYWNoZSAgICAgICA9IG5ldyBNYXAoKVxyXG4gIHZhciBwcmVwYXJlZFNlYXJjaENhY2hlID0gbmV3IE1hcCgpXHJcblxyXG4gIC8vIHRoZSB0aGVvcnkgYmVoaW5kIHRoZXNlIGJlaW5nIGdsb2JhbHMgaXMgdG8gcmVkdWNlIGdhcmJhZ2UgY29sbGVjdGlvbiBieSBub3QgbWFraW5nIG5ldyBhcnJheXNcclxuICB2YXIgbWF0Y2hlc1NpbXBsZSA9IFtdOyB2YXIgbWF0Y2hlc1N0cmljdCA9IFtdXHJcbiAgdmFyIG5leHRCZWdpbm5pbmdJbmRleGVzQ2hhbmdlcyA9IFtdIC8vIGFsbG93cyBzdHJhdyBiZXJyeSB0byBtYXRjaCBzdHJhd2JlcnJ5IHdlbGwsIGJ5IG1vZGlmeWluZyB0aGUgZW5kIG9mIGEgc3Vic3RyaW5nIHRvIGJlIGNvbnNpZGVyZWQgYSBiZWdpbm5pbmcgaW5kZXggZm9yIHRoZSByZXN0IG9mIHRoZSBzZWFyY2hcclxuICB2YXIga2V5c1NwYWNlc0Jlc3RTY29yZXMgPSBbXTsgdmFyIGFsbG93UGFydGlhbE1hdGNoU2NvcmVzID0gW11cclxuICB2YXIgdG1wVGFyZ2V0cyA9IFtdOyB2YXIgdG1wUmVzdWx0cyA9IFtdXHJcblxyXG4gIC8vIHByb3AgPSAna2V5JyAgICAgICAgICAgICAgICAgIDIuNW1zIG9wdGltaXplZCBmb3IgdGhpcyBjYXNlLCBzZWVtcyB0byBiZSBhYm91dCBhcyBmYXN0IGFzIGRpcmVjdCBvYmpbcHJvcF1cclxuICAvLyBwcm9wID0gJ2tleTEua2V5MicgICAgICAgICAgICAxMG1zXHJcbiAgLy8gcHJvcCA9IFsna2V5MScsICdrZXkyJ10gICAgICAgMjdtc1xyXG4gIC8vIHByb3AgPSBvYmogPT4gb2JqLnRhZ3Muam9pbigpID8/bXNcclxuICB2YXIgZ2V0VmFsdWUgPSAob2JqLCBwcm9wKSA9PiB7XHJcbiAgICB2YXIgdG1wID0gb2JqW3Byb3BdOyBpZih0bXAgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRtcFxyXG4gICAgaWYodHlwZW9mIHByb3AgPT09ICdmdW5jdGlvbicpIHJldHVybiBwcm9wKG9iaikgLy8gdGhpcyBzaG91bGQgcnVuIGZpcnN0LiBidXQgdGhhdCBtYWtlcyBzdHJpbmcgcHJvcHMgc2xvd2VyXHJcbiAgICB2YXIgc2VncyA9IHByb3BcclxuICAgIGlmKCFBcnJheS5pc0FycmF5KHByb3ApKSBzZWdzID0gcHJvcC5zcGxpdCgnLicpXHJcbiAgICB2YXIgbGVuID0gc2Vncy5sZW5ndGhcclxuICAgIHZhciBpID0gLTFcclxuICAgIHdoaWxlIChvYmogJiYgKCsraSA8IGxlbikpIG9iaiA9IG9ialtzZWdzW2ldXVxyXG4gICAgcmV0dXJuIG9ialxyXG4gIH1cclxuXHJcbiAgdmFyIGlzUHJlcGFyZWQgPSAoeCkgPT4geyByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnICYmIHR5cGVvZiB4Ll9iaXRmbGFncyA9PT0gJ251bWJlcicgfVxyXG4gIHZhciBJTkZJTklUWSA9IEluZmluaXR5OyB2YXIgTkVHQVRJVkVfSU5GSU5JVFkgPSAtSU5GSU5JVFlcclxuICB2YXIgbm9SZXN1bHRzID0gW107IG5vUmVzdWx0cy50b3RhbCA9IDBcclxuICB2YXIgTlVMTCA9IG51bGxcclxuXHJcbiAgdmFyIG5vVGFyZ2V0ID0gcHJlcGFyZSgnJylcclxuXHJcbiAgLy8gSGFja2VkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2xlbWlyZS9GYXN0UHJpb3JpdHlRdWV1ZS5qc1xyXG4gIHZhciBmYXN0cHJpb3JpdHlxdWV1ZT1yPT57dmFyIGU9W10sbz0wLGE9e30sdj1yPT57Zm9yKHZhciBhPTAsdj1lW2FdLGM9MTtjPG87KXt2YXIgcz1jKzE7YT1jLHM8byYmZVtzXS5fc2NvcmU8ZVtjXS5fc2NvcmUmJihhPXMpLGVbYS0xPj4xXT1lW2FdLGM9MSsoYTw8MSl9Zm9yKHZhciBmPWEtMT4+MTthPjAmJnYuX3Njb3JlPGVbZl0uX3Njb3JlO2Y9KGE9ZiktMT4+MSllW2FdPWVbZl07ZVthXT12fTtyZXR1cm4gYS5hZGQ9KHI9Pnt2YXIgYT1vO2VbbysrXT1yO2Zvcih2YXIgdj1hLTE+PjE7YT4wJiZyLl9zY29yZTxlW3ZdLl9zY29yZTt2PShhPXYpLTE+PjEpZVthXT1lW3ZdO2VbYV09cn0pLGEucG9sbD0ocj0+e2lmKDAhPT1vKXt2YXIgYT1lWzBdO3JldHVybiBlWzBdPWVbLS1vXSx2KCksYX19KSxhLnBlZWs9KHI9PntpZigwIT09bylyZXR1cm4gZVswXX0pLGEucmVwbGFjZVRvcD0ocj0+e2VbMF09cix2KCl9KSxhfVxyXG4gIHZhciBxID0gZmFzdHByaW9yaXR5cXVldWUoKSAvLyByZXVzZSB0aGlzXHJcblxyXG4gIC8vIGZ1enp5c29ydCBpcyB3cml0dGVuIHRoaXMgd2F5IGZvciBtaW5pZmljYXRpb24uIGFsbCBuYW1lcyBhcmUgbWFuZ2VsZWQgdW5sZXNzIHF1b3RlZFxyXG4gIHJldHVybiB7J3NpbmdsZSc6c2luZ2xlLCAnZ28nOmdvLCAncHJlcGFyZSc6cHJlcGFyZSwgJ2NsZWFudXAnOmNsZWFudXB9XHJcbn0pIC8vIFVNRFxyXG4iLCAiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTcgR29vZ2xlIExMQ1xuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEJTRC0zLUNsYXVzZVxuICovXG5cbi8vIElNUE9SVEFOVDogdGhlc2UgaW1wb3J0cyBtdXN0IGJlIHR5cGUtb25seVxuaW1wb3J0IHR5cGUge0RpcmVjdGl2ZSwgRGlyZWN0aXZlUmVzdWx0LCBQYXJ0SW5mb30gZnJvbSAnLi9kaXJlY3RpdmUuanMnO1xuaW1wb3J0IHR5cGUge1RydXN0ZWRIVE1MLCBUcnVzdGVkVHlwZXNXaW5kb3d9IGZyb20gJ3RydXN0ZWQtdHlwZXMvbGliJztcblxuY29uc3QgREVWX01PREUgPSB0cnVlO1xuY29uc3QgRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTID0gdHJ1ZTtcbmNvbnN0IEVOQUJMRV9TSEFEWURPTV9OT1BBVENIID0gdHJ1ZTtcbmNvbnN0IE5PREVfTU9ERSA9IGZhbHNlO1xuXG4vLyBBbGxvd3MgbWluaWZpZXJzIHRvIHJlbmFtZSByZWZlcmVuY2VzIHRvIGdsb2JhbFRoaXNcbmNvbnN0IGdsb2JhbCA9IGdsb2JhbFRoaXM7XG5cbi8qKlxuICogQ29udGFpbnMgdHlwZXMgdGhhdCBhcmUgcGFydCBvZiB0aGUgdW5zdGFibGUgZGVidWcgQVBJLlxuICpcbiAqIEV2ZXJ5dGhpbmcgaW4gdGhpcyBBUEkgaXMgbm90IHN0YWJsZSBhbmQgbWF5IGNoYW5nZSBvciBiZSByZW1vdmVkIGluIHRoZSBmdXR1cmUsXG4gKiBldmVuIG9uIHBhdGNoIHJlbGVhc2VzLlxuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5hbWVzcGFjZVxuZXhwb3J0IG5hbWVzcGFjZSBMaXRVbnN0YWJsZSB7XG4gIC8qKlxuICAgKiBXaGVuIExpdCBpcyBydW5uaW5nIGluIGRldiBtb2RlIGFuZCBgd2luZG93LmVtaXRMaXREZWJ1Z0xvZ0V2ZW50c2AgaXMgdHJ1ZSxcbiAgICogd2Ugd2lsbCBlbWl0ICdsaXQtZGVidWcnIGV2ZW50cyB0byB3aW5kb3csIHdpdGggbGl2ZSBkZXRhaWxzIGFib3V0IHRoZSB1cGRhdGUgYW5kIHJlbmRlclxuICAgKiBsaWZlY3ljbGUuIFRoZXNlIGNhbiBiZSB1c2VmdWwgZm9yIHdyaXRpbmcgZGVidWcgdG9vbGluZyBhbmQgdmlzdWFsaXphdGlvbnMuXG4gICAqXG4gICAqIFBsZWFzZSBiZSBhd2FyZSB0aGF0IHJ1bm5pbmcgd2l0aCB3aW5kb3cuZW1pdExpdERlYnVnTG9nRXZlbnRzIGhhcyBwZXJmb3JtYW5jZSBvdmVyaGVhZCxcbiAgICogbWFraW5nIGNlcnRhaW4gb3BlcmF0aW9ucyB0aGF0IGFyZSBub3JtYWxseSB2ZXJ5IGNoZWFwIChsaWtlIGEgbm8tb3AgcmVuZGVyKSBtdWNoIHNsb3dlcixcbiAgICogYmVjYXVzZSB3ZSBtdXN0IGNvcHkgZGF0YSBhbmQgZGlzcGF0Y2ggZXZlbnRzLlxuICAgKi9cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1uYW1lc3BhY2VcbiAgZXhwb3J0IG5hbWVzcGFjZSBEZWJ1Z0xvZyB7XG4gICAgZXhwb3J0IHR5cGUgRW50cnkgPVxuICAgICAgfCBUZW1wbGF0ZVByZXBcbiAgICAgIHwgVGVtcGxhdGVJbnN0YW50aWF0ZWRcbiAgICAgIHwgVGVtcGxhdGVJbnN0YW50aWF0ZWRBbmRVcGRhdGVkXG4gICAgICB8IFRlbXBsYXRlVXBkYXRpbmdcbiAgICAgIHwgQmVnaW5SZW5kZXJcbiAgICAgIHwgRW5kUmVuZGVyXG4gICAgICB8IENvbW1pdFBhcnRFbnRyeVxuICAgICAgfCBTZXRQYXJ0VmFsdWU7XG4gICAgZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZVByZXAge1xuICAgICAga2luZDogJ3RlbXBsYXRlIHByZXAnO1xuICAgICAgdGVtcGxhdGU6IFRlbXBsYXRlO1xuICAgICAgc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXk7XG4gICAgICBjbG9uYWJsZVRlbXBsYXRlOiBIVE1MVGVtcGxhdGVFbGVtZW50O1xuICAgICAgcGFydHM6IFRlbXBsYXRlUGFydFtdO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIEJlZ2luUmVuZGVyIHtcbiAgICAgIGtpbmQ6ICdiZWdpbiByZW5kZXInO1xuICAgICAgaWQ6IG51bWJlcjtcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgY29udGFpbmVyOiBIVE1MRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQ7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgcGFydDogQ2hpbGRQYXJ0IHwgdW5kZWZpbmVkO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIEVuZFJlbmRlciB7XG4gICAgICBraW5kOiAnZW5kIHJlbmRlcic7XG4gICAgICBpZDogbnVtYmVyO1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBjb250YWluZXI6IEhUTUxFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudDtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBwYXJ0OiBDaGlsZFBhcnQ7XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGVJbnN0YW50aWF0ZWQge1xuICAgICAga2luZDogJ3RlbXBsYXRlIGluc3RhbnRpYXRlZCc7XG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBDb21waWxlZFRlbXBsYXRlO1xuICAgICAgaW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2U7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgZnJhZ21lbnQ6IE5vZGU7XG4gICAgICBwYXJ0czogQXJyYXk8UGFydCB8IHVuZGVmaW5lZD47XG4gICAgICB2YWx1ZXM6IHVua25vd25bXTtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZUluc3RhbnRpYXRlZEFuZFVwZGF0ZWQge1xuICAgICAga2luZDogJ3RlbXBsYXRlIGluc3RhbnRpYXRlZCBhbmQgdXBkYXRlZCc7XG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBDb21waWxlZFRlbXBsYXRlO1xuICAgICAgaW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2U7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgZnJhZ21lbnQ6IE5vZGU7XG4gICAgICBwYXJ0czogQXJyYXk8UGFydCB8IHVuZGVmaW5lZD47XG4gICAgICB2YWx1ZXM6IHVua25vd25bXTtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZVVwZGF0aW5nIHtcbiAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSB1cGRhdGluZyc7XG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBDb21waWxlZFRlbXBsYXRlO1xuICAgICAgaW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2U7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgcGFydHM6IEFycmF5PFBhcnQgfCB1bmRlZmluZWQ+O1xuICAgICAgdmFsdWVzOiB1bmtub3duW107XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgU2V0UGFydFZhbHVlIHtcbiAgICAgIGtpbmQ6ICdzZXQgcGFydCc7XG4gICAgICBwYXJ0OiBQYXJ0O1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICB2YWx1ZUluZGV4OiBudW1iZXI7XG4gICAgICB2YWx1ZXM6IHVua25vd25bXTtcbiAgICAgIHRlbXBsYXRlSW5zdGFuY2U6IFRlbXBsYXRlSW5zdGFuY2U7XG4gICAgfVxuXG4gICAgZXhwb3J0IHR5cGUgQ29tbWl0UGFydEVudHJ5ID1cbiAgICAgIHwgQ29tbWl0Tm90aGluZ1RvQ2hpbGRFbnRyeVxuICAgICAgfCBDb21taXRUZXh0XG4gICAgICB8IENvbW1pdE5vZGVcbiAgICAgIHwgQ29tbWl0QXR0cmlidXRlXG4gICAgICB8IENvbW1pdFByb3BlcnR5XG4gICAgICB8IENvbW1pdEJvb2xlYW5BdHRyaWJ1dGVcbiAgICAgIHwgQ29tbWl0RXZlbnRMaXN0ZW5lclxuICAgICAgfCBDb21taXRUb0VsZW1lbnRCaW5kaW5nO1xuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXROb3RoaW5nVG9DaGlsZEVudHJ5IHtcbiAgICAgIGtpbmQ6ICdjb21taXQgbm90aGluZyB0byBjaGlsZCc7XG4gICAgICBzdGFydDogQ2hpbGROb2RlO1xuICAgICAgZW5kOiBDaGlsZE5vZGUgfCBudWxsO1xuICAgICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSB8IHVuZGVmaW5lZDtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRUZXh0IHtcbiAgICAgIGtpbmQ6ICdjb21taXQgdGV4dCc7XG4gICAgICBub2RlOiBUZXh0O1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0Tm9kZSB7XG4gICAgICBraW5kOiAnY29tbWl0IG5vZGUnO1xuICAgICAgc3RhcnQ6IE5vZGU7XG4gICAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlIHwgdW5kZWZpbmVkO1xuICAgICAgdmFsdWU6IE5vZGU7XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0QXR0cmlidXRlIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgYXR0cmlidXRlJztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRQcm9wZXJ0eSB7XG4gICAgICBraW5kOiAnY29tbWl0IHByb3BlcnR5JztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRCb29sZWFuQXR0cmlidXRlIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgYm9vbGVhbiBhdHRyaWJ1dGUnO1xuICAgICAgZWxlbWVudDogRWxlbWVudDtcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgIHZhbHVlOiBib29sZWFuO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdEV2ZW50TGlzdGVuZXIge1xuICAgICAga2luZDogJ2NvbW1pdCBldmVudCBsaXN0ZW5lcic7XG4gICAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBvbGRMaXN0ZW5lcjogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICAvLyBUcnVlIGlmIHdlJ3JlIHJlbW92aW5nIHRoZSBvbGQgZXZlbnQgbGlzdGVuZXIgKGUuZy4gYmVjYXVzZSBzZXR0aW5ncyBjaGFuZ2VkLCBvciB2YWx1ZSBpcyBub3RoaW5nKVxuICAgICAgcmVtb3ZlTGlzdGVuZXI6IGJvb2xlYW47XG4gICAgICAvLyBUcnVlIGlmIHdlJ3JlIGFkZGluZyBhIG5ldyBldmVudCBsaXN0ZW5lciAoZS5nLiBiZWNhdXNlIGZpcnN0IHJlbmRlciwgb3Igc2V0dGluZ3MgY2hhbmdlZClcbiAgICAgIGFkZExpc3RlbmVyOiBib29sZWFuO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0VG9FbGVtZW50QmluZGluZyB7XG4gICAgICBraW5kOiAnY29tbWl0IHRvIGVsZW1lbnQgYmluZGluZyc7XG4gICAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxufVxuXG5pbnRlcmZhY2UgRGVidWdMb2dnaW5nV2luZG93IHtcbiAgLy8gRXZlbiBpbiBkZXYgbW9kZSwgd2UgZ2VuZXJhbGx5IGRvbid0IHdhbnQgdG8gZW1pdCB0aGVzZSBldmVudHMsIGFzIHRoYXQnc1xuICAvLyBhbm90aGVyIGxldmVsIG9mIGNvc3QsIHNvIG9ubHkgZW1pdCB0aGVtIHdoZW4gREVWX01PREUgaXMgdHJ1ZSBfYW5kXyB3aGVuXG4gIC8vIHdpbmRvdy5lbWl0TGl0RGVidWdFdmVudHMgaXMgdHJ1ZS5cbiAgZW1pdExpdERlYnVnTG9nRXZlbnRzPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBVc2VmdWwgZm9yIHZpc3VhbGl6aW5nIGFuZCBsb2dnaW5nIGluc2lnaHRzIGludG8gd2hhdCB0aGUgTGl0IHRlbXBsYXRlIHN5c3RlbSBpcyBkb2luZy5cbiAqXG4gKiBDb21waWxlZCBvdXQgb2YgcHJvZCBtb2RlIGJ1aWxkcy5cbiAqL1xuY29uc3QgZGVidWdMb2dFdmVudCA9IERFVl9NT0RFXG4gID8gKGV2ZW50OiBMaXRVbnN0YWJsZS5EZWJ1Z0xvZy5FbnRyeSkgPT4ge1xuICAgICAgY29uc3Qgc2hvdWxkRW1pdCA9IChnbG9iYWwgYXMgdW5rbm93biBhcyBEZWJ1Z0xvZ2dpbmdXaW5kb3cpXG4gICAgICAgIC5lbWl0TGl0RGVidWdMb2dFdmVudHM7XG4gICAgICBpZiAoIXNob3VsZEVtaXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZ2xvYmFsLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudDxMaXRVbnN0YWJsZS5EZWJ1Z0xvZy5FbnRyeT4oJ2xpdC1kZWJ1ZycsIHtcbiAgICAgICAgICBkZXRhaWw6IGV2ZW50LFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gIDogdW5kZWZpbmVkO1xuLy8gVXNlZCBmb3IgY29ubmVjdGluZyBiZWdpblJlbmRlciBhbmQgZW5kUmVuZGVyIGV2ZW50cyB3aGVuIHRoZXJlIGFyZSBuZXN0ZWRcbi8vIHJlbmRlcnMgd2hlbiBlcnJvcnMgYXJlIHRocm93biBwcmV2ZW50aW5nIGFuIGVuZFJlbmRlciBldmVudCBmcm9tIGJlaW5nXG4vLyBjYWxsZWQuXG5sZXQgZGVidWdMb2dSZW5kZXJJZCA9IDA7XG5cbmxldCBpc3N1ZVdhcm5pbmc6IChjb2RlOiBzdHJpbmcsIHdhcm5pbmc6IHN0cmluZykgPT4gdm9pZDtcblxuaWYgKERFVl9NT0RFKSB7XG4gIGdsb2JhbC5saXRJc3N1ZWRXYXJuaW5ncyA/Pz0gbmV3IFNldCgpO1xuXG4gIC8vIElzc3VlIGEgd2FybmluZywgaWYgd2UgaGF2ZW4ndCBhbHJlYWR5LlxuICBpc3N1ZVdhcm5pbmcgPSAoY29kZTogc3RyaW5nLCB3YXJuaW5nOiBzdHJpbmcpID0+IHtcbiAgICB3YXJuaW5nICs9IGNvZGVcbiAgICAgID8gYCBTZWUgaHR0cHM6Ly9saXQuZGV2L21zZy8ke2NvZGV9IGZvciBtb3JlIGluZm9ybWF0aW9uLmBcbiAgICAgIDogJyc7XG4gICAgaWYgKCFnbG9iYWwubGl0SXNzdWVkV2FybmluZ3MhLmhhcyh3YXJuaW5nKSkge1xuICAgICAgY29uc29sZS53YXJuKHdhcm5pbmcpO1xuICAgICAgZ2xvYmFsLmxpdElzc3VlZFdhcm5pbmdzIS5hZGQod2FybmluZyk7XG4gICAgfVxuICB9O1xuXG4gIGlzc3VlV2FybmluZyhcbiAgICAnZGV2LW1vZGUnLFxuICAgIGBMaXQgaXMgaW4gZGV2IG1vZGUuIE5vdCByZWNvbW1lbmRlZCBmb3IgcHJvZHVjdGlvbiFgXG4gICk7XG59XG5cbmNvbnN0IHdyYXAgPVxuICBFTkFCTEVfU0hBRFlET01fTk9QQVRDSCAmJlxuICBnbG9iYWwuU2hhZHlET00/LmluVXNlICYmXG4gIGdsb2JhbC5TaGFkeURPTT8ubm9QYXRjaCA9PT0gdHJ1ZVxuICAgID8gKGdsb2JhbC5TaGFkeURPTSEud3JhcCBhcyA8VCBleHRlbmRzIE5vZGU+KG5vZGU6IFQpID0+IFQpXG4gICAgOiA8VCBleHRlbmRzIE5vZGU+KG5vZGU6IFQpID0+IG5vZGU7XG5cbmNvbnN0IHRydXN0ZWRUeXBlcyA9IChnbG9iYWwgYXMgdW5rbm93biBhcyBUcnVzdGVkVHlwZXNXaW5kb3cpLnRydXN0ZWRUeXBlcztcblxuLyoqXG4gKiBPdXIgVHJ1c3RlZFR5cGVQb2xpY3kgZm9yIEhUTUwgd2hpY2ggaXMgZGVjbGFyZWQgdXNpbmcgdGhlIGh0bWwgdGVtcGxhdGVcbiAqIHRhZyBmdW5jdGlvbi5cbiAqXG4gKiBUaGF0IEhUTUwgaXMgYSBkZXZlbG9wZXItYXV0aG9yZWQgY29uc3RhbnQsIGFuZCBpcyBwYXJzZWQgd2l0aCBpbm5lckhUTUxcbiAqIGJlZm9yZSBhbnkgdW50cnVzdGVkIGV4cHJlc3Npb25zIGhhdmUgYmVlbiBtaXhlZCBpbi4gVGhlcmVmb3IgaXQgaXNcbiAqIGNvbnNpZGVyZWQgc2FmZSBieSBjb25zdHJ1Y3Rpb24uXG4gKi9cbmNvbnN0IHBvbGljeSA9IHRydXN0ZWRUeXBlc1xuICA/IHRydXN0ZWRUeXBlcy5jcmVhdGVQb2xpY3koJ2xpdC1odG1sJywge1xuICAgICAgY3JlYXRlSFRNTDogKHMpID0+IHMsXG4gICAgfSlcbiAgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVXNlZCB0byBzYW5pdGl6ZSBhbnkgdmFsdWUgYmVmb3JlIGl0IGlzIHdyaXR0ZW4gaW50byB0aGUgRE9NLiBUaGlzIGNhbiBiZVxuICogdXNlZCB0byBpbXBsZW1lbnQgYSBzZWN1cml0eSBwb2xpY3kgb2YgYWxsb3dlZCBhbmQgZGlzYWxsb3dlZCB2YWx1ZXMgaW5cbiAqIG9yZGVyIHRvIHByZXZlbnQgWFNTIGF0dGFja3MuXG4gKlxuICogT25lIHdheSBvZiB1c2luZyB0aGlzIGNhbGxiYWNrIHdvdWxkIGJlIHRvIGNoZWNrIGF0dHJpYnV0ZXMgYW5kIHByb3BlcnRpZXNcbiAqIGFnYWluc3QgYSBsaXN0IG9mIGhpZ2ggcmlzayBmaWVsZHMsIGFuZCByZXF1aXJlIHRoYXQgdmFsdWVzIHdyaXR0ZW4gdG8gc3VjaFxuICogZmllbGRzIGJlIGluc3RhbmNlcyBvZiBhIGNsYXNzIHdoaWNoIGlzIHNhZmUgYnkgY29uc3RydWN0aW9uLiBDbG9zdXJlJ3MgU2FmZVxuICogSFRNTCBUeXBlcyBpcyBvbmUgaW1wbGVtZW50YXRpb24gb2YgdGhpcyB0ZWNobmlxdWUgKFxuICogaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9zYWZlLWh0bWwtdHlwZXMvYmxvYi9tYXN0ZXIvZG9jL3NhZmVodG1sLXR5cGVzLm1kKS5cbiAqIFRoZSBUcnVzdGVkVHlwZXMgcG9seWZpbGwgaW4gQVBJLW9ubHkgbW9kZSBjb3VsZCBhbHNvIGJlIHVzZWQgYXMgYSBiYXNpc1xuICogZm9yIHRoaXMgdGVjaG5pcXVlIChodHRwczovL2dpdGh1Yi5jb20vV0lDRy90cnVzdGVkLXR5cGVzKS5cbiAqXG4gKiBAcGFyYW0gbm9kZSBUaGUgSFRNTCBub2RlICh1c3VhbGx5IGVpdGhlciBhICN0ZXh0IG5vZGUgb3IgYW4gRWxlbWVudCkgdGhhdFxuICogICAgIGlzIGJlaW5nIHdyaXR0ZW4gdG8uIE5vdGUgdGhhdCB0aGlzIGlzIGp1c3QgYW4gZXhlbXBsYXIgbm9kZSwgdGhlIHdyaXRlXG4gKiAgICAgbWF5IHRha2UgcGxhY2UgYWdhaW5zdCBhbm90aGVyIGluc3RhbmNlIG9mIHRoZSBzYW1lIGNsYXNzIG9mIG5vZGUuXG4gKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiBhbiBhdHRyaWJ1dGUgb3IgcHJvcGVydHkgKGZvciBleGFtcGxlLCAnaHJlZicpLlxuICogQHBhcmFtIHR5cGUgSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHdyaXRlIHRoYXQncyBhYm91dCB0byBiZSBwZXJmb3JtZWQgd2lsbFxuICogICAgIGJlIHRvIGEgcHJvcGVydHkgb3IgYSBub2RlLlxuICogQHJldHVybiBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBzYW5pdGl6ZSB0aGlzIGNsYXNzIG9mIHdyaXRlcy5cbiAqL1xuZXhwb3J0IHR5cGUgU2FuaXRpemVyRmFjdG9yeSA9IChcbiAgbm9kZTogTm9kZSxcbiAgbmFtZTogc3RyaW5nLFxuICB0eXBlOiAncHJvcGVydHknIHwgJ2F0dHJpYnV0ZSdcbikgPT4gVmFsdWVTYW5pdGl6ZXI7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB3aGljaCBjYW4gc2FuaXRpemUgdmFsdWVzIHRoYXQgd2lsbCBiZSB3cml0dGVuIHRvIGEgc3BlY2lmaWMga2luZFxuICogb2YgRE9NIHNpbmsuXG4gKlxuICogU2VlIFNhbml0aXplckZhY3RvcnkuXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBzYW5pdGl6ZS4gV2lsbCBiZSB0aGUgYWN0dWFsIHZhbHVlIHBhc3NlZCBpbnRvXG4gKiAgICAgdGhlIGxpdC1odG1sIHRlbXBsYXRlIGxpdGVyYWwsIHNvIHRoaXMgY291bGQgYmUgb2YgYW55IHR5cGUuXG4gKiBAcmV0dXJuIFRoZSB2YWx1ZSB0byB3cml0ZSB0byB0aGUgRE9NLiBVc3VhbGx5IHRoZSBzYW1lIGFzIHRoZSBpbnB1dCB2YWx1ZSxcbiAqICAgICB1bmxlc3Mgc2FuaXRpemF0aW9uIGlzIG5lZWRlZC5cbiAqL1xuZXhwb3J0IHR5cGUgVmFsdWVTYW5pdGl6ZXIgPSAodmFsdWU6IHVua25vd24pID0+IHVua25vd247XG5cbmNvbnN0IGlkZW50aXR5RnVuY3Rpb246IFZhbHVlU2FuaXRpemVyID0gKHZhbHVlOiB1bmtub3duKSA9PiB2YWx1ZTtcbmNvbnN0IG5vb3BTYW5pdGl6ZXI6IFNhbml0aXplckZhY3RvcnkgPSAoXG4gIF9ub2RlOiBOb2RlLFxuICBfbmFtZTogc3RyaW5nLFxuICBfdHlwZTogJ3Byb3BlcnR5JyB8ICdhdHRyaWJ1dGUnXG4pID0+IGlkZW50aXR5RnVuY3Rpb247XG5cbi8qKiBTZXRzIHRoZSBnbG9iYWwgc2FuaXRpemVyIGZhY3RvcnkuICovXG5jb25zdCBzZXRTYW5pdGl6ZXIgPSAobmV3U2FuaXRpemVyOiBTYW5pdGl6ZXJGYWN0b3J5KSA9PiB7XG4gIGlmICghRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwgIT09IG5vb3BTYW5pdGl6ZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgQXR0ZW1wdGVkIHRvIG92ZXJ3cml0ZSBleGlzdGluZyBsaXQtaHRtbCBzZWN1cml0eSBwb2xpY3kuYCArXG4gICAgICAgIGAgc2V0U2FuaXRpemVET01WYWx1ZUZhY3Rvcnkgc2hvdWxkIGJlIGNhbGxlZCBhdCBtb3N0IG9uY2UuYFxuICAgICk7XG4gIH1cbiAgc2FuaXRpemVyRmFjdG9yeUludGVybmFsID0gbmV3U2FuaXRpemVyO1xufTtcblxuLyoqXG4gKiBPbmx5IHVzZWQgaW4gaW50ZXJuYWwgdGVzdHMsIG5vdCBhIHBhcnQgb2YgdGhlIHB1YmxpYyBBUEkuXG4gKi9cbmNvbnN0IF90ZXN0T25seUNsZWFyU2FuaXRpemVyRmFjdG9yeURvTm90Q2FsbE9yRWxzZSA9ICgpID0+IHtcbiAgc2FuaXRpemVyRmFjdG9yeUludGVybmFsID0gbm9vcFNhbml0aXplcjtcbn07XG5cbmNvbnN0IGNyZWF0ZVNhbml0aXplcjogU2FuaXRpemVyRmFjdG9yeSA9IChub2RlLCBuYW1lLCB0eXBlKSA9PiB7XG4gIHJldHVybiBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwobm9kZSwgbmFtZSwgdHlwZSk7XG59O1xuXG4vLyBBZGRlZCB0byBhbiBhdHRyaWJ1dGUgbmFtZSB0byBtYXJrIHRoZSBhdHRyaWJ1dGUgYXMgYm91bmQgc28gd2UgY2FuIGZpbmRcbi8vIGl0IGVhc2lseS5cbmNvbnN0IGJvdW5kQXR0cmlidXRlU3VmZml4ID0gJyRsaXQkJztcblxuLy8gVGhpcyBtYXJrZXIgaXMgdXNlZCBpbiBtYW55IHN5bnRhY3RpYyBwb3NpdGlvbnMgaW4gSFRNTCwgc28gaXQgbXVzdCBiZVxuLy8gYSB2YWxpZCBlbGVtZW50IG5hbWUgYW5kIGF0dHJpYnV0ZSBuYW1lLiBXZSBkb24ndCBzdXBwb3J0IGR5bmFtaWMgbmFtZXMgKHlldClcbi8vIGJ1dCB0aGlzIGF0IGxlYXN0IGVuc3VyZXMgdGhhdCB0aGUgcGFyc2UgdHJlZSBpcyBjbG9zZXIgdG8gdGhlIHRlbXBsYXRlXG4vLyBpbnRlbnRpb24uXG5jb25zdCBtYXJrZXIgPSBgbGl0JCR7TWF0aC5yYW5kb20oKS50b0ZpeGVkKDkpLnNsaWNlKDIpfSRgO1xuXG4vLyBTdHJpbmcgdXNlZCB0byB0ZWxsIGlmIGEgY29tbWVudCBpcyBhIG1hcmtlciBjb21tZW50XG5jb25zdCBtYXJrZXJNYXRjaCA9ICc/JyArIG1hcmtlcjtcblxuLy8gVGV4dCB1c2VkIHRvIGluc2VydCBhIGNvbW1lbnQgbWFya2VyIG5vZGUuIFdlIHVzZSBwcm9jZXNzaW5nIGluc3RydWN0aW9uXG4vLyBzeW50YXggYmVjYXVzZSBpdCdzIHNsaWdodGx5IHNtYWxsZXIsIGJ1dCBwYXJzZXMgYXMgYSBjb21tZW50IG5vZGUuXG5jb25zdCBub2RlTWFya2VyID0gYDwke21hcmtlck1hdGNofT5gO1xuXG5jb25zdCBkID1cbiAgTk9ERV9NT0RFICYmIGdsb2JhbC5kb2N1bWVudCA9PT0gdW5kZWZpbmVkXG4gICAgPyAoe1xuICAgICAgICBjcmVhdGVUcmVlV2Fsa2VyKCkge1xuICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfSxcbiAgICAgIH0gYXMgdW5rbm93biBhcyBEb2N1bWVudClcbiAgICA6IGRvY3VtZW50O1xuXG4vLyBDcmVhdGVzIGEgZHluYW1pYyBtYXJrZXIuIFdlIG5ldmVyIGhhdmUgdG8gc2VhcmNoIGZvciB0aGVzZSBpbiB0aGUgRE9NLlxuY29uc3QgY3JlYXRlTWFya2VyID0gKCkgPT4gZC5jcmVhdGVDb21tZW50KCcnKTtcblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdHlwZW9mLW9wZXJhdG9yXG50eXBlIFByaW1pdGl2ZSA9IG51bGwgfCB1bmRlZmluZWQgfCBib29sZWFuIHwgbnVtYmVyIHwgc3RyaW5nIHwgc3ltYm9sIHwgYmlnaW50O1xuY29uc3QgaXNQcmltaXRpdmUgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBQcmltaXRpdmUgPT5cbiAgdmFsdWUgPT09IG51bGwgfHwgKHR5cGVvZiB2YWx1ZSAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUgIT0gJ2Z1bmN0aW9uJyk7XG5jb25zdCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbmNvbnN0IGlzSXRlcmFibGUgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBJdGVyYWJsZTx1bmtub3duPiA9PlxuICBpc0FycmF5KHZhbHVlKSB8fFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICB0eXBlb2YgKHZhbHVlIGFzIGFueSk/LltTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nO1xuXG5jb25zdCBTUEFDRV9DSEFSID0gYFsgXFx0XFxuXFxmXFxyXWA7XG5jb25zdCBBVFRSX1ZBTFVFX0NIQVIgPSBgW14gXFx0XFxuXFxmXFxyXCInXFxgPD49XWA7XG5jb25zdCBOQU1FX0NIQVIgPSBgW15cXFxcc1wiJz49L11gO1xuXG4vLyBUaGVzZSByZWdleGVzIHJlcHJlc2VudCB0aGUgZml2ZSBwYXJzaW5nIHN0YXRlcyB0aGF0IHdlIGNhcmUgYWJvdXQgaW4gdGhlXG4vLyBUZW1wbGF0ZSdzIEhUTUwgc2Nhbm5lci4gVGhleSBtYXRjaCB0aGUgKmVuZCogb2YgdGhlIHN0YXRlIHRoZXkncmUgbmFtZWRcbi8vIGFmdGVyLlxuLy8gRGVwZW5kaW5nIG9uIHRoZSBtYXRjaCwgd2UgdHJhbnNpdGlvbiB0byBhIG5ldyBzdGF0ZS4gSWYgdGhlcmUncyBubyBtYXRjaCxcbi8vIHdlIHN0YXkgaW4gdGhlIHNhbWUgc3RhdGUuXG4vLyBOb3RlIHRoYXQgdGhlIHJlZ2V4ZXMgYXJlIHN0YXRlZnVsLiBXZSB1dGlsaXplIGxhc3RJbmRleCBhbmQgc3luYyBpdFxuLy8gYWNyb3NzIHRoZSBtdWx0aXBsZSByZWdleGVzIHVzZWQuIEluIGFkZGl0aW9uIHRvIHRoZSBmaXZlIHJlZ2V4ZXMgYmVsb3dcbi8vIHdlIGFsc28gZHluYW1pY2FsbHkgY3JlYXRlIGEgcmVnZXggdG8gZmluZCB0aGUgbWF0Y2hpbmcgZW5kIHRhZ3MgZm9yIHJhd1xuLy8gdGV4dCBlbGVtZW50cy5cblxuLyoqXG4gKiBFbmQgb2YgdGV4dCBpczogYDxgIGZvbGxvd2VkIGJ5OlxuICogICAoY29tbWVudCBzdGFydCkgb3IgKHRhZykgb3IgKGR5bmFtaWMgdGFnIGJpbmRpbmcpXG4gKi9cbmNvbnN0IHRleHRFbmRSZWdleCA9IC88KD86KCEtLXxcXC9bXmEtekEtWl0pfChcXC8/W2EtekEtWl1bXj5cXHNdKil8KFxcLz8kKSkvZztcbmNvbnN0IENPTU1FTlRfU1RBUlQgPSAxO1xuY29uc3QgVEFHX05BTUUgPSAyO1xuY29uc3QgRFlOQU1JQ19UQUdfTkFNRSA9IDM7XG5cbmNvbnN0IGNvbW1lbnRFbmRSZWdleCA9IC8tLT4vZztcbi8qKlxuICogQ29tbWVudHMgbm90IHN0YXJ0ZWQgd2l0aCA8IS0tLCBsaWtlIDwveywgY2FuIGJlIGVuZGVkIGJ5IGEgc2luZ2xlIGA+YFxuICovXG5jb25zdCBjb21tZW50MkVuZFJlZ2V4ID0gLz4vZztcblxuLyoqXG4gKiBUaGUgdGFnRW5kIHJlZ2V4IG1hdGNoZXMgdGhlIGVuZCBvZiB0aGUgXCJpbnNpZGUgYW4gb3BlbmluZ1wiIHRhZyBzeW50YXhcbiAqIHBvc2l0aW9uLiBJdCBlaXRoZXIgbWF0Y2hlcyBhIGA+YCwgYW4gYXR0cmlidXRlLWxpa2Ugc2VxdWVuY2UsIG9yIHRoZSBlbmRcbiAqIG9mIHRoZSBzdHJpbmcgYWZ0ZXIgYSBzcGFjZSAoYXR0cmlidXRlLW5hbWUgcG9zaXRpb24gZW5kaW5nKS5cbiAqXG4gKiBTZWUgYXR0cmlidXRlcyBpbiB0aGUgSFRNTCBzcGVjOlxuICogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L3N5bnRheC5odG1sI2VsZW1lbnRzLWF0dHJpYnV0ZXNcbiAqXG4gKiBcIiBcXHRcXG5cXGZcXHJcIiBhcmUgSFRNTCBzcGFjZSBjaGFyYWN0ZXJzOlxuICogaHR0cHM6Ly9pbmZyYS5zcGVjLndoYXR3Zy5vcmcvI2FzY2lpLXdoaXRlc3BhY2VcbiAqXG4gKiBTbyBhbiBhdHRyaWJ1dGUgaXM6XG4gKiAgKiBUaGUgbmFtZTogYW55IGNoYXJhY3RlciBleGNlcHQgYSB3aGl0ZXNwYWNlIGNoYXJhY3RlciwgKFwiKSwgKCcpLCBcIj5cIixcbiAqICAgIFwiPVwiLCBvciBcIi9cIi4gTm90ZTogdGhpcyBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgSFRNTCBzcGVjIHdoaWNoIGFsc28gZXhjbHVkZXMgY29udHJvbCBjaGFyYWN0ZXJzLlxuICogICogRm9sbG93ZWQgYnkgemVybyBvciBtb3JlIHNwYWNlIGNoYXJhY3RlcnNcbiAqICAqIEZvbGxvd2VkIGJ5IFwiPVwiXG4gKiAgKiBGb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVyc1xuICogICogRm9sbG93ZWQgYnk6XG4gKiAgICAqIEFueSBjaGFyYWN0ZXIgZXhjZXB0IHNwYWNlLCAoJyksIChcIiksIFwiPFwiLCBcIj5cIiwgXCI9XCIsIChgKSwgb3JcbiAqICAgICogKFwiKSB0aGVuIGFueSBub24tKFwiKSwgb3JcbiAqICAgICogKCcpIHRoZW4gYW55IG5vbi0oJylcbiAqL1xuY29uc3QgdGFnRW5kUmVnZXggPSBuZXcgUmVnRXhwKFxuICBgPnwke1NQQUNFX0NIQVJ9KD86KCR7TkFNRV9DSEFSfSspKCR7U1BBQ0VfQ0hBUn0qPSR7U1BBQ0VfQ0hBUn0qKD86JHtBVFRSX1ZBTFVFX0NIQVJ9fChcInwnKXwpKXwkKWAsXG4gICdnJ1xuKTtcbmNvbnN0IEVOVElSRV9NQVRDSCA9IDA7XG5jb25zdCBBVFRSSUJVVEVfTkFNRSA9IDE7XG5jb25zdCBTUEFDRVNfQU5EX0VRVUFMUyA9IDI7XG5jb25zdCBRVU9URV9DSEFSID0gMztcblxuY29uc3Qgc2luZ2xlUXVvdGVBdHRyRW5kUmVnZXggPSAvJy9nO1xuY29uc3QgZG91YmxlUXVvdGVBdHRyRW5kUmVnZXggPSAvXCIvZztcbi8qKlxuICogTWF0Y2hlcyB0aGUgcmF3IHRleHQgZWxlbWVudHMuXG4gKlxuICogQ29tbWVudHMgYXJlIG5vdCBwYXJzZWQgd2l0aGluIHJhdyB0ZXh0IGVsZW1lbnRzLCBzbyB3ZSBuZWVkIHRvIHNlYXJjaCB0aGVpclxuICogdGV4dCBjb250ZW50IGZvciBtYXJrZXIgc3RyaW5ncy5cbiAqL1xuY29uc3QgcmF3VGV4dEVsZW1lbnQgPSAvXig/OnNjcmlwdHxzdHlsZXx0ZXh0YXJlYXx0aXRsZSkkL2k7XG5cbi8qKiBUZW1wbGF0ZVJlc3VsdCB0eXBlcyAqL1xuY29uc3QgSFRNTF9SRVNVTFQgPSAxO1xuY29uc3QgU1ZHX1JFU1VMVCA9IDI7XG5jb25zdCBNQVRITUxfUkVTVUxUID0gMztcblxudHlwZSBSZXN1bHRUeXBlID0gdHlwZW9mIEhUTUxfUkVTVUxUIHwgdHlwZW9mIFNWR19SRVNVTFQgfCB0eXBlb2YgTUFUSE1MX1JFU1VMVDtcblxuLy8gVGVtcGxhdGVQYXJ0IHR5cGVzXG4vLyBJTVBPUlRBTlQ6IHRoZXNlIG11c3QgbWF0Y2ggdGhlIHZhbHVlcyBpbiBQYXJ0VHlwZVxuY29uc3QgQVRUUklCVVRFX1BBUlQgPSAxO1xuY29uc3QgQ0hJTERfUEFSVCA9IDI7XG5jb25zdCBQUk9QRVJUWV9QQVJUID0gMztcbmNvbnN0IEJPT0xFQU5fQVRUUklCVVRFX1BBUlQgPSA0O1xuY29uc3QgRVZFTlRfUEFSVCA9IDU7XG5jb25zdCBFTEVNRU5UX1BBUlQgPSA2O1xuY29uc3QgQ09NTUVOVF9QQVJUID0gNztcblxuLyoqXG4gKiBUaGUgcmV0dXJuIHR5cGUgb2YgdGhlIHRlbXBsYXRlIHRhZyBmdW5jdGlvbnMsIHtAbGlua2NvZGUgaHRtbH0gYW5kXG4gKiB7QGxpbmtjb2RlIHN2Z30gd2hlbiBpdCBoYXNuJ3QgYmVlbiBjb21waWxlZCBieSBAbGl0LWxhYnMvY29tcGlsZXIuXG4gKlxuICogQSBgVGVtcGxhdGVSZXN1bHRgIG9iamVjdCBob2xkcyBhbGwgdGhlIGluZm9ybWF0aW9uIGFib3V0IGEgdGVtcGxhdGVcbiAqIGV4cHJlc3Npb24gcmVxdWlyZWQgdG8gcmVuZGVyIGl0OiB0aGUgdGVtcGxhdGUgc3RyaW5ncywgZXhwcmVzc2lvbiB2YWx1ZXMsXG4gKiBhbmQgdHlwZSBvZiB0ZW1wbGF0ZSAoaHRtbCBvciBzdmcpLlxuICpcbiAqIGBUZW1wbGF0ZVJlc3VsdGAgb2JqZWN0cyBkbyBub3QgY3JlYXRlIGFueSBET00gb24gdGhlaXIgb3duLiBUbyBjcmVhdGUgb3JcbiAqIHVwZGF0ZSBET00geW91IG5lZWQgdG8gcmVuZGVyIHRoZSBgVGVtcGxhdGVSZXN1bHRgLiBTZWVcbiAqIFtSZW5kZXJpbmddKGh0dHBzOi8vbGl0LmRldi9kb2NzL2NvbXBvbmVudHMvcmVuZGVyaW5nKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKi9cbmV4cG9ydCB0eXBlIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUIGV4dGVuZHMgUmVzdWx0VHlwZSA9IFJlc3VsdFR5cGU+ID0ge1xuICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICBbJ18kbGl0VHlwZSQnXTogVDtcbiAgc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXk7XG4gIHZhbHVlczogdW5rbm93bltdO1xufTtcblxuLyoqXG4gKiBUaGlzIGlzIGEgdGVtcGxhdGUgcmVzdWx0IHRoYXQgbWF5IGJlIGVpdGhlciB1bmNvbXBpbGVkIG9yIGNvbXBpbGVkLlxuICpcbiAqIEluIHRoZSBmdXR1cmUsIFRlbXBsYXRlUmVzdWx0IHdpbGwgYmUgdGhpcyB0eXBlLiBJZiB5b3Ugd2FudCB0byBleHBsaWNpdGx5XG4gKiBub3RlIHRoYXQgYSB0ZW1wbGF0ZSByZXN1bHQgaXMgcG90ZW50aWFsbHkgY29tcGlsZWQsIHlvdSBjYW4gcmVmZXJlbmNlIHRoaXNcbiAqIHR5cGUgYW5kIGl0IHdpbGwgY29udGludWUgdG8gYmVoYXZlIHRoZSBzYW1lIHRocm91Z2ggdGhlIG5leHQgbWFqb3IgdmVyc2lvblxuICogb2YgTGl0LiBUaGlzIGNhbiBiZSB1c2VmdWwgZm9yIGNvZGUgdGhhdCB3YW50cyB0byBwcmVwYXJlIGZvciB0aGUgbmV4dFxuICogbWFqb3IgdmVyc2lvbiBvZiBMaXQuXG4gKi9cbmV4cG9ydCB0eXBlIE1heWJlQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUIGV4dGVuZHMgUmVzdWx0VHlwZSA9IFJlc3VsdFR5cGU+ID1cbiAgfCBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQ8VD5cbiAgfCBDb21waWxlZFRlbXBsYXRlUmVzdWx0O1xuXG4vKipcbiAqIFRoZSByZXR1cm4gdHlwZSBvZiB0aGUgdGVtcGxhdGUgdGFnIGZ1bmN0aW9ucywge0BsaW5rY29kZSBodG1sfSBhbmRcbiAqIHtAbGlua2NvZGUgc3ZnfS5cbiAqXG4gKiBBIGBUZW1wbGF0ZVJlc3VsdGAgb2JqZWN0IGhvbGRzIGFsbCB0aGUgaW5mb3JtYXRpb24gYWJvdXQgYSB0ZW1wbGF0ZVxuICogZXhwcmVzc2lvbiByZXF1aXJlZCB0byByZW5kZXIgaXQ6IHRoZSB0ZW1wbGF0ZSBzdHJpbmdzLCBleHByZXNzaW9uIHZhbHVlcyxcbiAqIGFuZCB0eXBlIG9mIHRlbXBsYXRlIChodG1sIG9yIHN2ZykuXG4gKlxuICogYFRlbXBsYXRlUmVzdWx0YCBvYmplY3RzIGRvIG5vdCBjcmVhdGUgYW55IERPTSBvbiB0aGVpciBvd24uIFRvIGNyZWF0ZSBvclxuICogdXBkYXRlIERPTSB5b3UgbmVlZCB0byByZW5kZXIgdGhlIGBUZW1wbGF0ZVJlc3VsdGAuIFNlZVxuICogW1JlbmRlcmluZ10oaHR0cHM6Ly9saXQuZGV2L2RvY3MvY29tcG9uZW50cy9yZW5kZXJpbmcpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIEluIExpdCA0LCB0aGlzIHR5cGUgd2lsbCBiZSBhbiBhbGlhcyBvZlxuICogTWF5YmVDb21waWxlZFRlbXBsYXRlUmVzdWx0LCBzbyB0aGF0IGNvZGUgd2lsbCBnZXQgdHlwZSBlcnJvcnMgaWYgaXQgYXNzdW1lc1xuICogdGhhdCBMaXQgdGVtcGxhdGVzIGFyZSBub3QgY29tcGlsZWQuIFdoZW4gZGVsaWJlcmF0ZWx5IHdvcmtpbmcgd2l0aCBvbmx5XG4gKiBvbmUsIHVzZSBlaXRoZXIge0BsaW5rY29kZSBDb21waWxlZFRlbXBsYXRlUmVzdWx0fSBvclxuICoge0BsaW5rY29kZSBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHR9IGV4cGxpY2l0bHkuXG4gKi9cbmV4cG9ydCB0eXBlIFRlbXBsYXRlUmVzdWx0PFQgZXh0ZW5kcyBSZXN1bHRUeXBlID0gUmVzdWx0VHlwZT4gPVxuICBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQ8VD47XG5cbmV4cG9ydCB0eXBlIEhUTUxUZW1wbGF0ZVJlc3VsdCA9IFRlbXBsYXRlUmVzdWx0PHR5cGVvZiBIVE1MX1JFU1VMVD47XG5cbmV4cG9ydCB0eXBlIFNWR1RlbXBsYXRlUmVzdWx0ID0gVGVtcGxhdGVSZXN1bHQ8dHlwZW9mIFNWR19SRVNVTFQ+O1xuXG5leHBvcnQgdHlwZSBNYXRoTUxUZW1wbGF0ZVJlc3VsdCA9IFRlbXBsYXRlUmVzdWx0PHR5cGVvZiBNQVRITUxfUkVTVUxUPjtcblxuLyoqXG4gKiBBIFRlbXBsYXRlUmVzdWx0IHRoYXQgaGFzIGJlZW4gY29tcGlsZWQgYnkgQGxpdC1sYWJzL2NvbXBpbGVyLCBza2lwcGluZyB0aGVcbiAqIHByZXBhcmUgc3RlcC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21waWxlZFRlbXBsYXRlUmVzdWx0IHtcbiAgLy8gVGhpcyBpcyBhIGZhY3RvcnkgaW4gb3JkZXIgdG8gbWFrZSB0ZW1wbGF0ZSBpbml0aWFsaXphdGlvbiBsYXp5XG4gIC8vIGFuZCBhbGxvdyBTaGFkeVJlbmRlck9wdGlvbnMgc2NvcGUgdG8gYmUgcGFzc2VkIGluLlxuICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICBbJ18kbGl0VHlwZSQnXTogQ29tcGlsZWRUZW1wbGF0ZTtcbiAgdmFsdWVzOiB1bmtub3duW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGlsZWRUZW1wbGF0ZSBleHRlbmRzIE9taXQ8VGVtcGxhdGUsICdlbCc+IHtcbiAgLy8gZWwgaXMgb3ZlcnJpZGRlbiB0byBiZSBvcHRpb25hbC4gV2UgaW5pdGlhbGl6ZSBpdCBvbiBmaXJzdCByZW5kZXJcbiAgZWw/OiBIVE1MVGVtcGxhdGVFbGVtZW50O1xuXG4gIC8vIFRoZSBwcmVwYXJlZCBIVE1MIHN0cmluZyB0byBjcmVhdGUgYSB0ZW1wbGF0ZSBlbGVtZW50IGZyb20uXG4gIC8vIFRoZSB0eXBlIGlzIGEgVGVtcGxhdGVTdHJpbmdzQXJyYXkgdG8gZ3VhcmFudGVlIHRoYXQgdGhlIHZhbHVlIGNhbWUgZnJvbVxuICAvLyBzb3VyY2UgY29kZSwgcHJldmVudGluZyBhIEpTT04gaW5qZWN0aW9uIGF0dGFjay5cbiAgaDogVGVtcGxhdGVTdHJpbmdzQXJyYXk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgdGVtcGxhdGUgbGl0ZXJhbCB0YWcgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgVGVtcGxhdGVSZXN1bHQgd2l0aFxuICogdGhlIGdpdmVuIHJlc3VsdCB0eXBlLlxuICovXG5jb25zdCB0YWcgPVxuICA8VCBleHRlbmRzIFJlc3VsdFR5cGU+KHR5cGU6IFQpID0+XG4gIChzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4udmFsdWVzOiB1bmtub3duW10pOiBUZW1wbGF0ZVJlc3VsdDxUPiA9PiB7XG4gICAgLy8gV2FybiBhZ2FpbnN0IHRlbXBsYXRlcyBvY3RhbCBlc2NhcGUgc2VxdWVuY2VzXG4gICAgLy8gV2UgZG8gdGhpcyBoZXJlIHJhdGhlciB0aGFuIGluIHJlbmRlciBzbyB0aGF0IHRoZSB3YXJuaW5nIGlzIGNsb3NlciB0byB0aGVcbiAgICAvLyB0ZW1wbGF0ZSBkZWZpbml0aW9uLlxuICAgIGlmIChERVZfTU9ERSAmJiBzdHJpbmdzLnNvbWUoKHMpID0+IHMgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgJ1NvbWUgdGVtcGxhdGUgc3RyaW5ncyBhcmUgdW5kZWZpbmVkLlxcbicgK1xuICAgICAgICAgICdUaGlzIGlzIHByb2JhYmx5IGNhdXNlZCBieSBpbGxlZ2FsIG9jdGFsIGVzY2FwZSBzZXF1ZW5jZXMuJ1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAvLyBJbXBvcnQgc3RhdGljLWh0bWwuanMgcmVzdWx0cyBpbiBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgd2hpY2ggZzMgZG9lc24ndFxuICAgICAgLy8gaGFuZGxlLiBJbnN0ZWFkIHdlIGtub3cgdGhhdCBzdGF0aWMgdmFsdWVzIG11c3QgaGF2ZSB0aGUgZmllbGRcbiAgICAgIC8vIGBfJGxpdFN0YXRpYyRgLlxuICAgICAgaWYgKFxuICAgICAgICB2YWx1ZXMuc29tZSgodmFsKSA9PiAodmFsIGFzIHtfJGxpdFN0YXRpYyQ6IHVua25vd259KT8uWydfJGxpdFN0YXRpYyQnXSlcbiAgICAgICkge1xuICAgICAgICBpc3N1ZVdhcm5pbmcoXG4gICAgICAgICAgJycsXG4gICAgICAgICAgYFN0YXRpYyB2YWx1ZXMgJ2xpdGVyYWwnIG9yICd1bnNhZmVTdGF0aWMnIGNhbm5vdCBiZSB1c2VkIGFzIHZhbHVlcyB0byBub24tc3RhdGljIHRlbXBsYXRlcy5cXG5gICtcbiAgICAgICAgICAgIGBQbGVhc2UgdXNlIHRoZSBzdGF0aWMgJ2h0bWwnIHRhZyBmdW5jdGlvbi4gU2VlIGh0dHBzOi8vbGl0LmRldi9kb2NzL3RlbXBsYXRlcy9leHByZXNzaW9ucy8jc3RhdGljLWV4cHJlc3Npb25zYFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICAgIFsnXyRsaXRUeXBlJCddOiB0eXBlLFxuICAgICAgc3RyaW5ncyxcbiAgICAgIHZhbHVlcyxcbiAgICB9O1xuICB9O1xuXG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIEhUTUwgdGVtcGxhdGUgdGhhdCBjYW4gZWZmaWNpZW50bHlcbiAqIHJlbmRlciB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBoZWFkZXIgPSAodGl0bGU6IHN0cmluZykgPT4gaHRtbGA8aDE+JHt0aXRsZX08L2gxPmA7XG4gKiBgYGBcbiAqXG4gKiBUaGUgYGh0bWxgIHRhZyByZXR1cm5zIGEgZGVzY3JpcHRpb24gb2YgdGhlIERPTSB0byByZW5kZXIgYXMgYSB2YWx1ZS4gSXQgaXNcbiAqIGxhenksIG1lYW5pbmcgbm8gd29yayBpcyBkb25lIHVudGlsIHRoZSB0ZW1wbGF0ZSBpcyByZW5kZXJlZC4gV2hlbiByZW5kZXJpbmcsXG4gKiBpZiBhIHRlbXBsYXRlIGNvbWVzIGZyb20gdGhlIHNhbWUgZXhwcmVzc2lvbiBhcyBhIHByZXZpb3VzbHkgcmVuZGVyZWQgcmVzdWx0LFxuICogaXQncyBlZmZpY2llbnRseSB1cGRhdGVkIGluc3RlYWQgb2YgcmVwbGFjZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBodG1sID0gdGFnKEhUTUxfUkVTVUxUKTtcblxuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBhbiBTVkcgZnJhZ21lbnQgdGhhdCBjYW4gZWZmaWNpZW50bHkgcmVuZGVyXG4gKiB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCByZWN0ID0gc3ZnYDxyZWN0IHdpZHRoPVwiMTBcIiBoZWlnaHQ9XCIxMFwiPjwvcmVjdD5gO1xuICpcbiAqIGNvbnN0IG15SW1hZ2UgPSBodG1sYFxuICogICA8c3ZnIHZpZXdCb3g9XCIwIDAgMTAgMTBcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gKiAgICAgJHtyZWN0fVxuICogICA8L3N2Zz5gO1xuICogYGBgXG4gKlxuICogVGhlIGBzdmdgICp0YWcgZnVuY3Rpb24qIHNob3VsZCBvbmx5IGJlIHVzZWQgZm9yIFNWRyBmcmFnbWVudHMsIG9yIGVsZW1lbnRzXG4gKiB0aGF0IHdvdWxkIGJlIGNvbnRhaW5lZCAqKmluc2lkZSoqIGFuIGA8c3ZnPmAgSFRNTCBlbGVtZW50LiBBIGNvbW1vbiBlcnJvciBpc1xuICogcGxhY2luZyBhbiBgPHN2Zz5gICplbGVtZW50KiBpbiBhIHRlbXBsYXRlIHRhZ2dlZCB3aXRoIHRoZSBgc3ZnYCB0YWdcbiAqIGZ1bmN0aW9uLiBUaGUgYDxzdmc+YCBlbGVtZW50IGlzIGFuIEhUTUwgZWxlbWVudCBhbmQgc2hvdWxkIGJlIHVzZWQgd2l0aGluIGFcbiAqIHRlbXBsYXRlIHRhZ2dlZCB3aXRoIHRoZSB7QGxpbmtjb2RlIGh0bWx9IHRhZyBmdW5jdGlvbi5cbiAqXG4gKiBJbiBMaXRFbGVtZW50IHVzYWdlLCBpdCdzIGludmFsaWQgdG8gcmV0dXJuIGFuIFNWRyBmcmFnbWVudCBmcm9tIHRoZVxuICogYHJlbmRlcigpYCBtZXRob2QsIGFzIHRoZSBTVkcgZnJhZ21lbnQgd2lsbCBiZSBjb250YWluZWQgd2l0aGluIHRoZSBlbGVtZW50J3NcbiAqIHNoYWRvdyByb290IGFuZCB0aHVzIG5vdCBiZSBwcm9wZXJseSBjb250YWluZWQgd2l0aGluIGFuIGA8c3ZnPmAgSFRNTFxuICogZWxlbWVudC5cbiAqL1xuZXhwb3J0IGNvbnN0IHN2ZyA9IHRhZyhTVkdfUkVTVUxUKTtcblxuLyoqXG4gKiBJbnRlcnByZXRzIGEgdGVtcGxhdGUgbGl0ZXJhbCBhcyBNYXRoTUwgZnJhZ21lbnQgdGhhdCBjYW4gZWZmaWNpZW50bHkgcmVuZGVyXG4gKiB0byBhbmQgdXBkYXRlIGEgY29udGFpbmVyLlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBudW0gPSBtYXRobWxgPG1uPjE8L21uPmA7XG4gKlxuICogY29uc3QgZXEgPSBodG1sYFxuICogICA8bWF0aD5cbiAqICAgICAke251bX1cbiAqICAgPC9tYXRoPmA7XG4gKiBgYGBcbiAqXG4gKiBUaGUgYG1hdGhtbGAgKnRhZyBmdW5jdGlvbiogc2hvdWxkIG9ubHkgYmUgdXNlZCBmb3IgTWF0aE1MIGZyYWdtZW50cywgb3JcbiAqIGVsZW1lbnRzIHRoYXQgd291bGQgYmUgY29udGFpbmVkICoqaW5zaWRlKiogYSBgPG1hdGg+YCBIVE1MIGVsZW1lbnQuIEEgY29tbW9uXG4gKiBlcnJvciBpcyBwbGFjaW5nIGEgYDxtYXRoPmAgKmVsZW1lbnQqIGluIGEgdGVtcGxhdGUgdGFnZ2VkIHdpdGggdGhlIGBtYXRobWxgXG4gKiB0YWcgZnVuY3Rpb24uIFRoZSBgPG1hdGg+YCBlbGVtZW50IGlzIGFuIEhUTUwgZWxlbWVudCBhbmQgc2hvdWxkIGJlIHVzZWRcbiAqIHdpdGhpbiBhIHRlbXBsYXRlIHRhZ2dlZCB3aXRoIHRoZSB7QGxpbmtjb2RlIGh0bWx9IHRhZyBmdW5jdGlvbi5cbiAqXG4gKiBJbiBMaXRFbGVtZW50IHVzYWdlLCBpdCdzIGludmFsaWQgdG8gcmV0dXJuIGFuIE1hdGhNTCBmcmFnbWVudCBmcm9tIHRoZVxuICogYHJlbmRlcigpYCBtZXRob2QsIGFzIHRoZSBNYXRoTUwgZnJhZ21lbnQgd2lsbCBiZSBjb250YWluZWQgd2l0aGluIHRoZVxuICogZWxlbWVudCdzIHNoYWRvdyByb290IGFuZCB0aHVzIG5vdCBiZSBwcm9wZXJseSBjb250YWluZWQgd2l0aGluIGEgYDxtYXRoPmBcbiAqIEhUTUwgZWxlbWVudC5cbiAqL1xuZXhwb3J0IGNvbnN0IG1hdGhtbCA9IHRhZyhNQVRITUxfUkVTVUxUKTtcblxuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHRoYXQgc2lnbmFscyB0aGF0IGEgdmFsdWUgd2FzIGhhbmRsZWQgYnkgYSBkaXJlY3RpdmUgYW5kXG4gKiBzaG91bGQgbm90IGJlIHdyaXR0ZW4gdG8gdGhlIERPTS5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vQ2hhbmdlID0gU3ltYm9sLmZvcignbGl0LW5vQ2hhbmdlJyk7XG5cbi8qKlxuICogQSBzZW50aW5lbCB2YWx1ZSB0aGF0IHNpZ25hbHMgYSBDaGlsZFBhcnQgdG8gZnVsbHkgY2xlYXIgaXRzIGNvbnRlbnQuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IGJ1dHRvbiA9IGh0bWxgJHtcbiAqICB1c2VyLmlzQWRtaW5cbiAqICAgID8gaHRtbGA8YnV0dG9uPkRFTEVURTwvYnV0dG9uPmBcbiAqICAgIDogbm90aGluZ1xuICogfWA7XG4gKiBgYGBcbiAqXG4gKiBQcmVmZXIgdXNpbmcgYG5vdGhpbmdgIG92ZXIgb3RoZXIgZmFsc3kgdmFsdWVzIGFzIGl0IHByb3ZpZGVzIGEgY29uc2lzdGVudFxuICogYmVoYXZpb3IgYmV0d2VlbiB2YXJpb3VzIGV4cHJlc3Npb24gYmluZGluZyBjb250ZXh0cy5cbiAqXG4gKiBJbiBjaGlsZCBleHByZXNzaW9ucywgYHVuZGVmaW5lZGAsIGBudWxsYCwgYCcnYCwgYW5kIGBub3RoaW5nYCBhbGwgYmVoYXZlIHRoZVxuICogc2FtZSBhbmQgcmVuZGVyIG5vIG5vZGVzLiBJbiBhdHRyaWJ1dGUgZXhwcmVzc2lvbnMsIGBub3RoaW5nYCBfcmVtb3Zlc18gdGhlXG4gKiBhdHRyaWJ1dGUsIHdoaWxlIGB1bmRlZmluZWRgIGFuZCBgbnVsbGAgd2lsbCByZW5kZXIgYW4gZW1wdHkgc3RyaW5nLiBJblxuICogcHJvcGVydHkgZXhwcmVzc2lvbnMgYG5vdGhpbmdgIGJlY29tZXMgYHVuZGVmaW5lZGAuXG4gKi9cbmV4cG9ydCBjb25zdCBub3RoaW5nID0gU3ltYm9sLmZvcignbGl0LW5vdGhpbmcnKTtcblxuLyoqXG4gKiBUaGUgY2FjaGUgb2YgcHJlcGFyZWQgdGVtcGxhdGVzLCBrZXllZCBieSB0aGUgdGFnZ2VkIFRlbXBsYXRlU3RyaW5nc0FycmF5XG4gKiBhbmQgX25vdF8gYWNjb3VudGluZyBmb3IgdGhlIHNwZWNpZmljIHRlbXBsYXRlIHRhZyB1c2VkLiBUaGlzIG1lYW5zIHRoYXRcbiAqIHRlbXBsYXRlIHRhZ3MgY2Fubm90IGJlIGR5bmFtaWMgLSB0aGV5IG11c3Qgc3RhdGljYWxseSBiZSBvbmUgb2YgaHRtbCwgc3ZnLFxuICogb3IgYXR0ci4gVGhpcyByZXN0cmljdGlvbiBzaW1wbGlmaWVzIHRoZSBjYWNoZSBsb29rdXAsIHdoaWNoIGlzIG9uIHRoZSBob3RcbiAqIHBhdGggZm9yIHJlbmRlcmluZy5cbiAqL1xuY29uc3QgdGVtcGxhdGVDYWNoZSA9IG5ldyBXZWFrTWFwPFRlbXBsYXRlU3RyaW5nc0FycmF5LCBUZW1wbGF0ZT4oKTtcblxuLyoqXG4gKiBPYmplY3Qgc3BlY2lmeWluZyBvcHRpb25zIGZvciBjb250cm9sbGluZyBsaXQtaHRtbCByZW5kZXJpbmcuIE5vdGUgdGhhdFxuICogd2hpbGUgYHJlbmRlcmAgbWF5IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBvbiB0aGUgc2FtZSBgY29udGFpbmVyYCAoYW5kXG4gKiBgcmVuZGVyQmVmb3JlYCByZWZlcmVuY2Ugbm9kZSkgdG8gZWZmaWNpZW50bHkgdXBkYXRlIHRoZSByZW5kZXJlZCBjb250ZW50LFxuICogb25seSB0aGUgb3B0aW9ucyBwYXNzZWQgaW4gZHVyaW5nIHRoZSBmaXJzdCByZW5kZXIgYXJlIHJlc3BlY3RlZCBkdXJpbmdcbiAqIHRoZSBsaWZldGltZSBvZiByZW5kZXJzIHRvIHRoYXQgdW5pcXVlIGBjb250YWluZXJgICsgYHJlbmRlckJlZm9yZWBcbiAqIGNvbWJpbmF0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlck9wdGlvbnMge1xuICAvKipcbiAgICogQW4gb2JqZWN0IHRvIHVzZSBhcyB0aGUgYHRoaXNgIHZhbHVlIGZvciBldmVudCBsaXN0ZW5lcnMuIEl0J3Mgb2Z0ZW5cbiAgICogdXNlZnVsIHRvIHNldCB0aGlzIHRvIHRoZSBob3N0IGNvbXBvbmVudCByZW5kZXJpbmcgYSB0ZW1wbGF0ZS5cbiAgICovXG4gIGhvc3Q/OiBvYmplY3Q7XG4gIC8qKlxuICAgKiBBIERPTSBub2RlIGJlZm9yZSB3aGljaCB0byByZW5kZXIgY29udGVudCBpbiB0aGUgY29udGFpbmVyLlxuICAgKi9cbiAgcmVuZGVyQmVmb3JlPzogQ2hpbGROb2RlIHwgbnVsbDtcbiAgLyoqXG4gICAqIE5vZGUgdXNlZCBmb3IgY2xvbmluZyB0aGUgdGVtcGxhdGUgKGBpbXBvcnROb2RlYCB3aWxsIGJlIGNhbGxlZCBvbiB0aGlzXG4gICAqIG5vZGUpLiBUaGlzIGNvbnRyb2xzIHRoZSBgb3duZXJEb2N1bWVudGAgb2YgdGhlIHJlbmRlcmVkIERPTSwgYWxvbmcgd2l0aFxuICAgKiBhbnkgaW5oZXJpdGVkIGNvbnRleHQuIERlZmF1bHRzIHRvIHRoZSBnbG9iYWwgYGRvY3VtZW50YC5cbiAgICovXG4gIGNyZWF0aW9uU2NvcGU/OiB7aW1wb3J0Tm9kZShub2RlOiBOb2RlLCBkZWVwPzogYm9vbGVhbik6IE5vZGV9O1xuICAvKipcbiAgICogVGhlIGluaXRpYWwgY29ubmVjdGVkIHN0YXRlIGZvciB0aGUgdG9wLWxldmVsIHBhcnQgYmVpbmcgcmVuZGVyZWQuIElmIG5vXG4gICAqIGBpc0Nvbm5lY3RlZGAgb3B0aW9uIGlzIHNldCwgYEFzeW5jRGlyZWN0aXZlYHMgd2lsbCBiZSBjb25uZWN0ZWQgYnlcbiAgICogZGVmYXVsdC4gU2V0IHRvIGBmYWxzZWAgaWYgdGhlIGluaXRpYWwgcmVuZGVyIG9jY3VycyBpbiBhIGRpc2Nvbm5lY3RlZCB0cmVlXG4gICAqIGFuZCBgQXN5bmNEaXJlY3RpdmVgcyBzaG91bGQgc2VlIGBpc0Nvbm5lY3RlZCA9PT0gZmFsc2VgIGZvciB0aGVpciBpbml0aWFsXG4gICAqIHJlbmRlci4gVGhlIGBwYXJ0LnNldENvbm5lY3RlZCgpYCBtZXRob2QgbXVzdCBiZSB1c2VkIHN1YnNlcXVlbnQgdG8gaW5pdGlhbFxuICAgKiByZW5kZXIgdG8gY2hhbmdlIHRoZSBjb25uZWN0ZWQgc3RhdGUgb2YgdGhlIHBhcnQuXG4gICAqL1xuICBpc0Nvbm5lY3RlZD86IGJvb2xlYW47XG59XG5cbmNvbnN0IHdhbGtlciA9IGQuY3JlYXRlVHJlZVdhbGtlcihcbiAgZCxcbiAgMTI5IC8qIE5vZGVGaWx0ZXIuU0hPV197RUxFTUVOVHxDT01NRU5UfSAqL1xuKTtcblxubGV0IHNhbml0aXplckZhY3RvcnlJbnRlcm5hbDogU2FuaXRpemVyRmFjdG9yeSA9IG5vb3BTYW5pdGl6ZXI7XG5cbi8vXG4vLyBDbGFzc2VzIG9ubHkgYmVsb3cgaGVyZSwgY29uc3QgdmFyaWFibGUgZGVjbGFyYXRpb25zIG9ubHkgYWJvdmUgaGVyZS4uLlxuLy9cbi8vIEtlZXBpbmcgdmFyaWFibGUgZGVjbGFyYXRpb25zIGFuZCBjbGFzc2VzIHRvZ2V0aGVyIGltcHJvdmVzIG1pbmlmaWNhdGlvbi5cbi8vIEludGVyZmFjZXMgYW5kIHR5cGUgYWxpYXNlcyBjYW4gYmUgaW50ZXJsZWF2ZWQgZnJlZWx5LlxuLy9cblxuLy8gVHlwZSBmb3IgY2xhc3NlcyB0aGF0IGhhdmUgYSBgX2RpcmVjdGl2ZWAgb3IgYF9kaXJlY3RpdmVzW11gIGZpZWxkLCB1c2VkIGJ5XG4vLyBgcmVzb2x2ZURpcmVjdGl2ZWBcbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0aXZlUGFyZW50IHtcbiAgXyRwYXJlbnQ/OiBEaXJlY3RpdmVQYXJlbnQ7XG4gIF8kaXNDb25uZWN0ZWQ6IGJvb2xlYW47XG4gIF9fZGlyZWN0aXZlPzogRGlyZWN0aXZlO1xuICBfX2RpcmVjdGl2ZXM/OiBBcnJheTxEaXJlY3RpdmUgfCB1bmRlZmluZWQ+O1xufVxuXG5mdW5jdGlvbiB0cnVzdEZyb21UZW1wbGF0ZVN0cmluZyhcbiAgdHNhOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSxcbiAgc3RyaW5nRnJvbVRTQTogc3RyaW5nXG4pOiBUcnVzdGVkSFRNTCB7XG4gIC8vIEEgc2VjdXJpdHkgY2hlY2sgdG8gcHJldmVudCBzcG9vZmluZyBvZiBMaXQgdGVtcGxhdGUgcmVzdWx0cy5cbiAgLy8gSW4gdGhlIGZ1dHVyZSwgd2UgbWF5IGJlIGFibGUgdG8gcmVwbGFjZSB0aGlzIHdpdGggQXJyYXkuaXNUZW1wbGF0ZU9iamVjdCxcbiAgLy8gdGhvdWdoIHdlIG1pZ2h0IG5lZWQgdG8gbWFrZSB0aGF0IGNoZWNrIGluc2lkZSBvZiB0aGUgaHRtbCBhbmQgc3ZnXG4gIC8vIGZ1bmN0aW9ucywgYmVjYXVzZSBwcmVjb21waWxlZCB0ZW1wbGF0ZXMgZG9uJ3QgY29tZSBpbiBhc1xuICAvLyBUZW1wbGF0ZVN0cmluZ0FycmF5IG9iamVjdHMuXG4gIGlmICghaXNBcnJheSh0c2EpIHx8ICF0c2EuaGFzT3duUHJvcGVydHkoJ3JhdycpKSB7XG4gICAgbGV0IG1lc3NhZ2UgPSAnaW52YWxpZCB0ZW1wbGF0ZSBzdHJpbmdzIGFycmF5JztcbiAgICBpZiAoREVWX01PREUpIHtcbiAgICAgIG1lc3NhZ2UgPSBgXG4gICAgICAgICAgSW50ZXJuYWwgRXJyb3I6IGV4cGVjdGVkIHRlbXBsYXRlIHN0cmluZ3MgdG8gYmUgYW4gYXJyYXlcbiAgICAgICAgICB3aXRoIGEgJ3JhdycgZmllbGQuIEZha2luZyBhIHRlbXBsYXRlIHN0cmluZ3MgYXJyYXkgYnlcbiAgICAgICAgICBjYWxsaW5nIGh0bWwgb3Igc3ZnIGxpa2UgYW4gb3JkaW5hcnkgZnVuY3Rpb24gaXMgZWZmZWN0aXZlbHlcbiAgICAgICAgICB0aGUgc2FtZSBhcyBjYWxsaW5nIHVuc2FmZUh0bWwgYW5kIGNhbiBsZWFkIHRvIG1ham9yIHNlY3VyaXR5XG4gICAgICAgICAgaXNzdWVzLCBlLmcuIG9wZW5pbmcgeW91ciBjb2RlIHVwIHRvIFhTUyBhdHRhY2tzLlxuICAgICAgICAgIElmIHlvdSdyZSB1c2luZyB0aGUgaHRtbCBvciBzdmcgdGFnZ2VkIHRlbXBsYXRlIGZ1bmN0aW9ucyBub3JtYWxseVxuICAgICAgICAgIGFuZCBzdGlsbCBzZWVpbmcgdGhpcyBlcnJvciwgcGxlYXNlIGZpbGUgYSBidWcgYXRcbiAgICAgICAgICBodHRwczovL2dpdGh1Yi5jb20vbGl0L2xpdC9pc3N1ZXMvbmV3P3RlbXBsYXRlPWJ1Z19yZXBvcnQubWRcbiAgICAgICAgICBhbmQgaW5jbHVkZSBpbmZvcm1hdGlvbiBhYm91dCB5b3VyIGJ1aWxkIHRvb2xpbmcsIGlmIGFueS5cbiAgICAgICAgYFxuICAgICAgICAudHJpbSgpXG4gICAgICAgIC5yZXBsYWNlKC9cXG4gKi9nLCAnXFxuJyk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgfVxuICByZXR1cm4gcG9saWN5ICE9PSB1bmRlZmluZWRcbiAgICA/IHBvbGljeS5jcmVhdGVIVE1MKHN0cmluZ0Zyb21UU0EpXG4gICAgOiAoc3RyaW5nRnJvbVRTQSBhcyB1bmtub3duIGFzIFRydXN0ZWRIVE1MKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIEhUTUwgc3RyaW5nIGZvciB0aGUgZ2l2ZW4gVGVtcGxhdGVTdHJpbmdzQXJyYXkgYW5kIHJlc3VsdCB0eXBlXG4gKiAoSFRNTCBvciBTVkcpLCBhbG9uZyB3aXRoIHRoZSBjYXNlLXNlbnNpdGl2ZSBib3VuZCBhdHRyaWJ1dGUgbmFtZXMgaW5cbiAqIHRlbXBsYXRlIG9yZGVyLiBUaGUgSFRNTCBjb250YWlucyBjb21tZW50IG1hcmtlcnMgZGVub3RpbmcgdGhlIGBDaGlsZFBhcnRgc1xuICogYW5kIHN1ZmZpeGVzIG9uIGJvdW5kIGF0dHJpYnV0ZXMgZGVub3RpbmcgdGhlIGBBdHRyaWJ1dGVQYXJ0c2AuXG4gKlxuICogQHBhcmFtIHN0cmluZ3MgdGVtcGxhdGUgc3RyaW5ncyBhcnJheVxuICogQHBhcmFtIHR5cGUgSFRNTCBvciBTVkdcbiAqIEByZXR1cm4gQXJyYXkgY29udGFpbmluZyBgW2h0bWwsIGF0dHJOYW1lc11gIChhcnJheSByZXR1cm5lZCBmb3IgdGVyc2VuZXNzLFxuICogICAgIHRvIGF2b2lkIG9iamVjdCBmaWVsZHMgc2luY2UgdGhpcyBjb2RlIGlzIHNoYXJlZCB3aXRoIG5vbi1taW5pZmllZCBTU1JcbiAqICAgICBjb2RlKVxuICovXG5jb25zdCBnZXRUZW1wbGF0ZUh0bWwgPSAoXG4gIHN0cmluZ3M6IFRlbXBsYXRlU3RyaW5nc0FycmF5LFxuICB0eXBlOiBSZXN1bHRUeXBlXG4pOiBbVHJ1c3RlZEhUTUwsIEFycmF5PHN0cmluZz5dID0+IHtcbiAgLy8gSW5zZXJ0IG1ha2VycyBpbnRvIHRoZSB0ZW1wbGF0ZSBIVE1MIHRvIHJlcHJlc2VudCB0aGUgcG9zaXRpb24gb2ZcbiAgLy8gYmluZGluZ3MuIFRoZSBmb2xsb3dpbmcgY29kZSBzY2FucyB0aGUgdGVtcGxhdGUgc3RyaW5ncyB0byBkZXRlcm1pbmUgdGhlXG4gIC8vIHN5bnRhY3RpYyBwb3NpdGlvbiBvZiB0aGUgYmluZGluZ3MuIFRoZXkgY2FuIGJlIGluIHRleHQgcG9zaXRpb24sIHdoZXJlXG4gIC8vIHdlIGluc2VydCBhbiBIVE1MIGNvbW1lbnQsIGF0dHJpYnV0ZSB2YWx1ZSBwb3NpdGlvbiwgd2hlcmUgd2UgaW5zZXJ0IGFcbiAgLy8gc2VudGluZWwgc3RyaW5nIGFuZCByZS13cml0ZSB0aGUgYXR0cmlidXRlIG5hbWUsIG9yIGluc2lkZSBhIHRhZyB3aGVyZVxuICAvLyB3ZSBpbnNlcnQgdGhlIHNlbnRpbmVsIHN0cmluZy5cbiAgY29uc3QgbCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgLy8gU3RvcmVzIHRoZSBjYXNlLXNlbnNpdGl2ZSBib3VuZCBhdHRyaWJ1dGUgbmFtZXMgaW4gdGhlIG9yZGVyIG9mIHRoZWlyXG4gIC8vIHBhcnRzLiBFbGVtZW50UGFydHMgYXJlIGFsc28gcmVmbGVjdGVkIGluIHRoaXMgYXJyYXkgYXMgdW5kZWZpbmVkXG4gIC8vIHJhdGhlciB0aGFuIGEgc3RyaW5nLCB0byBkaXNhbWJpZ3VhdGUgZnJvbSBhdHRyaWJ1dGUgYmluZGluZ3MuXG4gIGNvbnN0IGF0dHJOYW1lczogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICBsZXQgaHRtbCA9XG4gICAgdHlwZSA9PT0gU1ZHX1JFU1VMVCA/ICc8c3ZnPicgOiB0eXBlID09PSBNQVRITUxfUkVTVUxUID8gJzxtYXRoPicgOiAnJztcblxuICAvLyBXaGVuIHdlJ3JlIGluc2lkZSBhIHJhdyB0ZXh0IHRhZyAobm90IGl0J3MgdGV4dCBjb250ZW50KSwgdGhlIHJlZ2V4XG4gIC8vIHdpbGwgc3RpbGwgYmUgdGFnUmVnZXggc28gd2UgY2FuIGZpbmQgYXR0cmlidXRlcywgYnV0IHdpbGwgc3dpdGNoIHRvXG4gIC8vIHRoaXMgcmVnZXggd2hlbiB0aGUgdGFnIGVuZHMuXG4gIGxldCByYXdUZXh0RW5kUmVnZXg6IFJlZ0V4cCB8IHVuZGVmaW5lZDtcblxuICAvLyBUaGUgY3VycmVudCBwYXJzaW5nIHN0YXRlLCByZXByZXNlbnRlZCBhcyBhIHJlZmVyZW5jZSB0byBvbmUgb2YgdGhlXG4gIC8vIHJlZ2V4ZXNcbiAgbGV0IHJlZ2V4ID0gdGV4dEVuZFJlZ2V4O1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgY29uc3QgcyA9IHN0cmluZ3NbaV07XG4gICAgLy8gVGhlIGluZGV4IG9mIHRoZSBlbmQgb2YgdGhlIGxhc3QgYXR0cmlidXRlIG5hbWUuIFdoZW4gdGhpcyBpc1xuICAgIC8vIHBvc2l0aXZlIGF0IGVuZCBvZiBhIHN0cmluZywgaXQgbWVhbnMgd2UncmUgaW4gYW4gYXR0cmlidXRlIHZhbHVlXG4gICAgLy8gcG9zaXRpb24gYW5kIG5lZWQgdG8gcmV3cml0ZSB0aGUgYXR0cmlidXRlIG5hbWUuXG4gICAgLy8gV2UgYWxzbyB1c2UgYSBzcGVjaWFsIHZhbHVlIG9mIC0yIHRvIGluZGljYXRlIHRoYXQgd2UgZW5jb3VudGVyZWRcbiAgICAvLyB0aGUgZW5kIG9mIGEgc3RyaW5nIGluIGF0dHJpYnV0ZSBuYW1lIHBvc2l0aW9uLlxuICAgIGxldCBhdHRyTmFtZUVuZEluZGV4ID0gLTE7XG4gICAgbGV0IGF0dHJOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgbGV0IGxhc3RJbmRleCA9IDA7XG4gICAgbGV0IG1hdGNoITogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcblxuICAgIC8vIFRoZSBjb25kaXRpb25zIGluIHRoaXMgbG9vcCBoYW5kbGUgdGhlIGN1cnJlbnQgcGFyc2Ugc3RhdGUsIGFuZCB0aGVcbiAgICAvLyBhc3NpZ25tZW50cyB0byB0aGUgYHJlZ2V4YCB2YXJpYWJsZSBhcmUgdGhlIHN0YXRlIHRyYW5zaXRpb25zLlxuICAgIHdoaWxlIChsYXN0SW5kZXggPCBzLmxlbmd0aCkge1xuICAgICAgLy8gTWFrZSBzdXJlIHdlIHN0YXJ0IHNlYXJjaGluZyBmcm9tIHdoZXJlIHdlIHByZXZpb3VzbHkgbGVmdCBvZmZcbiAgICAgIHJlZ2V4Lmxhc3RJbmRleCA9IGxhc3RJbmRleDtcbiAgICAgIG1hdGNoID0gcmVnZXguZXhlYyhzKTtcbiAgICAgIGlmIChtYXRjaCA9PT0gbnVsbCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGxhc3RJbmRleCA9IHJlZ2V4Lmxhc3RJbmRleDtcbiAgICAgIGlmIChyZWdleCA9PT0gdGV4dEVuZFJlZ2V4KSB7XG4gICAgICAgIGlmIChtYXRjaFtDT01NRU5UX1NUQVJUXSA9PT0gJyEtLScpIHtcbiAgICAgICAgICByZWdleCA9IGNvbW1lbnRFbmRSZWdleDtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFtDT01NRU5UX1NUQVJUXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gV2Ugc3RhcnRlZCBhIHdlaXJkIGNvbW1lbnQsIGxpa2UgPC97XG4gICAgICAgICAgcmVnZXggPSBjb21tZW50MkVuZFJlZ2V4O1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoW1RBR19OQU1FXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKHJhd1RleHRFbGVtZW50LnRlc3QobWF0Y2hbVEFHX05BTUVdKSkge1xuICAgICAgICAgICAgLy8gUmVjb3JkIGlmIHdlIGVuY291bnRlciBhIHJhdy10ZXh0IGVsZW1lbnQuIFdlJ2xsIHN3aXRjaCB0b1xuICAgICAgICAgICAgLy8gdGhpcyByZWdleCBhdCB0aGUgZW5kIG9mIHRoZSB0YWcuXG4gICAgICAgICAgICByYXdUZXh0RW5kUmVnZXggPSBuZXcgUmVnRXhwKGA8LyR7bWF0Y2hbVEFHX05BTUVdfWAsICdnJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZ2V4ID0gdGFnRW5kUmVnZXg7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbRFlOQU1JQ19UQUdfTkFNRV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnQmluZGluZ3MgaW4gdGFnIG5hbWVzIGFyZSBub3Qgc3VwcG9ydGVkLiBQbGVhc2UgdXNlIHN0YXRpYyB0ZW1wbGF0ZXMgaW5zdGVhZC4gJyArXG4gICAgICAgICAgICAgICAgJ1NlZSBodHRwczovL2xpdC5kZXYvZG9jcy90ZW1wbGF0ZXMvZXhwcmVzc2lvbnMvI3N0YXRpYy1leHByZXNzaW9ucydcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZ2V4ID0gdGFnRW5kUmVnZXg7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocmVnZXggPT09IHRhZ0VuZFJlZ2V4KSB7XG4gICAgICAgIGlmIChtYXRjaFtFTlRJUkVfTUFUQ0hdID09PSAnPicpIHtcbiAgICAgICAgICAvLyBFbmQgb2YgYSB0YWcuIElmIHdlIGhhZCBzdGFydGVkIGEgcmF3LXRleHQgZWxlbWVudCwgdXNlIHRoYXRcbiAgICAgICAgICAvLyByZWdleFxuICAgICAgICAgIHJlZ2V4ID0gcmF3VGV4dEVuZFJlZ2V4ID8/IHRleHRFbmRSZWdleDtcbiAgICAgICAgICAvLyBXZSBtYXkgYmUgZW5kaW5nIGFuIHVucXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZSwgc28gbWFrZSBzdXJlIHdlXG4gICAgICAgICAgLy8gY2xlYXIgYW55IHBlbmRpbmcgYXR0ck5hbWVFbmRJbmRleFxuICAgICAgICAgIGF0dHJOYW1lRW5kSW5kZXggPSAtMTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFtBVFRSSUJVVEVfTkFNRV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIEF0dHJpYnV0ZSBuYW1lIHBvc2l0aW9uXG4gICAgICAgICAgYXR0ck5hbWVFbmRJbmRleCA9IC0yO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF0dHJOYW1lRW5kSW5kZXggPSByZWdleC5sYXN0SW5kZXggLSBtYXRjaFtTUEFDRVNfQU5EX0VRVUFMU10ubGVuZ3RoO1xuICAgICAgICAgIGF0dHJOYW1lID0gbWF0Y2hbQVRUUklCVVRFX05BTUVdO1xuICAgICAgICAgIHJlZ2V4ID1cbiAgICAgICAgICAgIG1hdGNoW1FVT1RFX0NIQVJdID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgPyB0YWdFbmRSZWdleFxuICAgICAgICAgICAgICA6IG1hdGNoW1FVT1RFX0NIQVJdID09PSAnXCInXG4gICAgICAgICAgICAgICAgPyBkb3VibGVRdW90ZUF0dHJFbmRSZWdleFxuICAgICAgICAgICAgICAgIDogc2luZ2xlUXVvdGVBdHRyRW5kUmVnZXg7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHJlZ2V4ID09PSBkb3VibGVRdW90ZUF0dHJFbmRSZWdleCB8fFxuICAgICAgICByZWdleCA9PT0gc2luZ2xlUXVvdGVBdHRyRW5kUmVnZXhcbiAgICAgICkge1xuICAgICAgICByZWdleCA9IHRhZ0VuZFJlZ2V4O1xuICAgICAgfSBlbHNlIGlmIChyZWdleCA9PT0gY29tbWVudEVuZFJlZ2V4IHx8IHJlZ2V4ID09PSBjb21tZW50MkVuZFJlZ2V4KSB7XG4gICAgICAgIHJlZ2V4ID0gdGV4dEVuZFJlZ2V4O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTm90IG9uZSBvZiB0aGUgZml2ZSBzdGF0ZSByZWdleGVzLCBzbyBpdCBtdXN0IGJlIHRoZSBkeW5hbWljYWxseVxuICAgICAgICAvLyBjcmVhdGVkIHJhdyB0ZXh0IHJlZ2V4IGFuZCB3ZSdyZSBhdCB0aGUgY2xvc2Ugb2YgdGhhdCBlbGVtZW50LlxuICAgICAgICByZWdleCA9IHRhZ0VuZFJlZ2V4O1xuICAgICAgICByYXdUZXh0RW5kUmVnZXggPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAvLyBJZiB3ZSBoYXZlIGEgYXR0ck5hbWVFbmRJbmRleCwgd2hpY2ggaW5kaWNhdGVzIHRoYXQgd2Ugc2hvdWxkXG4gICAgICAvLyByZXdyaXRlIHRoZSBhdHRyaWJ1dGUgbmFtZSwgYXNzZXJ0IHRoYXQgd2UncmUgaW4gYSB2YWxpZCBhdHRyaWJ1dGVcbiAgICAgIC8vIHBvc2l0aW9uIC0gZWl0aGVyIGluIGEgdGFnLCBvciBhIHF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUuXG4gICAgICBjb25zb2xlLmFzc2VydChcbiAgICAgICAgYXR0ck5hbWVFbmRJbmRleCA9PT0gLTEgfHxcbiAgICAgICAgICByZWdleCA9PT0gdGFnRW5kUmVnZXggfHxcbiAgICAgICAgICByZWdleCA9PT0gc2luZ2xlUXVvdGVBdHRyRW5kUmVnZXggfHxcbiAgICAgICAgICByZWdleCA9PT0gZG91YmxlUXVvdGVBdHRyRW5kUmVnZXgsXG4gICAgICAgICd1bmV4cGVjdGVkIHBhcnNlIHN0YXRlIEInXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFdlIGhhdmUgZm91ciBjYXNlczpcbiAgICAvLyAgMS4gV2UncmUgaW4gdGV4dCBwb3NpdGlvbiwgYW5kIG5vdCBpbiBhIHJhdyB0ZXh0IGVsZW1lbnRcbiAgICAvLyAgICAgKHJlZ2V4ID09PSB0ZXh0RW5kUmVnZXgpOiBpbnNlcnQgYSBjb21tZW50IG1hcmtlci5cbiAgICAvLyAgMi4gV2UgaGF2ZSBhIG5vbi1uZWdhdGl2ZSBhdHRyTmFtZUVuZEluZGV4IHdoaWNoIG1lYW5zIHdlIG5lZWQgdG9cbiAgICAvLyAgICAgcmV3cml0ZSB0aGUgYXR0cmlidXRlIG5hbWUgdG8gYWRkIGEgYm91bmQgYXR0cmlidXRlIHN1ZmZpeC5cbiAgICAvLyAgMy4gV2UncmUgYXQgdGhlIG5vbi1maXJzdCBiaW5kaW5nIGluIGEgbXVsdGktYmluZGluZyBhdHRyaWJ1dGUsIHVzZSBhXG4gICAgLy8gICAgIHBsYWluIG1hcmtlci5cbiAgICAvLyAgNC4gV2UncmUgc29tZXdoZXJlIGVsc2UgaW5zaWRlIHRoZSB0YWcuIElmIHdlJ3JlIGluIGF0dHJpYnV0ZSBuYW1lXG4gICAgLy8gICAgIHBvc2l0aW9uIChhdHRyTmFtZUVuZEluZGV4ID09PSAtMiksIGFkZCBhIHNlcXVlbnRpYWwgc3VmZml4IHRvXG4gICAgLy8gICAgIGdlbmVyYXRlIGEgdW5pcXVlIGF0dHJpYnV0ZSBuYW1lLlxuXG4gICAgLy8gRGV0ZWN0IGEgYmluZGluZyBuZXh0IHRvIHNlbGYtY2xvc2luZyB0YWcgZW5kIGFuZCBpbnNlcnQgYSBzcGFjZSB0b1xuICAgIC8vIHNlcGFyYXRlIHRoZSBtYXJrZXIgZnJvbSB0aGUgdGFnIGVuZDpcbiAgICBjb25zdCBlbmQgPVxuICAgICAgcmVnZXggPT09IHRhZ0VuZFJlZ2V4ICYmIHN0cmluZ3NbaSArIDFdLnN0YXJ0c1dpdGgoJy8+JykgPyAnICcgOiAnJztcbiAgICBodG1sICs9XG4gICAgICByZWdleCA9PT0gdGV4dEVuZFJlZ2V4XG4gICAgICAgID8gcyArIG5vZGVNYXJrZXJcbiAgICAgICAgOiBhdHRyTmFtZUVuZEluZGV4ID49IDBcbiAgICAgICAgICA/IChhdHRyTmFtZXMucHVzaChhdHRyTmFtZSEpLFxuICAgICAgICAgICAgcy5zbGljZSgwLCBhdHRyTmFtZUVuZEluZGV4KSArXG4gICAgICAgICAgICAgIGJvdW5kQXR0cmlidXRlU3VmZml4ICtcbiAgICAgICAgICAgICAgcy5zbGljZShhdHRyTmFtZUVuZEluZGV4KSkgK1xuICAgICAgICAgICAgbWFya2VyICtcbiAgICAgICAgICAgIGVuZFxuICAgICAgICAgIDogcyArIG1hcmtlciArIChhdHRyTmFtZUVuZEluZGV4ID09PSAtMiA/IGkgOiBlbmQpO1xuICB9XG5cbiAgY29uc3QgaHRtbFJlc3VsdDogc3RyaW5nIHwgVHJ1c3RlZEhUTUwgPVxuICAgIGh0bWwgK1xuICAgIChzdHJpbmdzW2xdIHx8ICc8Pz4nKSArXG4gICAgKHR5cGUgPT09IFNWR19SRVNVTFQgPyAnPC9zdmc+JyA6IHR5cGUgPT09IE1BVEhNTF9SRVNVTFQgPyAnPC9tYXRoPicgOiAnJyk7XG5cbiAgLy8gUmV0dXJuZWQgYXMgYW4gYXJyYXkgZm9yIHRlcnNlbmVzc1xuICByZXR1cm4gW3RydXN0RnJvbVRlbXBsYXRlU3RyaW5nKHN0cmluZ3MsIGh0bWxSZXN1bHQpLCBhdHRyTmFtZXNdO1xufTtcblxuLyoqIEBpbnRlcm5hbCAqL1xuZXhwb3J0IHR5cGUge1RlbXBsYXRlfTtcbmNsYXNzIFRlbXBsYXRlIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBlbCE6IEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XG5cbiAgcGFydHM6IEFycmF5PFRlbXBsYXRlUGFydD4gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIHtzdHJpbmdzLCBbJ18kbGl0VHlwZSQnXTogdHlwZX06IFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCxcbiAgICBvcHRpb25zPzogUmVuZGVyT3B0aW9uc1xuICApIHtcbiAgICBsZXQgbm9kZTogTm9kZSB8IG51bGw7XG4gICAgbGV0IG5vZGVJbmRleCA9IDA7XG4gICAgbGV0IGF0dHJOYW1lSW5kZXggPSAwO1xuICAgIGNvbnN0IHBhcnRDb3VudCA9IHN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICBjb25zdCBwYXJ0cyA9IHRoaXMucGFydHM7XG5cbiAgICAvLyBDcmVhdGUgdGVtcGxhdGUgZWxlbWVudFxuICAgIGNvbnN0IFtodG1sLCBhdHRyTmFtZXNdID0gZ2V0VGVtcGxhdGVIdG1sKHN0cmluZ3MsIHR5cGUpO1xuICAgIHRoaXMuZWwgPSBUZW1wbGF0ZS5jcmVhdGVFbGVtZW50KGh0bWwsIG9wdGlvbnMpO1xuICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IHRoaXMuZWwuY29udGVudDtcblxuICAgIC8vIFJlLXBhcmVudCBTVkcgb3IgTWF0aE1MIG5vZGVzIGludG8gdGVtcGxhdGUgcm9vdFxuICAgIGlmICh0eXBlID09PSBTVkdfUkVTVUxUIHx8IHR5cGUgPT09IE1BVEhNTF9SRVNVTFQpIHtcbiAgICAgIGNvbnN0IHdyYXBwZXIgPSB0aGlzLmVsLmNvbnRlbnQuZmlyc3RDaGlsZCE7XG4gICAgICB3cmFwcGVyLnJlcGxhY2VXaXRoKC4uLndyYXBwZXIuY2hpbGROb2Rlcyk7XG4gICAgfVxuXG4gICAgLy8gV2FsayB0aGUgdGVtcGxhdGUgdG8gZmluZCBiaW5kaW5nIG1hcmtlcnMgYW5kIGNyZWF0ZSBUZW1wbGF0ZVBhcnRzXG4gICAgd2hpbGUgKChub2RlID0gd2Fsa2VyLm5leHROb2RlKCkpICE9PSBudWxsICYmIHBhcnRzLmxlbmd0aCA8IHBhcnRDb3VudCkge1xuICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAgICAgY29uc3QgdGFnID0gKG5vZGUgYXMgRWxlbWVudCkubG9jYWxOYW1lO1xuICAgICAgICAgIC8vIFdhcm4gaWYgYHRleHRhcmVhYCBpbmNsdWRlcyBhbiBleHByZXNzaW9uIGFuZCB0aHJvdyBpZiBgdGVtcGxhdGVgXG4gICAgICAgICAgLy8gZG9lcyBzaW5jZSB0aGVzZSBhcmUgbm90IHN1cHBvcnRlZC4gV2UgZG8gdGhpcyBieSBjaGVja2luZ1xuICAgICAgICAgIC8vIGlubmVySFRNTCBmb3IgYW55dGhpbmcgdGhhdCBsb29rcyBsaWtlIGEgbWFya2VyLiBUaGlzIGNhdGNoZXNcbiAgICAgICAgICAvLyBjYXNlcyBsaWtlIGJpbmRpbmdzIGluIHRleHRhcmVhIHRoZXJlIG1hcmtlcnMgdHVybiBpbnRvIHRleHQgbm9kZXMuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgL14oPzp0ZXh0YXJlYXx0ZW1wbGF0ZSkkL2khLnRlc3QodGFnKSAmJlxuICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkuaW5uZXJIVE1MLmluY2x1ZGVzKG1hcmtlcilcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IG0gPVxuICAgICAgICAgICAgICBgRXhwcmVzc2lvbnMgYXJlIG5vdCBzdXBwb3J0ZWQgaW5zaWRlIFxcYCR7dGFnfVxcYCBgICtcbiAgICAgICAgICAgICAgYGVsZW1lbnRzLiBTZWUgaHR0cHM6Ly9saXQuZGV2L21zZy9leHByZXNzaW9uLWluLSR7dGFnfSBmb3IgbW9yZSBgICtcbiAgICAgICAgICAgICAgYGluZm9ybWF0aW9uLmA7XG4gICAgICAgICAgICBpZiAodGFnID09PSAndGVtcGxhdGUnKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtKTtcbiAgICAgICAgICAgIH0gZWxzZSBpc3N1ZVdhcm5pbmcoJycsIG0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPIChqdXN0aW5mYWduYW5pKTogZm9yIGF0dGVtcHRlZCBkeW5hbWljIHRhZyBuYW1lcywgd2UgZG9uJ3RcbiAgICAgICAgLy8gaW5jcmVtZW50IHRoZSBiaW5kaW5nSW5kZXgsIGFuZCBpdCdsbCBiZSBvZmYgYnkgMSBpbiB0aGUgZWxlbWVudFxuICAgICAgICAvLyBhbmQgb2ZmIGJ5IHR3byBhZnRlciBpdC5cbiAgICAgICAgaWYgKChub2RlIGFzIEVsZW1lbnQpLmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiAobm9kZSBhcyBFbGVtZW50KS5nZXRBdHRyaWJ1dGVOYW1lcygpKSB7XG4gICAgICAgICAgICBpZiAobmFtZS5lbmRzV2l0aChib3VuZEF0dHJpYnV0ZVN1ZmZpeCkpIHtcbiAgICAgICAgICAgICAgY29uc3QgcmVhbE5hbWUgPSBhdHRyTmFtZXNbYXR0ck5hbWVJbmRleCsrXTtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSAobm9kZSBhcyBFbGVtZW50KS5nZXRBdHRyaWJ1dGUobmFtZSkhO1xuICAgICAgICAgICAgICBjb25zdCBzdGF0aWNzID0gdmFsdWUuc3BsaXQobWFya2VyKTtcbiAgICAgICAgICAgICAgY29uc3QgbSA9IC8oWy4/QF0pPyguKikvLmV4ZWMocmVhbE5hbWUpITtcbiAgICAgICAgICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogQVRUUklCVVRFX1BBUlQsXG4gICAgICAgICAgICAgICAgaW5kZXg6IG5vZGVJbmRleCxcbiAgICAgICAgICAgICAgICBuYW1lOiBtWzJdLFxuICAgICAgICAgICAgICAgIHN0cmluZ3M6IHN0YXRpY3MsXG4gICAgICAgICAgICAgICAgY3RvcjpcbiAgICAgICAgICAgICAgICAgIG1bMV0gPT09ICcuJ1xuICAgICAgICAgICAgICAgICAgICA/IFByb3BlcnR5UGFydFxuICAgICAgICAgICAgICAgICAgICA6IG1bMV0gPT09ICc/J1xuICAgICAgICAgICAgICAgICAgICAgID8gQm9vbGVhbkF0dHJpYnV0ZVBhcnRcbiAgICAgICAgICAgICAgICAgICAgICA6IG1bMV0gPT09ICdAJ1xuICAgICAgICAgICAgICAgICAgICAgICAgPyBFdmVudFBhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIDogQXR0cmlidXRlUGFydCxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmFtZS5zdGFydHNXaXRoKG1hcmtlcikpIHtcbiAgICAgICAgICAgICAgcGFydHMucHVzaCh7XG4gICAgICAgICAgICAgICAgdHlwZTogRUxFTUVOVF9QQVJULFxuICAgICAgICAgICAgICAgIGluZGV4OiBub2RlSW5kZXgsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiBiZW5jaG1hcmsgdGhlIHJlZ2V4IGFnYWluc3QgdGVzdGluZyBmb3IgZWFjaFxuICAgICAgICAvLyBvZiB0aGUgMyByYXcgdGV4dCBlbGVtZW50IG5hbWVzLlxuICAgICAgICBpZiAocmF3VGV4dEVsZW1lbnQudGVzdCgobm9kZSBhcyBFbGVtZW50KS50YWdOYW1lKSkge1xuICAgICAgICAgIC8vIEZvciByYXcgdGV4dCBlbGVtZW50cyB3ZSBuZWVkIHRvIHNwbGl0IHRoZSB0ZXh0IGNvbnRlbnQgb25cbiAgICAgICAgICAvLyBtYXJrZXJzLCBjcmVhdGUgYSBUZXh0IG5vZGUgZm9yIGVhY2ggc2VnbWVudCwgYW5kIGNyZWF0ZVxuICAgICAgICAgIC8vIGEgVGVtcGxhdGVQYXJ0IGZvciBlYWNoIG1hcmtlci5cbiAgICAgICAgICBjb25zdCBzdHJpbmdzID0gKG5vZGUgYXMgRWxlbWVudCkudGV4dENvbnRlbnQhLnNwbGl0KG1hcmtlcik7XG4gICAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgICAgICAgIGlmIChsYXN0SW5kZXggPiAwKSB7XG4gICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS50ZXh0Q29udGVudCA9IHRydXN0ZWRUeXBlc1xuICAgICAgICAgICAgICA/ICh0cnVzdGVkVHlwZXMuZW1wdHlTY3JpcHQgYXMgdW5rbm93biBhcyAnJylcbiAgICAgICAgICAgICAgOiAnJztcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGEgbmV3IHRleHQgbm9kZSBmb3IgZWFjaCBsaXRlcmFsIHNlY3Rpb25cbiAgICAgICAgICAgIC8vIFRoZXNlIG5vZGVzIGFyZSBhbHNvIHVzZWQgYXMgdGhlIG1hcmtlcnMgZm9yIG5vZGUgcGFydHNcbiAgICAgICAgICAgIC8vIFdlIGNhbid0IHVzZSBlbXB0eSB0ZXh0IG5vZGVzIGFzIG1hcmtlcnMgYmVjYXVzZSB0aGV5J3JlXG4gICAgICAgICAgICAvLyBub3JtYWxpemVkIHdoZW4gY2xvbmluZyBpbiBJRSAoY291bGQgc2ltcGxpZnkgd2hlblxuICAgICAgICAgICAgLy8gSUUgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZClcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFzdEluZGV4OyBpKyspIHtcbiAgICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkuYXBwZW5kKHN0cmluZ3NbaV0sIGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgICAgICAgLy8gV2FsayBwYXN0IHRoZSBtYXJrZXIgbm9kZSB3ZSBqdXN0IGFkZGVkXG4gICAgICAgICAgICAgIHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgICBwYXJ0cy5wdXNoKHt0eXBlOiBDSElMRF9QQVJULCBpbmRleDogKytub2RlSW5kZXh9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE5vdGUgYmVjYXVzZSB0aGlzIG1hcmtlciBpcyBhZGRlZCBhZnRlciB0aGUgd2Fsa2VyJ3MgY3VycmVudFxuICAgICAgICAgICAgLy8gbm9kZSwgaXQgd2lsbCBiZSB3YWxrZWQgdG8gaW4gdGhlIG91dGVyIGxvb3AgKGFuZCBpZ25vcmVkKSwgc29cbiAgICAgICAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gYWRqdXN0IG5vZGVJbmRleCBoZXJlXG4gICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5hcHBlbmQoc3RyaW5nc1tsYXN0SW5kZXhdLCBjcmVhdGVNYXJrZXIoKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09IDgpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IChub2RlIGFzIENvbW1lbnQpLmRhdGE7XG4gICAgICAgIGlmIChkYXRhID09PSBtYXJrZXJNYXRjaCkge1xuICAgICAgICAgIHBhcnRzLnB1c2goe3R5cGU6IENISUxEX1BBUlQsIGluZGV4OiBub2RlSW5kZXh9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXQgaSA9IC0xO1xuICAgICAgICAgIHdoaWxlICgoaSA9IChub2RlIGFzIENvbW1lbnQpLmRhdGEuaW5kZXhPZihtYXJrZXIsIGkgKyAxKSkgIT09IC0xKSB7XG4gICAgICAgICAgICAvLyBDb21tZW50IG5vZGUgaGFzIGEgYmluZGluZyBtYXJrZXIgaW5zaWRlLCBtYWtlIGFuIGluYWN0aXZlIHBhcnRcbiAgICAgICAgICAgIC8vIFRoZSBiaW5kaW5nIHdvbid0IHdvcmssIGJ1dCBzdWJzZXF1ZW50IGJpbmRpbmdzIHdpbGxcbiAgICAgICAgICAgIHBhcnRzLnB1c2goe3R5cGU6IENPTU1FTlRfUEFSVCwgaW5kZXg6IG5vZGVJbmRleH0pO1xuICAgICAgICAgICAgLy8gTW92ZSB0byB0aGUgZW5kIG9mIHRoZSBtYXRjaFxuICAgICAgICAgICAgaSArPSBtYXJrZXIubGVuZ3RoIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5vZGVJbmRleCsrO1xuICAgIH1cblxuICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgLy8gSWYgdGhlcmUgd2FzIGEgZHVwbGljYXRlIGF0dHJpYnV0ZSBvbiBhIHRhZywgdGhlbiB3aGVuIHRoZSB0YWcgaXNcbiAgICAgIC8vIHBhcnNlZCBpbnRvIGFuIGVsZW1lbnQgdGhlIGF0dHJpYnV0ZSBnZXRzIGRlLWR1cGxpY2F0ZWQuIFdlIGNhbiBkZXRlY3RcbiAgICAgIC8vIHRoaXMgbWlzbWF0Y2ggaWYgd2UgaGF2ZW4ndCBwcmVjaXNlbHkgY29uc3VtZWQgZXZlcnkgYXR0cmlidXRlIG5hbWVcbiAgICAgIC8vIHdoZW4gcHJlcGFyaW5nIHRoZSB0ZW1wbGF0ZS4gVGhpcyB3b3JrcyBiZWNhdXNlIGBhdHRyTmFtZXNgIGlzIGJ1aWx0XG4gICAgICAvLyBmcm9tIHRoZSB0ZW1wbGF0ZSBzdHJpbmcgYW5kIGBhdHRyTmFtZUluZGV4YCBjb21lcyBmcm9tIHByb2Nlc3NpbmcgdGhlXG4gICAgICAvLyByZXN1bHRpbmcgRE9NLlxuICAgICAgaWYgKGF0dHJOYW1lcy5sZW5ndGggIT09IGF0dHJOYW1lSW5kZXgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBEZXRlY3RlZCBkdXBsaWNhdGUgYXR0cmlidXRlIGJpbmRpbmdzLiBUaGlzIG9jY3VycyBpZiB5b3VyIHRlbXBsYXRlIGAgK1xuICAgICAgICAgICAgYGhhcyBkdXBsaWNhdGUgYXR0cmlidXRlcyBvbiBhbiBlbGVtZW50IHRhZy4gRm9yIGV4YW1wbGUgYCArXG4gICAgICAgICAgICBgXCI8aW5wdXQgP2Rpc2FibGVkPVxcJHt0cnVlfSA/ZGlzYWJsZWQ9XFwke2ZhbHNlfT5cIiBjb250YWlucyBhIGAgK1xuICAgICAgICAgICAgYGR1cGxpY2F0ZSBcImRpc2FibGVkXCIgYXR0cmlidXRlLiBUaGUgZXJyb3Igd2FzIGRldGVjdGVkIGluIGAgK1xuICAgICAgICAgICAgYHRoZSBmb2xsb3dpbmcgdGVtcGxhdGU6IFxcbmAgK1xuICAgICAgICAgICAgJ2AnICtcbiAgICAgICAgICAgIHN0cmluZ3Muam9pbignJHsuLi59JykgK1xuICAgICAgICAgICAgJ2AnXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2UgY291bGQgc2V0IHdhbGtlci5jdXJyZW50Tm9kZSB0byBhbm90aGVyIG5vZGUgaGVyZSB0byBwcmV2ZW50IGEgbWVtb3J5XG4gICAgLy8gbGVhaywgYnV0IGV2ZXJ5IHRpbWUgd2UgcHJlcGFyZSBhIHRlbXBsYXRlLCB3ZSBpbW1lZGlhdGVseSByZW5kZXIgaXRcbiAgICAvLyBhbmQgcmUtdXNlIHRoZSB3YWxrZXIgaW4gbmV3IFRlbXBsYXRlSW5zdGFuY2UuX2Nsb25lKCkuXG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBwcmVwJyxcbiAgICAgICAgdGVtcGxhdGU6IHRoaXMsXG4gICAgICAgIGNsb25hYmxlVGVtcGxhdGU6IHRoaXMuZWwsXG4gICAgICAgIHBhcnRzOiB0aGlzLnBhcnRzLFxuICAgICAgICBzdHJpbmdzLFxuICAgICAgfSk7XG4gIH1cblxuICAvLyBPdmVycmlkZGVuIHZpYSBgbGl0SHRtbFBvbHlmaWxsU3VwcG9ydGAgdG8gcHJvdmlkZSBwbGF0Zm9ybSBzdXBwb3J0LlxuICAvKiogQG5vY29sbGFwc2UgKi9cbiAgc3RhdGljIGNyZWF0ZUVsZW1lbnQoaHRtbDogVHJ1c3RlZEhUTUwsIF9vcHRpb25zPzogUmVuZGVyT3B0aW9ucykge1xuICAgIGNvbnN0IGVsID0gZC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgIGVsLmlubmVySFRNTCA9IGh0bWwgYXMgdW5rbm93biBhcyBzdHJpbmc7XG4gICAgcmV0dXJuIGVsO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlzY29ubmVjdGFibGUge1xuICBfJHBhcmVudD86IERpc2Nvbm5lY3RhYmxlO1xuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+O1xuICAvLyBSYXRoZXIgdGhhbiBob2xkIGNvbm5lY3Rpb24gc3RhdGUgb24gaW5zdGFuY2VzLCBEaXNjb25uZWN0YWJsZXMgcmVjdXJzaXZlbHlcbiAgLy8gZmV0Y2ggdGhlIGNvbm5lY3Rpb24gc3RhdGUgZnJvbSB0aGUgUm9vdFBhcnQgdGhleSBhcmUgY29ubmVjdGVkIGluIHZpYVxuICAvLyBnZXR0ZXJzIHVwIHRoZSBEaXNjb25uZWN0YWJsZSB0cmVlIHZpYSBfJHBhcmVudCByZWZlcmVuY2VzLiBUaGlzIHB1c2hlcyB0aGVcbiAgLy8gY29zdCBvZiB0cmFja2luZyB0aGUgaXNDb25uZWN0ZWQgc3RhdGUgdG8gYEFzeW5jRGlyZWN0aXZlc2AsIGFuZCBhdm9pZHNcbiAgLy8gbmVlZGluZyB0byBwYXNzIGFsbCBEaXNjb25uZWN0YWJsZXMgKHBhcnRzLCB0ZW1wbGF0ZSBpbnN0YW5jZXMsIGFuZFxuICAvLyBkaXJlY3RpdmVzKSB0aGVpciBjb25uZWN0aW9uIHN0YXRlIGVhY2ggdGltZSBpdCBjaGFuZ2VzLCB3aGljaCB3b3VsZCBiZVxuICAvLyBjb3N0bHkgZm9yIHRyZWVzIHRoYXQgaGF2ZSBubyBBc3luY0RpcmVjdGl2ZXMuXG4gIF8kaXNDb25uZWN0ZWQ6IGJvb2xlYW47XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVEaXJlY3RpdmUoXG4gIHBhcnQ6IENoaWxkUGFydCB8IEF0dHJpYnV0ZVBhcnQgfCBFbGVtZW50UGFydCxcbiAgdmFsdWU6IHVua25vd24sXG4gIHBhcmVudDogRGlyZWN0aXZlUGFyZW50ID0gcGFydCxcbiAgYXR0cmlidXRlSW5kZXg/OiBudW1iZXJcbik6IHVua25vd24ge1xuICAvLyBCYWlsIGVhcmx5IGlmIHRoZSB2YWx1ZSBpcyBleHBsaWNpdGx5IG5vQ2hhbmdlLiBOb3RlLCB0aGlzIG1lYW5zIGFueVxuICAvLyBuZXN0ZWQgZGlyZWN0aXZlIGlzIHN0aWxsIGF0dGFjaGVkIGFuZCBpcyBub3QgcnVuLlxuICBpZiAodmFsdWUgPT09IG5vQ2hhbmdlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGxldCBjdXJyZW50RGlyZWN0aXZlID1cbiAgICBhdHRyaWJ1dGVJbmRleCAhPT0gdW5kZWZpbmVkXG4gICAgICA/IChwYXJlbnQgYXMgQXR0cmlidXRlUGFydCkuX19kaXJlY3RpdmVzPy5bYXR0cmlidXRlSW5kZXhdXG4gICAgICA6IChwYXJlbnQgYXMgQ2hpbGRQYXJ0IHwgRWxlbWVudFBhcnQgfCBEaXJlY3RpdmUpLl9fZGlyZWN0aXZlO1xuICBjb25zdCBuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IgPSBpc1ByaW1pdGl2ZSh2YWx1ZSlcbiAgICA/IHVuZGVmaW5lZFxuICAgIDogLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICAgICh2YWx1ZSBhcyBEaXJlY3RpdmVSZXN1bHQpWydfJGxpdERpcmVjdGl2ZSQnXTtcbiAgaWYgKGN1cnJlbnREaXJlY3RpdmU/LmNvbnN0cnVjdG9yICE9PSBuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IpIHtcbiAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIGN1cnJlbnREaXJlY3RpdmU/LlsnXyRub3RpZnlEaXJlY3RpdmVDb25uZWN0aW9uQ2hhbmdlZCddPy4oZmFsc2UpO1xuICAgIGlmIChuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY3VycmVudERpcmVjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudERpcmVjdGl2ZSA9IG5ldyBuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IocGFydCBhcyBQYXJ0SW5mbyk7XG4gICAgICBjdXJyZW50RGlyZWN0aXZlLl8kaW5pdGlhbGl6ZShwYXJ0LCBwYXJlbnQsIGF0dHJpYnV0ZUluZGV4KTtcbiAgICB9XG4gICAgaWYgKGF0dHJpYnV0ZUluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICgocGFyZW50IGFzIEF0dHJpYnV0ZVBhcnQpLl9fZGlyZWN0aXZlcyA/Pz0gW10pW2F0dHJpYnV0ZUluZGV4XSA9XG4gICAgICAgIGN1cnJlbnREaXJlY3RpdmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIChwYXJlbnQgYXMgQ2hpbGRQYXJ0IHwgRGlyZWN0aXZlKS5fX2RpcmVjdGl2ZSA9IGN1cnJlbnREaXJlY3RpdmU7XG4gICAgfVxuICB9XG4gIGlmIChjdXJyZW50RGlyZWN0aXZlICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YWx1ZSA9IHJlc29sdmVEaXJlY3RpdmUoXG4gICAgICBwYXJ0LFxuICAgICAgY3VycmVudERpcmVjdGl2ZS5fJHJlc29sdmUocGFydCwgKHZhbHVlIGFzIERpcmVjdGl2ZVJlc3VsdCkudmFsdWVzKSxcbiAgICAgIGN1cnJlbnREaXJlY3RpdmUsXG4gICAgICBhdHRyaWJ1dGVJbmRleFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgdHlwZSB7VGVtcGxhdGVJbnN0YW5jZX07XG4vKipcbiAqIEFuIHVwZGF0ZWFibGUgaW5zdGFuY2Ugb2YgYSBUZW1wbGF0ZS4gSG9sZHMgcmVmZXJlbmNlcyB0byB0aGUgUGFydHMgdXNlZCB0b1xuICogdXBkYXRlIHRoZSB0ZW1wbGF0ZSBpbnN0YW5jZS5cbiAqL1xuY2xhc3MgVGVtcGxhdGVJbnN0YW5jZSBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgXyR0ZW1wbGF0ZTogVGVtcGxhdGU7XG4gIF8kcGFydHM6IEFycmF5PFBhcnQgfCB1bmRlZmluZWQ+ID0gW107XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHBhcmVudDogQ2hpbGRQYXJ0O1xuICAvKiogQGludGVybmFsICovXG4gIF8kZGlzY29ubmVjdGFibGVDaGlsZHJlbj86IFNldDxEaXNjb25uZWN0YWJsZT4gPSB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IodGVtcGxhdGU6IFRlbXBsYXRlLCBwYXJlbnQ6IENoaWxkUGFydCkge1xuICAgIHRoaXMuXyR0ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIHRoaXMuXyRwYXJlbnQgPSBwYXJlbnQ7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgQ2hpbGRQYXJ0IHBhcmVudE5vZGUgZ2V0dGVyXG4gIGdldCBwYXJlbnROb2RlKCkge1xuICAgIHJldHVybiB0aGlzLl8kcGFyZW50LnBhcmVudE5vZGU7XG4gIH1cblxuICAvLyBTZWUgY29tbWVudCBpbiBEaXNjb25uZWN0YWJsZSBpbnRlcmZhY2UgZm9yIHdoeSB0aGlzIGlzIGEgZ2V0dGVyXG4gIGdldCBfJGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl8kcGFyZW50Ll8kaXNDb25uZWN0ZWQ7XG4gIH1cblxuICAvLyBUaGlzIG1ldGhvZCBpcyBzZXBhcmF0ZSBmcm9tIHRoZSBjb25zdHJ1Y3RvciBiZWNhdXNlIHdlIG5lZWQgdG8gcmV0dXJuIGFcbiAgLy8gRG9jdW1lbnRGcmFnbWVudCBhbmQgd2UgZG9uJ3Qgd2FudCB0byBob2xkIG9udG8gaXQgd2l0aCBhbiBpbnN0YW5jZSBmaWVsZC5cbiAgX2Nsb25lKG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQpIHtcbiAgICBjb25zdCB7XG4gICAgICBlbDoge2NvbnRlbnR9LFxuICAgICAgcGFydHM6IHBhcnRzLFxuICAgIH0gPSB0aGlzLl8kdGVtcGxhdGU7XG4gICAgY29uc3QgZnJhZ21lbnQgPSAob3B0aW9ucz8uY3JlYXRpb25TY29wZSA/PyBkKS5pbXBvcnROb2RlKGNvbnRlbnQsIHRydWUpO1xuICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IGZyYWdtZW50O1xuXG4gICAgbGV0IG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKSE7XG4gICAgbGV0IG5vZGVJbmRleCA9IDA7XG4gICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgbGV0IHRlbXBsYXRlUGFydCA9IHBhcnRzWzBdO1xuXG4gICAgd2hpbGUgKHRlbXBsYXRlUGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAobm9kZUluZGV4ID09PSB0ZW1wbGF0ZVBhcnQuaW5kZXgpIHtcbiAgICAgICAgbGV0IHBhcnQ6IFBhcnQgfCB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0ZW1wbGF0ZVBhcnQudHlwZSA9PT0gQ0hJTERfUEFSVCkge1xuICAgICAgICAgIHBhcnQgPSBuZXcgQ2hpbGRQYXJ0KFxuICAgICAgICAgICAgbm9kZSBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICAgIG5vZGUubmV4dFNpYmxpbmcsXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGVtcGxhdGVQYXJ0LnR5cGUgPT09IEFUVFJJQlVURV9QQVJUKSB7XG4gICAgICAgICAgcGFydCA9IG5ldyB0ZW1wbGF0ZVBhcnQuY3RvcihcbiAgICAgICAgICAgIG5vZGUgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgICB0ZW1wbGF0ZVBhcnQubmFtZSxcbiAgICAgICAgICAgIHRlbXBsYXRlUGFydC5zdHJpbmdzLFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRlbXBsYXRlUGFydC50eXBlID09PSBFTEVNRU5UX1BBUlQpIHtcbiAgICAgICAgICBwYXJ0ID0gbmV3IEVsZW1lbnRQYXJ0KG5vZGUgYXMgSFRNTEVsZW1lbnQsIHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuXyRwYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICB0ZW1wbGF0ZVBhcnQgPSBwYXJ0c1srK3BhcnRJbmRleF07XG4gICAgICB9XG4gICAgICBpZiAobm9kZUluZGV4ICE9PSB0ZW1wbGF0ZVBhcnQ/LmluZGV4KSB7XG4gICAgICAgIG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKSE7XG4gICAgICAgIG5vZGVJbmRleCsrO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBXZSBuZWVkIHRvIHNldCB0aGUgY3VycmVudE5vZGUgYXdheSBmcm9tIHRoZSBjbG9uZWQgdHJlZSBzbyB0aGF0IHdlXG4gICAgLy8gZG9uJ3QgaG9sZCBvbnRvIHRoZSB0cmVlIGV2ZW4gaWYgdGhlIHRyZWUgaXMgZGV0YWNoZWQgYW5kIHNob3VsZCBiZVxuICAgIC8vIGZyZWVkLlxuICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IGQ7XG4gICAgcmV0dXJuIGZyYWdtZW50O1xuICB9XG5cbiAgX3VwZGF0ZSh2YWx1ZXM6IEFycmF5PHVua25vd24+KSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcGFydCBvZiB0aGlzLl8kcGFydHMpIHtcbiAgICAgIGlmIChwYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgICAga2luZDogJ3NldCBwYXJ0JyxcbiAgICAgICAgICAgIHBhcnQsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVzW2ldLFxuICAgICAgICAgICAgdmFsdWVJbmRleDogaSxcbiAgICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgICAgIHRlbXBsYXRlSW5zdGFuY2U6IHRoaXMsXG4gICAgICAgICAgfSk7XG4gICAgICAgIGlmICgocGFydCBhcyBBdHRyaWJ1dGVQYXJ0KS5zdHJpbmdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAocGFydCBhcyBBdHRyaWJ1dGVQYXJ0KS5fJHNldFZhbHVlKHZhbHVlcywgcGFydCBhcyBBdHRyaWJ1dGVQYXJ0LCBpKTtcbiAgICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIHZhbHVlcyB0aGUgcGFydCBjb25zdW1lcyBpcyBwYXJ0LnN0cmluZ3MubGVuZ3RoIC0gMVxuICAgICAgICAgIC8vIHNpbmNlIHZhbHVlcyBhcmUgaW4gYmV0d2VlbiB0ZW1wbGF0ZSBzcGFucy4gV2UgaW5jcmVtZW50IGkgYnkgMVxuICAgICAgICAgIC8vIGxhdGVyIGluIHRoZSBsb29wLCBzbyBpbmNyZW1lbnQgaXQgYnkgcGFydC5zdHJpbmdzLmxlbmd0aCAtIDIgaGVyZVxuICAgICAgICAgIGkgKz0gKHBhcnQgYXMgQXR0cmlidXRlUGFydCkuc3RyaW5ncyEubGVuZ3RoIC0gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXJ0Ll8kc2V0VmFsdWUodmFsdWVzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgfVxufVxuXG4vKlxuICogUGFydHNcbiAqL1xudHlwZSBBdHRyaWJ1dGVUZW1wbGF0ZVBhcnQgPSB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBBVFRSSUJVVEVfUEFSVDtcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICByZWFkb25seSBjdG9yOiB0eXBlb2YgQXR0cmlidXRlUGFydDtcbiAgcmVhZG9ubHkgc3RyaW5nczogUmVhZG9ubHlBcnJheTxzdHJpbmc+O1xufTtcbnR5cGUgQ2hpbGRUZW1wbGF0ZVBhcnQgPSB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBDSElMRF9QQVJUO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xufTtcbnR5cGUgRWxlbWVudFRlbXBsYXRlUGFydCA9IHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIEVMRU1FTlRfUEFSVDtcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbn07XG50eXBlIENvbW1lbnRUZW1wbGF0ZVBhcnQgPSB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBDT01NRU5UX1BBUlQ7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG59O1xuXG4vKipcbiAqIEEgVGVtcGxhdGVQYXJ0IHJlcHJlc2VudHMgYSBkeW5hbWljIHBhcnQgaW4gYSB0ZW1wbGF0ZSwgYmVmb3JlIHRoZSB0ZW1wbGF0ZVxuICogaXMgaW5zdGFudGlhdGVkLiBXaGVuIGEgdGVtcGxhdGUgaXMgaW5zdGFudGlhdGVkIFBhcnRzIGFyZSBjcmVhdGVkIGZyb21cbiAqIFRlbXBsYXRlUGFydHMuXG4gKi9cbnR5cGUgVGVtcGxhdGVQYXJ0ID1cbiAgfCBDaGlsZFRlbXBsYXRlUGFydFxuICB8IEF0dHJpYnV0ZVRlbXBsYXRlUGFydFxuICB8IEVsZW1lbnRUZW1wbGF0ZVBhcnRcbiAgfCBDb21tZW50VGVtcGxhdGVQYXJ0O1xuXG5leHBvcnQgdHlwZSBQYXJ0ID1cbiAgfCBDaGlsZFBhcnRcbiAgfCBBdHRyaWJ1dGVQYXJ0XG4gIHwgUHJvcGVydHlQYXJ0XG4gIHwgQm9vbGVhbkF0dHJpYnV0ZVBhcnRcbiAgfCBFbGVtZW50UGFydFxuICB8IEV2ZW50UGFydDtcblxuZXhwb3J0IHR5cGUge0NoaWxkUGFydH07XG5jbGFzcyBDaGlsZFBhcnQgaW1wbGVtZW50cyBEaXNjb25uZWN0YWJsZSB7XG4gIHJlYWRvbmx5IHR5cGUgPSBDSElMRF9QQVJUO1xuICByZWFkb25seSBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICBfJGNvbW1pdHRlZFZhbHVlOiB1bmtub3duID0gbm90aGluZztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfX2RpcmVjdGl2ZT86IERpcmVjdGl2ZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHN0YXJ0Tm9kZTogQ2hpbGROb2RlO1xuICAvKiogQGludGVybmFsICovXG4gIF8kZW5kTm9kZTogQ2hpbGROb2RlIHwgbnVsbDtcbiAgcHJpdmF0ZSBfdGV4dFNhbml0aXplcjogVmFsdWVTYW5pdGl6ZXIgfCB1bmRlZmluZWQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlIHwgdW5kZWZpbmVkO1xuICAvKipcbiAgICogQ29ubmVjdGlvbiBzdGF0ZSBmb3IgUm9vdFBhcnRzIG9ubHkgKGkuZS4gQ2hpbGRQYXJ0IHdpdGhvdXQgXyRwYXJlbnRcbiAgICogcmV0dXJuZWQgZnJvbSB0b3AtbGV2ZWwgYHJlbmRlcmApLiBUaGlzIGZpZWxkIGlzIHVudXNlZCBvdGhlcndpc2UuIFRoZVxuICAgKiBpbnRlbnRpb24gd291bGQgYmUgY2xlYXJlciBpZiB3ZSBtYWRlIGBSb290UGFydGAgYSBzdWJjbGFzcyBvZiBgQ2hpbGRQYXJ0YFxuICAgKiB3aXRoIHRoaXMgZmllbGQgKGFuZCBhIGRpZmZlcmVudCBfJGlzQ29ubmVjdGVkIGdldHRlciksIGJ1dCB0aGUgc3ViY2xhc3NcbiAgICogY2F1c2VkIGEgcGVyZiByZWdyZXNzaW9uLCBwb3NzaWJseSBkdWUgdG8gbWFraW5nIGNhbGwgc2l0ZXMgcG9seW1vcnBoaWMuXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX19pc0Nvbm5lY3RlZDogYm9vbGVhbjtcblxuICAvLyBTZWUgY29tbWVudCBpbiBEaXNjb25uZWN0YWJsZSBpbnRlcmZhY2UgZm9yIHdoeSB0aGlzIGlzIGEgZ2V0dGVyXG4gIGdldCBfJGlzQ29ubmVjdGVkKCkge1xuICAgIC8vIENoaWxkUGFydHMgdGhhdCBhcmUgbm90IGF0IHRoZSByb290IHNob3VsZCBhbHdheXMgYmUgY3JlYXRlZCB3aXRoIGFcbiAgICAvLyBwYXJlbnQ7IG9ubHkgUm9vdENoaWxkTm9kZSdzIHdvbid0LCBzbyB0aGV5IHJldHVybiB0aGUgbG9jYWwgaXNDb25uZWN0ZWRcbiAgICAvLyBzdGF0ZVxuICAgIHJldHVybiB0aGlzLl8kcGFyZW50Py5fJGlzQ29ubmVjdGVkID8/IHRoaXMuX19pc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIC8vIFRoZSBmb2xsb3dpbmcgZmllbGRzIHdpbGwgYmUgcGF0Y2hlZCBvbnRvIENoaWxkUGFydHMgd2hlbiByZXF1aXJlZCBieVxuICAvLyBBc3luY0RpcmVjdGl2ZVxuICAvKiogQGludGVybmFsICovXG4gIF8kZGlzY29ubmVjdGFibGVDaGlsZHJlbj86IFNldDxEaXNjb25uZWN0YWJsZT4gPSB1bmRlZmluZWQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZD8oXG4gICAgaXNDb25uZWN0ZWQ6IGJvb2xlYW4sXG4gICAgcmVtb3ZlRnJvbVBhcmVudD86IGJvb2xlYW4sXG4gICAgZnJvbT86IG51bWJlclxuICApOiB2b2lkO1xuICAvKiogQGludGVybmFsICovXG4gIF8kcmVwYXJlbnREaXNjb25uZWN0YWJsZXM/KHBhcmVudDogRGlzY29ubmVjdGFibGUpOiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHN0YXJ0Tm9kZTogQ2hpbGROb2RlLFxuICAgIGVuZE5vZGU6IENoaWxkTm9kZSB8IG51bGwsXG4gICAgcGFyZW50OiBUZW1wbGF0ZUluc3RhbmNlIHwgQ2hpbGRQYXJ0IHwgdW5kZWZpbmVkLFxuICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWRcbiAgKSB7XG4gICAgdGhpcy5fJHN0YXJ0Tm9kZSA9IHN0YXJ0Tm9kZTtcbiAgICB0aGlzLl8kZW5kTm9kZSA9IGVuZE5vZGU7XG4gICAgdGhpcy5fJHBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIC8vIE5vdGUgX19pc0Nvbm5lY3RlZCBpcyBvbmx5IGV2ZXIgYWNjZXNzZWQgb24gUm9vdFBhcnRzIChpLmUuIHdoZW4gdGhlcmUgaXNcbiAgICAvLyBubyBfJHBhcmVudCk7IHRoZSB2YWx1ZSBvbiBhIG5vbi1yb290LXBhcnQgaXMgXCJkb24ndCBjYXJlXCIsIGJ1dCBjaGVja2luZ1xuICAgIC8vIGZvciBwYXJlbnQgd291bGQgYmUgbW9yZSBjb2RlXG4gICAgdGhpcy5fX2lzQ29ubmVjdGVkID0gb3B0aW9ucz8uaXNDb25uZWN0ZWQgPz8gdHJ1ZTtcbiAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICAvLyBFeHBsaWNpdGx5IGluaXRpYWxpemUgZm9yIGNvbnNpc3RlbnQgY2xhc3Mgc2hhcGUuXG4gICAgICB0aGlzLl90ZXh0U2FuaXRpemVyID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcGFyZW50IG5vZGUgaW50byB3aGljaCB0aGUgcGFydCByZW5kZXJzIGl0cyBjb250ZW50LlxuICAgKlxuICAgKiBBIENoaWxkUGFydCdzIGNvbnRlbnQgY29uc2lzdHMgb2YgYSByYW5nZSBvZiBhZGphY2VudCBjaGlsZCBub2RlcyBvZlxuICAgKiBgLnBhcmVudE5vZGVgLCBwb3NzaWJseSBib3JkZXJlZCBieSAnbWFya2VyIG5vZGVzJyAoYC5zdGFydE5vZGVgIGFuZFxuICAgKiBgLmVuZE5vZGVgKS5cbiAgICpcbiAgICogLSBJZiBib3RoIGAuc3RhcnROb2RlYCBhbmQgYC5lbmROb2RlYCBhcmUgbm9uLW51bGwsIHRoZW4gdGhlIHBhcnQncyBjb250ZW50XG4gICAqIGNvbnNpc3RzIG9mIGFsbCBzaWJsaW5ncyBiZXR3ZWVuIGAuc3RhcnROb2RlYCBhbmQgYC5lbmROb2RlYCwgZXhjbHVzaXZlbHkuXG4gICAqXG4gICAqIC0gSWYgYC5zdGFydE5vZGVgIGlzIG5vbi1udWxsIGJ1dCBgLmVuZE5vZGVgIGlzIG51bGwsIHRoZW4gdGhlIHBhcnQnc1xuICAgKiBjb250ZW50IGNvbnNpc3RzIG9mIGFsbCBzaWJsaW5ncyBmb2xsb3dpbmcgYC5zdGFydE5vZGVgLCB1cCB0byBhbmRcbiAgICogaW5jbHVkaW5nIHRoZSBsYXN0IGNoaWxkIG9mIGAucGFyZW50Tm9kZWAuIElmIGAuZW5kTm9kZWAgaXMgbm9uLW51bGwsIHRoZW5cbiAgICogYC5zdGFydE5vZGVgIHdpbGwgYWx3YXlzIGJlIG5vbi1udWxsLlxuICAgKlxuICAgKiAtIElmIGJvdGggYC5lbmROb2RlYCBhbmQgYC5zdGFydE5vZGVgIGFyZSBudWxsLCB0aGVuIHRoZSBwYXJ0J3MgY29udGVudFxuICAgKiBjb25zaXN0cyBvZiBhbGwgY2hpbGQgbm9kZXMgb2YgYC5wYXJlbnROb2RlYC5cbiAgICovXG4gIGdldCBwYXJlbnROb2RlKCk6IE5vZGUge1xuICAgIGxldCBwYXJlbnROb2RlOiBOb2RlID0gd3JhcCh0aGlzLl8kc3RhcnROb2RlKS5wYXJlbnROb2RlITtcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl8kcGFyZW50O1xuICAgIGlmIChcbiAgICAgIHBhcmVudCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBwYXJlbnROb2RlPy5ub2RlVHlwZSA9PT0gMTEgLyogTm9kZS5ET0NVTUVOVF9GUkFHTUVOVCAqL1xuICAgICkge1xuICAgICAgLy8gSWYgdGhlIHBhcmVudE5vZGUgaXMgYSBEb2N1bWVudEZyYWdtZW50LCBpdCBtYXkgYmUgYmVjYXVzZSB0aGUgRE9NIGlzXG4gICAgICAvLyBzdGlsbCBpbiB0aGUgY2xvbmVkIGZyYWdtZW50IGR1cmluZyBpbml0aWFsIHJlbmRlcjsgaWYgc28sIGdldCB0aGUgcmVhbFxuICAgICAgLy8gcGFyZW50Tm9kZSB0aGUgcGFydCB3aWxsIGJlIGNvbW1pdHRlZCBpbnRvIGJ5IGFza2luZyB0aGUgcGFyZW50LlxuICAgICAgcGFyZW50Tm9kZSA9IChwYXJlbnQgYXMgQ2hpbGRQYXJ0IHwgVGVtcGxhdGVJbnN0YW5jZSkucGFyZW50Tm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmVudE5vZGU7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHBhcnQncyBsZWFkaW5nIG1hcmtlciBub2RlLCBpZiBhbnkuIFNlZSBgLnBhcmVudE5vZGVgIGZvciBtb3JlXG4gICAqIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgZ2V0IHN0YXJ0Tm9kZSgpOiBOb2RlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuXyRzdGFydE5vZGU7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHBhcnQncyB0cmFpbGluZyBtYXJrZXIgbm9kZSwgaWYgYW55LiBTZWUgYC5wYXJlbnROb2RlYCBmb3IgbW9yZVxuICAgKiBpbmZvcm1hdGlvbi5cbiAgICovXG4gIGdldCBlbmROb2RlKCk6IE5vZGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fJGVuZE5vZGU7XG4gIH1cblxuICBfJHNldFZhbHVlKHZhbHVlOiB1bmtub3duLCBkaXJlY3RpdmVQYXJlbnQ6IERpcmVjdGl2ZVBhcmVudCA9IHRoaXMpOiB2b2lkIHtcbiAgICBpZiAoREVWX01PREUgJiYgdGhpcy5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBUaGlzIFxcYENoaWxkUGFydFxcYCBoYXMgbm8gXFxgcGFyZW50Tm9kZVxcYCBhbmQgdGhlcmVmb3JlIGNhbm5vdCBhY2NlcHQgYSB2YWx1ZS4gVGhpcyBsaWtlbHkgbWVhbnMgdGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgcGFydCB3YXMgbWFuaXB1bGF0ZWQgaW4gYW4gdW5zdXBwb3J0ZWQgd2F5IG91dHNpZGUgb2YgTGl0J3MgY29udHJvbCBzdWNoIHRoYXQgdGhlIHBhcnQncyBtYXJrZXIgbm9kZXMgd2VyZSBlamVjdGVkIGZyb20gRE9NLiBGb3IgZXhhbXBsZSwgc2V0dGluZyB0aGUgZWxlbWVudCdzIFxcYGlubmVySFRNTFxcYCBvciBcXGB0ZXh0Q29udGVudFxcYCBjYW4gZG8gdGhpcy5gXG4gICAgICApO1xuICAgIH1cbiAgICB2YWx1ZSA9IHJlc29sdmVEaXJlY3RpdmUodGhpcywgdmFsdWUsIGRpcmVjdGl2ZVBhcmVudCk7XG4gICAgaWYgKGlzUHJpbWl0aXZlKHZhbHVlKSkge1xuICAgICAgLy8gTm9uLXJlbmRlcmluZyBjaGlsZCB2YWx1ZXMuIEl0J3MgaW1wb3J0YW50IHRoYXQgdGhlc2UgZG8gbm90IHJlbmRlclxuICAgICAgLy8gZW1wdHkgdGV4dCBub2RlcyB0byBhdm9pZCBpc3N1ZXMgd2l0aCBwcmV2ZW50aW5nIGRlZmF1bHQgPHNsb3Q+XG4gICAgICAvLyBmYWxsYmFjayBjb250ZW50LlxuICAgICAgaWYgKHZhbHVlID09PSBub3RoaW5nIHx8IHZhbHVlID09IG51bGwgfHwgdmFsdWUgPT09ICcnKSB7XG4gICAgICAgIGlmICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgIT09IG5vdGhpbmcpIHtcbiAgICAgICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICAgICAga2luZDogJ2NvbW1pdCBub3RoaW5nIHRvIGNoaWxkJyxcbiAgICAgICAgICAgICAgc3RhcnQ6IHRoaXMuXyRzdGFydE5vZGUsXG4gICAgICAgICAgICAgIGVuZDogdGhpcy5fJGVuZE5vZGUsXG4gICAgICAgICAgICAgIHBhcmVudDogdGhpcy5fJHBhcmVudCxcbiAgICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5fJGNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gbm90aGluZztcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgIT09IHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAmJiB2YWx1ZSAhPT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgICB9XG4gICAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIH0gZWxzZSBpZiAoKHZhbHVlIGFzIFRlbXBsYXRlUmVzdWx0KVsnXyRsaXRUeXBlJCddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX2NvbW1pdFRlbXBsYXRlUmVzdWx0KHZhbHVlIGFzIFRlbXBsYXRlUmVzdWx0KTtcbiAgICB9IGVsc2UgaWYgKCh2YWx1ZSBhcyBOb2RlKS5ub2RlVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoREVWX01PREUgJiYgdGhpcy5vcHRpb25zPy5ob3N0ID09PSB2YWx1ZSkge1xuICAgICAgICB0aGlzLl9jb21taXRUZXh0KFxuICAgICAgICAgIGBbcHJvYmFibGUgbWlzdGFrZTogcmVuZGVyZWQgYSB0ZW1wbGF0ZSdzIGhvc3QgaW4gaXRzZWxmIGAgK1xuICAgICAgICAgICAgYChjb21tb25seSBjYXVzZWQgYnkgd3JpdGluZyBcXCR7dGhpc30gaW4gYSB0ZW1wbGF0ZV1gXG4gICAgICAgICk7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBgQXR0ZW1wdGVkIHRvIHJlbmRlciB0aGUgdGVtcGxhdGUgaG9zdGAsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgYGluc2lkZSBpdHNlbGYuIFRoaXMgaXMgYWxtb3N0IGFsd2F5cyBhIG1pc3Rha2UsIGFuZCBpbiBkZXYgbW9kZSBgLFxuICAgICAgICAgIGB3ZSByZW5kZXIgc29tZSB3YXJuaW5nIHRleHQuIEluIHByb2R1Y3Rpb24gaG93ZXZlciwgd2UnbGwgYCxcbiAgICAgICAgICBgcmVuZGVyIGl0LCB3aGljaCB3aWxsIHVzdWFsbHkgcmVzdWx0IGluIGFuIGVycm9yLCBhbmQgc29tZXRpbWVzIGAsXG4gICAgICAgICAgYGluIHRoZSBlbGVtZW50IGRpc2FwcGVhcmluZyBmcm9tIHRoZSBET00uYFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9jb21taXROb2RlKHZhbHVlIGFzIE5vZGUpO1xuICAgIH0gZWxzZSBpZiAoaXNJdGVyYWJsZSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuX2NvbW1pdEl0ZXJhYmxlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRmFsbGJhY2ssIHdpbGwgcmVuZGVyIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb25cbiAgICAgIHRoaXMuX2NvbW1pdFRleHQodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2luc2VydDxUIGV4dGVuZHMgTm9kZT4obm9kZTogVCkge1xuICAgIHJldHVybiB3cmFwKHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkucGFyZW50Tm9kZSEpLmluc2VydEJlZm9yZShcbiAgICAgIG5vZGUsXG4gICAgICB0aGlzLl8kZW5kTm9kZVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9jb21taXROb2RlKHZhbHVlOiBOb2RlKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgIHRoaXMuXyRjbGVhcigpO1xuICAgICAgaWYgKFxuICAgICAgICBFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MgJiZcbiAgICAgICAgc2FuaXRpemVyRmFjdG9yeUludGVybmFsICE9PSBub29wU2FuaXRpemVyXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgcGFyZW50Tm9kZU5hbWUgPSB0aGlzLl8kc3RhcnROb2RlLnBhcmVudE5vZGU/Lm5vZGVOYW1lO1xuICAgICAgICBpZiAocGFyZW50Tm9kZU5hbWUgPT09ICdTVFlMRScgfHwgcGFyZW50Tm9kZU5hbWUgPT09ICdTQ1JJUFQnKSB7XG4gICAgICAgICAgbGV0IG1lc3NhZ2UgPSAnRm9yYmlkZGVuJztcbiAgICAgICAgICBpZiAoREVWX01PREUpIHtcbiAgICAgICAgICAgIGlmIChwYXJlbnROb2RlTmFtZSA9PT0gJ1NUWUxFJykge1xuICAgICAgICAgICAgICBtZXNzYWdlID1cbiAgICAgICAgICAgICAgICBgTGl0IGRvZXMgbm90IHN1cHBvcnQgYmluZGluZyBpbnNpZGUgc3R5bGUgbm9kZXMuIGAgK1xuICAgICAgICAgICAgICAgIGBUaGlzIGlzIGEgc2VjdXJpdHkgcmlzaywgYXMgc3R5bGUgaW5qZWN0aW9uIGF0dGFja3MgY2FuIGAgK1xuICAgICAgICAgICAgICAgIGBleGZpbHRyYXRlIGRhdGEgYW5kIHNwb29mIFVJcy4gYCArXG4gICAgICAgICAgICAgICAgYENvbnNpZGVyIGluc3RlYWQgdXNpbmcgY3NzXFxgLi4uXFxgIGxpdGVyYWxzIGAgK1xuICAgICAgICAgICAgICAgIGB0byBjb21wb3NlIHN0eWxlcywgYW5kIGRvIGR5bmFtaWMgc3R5bGluZyB3aXRoIGAgK1xuICAgICAgICAgICAgICAgIGBjc3MgY3VzdG9tIHByb3BlcnRpZXMsIDo6cGFydHMsIDxzbG90PnMsIGAgK1xuICAgICAgICAgICAgICAgIGBhbmQgYnkgbXV0YXRpbmcgdGhlIERPTSByYXRoZXIgdGhhbiBzdHlsZXNoZWV0cy5gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbWVzc2FnZSA9XG4gICAgICAgICAgICAgICAgYExpdCBkb2VzIG5vdCBzdXBwb3J0IGJpbmRpbmcgaW5zaWRlIHNjcmlwdCBub2Rlcy4gYCArXG4gICAgICAgICAgICAgICAgYFRoaXMgaXMgYSBzZWN1cml0eSByaXNrLCBhcyBpdCBjb3VsZCBhbGxvdyBhcmJpdHJhcnkgYCArXG4gICAgICAgICAgICAgICAgYGNvZGUgZXhlY3V0aW9uLmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAnY29tbWl0IG5vZGUnLFxuICAgICAgICAgIHN0YXJ0OiB0aGlzLl8kc3RhcnROb2RlLFxuICAgICAgICAgIHBhcmVudDogdGhpcy5fJHBhcmVudCxcbiAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IHRoaXMuX2luc2VydCh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29tbWl0VGV4dCh2YWx1ZTogdW5rbm93bik6IHZvaWQge1xuICAgIC8vIElmIHRoZSBjb21taXR0ZWQgdmFsdWUgaXMgYSBwcmltaXRpdmUgaXQgbWVhbnMgd2UgY2FsbGVkIF9jb21taXRUZXh0IG9uXG4gICAgLy8gdGhlIHByZXZpb3VzIHJlbmRlciwgYW5kIHdlIGtub3cgdGhhdCB0aGlzLl8kc3RhcnROb2RlLm5leHRTaWJsaW5nIGlzIGFcbiAgICAvLyBUZXh0IG5vZGUuIFdlIGNhbiBub3cganVzdCByZXBsYWNlIHRoZSB0ZXh0IGNvbnRlbnQgKC5kYXRhKSBvZiB0aGUgbm9kZS5cbiAgICBpZiAoXG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgIT09IG5vdGhpbmcgJiZcbiAgICAgIGlzUHJpbWl0aXZlKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSlcbiAgICApIHtcbiAgICAgIGNvbnN0IG5vZGUgPSB3cmFwKHRoaXMuXyRzdGFydE5vZGUpLm5leHRTaWJsaW5nIGFzIFRleHQ7XG4gICAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICAgIGlmICh0aGlzLl90ZXh0U2FuaXRpemVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLl90ZXh0U2FuaXRpemVyID0gY3JlYXRlU2FuaXRpemVyKG5vZGUsICdkYXRhJywgJ3Byb3BlcnR5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgPSB0aGlzLl90ZXh0U2FuaXRpemVyKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ2NvbW1pdCB0ZXh0JyxcbiAgICAgICAgICBub2RlLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgICAobm9kZSBhcyBUZXh0KS5kYXRhID0gdmFsdWUgYXMgc3RyaW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICAgIGNvbnN0IHRleHROb2RlID0gZC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgICAgIHRoaXMuX2NvbW1pdE5vZGUodGV4dE5vZGUpO1xuICAgICAgICAvLyBXaGVuIHNldHRpbmcgdGV4dCBjb250ZW50LCBmb3Igc2VjdXJpdHkgcHVycG9zZXMgaXQgbWF0dGVycyBhIGxvdFxuICAgICAgICAvLyB3aGF0IHRoZSBwYXJlbnQgaXMuIEZvciBleGFtcGxlLCA8c3R5bGU+IGFuZCA8c2NyaXB0PiBuZWVkIHRvIGJlXG4gICAgICAgIC8vIGhhbmRsZWQgd2l0aCBjYXJlLCB3aGlsZSA8c3Bhbj4gZG9lcyBub3QuIFNvIGZpcnN0IHdlIG5lZWQgdG8gcHV0IGFcbiAgICAgICAgLy8gdGV4dCBub2RlIGludG8gdGhlIGRvY3VtZW50LCB0aGVuIHdlIGNhbiBzYW5pdGl6ZSBpdHMgY29udGVudC5cbiAgICAgICAgaWYgKHRoaXMuX3RleHRTYW5pdGl6ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuX3RleHRTYW5pdGl6ZXIgPSBjcmVhdGVTYW5pdGl6ZXIodGV4dE5vZGUsICdkYXRhJywgJ3Byb3BlcnR5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgPSB0aGlzLl90ZXh0U2FuaXRpemVyKHZhbHVlKTtcbiAgICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgICAga2luZDogJ2NvbW1pdCB0ZXh0JyxcbiAgICAgICAgICAgIG5vZGU6IHRleHROb2RlLFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgfSk7XG4gICAgICAgIHRleHROb2RlLmRhdGEgPSB2YWx1ZSBhcyBzdHJpbmc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jb21taXROb2RlKGQuY3JlYXRlVGV4dE5vZGUodmFsdWUgYXMgc3RyaW5nKSk7XG4gICAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICAgIGtpbmQ6ICdjb21taXQgdGV4dCcsXG4gICAgICAgICAgICBub2RlOiB3cmFwKHRoaXMuXyRzdGFydE5vZGUpLm5leHRTaWJsaW5nIGFzIFRleHQsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBwcml2YXRlIF9jb21taXRUZW1wbGF0ZVJlc3VsdChcbiAgICByZXN1bHQ6IFRlbXBsYXRlUmVzdWx0IHwgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdFxuICApOiB2b2lkIHtcbiAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgIGNvbnN0IHt2YWx1ZXMsIFsnXyRsaXRUeXBlJCddOiB0eXBlfSA9IHJlc3VsdDtcbiAgICAvLyBJZiAkbGl0VHlwZSQgaXMgYSBudW1iZXIsIHJlc3VsdCBpcyBhIHBsYWluIFRlbXBsYXRlUmVzdWx0IGFuZCB3ZSBnZXRcbiAgICAvLyB0aGUgdGVtcGxhdGUgZnJvbSB0aGUgdGVtcGxhdGUgY2FjaGUuIElmIG5vdCwgcmVzdWx0IGlzIGFcbiAgICAvLyBDb21waWxlZFRlbXBsYXRlUmVzdWx0IGFuZCBfJGxpdFR5cGUkIGlzIGEgQ29tcGlsZWRUZW1wbGF0ZSBhbmQgd2UgbmVlZFxuICAgIC8vIHRvIGNyZWF0ZSB0aGUgPHRlbXBsYXRlPiBlbGVtZW50IHRoZSBmaXJzdCB0aW1lIHdlIHNlZSBpdC5cbiAgICBjb25zdCB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBDb21waWxlZFRlbXBsYXRlID1cbiAgICAgIHR5cGVvZiB0eXBlID09PSAnbnVtYmVyJ1xuICAgICAgICA/IHRoaXMuXyRnZXRUZW1wbGF0ZShyZXN1bHQgYXMgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0KVxuICAgICAgICA6ICh0eXBlLmVsID09PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICh0eXBlLmVsID0gVGVtcGxhdGUuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgdHJ1c3RGcm9tVGVtcGxhdGVTdHJpbmcodHlwZS5oLCB0eXBlLmhbMF0pLFxuICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNcbiAgICAgICAgICAgICkpLFxuICAgICAgICAgIHR5cGUpO1xuXG4gICAgaWYgKCh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgVGVtcGxhdGVJbnN0YW5jZSk/Ll8kdGVtcGxhdGUgPT09IHRlbXBsYXRlKSB7XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSB1cGRhdGluZycsXG4gICAgICAgICAgdGVtcGxhdGUsXG4gICAgICAgICAgaW5zdGFuY2U6IHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBUZW1wbGF0ZUluc3RhbmNlLFxuICAgICAgICAgIHBhcnRzOiAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIFRlbXBsYXRlSW5zdGFuY2UpLl8kcGFydHMsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgfSk7XG4gICAgICAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIFRlbXBsYXRlSW5zdGFuY2UpLl91cGRhdGUodmFsdWVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZSBhcyBUZW1wbGF0ZSwgdGhpcyk7XG4gICAgICBjb25zdCBmcmFnbWVudCA9IGluc3RhbmNlLl9jbG9uZSh0aGlzLm9wdGlvbnMpO1xuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAndGVtcGxhdGUgaW5zdGFudGlhdGVkJyxcbiAgICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgICBpbnN0YW5jZSxcbiAgICAgICAgICBwYXJ0czogaW5zdGFuY2UuXyRwYXJ0cyxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgdmFsdWVzLFxuICAgICAgICB9KTtcbiAgICAgIGluc3RhbmNlLl91cGRhdGUodmFsdWVzKTtcbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ3RlbXBsYXRlIGluc3RhbnRpYXRlZCBhbmQgdXBkYXRlZCcsXG4gICAgICAgICAgdGVtcGxhdGUsXG4gICAgICAgICAgaW5zdGFuY2UsXG4gICAgICAgICAgcGFydHM6IGluc3RhbmNlLl8kcGFydHMsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIGZyYWdtZW50LFxuICAgICAgICAgIHZhbHVlcyxcbiAgICAgICAgfSk7XG4gICAgICB0aGlzLl9jb21taXROb2RlKGZyYWdtZW50KTtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IGluc3RhbmNlO1xuICAgIH1cbiAgfVxuXG4gIC8vIE92ZXJyaWRkZW4gdmlhIGBsaXRIdG1sUG9seWZpbGxTdXBwb3J0YCB0byBwcm92aWRlIHBsYXRmb3JtIHN1cHBvcnQuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRnZXRUZW1wbGF0ZShyZXN1bHQ6IFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCkge1xuICAgIGxldCB0ZW1wbGF0ZSA9IHRlbXBsYXRlQ2FjaGUuZ2V0KHJlc3VsdC5zdHJpbmdzKTtcbiAgICBpZiAodGVtcGxhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGVtcGxhdGVDYWNoZS5zZXQocmVzdWx0LnN0cmluZ3MsICh0ZW1wbGF0ZSA9IG5ldyBUZW1wbGF0ZShyZXN1bHQpKSk7XG4gICAgfVxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1pdEl0ZXJhYmxlKHZhbHVlOiBJdGVyYWJsZTx1bmtub3duPik6IHZvaWQge1xuICAgIC8vIEZvciBhbiBJdGVyYWJsZSwgd2UgY3JlYXRlIGEgbmV3IEluc3RhbmNlUGFydCBwZXIgaXRlbSwgdGhlbiBzZXQgaXRzXG4gICAgLy8gdmFsdWUgdG8gdGhlIGl0ZW0uIFRoaXMgaXMgYSBsaXR0bGUgYml0IG9mIG92ZXJoZWFkIGZvciBldmVyeSBpdGVtIGluXG4gICAgLy8gYW4gSXRlcmFibGUsIGJ1dCBpdCBsZXRzIHVzIHJlY3Vyc2UgZWFzaWx5IGFuZCBlZmZpY2llbnRseSB1cGRhdGUgQXJyYXlzXG4gICAgLy8gb2YgVGVtcGxhdGVSZXN1bHRzIHRoYXQgd2lsbCBiZSBjb21tb25seSByZXR1cm5lZCBmcm9tIGV4cHJlc3Npb25zIGxpa2U6XG4gICAgLy8gYXJyYXkubWFwKChpKSA9PiBodG1sYCR7aX1gKSwgYnkgcmV1c2luZyBleGlzdGluZyBUZW1wbGF0ZUluc3RhbmNlcy5cblxuICAgIC8vIElmIHZhbHVlIGlzIGFuIGFycmF5LCB0aGVuIHRoZSBwcmV2aW91cyByZW5kZXIgd2FzIG9mIGFuXG4gICAgLy8gaXRlcmFibGUgYW5kIHZhbHVlIHdpbGwgY29udGFpbiB0aGUgQ2hpbGRQYXJ0cyBmcm9tIHRoZSBwcmV2aW91c1xuICAgIC8vIHJlbmRlci4gSWYgdmFsdWUgaXMgbm90IGFuIGFycmF5LCBjbGVhciB0aGlzIHBhcnQgYW5kIG1ha2UgYSBuZXdcbiAgICAvLyBhcnJheSBmb3IgQ2hpbGRQYXJ0cy5cbiAgICBpZiAoIWlzQXJyYXkodGhpcy5fJGNvbW1pdHRlZFZhbHVlKSkge1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gW107XG4gICAgICB0aGlzLl8kY2xlYXIoKTtcbiAgICB9XG5cbiAgICAvLyBMZXRzIHVzIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgaXRlbXMgd2Ugc3RhbXBlZCBzbyB3ZSBjYW4gY2xlYXIgbGVmdG92ZXJcbiAgICAvLyBpdGVtcyBmcm9tIGEgcHJldmlvdXMgcmVuZGVyXG4gICAgY29uc3QgaXRlbVBhcnRzID0gdGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIENoaWxkUGFydFtdO1xuICAgIGxldCBwYXJ0SW5kZXggPSAwO1xuICAgIGxldCBpdGVtUGFydDogQ2hpbGRQYXJ0IHwgdW5kZWZpbmVkO1xuXG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHZhbHVlKSB7XG4gICAgICBpZiAocGFydEluZGV4ID09PSBpdGVtUGFydHMubGVuZ3RoKSB7XG4gICAgICAgIC8vIElmIG5vIGV4aXN0aW5nIHBhcnQsIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgICAgLy8gVE9ETyAoanVzdGluZmFnbmFuaSk6IHRlc3QgcGVyZiBpbXBhY3Qgb2YgYWx3YXlzIGNyZWF0aW5nIHR3byBwYXJ0c1xuICAgICAgICAvLyBpbnN0ZWFkIG9mIHNoYXJpbmcgcGFydHMgYmV0d2VlbiBub2Rlc1xuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbGl0L2xpdC9pc3N1ZXMvMTI2NlxuICAgICAgICBpdGVtUGFydHMucHVzaChcbiAgICAgICAgICAoaXRlbVBhcnQgPSBuZXcgQ2hpbGRQYXJ0KFxuICAgICAgICAgICAgdGhpcy5faW5zZXJ0KGNyZWF0ZU1hcmtlcigpKSxcbiAgICAgICAgICAgIHRoaXMuX2luc2VydChjcmVhdGVNYXJrZXIoKSksXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zXG4gICAgICAgICAgKSlcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFJldXNlIGFuIGV4aXN0aW5nIHBhcnRcbiAgICAgICAgaXRlbVBhcnQgPSBpdGVtUGFydHNbcGFydEluZGV4XTtcbiAgICAgIH1cbiAgICAgIGl0ZW1QYXJ0Ll8kc2V0VmFsdWUoaXRlbSk7XG4gICAgICBwYXJ0SW5kZXgrKztcbiAgICB9XG5cbiAgICBpZiAocGFydEluZGV4IDwgaXRlbVBhcnRzLmxlbmd0aCkge1xuICAgICAgLy8gaXRlbVBhcnRzIGFsd2F5cyBoYXZlIGVuZCBub2Rlc1xuICAgICAgdGhpcy5fJGNsZWFyKFxuICAgICAgICBpdGVtUGFydCAmJiB3cmFwKGl0ZW1QYXJ0Ll8kZW5kTm9kZSEpLm5leHRTaWJsaW5nLFxuICAgICAgICBwYXJ0SW5kZXhcbiAgICAgICk7XG4gICAgICAvLyBUcnVuY2F0ZSB0aGUgcGFydHMgYXJyYXkgc28gX3ZhbHVlIHJlZmxlY3RzIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgICBpdGVtUGFydHMubGVuZ3RoID0gcGFydEluZGV4O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBub2RlcyBjb250YWluZWQgd2l0aGluIHRoaXMgUGFydCBmcm9tIHRoZSBET00uXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydCBTdGFydCBub2RlIHRvIGNsZWFyIGZyb20sIGZvciBjbGVhcmluZyBhIHN1YnNldCBvZiB0aGUgcGFydCdzXG4gICAqICAgICBET00gKHVzZWQgd2hlbiB0cnVuY2F0aW5nIGl0ZXJhYmxlcylcbiAgICogQHBhcmFtIGZyb20gIFdoZW4gYHN0YXJ0YCBpcyBzcGVjaWZpZWQsIHRoZSBpbmRleCB3aXRoaW4gdGhlIGl0ZXJhYmxlIGZyb21cbiAgICogICAgIHdoaWNoIENoaWxkUGFydHMgYXJlIGJlaW5nIHJlbW92ZWQsIHVzZWQgZm9yIGRpc2Nvbm5lY3RpbmcgZGlyZWN0aXZlcyBpblxuICAgKiAgICAgdGhvc2UgUGFydHMuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgXyRjbGVhcihcbiAgICBzdGFydDogQ2hpbGROb2RlIHwgbnVsbCA9IHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkubmV4dFNpYmxpbmcsXG4gICAgZnJvbT86IG51bWJlclxuICApIHtcbiAgICB0aGlzLl8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQ/LihmYWxzZSwgdHJ1ZSwgZnJvbSk7XG4gICAgd2hpbGUgKHN0YXJ0ICYmIHN0YXJ0ICE9PSB0aGlzLl8kZW5kTm9kZSkge1xuICAgICAgY29uc3QgbiA9IHdyYXAoc3RhcnQhKS5uZXh0U2libGluZztcbiAgICAgICh3cmFwKHN0YXJ0ISkgYXMgRWxlbWVudCkucmVtb3ZlKCk7XG4gICAgICBzdGFydCA9IG47XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBvZiBSb290UGFydCdzIGBpc0Nvbm5lY3RlZGAuIE5vdGUgdGhhdCB0aGlzIG1ldGhvZFxuICAgKiBzaG91bGQgb25seSBiZSBjYWxsZWQgb24gYFJvb3RQYXJ0YHMgKHRoZSBgQ2hpbGRQYXJ0YCByZXR1cm5lZCBmcm9tIGFcbiAgICogdG9wLWxldmVsIGByZW5kZXIoKWAgY2FsbCkuIEl0IGhhcyBubyBlZmZlY3Qgb24gbm9uLXJvb3QgQ2hpbGRQYXJ0cy5cbiAgICogQHBhcmFtIGlzQ29ubmVjdGVkIFdoZXRoZXIgdG8gc2V0XG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgc2V0Q29ubmVjdGVkKGlzQ29ubmVjdGVkOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuXyRwYXJlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fX2lzQ29ubmVjdGVkID0gaXNDb25uZWN0ZWQ7XG4gICAgICB0aGlzLl8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQ/Lihpc0Nvbm5lY3RlZCk7XG4gICAgfSBlbHNlIGlmIChERVZfTU9ERSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAncGFydC5zZXRDb25uZWN0ZWQoKSBtYXkgb25seSBiZSBjYWxsZWQgb24gYSAnICtcbiAgICAgICAgICAnUm9vdFBhcnQgcmV0dXJuZWQgZnJvbSByZW5kZXIoKS4nXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEEgdG9wLWxldmVsIGBDaGlsZFBhcnRgIHJldHVybmVkIGZyb20gYHJlbmRlcmAgdGhhdCBtYW5hZ2VzIHRoZSBjb25uZWN0ZWRcbiAqIHN0YXRlIG9mIGBBc3luY0RpcmVjdGl2ZWBzIGNyZWF0ZWQgdGhyb3VnaG91dCB0aGUgdHJlZSBiZWxvdyBpdC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSb290UGFydCBleHRlbmRzIENoaWxkUGFydCB7XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjb25uZWN0aW9uIHN0YXRlIGZvciBgQXN5bmNEaXJlY3RpdmVgcyBjb250YWluZWQgd2l0aGluIHRoaXMgcm9vdFxuICAgKiBDaGlsZFBhcnQuXG4gICAqXG4gICAqIGxpdC1odG1sIGRvZXMgbm90IGF1dG9tYXRpY2FsbHkgbW9uaXRvciB0aGUgY29ubmVjdGVkbmVzcyBvZiBET00gcmVuZGVyZWQ7XG4gICAqIGFzIHN1Y2gsIGl0IGlzIHRoZSByZXNwb25zaWJpbGl0eSBvZiB0aGUgY2FsbGVyIHRvIGByZW5kZXJgIHRvIGVuc3VyZSB0aGF0XG4gICAqIGBwYXJ0LnNldENvbm5lY3RlZChmYWxzZSlgIGlzIGNhbGxlZCBiZWZvcmUgdGhlIHBhcnQgb2JqZWN0IGlzIHBvdGVudGlhbGx5XG4gICAqIGRpc2NhcmRlZCwgdG8gZW5zdXJlIHRoYXQgYEFzeW5jRGlyZWN0aXZlYHMgaGF2ZSBhIGNoYW5jZSB0byBkaXNwb3NlIG9mXG4gICAqIGFueSByZXNvdXJjZXMgYmVpbmcgaGVsZC4gSWYgYSBgUm9vdFBhcnRgIHRoYXQgd2FzIHByZXZpb3VzbHlcbiAgICogZGlzY29ubmVjdGVkIGlzIHN1YnNlcXVlbnRseSByZS1jb25uZWN0ZWQgKGFuZCBpdHMgYEFzeW5jRGlyZWN0aXZlYHMgc2hvdWxkXG4gICAqIHJlLWNvbm5lY3QpLCBgc2V0Q29ubmVjdGVkKHRydWUpYCBzaG91bGQgYmUgY2FsbGVkLlxuICAgKlxuICAgKiBAcGFyYW0gaXNDb25uZWN0ZWQgV2hldGhlciBkaXJlY3RpdmVzIHdpdGhpbiB0aGlzIHRyZWUgc2hvdWxkIGJlIGNvbm5lY3RlZFxuICAgKiBvciBub3RcbiAgICovXG4gIHNldENvbm5lY3RlZChpc0Nvbm5lY3RlZDogYm9vbGVhbik6IHZvaWQ7XG59XG5cbmV4cG9ydCB0eXBlIHtBdHRyaWJ1dGVQYXJ0fTtcbmNsYXNzIEF0dHJpYnV0ZVBhcnQgaW1wbGVtZW50cyBEaXNjb25uZWN0YWJsZSB7XG4gIHJlYWRvbmx5IHR5cGU6XG4gICAgfCB0eXBlb2YgQVRUUklCVVRFX1BBUlRcbiAgICB8IHR5cGVvZiBQUk9QRVJUWV9QQVJUXG4gICAgfCB0eXBlb2YgQk9PTEVBTl9BVFRSSUJVVEVfUEFSVFxuICAgIHwgdHlwZW9mIEVWRU5UX1BBUlQgPSBBVFRSSUJVVEVfUEFSVDtcbiAgcmVhZG9ubHkgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogSWYgdGhpcyBhdHRyaWJ1dGUgcGFydCByZXByZXNlbnRzIGFuIGludGVycG9sYXRpb24sIHRoaXMgY29udGFpbnMgdGhlXG4gICAqIHN0YXRpYyBzdHJpbmdzIG9mIHRoZSBpbnRlcnBvbGF0aW9uLiBGb3Igc2luZ2xlLXZhbHVlLCBjb21wbGV0ZSBiaW5kaW5ncyxcbiAgICogdGhpcyBpcyB1bmRlZmluZWQuXG4gICAqL1xuICByZWFkb25seSBzdHJpbmdzPzogUmVhZG9ubHlBcnJheTxzdHJpbmc+O1xuICAvKiogQGludGVybmFsICovXG4gIF8kY29tbWl0dGVkVmFsdWU6IHVua25vd24gfCBBcnJheTx1bmtub3duPiA9IG5vdGhpbmc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX19kaXJlY3RpdmVzPzogQXJyYXk8RGlyZWN0aXZlIHwgdW5kZWZpbmVkPjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHBhcmVudDogRGlzY29ubmVjdGFibGU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPiA9IHVuZGVmaW5lZDtcblxuICBwcm90ZWN0ZWQgX3Nhbml0aXplcjogVmFsdWVTYW5pdGl6ZXIgfCB1bmRlZmluZWQ7XG5cbiAgZ2V0IHRhZ05hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC50YWdOYW1lO1xuICB9XG5cbiAgLy8gU2VlIGNvbW1lbnQgaW4gRGlzY29ubmVjdGFibGUgaW50ZXJmYWNlIGZvciB3aHkgdGhpcyBpcyBhIGdldHRlclxuICBnZXQgXyRpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fJHBhcmVudC5fJGlzQ29ubmVjdGVkO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHN0cmluZ3M6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPixcbiAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlLFxuICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWRcbiAgKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuXyRwYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICBpZiAoc3RyaW5ncy5sZW5ndGggPiAyIHx8IHN0cmluZ3NbMF0gIT09ICcnIHx8IHN0cmluZ3NbMV0gIT09ICcnKSB7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBuZXcgQXJyYXkoc3RyaW5ncy5sZW5ndGggLSAxKS5maWxsKG5ldyBTdHJpbmcoKSk7XG4gICAgICB0aGlzLnN0cmluZ3MgPSBzdHJpbmdzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBub3RoaW5nO1xuICAgIH1cbiAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICB0aGlzLl9zYW5pdGl6ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoaXMgcGFydCBieSByZXNvbHZpbmcgdGhlIHZhbHVlIGZyb20gcG9zc2libHkgbXVsdGlwbGVcbiAgICogdmFsdWVzIGFuZCBzdGF0aWMgc3RyaW5ncyBhbmQgY29tbWl0dGluZyBpdCB0byB0aGUgRE9NLlxuICAgKiBJZiB0aGlzIHBhcnQgaXMgc2luZ2xlLXZhbHVlZCwgYHRoaXMuX3N0cmluZ3NgIHdpbGwgYmUgdW5kZWZpbmVkLCBhbmQgdGhlXG4gICAqIG1ldGhvZCB3aWxsIGJlIGNhbGxlZCB3aXRoIGEgc2luZ2xlIHZhbHVlIGFyZ3VtZW50LiBJZiB0aGlzIHBhcnQgaXNcbiAgICogbXVsdGktdmFsdWUsIGB0aGlzLl9zdHJpbmdzYCB3aWxsIGJlIGRlZmluZWQsIGFuZCB0aGUgbWV0aG9kIGlzIGNhbGxlZFxuICAgKiB3aXRoIHRoZSB2YWx1ZSBhcnJheSBvZiB0aGUgcGFydCdzIG93bmluZyBUZW1wbGF0ZUluc3RhbmNlLCBhbmQgYW4gb2Zmc2V0XG4gICAqIGludG8gdGhlIHZhbHVlIGFycmF5IGZyb20gd2hpY2ggdGhlIHZhbHVlcyBzaG91bGQgYmUgcmVhZC5cbiAgICogVGhpcyBtZXRob2QgaXMgb3ZlcmxvYWRlZCB0aGlzIHdheSB0byBlbGltaW5hdGUgc2hvcnQtbGl2ZWQgYXJyYXkgc2xpY2VzXG4gICAqIG9mIHRoZSB0ZW1wbGF0ZSBpbnN0YW5jZSB2YWx1ZXMsIGFuZCBhbGxvdyBhIGZhc3QtcGF0aCBmb3Igc2luZ2xlLXZhbHVlZFxuICAgKiBwYXJ0cy5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBwYXJ0IHZhbHVlLCBvciBhbiBhcnJheSBvZiB2YWx1ZXMgZm9yIG11bHRpLXZhbHVlZCBwYXJ0c1xuICAgKiBAcGFyYW0gdmFsdWVJbmRleCB0aGUgaW5kZXggdG8gc3RhcnQgcmVhZGluZyB2YWx1ZXMgZnJvbS4gYHVuZGVmaW5lZGAgZm9yXG4gICAqICAgc2luZ2xlLXZhbHVlZCBwYXJ0c1xuICAgKiBAcGFyYW0gbm9Db21taXQgY2F1c2VzIHRoZSBwYXJ0IHRvIG5vdCBjb21taXQgaXRzIHZhbHVlIHRvIHRoZSBET00uIFVzZWRcbiAgICogICBpbiBoeWRyYXRpb24gdG8gcHJpbWUgYXR0cmlidXRlIHBhcnRzIHdpdGggdGhlaXIgZmlyc3QtcmVuZGVyZWQgdmFsdWUsXG4gICAqICAgYnV0IG5vdCBzZXQgdGhlIGF0dHJpYnV0ZSwgYW5kIGluIFNTUiB0byBuby1vcCB0aGUgRE9NIG9wZXJhdGlvbiBhbmRcbiAgICogICBjYXB0dXJlIHRoZSB2YWx1ZSBmb3Igc2VyaWFsaXphdGlvbi5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfJHNldFZhbHVlKFxuICAgIHZhbHVlOiB1bmtub3duIHwgQXJyYXk8dW5rbm93bj4sXG4gICAgZGlyZWN0aXZlUGFyZW50OiBEaXJlY3RpdmVQYXJlbnQgPSB0aGlzLFxuICAgIHZhbHVlSW5kZXg/OiBudW1iZXIsXG4gICAgbm9Db21taXQ/OiBib29sZWFuXG4gICkge1xuICAgIGNvbnN0IHN0cmluZ3MgPSB0aGlzLnN0cmluZ3M7XG5cbiAgICAvLyBXaGV0aGVyIGFueSBvZiB0aGUgdmFsdWVzIGhhcyBjaGFuZ2VkLCBmb3IgZGlydHktY2hlY2tpbmdcbiAgICBsZXQgY2hhbmdlID0gZmFsc2U7XG5cbiAgICBpZiAoc3RyaW5ncyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBTaW5nbGUtdmFsdWUgYmluZGluZyBjYXNlXG4gICAgICB2YWx1ZSA9IHJlc29sdmVEaXJlY3RpdmUodGhpcywgdmFsdWUsIGRpcmVjdGl2ZVBhcmVudCwgMCk7XG4gICAgICBjaGFuZ2UgPVxuICAgICAgICAhaXNQcmltaXRpdmUodmFsdWUpIHx8XG4gICAgICAgICh2YWx1ZSAhPT0gdGhpcy5fJGNvbW1pdHRlZFZhbHVlICYmIHZhbHVlICE9PSBub0NoYW5nZSk7XG4gICAgICBpZiAoY2hhbmdlKSB7XG4gICAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbnRlcnBvbGF0aW9uIGNhc2VcbiAgICAgIGNvbnN0IHZhbHVlcyA9IHZhbHVlIGFzIEFycmF5PHVua25vd24+O1xuICAgICAgdmFsdWUgPSBzdHJpbmdzWzBdO1xuXG4gICAgICBsZXQgaSwgdjtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICB2ID0gcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCB2YWx1ZXNbdmFsdWVJbmRleCEgKyBpXSwgZGlyZWN0aXZlUGFyZW50LCBpKTtcblxuICAgICAgICBpZiAodiA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgdXNlci1wcm92aWRlZCB2YWx1ZSBpcyBgbm9DaGFuZ2VgLCB1c2UgdGhlIHByZXZpb3VzIHZhbHVlXG4gICAgICAgICAgdiA9ICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgQXJyYXk8dW5rbm93bj4pW2ldO1xuICAgICAgICB9XG4gICAgICAgIGNoYW5nZSB8fD1cbiAgICAgICAgICAhaXNQcmltaXRpdmUodikgfHwgdiAhPT0gKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBBcnJheTx1bmtub3duPilbaV07XG4gICAgICAgIGlmICh2ID09PSBub3RoaW5nKSB7XG4gICAgICAgICAgdmFsdWUgPSBub3RoaW5nO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlICE9PSBub3RoaW5nKSB7XG4gICAgICAgICAgdmFsdWUgKz0gKHYgPz8gJycpICsgc3RyaW5nc1tpICsgMV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gV2UgYWx3YXlzIHJlY29yZCBlYWNoIHZhbHVlLCBldmVuIGlmIG9uZSBpcyBgbm90aGluZ2AsIGZvciBmdXR1cmVcbiAgICAgICAgLy8gY2hhbmdlIGRldGVjdGlvbi5cbiAgICAgICAgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBBcnJheTx1bmtub3duPilbaV0gPSB2O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2hhbmdlICYmICFub0NvbW1pdCkge1xuICAgICAgdGhpcy5fY29tbWl0VmFsdWUodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbW1pdFZhbHVlKHZhbHVlOiB1bmtub3duKSB7XG4gICAgaWYgKHZhbHVlID09PSBub3RoaW5nKSB7XG4gICAgICAod3JhcCh0aGlzLmVsZW1lbnQpIGFzIEVsZW1lbnQpLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICAgIGlmICh0aGlzLl9zYW5pdGl6ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuX3Nhbml0aXplciA9IHNhbml0aXplckZhY3RvcnlJbnRlcm5hbChcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgICAgICdhdHRyaWJ1dGUnXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZSA9IHRoaXMuX3Nhbml0aXplcih2YWx1ZSA/PyAnJyk7XG4gICAgICB9XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICdjb21taXQgYXR0cmlidXRlJyxcbiAgICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgfSk7XG4gICAgICAod3JhcCh0aGlzLmVsZW1lbnQpIGFzIEVsZW1lbnQpLnNldEF0dHJpYnV0ZShcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICAodmFsdWUgPz8gJycpIGFzIHN0cmluZ1xuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUge1Byb3BlcnR5UGFydH07XG5jbGFzcyBQcm9wZXJ0eVBhcnQgZXh0ZW5kcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkgdHlwZSA9IFBST1BFUlRZX1BBUlQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfY29tbWl0VmFsdWUodmFsdWU6IHVua25vd24pIHtcbiAgICBpZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gICAgICBpZiAodGhpcy5fc2FuaXRpemVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fc2FuaXRpemVyID0gc2FuaXRpemVyRmFjdG9yeUludGVybmFsKFxuICAgICAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgICAgJ3Byb3BlcnR5J1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSB0aGlzLl9zYW5pdGl6ZXIodmFsdWUpO1xuICAgIH1cbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ2NvbW1pdCBwcm9wZXJ0eScsXG4gICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgfSk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAodGhpcy5lbGVtZW50IGFzIGFueSlbdGhpcy5uYW1lXSA9IHZhbHVlID09PSBub3RoaW5nID8gdW5kZWZpbmVkIDogdmFsdWU7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUge0Jvb2xlYW5BdHRyaWJ1dGVQYXJ0fTtcbmNsYXNzIEJvb2xlYW5BdHRyaWJ1dGVQYXJ0IGV4dGVuZHMgQXR0cmlidXRlUGFydCB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IHR5cGUgPSBCT09MRUFOX0FUVFJJQlVURV9QQVJUO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgX2NvbW1pdFZhbHVlKHZhbHVlOiB1bmtub3duKSB7XG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICdjb21taXQgYm9vbGVhbiBhdHRyaWJ1dGUnLFxuICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgdmFsdWU6ICEhKHZhbHVlICYmIHZhbHVlICE9PSBub3RoaW5nKSxcbiAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgfSk7XG4gICAgKHdyYXAodGhpcy5lbGVtZW50KSBhcyBFbGVtZW50KS50b2dnbGVBdHRyaWJ1dGUoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICAhIXZhbHVlICYmIHZhbHVlICE9PSBub3RoaW5nXG4gICAgKTtcbiAgfVxufVxuXG50eXBlIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9ucyA9IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QgJlxuICBQYXJ0aWFsPEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zPjtcblxuLyoqXG4gKiBBbiBBdHRyaWJ1dGVQYXJ0IHRoYXQgbWFuYWdlcyBhbiBldmVudCBsaXN0ZW5lciB2aWEgYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIuXG4gKlxuICogVGhpcyBwYXJ0IHdvcmtzIGJ5IGFkZGluZyBpdHNlbGYgYXMgdGhlIGV2ZW50IGxpc3RlbmVyIG9uIGFuIGVsZW1lbnQsIHRoZW5cbiAqIGRlbGVnYXRpbmcgdG8gdGhlIHZhbHVlIHBhc3NlZCB0byBpdC4gVGhpcyByZWR1Y2VzIHRoZSBudW1iZXIgb2YgY2FsbHMgdG9cbiAqIGFkZC9yZW1vdmVFdmVudExpc3RlbmVyIGlmIHRoZSBsaXN0ZW5lciBjaGFuZ2VzIGZyZXF1ZW50bHksIHN1Y2ggYXMgd2hlbiBhblxuICogaW5saW5lIGZ1bmN0aW9uIGlzIHVzZWQgYXMgYSBsaXN0ZW5lci5cbiAqXG4gKiBCZWNhdXNlIGV2ZW50IG9wdGlvbnMgYXJlIHBhc3NlZCB3aGVuIGFkZGluZyBsaXN0ZW5lcnMsIHdlIG11c3QgdGFrZSBjYXNlXG4gKiB0byBhZGQgYW5kIHJlbW92ZSB0aGUgcGFydCBhcyBhIGxpc3RlbmVyIHdoZW4gdGhlIGV2ZW50IG9wdGlvbnMgY2hhbmdlLlxuICovXG5leHBvcnQgdHlwZSB7RXZlbnRQYXJ0fTtcbmNsYXNzIEV2ZW50UGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xuICBvdmVycmlkZSByZWFkb25seSB0eXBlID0gRVZFTlRfUEFSVDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3RyaW5nczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LFxuICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUsXG4gICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihlbGVtZW50LCBuYW1lLCBzdHJpbmdzLCBwYXJlbnQsIG9wdGlvbnMpO1xuXG4gICAgaWYgKERFVl9NT0RFICYmIHRoaXMuc3RyaW5ncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBBIFxcYDwke2VsZW1lbnQubG9jYWxOYW1lfT5cXGAgaGFzIGEgXFxgQCR7bmFtZX09Li4uXFxgIGxpc3RlbmVyIHdpdGggYCArXG4gICAgICAgICAgJ2ludmFsaWQgY29udGVudC4gRXZlbnQgbGlzdGVuZXJzIGluIHRlbXBsYXRlcyBtdXN0IGhhdmUgZXhhY3RseSAnICtcbiAgICAgICAgICAnb25lIGV4cHJlc3Npb24gYW5kIG5vIHN1cnJvdW5kaW5nIHRleHQuJ1xuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvLyBFdmVudFBhcnQgZG9lcyBub3QgdXNlIHRoZSBiYXNlIF8kc2V0VmFsdWUvX3Jlc29sdmVWYWx1ZSBpbXBsZW1lbnRhdGlvblxuICAvLyBzaW5jZSB0aGUgZGlydHkgY2hlY2tpbmcgaXMgbW9yZSBjb21wbGV4XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgb3ZlcnJpZGUgXyRzZXRWYWx1ZShcbiAgICBuZXdMaXN0ZW5lcjogdW5rbm93bixcbiAgICBkaXJlY3RpdmVQYXJlbnQ6IERpcmVjdGl2ZVBhcmVudCA9IHRoaXNcbiAgKSB7XG4gICAgbmV3TGlzdGVuZXIgPVxuICAgICAgcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCBuZXdMaXN0ZW5lciwgZGlyZWN0aXZlUGFyZW50LCAwKSA/PyBub3RoaW5nO1xuICAgIGlmIChuZXdMaXN0ZW5lciA9PT0gbm9DaGFuZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgb2xkTGlzdGVuZXIgPSB0aGlzLl8kY29tbWl0dGVkVmFsdWU7XG5cbiAgICAvLyBJZiB0aGUgbmV3IHZhbHVlIGlzIG5vdGhpbmcgb3IgYW55IG9wdGlvbnMgY2hhbmdlIHdlIGhhdmUgdG8gcmVtb3ZlIHRoZVxuICAgIC8vIHBhcnQgYXMgYSBsaXN0ZW5lci5cbiAgICBjb25zdCBzaG91bGRSZW1vdmVMaXN0ZW5lciA9XG4gICAgICAobmV3TGlzdGVuZXIgPT09IG5vdGhpbmcgJiYgb2xkTGlzdGVuZXIgIT09IG5vdGhpbmcpIHx8XG4gICAgICAobmV3TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5jYXB0dXJlICE9PVxuICAgICAgICAob2xkTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5jYXB0dXJlIHx8XG4gICAgICAobmV3TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5vbmNlICE9PVxuICAgICAgICAob2xkTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5vbmNlIHx8XG4gICAgICAobmV3TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5wYXNzaXZlICE9PVxuICAgICAgICAob2xkTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zKS5wYXNzaXZlO1xuXG4gICAgLy8gSWYgdGhlIG5ldyB2YWx1ZSBpcyBub3Qgbm90aGluZyBhbmQgd2UgcmVtb3ZlZCB0aGUgbGlzdGVuZXIsIHdlIGhhdmVcbiAgICAvLyB0byBhZGQgdGhlIHBhcnQgYXMgYSBsaXN0ZW5lci5cbiAgICBjb25zdCBzaG91bGRBZGRMaXN0ZW5lciA9XG4gICAgICBuZXdMaXN0ZW5lciAhPT0gbm90aGluZyAmJlxuICAgICAgKG9sZExpc3RlbmVyID09PSBub3RoaW5nIHx8IHNob3VsZFJlbW92ZUxpc3RlbmVyKTtcblxuICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICBraW5kOiAnY29tbWl0IGV2ZW50IGxpc3RlbmVyJyxcbiAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgIHZhbHVlOiBuZXdMaXN0ZW5lcixcbiAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICByZW1vdmVMaXN0ZW5lcjogc2hvdWxkUmVtb3ZlTGlzdGVuZXIsXG4gICAgICAgIGFkZExpc3RlbmVyOiBzaG91bGRBZGRMaXN0ZW5lcixcbiAgICAgICAgb2xkTGlzdGVuZXIsXG4gICAgICB9KTtcbiAgICBpZiAoc2hvdWxkUmVtb3ZlTGlzdGVuZXIpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgIHRoaXMsXG4gICAgICAgIG9sZExpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXJXaXRoT3B0aW9uc1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHNob3VsZEFkZExpc3RlbmVyKSB7XG4gICAgICAvLyBCZXdhcmU6IElFMTEgYW5kIENocm9tZSA0MSBkb24ndCBsaWtlIHVzaW5nIHRoZSBsaXN0ZW5lciBhcyB0aGVcbiAgICAgIC8vIG9wdGlvbnMgb2JqZWN0LiBGaWd1cmUgb3V0IGhvdyB0byBkZWFsIHcvIHRoaXMgaW4gSUUxMSAtIG1heWJlXG4gICAgICAvLyBwYXRjaCBhZGRFdmVudExpc3RlbmVyP1xuICAgICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgdGhpcyxcbiAgICAgICAgbmV3TGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBuZXdMaXN0ZW5lcjtcbiAgfVxuXG4gIGhhbmRsZUV2ZW50KGV2ZW50OiBFdmVudCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUuY2FsbCh0aGlzLm9wdGlvbnM/Lmhvc3QgPz8gdGhpcy5lbGVtZW50LCBldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgRXZlbnRMaXN0ZW5lck9iamVjdCkuaGFuZGxlRXZlbnQoZXZlbnQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgdHlwZSB7RWxlbWVudFBhcnR9O1xuY2xhc3MgRWxlbWVudFBhcnQgaW1wbGVtZW50cyBEaXNjb25uZWN0YWJsZSB7XG4gIHJlYWRvbmx5IHR5cGUgPSBFTEVNRU5UX1BBUlQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfX2RpcmVjdGl2ZT86IERpcmVjdGl2ZTtcblxuICAvLyBUaGlzIGlzIHRvIGVuc3VyZSB0aGF0IGV2ZXJ5IFBhcnQgaGFzIGEgXyRjb21taXR0ZWRWYWx1ZVxuICBfJGNvbW1pdHRlZFZhbHVlOiB1bmRlZmluZWQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHBhcmVudCE6IERpc2Nvbm5lY3RhYmxlO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPiA9IHVuZGVmaW5lZDtcblxuICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50LFxuICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUsXG4gICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICB0aGlzLl8kcGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxuICAvLyBTZWUgY29tbWVudCBpbiBEaXNjb25uZWN0YWJsZSBpbnRlcmZhY2UgZm9yIHdoeSB0aGlzIGlzIGEgZ2V0dGVyXG4gIGdldCBfJGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl8kcGFyZW50Ll8kaXNDb25uZWN0ZWQ7XG4gIH1cblxuICBfJHNldFZhbHVlKHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICdjb21taXQgdG8gZWxlbWVudCBiaW5kaW5nJyxcbiAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgfSk7XG4gICAgcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBFTkQgVVNFUlMgU0hPVUxEIE5PVCBSRUxZIE9OIFRISVMgT0JKRUNULlxuICpcbiAqIFByaXZhdGUgZXhwb3J0cyBmb3IgdXNlIGJ5IG90aGVyIExpdCBwYWNrYWdlcywgbm90IGludGVuZGVkIGZvciB1c2UgYnlcbiAqIGV4dGVybmFsIHVzZXJzLlxuICpcbiAqIFdlIGN1cnJlbnRseSBkbyBub3QgbWFrZSBhIG1hbmdsZWQgcm9sbHVwIGJ1aWxkIG9mIHRoZSBsaXQtc3NyIGNvZGUuIEluIG9yZGVyXG4gKiB0byBrZWVwIGEgbnVtYmVyIG9mIChvdGhlcndpc2UgcHJpdmF0ZSkgdG9wLWxldmVsIGV4cG9ydHMgbWFuZ2xlZCBpbiB0aGVcbiAqIGNsaWVudCBzaWRlIGNvZGUsIHdlIGV4cG9ydCBhIF8kTEggb2JqZWN0IGNvbnRhaW5pbmcgdGhvc2UgbWVtYmVycyAob3JcbiAqIGhlbHBlciBtZXRob2RzIGZvciBhY2Nlc3NpbmcgcHJpdmF0ZSBmaWVsZHMgb2YgdGhvc2UgbWVtYmVycyksIGFuZCB0aGVuXG4gKiByZS1leHBvcnQgdGhlbSBmb3IgdXNlIGluIGxpdC1zc3IuIFRoaXMga2VlcHMgbGl0LXNzciBhZ25vc3RpYyB0byB3aGV0aGVyIHRoZVxuICogY2xpZW50LXNpZGUgY29kZSBpcyBiZWluZyB1c2VkIGluIGBkZXZgIG1vZGUgb3IgYHByb2RgIG1vZGUuXG4gKlxuICogVGhpcyBoYXMgYSB1bmlxdWUgbmFtZSwgdG8gZGlzYW1iaWd1YXRlIGl0IGZyb20gcHJpdmF0ZSBleHBvcnRzIGluXG4gKiBsaXQtZWxlbWVudCwgd2hpY2ggcmUtZXhwb3J0cyBhbGwgb2YgbGl0LWh0bWwuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IF8kTEggPSB7XG4gIC8vIFVzZWQgaW4gbGl0LXNzclxuICBfYm91bmRBdHRyaWJ1dGVTdWZmaXg6IGJvdW5kQXR0cmlidXRlU3VmZml4LFxuICBfbWFya2VyOiBtYXJrZXIsXG4gIF9tYXJrZXJNYXRjaDogbWFya2VyTWF0Y2gsXG4gIF9IVE1MX1JFU1VMVDogSFRNTF9SRVNVTFQsXG4gIF9nZXRUZW1wbGF0ZUh0bWw6IGdldFRlbXBsYXRlSHRtbCxcbiAgLy8gVXNlZCBpbiB0ZXN0cyBhbmQgcHJpdmF0ZS1zc3Itc3VwcG9ydFxuICBfVGVtcGxhdGVJbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZSxcbiAgX2lzSXRlcmFibGU6IGlzSXRlcmFibGUsXG4gIF9yZXNvbHZlRGlyZWN0aXZlOiByZXNvbHZlRGlyZWN0aXZlLFxuICBfQ2hpbGRQYXJ0OiBDaGlsZFBhcnQsXG4gIF9BdHRyaWJ1dGVQYXJ0OiBBdHRyaWJ1dGVQYXJ0LFxuICBfQm9vbGVhbkF0dHJpYnV0ZVBhcnQ6IEJvb2xlYW5BdHRyaWJ1dGVQYXJ0LFxuICBfRXZlbnRQYXJ0OiBFdmVudFBhcnQsXG4gIF9Qcm9wZXJ0eVBhcnQ6IFByb3BlcnR5UGFydCxcbiAgX0VsZW1lbnRQYXJ0OiBFbGVtZW50UGFydCxcbn07XG5cbi8vIEFwcGx5IHBvbHlmaWxscyBpZiBhdmFpbGFibGVcbmNvbnN0IHBvbHlmaWxsU3VwcG9ydCA9IERFVl9NT0RFXG4gID8gZ2xvYmFsLmxpdEh0bWxQb2x5ZmlsbFN1cHBvcnREZXZNb2RlXG4gIDogZ2xvYmFsLmxpdEh0bWxQb2x5ZmlsbFN1cHBvcnQ7XG5wb2x5ZmlsbFN1cHBvcnQ/LihUZW1wbGF0ZSwgQ2hpbGRQYXJ0KTtcblxuLy8gSU1QT1JUQU5UOiBkbyBub3QgY2hhbmdlIHRoZSBwcm9wZXJ0eSBuYW1lIG9yIHRoZSBhc3NpZ25tZW50IGV4cHJlc3Npb24uXG4vLyBUaGlzIGxpbmUgd2lsbCBiZSB1c2VkIGluIHJlZ2V4ZXMgdG8gc2VhcmNoIGZvciBsaXQtaHRtbCB1c2FnZS5cbihnbG9iYWwubGl0SHRtbFZlcnNpb25zID8/PSBbXSkucHVzaCgnMy4yLjEnKTtcbmlmIChERVZfTU9ERSAmJiBnbG9iYWwubGl0SHRtbFZlcnNpb25zLmxlbmd0aCA+IDEpIHtcbiAgaXNzdWVXYXJuaW5nIShcbiAgICAnbXVsdGlwbGUtdmVyc2lvbnMnLFxuICAgIGBNdWx0aXBsZSB2ZXJzaW9ucyBvZiBMaXQgbG9hZGVkLiBgICtcbiAgICAgIGBMb2FkaW5nIG11bHRpcGxlIHZlcnNpb25zIGlzIG5vdCByZWNvbW1lbmRlZC5gXG4gICk7XG59XG5cbi8qKlxuICogUmVuZGVycyBhIHZhbHVlLCB1c3VhbGx5IGEgbGl0LWh0bWwgVGVtcGxhdGVSZXN1bHQsIHRvIHRoZSBjb250YWluZXIuXG4gKlxuICogVGhpcyBleGFtcGxlIHJlbmRlcnMgdGhlIHRleHQgXCJIZWxsbywgWm9lIVwiIGluc2lkZSBhIHBhcmFncmFwaCB0YWcsIGFwcGVuZGluZ1xuICogaXQgdG8gdGhlIGNvbnRhaW5lciBgZG9jdW1lbnQuYm9keWAuXG4gKlxuICogYGBganNcbiAqIGltcG9ydCB7aHRtbCwgcmVuZGVyfSBmcm9tICdsaXQnO1xuICpcbiAqIGNvbnN0IG5hbWUgPSBcIlpvZVwiO1xuICogcmVuZGVyKGh0bWxgPHA+SGVsbG8sICR7bmFtZX0hPC9wPmAsIGRvY3VtZW50LmJvZHkpO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHZhbHVlIEFueSBbcmVuZGVyYWJsZVxuICogICB2YWx1ZV0oaHR0cHM6Ly9saXQuZGV2L2RvY3MvdGVtcGxhdGVzL2V4cHJlc3Npb25zLyNjaGlsZC1leHByZXNzaW9ucyksXG4gKiAgIHR5cGljYWxseSBhIHtAbGlua2NvZGUgVGVtcGxhdGVSZXN1bHR9IGNyZWF0ZWQgYnkgZXZhbHVhdGluZyBhIHRlbXBsYXRlIHRhZ1xuICogICBsaWtlIHtAbGlua2NvZGUgaHRtbH0gb3Ige0BsaW5rY29kZSBzdmd9LlxuICogQHBhcmFtIGNvbnRhaW5lciBBIERPTSBjb250YWluZXIgdG8gcmVuZGVyIHRvLiBUaGUgZmlyc3QgcmVuZGVyIHdpbGwgYXBwZW5kXG4gKiAgIHRoZSByZW5kZXJlZCB2YWx1ZSB0byB0aGUgY29udGFpbmVyLCBhbmQgc3Vic2VxdWVudCByZW5kZXJzIHdpbGxcbiAqICAgZWZmaWNpZW50bHkgdXBkYXRlIHRoZSByZW5kZXJlZCB2YWx1ZSBpZiB0aGUgc2FtZSByZXN1bHQgdHlwZSB3YXNcbiAqICAgcHJldmlvdXNseSByZW5kZXJlZCB0aGVyZS5cbiAqIEBwYXJhbSBvcHRpb25zIFNlZSB7QGxpbmtjb2RlIFJlbmRlck9wdGlvbnN9IGZvciBvcHRpb25zIGRvY3VtZW50YXRpb24uXG4gKiBAc2VlXG4gKiB7QGxpbmsgaHR0cHM6Ly9saXQuZGV2L2RvY3MvbGlicmFyaWVzL3N0YW5kYWxvbmUtdGVtcGxhdGVzLyNyZW5kZXJpbmctbGl0LWh0bWwtdGVtcGxhdGVzfCBSZW5kZXJpbmcgTGl0IEhUTUwgVGVtcGxhdGVzfVxuICovXG5leHBvcnQgY29uc3QgcmVuZGVyID0gKFxuICB2YWx1ZTogdW5rbm93bixcbiAgY29udGFpbmVyOiBIVE1MRWxlbWVudCB8IERvY3VtZW50RnJhZ21lbnQsXG4gIG9wdGlvbnM/OiBSZW5kZXJPcHRpb25zXG4pOiBSb290UGFydCA9PiB7XG4gIGlmIChERVZfTU9ERSAmJiBjb250YWluZXIgPT0gbnVsbCkge1xuICAgIC8vIEdpdmUgYSBjbGVhcmVyIGVycm9yIG1lc3NhZ2UgdGhhblxuICAgIC8vICAgICBVbmNhdWdodCBUeXBlRXJyb3I6IENhbm5vdCByZWFkIHByb3BlcnRpZXMgb2YgbnVsbCAocmVhZGluZ1xuICAgIC8vICAgICAnXyRsaXRQYXJ0JCcpXG4gICAgLy8gd2hpY2ggcmVhZHMgbGlrZSBhbiBpbnRlcm5hbCBMaXQgZXJyb3IuXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgVGhlIGNvbnRhaW5lciB0byByZW5kZXIgaW50byBtYXkgbm90IGJlICR7Y29udGFpbmVyfWApO1xuICB9XG4gIGNvbnN0IHJlbmRlcklkID0gREVWX01PREUgPyBkZWJ1Z0xvZ1JlbmRlcklkKysgOiAwO1xuICBjb25zdCBwYXJ0T3duZXJOb2RlID0gb3B0aW9ucz8ucmVuZGVyQmVmb3JlID8/IGNvbnRhaW5lcjtcbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgbGV0IHBhcnQ6IENoaWxkUGFydCA9IChwYXJ0T3duZXJOb2RlIGFzIGFueSlbJ18kbGl0UGFydCQnXTtcbiAgZGVidWdMb2dFdmVudCAmJlxuICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAga2luZDogJ2JlZ2luIHJlbmRlcicsXG4gICAgICBpZDogcmVuZGVySWQsXG4gICAgICB2YWx1ZSxcbiAgICAgIGNvbnRhaW5lcixcbiAgICAgIG9wdGlvbnMsXG4gICAgICBwYXJ0LFxuICAgIH0pO1xuICBpZiAocGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgZW5kTm9kZSA9IG9wdGlvbnM/LnJlbmRlckJlZm9yZSA/PyBudWxsO1xuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAocGFydE93bmVyTm9kZSBhcyBhbnkpWydfJGxpdFBhcnQkJ10gPSBwYXJ0ID0gbmV3IENoaWxkUGFydChcbiAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoY3JlYXRlTWFya2VyKCksIGVuZE5vZGUpLFxuICAgICAgZW5kTm9kZSxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIG9wdGlvbnMgPz8ge31cbiAgICApO1xuICB9XG4gIHBhcnQuXyRzZXRWYWx1ZSh2YWx1ZSk7XG4gIGRlYnVnTG9nRXZlbnQgJiZcbiAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgIGtpbmQ6ICdlbmQgcmVuZGVyJyxcbiAgICAgIGlkOiByZW5kZXJJZCxcbiAgICAgIHZhbHVlLFxuICAgICAgY29udGFpbmVyLFxuICAgICAgb3B0aW9ucyxcbiAgICAgIHBhcnQsXG4gICAgfSk7XG4gIHJldHVybiBwYXJ0IGFzIFJvb3RQYXJ0O1xufTtcblxuaWYgKEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUykge1xuICByZW5kZXIuc2V0U2FuaXRpemVyID0gc2V0U2FuaXRpemVyO1xuICByZW5kZXIuY3JlYXRlU2FuaXRpemVyID0gY3JlYXRlU2FuaXRpemVyO1xuICBpZiAoREVWX01PREUpIHtcbiAgICByZW5kZXIuX3Rlc3RPbmx5Q2xlYXJTYW5pdGl6ZXJGYWN0b3J5RG9Ob3RDYWxsT3JFbHNlID1cbiAgICAgIF90ZXN0T25seUNsZWFyU2FuaXRpemVyRmFjdG9yeURvTm90Q2FsbE9yRWxzZTtcbiAgfVxufVxuIiwgIi8qKiBSZXN1bHQgYWxsb3dzIGVhc2llciBoYW5kbGluZyBvZiByZXR1cm5pbmcgZWl0aGVyIGFuIGVycm9yIG9yIGEgdmFsdWUgZnJvbSBhXG4gKiBmdW5jdGlvbi4gKi9cbmV4cG9ydCB0eXBlIFJlc3VsdDxUPiA9IHsgb2s6IHRydWU7IHZhbHVlOiBUIH0gfCB7IG9rOiBmYWxzZTsgZXJyb3I6IEVycm9yIH07XG5cbmV4cG9ydCBmdW5jdGlvbiBvazxUPih2YWx1ZTogVCk6IFJlc3VsdDxUPiB7XG4gIHJldHVybiB7IG9rOiB0cnVlLCB2YWx1ZTogdmFsdWUgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVycm9yPFQ+KHZhbHVlOiBzdHJpbmcgfCBFcnJvcik6IFJlc3VsdDxUPiB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBuZXcgRXJyb3IodmFsdWUpIH07XG4gIH1cbiAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogdmFsdWUgfTtcbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgT3AgfSBmcm9tIFwiLi4vb3BzL29wc1wiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHRcIjtcblxuZXhwb3J0IHR5cGUgUG9zdEFjdG9uV29yayA9IFwiXCIgfCBcInBhaW50Q2hhcnRcIiB8IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3Rvbldvcms7XG4gIC8vIFRPRE8gLSBEbyB3ZSBuZWVkIGEgUG9zdEFjdGlvbkZvY3VzOiBudW1iZXIgd2hpY2ggcG9pbnRzIHRvIHRoZSBUYXNrIHdlIHNob3VsZCBtb3ZlIHRoZSBmb2N1cyB0bz9cbiAgdW5kbzogYm9vbGVhbjsgLy8gSWYgdHJ1ZSBpbmNsdWRlIGluIHVuZG8vcmVkbyBhY3Rpb25zLlxuICBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj47XG59XG5cbmV4cG9ydCBjbGFzcyBOT09QQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiRG9lcyBub3RoaW5nXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgcmV0dXJuIG9rKG5ldyBOT09QQWN0aW9uKCkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25Gcm9tT3Age1xuICBuYW1lOiBzdHJpbmcgPSBcIkFjdGlvbkZyb21PcFwiO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJBY3Rpb24gY29uc3RydWN0ZWQgZGlyZWN0bHkgZnJvbSBhbiBPcC5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3Rvbldvcms7XG4gIHVuZG86IGJvb2xlYW47XG5cbiAgb3A6IE9wO1xuXG4gIGNvbnN0cnVjdG9yKG9wOiBPcCwgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmssIHVuZG86IGJvb2xlYW4pIHtcbiAgICB0aGlzLnBvc3RBY3Rpb25Xb3JrID0gcG9zdEFjdGlvbldvcms7XG4gICAgdGhpcy51bmRvID0gdW5kbztcbiAgICB0aGlzLm9wID0gb3A7XG4gIH1cblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGNvbnN0IHJldCA9IHRoaXMub3AuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBleHBsYW5NYWluLnBsYW4gPSByZXQudmFsdWUucGxhbjtcbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuIiwgIi8qKiBPbmUgdmVydGV4IG9mIGEgZ3JhcGguICovXG5leHBvcnQgdHlwZSBWZXJ0ZXggPSBvYmplY3Q7XG5cbi8qKiBFdmVyeSBWZXJ0ZXggaW4gYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIFZlcnRpY2VzID0gVmVydGV4W107XG5cbi8qKiBBIHN1YnNldCBvZiBWZXJ0aWNlcyByZWZlcnJlZCB0byBieSB0aGVpciBpbmRleCBudW1iZXIuICovXG5leHBvcnQgdHlwZSBWZXJ0ZXhJbmRpY2VzID0gbnVtYmVyW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCB7XG4gIGk6IG51bWJlcjtcbiAgajogbnVtYmVyO1xufVxuXG4vKiogT25lIGVkZ2Ugb2YgYSBncmFwaCwgd2hpY2ggaXMgYSBkaXJlY3RlZCBjb25uZWN0aW9uIGZyb20gdGhlIGkndGggVmVydGV4IHRvXG50aGUgaid0aCBWZXJ0ZXgsIHdoZXJlIHRoZSBWZXJ0ZXggaXMgc3RvcmVkIGluIGEgVmVydGljZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXJlY3RlZEVkZ2Uge1xuICBpOiBudW1iZXIgPSAwO1xuICBqOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGk6IG51bWJlciA9IDAsIGo6IG51bWJlciA9IDApIHtcbiAgICB0aGlzLmkgPSBpO1xuICAgIHRoaXMuaiA9IGo7XG4gIH1cblxuICBlcXVhbChyaHM6IERpcmVjdGVkRWRnZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiByaHMuaSA9PT0gdGhpcy5pICYmIHJocy5qID09PSB0aGlzLmo7XG4gIH1cblxuICB0b0pTT04oKTogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGk6IHRoaXMuaSxcbiAgICAgIGo6IHRoaXMuaixcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGZyb21KU09OKGRlczogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCk6IERpcmVjdGVkRWRnZSB7XG4gICAgcmV0dXJuIG5ldyBEaXJlY3RlZEVkZ2UoZGVzLmksIGRlcy5qKTtcbiAgfVxufVxuXG4vKiogRXZlcnkgRWdkZSBpbiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgRWRnZXMgPSBEaXJlY3RlZEVkZ2VbXTtcblxuLyoqIEEgZ3JhcGggaXMganVzdCBhIGNvbGxlY3Rpb24gb2YgVmVydGljZXMgYW5kIEVkZ2VzIGJldHdlZW4gdGhvc2UgdmVydGljZXMuICovXG5leHBvcnQgdHlwZSBEaXJlY3RlZEdyYXBoID0ge1xuICBWZXJ0aWNlczogVmVydGljZXM7XG4gIEVkZ2VzOiBFZGdlcztcbn07XG5cbi8qKlxuIEdyb3VwcyB0aGUgRWRnZXMgYnkgdGhlaXIgYGlgIHZhbHVlLlxuXG4gQHBhcmFtIGVkZ2VzIC0gQWxsIHRoZSBFZ2VzIGluIGEgRGlyZWN0ZWRHcmFwaC5cbiBAcmV0dXJucyBBIG1hcCBmcm9tIHRoZSBWZXJ0ZXggaW5kZXggdG8gYWxsIHRoZSBFZGdlcyB0aGF0IHN0YXJ0IGF0XG4gICBhdCB0aGF0IFZlcnRleCBpbmRleC5cbiAqL1xuZXhwb3J0IGNvbnN0IGVkZ2VzQnlTcmNUb01hcCA9IChlZGdlczogRWRnZXMpOiBNYXA8bnVtYmVyLCBFZGdlcz4gPT4ge1xuICBjb25zdCByZXQgPSBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCk7XG5cbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgY29uc3QgYXJyID0gcmV0LmdldChlLmkpIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5zZXQoZS5pLCBhcnIpO1xuICB9KTtcblxuICByZXR1cm4gcmV0O1xufTtcblxuLyoqXG4gICBHcm91cHMgdGhlIEVkZ2VzIGJ5IHRoZWlyIGBqYCB2YWx1ZS5cbiAgXG4gICBAcGFyYW0gZWRnZXMgLSBBbGwgdGhlIEVkZ2VzIGluIGEgRGlyZWN0ZWRHcmFwaC5cbiAgIEByZXR1cm5zIEEgbWFwIGZyb20gdGhlIFZlcnRleCBpbmRleCB0byBhbGwgdGhlIEVkZ2VzIHRoYXQgZW5kIGF0XG4gICAgIGF0IHRoYXQgVmVydGV4IGluZGV4LlxuICAgKi9cblxuZXhwb3J0IGNvbnN0IGVkZ2VzQnlEc3RUb01hcCA9IChlZGdlczogRWRnZXMpOiBNYXA8bnVtYmVyLCBFZGdlcz4gPT4ge1xuICBjb25zdCByZXQgPSBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCk7XG5cbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgY29uc3QgYXJyID0gcmV0LmdldChlLmopIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5zZXQoZS5qLCBhcnIpO1xuICB9KTtcblxuICByZXR1cm4gcmV0O1xufTtcblxuZXhwb3J0IHR5cGUgU3JjQW5kRHN0UmV0dXJuID0ge1xuICBieVNyYzogTWFwPG51bWJlciwgRWRnZXM+O1xuICBieURzdDogTWFwPG51bWJlciwgRWRnZXM+O1xufTtcblxuZXhwb3J0IGNvbnN0IGVkZ2VzQnlTcmNBbmREc3RUb01hcCA9IChlZGdlczogRWRnZXMpOiBTcmNBbmREc3RSZXR1cm4gPT4ge1xuICBjb25zdCByZXQgPSB7XG4gICAgYnlTcmM6IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKSxcbiAgICBieURzdDogbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpLFxuICB9O1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGxldCBhcnIgPSByZXQuYnlTcmMuZ2V0KGUuaSkgfHwgW107XG4gICAgYXJyLnB1c2goZSk7XG4gICAgcmV0LmJ5U3JjLnNldChlLmksIGFycik7XG4gICAgYXJyID0gcmV0LmJ5RHN0LmdldChlLmopIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5ieURzdC5zZXQoZS5qLCBhcnIpO1xuICB9KTtcblxuICByZXR1cm4gcmV0O1xufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcblxuLy8gT3BlcmF0aW9ucyBvbiBQbGFucy4gTm90ZSB0aGV5IGFyZSByZXZlcnNpYmxlLCBzbyB3ZSBjYW4gaGF2ZSBhbiAndW5kbycgbGlzdC5cblxuLy8gQWxzbywgc29tZSBvcGVyYXRpb25zIG1pZ2h0IGhhdmUgJ3BhcnRpYWxzJywgaS5lLiByZXR1cm4gYSBsaXN0IG9mIHZhbGlkXG4vLyBvcHRpb25zIHRoYXQgY2FuIGJlIHBhc3NlZCB0byB0aGUgb3BlcmF0aW9uLiBGb3IgZXhhbXBsZSwgYWRkaW5nIGFcbi8vIHByZWRlY2Vzc29yIGNvdWxkIGxpc3QgYWxsIHRoZSBUYXNrcyB0aGF0IHdvdWxkIG5vdCBmb3JtIGEgbG9vcCwgaS5lLiBleGNsdWRlXG4vLyBhbGwgZGVzY2VuZGVudHMsIGFuZCB0aGUgVGFzayBpdHNlbGYsIGZyb20gdGhlIGxpc3Qgb2Ygb3B0aW9ucy5cbi8vXG4vLyAqIENoYW5nZSBzdHJpbmcgdmFsdWUgaW4gYSBUYXNrLlxuLy8gKiBDaGFuZ2UgZHVyYXRpb24gdmFsdWUgaW4gYSBUYXNrLlxuLy8gKiBJbnNlcnQgbmV3IGVtcHR5IFRhc2sgYWZ0ZXIgSW5kZXguXG4vLyAqIFNwbGl0IGEgVGFzay4gKFByZWRlY2Vzc29yIHRha2VzIGFsbCBpbmNvbWluZyBlZGdlcywgc291cmNlIHRhc2tzIGFsbCBvdXRnb2luZyBlZGdlcykuXG4vL1xuLy8gKiBEdXBsaWNhdGUgYSBUYXNrIChhbGwgZWRnZXMgYXJlIGR1cGxpY2F0ZWQgZnJvbSB0aGUgc291cmNlIFRhc2spLlxuLy8gKiBEZWxldGUgcHJlZGVjZXNzb3IgdG8gYSBUYXNrLlxuLy8gKiBEZWxldGUgc3VjY2Vzc29yIHRvIGEgVGFzay5cbi8vICogRGVsZXRlIGEgVGFzay5cblxuLy8gTmVlZCBVbmRvL1JlZG8gU3RhY2tzLlxuLy8gVGhlc2UgcmVjb3JkIHRoZSBzdWItb3BzIGZvciBlYWNoIGxhcmdlIG9wLiBFLmcuIGFuIGluc2VydCB0YXNrIG9wIGlzIG1hZGVcbi8vIG9mIHRocmVlIHN1Yi1vcHM6XG4vLyAgICAxLiBpbnNlcnQgdGFzayBpbnRvIFZlcnRpY2VzIGFuZCByZW51bWJlciBFZGdlc1xuLy8gICAgMi4gQWRkIGVkZ2UgZnJvbSBTdGFydCB0byBOZXcgVGFza1xuLy8gICAgMy4gQWRkIGVkZ2UgZnJvbSBOZXcgVGFzayB0byBGaW5pc2hcbi8vXG4vLyBFYWNoIHN1Yi1vcDpcbi8vICAgIDEuIFJlY29yZHMgYWxsIHRoZSBpbmZvIGl0IG5lZWRzIHRvIHdvcmsuXG4vLyAgICAyLiBDYW4gYmUgXCJhcHBsaWVkXCIgdG8gYSBQbGFuLlxuLy8gICAgMy4gQ2FuIGdlbmVyYXRlIGl0cyBpbnZlcnNlIHN1Yi1vcC5cblxuLy8gVGhlIHJlc3VsdHMgZnJvbSBhcHBseWluZyBhIFN1Yk9wLiBUaGlzIGlzIHRoZSBvbmx5IHdheSB0byBnZXQgdGhlIGludmVyc2Ugb2Zcbi8vIGEgU3ViT3Agc2luY2UgdGhlIFN1Yk9wIGludmVyc2UgbWlnaHQgZGVwZW5kIG9uIHRoZSBzdGF0ZSBvZiB0aGUgUGxhbiBhdCB0aGVcbi8vIHRpbWUgdGhlIFN1Yk9wIHdhcyBhcHBsaWVkLlxuZXhwb3J0IGludGVyZmFjZSBTdWJPcFJlc3VsdCB7XG4gIHBsYW46IFBsYW47XG4gIGludmVyc2U6IFN1Yk9wO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN1Yk9wIHtcbiAgLy8gSWYgdGhlIGFwcGx5IHJldHVybnMgYW4gZXJyb3IgaXQgaXMgZ3VhcmFudGVlZCBub3QgdG8gaGF2ZSBtb2RpZmllZCB0aGVcbiAgLy8gUGxhbi5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcFJlc3VsdCB7XG4gIHBsYW46IFBsYW47XG4gIGludmVyc2U6IE9wO1xufVxuXG4vLyBPcCBhcmUgb3BlcmF0aW9ucyBhcmUgYXBwbGllZCB0byBtYWtlIGNoYW5nZXMgdG8gYSBQbGFuLlxuZXhwb3J0IGNsYXNzIE9wIHtcbiAgc3ViT3BzOiBTdWJPcFtdID0gW107XG5cbiAgY29uc3RydWN0b3Ioc3ViT3BzOiBTdWJPcFtdKSB7XG4gICAgdGhpcy5zdWJPcHMgPSBzdWJPcHM7XG4gIH1cblxuICAvLyBSZXZlcnRzIGFsbCBTdWJPcHMgdXAgdG8gdGhlIGdpdmVuIGluZGV4LlxuICBhcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4oXG4gICAgcGxhbjogUGxhbixcbiAgICBpbnZlcnNlU3ViT3BzOiBTdWJPcFtdXG4gICk6IFJlc3VsdDxQbGFuPiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnZlcnNlU3ViT3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlID0gaW52ZXJzZVN1Yk9wc1tpXS5hcHBseVRvKHBsYW4pO1xuICAgICAgaWYgKCFlLm9rKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgICAgcGxhbiA9IGUudmFsdWUucGxhbjtcbiAgICB9XG5cbiAgICByZXR1cm4gb2socGxhbik7XG4gIH1cblxuICAvLyBBcHBsaWVzIHRoZSBPcCB0byBhIFBsYW4uXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGludmVyc2VTdWJPcHM6IFN1Yk9wW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc3ViT3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlID0gdGhpcy5zdWJPcHNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICAvLyBSZXZlcnQgYWxsIHRoZSBTdWJPcHMgYXBwbGllZCB1cCB0byB0aGlzIHBvaW50IHRvIGdldCB0aGUgUGxhbiBiYWNrIGluIGFcbiAgICAgICAgLy8gZ29vZCBwbGFjZS5cbiAgICAgICAgY29uc3QgcmV2ZXJ0RXJyID0gdGhpcy5hcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4ocGxhbiwgaW52ZXJzZVN1Yk9wcyk7XG4gICAgICAgIGlmICghcmV2ZXJ0RXJyLm9rKSB7XG4gICAgICAgICAgcmV0dXJuIHJldmVydEVycjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgICBpbnZlcnNlU3ViT3BzLnVuc2hpZnQoZS52YWx1ZS5pbnZlcnNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IG5ldyBPcChpbnZlcnNlU3ViT3BzKSxcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBBbGxPcHNSZXN1bHQgPSB7XG4gIG9wczogT3BbXTtcbiAgcGxhbjogUGxhbjtcbn07XG5cbmNvbnN0IGFwcGx5QWxsSW52ZXJzZU9wc1RvUGxhbiA9IChpbnZlcnNlczogT3BbXSwgcGxhbjogUGxhbik6IFJlc3VsdDxQbGFuPiA9PiB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaW52ZXJzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByZXMgPSBpbnZlcnNlc1tpXS5hcHBseVRvKHBsYW4pO1xuICAgIGlmICghcmVzLm9rKSB7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBwbGFuID0gcmVzLnZhbHVlLnBsYW47XG4gIH1cblxuICByZXR1cm4gb2socGxhbik7XG59O1xuXG4vLyBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgYXBwbHlpbmcgbXVsdGlwbGUgT3BzIHRvIGEgcGxhbiwgdXNlZCBtb3N0bHkgZm9yXG4vLyB0ZXN0aW5nLlxuZXhwb3J0IGNvbnN0IGFwcGx5QWxsT3BzVG9QbGFuID0gKFxuICBvcHM6IE9wW10sXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxBbGxPcHNSZXN1bHQ+ID0+IHtcbiAgY29uc3QgaW52ZXJzZXM6IE9wW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByZXMgPSBvcHNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgY29uc3QgaW52ZXJzZVJlcyA9IGFwcGx5QWxsSW52ZXJzZU9wc1RvUGxhbihpbnZlcnNlcywgcGxhbik7XG4gICAgICBpZiAoIWludmVyc2VSZXMub2spIHtcbiAgICAgICAgLy8gVE9ETyBDYW4gd2Ugd3JhcCB0aGUgRXJyb3IgaW4gYW5vdGhlciBlcnJvciB0byBtYWtlIGl0IGNsZWFyIHRoaXNcbiAgICAgICAgLy8gZXJyb3IgaGFwcGVuZWQgd2hlbiB0cnlpbmcgdG8gY2xlYW4gdXAgZnJvbSB0aGUgcHJldmlvdXMgRXJyb3Igd2hlblxuICAgICAgICAvLyB0aGUgYXBwbHkoKSBmYWlsZWQuXG4gICAgICAgIHJldHVybiBpbnZlcnNlUmVzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgaW52ZXJzZXMudW5zaGlmdChyZXMudmFsdWUuaW52ZXJzZSk7XG4gICAgcGxhbiA9IHJlcy52YWx1ZS5wbGFuO1xuICB9XG5cbiAgcmV0dXJuIG9rKHtcbiAgICBvcHM6IGludmVyc2VzLFxuICAgIHBsYW46IHBsYW4sXG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGFwcGx5QWxsT3BzVG9QbGFuQW5kVGhlbkludmVyc2UgPSAoXG4gIG9wczogT3BbXSxcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PEFsbE9wc1Jlc3VsdD4gPT4ge1xuICBjb25zdCByZXMgPSBhcHBseUFsbE9wc1RvUGxhbihvcHMsIHBsYW4pO1xuICBpZiAoIXJlcy5vaykge1xuICAgIHJldHVybiByZXM7XG4gIH1cbiAgcmV0dXJuIGFwcGx5QWxsT3BzVG9QbGFuKHJlcy52YWx1ZS5vcHMsIHJlcy52YWx1ZS5wbGFuKTtcbn07XG4vLyBOb09wIGlzIGEgbm8tb3AuXG5leHBvcnQgZnVuY3Rpb24gTm9PcCgpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW10pO1xufVxuIiwgIi8vIENoYW5nZU1ldHJpY1ZhbHVlXG5cbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBlcnJvciwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBPcCwgU3ViT3AsIFN1Yk9wUmVzdWx0IH0gZnJvbSBcIi4vb3BzLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiBtZXRyaWMga2V5LlxuICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbiA9IG1ldHJpY0RlZmluaXRpb247XG4gICAgdGhpcy50YXNrTWV0cmljVmFsdWVzID0gdGFza01ldHJpY1ZhbHVlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmIChwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uYW1lfSBhbHJlYWR5IGV4aXN0cyBhcyBhIE1ldHJpY2ApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUsIHRoaXMubWV0cmljRGVmaW5pdGlvbik7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGFkZCB0aGlzIG1ldHJpYyBhbmQgc2V0IGl0IHRvIHRoZSBkZWZhdWx0LFxuICAgIC8vIHVubGVzcyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrTWV0cmljVmFsdWVzLCBpbiB3aGljaCBjYXNlIHdlIHdpbGxcbiAgICAvLyB1c2UgdGhhdCB2YWx1ZSwgaS5lLiB0aGlzIEFkZE1ldHJpY1N1Yk9wIGlzIGFjdHVhbGx5IGEgcmV2ZXJ0IG9mIGFcbiAgICAvLyBEZWxldGVNZXRyaWNTdWJPcC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIHRhc2suc2V0TWV0cmljKFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcy5nZXQoaW5kZXgpIHx8IHRoaXMubWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZU1ldHJpY1N1Yk9wKHRoaXMubmFtZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZU1ldHJpY1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcblxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYFRoZSBtZXRyaWMgd2l0aCBuYW1lICR7dGhpcy5uYW1lfSBkb2VzIG5vdCBleGlzdCBhbmQgY2FuJ3QgYmUgZGVsZXRlZC5gXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFRoZSBzdGF0aWMgTWV0cmljICR7dGhpcy5uYW1lfSBjYW4ndCBiZSBkZWxldGVkLmApO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBmcm9tIHJlc291cmNlIGRlZmluaXRpb25zLlxuICAgIHBsYW4uZGVsZXRlTWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuXG4gICAgY29uc3QgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWU6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHJlbW92ZSBgdGhpcy5uYW1lYCBmcm9tIHRoZSBtZXRyaWMgd2hpbGUgYWxzb1xuICAgIC8vIGJ1aWxkaW5nIHVwIHRoZSBpbmZvIG5lZWRlZCBmb3IgYSByZXZlcnQuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMubmFtZSk7XG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZS5zZXQoaW5kZXgsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRhc2suZGVsZXRlTWV0cmljKHRoaXMubmFtZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShtZXRyaWNEZWZpbml0aW9uLCB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZSksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICBtZXRyaWNWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VOYW1lOiBNYXA8bnVtYmVyLCBudW1iZXI+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZE1ldHJpY1N1Yk9wKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgbWV0cmljRGVmaW5pdGlvbixcbiAgICAgIG1ldHJpY1ZhbHVlc0ZvckRlbGV0ZWRSZXNvdXJjZU5hbWVcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgb2xkTmFtZTogc3RyaW5nO1xuICBuZXdOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob2xkTmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLm9sZE5hbWUgPSBvbGROYW1lO1xuICAgIHRoaXMubmV3TmFtZSA9IG5ld05hbWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAocGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmV3TmFtZSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmV3TmFtZX0gYWxyZWFkeSBleGlzdHMgYXMgYSBtZXRyaWMuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0cmljRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm9sZE5hbWUpO1xuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm9sZE5hbWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgTWV0cmljYCk7XG4gICAgfVxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFN0YXRpYyBtZXRyaWMgJHt0aGlzLm9sZE5hbWV9IGNhbid0IGJlIHJlbmFtZWQuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmV3TmFtZSwgbWV0cmljRGVmaW5pdGlvbik7XG4gICAgcGxhbi5kZWxldGVNZXRyaWNEZWZpbml0aW9uKHRoaXMub2xkTmFtZSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIHJlbmFtZSB0aGlzIG1ldHJpYy5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5vbGROYW1lKSB8fCBtZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgICB0YXNrLnNldE1ldHJpYyh0aGlzLm5ld05hbWUsIHZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlTWV0cmljKHRoaXMub2xkTmFtZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVuYW1lTWV0cmljU3ViT3AodGhpcy5uZXdOYW1lLCB0aGlzLm9sZE5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiBtZXRyaWMga2V5LlxuICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbiA9IG1ldHJpY0RlZmluaXRpb247XG4gICAgdGhpcy50YXNrTWV0cmljVmFsdWVzID0gdGFza01ldHJpY1ZhbHVlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG9sZE1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcbiAgICBpZiAob2xkTWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cbiAgICBpZiAob2xkTWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBTdGF0aWMgbWV0cmljICR7dGhpcy5uYW1lfSBjYW4ndCBiZSB1cGRhdGVkLmApO1xuICAgIH1cblxuICAgIC8vIFJhdGlvbmFsaXplIGRlZmF1bHQgc2hvdWxkIGJlIGluIFttaW4sIG1heF0uXG4gICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24ucmFuZ2UuY2xhbXAoXG4gICAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24uZGVmYXVsdFxuICAgICk7XG5cbiAgICBwbGFuLnNldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lLCB0aGlzLm1ldHJpY0RlZmluaXRpb24pO1xuXG4gICAgY29uc3QgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIHVwZGF0ZSB0aGUgbWV0cmljIHZhbHVlcyB0byByZWZsZWN0IHRoZSBuZXdcbiAgICAvLyBtZXRyaWMgZGVmaW5pdGlvbiwgdW5sZXNzIHRoZXJlIGlzIG1hdGNoaW5nIGVudHJ5IGluIHRhc2tNZXRyaWNWYWx1ZXMsIGluXG4gICAgLy8gd2hpY2ggY2FzZSB3ZSB3aWxsIHVzZSB0aGF0IHZhbHVlLCBpLmUuIHRoaXMgVXBkYXRlTWV0cmljU3ViT3AgaXNcbiAgICAvLyBhY3R1YWxseSBhIHJldmVydCBvZiBhbm90aGVyIFVwZGF0ZU1ldHJpY1N1Yk9wLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpITtcblxuICAgICAgbGV0IG5ld1ZhbHVlOiBudW1iZXI7XG4gICAgICBpZiAodGhpcy50YXNrTWV0cmljVmFsdWVzLmhhcyhpbmRleCkpIHtcbiAgICAgICAgLy8gdGFza01ldHJpY1ZhbHVlcyBoYXMgYSB2YWx1ZSB0aGVuIHVzZSB0aGF0LCBhcyB0aGlzIGlzIGFuIGludmVyc2VcbiAgICAgICAgLy8gb3BlcmF0aW9uLlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMudGFza01ldHJpY1ZhbHVlcy5nZXQoaW5kZXgpITtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIG9sZFZhbHVlID09PSBvbGRNZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQgJiZcbiAgICAgICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uLnJhbmdlLm1pbiA8PSBvbGRWYWx1ZSAmJlxuICAgICAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24ucmFuZ2UubWF4ID4gb2xkVmFsdWVcbiAgICAgICkge1xuICAgICAgICAvLyBJZiB0aGUgb2xkVmFsdWUgaXMgdGhlIGRlZmF1bHQsIGNoYW5nZSBpdCB0byB0aGUgbmV3IGRlZmF1bHQsIGJ1dCBvbmx5IGlmIHRoZVxuICAgICAgICAvLyBuZXcgZGVmYXVsdCBpcyBpbiB0aGUgcmFuZ2UuXG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgICAgIHRhc2tNZXRyaWNWYWx1ZXMuc2V0KGluZGV4LCBvbGRWYWx1ZSk7XG5cbiAgICAgICAgLy8gV2hhdCBtaWdodCBoYXZlIGNoYW5nZWQgaXMgdGhlIG1pbiBvciBtYXggbmV3VmFsdWUsIHdoaWNoIG1pZ2h0IG1ha2VcbiAgICAgICAgLy8gdGhlIGRlZmF1bHQgdmFsdWUgaW52YWxpZC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENsYW1wLlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5yYW5nZS5jbGFtcChvbGRWYWx1ZSk7XG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLnByZWNpc2lvbi5yb3VuZChuZXdWYWx1ZSk7XG4gICAgICAgIHRhc2tNZXRyaWNWYWx1ZXMuc2V0KGluZGV4LCBvbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgICB0YXNrLnNldE1ldHJpYyh0aGlzLm5hbWUsIG5ld1ZhbHVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZE1ldHJpY0RlZmluaXRpb24sIHRhc2tNZXRyaWNWYWx1ZXMpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZShcbiAgICBvbGRNZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgVXBkYXRlTWV0cmljU3ViT3AoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICBvbGRNZXRyaWNEZWZpbml0aW9uLFxuICAgICAgdGFza01ldHJpY1ZhbHVlc1xuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldE1ldHJpY1ZhbHVlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmFsdWU6IG51bWJlcjtcbiAgdGFza0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyLCB0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgbWV0cmljc0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcbiAgICBpZiAobWV0cmljc0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YXNrID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF07XG4gICAgY29uc3Qgb2xkVmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpIHx8IG1ldHJpY3NEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgdGFzay5zZXRNZXRyaWModGhpcy5uYW1lLCBtZXRyaWNzRGVmaW5pdGlvbi5jbGFtcEFuZFJvdW5kKHRoaXMudmFsdWUpKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRWYWx1ZSkgfSk7XG4gIH1cblxuICBpbnZlcnNlKHZhbHVlOiBudW1iZXIpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRNZXRyaWNWYWx1ZVN1Yk9wKHRoaXMubmFtZSwgdmFsdWUsIHRoaXMudGFza0luZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkTWV0cmljT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvblxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgQWRkTWV0cmljU3ViT3AobmFtZSwgbWV0cmljRGVmaW5pdGlvbildKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZU1ldHJpY09wKG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IERlbGV0ZU1ldHJpY1N1Yk9wKG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5hbWVNZXRyaWNPcChvbGROYW1lOiBzdHJpbmcsIG5ld05hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJlbmFtZU1ldHJpY1N1Yk9wKG9sZE5hbWUsIG5ld05hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBVcGRhdGVNZXRyaWNPcChcbiAgbmFtZTogc3RyaW5nLFxuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBVcGRhdGVNZXRyaWNTdWJPcChuYW1lLCBtZXRyaWNEZWZpbml0aW9uKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0TWV0cmljVmFsdWVPcChcbiAgbmFtZTogc3RyaW5nLFxuICB2YWx1ZTogbnVtYmVyLFxuICB0YXNrSW5kZXg6IG51bWJlclxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0TWV0cmljVmFsdWVTdWJPcChuYW1lLCB2YWx1ZSwgdGFza0luZGV4KV0pO1xufVxuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IENoYXJ0LCBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBPcCwgU3ViT3AsIFN1Yk9wUmVzdWx0IH0gZnJvbSBcIi4vb3BzLnRzXCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wLCBTZXRNZXRyaWNWYWx1ZVN1Yk9wIH0gZnJvbSBcIi4vbWV0cmljcy50c1wiO1xuXG4vKiogQSB2YWx1ZSBvZiAtMSBmb3IgaiBtZWFucyB0aGUgRmluaXNoIE1pbGVzdG9uZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEaXJlY3RlZEVkZ2VGb3JQbGFuKFxuICBpOiBudW1iZXIsXG4gIGo6IG51bWJlcixcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PERpcmVjdGVkRWRnZT4ge1xuICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gIGlmIChqID09PSAtMSkge1xuICAgIGogPSBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICB9XG4gIGlmIChpIDwgMCB8fCBpID49IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBpIGluZGV4IG91dCBvZiByYW5nZTogJHtpfSBub3QgaW4gWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMX1dYFxuICAgICk7XG4gIH1cbiAgaWYgKGogPCAwIHx8IGogPj0gY2hhcnQuVmVydGljZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYGogaW5kZXggb3V0IG9mIHJhbmdlOiAke2p9IG5vdCBpbiBbMCwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxfV1gXG4gICAgKTtcbiAgfVxuICBpZiAoaSA9PT0gaikge1xuICAgIHJldHVybiBlcnJvcihgQSBUYXNrIGNhbiBub3QgZGVwZW5kIG9uIGl0c2VsZjogJHtpfSA9PT0gJHtqfWApO1xuICB9XG4gIHJldHVybiBvayhuZXcgRGlyZWN0ZWRFZGdlKGksIGopKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZEVkZ2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmICh0aGlzLmkgPT09IC0xKSB7XG4gICAgICB0aGlzLmkgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuICAgIGlmICh0aGlzLmogPT09IC0xKSB7XG4gICAgICB0aGlzLmogPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuXG4gICAgY29uc3QgZSA9IERpcmVjdGVkRWRnZUZvclBsYW4odGhpcy5pLCB0aGlzLmosIHBsYW4pO1xuICAgIGlmICghZS5vaykge1xuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuXG4gICAgLy8gT25seSBhZGQgdGhlIGVkZ2UgaWYgaXQgZG9lc24ndCBleGlzdHMgYWxyZWFkeS5cbiAgICBpZiAoIXBsYW4uY2hhcnQuRWRnZXMuZmluZCgodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gdmFsdWUuZXF1YWwoZS52YWx1ZSkpKSB7XG4gICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2goZS52YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVtb3ZlRWRnZVN1cE9wKHRoaXMuaSwgdGhpcy5qKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVtb3ZlRWRnZVN1cE9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpOiBudW1iZXIgPSAwO1xuICBqOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGk6IG51bWJlciwgajogbnVtYmVyKSB7XG4gICAgdGhpcy5pID0gaTtcbiAgICB0aGlzLmogPSBqO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHRoaXMuaSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaSA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaiA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaiA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG5cbiAgICBjb25zdCBlID0gRGlyZWN0ZWRFZGdlRm9yUGxhbih0aGlzLmksIHRoaXMuaiwgcGxhbik7XG4gICAgaWYgKCFlLm9rKSB7XG4gICAgICByZXR1cm4gZTtcbiAgICB9XG4gICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgKHY6IERpcmVjdGVkRWRnZSk6IGJvb2xlYW4gPT4gIXYuZXF1YWwoZS52YWx1ZSlcbiAgICApO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkRWRnZVN1Yk9wKHRoaXMuaSwgdGhpcy5qKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyhpbmRleDogbnVtYmVyLCBjaGFydDogQ2hhcnQpOiBSZXN1bHQ8bnVsbD4ge1xuICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID4gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMikge1xuICAgIHJldHVybiBlcnJvcihgJHtpbmRleH0gaXMgbm90IGluIHJhbmdlIFswLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDJ9XWApO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn1cblxuZnVuY3Rpb24gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUoXG4gIGluZGV4OiBudW1iZXIsXG4gIGNoYXJ0OiBDaGFydFxuKTogUmVzdWx0PG51bGw+IHtcbiAgaWYgKGluZGV4IDwgMSB8fCBpbmRleCA+IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDIpIHtcbiAgICByZXR1cm4gZXJyb3IoYCR7aW5kZXh9IGlzIG5vdCBpbiByYW5nZSBbMSwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyfV1gKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRUYXNrQWZ0ZXJTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG4gIGZ1bGxUYXNrVG9CZVJlc3RvcmVkOiBGdWxsVGFza1RvQmVSZXN0b3JlZCB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgaW5kZXg6IG51bWJlcixcbiAgICBmdWxsVGFza1RvQmVSZXN0b3JlZDogRnVsbFRhc2tUb0JlUmVzdG9yZWQgfCBudWxsID0gbnVsbFxuICApIHtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5mdWxsVGFza1RvQmVSZXN0b3JlZCA9IGZ1bGxUYXNrVG9CZVJlc3RvcmVkO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgbGV0IHRhc2sgPSBwbGFuLm5ld1Rhc2soKTtcbiAgICBpZiAodGhpcy5mdWxsVGFza1RvQmVSZXN0b3JlZCAhPT0gbnVsbCkge1xuICAgICAgdGFzayA9IHRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQudGFzaztcbiAgICB9XG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5zcGxpY2UodGhpcy5pbmRleCArIDEsIDAsIHRhc2spO1xuXG4gICAgLy8gVXBkYXRlIEVkZ2VzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgIGlmIChlZGdlLmkgPj0gdGhpcy5pbmRleCArIDEpIHtcbiAgICAgICAgZWRnZS5pKys7XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID49IHRoaXMuaW5kZXggKyAxKSB7XG4gICAgICAgIGVkZ2UuaisrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmZ1bGxUYXNrVG9CZVJlc3RvcmVkICE9PSBudWxsKSB7XG4gICAgICBjaGFydC5FZGdlcy5wdXNoKC4uLnRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQuZWRnZXMpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVUYXNrU3ViT3AodGhpcy5pbmRleCArIDEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXBUYXNrU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUodGhpcy5pbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGNvbnN0IGNvcHkgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMuaW5kZXhdLmR1cCgpO1xuICAgIC8vIEluc2VydCB0aGUgZHVwbGljYXRlIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBUYXNrIGl0IGlzIGNvcGllZCBmcm9tLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXgsIDAsIGNvcHkpO1xuXG4gICAgLy8gVXBkYXRlIEVkZ2VzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgIGlmIChlZGdlLmkgPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaSsrO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5qKys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVUYXNrU3ViT3AodGhpcy5pbmRleCArIDEpO1xuICB9XG59XG5cbnR5cGUgU3Vic3RpdHV0aW9uID0gTWFwPERpcmVjdGVkRWRnZSwgRGlyZWN0ZWRFZGdlPjtcblxuZXhwb3J0IGNsYXNzIE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGZyb21UYXNrSW5kZXg6IG51bWJlciA9IDA7XG4gIHRvVGFza0luZGV4OiBudW1iZXIgPSAwO1xuICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGZyb21UYXNrSW5kZXg6IG51bWJlcixcbiAgICB0b1Rhc2tJbmRleDogbnVtYmVyLFxuICAgIGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb24gPSBuZXcgTWFwKClcbiAgKSB7XG4gICAgdGhpcy5mcm9tVGFza0luZGV4ID0gZnJvbVRhc2tJbmRleDtcbiAgICB0aGlzLnRvVGFza0luZGV4ID0gdG9UYXNrSW5kZXg7XG4gICAgdGhpcy5hY3R1YWxNb3ZlcyA9IGFjdHVhbE1vdmVzO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGxldCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLmZyb21UYXNrSW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUodGhpcy50b1Rhc2tJbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmFjdHVhbE1vdmVzLnZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnN0IGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb24gPSBuZXcgTWFwKCk7XG4gICAgICAvLyBVcGRhdGUgYWxsIEVkZ2VzIHRoYXQgc3RhcnQgYXQgJ2Zyb21UYXNrSW5kZXgnIGFuZCBjaGFuZ2UgdGhlIHN0YXJ0IHRvICd0b1Rhc2tJbmRleCcuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgICAgLy8gU2tpcCB0aGUgY29ybmVyIGNhc2UgdGhlcmUgZnJvbVRhc2tJbmRleCBwb2ludHMgdG8gVGFza0luZGV4LlxuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21UYXNrSW5kZXggJiYgZWRnZS5qID09PSB0aGlzLnRvVGFza0luZGV4KSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21UYXNrSW5kZXgpIHtcbiAgICAgICAgICBhY3R1YWxNb3Zlcy5zZXQoXG4gICAgICAgICAgICBuZXcgRGlyZWN0ZWRFZGdlKHRoaXMudG9UYXNrSW5kZXgsIGVkZ2UuaiksXG4gICAgICAgICAgICBuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgZWRnZS5qKVxuICAgICAgICAgICk7XG4gICAgICAgICAgZWRnZS5pID0gdGhpcy50b1Rhc2tJbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9rKHtcbiAgICAgICAgcGxhbjogcGxhbixcbiAgICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKFxuICAgICAgICAgIHRoaXMudG9UYXNrSW5kZXgsXG4gICAgICAgICAgdGhpcy5mcm9tVGFza0luZGV4LFxuICAgICAgICAgIGFjdHVhbE1vdmVzXG4gICAgICAgICksXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBuZXdFZGdlID0gdGhpcy5hY3R1YWxNb3Zlcy5nZXQocGxhbi5jaGFydC5FZGdlc1tpXSk7XG4gICAgICAgIGlmIChuZXdFZGdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzW2ldID0gbmV3RWRnZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2soe1xuICAgICAgICBwbGFuOiBwbGFuLFxuICAgICAgICBpbnZlcnNlOiBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcChcbiAgICAgICAgICB0aGlzLnRvVGFza0luZGV4LFxuICAgICAgICAgIHRoaXMuZnJvbVRhc2tJbmRleFxuICAgICAgICApLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaW52ZXJzZShcbiAgICB0b1Rhc2tJbmRleDogbnVtYmVyLFxuICAgIGZyb21UYXNrSW5kZXg6IG51bWJlcixcbiAgICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uXG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AoXG4gICAgICB0b1Rhc2tJbmRleCxcbiAgICAgIGZyb21UYXNrSW5kZXgsXG4gICAgICBhY3R1YWxNb3Zlc1xuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvcHlBbGxFZGdlc0Zyb21Ub1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBmcm9tSW5kZXg6IG51bWJlciA9IDA7XG4gIHRvSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoZnJvbUluZGV4OiBudW1iZXIsIHRvSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuZnJvbUluZGV4ID0gZnJvbUluZGV4O1xuICAgIHRoaXMudG9JbmRleCA9IHRvSW5kZXg7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmZyb21JbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3RWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgcGxhbi5jaGFydC5FZGdlcy5mb3JFYWNoKChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbUluZGV4KSB7XG4gICAgICAgIG5ld0VkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZSh0aGlzLnRvSW5kZXgsIGVkZ2UuaikpO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA9PT0gdGhpcy5mcm9tSW5kZXgpIHtcbiAgICAgICAgbmV3RWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgdGhpcy50b0luZGV4KSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLm5ld0VkZ2VzKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBSZW1vdmVBbGxFZGdlc1N1Yk9wKG5ld0VkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVtb3ZlQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgIChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+XG4gICAgICAgIC0xID09PVxuICAgICAgICB0aGlzLmVkZ2VzLmZpbmRJbmRleCgodG9CZVJlbW92ZWQ6IERpcmVjdGVkRWRnZSkgPT5cbiAgICAgICAgICBlZGdlLmVxdWFsKHRvQmVSZW1vdmVkKVxuICAgICAgICApXG4gICAgKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBBZGRBbGxFZGdlc1N1Yk9wKHRoaXMuZWRnZXMpIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRBbGxFZGdlc1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBlZGdlczogRGlyZWN0ZWRFZGdlW107XG5cbiAgY29uc3RydWN0b3IoZWRnZXM6IERpcmVjdGVkRWRnZVtdKSB7XG4gICAgdGhpcy5lZGdlcyA9IGVkZ2VzO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLnRoaXMuZWRnZXMpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogbmV3IFJlbW92ZUFsbEVkZ2VzU3ViT3AodGhpcy5lZGdlcykgfSk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIEZ1bGxUYXNrVG9CZVJlc3RvcmVkIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuICB0YXNrOiBUYXNrO1xufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlVGFza1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjb25zdCBlZGdlc1RvQmVSZXN0b3JlZCA9IGNoYXJ0LkVkZ2VzLmZpbHRlcigoZGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgaWYgKGRlLmkgPT09IHRoaXMuaW5kZXggfHwgZGUuaiA9PT0gdGhpcy5pbmRleCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgIC8vIEZpcnN0IHJlbW92ZSBhbGwgZWRnZXMgdG8gYW5kIGZyb20gdGhlIHRhc2suXG4gICAgY2hhcnQuRWRnZXMgPSBjaGFydC5FZGdlcy5maWx0ZXIoKGRlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChkZS5pID09PSB0aGlzLmluZGV4IHx8IGRlLmogPT09IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgZWRnZXMgZm9yIHRhc2tzIHRoYXQgd2lsbCBlbmQgdXAgYXQgYSBuZXcgaW5kZXguXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5pLS07XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmotLTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YXNrVG9CZVJlc3RvcmVkID0gY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXgsIDEpO1xuICAgIGNvbnN0IGZ1bGxUYXNrVG9CZVJlc3RvcmVkID0ge1xuICAgICAgZWRnZXM6IGVkZ2VzVG9CZVJlc3RvcmVkLFxuICAgICAgdGFzazogdGFza1RvQmVSZXN0b3JlZFswXSxcbiAgICB9O1xuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZShmdWxsVGFza1RvQmVSZXN0b3JlZCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKGZ1bGxUYXNrVG9CZVJlc3RvcmVkOiBGdWxsVGFza1RvQmVSZXN0b3JlZCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFRhc2tBZnRlclN1Yk9wKHRoaXMuaW5kZXggLSAxLCBmdWxsVGFza1RvQmVSZXN0b3JlZCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJhdGlvbmFsaXplRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHNyY0FuZERzdCA9IGVkZ2VzQnlTcmNBbmREc3RUb01hcChwbGFuLmNoYXJ0LkVkZ2VzKTtcbiAgICBjb25zdCBTdGFydCA9IDA7XG4gICAgY29uc3QgRmluaXNoID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuXG4gICAgLy8gbG9vcCBvdmVyIGFsbCB2ZXJ0aWNzIGZyb20gW1N0YXJ0LCBGaW5pc2gpIGFuZCBsb29rIGZvciB0aGVpclxuICAgIC8vIGRlc3RpbmF0aW9ucy4gSWYgdGhleSBoYXZlIG5vbmUgdGhlbiBhZGQgaW4gYW4gZWRnZSB0byBGaW5pc2guIElmIHRoZXlcbiAgICAvLyBoYXZlIG1vcmUgdGhhbiBvbmUgdGhlbiByZW1vdmUgYW55IGxpbmtzIHRvIEZpbmlzaC5cbiAgICBmb3IgKGxldCBpID0gU3RhcnQ7IGkgPCBGaW5pc2g7IGkrKykge1xuICAgICAgY29uc3QgZGVzdGluYXRpb25zID0gc3JjQW5kRHN0LmJ5U3JjLmdldChpKTtcbiAgICAgIGlmIChkZXN0aW5hdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB0b0JlQWRkZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKGksIEZpbmlzaCk7XG4gICAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCh0b0JlQWRkZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXJlIHRoZXJlIGFueSB1bmVlZGVkIEVnZGVzIHRvIEZpbmlzaD8gSWYgc28gZmlsdGVyIHRoZW0gb3V0LlxuICAgICAgICBpZiAoXG4gICAgICAgICAgZGVzdGluYXRpb25zLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICBkZXN0aW5hdGlvbnMuZmluZCgodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gdmFsdWUuaiA9PT0gRmluaXNoKVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCB0b0JlUmVtb3ZlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoaSwgRmluaXNoKTtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAgICAgICAodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gIXRvQmVSZW1vdmVkLmVxdWFsKHZhbHVlKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBsb29wIG92ZXIgYWxsIHZlcnRpY3MgZnJvbShTdGFydCwgRmluaXNoXSBhbmQgbG9vayBmb3IgdGhlaXIgc291cmNlcy4gSWZcbiAgICAvLyB0aGV5IGhhdmUgbm9uZSB0aGVuIGFkZCBpbiBhbiBlZGdlIGZyb20gU3RhcnQuIElmIHRoZXkgaGF2ZSBtb3JlIHRoYW4gb25lXG4gICAgLy8gdGhlbiByZW1vdmUgYW55IGxpbmtzIGZyb20gU3RhcnQuXG4gICAgZm9yIChsZXQgaSA9IFN0YXJ0ICsgMTsgaSA8IEZpbmlzaDsgaSsrKSB7XG4gICAgICBjb25zdCBkZXN0aW5hdGlvbnMgPSBzcmNBbmREc3QuYnlEc3QuZ2V0KGkpO1xuICAgICAgaWYgKGRlc3RpbmF0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHRvQmVBZGRlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIGkpO1xuICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2godG9CZUFkZGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFyZSB0aGVyZSBhbnkgdW4tbmVlZGVkIEVnZGVzIGZyb20gU3RhcnQ/IElmIHNvIGZpbHRlciB0aGVtIG91dC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgZGVzdGluYXRpb25zLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmkgPT09IFN0YXJ0KVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCB0b0JlUmVtb3ZlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIGkpO1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgICAgICAgICh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiAhdG9CZVJlbW92ZWQuZXF1YWwodmFsdWUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAocGxhbi5jaGFydC5FZGdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBGaW5pc2gpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFRhc2tOYW1lU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuICBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IodGFza0luZGV4OiBudW1iZXIsIG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLnRhc2tJbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGNvbnN0IG9sZE5hbWUgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5uYW1lO1xuICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkTmFtZSksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKG9sZE5hbWU6IHN0cmluZyk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFRhc2tOYW1lU3ViT3AodGhpcy50YXNrSW5kZXgsIG9sZE5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbnNlcnROZXdFbXB0eU1pbGVzdG9uZUFmdGVyT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgQWRkVGFza0FmdGVyU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKDAsIHRhc2tJbmRleCArIDEpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AodGFza0luZGV4ICsgMSwgLTEpLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRUYXNrTmFtZU9wKHRhc2tJbmRleDogbnVtYmVyLCBuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRUYXNrTmFtZVN1Yk9wKHRhc2tJbmRleCwgbmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNwbGl0VGFza09wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICBjb25zdCBzdWJPcHM6IFN1Yk9wW10gPSBbXG4gICAgbmV3IER1cFRhc2tTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcCh0YXNrSW5kZXgsIHRhc2tJbmRleCArIDEpLFxuICBdO1xuXG4gIHJldHVybiBuZXcgT3Aoc3ViT3BzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIER1cFRhc2tPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgY29uc3Qgc3ViT3BzOiBTdWJPcFtdID0gW1xuICAgIG5ldyBEdXBUYXNrU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQ29weUFsbEVkZ2VzRnJvbVRvU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgXTtcblxuICByZXR1cm4gbmV3IE9wKHN1Yk9wcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVUYXNrT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgRGVsZXRlVGFza1N1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZEVkZ2VPcChmcm9tVGFza0luZGV4OiBudW1iZXIsIHRvVGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKGZyb21UYXNrSW5kZXgsIHRvVGFza0luZGV4KSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmF0aW9uYWxpemVFZGdlc09wKCk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW1vdmVFZGdlT3AoaTogbnVtYmVyLCBqOiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgUmVtb3ZlRWRnZVN1cE9wKGksIGopLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IEFkZFRhc2tBZnRlclN1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AoXCJEdXJhdGlvblwiLCAxMCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCgwLCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKHRhc2tJbmRleCArIDEsIC0xKSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuIiwgImltcG9ydCB7IEFkZERlcGVuZGVuY3lEaWFsb2cgfSBmcm9tIFwiLi4vLi4vYWRkLWRlcGVuZGVuY3ktZGlhbG9nL2FkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiO1xuaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IEFkZEVkZ2VPcCB9IGZyb20gXCIuLi8uLi9vcHMvY2hhcnRcIjtcbmltcG9ydCB7IGVycm9yLCBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Gcm9tT3AsIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRQcmVkZWNlc3NvckFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPVxuICAgIFwiUHJvbXB0cyBmb3IgYW5kIGFkZHMgYSBwcmVkZWNlc3NvciB0byB0aGUgY3VycmVudCBUYXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgVGFzayBtdXN0IGJlIHNlbGVjdGVkLlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHByZWRUYXNrSW5kZXggPSBhd2FpdCBleHBsYW5NYWluXG4gICAgICAucXVlcnlTZWxlY3RvcjxBZGREZXBlbmRlbmN5RGlhbG9nPihcImFkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiKSFcbiAgICAgIC5zZWxlY3REZXBlbmRlbmN5KGV4cGxhbk1haW4ucGxhbi5jaGFydCwgZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2ssIFwicHJlZFwiKTtcbiAgICBpZiAocHJlZFRhc2tJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiTm8gcHJlZGVjZXNzb3Igd2FzIHNlbGVjdGVkLlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IEFkZEVkZ2VPcChwcmVkVGFza0luZGV4LCBleHBsYW5NYWluLnNlbGVjdGVkVGFzaykuYXBwbHlUbyhcbiAgICAgIGV4cGxhbk1haW4ucGxhblxuICAgICk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AoXG4gICAgICAgIHJldC52YWx1ZS5pbnZlcnNlLFxuICAgICAgICAodGhpcy5wb3N0QWN0aW9uV29yayA9IHRoaXMucG9zdEFjdGlvbldvcmspLFxuICAgICAgICB0cnVlXG4gICAgICApXG4gICAgKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFkZERlcGVuZGVuY3lEaWFsb2cgfSBmcm9tIFwiLi4vLi4vYWRkLWRlcGVuZGVuY3ktZGlhbG9nL2FkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiO1xuaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IEFkZEVkZ2VPcCB9IGZyb20gXCIuLi8uLi9vcHMvY2hhcnRcIjtcbmltcG9ydCB7IGVycm9yLCBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Gcm9tT3AsIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRTdWNjZXNzb3JBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJQcm9tcHRzIGZvciBhbmQgYWRkcyBhIHN1Y2Nlc3NvciB0byB0aGUgY3VycmVudCBUYXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgVGFzayBtdXN0IGJlIHNlbGVjdGVkLlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHN1Y2NUYXNrSW5kZXggPSBhd2FpdCBleHBsYW5NYWluXG4gICAgICAucXVlcnlTZWxlY3RvcjxBZGREZXBlbmRlbmN5RGlhbG9nPihcImFkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiKSFcbiAgICAgIC5zZWxlY3REZXBlbmRlbmN5KGV4cGxhbk1haW4ucGxhbi5jaGFydCwgZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2ssIFwic3VjY1wiKTtcbiAgICBpZiAoc3VjY1Rhc2tJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiTm8gc3VjY2Vzc29yIHdhcyBzZWxlY3RlZC5cIikpO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBBZGRFZGdlT3AoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2ssIHN1Y2NUYXNrSW5kZXgpLmFwcGx5VG8oXG4gICAgICBleHBsYW5NYWluLnBsYW5cbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKFxuICAgICAgICByZXQudmFsdWUuaW52ZXJzZSxcbiAgICAgICAgKHRoaXMucG9zdEFjdGlvbldvcmsgPSB0aGlzLnBvc3RBY3Rpb25Xb3JrKSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IFNlYXJjaFRhc2tQYW5lbCB9IGZyb20gXCIuLi8uLi9zZWFyY2gvc2VhcmNoLXRhc2stcGFuZWxcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIEdvVG9TZWFyY2hBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJNb3ZlcyBmb2N1cyB0byBzZWFyY2ggY29udHJvbC5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oX2V4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yPFNlYXJjaFRhc2tQYW5lbD4oXCJzZWFyY2gtdGFzay1wYW5lbFwiKSFcbiAgICAgIC5zZXRLZXlib2FyZEZvY3VzVG9JbnB1dChcIm5hbWUtb25seVwiKTtcbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdvVG9GdWxsU2VhcmNoQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9XG4gICAgXCJNb3ZlcyBmb2N1cyB0byBzZWFyY2ggY29udHJvbCBhbmQgZG9lcyBhIGZ1bGwgc2VhcmNoIG9mIGFsbCByZXNvdXJjZSB2YWx1ZXMuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGFzeW5jIGRvKF9leHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcjxTZWFyY2hUYXNrUGFuZWw+KFwic2VhcmNoLXRhc2stcGFuZWxcIikhXG4gICAgICAuc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoXCJmdWxsLWluZm9cIik7XG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBIZWxwQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiRGlzcGxheXMgdGhlIGhlbHAgZGlhbG9nLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGV4cGxhbk1haW5cbiAgICAgIC5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImtleWJvYXJkLW1hcC1kaWFsb2dcIikhXG4gICAgICAuc2hvd01vZGFsKCk7XG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBSZXNldFpvb21BY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJVbmRvZXMgdGhlIHpvb20uXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwYWludENoYXJ0XCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGV4cGxhbk1haW4uZGlzcGxheVJhbmdlID0gbnVsbDtcbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHtcbiAgRGVsZXRlVGFza09wLFxuICBEdXBUYXNrT3AsXG4gIEluc2VydE5ld0VtcHR5TWlsZXN0b25lQWZ0ZXJPcCxcbiAgSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCxcbiAgU3BsaXRUYXNrT3AsXG59IGZyb20gXCIuLi8uLi9vcHMvY2hhcnRcIjtcbmltcG9ydCB7IFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi4vLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IGVycm9yLCBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Gcm9tT3AsIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBTcGxpdFRhc2tBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJTcGxpdHMgYSB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgdGFzayBtdXN0IGJlIHNlbGVjdGVkIGZpcnN0LlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IFNwbGl0VGFza09wKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrKS5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXBUYXNrQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiRHVwbGljYXRlcyBhIHRhc2suXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IHRydWU7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBpZiAoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2sgPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiQSB0YXNrIG11c3QgYmUgc2VsZWN0ZWQgZmlyc3QuXCIpKTtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gRHVwVGFza09wKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrKS5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOZXdUYXNrQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiQ3JlYXRlcyBhIG5ldyB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgbGV0IHJldCA9IEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AoMCkuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlVGFza0FjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkRlbGV0ZXMgYSB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgdGFzayBtdXN0IGJlIHNlbGVjdGVkIGZpcnN0LlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IERlbGV0ZVRhc2tPcChleHBsYW5NYWluLnNlbGVjdGVkVGFzaykuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9IC0xO1xuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG4iLCAiY29uc3QgZGFya01vZGVMb2NhbFN0b3JhZ2VLZXkgPSBcImV4cGxhbi1kYXJrbW9kZVwiO1xuXG4vKiogV2hlbiB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBjbGlja2VkLCB0aGVuIHRvZ2dsZSB0aGUgYGRhcmttb2RlYCBjbGFzcyBvbiB0aGVcbiAqIGJvZHkgZWxlbWVudC4gKi9cbmV4cG9ydCBjb25zdCB0b2dnbGVUaGVtZSA9ICgpID0+IHtcbiAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFxuICAgIGRhcmtNb2RlTG9jYWxTdG9yYWdlS2V5LFxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcImRhcmttb2RlXCIpID8gXCIxXCIgOiBcIjBcIlxuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IGFwcGx5U3RvcmVkVGhlbWUgPSAoKSA9PiB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICBcImRhcmttb2RlXCIsXG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKGRhcmtNb2RlTG9jYWxTdG9yYWdlS2V5KSA9PT0gXCIxXCJcbiAgKTtcbn07XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyB0b2dnbGVUaGVtZSB9IGZyb20gXCIuLi8uLi9zdHlsZS90b2dnbGVyL3RvZ2dsZXJcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIFRvZ2dsZURhcmtNb2RlQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiVG9nZ2xlcyBkYXJrIG1vZGUuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwYWludENoYXJ0XCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgdG9nZ2xlVGhlbWUoKTtcbiAgICAvLyBUb2dnbGVEYXJrTW9kZUFjdGlvbiBpcyBpdHMgb3duIGludmVyc2UuXG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBUb2dnbGVGb2N1c0FjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIlRvZ2dsZXMgdGhlIGZvY3VzIHZpZXcuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwYWludENoYXJ0XCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGV4cGxhbk1haW4udG9nZ2xlRm9jdXNPblRhc2soKTtcbiAgICAvLyBUb2dnbGVGb2N1c0FjdGlvbiBpcyBpdHMgb3duIGludmVyc2UuXG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyB0b2dnbGVUaGVtZSB9IGZyb20gXCIuLi8uLi9zdHlsZS90b2dnbGVyL3RvZ2dsZXJcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIFRvZ2dsZVJhZGFyQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiVG9nZ2xlcyB0aGUgcmFkYXIgdmlldy5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBleHBsYW5NYWluLnRvZ2dsZVJhZGFyKCk7XG4gICAgLy8gVG9nZ2xlUmFkYXJBY3Rpb24gaXMgaXRzIG93biBpbnZlcnNlLlxuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBOT09QQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuaW1wb3J0IHsgdW5kbyB9IGZyb20gXCIuLi9leGVjdXRlXCI7XG5cbmV4cG9ydCBjbGFzcyBVbmRvQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiVW5kb2VzIHRoZSBsYXN0IGFjdGlvbi5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBjb25zdCByZXQgPSB1bmRvKGV4cGxhbk1haW4pO1xuXG4gICAgLy8gVW5kbyBpcyBub3QgYSByZXZlcnNpYmxlIGFjdGlvbi5cbiAgICByZXR1cm4gb2sobmV3IE5PT1BBY3Rpb24oKSk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb24udHNcIjtcbmltcG9ydCB7IEFkZFByZWRlY2Vzc29yQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy9hZGRQcmVkZWNlc3Nvci50c1wiO1xuaW1wb3J0IHsgQWRkU3VjY2Vzc29yQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy9hZGRTdWNjZXNzb3IudHNcIjtcbmltcG9ydCB7XG4gIEdvVG9GdWxsU2VhcmNoQWN0aW9uLFxuICBHb1RvU2VhcmNoQWN0aW9uLFxufSBmcm9tIFwiLi9hY3Rpb25zL2dvdG9TZWFyY2gudHNcIjtcbmltcG9ydCB7IEhlbHBBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL2hlbHAudHNcIjtcbmltcG9ydCB7IFJlc2V0Wm9vbUFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvcmVzZXRab29tLnRzXCI7XG5pbXBvcnQge1xuICBEZWxldGVUYXNrQWN0aW9uLFxuICBEdXBUYXNrQWN0aW9uLFxuICBOZXdUYXNrQWN0aW9uLFxuICBTcGxpdFRhc2tBY3Rpb24sXG59IGZyb20gXCIuL2FjdGlvbnMvdGFza3MudHNcIjtcbmltcG9ydCB7IFRvZ2dsZURhcmtNb2RlQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy90b2dnbGVEYXJrTW9kZS50c1wiO1xuaW1wb3J0IHsgVG9nZ2xlRm9jdXNBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3RvZ2dsZUZvY3VzLnRzXCI7XG5pbXBvcnQgeyBUb2dnbGVSYWRhckFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvdG9nZ2xlUmFkYXIudHNcIjtcbmltcG9ydCB7IFVuZG9BY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3VuZG8udHNcIjtcblxuZXhwb3J0IHR5cGUgQWN0aW9uTmFtZXMgPVxuICB8IFwiVG9nZ2xlRGFya01vZGVBY3Rpb25cIlxuICB8IFwiVG9nZ2xlUmFkYXJBY3Rpb25cIlxuICB8IFwiUmVzZXRab29tQWN0aW9uXCJcbiAgfCBcIlVuZG9BY3Rpb25cIlxuICB8IFwiSGVscEFjdGlvblwiXG4gIHwgXCJTcGxpdFRhc2tBY3Rpb25cIlxuICB8IFwiRHVwVGFza0FjdGlvblwiXG4gIHwgXCJOZXdUYXNrQWN0aW9uXCJcbiAgfCBcIkRlbGV0ZVRhc2tBY3Rpb25cIlxuICB8IFwiR29Ub1NlYXJjaEFjdGlvblwiXG4gIHwgXCJHb1RvRnVsbFNlYXJjaEFjdGlvblwiXG4gIHwgXCJBZGRQcmVkZWNlc3NvckFjdGlvblwiXG4gIHwgXCJBZGRTdWNjZXNzb3JBY3Rpb25cIlxuICB8IFwiVG9nZ2xlRm9jdXNBY3Rpb25cIjtcblxuZXhwb3J0IGNvbnN0IEFjdGlvblJlZ2lzdHJ5OiBSZWNvcmQ8QWN0aW9uTmFtZXMsIEFjdGlvbj4gPSB7XG4gIFRvZ2dsZURhcmtNb2RlQWN0aW9uOiBuZXcgVG9nZ2xlRGFya01vZGVBY3Rpb24oKSxcbiAgVG9nZ2xlUmFkYXJBY3Rpb246IG5ldyBUb2dnbGVSYWRhckFjdGlvbigpLFxuICBSZXNldFpvb21BY3Rpb246IG5ldyBSZXNldFpvb21BY3Rpb24oKSxcbiAgVW5kb0FjdGlvbjogbmV3IFVuZG9BY3Rpb24oKSxcbiAgSGVscEFjdGlvbjogbmV3IEhlbHBBY3Rpb24oKSxcbiAgU3BsaXRUYXNrQWN0aW9uOiBuZXcgU3BsaXRUYXNrQWN0aW9uKCksXG4gIER1cFRhc2tBY3Rpb246IG5ldyBEdXBUYXNrQWN0aW9uKCksXG4gIE5ld1Rhc2tBY3Rpb246IG5ldyBOZXdUYXNrQWN0aW9uKCksXG4gIERlbGV0ZVRhc2tBY3Rpb246IG5ldyBEZWxldGVUYXNrQWN0aW9uKCksXG4gIEdvVG9TZWFyY2hBY3Rpb246IG5ldyBHb1RvU2VhcmNoQWN0aW9uKCksXG4gIEdvVG9GdWxsU2VhcmNoQWN0aW9uOiBuZXcgR29Ub0Z1bGxTZWFyY2hBY3Rpb24oKSxcbiAgQWRkUHJlZGVjZXNzb3JBY3Rpb246IG5ldyBBZGRQcmVkZWNlc3NvckFjdGlvbigpLFxuICBBZGRTdWNjZXNzb3JBY3Rpb246IG5ldyBBZGRTdWNjZXNzb3JBY3Rpb24oKSxcbiAgVG9nZ2xlRm9jdXNBY3Rpb246IG5ldyBUb2dnbGVGb2N1c0FjdGlvbigpLFxufTtcbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpbi50c1wiO1xuaW1wb3J0IHsgT3AgfSBmcm9tIFwiLi4vb3BzL29wcy50c1wiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IEFjdGlvbiwgQWN0aW9uRnJvbU9wLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4vYWN0aW9uLnRzXCI7XG5pbXBvcnQgeyBBY3Rpb25OYW1lcywgQWN0aW9uUmVnaXN0cnkgfSBmcm9tIFwiLi9yZWdpc3RyeS50c1wiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXAge1xuICAgIFwicGxhbi1kZWZpbml0aW9uLWNoYW5nZWRcIjogQ3VzdG9tRXZlbnQ8bnVsbD47XG4gIH1cbn1cblxuY29uc3QgdW5kb1N0YWNrOiBBY3Rpb25bXSA9IFtdO1xuXG5leHBvcnQgY29uc3QgdW5kbyA9IGFzeW5jIChleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8bnVsbD4+ID0+IHtcbiAgY29uc3QgYWN0aW9uID0gdW5kb1N0YWNrLnBvcCgpITtcbiAgaWYgKCFhY3Rpb24pIHtcbiAgICByZXR1cm4gb2sobnVsbCk7XG4gIH1cblxuICByZXR1cm4gYXdhaXQgZXhlY3V0ZVVuZG8oYWN0aW9uLCBleHBsYW5NYWluKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleGVjdXRlID0gYXN5bmMgKFxuICBuYW1lOiBBY3Rpb25OYW1lcyxcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpblxuKTogUHJvbWlzZTxSZXN1bHQ8bnVsbD4+ID0+IHtcbiAgY29uc3QgYWN0aW9uID0gQWN0aW9uUmVnaXN0cnlbbmFtZV07XG4gIGNvbnN0IHJldCA9IGF3YWl0IGFjdGlvbi5kbyhleHBsYW5NYWluKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIHN3aXRjaCAoYWN0aW9uLnBvc3RBY3Rpb25Xb3JrKSB7XG4gICAgY2FzZSBcIlwiOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInBhaW50Q2hhcnRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI6XG4gICAgICBleHBsYW5NYWluLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgLy8gU2VuZCBhbiBldmVudCBpbiBjYXNlIHdlIGhhdmUgYW55IGRpYWxvZ3MgdXAgdGhhdCBuZWVkIHRvIHJlLXJlbmRlciBpZlxuICAgICAgLy8gdGhlIHBsYW4gY2hhbmdlZCwgcG9zc2libGUgc2luY2UgQ3RybC1aIHdvcmtzIGZyb20gYW55d2hlcmUuXG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCIpKTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuICBpZiAoYWN0aW9uLnVuZG8pIHtcbiAgICB1bmRvU3RhY2sucHVzaChyZXQudmFsdWUpO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleGVjdXRlT3AgPSBhc3luYyAoXG4gIG9wOiBPcCxcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmssXG4gIHVuZG86IGJvb2xlYW4sXG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW5cbik6IFByb21pc2U8UmVzdWx0PG51bGw+PiA9PiB7XG4gIGNvbnN0IGFjdGlvbiA9IG5ldyBBY3Rpb25Gcm9tT3Aob3AsIHBvc3RBY3Rpb25Xb3JrLCB1bmRvKTtcbiAgY29uc3QgcmV0ID0gYXdhaXQgYWN0aW9uLmRvKGV4cGxhbk1haW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgc3dpdGNoIChhY3Rpb24ucG9zdEFjdGlvbldvcmspIHtcbiAgICBjYXNlIFwiXCI6XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwYWludENoYXJ0XCI6XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiOlxuICAgICAgZXhwbGFuTWFpbi5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIC8vIFNlbmQgYW4gZXZlbnQgaW4gY2FzZSB3ZSBoYXZlIGFueSBkaWFsb2dzIHVwIHRoYXQgbmVlZCB0byByZS1yZW5kZXIgaWZcbiAgICAgIC8vIHRoZSBwbGFuIGNoYW5nZWQsIHBvc3NpYmxlIHNpbmNlIEN0cmwtWiB3b3JrcyBmcm9tIGFueXdoZXJlLlxuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiKSk7XG5cbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG4gIGlmIChhY3Rpb24udW5kbykge1xuICAgIHVuZG9TdGFjay5wdXNoKHJldC52YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufTtcblxuY29uc3QgZXhlY3V0ZVVuZG8gPSBhc3luYyAoXG4gIGFjdGlvbjogQWN0aW9uLFxuICBleHBsYW5NYWluOiBFeHBsYW5NYWluXG4pOiBQcm9taXNlPFJlc3VsdDxudWxsPj4gPT4ge1xuICBjb25zdCByZXQgPSBhd2FpdCBhY3Rpb24uZG8oZXhwbGFuTWFpbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuICBzd2l0Y2ggKGFjdGlvbi5wb3N0QWN0aW9uV29yaykge1xuICAgIGNhc2UgXCJcIjpcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInBhaW50Q2hhcnRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI6XG4gICAgICBleHBsYW5NYWluLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgLy8gU2VuZCBhbiBldmVudCBpbiBjYXNlIHdlIGhhdmUgYW55IGRpYWxvZ3MgdXAgdGhhdCBuZWVkIHRvIHJlLXJlbmRlciBpZlxuICAgICAgLy8gdGhlIHBsYW4gY2hhbmdlZCwgcG9zc2libGUgc2luY2UgQ3RybC1aIHdvcmtzIGZyb20gYW55d2hlcmUuXG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCIpKTtcblxuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufTtcbiIsICJpbXBvcnQgeyBleGVjdXRlIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlXCI7XG5pbXBvcnQgeyBBY3Rpb25OYW1lcyB9IGZyb20gXCIuLi9hY3Rpb24vcmVnaXN0cnlcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5cbmV4cG9ydCBjb25zdCBLZXlNYXA6IE1hcDxzdHJpbmcsIEFjdGlvbk5hbWVzPiA9IG5ldyBNYXAoW1xuICBbXCJzaGlmdC1jdHJsLVJcIiwgXCJUb2dnbGVSYWRhckFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC1NXCIsIFwiVG9nZ2xlRGFya01vZGVBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtWlwiLCBcIlJlc2V0Wm9vbUFjdGlvblwiXSxcbiAgW1wiY3RybC16XCIsIFwiVW5kb0FjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC1IXCIsIFwiSGVscEFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC18XCIsIFwiU3BsaXRUYXNrQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLV9cIiwgXCJEdXBUYXNrQWN0aW9uXCJdLFxuICBbXCJhbHQtSW5zZXJ0XCIsIFwiTmV3VGFza0FjdGlvblwiXSxcbiAgW1wiYWx0LURlbGV0ZVwiLCBcIkRlbGV0ZVRhc2tBY3Rpb25cIl0sXG4gIFtcImN0cmwtZlwiLCBcIkdvVG9TZWFyY2hBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtRlwiLCBcIkdvVG9GdWxsU2VhcmNoQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLTxcIiwgXCJBZGRQcmVkZWNlc3NvckFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC0+XCIsIFwiQWRkU3VjY2Vzc29yQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLTpcIiwgXCJUb2dnbGVGb2N1c0FjdGlvblwiXSxcbl0pO1xuXG5sZXQgZXhwbGFuTWFpbjogRXhwbGFuTWFpbjtcblxuZXhwb3J0IGNvbnN0IFN0YXJ0S2V5Ym9hcmRIYW5kbGluZyA9IChlbTogRXhwbGFuTWFpbikgPT4ge1xuICBleHBsYW5NYWluID0gZW07XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIG9uS2V5RG93bik7XG59O1xuXG5jb25zdCBvbktleURvd24gPSBhc3luYyAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICBjb25zdCBrZXluYW1lID0gYCR7ZS5zaGlmdEtleSA/IFwic2hpZnQtXCIgOiBcIlwifSR7ZS5jdHJsS2V5ID8gXCJjdHJsLVwiIDogXCJcIn0ke2UubWV0YUtleSA/IFwibWV0YS1cIiA6IFwiXCJ9JHtlLmFsdEtleSA/IFwiYWx0LVwiIDogXCJcIn0ke2Uua2V5fWA7XG4gIGNvbnNvbGUubG9nKGtleW5hbWUpO1xuICBjb25zdCBhY3Rpb25OYW1lID0gS2V5TWFwLmdldChrZXluYW1lKTtcbiAgaWYgKGFjdGlvbk5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGUoYWN0aW9uTmFtZSwgZXhwbGFuTWFpbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgY29uc29sZS5sb2cocmV0LmVycm9yKTtcbiAgfVxufTtcbiIsICJpbXBvcnQgeyBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IEtleU1hcCB9IGZyb20gXCIuLi9rZXltYXAva2V5bWFwLnRzXCI7XG5pbXBvcnQgeyBBY3Rpb25SZWdpc3RyeSB9IGZyb20gXCIuLi9hY3Rpb24vcmVnaXN0cnlcIjtcblxuY2xhc3MgS2V5Ym9hcmRNYXBEaWFsb2cgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIGNvbnN0IGtleW1hcEVudHJpZXMgPSBbLi4uS2V5TWFwLmVudHJpZXMoKV07XG4gICAga2V5bWFwRW50cmllcy5zb3J0KCk7XG4gICAgcmVuZGVyKFxuICAgICAgaHRtbGBcbiAgICAgICAgPGRpYWxvZz5cbiAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICAke2tleW1hcEVudHJpZXMubWFwKFxuICAgICAgICAgICAgICAoW2tleSwgYWN0aW9uTmFtZV0pID0+XG4gICAgICAgICAgICAgICAgaHRtbGA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGQ+JHtrZXl9PC90ZD5cbiAgICAgICAgICAgICAgICAgIDx0ZD4ke0FjdGlvblJlZ2lzdHJ5W2FjdGlvbk5hbWVdLmRlc2NyaXB0aW9ufTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5gXG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgIDwvZGlhbG9nPlxuICAgICAgYCxcbiAgICAgIHRoaXNcbiAgICApO1xuICB9XG5cbiAgc2hvd01vZGFsKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLnNob3dNb2RhbCgpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImtleWJvYXJkLW1hcC1kaWFsb2dcIiwgS2V5Ym9hcmRNYXBEaWFsb2cpO1xuIiwgImV4cG9ydCB0eXBlIFBsYW5TdGF0dXMgPVxuICB8IHsgc3RhZ2U6IFwidW5zdGFydGVkXCI7IHN0YXJ0OiAwIH1cbiAgfCB7XG4gICAgICBzdGFnZTogXCJzdGFydGVkXCI7XG4gICAgICBzdGFydDogbnVtYmVyO1xuICAgIH07XG5cbmV4cG9ydCBjb25zdCBzdGF0dXNUb0RhdGUgPSAoc3RhdHVzOiBQbGFuU3RhdHVzKTogRGF0ZSA9PiB7XG4gIGlmIChzdGF0dXMuc3RhZ2UgPT09IFwidW5zdGFydGVkXCIpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcbiAgfVxuICByZXR1cm4gbmV3IERhdGUoc3RhdHVzLnN0YXJ0KTtcbn07XG5cbmV4cG9ydCBjb25zdCB1bnN0YXJ0ZWQ6IFBsYW5TdGF0dXMgPSB7IHN0YWdlOiBcInVuc3RhcnRlZFwiLCBzdGFydDogMCB9O1xuXG5leHBvcnQgdHlwZSBQbGFuU3RhdHVzU2VyaWFsaXplZCA9IHtcbiAgc3RhZ2U6IHN0cmluZztcbiAgc3RhcnQ6IG51bWJlcjtcbn07XG5cbmV4cG9ydCBjb25zdCB0b0pTT04gPSAocDogUGxhblN0YXR1cyk6IFBsYW5TdGF0dXNTZXJpYWxpemVkID0+IHtcbiAgY29uc3QgcmV0OiBQbGFuU3RhdHVzU2VyaWFsaXplZCA9IHtcbiAgICBzdGFnZTogXCJ1bnN0YXJ0ZWRcIixcbiAgICBzdGFydDogMCxcbiAgfTtcbiAgaWYgKHAuc3RhZ2UgPT09IFwic3RhcnRlZFwiKSB7XG4gICAgcmV0LnN0YWdlID0gXCJzdGFydGVkXCI7XG4gICAgcmV0LnN0YXJ0ID0gcC5zdGFydC52YWx1ZU9mKCk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCBjb25zdCBmcm9tSlNPTiA9IChwOiBQbGFuU3RhdHVzU2VyaWFsaXplZCk6IFBsYW5TdGF0dXMgPT4ge1xuICBjb25zdCB1bnN0YXJ0ZWQ6IFBsYW5TdGF0dXMgPSB7IHN0YWdlOiBcInVuc3RhcnRlZFwiLCBzdGFydDogMCB9O1xuXG4gIGlmIChwLnN0YWdlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdW5zdGFydGVkO1xuICB9XG4gIGlmIChwLnN0YWdlID09PSBcInN0YXJ0ZWRcIikge1xuICAgIGlmIChwLnN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bnN0YXJ0ZWQ7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBzdGFnZTogXCJzdGFydGVkXCIsXG4gICAgICBzdGFydDogcC5zdGFydCxcbiAgICB9O1xuICB9XG4gIHJldHVybiB1bnN0YXJ0ZWQ7XG59O1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IEFkZFJlc291cmNlT3AsIERlbGV0ZVJlc291cmNlT3AgfSBmcm9tIFwiLi4vb3BzL3Jlc291cmNlc1wiO1xuaW1wb3J0IHsgZXhlY3V0ZU9wIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlXCI7XG5pbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgRWRpdFJlc291cmNlRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9lZGl0LXJlc291cmNlLWRlZmluaXRpb24vZWRpdC1yZXNvdXJjZS1kZWZpbml0aW9uXCI7XG5pbXBvcnQgeyBpY29uIH0gZnJvbSBcIi4uL2ljb25zL2ljb25zXCI7XG5pbXBvcnQgeyBQbGFuU3RhdHVzLCB1bnN0YXJ0ZWQgfSBmcm9tIFwiLi4vcGxhbl9zdGF0dXMvcGxhbl9zdGF0dXNcIjtcblxuLy8gTG9uZ2VzdCByZXByZXNlbnRhdGlvbiB3ZSdsbCBzaG93IGZvciBhbGwgdGhlIG9wdGlvbnMgb2YgYSBSZXNvdXJjZS5cbmNvbnN0IE1BWF9TSE9SVF9TVFJJTkcgPSA4MDtcblxuZXhwb3J0IGNsYXNzIEVkaXRQbGFuU3RhcnREaWFsb2cgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIHByaXZhdGUgc3RhdHVzOiBQbGFuU3RhdHVzID0gdW5zdGFydGVkO1xuICBwcml2YXRlIGRpYWxvZzogSFRNTERpYWxvZ0VsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZXNvbHZlOiAodmFsdWU6IFBsYW5TdGF0dXMgfCB1bmRlZmluZWQpID0+IHZvaWQgPSAoKSA9PiB7fTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLmRpYWxvZyA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhO1xuICAgIHRoaXMuZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoXCJjYW5jZWxcIiwgKCkgPT4gdGhpcy5yZXNvbHZlKHVuZGVmaW5lZCkpO1xuICB9XG5cbiAgc3RhcnQoc3RhdHVzOiBQbGFuU3RhdHVzKTogUHJvbWlzZTxQbGFuU3RhdHVzIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgcmV0ID0gbmV3IFByb21pc2U8UGxhblN0YXR1cyB8IHVuZGVmaW5lZD4oKHJlc29sdmUsIF9yZWplY3QpID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICB0aGlzLmRpYWxvZyEuc2hvd01vZGFsKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyKCkge1xuICAgIHJlbmRlcih0aGlzLnRlbXBsYXRlKCksIHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9zZSgpIHtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5jbG9zZSgpO1xuICAgIHRoaXMucmVzb2x2ZSh0aGlzLnN0YXR1cyk7XG4gIH1cblxuICBwcml2YXRlIGNhbmNlbCgpIHtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5jbG9zZSgpO1xuICAgIHRoaXMucmVzb2x2ZSh1bmRlZmluZWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBkYXRlQ29udHJvbFZhbHVlKCk6IHN0cmluZyB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRoaXMuc3RhdHVzLnN0YXJ0KTtcbiAgICByZXR1cm4gYCR7ZC5nZXRGdWxsWWVhcigpfS0ke2QuZ2V0TW9udGgoKX0tJHtkLmdldERheSgpfWA7XG4gIH1cblxuICBwcml2YXRlIHN0YXJ0Q2hhbmdlZChlOiBJbnB1dEV2ZW50KSB7XG4gICAgaWYgKChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5jaGVja2VkKSB7XG4gICAgICB0aGlzLnN0YXR1cy5zdGFnZSA9IFwic3RhcnRlZFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXR1cy5zdGFnZSA9IFwidW5zdGFydGVkXCI7XG4gICAgfVxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBwcml2YXRlIGRhdGVDaGFuZ2VkKGU6IElucHV0RXZlbnQpIHtcbiAgICBjb25zdCBkYXRlID0gKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlQXNEYXRlO1xuICAgIGlmIChkYXRlID09PSBudWxsKSB7XG4gICAgICB0aGlzLnN0YXR1cy5zdGFydCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGUuc2V0SG91cnMoZGF0ZS5nZXRIb3VycygpICsgMTIpO1xuICAgICAgdGhpcy5zdGF0dXMuc3RhcnQgPSBkYXRlLmdldFRpbWUoKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIHJldHVybiBodG1sYFxuICAgICAgPGRpYWxvZz5cbiAgICAgICAgPGgzPlBsYW4gU3RhdHVzPC9oMz5cbiAgICAgICAgPHNwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgLmNoZWNrZWQ9JHt0aGlzLnN0YXR1cy5zdGFnZSA9PT0gXCJzdGFydGVkXCJ9XG4gICAgICAgICAgICBAaW5wdXQ9JHsoZTogSW5wdXRFdmVudCkgPT4gdGhpcy5zdGFydENoYW5nZWQoZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICBTdGFydGVkXG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIiR7dGhpcy5zdGF0dXMuc3RhZ2UgPT09IFwic3RhcnRlZFwiID8gXCJcIiA6IFwiaGlkZGVuXCJ9XCI+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwiZGF0ZVwiXG4gICAgICAgICAgICB2YWx1ZT0ke3RoaXMuZGF0ZUNvbnRyb2xWYWx1ZSgpfVxuICAgICAgICAgICAgQGlucHV0PSR7KGU6IElucHV0RXZlbnQpID0+IHRoaXMuZGF0ZUNoYW5nZWQoZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJkaWFsb2ctZm9vdGVyXCI+XG4gICAgICAgICAgPGJ1dHRvbiBAY2xpY2s9JHsoKSA9PiB0aGlzLmNsb3NlKCl9PkNhbmNlbDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gQGNsaWNrPSR7KCkgPT4gdGhpcy5jbG9zZSgpfT5PSzwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGlhbG9nPlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwiZWRpdC1wbGFuLXN0YXJ0XCIsIEVkaXRQbGFuU3RhcnREaWFsb2cpO1xuIiwgIi8vIEVhY2ggUmVzb3Vyc2UgaGFzIGEga2V5LCB3aGljaCBpcyB0aGUgbmFtZSwgYW5kIGEgbGlzdCBvZiBhY2NlcHRhYmxlIHZhbHVlcy5cbi8vIFRoZSBsaXN0IG9mIHZhbHVlcyBjYW4gbmV2ZXIgYmUgZW1wdHksIGFuZCB0aGUgZmlyc3QgdmFsdWUgaW4gYHZhbHVlc2AgaXMgdGhlXG4vLyBkZWZhdWx0IHZhbHVlIGZvciBhIFJlc291cmNlLlxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9SRVNPVVJDRV9WQUxVRSA9IFwiXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZCB7XG4gIHZhbHVlczogc3RyaW5nW107XG4gIHN0YXRpYzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFJlc291cmNlRGVmaW5pdGlvbiB7XG4gIHZhbHVlczogc3RyaW5nW107XG5cbiAgLy8gVHJ1ZSBpZiB0aGUgUmVzb3VyY2UgaXMgYnVpbHQgaW4gYW5kIGNhbid0IGJlIGVkaXRlZCBvciBkZWxldGVkLlxuICBpc1N0YXRpYzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICB2YWx1ZXM6IHN0cmluZ1tdID0gW0RFRkFVTFRfUkVTT1VSQ0VfVkFMVUVdLFxuICAgIGlzU3RhdGljOiBib29sZWFuID0gZmFsc2VcbiAgKSB7XG4gICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgdGhpcy5pc1N0YXRpYyA9IGlzU3RhdGljO1xuICB9XG5cbiAgdG9KU09OKCk6IFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZXM6IHRoaXMudmFsdWVzLFxuICAgICAgc3RhdGljOiB0aGlzLmlzU3RhdGljLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZnJvbUpTT04oczogUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZCk6IFJlc291cmNlRGVmaW5pdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBSZXNvdXJjZURlZmluaXRpb24ocy52YWx1ZXMsIHMuc3RhdGljKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBSZXNvdXJjZURlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb24gfTtcbmV4cG9ydCB0eXBlIFJlc291cmNlRGVmaW5pdGlvbnNTZXJpYWxpemVkID0ge1xuICBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkO1xufTtcbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCB9IGZyb20gXCJsaXQtaHRtbFwiO1xuXG4vLyBMb29rIG9uIHRoZSBtYWluIGluZGV4IHBhZ2UgZm9yIGFsbCB0aGUgYWxsb3dlZCBuYW1lcy5cbi8vXG4vLyBJbnN0YW50aWF0ZXMgYW4gU1ZHIGljb24gdmlhIHRoZSA8dXNlPiB0YWcuXG5leHBvcnQgY29uc3QgaWNvbiA9IChuYW1lOiBzdHJpbmcpOiBUZW1wbGF0ZVJlc3VsdCA9PiB7XG4gIHJldHVybiBodG1sYFxuICA8c3ZnXG4gICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG4gICAgd2lkdGg9XCIyNFwiXG4gICAgaGVpZ2h0PVwiMjRcIlxuICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICA+XG4gICAgPHVzZSBocmVmPSMke25hbWV9PlxuICA8L3N2Zz5gO1xufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQge1xuICBPcCxcbiAgU3ViT3AsXG4gIFN1Yk9wUmVzdWx0LFxuICBhcHBseUFsbE9wc1RvUGxhbkFuZFRoZW5JbnZlcnNlLFxufSBmcm9tIFwiLi9vcHMudHNcIjtcbmltcG9ydCB7XG4gIERFRkFVTFRfUkVTT1VSQ0VfVkFMVUUsXG4gIFJlc291cmNlRGVmaW5pdGlvbixcbn0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcblxuZXhwb3J0IGNsYXNzIEFkZFJlc291cmNlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuXG4gIGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlOiBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlOiBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSB8IG51bGwgPSBudWxsXG4gICkge1xuICAgIHRoaXMua2V5ID0gbmFtZTtcbiAgICB0aGlzLmRlbGV0ZVJlc291cmNlVW5kb1N0YXRlID0gZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBmb3VuZE1hdGNoID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChmb3VuZE1hdGNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gYWxyZWFkeSBleGlzdHMgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0UmVzb3VyY2VEZWZpbml0aW9uKFxuICAgICAgdGhpcy5rZXksXG4gICAgICAodGhpcy5kZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSAmJlxuICAgICAgICB0aGlzLmRlbGV0ZVJlc291cmNlVW5kb1N0YXRlLnJlc291cmNlRGVmaW5pdGlvbikgfHxcbiAgICAgICAgbmV3IFJlc291cmNlRGVmaW5pdGlvbigpXG4gICAgKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgYWRkIHRoaXMga2V5IGFuZCBzZXQgaXQgdG8gdGhlIGRlZmF1bHQsIHVubGVzc1xuICAgIC8vIHRoZXJlIGlzIG1hdGNoaW5nIGVudHJ5IGluIHRhc2tSZXNvdXJjZVZhbHVlcywgaW4gd2hpY2ggY2FzZSB3ZSB3aWxsIHVzZSB0aGF0IHZhbHVlLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgdGFzay5zZXRSZXNvdXJjZShcbiAgICAgICAgdGhpcy5rZXksXG4gICAgICAgICh0aGlzLmRlbGV0ZVJlc291cmNlVW5kb1N0YXRlICYmXG4gICAgICAgICAgdGhpcy5kZWxldGVSZXNvdXJjZVVuZG9TdGF0ZS50YXNrSW5kZXhUb0RlbGV0ZWRSZXNvdXJjZVZhbHVlLmdldChcbiAgICAgICAgICAgIGluZGV4XG4gICAgICAgICAgKSkgfHxcbiAgICAgICAgICBERUZBVUxUX1JFU09VUkNFX1ZBTFVFXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVJlc291cmNlU3VwT3AodGhpcy5rZXkpO1xuICB9XG59XG5cbmludGVyZmFjZSBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSB7XG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uO1xuICB0YXNrSW5kZXhUb0RlbGV0ZWRSZXNvdXJjZVZhbHVlOiBNYXA8bnVtYmVyLCBzdHJpbmc+O1xufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlUmVzb3VyY2VTdXBPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5rZXkgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmVzb3VyY2VEZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChyZXNvdXJjZURlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgVGhlIHJlc291cmNlIHdpdGggbmFtZSAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhbmQgY2FuJ3QgYmUgZGVsZXRlZC5gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBmcm9tIHJlc291cmNlIGRlZmluaXRpb25zLlxuICAgIHBsYW4uZGVsZXRlUmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcblxuICAgIGNvbnN0IHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWU6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHJlbW92ZSBgdGhpcy5rZXlgIGZyb20gdGhlIHJlc291cmNlcyB3aGlsZSBhbHNvXG4gICAgLy8gYnVpbGRpbmcgdXAgdGhlIGluZm8gbmVlZGVkIGZvciBhIHJldmVydC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRTtcbiAgICAgIHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWUuc2V0KGluZGV4LCB2YWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZVJlc291cmNlKHRoaXMua2V5KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlOiBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSA9IHtcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbjogcmVzb3VyY2VEZWZpbml0aW9uLFxuICAgICAgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZTogdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGUpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlOiBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFJlc291cmNlU3ViT3AodGhpcy5rZXksIGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSA9IFtdIC8vIFRoaXMgc2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgd2hlbiBiZWluZyBjb25zdHJ1Y3RlZCBhcyBhIGludmVyc2Ugb3BlcmF0aW9uLlxuICApIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlID0gaW5kaWNlc09mVGFza3NUb0NoYW5nZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGRlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGRlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2Vzbid0IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG4gICAgY29uc3QgZXhpc3RpbmdJbmRleCA9IGRlZmluaXRpb24udmFsdWVzLmZpbmRJbmRleChcbiAgICAgICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSA9PT0gdGhpcy52YWx1ZVxuICAgICk7XG4gICAgaWYgKGV4aXN0aW5nSW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMudmFsdWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgdmFsdWUgaW4gdGhlIFJlc291cmNlICR7dGhpcy5rZXl9LmBcbiAgICAgICk7XG4gICAgfVxuICAgIGRlZmluaXRpb24udmFsdWVzLnB1c2godGhpcy52YWx1ZSk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHNldCB0aGUgdmFsdWUgZm9yIHRoZSBnaXZlbiBrZXkgZm9yIGFsbCB0aGVcbiAgICAvLyB0YXNrcyBsaXN0ZWQgaW4gYGluZGljZXNPZlRhc2tzVG9DaGFuZ2VgLlxuICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZS5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLnZhbHVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3AoXG4gICAgICB0aGlzLmtleSxcbiAgICAgIHRoaXMudmFsdWUsXG4gICAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2VcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSA9IFtdXG4gICkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UgPSBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXNuJ3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZUluZGV4ID0gZGVmaW5pdGlvbi52YWx1ZXMuZmluZEluZGV4KFxuICAgICAgKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlID09PSB0aGlzLnZhbHVlXG4gICAgKTtcbiAgICBpZiAodmFsdWVJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy52YWx1ZX0gZG9lcyBub3QgZXhpc3QgYXMgYSB2YWx1ZSBpbiB0aGUgUmVzb3VyY2UgJHt0aGlzLmtleX0uYFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGRlZmluaXRpb24udmFsdWVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgUmVzb3VyY2VzIG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgdmFsdWUuICR7dGhpcy52YWx1ZX0gb25seSBoYXMgb25lIHZhbHVlLCBzbyBpdCBjYW4ndCBiZSBkZWxldGVkLiBgXG4gICAgICApO1xuICAgIH1cblxuICAgIGRlZmluaXRpb24udmFsdWVzLnNwbGljZSh2YWx1ZUluZGV4LCAxKTtcblxuICAgIC8vIE5vdyBpdGVyYXRlIHRob3VnaCBhbGwgdGhlIHRhc2tzIGFuZCBjaGFuZ2UgYWxsIHRhc2tzIHRoYXQgaGF2ZVxuICAgIC8vIFwia2V5OnZhbHVlXCIgdG8gaW5zdGVhZCBiZSBcImtleTpkZWZhdWx0XCIuIFJlY29yZCB3aGljaCB0YXNrcyBnb3QgY2hhbmdlZFxuICAgIC8vIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGF0IGluZm9ybWF0aW9uIHdoZW4gd2UgY3JlYXRlIHRoZSBpbnZlcnQgb3BlcmF0aW9uLlxuXG4gICAgY29uc3QgaW5kaWNlc09mVGFza3NXaXRoTWF0Y2hpbmdSZXNvdXJjZVZhbHVlczogbnVtYmVyW10gPSBbXTtcblxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgcmVzb3VyY2VWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpO1xuICAgICAgaWYgKHJlc291cmNlVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocmVzb3VyY2VWYWx1ZSAhPT0gdGhpcy52YWx1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFNpbmNlIHRoZSB2YWx1ZSBpcyBubyBsb25nZXIgdmFsaWQgd2UgY2hhbmdlIGl0IGJhY2sgdG8gdGhlIGRlZmF1bHQuXG4gICAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCBkZWZpbml0aW9uLnZhbHVlc1swXSk7XG5cbiAgICAgIC8vIFJlY29yZCB3aGljaCB0YXNrIHdlIGp1c3QgY2hhbmdlZC5cbiAgICAgIGluZGljZXNPZlRhc2tzV2l0aE1hdGNoaW5nUmVzb3VyY2VWYWx1ZXMucHVzaChpbmRleCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShpbmRpY2VzT2ZUYXNrc1dpdGhNYXRjaGluZ1Jlc291cmNlVmFsdWVzKSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW52ZXJzZShpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFJlc291cmNlT3B0aW9uU3ViT3AoXG4gICAgICB0aGlzLmtleSxcbiAgICAgIHRoaXMudmFsdWUsXG4gICAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lUmVzb3VyY2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgb2xkS2V5OiBzdHJpbmc7XG4gIG5ld0tleTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9sZEtleTogc3RyaW5nLCBuZXdLZXk6IHN0cmluZykge1xuICAgIHRoaXMub2xkS2V5ID0gb2xkS2V5O1xuICAgIHRoaXMubmV3S2V5ID0gbmV3S2V5O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3Qgb2xkRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMub2xkS2V5KTtcbiAgICBpZiAob2xkRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5vbGRLZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBuZXdLZXkgaXMgbm90IGFscmVhZHkgdXNlZC5cbiAgICBjb25zdCBuZXdLZXlEZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5uZXdLZXkpO1xuICAgIGlmIChuZXdLZXlEZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld0tleX0gYWxyZWFkeSBleGlzdHMgYXMgYSByZXNvdXJjZSBuYW1lLmApO1xuICAgIH1cblxuICAgIHBsYW4uZGVsZXRlUmVzb3VyY2VEZWZpbml0aW9uKHRoaXMub2xkS2V5KTtcbiAgICBwbGFuLnNldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLm5ld0tleSwgb2xkRGVmaW5pdGlvbik7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGNoYW5nZSBvbGRLZXkgLT4gbmV3a2V5IGZvciB0aGUgZ2l2ZW4gcmVzb3VyY2Uga2V5LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFZhbHVlID1cbiAgICAgICAgdGFzay5nZXRSZXNvdXJjZSh0aGlzLm9sZEtleSkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRTtcbiAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5uZXdLZXksIGN1cnJlbnRWYWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZVJlc291cmNlKHRoaXMub2xkS2V5KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW5hbWVSZXNvdXJjZVN1Yk9wKHRoaXMubmV3S2V5LCB0aGlzLm9sZEtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmFtZVJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICBvbGRWYWx1ZTogc3RyaW5nO1xuICBuZXdWYWx1ZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGtleTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nLCBuZXdWYWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy5vbGRWYWx1ZSA9IG9sZFZhbHVlO1xuICAgIHRoaXMubmV3VmFsdWUgPSBuZXdWYWx1ZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlybSB0aGUgb2xkVmFsdWUgaXMgaW4gdGhlcmUuXG4gICAgY29uc3Qgb2xkVmFsdWVJbmRleCA9IGZvdW5kTWF0Y2gudmFsdWVzLmluZGV4T2YodGhpcy5vbGRWYWx1ZSk7XG5cbiAgICBpZiAob2xkVmFsdWVJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgYSB2YWx1ZSAke3RoaXMub2xkVmFsdWV9YCk7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlybSB0aGUgbmV3VmFsdWUgaXMgbm90IGluIHRoZXJlLlxuICAgIGNvbnN0IG5ld1ZhbHVlSW5kZXggPSBmb3VuZE1hdGNoLnZhbHVlcy5pbmRleE9mKHRoaXMubmV3VmFsdWUpO1xuICAgIGlmIChuZXdWYWx1ZUluZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBhbHJlYWR5IGhhcyBhIHZhbHVlICR7dGhpcy5uZXdWYWx1ZX1gKTtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHRoZSB2YWx1ZXMuXG4gICAgZm91bmRNYXRjaC52YWx1ZXMuc3BsaWNlKG9sZFZhbHVlSW5kZXgsIDEsIHRoaXMubmV3VmFsdWUpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBjaGFuZ2Ugb2xkVmFsdWUgLT4gbmV3VmFsdWUgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KTtcbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHRoaXMub2xkVmFsdWUpIHtcbiAgICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLmtleSwgdGhpcy5uZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy5uZXdWYWx1ZSxcbiAgICAgIHRoaXMub2xkVmFsdWVcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNb3ZlUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIG9sZEluZGV4OiBudW1iZXI7XG4gIG5ld0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBudW1iZXIsIG5ld1ZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLm9sZEluZGV4ID0gb2xkVmFsdWU7XG4gICAgdGhpcy5uZXdJbmRleCA9IG5ld1ZhbHVlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5uZXdJbmRleCA8IDApIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld0luZGV4fSBpcyBub3QgYSB2YWxpZCB0YXJnZXQgdmFsdWUuYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub2xkSW5kZXggPiBkZWZpbml0aW9uLnZhbHVlcy5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMua2V5fSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUgYXQgaW5kZXggJHt0aGlzLm9sZEluZGV4fWBcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh0aGlzLm5ld0luZGV4ID4gZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIGF0IGluZGV4ICR7dGhpcy5uZXdJbmRleH1gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFN3YXAgdGhlIHZhbHVlcy5cbiAgICBjb25zdCB0bXAgPSBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm9sZEluZGV4XTtcbiAgICBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm9sZEluZGV4XSA9IGRlZmluaXRpb24udmFsdWVzW3RoaXMubmV3SW5kZXhdO1xuICAgIGRlZmluaXRpb24udmFsdWVzW3RoaXMubmV3SW5kZXhdID0gdG1wO1xuXG4gICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyB3aXRoIFRhc2tzIGJlY2F1c2UgdGhlIGluZGV4IG9mIGEgdmFsdWUgaXNcbiAgICAvLyBpcnJlbGV2YW50IHNpbmNlIHdlIHN0b3JlIHRoZSB2YWx1ZSBpdHNlbGYsIG5vdCB0aGUgaW5kZXguXG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgTW92ZVJlc291cmNlT3B0aW9uU3ViT3AodGhpcy5rZXksIHRoaXMubmV3SW5kZXgsIHRoaXMub2xkSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRSZXNvdXJjZVZhbHVlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZywgdGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBmb3VuZE1hdGNoID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChmb3VuZE1hdGNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIGNvbnN0IGZvdW5kVmFsdWVNYXRjaCA9IGZvdW5kTWF0Y2gudmFsdWVzLmZpbmRJbmRleCgodjogc3RyaW5nKSA9PiB7XG4gICAgICByZXR1cm4gdiA9PT0gdGhpcy52YWx1ZTtcbiAgICB9KTtcbiAgICBpZiAoZm91bmRWYWx1ZU1hdGNoID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUgb2YgJHt0aGlzLnZhbHVlfWApO1xuICAgIH1cbiAgICBpZiAodGhpcy50YXNrSW5kZXggPCAwIHx8IHRoaXMudGFza0luZGV4ID49IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFRoZXJlIGlzIG5vIFRhc2sgYXQgaW5kZXggJHt0aGlzLnRhc2tJbmRleH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YXNrID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF07XG4gICAgY29uc3Qgb2xkVmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KSE7XG4gICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLmtleSwgdGhpcy52YWx1ZSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkVmFsdWUpIH0pO1xuICB9XG5cbiAgaW52ZXJzZShvbGRWYWx1ZTogc3RyaW5nKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wKHRoaXMua2V5LCBvbGRWYWx1ZSwgdGhpcy50YXNrSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRSZXNvdXJjZU9wKG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZFJlc291cmNlU3ViT3AobmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZVJlc291cmNlT3AobmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgRGVsZXRlUmVzb3VyY2VTdXBPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkUmVzb3VyY2VPcHRpb25PcChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZFJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCB2YWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZVJlc291cmNlT3B0aW9uT3Aoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgdmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5hbWVSZXNvdXJjZU9wdGlvbk9wKFxuICBrZXk6IHN0cmluZyxcbiAgb2xkVmFsdWU6IHN0cmluZyxcbiAgbmV3VmFsdWU6IHN0cmluZ1xuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmFtZVJlc291cmNlT3Aob2xkVmFsdWU6IHN0cmluZywgbmV3VmFsdWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJlbmFtZVJlc291cmNlU3ViT3Aob2xkVmFsdWUsIG5ld1ZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTW92ZVJlc291cmNlT3B0aW9uT3AoXG4gIGtleTogc3RyaW5nLFxuICBvbGRJbmRleDogbnVtYmVyLFxuICBuZXdJbmRleDogbnVtYmVyXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBNb3ZlUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIG9sZEluZGV4LCBuZXdJbmRleCldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldFJlc291cmNlVmFsdWVPcChcbiAga2V5OiBzdHJpbmcsXG4gIHZhbHVlOiBzdHJpbmcsXG4gIHRhc2tJbmRleDogbnVtYmVyXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRSZXNvdXJjZVZhbHVlU3ViT3Aoa2V5LCB2YWx1ZSwgdGFza0luZGV4KV0pO1xufVxuIiwgIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDE3IEdvb2dsZSBMTENcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBCU0QtMy1DbGF1c2VcbiAqL1xuXG5pbXBvcnQge0Rpc2Nvbm5lY3RhYmxlLCBQYXJ0fSBmcm9tICcuL2xpdC1odG1sLmpzJztcblxuZXhwb3J0IHtcbiAgQXR0cmlidXRlUGFydCxcbiAgQm9vbGVhbkF0dHJpYnV0ZVBhcnQsXG4gIENoaWxkUGFydCxcbiAgRWxlbWVudFBhcnQsXG4gIEV2ZW50UGFydCxcbiAgUGFydCxcbiAgUHJvcGVydHlQYXJ0LFxufSBmcm9tICcuL2xpdC1odG1sLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVDbGFzcyB7XG4gIG5ldyAocGFydDogUGFydEluZm8pOiBEaXJlY3RpdmU7XG59XG5cbi8qKlxuICogVGhpcyB1dGlsaXR5IHR5cGUgZXh0cmFjdHMgdGhlIHNpZ25hdHVyZSBvZiBhIGRpcmVjdGl2ZSBjbGFzcydzIHJlbmRlcigpXG4gKiBtZXRob2Qgc28gd2UgY2FuIHVzZSBpdCBmb3IgdGhlIHR5cGUgb2YgdGhlIGdlbmVyYXRlZCBkaXJlY3RpdmUgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCB0eXBlIERpcmVjdGl2ZVBhcmFtZXRlcnM8QyBleHRlbmRzIERpcmVjdGl2ZT4gPSBQYXJhbWV0ZXJzPENbJ3JlbmRlciddPjtcblxuLyoqXG4gKiBBIGdlbmVyYXRlZCBkaXJlY3RpdmUgZnVuY3Rpb24gZG9lc24ndCBldmFsdWF0ZSB0aGUgZGlyZWN0aXZlLCBidXQganVzdFxuICogcmV0dXJucyBhIERpcmVjdGl2ZVJlc3VsdCBvYmplY3QgdGhhdCBjYXB0dXJlcyB0aGUgYXJndW1lbnRzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGl2ZVJlc3VsdDxDIGV4dGVuZHMgRGlyZWN0aXZlQ2xhc3MgPSBEaXJlY3RpdmVDbGFzcz4ge1xuICAvKipcbiAgICogVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBbJ18kbGl0RGlyZWN0aXZlJCddOiBDO1xuICAvKiogQGludGVybmFsICovXG4gIHZhbHVlczogRGlyZWN0aXZlUGFyYW1ldGVyczxJbnN0YW5jZVR5cGU8Qz4+O1xufVxuXG5leHBvcnQgY29uc3QgUGFydFR5cGUgPSB7XG4gIEFUVFJJQlVURTogMSxcbiAgQ0hJTEQ6IDIsXG4gIFBST1BFUlRZOiAzLFxuICBCT09MRUFOX0FUVFJJQlVURTogNCxcbiAgRVZFTlQ6IDUsXG4gIEVMRU1FTlQ6IDYsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBQYXJ0VHlwZSA9ICh0eXBlb2YgUGFydFR5cGUpW2tleW9mIHR5cGVvZiBQYXJ0VHlwZV07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hpbGRQYXJ0SW5mbyB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBQYXJ0VHlwZS5DSElMRDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBdHRyaWJ1dGVQYXJ0SW5mbyB7XG4gIHJlYWRvbmx5IHR5cGU6XG4gICAgfCB0eXBlb2YgUGFydFR5cGUuQVRUUklCVVRFXG4gICAgfCB0eXBlb2YgUGFydFR5cGUuUFJPUEVSVFlcbiAgICB8IHR5cGVvZiBQYXJ0VHlwZS5CT09MRUFOX0FUVFJJQlVURVxuICAgIHwgdHlwZW9mIFBhcnRUeXBlLkVWRU5UO1xuICByZWFkb25seSBzdHJpbmdzPzogUmVhZG9ubHlBcnJheTxzdHJpbmc+O1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IHRhZ05hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbGVtZW50UGFydEluZm8ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgUGFydFR5cGUuRUxFTUVOVDtcbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgcGFydCBhIGRpcmVjdGl2ZSBpcyBib3VuZCB0by5cbiAqXG4gKiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2hlY2tpbmcgdGhhdCBhIGRpcmVjdGl2ZSBpcyBhdHRhY2hlZCB0byBhIHZhbGlkIHBhcnQsXG4gKiBzdWNoIGFzIHdpdGggZGlyZWN0aXZlIHRoYXQgY2FuIG9ubHkgYmUgdXNlZCBvbiBhdHRyaWJ1dGUgYmluZGluZ3MuXG4gKi9cbmV4cG9ydCB0eXBlIFBhcnRJbmZvID0gQ2hpbGRQYXJ0SW5mbyB8IEF0dHJpYnV0ZVBhcnRJbmZvIHwgRWxlbWVudFBhcnRJbmZvO1xuXG4vKipcbiAqIENyZWF0ZXMgYSB1c2VyLWZhY2luZyBkaXJlY3RpdmUgZnVuY3Rpb24gZnJvbSBhIERpcmVjdGl2ZSBjbGFzcy4gVGhpc1xuICogZnVuY3Rpb24gaGFzIHRoZSBzYW1lIHBhcmFtZXRlcnMgYXMgdGhlIGRpcmVjdGl2ZSdzIHJlbmRlcigpIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGRpcmVjdGl2ZSA9XG4gIDxDIGV4dGVuZHMgRGlyZWN0aXZlQ2xhc3M+KGM6IEMpID0+XG4gICguLi52YWx1ZXM6IERpcmVjdGl2ZVBhcmFtZXRlcnM8SW5zdGFuY2VUeXBlPEM+Pik6IERpcmVjdGl2ZVJlc3VsdDxDPiA9PiAoe1xuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgWydfJGxpdERpcmVjdGl2ZSQnXTogYyxcbiAgICB2YWx1ZXMsXG4gIH0pO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGNyZWF0aW5nIGN1c3RvbSBkaXJlY3RpdmVzLiBVc2VycyBzaG91bGQgZXh0ZW5kIHRoaXMgY2xhc3MsXG4gKiBpbXBsZW1lbnQgYHJlbmRlcmAgYW5kL29yIGB1cGRhdGVgLCBhbmQgdGhlbiBwYXNzIHRoZWlyIHN1YmNsYXNzIHRvXG4gKiBgZGlyZWN0aXZlYC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERpcmVjdGl2ZSBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgLy9AaW50ZXJuYWxcbiAgX19wYXJ0ITogUGFydDtcbiAgLy9AaW50ZXJuYWxcbiAgX19hdHRyaWJ1dGVJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAvL0BpbnRlcm5hbFxuICBfX2RpcmVjdGl2ZT86IERpcmVjdGl2ZTtcblxuICAvL0BpbnRlcm5hbFxuICBfJHBhcmVudCE6IERpc2Nvbm5lY3RhYmxlO1xuXG4gIC8vIFRoZXNlIHdpbGwgb25seSBleGlzdCBvbiB0aGUgQXN5bmNEaXJlY3RpdmUgc3ViY2xhc3NcbiAgLy9AaW50ZXJuYWxcbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPjtcbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgLy9AaW50ZXJuYWxcbiAgWydfJG5vdGlmeURpcmVjdGl2ZUNvbm5lY3Rpb25DaGFuZ2VkJ10/KGlzQ29ubmVjdGVkOiBib29sZWFuKTogdm9pZDtcblxuICBjb25zdHJ1Y3RvcihfcGFydEluZm86IFBhcnRJbmZvKSB7fVxuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQuXyRpc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRpbml0aWFsaXplKFxuICAgIHBhcnQ6IFBhcnQsXG4gICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSxcbiAgICBhdHRyaWJ1dGVJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHRoaXMuX19wYXJ0ID0gcGFydDtcbiAgICB0aGlzLl8kcGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMuX19hdHRyaWJ1dGVJbmRleCA9IGF0dHJpYnV0ZUluZGV4O1xuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRyZXNvbHZlKHBhcnQ6IFBhcnQsIHByb3BzOiBBcnJheTx1bmtub3duPik6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZShwYXJ0LCBwcm9wcyk7XG4gIH1cblxuICBhYnN0cmFjdCByZW5kZXIoLi4ucHJvcHM6IEFycmF5PHVua25vd24+KTogdW5rbm93bjtcblxuICB1cGRhdGUoX3BhcnQ6IFBhcnQsIHByb3BzOiBBcnJheTx1bmtub3duPik6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLnJlbmRlciguLi5wcm9wcyk7XG4gIH1cbn1cbiIsICIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAyMCBHb29nbGUgTExDXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQlNELTMtQ2xhdXNlXG4gKi9cblxuaW1wb3J0IHtcbiAgXyRMSCxcbiAgUGFydCxcbiAgRGlyZWN0aXZlUGFyZW50LFxuICBDb21waWxlZFRlbXBsYXRlUmVzdWx0LFxuICBNYXliZUNvbXBpbGVkVGVtcGxhdGVSZXN1bHQsXG4gIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCxcbn0gZnJvbSAnLi9saXQtaHRtbC5qcyc7XG5pbXBvcnQge1xuICBEaXJlY3RpdmVSZXN1bHQsXG4gIERpcmVjdGl2ZUNsYXNzLFxuICBQYXJ0SW5mbyxcbiAgQXR0cmlidXRlUGFydEluZm8sXG59IGZyb20gJy4vZGlyZWN0aXZlLmpzJztcbnR5cGUgUHJpbWl0aXZlID0gbnVsbCB8IHVuZGVmaW5lZCB8IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmcgfCBzeW1ib2wgfCBiaWdpbnQ7XG5cbmNvbnN0IHtfQ2hpbGRQYXJ0OiBDaGlsZFBhcnR9ID0gXyRMSDtcblxudHlwZSBDaGlsZFBhcnQgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIENoaWxkUGFydD47XG5cbmNvbnN0IEVOQUJMRV9TSEFEWURPTV9OT1BBVENIID0gdHJ1ZTtcblxuY29uc3Qgd3JhcCA9XG4gIEVOQUJMRV9TSEFEWURPTV9OT1BBVENIICYmXG4gIHdpbmRvdy5TaGFkeURPTT8uaW5Vc2UgJiZcbiAgd2luZG93LlNoYWR5RE9NPy5ub1BhdGNoID09PSB0cnVlXG4gICAgPyB3aW5kb3cuU2hhZHlET00hLndyYXBcbiAgICA6IChub2RlOiBOb2RlKSA9PiBub2RlO1xuXG4vKipcbiAqIFRlc3RzIGlmIGEgdmFsdWUgaXMgYSBwcmltaXRpdmUgdmFsdWUuXG4gKlxuICogU2VlIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXR5cGVvZi1vcGVyYXRvclxuICovXG5leHBvcnQgY29uc3QgaXNQcmltaXRpdmUgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBQcmltaXRpdmUgPT5cbiAgdmFsdWUgPT09IG51bGwgfHwgKHR5cGVvZiB2YWx1ZSAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUgIT0gJ2Z1bmN0aW9uJyk7XG5cbmV4cG9ydCBjb25zdCBUZW1wbGF0ZVJlc3VsdFR5cGUgPSB7XG4gIEhUTUw6IDEsXG4gIFNWRzogMixcbiAgTUFUSE1MOiAzLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IHR5cGUgVGVtcGxhdGVSZXN1bHRUeXBlID1cbiAgKHR5cGVvZiBUZW1wbGF0ZVJlc3VsdFR5cGUpW2tleW9mIHR5cGVvZiBUZW1wbGF0ZVJlc3VsdFR5cGVdO1xuXG50eXBlIElzVGVtcGxhdGVSZXN1bHQgPSB7XG4gICh2YWw6IHVua25vd24pOiB2YWwgaXMgTWF5YmVDb21waWxlZFRlbXBsYXRlUmVzdWx0O1xuICA8VCBleHRlbmRzIFRlbXBsYXRlUmVzdWx0VHlwZT4oXG4gICAgdmFsOiB1bmtub3duLFxuICAgIHR5cGU6IFRcbiAgKTogdmFsIGlzIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUPjtcbn07XG5cbi8qKlxuICogVGVzdHMgaWYgYSB2YWx1ZSBpcyBhIFRlbXBsYXRlUmVzdWx0IG9yIGEgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzVGVtcGxhdGVSZXN1bHQ6IElzVGVtcGxhdGVSZXN1bHQgPSAoXG4gIHZhbHVlOiB1bmtub3duLFxuICB0eXBlPzogVGVtcGxhdGVSZXN1bHRUeXBlXG4pOiB2YWx1ZSBpcyBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQgPT5cbiAgdHlwZSA9PT0gdW5kZWZpbmVkXG4gICAgPyAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgICAgKHZhbHVlIGFzIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCk/LlsnXyRsaXRUeXBlJCddICE9PSB1bmRlZmluZWRcbiAgICA6ICh2YWx1ZSBhcyBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQpPy5bJ18kbGl0VHlwZSQnXSA9PT0gdHlwZTtcblxuLyoqXG4gKiBUZXN0cyBpZiBhIHZhbHVlIGlzIGEgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdCA9IChcbiAgdmFsdWU6IHVua25vd25cbik6IHZhbHVlIGlzIENvbXBpbGVkVGVtcGxhdGVSZXN1bHQgPT4ge1xuICByZXR1cm4gKHZhbHVlIGFzIENvbXBpbGVkVGVtcGxhdGVSZXN1bHQpPy5bJ18kbGl0VHlwZSQnXT8uaCAhPSBudWxsO1xufTtcblxuLyoqXG4gKiBUZXN0cyBpZiBhIHZhbHVlIGlzIGEgRGlyZWN0aXZlUmVzdWx0LlxuICovXG5leHBvcnQgY29uc3QgaXNEaXJlY3RpdmVSZXN1bHQgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBEaXJlY3RpdmVSZXN1bHQgPT5cbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgKHZhbHVlIGFzIERpcmVjdGl2ZVJlc3VsdCk/LlsnXyRsaXREaXJlY3RpdmUkJ10gIT09IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIERpcmVjdGl2ZSBjbGFzcyBmb3IgYSBEaXJlY3RpdmVSZXN1bHRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldERpcmVjdGl2ZUNsYXNzID0gKHZhbHVlOiB1bmtub3duKTogRGlyZWN0aXZlQ2xhc3MgfCB1bmRlZmluZWQgPT5cbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgKHZhbHVlIGFzIERpcmVjdGl2ZVJlc3VsdCk/LlsnXyRsaXREaXJlY3RpdmUkJ107XG5cbi8qKlxuICogVGVzdHMgd2hldGhlciBhIHBhcnQgaGFzIG9ubHkgYSBzaW5nbGUtZXhwcmVzc2lvbiB3aXRoIG5vIHN0cmluZ3MgdG9cbiAqIGludGVycG9sYXRlIGJldHdlZW4uXG4gKlxuICogT25seSBBdHRyaWJ1dGVQYXJ0IGFuZCBQcm9wZXJ0eVBhcnQgY2FuIGhhdmUgbXVsdGlwbGUgZXhwcmVzc2lvbnMuXG4gKiBNdWx0aS1leHByZXNzaW9uIHBhcnRzIGhhdmUgYSBgc3RyaW5nc2AgcHJvcGVydHkgYW5kIHNpbmdsZS1leHByZXNzaW9uXG4gKiBwYXJ0cyBkbyBub3QuXG4gKi9cbmV4cG9ydCBjb25zdCBpc1NpbmdsZUV4cHJlc3Npb24gPSAocGFydDogUGFydEluZm8pID0+XG4gIChwYXJ0IGFzIEF0dHJpYnV0ZVBhcnRJbmZvKS5zdHJpbmdzID09PSB1bmRlZmluZWQ7XG5cbmNvbnN0IGNyZWF0ZU1hcmtlciA9ICgpID0+IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpO1xuXG4vKipcbiAqIEluc2VydHMgYSBDaGlsZFBhcnQgaW50byB0aGUgZ2l2ZW4gY29udGFpbmVyIENoaWxkUGFydCdzIERPTSwgZWl0aGVyIGF0IHRoZVxuICogZW5kIG9mIHRoZSBjb250YWluZXIgQ2hpbGRQYXJ0LCBvciBiZWZvcmUgdGhlIG9wdGlvbmFsIGByZWZQYXJ0YC5cbiAqXG4gKiBUaGlzIGRvZXMgbm90IGFkZCB0aGUgcGFydCB0byB0aGUgY29udGFpbmVyUGFydCdzIGNvbW1pdHRlZCB2YWx1ZS4gVGhhdCBtdXN0XG4gKiBiZSBkb25lIGJ5IGNhbGxlcnMuXG4gKlxuICogQHBhcmFtIGNvbnRhaW5lclBhcnQgUGFydCB3aXRoaW4gd2hpY2ggdG8gYWRkIHRoZSBuZXcgQ2hpbGRQYXJ0XG4gKiBAcGFyYW0gcmVmUGFydCBQYXJ0IGJlZm9yZSB3aGljaCB0byBhZGQgdGhlIG5ldyBDaGlsZFBhcnQ7IHdoZW4gb21pdHRlZCB0aGVcbiAqICAgICBwYXJ0IGFkZGVkIHRvIHRoZSBlbmQgb2YgdGhlIGBjb250YWluZXJQYXJ0YFxuICogQHBhcmFtIHBhcnQgUGFydCB0byBpbnNlcnQsIG9yIHVuZGVmaW5lZCB0byBjcmVhdGUgYSBuZXcgcGFydFxuICovXG5leHBvcnQgY29uc3QgaW5zZXJ0UGFydCA9IChcbiAgY29udGFpbmVyUGFydDogQ2hpbGRQYXJ0LFxuICByZWZQYXJ0PzogQ2hpbGRQYXJ0LFxuICBwYXJ0PzogQ2hpbGRQYXJ0XG4pOiBDaGlsZFBhcnQgPT4ge1xuICBjb25zdCBjb250YWluZXIgPSB3cmFwKGNvbnRhaW5lclBhcnQuXyRzdGFydE5vZGUpLnBhcmVudE5vZGUhO1xuXG4gIGNvbnN0IHJlZk5vZGUgPVxuICAgIHJlZlBhcnQgPT09IHVuZGVmaW5lZCA/IGNvbnRhaW5lclBhcnQuXyRlbmROb2RlIDogcmVmUGFydC5fJHN0YXJ0Tm9kZTtcblxuICBpZiAocGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qgc3RhcnROb2RlID0gd3JhcChjb250YWluZXIpLmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgcmVmTm9kZSk7XG4gICAgY29uc3QgZW5kTm9kZSA9IHdyYXAoY29udGFpbmVyKS5pbnNlcnRCZWZvcmUoY3JlYXRlTWFya2VyKCksIHJlZk5vZGUpO1xuICAgIHBhcnQgPSBuZXcgQ2hpbGRQYXJ0KFxuICAgICAgc3RhcnROb2RlLFxuICAgICAgZW5kTm9kZSxcbiAgICAgIGNvbnRhaW5lclBhcnQsXG4gICAgICBjb250YWluZXJQYXJ0Lm9wdGlvbnNcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGVuZE5vZGUgPSB3cmFwKHBhcnQuXyRlbmROb2RlISkubmV4dFNpYmxpbmc7XG4gICAgY29uc3Qgb2xkUGFyZW50ID0gcGFydC5fJHBhcmVudDtcbiAgICBjb25zdCBwYXJlbnRDaGFuZ2VkID0gb2xkUGFyZW50ICE9PSBjb250YWluZXJQYXJ0O1xuICAgIGlmIChwYXJlbnRDaGFuZ2VkKSB7XG4gICAgICBwYXJ0Ll8kcmVwYXJlbnREaXNjb25uZWN0YWJsZXM/Lihjb250YWluZXJQYXJ0KTtcbiAgICAgIC8vIE5vdGUgdGhhdCBhbHRob3VnaCBgXyRyZXBhcmVudERpc2Nvbm5lY3RhYmxlc2AgdXBkYXRlcyB0aGUgcGFydCdzXG4gICAgICAvLyBgXyRwYXJlbnRgIHJlZmVyZW5jZSBhZnRlciB1bmxpbmtpbmcgZnJvbSBpdHMgY3VycmVudCBwYXJlbnQsIHRoYXRcbiAgICAgIC8vIG1ldGhvZCBvbmx5IGV4aXN0cyBpZiBEaXNjb25uZWN0YWJsZXMgYXJlIHByZXNlbnQsIHNvIHdlIG5lZWQgdG9cbiAgICAgIC8vIHVuY29uZGl0aW9uYWxseSBzZXQgaXQgaGVyZVxuICAgICAgcGFydC5fJHBhcmVudCA9IGNvbnRhaW5lclBhcnQ7XG4gICAgICAvLyBTaW5jZSB0aGUgXyRpc0Nvbm5lY3RlZCBnZXR0ZXIgaXMgc29tZXdoYXQgY29zdGx5LCBvbmx5XG4gICAgICAvLyByZWFkIGl0IG9uY2Ugd2Uga25vdyB0aGUgc3VidHJlZSBoYXMgZGlyZWN0aXZlcyB0aGF0IG5lZWRcbiAgICAgIC8vIHRvIGJlIG5vdGlmaWVkXG4gICAgICBsZXQgbmV3Q29ubmVjdGlvblN0YXRlO1xuICAgICAgaWYgKFxuICAgICAgICBwYXJ0Ll8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAobmV3Q29ubmVjdGlvblN0YXRlID0gY29udGFpbmVyUGFydC5fJGlzQ29ubmVjdGVkKSAhPT1cbiAgICAgICAgICBvbGRQYXJlbnQhLl8kaXNDb25uZWN0ZWRcbiAgICAgICkge1xuICAgICAgICBwYXJ0Ll8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQobmV3Q29ubmVjdGlvblN0YXRlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVuZE5vZGUgIT09IHJlZk5vZGUgfHwgcGFyZW50Q2hhbmdlZCkge1xuICAgICAgbGV0IHN0YXJ0OiBOb2RlIHwgbnVsbCA9IHBhcnQuXyRzdGFydE5vZGU7XG4gICAgICB3aGlsZSAoc3RhcnQgIT09IGVuZE5vZGUpIHtcbiAgICAgICAgY29uc3QgbjogTm9kZSB8IG51bGwgPSB3cmFwKHN0YXJ0ISkubmV4dFNpYmxpbmc7XG4gICAgICAgIHdyYXAoY29udGFpbmVyKS5pbnNlcnRCZWZvcmUoc3RhcnQhLCByZWZOb2RlKTtcbiAgICAgICAgc3RhcnQgPSBuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXJ0O1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIFBhcnQuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZCB0byBzZXQvdXBkYXRlIHRoZSB2YWx1ZSBvZiB1c2VyLWNyZWF0ZWRcbiAqIHBhcnRzIChpLmUuIHRob3NlIGNyZWF0ZWQgdXNpbmcgYGluc2VydFBhcnRgKTsgaXQgc2hvdWxkIG5vdCBiZSB1c2VkXG4gKiBieSBkaXJlY3RpdmVzIHRvIHNldCB0aGUgdmFsdWUgb2YgdGhlIGRpcmVjdGl2ZSdzIGNvbnRhaW5lciBwYXJ0LiBEaXJlY3RpdmVzXG4gKiBzaG91bGQgcmV0dXJuIGEgdmFsdWUgZnJvbSBgdXBkYXRlYC9gcmVuZGVyYCB0byB1cGRhdGUgdGhlaXIgcGFydCBzdGF0ZS5cbiAqXG4gKiBGb3IgZGlyZWN0aXZlcyB0aGF0IHJlcXVpcmUgc2V0dGluZyB0aGVpciBwYXJ0IHZhbHVlIGFzeW5jaHJvbm91c2x5LCB0aGV5XG4gKiBzaG91bGQgZXh0ZW5kIGBBc3luY0RpcmVjdGl2ZWAgYW5kIGNhbGwgYHRoaXMuc2V0VmFsdWUoKWAuXG4gKlxuICogQHBhcmFtIHBhcnQgUGFydCB0byBzZXRcbiAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byBzZXRcbiAqIEBwYXJhbSBpbmRleCBGb3IgYEF0dHJpYnV0ZVBhcnRgcywgdGhlIGluZGV4IHRvIHNldFxuICogQHBhcmFtIGRpcmVjdGl2ZVBhcmVudCBVc2VkIGludGVybmFsbHk7IHNob3VsZCBub3QgYmUgc2V0IGJ5IHVzZXJcbiAqL1xuZXhwb3J0IGNvbnN0IHNldENoaWxkUGFydFZhbHVlID0gPFQgZXh0ZW5kcyBDaGlsZFBhcnQ+KFxuICBwYXJ0OiBULFxuICB2YWx1ZTogdW5rbm93bixcbiAgZGlyZWN0aXZlUGFyZW50OiBEaXJlY3RpdmVQYXJlbnQgPSBwYXJ0XG4pOiBUID0+IHtcbiAgcGFydC5fJHNldFZhbHVlKHZhbHVlLCBkaXJlY3RpdmVQYXJlbnQpO1xuICByZXR1cm4gcGFydDtcbn07XG5cbi8vIEEgc2VudGluZWwgdmFsdWUgdGhhdCBjYW4gbmV2ZXIgYXBwZWFyIGFzIGEgcGFydCB2YWx1ZSBleGNlcHQgd2hlbiBzZXQgYnlcbi8vIGxpdmUoKS4gVXNlZCB0byBmb3JjZSBhIGRpcnR5LWNoZWNrIHRvIGZhaWwgYW5kIGNhdXNlIGEgcmUtcmVuZGVyLlxuY29uc3QgUkVTRVRfVkFMVUUgPSB7fTtcblxuLyoqXG4gKiBTZXRzIHRoZSBjb21taXR0ZWQgdmFsdWUgb2YgYSBDaGlsZFBhcnQgZGlyZWN0bHkgd2l0aG91dCB0cmlnZ2VyaW5nIHRoZVxuICogY29tbWl0IHN0YWdlIG9mIHRoZSBwYXJ0LlxuICpcbiAqIFRoaXMgaXMgdXNlZnVsIGluIGNhc2VzIHdoZXJlIGEgZGlyZWN0aXZlIG5lZWRzIHRvIHVwZGF0ZSB0aGUgcGFydCBzdWNoXG4gKiB0aGF0IHRoZSBuZXh0IHVwZGF0ZSBkZXRlY3RzIGEgdmFsdWUgY2hhbmdlIG9yIG5vdC4gV2hlbiB2YWx1ZSBpcyBvbWl0dGVkLFxuICogdGhlIG5leHQgdXBkYXRlIHdpbGwgYmUgZ3VhcmFudGVlZCB0byBiZSBkZXRlY3RlZCBhcyBhIGNoYW5nZS5cbiAqXG4gKiBAcGFyYW0gcGFydFxuICogQHBhcmFtIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBzZXRDb21taXR0ZWRWYWx1ZSA9IChwYXJ0OiBQYXJ0LCB2YWx1ZTogdW5rbm93biA9IFJFU0VUX1ZBTFVFKSA9PlxuICAocGFydC5fJGNvbW1pdHRlZFZhbHVlID0gdmFsdWUpO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGNvbW1pdHRlZCB2YWx1ZSBvZiBhIENoaWxkUGFydC5cbiAqXG4gKiBUaGUgY29tbWl0dGVkIHZhbHVlIGlzIHVzZWQgZm9yIGNoYW5nZSBkZXRlY3Rpb24gYW5kIGVmZmljaWVudCB1cGRhdGVzIG9mXG4gKiB0aGUgcGFydC4gSXQgY2FuIGRpZmZlciBmcm9tIHRoZSB2YWx1ZSBzZXQgYnkgdGhlIHRlbXBsYXRlIG9yIGRpcmVjdGl2ZSBpblxuICogY2FzZXMgd2hlcmUgdGhlIHRlbXBsYXRlIHZhbHVlIGlzIHRyYW5zZm9ybWVkIGJlZm9yZSBiZWluZyBjb21taXR0ZWQuXG4gKlxuICogLSBgVGVtcGxhdGVSZXN1bHRgcyBhcmUgY29tbWl0dGVkIGFzIGEgYFRlbXBsYXRlSW5zdGFuY2VgXG4gKiAtIEl0ZXJhYmxlcyBhcmUgY29tbWl0dGVkIGFzIGBBcnJheTxDaGlsZFBhcnQ+YFxuICogLSBBbGwgb3RoZXIgdHlwZXMgYXJlIGNvbW1pdHRlZCBhcyB0aGUgdGVtcGxhdGUgdmFsdWUgb3IgdmFsdWUgcmV0dXJuZWQgb3JcbiAqICAgc2V0IGJ5IGEgZGlyZWN0aXZlLlxuICpcbiAqIEBwYXJhbSBwYXJ0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRDb21taXR0ZWRWYWx1ZSA9IChwYXJ0OiBDaGlsZFBhcnQpID0+IHBhcnQuXyRjb21taXR0ZWRWYWx1ZTtcblxuLyoqXG4gKiBSZW1vdmVzIGEgQ2hpbGRQYXJ0IGZyb20gdGhlIERPTSwgaW5jbHVkaW5nIGFueSBvZiBpdHMgY29udGVudC5cbiAqXG4gKiBAcGFyYW0gcGFydCBUaGUgUGFydCB0byByZW1vdmVcbiAqL1xuZXhwb3J0IGNvbnN0IHJlbW92ZVBhcnQgPSAocGFydDogQ2hpbGRQYXJ0KSA9PiB7XG4gIHBhcnQuXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZD8uKGZhbHNlLCB0cnVlKTtcbiAgbGV0IHN0YXJ0OiBDaGlsZE5vZGUgfCBudWxsID0gcGFydC5fJHN0YXJ0Tm9kZTtcbiAgY29uc3QgZW5kOiBDaGlsZE5vZGUgfCBudWxsID0gd3JhcChwYXJ0Ll8kZW5kTm9kZSEpLm5leHRTaWJsaW5nO1xuICB3aGlsZSAoc3RhcnQgIT09IGVuZCkge1xuICAgIGNvbnN0IG46IENoaWxkTm9kZSB8IG51bGwgPSB3cmFwKHN0YXJ0ISkubmV4dFNpYmxpbmc7XG4gICAgKHdyYXAoc3RhcnQhKSBhcyBDaGlsZE5vZGUpLnJlbW92ZSgpO1xuICAgIHN0YXJ0ID0gbjtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGNsZWFyUGFydCA9IChwYXJ0OiBDaGlsZFBhcnQpID0+IHtcbiAgcGFydC5fJGNsZWFyKCk7XG59O1xuIiwgIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDIwIEdvb2dsZSBMTENcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBCU0QtMy1DbGF1c2VcbiAqL1xuXG5pbXBvcnQge0F0dHJpYnV0ZVBhcnQsIG5vQ2hhbmdlLCBub3RoaW5nfSBmcm9tICcuLi9saXQtaHRtbC5qcyc7XG5pbXBvcnQge1xuICBkaXJlY3RpdmUsXG4gIERpcmVjdGl2ZSxcbiAgRGlyZWN0aXZlUGFyYW1ldGVycyxcbiAgUGFydEluZm8sXG4gIFBhcnRUeXBlLFxufSBmcm9tICcuLi9kaXJlY3RpdmUuanMnO1xuaW1wb3J0IHtpc1NpbmdsZUV4cHJlc3Npb24sIHNldENvbW1pdHRlZFZhbHVlfSBmcm9tICcuLi9kaXJlY3RpdmUtaGVscGVycy5qcyc7XG5cbmNsYXNzIExpdmVEaXJlY3RpdmUgZXh0ZW5kcyBEaXJlY3RpdmUge1xuICBjb25zdHJ1Y3RvcihwYXJ0SW5mbzogUGFydEluZm8pIHtcbiAgICBzdXBlcihwYXJ0SW5mbyk7XG4gICAgaWYgKFxuICAgICAgIShcbiAgICAgICAgcGFydEluZm8udHlwZSA9PT0gUGFydFR5cGUuUFJPUEVSVFkgfHxcbiAgICAgICAgcGFydEluZm8udHlwZSA9PT0gUGFydFR5cGUuQVRUUklCVVRFIHx8XG4gICAgICAgIHBhcnRJbmZvLnR5cGUgPT09IFBhcnRUeXBlLkJPT0xFQU5fQVRUUklCVVRFXG4gICAgICApXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdUaGUgYGxpdmVgIGRpcmVjdGl2ZSBpcyBub3QgYWxsb3dlZCBvbiBjaGlsZCBvciBldmVudCBiaW5kaW5ncydcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICghaXNTaW5nbGVFeHByZXNzaW9uKHBhcnRJbmZvKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgbGl2ZWAgYmluZGluZ3MgY2FuIG9ubHkgY29udGFpbiBhIHNpbmdsZSBleHByZXNzaW9uJyk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKHZhbHVlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdXBkYXRlKHBhcnQ6IEF0dHJpYnV0ZVBhcnQsIFt2YWx1ZV06IERpcmVjdGl2ZVBhcmFtZXRlcnM8dGhpcz4pIHtcbiAgICBpZiAodmFsdWUgPT09IG5vQ2hhbmdlIHx8IHZhbHVlID09PSBub3RoaW5nKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGNvbnN0IGVsZW1lbnQgPSBwYXJ0LmVsZW1lbnQ7XG4gICAgY29uc3QgbmFtZSA9IHBhcnQubmFtZTtcblxuICAgIGlmIChwYXJ0LnR5cGUgPT09IFBhcnRUeXBlLlBST1BFUlRZKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgaWYgKHZhbHVlID09PSAoZWxlbWVudCBhcyBhbnkpW25hbWVdKSB7XG4gICAgICAgIHJldHVybiBub0NoYW5nZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHBhcnQudHlwZSA9PT0gUGFydFR5cGUuQk9PTEVBTl9BVFRSSUJVVEUpIHtcbiAgICAgIGlmICghIXZhbHVlID09PSBlbGVtZW50Lmhhc0F0dHJpYnV0ZShuYW1lKSkge1xuICAgICAgICByZXR1cm4gbm9DaGFuZ2U7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChwYXJ0LnR5cGUgPT09IFBhcnRUeXBlLkFUVFJJQlVURSkge1xuICAgICAgaWYgKGVsZW1lbnQuZ2V0QXR0cmlidXRlKG5hbWUpID09PSBTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBub0NoYW5nZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVzZXRzIHRoZSBwYXJ0J3MgdmFsdWUsIGNhdXNpbmcgaXRzIGRpcnR5LWNoZWNrIHRvIGZhaWwgc28gdGhhdCBpdFxuICAgIC8vIGFsd2F5cyBzZXRzIHRoZSB2YWx1ZS5cbiAgICBzZXRDb21taXR0ZWRWYWx1ZShwYXJ0KTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVja3MgYmluZGluZyB2YWx1ZXMgYWdhaW5zdCBsaXZlIERPTSB2YWx1ZXMsIGluc3RlYWQgb2YgcHJldmlvdXNseSBib3VuZFxuICogdmFsdWVzLCB3aGVuIGRldGVybWluaW5nIHdoZXRoZXIgdG8gdXBkYXRlIHRoZSB2YWx1ZS5cbiAqXG4gKiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2FzZXMgd2hlcmUgdGhlIERPTSB2YWx1ZSBtYXkgY2hhbmdlIGZyb20gb3V0c2lkZSBvZlxuICogbGl0LWh0bWwsIHN1Y2ggYXMgd2l0aCBhIGJpbmRpbmcgdG8gYW4gYDxpbnB1dD5gIGVsZW1lbnQncyBgdmFsdWVgIHByb3BlcnR5LFxuICogYSBjb250ZW50IGVkaXRhYmxlIGVsZW1lbnRzIHRleHQsIG9yIHRvIGEgY3VzdG9tIGVsZW1lbnQgdGhhdCBjaGFuZ2VzIGl0J3NcbiAqIG93biBwcm9wZXJ0aWVzIG9yIGF0dHJpYnV0ZXMuXG4gKlxuICogSW4gdGhlc2UgY2FzZXMgaWYgdGhlIERPTSB2YWx1ZSBjaGFuZ2VzLCBidXQgdGhlIHZhbHVlIHNldCB0aHJvdWdoIGxpdC1odG1sXG4gKiBiaW5kaW5ncyBoYXNuJ3QsIGxpdC1odG1sIHdvbid0IGtub3cgdG8gdXBkYXRlIHRoZSBET00gdmFsdWUgYW5kIHdpbGwgbGVhdmVcbiAqIGl0IGFsb25lLiBJZiB0aGlzIGlzIG5vdCB3aGF0IHlvdSB3YW50LS1pZiB5b3Ugd2FudCB0byBvdmVyd3JpdGUgdGhlIERPTVxuICogdmFsdWUgd2l0aCB0aGUgYm91bmQgdmFsdWUgbm8gbWF0dGVyIHdoYXQtLXVzZSB0aGUgYGxpdmUoKWAgZGlyZWN0aXZlOlxuICpcbiAqIGBgYGpzXG4gKiBodG1sYDxpbnB1dCAudmFsdWU9JHtsaXZlKHgpfT5gXG4gKiBgYGBcbiAqXG4gKiBgbGl2ZSgpYCBwZXJmb3JtcyBhIHN0cmljdCBlcXVhbGl0eSBjaGVjayBhZ2FpbnN0IHRoZSBsaXZlIERPTSB2YWx1ZSwgYW5kIGlmXG4gKiB0aGUgbmV3IHZhbHVlIGlzIGVxdWFsIHRvIHRoZSBsaXZlIHZhbHVlLCBkb2VzIG5vdGhpbmcuIFRoaXMgbWVhbnMgdGhhdFxuICogYGxpdmUoKWAgc2hvdWxkIG5vdCBiZSB1c2VkIHdoZW4gdGhlIGJpbmRpbmcgd2lsbCBjYXVzZSBhIHR5cGUgY29udmVyc2lvbi4gSWZcbiAqIHlvdSB1c2UgYGxpdmUoKWAgd2l0aCBhbiBhdHRyaWJ1dGUgYmluZGluZywgbWFrZSBzdXJlIHRoYXQgb25seSBzdHJpbmdzIGFyZVxuICogcGFzc2VkIGluLCBvciB0aGUgYmluZGluZyB3aWxsIHVwZGF0ZSBldmVyeSByZW5kZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBsaXZlID0gZGlyZWN0aXZlKExpdmVEaXJlY3RpdmUpO1xuXG4vKipcbiAqIFRoZSB0eXBlIG9mIHRoZSBjbGFzcyB0aGF0IHBvd2VycyB0aGlzIGRpcmVjdGl2ZS4gTmVjZXNzYXJ5IGZvciBuYW1pbmcgdGhlXG4gKiBkaXJlY3RpdmUncyByZXR1cm4gdHlwZS5cbiAqL1xuZXhwb3J0IHR5cGUge0xpdmVEaXJlY3RpdmV9O1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IFJlc291cmNlRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzXCI7XG5pbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgaWNvbiB9IGZyb20gXCIuLi9pY29ucy9pY29uc1wiO1xuaW1wb3J0IHsgZXhlY3V0ZU9wIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlXCI7XG5pbXBvcnQge1xuICBBZGRSZXNvdXJjZU9wdGlvbk9wLFxuICBEZWxldGVSZXNvdXJjZU9wdGlvbk9wLFxuICBNb3ZlUmVzb3VyY2VPcHRpb25PcCxcbiAgUmVuYW1lUmVzb3VyY2VPcCxcbiAgUmVuYW1lUmVzb3VyY2VPcHRpb25PcCxcbn0gZnJvbSBcIi4uL29wcy9yZXNvdXJjZXNcIjtcbmltcG9ydCB7IE9wIH0gZnJvbSBcIi4uL29wcy9vcHNcIjtcbmltcG9ydCB7IFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHRcIjtcbmltcG9ydCB7IGxpdmUgfSBmcm9tIFwibGl0LWh0bWwvZGlyZWN0aXZlcy9saXZlLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBFZGl0UmVzb3VyY2VEZWZpbml0aW9uIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBleHBsYW5NYWluOiBFeHBsYW5NYWluIHwgbnVsbCA9IG51bGw7XG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uID0gbmV3IFJlc291cmNlRGVmaW5pdGlvbigpO1xuICBuYW1lOiBzdHJpbmcgPSBcIlwiO1xuICBwbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFjazogKCkgPT4gdm9pZDtcbiAgbmV3VmFsdWVDb3VudGVyID0gMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH07XG4gIH1cblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBzaG93TW9kYWwoXG4gICAgZXhwbGFuTWFpbjogRXhwbGFuTWFpbixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb25cbiAgKSB7XG4gICAgdGhpcy5leHBsYW5NYWluID0gZXhwbGFuTWFpbjtcbiAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbiA9IHJlc291cmNlRGVmaW5pdGlvbjtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImRpYWxvZ1wiKSEuc2hvd01vZGFsKCk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlcigpIHtcbiAgICByZW5kZXIodGhpcy50ZW1wbGF0ZSgpLCB0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgY2FuY2VsKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLmNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGV4ZWN1dGVPcChvcDogT3ApOiBQcm9taXNlPFJlc3VsdDxudWxsPj4ge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGVPcChcbiAgICAgIG9wLFxuICAgICAgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIixcbiAgICAgIHRydWUsXG4gICAgICB0aGlzLmV4cGxhbk1haW4hXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgd2luZG93LmFsZXJ0KHJldC5lcnJvcik7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNoYW5nZVJlc291cmNlTmFtZShlOiBFdmVudCwgbmV3TmFtZTogc3RyaW5nLCBvbGROYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZXQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVPcChSZW5hbWVSZXNvdXJjZU9wKG9sZE5hbWUsIG5ld05hbWUpKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgd2luZG93LmFsZXJ0KHJldC5lcnJvcik7XG4gICAgICB0aGlzLm5hbWUgPSBvbGROYW1lO1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG4gICAgdGhpcy5uYW1lID0gbmV3TmFtZTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2hhbmdlUmVzb3VyY2VWYWx1ZU5hbWUoXG4gICAgZTogRXZlbnQsXG4gICAgbmV3VmFsdWU6IHN0cmluZyxcbiAgICBvbGRWYWx1ZTogc3RyaW5nXG4gICkge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IHRoaXMuZXhlY3V0ZU9wKFxuICAgICAgUmVuYW1lUmVzb3VyY2VPcHRpb25PcCh0aGlzLm5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSlcbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICB3aW5kb3cuYWxlcnQocmV0LmVycm9yKTtcbiAgICAgIChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSA9IG9sZFZhbHVlO1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFByb3Bvc2VkUmVzb3VyY2VOYW1lKCk6IHN0cmluZyB7XG4gICAgdGhpcy5uZXdWYWx1ZUNvdW50ZXIrKztcbiAgICByZXR1cm4gYE5ldyBWYWx1ZSAke3RoaXMubmV3VmFsdWVDb3VudGVyfWA7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG5ld1Jlc291cmNlVmFsdWUoKSB7XG4gICAgdGhpcy5uZXdWYWx1ZUNvdW50ZXIgPSAwO1xuICAgIC8vIENvbWUgdXAgd2l0aCBhIHVuaXF1ZSBuYW1lIHRvIGFkZCwgc2luY2UgYWxsIHJlc291cmNlIHZhbHVlcyBtdXN0IGJlXG4gICAgLy8gdW5pcXVlIGZvciBhIGdpdmVuIHJlc291cmNlIG5hbWUuXG4gICAgbGV0IG5ld1Jlc291cmNlTmFtZSA9IHRoaXMuZ2V0UHJvcG9zZWRSZXNvdXJjZU5hbWUoKTtcbiAgICB3aGlsZSAoXG4gICAgICB0aGlzLmV4cGxhbk1haW4hLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9uc1t0aGlzLm5hbWVdLnZhbHVlcy5maW5kSW5kZXgoXG4gICAgICAgICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSA9PT0gbmV3UmVzb3VyY2VOYW1lXG4gICAgICApICE9IC0xXG4gICAgKSB7XG4gICAgICBuZXdSZXNvdXJjZU5hbWUgPSB0aGlzLmdldFByb3Bvc2VkUmVzb3VyY2VOYW1lKCk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoQWRkUmVzb3VyY2VPcHRpb25PcCh0aGlzLm5hbWUsIG5ld1Jlc291cmNlTmFtZSkpO1xuICB9XG4gIHByaXZhdGUgYXN5bmMgbW92ZVVwKHZhbHVlOiBzdHJpbmcsIHZhbHVlSW5kZXg6IG51bWJlcikge1xuICAgIGF3YWl0IHRoaXMuZXhlY3V0ZU9wKFxuICAgICAgTW92ZVJlc291cmNlT3B0aW9uT3AodGhpcy5uYW1lLCB2YWx1ZUluZGV4LCB2YWx1ZUluZGV4IC0gMSlcbiAgICApO1xuICB9XG4gIHByaXZhdGUgYXN5bmMgbW92ZURvd24odmFsdWU6IHN0cmluZywgdmFsdWVJbmRleDogbnVtYmVyKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoXG4gICAgICBNb3ZlUmVzb3VyY2VPcHRpb25PcCh0aGlzLm5hbWUsIHZhbHVlSW5kZXgsIHZhbHVlSW5kZXggKyAxKVxuICAgICk7XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyBtb3ZlVG9Ub3AodmFsdWU6IHN0cmluZywgdmFsdWVJbmRleDogbnVtYmVyKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoTW92ZVJlc291cmNlT3B0aW9uT3AodGhpcy5uYW1lLCB2YWx1ZUluZGV4LCAwKSk7XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyBtb3ZlVG9Cb3R0b20odmFsdWU6IHN0cmluZywgdmFsdWVJbmRleDogbnVtYmVyKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoXG4gICAgICBNb3ZlUmVzb3VyY2VPcHRpb25PcChcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB2YWx1ZUluZGV4LFxuICAgICAgICB0aGlzLmV4cGxhbk1haW4hLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9uc1t0aGlzLm5hbWVdIS52YWx1ZXMubGVuZ3RoIC0gMVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyBkZWxldGVSZXNvdXJjZVZhbHVlKHZhbHVlOiBzdHJpbmcsIHZhbHVlSW5kZXg6IG51bWJlcikge1xuICAgIGF3YWl0IHRoaXMuZXhlY3V0ZU9wKERlbGV0ZVJlc291cmNlT3B0aW9uT3AodGhpcy5uYW1lLCB2YWx1ZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSB0ZW1wbGF0ZSgpOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8ZGlhbG9nPlxuICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgTmFtZTpcbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUodGhpcy5uYW1lKX1cbiAgICAgICAgICAgIGRhdGEtb2xkLW5hbWU9JHt0aGlzLm5hbWV9XG4gICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGVsZSA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgICAgICAgIHRoaXMuY2hhbmdlUmVzb3VyY2VOYW1lKGUsIGVsZS52YWx1ZSwgZWxlLmRhdGFzZXQub2xkTmFtZSB8fCBcIlwiKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICR7dGhpcy5yZXNvdXJjZURlZmluaXRpb24udmFsdWVzLm1hcChcbiAgICAgICAgICAgICh2YWx1ZTogc3RyaW5nLCB2YWx1ZUluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGh0bWxgPHRyPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICBkYXRhLW9sZC12YWx1ZT0ke3ZhbHVlfVxuICAgICAgICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZVJlc291cmNlVmFsdWVOYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZS5kYXRhc2V0Lm9sZFZhbHVlIHx8IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAudmFsdWU9JHtsaXZlKHZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5tb3ZlVXAodmFsdWUsIHZhbHVlSW5kZXgpfVxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgLmRpc2FibGVkPSR7dmFsdWVJbmRleCA9PT0gMH1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgJHtpY29uKFwia2V5Ym9hcmQtdXAtaWNvblwiKX1cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAuZGlzYWJsZWQ9JHt2YWx1ZUluZGV4ID09PVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHRoaXMubW92ZURvd24odmFsdWUsIHZhbHVlSW5kZXgpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAke2ljb24oXCJrZXlib2FyZC1kb3duLWljb25cIil9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgLmRpc2FibGVkPSR7dmFsdWVJbmRleCA9PT1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmxlbmd0aCAtIDF9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBAY2xpY2s9JHsoKSA9PiB0aGlzLm1vdmVUb0JvdHRvbSh2YWx1ZSwgdmFsdWVJbmRleCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICR7aWNvbihcImtleWJvYXJkLWRvdWJsZS1kb3duLWljb25cIil9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgLmRpc2FibGVkPSR7dmFsdWVJbmRleCA9PT0gMH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHRoaXMubW92ZVRvVG9wKHZhbHVlLCB2YWx1ZUluZGV4KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgJHtpY29uKFwia2V5Ym9hcmQtZG91YmxlLXVwLWljb25cIil9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgLmRpc2FibGVkPSR7dGhpcy5yZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmxlbmd0aCA9PT0gMX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHRoaXMuZGVsZXRlUmVzb3VyY2VWYWx1ZSh2YWx1ZSwgdmFsdWVJbmRleCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICR7aWNvbihcImRlbGV0ZS1pY29uXCIpfVxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgPC90cj5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICl9XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMubmV3UmVzb3VyY2VWYWx1ZSgpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBOZXdcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJkaWFsb2ctZm9vdGVyXCI+XG4gICAgICAgICAgPGJ1dHRvbiBAY2xpY2s9JHsoKSA9PiB0aGlzLmNhbmNlbCgpfT5DbG9zZTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGlhbG9nPlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwiZWRpdC1yZXNvdXJjZS1kZWZpbml0aW9uXCIsIEVkaXRSZXNvdXJjZURlZmluaXRpb24pO1xuIiwgIi8vIFV0aWxpdGllcyBmb3IgZGVhbGluZyB3aXRoIGEgcmFuZ2Ugb2YgbnVtYmVycy5cblxuZXhwb3J0IGludGVyZmFjZSBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQge1xuICBtaW46IG51bWJlcjtcbiAgbWF4OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBkaXNwbGF5VmFsdWUgPSAoeDogbnVtYmVyKTogc3RyaW5nID0+IHtcbiAgaWYgKHggPT09IE51bWJlci5NQVhfVkFMVUUpIHtcbiAgICByZXR1cm4gXCIobWF4IGZsb2F0KVwiO1xuICB9IGVsc2UgaWYgKHggPT09IC1OdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgcmV0dXJuIFwiKG1pbiBmbG9hdClcIjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4geC50b1N0cmluZygpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgY2xhbXAgPSAoeDogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICBpZiAoeCA+IG1heCkge1xuICAgIHJldHVybiBtYXg7XG4gIH1cbiAgaWYgKHggPCBtaW4pIHtcbiAgICByZXR1cm4gbWluO1xuICB9XG4gIHJldHVybiB4O1xufTtcblxuLy8gUmFuZ2UgZGVmaW5lcyBhIHJhbmdlIG9mIG51bWJlcnMsIGZyb20gW21pbiwgbWF4XSBpbmNsdXNpdmUuXG5leHBvcnQgY2xhc3MgTWV0cmljUmFuZ2Uge1xuICBwcml2YXRlIF9taW46IG51bWJlciA9IC1OdW1iZXIuTUFYX1ZBTFVFO1xuICBwcml2YXRlIF9tYXg6IG51bWJlciA9IE51bWJlci5NQVhfVkFMVUU7XG5cbiAgY29uc3RydWN0b3IobWluOiBudW1iZXIgPSAtTnVtYmVyLk1BWF9WQUxVRSwgbWF4OiBudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgaWYgKG1heCA8IG1pbikge1xuICAgICAgW21pbiwgbWF4XSA9IFttYXgsIG1pbl07XG4gICAgfVxuICAgIHRoaXMuX21pbiA9IG1pbjtcbiAgICB0aGlzLl9tYXggPSBtYXg7XG4gIH1cblxuICBjbGFtcCh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gY2xhbXAodmFsdWUsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWluKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21pbjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWF4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21heDtcbiAgfVxuXG4gIHRvSlNPTigpOiBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBtaW46IHRoaXMuX21pbixcbiAgICAgIG1heDogdGhpcy5fbWF4LFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZnJvbUpTT04oczogTWV0cmljUmFuZ2VTZXJpYWxpemVkIHwgdW5kZWZpbmVkKTogTWV0cmljUmFuZ2Uge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgTWV0cmljUmFuZ2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBNZXRyaWNSYW5nZShzLm1pbiwgcy5tYXgpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgUm91bmRlciB9IGZyb20gXCIuLi90eXBlcy90eXBlc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByZWNpc2lvblNlcmlhbGl6ZWQge1xuICBwcmVjaXNpb246IG51bWJlcjtcbn1cbmV4cG9ydCBjbGFzcyBQcmVjaXNpb24ge1xuICBwcml2YXRlIF9wcmVjaXNpb246IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihwcmVjaXNpb246IG51bWJlciA9IDApIHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShwcmVjaXNpb24pKSB7XG4gICAgICBwcmVjaXNpb24gPSAwO1xuICAgIH1cbiAgICB0aGlzLl9wcmVjaXNpb24gPSBNYXRoLmFicyhNYXRoLnRydW5jKHByZWNpc2lvbikpO1xuICB9XG5cbiAgcm91bmQoeDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gK3gudG9GaXhlZCh0aGlzLl9wcmVjaXNpb24pO1xuICB9XG5cbiAgcm91bmRlcigpOiBSb3VuZGVyIHtcbiAgICByZXR1cm4gKHg6IG51bWJlcik6IG51bWJlciA9PiB0aGlzLnJvdW5kKHgpO1xuICB9XG5cbiAgcHVibGljIGdldCBwcmVjaXNpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcHJlY2lzaW9uO1xuICB9XG5cbiAgdG9KU09OKCk6IFByZWNpc2lvblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBwcmVjaXNpb246IHRoaXMuX3ByZWNpc2lvbixcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGZyb21KU09OKHM6IFByZWNpc2lvblNlcmlhbGl6ZWQgfCB1bmRlZmluZWQpOiBQcmVjaXNpb24ge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgUHJlY2lzaW9uKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJlY2lzaW9uKHMucHJlY2lzaW9uKTtcbiAgfVxufVxuIiwgIi8vIE1ldHJpY3MgZGVmaW5lIGZsb2F0aW5nIHBvaW50IHZhbHVlcyB0aGF0IGFyZSB0cmFja2VkIHBlciBUYXNrLlxuXG5pbXBvcnQgeyBQcmVjaXNpb24sIFByZWNpc2lvblNlcmlhbGl6ZWQgfSBmcm9tIFwiLi4vcHJlY2lzaW9uL3ByZWNpc2lvbi50c1wiO1xuaW1wb3J0IHsgY2xhbXAsIE1ldHJpY1JhbmdlLCBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQgfSBmcm9tIFwiLi9yYW5nZS50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlU2VyaWFsaXplZDtcbiAgZGVmYXVsdDogbnVtYmVyO1xuICBwcmVjaXNpb246IFByZWNpc2lvblNlcmlhbGl6ZWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRyaWNEZWZpbml0aW9uIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlO1xuICBkZWZhdWx0OiBudW1iZXI7XG4gIGlzU3RhdGljOiBib29sZWFuO1xuICBwcmVjaXNpb246IFByZWNpc2lvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZWZhdWx0VmFsdWU6IG51bWJlcixcbiAgICByYW5nZTogTWV0cmljUmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoKSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlLFxuICAgIHByZWNpc2lvbjogUHJlY2lzaW9uID0gbmV3IFByZWNpc2lvbigxKVxuICApIHtcbiAgICB0aGlzLnByZWNpc2lvbiA9IHByZWNpc2lvbjtcbiAgICB0aGlzLnJhbmdlID0gcmFuZ2U7XG4gICAgdGhpcy5kZWZhdWx0ID0gZGVmYXVsdFZhbHVlO1xuICAgIHRoaXMuaXNTdGF0aWMgPSBpc1N0YXRpYztcbiAgICB0aGlzLnJhdGlvbmFsaXplKCk7XG4gIH1cblxuICByYXRpb25hbGl6ZSgpIHtcbiAgICAvLyBtaW4gYW5kIG1heCBzaG91bGQgYmUgcm91bmRlZCB0byBwcmVjaXNpb24gZmlyc3QuIGFuZCB0aGVuIGNsYW1wIGFuZFxuICAgIC8vIHByZWNpc2lvbiBhcHBsaWVkIHRvIHRoZSBkZWZhdWx0LlxuICAgIHRoaXMucmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoXG4gICAgICB0aGlzLnByZWNpc2lvbi5yb3VuZCh0aGlzLnJhbmdlLm1pbiksXG4gICAgICB0aGlzLnByZWNpc2lvbi5yb3VuZCh0aGlzLnJhbmdlLm1heClcbiAgICApO1xuICAgIC8vIG1pbiBhbmQgbWF4IHNob3VsZCBiZSByb3VuZGVkIHRvIHByZWNpc2lvbiBmaXJzdC4gYW5kIHRoZW4gY2xhbXAgYW5kXG4gICAgLy8gcHJlY2lzaW9uIGFwcGxpZWQgdG8gdGhlIGRlZmF1bHQuXG4gICAgdGhpcy5kZWZhdWx0ID0gdGhpcy5jbGFtcEFuZFJvdW5kKHRoaXMuZGVmYXVsdCk7XG4gIH1cblxuICBjbGFtcEFuZFJvdW5kKHg6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucHJlY2lzaW9uLnJvdW5kKHRoaXMucmFuZ2UuY2xhbXAoeCkpO1xuICB9XG5cbiAgdG9KU09OKCk6IE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmFuZ2U6IHRoaXMucmFuZ2UudG9KU09OKCksXG4gICAgICBkZWZhdWx0OiB0aGlzLmRlZmF1bHQsXG4gICAgICBwcmVjaXNpb246IHRoaXMucHJlY2lzaW9uLnRvSlNPTigpLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZnJvbUpTT04oczogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQgfCB1bmRlZmluZWQpOiBNZXRyaWNEZWZpbml0aW9uIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IE1ldHJpY0RlZmluaXRpb24oMCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTWV0cmljRGVmaW5pdGlvbihcbiAgICAgIHMuZGVmYXVsdCB8fCAwLFxuICAgICAgTWV0cmljUmFuZ2UuZnJvbUpTT04ocy5yYW5nZSksXG4gICAgICBmYWxzZSxcbiAgICAgIFByZWNpc2lvbi5mcm9tSlNPTihzLnByZWNpc2lvbilcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBNZXRyaWNEZWZpbml0aW9uIH07XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZCA9IHtcbiAgW2tleTogc3RyaW5nXTogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQ7XG59O1xuXG5leHBvcnQgdHlwZSBNZXRyaWNWYWx1ZXMgPSB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9O1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBpY29uIH0gZnJvbSBcIi4uL2ljb25zL2ljb25zXCI7XG5pbXBvcnQgeyBkaXNwbGF5VmFsdWUgfSBmcm9tIFwiLi4vbWV0cmljcy9yYW5nZVwiO1xuaW1wb3J0IHsgZXhlY3V0ZU9wIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlXCI7XG5pbXBvcnQgeyBBZGRNZXRyaWNPcCwgRGVsZXRlTWV0cmljT3AgfSBmcm9tIFwiLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBFZGl0TWV0cmljRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9lZGl0LW1ldHJpYy1kZWZpbml0aW9uL2VkaXQtbWV0cmljLWRlZmluaXRpb25cIjtcblxuZXhwb3J0IGNsYXNzIEVkaXRNZXRyaWNzRGlhbG9nIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBleHBsYW5NYWluOiBFeHBsYW5NYWluIHwgbnVsbCA9IG51bGw7XG4gIHBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLmV4cGxhbk1haW4gIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwicGxhbi1kZWZpbml0aW9uLWNoYW5nZWRcIixcbiAgICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2tcbiAgICApO1xuICB9XG5cbiAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwicGxhbi1kZWZpbml0aW9uLWNoYW5nZWRcIixcbiAgICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2tcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXIoKSB7XG4gICAgcmVuZGVyKHRoaXMudGVtcGxhdGUoKSwgdGhpcyk7XG4gIH1cblxuICBzaG93TW9kYWwoZXhwbGFuTWFpbjogRXhwbGFuTWFpbikge1xuICAgIHRoaXMuZXhwbGFuTWFpbiA9IGV4cGxhbk1haW47XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5zaG93TW9kYWwoKTtcbiAgfVxuXG4gIHByaXZhdGUgY2FuY2VsKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLmNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIHRlbXBsYXRlKCk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdCBtZCA9IHRoaXMuZXhwbGFuTWFpbiEucGxhbi5tZXRyaWNEZWZpbml0aW9ucztcbiAgICBjb25zdCBhbGxLZXlzU29ydGVkID0gT2JqZWN0LmtleXMobWQpLnNvcnQoXG4gICAgICAoa2V5QTogc3RyaW5nLCBrZXlCOiBzdHJpbmcpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBhID0gbWRba2V5QV07XG4gICAgICAgIGNvbnN0IGIgPSBtZFtrZXlCXTtcbiAgICAgICAgaWYgKGEuaXNTdGF0aWMgPT09IGIuaXNTdGF0aWMpIHtcbiAgICAgICAgICByZXR1cm4ga2V5QS5sb2NhbGVDb21wYXJlKGtleUIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhLmlzU3RhdGljKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIGh0bWxgIDxkaWFsb2c+XG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+TmFtZTwvdGg+XG4gICAgICAgICAgPHRoPk1pbjwvdGg+XG4gICAgICAgICAgPHRoPk1heDwvdGg+XG4gICAgICAgICAgPHRoPkRlZmF1bHQ8L3RoPlxuICAgICAgICAgIDx0aD48L3RoPlxuICAgICAgICAgIDx0aD48L3RoPlxuICAgICAgICA8L3RyPlxuXG4gICAgICAgICR7YWxsS2V5c1NvcnRlZC5tYXAoKG1ldHJpY05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGNvbnN0IG1ldHJpY0RlZm4gPVxuICAgICAgICAgICAgdGhpcy5leHBsYW5NYWluIS5wbGFuLm1ldHJpY0RlZmluaXRpb25zW21ldHJpY05hbWVdO1xuICAgICAgICAgIHJldHVybiBodG1sYFxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICA8dGQ+JHttZXRyaWNOYW1lfTwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD4ke2Rpc3BsYXlWYWx1ZShtZXRyaWNEZWZuLnJhbmdlLm1pbil9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPiR7ZGlzcGxheVZhbHVlKG1ldHJpY0RlZm4ucmFuZ2UubWF4KX08L3RkPlxuICAgICAgICAgICAgICA8dGQ+JHttZXRyaWNEZWZuLmRlZmF1bHR9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICR7dGhpcy5kZWxCdXR0b25JZk5vdFN0YXRpYyhtZXRyaWNOYW1lLCBtZXRyaWNEZWZuLmlzU3RhdGljKX1cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICR7dGhpcy5lZGl0QnV0dG9uSWZOb3RTdGF0aWMobWV0cmljTmFtZSwgbWV0cmljRGVmbi5pc1N0YXRpYyl9XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgIGA7XG4gICAgICAgIH0pfVxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgdGl0bGU9XCJBZGQgYSBuZXcgUmVzb3VyY2UuXCJcbiAgICAgICAgICAgICAgQGNsaWNrPSR7KCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubmV3TWV0cmljKCk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICR7aWNvbihcImFkZC1pY29uXCIpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgICA8ZGl2IGNsYXNzPVwiZGlhbG9nLWZvb3RlclwiPlxuICAgICAgICA8YnV0dG9uIEBjbGljaz0keygpID0+IHRoaXMuY2FuY2VsKCl9PkNsb3NlPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2RpYWxvZz5gO1xuICB9XG5cbiAgcHJpdmF0ZSBkZWxCdXR0b25JZk5vdFN0YXRpYyhcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgaXNTdGF0aWM6IGJvb2xlYW5cbiAgKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGlmIChpc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGh0bWxgYDtcbiAgICB9XG4gICAgcmV0dXJuIGh0bWxgPGJ1dHRvblxuICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICB0aXRsZT1cIkRlbGV0ZSB0aGlzIG1ldHJpYy5cIlxuICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5kZWxldGVNZXRyaWMobmFtZSl9XG4gICAgPlxuICAgICAgJHtpY29uKFwiZGVsZXRlLWljb25cIil9XG4gICAgPC9idXR0b24+YDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZGVsZXRlTWV0cmljKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGVPcChcbiAgICAgIERlbGV0ZU1ldHJpY09wKG5hbWUpLFxuICAgICAgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIixcbiAgICAgIHRydWUsXG4gICAgICB0aGlzLmV4cGxhbk1haW4hXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgY29uc29sZS5sb2cocmV0LmVycm9yKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgZWRpdEJ1dHRvbklmTm90U3RhdGljKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBpc1N0YXRpYzogYm9vbGVhblxuICApOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgaWYgKGlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gaHRtbGBgO1xuICAgIH1cbiAgICByZXR1cm4gaHRtbGA8YnV0dG9uXG4gICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgIHRpdGxlPVwiRWRpdCB0aGUgcmVzb3VyY2UgZGVmaW5pdGlvbi5cIlxuICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5lZGl0TWV0cmljKG5hbWUpfVxuICAgID5cbiAgICAgICR7aWNvbihcImVkaXQtaWNvblwiKX1cbiAgICA8L2J1dHRvbj5gO1xuICB9XG5cbiAgcHJpdmF0ZSBlZGl0TWV0cmljKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgdGhpcy5leHBsYW5NYWluIS5xdWVyeVNlbGVjdG9yPEVkaXRNZXRyaWNEZWZpbml0aW9uPihcbiAgICAgIFwiZWRpdC1tZXRyaWMtZGVmaW5pdGlvblwiXG4gICAgKSEuc2hvd01vZGFsKHRoaXMuZXhwbGFuTWFpbiEsIG5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBuZXdNZXRyaWMoKSB7XG4gICAgY29uc3QgbmFtZSA9IHdpbmRvdy5wcm9tcHQoXCJNZXRyaWMgbmFtZTpcIiwgXCJcIik7XG4gICAgaWYgKG5hbWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZU9wKFxuICAgICAgQWRkTWV0cmljT3AobmFtZSwgbmV3IE1ldHJpY0RlZmluaXRpb24oMCkpLFxuICAgICAgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIixcbiAgICAgIHRydWUsXG4gICAgICB0aGlzLmV4cGxhbk1haW4hXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgd2luZG93LmFsZXJ0KHJldC5lcnJvcik7XG4gICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImVkaXQtbWV0cmljcy1kaWFsb2dcIiwgRWRpdE1ldHJpY3NEaWFsb2cpO1xuIiwgImltcG9ydCB7IFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHRcIjtcblxuLy8gRGlzcGxheXMgdGhlIGdpdmVuIGVycm9yLlxuLy8gVE9ETyAtIE1ha2UgdGhpcyBhIHBvcC11cCBvciBzb21ldGhpbmcuXG5leHBvcnQgY29uc3QgcmVwb3J0RXJyb3IgPSAoZXJyb3I6IEVycm9yKSA9PiB7XG4gIGNvbnNvbGUubG9nKGVycm9yKTtcbn07XG5cbi8vIFJlcG9ydHMgdGhlIGVycm9yIGlmIHRoZSBnaXZlbiBSZXN1bHQgaXMgbm90IG9rLlxuZXhwb3J0IGNvbnN0IHJlcG9ydE9uRXJyb3IgPSA8VD4ocmV0OiBSZXN1bHQ8VD4pID0+IHtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXBvcnRFcnJvcihyZXQuZXJyb3IpO1xuICB9XG59O1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBsaXZlIH0gZnJvbSBcImxpdC1odG1sL2RpcmVjdGl2ZXMvbGl2ZS5qc1wiO1xuaW1wb3J0IHsgTWV0cmljUmFuZ2UsIGRpc3BsYXlWYWx1ZSB9IGZyb20gXCIuLi9tZXRyaWNzL3JhbmdlXCI7XG5pbXBvcnQgeyBSZW5hbWVNZXRyaWNPcCwgVXBkYXRlTWV0cmljT3AgfSBmcm9tIFwiLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBSZXN1bHQgfSBmcm9tIFwiLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBPcCB9IGZyb20gXCIuLi9vcHMvb3BzXCI7XG5pbXBvcnQgeyBleGVjdXRlT3AgfSBmcm9tIFwiLi4vYWN0aW9uL2V4ZWN1dGVcIjtcbmltcG9ydCB7IHJlcG9ydEVycm9yIH0gZnJvbSBcIi4uL3JlcG9ydC1lcnJvci9yZXBvcnQtZXJyb3JcIjtcbmltcG9ydCB7IFByZWNpc2lvbiB9IGZyb20gXCIuLi9wcmVjaXNpb24vcHJlY2lzaW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBFZGl0TWV0cmljRGVmaW5pdGlvbiBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpbiB8IG51bGwgPSBudWxsO1xuICBtZXRyaWNOYW1lOiBzdHJpbmcgPSBcIlwiO1xuICBwbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFjazogKCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH07XG4gIH1cblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlcigpIHtcbiAgICByZW5kZXIodGhpcy50ZW1wbGF0ZSgpLCB0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGNvbnN0IGRlZm4gPSB0aGlzLmV4cGxhbk1haW4/LnBsYW4ubWV0cmljRGVmaW5pdGlvbnNbdGhpcy5tZXRyaWNOYW1lXTtcbiAgICBpZiAoIWRlZm4pIHtcbiAgICAgIHJldHVybiBodG1sYGA7XG4gICAgfVxuICAgIHJldHVybiBodG1sYDxkaWFsb2c+XG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+TmFtZTwvdGg+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUodGhpcy5tZXRyaWNOYW1lKX1cbiAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4gdGhpcy5uYW1lQ2hhbmdlKGUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPk1pbjwvdGg+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUoZGlzcGxheVZhbHVlKGRlZm4ucmFuZ2UubWluKSl9XG4gICAgICAgICAgICAgID9kaXNhYmxlZD0ke2RlZm4ucmFuZ2UubWluID09PSAtTnVtYmVyLk1BWF9WQUxVRX1cbiAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4gdGhpcy5taW5DaGFuZ2UoZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgID9jaGVja2VkPSR7ZGVmbi5yYW5nZS5taW4gIT09IC1OdW1iZXIuTUFYX1ZBTFVFfVxuICAgICAgICAgICAgICAgIEBjaGFuZ2U9JHsoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMubWluTGltaXRDaGFuZ2UoZSk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgTGltaXQ8L2xhYmVsXG4gICAgICAgICAgICA+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD5NYXg8L3RoPlxuICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAudmFsdWU9JHtsaXZlKGRpc3BsYXlWYWx1ZShkZWZuLnJhbmdlLm1heCkpfVxuICAgICAgICAgICAgICA/ZGlzYWJsZWQ9JHtkZWZuLnJhbmdlLm1heCA9PT0gTnVtYmVyLk1BWF9WQUxVRX1cbiAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4gdGhpcy5tYXhDaGFuZ2UoZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgID9jaGVja2VkPSR7ZGVmbi5yYW5nZS5tYXggIT09IE51bWJlci5NQVhfVkFMVUV9XG4gICAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy5tYXhMaW1pdENoYW5nZShlKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICBMaW1pdDwvbGFiZWxcbiAgICAgICAgICAgID5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPlByZWNpc2lvbjwvdGg+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUoZGVmbi5wcmVjaXNpb24ucHJlY2lzaW9uKX1cbiAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlY2lzaW9uQ2hhbmdlKGUpO1xuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPkRlZmF1bHQ8L3RoPlxuICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAudmFsdWU9JHtsaXZlKGRlZm4uZGVmYXVsdCl9XG4gICAgICAgICAgICAgIEBjaGFuZ2U9JHsoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHRDaGFuZ2UoZSk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICA8L3RhYmxlPlxuICAgICAgPGRpdiBjbGFzcz1cImRpYWxvZy1mb290ZXJcIj5cbiAgICAgICAgPGJ1dHRvbiBAY2xpY2s9JHsoKSA9PiB0aGlzLmNhbmNlbCgpfT5DbG9zZTwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaWFsb2c+YDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZXhlY3V0ZU9wKG9wOiBPcCk6IFByb21pc2U8UmVzdWx0PG51bGw+PiB7XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZU9wKFxuICAgICAgb3AsXG4gICAgICBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLFxuICAgICAgdHJ1ZSxcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiFcbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICB3aW5kb3cuYWxlcnQocmV0LmVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWluTGltaXRDaGFuZ2UoZTogRXZlbnQpIHtcbiAgICBjb25zdCBlbGUgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IGRlZm4gPSB0aGlzLmdldERlZmluaXRpb25Db3B5KCk7XG4gICAgaWYgKGVsZS5jaGVja2VkKSB7XG4gICAgICBjb25zdCBuZXdNaW4gPSAwIDwgZGVmbi5yYW5nZS5tYXggPyAwIDogZGVmbi5yYW5nZS5tYXggLSAxO1xuICAgICAgZGVmbi5yYW5nZSA9IG5ldyBNZXRyaWNSYW5nZShuZXdNaW4sIGRlZm4ucmFuZ2UubWF4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmbi5yYW5nZSA9IG5ldyBNZXRyaWNSYW5nZSgtTnVtYmVyLk1BWF9WQUxVRSwgZGVmbi5yYW5nZS5tYXgpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZU1ldHJpY0RlZmluaXRpb24oZGVmbik7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1heExpbWl0Q2hhbmdlKGU6IEV2ZW50KSB7XG4gICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBkZWZuID0gdGhpcy5nZXREZWZpbml0aW9uQ29weSgpO1xuICAgIGlmIChlbGUuY2hlY2tlZCkge1xuICAgICAgY29uc3QgbmV3TWF4ID0gMTAwID4gZGVmbi5yYW5nZS5taW4gPyAxMDAgOiBkZWZuLnJhbmdlLm1pbiArIDE7XG4gICAgICBkZWZuLnJhbmdlID0gbmV3IE1ldHJpY1JhbmdlKGRlZm4ucmFuZ2UubWluLCBuZXdNYXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZuLnJhbmdlID0gbmV3IE1ldHJpY1JhbmdlKGRlZm4ucmFuZ2UubWluLCBOdW1iZXIuTUFYX1ZBTFVFKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVNZXRyaWNEZWZpbml0aW9uKGRlZm4pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBuYW1lQ2hhbmdlKGU6IEV2ZW50KSB7XG4gICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBvbGROYW1lID0gdGhpcy5tZXRyaWNOYW1lO1xuICAgIGNvbnN0IG5ld05hbWUgPSBlbGUudmFsdWU7XG4gICAgdGhpcy5tZXRyaWNOYW1lID0gbmV3TmFtZTtcbiAgICBjb25zdCByZXQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVPcChSZW5hbWVNZXRyaWNPcChvbGROYW1lLCBuZXdOYW1lKSk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHRoaXMubWV0cmljTmFtZSA9IG9sZE5hbWU7XG4gICAgfVxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGRlZmF1bHRDaGFuZ2UoZTogRXZlbnQpIHtcbiAgICBjb25zdCBlbGUgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IGRlZm4gPSB0aGlzLmdldERlZmluaXRpb25Db3B5KCk7XG4gICAgZGVmbi5kZWZhdWx0ID0gK2VsZS52YWx1ZTtcbiAgICB0aGlzLnVwZGF0ZU1ldHJpY0RlZmluaXRpb24oZGVmbik7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHByZWNpc2lvbkNoYW5nZShlOiBFdmVudCkge1xuICAgIGNvbnN0IGVsZSA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgY29uc3QgZGVmbiA9IHRoaXMuZ2V0RGVmaW5pdGlvbkNvcHkoKTtcbiAgICBkZWZuLnByZWNpc2lvbiA9IG5ldyBQcmVjaXNpb24oK2VsZS52YWx1ZSk7XG4gICAgdGhpcy51cGRhdGVNZXRyaWNEZWZpbml0aW9uKGRlZm4pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBtaW5DaGFuZ2UoZTogRXZlbnQpIHtcbiAgICBjb25zdCBlbGUgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gK2VsZS52YWx1ZTtcbiAgICBjb25zdCBkZWZpbml0aW9uQ29weSA9IHRoaXMuZ2V0RGVmaW5pdGlvbkNvcHkoKTtcbiAgICBkZWZpbml0aW9uQ29weS5yYW5nZSA9IG5ldyBNZXRyaWNSYW5nZShuZXdWYWx1ZSwgZGVmaW5pdGlvbkNvcHkhLnJhbmdlLm1heCk7XG4gICAgdGhpcy51cGRhdGVNZXRyaWNEZWZpbml0aW9uKGRlZmluaXRpb25Db3B5KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWF4Q2hhbmdlKGU6IEV2ZW50KSB7XG4gICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBuZXdWYWx1ZSA9ICtlbGUudmFsdWU7XG4gICAgY29uc3QgZGVmaW5pdGlvbkNvcHkgPSB0aGlzLmdldERlZmluaXRpb25Db3B5KCk7XG4gICAgZGVmaW5pdGlvbkNvcHkucmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoZGVmaW5pdGlvbkNvcHkhLnJhbmdlLm1pbiwgbmV3VmFsdWUpO1xuICAgIHRoaXMudXBkYXRlTWV0cmljRGVmaW5pdGlvbihkZWZpbml0aW9uQ29weSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHVwZGF0ZU1ldHJpY0RlZmluaXRpb24obmV3RGVmOiBNZXRyaWNEZWZpbml0aW9uKSB7XG4gICAgbmV3RGVmLnJhdGlvbmFsaXplKCk7XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5leGVjdXRlT3AoVXBkYXRlTWV0cmljT3AodGhpcy5tZXRyaWNOYW1lLCBuZXdEZWYpKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmVwb3J0RXJyb3IocmV0LmVycm9yKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RGVmaW5pdGlvbkNvcHkoKTogTWV0cmljRGVmaW5pdGlvbiB7XG4gICAgY29uc3QgZGVmbiA9IHRoaXMuZXhwbGFuTWFpbj8ucGxhbi5tZXRyaWNEZWZpbml0aW9uc1t0aGlzLm1ldHJpY05hbWVdO1xuICAgIHJldHVybiBNZXRyaWNEZWZpbml0aW9uLmZyb21KU09OKGRlZm4/LnRvSlNPTigpKTtcbiAgfVxuXG4gIHByaXZhdGUgY2FuY2VsKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLmNsb3NlKCk7XG4gIH1cblxuICBwdWJsaWMgc2hvd01vZGFsKGV4cGxhbk1haW46IEV4cGxhbk1haW4sIG1ldHJpY05hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZXhwbGFuTWFpbiA9IGV4cGxhbk1haW47XG4gICAgdGhpcy5tZXRyaWNOYW1lID0gbWV0cmljTmFtZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLnNob3dNb2RhbCgpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImVkaXQtbWV0cmljLWRlZmluaXRpb25cIiwgRWRpdE1ldHJpY0RlZmluaXRpb24pO1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IGljb24gfSBmcm9tIFwiLi4vaWNvbnMvaWNvbnMudHNcIjtcblxuZXhwb3J0IHR5cGUgRGVwVHlwZSA9IFwicHJlZFwiIHwgXCJzdWNjXCI7XG5cbmV4cG9ydCBjb25zdCBkZXBEaXNwbGF5TmFtZTogUmVjb3JkPERlcFR5cGUsIHN0cmluZz4gPSB7XG4gIHByZWQ6IFwiUHJlZGVjZXNzb3JzXCIsXG4gIHN1Y2M6IFwiU3VjY2Vzc29yc1wiLFxufTtcblxuaW50ZXJmYWNlIERlcGVuZW5jeUV2ZW50IHtcbiAgdGFza0luZGV4OiBudW1iZXI7XG4gIGRlcFR5cGU6IERlcFR5cGU7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJkZWxldGUtZGVwZW5kZW5jeVwiOiBDdXN0b21FdmVudDxEZXBlbmVuY3lFdmVudD47XG4gICAgXCJhZGQtZGVwZW5kZW5jeVwiOiBDdXN0b21FdmVudDxEZXBlbmVuY3lFdmVudD47XG4gIH1cbn1cblxuY29uc3Qga2luZFRlbXBsYXRlID0gKFxuICBkZXBlbmRlbmNpZXNDb250cm9sOiBEZXBlbmRlbmNpZXNQYW5lbCxcbiAgZGVwVHlwZTogRGVwVHlwZSxcbiAgaW5kZXhlczogbnVtYmVyW11cbik6IFRlbXBsYXRlUmVzdWx0ID0+IGh0bWxgXG4gIDx0cj5cbiAgICA8dGg+JHtkZXBEaXNwbGF5TmFtZVtkZXBUeXBlXX08L3RoPlxuICAgIDx0aD48L3RoPlxuICA8L3RyPlxuICAke2luZGV4ZXMubWFwKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSBkZXBlbmRlbmNpZXNDb250cm9sLnRhc2tzW3Rhc2tJbmRleF07XG4gICAgcmV0dXJuIGh0bWxgPHRyPlxuICAgICAgPHRkPiR7dGFzay5uYW1lfTwvdGQ+XG4gICAgICA8dGQ+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICB0aXRsZT1cIkRlbGV0ZSB0aGUgZGVwZW5kZW5jeSBvbiAke3Rhc2submFtZX1cIlxuICAgICAgICAgIEBjbGljaz0keygpID0+IGRlcGVuZGVuY2llc0NvbnRyb2wuZGVsZXRlRGVwKHRhc2tJbmRleCwgZGVwVHlwZSl9XG4gICAgICAgID5cbiAgICAgICAgICAke2ljb24oXCJkZWxldGUtaWNvblwiKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L3RkPlxuICAgIDwvdHI+YDtcbiAgfSl9XG4gIDx0cj5cbiAgICA8dGQ+PC90ZD5cbiAgICA8dGQ+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIGNsYXNzPVwiaWNvbi1idXR0b25cIlxuICAgICAgICBAY2xpY2s9JHsoKSA9PiBkZXBlbmRlbmNpZXNDb250cm9sLmFkZERlcChkZXBUeXBlKX1cbiAgICAgICAgdGl0bGU9XCJBZGQgZGVwZW5kZW5jeS5cIlxuICAgICAgPlxuICAgICAgICAke2ljb24oXCJhZGQtaWNvblwiKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvdGQ+XG4gIDwvdHI+XG5gO1xuXG5jb25zdCB0ZW1wbGF0ZSA9IChcbiAgZGVwZW5kZW5jaWVzQ29udHJvbDogRGVwZW5kZW5jaWVzUGFuZWxcbik6IFRlbXBsYXRlUmVzdWx0ID0+IGh0bWxgXG4gIDx0YWJsZT5cbiAgICAke2tpbmRUZW1wbGF0ZShcbiAgICAgIGRlcGVuZGVuY2llc0NvbnRyb2wsXG4gICAgICBcInByZWRcIixcbiAgICAgIGRlcGVuZGVuY2llc0NvbnRyb2wucHJlZEluZGV4ZXNcbiAgICApfVxuICAgICR7a2luZFRlbXBsYXRlKFxuICAgICAgZGVwZW5kZW5jaWVzQ29udHJvbCxcbiAgICAgIFwic3VjY1wiLFxuICAgICAgZGVwZW5kZW5jaWVzQ29udHJvbC5zdWNjSW5kZXhlc1xuICAgICl9XG4gIDwvdGFibGU+XG5gO1xuXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jaWVzUGFuZWwgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIHRhc2tzOiBUYXNrW10gPSBbXTtcbiAgcHJlZEluZGV4ZXM6IG51bWJlcltdID0gW107XG4gIHN1Y2NJbmRleGVzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBwdWJsaWMgc2V0VGFza3NBbmRJbmRpY2VzKFxuICAgIHRhc2tzOiBUYXNrW10sXG4gICAgcHJlZEluZGV4ZXM6IG51bWJlcltdLFxuICAgIHN1Y2NJbmRleGVzOiBudW1iZXJbXVxuICApIHtcbiAgICB0aGlzLnRhc2tzID0gdGFza3M7XG4gICAgdGhpcy5wcmVkSW5kZXhlcyA9IHByZWRJbmRleGVzO1xuICAgIHRoaXMuc3VjY0luZGV4ZXMgPSBzdWNjSW5kZXhlcztcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgcHVibGljIGRlbGV0ZURlcCh0YXNrSW5kZXg6IG51bWJlciwgZGVwVHlwZTogRGVwVHlwZSkge1xuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgIG5ldyBDdXN0b21FdmVudChcImRlbGV0ZS1kZXBlbmRlbmN5XCIsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgZGVwVHlwZTogZGVwVHlwZSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBhZGREZXAoZGVwVHlwZTogRGVwVHlwZSkge1xuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgIG5ldyBDdXN0b21FdmVudChcImFkZC1kZXBlbmRlbmN5XCIsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgdGFza0luZGV4OiAtMSxcbiAgICAgICAgICBkZXBUeXBlOiBkZXBUeXBlLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImRlcGVuZGVuY2llcy1wYW5lbFwiLCBEZXBlbmRlbmNpZXNQYW5lbCk7XG4iLCAiaW1wb3J0IHtcbiAgVmVydGV4LFxuICBWZXJ0ZXhJbmRpY2VzLFxuICBEaXJlY3RlZEVkZ2UsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbiAgZWRnZXNCeURzdFRvTWFwLFxufSBmcm9tIFwiLi4vZGFnXCI7XG5cbi8qKiBBIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGFwcGxpZWQgdG8gYSBWZXJ0ZXgsIHVzZWQgaW4gbGF0ZXIgZnVuY3Rpb25zIGxpa2VcbkRlcHRoIEZpcnN0IFNlYXJjaCB0byBkbyB3b3JrIG9uIGV2ZXJ5IFZlcnRleCBpbiBhIERpcmVjdGVkR3JhcGguXG4gKi9cbmV4cG9ydCB0eXBlIHZlcnRleEZ1bmN0aW9uID0gKHY6IFZlcnRleCwgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbjtcblxuLyoqIFJldHVybnMgdGhlIGluZGV4IG9mIGFsbCBWZXJ0aWNlcyB0aGF0IGhhdmUgbm8gaW5jb21pbmcgZWRnZS5cbiAqL1xuZXhwb3J0IGNvbnN0IHNldE9mVmVydGljZXNXaXRoTm9JbmNvbWluZ0VkZ2UgPSAoXG4gIGc6IERpcmVjdGVkR3JhcGgsXG4pOiBWZXJ0ZXhJbmRpY2VzID0+IHtcbiAgY29uc3Qgbm9kZXNXaXRoSW5jb21pbmdFZGdlcyA9IGVkZ2VzQnlEc3RUb01hcChnLkVkZ2VzKTtcbiAgY29uc3QgcmV0OiBWZXJ0ZXhJbmRpY2VzID0gW107XG4gIGcuVmVydGljZXMuZm9yRWFjaCgoXzogVmVydGV4LCBpOiBudW1iZXIpID0+IHtcbiAgICBpZiAoIW5vZGVzV2l0aEluY29taW5nRWRnZXMuaGFzKGkpKSB7XG4gICAgICByZXQucHVzaChpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcblxuLyoqIERlc2NlbmRzIHRoZSBncmFwaCBpbiBEZXB0aCBGaXJzdCBTZWFyY2ggYW5kIGFwcGxpZXMgdGhlIGZ1bmN0aW9uIGBmYCB0b1xuZWFjaCBub2RlLlxuICovXG5leHBvcnQgY29uc3QgZGVwdGhGaXJzdFNlYXJjaCA9IChnOiBEaXJlY3RlZEdyYXBoLCBmOiB2ZXJ0ZXhGdW5jdGlvbikgPT4ge1xuICBzZXRPZlZlcnRpY2VzV2l0aE5vSW5jb21pbmdFZGdlKGcpLmZvckVhY2goKHZlcnRleEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBkZXB0aEZpcnN0U2VhcmNoRnJvbUluZGV4KGcsIHZlcnRleEluZGV4LCBmKTtcbiAgfSk7XG59O1xuXG4vKiogRGVwdGggRmlyc3QgU2VhcmNoIHN0YXJ0aW5nIGF0IFZlcnRleCBgc3RhcnRfaW5kZXhgLiAqL1xuZXhwb3J0IGNvbnN0IGRlcHRoRmlyc3RTZWFyY2hGcm9tSW5kZXggPSAoXG4gIGc6IERpcmVjdGVkR3JhcGgsXG4gIHN0YXJ0X2luZGV4OiBudW1iZXIsXG4gIGY6IHZlcnRleEZ1bmN0aW9uLFxuKSA9PiB7XG4gIGNvbnN0IGVkZ2VzQnlTcmMgPSBlZGdlc0J5U3JjVG9NYXAoZy5FZGdlcyk7XG5cbiAgY29uc3QgdmlzaXQgPSAodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGlmIChmKGcuVmVydGljZXNbdmVydGV4SW5kZXhdLCB2ZXJ0ZXhJbmRleCkgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5leHQgPSBlZGdlc0J5U3JjLmdldCh2ZXJ0ZXhJbmRleCk7XG4gICAgaWYgKG5leHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBuZXh0LmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgdmlzaXQoZS5qKTtcbiAgICB9KTtcbiAgfTtcblxuICB2aXNpdChzdGFydF9pbmRleCk7XG59O1xuIiwgImltcG9ydCB7XG4gIERpcmVjdGVkRWRnZSxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeURzdFRvTWFwLFxuICBlZGdlc0J5U3JjVG9NYXAsXG59IGZyb20gXCIuLi9kYWdcIjtcbmltcG9ydCB7IGRlcHRoRmlyc3RTZWFyY2hGcm9tSW5kZXggfSBmcm9tIFwiLi9kZnNcIjtcblxuLyoqIFJldHVybnMgdGhlIGluZGljZXMgb2YgYWxsIHRoZSBzdWNjZXNzb3JzIG9mIHRoZSB0YXNrIGF0IHRoZSBnaXZlbiBpbmRleC5cbiAqICBOb3RlIHRoYXQgaW5jbHVkZXMgdGhlIGdpdmVuIGluZGV4IGl0c2VsZi5cbiAqL1xuZXhwb3J0IGNvbnN0IGFsbFN1Y2Nlc3NvcnMgPSAoXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoXG4pOiBudW1iZXJbXSA9PiB7XG4gIGlmICh0YXNrSW5kZXggPj0gZGlyZWN0ZWRHcmFwaC5WZXJ0aWNlcy5sZW5ndGggLSAxIHx8IHRhc2tJbmRleCA8PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IGFsbENoaWxkcmVuOiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoKTtcbiAgZGVwdGhGaXJzdFNlYXJjaEZyb21JbmRleChcbiAgICBkaXJlY3RlZEdyYXBoLFxuICAgIHRhc2tJbmRleCxcbiAgICAoXzogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBhbGxDaGlsZHJlbi5hZGQoaW5kZXgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICApO1xuICBhbGxDaGlsZHJlbi5kZWxldGUoZGlyZWN0ZWRHcmFwaC5WZXJ0aWNlcy5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIFsuLi5hbGxDaGlsZHJlbi52YWx1ZXMoKV07XG59O1xuXG5leHBvcnQgY29uc3QgYWxsUHJlZGVjZXNzb3JzID0gKFxuICB0YXNrSW5kZXg6IG51bWJlcixcbiAgZGlyZWN0ZWRHcmFwaDogRGlyZWN0ZWRHcmFwaFxuKTogbnVtYmVyW10gPT4ge1xuICBpZiAodGFza0luZGV4ID49IGRpcmVjdGVkR3JhcGguVmVydGljZXMubGVuZ3RoIC0gMSB8fCB0YXNrSW5kZXggPD0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCBwcmVkZWNlc3NvcnNUb0NoZWNrID0gW3Rhc2tJbmRleF07XG4gIGNvbnN0IHJldDogU2V0PG51bWJlcj4gPSBuZXcgU2V0KCk7XG4gIGNvbnN0IGJ5RGVzdCA9IGVkZ2VzQnlEc3RUb01hcChkaXJlY3RlZEdyYXBoLkVkZ2VzKTtcbiAgd2hpbGUgKHByZWRlY2Vzc29yc1RvQ2hlY2subGVuZ3RoICE9PSAwKSB7XG4gICAgY29uc3Qgbm9kZSA9IHByZWRlY2Vzc29yc1RvQ2hlY2sucG9wKCkhO1xuICAgIHJldC5hZGQobm9kZSk7XG4gICAgY29uc3QgcHJlZGVjZXNzb3JzID0gYnlEZXN0LmdldChub2RlKTtcbiAgICBpZiAocHJlZGVjZXNzb3JzKSB7XG4gICAgICBwcmVkZWNlc3NvcnNUb0NoZWNrLnB1c2goLi4ucHJlZGVjZXNzb3JzLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLmkpKTtcbiAgICB9XG4gIH1cbiAgcmV0LmRlbGV0ZSgwKTtcbiAgcmV0dXJuIFsuLi5yZXQudmFsdWVzKCldO1xufTtcblxuLyoqIFJldHVybnMgdGhlIGluZGljZXMgb2YgYWxsIHRoZSB0YXNrcyBpbiB0aGUgZ3JhcGgsIGV4cGVjdCB0aGUgZmlyc3QgYW5kIHRoZVxuICogIGxhc3QuICovXG5leHBvcnQgY29uc3QgYWxsVGFza3MgPSAoZGlyZWN0ZWRHcmFwaDogRGlyZWN0ZWRHcmFwaCk6IG51bWJlcltdID0+IHtcbiAgY29uc3QgcmV0ID0gW107XG4gIGZvciAobGV0IGluZGV4ID0gMTsgaW5kZXggPCBkaXJlY3RlZEdyYXBoLlZlcnRpY2VzLmxlbmd0aCAtIDE7IGluZGV4KyspIHtcbiAgICByZXQucHVzaChpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCBjb25zdCBkaWZmZXJlbmNlID0gKGE6IG51bWJlcltdLCBiOiBudW1iZXJbXSk6IG51bWJlcltdID0+IHtcbiAgY29uc3QgYlNldCA9IG5ldyBTZXQoYik7XG4gIHJldHVybiBhLmZpbHRlcigoaTogbnVtYmVyKSA9PiBiU2V0LmhhcyhpKSA9PT0gZmFsc2UpO1xufTtcblxuZXhwb3J0IGNvbnN0IGFsbFBvdGVudGlhbFN1Y2Nlc3NvcnMgPSAoXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoXG4pOiBudW1iZXJbXSA9PiB7XG4gIC8vIFJlbW92ZSBhbGwgZGlyZWN0IHN1Y2Nlc3NvcnMgYWxzby5cbiAgY29uc3QgYnlTcmMgPSBlZGdlc0J5U3JjVG9NYXAoZGlyZWN0ZWRHcmFwaC5FZGdlcyk7XG4gIGNvbnN0IGRpcmVjdFN1Y2MgPSBieVNyYy5nZXQodGFza0luZGV4KSB8fCBbXTtcbiAgY29uc3QgZGlyZWN0U3VjY0FycmF5ID0gZGlyZWN0U3VjYy5tYXAoKGU6IERpcmVjdGVkRWRnZSkgPT4gZS5qKTtcblxuICByZXR1cm4gZGlmZmVyZW5jZShhbGxUYXNrcyhkaXJlY3RlZEdyYXBoKSwgW1xuICAgIC4uLmFsbFByZWRlY2Vzc29ycyh0YXNrSW5kZXgsIGRpcmVjdGVkR3JhcGgpLFxuICAgIC4uLmRpcmVjdFN1Y2NBcnJheSxcbiAgXSk7XG59O1xuXG5leHBvcnQgY29uc3QgYWxsUG90ZW50aWFsUHJlZGVjZXNzb3JzID0gKFxuICB0YXNrSW5kZXg6IG51bWJlcixcbiAgZGlyZWN0ZWRHcmFwaDogRGlyZWN0ZWRHcmFwaFxuKTogbnVtYmVyW10gPT4ge1xuICAvLyBSZW1vdmUgYWxsIGRpcmVjdCBwcmVkZWNlc3NvcnMgYWxzby5cbiAgY29uc3QgYnlEZXN0ID0gZWRnZXNCeURzdFRvTWFwKGRpcmVjdGVkR3JhcGguRWRnZXMpO1xuICBjb25zdCBkaXJlY3RQcmVkID0gYnlEZXN0LmdldCh0YXNrSW5kZXgpIHx8IFtdO1xuICBjb25zdCBkaXJlY3RQcmVkQXJyYXkgPSBkaXJlY3RQcmVkLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLmkpO1xuICBjb25zdCBhbGxTdWNjID0gYWxsU3VjY2Vzc29ycyh0YXNrSW5kZXgsIGRpcmVjdGVkR3JhcGgpO1xuICBjb25zdCBhbGwgPSBhbGxUYXNrcyhkaXJlY3RlZEdyYXBoKTtcbiAgY29uc3QgdG9CZVN1YnRyYWN0ZWQgPSBbLi4uYWxsU3VjYywgLi4uZGlyZWN0UHJlZEFycmF5XTtcbiAgcmV0dXJuIGRpZmZlcmVuY2UoYWxsLCB0b0JlU3VidHJhY3RlZCk7XG59O1xuIiwgImltcG9ydCB7IFRhc2tTZWFyY2hDb250cm9sIH0gZnJvbSBcIi4uL3NlYXJjaC90YXNrLXNlYXJjaC1jb250cm9sc1wiO1xuaW1wb3J0IHsgQ2hhcnQgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnRcIjtcbmltcG9ydCB7IERlcFR5cGUsIGRlcERpc3BsYXlOYW1lIH0gZnJvbSBcIi4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmNpZXMtcGFuZWxcIjtcbmltcG9ydCB7XG4gIGFsbFBvdGVudGlhbFN1Y2Nlc3NvcnMsXG4gIGFsbFBvdGVudGlhbFByZWRlY2Vzc29ycyxcbn0gZnJvbSBcIi4uL2RhZy9hbGdvcml0aG1zL2NpcmN1bGFyXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGREZXBlbmRlbmN5RGlhbG9nIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBwcml2YXRlIHRpdGxlRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSB0YXNrU2VhcmNoQ29udHJvbDogVGFza1NlYXJjaENvbnRyb2wgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBkaWFsb2c6IEhUTUxEaWFsb2dFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcmVzb2x2ZTogKHZhbHVlOiBudW1iZXIgfCB1bmRlZmluZWQpID0+IHZvaWQgPSAoKSA9PiB7fTtcblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICB0aGlzLnRpdGxlRWxlbWVudCA9IHRoaXMucXVlcnlTZWxlY3RvcihcImgyXCIpITtcbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sID0gdGhpcy5xdWVyeVNlbGVjdG9yKFwidGFzay1zZWFyY2gtY29udHJvbFwiKSE7XG4gICAgdGhpcy5kaWFsb2cgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJkaWFsb2dcIikhO1xuICAgIHRoaXMuZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoXCJjYW5jZWxcIiwgKCkgPT4gdGhpcy5yZXNvbHZlKHVuZGVmaW5lZCkpO1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2wuYWRkRXZlbnRMaXN0ZW5lcihcInRhc2stY2hhbmdlXCIsIChlKSA9PiB7XG4gICAgICB0aGlzLmRpYWxvZyEuY2xvc2UoKTtcbiAgICAgIHRoaXMucmVzb2x2ZShlLmRldGFpbC50YXNrSW5kZXgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFBvcHVsYXRlcyB0aGUgZGlhbG9nIGFuZCBzaG93cyBpdCBhcyBhIE1vZGFsIGRpYWxvZyBhbmQgcmV0dXJucyBhIFByb21pc2VcbiAgICogIHRoYXQgcmVzb2x2ZXMgb24gc3VjY2VzcyB0byBhIHRhc2tJbmRleCwgb3IgdW5kZWZpbmVkIGlmIHRoZSB1c2VyXG4gICAqICBjYW5jZWxsZWQgb3V0IG9mIHRoZSBmbG93LlxuICAgKi9cbiAgcHVibGljIHNlbGVjdERlcGVuZGVuY3koXG4gICAgY2hhcnQ6IENoYXJ0LFxuICAgIHRhc2tJbmRleDogbnVtYmVyLFxuICAgIGRlcFR5cGU6IERlcFR5cGVcbiAgKTogUHJvbWlzZTxudW1iZXIgfCB1bmRlZmluZWQ+IHtcbiAgICB0aGlzLnRpdGxlRWxlbWVudCEudGV4dENvbnRlbnQgPSBkZXBEaXNwbGF5TmFtZVtkZXBUeXBlXTtcblxuICAgIGxldCBpbmNsdWRlZEluZGV4ZXMgPSBbXTtcbiAgICBpZiAoZGVwVHlwZSA9PT0gXCJwcmVkXCIpIHtcbiAgICAgIGluY2x1ZGVkSW5kZXhlcyA9IGFsbFBvdGVudGlhbFByZWRlY2Vzc29ycyh0YXNrSW5kZXgsIGNoYXJ0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5jbHVkZWRJbmRleGVzID0gYWxsUG90ZW50aWFsU3VjY2Vzc29ycyh0YXNrSW5kZXgsIGNoYXJ0KTtcbiAgICB9XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEudGFza3MgPSBjaGFydC5WZXJ0aWNlcztcbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sIS5pbmNsdWRlZEluZGV4ZXMgPSBpbmNsdWRlZEluZGV4ZXM7XG5cbiAgICAvLyBUT0RPIC0gQWxsb3cgYm90aCB0eXBlcyBvZiBzZWFyY2ggaW4gdGhlIGRlcGVuZGVuY3kgZGlhbG9nLlxuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLnNldEtleWJvYXJkRm9jdXNUb0lucHV0KFwibmFtZS1vbmx5XCIpO1xuICAgIGNvbnN0IHJldCA9IG5ldyBQcm9taXNlPG51bWJlciB8IHVuZGVmaW5lZD4oKHJlc29sdmUsIF9yZWplY3QpID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICB0aGlzLmRpYWxvZyEuc2hvd01vZGFsKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJhZGQtZGVwZW5kZW5jeS1kaWFsb2dcIiwgQWRkRGVwZW5kZW5jeURpYWxvZyk7XG4iLCAiaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHsgQWRkUmVzb3VyY2VPcCwgRGVsZXRlUmVzb3VyY2VPcCB9IGZyb20gXCIuLi9vcHMvcmVzb3VyY2VzXCI7XG5pbXBvcnQgeyBleGVjdXRlT3AgfSBmcm9tIFwiLi4vYWN0aW9uL2V4ZWN1dGVcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBFZGl0UmVzb3VyY2VEZWZpbml0aW9uIH0gZnJvbSBcIi4uL2VkaXQtcmVzb3VyY2UtZGVmaW5pdGlvbi9lZGl0LXJlc291cmNlLWRlZmluaXRpb25cIjtcbmltcG9ydCB7IGljb24gfSBmcm9tIFwiLi4vaWNvbnMvaWNvbnNcIjtcblxuLy8gTG9uZ2VzdCByZXByZXNlbnRhdGlvbiB3ZSdsbCBzaG93IGZvciBhbGwgdGhlIG9wdGlvbnMgb2YgYSBSZXNvdXJjZS5cbmNvbnN0IE1BWF9TSE9SVF9TVFJJTkcgPSA4MDtcblxuZXhwb3J0IGNsYXNzIEVkaXRSZXNvdXJjZXNEaWFsb2cgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW4gfCBudWxsID0gbnVsbDtcbiAgcGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2s6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuZXhwbGFuTWFpbiAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBzaG93TW9kYWwoZXhwbGFuTWFpbjogRXhwbGFuTWFpbikge1xuICAgIHRoaXMuZXhwbGFuTWFpbiA9IGV4cGxhbk1haW47XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5zaG93TW9kYWwoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyKCkge1xuICAgIHJlbmRlcih0aGlzLnRlbXBsYXRlKCksIHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSB2YWx1ZXNUb1Nob3J0U3RyaW5nKHZhbHVlczogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgIGxldCByZXQgPSB2YWx1ZXMuam9pbihcIiwgXCIpO1xuICAgIGlmIChyZXQubGVuZ3RoID4gTUFYX1NIT1JUX1NUUklORykge1xuICAgICAgcmV0ID0gcmV0LnNsaWNlKDAsIE1BWF9TSE9SVF9TVFJJTkcpICsgXCIgLi4uXCI7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBwcml2YXRlIGRlbEJ1dHRvbklmTm90U3RhdGljKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBpc1N0YXRpYzogYm9vbGVhblxuICApOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgaWYgKGlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gaHRtbGBgO1xuICAgIH1cbiAgICByZXR1cm4gaHRtbGA8YnV0dG9uXG4gICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgIHRpdGxlPVwiRGVsZXRlIHRoaXMgcmVzb3VyY2UuXCJcbiAgICAgIEBjbGljaz0keygpID0+IHRoaXMuZGVsZXRlUmVzb3VyY2UobmFtZSl9XG4gICAgPlxuICAgICAgJHtpY29uKFwiZGVsZXRlLWljb25cIil9XG4gICAgPC9idXR0b24+YDtcbiAgfVxuXG4gIHByaXZhdGUgZWRpdEJ1dHRvbklmTm90U3RhdGljKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBpc1N0YXRpYzogYm9vbGVhblxuICApOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgaWYgKGlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gaHRtbGBgO1xuICAgIH1cbiAgICByZXR1cm4gaHRtbGA8YnV0dG9uXG4gICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgIHRpdGxlPVwiRWRpdCB0aGUgcmVzb3VyY2UgZGVmaW5pdGlvbi5cIlxuICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5lZGl0UmVzb3VyY2UobmFtZSl9XG4gICAgPlxuICAgICAgJHtpY29uKFwiZWRpdC1pY29uXCIpfVxuICAgIDwvYnV0dG9uPmA7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGRlbGV0ZVJlc291cmNlKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGVPcChcbiAgICAgIERlbGV0ZVJlc291cmNlT3AobmFtZSksXG4gICAgICBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLFxuICAgICAgdHJ1ZSxcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiFcbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9zZSgpIHtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5jbG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBlZGl0UmVzb3VyY2UobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICAgIHRoaXMuZXhwbGFuTWFpbiEucXVlcnlTZWxlY3RvcjxFZGl0UmVzb3VyY2VEZWZpbml0aW9uPihcbiAgICAgIFwiZWRpdC1yZXNvdXJjZS1kZWZpbml0aW9uXCJcbiAgICApIS5zaG93TW9kYWwoXG4gICAgICB0aGlzLmV4cGxhbk1haW4hLFxuICAgICAgbmFtZSxcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiEucGxhbi5yZXNvdXJjZURlZmluaXRpb25zW25hbWVdXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbmV3UmVzb3VyY2UoKSB7XG4gICAgY29uc3QgbmFtZSA9IHdpbmRvdy5wcm9tcHQoXCJSZXNvdXJjZSBuYW1lOlwiLCBcIlwiKTtcbiAgICBpZiAobmFtZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBhd2FpdCBleGVjdXRlT3AoXG4gICAgICBBZGRSZXNvdXJjZU9wKG5hbWUpLFxuICAgICAgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIixcbiAgICAgIHRydWUsXG4gICAgICB0aGlzLmV4cGxhbk1haW4hXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgd2luZG93LmFsZXJ0KHJldC5lcnJvcik7XG4gICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSB0ZW1wbGF0ZSgpOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgY29uc3QgcmQgPSB0aGlzLmV4cGxhbk1haW4hLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucztcbiAgICBjb25zdCBhbGxLZXlzU29ydGVkID0gT2JqZWN0LmtleXMocmQpLnNvcnQoXG4gICAgICAoa2V5QTogc3RyaW5nLCBrZXlCOiBzdHJpbmcpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBhID0gcmRba2V5QV07XG4gICAgICAgIGNvbnN0IGIgPSByZFtrZXlCXTtcbiAgICAgICAgaWYgKGEuaXNTdGF0aWMgPT09IGIuaXNTdGF0aWMpIHtcbiAgICAgICAgICByZXR1cm4ga2V5QS5sb2NhbGVDb21wYXJlKGtleUIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhLmlzU3RhdGljKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuICAgICk7XG5cbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxkaWFsb2c+XG4gICAgICAgIDxoMz5SZXNvdXJjZXM8L2gzPlxuICAgICAgICA8dGFibGU+XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRoPk5hbWU8L3RoPlxuICAgICAgICAgICAgPHRoPlZhbHVlczwvdGg+XG4gICAgICAgICAgICA8dGg+RGVsZXRlPC90aD5cbiAgICAgICAgICAgIDx0aD5FZGl0PC90aD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgICR7YWxsS2V5c1NvcnRlZC5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRlZm4gPSByZFtuYW1lXTtcbiAgICAgICAgICAgIHJldHVybiBodG1sYDx0cj5cbiAgICAgICAgICAgICAgPHRkPiR7bmFtZX08L3RkPlxuICAgICAgICAgICAgICA8dGQ+JHt0aGlzLnZhbHVlc1RvU2hvcnRTdHJpbmcoZGVmbi52YWx1ZXMpfTwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD4ke3RoaXMuZGVsQnV0dG9uSWZOb3RTdGF0aWMobmFtZSwgZGVmbi5pc1N0YXRpYyl9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPiR7dGhpcy5lZGl0QnV0dG9uSWZOb3RTdGF0aWMobmFtZSwgZGVmbi5pc1N0YXRpYyl9PC90ZD5cbiAgICAgICAgICAgIDwvdHI+YDtcbiAgICAgICAgICB9KX1cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICB0aXRsZT1cIkFkZCBhIG5ldyBSZXNvdXJjZS5cIlxuICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMubmV3UmVzb3VyY2UoKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgJHtpY29uKFwiYWRkLWljb25cIil9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZGlhbG9nLWZvb3RlclwiPlxuICAgICAgICAgIDxidXR0b24gQGNsaWNrPSR7KCkgPT4gdGhpcy5jbG9zZSgpfT5DbG9zZTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGlhbG9nPlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwiZWRpdC1yZXNvdXJjZXMtZGlhbG9nXCIsIEVkaXRSZXNvdXJjZXNEaWFsb2cpO1xuIiwgImltcG9ydCB7XG4gIFZlcnRleCxcbiAgVmVydGV4SW5kaWNlcyxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeVNyY1RvTWFwLFxufSBmcm9tIFwiLi4vZGFnLnRzXCI7XG5cbi8qKlxuVGhlIHJldHVybiB0eXBlIGZvciB0aGUgVG9wbG9naWNhbFNvcnQgZnVuY3Rpb24uIFxuICovXG50eXBlIFRTUmV0dXJuID0ge1xuICBoYXNDeWNsZXM6IGJvb2xlYW47XG5cbiAgY3ljbGU6IFZlcnRleEluZGljZXM7XG5cbiAgb3JkZXI6IFZlcnRleEluZGljZXM7XG59O1xuXG4vKipcblJldHVybnMgYSB0b3BvbG9naWNhbCBzb3J0IG9yZGVyIGZvciBhIERpcmVjdGVkR3JhcGgsIG9yIHRoZSBtZW1iZXJzIG9mIGEgY3ljbGUgaWYgYVxudG9wb2xvZ2ljYWwgc29ydCBjYW4ndCBiZSBkb25lLlxuIFxuIFRoZSB0b3BvbG9naWNhbCBzb3J0IGNvbWVzIGZyb206XG5cbiAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ub3BvbG9naWNhbF9zb3J0aW5nI0RlcHRoLWZpcnN0X3NlYXJjaFxuXG5MIFx1MjE5MCBFbXB0eSBsaXN0IHRoYXQgd2lsbCBjb250YWluIHRoZSBzb3J0ZWQgbm9kZXNcbndoaWxlIGV4aXN0cyBub2RlcyB3aXRob3V0IGEgcGVybWFuZW50IG1hcmsgZG9cbiAgICBzZWxlY3QgYW4gdW5tYXJrZWQgbm9kZSBuXG4gICAgdmlzaXQobilcblxuZnVuY3Rpb24gdmlzaXQobm9kZSBuKVxuICAgIGlmIG4gaGFzIGEgcGVybWFuZW50IG1hcmsgdGhlblxuICAgICAgICByZXR1cm5cbiAgICBpZiBuIGhhcyBhIHRlbXBvcmFyeSBtYXJrIHRoZW5cbiAgICAgICAgc3RvcCAgIChncmFwaCBoYXMgYXQgbGVhc3Qgb25lIGN5Y2xlKVxuXG4gICAgbWFyayBuIHdpdGggYSB0ZW1wb3JhcnkgbWFya1xuXG4gICAgZm9yIGVhY2ggbm9kZSBtIHdpdGggYW4gZWRnZSBmcm9tIG4gdG8gbSBkb1xuICAgICAgICB2aXNpdChtKVxuXG4gICAgcmVtb3ZlIHRlbXBvcmFyeSBtYXJrIGZyb20gblxuICAgIG1hcmsgbiB3aXRoIGEgcGVybWFuZW50IG1hcmtcbiAgICBhZGQgbiB0byBoZWFkIG9mIExcblxuICovXG5leHBvcnQgY29uc3QgdG9wb2xvZ2ljYWxTb3J0ID0gKGc6IERpcmVjdGVkR3JhcGgpOiBUU1JldHVybiA9PiB7XG4gIGNvbnN0IHJldDogVFNSZXR1cm4gPSB7XG4gICAgaGFzQ3ljbGVzOiBmYWxzZSxcbiAgICBjeWNsZTogW10sXG4gICAgb3JkZXI6IFtdLFxuICB9O1xuXG4gIGNvbnN0IGVkZ2VNYXAgPSBlZGdlc0J5U3JjVG9NYXAoZy5FZGdlcyk7XG5cbiAgY29uc3Qgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyayA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICBnLlZlcnRpY2VzLmZvckVhY2goKF86IFZlcnRleCwgaW5kZXg6IG51bWJlcikgPT5cbiAgICBub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrLmFkZChpbmRleClcbiAgKTtcblxuICBjb25zdCBoYXNQZXJtYW5lbnRNYXJrID0gKGluZGV4OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gIW5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuaGFzKGluZGV4KTtcbiAgfTtcblxuICBjb25zdCB0ZW1wb3JhcnlNYXJrID0gbmV3IFNldDxudW1iZXI+KCk7XG5cbiAgY29uc3QgdmlzaXQgPSAoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgIGlmIChoYXNQZXJtYW5lbnRNYXJrKGluZGV4KSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICh0ZW1wb3JhcnlNYXJrLmhhcyhpbmRleCkpIHtcbiAgICAgIC8vIFdlIG9ubHkgcmV0dXJuIGZhbHNlIG9uIGZpbmRpbmcgYSBsb29wLCB3aGljaCBpcyBzdG9yZWQgaW5cbiAgICAgIC8vIHRlbXBvcmFyeU1hcmsuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRlbXBvcmFyeU1hcmsuYWRkKGluZGV4KTtcblxuICAgIGNvbnN0IG5leHRFZGdlcyA9IGVkZ2VNYXAuZ2V0KGluZGV4KTtcbiAgICBpZiAobmV4dEVkZ2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV4dEVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGUgPSBuZXh0RWRnZXNbaV07XG4gICAgICAgIGlmICghdmlzaXQoZS5qKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRlbXBvcmFyeU1hcmsuZGVsZXRlKGluZGV4KTtcbiAgICBub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrLmRlbGV0ZShpbmRleCk7XG4gICAgcmV0Lm9yZGVyLnVuc2hpZnQoaW5kZXgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIFdlIHdpbGwgcHJlc3VtZSB0aGF0IFZlcnRleFswXSBpcyB0aGUgc3RhcnQgbm9kZSBhbmQgdGhhdCB3ZSBzaG91bGQgc3RhcnQgdGhlcmUuXG4gIGNvbnN0IG9rID0gdmlzaXQoMCk7XG4gIGlmICghb2spIHtcbiAgICByZXQuaGFzQ3ljbGVzID0gdHJ1ZTtcbiAgICByZXQuY3ljbGUgPSBbLi4udGVtcG9yYXJ5TWFyay5rZXlzKCldO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQge1xuICBWZXJ0ZXhJbmRpY2VzLFxuICBFZGdlcyxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeVNyY1RvTWFwLFxuICBlZGdlc0J5RHN0VG9NYXAsXG4gIERpcmVjdGVkRWRnZSxcbiAgRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL2RhZy9kYWdcIjtcblxuaW1wb3J0IHsgdG9wb2xvZ2ljYWxTb3J0IH0gZnJvbSBcIi4uL2RhZy9hbGdvcml0aG1zL3RvcG9zb3J0LnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNWYWx1ZXMgfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBUYXNrRHVyYXRpb24gfSBmcm9tIFwiLi4vdHlwZXMvdHlwZXMudHNcIjtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfVEFTS19OQU1FID0gXCJUYXNrIE5hbWVcIjtcblxuZXhwb3J0IGludGVyZmFjZSBUYXNrU2VyaWFsaXplZCB7XG4gIHJlc291cmNlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbiAgbWV0cmljczogTWV0cmljVmFsdWVzO1xuICBuYW1lOiBzdHJpbmc7XG4gIGlkOiBzdHJpbmc7XG59XG5cbi8vIERvIHdlIGNyZWF0ZSBzdWItY2xhc3NlcyBhbmQgdGhlbiBzZXJpYWxpemUgc2VwYXJhdGVseT8gT3IgZG8gd2UgaGF2ZSBhXG4vLyBjb25maWcgYWJvdXQgd2hpY2ggdHlwZSBvZiBEdXJhdGlvblNhbXBsZXIgaXMgYmVpbmcgdXNlZD9cbi8vXG4vLyBXZSBjYW4gdXNlIHRyYWRpdGlvbmFsIG9wdGltaXN0aWMvcGVzc2ltaXN0aWMgdmFsdWUuIE9yIEphY29iaWFuJ3Ncbi8vIHVuY2VydGFpbnRseSBtdWx0aXBsaWVycyBbMS4xLCAxLjUsIDIsIDVdIGFuZCB0aGVpciBpbnZlcnNlcyB0byBnZW5lcmF0ZSBhblxuLy8gb3B0aW1pc3RpYyBwZXNzaW1pc3RpYy5cblxuLyoqIFRhc2sgaXMgYSBWZXJ0ZXggd2l0aCBkZXRhaWxzIGFib3V0IHRoZSBUYXNrIHRvIGNvbXBsZXRlLiAqL1xuZXhwb3J0IGNsYXNzIFRhc2sge1xuICAvLyBSZXNvdXJjZSBrZXlzIGFuZCB2YWx1ZXMuIFRoZSBwYXJlbnQgcGxhbiBjb250YWlucyBhbGwgdGhlIHJlc291cmNlXG4gIC8vIGRlZmluaXRpb25zLlxuICByZXNvdXJjZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG4gIG1ldHJpY3M6IE1ldHJpY1ZhbHVlcztcbiAgbmFtZTogc3RyaW5nO1xuICBpZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9IFwiXCIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8IERFRkFVTFRfVEFTS19OQU1FO1xuICAgIHRoaXMubWV0cmljcyA9IHt9O1xuICAgIHRoaXMucmVzb3VyY2VzID0ge307XG4gICAgdGhpcy5pZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gIH1cblxuICB0b0pTT04oKTogVGFza1NlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICByZXNvdXJjZXM6IHRoaXMucmVzb3VyY2VzLFxuICAgICAgbWV0cmljczogdGhpcy5tZXRyaWNzLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSlNPTih0YXNrU2VyaWFsaXplZDogVGFza1NlcmlhbGl6ZWQpOiBUYXNrIHtcbiAgICBjb25zdCByZXQgPSBuZXcgVGFzayh0YXNrU2VyaWFsaXplZC5uYW1lKTtcbiAgICByZXQuaWQgPSB0YXNrU2VyaWFsaXplZC5pZDtcbiAgICByZXQucmVzb3VyY2VzID0gdGFza1NlcmlhbGl6ZWQucmVzb3VyY2VzO1xuICAgIHJldC5tZXRyaWNzID0gdGFza1NlcmlhbGl6ZWQubWV0cmljcztcblxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGR1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWV0cmljKFwiRHVyYXRpb25cIikhO1xuICB9XG5cbiAgcHVibGljIHNldCBkdXJhdGlvbih2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRNZXRyaWMoXCJEdXJhdGlvblwiLCB2YWx1ZSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0TWV0cmljKGtleTogc3RyaW5nKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNzW2tleV07XG4gIH1cblxuICBwdWJsaWMgc2V0TWV0cmljKGtleTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5tZXRyaWNzW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVNZXRyaWMoa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5tZXRyaWNzW2tleV07XG4gIH1cblxuICBwdWJsaWMgZ2V0UmVzb3VyY2Uoa2V5OiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlc1trZXldO1xuICB9XG5cbiAgcHVibGljIHNldFJlc291cmNlKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5yZXNvdXJjZXNba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGRlbGV0ZVJlc291cmNlKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMucmVzb3VyY2VzW2tleV07XG4gIH1cblxuICBwdWJsaWMgZHVwKCk6IFRhc2sge1xuICAgIGNvbnN0IHJldCA9IG5ldyBUYXNrKCk7XG4gICAgcmV0LnJlc291cmNlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucmVzb3VyY2VzKTtcbiAgICByZXQubWV0cmljcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMubWV0cmljcyk7XG4gICAgcmV0Lm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUYXNrcyA9IFRhc2tbXTtcblxuZXhwb3J0IGludGVyZmFjZSBDaGFydFNlcmlhbGl6ZWQge1xuICB2ZXJ0aWNlczogVGFza1NlcmlhbGl6ZWRbXTtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVNlcmlhbGl6ZWRbXTtcbn1cblxuLyoqIEEgQ2hhcnQgaXMgYSBEaXJlY3RlZEdyYXBoLCBidXQgd2l0aCBUYXNrcyBmb3IgVmVydGljZXMuICovXG5leHBvcnQgY2xhc3MgQ2hhcnQge1xuICBWZXJ0aWNlczogVGFza3M7XG4gIEVkZ2VzOiBFZGdlcztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zdCBzdGFydCA9IG5ldyBUYXNrKFwiU3RhcnRcIik7XG4gICAgc3RhcnQuc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgMCk7XG4gICAgY29uc3QgZmluaXNoID0gbmV3IFRhc2soXCJGaW5pc2hcIik7XG4gICAgZmluaXNoLnNldE1ldHJpYyhcIkR1cmF0aW9uXCIsIDApO1xuICAgIHRoaXMuVmVydGljZXMgPSBbc3RhcnQsIGZpbmlzaF07XG4gICAgdGhpcy5FZGdlcyA9IFtuZXcgRGlyZWN0ZWRFZGdlKDAsIDEpXTtcbiAgfVxuXG4gIHRvSlNPTigpOiBDaGFydFNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJ0aWNlczogdGhpcy5WZXJ0aWNlcy5tYXAoKHQ6IFRhc2spID0+IHQudG9KU09OKCkpLFxuICAgICAgZWRnZXM6IHRoaXMuRWRnZXMubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUudG9KU09OKCkpLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZnJvbUpTT04oY2hhcnRTZXJpYWxpemVkOiBDaGFydFNlcmlhbGl6ZWQpOiBDaGFydCB7XG4gICAgY29uc3QgcmV0ID0gbmV3IENoYXJ0KCk7XG4gICAgcmV0LlZlcnRpY2VzID0gY2hhcnRTZXJpYWxpemVkLnZlcnRpY2VzLm1hcCgodHM6IFRhc2tTZXJpYWxpemVkKSA9PlxuICAgICAgVGFzay5mcm9tSlNPTih0cylcbiAgICApO1xuICAgIHJldC5FZGdlcyA9IGNoYXJ0U2VyaWFsaXplZC5lZGdlcy5tYXAoXG4gICAgICAoZGlyZWN0ZWRFZGdlU2VyaWFsaXplZDogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCkgPT5cbiAgICAgICAgRGlyZWN0ZWRFZGdlLmZyb21KU09OKGRpcmVjdGVkRWRnZVNlcmlhbGl6ZWQpXG4gICAgKTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFRvcG9sb2dpY2FsT3JkZXIgPSBWZXJ0ZXhJbmRpY2VzO1xuXG5leHBvcnQgdHlwZSBWYWxpZGF0ZVJlc3VsdCA9IFJlc3VsdDxUb3BvbG9naWNhbE9yZGVyPjtcblxuLyoqIFZhbGlkYXRlcyB0aGUgRGlyZWN0ZWRHcmFwaCBjb21wb25lbnQgb2YgYSBDaGFydCBpcyB2YWxpZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZURpcmVjdGVkR3JhcGgoZzogRGlyZWN0ZWRHcmFwaCk6IFZhbGlkYXRlUmVzdWx0IHtcbiAgaWYgKGcuVmVydGljZXMubGVuZ3RoIDwgMikge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIFwiQ2hhcnQgbXVzdCBjb250YWluIGF0IGxlYXN0IHR3byBub2RlLCB0aGUgc3RhcnQgYW5kIGZpbmlzaCB0YXNrcy5cIlxuICAgICk7XG4gIH1cblxuICBjb25zdCBlZGdlc0J5RHN0ID0gZWRnZXNCeURzdFRvTWFwKGcuRWRnZXMpO1xuICBjb25zdCBlZGdlc0J5U3JjID0gZWRnZXNCeVNyY1RvTWFwKGcuRWRnZXMpO1xuXG4gIC8vIFRoZSBmaXJzdCBWZXJ0ZXgsIFRfMCBha2EgdGhlIFN0YXJ0IE1pbGVzdG9uZSwgbXVzdCBoYXZlIDAgaW5jb21pbmcgZWRnZXMuXG4gIGlmIChlZGdlc0J5RHN0LmdldCgwKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFwiVGhlIHN0YXJ0IG5vZGUgKDApIGhhcyBhbiBpbmNvbWluZyBlZGdlLlwiKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfMCBzaG91bGQgaGF2ZSAwIGluY29taW5nIGVkZ2VzLlxuICBmb3IgKGxldCBpID0gMTsgaSA8IGcuVmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeURzdC5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0ICgwKSB0aGF0IGhhcyBubyBpbmNvbWluZyBlZGdlczogJHtpfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlIGxhc3QgVmVydGV4LCBUX2ZpbmlzaCwgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIG11c3QgaGF2ZSAwIG91dGdvaW5nIGVkZ2VzLlxuICBpZiAoZWRnZXNCeVNyYy5nZXQoZy5WZXJ0aWNlcy5sZW5ndGggLSAxKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgXCJUaGUgbGFzdCBub2RlLCB3aGljaCBzaG91bGQgYmUgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIGhhcyBhbiBvdXRnb2luZyBlZGdlLlwiXG4gICAgKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfZmluaXNoIHNob3VsZCBoYXZlIDAgb3V0Z29pbmcgZWRnZXMuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZy5WZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeVNyYy5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0IFRfZmluaXNoIHRoYXQgaGFzIG5vIG91dGdvaW5nIGVkZ2VzOiAke2l9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBudW1WZXJ0aWNlcyA9IGcuVmVydGljZXMubGVuZ3RoO1xuICAvLyBBbmQgYWxsIGVkZ2VzIG1ha2Ugc2Vuc2UsIGkuZS4gdGhleSBhbGwgcG9pbnQgdG8gdmVydGV4ZXMgdGhhdCBleGlzdC5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBnLkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGcuRWRnZXNbaV07XG4gICAgaWYgKFxuICAgICAgZWxlbWVudC5pIDwgMCB8fFxuICAgICAgZWxlbWVudC5pID49IG51bVZlcnRpY2VzIHx8XG4gICAgICBlbGVtZW50LmogPCAwIHx8XG4gICAgICBlbGVtZW50LmogPj0gbnVtVmVydGljZXNcbiAgICApIHtcbiAgICAgIHJldHVybiBlcnJvcihgRWRnZSAke2VsZW1lbnR9IHBvaW50cyB0byBhIG5vbi1leGlzdGVudCBWZXJ0ZXguYCk7XG4gICAgfVxuICB9XG5cbiAgLy8gTm93IHdlIGNvbmZpcm0gdGhhdCB3ZSBoYXZlIGEgRGlyZWN0ZWQgQWN5Y2xpYyBHcmFwaCwgaS5lLiB0aGUgZ3JhcGggaGFzIG5vXG4gIC8vIGN5Y2xlcyBieSBjcmVhdGluZyBhIHRvcG9sb2dpY2FsIHNvcnQgc3RhcnRpbmcgYXQgVF8wXG4gIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmcjRGVwdGgtZmlyc3Rfc2VhcmNoXG4gIGNvbnN0IHRzUmV0ID0gdG9wb2xvZ2ljYWxTb3J0KGcpO1xuICBpZiAodHNSZXQuaGFzQ3ljbGVzKSB7XG4gICAgcmV0dXJuIGVycm9yKGBDaGFydCBoYXMgY3ljbGU6ICR7Wy4uLnRzUmV0LmN5Y2xlXS5qb2luKFwiLCBcIil9YCk7XG4gIH1cblxuICByZXR1cm4gb2sodHNSZXQub3JkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2hhcnRWYWxpZGF0ZShcbiAgYzogQ2hhcnQsXG4gIHRhc2tEdXJhdGlvbjogVGFza0R1cmF0aW9uIHwgbnVsbCA9IG51bGxcbik6IFZhbGlkYXRlUmVzdWx0IHtcbiAgaWYgKHRhc2tEdXJhdGlvbiA9PT0gbnVsbCkge1xuICAgIHRhc2tEdXJhdGlvbiA9ICh0YXNrSW5kZXg6IG51bWJlcikgPT4gYy5WZXJ0aWNlc1t0YXNrSW5kZXhdLmR1cmF0aW9uO1xuICB9XG4gIGNvbnN0IHJldCA9IHZhbGlkYXRlRGlyZWN0ZWRHcmFwaChjKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIGlmICh0YXNrRHVyYXRpb24oMCkgIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgU3RhcnQgTWlsZXN0b25lIG11c3QgaGF2ZSBkdXJhdGlvbiBvZiAwLCBpbnN0ZWFkIGdvdCAke3Rhc2tEdXJhdGlvbigwKX1gXG4gICAgKTtcbiAgfVxuICBpZiAodGFza0R1cmF0aW9uKGMuVmVydGljZXMubGVuZ3RoIC0gMSkgIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgRmluaXNoIE1pbGVzdG9uZSBtdXN0IGhhdmUgZHVyYXRpb24gb2YgMCwgaW5zdGVhZCBnb3QgJHt0YXNrRHVyYXRpb24oXG4gICAgICAgIGMuVmVydGljZXMubGVuZ3RoIC0gMVxuICAgICAgKX1gXG4gICAgKTtcbiAgfVxuICBjb25zdCBhbGxJRHMgPSBuZXcgU2V0KCk7XG4gIGZvciAobGV0IHRhc2tJbmRleCA9IDA7IHRhc2tJbmRleCA8IGMuVmVydGljZXMubGVuZ3RoOyB0YXNrSW5kZXgrKykge1xuICAgIGNvbnN0IHRhc2sgPSBjLlZlcnRpY2VzW3Rhc2tJbmRleF07XG4gICAgaWYgKGFsbElEcy5oYXModGFzay5pZCkpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoYFR3byB0YXNrcyBjb250YWluIHRoZSBzYW1lIElEOiAke3Rhc2suaWR9YCkpO1xuICAgIH1cbiAgICBhbGxJRHMuYWRkKHRhc2suaWQpO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG4iLCAiLyoqXG4gKiBUcmlhbmd1bGFyIGlzIHRoZSBpbnZlcnNlIEN1bXVsYXRpdmUgRGVuc2l0eSBGdW5jdGlvbiAoQ0RGKSBmb3IgdGhlXG4gKiB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ucmlhbmd1bGFyX2Rpc3RyaWJ1dGlvbiNHZW5lcmF0aW5nX3JhbmRvbV92YXJpYXRlc1xuICpcbiAqIFRoZSBpbnZlcnNlIG9mIHRoZSBDREYgaXMgdXNlZnVsIGZvciBnZW5lcmF0aW5nIHNhbXBsZXMgZnJvbSB0aGVcbiAqIGRpc3RyaWJ1dGlvbiwgaS5lLiBwYXNzaW5nIGluIHZhbHVlcyBmcm9tIHRoZSB1bmlmb3JtIGRpc3RyaWJ1dGlvbiBbMCwgMV1cbiAqIHdpbGwgcHJvZHVjZSBzYW1wbGUgdGhhdCBsb29rIGxpa2UgdGhleSBjb21lIGZyb20gdGhlIHRyaWFuZ3VsYXJcbiAqIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKlxuICovXG5cbmV4cG9ydCBjbGFzcyBUcmlhbmd1bGFyIHtcbiAgcHJpdmF0ZSBhOiBudW1iZXI7XG4gIHByaXZhdGUgYjogbnVtYmVyO1xuICBwcml2YXRlIGM6IG51bWJlcjtcbiAgcHJpdmF0ZSBGX2M6IG51bWJlcjtcblxuICAvKiogIFRoZSB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbiBpcyBhIGNvbnRpbnVvdXMgcHJvYmFiaWxpdHkgZGlzdHJpYnV0aW9uIHdpdGhcbiAgbG93ZXIgbGltaXQgYGFgLCB1cHBlciBsaW1pdCBgYmAsIGFuZCBtb2RlIGBjYCwgd2hlcmUgYSA8IGIgYW5kIGEgXHUyMjY0IGMgXHUyMjY0IGIuICovXG4gIGNvbnN0cnVjdG9yKGE6IG51bWJlciwgYjogbnVtYmVyLCBjOiBudW1iZXIpIHtcbiAgICB0aGlzLmEgPSBhO1xuICAgIHRoaXMuYiA9IGI7XG4gICAgdGhpcy5jID0gYztcblxuICAgIC8vIEZfYyBpcyB0aGUgY3V0b2ZmIGluIHRoZSBkb21haW4gd2hlcmUgd2Ugc3dpdGNoIGJldHdlZW4gdGhlIHR3byBoYWx2ZXMgb2ZcbiAgICAvLyB0aGUgdHJpYW5nbGUuXG4gICAgdGhpcy5GX2MgPSAoYyAtIGEpIC8gKGIgLSBhKTtcbiAgfVxuXG4gIC8qKiAgUHJvZHVjZSBhIHNhbXBsZSBmcm9tIHRoZSB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbi4gVGhlIHZhbHVlIG9mICdwJ1xuICAgc2hvdWxkIGJlIGluIFswLCAxLjBdLiAqL1xuICBzYW1wbGUocDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBpZiAocCA8IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH0gZWxzZSBpZiAocCA+IDEuMCkge1xuICAgICAgcmV0dXJuIDEuMDtcbiAgICB9IGVsc2UgaWYgKHAgPCB0aGlzLkZfYykge1xuICAgICAgcmV0dXJuIHRoaXMuYSArIE1hdGguc3FydChwICogKHRoaXMuYiAtIHRoaXMuYSkgKiAodGhpcy5jIC0gdGhpcy5hKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuYiAtIE1hdGguc3FydCgoMSAtIHApICogKHRoaXMuYiAtIHRoaXMuYSkgKiAodGhpcy5iIC0gdGhpcy5jKSlcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHsgVHJpYW5ndWxhciB9IGZyb20gXCIuL3RyaWFuZ3VsYXIudHNcIjtcblxuZXhwb3J0IHR5cGUgVW5jZXJ0YWludHkgPSBcImxvd1wiIHwgXCJtb2RlcmF0ZVwiIHwgXCJoaWdoXCIgfCBcImV4dHJlbWVcIjtcblxuZXhwb3J0IGNvbnN0IFVuY2VydGFpbnR5VG9OdW06IFJlY29yZDxVbmNlcnRhaW50eSwgbnVtYmVyPiA9IHtcbiAgbG93OiAxLjEsXG4gIG1vZGVyYXRlOiAxLjUsXG4gIGhpZ2g6IDIsXG4gIGV4dHJlbWU6IDUsXG59O1xuXG5leHBvcnQgY2xhc3MgSmFjb2JpYW4ge1xuICBwcml2YXRlIHRyaWFuZ3VsYXI6IFRyaWFuZ3VsYXI7XG4gIGNvbnN0cnVjdG9yKGV4cGVjdGVkOiBudW1iZXIsIHVuY2VydGFpbnR5OiBVbmNlcnRhaW50eSkge1xuICAgIGNvbnN0IG11bCA9IFVuY2VydGFpbnR5VG9OdW1bdW5jZXJ0YWludHldO1xuICAgIHRoaXMudHJpYW5ndWxhciA9IG5ldyBUcmlhbmd1bGFyKGV4cGVjdGVkIC8gbXVsLCBleHBlY3RlZCAqIG11bCwgZXhwZWN0ZWQpO1xuICB9XG5cbiAgc2FtcGxlKHA6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudHJpYW5ndWxhci5zYW1wbGUocCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFRhc2ssIENoYXJ0LCBDaGFydFZhbGlkYXRlIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBSb3VuZGVyLCBUYXNrRHVyYXRpb24gfSBmcm9tIFwiLi4vdHlwZXMvdHlwZXMudHNcIjtcblxuLyoqIFNwYW4gcmVwcmVzZW50cyB3aGVuIGEgdGFzayB3aWxsIGJlIGRvbmUsIGkuZS4gaXQgY29udGFpbnMgdGhlIHRpbWUgdGhlIHRhc2tcbiAqIGlzIGV4cGVjdGVkIHRvIGJlZ2luIGFuZCBlbmQuICovXG5leHBvcnQgY2xhc3MgU3BhbiB7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGZpbmlzaDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXJ0OiBudW1iZXIgPSAwLCBmaW5pc2g6IG51bWJlciA9IDApIHtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgdGhpcy5maW5pc2ggPSBmaW5pc2g7XG4gIH1cbn1cblxuLyoqIFRoZSBzdGFuZGFyZCBzbGFjayBjYWxjdWxhdGlvbiB2YWx1ZXMuICovXG5leHBvcnQgY2xhc3MgU2xhY2sge1xuICBlYXJseTogU3BhbiA9IG5ldyBTcGFuKCk7XG4gIGxhdGU6IFNwYW4gPSBuZXcgU3BhbigpO1xuICBzbGFjazogbnVtYmVyID0gMDtcbn1cblxuZXhwb3J0IHR5cGUgU2xhY2tSZXN1bHQgPSBSZXN1bHQ8U2xhY2tbXT47XG5cbmV4cG9ydCB0eXBlIFNsYWNrRWFybHlTdGFydE92ZXJyaWRlID0gKHRhc2tJRDogc3RyaW5nKSA9PiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbi8vIENhbGN1bGF0ZSB0aGUgc2xhY2sgZm9yIGVhY2ggVGFzayBpbiB0aGUgQ2hhcnQuXG5leHBvcnQgZnVuY3Rpb24gQ29tcHV0ZVNsYWNrKFxuICBjOiBDaGFydCxcbiAgdGFza0R1cmF0aW9uOiBUYXNrRHVyYXRpb24gfCBudWxsID0gbnVsbCxcbiAgcm91bmQ6IFJvdW5kZXIsXG4gIG92ZXJyaWRlOiBTbGFja0Vhcmx5U3RhcnRPdmVycmlkZSB8IG51bGwgPSBudWxsXG4pOiBTbGFja1Jlc3VsdCB7XG4gIGlmICh0YXNrRHVyYXRpb24gPT09IG51bGwpIHtcbiAgICB0YXNrRHVyYXRpb24gPSAodGFza0luZGV4OiBudW1iZXIpID0+IGMuVmVydGljZXNbdGFza0luZGV4XS5kdXJhdGlvbjtcbiAgfVxuXG4gIC8vIENyZWF0ZSBhIFNsYWNrIGZvciBlYWNoIFRhc2suXG4gIGNvbnN0IHNsYWNrczogU2xhY2tbXSA9IG5ldyBBcnJheShjLlZlcnRpY2VzLmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYy5WZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgIHNsYWNrc1tpXSA9IG5ldyBTbGFjaygpO1xuICB9XG5cbiAgY29uc3QgciA9IENoYXJ0VmFsaWRhdGUoYywgdGFza0R1cmF0aW9uKTtcbiAgaWYgKCFyLm9rKSB7XG4gICAgcmV0dXJuIGVycm9yKHIuZXJyb3IpO1xuICB9XG5cbiAgY29uc3QgZWRnZXMgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAoYy5FZGdlcyk7XG5cbiAgY29uc3QgdG9wb2xvZ2ljYWxPcmRlciA9IHIudmFsdWU7XG5cbiAgLy8gRmlyc3QgZ28gZm9yd2FyZCB0aHJvdWdoIHRoZSB0b3BvbG9naWNhbCBzb3J0IGFuZCBmaW5kIHRoZSBlYXJseSBzdGFydCBmb3JcbiAgLy8gZWFjaCB0YXNrLCB3aGljaCBpcyB0aGUgbWF4IG9mIGFsbCB0aGUgcHJlZGVjZXNzb3JzIGVhcmx5IGZpbmlzaCB2YWx1ZXMuXG4gIC8vIFNpbmNlIHdlIGtub3cgdGhlIGR1cmF0aW9uIHdlIGNhbiBhbHNvIGNvbXB1dGUgdGhlIGVhcmx5IGZpbmlzaC5cbiAgdG9wb2xvZ2ljYWxPcmRlci5zbGljZSgxKS5mb3JFYWNoKCh2ZXJ0ZXhJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzayA9IGMuVmVydGljZXNbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHNsYWNrID0gc2xhY2tzW3ZlcnRleEluZGV4XTtcbiAgICBzbGFjay5lYXJseS5zdGFydCA9IE1hdGgubWF4KFxuICAgICAgLi4uZWRnZXMuYnlEc3QuZ2V0KHZlcnRleEluZGV4KSEubWFwKChlOiBEaXJlY3RlZEVkZ2UpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBwcmVkZWNlc3NvclNsYWNrID0gc2xhY2tzW2UuaV07XG4gICAgICAgIHJldHVybiBwcmVkZWNlc3NvclNsYWNrLmVhcmx5LmZpbmlzaDtcbiAgICAgIH0pXG4gICAgKTtcbiAgICBjb25zdCBvdmVycmlkZVZhbHVlID0gb3ZlcnJpZGU/Lih0YXNrLmlkKTtcbiAgICBpZiAob3ZlcnJpZGVWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzbGFjay5lYXJseS5zdGFydCA9IG92ZXJyaWRlVmFsdWU7XG4gICAgfVxuICAgIHNsYWNrLmVhcmx5LmZpbmlzaCA9IHJvdW5kKHNsYWNrLmVhcmx5LnN0YXJ0ICsgdGFza0R1cmF0aW9uKHZlcnRleEluZGV4KSk7XG4gIH0pO1xuXG4gIC8vIE5vdyBiYWNrd2FyZHMgdGhyb3VnaCB0aGUgdG9wb2xvZ2ljYWwgc29ydCBhbmQgZmluZCB0aGUgbGF0ZSBmaW5pc2ggb2YgZWFjaFxuICAvLyB0YXNrLCB3aGljaCBpcyB0aGUgbWluIG9mIGFsbCB0aGUgc3VjY2Vzc29yIHRhc2tzIGxhdGUgc3RhcnRzLiBBZ2FpbiBzaW5jZVxuICAvLyB3ZSBrbm93IHRoZSBkdXJhdGlvbiB3ZSBjYW4gYWxzbyBjb21wdXRlIHRoZSBsYXRlIHN0YXJ0LiBGaW5hbGx5LCBzaW5jZSB3ZVxuICAvLyBub3cgaGF2ZSBhbGwgdGhlIGVhcmx5L2xhdGUgYW5kIHN0YXJ0L2ZpbmlzaCB2YWx1ZXMgd2UgY2FuIG5vdyBjYWxjdWF0ZSB0aGVcbiAgLy8gc2xhY2suXG4gIHRvcG9sb2dpY2FsT3JkZXIucmV2ZXJzZSgpLmZvckVhY2goKHZlcnRleEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrID0gYy5WZXJ0aWNlc1t2ZXJ0ZXhJbmRleF07XG4gICAgY29uc3Qgc2xhY2sgPSBzbGFja3NbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHN1Y2Nlc3NvcnMgPSBlZGdlcy5ieVNyYy5nZXQodmVydGV4SW5kZXgpO1xuICAgIGlmICghc3VjY2Vzc29ycykge1xuICAgICAgc2xhY2subGF0ZS5maW5pc2ggPSBzbGFjay5lYXJseS5maW5pc2g7XG4gICAgICBzbGFjay5sYXRlLnN0YXJ0ID0gc2xhY2suZWFybHkuc3RhcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG92ZXJyaWRlVmFsdWUgPSBvdmVycmlkZT8uKHRhc2suaWQpO1xuICAgICAgaWYgKG92ZXJyaWRlVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBTaW5jZSB0aGlzIHRhc2sgaGFzIGJlZW4gc3RhcnRlZCwgd2Ugc2V0IGxhdGVcbiAgICAgICAgLy8gc3RhcnQvZmluaXNoIHRvIGVhcmx5IHN0YXJ0L2ZpbmlzaC5cbiAgICAgICAgc2xhY2subGF0ZSA9IHNsYWNrLmVhcmx5O1xuICAgICAgICBzbGFjay5zbGFjayA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBsYXRlU3RhcnRzID0gZWRnZXMuYnlTcmNcbiAgICAgICAgICAuZ2V0KHZlcnRleEluZGV4KSFcbiAgICAgICAgICAubWFwKChlOiBEaXJlY3RlZEVkZ2UpOiBudW1iZXIgfCBudWxsID0+IHtcbiAgICAgICAgICAgIC8vIE5lZWQgdG8gaWdub3JlIHZhbHVlcyBmcm9tIHN0YXJ0ZWQgdGFza3M/XG4gICAgICAgICAgICBpZiAob3ZlcnJpZGU/LihjLlZlcnRpY2VzW2Uual0uaWQpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3NvclNsYWNrID0gc2xhY2tzW2Uual07XG4gICAgICAgICAgICByZXR1cm4gc3VjY2Vzc29yU2xhY2subGF0ZS5zdGFydDtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5maWx0ZXIoKHZhbHVlKSA9PiB2YWx1ZSAhPT0gbnVsbCkgYXMgbnVtYmVyW107XG4gICAgICAgIGlmIChsYXRlU3RhcnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHNsYWNrLmxhdGUuZmluaXNoID0gc2xhY2suZWFybHkuZmluaXNoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNsYWNrLmxhdGUuZmluaXNoID0gTWF0aC5taW4oLi4ubGF0ZVN0YXJ0cyk7XG4gICAgICAgIH1cbiAgICAgICAgc2xhY2subGF0ZS5zdGFydCA9IHJvdW5kKHNsYWNrLmxhdGUuZmluaXNoIC0gdGFza0R1cmF0aW9uKHZlcnRleEluZGV4KSk7XG4gICAgICAgIHNsYWNrLnNsYWNrID0gcm91bmQoc2xhY2subGF0ZS5maW5pc2ggLSBzbGFjay5lYXJseS5maW5pc2gpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG9rKHNsYWNrcyk7XG59XG5cbmV4cG9ydCBjb25zdCBDcml0aWNhbFBhdGggPSAoc2xhY2tzOiBTbGFja1tdLCByb3VuZDogUm91bmRlcik6IG51bWJlcltdID0+IHtcbiAgY29uc3QgcmV0OiBudW1iZXJbXSA9IFtdO1xuICBzbGFja3MuZm9yRWFjaCgoc2xhY2s6IFNsYWNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKFxuICAgICAgcm91bmQoc2xhY2subGF0ZS5maW5pc2ggLSBzbGFjay5lYXJseS5maW5pc2gpIDwgTnVtYmVyLkVQU0lMT04gJiZcbiAgICAgIHJvdW5kKHNsYWNrLmVhcmx5LmZpbmlzaCAtIHNsYWNrLmVhcmx5LnN0YXJ0KSA+IE51bWJlci5FUFNJTE9OXG4gICAgKSB7XG4gICAgICByZXQucHVzaChpbmRleCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHsgU3BhbiB9IGZyb20gXCIuLi9zbGFjay9zbGFja1wiO1xuXG4vLyBUaGUgY29tcGxldGlvbiBzdGF0dXMgb2YgYSBUYXNrLiBUaGUgdmFsdWUgb2YgYHN0YXJ0YCBhbmQgdmFsdWVzIGluIGBzcGFuYFxuLy8gYW5kIGR1cmF0aW9uIG9mZnNldHMsIGp1c3QgbGlrZSB3aGF0IGFyZSB1c2VkIGluIHRoZSBTcGFucyB1c2VkIGluIHJlbmRlcmluZy5cbmV4cG9ydCB0eXBlIFRhc2tDb21wbGV0aW9uID1cbiAgfCB7IHN0YWdlOiBcInVuc3RhcnRlZFwiIH1cbiAgfCB7XG4gICAgICBzdGFnZTogXCJzdGFydGVkXCI7XG4gICAgICBzdGFydDogbnVtYmVyO1xuICAgICAgcGVyY2VudENvbXBsZXRlOiBudW1iZXI7XG4gICAgfVxuICB8IHtcbiAgICAgIHN0YWdlOiBcImZpbmlzaGVkXCI7XG4gICAgICBzcGFuOiBTcGFuO1xuICAgIH07XG5cbmV4cG9ydCB0eXBlIFRhc2tDb21wbGV0aW9uU2VyaWFsaXplZCA9IHtcbiAgc3RhZ2U6IHN0cmluZztcbiAgc3RhcnQ6IG51bWJlcjtcbiAgcGVyY2VudENvbXBsZXRlOiBudW1iZXI7XG4gIGZpbmlzaDogbnVtYmVyO1xufTtcblxuZXhwb3J0IGNvbnN0IHRhc2tVbnN0YXJ0ZWQgPSB7IHN0YWdlOiBcInVuc3RhcnRlZFwiIH07XG5cbmV4cG9ydCB0eXBlIFRhc2tDb21wbGV0aW9ucyA9IHsgW2tleTogc3RyaW5nXTogVGFza0NvbXBsZXRpb24gfTtcbmV4cG9ydCB0eXBlIFRhc2tDb21wbGV0aW9uc1NlcmlhbGl6ZWQgPSB7XG4gIFtrZXk6IHN0cmluZ106IFRhc2tDb21wbGV0aW9uU2VyaWFsaXplZDtcbn07XG5cbmV4cG9ydCBjb25zdCB0b0pTT04gPSAoXG4gIHRhc2tDb21wbGV0aW9uOiBUYXNrQ29tcGxldGlvblxuKTogVGFza0NvbXBsZXRpb25TZXJpYWxpemVkID0+IHtcbiAgY29uc3QgcmV0OiBUYXNrQ29tcGxldGlvblNlcmlhbGl6ZWQgPSB7XG4gICAgc3RhZ2U6IHRhc2tDb21wbGV0aW9uLnN0YWdlIGFzIHN0cmluZyxcbiAgICBzdGFydDogMCxcbiAgICBmaW5pc2g6IDAsXG4gICAgcGVyY2VudENvbXBsZXRlOiAwLFxuICB9O1xuXG4gIHN3aXRjaCAodGFza0NvbXBsZXRpb24uc3RhZ2UpIHtcbiAgICBjYXNlIFwidW5zdGFydGVkXCI6XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwic3RhcnRlZFwiOlxuICAgICAgcmV0LnN0YXJ0ID0gdGFza0NvbXBsZXRpb24uc3RhcnQ7XG4gICAgICByZXQucGVyY2VudENvbXBsZXRlID0gdGFza0NvbXBsZXRpb24ucGVyY2VudENvbXBsZXRlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImZpbmlzaGVkXCI6XG4gICAgICByZXQuc3RhcnQgPSB0YXNrQ29tcGxldGlvbi5zcGFuLnN0YXJ0O1xuICAgICAgcmV0LmZpbmlzaCA9IHRhc2tDb21wbGV0aW9uLnNwYW4uZmluaXNoO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRhc2tDb21wbGV0aW9uIHNhdGlzZmllcyBuZXZlcjtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiByZXQ7XG59O1xuXG5leHBvcnQgY29uc3QgZnJvbUpTT04gPSAoXG4gIHRhc2tDb21wbGV0aW9uU2VyaWFsaXplZDogVGFza0NvbXBsZXRpb25TZXJpYWxpemVkXG4pOiBUYXNrQ29tcGxldGlvbiA9PiB7XG4gIGNvbnN0IHVuc3RhcnRlZDogVGFza0NvbXBsZXRpb24gPSB7IHN0YWdlOiBcInVuc3RhcnRlZFwiIH07XG4gIHN3aXRjaCAodGFza0NvbXBsZXRpb25TZXJpYWxpemVkLnN0YWdlKSB7XG4gICAgY2FzZSBcInVuc3RhcnRlZFwiOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhZ2U6IFwidW5zdGFydGVkXCIsXG4gICAgICB9O1xuICAgIGNhc2UgXCJzdGFydGVkXCI6XG4gICAgICBpZiAodGFza0NvbXBsZXRpb25TZXJpYWxpemVkLnN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuc3RhcnRlZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YWdlOiBcInN0YXJ0ZWRcIixcbiAgICAgICAgc3RhcnQ6IHRhc2tDb21wbGV0aW9uU2VyaWFsaXplZC5zdGFydCxcbiAgICAgICAgcGVyY2VudENvbXBsZXRlOiB0YXNrQ29tcGxldGlvblNlcmlhbGl6ZWQucGVyY2VudENvbXBsZXRlLFxuICAgICAgfTtcbiAgICBjYXNlIFwiZmluaXNoZWRcIjpcbiAgICAgIGlmIChcbiAgICAgICAgdGFza0NvbXBsZXRpb25TZXJpYWxpemVkLnN0YXJ0ID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgdGFza0NvbXBsZXRpb25TZXJpYWxpemVkLmZpbmlzaCA9PT0gdW5kZWZpbmVkXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHVuc3RhcnRlZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YWdlOiBcImZpbmlzaGVkXCIsXG4gICAgICAgIHNwYW46IG5ldyBTcGFuKFxuICAgICAgICAgIHRhc2tDb21wbGV0aW9uU2VyaWFsaXplZC5zdGFydCxcbiAgICAgICAgICB0YXNrQ29tcGxldGlvblNlcmlhbGl6ZWQuZmluaXNoXG4gICAgICAgICksXG4gICAgICB9O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdW5zdGFydGVkO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgdGFza0NvbXBsZXRpb25zVG9KU09OID0gKFxuICB0OiBUYXNrQ29tcGxldGlvbnNcbik6IFRhc2tDb21wbGV0aW9uc1NlcmlhbGl6ZWQgPT4ge1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKHQpLm1hcCgoW2tleSwgdGFza0NvbXBsZXRpb25dKSA9PiBbXG4gICAgICBrZXksXG4gICAgICB0b0pTT04odGFza0NvbXBsZXRpb24pLFxuICAgIF0pXG4gICk7XG59O1xuXG5leHBvcnQgY29uc3QgdGFza0NvbXBsZXRpb25zRnJvbUpTT04gPSAoXG4gIHQ6IFRhc2tDb21wbGV0aW9uc1NlcmlhbGl6ZWRcbik6IFRhc2tDb21wbGV0aW9ucyA9PiB7XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXModCkubWFwKChba2V5LCB0YXNrQ29tcGxldGlvblNlcmlhbGl6ZWRdKSA9PiBbXG4gICAgICBrZXksXG4gICAgICBmcm9tSlNPTih0YXNrQ29tcGxldGlvblNlcmlhbGl6ZWQpLFxuICAgIF0pXG4gICk7XG59O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgZXJyb3IsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdFwiO1xuXG5jb25zdCBkZWNpbWFsUmVnZXggPSAvXltcXGRcXC5dKyQvO1xuY29uc3Qgc2hvcnRoYW5kUmVnZXggPSAvXihcXGQrZCk/KFxcZCt3KT8oXFxkK20pPyhcXGQreSk/JC87XG5cbmV4cG9ydCBjb25zdCBwYXJzZUR1cmF0aW9uID0gKHM6IHN0cmluZywgZGF5c0luV2VlazogNSB8IDcpOiBSZXN1bHQ8bnVtYmVyPiA9PiB7XG4gIHMgPSBzLnRyaW0oKTtcbiAgaWYgKHMubWF0Y2goZGVjaW1hbFJlZ2V4KSkge1xuICAgIHJldHVybiBvaygrcyk7XG4gIH1cbiAgbGV0IHJldCA9IDA7XG4gIGxldCBudW0gPSAwO1xuICBjb25zdCBjaGFycyA9IFsuLi5zXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGMgPSBjaGFyc1tpXTtcbiAgICBpZiAoYyA9PT0gXCJkXCIpIHtcbiAgICAgIHJldCArPSBudW07XG4gICAgICBudW0gPSAwO1xuICAgIH0gZWxzZSBpZiAoYyA9PT0gXCJ3XCIpIHtcbiAgICAgIHJldCArPSBudW0gKiBkYXlzSW5XZWVrO1xuICAgICAgbnVtID0gMDtcbiAgICB9IGVsc2UgaWYgKGMgPT09IFwibVwiKSB7XG4gICAgICByZXQgKz0gbnVtICogZGF5c0luV2VlayAqIDQ7XG4gICAgICBudW0gPSAwO1xuICAgIH0gZWxzZSBpZiAoXCIwMTIzNDU2Nzg5XCIuaW5jbHVkZXMoYykpIHtcbiAgICAgIG51bSA9IG51bSAqIDEwICsgK2M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoYGludmFsaWQgZHVyYXRpb24gZm9ybWF0OiAke3N9YCkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb2socmV0KTtcbn07XG4iLCAiZXhwb3J0IGNsYXNzIFdlZWtkYXlzIHtcbiAgc3RhcnQ6IERhdGU7XG5cbiAgLyoqXG4gICAqIE1hcHMgZnJvbSBhIG51bWJlciBvZiB3ZWVrZGF5cyAoZnJvbSB0aGlzLnN0YXJ0KSB0byBhIG51bWJlciBvZiBkYXlzICh3aGljaFxuICAgKiBpZ25vcmVzIGluY2x1ZGVzIHdlZWtlbmRzLlxuICAgKi9cbiAgY2FjaGU6IE1hcDxudW1iZXIsIG51bWJlcj47XG4gIGxhc3RDYWNoZUVudHJ5OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc3RhcnQ6IERhdGUpIHtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgdGhpcy5jYWNoZSA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmNhY2hlLnNldCgwLCAwKTtcbiAgICB0aGlzLmxhc3RDYWNoZUVudHJ5ID0gMDtcbiAgfVxuXG4gIHdlZWtkYXlzVG9EYXlzKG51bVdlZWtkYXlzOiBudW1iZXIpOiBudW1iZXIge1xuICAgIGlmIChudW1XZWVrZGF5cyA8IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBudW1XZWVrZGF5cyA9IE1hdGgudHJ1bmMobnVtV2Vla2RheXMpO1xuICAgIGNvbnN0IGNhY2hlVmFsdWUgPSB0aGlzLmNhY2hlLmdldChudW1XZWVrZGF5cyk7XG4gICAgaWYgKGNhY2hlVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGNhY2hlVmFsdWU7XG4gICAgfVxuXG4gICAgbGV0IHN0YXJ0ID0gbmV3IERhdGUodGhpcy5zdGFydC5nZXRUaW1lKCkpO1xuICAgIGxldCB3ZWVrZGF5ID0gdGhpcy5sYXN0Q2FjaGVFbnRyeTtcbiAgICBsZXQgZGF5ID0gdGhpcy5jYWNoZS5nZXQod2Vla2RheSkhO1xuICAgIHN0YXJ0LnNldERhdGUoc3RhcnQuZ2V0RGF0ZSgpICsgZGF5KTtcblxuICAgIHdoaWxlICh3ZWVrZGF5ICE9PSBudW1XZWVrZGF5cykge1xuICAgICAgY29uc3Qgb2xkRGF0ZSA9IHN0YXJ0LmdldERhdGUoKTtcbiAgICAgIHN0YXJ0LnNldERhdGUob2xkRGF0ZSArIDEpO1xuICAgICAgZGF5ICs9IDE7XG5cbiAgICAgIGNvbnN0IGRheU9mV2VlayA9IHN0YXJ0LmdldERheSgpO1xuICAgICAgaWYgKGRheU9mV2VlayA9PT0gMCB8fCBkYXlPZldlZWsgPT09IDYpIHtcbiAgICAgICAgLy8gU3VuIG9yIFNhdC5cbiAgICAgICAgLy8gVE9ETyAtIEhlcmUgaXMgd2hlcmUgaG9saWRheSBjaGVja3Mgd291bGQgZ28uXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgd2Vla2RheSArPSAxO1xuICAgICAgdGhpcy5jYWNoZS5zZXQod2Vla2RheSwgZGF5KTtcbiAgICB9XG4gICAgdGhpcy5sYXN0Q2FjaGVFbnRyeSA9IHdlZWtkYXk7XG4gICAgcmV0dXJuIGRheTtcbiAgfVxufVxuIiwgImltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBSZXN1bHQsIGVycm9yLCBvayB9IGZyb20gXCIuLi9yZXN1bHRcIjtcbmltcG9ydCB7IHBhcnNlRHVyYXRpb24gfSBmcm9tIFwiLi9wYXJzZVwiO1xuaW1wb3J0IHsgV2Vla2RheXMgfSBmcm9tIFwiLi93ZWVrZGF5c1wiO1xuXG4vLyBVbml0IGRlc2NyaWJlcyBob3cgdGhlIGR1cmF0aW9uIHZhbHVlcyBhcmUgdG8gYmUgaW50ZXJwcmV0ZWQuXG5hYnN0cmFjdCBjbGFzcyBVbml0IHtcbiAgLy8gQ29udmVydCBhIGR1cmF0aW9uIGludG8gYSBkaXNwbGF5YWJsZSBzdHJpbmcuXG4gIGFic3RyYWN0IGRpc3BsYXlUaW1lKHQ6IG51bWJlciwgbG9jYWxlPzogSW50bC5Mb2NhbGVzQXJndW1lbnQpOiBzdHJpbmc7XG5cbiAgLy8gUGFyc2UgYSBkdXJhdGlvbiwgZWl0aGVyIGFzIGEgcmF3IG51bWJlciwgb3IgaW4gYSBzaG9ydGhhbmQgZHVyYXRpb24sIHN1Y2hcbiAgLy8gYXMgMWQsIDJkLCA1eS5cbiAgYWJzdHJhY3QgcGFyc2Uoczogc3RyaW5nKTogUmVzdWx0PG51bWJlcj47XG5cbiAgLy8gVE9ETyAtIE5lZWRzIGEgbWV0aG9kIHRvIGdvIGZyb20gRGF0ZSgpIHRvIGR1cmF0aW9uLlxufVxuXG4vLyBUaGUgZm9ybSBhIFVuaXQgdGFrZXMgd2hlbiBzZXJpYWxpemVkIHRvIEpTT04uXG4vL1xuLy8gTm90ZSB3ZSBkb24ndCBzZXJpYWxpemUgdGhlIE1ldHJpY0RlZmluaXRpb24gc2luY2UgdGhhdCBjb21lcyBmcm9tIHRoZVxuLy8gXCJEdXJhdGlvblwiIHN0YXRpYyBtZXRyaWMuXG5leHBvcnQgaW50ZXJmYWNlIFVuaXRTZXJpYWxpemVkIHtcbiAgdW5pdFR5cGU6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIFVuaXRCYXNlIGltcGxlbWVudHMgVW5pdCB7XG4gIHByb3RlY3RlZCBzdGFydDogRGF0ZTtcbiAgcHJvdGVjdGVkIG1ldHJpY0RlZm46IE1ldHJpY0RlZmluaXRpb247XG4gIHByb3RlY3RlZCB1bml0VHlwZTogVW5pdFR5cGVzO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXJ0OiBEYXRlLCBtZXRyaWNEZWZuOiBNZXRyaWNEZWZpbml0aW9uLCB1bml0VHlwZTogVW5pdFR5cGVzKSB7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMubWV0cmljRGVmbiA9IG1ldHJpY0RlZm47XG4gICAgdGhpcy51bml0VHlwZSA9IHVuaXRUeXBlO1xuICB9XG5cbiAgZGlzcGxheVRpbWUodDogbnVtYmVyLCBsb2NhbGU/OiBJbnRsLkxvY2FsZXNBcmd1bWVudCk6IHN0cmluZyB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIGltcGxlbWVudGVkIGluIHN1YmNsYXNzZXMuXCIpO1xuICB9XG5cbiAgcGFyc2Uoczogc3RyaW5nKTogUmVzdWx0PG51bWJlcj4ge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBpbXBsZW1lbnRlZCBpbiBzdWJjbGFzc2VzLlwiKTtcbiAgfVxuXG4gIHRvSlNPTigpOiBVbml0U2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHsgdW5pdFR5cGU6IHRoaXMudW5pdFR5cGUgfTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tSlNPTihcbiAgICBzOiBVbml0U2VyaWFsaXplZCxcbiAgICBzdGFydDogRGF0ZSxcbiAgICBtZXRyaWNEZWZuOiBNZXRyaWNEZWZpbml0aW9uXG4gICk6IFVuaXRCYXNlIHtcbiAgICByZXR1cm4gVW5pdEJ1aWxkZXJzW3RvVW5pdChzLnVuaXRUeXBlKV0oc3RhcnQsIG1ldHJpY0RlZm4pO1xuICB9XG59XG5cbmNvbnN0IFVOSVRfVFlQRVMgPSBbXCJVbml0bGVzc1wiLCBcIkRheXNcIiwgXCJXZWVrZGF5c1wiXSBhcyBjb25zdDtcblxuLy8gQWxsIHR5cGVzIG9mIGR1cmF0aW9uIHVuaXRzIGF2YWlsYWJsZS5cbmV4cG9ydCB0eXBlIFVuaXRUeXBlcyA9ICh0eXBlb2YgVU5JVF9UWVBFUylbbnVtYmVyXTtcblxuLy8gRGVzY3JpYmVzIGVhY2ggdHlwZSBvZiBVbml0IGF2YWlsYWJsZS5cbmV4cG9ydCBjb25zdCBVbml0RGVzY3JpcHRpb25zOiBSZWNvcmQ8VW5pdFR5cGVzLCBzdHJpbmc+ID0ge1xuICBVbml0bGVzczogXCJVbml0bGVzcyBkdXJhdGlvbnMuXCIsXG4gIERheXM6IFwiRGF5cywgd2l0aCA3IGRheXMgYSB3ZWVrLlwiLFxuICBXZWVrZGF5czogXCJEYXlzLCB3aXRoIDUgZGF5cyBhIHdlZWsuXCIsXG59O1xuXG4vLyBCdWlsZGVycyBmb3IgZWFjaCB0eXBlIG9mIFVuaXQuXG5leHBvcnQgY29uc3QgVW5pdEJ1aWxkZXJzOiBSZWNvcmQ8XG4gIFVuaXRUeXBlcyxcbiAgKHN0YXJ0OiBEYXRlLCBtZXRyaWNEZWZuOiBNZXRyaWNEZWZpbml0aW9uKSA9PiBVbml0QmFzZVxuPiA9IHtcbiAgVW5pdGxlc3M6IChzdGFydDogRGF0ZSwgbWV0cmljRGVmbjogTWV0cmljRGVmaW5pdGlvbikgPT5cbiAgICBuZXcgVW5pdGxlc3Moc3RhcnQsIG1ldHJpY0RlZm4pLFxuICBEYXlzOiAoc3RhcnQ6IERhdGUsIG1ldHJpY0RlZm46IE1ldHJpY0RlZmluaXRpb24pID0+XG4gICAgbmV3IERheXMoc3RhcnQsIG1ldHJpY0RlZm4pLFxuICBXZWVrZGF5czogKHN0YXJ0OiBEYXRlLCBtZXRyaWNEZWZuOiBNZXRyaWNEZWZpbml0aW9uKSA9PlxuICAgIG5ldyBXZWVrRGF5cyhzdGFydCwgbWV0cmljRGVmbiksXG59O1xuXG4vLyBQYXJzZSBzdHJpbmcgaW50byBhIHZhbGlkIFVuaXRUeXBlcy5cbmV4cG9ydCBjb25zdCB0b1VuaXQgPSAoczogc3RyaW5nKTogVW5pdFR5cGVzID0+IHtcbiAgaWYgKFVOSVRfVFlQRVMuc29tZSgodDogVW5pdFR5cGVzKSA9PiB0ID09PSBzKSkge1xuICAgIHJldHVybiBzIGFzIFVuaXRUeXBlcztcbiAgfVxuICByZXR1cm4gXCJVbml0bGVzc1wiO1xufTtcblxuLy8gVW5pdGxlc3MuXG5leHBvcnQgY2xhc3MgVW5pdGxlc3MgZXh0ZW5kcyBVbml0QmFzZSBpbXBsZW1lbnRzIFVuaXQge1xuICBjb25zdHJ1Y3RvcihzdGFydDogRGF0ZSwgbWV0cmljRGVmbjogTWV0cmljRGVmaW5pdGlvbikge1xuICAgIHN1cGVyKHN0YXJ0LCBtZXRyaWNEZWZuLCBcIlVuaXRsZXNzXCIpO1xuICB9XG5cbiAgZGlzcGxheVRpbWUodDogbnVtYmVyLCBsb2NhbGU/OiBJbnRsLkxvY2FsZXNBcmd1bWVudCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubWV0cmljRGVmbi5jbGFtcEFuZFJvdW5kKHQpLnRvU3RyaW5nKCk7XG4gIH1cblxuICBwYXJzZShzOiBzdHJpbmcpOiBSZXN1bHQ8bnVtYmVyPiB7XG4gICAgY29uc3QgcGFyc2VkID0gK3M7XG4gICAgaWYgKE51bWJlci5pc05hTihwYXJzZWQpKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKGBJbnZhbGlkIG51bWJlciB2YWx1ZTogJHtzfWApKTtcbiAgICB9XG4gICAgcmV0dXJuIG9rKHRoaXMubWV0cmljRGVmbi5jbGFtcEFuZFJvdW5kKHBhcnNlZCkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEYXlzIGV4dGVuZHMgVW5pdEJhc2UgaW1wbGVtZW50cyBVbml0IHtcbiAgY29uc3RydWN0b3Ioc3RhcnQ6IERhdGUsIG1ldHJpY0RlZm46IE1ldHJpY0RlZmluaXRpb24pIHtcbiAgICBzdXBlcihzdGFydCwgbWV0cmljRGVmbiwgXCJEYXlzXCIpO1xuICB9XG5cbiAgZGlzcGxheVRpbWUodDogbnVtYmVyLCBsb2NhbGU/OiBJbnRsLkxvY2FsZXNBcmd1bWVudCk6IHN0cmluZyB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRoaXMuc3RhcnQuZ2V0VGltZSgpKTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgKyB0KTtcbiAgICByZXR1cm4gZC50b0xvY2FsZURhdGVTdHJpbmcobG9jYWxlKTtcbiAgfVxuXG4gIHBhcnNlKHM6IHN0cmluZyk6IFJlc3VsdDxudW1iZXI+IHtcbiAgICBjb25zdCBkID0gcGFyc2VEdXJhdGlvbihzLCA3KTtcbiAgICBpZiAoIWQub2spIHtcbiAgICAgIHJldHVybiBkO1xuICAgIH1cbiAgICByZXR1cm4gb2sodGhpcy5tZXRyaWNEZWZuLmNsYW1wQW5kUm91bmQoZC52YWx1ZSkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBXZWVrRGF5cyBleHRlbmRzIFVuaXRCYXNlIGltcGxlbWVudHMgVW5pdCB7XG4gIHdlZWtkYXlzOiBXZWVrZGF5cztcblxuICBjb25zdHJ1Y3RvcihzdGFydDogRGF0ZSwgbWV0cmljRGVmbjogTWV0cmljRGVmaW5pdGlvbikge1xuICAgIHN1cGVyKHN0YXJ0LCBtZXRyaWNEZWZuLCBcIldlZWtkYXlzXCIpO1xuICAgIHRoaXMud2Vla2RheXMgPSBuZXcgV2Vla2RheXMoc3RhcnQpO1xuICB9XG5cbiAgLy8gTG9jYWxlIG9ubHkgdXNlZCBmb3IgdGVzdGluZy5cbiAgZGlzcGxheVRpbWUodDogbnVtYmVyLCBsb2NhbGU/OiBJbnRsLkxvY2FsZXNBcmd1bWVudCk6IHN0cmluZyB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKHRoaXMuc3RhcnQuZ2V0VGltZSgpKTtcbiAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgKyB0aGlzLndlZWtkYXlzLndlZWtkYXlzVG9EYXlzKHQpKTtcbiAgICByZXR1cm4gZC50b0xvY2FsZURhdGVTdHJpbmcobG9jYWxlKTtcbiAgfVxuXG4gIHBhcnNlKHM6IHN0cmluZyk6IFJlc3VsdDxudW1iZXI+IHtcbiAgICBjb25zdCBkID0gcGFyc2VEdXJhdGlvbihzLCA1KTtcbiAgICBpZiAoIWQub2spIHtcbiAgICAgIHJldHVybiBkO1xuICAgIH1cbiAgICByZXR1cm4gb2sodGhpcy5tZXRyaWNEZWZuLmNsYW1wQW5kUm91bmQoZC52YWx1ZSkpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsga2V5ZWQgfSBmcm9tIFwibGl0LWh0bWwvZGlyZWN0aXZlcy9rZXllZC5qc1wiO1xuaW1wb3J0IHsgQ2hhcnQsIENoYXJ0U2VyaWFsaXplZCwgQ2hhcnRWYWxpZGF0ZSwgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHtcbiAgTWV0cmljRGVmaW5pdGlvbixcbiAgTWV0cmljRGVmaW5pdGlvbnMsXG4gIE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgTWV0cmljUmFuZ2UgfSBmcm9tIFwiLi4vbWV0cmljcy9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUmF0aW9uYWxpemVFZGdlc09wIH0gZnJvbSBcIi4uL29wcy9jaGFydC50c1wiO1xuaW1wb3J0IHtcbiAgUGxhblN0YXR1cyxcbiAgUGxhblN0YXR1c1NlcmlhbGl6ZWQsXG4gIHRvSlNPTiBhcyBzdGF0dXNUb0pTT04sXG4gIGZyb21KU09OIGFzIHN0YXR1c0Zyb21KU09OLFxuICBzdGF0dXNUb0RhdGUsXG59IGZyb20gXCIuLi9wbGFuX3N0YXR1cy9wbGFuX3N0YXR1cy50c1wiO1xuaW1wb3J0IHtcbiAgUmVzb3VyY2VEZWZpbml0aW9uLFxuICBSZXNvdXJjZURlZmluaXRpb25zLFxuICBSZXNvdXJjZURlZmluaXRpb25zU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgZXJyb3IsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgVW5jZXJ0YWludHlUb051bSB9IGZyb20gXCIuLi9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhbi50c1wiO1xuaW1wb3J0IHtcbiAgVGFza0NvbXBsZXRpb25zLFxuICBUYXNrQ29tcGxldGlvbnNTZXJpYWxpemVkLFxuICB0YXNrQ29tcGxldGlvbnNUb0pTT04sXG4gIHRhc2tDb21wbGV0aW9uc0Zyb21KU09OLFxuICBUYXNrQ29tcGxldGlvbixcbn0gZnJvbSBcIi4uL3Rhc2tfY29tcGxldGlvbi90YXNrX2NvbXBsZXRpb24udHNcIjtcbmltcG9ydCB7XG4gIERheXMsXG4gIFVuaXRCYXNlLFxuICBVbml0QnVpbGRlcnMsXG4gIFVuaXRTZXJpYWxpemVkLFxuICBVbml0VHlwZXMsXG59IGZyb20gXCIuLi91bml0cy91bml0LnRzXCI7XG5cbmV4cG9ydCB0eXBlIFN0YXRpY01ldHJpY0tleXMgPSBcIkR1cmF0aW9uXCIgfCBcIlBlcmNlbnQgQ29tcGxldGVcIjtcblxuZXhwb3J0IGNvbnN0IFN0YXRpY01ldHJpY0RlZmluaXRpb25zOiBSZWNvcmQ8XG4gIFN0YXRpY01ldHJpY0tleXMsXG4gIE1ldHJpY0RlZmluaXRpb25cbj4gPSB7XG4gIC8vIEhvdyBsb25nIGEgdGFzayB3aWxsIHRha2UsIGluIGRheXMuXG4gIER1cmF0aW9uOiBuZXcgTWV0cmljRGVmaW5pdGlvbigwLCBuZXcgTWV0cmljUmFuZ2UoMCksIHRydWUpLFxuICAvLyBUaGUgcGVyY2VudCBjb21wbGV0ZSBmb3IgYSB0YXNrLlxuICBcIlBlcmNlbnQgQ29tcGxldGVcIjogbmV3IE1ldHJpY0RlZmluaXRpb24oMCwgbmV3IE1ldHJpY1JhbmdlKDAsIDEwMCksIHRydWUpLFxufTtcblxuZXhwb3J0IHR5cGUgU3RhdGljUmVzb3VyY2VLZXlzID0gXCJVbmNlcnRhaW50eVwiO1xuXG5leHBvcnQgY29uc3QgU3RhdGljUmVzb3VyY2VEZWZpbml0aW9uczogUmVjb3JkPFxuICBTdGF0aWNSZXNvdXJjZUtleXMsXG4gIFJlc291cmNlRGVmaW5pdGlvblxuPiA9IHtcbiAgVW5jZXJ0YWludHk6IG5ldyBSZXNvdXJjZURlZmluaXRpb24oT2JqZWN0LmtleXMoVW5jZXJ0YWludHlUb051bSksIHRydWUpLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBQbGFuU2VyaWFsaXplZCB7XG4gIHN0YXR1czogUGxhblN0YXR1c1NlcmlhbGl6ZWQ7XG4gIHRhc2tDb21wbGV0aW9uOiBUYXNrQ29tcGxldGlvbnNTZXJpYWxpemVkO1xuICBkdXJhdGlvblVuaXRzOiBVbml0U2VyaWFsaXplZDtcbiAgY2hhcnQ6IENoYXJ0U2VyaWFsaXplZDtcbiAgcmVzb3VyY2VEZWZpbml0aW9uczogUmVzb3VyY2VEZWZpbml0aW9uc1NlcmlhbGl6ZWQ7XG4gIG1ldHJpY0RlZmluaXRpb25zOiBNZXRyaWNEZWZpbml0aW9uc1NlcmlhbGl6ZWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBQbGFuIHtcbiAgY2hhcnQ6IENoYXJ0O1xuXG4gIC8vIENvbnRyb2xzIGhvdyB0aW1lIGlzIGRpc3BsYXllZC5cbiAgZHVyYXRpb25Vbml0czogVW5pdEJhc2U7XG5cbiAgX3N0YXR1czogUGxhblN0YXR1cyA9IHsgc3RhZ2U6IFwidW5zdGFydGVkXCIsIHN0YXJ0OiAwIH07XG5cbiAgdGFza0NvbXBsZXRpb246IFRhc2tDb21wbGV0aW9ucyA9IHt9O1xuXG4gIHJlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnM7XG5cbiAgbWV0cmljRGVmaW5pdGlvbnM6IE1ldHJpY0RlZmluaXRpb25zO1xuXG4gIHB1YmxpYyBnZXQgc3RhdHVzKCk6IFBsYW5TdGF0dXMge1xuICAgIHJldHVybiB0aGlzLl9zdGF0dXM7XG4gIH1cblxuICBwdWJsaWMgc2V0IHN0YXR1cyh2YWx1ZTogUGxhblN0YXR1cykge1xuICAgIHRoaXMuX3N0YXR1cyA9IHZhbHVlO1xuICAgIHRoaXMuZHVyYXRpb25Vbml0cyA9IG5ldyBEYXlzKFxuICAgICAgbmV3IERhdGUoc3RhdHVzVG9EYXRlKHRoaXMuc3RhdHVzKSksXG4gICAgICB0aGlzLmdldFN0YXRpY01ldHJpY0RlZmluaXRpb24oXCJEdXJhdGlvblwiKVxuICAgICk7XG4gIH1cblxuICBzZXRUYXNrQ29tcGxldGlvbihpbmRleDogbnVtYmVyLCB2YWx1ZTogVGFza0NvbXBsZXRpb24pOiBSZXN1bHQ8bnVsbD4ge1xuICAgIGNvbnN0IHRhc2sgPSB0aGlzLmNoYXJ0LlZlcnRpY2VzW2luZGV4XTtcbiAgICBpZiAodGFzayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKGAke2luZGV4fSBpcyBub3QgYSB2YWxpZCBUYXNrIGluZGV4LmApKTtcbiAgICB9XG4gICAgdGhpcy50YXNrQ29tcGxldGlvblt0YXNrLmlkXSA9IHZhbHVlO1xuICAgIHJldHVybiBvayhudWxsKTtcbiAgfVxuXG4gIGdldFRhc2tDb21wbGV0aW9uKGluZGV4OiBudW1iZXIpOiBSZXN1bHQ8VGFza0NvbXBsZXRpb24+IHtcbiAgICBjb25zdCB0YXNrID0gdGhpcy5jaGFydC5WZXJ0aWNlc1tpbmRleF07XG4gICAgaWYgKHRhc2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihgJHtpbmRleH0gaXMgbm90IGEgdmFsaWQgVGFzayBpbmRleC5gKSk7XG4gICAgfVxuICAgIHJldHVybiBvayh0aGlzLnRhc2tDb21wbGV0aW9uW3Rhc2suaWRdIHx8IHsgc3RhZ2U6IFwidW5zdGFydGVkXCIgfSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNoYXJ0ID0gbmV3IENoYXJ0KCk7XG4gICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljUmVzb3VyY2VEZWZpbml0aW9ucyk7XG4gICAgdGhpcy5tZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIFN0YXRpY01ldHJpY0RlZmluaXRpb25zKTtcbiAgICB0aGlzLmR1cmF0aW9uVW5pdHMgPSBuZXcgRGF5cyhcbiAgICAgIG5ldyBEYXRlKHN0YXR1c1RvRGF0ZSh0aGlzLnN0YXR1cykpLFxuICAgICAgdGhpcy5nZXRTdGF0aWNNZXRyaWNEZWZpbml0aW9uKFwiRHVyYXRpb25cIilcbiAgICApO1xuXG4gICAgdGhpcy5hcHBseU1ldHJpY3NBbmRSZXNvdXJjZXNUb1ZlcnRpY2VzKCk7XG4gIH1cblxuICBzZXREdXJhdGlvblVuaXRzKHVuaXRUeXBlOiBVbml0VHlwZXMpIHtcbiAgICB0aGlzLmR1cmF0aW9uVW5pdHMgPSBVbml0QnVpbGRlcnNbdW5pdFR5cGVdKFxuICAgICAgbmV3IERhdGUoc3RhdHVzVG9EYXRlKHRoaXMuc3RhdHVzKSksXG4gICAgICB0aGlzLmdldFN0YXRpY01ldHJpY0RlZmluaXRpb24oXCJEdXJhdGlvblwiKVxuICAgICk7XG4gIH1cblxuICBnZXRTdGF0aWNNZXRyaWNEZWZpbml0aW9uKG5hbWU6IFN0YXRpY01ldHJpY0tleXMpOiBNZXRyaWNEZWZpbml0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNEZWZpbml0aW9uc1tuYW1lXTtcbiAgfVxuXG4gIGdldFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbihuYW1lOiBTdGF0aWNSZXNvdXJjZUtleXMpOiBSZXNvdXJjZURlZmluaXRpb24ge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNbbmFtZV07XG4gIH1cblxuICBhcHBseU1ldHJpY3NBbmRSZXNvdXJjZXNUb1ZlcnRpY2VzKCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpLmZvckVhY2goKG1ldHJpY05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgbWQgPSB0aGlzLm1ldHJpY0RlZmluaXRpb25zW21ldHJpY05hbWVdITtcbiAgICAgIHRoaXMuY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgICB0YXNrLnNldE1ldHJpYyhtZXRyaWNOYW1lLCBtZC5kZWZhdWx0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZm9yRWFjaChcbiAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiB7XG4gICAgICAgIHRoaXMuY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgICAgIHRhc2suc2V0UmVzb3VyY2Uoa2V5LCByZXNvdXJjZURlZmluaXRpb24udmFsdWVzWzBdKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIGdldE1ldHJpY0RlZmluaXRpb24oa2V5OiBzdHJpbmcpOiBNZXRyaWNEZWZpbml0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgc2V0TWV0cmljRGVmaW5pdGlvbihrZXk6IHN0cmluZywgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbikge1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XSA9IG1ldHJpY0RlZmluaXRpb247XG4gIH1cblxuICBkZWxldGVNZXRyaWNEZWZpbml0aW9uKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIGdldFJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZyk6IFJlc291cmNlRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgc2V0UmVzb3VyY2VEZWZpbml0aW9uKGtleTogc3RyaW5nLCB2YWx1ZTogUmVzb3VyY2VEZWZpbml0aW9uKSB7XG4gICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGRlbGV0ZVJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYSBuZXcgVGFzayB3aXRoIGRlZmF1bHRzIGZvciBhbGwgbWV0cmljcyBhbmQgcmVzb3VyY2VzLlxuICBuZXdUYXNrKCk6IFRhc2sge1xuICAgIGNvbnN0IHJldCA9IG5ldyBUYXNrKCk7XG4gICAgT2JqZWN0LmtleXModGhpcy5tZXRyaWNEZWZpbml0aW9ucykuZm9yRWFjaCgobWV0cmljTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBtZCA9IHRoaXMuZ2V0TWV0cmljRGVmaW5pdGlvbihtZXRyaWNOYW1lKSE7XG4gICAgICByZXQuc2V0TWV0cmljKG1ldHJpY05hbWUsIG1kLmRlZmF1bHQpO1xuICAgIH0pO1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZm9yRWFjaChcbiAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiB7XG4gICAgICAgIHJldC5zZXRSZXNvdXJjZShrZXksIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbMF0pO1xuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHRvSlNPTigpOiBQbGFuU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1czogc3RhdHVzVG9KU09OKHRoaXMuc3RhdHVzKSxcbiAgICAgIHRhc2tDb21wbGV0aW9uOiB0YXNrQ29tcGxldGlvbnNUb0pTT04odGhpcy50YXNrQ29tcGxldGlvbiksXG4gICAgICBkdXJhdGlvblVuaXRzOiB0aGlzLmR1cmF0aW9uVW5pdHMudG9KU09OKCksXG4gICAgICBjaGFydDogdGhpcy5jaGFydC50b0pTT04oKSxcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbnM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXModGhpcy5yZXNvdXJjZURlZmluaXRpb25zKVxuICAgICAgICAgIC5maWx0ZXIoKFtfLCByZXNvdXJjZURlZmluaXRpb25dKSA9PiAhcmVzb3VyY2VEZWZpbml0aW9uLmlzU3RhdGljKVxuICAgICAgICAgIC5tYXAoKFtrZXksIHJlc291cmNlRGVmaW5pdGlvbl0pID0+IFtcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIHJlc291cmNlRGVmaW5pdGlvbi50b0pTT04oKSxcbiAgICAgICAgICBdKVxuICAgICAgKSxcbiAgICAgIG1ldHJpY0RlZmluaXRpb25zOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpXG4gICAgICAgICAgLmZpbHRlcigoW18sIG1ldHJpY0RlZmluaXRpb25dKSA9PiAhbWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYylcbiAgICAgICAgICAubWFwKChba2V5LCBtZXRyaWNEZWZpbml0aW9uXSkgPT4gW2tleSwgbWV0cmljRGVmaW5pdGlvbi50b0pTT04oKV0pXG4gICAgICApLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZnJvbUpTT04ocGxhblNlcmlhbGl6ZWQ6IFBsYW5TZXJpYWxpemVkKTogUGxhbiB7XG4gICAgY29uc3QgcmV0ID0gbmV3IFBsYW4oKTtcbiAgICByZXQuY2hhcnQgPSBDaGFydC5mcm9tSlNPTihwbGFuU2VyaWFsaXplZC5jaGFydCk7XG4gICAgcmV0LnN0YXR1cyA9IHN0YXR1c0Zyb21KU09OKHBsYW5TZXJpYWxpemVkLnN0YXR1cyk7XG4gICAgcmV0LnRhc2tDb21wbGV0aW9uID0gdGFza0NvbXBsZXRpb25zRnJvbUpTT04ocGxhblNlcmlhbGl6ZWQudGFza0NvbXBsZXRpb24pO1xuICAgIGNvbnN0IGRlc2VyaWFsaXplZE1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgT2JqZWN0LmVudHJpZXMocGxhblNlcmlhbGl6ZWQubWV0cmljRGVmaW5pdGlvbnMpLm1hcChcbiAgICAgICAgKFtrZXksIHNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uXSkgPT4gW1xuICAgICAgICAgIGtleSxcbiAgICAgICAgICBNZXRyaWNEZWZpbml0aW9uLmZyb21KU09OKHNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uKSxcbiAgICAgICAgXVxuICAgICAgKVxuICAgICk7XG4gICAgcmV0Lm1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHt9LFxuICAgICAgU3RhdGljTWV0cmljRGVmaW5pdGlvbnMsXG4gICAgICBkZXNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9uc1xuICAgICk7XG5cbiAgICBjb25zdCBkZXNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25zID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgT2JqZWN0LmVudHJpZXMocGxhblNlcmlhbGl6ZWQucmVzb3VyY2VEZWZpbml0aW9ucykubWFwKFxuICAgICAgICAoW2tleSwgc2VyaWFsaXplZFJlc291cmNlRGVmaW5pdGlvbl0pID0+IFtcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgUmVzb3VyY2VEZWZpbml0aW9uLmZyb21KU09OKHNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb24pLFxuICAgICAgICBdXG4gICAgICApXG4gICAgKTtcbiAgICByZXQucmVzb3VyY2VEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICB7fSxcbiAgICAgIFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnMsXG4gICAgICBkZXNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25zXG4gICAgKTtcblxuICAgIHJldC5kdXJhdGlvblVuaXRzID0gVW5pdEJhc2UuZnJvbUpTT04oXG4gICAgICBwbGFuU2VyaWFsaXplZC5kdXJhdGlvblVuaXRzLFxuICAgICAgbmV3IERhdGUoc3RhdHVzVG9EYXRlKHJldC5zdGF0dXMpKSxcbiAgICAgIHJldC5nZXRTdGF0aWNNZXRyaWNEZWZpbml0aW9uKFwiRHVyYXRpb25cIilcbiAgICApO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHN0YXRpYyBGcm9tSlNPTlRleHQgPSAodGV4dDogc3RyaW5nKTogUmVzdWx0PFBsYW4+ID0+IHtcbiAgICBjb25zdCBwbGFuU2VyaWFsaXplZDogUGxhblNlcmlhbGl6ZWQgPSBKU09OLnBhcnNlKHRleHQpO1xuICAgIGNvbnN0IHBsYW4gPSBQbGFuLmZyb21KU09OKHBsYW5TZXJpYWxpemVkKTtcblxuICAgIGNvbnN0IHJldCA9IFJhdGlvbmFsaXplRWRnZXNPcCgpLmFwcGx5VG8ocGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgcmV0VmFsID0gQ2hhcnRWYWxpZGF0ZShwbGFuLmNoYXJ0KTtcbiAgICBpZiAoIXJldFZhbC5vaykge1xuICAgICAgcmV0dXJuIHJldFZhbDtcbiAgICB9XG4gICAgcmV0dXJuIG9rKHBsYW4pO1xuICB9O1xufVxuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuXCI7XG5pbXBvcnQgeyBsaXZlIH0gZnJvbSBcImxpdC1odG1sL2RpcmVjdGl2ZXMvbGl2ZS5qc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tOYW1lQ2hhbmdlRGV0YWlscyB7XG4gIG5hbWU6IHN0cmluZztcbiAgdGFza0luZGV4OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza1Jlc291cmNlVmFsdWVDaGFuZ2VEZXRhaWxzIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYXNrTWV0cmljVmFsdWVDaGFuZ2VEZXRhaWxzIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogbnVtYmVyO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwIHtcbiAgICBcInRhc2stbmFtZS1jaGFuZ2VcIjogQ3VzdG9tRXZlbnQ8VGFza05hbWVDaGFuZ2VEZXRhaWxzPjtcbiAgICBcInRhc2stcmVzb3VyY2UtdmFsdWUtY2hhbmdlXCI6IEN1c3RvbUV2ZW50PFRhc2tSZXNvdXJjZVZhbHVlQ2hhbmdlRGV0YWlscz47XG4gICAgXCJ0YXNrLW1ldHJpYy12YWx1ZS1jaGFuZ2VcIjogQ3VzdG9tRXZlbnQ8VGFza01ldHJpY1ZhbHVlQ2hhbmdlRGV0YWlscz47XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNlbGVjdGVkVGFza1BhbmVsIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBwbGFuOiBQbGFuID0gbmV3IFBsYW4oKTtcbiAgdGFza0luZGV4OiBudW1iZXIgPSAtMTtcbiAgcGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2s6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9O1xuICB9XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICB1cGRhdGVTZWxlY3RlZFRhc2tQYW5lbChwbGFuOiBQbGFuLCB0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMucGxhbiA9IHBsYW47XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICAvKlxuICAgIFRPRE8gLSBEbyB0aGUgZm9sbG93aW5nIHdoZW4gc2VsZWN0aW5nIGEgbmV3IHRhc2suXG4gICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0ID1cbiAgICAgICAgICBzZWxlY3RlZFRhc2tQYW5lbC5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiI3Rhc2stbmFtZVwiKSE7XG4gICAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgICAgIGlucHV0LnNlbGVjdCgpO1xuICAgICAgfSwgMCk7XG4gICAgICAqL1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJlbmRlcih0aGlzLnRlbXBsYXRlKCksIHRoaXMpO1xuICB9XG5cbiAgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGNvbnN0IHRhc2tJbmRleCA9IHRoaXMudGFza0luZGV4O1xuICAgIGlmICh0YXNrSW5kZXggPT09IC0xKSB7XG4gICAgICByZXR1cm4gaHRtbGBObyB0YXNrIHNlbGVjdGVkLmA7XG4gICAgfVxuICAgIGNvbnN0IHRhc2sgPSB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XTtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDx0YWJsZT5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZD5OYW1lPC90ZD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICBpZD1cInRhc2stbmFtZVwiXG4gICAgICAgICAgICAgIC52YWx1ZT1cIiR7bGl2ZSh0YXNrLm5hbWUpfVwiXG4gICAgICAgICAgICAgIEBjaGFuZ2U9JHsoZTogRXZlbnQpID0+XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50PFRhc2tOYW1lQ2hhbmdlRGV0YWlscz4oXCJ0YXNrLW5hbWUtY2hhbmdlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICAke09iamVjdC5lbnRyaWVzKHRoaXMucGxhbi5yZXNvdXJjZURlZmluaXRpb25zKS5tYXAoXG4gICAgICAgICAgKFtyZXNvdXJjZUtleSwgZGVmbl0pID0+XG4gICAgICAgICAgICBodG1sYCA8dHI+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiJHtyZXNvdXJjZUtleX1cIj4ke3Jlc291cmNlS2V5fTwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICAgICAgICBpZD1cIiR7cmVzb3VyY2VLZXl9XCJcbiAgICAgICAgICAgICAgICAgIEBjaGFuZ2U9JHthc3luYyAoZTogRXZlbnQpID0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJ0YXNrLXJlc291cmNlLXZhbHVlLWNoYW5nZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByZXNvdXJjZUtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAke2RlZm4udmFsdWVzLm1hcChcbiAgICAgICAgICAgICAgICAgICAgKHJlc291cmNlVmFsdWU6IHN0cmluZykgPT5cbiAgICAgICAgICAgICAgICAgICAgICBodG1sYDxvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9JHtyZXNvdXJjZVZhbHVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdGVkPSR7dGFzay5yZXNvdXJjZXNbcmVzb3VyY2VLZXldID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAke3Jlc291cmNlVmFsdWV9XG4gICAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+YFxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+YFxuICAgICAgICApfVxuICAgICAgICAke09iamVjdC5rZXlzKHRoaXMucGxhbi5tZXRyaWNEZWZpbml0aW9ucykubWFwKFxuICAgICAgICAgIChrZXk6IHN0cmluZykgPT5cbiAgICAgICAgICAgIGh0bWxgIDx0cj5cbiAgICAgICAgICAgICAgPHRkPjxsYWJlbCBmb3I9XCIke2tleX1cIj4ke2tleX08L2xhYmVsPjwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgIGlkPVwiJHtrZXl9XCJcbiAgICAgICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUodGFzay5tZXRyaWNzW2tleV0pfVxuICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICBAY2hhbmdlPSR7YXN5bmMgKGU6IEV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwidGFzay1tZXRyaWMtdmFsdWUtY2hhbmdlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiArKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgIDwvdHI+YFxuICAgICAgICApfVxuICAgICAgPC90YWJsZT5cbiAgICBgO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcInNlbGVjdGVkLXRhc2stcGFuZWxcIiwgU2VsZWN0ZWRUYXNrUGFuZWwpO1xuIiwgImltcG9ydCB7IENoYXJ0LCBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0XCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhblwiO1xuaW1wb3J0IHsgUHJlY2lzaW9uIH0gZnJvbSBcIi4uL3ByZWNpc2lvbi9wcmVjaXNpb25cIjtcbmltcG9ydCB7IENvbXB1dGVTbGFjaywgQ3JpdGljYWxQYXRoIH0gZnJvbSBcIi4uL3NsYWNrL3NsYWNrXCI7XG5pbXBvcnQgeyBKYWNvYmlhbiwgVW5jZXJ0YWludHkgfSBmcm9tIFwiLi4vc3RhdHMvY2RmL3RyaWFuZ3VsYXIvamFjb2JpYW5cIjtcblxuY29uc3QgTUFYX1JBTkRPTSA9IDEwMDA7XG5cbmNvbnN0IHByZWNpc2lvbiA9IG5ldyBQcmVjaXNpb24oMik7XG5cbmNvbnN0IHJuZEludCA9IChuOiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbik7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIENyaXRpY2FsUGF0aEVudHJ5IHtcbiAgY291bnQ6IG51bWJlcjtcbiAgY3JpdGljYWxQYXRoOiBudW1iZXJbXTtcbiAgZHVyYXRpb25zOiBudW1iZXJbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDcml0aWNhbFBhdGhUYXNrRW50cnkge1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgZHVyYXRpb246IG51bWJlcjtcbiAgbnVtVGltZXNBcHBlYXJlZDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNpbXVsYXRpb25SZXN1bHRzIHtcbiAgcGF0aHM6IE1hcDxzdHJpbmcsIENyaXRpY2FsUGF0aEVudHJ5PjtcbiAgdGFza3M6IENyaXRpY2FsUGF0aFRhc2tFbnRyeVtdO1xufVxuXG4vKipcbiAqIFNpbXVsYXRlIHRoZSB1bmNlcnRhaW50eSBpbiB0aGUgcGxhbiBhbmQgZ2VuZXJhdGUgcG9zc2libGUgYWx0ZXJuYXRlIGNyaXRpY2FsXG4gKiBwYXRocy5cbiAqL1xuZXhwb3J0IGNvbnN0IHNpbXVsYXRpb24gPSAoXG4gIGNoYXJ0OiBDaGFydCxcbiAgbnVtU2ltdWxhdGlvbkxvb3BzOiBudW1iZXIsXG4gIG9yaWdpbmFsQ3JpdGljYWxQYXRoOiBudW1iZXJbXVxuKTogU2ltdWxhdGlvblJlc3VsdHMgPT4ge1xuICBjb25zdCBhbGxDcml0aWNhbFBhdGhzID0gbmV3IE1hcDxzdHJpbmcsIENyaXRpY2FsUGF0aEVudHJ5PigpO1xuICBhbGxDcml0aWNhbFBhdGhzLnNldChgJHtvcmlnaW5hbENyaXRpY2FsUGF0aH1gLCB7XG4gICAgY291bnQ6IDAsXG4gICAgY3JpdGljYWxQYXRoOiBvcmlnaW5hbENyaXRpY2FsUGF0aC5zbGljZSgpLFxuICAgIGR1cmF0aW9uczogY2hhcnQuVmVydGljZXMubWFwKCh0YXNrOiBUYXNrKSA9PiB0YXNrLmR1cmF0aW9uKSxcbiAgfSk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1TaW11bGF0aW9uTG9vcHM7IGkrKykge1xuICAgIC8vIEdlbmVyYXRlIHJhbmRvbSBkdXJhdGlvbnMgYmFzZWQgb24gZWFjaCBUYXNrcyB1bmNlcnRhaW50eS5cbiAgICBjb25zdCBkdXJhdGlvbnMgPSBjaGFydC5WZXJ0aWNlcy5tYXAoKHQ6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IHJhd0R1cmF0aW9uID0gbmV3IEphY29iaWFuKFxuICAgICAgICB0LmR1cmF0aW9uLCAvLyBBY2NlcHRhYmxlIGRpcmVjdCBhY2Nlc3MgdG8gZHVyYXRpb24uXG4gICAgICAgIHQuZ2V0UmVzb3VyY2UoXCJVbmNlcnRhaW50eVwiKSBhcyBVbmNlcnRhaW50eVxuICAgICAgKS5zYW1wbGUocm5kSW50KE1BWF9SQU5ET00pIC8gTUFYX1JBTkRPTSk7XG4gICAgICByZXR1cm4gcHJlY2lzaW9uLnJvdW5kKHJhd0R1cmF0aW9uKTtcbiAgICB9KTtcblxuICAgIC8vIENvbXB1dGUgdGhlIHNsYWNrIGJhc2VkIG9uIHRob3NlIHJhbmRvbSBkdXJhdGlvbnMuXG4gICAgY29uc3Qgc2xhY2tzUmV0ID0gQ29tcHV0ZVNsYWNrKFxuICAgICAgY2hhcnQsXG4gICAgICAodGFza0luZGV4OiBudW1iZXIpID0+IGR1cmF0aW9uc1t0YXNrSW5kZXhdLFxuICAgICAgcHJlY2lzaW9uLnJvdW5kZXIoKVxuICAgICk7XG4gICAgaWYgKCFzbGFja3NSZXQub2spIHtcbiAgICAgIHRocm93IHNsYWNrc1JldC5lcnJvcjtcbiAgICB9XG5cbiAgICBjb25zdCBjcml0aWNhbFBhdGggPSBDcml0aWNhbFBhdGgoc2xhY2tzUmV0LnZhbHVlLCBwcmVjaXNpb24ucm91bmRlcigpKTtcbiAgICBjb25zdCBjcml0aWNhbFBhdGhBc1N0cmluZyA9IGAke2NyaXRpY2FsUGF0aH1gO1xuICAgIGxldCBwYXRoRW50cnkgPSBhbGxDcml0aWNhbFBhdGhzLmdldChjcml0aWNhbFBhdGhBc1N0cmluZyk7XG4gICAgaWYgKHBhdGhFbnRyeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXRoRW50cnkgPSB7XG4gICAgICAgIGNvdW50OiAwLFxuICAgICAgICBjcml0aWNhbFBhdGg6IGNyaXRpY2FsUGF0aCxcbiAgICAgICAgZHVyYXRpb25zOiBkdXJhdGlvbnMsXG4gICAgICB9O1xuICAgICAgYWxsQ3JpdGljYWxQYXRocy5zZXQoY3JpdGljYWxQYXRoQXNTdHJpbmcsIHBhdGhFbnRyeSk7XG4gICAgfVxuICAgIHBhdGhFbnRyeS5jb3VudCsrO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwYXRoczogYWxsQ3JpdGljYWxQYXRocyxcbiAgICB0YXNrczogY3JpdGljYWxUYXNrRnJlcXVlbmNpZXMoYWxsQ3JpdGljYWxQYXRocywgY2hhcnQpLFxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGNyaXRpY2FsVGFza0ZyZXF1ZW5jaWVzID0gKFxuICBhbGxDcml0aWNhbFBhdGhzOiBNYXA8c3RyaW5nLCBDcml0aWNhbFBhdGhFbnRyeT4sXG4gIGNoYXJ0OiBDaGFydFxuKTogQ3JpdGljYWxQYXRoVGFza0VudHJ5W10gPT4ge1xuICBjb25zdCBjcml0aWFsVGFza3M6IE1hcDxudW1iZXIsIENyaXRpY2FsUGF0aFRhc2tFbnRyeT4gPSBuZXcgTWFwKCk7XG5cbiAgYWxsQ3JpdGljYWxQYXRocy5mb3JFYWNoKCh2YWx1ZTogQ3JpdGljYWxQYXRoRW50cnkpID0+IHtcbiAgICB2YWx1ZS5jcml0aWNhbFBhdGguZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGxldCB0YXNrRW50cnkgPSBjcml0aWFsVGFza3MuZ2V0KHRhc2tJbmRleCk7XG4gICAgICBpZiAodGFza0VudHJ5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGFza0VudHJ5ID0ge1xuICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgIGR1cmF0aW9uOiBjaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLmR1cmF0aW9uLFxuICAgICAgICAgIG51bVRpbWVzQXBwZWFyZWQ6IDAsXG4gICAgICAgIH07XG4gICAgICAgIGNyaXRpYWxUYXNrcy5zZXQodGFza0luZGV4LCB0YXNrRW50cnkpO1xuICAgICAgfVxuICAgICAgdGFza0VudHJ5Lm51bVRpbWVzQXBwZWFyZWQgKz0gdmFsdWUuY291bnQ7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBbLi4uY3JpdGlhbFRhc2tzLnZhbHVlcygpXS5zb3J0KFxuICAgIChhOiBDcml0aWNhbFBhdGhUYXNrRW50cnksIGI6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSk6IG51bWJlciA9PiB7XG4gICAgICByZXR1cm4gYi5kdXJhdGlvbiAtIGEuZHVyYXRpb247XG4gICAgfVxuICApO1xufTtcbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhblwiO1xuaW1wb3J0IHtcbiAgQ3JpdGljYWxQYXRoRW50cnksXG4gIENyaXRpY2FsUGF0aFRhc2tFbnRyeSxcbiAgU2ltdWxhdGlvblJlc3VsdHMsXG4gIHNpbXVsYXRpb24sXG59IGZyb20gXCIuLi9zaW11bGF0aW9uL3NpbXVsYXRpb25cIjtcbmltcG9ydCB7IENoYXJ0IH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0XCI7XG5pbXBvcnQgeyBkaWZmZXJlbmNlIH0gZnJvbSBcIi4uL2RhZy9hbGdvcml0aG1zL2NpcmN1bGFyXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2ltdWxhdGlvblNlbGVjdERldGFpbHMge1xuICBkdXJhdGlvbnM6IG51bWJlcltdIHwgbnVsbDtcbiAgY3JpdGljYWxQYXRoOiBudW1iZXJbXTtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgR2xvYmFsRXZlbnRIYW5kbGVyc0V2ZW50TWFwIHtcbiAgICBcInNpbXVsYXRpb24tc2VsZWN0XCI6IEN1c3RvbUV2ZW50PFNpbXVsYXRpb25TZWxlY3REZXRhaWxzPjtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2ltdWxhdGlvblBhbmVsIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICByZXN1bHRzOiBTaW11bGF0aW9uUmVzdWx0cyA9IHtcbiAgICBwYXRoczogbmV3IE1hcCgpLFxuICAgIHRhc2tzOiBbXSxcbiAgfTtcbiAgY2hhcnQ6IENoYXJ0IHwgbnVsbCA9IG51bGw7XG4gIG51bVNpbXVsYXRpb25Mb29wczogbnVtYmVyID0gMDtcbiAgb3JpZ2luYWxDcml0aWNhbFBhdGg6IG51bWJlcltdID0gW107XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHNpbXVsYXRlKFxuICAgIGNoYXJ0OiBDaGFydCxcbiAgICBudW1TaW11bGF0aW9uTG9vcHM6IG51bWJlcixcbiAgICBvcmlnaW5hbENyaXRpY2FsUGF0aDogbnVtYmVyW11cbiAgKTogbnVtYmVyW10ge1xuICAgIHRoaXMucmVzdWx0cyA9IHNpbXVsYXRpb24oY2hhcnQsIG51bVNpbXVsYXRpb25Mb29wcywgb3JpZ2luYWxDcml0aWNhbFBhdGgpO1xuICAgIHRoaXMuY2hhcnQgPSBjaGFydDtcbiAgICB0aGlzLm51bVNpbXVsYXRpb25Mb29wcyA9IG51bVNpbXVsYXRpb25Mb29wcztcbiAgICB0aGlzLm9yaWdpbmFsQ3JpdGljYWxQYXRoID0gb3JpZ2luYWxDcml0aWNhbFBhdGg7XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHJldHVybiB0aGlzLnJlc3VsdHMudGFza3MubWFwKFxuICAgICAgKHRhc2tFbnRyeTogQ3JpdGljYWxQYXRoVGFza0VudHJ5KSA9PiB0YXNrRW50cnkudGFza0luZGV4XG4gICAgKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMucmVzdWx0cyA9IHtcbiAgICAgIHBhdGhzOiBuZXcgTWFwKCksXG4gICAgICB0YXNrczogW10sXG4gICAgfTtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8U2ltdWxhdGlvblNlbGVjdERldGFpbHM+KFwic2ltdWxhdGlvbi1zZWxlY3RcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBkdXJhdGlvbnM6IG51bGwsXG4gICAgICAgICAgY3JpdGljYWxQYXRoOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcGF0aENsaWNrZWQoa2V5OiBzdHJpbmcpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8U2ltdWxhdGlvblNlbGVjdERldGFpbHM+KFwic2ltdWxhdGlvbi1zZWxlY3RcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBkdXJhdGlvbnM6IHRoaXMucmVzdWx0cy5wYXRocy5nZXQoa2V5KSEuZHVyYXRpb25zLFxuICAgICAgICAgIGNyaXRpY2FsUGF0aDogdGhpcy5yZXN1bHRzLnBhdGhzLmdldChrZXkpIS5jcml0aWNhbFBhdGgsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmVuZGVyKHRoaXMudGVtcGxhdGUoKSwgdGhpcyk7XG4gIH1cblxuICBkaXNwbGF5Q3JpdGljYWxQYXRoRGlmZmVyZW5jZXMoY3JpdGljYWxQYXRoOiBudW1iZXJbXSk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdCByZW1vdmVkID0gZGlmZmVyZW5jZSh0aGlzLm9yaWdpbmFsQ3JpdGljYWxQYXRoLCBjcml0aWNhbFBhdGgpO1xuICAgIGNvbnN0IGFkZGVkID0gZGlmZmVyZW5jZShjcml0aWNhbFBhdGgsIHRoaXMub3JpZ2luYWxDcml0aWNhbFBhdGgpO1xuICAgIGlmIChyZW1vdmVkLmxlbmd0aCA9PT0gMCAmJiBhZGRlZC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBodG1sYE9yaWdpbmFsIENyaXRpY2FsIFBhdGhgO1xuICAgIH1cbiAgICByZXR1cm4gaHRtbGBcbiAgICAgICR7YWRkZWQubWFwKFxuICAgICAgICAodGFza0luZGV4OiBudW1iZXIpID0+IGh0bWxgXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJhZGRlZFwiPiske3RoaXMuY2hhcnQhLlZlcnRpY2VzW3Rhc2tJbmRleF0ubmFtZX08L3NwYW4+XG4gICAgICAgIGBcbiAgICAgICl9XG4gICAgICAke3JlbW92ZWQubWFwKFxuICAgICAgICAodGFza0luZGV4OiBudW1iZXIpID0+IGh0bWxgXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJyZW1vdmVkXCI+LSR7dGhpcy5jaGFydCEuVmVydGljZXNbdGFza0luZGV4XS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgYFxuICAgICAgKX1cbiAgICBgO1xuICB9XG5cbiAgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGlmICh0aGlzLnJlc3VsdHMucGF0aHMuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIGh0bWxgYDtcbiAgICB9XG4gICAgY29uc3QgcGF0aEtleXMgPSBbLi4udGhpcy5yZXN1bHRzLnBhdGhzLmtleXMoKV07XG4gICAgY29uc3Qgc29ydGVkUGF0aEtleXMgPSBwYXRoS2V5cy5zb3J0KChhOiBzdHJpbmcsIGI6IHN0cmluZykgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdGhpcy5yZXN1bHRzLnBhdGhzLmdldChiKSEuY291bnQgLSB0aGlzLnJlc3VsdHMucGF0aHMuZ2V0KGEpIS5jb3VudFxuICAgICAgKTtcbiAgICB9KTtcbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxidXR0b25cbiAgICAgICAgQGNsaWNrPSR7KCkgPT4ge1xuICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgQ2xlYXJcbiAgICAgIDwvYnV0dG9uPlxuXG4gICAgICA8dGFibGUgY2xhc3M9XCJwYXRoc1wiPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPkNvdW50PC90aD5cbiAgICAgICAgICA8dGg+Q3JpdGljYWwgUGF0aDwvdGg+XG4gICAgICAgIDwvdHI+XG4gICAgICAgICR7c29ydGVkUGF0aEtleXMubWFwKFxuICAgICAgICAgIChrZXk6IHN0cmluZykgPT5cbiAgICAgICAgICAgIGh0bWxgPHRyIEBjbGljaz0keygpID0+IHRoaXMucGF0aENsaWNrZWQoa2V5KX0+XG4gICAgICAgICAgICAgIDx0ZD4ke3RoaXMucmVzdWx0cy5wYXRocy5nZXQoa2V5KSEuY291bnR9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICR7dGhpcy5kaXNwbGF5Q3JpdGljYWxQYXRoRGlmZmVyZW5jZXMoXG4gICAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHMucGF0aHMuZ2V0KGtleSkhLmNyaXRpY2FsUGF0aFxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgKX1cbiAgICAgIDwvdGFibGU+XG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+TmFtZTwvdGg+XG4gICAgICAgICAgPHRoPkR1cmF0aW9uPC90aD5cbiAgICAgICAgICA8dGg+RnJlcXVlbmN5ICglKTwvdGg+XG4gICAgICAgIDwvdHI+XG4gICAgICAgICR7dGhpcy5yZXN1bHRzLnRhc2tzLm1hcChcbiAgICAgICAgICAodGFza0VudHJ5OiBDcml0aWNhbFBhdGhUYXNrRW50cnkpID0+XG4gICAgICAgICAgICBodG1sYDx0cj5cbiAgICAgICAgICAgICAgPHRkPiR7dGhpcy5jaGFydCEuVmVydGljZXNbdGFza0VudHJ5LnRhc2tJbmRleF0ubmFtZX08L3RkPlxuICAgICAgICAgICAgICA8dGQ+JHt0YXNrRW50cnkuZHVyYXRpb259PC90ZD5cbiAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICR7TWF0aC5mbG9vcihcbiAgICAgICAgICAgICAgICAgICgxMDAgKiB0YXNrRW50cnkubnVtVGltZXNBcHBlYXJlZCkgLyB0aGlzLm51bVNpbXVsYXRpb25Mb29wc1xuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgKX1cbiAgICAgIDwvdGFibGU+XG4gICAgYDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJzaW11bGF0aW9uLXBhbmVsXCIsIFNpbXVsYXRpb25QYW5lbCk7XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi9leHBsYW5NYWluL2V4cGxhbk1haW4udHNcIjtcbmltcG9ydCB7IFNlYXJjaFR5cGUsIFRhc2tTZWFyY2hDb250cm9sIH0gZnJvbSBcIi4vdGFzay1zZWFyY2gtY29udHJvbHMudHNcIjtcblxuLyoqIFVzZXMgYSB0YXNrLXNlYXJjaC1jb250cm9sIHRvIHNlYXJjaCB0aHJvdWdoIGFsbCBUYXNrcy4gKi9cbmV4cG9ydCBjbGFzcyBTZWFyY2hUYXNrUGFuZWwgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW4gfCBudWxsID0gbnVsbDtcbiAgdGFza1NlYXJjaENvbnRyb2w6IFRhc2tTZWFyY2hDb250cm9sIHwgbnVsbCA9IG51bGw7XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5leHBsYW5NYWluID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImV4cGxhbi1tYWluXCIpO1xuICAgIGlmICghdGhpcy5leHBsYW5NYWluKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2wgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJ0YXNrLXNlYXJjaC1jb250cm9sXCIpO1xuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcInRhc2stY2hhbmdlXCIsIChlKSA9PiB7XG4gICAgICB0aGlzLmV4cGxhbk1haW4hLnNldFNlbGVjdGlvbihlLmRldGFpbC50YXNrSW5kZXgsIGUuZGV0YWlsLmZvY3VzLCB0cnVlKTtcbiAgICB9KTtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJ0YXNrLWZvY3VzXCIsIChlKSA9PlxuICAgICAgdGhpcy5zZXRLZXlib2FyZEZvY3VzVG9JbnB1dChcImZ1bGwtaW5mb1wiKVxuICAgICk7XG4gIH1cblxuICBzZXRLZXlib2FyZEZvY3VzVG9JbnB1dChzZWFyY2hUeXBlOiBTZWFyY2hUeXBlKSB7XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEudGFza3MgPSB0aGlzLmV4cGxhbk1haW4hLnBsYW4uY2hhcnQuVmVydGljZXM7XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEuaW5jbHVkZWRJbmRleGVzID1cbiAgICAgIHRoaXMuZXhwbGFuTWFpbiEucGxhbi5jaGFydC5WZXJ0aWNlcy5tYXAoXG4gICAgICAgIChfLCBpbmRleDogbnVtYmVyKSA9PiBpbmRleFxuICAgICAgKS5zbGljZSgxLCAtMSk7XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEuc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoc2VhcmNoVHlwZSk7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwic2VhcmNoLXRhc2stcGFuZWxcIiwgU2VhcmNoVGFza1BhbmVsKTtcbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQgZnV6enlzb3J0IGZyb20gXCJmdXp6eXNvcnRcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcblxuaW50ZXJmYWNlIFRhc2tDaGFuZ2VEZXRhaWwge1xuICB0YXNrSW5kZXg6IG51bWJlcjtcbiAgZm9jdXM6IGJvb2xlYW47XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJ0YXNrLWNoYW5nZVwiOiBDdXN0b21FdmVudDxUYXNrQ2hhbmdlRGV0YWlsPjtcbiAgICBcInRhc2stZm9jdXNcIjogQ3VzdG9tRXZlbnQ8bnVsbD47XG4gIH1cbn1cblxuLyoqIFRoZSBpbmRleGVzIHJldHVybmVkIGJ5IGZ1enp5c29ydCBpcyBqdXN0IGEgbGlzdCBvZiB0aGUgaW5kZXhlcyBvZiB0aGUgdGhlXG4gKiAgaW5kaXZpZHVhbCBjaGFycyB0aGF0IGhhdmUgYmVlbiBtYXRjaGVkLiBXZSBuZWVkIHRvIHR1cm4gdGhhdCBpbnRvIHBhaXJzIG9mXG4gKiAgbnVtYmVycyB3ZSBjYW4gcGFzcyB0byBTdHJpbmcucHJvdG90eXBlLnNsaWNlKCkuXG4gKlxuICogIFRoZSBvYnNlcnZhdGlvbiBoZXJlIGlzIHRoYXQgaWYgdGhlIHRhcmdldCBzdHJpbmcgaXMgXCJIZWxsb1wiIGFuZCB0aGUgaW5kaWNlc1xuICogIGFyZSBbMiwzXSB0aGVuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHdlIG1hcmt1cCB0aGUgaGlnaGxpZ2h0ZWQgdGFyZ2V0IGFzXG4gKiAgXCJIZTxiPmxsPC9iPm9cIiBvciBcIkhlPGI+bDwvYj48Yj5sPC9iPm9cIi4gVGhhdCBpcywgd2UgY2FuIHNpbXBsaWZ5IGlmIHdlXG4gKiAgYWx3YXlzIHNsaWNlIG91dCBlYWNoIGNoYXJhY3RlciBpbiB0aGUgdGFyZ2V0IHN0cmluZyB0aGF0IG5lZWRzIHRvIGJlXG4gKiAgaGlnaGxpZ2h0ZWQuXG4gKlxuICogIFNvIGluZGV4ZXNUb1JhbmdlcyByZXR1cm5zIGFuIGFycmF5IG9mIGluZGV4ZXMsIHRoYXQgaWYgdGFrZW4gaW4gcGFpcnMsIHdpbGxcbiAqICBhbHRlcm5hdGVseSBzbGljZSBvZmYgcGFydHMgb2YgdGFyZ2V0IHRoYXQgbmVlZCB0byBiZSBlbXBoYXNpemVkLlxuICpcbiAqICBJbiB0aGUgYWJvdmUgZXhhbXBsZSB0YXJnZXQgPSBcIkhlbGxvXCIgYW5kIGluZGV4ZXMgPSBbMiwzXSwgdGhlblxuICogIGluZGV4ZXNUb1JhbmdlcyB3aWxsIHJldHVyblwiXG4gKlxuICogICAgIFswLDIsMywzLDQsNV1cbiAqXG4gKiAgd2hpY2ggd2lsbCBnZW5lcmF0ZSB0aGUgZm9sbG93aW5nIHBhaXJzIGFzIGFyZ3MgdG8gc2xpY2U6XG4gKlxuICogICAgIFswLDJdIEhlXG4gKiAgICAgWzIsM10gbCAgICNcbiAqICAgICBbMywzXVxuICogICAgIFszLDRdIGwgICAjXG4gKiAgICAgWzQsNV0gb1xuICpcbiAqIE5vdGUgdGhhdCBpZiB3ZSBhbHRlcm5hdGUgYm9sZGluZyB0aGVuIG9ubHkgdGhlIHR3byAnbCdzIGdldCBlbXBoYXNpemVkLFxuICogd2hpY2ggaXMgd2hhdCB3ZSB3YW50IChEZW5vdGVkIGJ5ICMgYWJvdmUpLlxuICovXG5jb25zdCBpbmRleGVzVG9SYW5nZXMgPSAoXG4gIGluZGV4ZXM6IFJlYWRvbmx5PG51bWJlcltdPixcbiAgbGVuOiBudW1iZXJcbik6IG51bWJlcltdID0+IHtcbiAgLy8gQ29udmVydCBlYWNoIGluZGV4IG9mIGEgaGlnaGxpZ2h0ZWQgY2hhciBpbnRvIGEgcGFpciBvZiBudW1iZXJzIHdlIGNhbiBwYXNzXG4gIC8vIHRvIHNsaWNlLCBhbmQgdGhlbiBmbGF0dGVuLlxuICBjb25zdCByYW5nZXMgPSBpbmRleGVzLm1hcCgoeDogbnVtYmVyKSA9PiBbeCwgeCArIDFdKS5mbGF0KCk7XG5cbiAgLy8gTm93IHByZXBlbmQgd2l0aCAwIGFuZCBhcHBlbmQgJ2xlbicgc28gdGhhdCB3ZSBoYXZlIHBhaXJzIHRoYXQgd2lsbCBzbGljZVxuICAvLyB0YXJnZXQgZnVsbHkgaW50byBzdWJzdHJpbmdzLiBSZW1lbWJlciB0aGF0IHNsaWNlIHJldHVybnMgY2hhcnMgaW4gW2EsIGIpLFxuICAvLyBpLmUuIFN0cmluZy5zbGljZShhLGIpIHdoZXJlIGIgaXMgb25lIGJleW9uZCB0aGUgbGFzdCBjaGFyIGluIHRoZSBzdHJpbmcgd2VcbiAgLy8gd2FudCB0byBpbmNsdWRlLlxuICByZXR1cm4gWzAsIC4uLnJhbmdlcywgbGVuXTtcbn07XG5cbi8qKiBSZXR1cm5zIHRoZSB0YXJnZXQgc3RyaW5nIGhpZ2hsaWdodGVkIGFyb3VuZCB0aGUgZ2l2ZW4gY2hhcmFjdGVyIGluZGV4ZXMgaW5cbiAqICB0aGUgcmFuZ2VzIGFycmF5LlxuICpcbiAqICBXZSBkb24ndCB1c2UgdGhlIGhpZ2hsaWdodGluZyBmcm9tIGZ1enp5c29ydC5cbiAqL1xuY29uc3QgaGlnaGxpZ2h0ID0gKHJhbmdlczogbnVtYmVyW10sIHRhcmdldDogc3RyaW5nKTogVGVtcGxhdGVSZXN1bHRbXSA9PiB7XG4gIGNvbnN0IHJldDogVGVtcGxhdGVSZXN1bHRbXSA9IFtdO1xuICBsZXQgaW5IaWdobGlnaHQgPSBmYWxzZTtcblxuICAvLyBSdW4gZG93biByYW5nZXMgd2l0aCBhIHNsaWRpbmcgd2luZG93IG9mIGxlbmd0aCAyIGFuZCB1c2UgdGhhdCBhcyB0aGVcbiAgLy8gYXJndW1lbnRzIHRvIHNsaWNlLiBBbHRlcm5hdGUgaGlnaGxpZ2h0aW5nIGVhY2ggc2VnbWVudC5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgY29uc3Qgc3ViID0gdGFyZ2V0LnNsaWNlKHJhbmdlc1tpXSwgcmFuZ2VzW2kgKyAxXSk7XG4gICAgaWYgKGluSGlnaGxpZ2h0KSB7XG4gICAgICByZXQucHVzaChodG1sYDxiPiR7c3VifTwvYj5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0LnB1c2goaHRtbGAke3N1Yn1gKTtcbiAgICB9XG4gICAgaW5IaWdobGlnaHQgPSAhaW5IaWdobGlnaHQ7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKiBSZXR1cm5zIHRoZSB0YXJnZXQgc3RyaW5nIGhpZ2hsaWdodGVkIGFyb3VuZCB0aGUgZ2l2ZW4gY2hhcmFjdGVyIGluZGV4ZXMuXG4gKiAgTm90ZSB0aGF0IHdlIGRvbid0IHVzZSBmdXp6eXNvcnQncyBoaWdobGlnaHQgYmVjYXVzZSB3ZSBoYXZlbid0IHNhbml0aXplZFxuICogIHRoZSBuYW1lcy5cbiAqL1xuY29uc3QgaGlnaGxpZ2h0ZWRUYXJnZXQgPSAoXG4gIGluZGV4ZXM6IFJlYWRvbmx5PG51bWJlcltdPixcbiAgdGFyZ2V0OiBzdHJpbmdcbik6IFRlbXBsYXRlUmVzdWx0W10gPT4ge1xuICByZXR1cm4gaGlnaGxpZ2h0KGluZGV4ZXNUb1JhbmdlcyhpbmRleGVzLCB0YXJnZXQubGVuZ3RoKSwgdGFyZ2V0KTtcbn07XG5cbmNvbnN0IHNlYXJjaFJlc3VsdHMgPSAoc2VhcmNoVGFza1BhbmVsOiBUYXNrU2VhcmNoQ29udHJvbCk6IFRlbXBsYXRlUmVzdWx0W10gPT5cbiAgc2VhcmNoVGFza1BhbmVsLnNlYXJjaFJlc3VsdHMubWFwKFxuICAgICh0YXNrOiBTZWFyY2hSZXN1bHQsIGluZGV4OiBudW1iZXIpID0+XG4gICAgICBodG1sYCA8bGlcbiAgICAgICAgdGFiaW5kZXg9XCIwXCJcbiAgICAgICAgQGNsaWNrPVwiJHsoZTogRXZlbnQpID0+XG4gICAgICAgICAgc2VhcmNoVGFza1BhbmVsLnNlbGVjdFNlYXJjaFJlc3VsdChpbmRleCwgZmFsc2UpfVwiXG4gICAgICAgID9kYXRhLWZvY3VzPSR7aW5kZXggPT09IHNlYXJjaFRhc2tQYW5lbC5mb2N1c0luZGV4fVxuICAgICAgICBkYXRhLWluZGV4PSR7aW5kZXh9XG4gICAgICA+XG4gICAgICAgICR7aGlnaGxpZ2h0ZWRUYXJnZXQodGFzay5pbmRleGVzLCB0YXNrLnRhcmdldCl9XG4gICAgICA8L2xpPmBcbiAgKTtcblxuY29uc3QgdGVtcGxhdGUgPSAoc2VhcmNoVGFza1BhbmVsOiBUYXNrU2VhcmNoQ29udHJvbCk6IFRlbXBsYXRlUmVzdWx0ID0+IGh0bWxgXG4gIDxpbnB1dFxuICAgIGF1dG9jb21wbGV0ZT1cIm9mZlwiXG4gICAgbmFtZT1cInRhc2tfc2VhcmNoXCJcbiAgICBpZD1cInNlYXJjaF9pbnB1dFwiXG4gICAgcGxhY2Vob2xkZXI9XCJTZWFyY2hcIlxuICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICBAaW5wdXQ9XCIkeyhlOiBJbnB1dEV2ZW50KSA9PlxuICAgICAgc2VhcmNoVGFza1BhbmVsLm9uSW5wdXQoKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKX1cIlxuICAgIEBrZXlkb3duPVwiJHsoZTogS2V5Ym9hcmRFdmVudCkgPT4gc2VhcmNoVGFza1BhbmVsLm9uS2V5RG93bihlKX1cIlxuICAgIEBmb2N1cz1cIiR7KCkgPT4gc2VhcmNoVGFza1BhbmVsLnNlYXJjaElucHV0UmVjZWl2ZWRGb2N1cygpfVwiXG4gIC8+XG4gIDx1bD5cbiAgICAke3NlYXJjaFJlc3VsdHMoc2VhcmNoVGFza1BhbmVsKX1cbiAgPC91bD5cbmA7XG5cbmV4cG9ydCB0eXBlIFNlYXJjaFR5cGUgPSBcIm5hbWUtb25seVwiIHwgXCJmdWxsLWluZm9cIjtcblxuY29uc3Qgc2VhcmNoU3RyaW5nRnJvbVRhc2tCdWlsZGVyID0gKFxuICBmdWxsVGFza0xpc3Q6IFRhc2tbXSxcbiAgc2VhcmNoVHlwZTogU2VhcmNoVHlwZSxcbiAgaW5jbHVkZWRJbmRleGVzOiBTZXQ8bnVtYmVyPixcbiAgbWF4TmFtZUxlbmd0aDogbnVtYmVyXG4pOiAoKHRhc2s6IFRhc2spID0+IHN0cmluZykgPT4ge1xuICBpZiAoc2VhcmNoVHlwZSA9PT0gXCJmdWxsLWluZm9cIikge1xuICAgIHJldHVybiAodGFzazogVGFzayk6IHN0cmluZyA9PiB7XG4gICAgICBpZiAoaW5jbHVkZWRJbmRleGVzLnNpemUgIT09IDApIHtcbiAgICAgICAgY29uc3QgdGFza0luZGV4ID0gZnVsbFRhc2tMaXN0LmluZGV4T2YodGFzayk7XG4gICAgICAgIGlmICghaW5jbHVkZWRJbmRleGVzLmhhcyh0YXNrSW5kZXgpKSB7XG4gICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHRhc2sucmVzb3VyY2VzKTtcbiAgICAgIHJlc291cmNlS2V5cy5zb3J0KCk7XG4gICAgICByZXR1cm4gYCR7dGFzay5uYW1lfSAke1wiLVwiLnJlcGVhdChtYXhOYW1lTGVuZ3RoIC0gdGFzay5uYW1lLmxlbmd0aCArIDIpfSAke3Jlc291cmNlS2V5c1xuICAgICAgICAubWFwKChrZXk6IHN0cmluZykgPT4gdGFzay5yZXNvdXJjZXNba2V5XSlcbiAgICAgICAgLmpvaW4oXCIgXCIpfWA7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKHRhc2s6IFRhc2spOiBzdHJpbmcgPT4ge1xuICAgICAgaWYgKGluY2x1ZGVkSW5kZXhlcy5zaXplICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IHRhc2tJbmRleCA9IGZ1bGxUYXNrTGlzdC5pbmRleE9mKHRhc2spO1xuICAgICAgICBpZiAoIWluY2x1ZGVkSW5kZXhlcy5oYXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGFzay5uYW1lO1xuICAgIH07XG4gIH1cbn07XG5cbmludGVyZmFjZSBTZWFyY2hSZXN1bHQge1xuICBvYmo6IFRhc2s7XG4gIGluZGV4ZXM6IFJlYWRvbmx5QXJyYXk8bnVtYmVyPjtcbiAgdGFyZ2V0OiBzdHJpbmc7XG59XG5cbmNvbnN0IHRhc2tMaXN0VG9TZWFyY2hSZXN1bHRzID0gKFxuICB0YXNrczogVGFza1tdLFxuICB0YXNrVG9TZWFyY2hTdHJpbmc6ICh0YXNrOiBUYXNrKSA9PiBzdHJpbmcsXG4gIGluY2x1ZGVkSW5kZXhlczogU2V0PG51bWJlcj5cbik6IFNlYXJjaFJlc3VsdFtdID0+IHtcbiAgcmV0dXJuIHRhc2tzXG4gICAgLmZpbHRlcigoX3Rhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IGluY2x1ZGVkSW5kZXhlcy5oYXMoaW5kZXgpKVxuICAgIC5tYXAoKHQ6IFRhc2spID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9iajogdCxcbiAgICAgICAgaW5kZXhlczogW10sXG4gICAgICAgIHRhcmdldDogdGFza1RvU2VhcmNoU3RyaW5nKHQpLFxuICAgICAgfTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ29udHJvbCBmb3IgdXNpbmcgZnV6enkgc2VhcmNoIG9uIGEgbGlzdCBvZiB0YXNrcy5cbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBUYXNrU2VhcmNoQ29udHJvbCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgX3Rhc2tzOiBUYXNrW10gPSBbXTtcbiAgX2luY2x1ZGVkSW5kZXhlczogU2V0PG51bWJlcj4gPSBuZXcgU2V0KCk7XG4gIGZvY3VzSW5kZXg6IG51bWJlciA9IDA7XG4gIHNlYXJjaFJlc3VsdHM6IFJlYWRvbmx5QXJyYXk8U2VhcmNoUmVzdWx0PiA9IFtdO1xuICBzZWFyY2hUeXBlOiBTZWFyY2hUeXBlID0gXCJuYW1lLW9ubHlcIjtcbiAgdGFza1RvU2VhcmNoU3RyaW5nOiAodGFzazogVGFzaykgPT4gc3RyaW5nID0gKHRhc2s6IFRhc2spID0+IFwiXCI7XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIG9uSW5wdXQoaW5wdXRTdHJpbmc6IHN0cmluZykge1xuICAgIGlmIChpbnB1dFN0cmluZyA9PT0gXCJcIikge1xuICAgICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gdGFza0xpc3RUb1NlYXJjaFJlc3VsdHMoXG4gICAgICAgIHRoaXMuX3Rhc2tzLFxuICAgICAgICB0aGlzLnRhc2tUb1NlYXJjaFN0cmluZyxcbiAgICAgICAgdGhpcy5faW5jbHVkZWRJbmRleGVzXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlYXJjaFJlc3VsdHMgPSBmdXp6eXNvcnQuZ288VGFzaz4oXG4gICAgICAgIGlucHV0U3RyaW5nLFxuICAgICAgICB0aGlzLl90YXNrcy5zbGljZSgxLCAtMSksIC8vIFJlbW92ZSBTdGFydCBhbmQgRmluaXNoIGZyb20gc2VhcmNoIHJhbmdlLlxuICAgICAgICB7XG4gICAgICAgICAga2V5OiB0aGlzLnRhc2tUb1NlYXJjaFN0cmluZyxcbiAgICAgICAgICBsaW1pdDogdGhpcy5fdGFza3MubGVuZ3RoLFxuICAgICAgICAgIHRocmVzaG9sZDogMC4yLFxuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLmZvY3VzSW5kZXggPSAwO1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBvbktleURvd24oZTogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmICh0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFRPRE8gLSBleHRyYWN0IGZyb20gdGhlIHR3byBwbGFjZXMgd2UgZG8gdGhpcy5cbiAgICBjb25zdCBrZXluYW1lID0gYCR7ZS5zaGlmdEtleSA/IFwic2hpZnQtXCIgOiBcIlwifSR7ZS5jdHJsS2V5ID8gXCJjdHJsLVwiIDogXCJcIn0ke2UubWV0YUtleSA/IFwibWV0YS1cIiA6IFwiXCJ9JHtlLmFsdEtleSA/IFwiYWx0LVwiIDogXCJcIn0ke2Uua2V5fWA7XG4gICAgc3dpdGNoIChrZXluYW1lKSB7XG4gICAgICBjYXNlIFwiQXJyb3dEb3duXCI6XG4gICAgICAgIHRoaXMuZm9jdXNJbmRleCA9ICh0aGlzLmZvY3VzSW5kZXggKyAxKSAlIHRoaXMuc2VhcmNoUmVzdWx0cy5sZW5ndGg7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dVcFwiOlxuICAgICAgICB0aGlzLmZvY3VzSW5kZXggPVxuICAgICAgICAgICh0aGlzLmZvY3VzSW5kZXggLSAxICsgdGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aCkgJVxuICAgICAgICAgIHRoaXMuc2VhcmNoUmVzdWx0cy5sZW5ndGg7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiRW50ZXJcIjpcbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoUmVzdWx0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZWxlY3RTZWFyY2hSZXN1bHQodGhpcy5mb2N1c0luZGV4LCBmYWxzZSk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiY3RybC1FbnRlclwiOlxuICAgICAgICBpZiAodGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNlbGVjdFNlYXJjaFJlc3VsdCh0aGlzLmZvY3VzSW5kZXgsIHRydWUpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgY29uc29sZS5sb2codGhpcy5mb2N1c0luZGV4KTtcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgc2VsZWN0U2VhcmNoUmVzdWx0KGluZGV4OiBudW1iZXIsIGZvY3VzOiBib29sZWFuKSB7XG4gICAgY29uc3QgdGFza0luZGV4ID0gdGhpcy5fdGFza3MuaW5kZXhPZih0aGlzLnNlYXJjaFJlc3VsdHNbaW5kZXhdLm9iaik7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgbmV3IEN1c3RvbUV2ZW50PFRhc2tDaGFuZ2VEZXRhaWw+KFwidGFzay1jaGFuZ2VcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICB0YXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICAgICAgICBmb2N1czogZm9jdXMsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gW107XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIHNlYXJjaElucHV0UmVjZWl2ZWRGb2N1cygpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICBuZXcgQ3VzdG9tRXZlbnQ8bnVtYmVyPihcInRhc2stZm9jdXNcIiwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoc2VhcmNoVHlwZTogU2VhcmNoVHlwZSkge1xuICAgIHRoaXMuc2VhcmNoVHlwZSA9IHNlYXJjaFR5cGU7XG4gICAgY29uc3QgaW5wdXRDb250cm9sID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiaW5wdXRcIikhO1xuICAgIGlucHV0Q29udHJvbC5mb2N1cygpO1xuICAgIGlucHV0Q29udHJvbC5zZWxlY3QoKTtcbiAgICB0aGlzLm9uSW5wdXQoaW5wdXRDb250cm9sLnZhbHVlKTtcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgcHVibGljIHNldCB0YXNrcyh0YXNrczogVGFza1tdKSB7XG4gICAgdGhpcy5fdGFza3MgPSB0YXNrcztcbiAgICB0aGlzLmJ1aWxkVGFza1RvU2VhcmNoU3RyaW5nKCk7XG4gIH1cblxuICBwdWJsaWMgc2V0IGluY2x1ZGVkSW5kZXhlcyh2OiBudW1iZXJbXSkge1xuICAgIHRoaXMuX2luY2x1ZGVkSW5kZXhlcyA9IG5ldyBTZXQodik7XG4gICAgdGhpcy5idWlsZFRhc2tUb1NlYXJjaFN0cmluZygpO1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZFRhc2tUb1NlYXJjaFN0cmluZygpIHtcbiAgICBjb25zdCBtYXhOYW1lTGVuZ3RoID0gdGhpcy5fdGFza3MucmVkdWNlPG51bWJlcj4oXG4gICAgICAocHJldjogbnVtYmVyLCB0YXNrOiBUYXNrKTogbnVtYmVyID0+XG4gICAgICAgIHRhc2submFtZS5sZW5ndGggPiBwcmV2ID8gdGFzay5uYW1lLmxlbmd0aCA6IHByZXYsXG4gICAgICAwXG4gICAgKTtcbiAgICB0aGlzLnRhc2tUb1NlYXJjaFN0cmluZyA9IHNlYXJjaFN0cmluZ0Zyb21UYXNrQnVpbGRlcihcbiAgICAgIHRoaXMuX3Rhc2tzLFxuICAgICAgdGhpcy5zZWFyY2hUeXBlLFxuICAgICAgdGhpcy5faW5jbHVkZWRJbmRleGVzLFxuICAgICAgbWF4TmFtZUxlbmd0aFxuICAgICk7XG4gICAgdGhpcy5vbklucHV0KFwiXCIpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcInRhc2stc2VhcmNoLWNvbnRyb2xcIiwgVGFza1NlYXJjaENvbnRyb2wpO1xuIiwgIi8qKiBBIGNvb3JkaW5hdGUgcG9pbnQgb24gdGhlIHJlbmRlcmluZyBzdXJmYWNlLiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIFBvaW50IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBwdCA9ICh4OiBudW1iZXIsIHk6IG51bWJlcik6IFBvaW50ID0+IHtcbiAgcmV0dXJuIHsgeDogeCwgeTogeSB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHB0dCA9IChwOiBbbnVtYmVyLCBudW1iZXJdKTogUG9pbnQgPT4ge1xuICBjb25zdCBbeCwgeV0gPSBwO1xuICByZXR1cm4geyB4OiB4LCB5OiB5IH07XG59O1xuXG5leHBvcnQgY29uc3Qgc3VtID0gKHAxOiBQb2ludCwgcDI6IFBvaW50KTogUG9pbnQgPT4ge1xuICByZXR1cm4ge1xuICAgIHg6IHAxLnggKyBwMi54LFxuICAgIHk6IHAxLnkgKyBwMi55LFxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGFkZCA9IChwMTogUG9pbnQsIHAyOiBbbnVtYmVyLCBudW1iZXJdKTogUG9pbnQgPT4ge1xuICBjb25zdCBbeDIsIHkyXSA9IHAyO1xuICByZXR1cm4ge1xuICAgIHg6IHAxLnggKyB4MixcbiAgICB5OiBwMS55ICsgeTIsXG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgZXF1YWwgPSAocDE6IFBvaW50LCBwMjogUG9pbnQpOiBib29sZWFuID0+XG4gIHAxLnggPT09IHAyLnggJiYgcDEueSA9PT0gcDIueTtcblxuZXhwb3J0IGNvbnN0IGR1cCA9IChwOiBQb2ludCk6IFBvaW50ID0+IHtcbiAgcmV0dXJuIHsgeDogcC54LCB5OiBwLnkgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBkaWZmZXJlbmNlID0gKHAxOiBQb2ludCwgcDI6IFBvaW50KTogW251bWJlciwgbnVtYmVyXSA9PiB7XG4gIHJldHVybiBbcDIueCAtIHAxLngsIHAyLnkgLSBwMS55XTtcbn07XG4iLCAiLyoqXG4gKiBGdW5jdGlvbmFsaXR5IGZvciBjcmVhdGluZyBkcmFnZ2FibGUgZGl2aWRlcnMgYmV0d2VlbiBlbGVtZW50cyBvbiBhIHBhZ2UuXG4gKi9cbmltcG9ydCB7IGNsYW1wIH0gZnJvbSBcIi4uLy4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFBvaW50LCBkdXAsIGVxdWFsLCBwdCB9IGZyb20gXCIuLi8uLi9wb2ludC9wb2ludC50c1wiO1xuXG4vLyBWYWx1ZXMgYXJlIHJldHVybmVkIGFzIHBlcmNlbnRhZ2VzIGFyb3VuZCB0aGUgY3VycmVudCBtb3VzZSBsb2NhdGlvbi4gVGhhdFxuLy8gaXMsIGlmIHdlIGFyZSBpbiBcImNvbHVtblwiIG1vZGUgdGhlbiBgYmVmb3JlYCB3b3VsZCBlcXVhbCB0aGUgbW91c2UgcG9zaXRpb25cbi8vIGFzIGEgJSBvZiB0aGUgd2lkdGggb2YgdGhlIHBhcmVudCBlbGVtZW50IGZyb20gdGhlIGxlZnQgaGFuZCBzaWRlIG9mIHRoZVxuLy8gcGFyZW50IGVsZW1lbnQuIFRoZSBgYWZ0ZXJgIHZhbHVlIGlzIGp1c3QgMTAwLWJlZm9yZS5cbmV4cG9ydCBpbnRlcmZhY2UgRGl2aWRlck1vdmVSZXN1bHQge1xuICBiZWZvcmU6IG51bWJlcjtcbiAgYWZ0ZXI6IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgRGl2aWRlclR5cGUgPSBcImNvbHVtblwiIHwgXCJyb3dcIjtcblxuZXhwb3J0IGNvbnN0IERJVklERVJfTU9WRV9FVkVOVCA9IFwiZGl2aWRlcl9tb3ZlXCI7XG5cbmV4cG9ydCBjb25zdCBSRVNJWklOR19DTEFTUyA9IFwicmVzaXppbmdcIjtcblxuaW50ZXJmYWNlIFJlY3Qge1xuICB0b3A6IG51bWJlcjtcbiAgbGVmdDogbnVtYmVyO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbn1cblxuLyoqIFJldHVybnMgYSBib3VuZGluZyByZWN0YW5nbGUgZm9yIGFuIGVsZW1lbnQgaW4gUGFnZSBjb29yZGluYXRlcywgYXMgb3Bwb3NlZFxuICogdG8gVmlld1BvcnQgY29vcmRpbmF0ZXMsIHdoaWNoIGlzIHdoYXQgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgcmV0dXJucy5cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFBhZ2VSZWN0ID0gKGVsZTogSFRNTEVsZW1lbnQpOiBSZWN0ID0+IHtcbiAgY29uc3Qgdmlld3BvcnRSZWN0ID0gZWxlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZXR1cm4ge1xuICAgIHRvcDogdmlld3BvcnRSZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZLFxuICAgIGxlZnQ6IHZpZXdwb3J0UmVjdC5sZWZ0ICsgd2luZG93LnNjcm9sbFgsXG4gICAgd2lkdGg6IHZpZXdwb3J0UmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHZpZXdwb3J0UmVjdC5oZWlnaHQsXG4gIH07XG59O1xuXG4vKiogRGl2aWRlck1vdmUgaXMgY29yZSBmdW5jdGlvbmFsaXR5IGZvciBjcmVhdGluZyBkcmFnZ2FibGUgZGl2aWRlcnMgYmV0d2VlblxuICogZWxlbWVudHMgb24gYSBwYWdlLlxuICpcbiAqIENvbnN0cnVjdCBhIERpdmlkZXJNb2RlIHdpdGggYSBwYXJlbnQgZWxlbWVudCBhbmQgYSBkaXZpZGVyIGVsZW1lbnQsIHdoZXJlXG4gKiB0aGUgZGl2aWRlciBlbGVtZW50IGlzIHRoZSBlbGVtZW50IGJldHdlZW4gb3RoZXIgcGFnZSBlbGVtZW50cyB0aGF0IGlzXG4gKiBleHBlY3RlZCB0byBiZSBkcmFnZ2VkLiBGb3IgZXhhbXBsZSwgaW4gdGhlIGZvbGxvd2luZyBleGFtcGxlICNjb250YWluZXJcbiAqIHdvdWxkIGJlIHRoZSBgcGFyZW50YCwgYW5kICNkaXZpZGVyIHdvdWxkIGJlIHRoZSBgZGl2aWRlcmAgZWxlbWVudC5cbiAqXG4gKiAgPGRpdiBpZD1jb250YWluZXI+XG4gKiAgICA8ZGl2IGlkPWxlZnQ+PC9kaXY+ICA8ZGl2IGlkPWRpdmlkZXI+PC9kaXY+IDxkaXYgaWQ9cmlnaHQ+PC9kaXY/XG4gKiAgPC9kaXY+XG4gKlxuICogRGl2aWRlck1vZGUgd2FpdHMgZm9yIGEgbW91c2Vkb3duIGV2ZW50IG9uIHRoZSBgZGl2aWRlcmAgZWxlbWVudCBhbmQgdGhlblxuICogd2F0Y2hlcyBtb3VzZSBldmVudHMgZm9yIHRoZSBnaXZlbiBwYXJlbnQgSFRNTEVsZW1lbnQgYW5kIGVtaXRzIGV2ZW50cyBhcm91bmRcbiAqIGRyYWdnaW5nLlxuICpcbiAqIFRoZSBlbWl0dGVkIGV2ZW50IGlzIFwiZGl2aWRlcl9tb3ZlXCIgYW5kIGlzIGEgQ3VzdG9tRXZlbnQ8RGl2aWRlck1vdmVSZXN1bHQ+LlxuICpcbiAqIEl0IGlzIHVwIHRvIHRoZSB1c2VyIG9mIERpdmlkZXJNb3ZlIHRvIGxpc3RlbiBmb3IgdGhlIFwiZGl2aWRlcl9tb3ZlXCIgZXZlbnRzXG4gKiBhbmQgdXBkYXRlIHRoZSBDU1Mgb2YgdGhlIHBhZ2UgYXBwcm9wcmlhdGVseSB0byByZWZsZWN0IHRoZSBwb3NpdGlvbiBvZiB0aGVcbiAqIGRpdmlkZXIuXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgZG93biBhbiBldmVudCB3aWxsIGJlIGVtaXR0ZWQgcGVyaW9kaWNhbGx5IGFzIHRoZSBtb3VzZVxuICogbW92ZXMuXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcmVsZWFzZWQsIG9yIGlmIHRoZSBtb3VzZSBleGl0cyB0aGUgcGFyZW50IEhUTUxFbGVtZW50LCBvbmVcbiAqIGxhc3QgZXZlbnQgaXMgZW1pdHRlZC5cbiAqXG4gKiBXaGlsZSBkcmFnZ2luZyB0aGUgZGl2aWRlciwgdGhlIFwicmVzaXppbmdcIiBjbGFzcyB3aWxsIGJlIGFkZGVkIHRvIHRoZSBwYXJlbnRcbiAqIGVsZW1lbnQuIFRoaXMgY2FuIGJlIHVzZWQgdG8gc2V0IGEgc3R5bGUsIGUuZy4gJ3VzZXItc2VsZWN0OiBub25lJy5cbiAqL1xuZXhwb3J0IGNsYXNzIERpdmlkZXJNb3ZlIHtcbiAgLyoqIFRoZSBwb2ludCB3aGVyZSBkcmFnZ2luZyBzdGFydGVkLCBpbiBQYWdlIGNvb3JkaW5hdGVzLiAqL1xuICBiZWdpbjogUG9pbnQgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGRpbWVuc2lvbnMgb2YgdGhlIHBhcmVudCBlbGVtZW50IGluIFBhZ2UgY29vcmRpbmF0ZXMgYXMgb2YgbW91c2Vkb3duXG4gICAqIG9uIHRoZSBkaXZpZGVyLi4gKi9cbiAgcGFyZW50UmVjdDogUmVjdCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgY3VycmVudCBtb3VzZSBwb3NpdGlvbiBpbiBQYWdlIGNvb3JkaW5hdGVzLiAqL1xuICBjdXJyZW50TW92ZUxvY2F0aW9uOiBQb2ludCA9IHB0KDAsIDApO1xuXG4gIC8qKiBUaGUgbGFzdCBtb3VzZSBwb3NpdGlvbiBpbiBQYWdlIGNvb3JkaW5hdGVzIHJlcG9ydGVkIHZpYSBDdXN0b21FdmVudC4gKi9cbiAgbGFzdE1vdmVTZW50OiBQb2ludCA9IHB0KDAsIDApO1xuXG4gIC8qKiBUaGUgcGFyZW50IGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgZGl2aWRlci4gKi9cbiAgcGFyZW50OiBIVE1MRWxlbWVudDtcblxuICAvKiogVGhlIGRpdmlkZXIgZWxlbWVudCB0byBiZSBkcmFnZ2VkIGFjcm9zcyB0aGUgcGFyZW50IGVsZW1lbnQuICovXG4gIGRpdmlkZXI6IEhUTUxFbGVtZW50O1xuXG4gIC8qKiBUaGUgaGFuZGxlIG9mIHRoZSB3aW5kb3cuc2V0SW50ZXJ2YWwoKS4gKi9cbiAgaW50ZXJudmFsSGFuZGxlOiBudW1iZXIgPSAwO1xuXG4gIC8qKiBUaGUgdHlwZSBvZiBkaXZpZGVyLCBlaXRoZXIgdmVydGljYWwgKFwiY29sdW1uXCIpLCBvciBob3Jpem9udGFsIChcInJvd1wiKS4gKi9cbiAgZGl2aWRlclR5cGU6IERpdmlkZXJUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHBhcmVudDogSFRNTEVsZW1lbnQsXG4gICAgZGl2aWRlcjogSFRNTEVsZW1lbnQsXG4gICAgZGl2aWRlclR5cGU6IERpdmlkZXJUeXBlID0gXCJjb2x1bW5cIlxuICApIHtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLmRpdmlkZXIgPSBkaXZpZGVyO1xuICAgIHRoaXMuZGl2aWRlclR5cGUgPSBkaXZpZGVyVHlwZTtcbiAgICB0aGlzLmRpdmlkZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGRldGFjaCgpIHtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZGl2aWRlci5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICB9XG5cbiAgb25UaW1lb3V0KCkge1xuICAgIGlmICghZXF1YWwodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLCB0aGlzLmxhc3RNb3ZlU2VudCkpIHtcbiAgICAgIGxldCBkaWZmUGVyY2VudDogbnVtYmVyID0gMDtcbiAgICAgIGlmICh0aGlzLmRpdmlkZXJUeXBlID09PSBcImNvbHVtblwiKSB7XG4gICAgICAgIGRpZmZQZXJjZW50ID1cbiAgICAgICAgICAoMTAwICogKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54IC0gdGhpcy5wYXJlbnRSZWN0IS5sZWZ0KSkgL1xuICAgICAgICAgIHRoaXMucGFyZW50UmVjdCEud2lkdGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaWZmUGVyY2VudCA9XG4gICAgICAgICAgKDEwMCAqICh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSAtIHRoaXMucGFyZW50UmVjdCEudG9wKSkgL1xuICAgICAgICAgIHRoaXMucGFyZW50UmVjdCEuaGVpZ2h0O1xuICAgICAgfVxuICAgICAgLy8gVE9ETyAtIFNob3VsZCBjbGFtcCBiZSBzZXR0YWJsZSBpbiB0aGUgY29uc3RydWN0b3I/XG4gICAgICBkaWZmUGVyY2VudCA9IGNsYW1wKGRpZmZQZXJjZW50LCA1LCA5NSk7XG5cbiAgICAgIHRoaXMucGFyZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudDxEaXZpZGVyTW92ZVJlc3VsdD4oRElWSURFUl9NT1ZFX0VWRU5ULCB7XG4gICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICBiZWZvcmU6IGRpZmZQZXJjZW50LFxuICAgICAgICAgICAgYWZ0ZXI6IDEwMCAtIGRpZmZQZXJjZW50LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgdGhpcy5sYXN0TW92ZVNlbnQgPSBkdXAodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBtb3VzZW1vdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54ID0gZS5wYWdlWDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSA9IGUucGFnZVk7XG4gIH1cblxuICBtb3VzZWRvd24oZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuaW50ZXJudmFsSGFuZGxlID0gd2luZG93LnNldEludGVydmFsKHRoaXMub25UaW1lb3V0LmJpbmQodGhpcyksIDE2KTtcbiAgICB0aGlzLnBhcmVudFJlY3QgPSBnZXRQYWdlUmVjdCh0aGlzLnBhcmVudCk7XG5cbiAgICB0aGlzLnBhcmVudC5jbGFzc0xpc3QuYWRkKFJFU0laSU5HX0NMQVNTKTtcblxuICAgIHRoaXMucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VsZWF2ZS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuYmVnaW4gPSBwdChlLnBhZ2VYLCBlLnBhZ2VZKTtcbiAgfVxuXG4gIG1vdXNldXAoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZmluaXNoZWQocHQoZS5wYWdlWCwgZS5wYWdlWSkpO1xuICB9XG5cbiAgbW91c2VsZWF2ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maW5pc2hlZChwdChlLnBhZ2VYLCBlLnBhZ2VZKSk7XG4gIH1cblxuICBmaW5pc2hlZChlbmQ6IFBvaW50KSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuXG4gICAgdGhpcy5wYXJlbnQuY2xhc3NMaXN0LnJlbW92ZShSRVNJWklOR19DTEFTUyk7XG5cbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBlbmQ7XG4gICAgdGhpcy5vblRpbWVvdXQoKTtcbiAgICB0aGlzLmJlZ2luID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBwdCgwLCAwKTtcbiAgICB0aGlzLmxhc3RNb3ZlU2VudCA9IHB0KDAsIDApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgUG9pbnQsIGR1cCwgZXF1YWwsIHB0IH0gZnJvbSBcIi4uLy4uL3BvaW50L3BvaW50LnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhZ1JhbmdlIHtcbiAgYmVnaW46IFBvaW50O1xuICBlbmQ6IFBvaW50O1xufVxuXG5leHBvcnQgY29uc3QgRFJBR19SQU5HRV9FVkVOVCA9IFwiZHJhZ3JhbmdlXCI7XG5cbi8qKiBNb3VzZU1vdmUgd2F0Y2hlcyBtb3VzZSBldmVudHMgZm9yIGEgZ2l2ZW4gSFRNTEVsZW1lbnQgYW5kIGVtaXRzXG4gKiBldmVudHMgYXJvdW5kIGRyYWdnaW5nLlxuICpcbiAqIFRoZSBlbWl0dGVkIGV2ZW50IGlzIFwiZHJhZ3JhbmdlXCIgYW5kIGlzIGEgQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPi5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyBwcmVzc2VkIGRvd24gaW4gdGhlIEhUTUxFbGVtZW50IGFuIGV2ZW50IHdpbGwgYmVcbiAqIGVtaXR0ZWQgcGVyaW9kaWNhbGx5IGFzIHRoZSBtb3VzZSBtb3Zlcy5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyByZWxlYXNlZCwgb3IgZXhpdHMgdGhlIEhUTUxFbGVtZW50IG9uZSBsYXN0IGV2ZW50XG4gKiBpcyBlbWl0dGVkLlxuICovXG5leHBvcnQgY2xhc3MgTW91c2VEcmFnIHtcbiAgYmVnaW46IFBvaW50IHwgbnVsbCA9IG51bGw7XG4gIGN1cnJlbnRNb3ZlTG9jYXRpb246IFBvaW50ID0gcHQoMCwgMCk7XG4gIGxhc3RNb3ZlU2VudDogUG9pbnQgPSBwdCgwLCAwKTtcbiAgZWxlOiBIVE1MRWxlbWVudDtcbiAgaW50ZXJudmFsSGFuZGxlOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGVsZTogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZSA9IGVsZTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZXVwLmJpbmQodGhpcykpO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXRhY2goKSB7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2Vkb3duLmJpbmQodGhpcykpO1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICB9XG5cbiAgb25UaW1lb3V0KCkge1xuICAgIGlmICghZXF1YWwodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLCB0aGlzLmxhc3RNb3ZlU2VudCkpIHtcbiAgICAgIHRoaXMuZWxlLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudDxEcmFnUmFuZ2U+KERSQUdfUkFOR0VfRVZFTlQsIHtcbiAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgIGJlZ2luOiBkdXAodGhpcy5iZWdpbiEpLFxuICAgICAgICAgICAgZW5kOiBkdXAodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHRoaXMubGFzdE1vdmVTZW50ID0gZHVwKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgbW91c2Vtb3ZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCA9IGUub2Zmc2V0WDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSA9IGUub2Zmc2V0WTtcbiAgfVxuXG4gIG1vdXNlZG93bihlOiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5pbnRlcm52YWxIYW5kbGUgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5vblRpbWVvdXQuYmluZCh0aGlzKSwgMTYpO1xuICAgIHRoaXMuYmVnaW4gPSBwdChlLm9mZnNldFgsIGUub2Zmc2V0WSk7XG4gIH1cblxuICBtb3VzZXVwKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmZpbmlzaGVkKHB0KGUub2Zmc2V0WCwgZS5vZmZzZXRZKSk7XG4gIH1cblxuICBtb3VzZWxlYXZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZpbmlzaGVkKHB0KGUub2Zmc2V0WCwgZS5vZmZzZXRZKSk7XG4gIH1cblxuICBmaW5pc2hlZChlbmQ6IFBvaW50KSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IGVuZDtcbiAgICB0aGlzLm9uVGltZW91dCgpO1xuICAgIHRoaXMuYmVnaW4gPSBudWxsO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IHB0KDAsIDApO1xuICAgIHRoaXMubGFzdE1vdmVTZW50ID0gcHQoMCwgMCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBQb2ludCwgZHVwLCBlcXVhbCwgcHQgfSBmcm9tIFwiLi4vLi4vcG9pbnQvcG9pbnQudHNcIjtcblxuLyoqIE1vdXNlTW92ZSB3YXRjaGVzIG1vdXNlIGV2ZW50cyBmb3IgYSBnaXZlbiBIVE1MRWxlbWVudCBhbmQgcmVjb3JkcyB0aGUgbW9zdFxuICogIHJlY2VudCBsb2NhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vdXNlTW92ZSB7XG4gIGN1cnJlbnRNb3ZlTG9jYXRpb246IFBvaW50ID0gcHQoMCwgMCk7XG4gIGxhc3RSZWFkTG9jYXRpb246IFBvaW50ID0gcHQoMCwgMCk7XG4gIGVsZTogSFRNTEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoZWxlOiBIVE1MRWxlbWVudCkge1xuICAgIHRoaXMuZWxlID0gZWxlO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZGV0YWNoKCkge1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBtb3VzZW1vdmUoZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54ID0gZS5vZmZzZXRYO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi55ID0gZS5vZmZzZXRZO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYSBQb2ludCBpZiB0aGUgbW91c2UgaGFkIG1vdmVkIHNpbmNlIHRoZSBsYXN0IHJlYWQsIG90aGVyd2lzZVxuICAgKiByZXR1cm5zIG51bGwuXG4gICAqL1xuICByZWFkTG9jYXRpb24oKTogUG9pbnQgfCBudWxsIHtcbiAgICBpZiAoZXF1YWwodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLCB0aGlzLmxhc3RSZWFkTG9jYXRpb24pKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5sYXN0UmVhZExvY2F0aW9uID0gZHVwKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbik7XG4gICAgcmV0dXJuIGR1cCh0aGlzLmxhc3RSZWFkTG9jYXRpb24pO1xuICB9XG59XG4iLCAiZXhwb3J0IGNvbnN0IE1JTl9ESVNQTEFZX1JBTkdFID0gNztcblxuLyoqIFJlcHJlc2VudHMgYSByYW5nZSBvZiBkYXlzIG92ZXIgd2hpY2ggdG8gZGlzcGxheSBhIHpvb21lZCBpbiB2aWV3LCB1c2luZ1xuICogdGhlIGhhbGYtb3BlbiBpbnRlcnZhbCBbYmVnaW4sIGVuZCkuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXNwbGF5UmFuZ2Uge1xuICBwcml2YXRlIF9iZWdpbjogbnVtYmVyO1xuICBwcml2YXRlIF9lbmQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihiZWdpbjogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xuICAgIHRoaXMuX2JlZ2luID0gYmVnaW47XG4gICAgdGhpcy5fZW5kID0gZW5kO1xuICAgIGlmICh0aGlzLl9iZWdpbiA+IHRoaXMuX2VuZCkge1xuICAgICAgW3RoaXMuX2VuZCwgdGhpcy5fYmVnaW5dID0gW3RoaXMuX2JlZ2luLCB0aGlzLl9lbmRdO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZW5kIC0gdGhpcy5fYmVnaW4gPCBNSU5fRElTUExBWV9SQU5HRSkge1xuICAgICAgdGhpcy5fZW5kID0gdGhpcy5fYmVnaW4gKyBNSU5fRElTUExBWV9SQU5HRTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgaW4oeDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHggPj0gdGhpcy5fYmVnaW4gJiYgeCA8PSB0aGlzLl9lbmQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJlZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2JlZ2luO1xuICB9XG5cbiAgcHVibGljIGdldCBlbmQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZW5kO1xuICB9XG5cbiAgcHVibGljIGdldCByYW5nZUluRGF5cygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9lbmQgLSB0aGlzLl9iZWdpbjtcbiAgfVxufVxuIiwgImltcG9ydCB7IERpcmVjdGVkRWRnZSwgRWRnZXMgfSBmcm9tIFwiLi4vLi4vZGFnL2RhZ1wiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IFNwYW4gfSBmcm9tIFwiLi4vLi4vc2xhY2svc2xhY2tcIjtcbmltcG9ydCB7IENoYXJ0LCBDaGFydFZhbGlkYXRlLCBUYXNrLCBUYXNrcyB9IGZyb20gXCIuLi9jaGFydFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoYXJ0TGlrZSB7XG4gIFZlcnRpY2VzOiBUYXNrcztcbiAgRWRnZXM6IEVkZ2VzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZpbHRlclJlc3VsdCB7XG4gIGNoYXJ0TGlrZTogQ2hhcnRMaWtlO1xuICBkaXNwbGF5T3JkZXI6IG51bWJlcltdO1xuICBlbXBoYXNpemVkVGFza3M6IG51bWJlcltdO1xuICBzcGFuczogU3BhbltdO1xuICBsYWJlbHM6IHN0cmluZ1tdO1xuICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPjtcbiAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj47XG4gIHNlbGVjdGVkVGFza0luZGV4OiBudW1iZXI7XG59XG5cbi8qKiBVc2VkIGZvciBmaWx0ZXJpbmcgdGFza3MsIHJldHVybnMgVHJ1ZSBpZiB0aGUgdGFzayBpcyB0byBiZSBpbmNsdWRlZCBpbiB0aGVcbiAqIGZpbHRlcmVkIHJlc3VsdHMuICovXG5leHBvcnQgdHlwZSBGaWx0ZXJGdW5jID0gKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IGJvb2xlYW47XG5cbi8qKiBGaWx0ZXJzIHRoZSBjb250ZW50cyBvZiB0aGUgQ2hhcnQgYmFzZWQgb24gdGhlIGZpbHRlckZ1bmMuXG4gKlxuICogc2VsZWN0ZWRUYXNrSW5kZXggd2lsbCBiZSByZXR1cm5lZCBhcyAtMSBpZiB0aGUgc2VsZWN0ZWQgdGFzayBnZXRzIGZpbHRlcmVkXG4gKiBvdXQuXG4gKi9cbmV4cG9ydCBjb25zdCBmaWx0ZXIgPSAoXG4gIGNoYXJ0OiBDaGFydCxcbiAgZmlsdGVyRnVuYzogRmlsdGVyRnVuYyB8IG51bGwsXG4gIGVtcGhhc2l6ZWRUYXNrczogbnVtYmVyW10sXG4gIHNwYW5zOiBTcGFuW10sXG4gIGxhYmVsczogc3RyaW5nW10sXG4gIHNlbGVjdGVkVGFza0luZGV4OiBudW1iZXJcbik6IFJlc3VsdDxGaWx0ZXJSZXN1bHQ+ID0+IHtcbiAgY29uc3QgdnJldCA9IENoYXJ0VmFsaWRhdGUoY2hhcnQpO1xuICBpZiAoIXZyZXQub2spIHtcbiAgICByZXR1cm4gdnJldDtcbiAgfVxuICBjb25zdCB0b3BvbG9naWNhbE9yZGVyID0gdnJldC52YWx1ZTtcbiAgaWYgKGZpbHRlckZ1bmMgPT09IG51bGwpIHtcbiAgICBjb25zdCBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY2hhcnQuVmVydGljZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleC5zZXQoaW5kZXgsIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIGNoYXJ0TGlrZTogY2hhcnQsXG4gICAgICBkaXNwbGF5T3JkZXI6IHZyZXQudmFsdWUsXG4gICAgICBlbXBoYXNpemVkVGFza3M6IGVtcGhhc2l6ZWRUYXNrcyxcbiAgICAgIHNwYW5zOiBzcGFucyxcbiAgICAgIGxhYmVsczogbGFiZWxzLFxuICAgICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LFxuICAgICAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXg6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXgsXG4gICAgfSk7XG4gIH1cbiAgY29uc3QgdGFza3M6IFRhc2tzID0gW107XG4gIGNvbnN0IGVkZ2VzOiBFZGdlcyA9IFtdO1xuICBjb25zdCBkaXNwbGF5T3JkZXI6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGZpbHRlcmVkU3BhbnM6IFNwYW5bXSA9IFtdO1xuICBjb25zdCBmaWx0ZXJlZExhYmVsczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gIGNvbnN0IGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleDogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcblxuICAvLyBGaXJzdCBmaWx0ZXIgdGhlIHRhc2tzLlxuICBjaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBvcmlnaW5hbEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBpZiAoZmlsdGVyRnVuYyh0YXNrLCBvcmlnaW5hbEluZGV4KSkge1xuICAgICAgdGFza3MucHVzaCh0YXNrKTtcbiAgICAgIGZpbHRlcmVkU3BhbnMucHVzaChzcGFuc1tvcmlnaW5hbEluZGV4XSk7XG4gICAgICBmaWx0ZXJlZExhYmVscy5wdXNoKGxhYmVsc1tvcmlnaW5hbEluZGV4XSk7XG4gICAgICBjb25zdCBuZXdJbmRleCA9IHRhc2tzLmxlbmd0aCAtIDE7XG4gICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguc2V0KG9yaWdpbmFsSW5kZXgsIG5ld0luZGV4KTtcbiAgICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LnNldChuZXdJbmRleCwgb3JpZ2luYWxJbmRleCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBOb3cgZmlsdGVyIHRoZSBlZGdlcyB3aGlsZSBhbHNvIHJld3JpdGluZyB0aGVtLlxuICBjaGFydC5FZGdlcy5mb3JFYWNoKChkaXJlY3RlZEVkZ2U6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGlmIChcbiAgICAgICFmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguaGFzKGRpcmVjdGVkRWRnZS5pKSB8fFxuICAgICAgIWZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5oYXMoZGlyZWN0ZWRFZGdlLmopXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVkZ2VzLnB1c2goXG4gICAgICBuZXcgRGlyZWN0ZWRFZGdlKFxuICAgICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KGRpcmVjdGVkRWRnZS5pKSxcbiAgICAgICAgZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChkaXJlY3RlZEVkZ2UuailcbiAgICAgIClcbiAgICApO1xuICB9KTtcblxuICAvLyBOb3cgZmlsdGVyIGFuZCByZWluZGV4IHRoZSB0b3BvbG9naWNhbC9kaXNwbGF5IG9yZGVyLlxuICB0b3BvbG9naWNhbE9yZGVyLmZvckVhY2goKG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrOiBUYXNrID0gY2hhcnQuVmVydGljZXNbb3JpZ2luYWxUYXNrSW5kZXhdO1xuICAgIGlmICghZmlsdGVyRnVuYyh0YXNrLCBvcmlnaW5hbFRhc2tJbmRleCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZGlzcGxheU9yZGVyLnB1c2goZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChvcmlnaW5hbFRhc2tJbmRleCkhKTtcbiAgfSk7XG5cbiAgLy8gUmUtaW5kZXggaGlnaGxpZ2h0ZWQgdGFza3MuXG4gIGNvbnN0IHVwZGF0ZWRFbXBoYXNpemVkVGFza3MgPSBlbXBoYXNpemVkVGFza3MubWFwKFxuICAgIChvcmlnaW5hbFRhc2tJbmRleDogbnVtYmVyKTogbnVtYmVyID0+XG4gICAgICBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KG9yaWdpbmFsVGFza0luZGV4KSFcbiAgKTtcblxuICByZXR1cm4gb2soe1xuICAgIGNoYXJ0TGlrZToge1xuICAgICAgRWRnZXM6IGVkZ2VzLFxuICAgICAgVmVydGljZXM6IHRhc2tzLFxuICAgIH0sXG4gICAgZGlzcGxheU9yZGVyOiBkaXNwbGF5T3JkZXIsXG4gICAgZW1waGFzaXplZFRhc2tzOiB1cGRhdGVkRW1waGFzaXplZFRhc2tzLFxuICAgIHNwYW5zOiBmaWx0ZXJlZFNwYW5zLFxuICAgIGxhYmVsczogZmlsdGVyZWRMYWJlbHMsXG4gICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LFxuICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4OiBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXgsXG4gICAgc2VsZWN0ZWRUYXNrSW5kZXg6IGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5nZXQoc2VsZWN0ZWRUYXNrSW5kZXgpIHx8IC0xLFxuICB9KTtcbn07XG4iLCAiaW1wb3J0IHsgY2xhbXAgfSBmcm9tIFwiLi4vLi4vbWV0cmljcy9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUmVuZGVyT3B0aW9ucyB9IGZyb20gXCIuLi9yZW5kZXJlci50c1wiO1xuaW1wb3J0IHsgUG9pbnQsIGFkZCwgcHQgfSBmcm9tIFwiLi4vLi4vcG9pbnQvcG9pbnQudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEYXlSb3cge1xuICBkYXk6IG51bWJlcjtcbiAgcm93OiBudW1iZXI7XG59XG5cbi8qKiBGZWF0dXJlcyBvZiB0aGUgY2hhcnQgd2UgY2FuIGFzayBmb3IgY29vcmRpbmF0ZXMgb2YsIHdoZXJlIHRoZSB2YWx1ZSByZXR1cm5lZCBpc1xuICogdGhlIHRvcCBsZWZ0IGNvb3JkaW5hdGUgb2YgdGhlIGZlYXR1cmUuXG4gKi9cbmV4cG9ydCBlbnVtIEZlYXR1cmUge1xuICB0YXNrTGluZVN0YXJ0LFxuICB0ZXh0U3RhcnQsXG4gIGdyb3VwVGV4dFN0YXJ0LFxuICBwZXJjZW50U3RhcnQsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9wLFxuICB2ZXJ0aWNhbEFycm93RGVzdEJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdCxcbiAgdmVydGljYWxBcnJvd1N0YXJ0LFxuICBob3Jpem9udGFsQXJyb3dTdGFydCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcCxcbiAgdmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lVG9wLFxuICB2ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tLFxuICBob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmUsXG4gIGdyb3VwRW52ZWxvcGVTdGFydCxcbiAgdGFza0VudmVsb3BlVG9wLFxuXG4gIGRpc3BsYXlSYW5nZVRvcCxcbiAgdGFza1Jvd0JvdHRvbSxcblxuICB0aW1lTWFya1N0YXJ0LFxuICB0aW1lTWFya0VuZCxcbiAgdGltZVRleHRTdGFydCxcblxuICBncm91cFRpdGxlVGV4dFN0YXJ0LFxuXG4gIHRhc2tzQ2xpcFJlY3RPcmlnaW4sXG4gIGdyb3VwQnlPcmlnaW4sXG59XG5cbi8qKiBTaXplcyBvZiBmZWF0dXJlcyBvZiBhIHJlbmRlcmVkIGNoYXJ0LiAqL1xuZXhwb3J0IGVudW0gTWV0cmljIHtcbiAgdGFza0xpbmVIZWlnaHQsXG4gIHBlcmNlbnRIZWlnaHQsXG4gIGFycm93SGVhZEhlaWdodCxcbiAgYXJyb3dIZWFkV2lkdGgsXG4gIG1pbGVzdG9uZURpYW1ldGVyLFxuICBsaW5lRGFzaExpbmUsXG4gIGxpbmVEYXNoR2FwLFxuICB0ZXh0WE9mZnNldCxcbiAgbWluVGFza1dpZHRoUHgsXG4gIHJvd0hlaWdodCxcbn1cblxuLyoqIE1ha2VzIGEgbnVtYmVyIG9kZCwgYWRkcyBvbmUgaWYgZXZlbi4gKi9cbmNvbnN0IG1ha2VPZGQgPSAobjogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgaWYgKG4gJSAyID09PSAwKSB7XG4gICAgcmV0dXJuIG4gKyAxO1xuICB9XG4gIHJldHVybiBuO1xufTtcblxuLyoqIFNjYWxlIGNvbnNvbGlkYXRlcyBhbGwgY2FsY3VsYXRpb25zIGFyb3VuZCByZW5kZXJpbmcgYSBjaGFydCBvbnRvIGEgc3VyZmFjZS4gKi9cbmV4cG9ydCBjbGFzcyBTY2FsZSB7XG4gIHByaXZhdGUgZGF5V2lkdGhQeDogbnVtYmVyO1xuICBwcml2YXRlIHJvd0hlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgYmxvY2tTaXplUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSB0YXNrSGVpZ2h0UHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBsaW5lV2lkdGhQeDogbnVtYmVyO1xuICBwcml2YXRlIG1hcmdpblNpemVQeDogbnVtYmVyO1xuICBwcml2YXRlIHRpbWVsaW5lSGVpZ2h0UHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBvcmlnaW46IFBvaW50O1xuICBwcml2YXRlIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXI7XG4gIHByaXZhdGUgZ3JvdXBCeUNvbHVtbldpZHRoUHg6IG51bWJlcjtcblxuICBwcml2YXRlIHRpbWVsaW5lT3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSB0YXNrc09yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgZ3JvdXBCeU9yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgdGFza3NDbGlwUmVjdE9yaWdpbjogUG9pbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgICBjYW52YXNXaWR0aFB4OiBudW1iZXIsXG4gICAgdG90YWxOdW1iZXJPZkRheXM6IG51bWJlcixcbiAgICBtYXhHcm91cE5hbWVMZW5ndGg6IG51bWJlciA9IDBcbiAgKSB7XG4gICAgdGhpcy50b3RhbE51bWJlck9mRGF5cyA9IHRvdGFsTnVtYmVyT2ZEYXlzO1xuICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggPSBtYXhHcm91cE5hbWVMZW5ndGggKiBvcHRzLmZvbnRTaXplUHg7XG5cbiAgICB0aGlzLmJsb2NrU2l6ZVB4ID0gTWF0aC5mbG9vcihvcHRzLmZvbnRTaXplUHggLyAzKTtcbiAgICB0aGlzLnRhc2tIZWlnaHRQeCA9IG1ha2VPZGQoTWF0aC5mbG9vcigodGhpcy5ibG9ja1NpemVQeCAqIDMpIC8gNCkpO1xuICAgIHRoaXMubGluZVdpZHRoUHggPSBtYWtlT2RkKE1hdGguZmxvb3IodGhpcy50YXNrSGVpZ2h0UHggLyAzKSk7XG4gICAgY29uc3QgbWlsZXN0b25lUmFkaXVzID0gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4IC8gMikgKyB0aGlzLmxpbmVXaWR0aFB4O1xuICAgIHRoaXMubWFyZ2luU2l6ZVB4ID0gbWlsZXN0b25lUmFkaXVzO1xuICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCA9IG9wdHMuaGFzVGltZWxpbmVcbiAgICAgID8gTWF0aC5jZWlsKChvcHRzLmZvbnRTaXplUHggKiA0KSAvIDMpXG4gICAgICA6IDA7XG5cbiAgICB0aGlzLnRpbWVsaW5lT3JpZ2luID0gcHQobWlsZXN0b25lUmFkaXVzLCAwKTtcbiAgICB0aGlzLmdyb3VwQnlPcmlnaW4gPSBwdCgwLCBtaWxlc3RvbmVSYWRpdXMgKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHgpO1xuXG4gICAgbGV0IGJlZ2luT2Zmc2V0ID0gMDtcbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UgPT09IG51bGwgfHwgb3B0cy5kaXNwbGF5UmFuZ2VVc2FnZSA9PT0gXCJoaWdobGlnaHRcIikge1xuICAgICAgLy8gRG8gbm90IGZvcmNlIGRheVdpZHRoUHggdG8gYW4gaW50ZWdlciwgaXQgY291bGQgZ28gdG8gMCBhbmQgY2F1c2UgYWxsXG4gICAgICAvLyB0YXNrcyB0byBiZSByZW5kZXJlZCBhdCAwIHdpZHRoLlxuICAgICAgdGhpcy5kYXlXaWR0aFB4ID1cbiAgICAgICAgKGNhbnZhc1dpZHRoUHggLSB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gMiAqIHRoaXMubWFyZ2luU2l6ZVB4KSAvXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzO1xuICAgICAgdGhpcy5vcmlnaW4gPSBwdCgwLCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2hvdWxkIHdlIHNldCB4LW1hcmdpbnMgdG8gMCBpZiBhIFN1YlJhbmdlIGlzIHJlcXVlc3RlZD9cbiAgICAgIC8vIE9yIHNob3VsZCB3ZSB0b3RhbGx5IGRyb3AgYWxsIG1hcmdpbnMgZnJvbSBoZXJlIGFuZCBqdXN0IHVzZVxuICAgICAgLy8gQ1NTIG1hcmdpbnMgb24gdGhlIGNhbnZhcyBlbGVtZW50P1xuICAgICAgdGhpcy5kYXlXaWR0aFB4ID1cbiAgICAgICAgKGNhbnZhc1dpZHRoUHggLSB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gMiAqIHRoaXMubWFyZ2luU2l6ZVB4KSAvXG4gICAgICAgIG9wdHMuZGlzcGxheVJhbmdlLnJhbmdlSW5EYXlzO1xuICAgICAgYmVnaW5PZmZzZXQgPSBNYXRoLmZsb29yKFxuICAgICAgICB0aGlzLmRheVdpZHRoUHggKiBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiArIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgICApO1xuICAgICAgdGhpcy5vcmlnaW4gPSBwdCgtYmVnaW5PZmZzZXQgKyB0aGlzLm1hcmdpblNpemVQeCwgMCk7XG4gICAgfVxuXG4gICAgdGhpcy50YXNrc09yaWdpbiA9IHB0KFxuICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIGJlZ2luT2Zmc2V0ICsgbWlsZXN0b25lUmFkaXVzLFxuICAgICAgdGhpcy50aW1lbGluZUhlaWdodFB4ICsgbWlsZXN0b25lUmFkaXVzXG4gICAgKTtcblxuICAgIHRoaXMudGFza3NDbGlwUmVjdE9yaWdpbiA9IHB0KFxuICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCxcbiAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICk7XG5cbiAgICBpZiAob3B0cy5oYXNUZXh0KSB7XG4gICAgICB0aGlzLnJvd0hlaWdodFB4ID0gNiAqIHRoaXMuYmxvY2tTaXplUHg7IC8vIFRoaXMgbWlnaHQgYWxzbyBiZSBgKGNhbnZhc0hlaWdodFB4IC0gMiAqIG9wdHMubWFyZ2luU2l6ZVB4KSAvIG51bWJlclN3aW1MYW5lc2AgaWYgaGVpZ2h0IGlzIHN1cHBsaWVkP1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJvd0hlaWdodFB4ID0gMS4xICogdGhpcy5ibG9ja1NpemVQeDtcbiAgICB9XG4gIH1cblxuICAvKiogVGhlIGhlaWdodCBvZiB0aGUgY2hhcnQuIE5vdGUgdGhhdCBpdCdzIG5vdCBjb25zdHJhaW5lZCBieSB0aGUgY2FudmFzLiAqL1xuICBwdWJsaWMgaGVpZ2h0KG1heFJvd3M6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIChcbiAgICAgIG1heFJvd3MgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4ICsgMiAqIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBkYXlSb3dGcm9tUG9pbnQocG9pbnQ6IFBvaW50KTogRGF5Um93IHtcbiAgICAvLyBUaGlzIHNob3VsZCBhbHNvIGNsYW1wIHRoZSByZXR1cm5lZCAneCcgdmFsdWUgdG8gWzAsIG1heFJvd3MpLlxuICAgIHJldHVybiB7XG4gICAgICBkYXk6IGNsYW1wKFxuICAgICAgICBNYXRoLmZsb29yKFxuICAgICAgICAgICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAqIHBvaW50LnggLVxuICAgICAgICAgICAgdGhpcy5vcmlnaW4ueCAtXG4gICAgICAgICAgICB0aGlzLm1hcmdpblNpemVQeCAtXG4gICAgICAgICAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4KSAvXG4gICAgICAgICAgICB0aGlzLmRheVdpZHRoUHhcbiAgICAgICAgKSxcbiAgICAgICAgMCxcbiAgICAgICAgdGhpcy50b3RhbE51bWJlck9mRGF5c1xuICAgICAgKSxcbiAgICAgIHJvdzogTWF0aC5mbG9vcihcbiAgICAgICAgKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICogcG9pbnQueSAtXG4gICAgICAgICAgdGhpcy5vcmlnaW4ueSAtXG4gICAgICAgICAgdGhpcy5tYXJnaW5TaXplUHggLVxuICAgICAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCkgL1xuICAgICAgICAgIHRoaXMucm93SGVpZ2h0UHhcbiAgICAgICksXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBUaGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3ggZm9yIGEgc2luZ2xlIHRhc2suICovXG4gIHByaXZhdGUgdGFza1Jvd0VudmVsb3BlU3RhcnQocm93OiBudW1iZXIsIGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiBhZGQodGhpcy5vcmlnaW4sIFtcbiAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgIGRheSAqIHRoaXMuZGF5V2lkdGhQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeFxuICAgICAgKSxcbiAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgIHJvdyAqIHRoaXMucm93SGVpZ2h0UHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICAgKSxcbiAgICBdKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgcHJpdmF0ZSBncm91cFJvd0VudmVsb3BlU3RhcnQocm93OiBudW1iZXIsIGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiBhZGQodGhpcy5ncm91cEJ5T3JpZ2luLCBbXG4gICAgICAwLFxuICAgICAgcm93ICogdGhpcy5yb3dIZWlnaHRQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4LFxuICAgIF0pO1xuICB9XG5cbiAgcHJpdmF0ZSBncm91cEhlYWRlclN0YXJ0KCk6IFBvaW50IHtcbiAgICByZXR1cm4gYWRkKHRoaXMub3JpZ2luLCBbdGhpcy5tYXJnaW5TaXplUHgsIHRoaXMubWFyZ2luU2l6ZVB4XSk7XG4gIH1cblxuICBwcml2YXRlIHRpbWVFbnZlbG9wZVN0YXJ0KGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiBhZGQodGhpcy5vcmlnaW4sIFtcbiAgICAgIGRheSAqIHRoaXMuZGF5V2lkdGhQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCxcbiAgICAgIDAsXG4gICAgXSk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgY29vcmRpbmF0ZSBvZiB0aGUgaXRlbSAqL1xuICBmZWF0dXJlKHJvdzogbnVtYmVyLCBkYXk6IG51bWJlciwgY29vcmQ6IEZlYXR1cmUpOiBQb2ludCB7XG4gICAgc3dpdGNoIChjb29yZCkge1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tMaW5lU3RhcnQ6XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3A6XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0OlxuICAgICAgICByZXR1cm4gYWRkKHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLCBbXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4IC0gdGhpcy5ibG9ja1NpemVQeCxcbiAgICAgICAgXSk7XG5cbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdEJvdHRvbTpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KSwgWzAsIHRoaXMucm93SGVpZ2h0UHhdKTtcbiAgICAgIGNhc2UgRmVhdHVyZS50ZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiBhZGQodGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSksIFtcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4LFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHgsXG4gICAgICAgIF0pO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gYWRkKHRoaXMuZ3JvdXBSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KSwgW1xuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHgsXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeCxcbiAgICAgICAgXSk7XG4gICAgICBjYXNlIEZlYXR1cmUucGVyY2VudFN0YXJ0OlxuICAgICAgICByZXR1cm4gYWRkKHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLCBbXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4IC0gdGhpcy5saW5lV2lkdGhQeCxcbiAgICAgICAgXSk7XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdDpcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydDpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KSwgW1xuICAgICAgICAgIDAsXG4gICAgICAgICAgTWF0aC5mbG9vcih0aGlzLnJvd0hlaWdodFB4IC0gMC41ICogdGhpcy5ibG9ja1NpemVQeCkgLSAxLFxuICAgICAgICBdKTtcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lVG9wOlxuICAgICAgICByZXR1cm4gYWRkKHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcCksIFtcbiAgICAgICAgICAwLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgXSk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbTpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3ApLCBbXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICBdKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0VG9NaWxlc3RvbmU6XG4gICAgICAgIHJldHVybiBhZGQodGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3QpLCBbXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgXSk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcDpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0KSwgW1xuICAgICAgICAgIDAsXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICBdKTtcblxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVCb3R0b206XG4gICAgICAgIHJldHVybiBhZGQodGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydCksIFtcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlciksXG4gICAgICAgIF0pO1xuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZTpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQpLCBbXG4gICAgICAgICAgdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgICAwLFxuICAgICAgICBdKTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cEVudmVsb3BlU3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwUm93RW52ZWxvcGVTdGFydChyb3csIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZU1hcmtTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50aW1lTWFya0VuZDpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSksIFtcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMucm93SGVpZ2h0UHggKiAocm93ICsgMSksXG4gICAgICAgIF0pO1xuICAgICAgY2FzZSBGZWF0dXJlLnRpbWVUZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiBhZGQodGhpcy50aW1lRW52ZWxvcGVTdGFydChkYXkpLCBbdGhpcy5ibG9ja1NpemVQeCwgMF0pO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwVGl0bGVUZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiBhZGQodGhpcy5ncm91cEhlYWRlclN0YXJ0KCksIFt0aGlzLmJsb2NrU2l6ZVB4LCAwXSk7XG4gICAgICBjYXNlIEZlYXR1cmUuZGlzcGxheVJhbmdlVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy50aW1lRW52ZWxvcGVTdGFydChkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tSb3dCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdyArIDEsIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza3NDbGlwUmVjdE9yaWdpbjpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza3NDbGlwUmVjdE9yaWdpbjtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cEJ5T3JpZ2luOlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cEJ5T3JpZ2luO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gVGhlIGxpbmUgYmVsb3cgd2lsbCBub3QgY29tcGlsZSBpZiB5b3UgbWlzc2VkIGFuIGVudW0gaW4gdGhlIHN3aXRjaCBhYm92ZS5cbiAgICAgICAgY29vcmQgc2F0aXNmaWVzIG5ldmVyO1xuICAgICAgICByZXR1cm4gcHQoMCwgMCk7XG4gICAgfVxuICB9XG5cbiAgbWV0cmljKGZlYXR1cmU6IE1ldHJpYyk6IG51bWJlciB7XG4gICAgc3dpdGNoIChmZWF0dXJlKSB7XG4gICAgICBjYXNlIE1ldHJpYy50YXNrTGluZUhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza0hlaWdodFB4O1xuICAgICAgY2FzZSBNZXRyaWMucGVyY2VudEhlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMubGluZVdpZHRoUHg7XG4gICAgICBjYXNlIE1ldHJpYy5hcnJvd0hlYWRIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tIZWlnaHRQeDtcbiAgICAgIGNhc2UgTWV0cmljLmFycm93SGVhZFdpZHRoOlxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4KTtcbiAgICAgIGNhc2UgTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyOlxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4KTtcbiAgICAgIGNhc2UgTWV0cmljLmxpbmVEYXNoTGluZTpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy5saW5lRGFzaEdhcDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy50ZXh0WE9mZnNldDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgICBjYXNlIE1ldHJpYy5taW5UYXNrV2lkdGhQeDpcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tTaXplUHggKiAxMDtcbiAgICAgIGNhc2UgTWV0cmljLnJvd0hlaWdodDpcbiAgICAgICAgcmV0dXJuIHRoaXMucm93SGVpZ2h0UHg7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBUaGUgbGluZSBiZWxvdyB3aWxsIG5vdCBjb21waWxlIGlmIHlvdSBtaXNzZWQgYW4gZW51bSBpbiB0aGUgc3dpdGNoIGFib3ZlLlxuICAgICAgICBmZWF0dXJlIHNhdGlzZmllcyBuZXZlcjtcbiAgICAgICAgcmV0dXJuIDAuMDtcbiAgICB9XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuLi9wb2ludC9wb2ludFwiO1xuaW1wb3J0IHsgUmVjdCB9IGZyb20gXCIuLi9yZWN0L3JlY3RcIjtcblxuY29uc3Qgd2l0aGluWSA9ICh5OiBudW1iZXIsIHJlY3Q6IFJlY3QpOiBib29sZWFuID0+IHtcbiAgcmV0dXJuIHJlY3QudG9wTGVmdC55IDw9IHkgJiYgcmVjdC5ib3R0b21SaWdodC55ID49IHk7XG59O1xuXG5jb25zdCB3aXRoaW5YID0gKHg6IG51bWJlciwgcmVjdDogUmVjdCk6IGJvb2xlYW4gPT4ge1xuICByZXR1cm4gcmVjdC50b3BMZWZ0LnggPD0geCAmJiByZWN0LmJvdHRvbVJpZ2h0LnggPj0geDtcbn07XG5cbmV4cG9ydCBjbGFzcyBIaXRSZWN0PFIgZXh0ZW5kcyBSZWN0PiB7XG4gIHJlY3RzOiBSW107XG4gIGNvbnN0cnVjdG9yKHJlY3RzOiBSW10pIHtcbiAgICB0aGlzLnJlY3RzID0gcmVjdHMuc29ydCgoYTogUiwgYjogUik6IG51bWJlciA9PiBhLnRvcExlZnQueSAtIGIudG9wTGVmdC55KTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgUmVjdCB0aGF0IHAgaXMgaW4sIG90aGVyd2lzZSByZXR1cm5zIC0xLiAqL1xuICBoaXQocDogUG9pbnQpOiBSIHwgbnVsbCB7XG4gICAgbGV0IHN0YXJ0ID0gMDtcbiAgICBsZXQgZW5kID0gdGhpcy5yZWN0cy5sZW5ndGggLSAxO1xuXG4gICAgd2hpbGUgKHN0YXJ0IDw9IGVuZCkge1xuICAgICAgLy8gRmluZCB0aGUgbWlkIGluZGV4XG4gICAgICBsZXQgbWlkID0gTWF0aC5mbG9vcigoc3RhcnQgKyBlbmQpIC8gMik7XG5cbiAgICAgIC8vIElmIGVsZW1lbnQgaXMgcHJlc2VudCBhdFxuICAgICAgLy8gbWlkLCByZXR1cm4gVHJ1ZVxuICAgICAgaWYgKHdpdGhpblkocC55LCB0aGlzLnJlY3RzW21pZF0pKSB7XG4gICAgICAgIGlmICh3aXRoaW5YKHAueCwgdGhpcy5yZWN0c1ttaWRdKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnJlY3RzW21pZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICAvLyBFbHNlIGxvb2sgaW4gbGVmdCBvclxuICAgICAgLy8gcmlnaHQgaGFsZiBhY2NvcmRpbmdseVxuICAgICAgZWxzZSBpZiAodGhpcy5yZWN0c1ttaWRdLnRvcExlZnQueSA8IHAueSkge1xuICAgICAgICBzdGFydCA9IG1pZCArIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbmQgPSBtaWQgLSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQ2hhcnRWYWxpZGF0ZSwgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgQ2hhcnRMaWtlLCBmaWx0ZXIsIEZpbHRlckZ1bmMgfSBmcm9tIFwiLi4vY2hhcnQvZmlsdGVyL2ZpbHRlci50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBWZXJ0ZXhJbmRpY2VzIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBSZXNvdXJjZURlZmluaXRpb24gfSBmcm9tIFwiLi4vcmVzb3VyY2VzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBvayB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFNwYW4gfSBmcm9tIFwiLi4vc2xhY2svc2xhY2sudHNcIjtcbmltcG9ydCB7IFRhc2tEdXJhdGlvbiB9IGZyb20gXCIuLi90eXBlcy90eXBlcy50c1wiO1xuaW1wb3J0IHsgUmVjdCB9IGZyb20gXCIuLi9yZWN0L3JlY3QudHNcIjtcbmltcG9ydCB7IEtEVHJlZSB9IGZyb20gXCIuL2tkL2tkLnRzXCI7XG5pbXBvcnQgeyBEaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi9yYW5nZS9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUG9pbnQsIGRpZmZlcmVuY2UsIHB0IH0gZnJvbSBcIi4uL3BvaW50L3BvaW50LnRzXCI7XG5pbXBvcnQgeyBGZWF0dXJlLCBNZXRyaWMsIFNjYWxlIH0gZnJvbSBcIi4vc2NhbGUvc2NhbGUudHNcIjtcbmltcG9ydCB7IEhpdFJlY3QgfSBmcm9tIFwiLi4vaGl0cmVjdC9oaXRyZWN0LnRzXCI7XG5cbnR5cGUgRGlyZWN0aW9uID0gXCJ1cFwiIHwgXCJkb3duXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29sb3JzIHtcbiAgc3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlTXV0ZWQ6IHN0cmluZztcbiAgb25TdXJmYWNlSGlnaGxpZ2h0OiBzdHJpbmc7XG4gIG92ZXJsYXk6IHN0cmluZztcbiAgZ3JvdXBDb2xvcjogc3RyaW5nO1xuICBoaWdobGlnaHQ6IHN0cmluZztcbn1cblxuZXhwb3J0IHR5cGUgVGFza0luZGV4VG9Sb3cgPSBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4vKiogRnVuY3Rpb24gdXNlIHRvIHByb2R1Y2UgYSB0ZXh0IGxhYmVsIGZvciBhIHRhc2sgYW5kIGl0cyBzbGFjay4gKi9cbmV4cG9ydCB0eXBlIFRhc2tMYWJlbCA9ICh0YXNrSW5kZXg6IG51bWJlcikgPT4gc3RyaW5nO1xuXG4vKiogQ29udHJvbHMgb2YgdGhlIGRpc3BsYXlSYW5nZSBpbiBSZW5kZXJPcHRpb25zIGlzIHVzZWQuXG4gKlxuICogIFwicmVzdHJpY3RcIjogT25seSBkaXNwbGF5IHRoZSBwYXJ0cyBvZiB0aGUgY2hhcnQgdGhhdCBhcHBlYXIgaW4gdGhlIHJhbmdlLlxuICpcbiAqICBcImhpZ2hsaWdodFwiOiBEaXNwbGF5IHRoZSBmdWxsIHJhbmdlIG9mIHRoZSBkYXRhLCBidXQgaGlnaGxpZ2h0IHRoZSByYW5nZS5cbiAqL1xuZXhwb3J0IHR5cGUgRGlzcGxheVJhbmdlVXNhZ2UgPSBcInJlc3RyaWN0XCIgfCBcImhpZ2hsaWdodFwiO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFRhc2tMYWJlbDogVGFza0xhYmVsID0gKHRhc2tJbmRleDogbnVtYmVyKTogc3RyaW5nID0+XG4gIHRhc2tJbmRleC50b0ZpeGVkKDApO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlck9wdGlvbnMge1xuICAvKiogVGhlIHRleHQgZm9udCBzaXplLCB0aGlzIGRyaXZlcyB0aGUgc2l6ZSBvZiBhbGwgb3RoZXIgY2hhcnQgZmVhdHVyZXMuXG4gICAqICovXG4gIGZvbnRTaXplUHg6IG51bWJlcjtcblxuICAvKiogRGlzcGxheSB0ZXh0IGlmIHRydWUuICovXG4gIGhhc1RleHQ6IGJvb2xlYW47XG5cbiAgLyoqIElmIHN1cHBsaWVkIHRoZW4gb25seSB0aGUgdGFza3MgaW4gdGhlIGdpdmVuIHJhbmdlIHdpbGwgYmUgZGlzcGxheWVkLiAqL1xuICBkaXNwbGF5UmFuZ2U6IERpc3BsYXlSYW5nZSB8IG51bGw7XG5cbiAgLyoqIENvbnRyb2xzIGhvdyB0aGUgYGRpc3BsYXlSYW5nZWAgaXMgdXNlZCBpZiBzdXBwbGllZC4gKi9cbiAgZGlzcGxheVJhbmdlVXNhZ2U6IERpc3BsYXlSYW5nZVVzYWdlO1xuXG4gIC8qKiBUaGUgY29sb3IgdGhlbWUuICovXG4gIGNvbG9yczogQ29sb3JzO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZGlzcGxheSB0aW1lcyBhdCB0aGUgdG9wIG9mIHRoZSBjaGFydC4gKi9cbiAgaGFzVGltZWxpbmU6IGJvb2xlYW47XG5cbiAgLyoqIElmIHRydWUgdGhlbiBkaXNwbGF5IHRoZSB0YXNrIGJhcnMuICovXG4gIGhhc1Rhc2tzOiBib29sZWFuO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZHJhdyB2ZXJ0aWNhbCBsaW5lcyBmcm9tIHRoZSB0aW1lbGluZSBkb3duIHRvIHRhc2sgc3RhcnQgYW5kXG4gICAqIGZpbmlzaCBwb2ludHMuICovXG4gIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IGJvb2xlYW47XG5cbiAgLyoqIERyYXcgZGVwZW5kZW5jeSBlZGdlcyBiZXR3ZWVuIHRhc2tzIGlmIHRydWUuICovXG4gIGhhc0VkZ2VzOiBib29sZWFuO1xuXG4gIC8qKiBGdW5jdGlvbiB0aGF0IHByb2R1Y2VzIGRpc3BsYXkgdGV4dCBmb3IgYSBUYXNrIGFuZCBpdHMgYXNzb2NpYXRlZCBTbGFjay4gKi9cbiAgdGFza0xhYmVsOiBUYXNrTGFiZWw7XG5cbiAgLyoqIFJldHVybnMgdGhlIGR1cmF0aW9uIGZvciBhIGdpdmVuIHRhc2suICovXG4gIHRhc2tEdXJhdGlvbjogVGFza0R1cmF0aW9uO1xuXG4gIC8qKiBUaGUgaW5kaWNlcyBvZiB0YXNrcyB0aGF0IHNob3VsZCBiZSBlbXBoYXNpemVkIHdoZW4gZHJhdywgdHlwaWNhbGx5IHVzZWRcbiAgICogdG8gZGVub3RlIHRoZSBjcml0aWNhbCBwYXRoLiAqL1xuICB0YXNrRW1waGFzaXplOiBudW1iZXJbXTtcblxuICAvKiogRmlsdGVyIHRoZSBUYXNrcyB0byBiZSBkaXNwbGF5ZWQuICovXG4gIGZpbHRlckZ1bmM6IEZpbHRlckZ1bmMgfCBudWxsO1xuXG4gIC8qKiBHcm91cCB0aGUgdGFza3MgdG9nZXRoZXIgdmVydGljYWxseSBiYXNlZCBvbiB0aGUgZ2l2ZW4gcmVzb3VyY2UuIElmIHRoZVxuICAgKiBlbXB0eSBzdHJpbmcgaXMgc3VwcGxpZWQgdGhlbiBqdXN0IGRpc3BsYXkgYnkgdG9wb2xvZ2ljYWwgb3JkZXIuXG4gICAqL1xuICBncm91cEJ5UmVzb3VyY2U6IHN0cmluZztcblxuICAvKiogVGFzayB0byBoaWdobGlnaHQuICovXG4gIGhpZ2hsaWdodGVkVGFzazogbnVsbCB8IG51bWJlcjtcblxuICAvKiogVGhlIGluZGV4IG9mIHRoZSBzZWxlY3RlZCB0YXNrLCBvciAtMSBpZiBubyB0YXNrIGlzIHNlbGVjdGVkLiBUaGlzIGlzXG4gICAqIGFsd2F5cyBhbiBpbmRleCBpbnRvIHRoZSBvcmlnaW5hbCBjaGFydCwgYW5kIG5vdCBhbiBpbmRleCBpbnRvIGEgZmlsdGVyZWRcbiAgICogY2hhcnQuXG4gICAqL1xuICBzZWxlY3RlZFRhc2tJbmRleDogbnVtYmVyO1xuXG4gIC8qKiBDb252ZXJ0cyB0aGUgdGltZXMgaW4gYSBjaGFydCBpbnRvIGEgZGlzcGxheWFibGUgc3RyaW5nLiAqL1xuICBkdXJhdGlvbkRpc3BsYXk6IChkOiBudW1iZXIpID0+IHN0cmluZztcbn1cblxuY29uc3QgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAoXG4gIHRhc2s6IFRhc2ssXG4gIGRpcmVjdGlvbjogRGlyZWN0aW9uXG4pOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIikge1xuICAgICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZUJvdHRvbTtcbiAgICB9XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQ7XG4gIH1cbn07XG5cbmNvbnN0IHZlcnRpY2FsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAoXG4gIHRhc2s6IFRhc2ssXG4gIGRpcmVjdGlvbjogRGlyZWN0aW9uXG4pOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIikge1xuICAgICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcDtcbiAgICB9XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZUJvdHRvbTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcImRvd25cIikge1xuICAgICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3A7XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0Qm90dG9tO1xuICB9XG59O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5jb25zdCBob3Jpem9udGFsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKHRhc2s6IFRhc2spOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQ7XG4gIH1cbn07XG5cbmNvbnN0IGhvcml6b250YWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9ICh0YXNrOiBUYXNrKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3Q7XG4gIH1cbn07XG5cbi8qKlxuICogQ29tcHV0ZSB3aGF0IHRoZSBoZWlnaHQgb2YgdGhlIGNhbnZhcyBzaG91bGQgYmUuIE5vdGUgdGhhdCB0aGUgdmFsdWUgZG9lc24ndFxuICoga25vdyBhYm91dCBgd2luZG93LmRldmljZVBpeGVsUmF0aW9gLCBzbyBpZiB0aGUgY2FudmFzIGlzIGFscmVhZHkgc2NhbGVkIGJ5XG4gKiBgd2luZG93LmRldmljZVBpeGVsUmF0aW9gIHRoZW4gc28gd2lsbCB0aGUgcmVzdWx0IG9mIHRoaXMgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWdnZXN0ZWRDYW52YXNIZWlnaHQoXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gIHNwYW5zOiBTcGFuW10sXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIG1heFJvd3M6IG51bWJlclxuKTogbnVtYmVyIHtcbiAgaWYgKCFvcHRzLmhhc1Rhc2tzKSB7XG4gICAgbWF4Um93cyA9IDA7XG4gIH1cbiAgcmV0dXJuIG5ldyBTY2FsZShcbiAgICBvcHRzLFxuICAgIGNhbnZhcy53aWR0aCxcbiAgICBzcGFuc1tzcGFucy5sZW5ndGggLSAxXS5maW5pc2ggKyAxXG4gICkuaGVpZ2h0KG1heFJvd3MpO1xufVxuXG4vLyBUaGUgbG9jYXRpb24sIGluIGNhbnZhcyBwaXhlbCBjb29yZGluYXRlcywgb2YgZWFjaCB0YXNrIGJhci4gU2hvdWxkIHVzZSB0aGVcbi8vIHRleHQgb2YgdGhlIHRhc2sgbGFiZWwgYXMgdGhlIGxvY2F0aW9uLCBzaW5jZSB0aGF0J3MgYWx3YXlzIGRyYXduIGluIHRoZSB2aWV3XG4vLyBpZiBwb3NzaWJsZS5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza0xvY2F0aW9uIHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG5cbiAgLy8gVGhhdCBpbmRleCBvZiB0aGUgdGFzayBpbiB0aGUgdW5maWx0ZXJlZCBDaGFydC5cbiAgb3JpZ2luYWxUYXNrSW5kZXg6IG51bWJlcjtcbn1cblxudHlwZSBVcGRhdGVUeXBlID0gXCJtb3VzZW1vdmVcIiB8IFwibW91c2Vkb3duXCI7XG5cbi8vIEEgZnVuYyB0aGF0IHRha2VzIGEgUG9pbnQgYW5kIHJlZHJhd3MgdGhlIGhpZ2hsaWdodGVkIHRhc2sgaWYgbmVlZGVkLCByZXR1cm5zXG4vLyB0aGUgaW5kZXggb2YgdGhlIHRhc2sgdGhhdCBpcyBoaWdobGlnaHRlZC5cbmV4cG9ydCB0eXBlIFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyA9IChcbiAgcG9pbnQ6IFBvaW50LFxuICB1cGRhdGVUeXBlOiBVcGRhdGVUeXBlXG4pID0+IG51bWJlciB8IG51bGw7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyUmVzdWx0IHtcbiAgc2NhbGU6IFNjYWxlO1xuICB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M6IFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyB8IG51bGw7XG4gIHNlbGVjdGVkVGFza0xvY2F0aW9uOiBQb2ludCB8IG51bGw7XG59XG5cbi8vIEEgc3BhbiBvbiB0aGUgeC1heGlzLlxudHlwZSB4UmFuZ2UgPSBbbnVtYmVyLCBudW1iZXJdO1xuXG4vLyBUT0RPIC0gUGFzcyBpbiBtYXggcm93cywgYW5kIGEgbWFwcGluZyB0aGF0IG1hcHMgZnJvbSB0YXNrSW5kZXggdG8gcm93LFxuLy8gYmVjYXVzZSB0d28gZGlmZmVyZW50IHRhc2tzIG1pZ2h0IGJlIHBsYWNlZCBvbiB0aGUgc2FtZSByb3cuIEFsc28gd2Ugc2hvdWxkXG4vLyBwYXNzIGluIG1heCByb3dzPyBPciBzaG91bGQgdGhhdCBjb21lIGZyb20gdGhlIGFib3ZlIG1hcHBpbmc/XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyVGFza3NUb0NhbnZhcyhcbiAgcGFyZW50OiBIVE1MRWxlbWVudCxcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHBsYW46IFBsYW4sXG4gIHNwYW5zOiBTcGFuW10sXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIG92ZXJsYXk6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCA9IG51bGxcbik6IFJlc3VsdDxSZW5kZXJSZXN1bHQ+IHtcbiAgY29uc3QgdnJldCA9IENoYXJ0VmFsaWRhdGUocGxhbi5jaGFydCk7XG4gIGlmICghdnJldC5vaykge1xuICAgIHJldHVybiB2cmV0O1xuICB9XG5cbiAgY29uc3Qgb3JpZ2luYWxMYWJlbHMgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLm1hcChcbiAgICAodGFzazogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IG9wdHMudGFza0xhYmVsKHRhc2tJbmRleClcbiAgKTtcblxuICAvLyBBcHBseSB0aGUgZmlsdGVyIGFuZCB3b3JrIHdpdGggdGhlIENoYXJ0TGlrZSByZXR1cm4gZnJvbSB0aGlzIHBvaW50IG9uLlxuICAvLyBGaXRsZXIgYWxzbyBuZWVkcyB0byBiZSBhcHBsaWVkIHRvIHNwYW5zLlxuICBjb25zdCBmcmV0ID0gZmlsdGVyKFxuICAgIHBsYW4uY2hhcnQsXG4gICAgb3B0cy5maWx0ZXJGdW5jLFxuICAgIG9wdHMudGFza0VtcGhhc2l6ZSxcbiAgICBzcGFucyxcbiAgICBvcmlnaW5hbExhYmVscyxcbiAgICBvcHRzLnNlbGVjdGVkVGFza0luZGV4XG4gICk7XG4gIGlmICghZnJldC5vaykge1xuICAgIHJldHVybiBmcmV0O1xuICB9XG4gIGNvbnN0IGNoYXJ0TGlrZSA9IGZyZXQudmFsdWUuY2hhcnRMaWtlO1xuICBjb25zdCBsYWJlbHMgPSBmcmV0LnZhbHVlLmxhYmVscztcbiAgY29uc3QgcmVzb3VyY2VEZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24ob3B0cy5ncm91cEJ5UmVzb3VyY2UpO1xuICBjb25zdCBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleCA9XG4gICAgZnJldC52YWx1ZS5mcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDtcbiAgY29uc3QgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXggPVxuICAgIGZyZXQudmFsdWUuZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXg7XG5cbiAgLy8gU2VsZWN0ZWQgdGFzaywgYXMgYW4gaW5kZXggaW50byB0aGUgdW5maWx0ZXJlZCBDaGFydC5cbiAgbGV0IGxhc3RTZWxlY3RlZFRhc2tJbmRleCA9IG9wdHMuc2VsZWN0ZWRUYXNrSW5kZXg7XG5cbiAgLy8gSGlnaGxpZ2h0ZWQgdGFza3MuXG4gIGNvbnN0IGVtcGhhc2l6ZWRUYXNrczogU2V0PG51bWJlcj4gPSBuZXcgU2V0KGZyZXQudmFsdWUuZW1waGFzaXplZFRhc2tzKTtcbiAgc3BhbnMgPSBmcmV0LnZhbHVlLnNwYW5zO1xuXG4gIC8vIENhbGN1bGF0ZSBob3cgd2lkZSB3ZSBuZWVkIHRvIG1ha2UgdGhlIGdyb3VwQnkgY29sdW1uLlxuICBsZXQgbWF4R3JvdXBOYW1lTGVuZ3RoID0gMDtcbiAgaWYgKG9wdHMuZ3JvdXBCeVJlc291cmNlICE9PSBcIlwiICYmIG9wdHMuaGFzVGV4dCkge1xuICAgIG1heEdyb3VwTmFtZUxlbmd0aCA9IG9wdHMuZ3JvdXBCeVJlc291cmNlLmxlbmd0aDtcbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMuZm9yRWFjaCgodmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgICBtYXhHcm91cE5hbWVMZW5ndGggPSBNYXRoLm1heChtYXhHcm91cE5hbWVMZW5ndGgsIHZhbHVlLmxlbmd0aCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCB0b3RhbE51bWJlck9mUm93cyA9IHNwYW5zLmxlbmd0aDtcbiAgY29uc3QgdG90YWxOdW1iZXJPZkRheXMgPSBzcGFuc1tzcGFucy5sZW5ndGggLSAxXS5maW5pc2g7XG4gIGNvbnN0IHNjYWxlID0gbmV3IFNjYWxlKFxuICAgIG9wdHMsXG4gICAgY2FudmFzLndpZHRoLFxuICAgIHRvdGFsTnVtYmVyT2ZEYXlzICsgMSxcbiAgICBtYXhHcm91cE5hbWVMZW5ndGhcbiAgKTtcblxuICBjb25zdCB0YXNrTGluZUhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMudGFza0xpbmVIZWlnaHQpO1xuICBjb25zdCBkaWFtb25kRGlhbWV0ZXIgPSBzY2FsZS5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKTtcbiAgY29uc3QgcGVyY2VudEhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMucGVyY2VudEhlaWdodCk7XG4gIGNvbnN0IGFycm93SGVhZEhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMuYXJyb3dIZWFkSGVpZ2h0KTtcbiAgY29uc3QgYXJyb3dIZWFkV2lkdGggPSBzY2FsZS5tZXRyaWMoTWV0cmljLmFycm93SGVhZFdpZHRoKTtcbiAgY29uc3QgbWluVGFza1dpZHRoUHggPSBzY2FsZS5tZXRyaWMoTWV0cmljLm1pblRhc2tXaWR0aFB4KTtcblxuICBjb25zdCBkYXlzV2l0aFRpbWVNYXJrZXJzOiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoKTtcbiAgY29uc3QgdGlyZXQgPSB0YXNrSW5kZXhUb1Jvd0Zyb21Hcm91cEJ5KFxuICAgIG9wdHMsXG4gICAgcmVzb3VyY2VEZWZpbml0aW9uLFxuICAgIGNoYXJ0TGlrZSxcbiAgICBmcmV0LnZhbHVlLmRpc3BsYXlPcmRlclxuICApO1xuICBpZiAoIXRpcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHRpcmV0O1xuICB9XG4gIGNvbnN0IHRhc2tJbmRleFRvUm93ID0gdGlyZXQudmFsdWUudGFza0luZGV4VG9Sb3c7XG4gIGNvbnN0IHJvd1JhbmdlcyA9IHRpcmV0LnZhbHVlLnJvd1JhbmdlcztcblxuICAvLyBTZXQgdXAgY2FudmFzIGJhc2ljcy5cbiAgY2xlYXJDYW52YXMoY3R4LCBvcHRzLCBjYW52YXMpO1xuICBzZXRGb250U2l6ZShjdHgsIG9wdHMpO1xuXG4gIGNvbnN0IGNsaXBSZWdpb24gPSBuZXcgUGF0aDJEKCk7XG4gIGNvbnN0IGNsaXBPcmlnaW4gPSBzY2FsZS5mZWF0dXJlKDAsIDAsIEZlYXR1cmUudGFza3NDbGlwUmVjdE9yaWdpbik7XG4gIGNvbnN0IGNsaXBXaWR0aCA9IGNhbnZhcy53aWR0aCAtIGNsaXBPcmlnaW4ueDtcbiAgY2xpcFJlZ2lvbi5yZWN0KGNsaXBPcmlnaW4ueCwgMCwgY2xpcFdpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAvLyBEcmF3IGJpZyByZWQgcmVjdCBvdmVyIHdoZXJlIHRoZSBjbGlwIHJlZ2lvbiB3aWxsIGJlLlxuICBpZiAoMCkge1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmVkXCI7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2UoY2xpcFJlZ2lvbik7XG4gIH1cblxuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG5cbiAgaWYgKHJvd1JhbmdlcyAhPT0gbnVsbCkge1xuICAgIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgICBkcmF3U3dpbUxhbmVIaWdobGlnaHRzKFxuICAgICAgICBjdHgsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICByb3dSYW5nZXMsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzLFxuICAgICAgICBvcHRzLmNvbG9ycy5ncm91cENvbG9yXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChyZXNvdXJjZURlZmluaXRpb24gIT09IHVuZGVmaW5lZCAmJiBvcHRzLmhhc1RleHQpIHtcbiAgICAgIGRyYXdTd2ltTGFuZUxhYmVscyhjdHgsIG9wdHMsIHJlc291cmNlRGVmaW5pdGlvbiwgc2NhbGUsIHJvd1Jhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuXG4gIGN0eC5zYXZlKCk7XG4gIGN0eC5jbGlwKGNsaXBSZWdpb24pO1xuXG4gIGludGVyZmFjZSBSZWN0V2l0aEZpbHRlcmVkVGFza0luZGV4IGV4dGVuZHMgUmVjdCB7XG4gICAgZmlsdGVyZWRUYXNrSW5kZXg6IG51bWJlcjtcbiAgfVxuICBjb25zdCB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzOiBNYXA8XG4gICAgbnVtYmVyLFxuICAgIFJlY3RXaXRoRmlsdGVyZWRUYXNrSW5kZXhcbiAgPiA9IG5ldyBNYXAoKTtcblxuICAvLyBLZWVwIHRyYWNrIG9mIHdoZXJlIHdlIGRyYXcgdGltZWxpbmUgbGFiZWxzLCB0byBhdm9pZCBvdmVybGFwcy5cbiAgY29uc3QgdGltZU1hcmtlclJhbmdlczogeFJhbmdlW10gPSBbXTtcblxuICAvLyBEcmF3IHRhc2tzIGluIHRoZWlyIHJvd3MuXG4gIGNoYXJ0TGlrZS5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHJvdyA9IHRhc2tJbmRleFRvUm93LmdldCh0YXNrSW5kZXgpITtcbiAgICBjb25zdCBzcGFuID0gc3BhbnNbdGFza0luZGV4XTtcbiAgICBjb25zdCB0YXNrU3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgc3Bhbi5zdGFydCwgRmVhdHVyZS50YXNrTGluZVN0YXJ0KTtcbiAgICBjb25zdCB0YXNrRW5kID0gc2NhbGUuZmVhdHVyZShyb3csIHNwYW4uZmluaXNoLCBGZWF0dXJlLnRhc2tMaW5lU3RhcnQpO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuXG4gICAgLy8gRHJhdyBpbiB0aW1lIG1hcmtlcnMgaWYgZGlzcGxheWVkLlxuICAgIC8vIFRPRE8gLSBNYWtlIHN1cmUgdGhleSBkb24ndCBvdmVybGFwLlxuICAgIGlmIChvcHRzLmRyYXdUaW1lTWFya2Vyc09uVGFza3MpIHtcbiAgICAgIGRyYXdUaW1lTWFya2VyQXREYXlUb1Rhc2soXG4gICAgICAgIGN0eCxcbiAgICAgICAgcm93LFxuICAgICAgICBzcGFuLnN0YXJ0LFxuICAgICAgICB0YXNrLFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgZGF5c1dpdGhUaW1lTWFya2VycyxcbiAgICAgICAgdGltZU1hcmtlclJhbmdlc1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoZW1waGFzaXplZFRhc2tzLmhhcyh0YXNrSW5kZXgpKSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICAgIH1cbiAgICBjb25zdCBoaWdobGlnaHRUb3BMZWZ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvdyxcbiAgICAgIHNwYW4uc3RhcnQsXG4gICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICk7XG4gICAgbGV0IGhpZ2hsaWdodEJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvdyArIDEsXG4gICAgICBzcGFuLmZpbmlzaCxcbiAgICAgIEZlYXR1cmUudGFza0VudmVsb3BlVG9wXG4gICAgKTtcblxuICAgIC8vIFBhZCBoaWdobGlnaHRCb3R0b21SaWdodCBpZiB0b28gc21hbGwuXG4gICAgY29uc3QgW3dpZHRoLCBfXSA9IGRpZmZlcmVuY2UoaGlnaGxpZ2h0VG9wTGVmdCwgaGlnaGxpZ2h0Qm90dG9tUmlnaHQpO1xuICAgIGlmICh3aWR0aCA8IG1pblRhc2tXaWR0aFB4KSB7XG4gICAgICBoaWdobGlnaHRCb3R0b21SaWdodC54ID0gaGlnaGxpZ2h0VG9wTGVmdC54ICsgbWluVGFza1dpZHRoUHg7XG4gICAgfVxuXG4gICAgdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5zZXQodGFza0luZGV4LCB7XG4gICAgICB0b3BMZWZ0OiBoaWdobGlnaHRUb3BMZWZ0LFxuICAgICAgYm90dG9tUmlnaHQ6IGhpZ2hsaWdodEJvdHRvbVJpZ2h0LFxuICAgICAgZmlsdGVyZWRUYXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICB9KTtcbiAgICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgICAgaWYgKHRhc2tTdGFydC54ID09PSB0YXNrRW5kLngpIHtcbiAgICAgICAgZHJhd01pbGVzdG9uZShjdHgsIHRhc2tTdGFydCwgZGlhbW9uZERpYW1ldGVyLCBwZXJjZW50SGVpZ2h0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyYXdUYXNrQmFyKGN0eCwgdGFza1N0YXJ0LCB0YXNrRW5kLCB0YXNrTGluZUhlaWdodCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNraXAgZHJhd2luZyB0aGUgdGV4dCBvZiB0aGUgU3RhcnQgYW5kIEZpbmlzaCB0YXNrcy5cbiAgICAgIGlmICh0YXNrSW5kZXggIT09IDAgJiYgdGFza0luZGV4ICE9PSB0b3RhbE51bWJlck9mUm93cyAtIDEpIHtcbiAgICAgICAgZHJhd1Rhc2tUZXh0KFxuICAgICAgICAgIGN0eCxcbiAgICAgICAgICBvcHRzLFxuICAgICAgICAgIHNjYWxlLFxuICAgICAgICAgIHJvdyxcbiAgICAgICAgICBzcGFuLFxuICAgICAgICAgIHRhc2ssXG4gICAgICAgICAgdGFza0luZGV4LFxuICAgICAgICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LmdldCh0YXNrSW5kZXgpISxcbiAgICAgICAgICBjbGlwV2lkdGgsXG4gICAgICAgICAgbGFiZWxzXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBjdHgubGluZVdpZHRoID0gMTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG5cbiAgLy8gTm93IGRyYXcgYWxsIHRoZSBhcnJvd3MsIGkuZS4gZWRnZXMuXG4gIGlmIChvcHRzLmhhc0VkZ2VzICYmIG9wdHMuaGFzVGFza3MpIHtcbiAgICBjb25zdCBoaWdobGlnaHRlZEVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIGNvbnN0IG5vcm1hbEVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSA9IFtdO1xuICAgIGNoYXJ0TGlrZS5FZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChlbXBoYXNpemVkVGFza3MuaGFzKGUuaSkgJiYgZW1waGFzaXplZFRhc2tzLmhhcyhlLmopKSB7XG4gICAgICAgIGhpZ2hsaWdodGVkRWRnZXMucHVzaChlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vcm1hbEVkZ2VzLnB1c2goZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcbiAgICBkcmF3RWRnZXMoXG4gICAgICBjdHgsXG4gICAgICBvcHRzLFxuICAgICAgbm9ybWFsRWRnZXMsXG4gICAgICBzcGFucyxcbiAgICAgIGNoYXJ0TGlrZS5WZXJ0aWNlcyxcbiAgICAgIHNjYWxlLFxuICAgICAgdGFza0luZGV4VG9Sb3csXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodCxcbiAgICAgIGVtcGhhc2l6ZWRUYXNrc1xuICAgICk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgIGRyYXdFZGdlcyhcbiAgICAgIGN0eCxcbiAgICAgIG9wdHMsXG4gICAgICBoaWdobGlnaHRlZEVkZ2VzLFxuICAgICAgc3BhbnMsXG4gICAgICBjaGFydExpa2UuVmVydGljZXMsXG4gICAgICBzY2FsZSxcbiAgICAgIHRhc2tJbmRleFRvUm93LFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHQsXG4gICAgICBlbXBoYXNpemVkVGFza3NcbiAgICApO1xuICB9XG5cbiAgLy8gUmVtb3ZlIHRoZSBjbGlwIHJlZ2lvbi5cbiAgY3R4LnJlc3RvcmUoKTtcblxuICAvLyBOb3cgZHJhdyB0aGUgcmFuZ2UgaGlnaGxpZ2h0cyBpZiByZXF1aXJlZC5cbiAgaWYgKG9wdHMuZGlzcGxheVJhbmdlICE9PSBudWxsICYmIG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwiaGlnaGxpZ2h0XCIpIHtcbiAgICAvLyBEcmF3IGEgcmVjdCBvdmVyIGVhY2ggc2lkZSB0aGF0IGlzbid0IGluIHRoZSByYW5nZS5cbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gPiAwKSB7XG4gICAgICBkcmF3UmFuZ2VPdmVybGF5KFxuICAgICAgICBjdHgsXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICAwLFxuICAgICAgICBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbixcbiAgICAgICAgdG90YWxOdW1iZXJPZlJvd3NcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5lbmQgPCB0b3RhbE51bWJlck9mRGF5cykge1xuICAgICAgZHJhd1JhbmdlT3ZlcmxheShcbiAgICAgICAgY3R4LFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgb3B0cy5kaXNwbGF5UmFuZ2UuZW5kLFxuICAgICAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZSb3dzXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGxldCB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M6IFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyB8IG51bGwgPSBudWxsO1xuICBsZXQgc2VsZWN0ZWRUYXNrTG9jYXRpb246IFBvaW50IHwgbnVsbCA9IG51bGw7XG5cbiAgaWYgKG92ZXJsYXkgIT09IG51bGwpIHtcbiAgICBjb25zdCBvdmVybGF5Q3R4ID0gb3ZlcmxheS5nZXRDb250ZXh0KFwiMmRcIikhO1xuXG4gICAgY29uc3QgdGFza0xvY2F0aW9uS0RUcmVlID0gbmV3IEhpdFJlY3Q8UmVjdFdpdGhGaWx0ZXJlZFRhc2tJbmRleD4oW1xuICAgICAgLi4udGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy52YWx1ZXMoKSxcbiAgICBdKTtcblxuICAgIC8vIEFsd2F5cyByZWNvcmVkIGluIHRoZSBvcmlnaW5hbCB1bmZpbHRlcmVkIHRhc2sgaW5kZXguXG4gICAgbGV0IGxhc3RIaWdobGlnaHRlZFRhc2tJbmRleCA9IC0xO1xuXG4gICAgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zID0gKFxuICAgICAgcG9pbnQ6IFBvaW50LFxuICAgICAgdXBkYXRlVHlwZTogVXBkYXRlVHlwZVxuICAgICk6IG51bWJlciB8IG51bGwgPT4ge1xuICAgICAgLy8gRmlyc3QgY29udmVydCBwb2ludCBpbiBvZmZzZXQgY29vcmRzIGludG8gY2FudmFzIGNvb3Jkcy5cbiAgICAgIHBvaW50LnggPSBwb2ludC54ICogd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgICBwb2ludC55ID0gcG9pbnQueSAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgY29uc3QgdGFza0xvY2F0aW9uID0gdGFza0xvY2F0aW9uS0RUcmVlLmhpdChwb2ludCk7XG4gICAgICBjb25zdCBvcmlnaW5hbFRhc2tJbmRleCA9XG4gICAgICAgIHRhc2tMb2NhdGlvbiA9PT0gbnVsbFxuICAgICAgICAgID8gLTFcbiAgICAgICAgICA6IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LmdldChcbiAgICAgICAgICAgICAgdGFza0xvY2F0aW9uIS5maWx0ZXJlZFRhc2tJbmRleFxuICAgICAgICAgICAgKSE7XG5cbiAgICAgIC8vIERvIG5vdCBhbGxvdyBoaWdobGlnaHRpbmcgb3IgY2xpY2tpbmcgdGhlIFN0YXJ0IGFuZCBGaW5pc2ggdGFza3MuXG4gICAgICBpZiAoXG4gICAgICAgIG9yaWdpbmFsVGFza0luZGV4ID09PSAwIHx8XG4gICAgICAgIG9yaWdpbmFsVGFza0luZGV4ID09PSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDFcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICh1cGRhdGVUeXBlID09PSBcIm1vdXNlbW92ZVwiKSB7XG4gICAgICAgIGlmIChvcmlnaW5hbFRhc2tJbmRleCA9PT0gbGFzdEhpZ2hsaWdodGVkVGFza0luZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsVGFza0luZGV4O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAob3JpZ2luYWxUYXNrSW5kZXggPT09IGxhc3RTZWxlY3RlZFRhc2tJbmRleCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodXBkYXRlVHlwZSA9PT0gXCJtb3VzZW1vdmVcIikge1xuICAgICAgICBsYXN0SGlnaGxpZ2h0ZWRUYXNrSW5kZXggPSBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhc3RTZWxlY3RlZFRhc2tJbmRleCA9IG9yaWdpbmFsVGFza0luZGV4O1xuICAgICAgfVxuXG4gICAgICBvdmVybGF5Q3R4LmNsZWFyUmVjdCgwLCAwLCBvdmVybGF5LndpZHRoLCBvdmVybGF5LmhlaWdodCk7XG5cbiAgICAgIC8vIERyYXcgYm90aCBoaWdobGlnaHQgYW5kIHNlbGVjdGlvbi5cblxuICAgICAgLy8gRHJhdyBoaWdobGlnaHQuXG4gICAgICBsZXQgY29ybmVycyA9IHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMuZ2V0KFxuICAgICAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5nZXQobGFzdEhpZ2hsaWdodGVkVGFza0luZGV4KSFcbiAgICAgICk7XG4gICAgICBpZiAoY29ybmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRyYXdUYXNrSGlnaGxpZ2h0KFxuICAgICAgICAgIG92ZXJsYXlDdHgsXG4gICAgICAgICAgY29ybmVycy50b3BMZWZ0LFxuICAgICAgICAgIGNvcm5lcnMuYm90dG9tUmlnaHQsXG4gICAgICAgICAgb3B0cy5jb2xvcnMuaGlnaGxpZ2h0LFxuICAgICAgICAgIHNjYWxlLm1ldHJpYyh0YXNrTGluZUhlaWdodClcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gRHJhdyBzZWxlY3Rpb24uXG4gICAgICBjb3JuZXJzID0gdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5nZXQoXG4gICAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4LmdldChsYXN0U2VsZWN0ZWRUYXNrSW5kZXgpIVxuICAgICAgKTtcbiAgICAgIGlmIChjb3JuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZHJhd1NlbGVjdGlvbkhpZ2hsaWdodChcbiAgICAgICAgICBvdmVybGF5Q3R4LFxuICAgICAgICAgIGNvcm5lcnMudG9wTGVmdCxcbiAgICAgICAgICBjb3JuZXJzLmJvdHRvbVJpZ2h0LFxuICAgICAgICAgIG9wdHMuY29sb3JzLmhpZ2hsaWdodFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgfTtcblxuICAgIC8vIERyYXcgc2VsZWN0aW9uLlxuICAgIGNvbnN0IGNvcm5lcnMgPSB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmdldChcbiAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4LmdldChsYXN0U2VsZWN0ZWRUYXNrSW5kZXgpIVxuICAgICk7XG4gICAgaWYgKGNvcm5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZHJhd1NlbGVjdGlvbkhpZ2hsaWdodChcbiAgICAgICAgb3ZlcmxheUN0eCxcbiAgICAgICAgY29ybmVycy50b3BMZWZ0LFxuICAgICAgICBjb3JuZXJzLmJvdHRvbVJpZ2h0LFxuICAgICAgICBvcHRzLmNvbG9ycy5oaWdobGlnaHRcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgaGlnaGVzdCB0YXNrIG9mIGFsbCB0aGUgdGFza3MgZGlzcGxheWVkLlxuICB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmZvckVhY2goKHJjOiBSZWN0KSA9PiB7XG4gICAgaWYgKHNlbGVjdGVkVGFza0xvY2F0aW9uID09PSBudWxsKSB7XG4gICAgICBzZWxlY3RlZFRhc2tMb2NhdGlvbiA9IHJjLnRvcExlZnQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChyYy50b3BMZWZ0LnkgPCBzZWxlY3RlZFRhc2tMb2NhdGlvbi55KSB7XG4gICAgICBzZWxlY3RlZFRhc2tMb2NhdGlvbiA9IHJjLnRvcExlZnQ7XG4gICAgfVxuICB9KTtcblxuICBpZiAoXG4gICAgb3B0cy5zZWxlY3RlZFRhc2tJbmRleCAhPT0gLTEgJiZcbiAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5oYXMob3B0cy5zZWxlY3RlZFRhc2tJbmRleClcbiAgKSB7XG4gICAgc2VsZWN0ZWRUYXNrTG9jYXRpb24gPSB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmdldChcbiAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4LmdldChvcHRzLnNlbGVjdGVkVGFza0luZGV4KSEgLy8gQ29udmVydFxuICAgICkhLnRvcExlZnQ7XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIHNlbGVjdGVkIHRhc2sgbG9jYXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzLCBub3QgaW4gY2FudmFzXG4gIC8vIHVuaXRzLlxuICBsZXQgcmV0dXJuZWRMb2NhdGlvbjogUG9pbnQgfCBudWxsID0gbnVsbDtcbiAgaWYgKHNlbGVjdGVkVGFza0xvY2F0aW9uICE9PSBudWxsKSB7XG4gICAgcmV0dXJuZWRMb2NhdGlvbiA9IHB0KFxuICAgICAgc2VsZWN0ZWRUYXNrTG9jYXRpb24ueCAvIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLFxuICAgICAgc2VsZWN0ZWRUYXNrTG9jYXRpb24ueSAvIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBvayh7XG4gICAgc2NhbGU6IHNjYWxlLFxuICAgIHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvczogdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zLFxuICAgIHNlbGVjdGVkVGFza0xvY2F0aW9uOiByZXR1cm5lZExvY2F0aW9uLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gZHJhd0VkZ2VzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdLFxuICBzcGFuczogU3BhbltdLFxuICB0YXNrczogVGFza1tdLFxuICBzY2FsZTogU2NhbGUsXG4gIHRhc2tJbmRleFRvUm93OiBUYXNrSW5kZXhUb1JvdyxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXIsXG4gIHRhc2tIaWdobGlnaHRzOiBTZXQ8bnVtYmVyPlxuKSB7XG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IHNyY1NsYWNrOiBTcGFuID0gc3BhbnNbZS5pXTtcbiAgICBjb25zdCBkc3RTbGFjazogU3BhbiA9IHNwYW5zW2Uual07XG4gICAgY29uc3Qgc3JjVGFzazogVGFzayA9IHRhc2tzW2UuaV07XG4gICAgY29uc3QgZHN0VGFzazogVGFzayA9IHRhc2tzW2Uual07XG4gICAgY29uc3Qgc3JjUm93ID0gdGFza0luZGV4VG9Sb3cuZ2V0KGUuaSkhO1xuICAgIGNvbnN0IGRzdFJvdyA9IHRhc2tJbmRleFRvUm93LmdldChlLmopITtcbiAgICBjb25zdCBzcmNEYXkgPSBzcmNTbGFjay5maW5pc2g7XG4gICAgY29uc3QgZHN0RGF5ID0gZHN0U2xhY2suc3RhcnQ7XG5cbiAgICBpZiAodGFza0hpZ2hsaWdodHMuaGFzKGUuaSkgJiYgdGFza0hpZ2hsaWdodHMuaGFzKGUuaikpIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG4gICAgfVxuXG4gICAgZHJhd0Fycm93QmV0d2VlblRhc2tzKFxuICAgICAgY3R4LFxuICAgICAgc3JjRGF5LFxuICAgICAgZHN0RGF5LFxuICAgICAgc2NhbGUsXG4gICAgICBzcmNSb3csXG4gICAgICBzcmNUYXNrLFxuICAgICAgZHN0Um93LFxuICAgICAgZHN0VGFzayxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0XG4gICAgKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdSYW5nZU92ZXJsYXkoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBzY2FsZTogU2NhbGUsXG4gIGJlZ2luRGF5OiBudW1iZXIsXG4gIGVuZERheTogbnVtYmVyLFxuICB0b3RhbE51bWJlck9mUm93czogbnVtYmVyXG4pIHtcbiAgY29uc3QgdG9wTGVmdCA9IHNjYWxlLmZlYXR1cmUoMCwgYmVnaW5EYXksIEZlYXR1cmUuZGlzcGxheVJhbmdlVG9wKTtcbiAgY29uc3QgYm90dG9tUmlnaHQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHRvdGFsTnVtYmVyT2ZSb3dzLFxuICAgIGVuZERheSxcbiAgICBGZWF0dXJlLnRhc2tSb3dCb3R0b21cbiAgKTtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm92ZXJsYXk7XG4gIGN0eC5maWxsUmVjdChcbiAgICB0b3BMZWZ0LngsXG4gICAgdG9wTGVmdC55LFxuICAgIGJvdHRvbVJpZ2h0LnggLSB0b3BMZWZ0LngsXG4gICAgYm90dG9tUmlnaHQueSAtIHRvcExlZnQueVxuICApO1xuICBjb25zb2xlLmxvZyhcImRyYXdSYW5nZU92ZXJsYXlcIiwgdG9wTGVmdCwgYm90dG9tUmlnaHQpO1xufVxuXG5mdW5jdGlvbiBkcmF3QXJyb3dCZXR3ZWVuVGFza3MoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzcmNEYXk6IG51bWJlcixcbiAgZHN0RGF5OiBudW1iZXIsXG4gIHNjYWxlOiBTY2FsZSxcbiAgc3JjUm93OiBudW1iZXIsXG4gIHNyY1Rhc2s6IFRhc2ssXG4gIGRzdFJvdzogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGlmIChzcmNEYXkgPT09IGRzdERheSkge1xuICAgIGRyYXdWZXJ0aWNhbEFycm93VG9UYXNrKFxuICAgICAgY3R4LFxuICAgICAgc2NhbGUsXG4gICAgICBzcmNSb3csXG4gICAgICBzcmNEYXksXG4gICAgICBzcmNUYXNrLFxuICAgICAgZHN0Um93LFxuICAgICAgZHN0RGF5LFxuICAgICAgZHN0VGFzayxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0XG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBkcmF3TFNoYXBlZEFycm93VG9UYXNrKFxuICAgICAgY3R4LFxuICAgICAgc2NhbGUsXG4gICAgICBzcmNSb3csXG4gICAgICBzcmNEYXksXG4gICAgICBzcmNUYXNrLFxuICAgICAgZHN0Um93LFxuICAgICAgZHN0VGFzayxcbiAgICAgIGRzdERheSxcbiAgICAgIGFycm93SGVhZEhlaWdodCxcbiAgICAgIGFycm93SGVhZFdpZHRoXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjbGVhckNhbnZhcyhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnRcbikge1xuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMuc3VyZmFjZTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbn1cblxuZnVuY3Rpb24gc2V0Rm9udFNpemUoY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIG9wdHM6IFJlbmRlck9wdGlvbnMpIHtcbiAgY3R4LmZvbnQgPSBgJHtvcHRzLmZvbnRTaXplUHh9cHggc2VyaWZgO1xufVxuXG4vLyBEcmF3IEwgc2hhcGVkIGFycm93LCBmaXJzdCBnb2luZyBiZXR3ZWVuIHJvd3MsIHRoZW4gZ29pbmcgYmV0d2VlbiBkYXlzLlxuZnVuY3Rpb24gZHJhd0xTaGFwZWRBcnJvd1RvVGFzayhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNjYWxlOiBTY2FsZSxcbiAgc3JjUm93OiBudW1iZXIsXG4gIHNyY0RheTogbnVtYmVyLFxuICBzcmNUYXNrOiBUYXNrLFxuICBkc3RSb3c6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgZHN0RGF5OiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyLFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyXG4pIHtcbiAgLy8gRHJhdyB2ZXJ0aWNhbCBwYXJ0IG9mIHRoZSBcIkxcIi5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjb25zdCBkaXJlY3Rpb246IERpcmVjdGlvbiA9IHNyY1JvdyA8IGRzdFJvdyA/IFwiZG93blwiIDogXCJ1cFwiO1xuICBjb25zdCB2ZXJ0TGluZVN0YXJ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICBzcmNSb3csXG4gICAgc3JjRGF5LFxuICAgIHZlcnRpY2FsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKHNyY1Rhc2ssIGRpcmVjdGlvbilcbiAgKTtcbiAgY29uc3QgdmVydExpbmVFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIGRzdFJvdyxcbiAgICBzcmNEYXksXG4gICAgaG9yaXpvbnRhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKGRzdFRhc2spXG4gICk7XG4gIGN0eC5tb3ZlVG8odmVydExpbmVTdGFydC54ICsgMC41LCB2ZXJ0TGluZVN0YXJ0LnkpO1xuICBjdHgubGluZVRvKHZlcnRMaW5lU3RhcnQueCArIDAuNSwgdmVydExpbmVFbmQueSk7XG5cbiAgLy8gRHJhdyBob3Jpem9udGFsIHBhcnQgb2YgdGhlIFwiTFwiLlxuICBjb25zdCBob3J6TGluZVN0YXJ0ID0gdmVydExpbmVFbmQ7XG4gIGNvbnN0IGhvcnpMaW5lRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICBkc3RSb3csXG4gICAgZHN0RGF5LFxuICAgIGhvcml6b250YWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihkc3RUYXNrKVxuICApO1xuICBjdHgubW92ZVRvKHZlcnRMaW5lU3RhcnQueCArIDAuNSwgaG9yekxpbmVTdGFydC55KTtcbiAgY3R4LmxpbmVUbyhob3J6TGluZUVuZC54ICsgMC41LCBob3J6TGluZUVuZC55KTtcblxuICAvLyBEcmF3IHRoZSBhcnJvd2hlYWQuIFRoaXMgYXJyb3cgaGVhZCB3aWxsIGFsd2F5cyBwb2ludCB0byB0aGUgcmlnaHRcbiAgLy8gc2luY2UgdGhhdCdzIGhvdyB0aW1lIGZsb3dzLlxuICBjdHgubW92ZVRvKGhvcnpMaW5lRW5kLnggKyAwLjUsIGhvcnpMaW5lRW5kLnkpO1xuICBjdHgubGluZVRvKFxuICAgIGhvcnpMaW5lRW5kLnggLSBhcnJvd0hlYWRIZWlnaHQgKyAwLjUsXG4gICAgaG9yekxpbmVFbmQueSArIGFycm93SGVhZFdpZHRoXG4gICk7XG4gIGN0eC5tb3ZlVG8oaG9yekxpbmVFbmQueCArIDAuNSwgaG9yekxpbmVFbmQueSk7XG4gIGN0eC5saW5lVG8oXG4gICAgaG9yekxpbmVFbmQueCAtIGFycm93SGVhZEhlaWdodCArIDAuNSxcbiAgICBob3J6TGluZUVuZC55IC0gYXJyb3dIZWFkV2lkdGhcbiAgKTtcbiAgY3R4LnN0cm9rZSgpO1xufVxuXG5mdW5jdGlvbiBkcmF3VmVydGljYWxBcnJvd1RvVGFzayhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNjYWxlOiBTY2FsZSxcbiAgc3JjUm93OiBudW1iZXIsXG4gIHNyY0RheTogbnVtYmVyLFxuICBzcmNUYXNrOiBUYXNrLFxuICBkc3RSb3c6IG51bWJlcixcbiAgZHN0RGF5OiBudW1iZXIsXG4gIGRzdFRhc2s6IFRhc2ssXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyXG4pIHtcbiAgY29uc3QgZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSBzcmNSb3cgPCBkc3RSb3cgPyBcImRvd25cIiA6IFwidXBcIjtcbiAgY29uc3QgYXJyb3dTdGFydCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgc3JjUm93LFxuICAgIHNyY0RheSxcbiAgICB2ZXJ0aWNhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihzcmNUYXNrLCBkaXJlY3Rpb24pXG4gICk7XG4gIGNvbnN0IGFycm93RW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICBkc3RSb3csXG4gICAgZHN0RGF5LFxuICAgIHZlcnRpY2FsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oZHN0VGFzaywgZGlyZWN0aW9uKVxuICApO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4Lm1vdmVUbyhhcnJvd1N0YXJ0LnggKyAwLjUsIGFycm93U3RhcnQueSk7XG4gIGN0eC5saW5lVG8oYXJyb3dFbmQueCArIDAuNSwgYXJyb3dFbmQueSk7XG5cbiAgLy8gRHJhdyB0aGUgYXJyb3doZWFkLlxuICBjb25zdCBkZWx0YVkgPSBkaXJlY3Rpb24gPT09IFwiZG93blwiID8gLWFycm93SGVhZEhlaWdodCA6IGFycm93SGVhZEhlaWdodDtcbiAgY3R4Lm1vdmVUbyhhcnJvd0VuZC54ICsgMC41LCBhcnJvd0VuZC55KTtcbiAgY3R4LmxpbmVUbyhhcnJvd0VuZC54IC0gYXJyb3dIZWFkV2lkdGggKyAwLjUsIGFycm93RW5kLnkgKyBkZWx0YVkpO1xuICBjdHgubW92ZVRvKGFycm93RW5kLnggKyAwLjUsIGFycm93RW5kLnkpO1xuICBjdHgubGluZVRvKGFycm93RW5kLnggKyBhcnJvd0hlYWRXaWR0aCArIDAuNSwgYXJyb3dFbmQueSArIGRlbHRhWSk7XG4gIGN0eC5zdHJva2UoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1Rhc2tUZXh0KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgc2NhbGU6IFNjYWxlLFxuICByb3c6IG51bWJlcixcbiAgc3BhbjogU3BhbixcbiAgdGFzazogVGFzayxcbiAgdGFza0luZGV4OiBudW1iZXIsXG4gIG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXIsXG4gIGNsaXBXaWR0aDogbnVtYmVyLFxuICBsYWJlbHM6IHN0cmluZ1tdXG4pIHtcbiAgaWYgKCFvcHRzLmhhc1RleHQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgbGFiZWwgPSBsYWJlbHNbdGFza0luZGV4XTtcblxuICBsZXQgeFN0YXJ0SW5UaW1lID0gc3Bhbi5zdGFydDtcbiAgbGV0IHhQaXhlbERlbHRhID0gMDtcbiAgLy8gRGV0ZXJtaW5lIHdoZXJlIG9uIHRoZSB4LWF4aXMgdG8gc3RhcnQgZHJhd2luZyB0aGUgdGFzayB0ZXh0LlxuICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UgIT09IG51bGwgJiYgb3B0cy5kaXNwbGF5UmFuZ2VVc2FnZSA9PT0gXCJyZXN0cmljdFwiKSB7XG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmluKHNwYW4uc3RhcnQpKSB7XG4gICAgICB4U3RhcnRJblRpbWUgPSBzcGFuLnN0YXJ0O1xuICAgICAgeFBpeGVsRGVsdGEgPSAwO1xuICAgIH0gZWxzZSBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuaW4oc3Bhbi5maW5pc2gpKSB7XG4gICAgICB4U3RhcnRJblRpbWUgPSBzcGFuLmZpbmlzaDtcbiAgICAgIGNvbnN0IG1lYXMgPSBjdHgubWVhc3VyZVRleHQobGFiZWwpO1xuICAgICAgeFBpeGVsRGVsdGEgPSAtbWVhcy53aWR0aCAtIDIgKiBzY2FsZS5tZXRyaWMoTWV0cmljLnRleHRYT2Zmc2V0KTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgc3Bhbi5zdGFydCA8IG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luICYmXG4gICAgICBzcGFuLmZpbmlzaCA+IG9wdHMuZGlzcGxheVJhbmdlLmVuZFxuICAgICkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW47XG4gICAgICB4UGl4ZWxEZWx0YSA9IGNsaXBXaWR0aCAvIDI7XG4gICAgfVxuICB9XG4gIGN0eC5saW5lV2lkdGggPSAxO1xuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcbiAgY29uc3QgdGV4dFN0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIHhTdGFydEluVGltZSwgRmVhdHVyZS50ZXh0U3RhcnQpO1xuICBjb25zdCB0ZXh0WCA9IHRleHRTdGFydC54ICsgeFBpeGVsRGVsdGE7XG4gIGNvbnN0IHRleHRZID0gdGV4dFN0YXJ0Lnk7XG4gIGN0eC5maWxsVGV4dChsYWJlbCwgdGV4dFN0YXJ0LnggKyB4UGl4ZWxEZWx0YSwgdGV4dFN0YXJ0LnkpO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza0JhcihcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHRhc2tTdGFydDogUG9pbnQsXG4gIHRhc2tFbmQ6IFBvaW50LFxuICB0YXNrTGluZUhlaWdodDogbnVtYmVyXG4pIHtcbiAgY3R4LmZpbGxSZWN0KFxuICAgIHRhc2tTdGFydC54LFxuICAgIHRhc2tTdGFydC55LFxuICAgIHRhc2tFbmQueCAtIHRhc2tTdGFydC54LFxuICAgIHRhc2tMaW5lSGVpZ2h0XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUYXNrSGlnaGxpZ2h0KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgaGlnaGxpZ2h0U3RhcnQ6IFBvaW50LFxuICBoaWdobGlnaHRFbmQ6IFBvaW50LFxuICBjb2xvcjogc3RyaW5nLFxuICBib3JkZXJXaWR0aDogbnVtYmVyXG4pIHtcbiAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gIGN0eC5saW5lV2lkdGggPSBib3JkZXJXaWR0aDtcbiAgY3R4LnN0cm9rZVJlY3QoXG4gICAgaGlnaGxpZ2h0U3RhcnQueCxcbiAgICBoaWdobGlnaHRTdGFydC55LFxuICAgIGhpZ2hsaWdodEVuZC54IC0gaGlnaGxpZ2h0U3RhcnQueCxcbiAgICBoaWdobGlnaHRFbmQueSAtIGhpZ2hsaWdodFN0YXJ0LnlcbiAgKTtcbn1cblxuZnVuY3Rpb24gZHJhd1NlbGVjdGlvbkhpZ2hsaWdodChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIGhpZ2hsaWdodFN0YXJ0OiBQb2ludCxcbiAgaGlnaGxpZ2h0RW5kOiBQb2ludCxcbiAgY29sb3I6IHN0cmluZ1xuKSB7XG4gIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgY3R4LmZpbGxSZWN0KFxuICAgIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0U3RhcnQueSxcbiAgICBoaWdobGlnaHRFbmQueCAtIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0RW5kLnkgLSBoaWdobGlnaHRTdGFydC55XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdNaWxlc3RvbmUoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICB0YXNrU3RhcnQ6IFBvaW50LFxuICBkaWFtb25kRGlhbWV0ZXI6IG51bWJlcixcbiAgcGVyY2VudEhlaWdodDogbnVtYmVyXG4pIHtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubGluZVdpZHRoID0gcGVyY2VudEhlaWdodCAvIDI7XG4gIGN0eC5tb3ZlVG8odGFza1N0YXJ0LngsIHRhc2tTdGFydC55IC0gZGlhbW9uZERpYW1ldGVyKTtcbiAgY3R4LmxpbmVUbyh0YXNrU3RhcnQueCArIGRpYW1vbmREaWFtZXRlciwgdGFza1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKHRhc2tTdGFydC54LCB0YXNrU3RhcnQueSArIGRpYW1vbmREaWFtZXRlcik7XG4gIGN0eC5saW5lVG8odGFza1N0YXJ0LnggLSBkaWFtb25kRGlhbWV0ZXIsIHRhc2tTdGFydC55KTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmNvbnN0IGRyYXdUaW1lTWFya2VyQXREYXlUb1Rhc2sgPSAoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICByb3c6IG51bWJlcixcbiAgZGF5OiBudW1iZXIsXG4gIHRhc2s6IFRhc2ssXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgZGF5c1dpdGhUaW1lTWFya2VyczogU2V0PG51bWJlcj4sXG4gIHRpbWVNYXJrZXJSYW5nZXM6IHhSYW5nZVtdXG4pID0+IHtcbiAgaWYgKGRheXNXaXRoVGltZU1hcmtlcnMuaGFzKGRheSkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZGF5c1dpdGhUaW1lTWFya2Vycy5hZGQoZGF5KTtcbiAgY29uc3QgdGltZU1hcmtTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudGltZU1hcmtTdGFydCk7XG5cbiAgLy8gRG9uJ3QgYm90aGVyIGRyYXdpbmcgdGhlIGxpbmUgaWYgaXQncyB1bmRlciBhbiBleGlzdGluZyB0aW1lIGxhYmVsLlxuICBpZiAoXG4gICAgdGltZU1hcmtlclJhbmdlcy5maW5kSW5kZXgoXG4gICAgICAoW2JlZ2luLCBlbmRdKSA9PiB0aW1lTWFya1N0YXJ0LnggPj0gYmVnaW4gJiYgdGltZU1hcmtTdGFydC54IDw9IGVuZFxuICAgICkgIT09IC0xXG4gICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHRpbWVNYXJrRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICByb3csXG4gICAgZGF5LFxuICAgIHZlcnRpY2FsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24odGFzaywgXCJkb3duXCIpXG4gICk7XG4gIGN0eC5saW5lV2lkdGggPSAwLjU7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm92ZXJsYXk7XG5cbiAgY3R4Lm1vdmVUbyh0aW1lTWFya1N0YXJ0LnggKyAwLjUsIHRpbWVNYXJrU3RhcnQueSk7XG4gIGN0eC5saW5lVG8odGltZU1hcmtTdGFydC54ICsgMC41LCB0aW1lTWFya0VuZC55KTtcbiAgY3R4LnN0cm9rZSgpO1xuXG4gIGN0eC5zZXRMaW5lRGFzaChbXSk7XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gIGNvbnN0IHRleHRTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudGltZVRleHRTdGFydCk7XG4gIGNvbnN0IGxhYmVsID0gb3B0cy5kdXJhdGlvbkRpc3BsYXkoZGF5KTtcbiAgY29uc3QgbWVhcyA9IGN0eC5tZWFzdXJlVGV4dChsYWJlbCk7XG4gIGNvbnN0IHRleHRCZWdpbiA9IHRpbWVNYXJrU3RhcnQueDtcbiAgY29uc3QgdGV4dEVuZCA9IHRleHRTdGFydC54ICsgbWVhcy53aWR0aDtcbiAgaWYgKFxuICAgIG9wdHMuaGFzVGV4dCAmJlxuICAgIG9wdHMuaGFzVGltZWxpbmUgJiZcbiAgICAvLyBEb24ndCBkcmF3IHRoZSBsYWJlbCBpZiBpdCBvdmVybGFwcyBhbnkgZXhpc3RpbmcgbGFiZWxzcy5cbiAgICB0aW1lTWFya2VyUmFuZ2VzLmZpbmRJbmRleCgoW2JlZ2luLCBlbmRdKSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAodGV4dEJlZ2luIDw9IGJlZ2luICYmIHRleHRFbmQgPj0gYmVnaW4pIHx8XG4gICAgICAgICh0ZXh0QmVnaW4gPD0gZW5kICYmIHRleHRFbmQgPj0gZW5kKVxuICAgICAgKTtcbiAgICB9KSA9PT0gLTFcbiAgKSB7XG4gICAgY3R4LmZpbGxUZXh0KGAke2xhYmVsfWAsIHRleHRTdGFydC54LCB0ZXh0U3RhcnQueSk7XG4gICAgdGltZU1hcmtlclJhbmdlcy5wdXNoKFt0ZXh0QmVnaW4sIHRleHRFbmRdKTtcbiAgfVxufTtcblxuLyoqIFJlcHJlc2VudHMgYSBoYWxmLW9wZW4gaW50ZXJ2YWwgb2Ygcm93cywgZS5nLiBbc3RhcnQsIGZpbmlzaCkuICovXG5pbnRlcmZhY2UgUm93UmFuZ2Uge1xuICBzdGFydDogbnVtYmVyO1xuICBmaW5pc2g6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIFRhc2tJbmRleFRvUm93UmV0dXJuIHtcbiAgdGFza0luZGV4VG9Sb3c6IFRhc2tJbmRleFRvUm93O1xuXG4gIC8qKiBNYXBzIGVhY2ggcmVzb3VyY2UgdmFsdWUgaW5kZXggdG8gYSByYW5nZSBvZiByb3dzLiAqL1xuICByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPiB8IG51bGw7XG5cbiAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb24gfCBudWxsO1xufVxuXG5jb25zdCB0YXNrSW5kZXhUb1Jvd0Zyb21Hcm91cEJ5ID0gKFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICByZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCxcbiAgY2hhcnRMaWtlOiBDaGFydExpa2UsXG4gIGRpc3BsYXlPcmRlcjogVmVydGV4SW5kaWNlc1xuKTogUmVzdWx0PFRhc2tJbmRleFRvUm93UmV0dXJuPiA9PiB7XG4gIC8vIGRpc3BsYXlPcmRlciBtYXBzIGZyb20gcm93IHRvIHRhc2sgaW5kZXgsIHRoaXMgd2lsbCBwcm9kdWNlIHRoZSBpbnZlcnNlIG1hcHBpbmcuXG4gIGNvbnN0IHRhc2tJbmRleFRvUm93ID0gbmV3IE1hcChcbiAgICAvLyBUaGlzIGxvb2tzIGJhY2t3YXJkcywgYnV0IGl0IGlzbid0LiBSZW1lbWJlciB0aGF0IHRoZSBtYXAgY2FsbGJhY2sgdGFrZXNcbiAgICAvLyAodmFsdWUsIGluZGV4KSBhcyBpdHMgYXJndW1lbnRzLlxuICAgIGRpc3BsYXlPcmRlci5tYXAoKHRhc2tJbmRleDogbnVtYmVyLCByb3c6IG51bWJlcikgPT4gW3Rhc2tJbmRleCwgcm93XSlcbiAgKTtcblxuICBpZiAocmVzb3VyY2VEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gb2soe1xuICAgICAgdGFza0luZGV4VG9Sb3c6IHRhc2tJbmRleFRvUm93LFxuICAgICAgcm93UmFuZ2VzOiBudWxsLFxuICAgICAgcmVzb3VyY2VEZWZpbml0aW9uOiBudWxsLFxuICAgIH0pO1xuICB9XG5cbiAgY29uc3Qgc3RhcnRUYXNrSW5kZXggPSAwO1xuICBjb25zdCBmaW5pc2hUYXNrSW5kZXggPSBjaGFydExpa2UuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgY29uc3QgaWdub3JhYmxlID0gW3N0YXJ0VGFza0luZGV4LCBmaW5pc2hUYXNrSW5kZXhdO1xuXG4gIC8vIEdyb3VwIGFsbCB0YXNrcyBieSB0aGVpciByZXNvdXJjZSB2YWx1ZSwgd2hpbGUgcHJlc2VydmluZyBkaXNwbGF5T3JkZXJcbiAgLy8gb3JkZXIgd2l0aCB0aGUgZ3JvdXBzLlxuICBjb25zdCBncm91cHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyW10+KCk7XG4gIGRpc3BsYXlPcmRlci5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHJlc291cmNlVmFsdWUgPVxuICAgICAgY2hhcnRMaWtlLlZlcnRpY2VzW3Rhc2tJbmRleF0uZ2V0UmVzb3VyY2Uob3B0cy5ncm91cEJ5UmVzb3VyY2UpIHx8IFwiXCI7XG4gICAgY29uc3QgZ3JvdXBNZW1iZXJzID0gZ3JvdXBzLmdldChyZXNvdXJjZVZhbHVlKSB8fCBbXTtcbiAgICBncm91cE1lbWJlcnMucHVzaCh0YXNrSW5kZXgpO1xuICAgIGdyb3Vwcy5zZXQocmVzb3VyY2VWYWx1ZSwgZ3JvdXBNZW1iZXJzKTtcbiAgfSk7XG5cbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcblxuICAvLyBVZ2gsIFN0YXJ0IGFuZCBGaW5pc2ggVGFza3MgbmVlZCB0byBiZSBtYXBwZWQsIGJ1dCBzaG91bGQgbm90IGJlIGRvbmUgdmlhXG4gIC8vIHJlc291cmNlIHZhbHVlLCBzbyBTdGFydCBzaG91bGQgYWx3YXlzIGJlIGZpcnN0LlxuICByZXQuc2V0KDAsIDApO1xuXG4gIC8vIE5vdyBpbmNyZW1lbnQgdXAgdGhlIHJvd3MgYXMgd2UgbW92ZSB0aHJvdWdoIGFsbCB0aGUgZ3JvdXBzLlxuICBsZXQgcm93ID0gMTtcbiAgLy8gQW5kIHRyYWNrIGhvdyBtYW55IHJvd3MgYXJlIGluIGVhY2ggZ3JvdXAuXG4gIGNvbnN0IHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+ID0gbmV3IE1hcCgpO1xuICByZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmZvckVhY2goXG4gICAgKHJlc291cmNlVmFsdWU6IHN0cmluZywgcmVzb3VyY2VJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBzdGFydE9mUm93ID0gcm93O1xuICAgICAgKGdyb3Vwcy5nZXQocmVzb3VyY2VWYWx1ZSkgfHwgW10pLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmFibGUuaW5jbHVkZXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXQuc2V0KHRhc2tJbmRleCwgcm93KTtcbiAgICAgICAgcm93Kys7XG4gICAgICB9KTtcbiAgICAgIHJvd1Jhbmdlcy5zZXQocmVzb3VyY2VJbmRleCwgeyBzdGFydDogc3RhcnRPZlJvdywgZmluaXNoOiByb3cgfSk7XG4gICAgfVxuICApO1xuICByZXQuc2V0KGZpbmlzaFRhc2tJbmRleCwgcm93KTtcblxuICByZXR1cm4gb2soe1xuICAgIHRhc2tJbmRleFRvUm93OiByZXQsXG4gICAgcm93UmFuZ2VzOiByb3dSYW5nZXMsXG4gICAgcmVzb3VyY2VEZWZpbml0aW9uOiByZXNvdXJjZURlZmluaXRpb24sXG4gIH0pO1xufTtcblxuY29uc3QgZHJhd1N3aW1MYW5lSGlnaGxpZ2h0cyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4sXG4gIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXIsXG4gIGdyb3VwQ29sb3I6IHN0cmluZ1xuKSA9PiB7XG4gIGN0eC5maWxsU3R5bGUgPSBncm91cENvbG9yO1xuXG4gIGxldCBncm91cCA9IDA7XG4gIHJvd1Jhbmdlcy5mb3JFYWNoKChyb3dSYW5nZTogUm93UmFuZ2UpID0+IHtcbiAgICBjb25zdCB0b3BMZWZ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvd1JhbmdlLnN0YXJ0LFxuICAgICAgMCxcbiAgICAgIEZlYXR1cmUuZ3JvdXBFbnZlbG9wZVN0YXJ0XG4gICAgKTtcbiAgICBjb25zdCBib3R0b21SaWdodCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3dSYW5nZS5maW5pc2gsXG4gICAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICk7XG4gICAgZ3JvdXArKztcbiAgICAvLyBPbmx5IGhpZ2hsaWdodCBldmVyeSBvdGhlciBncm91cCBiYWNrZ3JvdWQgd2l0aCB0aGUgZ3JvdXBDb2xvci5cbiAgICBpZiAoZ3JvdXAgJSAyID09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY3R4LmZpbGxSZWN0KFxuICAgICAgdG9wTGVmdC54LFxuICAgICAgdG9wTGVmdC55LFxuICAgICAgYm90dG9tUmlnaHQueCAtIHRvcExlZnQueCxcbiAgICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgICApO1xuICB9KTtcbn07XG5cbmNvbnN0IGRyYXdTd2ltTGFuZUxhYmVscyA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uLFxuICBzY2FsZTogU2NhbGUsXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+XG4pID0+IHtcbiAgaWYgKHJvd1JhbmdlcykgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGNvbnN0IGdyb3VwQnlPcmlnaW4gPSBzY2FsZS5mZWF0dXJlKDAsIDAsIEZlYXR1cmUuZ3JvdXBCeU9yaWdpbik7XG5cbiAgaWYgKG9wdHMuaGFzVGltZWxpbmUpIHtcbiAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJib3R0b21cIjtcbiAgICBjdHguZmlsbFRleHQob3B0cy5ncm91cEJ5UmVzb3VyY2UsIGdyb3VwQnlPcmlnaW4ueCwgZ3JvdXBCeU9yaWdpbi55KTtcbiAgfVxuXG4gIGlmIChvcHRzLmhhc1Rhc2tzKSB7XG4gICAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gICAgcm93UmFuZ2VzLmZvckVhY2goKHJvd1JhbmdlOiBSb3dSYW5nZSwgcmVzb3VyY2VJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAocm93UmFuZ2Uuc3RhcnQgPT09IHJvd1JhbmdlLmZpbmlzaCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgICByb3dSYW5nZS5zdGFydCxcbiAgICAgICAgMCxcbiAgICAgICAgRmVhdHVyZS5ncm91cFRleHRTdGFydFxuICAgICAgKTtcbiAgICAgIGN0eC5maWxsVGV4dChcbiAgICAgICAgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1tyZXNvdXJjZUluZGV4XSxcbiAgICAgICAgdGV4dFN0YXJ0LngsXG4gICAgICAgIHRleHRTdGFydC55XG4gICAgICApO1xuICAgIH0pO1xuICB9XG59O1xuIiwgIi8vIFdoZW4gYWRkaW5nIHByb3BlcnRpZXMgdG8gQ29sb3JUaGVtZSBhbHNvIG1ha2Ugc3VyZSB0byBhZGQgYSBjb3JyZXNwb25kaW5nXG4vLyBDU1MgQHByb3BlcnR5IGRlY2xhcmF0aW9uLlxuLy9cbi8vIE5vdGUgdGhhdCBlYWNoIHByb3BlcnR5IGFzc3VtZXMgdGhlIHByZXNlbmNlIG9mIGEgQ1NTIHZhcmlhYmxlIG9mIHRoZSBzYW1lIG5hbWVcbi8vIHdpdGggYSBwcmVjZWVkaW5nIGAtLWAuXG5leHBvcnQgaW50ZXJmYWNlIFRoZW1lIHtcbiAgc3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlTXV0ZWQ6IHN0cmluZztcbiAgb25TdXJmYWNlU2Vjb25kYXJ5OiBzdHJpbmc7XG4gIG92ZXJsYXk6IHN0cmluZztcbiAgZ3JvdXBDb2xvcjogc3RyaW5nO1xuICBoaWdobGlnaHQ6IHN0cmluZztcbiAgYWRkZWQ6IHN0cmluZztcbiAgcmVtb3ZlZDogc3RyaW5nO1xufVxuXG50eXBlIFRoZW1lUHJvcCA9IGtleW9mIFRoZW1lO1xuXG5jb25zdCBjb2xvclRoZW1lUHJvdG90eXBlOiBUaGVtZSA9IHtcbiAgc3VyZmFjZTogXCJcIixcbiAgb25TdXJmYWNlOiBcIlwiLFxuICBvblN1cmZhY2VNdXRlZDogXCJcIixcbiAgb25TdXJmYWNlU2Vjb25kYXJ5OiBcIlwiLFxuICBvdmVybGF5OiBcIlwiLFxuICBncm91cENvbG9yOiBcIlwiLFxuICBoaWdobGlnaHQ6IFwiXCIsXG4gIGFkZGVkOiBcIlwiLFxuICByZW1vdmVkOiBcIlwiLFxufTtcblxuZXhwb3J0IGNvbnN0IGNvbG9yVGhlbWVGcm9tRWxlbWVudCA9IChlbGU6IEhUTUxFbGVtZW50KTogVGhlbWUgPT4ge1xuICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlKTtcbiAgY29uc3QgcmV0ID0gT2JqZWN0LmFzc2lnbih7fSwgY29sb3JUaGVtZVByb3RvdHlwZSk7XG4gIE9iamVjdC5rZXlzKHJldCkuZm9yRWFjaCgobmFtZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0W25hbWUgYXMgVGhlbWVQcm9wXSA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoYC0tJHtuYW1lfWApO1xuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHsgTWV0cmljRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9tZXRyaWNzL21ldHJpY3NcIjtcbmltcG9ydCB7IE1ldHJpY1JhbmdlIH0gZnJvbSBcIi4uL21ldHJpY3MvcmFuZ2VcIjtcbmltcG9ydCB7XG4gIER1cFRhc2tPcCxcbiAgSW5zZXJ0TmV3RW1wdHlNaWxlc3RvbmVBZnRlck9wLFxuICBTZXRUYXNrTmFtZU9wLFxuICBTcGxpdFRhc2tPcCxcbn0gZnJvbSBcIi4uL29wcy9jaGFydFwiO1xuaW1wb3J0IHsgQWRkTWV0cmljT3AsIFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IE9wLCBhcHBseUFsbE9wc1RvUGxhbiB9IGZyb20gXCIuLi9vcHMvb3BzXCI7XG5pbXBvcnQge1xuICBBZGRSZXNvdXJjZU9wLFxuICBBZGRSZXNvdXJjZU9wdGlvbk9wLFxuICBEZWxldGVSZXNvdXJjZU9wdGlvbk9wLFxuICBSZW5hbWVSZXNvdXJjZU9wdGlvbk9wLFxuICBTZXRSZXNvdXJjZVZhbHVlT3AsXG59IGZyb20gXCIuLi9vcHMvcmVzb3VyY2VzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhblwiO1xuXG5jb25zdCBwZW9wbGU6IHN0cmluZ1tdID0gW1wiRnJlZFwiLCBcIkJhcm5leVwiLCBcIldpbG1hXCIsIFwiQmV0dHlcIl07XG5cbmNvbnN0IERVUkFUSU9OID0gMTA7XG5cbmNvbnN0IHJuZEludCA9IChuOiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbik7XG59O1xuXG5jb25zdCBybmREdXJhdGlvbiA9ICgpOiBudW1iZXIgPT4ge1xuICByZXR1cm4gcm5kSW50KERVUkFUSU9OKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZVN0YXJ0ZXJQbGFuID0gKCk6IFBsYW4gPT4ge1xuICBjb25zdCBwbGFuID0gbmV3IFBsYW4oKTtcbiAgY29uc3QgcmVzID0gYXBwbHlBbGxPcHNUb1BsYW4oXG4gICAgW1xuICAgICAgSW5zZXJ0TmV3RW1wdHlNaWxlc3RvbmVBZnRlck9wKDApLFxuICAgICAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIDEwLCAxKSxcbiAgICAgIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibG93XCIsIDEpLFxuICAgIF0sXG4gICAgcGxhblxuICApO1xuXG4gIGlmICghcmVzLm9rKSB7XG4gICAgY29uc29sZS5sb2cocmVzLmVycm9yKTtcbiAgfVxuICByZXR1cm4gcGxhbjtcbn07XG5cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZVJhbmRvbVBsYW4gPSAoKTogUGxhbiA9PiB7XG4gIGNvbnN0IHBsYW4gPSBuZXcgUGxhbigpO1xuXG4gIGNvbnN0IG9wczogT3BbXSA9IFtBZGRSZXNvdXJjZU9wKFwiUGVyc29uXCIpXTtcblxuICBwZW9wbGUuZm9yRWFjaCgocGVyc29uOiBzdHJpbmcpID0+IHtcbiAgICBvcHMucHVzaChBZGRSZXNvdXJjZU9wdGlvbk9wKFwiUGVyc29uXCIsIHBlcnNvbikpO1xuICB9KTtcbiAgb3BzLnB1c2goRGVsZXRlUmVzb3VyY2VPcHRpb25PcChcIlBlcnNvblwiLCBcIlwiKSk7XG5cbiAgb3BzLnB1c2goXG4gICAgQWRkTWV0cmljT3AoXCJDb3N0ICgkL2hyKVwiLCBuZXcgTWV0cmljRGVmaW5pdGlvbigxNSwgbmV3IE1ldHJpY1JhbmdlKDApKSksXG4gICAgSW5zZXJ0TmV3RW1wdHlNaWxlc3RvbmVBZnRlck9wKDApLFxuICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCBybmREdXJhdGlvbigpLCAxKSxcbiAgICBTZXRUYXNrTmFtZU9wKDEsIHJhbmRvbVRhc2tOYW1lKCkpLFxuICAgIFNldFJlc291cmNlVmFsdWVPcChcIlBlcnNvblwiLCBwZW9wbGVbcm5kSW50KHBlb3BsZS5sZW5ndGgpXSwgMSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCAxKVxuICApO1xuXG4gIGxldCBudW1UYXNrcyA9IDE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNTA7IGkrKykge1xuICAgIGxldCBpbmRleCA9IHJuZEludChudW1UYXNrcykgKyAxO1xuICAgIG9wcy5wdXNoKFxuICAgICAgU3BsaXRUYXNrT3AoaW5kZXgpLFxuICAgICAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIHJuZER1cmF0aW9uKCksIGluZGV4ICsgMSksXG4gICAgICBTZXRUYXNrTmFtZU9wKGluZGV4ICsgMSwgcmFuZG9tVGFza05hbWUoKSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIGluZGV4ICsgMSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcIm1vZGVyYXRlXCIsIGluZGV4ICsgMSlcbiAgICApO1xuICAgIG51bVRhc2tzKys7XG4gICAgaW5kZXggPSBybmRJbnQobnVtVGFza3MpICsgMTtcbiAgICBvcHMucHVzaChcbiAgICAgIER1cFRhc2tPcChpbmRleCksXG4gICAgICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgaW5kZXggKyAxKSxcbiAgICAgIFNldFRhc2tOYW1lT3AoaW5kZXggKyAxLCByYW5kb21UYXNrTmFtZSgpKSxcbiAgICAgIFNldFJlc291cmNlVmFsdWVPcChcIlBlcnNvblwiLCBwZW9wbGVbcm5kSW50KHBlb3BsZS5sZW5ndGgpXSwgaW5kZXggKyAxKSxcbiAgICAgIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibW9kZXJhdGVcIiwgaW5kZXggKyAxKVxuICAgICk7XG4gICAgbnVtVGFza3MrKztcbiAgfVxuXG4gIGNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKG9wcywgcGxhbik7XG5cbiAgaWYgKCFyZXMub2spIHtcbiAgICBjb25zb2xlLmxvZyhyZXMuZXJyb3IpO1xuICB9XG4gIHJldHVybiBwbGFuO1xufTtcblxuY29uc3QgcGFydHMgPSBbXG4gIFwibG9yZW1cIixcbiAgXCJpcHN1bVwiLFxuICBcImRvbG9yXCIsXG4gIFwic2l0XCIsXG4gIFwiYW1ldFwiLFxuICBcImNvbnNlY3RldHVyXCIsXG4gIFwiYWRpcGlzY2luZ1wiLFxuICBcImVsaXRcIixcbiAgXCJzZWRcIixcbiAgXCJkb1wiLFxuICBcImVpdXNtb2RcIixcbiAgXCJ0ZW1wb3JcIixcbiAgXCJpbmNpZGlkdW50XCIsXG4gIFwidXRcIixcbiAgXCJsYWJvcmVcIixcbiAgXCJldFwiLFxuICBcImRvbG9yZVwiLFxuICBcIm1hZ25hXCIsXG4gIFwiYWxpcXVhXCIsXG4gIFwidXRcIixcbiAgXCJlbmltXCIsXG4gIFwiYWRcIixcbiAgXCJtaW5pbVwiLFxuICBcInZlbmlhbVwiLFxuICBcInF1aXNcIixcbiAgXCJub3N0cnVkXCIsXG4gIFwiZXhlcmNpdGF0aW9uXCIsXG4gIFwidWxsYW1jb1wiLFxuICBcImxhYm9yaXNcIixcbiAgXCJuaXNpXCIsXG4gIFwidXRcIixcbiAgXCJhbGlxdWlwXCIsXG4gIFwiZXhcIixcbiAgXCJlYVwiLFxuICBcImNvbW1vZG9cIixcbiAgXCJjb25zZXF1YXRcIixcbiAgXCJldWlzXCIsXG4gIFwiYXV0ZVwiLFxuICBcImlydXJlXCIsXG4gIFwiZG9sb3JcIixcbiAgXCJpblwiLFxuICBcInJlcHJlaGVuZGVyaXRcIixcbiAgXCJpblwiLFxuICBcInZvbHVwdGF0ZVwiLFxuICBcInZlbGl0XCIsXG4gIFwiZXNzZVwiLFxuICBcImNpbGx1bVwiLFxuICBcImRvbG9yZVwiLFxuICBcImV1XCIsXG4gIFwiZnVnaWF0XCIsXG4gIFwibnVsbGFcIixcbiAgXCJwYXJpYXR1clwiLFxuICBcImV4Y2VwdGV1clwiLFxuICBcInNpbnRcIixcbiAgXCJvY2NhZWNhdFwiLFxuICBcImN1cGlkYXRhdFwiLFxuICBcIm5vblwiLFxuICBcInByb2lkZW50XCIsXG4gIFwic3VudFwiLFxuICBcImluXCIsXG4gIFwiY3VscGFcIixcbiAgXCJxdWlcIixcbiAgXCJvZmZpY2lhXCIsXG4gIFwiZGVzZXJ1bnRcIixcbiAgXCJtb2xsaXRcIixcbiAgXCJhbmltXCIsXG4gIFwiaWRcIixcbiAgXCJlc3RcIixcbiAgXCJsYWJvcnVtXCIsXG5dO1xuXG5jb25zdCBwYXJ0c0xlbmd0aCA9IHBhcnRzLmxlbmd0aDtcblxuY29uc3QgcmFuZG9tVGFza05hbWUgPSAoKTogc3RyaW5nID0+XG4gIGAke3BhcnRzW3JuZEludChwYXJ0c0xlbmd0aCldfSAke3BhcnRzW3JuZEludChwYXJ0c0xlbmd0aCldfWA7XG4iLCAiaW1wb3J0IHsgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgRmlsdGVyRnVuYyB9IGZyb20gXCIuLi9jaGFydC9maWx0ZXIvZmlsdGVyLnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wIH0gZnJvbSBcIi4uL29wcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBTZXRSZXNvdXJjZVZhbHVlT3AgfSBmcm9tIFwiLi4vb3BzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7XG4gIERJVklERVJfTU9WRV9FVkVOVCxcbiAgRGl2aWRlck1vdmUsXG4gIERpdmlkZXJNb3ZlUmVzdWx0LFxufSBmcm9tIFwiLi4vcmVuZGVyZXIvZGl2aWRlcm1vdmUvZGl2aWRlcm1vdmUudHNcIjtcbmltcG9ydCB7XG4gIERSQUdfUkFOR0VfRVZFTlQsXG4gIERyYWdSYW5nZSxcbiAgTW91c2VEcmFnLFxufSBmcm9tIFwiLi4vcmVuZGVyZXIvbW91c2VkcmFnL21vdXNlZHJhZy50c1wiO1xuaW1wb3J0IHsgTW91c2VNb3ZlIH0gZnJvbSBcIi4uL3JlbmRlcmVyL21vdXNlbW92ZS9tb3VzZW1vdmUudHNcIjtcbmltcG9ydCB7IERpc3BsYXlSYW5nZSB9IGZyb20gXCIuLi9yZW5kZXJlci9yYW5nZS9yYW5nZS50c1wiO1xuaW1wb3J0IHtcbiAgUmVuZGVyT3B0aW9ucyxcbiAgUmVuZGVyUmVzdWx0LFxuICBUYXNrTGFiZWwsXG4gIFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyxcbiAgcmVuZGVyVGFza3NUb0NhbnZhcyxcbiAgc3VnZ2VzdGVkQ2FudmFzSGVpZ2h0LFxufSBmcm9tIFwiLi4vcmVuZGVyZXIvcmVuZGVyZXIudHNcIjtcbmltcG9ydCB7IHB0IH0gZnJvbSBcIi4uL3BvaW50L3BvaW50LnRzXCI7XG5pbXBvcnQgeyBTY2FsZSB9IGZyb20gXCIuLi9yZW5kZXJlci9zY2FsZS9zY2FsZS50c1wiO1xuaW1wb3J0IHsgUmVzdWx0IH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgQ29tcHV0ZVNsYWNrLCBDcml0aWNhbFBhdGgsIFNsYWNrLCBTcGFuIH0gZnJvbSBcIi4uL3NsYWNrL3NsYWNrLnRzXCI7XG5pbXBvcnQgeyBUaGVtZSwgY29sb3JUaGVtZUZyb21FbGVtZW50IH0gZnJvbSBcIi4uL3N0eWxlL3RoZW1lL3RoZW1lLnRzXCI7XG5pbXBvcnQge1xuICBnZW5lcmF0ZVJhbmRvbVBsYW4sXG4gIGdlbmVyYXRlU3RhcnRlclBsYW4sXG59IGZyb20gXCIuLi9nZW5lcmF0ZS9nZW5lcmF0ZS50c1wiO1xuaW1wb3J0IHsgZXhlY3V0ZSwgZXhlY3V0ZU9wIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlLnRzXCI7XG5pbXBvcnQgeyBTdGFydEtleWJvYXJkSGFuZGxpbmcgfSBmcm9tIFwiLi4va2V5bWFwL2tleW1hcC50c1wiO1xuaW1wb3J0IHsgUmVtb3ZlRWRnZU9wLCBTZXRUYXNrTmFtZU9wIH0gZnJvbSBcIi4uL29wcy9jaGFydC50c1wiO1xuaW1wb3J0IHsgRGVwZW5kZW5jaWVzUGFuZWwgfSBmcm9tIFwiLi4vZGVwZW5kZW5jaWVzL2RlcGVuZGVuY2llcy1wYW5lbC50c1wiO1xuaW1wb3J0IHsgQWN0aW9uTmFtZXMgfSBmcm9tIFwiLi4vYWN0aW9uL3JlZ2lzdHJ5LnRzXCI7XG5pbXBvcnQge1xuICBTZWxlY3RlZFRhc2tQYW5lbCxcbiAgVGFza01ldHJpY1ZhbHVlQ2hhbmdlRGV0YWlscyxcbiAgVGFza05hbWVDaGFuZ2VEZXRhaWxzLFxuICBUYXNrUmVzb3VyY2VWYWx1ZUNoYW5nZURldGFpbHMsXG59IGZyb20gXCIuLi9zZWxlY3RlZC10YXNrLXBhbmVsL3NlbGVjdGVkLXRhc2stcGFuZWwudHNcIjtcbmltcG9ydCB7IHJlcG9ydE9uRXJyb3IgfSBmcm9tIFwiLi4vcmVwb3J0LWVycm9yL3JlcG9ydC1lcnJvci50c1wiO1xuaW1wb3J0IHsgVGFza0R1cmF0aW9uIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzLnRzXCI7XG5pbXBvcnQgeyBTaW11bGF0aW9uUGFuZWwgfSBmcm9tIFwiLi4vc2ltdWxhdGlvbi1wYW5lbC9zaW11bGF0aW9uLXBhbmVsLnRzXCI7XG5pbXBvcnQgeyBhcHBseVN0b3JlZFRoZW1lIH0gZnJvbSBcIi4uL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlci50c1wiO1xuaW1wb3J0IHsgRWRpdFJlc291cmNlc0RpYWxvZyB9IGZyb20gXCIuLi9lZGl0LXJlc291cmNlcy1kaWFsb2cvZWRpdC1yZXNvdXJjZXMtZGlhbG9nLnRzXCI7XG5pbXBvcnQgeyBFZGl0TWV0cmljc0RpYWxvZyB9IGZyb20gXCIuLi9lZGl0LW1ldHJpY3MtZGlhbG9nL2VkaXQtbWV0cmljcy1kaWFsb2cudHNcIjtcbmltcG9ydCB7IEVkaXRQbGFuU3RhcnREaWFsb2cgfSBmcm9tIFwiLi4vZWRpdC1wbGFuLXN0YXJ0L2VkaXQtcGxhbi1zdGFydC50c1wiO1xuXG5jb25zdCBGT05UX1NJWkVfUFggPSAzMjtcblxuY29uc3QgTlVNX1NJTVVMQVRJT05fTE9PUFMgPSAxMDA7XG5cbmV4cG9ydCBjbGFzcyBFeHBsYW5NYWluIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAvKiogVGhlIFBsYW4gYmVpbmcgZWRpdGVkLiAqL1xuICBwbGFuOiBQbGFuID0gbmV3IFBsYW4oKTtcblxuICAvKiogVGhlIHN0YXJ0IGFuZCBmaW5pc2ggdGltZSBmb3IgZWFjaCBUYXNrIGluIHRoZSBQbGFuLiAqL1xuICBzcGFuczogU3BhbltdID0gW107XG5cbiAgLyoqIFRoZSB0YXNrIGluZGljZXMgb2YgdGFza3Mgb24gdGhlIGNyaXRpY2FsIHBhdGguICovXG4gIGNyaXRpY2FsUGF0aDogbnVtYmVyW10gPSBbXTtcblxuICAvKiogVGhlIHNlbGVjdGlvbiAoaW4gdGltZSkgb2YgdGhlIFBsYW4gY3VycmVudGx5IGJlaW5nIHZpZXdlZC4gKi9cbiAgZGlzcGxheVJhbmdlOiBEaXNwbGF5UmFuZ2UgfCBudWxsID0gbnVsbDtcblxuICAvKiogU2NhbGUgZm9yIHRoZSByYWRhciB2aWV3LCB1c2VkIGZvciBkcmFnIHNlbGVjdGluZyBhIGRpc3BsYXlSYW5nZS4gKi9cbiAgcmFkYXJTY2FsZTogU2NhbGUgfCBudWxsID0gbnVsbDtcblxuICAvKiogQWxsIG9mIHRoZSB0eXBlcyBvZiByZXNvdXJjZXMgaW4gdGhlIHBsYW4uICovXG4gIGdyb3VwQnlPcHRpb25zOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8qKiBXaGljaCBvZiB0aGUgcmVzb3VyY2VzIGFyZSB3ZSBjdXJyZW50bHkgZ3JvdXBpbmcgYnksIHdoZXJlIDAgbWVhbnMgbm9cbiAgICogZ3JvdXBpbmcgaXMgZG9uZS4gKi9cbiAgZ3JvdXBCeU9wdGlvbnNJbmRleDogbnVtYmVyID0gMDtcblxuICAvKiogVGhlIGN1cnJlbnRseSBzZWxlY3RlZCB0YXNrLCBhcyBhbiBpbmRleC4gKi9cbiAgc2VsZWN0ZWRUYXNrOiBudW1iZXIgPSAtMTtcblxuICAvLyBVSSBmZWF0dXJlcyB0aGF0IGNhbiBiZSB0b2dnbGVkIG9uIGFuZCBvZmYuXG4gIHRvcFRpbWVsaW5lOiBib29sZWFuID0gZmFsc2U7XG4gIGNyaXRpY2FsUGF0aHNPbmx5OiBib29sZWFuID0gZmFsc2U7XG4gIGZvY3VzT25UYXNrOiBib29sZWFuID0gZmFsc2U7XG4gIG1vdXNlTW92ZTogTW91c2VNb3ZlIHwgbnVsbCA9IG51bGw7XG5cbiAgZGVwZW5kZW5jaWVzUGFuZWw6IERlcGVuZGVuY2llc1BhbmVsIHwgbnVsbCA9IG51bGw7XG5cbiAgZG93bmxvYWRMaW5rOiBIVE1MQW5jaG9yRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gIHNlbGVjdGVkVGFza1BhbmVsOiBTZWxlY3RlZFRhc2tQYW5lbCB8IG51bGwgPSBudWxsO1xuXG4gIGFsdGVybmF0ZVRhc2tEdXJhdGlvbnM6IG51bWJlcltdIHwgbnVsbCA9IG51bGw7XG5cbiAgc2ltdWxhdGlvblBhbmVsOiBTaW11bGF0aW9uUGFuZWwgfCBudWxsID0gbnVsbDtcblxuICAvKiogQ2FsbGJhY2sgdG8gY2FsbCB3aGVuIGEgbW91c2UgbW92ZXMgb3ZlciB0aGUgY2hhcnQuICovXG4gIHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvczogVXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zIHwgbnVsbCA9IG51bGw7XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgdGhpcy5zaW11bGF0aW9uUGFuZWwgPVxuICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yPFNpbXVsYXRpb25QYW5lbD4oXCJzaW11bGF0aW9uLXBhbmVsXCIpO1xuICAgIHRoaXMuc2ltdWxhdGlvblBhbmVsIS5hZGRFdmVudExpc3RlbmVyKFwic2ltdWxhdGlvbi1zZWxlY3RcIiwgKGUpID0+IHtcbiAgICAgIHRoaXMuYWx0ZXJuYXRlVGFza0R1cmF0aW9ucyA9IGUuZGV0YWlsLmR1cmF0aW9ucztcbiAgICAgIHRoaXMuY3JpdGljYWxQYXRoID0gZS5kZXRhaWwuY3JpdGljYWxQYXRoO1xuICAgICAgdGhpcy5yZWNhbGN1bGF0ZVNwYW5zQW5kQ3JpdGljYWxQYXRoKCk7XG4gICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZG93bmxvYWRMaW5rID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxBbmNob3JFbGVtZW50PihcIiNkb3dubG9hZFwiKSE7XG4gICAgdGhpcy5kb3dubG9hZExpbmsuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucHJlcGFyZURvd25sb2FkKCk7XG4gICAgfSk7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXNQYW5lbCA9IHRoaXMucXVlcnlTZWxlY3RvcihcImRlcGVuZGVuY2llcy1wYW5lbFwiKSE7XG5cbiAgICB0aGlzLmRlcGVuZGVuY2llc1BhbmVsIS5hZGRFdmVudExpc3RlbmVyKFwiYWRkLWRlcGVuZGVuY3lcIiwgYXN5bmMgKGUpID0+IHtcbiAgICAgIGxldCBhY3Rpb25OYW1lOiBBY3Rpb25OYW1lcyA9IFwiQWRkUHJlZGVjZXNzb3JBY3Rpb25cIjtcbiAgICAgIGlmIChlLmRldGFpbC5kZXBUeXBlID09PSBcInN1Y2NcIikge1xuICAgICAgICBhY3Rpb25OYW1lID0gXCJBZGRTdWNjZXNzb3JBY3Rpb25cIjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGUoYWN0aW9uTmFtZSwgdGhpcyk7XG4gICAgICBpZiAoIXJldC5vaykge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5kZXBlbmRlbmNpZXNQYW5lbCEuYWRkRXZlbnRMaXN0ZW5lcihcImRlbGV0ZS1kZXBlbmRlbmN5XCIsIGFzeW5jIChlKSA9PiB7XG4gICAgICBsZXQgW2ksIGpdID0gW2UuZGV0YWlsLnRhc2tJbmRleCwgdGhpcy5zZWxlY3RlZFRhc2tdO1xuICAgICAgaWYgKGUuZGV0YWlsLmRlcFR5cGUgPT09IFwic3VjY1wiKSB7XG4gICAgICAgIFtpLCBqXSA9IFtqLCBpXTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG9wID0gUmVtb3ZlRWRnZU9wKGksIGopO1xuICAgICAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZU9wKG9wLCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLCB0cnVlLCB0aGlzKTtcbiAgICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJldC5lcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnNlbGVjdGVkVGFza1BhbmVsID0gdGhpcy5xdWVyeVNlbGVjdG9yKFwic2VsZWN0ZWQtdGFzay1wYW5lbFwiKSE7XG4gICAgdGhpcy5zZWxlY3RlZFRhc2tQYW5lbC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJ0YXNrLW5hbWUtY2hhbmdlXCIsXG4gICAgICBhc3luYyAoZTogQ3VzdG9tRXZlbnQ8VGFza05hbWVDaGFuZ2VEZXRhaWxzPikgPT4ge1xuICAgICAgICBjb25zdCBvcCA9IFNldFRhc2tOYW1lT3AoZS5kZXRhaWwudGFza0luZGV4LCBlLmRldGFpbC5uYW1lKTtcbiAgICAgICAgcmVwb3J0T25FcnJvcihhd2FpdCBleGVjdXRlT3Aob3AsIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCIsIHRydWUsIHRoaXMpKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5zZWxlY3RlZFRhc2tQYW5lbC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJ0YXNrLXJlc291cmNlLXZhbHVlLWNoYW5nZVwiLFxuICAgICAgYXN5bmMgKGU6IEN1c3RvbUV2ZW50PFRhc2tSZXNvdXJjZVZhbHVlQ2hhbmdlRGV0YWlscz4pID0+IHtcbiAgICAgICAgY29uc3QgeyBuYW1lLCB2YWx1ZSwgdGFza0luZGV4IH0gPSBlLmRldGFpbDtcbiAgICAgICAgY29uc3Qgb3AgPSBTZXRSZXNvdXJjZVZhbHVlT3AobmFtZSwgdmFsdWUsIHRhc2tJbmRleCk7XG4gICAgICAgIHJlcG9ydE9uRXJyb3IoYXdhaXQgZXhlY3V0ZU9wKG9wLCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLCB0cnVlLCB0aGlzKSk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMuc2VsZWN0ZWRUYXNrUGFuZWwuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwidGFzay1tZXRyaWMtdmFsdWUtY2hhbmdlXCIsXG4gICAgICBhc3luYyAoZTogQ3VzdG9tRXZlbnQ8VGFza01ldHJpY1ZhbHVlQ2hhbmdlRGV0YWlscz4pID0+IHtcbiAgICAgICAgY29uc3QgeyBuYW1lLCB2YWx1ZSwgdGFza0luZGV4IH0gPSBlLmRldGFpbDtcbiAgICAgICAgY29uc3Qgb3AgPSBTZXRNZXRyaWNWYWx1ZU9wKG5hbWUsIHZhbHVlLCB0YXNrSW5kZXgpO1xuICAgICAgICByZXBvcnRPbkVycm9yKGF3YWl0IGV4ZWN1dGVPcChvcCwgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIiwgdHJ1ZSwgdGhpcykpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBEcmFnZ2luZyBvbiB0aGUgcmFkYXIuXG4gICAgY29uc3QgcmFkYXIgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KFwiI3JhZGFyXCIpITtcbiAgICBuZXcgTW91c2VEcmFnKHJhZGFyKTtcbiAgICByYWRhci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgRFJBR19SQU5HRV9FVkVOVCxcbiAgICAgIHRoaXMuZHJhZ1JhbmdlSGFuZGxlci5iaW5kKHRoaXMpIGFzIEV2ZW50TGlzdGVuZXJcbiAgICApO1xuXG4gICAgLy8gRGl2aWRlciBkcmFnZ2luZy5cbiAgICBjb25zdCBkaXZpZGVyID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcInZlcnRpY2FsLWRpdmlkZXJcIikhO1xuICAgIG5ldyBEaXZpZGVyTW92ZShkb2N1bWVudC5ib2R5LCBkaXZpZGVyLCBcImNvbHVtblwiKTtcblxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihESVZJREVSX01PVkVfRVZFTlQsICgoXG4gICAgICBlOiBDdXN0b21FdmVudDxEaXZpZGVyTW92ZVJlc3VsdD5cbiAgICApID0+IHtcbiAgICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkoXG4gICAgICAgIFwiZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zXCIsXG4gICAgICAgIGBjYWxjKCR7ZS5kZXRhaWwuYmVmb3JlfSUgLSAxNXB4KSAxMHB4IGF1dG9gXG4gICAgICApO1xuICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgfSkgYXMgRXZlbnRMaXN0ZW5lcik7XG5cbiAgICAvLyBCdXR0b25zXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3Jlc2V0LXpvb21cIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBleGVjdXRlKFwiUmVzZXRab29tQWN0aW9uXCIsIHRoaXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2RhcmstbW9kZS10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBleGVjdXRlKFwiVG9nZ2xlRGFya01vZGVBY3Rpb25cIiwgdGhpcyk7XG4gICAgfSk7XG4gICAgYXBwbHlTdG9yZWRUaGVtZSgpO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3JhZGFyLXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIGV4ZWN1dGUoXCJUb2dnbGVSYWRhckFjdGlvblwiLCB0aGlzKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiN0b3AtdGltZWxpbmUtdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJjbGlja1wiLFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnRvcFRpbWVsaW5lID0gIXRoaXMudG9wVGltZWxpbmU7XG4gICAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZ3JvdXAtYnktdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy50b2dnbGVHcm91cEJ5KCk7XG4gICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNjcml0aWNhbC1wYXRocy10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcImNsaWNrXCIsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMudG9nZ2xlQ3JpdGljYWxQYXRoc09ubHkoKTtcbiAgICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IG92ZXJsYXlDYW52YXMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTENhbnZhc0VsZW1lbnQ+KFwiI292ZXJsYXlcIikhO1xuICAgIHRoaXMubW91c2VNb3ZlID0gbmV3IE1vdXNlTW92ZShvdmVybGF5Q2FudmFzKTtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG5cbiAgICBvdmVybGF5Q2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHAgPSBwdChlLm9mZnNldFgsIGUub2Zmc2V0WSk7XG4gICAgICBpZiAodGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5zZXRTZWxlY3Rpb24oXG4gICAgICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MocCwgXCJtb3VzZWRvd25cIikgfHwgLTEsXG4gICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIG92ZXJsYXlDYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBwID0gcHQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICAgICAgaWYgKHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHRhc2tJbmRleCA9XG4gICAgICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MocCwgXCJtb3VzZWRvd25cIikgfHwgLTE7XG4gICAgICAgIGlmICh0YXNrSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgZXhlY3V0ZShcIlJlc2V0Wm9vbUFjdGlvblwiLCB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFNlbGVjdGlvbih0YXNrSW5kZXgsIHRydWUsIHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gUmVhY3QgdG8gdGhlIHVwbG9hZCBpbnB1dC5cbiAgICBjb25zdCBmaWxlVXBsb2FkID1cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTElucHV0RWxlbWVudD4oXCIjZmlsZS11cGxvYWRcIikhO1xuICAgIGZpbGVVcGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBqc29uID0gYXdhaXQgZmlsZVVwbG9hZC5maWxlcyFbMF0udGV4dCgpO1xuICAgICAgY29uc3QgcmV0ID0gUGxhbi5Gcm9tSlNPTlRleHQoanNvbik7XG4gICAgICBpZiAoIXJldC5vaykge1xuICAgICAgICB0aHJvdyByZXQuZXJyb3I7XG4gICAgICB9XG4gICAgICB0aGlzLnBsYW4gPSByZXQudmFsdWU7XG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaW11bGF0ZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucmVjYWxjdWxhdGVTcGFuc0FuZENyaXRpY2FsUGF0aCgpO1xuICAgICAgdGhpcy5jcml0aWNhbFBhdGggPSB0aGlzLnNpbXVsYXRpb25QYW5lbCEuc2ltdWxhdGUoXG4gICAgICAgIHRoaXMucGxhbi5jaGFydCxcbiAgICAgICAgTlVNX1NJTVVMQVRJT05fTE9PUFMsXG4gICAgICAgIHRoaXMuY3JpdGljYWxQYXRoXG4gICAgICApO1xuICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZm9jdXMtb24tc2VsZWN0ZWQtdGFza1wiKSEuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGVGb2N1c09uVGFzaygpO1xuICAgICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2dlbi1yYW5kb20tcGxhblwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucGxhbiA9IGdlbmVyYXRlUmFuZG9tUGxhbigpO1xuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZWRpdC1yZXNvdXJjZXNcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8RWRpdFJlc291cmNlc0RpYWxvZz4oXG4gICAgICAgIFwiZWRpdC1yZXNvdXJjZXMtZGlhbG9nXCJcbiAgICAgICkhLnNob3dNb2RhbCh0aGlzKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNlZGl0LW1ldHJpY3NcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8RWRpdE1ldHJpY3NEaWFsb2c+KFwiZWRpdC1tZXRyaWNzLWRpYWxvZ1wiKSEuc2hvd01vZGFsKFxuICAgICAgICB0aGlzXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2VkaXQtcGxhbi1zdGFydFwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5xdWVyeVNlbGVjdG9yPEVkaXRQbGFuU3RhcnREaWFsb2c+KFxuICAgICAgICAgIFwiZWRpdC1wbGFuLXN0YXJ0XCJcbiAgICAgICAgKSEuc3RhcnQodGhpcy5wbGFuLnN0YXR1cyk7XG4gICAgICAgIGlmIChyZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPIENoYW5nZSB0aGUgc3RhdHVzXG4gICAgICAgIHRoaXMucGxhbi5zdGF0dXMgPSByZXQ7XG4gICAgICAgIHRoaXMucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnBsYW4gPSBnZW5lcmF0ZVN0YXJ0ZXJQbGFuKCk7XG4gICAgdGhpcy51cGRhdGVUYXNrUGFuZWxzKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgICB0aGlzLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpID0+IHRoaXMucGFpbnRDaGFydCgpKTtcbiAgICBTdGFydEtleWJvYXJkSGFuZGxpbmcodGhpcyk7XG4gIH1cblxuICBwcmVwYXJlRG93bmxvYWQoKSB7XG4gICAgY29uc3QgZG93bmxvYWRCbG9iID0gbmV3IEJsb2IoW0pTT04uc3RyaW5naWZ5KHRoaXMucGxhbiwgbnVsbCwgXCIgIFwiKV0sIHtcbiAgICAgIHR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgIH0pO1xuICAgIHRoaXMuZG93bmxvYWRMaW5rIS5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChkb3dubG9hZEJsb2IpO1xuICB9XG5cbiAgdXBkYXRlVGFza1BhbmVscyh0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuc2VsZWN0ZWRUYXNrID0gdGFza0luZGV4O1xuICAgIHRoaXMuc2VsZWN0ZWRUYXNrUGFuZWwhLnVwZGF0ZVNlbGVjdGVkVGFza1BhbmVsKFxuICAgICAgdGhpcy5wbGFuLFxuICAgICAgdGhpcy5zZWxlY3RlZFRhc2tcbiAgICApO1xuICAgIGNvbnN0IGVkZ2VzID0gZWRnZXNCeVNyY0FuZERzdFRvTWFwKHRoaXMucGxhbi5jaGFydC5FZGdlcyk7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXNQYW5lbCEuc2V0VGFza3NBbmRJbmRpY2VzKFxuICAgICAgdGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzLFxuICAgICAgKGVkZ2VzLmJ5RHN0LmdldCh0YXNrSW5kZXgpIHx8IFtdKS5tYXAoKGU6IERpcmVjdGVkRWRnZSkgPT4gZS5pKSxcbiAgICAgIChlZGdlcy5ieVNyYy5nZXQodGFza0luZGV4KSB8fCBbXSkubWFwKChlOiBEaXJlY3RlZEVkZ2UpID0+IGUuailcbiAgICApO1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzUGFuZWwhLmNsYXNzTGlzdC50b2dnbGUoXG4gICAgICBcImhpZGRlblwiLFxuICAgICAgdGhpcy5zZWxlY3RlZFRhc2sgPT09IC0xXG4gICAgKTtcbiAgfVxuXG4gIHNldFNlbGVjdGlvbihcbiAgICBpbmRleDogbnVtYmVyLFxuICAgIGZvY3VzOiBib29sZWFuLFxuICAgIHNjcm9sbFRvU2VsZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZVxuICApIHtcbiAgICB0aGlzLnNlbGVjdGVkVGFzayA9IGluZGV4O1xuICAgIGlmIChmb2N1cykge1xuICAgICAgdGhpcy5mb3JjZUZvY3VzT25UYXNrKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnNlbGVjdGVkVGFzayA9PT0gLTEpIHtcbiAgICAgIHRoaXMuZm9jdXNPblRhc2sgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5wYWludENoYXJ0KHNjcm9sbFRvU2VsZWN0ZWQpO1xuICAgIHRoaXMudXBkYXRlVGFza1BhbmVscyh0aGlzLnNlbGVjdGVkVGFzayk7XG4gIH1cblxuICAvLyBUT0RPIC0gVHVybiB0aGlzIG9uIGFuZCBvZmYgYmFzZWQgb24gbW91c2UgZW50ZXJpbmcgdGhlIGNhbnZhcyBhcmVhLlxuICBvbk1vdXNlTW92ZSgpIHtcbiAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMubW91c2VNb3ZlIS5yZWFkTG9jYXRpb24oKTtcbiAgICBpZiAobG9jYXRpb24gIT09IG51bGwgJiYgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgIT09IG51bGwpIHtcbiAgICAgIHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zKGxvY2F0aW9uLCBcIm1vdXNlbW92ZVwiKTtcbiAgICB9XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgcGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpIHtcbiAgICB0aGlzLnJhZGFyU2NhbGUgPSBudWxsO1xuICAgIHRoaXMuZGlzcGxheVJhbmdlID0gbnVsbDtcbiAgICB0aGlzLmFsdGVybmF0ZVRhc2tEdXJhdGlvbnMgPSBudWxsO1xuICAgIHRoaXMuZ3JvdXBCeU9wdGlvbnMgPSBbXCJcIiwgLi4uT2JqZWN0LmtleXModGhpcy5wbGFuLnJlc291cmNlRGVmaW5pdGlvbnMpXTtcbiAgICBpZiAodGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4ID49IHRoaXMuZ3JvdXBCeU9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXggPSAwO1xuICAgIH1cblxuICAgIHRoaXMucmVjYWxjdWxhdGVTcGFuc0FuZENyaXRpY2FsUGF0aCgpO1xuICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICB9XG5cbiAgZ2V0VGFza0R1cmF0aW9uRnVuYygpOiBUYXNrRHVyYXRpb24ge1xuICAgIGlmICh0aGlzLmFsdGVybmF0ZVRhc2tEdXJhdGlvbnMgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiAodGFza0luZGV4OiBudW1iZXIpID0+IHRoaXMuYWx0ZXJuYXRlVGFza0R1cmF0aW9ucyFbdGFza0luZGV4XTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICh0YXNrSW5kZXg6IG51bWJlcikgPT5cbiAgICAgICAgdGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uZHVyYXRpb247XG4gICAgfVxuICB9XG5cbiAgcmVjYWxjdWxhdGVTcGFuc0FuZENyaXRpY2FsUGF0aCgpIHtcbiAgICBsZXQgc2xhY2tzOiBTbGFja1tdID0gW107XG5cbiAgICBjb25zdCByb3VuZGVyID0gdGhpcy5wbGFuXG4gICAgICAuZ2V0U3RhdGljTWV0cmljRGVmaW5pdGlvbihcIkR1cmF0aW9uXCIpXG4gICAgICAucHJlY2lzaW9uLnJvdW5kZXIoKTtcblxuICAgIGNvbnN0IHNsYWNrUmVzdWx0ID0gQ29tcHV0ZVNsYWNrKFxuICAgICAgdGhpcy5wbGFuLmNoYXJ0LFxuICAgICAgdGhpcy5nZXRUYXNrRHVyYXRpb25GdW5jKCksXG4gICAgICByb3VuZGVyXG4gICAgKTtcbiAgICBpZiAoIXNsYWNrUmVzdWx0Lm9rKSB7XG4gICAgICBjb25zb2xlLmVycm9yKHNsYWNrUmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2xhY2tzID0gc2xhY2tSZXN1bHQudmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5zcGFucyA9IHNsYWNrcy5tYXAoKHZhbHVlOiBTbGFjayk6IFNwYW4gPT4ge1xuICAgICAgcmV0dXJuIHZhbHVlLmVhcmx5O1xuICAgIH0pO1xuICAgIHRoaXMuY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrcywgcm91bmRlcik7XG4gICAgdGhpcy51cGRhdGVUYXNrUGFuZWxzKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgfVxuXG4gIGdldFRhc2tMYWJlbGxlcigpOiBUYXNrTGFiZWwge1xuICAgIHJldHVybiAodGFza0luZGV4OiBudW1iZXIpOiBzdHJpbmcgPT5cbiAgICAgIGAke3RoaXMucGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLm5hbWV9YDtcbiAgfVxuXG4gIGRyYWdSYW5nZUhhbmRsZXIoZTogQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPikge1xuICAgIGlmICh0aGlzLnJhZGFyU2NhbGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYmVnaW4gPSB0aGlzLnJhZGFyU2NhbGUuZGF5Um93RnJvbVBvaW50KGUuZGV0YWlsLmJlZ2luKTtcbiAgICBjb25zdCBlbmQgPSB0aGlzLnJhZGFyU2NhbGUuZGF5Um93RnJvbVBvaW50KGUuZGV0YWlsLmVuZCk7XG4gICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBuZXcgRGlzcGxheVJhbmdlKGJlZ2luLmRheSwgZW5kLmRheSk7XG4gICAgdGhpcy5wYWludENoYXJ0KCk7XG4gIH1cblxuICB0b2dnbGVSYWRhcigpIHtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJyYWRhci1wYXJlbnRcIikhLmNsYXNzTGlzdC50b2dnbGUoXCJoaWRkZW5cIik7XG4gIH1cblxuICB0b2dnbGVHcm91cEJ5KCkge1xuICAgIHRoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleCA9XG4gICAgICAodGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4ICsgMSkgJSB0aGlzLmdyb3VwQnlPcHRpb25zLmxlbmd0aDtcbiAgfVxuXG4gIHRvZ2dsZUNyaXRpY2FsUGF0aHNPbmx5KCkge1xuICAgIHRoaXMuY3JpdGljYWxQYXRoc09ubHkgPSAhdGhpcy5jcml0aWNhbFBhdGhzT25seTtcbiAgfVxuXG4gIHRvZ2dsZUZvY3VzT25UYXNrKCkge1xuICAgIHRoaXMuZm9jdXNPblRhc2sgPSAhdGhpcy5mb2N1c09uVGFzaztcbiAgICBpZiAoIXRoaXMuZm9jdXNPblRhc2spIHtcbiAgICAgIHRoaXMuZGlzcGxheVJhbmdlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBmb3JjZUZvY3VzT25UYXNrKCkge1xuICAgIHRoaXMuZm9jdXNPblRhc2sgPSB0cnVlO1xuICB9XG5cbiAgcGFpbnRDaGFydChzY3JvbGxUb1NlbGVjdGVkOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zb2xlLnRpbWUoXCJwYWludENoYXJ0XCIpO1xuXG4gICAgY29uc3QgdGhlbWVDb2xvcnM6IFRoZW1lID0gY29sb3JUaGVtZUZyb21FbGVtZW50KGRvY3VtZW50LmJvZHkpO1xuXG4gICAgbGV0IGZpbHRlckZ1bmM6IEZpbHRlckZ1bmMgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBzdGFydEFuZEZpbmlzaCA9IFswLCB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMV07XG4gICAgaWYgKHRoaXMuY3JpdGljYWxQYXRoc09ubHkpIHtcbiAgICAgIGNvbnN0IGhpZ2hsaWdodFNldCA9IG5ldyBTZXQodGhpcy5jcml0aWNhbFBhdGgpO1xuICAgICAgZmlsdGVyRnVuYyA9ICh0YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgICAgICBpZiAoc3RhcnRBbmRGaW5pc2guaW5jbHVkZXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaWdobGlnaHRTZXQuaGFzKHRhc2tJbmRleCk7XG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5mb2N1c09uVGFzayAmJiB0aGlzLnNlbGVjdGVkVGFzayAhPSAtMSkge1xuICAgICAgLy8gRmluZCBhbGwgcHJlZGVjZXNzb3IgYW5kIHN1Y2Nlc3NvcnMgb2YgdGhlIGdpdmVuIHRhc2suXG4gICAgICBjb25zdCBuZWlnaGJvclNldCA9IG5ldyBTZXQoKTtcbiAgICAgIG5laWdoYm9yU2V0LmFkZCh0aGlzLnNlbGVjdGVkVGFzayk7XG4gICAgICBsZXQgZWFybGllc3RTdGFydCA9IHRoaXMuc3BhbnNbdGhpcy5zZWxlY3RlZFRhc2tdLnN0YXJ0O1xuICAgICAgbGV0IGxhdGVzdEZpbmlzaCA9IHRoaXMuc3BhbnNbdGhpcy5zZWxlY3RlZFRhc2tdLmZpbmlzaDtcbiAgICAgIHRoaXMucGxhbi5jaGFydC5FZGdlcy5mb3JFYWNoKChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgICAgaWYgKGVkZ2UuaSA9PT0gdGhpcy5zZWxlY3RlZFRhc2spIHtcbiAgICAgICAgICBuZWlnaGJvclNldC5hZGQoZWRnZS5qKTtcbiAgICAgICAgICBpZiAobGF0ZXN0RmluaXNoIDwgdGhpcy5zcGFuc1tlZGdlLmpdLmZpbmlzaCkge1xuICAgICAgICAgICAgbGF0ZXN0RmluaXNoID0gdGhpcy5zcGFuc1tlZGdlLmpdLmZpbmlzaDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVkZ2UuaiA9PT0gdGhpcy5zZWxlY3RlZFRhc2spIHtcbiAgICAgICAgICBuZWlnaGJvclNldC5hZGQoZWRnZS5pKTtcbiAgICAgICAgICBpZiAoZWFybGllc3RTdGFydCA+IHRoaXMuc3BhbnNbZWRnZS5pXS5zdGFydCkge1xuICAgICAgICAgICAgZWFybGllc3RTdGFydCA9IHRoaXMuc3BhbnNbZWRnZS5pXS5zdGFydDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gVE9ETyAtIFNpbmNlIHdlIG92ZXJ3cml0ZSBkaXNwbGF5UmFuZ2UgdGhhdCBtZWFucyBkcmFnZ2luZyBvbiB0aGUgcmFkYXJcbiAgICAgIC8vIHdpbGwgbm90IHdvcmsgd2hlbiBmb2N1c2luZyBvbiBhIHNlbGVjdGVkIHRhc2suIEJ1ZyBvciBmZWF0dXJlP1xuICAgICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBuZXcgRGlzcGxheVJhbmdlKGVhcmxpZXN0U3RhcnQgLSAxLCBsYXRlc3RGaW5pc2ggKyAxKTtcblxuICAgICAgZmlsdGVyRnVuYyA9IChfdGFzazogVGFzaywgdGFza0luZGV4OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICAgICAgaWYgKHN0YXJ0QW5kRmluaXNoLmluY2x1ZGVzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZWlnaGJvclNldC5oYXModGFza0luZGV4KTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgZHVyYXRpb25EaXNwbGF5ID0gKHQ6IG51bWJlcikgPT5cbiAgICAgIHRoaXMucGxhbi5kdXJhdGlvblVuaXRzLmRpc3BsYXlUaW1lKHQpO1xuXG4gICAgY29uc3QgcmFkYXJPcHRzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgICAgZm9udFNpemVQeDogNixcbiAgICAgIGhhc1RleHQ6IGZhbHNlLFxuICAgICAgZGlzcGxheVJhbmdlOiB0aGlzLmRpc3BsYXlSYW5nZSxcbiAgICAgIGRpc3BsYXlSYW5nZVVzYWdlOiBcImhpZ2hsaWdodFwiLFxuICAgICAgY29sb3JzOiB7XG4gICAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZTogdGhlbWVDb2xvcnMub25TdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2VNdXRlZDogdGhlbWVDb2xvcnMub25TdXJmYWNlTXV0ZWQsXG4gICAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgICBvdmVybGF5OiB0aGVtZUNvbG9ycy5vdmVybGF5LFxuICAgICAgICBncm91cENvbG9yOiB0aGVtZUNvbG9ycy5ncm91cENvbG9yLFxuICAgICAgICBoaWdobGlnaHQ6IHRoZW1lQ29sb3JzLmhpZ2hsaWdodCxcbiAgICAgIH0sXG4gICAgICBoYXNUaW1lbGluZTogZmFsc2UsXG4gICAgICBoYXNUYXNrczogdHJ1ZSxcbiAgICAgIGhhc0VkZ2VzOiBmYWxzZSxcbiAgICAgIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IGZhbHNlLFxuICAgICAgdGFza0xhYmVsOiB0aGlzLmdldFRhc2tMYWJlbGxlcigpLFxuICAgICAgdGFza0R1cmF0aW9uOiB0aGlzLmdldFRhc2tEdXJhdGlvbkZ1bmMoKSxcbiAgICAgIHRhc2tFbXBoYXNpemU6IHRoaXMuY3JpdGljYWxQYXRoLFxuICAgICAgZmlsdGVyRnVuYzogbnVsbCxcbiAgICAgIGdyb3VwQnlSZXNvdXJjZTogdGhpcy5ncm91cEJ5T3B0aW9uc1t0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXhdLFxuICAgICAgaGlnaGxpZ2h0ZWRUYXNrOiBudWxsLFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXg6IHRoaXMuc2VsZWN0ZWRUYXNrLFxuICAgICAgZHVyYXRpb25EaXNwbGF5OiBkdXJhdGlvbkRpc3BsYXksXG4gICAgfTtcblxuICAgIGNvbnN0IHpvb21PcHRzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgICAgZm9udFNpemVQeDogRk9OVF9TSVpFX1BYLFxuICAgICAgaGFzVGV4dDogdHJ1ZSxcbiAgICAgIGRpc3BsYXlSYW5nZTogdGhpcy5kaXNwbGF5UmFuZ2UsXG4gICAgICBkaXNwbGF5UmFuZ2VVc2FnZTogXCJyZXN0cmljdFwiLFxuICAgICAgY29sb3JzOiB7XG4gICAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZTogdGhlbWVDb2xvcnMub25TdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2VNdXRlZDogdGhlbWVDb2xvcnMub25TdXJmYWNlTXV0ZWQsXG4gICAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgICBvdmVybGF5OiB0aGVtZUNvbG9ycy5vdmVybGF5LFxuICAgICAgICBncm91cENvbG9yOiB0aGVtZUNvbG9ycy5ncm91cENvbG9yLFxuICAgICAgICBoaWdobGlnaHQ6IHRoZW1lQ29sb3JzLmhpZ2hsaWdodCxcbiAgICAgIH0sXG4gICAgICBoYXNUaW1lbGluZTogdGhpcy50b3BUaW1lbGluZSxcbiAgICAgIGhhc1Rhc2tzOiB0cnVlLFxuICAgICAgaGFzRWRnZXM6IHRydWUsXG4gICAgICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiB0cnVlLFxuICAgICAgdGFza0xhYmVsOiB0aGlzLmdldFRhc2tMYWJlbGxlcigpLFxuICAgICAgdGFza0R1cmF0aW9uOiB0aGlzLmdldFRhc2tEdXJhdGlvbkZ1bmMoKSxcbiAgICAgIHRhc2tFbXBoYXNpemU6IHRoaXMuY3JpdGljYWxQYXRoLFxuICAgICAgZmlsdGVyRnVuYzogZmlsdGVyRnVuYyxcbiAgICAgIGdyb3VwQnlSZXNvdXJjZTogdGhpcy5ncm91cEJ5T3B0aW9uc1t0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXhdLFxuICAgICAgaGlnaGxpZ2h0ZWRUYXNrOiAxLFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXg6IHRoaXMuc2VsZWN0ZWRUYXNrLFxuICAgICAgZHVyYXRpb25EaXNwbGF5OiBkdXJhdGlvbkRpc3BsYXksXG4gICAgfTtcblxuICAgIGNvbnN0IHRpbWVsaW5lT3B0czogUmVuZGVyT3B0aW9ucyA9IHtcbiAgICAgIGZvbnRTaXplUHg6IEZPTlRfU0laRV9QWCxcbiAgICAgIGhhc1RleHQ6IHRydWUsXG4gICAgICBkaXNwbGF5UmFuZ2U6IHRoaXMuZGlzcGxheVJhbmdlLFxuICAgICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwicmVzdHJpY3RcIixcbiAgICAgIGNvbG9yczoge1xuICAgICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlTXV0ZWQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZU11dGVkLFxuICAgICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgICAgZ3JvdXBDb2xvcjogdGhlbWVDb2xvcnMuZ3JvdXBDb2xvcixcbiAgICAgICAgaGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5oaWdobGlnaHQsXG4gICAgICB9LFxuICAgICAgaGFzVGltZWxpbmU6IHRydWUsXG4gICAgICBoYXNUYXNrczogZmFsc2UsXG4gICAgICBoYXNFZGdlczogdHJ1ZSxcbiAgICAgIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IHRydWUsXG4gICAgICB0YXNrTGFiZWw6IHRoaXMuZ2V0VGFza0xhYmVsbGVyKCksXG4gICAgICB0YXNrRHVyYXRpb246IHRoaXMuZ2V0VGFza0R1cmF0aW9uRnVuYygpLFxuICAgICAgdGFza0VtcGhhc2l6ZTogdGhpcy5jcml0aWNhbFBhdGgsXG4gICAgICBmaWx0ZXJGdW5jOiBmaWx0ZXJGdW5jLFxuICAgICAgZ3JvdXBCeVJlc291cmNlOiB0aGlzLmdyb3VwQnlPcHRpb25zW3RoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gICAgICBoaWdobGlnaHRlZFRhc2s6IG51bGwsXG4gICAgICBzZWxlY3RlZFRhc2tJbmRleDogdGhpcy5zZWxlY3RlZFRhc2ssXG4gICAgICBkdXJhdGlvbkRpc3BsYXk6IGR1cmF0aW9uRGlzcGxheSxcbiAgICB9O1xuXG4gICAgY29uc3QgcmV0ID0gdGhpcy5wYWludE9uZUNoYXJ0KFwiI3JhZGFyXCIsIHJhZGFyT3B0cyk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yYWRhclNjYWxlID0gcmV0LnZhbHVlLnNjYWxlO1xuXG4gICAgdGhpcy5wYWludE9uZUNoYXJ0KFwiI3RpbWVsaW5lXCIsIHRpbWVsaW5lT3B0cyk7XG4gICAgY29uc3Qgem9vbVJldCA9IHRoaXMucGFpbnRPbmVDaGFydChcIiN6b29tZWRcIiwgem9vbU9wdHMsIFwiI292ZXJsYXlcIik7XG4gICAgaWYgKHpvb21SZXQub2spIHtcbiAgICAgIHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zID1cbiAgICAgICAgem9vbVJldC52YWx1ZS51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M7XG4gICAgICBpZiAoem9vbVJldC52YWx1ZS5zZWxlY3RlZFRhc2tMb2NhdGlvbiAhPT0gbnVsbCAmJiBzY3JvbGxUb1NlbGVjdGVkKSB7XG4gICAgICAgIGxldCB0b3AgPSAwO1xuICAgICAgICBpZiAoIXRoaXMuZm9jdXNPblRhc2spIHtcbiAgICAgICAgICB0b3AgPSB6b29tUmV0LnZhbHVlLnNlbGVjdGVkVGFza0xvY2F0aW9uLnk7XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImNoYXJ0LXBhcmVudFwiKSEuc2Nyb2xsVG8oe1xuICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgYmVoYXZpb3I6IFwic21vb3RoXCIsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUudGltZUVuZChcInBhaW50Q2hhcnRcIik7XG4gIH1cblxuICBwcmVwYXJlQ2FudmFzKFxuICAgIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gICAgY2FudmFzV2lkdGg6IG51bWJlcixcbiAgICBjYW52YXNIZWlnaHQ6IG51bWJlcixcbiAgICB3aWR0aDogbnVtYmVyLFxuICAgIGhlaWdodDogbnVtYmVyXG4gICk6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzV2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGNhbnZhc0hlaWdodDtcbiAgICBjYW52YXMuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gICAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG5cbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpITtcbiAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG5cbiAgICByZXR1cm4gY3R4O1xuICB9XG5cbiAgcGFpbnRPbmVDaGFydChcbiAgICBjYW52YXNJRDogc3RyaW5nLFxuICAgIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gICAgb3ZlcmxheUlEOiBzdHJpbmcgPSBcIlwiXG4gICk6IFJlc3VsdDxSZW5kZXJSZXN1bHQ+IHtcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTENhbnZhc0VsZW1lbnQ+KGNhbnZhc0lEKSE7XG4gICAgY29uc3QgcGFyZW50ID0gY2FudmFzIS5wYXJlbnRFbGVtZW50ITtcbiAgICBjb25zdCByYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgIGNvbnN0IHdpZHRoID0gcGFyZW50LmNsaWVudFdpZHRoIC0gRk9OVF9TSVpFX1BYO1xuICAgIGxldCBoZWlnaHQgPSBwYXJlbnQuY2xpZW50SGVpZ2h0O1xuICAgIGNvbnN0IGNhbnZhc1dpZHRoID0gTWF0aC5jZWlsKHdpZHRoICogcmF0aW8pO1xuICAgIGxldCBjYW52YXNIZWlnaHQgPSBNYXRoLmNlaWwoaGVpZ2h0ICogcmF0aW8pO1xuXG4gICAgY29uc3QgbmV3SGVpZ2h0ID0gc3VnZ2VzdGVkQ2FudmFzSGVpZ2h0KFxuICAgICAgY2FudmFzLFxuICAgICAgdGhpcy5zcGFucyxcbiAgICAgIG9wdHMsXG4gICAgICB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoICsgMiAvLyBUT0RPIC0gV2h5IGRvIHdlIG5lZWQgdGhlICsyIGhlcmUhP1xuICAgICk7XG4gICAgY2FudmFzSGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICAgIGhlaWdodCA9IG5ld0hlaWdodCAvIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuXG4gICAgbGV0IG92ZXJsYXk6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKG92ZXJsYXlJRCkge1xuICAgICAgb3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTENhbnZhc0VsZW1lbnQ+KG92ZXJsYXlJRCkhO1xuICAgICAgdGhpcy5wcmVwYXJlQ2FudmFzKG92ZXJsYXksIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cbiAgICBjb25zdCBjdHggPSB0aGlzLnByZXBhcmVDYW52YXMoXG4gICAgICBjYW52YXMsXG4gICAgICBjYW52YXNXaWR0aCxcbiAgICAgIGNhbnZhc0hlaWdodCxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgKTtcblxuICAgIHJldHVybiByZW5kZXJUYXNrc1RvQ2FudmFzKFxuICAgICAgcGFyZW50LFxuICAgICAgY2FudmFzLFxuICAgICAgY3R4LFxuICAgICAgdGhpcy5wbGFuLFxuICAgICAgdGhpcy5zcGFucyxcbiAgICAgIG9wdHMsXG4gICAgICBvdmVybGF5XG4gICAgKTtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJleHBsYW4tbWFpblwiLCBFeHBsYW5NYWluKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUdDLE9BQUMsQ0FBQyxNQUFNLFFBQVE7QUFDZixZQUFHLE9BQU8sV0FBVyxjQUFjLE9BQU8sSUFBSyxRQUFPLENBQUMsR0FBRyxHQUFHO0FBQUEsaUJBQ3JELE9BQU8sV0FBVyxZQUFZLE9BQU8sUUFBUyxRQUFPLFVBQVUsSUFBSTtBQUFBLFlBQ3RFLE1BQUssV0FBVyxJQUFJLElBQUk7QUFBQSxNQUMvQixHQUFHLFNBQU0sQ0FBQUEsT0FBSztBQUNaO0FBRUEsWUFBSSxTQUFTLENBQUMsUUFBUSxXQUFXO0FBQy9CLGNBQUcsQ0FBQyxVQUFVLENBQUMsT0FBUSxRQUFPO0FBRTlCLGNBQUksaUJBQWlCLGtCQUFrQixNQUFNO0FBQzdDLGNBQUcsQ0FBQyxXQUFXLE1BQU0sRUFBRyxVQUFTLFlBQVksTUFBTTtBQUVuRCxjQUFJLGlCQUFpQixlQUFlO0FBQ3BDLGVBQUksaUJBQWlCLE9BQU8sZUFBZSxlQUFnQixRQUFPO0FBRWxFLGlCQUFPLFVBQVUsZ0JBQWdCLE1BQU07QUFBQSxRQUN6QztBQUVBLFlBQUksS0FBSyxDQUFDLFFBQVEsU0FBUyxZQUFZO0FBQ3JDLGNBQUcsQ0FBQyxPQUFRLFFBQU8sU0FBUyxNQUFNLElBQUksU0FBUyxPQUFPLElBQUk7QUFFMUQsY0FBSSxpQkFBaUIsa0JBQWtCLE1BQU07QUFDN0MsY0FBSSxpQkFBaUIs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d0I7QUFFNUIsYUFBTztBQUFBLElBQ1Q7QUFBQSxJQUVBLGNBQ0UsVUFDQSxNQUNBLFlBQW9CLElBQ0U7QUFDdEIsWUFBTSxTQUFTLEtBQUssY0FBaUMsUUFBUTtBQUM3RCxZQUFNLFNBQVMsT0FBUTtBQUN2QixZQUFNLFFBQVEsT0FBTztBQUNyQixZQUFNLFFBQVEsT0FBTyxjQUFjO0FBQ25DLFVBQUksU0FBUyxPQUFPO0FBQ3BCLFlBQU0sY0FBYyxLQUFLLEtBQUssUUFBUSxLQUFLO0FBQzNDLFVBQUksZUFBZSxLQUFLLEtBQUssU0FBUyxLQUFLO0FBRTNDLFlBQU0sWUFBWTtBQUFBLFFBQ2hCO0FBQUEsUUFDQSxLQUFLO0FBQUEsUUFDTDtBQUFBLFFBQ0EsS0FBSyxLQUFLLE1BQU0sU0FBUyxTQUFTO0FBQUE7QUFBQSxNQUNwQztBQUNBLHFCQUFlO0FBQ2YsZUFBUyxZQUFZLE9BQU87QUFFNUIsVUFBSSxVQUFvQztBQUN4QyxVQUFJLFdBQVc7QUFDYixrQkFBVSxTQUFTLGNBQWlDLFNBQVM7QUFDN0QsYUFBSyxjQUFjLFNBQVMsYUFBYSxjQUFjLE9BQU8sTUFBTTtBQUFBLE1BQ3RFO0FBQ0EsWUFBTSxNQUFNLEtBQUs7QUFBQSxRQUNmO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFFQSxhQUFPO0FBQUEsUUFDTDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQSxLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTDtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxpQkFBZSxPQUFPLGVBQWUsVUFBVTsiLAogICJuYW1lcyI6IFsiXyIsICJyZXN1bHQiLCAiaSIsICJoaWdobGlnaHQiLCAicGFydHMiLCAiUmVzdWx0IiwgImEiLCAiYiIsICJzIiwgInNjb3JlIiwgImoiLCAieCIsICJyIiwgImUiLCAibyIsICJ2IiwgImMiLCAiZiIsICJnbG9iYWwiLCAiZ2xvYmFsVGhpcyIsICJ0cnVzdGVkVHlwZXMiLCAicG9saWN5IiwgImNyZWF0ZVBvbGljeSIsICJjcmVhdGVIVE1MIiwgInMiLCAiYm91bmRBdHRyaWJ1dGVTdWZmaXgiLCAibWFya2VyIiwgIk1hdGgiLCAicmFuZG9tIiwgInRvRml4ZWQiLCAic2xpY2UiLCAibWFya2VyTWF0Y2giLCAibm9kZU1hcmtlciIsICJkIiwgImRvY3VtZW50IiwgImNyZWF0ZU1hcmtlciIsICJjcmVhdGVDb21tZW50IiwgImlzUHJpbWl0aXZlIiwgInZhbHVlIiwgImlzQXJyYXkiLCAiQXJyYXkiLCAiaXNJdGVyYWJsZSIsICJTeW1ib2wiLCAiaXRlcmF0b3IiLCAiU1BBQ0VfQ0hBUiIsICJ0ZXh0RW5kUmVnZXgiLCAiY29tbWVudEVuZFJlZ2V4IiwgImNvbW1lbnQyRW5kUmVnZXgiLCAidGFnRW5kUmVnZXgiLCAiUmVnRXhwIiwgInNpbmdsZVF1b3RlQXR0ckVuZFJlZ2V4IiwgImRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4IiwgInJhd1RleHRFbGVtZW50IiwgInRhZyIsICJ0eXBlIiwgInN0cmluZ3MiLCAidmFsdWVzIiwgIl8kbGl0VHlwZSQiLCAiaHRtbCIsICJzdmciLCAibWF0aG1sIiwgIm5vQ2hhbmdlIiwgImZvciIsICJub3RoaW5nIiwgInRlbXBsYXRlQ2FjaGUiLCAiV2Vha01hcCIsICJ3YWxrZXIiLCAiY3JlYXRlVHJlZVdhbGtlciIsICJ0cnVzdEZyb21UZW1wbGF0ZVN0cmluZyIsICJ0c2EiLCAic3RyaW5nRnJvbVRTQSIsICJoYXNPd25Qcm9wZXJ0eSIsICJFcnJvciIsICJnZXRUZW1wbGF0ZUh0bWwiLCAibCIsICJsZW5ndGgiLCAiYXR0ck5hbWVzIiwgInJhd1RleHRFbmRSZWdleCIsICJyZWdleCIsICJpIiwgImF0dHJOYW1lIiwgIm1hdGNoIiwgImF0dHJOYW1lRW5kSW5kZXgiLCAibGFzdEluZGV4IiwgImV4ZWMiLCAidGVzdCIsICJlbmQiLCAic3RhcnRzV2l0aCIsICJwdXNoIiwgIlRlbXBsYXRlIiwgImNvbnN0cnVjdG9yIiwgIm9wdGlvbnMiLCAibm9kZSIsICJ0aGlzIiwgInBhcnRzIiwgIm5vZGVJbmRleCIsICJhdHRyTmFtZUluZGV4IiwgInBhcnRDb3VudCIsICJlbCIsICJjcmVhdGVFbGVtZW50IiwgImN1cnJlbnROb2RlIiwgImNvbnRlbnQiLCAid3JhcHBlciIsICJmaXJzdENoaWxkIiwgInJlcGxhY2VXaXRoIiwgImNoaWxkTm9kZXMiLCAibmV4dE5vZGUiLCAibm9kZVR5cGUiLCAiaGFzQXR0cmlidXRlcyIsICJuYW1lIiwgImdldEF0dHJpYnV0ZU5hbWVzIiwgImVuZHNXaXRoIiwgInJlYWxOYW1lIiwgInN0YXRpY3MiLCAiZ2V0QXR0cmlidXRlIiwgInNwbGl0IiwgIm0iLCAiaW5kZXgiLCAiY3RvciIsICJQcm9wZXJ0eVBhcnQiLCAiQm9vbGVhbkF0dHJpYnV0ZVBhcnQiLCAiRXZlbnRQYXJ0IiwgIkF0dHJpYnV0ZVBhcnQiLCAicmVtb3ZlQXR0cmlidXRlIiwgInRhZ05hbWUiLCAidGV4dENvbnRlbnQiLCAiZW1wdHlTY3JpcHQiLCAiYXBwZW5kIiwgImRhdGEiLCAiaW5kZXhPZiIsICJfb3B0aW9ucyIsICJpbm5lckhUTUwiLCAicmVzb2x2ZURpcmVjdGl2ZSIsICJwYXJ0IiwgInBhcmVudCIsICJhdHRyaWJ1dGVJbmRleCIsICJjdXJyZW50RGlyZWN0aXZlIiwgIl9fZGlyZWN0aXZlcyIsICJfX2RpcmVjdGl2ZSIsICJuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IiLCAiXyRpbml0aWFsaXplIiwgIl8kcmVzb2x2ZSIsICJUZW1wbGF0ZUluc3RhbmNlIiwgInRlbXBsYXRlIiwgIl8kcGFydHMiLCAiXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuIiwgIl8kdGVtcGxhdGUiLCAiXyRwYXJlbnQiLCAicGFyZW50Tm9kZSIsICJfJGlzQ29ubmVjdGVkIiwgImZyYWdtZW50IiwgImNyZWF0aW9uU2NvcGUiLCAiaW1wb3J0Tm9kZSIsICJwYXJ0SW5kZXgiLCAidGVtcGxhdGVQYXJ0IiwgIkNoaWxkUGFydCIsICJuZXh0U2libGluZyIsICJFbGVtZW50UGFydCIsICJfJHNldFZhbHVlIiwgIl9faXNDb25uZWN0ZWQiLCAic3RhcnROb2RlIiwgImVuZE5vZGUiLCAiXyRjb21taXR0ZWRWYWx1ZSIsICJfJHN0YXJ0Tm9kZSIsICJfJGVuZE5vZGUiLCAiaXNDb25uZWN0ZWQiLCAiZGlyZWN0aXZlUGFyZW50IiwgIl8kY2xlYXIiLCAiX2NvbW1pdFRleHQiLCAiX2NvbW1pdFRlbXBsYXRlUmVzdWx0IiwgIl9jb21taXROb2RlIiwgIl9jb21taXRJdGVyYWJsZSIsICJpbnNlcnRCZWZvcmUiLCAiX2luc2VydCIsICJjcmVhdGVUZXh0Tm9kZSIsICJyZXN1bHQiLCAiXyRnZXRUZW1wbGF0ZSIsICJoIiwgIl91cGRhdGUiLCAiaW5zdGFuY2UiLCAiX2Nsb25lIiwgImdldCIsICJzZXQiLCAiaXRlbVBhcnRzIiwgIml0ZW1QYXJ0IiwgIml0ZW0iLCAic3RhcnQiLCAiZnJvbSIsICJfJG5vdGlmeUNvbm5lY3Rpb25DaGFuZ2VkIiwgIm4iLCAicmVtb3ZlIiwgImVsZW1lbnQiLCAiZmlsbCIsICJTdHJpbmciLCAidmFsdWVJbmRleCIsICJub0NvbW1pdCIsICJjaGFuZ2UiLCAidiIsICJfY29tbWl0VmFsdWUiLCAic2V0QXR0cmlidXRlIiwgInRvZ2dsZUF0dHJpYnV0ZSIsICJzdXBlciIsICJuZXdMaXN0ZW5lciIsICJvbGRMaXN0ZW5lciIsICJzaG91bGRSZW1vdmVMaXN0ZW5lciIsICJjYXB0dXJlIiwgIm9uY2UiLCAicGFzc2l2ZSIsICJzaG91bGRBZGRMaXN0ZW5lciIsICJyZW1vdmVFdmVudExpc3RlbmVyIiwgImFkZEV2ZW50TGlzdGVuZXIiLCAiZXZlbnQiLCAiY2FsbCIsICJob3N0IiwgImhhbmRsZUV2ZW50IiwgIl8kTEgiLCAiX2JvdW5kQXR0cmlidXRlU3VmZml4IiwgIl9tYXJrZXIiLCAiX21hcmtlck1hdGNoIiwgIl9IVE1MX1JFU1VMVCIsICJfZ2V0VGVtcGxhdGVIdG1sIiwgIl9UZW1wbGF0ZUluc3RhbmNlIiwgIl9pc0l0ZXJhYmxlIiwgIl9yZXNvbHZlRGlyZWN0aXZlIiwgIl9DaGlsZFBhcnQiLCAiX0F0dHJpYnV0ZVBhcnQiLCAiX0Jvb2xlYW5BdHRyaWJ1dGVQYXJ0IiwgIl9FdmVudFBhcnQiLCAiX1Byb3BlcnR5UGFydCIsICJfRWxlbWVudFBhcnQiLCAicG9seWZpbGxTdXBwb3J0IiwgImxpdEh0bWxQb2x5ZmlsbFN1cHBvcnQiLCAibGl0SHRtbFZlcnNpb25zIiwgInJlbmRlciIsICJjb250YWluZXIiLCAicGFydE93bmVyTm9kZSIsICJyZW5kZXJCZWZvcmUiLCAiZXhwbGFuTWFpbiIsICJ1bmRvIiwgImkiLCAiaiIsICJlIiwgImkiLCAiZSIsICJpIiwgImoiLCAiZSIsICJ2IiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAidW5kbyIsICJlIiwgInAiLCAidW5zdGFydGVkIiwgImQiLCAiZSIsICJzIiwgInYiLCAiUGFydFR5cGUiLCAiQVRUUklCVVRFIiwgIkNISUxEIiwgIlBST1BFUlRZIiwgIkJPT0xFQU5fQVRUUklCVVRFIiwgIkVWRU5UIiwgIkVMRU1FTlQiLCAiZGlyZWN0aXZlIiwgImMiLCAidmFsdWVzIiwgIl8kbGl0RGlyZWN0aXZlJCIsICJEaXJlY3RpdmUiLCAiX3BhcnRJbmZvIiwgIl8kaXNDb25uZWN0ZWQiLCAidGhpcyIsICJfJHBhcmVudCIsICJwYXJ0IiwgInBhcmVudCIsICJhdHRyaWJ1dGVJbmRleCIsICJfX3BhcnQiLCAiX19hdHRyaWJ1dGVJbmRleCIsICJwcm9wcyIsICJ1cGRhdGUiLCAiX3BhcnQiLCAicmVuZGVyIiwgIl9DaGlsZFBhcnQiLCAiQ2hpbGRQYXJ0IiwgIl8kTEgiLCAiaXNTaW5nbGVFeHByZXNzaW9uIiwgInBhcnQiLCAic3RyaW5ncyIsICJSRVNFVF9WQUxVRSIsICJzZXRDb21taXR0ZWRWYWx1ZSIsICJwYXJ0IiwgInZhbHVlIiwgIl8kY29tbWl0dGVkVmFsdWUiLCAibGl2ZSIsICJkaXJlY3RpdmUiLCAiRGlyZWN0aXZlIiwgInBhcnRJbmZvIiwgInN1cGVyIiwgInR5cGUiLCAiUGFydFR5cGUiLCAiUFJPUEVSVFkiLCAiQVRUUklCVVRFIiwgIkJPT0xFQU5fQVRUUklCVVRFIiwgIkVycm9yIiwgImlzU2luZ2xlRXhwcmVzc2lvbiIsICJ2YWx1ZSIsICJwYXJ0IiwgIm5vQ2hhbmdlIiwgIm5vdGhpbmciLCAiZWxlbWVudCIsICJuYW1lIiwgImhhc0F0dHJpYnV0ZSIsICJnZXRBdHRyaWJ1dGUiLCAiU3RyaW5nIiwgInNldENvbW1pdHRlZFZhbHVlIiwgImV4cGxhbk1haW4iLCAiZSIsICJsIiwgIngiLCAicyIsICJwcmVjaXNpb24iLCAieCIsICJzIiwgInByZWNpc2lvbiIsICJ4IiwgInMiLCAiZXhwbGFuTWFpbiIsICJhIiwgImIiLCAiZXJyb3IiLCAibCIsICJlIiwgImV4cGxhbk1haW4iLCAiZyIsICJmIiwgImUiLCAiXyIsICJlIiwgImEiLCAiYiIsICJpIiwgImUiLCAiZXhwbGFuTWFpbiIsICJhIiwgImIiLCAiZyIsICJfIiwgImkiLCAiZSIsICJvayIsICJ0IiwgImUiLCAiZyIsICJpIiwgImMiLCAiYSIsICJiIiwgImMiLCAicCIsICJwIiwgImMiLCAiaSIsICJyIiwgImUiLCAidG9KU09OIiwgImZyb21KU09OIiwgInVuc3RhcnRlZCIsICJ0IiwgInMiLCAiaSIsICJjIiwgInQiLCAicyIsICJzIiwgInQiLCAiZCIsICJfIiwgImwiLCAiZSIsICJuIiwgImkiLCAidCIsICJhIiwgImIiLCAiYSIsICJiIiwgImUiLCAiXyIsICJ4IiwgImkiLCAiZSIsICJ0ZW1wbGF0ZSIsICJ0IiwgImZ1enp5c29ydCIsICJ2IiwgIngiLCAieSIsICJwIiwgImRpZmZlcmVuY2UiLCAiZSIsICJlIiwgImUiLCAieCIsICJmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleCIsICJuIiwgInkiLCAieCIsICJhIiwgImIiLCAicCIsICJfIiwgImRpZmZlcmVuY2UiLCAiZSIsICJjb3JuZXJzIiwgInJvdyIsICJybmRJbnQiLCAibiIsICJpIiwgImUiLCAiaSIsICJqIiwgInAiLCAidCJdCn0K
