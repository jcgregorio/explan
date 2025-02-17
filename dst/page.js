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
    displayTime(t4) {
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
    displayTime(t4) {
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
    started = false;
    startDate = /* @__PURE__ */ new Date();
    resourceDefinitions;
    metricDefinitions;
    constructor() {
      this.chart = new Chart();
      this.resourceDefinitions = Object.assign({}, StaticResourceDefinitions);
      this.metricDefinitions = Object.assign({}, StaticMetricDefinitions);
      this.durationUnits = new Days(
        /* @__PURE__ */ new Date(),
        this.getStaticMetricDefinition("Duration")
      );
      this.applyMetricsAndResourcesToVertices();
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
    toJSON() {
      return {
        startDate: this.started ? this.startDate.getTime() : 0,
        durationUnits: this.durationUnits.toJSON(),
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
    static FromJSON = (text) => {
      const planSerialized = JSON.parse(text);
      const plan = new _Plan();
      plan.chart.Vertices = planSerialized.chart.vertices.map(
        (taskSerialized) => {
          const task = new Task(taskSerialized.name);
          task.metrics = taskSerialized.metrics;
          task.resources = taskSerialized.resources;
          task.id = taskSerialized.id;
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
      if (planSerialized.startDate === 0) {
        plan.started = false;
        plan.startDate = /* @__PURE__ */ new Date();
      } else {
        plan.started = true;
        plan.startDate = new Date(planSerialized.startDate);
      }
      plan.durationUnits = UnitBase.fromJSON(
        planSerialized.durationUnits,
        plan.startDate,
        plan.getStaticMetricDefinition("Duration")
      );
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
        const ret = Plan.FromJSON(json);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2Z1enp5c29ydC9mdXp6eXNvcnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL3NyYy9saXQtaHRtbC50cyIsICIuLi9zcmMvcmVzdWx0LnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9uLnRzIiwgIi4uL3NyYy9kYWcvZGFnLnRzIiwgIi4uL3NyYy9vcHMvb3BzLnRzIiwgIi4uL3NyYy9vcHMvbWV0cmljcy50cyIsICIuLi9zcmMvb3BzL2NoYXJ0LnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9hZGRQcmVkZWNlc3Nvci50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvYWRkU3VjY2Vzc29yLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9nb3RvU2VhcmNoLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9oZWxwLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9yZXNldFpvb20udHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3Rhc2tzLnRzIiwgIi4uL3NyYy9zdHlsZS90b2dnbGVyL3RvZ2dsZXIudHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3RvZ2dsZURhcmtNb2RlLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy90b2dnbGVGb2N1cy50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvdG9nZ2xlUmFkYXIudHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3VuZG8udHMiLCAiLi4vc3JjL2FjdGlvbi9yZWdpc3RyeS50cyIsICIuLi9zcmMvYWN0aW9uL2V4ZWN1dGUudHMiLCAiLi4vc3JjL2tleW1hcC9rZXltYXAudHMiLCAiLi4vc3JjL2hlbHAvaGVscC50cyIsICIuLi9zcmMvcmVzb3VyY2VzL3Jlc291cmNlcy50cyIsICIuLi9zcmMvaWNvbnMvaWNvbnMudHMiLCAiLi4vc3JjL29wcy9yZXNvdXJjZXMudHMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL3NyYy9kaXJlY3RpdmUudHMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpdC1odG1sL3NyYy9kaXJlY3RpdmUtaGVscGVycy50cyIsICIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvc3JjL2RpcmVjdGl2ZXMvbGl2ZS50cyIsICIuLi9zcmMvZWRpdC1yZXNvdXJjZS1kZWZpbml0aW9uL2VkaXQtcmVzb3VyY2UtZGVmaW5pdGlvbi50cyIsICIuLi9zcmMvbWV0cmljcy9yYW5nZS50cyIsICIuLi9zcmMvcHJlY2lzaW9uL3ByZWNpc2lvbi50cyIsICIuLi9zcmMvbWV0cmljcy9tZXRyaWNzLnRzIiwgIi4uL3NyYy9lZGl0LW1ldHJpY3MtZGlhbG9nL2VkaXQtbWV0cmljcy1kaWFsb2cudHMiLCAiLi4vc3JjL3JlcG9ydC1lcnJvci9yZXBvcnQtZXJyb3IudHMiLCAiLi4vc3JjL2VkaXQtbWV0cmljLWRlZmluaXRpb24vZWRpdC1tZXRyaWMtZGVmaW5pdGlvbi50cyIsICIuLi9zcmMvZGVwZW5kZW5jaWVzL2RlcGVuZGVuY2llcy1wYW5lbC50cyIsICIuLi9zcmMvZGFnL2FsZ29yaXRobXMvZGZzLnRzIiwgIi4uL3NyYy9kYWcvYWxnb3JpdGhtcy9jaXJjdWxhci50cyIsICIuLi9zcmMvYWRkLWRlcGVuZGVuY3ktZGlhbG9nL2FkZC1kZXBlbmRlbmN5LWRpYWxvZy50cyIsICIuLi9zcmMvZWRpdC1yZXNvdXJjZXMtZGlhbG9nL2VkaXQtcmVzb3VyY2VzLWRpYWxvZy50cyIsICIuLi9zcmMvZGFnL2FsZ29yaXRobXMvdG9wb3NvcnQudHMiLCAiLi4vc3JjL2NoYXJ0L2NoYXJ0LnRzIiwgIi4uL3NyYy9zdGF0cy9jZGYvdHJpYW5ndWxhci90cmlhbmd1bGFyLnRzIiwgIi4uL3NyYy9zdGF0cy9jZGYvdHJpYW5ndWxhci9qYWNvYmlhbi50cyIsICIuLi9zcmMvdW5pdHMvcGFyc2UudHMiLCAiLi4vc3JjL3VuaXRzL3dlZWtkYXlzLnRzIiwgIi4uL3NyYy91bml0cy91bml0LnRzIiwgIi4uL3NyYy9wbGFuL3BsYW4udHMiLCAiLi4vc3JjL3NlbGVjdGVkLXRhc2stcGFuZWwvc2VsZWN0ZWQtdGFzay1wYW5lbC50cyIsICIuLi9zcmMvc2xhY2svc2xhY2sudHMiLCAiLi4vc3JjL3NpbXVsYXRpb24vc2ltdWxhdGlvbi50cyIsICIuLi9zcmMvc2ltdWxhdGlvbi1wYW5lbC9zaW11bGF0aW9uLXBhbmVsLnRzIiwgIi4uL3NyYy9zZWFyY2gvc2VhcmNoLXRhc2stcGFuZWwudHMiLCAiLi4vc3JjL3NlYXJjaC90YXNrLXNlYXJjaC1jb250cm9scy50cyIsICIuLi9zcmMvcG9pbnQvcG9pbnQudHMiLCAiLi4vc3JjL3JlbmRlcmVyL2RpdmlkZXJtb3ZlL2RpdmlkZXJtb3ZlLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9tb3VzZWRyYWcvbW91c2VkcmFnLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9tb3VzZW1vdmUvbW91c2Vtb3ZlLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9yYW5nZS9yYW5nZS50cyIsICIuLi9zcmMvY2hhcnQvZmlsdGVyL2ZpbHRlci50cyIsICIuLi9zcmMvcmVuZGVyZXIvc2NhbGUvc2NhbGUudHMiLCAiLi4vc3JjL2hpdHJlY3QvaGl0cmVjdC50cyIsICIuLi9zcmMvcmVuZGVyZXIvcmVuZGVyZXIudHMiLCAiLi4vc3JjL3N0eWxlL3RoZW1lL3RoZW1lLnRzIiwgIi4uL3NyYy9nZW5lcmF0ZS9nZW5lcmF0ZS50cyIsICIuLi9zcmMvZXhwbGFuTWFpbi9leHBsYW5NYWluLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBodHRwczovL2dpdGh1Yi5jb20vZmFyemhlci9mdXp6eXNvcnQgdjMuMC4yXHJcblxyXG4vLyBVTUQgKFVuaXZlcnNhbCBNb2R1bGUgRGVmaW5pdGlvbikgZm9yIGZ1enp5c29ydFxyXG47KChyb290LCBVTUQpID0+IHtcclxuICBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShbXSwgVU1EKVxyXG4gIGVsc2UgaWYodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzID0gVU1EKClcclxuICBlbHNlIHJvb3RbJ2Z1enp5c29ydCddID0gVU1EKClcclxufSkodGhpcywgXyA9PiB7XHJcbiAgJ3VzZSBzdHJpY3QnXHJcblxyXG4gIHZhciBzaW5nbGUgPSAoc2VhcmNoLCB0YXJnZXQpID0+IHtcclxuICAgIGlmKCFzZWFyY2ggfHwgIXRhcmdldCkgcmV0dXJuIE5VTExcclxuXHJcbiAgICB2YXIgcHJlcGFyZWRTZWFyY2ggPSBnZXRQcmVwYXJlZFNlYXJjaChzZWFyY2gpXHJcbiAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcblxyXG4gICAgdmFyIHNlYXJjaEJpdGZsYWdzID0gcHJlcGFyZWRTZWFyY2guYml0ZmxhZ3NcclxuICAgIGlmKChzZWFyY2hCaXRmbGFncyAmIHRhcmdldC5fYml0ZmxhZ3MpICE9PSBzZWFyY2hCaXRmbGFncykgcmV0dXJuIE5VTExcclxuXHJcbiAgICByZXR1cm4gYWxnb3JpdGhtKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQpXHJcbiAgfVxyXG5cclxuICB2YXIgZ28gPSAoc2VhcmNoLCB0YXJnZXRzLCBvcHRpb25zKSA9PiB7XHJcbiAgICBpZighc2VhcmNoKSByZXR1cm4gb3B0aW9ucz8uYWxsID8gYWxsKHRhcmdldHMsIG9wdGlvbnMpIDogbm9SZXN1bHRzXHJcblxyXG4gICAgdmFyIHByZXBhcmVkU2VhcmNoID0gZ2V0UHJlcGFyZWRTZWFyY2goc2VhcmNoKVxyXG4gICAgdmFyIHNlYXJjaEJpdGZsYWdzID0gcHJlcGFyZWRTZWFyY2guYml0ZmxhZ3NcclxuICAgIHZhciBjb250YWluc1NwYWNlICA9IHByZXBhcmVkU2VhcmNoLmNvbnRhaW5zU3BhY2VcclxuXHJcbiAgICB2YXIgdGhyZXNob2xkID0gZGVub3JtYWxpemVTY29yZSggb3B0aW9ucz8udGhyZXNob2xkIHx8IDAgKVxyXG4gICAgdmFyIGxpbWl0ICAgICA9IG9wdGlvbnM/LmxpbWl0IHx8IElORklOSVRZXHJcblxyXG4gICAgdmFyIHJlc3VsdHNMZW4gPSAwOyB2YXIgbGltaXRlZENvdW50ID0gMFxyXG4gICAgdmFyIHRhcmdldHNMZW4gPSB0YXJnZXRzLmxlbmd0aFxyXG5cclxuICAgIGZ1bmN0aW9uIHB1c2hfcmVzdWx0KHJlc3VsdCkge1xyXG4gICAgICBpZihyZXN1bHRzTGVuIDwgbGltaXQpIHsgcS5hZGQocmVzdWx0KTsgKytyZXN1bHRzTGVuIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgKytsaW1pdGVkQ291bnRcclxuICAgICAgICBpZihyZXN1bHQuX3Njb3JlID4gcS5wZWVrKCkuX3Njb3JlKSBxLnJlcGxhY2VUb3AocmVzdWx0KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBjb2RlIGlzIGNvcHkvcGFzdGVkIDMgdGltZXMgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgW29wdGlvbnMua2V5LCBvcHRpb25zLmtleXMsIG5vIGtleXNdXHJcblxyXG4gICAgLy8gb3B0aW9ucy5rZXlcclxuICAgIGlmKG9wdGlvbnM/LmtleSkge1xyXG4gICAgICB2YXIga2V5ID0gb3B0aW9ucy5rZXlcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldHNMZW47ICsraSkgeyB2YXIgb2JqID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIGtleSlcclxuICAgICAgICBpZighdGFyZ2V0KSBjb250aW51ZVxyXG4gICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuXHJcbiAgICAgICAgaWYoKHNlYXJjaEJpdGZsYWdzICYgdGFyZ2V0Ll9iaXRmbGFncykgIT09IHNlYXJjaEJpdGZsYWdzKSBjb250aW51ZVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBhbGdvcml0aG0ocHJlcGFyZWRTZWFyY2gsIHRhcmdldClcclxuICAgICAgICBpZihyZXN1bHQgPT09IE5VTEwpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYocmVzdWx0Ll9zY29yZSA8IHRocmVzaG9sZCkgY29udGludWVcclxuXHJcbiAgICAgICAgcmVzdWx0Lm9iaiA9IG9ialxyXG4gICAgICAgIHB1c2hfcmVzdWx0KHJlc3VsdClcclxuICAgICAgfVxyXG5cclxuICAgIC8vIG9wdGlvbnMua2V5c1xyXG4gICAgfSBlbHNlIGlmKG9wdGlvbnM/LmtleXMpIHtcclxuICAgICAgdmFyIGtleXMgPSBvcHRpb25zLmtleXNcclxuICAgICAgdmFyIGtleXNMZW4gPSBrZXlzLmxlbmd0aFxyXG5cclxuICAgICAgb3V0ZXI6IGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRzTGVuOyArK2kpIHsgdmFyIG9iaiA9IHRhcmdldHNbaV1cclxuXHJcbiAgICAgICAgeyAvLyBlYXJseSBvdXQgYmFzZWQgb24gYml0ZmxhZ3NcclxuICAgICAgICAgIHZhciBrZXlzQml0ZmxhZ3MgPSAwXHJcbiAgICAgICAgICBmb3IgKHZhciBrZXlJID0gMDsga2V5SSA8IGtleXNMZW47ICsra2V5SSkge1xyXG4gICAgICAgICAgICB2YXIga2V5ID0ga2V5c1trZXlJXVxyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBrZXkpXHJcbiAgICAgICAgICAgIGlmKCF0YXJnZXQpIHsgdG1wVGFyZ2V0c1trZXlJXSA9IG5vVGFyZ2V0OyBjb250aW51ZSB9XHJcbiAgICAgICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuICAgICAgICAgICAgdG1wVGFyZ2V0c1trZXlJXSA9IHRhcmdldFxyXG5cclxuICAgICAgICAgICAga2V5c0JpdGZsYWdzIHw9IHRhcmdldC5fYml0ZmxhZ3NcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZigoc2VhcmNoQml0ZmxhZ3MgJiBrZXlzQml0ZmxhZ3MpICE9PSBzZWFyY2hCaXRmbGFncykgY29udGludWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGNvbnRhaW5zU3BhY2UpIGZvcihsZXQgaT0wOyBpPHByZXBhcmVkU2VhcmNoLnNwYWNlU2VhcmNoZXMubGVuZ3RoOyBpKyspIGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuXHJcbiAgICAgICAgZm9yICh2YXIga2V5SSA9IDA7IGtleUkgPCBrZXlzTGVuOyArK2tleUkpIHtcclxuICAgICAgICAgIHRhcmdldCA9IHRtcFRhcmdldHNba2V5SV1cclxuICAgICAgICAgIGlmKHRhcmdldCA9PT0gbm9UYXJnZXQpIHsgdG1wUmVzdWx0c1trZXlJXSA9IG5vVGFyZ2V0OyBjb250aW51ZSB9XHJcblxyXG4gICAgICAgICAgdG1wUmVzdWx0c1trZXlJXSA9IGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0LCAvKmFsbG93U3BhY2VzPSovZmFsc2UsIC8qYWxsb3dQYXJ0aWFsTWF0Y2g9Ki9jb250YWluc1NwYWNlKVxyXG4gICAgICAgICAgaWYodG1wUmVzdWx0c1trZXlJXSA9PT0gTlVMTCkgeyB0bXBSZXN1bHRzW2tleUldID0gbm9UYXJnZXQ7IGNvbnRpbnVlIH1cclxuXHJcbiAgICAgICAgICAvLyB0b2RvOiB0aGlzIHNlZW1zIHdlaXJkIGFuZCB3cm9uZy4gbGlrZSB3aGF0IGlmIG91ciBmaXJzdCBtYXRjaCB3YXNuJ3QgZ29vZC4gdGhpcyBzaG91bGQganVzdCByZXBsYWNlIGl0IGluc3RlYWQgb2YgYXZlcmFnaW5nIHdpdGggaXRcclxuICAgICAgICAgIC8vIGlmIG91ciBzZWNvbmQgbWF0Y2ggaXNuJ3QgZ29vZCB3ZSBpZ25vcmUgaXQgaW5zdGVhZCBvZiBhdmVyYWdpbmcgd2l0aCBpdFxyXG4gICAgICAgICAgaWYoY29udGFpbnNTcGFjZSkgZm9yKGxldCBpPTA7IGk8cHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZihhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA+IC0xMDAwKSB7XHJcbiAgICAgICAgICAgICAgaWYoa2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPiBORUdBVElWRV9JTkZJTklUWSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRtcCA9IChrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSArIGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldKSAvIDQvKmJvbnVzIHNjb3JlIGZvciBoYXZpbmcgbXVsdGlwbGUgbWF0Y2hlcyovXHJcbiAgICAgICAgICAgICAgICBpZih0bXAgPiBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSkga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPSB0bXBcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0gPiBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSkga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPSBhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoY29udGFpbnNTcGFjZSkge1xyXG4gICAgICAgICAgZm9yKGxldCBpPTA7IGk8cHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlcy5sZW5ndGg7IGkrKykgeyBpZihrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA9PT0gTkVHQVRJVkVfSU5GSU5JVFkpIGNvbnRpbnVlIG91dGVyIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdmFyIGhhc0F0TGVhc3QxTWF0Y2ggPSBmYWxzZVxyXG4gICAgICAgICAgZm9yKGxldCBpPTA7IGkgPCBrZXlzTGVuOyBpKyspIHsgaWYodG1wUmVzdWx0c1tpXS5fc2NvcmUgIT09IE5FR0FUSVZFX0lORklOSVRZKSB7IGhhc0F0TGVhc3QxTWF0Y2ggPSB0cnVlOyBicmVhayB9IH1cclxuICAgICAgICAgIGlmKCFoYXNBdExlYXN0MU1hdGNoKSBjb250aW51ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIG9ialJlc3VsdHMgPSBuZXcgS2V5c1Jlc3VsdChrZXlzTGVuKVxyXG4gICAgICAgIGZvcihsZXQgaT0wOyBpIDwga2V5c0xlbjsgaSsrKSB7IG9ialJlc3VsdHNbaV0gPSB0bXBSZXN1bHRzW2ldIH1cclxuXHJcbiAgICAgICAgaWYoY29udGFpbnNTcGFjZSkge1xyXG4gICAgICAgICAgdmFyIHNjb3JlID0gMFxyXG4gICAgICAgICAgZm9yKGxldCBpPTA7IGk8cHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlcy5sZW5ndGg7IGkrKykgc2NvcmUgKz0ga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gdG9kbyBjb3VsZCByZXdyaXRlIHRoaXMgc2NvcmluZyB0byBiZSBtb3JlIHNpbWlsYXIgdG8gd2hlbiB0aGVyZSdzIHNwYWNlc1xyXG4gICAgICAgICAgLy8gaWYgd2UgbWF0Y2ggbXVsdGlwbGUga2V5cyBnaXZlIHVzIGJvbnVzIHBvaW50c1xyXG4gICAgICAgICAgdmFyIHNjb3JlID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgICAgIGZvcihsZXQgaT0wOyBpPGtleXNMZW47IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gb2JqUmVzdWx0c1tpXVxyXG4gICAgICAgICAgICBpZihyZXN1bHQuX3Njb3JlID4gLTEwMDApIHtcclxuICAgICAgICAgICAgICBpZihzY29yZSA+IE5FR0FUSVZFX0lORklOSVRZKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG1wID0gKHNjb3JlICsgcmVzdWx0Ll9zY29yZSkgLyA0Lypib251cyBzY29yZSBmb3IgaGF2aW5nIG11bHRpcGxlIG1hdGNoZXMqL1xyXG4gICAgICAgICAgICAgICAgaWYodG1wID4gc2NvcmUpIHNjb3JlID0gdG1wXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHJlc3VsdC5fc2NvcmUgPiBzY29yZSkgc2NvcmUgPSByZXN1bHQuX3Njb3JlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvYmpSZXN1bHRzLm9iaiA9IG9ialxyXG4gICAgICAgIG9ialJlc3VsdHMuX3Njb3JlID0gc2NvcmVcclxuICAgICAgICBpZihvcHRpb25zPy5zY29yZUZuKSB7XHJcbiAgICAgICAgICBzY29yZSA9IG9wdGlvbnMuc2NvcmVGbihvYmpSZXN1bHRzKVxyXG4gICAgICAgICAgaWYoIXNjb3JlKSBjb250aW51ZVxyXG4gICAgICAgICAgc2NvcmUgPSBkZW5vcm1hbGl6ZVNjb3JlKHNjb3JlKVxyXG4gICAgICAgICAgb2JqUmVzdWx0cy5fc2NvcmUgPSBzY29yZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoc2NvcmUgPCB0aHJlc2hvbGQpIGNvbnRpbnVlXHJcbiAgICAgICAgcHVzaF9yZXN1bHQob2JqUmVzdWx0cylcclxuICAgICAgfVxyXG5cclxuICAgIC8vIG5vIGtleXNcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRzTGVuOyArK2kpIHsgdmFyIHRhcmdldCA9IHRhcmdldHNbaV1cclxuICAgICAgICBpZighdGFyZ2V0KSBjb250aW51ZVxyXG4gICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuXHJcbiAgICAgICAgaWYoKHNlYXJjaEJpdGZsYWdzICYgdGFyZ2V0Ll9iaXRmbGFncykgIT09IHNlYXJjaEJpdGZsYWdzKSBjb250aW51ZVxyXG4gICAgICAgIHZhciByZXN1bHQgPSBhbGdvcml0aG0ocHJlcGFyZWRTZWFyY2gsIHRhcmdldClcclxuICAgICAgICBpZihyZXN1bHQgPT09IE5VTEwpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYocmVzdWx0Ll9zY29yZSA8IHRocmVzaG9sZCkgY29udGludWVcclxuXHJcbiAgICAgICAgcHVzaF9yZXN1bHQocmVzdWx0KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYocmVzdWx0c0xlbiA9PT0gMCkgcmV0dXJuIG5vUmVzdWx0c1xyXG4gICAgdmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkocmVzdWx0c0xlbilcclxuICAgIGZvcih2YXIgaSA9IHJlc3VsdHNMZW4gLSAxOyBpID49IDA7IC0taSkgcmVzdWx0c1tpXSA9IHEucG9sbCgpXHJcbiAgICByZXN1bHRzLnRvdGFsID0gcmVzdWx0c0xlbiArIGxpbWl0ZWRDb3VudFxyXG4gICAgcmV0dXJuIHJlc3VsdHNcclxuICB9XHJcblxyXG5cclxuICAvLyB0aGlzIGlzIHdyaXR0ZW4gYXMgMSBmdW5jdGlvbiBpbnN0ZWFkIG9mIDIgZm9yIG1pbmlmaWNhdGlvbi4gcGVyZiBzZWVtcyBmaW5lIC4uLlxyXG4gIC8vIGV4Y2VwdCB3aGVuIG1pbmlmaWVkLiB0aGUgcGVyZiBpcyB2ZXJ5IHNsb3dcclxuICB2YXIgaGlnaGxpZ2h0ID0gKHJlc3VsdCwgb3Blbj0nPGI+JywgY2xvc2U9JzwvYj4nKSA9PiB7XHJcbiAgICB2YXIgY2FsbGJhY2sgPSB0eXBlb2Ygb3BlbiA9PT0gJ2Z1bmN0aW9uJyA/IG9wZW4gOiB1bmRlZmluZWRcclxuXHJcbiAgICB2YXIgdGFyZ2V0ICAgICAgPSByZXN1bHQudGFyZ2V0XHJcbiAgICB2YXIgdGFyZ2V0TGVuICAgPSB0YXJnZXQubGVuZ3RoXHJcbiAgICB2YXIgaW5kZXhlcyAgICAgPSByZXN1bHQuaW5kZXhlc1xyXG4gICAgdmFyIGhpZ2hsaWdodGVkID0gJydcclxuICAgIHZhciBtYXRjaEkgICAgICA9IDBcclxuICAgIHZhciBpbmRleGVzSSAgICA9IDBcclxuICAgIHZhciBvcGVuZWQgICAgICA9IGZhbHNlXHJcbiAgICB2YXIgcGFydHMgICAgICAgPSBbXVxyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRMZW47ICsraSkgeyB2YXIgY2hhciA9IHRhcmdldFtpXVxyXG4gICAgICBpZihpbmRleGVzW2luZGV4ZXNJXSA9PT0gaSkge1xyXG4gICAgICAgICsraW5kZXhlc0lcclxuICAgICAgICBpZighb3BlbmVkKSB7IG9wZW5lZCA9IHRydWVcclxuICAgICAgICAgIGlmKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHBhcnRzLnB1c2goaGlnaGxpZ2h0ZWQpOyBoaWdobGlnaHRlZCA9ICcnXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoaWdobGlnaHRlZCArPSBvcGVuXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihpbmRleGVzSSA9PT0gaW5kZXhlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIGlmKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IGNoYXJcclxuICAgICAgICAgICAgcGFydHMucHVzaChjYWxsYmFjayhoaWdobGlnaHRlZCwgbWF0Y2hJKyspKTsgaGlnaGxpZ2h0ZWQgPSAnJ1xyXG4gICAgICAgICAgICBwYXJ0cy5wdXNoKHRhcmdldC5zdWJzdHIoaSsxKSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IGNoYXIgKyBjbG9zZSArIHRhcmdldC5zdWJzdHIoaSsxKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYob3BlbmVkKSB7IG9wZW5lZCA9IGZhbHNlXHJcbiAgICAgICAgICBpZihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGNhbGxiYWNrKGhpZ2hsaWdodGVkLCBtYXRjaEkrKykpOyBoaWdobGlnaHRlZCA9ICcnXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBoaWdobGlnaHRlZCArPSBjbG9zZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBoaWdobGlnaHRlZCArPSBjaGFyXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNhbGxiYWNrID8gcGFydHMgOiBoaWdobGlnaHRlZFxyXG4gIH1cclxuXHJcblxyXG4gIHZhciBwcmVwYXJlID0gKHRhcmdldCkgPT4ge1xyXG4gICAgaWYodHlwZW9mIHRhcmdldCA9PT0gJ251bWJlcicpIHRhcmdldCA9ICcnK3RhcmdldFxyXG4gICAgZWxzZSBpZih0eXBlb2YgdGFyZ2V0ICE9PSAnc3RyaW5nJykgdGFyZ2V0ID0gJydcclxuICAgIHZhciBpbmZvID0gcHJlcGFyZUxvd2VySW5mbyh0YXJnZXQpXHJcbiAgICByZXR1cm4gbmV3X3Jlc3VsdCh0YXJnZXQsIHtfdGFyZ2V0TG93ZXI6aW5mby5fbG93ZXIsIF90YXJnZXRMb3dlckNvZGVzOmluZm8ubG93ZXJDb2RlcywgX2JpdGZsYWdzOmluZm8uYml0ZmxhZ3N9KVxyXG4gIH1cclxuXHJcbiAgdmFyIGNsZWFudXAgPSAoKSA9PiB7IHByZXBhcmVkQ2FjaGUuY2xlYXIoKTsgcHJlcGFyZWRTZWFyY2hDYWNoZS5jbGVhcigpIH1cclxuXHJcblxyXG4gIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcbiAgLy8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcclxuICAvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxyXG4gIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcblxyXG5cclxuICBjbGFzcyBSZXN1bHQge1xyXG4gICAgZ2V0IFsnaW5kZXhlcyddKCkgeyByZXR1cm4gdGhpcy5faW5kZXhlcy5zbGljZSgwLCB0aGlzLl9pbmRleGVzLmxlbikuc29ydCgoYSxiKT0+YS1iKSB9XHJcbiAgICBzZXQgWydpbmRleGVzJ10oaW5kZXhlcykgeyByZXR1cm4gdGhpcy5faW5kZXhlcyA9IGluZGV4ZXMgfVxyXG4gICAgWydoaWdobGlnaHQnXShvcGVuLCBjbG9zZSkgeyByZXR1cm4gaGlnaGxpZ2h0KHRoaXMsIG9wZW4sIGNsb3NlKSB9XHJcbiAgICBnZXQgWydzY29yZSddKCkgeyByZXR1cm4gbm9ybWFsaXplU2NvcmUodGhpcy5fc2NvcmUpIH1cclxuICAgIHNldCBbJ3Njb3JlJ10oc2NvcmUpIHsgdGhpcy5fc2NvcmUgPSBkZW5vcm1hbGl6ZVNjb3JlKHNjb3JlKSB9XHJcbiAgfVxyXG5cclxuICBjbGFzcyBLZXlzUmVzdWx0IGV4dGVuZHMgQXJyYXkge1xyXG4gICAgZ2V0IFsnc2NvcmUnXSgpIHsgcmV0dXJuIG5vcm1hbGl6ZVNjb3JlKHRoaXMuX3Njb3JlKSB9XHJcbiAgICBzZXQgWydzY29yZSddKHNjb3JlKSB7IHRoaXMuX3Njb3JlID0gZGVub3JtYWxpemVTY29yZShzY29yZSkgfVxyXG4gIH1cclxuXHJcbiAgdmFyIG5ld19yZXN1bHQgPSAodGFyZ2V0LCBvcHRpb25zKSA9PiB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgUmVzdWx0KClcclxuICAgIHJlc3VsdFsndGFyZ2V0J10gICAgICAgICAgICAgPSB0YXJnZXRcclxuICAgIHJlc3VsdFsnb2JqJ10gICAgICAgICAgICAgICAgPSBvcHRpb25zLm9iaiAgICAgICAgICAgICAgICAgICA/PyBOVUxMXHJcbiAgICByZXN1bHQuX3Njb3JlICAgICAgICAgICAgICAgID0gb3B0aW9ucy5fc2NvcmUgICAgICAgICAgICAgICAgPz8gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgIHJlc3VsdC5faW5kZXhlcyAgICAgICAgICAgICAgPSBvcHRpb25zLl9pbmRleGVzICAgICAgICAgICAgICA/PyBbXVxyXG4gICAgcmVzdWx0Ll90YXJnZXRMb3dlciAgICAgICAgICA9IG9wdGlvbnMuX3RhcmdldExvd2VyICAgICAgICAgID8/ICcnXHJcbiAgICByZXN1bHQuX3RhcmdldExvd2VyQ29kZXMgICAgID0gb3B0aW9ucy5fdGFyZ2V0TG93ZXJDb2RlcyAgICAgPz8gTlVMTFxyXG4gICAgcmVzdWx0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlcyA9IG9wdGlvbnMuX25leHRCZWdpbm5pbmdJbmRleGVzID8/IE5VTExcclxuICAgIHJlc3VsdC5fYml0ZmxhZ3MgICAgICAgICAgICAgPSBvcHRpb25zLl9iaXRmbGFncyAgICAgICAgICAgICA/PyAwXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIG5vcm1hbGl6ZVNjb3JlID0gc2NvcmUgPT4ge1xyXG4gICAgaWYoc2NvcmUgPT09IE5FR0FUSVZFX0lORklOSVRZKSByZXR1cm4gMFxyXG4gICAgaWYoc2NvcmUgPiAxKSByZXR1cm4gc2NvcmVcclxuICAgIHJldHVybiBNYXRoLkUgKiogKCAoKC1zY29yZSArIDEpKiouMDQzMDcgLSAxKSAqIC0yKVxyXG4gIH1cclxuICB2YXIgZGVub3JtYWxpemVTY29yZSA9IG5vcm1hbGl6ZWRTY29yZSA9PiB7XHJcbiAgICBpZihub3JtYWxpemVkU2NvcmUgPT09IDApIHJldHVybiBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgaWYobm9ybWFsaXplZFNjb3JlID4gMSkgcmV0dXJuIG5vcm1hbGl6ZWRTY29yZVxyXG4gICAgcmV0dXJuIDEgLSBNYXRoLnBvdygoTWF0aC5sb2cobm9ybWFsaXplZFNjb3JlKSAvIC0yICsgMSksIDEgLyAwLjA0MzA3KVxyXG4gIH1cclxuXHJcblxyXG4gIHZhciBwcmVwYXJlU2VhcmNoID0gKHNlYXJjaCkgPT4ge1xyXG4gICAgaWYodHlwZW9mIHNlYXJjaCA9PT0gJ251bWJlcicpIHNlYXJjaCA9ICcnK3NlYXJjaFxyXG4gICAgZWxzZSBpZih0eXBlb2Ygc2VhcmNoICE9PSAnc3RyaW5nJykgc2VhcmNoID0gJydcclxuICAgIHNlYXJjaCA9IHNlYXJjaC50cmltKClcclxuICAgIHZhciBpbmZvID0gcHJlcGFyZUxvd2VySW5mbyhzZWFyY2gpXHJcblxyXG4gICAgdmFyIHNwYWNlU2VhcmNoZXMgPSBbXVxyXG4gICAgaWYoaW5mby5jb250YWluc1NwYWNlKSB7XHJcbiAgICAgIHZhciBzZWFyY2hlcyA9IHNlYXJjaC5zcGxpdCgvXFxzKy8pXHJcbiAgICAgIHNlYXJjaGVzID0gWy4uLm5ldyBTZXQoc2VhcmNoZXMpXSAvLyBkaXN0aW5jdFxyXG4gICAgICBmb3IodmFyIGk9MDsgaTxzZWFyY2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmKHNlYXJjaGVzW2ldID09PSAnJykgY29udGludWVcclxuICAgICAgICB2YXIgX2luZm8gPSBwcmVwYXJlTG93ZXJJbmZvKHNlYXJjaGVzW2ldKVxyXG4gICAgICAgIHNwYWNlU2VhcmNoZXMucHVzaCh7bG93ZXJDb2RlczpfaW5mby5sb3dlckNvZGVzLCBfbG93ZXI6c2VhcmNoZXNbaV0udG9Mb3dlckNhc2UoKSwgY29udGFpbnNTcGFjZTpmYWxzZX0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge2xvd2VyQ29kZXM6IGluZm8ubG93ZXJDb2RlcywgX2xvd2VyOiBpbmZvLl9sb3dlciwgY29udGFpbnNTcGFjZTogaW5mby5jb250YWluc1NwYWNlLCBiaXRmbGFnczogaW5mby5iaXRmbGFncywgc3BhY2VTZWFyY2hlczogc3BhY2VTZWFyY2hlc31cclxuICB9XHJcblxyXG5cclxuXHJcbiAgdmFyIGdldFByZXBhcmVkID0gKHRhcmdldCkgPT4ge1xyXG4gICAgaWYodGFyZ2V0Lmxlbmd0aCA+IDk5OSkgcmV0dXJuIHByZXBhcmUodGFyZ2V0KSAvLyBkb24ndCBjYWNoZSBodWdlIHRhcmdldHNcclxuICAgIHZhciB0YXJnZXRQcmVwYXJlZCA9IHByZXBhcmVkQ2FjaGUuZ2V0KHRhcmdldClcclxuICAgIGlmKHRhcmdldFByZXBhcmVkICE9PSB1bmRlZmluZWQpIHJldHVybiB0YXJnZXRQcmVwYXJlZFxyXG4gICAgdGFyZ2V0UHJlcGFyZWQgPSBwcmVwYXJlKHRhcmdldClcclxuICAgIHByZXBhcmVkQ2FjaGUuc2V0KHRhcmdldCwgdGFyZ2V0UHJlcGFyZWQpXHJcbiAgICByZXR1cm4gdGFyZ2V0UHJlcGFyZWRcclxuICB9XHJcbiAgdmFyIGdldFByZXBhcmVkU2VhcmNoID0gKHNlYXJjaCkgPT4ge1xyXG4gICAgaWYoc2VhcmNoLmxlbmd0aCA+IDk5OSkgcmV0dXJuIHByZXBhcmVTZWFyY2goc2VhcmNoKSAvLyBkb24ndCBjYWNoZSBodWdlIHNlYXJjaGVzXHJcbiAgICB2YXIgc2VhcmNoUHJlcGFyZWQgPSBwcmVwYXJlZFNlYXJjaENhY2hlLmdldChzZWFyY2gpXHJcbiAgICBpZihzZWFyY2hQcmVwYXJlZCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gc2VhcmNoUHJlcGFyZWRcclxuICAgIHNlYXJjaFByZXBhcmVkID0gcHJlcGFyZVNlYXJjaChzZWFyY2gpXHJcbiAgICBwcmVwYXJlZFNlYXJjaENhY2hlLnNldChzZWFyY2gsIHNlYXJjaFByZXBhcmVkKVxyXG4gICAgcmV0dXJuIHNlYXJjaFByZXBhcmVkXHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIGFsbCA9ICh0YXJnZXRzLCBvcHRpb25zKSA9PiB7XHJcbiAgICB2YXIgcmVzdWx0cyA9IFtdOyByZXN1bHRzLnRvdGFsID0gdGFyZ2V0cy5sZW5ndGggLy8gdGhpcyB0b3RhbCBjYW4gYmUgd3JvbmcgaWYgc29tZSB0YXJnZXRzIGFyZSBza2lwcGVkXHJcblxyXG4gICAgdmFyIGxpbWl0ID0gb3B0aW9ucz8ubGltaXQgfHwgSU5GSU5JVFlcclxuXHJcbiAgICBpZihvcHRpb25zPy5rZXkpIHtcclxuICAgICAgZm9yKHZhciBpPTA7aTx0YXJnZXRzLmxlbmd0aDtpKyspIHsgdmFyIG9iaiA9IHRhcmdldHNbaV1cclxuICAgICAgICB2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBvcHRpb25zLmtleSlcclxuICAgICAgICBpZih0YXJnZXQgPT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ld19yZXN1bHQodGFyZ2V0LnRhcmdldCwge19zY29yZTogdGFyZ2V0Ll9zY29yZSwgb2JqOiBvYmp9KVxyXG4gICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpOyBpZihyZXN1bHRzLmxlbmd0aCA+PSBsaW1pdCkgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmKG9wdGlvbnM/LmtleXMpIHtcclxuICAgICAgZm9yKHZhciBpPTA7aTx0YXJnZXRzLmxlbmd0aDtpKyspIHsgdmFyIG9iaiA9IHRhcmdldHNbaV1cclxuICAgICAgICB2YXIgb2JqUmVzdWx0cyA9IG5ldyBLZXlzUmVzdWx0KG9wdGlvbnMua2V5cy5sZW5ndGgpXHJcbiAgICAgICAgZm9yICh2YXIga2V5SSA9IG9wdGlvbnMua2V5cy5sZW5ndGggLSAxOyBrZXlJID49IDA7IC0ta2V5SSkge1xyXG4gICAgICAgICAgdmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwgb3B0aW9ucy5rZXlzW2tleUldKVxyXG4gICAgICAgICAgaWYoIXRhcmdldCkgeyBvYmpSZXN1bHRzW2tleUldID0gbm9UYXJnZXQ7IGNvbnRpbnVlIH1cclxuICAgICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuICAgICAgICAgIHRhcmdldC5fc2NvcmUgPSBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgICAgICAgdGFyZ2V0Ll9pbmRleGVzLmxlbiA9IDBcclxuICAgICAgICAgIG9ialJlc3VsdHNba2V5SV0gPSB0YXJnZXRcclxuICAgICAgICB9XHJcbiAgICAgICAgb2JqUmVzdWx0cy5vYmogPSBvYmpcclxuICAgICAgICBvYmpSZXN1bHRzLl9zY29yZSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKG9ialJlc3VsdHMpOyBpZihyZXN1bHRzLmxlbmd0aCA+PSBsaW1pdCkgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yKHZhciBpPTA7aTx0YXJnZXRzLmxlbmd0aDtpKyspIHsgdmFyIHRhcmdldCA9IHRhcmdldHNbaV1cclxuICAgICAgICBpZih0YXJnZXQgPT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBpZighaXNQcmVwYXJlZCh0YXJnZXQpKSB0YXJnZXQgPSBnZXRQcmVwYXJlZCh0YXJnZXQpXHJcbiAgICAgICAgdGFyZ2V0Ll9zY29yZSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgICAgdGFyZ2V0Ll9pbmRleGVzLmxlbiA9IDBcclxuICAgICAgICByZXN1bHRzLnB1c2godGFyZ2V0KTsgaWYocmVzdWx0cy5sZW5ndGggPj0gbGltaXQpIHJldHVybiByZXN1bHRzXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0c1xyXG4gIH1cclxuXHJcblxyXG4gIHZhciBhbGdvcml0aG0gPSAocHJlcGFyZWRTZWFyY2gsIHByZXBhcmVkLCBhbGxvd1NwYWNlcz1mYWxzZSwgYWxsb3dQYXJ0aWFsTWF0Y2g9ZmFsc2UpID0+IHtcclxuICAgIGlmKGFsbG93U3BhY2VzPT09ZmFsc2UgJiYgcHJlcGFyZWRTZWFyY2guY29udGFpbnNTcGFjZSkgcmV0dXJuIGFsZ29yaXRobVNwYWNlcyhwcmVwYXJlZFNlYXJjaCwgcHJlcGFyZWQsIGFsbG93UGFydGlhbE1hdGNoKVxyXG5cclxuICAgIHZhciBzZWFyY2hMb3dlciAgICAgID0gcHJlcGFyZWRTZWFyY2guX2xvd2VyXHJcbiAgICB2YXIgc2VhcmNoTG93ZXJDb2RlcyA9IHByZXBhcmVkU2VhcmNoLmxvd2VyQ29kZXNcclxuICAgIHZhciBzZWFyY2hMb3dlckNvZGUgID0gc2VhcmNoTG93ZXJDb2Rlc1swXVxyXG4gICAgdmFyIHRhcmdldExvd2VyQ29kZXMgPSBwcmVwYXJlZC5fdGFyZ2V0TG93ZXJDb2Rlc1xyXG4gICAgdmFyIHNlYXJjaExlbiAgICAgICAgPSBzZWFyY2hMb3dlckNvZGVzLmxlbmd0aFxyXG4gICAgdmFyIHRhcmdldExlbiAgICAgICAgPSB0YXJnZXRMb3dlckNvZGVzLmxlbmd0aFxyXG4gICAgdmFyIHNlYXJjaEkgICAgICAgICAgPSAwIC8vIHdoZXJlIHdlIGF0XHJcbiAgICB2YXIgdGFyZ2V0SSAgICAgICAgICA9IDAgLy8gd2hlcmUgeW91IGF0XHJcbiAgICB2YXIgbWF0Y2hlc1NpbXBsZUxlbiA9IDBcclxuXHJcbiAgICAvLyB2ZXJ5IGJhc2ljIGZ1enp5IG1hdGNoOyB0byByZW1vdmUgbm9uLW1hdGNoaW5nIHRhcmdldHMgQVNBUCFcclxuICAgIC8vIHdhbGsgdGhyb3VnaCB0YXJnZXQuIGZpbmQgc2VxdWVudGlhbCBtYXRjaGVzLlxyXG4gICAgLy8gaWYgYWxsIGNoYXJzIGFyZW4ndCBmb3VuZCB0aGVuIGV4aXRcclxuICAgIGZvcig7Oykge1xyXG4gICAgICB2YXIgaXNNYXRjaCA9IHNlYXJjaExvd2VyQ29kZSA9PT0gdGFyZ2V0TG93ZXJDb2Rlc1t0YXJnZXRJXVxyXG4gICAgICBpZihpc01hdGNoKSB7XHJcbiAgICAgICAgbWF0Y2hlc1NpbXBsZVttYXRjaGVzU2ltcGxlTGVuKytdID0gdGFyZ2V0SVxyXG4gICAgICAgICsrc2VhcmNoSTsgaWYoc2VhcmNoSSA9PT0gc2VhcmNoTGVuKSBicmVha1xyXG4gICAgICAgIHNlYXJjaExvd2VyQ29kZSA9IHNlYXJjaExvd2VyQ29kZXNbc2VhcmNoSV1cclxuICAgICAgfVxyXG4gICAgICArK3RhcmdldEk7IGlmKHRhcmdldEkgPj0gdGFyZ2V0TGVuKSByZXR1cm4gTlVMTCAvLyBGYWlsZWQgdG8gZmluZCBzZWFyY2hJXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNlYXJjaEkgPSAwXHJcbiAgICB2YXIgc3VjY2Vzc1N0cmljdCA9IGZhbHNlXHJcbiAgICB2YXIgbWF0Y2hlc1N0cmljdExlbiA9IDBcclxuXHJcbiAgICB2YXIgbmV4dEJlZ2lubmluZ0luZGV4ZXMgPSBwcmVwYXJlZC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNcclxuICAgIGlmKG5leHRCZWdpbm5pbmdJbmRleGVzID09PSBOVUxMKSBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVkLl9uZXh0QmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVOZXh0QmVnaW5uaW5nSW5kZXhlcyhwcmVwYXJlZC50YXJnZXQpXHJcbiAgICB0YXJnZXRJID0gbWF0Y2hlc1NpbXBsZVswXT09PTAgPyAwIDogbmV4dEJlZ2lubmluZ0luZGV4ZXNbbWF0Y2hlc1NpbXBsZVswXS0xXVxyXG5cclxuICAgIC8vIE91ciB0YXJnZXQgc3RyaW5nIHN1Y2Nlc3NmdWxseSBtYXRjaGVkIGFsbCBjaGFyYWN0ZXJzIGluIHNlcXVlbmNlIVxyXG4gICAgLy8gTGV0J3MgdHJ5IGEgbW9yZSBhZHZhbmNlZCBhbmQgc3RyaWN0IHRlc3QgdG8gaW1wcm92ZSB0aGUgc2NvcmVcclxuICAgIC8vIG9ubHkgY291bnQgaXQgYXMgYSBtYXRjaCBpZiBpdCdzIGNvbnNlY3V0aXZlIG9yIGEgYmVnaW5uaW5nIGNoYXJhY3RlciFcclxuICAgIHZhciBiYWNrdHJhY2tDb3VudCA9IDBcclxuICAgIGlmKHRhcmdldEkgIT09IHRhcmdldExlbikgZm9yKDs7KSB7XHJcbiAgICAgIGlmKHRhcmdldEkgPj0gdGFyZ2V0TGVuKSB7XHJcbiAgICAgICAgLy8gV2UgZmFpbGVkIHRvIGZpbmQgYSBnb29kIHNwb3QgZm9yIHRoaXMgc2VhcmNoIGNoYXIsIGdvIGJhY2sgdG8gdGhlIHByZXZpb3VzIHNlYXJjaCBjaGFyIGFuZCBmb3JjZSBpdCBmb3J3YXJkXHJcbiAgICAgICAgaWYoc2VhcmNoSSA8PSAwKSBicmVhayAvLyBXZSBmYWlsZWQgdG8gcHVzaCBjaGFycyBmb3J3YXJkIGZvciBhIGJldHRlciBtYXRjaFxyXG5cclxuICAgICAgICArK2JhY2t0cmFja0NvdW50OyBpZihiYWNrdHJhY2tDb3VudCA+IDIwMCkgYnJlYWsgLy8gZXhwb25lbnRpYWwgYmFja3RyYWNraW5nIGlzIHRha2luZyB0b28gbG9uZywganVzdCBnaXZlIHVwIGFuZCByZXR1cm4gYSBiYWQgbWF0Y2hcclxuXHJcbiAgICAgICAgLS1zZWFyY2hJXHJcbiAgICAgICAgdmFyIGxhc3RNYXRjaCA9IG1hdGNoZXNTdHJpY3RbLS1tYXRjaGVzU3RyaWN0TGVuXVxyXG4gICAgICAgIHRhcmdldEkgPSBuZXh0QmVnaW5uaW5nSW5kZXhlc1tsYXN0TWF0Y2hdXHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBpc01hdGNoID0gc2VhcmNoTG93ZXJDb2Rlc1tzZWFyY2hJXSA9PT0gdGFyZ2V0TG93ZXJDb2Rlc1t0YXJnZXRJXVxyXG4gICAgICAgIGlmKGlzTWF0Y2gpIHtcclxuICAgICAgICAgIG1hdGNoZXNTdHJpY3RbbWF0Y2hlc1N0cmljdExlbisrXSA9IHRhcmdldElcclxuICAgICAgICAgICsrc2VhcmNoSTsgaWYoc2VhcmNoSSA9PT0gc2VhcmNoTGVuKSB7IHN1Y2Nlc3NTdHJpY3QgPSB0cnVlOyBicmVhayB9XHJcbiAgICAgICAgICArK3RhcmdldElcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGFyZ2V0SSA9IG5leHRCZWdpbm5pbmdJbmRleGVzW3RhcmdldEldXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgaXQncyBhIHN1YnN0cmluZyBtYXRjaFxyXG4gICAgdmFyIHN1YnN0cmluZ0luZGV4ID0gc2VhcmNoTGVuIDw9IDEgPyAtMSA6IHByZXBhcmVkLl90YXJnZXRMb3dlci5pbmRleE9mKHNlYXJjaExvd2VyLCBtYXRjaGVzU2ltcGxlWzBdKSAvLyBwZXJmOiB0aGlzIGlzIHNsb3dcclxuICAgIHZhciBpc1N1YnN0cmluZyA9ICEhfnN1YnN0cmluZ0luZGV4XHJcbiAgICB2YXIgaXNTdWJzdHJpbmdCZWdpbm5pbmcgPSAhaXNTdWJzdHJpbmcgPyBmYWxzZSA6IHN1YnN0cmluZ0luZGV4PT09MCB8fCBwcmVwYXJlZC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNbc3Vic3RyaW5nSW5kZXgtMV0gPT09IHN1YnN0cmluZ0luZGV4XHJcblxyXG4gICAgLy8gaWYgaXQncyBhIHN1YnN0cmluZyBtYXRjaCBidXQgbm90IGF0IGEgYmVnaW5uaW5nIGluZGV4LCBsZXQncyB0cnkgdG8gZmluZCBhIHN1YnN0cmluZyBzdGFydGluZyBhdCBhIGJlZ2lubmluZyBpbmRleCBmb3IgYSBiZXR0ZXIgc2NvcmVcclxuICAgIGlmKGlzU3Vic3RyaW5nICYmICFpc1N1YnN0cmluZ0JlZ2lubmluZykge1xyXG4gICAgICBmb3IodmFyIGk9MDsgaTxuZXh0QmVnaW5uaW5nSW5kZXhlcy5sZW5ndGg7IGk9bmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0pIHtcclxuICAgICAgICBpZihpIDw9IHN1YnN0cmluZ0luZGV4KSBjb250aW51ZVxyXG5cclxuICAgICAgICBmb3IodmFyIHM9MDsgczxzZWFyY2hMZW47IHMrKykgaWYoc2VhcmNoTG93ZXJDb2Rlc1tzXSAhPT0gcHJlcGFyZWQuX3RhcmdldExvd2VyQ29kZXNbaStzXSkgYnJlYWtcclxuICAgICAgICBpZihzID09PSBzZWFyY2hMZW4pIHsgc3Vic3RyaW5nSW5kZXggPSBpOyBpc1N1YnN0cmluZ0JlZ2lubmluZyA9IHRydWU7IGJyZWFrIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHRhbGx5IHVwIHRoZSBzY29yZSAmIGtlZXAgdHJhY2sgb2YgbWF0Y2hlcyBmb3IgaGlnaGxpZ2h0aW5nIGxhdGVyXHJcbiAgICAvLyBpZiBpdCdzIGEgc2ltcGxlIG1hdGNoLCB3ZSdsbCBzd2l0Y2ggdG8gYSBzdWJzdHJpbmcgbWF0Y2ggaWYgYSBzdWJzdHJpbmcgZXhpc3RzXHJcbiAgICAvLyBpZiBpdCdzIGEgc3RyaWN0IG1hdGNoLCB3ZSdsbCBzd2l0Y2ggdG8gYSBzdWJzdHJpbmcgbWF0Y2ggb25seSBpZiB0aGF0J3MgYSBiZXR0ZXIgc2NvcmVcclxuXHJcbiAgICB2YXIgY2FsY3VsYXRlU2NvcmUgPSBtYXRjaGVzID0+IHtcclxuICAgICAgdmFyIHNjb3JlID0gMFxyXG5cclxuICAgICAgdmFyIGV4dHJhTWF0Y2hHcm91cENvdW50ID0gMFxyXG4gICAgICBmb3IodmFyIGkgPSAxOyBpIDwgc2VhcmNoTGVuOyArK2kpIHtcclxuICAgICAgICBpZihtYXRjaGVzW2ldIC0gbWF0Y2hlc1tpLTFdICE9PSAxKSB7c2NvcmUgLT0gbWF0Y2hlc1tpXTsgKytleHRyYU1hdGNoR3JvdXBDb3VudH1cclxuICAgICAgfVxyXG4gICAgICB2YXIgdW5tYXRjaGVkRGlzdGFuY2UgPSBtYXRjaGVzW3NlYXJjaExlbi0xXSAtIG1hdGNoZXNbMF0gLSAoc2VhcmNoTGVuLTEpXHJcblxyXG4gICAgICBzY29yZSAtPSAoMTIrdW5tYXRjaGVkRGlzdGFuY2UpICogZXh0cmFNYXRjaEdyb3VwQ291bnQgLy8gcGVuYWxpdHkgZm9yIG1vcmUgZ3JvdXBzXHJcblxyXG4gICAgICBpZihtYXRjaGVzWzBdICE9PSAwKSBzY29yZSAtPSBtYXRjaGVzWzBdKm1hdGNoZXNbMF0qLjIgLy8gcGVuYWxpdHkgZm9yIG5vdCBzdGFydGluZyBuZWFyIHRoZSBiZWdpbm5pbmdcclxuXHJcbiAgICAgIGlmKCFzdWNjZXNzU3RyaWN0KSB7XHJcbiAgICAgICAgc2NvcmUgKj0gMTAwMFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIHN1Y2Nlc3NTdHJpY3Qgb24gYSB0YXJnZXQgd2l0aCB0b28gbWFueSBiZWdpbm5pbmcgaW5kZXhlcyBsb3NlcyBwb2ludHMgZm9yIGJlaW5nIGEgYmFkIHRhcmdldFxyXG4gICAgICAgIHZhciB1bmlxdWVCZWdpbm5pbmdJbmRleGVzID0gMVxyXG4gICAgICAgIGZvcih2YXIgaSA9IG5leHRCZWdpbm5pbmdJbmRleGVzWzBdOyBpIDwgdGFyZ2V0TGVuOyBpPW5leHRCZWdpbm5pbmdJbmRleGVzW2ldKSArK3VuaXF1ZUJlZ2lubmluZ0luZGV4ZXNcclxuXHJcbiAgICAgICAgaWYodW5pcXVlQmVnaW5uaW5nSW5kZXhlcyA+IDI0KSBzY29yZSAqPSAodW5pcXVlQmVnaW5uaW5nSW5kZXhlcy0yNCkqMTAgLy8gcXVpdGUgYXJiaXRyYXJ5IG51bWJlcnMgaGVyZSAuLi5cclxuICAgICAgfVxyXG5cclxuICAgICAgc2NvcmUgLT0gKHRhcmdldExlbiAtIHNlYXJjaExlbikvMiAvLyBwZW5hbGl0eSBmb3IgbG9uZ2VyIHRhcmdldHNcclxuXHJcbiAgICAgIGlmKGlzU3Vic3RyaW5nKSAgICAgICAgICBzY29yZSAvPSAxK3NlYXJjaExlbipzZWFyY2hMZW4qMSAvLyBib251cyBmb3IgYmVpbmcgYSBmdWxsIHN1YnN0cmluZ1xyXG4gICAgICBpZihpc1N1YnN0cmluZ0JlZ2lubmluZykgc2NvcmUgLz0gMStzZWFyY2hMZW4qc2VhcmNoTGVuKjEgLy8gYm9udXMgZm9yIHN1YnN0cmluZyBzdGFydGluZyBvbiBhIGJlZ2lubmluZ0luZGV4XHJcblxyXG4gICAgICBzY29yZSAtPSAodGFyZ2V0TGVuIC0gc2VhcmNoTGVuKS8yIC8vIHBlbmFsaXR5IGZvciBsb25nZXIgdGFyZ2V0c1xyXG5cclxuICAgICAgcmV0dXJuIHNjb3JlXHJcbiAgICB9XHJcblxyXG4gICAgaWYoIXN1Y2Nlc3NTdHJpY3QpIHtcclxuICAgICAgaWYoaXNTdWJzdHJpbmcpIGZvcih2YXIgaT0wOyBpPHNlYXJjaExlbjsgKytpKSBtYXRjaGVzU2ltcGxlW2ldID0gc3Vic3RyaW5nSW5kZXgraSAvLyBhdCB0aGlzIHBvaW50IGl0J3Mgc2FmZSB0byBvdmVyd3JpdGUgbWF0Y2hlaHNTaW1wbGUgd2l0aCBzdWJzdHIgbWF0Y2hlc1xyXG4gICAgICB2YXIgbWF0Y2hlc0Jlc3QgPSBtYXRjaGVzU2ltcGxlXHJcbiAgICAgIHZhciBzY29yZSA9IGNhbGN1bGF0ZVNjb3JlKG1hdGNoZXNCZXN0KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYoaXNTdWJzdHJpbmdCZWdpbm5pbmcpIHtcclxuICAgICAgICBmb3IodmFyIGk9MDsgaTxzZWFyY2hMZW47ICsraSkgbWF0Y2hlc1NpbXBsZVtpXSA9IHN1YnN0cmluZ0luZGV4K2kgLy8gYXQgdGhpcyBwb2ludCBpdCdzIHNhZmUgdG8gb3ZlcndyaXRlIG1hdGNoZWhzU2ltcGxlIHdpdGggc3Vic3RyIG1hdGNoZXNcclxuICAgICAgICB2YXIgbWF0Y2hlc0Jlc3QgPSBtYXRjaGVzU2ltcGxlXHJcbiAgICAgICAgdmFyIHNjb3JlID0gY2FsY3VsYXRlU2NvcmUobWF0Y2hlc1NpbXBsZSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgbWF0Y2hlc0Jlc3QgPSBtYXRjaGVzU3RyaWN0XHJcbiAgICAgICAgdmFyIHNjb3JlID0gY2FsY3VsYXRlU2NvcmUobWF0Y2hlc1N0cmljdClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByZXBhcmVkLl9zY29yZSA9IHNjb3JlXHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHNlYXJjaExlbjsgKytpKSBwcmVwYXJlZC5faW5kZXhlc1tpXSA9IG1hdGNoZXNCZXN0W2ldXHJcbiAgICBwcmVwYXJlZC5faW5kZXhlcy5sZW4gPSBzZWFyY2hMZW5cclxuXHJcbiAgICBjb25zdCByZXN1bHQgICAgPSBuZXcgUmVzdWx0KClcclxuICAgIHJlc3VsdC50YXJnZXQgICA9IHByZXBhcmVkLnRhcmdldFxyXG4gICAgcmVzdWx0Ll9zY29yZSAgID0gcHJlcGFyZWQuX3Njb3JlXHJcbiAgICByZXN1bHQuX2luZGV4ZXMgPSBwcmVwYXJlZC5faW5kZXhlc1xyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG4gIH1cclxuICB2YXIgYWxnb3JpdGhtU3BhY2VzID0gKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQsIGFsbG93UGFydGlhbE1hdGNoKSA9PiB7XHJcbiAgICB2YXIgc2Vlbl9pbmRleGVzID0gbmV3IFNldCgpXHJcbiAgICB2YXIgc2NvcmUgPSAwXHJcbiAgICB2YXIgcmVzdWx0ID0gTlVMTFxyXG5cclxuICAgIHZhciBmaXJzdF9zZWVuX2luZGV4X2xhc3Rfc2VhcmNoID0gMFxyXG4gICAgdmFyIHNlYXJjaGVzID0gcHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlc1xyXG4gICAgdmFyIHNlYXJjaGVzTGVuID0gc2VhcmNoZXMubGVuZ3RoXHJcbiAgICB2YXIgY2hhbmdlc2xlbiA9IDBcclxuXHJcbiAgICAvLyBSZXR1cm4gX25leHRCZWdpbm5pbmdJbmRleGVzIGJhY2sgdG8gaXRzIG5vcm1hbCBzdGF0ZVxyXG4gICAgdmFyIHJlc2V0TmV4dEJlZ2lubmluZ0luZGV4ZXMgPSAoKSA9PiB7XHJcbiAgICAgIGZvcihsZXQgaT1jaGFuZ2VzbGVuLTE7IGk+PTA7IGktLSkgdGFyZ2V0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlc1tuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXNbaSoyICsgMF1dID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzW2kqMiArIDFdXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhhc0F0TGVhc3QxTWF0Y2ggPSBmYWxzZVxyXG4gICAgZm9yKHZhciBpPTA7IGk8c2VhcmNoZXNMZW47ICsraSkge1xyXG4gICAgICBhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgIHZhciBzZWFyY2ggPSBzZWFyY2hlc1tpXVxyXG5cclxuICAgICAgcmVzdWx0ID0gYWxnb3JpdGhtKHNlYXJjaCwgdGFyZ2V0KVxyXG4gICAgICBpZihhbGxvd1BhcnRpYWxNYXRjaCkge1xyXG4gICAgICAgIGlmKHJlc3VsdCA9PT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBoYXNBdExlYXN0MU1hdGNoID0gdHJ1ZVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmKHJlc3VsdCA9PT0gTlVMTCkge3Jlc2V0TmV4dEJlZ2lubmluZ0luZGV4ZXMoKTsgcmV0dXJuIE5VTEx9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGlmIG5vdCB0aGUgbGFzdCBzZWFyY2gsIHdlIG5lZWQgdG8gbXV0YXRlIF9uZXh0QmVnaW5uaW5nSW5kZXhlcyBmb3IgdGhlIG5leHQgc2VhcmNoXHJcbiAgICAgIHZhciBpc1RoZUxhc3RTZWFyY2ggPSBpID09PSBzZWFyY2hlc0xlbiAtIDFcclxuICAgICAgaWYoIWlzVGhlTGFzdFNlYXJjaCkge1xyXG4gICAgICAgIHZhciBpbmRleGVzID0gcmVzdWx0Ll9pbmRleGVzXHJcblxyXG4gICAgICAgIHZhciBpbmRleGVzSXNDb25zZWN1dGl2ZVN1YnN0cmluZyA9IHRydWVcclxuICAgICAgICBmb3IobGV0IGk9MDsgaTxpbmRleGVzLmxlbi0xOyBpKyspIHtcclxuICAgICAgICAgIGlmKGluZGV4ZXNbaSsxXSAtIGluZGV4ZXNbaV0gIT09IDEpIHtcclxuICAgICAgICAgICAgaW5kZXhlc0lzQ29uc2VjdXRpdmVTdWJzdHJpbmcgPSBmYWxzZTsgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihpbmRleGVzSXNDb25zZWN1dGl2ZVN1YnN0cmluZykge1xyXG4gICAgICAgICAgdmFyIG5ld0JlZ2lubmluZ0luZGV4ID0gaW5kZXhlc1tpbmRleGVzLmxlbi0xXSArIDFcclxuICAgICAgICAgIHZhciB0b1JlcGxhY2UgPSB0YXJnZXQuX25leHRCZWdpbm5pbmdJbmRleGVzW25ld0JlZ2lubmluZ0luZGV4LTFdXHJcbiAgICAgICAgICBmb3IobGV0IGk9bmV3QmVnaW5uaW5nSW5kZXgtMTsgaT49MDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGlmKHRvUmVwbGFjZSAhPT0gdGFyZ2V0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSkgYnJlYWtcclxuICAgICAgICAgICAgdGFyZ2V0Ll9uZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSA9IG5ld0JlZ2lubmluZ0luZGV4XHJcbiAgICAgICAgICAgIG5leHRCZWdpbm5pbmdJbmRleGVzQ2hhbmdlc1tjaGFuZ2VzbGVuKjIgKyAwXSA9IGlcclxuICAgICAgICAgICAgbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzW2NoYW5nZXNsZW4qMiArIDFdID0gdG9SZXBsYWNlXHJcbiAgICAgICAgICAgIGNoYW5nZXNsZW4rK1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgc2NvcmUgKz0gcmVzdWx0Ll9zY29yZSAvIHNlYXJjaGVzTGVuXHJcbiAgICAgIGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldID0gcmVzdWx0Ll9zY29yZSAvIHNlYXJjaGVzTGVuXHJcblxyXG4gICAgICAvLyBkb2NrIHBvaW50cyBiYXNlZCBvbiBvcmRlciBvdGhlcndpc2UgXCJjIG1hblwiIHJldHVybnMgTWFuaWZlc3QuY3BwIGluc3RlYWQgb2YgQ2hlYXRNYW5hZ2VyLmhcclxuICAgICAgaWYocmVzdWx0Ll9pbmRleGVzWzBdIDwgZmlyc3Rfc2Vlbl9pbmRleF9sYXN0X3NlYXJjaCkge1xyXG4gICAgICAgIHNjb3JlIC09IChmaXJzdF9zZWVuX2luZGV4X2xhc3Rfc2VhcmNoIC0gcmVzdWx0Ll9pbmRleGVzWzBdKSAqIDJcclxuICAgICAgfVxyXG4gICAgICBmaXJzdF9zZWVuX2luZGV4X2xhc3Rfc2VhcmNoID0gcmVzdWx0Ll9pbmRleGVzWzBdXHJcblxyXG4gICAgICBmb3IodmFyIGo9MDsgajxyZXN1bHQuX2luZGV4ZXMubGVuOyArK2opIHNlZW5faW5kZXhlcy5hZGQocmVzdWx0Ll9pbmRleGVzW2pdKVxyXG4gICAgfVxyXG5cclxuICAgIGlmKGFsbG93UGFydGlhbE1hdGNoICYmICFoYXNBdExlYXN0MU1hdGNoKSByZXR1cm4gTlVMTFxyXG5cclxuICAgIHJlc2V0TmV4dEJlZ2lubmluZ0luZGV4ZXMoKVxyXG5cclxuICAgIC8vIGFsbG93cyBhIHNlYXJjaCB3aXRoIHNwYWNlcyB0aGF0J3MgYW4gZXhhY3Qgc3Vic3RyaW5nIHRvIHNjb3JlIHdlbGxcclxuICAgIHZhciBhbGxvd1NwYWNlc1Jlc3VsdCA9IGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0LCAvKmFsbG93U3BhY2VzPSovdHJ1ZSlcclxuICAgIGlmKGFsbG93U3BhY2VzUmVzdWx0ICE9PSBOVUxMICYmIGFsbG93U3BhY2VzUmVzdWx0Ll9zY29yZSA+IHNjb3JlKSB7XHJcbiAgICAgIGlmKGFsbG93UGFydGlhbE1hdGNoKSB7XHJcbiAgICAgICAgZm9yKHZhciBpPTA7IGk8c2VhcmNoZXNMZW47ICsraSkge1xyXG4gICAgICAgICAgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0gPSBhbGxvd1NwYWNlc1Jlc3VsdC5fc2NvcmUgLyBzZWFyY2hlc0xlblxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYWxsb3dTcGFjZXNSZXN1bHRcclxuICAgIH1cclxuXHJcbiAgICBpZihhbGxvd1BhcnRpYWxNYXRjaCkgcmVzdWx0ID0gdGFyZ2V0XHJcbiAgICByZXN1bHQuX3Njb3JlID0gc2NvcmVcclxuXHJcbiAgICB2YXIgaSA9IDBcclxuICAgIGZvciAobGV0IGluZGV4IG9mIHNlZW5faW5kZXhlcykgcmVzdWx0Ll9pbmRleGVzW2krK10gPSBpbmRleFxyXG4gICAgcmVzdWx0Ll9pbmRleGVzLmxlbiA9IGlcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbiAgfVxyXG5cclxuICAvLyB3ZSB1c2UgdGhpcyBpbnN0ZWFkIG9mIGp1c3QgLm5vcm1hbGl6ZSgnTkZEJykucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgJycpIGJlY2F1c2UgdGhhdCBzY3Jld3Mgd2l0aCBqYXBhbmVzZSBjaGFyYWN0ZXJzXHJcbiAgdmFyIHJlbW92ZV9hY2NlbnRzID0gKHN0cikgPT4gc3RyLnJlcGxhY2UoL1xccHtTY3JpcHQ9TGF0aW59Ky9ndSwgbWF0Y2ggPT4gbWF0Y2gubm9ybWFsaXplKCdORkQnKSkucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgJycpXHJcblxyXG4gIHZhciBwcmVwYXJlTG93ZXJJbmZvID0gKHN0cikgPT4ge1xyXG4gICAgc3RyID0gcmVtb3ZlX2FjY2VudHMoc3RyKVxyXG4gICAgdmFyIHN0ckxlbiA9IHN0ci5sZW5ndGhcclxuICAgIHZhciBsb3dlciA9IHN0ci50b0xvd2VyQ2FzZSgpXHJcbiAgICB2YXIgbG93ZXJDb2RlcyA9IFtdIC8vIG5ldyBBcnJheShzdHJMZW4pICAgIHNwYXJzZSBhcnJheSBpcyB0b28gc2xvd1xyXG4gICAgdmFyIGJpdGZsYWdzID0gMFxyXG4gICAgdmFyIGNvbnRhaW5zU3BhY2UgPSBmYWxzZSAvLyBzcGFjZSBpc24ndCBzdG9yZWQgaW4gYml0ZmxhZ3MgYmVjYXVzZSBvZiBob3cgc2VhcmNoaW5nIHdpdGggYSBzcGFjZSB3b3Jrc1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzdHJMZW47ICsraSkge1xyXG4gICAgICB2YXIgbG93ZXJDb2RlID0gbG93ZXJDb2Rlc1tpXSA9IGxvd2VyLmNoYXJDb2RlQXQoaSlcclxuXHJcbiAgICAgIGlmKGxvd2VyQ29kZSA9PT0gMzIpIHtcclxuICAgICAgICBjb250YWluc1NwYWNlID0gdHJ1ZVxyXG4gICAgICAgIGNvbnRpbnVlIC8vIGl0J3MgaW1wb3J0YW50IHRoYXQgd2UgZG9uJ3Qgc2V0IGFueSBiaXRmbGFncyBmb3Igc3BhY2VcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGJpdCA9IGxvd2VyQ29kZT49OTcmJmxvd2VyQ29kZTw9MTIyID8gbG93ZXJDb2RlLTk3IC8vIGFscGhhYmV0XHJcbiAgICAgICAgICAgICAgOiBsb3dlckNvZGU+PTQ4JiZsb3dlckNvZGU8PTU3ICA/IDI2ICAgICAgICAgICAvLyBudW1iZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAzIGJpdHMgYXZhaWxhYmxlXHJcbiAgICAgICAgICAgICAgOiBsb3dlckNvZGU8PTEyNyAgICAgICAgICAgICAgICA/IDMwICAgICAgICAgICAvLyBvdGhlciBhc2NpaVxyXG4gICAgICAgICAgICAgIDogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAzMSAgICAgICAgICAgLy8gb3RoZXIgdXRmOFxyXG4gICAgICBiaXRmbGFncyB8PSAxPDxiaXRcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge2xvd2VyQ29kZXM6bG93ZXJDb2RlcywgYml0ZmxhZ3M6Yml0ZmxhZ3MsIGNvbnRhaW5zU3BhY2U6Y29udGFpbnNTcGFjZSwgX2xvd2VyOmxvd2VyfVxyXG4gIH1cclxuICB2YXIgcHJlcGFyZUJlZ2lubmluZ0luZGV4ZXMgPSAodGFyZ2V0KSA9PiB7XHJcbiAgICB2YXIgdGFyZ2V0TGVuID0gdGFyZ2V0Lmxlbmd0aFxyXG4gICAgdmFyIGJlZ2lubmluZ0luZGV4ZXMgPSBbXTsgdmFyIGJlZ2lubmluZ0luZGV4ZXNMZW4gPSAwXHJcbiAgICB2YXIgd2FzVXBwZXIgPSBmYWxzZVxyXG4gICAgdmFyIHdhc0FscGhhbnVtID0gZmFsc2VcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRMZW47ICsraSkge1xyXG4gICAgICB2YXIgdGFyZ2V0Q29kZSA9IHRhcmdldC5jaGFyQ29kZUF0KGkpXHJcbiAgICAgIHZhciBpc1VwcGVyID0gdGFyZ2V0Q29kZT49NjUmJnRhcmdldENvZGU8PTkwXHJcbiAgICAgIHZhciBpc0FscGhhbnVtID0gaXNVcHBlciB8fCB0YXJnZXRDb2RlPj05NyYmdGFyZ2V0Q29kZTw9MTIyIHx8IHRhcmdldENvZGU+PTQ4JiZ0YXJnZXRDb2RlPD01N1xyXG4gICAgICB2YXIgaXNCZWdpbm5pbmcgPSBpc1VwcGVyICYmICF3YXNVcHBlciB8fCAhd2FzQWxwaGFudW0gfHwgIWlzQWxwaGFudW1cclxuICAgICAgd2FzVXBwZXIgPSBpc1VwcGVyXHJcbiAgICAgIHdhc0FscGhhbnVtID0gaXNBbHBoYW51bVxyXG4gICAgICBpZihpc0JlZ2lubmluZykgYmVnaW5uaW5nSW5kZXhlc1tiZWdpbm5pbmdJbmRleGVzTGVuKytdID0gaVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJlZ2lubmluZ0luZGV4ZXNcclxuICB9XHJcbiAgdmFyIHByZXBhcmVOZXh0QmVnaW5uaW5nSW5kZXhlcyA9ICh0YXJnZXQpID0+IHtcclxuICAgIHRhcmdldCA9IHJlbW92ZV9hY2NlbnRzKHRhcmdldClcclxuICAgIHZhciB0YXJnZXRMZW4gPSB0YXJnZXQubGVuZ3RoXHJcbiAgICB2YXIgYmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVCZWdpbm5pbmdJbmRleGVzKHRhcmdldClcclxuICAgIHZhciBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IFtdIC8vIG5ldyBBcnJheSh0YXJnZXRMZW4pICAgICBzcGFyc2UgYXJyYXkgaXMgdG9vIHNsb3dcclxuICAgIHZhciBsYXN0SXNCZWdpbm5pbmcgPSBiZWdpbm5pbmdJbmRleGVzWzBdXHJcbiAgICB2YXIgbGFzdElzQmVnaW5uaW5nSSA9IDBcclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0YXJnZXRMZW47ICsraSkge1xyXG4gICAgICBpZihsYXN0SXNCZWdpbm5pbmcgPiBpKSB7XHJcbiAgICAgICAgbmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0gPSBsYXN0SXNCZWdpbm5pbmdcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBsYXN0SXNCZWdpbm5pbmcgPSBiZWdpbm5pbmdJbmRleGVzWysrbGFzdElzQmVnaW5uaW5nSV1cclxuICAgICAgICBuZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSA9IGxhc3RJc0JlZ2lubmluZz09PXVuZGVmaW5lZCA/IHRhcmdldExlbiA6IGxhc3RJc0JlZ2lubmluZ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV4dEJlZ2lubmluZ0luZGV4ZXNcclxuICB9XHJcblxyXG4gIHZhciBwcmVwYXJlZENhY2hlICAgICAgID0gbmV3IE1hcCgpXHJcbiAgdmFyIHByZXBhcmVkU2VhcmNoQ2FjaGUgPSBuZXcgTWFwKClcclxuXHJcbiAgLy8gdGhlIHRoZW9yeSBiZWhpbmQgdGhlc2UgYmVpbmcgZ2xvYmFscyBpcyB0byByZWR1Y2UgZ2FyYmFnZSBjb2xsZWN0aW9uIGJ5IG5vdCBtYWtpbmcgbmV3IGFycmF5c1xyXG4gIHZhciBtYXRjaGVzU2ltcGxlID0gW107IHZhciBtYXRjaGVzU3RyaWN0ID0gW11cclxuICB2YXIgbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzID0gW10gLy8gYWxsb3dzIHN0cmF3IGJlcnJ5IHRvIG1hdGNoIHN0cmF3YmVycnkgd2VsbCwgYnkgbW9kaWZ5aW5nIHRoZSBlbmQgb2YgYSBzdWJzdHJpbmcgdG8gYmUgY29uc2lkZXJlZCBhIGJlZ2lubmluZyBpbmRleCBmb3IgdGhlIHJlc3Qgb2YgdGhlIHNlYXJjaFxyXG4gIHZhciBrZXlzU3BhY2VzQmVzdFNjb3JlcyA9IFtdOyB2YXIgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXMgPSBbXVxyXG4gIHZhciB0bXBUYXJnZXRzID0gW107IHZhciB0bXBSZXN1bHRzID0gW11cclxuXHJcbiAgLy8gcHJvcCA9ICdrZXknICAgICAgICAgICAgICAgICAgMi41bXMgb3B0aW1pemVkIGZvciB0aGlzIGNhc2UsIHNlZW1zIHRvIGJlIGFib3V0IGFzIGZhc3QgYXMgZGlyZWN0IG9ialtwcm9wXVxyXG4gIC8vIHByb3AgPSAna2V5MS5rZXkyJyAgICAgICAgICAgIDEwbXNcclxuICAvLyBwcm9wID0gWydrZXkxJywgJ2tleTInXSAgICAgICAyN21zXHJcbiAgLy8gcHJvcCA9IG9iaiA9PiBvYmoudGFncy5qb2luKCkgPz9tc1xyXG4gIHZhciBnZXRWYWx1ZSA9IChvYmosIHByb3ApID0+IHtcclxuICAgIHZhciB0bXAgPSBvYmpbcHJvcF07IGlmKHRtcCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdG1wXHJcbiAgICBpZih0eXBlb2YgcHJvcCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHByb3Aob2JqKSAvLyB0aGlzIHNob3VsZCBydW4gZmlyc3QuIGJ1dCB0aGF0IG1ha2VzIHN0cmluZyBwcm9wcyBzbG93ZXJcclxuICAgIHZhciBzZWdzID0gcHJvcFxyXG4gICAgaWYoIUFycmF5LmlzQXJyYXkocHJvcCkpIHNlZ3MgPSBwcm9wLnNwbGl0KCcuJylcclxuICAgIHZhciBsZW4gPSBzZWdzLmxlbmd0aFxyXG4gICAgdmFyIGkgPSAtMVxyXG4gICAgd2hpbGUgKG9iaiAmJiAoKytpIDwgbGVuKSkgb2JqID0gb2JqW3NlZ3NbaV1dXHJcbiAgICByZXR1cm4gb2JqXHJcbiAgfVxyXG5cclxuICB2YXIgaXNQcmVwYXJlZCA9ICh4KSA9PiB7IHJldHVybiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHguX2JpdGZsYWdzID09PSAnbnVtYmVyJyB9XHJcbiAgdmFyIElORklOSVRZID0gSW5maW5pdHk7IHZhciBORUdBVElWRV9JTkZJTklUWSA9IC1JTkZJTklUWVxyXG4gIHZhciBub1Jlc3VsdHMgPSBbXTsgbm9SZXN1bHRzLnRvdGFsID0gMFxyXG4gIHZhciBOVUxMID0gbnVsbFxyXG5cclxuICB2YXIgbm9UYXJnZXQgPSBwcmVwYXJlKCcnKVxyXG5cclxuICAvLyBIYWNrZWQgdmVyc2lvbiBvZiBodHRwczovL2dpdGh1Yi5jb20vbGVtaXJlL0Zhc3RQcmlvcml0eVF1ZXVlLmpzXHJcbiAgdmFyIGZhc3Rwcmlvcml0eXF1ZXVlPXI9Pnt2YXIgZT1bXSxvPTAsYT17fSx2PXI9Pntmb3IodmFyIGE9MCx2PWVbYV0sYz0xO2M8bzspe3ZhciBzPWMrMTthPWMsczxvJiZlW3NdLl9zY29yZTxlW2NdLl9zY29yZSYmKGE9cyksZVthLTE+PjFdPWVbYV0sYz0xKyhhPDwxKX1mb3IodmFyIGY9YS0xPj4xO2E+MCYmdi5fc2NvcmU8ZVtmXS5fc2NvcmU7Zj0oYT1mKS0xPj4xKWVbYV09ZVtmXTtlW2FdPXZ9O3JldHVybiBhLmFkZD0ocj0+e3ZhciBhPW87ZVtvKytdPXI7Zm9yKHZhciB2PWEtMT4+MTthPjAmJnIuX3Njb3JlPGVbdl0uX3Njb3JlO3Y9KGE9diktMT4+MSllW2FdPWVbdl07ZVthXT1yfSksYS5wb2xsPShyPT57aWYoMCE9PW8pe3ZhciBhPWVbMF07cmV0dXJuIGVbMF09ZVstLW9dLHYoKSxhfX0pLGEucGVlaz0ocj0+e2lmKDAhPT1vKXJldHVybiBlWzBdfSksYS5yZXBsYWNlVG9wPShyPT57ZVswXT1yLHYoKX0pLGF9XHJcbiAgdmFyIHEgPSBmYXN0cHJpb3JpdHlxdWV1ZSgpIC8vIHJldXNlIHRoaXNcclxuXHJcbiAgLy8gZnV6enlzb3J0IGlzIHdyaXR0ZW4gdGhpcyB3YXkgZm9yIG1pbmlmaWNhdGlvbi4gYWxsIG5hbWVzIGFyZSBtYW5nZWxlZCB1bmxlc3MgcXVvdGVkXHJcbiAgcmV0dXJuIHsnc2luZ2xlJzpzaW5nbGUsICdnbyc6Z28sICdwcmVwYXJlJzpwcmVwYXJlLCAnY2xlYW51cCc6Y2xlYW51cH1cclxufSkgLy8gVU1EXHJcbiIsICIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxNyBHb29nbGUgTExDXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQlNELTMtQ2xhdXNlXG4gKi9cblxuLy8gSU1QT1JUQU5UOiB0aGVzZSBpbXBvcnRzIG11c3QgYmUgdHlwZS1vbmx5XG5pbXBvcnQgdHlwZSB7RGlyZWN0aXZlLCBEaXJlY3RpdmVSZXN1bHQsIFBhcnRJbmZvfSBmcm9tICcuL2RpcmVjdGl2ZS5qcyc7XG5pbXBvcnQgdHlwZSB7VHJ1c3RlZEhUTUwsIFRydXN0ZWRUeXBlc1dpbmRvd30gZnJvbSAndHJ1c3RlZC10eXBlcy9saWInO1xuXG5jb25zdCBERVZfTU9ERSA9IHRydWU7XG5jb25zdCBFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MgPSB0cnVlO1xuY29uc3QgRU5BQkxFX1NIQURZRE9NX05PUEFUQ0ggPSB0cnVlO1xuY29uc3QgTk9ERV9NT0RFID0gZmFsc2U7XG5cbi8vIEFsbG93cyBtaW5pZmllcnMgdG8gcmVuYW1lIHJlZmVyZW5jZXMgdG8gZ2xvYmFsVGhpc1xuY29uc3QgZ2xvYmFsID0gZ2xvYmFsVGhpcztcblxuLyoqXG4gKiBDb250YWlucyB0eXBlcyB0aGF0IGFyZSBwYXJ0IG9mIHRoZSB1bnN0YWJsZSBkZWJ1ZyBBUEkuXG4gKlxuICogRXZlcnl0aGluZyBpbiB0aGlzIEFQSSBpcyBub3Qgc3RhYmxlIGFuZCBtYXkgY2hhbmdlIG9yIGJlIHJlbW92ZWQgaW4gdGhlIGZ1dHVyZSxcbiAqIGV2ZW4gb24gcGF0Y2ggcmVsZWFzZXMuXG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbmFtZXNwYWNlXG5leHBvcnQgbmFtZXNwYWNlIExpdFVuc3RhYmxlIHtcbiAgLyoqXG4gICAqIFdoZW4gTGl0IGlzIHJ1bm5pbmcgaW4gZGV2IG1vZGUgYW5kIGB3aW5kb3cuZW1pdExpdERlYnVnTG9nRXZlbnRzYCBpcyB0cnVlLFxuICAgKiB3ZSB3aWxsIGVtaXQgJ2xpdC1kZWJ1ZycgZXZlbnRzIHRvIHdpbmRvdywgd2l0aCBsaXZlIGRldGFpbHMgYWJvdXQgdGhlIHVwZGF0ZSBhbmQgcmVuZGVyXG4gICAqIGxpZmVjeWNsZS4gVGhlc2UgY2FuIGJlIHVzZWZ1bCBmb3Igd3JpdGluZyBkZWJ1ZyB0b29saW5nIGFuZCB2aXN1YWxpemF0aW9ucy5cbiAgICpcbiAgICogUGxlYXNlIGJlIGF3YXJlIHRoYXQgcnVubmluZyB3aXRoIHdpbmRvdy5lbWl0TGl0RGVidWdMb2dFdmVudHMgaGFzIHBlcmZvcm1hbmNlIG92ZXJoZWFkLFxuICAgKiBtYWtpbmcgY2VydGFpbiBvcGVyYXRpb25zIHRoYXQgYXJlIG5vcm1hbGx5IHZlcnkgY2hlYXAgKGxpa2UgYSBuby1vcCByZW5kZXIpIG11Y2ggc2xvd2VyLFxuICAgKiBiZWNhdXNlIHdlIG11c3QgY29weSBkYXRhIGFuZCBkaXNwYXRjaCBldmVudHMuXG4gICAqL1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5hbWVzcGFjZVxuICBleHBvcnQgbmFtZXNwYWNlIERlYnVnTG9nIHtcbiAgICBleHBvcnQgdHlwZSBFbnRyeSA9XG4gICAgICB8IFRlbXBsYXRlUHJlcFxuICAgICAgfCBUZW1wbGF0ZUluc3RhbnRpYXRlZFxuICAgICAgfCBUZW1wbGF0ZUluc3RhbnRpYXRlZEFuZFVwZGF0ZWRcbiAgICAgIHwgVGVtcGxhdGVVcGRhdGluZ1xuICAgICAgfCBCZWdpblJlbmRlclxuICAgICAgfCBFbmRSZW5kZXJcbiAgICAgIHwgQ29tbWl0UGFydEVudHJ5XG4gICAgICB8IFNldFBhcnRWYWx1ZTtcbiAgICBleHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlUHJlcCB7XG4gICAgICBraW5kOiAndGVtcGxhdGUgcHJlcCc7XG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGU7XG4gICAgICBzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheTtcbiAgICAgIGNsb25hYmxlVGVtcGxhdGU6IEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XG4gICAgICBwYXJ0czogVGVtcGxhdGVQYXJ0W107XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQmVnaW5SZW5kZXIge1xuICAgICAga2luZDogJ2JlZ2luIHJlbmRlcic7XG4gICAgICBpZDogbnVtYmVyO1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBjb250YWluZXI6IEhUTUxFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudDtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBwYXJ0OiBDaGlsZFBhcnQgfCB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgRW5kUmVuZGVyIHtcbiAgICAgIGtpbmQ6ICdlbmQgcmVuZGVyJztcbiAgICAgIGlkOiBudW1iZXI7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50O1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIHBhcnQ6IENoaWxkUGFydDtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZUluc3RhbnRpYXRlZCB7XG4gICAgICBraW5kOiAndGVtcGxhdGUgaW5zdGFudGlhdGVkJztcbiAgICAgIHRlbXBsYXRlOiBUZW1wbGF0ZSB8IENvbXBpbGVkVGVtcGxhdGU7XG4gICAgICBpbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZTtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBmcmFnbWVudDogTm9kZTtcbiAgICAgIHBhcnRzOiBBcnJheTxQYXJ0IHwgdW5kZWZpbmVkPjtcbiAgICAgIHZhbHVlczogdW5rbm93bltdO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlSW5zdGFudGlhdGVkQW5kVXBkYXRlZCB7XG4gICAgICBraW5kOiAndGVtcGxhdGUgaW5zdGFudGlhdGVkIGFuZCB1cGRhdGVkJztcbiAgICAgIHRlbXBsYXRlOiBUZW1wbGF0ZSB8IENvbXBpbGVkVGVtcGxhdGU7XG4gICAgICBpbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZTtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBmcmFnbWVudDogTm9kZTtcbiAgICAgIHBhcnRzOiBBcnJheTxQYXJ0IHwgdW5kZWZpbmVkPjtcbiAgICAgIHZhbHVlczogdW5rbm93bltdO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlVXBkYXRpbmcge1xuICAgICAga2luZDogJ3RlbXBsYXRlIHVwZGF0aW5nJztcbiAgICAgIHRlbXBsYXRlOiBUZW1wbGF0ZSB8IENvbXBpbGVkVGVtcGxhdGU7XG4gICAgICBpbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZTtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBwYXJ0czogQXJyYXk8UGFydCB8IHVuZGVmaW5lZD47XG4gICAgICB2YWx1ZXM6IHVua25vd25bXTtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBTZXRQYXJ0VmFsdWUge1xuICAgICAga2luZDogJ3NldCBwYXJ0JztcbiAgICAgIHBhcnQ6IFBhcnQ7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIHZhbHVlSW5kZXg6IG51bWJlcjtcbiAgICAgIHZhbHVlczogdW5rbm93bltdO1xuICAgICAgdGVtcGxhdGVJbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZTtcbiAgICB9XG5cbiAgICBleHBvcnQgdHlwZSBDb21taXRQYXJ0RW50cnkgPVxuICAgICAgfCBDb21taXROb3RoaW5nVG9DaGlsZEVudHJ5XG4gICAgICB8IENvbW1pdFRleHRcbiAgICAgIHwgQ29tbWl0Tm9kZVxuICAgICAgfCBDb21taXRBdHRyaWJ1dGVcbiAgICAgIHwgQ29tbWl0UHJvcGVydHlcbiAgICAgIHwgQ29tbWl0Qm9vbGVhbkF0dHJpYnV0ZVxuICAgICAgfCBDb21taXRFdmVudExpc3RlbmVyXG4gICAgICB8IENvbW1pdFRvRWxlbWVudEJpbmRpbmc7XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdE5vdGhpbmdUb0NoaWxkRW50cnkge1xuICAgICAga2luZDogJ2NvbW1pdCBub3RoaW5nIHRvIGNoaWxkJztcbiAgICAgIHN0YXJ0OiBDaGlsZE5vZGU7XG4gICAgICBlbmQ6IENoaWxkTm9kZSB8IG51bGw7XG4gICAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlIHwgdW5kZWZpbmVkO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdFRleHQge1xuICAgICAga2luZDogJ2NvbW1pdCB0ZXh0JztcbiAgICAgIG5vZGU6IFRleHQ7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXROb2RlIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgbm9kZSc7XG4gICAgICBzdGFydDogTm9kZTtcbiAgICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUgfCB1bmRlZmluZWQ7XG4gICAgICB2YWx1ZTogTm9kZTtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRBdHRyaWJ1dGUge1xuICAgICAga2luZDogJ2NvbW1pdCBhdHRyaWJ1dGUnO1xuICAgICAgZWxlbWVudDogRWxlbWVudDtcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdFByb3BlcnR5IHtcbiAgICAgIGtpbmQ6ICdjb21taXQgcHJvcGVydHknO1xuICAgICAgZWxlbWVudDogRWxlbWVudDtcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdEJvb2xlYW5BdHRyaWJ1dGUge1xuICAgICAga2luZDogJ2NvbW1pdCBib29sZWFuIGF0dHJpYnV0ZSc7XG4gICAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgdmFsdWU6IGJvb2xlYW47XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0RXZlbnRMaXN0ZW5lciB7XG4gICAgICBraW5kOiAnY29tbWl0IGV2ZW50IGxpc3RlbmVyJztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9sZExpc3RlbmVyOiB1bmtub3duO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIC8vIFRydWUgaWYgd2UncmUgcmVtb3ZpbmcgdGhlIG9sZCBldmVudCBsaXN0ZW5lciAoZS5nLiBiZWNhdXNlIHNldHRpbmdzIGNoYW5nZWQsIG9yIHZhbHVlIGlzIG5vdGhpbmcpXG4gICAgICByZW1vdmVMaXN0ZW5lcjogYm9vbGVhbjtcbiAgICAgIC8vIFRydWUgaWYgd2UncmUgYWRkaW5nIGEgbmV3IGV2ZW50IGxpc3RlbmVyIChlLmcuIGJlY2F1c2UgZmlyc3QgcmVuZGVyLCBvciBzZXR0aW5ncyBjaGFuZ2VkKVxuICAgICAgYWRkTGlzdGVuZXI6IGJvb2xlYW47XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRUb0VsZW1lbnRCaW5kaW5nIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgdG8gZWxlbWVudCBiaW5kaW5nJztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG5cbmludGVyZmFjZSBEZWJ1Z0xvZ2dpbmdXaW5kb3cge1xuICAvLyBFdmVuIGluIGRldiBtb2RlLCB3ZSBnZW5lcmFsbHkgZG9uJ3Qgd2FudCB0byBlbWl0IHRoZXNlIGV2ZW50cywgYXMgdGhhdCdzXG4gIC8vIGFub3RoZXIgbGV2ZWwgb2YgY29zdCwgc28gb25seSBlbWl0IHRoZW0gd2hlbiBERVZfTU9ERSBpcyB0cnVlIF9hbmRfIHdoZW5cbiAgLy8gd2luZG93LmVtaXRMaXREZWJ1Z0V2ZW50cyBpcyB0cnVlLlxuICBlbWl0TGl0RGVidWdMb2dFdmVudHM/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFVzZWZ1bCBmb3IgdmlzdWFsaXppbmcgYW5kIGxvZ2dpbmcgaW5zaWdodHMgaW50byB3aGF0IHRoZSBMaXQgdGVtcGxhdGUgc3lzdGVtIGlzIGRvaW5nLlxuICpcbiAqIENvbXBpbGVkIG91dCBvZiBwcm9kIG1vZGUgYnVpbGRzLlxuICovXG5jb25zdCBkZWJ1Z0xvZ0V2ZW50ID0gREVWX01PREVcbiAgPyAoZXZlbnQ6IExpdFVuc3RhYmxlLkRlYnVnTG9nLkVudHJ5KSA9PiB7XG4gICAgICBjb25zdCBzaG91bGRFbWl0ID0gKGdsb2JhbCBhcyB1bmtub3duIGFzIERlYnVnTG9nZ2luZ1dpbmRvdylcbiAgICAgICAgLmVtaXRMaXREZWJ1Z0xvZ0V2ZW50cztcbiAgICAgIGlmICghc2hvdWxkRW1pdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBnbG9iYWwuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50PExpdFVuc3RhYmxlLkRlYnVnTG9nLkVudHJ5PignbGl0LWRlYnVnJywge1xuICAgICAgICAgIGRldGFpbDogZXZlbnQsXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgOiB1bmRlZmluZWQ7XG4vLyBVc2VkIGZvciBjb25uZWN0aW5nIGJlZ2luUmVuZGVyIGFuZCBlbmRSZW5kZXIgZXZlbnRzIHdoZW4gdGhlcmUgYXJlIG5lc3RlZFxuLy8gcmVuZGVycyB3aGVuIGVycm9ycyBhcmUgdGhyb3duIHByZXZlbnRpbmcgYW4gZW5kUmVuZGVyIGV2ZW50IGZyb20gYmVpbmdcbi8vIGNhbGxlZC5cbmxldCBkZWJ1Z0xvZ1JlbmRlcklkID0gMDtcblxubGV0IGlzc3VlV2FybmluZzogKGNvZGU6IHN0cmluZywgd2FybmluZzogc3RyaW5nKSA9PiB2b2lkO1xuXG5pZiAoREVWX01PREUpIHtcbiAgZ2xvYmFsLmxpdElzc3VlZFdhcm5pbmdzID8/PSBuZXcgU2V0KCk7XG5cbiAgLy8gSXNzdWUgYSB3YXJuaW5nLCBpZiB3ZSBoYXZlbid0IGFscmVhZHkuXG4gIGlzc3VlV2FybmluZyA9IChjb2RlOiBzdHJpbmcsIHdhcm5pbmc6IHN0cmluZykgPT4ge1xuICAgIHdhcm5pbmcgKz0gY29kZVxuICAgICAgPyBgIFNlZSBodHRwczovL2xpdC5kZXYvbXNnLyR7Y29kZX0gZm9yIG1vcmUgaW5mb3JtYXRpb24uYFxuICAgICAgOiAnJztcbiAgICBpZiAoIWdsb2JhbC5saXRJc3N1ZWRXYXJuaW5ncyEuaGFzKHdhcm5pbmcpKSB7XG4gICAgICBjb25zb2xlLndhcm4od2FybmluZyk7XG4gICAgICBnbG9iYWwubGl0SXNzdWVkV2FybmluZ3MhLmFkZCh3YXJuaW5nKTtcbiAgICB9XG4gIH07XG5cbiAgaXNzdWVXYXJuaW5nKFxuICAgICdkZXYtbW9kZScsXG4gICAgYExpdCBpcyBpbiBkZXYgbW9kZS4gTm90IHJlY29tbWVuZGVkIGZvciBwcm9kdWN0aW9uIWBcbiAgKTtcbn1cblxuY29uc3Qgd3JhcCA9XG4gIEVOQUJMRV9TSEFEWURPTV9OT1BBVENIICYmXG4gIGdsb2JhbC5TaGFkeURPTT8uaW5Vc2UgJiZcbiAgZ2xvYmFsLlNoYWR5RE9NPy5ub1BhdGNoID09PSB0cnVlXG4gICAgPyAoZ2xvYmFsLlNoYWR5RE9NIS53cmFwIGFzIDxUIGV4dGVuZHMgTm9kZT4obm9kZTogVCkgPT4gVClcbiAgICA6IDxUIGV4dGVuZHMgTm9kZT4obm9kZTogVCkgPT4gbm9kZTtcblxuY29uc3QgdHJ1c3RlZFR5cGVzID0gKGdsb2JhbCBhcyB1bmtub3duIGFzIFRydXN0ZWRUeXBlc1dpbmRvdykudHJ1c3RlZFR5cGVzO1xuXG4vKipcbiAqIE91ciBUcnVzdGVkVHlwZVBvbGljeSBmb3IgSFRNTCB3aGljaCBpcyBkZWNsYXJlZCB1c2luZyB0aGUgaHRtbCB0ZW1wbGF0ZVxuICogdGFnIGZ1bmN0aW9uLlxuICpcbiAqIFRoYXQgSFRNTCBpcyBhIGRldmVsb3Blci1hdXRob3JlZCBjb25zdGFudCwgYW5kIGlzIHBhcnNlZCB3aXRoIGlubmVySFRNTFxuICogYmVmb3JlIGFueSB1bnRydXN0ZWQgZXhwcmVzc2lvbnMgaGF2ZSBiZWVuIG1peGVkIGluLiBUaGVyZWZvciBpdCBpc1xuICogY29uc2lkZXJlZCBzYWZlIGJ5IGNvbnN0cnVjdGlvbi5cbiAqL1xuY29uc3QgcG9saWN5ID0gdHJ1c3RlZFR5cGVzXG4gID8gdHJ1c3RlZFR5cGVzLmNyZWF0ZVBvbGljeSgnbGl0LWh0bWwnLCB7XG4gICAgICBjcmVhdGVIVE1MOiAocykgPT4gcyxcbiAgICB9KVxuICA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBVc2VkIHRvIHNhbml0aXplIGFueSB2YWx1ZSBiZWZvcmUgaXQgaXMgd3JpdHRlbiBpbnRvIHRoZSBET00uIFRoaXMgY2FuIGJlXG4gKiB1c2VkIHRvIGltcGxlbWVudCBhIHNlY3VyaXR5IHBvbGljeSBvZiBhbGxvd2VkIGFuZCBkaXNhbGxvd2VkIHZhbHVlcyBpblxuICogb3JkZXIgdG8gcHJldmVudCBYU1MgYXR0YWNrcy5cbiAqXG4gKiBPbmUgd2F5IG9mIHVzaW5nIHRoaXMgY2FsbGJhY2sgd291bGQgYmUgdG8gY2hlY2sgYXR0cmlidXRlcyBhbmQgcHJvcGVydGllc1xuICogYWdhaW5zdCBhIGxpc3Qgb2YgaGlnaCByaXNrIGZpZWxkcywgYW5kIHJlcXVpcmUgdGhhdCB2YWx1ZXMgd3JpdHRlbiB0byBzdWNoXG4gKiBmaWVsZHMgYmUgaW5zdGFuY2VzIG9mIGEgY2xhc3Mgd2hpY2ggaXMgc2FmZSBieSBjb25zdHJ1Y3Rpb24uIENsb3N1cmUncyBTYWZlXG4gKiBIVE1MIFR5cGVzIGlzIG9uZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIHRlY2huaXF1ZSAoXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3NhZmUtaHRtbC10eXBlcy9ibG9iL21hc3Rlci9kb2Mvc2FmZWh0bWwtdHlwZXMubWQpLlxuICogVGhlIFRydXN0ZWRUeXBlcyBwb2x5ZmlsbCBpbiBBUEktb25seSBtb2RlIGNvdWxkIGFsc28gYmUgdXNlZCBhcyBhIGJhc2lzXG4gKiBmb3IgdGhpcyB0ZWNobmlxdWUgKGh0dHBzOi8vZ2l0aHViLmNvbS9XSUNHL3RydXN0ZWQtdHlwZXMpLlxuICpcbiAqIEBwYXJhbSBub2RlIFRoZSBIVE1MIG5vZGUgKHVzdWFsbHkgZWl0aGVyIGEgI3RleHQgbm9kZSBvciBhbiBFbGVtZW50KSB0aGF0XG4gKiAgICAgaXMgYmVpbmcgd3JpdHRlbiB0by4gTm90ZSB0aGF0IHRoaXMgaXMganVzdCBhbiBleGVtcGxhciBub2RlLCB0aGUgd3JpdGVcbiAqICAgICBtYXkgdGFrZSBwbGFjZSBhZ2FpbnN0IGFub3RoZXIgaW5zdGFuY2Ugb2YgdGhlIHNhbWUgY2xhc3Mgb2Ygbm9kZS5cbiAqIEBwYXJhbSBuYW1lIFRoZSBuYW1lIG9mIGFuIGF0dHJpYnV0ZSBvciBwcm9wZXJ0eSAoZm9yIGV4YW1wbGUsICdocmVmJykuXG4gKiBAcGFyYW0gdHlwZSBJbmRpY2F0ZXMgd2hldGhlciB0aGUgd3JpdGUgdGhhdCdzIGFib3V0IHRvIGJlIHBlcmZvcm1lZCB3aWxsXG4gKiAgICAgYmUgdG8gYSBwcm9wZXJ0eSBvciBhIG5vZGUuXG4gKiBAcmV0dXJuIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHNhbml0aXplIHRoaXMgY2xhc3Mgb2Ygd3JpdGVzLlxuICovXG5leHBvcnQgdHlwZSBTYW5pdGl6ZXJGYWN0b3J5ID0gKFxuICBub2RlOiBOb2RlLFxuICBuYW1lOiBzdHJpbmcsXG4gIHR5cGU6ICdwcm9wZXJ0eScgfCAnYXR0cmlidXRlJ1xuKSA9PiBWYWx1ZVNhbml0aXplcjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHdoaWNoIGNhbiBzYW5pdGl6ZSB2YWx1ZXMgdGhhdCB3aWxsIGJlIHdyaXR0ZW4gdG8gYSBzcGVjaWZpYyBraW5kXG4gKiBvZiBET00gc2luay5cbiAqXG4gKiBTZWUgU2FuaXRpemVyRmFjdG9yeS5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHNhbml0aXplLiBXaWxsIGJlIHRoZSBhY3R1YWwgdmFsdWUgcGFzc2VkIGludG9cbiAqICAgICB0aGUgbGl0LWh0bWwgdGVtcGxhdGUgbGl0ZXJhbCwgc28gdGhpcyBjb3VsZCBiZSBvZiBhbnkgdHlwZS5cbiAqIEByZXR1cm4gVGhlIHZhbHVlIHRvIHdyaXRlIHRvIHRoZSBET00uIFVzdWFsbHkgdGhlIHNhbWUgYXMgdGhlIGlucHV0IHZhbHVlLFxuICogICAgIHVubGVzcyBzYW5pdGl6YXRpb24gaXMgbmVlZGVkLlxuICovXG5leHBvcnQgdHlwZSBWYWx1ZVNhbml0aXplciA9ICh2YWx1ZTogdW5rbm93bikgPT4gdW5rbm93bjtcblxuY29uc3QgaWRlbnRpdHlGdW5jdGlvbjogVmFsdWVTYW5pdGl6ZXIgPSAodmFsdWU6IHVua25vd24pID0+IHZhbHVlO1xuY29uc3Qgbm9vcFNhbml0aXplcjogU2FuaXRpemVyRmFjdG9yeSA9IChcbiAgX25vZGU6IE5vZGUsXG4gIF9uYW1lOiBzdHJpbmcsXG4gIF90eXBlOiAncHJvcGVydHknIHwgJ2F0dHJpYnV0ZSdcbikgPT4gaWRlbnRpdHlGdW5jdGlvbjtcblxuLyoqIFNldHMgdGhlIGdsb2JhbCBzYW5pdGl6ZXIgZmFjdG9yeS4gKi9cbmNvbnN0IHNldFNhbml0aXplciA9IChuZXdTYW5pdGl6ZXI6IFNhbml0aXplckZhY3RvcnkpID0+IHtcbiAgaWYgKCFFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHNhbml0aXplckZhY3RvcnlJbnRlcm5hbCAhPT0gbm9vcFNhbml0aXplcikge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBBdHRlbXB0ZWQgdG8gb3ZlcndyaXRlIGV4aXN0aW5nIGxpdC1odG1sIHNlY3VyaXR5IHBvbGljeS5gICtcbiAgICAgICAgYCBzZXRTYW5pdGl6ZURPTVZhbHVlRmFjdG9yeSBzaG91bGQgYmUgY2FsbGVkIGF0IG1vc3Qgb25jZS5gXG4gICAgKTtcbiAgfVxuICBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwgPSBuZXdTYW5pdGl6ZXI7XG59O1xuXG4vKipcbiAqIE9ubHkgdXNlZCBpbiBpbnRlcm5hbCB0ZXN0cywgbm90IGEgcGFydCBvZiB0aGUgcHVibGljIEFQSS5cbiAqL1xuY29uc3QgX3Rlc3RPbmx5Q2xlYXJTYW5pdGl6ZXJGYWN0b3J5RG9Ob3RDYWxsT3JFbHNlID0gKCkgPT4ge1xuICBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwgPSBub29wU2FuaXRpemVyO1xufTtcblxuY29uc3QgY3JlYXRlU2FuaXRpemVyOiBTYW5pdGl6ZXJGYWN0b3J5ID0gKG5vZGUsIG5hbWUsIHR5cGUpID0+IHtcbiAgcmV0dXJuIHNhbml0aXplckZhY3RvcnlJbnRlcm5hbChub2RlLCBuYW1lLCB0eXBlKTtcbn07XG5cbi8vIEFkZGVkIHRvIGFuIGF0dHJpYnV0ZSBuYW1lIHRvIG1hcmsgdGhlIGF0dHJpYnV0ZSBhcyBib3VuZCBzbyB3ZSBjYW4gZmluZFxuLy8gaXQgZWFzaWx5LlxuY29uc3QgYm91bmRBdHRyaWJ1dGVTdWZmaXggPSAnJGxpdCQnO1xuXG4vLyBUaGlzIG1hcmtlciBpcyB1c2VkIGluIG1hbnkgc3ludGFjdGljIHBvc2l0aW9ucyBpbiBIVE1MLCBzbyBpdCBtdXN0IGJlXG4vLyBhIHZhbGlkIGVsZW1lbnQgbmFtZSBhbmQgYXR0cmlidXRlIG5hbWUuIFdlIGRvbid0IHN1cHBvcnQgZHluYW1pYyBuYW1lcyAoeWV0KVxuLy8gYnV0IHRoaXMgYXQgbGVhc3QgZW5zdXJlcyB0aGF0IHRoZSBwYXJzZSB0cmVlIGlzIGNsb3NlciB0byB0aGUgdGVtcGxhdGVcbi8vIGludGVudGlvbi5cbmNvbnN0IG1hcmtlciA9IGBsaXQkJHtNYXRoLnJhbmRvbSgpLnRvRml4ZWQoOSkuc2xpY2UoMil9JGA7XG5cbi8vIFN0cmluZyB1c2VkIHRvIHRlbGwgaWYgYSBjb21tZW50IGlzIGEgbWFya2VyIGNvbW1lbnRcbmNvbnN0IG1hcmtlck1hdGNoID0gJz8nICsgbWFya2VyO1xuXG4vLyBUZXh0IHVzZWQgdG8gaW5zZXJ0IGEgY29tbWVudCBtYXJrZXIgbm9kZS4gV2UgdXNlIHByb2Nlc3NpbmcgaW5zdHJ1Y3Rpb25cbi8vIHN5bnRheCBiZWNhdXNlIGl0J3Mgc2xpZ2h0bHkgc21hbGxlciwgYnV0IHBhcnNlcyBhcyBhIGNvbW1lbnQgbm9kZS5cbmNvbnN0IG5vZGVNYXJrZXIgPSBgPCR7bWFya2VyTWF0Y2h9PmA7XG5cbmNvbnN0IGQgPVxuICBOT0RFX01PREUgJiYgZ2xvYmFsLmRvY3VtZW50ID09PSB1bmRlZmluZWRcbiAgICA/ICh7XG4gICAgICAgIGNyZWF0ZVRyZWVXYWxrZXIoKSB7XG4gICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9LFxuICAgICAgfSBhcyB1bmtub3duIGFzIERvY3VtZW50KVxuICAgIDogZG9jdW1lbnQ7XG5cbi8vIENyZWF0ZXMgYSBkeW5hbWljIG1hcmtlci4gV2UgbmV2ZXIgaGF2ZSB0byBzZWFyY2ggZm9yIHRoZXNlIGluIHRoZSBET00uXG5jb25zdCBjcmVhdGVNYXJrZXIgPSAoKSA9PiBkLmNyZWF0ZUNvbW1lbnQoJycpO1xuXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10eXBlb2Ytb3BlcmF0b3JcbnR5cGUgUHJpbWl0aXZlID0gbnVsbCB8IHVuZGVmaW5lZCB8IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmcgfCBzeW1ib2wgfCBiaWdpbnQ7XG5jb25zdCBpc1ByaW1pdGl2ZSA9ICh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFByaW1pdGl2ZSA9PlxuICB2YWx1ZSA9PT0gbnVsbCB8fCAodHlwZW9mIHZhbHVlICE9ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZSAhPSAnZnVuY3Rpb24nKTtcbmNvbnN0IGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuY29uc3QgaXNJdGVyYWJsZSA9ICh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIEl0ZXJhYmxlPHVua25vd24+ID0+XG4gIGlzQXJyYXkodmFsdWUpIHx8XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIHR5cGVvZiAodmFsdWUgYXMgYW55KT8uW1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbic7XG5cbmNvbnN0IFNQQUNFX0NIQVIgPSBgWyBcXHRcXG5cXGZcXHJdYDtcbmNvbnN0IEFUVFJfVkFMVUVfQ0hBUiA9IGBbXiBcXHRcXG5cXGZcXHJcIidcXGA8Pj1dYDtcbmNvbnN0IE5BTUVfQ0hBUiA9IGBbXlxcXFxzXCInPj0vXWA7XG5cbi8vIFRoZXNlIHJlZ2V4ZXMgcmVwcmVzZW50IHRoZSBmaXZlIHBhcnNpbmcgc3RhdGVzIHRoYXQgd2UgY2FyZSBhYm91dCBpbiB0aGVcbi8vIFRlbXBsYXRlJ3MgSFRNTCBzY2FubmVyLiBUaGV5IG1hdGNoIHRoZSAqZW5kKiBvZiB0aGUgc3RhdGUgdGhleSdyZSBuYW1lZFxuLy8gYWZ0ZXIuXG4vLyBEZXBlbmRpbmcgb24gdGhlIG1hdGNoLCB3ZSB0cmFuc2l0aW9uIHRvIGEgbmV3IHN0YXRlLiBJZiB0aGVyZSdzIG5vIG1hdGNoLFxuLy8gd2Ugc3RheSBpbiB0aGUgc2FtZSBzdGF0ZS5cbi8vIE5vdGUgdGhhdCB0aGUgcmVnZXhlcyBhcmUgc3RhdGVmdWwuIFdlIHV0aWxpemUgbGFzdEluZGV4IGFuZCBzeW5jIGl0XG4vLyBhY3Jvc3MgdGhlIG11bHRpcGxlIHJlZ2V4ZXMgdXNlZC4gSW4gYWRkaXRpb24gdG8gdGhlIGZpdmUgcmVnZXhlcyBiZWxvd1xuLy8gd2UgYWxzbyBkeW5hbWljYWxseSBjcmVhdGUgYSByZWdleCB0byBmaW5kIHRoZSBtYXRjaGluZyBlbmQgdGFncyBmb3IgcmF3XG4vLyB0ZXh0IGVsZW1lbnRzLlxuXG4vKipcbiAqIEVuZCBvZiB0ZXh0IGlzOiBgPGAgZm9sbG93ZWQgYnk6XG4gKiAgIChjb21tZW50IHN0YXJ0KSBvciAodGFnKSBvciAoZHluYW1pYyB0YWcgYmluZGluZylcbiAqL1xuY29uc3QgdGV4dEVuZFJlZ2V4ID0gLzwoPzooIS0tfFxcL1teYS16QS1aXSl8KFxcLz9bYS16QS1aXVtePlxcc10qKXwoXFwvPyQpKS9nO1xuY29uc3QgQ09NTUVOVF9TVEFSVCA9IDE7XG5jb25zdCBUQUdfTkFNRSA9IDI7XG5jb25zdCBEWU5BTUlDX1RBR19OQU1FID0gMztcblxuY29uc3QgY29tbWVudEVuZFJlZ2V4ID0gLy0tPi9nO1xuLyoqXG4gKiBDb21tZW50cyBub3Qgc3RhcnRlZCB3aXRoIDwhLS0sIGxpa2UgPC97LCBjYW4gYmUgZW5kZWQgYnkgYSBzaW5nbGUgYD5gXG4gKi9cbmNvbnN0IGNvbW1lbnQyRW5kUmVnZXggPSAvPi9nO1xuXG4vKipcbiAqIFRoZSB0YWdFbmQgcmVnZXggbWF0Y2hlcyB0aGUgZW5kIG9mIHRoZSBcImluc2lkZSBhbiBvcGVuaW5nXCIgdGFnIHN5bnRheFxuICogcG9zaXRpb24uIEl0IGVpdGhlciBtYXRjaGVzIGEgYD5gLCBhbiBhdHRyaWJ1dGUtbGlrZSBzZXF1ZW5jZSwgb3IgdGhlIGVuZFxuICogb2YgdGhlIHN0cmluZyBhZnRlciBhIHNwYWNlIChhdHRyaWJ1dGUtbmFtZSBwb3NpdGlvbiBlbmRpbmcpLlxuICpcbiAqIFNlZSBhdHRyaWJ1dGVzIGluIHRoZSBIVE1MIHNwZWM6XG4gKiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvc3ludGF4Lmh0bWwjZWxlbWVudHMtYXR0cmlidXRlc1xuICpcbiAqIFwiIFxcdFxcblxcZlxcclwiIGFyZSBIVE1MIHNwYWNlIGNoYXJhY3RlcnM6XG4gKiBodHRwczovL2luZnJhLnNwZWMud2hhdHdnLm9yZy8jYXNjaWktd2hpdGVzcGFjZVxuICpcbiAqIFNvIGFuIGF0dHJpYnV0ZSBpczpcbiAqICAqIFRoZSBuYW1lOiBhbnkgY2hhcmFjdGVyIGV4Y2VwdCBhIHdoaXRlc3BhY2UgY2hhcmFjdGVyLCAoXCIpLCAoJyksIFwiPlwiLFxuICogICAgXCI9XCIsIG9yIFwiL1wiLiBOb3RlOiB0aGlzIGlzIGRpZmZlcmVudCBmcm9tIHRoZSBIVE1MIHNwZWMgd2hpY2ggYWxzbyBleGNsdWRlcyBjb250cm9sIGNoYXJhY3RlcnMuXG4gKiAgKiBGb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVyc1xuICogICogRm9sbG93ZWQgYnkgXCI9XCJcbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieTpcbiAqICAgICogQW55IGNoYXJhY3RlciBleGNlcHQgc3BhY2UsICgnKSwgKFwiKSwgXCI8XCIsIFwiPlwiLCBcIj1cIiwgKGApLCBvclxuICogICAgKiAoXCIpIHRoZW4gYW55IG5vbi0oXCIpLCBvclxuICogICAgKiAoJykgdGhlbiBhbnkgbm9uLSgnKVxuICovXG5jb25zdCB0YWdFbmRSZWdleCA9IG5ldyBSZWdFeHAoXG4gIGA+fCR7U1BBQ0VfQ0hBUn0oPzooJHtOQU1FX0NIQVJ9KykoJHtTUEFDRV9DSEFSfSo9JHtTUEFDRV9DSEFSfSooPzoke0FUVFJfVkFMVUVfQ0hBUn18KFwifCcpfCkpfCQpYCxcbiAgJ2cnXG4pO1xuY29uc3QgRU5USVJFX01BVENIID0gMDtcbmNvbnN0IEFUVFJJQlVURV9OQU1FID0gMTtcbmNvbnN0IFNQQUNFU19BTkRfRVFVQUxTID0gMjtcbmNvbnN0IFFVT1RFX0NIQVIgPSAzO1xuXG5jb25zdCBzaW5nbGVRdW90ZUF0dHJFbmRSZWdleCA9IC8nL2c7XG5jb25zdCBkb3VibGVRdW90ZUF0dHJFbmRSZWdleCA9IC9cIi9nO1xuLyoqXG4gKiBNYXRjaGVzIHRoZSByYXcgdGV4dCBlbGVtZW50cy5cbiAqXG4gKiBDb21tZW50cyBhcmUgbm90IHBhcnNlZCB3aXRoaW4gcmF3IHRleHQgZWxlbWVudHMsIHNvIHdlIG5lZWQgdG8gc2VhcmNoIHRoZWlyXG4gKiB0ZXh0IGNvbnRlbnQgZm9yIG1hcmtlciBzdHJpbmdzLlxuICovXG5jb25zdCByYXdUZXh0RWxlbWVudCA9IC9eKD86c2NyaXB0fHN0eWxlfHRleHRhcmVhfHRpdGxlKSQvaTtcblxuLyoqIFRlbXBsYXRlUmVzdWx0IHR5cGVzICovXG5jb25zdCBIVE1MX1JFU1VMVCA9IDE7XG5jb25zdCBTVkdfUkVTVUxUID0gMjtcbmNvbnN0IE1BVEhNTF9SRVNVTFQgPSAzO1xuXG50eXBlIFJlc3VsdFR5cGUgPSB0eXBlb2YgSFRNTF9SRVNVTFQgfCB0eXBlb2YgU1ZHX1JFU1VMVCB8IHR5cGVvZiBNQVRITUxfUkVTVUxUO1xuXG4vLyBUZW1wbGF0ZVBhcnQgdHlwZXNcbi8vIElNUE9SVEFOVDogdGhlc2UgbXVzdCBtYXRjaCB0aGUgdmFsdWVzIGluIFBhcnRUeXBlXG5jb25zdCBBVFRSSUJVVEVfUEFSVCA9IDE7XG5jb25zdCBDSElMRF9QQVJUID0gMjtcbmNvbnN0IFBST1BFUlRZX1BBUlQgPSAzO1xuY29uc3QgQk9PTEVBTl9BVFRSSUJVVEVfUEFSVCA9IDQ7XG5jb25zdCBFVkVOVF9QQVJUID0gNTtcbmNvbnN0IEVMRU1FTlRfUEFSVCA9IDY7XG5jb25zdCBDT01NRU5UX1BBUlQgPSA3O1xuXG4vKipcbiAqIFRoZSByZXR1cm4gdHlwZSBvZiB0aGUgdGVtcGxhdGUgdGFnIGZ1bmN0aW9ucywge0BsaW5rY29kZSBodG1sfSBhbmRcbiAqIHtAbGlua2NvZGUgc3ZnfSB3aGVuIGl0IGhhc24ndCBiZWVuIGNvbXBpbGVkIGJ5IEBsaXQtbGFicy9jb21waWxlci5cbiAqXG4gKiBBIGBUZW1wbGF0ZVJlc3VsdGAgb2JqZWN0IGhvbGRzIGFsbCB0aGUgaW5mb3JtYXRpb24gYWJvdXQgYSB0ZW1wbGF0ZVxuICogZXhwcmVzc2lvbiByZXF1aXJlZCB0byByZW5kZXIgaXQ6IHRoZSB0ZW1wbGF0ZSBzdHJpbmdzLCBleHByZXNzaW9uIHZhbHVlcyxcbiAqIGFuZCB0eXBlIG9mIHRlbXBsYXRlIChodG1sIG9yIHN2ZykuXG4gKlxuICogYFRlbXBsYXRlUmVzdWx0YCBvYmplY3RzIGRvIG5vdCBjcmVhdGUgYW55IERPTSBvbiB0aGVpciBvd24uIFRvIGNyZWF0ZSBvclxuICogdXBkYXRlIERPTSB5b3UgbmVlZCB0byByZW5kZXIgdGhlIGBUZW1wbGF0ZVJlc3VsdGAuIFNlZVxuICogW1JlbmRlcmluZ10oaHR0cHM6Ly9saXQuZGV2L2RvY3MvY29tcG9uZW50cy9yZW5kZXJpbmcpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqL1xuZXhwb3J0IHR5cGUgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0PFQgZXh0ZW5kcyBSZXN1bHRUeXBlID0gUmVzdWx0VHlwZT4gPSB7XG4gIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gIFsnXyRsaXRUeXBlJCddOiBUO1xuICBzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheTtcbiAgdmFsdWVzOiB1bmtub3duW107XG59O1xuXG4vKipcbiAqIFRoaXMgaXMgYSB0ZW1wbGF0ZSByZXN1bHQgdGhhdCBtYXkgYmUgZWl0aGVyIHVuY29tcGlsZWQgb3IgY29tcGlsZWQuXG4gKlxuICogSW4gdGhlIGZ1dHVyZSwgVGVtcGxhdGVSZXN1bHQgd2lsbCBiZSB0aGlzIHR5cGUuIElmIHlvdSB3YW50IHRvIGV4cGxpY2l0bHlcbiAqIG5vdGUgdGhhdCBhIHRlbXBsYXRlIHJlc3VsdCBpcyBwb3RlbnRpYWxseSBjb21waWxlZCwgeW91IGNhbiByZWZlcmVuY2UgdGhpc1xuICogdHlwZSBhbmQgaXQgd2lsbCBjb250aW51ZSB0byBiZWhhdmUgdGhlIHNhbWUgdGhyb3VnaCB0aGUgbmV4dCBtYWpvciB2ZXJzaW9uXG4gKiBvZiBMaXQuIFRoaXMgY2FuIGJlIHVzZWZ1bCBmb3IgY29kZSB0aGF0IHdhbnRzIHRvIHByZXBhcmUgZm9yIHRoZSBuZXh0XG4gKiBtYWpvciB2ZXJzaW9uIG9mIExpdC5cbiAqL1xuZXhwb3J0IHR5cGUgTWF5YmVDb21waWxlZFRlbXBsYXRlUmVzdWx0PFQgZXh0ZW5kcyBSZXN1bHRUeXBlID0gUmVzdWx0VHlwZT4gPVxuICB8IFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUPlxuICB8IENvbXBpbGVkVGVtcGxhdGVSZXN1bHQ7XG5cbi8qKlxuICogVGhlIHJldHVybiB0eXBlIG9mIHRoZSB0ZW1wbGF0ZSB0YWcgZnVuY3Rpb25zLCB7QGxpbmtjb2RlIGh0bWx9IGFuZFxuICoge0BsaW5rY29kZSBzdmd9LlxuICpcbiAqIEEgYFRlbXBsYXRlUmVzdWx0YCBvYmplY3QgaG9sZHMgYWxsIHRoZSBpbmZvcm1hdGlvbiBhYm91dCBhIHRlbXBsYXRlXG4gKiBleHByZXNzaW9uIHJlcXVpcmVkIHRvIHJlbmRlciBpdDogdGhlIHRlbXBsYXRlIHN0cmluZ3MsIGV4cHJlc3Npb24gdmFsdWVzLFxuICogYW5kIHR5cGUgb2YgdGVtcGxhdGUgKGh0bWwgb3Igc3ZnKS5cbiAqXG4gKiBgVGVtcGxhdGVSZXN1bHRgIG9iamVjdHMgZG8gbm90IGNyZWF0ZSBhbnkgRE9NIG9uIHRoZWlyIG93bi4gVG8gY3JlYXRlIG9yXG4gKiB1cGRhdGUgRE9NIHlvdSBuZWVkIHRvIHJlbmRlciB0aGUgYFRlbXBsYXRlUmVzdWx0YC4gU2VlXG4gKiBbUmVuZGVyaW5nXShodHRwczovL2xpdC5kZXYvZG9jcy9jb21wb25lbnRzL3JlbmRlcmluZykgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogSW4gTGl0IDQsIHRoaXMgdHlwZSB3aWxsIGJlIGFuIGFsaWFzIG9mXG4gKiBNYXliZUNvbXBpbGVkVGVtcGxhdGVSZXN1bHQsIHNvIHRoYXQgY29kZSB3aWxsIGdldCB0eXBlIGVycm9ycyBpZiBpdCBhc3N1bWVzXG4gKiB0aGF0IExpdCB0ZW1wbGF0ZXMgYXJlIG5vdCBjb21waWxlZC4gV2hlbiBkZWxpYmVyYXRlbHkgd29ya2luZyB3aXRoIG9ubHlcbiAqIG9uZSwgdXNlIGVpdGhlciB7QGxpbmtjb2RlIENvbXBpbGVkVGVtcGxhdGVSZXN1bHR9IG9yXG4gKiB7QGxpbmtjb2RlIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdH0gZXhwbGljaXRseS5cbiAqL1xuZXhwb3J0IHR5cGUgVGVtcGxhdGVSZXN1bHQ8VCBleHRlbmRzIFJlc3VsdFR5cGUgPSBSZXN1bHRUeXBlPiA9XG4gIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUPjtcblxuZXhwb3J0IHR5cGUgSFRNTFRlbXBsYXRlUmVzdWx0ID0gVGVtcGxhdGVSZXN1bHQ8dHlwZW9mIEhUTUxfUkVTVUxUPjtcblxuZXhwb3J0IHR5cGUgU1ZHVGVtcGxhdGVSZXN1bHQgPSBUZW1wbGF0ZVJlc3VsdDx0eXBlb2YgU1ZHX1JFU1VMVD47XG5cbmV4cG9ydCB0eXBlIE1hdGhNTFRlbXBsYXRlUmVzdWx0ID0gVGVtcGxhdGVSZXN1bHQ8dHlwZW9mIE1BVEhNTF9SRVNVTFQ+O1xuXG4vKipcbiAqIEEgVGVtcGxhdGVSZXN1bHQgdGhhdCBoYXMgYmVlbiBjb21waWxlZCBieSBAbGl0LWxhYnMvY29tcGlsZXIsIHNraXBwaW5nIHRoZVxuICogcHJlcGFyZSBzdGVwLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVkVGVtcGxhdGVSZXN1bHQge1xuICAvLyBUaGlzIGlzIGEgZmFjdG9yeSBpbiBvcmRlciB0byBtYWtlIHRlbXBsYXRlIGluaXRpYWxpemF0aW9uIGxhenlcbiAgLy8gYW5kIGFsbG93IFNoYWR5UmVuZGVyT3B0aW9ucyBzY29wZSB0byBiZSBwYXNzZWQgaW4uXG4gIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gIFsnXyRsaXRUeXBlJCddOiBDb21waWxlZFRlbXBsYXRlO1xuICB2YWx1ZXM6IHVua25vd25bXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlZFRlbXBsYXRlIGV4dGVuZHMgT21pdDxUZW1wbGF0ZSwgJ2VsJz4ge1xuICAvLyBlbCBpcyBvdmVycmlkZGVuIHRvIGJlIG9wdGlvbmFsLiBXZSBpbml0aWFsaXplIGl0IG9uIGZpcnN0IHJlbmRlclxuICBlbD86IEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XG5cbiAgLy8gVGhlIHByZXBhcmVkIEhUTUwgc3RyaW5nIHRvIGNyZWF0ZSBhIHRlbXBsYXRlIGVsZW1lbnQgZnJvbS5cbiAgLy8gVGhlIHR5cGUgaXMgYSBUZW1wbGF0ZVN0cmluZ3NBcnJheSB0byBndWFyYW50ZWUgdGhhdCB0aGUgdmFsdWUgY2FtZSBmcm9tXG4gIC8vIHNvdXJjZSBjb2RlLCBwcmV2ZW50aW5nIGEgSlNPTiBpbmplY3Rpb24gYXR0YWNrLlxuICBoOiBUZW1wbGF0ZVN0cmluZ3NBcnJheTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSB0ZW1wbGF0ZSBsaXRlcmFsIHRhZyBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBUZW1wbGF0ZVJlc3VsdCB3aXRoXG4gKiB0aGUgZ2l2ZW4gcmVzdWx0IHR5cGUuXG4gKi9cbmNvbnN0IHRhZyA9XG4gIDxUIGV4dGVuZHMgUmVzdWx0VHlwZT4odHlwZTogVCkgPT5cbiAgKHN0cmluZ3M6IFRlbXBsYXRlU3RyaW5nc0FycmF5LCAuLi52YWx1ZXM6IHVua25vd25bXSk6IFRlbXBsYXRlUmVzdWx0PFQ+ID0+IHtcbiAgICAvLyBXYXJuIGFnYWluc3QgdGVtcGxhdGVzIG9jdGFsIGVzY2FwZSBzZXF1ZW5jZXNcbiAgICAvLyBXZSBkbyB0aGlzIGhlcmUgcmF0aGVyIHRoYW4gaW4gcmVuZGVyIHNvIHRoYXQgdGhlIHdhcm5pbmcgaXMgY2xvc2VyIHRvIHRoZVxuICAgIC8vIHRlbXBsYXRlIGRlZmluaXRpb24uXG4gICAgaWYgKERFVl9NT0RFICYmIHN0cmluZ3Muc29tZSgocykgPT4gcyA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAnU29tZSB0ZW1wbGF0ZSBzdHJpbmdzIGFyZSB1bmRlZmluZWQuXFxuJyArXG4gICAgICAgICAgJ1RoaXMgaXMgcHJvYmFibHkgY2F1c2VkIGJ5IGlsbGVnYWwgb2N0YWwgZXNjYXBlIHNlcXVlbmNlcy4nXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoREVWX01PREUpIHtcbiAgICAgIC8vIEltcG9ydCBzdGF0aWMtaHRtbC5qcyByZXN1bHRzIGluIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSB3aGljaCBnMyBkb2Vzbid0XG4gICAgICAvLyBoYW5kbGUuIEluc3RlYWQgd2Uga25vdyB0aGF0IHN0YXRpYyB2YWx1ZXMgbXVzdCBoYXZlIHRoZSBmaWVsZFxuICAgICAgLy8gYF8kbGl0U3RhdGljJGAuXG4gICAgICBpZiAoXG4gICAgICAgIHZhbHVlcy5zb21lKCh2YWwpID0+ICh2YWwgYXMge18kbGl0U3RhdGljJDogdW5rbm93bn0pPy5bJ18kbGl0U3RhdGljJCddKVxuICAgICAgKSB7XG4gICAgICAgIGlzc3VlV2FybmluZyhcbiAgICAgICAgICAnJyxcbiAgICAgICAgICBgU3RhdGljIHZhbHVlcyAnbGl0ZXJhbCcgb3IgJ3Vuc2FmZVN0YXRpYycgY2Fubm90IGJlIHVzZWQgYXMgdmFsdWVzIHRvIG5vbi1zdGF0aWMgdGVtcGxhdGVzLlxcbmAgK1xuICAgICAgICAgICAgYFBsZWFzZSB1c2UgdGhlIHN0YXRpYyAnaHRtbCcgdGFnIGZ1bmN0aW9uLiBTZWUgaHR0cHM6Ly9saXQuZGV2L2RvY3MvdGVtcGxhdGVzL2V4cHJlc3Npb25zLyNzdGF0aWMtZXhwcmVzc2lvbnNgXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgICAgWydfJGxpdFR5cGUkJ106IHR5cGUsXG4gICAgICBzdHJpbmdzLFxuICAgICAgdmFsdWVzLFxuICAgIH07XG4gIH07XG5cbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgYW4gSFRNTCB0ZW1wbGF0ZSB0aGF0IGNhbiBlZmZpY2llbnRseVxuICogcmVuZGVyIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IGhlYWRlciA9ICh0aXRsZTogc3RyaW5nKSA9PiBodG1sYDxoMT4ke3RpdGxlfTwvaDE+YDtcbiAqIGBgYFxuICpcbiAqIFRoZSBgaHRtbGAgdGFnIHJldHVybnMgYSBkZXNjcmlwdGlvbiBvZiB0aGUgRE9NIHRvIHJlbmRlciBhcyBhIHZhbHVlLiBJdCBpc1xuICogbGF6eSwgbWVhbmluZyBubyB3b3JrIGlzIGRvbmUgdW50aWwgdGhlIHRlbXBsYXRlIGlzIHJlbmRlcmVkLiBXaGVuIHJlbmRlcmluZyxcbiAqIGlmIGEgdGVtcGxhdGUgY29tZXMgZnJvbSB0aGUgc2FtZSBleHByZXNzaW9uIGFzIGEgcHJldmlvdXNseSByZW5kZXJlZCByZXN1bHQsXG4gKiBpdCdzIGVmZmljaWVudGx5IHVwZGF0ZWQgaW5zdGVhZCBvZiByZXBsYWNlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGh0bWwgPSB0YWcoSFRNTF9SRVNVTFQpO1xuXG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIFNWRyBmcmFnbWVudCB0aGF0IGNhbiBlZmZpY2llbnRseSByZW5kZXJcbiAqIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IHJlY3QgPSBzdmdgPHJlY3Qgd2lkdGg9XCIxMFwiIGhlaWdodD1cIjEwXCI+PC9yZWN0PmA7XG4gKlxuICogY29uc3QgbXlJbWFnZSA9IGh0bWxgXG4gKiAgIDxzdmcgdmlld0JveD1cIjAgMCAxMCAxMFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAqICAgICAke3JlY3R9XG4gKiAgIDwvc3ZnPmA7XG4gKiBgYGBcbiAqXG4gKiBUaGUgYHN2Z2AgKnRhZyBmdW5jdGlvbiogc2hvdWxkIG9ubHkgYmUgdXNlZCBmb3IgU1ZHIGZyYWdtZW50cywgb3IgZWxlbWVudHNcbiAqIHRoYXQgd291bGQgYmUgY29udGFpbmVkICoqaW5zaWRlKiogYW4gYDxzdmc+YCBIVE1MIGVsZW1lbnQuIEEgY29tbW9uIGVycm9yIGlzXG4gKiBwbGFjaW5nIGFuIGA8c3ZnPmAgKmVsZW1lbnQqIGluIGEgdGVtcGxhdGUgdGFnZ2VkIHdpdGggdGhlIGBzdmdgIHRhZ1xuICogZnVuY3Rpb24uIFRoZSBgPHN2Zz5gIGVsZW1lbnQgaXMgYW4gSFRNTCBlbGVtZW50IGFuZCBzaG91bGQgYmUgdXNlZCB3aXRoaW4gYVxuICogdGVtcGxhdGUgdGFnZ2VkIHdpdGggdGhlIHtAbGlua2NvZGUgaHRtbH0gdGFnIGZ1bmN0aW9uLlxuICpcbiAqIEluIExpdEVsZW1lbnQgdXNhZ2UsIGl0J3MgaW52YWxpZCB0byByZXR1cm4gYW4gU1ZHIGZyYWdtZW50IGZyb20gdGhlXG4gKiBgcmVuZGVyKClgIG1ldGhvZCwgYXMgdGhlIFNWRyBmcmFnbWVudCB3aWxsIGJlIGNvbnRhaW5lZCB3aXRoaW4gdGhlIGVsZW1lbnQnc1xuICogc2hhZG93IHJvb3QgYW5kIHRodXMgbm90IGJlIHByb3Blcmx5IGNvbnRhaW5lZCB3aXRoaW4gYW4gYDxzdmc+YCBIVE1MXG4gKiBlbGVtZW50LlxuICovXG5leHBvcnQgY29uc3Qgc3ZnID0gdGFnKFNWR19SRVNVTFQpO1xuXG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIE1hdGhNTCBmcmFnbWVudCB0aGF0IGNhbiBlZmZpY2llbnRseSByZW5kZXJcbiAqIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IG51bSA9IG1hdGhtbGA8bW4+MTwvbW4+YDtcbiAqXG4gKiBjb25zdCBlcSA9IGh0bWxgXG4gKiAgIDxtYXRoPlxuICogICAgICR7bnVtfVxuICogICA8L21hdGg+YDtcbiAqIGBgYFxuICpcbiAqIFRoZSBgbWF0aG1sYCAqdGFnIGZ1bmN0aW9uKiBzaG91bGQgb25seSBiZSB1c2VkIGZvciBNYXRoTUwgZnJhZ21lbnRzLCBvclxuICogZWxlbWVudHMgdGhhdCB3b3VsZCBiZSBjb250YWluZWQgKippbnNpZGUqKiBhIGA8bWF0aD5gIEhUTUwgZWxlbWVudC4gQSBjb21tb25cbiAqIGVycm9yIGlzIHBsYWNpbmcgYSBgPG1hdGg+YCAqZWxlbWVudCogaW4gYSB0ZW1wbGF0ZSB0YWdnZWQgd2l0aCB0aGUgYG1hdGhtbGBcbiAqIHRhZyBmdW5jdGlvbi4gVGhlIGA8bWF0aD5gIGVsZW1lbnQgaXMgYW4gSFRNTCBlbGVtZW50IGFuZCBzaG91bGQgYmUgdXNlZFxuICogd2l0aGluIGEgdGVtcGxhdGUgdGFnZ2VkIHdpdGggdGhlIHtAbGlua2NvZGUgaHRtbH0gdGFnIGZ1bmN0aW9uLlxuICpcbiAqIEluIExpdEVsZW1lbnQgdXNhZ2UsIGl0J3MgaW52YWxpZCB0byByZXR1cm4gYW4gTWF0aE1MIGZyYWdtZW50IGZyb20gdGhlXG4gKiBgcmVuZGVyKClgIG1ldGhvZCwgYXMgdGhlIE1hdGhNTCBmcmFnbWVudCB3aWxsIGJlIGNvbnRhaW5lZCB3aXRoaW4gdGhlXG4gKiBlbGVtZW50J3Mgc2hhZG93IHJvb3QgYW5kIHRodXMgbm90IGJlIHByb3Blcmx5IGNvbnRhaW5lZCB3aXRoaW4gYSBgPG1hdGg+YFxuICogSFRNTCBlbGVtZW50LlxuICovXG5leHBvcnQgY29uc3QgbWF0aG1sID0gdGFnKE1BVEhNTF9SRVNVTFQpO1xuXG4vKipcbiAqIEEgc2VudGluZWwgdmFsdWUgdGhhdCBzaWduYWxzIHRoYXQgYSB2YWx1ZSB3YXMgaGFuZGxlZCBieSBhIGRpcmVjdGl2ZSBhbmRcbiAqIHNob3VsZCBub3QgYmUgd3JpdHRlbiB0byB0aGUgRE9NLlxuICovXG5leHBvcnQgY29uc3Qgbm9DaGFuZ2UgPSBTeW1ib2wuZm9yKCdsaXQtbm9DaGFuZ2UnKTtcblxuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHRoYXQgc2lnbmFscyBhIENoaWxkUGFydCB0byBmdWxseSBjbGVhciBpdHMgY29udGVudC5cbiAqXG4gKiBgYGB0c1xuICogY29uc3QgYnV0dG9uID0gaHRtbGAke1xuICogIHVzZXIuaXNBZG1pblxuICogICAgPyBodG1sYDxidXR0b24+REVMRVRFPC9idXR0b24+YFxuICogICAgOiBub3RoaW5nXG4gKiB9YDtcbiAqIGBgYFxuICpcbiAqIFByZWZlciB1c2luZyBgbm90aGluZ2Agb3ZlciBvdGhlciBmYWxzeSB2YWx1ZXMgYXMgaXQgcHJvdmlkZXMgYSBjb25zaXN0ZW50XG4gKiBiZWhhdmlvciBiZXR3ZWVuIHZhcmlvdXMgZXhwcmVzc2lvbiBiaW5kaW5nIGNvbnRleHRzLlxuICpcbiAqIEluIGNoaWxkIGV4cHJlc3Npb25zLCBgdW5kZWZpbmVkYCwgYG51bGxgLCBgJydgLCBhbmQgYG5vdGhpbmdgIGFsbCBiZWhhdmUgdGhlXG4gKiBzYW1lIGFuZCByZW5kZXIgbm8gbm9kZXMuIEluIGF0dHJpYnV0ZSBleHByZXNzaW9ucywgYG5vdGhpbmdgIF9yZW1vdmVzXyB0aGVcbiAqIGF0dHJpYnV0ZSwgd2hpbGUgYHVuZGVmaW5lZGAgYW5kIGBudWxsYCB3aWxsIHJlbmRlciBhbiBlbXB0eSBzdHJpbmcuIEluXG4gKiBwcm9wZXJ0eSBleHByZXNzaW9ucyBgbm90aGluZ2AgYmVjb21lcyBgdW5kZWZpbmVkYC5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vdGhpbmcgPSBTeW1ib2wuZm9yKCdsaXQtbm90aGluZycpO1xuXG4vKipcbiAqIFRoZSBjYWNoZSBvZiBwcmVwYXJlZCB0ZW1wbGF0ZXMsIGtleWVkIGJ5IHRoZSB0YWdnZWQgVGVtcGxhdGVTdHJpbmdzQXJyYXlcbiAqIGFuZCBfbm90XyBhY2NvdW50aW5nIGZvciB0aGUgc3BlY2lmaWMgdGVtcGxhdGUgdGFnIHVzZWQuIFRoaXMgbWVhbnMgdGhhdFxuICogdGVtcGxhdGUgdGFncyBjYW5ub3QgYmUgZHluYW1pYyAtIHRoZXkgbXVzdCBzdGF0aWNhbGx5IGJlIG9uZSBvZiBodG1sLCBzdmcsXG4gKiBvciBhdHRyLiBUaGlzIHJlc3RyaWN0aW9uIHNpbXBsaWZpZXMgdGhlIGNhY2hlIGxvb2t1cCwgd2hpY2ggaXMgb24gdGhlIGhvdFxuICogcGF0aCBmb3IgcmVuZGVyaW5nLlxuICovXG5jb25zdCB0ZW1wbGF0ZUNhY2hlID0gbmV3IFdlYWtNYXA8VGVtcGxhdGVTdHJpbmdzQXJyYXksIFRlbXBsYXRlPigpO1xuXG4vKipcbiAqIE9iamVjdCBzcGVjaWZ5aW5nIG9wdGlvbnMgZm9yIGNvbnRyb2xsaW5nIGxpdC1odG1sIHJlbmRlcmluZy4gTm90ZSB0aGF0XG4gKiB3aGlsZSBgcmVuZGVyYCBtYXkgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIG9uIHRoZSBzYW1lIGBjb250YWluZXJgIChhbmRcbiAqIGByZW5kZXJCZWZvcmVgIHJlZmVyZW5jZSBub2RlKSB0byBlZmZpY2llbnRseSB1cGRhdGUgdGhlIHJlbmRlcmVkIGNvbnRlbnQsXG4gKiBvbmx5IHRoZSBvcHRpb25zIHBhc3NlZCBpbiBkdXJpbmcgdGhlIGZpcnN0IHJlbmRlciBhcmUgcmVzcGVjdGVkIGR1cmluZ1xuICogdGhlIGxpZmV0aW1lIG9mIHJlbmRlcnMgdG8gdGhhdCB1bmlxdWUgYGNvbnRhaW5lcmAgKyBgcmVuZGVyQmVmb3JlYFxuICogY29tYmluYXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBBbiBvYmplY3QgdG8gdXNlIGFzIHRoZSBgdGhpc2AgdmFsdWUgZm9yIGV2ZW50IGxpc3RlbmVycy4gSXQncyBvZnRlblxuICAgKiB1c2VmdWwgdG8gc2V0IHRoaXMgdG8gdGhlIGhvc3QgY29tcG9uZW50IHJlbmRlcmluZyBhIHRlbXBsYXRlLlxuICAgKi9cbiAgaG9zdD86IG9iamVjdDtcbiAgLyoqXG4gICAqIEEgRE9NIG5vZGUgYmVmb3JlIHdoaWNoIHRvIHJlbmRlciBjb250ZW50IGluIHRoZSBjb250YWluZXIuXG4gICAqL1xuICByZW5kZXJCZWZvcmU/OiBDaGlsZE5vZGUgfCBudWxsO1xuICAvKipcbiAgICogTm9kZSB1c2VkIGZvciBjbG9uaW5nIHRoZSB0ZW1wbGF0ZSAoYGltcG9ydE5vZGVgIHdpbGwgYmUgY2FsbGVkIG9uIHRoaXNcbiAgICogbm9kZSkuIFRoaXMgY29udHJvbHMgdGhlIGBvd25lckRvY3VtZW50YCBvZiB0aGUgcmVuZGVyZWQgRE9NLCBhbG9uZyB3aXRoXG4gICAqIGFueSBpbmhlcml0ZWQgY29udGV4dC4gRGVmYXVsdHMgdG8gdGhlIGdsb2JhbCBgZG9jdW1lbnRgLlxuICAgKi9cbiAgY3JlYXRpb25TY29wZT86IHtpbXBvcnROb2RlKG5vZGU6IE5vZGUsIGRlZXA/OiBib29sZWFuKTogTm9kZX07XG4gIC8qKlxuICAgKiBUaGUgaW5pdGlhbCBjb25uZWN0ZWQgc3RhdGUgZm9yIHRoZSB0b3AtbGV2ZWwgcGFydCBiZWluZyByZW5kZXJlZC4gSWYgbm9cbiAgICogYGlzQ29ubmVjdGVkYCBvcHRpb24gaXMgc2V0LCBgQXN5bmNEaXJlY3RpdmVgcyB3aWxsIGJlIGNvbm5lY3RlZCBieVxuICAgKiBkZWZhdWx0LiBTZXQgdG8gYGZhbHNlYCBpZiB0aGUgaW5pdGlhbCByZW5kZXIgb2NjdXJzIGluIGEgZGlzY29ubmVjdGVkIHRyZWVcbiAgICogYW5kIGBBc3luY0RpcmVjdGl2ZWBzIHNob3VsZCBzZWUgYGlzQ29ubmVjdGVkID09PSBmYWxzZWAgZm9yIHRoZWlyIGluaXRpYWxcbiAgICogcmVuZGVyLiBUaGUgYHBhcnQuc2V0Q29ubmVjdGVkKClgIG1ldGhvZCBtdXN0IGJlIHVzZWQgc3Vic2VxdWVudCB0byBpbml0aWFsXG4gICAqIHJlbmRlciB0byBjaGFuZ2UgdGhlIGNvbm5lY3RlZCBzdGF0ZSBvZiB0aGUgcGFydC5cbiAgICovXG4gIGlzQ29ubmVjdGVkPzogYm9vbGVhbjtcbn1cblxuY29uc3Qgd2Fsa2VyID0gZC5jcmVhdGVUcmVlV2Fsa2VyKFxuICBkLFxuICAxMjkgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR9ICovXG4pO1xuXG5sZXQgc2FuaXRpemVyRmFjdG9yeUludGVybmFsOiBTYW5pdGl6ZXJGYWN0b3J5ID0gbm9vcFNhbml0aXplcjtcblxuLy9cbi8vIENsYXNzZXMgb25seSBiZWxvdyBoZXJlLCBjb25zdCB2YXJpYWJsZSBkZWNsYXJhdGlvbnMgb25seSBhYm92ZSBoZXJlLi4uXG4vL1xuLy8gS2VlcGluZyB2YXJpYWJsZSBkZWNsYXJhdGlvbnMgYW5kIGNsYXNzZXMgdG9nZXRoZXIgaW1wcm92ZXMgbWluaWZpY2F0aW9uLlxuLy8gSW50ZXJmYWNlcyBhbmQgdHlwZSBhbGlhc2VzIGNhbiBiZSBpbnRlcmxlYXZlZCBmcmVlbHkuXG4vL1xuXG4vLyBUeXBlIGZvciBjbGFzc2VzIHRoYXQgaGF2ZSBhIGBfZGlyZWN0aXZlYCBvciBgX2RpcmVjdGl2ZXNbXWAgZmllbGQsIHVzZWQgYnlcbi8vIGByZXNvbHZlRGlyZWN0aXZlYFxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVQYXJlbnQge1xuICBfJHBhcmVudD86IERpcmVjdGl2ZVBhcmVudDtcbiAgXyRpc0Nvbm5lY3RlZDogYm9vbGVhbjtcbiAgX19kaXJlY3RpdmU/OiBEaXJlY3RpdmU7XG4gIF9fZGlyZWN0aXZlcz86IEFycmF5PERpcmVjdGl2ZSB8IHVuZGVmaW5lZD47XG59XG5cbmZ1bmN0aW9uIHRydXN0RnJvbVRlbXBsYXRlU3RyaW5nKFxuICB0c2E6IFRlbXBsYXRlU3RyaW5nc0FycmF5LFxuICBzdHJpbmdGcm9tVFNBOiBzdHJpbmdcbik6IFRydXN0ZWRIVE1MIHtcbiAgLy8gQSBzZWN1cml0eSBjaGVjayB0byBwcmV2ZW50IHNwb29maW5nIG9mIExpdCB0ZW1wbGF0ZSByZXN1bHRzLlxuICAvLyBJbiB0aGUgZnV0dXJlLCB3ZSBtYXkgYmUgYWJsZSB0byByZXBsYWNlIHRoaXMgd2l0aCBBcnJheS5pc1RlbXBsYXRlT2JqZWN0LFxuICAvLyB0aG91Z2ggd2UgbWlnaHQgbmVlZCB0byBtYWtlIHRoYXQgY2hlY2sgaW5zaWRlIG9mIHRoZSBodG1sIGFuZCBzdmdcbiAgLy8gZnVuY3Rpb25zLCBiZWNhdXNlIHByZWNvbXBpbGVkIHRlbXBsYXRlcyBkb24ndCBjb21lIGluIGFzXG4gIC8vIFRlbXBsYXRlU3RyaW5nQXJyYXkgb2JqZWN0cy5cbiAgaWYgKCFpc0FycmF5KHRzYSkgfHwgIXRzYS5oYXNPd25Qcm9wZXJ0eSgncmF3JykpIHtcbiAgICBsZXQgbWVzc2FnZSA9ICdpbnZhbGlkIHRlbXBsYXRlIHN0cmluZ3MgYXJyYXknO1xuICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgbWVzc2FnZSA9IGBcbiAgICAgICAgICBJbnRlcm5hbCBFcnJvcjogZXhwZWN0ZWQgdGVtcGxhdGUgc3RyaW5ncyB0byBiZSBhbiBhcnJheVxuICAgICAgICAgIHdpdGggYSAncmF3JyBmaWVsZC4gRmFraW5nIGEgdGVtcGxhdGUgc3RyaW5ncyBhcnJheSBieVxuICAgICAgICAgIGNhbGxpbmcgaHRtbCBvciBzdmcgbGlrZSBhbiBvcmRpbmFyeSBmdW5jdGlvbiBpcyBlZmZlY3RpdmVseVxuICAgICAgICAgIHRoZSBzYW1lIGFzIGNhbGxpbmcgdW5zYWZlSHRtbCBhbmQgY2FuIGxlYWQgdG8gbWFqb3Igc2VjdXJpdHlcbiAgICAgICAgICBpc3N1ZXMsIGUuZy4gb3BlbmluZyB5b3VyIGNvZGUgdXAgdG8gWFNTIGF0dGFja3MuXG4gICAgICAgICAgSWYgeW91J3JlIHVzaW5nIHRoZSBodG1sIG9yIHN2ZyB0YWdnZWQgdGVtcGxhdGUgZnVuY3Rpb25zIG5vcm1hbGx5XG4gICAgICAgICAgYW5kIHN0aWxsIHNlZWluZyB0aGlzIGVycm9yLCBwbGVhc2UgZmlsZSBhIGJ1ZyBhdFxuICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9saXQvbGl0L2lzc3Vlcy9uZXc/dGVtcGxhdGU9YnVnX3JlcG9ydC5tZFxuICAgICAgICAgIGFuZCBpbmNsdWRlIGluZm9ybWF0aW9uIGFib3V0IHlvdXIgYnVpbGQgdG9vbGluZywgaWYgYW55LlxuICAgICAgICBgXG4gICAgICAgIC50cmltKClcbiAgICAgICAgLnJlcGxhY2UoL1xcbiAqL2csICdcXG4nKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICB9XG4gIHJldHVybiBwb2xpY3kgIT09IHVuZGVmaW5lZFxuICAgID8gcG9saWN5LmNyZWF0ZUhUTUwoc3RyaW5nRnJvbVRTQSlcbiAgICA6IChzdHJpbmdGcm9tVFNBIGFzIHVua25vd24gYXMgVHJ1c3RlZEhUTUwpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gSFRNTCBzdHJpbmcgZm9yIHRoZSBnaXZlbiBUZW1wbGF0ZVN0cmluZ3NBcnJheSBhbmQgcmVzdWx0IHR5cGVcbiAqIChIVE1MIG9yIFNWRyksIGFsb25nIHdpdGggdGhlIGNhc2Utc2Vuc2l0aXZlIGJvdW5kIGF0dHJpYnV0ZSBuYW1lcyBpblxuICogdGVtcGxhdGUgb3JkZXIuIFRoZSBIVE1MIGNvbnRhaW5zIGNvbW1lbnQgbWFya2VycyBkZW5vdGluZyB0aGUgYENoaWxkUGFydGBzXG4gKiBhbmQgc3VmZml4ZXMgb24gYm91bmQgYXR0cmlidXRlcyBkZW5vdGluZyB0aGUgYEF0dHJpYnV0ZVBhcnRzYC5cbiAqXG4gKiBAcGFyYW0gc3RyaW5ncyB0ZW1wbGF0ZSBzdHJpbmdzIGFycmF5XG4gKiBAcGFyYW0gdHlwZSBIVE1MIG9yIFNWR1xuICogQHJldHVybiBBcnJheSBjb250YWluaW5nIGBbaHRtbCwgYXR0ck5hbWVzXWAgKGFycmF5IHJldHVybmVkIGZvciB0ZXJzZW5lc3MsXG4gKiAgICAgdG8gYXZvaWQgb2JqZWN0IGZpZWxkcyBzaW5jZSB0aGlzIGNvZGUgaXMgc2hhcmVkIHdpdGggbm9uLW1pbmlmaWVkIFNTUlxuICogICAgIGNvZGUpXG4gKi9cbmNvbnN0IGdldFRlbXBsYXRlSHRtbCA9IChcbiAgc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXksXG4gIHR5cGU6IFJlc3VsdFR5cGVcbik6IFtUcnVzdGVkSFRNTCwgQXJyYXk8c3RyaW5nPl0gPT4ge1xuICAvLyBJbnNlcnQgbWFrZXJzIGludG8gdGhlIHRlbXBsYXRlIEhUTUwgdG8gcmVwcmVzZW50IHRoZSBwb3NpdGlvbiBvZlxuICAvLyBiaW5kaW5ncy4gVGhlIGZvbGxvd2luZyBjb2RlIHNjYW5zIHRoZSB0ZW1wbGF0ZSBzdHJpbmdzIHRvIGRldGVybWluZSB0aGVcbiAgLy8gc3ludGFjdGljIHBvc2l0aW9uIG9mIHRoZSBiaW5kaW5ncy4gVGhleSBjYW4gYmUgaW4gdGV4dCBwb3NpdGlvbiwgd2hlcmVcbiAgLy8gd2UgaW5zZXJ0IGFuIEhUTUwgY29tbWVudCwgYXR0cmlidXRlIHZhbHVlIHBvc2l0aW9uLCB3aGVyZSB3ZSBpbnNlcnQgYVxuICAvLyBzZW50aW5lbCBzdHJpbmcgYW5kIHJlLXdyaXRlIHRoZSBhdHRyaWJ1dGUgbmFtZSwgb3IgaW5zaWRlIGEgdGFnIHdoZXJlXG4gIC8vIHdlIGluc2VydCB0aGUgc2VudGluZWwgc3RyaW5nLlxuICBjb25zdCBsID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAvLyBTdG9yZXMgdGhlIGNhc2Utc2Vuc2l0aXZlIGJvdW5kIGF0dHJpYnV0ZSBuYW1lcyBpbiB0aGUgb3JkZXIgb2YgdGhlaXJcbiAgLy8gcGFydHMuIEVsZW1lbnRQYXJ0cyBhcmUgYWxzbyByZWZsZWN0ZWQgaW4gdGhpcyBhcnJheSBhcyB1bmRlZmluZWRcbiAgLy8gcmF0aGVyIHRoYW4gYSBzdHJpbmcsIHRvIGRpc2FtYmlndWF0ZSBmcm9tIGF0dHJpYnV0ZSBiaW5kaW5ncy5cbiAgY29uc3QgYXR0ck5hbWVzOiBBcnJheTxzdHJpbmc+ID0gW107XG4gIGxldCBodG1sID1cbiAgICB0eXBlID09PSBTVkdfUkVTVUxUID8gJzxzdmc+JyA6IHR5cGUgPT09IE1BVEhNTF9SRVNVTFQgPyAnPG1hdGg+JyA6ICcnO1xuXG4gIC8vIFdoZW4gd2UncmUgaW5zaWRlIGEgcmF3IHRleHQgdGFnIChub3QgaXQncyB0ZXh0IGNvbnRlbnQpLCB0aGUgcmVnZXhcbiAgLy8gd2lsbCBzdGlsbCBiZSB0YWdSZWdleCBzbyB3ZSBjYW4gZmluZCBhdHRyaWJ1dGVzLCBidXQgd2lsbCBzd2l0Y2ggdG9cbiAgLy8gdGhpcyByZWdleCB3aGVuIHRoZSB0YWcgZW5kcy5cbiAgbGV0IHJhd1RleHRFbmRSZWdleDogUmVnRXhwIHwgdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBjdXJyZW50IHBhcnNpbmcgc3RhdGUsIHJlcHJlc2VudGVkIGFzIGEgcmVmZXJlbmNlIHRvIG9uZSBvZiB0aGVcbiAgLy8gcmVnZXhlc1xuICBsZXQgcmVnZXggPSB0ZXh0RW5kUmVnZXg7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICBjb25zdCBzID0gc3RyaW5nc1tpXTtcbiAgICAvLyBUaGUgaW5kZXggb2YgdGhlIGVuZCBvZiB0aGUgbGFzdCBhdHRyaWJ1dGUgbmFtZS4gV2hlbiB0aGlzIGlzXG4gICAgLy8gcG9zaXRpdmUgYXQgZW5kIG9mIGEgc3RyaW5nLCBpdCBtZWFucyB3ZSdyZSBpbiBhbiBhdHRyaWJ1dGUgdmFsdWVcbiAgICAvLyBwb3NpdGlvbiBhbmQgbmVlZCB0byByZXdyaXRlIHRoZSBhdHRyaWJ1dGUgbmFtZS5cbiAgICAvLyBXZSBhbHNvIHVzZSBhIHNwZWNpYWwgdmFsdWUgb2YgLTIgdG8gaW5kaWNhdGUgdGhhdCB3ZSBlbmNvdW50ZXJlZFxuICAgIC8vIHRoZSBlbmQgb2YgYSBzdHJpbmcgaW4gYXR0cmlidXRlIG5hbWUgcG9zaXRpb24uXG4gICAgbGV0IGF0dHJOYW1lRW5kSW5kZXggPSAtMTtcbiAgICBsZXQgYXR0ck5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBsZXQgbGFzdEluZGV4ID0gMDtcbiAgICBsZXQgbWF0Y2ghOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuXG4gICAgLy8gVGhlIGNvbmRpdGlvbnMgaW4gdGhpcyBsb29wIGhhbmRsZSB0aGUgY3VycmVudCBwYXJzZSBzdGF0ZSwgYW5kIHRoZVxuICAgIC8vIGFzc2lnbm1lbnRzIHRvIHRoZSBgcmVnZXhgIHZhcmlhYmxlIGFyZSB0aGUgc3RhdGUgdHJhbnNpdGlvbnMuXG4gICAgd2hpbGUgKGxhc3RJbmRleCA8IHMubGVuZ3RoKSB7XG4gICAgICAvLyBNYWtlIHN1cmUgd2Ugc3RhcnQgc2VhcmNoaW5nIGZyb20gd2hlcmUgd2UgcHJldmlvdXNseSBsZWZ0IG9mZlxuICAgICAgcmVnZXgubGFzdEluZGV4ID0gbGFzdEluZGV4O1xuICAgICAgbWF0Y2ggPSByZWdleC5leGVjKHMpO1xuICAgICAgaWYgKG1hdGNoID09PSBudWxsKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgbGFzdEluZGV4ID0gcmVnZXgubGFzdEluZGV4O1xuICAgICAgaWYgKHJlZ2V4ID09PSB0ZXh0RW5kUmVnZXgpIHtcbiAgICAgICAgaWYgKG1hdGNoW0NPTU1FTlRfU1RBUlRdID09PSAnIS0tJykge1xuICAgICAgICAgIHJlZ2V4ID0gY29tbWVudEVuZFJlZ2V4O1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoW0NPTU1FTlRfU1RBUlRdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBXZSBzdGFydGVkIGEgd2VpcmQgY29tbWVudCwgbGlrZSA8L3tcbiAgICAgICAgICByZWdleCA9IGNvbW1lbnQyRW5kUmVnZXg7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbVEFHX05BTUVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAocmF3VGV4dEVsZW1lbnQudGVzdChtYXRjaFtUQUdfTkFNRV0pKSB7XG4gICAgICAgICAgICAvLyBSZWNvcmQgaWYgd2UgZW5jb3VudGVyIGEgcmF3LXRleHQgZWxlbWVudC4gV2UnbGwgc3dpdGNoIHRvXG4gICAgICAgICAgICAvLyB0aGlzIHJlZ2V4IGF0IHRoZSBlbmQgb2YgdGhlIHRhZy5cbiAgICAgICAgICAgIHJhd1RleHRFbmRSZWdleCA9IG5ldyBSZWdFeHAoYDwvJHttYXRjaFtUQUdfTkFNRV19YCwgJ2cnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVnZXggPSB0YWdFbmRSZWdleDtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFtEWU5BTUlDX1RBR19OQU1FXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICdCaW5kaW5ncyBpbiB0YWcgbmFtZXMgYXJlIG5vdCBzdXBwb3J0ZWQuIFBsZWFzZSB1c2Ugc3RhdGljIHRlbXBsYXRlcyBpbnN0ZWFkLiAnICtcbiAgICAgICAgICAgICAgICAnU2VlIGh0dHBzOi8vbGl0LmRldi9kb2NzL3RlbXBsYXRlcy9leHByZXNzaW9ucy8jc3RhdGljLWV4cHJlc3Npb25zJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVnZXggPSB0YWdFbmRSZWdleDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChyZWdleCA9PT0gdGFnRW5kUmVnZXgpIHtcbiAgICAgICAgaWYgKG1hdGNoW0VOVElSRV9NQVRDSF0gPT09ICc+Jykge1xuICAgICAgICAgIC8vIEVuZCBvZiBhIHRhZy4gSWYgd2UgaGFkIHN0YXJ0ZWQgYSByYXctdGV4dCBlbGVtZW50LCB1c2UgdGhhdFxuICAgICAgICAgIC8vIHJlZ2V4XG4gICAgICAgICAgcmVnZXggPSByYXdUZXh0RW5kUmVnZXggPz8gdGV4dEVuZFJlZ2V4O1xuICAgICAgICAgIC8vIFdlIG1heSBiZSBlbmRpbmcgYW4gdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlLCBzbyBtYWtlIHN1cmUgd2VcbiAgICAgICAgICAvLyBjbGVhciBhbnkgcGVuZGluZyBhdHRyTmFtZUVuZEluZGV4XG4gICAgICAgICAgYXR0ck5hbWVFbmRJbmRleCA9IC0xO1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoW0FUVFJJQlVURV9OQU1FXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gQXR0cmlidXRlIG5hbWUgcG9zaXRpb25cbiAgICAgICAgICBhdHRyTmFtZUVuZEluZGV4ID0gLTI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXR0ck5hbWVFbmRJbmRleCA9IHJlZ2V4Lmxhc3RJbmRleCAtIG1hdGNoW1NQQUNFU19BTkRfRVFVQUxTXS5sZW5ndGg7XG4gICAgICAgICAgYXR0ck5hbWUgPSBtYXRjaFtBVFRSSUJVVEVfTkFNRV07XG4gICAgICAgICAgcmVnZXggPVxuICAgICAgICAgICAgbWF0Y2hbUVVPVEVfQ0hBUl0gPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICA/IHRhZ0VuZFJlZ2V4XG4gICAgICAgICAgICAgIDogbWF0Y2hbUVVPVEVfQ0hBUl0gPT09ICdcIidcbiAgICAgICAgICAgICAgICA/IGRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4XG4gICAgICAgICAgICAgICAgOiBzaW5nbGVRdW90ZUF0dHJFbmRSZWdleDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgcmVnZXggPT09IGRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4IHx8XG4gICAgICAgIHJlZ2V4ID09PSBzaW5nbGVRdW90ZUF0dHJFbmRSZWdleFxuICAgICAgKSB7XG4gICAgICAgIHJlZ2V4ID0gdGFnRW5kUmVnZXg7XG4gICAgICB9IGVsc2UgaWYgKHJlZ2V4ID09PSBjb21tZW50RW5kUmVnZXggfHwgcmVnZXggPT09IGNvbW1lbnQyRW5kUmVnZXgpIHtcbiAgICAgICAgcmVnZXggPSB0ZXh0RW5kUmVnZXg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOb3Qgb25lIG9mIHRoZSBmaXZlIHN0YXRlIHJlZ2V4ZXMsIHNvIGl0IG11c3QgYmUgdGhlIGR5bmFtaWNhbGx5XG4gICAgICAgIC8vIGNyZWF0ZWQgcmF3IHRleHQgcmVnZXggYW5kIHdlJ3JlIGF0IHRoZSBjbG9zZSBvZiB0aGF0IGVsZW1lbnQuXG4gICAgICAgIHJlZ2V4ID0gdGFnRW5kUmVnZXg7XG4gICAgICAgIHJhd1RleHRFbmRSZWdleCA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoREVWX01PREUpIHtcbiAgICAgIC8vIElmIHdlIGhhdmUgYSBhdHRyTmFtZUVuZEluZGV4LCB3aGljaCBpbmRpY2F0ZXMgdGhhdCB3ZSBzaG91bGRcbiAgICAgIC8vIHJld3JpdGUgdGhlIGF0dHJpYnV0ZSBuYW1lLCBhc3NlcnQgdGhhdCB3ZSdyZSBpbiBhIHZhbGlkIGF0dHJpYnV0ZVxuICAgICAgLy8gcG9zaXRpb24gLSBlaXRoZXIgaW4gYSB0YWcsIG9yIGEgcXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZS5cbiAgICAgIGNvbnNvbGUuYXNzZXJ0KFxuICAgICAgICBhdHRyTmFtZUVuZEluZGV4ID09PSAtMSB8fFxuICAgICAgICAgIHJlZ2V4ID09PSB0YWdFbmRSZWdleCB8fFxuICAgICAgICAgIHJlZ2V4ID09PSBzaW5nbGVRdW90ZUF0dHJFbmRSZWdleCB8fFxuICAgICAgICAgIHJlZ2V4ID09PSBkb3VibGVRdW90ZUF0dHJFbmRSZWdleCxcbiAgICAgICAgJ3VuZXhwZWN0ZWQgcGFyc2Ugc3RhdGUgQidcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gV2UgaGF2ZSBmb3VyIGNhc2VzOlxuICAgIC8vICAxLiBXZSdyZSBpbiB0ZXh0IHBvc2l0aW9uLCBhbmQgbm90IGluIGEgcmF3IHRleHQgZWxlbWVudFxuICAgIC8vICAgICAocmVnZXggPT09IHRleHRFbmRSZWdleCk6IGluc2VydCBhIGNvbW1lbnQgbWFya2VyLlxuICAgIC8vICAyLiBXZSBoYXZlIGEgbm9uLW5lZ2F0aXZlIGF0dHJOYW1lRW5kSW5kZXggd2hpY2ggbWVhbnMgd2UgbmVlZCB0b1xuICAgIC8vICAgICByZXdyaXRlIHRoZSBhdHRyaWJ1dGUgbmFtZSB0byBhZGQgYSBib3VuZCBhdHRyaWJ1dGUgc3VmZml4LlxuICAgIC8vICAzLiBXZSdyZSBhdCB0aGUgbm9uLWZpcnN0IGJpbmRpbmcgaW4gYSBtdWx0aS1iaW5kaW5nIGF0dHJpYnV0ZSwgdXNlIGFcbiAgICAvLyAgICAgcGxhaW4gbWFya2VyLlxuICAgIC8vICA0LiBXZSdyZSBzb21ld2hlcmUgZWxzZSBpbnNpZGUgdGhlIHRhZy4gSWYgd2UncmUgaW4gYXR0cmlidXRlIG5hbWVcbiAgICAvLyAgICAgcG9zaXRpb24gKGF0dHJOYW1lRW5kSW5kZXggPT09IC0yKSwgYWRkIGEgc2VxdWVudGlhbCBzdWZmaXggdG9cbiAgICAvLyAgICAgZ2VuZXJhdGUgYSB1bmlxdWUgYXR0cmlidXRlIG5hbWUuXG5cbiAgICAvLyBEZXRlY3QgYSBiaW5kaW5nIG5leHQgdG8gc2VsZi1jbG9zaW5nIHRhZyBlbmQgYW5kIGluc2VydCBhIHNwYWNlIHRvXG4gICAgLy8gc2VwYXJhdGUgdGhlIG1hcmtlciBmcm9tIHRoZSB0YWcgZW5kOlxuICAgIGNvbnN0IGVuZCA9XG4gICAgICByZWdleCA9PT0gdGFnRW5kUmVnZXggJiYgc3RyaW5nc1tpICsgMV0uc3RhcnRzV2l0aCgnLz4nKSA/ICcgJyA6ICcnO1xuICAgIGh0bWwgKz1cbiAgICAgIHJlZ2V4ID09PSB0ZXh0RW5kUmVnZXhcbiAgICAgICAgPyBzICsgbm9kZU1hcmtlclxuICAgICAgICA6IGF0dHJOYW1lRW5kSW5kZXggPj0gMFxuICAgICAgICAgID8gKGF0dHJOYW1lcy5wdXNoKGF0dHJOYW1lISksXG4gICAgICAgICAgICBzLnNsaWNlKDAsIGF0dHJOYW1lRW5kSW5kZXgpICtcbiAgICAgICAgICAgICAgYm91bmRBdHRyaWJ1dGVTdWZmaXggK1xuICAgICAgICAgICAgICBzLnNsaWNlKGF0dHJOYW1lRW5kSW5kZXgpKSArXG4gICAgICAgICAgICBtYXJrZXIgK1xuICAgICAgICAgICAgZW5kXG4gICAgICAgICAgOiBzICsgbWFya2VyICsgKGF0dHJOYW1lRW5kSW5kZXggPT09IC0yID8gaSA6IGVuZCk7XG4gIH1cblxuICBjb25zdCBodG1sUmVzdWx0OiBzdHJpbmcgfCBUcnVzdGVkSFRNTCA9XG4gICAgaHRtbCArXG4gICAgKHN0cmluZ3NbbF0gfHwgJzw/PicpICtcbiAgICAodHlwZSA9PT0gU1ZHX1JFU1VMVCA/ICc8L3N2Zz4nIDogdHlwZSA9PT0gTUFUSE1MX1JFU1VMVCA/ICc8L21hdGg+JyA6ICcnKTtcblxuICAvLyBSZXR1cm5lZCBhcyBhbiBhcnJheSBmb3IgdGVyc2VuZXNzXG4gIHJldHVybiBbdHJ1c3RGcm9tVGVtcGxhdGVTdHJpbmcoc3RyaW5ncywgaHRtbFJlc3VsdCksIGF0dHJOYW1lc107XG59O1xuXG4vKiogQGludGVybmFsICovXG5leHBvcnQgdHlwZSB7VGVtcGxhdGV9O1xuY2xhc3MgVGVtcGxhdGUge1xuICAvKiogQGludGVybmFsICovXG4gIGVsITogSFRNTFRlbXBsYXRlRWxlbWVudDtcblxuICBwYXJ0czogQXJyYXk8VGVtcGxhdGVQYXJ0PiA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAge3N0cmluZ3MsIFsnXyRsaXRUeXBlJCddOiB0eXBlfTogVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0LFxuICAgIG9wdGlvbnM/OiBSZW5kZXJPcHRpb25zXG4gICkge1xuICAgIGxldCBub2RlOiBOb2RlIHwgbnVsbDtcbiAgICBsZXQgbm9kZUluZGV4ID0gMDtcbiAgICBsZXQgYXR0ck5hbWVJbmRleCA9IDA7XG4gICAgY29uc3QgcGFydENvdW50ID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgIGNvbnN0IHBhcnRzID0gdGhpcy5wYXJ0cztcblxuICAgIC8vIENyZWF0ZSB0ZW1wbGF0ZSBlbGVtZW50XG4gICAgY29uc3QgW2h0bWwsIGF0dHJOYW1lc10gPSBnZXRUZW1wbGF0ZUh0bWwoc3RyaW5ncywgdHlwZSk7XG4gICAgdGhpcy5lbCA9IFRlbXBsYXRlLmNyZWF0ZUVsZW1lbnQoaHRtbCwgb3B0aW9ucyk7XG4gICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gdGhpcy5lbC5jb250ZW50O1xuXG4gICAgLy8gUmUtcGFyZW50IFNWRyBvciBNYXRoTUwgbm9kZXMgaW50byB0ZW1wbGF0ZSByb290XG4gICAgaWYgKHR5cGUgPT09IFNWR19SRVNVTFQgfHwgdHlwZSA9PT0gTUFUSE1MX1JFU1VMVCkge1xuICAgICAgY29uc3Qgd3JhcHBlciA9IHRoaXMuZWwuY29udGVudC5maXJzdENoaWxkITtcbiAgICAgIHdyYXBwZXIucmVwbGFjZVdpdGgoLi4ud3JhcHBlci5jaGlsZE5vZGVzKTtcbiAgICB9XG5cbiAgICAvLyBXYWxrIHRoZSB0ZW1wbGF0ZSB0byBmaW5kIGJpbmRpbmcgbWFya2VycyBhbmQgY3JlYXRlIFRlbXBsYXRlUGFydHNcbiAgICB3aGlsZSAoKG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKSkgIT09IG51bGwgJiYgcGFydHMubGVuZ3RoIDwgcGFydENvdW50KSB7XG4gICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICBpZiAoREVWX01PREUpIHtcbiAgICAgICAgICBjb25zdCB0YWcgPSAobm9kZSBhcyBFbGVtZW50KS5sb2NhbE5hbWU7XG4gICAgICAgICAgLy8gV2FybiBpZiBgdGV4dGFyZWFgIGluY2x1ZGVzIGFuIGV4cHJlc3Npb24gYW5kIHRocm93IGlmIGB0ZW1wbGF0ZWBcbiAgICAgICAgICAvLyBkb2VzIHNpbmNlIHRoZXNlIGFyZSBub3Qgc3VwcG9ydGVkLiBXZSBkbyB0aGlzIGJ5IGNoZWNraW5nXG4gICAgICAgICAgLy8gaW5uZXJIVE1MIGZvciBhbnl0aGluZyB0aGF0IGxvb2tzIGxpa2UgYSBtYXJrZXIuIFRoaXMgY2F0Y2hlc1xuICAgICAgICAgIC8vIGNhc2VzIGxpa2UgYmluZGluZ3MgaW4gdGV4dGFyZWEgdGhlcmUgbWFya2VycyB0dXJuIGludG8gdGV4dCBub2Rlcy5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAvXig/OnRleHRhcmVhfHRlbXBsYXRlKSQvaSEudGVzdCh0YWcpICYmXG4gICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5pbm5lckhUTUwuaW5jbHVkZXMobWFya2VyKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgY29uc3QgbSA9XG4gICAgICAgICAgICAgIGBFeHByZXNzaW9ucyBhcmUgbm90IHN1cHBvcnRlZCBpbnNpZGUgXFxgJHt0YWd9XFxgIGAgK1xuICAgICAgICAgICAgICBgZWxlbWVudHMuIFNlZSBodHRwczovL2xpdC5kZXYvbXNnL2V4cHJlc3Npb24taW4tJHt0YWd9IGZvciBtb3JlIGAgK1xuICAgICAgICAgICAgICBgaW5mb3JtYXRpb24uYDtcbiAgICAgICAgICAgIGlmICh0YWcgPT09ICd0ZW1wbGF0ZScpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG0pO1xuICAgICAgICAgICAgfSBlbHNlIGlzc3VlV2FybmluZygnJywgbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiBmb3IgYXR0ZW1wdGVkIGR5bmFtaWMgdGFnIG5hbWVzLCB3ZSBkb24ndFxuICAgICAgICAvLyBpbmNyZW1lbnQgdGhlIGJpbmRpbmdJbmRleCwgYW5kIGl0J2xsIGJlIG9mZiBieSAxIGluIHRoZSBlbGVtZW50XG4gICAgICAgIC8vIGFuZCBvZmYgYnkgdHdvIGFmdGVyIGl0LlxuICAgICAgICBpZiAoKG5vZGUgYXMgRWxlbWVudCkuaGFzQXR0cmlidXRlcygpKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIChub2RlIGFzIEVsZW1lbnQpLmdldEF0dHJpYnV0ZU5hbWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChuYW1lLmVuZHNXaXRoKGJvdW5kQXR0cmlidXRlU3VmZml4KSkge1xuICAgICAgICAgICAgICBjb25zdCByZWFsTmFtZSA9IGF0dHJOYW1lc1thdHRyTmFtZUluZGV4KytdO1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IChub2RlIGFzIEVsZW1lbnQpLmdldEF0dHJpYnV0ZShuYW1lKSE7XG4gICAgICAgICAgICAgIGNvbnN0IHN0YXRpY3MgPSB2YWx1ZS5zcGxpdChtYXJrZXIpO1xuICAgICAgICAgICAgICBjb25zdCBtID0gLyhbLj9AXSk/KC4qKS8uZXhlYyhyZWFsTmFtZSkhO1xuICAgICAgICAgICAgICBwYXJ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBBVFRSSUJVVEVfUEFSVCxcbiAgICAgICAgICAgICAgICBpbmRleDogbm9kZUluZGV4LFxuICAgICAgICAgICAgICAgIG5hbWU6IG1bMl0sXG4gICAgICAgICAgICAgICAgc3RyaW5nczogc3RhdGljcyxcbiAgICAgICAgICAgICAgICBjdG9yOlxuICAgICAgICAgICAgICAgICAgbVsxXSA9PT0gJy4nXG4gICAgICAgICAgICAgICAgICAgID8gUHJvcGVydHlQYXJ0XG4gICAgICAgICAgICAgICAgICAgIDogbVsxXSA9PT0gJz8nXG4gICAgICAgICAgICAgICAgICAgICAgPyBCb29sZWFuQXR0cmlidXRlUGFydFxuICAgICAgICAgICAgICAgICAgICAgIDogbVsxXSA9PT0gJ0AnXG4gICAgICAgICAgICAgICAgICAgICAgICA/IEV2ZW50UGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBBdHRyaWJ1dGVQYXJ0LFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuYW1lLnN0YXJ0c1dpdGgobWFya2VyKSkge1xuICAgICAgICAgICAgICBwYXJ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBFTEVNRU5UX1BBUlQsXG4gICAgICAgICAgICAgICAgaW5kZXg6IG5vZGVJbmRleCxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyAoanVzdGluZmFnbmFuaSk6IGJlbmNobWFyayB0aGUgcmVnZXggYWdhaW5zdCB0ZXN0aW5nIGZvciBlYWNoXG4gICAgICAgIC8vIG9mIHRoZSAzIHJhdyB0ZXh0IGVsZW1lbnQgbmFtZXMuXG4gICAgICAgIGlmIChyYXdUZXh0RWxlbWVudC50ZXN0KChub2RlIGFzIEVsZW1lbnQpLnRhZ05hbWUpKSB7XG4gICAgICAgICAgLy8gRm9yIHJhdyB0ZXh0IGVsZW1lbnRzIHdlIG5lZWQgdG8gc3BsaXQgdGhlIHRleHQgY29udGVudCBvblxuICAgICAgICAgIC8vIG1hcmtlcnMsIGNyZWF0ZSBhIFRleHQgbm9kZSBmb3IgZWFjaCBzZWdtZW50LCBhbmQgY3JlYXRlXG4gICAgICAgICAgLy8gYSBUZW1wbGF0ZVBhcnQgZm9yIGVhY2ggbWFya2VyLlxuICAgICAgICAgIGNvbnN0IHN0cmluZ3MgPSAobm9kZSBhcyBFbGVtZW50KS50ZXh0Q29udGVudCEuc3BsaXQobWFya2VyKTtcbiAgICAgICAgICBjb25zdCBsYXN0SW5kZXggPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgaWYgKGxhc3RJbmRleCA+IDApIHtcbiAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLnRleHRDb250ZW50ID0gdHJ1c3RlZFR5cGVzXG4gICAgICAgICAgICAgID8gKHRydXN0ZWRUeXBlcy5lbXB0eVNjcmlwdCBhcyB1bmtub3duIGFzICcnKVxuICAgICAgICAgICAgICA6ICcnO1xuICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBuZXcgdGV4dCBub2RlIGZvciBlYWNoIGxpdGVyYWwgc2VjdGlvblxuICAgICAgICAgICAgLy8gVGhlc2Ugbm9kZXMgYXJlIGFsc28gdXNlZCBhcyB0aGUgbWFya2VycyBmb3Igbm9kZSBwYXJ0c1xuICAgICAgICAgICAgLy8gV2UgY2FuJ3QgdXNlIGVtcHR5IHRleHQgbm9kZXMgYXMgbWFya2VycyBiZWNhdXNlIHRoZXkncmVcbiAgICAgICAgICAgIC8vIG5vcm1hbGl6ZWQgd2hlbiBjbG9uaW5nIGluIElFIChjb3VsZCBzaW1wbGlmeSB3aGVuXG4gICAgICAgICAgICAvLyBJRSBpcyBubyBsb25nZXIgc3VwcG9ydGVkKVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXN0SW5kZXg7IGkrKykge1xuICAgICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5hcHBlbmQoc3RyaW5nc1tpXSwgY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICAgICAgICAvLyBXYWxrIHBhc3QgdGhlIG1hcmtlciBub2RlIHdlIGp1c3QgYWRkZWRcbiAgICAgICAgICAgICAgd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgICAgICAgIHBhcnRzLnB1c2goe3R5cGU6IENISUxEX1BBUlQsIGluZGV4OiArK25vZGVJbmRleH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTm90ZSBiZWNhdXNlIHRoaXMgbWFya2VyIGlzIGFkZGVkIGFmdGVyIHRoZSB3YWxrZXIncyBjdXJyZW50XG4gICAgICAgICAgICAvLyBub2RlLCBpdCB3aWxsIGJlIHdhbGtlZCB0byBpbiB0aGUgb3V0ZXIgbG9vcCAoYW5kIGlnbm9yZWQpLCBzb1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBhZGp1c3Qgbm9kZUluZGV4IGhlcmVcbiAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLmFwcGVuZChzdHJpbmdzW2xhc3RJbmRleF0sIGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCkge1xuICAgICAgICBjb25zdCBkYXRhID0gKG5vZGUgYXMgQ29tbWVudCkuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgPT09IG1hcmtlck1hdGNoKSB7XG4gICAgICAgICAgcGFydHMucHVzaCh7dHlwZTogQ0hJTERfUEFSVCwgaW5kZXg6IG5vZGVJbmRleH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBpID0gLTE7XG4gICAgICAgICAgd2hpbGUgKChpID0gKG5vZGUgYXMgQ29tbWVudCkuZGF0YS5pbmRleE9mKG1hcmtlciwgaSArIDEpKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIC8vIENvbW1lbnQgbm9kZSBoYXMgYSBiaW5kaW5nIG1hcmtlciBpbnNpZGUsIG1ha2UgYW4gaW5hY3RpdmUgcGFydFxuICAgICAgICAgICAgLy8gVGhlIGJpbmRpbmcgd29uJ3Qgd29yaywgYnV0IHN1YnNlcXVlbnQgYmluZGluZ3Mgd2lsbFxuICAgICAgICAgICAgcGFydHMucHVzaCh7dHlwZTogQ09NTUVOVF9QQVJULCBpbmRleDogbm9kZUluZGV4fSk7XG4gICAgICAgICAgICAvLyBNb3ZlIHRvIHRoZSBlbmQgb2YgdGhlIG1hdGNoXG4gICAgICAgICAgICBpICs9IG1hcmtlci5sZW5ndGggLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9kZUluZGV4Kys7XG4gICAgfVxuXG4gICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAvLyBJZiB0aGVyZSB3YXMgYSBkdXBsaWNhdGUgYXR0cmlidXRlIG9uIGEgdGFnLCB0aGVuIHdoZW4gdGhlIHRhZyBpc1xuICAgICAgLy8gcGFyc2VkIGludG8gYW4gZWxlbWVudCB0aGUgYXR0cmlidXRlIGdldHMgZGUtZHVwbGljYXRlZC4gV2UgY2FuIGRldGVjdFxuICAgICAgLy8gdGhpcyBtaXNtYXRjaCBpZiB3ZSBoYXZlbid0IHByZWNpc2VseSBjb25zdW1lZCBldmVyeSBhdHRyaWJ1dGUgbmFtZVxuICAgICAgLy8gd2hlbiBwcmVwYXJpbmcgdGhlIHRlbXBsYXRlLiBUaGlzIHdvcmtzIGJlY2F1c2UgYGF0dHJOYW1lc2AgaXMgYnVpbHRcbiAgICAgIC8vIGZyb20gdGhlIHRlbXBsYXRlIHN0cmluZyBhbmQgYGF0dHJOYW1lSW5kZXhgIGNvbWVzIGZyb20gcHJvY2Vzc2luZyB0aGVcbiAgICAgIC8vIHJlc3VsdGluZyBET00uXG4gICAgICBpZiAoYXR0ck5hbWVzLmxlbmd0aCAhPT0gYXR0ck5hbWVJbmRleCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYERldGVjdGVkIGR1cGxpY2F0ZSBhdHRyaWJ1dGUgYmluZGluZ3MuIFRoaXMgb2NjdXJzIGlmIHlvdXIgdGVtcGxhdGUgYCArXG4gICAgICAgICAgICBgaGFzIGR1cGxpY2F0ZSBhdHRyaWJ1dGVzIG9uIGFuIGVsZW1lbnQgdGFnLiBGb3IgZXhhbXBsZSBgICtcbiAgICAgICAgICAgIGBcIjxpbnB1dCA/ZGlzYWJsZWQ9XFwke3RydWV9ID9kaXNhYmxlZD1cXCR7ZmFsc2V9PlwiIGNvbnRhaW5zIGEgYCArXG4gICAgICAgICAgICBgZHVwbGljYXRlIFwiZGlzYWJsZWRcIiBhdHRyaWJ1dGUuIFRoZSBlcnJvciB3YXMgZGV0ZWN0ZWQgaW4gYCArXG4gICAgICAgICAgICBgdGhlIGZvbGxvd2luZyB0ZW1wbGF0ZTogXFxuYCArXG4gICAgICAgICAgICAnYCcgK1xuICAgICAgICAgICAgc3RyaW5ncy5qb2luKCckey4uLn0nKSArXG4gICAgICAgICAgICAnYCdcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXZSBjb3VsZCBzZXQgd2Fsa2VyLmN1cnJlbnROb2RlIHRvIGFub3RoZXIgbm9kZSBoZXJlIHRvIHByZXZlbnQgYSBtZW1vcnlcbiAgICAvLyBsZWFrLCBidXQgZXZlcnkgdGltZSB3ZSBwcmVwYXJlIGEgdGVtcGxhdGUsIHdlIGltbWVkaWF0ZWx5IHJlbmRlciBpdFxuICAgIC8vIGFuZCByZS11c2UgdGhlIHdhbGtlciBpbiBuZXcgVGVtcGxhdGVJbnN0YW5jZS5fY2xvbmUoKS5cbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ3RlbXBsYXRlIHByZXAnLFxuICAgICAgICB0ZW1wbGF0ZTogdGhpcyxcbiAgICAgICAgY2xvbmFibGVUZW1wbGF0ZTogdGhpcy5lbCxcbiAgICAgICAgcGFydHM6IHRoaXMucGFydHMsXG4gICAgICAgIHN0cmluZ3MsXG4gICAgICB9KTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRkZW4gdmlhIGBsaXRIdG1sUG9seWZpbGxTdXBwb3J0YCB0byBwcm92aWRlIHBsYXRmb3JtIHN1cHBvcnQuXG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgY3JlYXRlRWxlbWVudChodG1sOiBUcnVzdGVkSFRNTCwgX29wdGlvbnM/OiBSZW5kZXJPcHRpb25zKSB7XG4gICAgY29uc3QgZWwgPSBkLmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gICAgZWwuaW5uZXJIVE1MID0gaHRtbCBhcyB1bmtub3duIGFzIHN0cmluZztcbiAgICByZXR1cm4gZWw7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBEaXNjb25uZWN0YWJsZSB7XG4gIF8kcGFyZW50PzogRGlzY29ubmVjdGFibGU7XG4gIF8kZGlzY29ubmVjdGFibGVDaGlsZHJlbj86IFNldDxEaXNjb25uZWN0YWJsZT47XG4gIC8vIFJhdGhlciB0aGFuIGhvbGQgY29ubmVjdGlvbiBzdGF0ZSBvbiBpbnN0YW5jZXMsIERpc2Nvbm5lY3RhYmxlcyByZWN1cnNpdmVseVxuICAvLyBmZXRjaCB0aGUgY29ubmVjdGlvbiBzdGF0ZSBmcm9tIHRoZSBSb290UGFydCB0aGV5IGFyZSBjb25uZWN0ZWQgaW4gdmlhXG4gIC8vIGdldHRlcnMgdXAgdGhlIERpc2Nvbm5lY3RhYmxlIHRyZWUgdmlhIF8kcGFyZW50IHJlZmVyZW5jZXMuIFRoaXMgcHVzaGVzIHRoZVxuICAvLyBjb3N0IG9mIHRyYWNraW5nIHRoZSBpc0Nvbm5lY3RlZCBzdGF0ZSB0byBgQXN5bmNEaXJlY3RpdmVzYCwgYW5kIGF2b2lkc1xuICAvLyBuZWVkaW5nIHRvIHBhc3MgYWxsIERpc2Nvbm5lY3RhYmxlcyAocGFydHMsIHRlbXBsYXRlIGluc3RhbmNlcywgYW5kXG4gIC8vIGRpcmVjdGl2ZXMpIHRoZWlyIGNvbm5lY3Rpb24gc3RhdGUgZWFjaCB0aW1lIGl0IGNoYW5nZXMsIHdoaWNoIHdvdWxkIGJlXG4gIC8vIGNvc3RseSBmb3IgdHJlZXMgdGhhdCBoYXZlIG5vIEFzeW5jRGlyZWN0aXZlcy5cbiAgXyRpc0Nvbm5lY3RlZDogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZURpcmVjdGl2ZShcbiAgcGFydDogQ2hpbGRQYXJ0IHwgQXR0cmlidXRlUGFydCB8IEVsZW1lbnRQYXJ0LFxuICB2YWx1ZTogdW5rbm93bixcbiAgcGFyZW50OiBEaXJlY3RpdmVQYXJlbnQgPSBwYXJ0LFxuICBhdHRyaWJ1dGVJbmRleD86IG51bWJlclxuKTogdW5rbm93biB7XG4gIC8vIEJhaWwgZWFybHkgaWYgdGhlIHZhbHVlIGlzIGV4cGxpY2l0bHkgbm9DaGFuZ2UuIE5vdGUsIHRoaXMgbWVhbnMgYW55XG4gIC8vIG5lc3RlZCBkaXJlY3RpdmUgaXMgc3RpbGwgYXR0YWNoZWQgYW5kIGlzIG5vdCBydW4uXG4gIGlmICh2YWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgbGV0IGN1cnJlbnREaXJlY3RpdmUgPVxuICAgIGF0dHJpYnV0ZUluZGV4ICE9PSB1bmRlZmluZWRcbiAgICAgID8gKHBhcmVudCBhcyBBdHRyaWJ1dGVQYXJ0KS5fX2RpcmVjdGl2ZXM/LlthdHRyaWJ1dGVJbmRleF1cbiAgICAgIDogKHBhcmVudCBhcyBDaGlsZFBhcnQgfCBFbGVtZW50UGFydCB8IERpcmVjdGl2ZSkuX19kaXJlY3RpdmU7XG4gIGNvbnN0IG5leHREaXJlY3RpdmVDb25zdHJ1Y3RvciA9IGlzUHJpbWl0aXZlKHZhbHVlKVxuICAgID8gdW5kZWZpbmVkXG4gICAgOiAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgICAgKHZhbHVlIGFzIERpcmVjdGl2ZVJlc3VsdClbJ18kbGl0RGlyZWN0aXZlJCddO1xuICBpZiAoY3VycmVudERpcmVjdGl2ZT8uY29uc3RydWN0b3IgIT09IG5leHREaXJlY3RpdmVDb25zdHJ1Y3Rvcikge1xuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgY3VycmVudERpcmVjdGl2ZT8uWydfJG5vdGlmeURpcmVjdGl2ZUNvbm5lY3Rpb25DaGFuZ2VkJ10/LihmYWxzZSk7XG4gICAgaWYgKG5leHREaXJlY3RpdmVDb25zdHJ1Y3RvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjdXJyZW50RGlyZWN0aXZlID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50RGlyZWN0aXZlID0gbmV3IG5leHREaXJlY3RpdmVDb25zdHJ1Y3RvcihwYXJ0IGFzIFBhcnRJbmZvKTtcbiAgICAgIGN1cnJlbnREaXJlY3RpdmUuXyRpbml0aWFsaXplKHBhcnQsIHBhcmVudCwgYXR0cmlidXRlSW5kZXgpO1xuICAgIH1cbiAgICBpZiAoYXR0cmlidXRlSW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgKChwYXJlbnQgYXMgQXR0cmlidXRlUGFydCkuX19kaXJlY3RpdmVzID8/PSBbXSlbYXR0cmlidXRlSW5kZXhdID1cbiAgICAgICAgY3VycmVudERpcmVjdGl2ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHBhcmVudCBhcyBDaGlsZFBhcnQgfCBEaXJlY3RpdmUpLl9fZGlyZWN0aXZlID0gY3VycmVudERpcmVjdGl2ZTtcbiAgICB9XG4gIH1cbiAgaWYgKGN1cnJlbnREaXJlY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbHVlID0gcmVzb2x2ZURpcmVjdGl2ZShcbiAgICAgIHBhcnQsXG4gICAgICBjdXJyZW50RGlyZWN0aXZlLl8kcmVzb2x2ZShwYXJ0LCAodmFsdWUgYXMgRGlyZWN0aXZlUmVzdWx0KS52YWx1ZXMpLFxuICAgICAgY3VycmVudERpcmVjdGl2ZSxcbiAgICAgIGF0dHJpYnV0ZUluZGV4XG4gICAgKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCB0eXBlIHtUZW1wbGF0ZUluc3RhbmNlfTtcbi8qKlxuICogQW4gdXBkYXRlYWJsZSBpbnN0YW5jZSBvZiBhIFRlbXBsYXRlLiBIb2xkcyByZWZlcmVuY2VzIHRvIHRoZSBQYXJ0cyB1c2VkIHRvXG4gKiB1cGRhdGUgdGhlIHRlbXBsYXRlIGluc3RhbmNlLlxuICovXG5jbGFzcyBUZW1wbGF0ZUluc3RhbmNlIGltcGxlbWVudHMgRGlzY29ubmVjdGFibGUge1xuICBfJHRlbXBsYXRlOiBUZW1wbGF0ZTtcbiAgXyRwYXJ0czogQXJyYXk8UGFydCB8IHVuZGVmaW5lZD4gPSBbXTtcblxuICAvKiogQGludGVybmFsICovXG4gIF8kcGFyZW50OiBDaGlsZFBhcnQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPiA9IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZTogVGVtcGxhdGUsIHBhcmVudDogQ2hpbGRQYXJ0KSB7XG4gICAgdGhpcy5fJHRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgdGhpcy5fJHBhcmVudCA9IHBhcmVudDtcbiAgfVxuXG4gIC8vIENhbGxlZCBieSBDaGlsZFBhcnQgcGFyZW50Tm9kZSBnZXR0ZXJcbiAgZ2V0IHBhcmVudE5vZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQucGFyZW50Tm9kZTtcbiAgfVxuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQuXyRpc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIC8vIFRoaXMgbWV0aG9kIGlzIHNlcGFyYXRlIGZyb20gdGhlIGNvbnN0cnVjdG9yIGJlY2F1c2Ugd2UgbmVlZCB0byByZXR1cm4gYVxuICAvLyBEb2N1bWVudEZyYWdtZW50IGFuZCB3ZSBkb24ndCB3YW50IHRvIGhvbGQgb250byBpdCB3aXRoIGFuIGluc3RhbmNlIGZpZWxkLlxuICBfY2xvbmUob3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGVsOiB7Y29udGVudH0sXG4gICAgICBwYXJ0czogcGFydHMsXG4gICAgfSA9IHRoaXMuXyR0ZW1wbGF0ZTtcbiAgICBjb25zdCBmcmFnbWVudCA9IChvcHRpb25zPy5jcmVhdGlvblNjb3BlID8/IGQpLmltcG9ydE5vZGUoY29udGVudCwgdHJ1ZSk7XG4gICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gZnJhZ21lbnQ7XG5cbiAgICBsZXQgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpITtcbiAgICBsZXQgbm9kZUluZGV4ID0gMDtcbiAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICBsZXQgdGVtcGxhdGVQYXJ0ID0gcGFydHNbMF07XG5cbiAgICB3aGlsZSAodGVtcGxhdGVQYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChub2RlSW5kZXggPT09IHRlbXBsYXRlUGFydC5pbmRleCkge1xuICAgICAgICBsZXQgcGFydDogUGFydCB8IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRlbXBsYXRlUGFydC50eXBlID09PSBDSElMRF9QQVJUKSB7XG4gICAgICAgICAgcGFydCA9IG5ldyBDaGlsZFBhcnQoXG4gICAgICAgICAgICBub2RlIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgICAgbm9kZS5uZXh0U2libGluZyxcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBvcHRpb25zXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0ZW1wbGF0ZVBhcnQudHlwZSA9PT0gQVRUUklCVVRFX1BBUlQpIHtcbiAgICAgICAgICBwYXJ0ID0gbmV3IHRlbXBsYXRlUGFydC5jdG9yKFxuICAgICAgICAgICAgbm9kZSBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICAgIHRlbXBsYXRlUGFydC5uYW1lLFxuICAgICAgICAgICAgdGVtcGxhdGVQYXJ0LnN0cmluZ3MsXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGVtcGxhdGVQYXJ0LnR5cGUgPT09IEVMRU1FTlRfUEFSVCkge1xuICAgICAgICAgIHBhcnQgPSBuZXcgRWxlbWVudFBhcnQobm9kZSBhcyBIVE1MRWxlbWVudCwgdGhpcywgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fJHBhcnRzLnB1c2gocGFydCk7XG4gICAgICAgIHRlbXBsYXRlUGFydCA9IHBhcnRzWysrcGFydEluZGV4XTtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlSW5kZXggIT09IHRlbXBsYXRlUGFydD8uaW5kZXgpIHtcbiAgICAgICAgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpITtcbiAgICAgICAgbm9kZUluZGV4Kys7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFdlIG5lZWQgdG8gc2V0IHRoZSBjdXJyZW50Tm9kZSBhd2F5IGZyb20gdGhlIGNsb25lZCB0cmVlIHNvIHRoYXQgd2VcbiAgICAvLyBkb24ndCBob2xkIG9udG8gdGhlIHRyZWUgZXZlbiBpZiB0aGUgdHJlZSBpcyBkZXRhY2hlZCBhbmQgc2hvdWxkIGJlXG4gICAgLy8gZnJlZWQuXG4gICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gZDtcbiAgICByZXR1cm4gZnJhZ21lbnQ7XG4gIH1cblxuICBfdXBkYXRlKHZhbHVlczogQXJyYXk8dW5rbm93bj4pIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwYXJ0IG9mIHRoaXMuXyRwYXJ0cykge1xuICAgICAgaWYgKHBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAgICBraW5kOiAnc2V0IHBhcnQnLFxuICAgICAgICAgICAgcGFydCxcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZXNbaV0sXG4gICAgICAgICAgICB2YWx1ZUluZGV4OiBpLFxuICAgICAgICAgICAgdmFsdWVzLFxuICAgICAgICAgICAgdGVtcGxhdGVJbnN0YW5jZTogdGhpcyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKChwYXJ0IGFzIEF0dHJpYnV0ZVBhcnQpLnN0cmluZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIChwYXJ0IGFzIEF0dHJpYnV0ZVBhcnQpLl8kc2V0VmFsdWUodmFsdWVzLCBwYXJ0IGFzIEF0dHJpYnV0ZVBhcnQsIGkpO1xuICAgICAgICAgIC8vIFRoZSBudW1iZXIgb2YgdmFsdWVzIHRoZSBwYXJ0IGNvbnN1bWVzIGlzIHBhcnQuc3RyaW5ncy5sZW5ndGggLSAxXG4gICAgICAgICAgLy8gc2luY2UgdmFsdWVzIGFyZSBpbiBiZXR3ZWVuIHRlbXBsYXRlIHNwYW5zLiBXZSBpbmNyZW1lbnQgaSBieSAxXG4gICAgICAgICAgLy8gbGF0ZXIgaW4gdGhlIGxvb3AsIHNvIGluY3JlbWVudCBpdCBieSBwYXJ0LnN0cmluZ3MubGVuZ3RoIC0gMiBoZXJlXG4gICAgICAgICAgaSArPSAocGFydCBhcyBBdHRyaWJ1dGVQYXJ0KS5zdHJpbmdzIS5sZW5ndGggLSAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcnQuXyRzZXRWYWx1ZSh2YWx1ZXNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICB9XG59XG5cbi8qXG4gKiBQYXJ0c1xuICovXG50eXBlIEF0dHJpYnV0ZVRlbXBsYXRlUGFydCA9IHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIEFUVFJJQlVURV9QQVJUO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGN0b3I6IHR5cGVvZiBBdHRyaWJ1dGVQYXJ0O1xuICByZWFkb25seSBzdHJpbmdzOiBSZWFkb25seUFycmF5PHN0cmluZz47XG59O1xudHlwZSBDaGlsZFRlbXBsYXRlUGFydCA9IHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIENISUxEX1BBUlQ7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG59O1xudHlwZSBFbGVtZW50VGVtcGxhdGVQYXJ0ID0ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgRUxFTUVOVF9QQVJUO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xufTtcbnR5cGUgQ29tbWVudFRlbXBsYXRlUGFydCA9IHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIENPTU1FTlRfUEFSVDtcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbn07XG5cbi8qKlxuICogQSBUZW1wbGF0ZVBhcnQgcmVwcmVzZW50cyBhIGR5bmFtaWMgcGFydCBpbiBhIHRlbXBsYXRlLCBiZWZvcmUgdGhlIHRlbXBsYXRlXG4gKiBpcyBpbnN0YW50aWF0ZWQuIFdoZW4gYSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQgUGFydHMgYXJlIGNyZWF0ZWQgZnJvbVxuICogVGVtcGxhdGVQYXJ0cy5cbiAqL1xudHlwZSBUZW1wbGF0ZVBhcnQgPVxuICB8IENoaWxkVGVtcGxhdGVQYXJ0XG4gIHwgQXR0cmlidXRlVGVtcGxhdGVQYXJ0XG4gIHwgRWxlbWVudFRlbXBsYXRlUGFydFxuICB8IENvbW1lbnRUZW1wbGF0ZVBhcnQ7XG5cbmV4cG9ydCB0eXBlIFBhcnQgPVxuICB8IENoaWxkUGFydFxuICB8IEF0dHJpYnV0ZVBhcnRcbiAgfCBQcm9wZXJ0eVBhcnRcbiAgfCBCb29sZWFuQXR0cmlidXRlUGFydFxuICB8IEVsZW1lbnRQYXJ0XG4gIHwgRXZlbnRQYXJ0O1xuXG5leHBvcnQgdHlwZSB7Q2hpbGRQYXJ0fTtcbmNsYXNzIENoaWxkUGFydCBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgcmVhZG9ubHkgdHlwZSA9IENISUxEX1BBUlQ7XG4gIHJlYWRvbmx5IG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gIF8kY29tbWl0dGVkVmFsdWU6IHVua25vd24gPSBub3RoaW5nO1xuICAvKiogQGludGVybmFsICovXG4gIF9fZGlyZWN0aXZlPzogRGlyZWN0aXZlO1xuICAvKiogQGludGVybmFsICovXG4gIF8kc3RhcnROb2RlOiBDaGlsZE5vZGU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRlbmROb2RlOiBDaGlsZE5vZGUgfCBudWxsO1xuICBwcml2YXRlIF90ZXh0U2FuaXRpemVyOiBWYWx1ZVNhbml0aXplciB8IHVuZGVmaW5lZDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHBhcmVudDogRGlzY29ubmVjdGFibGUgfCB1bmRlZmluZWQ7XG4gIC8qKlxuICAgKiBDb25uZWN0aW9uIHN0YXRlIGZvciBSb290UGFydHMgb25seSAoaS5lLiBDaGlsZFBhcnQgd2l0aG91dCBfJHBhcmVudFxuICAgKiByZXR1cm5lZCBmcm9tIHRvcC1sZXZlbCBgcmVuZGVyYCkuIFRoaXMgZmllbGQgaXMgdW51c2VkIG90aGVyd2lzZS4gVGhlXG4gICAqIGludGVudGlvbiB3b3VsZCBiZSBjbGVhcmVyIGlmIHdlIG1hZGUgYFJvb3RQYXJ0YCBhIHN1YmNsYXNzIG9mIGBDaGlsZFBhcnRgXG4gICAqIHdpdGggdGhpcyBmaWVsZCAoYW5kIGEgZGlmZmVyZW50IF8kaXNDb25uZWN0ZWQgZ2V0dGVyKSwgYnV0IHRoZSBzdWJjbGFzc1xuICAgKiBjYXVzZWQgYSBwZXJmIHJlZ3Jlc3Npb24sIHBvc3NpYmx5IGR1ZSB0byBtYWtpbmcgY2FsbCBzaXRlcyBwb2x5bW9ycGhpYy5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBfX2lzQ29ubmVjdGVkOiBib29sZWFuO1xuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgLy8gQ2hpbGRQYXJ0cyB0aGF0IGFyZSBub3QgYXQgdGhlIHJvb3Qgc2hvdWxkIGFsd2F5cyBiZSBjcmVhdGVkIHdpdGggYVxuICAgIC8vIHBhcmVudDsgb25seSBSb290Q2hpbGROb2RlJ3Mgd29uJ3QsIHNvIHRoZXkgcmV0dXJuIHRoZSBsb2NhbCBpc0Nvbm5lY3RlZFxuICAgIC8vIHN0YXRlXG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQ/Ll8kaXNDb25uZWN0ZWQgPz8gdGhpcy5fX2lzQ29ubmVjdGVkO1xuICB9XG5cbiAgLy8gVGhlIGZvbGxvd2luZyBmaWVsZHMgd2lsbCBiZSBwYXRjaGVkIG9udG8gQ2hpbGRQYXJ0cyB3aGVuIHJlcXVpcmVkIGJ5XG4gIC8vIEFzeW5jRGlyZWN0aXZlXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPiA9IHVuZGVmaW5lZDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJG5vdGlmeUNvbm5lY3Rpb25DaGFuZ2VkPyhcbiAgICBpc0Nvbm5lY3RlZDogYm9vbGVhbixcbiAgICByZW1vdmVGcm9tUGFyZW50PzogYm9vbGVhbixcbiAgICBmcm9tPzogbnVtYmVyXG4gICk6IHZvaWQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRyZXBhcmVudERpc2Nvbm5lY3RhYmxlcz8ocGFyZW50OiBEaXNjb25uZWN0YWJsZSk6IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgc3RhcnROb2RlOiBDaGlsZE5vZGUsXG4gICAgZW5kTm9kZTogQ2hpbGROb2RlIHwgbnVsbCxcbiAgICBwYXJlbnQ6IFRlbXBsYXRlSW5zdGFuY2UgfCBDaGlsZFBhcnQgfCB1bmRlZmluZWQsXG4gICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICB0aGlzLl8kc3RhcnROb2RlID0gc3RhcnROb2RlO1xuICAgIHRoaXMuXyRlbmROb2RlID0gZW5kTm9kZTtcbiAgICB0aGlzLl8kcGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgLy8gTm90ZSBfX2lzQ29ubmVjdGVkIGlzIG9ubHkgZXZlciBhY2Nlc3NlZCBvbiBSb290UGFydHMgKGkuZS4gd2hlbiB0aGVyZSBpc1xuICAgIC8vIG5vIF8kcGFyZW50KTsgdGhlIHZhbHVlIG9uIGEgbm9uLXJvb3QtcGFydCBpcyBcImRvbid0IGNhcmVcIiwgYnV0IGNoZWNraW5nXG4gICAgLy8gZm9yIHBhcmVudCB3b3VsZCBiZSBtb3JlIGNvZGVcbiAgICB0aGlzLl9faXNDb25uZWN0ZWQgPSBvcHRpb25zPy5pc0Nvbm5lY3RlZCA/PyB0cnVlO1xuICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgIC8vIEV4cGxpY2l0bHkgaW5pdGlhbGl6ZSBmb3IgY29uc2lzdGVudCBjbGFzcyBzaGFwZS5cbiAgICAgIHRoaXMuX3RleHRTYW5pdGl6ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBwYXJlbnQgbm9kZSBpbnRvIHdoaWNoIHRoZSBwYXJ0IHJlbmRlcnMgaXRzIGNvbnRlbnQuXG4gICAqXG4gICAqIEEgQ2hpbGRQYXJ0J3MgY29udGVudCBjb25zaXN0cyBvZiBhIHJhbmdlIG9mIGFkamFjZW50IGNoaWxkIG5vZGVzIG9mXG4gICAqIGAucGFyZW50Tm9kZWAsIHBvc3NpYmx5IGJvcmRlcmVkIGJ5ICdtYXJrZXIgbm9kZXMnIChgLnN0YXJ0Tm9kZWAgYW5kXG4gICAqIGAuZW5kTm9kZWApLlxuICAgKlxuICAgKiAtIElmIGJvdGggYC5zdGFydE5vZGVgIGFuZCBgLmVuZE5vZGVgIGFyZSBub24tbnVsbCwgdGhlbiB0aGUgcGFydCdzIGNvbnRlbnRcbiAgICogY29uc2lzdHMgb2YgYWxsIHNpYmxpbmdzIGJldHdlZW4gYC5zdGFydE5vZGVgIGFuZCBgLmVuZE5vZGVgLCBleGNsdXNpdmVseS5cbiAgICpcbiAgICogLSBJZiBgLnN0YXJ0Tm9kZWAgaXMgbm9uLW51bGwgYnV0IGAuZW5kTm9kZWAgaXMgbnVsbCwgdGhlbiB0aGUgcGFydCdzXG4gICAqIGNvbnRlbnQgY29uc2lzdHMgb2YgYWxsIHNpYmxpbmdzIGZvbGxvd2luZyBgLnN0YXJ0Tm9kZWAsIHVwIHRvIGFuZFxuICAgKiBpbmNsdWRpbmcgdGhlIGxhc3QgY2hpbGQgb2YgYC5wYXJlbnROb2RlYC4gSWYgYC5lbmROb2RlYCBpcyBub24tbnVsbCwgdGhlblxuICAgKiBgLnN0YXJ0Tm9kZWAgd2lsbCBhbHdheXMgYmUgbm9uLW51bGwuXG4gICAqXG4gICAqIC0gSWYgYm90aCBgLmVuZE5vZGVgIGFuZCBgLnN0YXJ0Tm9kZWAgYXJlIG51bGwsIHRoZW4gdGhlIHBhcnQncyBjb250ZW50XG4gICAqIGNvbnNpc3RzIG9mIGFsbCBjaGlsZCBub2RlcyBvZiBgLnBhcmVudE5vZGVgLlxuICAgKi9cbiAgZ2V0IHBhcmVudE5vZGUoKTogTm9kZSB7XG4gICAgbGV0IHBhcmVudE5vZGU6IE5vZGUgPSB3cmFwKHRoaXMuXyRzdGFydE5vZGUpLnBhcmVudE5vZGUhO1xuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuXyRwYXJlbnQ7XG4gICAgaWYgKFxuICAgICAgcGFyZW50ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHBhcmVudE5vZGU/Lm5vZGVUeXBlID09PSAxMSAvKiBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UICovXG4gICAgKSB7XG4gICAgICAvLyBJZiB0aGUgcGFyZW50Tm9kZSBpcyBhIERvY3VtZW50RnJhZ21lbnQsIGl0IG1heSBiZSBiZWNhdXNlIHRoZSBET00gaXNcbiAgICAgIC8vIHN0aWxsIGluIHRoZSBjbG9uZWQgZnJhZ21lbnQgZHVyaW5nIGluaXRpYWwgcmVuZGVyOyBpZiBzbywgZ2V0IHRoZSByZWFsXG4gICAgICAvLyBwYXJlbnROb2RlIHRoZSBwYXJ0IHdpbGwgYmUgY29tbWl0dGVkIGludG8gYnkgYXNraW5nIHRoZSBwYXJlbnQuXG4gICAgICBwYXJlbnROb2RlID0gKHBhcmVudCBhcyBDaGlsZFBhcnQgfCBUZW1wbGF0ZUluc3RhbmNlKS5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gcGFyZW50Tm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcGFydCdzIGxlYWRpbmcgbWFya2VyIG5vZGUsIGlmIGFueS4gU2VlIGAucGFyZW50Tm9kZWAgZm9yIG1vcmVcbiAgICogaW5mb3JtYXRpb24uXG4gICAqL1xuICBnZXQgc3RhcnROb2RlKCk6IE5vZGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fJHN0YXJ0Tm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcGFydCdzIHRyYWlsaW5nIG1hcmtlciBub2RlLCBpZiBhbnkuIFNlZSBgLnBhcmVudE5vZGVgIGZvciBtb3JlXG4gICAqIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgZ2V0IGVuZE5vZGUoKTogTm9kZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl8kZW5kTm9kZTtcbiAgfVxuXG4gIF8kc2V0VmFsdWUodmFsdWU6IHVua25vd24sIGRpcmVjdGl2ZVBhcmVudDogRGlyZWN0aXZlUGFyZW50ID0gdGhpcyk6IHZvaWQge1xuICAgIGlmIChERVZfTU9ERSAmJiB0aGlzLnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFRoaXMgXFxgQ2hpbGRQYXJ0XFxgIGhhcyBubyBcXGBwYXJlbnROb2RlXFxgIGFuZCB0aGVyZWZvcmUgY2Fubm90IGFjY2VwdCBhIHZhbHVlLiBUaGlzIGxpa2VseSBtZWFucyB0aGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBwYXJ0IHdhcyBtYW5pcHVsYXRlZCBpbiBhbiB1bnN1cHBvcnRlZCB3YXkgb3V0c2lkZSBvZiBMaXQncyBjb250cm9sIHN1Y2ggdGhhdCB0aGUgcGFydCdzIG1hcmtlciBub2RlcyB3ZXJlIGVqZWN0ZWQgZnJvbSBET00uIEZvciBleGFtcGxlLCBzZXR0aW5nIHRoZSBlbGVtZW50J3MgXFxgaW5uZXJIVE1MXFxgIG9yIFxcYHRleHRDb250ZW50XFxgIGNhbiBkbyB0aGlzLmBcbiAgICAgICk7XG4gICAgfVxuICAgIHZhbHVlID0gcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCB2YWx1ZSwgZGlyZWN0aXZlUGFyZW50KTtcbiAgICBpZiAoaXNQcmltaXRpdmUodmFsdWUpKSB7XG4gICAgICAvLyBOb24tcmVuZGVyaW5nIGNoaWxkIHZhbHVlcy4gSXQncyBpbXBvcnRhbnQgdGhhdCB0aGVzZSBkbyBub3QgcmVuZGVyXG4gICAgICAvLyBlbXB0eSB0ZXh0IG5vZGVzIHRvIGF2b2lkIGlzc3VlcyB3aXRoIHByZXZlbnRpbmcgZGVmYXVsdCA8c2xvdD5cbiAgICAgIC8vIGZhbGxiYWNrIGNvbnRlbnQuXG4gICAgICBpZiAodmFsdWUgPT09IG5vdGhpbmcgfHwgdmFsdWUgPT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgaWYgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAhPT0gbm90aGluZykge1xuICAgICAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgICAgICBraW5kOiAnY29tbWl0IG5vdGhpbmcgdG8gY2hpbGQnLFxuICAgICAgICAgICAgICBzdGFydDogdGhpcy5fJHN0YXJ0Tm9kZSxcbiAgICAgICAgICAgICAgZW5kOiB0aGlzLl8kZW5kTm9kZSxcbiAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLl8kcGFyZW50LFxuICAgICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLl8kY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBub3RoaW5nO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSAhPT0gdGhpcy5fJGNvbW1pdHRlZFZhbHVlICYmIHZhbHVlICE9PSBub0NoYW5nZSkge1xuICAgICAgICB0aGlzLl9jb21taXRUZXh0KHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgfSBlbHNlIGlmICgodmFsdWUgYXMgVGVtcGxhdGVSZXN1bHQpWydfJGxpdFR5cGUkJ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fY29tbWl0VGVtcGxhdGVSZXN1bHQodmFsdWUgYXMgVGVtcGxhdGVSZXN1bHQpO1xuICAgIH0gZWxzZSBpZiAoKHZhbHVlIGFzIE5vZGUpLm5vZGVUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChERVZfTU9ERSAmJiB0aGlzLm9wdGlvbnM/Lmhvc3QgPT09IHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2NvbW1pdFRleHQoXG4gICAgICAgICAgYFtwcm9iYWJsZSBtaXN0YWtlOiByZW5kZXJlZCBhIHRlbXBsYXRlJ3MgaG9zdCBpbiBpdHNlbGYgYCArXG4gICAgICAgICAgICBgKGNvbW1vbmx5IGNhdXNlZCBieSB3cml0aW5nIFxcJHt0aGlzfSBpbiBhIHRlbXBsYXRlXWBcbiAgICAgICAgKTtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGBBdHRlbXB0ZWQgdG8gcmVuZGVyIHRoZSB0ZW1wbGF0ZSBob3N0YCxcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBgaW5zaWRlIGl0c2VsZi4gVGhpcyBpcyBhbG1vc3QgYWx3YXlzIGEgbWlzdGFrZSwgYW5kIGluIGRldiBtb2RlIGAsXG4gICAgICAgICAgYHdlIHJlbmRlciBzb21lIHdhcm5pbmcgdGV4dC4gSW4gcHJvZHVjdGlvbiBob3dldmVyLCB3ZSdsbCBgLFxuICAgICAgICAgIGByZW5kZXIgaXQsIHdoaWNoIHdpbGwgdXN1YWxseSByZXN1bHQgaW4gYW4gZXJyb3IsIGFuZCBzb21ldGltZXMgYCxcbiAgICAgICAgICBgaW4gdGhlIGVsZW1lbnQgZGlzYXBwZWFyaW5nIGZyb20gdGhlIERPTS5gXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NvbW1pdE5vZGUodmFsdWUgYXMgTm9kZSk7XG4gICAgfSBlbHNlIGlmIChpc0l0ZXJhYmxlKHZhbHVlKSkge1xuICAgICAgdGhpcy5fY29tbWl0SXRlcmFibGUodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBGYWxsYmFjaywgd2lsbCByZW5kZXIgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvblxuICAgICAgdGhpcy5fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfaW5zZXJ0PFQgZXh0ZW5kcyBOb2RlPihub2RlOiBUKSB7XG4gICAgcmV0dXJuIHdyYXAod3JhcCh0aGlzLl8kc3RhcnROb2RlKS5wYXJlbnROb2RlISkuaW5zZXJ0QmVmb3JlKFxuICAgICAgbm9kZSxcbiAgICAgIHRoaXMuXyRlbmROb2RlXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1pdE5vZGUodmFsdWU6IE5vZGUpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fJGNvbW1pdHRlZFZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgdGhpcy5fJGNsZWFyKCk7XG4gICAgICBpZiAoXG4gICAgICAgIEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUyAmJlxuICAgICAgICBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwgIT09IG5vb3BTYW5pdGl6ZXJcbiAgICAgICkge1xuICAgICAgICBjb25zdCBwYXJlbnROb2RlTmFtZSA9IHRoaXMuXyRzdGFydE5vZGUucGFyZW50Tm9kZT8ubm9kZU5hbWU7XG4gICAgICAgIGlmIChwYXJlbnROb2RlTmFtZSA9PT0gJ1NUWUxFJyB8fCBwYXJlbnROb2RlTmFtZSA9PT0gJ1NDUklQVCcpIHtcbiAgICAgICAgICBsZXQgbWVzc2FnZSA9ICdGb3JiaWRkZW4nO1xuICAgICAgICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgICAgICAgaWYgKHBhcmVudE5vZGVOYW1lID09PSAnU1RZTEUnKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGBMaXQgZG9lcyBub3Qgc3VwcG9ydCBiaW5kaW5nIGluc2lkZSBzdHlsZSBub2Rlcy4gYCArXG4gICAgICAgICAgICAgICAgYFRoaXMgaXMgYSBzZWN1cml0eSByaXNrLCBhcyBzdHlsZSBpbmplY3Rpb24gYXR0YWNrcyBjYW4gYCArXG4gICAgICAgICAgICAgICAgYGV4ZmlsdHJhdGUgZGF0YSBhbmQgc3Bvb2YgVUlzLiBgICtcbiAgICAgICAgICAgICAgICBgQ29uc2lkZXIgaW5zdGVhZCB1c2luZyBjc3NcXGAuLi5cXGAgbGl0ZXJhbHMgYCArXG4gICAgICAgICAgICAgICAgYHRvIGNvbXBvc2Ugc3R5bGVzLCBhbmQgZG8gZHluYW1pYyBzdHlsaW5nIHdpdGggYCArXG4gICAgICAgICAgICAgICAgYGNzcyBjdXN0b20gcHJvcGVydGllcywgOjpwYXJ0cywgPHNsb3Q+cywgYCArXG4gICAgICAgICAgICAgICAgYGFuZCBieSBtdXRhdGluZyB0aGUgRE9NIHJhdGhlciB0aGFuIHN0eWxlc2hlZXRzLmA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtZXNzYWdlID1cbiAgICAgICAgICAgICAgICBgTGl0IGRvZXMgbm90IHN1cHBvcnQgYmluZGluZyBpbnNpZGUgc2NyaXB0IG5vZGVzLiBgICtcbiAgICAgICAgICAgICAgICBgVGhpcyBpcyBhIHNlY3VyaXR5IHJpc2ssIGFzIGl0IGNvdWxkIGFsbG93IGFyYml0cmFyeSBgICtcbiAgICAgICAgICAgICAgICBgY29kZSBleGVjdXRpb24uYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICdjb21taXQgbm9kZScsXG4gICAgICAgICAgc3RhcnQ6IHRoaXMuXyRzdGFydE5vZGUsXG4gICAgICAgICAgcGFyZW50OiB0aGlzLl8kcGFyZW50LFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gdGhpcy5faW5zZXJ0KHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb21taXRUZXh0KHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgLy8gSWYgdGhlIGNvbW1pdHRlZCB2YWx1ZSBpcyBhIHByaW1pdGl2ZSBpdCBtZWFucyB3ZSBjYWxsZWQgX2NvbW1pdFRleHQgb25cbiAgICAvLyB0aGUgcHJldmlvdXMgcmVuZGVyLCBhbmQgd2Uga25vdyB0aGF0IHRoaXMuXyRzdGFydE5vZGUubmV4dFNpYmxpbmcgaXMgYVxuICAgIC8vIFRleHQgbm9kZS4gV2UgY2FuIG5vdyBqdXN0IHJlcGxhY2UgdGhlIHRleHQgY29udGVudCAoLmRhdGEpIG9mIHRoZSBub2RlLlxuICAgIGlmIChcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAhPT0gbm90aGluZyAmJlxuICAgICAgaXNQcmltaXRpdmUodGhpcy5fJGNvbW1pdHRlZFZhbHVlKVxuICAgICkge1xuICAgICAgY29uc3Qgbm9kZSA9IHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkubmV4dFNpYmxpbmcgYXMgVGV4dDtcbiAgICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgICAgaWYgKHRoaXMuX3RleHRTYW5pdGl6ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuX3RleHRTYW5pdGl6ZXIgPSBjcmVhdGVTYW5pdGl6ZXIobm9kZSwgJ2RhdGEnLCAncHJvcGVydHknKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZSA9IHRoaXMuX3RleHRTYW5pdGl6ZXIodmFsdWUpO1xuICAgICAgfVxuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAnY29tbWl0IHRleHQnLFxuICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICAgIChub2RlIGFzIFRleHQpLmRhdGEgPSB2YWx1ZSBhcyBzdHJpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgICAgY29uc3QgdGV4dE5vZGUgPSBkLmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICAgICAgdGhpcy5fY29tbWl0Tm9kZSh0ZXh0Tm9kZSk7XG4gICAgICAgIC8vIFdoZW4gc2V0dGluZyB0ZXh0IGNvbnRlbnQsIGZvciBzZWN1cml0eSBwdXJwb3NlcyBpdCBtYXR0ZXJzIGEgbG90XG4gICAgICAgIC8vIHdoYXQgdGhlIHBhcmVudCBpcy4gRm9yIGV4YW1wbGUsIDxzdHlsZT4gYW5kIDxzY3JpcHQ+IG5lZWQgdG8gYmVcbiAgICAgICAgLy8gaGFuZGxlZCB3aXRoIGNhcmUsIHdoaWxlIDxzcGFuPiBkb2VzIG5vdC4gU28gZmlyc3Qgd2UgbmVlZCB0byBwdXQgYVxuICAgICAgICAvLyB0ZXh0IG5vZGUgaW50byB0aGUgZG9jdW1lbnQsIHRoZW4gd2UgY2FuIHNhbml0aXplIGl0cyBjb250ZW50LlxuICAgICAgICBpZiAodGhpcy5fdGV4dFNhbml0aXplciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5fdGV4dFNhbml0aXplciA9IGNyZWF0ZVNhbml0aXplcih0ZXh0Tm9kZSwgJ2RhdGEnLCAncHJvcGVydHknKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZSA9IHRoaXMuX3RleHRTYW5pdGl6ZXIodmFsdWUpO1xuICAgICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAgICBraW5kOiAnY29tbWl0IHRleHQnLFxuICAgICAgICAgICAgbm9kZTogdGV4dE5vZGUsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgdGV4dE5vZGUuZGF0YSA9IHZhbHVlIGFzIHN0cmluZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NvbW1pdE5vZGUoZC5jcmVhdGVUZXh0Tm9kZSh2YWx1ZSBhcyBzdHJpbmcpKTtcbiAgICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgICAga2luZDogJ2NvbW1pdCB0ZXh0JyxcbiAgICAgICAgICAgIG5vZGU6IHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkubmV4dFNpYmxpbmcgYXMgVGV4dCxcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1pdFRlbXBsYXRlUmVzdWx0KFxuICAgIHJlc3VsdDogVGVtcGxhdGVSZXN1bHQgfCBDb21waWxlZFRlbXBsYXRlUmVzdWx0XG4gICk6IHZvaWQge1xuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgY29uc3Qge3ZhbHVlcywgWydfJGxpdFR5cGUkJ106IHR5cGV9ID0gcmVzdWx0O1xuICAgIC8vIElmICRsaXRUeXBlJCBpcyBhIG51bWJlciwgcmVzdWx0IGlzIGEgcGxhaW4gVGVtcGxhdGVSZXN1bHQgYW5kIHdlIGdldFxuICAgIC8vIHRoZSB0ZW1wbGF0ZSBmcm9tIHRoZSB0ZW1wbGF0ZSBjYWNoZS4gSWYgbm90LCByZXN1bHQgaXMgYVxuICAgIC8vIENvbXBpbGVkVGVtcGxhdGVSZXN1bHQgYW5kIF8kbGl0VHlwZSQgaXMgYSBDb21waWxlZFRlbXBsYXRlIGFuZCB3ZSBuZWVkXG4gICAgLy8gdG8gY3JlYXRlIHRoZSA8dGVtcGxhdGU+IGVsZW1lbnQgdGhlIGZpcnN0IHRpbWUgd2Ugc2VlIGl0LlxuICAgIGNvbnN0IHRlbXBsYXRlOiBUZW1wbGF0ZSB8IENvbXBpbGVkVGVtcGxhdGUgPVxuICAgICAgdHlwZW9mIHR5cGUgPT09ICdudW1iZXInXG4gICAgICAgID8gdGhpcy5fJGdldFRlbXBsYXRlKHJlc3VsdCBhcyBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQpXG4gICAgICAgIDogKHR5cGUuZWwgPT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgKHR5cGUuZWwgPSBUZW1wbGF0ZS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICB0cnVzdEZyb21UZW1wbGF0ZVN0cmluZyh0eXBlLmgsIHR5cGUuaFswXSksXG4gICAgICAgICAgICAgIHRoaXMub3B0aW9uc1xuICAgICAgICAgICAgKSksXG4gICAgICAgICAgdHlwZSk7XG5cbiAgICBpZiAoKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBUZW1wbGF0ZUluc3RhbmNlKT8uXyR0ZW1wbGF0ZSA9PT0gdGVtcGxhdGUpIHtcbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ3RlbXBsYXRlIHVwZGF0aW5nJyxcbiAgICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgICBpbnN0YW5jZTogdGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIFRlbXBsYXRlSW5zdGFuY2UsXG4gICAgICAgICAgcGFydHM6ICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgVGVtcGxhdGVJbnN0YW5jZSkuXyRwYXJ0cyxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgdmFsdWVzLFxuICAgICAgICB9KTtcbiAgICAgICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgVGVtcGxhdGVJbnN0YW5jZSkuX3VwZGF0ZSh2YWx1ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlIGFzIFRlbXBsYXRlLCB0aGlzKTtcbiAgICAgIGNvbnN0IGZyYWdtZW50ID0gaW5zdGFuY2UuX2Nsb25lKHRoaXMub3B0aW9ucyk7XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBpbnN0YW50aWF0ZWQnLFxuICAgICAgICAgIHRlbXBsYXRlLFxuICAgICAgICAgIGluc3RhbmNlLFxuICAgICAgICAgIHBhcnRzOiBpbnN0YW5jZS5fJHBhcnRzLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICB2YWx1ZXMsXG4gICAgICAgIH0pO1xuICAgICAgaW5zdGFuY2UuX3VwZGF0ZSh2YWx1ZXMpO1xuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAndGVtcGxhdGUgaW5zdGFudGlhdGVkIGFuZCB1cGRhdGVkJyxcbiAgICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgICBpbnN0YW5jZSxcbiAgICAgICAgICBwYXJ0czogaW5zdGFuY2UuXyRwYXJ0cyxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgdmFsdWVzLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXMuX2NvbW1pdE5vZGUoZnJhZ21lbnQpO1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gaW5zdGFuY2U7XG4gICAgfVxuICB9XG5cbiAgLy8gT3ZlcnJpZGRlbiB2aWEgYGxpdEh0bWxQb2x5ZmlsbFN1cHBvcnRgIHRvIHByb3ZpZGUgcGxhdGZvcm0gc3VwcG9ydC5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGdldFRlbXBsYXRlKHJlc3VsdDogVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0KSB7XG4gICAgbGV0IHRlbXBsYXRlID0gdGVtcGxhdGVDYWNoZS5nZXQocmVzdWx0LnN0cmluZ3MpO1xuICAgIGlmICh0ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0ZW1wbGF0ZUNhY2hlLnNldChyZXN1bHQuc3RyaW5ncywgKHRlbXBsYXRlID0gbmV3IFRlbXBsYXRlKHJlc3VsdCkpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tbWl0SXRlcmFibGUodmFsdWU6IEl0ZXJhYmxlPHVua25vd24+KTogdm9pZCB7XG4gICAgLy8gRm9yIGFuIEl0ZXJhYmxlLCB3ZSBjcmVhdGUgYSBuZXcgSW5zdGFuY2VQYXJ0IHBlciBpdGVtLCB0aGVuIHNldCBpdHNcbiAgICAvLyB2YWx1ZSB0byB0aGUgaXRlbS4gVGhpcyBpcyBhIGxpdHRsZSBiaXQgb2Ygb3ZlcmhlYWQgZm9yIGV2ZXJ5IGl0ZW0gaW5cbiAgICAvLyBhbiBJdGVyYWJsZSwgYnV0IGl0IGxldHMgdXMgcmVjdXJzZSBlYXNpbHkgYW5kIGVmZmljaWVudGx5IHVwZGF0ZSBBcnJheXNcbiAgICAvLyBvZiBUZW1wbGF0ZVJlc3VsdHMgdGhhdCB3aWxsIGJlIGNvbW1vbmx5IHJldHVybmVkIGZyb20gZXhwcmVzc2lvbnMgbGlrZTpcbiAgICAvLyBhcnJheS5tYXAoKGkpID0+IGh0bWxgJHtpfWApLCBieSByZXVzaW5nIGV4aXN0aW5nIFRlbXBsYXRlSW5zdGFuY2VzLlxuXG4gICAgLy8gSWYgdmFsdWUgaXMgYW4gYXJyYXksIHRoZW4gdGhlIHByZXZpb3VzIHJlbmRlciB3YXMgb2YgYW5cbiAgICAvLyBpdGVyYWJsZSBhbmQgdmFsdWUgd2lsbCBjb250YWluIHRoZSBDaGlsZFBhcnRzIGZyb20gdGhlIHByZXZpb3VzXG4gICAgLy8gcmVuZGVyLiBJZiB2YWx1ZSBpcyBub3QgYW4gYXJyYXksIGNsZWFyIHRoaXMgcGFydCBhbmQgbWFrZSBhIG5ld1xuICAgIC8vIGFycmF5IGZvciBDaGlsZFBhcnRzLlxuICAgIGlmICghaXNBcnJheSh0aGlzLl8kY29tbWl0dGVkVmFsdWUpKSB7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBbXTtcbiAgICAgIHRoaXMuXyRjbGVhcigpO1xuICAgIH1cblxuICAgIC8vIExldHMgdXMga2VlcCB0cmFjayBvZiBob3cgbWFueSBpdGVtcyB3ZSBzdGFtcGVkIHNvIHdlIGNhbiBjbGVhciBsZWZ0b3ZlclxuICAgIC8vIGl0ZW1zIGZyb20gYSBwcmV2aW91cyByZW5kZXJcbiAgICBjb25zdCBpdGVtUGFydHMgPSB0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgQ2hpbGRQYXJ0W107XG4gICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgbGV0IGl0ZW1QYXJ0OiBDaGlsZFBhcnQgfCB1bmRlZmluZWQ7XG5cbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdmFsdWUpIHtcbiAgICAgIGlmIChwYXJ0SW5kZXggPT09IGl0ZW1QYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gSWYgbm8gZXhpc3RpbmcgcGFydCwgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgICAvLyBUT0RPIChqdXN0aW5mYWduYW5pKTogdGVzdCBwZXJmIGltcGFjdCBvZiBhbHdheXMgY3JlYXRpbmcgdHdvIHBhcnRzXG4gICAgICAgIC8vIGluc3RlYWQgb2Ygc2hhcmluZyBwYXJ0cyBiZXR3ZWVuIG5vZGVzXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9saXQvbGl0L2lzc3Vlcy8xMjY2XG4gICAgICAgIGl0ZW1QYXJ0cy5wdXNoKFxuICAgICAgICAgIChpdGVtUGFydCA9IG5ldyBDaGlsZFBhcnQoXG4gICAgICAgICAgICB0aGlzLl9pbnNlcnQoY3JlYXRlTWFya2VyKCkpLFxuICAgICAgICAgICAgdGhpcy5faW5zZXJ0KGNyZWF0ZU1hcmtlcigpKSxcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gUmV1c2UgYW4gZXhpc3RpbmcgcGFydFxuICAgICAgICBpdGVtUGFydCA9IGl0ZW1QYXJ0c1twYXJ0SW5kZXhdO1xuICAgICAgfVxuICAgICAgaXRlbVBhcnQuXyRzZXRWYWx1ZShpdGVtKTtcbiAgICAgIHBhcnRJbmRleCsrO1xuICAgIH1cblxuICAgIGlmIChwYXJ0SW5kZXggPCBpdGVtUGFydHMubGVuZ3RoKSB7XG4gICAgICAvLyBpdGVtUGFydHMgYWx3YXlzIGhhdmUgZW5kIG5vZGVzXG4gICAgICB0aGlzLl8kY2xlYXIoXG4gICAgICAgIGl0ZW1QYXJ0ICYmIHdyYXAoaXRlbVBhcnQuXyRlbmROb2RlISkubmV4dFNpYmxpbmcsXG4gICAgICAgIHBhcnRJbmRleFxuICAgICAgKTtcbiAgICAgIC8vIFRydW5jYXRlIHRoZSBwYXJ0cyBhcnJheSBzbyBfdmFsdWUgcmVmbGVjdHMgdGhlIGN1cnJlbnQgc3RhdGVcbiAgICAgIGl0ZW1QYXJ0cy5sZW5ndGggPSBwYXJ0SW5kZXg7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIG5vZGVzIGNvbnRhaW5lZCB3aXRoaW4gdGhpcyBQYXJ0IGZyb20gdGhlIERPTS5cbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0IFN0YXJ0IG5vZGUgdG8gY2xlYXIgZnJvbSwgZm9yIGNsZWFyaW5nIGEgc3Vic2V0IG9mIHRoZSBwYXJ0J3NcbiAgICogICAgIERPTSAodXNlZCB3aGVuIHRydW5jYXRpbmcgaXRlcmFibGVzKVxuICAgKiBAcGFyYW0gZnJvbSAgV2hlbiBgc3RhcnRgIGlzIHNwZWNpZmllZCwgdGhlIGluZGV4IHdpdGhpbiB0aGUgaXRlcmFibGUgZnJvbVxuICAgKiAgICAgd2hpY2ggQ2hpbGRQYXJ0cyBhcmUgYmVpbmcgcmVtb3ZlZCwgdXNlZCBmb3IgZGlzY29ubmVjdGluZyBkaXJlY3RpdmVzIGluXG4gICAqICAgICB0aG9zZSBQYXJ0cy5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfJGNsZWFyKFxuICAgIHN0YXJ0OiBDaGlsZE5vZGUgfCBudWxsID0gd3JhcCh0aGlzLl8kc3RhcnROb2RlKS5uZXh0U2libGluZyxcbiAgICBmcm9tPzogbnVtYmVyXG4gICkge1xuICAgIHRoaXMuXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZD8uKGZhbHNlLCB0cnVlLCBmcm9tKTtcbiAgICB3aGlsZSAoc3RhcnQgJiYgc3RhcnQgIT09IHRoaXMuXyRlbmROb2RlKSB7XG4gICAgICBjb25zdCBuID0gd3JhcChzdGFydCEpLm5leHRTaWJsaW5nO1xuICAgICAgKHdyYXAoc3RhcnQhKSBhcyBFbGVtZW50KS5yZW1vdmUoKTtcbiAgICAgIHN0YXJ0ID0gbjtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIFJvb3RQYXJ0J3MgYGlzQ29ubmVjdGVkYC4gTm90ZSB0aGF0IHRoaXMgbWV0aG9kXG4gICAqIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBvbiBgUm9vdFBhcnRgcyAodGhlIGBDaGlsZFBhcnRgIHJldHVybmVkIGZyb20gYVxuICAgKiB0b3AtbGV2ZWwgYHJlbmRlcigpYCBjYWxsKS4gSXQgaGFzIG5vIGVmZmVjdCBvbiBub24tcm9vdCBDaGlsZFBhcnRzLlxuICAgKiBAcGFyYW0gaXNDb25uZWN0ZWQgV2hldGhlciB0byBzZXRcbiAgICogQGludGVybmFsXG4gICAqL1xuICBzZXRDb25uZWN0ZWQoaXNDb25uZWN0ZWQ6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5fJHBhcmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9faXNDb25uZWN0ZWQgPSBpc0Nvbm5lY3RlZDtcbiAgICAgIHRoaXMuXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZD8uKGlzQ29ubmVjdGVkKTtcbiAgICB9IGVsc2UgaWYgKERFVl9NT0RFKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdwYXJ0LnNldENvbm5lY3RlZCgpIG1heSBvbmx5IGJlIGNhbGxlZCBvbiBhICcgK1xuICAgICAgICAgICdSb290UGFydCByZXR1cm5lZCBmcm9tIHJlbmRlcigpLidcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQSB0b3AtbGV2ZWwgYENoaWxkUGFydGAgcmV0dXJuZWQgZnJvbSBgcmVuZGVyYCB0aGF0IG1hbmFnZXMgdGhlIGNvbm5lY3RlZFxuICogc3RhdGUgb2YgYEFzeW5jRGlyZWN0aXZlYHMgY3JlYXRlZCB0aHJvdWdob3V0IHRoZSB0cmVlIGJlbG93IGl0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJvb3RQYXJ0IGV4dGVuZHMgQ2hpbGRQYXJ0IHtcbiAgLyoqXG4gICAqIFNldHMgdGhlIGNvbm5lY3Rpb24gc3RhdGUgZm9yIGBBc3luY0RpcmVjdGl2ZWBzIGNvbnRhaW5lZCB3aXRoaW4gdGhpcyByb290XG4gICAqIENoaWxkUGFydC5cbiAgICpcbiAgICogbGl0LWh0bWwgZG9lcyBub3QgYXV0b21hdGljYWxseSBtb25pdG9yIHRoZSBjb25uZWN0ZWRuZXNzIG9mIERPTSByZW5kZXJlZDtcbiAgICogYXMgc3VjaCwgaXQgaXMgdGhlIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSBjYWxsZXIgdG8gYHJlbmRlcmAgdG8gZW5zdXJlIHRoYXRcbiAgICogYHBhcnQuc2V0Q29ubmVjdGVkKGZhbHNlKWAgaXMgY2FsbGVkIGJlZm9yZSB0aGUgcGFydCBvYmplY3QgaXMgcG90ZW50aWFsbHlcbiAgICogZGlzY2FyZGVkLCB0byBlbnN1cmUgdGhhdCBgQXN5bmNEaXJlY3RpdmVgcyBoYXZlIGEgY2hhbmNlIHRvIGRpc3Bvc2Ugb2ZcbiAgICogYW55IHJlc291cmNlcyBiZWluZyBoZWxkLiBJZiBhIGBSb290UGFydGAgdGhhdCB3YXMgcHJldmlvdXNseVxuICAgKiBkaXNjb25uZWN0ZWQgaXMgc3Vic2VxdWVudGx5IHJlLWNvbm5lY3RlZCAoYW5kIGl0cyBgQXN5bmNEaXJlY3RpdmVgcyBzaG91bGRcbiAgICogcmUtY29ubmVjdCksIGBzZXRDb25uZWN0ZWQodHJ1ZSlgIHNob3VsZCBiZSBjYWxsZWQuXG4gICAqXG4gICAqIEBwYXJhbSBpc0Nvbm5lY3RlZCBXaGV0aGVyIGRpcmVjdGl2ZXMgd2l0aGluIHRoaXMgdHJlZSBzaG91bGQgYmUgY29ubmVjdGVkXG4gICAqIG9yIG5vdFxuICAgKi9cbiAgc2V0Q29ubmVjdGVkKGlzQ29ubmVjdGVkOiBib29sZWFuKTogdm9pZDtcbn1cblxuZXhwb3J0IHR5cGUge0F0dHJpYnV0ZVBhcnR9O1xuY2xhc3MgQXR0cmlidXRlUGFydCBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgcmVhZG9ubHkgdHlwZTpcbiAgICB8IHR5cGVvZiBBVFRSSUJVVEVfUEFSVFxuICAgIHwgdHlwZW9mIFBST1BFUlRZX1BBUlRcbiAgICB8IHR5cGVvZiBCT09MRUFOX0FUVFJJQlVURV9QQVJUXG4gICAgfCB0eXBlb2YgRVZFTlRfUEFSVCA9IEFUVFJJQlVURV9QQVJUO1xuICByZWFkb25seSBlbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICByZWFkb25seSBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBJZiB0aGlzIGF0dHJpYnV0ZSBwYXJ0IHJlcHJlc2VudHMgYW4gaW50ZXJwb2xhdGlvbiwgdGhpcyBjb250YWlucyB0aGVcbiAgICogc3RhdGljIHN0cmluZ3Mgb2YgdGhlIGludGVycG9sYXRpb24uIEZvciBzaW5nbGUtdmFsdWUsIGNvbXBsZXRlIGJpbmRpbmdzLFxuICAgKiB0aGlzIGlzIHVuZGVmaW5lZC5cbiAgICovXG4gIHJlYWRvbmx5IHN0cmluZ3M/OiBSZWFkb25seUFycmF5PHN0cmluZz47XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRjb21taXR0ZWRWYWx1ZTogdW5rbm93biB8IEFycmF5PHVua25vd24+ID0gbm90aGluZztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfX2RpcmVjdGl2ZXM/OiBBcnJheTxEaXJlY3RpdmUgfCB1bmRlZmluZWQ+O1xuICAvKiogQGludGVybmFsICovXG4gIF8kcGFyZW50OiBEaXNjb25uZWN0YWJsZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+ID0gdW5kZWZpbmVkO1xuXG4gIHByb3RlY3RlZCBfc2FuaXRpemVyOiBWYWx1ZVNhbml0aXplciB8IHVuZGVmaW5lZDtcblxuICBnZXQgdGFnTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnRhZ05hbWU7XG4gIH1cblxuICAvLyBTZWUgY29tbWVudCBpbiBEaXNjb25uZWN0YWJsZSBpbnRlcmZhY2UgZm9yIHdoeSB0aGlzIGlzIGEgZ2V0dGVyXG4gIGdldCBfJGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl8kcGFyZW50Ll8kaXNDb25uZWN0ZWQ7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3RyaW5nczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LFxuICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUsXG4gICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5fJHBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIGlmIChzdHJpbmdzLmxlbmd0aCA+IDIgfHwgc3RyaW5nc1swXSAhPT0gJycgfHwgc3RyaW5nc1sxXSAhPT0gJycpIHtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IG5ldyBBcnJheShzdHJpbmdzLmxlbmd0aCAtIDEpLmZpbGwobmV3IFN0cmluZygpKTtcbiAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IG5vdGhpbmc7XG4gICAgfVxuICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgIHRoaXMuX3Nhbml0aXplciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgdGhpcyBwYXJ0IGJ5IHJlc29sdmluZyB0aGUgdmFsdWUgZnJvbSBwb3NzaWJseSBtdWx0aXBsZVxuICAgKiB2YWx1ZXMgYW5kIHN0YXRpYyBzdHJpbmdzIGFuZCBjb21taXR0aW5nIGl0IHRvIHRoZSBET00uXG4gICAqIElmIHRoaXMgcGFydCBpcyBzaW5nbGUtdmFsdWVkLCBgdGhpcy5fc3RyaW5nc2Agd2lsbCBiZSB1bmRlZmluZWQsIGFuZCB0aGVcbiAgICogbWV0aG9kIHdpbGwgYmUgY2FsbGVkIHdpdGggYSBzaW5nbGUgdmFsdWUgYXJndW1lbnQuIElmIHRoaXMgcGFydCBpc1xuICAgKiBtdWx0aS12YWx1ZSwgYHRoaXMuX3N0cmluZ3NgIHdpbGwgYmUgZGVmaW5lZCwgYW5kIHRoZSBtZXRob2QgaXMgY2FsbGVkXG4gICAqIHdpdGggdGhlIHZhbHVlIGFycmF5IG9mIHRoZSBwYXJ0J3Mgb3duaW5nIFRlbXBsYXRlSW5zdGFuY2UsIGFuZCBhbiBvZmZzZXRcbiAgICogaW50byB0aGUgdmFsdWUgYXJyYXkgZnJvbSB3aGljaCB0aGUgdmFsdWVzIHNob3VsZCBiZSByZWFkLlxuICAgKiBUaGlzIG1ldGhvZCBpcyBvdmVybG9hZGVkIHRoaXMgd2F5IHRvIGVsaW1pbmF0ZSBzaG9ydC1saXZlZCBhcnJheSBzbGljZXNcbiAgICogb2YgdGhlIHRlbXBsYXRlIGluc3RhbmNlIHZhbHVlcywgYW5kIGFsbG93IGEgZmFzdC1wYXRoIGZvciBzaW5nbGUtdmFsdWVkXG4gICAqIHBhcnRzLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHBhcnQgdmFsdWUsIG9yIGFuIGFycmF5IG9mIHZhbHVlcyBmb3IgbXVsdGktdmFsdWVkIHBhcnRzXG4gICAqIEBwYXJhbSB2YWx1ZUluZGV4IHRoZSBpbmRleCB0byBzdGFydCByZWFkaW5nIHZhbHVlcyBmcm9tLiBgdW5kZWZpbmVkYCBmb3JcbiAgICogICBzaW5nbGUtdmFsdWVkIHBhcnRzXG4gICAqIEBwYXJhbSBub0NvbW1pdCBjYXVzZXMgdGhlIHBhcnQgdG8gbm90IGNvbW1pdCBpdHMgdmFsdWUgdG8gdGhlIERPTS4gVXNlZFxuICAgKiAgIGluIGh5ZHJhdGlvbiB0byBwcmltZSBhdHRyaWJ1dGUgcGFydHMgd2l0aCB0aGVpciBmaXJzdC1yZW5kZXJlZCB2YWx1ZSxcbiAgICogICBidXQgbm90IHNldCB0aGUgYXR0cmlidXRlLCBhbmQgaW4gU1NSIHRvIG5vLW9wIHRoZSBET00gb3BlcmF0aW9uIGFuZFxuICAgKiAgIGNhcHR1cmUgdGhlIHZhbHVlIGZvciBzZXJpYWxpemF0aW9uLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF8kc2V0VmFsdWUoXG4gICAgdmFsdWU6IHVua25vd24gfCBBcnJheTx1bmtub3duPixcbiAgICBkaXJlY3RpdmVQYXJlbnQ6IERpcmVjdGl2ZVBhcmVudCA9IHRoaXMsXG4gICAgdmFsdWVJbmRleD86IG51bWJlcixcbiAgICBub0NvbW1pdD86IGJvb2xlYW5cbiAgKSB7XG4gICAgY29uc3Qgc3RyaW5ncyA9IHRoaXMuc3RyaW5ncztcblxuICAgIC8vIFdoZXRoZXIgYW55IG9mIHRoZSB2YWx1ZXMgaGFzIGNoYW5nZWQsIGZvciBkaXJ0eS1jaGVja2luZ1xuICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcblxuICAgIGlmIChzdHJpbmdzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFNpbmdsZS12YWx1ZSBiaW5kaW5nIGNhc2VcbiAgICAgIHZhbHVlID0gcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCB2YWx1ZSwgZGlyZWN0aXZlUGFyZW50LCAwKTtcbiAgICAgIGNoYW5nZSA9XG4gICAgICAgICFpc1ByaW1pdGl2ZSh2YWx1ZSkgfHxcbiAgICAgICAgKHZhbHVlICE9PSB0aGlzLl8kY29tbWl0dGVkVmFsdWUgJiYgdmFsdWUgIT09IG5vQ2hhbmdlKTtcbiAgICAgIGlmIChjaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gdmFsdWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEludGVycG9sYXRpb24gY2FzZVxuICAgICAgY29uc3QgdmFsdWVzID0gdmFsdWUgYXMgQXJyYXk8dW5rbm93bj47XG4gICAgICB2YWx1ZSA9IHN0cmluZ3NbMF07XG5cbiAgICAgIGxldCBpLCB2O1xuICAgICAgZm9yIChpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIHYgPSByZXNvbHZlRGlyZWN0aXZlKHRoaXMsIHZhbHVlc1t2YWx1ZUluZGV4ISArIGldLCBkaXJlY3RpdmVQYXJlbnQsIGkpO1xuXG4gICAgICAgIGlmICh2ID09PSBub0NoYW5nZSkge1xuICAgICAgICAgIC8vIElmIHRoZSB1c2VyLXByb3ZpZGVkIHZhbHVlIGlzIGBub0NoYW5nZWAsIHVzZSB0aGUgcHJldmlvdXMgdmFsdWVcbiAgICAgICAgICB2ID0gKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBBcnJheTx1bmtub3duPilbaV07XG4gICAgICAgIH1cbiAgICAgICAgY2hhbmdlIHx8PVxuICAgICAgICAgICFpc1ByaW1pdGl2ZSh2KSB8fCB2ICE9PSAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIEFycmF5PHVua25vd24+KVtpXTtcbiAgICAgICAgaWYgKHYgPT09IG5vdGhpbmcpIHtcbiAgICAgICAgICB2YWx1ZSA9IG5vdGhpbmc7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgIT09IG5vdGhpbmcpIHtcbiAgICAgICAgICB2YWx1ZSArPSAodiA/PyAnJykgKyBzdHJpbmdzW2kgKyAxXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSBhbHdheXMgcmVjb3JkIGVhY2ggdmFsdWUsIGV2ZW4gaWYgb25lIGlzIGBub3RoaW5nYCwgZm9yIGZ1dHVyZVxuICAgICAgICAvLyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgICAgICAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIEFycmF5PHVua25vd24+KVtpXSA9IHY7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjaGFuZ2UgJiYgIW5vQ29tbWl0KSB7XG4gICAgICB0aGlzLl9jb21taXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29tbWl0VmFsdWUodmFsdWU6IHVua25vd24pIHtcbiAgICBpZiAodmFsdWUgPT09IG5vdGhpbmcpIHtcbiAgICAgICh3cmFwKHRoaXMuZWxlbWVudCkgYXMgRWxlbWVudCkucmVtb3ZlQXR0cmlidXRlKHRoaXMubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgICAgaWYgKHRoaXMuX3Nhbml0aXplciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5fc2FuaXRpemVyID0gc2FuaXRpemVyRmFjdG9yeUludGVybmFsKFxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICAgICAgJ2F0dHJpYnV0ZSdcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlID0gdGhpcy5fc2FuaXRpemVyKHZhbHVlID8/ICcnKTtcbiAgICAgIH1cbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ2NvbW1pdCBhdHRyaWJ1dGUnLFxuICAgICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICAgICh3cmFwKHRoaXMuZWxlbWVudCkgYXMgRWxlbWVudCkuc2V0QXR0cmlidXRlKFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgICh2YWx1ZSA/PyAnJykgYXMgc3RyaW5nXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgdHlwZSB7UHJvcGVydHlQYXJ0fTtcbmNsYXNzIFByb3BlcnR5UGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xuICBvdmVycmlkZSByZWFkb25seSB0eXBlID0gUFJPUEVSVFlfUEFSVDtcblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIF9jb21taXRWYWx1ZSh2YWx1ZTogdW5rbm93bikge1xuICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgIGlmICh0aGlzLl9zYW5pdGl6ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLl9zYW5pdGl6ZXIgPSBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwoXG4gICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgICAncHJvcGVydHknXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB2YWx1ZSA9IHRoaXMuX3Nhbml0aXplcih2YWx1ZSk7XG4gICAgfVxuICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICBraW5kOiAnY29tbWl0IHByb3BlcnR5JyxcbiAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICB9KTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICh0aGlzLmVsZW1lbnQgYXMgYW55KVt0aGlzLm5hbWVdID0gdmFsdWUgPT09IG5vdGhpbmcgPyB1bmRlZmluZWQgOiB2YWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSB7Qm9vbGVhbkF0dHJpYnV0ZVBhcnR9O1xuY2xhc3MgQm9vbGVhbkF0dHJpYnV0ZVBhcnQgZXh0ZW5kcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkgdHlwZSA9IEJPT0xFQU5fQVRUUklCVVRFX1BBUlQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfY29tbWl0VmFsdWUodmFsdWU6IHVua25vd24pIHtcbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ2NvbW1pdCBib29sZWFuIGF0dHJpYnV0ZScsXG4gICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICB2YWx1ZTogISEodmFsdWUgJiYgdmFsdWUgIT09IG5vdGhpbmcpLFxuICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICB9KTtcbiAgICAod3JhcCh0aGlzLmVsZW1lbnQpIGFzIEVsZW1lbnQpLnRvZ2dsZUF0dHJpYnV0ZShcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgICEhdmFsdWUgJiYgdmFsdWUgIT09IG5vdGhpbmdcbiAgICApO1xuICB9XG59XG5cbnR5cGUgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zID0gRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCAmXG4gIFBhcnRpYWw8QWRkRXZlbnRMaXN0ZW5lck9wdGlvbnM+O1xuXG4vKipcbiAqIEFuIEF0dHJpYnV0ZVBhcnQgdGhhdCBtYW5hZ2VzIGFuIGV2ZW50IGxpc3RlbmVyIHZpYSBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lci5cbiAqXG4gKiBUaGlzIHBhcnQgd29ya3MgYnkgYWRkaW5nIGl0c2VsZiBhcyB0aGUgZXZlbnQgbGlzdGVuZXIgb24gYW4gZWxlbWVudCwgdGhlblxuICogZGVsZWdhdGluZyB0byB0aGUgdmFsdWUgcGFzc2VkIHRvIGl0LiBUaGlzIHJlZHVjZXMgdGhlIG51bWJlciBvZiBjYWxscyB0b1xuICogYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIgaWYgdGhlIGxpc3RlbmVyIGNoYW5nZXMgZnJlcXVlbnRseSwgc3VjaCBhcyB3aGVuIGFuXG4gKiBpbmxpbmUgZnVuY3Rpb24gaXMgdXNlZCBhcyBhIGxpc3RlbmVyLlxuICpcbiAqIEJlY2F1c2UgZXZlbnQgb3B0aW9ucyBhcmUgcGFzc2VkIHdoZW4gYWRkaW5nIGxpc3RlbmVycywgd2UgbXVzdCB0YWtlIGNhc2VcbiAqIHRvIGFkZCBhbmQgcmVtb3ZlIHRoZSBwYXJ0IGFzIGEgbGlzdGVuZXIgd2hlbiB0aGUgZXZlbnQgb3B0aW9ucyBjaGFuZ2UuXG4gKi9cbmV4cG9ydCB0eXBlIHtFdmVudFBhcnR9O1xuY2xhc3MgRXZlbnRQYXJ0IGV4dGVuZHMgQXR0cmlidXRlUGFydCB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IHR5cGUgPSBFVkVOVF9QQVJUO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzdHJpbmdzOiBSZWFkb25seUFycmF5PHN0cmluZz4sXG4gICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSxcbiAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MsIHBhcmVudCwgb3B0aW9ucyk7XG5cbiAgICBpZiAoREVWX01PREUgJiYgdGhpcy5zdHJpbmdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEEgXFxgPCR7ZWxlbWVudC5sb2NhbE5hbWV9PlxcYCBoYXMgYSBcXGBAJHtuYW1lfT0uLi5cXGAgbGlzdGVuZXIgd2l0aCBgICtcbiAgICAgICAgICAnaW52YWxpZCBjb250ZW50LiBFdmVudCBsaXN0ZW5lcnMgaW4gdGVtcGxhdGVzIG11c3QgaGF2ZSBleGFjdGx5ICcgK1xuICAgICAgICAgICdvbmUgZXhwcmVzc2lvbiBhbmQgbm8gc3Vycm91bmRpbmcgdGV4dC4nXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIEV2ZW50UGFydCBkb2VzIG5vdCB1c2UgdGhlIGJhc2UgXyRzZXRWYWx1ZS9fcmVzb2x2ZVZhbHVlIGltcGxlbWVudGF0aW9uXG4gIC8vIHNpbmNlIHRoZSBkaXJ0eSBjaGVja2luZyBpcyBtb3JlIGNvbXBsZXhcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfJHNldFZhbHVlKFxuICAgIG5ld0xpc3RlbmVyOiB1bmtub3duLFxuICAgIGRpcmVjdGl2ZVBhcmVudDogRGlyZWN0aXZlUGFyZW50ID0gdGhpc1xuICApIHtcbiAgICBuZXdMaXN0ZW5lciA9XG4gICAgICByZXNvbHZlRGlyZWN0aXZlKHRoaXMsIG5ld0xpc3RlbmVyLCBkaXJlY3RpdmVQYXJlbnQsIDApID8/IG5vdGhpbmc7XG4gICAgaWYgKG5ld0xpc3RlbmVyID09PSBub0NoYW5nZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBvbGRMaXN0ZW5lciA9IHRoaXMuXyRjb21taXR0ZWRWYWx1ZTtcblxuICAgIC8vIElmIHRoZSBuZXcgdmFsdWUgaXMgbm90aGluZyBvciBhbnkgb3B0aW9ucyBjaGFuZ2Ugd2UgaGF2ZSB0byByZW1vdmUgdGhlXG4gICAgLy8gcGFydCBhcyBhIGxpc3RlbmVyLlxuICAgIGNvbnN0IHNob3VsZFJlbW92ZUxpc3RlbmVyID1cbiAgICAgIChuZXdMaXN0ZW5lciA9PT0gbm90aGluZyAmJiBvbGRMaXN0ZW5lciAhPT0gbm90aGluZykgfHxcbiAgICAgIChuZXdMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLmNhcHR1cmUgIT09XG4gICAgICAgIChvbGRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLmNhcHR1cmUgfHxcbiAgICAgIChuZXdMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLm9uY2UgIT09XG4gICAgICAgIChvbGRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLm9uY2UgfHxcbiAgICAgIChuZXdMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLnBhc3NpdmUgIT09XG4gICAgICAgIChvbGRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLnBhc3NpdmU7XG5cbiAgICAvLyBJZiB0aGUgbmV3IHZhbHVlIGlzIG5vdCBub3RoaW5nIGFuZCB3ZSByZW1vdmVkIHRoZSBsaXN0ZW5lciwgd2UgaGF2ZVxuICAgIC8vIHRvIGFkZCB0aGUgcGFydCBhcyBhIGxpc3RlbmVyLlxuICAgIGNvbnN0IHNob3VsZEFkZExpc3RlbmVyID1cbiAgICAgIG5ld0xpc3RlbmVyICE9PSBub3RoaW5nICYmXG4gICAgICAob2xkTGlzdGVuZXIgPT09IG5vdGhpbmcgfHwgc2hvdWxkUmVtb3ZlTGlzdGVuZXIpO1xuXG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICdjb21taXQgZXZlbnQgbGlzdGVuZXInLFxuICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgdmFsdWU6IG5ld0xpc3RlbmVyLFxuICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgIHJlbW92ZUxpc3RlbmVyOiBzaG91bGRSZW1vdmVMaXN0ZW5lcixcbiAgICAgICAgYWRkTGlzdGVuZXI6IHNob3VsZEFkZExpc3RlbmVyLFxuICAgICAgICBvbGRMaXN0ZW5lcixcbiAgICAgIH0pO1xuICAgIGlmIChzaG91bGRSZW1vdmVMaXN0ZW5lcikge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgdGhpcyxcbiAgICAgICAgb2xkTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoc2hvdWxkQWRkTGlzdGVuZXIpIHtcbiAgICAgIC8vIEJld2FyZTogSUUxMSBhbmQgQ2hyb21lIDQxIGRvbid0IGxpa2UgdXNpbmcgdGhlIGxpc3RlbmVyIGFzIHRoZVxuICAgICAgLy8gb3B0aW9ucyBvYmplY3QuIEZpZ3VyZSBvdXQgaG93IHRvIGRlYWwgdy8gdGhpcyBpbiBJRTExIC0gbWF5YmVcbiAgICAgIC8vIHBhdGNoIGFkZEV2ZW50TGlzdGVuZXI/XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB0aGlzLFxuICAgICAgICBuZXdMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnNcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IG5ld0xpc3RlbmVyO1xuICB9XG5cbiAgaGFuZGxlRXZlbnQoZXZlbnQ6IEV2ZW50KSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZS5jYWxsKHRoaXMub3B0aW9ucz8uaG9zdCA/PyB0aGlzLmVsZW1lbnQsIGV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBFdmVudExpc3RlbmVyT2JqZWN0KS5oYW5kbGVFdmVudChldmVudCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIHtFbGVtZW50UGFydH07XG5jbGFzcyBFbGVtZW50UGFydCBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgcmVhZG9ubHkgdHlwZSA9IEVMRU1FTlRfUEFSVDtcblxuICAvKiogQGludGVybmFsICovXG4gIF9fZGlyZWN0aXZlPzogRGlyZWN0aXZlO1xuXG4gIC8vIFRoaXMgaXMgdG8gZW5zdXJlIHRoYXQgZXZlcnkgUGFydCBoYXMgYSBfJGNvbW1pdHRlZFZhbHVlXG4gIF8kY29tbWl0dGVkVmFsdWU6IHVuZGVmaW5lZDtcblxuICAvKiogQGludGVybmFsICovXG4gIF8kcGFyZW50ITogRGlzY29ubmVjdGFibGU7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+ID0gdW5kZWZpbmVkO1xuXG4gIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsZW1lbnQ6IEVsZW1lbnQsXG4gICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSxcbiAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHRoaXMuXyRwYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQuXyRpc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIF8kc2V0VmFsdWUodmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ2NvbW1pdCB0byBlbGVtZW50IGJpbmRpbmcnLFxuICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICB9KTtcbiAgICByZXNvbHZlRGlyZWN0aXZlKHRoaXMsIHZhbHVlKTtcbiAgfVxufVxuXG4vKipcbiAqIEVORCBVU0VSUyBTSE9VTEQgTk9UIFJFTFkgT04gVEhJUyBPQkpFQ1QuXG4gKlxuICogUHJpdmF0ZSBleHBvcnRzIGZvciB1c2UgYnkgb3RoZXIgTGl0IHBhY2thZ2VzLCBub3QgaW50ZW5kZWQgZm9yIHVzZSBieVxuICogZXh0ZXJuYWwgdXNlcnMuXG4gKlxuICogV2UgY3VycmVudGx5IGRvIG5vdCBtYWtlIGEgbWFuZ2xlZCByb2xsdXAgYnVpbGQgb2YgdGhlIGxpdC1zc3IgY29kZS4gSW4gb3JkZXJcbiAqIHRvIGtlZXAgYSBudW1iZXIgb2YgKG90aGVyd2lzZSBwcml2YXRlKSB0b3AtbGV2ZWwgZXhwb3J0cyBtYW5nbGVkIGluIHRoZVxuICogY2xpZW50IHNpZGUgY29kZSwgd2UgZXhwb3J0IGEgXyRMSCBvYmplY3QgY29udGFpbmluZyB0aG9zZSBtZW1iZXJzIChvclxuICogaGVscGVyIG1ldGhvZHMgZm9yIGFjY2Vzc2luZyBwcml2YXRlIGZpZWxkcyBvZiB0aG9zZSBtZW1iZXJzKSwgYW5kIHRoZW5cbiAqIHJlLWV4cG9ydCB0aGVtIGZvciB1c2UgaW4gbGl0LXNzci4gVGhpcyBrZWVwcyBsaXQtc3NyIGFnbm9zdGljIHRvIHdoZXRoZXIgdGhlXG4gKiBjbGllbnQtc2lkZSBjb2RlIGlzIGJlaW5nIHVzZWQgaW4gYGRldmAgbW9kZSBvciBgcHJvZGAgbW9kZS5cbiAqXG4gKiBUaGlzIGhhcyBhIHVuaXF1ZSBuYW1lLCB0byBkaXNhbWJpZ3VhdGUgaXQgZnJvbSBwcml2YXRlIGV4cG9ydHMgaW5cbiAqIGxpdC1lbGVtZW50LCB3aGljaCByZS1leHBvcnRzIGFsbCBvZiBsaXQtaHRtbC5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgXyRMSCA9IHtcbiAgLy8gVXNlZCBpbiBsaXQtc3NyXG4gIF9ib3VuZEF0dHJpYnV0ZVN1ZmZpeDogYm91bmRBdHRyaWJ1dGVTdWZmaXgsXG4gIF9tYXJrZXI6IG1hcmtlcixcbiAgX21hcmtlck1hdGNoOiBtYXJrZXJNYXRjaCxcbiAgX0hUTUxfUkVTVUxUOiBIVE1MX1JFU1VMVCxcbiAgX2dldFRlbXBsYXRlSHRtbDogZ2V0VGVtcGxhdGVIdG1sLFxuICAvLyBVc2VkIGluIHRlc3RzIGFuZCBwcml2YXRlLXNzci1zdXBwb3J0XG4gIF9UZW1wbGF0ZUluc3RhbmNlOiBUZW1wbGF0ZUluc3RhbmNlLFxuICBfaXNJdGVyYWJsZTogaXNJdGVyYWJsZSxcbiAgX3Jlc29sdmVEaXJlY3RpdmU6IHJlc29sdmVEaXJlY3RpdmUsXG4gIF9DaGlsZFBhcnQ6IENoaWxkUGFydCxcbiAgX0F0dHJpYnV0ZVBhcnQ6IEF0dHJpYnV0ZVBhcnQsXG4gIF9Cb29sZWFuQXR0cmlidXRlUGFydDogQm9vbGVhbkF0dHJpYnV0ZVBhcnQsXG4gIF9FdmVudFBhcnQ6IEV2ZW50UGFydCxcbiAgX1Byb3BlcnR5UGFydDogUHJvcGVydHlQYXJ0LFxuICBfRWxlbWVudFBhcnQ6IEVsZW1lbnRQYXJ0LFxufTtcblxuLy8gQXBwbHkgcG9seWZpbGxzIGlmIGF2YWlsYWJsZVxuY29uc3QgcG9seWZpbGxTdXBwb3J0ID0gREVWX01PREVcbiAgPyBnbG9iYWwubGl0SHRtbFBvbHlmaWxsU3VwcG9ydERldk1vZGVcbiAgOiBnbG9iYWwubGl0SHRtbFBvbHlmaWxsU3VwcG9ydDtcbnBvbHlmaWxsU3VwcG9ydD8uKFRlbXBsYXRlLCBDaGlsZFBhcnQpO1xuXG4vLyBJTVBPUlRBTlQ6IGRvIG5vdCBjaGFuZ2UgdGhlIHByb3BlcnR5IG5hbWUgb3IgdGhlIGFzc2lnbm1lbnQgZXhwcmVzc2lvbi5cbi8vIFRoaXMgbGluZSB3aWxsIGJlIHVzZWQgaW4gcmVnZXhlcyB0byBzZWFyY2ggZm9yIGxpdC1odG1sIHVzYWdlLlxuKGdsb2JhbC5saXRIdG1sVmVyc2lvbnMgPz89IFtdKS5wdXNoKCczLjIuMScpO1xuaWYgKERFVl9NT0RFICYmIGdsb2JhbC5saXRIdG1sVmVyc2lvbnMubGVuZ3RoID4gMSkge1xuICBpc3N1ZVdhcm5pbmchKFxuICAgICdtdWx0aXBsZS12ZXJzaW9ucycsXG4gICAgYE11bHRpcGxlIHZlcnNpb25zIG9mIExpdCBsb2FkZWQuIGAgK1xuICAgICAgYExvYWRpbmcgbXVsdGlwbGUgdmVyc2lvbnMgaXMgbm90IHJlY29tbWVuZGVkLmBcbiAgKTtcbn1cblxuLyoqXG4gKiBSZW5kZXJzIGEgdmFsdWUsIHVzdWFsbHkgYSBsaXQtaHRtbCBUZW1wbGF0ZVJlc3VsdCwgdG8gdGhlIGNvbnRhaW5lci5cbiAqXG4gKiBUaGlzIGV4YW1wbGUgcmVuZGVycyB0aGUgdGV4dCBcIkhlbGxvLCBab2UhXCIgaW5zaWRlIGEgcGFyYWdyYXBoIHRhZywgYXBwZW5kaW5nXG4gKiBpdCB0byB0aGUgY29udGFpbmVyIGBkb2N1bWVudC5ib2R5YC5cbiAqXG4gKiBgYGBqc1xuICogaW1wb3J0IHtodG1sLCByZW5kZXJ9IGZyb20gJ2xpdCc7XG4gKlxuICogY29uc3QgbmFtZSA9IFwiWm9lXCI7XG4gKiByZW5kZXIoaHRtbGA8cD5IZWxsbywgJHtuYW1lfSE8L3A+YCwgZG9jdW1lbnQuYm9keSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gdmFsdWUgQW55IFtyZW5kZXJhYmxlXG4gKiAgIHZhbHVlXShodHRwczovL2xpdC5kZXYvZG9jcy90ZW1wbGF0ZXMvZXhwcmVzc2lvbnMvI2NoaWxkLWV4cHJlc3Npb25zKSxcbiAqICAgdHlwaWNhbGx5IGEge0BsaW5rY29kZSBUZW1wbGF0ZVJlc3VsdH0gY3JlYXRlZCBieSBldmFsdWF0aW5nIGEgdGVtcGxhdGUgdGFnXG4gKiAgIGxpa2Uge0BsaW5rY29kZSBodG1sfSBvciB7QGxpbmtjb2RlIHN2Z30uXG4gKiBAcGFyYW0gY29udGFpbmVyIEEgRE9NIGNvbnRhaW5lciB0byByZW5kZXIgdG8uIFRoZSBmaXJzdCByZW5kZXIgd2lsbCBhcHBlbmRcbiAqICAgdGhlIHJlbmRlcmVkIHZhbHVlIHRvIHRoZSBjb250YWluZXIsIGFuZCBzdWJzZXF1ZW50IHJlbmRlcnMgd2lsbFxuICogICBlZmZpY2llbnRseSB1cGRhdGUgdGhlIHJlbmRlcmVkIHZhbHVlIGlmIHRoZSBzYW1lIHJlc3VsdCB0eXBlIHdhc1xuICogICBwcmV2aW91c2x5IHJlbmRlcmVkIHRoZXJlLlxuICogQHBhcmFtIG9wdGlvbnMgU2VlIHtAbGlua2NvZGUgUmVuZGVyT3B0aW9uc30gZm9yIG9wdGlvbnMgZG9jdW1lbnRhdGlvbi5cbiAqIEBzZWVcbiAqIHtAbGluayBodHRwczovL2xpdC5kZXYvZG9jcy9saWJyYXJpZXMvc3RhbmRhbG9uZS10ZW1wbGF0ZXMvI3JlbmRlcmluZy1saXQtaHRtbC10ZW1wbGF0ZXN8IFJlbmRlcmluZyBMaXQgSFRNTCBUZW1wbGF0ZXN9XG4gKi9cbmV4cG9ydCBjb25zdCByZW5kZXIgPSAoXG4gIHZhbHVlOiB1bmtub3duLFxuICBjb250YWluZXI6IEhUTUxFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCxcbiAgb3B0aW9ucz86IFJlbmRlck9wdGlvbnNcbik6IFJvb3RQYXJ0ID0+IHtcbiAgaWYgKERFVl9NT0RFICYmIGNvbnRhaW5lciA9PSBudWxsKSB7XG4gICAgLy8gR2l2ZSBhIGNsZWFyZXIgZXJyb3IgbWVzc2FnZSB0aGFuXG4gICAgLy8gICAgIFVuY2F1Z2h0IFR5cGVFcnJvcjogQ2Fubm90IHJlYWQgcHJvcGVydGllcyBvZiBudWxsIChyZWFkaW5nXG4gICAgLy8gICAgICdfJGxpdFBhcnQkJylcbiAgICAvLyB3aGljaCByZWFkcyBsaWtlIGFuIGludGVybmFsIExpdCBlcnJvci5cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBUaGUgY29udGFpbmVyIHRvIHJlbmRlciBpbnRvIG1heSBub3QgYmUgJHtjb250YWluZXJ9YCk7XG4gIH1cbiAgY29uc3QgcmVuZGVySWQgPSBERVZfTU9ERSA/IGRlYnVnTG9nUmVuZGVySWQrKyA6IDA7XG4gIGNvbnN0IHBhcnRPd25lck5vZGUgPSBvcHRpb25zPy5yZW5kZXJCZWZvcmUgPz8gY29udGFpbmVyO1xuICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBsZXQgcGFydDogQ2hpbGRQYXJ0ID0gKHBhcnRPd25lck5vZGUgYXMgYW55KVsnXyRsaXRQYXJ0JCddO1xuICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgZGVidWdMb2dFdmVudCh7XG4gICAgICBraW5kOiAnYmVnaW4gcmVuZGVyJyxcbiAgICAgIGlkOiByZW5kZXJJZCxcbiAgICAgIHZhbHVlLFxuICAgICAgY29udGFpbmVyLFxuICAgICAgb3B0aW9ucyxcbiAgICAgIHBhcnQsXG4gICAgfSk7XG4gIGlmIChwYXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBlbmROb2RlID0gb3B0aW9ucz8ucmVuZGVyQmVmb3JlID8/IG51bGw7XG4gICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIChwYXJ0T3duZXJOb2RlIGFzIGFueSlbJ18kbGl0UGFydCQnXSA9IHBhcnQgPSBuZXcgQ2hpbGRQYXJ0KFxuICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgZW5kTm9kZSksXG4gICAgICBlbmROb2RlLFxuICAgICAgdW5kZWZpbmVkLFxuICAgICAgb3B0aW9ucyA/PyB7fVxuICAgICk7XG4gIH1cbiAgcGFydC5fJHNldFZhbHVlKHZhbHVlKTtcbiAgZGVidWdMb2dFdmVudCAmJlxuICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAga2luZDogJ2VuZCByZW5kZXInLFxuICAgICAgaWQ6IHJlbmRlcklkLFxuICAgICAgdmFsdWUsXG4gICAgICBjb250YWluZXIsXG4gICAgICBvcHRpb25zLFxuICAgICAgcGFydCxcbiAgICB9KTtcbiAgcmV0dXJuIHBhcnQgYXMgUm9vdFBhcnQ7XG59O1xuXG5pZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gIHJlbmRlci5zZXRTYW5pdGl6ZXIgPSBzZXRTYW5pdGl6ZXI7XG4gIHJlbmRlci5jcmVhdGVTYW5pdGl6ZXIgPSBjcmVhdGVTYW5pdGl6ZXI7XG4gIGlmIChERVZfTU9ERSkge1xuICAgIHJlbmRlci5fdGVzdE9ubHlDbGVhclNhbml0aXplckZhY3RvcnlEb05vdENhbGxPckVsc2UgPVxuICAgICAgX3Rlc3RPbmx5Q2xlYXJTYW5pdGl6ZXJGYWN0b3J5RG9Ob3RDYWxsT3JFbHNlO1xuICB9XG59XG4iLCAiLyoqIFJlc3VsdCBhbGxvd3MgZWFzaWVyIGhhbmRsaW5nIG9mIHJldHVybmluZyBlaXRoZXIgYW4gZXJyb3Igb3IgYSB2YWx1ZSBmcm9tIGFcbiAqIGZ1bmN0aW9uLiAqL1xuZXhwb3J0IHR5cGUgUmVzdWx0PFQ+ID0geyBvazogdHJ1ZTsgdmFsdWU6IFQgfSB8IHsgb2s6IGZhbHNlOyBlcnJvcjogRXJyb3IgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9rPFQ+KHZhbHVlOiBUKTogUmVzdWx0PFQ+IHtcbiAgcmV0dXJuIHsgb2s6IHRydWUsIHZhbHVlOiB2YWx1ZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXJyb3I8VD4odmFsdWU6IHN0cmluZyB8IEVycm9yKTogUmVzdWx0PFQ+IHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IG5ldyBFcnJvcih2YWx1ZSkgfTtcbiAgfVxuICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiB2YWx1ZSB9O1xufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBPcCB9IGZyb20gXCIuLi9vcHMvb3BzXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uL3Jlc3VsdFwiO1xuXG5leHBvcnQgdHlwZSBQb3N0QWN0b25Xb3JrID0gXCJcIiB8IFwicGFpbnRDaGFydFwiIHwgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjtcblxuZXhwb3J0IGludGVyZmFjZSBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yaztcbiAgLy8gVE9ETyAtIERvIHdlIG5lZWQgYSBQb3N0QWN0aW9uRm9jdXM6IG51bWJlciB3aGljaCBwb2ludHMgdG8gdGhlIFRhc2sgd2Ugc2hvdWxkIG1vdmUgdGhlIGZvY3VzIHRvP1xuICB1bmRvOiBib29sZWFuOyAvLyBJZiB0cnVlIGluY2x1ZGUgaW4gdW5kby9yZWRvIGFjdGlvbnMuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+Pjtcbn1cblxuZXhwb3J0IGNsYXNzIE5PT1BBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJEb2VzIG5vdGhpbmdcIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICByZXR1cm4gb2sobmV3IE5PT1BBY3Rpb24oKSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFjdGlvbkZyb21PcCB7XG4gIG5hbWU6IHN0cmluZyA9IFwiQWN0aW9uRnJvbU9wXCI7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkFjdGlvbiBjb25zdHJ1Y3RlZCBkaXJlY3RseSBmcm9tIGFuIE9wLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yaztcbiAgdW5kbzogYm9vbGVhbjtcblxuICBvcDogT3A7XG5cbiAgY29uc3RydWN0b3Iob3A6IE9wLCBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yaywgdW5kbzogYm9vbGVhbikge1xuICAgIHRoaXMucG9zdEFjdGlvbldvcmsgPSBwb3N0QWN0aW9uV29yaztcbiAgICB0aGlzLnVuZG8gPSB1bmRvO1xuICAgIHRoaXMub3AgPSBvcDtcbiAgfVxuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgY29uc3QgcmV0ID0gdGhpcy5vcC5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGV4cGxhbk1haW4ucGxhbiA9IHJldC52YWx1ZS5wbGFuO1xuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG4iLCAiLyoqIE9uZSB2ZXJ0ZXggb2YgYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleCA9IG9iamVjdDtcblxuLyoqIEV2ZXJ5IFZlcnRleCBpbiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgVmVydGljZXMgPSBWZXJ0ZXhbXTtcblxuLyoqIEEgc3Vic2V0IG9mIFZlcnRpY2VzIHJlZmVycmVkIHRvIGJ5IHRoZWlyIGluZGV4IG51bWJlci4gKi9cbmV4cG9ydCB0eXBlIFZlcnRleEluZGljZXMgPSBudW1iZXJbXTtcblxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIHtcbiAgaTogbnVtYmVyO1xuICBqOiBudW1iZXI7XG59XG5cbi8qKiBPbmUgZWRnZSBvZiBhIGdyYXBoLCB3aGljaCBpcyBhIGRpcmVjdGVkIGNvbm5lY3Rpb24gZnJvbSB0aGUgaSd0aCBWZXJ0ZXggdG9cbnRoZSBqJ3RoIFZlcnRleCwgd2hlcmUgdGhlIFZlcnRleCBpcyBzdG9yZWQgaW4gYSBWZXJ0aWNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIERpcmVjdGVkRWRnZSB7XG4gIGk6IG51bWJlciA9IDA7XG4gIGo6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoaTogbnVtYmVyID0gMCwgajogbnVtYmVyID0gMCkge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGVxdWFsKHJoczogRGlyZWN0ZWRFZGdlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHJocy5pID09PSB0aGlzLmkgJiYgcmhzLmogPT09IHRoaXMuajtcbiAgfVxuXG4gIHRvSlNPTigpOiBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgaTogdGhpcy5pLFxuICAgICAgajogdGhpcy5qLFxuICAgIH07XG4gIH1cbn1cblxuLyoqIEV2ZXJ5IEVnZGUgaW4gYSBncmFwaC4gKi9cbmV4cG9ydCB0eXBlIEVkZ2VzID0gRGlyZWN0ZWRFZGdlW107XG5cbi8qKiBBIGdyYXBoIGlzIGp1c3QgYSBjb2xsZWN0aW9uIG9mIFZlcnRpY2VzIGFuZCBFZGdlcyBiZXR3ZWVuIHRob3NlIHZlcnRpY2VzLiAqL1xuZXhwb3J0IHR5cGUgRGlyZWN0ZWRHcmFwaCA9IHtcbiAgVmVydGljZXM6IFZlcnRpY2VzO1xuICBFZGdlczogRWRnZXM7XG59O1xuXG4vKipcbiBHcm91cHMgdGhlIEVkZ2VzIGJ5IHRoZWlyIGBpYCB2YWx1ZS5cblxuIEBwYXJhbSBlZGdlcyAtIEFsbCB0aGUgRWdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gQHJldHVybnMgQSBtYXAgZnJvbSB0aGUgVmVydGV4IGluZGV4IHRvIGFsbCB0aGUgRWRnZXMgdGhhdCBzdGFydCBhdFxuICAgYXQgdGhhdCBWZXJ0ZXggaW5kZXguXG4gKi9cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjVG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5pKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaSwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKlxuICAgR3JvdXBzIHRoZSBFZGdlcyBieSB0aGVpciBgamAgdmFsdWUuXG4gIFxuICAgQHBhcmFtIGVkZ2VzIC0gQWxsIHRoZSBFZGdlcyBpbiBhIERpcmVjdGVkR3JhcGguXG4gICBAcmV0dXJucyBBIG1hcCBmcm9tIHRoZSBWZXJ0ZXggaW5kZXggdG8gYWxsIHRoZSBFZGdlcyB0aGF0IGVuZCBhdFxuICAgICBhdCB0aGF0IFZlcnRleCBpbmRleC5cbiAgICovXG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5RHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogTWFwPG51bWJlciwgRWRnZXM+ID0+IHtcbiAgY29uc3QgcmV0ID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpO1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGNvbnN0IGFyciA9IHJldC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCB0eXBlIFNyY0FuZERzdFJldHVybiA9IHtcbiAgYnlTcmM6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbiAgYnlEc3Q6IE1hcDxudW1iZXIsIEVkZ2VzPjtcbn07XG5cbmV4cG9ydCBjb25zdCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgPSAoZWRnZXM6IEVkZ2VzKTogU3JjQW5kRHN0UmV0dXJuID0+IHtcbiAgY29uc3QgcmV0ID0ge1xuICAgIGJ5U3JjOiBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCksXG4gICAgYnlEc3Q6IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKSxcbiAgfTtcblxuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBsZXQgYXJyID0gcmV0LmJ5U3JjLmdldChlLmkpIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5ieVNyYy5zZXQoZS5pLCBhcnIpO1xuICAgIGFyciA9IHJldC5ieURzdC5nZXQoZS5qKSB8fCBbXTtcbiAgICBhcnIucHVzaChlKTtcbiAgICByZXQuYnlEc3Quc2V0KGUuaiwgYXJyKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvayB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5cbi8vIE9wZXJhdGlvbnMgb24gUGxhbnMuIE5vdGUgdGhleSBhcmUgcmV2ZXJzaWJsZSwgc28gd2UgY2FuIGhhdmUgYW4gJ3VuZG8nIGxpc3QuXG5cbi8vIEFsc28sIHNvbWUgb3BlcmF0aW9ucyBtaWdodCBoYXZlICdwYXJ0aWFscycsIGkuZS4gcmV0dXJuIGEgbGlzdCBvZiB2YWxpZFxuLy8gb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlIG9wZXJhdGlvbi4gRm9yIGV4YW1wbGUsIGFkZGluZyBhXG4vLyBwcmVkZWNlc3NvciBjb3VsZCBsaXN0IGFsbCB0aGUgVGFza3MgdGhhdCB3b3VsZCBub3QgZm9ybSBhIGxvb3AsIGkuZS4gZXhjbHVkZVxuLy8gYWxsIGRlc2NlbmRlbnRzLCBhbmQgdGhlIFRhc2sgaXRzZWxmLCBmcm9tIHRoZSBsaXN0IG9mIG9wdGlvbnMuXG4vL1xuLy8gKiBDaGFuZ2Ugc3RyaW5nIHZhbHVlIGluIGEgVGFzay5cbi8vICogQ2hhbmdlIGR1cmF0aW9uIHZhbHVlIGluIGEgVGFzay5cbi8vICogSW5zZXJ0IG5ldyBlbXB0eSBUYXNrIGFmdGVyIEluZGV4LlxuLy8gKiBTcGxpdCBhIFRhc2suIChQcmVkZWNlc3NvciB0YWtlcyBhbGwgaW5jb21pbmcgZWRnZXMsIHNvdXJjZSB0YXNrcyBhbGwgb3V0Z29pbmcgZWRnZXMpLlxuLy9cbi8vICogRHVwbGljYXRlIGEgVGFzayAoYWxsIGVkZ2VzIGFyZSBkdXBsaWNhdGVkIGZyb20gdGhlIHNvdXJjZSBUYXNrKS5cbi8vICogRGVsZXRlIHByZWRlY2Vzc29yIHRvIGEgVGFzay5cbi8vICogRGVsZXRlIHN1Y2Nlc3NvciB0byBhIFRhc2suXG4vLyAqIERlbGV0ZSBhIFRhc2suXG5cbi8vIE5lZWQgVW5kby9SZWRvIFN0YWNrcy5cbi8vIFRoZXNlIHJlY29yZCB0aGUgc3ViLW9wcyBmb3IgZWFjaCBsYXJnZSBvcC4gRS5nLiBhbiBpbnNlcnQgdGFzayBvcCBpcyBtYWRlXG4vLyBvZiB0aHJlZSBzdWItb3BzOlxuLy8gICAgMS4gaW5zZXJ0IHRhc2sgaW50byBWZXJ0aWNlcyBhbmQgcmVudW1iZXIgRWRnZXNcbi8vICAgIDIuIEFkZCBlZGdlIGZyb20gU3RhcnQgdG8gTmV3IFRhc2tcbi8vICAgIDMuIEFkZCBlZGdlIGZyb20gTmV3IFRhc2sgdG8gRmluaXNoXG4vL1xuLy8gRWFjaCBzdWItb3A6XG4vLyAgICAxLiBSZWNvcmRzIGFsbCB0aGUgaW5mbyBpdCBuZWVkcyB0byB3b3JrLlxuLy8gICAgMi4gQ2FuIGJlIFwiYXBwbGllZFwiIHRvIGEgUGxhbi5cbi8vICAgIDMuIENhbiBnZW5lcmF0ZSBpdHMgaW52ZXJzZSBzdWItb3AuXG5cbi8vIFRoZSByZXN1bHRzIGZyb20gYXBwbHlpbmcgYSBTdWJPcC4gVGhpcyBpcyB0aGUgb25seSB3YXkgdG8gZ2V0IHRoZSBpbnZlcnNlIG9mXG4vLyBhIFN1Yk9wIHNpbmNlIHRoZSBTdWJPcCBpbnZlcnNlIG1pZ2h0IGRlcGVuZCBvbiB0aGUgc3RhdGUgb2YgdGhlIFBsYW4gYXQgdGhlXG4vLyB0aW1lIHRoZSBTdWJPcCB3YXMgYXBwbGllZC5cbmV4cG9ydCBpbnRlcmZhY2UgU3ViT3BSZXN1bHQge1xuICBwbGFuOiBQbGFuO1xuICBpbnZlcnNlOiBTdWJPcDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdWJPcCB7XG4gIC8vIElmIHRoZSBhcHBseSByZXR1cm5zIGFuIGVycm9yIGl0IGlzIGd1YXJhbnRlZWQgbm90IHRvIGhhdmUgbW9kaWZpZWQgdGhlXG4gIC8vIFBsYW4uXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3BSZXN1bHQge1xuICBwbGFuOiBQbGFuO1xuICBpbnZlcnNlOiBPcDtcbn1cblxuLy8gT3AgYXJlIG9wZXJhdGlvbnMgYXJlIGFwcGxpZWQgdG8gbWFrZSBjaGFuZ2VzIHRvIGEgUGxhbi5cbmV4cG9ydCBjbGFzcyBPcCB7XG4gIHN1Yk9wczogU3ViT3BbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHN1Yk9wczogU3ViT3BbXSkge1xuICAgIHRoaXMuc3ViT3BzID0gc3ViT3BzO1xuICB9XG5cbiAgLy8gUmV2ZXJ0cyBhbGwgU3ViT3BzIHVwIHRvIHRoZSBnaXZlbiBpbmRleC5cbiAgYXBwbHlBbGxJbnZlcnNlU3ViT3BzVG9QbGFuKFxuICAgIHBsYW46IFBsYW4sXG4gICAgaW52ZXJzZVN1Yk9wczogU3ViT3BbXVxuICApOiBSZXN1bHQ8UGxhbj4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW52ZXJzZVN1Yk9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZSA9IGludmVyc2VTdWJPcHNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHBsYW4pO1xuICB9XG5cbiAgLy8gQXBwbGllcyB0aGUgT3AgdG8gYSBQbGFuLlxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8T3BSZXN1bHQ+IHtcbiAgICBjb25zdCBpbnZlcnNlU3ViT3BzOiBTdWJPcFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN1Yk9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZSA9IHRoaXMuc3ViT3BzW2ldLmFwcGx5VG8ocGxhbik7XG4gICAgICBpZiAoIWUub2spIHtcbiAgICAgICAgLy8gUmV2ZXJ0IGFsbCB0aGUgU3ViT3BzIGFwcGxpZWQgdXAgdG8gdGhpcyBwb2ludCB0byBnZXQgdGhlIFBsYW4gYmFjayBpbiBhXG4gICAgICAgIC8vIGdvb2QgcGxhY2UuXG4gICAgICAgIGNvbnN0IHJldmVydEVyciA9IHRoaXMuYXBwbHlBbGxJbnZlcnNlU3ViT3BzVG9QbGFuKHBsYW4sIGludmVyc2VTdWJPcHMpO1xuICAgICAgICBpZiAoIXJldmVydEVyci5vaykge1xuICAgICAgICAgIHJldHVybiByZXZlcnRFcnI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgICBwbGFuID0gZS52YWx1ZS5wbGFuO1xuICAgICAgaW52ZXJzZVN1Yk9wcy51bnNoaWZ0KGUudmFsdWUuaW52ZXJzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiBuZXcgT3AoaW52ZXJzZVN1Yk9wcyksXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQWxsT3BzUmVzdWx0ID0ge1xuICBvcHM6IE9wW107XG4gIHBsYW46IFBsYW47XG59O1xuXG5jb25zdCBhcHBseUFsbEludmVyc2VPcHNUb1BsYW4gPSAoaW52ZXJzZXM6IE9wW10sIHBsYW46IFBsYW4pOiBSZXN1bHQ8UGxhbj4gPT4ge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGludmVyc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gaW52ZXJzZXNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgcGxhbiA9IHJlcy52YWx1ZS5wbGFuO1xuICB9XG5cbiAgcmV0dXJuIG9rKHBsYW4pO1xufTtcblxuLy8gQ29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIGFwcGx5aW5nIG11bHRpcGxlIE9wcyB0byBhIHBsYW4sIHVzZWQgbW9zdGx5IGZvclxuLy8gdGVzdGluZy5cbmV4cG9ydCBjb25zdCBhcHBseUFsbE9wc1RvUGxhbiA9IChcbiAgb3BzOiBPcFtdLFxuICBwbGFuOiBQbGFuXG4pOiBSZXN1bHQ8QWxsT3BzUmVzdWx0PiA9PiB7XG4gIGNvbnN0IGludmVyc2VzOiBPcFtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmVzID0gb3BzW2ldLmFwcGx5VG8ocGxhbik7XG4gICAgaWYgKCFyZXMub2spIHtcbiAgICAgIGNvbnN0IGludmVyc2VSZXMgPSBhcHBseUFsbEludmVyc2VPcHNUb1BsYW4oaW52ZXJzZXMsIHBsYW4pO1xuICAgICAgaWYgKCFpbnZlcnNlUmVzLm9rKSB7XG4gICAgICAgIC8vIFRPRE8gQ2FuIHdlIHdyYXAgdGhlIEVycm9yIGluIGFub3RoZXIgZXJyb3IgdG8gbWFrZSBpdCBjbGVhciB0aGlzXG4gICAgICAgIC8vIGVycm9yIGhhcHBlbmVkIHdoZW4gdHJ5aW5nIHRvIGNsZWFuIHVwIGZyb20gdGhlIHByZXZpb3VzIEVycm9yIHdoZW5cbiAgICAgICAgLy8gdGhlIGFwcGx5KCkgZmFpbGVkLlxuICAgICAgICByZXR1cm4gaW52ZXJzZVJlcztcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIGludmVyc2VzLnVuc2hpZnQocmVzLnZhbHVlLmludmVyc2UpO1xuICAgIHBsYW4gPSByZXMudmFsdWUucGxhbjtcbiAgfVxuXG4gIHJldHVybiBvayh7XG4gICAgb3BzOiBpbnZlcnNlcyxcbiAgICBwbGFuOiBwbGFuLFxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBhcHBseUFsbE9wc1RvUGxhbkFuZFRoZW5JbnZlcnNlID0gKFxuICBvcHM6IE9wW10sXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxBbGxPcHNSZXN1bHQ+ID0+IHtcbiAgY29uc3QgcmVzID0gYXBwbHlBbGxPcHNUb1BsYW4ob3BzLCBwbGFuKTtcbiAgaWYgKCFyZXMub2spIHtcbiAgICByZXR1cm4gcmVzO1xuICB9XG4gIHJldHVybiBhcHBseUFsbE9wc1RvUGxhbihyZXMudmFsdWUub3BzLCByZXMudmFsdWUucGxhbik7XG59O1xuLy8gTm9PcCBpcyBhIG5vLW9wLlxuZXhwb3J0IGZ1bmN0aW9uIE5vT3AoKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtdKTtcbn1cbiIsICIvLyBDaGFuZ2VNZXRyaWNWYWx1ZVxuXG5pbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNEZWZpbml0aW9uIH0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgZXJyb3IsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuXG5leHBvcnQgY2xhc3MgQWRkTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbjtcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbWV0cmljIGtleS5cbiAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24gPSBtZXRyaWNEZWZpbml0aW9uO1xuICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcyA9IHRhc2tNZXRyaWNWYWx1ZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAocGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gYWxyZWFkeSBleGlzdHMgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG5cbiAgICBwbGFuLnNldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lLCB0aGlzLm1ldHJpY0RlZmluaXRpb24pO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBhZGQgdGhpcyBtZXRyaWMgYW5kIHNldCBpdCB0byB0aGUgZGVmYXVsdCxcbiAgICAvLyB1bmxlc3MgdGhlcmUgaXMgbWF0Y2hpbmcgZW50cnkgaW4gdGFza01ldHJpY1ZhbHVlcywgaW4gd2hpY2ggY2FzZSB3ZSB3aWxsXG4gICAgLy8gdXNlIHRoYXQgdmFsdWUsIGkuZS4gdGhpcyBBZGRNZXRyaWNTdWJPcCBpcyBhY3R1YWxseSBhIHJldmVydCBvZiBhXG4gICAgLy8gRGVsZXRlTWV0cmljU3ViT3AuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICB0YXNrLnNldE1ldHJpYyhcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuZ2V0KGluZGV4KSB8fCB0aGlzLm1ldHJpY0RlZmluaXRpb24uZGVmYXVsdFxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVNZXRyaWNTdWJPcCh0aGlzLm5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBtZXRyaWNEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG5cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBUaGUgbWV0cmljIHdpdGggbmFtZSAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYW5kIGNhbid0IGJlIGRlbGV0ZWQuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBUaGUgc3RhdGljIE1ldHJpYyAke3RoaXMubmFtZX0gY2FuJ3QgYmUgZGVsZXRlZC5gKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZnJvbSByZXNvdXJjZSBkZWZpbml0aW9ucy5cbiAgICBwbGFuLmRlbGV0ZU1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcblxuICAgIGNvbnN0IHRhc2tJbmRleFRvRGVsZXRlZE1ldHJpY1ZhbHVlOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gTm93IGxvb2sgYXQgYWxsIFRhc2tzIGFuZCByZW1vdmUgYHRoaXMubmFtZWAgZnJvbSB0aGUgbWV0cmljIHdoaWxlIGFsc29cbiAgICAvLyBidWlsZGluZyB1cCB0aGUgaW5mbyBuZWVkZWQgZm9yIGEgcmV2ZXJ0LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpO1xuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWUuc2V0KGluZGV4LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICB0YXNrLmRlbGV0ZU1ldHJpYyh0aGlzLm5hbWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UobWV0cmljRGVmaW5pdGlvbiwgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWUpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKFxuICAgIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24sXG4gICAgbWV0cmljVmFsdWVzRm9yRGVsZXRlZFJlc291cmNlTmFtZTogTWFwPG51bWJlciwgbnVtYmVyPlxuICApOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBBZGRNZXRyaWNTdWJPcChcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIG1ldHJpY0RlZmluaXRpb24sXG4gICAgICBtZXRyaWNWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VOYW1lXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG9sZE5hbWU6IHN0cmluZztcbiAgbmV3TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9sZE5hbWU6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5vbGROYW1lID0gb2xkTmFtZTtcbiAgICB0aGlzLm5ld05hbWUgPSBuZXdOYW1lO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5ld05hbWUpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld05hbWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgbWV0cmljLmApO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5vbGROYW1lKTtcbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5vbGROYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cbiAgICBpZiAobWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBTdGF0aWMgbWV0cmljICR7dGhpcy5vbGROYW1lfSBjYW4ndCBiZSByZW5hbWVkLmApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5ld05hbWUsIG1ldHJpY0RlZmluaXRpb24pO1xuICAgIHBsYW4uZGVsZXRlTWV0cmljRGVmaW5pdGlvbih0aGlzLm9sZE5hbWUpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCByZW5hbWUgdGhpcyBtZXRyaWMuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMub2xkTmFtZSkgfHwgbWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgICAgdGFzay5zZXRNZXRyaWModGhpcy5uZXdOYW1lLCB2YWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZU1ldHJpYyh0aGlzLm9sZE5hbWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZU1ldHJpY1N1Yk9wKHRoaXMubmV3TmFtZSwgdGhpcy5vbGROYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVXBkYXRlTWV0cmljU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbjtcblxuICAvLyBNYXBzIGFuIGluZGV4IG9mIGEgVGFzayB0byBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gbWV0cmljIGtleS5cbiAgdGFza01ldHJpY1ZhbHVlczogTWFwPG51bWJlciwgbnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpIC8vIFNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIGJ5IGludmVyc2UgYWN0aW9ucy5cbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb24gPSBtZXRyaWNEZWZpbml0aW9uO1xuICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcyA9IHRhc2tNZXRyaWNWYWx1ZXM7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBvbGRNZXRyaWNEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG4gICAgaWYgKG9sZE1ldHJpY0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG4gICAgaWYgKG9sZE1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpIHtcbiAgICAgIHJldHVybiBlcnJvcihgU3RhdGljIG1ldHJpYyAke3RoaXMubmFtZX0gY2FuJ3QgYmUgdXBkYXRlZC5gKTtcbiAgICB9XG5cbiAgICAvLyBSYXRpb25hbGl6ZSBkZWZhdWx0IHNob3VsZCBiZSBpbiBbbWluLCBtYXhdLlxuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0ID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLnJhbmdlLmNsYW1wKFxuICAgICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uLmRlZmF1bHRcbiAgICApO1xuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSwgdGhpcy5tZXRyaWNEZWZpbml0aW9uKTtcblxuICAgIGNvbnN0IHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCB1cGRhdGUgdGhlIG1ldHJpYyB2YWx1ZXMgdG8gcmVmbGVjdCB0aGUgbmV3XG4gICAgLy8gbWV0cmljIGRlZmluaXRpb24sIHVubGVzcyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrTWV0cmljVmFsdWVzLCBpblxuICAgIC8vIHdoaWNoIGNhc2Ugd2Ugd2lsbCB1c2UgdGhhdCB2YWx1ZSwgaS5lLiB0aGlzIFVwZGF0ZU1ldHJpY1N1Yk9wIGlzXG4gICAgLy8gYWN0dWFsbHkgYSByZXZlcnQgb2YgYW5vdGhlciBVcGRhdGVNZXRyaWNTdWJPcC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKSE7XG5cbiAgICAgIGxldCBuZXdWYWx1ZTogbnVtYmVyO1xuICAgICAgaWYgKHRoaXMudGFza01ldHJpY1ZhbHVlcy5oYXMoaW5kZXgpKSB7XG4gICAgICAgIC8vIHRhc2tNZXRyaWNWYWx1ZXMgaGFzIGEgdmFsdWUgdGhlbiB1c2UgdGhhdCwgYXMgdGhpcyBpcyBhbiBpbnZlcnNlXG4gICAgICAgIC8vIG9wZXJhdGlvbi5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuZ2V0KGluZGV4KSE7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBvbGRWYWx1ZSA9PT0gb2xkTWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0ICYmXG4gICAgICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbi5yYW5nZS5taW4gPD0gb2xkVmFsdWUgJiZcbiAgICAgICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uLnJhbmdlLm1heCA+IG9sZFZhbHVlXG4gICAgICApIHtcbiAgICAgICAgLy8gSWYgdGhlIG9sZFZhbHVlIGlzIHRoZSBkZWZhdWx0LCBjaGFuZ2UgaXQgdG8gdGhlIG5ldyBkZWZhdWx0LCBidXQgb25seSBpZiB0aGVcbiAgICAgICAgLy8gbmV3IGRlZmF1bHQgaXMgaW4gdGhlIHJhbmdlLlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgICAgICB0YXNrTWV0cmljVmFsdWVzLnNldChpbmRleCwgb2xkVmFsdWUpO1xuXG4gICAgICAgIC8vIFdoYXQgbWlnaHQgaGF2ZSBjaGFuZ2VkIGlzIHRoZSBtaW4gb3IgbWF4IG5ld1ZhbHVlLCB3aGljaCBtaWdodCBtYWtlXG4gICAgICAgIC8vIHRoZSBkZWZhdWx0IHZhbHVlIGludmFsaWQuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDbGFtcC5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24ucmFuZ2UuY2xhbXAob2xkVmFsdWUpO1xuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5wcmVjaXNpb24ucm91bmQobmV3VmFsdWUpO1xuICAgICAgICB0YXNrTWV0cmljVmFsdWVzLnNldChpbmRleCwgb2xkVmFsdWUpO1xuICAgICAgfVxuICAgICAgdGFzay5zZXRNZXRyaWModGhpcy5uYW1lLCBuZXdWYWx1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRNZXRyaWNEZWZpbml0aW9uLCB0YXNrTWV0cmljVmFsdWVzKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoXG4gICAgb2xkTWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFVwZGF0ZU1ldHJpY1N1Yk9wKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgb2xkTWV0cmljRGVmaW5pdGlvbixcbiAgICAgIHRhc2tNZXRyaWNWYWx1ZXNcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRNZXRyaWNWYWx1ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG4gIHZhbHVlOiBudW1iZXI7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgdmFsdWU6IG51bWJlciwgdGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnRhc2tJbmRleCA9IHRhc2tJbmRleDtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG1ldHJpY3NEZWZpbml0aW9uID0gcGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmFtZSk7XG4gICAgaWYgKG1ldHJpY3NEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5hbWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgTWV0cmljYCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFzayA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdO1xuICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5uYW1lKSB8fCBtZXRyaWNzRGVmaW5pdGlvbi5kZWZhdWx0O1xuICAgIHRhc2suc2V0TWV0cmljKHRoaXMubmFtZSwgbWV0cmljc0RlZmluaXRpb24uY2xhbXBBbmRSb3VuZCh0aGlzLnZhbHVlKSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkVmFsdWUpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSh2YWx1ZTogbnVtYmVyKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0TWV0cmljVmFsdWVTdWJPcCh0aGlzLm5hbWUsIHZhbHVlLCB0aGlzLnRhc2tJbmRleCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZE1ldHJpY09wKFxuICBuYW1lOiBzdHJpbmcsXG4gIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb25cbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZE1ldHJpY1N1Yk9wKG5hbWUsIG1ldHJpY0RlZmluaXRpb24pXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVNZXRyaWNPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVNZXRyaWNTdWJPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lTWV0cmljT3Aob2xkTmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVNZXRyaWNTdWJPcChvbGROYW1lLCBuZXdOYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVXBkYXRlTWV0cmljT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvblxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgVXBkYXRlTWV0cmljU3ViT3AobmFtZSwgbWV0cmljRGVmaW5pdGlvbildKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldE1ldHJpY1ZhbHVlT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgdmFsdWU6IG51bWJlcixcbiAgdGFza0luZGV4OiBudW1iZXJcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AobmFtZSwgdmFsdWUsIHRhc2tJbmRleCldKTtcbn1cbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgZWRnZXNCeVNyY0FuZERzdFRvTWFwIH0gZnJvbSBcIi4uL2RhZy9kYWcudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBDaGFydCwgVGFzaywgVGFza1N0YXRlIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBPcCwgU3ViT3AsIFN1Yk9wUmVzdWx0IH0gZnJvbSBcIi4vb3BzLnRzXCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wLCBTZXRNZXRyaWNWYWx1ZVN1Yk9wIH0gZnJvbSBcIi4vbWV0cmljcy50c1wiO1xuXG4vKiogQSB2YWx1ZSBvZiAtMSBmb3IgaiBtZWFucyB0aGUgRmluaXNoIE1pbGVzdG9uZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEaXJlY3RlZEVkZ2VGb3JQbGFuKFxuICBpOiBudW1iZXIsXG4gIGo6IG51bWJlcixcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PERpcmVjdGVkRWRnZT4ge1xuICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gIGlmIChqID09PSAtMSkge1xuICAgIGogPSBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICB9XG4gIGlmIChpIDwgMCB8fCBpID49IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBpIGluZGV4IG91dCBvZiByYW5nZTogJHtpfSBub3QgaW4gWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMX1dYFxuICAgICk7XG4gIH1cbiAgaWYgKGogPCAwIHx8IGogPj0gY2hhcnQuVmVydGljZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYGogaW5kZXggb3V0IG9mIHJhbmdlOiAke2p9IG5vdCBpbiBbMCwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxfV1gXG4gICAgKTtcbiAgfVxuICBpZiAoaSA9PT0gaikge1xuICAgIHJldHVybiBlcnJvcihgQSBUYXNrIGNhbiBub3QgZGVwZW5kIG9uIGl0c2VsZjogJHtpfSA9PT0gJHtqfWApO1xuICB9XG4gIHJldHVybiBvayhuZXcgRGlyZWN0ZWRFZGdlKGksIGopKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZEVkZ2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmICh0aGlzLmkgPT09IC0xKSB7XG4gICAgICB0aGlzLmkgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuICAgIGlmICh0aGlzLmogPT09IC0xKSB7XG4gICAgICB0aGlzLmogPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuXG4gICAgY29uc3QgZSA9IERpcmVjdGVkRWRnZUZvclBsYW4odGhpcy5pLCB0aGlzLmosIHBsYW4pO1xuICAgIGlmICghZS5vaykge1xuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuXG4gICAgLy8gT25seSBhZGQgdGhlIGVkZ2UgaWYgaXQgZG9lc24ndCBleGlzdHMgYWxyZWFkeS5cbiAgICBpZiAoIXBsYW4uY2hhcnQuRWRnZXMuZmluZCgodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gdmFsdWUuZXF1YWwoZS52YWx1ZSkpKSB7XG4gICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2goZS52YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVtb3ZlRWRnZVN1cE9wKHRoaXMuaSwgdGhpcy5qKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVtb3ZlRWRnZVN1cE9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpOiBudW1iZXIgPSAwO1xuICBqOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGk6IG51bWJlciwgajogbnVtYmVyKSB7XG4gICAgdGhpcy5pID0gaTtcbiAgICB0aGlzLmogPSBqO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHRoaXMuaSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaSA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaiA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaiA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG5cbiAgICBjb25zdCBlID0gRGlyZWN0ZWRFZGdlRm9yUGxhbih0aGlzLmksIHRoaXMuaiwgcGxhbik7XG4gICAgaWYgKCFlLm9rKSB7XG4gICAgICByZXR1cm4gZTtcbiAgICB9XG4gICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgKHY6IERpcmVjdGVkRWRnZSk6IGJvb2xlYW4gPT4gIXYuZXF1YWwoZS52YWx1ZSlcbiAgICApO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkRWRnZVN1Yk9wKHRoaXMuaSwgdGhpcy5qKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyhpbmRleDogbnVtYmVyLCBjaGFydDogQ2hhcnQpOiBSZXN1bHQ8bnVsbD4ge1xuICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID4gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMikge1xuICAgIHJldHVybiBlcnJvcihgJHtpbmRleH0gaXMgbm90IGluIHJhbmdlIFswLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDJ9XWApO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn1cblxuZnVuY3Rpb24gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUoXG4gIGluZGV4OiBudW1iZXIsXG4gIGNoYXJ0OiBDaGFydFxuKTogUmVzdWx0PG51bGw+IHtcbiAgaWYgKGluZGV4IDwgMSB8fCBpbmRleCA+IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDIpIHtcbiAgICByZXR1cm4gZXJyb3IoYCR7aW5kZXh9IGlzIG5vdCBpbiByYW5nZSBbMSwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyfV1gKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRUYXNrQWZ0ZXJTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG4gIGZ1bGxUYXNrVG9CZVJlc3RvcmVkOiBGdWxsVGFza1RvQmVSZXN0b3JlZCB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgaW5kZXg6IG51bWJlcixcbiAgICBmdWxsVGFza1RvQmVSZXN0b3JlZDogRnVsbFRhc2tUb0JlUmVzdG9yZWQgfCBudWxsID0gbnVsbFxuICApIHtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5mdWxsVGFza1RvQmVSZXN0b3JlZCA9IGZ1bGxUYXNrVG9CZVJlc3RvcmVkO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgbGV0IHRhc2sgPSBwbGFuLm5ld1Rhc2soKTtcbiAgICBpZiAodGhpcy5mdWxsVGFza1RvQmVSZXN0b3JlZCAhPT0gbnVsbCkge1xuICAgICAgdGFzayA9IHRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQudGFzaztcbiAgICB9XG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5zcGxpY2UodGhpcy5pbmRleCArIDEsIDAsIHRhc2spO1xuXG4gICAgLy8gVXBkYXRlIEVkZ2VzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgIGlmIChlZGdlLmkgPj0gdGhpcy5pbmRleCArIDEpIHtcbiAgICAgICAgZWRnZS5pKys7XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID49IHRoaXMuaW5kZXggKyAxKSB7XG4gICAgICAgIGVkZ2UuaisrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmZ1bGxUYXNrVG9CZVJlc3RvcmVkICE9PSBudWxsKSB7XG4gICAgICBjaGFydC5FZGdlcy5wdXNoKC4uLnRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQuZWRnZXMpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVUYXNrU3ViT3AodGhpcy5pbmRleCArIDEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXBUYXNrU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUodGhpcy5pbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGNvbnN0IGNvcHkgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMuaW5kZXhdLmR1cCgpO1xuICAgIC8vIEluc2VydCB0aGUgZHVwbGljYXRlIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBUYXNrIGl0IGlzIGNvcGllZCBmcm9tLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXgsIDAsIGNvcHkpO1xuXG4gICAgLy8gVXBkYXRlIEVkZ2VzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgIGlmIChlZGdlLmkgPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaSsrO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5qKys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVUYXNrU3ViT3AodGhpcy5pbmRleCArIDEpO1xuICB9XG59XG5cbnR5cGUgU3Vic3RpdHV0aW9uID0gTWFwPERpcmVjdGVkRWRnZSwgRGlyZWN0ZWRFZGdlPjtcblxuZXhwb3J0IGNsYXNzIE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGZyb21UYXNrSW5kZXg6IG51bWJlciA9IDA7XG4gIHRvVGFza0luZGV4OiBudW1iZXIgPSAwO1xuICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGZyb21UYXNrSW5kZXg6IG51bWJlcixcbiAgICB0b1Rhc2tJbmRleDogbnVtYmVyLFxuICAgIGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb24gPSBuZXcgTWFwKClcbiAgKSB7XG4gICAgdGhpcy5mcm9tVGFza0luZGV4ID0gZnJvbVRhc2tJbmRleDtcbiAgICB0aGlzLnRvVGFza0luZGV4ID0gdG9UYXNrSW5kZXg7XG4gICAgdGhpcy5hY3R1YWxNb3ZlcyA9IGFjdHVhbE1vdmVzO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGxldCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLmZyb21UYXNrSW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUodGhpcy50b1Rhc2tJbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmFjdHVhbE1vdmVzLnZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnN0IGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb24gPSBuZXcgTWFwKCk7XG4gICAgICAvLyBVcGRhdGUgYWxsIEVkZ2VzIHRoYXQgc3RhcnQgYXQgJ2Zyb21UYXNrSW5kZXgnIGFuZCBjaGFuZ2UgdGhlIHN0YXJ0IHRvICd0b1Rhc2tJbmRleCcuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgICAgLy8gU2tpcCB0aGUgY29ybmVyIGNhc2UgdGhlcmUgZnJvbVRhc2tJbmRleCBwb2ludHMgdG8gVGFza0luZGV4LlxuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21UYXNrSW5kZXggJiYgZWRnZS5qID09PSB0aGlzLnRvVGFza0luZGV4KSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21UYXNrSW5kZXgpIHtcbiAgICAgICAgICBhY3R1YWxNb3Zlcy5zZXQoXG4gICAgICAgICAgICBuZXcgRGlyZWN0ZWRFZGdlKHRoaXMudG9UYXNrSW5kZXgsIGVkZ2UuaiksXG4gICAgICAgICAgICBuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgZWRnZS5qKVxuICAgICAgICAgICk7XG4gICAgICAgICAgZWRnZS5pID0gdGhpcy50b1Rhc2tJbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9rKHtcbiAgICAgICAgcGxhbjogcGxhbixcbiAgICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKFxuICAgICAgICAgIHRoaXMudG9UYXNrSW5kZXgsXG4gICAgICAgICAgdGhpcy5mcm9tVGFza0luZGV4LFxuICAgICAgICAgIGFjdHVhbE1vdmVzXG4gICAgICAgICksXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBuZXdFZGdlID0gdGhpcy5hY3R1YWxNb3Zlcy5nZXQocGxhbi5jaGFydC5FZGdlc1tpXSk7XG4gICAgICAgIGlmIChuZXdFZGdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzW2ldID0gbmV3RWRnZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2soe1xuICAgICAgICBwbGFuOiBwbGFuLFxuICAgICAgICBpbnZlcnNlOiBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcChcbiAgICAgICAgICB0aGlzLnRvVGFza0luZGV4LFxuICAgICAgICAgIHRoaXMuZnJvbVRhc2tJbmRleFxuICAgICAgICApLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaW52ZXJzZShcbiAgICB0b1Rhc2tJbmRleDogbnVtYmVyLFxuICAgIGZyb21UYXNrSW5kZXg6IG51bWJlcixcbiAgICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uXG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AoXG4gICAgICB0b1Rhc2tJbmRleCxcbiAgICAgIGZyb21UYXNrSW5kZXgsXG4gICAgICBhY3R1YWxNb3Zlc1xuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvcHlBbGxFZGdlc0Zyb21Ub1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBmcm9tSW5kZXg6IG51bWJlciA9IDA7XG4gIHRvSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoZnJvbUluZGV4OiBudW1iZXIsIHRvSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuZnJvbUluZGV4ID0gZnJvbUluZGV4O1xuICAgIHRoaXMudG9JbmRleCA9IHRvSW5kZXg7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmZyb21JbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3RWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgcGxhbi5jaGFydC5FZGdlcy5mb3JFYWNoKChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbUluZGV4KSB7XG4gICAgICAgIG5ld0VkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZSh0aGlzLnRvSW5kZXgsIGVkZ2UuaikpO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA9PT0gdGhpcy5mcm9tSW5kZXgpIHtcbiAgICAgICAgbmV3RWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgdGhpcy50b0luZGV4KSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLm5ld0VkZ2VzKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBSZW1vdmVBbGxFZGdlc1N1Yk9wKG5ld0VkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVtb3ZlQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgIChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+XG4gICAgICAgIC0xID09PVxuICAgICAgICB0aGlzLmVkZ2VzLmZpbmRJbmRleCgodG9CZVJlbW92ZWQ6IERpcmVjdGVkRWRnZSkgPT5cbiAgICAgICAgICBlZGdlLmVxdWFsKHRvQmVSZW1vdmVkKVxuICAgICAgICApXG4gICAgKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBBZGRBbGxFZGdlc1N1Yk9wKHRoaXMuZWRnZXMpIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRBbGxFZGdlc1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBlZGdlczogRGlyZWN0ZWRFZGdlW107XG5cbiAgY29uc3RydWN0b3IoZWRnZXM6IERpcmVjdGVkRWRnZVtdKSB7XG4gICAgdGhpcy5lZGdlcyA9IGVkZ2VzO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLnRoaXMuZWRnZXMpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogbmV3IFJlbW92ZUFsbEVkZ2VzU3ViT3AodGhpcy5lZGdlcykgfSk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIEZ1bGxUYXNrVG9CZVJlc3RvcmVkIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuICB0YXNrOiBUYXNrO1xufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlVGFza1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjb25zdCBlZGdlc1RvQmVSZXN0b3JlZCA9IGNoYXJ0LkVkZ2VzLmZpbHRlcigoZGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgaWYgKGRlLmkgPT09IHRoaXMuaW5kZXggfHwgZGUuaiA9PT0gdGhpcy5pbmRleCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgIC8vIEZpcnN0IHJlbW92ZSBhbGwgZWRnZXMgdG8gYW5kIGZyb20gdGhlIHRhc2suXG4gICAgY2hhcnQuRWRnZXMgPSBjaGFydC5FZGdlcy5maWx0ZXIoKGRlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChkZS5pID09PSB0aGlzLmluZGV4IHx8IGRlLmogPT09IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgZWRnZXMgZm9yIHRhc2tzIHRoYXQgd2lsbCBlbmQgdXAgYXQgYSBuZXcgaW5kZXguXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5pLS07XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmotLTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YXNrVG9CZVJlc3RvcmVkID0gY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXgsIDEpO1xuICAgIGNvbnN0IGZ1bGxUYXNrVG9CZVJlc3RvcmVkID0ge1xuICAgICAgZWRnZXM6IGVkZ2VzVG9CZVJlc3RvcmVkLFxuICAgICAgdGFzazogdGFza1RvQmVSZXN0b3JlZFswXSxcbiAgICB9O1xuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZShmdWxsVGFza1RvQmVSZXN0b3JlZCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKGZ1bGxUYXNrVG9CZVJlc3RvcmVkOiBGdWxsVGFza1RvQmVSZXN0b3JlZCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFRhc2tBZnRlclN1Yk9wKHRoaXMuaW5kZXggLSAxLCBmdWxsVGFza1RvQmVSZXN0b3JlZCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJhdGlvbmFsaXplRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHNyY0FuZERzdCA9IGVkZ2VzQnlTcmNBbmREc3RUb01hcChwbGFuLmNoYXJ0LkVkZ2VzKTtcbiAgICBjb25zdCBTdGFydCA9IDA7XG4gICAgY29uc3QgRmluaXNoID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuXG4gICAgLy8gbG9vcCBvdmVyIGFsbCB2ZXJ0aWNzIGZyb20gW1N0YXJ0LCBGaW5pc2gpIGFuZCBsb29rIGZvciB0aGVpclxuICAgIC8vIGRlc3RpbmF0aW9ucy4gSWYgdGhleSBoYXZlIG5vbmUgdGhlbiBhZGQgaW4gYW4gZWRnZSB0byBGaW5pc2guIElmIHRoZXlcbiAgICAvLyBoYXZlIG1vcmUgdGhhbiBvbmUgdGhlbiByZW1vdmUgYW55IGxpbmtzIHRvIEZpbmlzaC5cbiAgICBmb3IgKGxldCBpID0gU3RhcnQ7IGkgPCBGaW5pc2g7IGkrKykge1xuICAgICAgY29uc3QgZGVzdGluYXRpb25zID0gc3JjQW5kRHN0LmJ5U3JjLmdldChpKTtcbiAgICAgIGlmIChkZXN0aW5hdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB0b0JlQWRkZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKGksIEZpbmlzaCk7XG4gICAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCh0b0JlQWRkZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXJlIHRoZXJlIGFueSB1bmVlZGVkIEVnZGVzIHRvIEZpbmlzaD8gSWYgc28gZmlsdGVyIHRoZW0gb3V0LlxuICAgICAgICBpZiAoXG4gICAgICAgICAgZGVzdGluYXRpb25zLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICBkZXN0aW5hdGlvbnMuZmluZCgodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gdmFsdWUuaiA9PT0gRmluaXNoKVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCB0b0JlUmVtb3ZlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoaSwgRmluaXNoKTtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAgICAgICAodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gIXRvQmVSZW1vdmVkLmVxdWFsKHZhbHVlKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBsb29wIG92ZXIgYWxsIHZlcnRpY3MgZnJvbShTdGFydCwgRmluaXNoXSBhbmQgbG9vayBmb3IgdGhlaXIgc291cmNlcy4gSWZcbiAgICAvLyB0aGV5IGhhdmUgbm9uZSB0aGVuIGFkZCBpbiBhbiBlZGdlIGZyb20gU3RhcnQuIElmIHRoZXkgaGF2ZSBtb3JlIHRoYW4gb25lXG4gICAgLy8gdGhlbiByZW1vdmUgYW55IGxpbmtzIGZyb20gU3RhcnQuXG4gICAgZm9yIChsZXQgaSA9IFN0YXJ0ICsgMTsgaSA8IEZpbmlzaDsgaSsrKSB7XG4gICAgICBjb25zdCBkZXN0aW5hdGlvbnMgPSBzcmNBbmREc3QuYnlEc3QuZ2V0KGkpO1xuICAgICAgaWYgKGRlc3RpbmF0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHRvQmVBZGRlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIGkpO1xuICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2godG9CZUFkZGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFyZSB0aGVyZSBhbnkgdW4tbmVlZGVkIEVnZGVzIGZyb20gU3RhcnQ/IElmIHNvIGZpbHRlciB0aGVtIG91dC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgZGVzdGluYXRpb25zLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmkgPT09IFN0YXJ0KVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCB0b0JlUmVtb3ZlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIGkpO1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgICAgICAgICh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiAhdG9CZVJlbW92ZWQuZXF1YWwodmFsdWUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAocGxhbi5jaGFydC5FZGdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBGaW5pc2gpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFRhc2tOYW1lU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuICBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IodGFza0luZGV4OiBudW1iZXIsIG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLnRhc2tJbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGNvbnN0IG9sZE5hbWUgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5uYW1lO1xuICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkTmFtZSksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKG9sZE5hbWU6IHN0cmluZyk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFRhc2tOYW1lU3ViT3AodGhpcy50YXNrSW5kZXgsIG9sZE5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbnNlcnROZXdFbXB0eU1pbGVzdG9uZUFmdGVyT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgQWRkVGFza0FmdGVyU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKDAsIHRhc2tJbmRleCArIDEpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AodGFza0luZGV4ICsgMSwgLTEpLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRUYXNrTmFtZU9wKHRhc2tJbmRleDogbnVtYmVyLCBuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRUYXNrTmFtZVN1Yk9wKHRhc2tJbmRleCwgbmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNwbGl0VGFza09wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICBjb25zdCBzdWJPcHM6IFN1Yk9wW10gPSBbXG4gICAgbmV3IER1cFRhc2tTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcCh0YXNrSW5kZXgsIHRhc2tJbmRleCArIDEpLFxuICBdO1xuXG4gIHJldHVybiBuZXcgT3Aoc3ViT3BzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIER1cFRhc2tPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgY29uc3Qgc3ViT3BzOiBTdWJPcFtdID0gW1xuICAgIG5ldyBEdXBUYXNrU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQ29weUFsbEVkZ2VzRnJvbVRvU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgXTtcblxuICByZXR1cm4gbmV3IE9wKHN1Yk9wcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVUYXNrT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgRGVsZXRlVGFza1N1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZEVkZ2VPcChmcm9tVGFza0luZGV4OiBudW1iZXIsIHRvVGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKGZyb21UYXNrSW5kZXgsIHRvVGFza0luZGV4KSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmF0aW9uYWxpemVFZGdlc09wKCk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW1vdmVFZGdlT3AoaTogbnVtYmVyLCBqOiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgUmVtb3ZlRWRnZVN1cE9wKGksIGopLFxuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IEFkZFRhc2tBZnRlclN1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IFNldE1ldHJpY1ZhbHVlU3ViT3AoXCJEdXJhdGlvblwiLCAxMCwgdGFza0luZGV4ICsgMSksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCgwLCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKHRhc2tJbmRleCArIDEsIC0xKSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuIiwgImltcG9ydCB7IEFkZERlcGVuZGVuY3lEaWFsb2cgfSBmcm9tIFwiLi4vLi4vYWRkLWRlcGVuZGVuY3ktZGlhbG9nL2FkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiO1xuaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IEFkZEVkZ2VPcCB9IGZyb20gXCIuLi8uLi9vcHMvY2hhcnRcIjtcbmltcG9ydCB7IGVycm9yLCBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Gcm9tT3AsIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRQcmVkZWNlc3NvckFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPVxuICAgIFwiUHJvbXB0cyBmb3IgYW5kIGFkZHMgYSBwcmVkZWNlc3NvciB0byB0aGUgY3VycmVudCBUYXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgVGFzayBtdXN0IGJlIHNlbGVjdGVkLlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHByZWRUYXNrSW5kZXggPSBhd2FpdCBleHBsYW5NYWluXG4gICAgICAucXVlcnlTZWxlY3RvcjxBZGREZXBlbmRlbmN5RGlhbG9nPihcImFkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiKSFcbiAgICAgIC5zZWxlY3REZXBlbmRlbmN5KGV4cGxhbk1haW4ucGxhbi5jaGFydCwgZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2ssIFwicHJlZFwiKTtcbiAgICBpZiAocHJlZFRhc2tJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiTm8gcHJlZGVjZXNzb3Igd2FzIHNlbGVjdGVkLlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IEFkZEVkZ2VPcChwcmVkVGFza0luZGV4LCBleHBsYW5NYWluLnNlbGVjdGVkVGFzaykuYXBwbHlUbyhcbiAgICAgIGV4cGxhbk1haW4ucGxhblxuICAgICk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AoXG4gICAgICAgIHJldC52YWx1ZS5pbnZlcnNlLFxuICAgICAgICAodGhpcy5wb3N0QWN0aW9uV29yayA9IHRoaXMucG9zdEFjdGlvbldvcmspLFxuICAgICAgICB0cnVlXG4gICAgICApXG4gICAgKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFkZERlcGVuZGVuY3lEaWFsb2cgfSBmcm9tIFwiLi4vLi4vYWRkLWRlcGVuZGVuY3ktZGlhbG9nL2FkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiO1xuaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IEFkZEVkZ2VPcCB9IGZyb20gXCIuLi8uLi9vcHMvY2hhcnRcIjtcbmltcG9ydCB7IGVycm9yLCBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Gcm9tT3AsIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRTdWNjZXNzb3JBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJQcm9tcHRzIGZvciBhbmQgYWRkcyBhIHN1Y2Nlc3NvciB0byB0aGUgY3VycmVudCBUYXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgVGFzayBtdXN0IGJlIHNlbGVjdGVkLlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHN1Y2NUYXNrSW5kZXggPSBhd2FpdCBleHBsYW5NYWluXG4gICAgICAucXVlcnlTZWxlY3RvcjxBZGREZXBlbmRlbmN5RGlhbG9nPihcImFkZC1kZXBlbmRlbmN5LWRpYWxvZ1wiKSFcbiAgICAgIC5zZWxlY3REZXBlbmRlbmN5KGV4cGxhbk1haW4ucGxhbi5jaGFydCwgZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2ssIFwic3VjY1wiKTtcbiAgICBpZiAoc3VjY1Rhc2tJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiTm8gc3VjY2Vzc29yIHdhcyBzZWxlY3RlZC5cIikpO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBBZGRFZGdlT3AoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2ssIHN1Y2NUYXNrSW5kZXgpLmFwcGx5VG8oXG4gICAgICBleHBsYW5NYWluLnBsYW5cbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKFxuICAgICAgICByZXQudmFsdWUuaW52ZXJzZSxcbiAgICAgICAgKHRoaXMucG9zdEFjdGlvbldvcmsgPSB0aGlzLnBvc3RBY3Rpb25Xb3JrKSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IFNlYXJjaFRhc2tQYW5lbCB9IGZyb20gXCIuLi8uLi9zZWFyY2gvc2VhcmNoLXRhc2stcGFuZWxcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIEdvVG9TZWFyY2hBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJNb3ZlcyBmb2N1cyB0byBzZWFyY2ggY29udHJvbC5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oX2V4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yPFNlYXJjaFRhc2tQYW5lbD4oXCJzZWFyY2gtdGFzay1wYW5lbFwiKSFcbiAgICAgIC5zZXRLZXlib2FyZEZvY3VzVG9JbnB1dChcIm5hbWUtb25seVwiKTtcbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdvVG9GdWxsU2VhcmNoQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9XG4gICAgXCJNb3ZlcyBmb2N1cyB0byBzZWFyY2ggY29udHJvbCBhbmQgZG9lcyBhIGZ1bGwgc2VhcmNoIG9mIGFsbCByZXNvdXJjZSB2YWx1ZXMuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGFzeW5jIGRvKF9leHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcjxTZWFyY2hUYXNrUGFuZWw+KFwic2VhcmNoLXRhc2stcGFuZWxcIikhXG4gICAgICAuc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoXCJmdWxsLWluZm9cIik7XG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBIZWxwQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiRGlzcGxheXMgdGhlIGhlbHAgZGlhbG9nLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGV4cGxhbk1haW5cbiAgICAgIC5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImtleWJvYXJkLW1hcC1kaWFsb2dcIikhXG4gICAgICAuc2hvd01vZGFsKCk7XG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBSZXNldFpvb21BY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJVbmRvZXMgdGhlIHpvb20uXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwYWludENoYXJ0XCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGV4cGxhbk1haW4uZGlzcGxheVJhbmdlID0gbnVsbDtcbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHtcbiAgRGVsZXRlVGFza09wLFxuICBEdXBUYXNrT3AsXG4gIEluc2VydE5ld0VtcHR5TWlsZXN0b25lQWZ0ZXJPcCxcbiAgSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCxcbiAgU3BsaXRUYXNrT3AsXG59IGZyb20gXCIuLi8uLi9vcHMvY2hhcnRcIjtcbmltcG9ydCB7IFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi4vLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IGVycm9yLCBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Gcm9tT3AsIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBTcGxpdFRhc2tBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJTcGxpdHMgYSB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgdGFzayBtdXN0IGJlIHNlbGVjdGVkIGZpcnN0LlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IFNwbGl0VGFza09wKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrKS5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXBUYXNrQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiRHVwbGljYXRlcyBhIHRhc2suXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IHRydWU7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBpZiAoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2sgPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiQSB0YXNrIG11c3QgYmUgc2VsZWN0ZWQgZmlyc3QuXCIpKTtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gRHVwVGFza09wKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrKS5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOZXdUYXNrQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiQ3JlYXRlcyBhIG5ldyB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgbGV0IHJldCA9IEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AoMCkuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlVGFza0FjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkRlbGV0ZXMgYSB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgdGFzayBtdXN0IGJlIHNlbGVjdGVkIGZpcnN0LlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IERlbGV0ZVRhc2tPcChleHBsYW5NYWluLnNlbGVjdGVkVGFzaykuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9IC0xO1xuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG4iLCAiY29uc3QgZGFya01vZGVMb2NhbFN0b3JhZ2VLZXkgPSBcImV4cGxhbi1kYXJrbW9kZVwiO1xuXG4vKiogV2hlbiB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBjbGlja2VkLCB0aGVuIHRvZ2dsZSB0aGUgYGRhcmttb2RlYCBjbGFzcyBvbiB0aGVcbiAqIGJvZHkgZWxlbWVudC4gKi9cbmV4cG9ydCBjb25zdCB0b2dnbGVUaGVtZSA9ICgpID0+IHtcbiAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFxuICAgIGRhcmtNb2RlTG9jYWxTdG9yYWdlS2V5LFxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcImRhcmttb2RlXCIpID8gXCIxXCIgOiBcIjBcIlxuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IGFwcGx5U3RvcmVkVGhlbWUgPSAoKSA9PiB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICBcImRhcmttb2RlXCIsXG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKGRhcmtNb2RlTG9jYWxTdG9yYWdlS2V5KSA9PT0gXCIxXCJcbiAgKTtcbn07XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyB0b2dnbGVUaGVtZSB9IGZyb20gXCIuLi8uLi9zdHlsZS90b2dnbGVyL3RvZ2dsZXJcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIFRvZ2dsZURhcmtNb2RlQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiVG9nZ2xlcyBkYXJrIG1vZGUuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwYWludENoYXJ0XCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gIGFzeW5jIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBQcm9taXNlPFJlc3VsdDxBY3Rpb24+PiB7XG4gICAgdG9nZ2xlVGhlbWUoKTtcbiAgICAvLyBUb2dnbGVEYXJrTW9kZUFjdGlvbiBpcyBpdHMgb3duIGludmVyc2UuXG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBUb2dnbGVGb2N1c0FjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIlRvZ2dsZXMgdGhlIGZvY3VzIHZpZXcuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwYWludENoYXJ0XCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBhc3luYyBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8QWN0aW9uPj4ge1xuICAgIGV4cGxhbk1haW4udG9nZ2xlRm9jdXNPblRhc2soKTtcbiAgICAvLyBUb2dnbGVGb2N1c0FjdGlvbiBpcyBpdHMgb3duIGludmVyc2UuXG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyB0b2dnbGVUaGVtZSB9IGZyb20gXCIuLi8uLi9zdHlsZS90b2dnbGVyL3RvZ2dsZXJcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIFRvZ2dsZVJhZGFyQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiVG9nZ2xlcyB0aGUgcmFkYXIgdmlldy5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBleHBsYW5NYWluLnRvZ2dsZVJhZGFyKCk7XG4gICAgLy8gVG9nZ2xlUmFkYXJBY3Rpb24gaXMgaXRzIG93biBpbnZlcnNlLlxuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBOT09QQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuaW1wb3J0IHsgdW5kbyB9IGZyb20gXCIuLi9leGVjdXRlXCI7XG5cbmV4cG9ydCBjbGFzcyBVbmRvQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiVW5kb2VzIHRoZSBsYXN0IGFjdGlvbi5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgYXN5bmMgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFByb21pc2U8UmVzdWx0PEFjdGlvbj4+IHtcbiAgICBjb25zdCByZXQgPSB1bmRvKGV4cGxhbk1haW4pO1xuXG4gICAgLy8gVW5kbyBpcyBub3QgYSByZXZlcnNpYmxlIGFjdGlvbi5cbiAgICByZXR1cm4gb2sobmV3IE5PT1BBY3Rpb24oKSk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb24udHNcIjtcbmltcG9ydCB7IEFkZFByZWRlY2Vzc29yQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy9hZGRQcmVkZWNlc3Nvci50c1wiO1xuaW1wb3J0IHsgQWRkU3VjY2Vzc29yQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy9hZGRTdWNjZXNzb3IudHNcIjtcbmltcG9ydCB7XG4gIEdvVG9GdWxsU2VhcmNoQWN0aW9uLFxuICBHb1RvU2VhcmNoQWN0aW9uLFxufSBmcm9tIFwiLi9hY3Rpb25zL2dvdG9TZWFyY2gudHNcIjtcbmltcG9ydCB7IEhlbHBBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL2hlbHAudHNcIjtcbmltcG9ydCB7IFJlc2V0Wm9vbUFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvcmVzZXRab29tLnRzXCI7XG5pbXBvcnQge1xuICBEZWxldGVUYXNrQWN0aW9uLFxuICBEdXBUYXNrQWN0aW9uLFxuICBOZXdUYXNrQWN0aW9uLFxuICBTcGxpdFRhc2tBY3Rpb24sXG59IGZyb20gXCIuL2FjdGlvbnMvdGFza3MudHNcIjtcbmltcG9ydCB7IFRvZ2dsZURhcmtNb2RlQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy90b2dnbGVEYXJrTW9kZS50c1wiO1xuaW1wb3J0IHsgVG9nZ2xlRm9jdXNBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3RvZ2dsZUZvY3VzLnRzXCI7XG5pbXBvcnQgeyBUb2dnbGVSYWRhckFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvdG9nZ2xlUmFkYXIudHNcIjtcbmltcG9ydCB7IFVuZG9BY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3VuZG8udHNcIjtcblxuZXhwb3J0IHR5cGUgQWN0aW9uTmFtZXMgPVxuICB8IFwiVG9nZ2xlRGFya01vZGVBY3Rpb25cIlxuICB8IFwiVG9nZ2xlUmFkYXJBY3Rpb25cIlxuICB8IFwiUmVzZXRab29tQWN0aW9uXCJcbiAgfCBcIlVuZG9BY3Rpb25cIlxuICB8IFwiSGVscEFjdGlvblwiXG4gIHwgXCJTcGxpdFRhc2tBY3Rpb25cIlxuICB8IFwiRHVwVGFza0FjdGlvblwiXG4gIHwgXCJOZXdUYXNrQWN0aW9uXCJcbiAgfCBcIkRlbGV0ZVRhc2tBY3Rpb25cIlxuICB8IFwiR29Ub1NlYXJjaEFjdGlvblwiXG4gIHwgXCJHb1RvRnVsbFNlYXJjaEFjdGlvblwiXG4gIHwgXCJBZGRQcmVkZWNlc3NvckFjdGlvblwiXG4gIHwgXCJBZGRTdWNjZXNzb3JBY3Rpb25cIlxuICB8IFwiVG9nZ2xlRm9jdXNBY3Rpb25cIjtcblxuZXhwb3J0IGNvbnN0IEFjdGlvblJlZ2lzdHJ5OiBSZWNvcmQ8QWN0aW9uTmFtZXMsIEFjdGlvbj4gPSB7XG4gIFRvZ2dsZURhcmtNb2RlQWN0aW9uOiBuZXcgVG9nZ2xlRGFya01vZGVBY3Rpb24oKSxcbiAgVG9nZ2xlUmFkYXJBY3Rpb246IG5ldyBUb2dnbGVSYWRhckFjdGlvbigpLFxuICBSZXNldFpvb21BY3Rpb246IG5ldyBSZXNldFpvb21BY3Rpb24oKSxcbiAgVW5kb0FjdGlvbjogbmV3IFVuZG9BY3Rpb24oKSxcbiAgSGVscEFjdGlvbjogbmV3IEhlbHBBY3Rpb24oKSxcbiAgU3BsaXRUYXNrQWN0aW9uOiBuZXcgU3BsaXRUYXNrQWN0aW9uKCksXG4gIER1cFRhc2tBY3Rpb246IG5ldyBEdXBUYXNrQWN0aW9uKCksXG4gIE5ld1Rhc2tBY3Rpb246IG5ldyBOZXdUYXNrQWN0aW9uKCksXG4gIERlbGV0ZVRhc2tBY3Rpb246IG5ldyBEZWxldGVUYXNrQWN0aW9uKCksXG4gIEdvVG9TZWFyY2hBY3Rpb246IG5ldyBHb1RvU2VhcmNoQWN0aW9uKCksXG4gIEdvVG9GdWxsU2VhcmNoQWN0aW9uOiBuZXcgR29Ub0Z1bGxTZWFyY2hBY3Rpb24oKSxcbiAgQWRkUHJlZGVjZXNzb3JBY3Rpb246IG5ldyBBZGRQcmVkZWNlc3NvckFjdGlvbigpLFxuICBBZGRTdWNjZXNzb3JBY3Rpb246IG5ldyBBZGRTdWNjZXNzb3JBY3Rpb24oKSxcbiAgVG9nZ2xlRm9jdXNBY3Rpb246IG5ldyBUb2dnbGVGb2N1c0FjdGlvbigpLFxufTtcbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpbi50c1wiO1xuaW1wb3J0IHsgT3AgfSBmcm9tIFwiLi4vb3BzL29wcy50c1wiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IEFjdGlvbiwgQWN0aW9uRnJvbU9wLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4vYWN0aW9uLnRzXCI7XG5pbXBvcnQgeyBBY3Rpb25OYW1lcywgQWN0aW9uUmVnaXN0cnkgfSBmcm9tIFwiLi9yZWdpc3RyeS50c1wiO1xuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXAge1xuICAgIFwicGxhbi1kZWZpbml0aW9uLWNoYW5nZWRcIjogQ3VzdG9tRXZlbnQ8bnVsbD47XG4gIH1cbn1cblxuY29uc3QgdW5kb1N0YWNrOiBBY3Rpb25bXSA9IFtdO1xuXG5leHBvcnQgY29uc3QgdW5kbyA9IGFzeW5jIChleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUHJvbWlzZTxSZXN1bHQ8bnVsbD4+ID0+IHtcbiAgY29uc3QgYWN0aW9uID0gdW5kb1N0YWNrLnBvcCgpITtcbiAgaWYgKCFhY3Rpb24pIHtcbiAgICByZXR1cm4gb2sobnVsbCk7XG4gIH1cblxuICByZXR1cm4gYXdhaXQgZXhlY3V0ZVVuZG8oYWN0aW9uLCBleHBsYW5NYWluKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleGVjdXRlID0gYXN5bmMgKFxuICBuYW1lOiBBY3Rpb25OYW1lcyxcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpblxuKTogUHJvbWlzZTxSZXN1bHQ8bnVsbD4+ID0+IHtcbiAgY29uc3QgYWN0aW9uID0gQWN0aW9uUmVnaXN0cnlbbmFtZV07XG4gIGNvbnN0IHJldCA9IGF3YWl0IGFjdGlvbi5kbyhleHBsYW5NYWluKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIHN3aXRjaCAoYWN0aW9uLnBvc3RBY3Rpb25Xb3JrKSB7XG4gICAgY2FzZSBcIlwiOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInBhaW50Q2hhcnRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI6XG4gICAgICBleHBsYW5NYWluLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgLy8gU2VuZCBhbiBldmVudCBpbiBjYXNlIHdlIGhhdmUgYW55IGRpYWxvZ3MgdXAgdGhhdCBuZWVkIHRvIHJlLXJlbmRlciBpZlxuICAgICAgLy8gdGhlIHBsYW4gY2hhbmdlZCwgcG9zc2libGUgc2luY2UgQ3RybC1aIHdvcmtzIGZyb20gYW55d2hlcmUuXG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCIpKTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuICBpZiAoYWN0aW9uLnVuZG8pIHtcbiAgICB1bmRvU3RhY2sucHVzaChyZXQudmFsdWUpO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleGVjdXRlT3AgPSBhc3luYyAoXG4gIG9wOiBPcCxcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmssXG4gIHVuZG86IGJvb2xlYW4sXG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW5cbik6IFByb21pc2U8UmVzdWx0PG51bGw+PiA9PiB7XG4gIGNvbnN0IGFjdGlvbiA9IG5ldyBBY3Rpb25Gcm9tT3Aob3AsIHBvc3RBY3Rpb25Xb3JrLCB1bmRvKTtcbiAgY29uc3QgcmV0ID0gYXdhaXQgYWN0aW9uLmRvKGV4cGxhbk1haW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgc3dpdGNoIChhY3Rpb24ucG9zdEFjdGlvbldvcmspIHtcbiAgICBjYXNlIFwiXCI6XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwYWludENoYXJ0XCI6XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiOlxuICAgICAgZXhwbGFuTWFpbi5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIC8vIFNlbmQgYW4gZXZlbnQgaW4gY2FzZSB3ZSBoYXZlIGFueSBkaWFsb2dzIHVwIHRoYXQgbmVlZCB0byByZS1yZW5kZXIgaWZcbiAgICAgIC8vIHRoZSBwbGFuIGNoYW5nZWQsIHBvc3NpYmxlIHNpbmNlIEN0cmwtWiB3b3JrcyBmcm9tIGFueXdoZXJlLlxuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiKSk7XG5cbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG4gIGlmIChhY3Rpb24udW5kbykge1xuICAgIHVuZG9TdGFjay5wdXNoKHJldC52YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufTtcblxuY29uc3QgZXhlY3V0ZVVuZG8gPSBhc3luYyAoXG4gIGFjdGlvbjogQWN0aW9uLFxuICBleHBsYW5NYWluOiBFeHBsYW5NYWluXG4pOiBQcm9taXNlPFJlc3VsdDxudWxsPj4gPT4ge1xuICBjb25zdCByZXQgPSBhd2FpdCBhY3Rpb24uZG8oZXhwbGFuTWFpbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuICBzd2l0Y2ggKGFjdGlvbi5wb3N0QWN0aW9uV29yaykge1xuICAgIGNhc2UgXCJcIjpcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInBhaW50Q2hhcnRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI6XG4gICAgICBleHBsYW5NYWluLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICAgIGV4cGxhbk1haW4ucGFpbnRDaGFydCgpO1xuICAgICAgLy8gU2VuZCBhbiBldmVudCBpbiBjYXNlIHdlIGhhdmUgYW55IGRpYWxvZ3MgdXAgdGhhdCBuZWVkIHRvIHJlLXJlbmRlciBpZlxuICAgICAgLy8gdGhlIHBsYW4gY2hhbmdlZCwgcG9zc2libGUgc2luY2UgQ3RybC1aIHdvcmtzIGZyb20gYW55d2hlcmUuXG4gICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcInBsYW4tZGVmaW5pdGlvbi1jaGFuZ2VkXCIpKTtcblxuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIG9rKG51bGwpO1xufTtcbiIsICJpbXBvcnQgeyBleGVjdXRlIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlXCI7XG5pbXBvcnQgeyBBY3Rpb25OYW1lcyB9IGZyb20gXCIuLi9hY3Rpb24vcmVnaXN0cnlcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5cbmV4cG9ydCBjb25zdCBLZXlNYXA6IE1hcDxzdHJpbmcsIEFjdGlvbk5hbWVzPiA9IG5ldyBNYXAoW1xuICBbXCJzaGlmdC1jdHJsLVJcIiwgXCJUb2dnbGVSYWRhckFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC1NXCIsIFwiVG9nZ2xlRGFya01vZGVBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtWlwiLCBcIlJlc2V0Wm9vbUFjdGlvblwiXSxcbiAgW1wiY3RybC16XCIsIFwiVW5kb0FjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC1IXCIsIFwiSGVscEFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC18XCIsIFwiU3BsaXRUYXNrQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLV9cIiwgXCJEdXBUYXNrQWN0aW9uXCJdLFxuICBbXCJhbHQtSW5zZXJ0XCIsIFwiTmV3VGFza0FjdGlvblwiXSxcbiAgW1wiYWx0LURlbGV0ZVwiLCBcIkRlbGV0ZVRhc2tBY3Rpb25cIl0sXG4gIFtcImN0cmwtZlwiLCBcIkdvVG9TZWFyY2hBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtRlwiLCBcIkdvVG9GdWxsU2VhcmNoQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLTxcIiwgXCJBZGRQcmVkZWNlc3NvckFjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC0+XCIsIFwiQWRkU3VjY2Vzc29yQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLTpcIiwgXCJUb2dnbGVGb2N1c0FjdGlvblwiXSxcbl0pO1xuXG5sZXQgZXhwbGFuTWFpbjogRXhwbGFuTWFpbjtcblxuZXhwb3J0IGNvbnN0IFN0YXJ0S2V5Ym9hcmRIYW5kbGluZyA9IChlbTogRXhwbGFuTWFpbikgPT4ge1xuICBleHBsYW5NYWluID0gZW07XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIG9uS2V5RG93bik7XG59O1xuXG5jb25zdCBvbktleURvd24gPSBhc3luYyAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICBjb25zdCBrZXluYW1lID0gYCR7ZS5zaGlmdEtleSA/IFwic2hpZnQtXCIgOiBcIlwifSR7ZS5jdHJsS2V5ID8gXCJjdHJsLVwiIDogXCJcIn0ke2UubWV0YUtleSA/IFwibWV0YS1cIiA6IFwiXCJ9JHtlLmFsdEtleSA/IFwiYWx0LVwiIDogXCJcIn0ke2Uua2V5fWA7XG4gIGNvbnNvbGUubG9nKGtleW5hbWUpO1xuICBjb25zdCBhY3Rpb25OYW1lID0gS2V5TWFwLmdldChrZXluYW1lKTtcbiAgaWYgKGFjdGlvbk5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGUoYWN0aW9uTmFtZSwgZXhwbGFuTWFpbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgY29uc29sZS5sb2cocmV0LmVycm9yKTtcbiAgfVxufTtcbiIsICJpbXBvcnQgeyBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IEtleU1hcCB9IGZyb20gXCIuLi9rZXltYXAva2V5bWFwLnRzXCI7XG5pbXBvcnQgeyBBY3Rpb25SZWdpc3RyeSB9IGZyb20gXCIuLi9hY3Rpb24vcmVnaXN0cnlcIjtcblxuY2xhc3MgS2V5Ym9hcmRNYXBEaWFsb2cgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIGNvbnN0IGtleW1hcEVudHJpZXMgPSBbLi4uS2V5TWFwLmVudHJpZXMoKV07XG4gICAga2V5bWFwRW50cmllcy5zb3J0KCk7XG4gICAgcmVuZGVyKFxuICAgICAgaHRtbGBcbiAgICAgICAgPGRpYWxvZz5cbiAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICAke2tleW1hcEVudHJpZXMubWFwKFxuICAgICAgICAgICAgICAoW2tleSwgYWN0aW9uTmFtZV0pID0+XG4gICAgICAgICAgICAgICAgaHRtbGA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGQ+JHtrZXl9PC90ZD5cbiAgICAgICAgICAgICAgICAgIDx0ZD4ke0FjdGlvblJlZ2lzdHJ5W2FjdGlvbk5hbWVdLmRlc2NyaXB0aW9ufTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5gXG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgIDwvZGlhbG9nPlxuICAgICAgYCxcbiAgICAgIHRoaXNcbiAgICApO1xuICB9XG5cbiAgc2hvd01vZGFsKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLnNob3dNb2RhbCgpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImtleWJvYXJkLW1hcC1kaWFsb2dcIiwgS2V5Ym9hcmRNYXBEaWFsb2cpO1xuIiwgIi8vIEVhY2ggUmVzb3Vyc2UgaGFzIGEga2V5LCB3aGljaCBpcyB0aGUgbmFtZSwgYW5kIGEgbGlzdCBvZiBhY2NlcHRhYmxlIHZhbHVlcy5cbi8vIFRoZSBsaXN0IG9mIHZhbHVlcyBjYW4gbmV2ZXIgYmUgZW1wdHksIGFuZCB0aGUgZmlyc3QgdmFsdWUgaW4gYHZhbHVlc2AgaXMgdGhlXG4vLyBkZWZhdWx0IHZhbHVlIGZvciBhIFJlc291cmNlLlxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9SRVNPVVJDRV9WQUxVRSA9IFwiXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZCB7XG4gIHZhbHVlczogc3RyaW5nW107XG59XG5cbmV4cG9ydCBjbGFzcyBSZXNvdXJjZURlZmluaXRpb24ge1xuICB2YWx1ZXM6IHN0cmluZ1tdO1xuXG4gIC8vIFRydWUgaWYgdGhlIFJlc291cmNlIGlzIGJ1aWx0IGluIGFuZCBjYW4ndCBiZSBlZGl0ZWQgb3IgZGVsZXRlZC5cbiAgaXNTdGF0aWM6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgdmFsdWVzOiBzdHJpbmdbXSA9IFtERUZBVUxUX1JFU09VUkNFX1ZBTFVFXSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIHRoaXMudmFsdWVzID0gdmFsdWVzO1xuICAgIHRoaXMuaXNTdGF0aWMgPSBpc1N0YXRpYztcbiAgfVxuXG4gIHRvSlNPTigpOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWVzOiB0aGlzLnZhbHVlcyxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIEZyb21KU09OKHM6IFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQpOiBSZXNvdXJjZURlZmluaXRpb24ge1xuICAgIHJldHVybiBuZXcgUmVzb3VyY2VEZWZpbml0aW9uKHMudmFsdWVzKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBSZXNvdXJjZURlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb24gfTtcbmV4cG9ydCB0eXBlIFJlc291cmNlRGVmaW5pdGlvbnNTZXJpYWxpemVkID0ge1xuICBba2V5OiBzdHJpbmddOiBSZXNvdXJjZURlZmluaXRpb25TZXJpYWxpemVkO1xufTtcbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCB9IGZyb20gXCJsaXQtaHRtbFwiO1xuXG4vLyBMb29rIG9uIHRoZSBtYWluIGluZGV4IHBhZ2UgZm9yIGFsbCB0aGUgYWxsb3dlZCBuYW1lcy5cbi8vXG4vLyBJbnN0YW50aWF0ZXMgYW4gU1ZHIGljb24gdmlhIHRoZSA8dXNlPiB0YWcuXG5leHBvcnQgY29uc3QgaWNvbiA9IChuYW1lOiBzdHJpbmcpOiBUZW1wbGF0ZVJlc3VsdCA9PiB7XG4gIHJldHVybiBodG1sYFxuICA8c3ZnXG4gICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG4gICAgd2lkdGg9XCIyNFwiXG4gICAgaGVpZ2h0PVwiMjRcIlxuICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICA+XG4gICAgPHVzZSBocmVmPSMke25hbWV9PlxuICA8L3N2Zz5gO1xufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQge1xuICBPcCxcbiAgU3ViT3AsXG4gIFN1Yk9wUmVzdWx0LFxuICBhcHBseUFsbE9wc1RvUGxhbkFuZFRoZW5JbnZlcnNlLFxufSBmcm9tIFwiLi9vcHMudHNcIjtcbmltcG9ydCB7XG4gIERFRkFVTFRfUkVTT1VSQ0VfVkFMVUUsXG4gIFJlc291cmNlRGVmaW5pdGlvbixcbn0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcblxuZXhwb3J0IGNsYXNzIEFkZFJlc291cmNlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuXG4gIGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlOiBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlOiBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSB8IG51bGwgPSBudWxsXG4gICkge1xuICAgIHRoaXMua2V5ID0gbmFtZTtcbiAgICB0aGlzLmRlbGV0ZVJlc291cmNlVW5kb1N0YXRlID0gZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBmb3VuZE1hdGNoID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChmb3VuZE1hdGNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gYWxyZWFkeSBleGlzdHMgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0UmVzb3VyY2VEZWZpbml0aW9uKFxuICAgICAgdGhpcy5rZXksXG4gICAgICAodGhpcy5kZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSAmJlxuICAgICAgICB0aGlzLmRlbGV0ZVJlc291cmNlVW5kb1N0YXRlLnJlc291cmNlRGVmaW5pdGlvbikgfHxcbiAgICAgICAgbmV3IFJlc291cmNlRGVmaW5pdGlvbigpXG4gICAgKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgYWRkIHRoaXMga2V5IGFuZCBzZXQgaXQgdG8gdGhlIGRlZmF1bHQsIHVubGVzc1xuICAgIC8vIHRoZXJlIGlzIG1hdGNoaW5nIGVudHJ5IGluIHRhc2tSZXNvdXJjZVZhbHVlcywgaW4gd2hpY2ggY2FzZSB3ZSB3aWxsIHVzZSB0aGF0IHZhbHVlLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgdGFzay5zZXRSZXNvdXJjZShcbiAgICAgICAgdGhpcy5rZXksXG4gICAgICAgICh0aGlzLmRlbGV0ZVJlc291cmNlVW5kb1N0YXRlICYmXG4gICAgICAgICAgdGhpcy5kZWxldGVSZXNvdXJjZVVuZG9TdGF0ZS50YXNrSW5kZXhUb0RlbGV0ZWRSZXNvdXJjZVZhbHVlLmdldChcbiAgICAgICAgICAgIGluZGV4XG4gICAgICAgICAgKSkgfHxcbiAgICAgICAgICBERUZBVUxUX1JFU09VUkNFX1ZBTFVFXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVJlc291cmNlU3VwT3AodGhpcy5rZXkpO1xuICB9XG59XG5cbmludGVyZmFjZSBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSB7XG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uO1xuICB0YXNrSW5kZXhUb0RlbGV0ZWRSZXNvdXJjZVZhbHVlOiBNYXA8bnVtYmVyLCBzdHJpbmc+O1xufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlUmVzb3VyY2VTdXBPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5rZXkgPSBuYW1lO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmVzb3VyY2VEZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChyZXNvdXJjZURlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgVGhlIHJlc291cmNlIHdpdGggbmFtZSAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhbmQgY2FuJ3QgYmUgZGVsZXRlZC5gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBmcm9tIHJlc291cmNlIGRlZmluaXRpb25zLlxuICAgIHBsYW4uZGVsZXRlUmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcblxuICAgIGNvbnN0IHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWU6IE1hcDxudW1iZXIsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHJlbW92ZSBgdGhpcy5rZXlgIGZyb20gdGhlIHJlc291cmNlcyB3aGlsZSBhbHNvXG4gICAgLy8gYnVpbGRpbmcgdXAgdGhlIGluZm8gbmVlZGVkIGZvciBhIHJldmVydC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRTtcbiAgICAgIHRhc2tJbmRleFRvRGVsZXRlZFJlc291cmNlVmFsdWUuc2V0KGluZGV4LCB2YWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZVJlc291cmNlKHRoaXMua2V5KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlOiBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSA9IHtcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbjogcmVzb3VyY2VEZWZpbml0aW9uLFxuICAgICAgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZTogdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoZGVsZXRlUmVzb3VyY2VVbmRvU3RhdGUpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlOiBkZWxldGVSZXNvdXJjZVVuZG9TdGF0ZSk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFJlc291cmNlU3ViT3AodGhpcy5rZXksIGRlbGV0ZVJlc291cmNlVW5kb1N0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRkUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSA9IFtdIC8vIFRoaXMgc2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgd2hlbiBiZWluZyBjb25zdHJ1Y3RlZCBhcyBhIGludmVyc2Ugb3BlcmF0aW9uLlxuICApIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlID0gaW5kaWNlc09mVGFza3NUb0NoYW5nZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGRlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGRlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2Vzbid0IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG4gICAgY29uc3QgZXhpc3RpbmdJbmRleCA9IGRlZmluaXRpb24udmFsdWVzLmZpbmRJbmRleChcbiAgICAgICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSA9PT0gdGhpcy52YWx1ZVxuICAgICk7XG4gICAgaWYgKGV4aXN0aW5nSW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMudmFsdWV9IGFscmVhZHkgZXhpc3RzIGFzIGEgdmFsdWUgaW4gdGhlIFJlc291cmNlICR7dGhpcy5rZXl9LmBcbiAgICAgICk7XG4gICAgfVxuICAgIGRlZmluaXRpb24udmFsdWVzLnB1c2godGhpcy52YWx1ZSk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHNldCB0aGUgdmFsdWUgZm9yIHRoZSBnaXZlbiBrZXkgZm9yIGFsbCB0aGVcbiAgICAvLyB0YXNrcyBsaXN0ZWQgaW4gYGluZGljZXNPZlRhc2tzVG9DaGFuZ2VgLlxuICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZS5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgcGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLnZhbHVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3AoXG4gICAgICB0aGlzLmtleSxcbiAgICAgIHRoaXMudmFsdWUsXG4gICAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2VcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWxldGVSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IHN0cmluZyxcbiAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSA9IFtdXG4gICkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UgPSBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXNuJ3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZUluZGV4ID0gZGVmaW5pdGlvbi52YWx1ZXMuZmluZEluZGV4KFxuICAgICAgKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlID09PSB0aGlzLnZhbHVlXG4gICAgKTtcbiAgICBpZiAodmFsdWVJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy52YWx1ZX0gZG9lcyBub3QgZXhpc3QgYXMgYSB2YWx1ZSBpbiB0aGUgUmVzb3VyY2UgJHt0aGlzLmtleX0uYFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGRlZmluaXRpb24udmFsdWVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgUmVzb3VyY2VzIG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgdmFsdWUuICR7dGhpcy52YWx1ZX0gb25seSBoYXMgb25lIHZhbHVlLCBzbyBpdCBjYW4ndCBiZSBkZWxldGVkLiBgXG4gICAgICApO1xuICAgIH1cblxuICAgIGRlZmluaXRpb24udmFsdWVzLnNwbGljZSh2YWx1ZUluZGV4LCAxKTtcblxuICAgIC8vIE5vdyBpdGVyYXRlIHRob3VnaCBhbGwgdGhlIHRhc2tzIGFuZCBjaGFuZ2UgYWxsIHRhc2tzIHRoYXQgaGF2ZVxuICAgIC8vIFwia2V5OnZhbHVlXCIgdG8gaW5zdGVhZCBiZSBcImtleTpkZWZhdWx0XCIuIFJlY29yZCB3aGljaCB0YXNrcyBnb3QgY2hhbmdlZFxuICAgIC8vIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGF0IGluZm9ybWF0aW9uIHdoZW4gd2UgY3JlYXRlIHRoZSBpbnZlcnQgb3BlcmF0aW9uLlxuXG4gICAgY29uc3QgaW5kaWNlc09mVGFza3NXaXRoTWF0Y2hpbmdSZXNvdXJjZVZhbHVlczogbnVtYmVyW10gPSBbXTtcblxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgcmVzb3VyY2VWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpO1xuICAgICAgaWYgKHJlc291cmNlVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAocmVzb3VyY2VWYWx1ZSAhPT0gdGhpcy52YWx1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFNpbmNlIHRoZSB2YWx1ZSBpcyBubyBsb25nZXIgdmFsaWQgd2UgY2hhbmdlIGl0IGJhY2sgdG8gdGhlIGRlZmF1bHQuXG4gICAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCBkZWZpbml0aW9uLnZhbHVlc1swXSk7XG5cbiAgICAgIC8vIFJlY29yZCB3aGljaCB0YXNrIHdlIGp1c3QgY2hhbmdlZC5cbiAgICAgIGluZGljZXNPZlRhc2tzV2l0aE1hdGNoaW5nUmVzb3VyY2VWYWx1ZXMucHVzaChpbmRleCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShpbmRpY2VzT2ZUYXNrc1dpdGhNYXRjaGluZ1Jlc291cmNlVmFsdWVzKSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaW52ZXJzZShpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXSk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFJlc291cmNlT3B0aW9uU3ViT3AoXG4gICAgICB0aGlzLmtleSxcbiAgICAgIHRoaXMudmFsdWUsXG4gICAgICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lUmVzb3VyY2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgb2xkS2V5OiBzdHJpbmc7XG4gIG5ld0tleTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9sZEtleTogc3RyaW5nLCBuZXdLZXk6IHN0cmluZykge1xuICAgIHRoaXMub2xkS2V5ID0gb2xkS2V5O1xuICAgIHRoaXMubmV3S2V5ID0gbmV3S2V5O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3Qgb2xkRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMub2xkS2V5KTtcbiAgICBpZiAob2xkRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5vbGRLZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBuZXdLZXkgaXMgbm90IGFscmVhZHkgdXNlZC5cbiAgICBjb25zdCBuZXdLZXlEZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5uZXdLZXkpO1xuICAgIGlmIChuZXdLZXlEZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld0tleX0gYWxyZWFkeSBleGlzdHMgYXMgYSByZXNvdXJjZSBuYW1lLmApO1xuICAgIH1cblxuICAgIHBsYW4uZGVsZXRlUmVzb3VyY2VEZWZpbml0aW9uKHRoaXMub2xkS2V5KTtcbiAgICBwbGFuLnNldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLm5ld0tleSwgb2xkRGVmaW5pdGlvbik7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGNoYW5nZSBvbGRLZXkgLT4gbmV3a2V5IGZvciB0aGUgZ2l2ZW4gcmVzb3VyY2Uga2V5LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgY29uc3QgY3VycmVudFZhbHVlID1cbiAgICAgICAgdGFzay5nZXRSZXNvdXJjZSh0aGlzLm9sZEtleSkgfHwgREVGQVVMVF9SRVNPVVJDRV9WQUxVRTtcbiAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5uZXdLZXksIGN1cnJlbnRWYWx1ZSk7XG4gICAgICB0YXNrLmRlbGV0ZVJlc291cmNlKHRoaXMub2xkS2V5KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW5hbWVSZXNvdXJjZVN1Yk9wKHRoaXMubmV3S2V5LCB0aGlzLm9sZEtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlbmFtZVJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICBvbGRWYWx1ZTogc3RyaW5nO1xuICBuZXdWYWx1ZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGtleTogc3RyaW5nLCBvbGRWYWx1ZTogc3RyaW5nLCBuZXdWYWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy5vbGRWYWx1ZSA9IG9sZFZhbHVlO1xuICAgIHRoaXMubmV3VmFsdWUgPSBuZXdWYWx1ZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlybSB0aGUgb2xkVmFsdWUgaXMgaW4gdGhlcmUuXG4gICAgY29uc3Qgb2xkVmFsdWVJbmRleCA9IGZvdW5kTWF0Y2gudmFsdWVzLmluZGV4T2YodGhpcy5vbGRWYWx1ZSk7XG5cbiAgICBpZiAob2xkVmFsdWVJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgYSB2YWx1ZSAke3RoaXMub2xkVmFsdWV9YCk7XG4gICAgfVxuXG4gICAgLy8gQ29uZmlybSB0aGUgbmV3VmFsdWUgaXMgbm90IGluIHRoZXJlLlxuICAgIGNvbnN0IG5ld1ZhbHVlSW5kZXggPSBmb3VuZE1hdGNoLnZhbHVlcy5pbmRleE9mKHRoaXMubmV3VmFsdWUpO1xuICAgIGlmIChuZXdWYWx1ZUluZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBhbHJlYWR5IGhhcyBhIHZhbHVlICR7dGhpcy5uZXdWYWx1ZX1gKTtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHRoZSB2YWx1ZXMuXG4gICAgZm91bmRNYXRjaC52YWx1ZXMuc3BsaWNlKG9sZFZhbHVlSW5kZXgsIDEsIHRoaXMubmV3VmFsdWUpO1xuXG4gICAgLy8gTm93IGxvb3Agb3ZlciBldmVyeSB0YXNrIGFuZCBjaGFuZ2Ugb2xkVmFsdWUgLT4gbmV3VmFsdWUgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KTtcbiAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09IHRoaXMub2xkVmFsdWUpIHtcbiAgICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLmtleSwgdGhpcy5uZXdWYWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy5uZXdWYWx1ZSxcbiAgICAgIHRoaXMub2xkVmFsdWVcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNb3ZlUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIG9sZEluZGV4OiBudW1iZXI7XG4gIG5ld0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBudW1iZXIsIG5ld1ZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLm9sZEluZGV4ID0gb2xkVmFsdWU7XG4gICAgdGhpcy5uZXdJbmRleCA9IG5ld1ZhbHVlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5uZXdJbmRleCA8IDApIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm5ld0luZGV4fSBpcyBub3QgYSB2YWxpZCB0YXJnZXQgdmFsdWUuYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub2xkSW5kZXggPiBkZWZpbml0aW9uLnZhbHVlcy5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGAke3RoaXMua2V5fSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUgYXQgaW5kZXggJHt0aGlzLm9sZEluZGV4fWBcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh0aGlzLm5ld0luZGV4ID4gZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIGF0IGluZGV4ICR7dGhpcy5uZXdJbmRleH1gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIFN3YXAgdGhlIHZhbHVlcy5cbiAgICBjb25zdCB0bXAgPSBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm9sZEluZGV4XTtcbiAgICBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm9sZEluZGV4XSA9IGRlZmluaXRpb24udmFsdWVzW3RoaXMubmV3SW5kZXhdO1xuICAgIGRlZmluaXRpb24udmFsdWVzW3RoaXMubmV3SW5kZXhdID0gdG1wO1xuXG4gICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyB3aXRoIFRhc2tzIGJlY2F1c2UgdGhlIGluZGV4IG9mIGEgdmFsdWUgaXNcbiAgICAvLyBpcnJlbGV2YW50IHNpbmNlIHdlIHN0b3JlIHRoZSB2YWx1ZSBpdHNlbGYsIG5vdCB0aGUgaW5kZXguXG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgTW92ZVJlc291cmNlT3B0aW9uU3ViT3AodGhpcy5rZXksIHRoaXMubmV3SW5kZXgsIHRoaXMub2xkSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRSZXNvdXJjZVZhbHVlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICB0YXNrSW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZywgdGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy50YXNrSW5kZXggPSB0YXNrSW5kZXg7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBmb3VuZE1hdGNoID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChmb3VuZE1hdGNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIGNvbnN0IGZvdW5kVmFsdWVNYXRjaCA9IGZvdW5kTWF0Y2gudmFsdWVzLmZpbmRJbmRleCgodjogc3RyaW5nKSA9PiB7XG4gICAgICByZXR1cm4gdiA9PT0gdGhpcy52YWx1ZTtcbiAgICB9KTtcbiAgICBpZiAoZm91bmRWYWx1ZU1hdGNoID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUgb2YgJHt0aGlzLnZhbHVlfWApO1xuICAgIH1cbiAgICBpZiAodGhpcy50YXNrSW5kZXggPCAwIHx8IHRoaXMudGFza0luZGV4ID49IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFRoZXJlIGlzIG5vIFRhc2sgYXQgaW5kZXggJHt0aGlzLnRhc2tJbmRleH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YXNrID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF07XG4gICAgY29uc3Qgb2xkVmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KSE7XG4gICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLmtleSwgdGhpcy52YWx1ZSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkVmFsdWUpIH0pO1xuICB9XG5cbiAgaW52ZXJzZShvbGRWYWx1ZTogc3RyaW5nKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wKHRoaXMua2V5LCBvbGRWYWx1ZSwgdGhpcy50YXNrSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRSZXNvdXJjZU9wKG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZFJlc291cmNlU3ViT3AobmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZVJlc291cmNlT3AobmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgRGVsZXRlUmVzb3VyY2VTdXBPcChuYW1lKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkUmVzb3VyY2VPcHRpb25PcChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IEFkZFJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCB2YWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZVJlc291cmNlT3B0aW9uT3Aoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBEZWxldGVSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgdmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5hbWVSZXNvdXJjZU9wdGlvbk9wKFxuICBrZXk6IHN0cmluZyxcbiAgb2xkVmFsdWU6IHN0cmluZyxcbiAgbmV3VmFsdWU6IHN0cmluZ1xuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIG9sZFZhbHVlLCBuZXdWYWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlbmFtZVJlc291cmNlT3Aob2xkVmFsdWU6IHN0cmluZywgbmV3VmFsdWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJlbmFtZVJlc291cmNlU3ViT3Aob2xkVmFsdWUsIG5ld1ZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTW92ZVJlc291cmNlT3B0aW9uT3AoXG4gIGtleTogc3RyaW5nLFxuICBvbGRJbmRleDogbnVtYmVyLFxuICBuZXdJbmRleDogbnVtYmVyXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBNb3ZlUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIG9sZEluZGV4LCBuZXdJbmRleCldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNldFJlc291cmNlVmFsdWVPcChcbiAga2V5OiBzdHJpbmcsXG4gIHZhbHVlOiBzdHJpbmcsXG4gIHRhc2tJbmRleDogbnVtYmVyXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRSZXNvdXJjZVZhbHVlU3ViT3Aoa2V5LCB2YWx1ZSwgdGFza0luZGV4KV0pO1xufVxuIiwgIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDE3IEdvb2dsZSBMTENcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBCU0QtMy1DbGF1c2VcbiAqL1xuXG5pbXBvcnQge0Rpc2Nvbm5lY3RhYmxlLCBQYXJ0fSBmcm9tICcuL2xpdC1odG1sLmpzJztcblxuZXhwb3J0IHtcbiAgQXR0cmlidXRlUGFydCxcbiAgQm9vbGVhbkF0dHJpYnV0ZVBhcnQsXG4gIENoaWxkUGFydCxcbiAgRWxlbWVudFBhcnQsXG4gIEV2ZW50UGFydCxcbiAgUGFydCxcbiAgUHJvcGVydHlQYXJ0LFxufSBmcm9tICcuL2xpdC1odG1sLmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVDbGFzcyB7XG4gIG5ldyAocGFydDogUGFydEluZm8pOiBEaXJlY3RpdmU7XG59XG5cbi8qKlxuICogVGhpcyB1dGlsaXR5IHR5cGUgZXh0cmFjdHMgdGhlIHNpZ25hdHVyZSBvZiBhIGRpcmVjdGl2ZSBjbGFzcydzIHJlbmRlcigpXG4gKiBtZXRob2Qgc28gd2UgY2FuIHVzZSBpdCBmb3IgdGhlIHR5cGUgb2YgdGhlIGdlbmVyYXRlZCBkaXJlY3RpdmUgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCB0eXBlIERpcmVjdGl2ZVBhcmFtZXRlcnM8QyBleHRlbmRzIERpcmVjdGl2ZT4gPSBQYXJhbWV0ZXJzPENbJ3JlbmRlciddPjtcblxuLyoqXG4gKiBBIGdlbmVyYXRlZCBkaXJlY3RpdmUgZnVuY3Rpb24gZG9lc24ndCBldmFsdWF0ZSB0aGUgZGlyZWN0aXZlLCBidXQganVzdFxuICogcmV0dXJucyBhIERpcmVjdGl2ZVJlc3VsdCBvYmplY3QgdGhhdCBjYXB0dXJlcyB0aGUgYXJndW1lbnRzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGl2ZVJlc3VsdDxDIGV4dGVuZHMgRGlyZWN0aXZlQ2xhc3MgPSBEaXJlY3RpdmVDbGFzcz4ge1xuICAvKipcbiAgICogVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBbJ18kbGl0RGlyZWN0aXZlJCddOiBDO1xuICAvKiogQGludGVybmFsICovXG4gIHZhbHVlczogRGlyZWN0aXZlUGFyYW1ldGVyczxJbnN0YW5jZVR5cGU8Qz4+O1xufVxuXG5leHBvcnQgY29uc3QgUGFydFR5cGUgPSB7XG4gIEFUVFJJQlVURTogMSxcbiAgQ0hJTEQ6IDIsXG4gIFBST1BFUlRZOiAzLFxuICBCT09MRUFOX0FUVFJJQlVURTogNCxcbiAgRVZFTlQ6IDUsXG4gIEVMRU1FTlQ6IDYsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBQYXJ0VHlwZSA9ICh0eXBlb2YgUGFydFR5cGUpW2tleW9mIHR5cGVvZiBQYXJ0VHlwZV07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hpbGRQYXJ0SW5mbyB7XG4gIHJlYWRvbmx5IHR5cGU6IHR5cGVvZiBQYXJ0VHlwZS5DSElMRDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBdHRyaWJ1dGVQYXJ0SW5mbyB7XG4gIHJlYWRvbmx5IHR5cGU6XG4gICAgfCB0eXBlb2YgUGFydFR5cGUuQVRUUklCVVRFXG4gICAgfCB0eXBlb2YgUGFydFR5cGUuUFJPUEVSVFlcbiAgICB8IHR5cGVvZiBQYXJ0VHlwZS5CT09MRUFOX0FUVFJJQlVURVxuICAgIHwgdHlwZW9mIFBhcnRUeXBlLkVWRU5UO1xuICByZWFkb25seSBzdHJpbmdzPzogUmVhZG9ubHlBcnJheTxzdHJpbmc+O1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IHRhZ05hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbGVtZW50UGFydEluZm8ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgUGFydFR5cGUuRUxFTUVOVDtcbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgcGFydCBhIGRpcmVjdGl2ZSBpcyBib3VuZCB0by5cbiAqXG4gKiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2hlY2tpbmcgdGhhdCBhIGRpcmVjdGl2ZSBpcyBhdHRhY2hlZCB0byBhIHZhbGlkIHBhcnQsXG4gKiBzdWNoIGFzIHdpdGggZGlyZWN0aXZlIHRoYXQgY2FuIG9ubHkgYmUgdXNlZCBvbiBhdHRyaWJ1dGUgYmluZGluZ3MuXG4gKi9cbmV4cG9ydCB0eXBlIFBhcnRJbmZvID0gQ2hpbGRQYXJ0SW5mbyB8IEF0dHJpYnV0ZVBhcnRJbmZvIHwgRWxlbWVudFBhcnRJbmZvO1xuXG4vKipcbiAqIENyZWF0ZXMgYSB1c2VyLWZhY2luZyBkaXJlY3RpdmUgZnVuY3Rpb24gZnJvbSBhIERpcmVjdGl2ZSBjbGFzcy4gVGhpc1xuICogZnVuY3Rpb24gaGFzIHRoZSBzYW1lIHBhcmFtZXRlcnMgYXMgdGhlIGRpcmVjdGl2ZSdzIHJlbmRlcigpIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGRpcmVjdGl2ZSA9XG4gIDxDIGV4dGVuZHMgRGlyZWN0aXZlQ2xhc3M+KGM6IEMpID0+XG4gICguLi52YWx1ZXM6IERpcmVjdGl2ZVBhcmFtZXRlcnM8SW5zdGFuY2VUeXBlPEM+Pik6IERpcmVjdGl2ZVJlc3VsdDxDPiA9PiAoe1xuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgWydfJGxpdERpcmVjdGl2ZSQnXTogYyxcbiAgICB2YWx1ZXMsXG4gIH0pO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGNyZWF0aW5nIGN1c3RvbSBkaXJlY3RpdmVzLiBVc2VycyBzaG91bGQgZXh0ZW5kIHRoaXMgY2xhc3MsXG4gKiBpbXBsZW1lbnQgYHJlbmRlcmAgYW5kL29yIGB1cGRhdGVgLCBhbmQgdGhlbiBwYXNzIHRoZWlyIHN1YmNsYXNzIHRvXG4gKiBgZGlyZWN0aXZlYC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERpcmVjdGl2ZSBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgLy9AaW50ZXJuYWxcbiAgX19wYXJ0ITogUGFydDtcbiAgLy9AaW50ZXJuYWxcbiAgX19hdHRyaWJ1dGVJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAvL0BpbnRlcm5hbFxuICBfX2RpcmVjdGl2ZT86IERpcmVjdGl2ZTtcblxuICAvL0BpbnRlcm5hbFxuICBfJHBhcmVudCE6IERpc2Nvbm5lY3RhYmxlO1xuXG4gIC8vIFRoZXNlIHdpbGwgb25seSBleGlzdCBvbiB0aGUgQXN5bmNEaXJlY3RpdmUgc3ViY2xhc3NcbiAgLy9AaW50ZXJuYWxcbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPjtcbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgLy9AaW50ZXJuYWxcbiAgWydfJG5vdGlmeURpcmVjdGl2ZUNvbm5lY3Rpb25DaGFuZ2VkJ10/KGlzQ29ubmVjdGVkOiBib29sZWFuKTogdm9pZDtcblxuICBjb25zdHJ1Y3RvcihfcGFydEluZm86IFBhcnRJbmZvKSB7fVxuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQuXyRpc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRpbml0aWFsaXplKFxuICAgIHBhcnQ6IFBhcnQsXG4gICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSxcbiAgICBhdHRyaWJ1dGVJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHRoaXMuX19wYXJ0ID0gcGFydDtcbiAgICB0aGlzLl8kcGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMuX19hdHRyaWJ1dGVJbmRleCA9IGF0dHJpYnV0ZUluZGV4O1xuICB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRyZXNvbHZlKHBhcnQ6IFBhcnQsIHByb3BzOiBBcnJheTx1bmtub3duPik6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZShwYXJ0LCBwcm9wcyk7XG4gIH1cblxuICBhYnN0cmFjdCByZW5kZXIoLi4ucHJvcHM6IEFycmF5PHVua25vd24+KTogdW5rbm93bjtcblxuICB1cGRhdGUoX3BhcnQ6IFBhcnQsIHByb3BzOiBBcnJheTx1bmtub3duPik6IHVua25vd24ge1xuICAgIHJldHVybiB0aGlzLnJlbmRlciguLi5wcm9wcyk7XG4gIH1cbn1cbiIsICIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAyMCBHb29nbGUgTExDXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQlNELTMtQ2xhdXNlXG4gKi9cblxuaW1wb3J0IHtcbiAgXyRMSCxcbiAgUGFydCxcbiAgRGlyZWN0aXZlUGFyZW50LFxuICBDb21waWxlZFRlbXBsYXRlUmVzdWx0LFxuICBNYXliZUNvbXBpbGVkVGVtcGxhdGVSZXN1bHQsXG4gIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCxcbn0gZnJvbSAnLi9saXQtaHRtbC5qcyc7XG5pbXBvcnQge1xuICBEaXJlY3RpdmVSZXN1bHQsXG4gIERpcmVjdGl2ZUNsYXNzLFxuICBQYXJ0SW5mbyxcbiAgQXR0cmlidXRlUGFydEluZm8sXG59IGZyb20gJy4vZGlyZWN0aXZlLmpzJztcbnR5cGUgUHJpbWl0aXZlID0gbnVsbCB8IHVuZGVmaW5lZCB8IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmcgfCBzeW1ib2wgfCBiaWdpbnQ7XG5cbmNvbnN0IHtfQ2hpbGRQYXJ0OiBDaGlsZFBhcnR9ID0gXyRMSDtcblxudHlwZSBDaGlsZFBhcnQgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIENoaWxkUGFydD47XG5cbmNvbnN0IEVOQUJMRV9TSEFEWURPTV9OT1BBVENIID0gdHJ1ZTtcblxuY29uc3Qgd3JhcCA9XG4gIEVOQUJMRV9TSEFEWURPTV9OT1BBVENIICYmXG4gIHdpbmRvdy5TaGFkeURPTT8uaW5Vc2UgJiZcbiAgd2luZG93LlNoYWR5RE9NPy5ub1BhdGNoID09PSB0cnVlXG4gICAgPyB3aW5kb3cuU2hhZHlET00hLndyYXBcbiAgICA6IChub2RlOiBOb2RlKSA9PiBub2RlO1xuXG4vKipcbiAqIFRlc3RzIGlmIGEgdmFsdWUgaXMgYSBwcmltaXRpdmUgdmFsdWUuXG4gKlxuICogU2VlIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXR5cGVvZi1vcGVyYXRvclxuICovXG5leHBvcnQgY29uc3QgaXNQcmltaXRpdmUgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBQcmltaXRpdmUgPT5cbiAgdmFsdWUgPT09IG51bGwgfHwgKHR5cGVvZiB2YWx1ZSAhPSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsdWUgIT0gJ2Z1bmN0aW9uJyk7XG5cbmV4cG9ydCBjb25zdCBUZW1wbGF0ZVJlc3VsdFR5cGUgPSB7XG4gIEhUTUw6IDEsXG4gIFNWRzogMixcbiAgTUFUSE1MOiAzLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IHR5cGUgVGVtcGxhdGVSZXN1bHRUeXBlID1cbiAgKHR5cGVvZiBUZW1wbGF0ZVJlc3VsdFR5cGUpW2tleW9mIHR5cGVvZiBUZW1wbGF0ZVJlc3VsdFR5cGVdO1xuXG50eXBlIElzVGVtcGxhdGVSZXN1bHQgPSB7XG4gICh2YWw6IHVua25vd24pOiB2YWwgaXMgTWF5YmVDb21waWxlZFRlbXBsYXRlUmVzdWx0O1xuICA8VCBleHRlbmRzIFRlbXBsYXRlUmVzdWx0VHlwZT4oXG4gICAgdmFsOiB1bmtub3duLFxuICAgIHR5cGU6IFRcbiAgKTogdmFsIGlzIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUPjtcbn07XG5cbi8qKlxuICogVGVzdHMgaWYgYSB2YWx1ZSBpcyBhIFRlbXBsYXRlUmVzdWx0IG9yIGEgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzVGVtcGxhdGVSZXN1bHQ6IElzVGVtcGxhdGVSZXN1bHQgPSAoXG4gIHZhbHVlOiB1bmtub3duLFxuICB0eXBlPzogVGVtcGxhdGVSZXN1bHRUeXBlXG4pOiB2YWx1ZSBpcyBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQgPT5cbiAgdHlwZSA9PT0gdW5kZWZpbmVkXG4gICAgPyAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgICAgKHZhbHVlIGFzIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdCk/LlsnXyRsaXRUeXBlJCddICE9PSB1bmRlZmluZWRcbiAgICA6ICh2YWx1ZSBhcyBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQpPy5bJ18kbGl0VHlwZSQnXSA9PT0gdHlwZTtcblxuLyoqXG4gKiBUZXN0cyBpZiBhIHZhbHVlIGlzIGEgQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzQ29tcGlsZWRUZW1wbGF0ZVJlc3VsdCA9IChcbiAgdmFsdWU6IHVua25vd25cbik6IHZhbHVlIGlzIENvbXBpbGVkVGVtcGxhdGVSZXN1bHQgPT4ge1xuICByZXR1cm4gKHZhbHVlIGFzIENvbXBpbGVkVGVtcGxhdGVSZXN1bHQpPy5bJ18kbGl0VHlwZSQnXT8uaCAhPSBudWxsO1xufTtcblxuLyoqXG4gKiBUZXN0cyBpZiBhIHZhbHVlIGlzIGEgRGlyZWN0aXZlUmVzdWx0LlxuICovXG5leHBvcnQgY29uc3QgaXNEaXJlY3RpdmVSZXN1bHQgPSAodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBEaXJlY3RpdmVSZXN1bHQgPT5cbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgKHZhbHVlIGFzIERpcmVjdGl2ZVJlc3VsdCk/LlsnXyRsaXREaXJlY3RpdmUkJ10gIT09IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIERpcmVjdGl2ZSBjbGFzcyBmb3IgYSBEaXJlY3RpdmVSZXN1bHRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldERpcmVjdGl2ZUNsYXNzID0gKHZhbHVlOiB1bmtub3duKTogRGlyZWN0aXZlQ2xhc3MgfCB1bmRlZmluZWQgPT5cbiAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgKHZhbHVlIGFzIERpcmVjdGl2ZVJlc3VsdCk/LlsnXyRsaXREaXJlY3RpdmUkJ107XG5cbi8qKlxuICogVGVzdHMgd2hldGhlciBhIHBhcnQgaGFzIG9ubHkgYSBzaW5nbGUtZXhwcmVzc2lvbiB3aXRoIG5vIHN0cmluZ3MgdG9cbiAqIGludGVycG9sYXRlIGJldHdlZW4uXG4gKlxuICogT25seSBBdHRyaWJ1dGVQYXJ0IGFuZCBQcm9wZXJ0eVBhcnQgY2FuIGhhdmUgbXVsdGlwbGUgZXhwcmVzc2lvbnMuXG4gKiBNdWx0aS1leHByZXNzaW9uIHBhcnRzIGhhdmUgYSBgc3RyaW5nc2AgcHJvcGVydHkgYW5kIHNpbmdsZS1leHByZXNzaW9uXG4gKiBwYXJ0cyBkbyBub3QuXG4gKi9cbmV4cG9ydCBjb25zdCBpc1NpbmdsZUV4cHJlc3Npb24gPSAocGFydDogUGFydEluZm8pID0+XG4gIChwYXJ0IGFzIEF0dHJpYnV0ZVBhcnRJbmZvKS5zdHJpbmdzID09PSB1bmRlZmluZWQ7XG5cbmNvbnN0IGNyZWF0ZU1hcmtlciA9ICgpID0+IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJycpO1xuXG4vKipcbiAqIEluc2VydHMgYSBDaGlsZFBhcnQgaW50byB0aGUgZ2l2ZW4gY29udGFpbmVyIENoaWxkUGFydCdzIERPTSwgZWl0aGVyIGF0IHRoZVxuICogZW5kIG9mIHRoZSBjb250YWluZXIgQ2hpbGRQYXJ0LCBvciBiZWZvcmUgdGhlIG9wdGlvbmFsIGByZWZQYXJ0YC5cbiAqXG4gKiBUaGlzIGRvZXMgbm90IGFkZCB0aGUgcGFydCB0byB0aGUgY29udGFpbmVyUGFydCdzIGNvbW1pdHRlZCB2YWx1ZS4gVGhhdCBtdXN0XG4gKiBiZSBkb25lIGJ5IGNhbGxlcnMuXG4gKlxuICogQHBhcmFtIGNvbnRhaW5lclBhcnQgUGFydCB3aXRoaW4gd2hpY2ggdG8gYWRkIHRoZSBuZXcgQ2hpbGRQYXJ0XG4gKiBAcGFyYW0gcmVmUGFydCBQYXJ0IGJlZm9yZSB3aGljaCB0byBhZGQgdGhlIG5ldyBDaGlsZFBhcnQ7IHdoZW4gb21pdHRlZCB0aGVcbiAqICAgICBwYXJ0IGFkZGVkIHRvIHRoZSBlbmQgb2YgdGhlIGBjb250YWluZXJQYXJ0YFxuICogQHBhcmFtIHBhcnQgUGFydCB0byBpbnNlcnQsIG9yIHVuZGVmaW5lZCB0byBjcmVhdGUgYSBuZXcgcGFydFxuICovXG5leHBvcnQgY29uc3QgaW5zZXJ0UGFydCA9IChcbiAgY29udGFpbmVyUGFydDogQ2hpbGRQYXJ0LFxuICByZWZQYXJ0PzogQ2hpbGRQYXJ0LFxuICBwYXJ0PzogQ2hpbGRQYXJ0XG4pOiBDaGlsZFBhcnQgPT4ge1xuICBjb25zdCBjb250YWluZXIgPSB3cmFwKGNvbnRhaW5lclBhcnQuXyRzdGFydE5vZGUpLnBhcmVudE5vZGUhO1xuXG4gIGNvbnN0IHJlZk5vZGUgPVxuICAgIHJlZlBhcnQgPT09IHVuZGVmaW5lZCA/IGNvbnRhaW5lclBhcnQuXyRlbmROb2RlIDogcmVmUGFydC5fJHN0YXJ0Tm9kZTtcblxuICBpZiAocGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qgc3RhcnROb2RlID0gd3JhcChjb250YWluZXIpLmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgcmVmTm9kZSk7XG4gICAgY29uc3QgZW5kTm9kZSA9IHdyYXAoY29udGFpbmVyKS5pbnNlcnRCZWZvcmUoY3JlYXRlTWFya2VyKCksIHJlZk5vZGUpO1xuICAgIHBhcnQgPSBuZXcgQ2hpbGRQYXJ0KFxuICAgICAgc3RhcnROb2RlLFxuICAgICAgZW5kTm9kZSxcbiAgICAgIGNvbnRhaW5lclBhcnQsXG4gICAgICBjb250YWluZXJQYXJ0Lm9wdGlvbnNcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGVuZE5vZGUgPSB3cmFwKHBhcnQuXyRlbmROb2RlISkubmV4dFNpYmxpbmc7XG4gICAgY29uc3Qgb2xkUGFyZW50ID0gcGFydC5fJHBhcmVudDtcbiAgICBjb25zdCBwYXJlbnRDaGFuZ2VkID0gb2xkUGFyZW50ICE9PSBjb250YWluZXJQYXJ0O1xuICAgIGlmIChwYXJlbnRDaGFuZ2VkKSB7XG4gICAgICBwYXJ0Ll8kcmVwYXJlbnREaXNjb25uZWN0YWJsZXM/Lihjb250YWluZXJQYXJ0KTtcbiAgICAgIC8vIE5vdGUgdGhhdCBhbHRob3VnaCBgXyRyZXBhcmVudERpc2Nvbm5lY3RhYmxlc2AgdXBkYXRlcyB0aGUgcGFydCdzXG4gICAgICAvLyBgXyRwYXJlbnRgIHJlZmVyZW5jZSBhZnRlciB1bmxpbmtpbmcgZnJvbSBpdHMgY3VycmVudCBwYXJlbnQsIHRoYXRcbiAgICAgIC8vIG1ldGhvZCBvbmx5IGV4aXN0cyBpZiBEaXNjb25uZWN0YWJsZXMgYXJlIHByZXNlbnQsIHNvIHdlIG5lZWQgdG9cbiAgICAgIC8vIHVuY29uZGl0aW9uYWxseSBzZXQgaXQgaGVyZVxuICAgICAgcGFydC5fJHBhcmVudCA9IGNvbnRhaW5lclBhcnQ7XG4gICAgICAvLyBTaW5jZSB0aGUgXyRpc0Nvbm5lY3RlZCBnZXR0ZXIgaXMgc29tZXdoYXQgY29zdGx5LCBvbmx5XG4gICAgICAvLyByZWFkIGl0IG9uY2Ugd2Uga25vdyB0aGUgc3VidHJlZSBoYXMgZGlyZWN0aXZlcyB0aGF0IG5lZWRcbiAgICAgIC8vIHRvIGJlIG5vdGlmaWVkXG4gICAgICBsZXQgbmV3Q29ubmVjdGlvblN0YXRlO1xuICAgICAgaWYgKFxuICAgICAgICBwYXJ0Ll8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAobmV3Q29ubmVjdGlvblN0YXRlID0gY29udGFpbmVyUGFydC5fJGlzQ29ubmVjdGVkKSAhPT1cbiAgICAgICAgICBvbGRQYXJlbnQhLl8kaXNDb25uZWN0ZWRcbiAgICAgICkge1xuICAgICAgICBwYXJ0Ll8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQobmV3Q29ubmVjdGlvblN0YXRlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVuZE5vZGUgIT09IHJlZk5vZGUgfHwgcGFyZW50Q2hhbmdlZCkge1xuICAgICAgbGV0IHN0YXJ0OiBOb2RlIHwgbnVsbCA9IHBhcnQuXyRzdGFydE5vZGU7XG4gICAgICB3aGlsZSAoc3RhcnQgIT09IGVuZE5vZGUpIHtcbiAgICAgICAgY29uc3QgbjogTm9kZSB8IG51bGwgPSB3cmFwKHN0YXJ0ISkubmV4dFNpYmxpbmc7XG4gICAgICAgIHdyYXAoY29udGFpbmVyKS5pbnNlcnRCZWZvcmUoc3RhcnQhLCByZWZOb2RlKTtcbiAgICAgICAgc3RhcnQgPSBuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXJ0O1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIFBhcnQuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZCB0byBzZXQvdXBkYXRlIHRoZSB2YWx1ZSBvZiB1c2VyLWNyZWF0ZWRcbiAqIHBhcnRzIChpLmUuIHRob3NlIGNyZWF0ZWQgdXNpbmcgYGluc2VydFBhcnRgKTsgaXQgc2hvdWxkIG5vdCBiZSB1c2VkXG4gKiBieSBkaXJlY3RpdmVzIHRvIHNldCB0aGUgdmFsdWUgb2YgdGhlIGRpcmVjdGl2ZSdzIGNvbnRhaW5lciBwYXJ0LiBEaXJlY3RpdmVzXG4gKiBzaG91bGQgcmV0dXJuIGEgdmFsdWUgZnJvbSBgdXBkYXRlYC9gcmVuZGVyYCB0byB1cGRhdGUgdGhlaXIgcGFydCBzdGF0ZS5cbiAqXG4gKiBGb3IgZGlyZWN0aXZlcyB0aGF0IHJlcXVpcmUgc2V0dGluZyB0aGVpciBwYXJ0IHZhbHVlIGFzeW5jaHJvbm91c2x5LCB0aGV5XG4gKiBzaG91bGQgZXh0ZW5kIGBBc3luY0RpcmVjdGl2ZWAgYW5kIGNhbGwgYHRoaXMuc2V0VmFsdWUoKWAuXG4gKlxuICogQHBhcmFtIHBhcnQgUGFydCB0byBzZXRcbiAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byBzZXRcbiAqIEBwYXJhbSBpbmRleCBGb3IgYEF0dHJpYnV0ZVBhcnRgcywgdGhlIGluZGV4IHRvIHNldFxuICogQHBhcmFtIGRpcmVjdGl2ZVBhcmVudCBVc2VkIGludGVybmFsbHk7IHNob3VsZCBub3QgYmUgc2V0IGJ5IHVzZXJcbiAqL1xuZXhwb3J0IGNvbnN0IHNldENoaWxkUGFydFZhbHVlID0gPFQgZXh0ZW5kcyBDaGlsZFBhcnQ+KFxuICBwYXJ0OiBULFxuICB2YWx1ZTogdW5rbm93bixcbiAgZGlyZWN0aXZlUGFyZW50OiBEaXJlY3RpdmVQYXJlbnQgPSBwYXJ0XG4pOiBUID0+IHtcbiAgcGFydC5fJHNldFZhbHVlKHZhbHVlLCBkaXJlY3RpdmVQYXJlbnQpO1xuICByZXR1cm4gcGFydDtcbn07XG5cbi8vIEEgc2VudGluZWwgdmFsdWUgdGhhdCBjYW4gbmV2ZXIgYXBwZWFyIGFzIGEgcGFydCB2YWx1ZSBleGNlcHQgd2hlbiBzZXQgYnlcbi8vIGxpdmUoKS4gVXNlZCB0byBmb3JjZSBhIGRpcnR5LWNoZWNrIHRvIGZhaWwgYW5kIGNhdXNlIGEgcmUtcmVuZGVyLlxuY29uc3QgUkVTRVRfVkFMVUUgPSB7fTtcblxuLyoqXG4gKiBTZXRzIHRoZSBjb21taXR0ZWQgdmFsdWUgb2YgYSBDaGlsZFBhcnQgZGlyZWN0bHkgd2l0aG91dCB0cmlnZ2VyaW5nIHRoZVxuICogY29tbWl0IHN0YWdlIG9mIHRoZSBwYXJ0LlxuICpcbiAqIFRoaXMgaXMgdXNlZnVsIGluIGNhc2VzIHdoZXJlIGEgZGlyZWN0aXZlIG5lZWRzIHRvIHVwZGF0ZSB0aGUgcGFydCBzdWNoXG4gKiB0aGF0IHRoZSBuZXh0IHVwZGF0ZSBkZXRlY3RzIGEgdmFsdWUgY2hhbmdlIG9yIG5vdC4gV2hlbiB2YWx1ZSBpcyBvbWl0dGVkLFxuICogdGhlIG5leHQgdXBkYXRlIHdpbGwgYmUgZ3VhcmFudGVlZCB0byBiZSBkZXRlY3RlZCBhcyBhIGNoYW5nZS5cbiAqXG4gKiBAcGFyYW0gcGFydFxuICogQHBhcmFtIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBzZXRDb21taXR0ZWRWYWx1ZSA9IChwYXJ0OiBQYXJ0LCB2YWx1ZTogdW5rbm93biA9IFJFU0VUX1ZBTFVFKSA9PlxuICAocGFydC5fJGNvbW1pdHRlZFZhbHVlID0gdmFsdWUpO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGNvbW1pdHRlZCB2YWx1ZSBvZiBhIENoaWxkUGFydC5cbiAqXG4gKiBUaGUgY29tbWl0dGVkIHZhbHVlIGlzIHVzZWQgZm9yIGNoYW5nZSBkZXRlY3Rpb24gYW5kIGVmZmljaWVudCB1cGRhdGVzIG9mXG4gKiB0aGUgcGFydC4gSXQgY2FuIGRpZmZlciBmcm9tIHRoZSB2YWx1ZSBzZXQgYnkgdGhlIHRlbXBsYXRlIG9yIGRpcmVjdGl2ZSBpblxuICogY2FzZXMgd2hlcmUgdGhlIHRlbXBsYXRlIHZhbHVlIGlzIHRyYW5zZm9ybWVkIGJlZm9yZSBiZWluZyBjb21taXR0ZWQuXG4gKlxuICogLSBgVGVtcGxhdGVSZXN1bHRgcyBhcmUgY29tbWl0dGVkIGFzIGEgYFRlbXBsYXRlSW5zdGFuY2VgXG4gKiAtIEl0ZXJhYmxlcyBhcmUgY29tbWl0dGVkIGFzIGBBcnJheTxDaGlsZFBhcnQ+YFxuICogLSBBbGwgb3RoZXIgdHlwZXMgYXJlIGNvbW1pdHRlZCBhcyB0aGUgdGVtcGxhdGUgdmFsdWUgb3IgdmFsdWUgcmV0dXJuZWQgb3JcbiAqICAgc2V0IGJ5IGEgZGlyZWN0aXZlLlxuICpcbiAqIEBwYXJhbSBwYXJ0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRDb21taXR0ZWRWYWx1ZSA9IChwYXJ0OiBDaGlsZFBhcnQpID0+IHBhcnQuXyRjb21taXR0ZWRWYWx1ZTtcblxuLyoqXG4gKiBSZW1vdmVzIGEgQ2hpbGRQYXJ0IGZyb20gdGhlIERPTSwgaW5jbHVkaW5nIGFueSBvZiBpdHMgY29udGVudC5cbiAqXG4gKiBAcGFyYW0gcGFydCBUaGUgUGFydCB0byByZW1vdmVcbiAqL1xuZXhwb3J0IGNvbnN0IHJlbW92ZVBhcnQgPSAocGFydDogQ2hpbGRQYXJ0KSA9PiB7XG4gIHBhcnQuXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZD8uKGZhbHNlLCB0cnVlKTtcbiAgbGV0IHN0YXJ0OiBDaGlsZE5vZGUgfCBudWxsID0gcGFydC5fJHN0YXJ0Tm9kZTtcbiAgY29uc3QgZW5kOiBDaGlsZE5vZGUgfCBudWxsID0gd3JhcChwYXJ0Ll8kZW5kTm9kZSEpLm5leHRTaWJsaW5nO1xuICB3aGlsZSAoc3RhcnQgIT09IGVuZCkge1xuICAgIGNvbnN0IG46IENoaWxkTm9kZSB8IG51bGwgPSB3cmFwKHN0YXJ0ISkubmV4dFNpYmxpbmc7XG4gICAgKHdyYXAoc3RhcnQhKSBhcyBDaGlsZE5vZGUpLnJlbW92ZSgpO1xuICAgIHN0YXJ0ID0gbjtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGNsZWFyUGFydCA9IChwYXJ0OiBDaGlsZFBhcnQpID0+IHtcbiAgcGFydC5fJGNsZWFyKCk7XG59O1xuIiwgIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDIwIEdvb2dsZSBMTENcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBCU0QtMy1DbGF1c2VcbiAqL1xuXG5pbXBvcnQge0F0dHJpYnV0ZVBhcnQsIG5vQ2hhbmdlLCBub3RoaW5nfSBmcm9tICcuLi9saXQtaHRtbC5qcyc7XG5pbXBvcnQge1xuICBkaXJlY3RpdmUsXG4gIERpcmVjdGl2ZSxcbiAgRGlyZWN0aXZlUGFyYW1ldGVycyxcbiAgUGFydEluZm8sXG4gIFBhcnRUeXBlLFxufSBmcm9tICcuLi9kaXJlY3RpdmUuanMnO1xuaW1wb3J0IHtpc1NpbmdsZUV4cHJlc3Npb24sIHNldENvbW1pdHRlZFZhbHVlfSBmcm9tICcuLi9kaXJlY3RpdmUtaGVscGVycy5qcyc7XG5cbmNsYXNzIExpdmVEaXJlY3RpdmUgZXh0ZW5kcyBEaXJlY3RpdmUge1xuICBjb25zdHJ1Y3RvcihwYXJ0SW5mbzogUGFydEluZm8pIHtcbiAgICBzdXBlcihwYXJ0SW5mbyk7XG4gICAgaWYgKFxuICAgICAgIShcbiAgICAgICAgcGFydEluZm8udHlwZSA9PT0gUGFydFR5cGUuUFJPUEVSVFkgfHxcbiAgICAgICAgcGFydEluZm8udHlwZSA9PT0gUGFydFR5cGUuQVRUUklCVVRFIHx8XG4gICAgICAgIHBhcnRJbmZvLnR5cGUgPT09IFBhcnRUeXBlLkJPT0xFQU5fQVRUUklCVVRFXG4gICAgICApXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdUaGUgYGxpdmVgIGRpcmVjdGl2ZSBpcyBub3QgYWxsb3dlZCBvbiBjaGlsZCBvciBldmVudCBiaW5kaW5ncydcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICghaXNTaW5nbGVFeHByZXNzaW9uKHBhcnRJbmZvKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgbGl2ZWAgYmluZGluZ3MgY2FuIG9ubHkgY29udGFpbiBhIHNpbmdsZSBleHByZXNzaW9uJyk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKHZhbHVlOiB1bmtub3duKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgb3ZlcnJpZGUgdXBkYXRlKHBhcnQ6IEF0dHJpYnV0ZVBhcnQsIFt2YWx1ZV06IERpcmVjdGl2ZVBhcmFtZXRlcnM8dGhpcz4pIHtcbiAgICBpZiAodmFsdWUgPT09IG5vQ2hhbmdlIHx8IHZhbHVlID09PSBub3RoaW5nKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGNvbnN0IGVsZW1lbnQgPSBwYXJ0LmVsZW1lbnQ7XG4gICAgY29uc3QgbmFtZSA9IHBhcnQubmFtZTtcblxuICAgIGlmIChwYXJ0LnR5cGUgPT09IFBhcnRUeXBlLlBST1BFUlRZKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgaWYgKHZhbHVlID09PSAoZWxlbWVudCBhcyBhbnkpW25hbWVdKSB7XG4gICAgICAgIHJldHVybiBub0NoYW5nZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHBhcnQudHlwZSA9PT0gUGFydFR5cGUuQk9PTEVBTl9BVFRSSUJVVEUpIHtcbiAgICAgIGlmICghIXZhbHVlID09PSBlbGVtZW50Lmhhc0F0dHJpYnV0ZShuYW1lKSkge1xuICAgICAgICByZXR1cm4gbm9DaGFuZ2U7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChwYXJ0LnR5cGUgPT09IFBhcnRUeXBlLkFUVFJJQlVURSkge1xuICAgICAgaWYgKGVsZW1lbnQuZ2V0QXR0cmlidXRlKG5hbWUpID09PSBTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBub0NoYW5nZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVzZXRzIHRoZSBwYXJ0J3MgdmFsdWUsIGNhdXNpbmcgaXRzIGRpcnR5LWNoZWNrIHRvIGZhaWwgc28gdGhhdCBpdFxuICAgIC8vIGFsd2F5cyBzZXRzIHRoZSB2YWx1ZS5cbiAgICBzZXRDb21taXR0ZWRWYWx1ZShwYXJ0KTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVja3MgYmluZGluZyB2YWx1ZXMgYWdhaW5zdCBsaXZlIERPTSB2YWx1ZXMsIGluc3RlYWQgb2YgcHJldmlvdXNseSBib3VuZFxuICogdmFsdWVzLCB3aGVuIGRldGVybWluaW5nIHdoZXRoZXIgdG8gdXBkYXRlIHRoZSB2YWx1ZS5cbiAqXG4gKiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2FzZXMgd2hlcmUgdGhlIERPTSB2YWx1ZSBtYXkgY2hhbmdlIGZyb20gb3V0c2lkZSBvZlxuICogbGl0LWh0bWwsIHN1Y2ggYXMgd2l0aCBhIGJpbmRpbmcgdG8gYW4gYDxpbnB1dD5gIGVsZW1lbnQncyBgdmFsdWVgIHByb3BlcnR5LFxuICogYSBjb250ZW50IGVkaXRhYmxlIGVsZW1lbnRzIHRleHQsIG9yIHRvIGEgY3VzdG9tIGVsZW1lbnQgdGhhdCBjaGFuZ2VzIGl0J3NcbiAqIG93biBwcm9wZXJ0aWVzIG9yIGF0dHJpYnV0ZXMuXG4gKlxuICogSW4gdGhlc2UgY2FzZXMgaWYgdGhlIERPTSB2YWx1ZSBjaGFuZ2VzLCBidXQgdGhlIHZhbHVlIHNldCB0aHJvdWdoIGxpdC1odG1sXG4gKiBiaW5kaW5ncyBoYXNuJ3QsIGxpdC1odG1sIHdvbid0IGtub3cgdG8gdXBkYXRlIHRoZSBET00gdmFsdWUgYW5kIHdpbGwgbGVhdmVcbiAqIGl0IGFsb25lLiBJZiB0aGlzIGlzIG5vdCB3aGF0IHlvdSB3YW50LS1pZiB5b3Ugd2FudCB0byBvdmVyd3JpdGUgdGhlIERPTVxuICogdmFsdWUgd2l0aCB0aGUgYm91bmQgdmFsdWUgbm8gbWF0dGVyIHdoYXQtLXVzZSB0aGUgYGxpdmUoKWAgZGlyZWN0aXZlOlxuICpcbiAqIGBgYGpzXG4gKiBodG1sYDxpbnB1dCAudmFsdWU9JHtsaXZlKHgpfT5gXG4gKiBgYGBcbiAqXG4gKiBgbGl2ZSgpYCBwZXJmb3JtcyBhIHN0cmljdCBlcXVhbGl0eSBjaGVjayBhZ2FpbnN0IHRoZSBsaXZlIERPTSB2YWx1ZSwgYW5kIGlmXG4gKiB0aGUgbmV3IHZhbHVlIGlzIGVxdWFsIHRvIHRoZSBsaXZlIHZhbHVlLCBkb2VzIG5vdGhpbmcuIFRoaXMgbWVhbnMgdGhhdFxuICogYGxpdmUoKWAgc2hvdWxkIG5vdCBiZSB1c2VkIHdoZW4gdGhlIGJpbmRpbmcgd2lsbCBjYXVzZSBhIHR5cGUgY29udmVyc2lvbi4gSWZcbiAqIHlvdSB1c2UgYGxpdmUoKWAgd2l0aCBhbiBhdHRyaWJ1dGUgYmluZGluZywgbWFrZSBzdXJlIHRoYXQgb25seSBzdHJpbmdzIGFyZVxuICogcGFzc2VkIGluLCBvciB0aGUgYmluZGluZyB3aWxsIHVwZGF0ZSBldmVyeSByZW5kZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBsaXZlID0gZGlyZWN0aXZlKExpdmVEaXJlY3RpdmUpO1xuXG4vKipcbiAqIFRoZSB0eXBlIG9mIHRoZSBjbGFzcyB0aGF0IHBvd2VycyB0aGlzIGRpcmVjdGl2ZS4gTmVjZXNzYXJ5IGZvciBuYW1pbmcgdGhlXG4gKiBkaXJlY3RpdmUncyByZXR1cm4gdHlwZS5cbiAqL1xuZXhwb3J0IHR5cGUge0xpdmVEaXJlY3RpdmV9O1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IFJlc291cmNlRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9yZXNvdXJjZXMvcmVzb3VyY2VzXCI7XG5pbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgaWNvbiB9IGZyb20gXCIuLi9pY29ucy9pY29uc1wiO1xuaW1wb3J0IHsgZXhlY3V0ZU9wIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlXCI7XG5pbXBvcnQge1xuICBBZGRSZXNvdXJjZU9wdGlvbk9wLFxuICBEZWxldGVSZXNvdXJjZU9wdGlvbk9wLFxuICBNb3ZlUmVzb3VyY2VPcHRpb25PcCxcbiAgUmVuYW1lUmVzb3VyY2VPcCxcbiAgUmVuYW1lUmVzb3VyY2VPcHRpb25PcCxcbn0gZnJvbSBcIi4uL29wcy9yZXNvdXJjZXNcIjtcbmltcG9ydCB7IE9wIH0gZnJvbSBcIi4uL29wcy9vcHNcIjtcbmltcG9ydCB7IFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHRcIjtcbmltcG9ydCB7IGxpdmUgfSBmcm9tIFwibGl0LWh0bWwvZGlyZWN0aXZlcy9saXZlLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBFZGl0UmVzb3VyY2VEZWZpbml0aW9uIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBleHBsYW5NYWluOiBFeHBsYW5NYWluIHwgbnVsbCA9IG51bGw7XG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uID0gbmV3IFJlc291cmNlRGVmaW5pdGlvbigpO1xuICBuYW1lOiBzdHJpbmcgPSBcIlwiO1xuICBwbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFjazogKCkgPT4gdm9pZDtcbiAgbmV3VmFsdWVDb3VudGVyID0gMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH07XG4gIH1cblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBzaG93TW9kYWwoXG4gICAgZXhwbGFuTWFpbjogRXhwbGFuTWFpbixcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb25cbiAgKSB7XG4gICAgdGhpcy5leHBsYW5NYWluID0gZXhwbGFuTWFpbjtcbiAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbiA9IHJlc291cmNlRGVmaW5pdGlvbjtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxEaWFsb2dFbGVtZW50PihcImRpYWxvZ1wiKSEuc2hvd01vZGFsKCk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlcigpIHtcbiAgICByZW5kZXIodGhpcy50ZW1wbGF0ZSgpLCB0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgY2FuY2VsKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLmNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGV4ZWN1dGVPcChvcDogT3ApOiBQcm9taXNlPFJlc3VsdDxudWxsPj4ge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGVPcChcbiAgICAgIG9wLFxuICAgICAgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIixcbiAgICAgIHRydWUsXG4gICAgICB0aGlzLmV4cGxhbk1haW4hXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgd2luZG93LmFsZXJ0KHJldC5lcnJvcik7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNoYW5nZVJlc291cmNlTmFtZShlOiBFdmVudCwgbmV3TmFtZTogc3RyaW5nLCBvbGROYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZXQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVPcChSZW5hbWVSZXNvdXJjZU9wKG9sZE5hbWUsIG5ld05hbWUpKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgd2luZG93LmFsZXJ0KHJldC5lcnJvcik7XG4gICAgICB0aGlzLm5hbWUgPSBvbGROYW1lO1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG4gICAgdGhpcy5uYW1lID0gbmV3TmFtZTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY2hhbmdlUmVzb3VyY2VWYWx1ZU5hbWUoXG4gICAgZTogRXZlbnQsXG4gICAgbmV3VmFsdWU6IHN0cmluZyxcbiAgICBvbGRWYWx1ZTogc3RyaW5nXG4gICkge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IHRoaXMuZXhlY3V0ZU9wKFxuICAgICAgUmVuYW1lUmVzb3VyY2VPcHRpb25PcCh0aGlzLm5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSlcbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICB3aW5kb3cuYWxlcnQocmV0LmVycm9yKTtcbiAgICAgIChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSA9IG9sZFZhbHVlO1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFByb3Bvc2VkUmVzb3VyY2VOYW1lKCk6IHN0cmluZyB7XG4gICAgdGhpcy5uZXdWYWx1ZUNvdW50ZXIrKztcbiAgICByZXR1cm4gYE5ldyBWYWx1ZSAke3RoaXMubmV3VmFsdWVDb3VudGVyfWA7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG5ld1Jlc291cmNlVmFsdWUoKSB7XG4gICAgdGhpcy5uZXdWYWx1ZUNvdW50ZXIgPSAwO1xuICAgIC8vIENvbWUgdXAgd2l0aCBhIHVuaXF1ZSBuYW1lIHRvIGFkZCwgc2luY2UgYWxsIHJlc291cmNlIHZhbHVlcyBtdXN0IGJlXG4gICAgLy8gdW5pcXVlIGZvciBhIGdpdmVuIHJlc291cmNlIG5hbWUuXG4gICAgbGV0IG5ld1Jlc291cmNlTmFtZSA9IHRoaXMuZ2V0UHJvcG9zZWRSZXNvdXJjZU5hbWUoKTtcbiAgICB3aGlsZSAoXG4gICAgICB0aGlzLmV4cGxhbk1haW4hLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9uc1t0aGlzLm5hbWVdLnZhbHVlcy5maW5kSW5kZXgoXG4gICAgICAgICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZSA9PT0gbmV3UmVzb3VyY2VOYW1lXG4gICAgICApICE9IC0xXG4gICAgKSB7XG4gICAgICBuZXdSZXNvdXJjZU5hbWUgPSB0aGlzLmdldFByb3Bvc2VkUmVzb3VyY2VOYW1lKCk7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoQWRkUmVzb3VyY2VPcHRpb25PcCh0aGlzLm5hbWUsIG5ld1Jlc291cmNlTmFtZSkpO1xuICB9XG4gIHByaXZhdGUgYXN5bmMgbW92ZVVwKHZhbHVlOiBzdHJpbmcsIHZhbHVlSW5kZXg6IG51bWJlcikge1xuICAgIGF3YWl0IHRoaXMuZXhlY3V0ZU9wKFxuICAgICAgTW92ZVJlc291cmNlT3B0aW9uT3AodGhpcy5uYW1lLCB2YWx1ZUluZGV4LCB2YWx1ZUluZGV4IC0gMSlcbiAgICApO1xuICB9XG4gIHByaXZhdGUgYXN5bmMgbW92ZURvd24odmFsdWU6IHN0cmluZywgdmFsdWVJbmRleDogbnVtYmVyKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoXG4gICAgICBNb3ZlUmVzb3VyY2VPcHRpb25PcCh0aGlzLm5hbWUsIHZhbHVlSW5kZXgsIHZhbHVlSW5kZXggKyAxKVxuICAgICk7XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyBtb3ZlVG9Ub3AodmFsdWU6IHN0cmluZywgdmFsdWVJbmRleDogbnVtYmVyKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoTW92ZVJlc291cmNlT3B0aW9uT3AodGhpcy5uYW1lLCB2YWx1ZUluZGV4LCAwKSk7XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyBtb3ZlVG9Cb3R0b20odmFsdWU6IHN0cmluZywgdmFsdWVJbmRleDogbnVtYmVyKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlT3AoXG4gICAgICBNb3ZlUmVzb3VyY2VPcHRpb25PcChcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB2YWx1ZUluZGV4LFxuICAgICAgICB0aGlzLmV4cGxhbk1haW4hLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9uc1t0aGlzLm5hbWVdIS52YWx1ZXMubGVuZ3RoIC0gMVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyBkZWxldGVSZXNvdXJjZVZhbHVlKHZhbHVlOiBzdHJpbmcsIHZhbHVlSW5kZXg6IG51bWJlcikge1xuICAgIGF3YWl0IHRoaXMuZXhlY3V0ZU9wKERlbGV0ZVJlc291cmNlT3B0aW9uT3AodGhpcy5uYW1lLCB2YWx1ZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSB0ZW1wbGF0ZSgpOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8ZGlhbG9nPlxuICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgTmFtZTpcbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUodGhpcy5uYW1lKX1cbiAgICAgICAgICAgIGRhdGEtb2xkLW5hbWU9JHt0aGlzLm5hbWV9XG4gICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGVsZSA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgICAgICAgICAgIHRoaXMuY2hhbmdlUmVzb3VyY2VOYW1lKGUsIGVsZS52YWx1ZSwgZWxlLmRhdGFzZXQub2xkTmFtZSB8fCBcIlwiKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICR7dGhpcy5yZXNvdXJjZURlZmluaXRpb24udmFsdWVzLm1hcChcbiAgICAgICAgICAgICh2YWx1ZTogc3RyaW5nLCB2YWx1ZUluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGh0bWxgPHRyPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICBkYXRhLW9sZC12YWx1ZT0ke3ZhbHVlfVxuICAgICAgICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5nZVJlc291cmNlVmFsdWVOYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZS5kYXRhc2V0Lm9sZFZhbHVlIHx8IFwiXCJcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAudmFsdWU9JHtsaXZlKHZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5tb3ZlVXAodmFsdWUsIHZhbHVlSW5kZXgpfVxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgLmRpc2FibGVkPSR7dmFsdWVJbmRleCA9PT0gMH1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgJHtpY29uKFwia2V5Ym9hcmQtdXAtaWNvblwiKX1cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAuZGlzYWJsZWQ9JHt2YWx1ZUluZGV4ID09PVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHRoaXMubW92ZURvd24odmFsdWUsIHZhbHVlSW5kZXgpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAke2ljb24oXCJrZXlib2FyZC1kb3duLWljb25cIil9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgLmRpc2FibGVkPSR7dmFsdWVJbmRleCA9PT1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmxlbmd0aCAtIDF9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBAY2xpY2s9JHsoKSA9PiB0aGlzLm1vdmVUb0JvdHRvbSh2YWx1ZSwgdmFsdWVJbmRleCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICR7aWNvbihcImtleWJvYXJkLWRvdWJsZS1kb3duLWljb25cIil9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgLmRpc2FibGVkPSR7dmFsdWVJbmRleCA9PT0gMH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHRoaXMubW92ZVRvVG9wKHZhbHVlLCB2YWx1ZUluZGV4KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgJHtpY29uKFwia2V5Ym9hcmQtZG91YmxlLXVwLWljb25cIil9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgLmRpc2FibGVkPSR7dGhpcy5yZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmxlbmd0aCA9PT0gMX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHRoaXMuZGVsZXRlUmVzb3VyY2VWYWx1ZSh2YWx1ZSwgdmFsdWVJbmRleCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICR7aWNvbihcImRlbGV0ZS1pY29uXCIpfVxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgPC90cj5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICl9XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMubmV3UmVzb3VyY2VWYWx1ZSgpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBOZXdcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJkaWFsb2ctZm9vdGVyXCI+XG4gICAgICAgICAgPGJ1dHRvbiBAY2xpY2s9JHsoKSA9PiB0aGlzLmNhbmNlbCgpfT5DbG9zZTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGlhbG9nPlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwiZWRpdC1yZXNvdXJjZS1kZWZpbml0aW9uXCIsIEVkaXRSZXNvdXJjZURlZmluaXRpb24pO1xuIiwgIi8vIFV0aWxpdGllcyBmb3IgZGVhbGluZyB3aXRoIGEgcmFuZ2Ugb2YgbnVtYmVycy5cblxuZXhwb3J0IGludGVyZmFjZSBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQge1xuICBtaW46IG51bWJlcjtcbiAgbWF4OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBkaXNwbGF5VmFsdWUgPSAoeDogbnVtYmVyKTogc3RyaW5nID0+IHtcbiAgaWYgKHggPT09IE51bWJlci5NQVhfVkFMVUUpIHtcbiAgICByZXR1cm4gXCIobWF4IGZsb2F0KVwiO1xuICB9IGVsc2UgaWYgKHggPT09IC1OdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgcmV0dXJuIFwiKG1pbiBmbG9hdClcIjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4geC50b1N0cmluZygpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgY2xhbXAgPSAoeDogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICBpZiAoeCA+IG1heCkge1xuICAgIHJldHVybiBtYXg7XG4gIH1cbiAgaWYgKHggPCBtaW4pIHtcbiAgICByZXR1cm4gbWluO1xuICB9XG4gIHJldHVybiB4O1xufTtcblxuLy8gUmFuZ2UgZGVmaW5lcyBhIHJhbmdlIG9mIG51bWJlcnMsIGZyb20gW21pbiwgbWF4XSBpbmNsdXNpdmUuXG5leHBvcnQgY2xhc3MgTWV0cmljUmFuZ2Uge1xuICBwcml2YXRlIF9taW46IG51bWJlciA9IC1OdW1iZXIuTUFYX1ZBTFVFO1xuICBwcml2YXRlIF9tYXg6IG51bWJlciA9IE51bWJlci5NQVhfVkFMVUU7XG5cbiAgY29uc3RydWN0b3IobWluOiBudW1iZXIgPSAtTnVtYmVyLk1BWF9WQUxVRSwgbWF4OiBudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgaWYgKG1heCA8IG1pbikge1xuICAgICAgW21pbiwgbWF4XSA9IFttYXgsIG1pbl07XG4gICAgfVxuICAgIHRoaXMuX21pbiA9IG1pbjtcbiAgICB0aGlzLl9tYXggPSBtYXg7XG4gIH1cblxuICBjbGFtcCh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gY2xhbXAodmFsdWUsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWluKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21pbjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWF4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21heDtcbiAgfVxuXG4gIHRvSlNPTigpOiBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBtaW46IHRoaXMuX21pbixcbiAgICAgIG1heDogdGhpcy5fbWF4LFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogTWV0cmljUmFuZ2VTZXJpYWxpemVkIHwgdW5kZWZpbmVkKTogTWV0cmljUmFuZ2Uge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgTWV0cmljUmFuZ2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBNZXRyaWNSYW5nZShzLm1pbiwgcy5tYXgpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgUm91bmRlciB9IGZyb20gXCIuLi90eXBlcy90eXBlc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByZWNpc2lvblNlcmlhbGl6ZWQge1xuICBwcmVjaXNpb246IG51bWJlcjtcbn1cbmV4cG9ydCBjbGFzcyBQcmVjaXNpb24ge1xuICBwcml2YXRlIF9wcmVjaXNpb246IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihwcmVjaXNpb246IG51bWJlciA9IDApIHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShwcmVjaXNpb24pKSB7XG4gICAgICBwcmVjaXNpb24gPSAwO1xuICAgIH1cbiAgICB0aGlzLl9wcmVjaXNpb24gPSBNYXRoLmFicyhNYXRoLnRydW5jKHByZWNpc2lvbikpO1xuICB9XG5cbiAgcm91bmQoeDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gK3gudG9GaXhlZCh0aGlzLl9wcmVjaXNpb24pO1xuICB9XG5cbiAgcm91bmRlcigpOiBSb3VuZGVyIHtcbiAgICByZXR1cm4gKHg6IG51bWJlcik6IG51bWJlciA9PiB0aGlzLnJvdW5kKHgpO1xuICB9XG5cbiAgcHVibGljIGdldCBwcmVjaXNpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcHJlY2lzaW9uO1xuICB9XG5cbiAgdG9KU09OKCk6IFByZWNpc2lvblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBwcmVjaXNpb246IHRoaXMuX3ByZWNpc2lvbixcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIEZyb21KU09OKHM6IFByZWNpc2lvblNlcmlhbGl6ZWQgfCB1bmRlZmluZWQpOiBQcmVjaXNpb24ge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgUHJlY2lzaW9uKCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJlY2lzaW9uKHMucHJlY2lzaW9uKTtcbiAgfVxufVxuIiwgIi8vIE1ldHJpY3MgZGVmaW5lIGZsb2F0aW5nIHBvaW50IHZhbHVlcyB0aGF0IGFyZSB0cmFja2VkIHBlciBUYXNrLlxuXG5pbXBvcnQgeyBQcmVjaXNpb24sIFByZWNpc2lvblNlcmlhbGl6ZWQgfSBmcm9tIFwiLi4vcHJlY2lzaW9uL3ByZWNpc2lvbi50c1wiO1xuaW1wb3J0IHsgY2xhbXAsIE1ldHJpY1JhbmdlLCBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQgfSBmcm9tIFwiLi9yYW5nZS50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlU2VyaWFsaXplZDtcbiAgZGVmYXVsdDogbnVtYmVyO1xuICBwcmVjaXNpb246IFByZWNpc2lvblNlcmlhbGl6ZWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRyaWNEZWZpbml0aW9uIHtcbiAgcmFuZ2U6IE1ldHJpY1JhbmdlO1xuICBkZWZhdWx0OiBudW1iZXI7XG4gIGlzU3RhdGljOiBib29sZWFuO1xuICBwcmVjaXNpb246IFByZWNpc2lvbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZWZhdWx0VmFsdWU6IG51bWJlcixcbiAgICByYW5nZTogTWV0cmljUmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoKSxcbiAgICBpc1N0YXRpYzogYm9vbGVhbiA9IGZhbHNlLFxuICAgIHByZWNpc2lvbjogUHJlY2lzaW9uID0gbmV3IFByZWNpc2lvbigxKVxuICApIHtcbiAgICB0aGlzLnByZWNpc2lvbiA9IHByZWNpc2lvbjtcbiAgICB0aGlzLnJhbmdlID0gcmFuZ2U7XG4gICAgdGhpcy5kZWZhdWx0ID0gZGVmYXVsdFZhbHVlO1xuICAgIHRoaXMuaXNTdGF0aWMgPSBpc1N0YXRpYztcbiAgICB0aGlzLnJhdGlvbmFsaXplKCk7XG4gIH1cblxuICByYXRpb25hbGl6ZSgpIHtcbiAgICAvLyBtaW4gYW5kIG1heCBzaG91bGQgYmUgcm91bmRlZCB0byBwcmVjaXNpb24gZmlyc3QuIGFuZCB0aGVuIGNsYW1wIGFuZFxuICAgIC8vIHByZWNpc2lvbiBhcHBsaWVkIHRvIHRoZSBkZWZhdWx0LlxuICAgIHRoaXMucmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoXG4gICAgICB0aGlzLnByZWNpc2lvbi5yb3VuZCh0aGlzLnJhbmdlLm1pbiksXG4gICAgICB0aGlzLnByZWNpc2lvbi5yb3VuZCh0aGlzLnJhbmdlLm1heClcbiAgICApO1xuICAgIC8vIG1pbiBhbmQgbWF4IHNob3VsZCBiZSByb3VuZGVkIHRvIHByZWNpc2lvbiBmaXJzdC4gYW5kIHRoZW4gY2xhbXAgYW5kXG4gICAgLy8gcHJlY2lzaW9uIGFwcGxpZWQgdG8gdGhlIGRlZmF1bHQuXG4gICAgdGhpcy5kZWZhdWx0ID0gdGhpcy5jbGFtcEFuZFJvdW5kKHRoaXMuZGVmYXVsdCk7XG4gIH1cblxuICBjbGFtcEFuZFJvdW5kKHg6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucHJlY2lzaW9uLnJvdW5kKHRoaXMucmFuZ2UuY2xhbXAoeCkpO1xuICB9XG5cbiAgdG9KU09OKCk6IE1ldHJpY0RlZmluaXRpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmFuZ2U6IHRoaXMucmFuZ2UudG9KU09OKCksXG4gICAgICBkZWZhdWx0OiB0aGlzLmRlZmF1bHQsXG4gICAgICBwcmVjaXNpb246IHRoaXMucHJlY2lzaW9uLnRvSlNPTigpLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQgfCB1bmRlZmluZWQpOiBNZXRyaWNEZWZpbml0aW9uIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IE1ldHJpY0RlZmluaXRpb24oMCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgTWV0cmljRGVmaW5pdGlvbihcbiAgICAgIHMuZGVmYXVsdCB8fCAwLFxuICAgICAgTWV0cmljUmFuZ2UuRnJvbUpTT04ocy5yYW5nZSksXG4gICAgICBmYWxzZSxcbiAgICAgIFByZWNpc2lvbi5Gcm9tSlNPTihzLnByZWNpc2lvbilcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zID0geyBba2V5OiBzdHJpbmddOiBNZXRyaWNEZWZpbml0aW9uIH07XG5cbmV4cG9ydCB0eXBlIE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZCA9IHtcbiAgW2tleTogc3RyaW5nXTogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQ7XG59O1xuXG5leHBvcnQgdHlwZSBNZXRyaWNWYWx1ZXMgPSB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9O1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBpY29uIH0gZnJvbSBcIi4uL2ljb25zL2ljb25zXCI7XG5pbXBvcnQgeyBkaXNwbGF5VmFsdWUgfSBmcm9tIFwiLi4vbWV0cmljcy9yYW5nZVwiO1xuaW1wb3J0IHsgZXhlY3V0ZU9wIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlXCI7XG5pbXBvcnQgeyBBZGRNZXRyaWNPcCwgRGVsZXRlTWV0cmljT3AgfSBmcm9tIFwiLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBFZGl0TWV0cmljRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9lZGl0LW1ldHJpYy1kZWZpbml0aW9uL2VkaXQtbWV0cmljLWRlZmluaXRpb25cIjtcblxuZXhwb3J0IGNsYXNzIEVkaXRNZXRyaWNzRGlhbG9nIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBleHBsYW5NYWluOiBFeHBsYW5NYWluIHwgbnVsbCA9IG51bGw7XG4gIHBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLmV4cGxhbk1haW4gIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwicGxhbi1kZWZpbml0aW9uLWNoYW5nZWRcIixcbiAgICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2tcbiAgICApO1xuICB9XG5cbiAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwicGxhbi1kZWZpbml0aW9uLWNoYW5nZWRcIixcbiAgICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2tcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXIoKSB7XG4gICAgcmVuZGVyKHRoaXMudGVtcGxhdGUoKSwgdGhpcyk7XG4gIH1cblxuICBzaG93TW9kYWwoZXhwbGFuTWFpbjogRXhwbGFuTWFpbikge1xuICAgIHRoaXMuZXhwbGFuTWFpbiA9IGV4cGxhbk1haW47XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5zaG93TW9kYWwoKTtcbiAgfVxuXG4gIHByaXZhdGUgY2FuY2VsKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLmNsb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIHRlbXBsYXRlKCk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdCBtZCA9IHRoaXMuZXhwbGFuTWFpbiEucGxhbi5tZXRyaWNEZWZpbml0aW9ucztcbiAgICBjb25zdCBhbGxLZXlzU29ydGVkID0gT2JqZWN0LmtleXMobWQpLnNvcnQoXG4gICAgICAoa2V5QTogc3RyaW5nLCBrZXlCOiBzdHJpbmcpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBhID0gbWRba2V5QV07XG4gICAgICAgIGNvbnN0IGIgPSBtZFtrZXlCXTtcbiAgICAgICAgaWYgKGEuaXNTdGF0aWMgPT09IGIuaXNTdGF0aWMpIHtcbiAgICAgICAgICByZXR1cm4ga2V5QS5sb2NhbGVDb21wYXJlKGtleUIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhLmlzU3RhdGljKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIGh0bWxgIDxkaWFsb2c+XG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+TmFtZTwvdGg+XG4gICAgICAgICAgPHRoPk1pbjwvdGg+XG4gICAgICAgICAgPHRoPk1heDwvdGg+XG4gICAgICAgICAgPHRoPkRlZmF1bHQ8L3RoPlxuICAgICAgICAgIDx0aD48L3RoPlxuICAgICAgICAgIDx0aD48L3RoPlxuICAgICAgICA8L3RyPlxuXG4gICAgICAgICR7YWxsS2V5c1NvcnRlZC5tYXAoKG1ldHJpY05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGNvbnN0IG1ldHJpY0RlZm4gPVxuICAgICAgICAgICAgdGhpcy5leHBsYW5NYWluIS5wbGFuLm1ldHJpY0RlZmluaXRpb25zW21ldHJpY05hbWVdO1xuICAgICAgICAgIHJldHVybiBodG1sYFxuICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICA8dGQ+JHttZXRyaWNOYW1lfTwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD4ke2Rpc3BsYXlWYWx1ZShtZXRyaWNEZWZuLnJhbmdlLm1pbil9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPiR7ZGlzcGxheVZhbHVlKG1ldHJpY0RlZm4ucmFuZ2UubWF4KX08L3RkPlxuICAgICAgICAgICAgICA8dGQ+JHttZXRyaWNEZWZuLmRlZmF1bHR9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICR7dGhpcy5kZWxCdXR0b25JZk5vdFN0YXRpYyhtZXRyaWNOYW1lLCBtZXRyaWNEZWZuLmlzU3RhdGljKX1cbiAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICR7dGhpcy5lZGl0QnV0dG9uSWZOb3RTdGF0aWMobWV0cmljTmFtZSwgbWV0cmljRGVmbi5pc1N0YXRpYyl9XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgIGA7XG4gICAgICAgIH0pfVxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgdGl0bGU9XCJBZGQgYSBuZXcgUmVzb3VyY2UuXCJcbiAgICAgICAgICAgICAgQGNsaWNrPSR7KCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubmV3TWV0cmljKCk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICR7aWNvbihcImFkZC1pY29uXCIpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgICA8ZGl2IGNsYXNzPVwiZGlhbG9nLWZvb3RlclwiPlxuICAgICAgICA8YnV0dG9uIEBjbGljaz0keygpID0+IHRoaXMuY2FuY2VsKCl9PkNsb3NlPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2RpYWxvZz5gO1xuICB9XG5cbiAgcHJpdmF0ZSBkZWxCdXR0b25JZk5vdFN0YXRpYyhcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgaXNTdGF0aWM6IGJvb2xlYW5cbiAgKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGlmIChpc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGh0bWxgYDtcbiAgICB9XG4gICAgcmV0dXJuIGh0bWxgPGJ1dHRvblxuICAgICAgY2xhc3M9XCJpY29uLWJ1dHRvblwiXG4gICAgICB0aXRsZT1cIkRlbGV0ZSB0aGlzIG1ldHJpYy5cIlxuICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5kZWxldGVNZXRyaWMobmFtZSl9XG4gICAgPlxuICAgICAgJHtpY29uKFwiZGVsZXRlLWljb25cIil9XG4gICAgPC9idXR0b24+YDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZGVsZXRlTWV0cmljKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGVPcChcbiAgICAgIERlbGV0ZU1ldHJpY09wKG5hbWUpLFxuICAgICAgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIixcbiAgICAgIHRydWUsXG4gICAgICB0aGlzLmV4cGxhbk1haW4hXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgY29uc29sZS5sb2cocmV0LmVycm9yKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgZWRpdEJ1dHRvbklmTm90U3RhdGljKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBpc1N0YXRpYzogYm9vbGVhblxuICApOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgaWYgKGlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gaHRtbGBgO1xuICAgIH1cbiAgICByZXR1cm4gaHRtbGA8YnV0dG9uXG4gICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgIHRpdGxlPVwiRWRpdCB0aGUgcmVzb3VyY2UgZGVmaW5pdGlvbi5cIlxuICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5lZGl0TWV0cmljKG5hbWUpfVxuICAgID5cbiAgICAgICR7aWNvbihcImVkaXQtaWNvblwiKX1cbiAgICA8L2J1dHRvbj5gO1xuICB9XG5cbiAgcHJpdmF0ZSBlZGl0TWV0cmljKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgdGhpcy5leHBsYW5NYWluIS5xdWVyeVNlbGVjdG9yPEVkaXRNZXRyaWNEZWZpbml0aW9uPihcbiAgICAgIFwiZWRpdC1tZXRyaWMtZGVmaW5pdGlvblwiXG4gICAgKSEuc2hvd01vZGFsKHRoaXMuZXhwbGFuTWFpbiEsIG5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBuZXdNZXRyaWMoKSB7XG4gICAgY29uc3QgbmFtZSA9IHdpbmRvdy5wcm9tcHQoXCJNZXRyaWMgbmFtZTpcIiwgXCJcIik7XG4gICAgaWYgKG5hbWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZU9wKFxuICAgICAgQWRkTWV0cmljT3AobmFtZSwgbmV3IE1ldHJpY0RlZmluaXRpb24oMCkpLFxuICAgICAgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIixcbiAgICAgIHRydWUsXG4gICAgICB0aGlzLmV4cGxhbk1haW4hXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgd2luZG93LmFsZXJ0KHJldC5lcnJvcik7XG4gICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImVkaXQtbWV0cmljcy1kaWFsb2dcIiwgRWRpdE1ldHJpY3NEaWFsb2cpO1xuIiwgImltcG9ydCB7IFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHRcIjtcblxuLy8gRGlzcGxheXMgdGhlIGdpdmVuIGVycm9yLlxuLy8gVE9ETyAtIE1ha2UgdGhpcyBhIHBvcC11cCBvciBzb21ldGhpbmcuXG5leHBvcnQgY29uc3QgcmVwb3J0RXJyb3IgPSAoZXJyb3I6IEVycm9yKSA9PiB7XG4gIGNvbnNvbGUubG9nKGVycm9yKTtcbn07XG5cbi8vIFJlcG9ydHMgdGhlIGVycm9yIGlmIHRoZSBnaXZlbiBSZXN1bHQgaXMgbm90IG9rLlxuZXhwb3J0IGNvbnN0IHJlcG9ydE9uRXJyb3IgPSA8VD4ocmV0OiBSZXN1bHQ8VD4pID0+IHtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXBvcnRFcnJvcihyZXQuZXJyb3IpO1xuICB9XG59O1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBsaXZlIH0gZnJvbSBcImxpdC1odG1sL2RpcmVjdGl2ZXMvbGl2ZS5qc1wiO1xuaW1wb3J0IHsgTWV0cmljUmFuZ2UsIGRpc3BsYXlWYWx1ZSB9IGZyb20gXCIuLi9tZXRyaWNzL3JhbmdlXCI7XG5pbXBvcnQgeyBSZW5hbWVNZXRyaWNPcCwgVXBkYXRlTWV0cmljT3AgfSBmcm9tIFwiLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBSZXN1bHQgfSBmcm9tIFwiLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBPcCB9IGZyb20gXCIuLi9vcHMvb3BzXCI7XG5pbXBvcnQgeyBleGVjdXRlT3AgfSBmcm9tIFwiLi4vYWN0aW9uL2V4ZWN1dGVcIjtcbmltcG9ydCB7IHJlcG9ydEVycm9yIH0gZnJvbSBcIi4uL3JlcG9ydC1lcnJvci9yZXBvcnQtZXJyb3JcIjtcbmltcG9ydCB7IFByZWNpc2lvbiB9IGZyb20gXCIuLi9wcmVjaXNpb24vcHJlY2lzaW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBFZGl0TWV0cmljRGVmaW5pdGlvbiBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpbiB8IG51bGwgPSBudWxsO1xuICBtZXRyaWNOYW1lOiBzdHJpbmcgPSBcIlwiO1xuICBwbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFjazogKCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH07XG4gIH1cblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlcigpIHtcbiAgICByZW5kZXIodGhpcy50ZW1wbGF0ZSgpLCB0aGlzKTtcbiAgfVxuXG4gIHByaXZhdGUgdGVtcGxhdGUoKTogVGVtcGxhdGVSZXN1bHQge1xuICAgIGNvbnN0IGRlZm4gPSB0aGlzLmV4cGxhbk1haW4/LnBsYW4ubWV0cmljRGVmaW5pdGlvbnNbdGhpcy5tZXRyaWNOYW1lXTtcbiAgICBpZiAoIWRlZm4pIHtcbiAgICAgIHJldHVybiBodG1sYGA7XG4gICAgfVxuICAgIHJldHVybiBodG1sYDxkaWFsb2c+XG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGg+TmFtZTwvdGg+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUodGhpcy5tZXRyaWNOYW1lKX1cbiAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4gdGhpcy5uYW1lQ2hhbmdlKGUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPk1pbjwvdGg+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUoZGlzcGxheVZhbHVlKGRlZm4ucmFuZ2UubWluKSl9XG4gICAgICAgICAgICAgID9kaXNhYmxlZD0ke2RlZm4ucmFuZ2UubWluID09PSAtTnVtYmVyLk1BWF9WQUxVRX1cbiAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4gdGhpcy5taW5DaGFuZ2UoZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgID9jaGVja2VkPSR7ZGVmbi5yYW5nZS5taW4gIT09IC1OdW1iZXIuTUFYX1ZBTFVFfVxuICAgICAgICAgICAgICAgIEBjaGFuZ2U9JHsoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMubWluTGltaXRDaGFuZ2UoZSk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgTGltaXQ8L2xhYmVsXG4gICAgICAgICAgICA+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD5NYXg8L3RoPlxuICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAudmFsdWU9JHtsaXZlKGRpc3BsYXlWYWx1ZShkZWZuLnJhbmdlLm1heCkpfVxuICAgICAgICAgICAgICA/ZGlzYWJsZWQ9JHtkZWZuLnJhbmdlLm1heCA9PT0gTnVtYmVyLk1BWF9WQUxVRX1cbiAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4gdGhpcy5tYXhDaGFuZ2UoZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgID9jaGVja2VkPSR7ZGVmbi5yYW5nZS5tYXggIT09IE51bWJlci5NQVhfVkFMVUV9XG4gICAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy5tYXhMaW1pdENoYW5nZShlKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICBMaW1pdDwvbGFiZWxcbiAgICAgICAgICAgID5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPlByZWNpc2lvbjwvdGg+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIC52YWx1ZT0ke2xpdmUoZGVmbi5wcmVjaXNpb24ucHJlY2lzaW9uKX1cbiAgICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlY2lzaW9uQ2hhbmdlKGUpO1xuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPkRlZmF1bHQ8L3RoPlxuICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAudmFsdWU9JHtsaXZlKGRlZm4uZGVmYXVsdCl9XG4gICAgICAgICAgICAgIEBjaGFuZ2U9JHsoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHRDaGFuZ2UoZSk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICA8L3RhYmxlPlxuICAgICAgPGRpdiBjbGFzcz1cImRpYWxvZy1mb290ZXJcIj5cbiAgICAgICAgPGJ1dHRvbiBAY2xpY2s9JHsoKSA9PiB0aGlzLmNhbmNlbCgpfT5DbG9zZTwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaWFsb2c+YDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZXhlY3V0ZU9wKG9wOiBPcCk6IFByb21pc2U8UmVzdWx0PG51bGw+PiB7XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZU9wKFxuICAgICAgb3AsXG4gICAgICBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLFxuICAgICAgdHJ1ZSxcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiFcbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICB3aW5kb3cuYWxlcnQocmV0LmVycm9yKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWluTGltaXRDaGFuZ2UoZTogRXZlbnQpIHtcbiAgICBjb25zdCBlbGUgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IGRlZm4gPSB0aGlzLmdldERlZmluaXRpb25Db3B5KCk7XG4gICAgaWYgKGVsZS5jaGVja2VkKSB7XG4gICAgICBjb25zdCBuZXdNaW4gPSAwIDwgZGVmbi5yYW5nZS5tYXggPyAwIDogZGVmbi5yYW5nZS5tYXggLSAxO1xuICAgICAgZGVmbi5yYW5nZSA9IG5ldyBNZXRyaWNSYW5nZShuZXdNaW4sIGRlZm4ucmFuZ2UubWF4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmbi5yYW5nZSA9IG5ldyBNZXRyaWNSYW5nZSgtTnVtYmVyLk1BWF9WQUxVRSwgZGVmbi5yYW5nZS5tYXgpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZU1ldHJpY0RlZmluaXRpb24oZGVmbik7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1heExpbWl0Q2hhbmdlKGU6IEV2ZW50KSB7XG4gICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBkZWZuID0gdGhpcy5nZXREZWZpbml0aW9uQ29weSgpO1xuICAgIGlmIChlbGUuY2hlY2tlZCkge1xuICAgICAgY29uc3QgbmV3TWF4ID0gMTAwID4gZGVmbi5yYW5nZS5taW4gPyAxMDAgOiBkZWZuLnJhbmdlLm1pbiArIDE7XG4gICAgICBkZWZuLnJhbmdlID0gbmV3IE1ldHJpY1JhbmdlKGRlZm4ucmFuZ2UubWluLCBuZXdNYXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZuLnJhbmdlID0gbmV3IE1ldHJpY1JhbmdlKGRlZm4ucmFuZ2UubWluLCBOdW1iZXIuTUFYX1ZBTFVFKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVNZXRyaWNEZWZpbml0aW9uKGRlZm4pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBuYW1lQ2hhbmdlKGU6IEV2ZW50KSB7XG4gICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBvbGROYW1lID0gdGhpcy5tZXRyaWNOYW1lO1xuICAgIGNvbnN0IG5ld05hbWUgPSBlbGUudmFsdWU7XG4gICAgdGhpcy5tZXRyaWNOYW1lID0gbmV3TmFtZTtcbiAgICBjb25zdCByZXQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVPcChSZW5hbWVNZXRyaWNPcChvbGROYW1lLCBuZXdOYW1lKSk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHRoaXMubWV0cmljTmFtZSA9IG9sZE5hbWU7XG4gICAgfVxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGRlZmF1bHRDaGFuZ2UoZTogRXZlbnQpIHtcbiAgICBjb25zdCBlbGUgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IGRlZm4gPSB0aGlzLmdldERlZmluaXRpb25Db3B5KCk7XG4gICAgZGVmbi5kZWZhdWx0ID0gK2VsZS52YWx1ZTtcbiAgICB0aGlzLnVwZGF0ZU1ldHJpY0RlZmluaXRpb24oZGVmbik7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHByZWNpc2lvbkNoYW5nZShlOiBFdmVudCkge1xuICAgIGNvbnN0IGVsZSA9IGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgY29uc3QgZGVmbiA9IHRoaXMuZ2V0RGVmaW5pdGlvbkNvcHkoKTtcbiAgICBkZWZuLnByZWNpc2lvbiA9IG5ldyBQcmVjaXNpb24oK2VsZS52YWx1ZSk7XG4gICAgdGhpcy51cGRhdGVNZXRyaWNEZWZpbml0aW9uKGRlZm4pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBtaW5DaGFuZ2UoZTogRXZlbnQpIHtcbiAgICBjb25zdCBlbGUgPSBlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gK2VsZS52YWx1ZTtcbiAgICBjb25zdCBkZWZpbml0aW9uQ29weSA9IHRoaXMuZ2V0RGVmaW5pdGlvbkNvcHkoKTtcbiAgICBkZWZpbml0aW9uQ29weS5yYW5nZSA9IG5ldyBNZXRyaWNSYW5nZShuZXdWYWx1ZSwgZGVmaW5pdGlvbkNvcHkhLnJhbmdlLm1heCk7XG4gICAgdGhpcy51cGRhdGVNZXRyaWNEZWZpbml0aW9uKGRlZmluaXRpb25Db3B5KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWF4Q2hhbmdlKGU6IEV2ZW50KSB7XG4gICAgY29uc3QgZWxlID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBuZXdWYWx1ZSA9ICtlbGUudmFsdWU7XG4gICAgY29uc3QgZGVmaW5pdGlvbkNvcHkgPSB0aGlzLmdldERlZmluaXRpb25Db3B5KCk7XG4gICAgZGVmaW5pdGlvbkNvcHkucmFuZ2UgPSBuZXcgTWV0cmljUmFuZ2UoZGVmaW5pdGlvbkNvcHkhLnJhbmdlLm1pbiwgbmV3VmFsdWUpO1xuICAgIHRoaXMudXBkYXRlTWV0cmljRGVmaW5pdGlvbihkZWZpbml0aW9uQ29weSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHVwZGF0ZU1ldHJpY0RlZmluaXRpb24obmV3RGVmOiBNZXRyaWNEZWZpbml0aW9uKSB7XG4gICAgbmV3RGVmLnJhdGlvbmFsaXplKCk7XG4gICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5leGVjdXRlT3AoVXBkYXRlTWV0cmljT3AodGhpcy5tZXRyaWNOYW1lLCBuZXdEZWYpKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmVwb3J0RXJyb3IocmV0LmVycm9yKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RGVmaW5pdGlvbkNvcHkoKTogTWV0cmljRGVmaW5pdGlvbiB7XG4gICAgY29uc3QgZGVmbiA9IHRoaXMuZXhwbGFuTWFpbj8ucGxhbi5tZXRyaWNEZWZpbml0aW9uc1t0aGlzLm1ldHJpY05hbWVdO1xuICAgIHJldHVybiBNZXRyaWNEZWZpbml0aW9uLkZyb21KU09OKGRlZm4/LnRvSlNPTigpKTtcbiAgfVxuXG4gIHByaXZhdGUgY2FuY2VsKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLmNsb3NlKCk7XG4gIH1cblxuICBwdWJsaWMgc2hvd01vZGFsKGV4cGxhbk1haW46IEV4cGxhbk1haW4sIG1ldHJpY05hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZXhwbGFuTWFpbiA9IGV4cGxhbk1haW47XG4gICAgdGhpcy5tZXRyaWNOYW1lID0gbWV0cmljTmFtZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLnNob3dNb2RhbCgpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImVkaXQtbWV0cmljLWRlZmluaXRpb25cIiwgRWRpdE1ldHJpY0RlZmluaXRpb24pO1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IGljb24gfSBmcm9tIFwiLi4vaWNvbnMvaWNvbnMudHNcIjtcblxuZXhwb3J0IHR5cGUgRGVwVHlwZSA9IFwicHJlZFwiIHwgXCJzdWNjXCI7XG5cbmV4cG9ydCBjb25zdCBkZXBEaXNwbGF5TmFtZTogUmVjb3JkPERlcFR5cGUsIHN0cmluZz4gPSB7XG4gIHByZWQ6IFwiUHJlZGVjZXNzb3JzXCIsXG4gIHN1Y2M6IFwiU3VjY2Vzc29yc1wiLFxufTtcblxuaW50ZXJmYWNlIERlcGVuZW5jeUV2ZW50IHtcbiAgdGFza0luZGV4OiBudW1iZXI7XG4gIGRlcFR5cGU6IERlcFR5cGU7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJkZWxldGUtZGVwZW5kZW5jeVwiOiBDdXN0b21FdmVudDxEZXBlbmVuY3lFdmVudD47XG4gICAgXCJhZGQtZGVwZW5kZW5jeVwiOiBDdXN0b21FdmVudDxEZXBlbmVuY3lFdmVudD47XG4gIH1cbn1cblxuY29uc3Qga2luZFRlbXBsYXRlID0gKFxuICBkZXBlbmRlbmNpZXNDb250cm9sOiBEZXBlbmRlbmNpZXNQYW5lbCxcbiAgZGVwVHlwZTogRGVwVHlwZSxcbiAgaW5kZXhlczogbnVtYmVyW11cbik6IFRlbXBsYXRlUmVzdWx0ID0+IGh0bWxgXG4gIDx0cj5cbiAgICA8dGg+JHtkZXBEaXNwbGF5TmFtZVtkZXBUeXBlXX08L3RoPlxuICAgIDx0aD48L3RoPlxuICA8L3RyPlxuICAke2luZGV4ZXMubWFwKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSBkZXBlbmRlbmNpZXNDb250cm9sLnRhc2tzW3Rhc2tJbmRleF07XG4gICAgcmV0dXJuIGh0bWxgPHRyPlxuICAgICAgPHRkPiR7dGFzay5uYW1lfTwvdGQ+XG4gICAgICA8dGQ+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICB0aXRsZT1cIkRlbGV0ZSB0aGUgZGVwZW5kZW5jeSBvbiAke3Rhc2submFtZX1cIlxuICAgICAgICAgIEBjbGljaz0keygpID0+IGRlcGVuZGVuY2llc0NvbnRyb2wuZGVsZXRlRGVwKHRhc2tJbmRleCwgZGVwVHlwZSl9XG4gICAgICAgID5cbiAgICAgICAgICAke2ljb24oXCJkZWxldGUtaWNvblwiKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L3RkPlxuICAgIDwvdHI+YDtcbiAgfSl9XG4gIDx0cj5cbiAgICA8dGQ+PC90ZD5cbiAgICA8dGQ+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIGNsYXNzPVwiaWNvbi1idXR0b25cIlxuICAgICAgICBAY2xpY2s9JHsoKSA9PiBkZXBlbmRlbmNpZXNDb250cm9sLmFkZERlcChkZXBUeXBlKX1cbiAgICAgICAgdGl0bGU9XCJBZGQgZGVwZW5kZW5jeS5cIlxuICAgICAgPlxuICAgICAgICAke2ljb24oXCJhZGQtaWNvblwiKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvdGQ+XG4gIDwvdHI+XG5gO1xuXG5jb25zdCB0ZW1wbGF0ZSA9IChcbiAgZGVwZW5kZW5jaWVzQ29udHJvbDogRGVwZW5kZW5jaWVzUGFuZWxcbik6IFRlbXBsYXRlUmVzdWx0ID0+IGh0bWxgXG4gIDx0YWJsZT5cbiAgICAke2tpbmRUZW1wbGF0ZShcbiAgICAgIGRlcGVuZGVuY2llc0NvbnRyb2wsXG4gICAgICBcInByZWRcIixcbiAgICAgIGRlcGVuZGVuY2llc0NvbnRyb2wucHJlZEluZGV4ZXNcbiAgICApfVxuICAgICR7a2luZFRlbXBsYXRlKFxuICAgICAgZGVwZW5kZW5jaWVzQ29udHJvbCxcbiAgICAgIFwic3VjY1wiLFxuICAgICAgZGVwZW5kZW5jaWVzQ29udHJvbC5zdWNjSW5kZXhlc1xuICAgICl9XG4gIDwvdGFibGU+XG5gO1xuXG5leHBvcnQgY2xhc3MgRGVwZW5kZW5jaWVzUGFuZWwgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIHRhc2tzOiBUYXNrW10gPSBbXTtcbiAgcHJlZEluZGV4ZXM6IG51bWJlcltdID0gW107XG4gIHN1Y2NJbmRleGVzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBwdWJsaWMgc2V0VGFza3NBbmRJbmRpY2VzKFxuICAgIHRhc2tzOiBUYXNrW10sXG4gICAgcHJlZEluZGV4ZXM6IG51bWJlcltdLFxuICAgIHN1Y2NJbmRleGVzOiBudW1iZXJbXVxuICApIHtcbiAgICB0aGlzLnRhc2tzID0gdGFza3M7XG4gICAgdGhpcy5wcmVkSW5kZXhlcyA9IHByZWRJbmRleGVzO1xuICAgIHRoaXMuc3VjY0luZGV4ZXMgPSBzdWNjSW5kZXhlcztcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgcHVibGljIGRlbGV0ZURlcCh0YXNrSW5kZXg6IG51bWJlciwgZGVwVHlwZTogRGVwVHlwZSkge1xuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgIG5ldyBDdXN0b21FdmVudChcImRlbGV0ZS1kZXBlbmRlbmN5XCIsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgZGVwVHlwZTogZGVwVHlwZSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBhZGREZXAoZGVwVHlwZTogRGVwVHlwZSkge1xuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgIG5ldyBDdXN0b21FdmVudChcImFkZC1kZXBlbmRlbmN5XCIsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgdGFza0luZGV4OiAtMSxcbiAgICAgICAgICBkZXBUeXBlOiBkZXBUeXBlLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImRlcGVuZGVuY2llcy1wYW5lbFwiLCBEZXBlbmRlbmNpZXNQYW5lbCk7XG4iLCAiaW1wb3J0IHtcbiAgVmVydGV4LFxuICBWZXJ0ZXhJbmRpY2VzLFxuICBEaXJlY3RlZEVkZ2UsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbiAgZWRnZXNCeURzdFRvTWFwLFxufSBmcm9tIFwiLi4vZGFnXCI7XG5cbi8qKiBBIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGFwcGxpZWQgdG8gYSBWZXJ0ZXgsIHVzZWQgaW4gbGF0ZXIgZnVuY3Rpb25zIGxpa2VcbkRlcHRoIEZpcnN0IFNlYXJjaCB0byBkbyB3b3JrIG9uIGV2ZXJ5IFZlcnRleCBpbiBhIERpcmVjdGVkR3JhcGguXG4gKi9cbmV4cG9ydCB0eXBlIHZlcnRleEZ1bmN0aW9uID0gKHY6IFZlcnRleCwgaW5kZXg6IG51bWJlcikgPT4gYm9vbGVhbjtcblxuLyoqIFJldHVybnMgdGhlIGluZGV4IG9mIGFsbCBWZXJ0aWNlcyB0aGF0IGhhdmUgbm8gaW5jb21pbmcgZWRnZS5cbiAqL1xuZXhwb3J0IGNvbnN0IHNldE9mVmVydGljZXNXaXRoTm9JbmNvbWluZ0VkZ2UgPSAoXG4gIGc6IERpcmVjdGVkR3JhcGgsXG4pOiBWZXJ0ZXhJbmRpY2VzID0+IHtcbiAgY29uc3Qgbm9kZXNXaXRoSW5jb21pbmdFZGdlcyA9IGVkZ2VzQnlEc3RUb01hcChnLkVkZ2VzKTtcbiAgY29uc3QgcmV0OiBWZXJ0ZXhJbmRpY2VzID0gW107XG4gIGcuVmVydGljZXMuZm9yRWFjaCgoXzogVmVydGV4LCBpOiBudW1iZXIpID0+IHtcbiAgICBpZiAoIW5vZGVzV2l0aEluY29taW5nRWRnZXMuaGFzKGkpKSB7XG4gICAgICByZXQucHVzaChpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcblxuLyoqIERlc2NlbmRzIHRoZSBncmFwaCBpbiBEZXB0aCBGaXJzdCBTZWFyY2ggYW5kIGFwcGxpZXMgdGhlIGZ1bmN0aW9uIGBmYCB0b1xuZWFjaCBub2RlLlxuICovXG5leHBvcnQgY29uc3QgZGVwdGhGaXJzdFNlYXJjaCA9IChnOiBEaXJlY3RlZEdyYXBoLCBmOiB2ZXJ0ZXhGdW5jdGlvbikgPT4ge1xuICBzZXRPZlZlcnRpY2VzV2l0aE5vSW5jb21pbmdFZGdlKGcpLmZvckVhY2goKHZlcnRleEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBkZXB0aEZpcnN0U2VhcmNoRnJvbUluZGV4KGcsIHZlcnRleEluZGV4LCBmKTtcbiAgfSk7XG59O1xuXG4vKiogRGVwdGggRmlyc3QgU2VhcmNoIHN0YXJ0aW5nIGF0IFZlcnRleCBgc3RhcnRfaW5kZXhgLiAqL1xuZXhwb3J0IGNvbnN0IGRlcHRoRmlyc3RTZWFyY2hGcm9tSW5kZXggPSAoXG4gIGc6IERpcmVjdGVkR3JhcGgsXG4gIHN0YXJ0X2luZGV4OiBudW1iZXIsXG4gIGY6IHZlcnRleEZ1bmN0aW9uLFxuKSA9PiB7XG4gIGNvbnN0IGVkZ2VzQnlTcmMgPSBlZGdlc0J5U3JjVG9NYXAoZy5FZGdlcyk7XG5cbiAgY29uc3QgdmlzaXQgPSAodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGlmIChmKGcuVmVydGljZXNbdmVydGV4SW5kZXhdLCB2ZXJ0ZXhJbmRleCkgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5leHQgPSBlZGdlc0J5U3JjLmdldCh2ZXJ0ZXhJbmRleCk7XG4gICAgaWYgKG5leHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBuZXh0LmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgdmlzaXQoZS5qKTtcbiAgICB9KTtcbiAgfTtcblxuICB2aXNpdChzdGFydF9pbmRleCk7XG59O1xuIiwgImltcG9ydCB7XG4gIERpcmVjdGVkRWRnZSxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeURzdFRvTWFwLFxuICBlZGdlc0J5U3JjVG9NYXAsXG59IGZyb20gXCIuLi9kYWdcIjtcbmltcG9ydCB7IGRlcHRoRmlyc3RTZWFyY2hGcm9tSW5kZXggfSBmcm9tIFwiLi9kZnNcIjtcblxuLyoqIFJldHVybnMgdGhlIGluZGljZXMgb2YgYWxsIHRoZSBzdWNjZXNzb3JzIG9mIHRoZSB0YXNrIGF0IHRoZSBnaXZlbiBpbmRleC5cbiAqICBOb3RlIHRoYXQgaW5jbHVkZXMgdGhlIGdpdmVuIGluZGV4IGl0c2VsZi5cbiAqL1xuZXhwb3J0IGNvbnN0IGFsbFN1Y2Nlc3NvcnMgPSAoXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoXG4pOiBudW1iZXJbXSA9PiB7XG4gIGlmICh0YXNrSW5kZXggPj0gZGlyZWN0ZWRHcmFwaC5WZXJ0aWNlcy5sZW5ndGggLSAxIHx8IHRhc2tJbmRleCA8PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IGFsbENoaWxkcmVuOiBTZXQ8bnVtYmVyPiA9IG5ldyBTZXQoKTtcbiAgZGVwdGhGaXJzdFNlYXJjaEZyb21JbmRleChcbiAgICBkaXJlY3RlZEdyYXBoLFxuICAgIHRhc2tJbmRleCxcbiAgICAoXzogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBhbGxDaGlsZHJlbi5hZGQoaW5kZXgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICApO1xuICBhbGxDaGlsZHJlbi5kZWxldGUoZGlyZWN0ZWRHcmFwaC5WZXJ0aWNlcy5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIFsuLi5hbGxDaGlsZHJlbi52YWx1ZXMoKV07XG59O1xuXG5leHBvcnQgY29uc3QgYWxsUHJlZGVjZXNzb3JzID0gKFxuICB0YXNrSW5kZXg6IG51bWJlcixcbiAgZGlyZWN0ZWRHcmFwaDogRGlyZWN0ZWRHcmFwaFxuKTogbnVtYmVyW10gPT4ge1xuICBpZiAodGFza0luZGV4ID49IGRpcmVjdGVkR3JhcGguVmVydGljZXMubGVuZ3RoIC0gMSB8fCB0YXNrSW5kZXggPD0gMCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCBwcmVkZWNlc3NvcnNUb0NoZWNrID0gW3Rhc2tJbmRleF07XG4gIGNvbnN0IHJldDogU2V0PG51bWJlcj4gPSBuZXcgU2V0KCk7XG4gIGNvbnN0IGJ5RGVzdCA9IGVkZ2VzQnlEc3RUb01hcChkaXJlY3RlZEdyYXBoLkVkZ2VzKTtcbiAgd2hpbGUgKHByZWRlY2Vzc29yc1RvQ2hlY2subGVuZ3RoICE9PSAwKSB7XG4gICAgY29uc3Qgbm9kZSA9IHByZWRlY2Vzc29yc1RvQ2hlY2sucG9wKCkhO1xuICAgIHJldC5hZGQobm9kZSk7XG4gICAgY29uc3QgcHJlZGVjZXNzb3JzID0gYnlEZXN0LmdldChub2RlKTtcbiAgICBpZiAocHJlZGVjZXNzb3JzKSB7XG4gICAgICBwcmVkZWNlc3NvcnNUb0NoZWNrLnB1c2goLi4ucHJlZGVjZXNzb3JzLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLmkpKTtcbiAgICB9XG4gIH1cbiAgcmV0LmRlbGV0ZSgwKTtcbiAgcmV0dXJuIFsuLi5yZXQudmFsdWVzKCldO1xufTtcblxuLyoqIFJldHVybnMgdGhlIGluZGljZXMgb2YgYWxsIHRoZSB0YXNrcyBpbiB0aGUgZ3JhcGgsIGV4cGVjdCB0aGUgZmlyc3QgYW5kIHRoZVxuICogIGxhc3QuICovXG5leHBvcnQgY29uc3QgYWxsVGFza3MgPSAoZGlyZWN0ZWRHcmFwaDogRGlyZWN0ZWRHcmFwaCk6IG51bWJlcltdID0+IHtcbiAgY29uc3QgcmV0ID0gW107XG4gIGZvciAobGV0IGluZGV4ID0gMTsgaW5kZXggPCBkaXJlY3RlZEdyYXBoLlZlcnRpY2VzLmxlbmd0aCAtIDE7IGluZGV4KyspIHtcbiAgICByZXQucHVzaChpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCBjb25zdCBkaWZmZXJlbmNlID0gKGE6IG51bWJlcltdLCBiOiBudW1iZXJbXSk6IG51bWJlcltdID0+IHtcbiAgY29uc3QgYlNldCA9IG5ldyBTZXQoYik7XG4gIHJldHVybiBhLmZpbHRlcigoaTogbnVtYmVyKSA9PiBiU2V0LmhhcyhpKSA9PT0gZmFsc2UpO1xufTtcblxuZXhwb3J0IGNvbnN0IGFsbFBvdGVudGlhbFN1Y2Nlc3NvcnMgPSAoXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBkaXJlY3RlZEdyYXBoOiBEaXJlY3RlZEdyYXBoXG4pOiBudW1iZXJbXSA9PiB7XG4gIC8vIFJlbW92ZSBhbGwgZGlyZWN0IHN1Y2Nlc3NvcnMgYWxzby5cbiAgY29uc3QgYnlTcmMgPSBlZGdlc0J5U3JjVG9NYXAoZGlyZWN0ZWRHcmFwaC5FZGdlcyk7XG4gIGNvbnN0IGRpcmVjdFN1Y2MgPSBieVNyYy5nZXQodGFza0luZGV4KSB8fCBbXTtcbiAgY29uc3QgZGlyZWN0U3VjY0FycmF5ID0gZGlyZWN0U3VjYy5tYXAoKGU6IERpcmVjdGVkRWRnZSkgPT4gZS5qKTtcblxuICByZXR1cm4gZGlmZmVyZW5jZShhbGxUYXNrcyhkaXJlY3RlZEdyYXBoKSwgW1xuICAgIC4uLmFsbFByZWRlY2Vzc29ycyh0YXNrSW5kZXgsIGRpcmVjdGVkR3JhcGgpLFxuICAgIC4uLmRpcmVjdFN1Y2NBcnJheSxcbiAgXSk7XG59O1xuXG5leHBvcnQgY29uc3QgYWxsUG90ZW50aWFsUHJlZGVjZXNzb3JzID0gKFxuICB0YXNrSW5kZXg6IG51bWJlcixcbiAgZGlyZWN0ZWRHcmFwaDogRGlyZWN0ZWRHcmFwaFxuKTogbnVtYmVyW10gPT4ge1xuICAvLyBSZW1vdmUgYWxsIGRpcmVjdCBwcmVkZWNlc3NvcnMgYWxzby5cbiAgY29uc3QgYnlEZXN0ID0gZWRnZXNCeURzdFRvTWFwKGRpcmVjdGVkR3JhcGguRWRnZXMpO1xuICBjb25zdCBkaXJlY3RQcmVkID0gYnlEZXN0LmdldCh0YXNrSW5kZXgpIHx8IFtdO1xuICBjb25zdCBkaXJlY3RQcmVkQXJyYXkgPSBkaXJlY3RQcmVkLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLmkpO1xuICBjb25zdCBhbGxTdWNjID0gYWxsU3VjY2Vzc29ycyh0YXNrSW5kZXgsIGRpcmVjdGVkR3JhcGgpO1xuICBjb25zdCBhbGwgPSBhbGxUYXNrcyhkaXJlY3RlZEdyYXBoKTtcbiAgY29uc3QgdG9CZVN1YnRyYWN0ZWQgPSBbLi4uYWxsU3VjYywgLi4uZGlyZWN0UHJlZEFycmF5XTtcbiAgcmV0dXJuIGRpZmZlcmVuY2UoYWxsLCB0b0JlU3VidHJhY3RlZCk7XG59O1xuIiwgImltcG9ydCB7IFRhc2tTZWFyY2hDb250cm9sIH0gZnJvbSBcIi4uL3NlYXJjaC90YXNrLXNlYXJjaC1jb250cm9sc1wiO1xuaW1wb3J0IHsgQ2hhcnQgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnRcIjtcbmltcG9ydCB7IERlcFR5cGUsIGRlcERpc3BsYXlOYW1lIH0gZnJvbSBcIi4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmNpZXMtcGFuZWxcIjtcbmltcG9ydCB7XG4gIGFsbFBvdGVudGlhbFN1Y2Nlc3NvcnMsXG4gIGFsbFBvdGVudGlhbFByZWRlY2Vzc29ycyxcbn0gZnJvbSBcIi4uL2RhZy9hbGdvcml0aG1zL2NpcmN1bGFyXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGREZXBlbmRlbmN5RGlhbG9nIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBwcml2YXRlIHRpdGxlRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSB0YXNrU2VhcmNoQ29udHJvbDogVGFza1NlYXJjaENvbnRyb2wgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBkaWFsb2c6IEhUTUxEaWFsb2dFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcmVzb2x2ZTogKHZhbHVlOiBudW1iZXIgfCB1bmRlZmluZWQpID0+IHZvaWQgPSAoKSA9PiB7fTtcblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICB0aGlzLnRpdGxlRWxlbWVudCA9IHRoaXMucXVlcnlTZWxlY3RvcihcImgyXCIpITtcbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sID0gdGhpcy5xdWVyeVNlbGVjdG9yKFwidGFzay1zZWFyY2gtY29udHJvbFwiKSE7XG4gICAgdGhpcy5kaWFsb2cgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJkaWFsb2dcIikhO1xuICAgIHRoaXMuZGlhbG9nLmFkZEV2ZW50TGlzdGVuZXIoXCJjYW5jZWxcIiwgKCkgPT4gdGhpcy5yZXNvbHZlKHVuZGVmaW5lZCkpO1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2wuYWRkRXZlbnRMaXN0ZW5lcihcInRhc2stY2hhbmdlXCIsIChlKSA9PiB7XG4gICAgICB0aGlzLmRpYWxvZyEuY2xvc2UoKTtcbiAgICAgIHRoaXMucmVzb2x2ZShlLmRldGFpbC50YXNrSW5kZXgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFBvcHVsYXRlcyB0aGUgZGlhbG9nIGFuZCBzaG93cyBpdCBhcyBhIE1vZGFsIGRpYWxvZyBhbmQgcmV0dXJucyBhIFByb21pc2VcbiAgICogIHRoYXQgcmVzb2x2ZXMgb24gc3VjY2VzcyB0byBhIHRhc2tJbmRleCwgb3IgdW5kZWZpbmVkIGlmIHRoZSB1c2VyXG4gICAqICBjYW5jZWxsZWQgb3V0IG9mIHRoZSBmbG93LlxuICAgKi9cbiAgcHVibGljIHNlbGVjdERlcGVuZGVuY3koXG4gICAgY2hhcnQ6IENoYXJ0LFxuICAgIHRhc2tJbmRleDogbnVtYmVyLFxuICAgIGRlcFR5cGU6IERlcFR5cGVcbiAgKTogUHJvbWlzZTxudW1iZXIgfCB1bmRlZmluZWQ+IHtcbiAgICB0aGlzLnRpdGxlRWxlbWVudCEudGV4dENvbnRlbnQgPSBkZXBEaXNwbGF5TmFtZVtkZXBUeXBlXTtcblxuICAgIGxldCBpbmNsdWRlZEluZGV4ZXMgPSBbXTtcbiAgICBpZiAoZGVwVHlwZSA9PT0gXCJwcmVkXCIpIHtcbiAgICAgIGluY2x1ZGVkSW5kZXhlcyA9IGFsbFBvdGVudGlhbFByZWRlY2Vzc29ycyh0YXNrSW5kZXgsIGNoYXJ0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5jbHVkZWRJbmRleGVzID0gYWxsUG90ZW50aWFsU3VjY2Vzc29ycyh0YXNrSW5kZXgsIGNoYXJ0KTtcbiAgICB9XG4gICAgdGhpcy50YXNrU2VhcmNoQ29udHJvbCEudGFza3MgPSBjaGFydC5WZXJ0aWNlcztcbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sIS5pbmNsdWRlZEluZGV4ZXMgPSBpbmNsdWRlZEluZGV4ZXM7XG5cbiAgICAvLyBUT0RPIC0gQWxsb3cgYm90aCB0eXBlcyBvZiBzZWFyY2ggaW4gdGhlIGRlcGVuZGVuY3kgZGlhbG9nLlxuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLnNldEtleWJvYXJkRm9jdXNUb0lucHV0KFwibmFtZS1vbmx5XCIpO1xuICAgIGNvbnN0IHJldCA9IG5ldyBQcm9taXNlPG51bWJlciB8IHVuZGVmaW5lZD4oKHJlc29sdmUsIF9yZWplY3QpID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICB0aGlzLmRpYWxvZyEuc2hvd01vZGFsKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJhZGQtZGVwZW5kZW5jeS1kaWFsb2dcIiwgQWRkRGVwZW5kZW5jeURpYWxvZyk7XG4iLCAiaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHsgQWRkUmVzb3VyY2VPcCwgRGVsZXRlUmVzb3VyY2VPcCB9IGZyb20gXCIuLi9vcHMvcmVzb3VyY2VzXCI7XG5pbXBvcnQgeyBleGVjdXRlT3AgfSBmcm9tIFwiLi4vYWN0aW9uL2V4ZWN1dGVcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQgeyBFZGl0UmVzb3VyY2VEZWZpbml0aW9uIH0gZnJvbSBcIi4uL2VkaXQtcmVzb3VyY2UtZGVmaW5pdGlvbi9lZGl0LXJlc291cmNlLWRlZmluaXRpb25cIjtcbmltcG9ydCB7IGljb24gfSBmcm9tIFwiLi4vaWNvbnMvaWNvbnNcIjtcblxuLy8gTG9uZ2VzdCByZXByZXNlbnRhdGlvbiB3ZSdsbCBzaG93IGZvciBhbGwgdGhlIG9wdGlvbnMgb2YgYSBSZXNvdXJjZS5cbmNvbnN0IE1BWF9TSE9SVF9TVFJJTkcgPSA4MDtcblxuZXhwb3J0IGNsYXNzIEVkaXRSZXNvdXJjZXNEaWFsb2cgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW4gfCBudWxsID0gbnVsbDtcbiAgcGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2s6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuZXhwbGFuTWFpbiAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpOiB2b2lkIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgXCJwbGFuLWRlZmluaXRpb24tY2hhbmdlZFwiLFxuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFja1xuICAgICk7XG4gIH1cblxuICBzaG93TW9kYWwoZXhwbGFuTWFpbjogRXhwbGFuTWFpbikge1xuICAgIHRoaXMuZXhwbGFuTWFpbiA9IGV4cGxhbk1haW47XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5zaG93TW9kYWwoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyKCkge1xuICAgIHJlbmRlcih0aGlzLnRlbXBsYXRlKCksIHRoaXMpO1xuICB9XG5cbiAgcHJpdmF0ZSB2YWx1ZXNUb1Nob3J0U3RyaW5nKHZhbHVlczogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgIGxldCByZXQgPSB2YWx1ZXMuam9pbihcIiwgXCIpO1xuICAgIGlmIChyZXQubGVuZ3RoID4gTUFYX1NIT1JUX1NUUklORykge1xuICAgICAgcmV0ID0gcmV0LnNsaWNlKDAsIE1BWF9TSE9SVF9TVFJJTkcpICsgXCIgLi4uXCI7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBwcml2YXRlIGRlbEJ1dHRvbklmTm90U3RhdGljKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBpc1N0YXRpYzogYm9vbGVhblxuICApOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgaWYgKGlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gaHRtbGBgO1xuICAgIH1cbiAgICByZXR1cm4gaHRtbGA8YnV0dG9uXG4gICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgIHRpdGxlPVwiRGVsZXRlIHRoaXMgcmVzb3VyY2UuXCJcbiAgICAgIEBjbGljaz0keygpID0+IHRoaXMuZGVsZXRlUmVzb3VyY2UobmFtZSl9XG4gICAgPlxuICAgICAgJHtpY29uKFwiZGVsZXRlLWljb25cIil9XG4gICAgPC9idXR0b24+YDtcbiAgfVxuXG4gIHByaXZhdGUgZWRpdEJ1dHRvbklmTm90U3RhdGljKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBpc1N0YXRpYzogYm9vbGVhblxuICApOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgaWYgKGlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gaHRtbGBgO1xuICAgIH1cbiAgICByZXR1cm4gaHRtbGA8YnV0dG9uXG4gICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgIHRpdGxlPVwiRWRpdCB0aGUgcmVzb3VyY2UgZGVmaW5pdGlvbi5cIlxuICAgICAgQGNsaWNrPSR7KCkgPT4gdGhpcy5lZGl0UmVzb3VyY2UobmFtZSl9XG4gICAgPlxuICAgICAgJHtpY29uKFwiZWRpdC1pY29uXCIpfVxuICAgIDwvYnV0dG9uPmA7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGRlbGV0ZVJlc291cmNlKG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHJldCA9IGF3YWl0IGV4ZWN1dGVPcChcbiAgICAgIERlbGV0ZVJlc291cmNlT3AobmFtZSksXG4gICAgICBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLFxuICAgICAgdHJ1ZSxcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiFcbiAgICApO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9zZSgpIHtcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwiZGlhbG9nXCIpIS5jbG9zZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBlZGl0UmVzb3VyY2UobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICAgIHRoaXMuZXhwbGFuTWFpbiEucXVlcnlTZWxlY3RvcjxFZGl0UmVzb3VyY2VEZWZpbml0aW9uPihcbiAgICAgIFwiZWRpdC1yZXNvdXJjZS1kZWZpbml0aW9uXCJcbiAgICApIS5zaG93TW9kYWwoXG4gICAgICB0aGlzLmV4cGxhbk1haW4hLFxuICAgICAgbmFtZSxcbiAgICAgIHRoaXMuZXhwbGFuTWFpbiEucGxhbi5yZXNvdXJjZURlZmluaXRpb25zW25hbWVdXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbmV3UmVzb3VyY2UoKSB7XG4gICAgY29uc3QgbmFtZSA9IHdpbmRvdy5wcm9tcHQoXCJSZXNvdXJjZSBuYW1lOlwiLCBcIlwiKTtcbiAgICBpZiAobmFtZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZXQgPSBhd2FpdCBleGVjdXRlT3AoXG4gICAgICBBZGRSZXNvdXJjZU9wKG5hbWUpLFxuICAgICAgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIixcbiAgICAgIHRydWUsXG4gICAgICB0aGlzLmV4cGxhbk1haW4hXG4gICAgKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgd2luZG93LmFsZXJ0KHJldC5lcnJvcik7XG4gICAgICBjb25zb2xlLmxvZyhyZXQuZXJyb3IpO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSB0ZW1wbGF0ZSgpOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgY29uc3QgcmQgPSB0aGlzLmV4cGxhbk1haW4hLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucztcbiAgICBjb25zdCBhbGxLZXlzU29ydGVkID0gT2JqZWN0LmtleXMocmQpLnNvcnQoXG4gICAgICAoa2V5QTogc3RyaW5nLCBrZXlCOiBzdHJpbmcpOiBudW1iZXIgPT4ge1xuICAgICAgICBjb25zdCBhID0gcmRba2V5QV07XG4gICAgICAgIGNvbnN0IGIgPSByZFtrZXlCXTtcbiAgICAgICAgaWYgKGEuaXNTdGF0aWMgPT09IGIuaXNTdGF0aWMpIHtcbiAgICAgICAgICByZXR1cm4ga2V5QS5sb2NhbGVDb21wYXJlKGtleUIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhLmlzU3RhdGljKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuICAgICk7XG5cbiAgICByZXR1cm4gaHRtbGBcbiAgICAgIDxkaWFsb2c+XG4gICAgICAgIDxoMz5SZXNvdXJjZXM8L2gzPlxuICAgICAgICA8dGFibGU+XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRoPk5hbWU8L3RoPlxuICAgICAgICAgICAgPHRoPlZhbHVlczwvdGg+XG4gICAgICAgICAgICA8dGg+RGVsZXRlPC90aD5cbiAgICAgICAgICAgIDx0aD5FZGl0PC90aD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgICR7YWxsS2V5c1NvcnRlZC5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRlZm4gPSByZFtuYW1lXTtcbiAgICAgICAgICAgIHJldHVybiBodG1sYDx0cj5cbiAgICAgICAgICAgICAgPHRkPiR7bmFtZX08L3RkPlxuICAgICAgICAgICAgICA8dGQ+JHt0aGlzLnZhbHVlc1RvU2hvcnRTdHJpbmcoZGVmbi52YWx1ZXMpfTwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD4ke3RoaXMuZGVsQnV0dG9uSWZOb3RTdGF0aWMobmFtZSwgZGVmbi5pc1N0YXRpYyl9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPiR7dGhpcy5lZGl0QnV0dG9uSWZOb3RTdGF0aWMobmFtZSwgZGVmbi5pc1N0YXRpYyl9PC90ZD5cbiAgICAgICAgICAgIDwvdHI+YDtcbiAgICAgICAgICB9KX1cbiAgICAgICAgICA8dHI+XG4gICAgICAgICAgICA8dGQ+PC90ZD5cbiAgICAgICAgICAgIDx0ZD48L3RkPlxuICAgICAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBjbGFzcz1cImljb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICB0aXRsZT1cIkFkZCBhIG5ldyBSZXNvdXJjZS5cIlxuICAgICAgICAgICAgICAgIEBjbGljaz0keygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMubmV3UmVzb3VyY2UoKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgJHtpY29uKFwiYWRkLWljb25cIil9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZGlhbG9nLWZvb3RlclwiPlxuICAgICAgICAgIDxidXR0b24gQGNsaWNrPSR7KCkgPT4gdGhpcy5jbG9zZSgpfT5DbG9zZTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGlhbG9nPlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwiZWRpdC1yZXNvdXJjZXMtZGlhbG9nXCIsIEVkaXRSZXNvdXJjZXNEaWFsb2cpO1xuIiwgImltcG9ydCB7XG4gIFZlcnRleCxcbiAgVmVydGV4SW5kaWNlcyxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeVNyY1RvTWFwLFxufSBmcm9tIFwiLi4vZGFnLnRzXCI7XG5cbi8qKlxuVGhlIHJldHVybiB0eXBlIGZvciB0aGUgVG9wbG9naWNhbFNvcnQgZnVuY3Rpb24uIFxuICovXG50eXBlIFRTUmV0dXJuID0ge1xuICBoYXNDeWNsZXM6IGJvb2xlYW47XG5cbiAgY3ljbGU6IFZlcnRleEluZGljZXM7XG5cbiAgb3JkZXI6IFZlcnRleEluZGljZXM7XG59O1xuXG4vKipcblJldHVybnMgYSB0b3BvbG9naWNhbCBzb3J0IG9yZGVyIGZvciBhIERpcmVjdGVkR3JhcGgsIG9yIHRoZSBtZW1iZXJzIG9mIGEgY3ljbGUgaWYgYVxudG9wb2xvZ2ljYWwgc29ydCBjYW4ndCBiZSBkb25lLlxuIFxuIFRoZSB0b3BvbG9naWNhbCBzb3J0IGNvbWVzIGZyb206XG5cbiAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ub3BvbG9naWNhbF9zb3J0aW5nI0RlcHRoLWZpcnN0X3NlYXJjaFxuXG5MIFx1MjE5MCBFbXB0eSBsaXN0IHRoYXQgd2lsbCBjb250YWluIHRoZSBzb3J0ZWQgbm9kZXNcbndoaWxlIGV4aXN0cyBub2RlcyB3aXRob3V0IGEgcGVybWFuZW50IG1hcmsgZG9cbiAgICBzZWxlY3QgYW4gdW5tYXJrZWQgbm9kZSBuXG4gICAgdmlzaXQobilcblxuZnVuY3Rpb24gdmlzaXQobm9kZSBuKVxuICAgIGlmIG4gaGFzIGEgcGVybWFuZW50IG1hcmsgdGhlblxuICAgICAgICByZXR1cm5cbiAgICBpZiBuIGhhcyBhIHRlbXBvcmFyeSBtYXJrIHRoZW5cbiAgICAgICAgc3RvcCAgIChncmFwaCBoYXMgYXQgbGVhc3Qgb25lIGN5Y2xlKVxuXG4gICAgbWFyayBuIHdpdGggYSB0ZW1wb3JhcnkgbWFya1xuXG4gICAgZm9yIGVhY2ggbm9kZSBtIHdpdGggYW4gZWRnZSBmcm9tIG4gdG8gbSBkb1xuICAgICAgICB2aXNpdChtKVxuXG4gICAgcmVtb3ZlIHRlbXBvcmFyeSBtYXJrIGZyb20gblxuICAgIG1hcmsgbiB3aXRoIGEgcGVybWFuZW50IG1hcmtcbiAgICBhZGQgbiB0byBoZWFkIG9mIExcblxuICovXG5leHBvcnQgY29uc3QgdG9wb2xvZ2ljYWxTb3J0ID0gKGc6IERpcmVjdGVkR3JhcGgpOiBUU1JldHVybiA9PiB7XG4gIGNvbnN0IHJldDogVFNSZXR1cm4gPSB7XG4gICAgaGFzQ3ljbGVzOiBmYWxzZSxcbiAgICBjeWNsZTogW10sXG4gICAgb3JkZXI6IFtdLFxuICB9O1xuXG4gIGNvbnN0IGVkZ2VNYXAgPSBlZGdlc0J5U3JjVG9NYXAoZy5FZGdlcyk7XG5cbiAgY29uc3Qgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyayA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICBnLlZlcnRpY2VzLmZvckVhY2goKF86IFZlcnRleCwgaW5kZXg6IG51bWJlcikgPT5cbiAgICBub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrLmFkZChpbmRleClcbiAgKTtcblxuICBjb25zdCBoYXNQZXJtYW5lbnRNYXJrID0gKGluZGV4OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gIW5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsuaGFzKGluZGV4KTtcbiAgfTtcblxuICBjb25zdCB0ZW1wb3JhcnlNYXJrID0gbmV3IFNldDxudW1iZXI+KCk7XG5cbiAgY29uc3QgdmlzaXQgPSAoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgIGlmIChoYXNQZXJtYW5lbnRNYXJrKGluZGV4KSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICh0ZW1wb3JhcnlNYXJrLmhhcyhpbmRleCkpIHtcbiAgICAgIC8vIFdlIG9ubHkgcmV0dXJuIGZhbHNlIG9uIGZpbmRpbmcgYSBsb29wLCB3aGljaCBpcyBzdG9yZWQgaW5cbiAgICAgIC8vIHRlbXBvcmFyeU1hcmsuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRlbXBvcmFyeU1hcmsuYWRkKGluZGV4KTtcblxuICAgIGNvbnN0IG5leHRFZGdlcyA9IGVkZ2VNYXAuZ2V0KGluZGV4KTtcbiAgICBpZiAobmV4dEVkZ2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmV4dEVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGUgPSBuZXh0RWRnZXNbaV07XG4gICAgICAgIGlmICghdmlzaXQoZS5qKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRlbXBvcmFyeU1hcmsuZGVsZXRlKGluZGV4KTtcbiAgICBub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrLmRlbGV0ZShpbmRleCk7XG4gICAgcmV0Lm9yZGVyLnVuc2hpZnQoaW5kZXgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIFdlIHdpbGwgcHJlc3VtZSB0aGF0IFZlcnRleFswXSBpcyB0aGUgc3RhcnQgbm9kZSBhbmQgdGhhdCB3ZSBzaG91bGQgc3RhcnQgdGhlcmUuXG4gIGNvbnN0IG9rID0gdmlzaXQoMCk7XG4gIGlmICghb2spIHtcbiAgICByZXQuaGFzQ3ljbGVzID0gdHJ1ZTtcbiAgICByZXQuY3ljbGUgPSBbLi4udGVtcG9yYXJ5TWFyay5rZXlzKCldO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQge1xuICBWZXJ0ZXhJbmRpY2VzLFxuICBFZGdlcyxcbiAgRGlyZWN0ZWRHcmFwaCxcbiAgZWRnZXNCeVNyY1RvTWFwLFxuICBlZGdlc0J5RHN0VG9NYXAsXG4gIERpcmVjdGVkRWRnZSxcbiAgRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL2RhZy9kYWdcIjtcblxuaW1wb3J0IHsgdG9wb2xvZ2ljYWxTb3J0IH0gZnJvbSBcIi4uL2RhZy9hbGdvcml0aG1zL3RvcG9zb3J0LnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNWYWx1ZXMgfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBUYXNrRHVyYXRpb24gfSBmcm9tIFwiLi4vdHlwZXMvdHlwZXMudHNcIjtcblxuZXhwb3J0IHR5cGUgVGFza1N0YXRlID0gXCJ1bnN0YXJ0ZWRcIiB8IFwic3RhcnRlZFwiIHwgXCJjb21wbGV0ZVwiO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9UQVNLX05BTUUgPSBcIlRhc2sgTmFtZVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tTZXJpYWxpemVkIHtcbiAgcmVzb3VyY2VzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuICBtZXRyaWNzOiBNZXRyaWNWYWx1ZXM7XG4gIG5hbWU6IHN0cmluZztcbiAgaWQ6IHN0cmluZztcbn1cblxuLy8gRG8gd2UgY3JlYXRlIHN1Yi1jbGFzc2VzIGFuZCB0aGVuIHNlcmlhbGl6ZSBzZXBhcmF0ZWx5PyBPciBkbyB3ZSBoYXZlIGFcbi8vIGNvbmZpZyBhYm91dCB3aGljaCB0eXBlIG9mIER1cmF0aW9uU2FtcGxlciBpcyBiZWluZyB1c2VkP1xuLy9cbi8vIFdlIGNhbiB1c2UgdHJhZGl0aW9uYWwgb3B0aW1pc3RpYy9wZXNzaW1pc3RpYyB2YWx1ZS4gT3IgSmFjb2JpYW4nc1xuLy8gdW5jZXJ0YWludGx5IG11bHRpcGxpZXJzIFsxLjEsIDEuNSwgMiwgNV0gYW5kIHRoZWlyIGludmVyc2VzIHRvIGdlbmVyYXRlIGFuXG4vLyBvcHRpbWlzdGljIHBlc3NpbWlzdGljLlxuXG4vKiogVGFzayBpcyBhIFZlcnRleCB3aXRoIGRldGFpbHMgYWJvdXQgdGhlIFRhc2sgdG8gY29tcGxldGUuICovXG5leHBvcnQgY2xhc3MgVGFzayB7XG4gIC8vIFJlc291cmNlIGtleXMgYW5kIHZhbHVlcy4gVGhlIHBhcmVudCBwbGFuIGNvbnRhaW5zIGFsbCB0aGUgcmVzb3VyY2VcbiAgLy8gZGVmaW5pdGlvbnMuXG4gIHJlc291cmNlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbiAgbWV0cmljczogTWV0cmljVmFsdWVzO1xuICBuYW1lOiBzdHJpbmc7XG4gIGlkOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nID0gXCJcIikge1xuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgREVGQVVMVF9UQVNLX05BTUU7XG4gICAgdGhpcy5tZXRyaWNzID0ge307XG4gICAgdGhpcy5yZXNvdXJjZXMgPSB7fTtcbiAgICB0aGlzLmlkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgfVxuXG4gIHRvSlNPTigpOiBUYXNrU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc291cmNlczogdGhpcy5yZXNvdXJjZXMsXG4gICAgICBtZXRyaWNzOiB0aGlzLm1ldHJpY3MsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICBpZDogdGhpcy5pZCxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGdldCBkdXJhdGlvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldE1ldHJpYyhcIkR1cmF0aW9uXCIpITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgZHVyYXRpb24odmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgdmFsdWUpO1xuICB9XG5cbiAgcHVibGljIGdldE1ldHJpYyhrZXk6IHN0cmluZyk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMubWV0cmljc1trZXldO1xuICB9XG5cbiAgcHVibGljIHNldE1ldHJpYyhrZXk6IHN0cmluZywgdmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMubWV0cmljc1trZXldID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZGVsZXRlTWV0cmljKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMubWV0cmljc1trZXldO1xuICB9XG5cbiAgcHVibGljIGdldFJlc291cmNlKGtleTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZXNba2V5XTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRSZXNvdXJjZShrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMucmVzb3VyY2VzW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVSZXNvdXJjZShrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLnJlc291cmNlc1trZXldO1xuICB9XG5cbiAgcHVibGljIGR1cCgpOiBUYXNrIHtcbiAgICBjb25zdCByZXQgPSBuZXcgVGFzaygpO1xuICAgIHJldC5yZXNvdXJjZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnJlc291cmNlcyk7XG4gICAgcmV0Lm1ldHJpY3MgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm1ldHJpY3MpO1xuICAgIHJldC5uYW1lID0gdGhpcy5uYW1lO1xuICAgIHJldHVybiByZXQ7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVGFza3MgPSBUYXNrW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hhcnRTZXJpYWxpemVkIHtcbiAgdmVydGljZXM6IFRhc2tTZXJpYWxpemVkW107XG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkW107XG59XG5cbi8qKiBBIENoYXJ0IGlzIGEgRGlyZWN0ZWRHcmFwaCwgYnV0IHdpdGggVGFza3MgZm9yIFZlcnRpY2VzLiAqL1xuZXhwb3J0IGNsYXNzIENoYXJ0IHtcbiAgVmVydGljZXM6IFRhc2tzO1xuICBFZGdlczogRWRnZXM7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc3Qgc3RhcnQgPSBuZXcgVGFzayhcIlN0YXJ0XCIpO1xuICAgIHN0YXJ0LnNldE1ldHJpYyhcIkR1cmF0aW9uXCIsIDApO1xuICAgIGNvbnN0IGZpbmlzaCA9IG5ldyBUYXNrKFwiRmluaXNoXCIpO1xuICAgIGZpbmlzaC5zZXRNZXRyaWMoXCJEdXJhdGlvblwiLCAwKTtcbiAgICB0aGlzLlZlcnRpY2VzID0gW3N0YXJ0LCBmaW5pc2hdO1xuICAgIHRoaXMuRWRnZXMgPSBbbmV3IERpcmVjdGVkRWRnZSgwLCAxKV07XG4gIH1cblxuICB0b0pTT04oKTogQ2hhcnRTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmVydGljZXM6IHRoaXMuVmVydGljZXMubWFwKCh0OiBUYXNrKSA9PiB0LnRvSlNPTigpKSxcbiAgICAgIGVkZ2VzOiB0aGlzLkVkZ2VzLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLnRvSlNPTigpKSxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFRvcG9sb2dpY2FsT3JkZXIgPSBWZXJ0ZXhJbmRpY2VzO1xuXG5leHBvcnQgdHlwZSBWYWxpZGF0ZVJlc3VsdCA9IFJlc3VsdDxUb3BvbG9naWNhbE9yZGVyPjtcblxuLyoqIFZhbGlkYXRlcyB0aGUgRGlyZWN0ZWRHcmFwaCBjb21wb25lbnQgb2YgYSBDaGFydCBpcyB2YWxpZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZURpcmVjdGVkR3JhcGgoZzogRGlyZWN0ZWRHcmFwaCk6IFZhbGlkYXRlUmVzdWx0IHtcbiAgaWYgKGcuVmVydGljZXMubGVuZ3RoIDwgMikge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIFwiQ2hhcnQgbXVzdCBjb250YWluIGF0IGxlYXN0IHR3byBub2RlLCB0aGUgc3RhcnQgYW5kIGZpbmlzaCB0YXNrcy5cIlxuICAgICk7XG4gIH1cblxuICBjb25zdCBlZGdlc0J5RHN0ID0gZWRnZXNCeURzdFRvTWFwKGcuRWRnZXMpO1xuICBjb25zdCBlZGdlc0J5U3JjID0gZWRnZXNCeVNyY1RvTWFwKGcuRWRnZXMpO1xuXG4gIC8vIFRoZSBmaXJzdCBWZXJ0ZXgsIFRfMCBha2EgdGhlIFN0YXJ0IE1pbGVzdG9uZSwgbXVzdCBoYXZlIDAgaW5jb21pbmcgZWRnZXMuXG4gIGlmIChlZGdlc0J5RHN0LmdldCgwKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFwiVGhlIHN0YXJ0IG5vZGUgKDApIGhhcyBhbiBpbmNvbWluZyBlZGdlLlwiKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfMCBzaG91bGQgaGF2ZSAwIGluY29taW5nIGVkZ2VzLlxuICBmb3IgKGxldCBpID0gMTsgaSA8IGcuVmVydGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeURzdC5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0ICgwKSB0aGF0IGhhcyBubyBpbmNvbWluZyBlZGdlczogJHtpfWBcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlIGxhc3QgVmVydGV4LCBUX2ZpbmlzaCwgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIG11c3QgaGF2ZSAwIG91dGdvaW5nIGVkZ2VzLlxuICBpZiAoZWRnZXNCeVNyYy5nZXQoZy5WZXJ0aWNlcy5sZW5ndGggLSAxKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgXCJUaGUgbGFzdCBub2RlLCB3aGljaCBzaG91bGQgYmUgdGhlIEZpbmlzaCBNaWxlc3RvbmUsIGhhcyBhbiBvdXRnb2luZyBlZGdlLlwiXG4gICAgKTtcbiAgfVxuXG4gIC8vIEFuZCBvbmx5IFRfZmluaXNoIHNob3VsZCBoYXZlIDAgb3V0Z29pbmcgZWRnZXMuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZy5WZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBpZiAoZWRnZXNCeVNyYy5nZXQoaSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgRm91bmQgbm9kZSB0aGF0IGlzbid0IFRfZmluaXNoIHRoYXQgaGFzIG5vIG91dGdvaW5nIGVkZ2VzOiAke2l9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBudW1WZXJ0aWNlcyA9IGcuVmVydGljZXMubGVuZ3RoO1xuICAvLyBBbmQgYWxsIGVkZ2VzIG1ha2Ugc2Vuc2UsIGkuZS4gdGhleSBhbGwgcG9pbnQgdG8gdmVydGV4ZXMgdGhhdCBleGlzdC5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBnLkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGcuRWRnZXNbaV07XG4gICAgaWYgKFxuICAgICAgZWxlbWVudC5pIDwgMCB8fFxuICAgICAgZWxlbWVudC5pID49IG51bVZlcnRpY2VzIHx8XG4gICAgICBlbGVtZW50LmogPCAwIHx8XG4gICAgICBlbGVtZW50LmogPj0gbnVtVmVydGljZXNcbiAgICApIHtcbiAgICAgIHJldHVybiBlcnJvcihgRWRnZSAke2VsZW1lbnR9IHBvaW50cyB0byBhIG5vbi1leGlzdGVudCBWZXJ0ZXguYCk7XG4gICAgfVxuICB9XG5cbiAgLy8gTm93IHdlIGNvbmZpcm0gdGhhdCB3ZSBoYXZlIGEgRGlyZWN0ZWQgQWN5Y2xpYyBHcmFwaCwgaS5lLiB0aGUgZ3JhcGggaGFzIG5vXG4gIC8vIGN5Y2xlcyBieSBjcmVhdGluZyBhIHRvcG9sb2dpY2FsIHNvcnQgc3RhcnRpbmcgYXQgVF8wXG4gIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmcjRGVwdGgtZmlyc3Rfc2VhcmNoXG4gIGNvbnN0IHRzUmV0ID0gdG9wb2xvZ2ljYWxTb3J0KGcpO1xuICBpZiAodHNSZXQuaGFzQ3ljbGVzKSB7XG4gICAgcmV0dXJuIGVycm9yKGBDaGFydCBoYXMgY3ljbGU6ICR7Wy4uLnRzUmV0LmN5Y2xlXS5qb2luKFwiLCBcIil9YCk7XG4gIH1cblxuICByZXR1cm4gb2sodHNSZXQub3JkZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2hhcnRWYWxpZGF0ZShcbiAgYzogQ2hhcnQsXG4gIHRhc2tEdXJhdGlvbjogVGFza0R1cmF0aW9uIHwgbnVsbCA9IG51bGxcbik6IFZhbGlkYXRlUmVzdWx0IHtcbiAgaWYgKHRhc2tEdXJhdGlvbiA9PT0gbnVsbCkge1xuICAgIHRhc2tEdXJhdGlvbiA9ICh0YXNrSW5kZXg6IG51bWJlcikgPT4gYy5WZXJ0aWNlc1t0YXNrSW5kZXhdLmR1cmF0aW9uO1xuICB9XG4gIGNvbnN0IHJldCA9IHZhbGlkYXRlRGlyZWN0ZWRHcmFwaChjKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIGlmICh0YXNrRHVyYXRpb24oMCkgIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgU3RhcnQgTWlsZXN0b25lIG11c3QgaGF2ZSBkdXJhdGlvbiBvZiAwLCBpbnN0ZWFkIGdvdCAke3Rhc2tEdXJhdGlvbigwKX1gXG4gICAgKTtcbiAgfVxuICBpZiAodGFza0R1cmF0aW9uKGMuVmVydGljZXMubGVuZ3RoIC0gMSkgIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgRmluaXNoIE1pbGVzdG9uZSBtdXN0IGhhdmUgZHVyYXRpb24gb2YgMCwgaW5zdGVhZCBnb3QgJHt0YXNrRHVyYXRpb24oXG4gICAgICAgIGMuVmVydGljZXMubGVuZ3RoIC0gMVxuICAgICAgKX1gXG4gICAgKTtcbiAgfVxuICBjb25zdCBhbGxJRHMgPSBuZXcgU2V0KCk7XG4gIGZvciAobGV0IHRhc2tJbmRleCA9IDA7IHRhc2tJbmRleCA8IGMuVmVydGljZXMubGVuZ3RoOyB0YXNrSW5kZXgrKykge1xuICAgIGNvbnN0IHRhc2sgPSBjLlZlcnRpY2VzW3Rhc2tJbmRleF07XG4gICAgaWYgKGFsbElEcy5oYXModGFzay5pZCkpIHtcbiAgICAgIHJldHVybiBlcnJvcihuZXcgRXJyb3IoYFR3byB0YXNrcyBjb250YWluIHRoZSBzYW1lIElEOiAke3Rhc2suaWR9YCkpO1xuICAgIH1cbiAgICBhbGxJRHMuYWRkKHRhc2suaWQpO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG4iLCAiLyoqXG4gKiBUcmlhbmd1bGFyIGlzIHRoZSBpbnZlcnNlIEN1bXVsYXRpdmUgRGVuc2l0eSBGdW5jdGlvbiAoQ0RGKSBmb3IgdGhlXG4gKiB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ucmlhbmd1bGFyX2Rpc3RyaWJ1dGlvbiNHZW5lcmF0aW5nX3JhbmRvbV92YXJpYXRlc1xuICpcbiAqIFRoZSBpbnZlcnNlIG9mIHRoZSBDREYgaXMgdXNlZnVsIGZvciBnZW5lcmF0aW5nIHNhbXBsZXMgZnJvbSB0aGVcbiAqIGRpc3RyaWJ1dGlvbiwgaS5lLiBwYXNzaW5nIGluIHZhbHVlcyBmcm9tIHRoZSB1bmlmb3JtIGRpc3RyaWJ1dGlvbiBbMCwgMV1cbiAqIHdpbGwgcHJvZHVjZSBzYW1wbGUgdGhhdCBsb29rIGxpa2UgdGhleSBjb21lIGZyb20gdGhlIHRyaWFuZ3VsYXJcbiAqIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKlxuICovXG5cbmV4cG9ydCBjbGFzcyBUcmlhbmd1bGFyIHtcbiAgcHJpdmF0ZSBhOiBudW1iZXI7XG4gIHByaXZhdGUgYjogbnVtYmVyO1xuICBwcml2YXRlIGM6IG51bWJlcjtcbiAgcHJpdmF0ZSBGX2M6IG51bWJlcjtcblxuICAvKiogIFRoZSB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbiBpcyBhIGNvbnRpbnVvdXMgcHJvYmFiaWxpdHkgZGlzdHJpYnV0aW9uIHdpdGhcbiAgbG93ZXIgbGltaXQgYGFgLCB1cHBlciBsaW1pdCBgYmAsIGFuZCBtb2RlIGBjYCwgd2hlcmUgYSA8IGIgYW5kIGEgXHUyMjY0IGMgXHUyMjY0IGIuICovXG4gIGNvbnN0cnVjdG9yKGE6IG51bWJlciwgYjogbnVtYmVyLCBjOiBudW1iZXIpIHtcbiAgICB0aGlzLmEgPSBhO1xuICAgIHRoaXMuYiA9IGI7XG4gICAgdGhpcy5jID0gYztcblxuICAgIC8vIEZfYyBpcyB0aGUgY3V0b2ZmIGluIHRoZSBkb21haW4gd2hlcmUgd2Ugc3dpdGNoIGJldHdlZW4gdGhlIHR3byBoYWx2ZXMgb2ZcbiAgICAvLyB0aGUgdHJpYW5nbGUuXG4gICAgdGhpcy5GX2MgPSAoYyAtIGEpIC8gKGIgLSBhKTtcbiAgfVxuXG4gIC8qKiAgUHJvZHVjZSBhIHNhbXBsZSBmcm9tIHRoZSB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbi4gVGhlIHZhbHVlIG9mICdwJ1xuICAgc2hvdWxkIGJlIGluIFswLCAxLjBdLiAqL1xuICBzYW1wbGUocDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBpZiAocCA8IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH0gZWxzZSBpZiAocCA+IDEuMCkge1xuICAgICAgcmV0dXJuIDEuMDtcbiAgICB9IGVsc2UgaWYgKHAgPCB0aGlzLkZfYykge1xuICAgICAgcmV0dXJuIHRoaXMuYSArIE1hdGguc3FydChwICogKHRoaXMuYiAtIHRoaXMuYSkgKiAodGhpcy5jIC0gdGhpcy5hKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuYiAtIE1hdGguc3FydCgoMSAtIHApICogKHRoaXMuYiAtIHRoaXMuYSkgKiAodGhpcy5iIC0gdGhpcy5jKSlcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHsgVHJpYW5ndWxhciB9IGZyb20gXCIuL3RyaWFuZ3VsYXIudHNcIjtcblxuZXhwb3J0IHR5cGUgVW5jZXJ0YWludHkgPSBcImxvd1wiIHwgXCJtb2RlcmF0ZVwiIHwgXCJoaWdoXCIgfCBcImV4dHJlbWVcIjtcblxuZXhwb3J0IGNvbnN0IFVuY2VydGFpbnR5VG9OdW06IFJlY29yZDxVbmNlcnRhaW50eSwgbnVtYmVyPiA9IHtcbiAgbG93OiAxLjEsXG4gIG1vZGVyYXRlOiAxLjUsXG4gIGhpZ2g6IDIsXG4gIGV4dHJlbWU6IDUsXG59O1xuXG5leHBvcnQgY2xhc3MgSmFjb2JpYW4ge1xuICBwcml2YXRlIHRyaWFuZ3VsYXI6IFRyaWFuZ3VsYXI7XG4gIGNvbnN0cnVjdG9yKGV4cGVjdGVkOiBudW1iZXIsIHVuY2VydGFpbnR5OiBVbmNlcnRhaW50eSkge1xuICAgIGNvbnN0IG11bCA9IFVuY2VydGFpbnR5VG9OdW1bdW5jZXJ0YWludHldO1xuICAgIHRoaXMudHJpYW5ndWxhciA9IG5ldyBUcmlhbmd1bGFyKGV4cGVjdGVkIC8gbXVsLCBleHBlY3RlZCAqIG11bCwgZXhwZWN0ZWQpO1xuICB9XG5cbiAgc2FtcGxlKHA6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudHJpYW5ndWxhci5zYW1wbGUocCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBSZXN1bHQsIGVycm9yLCBvayB9IGZyb20gXCIuLi9yZXN1bHRcIjtcblxuY29uc3QgZGVjaW1hbFJlZ2V4ID0gL15bXFxkXFwuXSskLztcbmNvbnN0IHNob3J0aGFuZFJlZ2V4ID0gL14oXFxkK2QpPyhcXGQrdyk/KFxcZCttKT8oXFxkK3kpPyQvO1xuXG5leHBvcnQgY29uc3QgcGFyc2VEdXJhdGlvbiA9IChzOiBzdHJpbmcsIGRheXNJbldlZWs6IDUgfCA3KTogUmVzdWx0PG51bWJlcj4gPT4ge1xuICBzID0gcy50cmltKCk7XG4gIGlmIChzLm1hdGNoKGRlY2ltYWxSZWdleCkpIHtcbiAgICByZXR1cm4gb2soK3MpO1xuICB9XG4gIGxldCByZXQgPSAwO1xuICBsZXQgbnVtID0gMDtcbiAgY29uc3QgY2hhcnMgPSBbLi4uc107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjID0gY2hhcnNbaV07XG4gICAgaWYgKGMgPT09IFwiZFwiKSB7XG4gICAgICByZXQgKz0gbnVtO1xuICAgICAgbnVtID0gMDtcbiAgICB9IGVsc2UgaWYgKGMgPT09IFwid1wiKSB7XG4gICAgICByZXQgKz0gbnVtICogZGF5c0luV2VlaztcbiAgICAgIG51bSA9IDA7XG4gICAgfSBlbHNlIGlmIChjID09PSBcIm1cIikge1xuICAgICAgcmV0ICs9IG51bSAqIGRheXNJbldlZWsgKiA0O1xuICAgICAgbnVtID0gMDtcbiAgICB9IGVsc2UgaWYgKFwiMDEyMzQ1Njc4OVwiLmluY2x1ZGVzKGMpKSB7XG4gICAgICBudW0gPSBudW0gKiAxMCArICtjO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKGBpbnZhbGlkIGR1cmF0aW9uIGZvcm1hdDogJHtzfWApKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9rKHJldCk7XG59O1xuIiwgImV4cG9ydCBjbGFzcyBXZWVrZGF5cyB7XG4gIHN0YXJ0OiBEYXRlO1xuXG4gIC8qKlxuICAgKiBNYXBzIGZyb20gYSBudW1iZXIgb2Ygd2Vla2RheXMgKGZyb20gdGhpcy5zdGFydCkgdG8gYSBudW1iZXIgb2YgZGF5cyAod2hpY2hcbiAgICogaWdub3JlcyBpbmNsdWRlcyB3ZWVrZW5kcy5cbiAgICovXG4gIGNhY2hlOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuICBsYXN0Q2FjaGVFbnRyeTogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXJ0OiBEYXRlKSB7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMuY2FjaGUgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5jYWNoZS5zZXQoMCwgMCk7XG4gICAgdGhpcy5sYXN0Q2FjaGVFbnRyeSA9IDA7XG4gIH1cblxuICB3ZWVrZGF5c1RvRGF5cyhudW1XZWVrZGF5czogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBpZiAobnVtV2Vla2RheXMgPCAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgbnVtV2Vla2RheXMgPSBNYXRoLnRydW5jKG51bVdlZWtkYXlzKTtcbiAgICBjb25zdCBjYWNoZVZhbHVlID0gdGhpcy5jYWNoZS5nZXQobnVtV2Vla2RheXMpO1xuICAgIGlmIChjYWNoZVZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBjYWNoZVZhbHVlO1xuICAgIH1cblxuICAgIGxldCBzdGFydCA9IG5ldyBEYXRlKHRoaXMuc3RhcnQuZ2V0VGltZSgpKTtcbiAgICBsZXQgd2Vla2RheSA9IHRoaXMubGFzdENhY2hlRW50cnk7XG4gICAgbGV0IGRheSA9IHRoaXMuY2FjaGUuZ2V0KHdlZWtkYXkpITtcbiAgICBzdGFydC5zZXREYXRlKHN0YXJ0LmdldERhdGUoKSArIGRheSk7XG5cbiAgICB3aGlsZSAod2Vla2RheSAhPT0gbnVtV2Vla2RheXMpIHtcbiAgICAgIGNvbnN0IG9sZERhdGUgPSBzdGFydC5nZXREYXRlKCk7XG4gICAgICBzdGFydC5zZXREYXRlKG9sZERhdGUgKyAxKTtcbiAgICAgIGRheSArPSAxO1xuXG4gICAgICBjb25zdCBkYXlPZldlZWsgPSBzdGFydC5nZXREYXkoKTtcbiAgICAgIGlmIChkYXlPZldlZWsgPT09IDAgfHwgZGF5T2ZXZWVrID09PSA2KSB7XG4gICAgICAgIC8vIFN1biBvciBTYXQuXG4gICAgICAgIC8vIFRPRE8gLSBIZXJlIGlzIHdoZXJlIGhvbGlkYXkgY2hlY2tzIHdvdWxkIGdvLlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHdlZWtkYXkgKz0gMTtcbiAgICAgIHRoaXMuY2FjaGUuc2V0KHdlZWtkYXksIGRheSk7XG4gICAgfVxuICAgIHRoaXMubGFzdENhY2hlRW50cnkgPSB3ZWVrZGF5O1xuICAgIHJldHVybiBkYXk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBNZXRyaWNEZWZpbml0aW9uIH0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljc1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBlcnJvciwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBwYXJzZUR1cmF0aW9uIH0gZnJvbSBcIi4vcGFyc2VcIjtcbmltcG9ydCB7IFdlZWtkYXlzIH0gZnJvbSBcIi4vd2Vla2RheXNcIjtcblxuLy8gVW5pdCBkZXNjcmliZXMgaG93IHRoZSBkdXJhdGlvbiB2YWx1ZXMgYXJlIHRvIGJlIGludGVycHJldGVkLlxuYWJzdHJhY3QgY2xhc3MgVW5pdCB7XG4gIC8vIENvbnZlcnQgYSBkdXJhdGlvbiBpbnRvIGEgZGlzcGxheWFibGUgc3RyaW5nLlxuICBhYnN0cmFjdCBkaXNwbGF5VGltZSh0OiBudW1iZXIpOiBzdHJpbmc7XG5cbiAgLy8gUGFyc2UgYSBkdXJhdGlvbiwgZWl0aGVyIGFzIGEgcmF3IG51bWJlciwgb3IgaW4gYSBzaG9ydGhhbmQgZHVyYXRpb24sIHN1Y2hcbiAgLy8gYXMgMWQsIDJkLCA1eS5cbiAgYWJzdHJhY3QgcGFyc2Uoczogc3RyaW5nKTogUmVzdWx0PG51bWJlcj47XG5cbiAgLy8gVE9ETyAtIE5lZWRzIGEgbWV0aG9kIHRvIGdvIGZyb20gRGF0ZSgpIHRvIGR1cmF0aW9uLlxufVxuXG4vLyBUaGUgZm9ybSBhIFVuaXQgdGFrZXMgd2hlbiBzZXJpYWxpemVkIHRvIEpTT04uXG4vL1xuLy8gTm90ZSB3ZSBkb24ndCBzZXJpYWxpemUgdGhlIE1ldHJpY0RlZmluaXRpb24gc2luY2UgdGhhdCBjb21lcyBmcm9tIHRoZVxuLy8gXCJEdXJhdGlvblwiIHN0YXRpYyBtZXRyaWMuXG5leHBvcnQgaW50ZXJmYWNlIFVuaXRTZXJpYWxpemVkIHtcbiAgdW5pdFR5cGU6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIFVuaXRCYXNlIGltcGxlbWVudHMgVW5pdCB7XG4gIHByb3RlY3RlZCBzdGFydDogRGF0ZTtcbiAgcHJvdGVjdGVkIG1ldHJpY0RlZm46IE1ldHJpY0RlZmluaXRpb247XG4gIHByb3RlY3RlZCB1bml0VHlwZTogVW5pdFR5cGVzO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXJ0OiBEYXRlLCBtZXRyaWNEZWZuOiBNZXRyaWNEZWZpbml0aW9uLCB1bml0VHlwZTogVW5pdFR5cGVzKSB7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMubWV0cmljRGVmbiA9IG1ldHJpY0RlZm47XG4gICAgdGhpcy51bml0VHlwZSA9IHVuaXRUeXBlO1xuICB9XG5cbiAgZGlzcGxheVRpbWUodDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2QgaW1wbGVtZW50ZWQgaW4gc3ViY2xhc3Nlcy5cIik7XG4gIH1cblxuICBwYXJzZShzOiBzdHJpbmcpOiBSZXN1bHQ8bnVtYmVyPiB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIGltcGxlbWVudGVkIGluIHN1YmNsYXNzZXMuXCIpO1xuICB9XG5cbiAgdG9KU09OKCk6IFVuaXRTZXJpYWxpemVkIHtcbiAgICByZXR1cm4geyB1bml0VHlwZTogdGhpcy51bml0VHlwZSB9O1xuICB9XG5cbiAgc3RhdGljIGZyb21KU09OKFxuICAgIHM6IFVuaXRTZXJpYWxpemVkLFxuICAgIHN0YXJ0OiBEYXRlLFxuICAgIG1ldHJpY0RlZm46IE1ldHJpY0RlZmluaXRpb25cbiAgKTogVW5pdEJhc2Uge1xuICAgIHJldHVybiBVbml0QnVpbGRlcnNbdG9Vbml0KHMudW5pdFR5cGUpXShzdGFydCwgbWV0cmljRGVmbik7XG4gIH1cbn1cblxuY29uc3QgVU5JVF9UWVBFUyA9IFtcIlVuaXRsZXNzXCIsIFwiRGF5c1wiLCBcIldlZWtkYXlzXCJdIGFzIGNvbnN0O1xuXG4vLyBBbGwgdHlwZXMgb2YgZHVyYXRpb24gdW5pdHMgYXZhaWxhYmxlLlxuZXhwb3J0IHR5cGUgVW5pdFR5cGVzID0gKHR5cGVvZiBVTklUX1RZUEVTKVtudW1iZXJdO1xuXG4vLyBEZXNjcmliZXMgZWFjaCB0eXBlIG9mIFVuaXQgYXZhaWxhYmxlLlxuZXhwb3J0IGNvbnN0IFVuaXREZXNjcmlwdGlvbnM6IFJlY29yZDxVbml0VHlwZXMsIHN0cmluZz4gPSB7XG4gIFVuaXRsZXNzOiBcIlVuaXRsZXNzIGR1cmF0aW9ucy5cIixcbiAgRGF5czogXCJEYXlzLCB3aXRoIDcgZGF5cyBhIHdlZWsuXCIsXG4gIFdlZWtkYXlzOiBcIkRheXMsIHdpdGggNSBkYXlzIGEgd2Vlay5cIixcbn07XG5cbi8vIEJ1aWxkZXJzIGZvciBlYWNoIHR5cGUgb2YgVW5pdC5cbmV4cG9ydCBjb25zdCBVbml0QnVpbGRlcnM6IFJlY29yZDxcbiAgVW5pdFR5cGVzLFxuICAoc3RhcnQ6IERhdGUsIG1ldHJpY0RlZm46IE1ldHJpY0RlZmluaXRpb24pID0+IFVuaXRCYXNlXG4+ID0ge1xuICBVbml0bGVzczogKHN0YXJ0OiBEYXRlLCBtZXRyaWNEZWZuOiBNZXRyaWNEZWZpbml0aW9uKSA9PlxuICAgIG5ldyBVbml0bGVzcyhzdGFydCwgbWV0cmljRGVmbiksXG4gIERheXM6IChzdGFydDogRGF0ZSwgbWV0cmljRGVmbjogTWV0cmljRGVmaW5pdGlvbikgPT5cbiAgICBuZXcgRGF5cyhzdGFydCwgbWV0cmljRGVmbiksXG4gIFdlZWtkYXlzOiAoc3RhcnQ6IERhdGUsIG1ldHJpY0RlZm46IE1ldHJpY0RlZmluaXRpb24pID0+XG4gICAgbmV3IFdlZWtEYXlzKHN0YXJ0LCBtZXRyaWNEZWZuKSxcbn07XG5cbi8vIFBhcnNlIHN0cmluZyBpbnRvIGEgdmFsaWQgVW5pdFR5cGVzLlxuZXhwb3J0IGNvbnN0IHRvVW5pdCA9IChzOiBzdHJpbmcpOiBVbml0VHlwZXMgPT4ge1xuICBpZiAoVU5JVF9UWVBFUy5zb21lKCh0OiBVbml0VHlwZXMpID0+IHQgPT09IHMpKSB7XG4gICAgcmV0dXJuIHMgYXMgVW5pdFR5cGVzO1xuICB9XG4gIHJldHVybiBcIlVuaXRsZXNzXCI7XG59O1xuXG4vLyBVbml0bGVzcy5cbmV4cG9ydCBjbGFzcyBVbml0bGVzcyBleHRlbmRzIFVuaXRCYXNlIGltcGxlbWVudHMgVW5pdCB7XG4gIGNvbnN0cnVjdG9yKHN0YXJ0OiBEYXRlLCBtZXRyaWNEZWZuOiBNZXRyaWNEZWZpbml0aW9uKSB7XG4gICAgc3VwZXIoc3RhcnQsIG1ldHJpY0RlZm4sIFwiVW5pdGxlc3NcIik7XG4gIH1cblxuICBkaXNwbGF5VGltZSh0OiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm1ldHJpY0RlZm4uY2xhbXBBbmRSb3VuZCh0KS50b1N0cmluZygpO1xuICB9XG5cbiAgcGFyc2Uoczogc3RyaW5nKTogUmVzdWx0PG51bWJlcj4ge1xuICAgIGNvbnN0IHBhcnNlZCA9ICtzO1xuICAgIGlmIChOdW1iZXIuaXNOYU4ocGFyc2VkKSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihgSW52YWxpZCBudW1iZXIgdmFsdWU6ICR7c31gKSk7XG4gICAgfVxuICAgIHJldHVybiBvayh0aGlzLm1ldHJpY0RlZm4uY2xhbXBBbmRSb3VuZChwYXJzZWQpKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGF5cyBleHRlbmRzIFVuaXRCYXNlIGltcGxlbWVudHMgVW5pdCB7XG4gIGNvbnN0cnVjdG9yKHN0YXJ0OiBEYXRlLCBtZXRyaWNEZWZuOiBNZXRyaWNEZWZpbml0aW9uKSB7XG4gICAgc3VwZXIoc3RhcnQsIG1ldHJpY0RlZm4sIFwiRGF5c1wiKTtcbiAgfVxuXG4gIGRpc3BsYXlUaW1lKHQ6IG51bWJlciwgbG9jYWxlPzogSW50bC5Mb2NhbGVzQXJndW1lbnQpOiBzdHJpbmcge1xuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0aGlzLnN0YXJ0LmdldFRpbWUoKSk7XG4gICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpICsgdCk7XG4gICAgcmV0dXJuIGQudG9Mb2NhbGVEYXRlU3RyaW5nKGxvY2FsZSk7XG4gIH1cblxuICBwYXJzZShzOiBzdHJpbmcpOiBSZXN1bHQ8bnVtYmVyPiB7XG4gICAgY29uc3QgZCA9IHBhcnNlRHVyYXRpb24ocywgNyk7XG4gICAgaWYgKCFkLm9rKSB7XG4gICAgICByZXR1cm4gZDtcbiAgICB9XG4gICAgcmV0dXJuIG9rKHRoaXMubWV0cmljRGVmbi5jbGFtcEFuZFJvdW5kKGQudmFsdWUpKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgV2Vla0RheXMgZXh0ZW5kcyBVbml0QmFzZSBpbXBsZW1lbnRzIFVuaXQge1xuICB3ZWVrZGF5czogV2Vla2RheXM7XG5cbiAgY29uc3RydWN0b3Ioc3RhcnQ6IERhdGUsIG1ldHJpY0RlZm46IE1ldHJpY0RlZmluaXRpb24pIHtcbiAgICBzdXBlcihzdGFydCwgbWV0cmljRGVmbiwgXCJXZWVrZGF5c1wiKTtcbiAgICB0aGlzLndlZWtkYXlzID0gbmV3IFdlZWtkYXlzKHN0YXJ0KTtcbiAgfVxuXG4gIC8vIExvY2FsZSBvbmx5IHVzZWQgZm9yIHRlc3RpbmcuXG4gIGRpc3BsYXlUaW1lKHQ6IG51bWJlciwgbG9jYWxlPzogSW50bC5Mb2NhbGVzQXJndW1lbnQpOiBzdHJpbmcge1xuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0aGlzLnN0YXJ0LmdldFRpbWUoKSk7XG4gICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpICsgdGhpcy53ZWVrZGF5cy53ZWVrZGF5c1RvRGF5cyh0KSk7XG4gICAgcmV0dXJuIGQudG9Mb2NhbGVEYXRlU3RyaW5nKGxvY2FsZSk7XG4gIH1cblxuICBwYXJzZShzOiBzdHJpbmcpOiBSZXN1bHQ8bnVtYmVyPiB7XG4gICAgY29uc3QgZCA9IHBhcnNlRHVyYXRpb24ocywgNSk7XG4gICAgaWYgKCFkLm9rKSB7XG4gICAgICByZXR1cm4gZDtcbiAgICB9XG4gICAgcmV0dXJuIG9rKHRoaXMubWV0cmljRGVmbi5jbGFtcEFuZFJvdW5kKGQudmFsdWUpKTtcbiAgfVxufVxuIiwgImltcG9ydCB7XG4gIENoYXJ0LFxuICBDaGFydFNlcmlhbGl6ZWQsXG4gIENoYXJ0VmFsaWRhdGUsXG4gIFRhc2ssXG4gIFRhc2tTZXJpYWxpemVkLFxufSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQge1xuICBNZXRyaWNEZWZpbml0aW9uLFxuICBNZXRyaWNEZWZpbml0aW9ucyxcbiAgTWV0cmljRGVmaW5pdGlvbnNTZXJpYWxpemVkLFxufSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBNZXRyaWNSYW5nZSB9IGZyb20gXCIuLi9tZXRyaWNzL3JhbmdlLnRzXCI7XG5pbXBvcnQgeyBSYXRpb25hbGl6ZUVkZ2VzT3AgfSBmcm9tIFwiLi4vb3BzL2NoYXJ0LnRzXCI7XG5pbXBvcnQge1xuICBSZXNvdXJjZURlZmluaXRpb24sXG4gIFJlc291cmNlRGVmaW5pdGlvbnMsXG4gIFJlc291cmNlRGVmaW5pdGlvbnNTZXJpYWxpemVkLFxufSBmcm9tIFwiLi4vcmVzb3VyY2VzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBvayB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFVuY2VydGFpbnR5VG9OdW0gfSBmcm9tIFwiLi4vc3RhdHMvY2RmL3RyaWFuZ3VsYXIvamFjb2JpYW4udHNcIjtcbmltcG9ydCB7XG4gIERheXMsXG4gIFVuaXRCYXNlLFxuICBVbml0U2VyaWFsaXplZCxcbiAgVW5pdFR5cGVzLFxuICBVbml0bGVzcyxcbn0gZnJvbSBcIi4uL3VuaXRzL3VuaXQudHNcIjtcblxuZXhwb3J0IHR5cGUgU3RhdGljTWV0cmljS2V5cyA9IFwiRHVyYXRpb25cIiB8IFwiUGVyY2VudCBDb21wbGV0ZVwiO1xuXG5leHBvcnQgY29uc3QgU3RhdGljTWV0cmljRGVmaW5pdGlvbnM6IFJlY29yZDxcbiAgU3RhdGljTWV0cmljS2V5cyxcbiAgTWV0cmljRGVmaW5pdGlvblxuPiA9IHtcbiAgLy8gSG93IGxvbmcgYSB0YXNrIHdpbGwgdGFrZSwgaW4gZGF5cy5cbiAgRHVyYXRpb246IG5ldyBNZXRyaWNEZWZpbml0aW9uKDAsIG5ldyBNZXRyaWNSYW5nZSgwKSwgdHJ1ZSksXG4gIC8vIFRoZSBwZXJjZW50IGNvbXBsZXRlIGZvciBhIHRhc2suXG4gIFwiUGVyY2VudCBDb21wbGV0ZVwiOiBuZXcgTWV0cmljRGVmaW5pdGlvbigwLCBuZXcgTWV0cmljUmFuZ2UoMCwgMTAwKSwgdHJ1ZSksXG59O1xuXG5leHBvcnQgdHlwZSBTdGF0aWNSZXNvdXJjZUtleXMgPSBcIlVuY2VydGFpbnR5XCI7XG5cbmV4cG9ydCBjb25zdCBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zOiBSZWNvcmQ8XG4gIFN0YXRpY1Jlc291cmNlS2V5cyxcbiAgUmVzb3VyY2VEZWZpbml0aW9uXG4+ID0ge1xuICBVbmNlcnRhaW50eTogbmV3IFJlc291cmNlRGVmaW5pdGlvbihPYmplY3Qua2V5cyhVbmNlcnRhaW50eVRvTnVtKSwgdHJ1ZSksXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIFBsYW5TZXJpYWxpemVkIHtcbiAgLy8gQSB2YWx1ZSBvZiAwIG1lYW5zIHVuc3RhcmVkLlxuICBzdGFydERhdGU6IG51bWJlcjtcbiAgZHVyYXRpb25Vbml0czogVW5pdFNlcmlhbGl6ZWQ7XG4gIGNoYXJ0OiBDaGFydFNlcmlhbGl6ZWQ7XG4gIHJlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnNTZXJpYWxpemVkO1xuICBtZXRyaWNEZWZpbml0aW9uczogTWV0cmljRGVmaW5pdGlvbnNTZXJpYWxpemVkO1xufVxuXG5leHBvcnQgY2xhc3MgUGxhbiB7XG4gIGNoYXJ0OiBDaGFydDtcblxuICAvLyBDb250cm9scyBob3cgdGltZSBpcyBkaXNwbGF5ZWQuXG4gIGR1cmF0aW9uVW5pdHM6IFVuaXRCYXNlO1xuXG4gIHN0YXJ0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBzdGFydERhdGU6IERhdGUgPSBuZXcgRGF0ZSgpO1xuXG4gIHJlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnM7XG5cbiAgbWV0cmljRGVmaW5pdGlvbnM6IE1ldHJpY0RlZmluaXRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2hhcnQgPSBuZXcgQ2hhcnQoKTtcblxuICAgIHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnMpO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBTdGF0aWNNZXRyaWNEZWZpbml0aW9ucyk7XG5cbiAgICB0aGlzLmR1cmF0aW9uVW5pdHMgPSBuZXcgRGF5cyhcbiAgICAgIG5ldyBEYXRlKCksXG4gICAgICB0aGlzLmdldFN0YXRpY01ldHJpY0RlZmluaXRpb24oXCJEdXJhdGlvblwiKVxuICAgICk7XG5cbiAgICB0aGlzLmFwcGx5TWV0cmljc0FuZFJlc291cmNlc1RvVmVydGljZXMoKTtcbiAgfVxuXG4gIGdldFN0YXRpY01ldHJpY0RlZmluaXRpb24obmFtZTogU3RhdGljTWV0cmljS2V5cyk6IE1ldHJpY0RlZmluaXRpb24ge1xuICAgIHJldHVybiB0aGlzLm1ldHJpY0RlZmluaXRpb25zW25hbWVdO1xuICB9XG5cbiAgZ2V0U3RhdGljUmVzb3VyY2VEZWZpbml0aW9uKG5hbWU6IFN0YXRpY1Jlc291cmNlS2V5cyk6IFJlc291cmNlRGVmaW5pdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1tuYW1lXTtcbiAgfVxuXG4gIGFwcGx5TWV0cmljc0FuZFJlc291cmNlc1RvVmVydGljZXMoKSB7XG4gICAgT2JqZWN0LmtleXModGhpcy5tZXRyaWNEZWZpbml0aW9ucykuZm9yRWFjaCgobWV0cmljTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBtZCA9IHRoaXMubWV0cmljRGVmaW5pdGlvbnNbbWV0cmljTmFtZV0hO1xuICAgICAgdGhpcy5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICAgIHRhc2suc2V0TWV0cmljKG1ldHJpY05hbWUsIG1kLmRlZmF1bHQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgT2JqZWN0LmVudHJpZXModGhpcy5yZXNvdXJjZURlZmluaXRpb25zKS5mb3JFYWNoKFxuICAgICAgKFtrZXksIHJlc291cmNlRGVmaW5pdGlvbl0pID0+IHtcbiAgICAgICAgdGhpcy5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICAgICAgdGFzay5zZXRSZXNvdXJjZShrZXksIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbMF0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgdG9KU09OKCk6IFBsYW5TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhcnREYXRlOiB0aGlzLnN0YXJ0ZWQgPyB0aGlzLnN0YXJ0RGF0ZS5nZXRUaW1lKCkgOiAwLFxuICAgICAgZHVyYXRpb25Vbml0czogdGhpcy5kdXJhdGlvblVuaXRzLnRvSlNPTigpLFxuICAgICAgY2hhcnQ6IHRoaXMuY2hhcnQudG9KU09OKCksXG4gICAgICByZXNvdXJjZURlZmluaXRpb25zOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZmlsdGVyKFxuICAgICAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiAhcmVzb3VyY2VEZWZpbml0aW9uLmlzU3RhdGljXG4gICAgICAgIClcbiAgICAgICksXG4gICAgICBtZXRyaWNEZWZpbml0aW9uczogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyh0aGlzLm1ldHJpY0RlZmluaXRpb25zKVxuICAgICAgICAgIC5maWx0ZXIoKFtrZXksIG1ldHJpY0RlZmluaXRpb25dKSA9PiAhbWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYylcbiAgICAgICAgICAubWFwKChba2V5LCBtZXRyaWNEZWZpbml0aW9uXSkgPT4gW2tleSwgbWV0cmljRGVmaW5pdGlvbi50b0pTT04oKV0pXG4gICAgICApLFxuICAgIH07XG4gIH1cblxuICBnZXRNZXRyaWNEZWZpbml0aW9uKGtleTogc3RyaW5nKTogTWV0cmljRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMubWV0cmljRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIHNldE1ldHJpY0RlZmluaXRpb24oa2V5OiBzdHJpbmcsIG1ldHJpY0RlZmluaXRpb246IE1ldHJpY0RlZmluaXRpb24pIHtcbiAgICB0aGlzLm1ldHJpY0RlZmluaXRpb25zW2tleV0gPSBtZXRyaWNEZWZpbml0aW9uO1xuICB9XG5cbiAgZGVsZXRlTWV0cmljRGVmaW5pdGlvbihrZXk6IHN0cmluZykge1xuICAgIGRlbGV0ZSB0aGlzLm1ldHJpY0RlZmluaXRpb25zW2tleV07XG4gIH1cblxuICBnZXRSZXNvdXJjZURlZmluaXRpb24oa2V5OiBzdHJpbmcpOiBSZXNvdXJjZURlZmluaXRpb24gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNba2V5XTtcbiAgfVxuXG4gIHNldFJlc291cmNlRGVmaW5pdGlvbihrZXk6IHN0cmluZywgdmFsdWU6IFJlc291cmNlRGVmaW5pdGlvbikge1xuICAgIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1trZXldID0gdmFsdWU7XG4gIH1cblxuICBkZWxldGVSZXNvdXJjZURlZmluaXRpb24oa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5yZXNvdXJjZURlZmluaXRpb25zW2tleV07XG4gIH1cblxuICAvLyBSZXR1cm5zIGEgbmV3IFRhc2sgd2l0aCBkZWZhdWx0cyBmb3IgYWxsIG1ldHJpY3MgYW5kIHJlc291cmNlcy5cbiAgbmV3VGFzaygpOiBUYXNrIHtcbiAgICBjb25zdCByZXQgPSBuZXcgVGFzaygpO1xuICAgIE9iamVjdC5rZXlzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpLmZvckVhY2goKG1ldHJpY05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgbWQgPSB0aGlzLmdldE1ldHJpY0RlZmluaXRpb24obWV0cmljTmFtZSkhO1xuICAgICAgcmV0LnNldE1ldHJpYyhtZXRyaWNOYW1lLCBtZC5kZWZhdWx0KTtcbiAgICB9KTtcbiAgICBPYmplY3QuZW50cmllcyh0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMpLmZvckVhY2goXG4gICAgICAoW2tleSwgcmVzb3VyY2VEZWZpbml0aW9uXSkgPT4ge1xuICAgICAgICByZXQuc2V0UmVzb3VyY2Uoa2V5LCByZXNvdXJjZURlZmluaXRpb24udmFsdWVzWzBdKTtcbiAgICAgIH1cbiAgICApO1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIEZyb21KU09OID0gKHRleHQ6IHN0cmluZyk6IFJlc3VsdDxQbGFuPiA9PiB7XG4gICAgY29uc3QgcGxhblNlcmlhbGl6ZWQ6IFBsYW5TZXJpYWxpemVkID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICBjb25zdCBwbGFuID0gbmV3IFBsYW4oKTtcblxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMgPSBwbGFuU2VyaWFsaXplZC5jaGFydC52ZXJ0aWNlcy5tYXAoXG4gICAgICAodGFza1NlcmlhbGl6ZWQ6IFRhc2tTZXJpYWxpemVkKTogVGFzayA9PiB7XG4gICAgICAgIGNvbnN0IHRhc2sgPSBuZXcgVGFzayh0YXNrU2VyaWFsaXplZC5uYW1lKTtcbiAgICAgICAgdGFzay5tZXRyaWNzID0gdGFza1NlcmlhbGl6ZWQubWV0cmljcztcbiAgICAgICAgdGFzay5yZXNvdXJjZXMgPSB0YXNrU2VyaWFsaXplZC5yZXNvdXJjZXM7XG4gICAgICAgIHRhc2suaWQgPSB0YXNrU2VyaWFsaXplZC5pZDtcblxuICAgICAgICByZXR1cm4gdGFzaztcbiAgICAgIH1cbiAgICApO1xuICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuU2VyaWFsaXplZC5jaGFydC5lZGdlcy5tYXAoXG4gICAgICAoZGlyZWN0ZWRFZGdlU2VyaWFsaXplZDogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZCk6IERpcmVjdGVkRWRnZSA9PlxuICAgICAgICBuZXcgRGlyZWN0ZWRFZGdlKGRpcmVjdGVkRWRnZVNlcmlhbGl6ZWQuaSwgZGlyZWN0ZWRFZGdlU2VyaWFsaXplZC5qKVxuICAgICk7XG5cbiAgICBjb25zdCBkZXNlcmlhbGl6ZWRNZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgIE9iamVjdC5lbnRyaWVzKHBsYW5TZXJpYWxpemVkLm1ldHJpY0RlZmluaXRpb25zKS5tYXAoXG4gICAgICAgIChba2V5LCBzZXJpYWxpemVkTWV0cmljRGVmaW5pdGlvbl0pID0+IFtcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgTWV0cmljRGVmaW5pdGlvbi5Gcm9tSlNPTihzZXJpYWxpemVkTWV0cmljRGVmaW5pdGlvbiksXG4gICAgICAgIF1cbiAgICAgIClcbiAgICApO1xuXG4gICAgcGxhbi5tZXRyaWNEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICB7fSxcbiAgICAgIFN0YXRpY01ldHJpY0RlZmluaXRpb25zLFxuICAgICAgZGVzZXJpYWxpemVkTWV0cmljRGVmaW5pdGlvbnNcbiAgICApO1xuXG4gICAgY29uc3QgZGVzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9ucyA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgIE9iamVjdC5lbnRyaWVzKHBsYW5TZXJpYWxpemVkLnJlc291cmNlRGVmaW5pdGlvbnMpLm1hcChcbiAgICAgICAgKFtrZXksIHNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25dKSA9PiBbXG4gICAgICAgICAga2V5LFxuICAgICAgICAgIFJlc291cmNlRGVmaW5pdGlvbi5Gcm9tSlNPTihzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9uKSxcbiAgICAgICAgXVxuICAgICAgKVxuICAgICk7XG5cbiAgICBwbGFuLnJlc291cmNlRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgICAge30sXG4gICAgICBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zLFxuICAgICAgZGVzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9uc1xuICAgICk7XG5cbiAgICBpZiAocGxhblNlcmlhbGl6ZWQuc3RhcnREYXRlID09PSAwKSB7XG4gICAgICBwbGFuLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgIHBsYW4uc3RhcnREYXRlID0gbmV3IERhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGxhbi5zdGFydGVkID0gdHJ1ZTtcbiAgICAgIHBsYW4uc3RhcnREYXRlID0gbmV3IERhdGUocGxhblNlcmlhbGl6ZWQuc3RhcnREYXRlKTtcbiAgICB9XG4gICAgcGxhbi5kdXJhdGlvblVuaXRzID0gVW5pdEJhc2UuZnJvbUpTT04oXG4gICAgICBwbGFuU2VyaWFsaXplZC5kdXJhdGlvblVuaXRzLFxuICAgICAgcGxhbi5zdGFydERhdGUsXG4gICAgICBwbGFuLmdldFN0YXRpY01ldHJpY0RlZmluaXRpb24oXCJEdXJhdGlvblwiKVxuICAgICk7XG5cbiAgICBjb25zdCByZXQgPSBSYXRpb25hbGl6ZUVkZ2VzT3AoKS5hcHBseVRvKHBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGNvbnN0IHJldFZhbCA9IENoYXJ0VmFsaWRhdGUocGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXRWYWwub2spIHtcbiAgICAgIHJldHVybiByZXRWYWw7XG4gICAgfVxuICAgIHJldHVybiBvayhwbGFuKTtcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyBUZW1wbGF0ZVJlc3VsdCwgaHRtbCwgcmVuZGVyIH0gZnJvbSBcImxpdC1odG1sXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhblwiO1xuaW1wb3J0IHsgbGl2ZSB9IGZyb20gXCJsaXQtaHRtbC9kaXJlY3RpdmVzL2xpdmUuanNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBUYXNrTmFtZUNoYW5nZURldGFpbHMge1xuICBuYW1lOiBzdHJpbmc7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tSZXNvdXJjZVZhbHVlQ2hhbmdlRGV0YWlscyB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgdGFza0luZGV4OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza01ldHJpY1ZhbHVlQ2hhbmdlRGV0YWlscyB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmFsdWU6IG51bWJlcjtcbiAgdGFza0luZGV4OiBudW1iZXI7XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJ0YXNrLW5hbWUtY2hhbmdlXCI6IEN1c3RvbUV2ZW50PFRhc2tOYW1lQ2hhbmdlRGV0YWlscz47XG4gICAgXCJ0YXNrLXJlc291cmNlLXZhbHVlLWNoYW5nZVwiOiBDdXN0b21FdmVudDxUYXNrUmVzb3VyY2VWYWx1ZUNoYW5nZURldGFpbHM+O1xuICAgIFwidGFzay1tZXRyaWMtdmFsdWUtY2hhbmdlXCI6IEN1c3RvbUV2ZW50PFRhc2tNZXRyaWNWYWx1ZUNoYW5nZURldGFpbHM+O1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZWxlY3RlZFRhc2tQYW5lbCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgcGxhbjogUGxhbiA9IG5ldyBQbGFuKCk7XG4gIHRhc2tJbmRleDogbnVtYmVyID0gLTE7XG4gIHBsYW5EZWZpbml0aW9uQ2hhbmdlZENhbGxiYWNrOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5wbGFuRGVmaW5pdGlvbkNoYW5nZWRDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfTtcbiAgfVxuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwicGxhbi1kZWZpbml0aW9uLWNoYW5nZWRcIixcbiAgICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2tcbiAgICApO1xuICB9XG5cbiAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwicGxhbi1kZWZpbml0aW9uLWNoYW5nZWRcIixcbiAgICAgIHRoaXMucGxhbkRlZmluaXRpb25DaGFuZ2VkQ2FsbGJhY2tcbiAgICApO1xuICB9XG5cbiAgdXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWwocGxhbjogUGxhbiwgdGFza0luZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnBsYW4gPSBwbGFuO1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgLypcbiAgICBUT0RPIC0gRG8gdGhlIGZvbGxvd2luZyB3aGVuIHNlbGVjdGluZyBhIG5ldyB0YXNrLlxuICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dCA9XG4gICAgICAgICAgc2VsZWN0ZWRUYXNrUGFuZWwucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihcIiN0YXNrLW5hbWVcIikhO1xuICAgICAgICBpbnB1dC5mb2N1cygpO1xuICAgICAgICBpbnB1dC5zZWxlY3QoKTtcbiAgICAgIH0sIDApO1xuICAgICAgKi9cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZW5kZXIodGhpcy50ZW1wbGF0ZSgpLCB0aGlzKTtcbiAgfVxuXG4gIHRlbXBsYXRlKCk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBjb25zdCB0YXNrSW5kZXggPSB0aGlzLnRhc2tJbmRleDtcbiAgICBpZiAodGFza0luZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIGh0bWxgTm8gdGFzayBzZWxlY3RlZC5gO1xuICAgIH1cbiAgICBjb25zdCB0YXNrID0gdGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF07XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0cj5cbiAgICAgICAgICA8dGQ+TmFtZTwvdGQ+XG4gICAgICAgICAgPHRkPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgaWQ9XCJ0YXNrLW5hbWVcIlxuICAgICAgICAgICAgICAudmFsdWU9XCIke2xpdmUodGFzay5uYW1lKX1cIlxuICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudDxUYXNrTmFtZUNoYW5nZURldGFpbHM+KFwidGFzay1uYW1lLWNoYW5nZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgICAgJHtPYmplY3QuZW50cmllcyh0aGlzLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucykubWFwKFxuICAgICAgICAgIChbcmVzb3VyY2VLZXksIGRlZm5dKSA9PlxuICAgICAgICAgICAgaHRtbGAgPHRyPlxuICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cIiR7cmVzb3VyY2VLZXl9XCI+JHtyZXNvdXJjZUtleX08L2xhYmVsPlxuICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgICAgaWQ9XCIke3Jlc291cmNlS2V5fVwiXG4gICAgICAgICAgICAgICAgICBAY2hhbmdlPSR7YXN5bmMgKGU6IEV2ZW50KSA9PlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwidGFzay1yZXNvdXJjZS12YWx1ZS1jaGFuZ2VcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICB0YXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcmVzb3VyY2VLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgJHtkZWZuLnZhbHVlcy5tYXAoXG4gICAgICAgICAgICAgICAgICAgIChyZXNvdXJjZVZhbHVlOiBzdHJpbmcpID0+XG4gICAgICAgICAgICAgICAgICAgICAgaHRtbGA8b3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lPSR7cmVzb3VyY2VWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3RlZD0ke3Rhc2sucmVzb3VyY2VzW3Jlc291cmNlS2V5XSA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlVmFsdWV9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgJHtyZXNvdXJjZVZhbHVlfVxuICAgICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPmBcbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgKX1cbiAgICAgICAgJHtPYmplY3Qua2V5cyh0aGlzLnBsYW4ubWV0cmljRGVmaW5pdGlvbnMpLm1hcChcbiAgICAgICAgICAoa2V5OiBzdHJpbmcpID0+XG4gICAgICAgICAgICBodG1sYCA8dHI+XG4gICAgICAgICAgICAgIDx0ZD48bGFiZWwgZm9yPVwiJHtrZXl9XCI+JHtrZXl9PC9sYWJlbD48L3RkPlxuICAgICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICBpZD1cIiR7a2V5fVwiXG4gICAgICAgICAgICAgICAgICAudmFsdWU9JHtsaXZlKHRhc2subWV0cmljc1trZXldKX1cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgQGNoYW5nZT0ke2FzeW5jIChlOiBFdmVudCkgPT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChcInRhc2stbWV0cmljLXZhbHVlLWNoYW5nZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhc2tJbmRleDogdGFza0luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogKyhlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8L3RyPmBcbiAgICAgICAgKX1cbiAgICAgIDwvdGFibGU+XG4gICAgYDtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJzZWxlY3RlZC10YXNrLXBhbmVsXCIsIFNlbGVjdGVkVGFza1BhbmVsKTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFRhc2ssIENoYXJ0LCBDaGFydFZhbGlkYXRlIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBSb3VuZGVyLCBUYXNrRHVyYXRpb24gfSBmcm9tIFwiLi4vdHlwZXMvdHlwZXMudHNcIjtcblxuLyoqIFNwYW4gcmVwcmVzZW50cyB3aGVuIGEgdGFzayB3aWxsIGJlIGRvbmUsIGkuZS4gaXQgY29udGFpbnMgdGhlIHRpbWUgdGhlIHRhc2tcbiAqIGlzIGV4cGVjdGVkIHRvIGJlZ2luIGFuZCBlbmQuICovXG5leHBvcnQgY2xhc3MgU3BhbiB7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGZpbmlzaDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXJ0OiBudW1iZXIgPSAwLCBmaW5pc2g6IG51bWJlciA9IDApIHtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgdGhpcy5maW5pc2ggPSBmaW5pc2g7XG4gIH1cbn1cblxuLyoqIFRoZSBzdGFuZGFyZCBzbGFjayBjYWxjdWxhdGlvbiB2YWx1ZXMuICovXG5leHBvcnQgY2xhc3MgU2xhY2sge1xuICBlYXJseTogU3BhbiA9IG5ldyBTcGFuKCk7XG4gIGxhdGU6IFNwYW4gPSBuZXcgU3BhbigpO1xuICBzbGFjazogbnVtYmVyID0gMDtcbn1cblxuZXhwb3J0IHR5cGUgU2xhY2tSZXN1bHQgPSBSZXN1bHQ8U2xhY2tbXT47XG5cbi8vIENhbGN1bGF0ZSB0aGUgc2xhY2sgZm9yIGVhY2ggVGFzayBpbiB0aGUgQ2hhcnQuXG5leHBvcnQgZnVuY3Rpb24gQ29tcHV0ZVNsYWNrKFxuICBjOiBDaGFydCxcbiAgdGFza0R1cmF0aW9uOiBUYXNrRHVyYXRpb24gfCBudWxsID0gbnVsbCxcbiAgcm91bmQ6IFJvdW5kZXJcbik6IFNsYWNrUmVzdWx0IHtcbiAgaWYgKHRhc2tEdXJhdGlvbiA9PT0gbnVsbCkge1xuICAgIHRhc2tEdXJhdGlvbiA9ICh0YXNrSW5kZXg6IG51bWJlcikgPT4gYy5WZXJ0aWNlc1t0YXNrSW5kZXhdLmR1cmF0aW9uO1xuICB9XG5cbiAgLy8gQ3JlYXRlIGEgU2xhY2sgZm9yIGVhY2ggVGFzay5cbiAgY29uc3Qgc2xhY2tzOiBTbGFja1tdID0gbmV3IEFycmF5KGMuVmVydGljZXMubGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjLlZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgc2xhY2tzW2ldID0gbmV3IFNsYWNrKCk7XG4gIH1cblxuICBjb25zdCByID0gQ2hhcnRWYWxpZGF0ZShjLCB0YXNrRHVyYXRpb24pO1xuICBpZiAoIXIub2spIHtcbiAgICByZXR1cm4gZXJyb3Ioci5lcnJvcik7XG4gIH1cblxuICBjb25zdCBlZGdlcyA9IGVkZ2VzQnlTcmNBbmREc3RUb01hcChjLkVkZ2VzKTtcblxuICBjb25zdCB0b3BvbG9naWNhbE9yZGVyID0gci52YWx1ZTtcblxuICAvLyBGaXJzdCBnbyBmb3J3YXJkIHRocm91Z2ggdGhlIHRvcG9sb2dpY2FsIHNvcnQgYW5kIGZpbmQgdGhlIGVhcmx5IHN0YXJ0IGZvclxuICAvLyBlYWNoIHRhc2ssIHdoaWNoIGlzIHRoZSBtYXggb2YgYWxsIHRoZSBwcmVkZWNlc3NvcnMgZWFybHkgZmluaXNoIHZhbHVlcy5cbiAgLy8gU2luY2Ugd2Uga25vdyB0aGUgZHVyYXRpb24gd2UgY2FuIGFsc28gY29tcHV0ZSB0aGUgZWFybHkgZmluaXNoLlxuICB0b3BvbG9naWNhbE9yZGVyLnNsaWNlKDEpLmZvckVhY2goKHZlcnRleEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrID0gYy5WZXJ0aWNlc1t2ZXJ0ZXhJbmRleF07XG4gICAgY29uc3Qgc2xhY2sgPSBzbGFja3NbdmVydGV4SW5kZXhdO1xuICAgIHNsYWNrLmVhcmx5LnN0YXJ0ID0gTWF0aC5tYXgoXG4gICAgICAuLi5lZGdlcy5ieURzdC5nZXQodmVydGV4SW5kZXgpIS5tYXAoKGU6IERpcmVjdGVkRWRnZSk6IG51bWJlciA9PiB7XG4gICAgICAgIGNvbnN0IHByZWRlY2Vzc29yU2xhY2sgPSBzbGFja3NbZS5pXTtcbiAgICAgICAgcmV0dXJuIHByZWRlY2Vzc29yU2xhY2suZWFybHkuZmluaXNoO1xuICAgICAgfSlcbiAgICApO1xuICAgIHNsYWNrLmVhcmx5LmZpbmlzaCA9IHJvdW5kKHNsYWNrLmVhcmx5LnN0YXJ0ICsgdGFza0R1cmF0aW9uKHZlcnRleEluZGV4KSk7XG4gIH0pO1xuXG4gIC8vIE5vdyBiYWNrd2FyZHMgdGhyb3VnaCB0aGUgdG9wb2xvZ2ljYWwgc29ydCBhbmQgZmluZCB0aGUgbGF0ZSBmaW5pc2ggb2YgZWFjaFxuICAvLyB0YXNrLCB3aGljaCBpcyB0aGUgbWluIG9mIGFsbCB0aGUgc3VjY2Vzc29yIHRhc2tzIGxhdGUgc3RhcnRzLiBBZ2FpbiBzaW5jZVxuICAvLyB3ZSBrbm93IHRoZSBkdXJhdGlvbiB3ZSBjYW4gYWxzbyBjb21wdXRlIHRoZSBsYXRlIHN0YXJ0LiBGaW5hbGx5LCBzaW5jZSB3ZVxuICAvLyBub3cgaGF2ZSBhbGwgdGhlIGVhcmx5L2xhdGUgYW5kIHN0YXJ0L2ZpbmlzaCB2YWx1ZXMgd2UgY2FuIG5vdyBjYWxjdWF0ZSB0aGVcbiAgLy8gc2xhY2suXG4gIHRvcG9sb2dpY2FsT3JkZXIucmV2ZXJzZSgpLmZvckVhY2goKHZlcnRleEluZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB0YXNrID0gYy5WZXJ0aWNlc1t2ZXJ0ZXhJbmRleF07XG4gICAgY29uc3Qgc2xhY2sgPSBzbGFja3NbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHN1Y2Nlc3NvcnMgPSBlZGdlcy5ieVNyYy5nZXQodmVydGV4SW5kZXgpO1xuICAgIGlmICghc3VjY2Vzc29ycykge1xuICAgICAgc2xhY2subGF0ZS5maW5pc2ggPSBzbGFjay5lYXJseS5maW5pc2g7XG4gICAgICBzbGFjay5sYXRlLnN0YXJ0ID0gc2xhY2suZWFybHkuc3RhcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNsYWNrLmxhdGUuZmluaXNoID0gTWF0aC5taW4oXG4gICAgICAgIC4uLmVkZ2VzLmJ5U3JjLmdldCh2ZXJ0ZXhJbmRleCkhLm1hcCgoZTogRGlyZWN0ZWRFZGdlKTogbnVtYmVyID0+IHtcbiAgICAgICAgICBjb25zdCBzdWNjZXNzb3JTbGFjayA9IHNsYWNrc1tlLmpdO1xuICAgICAgICAgIHJldHVybiBzdWNjZXNzb3JTbGFjay5sYXRlLnN0YXJ0O1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHNsYWNrLmxhdGUuc3RhcnQgPSByb3VuZChzbGFjay5sYXRlLmZpbmlzaCAtIHRhc2tEdXJhdGlvbih2ZXJ0ZXhJbmRleCkpO1xuICAgICAgc2xhY2suc2xhY2sgPSByb3VuZChzbGFjay5sYXRlLmZpbmlzaCAtIHNsYWNrLmVhcmx5LmZpbmlzaCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gb2soc2xhY2tzKTtcbn1cblxuZXhwb3J0IGNvbnN0IENyaXRpY2FsUGF0aCA9IChzbGFja3M6IFNsYWNrW10sIHJvdW5kOiBSb3VuZGVyKTogbnVtYmVyW10gPT4ge1xuICBjb25zdCByZXQ6IG51bWJlcltdID0gW107XG4gIHNsYWNrcy5mb3JFYWNoKChzbGFjazogU2xhY2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICBpZiAoXG4gICAgICByb3VuZChzbGFjay5sYXRlLmZpbmlzaCAtIHNsYWNrLmVhcmx5LmZpbmlzaCkgPCBOdW1iZXIuRVBTSUxPTiAmJlxuICAgICAgcm91bmQoc2xhY2suZWFybHkuZmluaXNoIC0gc2xhY2suZWFybHkuc3RhcnQpID4gTnVtYmVyLkVQU0lMT05cbiAgICApIHtcbiAgICAgIHJldC5wdXNoKGluZGV4KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcbiIsICJpbXBvcnQgeyBDaGFydCwgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydFwiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW5cIjtcbmltcG9ydCB7IFByZWNpc2lvbiB9IGZyb20gXCIuLi9wcmVjaXNpb24vcHJlY2lzaW9uXCI7XG5pbXBvcnQgeyBDb21wdXRlU2xhY2ssIENyaXRpY2FsUGF0aCB9IGZyb20gXCIuLi9zbGFjay9zbGFja1wiO1xuaW1wb3J0IHsgSmFjb2JpYW4sIFVuY2VydGFpbnR5IH0gZnJvbSBcIi4uL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuXCI7XG5cbmNvbnN0IE1BWF9SQU5ET00gPSAxMDAwO1xuXG5jb25zdCBwcmVjaXNpb24gPSBuZXcgUHJlY2lzaW9uKDIpO1xuXG5jb25zdCBybmRJbnQgPSAobjogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG4pO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBDcml0aWNhbFBhdGhFbnRyeSB7XG4gIGNvdW50OiBudW1iZXI7XG4gIGNyaXRpY2FsUGF0aDogbnVtYmVyW107XG4gIGR1cmF0aW9uczogbnVtYmVyW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3JpdGljYWxQYXRoVGFza0VudHJ5IHtcbiAgdGFza0luZGV4OiBudW1iZXI7XG4gIGR1cmF0aW9uOiBudW1iZXI7XG4gIG51bVRpbWVzQXBwZWFyZWQ6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTaW11bGF0aW9uUmVzdWx0cyB7XG4gIHBhdGhzOiBNYXA8c3RyaW5nLCBDcml0aWNhbFBhdGhFbnRyeT47XG4gIHRhc2tzOiBDcml0aWNhbFBhdGhUYXNrRW50cnlbXTtcbn1cblxuLyoqXG4gKiBTaW11bGF0ZSB0aGUgdW5jZXJ0YWludHkgaW4gdGhlIHBsYW4gYW5kIGdlbmVyYXRlIHBvc3NpYmxlIGFsdGVybmF0ZSBjcml0aWNhbFxuICogcGF0aHMuXG4gKi9cbmV4cG9ydCBjb25zdCBzaW11bGF0aW9uID0gKFxuICBjaGFydDogQ2hhcnQsXG4gIG51bVNpbXVsYXRpb25Mb29wczogbnVtYmVyLFxuICBvcmlnaW5hbENyaXRpY2FsUGF0aDogbnVtYmVyW11cbik6IFNpbXVsYXRpb25SZXN1bHRzID0+IHtcbiAgY29uc3QgYWxsQ3JpdGljYWxQYXRocyA9IG5ldyBNYXA8c3RyaW5nLCBDcml0aWNhbFBhdGhFbnRyeT4oKTtcbiAgYWxsQ3JpdGljYWxQYXRocy5zZXQoYCR7b3JpZ2luYWxDcml0aWNhbFBhdGh9YCwge1xuICAgIGNvdW50OiAwLFxuICAgIGNyaXRpY2FsUGF0aDogb3JpZ2luYWxDcml0aWNhbFBhdGguc2xpY2UoKSxcbiAgICBkdXJhdGlvbnM6IGNoYXJ0LlZlcnRpY2VzLm1hcCgodGFzazogVGFzaykgPT4gdGFzay5kdXJhdGlvbiksXG4gIH0pO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtU2ltdWxhdGlvbkxvb3BzOyBpKyspIHtcbiAgICAvLyBHZW5lcmF0ZSByYW5kb20gZHVyYXRpb25zIGJhc2VkIG9uIGVhY2ggVGFza3MgdW5jZXJ0YWludHkuXG4gICAgY29uc3QgZHVyYXRpb25zID0gY2hhcnQuVmVydGljZXMubWFwKCh0OiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCByYXdEdXJhdGlvbiA9IG5ldyBKYWNvYmlhbihcbiAgICAgICAgdC5kdXJhdGlvbiwgLy8gQWNjZXB0YWJsZSBkaXJlY3QgYWNjZXNzIHRvIGR1cmF0aW9uLlxuICAgICAgICB0LmdldFJlc291cmNlKFwiVW5jZXJ0YWludHlcIikgYXMgVW5jZXJ0YWludHlcbiAgICAgICkuc2FtcGxlKHJuZEludChNQVhfUkFORE9NKSAvIE1BWF9SQU5ET00pO1xuICAgICAgcmV0dXJuIHByZWNpc2lvbi5yb3VuZChyYXdEdXJhdGlvbik7XG4gICAgfSk7XG5cbiAgICAvLyBDb21wdXRlIHRoZSBzbGFjayBiYXNlZCBvbiB0aG9zZSByYW5kb20gZHVyYXRpb25zLlxuICAgIGNvbnN0IHNsYWNrc1JldCA9IENvbXB1dGVTbGFjayhcbiAgICAgIGNoYXJ0LFxuICAgICAgKHRhc2tJbmRleDogbnVtYmVyKSA9PiBkdXJhdGlvbnNbdGFza0luZGV4XSxcbiAgICAgIHByZWNpc2lvbi5yb3VuZGVyKClcbiAgICApO1xuICAgIGlmICghc2xhY2tzUmV0Lm9rKSB7XG4gICAgICB0aHJvdyBzbGFja3NSZXQuZXJyb3I7XG4gICAgfVxuXG4gICAgY29uc3QgY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrc1JldC52YWx1ZSwgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG4gICAgY29uc3QgY3JpdGljYWxQYXRoQXNTdHJpbmcgPSBgJHtjcml0aWNhbFBhdGh9YDtcbiAgICBsZXQgcGF0aEVudHJ5ID0gYWxsQ3JpdGljYWxQYXRocy5nZXQoY3JpdGljYWxQYXRoQXNTdHJpbmcpO1xuICAgIGlmIChwYXRoRW50cnkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGF0aEVudHJ5ID0ge1xuICAgICAgICBjb3VudDogMCxcbiAgICAgICAgY3JpdGljYWxQYXRoOiBjcml0aWNhbFBhdGgsXG4gICAgICAgIGR1cmF0aW9uczogZHVyYXRpb25zLFxuICAgICAgfTtcbiAgICAgIGFsbENyaXRpY2FsUGF0aHMuc2V0KGNyaXRpY2FsUGF0aEFzU3RyaW5nLCBwYXRoRW50cnkpO1xuICAgIH1cbiAgICBwYXRoRW50cnkuY291bnQrKztcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGF0aHM6IGFsbENyaXRpY2FsUGF0aHMsXG4gICAgdGFza3M6IGNyaXRpY2FsVGFza0ZyZXF1ZW5jaWVzKGFsbENyaXRpY2FsUGF0aHMsIGNoYXJ0KSxcbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBjcml0aWNhbFRhc2tGcmVxdWVuY2llcyA9IChcbiAgYWxsQ3JpdGljYWxQYXRoczogTWFwPHN0cmluZywgQ3JpdGljYWxQYXRoRW50cnk+LFxuICBjaGFydDogQ2hhcnRcbik6IENyaXRpY2FsUGF0aFRhc2tFbnRyeVtdID0+IHtcbiAgY29uc3QgY3JpdGlhbFRhc2tzOiBNYXA8bnVtYmVyLCBDcml0aWNhbFBhdGhUYXNrRW50cnk+ID0gbmV3IE1hcCgpO1xuXG4gIGFsbENyaXRpY2FsUGF0aHMuZm9yRWFjaCgodmFsdWU6IENyaXRpY2FsUGF0aEVudHJ5KSA9PiB7XG4gICAgdmFsdWUuY3JpdGljYWxQYXRoLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBsZXQgdGFza0VudHJ5ID0gY3JpdGlhbFRhc2tzLmdldCh0YXNrSW5kZXgpO1xuICAgICAgaWYgKHRhc2tFbnRyeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhc2tFbnRyeSA9IHtcbiAgICAgICAgICB0YXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICAgICAgICBkdXJhdGlvbjogY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5kdXJhdGlvbixcbiAgICAgICAgICBudW1UaW1lc0FwcGVhcmVkOiAwLFxuICAgICAgICB9O1xuICAgICAgICBjcml0aWFsVGFza3Muc2V0KHRhc2tJbmRleCwgdGFza0VudHJ5KTtcbiAgICAgIH1cbiAgICAgIHRhc2tFbnRyeS5udW1UaW1lc0FwcGVhcmVkICs9IHZhbHVlLmNvdW50O1xuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gWy4uLmNyaXRpYWxUYXNrcy52YWx1ZXMoKV0uc29ydChcbiAgICAoYTogQ3JpdGljYWxQYXRoVGFza0VudHJ5LCBiOiBDcml0aWNhbFBhdGhUYXNrRW50cnkpOiBudW1iZXIgPT4ge1xuICAgICAgcmV0dXJuIGIuZHVyYXRpb24gLSBhLmR1cmF0aW9uO1xuICAgIH1cbiAgKTtcbn07XG4iLCAiaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW5cIjtcbmltcG9ydCB7XG4gIENyaXRpY2FsUGF0aEVudHJ5LFxuICBDcml0aWNhbFBhdGhUYXNrRW50cnksXG4gIFNpbXVsYXRpb25SZXN1bHRzLFxuICBzaW11bGF0aW9uLFxufSBmcm9tIFwiLi4vc2ltdWxhdGlvbi9zaW11bGF0aW9uXCI7XG5pbXBvcnQgeyBDaGFydCB9IGZyb20gXCIuLi9jaGFydC9jaGFydFwiO1xuaW1wb3J0IHsgZGlmZmVyZW5jZSB9IGZyb20gXCIuLi9kYWcvYWxnb3JpdGhtcy9jaXJjdWxhclwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNpbXVsYXRpb25TZWxlY3REZXRhaWxzIHtcbiAgZHVyYXRpb25zOiBudW1iZXJbXSB8IG51bGw7XG4gIGNyaXRpY2FsUGF0aDogbnVtYmVyW107XG59XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIEdsb2JhbEV2ZW50SGFuZGxlcnNFdmVudE1hcCB7XG4gICAgXCJzaW11bGF0aW9uLXNlbGVjdFwiOiBDdXN0b21FdmVudDxTaW11bGF0aW9uU2VsZWN0RGV0YWlscz47XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNpbXVsYXRpb25QYW5lbCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgcmVzdWx0czogU2ltdWxhdGlvblJlc3VsdHMgPSB7XG4gICAgcGF0aHM6IG5ldyBNYXAoKSxcbiAgICB0YXNrczogW10sXG4gIH07XG4gIGNoYXJ0OiBDaGFydCB8IG51bGwgPSBudWxsO1xuICBudW1TaW11bGF0aW9uTG9vcHM6IG51bWJlciA9IDA7XG4gIG9yaWdpbmFsQ3JpdGljYWxQYXRoOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBzaW11bGF0ZShcbiAgICBjaGFydDogQ2hhcnQsXG4gICAgbnVtU2ltdWxhdGlvbkxvb3BzOiBudW1iZXIsXG4gICAgb3JpZ2luYWxDcml0aWNhbFBhdGg6IG51bWJlcltdXG4gICk6IG51bWJlcltdIHtcbiAgICB0aGlzLnJlc3VsdHMgPSBzaW11bGF0aW9uKGNoYXJ0LCBudW1TaW11bGF0aW9uTG9vcHMsIG9yaWdpbmFsQ3JpdGljYWxQYXRoKTtcbiAgICB0aGlzLmNoYXJ0ID0gY2hhcnQ7XG4gICAgdGhpcy5udW1TaW11bGF0aW9uTG9vcHMgPSBudW1TaW11bGF0aW9uTG9vcHM7XG4gICAgdGhpcy5vcmlnaW5hbENyaXRpY2FsUGF0aCA9IG9yaWdpbmFsQ3JpdGljYWxQYXRoO1xuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICByZXR1cm4gdGhpcy5yZXN1bHRzLnRhc2tzLm1hcChcbiAgICAgICh0YXNrRW50cnk6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSkgPT4gdGFza0VudHJ5LnRhc2tJbmRleFxuICAgICk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLnJlc3VsdHMgPSB7XG4gICAgICBwYXRoczogbmV3IE1hcCgpLFxuICAgICAgdGFza3M6IFtdLFxuICAgIH07XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgbmV3IEN1c3RvbUV2ZW50PFNpbXVsYXRpb25TZWxlY3REZXRhaWxzPihcInNpbXVsYXRpb24tc2VsZWN0XCIsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgZHVyYXRpb25zOiBudWxsLFxuICAgICAgICAgIGNyaXRpY2FsUGF0aDogW10sXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHBhdGhDbGlja2VkKGtleTogc3RyaW5nKSB7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgbmV3IEN1c3RvbUV2ZW50PFNpbXVsYXRpb25TZWxlY3REZXRhaWxzPihcInNpbXVsYXRpb24tc2VsZWN0XCIsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgZHVyYXRpb25zOiB0aGlzLnJlc3VsdHMucGF0aHMuZ2V0KGtleSkhLmR1cmF0aW9ucyxcbiAgICAgICAgICBjcml0aWNhbFBhdGg6IHRoaXMucmVzdWx0cy5wYXRocy5nZXQoa2V5KSEuY3JpdGljYWxQYXRoLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJlbmRlcih0aGlzLnRlbXBsYXRlKCksIHRoaXMpO1xuICB9XG5cbiAgZGlzcGxheUNyaXRpY2FsUGF0aERpZmZlcmVuY2VzKGNyaXRpY2FsUGF0aDogbnVtYmVyW10pOiBUZW1wbGF0ZVJlc3VsdCB7XG4gICAgY29uc3QgcmVtb3ZlZCA9IGRpZmZlcmVuY2UodGhpcy5vcmlnaW5hbENyaXRpY2FsUGF0aCwgY3JpdGljYWxQYXRoKTtcbiAgICBjb25zdCBhZGRlZCA9IGRpZmZlcmVuY2UoY3JpdGljYWxQYXRoLCB0aGlzLm9yaWdpbmFsQ3JpdGljYWxQYXRoKTtcbiAgICBpZiAocmVtb3ZlZC5sZW5ndGggPT09IDAgJiYgYWRkZWQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gaHRtbGBPcmlnaW5hbCBDcml0aWNhbCBQYXRoYDtcbiAgICB9XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICAke2FkZGVkLm1hcChcbiAgICAgICAgKHRhc2tJbmRleDogbnVtYmVyKSA9PiBodG1sYFxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiYWRkZWRcIj4rJHt0aGlzLmNoYXJ0IS5WZXJ0aWNlc1t0YXNrSW5kZXhdLm5hbWV9PC9zcGFuPlxuICAgICAgICBgXG4gICAgICApfVxuICAgICAgJHtyZW1vdmVkLm1hcChcbiAgICAgICAgKHRhc2tJbmRleDogbnVtYmVyKSA9PiBodG1sYFxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwicmVtb3ZlZFwiPi0ke3RoaXMuY2hhcnQhLlZlcnRpY2VzW3Rhc2tJbmRleF0ubmFtZX08L3NwYW4+XG4gICAgICAgIGBcbiAgICAgICl9XG4gICAgYDtcbiAgfVxuXG4gIHRlbXBsYXRlKCk6IFRlbXBsYXRlUmVzdWx0IHtcbiAgICBpZiAodGhpcy5yZXN1bHRzLnBhdGhzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiBodG1sYGA7XG4gICAgfVxuICAgIGNvbnN0IHBhdGhLZXlzID0gWy4uLnRoaXMucmVzdWx0cy5wYXRocy5rZXlzKCldO1xuICAgIGNvbnN0IHNvcnRlZFBhdGhLZXlzID0gcGF0aEtleXMuc29ydCgoYTogc3RyaW5nLCBiOiBzdHJpbmcpID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMucmVzdWx0cy5wYXRocy5nZXQoYikhLmNvdW50IC0gdGhpcy5yZXN1bHRzLnBhdGhzLmdldChhKSEuY291bnRcbiAgICAgICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8YnV0dG9uXG4gICAgICAgIEBjbGljaz0keygpID0+IHtcbiAgICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIENsZWFyXG4gICAgICA8L2J1dHRvbj5cblxuICAgICAgPHRhYmxlIGNsYXNzPVwicGF0aHNcIj5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD5Db3VudDwvdGg+XG4gICAgICAgICAgPHRoPkNyaXRpY2FsIFBhdGg8L3RoPlxuICAgICAgICA8L3RyPlxuICAgICAgICAke3NvcnRlZFBhdGhLZXlzLm1hcChcbiAgICAgICAgICAoa2V5OiBzdHJpbmcpID0+XG4gICAgICAgICAgICBodG1sYDx0ciBAY2xpY2s9JHsoKSA9PiB0aGlzLnBhdGhDbGlja2VkKGtleSl9PlxuICAgICAgICAgICAgICA8dGQ+JHt0aGlzLnJlc3VsdHMucGF0aHMuZ2V0KGtleSkhLmNvdW50fTwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAke3RoaXMuZGlzcGxheUNyaXRpY2FsUGF0aERpZmZlcmVuY2VzKFxuICAgICAgICAgICAgICAgICAgdGhpcy5yZXN1bHRzLnBhdGhzLmdldChrZXkpIS5jcml0aWNhbFBhdGhcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPC90cj5gXG4gICAgICAgICl9XG4gICAgICA8L3RhYmxlPlxuICAgICAgPHRhYmxlPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPk5hbWU8L3RoPlxuICAgICAgICAgIDx0aD5EdXJhdGlvbjwvdGg+XG4gICAgICAgICAgPHRoPkZyZXF1ZW5jeSAoJSk8L3RoPlxuICAgICAgICA8L3RyPlxuICAgICAgICAke3RoaXMucmVzdWx0cy50YXNrcy5tYXAoXG4gICAgICAgICAgKHRhc2tFbnRyeTogQ3JpdGljYWxQYXRoVGFza0VudHJ5KSA9PlxuICAgICAgICAgICAgaHRtbGA8dHI+XG4gICAgICAgICAgICAgIDx0ZD4ke3RoaXMuY2hhcnQhLlZlcnRpY2VzW3Rhc2tFbnRyeS50YXNrSW5kZXhdLm5hbWV9PC90ZD5cbiAgICAgICAgICAgICAgPHRkPiR7dGFza0VudHJ5LmR1cmF0aW9ufTwvdGQ+XG4gICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAke01hdGguZmxvb3IoXG4gICAgICAgICAgICAgICAgICAoMTAwICogdGFza0VudHJ5Lm51bVRpbWVzQXBwZWFyZWQpIC8gdGhpcy5udW1TaW11bGF0aW9uTG9vcHNcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPC90cj5gXG4gICAgICAgICl9XG4gICAgICA8L3RhYmxlPlxuICAgIGA7XG4gIH1cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwic2ltdWxhdGlvbi1wYW5lbFwiLCBTaW11bGF0aW9uUGFuZWwpO1xuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluLnRzXCI7XG5pbXBvcnQgeyBTZWFyY2hUeXBlLCBUYXNrU2VhcmNoQ29udHJvbCB9IGZyb20gXCIuL3Rhc2stc2VhcmNoLWNvbnRyb2xzLnRzXCI7XG5cbi8qKiBVc2VzIGEgdGFzay1zZWFyY2gtY29udHJvbCB0byBzZWFyY2ggdGhyb3VnaCBhbGwgVGFza3MuICovXG5leHBvcnQgY2xhc3MgU2VhcmNoVGFza1BhbmVsIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBleHBsYW5NYWluOiBFeHBsYW5NYWluIHwgbnVsbCA9IG51bGw7XG4gIHRhc2tTZWFyY2hDb250cm9sOiBUYXNrU2VhcmNoQ29udHJvbCB8IG51bGwgPSBudWxsO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMuZXhwbGFuTWFpbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJleHBsYW4tbWFpblwiKTtcbiAgICBpZiAoIXRoaXMuZXhwbGFuTWFpbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnRhc2tTZWFyY2hDb250cm9sID0gdGhpcy5xdWVyeVNlbGVjdG9yKFwidGFzay1zZWFyY2gtY29udHJvbFwiKTtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJ0YXNrLWNoYW5nZVwiLCAoZSkgPT4ge1xuICAgICAgdGhpcy5leHBsYW5NYWluIS5zZXRTZWxlY3Rpb24oZS5kZXRhaWwudGFza0luZGV4LCBlLmRldGFpbC5mb2N1cywgdHJ1ZSk7XG4gICAgfSk7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwidGFzay1mb2N1c1wiLCAoZSkgPT5cbiAgICAgIHRoaXMuc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoXCJmdWxsLWluZm9cIilcbiAgICApO1xuICB9XG5cbiAgc2V0S2V5Ym9hcmRGb2N1c1RvSW5wdXQoc2VhcmNoVHlwZTogU2VhcmNoVHlwZSkge1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLnRhc2tzID0gdGhpcy5leHBsYW5NYWluIS5wbGFuLmNoYXJ0LlZlcnRpY2VzO1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLmluY2x1ZGVkSW5kZXhlcyA9XG4gICAgICB0aGlzLmV4cGxhbk1haW4hLnBsYW4uY2hhcnQuVmVydGljZXMubWFwKFxuICAgICAgICAoXywgaW5kZXg6IG51bWJlcikgPT4gaW5kZXhcbiAgICAgICkuc2xpY2UoMSwgLTEpO1xuICAgIHRoaXMudGFza1NlYXJjaENvbnRyb2whLnNldEtleWJvYXJkRm9jdXNUb0lucHV0KHNlYXJjaFR5cGUpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcInNlYXJjaC10YXNrLXBhbmVsXCIsIFNlYXJjaFRhc2tQYW5lbCk7XG4iLCAiaW1wb3J0IHsgVGVtcGxhdGVSZXN1bHQsIGh0bWwsIHJlbmRlciB9IGZyb20gXCJsaXQtaHRtbFwiO1xuaW1wb3J0IGZ1enp5c29ydCBmcm9tIFwiZnV6enlzb3J0XCI7XG5pbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5cbmludGVyZmFjZSBUYXNrQ2hhbmdlRGV0YWlsIHtcbiAgdGFza0luZGV4OiBudW1iZXI7XG4gIGZvY3VzOiBib29sZWFuO1xufVxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIGludGVyZmFjZSBHbG9iYWxFdmVudEhhbmRsZXJzRXZlbnRNYXAge1xuICAgIFwidGFzay1jaGFuZ2VcIjogQ3VzdG9tRXZlbnQ8VGFza0NoYW5nZURldGFpbD47XG4gICAgXCJ0YXNrLWZvY3VzXCI6IEN1c3RvbUV2ZW50PG51bGw+O1xuICB9XG59XG5cbi8qKiBUaGUgaW5kZXhlcyByZXR1cm5lZCBieSBmdXp6eXNvcnQgaXMganVzdCBhIGxpc3Qgb2YgdGhlIGluZGV4ZXMgb2YgdGhlIHRoZVxuICogIGluZGl2aWR1YWwgY2hhcnMgdGhhdCBoYXZlIGJlZW4gbWF0Y2hlZC4gV2UgbmVlZCB0byB0dXJuIHRoYXQgaW50byBwYWlycyBvZlxuICogIG51bWJlcnMgd2UgY2FuIHBhc3MgdG8gU3RyaW5nLnByb3RvdHlwZS5zbGljZSgpLlxuICpcbiAqICBUaGUgb2JzZXJ2YXRpb24gaGVyZSBpcyB0aGF0IGlmIHRoZSB0YXJnZXQgc3RyaW5nIGlzIFwiSGVsbG9cIiBhbmQgdGhlIGluZGljZXNcbiAqICBhcmUgWzIsM10gdGhlbiBpdCBkb2Vzbid0IG1hdHRlciBpZiB3ZSBtYXJrdXAgdGhlIGhpZ2hsaWdodGVkIHRhcmdldCBhc1xuICogIFwiSGU8Yj5sbDwvYj5vXCIgb3IgXCJIZTxiPmw8L2I+PGI+bDwvYj5vXCIuIFRoYXQgaXMsIHdlIGNhbiBzaW1wbGlmeSBpZiB3ZVxuICogIGFsd2F5cyBzbGljZSBvdXQgZWFjaCBjaGFyYWN0ZXIgaW4gdGhlIHRhcmdldCBzdHJpbmcgdGhhdCBuZWVkcyB0byBiZVxuICogIGhpZ2hsaWdodGVkLlxuICpcbiAqICBTbyBpbmRleGVzVG9SYW5nZXMgcmV0dXJucyBhbiBhcnJheSBvZiBpbmRleGVzLCB0aGF0IGlmIHRha2VuIGluIHBhaXJzLCB3aWxsXG4gKiAgYWx0ZXJuYXRlbHkgc2xpY2Ugb2ZmIHBhcnRzIG9mIHRhcmdldCB0aGF0IG5lZWQgdG8gYmUgZW1waGFzaXplZC5cbiAqXG4gKiAgSW4gdGhlIGFib3ZlIGV4YW1wbGUgdGFyZ2V0ID0gXCJIZWxsb1wiIGFuZCBpbmRleGVzID0gWzIsM10sIHRoZW5cbiAqICBpbmRleGVzVG9SYW5nZXMgd2lsbCByZXR1cm5cIlxuICpcbiAqICAgICBbMCwyLDMsMyw0LDVdXG4gKlxuICogIHdoaWNoIHdpbGwgZ2VuZXJhdGUgdGhlIGZvbGxvd2luZyBwYWlycyBhcyBhcmdzIHRvIHNsaWNlOlxuICpcbiAqICAgICBbMCwyXSBIZVxuICogICAgIFsyLDNdIGwgICAjXG4gKiAgICAgWzMsM11cbiAqICAgICBbMyw0XSBsICAgI1xuICogICAgIFs0LDVdIG9cbiAqXG4gKiBOb3RlIHRoYXQgaWYgd2UgYWx0ZXJuYXRlIGJvbGRpbmcgdGhlbiBvbmx5IHRoZSB0d28gJ2wncyBnZXQgZW1waGFzaXplZCxcbiAqIHdoaWNoIGlzIHdoYXQgd2Ugd2FudCAoRGVub3RlZCBieSAjIGFib3ZlKS5cbiAqL1xuY29uc3QgaW5kZXhlc1RvUmFuZ2VzID0gKFxuICBpbmRleGVzOiBSZWFkb25seTxudW1iZXJbXT4sXG4gIGxlbjogbnVtYmVyXG4pOiBudW1iZXJbXSA9PiB7XG4gIC8vIENvbnZlcnQgZWFjaCBpbmRleCBvZiBhIGhpZ2hsaWdodGVkIGNoYXIgaW50byBhIHBhaXIgb2YgbnVtYmVycyB3ZSBjYW4gcGFzc1xuICAvLyB0byBzbGljZSwgYW5kIHRoZW4gZmxhdHRlbi5cbiAgY29uc3QgcmFuZ2VzID0gaW5kZXhlcy5tYXAoKHg6IG51bWJlcikgPT4gW3gsIHggKyAxXSkuZmxhdCgpO1xuXG4gIC8vIE5vdyBwcmVwZW5kIHdpdGggMCBhbmQgYXBwZW5kICdsZW4nIHNvIHRoYXQgd2UgaGF2ZSBwYWlycyB0aGF0IHdpbGwgc2xpY2VcbiAgLy8gdGFyZ2V0IGZ1bGx5IGludG8gc3Vic3RyaW5ncy4gUmVtZW1iZXIgdGhhdCBzbGljZSByZXR1cm5zIGNoYXJzIGluIFthLCBiKSxcbiAgLy8gaS5lLiBTdHJpbmcuc2xpY2UoYSxiKSB3aGVyZSBiIGlzIG9uZSBiZXlvbmQgdGhlIGxhc3QgY2hhciBpbiB0aGUgc3RyaW5nIHdlXG4gIC8vIHdhbnQgdG8gaW5jbHVkZS5cbiAgcmV0dXJuIFswLCAuLi5yYW5nZXMsIGxlbl07XG59O1xuXG4vKiogUmV0dXJucyB0aGUgdGFyZ2V0IHN0cmluZyBoaWdobGlnaHRlZCBhcm91bmQgdGhlIGdpdmVuIGNoYXJhY3RlciBpbmRleGVzIGluXG4gKiAgdGhlIHJhbmdlcyBhcnJheS5cbiAqXG4gKiAgV2UgZG9uJ3QgdXNlIHRoZSBoaWdobGlnaHRpbmcgZnJvbSBmdXp6eXNvcnQuXG4gKi9cbmNvbnN0IGhpZ2hsaWdodCA9IChyYW5nZXM6IG51bWJlcltdLCB0YXJnZXQ6IHN0cmluZyk6IFRlbXBsYXRlUmVzdWx0W10gPT4ge1xuICBjb25zdCByZXQ6IFRlbXBsYXRlUmVzdWx0W10gPSBbXTtcbiAgbGV0IGluSGlnaGxpZ2h0ID0gZmFsc2U7XG5cbiAgLy8gUnVuIGRvd24gcmFuZ2VzIHdpdGggYSBzbGlkaW5nIHdpbmRvdyBvZiBsZW5ndGggMiBhbmQgdXNlIHRoYXQgYXMgdGhlXG4gIC8vIGFyZ3VtZW50cyB0byBzbGljZS4gQWx0ZXJuYXRlIGhpZ2hsaWdodGluZyBlYWNoIHNlZ21lbnQuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGNvbnN0IHN1YiA9IHRhcmdldC5zbGljZShyYW5nZXNbaV0sIHJhbmdlc1tpICsgMV0pO1xuICAgIGlmIChpbkhpZ2hsaWdodCkge1xuICAgICAgcmV0LnB1c2goaHRtbGA8Yj4ke3N1Yn08L2I+YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldC5wdXNoKGh0bWxgJHtzdWJ9YCk7XG4gICAgfVxuICAgIGluSGlnaGxpZ2h0ID0gIWluSGlnaGxpZ2h0O1xuICB9XG4gIHJldHVybiByZXQ7XG59O1xuXG4vKiogUmV0dXJucyB0aGUgdGFyZ2V0IHN0cmluZyBoaWdobGlnaHRlZCBhcm91bmQgdGhlIGdpdmVuIGNoYXJhY3RlciBpbmRleGVzLlxuICogIE5vdGUgdGhhdCB3ZSBkb24ndCB1c2UgZnV6enlzb3J0J3MgaGlnaGxpZ2h0IGJlY2F1c2Ugd2UgaGF2ZW4ndCBzYW5pdGl6ZWRcbiAqICB0aGUgbmFtZXMuXG4gKi9cbmNvbnN0IGhpZ2hsaWdodGVkVGFyZ2V0ID0gKFxuICBpbmRleGVzOiBSZWFkb25seTxudW1iZXJbXT4sXG4gIHRhcmdldDogc3RyaW5nXG4pOiBUZW1wbGF0ZVJlc3VsdFtdID0+IHtcbiAgcmV0dXJuIGhpZ2hsaWdodChpbmRleGVzVG9SYW5nZXMoaW5kZXhlcywgdGFyZ2V0Lmxlbmd0aCksIHRhcmdldCk7XG59O1xuXG5jb25zdCBzZWFyY2hSZXN1bHRzID0gKHNlYXJjaFRhc2tQYW5lbDogVGFza1NlYXJjaENvbnRyb2wpOiBUZW1wbGF0ZVJlc3VsdFtdID0+XG4gIHNlYXJjaFRhc2tQYW5lbC5zZWFyY2hSZXN1bHRzLm1hcChcbiAgICAodGFzazogU2VhcmNoUmVzdWx0LCBpbmRleDogbnVtYmVyKSA9PlxuICAgICAgaHRtbGAgPGxpXG4gICAgICAgIHRhYmluZGV4PVwiMFwiXG4gICAgICAgIEBjbGljaz1cIiR7KGU6IEV2ZW50KSA9PlxuICAgICAgICAgIHNlYXJjaFRhc2tQYW5lbC5zZWxlY3RTZWFyY2hSZXN1bHQoaW5kZXgsIGZhbHNlKX1cIlxuICAgICAgICA/ZGF0YS1mb2N1cz0ke2luZGV4ID09PSBzZWFyY2hUYXNrUGFuZWwuZm9jdXNJbmRleH1cbiAgICAgICAgZGF0YS1pbmRleD0ke2luZGV4fVxuICAgICAgPlxuICAgICAgICAke2hpZ2hsaWdodGVkVGFyZ2V0KHRhc2suaW5kZXhlcywgdGFzay50YXJnZXQpfVxuICAgICAgPC9saT5gXG4gICk7XG5cbmNvbnN0IHRlbXBsYXRlID0gKHNlYXJjaFRhc2tQYW5lbDogVGFza1NlYXJjaENvbnRyb2wpOiBUZW1wbGF0ZVJlc3VsdCA9PiBodG1sYFxuICA8aW5wdXRcbiAgICBhdXRvY29tcGxldGU9XCJvZmZcIlxuICAgIG5hbWU9XCJ0YXNrX3NlYXJjaFwiXG4gICAgaWQ9XCJzZWFyY2hfaW5wdXRcIlxuICAgIHBsYWNlaG9sZGVyPVwiU2VhcmNoXCJcbiAgICB0eXBlPVwidGV4dFwiXG4gICAgQGlucHV0PVwiJHsoZTogSW5wdXRFdmVudCkgPT5cbiAgICAgIHNlYXJjaFRhc2tQYW5lbC5vbklucHV0KChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSl9XCJcbiAgICBAa2V5ZG93bj1cIiR7KGU6IEtleWJvYXJkRXZlbnQpID0+IHNlYXJjaFRhc2tQYW5lbC5vbktleURvd24oZSl9XCJcbiAgICBAZm9jdXM9XCIkeygpID0+IHNlYXJjaFRhc2tQYW5lbC5zZWFyY2hJbnB1dFJlY2VpdmVkRm9jdXMoKX1cIlxuICAvPlxuICA8dWw+XG4gICAgJHtzZWFyY2hSZXN1bHRzKHNlYXJjaFRhc2tQYW5lbCl9XG4gIDwvdWw+XG5gO1xuXG5leHBvcnQgdHlwZSBTZWFyY2hUeXBlID0gXCJuYW1lLW9ubHlcIiB8IFwiZnVsbC1pbmZvXCI7XG5cbmNvbnN0IHNlYXJjaFN0cmluZ0Zyb21UYXNrQnVpbGRlciA9IChcbiAgZnVsbFRhc2tMaXN0OiBUYXNrW10sXG4gIHNlYXJjaFR5cGU6IFNlYXJjaFR5cGUsXG4gIGluY2x1ZGVkSW5kZXhlczogU2V0PG51bWJlcj4sXG4gIG1heE5hbWVMZW5ndGg6IG51bWJlclxuKTogKCh0YXNrOiBUYXNrKSA9PiBzdHJpbmcpID0+IHtcbiAgaWYgKHNlYXJjaFR5cGUgPT09IFwiZnVsbC1pbmZvXCIpIHtcbiAgICByZXR1cm4gKHRhc2s6IFRhc2spOiBzdHJpbmcgPT4ge1xuICAgICAgaWYgKGluY2x1ZGVkSW5kZXhlcy5zaXplICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IHRhc2tJbmRleCA9IGZ1bGxUYXNrTGlzdC5pbmRleE9mKHRhc2spO1xuICAgICAgICBpZiAoIWluY2x1ZGVkSW5kZXhlcy5oYXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCByZXNvdXJjZUtleXMgPSBPYmplY3Qua2V5cyh0YXNrLnJlc291cmNlcyk7XG4gICAgICByZXNvdXJjZUtleXMuc29ydCgpO1xuICAgICAgcmV0dXJuIGAke3Rhc2submFtZX0gJHtcIi1cIi5yZXBlYXQobWF4TmFtZUxlbmd0aCAtIHRhc2submFtZS5sZW5ndGggKyAyKX0gJHtyZXNvdXJjZUtleXNcbiAgICAgICAgLm1hcCgoa2V5OiBzdHJpbmcpID0+IHRhc2sucmVzb3VyY2VzW2tleV0pXG4gICAgICAgIC5qb2luKFwiIFwiKX1gO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICh0YXNrOiBUYXNrKTogc3RyaW5nID0+IHtcbiAgICAgIGlmIChpbmNsdWRlZEluZGV4ZXMuc2l6ZSAhPT0gMCkge1xuICAgICAgICBjb25zdCB0YXNrSW5kZXggPSBmdWxsVGFza0xpc3QuaW5kZXhPZih0YXNrKTtcbiAgICAgICAgaWYgKCFpbmNsdWRlZEluZGV4ZXMuaGFzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRhc2submFtZTtcbiAgICB9O1xuICB9XG59O1xuXG5pbnRlcmZhY2UgU2VhcmNoUmVzdWx0IHtcbiAgb2JqOiBUYXNrO1xuICBpbmRleGVzOiBSZWFkb25seUFycmF5PG51bWJlcj47XG4gIHRhcmdldDogc3RyaW5nO1xufVxuXG5jb25zdCB0YXNrTGlzdFRvU2VhcmNoUmVzdWx0cyA9IChcbiAgdGFza3M6IFRhc2tbXSxcbiAgdGFza1RvU2VhcmNoU3RyaW5nOiAodGFzazogVGFzaykgPT4gc3RyaW5nLFxuICBpbmNsdWRlZEluZGV4ZXM6IFNldDxudW1iZXI+XG4pOiBTZWFyY2hSZXN1bHRbXSA9PiB7XG4gIHJldHVybiB0YXNrc1xuICAgIC5maWx0ZXIoKF90YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiBpbmNsdWRlZEluZGV4ZXMuaGFzKGluZGV4KSlcbiAgICAubWFwKCh0OiBUYXNrKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvYmo6IHQsXG4gICAgICAgIGluZGV4ZXM6IFtdLFxuICAgICAgICB0YXJnZXQ6IHRhc2tUb1NlYXJjaFN0cmluZyh0KSxcbiAgICAgIH07XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIENvbnRyb2wgZm9yIHVzaW5nIGZ1enp5IHNlYXJjaCBvbiBhIGxpc3Qgb2YgdGFza3MuXG4gKlxuICovXG5leHBvcnQgY2xhc3MgVGFza1NlYXJjaENvbnRyb2wgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIF90YXNrczogVGFza1tdID0gW107XG4gIF9pbmNsdWRlZEluZGV4ZXM6IFNldDxudW1iZXI+ID0gbmV3IFNldCgpO1xuICBmb2N1c0luZGV4OiBudW1iZXIgPSAwO1xuICBzZWFyY2hSZXN1bHRzOiBSZWFkb25seUFycmF5PFNlYXJjaFJlc3VsdD4gPSBbXTtcbiAgc2VhcmNoVHlwZTogU2VhcmNoVHlwZSA9IFwibmFtZS1vbmx5XCI7XG4gIHRhc2tUb1NlYXJjaFN0cmluZzogKHRhc2s6IFRhc2spID0+IHN0cmluZyA9ICh0YXNrOiBUYXNrKSA9PiBcIlwiO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBvbklucHV0KGlucHV0U3RyaW5nOiBzdHJpbmcpIHtcbiAgICBpZiAoaW5wdXRTdHJpbmcgPT09IFwiXCIpIHtcbiAgICAgIHRoaXMuc2VhcmNoUmVzdWx0cyA9IHRhc2tMaXN0VG9TZWFyY2hSZXN1bHRzKFxuICAgICAgICB0aGlzLl90YXNrcyxcbiAgICAgICAgdGhpcy50YXNrVG9TZWFyY2hTdHJpbmcsXG4gICAgICAgIHRoaXMuX2luY2x1ZGVkSW5kZXhlc1xuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gZnV6enlzb3J0LmdvPFRhc2s+KFxuICAgICAgICBpbnB1dFN0cmluZyxcbiAgICAgICAgdGhpcy5fdGFza3Muc2xpY2UoMSwgLTEpLCAvLyBSZW1vdmUgU3RhcnQgYW5kIEZpbmlzaCBmcm9tIHNlYXJjaCByYW5nZS5cbiAgICAgICAge1xuICAgICAgICAgIGtleTogdGhpcy50YXNrVG9TZWFyY2hTdHJpbmcsXG4gICAgICAgICAgbGltaXQ6IHRoaXMuX3Rhc2tzLmxlbmd0aCxcbiAgICAgICAgICB0aHJlc2hvbGQ6IDAuMixcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5mb2N1c0luZGV4ID0gMDtcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgb25LZXlEb3duKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAodGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUT0RPIC0gZXh0cmFjdCBmcm9tIHRoZSB0d28gcGxhY2VzIHdlIGRvIHRoaXMuXG4gICAgY29uc3Qga2V5bmFtZSA9IGAke2Uuc2hpZnRLZXkgPyBcInNoaWZ0LVwiIDogXCJcIn0ke2UuY3RybEtleSA/IFwiY3RybC1cIiA6IFwiXCJ9JHtlLm1ldGFLZXkgPyBcIm1ldGEtXCIgOiBcIlwifSR7ZS5hbHRLZXkgPyBcImFsdC1cIiA6IFwiXCJ9JHtlLmtleX1gO1xuICAgIHN3aXRjaCAoa2V5bmFtZSkge1xuICAgICAgY2FzZSBcIkFycm93RG93blwiOlxuICAgICAgICB0aGlzLmZvY3VzSW5kZXggPSAodGhpcy5mb2N1c0luZGV4ICsgMSkgJSB0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93VXBcIjpcbiAgICAgICAgdGhpcy5mb2N1c0luZGV4ID1cbiAgICAgICAgICAodGhpcy5mb2N1c0luZGV4IC0gMSArIHRoaXMuc2VhcmNoUmVzdWx0cy5sZW5ndGgpICVcbiAgICAgICAgICB0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkVudGVyXCI6XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VsZWN0U2VhcmNoUmVzdWx0KHRoaXMuZm9jdXNJbmRleCwgZmFsc2UpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImN0cmwtRW50ZXJcIjpcbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoUmVzdWx0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZWxlY3RTZWFyY2hSZXN1bHQodGhpcy5mb2N1c0luZGV4LCB0cnVlKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHRoaXMuZm9jdXNJbmRleCk7XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIHNlbGVjdFNlYXJjaFJlc3VsdChpbmRleDogbnVtYmVyLCBmb2N1czogYm9vbGVhbikge1xuICAgIGNvbnN0IHRhc2tJbmRleCA9IHRoaXMuX3Rhc2tzLmluZGV4T2YodGhpcy5zZWFyY2hSZXN1bHRzW2luZGV4XS5vYmopO1xuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcbiAgICAgIG5ldyBDdXN0b21FdmVudDxUYXNrQ2hhbmdlRGV0YWlsPihcInRhc2stY2hhbmdlXCIsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgdGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgICAgICAgZm9jdXM6IGZvY3VzLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuc2VhcmNoUmVzdWx0cyA9IFtdO1xuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBzZWFyY2hJbnB1dFJlY2VpdmVkRm9jdXMoKSB7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KFxuICAgICAgbmV3IEN1c3RvbUV2ZW50PG51bWJlcj4oXCJ0YXNrLWZvY3VzXCIsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHNldEtleWJvYXJkRm9jdXNUb0lucHV0KHNlYXJjaFR5cGU6IFNlYXJjaFR5cGUpIHtcbiAgICB0aGlzLnNlYXJjaFR5cGUgPSBzZWFyY2hUeXBlO1xuICAgIGNvbnN0IGlucHV0Q29udHJvbCA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihcImlucHV0XCIpITtcbiAgICBpbnB1dENvbnRyb2wuZm9jdXMoKTtcbiAgICBpbnB1dENvbnRyb2wuc2VsZWN0KCk7XG4gICAgdGhpcy5vbklucHV0KGlucHV0Q29udHJvbC52YWx1ZSk7XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgdGFza3ModGFza3M6IFRhc2tbXSkge1xuICAgIHRoaXMuX3Rhc2tzID0gdGFza3M7XG4gICAgdGhpcy5idWlsZFRhc2tUb1NlYXJjaFN0cmluZygpO1xuICB9XG5cbiAgcHVibGljIHNldCBpbmNsdWRlZEluZGV4ZXModjogbnVtYmVyW10pIHtcbiAgICB0aGlzLl9pbmNsdWRlZEluZGV4ZXMgPSBuZXcgU2V0KHYpO1xuICAgIHRoaXMuYnVpbGRUYXNrVG9TZWFyY2hTdHJpbmcoKTtcbiAgfVxuXG4gIHByaXZhdGUgYnVpbGRUYXNrVG9TZWFyY2hTdHJpbmcoKSB7XG4gICAgY29uc3QgbWF4TmFtZUxlbmd0aCA9IHRoaXMuX3Rhc2tzLnJlZHVjZTxudW1iZXI+KFxuICAgICAgKHByZXY6IG51bWJlciwgdGFzazogVGFzayk6IG51bWJlciA9PlxuICAgICAgICB0YXNrLm5hbWUubGVuZ3RoID4gcHJldiA/IHRhc2submFtZS5sZW5ndGggOiBwcmV2LFxuICAgICAgMFxuICAgICk7XG4gICAgdGhpcy50YXNrVG9TZWFyY2hTdHJpbmcgPSBzZWFyY2hTdHJpbmdGcm9tVGFza0J1aWxkZXIoXG4gICAgICB0aGlzLl90YXNrcyxcbiAgICAgIHRoaXMuc2VhcmNoVHlwZSxcbiAgICAgIHRoaXMuX2luY2x1ZGVkSW5kZXhlcyxcbiAgICAgIG1heE5hbWVMZW5ndGhcbiAgICApO1xuICAgIHRoaXMub25JbnB1dChcIlwiKTtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJ0YXNrLXNlYXJjaC1jb250cm9sXCIsIFRhc2tTZWFyY2hDb250cm9sKTtcbiIsICIvKiogQSBjb29yZGluYXRlIHBvaW50IG9uIHRoZSByZW5kZXJpbmcgc3VyZmFjZS4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBQb2ludCB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgcHQgPSAoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBQb2ludCA9PiB7XG4gIHJldHVybiB7IHg6IHgsIHk6IHkgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBwdHQgPSAocDogW251bWJlciwgbnVtYmVyXSk6IFBvaW50ID0+IHtcbiAgY29uc3QgW3gsIHldID0gcDtcbiAgcmV0dXJuIHsgeDogeCwgeTogeSB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHN1bSA9IChwMTogUG9pbnQsIHAyOiBQb2ludCk6IFBvaW50ID0+IHtcbiAgcmV0dXJuIHtcbiAgICB4OiBwMS54ICsgcDIueCxcbiAgICB5OiBwMS55ICsgcDIueSxcbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBhZGQgPSAocDE6IFBvaW50LCBwMjogW251bWJlciwgbnVtYmVyXSk6IFBvaW50ID0+IHtcbiAgY29uc3QgW3gyLCB5Ml0gPSBwMjtcbiAgcmV0dXJuIHtcbiAgICB4OiBwMS54ICsgeDIsXG4gICAgeTogcDEueSArIHkyLFxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGVxdWFsID0gKHAxOiBQb2ludCwgcDI6IFBvaW50KTogYm9vbGVhbiA9PlxuICBwMS54ID09PSBwMi54ICYmIHAxLnkgPT09IHAyLnk7XG5cbmV4cG9ydCBjb25zdCBkdXAgPSAocDogUG9pbnQpOiBQb2ludCA9PiB7XG4gIHJldHVybiB7IHg6IHAueCwgeTogcC55IH07XG59O1xuXG5leHBvcnQgY29uc3QgZGlmZmVyZW5jZSA9IChwMTogUG9pbnQsIHAyOiBQb2ludCk6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xuICByZXR1cm4gW3AyLnggLSBwMS54LCBwMi55IC0gcDEueV07XG59O1xuIiwgIi8qKlxuICogRnVuY3Rpb25hbGl0eSBmb3IgY3JlYXRpbmcgZHJhZ2dhYmxlIGRpdmlkZXJzIGJldHdlZW4gZWxlbWVudHMgb24gYSBwYWdlLlxuICovXG5pbXBvcnQgeyBjbGFtcCB9IGZyb20gXCIuLi8uLi9tZXRyaWNzL3JhbmdlLnRzXCI7XG5pbXBvcnQgeyBQb2ludCwgZHVwLCBlcXVhbCwgcHQgfSBmcm9tIFwiLi4vLi4vcG9pbnQvcG9pbnQudHNcIjtcblxuLy8gVmFsdWVzIGFyZSByZXR1cm5lZCBhcyBwZXJjZW50YWdlcyBhcm91bmQgdGhlIGN1cnJlbnQgbW91c2UgbG9jYXRpb24uIFRoYXRcbi8vIGlzLCBpZiB3ZSBhcmUgaW4gXCJjb2x1bW5cIiBtb2RlIHRoZW4gYGJlZm9yZWAgd291bGQgZXF1YWwgdGhlIG1vdXNlIHBvc2l0aW9uXG4vLyBhcyBhICUgb2YgdGhlIHdpZHRoIG9mIHRoZSBwYXJlbnQgZWxlbWVudCBmcm9tIHRoZSBsZWZ0IGhhbmQgc2lkZSBvZiB0aGVcbi8vIHBhcmVudCBlbGVtZW50LiBUaGUgYGFmdGVyYCB2YWx1ZSBpcyBqdXN0IDEwMC1iZWZvcmUuXG5leHBvcnQgaW50ZXJmYWNlIERpdmlkZXJNb3ZlUmVzdWx0IHtcbiAgYmVmb3JlOiBudW1iZXI7XG4gIGFmdGVyOiBudW1iZXI7XG59XG5cbmV4cG9ydCB0eXBlIERpdmlkZXJUeXBlID0gXCJjb2x1bW5cIiB8IFwicm93XCI7XG5cbmV4cG9ydCBjb25zdCBESVZJREVSX01PVkVfRVZFTlQgPSBcImRpdmlkZXJfbW92ZVwiO1xuXG5leHBvcnQgY29uc3QgUkVTSVpJTkdfQ0xBU1MgPSBcInJlc2l6aW5nXCI7XG5cbmludGVyZmFjZSBSZWN0IHtcbiAgdG9wOiBudW1iZXI7XG4gIGxlZnQ6IG51bWJlcjtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG59XG5cbi8qKiBSZXR1cm5zIGEgYm91bmRpbmcgcmVjdGFuZ2xlIGZvciBhbiBlbGVtZW50IGluIFBhZ2UgY29vcmRpbmF0ZXMsIGFzIG9wcG9zZWRcbiAqIHRvIFZpZXdQb3J0IGNvb3JkaW5hdGVzLCB3aGljaCBpcyB3aGF0IGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIHJldHVybnMuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQYWdlUmVjdCA9IChlbGU6IEhUTUxFbGVtZW50KTogUmVjdCA9PiB7XG4gIGNvbnN0IHZpZXdwb3J0UmVjdCA9IGVsZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgcmV0dXJuIHtcbiAgICB0b3A6IHZpZXdwb3J0UmVjdC50b3AgKyB3aW5kb3cuc2Nyb2xsWSxcbiAgICBsZWZ0OiB2aWV3cG9ydFJlY3QubGVmdCArIHdpbmRvdy5zY3JvbGxYLFxuICAgIHdpZHRoOiB2aWV3cG9ydFJlY3Qud2lkdGgsXG4gICAgaGVpZ2h0OiB2aWV3cG9ydFJlY3QuaGVpZ2h0LFxuICB9O1xufTtcblxuLyoqIERpdmlkZXJNb3ZlIGlzIGNvcmUgZnVuY3Rpb25hbGl0eSBmb3IgY3JlYXRpbmcgZHJhZ2dhYmxlIGRpdmlkZXJzIGJldHdlZW5cbiAqIGVsZW1lbnRzIG9uIGEgcGFnZS5cbiAqXG4gKiBDb25zdHJ1Y3QgYSBEaXZpZGVyTW9kZSB3aXRoIGEgcGFyZW50IGVsZW1lbnQgYW5kIGEgZGl2aWRlciBlbGVtZW50LCB3aGVyZVxuICogdGhlIGRpdmlkZXIgZWxlbWVudCBpcyB0aGUgZWxlbWVudCBiZXR3ZWVuIG90aGVyIHBhZ2UgZWxlbWVudHMgdGhhdCBpc1xuICogZXhwZWN0ZWQgdG8gYmUgZHJhZ2dlZC4gRm9yIGV4YW1wbGUsIGluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSAjY29udGFpbmVyXG4gKiB3b3VsZCBiZSB0aGUgYHBhcmVudGAsIGFuZCAjZGl2aWRlciB3b3VsZCBiZSB0aGUgYGRpdmlkZXJgIGVsZW1lbnQuXG4gKlxuICogIDxkaXYgaWQ9Y29udGFpbmVyPlxuICogICAgPGRpdiBpZD1sZWZ0PjwvZGl2PiAgPGRpdiBpZD1kaXZpZGVyPjwvZGl2PiA8ZGl2IGlkPXJpZ2h0PjwvZGl2P1xuICogIDwvZGl2PlxuICpcbiAqIERpdmlkZXJNb2RlIHdhaXRzIGZvciBhIG1vdXNlZG93biBldmVudCBvbiB0aGUgYGRpdmlkZXJgIGVsZW1lbnQgYW5kIHRoZW5cbiAqIHdhdGNoZXMgbW91c2UgZXZlbnRzIGZvciB0aGUgZ2l2ZW4gcGFyZW50IEhUTUxFbGVtZW50IGFuZCBlbWl0cyBldmVudHMgYXJvdW5kXG4gKiBkcmFnZ2luZy5cbiAqXG4gKiBUaGUgZW1pdHRlZCBldmVudCBpcyBcImRpdmlkZXJfbW92ZVwiIGFuZCBpcyBhIEN1c3RvbUV2ZW50PERpdmlkZXJNb3ZlUmVzdWx0Pi5cbiAqXG4gKiBJdCBpcyB1cCB0byB0aGUgdXNlciBvZiBEaXZpZGVyTW92ZSB0byBsaXN0ZW4gZm9yIHRoZSBcImRpdmlkZXJfbW92ZVwiIGV2ZW50c1xuICogYW5kIHVwZGF0ZSB0aGUgQ1NTIG9mIHRoZSBwYWdlIGFwcHJvcHJpYXRlbHkgdG8gcmVmbGVjdCB0aGUgcG9zaXRpb24gb2YgdGhlXG4gKiBkaXZpZGVyLlxuICpcbiAqIE9uY2UgdGhlIG1vdXNlIGlzIGRvd24gYW4gZXZlbnQgd2lsbCBiZSBlbWl0dGVkIHBlcmlvZGljYWxseSBhcyB0aGUgbW91c2VcbiAqIG1vdmVzLlxuICpcbiAqIE9uY2UgdGhlIG1vdXNlIGlzIHJlbGVhc2VkLCBvciBpZiB0aGUgbW91c2UgZXhpdHMgdGhlIHBhcmVudCBIVE1MRWxlbWVudCwgb25lXG4gKiBsYXN0IGV2ZW50IGlzIGVtaXR0ZWQuXG4gKlxuICogV2hpbGUgZHJhZ2dpbmcgdGhlIGRpdmlkZXIsIHRoZSBcInJlc2l6aW5nXCIgY2xhc3Mgd2lsbCBiZSBhZGRlZCB0byB0aGUgcGFyZW50XG4gKiBlbGVtZW50LiBUaGlzIGNhbiBiZSB1c2VkIHRvIHNldCBhIHN0eWxlLCBlLmcuICd1c2VyLXNlbGVjdDogbm9uZScuXG4gKi9cbmV4cG9ydCBjbGFzcyBEaXZpZGVyTW92ZSB7XG4gIC8qKiBUaGUgcG9pbnQgd2hlcmUgZHJhZ2dpbmcgc3RhcnRlZCwgaW4gUGFnZSBjb29yZGluYXRlcy4gKi9cbiAgYmVnaW46IFBvaW50IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBkaW1lbnNpb25zIG9mIHRoZSBwYXJlbnQgZWxlbWVudCBpbiBQYWdlIGNvb3JkaW5hdGVzIGFzIG9mIG1vdXNlZG93blxuICAgKiBvbiB0aGUgZGl2aWRlci4uICovXG4gIHBhcmVudFJlY3Q6IFJlY3QgfCBudWxsID0gbnVsbDtcblxuICAvKiogVGhlIGN1cnJlbnQgbW91c2UgcG9zaXRpb24gaW4gUGFnZSBjb29yZGluYXRlcy4gKi9cbiAgY3VycmVudE1vdmVMb2NhdGlvbjogUG9pbnQgPSBwdCgwLCAwKTtcblxuICAvKiogVGhlIGxhc3QgbW91c2UgcG9zaXRpb24gaW4gUGFnZSBjb29yZGluYXRlcyByZXBvcnRlZCB2aWEgQ3VzdG9tRXZlbnQuICovXG4gIGxhc3RNb3ZlU2VudDogUG9pbnQgPSBwdCgwLCAwKTtcblxuICAvKiogVGhlIHBhcmVudCBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIGRpdmlkZXIuICovXG4gIHBhcmVudDogSFRNTEVsZW1lbnQ7XG5cbiAgLyoqIFRoZSBkaXZpZGVyIGVsZW1lbnQgdG8gYmUgZHJhZ2dlZCBhY3Jvc3MgdGhlIHBhcmVudCBlbGVtZW50LiAqL1xuICBkaXZpZGVyOiBIVE1MRWxlbWVudDtcblxuICAvKiogVGhlIGhhbmRsZSBvZiB0aGUgd2luZG93LnNldEludGVydmFsKCkuICovXG4gIGludGVybnZhbEhhbmRsZTogbnVtYmVyID0gMDtcblxuICAvKiogVGhlIHR5cGUgb2YgZGl2aWRlciwgZWl0aGVyIHZlcnRpY2FsIChcImNvbHVtblwiKSwgb3IgaG9yaXpvbnRhbCAoXCJyb3dcIikuICovXG4gIGRpdmlkZXJUeXBlOiBEaXZpZGVyVHlwZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwYXJlbnQ6IEhUTUxFbGVtZW50LFxuICAgIGRpdmlkZXI6IEhUTUxFbGVtZW50LFxuICAgIGRpdmlkZXJUeXBlOiBEaXZpZGVyVHlwZSA9IFwiY29sdW1uXCJcbiAgKSB7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5kaXZpZGVyID0gZGl2aWRlcjtcbiAgICB0aGlzLmRpdmlkZXJUeXBlID0gZGl2aWRlclR5cGU7XG4gICAgdGhpcy5kaXZpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXRhY2goKSB7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmRpdmlkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcbiAgfVxuXG4gIG9uVGltZW91dCgpIHtcbiAgICBpZiAoIWVxdWFsKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiwgdGhpcy5sYXN0TW92ZVNlbnQpKSB7XG4gICAgICBsZXQgZGlmZlBlcmNlbnQ6IG51bWJlciA9IDA7XG4gICAgICBpZiAodGhpcy5kaXZpZGVyVHlwZSA9PT0gXCJjb2x1bW5cIikge1xuICAgICAgICBkaWZmUGVyY2VudCA9XG4gICAgICAgICAgKDEwMCAqICh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCAtIHRoaXMucGFyZW50UmVjdCEubGVmdCkpIC9cbiAgICAgICAgICB0aGlzLnBhcmVudFJlY3QhLndpZHRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlmZlBlcmNlbnQgPVxuICAgICAgICAgICgxMDAgKiAodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnkgLSB0aGlzLnBhcmVudFJlY3QhLnRvcCkpIC9cbiAgICAgICAgICB0aGlzLnBhcmVudFJlY3QhLmhlaWdodDtcbiAgICAgIH1cbiAgICAgIC8vIFRPRE8gLSBTaG91bGQgY2xhbXAgYmUgc2V0dGFibGUgaW4gdGhlIGNvbnN0cnVjdG9yP1xuICAgICAgZGlmZlBlcmNlbnQgPSBjbGFtcChkaWZmUGVyY2VudCwgNSwgOTUpO1xuXG4gICAgICB0aGlzLnBhcmVudC5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQ8RGl2aWRlck1vdmVSZXN1bHQ+KERJVklERVJfTU9WRV9FVkVOVCwge1xuICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgYmVmb3JlOiBkaWZmUGVyY2VudCxcbiAgICAgICAgICAgIGFmdGVyOiAxMDAgLSBkaWZmUGVyY2VudCxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHRoaXMubGFzdE1vdmVTZW50ID0gZHVwKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgbW91c2Vtb3ZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCA9IGUucGFnZVg7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnkgPSBlLnBhZ2VZO1xuICB9XG5cbiAgbW91c2Vkb3duKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmludGVybnZhbEhhbmRsZSA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLm9uVGltZW91dC5iaW5kKHRoaXMpLCAxNik7XG4gICAgdGhpcy5wYXJlbnRSZWN0ID0gZ2V0UGFnZVJlY3QodGhpcy5wYXJlbnQpO1xuXG4gICAgdGhpcy5wYXJlbnQuY2xhc3NMaXN0LmFkZChSRVNJWklOR19DTEFTUyk7XG5cbiAgICB0aGlzLnBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmJlZ2luID0gcHQoZS5wYWdlWCwgZS5wYWdlWSk7XG4gIH1cblxuICBtb3VzZXVwKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZpbmlzaGVkKHB0KGUucGFnZVgsIGUucGFnZVkpKTtcbiAgfVxuXG4gIG1vdXNlbGVhdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZmluaXNoZWQocHQoZS5wYWdlWCwgZS5wYWdlWSkpO1xuICB9XG5cbiAgZmluaXNoZWQoZW5kOiBQb2ludCkge1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcblxuICAgIHRoaXMucGFyZW50LmNsYXNzTGlzdC5yZW1vdmUoUkVTSVpJTkdfQ0xBU1MpO1xuXG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gZW5kO1xuICAgIHRoaXMub25UaW1lb3V0KCk7XG4gICAgdGhpcy5iZWdpbiA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gcHQoMCwgMCk7XG4gICAgdGhpcy5sYXN0TW92ZVNlbnQgPSBwdCgwLCAwKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IFBvaW50LCBkdXAsIGVxdWFsLCBwdCB9IGZyb20gXCIuLi8uLi9wb2ludC9wb2ludC50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYWdSYW5nZSB7XG4gIGJlZ2luOiBQb2ludDtcbiAgZW5kOiBQb2ludDtcbn1cblxuZXhwb3J0IGNvbnN0IERSQUdfUkFOR0VfRVZFTlQgPSBcImRyYWdyYW5nZVwiO1xuXG4vKiogTW91c2VNb3ZlIHdhdGNoZXMgbW91c2UgZXZlbnRzIGZvciBhIGdpdmVuIEhUTUxFbGVtZW50IGFuZCBlbWl0c1xuICogZXZlbnRzIGFyb3VuZCBkcmFnZ2luZy5cbiAqXG4gKiBUaGUgZW1pdHRlZCBldmVudCBpcyBcImRyYWdyYW5nZVwiIGFuZCBpcyBhIEN1c3RvbUV2ZW50PERyYWdSYW5nZT4uXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcHJlc3NlZCBkb3duIGluIHRoZSBIVE1MRWxlbWVudCBhbiBldmVudCB3aWxsIGJlXG4gKiBlbWl0dGVkIHBlcmlvZGljYWxseSBhcyB0aGUgbW91c2UgbW92ZXMuXG4gKlxuICogT25jZSB0aGUgbW91c2UgaXMgcmVsZWFzZWQsIG9yIGV4aXRzIHRoZSBIVE1MRWxlbWVudCBvbmUgbGFzdCBldmVudFxuICogaXMgZW1pdHRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vdXNlRHJhZyB7XG4gIGJlZ2luOiBQb2ludCB8IG51bGwgPSBudWxsO1xuICBjdXJyZW50TW92ZUxvY2F0aW9uOiBQb2ludCA9IHB0KDAsIDApO1xuICBsYXN0TW92ZVNlbnQ6IFBvaW50ID0gcHQoMCwgMCk7XG4gIGVsZTogSFRNTEVsZW1lbnQ7XG4gIGludGVybnZhbEhhbmRsZTogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihlbGU6IEhUTUxFbGVtZW50KSB7XG4gICAgdGhpcy5lbGUgPSBlbGU7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZGV0YWNoKCkge1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcbiAgfVxuXG4gIG9uVGltZW91dCgpIHtcbiAgICBpZiAoIWVxdWFsKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiwgdGhpcy5sYXN0TW92ZVNlbnQpKSB7XG4gICAgICB0aGlzLmVsZS5kaXNwYXRjaEV2ZW50KFxuICAgICAgICBuZXcgQ3VzdG9tRXZlbnQ8RHJhZ1JhbmdlPihEUkFHX1JBTkdFX0VWRU5ULCB7XG4gICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICBiZWdpbjogZHVwKHRoaXMuYmVnaW4hKSxcbiAgICAgICAgICAgIGVuZDogZHVwKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICB0aGlzLmxhc3RNb3ZlU2VudCA9IGR1cCh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIG1vdXNlbW92ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnggPSBlLm9mZnNldFg7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnkgPSBlLm9mZnNldFk7XG4gIH1cblxuICBtb3VzZWRvd24oZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuaW50ZXJudmFsSGFuZGxlID0gd2luZG93LnNldEludGVydmFsKHRoaXMub25UaW1lb3V0LmJpbmQodGhpcyksIDE2KTtcbiAgICB0aGlzLmJlZ2luID0gcHQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICB9XG5cbiAgbW91c2V1cChlOiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5maW5pc2hlZChwdChlLm9mZnNldFgsIGUub2Zmc2V0WSkpO1xuICB9XG5cbiAgbW91c2VsZWF2ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maW5pc2hlZChwdChlLm9mZnNldFgsIGUub2Zmc2V0WSkpO1xuICB9XG5cbiAgZmluaXNoZWQoZW5kOiBQb2ludCkge1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBlbmQ7XG4gICAgdGhpcy5vblRpbWVvdXQoKTtcbiAgICB0aGlzLmJlZ2luID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24gPSBwdCgwLCAwKTtcbiAgICB0aGlzLmxhc3RNb3ZlU2VudCA9IHB0KDAsIDApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgUG9pbnQsIGR1cCwgZXF1YWwsIHB0IH0gZnJvbSBcIi4uLy4uL3BvaW50L3BvaW50LnRzXCI7XG5cbi8qKiBNb3VzZU1vdmUgd2F0Y2hlcyBtb3VzZSBldmVudHMgZm9yIGEgZ2l2ZW4gSFRNTEVsZW1lbnQgYW5kIHJlY29yZHMgdGhlIG1vc3RcbiAqICByZWNlbnQgbG9jYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBNb3VzZU1vdmUge1xuICBjdXJyZW50TW92ZUxvY2F0aW9uOiBQb2ludCA9IHB0KDAsIDApO1xuICBsYXN0UmVhZExvY2F0aW9uOiBQb2ludCA9IHB0KDAsIDApO1xuICBlbGU6IEhUTUxFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKGVsZTogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZSA9IGVsZTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGRldGFjaCgpIHtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgbW91c2Vtb3ZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCA9IGUub2Zmc2V0WDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSA9IGUub2Zmc2V0WTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIGEgUG9pbnQgaWYgdGhlIG1vdXNlIGhhZCBtb3ZlZCBzaW5jZSB0aGUgbGFzdCByZWFkLCBvdGhlcndpc2VcbiAgICogcmV0dXJucyBudWxsLlxuICAgKi9cbiAgcmVhZExvY2F0aW9uKCk6IFBvaW50IHwgbnVsbCB7XG4gICAgaWYgKGVxdWFsKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiwgdGhpcy5sYXN0UmVhZExvY2F0aW9uKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRoaXMubGFzdFJlYWRMb2NhdGlvbiA9IGR1cCh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24pO1xuICAgIHJldHVybiBkdXAodGhpcy5sYXN0UmVhZExvY2F0aW9uKTtcbiAgfVxufVxuIiwgImV4cG9ydCBjb25zdCBNSU5fRElTUExBWV9SQU5HRSA9IDc7XG5cbi8qKiBSZXByZXNlbnRzIGEgcmFuZ2Ugb2YgZGF5cyBvdmVyIHdoaWNoIHRvIGRpc3BsYXkgYSB6b29tZWQgaW4gdmlldywgdXNpbmdcbiAqIHRoZSBoYWxmLW9wZW4gaW50ZXJ2YWwgW2JlZ2luLCBlbmQpLlxuICovXG5leHBvcnQgY2xhc3MgRGlzcGxheVJhbmdlIHtcbiAgcHJpdmF0ZSBfYmVnaW46IG51bWJlcjtcbiAgcHJpdmF0ZSBfZW5kOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoYmVnaW46IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgICB0aGlzLl9iZWdpbiA9IGJlZ2luO1xuICAgIHRoaXMuX2VuZCA9IGVuZDtcbiAgICBpZiAodGhpcy5fYmVnaW4gPiB0aGlzLl9lbmQpIHtcbiAgICAgIFt0aGlzLl9lbmQsIHRoaXMuX2JlZ2luXSA9IFt0aGlzLl9iZWdpbiwgdGhpcy5fZW5kXTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2VuZCAtIHRoaXMuX2JlZ2luIDwgTUlOX0RJU1BMQVlfUkFOR0UpIHtcbiAgICAgIHRoaXMuX2VuZCA9IHRoaXMuX2JlZ2luICsgTUlOX0RJU1BMQVlfUkFOR0U7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGluKHg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB4ID49IHRoaXMuX2JlZ2luICYmIHggPD0gdGhpcy5fZW5kO1xuICB9XG5cbiAgcHVibGljIGdldCBiZWdpbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9iZWdpbjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW5kKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcmFuZ2VJbkRheXMoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZW5kIC0gdGhpcy5fYmVnaW47XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIEVkZ2VzIH0gZnJvbSBcIi4uLy4uL2RhZy9kYWdcIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBTcGFuIH0gZnJvbSBcIi4uLy4uL3NsYWNrL3NsYWNrXCI7XG5pbXBvcnQgeyBDaGFydCwgQ2hhcnRWYWxpZGF0ZSwgVGFzaywgVGFza3MgfSBmcm9tIFwiLi4vY2hhcnRcIjtcblxuZXhwb3J0IGludGVyZmFjZSBDaGFydExpa2Uge1xuICBWZXJ0aWNlczogVGFza3M7XG4gIEVkZ2VzOiBFZGdlcztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGaWx0ZXJSZXN1bHQge1xuICBjaGFydExpa2U6IENoYXJ0TGlrZTtcbiAgZGlzcGxheU9yZGVyOiBudW1iZXJbXTtcbiAgZW1waGFzaXplZFRhc2tzOiBudW1iZXJbXTtcbiAgc3BhbnM6IFNwYW5bXTtcbiAgbGFiZWxzOiBzdHJpbmdbXTtcbiAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj47XG4gIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4OiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuICBzZWxlY3RlZFRhc2tJbmRleDogbnVtYmVyO1xufVxuXG4vKiogVXNlZCBmb3IgZmlsdGVyaW5nIHRhc2tzLCByZXR1cm5zIFRydWUgaWYgdGhlIHRhc2sgaXMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlXG4gKiBmaWx0ZXJlZCByZXN1bHRzLiAqL1xuZXhwb3J0IHR5cGUgRmlsdGVyRnVuYyA9ICh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiBib29sZWFuO1xuXG4vKiogRmlsdGVycyB0aGUgY29udGVudHMgb2YgdGhlIENoYXJ0IGJhc2VkIG9uIHRoZSBmaWx0ZXJGdW5jLlxuICpcbiAqIHNlbGVjdGVkVGFza0luZGV4IHdpbGwgYmUgcmV0dXJuZWQgYXMgLTEgaWYgdGhlIHNlbGVjdGVkIHRhc2sgZ2V0cyBmaWx0ZXJlZFxuICogb3V0LlxuICovXG5leHBvcnQgY29uc3QgZmlsdGVyID0gKFxuICBjaGFydDogQ2hhcnQsXG4gIGZpbHRlckZ1bmM6IEZpbHRlckZ1bmMgfCBudWxsLFxuICBlbXBoYXNpemVkVGFza3M6IG51bWJlcltdLFxuICBzcGFuczogU3BhbltdLFxuICBsYWJlbHM6IHN0cmluZ1tdLFxuICBzZWxlY3RlZFRhc2tJbmRleDogbnVtYmVyXG4pOiBSZXN1bHQ8RmlsdGVyUmVzdWx0PiA9PiB7XG4gIGNvbnN0IHZyZXQgPSBDaGFydFZhbGlkYXRlKGNoYXJ0KTtcbiAgaWYgKCF2cmV0Lm9rKSB7XG4gICAgcmV0dXJuIHZyZXQ7XG4gIH1cbiAgY29uc3QgdG9wb2xvZ2ljYWxPcmRlciA9IHZyZXQudmFsdWU7XG4gIGlmIChmaWx0ZXJGdW5jID09PSBudWxsKSB7XG4gICAgY29uc3QgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXguc2V0KGluZGV4LCBpbmRleCk7XG4gICAgfVxuICAgIHJldHVybiBvayh7XG4gICAgICBjaGFydExpa2U6IGNoYXJ0LFxuICAgICAgZGlzcGxheU9yZGVyOiB2cmV0LnZhbHVlLFxuICAgICAgZW1waGFzaXplZFRhc2tzOiBlbXBoYXNpemVkVGFza3MsXG4gICAgICBzcGFuczogc3BhbnMsXG4gICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4OiBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleCxcbiAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4OiBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleCxcbiAgICAgIHNlbGVjdGVkVGFza0luZGV4LFxuICAgIH0pO1xuICB9XG4gIGNvbnN0IHRhc2tzOiBUYXNrcyA9IFtdO1xuICBjb25zdCBlZGdlczogRWRnZXMgPSBbXTtcbiAgY29uc3QgZGlzcGxheU9yZGVyOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBmaWx0ZXJlZFNwYW5zOiBTcGFuW10gPSBbXTtcbiAgY29uc3QgZmlsdGVyZWRMYWJlbHM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4OiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuICBjb25zdCBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG5cbiAgLy8gRmlyc3QgZmlsdGVyIHRoZSB0YXNrcy5cbiAgY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgb3JpZ2luYWxJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKGZpbHRlckZ1bmModGFzaywgb3JpZ2luYWxJbmRleCkpIHtcbiAgICAgIHRhc2tzLnB1c2godGFzayk7XG4gICAgICBmaWx0ZXJlZFNwYW5zLnB1c2goc3BhbnNbb3JpZ2luYWxJbmRleF0pO1xuICAgICAgZmlsdGVyZWRMYWJlbHMucHVzaChsYWJlbHNbb3JpZ2luYWxJbmRleF0pO1xuICAgICAgY29uc3QgbmV3SW5kZXggPSB0YXNrcy5sZW5ndGggLSAxO1xuICAgICAgZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LnNldChvcmlnaW5hbEluZGV4LCBuZXdJbmRleCk7XG4gICAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleC5zZXQobmV3SW5kZXgsIG9yaWdpbmFsSW5kZXgpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gTm93IGZpbHRlciB0aGUgZWRnZXMgd2hpbGUgYWxzbyByZXdyaXRpbmcgdGhlbS5cbiAgY2hhcnQuRWRnZXMuZm9yRWFjaCgoZGlyZWN0ZWRFZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBpZiAoXG4gICAgICAhZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmhhcyhkaXJlY3RlZEVkZ2UuaSkgfHxcbiAgICAgICFmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguaGFzKGRpcmVjdGVkRWRnZS5qKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlZGdlcy5wdXNoKFxuICAgICAgbmV3IERpcmVjdGVkRWRnZShcbiAgICAgICAgZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChkaXJlY3RlZEVkZ2UuaSksXG4gICAgICAgIGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5nZXQoZGlyZWN0ZWRFZGdlLmopXG4gICAgICApXG4gICAgKTtcbiAgfSk7XG5cbiAgLy8gTm93IGZpbHRlciBhbmQgcmVpbmRleCB0aGUgdG9wb2xvZ2ljYWwvZGlzcGxheSBvcmRlci5cbiAgdG9wb2xvZ2ljYWxPcmRlci5mb3JFYWNoKChvcmlnaW5hbFRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzazogVGFzayA9IGNoYXJ0LlZlcnRpY2VzW29yaWdpbmFsVGFza0luZGV4XTtcbiAgICBpZiAoIWZpbHRlckZ1bmModGFzaywgb3JpZ2luYWxUYXNrSW5kZXgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRpc3BsYXlPcmRlci5wdXNoKGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5nZXQob3JpZ2luYWxUYXNrSW5kZXgpISk7XG4gIH0pO1xuXG4gIC8vIFJlLWluZGV4IGhpZ2hsaWdodGVkIHRhc2tzLlxuICBjb25zdCB1cGRhdGVkRW1waGFzaXplZFRhc2tzID0gZW1waGFzaXplZFRhc2tzLm1hcChcbiAgICAob3JpZ2luYWxUYXNrSW5kZXg6IG51bWJlcik6IG51bWJlciA9PlxuICAgICAgZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChvcmlnaW5hbFRhc2tJbmRleCkhXG4gICk7XG5cbiAgcmV0dXJuIG9rKHtcbiAgICBjaGFydExpa2U6IHtcbiAgICAgIEVkZ2VzOiBlZGdlcyxcbiAgICAgIFZlcnRpY2VzOiB0YXNrcyxcbiAgICB9LFxuICAgIGRpc3BsYXlPcmRlcjogZGlzcGxheU9yZGVyLFxuICAgIGVtcGhhc2l6ZWRUYXNrczogdXBkYXRlZEVtcGhhc2l6ZWRUYXNrcyxcbiAgICBzcGFuczogZmlsdGVyZWRTcGFucyxcbiAgICBsYWJlbHM6IGZpbHRlcmVkTGFiZWxzLFxuICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4OiBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleCxcbiAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleDogZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LFxuICAgIHNlbGVjdGVkVGFza0luZGV4OiBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KHNlbGVjdGVkVGFza0luZGV4KSB8fCAtMSxcbiAgfSk7XG59O1xuIiwgImltcG9ydCB7IGNsYW1wIH0gZnJvbSBcIi4uLy4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFJlbmRlck9wdGlvbnMgfSBmcm9tIFwiLi4vcmVuZGVyZXIudHNcIjtcbmltcG9ydCB7IFBvaW50LCBhZGQsIHB0IH0gZnJvbSBcIi4uLy4uL3BvaW50L3BvaW50LnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF5Um93IHtcbiAgZGF5OiBudW1iZXI7XG4gIHJvdzogbnVtYmVyO1xufVxuXG4vKiogRmVhdHVyZXMgb2YgdGhlIGNoYXJ0IHdlIGNhbiBhc2sgZm9yIGNvb3JkaW5hdGVzIG9mLCB3aGVyZSB0aGUgdmFsdWUgcmV0dXJuZWQgaXNcbiAqIHRoZSB0b3AgbGVmdCBjb29yZGluYXRlIG9mIHRoZSBmZWF0dXJlLlxuICovXG5leHBvcnQgZW51bSBGZWF0dXJlIHtcbiAgdGFza0xpbmVTdGFydCxcbiAgdGV4dFN0YXJ0LFxuICBncm91cFRleHRTdGFydCxcbiAgcGVyY2VudFN0YXJ0LFxuICB2ZXJ0aWNhbEFycm93RGVzdFRvcCxcbiAgdmVydGljYWxBcnJvd0Rlc3RCb3R0b20sXG4gIGhvcml6b250YWxBcnJvd0Rlc3QsXG4gIHZlcnRpY2FsQXJyb3dTdGFydCxcbiAgaG9yaXpvbnRhbEFycm93U3RhcnQsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVUb3AsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVCb3R0b20sXG4gIGhvcml6b250YWxBcnJvd0Rlc3RUb01pbGVzdG9uZSxcbiAgdmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcCxcbiAgdmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZUJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lLFxuICBncm91cEVudmVsb3BlU3RhcnQsXG4gIHRhc2tFbnZlbG9wZVRvcCxcblxuICBkaXNwbGF5UmFuZ2VUb3AsXG4gIHRhc2tSb3dCb3R0b20sXG5cbiAgdGltZU1hcmtTdGFydCxcbiAgdGltZU1hcmtFbmQsXG4gIHRpbWVUZXh0U3RhcnQsXG5cbiAgZ3JvdXBUaXRsZVRleHRTdGFydCxcblxuICB0YXNrc0NsaXBSZWN0T3JpZ2luLFxuICBncm91cEJ5T3JpZ2luLFxufVxuXG4vKiogU2l6ZXMgb2YgZmVhdHVyZXMgb2YgYSByZW5kZXJlZCBjaGFydC4gKi9cbmV4cG9ydCBlbnVtIE1ldHJpYyB7XG4gIHRhc2tMaW5lSGVpZ2h0LFxuICBwZXJjZW50SGVpZ2h0LFxuICBhcnJvd0hlYWRIZWlnaHQsXG4gIGFycm93SGVhZFdpZHRoLFxuICBtaWxlc3RvbmVEaWFtZXRlcixcbiAgbGluZURhc2hMaW5lLFxuICBsaW5lRGFzaEdhcCxcbiAgdGV4dFhPZmZzZXQsXG4gIG1pblRhc2tXaWR0aFB4LFxuICByb3dIZWlnaHQsXG59XG5cbi8qKiBNYWtlcyBhIG51bWJlciBvZGQsIGFkZHMgb25lIGlmIGV2ZW4uICovXG5jb25zdCBtYWtlT2RkID0gKG46IG51bWJlcik6IG51bWJlciA9PiB7XG4gIGlmIChuICUgMiA9PT0gMCkge1xuICAgIHJldHVybiBuICsgMTtcbiAgfVxuICByZXR1cm4gbjtcbn07XG5cbi8qKiBTY2FsZSBjb25zb2xpZGF0ZXMgYWxsIGNhbGN1bGF0aW9ucyBhcm91bmQgcmVuZGVyaW5nIGEgY2hhcnQgb250byBhIHN1cmZhY2UuICovXG5leHBvcnQgY2xhc3MgU2NhbGUge1xuICBwcml2YXRlIGRheVdpZHRoUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSByb3dIZWlnaHRQeDogbnVtYmVyO1xuICBwcml2YXRlIGJsb2NrU2l6ZVB4OiBudW1iZXI7XG4gIHByaXZhdGUgdGFza0hlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgbGluZVdpZHRoUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBtYXJnaW5TaXplUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSB0aW1lbGluZUhlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgb3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSB0b3RhbE51bWJlck9mRGF5czogbnVtYmVyO1xuICBwcml2YXRlIGdyb3VwQnlDb2x1bW5XaWR0aFB4OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSB0aW1lbGluZU9yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgdGFza3NPcmlnaW46IFBvaW50O1xuICBwcml2YXRlIGdyb3VwQnlPcmlnaW46IFBvaW50O1xuICBwcml2YXRlIHRhc2tzQ2xpcFJlY3RPcmlnaW46IFBvaW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gICAgY2FudmFzV2lkdGhQeDogbnVtYmVyLFxuICAgIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXIsXG4gICAgbWF4R3JvdXBOYW1lTGVuZ3RoOiBudW1iZXIgPSAwXG4gICkge1xuICAgIHRoaXMudG90YWxOdW1iZXJPZkRheXMgPSB0b3RhbE51bWJlck9mRGF5cztcbiAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4ID0gbWF4R3JvdXBOYW1lTGVuZ3RoICogb3B0cy5mb250U2l6ZVB4O1xuXG4gICAgdGhpcy5ibG9ja1NpemVQeCA9IE1hdGguZmxvb3Iob3B0cy5mb250U2l6ZVB4IC8gMyk7XG4gICAgdGhpcy50YXNrSGVpZ2h0UHggPSBtYWtlT2RkKE1hdGguZmxvb3IoKHRoaXMuYmxvY2tTaXplUHggKiAzKSAvIDQpKTtcbiAgICB0aGlzLmxpbmVXaWR0aFB4ID0gbWFrZU9kZChNYXRoLmZsb29yKHRoaXMudGFza0hlaWdodFB4IC8gMykpO1xuICAgIGNvbnN0IG1pbGVzdG9uZVJhZGl1cyA9IE1hdGguY2VpbCh0aGlzLnRhc2tIZWlnaHRQeCAvIDIpICsgdGhpcy5saW5lV2lkdGhQeDtcbiAgICB0aGlzLm1hcmdpblNpemVQeCA9IG1pbGVzdG9uZVJhZGl1cztcbiAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHggPSBvcHRzLmhhc1RpbWVsaW5lXG4gICAgICA/IE1hdGguY2VpbCgob3B0cy5mb250U2l6ZVB4ICogNCkgLyAzKVxuICAgICAgOiAwO1xuXG4gICAgdGhpcy50aW1lbGluZU9yaWdpbiA9IHB0KG1pbGVzdG9uZVJhZGl1cywgMCk7XG4gICAgdGhpcy5ncm91cEJ5T3JpZ2luID0gcHQoMCwgbWlsZXN0b25lUmFkaXVzICsgdGhpcy50aW1lbGluZUhlaWdodFB4KTtcblxuICAgIGxldCBiZWdpbk9mZnNldCA9IDA7XG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlID09PSBudWxsIHx8IG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwiaGlnaGxpZ2h0XCIpIHtcbiAgICAgIC8vIERvIG5vdCBmb3JjZSBkYXlXaWR0aFB4IHRvIGFuIGludGVnZXIsIGl0IGNvdWxkIGdvIHRvIDAgYW5kIGNhdXNlIGFsbFxuICAgICAgLy8gdGFza3MgdG8gYmUgcmVuZGVyZWQgYXQgMCB3aWR0aC5cbiAgICAgIHRoaXMuZGF5V2lkdGhQeCA9XG4gICAgICAgIChjYW52YXNXaWR0aFB4IC0gdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIDIgKiB0aGlzLm1hcmdpblNpemVQeCkgL1xuICAgICAgICB0b3RhbE51bWJlck9mRGF5cztcbiAgICAgIHRoaXMub3JpZ2luID0gcHQoMCwgMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNob3VsZCB3ZSBzZXQgeC1tYXJnaW5zIHRvIDAgaWYgYSBTdWJSYW5nZSBpcyByZXF1ZXN0ZWQ/XG4gICAgICAvLyBPciBzaG91bGQgd2UgdG90YWxseSBkcm9wIGFsbCBtYXJnaW5zIGZyb20gaGVyZSBhbmQganVzdCB1c2VcbiAgICAgIC8vIENTUyBtYXJnaW5zIG9uIHRoZSBjYW52YXMgZWxlbWVudD9cbiAgICAgIHRoaXMuZGF5V2lkdGhQeCA9XG4gICAgICAgIChjYW52YXNXaWR0aFB4IC0gdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCAtIDIgKiB0aGlzLm1hcmdpblNpemVQeCkgL1xuICAgICAgICBvcHRzLmRpc3BsYXlSYW5nZS5yYW5nZUluRGF5cztcbiAgICAgIGJlZ2luT2Zmc2V0ID0gTWF0aC5mbG9vcihcbiAgICAgICAgdGhpcy5kYXlXaWR0aFB4ICogb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4gKyB0aGlzLm1hcmdpblNpemVQeFxuICAgICAgKTtcbiAgICAgIHRoaXMub3JpZ2luID0gcHQoLWJlZ2luT2Zmc2V0ICsgdGhpcy5tYXJnaW5TaXplUHgsIDApO1xuICAgIH1cblxuICAgIHRoaXMudGFza3NPcmlnaW4gPSBwdChcbiAgICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggLSBiZWdpbk9mZnNldCArIG1pbGVzdG9uZVJhZGl1cyxcbiAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCArIG1pbGVzdG9uZVJhZGl1c1xuICAgICk7XG5cbiAgICB0aGlzLnRhc2tzQ2xpcFJlY3RPcmlnaW4gPSBwdChcbiAgICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHgsXG4gICAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHhcbiAgICApO1xuXG4gICAgaWYgKG9wdHMuaGFzVGV4dCkge1xuICAgICAgdGhpcy5yb3dIZWlnaHRQeCA9IDYgKiB0aGlzLmJsb2NrU2l6ZVB4OyAvLyBUaGlzIG1pZ2h0IGFsc28gYmUgYChjYW52YXNIZWlnaHRQeCAtIDIgKiBvcHRzLm1hcmdpblNpemVQeCkgLyBudW1iZXJTd2ltTGFuZXNgIGlmIGhlaWdodCBpcyBzdXBwbGllZD9cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yb3dIZWlnaHRQeCA9IDEuMSAqIHRoaXMuYmxvY2tTaXplUHg7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIGNoYXJ0LiBOb3RlIHRoYXQgaXQncyBub3QgY29uc3RyYWluZWQgYnkgdGhlIGNhbnZhcy4gKi9cbiAgcHVibGljIGhlaWdodChtYXhSb3dzOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiAoXG4gICAgICBtYXhSb3dzICogdGhpcy5yb3dIZWlnaHRQeCArIHRoaXMudGltZWxpbmVIZWlnaHRQeCArIDIgKiB0aGlzLm1hcmdpblNpemVQeFxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgZGF5Um93RnJvbVBvaW50KHBvaW50OiBQb2ludCk6IERheVJvdyB7XG4gICAgLy8gVGhpcyBzaG91bGQgYWxzbyBjbGFtcCB0aGUgcmV0dXJuZWQgJ3gnIHZhbHVlIHRvIFswLCBtYXhSb3dzKS5cbiAgICByZXR1cm4ge1xuICAgICAgZGF5OiBjbGFtcChcbiAgICAgICAgTWF0aC5mbG9vcihcbiAgICAgICAgICAod2luZG93LmRldmljZVBpeGVsUmF0aW8gKiBwb2ludC54IC1cbiAgICAgICAgICAgIHRoaXMub3JpZ2luLnggLVxuICAgICAgICAgICAgdGhpcy5tYXJnaW5TaXplUHggLVxuICAgICAgICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCkgL1xuICAgICAgICAgICAgdGhpcy5kYXlXaWR0aFB4XG4gICAgICAgICksXG4gICAgICAgIDAsXG4gICAgICAgIHRoaXMudG90YWxOdW1iZXJPZkRheXNcbiAgICAgICksXG4gICAgICByb3c6IE1hdGguZmxvb3IoXG4gICAgICAgICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAqIHBvaW50LnkgLVxuICAgICAgICAgIHRoaXMub3JpZ2luLnkgLVxuICAgICAgICAgIHRoaXMubWFyZ2luU2l6ZVB4IC1cbiAgICAgICAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHgpIC9cbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4XG4gICAgICApLFxuICAgIH07XG4gIH1cblxuICAvKiogVGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgYm91bmRpbmcgYm94IGZvciBhIHNpbmdsZSB0YXNrLiAqL1xuICBwcml2YXRlIHRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdzogbnVtYmVyLCBkYXk6IG51bWJlcik6IFBvaW50IHtcbiAgICByZXR1cm4gYWRkKHRoaXMub3JpZ2luLCBbXG4gICAgICBNYXRoLmZsb29yKFxuICAgICAgICBkYXkgKiB0aGlzLmRheVdpZHRoUHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHhcbiAgICAgICksXG4gICAgICBNYXRoLmZsb29yKFxuICAgICAgICByb3cgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLnRpbWVsaW5lSGVpZ2h0UHhcbiAgICAgICksXG4gICAgXSk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gIHByaXZhdGUgZ3JvdXBSb3dFbnZlbG9wZVN0YXJ0KHJvdzogbnVtYmVyLCBkYXk6IG51bWJlcik6IFBvaW50IHtcbiAgICByZXR1cm4gYWRkKHRoaXMuZ3JvdXBCeU9yaWdpbiwgW1xuICAgICAgMCxcbiAgICAgIHJvdyAqIHRoaXMucm93SGVpZ2h0UHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMudGltZWxpbmVIZWlnaHRQeCxcbiAgICBdKTtcbiAgfVxuXG4gIHByaXZhdGUgZ3JvdXBIZWFkZXJTdGFydCgpOiBQb2ludCB7XG4gICAgcmV0dXJuIGFkZCh0aGlzLm9yaWdpbiwgW3RoaXMubWFyZ2luU2l6ZVB4LCB0aGlzLm1hcmdpblNpemVQeF0pO1xuICB9XG5cbiAgcHJpdmF0ZSB0aW1lRW52ZWxvcGVTdGFydChkYXk6IG51bWJlcik6IFBvaW50IHtcbiAgICByZXR1cm4gYWRkKHRoaXMub3JpZ2luLCBbXG4gICAgICBkYXkgKiB0aGlzLmRheVdpZHRoUHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHgsXG4gICAgICAwLFxuICAgIF0pO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIGNvb3JkaW5hdGUgb2YgdGhlIGl0ZW0gKi9cbiAgZmVhdHVyZShyb3c6IG51bWJlciwgZGF5OiBudW1iZXIsIGNvb3JkOiBGZWF0dXJlKTogUG9pbnQge1xuICAgIHN3aXRjaCAoY29vcmQpIHtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrTGluZVN0YXJ0OlxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wOlxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydDpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KSwgW1xuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5yb3dIZWlnaHRQeCAtIHRoaXMuYmxvY2tTaXplUHgsXG4gICAgICAgIF0pO1xuXG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RCb3R0b206XG4gICAgICAgIHJldHVybiBhZGQodGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSksIFswLCB0aGlzLnJvd0hlaWdodFB4XSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gYWRkKHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLCBbXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeCxcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4LFxuICAgICAgICBdKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cFRleHRTdGFydDpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLmdyb3VwUm93RW52ZWxvcGVTdGFydChyb3csIGRheSksIFtcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4LFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHgsXG4gICAgICAgIF0pO1xuICAgICAgY2FzZSBGZWF0dXJlLnBlcmNlbnRTdGFydDpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KSwgW1xuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5yb3dIZWlnaHRQeCAtIHRoaXMubGluZVdpZHRoUHgsXG4gICAgICAgIF0pO1xuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3Q6XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnQ6XG4gICAgICAgIHJldHVybiBhZGQodGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSksIFtcbiAgICAgICAgICAwLFxuICAgICAgICAgIE1hdGguZmxvb3IodGhpcy5yb3dIZWlnaHRQeCAtIDAuNSAqIHRoaXMuYmxvY2tTaXplUHgpIC0gMSxcbiAgICAgICAgXSk7XG4gICAgICBjYXNlIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb01pbGVzdG9uZVRvcDpcbiAgICAgICAgcmV0dXJuIGFkZCh0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3ApLCBbXG4gICAgICAgICAgMCxcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlciksXG4gICAgICAgIF0pO1xuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVCb3R0b206XG4gICAgICAgIHJldHVybiBhZGQodGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wKSwgW1xuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgXSk7XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdFRvTWlsZXN0b25lOlxuICAgICAgICByZXR1cm4gYWRkKHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0KSwgW1xuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlciksXG4gICAgICAgIF0pO1xuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVUb3A6XG4gICAgICAgIHJldHVybiBhZGQodGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydCksIFtcbiAgICAgICAgICAwLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgXSk7XG5cbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tOlxuICAgICAgICByZXR1cm4gYWRkKHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnQpLCBbXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpLFxuICAgICAgICBdKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydEZyb21NaWxlc3RvbmU6XG4gICAgICAgIHJldHVybiBhZGQodGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0KSwgW1xuICAgICAgICAgIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlciksXG4gICAgICAgICAgMCxcbiAgICAgICAgXSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza0VudmVsb3BlVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3csIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBFbnZlbG9wZVN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cFJvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRpbWVNYXJrU3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVFbnZlbG9wZVN0YXJ0KGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGltZU1hcmtFbmQ6XG4gICAgICAgIHJldHVybiBhZGQodGhpcy50aW1lRW52ZWxvcGVTdGFydChkYXkpLCBbXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLnJvd0hlaWdodFB4ICogKHJvdyArIDEpLFxuICAgICAgICBdKTtcbiAgICAgIGNhc2UgRmVhdHVyZS50aW1lVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gYWRkKHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KSwgW3RoaXMuYmxvY2tTaXplUHgsIDBdKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cFRpdGxlVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gYWRkKHRoaXMuZ3JvdXBIZWFkZXJTdGFydCgpLCBbdGhpcy5ibG9ja1NpemVQeCwgMF0pO1xuICAgICAgY2FzZSBGZWF0dXJlLmRpc3BsYXlSYW5nZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZUVudmVsb3BlU3RhcnQoZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrUm93Qm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrUm93RW52ZWxvcGVTdGFydChyb3cgKyAxLCBkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tzQ2xpcFJlY3RPcmlnaW46XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tzQ2xpcFJlY3RPcmlnaW47XG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBCeU9yaWdpbjpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBCeU9yaWdpbjtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFRoZSBsaW5lIGJlbG93IHdpbGwgbm90IGNvbXBpbGUgaWYgeW91IG1pc3NlZCBhbiBlbnVtIGluIHRoZSBzd2l0Y2ggYWJvdmUuXG4gICAgICAgIGNvb3JkIHNhdGlzZmllcyBuZXZlcjtcbiAgICAgICAgcmV0dXJuIHB0KDAsIDApO1xuICAgIH1cbiAgfVxuXG4gIG1ldHJpYyhmZWF0dXJlOiBNZXRyaWMpOiBudW1iZXIge1xuICAgIHN3aXRjaCAoZmVhdHVyZSkge1xuICAgICAgY2FzZSBNZXRyaWMudGFza0xpbmVIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tIZWlnaHRQeDtcbiAgICAgIGNhc2UgTWV0cmljLnBlcmNlbnRIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLmxpbmVXaWR0aFB4O1xuICAgICAgY2FzZSBNZXRyaWMuYXJyb3dIZWFkSGVpZ2h0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrSGVpZ2h0UHg7XG4gICAgICBjYXNlIE1ldHJpYy5hcnJvd0hlYWRXaWR0aDpcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLnRhc2tIZWlnaHRQeCk7XG4gICAgICBjYXNlIE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcjpcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLnRhc2tIZWlnaHRQeCk7XG4gICAgICBjYXNlIE1ldHJpYy5saW5lRGFzaExpbmU6XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrU2l6ZVB4O1xuICAgICAgY2FzZSBNZXRyaWMubGluZURhc2hHYXA6XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrU2l6ZVB4O1xuICAgICAgY2FzZSBNZXRyaWMudGV4dFhPZmZzZXQ6XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrU2l6ZVB4O1xuICAgICAgY2FzZSBNZXRyaWMubWluVGFza1dpZHRoUHg6XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrU2l6ZVB4ICogMTA7XG4gICAgICBjYXNlIE1ldHJpYy5yb3dIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLnJvd0hlaWdodFB4O1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gVGhlIGxpbmUgYmVsb3cgd2lsbCBub3QgY29tcGlsZSBpZiB5b3UgbWlzc2VkIGFuIGVudW0gaW4gdGhlIHN3aXRjaCBhYm92ZS5cbiAgICAgICAgZmVhdHVyZSBzYXRpc2ZpZXMgbmV2ZXI7XG4gICAgICAgIHJldHVybiAwLjA7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi4vcG9pbnQvcG9pbnRcIjtcbmltcG9ydCB7IFJlY3QgfSBmcm9tIFwiLi4vcmVjdC9yZWN0XCI7XG5cbmNvbnN0IHdpdGhpblkgPSAoeTogbnVtYmVyLCByZWN0OiBSZWN0KTogYm9vbGVhbiA9PiB7XG4gIHJldHVybiByZWN0LnRvcExlZnQueSA8PSB5ICYmIHJlY3QuYm90dG9tUmlnaHQueSA+PSB5O1xufTtcblxuY29uc3Qgd2l0aGluWCA9ICh4OiBudW1iZXIsIHJlY3Q6IFJlY3QpOiBib29sZWFuID0+IHtcbiAgcmV0dXJuIHJlY3QudG9wTGVmdC54IDw9IHggJiYgcmVjdC5ib3R0b21SaWdodC54ID49IHg7XG59O1xuXG5leHBvcnQgY2xhc3MgSGl0UmVjdDxSIGV4dGVuZHMgUmVjdD4ge1xuICByZWN0czogUltdO1xuICBjb25zdHJ1Y3RvcihyZWN0czogUltdKSB7XG4gICAgdGhpcy5yZWN0cyA9IHJlY3RzLnNvcnQoKGE6IFIsIGI6IFIpOiBudW1iZXIgPT4gYS50b3BMZWZ0LnkgLSBiLnRvcExlZnQueSk7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIFJlY3QgdGhhdCBwIGlzIGluLCBvdGhlcndpc2UgcmV0dXJucyAtMS4gKi9cbiAgaGl0KHA6IFBvaW50KTogUiB8IG51bGwge1xuICAgIGxldCBzdGFydCA9IDA7XG4gICAgbGV0IGVuZCA9IHRoaXMucmVjdHMubGVuZ3RoIC0gMTtcblxuICAgIHdoaWxlIChzdGFydCA8PSBlbmQpIHtcbiAgICAgIC8vIEZpbmQgdGhlIG1pZCBpbmRleFxuICAgICAgbGV0IG1pZCA9IE1hdGguZmxvb3IoKHN0YXJ0ICsgZW5kKSAvIDIpO1xuXG4gICAgICAvLyBJZiBlbGVtZW50IGlzIHByZXNlbnQgYXRcbiAgICAgIC8vIG1pZCwgcmV0dXJuIFRydWVcbiAgICAgIGlmICh3aXRoaW5ZKHAueSwgdGhpcy5yZWN0c1ttaWRdKSkge1xuICAgICAgICBpZiAod2l0aGluWChwLngsIHRoaXMucmVjdHNbbWlkXSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5yZWN0c1ttaWRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgLy8gRWxzZSBsb29rIGluIGxlZnQgb3JcbiAgICAgIC8vIHJpZ2h0IGhhbGYgYWNjb3JkaW5nbHlcbiAgICAgIGVsc2UgaWYgKHRoaXMucmVjdHNbbWlkXS50b3BMZWZ0LnkgPCBwLnkpIHtcbiAgICAgICAgc3RhcnQgPSBtaWQgKyAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW5kID0gbWlkIC0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIiwgImltcG9ydCB7IENoYXJ0VmFsaWRhdGUsIFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IENoYXJ0TGlrZSwgZmlsdGVyLCBGaWx0ZXJGdW5jIH0gZnJvbSBcIi4uL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgVmVydGV4SW5kaWNlcyB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUmVzb3VyY2VEZWZpbml0aW9uIH0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBTcGFuIH0gZnJvbSBcIi4uL3NsYWNrL3NsYWNrLnRzXCI7XG5pbXBvcnQgeyBUYXNrRHVyYXRpb24gfSBmcm9tIFwiLi4vdHlwZXMvdHlwZXMudHNcIjtcbmltcG9ydCB7IFJlY3QgfSBmcm9tIFwiLi4vcmVjdC9yZWN0LnRzXCI7XG5pbXBvcnQgeyBLRFRyZWUgfSBmcm9tIFwiLi9rZC9rZC50c1wiO1xuaW1wb3J0IHsgRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4vcmFuZ2UvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFBvaW50LCBkaWZmZXJlbmNlLCBwdCB9IGZyb20gXCIuLi9wb2ludC9wb2ludC50c1wiO1xuaW1wb3J0IHsgRmVhdHVyZSwgTWV0cmljLCBTY2FsZSB9IGZyb20gXCIuL3NjYWxlL3NjYWxlLnRzXCI7XG5pbXBvcnQgeyBIaXRSZWN0IH0gZnJvbSBcIi4uL2hpdHJlY3QvaGl0cmVjdC50c1wiO1xuXG50eXBlIERpcmVjdGlvbiA9IFwidXBcIiB8IFwiZG93blwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbG9ycyB7XG4gIHN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZU11dGVkOiBzdHJpbmc7XG4gIG9uU3VyZmFjZUhpZ2hsaWdodDogc3RyaW5nO1xuICBvdmVybGF5OiBzdHJpbmc7XG4gIGdyb3VwQ29sb3I6IHN0cmluZztcbiAgaGlnaGxpZ2h0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIFRhc2tJbmRleFRvUm93ID0gTWFwPG51bWJlciwgbnVtYmVyPjtcblxuLyoqIEZ1bmN0aW9uIHVzZSB0byBwcm9kdWNlIGEgdGV4dCBsYWJlbCBmb3IgYSB0YXNrIGFuZCBpdHMgc2xhY2suICovXG5leHBvcnQgdHlwZSBUYXNrTGFiZWwgPSAodGFza0luZGV4OiBudW1iZXIpID0+IHN0cmluZztcblxuLyoqIENvbnRyb2xzIG9mIHRoZSBkaXNwbGF5UmFuZ2UgaW4gUmVuZGVyT3B0aW9ucyBpcyB1c2VkLlxuICpcbiAqICBcInJlc3RyaWN0XCI6IE9ubHkgZGlzcGxheSB0aGUgcGFydHMgb2YgdGhlIGNoYXJ0IHRoYXQgYXBwZWFyIGluIHRoZSByYW5nZS5cbiAqXG4gKiAgXCJoaWdobGlnaHRcIjogRGlzcGxheSB0aGUgZnVsbCByYW5nZSBvZiB0aGUgZGF0YSwgYnV0IGhpZ2hsaWdodCB0aGUgcmFuZ2UuXG4gKi9cbmV4cG9ydCB0eXBlIERpc3BsYXlSYW5nZVVzYWdlID0gXCJyZXN0cmljdFwiIHwgXCJoaWdobGlnaHRcIjtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUYXNrTGFiZWw6IFRhc2tMYWJlbCA9ICh0YXNrSW5kZXg6IG51bWJlcik6IHN0cmluZyA9PlxuICB0YXNrSW5kZXgudG9GaXhlZCgwKTtcblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJPcHRpb25zIHtcbiAgLyoqIFRoZSB0ZXh0IGZvbnQgc2l6ZSwgdGhpcyBkcml2ZXMgdGhlIHNpemUgb2YgYWxsIG90aGVyIGNoYXJ0IGZlYXR1cmVzLlxuICAgKiAqL1xuICBmb250U2l6ZVB4OiBudW1iZXI7XG5cbiAgLyoqIERpc3BsYXkgdGV4dCBpZiB0cnVlLiAqL1xuICBoYXNUZXh0OiBib29sZWFuO1xuXG4gIC8qKiBJZiBzdXBwbGllZCB0aGVuIG9ubHkgdGhlIHRhc2tzIGluIHRoZSBnaXZlbiByYW5nZSB3aWxsIGJlIGRpc3BsYXllZC4gKi9cbiAgZGlzcGxheVJhbmdlOiBEaXNwbGF5UmFuZ2UgfCBudWxsO1xuXG4gIC8qKiBDb250cm9scyBob3cgdGhlIGBkaXNwbGF5UmFuZ2VgIGlzIHVzZWQgaWYgc3VwcGxpZWQuICovXG4gIGRpc3BsYXlSYW5nZVVzYWdlOiBEaXNwbGF5UmFuZ2VVc2FnZTtcblxuICAvKiogVGhlIGNvbG9yIHRoZW1lLiAqL1xuICBjb2xvcnM6IENvbG9ycztcblxuICAvKiogSWYgdHJ1ZSB0aGVuIGRpc3BsYXkgdGltZXMgYXQgdGhlIHRvcCBvZiB0aGUgY2hhcnQuICovXG4gIGhhc1RpbWVsaW5lOiBib29sZWFuO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZGlzcGxheSB0aGUgdGFzayBiYXJzLiAqL1xuICBoYXNUYXNrczogYm9vbGVhbjtcblxuICAvKiogSWYgdHJ1ZSB0aGVuIGRyYXcgdmVydGljYWwgbGluZXMgZnJvbSB0aGUgdGltZWxpbmUgZG93biB0byB0YXNrIHN0YXJ0IGFuZFxuICAgKiBmaW5pc2ggcG9pbnRzLiAqL1xuICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiBib29sZWFuO1xuXG4gIC8qKiBEcmF3IGRlcGVuZGVuY3kgZWRnZXMgYmV0d2VlbiB0YXNrcyBpZiB0cnVlLiAqL1xuICBoYXNFZGdlczogYm9vbGVhbjtcblxuICAvKiogRnVuY3Rpb24gdGhhdCBwcm9kdWNlcyBkaXNwbGF5IHRleHQgZm9yIGEgVGFzayBhbmQgaXRzIGFzc29jaWF0ZWQgU2xhY2suICovXG4gIHRhc2tMYWJlbDogVGFza0xhYmVsO1xuXG4gIC8qKiBSZXR1cm5zIHRoZSBkdXJhdGlvbiBmb3IgYSBnaXZlbiB0YXNrLiAqL1xuICB0YXNrRHVyYXRpb246IFRhc2tEdXJhdGlvbjtcblxuICAvKiogVGhlIGluZGljZXMgb2YgdGFza3MgdGhhdCBzaG91bGQgYmUgZW1waGFzaXplZCB3aGVuIGRyYXcsIHR5cGljYWxseSB1c2VkXG4gICAqIHRvIGRlbm90ZSB0aGUgY3JpdGljYWwgcGF0aC4gKi9cbiAgdGFza0VtcGhhc2l6ZTogbnVtYmVyW107XG5cbiAgLyoqIEZpbHRlciB0aGUgVGFza3MgdG8gYmUgZGlzcGxheWVkLiAqL1xuICBmaWx0ZXJGdW5jOiBGaWx0ZXJGdW5jIHwgbnVsbDtcblxuICAvKiogR3JvdXAgdGhlIHRhc2tzIHRvZ2V0aGVyIHZlcnRpY2FsbHkgYmFzZWQgb24gdGhlIGdpdmVuIHJlc291cmNlLiBJZiB0aGVcbiAgICogZW1wdHkgc3RyaW5nIGlzIHN1cHBsaWVkIHRoZW4ganVzdCBkaXNwbGF5IGJ5IHRvcG9sb2dpY2FsIG9yZGVyLlxuICAgKi9cbiAgZ3JvdXBCeVJlc291cmNlOiBzdHJpbmc7XG5cbiAgLyoqIFRhc2sgdG8gaGlnaGxpZ2h0LiAqL1xuICBoaWdobGlnaHRlZFRhc2s6IG51bGwgfCBudW1iZXI7XG5cbiAgLyoqIFRoZSBpbmRleCBvZiB0aGUgc2VsZWN0ZWQgdGFzaywgb3IgLTEgaWYgbm8gdGFzayBpcyBzZWxlY3RlZC4gVGhpcyBpc1xuICAgKiBhbHdheXMgYW4gaW5kZXggaW50byB0aGUgb3JpZ2luYWwgY2hhcnQsIGFuZCBub3QgYW4gaW5kZXggaW50byBhIGZpbHRlcmVkXG4gICAqIGNoYXJ0LlxuICAgKi9cbiAgc2VsZWN0ZWRUYXNrSW5kZXg6IG51bWJlcjtcblxuICAvKiogQ29udmVydHMgdGhlIHRpbWVzIGluIGEgY2hhcnQgaW50byBhIGRpc3BsYXlhYmxlIHN0cmluZy4gKi9cbiAgZHVyYXRpb25EaXNwbGF5OiAoZDogbnVtYmVyKSA9PiBzdHJpbmc7XG59XG5cbmNvbnN0IHZlcnRpY2FsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKFxuICB0YXNrOiBUYXNrLFxuICBkaXJlY3Rpb246IERpcmVjdGlvblxuKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVCb3R0b207XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydEZyb21NaWxlc3RvbmVUb3A7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd1N0YXJ0O1xuICB9XG59O1xuXG5jb25zdCB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKFxuICB0YXNrOiBUYXNrLFxuICBkaXJlY3Rpb246IERpcmVjdGlvblxuKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVUb3A7XG4gICAgfVxuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVCb3R0b207XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJkb3duXCIpIHtcbiAgICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wO1xuICAgIH1cbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdEJvdHRvbTtcbiAgfVxufTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuY29uc3QgaG9yaXpvbnRhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9ICh0YXNrOiBUYXNrKTogRmVhdHVyZSA9PiB7XG4gIGlmICh0YXNrLmR1cmF0aW9uID09PSAwKSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0O1xuICB9XG59O1xuXG5jb25zdCBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAodGFzazogVGFzayk6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd0Rlc3RUb01pbGVzdG9uZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0O1xuICB9XG59O1xuXG4vKipcbiAqIENvbXB1dGUgd2hhdCB0aGUgaGVpZ2h0IG9mIHRoZSBjYW52YXMgc2hvdWxkIGJlLiBOb3RlIHRoYXQgdGhlIHZhbHVlIGRvZXNuJ3RcbiAqIGtub3cgYWJvdXQgYHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvYCwgc28gaWYgdGhlIGNhbnZhcyBpcyBhbHJlYWR5IHNjYWxlZCBieVxuICogYHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvYCB0aGVuIHNvIHdpbGwgdGhlIHJlc3VsdCBvZiB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VnZ2VzdGVkQ2FudmFzSGVpZ2h0KFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LFxuICBzcGFuczogU3BhbltdLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBtYXhSb3dzOiBudW1iZXJcbik6IG51bWJlciB7XG4gIGlmICghb3B0cy5oYXNUYXNrcykge1xuICAgIG1heFJvd3MgPSAwO1xuICB9XG4gIHJldHVybiBuZXcgU2NhbGUoXG4gICAgb3B0cyxcbiAgICBjYW52YXMud2lkdGgsXG4gICAgc3BhbnNbc3BhbnMubGVuZ3RoIC0gMV0uZmluaXNoICsgMVxuICApLmhlaWdodChtYXhSb3dzKTtcbn1cblxuLy8gVGhlIGxvY2F0aW9uLCBpbiBjYW52YXMgcGl4ZWwgY29vcmRpbmF0ZXMsIG9mIGVhY2ggdGFzayBiYXIuIFNob3VsZCB1c2UgdGhlXG4vLyB0ZXh0IG9mIHRoZSB0YXNrIGxhYmVsIGFzIHRoZSBsb2NhdGlvbiwgc2luY2UgdGhhdCdzIGFsd2F5cyBkcmF3biBpbiB0aGUgdmlld1xuLy8gaWYgcG9zc2libGUuXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tMb2NhdGlvbiB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuXG4gIC8vIFRoYXQgaW5kZXggb2YgdGhlIHRhc2sgaW4gdGhlIHVuZmlsdGVyZWQgQ2hhcnQuXG4gIG9yaWdpbmFsVGFza0luZGV4OiBudW1iZXI7XG59XG5cbnR5cGUgVXBkYXRlVHlwZSA9IFwibW91c2Vtb3ZlXCIgfCBcIm1vdXNlZG93blwiO1xuXG4vLyBBIGZ1bmMgdGhhdCB0YWtlcyBhIFBvaW50IGFuZCByZWRyYXdzIHRoZSBoaWdobGlnaHRlZCB0YXNrIGlmIG5lZWRlZCwgcmV0dXJuc1xuLy8gdGhlIGluZGV4IG9mIHRoZSB0YXNrIHRoYXQgaXMgaGlnaGxpZ2h0ZWQuXG5leHBvcnQgdHlwZSBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgPSAoXG4gIHBvaW50OiBQb2ludCxcbiAgdXBkYXRlVHlwZTogVXBkYXRlVHlwZVxuKSA9PiBudW1iZXIgfCBudWxsO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlclJlc3VsdCB7XG4gIHNjYWxlOiBTY2FsZTtcbiAgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zOiBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgfCBudWxsO1xuICBzZWxlY3RlZFRhc2tMb2NhdGlvbjogUG9pbnQgfCBudWxsO1xufVxuXG4vLyBBIHNwYW4gb24gdGhlIHgtYXhpcy5cbnR5cGUgeFJhbmdlID0gW251bWJlciwgbnVtYmVyXTtcblxuLy8gVE9ETyAtIFBhc3MgaW4gbWF4IHJvd3MsIGFuZCBhIG1hcHBpbmcgdGhhdCBtYXBzIGZyb20gdGFza0luZGV4IHRvIHJvdyxcbi8vIGJlY2F1c2UgdHdvIGRpZmZlcmVudCB0YXNrcyBtaWdodCBiZSBwbGFjZWQgb24gdGhlIHNhbWUgcm93LiBBbHNvIHdlIHNob3VsZFxuLy8gcGFzcyBpbiBtYXggcm93cz8gT3Igc2hvdWxkIHRoYXQgY29tZSBmcm9tIHRoZSBhYm92ZSBtYXBwaW5nP1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclRhc2tzVG9DYW52YXMoXG4gIHBhcmVudDogSFRNTEVsZW1lbnQsXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBwbGFuOiBQbGFuLFxuICBzcGFuczogU3BhbltdLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBvdmVybGF5OiBIVE1MQ2FudmFzRWxlbWVudCB8IG51bGwgPSBudWxsXG4pOiBSZXN1bHQ8UmVuZGVyUmVzdWx0PiB7XG4gIGNvbnN0IHZyZXQgPSBDaGFydFZhbGlkYXRlKHBsYW4uY2hhcnQpO1xuICBpZiAoIXZyZXQub2spIHtcbiAgICByZXR1cm4gdnJldDtcbiAgfVxuXG4gIGNvbnN0IG9yaWdpbmFsTGFiZWxzID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5tYXAoXG4gICAgKHRhc2s6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKSA9PiBvcHRzLnRhc2tMYWJlbCh0YXNrSW5kZXgpXG4gICk7XG5cbiAgLy8gQXBwbHkgdGhlIGZpbHRlciBhbmQgd29yayB3aXRoIHRoZSBDaGFydExpa2UgcmV0dXJuIGZyb20gdGhpcyBwb2ludCBvbi5cbiAgLy8gRml0bGVyIGFsc28gbmVlZHMgdG8gYmUgYXBwbGllZCB0byBzcGFucy5cbiAgY29uc3QgZnJldCA9IGZpbHRlcihcbiAgICBwbGFuLmNoYXJ0LFxuICAgIG9wdHMuZmlsdGVyRnVuYyxcbiAgICBvcHRzLnRhc2tFbXBoYXNpemUsXG4gICAgc3BhbnMsXG4gICAgb3JpZ2luYWxMYWJlbHMsXG4gICAgb3B0cy5zZWxlY3RlZFRhc2tJbmRleFxuICApO1xuICBpZiAoIWZyZXQub2spIHtcbiAgICByZXR1cm4gZnJldDtcbiAgfVxuICBjb25zdCBjaGFydExpa2UgPSBmcmV0LnZhbHVlLmNoYXJ0TGlrZTtcbiAgY29uc3QgbGFiZWxzID0gZnJldC52YWx1ZS5sYWJlbHM7XG4gIGNvbnN0IHJlc291cmNlRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKG9wdHMuZ3JvdXBCeVJlc291cmNlKTtcbiAgY29uc3QgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXggPVxuICAgIGZyZXQudmFsdWUuZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg7XG4gIGNvbnN0IGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4ID1cbiAgICBmcmV0LnZhbHVlLmZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4O1xuXG4gIC8vIFNlbGVjdGVkIHRhc2ssIGFzIGFuIGluZGV4IGludG8gdGhlIHVuZmlsdGVyZWQgQ2hhcnQuXG4gIGxldCBsYXN0U2VsZWN0ZWRUYXNrSW5kZXggPSBvcHRzLnNlbGVjdGVkVGFza0luZGV4O1xuXG4gIC8vIEhpZ2hsaWdodGVkIHRhc2tzLlxuICBjb25zdCBlbXBoYXNpemVkVGFza3M6IFNldDxudW1iZXI+ID0gbmV3IFNldChmcmV0LnZhbHVlLmVtcGhhc2l6ZWRUYXNrcyk7XG4gIHNwYW5zID0gZnJldC52YWx1ZS5zcGFucztcblxuICAvLyBDYWxjdWxhdGUgaG93IHdpZGUgd2UgbmVlZCB0byBtYWtlIHRoZSBncm91cEJ5IGNvbHVtbi5cbiAgbGV0IG1heEdyb3VwTmFtZUxlbmd0aCA9IDA7XG4gIGlmIChvcHRzLmdyb3VwQnlSZXNvdXJjZSAhPT0gXCJcIiAmJiBvcHRzLmhhc1RleHQpIHtcbiAgICBtYXhHcm91cE5hbWVMZW5ndGggPSBvcHRzLmdyb3VwQnlSZXNvdXJjZS5sZW5ndGg7XG4gICAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXNvdXJjZURlZmluaXRpb24udmFsdWVzLmZvckVhY2goKHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgbWF4R3JvdXBOYW1lTGVuZ3RoID0gTWF0aC5tYXgobWF4R3JvdXBOYW1lTGVuZ3RoLCB2YWx1ZS5sZW5ndGgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgdG90YWxOdW1iZXJPZlJvd3MgPSBzcGFucy5sZW5ndGg7XG4gIGNvbnN0IHRvdGFsTnVtYmVyT2ZEYXlzID0gc3BhbnNbc3BhbnMubGVuZ3RoIC0gMV0uZmluaXNoO1xuICBjb25zdCBzY2FsZSA9IG5ldyBTY2FsZShcbiAgICBvcHRzLFxuICAgIGNhbnZhcy53aWR0aCxcbiAgICB0b3RhbE51bWJlck9mRGF5cyArIDEsXG4gICAgbWF4R3JvdXBOYW1lTGVuZ3RoXG4gICk7XG5cbiAgY29uc3QgdGFza0xpbmVIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLnRhc2tMaW5lSGVpZ2h0KTtcbiAgY29uc3QgZGlhbW9uZERpYW1ldGVyID0gc2NhbGUubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcik7XG4gIGNvbnN0IHBlcmNlbnRIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLnBlcmNlbnRIZWlnaHQpO1xuICBjb25zdCBhcnJvd0hlYWRIZWlnaHQgPSBzY2FsZS5tZXRyaWMoTWV0cmljLmFycm93SGVhZEhlaWdodCk7XG4gIGNvbnN0IGFycm93SGVhZFdpZHRoID0gc2NhbGUubWV0cmljKE1ldHJpYy5hcnJvd0hlYWRXaWR0aCk7XG4gIGNvbnN0IG1pblRhc2tXaWR0aFB4ID0gc2NhbGUubWV0cmljKE1ldHJpYy5taW5UYXNrV2lkdGhQeCk7XG5cbiAgY29uc3QgZGF5c1dpdGhUaW1lTWFya2VyczogU2V0PG51bWJlcj4gPSBuZXcgU2V0KCk7XG4gIGNvbnN0IHRpcmV0ID0gdGFza0luZGV4VG9Sb3dGcm9tR3JvdXBCeShcbiAgICBvcHRzLFxuICAgIHJlc291cmNlRGVmaW5pdGlvbixcbiAgICBjaGFydExpa2UsXG4gICAgZnJldC52YWx1ZS5kaXNwbGF5T3JkZXJcbiAgKTtcbiAgaWYgKCF0aXJldC5vaykge1xuICAgIHJldHVybiB0aXJldDtcbiAgfVxuICBjb25zdCB0YXNrSW5kZXhUb1JvdyA9IHRpcmV0LnZhbHVlLnRhc2tJbmRleFRvUm93O1xuICBjb25zdCByb3dSYW5nZXMgPSB0aXJldC52YWx1ZS5yb3dSYW5nZXM7XG5cbiAgLy8gU2V0IHVwIGNhbnZhcyBiYXNpY3MuXG4gIGNsZWFyQ2FudmFzKGN0eCwgb3B0cywgY2FudmFzKTtcbiAgc2V0Rm9udFNpemUoY3R4LCBvcHRzKTtcblxuICBjb25zdCBjbGlwUmVnaW9uID0gbmV3IFBhdGgyRCgpO1xuICBjb25zdCBjbGlwT3JpZ2luID0gc2NhbGUuZmVhdHVyZSgwLCAwLCBGZWF0dXJlLnRhc2tzQ2xpcFJlY3RPcmlnaW4pO1xuICBjb25zdCBjbGlwV2lkdGggPSBjYW52YXMud2lkdGggLSBjbGlwT3JpZ2luLng7XG4gIGNsaXBSZWdpb24ucmVjdChjbGlwT3JpZ2luLngsIDAsIGNsaXBXaWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgLy8gRHJhdyBiaWcgcmVkIHJlY3Qgb3ZlciB3aGVyZSB0aGUgY2xpcCByZWdpb24gd2lsbCBiZS5cbiAgaWYgKDApIHtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlKGNsaXBSZWdpb24pO1xuICB9XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuXG4gIGlmIChyb3dSYW5nZXMgIT09IG51bGwpIHtcbiAgICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgICAgZHJhd1N3aW1MYW5lSGlnaGxpZ2h0cyhcbiAgICAgICAgY3R4LFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgcm93UmFuZ2VzLFxuICAgICAgICB0b3RhbE51bWJlck9mRGF5cyxcbiAgICAgICAgb3B0cy5jb2xvcnMuZ3JvdXBDb2xvclxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uICE9PSB1bmRlZmluZWQgJiYgb3B0cy5oYXNUZXh0KSB7XG4gICAgICBkcmF3U3dpbUxhbmVMYWJlbHMoY3R4LCBvcHRzLCByZXNvdXJjZURlZmluaXRpb24sIHNjYWxlLCByb3dSYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcblxuICBjdHguc2F2ZSgpO1xuICBjdHguY2xpcChjbGlwUmVnaW9uKTtcblxuICBpbnRlcmZhY2UgUmVjdFdpdGhGaWx0ZXJlZFRhc2tJbmRleCBleHRlbmRzIFJlY3Qge1xuICAgIGZpbHRlcmVkVGFza0luZGV4OiBudW1iZXI7XG4gIH1cbiAgY29uc3QgdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVyczogTWFwPFxuICAgIG51bWJlcixcbiAgICBSZWN0V2l0aEZpbHRlcmVkVGFza0luZGV4XG4gID4gPSBuZXcgTWFwKCk7XG5cbiAgLy8gS2VlcCB0cmFjayBvZiB3aGVyZSB3ZSBkcmF3IHRpbWVsaW5lIGxhYmVscywgdG8gYXZvaWQgb3ZlcmxhcHMuXG4gIGNvbnN0IHRpbWVNYXJrZXJSYW5nZXM6IHhSYW5nZVtdID0gW107XG5cbiAgLy8gRHJhdyB0YXNrcyBpbiB0aGVpciByb3dzLlxuICBjaGFydExpa2UuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCByb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQodGFza0luZGV4KSE7XG4gICAgY29uc3Qgc3BhbiA9IHNwYW5zW3Rhc2tJbmRleF07XG4gICAgY29uc3QgdGFza1N0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIHNwYW4uc3RhcnQsIEZlYXR1cmUudGFza0xpbmVTdGFydCk7XG4gICAgY29uc3QgdGFza0VuZCA9IHNjYWxlLmZlYXR1cmUocm93LCBzcGFuLmZpbmlzaCwgRmVhdHVyZS50YXNrTGluZVN0YXJ0KTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcblxuICAgIC8vIERyYXcgaW4gdGltZSBtYXJrZXJzIGlmIGRpc3BsYXllZC5cbiAgICAvLyBUT0RPIC0gTWFrZSBzdXJlIHRoZXkgZG9uJ3Qgb3ZlcmxhcC5cbiAgICBpZiAob3B0cy5kcmF3VGltZU1hcmtlcnNPblRhc2tzKSB7XG4gICAgICBkcmF3VGltZU1hcmtlckF0RGF5VG9UYXNrKFxuICAgICAgICBjdHgsXG4gICAgICAgIHJvdyxcbiAgICAgICAgc3Bhbi5zdGFydCxcbiAgICAgICAgdGFzayxcbiAgICAgICAgb3B0cyxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIGRheXNXaXRoVGltZU1hcmtlcnMsXG4gICAgICAgIHRpbWVNYXJrZXJSYW5nZXNcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGVtcGhhc2l6ZWRUYXNrcy5oYXModGFza0luZGV4KSkge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgICB9XG4gICAgY29uc3QgaGlnaGxpZ2h0VG9wTGVmdCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3csXG4gICAgICBzcGFuLnN0YXJ0LFxuICAgICAgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3BcbiAgICApO1xuICAgIGxldCBoaWdobGlnaHRCb3R0b21SaWdodCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3cgKyAxLFxuICAgICAgc3Bhbi5maW5pc2gsXG4gICAgICBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcFxuICAgICk7XG5cbiAgICAvLyBQYWQgaGlnaGxpZ2h0Qm90dG9tUmlnaHQgaWYgdG9vIHNtYWxsLlxuICAgIGNvbnN0IFt3aWR0aCwgX10gPSBkaWZmZXJlbmNlKGhpZ2hsaWdodFRvcExlZnQsIGhpZ2hsaWdodEJvdHRvbVJpZ2h0KTtcbiAgICBpZiAod2lkdGggPCBtaW5UYXNrV2lkdGhQeCkge1xuICAgICAgaGlnaGxpZ2h0Qm90dG9tUmlnaHQueCA9IGhpZ2hsaWdodFRvcExlZnQueCArIG1pblRhc2tXaWR0aFB4O1xuICAgIH1cblxuICAgIHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMuc2V0KHRhc2tJbmRleCwge1xuICAgICAgdG9wTGVmdDogaGlnaGxpZ2h0VG9wTGVmdCxcbiAgICAgIGJvdHRvbVJpZ2h0OiBoaWdobGlnaHRCb3R0b21SaWdodCxcbiAgICAgIGZpbHRlcmVkVGFza0luZGV4OiB0YXNrSW5kZXgsXG4gICAgfSk7XG4gICAgaWYgKG9wdHMuaGFzVGFza3MpIHtcbiAgICAgIGlmICh0YXNrU3RhcnQueCA9PT0gdGFza0VuZC54KSB7XG4gICAgICAgIGRyYXdNaWxlc3RvbmUoY3R4LCB0YXNrU3RhcnQsIGRpYW1vbmREaWFtZXRlciwgcGVyY2VudEhlaWdodCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkcmF3VGFza0JhcihjdHgsIHRhc2tTdGFydCwgdGFza0VuZCwgdGFza0xpbmVIZWlnaHQpO1xuICAgICAgfVxuXG4gICAgICAvLyBTa2lwIGRyYXdpbmcgdGhlIHRleHQgb2YgdGhlIFN0YXJ0IGFuZCBGaW5pc2ggdGFza3MuXG4gICAgICBpZiAodGFza0luZGV4ICE9PSAwICYmIHRhc2tJbmRleCAhPT0gdG90YWxOdW1iZXJPZlJvd3MgLSAxKSB7XG4gICAgICAgIGRyYXdUYXNrVGV4dChcbiAgICAgICAgICBjdHgsXG4gICAgICAgICAgb3B0cyxcbiAgICAgICAgICBzY2FsZSxcbiAgICAgICAgICByb3csXG4gICAgICAgICAgc3BhbixcbiAgICAgICAgICB0YXNrLFxuICAgICAgICAgIHRhc2tJbmRleCxcbiAgICAgICAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleC5nZXQodGFza0luZGV4KSEsXG4gICAgICAgICAgY2xpcFdpZHRoLFxuICAgICAgICAgIGxhYmVsc1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuXG4gIC8vIE5vdyBkcmF3IGFsbCB0aGUgYXJyb3dzLCBpLmUuIGVkZ2VzLlxuICBpZiAob3B0cy5oYXNFZGdlcyAmJiBvcHRzLmhhc1Rhc2tzKSB7XG4gICAgY29uc3QgaGlnaGxpZ2h0ZWRFZGdlczogRGlyZWN0ZWRFZGdlW10gPSBbXTtcbiAgICBjb25zdCBub3JtYWxFZGdlczogRGlyZWN0ZWRFZGdlW10gPSBbXTtcbiAgICBjaGFydExpa2UuRWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgICBpZiAoZW1waGFzaXplZFRhc2tzLmhhcyhlLmkpICYmIGVtcGhhc2l6ZWRUYXNrcy5oYXMoZS5qKSkge1xuICAgICAgICBoaWdobGlnaHRlZEVkZ2VzLnB1c2goZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub3JtYWxFZGdlcy5wdXNoKGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlTXV0ZWQ7XG4gICAgZHJhd0VkZ2VzKFxuICAgICAgY3R4LFxuICAgICAgb3B0cyxcbiAgICAgIG5vcm1hbEVkZ2VzLFxuICAgICAgc3BhbnMsXG4gICAgICBjaGFydExpa2UuVmVydGljZXMsXG4gICAgICBzY2FsZSxcbiAgICAgIHRhc2tJbmRleFRvUm93LFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHQsXG4gICAgICBlbXBoYXNpemVkVGFza3NcbiAgICApO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICBkcmF3RWRnZXMoXG4gICAgICBjdHgsXG4gICAgICBvcHRzLFxuICAgICAgaGlnaGxpZ2h0ZWRFZGdlcyxcbiAgICAgIHNwYW5zLFxuICAgICAgY2hhcnRMaWtlLlZlcnRpY2VzLFxuICAgICAgc2NhbGUsXG4gICAgICB0YXNrSW5kZXhUb1JvdyxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0LFxuICAgICAgZW1waGFzaXplZFRhc2tzXG4gICAgKTtcbiAgfVxuXG4gIC8vIFJlbW92ZSB0aGUgY2xpcCByZWdpb24uXG4gIGN0eC5yZXN0b3JlKCk7XG5cbiAgLy8gTm93IGRyYXcgdGhlIHJhbmdlIGhpZ2hsaWdodHMgaWYgcmVxdWlyZWQuXG4gIGlmIChvcHRzLmRpc3BsYXlSYW5nZSAhPT0gbnVsbCAmJiBvcHRzLmRpc3BsYXlSYW5nZVVzYWdlID09PSBcImhpZ2hsaWdodFwiKSB7XG4gICAgLy8gRHJhdyBhIHJlY3Qgb3ZlciBlYWNoIHNpZGUgdGhhdCBpc24ndCBpbiB0aGUgcmFuZ2UuXG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luID4gMCkge1xuICAgICAgZHJhd1JhbmdlT3ZlcmxheShcbiAgICAgICAgY3R4LFxuICAgICAgICBvcHRzLFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgMCxcbiAgICAgICAgb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW4sXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZSb3dzXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuZW5kIDwgdG90YWxOdW1iZXJPZkRheXMpIHtcbiAgICAgIGRyYXdSYW5nZU92ZXJsYXkoXG4gICAgICAgIGN0eCxcbiAgICAgICAgb3B0cyxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIG9wdHMuZGlzcGxheVJhbmdlLmVuZCxcbiAgICAgICAgdG90YWxOdW1iZXJPZkRheXMgKyAxLFxuICAgICAgICB0b3RhbE51bWJlck9mUm93c1xuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBsZXQgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zOiBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgfCBudWxsID0gbnVsbDtcbiAgbGV0IHNlbGVjdGVkVGFza0xvY2F0aW9uOiBQb2ludCB8IG51bGwgPSBudWxsO1xuXG4gIGlmIChvdmVybGF5ICE9PSBudWxsKSB7XG4gICAgY29uc3Qgb3ZlcmxheUN0eCA9IG92ZXJsYXkuZ2V0Q29udGV4dChcIjJkXCIpITtcblxuICAgIGNvbnN0IHRhc2tMb2NhdGlvbktEVHJlZSA9IG5ldyBIaXRSZWN0PFJlY3RXaXRoRmlsdGVyZWRUYXNrSW5kZXg+KFtcbiAgICAgIC4uLnRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMudmFsdWVzKCksXG4gICAgXSk7XG5cbiAgICAvLyBBbHdheXMgcmVjb3JlZCBpbiB0aGUgb3JpZ2luYWwgdW5maWx0ZXJlZCB0YXNrIGluZGV4LlxuICAgIGxldCBsYXN0SGlnaGxpZ2h0ZWRUYXNrSW5kZXggPSAtMTtcblxuICAgIHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyA9IChcbiAgICAgIHBvaW50OiBQb2ludCxcbiAgICAgIHVwZGF0ZVR5cGU6IFVwZGF0ZVR5cGVcbiAgICApOiBudW1iZXIgfCBudWxsID0+IHtcbiAgICAgIC8vIEZpcnN0IGNvbnZlcnQgcG9pbnQgaW4gb2Zmc2V0IGNvb3JkcyBpbnRvIGNhbnZhcyBjb29yZHMuXG4gICAgICBwb2ludC54ID0gcG9pbnQueCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgcG9pbnQueSA9IHBvaW50LnkgKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgIGNvbnN0IHRhc2tMb2NhdGlvbiA9IHRhc2tMb2NhdGlvbktEVHJlZS5oaXQocG9pbnQpO1xuICAgICAgY29uc3Qgb3JpZ2luYWxUYXNrSW5kZXggPVxuICAgICAgICB0YXNrTG9jYXRpb24gPT09IG51bGxcbiAgICAgICAgICA/IC0xXG4gICAgICAgICAgOiBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleC5nZXQoXG4gICAgICAgICAgICAgIHRhc2tMb2NhdGlvbiEuZmlsdGVyZWRUYXNrSW5kZXhcbiAgICAgICAgICAgICkhO1xuXG4gICAgICAvLyBEbyBub3QgYWxsb3cgaGlnaGxpZ2h0aW5nIG9yIGNsaWNraW5nIHRoZSBTdGFydCBhbmQgRmluaXNoIHRhc2tzLlxuICAgICAgaWYgKFxuICAgICAgICBvcmlnaW5hbFRhc2tJbmRleCA9PT0gMCB8fFxuICAgICAgICBvcmlnaW5hbFRhc2tJbmRleCA9PT0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBpZiAodXBkYXRlVHlwZSA9PT0gXCJtb3VzZW1vdmVcIikge1xuICAgICAgICBpZiAob3JpZ2luYWxUYXNrSW5kZXggPT09IGxhc3RIaWdobGlnaHRlZFRhc2tJbmRleCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG9yaWdpbmFsVGFza0luZGV4ID09PSBsYXN0U2VsZWN0ZWRUYXNrSW5kZXgpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHVwZGF0ZVR5cGUgPT09IFwibW91c2Vtb3ZlXCIpIHtcbiAgICAgICAgbGFzdEhpZ2hsaWdodGVkVGFza0luZGV4ID0gb3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsYXN0U2VsZWN0ZWRUYXNrSW5kZXggPSBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICAgIH1cblxuICAgICAgb3ZlcmxheUN0eC5jbGVhclJlY3QoMCwgMCwgb3ZlcmxheS53aWR0aCwgb3ZlcmxheS5oZWlnaHQpO1xuXG4gICAgICAvLyBEcmF3IGJvdGggaGlnaGxpZ2h0IGFuZCBzZWxlY3Rpb24uXG5cbiAgICAgIC8vIERyYXcgaGlnaGxpZ2h0LlxuICAgICAgbGV0IGNvcm5lcnMgPSB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmdldChcbiAgICAgICAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXguZ2V0KGxhc3RIaWdobGlnaHRlZFRhc2tJbmRleCkhXG4gICAgICApO1xuICAgICAgaWYgKGNvcm5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkcmF3VGFza0hpZ2hsaWdodChcbiAgICAgICAgICBvdmVybGF5Q3R4LFxuICAgICAgICAgIGNvcm5lcnMudG9wTGVmdCxcbiAgICAgICAgICBjb3JuZXJzLmJvdHRvbVJpZ2h0LFxuICAgICAgICAgIG9wdHMuY29sb3JzLmhpZ2hsaWdodCxcbiAgICAgICAgICBzY2FsZS5tZXRyaWModGFza0xpbmVIZWlnaHQpXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIERyYXcgc2VsZWN0aW9uLlxuICAgICAgY29ybmVycyA9IHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMuZ2V0KFxuICAgICAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5nZXQobGFzdFNlbGVjdGVkVGFza0luZGV4KSFcbiAgICAgICk7XG4gICAgICBpZiAoY29ybmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRyYXdTZWxlY3Rpb25IaWdobGlnaHQoXG4gICAgICAgICAgb3ZlcmxheUN0eCxcbiAgICAgICAgICBjb3JuZXJzLnRvcExlZnQsXG4gICAgICAgICAgY29ybmVycy5ib3R0b21SaWdodCxcbiAgICAgICAgICBvcHRzLmNvbG9ycy5oaWdobGlnaHRcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9yaWdpbmFsVGFza0luZGV4O1xuICAgIH07XG5cbiAgICAvLyBEcmF3IHNlbGVjdGlvbi5cbiAgICBjb25zdCBjb3JuZXJzID0gdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5nZXQoXG4gICAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5nZXQobGFzdFNlbGVjdGVkVGFza0luZGV4KSFcbiAgICApO1xuICAgIGlmIChjb3JuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGRyYXdTZWxlY3Rpb25IaWdobGlnaHQoXG4gICAgICAgIG92ZXJsYXlDdHgsXG4gICAgICAgIGNvcm5lcnMudG9wTGVmdCxcbiAgICAgICAgY29ybmVycy5ib3R0b21SaWdodCxcbiAgICAgICAgb3B0cy5jb2xvcnMuaGlnaGxpZ2h0XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGhpZ2hlc3QgdGFzayBvZiBhbGwgdGhlIHRhc2tzIGRpc3BsYXllZC5cbiAgdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5mb3JFYWNoKChyYzogUmVjdCkgPT4ge1xuICAgIGlmIChzZWxlY3RlZFRhc2tMb2NhdGlvbiA9PT0gbnVsbCkge1xuICAgICAgc2VsZWN0ZWRUYXNrTG9jYXRpb24gPSByYy50b3BMZWZ0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAocmMudG9wTGVmdC55IDwgc2VsZWN0ZWRUYXNrTG9jYXRpb24ueSkge1xuICAgICAgc2VsZWN0ZWRUYXNrTG9jYXRpb24gPSByYy50b3BMZWZ0O1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKFxuICAgIG9wdHMuc2VsZWN0ZWRUYXNrSW5kZXggIT09IC0xICYmXG4gICAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXguaGFzKG9wdHMuc2VsZWN0ZWRUYXNrSW5kZXgpXG4gICkge1xuICAgIHNlbGVjdGVkVGFza0xvY2F0aW9uID0gdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5nZXQoXG4gICAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleC5nZXQob3B0cy5zZWxlY3RlZFRhc2tJbmRleCkhIC8vIENvbnZlcnRcbiAgICApIS50b3BMZWZ0O1xuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBzZWxlY3RlZCB0YXNrIGxvY2F0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcywgbm90IGluIGNhbnZhc1xuICAvLyB1bml0cy5cbiAgbGV0IHJldHVybmVkTG9jYXRpb246IFBvaW50IHwgbnVsbCA9IG51bGw7XG4gIGlmIChzZWxlY3RlZFRhc2tMb2NhdGlvbiAhPT0gbnVsbCkge1xuICAgIHJldHVybmVkTG9jYXRpb24gPSBwdChcbiAgICAgIHNlbGVjdGVkVGFza0xvY2F0aW9uLnggLyB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyxcbiAgICAgIHNlbGVjdGVkVGFza0xvY2F0aW9uLnkgLyB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb1xuICAgICk7XG4gIH1cblxuICByZXR1cm4gb2soe1xuICAgIHNjYWxlOiBzY2FsZSxcbiAgICB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M6IHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyxcbiAgICBzZWxlY3RlZFRhc2tMb2NhdGlvbjogcmV0dXJuZWRMb2NhdGlvbixcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdFZGdlcyhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSxcbiAgc3BhbnM6IFNwYW5bXSxcbiAgdGFza3M6IFRhc2tbXSxcbiAgc2NhbGU6IFNjYWxlLFxuICB0YXNrSW5kZXhUb1JvdzogVGFza0luZGV4VG9Sb3csXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyLFxuICB0YXNrSGlnaGxpZ2h0czogU2V0PG51bWJlcj5cbikge1xuICBlZGdlcy5mb3JFYWNoKChlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBjb25zdCBzcmNTbGFjazogU3BhbiA9IHNwYW5zW2UuaV07XG4gICAgY29uc3QgZHN0U2xhY2s6IFNwYW4gPSBzcGFuc1tlLmpdO1xuICAgIGNvbnN0IHNyY1Rhc2s6IFRhc2sgPSB0YXNrc1tlLmldO1xuICAgIGNvbnN0IGRzdFRhc2s6IFRhc2sgPSB0YXNrc1tlLmpdO1xuICAgIGNvbnN0IHNyY1JvdyA9IHRhc2tJbmRleFRvUm93LmdldChlLmkpITtcbiAgICBjb25zdCBkc3RSb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQoZS5qKSE7XG4gICAgY29uc3Qgc3JjRGF5ID0gc3JjU2xhY2suZmluaXNoO1xuICAgIGNvbnN0IGRzdERheSA9IGRzdFNsYWNrLnN0YXJ0O1xuXG4gICAgaWYgKHRhc2tIaWdobGlnaHRzLmhhcyhlLmkpICYmIHRhc2tIaWdobGlnaHRzLmhhcyhlLmopKSB7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIH1cblxuICAgIGRyYXdBcnJvd0JldHdlZW5UYXNrcyhcbiAgICAgIGN0eCxcbiAgICAgIHNyY0RheSxcbiAgICAgIGRzdERheSxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkcmF3UmFuZ2VPdmVybGF5KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgc2NhbGU6IFNjYWxlLFxuICBiZWdpbkRheTogbnVtYmVyLFxuICBlbmREYXk6IG51bWJlcixcbiAgdG90YWxOdW1iZXJPZlJvd3M6IG51bWJlclxuKSB7XG4gIGNvbnN0IHRvcExlZnQgPSBzY2FsZS5mZWF0dXJlKDAsIGJlZ2luRGF5LCBGZWF0dXJlLmRpc3BsYXlSYW5nZVRvcCk7XG4gIGNvbnN0IGJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICB0b3RhbE51bWJlck9mUm93cyxcbiAgICBlbmREYXksXG4gICAgRmVhdHVyZS50YXNrUm93Qm90dG9tXG4gICk7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vdmVybGF5O1xuICBjdHguZmlsbFJlY3QoXG4gICAgdG9wTGVmdC54LFxuICAgIHRvcExlZnQueSxcbiAgICBib3R0b21SaWdodC54IC0gdG9wTGVmdC54LFxuICAgIGJvdHRvbVJpZ2h0LnkgLSB0b3BMZWZ0LnlcbiAgKTtcbiAgY29uc29sZS5sb2coXCJkcmF3UmFuZ2VPdmVybGF5XCIsIHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcbn1cblxuZnVuY3Rpb24gZHJhd0Fycm93QmV0d2VlblRhc2tzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc3JjRGF5OiBudW1iZXIsXG4gIGRzdERheTogbnVtYmVyLFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNUYXNrOiBUYXNrLFxuICBkc3RSb3c6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXJcbikge1xuICBpZiAoc3JjRGF5ID09PSBkc3REYXkpIHtcbiAgICBkcmF3VmVydGljYWxBcnJvd1RvVGFzayhcbiAgICAgIGN0eCxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjRGF5LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdERheSxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgZHJhd0xTaGFwZWRBcnJvd1RvVGFzayhcbiAgICAgIGN0eCxcbiAgICAgIHNjYWxlLFxuICAgICAgc3JjUm93LFxuICAgICAgc3JjRGF5LFxuICAgICAgc3JjVGFzayxcbiAgICAgIGRzdFJvdyxcbiAgICAgIGRzdFRhc2ssXG4gICAgICBkc3REYXksXG4gICAgICBhcnJvd0hlYWRIZWlnaHQsXG4gICAgICBhcnJvd0hlYWRXaWR0aFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2xlYXJDYW52YXMoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50XG4pIHtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLnN1cmZhY2U7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG59XG5cbmZ1bmN0aW9uIHNldEZvbnRTaXplKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBvcHRzOiBSZW5kZXJPcHRpb25zKSB7XG4gIGN0eC5mb250ID0gYCR7b3B0cy5mb250U2l6ZVB4fXB4IHNlcmlmYDtcbn1cblxuLy8gRHJhdyBMIHNoYXBlZCBhcnJvdywgZmlyc3QgZ29pbmcgYmV0d2VlbiByb3dzLCB0aGVuIGdvaW5nIGJldHdlZW4gZGF5cy5cbmZ1bmN0aW9uIGRyYXdMU2hhcGVkQXJyb3dUb1Rhc2soXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNEYXk6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdFRhc2s6IFRhc2ssXG4gIGRzdERheTogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlcixcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlclxuKSB7XG4gIC8vIERyYXcgdmVydGljYWwgcGFydCBvZiB0aGUgXCJMXCIuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY29uc3QgZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSBzcmNSb3cgPCBkc3RSb3cgPyBcImRvd25cIiA6IFwidXBcIjtcbiAgY29uc3QgdmVydExpbmVTdGFydCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgc3JjUm93LFxuICAgIHNyY0RheSxcbiAgICB2ZXJ0aWNhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihzcmNUYXNrLCBkaXJlY3Rpb24pXG4gICk7XG4gIGNvbnN0IHZlcnRMaW5lRW5kID0gc2NhbGUuZmVhdHVyZShcbiAgICBkc3RSb3csXG4gICAgc3JjRGF5LFxuICAgIGhvcml6b250YWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihkc3RUYXNrKVxuICApO1xuICBjdHgubW92ZVRvKHZlcnRMaW5lU3RhcnQueCArIDAuNSwgdmVydExpbmVTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIHZlcnRMaW5lRW5kLnkpO1xuXG4gIC8vIERyYXcgaG9yaXpvbnRhbCBwYXJ0IG9mIHRoZSBcIkxcIi5cbiAgY29uc3QgaG9yekxpbmVTdGFydCA9IHZlcnRMaW5lRW5kO1xuICBjb25zdCBob3J6TGluZUVuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIGRzdERheSxcbiAgICBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oZHN0VGFzaylcbiAgKTtcbiAgY3R4Lm1vdmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIGhvcnpMaW5lU3RhcnQueSk7XG4gIGN0eC5saW5lVG8oaG9yekxpbmVFbmQueCArIDAuNSwgaG9yekxpbmVFbmQueSk7XG5cbiAgLy8gRHJhdyB0aGUgYXJyb3doZWFkLiBUaGlzIGFycm93IGhlYWQgd2lsbCBhbHdheXMgcG9pbnQgdG8gdGhlIHJpZ2h0XG4gIC8vIHNpbmNlIHRoYXQncyBob3cgdGltZSBmbG93cy5cbiAgY3R4Lm1vdmVUbyhob3J6TGluZUVuZC54ICsgMC41LCBob3J6TGluZUVuZC55KTtcbiAgY3R4LmxpbmVUbyhcbiAgICBob3J6TGluZUVuZC54IC0gYXJyb3dIZWFkSGVpZ2h0ICsgMC41LFxuICAgIGhvcnpMaW5lRW5kLnkgKyBhcnJvd0hlYWRXaWR0aFxuICApO1xuICBjdHgubW92ZVRvKGhvcnpMaW5lRW5kLnggKyAwLjUsIGhvcnpMaW5lRW5kLnkpO1xuICBjdHgubGluZVRvKFxuICAgIGhvcnpMaW5lRW5kLnggLSBhcnJvd0hlYWRIZWlnaHQgKyAwLjUsXG4gICAgaG9yekxpbmVFbmQueSAtIGFycm93SGVhZFdpZHRoXG4gICk7XG4gIGN0eC5zdHJva2UoKTtcbn1cblxuZnVuY3Rpb24gZHJhd1ZlcnRpY2FsQXJyb3dUb1Rhc2soXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHNyY1JvdzogbnVtYmVyLFxuICBzcmNEYXk6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdERheTogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGNvbnN0IGRpcmVjdGlvbjogRGlyZWN0aW9uID0gc3JjUm93IDwgZHN0Um93ID8gXCJkb3duXCIgOiBcInVwXCI7XG4gIGNvbnN0IGFycm93U3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHNyY1JvdyxcbiAgICBzcmNEYXksXG4gICAgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oc3JjVGFzaywgZGlyZWN0aW9uKVxuICApO1xuICBjb25zdCBhcnJvd0VuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIGRzdERheSxcbiAgICB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKGRzdFRhc2ssIGRpcmVjdGlvbilcbiAgKTtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5tb3ZlVG8oYXJyb3dTdGFydC54ICsgMC41LCBhcnJvd1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKGFycm93RW5kLnggKyAwLjUsIGFycm93RW5kLnkpO1xuXG4gIC8vIERyYXcgdGhlIGFycm93aGVhZC5cbiAgY29uc3QgZGVsdGFZID0gZGlyZWN0aW9uID09PSBcImRvd25cIiA/IC1hcnJvd0hlYWRIZWlnaHQgOiBhcnJvd0hlYWRIZWlnaHQ7XG4gIGN0eC5tb3ZlVG8oYXJyb3dFbmQueCArIDAuNSwgYXJyb3dFbmQueSk7XG4gIGN0eC5saW5lVG8oYXJyb3dFbmQueCAtIGFycm93SGVhZFdpZHRoICsgMC41LCBhcnJvd0VuZC55ICsgZGVsdGFZKTtcbiAgY3R4Lm1vdmVUbyhhcnJvd0VuZC54ICsgMC41LCBhcnJvd0VuZC55KTtcbiAgY3R4LmxpbmVUbyhhcnJvd0VuZC54ICsgYXJyb3dIZWFkV2lkdGggKyAwLjUsIGFycm93RW5kLnkgKyBkZWx0YVkpO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUYXNrVGV4dChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgcm93OiBudW1iZXIsXG4gIHNwYW46IFNwYW4sXG4gIHRhc2s6IFRhc2ssXG4gIHRhc2tJbmRleDogbnVtYmVyLFxuICBvcmlnaW5hbFRhc2tJbmRleDogbnVtYmVyLFxuICBjbGlwV2lkdGg6IG51bWJlcixcbiAgbGFiZWxzOiBzdHJpbmdbXVxuKSB7XG4gIGlmICghb3B0cy5oYXNUZXh0KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGxhYmVsID0gbGFiZWxzW3Rhc2tJbmRleF07XG5cbiAgbGV0IHhTdGFydEluVGltZSA9IHNwYW4uc3RhcnQ7XG4gIGxldCB4UGl4ZWxEZWx0YSA9IDA7XG4gIC8vIERldGVybWluZSB3aGVyZSBvbiB0aGUgeC1heGlzIHRvIHN0YXJ0IGRyYXdpbmcgdGhlIHRhc2sgdGV4dC5cbiAgaWYgKG9wdHMuZGlzcGxheVJhbmdlICE9PSBudWxsICYmIG9wdHMuZGlzcGxheVJhbmdlVXNhZ2UgPT09IFwicmVzdHJpY3RcIikge1xuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5pbihzcGFuLnN0YXJ0KSkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gc3Bhbi5zdGFydDtcbiAgICAgIHhQaXhlbERlbHRhID0gMDtcbiAgICB9IGVsc2UgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmluKHNwYW4uZmluaXNoKSkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gc3Bhbi5maW5pc2g7XG4gICAgICBjb25zdCBtZWFzID0gY3R4Lm1lYXN1cmVUZXh0KGxhYmVsKTtcbiAgICAgIHhQaXhlbERlbHRhID0gLW1lYXMud2lkdGggLSAyICogc2NhbGUubWV0cmljKE1ldHJpYy50ZXh0WE9mZnNldCk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHNwYW4uc3RhcnQgPCBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiAmJlxuICAgICAgc3Bhbi5maW5pc2ggPiBvcHRzLmRpc3BsYXlSYW5nZS5lbmRcbiAgICApIHtcbiAgICAgIHhTdGFydEluVGltZSA9IG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luO1xuICAgICAgeFBpeGVsRGVsdGEgPSBjbGlwV2lkdGggLyAyO1xuICAgIH1cbiAgfVxuICBjdHgubGluZVdpZHRoID0gMTtcbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnRleHRCYXNlbGluZSA9IFwidG9wXCI7XG4gIGNvbnN0IHRleHRTdGFydCA9IHNjYWxlLmZlYXR1cmUocm93LCB4U3RhcnRJblRpbWUsIEZlYXR1cmUudGV4dFN0YXJ0KTtcbiAgY29uc3QgdGV4dFggPSB0ZXh0U3RhcnQueCArIHhQaXhlbERlbHRhO1xuICBjb25zdCB0ZXh0WSA9IHRleHRTdGFydC55O1xuICBjdHguZmlsbFRleHQobGFiZWwsIHRleHRTdGFydC54ICsgeFBpeGVsRGVsdGEsIHRleHRTdGFydC55KTtcbn1cblxuZnVuY3Rpb24gZHJhd1Rhc2tCYXIoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICB0YXNrU3RhcnQ6IFBvaW50LFxuICB0YXNrRW5kOiBQb2ludCxcbiAgdGFza0xpbmVIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGN0eC5maWxsUmVjdChcbiAgICB0YXNrU3RhcnQueCxcbiAgICB0YXNrU3RhcnQueSxcbiAgICB0YXNrRW5kLnggLSB0YXNrU3RhcnQueCxcbiAgICB0YXNrTGluZUhlaWdodFxuICApO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza0hpZ2hsaWdodChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIGhpZ2hsaWdodFN0YXJ0OiBQb2ludCxcbiAgaGlnaGxpZ2h0RW5kOiBQb2ludCxcbiAgY29sb3I6IHN0cmluZyxcbiAgYm9yZGVyV2lkdGg6IG51bWJlclxuKSB7XG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICBjdHgubGluZVdpZHRoID0gYm9yZGVyV2lkdGg7XG4gIGN0eC5zdHJva2VSZWN0KFxuICAgIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0U3RhcnQueSxcbiAgICBoaWdobGlnaHRFbmQueCAtIGhpZ2hsaWdodFN0YXJ0LngsXG4gICAgaGlnaGxpZ2h0RW5kLnkgLSBoaWdobGlnaHRTdGFydC55XG4gICk7XG59XG5cbmZ1bmN0aW9uIGRyYXdTZWxlY3Rpb25IaWdobGlnaHQoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBoaWdobGlnaHRTdGFydDogUG9pbnQsXG4gIGhpZ2hsaWdodEVuZDogUG9pbnQsXG4gIGNvbG9yOiBzdHJpbmdcbikge1xuICBjdHguZmlsbFN0eWxlID0gY29sb3I7XG4gIGN0eC5maWxsUmVjdChcbiAgICBoaWdobGlnaHRTdGFydC54LFxuICAgIGhpZ2hsaWdodFN0YXJ0LnksXG4gICAgaGlnaGxpZ2h0RW5kLnggLSBoaWdobGlnaHRTdGFydC54LFxuICAgIGhpZ2hsaWdodEVuZC55IC0gaGlnaGxpZ2h0U3RhcnQueVxuICApO1xufVxuXG5mdW5jdGlvbiBkcmF3TWlsZXN0b25lKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgdGFza1N0YXJ0OiBQb2ludCxcbiAgZGlhbW9uZERpYW1ldGVyOiBudW1iZXIsXG4gIHBlcmNlbnRIZWlnaHQ6IG51bWJlclxuKSB7XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmxpbmVXaWR0aCA9IHBlcmNlbnRIZWlnaHQgLyAyO1xuICBjdHgubW92ZVRvKHRhc2tTdGFydC54LCB0YXNrU3RhcnQueSAtIGRpYW1vbmREaWFtZXRlcik7XG4gIGN0eC5saW5lVG8odGFza1N0YXJ0LnggKyBkaWFtb25kRGlhbWV0ZXIsIHRhc2tTdGFydC55KTtcbiAgY3R4LmxpbmVUbyh0YXNrU3RhcnQueCwgdGFza1N0YXJ0LnkgKyBkaWFtb25kRGlhbWV0ZXIpO1xuICBjdHgubGluZVRvKHRhc2tTdGFydC54IC0gZGlhbW9uZERpYW1ldGVyLCB0YXNrU3RhcnQueSk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbiAgY3R4LnN0cm9rZSgpO1xufVxuXG5jb25zdCBkcmF3VGltZU1hcmtlckF0RGF5VG9UYXNrID0gKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgcm93OiBudW1iZXIsXG4gIGRheTogbnVtYmVyLFxuICB0YXNrOiBUYXNrLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBzY2FsZTogU2NhbGUsXG4gIGRheXNXaXRoVGltZU1hcmtlcnM6IFNldDxudW1iZXI+LFxuICB0aW1lTWFya2VyUmFuZ2VzOiB4UmFuZ2VbXVxuKSA9PiB7XG4gIGlmIChkYXlzV2l0aFRpbWVNYXJrZXJzLmhhcyhkYXkpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGRheXNXaXRoVGltZU1hcmtlcnMuYWRkKGRheSk7XG4gIGNvbnN0IHRpbWVNYXJrU3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnRpbWVNYXJrU3RhcnQpO1xuXG4gIC8vIERvbid0IGJvdGhlciBkcmF3aW5nIHRoZSBsaW5lIGlmIGl0J3MgdW5kZXIgYW4gZXhpc3RpbmcgdGltZSBsYWJlbC5cbiAgaWYgKFxuICAgIHRpbWVNYXJrZXJSYW5nZXMuZmluZEluZGV4KFxuICAgICAgKFtiZWdpbiwgZW5kXSkgPT4gdGltZU1hcmtTdGFydC54ID49IGJlZ2luICYmIHRpbWVNYXJrU3RhcnQueCA8PSBlbmRcbiAgICApICE9PSAtMVxuICApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB0aW1lTWFya0VuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgcm93LFxuICAgIGRheSxcbiAgICB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKHRhc2ssIFwiZG93blwiKVxuICApO1xuICBjdHgubGluZVdpZHRoID0gMC41O1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vdmVybGF5O1xuXG4gIGN0eC5tb3ZlVG8odGltZU1hcmtTdGFydC54ICsgMC41LCB0aW1lTWFya1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKHRpbWVNYXJrU3RhcnQueCArIDAuNSwgdGltZU1hcmtFbmQueSk7XG4gIGN0eC5zdHJva2UoKTtcblxuICBjdHguc2V0TGluZURhc2goW10pO1xuXG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xuICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnRpbWVUZXh0U3RhcnQpO1xuICBjb25zdCBsYWJlbCA9IG9wdHMuZHVyYXRpb25EaXNwbGF5KGRheSk7XG4gIGNvbnN0IG1lYXMgPSBjdHgubWVhc3VyZVRleHQobGFiZWwpO1xuICBjb25zdCB0ZXh0QmVnaW4gPSB0aW1lTWFya1N0YXJ0Lng7XG4gIGNvbnN0IHRleHRFbmQgPSB0ZXh0U3RhcnQueCArIG1lYXMud2lkdGg7XG4gIGlmIChcbiAgICBvcHRzLmhhc1RleHQgJiZcbiAgICBvcHRzLmhhc1RpbWVsaW5lICYmXG4gICAgLy8gRG9uJ3QgZHJhdyB0aGUgbGFiZWwgaWYgaXQgb3ZlcmxhcHMgYW55IGV4aXN0aW5nIGxhYmVsc3MuXG4gICAgdGltZU1hcmtlclJhbmdlcy5maW5kSW5kZXgoKFtiZWdpbiwgZW5kXSkgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgKHRleHRCZWdpbiA8PSBiZWdpbiAmJiB0ZXh0RW5kID49IGJlZ2luKSB8fFxuICAgICAgICAodGV4dEJlZ2luIDw9IGVuZCAmJiB0ZXh0RW5kID49IGVuZClcbiAgICAgICk7XG4gICAgfSkgPT09IC0xXG4gICkge1xuICAgIGN0eC5maWxsVGV4dChgJHtsYWJlbH1gLCB0ZXh0U3RhcnQueCwgdGV4dFN0YXJ0LnkpO1xuICAgIHRpbWVNYXJrZXJSYW5nZXMucHVzaChbdGV4dEJlZ2luLCB0ZXh0RW5kXSk7XG4gIH1cbn07XG5cbi8qKiBSZXByZXNlbnRzIGEgaGFsZi1vcGVuIGludGVydmFsIG9mIHJvd3MsIGUuZy4gW3N0YXJ0LCBmaW5pc2gpLiAqL1xuaW50ZXJmYWNlIFJvd1JhbmdlIHtcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZmluaXNoOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBUYXNrSW5kZXhUb1Jvd1JldHVybiB7XG4gIHRhc2tJbmRleFRvUm93OiBUYXNrSW5kZXhUb1JvdztcblxuICAvKiogTWFwcyBlYWNoIHJlc291cmNlIHZhbHVlIGluZGV4IHRvIGEgcmFuZ2Ugb2Ygcm93cy4gKi9cbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4gfCBudWxsO1xuXG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uIHwgbnVsbDtcbn1cblxuY29uc3QgdGFza0luZGV4VG9Sb3dGcm9tR3JvdXBCeSA9IChcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb24gfCB1bmRlZmluZWQsXG4gIGNoYXJ0TGlrZTogQ2hhcnRMaWtlLFxuICBkaXNwbGF5T3JkZXI6IFZlcnRleEluZGljZXNcbik6IFJlc3VsdDxUYXNrSW5kZXhUb1Jvd1JldHVybj4gPT4ge1xuICAvLyBkaXNwbGF5T3JkZXIgbWFwcyBmcm9tIHJvdyB0byB0YXNrIGluZGV4LCB0aGlzIHdpbGwgcHJvZHVjZSB0aGUgaW52ZXJzZSBtYXBwaW5nLlxuICBjb25zdCB0YXNrSW5kZXhUb1JvdyA9IG5ldyBNYXAoXG4gICAgLy8gVGhpcyBsb29rcyBiYWNrd2FyZHMsIGJ1dCBpdCBpc24ndC4gUmVtZW1iZXIgdGhhdCB0aGUgbWFwIGNhbGxiYWNrIHRha2VzXG4gICAgLy8gKHZhbHVlLCBpbmRleCkgYXMgaXRzIGFyZ3VtZW50cy5cbiAgICBkaXNwbGF5T3JkZXIubWFwKCh0YXNrSW5kZXg6IG51bWJlciwgcm93OiBudW1iZXIpID0+IFt0YXNrSW5kZXgsIHJvd10pXG4gICk7XG5cbiAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHRhc2tJbmRleFRvUm93OiB0YXNrSW5kZXhUb1JvdyxcbiAgICAgIHJvd1JhbmdlczogbnVsbCxcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbjogbnVsbCxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IHN0YXJ0VGFza0luZGV4ID0gMDtcbiAgY29uc3QgZmluaXNoVGFza0luZGV4ID0gY2hhcnRMaWtlLlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gIGNvbnN0IGlnbm9yYWJsZSA9IFtzdGFydFRhc2tJbmRleCwgZmluaXNoVGFza0luZGV4XTtcblxuICAvLyBHcm91cCBhbGwgdGFza3MgYnkgdGhlaXIgcmVzb3VyY2UgdmFsdWUsIHdoaWxlIHByZXNlcnZpbmcgZGlzcGxheU9yZGVyXG4gIC8vIG9yZGVyIHdpdGggdGhlIGdyb3Vwcy5cbiAgY29uc3QgZ3JvdXBzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcltdPigpO1xuICBkaXNwbGF5T3JkZXIuZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCByZXNvdXJjZVZhbHVlID1cbiAgICAgIGNoYXJ0TGlrZS5WZXJ0aWNlc1t0YXNrSW5kZXhdLmdldFJlc291cmNlKG9wdHMuZ3JvdXBCeVJlc291cmNlKSB8fCBcIlwiO1xuICAgIGNvbnN0IGdyb3VwTWVtYmVycyA9IGdyb3Vwcy5nZXQocmVzb3VyY2VWYWx1ZSkgfHwgW107XG4gICAgZ3JvdXBNZW1iZXJzLnB1c2godGFza0luZGV4KTtcbiAgICBncm91cHMuc2V0KHJlc291cmNlVmFsdWUsIGdyb3VwTWVtYmVycyk7XG4gIH0pO1xuXG4gIGNvbnN0IHJldCA9IG5ldyBNYXA8bnVtYmVyLCBudW1iZXI+KCk7XG5cbiAgLy8gVWdoLCBTdGFydCBhbmQgRmluaXNoIFRhc2tzIG5lZWQgdG8gYmUgbWFwcGVkLCBidXQgc2hvdWxkIG5vdCBiZSBkb25lIHZpYVxuICAvLyByZXNvdXJjZSB2YWx1ZSwgc28gU3RhcnQgc2hvdWxkIGFsd2F5cyBiZSBmaXJzdC5cbiAgcmV0LnNldCgwLCAwKTtcblxuICAvLyBOb3cgaW5jcmVtZW50IHVwIHRoZSByb3dzIGFzIHdlIG1vdmUgdGhyb3VnaCBhbGwgdGhlIGdyb3Vwcy5cbiAgbGV0IHJvdyA9IDE7XG4gIC8vIEFuZCB0cmFjayBob3cgbWFueSByb3dzIGFyZSBpbiBlYWNoIGdyb3VwLlxuICBjb25zdCByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPiA9IG5ldyBNYXAoKTtcbiAgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlcy5mb3JFYWNoKFxuICAgIChyZXNvdXJjZVZhbHVlOiBzdHJpbmcsIHJlc291cmNlSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3Qgc3RhcnRPZlJvdyA9IHJvdztcbiAgICAgIChncm91cHMuZ2V0KHJlc291cmNlVmFsdWUpIHx8IFtdKS5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoaWdub3JhYmxlLmluY2x1ZGVzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0LnNldCh0YXNrSW5kZXgsIHJvdyk7XG4gICAgICAgIHJvdysrO1xuICAgICAgfSk7XG4gICAgICByb3dSYW5nZXMuc2V0KHJlc291cmNlSW5kZXgsIHsgc3RhcnQ6IHN0YXJ0T2ZSb3csIGZpbmlzaDogcm93IH0pO1xuICAgIH1cbiAgKTtcbiAgcmV0LnNldChmaW5pc2hUYXNrSW5kZXgsIHJvdyk7XG5cbiAgcmV0dXJuIG9rKHtcbiAgICB0YXNrSW5kZXhUb1JvdzogcmV0LFxuICAgIHJvd1Jhbmdlczogcm93UmFuZ2VzLFxuICAgIHJlc291cmNlRGVmaW5pdGlvbjogcmVzb3VyY2VEZWZpbml0aW9uLFxuICB9KTtcbn07XG5cbmNvbnN0IGRyYXdTd2ltTGFuZUhpZ2hsaWdodHMgPSAoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+LFxuICB0b3RhbE51bWJlck9mRGF5czogbnVtYmVyLFxuICBncm91cENvbG9yOiBzdHJpbmdcbikgPT4ge1xuICBjdHguZmlsbFN0eWxlID0gZ3JvdXBDb2xvcjtcblxuICBsZXQgZ3JvdXAgPSAwO1xuICByb3dSYW5nZXMuZm9yRWFjaCgocm93UmFuZ2U6IFJvd1JhbmdlKSA9PiB7XG4gICAgY29uc3QgdG9wTGVmdCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3dSYW5nZS5zdGFydCxcbiAgICAgIDAsXG4gICAgICBGZWF0dXJlLmdyb3VwRW52ZWxvcGVTdGFydFxuICAgICk7XG4gICAgY29uc3QgYm90dG9tUmlnaHQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgcm93UmFuZ2UuZmluaXNoLFxuICAgICAgdG90YWxOdW1iZXJPZkRheXMgKyAxLFxuICAgICAgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3BcbiAgICApO1xuICAgIGdyb3VwKys7XG4gICAgLy8gT25seSBoaWdobGlnaHQgZXZlcnkgb3RoZXIgZ3JvdXAgYmFja2dyb3VkIHdpdGggdGhlIGdyb3VwQ29sb3IuXG4gICAgaWYgKGdyb3VwICUgMiA9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGN0eC5maWxsUmVjdChcbiAgICAgIHRvcExlZnQueCxcbiAgICAgIHRvcExlZnQueSxcbiAgICAgIGJvdHRvbVJpZ2h0LnggLSB0b3BMZWZ0LngsXG4gICAgICBib3R0b21SaWdodC55IC0gdG9wTGVmdC55XG4gICAgKTtcbiAgfSk7XG59O1xuXG5jb25zdCBkcmF3U3dpbUxhbmVMYWJlbHMgPSAoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICByZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvbixcbiAgc2NhbGU6IFNjYWxlLFxuICByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPlxuKSA9PiB7XG4gIGlmIChyb3dSYW5nZXMpIGN0eC5saW5lV2lkdGggPSAxO1xuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjb25zdCBncm91cEJ5T3JpZ2luID0gc2NhbGUuZmVhdHVyZSgwLCAwLCBGZWF0dXJlLmdyb3VwQnlPcmlnaW4pO1xuXG4gIGlmIChvcHRzLmhhc1RpbWVsaW5lKSB7XG4gICAgY3R4LnRleHRCYXNlbGluZSA9IFwiYm90dG9tXCI7XG4gICAgY3R4LmZpbGxUZXh0KG9wdHMuZ3JvdXBCeVJlc291cmNlLCBncm91cEJ5T3JpZ2luLngsIGdyb3VwQnlPcmlnaW4ueSk7XG4gIH1cblxuICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xuICAgIHJvd1Jhbmdlcy5mb3JFYWNoKChyb3dSYW5nZTogUm93UmFuZ2UsIHJlc291cmNlSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgaWYgKHJvd1JhbmdlLnN0YXJ0ID09PSByb3dSYW5nZS5maW5pc2gpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgdGV4dFN0YXJ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgICAgcm93UmFuZ2Uuc3RhcnQsXG4gICAgICAgIDAsXG4gICAgICAgIEZlYXR1cmUuZ3JvdXBUZXh0U3RhcnRcbiAgICAgICk7XG4gICAgICBjdHguZmlsbFRleHQoXG4gICAgICAgIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbcmVzb3VyY2VJbmRleF0sXG4gICAgICAgIHRleHRTdGFydC54LFxuICAgICAgICB0ZXh0U3RhcnQueVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxufTtcbiIsICIvLyBXaGVuIGFkZGluZyBwcm9wZXJ0aWVzIHRvIENvbG9yVGhlbWUgYWxzbyBtYWtlIHN1cmUgdG8gYWRkIGEgY29ycmVzcG9uZGluZ1xuLy8gQ1NTIEBwcm9wZXJ0eSBkZWNsYXJhdGlvbi5cbi8vXG4vLyBOb3RlIHRoYXQgZWFjaCBwcm9wZXJ0eSBhc3N1bWVzIHRoZSBwcmVzZW5jZSBvZiBhIENTUyB2YXJpYWJsZSBvZiB0aGUgc2FtZSBuYW1lXG4vLyB3aXRoIGEgcHJlY2VlZGluZyBgLS1gLlxuZXhwb3J0IGludGVyZmFjZSBUaGVtZSB7XG4gIHN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZU11dGVkOiBzdHJpbmc7XG4gIG9uU3VyZmFjZVNlY29uZGFyeTogc3RyaW5nO1xuICBvdmVybGF5OiBzdHJpbmc7XG4gIGdyb3VwQ29sb3I6IHN0cmluZztcbiAgaGlnaGxpZ2h0OiBzdHJpbmc7XG4gIGFkZGVkOiBzdHJpbmc7XG4gIHJlbW92ZWQ6IHN0cmluZztcbn1cblxudHlwZSBUaGVtZVByb3AgPSBrZXlvZiBUaGVtZTtcblxuY29uc3QgY29sb3JUaGVtZVByb3RvdHlwZTogVGhlbWUgPSB7XG4gIHN1cmZhY2U6IFwiXCIsXG4gIG9uU3VyZmFjZTogXCJcIixcbiAgb25TdXJmYWNlTXV0ZWQ6IFwiXCIsXG4gIG9uU3VyZmFjZVNlY29uZGFyeTogXCJcIixcbiAgb3ZlcmxheTogXCJcIixcbiAgZ3JvdXBDb2xvcjogXCJcIixcbiAgaGlnaGxpZ2h0OiBcIlwiLFxuICBhZGRlZDogXCJcIixcbiAgcmVtb3ZlZDogXCJcIixcbn07XG5cbmV4cG9ydCBjb25zdCBjb2xvclRoZW1lRnJvbUVsZW1lbnQgPSAoZWxlOiBIVE1MRWxlbWVudCk6IFRoZW1lID0+IHtcbiAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZSk7XG4gIGNvbnN0IHJldCA9IE9iamVjdC5hc3NpZ24oe30sIGNvbG9yVGhlbWVQcm90b3R5cGUpO1xuICBPYmplY3Qua2V5cyhyZXQpLmZvckVhY2goKG5hbWU6IHN0cmluZykgPT4ge1xuICAgIHJldFtuYW1lIGFzIFRoZW1lUHJvcF0gPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGAtLSR7bmFtZX1gKTtcbiAgfSk7XG4gIHJldHVybiByZXQ7XG59O1xuIiwgImltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBNZXRyaWNSYW5nZSB9IGZyb20gXCIuLi9tZXRyaWNzL3JhbmdlXCI7XG5pbXBvcnQge1xuICBEdXBUYXNrT3AsXG4gIEluc2VydE5ld0VtcHR5TWlsZXN0b25lQWZ0ZXJPcCxcbiAgU2V0VGFza05hbWVPcCxcbiAgU3BsaXRUYXNrT3AsXG59IGZyb20gXCIuLi9vcHMvY2hhcnRcIjtcbmltcG9ydCB7IEFkZE1ldHJpY09wLCBTZXRNZXRyaWNWYWx1ZU9wIH0gZnJvbSBcIi4uL29wcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBPcCwgYXBwbHlBbGxPcHNUb1BsYW4gfSBmcm9tIFwiLi4vb3BzL29wc1wiO1xuaW1wb3J0IHtcbiAgQWRkUmVzb3VyY2VPcCxcbiAgQWRkUmVzb3VyY2VPcHRpb25PcCxcbiAgRGVsZXRlUmVzb3VyY2VPcHRpb25PcCxcbiAgUmVuYW1lUmVzb3VyY2VPcHRpb25PcCxcbiAgU2V0UmVzb3VyY2VWYWx1ZU9wLFxufSBmcm9tIFwiLi4vb3BzL3Jlc291cmNlc1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW5cIjtcblxuY29uc3QgcGVvcGxlOiBzdHJpbmdbXSA9IFtcIkZyZWRcIiwgXCJCYXJuZXlcIiwgXCJXaWxtYVwiLCBcIkJldHR5XCJdO1xuXG5jb25zdCBEVVJBVElPTiA9IDEwO1xuXG5jb25zdCBybmRJbnQgPSAobjogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG4pO1xufTtcblxuY29uc3Qgcm5kRHVyYXRpb24gPSAoKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIHJuZEludChEVVJBVElPTik7XG59O1xuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVTdGFydGVyUGxhbiA9ICgpOiBQbGFuID0+IHtcbiAgY29uc3QgcGxhbiA9IG5ldyBQbGFuKCk7XG4gIGNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKFxuICAgIFtcbiAgICAgIEluc2VydE5ld0VtcHR5TWlsZXN0b25lQWZ0ZXJPcCgwKSxcbiAgICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCAxMCwgMSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcImxvd1wiLCAxKSxcbiAgICBdLFxuICAgIHBsYW5cbiAgKTtcblxuICBpZiAoIXJlcy5vaykge1xuICAgIGNvbnNvbGUubG9nKHJlcy5lcnJvcik7XG4gIH1cbiAgcmV0dXJuIHBsYW47XG59O1xuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVSYW5kb21QbGFuID0gKCk6IFBsYW4gPT4ge1xuICBjb25zdCBwbGFuID0gbmV3IFBsYW4oKTtcblxuICBjb25zdCBvcHM6IE9wW10gPSBbQWRkUmVzb3VyY2VPcChcIlBlcnNvblwiKV07XG5cbiAgcGVvcGxlLmZvckVhY2goKHBlcnNvbjogc3RyaW5nKSA9PiB7XG4gICAgb3BzLnB1c2goQWRkUmVzb3VyY2VPcHRpb25PcChcIlBlcnNvblwiLCBwZXJzb24pKTtcbiAgfSk7XG4gIG9wcy5wdXNoKERlbGV0ZVJlc291cmNlT3B0aW9uT3AoXCJQZXJzb25cIiwgXCJcIikpO1xuXG4gIG9wcy5wdXNoKFxuICAgIEFkZE1ldHJpY09wKFwiQ29zdCAoJC9ocilcIiwgbmV3IE1ldHJpY0RlZmluaXRpb24oMTUsIG5ldyBNZXRyaWNSYW5nZSgwKSkpLFxuICAgIEluc2VydE5ld0VtcHR5TWlsZXN0b25lQWZ0ZXJPcCgwKSxcbiAgICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgMSksXG4gICAgU2V0VGFza05hbWVPcCgxLCByYW5kb21UYXNrTmFtZSgpKSxcbiAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIDEpLFxuICAgIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibW9kZXJhdGVcIiwgMSlcbiAgKTtcblxuICBsZXQgbnVtVGFza3MgPSAxO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDUwOyBpKyspIHtcbiAgICBsZXQgaW5kZXggPSBybmRJbnQobnVtVGFza3MpICsgMTtcbiAgICBvcHMucHVzaChcbiAgICAgIFNwbGl0VGFza09wKGluZGV4KSxcbiAgICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCBybmREdXJhdGlvbigpLCBpbmRleCArIDEpLFxuICAgICAgU2V0VGFza05hbWVPcChpbmRleCArIDEsIHJhbmRvbVRhc2tOYW1lKCkpLFxuICAgICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiUGVyc29uXCIsIHBlb3BsZVtybmRJbnQocGVvcGxlLmxlbmd0aCldLCBpbmRleCArIDEpLFxuICAgICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCBpbmRleCArIDEpXG4gICAgKTtcbiAgICBudW1UYXNrcysrO1xuICAgIGluZGV4ID0gcm5kSW50KG51bVRhc2tzKSArIDE7XG4gICAgb3BzLnB1c2goXG4gICAgICBEdXBUYXNrT3AoaW5kZXgpLFxuICAgICAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIHJuZER1cmF0aW9uKCksIGluZGV4ICsgMSksXG4gICAgICBTZXRUYXNrTmFtZU9wKGluZGV4ICsgMSwgcmFuZG9tVGFza05hbWUoKSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIGluZGV4ICsgMSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcIm1vZGVyYXRlXCIsIGluZGV4ICsgMSlcbiAgICApO1xuICAgIG51bVRhc2tzKys7XG4gIH1cblxuICBjb25zdCByZXMgPSBhcHBseUFsbE9wc1RvUGxhbihvcHMsIHBsYW4pO1xuXG4gIGlmICghcmVzLm9rKSB7XG4gICAgY29uc29sZS5sb2cocmVzLmVycm9yKTtcbiAgfVxuICByZXR1cm4gcGxhbjtcbn07XG5cbmNvbnN0IHBhcnRzID0gW1xuICBcImxvcmVtXCIsXG4gIFwiaXBzdW1cIixcbiAgXCJkb2xvclwiLFxuICBcInNpdFwiLFxuICBcImFtZXRcIixcbiAgXCJjb25zZWN0ZXR1clwiLFxuICBcImFkaXBpc2NpbmdcIixcbiAgXCJlbGl0XCIsXG4gIFwic2VkXCIsXG4gIFwiZG9cIixcbiAgXCJlaXVzbW9kXCIsXG4gIFwidGVtcG9yXCIsXG4gIFwiaW5jaWRpZHVudFwiLFxuICBcInV0XCIsXG4gIFwibGFib3JlXCIsXG4gIFwiZXRcIixcbiAgXCJkb2xvcmVcIixcbiAgXCJtYWduYVwiLFxuICBcImFsaXF1YVwiLFxuICBcInV0XCIsXG4gIFwiZW5pbVwiLFxuICBcImFkXCIsXG4gIFwibWluaW1cIixcbiAgXCJ2ZW5pYW1cIixcbiAgXCJxdWlzXCIsXG4gIFwibm9zdHJ1ZFwiLFxuICBcImV4ZXJjaXRhdGlvblwiLFxuICBcInVsbGFtY29cIixcbiAgXCJsYWJvcmlzXCIsXG4gIFwibmlzaVwiLFxuICBcInV0XCIsXG4gIFwiYWxpcXVpcFwiLFxuICBcImV4XCIsXG4gIFwiZWFcIixcbiAgXCJjb21tb2RvXCIsXG4gIFwiY29uc2VxdWF0XCIsXG4gIFwiZXVpc1wiLFxuICBcImF1dGVcIixcbiAgXCJpcnVyZVwiLFxuICBcImRvbG9yXCIsXG4gIFwiaW5cIixcbiAgXCJyZXByZWhlbmRlcml0XCIsXG4gIFwiaW5cIixcbiAgXCJ2b2x1cHRhdGVcIixcbiAgXCJ2ZWxpdFwiLFxuICBcImVzc2VcIixcbiAgXCJjaWxsdW1cIixcbiAgXCJkb2xvcmVcIixcbiAgXCJldVwiLFxuICBcImZ1Z2lhdFwiLFxuICBcIm51bGxhXCIsXG4gIFwicGFyaWF0dXJcIixcbiAgXCJleGNlcHRldXJcIixcbiAgXCJzaW50XCIsXG4gIFwib2NjYWVjYXRcIixcbiAgXCJjdXBpZGF0YXRcIixcbiAgXCJub25cIixcbiAgXCJwcm9pZGVudFwiLFxuICBcInN1bnRcIixcbiAgXCJpblwiLFxuICBcImN1bHBhXCIsXG4gIFwicXVpXCIsXG4gIFwib2ZmaWNpYVwiLFxuICBcImRlc2VydW50XCIsXG4gIFwibW9sbGl0XCIsXG4gIFwiYW5pbVwiLFxuICBcImlkXCIsXG4gIFwiZXN0XCIsXG4gIFwibGFib3J1bVwiLFxuXTtcblxuY29uc3QgcGFydHNMZW5ndGggPSBwYXJ0cy5sZW5ndGg7XG5cbmNvbnN0IHJhbmRvbVRhc2tOYW1lID0gKCk6IHN0cmluZyA9PlxuICBgJHtwYXJ0c1tybmRJbnQocGFydHNMZW5ndGgpXX0gJHtwYXJ0c1tybmRJbnQocGFydHNMZW5ndGgpXX1gO1xuIiwgImltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IEZpbHRlckZ1bmMgfSBmcm9tIFwiLi4vY2hhcnQvZmlsdGVyL2ZpbHRlci50c1wiO1xuaW1wb3J0IHsgRGlyZWN0ZWRFZGdlLCBlZGdlc0J5U3JjQW5kRHN0VG9NYXAgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHsgU2V0TWV0cmljVmFsdWVPcCB9IGZyb20gXCIuLi9vcHMvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgU2V0UmVzb3VyY2VWYWx1ZU9wIH0gZnJvbSBcIi4uL29wcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQge1xuICBESVZJREVSX01PVkVfRVZFTlQsXG4gIERpdmlkZXJNb3ZlLFxuICBEaXZpZGVyTW92ZVJlc3VsdCxcbn0gZnJvbSBcIi4uL3JlbmRlcmVyL2RpdmlkZXJtb3ZlL2RpdmlkZXJtb3ZlLnRzXCI7XG5pbXBvcnQge1xuICBEUkFHX1JBTkdFX0VWRU5ULFxuICBEcmFnUmFuZ2UsXG4gIE1vdXNlRHJhZyxcbn0gZnJvbSBcIi4uL3JlbmRlcmVyL21vdXNlZHJhZy9tb3VzZWRyYWcudHNcIjtcbmltcG9ydCB7IE1vdXNlTW92ZSB9IGZyb20gXCIuLi9yZW5kZXJlci9tb3VzZW1vdmUvbW91c2Vtb3ZlLnRzXCI7XG5pbXBvcnQgeyBEaXNwbGF5UmFuZ2UgfSBmcm9tIFwiLi4vcmVuZGVyZXIvcmFuZ2UvcmFuZ2UudHNcIjtcbmltcG9ydCB7XG4gIFJlbmRlck9wdGlvbnMsXG4gIFJlbmRlclJlc3VsdCxcbiAgVGFza0xhYmVsLFxuICBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MsXG4gIHJlbmRlclRhc2tzVG9DYW52YXMsXG4gIHN1Z2dlc3RlZENhbnZhc0hlaWdodCxcbn0gZnJvbSBcIi4uL3JlbmRlcmVyL3JlbmRlcmVyLnRzXCI7XG5pbXBvcnQgeyBwdCB9IGZyb20gXCIuLi9wb2ludC9wb2ludC50c1wiO1xuaW1wb3J0IHsgU2NhbGUgfSBmcm9tIFwiLi4vcmVuZGVyZXIvc2NhbGUvc2NhbGUudHNcIjtcbmltcG9ydCB7IFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IENvbXB1dGVTbGFjaywgQ3JpdGljYWxQYXRoLCBTbGFjaywgU3BhbiB9IGZyb20gXCIuLi9zbGFjay9zbGFjay50c1wiO1xuaW1wb3J0IHsgVGhlbWUsIGNvbG9yVGhlbWVGcm9tRWxlbWVudCB9IGZyb20gXCIuLi9zdHlsZS90aGVtZS90aGVtZS50c1wiO1xuaW1wb3J0IHtcbiAgZ2VuZXJhdGVSYW5kb21QbGFuLFxuICBnZW5lcmF0ZVN0YXJ0ZXJQbGFuLFxufSBmcm9tIFwiLi4vZ2VuZXJhdGUvZ2VuZXJhdGUudHNcIjtcbmltcG9ydCB7IGV4ZWN1dGUsIGV4ZWN1dGVPcCB9IGZyb20gXCIuLi9hY3Rpb24vZXhlY3V0ZS50c1wiO1xuaW1wb3J0IHsgU3RhcnRLZXlib2FyZEhhbmRsaW5nIH0gZnJvbSBcIi4uL2tleW1hcC9rZXltYXAudHNcIjtcbmltcG9ydCB7IFJlbW92ZUVkZ2VPcCwgU2V0VGFza05hbWVPcCB9IGZyb20gXCIuLi9vcHMvY2hhcnQudHNcIjtcbmltcG9ydCB7IERlcGVuZGVuY2llc1BhbmVsIH0gZnJvbSBcIi4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmNpZXMtcGFuZWwudHNcIjtcbmltcG9ydCB7IEFjdGlvbk5hbWVzIH0gZnJvbSBcIi4uL2FjdGlvbi9yZWdpc3RyeS50c1wiO1xuaW1wb3J0IHtcbiAgU2VsZWN0ZWRUYXNrUGFuZWwsXG4gIFRhc2tNZXRyaWNWYWx1ZUNoYW5nZURldGFpbHMsXG4gIFRhc2tOYW1lQ2hhbmdlRGV0YWlscyxcbiAgVGFza1Jlc291cmNlVmFsdWVDaGFuZ2VEZXRhaWxzLFxufSBmcm9tIFwiLi4vc2VsZWN0ZWQtdGFzay1wYW5lbC9zZWxlY3RlZC10YXNrLXBhbmVsLnRzXCI7XG5pbXBvcnQgeyByZXBvcnRPbkVycm9yIH0gZnJvbSBcIi4uL3JlcG9ydC1lcnJvci9yZXBvcnQtZXJyb3IudHNcIjtcbmltcG9ydCB7IFRhc2tEdXJhdGlvbiB9IGZyb20gXCIuLi90eXBlcy90eXBlcy50c1wiO1xuaW1wb3J0IHsgU2ltdWxhdGlvblBhbmVsIH0gZnJvbSBcIi4uL3NpbXVsYXRpb24tcGFuZWwvc2ltdWxhdGlvbi1wYW5lbC50c1wiO1xuaW1wb3J0IHsgYXBwbHlTdG9yZWRUaGVtZSB9IGZyb20gXCIuLi9zdHlsZS90b2dnbGVyL3RvZ2dsZXIudHNcIjtcbmltcG9ydCB7IEVkaXRSZXNvdXJjZXNEaWFsb2cgfSBmcm9tIFwiLi4vZWRpdC1yZXNvdXJjZXMtZGlhbG9nL2VkaXQtcmVzb3VyY2VzLWRpYWxvZy50c1wiO1xuaW1wb3J0IHsgRWRpdE1ldHJpY3NEaWFsb2cgfSBmcm9tIFwiLi4vZWRpdC1tZXRyaWNzLWRpYWxvZy9lZGl0LW1ldHJpY3MtZGlhbG9nLnRzXCI7XG5cbmNvbnN0IEZPTlRfU0laRV9QWCA9IDMyO1xuXG5jb25zdCBOVU1fU0lNVUxBVElPTl9MT09QUyA9IDEwMDtcblxuZXhwb3J0IGNsYXNzIEV4cGxhbk1haW4gZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIC8qKiBUaGUgUGxhbiBiZWluZyBlZGl0ZWQuICovXG4gIHBsYW46IFBsYW4gPSBuZXcgUGxhbigpO1xuXG4gIC8qKiBUaGUgc3RhcnQgYW5kIGZpbmlzaCB0aW1lIGZvciBlYWNoIFRhc2sgaW4gdGhlIFBsYW4uICovXG4gIHNwYW5zOiBTcGFuW10gPSBbXTtcblxuICAvKiogVGhlIHRhc2sgaW5kaWNlcyBvZiB0YXNrcyBvbiB0aGUgY3JpdGljYWwgcGF0aC4gKi9cbiAgY3JpdGljYWxQYXRoOiBudW1iZXJbXSA9IFtdO1xuXG4gIC8qKiBUaGUgc2VsZWN0aW9uIChpbiB0aW1lKSBvZiB0aGUgUGxhbiBjdXJyZW50bHkgYmVpbmcgdmlld2VkLiAqL1xuICBkaXNwbGF5UmFuZ2U6IERpc3BsYXlSYW5nZSB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBTY2FsZSBmb3IgdGhlIHJhZGFyIHZpZXcsIHVzZWQgZm9yIGRyYWcgc2VsZWN0aW5nIGEgZGlzcGxheVJhbmdlLiAqL1xuICByYWRhclNjYWxlOiBTY2FsZSB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBBbGwgb2YgdGhlIHR5cGVzIG9mIHJlc291cmNlcyBpbiB0aGUgcGxhbi4gKi9cbiAgZ3JvdXBCeU9wdGlvbnM6IHN0cmluZ1tdID0gW107XG5cbiAgLyoqIFdoaWNoIG9mIHRoZSByZXNvdXJjZXMgYXJlIHdlIGN1cnJlbnRseSBncm91cGluZyBieSwgd2hlcmUgMCBtZWFucyBub1xuICAgKiBncm91cGluZyBpcyBkb25lLiAqL1xuICBncm91cEJ5T3B0aW9uc0luZGV4OiBudW1iZXIgPSAwO1xuXG4gIC8qKiBUaGUgY3VycmVudGx5IHNlbGVjdGVkIHRhc2ssIGFzIGFuIGluZGV4LiAqL1xuICBzZWxlY3RlZFRhc2s6IG51bWJlciA9IC0xO1xuXG4gIC8vIFVJIGZlYXR1cmVzIHRoYXQgY2FuIGJlIHRvZ2dsZWQgb24gYW5kIG9mZi5cbiAgdG9wVGltZWxpbmU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgY3JpdGljYWxQYXRoc09ubHk6IGJvb2xlYW4gPSBmYWxzZTtcbiAgZm9jdXNPblRhc2s6IGJvb2xlYW4gPSBmYWxzZTtcbiAgbW91c2VNb3ZlOiBNb3VzZU1vdmUgfCBudWxsID0gbnVsbDtcblxuICBkZXBlbmRlbmNpZXNQYW5lbDogRGVwZW5kZW5jaWVzUGFuZWwgfCBudWxsID0gbnVsbDtcblxuICBkb3dubG9hZExpbms6IEhUTUxBbmNob3JFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgc2VsZWN0ZWRUYXNrUGFuZWw6IFNlbGVjdGVkVGFza1BhbmVsIHwgbnVsbCA9IG51bGw7XG5cbiAgYWx0ZXJuYXRlVGFza0R1cmF0aW9uczogbnVtYmVyW10gfCBudWxsID0gbnVsbDtcblxuICBzaW11bGF0aW9uUGFuZWw6IFNpbXVsYXRpb25QYW5lbCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBDYWxsYmFjayB0byBjYWxsIHdoZW4gYSBtb3VzZSBtb3ZlcyBvdmVyIHRoZSBjaGFydC4gKi9cbiAgdXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zOiBVcGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgfCBudWxsID0gbnVsbDtcblxuICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICB0aGlzLnNpbXVsYXRpb25QYW5lbCA9XG4gICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3I8U2ltdWxhdGlvblBhbmVsPihcInNpbXVsYXRpb24tcGFuZWxcIik7XG4gICAgdGhpcy5zaW11bGF0aW9uUGFuZWwhLmFkZEV2ZW50TGlzdGVuZXIoXCJzaW11bGF0aW9uLXNlbGVjdFwiLCAoZSkgPT4ge1xuICAgICAgdGhpcy5hbHRlcm5hdGVUYXNrRHVyYXRpb25zID0gZS5kZXRhaWwuZHVyYXRpb25zO1xuICAgICAgdGhpcy5jcml0aWNhbFBhdGggPSBlLmRldGFpbC5jcml0aWNhbFBhdGg7XG4gICAgICB0aGlzLnJlY2FsY3VsYXRlU3BhbnNBbmRDcml0aWNhbFBhdGgoKTtcbiAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5kb3dubG9hZExpbmsgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTEFuY2hvckVsZW1lbnQ+KFwiI2Rvd25sb2FkXCIpITtcbiAgICB0aGlzLmRvd25sb2FkTGluay5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5wcmVwYXJlRG93bmxvYWQoKTtcbiAgICB9KTtcbiAgICB0aGlzLmRlcGVuZGVuY2llc1BhbmVsID0gdGhpcy5xdWVyeVNlbGVjdG9yKFwiZGVwZW5kZW5jaWVzLXBhbmVsXCIpITtcblxuICAgIHRoaXMuZGVwZW5kZW5jaWVzUGFuZWwhLmFkZEV2ZW50TGlzdGVuZXIoXCJhZGQtZGVwZW5kZW5jeVwiLCBhc3luYyAoZSkgPT4ge1xuICAgICAgbGV0IGFjdGlvbk5hbWU6IEFjdGlvbk5hbWVzID0gXCJBZGRQcmVkZWNlc3NvckFjdGlvblwiO1xuICAgICAgaWYgKGUuZGV0YWlsLmRlcFR5cGUgPT09IFwic3VjY1wiKSB7XG4gICAgICAgIGFjdGlvbk5hbWUgPSBcIkFkZFN1Y2Nlc3NvckFjdGlvblwiO1xuICAgICAgfVxuICAgICAgY29uc3QgcmV0ID0gYXdhaXQgZXhlY3V0ZShhY3Rpb25OYW1lLCB0aGlzKTtcbiAgICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJldC5lcnJvcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmRlcGVuZGVuY2llc1BhbmVsIS5hZGRFdmVudExpc3RlbmVyKFwiZGVsZXRlLWRlcGVuZGVuY3lcIiwgYXN5bmMgKGUpID0+IHtcbiAgICAgIGxldCBbaSwgal0gPSBbZS5kZXRhaWwudGFza0luZGV4LCB0aGlzLnNlbGVjdGVkVGFza107XG4gICAgICBpZiAoZS5kZXRhaWwuZGVwVHlwZSA9PT0gXCJzdWNjXCIpIHtcbiAgICAgICAgW2ksIGpdID0gW2osIGldO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3AgPSBSZW1vdmVFZGdlT3AoaSwgaik7XG4gICAgICBjb25zdCByZXQgPSBhd2FpdCBleGVjdXRlT3Aob3AsIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCIsIHRydWUsIHRoaXMpO1xuICAgICAgaWYgKCFyZXQub2spIHtcbiAgICAgICAgY29uc29sZS5sb2cocmV0LmVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuc2VsZWN0ZWRUYXNrUGFuZWwgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCJzZWxlY3RlZC10YXNrLXBhbmVsXCIpITtcbiAgICB0aGlzLnNlbGVjdGVkVGFza1BhbmVsLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcInRhc2stbmFtZS1jaGFuZ2VcIixcbiAgICAgIGFzeW5jIChlOiBDdXN0b21FdmVudDxUYXNrTmFtZUNoYW5nZURldGFpbHM+KSA9PiB7XG4gICAgICAgIGNvbnN0IG9wID0gU2V0VGFza05hbWVPcChlLmRldGFpbC50YXNrSW5kZXgsIGUuZGV0YWlsLm5hbWUpO1xuICAgICAgICByZXBvcnRPbkVycm9yKGF3YWl0IGV4ZWN1dGVPcChvcCwgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIiwgdHJ1ZSwgdGhpcykpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnNlbGVjdGVkVGFza1BhbmVsLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcInRhc2stcmVzb3VyY2UtdmFsdWUtY2hhbmdlXCIsXG4gICAgICBhc3luYyAoZTogQ3VzdG9tRXZlbnQ8VGFza1Jlc291cmNlVmFsdWVDaGFuZ2VEZXRhaWxzPikgPT4ge1xuICAgICAgICBjb25zdCB7IG5hbWUsIHZhbHVlLCB0YXNrSW5kZXggfSA9IGUuZGV0YWlsO1xuICAgICAgICBjb25zdCBvcCA9IFNldFJlc291cmNlVmFsdWVPcChuYW1lLCB2YWx1ZSwgdGFza0luZGV4KTtcbiAgICAgICAgcmVwb3J0T25FcnJvcihhd2FpdCBleGVjdXRlT3Aob3AsIFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCIsIHRydWUsIHRoaXMpKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5zZWxlY3RlZFRhc2tQYW5lbC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJ0YXNrLW1ldHJpYy12YWx1ZS1jaGFuZ2VcIixcbiAgICAgIGFzeW5jIChlOiBDdXN0b21FdmVudDxUYXNrTWV0cmljVmFsdWVDaGFuZ2VEZXRhaWxzPikgPT4ge1xuICAgICAgICBjb25zdCB7IG5hbWUsIHZhbHVlLCB0YXNrSW5kZXggfSA9IGUuZGV0YWlsO1xuICAgICAgICBjb25zdCBvcCA9IFNldE1ldHJpY1ZhbHVlT3AobmFtZSwgdmFsdWUsIHRhc2tJbmRleCk7XG4gICAgICAgIHJlcG9ydE9uRXJyb3IoYXdhaXQgZXhlY3V0ZU9wKG9wLCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLCB0cnVlLCB0aGlzKSk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIERyYWdnaW5nIG9uIHRoZSByYWRhci5cbiAgICBjb25zdCByYWRhciA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCIjcmFkYXJcIikhO1xuICAgIG5ldyBNb3VzZURyYWcocmFkYXIpO1xuICAgIHJhZGFyLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBEUkFHX1JBTkdFX0VWRU5ULFxuICAgICAgdGhpcy5kcmFnUmFuZ2VIYW5kbGVyLmJpbmQodGhpcykgYXMgRXZlbnRMaXN0ZW5lclxuICAgICk7XG5cbiAgICAvLyBEaXZpZGVyIGRyYWdnaW5nLlxuICAgIGNvbnN0IGRpdmlkZXIgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KFwidmVydGljYWwtZGl2aWRlclwiKSE7XG4gICAgbmV3IERpdmlkZXJNb3ZlKGRvY3VtZW50LmJvZHksIGRpdmlkZXIsIFwiY29sdW1uXCIpO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKERJVklERVJfTU9WRV9FVkVOVCwgKChcbiAgICAgIGU6IEN1c3RvbUV2ZW50PERpdmlkZXJNb3ZlUmVzdWx0PlxuICAgICkgPT4ge1xuICAgICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShcbiAgICAgICAgXCJncmlkLXRlbXBsYXRlLWNvbHVtbnNcIixcbiAgICAgICAgYGNhbGMoJHtlLmRldGFpbC5iZWZvcmV9JSAtIDE1cHgpIDEwcHggYXV0b2BcbiAgICAgICk7XG4gICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB9KSBhcyBFdmVudExpc3RlbmVyKTtcblxuICAgIC8vIEJ1dHRvbnNcbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjcmVzZXQtem9vbVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIGV4ZWN1dGUoXCJSZXNldFpvb21BY3Rpb25cIiwgdGhpcyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZGFyay1tb2RlLXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIGV4ZWN1dGUoXCJUb2dnbGVEYXJrTW9kZUFjdGlvblwiLCB0aGlzKTtcbiAgICB9KTtcbiAgICBhcHBseVN0b3JlZFRoZW1lKCk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjcmFkYXItdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgZXhlY3V0ZShcIlRvZ2dsZVJhZGFyQWN0aW9uXCIsIHRoaXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3RvcC10aW1lbGluZS10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcImNsaWNrXCIsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMudG9wVGltZWxpbmUgPSAhdGhpcy50b3BUaW1lbGluZTtcbiAgICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNncm91cC1ieS10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLnRvZ2dsZUdyb3VwQnkoKTtcbiAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2NyaXRpY2FsLXBhdGhzLXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGVDcml0aWNhbFBhdGhzT25seSgpO1xuICAgICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3Qgb3ZlcmxheUNhbnZhcyA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MQ2FudmFzRWxlbWVudD4oXCIjb3ZlcmxheVwiKSE7XG4gICAgdGhpcy5tb3VzZU1vdmUgPSBuZXcgTW91c2VNb3ZlKG92ZXJsYXlDYW52YXMpO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbk1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcblxuICAgIG92ZXJsYXlDYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgICAgY29uc3QgcCA9IHB0KGUub2Zmc2V0WCwgZS5vZmZzZXRZKTtcbiAgICAgIGlmICh0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnNldFNlbGVjdGlvbihcbiAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyhwLCBcIm1vdXNlZG93blwiKSB8fCAtMSxcbiAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgb3ZlcmxheUNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHAgPSBwdChlLm9mZnNldFgsIGUub2Zmc2V0WSk7XG4gICAgICBpZiAodGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgdGFza0luZGV4ID1cbiAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyhwLCBcIm1vdXNlZG93blwiKSB8fCAtMTtcbiAgICAgICAgaWYgKHRhc2tJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICBleGVjdXRlKFwiUmVzZXRab29tQWN0aW9uXCIsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U2VsZWN0aW9uKHRhc2tJbmRleCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBSZWFjdCB0byB0aGUgdXBsb2FkIGlucHV0LlxuICAgIGNvbnN0IGZpbGVVcGxvYWQgPVxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihcIiNmaWxlLXVwbG9hZFwiKSE7XG4gICAgZmlsZVVwbG9hZC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGpzb24gPSBhd2FpdCBmaWxlVXBsb2FkLmZpbGVzIVswXS50ZXh0KCk7XG4gICAgICBjb25zdCByZXQgPSBQbGFuLkZyb21KU09OKGpzb24pO1xuICAgICAgaWYgKCFyZXQub2spIHtcbiAgICAgICAgdGhyb3cgcmV0LmVycm9yO1xuICAgICAgfVxuICAgICAgdGhpcy5wbGFuID0gcmV0LnZhbHVlO1xuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2ltdWxhdGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlY2FsY3VsYXRlU3BhbnNBbmRDcml0aWNhbFBhdGgoKTtcbiAgICAgIHRoaXMuY3JpdGljYWxQYXRoID0gdGhpcy5zaW11bGF0aW9uUGFuZWwhLnNpbXVsYXRlKFxuICAgICAgICB0aGlzLnBsYW4uY2hhcnQsXG4gICAgICAgIE5VTV9TSU1VTEFUSU9OX0xPT1BTLFxuICAgICAgICB0aGlzLmNyaXRpY2FsUGF0aFxuICAgICAgKTtcbiAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2ZvY3VzLW9uLXNlbGVjdGVkLXRhc2tcIikhLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcImNsaWNrXCIsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMudG9nZ2xlRm9jdXNPblRhc2soKTtcbiAgICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNnZW4tcmFuZG9tLXBsYW5cIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLnBsYW4gPSBnZW5lcmF0ZVJhbmRvbVBsYW4oKTtcbiAgICAgIHRoaXMucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2VkaXQtcmVzb3VyY2VzXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yPEVkaXRSZXNvdXJjZXNEaWFsb2c+KFxuICAgICAgICBcImVkaXQtcmVzb3VyY2VzLWRpYWxvZ1wiXG4gICAgICApIS5zaG93TW9kYWwodGhpcyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZWRpdC1tZXRyaWNzXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yPEVkaXRNZXRyaWNzRGlhbG9nPihcImVkaXQtbWV0cmljcy1kaWFsb2dcIikhLnNob3dNb2RhbChcbiAgICAgICAgdGhpc1xuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGxhbiA9IGdlbmVyYXRlU3RhcnRlclBsYW4oKTtcbiAgICB0aGlzLnVwZGF0ZVRhc2tQYW5lbHModGhpcy5zZWxlY3RlZFRhc2spO1xuICAgIHRoaXMucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4gdGhpcy5wYWludENoYXJ0KCkpO1xuICAgIFN0YXJ0S2V5Ym9hcmRIYW5kbGluZyh0aGlzKTtcbiAgfVxuXG4gIHByZXBhcmVEb3dubG9hZCgpIHtcbiAgICBjb25zdCBkb3dubG9hZEJsb2IgPSBuZXcgQmxvYihbSlNPTi5zdHJpbmdpZnkodGhpcy5wbGFuLCBudWxsLCBcIiAgXCIpXSwge1xuICAgICAgdHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgfSk7XG4gICAgdGhpcy5kb3dubG9hZExpbmshLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGRvd25sb2FkQmxvYik7XG4gIH1cblxuICB1cGRhdGVUYXNrUGFuZWxzKHRhc2tJbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZWxlY3RlZFRhc2sgPSB0YXNrSW5kZXg7XG4gICAgdGhpcy5zZWxlY3RlZFRhc2tQYW5lbCEudXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWwoXG4gICAgICB0aGlzLnBsYW4sXG4gICAgICB0aGlzLnNlbGVjdGVkVGFza1xuICAgICk7XG4gICAgY29uc3QgZWRnZXMgPSBlZGdlc0J5U3JjQW5kRHN0VG9NYXAodGhpcy5wbGFuLmNoYXJ0LkVkZ2VzKTtcbiAgICB0aGlzLmRlcGVuZGVuY2llc1BhbmVsIS5zZXRUYXNrc0FuZEluZGljZXMoXG4gICAgICB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXMsXG4gICAgICAoZWRnZXMuYnlEc3QuZ2V0KHRhc2tJbmRleCkgfHwgW10pLm1hcCgoZTogRGlyZWN0ZWRFZGdlKSA9PiBlLmkpLFxuICAgICAgKGVkZ2VzLmJ5U3JjLmdldCh0YXNrSW5kZXgpIHx8IFtdKS5tYXAoKGU6IERpcmVjdGVkRWRnZSkgPT4gZS5qKVxuICAgICk7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXNQYW5lbCEuY2xhc3NMaXN0LnRvZ2dsZShcbiAgICAgIFwiaGlkZGVuXCIsXG4gICAgICB0aGlzLnNlbGVjdGVkVGFzayA9PT0gLTFcbiAgICApO1xuICB9XG5cbiAgc2V0U2VsZWN0aW9uKFxuICAgIGluZGV4OiBudW1iZXIsXG4gICAgZm9jdXM6IGJvb2xlYW4sXG4gICAgc2Nyb2xsVG9TZWxlY3RlZDogYm9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIHRoaXMuc2VsZWN0ZWRUYXNrID0gaW5kZXg7XG4gICAgaWYgKGZvY3VzKSB7XG4gICAgICB0aGlzLmZvcmNlRm9jdXNPblRhc2soKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgdGhpcy5mb2N1c09uVGFzayA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLnBhaW50Q2hhcnQoc2Nyb2xsVG9TZWxlY3RlZCk7XG4gICAgdGhpcy51cGRhdGVUYXNrUGFuZWxzKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgfVxuXG4gIC8vIFRPRE8gLSBUdXJuIHRoaXMgb24gYW5kIG9mZiBiYXNlZCBvbiBtb3VzZSBlbnRlcmluZyB0aGUgY2FudmFzIGFyZWEuXG4gIG9uTW91c2VNb3ZlKCkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5tb3VzZU1vdmUhLnJlYWRMb2NhdGlvbigpO1xuICAgIGlmIChsb2NhdGlvbiAhPT0gbnVsbCAmJiB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MobG9jYXRpb24sIFwibW91c2Vtb3ZlXCIpO1xuICAgIH1cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBwbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCkge1xuICAgIHRoaXMucmFkYXJTY2FsZSA9IG51bGw7XG4gICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuYWx0ZXJuYXRlVGFza0R1cmF0aW9ucyA9IG51bGw7XG4gICAgdGhpcy5ncm91cEJ5T3B0aW9ucyA9IFtcIlwiLCAuLi5PYmplY3Qua2V5cyh0aGlzLnBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucyldO1xuICAgIGlmICh0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXggPj0gdGhpcy5ncm91cEJ5T3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleCA9IDA7XG4gICAgfVxuXG4gICAgdGhpcy5yZWNhbGN1bGF0ZVNwYW5zQW5kQ3JpdGljYWxQYXRoKCk7XG4gICAgdGhpcy5wYWludENoYXJ0KCk7XG4gIH1cblxuICBnZXRUYXNrRHVyYXRpb25GdW5jKCk6IFRhc2tEdXJhdGlvbiB7XG4gICAgaWYgKHRoaXMuYWx0ZXJuYXRlVGFza0R1cmF0aW9ucyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuICh0YXNrSW5kZXg6IG51bWJlcikgPT4gdGhpcy5hbHRlcm5hdGVUYXNrRHVyYXRpb25zIVt0YXNrSW5kZXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKHRhc2tJbmRleDogbnVtYmVyKSA9PlxuICAgICAgICB0aGlzLnBsYW4uY2hhcnQuVmVydGljZXNbdGFza0luZGV4XS5kdXJhdGlvbjtcbiAgICB9XG4gIH1cblxuICByZWNhbGN1bGF0ZVNwYW5zQW5kQ3JpdGljYWxQYXRoKCkge1xuICAgIGxldCBzbGFja3M6IFNsYWNrW10gPSBbXTtcblxuICAgIGNvbnN0IHJvdW5kZXIgPSB0aGlzLnBsYW5cbiAgICAgIC5nZXRTdGF0aWNNZXRyaWNEZWZpbml0aW9uKFwiRHVyYXRpb25cIilcbiAgICAgIC5wcmVjaXNpb24ucm91bmRlcigpO1xuXG4gICAgY29uc3Qgc2xhY2tSZXN1bHQgPSBDb21wdXRlU2xhY2soXG4gICAgICB0aGlzLnBsYW4uY2hhcnQsXG4gICAgICB0aGlzLmdldFRhc2tEdXJhdGlvbkZ1bmMoKSxcbiAgICAgIHJvdW5kZXJcbiAgICApO1xuICAgIGlmICghc2xhY2tSZXN1bHQub2spIHtcbiAgICAgIGNvbnNvbGUuZXJyb3Ioc2xhY2tSZXN1bHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzbGFja3MgPSBzbGFja1Jlc3VsdC52YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLnNwYW5zID0gc2xhY2tzLm1hcCgodmFsdWU6IFNsYWNrKTogU3BhbiA9PiB7XG4gICAgICByZXR1cm4gdmFsdWUuZWFybHk7XG4gICAgfSk7XG4gICAgdGhpcy5jcml0aWNhbFBhdGggPSBDcml0aWNhbFBhdGgoc2xhY2tzLCByb3VuZGVyKTtcbiAgICB0aGlzLnVwZGF0ZVRhc2tQYW5lbHModGhpcy5zZWxlY3RlZFRhc2spO1xuICB9XG5cbiAgZ2V0VGFza0xhYmVsbGVyKCk6IFRhc2tMYWJlbCB7XG4gICAgcmV0dXJuICh0YXNrSW5kZXg6IG51bWJlcik6IHN0cmluZyA9PlxuICAgICAgYCR7dGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0ubmFtZX1gO1xuICB9XG5cbiAgZHJhZ1JhbmdlSGFuZGxlcihlOiBDdXN0b21FdmVudDxEcmFnUmFuZ2U+KSB7XG4gICAgaWYgKHRoaXMucmFkYXJTY2FsZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBiZWdpbiA9IHRoaXMucmFkYXJTY2FsZS5kYXlSb3dGcm9tUG9pbnQoZS5kZXRhaWwuYmVnaW4pO1xuICAgIGNvbnN0IGVuZCA9IHRoaXMucmFkYXJTY2FsZS5kYXlSb3dGcm9tUG9pbnQoZS5kZXRhaWwuZW5kKTtcbiAgICB0aGlzLmRpc3BsYXlSYW5nZSA9IG5ldyBEaXNwbGF5UmFuZ2UoYmVnaW4uZGF5LCBlbmQuZGF5KTtcbiAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgfVxuXG4gIHRvZ2dsZVJhZGFyKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcInJhZGFyLXBhcmVudFwiKSEuY2xhc3NMaXN0LnRvZ2dsZShcImhpZGRlblwiKTtcbiAgfVxuXG4gIHRvZ2dsZUdyb3VwQnkoKSB7XG4gICAgdGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4ID1cbiAgICAgICh0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXggKyAxKSAlIHRoaXMuZ3JvdXBCeU9wdGlvbnMubGVuZ3RoO1xuICB9XG5cbiAgdG9nZ2xlQ3JpdGljYWxQYXRoc09ubHkoKSB7XG4gICAgdGhpcy5jcml0aWNhbFBhdGhzT25seSA9ICF0aGlzLmNyaXRpY2FsUGF0aHNPbmx5O1xuICB9XG5cbiAgdG9nZ2xlRm9jdXNPblRhc2soKSB7XG4gICAgdGhpcy5mb2N1c09uVGFzayA9ICF0aGlzLmZvY3VzT25UYXNrO1xuICAgIGlmICghdGhpcy5mb2N1c09uVGFzaykge1xuICAgICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGZvcmNlRm9jdXNPblRhc2soKSB7XG4gICAgdGhpcy5mb2N1c09uVGFzayA9IHRydWU7XG4gIH1cblxuICBwYWludENoYXJ0KHNjcm9sbFRvU2VsZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIGNvbnNvbGUudGltZShcInBhaW50Q2hhcnRcIik7XG5cbiAgICBjb25zdCB0aGVtZUNvbG9yczogVGhlbWUgPSBjb2xvclRoZW1lRnJvbUVsZW1lbnQoZG9jdW1lbnQuYm9keSk7XG5cbiAgICBsZXQgZmlsdGVyRnVuYzogRmlsdGVyRnVuYyB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IHN0YXJ0QW5kRmluaXNoID0gWzAsIHRoaXMucGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxXTtcbiAgICBpZiAodGhpcy5jcml0aWNhbFBhdGhzT25seSkge1xuICAgICAgY29uc3QgaGlnaGxpZ2h0U2V0ID0gbmV3IFNldCh0aGlzLmNyaXRpY2FsUGF0aCk7XG4gICAgICBmaWx0ZXJGdW5jID0gKHRhc2s6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGlmIChzdGFydEFuZEZpbmlzaC5pbmNsdWRlcyh0YXNrSW5kZXgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhpZ2hsaWdodFNldC5oYXModGFza0luZGV4KTtcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0aGlzLmZvY3VzT25UYXNrICYmIHRoaXMuc2VsZWN0ZWRUYXNrICE9IC0xKSB7XG4gICAgICAvLyBGaW5kIGFsbCBwcmVkZWNlc3NvciBhbmQgc3VjY2Vzc29ycyBvZiB0aGUgZ2l2ZW4gdGFzay5cbiAgICAgIGNvbnN0IG5laWdoYm9yU2V0ID0gbmV3IFNldCgpO1xuICAgICAgbmVpZ2hib3JTZXQuYWRkKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgICAgIGxldCBlYXJsaWVzdFN0YXJ0ID0gdGhpcy5zcGFuc1t0aGlzLnNlbGVjdGVkVGFza10uc3RhcnQ7XG4gICAgICBsZXQgbGF0ZXN0RmluaXNoID0gdGhpcy5zcGFuc1t0aGlzLnNlbGVjdGVkVGFza10uZmluaXNoO1xuICAgICAgdGhpcy5wbGFuLmNoYXJ0LkVkZ2VzLmZvckVhY2goKGVkZ2U6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLnNlbGVjdGVkVGFzaykge1xuICAgICAgICAgIG5laWdoYm9yU2V0LmFkZChlZGdlLmopO1xuICAgICAgICAgIGlmIChsYXRlc3RGaW5pc2ggPCB0aGlzLnNwYW5zW2VkZ2Uual0uZmluaXNoKSB7XG4gICAgICAgICAgICBsYXRlc3RGaW5pc2ggPSB0aGlzLnNwYW5zW2VkZ2Uual0uZmluaXNoO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZWRnZS5qID09PSB0aGlzLnNlbGVjdGVkVGFzaykge1xuICAgICAgICAgIG5laWdoYm9yU2V0LmFkZChlZGdlLmkpO1xuICAgICAgICAgIGlmIChlYXJsaWVzdFN0YXJ0ID4gdGhpcy5zcGFuc1tlZGdlLmldLnN0YXJ0KSB7XG4gICAgICAgICAgICBlYXJsaWVzdFN0YXJ0ID0gdGhpcy5zcGFuc1tlZGdlLmldLnN0YXJ0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvLyBUT0RPIC0gU2luY2Ugd2Ugb3ZlcndyaXRlIGRpc3BsYXlSYW5nZSB0aGF0IG1lYW5zIGRyYWdnaW5nIG9uIHRoZSByYWRhclxuICAgICAgLy8gd2lsbCBub3Qgd29yayB3aGVuIGZvY3VzaW5nIG9uIGEgc2VsZWN0ZWQgdGFzay4gQnVnIG9yIGZlYXR1cmU/XG4gICAgICB0aGlzLmRpc3BsYXlSYW5nZSA9IG5ldyBEaXNwbGF5UmFuZ2UoZWFybGllc3RTdGFydCAtIDEsIGxhdGVzdEZpbmlzaCArIDEpO1xuXG4gICAgICBmaWx0ZXJGdW5jID0gKF90YXNrOiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgICAgICBpZiAoc3RhcnRBbmRGaW5pc2guaW5jbHVkZXModGFza0luZGV4KSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5laWdoYm9yU2V0Lmhhcyh0YXNrSW5kZXgpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBkdXJhdGlvbkRpc3BsYXkgPSAodDogbnVtYmVyKSA9PlxuICAgICAgdGhpcy5wbGFuLmR1cmF0aW9uVW5pdHMuZGlzcGxheVRpbWUodCk7XG5cbiAgICBjb25zdCByYWRhck9wdHM6IFJlbmRlck9wdGlvbnMgPSB7XG4gICAgICBmb250U2l6ZVB4OiA2LFxuICAgICAgaGFzVGV4dDogZmFsc2UsXG4gICAgICBkaXNwbGF5UmFuZ2U6IHRoaXMuZGlzcGxheVJhbmdlLFxuICAgICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwiaGlnaGxpZ2h0XCIsXG4gICAgICBjb2xvcnM6IHtcbiAgICAgICAgc3VyZmFjZTogdGhlbWVDb2xvcnMuc3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlOiB0aGVtZUNvbG9ycy5vblN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZU11dGVkOiB0aGVtZUNvbG9ycy5vblN1cmZhY2VNdXRlZCxcbiAgICAgICAgb25TdXJmYWNlSGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5vblN1cmZhY2VTZWNvbmRhcnksXG4gICAgICAgIG92ZXJsYXk6IHRoZW1lQ29sb3JzLm92ZXJsYXksXG4gICAgICAgIGdyb3VwQ29sb3I6IHRoZW1lQ29sb3JzLmdyb3VwQ29sb3IsXG4gICAgICAgIGhpZ2hsaWdodDogdGhlbWVDb2xvcnMuaGlnaGxpZ2h0LFxuICAgICAgfSxcbiAgICAgIGhhc1RpbWVsaW5lOiBmYWxzZSxcbiAgICAgIGhhc1Rhc2tzOiB0cnVlLFxuICAgICAgaGFzRWRnZXM6IGZhbHNlLFxuICAgICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogZmFsc2UsXG4gICAgICB0YXNrTGFiZWw6IHRoaXMuZ2V0VGFza0xhYmVsbGVyKCksXG4gICAgICB0YXNrRHVyYXRpb246IHRoaXMuZ2V0VGFza0R1cmF0aW9uRnVuYygpLFxuICAgICAgdGFza0VtcGhhc2l6ZTogdGhpcy5jcml0aWNhbFBhdGgsXG4gICAgICBmaWx0ZXJGdW5jOiBudWxsLFxuICAgICAgZ3JvdXBCeVJlc291cmNlOiB0aGlzLmdyb3VwQnlPcHRpb25zW3RoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gICAgICBoaWdobGlnaHRlZFRhc2s6IG51bGwsXG4gICAgICBzZWxlY3RlZFRhc2tJbmRleDogdGhpcy5zZWxlY3RlZFRhc2ssXG4gICAgICBkdXJhdGlvbkRpc3BsYXk6IGR1cmF0aW9uRGlzcGxheSxcbiAgICB9O1xuXG4gICAgY29uc3Qgem9vbU9wdHM6IFJlbmRlck9wdGlvbnMgPSB7XG4gICAgICBmb250U2l6ZVB4OiBGT05UX1NJWkVfUFgsXG4gICAgICBoYXNUZXh0OiB0cnVlLFxuICAgICAgZGlzcGxheVJhbmdlOiB0aGlzLmRpc3BsYXlSYW5nZSxcbiAgICAgIGRpc3BsYXlSYW5nZVVzYWdlOiBcInJlc3RyaWN0XCIsXG4gICAgICBjb2xvcnM6IHtcbiAgICAgICAgc3VyZmFjZTogdGhlbWVDb2xvcnMuc3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlOiB0aGVtZUNvbG9ycy5vblN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZU11dGVkOiB0aGVtZUNvbG9ycy5vblN1cmZhY2VNdXRlZCxcbiAgICAgICAgb25TdXJmYWNlSGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5vblN1cmZhY2VTZWNvbmRhcnksXG4gICAgICAgIG92ZXJsYXk6IHRoZW1lQ29sb3JzLm92ZXJsYXksXG4gICAgICAgIGdyb3VwQ29sb3I6IHRoZW1lQ29sb3JzLmdyb3VwQ29sb3IsXG4gICAgICAgIGhpZ2hsaWdodDogdGhlbWVDb2xvcnMuaGlnaGxpZ2h0LFxuICAgICAgfSxcbiAgICAgIGhhc1RpbWVsaW5lOiB0aGlzLnRvcFRpbWVsaW5lLFxuICAgICAgaGFzVGFza3M6IHRydWUsXG4gICAgICBoYXNFZGdlczogdHJ1ZSxcbiAgICAgIGRyYXdUaW1lTWFya2Vyc09uVGFza3M6IHRydWUsXG4gICAgICB0YXNrTGFiZWw6IHRoaXMuZ2V0VGFza0xhYmVsbGVyKCksXG4gICAgICB0YXNrRHVyYXRpb246IHRoaXMuZ2V0VGFza0R1cmF0aW9uRnVuYygpLFxuICAgICAgdGFza0VtcGhhc2l6ZTogdGhpcy5jcml0aWNhbFBhdGgsXG4gICAgICBmaWx0ZXJGdW5jOiBmaWx0ZXJGdW5jLFxuICAgICAgZ3JvdXBCeVJlc291cmNlOiB0aGlzLmdyb3VwQnlPcHRpb25zW3RoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gICAgICBoaWdobGlnaHRlZFRhc2s6IDEsXG4gICAgICBzZWxlY3RlZFRhc2tJbmRleDogdGhpcy5zZWxlY3RlZFRhc2ssXG4gICAgICBkdXJhdGlvbkRpc3BsYXk6IGR1cmF0aW9uRGlzcGxheSxcbiAgICB9O1xuXG4gICAgY29uc3QgdGltZWxpbmVPcHRzOiBSZW5kZXJPcHRpb25zID0ge1xuICAgICAgZm9udFNpemVQeDogRk9OVF9TSVpFX1BYLFxuICAgICAgaGFzVGV4dDogdHJ1ZSxcbiAgICAgIGRpc3BsYXlSYW5nZTogdGhpcy5kaXNwbGF5UmFuZ2UsXG4gICAgICBkaXNwbGF5UmFuZ2VVc2FnZTogXCJyZXN0cmljdFwiLFxuICAgICAgY29sb3JzOiB7XG4gICAgICAgIHN1cmZhY2U6IHRoZW1lQ29sb3JzLnN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZTogdGhlbWVDb2xvcnMub25TdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2VNdXRlZDogdGhlbWVDb2xvcnMub25TdXJmYWNlTXV0ZWQsXG4gICAgICAgIG9uU3VyZmFjZUhpZ2hsaWdodDogdGhlbWVDb2xvcnMub25TdXJmYWNlU2Vjb25kYXJ5LFxuICAgICAgICBvdmVybGF5OiB0aGVtZUNvbG9ycy5vdmVybGF5LFxuICAgICAgICBncm91cENvbG9yOiB0aGVtZUNvbG9ycy5ncm91cENvbG9yLFxuICAgICAgICBoaWdobGlnaHQ6IHRoZW1lQ29sb3JzLmhpZ2hsaWdodCxcbiAgICAgIH0sXG4gICAgICBoYXNUaW1lbGluZTogdHJ1ZSxcbiAgICAgIGhhc1Rhc2tzOiBmYWxzZSxcbiAgICAgIGhhc0VkZ2VzOiB0cnVlLFxuICAgICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogdHJ1ZSxcbiAgICAgIHRhc2tMYWJlbDogdGhpcy5nZXRUYXNrTGFiZWxsZXIoKSxcbiAgICAgIHRhc2tEdXJhdGlvbjogdGhpcy5nZXRUYXNrRHVyYXRpb25GdW5jKCksXG4gICAgICB0YXNrRW1waGFzaXplOiB0aGlzLmNyaXRpY2FsUGF0aCxcbiAgICAgIGZpbHRlckZ1bmM6IGZpbHRlckZ1bmMsXG4gICAgICBncm91cEJ5UmVzb3VyY2U6IHRoaXMuZ3JvdXBCeU9wdGlvbnNbdGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4XSxcbiAgICAgIGhpZ2hsaWdodGVkVGFzazogbnVsbCxcbiAgICAgIHNlbGVjdGVkVGFza0luZGV4OiB0aGlzLnNlbGVjdGVkVGFzayxcbiAgICAgIGR1cmF0aW9uRGlzcGxheTogZHVyYXRpb25EaXNwbGF5LFxuICAgIH07XG5cbiAgICBjb25zdCByZXQgPSB0aGlzLnBhaW50T25lQ2hhcnQoXCIjcmFkYXJcIiwgcmFkYXJPcHRzKTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnJhZGFyU2NhbGUgPSByZXQudmFsdWUuc2NhbGU7XG5cbiAgICB0aGlzLnBhaW50T25lQ2hhcnQoXCIjdGltZWxpbmVcIiwgdGltZWxpbmVPcHRzKTtcbiAgICBjb25zdCB6b29tUmV0ID0gdGhpcy5wYWludE9uZUNoYXJ0KFwiI3pvb21lZFwiLCB6b29tT3B0cywgXCIjb3ZlcmxheVwiKTtcbiAgICBpZiAoem9vbVJldC5vaykge1xuICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MgPVxuICAgICAgICB6b29tUmV0LnZhbHVlLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcztcbiAgICAgIGlmICh6b29tUmV0LnZhbHVlLnNlbGVjdGVkVGFza0xvY2F0aW9uICE9PSBudWxsICYmIHNjcm9sbFRvU2VsZWN0ZWQpIHtcbiAgICAgICAgbGV0IHRvcCA9IDA7XG4gICAgICAgIGlmICghdGhpcy5mb2N1c09uVGFzaykge1xuICAgICAgICAgIHRvcCA9IHpvb21SZXQudmFsdWUuc2VsZWN0ZWRUYXNrTG9jYXRpb24ueTtcbiAgICAgICAgfVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiY2hhcnQtcGFyZW50XCIpIS5zY3JvbGxUbyh7XG4gICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICBiZWhhdmlvcjogXCJzbW9vdGhcIixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS50aW1lRW5kKFwicGFpbnRDaGFydFwiKTtcbiAgfVxuXG4gIHByZXBhcmVDYW52YXMoXG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcbiAgICBjYW52YXNXaWR0aDogbnVtYmVyLFxuICAgIGNhbnZhc0hlaWdodDogbnVtYmVyLFxuICAgIHdpZHRoOiBudW1iZXIsXG4gICAgaGVpZ2h0OiBudW1iZXJcbiAgKTogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHtcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXNXaWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0O1xuICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcblxuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikhO1xuICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcblxuICAgIHJldHVybiBjdHg7XG4gIH1cblxuICBwYWludE9uZUNoYXJ0KFxuICAgIGNhbnZhc0lEOiBzdHJpbmcsXG4gICAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgICBvdmVybGF5SUQ6IHN0cmluZyA9IFwiXCJcbiAgKTogUmVzdWx0PFJlbmRlclJlc3VsdD4ge1xuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MQ2FudmFzRWxlbWVudD4oY2FudmFzSUQpITtcbiAgICBjb25zdCBwYXJlbnQgPSBjYW52YXMhLnBhcmVudEVsZW1lbnQhO1xuICAgIGNvbnN0IHJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgY29uc3Qgd2lkdGggPSBwYXJlbnQuY2xpZW50V2lkdGggLSBGT05UX1NJWkVfUFg7XG4gICAgbGV0IGhlaWdodCA9IHBhcmVudC5jbGllbnRIZWlnaHQ7XG4gICAgY29uc3QgY2FudmFzV2lkdGggPSBNYXRoLmNlaWwod2lkdGggKiByYXRpbyk7XG4gICAgbGV0IGNhbnZhc0hlaWdodCA9IE1hdGguY2VpbChoZWlnaHQgKiByYXRpbyk7XG5cbiAgICBjb25zdCBuZXdIZWlnaHQgPSBzdWdnZXN0ZWRDYW52YXNIZWlnaHQoXG4gICAgICBjYW52YXMsXG4gICAgICB0aGlzLnNwYW5zLFxuICAgICAgb3B0cyxcbiAgICAgIHRoaXMucGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggKyAyIC8vIFRPRE8gLSBXaHkgZG8gd2UgbmVlZCB0aGUgKzIgaGVyZSE/XG4gICAgKTtcbiAgICBjYW52YXNIZWlnaHQgPSBuZXdIZWlnaHQ7XG4gICAgaGVpZ2h0ID0gbmV3SGVpZ2h0IC8gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG5cbiAgICBsZXQgb3ZlcmxheTogSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBpZiAob3ZlcmxheUlEKSB7XG4gICAgICBvdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MQ2FudmFzRWxlbWVudD4ob3ZlcmxheUlEKSE7XG4gICAgICB0aGlzLnByZXBhcmVDYW52YXMob3ZlcmxheSwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCwgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuICAgIGNvbnN0IGN0eCA9IHRoaXMucHJlcGFyZUNhbnZhcyhcbiAgICAgIGNhbnZhcyxcbiAgICAgIGNhbnZhc1dpZHRoLFxuICAgICAgY2FudmFzSGVpZ2h0LFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHRcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlbmRlclRhc2tzVG9DYW52YXMoXG4gICAgICBwYXJlbnQsXG4gICAgICBjYW52YXMsXG4gICAgICBjdHgsXG4gICAgICB0aGlzLnBsYW4sXG4gICAgICB0aGlzLnNwYW5zLFxuICAgICAgb3B0cyxcbiAgICAgIG92ZXJsYXlcbiAgICApO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImV4cGxhbi1tYWluXCIsIEV4cGxhbk1haW4pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBR0MsT0FBQyxDQUFDLE1BQU0sUUFBUTtBQUNmLFlBQUcsT0FBTyxXQUFXLGNBQWMsT0FBTyxJQUFLLFFBQU8sQ0FBQyxHQUFHLEdBQUc7QUFBQSxpQkFDckQsT0FBTyxXQUFXLFlBQVksT0FBTyxRQUFTLFFBQU8sVUFBVSxJQUFJO0FBQUEsWUFDdEUsTUFBSyxXQUFXLElBQUksSUFBSTtBQUFBLE1BQy9CLEdBQUcsU0FBTSxDQUFBQSxPQUFLO0FBQ1o7QUFFQSxZQUFJLFNBQVMsQ0FBQyxRQUFRLFdBQVc7QUFDL0IsY0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFRLFFBQU87QUFFOUIsY0FBSSxpQkFBaUIsa0JBQWtCLE1BQU07QUFDN0MsY0FBRyxDQUFDLFdBQVcsTUFBTSxFQUFHLFVBQVMsWUFBWSxNQUFNO0FBRW5ELGNBQUksaUJBQWlCLGVBQWU7QUFDcEMsZUFBSSxpQkFBaUIsT0FBTyxlQUFlLGVBQWdCLFFBQU87QUFFbEUsaUJBQU8sVUFBVSxnQkFBZ0IsTUFBTTtBQUFBLFFBQ3pDO0FBRUEsWUFBSSxLQUFLLENBQUMsUUFBUSxTQUFTLFlBQVk7QUFDckMsY0FBRyxDQUFDLE9BQVEsUUFBTyxTQUFTLE1BQU0sSUFBSSxTQUFTLE9BQU8sSUFBSTtBQUUxRCxjQUFJLGlCQUFpQixrQkFBa0IsTUFBTTtBQUM3QyxjQUFJLGlCQUFpQixlQUFlO0FBQ3BDLGNBQUksZ0JBQWlCLGVBQWU7QUFFcEMsY0FBSSxZQUFZLGlCQUFrQixTQUFTLGFBQWEsQ0FBRTtBQUMxRCxjQUFJLFFBQVksU0FBUyxTQUFTO0FBRWxDLGNBQUksYUFB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YiIsICJzIiwgInNjb3JlIiwgImoiLCAieCIsICJyIiwgImUiLCAibyIsICJ2IiwgImMiLCAiZiIsICJnbG9iYWwiLCAiZ2xvYmFsVGhpcyIsICJ0cnVzdGVkVHlwZXMiLCAicG9saWN5IiwgImNyZWF0ZVBvbGljeSIsICJjcmVhdGVIVE1MIiwgInMiLCAiYm91bmRBdHRyaWJ1dGVTdWZmaXgiLCAibWFya2VyIiwgIk1hdGgiLCAicmFuZG9tIiwgInRvRml4ZWQiLCAic2xpY2UiLCAibWFya2VyTWF0Y2giLCAibm9kZU1hcmtlciIsICJkIiwgImRvY3VtZW50IiwgImNyZWF0ZU1hcmtlciIsICJjcmVhdGVDb21tZW50IiwgImlzUHJpbWl0aXZlIiwgInZhbHVlIiwgImlzQXJyYXkiLCAiQXJyYXkiLCAiaXNJdGVyYWJsZSIsICJTeW1ib2wiLCAiaXRlcmF0b3IiLCAiU1BBQ0VfQ0hBUiIsICJ0ZXh0RW5kUmVnZXgiLCAiY29tbWVudEVuZFJlZ2V4IiwgImNvbW1lbnQyRW5kUmVnZXgiLCAidGFnRW5kUmVnZXgiLCAiUmVnRXhwIiwgInNpbmdsZVF1b3RlQXR0ckVuZFJlZ2V4IiwgImRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4IiwgInJhd1RleHRFbGVtZW50IiwgInRhZyIsICJ0eXBlIiwgInN0cmluZ3MiLCAidmFsdWVzIiwgIl8kbGl0VHlwZSQiLCAiaHRtbCIsICJzdmciLCAibWF0aG1sIiwgIm5vQ2hhbmdlIiwgImZvciIsICJub3RoaW5nIiwgInRlbXBsYXRlQ2FjaGUiLCAiV2Vha01hcCIsICJ3YWxrZXIiLCAiY3JlYXRlVHJlZVdhbGtlciIsICJ0cnVzdEZyb21UZW1wbGF0ZVN0cmluZyIsICJ0c2EiLCAic3RyaW5nRnJvbVRTQSIsICJoYXNPd25Qcm9wZXJ0eSIsICJFcnJvciIsICJnZXRUZW1wbGF0ZUh0bWwiLCAibCIsICJsZW5ndGgiLCAiYXR0ck5hbWVzIiwgInJhd1RleHRFbmRSZWdleCIsICJyZWdleCIsICJpIiwgImF0dHJOYW1lIiwgIm1hdGNoIiwgImF0dHJOYW1lRW5kSW5kZXgiLCAibGFzdEluZGV4IiwgImV4ZWMiLCAidGVzdCIsICJlbmQiLCAic3RhcnRzV2l0aCIsICJwdXNoIiwgIlRlbXBsYXRlIiwgImNvbnN0cnVjdG9yIiwgIm9wdGlvbnMiLCAibm9kZSIsICJ0aGlzIiwgInBhcnRzIiwgIm5vZGVJbmRleCIsICJhdHRyTmFtZUluZGV4IiwgInBhcnRDb3VudCIsICJlbCIsICJjcmVhdGVFbGVtZW50IiwgImN1cnJlbnROb2RlIiwgImNvbnRlbnQiLCAid3JhcHBlciIsICJmaXJzdENoaWxkIiwgInJlcGxhY2VXaXRoIiwgImNoaWxkTm9kZXMiLCAibmV4dE5vZGUiLCAibm9kZVR5cGUiLCAiaGFzQXR0cmlidXRlcyIsICJuYW1lIiwgImdldEF0dHJpYnV0ZU5hbWVzIiwgImVuZHNXaXRoIiwgInJlYWxOYW1lIiwgInN0YXRpY3MiLCAiZ2V0QXR0cmlidXRlIiwgInNwbGl0IiwgIm0iLCAiaW5kZXgiLCAiY3RvciIsICJQcm9wZXJ0eVBhcnQiLCAiQm9vbGVhbkF0dHJpYnV0ZVBhcnQiLCAiRXZlbnRQYXJ0IiwgIkF0dHJpYnV0ZVBhcnQiLCAicmVtb3ZlQXR0cmlidXRlIiwgInRhZ05hbWUiLCAidGV4dENvbnRlbnQiLCAiZW1wdHlTY3JpcHQiLCAiYXBwZW5kIiwgImRhdGEiLCAiaW5kZXhPZiIsICJfb3B0aW9ucyIsICJpbm5lckhUTUwiLCAicmVzb2x2ZURpcmVjdGl2ZSIsICJwYXJ0IiwgInBhcmVudCIsICJhdHRyaWJ1dGVJbmRleCIsICJjdXJyZW50RGlyZWN0aXZlIiwgIl9fZGlyZWN0aXZlcyIsICJfX2RpcmVjdGl2ZSIsICJuZXh0RGlyZWN0aXZlQ29uc3RydWN0b3IiLCAiXyRpbml0aWFsaXplIiwgIl8kcmVzb2x2ZSIsICJUZW1wbGF0ZUluc3RhbmNlIiwgInRlbXBsYXRlIiwgIl8kcGFydHMiLCAiXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuIiwgIl8kdGVtcGxhdGUiLCAiXyRwYXJlbnQiLCAicGFyZW50Tm9kZSIsICJfJGlzQ29ubmVjdGVkIiwgImZyYWdtZW50IiwgImNyZWF0aW9uU2NvcGUiLCAiaW1wb3J0Tm9kZSIsICJwYXJ0SW5kZXgiLCAidGVtcGxhdGVQYXJ0IiwgIkNoaWxkUGFydCIsICJuZXh0U2libGluZyIsICJFbGVtZW50UGFydCIsICJfJHNldFZhbHVlIiwgIl9faXNDb25uZWN0ZWQiLCAic3RhcnROb2RlIiwgImVuZE5vZGUiLCAiXyRjb21taXR0ZWRWYWx1ZSIsICJfJHN0YXJ0Tm9kZSIsICJfJGVuZE5vZGUiLCAiaXNDb25uZWN0ZWQiLCAiZGlyZWN0aXZlUGFyZW50IiwgIl8kY2xlYXIiLCAiX2NvbW1pdFRleHQiLCAiX2NvbW1pdFRlbXBsYXRlUmVzdWx0IiwgIl9jb21taXROb2RlIiwgIl9jb21taXRJdGVyYWJsZSIsICJpbnNlcnRCZWZvcmUiLCAiX2luc2VydCIsICJjcmVhdGVUZXh0Tm9kZSIsICJyZXN1bHQiLCAiXyRnZXRUZW1wbGF0ZSIsICJoIiwgIl91cGRhdGUiLCAiaW5zdGFuY2UiLCAiX2Nsb25lIiwgImdldCIsICJzZXQiLCAiaXRlbVBhcnRzIiwgIml0ZW1QYXJ0IiwgIml0ZW0iLCAic3RhcnQiLCAiZnJvbSIsICJfJG5vdGlmeUNvbm5lY3Rpb25DaGFuZ2VkIiwgIm4iLCAicmVtb3ZlIiwgImVsZW1lbnQiLCAiZmlsbCIsICJTdHJpbmciLCAidmFsdWVJbmRleCIsICJub0NvbW1pdCIsICJjaGFuZ2UiLCAidiIsICJfY29tbWl0VmFsdWUiLCAic2V0QXR0cmlidXRlIiwgInRvZ2dsZUF0dHJpYnV0ZSIsICJzdXBlciIsICJuZXdMaXN0ZW5lciIsICJvbGRMaXN0ZW5lciIsICJzaG91bGRSZW1vdmVMaXN0ZW5lciIsICJjYXB0dXJlIiwgIm9uY2UiLCAicGFzc2l2ZSIsICJzaG91bGRBZGRMaXN0ZW5lciIsICJyZW1vdmVFdmVudExpc3RlbmVyIiwgImFkZEV2ZW50TGlzdGVuZXIiLCAiZXZlbnQiLCAiY2FsbCIsICJob3N0IiwgImhhbmRsZUV2ZW50IiwgIl8kTEgiLCAiX2JvdW5kQXR0cmlidXRlU3VmZml4IiwgIl9tYXJrZXIiLCAiX21hcmtlck1hdGNoIiwgIl9IVE1MX1JFU1VMVCIsICJfZ2V0VGVtcGxhdGVIdG1sIiwgIl9UZW1wbGF0ZUluc3RhbmNlIiwgIl9pc0l0ZXJhYmxlIiwgIl9yZXNvbHZlRGlyZWN0aXZlIiwgIl9DaGlsZFBhcnQiLCAiX0F0dHJpYnV0ZVBhcnQiLCAiX0Jvb2xlYW5BdHRyaWJ1dGVQYXJ0IiwgIl9FdmVudFBhcnQiLCAiX1Byb3BlcnR5UGFydCIsICJfRWxlbWVudFBhcnQiLCAicG9seWZpbGxTdXBwb3J0IiwgImxpdEh0bWxQb2x5ZmlsbFN1cHBvcnQiLCAibGl0SHRtbFZlcnNpb25zIiwgInJlbmRlciIsICJjb250YWluZXIiLCAicGFydE93bmVyTm9kZSIsICJyZW5kZXJCZWZvcmUiLCAiZXhwbGFuTWFpbiIsICJ1bmRvIiwgImkiLCAiaiIsICJlIiwgImkiLCAiZSIsICJpIiwgImoiLCAiZSIsICJ2IiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAidW5kbyIsICJlIiwgInMiLCAidiIsICJQYXJ0VHlwZSIsICJBVFRSSUJVVEUiLCAiQ0hJTEQiLCAiUFJPUEVSVFkiLCAiQk9PTEVBTl9BVFRSSUJVVEUiLCAiRVZFTlQiLCAiRUxFTUVOVCIsICJkaXJlY3RpdmUiLCAiYyIsICJ2YWx1ZXMiLCAiXyRsaXREaXJlY3RpdmUkIiwgIkRpcmVjdGl2ZSIsICJfcGFydEluZm8iLCAiXyRpc0Nvbm5lY3RlZCIsICJ0aGlzIiwgIl8kcGFyZW50IiwgInBhcnQiLCAicGFyZW50IiwgImF0dHJpYnV0ZUluZGV4IiwgIl9fcGFydCIsICJfX2F0dHJpYnV0ZUluZGV4IiwgInByb3BzIiwgInVwZGF0ZSIsICJfcGFydCIsICJyZW5kZXIiLCAiX0NoaWxkUGFydCIsICJDaGlsZFBhcnQiLCAiXyRMSCIsICJpc1NpbmdsZUV4cHJlc3Npb24iLCAicGFydCIsICJzdHJpbmdzIiwgIlJFU0VUX1ZBTFVFIiwgInNldENvbW1pdHRlZFZhbHVlIiwgInBhcnQiLCAidmFsdWUiLCAiXyRjb21taXR0ZWRWYWx1ZSIsICJsaXZlIiwgImRpcmVjdGl2ZSIsICJEaXJlY3RpdmUiLCAicGFydEluZm8iLCAic3VwZXIiLCAidHlwZSIsICJQYXJ0VHlwZSIsICJQUk9QRVJUWSIsICJBVFRSSUJVVEUiLCAiQk9PTEVBTl9BVFRSSUJVVEUiLCAiRXJyb3IiLCAiaXNTaW5nbGVFeHByZXNzaW9uIiwgInZhbHVlIiwgInBhcnQiLCAibm9DaGFuZ2UiLCAibm90aGluZyIsICJlbGVtZW50IiwgIm5hbWUiLCAiaGFzQXR0cmlidXRlIiwgImdldEF0dHJpYnV0ZSIsICJTdHJpbmciLCAic2V0Q29tbWl0dGVkVmFsdWUiLCAiZXhwbGFuTWFpbiIsICJlIiwgImwiLCAieCIsICJzIiwgInByZWNpc2lvbiIsICJ4IiwgInMiLCAicHJlY2lzaW9uIiwgIngiLCAicyIsICJleHBsYW5NYWluIiwgImEiLCAiYiIsICJlcnJvciIsICJsIiwgImUiLCAiZXhwbGFuTWFpbiIsICJnIiwgImYiLCAiZSIsICJfIiwgImUiLCAiYSIsICJiIiwgImkiLCAiZSIsICJleHBsYW5NYWluIiwgImEiLCAiYiIsICJnIiwgIl8iLCAiaSIsICJlIiwgIm9rIiwgInQiLCAiZSIsICJnIiwgImkiLCAiYyIsICJhIiwgImIiLCAiYyIsICJwIiwgInAiLCAicyIsICJpIiwgImMiLCAidCIsICJzIiwgInMiLCAidCIsICJkIiwgImwiLCAiZSIsICJjIiwgImkiLCAiciIsICJlIiwgIm4iLCAiaSIsICJ0IiwgImEiLCAiYiIsICJhIiwgImIiLCAiZSIsICJfIiwgIngiLCAiaSIsICJlIiwgInRlbXBsYXRlIiwgInQiLCAiZnV6enlzb3J0IiwgInYiLCAieCIsICJ5IiwgInAiLCAiZGlmZmVyZW5jZSIsICJlIiwgImUiLCAiZSIsICJ4IiwgImZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4IiwgIm4iLCAieSIsICJ4IiwgImEiLCAiYiIsICJwIiwgIl8iLCAiZGlmZmVyZW5jZSIsICJlIiwgImNvcm5lcnMiLCAicm93IiwgInJuZEludCIsICJuIiwgImkiLCAiZSIsICJpIiwgImoiLCAicCIsICJ0Il0KfQo=
