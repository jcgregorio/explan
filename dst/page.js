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

  // src/search/search.ts
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
  var searchStringFromTaskBuilder = (searchType) => {
    if (searchType === "full-info") {
      return (task) => {
        const resourceKeys = Object.keys(task.resources);
        resourceKeys.sort();
        return `${task.name} ${resourceKeys.map((key) => task.resources[key]).join(" ")}`;
      };
    } else {
      return (task) => task.name;
    }
  };
  var SearchTaskPanel = class extends HTMLElement {
    explanMain = null;
    focusIndex = 0;
    searchResults = [];
    searchType = "name-only";
    connectedCallback() {
      this.explanMain = document.querySelector("explan-main");
      if (!this.explanMain) {
        return;
      }
      B(template(this), this);
    }
    onInput(e2) {
      const tasks = this.explanMain.plan.chart.Vertices;
      const maxNameLength = tasks.reduce(
        (prev, task) => task.name.length > prev ? task.name.length : prev,
        0
      );
      this.searchResults = import_fuzzysort.default.go(
        e2.target.value,
        tasks.slice(1, -2),
        // Remove Start and Finish from search range.
        {
          key: searchStringFromTaskBuilder(this.searchType),
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
      const taskIndex = this.explanMain.plan.chart.Vertices.indexOf(
        this.searchResults[index].obj
      );
      this.explanMain.setFocusOnTask(taskIndex);
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
  };
  customElements.define("search-task-panel", SearchTaskPanel);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2Z1enp5c29ydC9mdXp6eXNvcnQuanMiLCAiLi4vc3JjL3Jlc3VsdC50cyIsICIuLi9zcmMvb3BzL29wcy50cyIsICIuLi9zcmMvb3BzL21ldHJpY3MudHMiLCAiLi4vc3JjL3Jlc291cmNlcy9yZXNvdXJjZXMudHMiLCAiLi4vc3JjL29wcy9yZXNvdXJjZXMudHMiLCAiLi4vc3JjL2RhZy9kYWcudHMiLCAiLi4vc3JjL2RhZy9hbGdvcml0aG1zL3RvcG9zb3J0LnRzIiwgIi4uL3NyYy9jaGFydC9jaGFydC50cyIsICIuLi9zcmMvcHJlY2lzaW9uL3ByZWNpc2lvbi50cyIsICIuLi9zcmMvbWV0cmljcy9yYW5nZS50cyIsICIuLi9zcmMvbWV0cmljcy9tZXRyaWNzLnRzIiwgIi4uL3NyYy9vcHMvY2hhcnQudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL3RyaWFuZ3VsYXIudHMiLCAiLi4vc3JjL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzIiwgIi4uL3NyYy9wbGFuL3BsYW4udHMiLCAiLi4vc3JjL3JlbmRlcmVyL3NjYWxlL3BvaW50LnRzIiwgIi4uL3NyYy9yZW5kZXJlci9kaXZpZGVybW92ZS9kaXZpZGVybW92ZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvbW91c2VkcmFnL21vdXNlZHJhZy50cyIsICIuLi9zcmMvcmVuZGVyZXIvbW91c2Vtb3ZlL21vdXNlbW92ZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvcmFuZ2UvcmFuZ2UudHMiLCAiLi4vc3JjL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHMiLCAiLi4vc3JjL3JlbmRlcmVyL2tkL2tkLnRzIiwgIi4uL3NyYy9yZW5kZXJlci9zY2FsZS9zY2FsZS50cyIsICIuLi9zcmMvcmVuZGVyZXIvcmVuZGVyZXIudHMiLCAiLi4vc3JjL3NsYWNrL3NsYWNrLnRzIiwgIi4uL3NyYy9zdHlsZS90aGVtZS90aGVtZS50cyIsICIuLi9ub2RlX21vZHVsZXMvbGl0LWh0bWwvc3JjL2xpdC1odG1sLnRzIiwgIi4uL3NyYy9zaW11bGF0aW9uL3NpbXVsYXRpb24udHMiLCAiLi4vc3JjL2dlbmVyYXRlL2dlbmVyYXRlLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9uLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9nb3RvU2VhcmNoLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9oZWxwLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy9yZXNldFpvb20udHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3Rhc2tzLnRzIiwgIi4uL3NyYy9zdHlsZS90b2dnbGVyL3RvZ2dsZXIudHMiLCAiLi4vc3JjL2FjdGlvbi9hY3Rpb25zL3RvZ2dsZURhcmtNb2RlLnRzIiwgIi4uL3NyYy9hY3Rpb24vYWN0aW9ucy90b2dnbGVSYWRhci50cyIsICIuLi9zcmMvYWN0aW9uL2FjdGlvbnMvdW5kby50cyIsICIuLi9zcmMvYWN0aW9uL3JlZ2lzdHJ5LnRzIiwgIi4uL3NyYy9hY3Rpb24vZXhlY3V0ZS50cyIsICIuLi9zcmMva2V5bWFwL2tleW1hcC50cyIsICIuLi9zcmMvZXhwbGFuTWFpbi9leHBsYW5NYWluLnRzIiwgIi4uL3NyYy9oZWxwL2hlbHAudHMiLCAiLi4vc3JjL3NlYXJjaC9zZWFyY2gudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYXJ6aGVyL2Z1enp5c29ydCB2My4wLjJcclxuXHJcbi8vIFVNRCAoVW5pdmVyc2FsIE1vZHVsZSBEZWZpbml0aW9uKSBmb3IgZnV6enlzb3J0XHJcbjsoKHJvb3QsIFVNRCkgPT4ge1xyXG4gIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKFtdLCBVTUQpXHJcbiAgZWxzZSBpZih0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBVTUQoKVxyXG4gIGVsc2Ugcm9vdFsnZnV6enlzb3J0J10gPSBVTUQoKVxyXG59KSh0aGlzLCBfID0+IHtcclxuICAndXNlIHN0cmljdCdcclxuXHJcbiAgdmFyIHNpbmdsZSA9IChzZWFyY2gsIHRhcmdldCkgPT4ge1xyXG4gICAgaWYoIXNlYXJjaCB8fCAhdGFyZ2V0KSByZXR1cm4gTlVMTFxyXG5cclxuICAgIHZhciBwcmVwYXJlZFNlYXJjaCA9IGdldFByZXBhcmVkU2VhcmNoKHNlYXJjaClcclxuICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuXHJcbiAgICB2YXIgc2VhcmNoQml0ZmxhZ3MgPSBwcmVwYXJlZFNlYXJjaC5iaXRmbGFnc1xyXG4gICAgaWYoKHNlYXJjaEJpdGZsYWdzICYgdGFyZ2V0Ll9iaXRmbGFncykgIT09IHNlYXJjaEJpdGZsYWdzKSByZXR1cm4gTlVMTFxyXG5cclxuICAgIHJldHVybiBhbGdvcml0aG0ocHJlcGFyZWRTZWFyY2gsIHRhcmdldClcclxuICB9XHJcblxyXG4gIHZhciBnbyA9IChzZWFyY2gsIHRhcmdldHMsIG9wdGlvbnMpID0+IHtcclxuICAgIGlmKCFzZWFyY2gpIHJldHVybiBvcHRpb25zPy5hbGwgPyBhbGwodGFyZ2V0cywgb3B0aW9ucykgOiBub1Jlc3VsdHNcclxuXHJcbiAgICB2YXIgcHJlcGFyZWRTZWFyY2ggPSBnZXRQcmVwYXJlZFNlYXJjaChzZWFyY2gpXHJcbiAgICB2YXIgc2VhcmNoQml0ZmxhZ3MgPSBwcmVwYXJlZFNlYXJjaC5iaXRmbGFnc1xyXG4gICAgdmFyIGNvbnRhaW5zU3BhY2UgID0gcHJlcGFyZWRTZWFyY2guY29udGFpbnNTcGFjZVxyXG5cclxuICAgIHZhciB0aHJlc2hvbGQgPSBkZW5vcm1hbGl6ZVNjb3JlKCBvcHRpb25zPy50aHJlc2hvbGQgfHwgMCApXHJcbiAgICB2YXIgbGltaXQgICAgID0gb3B0aW9ucz8ubGltaXQgfHwgSU5GSU5JVFlcclxuXHJcbiAgICB2YXIgcmVzdWx0c0xlbiA9IDA7IHZhciBsaW1pdGVkQ291bnQgPSAwXHJcbiAgICB2YXIgdGFyZ2V0c0xlbiA9IHRhcmdldHMubGVuZ3RoXHJcblxyXG4gICAgZnVuY3Rpb24gcHVzaF9yZXN1bHQocmVzdWx0KSB7XHJcbiAgICAgIGlmKHJlc3VsdHNMZW4gPCBsaW1pdCkgeyBxLmFkZChyZXN1bHQpOyArK3Jlc3VsdHNMZW4gfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICArK2xpbWl0ZWRDb3VudFxyXG4gICAgICAgIGlmKHJlc3VsdC5fc2NvcmUgPiBxLnBlZWsoKS5fc2NvcmUpIHEucmVwbGFjZVRvcChyZXN1bHQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGlzIGNvZGUgaXMgY29weS9wYXN0ZWQgMyB0aW1lcyBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucyBbb3B0aW9ucy5rZXksIG9wdGlvbnMua2V5cywgbm8ga2V5c11cclxuXHJcbiAgICAvLyBvcHRpb25zLmtleVxyXG4gICAgaWYob3B0aW9ucz8ua2V5KSB7XHJcbiAgICAgIHZhciBrZXkgPSBvcHRpb25zLmtleVxyXG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGFyZ2V0c0xlbjsgKytpKSB7IHZhciBvYmogPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGdldFZhbHVlKG9iaiwga2V5KVxyXG4gICAgICAgIGlmKCF0YXJnZXQpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG5cclxuICAgICAgICBpZigoc2VhcmNoQml0ZmxhZ3MgJiB0YXJnZXQuX2JpdGZsYWdzKSAhPT0gc2VhcmNoQml0ZmxhZ3MpIGNvbnRpbnVlXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0KVxyXG4gICAgICAgIGlmKHJlc3VsdCA9PT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBpZihyZXN1bHQuX3Njb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZVxyXG5cclxuICAgICAgICByZXN1bHQub2JqID0gb2JqXHJcbiAgICAgICAgcHVzaF9yZXN1bHQocmVzdWx0KVxyXG4gICAgICB9XHJcblxyXG4gICAgLy8gb3B0aW9ucy5rZXlzXHJcbiAgICB9IGVsc2UgaWYob3B0aW9ucz8ua2V5cykge1xyXG4gICAgICB2YXIga2V5cyA9IG9wdGlvbnMua2V5c1xyXG4gICAgICB2YXIga2V5c0xlbiA9IGtleXMubGVuZ3RoXHJcblxyXG4gICAgICBvdXRlcjogZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldHNMZW47ICsraSkgeyB2YXIgb2JqID0gdGFyZ2V0c1tpXVxyXG5cclxuICAgICAgICB7IC8vIGVhcmx5IG91dCBiYXNlZCBvbiBiaXRmbGFnc1xyXG4gICAgICAgICAgdmFyIGtleXNCaXRmbGFncyA9IDBcclxuICAgICAgICAgIGZvciAodmFyIGtleUkgPSAwOyBrZXlJIDwga2V5c0xlbjsgKytrZXlJKSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSBrZXlzW2tleUldXHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIGtleSlcclxuICAgICAgICAgICAgaWYoIXRhcmdldCkgeyB0bXBUYXJnZXRzW2tleUldID0gbm9UYXJnZXQ7IGNvbnRpbnVlIH1cclxuICAgICAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG4gICAgICAgICAgICB0bXBUYXJnZXRzW2tleUldID0gdGFyZ2V0XHJcblxyXG4gICAgICAgICAgICBrZXlzQml0ZmxhZ3MgfD0gdGFyZ2V0Ll9iaXRmbGFnc1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmKChzZWFyY2hCaXRmbGFncyAmIGtleXNCaXRmbGFncykgIT09IHNlYXJjaEJpdGZsYWdzKSBjb250aW51ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoY29udGFpbnNTcGFjZSkgZm9yKGxldCBpPTA7IGk8cHJlcGFyZWRTZWFyY2guc3BhY2VTZWFyY2hlcy5sZW5ndGg7IGkrKykga2V5c1NwYWNlc0Jlc3RTY29yZXNbaV0gPSBORUdBVElWRV9JTkZJTklUWVxyXG5cclxuICAgICAgICBmb3IgKHZhciBrZXlJID0gMDsga2V5SSA8IGtleXNMZW47ICsra2V5SSkge1xyXG4gICAgICAgICAgdGFyZ2V0ID0gdG1wVGFyZ2V0c1trZXlJXVxyXG4gICAgICAgICAgaWYodGFyZ2V0ID09PSBub1RhcmdldCkgeyB0bXBSZXN1bHRzW2tleUldID0gbm9UYXJnZXQ7IGNvbnRpbnVlIH1cclxuXHJcbiAgICAgICAgICB0bXBSZXN1bHRzW2tleUldID0gYWxnb3JpdGhtKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQsIC8qYWxsb3dTcGFjZXM9Ki9mYWxzZSwgLyphbGxvd1BhcnRpYWxNYXRjaD0qL2NvbnRhaW5zU3BhY2UpXHJcbiAgICAgICAgICBpZih0bXBSZXN1bHRzW2tleUldID09PSBOVUxMKSB7IHRtcFJlc3VsdHNba2V5SV0gPSBub1RhcmdldDsgY29udGludWUgfVxyXG5cclxuICAgICAgICAgIC8vIHRvZG86IHRoaXMgc2VlbXMgd2VpcmQgYW5kIHdyb25nLiBsaWtlIHdoYXQgaWYgb3VyIGZpcnN0IG1hdGNoIHdhc24ndCBnb29kLiB0aGlzIHNob3VsZCBqdXN0IHJlcGxhY2UgaXQgaW5zdGVhZCBvZiBhdmVyYWdpbmcgd2l0aCBpdFxyXG4gICAgICAgICAgLy8gaWYgb3VyIHNlY29uZCBtYXRjaCBpc24ndCBnb29kIHdlIGlnbm9yZSBpdCBpbnN0ZWFkIG9mIGF2ZXJhZ2luZyB3aXRoIGl0XHJcbiAgICAgICAgICBpZihjb250YWluc1NwYWNlKSBmb3IobGV0IGk9MDsgaTxwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmKGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldID4gLTEwMDApIHtcclxuICAgICAgICAgICAgICBpZihrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA+IE5FR0FUSVZFX0lORklOSVRZKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG1wID0gKGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldICsgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0pIC8gNC8qYm9udXMgc2NvcmUgZm9yIGhhdmluZyBtdWx0aXBsZSBtYXRjaGVzKi9cclxuICAgICAgICAgICAgICAgIGlmKHRtcCA+IGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldKSBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA9IHRtcFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA+IGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldKSBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXSA9IGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihjb250YWluc1NwYWNlKSB7XHJcbiAgICAgICAgICBmb3IobGV0IGk9MDsgaTxwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzLmxlbmd0aDsgaSsrKSB7IGlmKGtleXNTcGFjZXNCZXN0U2NvcmVzW2ldID09PSBORUdBVElWRV9JTkZJTklUWSkgY29udGludWUgb3V0ZXIgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgaGFzQXRMZWFzdDFNYXRjaCA9IGZhbHNlXHJcbiAgICAgICAgICBmb3IobGV0IGk9MDsgaSA8IGtleXNMZW47IGkrKykgeyBpZih0bXBSZXN1bHRzW2ldLl9zY29yZSAhPT0gTkVHQVRJVkVfSU5GSU5JVFkpIHsgaGFzQXRMZWFzdDFNYXRjaCA9IHRydWU7IGJyZWFrIH0gfVxyXG4gICAgICAgICAgaWYoIWhhc0F0TGVhc3QxTWF0Y2gpIGNvbnRpbnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgb2JqUmVzdWx0cyA9IG5ldyBLZXlzUmVzdWx0KGtleXNMZW4pXHJcbiAgICAgICAgZm9yKGxldCBpPTA7IGkgPCBrZXlzTGVuOyBpKyspIHsgb2JqUmVzdWx0c1tpXSA9IHRtcFJlc3VsdHNbaV0gfVxyXG5cclxuICAgICAgICBpZihjb250YWluc1NwYWNlKSB7XHJcbiAgICAgICAgICB2YXIgc2NvcmUgPSAwXHJcbiAgICAgICAgICBmb3IobGV0IGk9MDsgaTxwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzLmxlbmd0aDsgaSsrKSBzY29yZSArPSBrZXlzU3BhY2VzQmVzdFNjb3Jlc1tpXVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyB0b2RvIGNvdWxkIHJld3JpdGUgdGhpcyBzY29yaW5nIHRvIGJlIG1vcmUgc2ltaWxhciB0byB3aGVuIHRoZXJlJ3Mgc3BhY2VzXHJcbiAgICAgICAgICAvLyBpZiB3ZSBtYXRjaCBtdWx0aXBsZSBrZXlzIGdpdmUgdXMgYm9udXMgcG9pbnRzXHJcbiAgICAgICAgICB2YXIgc2NvcmUgPSBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgICAgICAgZm9yKGxldCBpPTA7IGk8a2V5c0xlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBvYmpSZXN1bHRzW2ldXHJcbiAgICAgICAgICAgIGlmKHJlc3VsdC5fc2NvcmUgPiAtMTAwMCkge1xyXG4gICAgICAgICAgICAgIGlmKHNjb3JlID4gTkVHQVRJVkVfSU5GSU5JVFkpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0bXAgPSAoc2NvcmUgKyByZXN1bHQuX3Njb3JlKSAvIDQvKmJvbnVzIHNjb3JlIGZvciBoYXZpbmcgbXVsdGlwbGUgbWF0Y2hlcyovXHJcbiAgICAgICAgICAgICAgICBpZih0bXAgPiBzY29yZSkgc2NvcmUgPSB0bXBcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYocmVzdWx0Ll9zY29yZSA+IHNjb3JlKSBzY29yZSA9IHJlc3VsdC5fc2NvcmVcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG9ialJlc3VsdHMub2JqID0gb2JqXHJcbiAgICAgICAgb2JqUmVzdWx0cy5fc2NvcmUgPSBzY29yZVxyXG4gICAgICAgIGlmKG9wdGlvbnM/LnNjb3JlRm4pIHtcclxuICAgICAgICAgIHNjb3JlID0gb3B0aW9ucy5zY29yZUZuKG9ialJlc3VsdHMpXHJcbiAgICAgICAgICBpZighc2NvcmUpIGNvbnRpbnVlXHJcbiAgICAgICAgICBzY29yZSA9IGRlbm9ybWFsaXplU2NvcmUoc2NvcmUpXHJcbiAgICAgICAgICBvYmpSZXN1bHRzLl9zY29yZSA9IHNjb3JlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihzY29yZSA8IHRocmVzaG9sZCkgY29udGludWVcclxuICAgICAgICBwdXNoX3Jlc3VsdChvYmpSZXN1bHRzKVxyXG4gICAgICB9XHJcblxyXG4gICAgLy8gbm8ga2V5c1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldHNMZW47ICsraSkgeyB2YXIgdGFyZ2V0ID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIGlmKCF0YXJnZXQpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG5cclxuICAgICAgICBpZigoc2VhcmNoQml0ZmxhZ3MgJiB0YXJnZXQuX2JpdGZsYWdzKSAhPT0gc2VhcmNoQml0ZmxhZ3MpIGNvbnRpbnVlXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGFsZ29yaXRobShwcmVwYXJlZFNlYXJjaCwgdGFyZ2V0KVxyXG4gICAgICAgIGlmKHJlc3VsdCA9PT0gTlVMTCkgY29udGludWVcclxuICAgICAgICBpZihyZXN1bHQuX3Njb3JlIDwgdGhyZXNob2xkKSBjb250aW51ZVxyXG5cclxuICAgICAgICBwdXNoX3Jlc3VsdChyZXN1bHQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZihyZXN1bHRzTGVuID09PSAwKSByZXR1cm4gbm9SZXN1bHRzXHJcbiAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShyZXN1bHRzTGVuKVxyXG4gICAgZm9yKHZhciBpID0gcmVzdWx0c0xlbiAtIDE7IGkgPj0gMDsgLS1pKSByZXN1bHRzW2ldID0gcS5wb2xsKClcclxuICAgIHJlc3VsdHMudG90YWwgPSByZXN1bHRzTGVuICsgbGltaXRlZENvdW50XHJcbiAgICByZXR1cm4gcmVzdWx0c1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIHRoaXMgaXMgd3JpdHRlbiBhcyAxIGZ1bmN0aW9uIGluc3RlYWQgb2YgMiBmb3IgbWluaWZpY2F0aW9uLiBwZXJmIHNlZW1zIGZpbmUgLi4uXHJcbiAgLy8gZXhjZXB0IHdoZW4gbWluaWZpZWQuIHRoZSBwZXJmIGlzIHZlcnkgc2xvd1xyXG4gIHZhciBoaWdobGlnaHQgPSAocmVzdWx0LCBvcGVuPSc8Yj4nLCBjbG9zZT0nPC9iPicpID0+IHtcclxuICAgIHZhciBjYWxsYmFjayA9IHR5cGVvZiBvcGVuID09PSAnZnVuY3Rpb24nID8gb3BlbiA6IHVuZGVmaW5lZFxyXG5cclxuICAgIHZhciB0YXJnZXQgICAgICA9IHJlc3VsdC50YXJnZXRcclxuICAgIHZhciB0YXJnZXRMZW4gICA9IHRhcmdldC5sZW5ndGhcclxuICAgIHZhciBpbmRleGVzICAgICA9IHJlc3VsdC5pbmRleGVzXHJcbiAgICB2YXIgaGlnaGxpZ2h0ZWQgPSAnJ1xyXG4gICAgdmFyIG1hdGNoSSAgICAgID0gMFxyXG4gICAgdmFyIGluZGV4ZXNJICAgID0gMFxyXG4gICAgdmFyIG9wZW5lZCAgICAgID0gZmFsc2VcclxuICAgIHZhciBwYXJ0cyAgICAgICA9IFtdXHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldExlbjsgKytpKSB7IHZhciBjaGFyID0gdGFyZ2V0W2ldXHJcbiAgICAgIGlmKGluZGV4ZXNbaW5kZXhlc0ldID09PSBpKSB7XHJcbiAgICAgICAgKytpbmRleGVzSVxyXG4gICAgICAgIGlmKCFvcGVuZWQpIHsgb3BlbmVkID0gdHJ1ZVxyXG4gICAgICAgICAgaWYoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgcGFydHMucHVzaChoaWdobGlnaHRlZCk7IGhpZ2hsaWdodGVkID0gJydcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IG9wZW5cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGluZGV4ZXNJID09PSBpbmRleGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgaWYoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgKz0gY2hhclxyXG4gICAgICAgICAgICBwYXJ0cy5wdXNoKGNhbGxiYWNrKGhpZ2hsaWdodGVkLCBtYXRjaEkrKykpOyBoaWdobGlnaHRlZCA9ICcnXHJcbiAgICAgICAgICAgIHBhcnRzLnB1c2godGFyZ2V0LnN1YnN0cihpKzEpKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGlnaGxpZ2h0ZWQgKz0gY2hhciArIGNsb3NlICsgdGFyZ2V0LnN1YnN0cihpKzEpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZihvcGVuZWQpIHsgb3BlbmVkID0gZmFsc2VcclxuICAgICAgICAgIGlmKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHBhcnRzLnB1c2goY2FsbGJhY2soaGlnaGxpZ2h0ZWQsIG1hdGNoSSsrKSk7IGhpZ2hsaWdodGVkID0gJydcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkICs9IGNsb3NlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGhpZ2hsaWdodGVkICs9IGNoYXJcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY2FsbGJhY2sgPyBwYXJ0cyA6IGhpZ2hsaWdodGVkXHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIHByZXBhcmUgPSAodGFyZ2V0KSA9PiB7XHJcbiAgICBpZih0eXBlb2YgdGFyZ2V0ID09PSAnbnVtYmVyJykgdGFyZ2V0ID0gJycrdGFyZ2V0XHJcbiAgICBlbHNlIGlmKHR5cGVvZiB0YXJnZXQgIT09ICdzdHJpbmcnKSB0YXJnZXQgPSAnJ1xyXG4gICAgdmFyIGluZm8gPSBwcmVwYXJlTG93ZXJJbmZvKHRhcmdldClcclxuICAgIHJldHVybiBuZXdfcmVzdWx0KHRhcmdldCwge190YXJnZXRMb3dlcjppbmZvLl9sb3dlciwgX3RhcmdldExvd2VyQ29kZXM6aW5mby5sb3dlckNvZGVzLCBfYml0ZmxhZ3M6aW5mby5iaXRmbGFnc30pXHJcbiAgfVxyXG5cclxuICB2YXIgY2xlYW51cCA9ICgpID0+IHsgcHJlcGFyZWRDYWNoZS5jbGVhcigpOyBwcmVwYXJlZFNlYXJjaENhY2hlLmNsZWFyKCkgfVxyXG5cclxuXHJcbiAgLy8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcclxuICAvLyBCZWxvdyB0aGlzIHBvaW50IGlzIG9ubHkgaW50ZXJuYWwgY29kZVxyXG4gIC8vIEJlbG93IHRoaXMgcG9pbnQgaXMgb25seSBpbnRlcm5hbCBjb2RlXHJcbiAgLy8gQmVsb3cgdGhpcyBwb2ludCBpcyBvbmx5IGludGVybmFsIGNvZGVcclxuXHJcblxyXG4gIGNsYXNzIFJlc3VsdCB7XHJcbiAgICBnZXQgWydpbmRleGVzJ10oKSB7IHJldHVybiB0aGlzLl9pbmRleGVzLnNsaWNlKDAsIHRoaXMuX2luZGV4ZXMubGVuKS5zb3J0KChhLGIpPT5hLWIpIH1cclxuICAgIHNldCBbJ2luZGV4ZXMnXShpbmRleGVzKSB7IHJldHVybiB0aGlzLl9pbmRleGVzID0gaW5kZXhlcyB9XHJcbiAgICBbJ2hpZ2hsaWdodCddKG9wZW4sIGNsb3NlKSB7IHJldHVybiBoaWdobGlnaHQodGhpcywgb3BlbiwgY2xvc2UpIH1cclxuICAgIGdldCBbJ3Njb3JlJ10oKSB7IHJldHVybiBub3JtYWxpemVTY29yZSh0aGlzLl9zY29yZSkgfVxyXG4gICAgc2V0IFsnc2NvcmUnXShzY29yZSkgeyB0aGlzLl9zY29yZSA9IGRlbm9ybWFsaXplU2NvcmUoc2NvcmUpIH1cclxuICB9XHJcblxyXG4gIGNsYXNzIEtleXNSZXN1bHQgZXh0ZW5kcyBBcnJheSB7XHJcbiAgICBnZXQgWydzY29yZSddKCkgeyByZXR1cm4gbm9ybWFsaXplU2NvcmUodGhpcy5fc2NvcmUpIH1cclxuICAgIHNldCBbJ3Njb3JlJ10oc2NvcmUpIHsgdGhpcy5fc2NvcmUgPSBkZW5vcm1hbGl6ZVNjb3JlKHNjb3JlKSB9XHJcbiAgfVxyXG5cclxuICB2YXIgbmV3X3Jlc3VsdCA9ICh0YXJnZXQsIG9wdGlvbnMpID0+IHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBSZXN1bHQoKVxyXG4gICAgcmVzdWx0Wyd0YXJnZXQnXSAgICAgICAgICAgICA9IHRhcmdldFxyXG4gICAgcmVzdWx0WydvYmonXSAgICAgICAgICAgICAgICA9IG9wdGlvbnMub2JqICAgICAgICAgICAgICAgICAgID8/IE5VTExcclxuICAgIHJlc3VsdC5fc2NvcmUgICAgICAgICAgICAgICAgPSBvcHRpb25zLl9zY29yZSAgICAgICAgICAgICAgICA/PyBORUdBVElWRV9JTkZJTklUWVxyXG4gICAgcmVzdWx0Ll9pbmRleGVzICAgICAgICAgICAgICA9IG9wdGlvbnMuX2luZGV4ZXMgICAgICAgICAgICAgID8/IFtdXHJcbiAgICByZXN1bHQuX3RhcmdldExvd2VyICAgICAgICAgID0gb3B0aW9ucy5fdGFyZ2V0TG93ZXIgICAgICAgICAgPz8gJydcclxuICAgIHJlc3VsdC5fdGFyZ2V0TG93ZXJDb2RlcyAgICAgPSBvcHRpb25zLl90YXJnZXRMb3dlckNvZGVzICAgICA/PyBOVUxMXHJcbiAgICByZXN1bHQuX25leHRCZWdpbm5pbmdJbmRleGVzID0gb3B0aW9ucy5fbmV4dEJlZ2lubmluZ0luZGV4ZXMgPz8gTlVMTFxyXG4gICAgcmVzdWx0Ll9iaXRmbGFncyAgICAgICAgICAgICA9IG9wdGlvbnMuX2JpdGZsYWdzICAgICAgICAgICAgID8/IDBcclxuICAgIHJldHVybiByZXN1bHRcclxuICB9XHJcblxyXG5cclxuICB2YXIgbm9ybWFsaXplU2NvcmUgPSBzY29yZSA9PiB7XHJcbiAgICBpZihzY29yZSA9PT0gTkVHQVRJVkVfSU5GSU5JVFkpIHJldHVybiAwXHJcbiAgICBpZihzY29yZSA+IDEpIHJldHVybiBzY29yZVxyXG4gICAgcmV0dXJuIE1hdGguRSAqKiAoICgoLXNjb3JlICsgMSkqKi4wNDMwNyAtIDEpICogLTIpXHJcbiAgfVxyXG4gIHZhciBkZW5vcm1hbGl6ZVNjb3JlID0gbm9ybWFsaXplZFNjb3JlID0+IHtcclxuICAgIGlmKG5vcm1hbGl6ZWRTY29yZSA9PT0gMCkgcmV0dXJuIE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICBpZihub3JtYWxpemVkU2NvcmUgPiAxKSByZXR1cm4gbm9ybWFsaXplZFNjb3JlXHJcbiAgICByZXR1cm4gMSAtIE1hdGgucG93KChNYXRoLmxvZyhub3JtYWxpemVkU2NvcmUpIC8gLTIgKyAxKSwgMSAvIDAuMDQzMDcpXHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIHByZXBhcmVTZWFyY2ggPSAoc2VhcmNoKSA9PiB7XHJcbiAgICBpZih0eXBlb2Ygc2VhcmNoID09PSAnbnVtYmVyJykgc2VhcmNoID0gJycrc2VhcmNoXHJcbiAgICBlbHNlIGlmKHR5cGVvZiBzZWFyY2ggIT09ICdzdHJpbmcnKSBzZWFyY2ggPSAnJ1xyXG4gICAgc2VhcmNoID0gc2VhcmNoLnRyaW0oKVxyXG4gICAgdmFyIGluZm8gPSBwcmVwYXJlTG93ZXJJbmZvKHNlYXJjaClcclxuXHJcbiAgICB2YXIgc3BhY2VTZWFyY2hlcyA9IFtdXHJcbiAgICBpZihpbmZvLmNvbnRhaW5zU3BhY2UpIHtcclxuICAgICAgdmFyIHNlYXJjaGVzID0gc2VhcmNoLnNwbGl0KC9cXHMrLylcclxuICAgICAgc2VhcmNoZXMgPSBbLi4ubmV3IFNldChzZWFyY2hlcyldIC8vIGRpc3RpbmN0XHJcbiAgICAgIGZvcih2YXIgaT0wOyBpPHNlYXJjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYoc2VhcmNoZXNbaV0gPT09ICcnKSBjb250aW51ZVxyXG4gICAgICAgIHZhciBfaW5mbyA9IHByZXBhcmVMb3dlckluZm8oc2VhcmNoZXNbaV0pXHJcbiAgICAgICAgc3BhY2VTZWFyY2hlcy5wdXNoKHtsb3dlckNvZGVzOl9pbmZvLmxvd2VyQ29kZXMsIF9sb3dlcjpzZWFyY2hlc1tpXS50b0xvd2VyQ2FzZSgpLCBjb250YWluc1NwYWNlOmZhbHNlfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7bG93ZXJDb2RlczogaW5mby5sb3dlckNvZGVzLCBfbG93ZXI6IGluZm8uX2xvd2VyLCBjb250YWluc1NwYWNlOiBpbmZvLmNvbnRhaW5zU3BhY2UsIGJpdGZsYWdzOiBpbmZvLmJpdGZsYWdzLCBzcGFjZVNlYXJjaGVzOiBzcGFjZVNlYXJjaGVzfVxyXG4gIH1cclxuXHJcblxyXG5cclxuICB2YXIgZ2V0UHJlcGFyZWQgPSAodGFyZ2V0KSA9PiB7XHJcbiAgICBpZih0YXJnZXQubGVuZ3RoID4gOTk5KSByZXR1cm4gcHJlcGFyZSh0YXJnZXQpIC8vIGRvbid0IGNhY2hlIGh1Z2UgdGFyZ2V0c1xyXG4gICAgdmFyIHRhcmdldFByZXBhcmVkID0gcHJlcGFyZWRDYWNoZS5nZXQodGFyZ2V0KVxyXG4gICAgaWYodGFyZ2V0UHJlcGFyZWQgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHRhcmdldFByZXBhcmVkXHJcbiAgICB0YXJnZXRQcmVwYXJlZCA9IHByZXBhcmUodGFyZ2V0KVxyXG4gICAgcHJlcGFyZWRDYWNoZS5zZXQodGFyZ2V0LCB0YXJnZXRQcmVwYXJlZClcclxuICAgIHJldHVybiB0YXJnZXRQcmVwYXJlZFxyXG4gIH1cclxuICB2YXIgZ2V0UHJlcGFyZWRTZWFyY2ggPSAoc2VhcmNoKSA9PiB7XHJcbiAgICBpZihzZWFyY2gubGVuZ3RoID4gOTk5KSByZXR1cm4gcHJlcGFyZVNlYXJjaChzZWFyY2gpIC8vIGRvbid0IGNhY2hlIGh1Z2Ugc2VhcmNoZXNcclxuICAgIHZhciBzZWFyY2hQcmVwYXJlZCA9IHByZXBhcmVkU2VhcmNoQ2FjaGUuZ2V0KHNlYXJjaClcclxuICAgIGlmKHNlYXJjaFByZXBhcmVkICE9PSB1bmRlZmluZWQpIHJldHVybiBzZWFyY2hQcmVwYXJlZFxyXG4gICAgc2VhcmNoUHJlcGFyZWQgPSBwcmVwYXJlU2VhcmNoKHNlYXJjaClcclxuICAgIHByZXBhcmVkU2VhcmNoQ2FjaGUuc2V0KHNlYXJjaCwgc2VhcmNoUHJlcGFyZWQpXHJcbiAgICByZXR1cm4gc2VhcmNoUHJlcGFyZWRcclxuICB9XHJcblxyXG5cclxuICB2YXIgYWxsID0gKHRhcmdldHMsIG9wdGlvbnMpID0+IHtcclxuICAgIHZhciByZXN1bHRzID0gW107IHJlc3VsdHMudG90YWwgPSB0YXJnZXRzLmxlbmd0aCAvLyB0aGlzIHRvdGFsIGNhbiBiZSB3cm9uZyBpZiBzb21lIHRhcmdldHMgYXJlIHNraXBwZWRcclxuXHJcbiAgICB2YXIgbGltaXQgPSBvcHRpb25zPy5saW1pdCB8fCBJTkZJTklUWVxyXG5cclxuICAgIGlmKG9wdGlvbnM/LmtleSkge1xyXG4gICAgICBmb3IodmFyIGk9MDtpPHRhcmdldHMubGVuZ3RoO2krKykgeyB2YXIgb2JqID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIHZhciB0YXJnZXQgPSBnZXRWYWx1ZShvYmosIG9wdGlvbnMua2V5KVxyXG4gICAgICAgIGlmKHRhcmdldCA9PSBOVUxMKSBjb250aW51ZVxyXG4gICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3X3Jlc3VsdCh0YXJnZXQudGFyZ2V0LCB7X3Njb3JlOiB0YXJnZXQuX3Njb3JlLCBvYmo6IG9ian0pXHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7IGlmKHJlc3VsdHMubGVuZ3RoID49IGxpbWl0KSByZXR1cm4gcmVzdWx0c1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYob3B0aW9ucz8ua2V5cykge1xyXG4gICAgICBmb3IodmFyIGk9MDtpPHRhcmdldHMubGVuZ3RoO2krKykgeyB2YXIgb2JqID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIHZhciBvYmpSZXN1bHRzID0gbmV3IEtleXNSZXN1bHQob3B0aW9ucy5rZXlzLmxlbmd0aClcclxuICAgICAgICBmb3IgKHZhciBrZXlJID0gb3B0aW9ucy5rZXlzLmxlbmd0aCAtIDE7IGtleUkgPj0gMDsgLS1rZXlJKSB7XHJcbiAgICAgICAgICB2YXIgdGFyZ2V0ID0gZ2V0VmFsdWUob2JqLCBvcHRpb25zLmtleXNba2V5SV0pXHJcbiAgICAgICAgICBpZighdGFyZ2V0KSB7IG9ialJlc3VsdHNba2V5SV0gPSBub1RhcmdldDsgY29udGludWUgfVxyXG4gICAgICAgICAgaWYoIWlzUHJlcGFyZWQodGFyZ2V0KSkgdGFyZ2V0ID0gZ2V0UHJlcGFyZWQodGFyZ2V0KVxyXG4gICAgICAgICAgdGFyZ2V0Ll9zY29yZSA9IE5FR0FUSVZFX0lORklOSVRZXHJcbiAgICAgICAgICB0YXJnZXQuX2luZGV4ZXMubGVuID0gMFxyXG4gICAgICAgICAgb2JqUmVzdWx0c1trZXlJXSA9IHRhcmdldFxyXG4gICAgICAgIH1cclxuICAgICAgICBvYmpSZXN1bHRzLm9iaiA9IG9ialxyXG4gICAgICAgIG9ialJlc3VsdHMuX3Njb3JlID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgICByZXN1bHRzLnB1c2gob2JqUmVzdWx0cyk7IGlmKHJlc3VsdHMubGVuZ3RoID49IGxpbWl0KSByZXR1cm4gcmVzdWx0c1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IodmFyIGk9MDtpPHRhcmdldHMubGVuZ3RoO2krKykgeyB2YXIgdGFyZ2V0ID0gdGFyZ2V0c1tpXVxyXG4gICAgICAgIGlmKHRhcmdldCA9PSBOVUxMKSBjb250aW51ZVxyXG4gICAgICAgIGlmKCFpc1ByZXBhcmVkKHRhcmdldCkpIHRhcmdldCA9IGdldFByZXBhcmVkKHRhcmdldClcclxuICAgICAgICB0YXJnZXQuX3Njb3JlID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgICB0YXJnZXQuX2luZGV4ZXMubGVuID0gMFxyXG4gICAgICAgIHJlc3VsdHMucHVzaCh0YXJnZXQpOyBpZihyZXN1bHRzLmxlbmd0aCA+PSBsaW1pdCkgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHRzXHJcbiAgfVxyXG5cclxuXHJcbiAgdmFyIGFsZ29yaXRobSA9IChwcmVwYXJlZFNlYXJjaCwgcHJlcGFyZWQsIGFsbG93U3BhY2VzPWZhbHNlLCBhbGxvd1BhcnRpYWxNYXRjaD1mYWxzZSkgPT4ge1xyXG4gICAgaWYoYWxsb3dTcGFjZXM9PT1mYWxzZSAmJiBwcmVwYXJlZFNlYXJjaC5jb250YWluc1NwYWNlKSByZXR1cm4gYWxnb3JpdGhtU3BhY2VzKHByZXBhcmVkU2VhcmNoLCBwcmVwYXJlZCwgYWxsb3dQYXJ0aWFsTWF0Y2gpXHJcblxyXG4gICAgdmFyIHNlYXJjaExvd2VyICAgICAgPSBwcmVwYXJlZFNlYXJjaC5fbG93ZXJcclxuICAgIHZhciBzZWFyY2hMb3dlckNvZGVzID0gcHJlcGFyZWRTZWFyY2gubG93ZXJDb2Rlc1xyXG4gICAgdmFyIHNlYXJjaExvd2VyQ29kZSAgPSBzZWFyY2hMb3dlckNvZGVzWzBdXHJcbiAgICB2YXIgdGFyZ2V0TG93ZXJDb2RlcyA9IHByZXBhcmVkLl90YXJnZXRMb3dlckNvZGVzXHJcbiAgICB2YXIgc2VhcmNoTGVuICAgICAgICA9IHNlYXJjaExvd2VyQ29kZXMubGVuZ3RoXHJcbiAgICB2YXIgdGFyZ2V0TGVuICAgICAgICA9IHRhcmdldExvd2VyQ29kZXMubGVuZ3RoXHJcbiAgICB2YXIgc2VhcmNoSSAgICAgICAgICA9IDAgLy8gd2hlcmUgd2UgYXRcclxuICAgIHZhciB0YXJnZXRJICAgICAgICAgID0gMCAvLyB3aGVyZSB5b3UgYXRcclxuICAgIHZhciBtYXRjaGVzU2ltcGxlTGVuID0gMFxyXG5cclxuICAgIC8vIHZlcnkgYmFzaWMgZnV6enkgbWF0Y2g7IHRvIHJlbW92ZSBub24tbWF0Y2hpbmcgdGFyZ2V0cyBBU0FQIVxyXG4gICAgLy8gd2FsayB0aHJvdWdoIHRhcmdldC4gZmluZCBzZXF1ZW50aWFsIG1hdGNoZXMuXHJcbiAgICAvLyBpZiBhbGwgY2hhcnMgYXJlbid0IGZvdW5kIHRoZW4gZXhpdFxyXG4gICAgZm9yKDs7KSB7XHJcbiAgICAgIHZhciBpc01hdGNoID0gc2VhcmNoTG93ZXJDb2RlID09PSB0YXJnZXRMb3dlckNvZGVzW3RhcmdldEldXHJcbiAgICAgIGlmKGlzTWF0Y2gpIHtcclxuICAgICAgICBtYXRjaGVzU2ltcGxlW21hdGNoZXNTaW1wbGVMZW4rK10gPSB0YXJnZXRJXHJcbiAgICAgICAgKytzZWFyY2hJOyBpZihzZWFyY2hJID09PSBzZWFyY2hMZW4pIGJyZWFrXHJcbiAgICAgICAgc2VhcmNoTG93ZXJDb2RlID0gc2VhcmNoTG93ZXJDb2Rlc1tzZWFyY2hJXVxyXG4gICAgICB9XHJcbiAgICAgICsrdGFyZ2V0STsgaWYodGFyZ2V0SSA+PSB0YXJnZXRMZW4pIHJldHVybiBOVUxMIC8vIEZhaWxlZCB0byBmaW5kIHNlYXJjaElcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2VhcmNoSSA9IDBcclxuICAgIHZhciBzdWNjZXNzU3RyaWN0ID0gZmFsc2VcclxuICAgIHZhciBtYXRjaGVzU3RyaWN0TGVuID0gMFxyXG5cclxuICAgIHZhciBuZXh0QmVnaW5uaW5nSW5kZXhlcyA9IHByZXBhcmVkLl9uZXh0QmVnaW5uaW5nSW5kZXhlc1xyXG4gICAgaWYobmV4dEJlZ2lubmluZ0luZGV4ZXMgPT09IE5VTEwpIG5leHRCZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZWQuX25leHRCZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZU5leHRCZWdpbm5pbmdJbmRleGVzKHByZXBhcmVkLnRhcmdldClcclxuICAgIHRhcmdldEkgPSBtYXRjaGVzU2ltcGxlWzBdPT09MCA/IDAgOiBuZXh0QmVnaW5uaW5nSW5kZXhlc1ttYXRjaGVzU2ltcGxlWzBdLTFdXHJcblxyXG4gICAgLy8gT3VyIHRhcmdldCBzdHJpbmcgc3VjY2Vzc2Z1bGx5IG1hdGNoZWQgYWxsIGNoYXJhY3RlcnMgaW4gc2VxdWVuY2UhXHJcbiAgICAvLyBMZXQncyB0cnkgYSBtb3JlIGFkdmFuY2VkIGFuZCBzdHJpY3QgdGVzdCB0byBpbXByb3ZlIHRoZSBzY29yZVxyXG4gICAgLy8gb25seSBjb3VudCBpdCBhcyBhIG1hdGNoIGlmIGl0J3MgY29uc2VjdXRpdmUgb3IgYSBiZWdpbm5pbmcgY2hhcmFjdGVyIVxyXG4gICAgdmFyIGJhY2t0cmFja0NvdW50ID0gMFxyXG4gICAgaWYodGFyZ2V0SSAhPT0gdGFyZ2V0TGVuKSBmb3IoOzspIHtcclxuICAgICAgaWYodGFyZ2V0SSA+PSB0YXJnZXRMZW4pIHtcclxuICAgICAgICAvLyBXZSBmYWlsZWQgdG8gZmluZCBhIGdvb2Qgc3BvdCBmb3IgdGhpcyBzZWFyY2ggY2hhciwgZ28gYmFjayB0byB0aGUgcHJldmlvdXMgc2VhcmNoIGNoYXIgYW5kIGZvcmNlIGl0IGZvcndhcmRcclxuICAgICAgICBpZihzZWFyY2hJIDw9IDApIGJyZWFrIC8vIFdlIGZhaWxlZCB0byBwdXNoIGNoYXJzIGZvcndhcmQgZm9yIGEgYmV0dGVyIG1hdGNoXHJcblxyXG4gICAgICAgICsrYmFja3RyYWNrQ291bnQ7IGlmKGJhY2t0cmFja0NvdW50ID4gMjAwKSBicmVhayAvLyBleHBvbmVudGlhbCBiYWNrdHJhY2tpbmcgaXMgdGFraW5nIHRvbyBsb25nLCBqdXN0IGdpdmUgdXAgYW5kIHJldHVybiBhIGJhZCBtYXRjaFxyXG5cclxuICAgICAgICAtLXNlYXJjaElcclxuICAgICAgICB2YXIgbGFzdE1hdGNoID0gbWF0Y2hlc1N0cmljdFstLW1hdGNoZXNTdHJpY3RMZW5dXHJcbiAgICAgICAgdGFyZ2V0SSA9IG5leHRCZWdpbm5pbmdJbmRleGVzW2xhc3RNYXRjaF1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGlzTWF0Y2ggPSBzZWFyY2hMb3dlckNvZGVzW3NlYXJjaEldID09PSB0YXJnZXRMb3dlckNvZGVzW3RhcmdldEldXHJcbiAgICAgICAgaWYoaXNNYXRjaCkge1xyXG4gICAgICAgICAgbWF0Y2hlc1N0cmljdFttYXRjaGVzU3RyaWN0TGVuKytdID0gdGFyZ2V0SVxyXG4gICAgICAgICAgKytzZWFyY2hJOyBpZihzZWFyY2hJID09PSBzZWFyY2hMZW4pIHsgc3VjY2Vzc1N0cmljdCA9IHRydWU7IGJyZWFrIH1cclxuICAgICAgICAgICsrdGFyZ2V0SVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0YXJnZXRJID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNbdGFyZ2V0SV1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayBpZiBpdCdzIGEgc3Vic3RyaW5nIG1hdGNoXHJcbiAgICB2YXIgc3Vic3RyaW5nSW5kZXggPSBzZWFyY2hMZW4gPD0gMSA/IC0xIDogcHJlcGFyZWQuX3RhcmdldExvd2VyLmluZGV4T2Yoc2VhcmNoTG93ZXIsIG1hdGNoZXNTaW1wbGVbMF0pIC8vIHBlcmY6IHRoaXMgaXMgc2xvd1xyXG4gICAgdmFyIGlzU3Vic3RyaW5nID0gISF+c3Vic3RyaW5nSW5kZXhcclxuICAgIHZhciBpc1N1YnN0cmluZ0JlZ2lubmluZyA9ICFpc1N1YnN0cmluZyA/IGZhbHNlIDogc3Vic3RyaW5nSW5kZXg9PT0wIHx8IHByZXBhcmVkLl9uZXh0QmVnaW5uaW5nSW5kZXhlc1tzdWJzdHJpbmdJbmRleC0xXSA9PT0gc3Vic3RyaW5nSW5kZXhcclxuXHJcbiAgICAvLyBpZiBpdCdzIGEgc3Vic3RyaW5nIG1hdGNoIGJ1dCBub3QgYXQgYSBiZWdpbm5pbmcgaW5kZXgsIGxldCdzIHRyeSB0byBmaW5kIGEgc3Vic3RyaW5nIHN0YXJ0aW5nIGF0IGEgYmVnaW5uaW5nIGluZGV4IGZvciBhIGJldHRlciBzY29yZVxyXG4gICAgaWYoaXNTdWJzdHJpbmcgJiYgIWlzU3Vic3RyaW5nQmVnaW5uaW5nKSB7XHJcbiAgICAgIGZvcih2YXIgaT0wOyBpPG5leHRCZWdpbm5pbmdJbmRleGVzLmxlbmd0aDsgaT1uZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSkge1xyXG4gICAgICAgIGlmKGkgPD0gc3Vic3RyaW5nSW5kZXgpIGNvbnRpbnVlXHJcblxyXG4gICAgICAgIGZvcih2YXIgcz0wOyBzPHNlYXJjaExlbjsgcysrKSBpZihzZWFyY2hMb3dlckNvZGVzW3NdICE9PSBwcmVwYXJlZC5fdGFyZ2V0TG93ZXJDb2Rlc1tpK3NdKSBicmVha1xyXG4gICAgICAgIGlmKHMgPT09IHNlYXJjaExlbikgeyBzdWJzdHJpbmdJbmRleCA9IGk7IGlzU3Vic3RyaW5nQmVnaW5uaW5nID0gdHJ1ZTsgYnJlYWsgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGFsbHkgdXAgdGhlIHNjb3JlICYga2VlcCB0cmFjayBvZiBtYXRjaGVzIGZvciBoaWdobGlnaHRpbmcgbGF0ZXJcclxuICAgIC8vIGlmIGl0J3MgYSBzaW1wbGUgbWF0Y2gsIHdlJ2xsIHN3aXRjaCB0byBhIHN1YnN0cmluZyBtYXRjaCBpZiBhIHN1YnN0cmluZyBleGlzdHNcclxuICAgIC8vIGlmIGl0J3MgYSBzdHJpY3QgbWF0Y2gsIHdlJ2xsIHN3aXRjaCB0byBhIHN1YnN0cmluZyBtYXRjaCBvbmx5IGlmIHRoYXQncyBhIGJldHRlciBzY29yZVxyXG5cclxuICAgIHZhciBjYWxjdWxhdGVTY29yZSA9IG1hdGNoZXMgPT4ge1xyXG4gICAgICB2YXIgc2NvcmUgPSAwXHJcblxyXG4gICAgICB2YXIgZXh0cmFNYXRjaEdyb3VwQ291bnQgPSAwXHJcbiAgICAgIGZvcih2YXIgaSA9IDE7IGkgPCBzZWFyY2hMZW47ICsraSkge1xyXG4gICAgICAgIGlmKG1hdGNoZXNbaV0gLSBtYXRjaGVzW2ktMV0gIT09IDEpIHtzY29yZSAtPSBtYXRjaGVzW2ldOyArK2V4dHJhTWF0Y2hHcm91cENvdW50fVxyXG4gICAgICB9XHJcbiAgICAgIHZhciB1bm1hdGNoZWREaXN0YW5jZSA9IG1hdGNoZXNbc2VhcmNoTGVuLTFdIC0gbWF0Y2hlc1swXSAtIChzZWFyY2hMZW4tMSlcclxuXHJcbiAgICAgIHNjb3JlIC09ICgxMit1bm1hdGNoZWREaXN0YW5jZSkgKiBleHRyYU1hdGNoR3JvdXBDb3VudCAvLyBwZW5hbGl0eSBmb3IgbW9yZSBncm91cHNcclxuXHJcbiAgICAgIGlmKG1hdGNoZXNbMF0gIT09IDApIHNjb3JlIC09IG1hdGNoZXNbMF0qbWF0Y2hlc1swXSouMiAvLyBwZW5hbGl0eSBmb3Igbm90IHN0YXJ0aW5nIG5lYXIgdGhlIGJlZ2lubmluZ1xyXG5cclxuICAgICAgaWYoIXN1Y2Nlc3NTdHJpY3QpIHtcclxuICAgICAgICBzY29yZSAqPSAxMDAwXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gc3VjY2Vzc1N0cmljdCBvbiBhIHRhcmdldCB3aXRoIHRvbyBtYW55IGJlZ2lubmluZyBpbmRleGVzIGxvc2VzIHBvaW50cyBmb3IgYmVpbmcgYSBiYWQgdGFyZ2V0XHJcbiAgICAgICAgdmFyIHVuaXF1ZUJlZ2lubmluZ0luZGV4ZXMgPSAxXHJcbiAgICAgICAgZm9yKHZhciBpID0gbmV4dEJlZ2lubmluZ0luZGV4ZXNbMF07IGkgPCB0YXJnZXRMZW47IGk9bmV4dEJlZ2lubmluZ0luZGV4ZXNbaV0pICsrdW5pcXVlQmVnaW5uaW5nSW5kZXhlc1xyXG5cclxuICAgICAgICBpZih1bmlxdWVCZWdpbm5pbmdJbmRleGVzID4gMjQpIHNjb3JlICo9ICh1bmlxdWVCZWdpbm5pbmdJbmRleGVzLTI0KSoxMCAvLyBxdWl0ZSBhcmJpdHJhcnkgbnVtYmVycyBoZXJlIC4uLlxyXG4gICAgICB9XHJcblxyXG4gICAgICBzY29yZSAtPSAodGFyZ2V0TGVuIC0gc2VhcmNoTGVuKS8yIC8vIHBlbmFsaXR5IGZvciBsb25nZXIgdGFyZ2V0c1xyXG5cclxuICAgICAgaWYoaXNTdWJzdHJpbmcpICAgICAgICAgIHNjb3JlIC89IDErc2VhcmNoTGVuKnNlYXJjaExlbioxIC8vIGJvbnVzIGZvciBiZWluZyBhIGZ1bGwgc3Vic3RyaW5nXHJcbiAgICAgIGlmKGlzU3Vic3RyaW5nQmVnaW5uaW5nKSBzY29yZSAvPSAxK3NlYXJjaExlbipzZWFyY2hMZW4qMSAvLyBib251cyBmb3Igc3Vic3RyaW5nIHN0YXJ0aW5nIG9uIGEgYmVnaW5uaW5nSW5kZXhcclxuXHJcbiAgICAgIHNjb3JlIC09ICh0YXJnZXRMZW4gLSBzZWFyY2hMZW4pLzIgLy8gcGVuYWxpdHkgZm9yIGxvbmdlciB0YXJnZXRzXHJcblxyXG4gICAgICByZXR1cm4gc2NvcmVcclxuICAgIH1cclxuXHJcbiAgICBpZighc3VjY2Vzc1N0cmljdCkge1xyXG4gICAgICBpZihpc1N1YnN0cmluZykgZm9yKHZhciBpPTA7IGk8c2VhcmNoTGVuOyArK2kpIG1hdGNoZXNTaW1wbGVbaV0gPSBzdWJzdHJpbmdJbmRleCtpIC8vIGF0IHRoaXMgcG9pbnQgaXQncyBzYWZlIHRvIG92ZXJ3cml0ZSBtYXRjaGVoc1NpbXBsZSB3aXRoIHN1YnN0ciBtYXRjaGVzXHJcbiAgICAgIHZhciBtYXRjaGVzQmVzdCA9IG1hdGNoZXNTaW1wbGVcclxuICAgICAgdmFyIHNjb3JlID0gY2FsY3VsYXRlU2NvcmUobWF0Y2hlc0Jlc3QpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZihpc1N1YnN0cmluZ0JlZ2lubmluZykge1xyXG4gICAgICAgIGZvcih2YXIgaT0wOyBpPHNlYXJjaExlbjsgKytpKSBtYXRjaGVzU2ltcGxlW2ldID0gc3Vic3RyaW5nSW5kZXgraSAvLyBhdCB0aGlzIHBvaW50IGl0J3Mgc2FmZSB0byBvdmVyd3JpdGUgbWF0Y2hlaHNTaW1wbGUgd2l0aCBzdWJzdHIgbWF0Y2hlc1xyXG4gICAgICAgIHZhciBtYXRjaGVzQmVzdCA9IG1hdGNoZXNTaW1wbGVcclxuICAgICAgICB2YXIgc2NvcmUgPSBjYWxjdWxhdGVTY29yZShtYXRjaGVzU2ltcGxlKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBtYXRjaGVzQmVzdCA9IG1hdGNoZXNTdHJpY3RcclxuICAgICAgICB2YXIgc2NvcmUgPSBjYWxjdWxhdGVTY29yZShtYXRjaGVzU3RyaWN0KVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJlcGFyZWQuX3Njb3JlID0gc2NvcmVcclxuXHJcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgc2VhcmNoTGVuOyArK2kpIHByZXBhcmVkLl9pbmRleGVzW2ldID0gbWF0Y2hlc0Jlc3RbaV1cclxuICAgIHByZXBhcmVkLl9pbmRleGVzLmxlbiA9IHNlYXJjaExlblxyXG5cclxuICAgIGNvbnN0IHJlc3VsdCAgICA9IG5ldyBSZXN1bHQoKVxyXG4gICAgcmVzdWx0LnRhcmdldCAgID0gcHJlcGFyZWQudGFyZ2V0XHJcbiAgICByZXN1bHQuX3Njb3JlICAgPSBwcmVwYXJlZC5fc2NvcmVcclxuICAgIHJlc3VsdC5faW5kZXhlcyA9IHByZXBhcmVkLl9pbmRleGVzXHJcbiAgICByZXR1cm4gcmVzdWx0XHJcbiAgfVxyXG4gIHZhciBhbGdvcml0aG1TcGFjZXMgPSAocHJlcGFyZWRTZWFyY2gsIHRhcmdldCwgYWxsb3dQYXJ0aWFsTWF0Y2gpID0+IHtcclxuICAgIHZhciBzZWVuX2luZGV4ZXMgPSBuZXcgU2V0KClcclxuICAgIHZhciBzY29yZSA9IDBcclxuICAgIHZhciByZXN1bHQgPSBOVUxMXHJcblxyXG4gICAgdmFyIGZpcnN0X3NlZW5faW5kZXhfbGFzdF9zZWFyY2ggPSAwXHJcbiAgICB2YXIgc2VhcmNoZXMgPSBwcmVwYXJlZFNlYXJjaC5zcGFjZVNlYXJjaGVzXHJcbiAgICB2YXIgc2VhcmNoZXNMZW4gPSBzZWFyY2hlcy5sZW5ndGhcclxuICAgIHZhciBjaGFuZ2VzbGVuID0gMFxyXG5cclxuICAgIC8vIFJldHVybiBfbmV4dEJlZ2lubmluZ0luZGV4ZXMgYmFjayB0byBpdHMgbm9ybWFsIHN0YXRlXHJcbiAgICB2YXIgcmVzZXROZXh0QmVnaW5uaW5nSW5kZXhlcyA9ICgpID0+IHtcclxuICAgICAgZm9yKGxldCBpPWNoYW5nZXNsZW4tMTsgaT49MDsgaS0tKSB0YXJnZXQuX25leHRCZWdpbm5pbmdJbmRleGVzW25leHRCZWdpbm5pbmdJbmRleGVzQ2hhbmdlc1tpKjIgKyAwXV0gPSBuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXNbaSoyICsgMV1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgaGFzQXRMZWFzdDFNYXRjaCA9IGZhbHNlXHJcbiAgICBmb3IodmFyIGk9MDsgaTxzZWFyY2hlc0xlbjsgKytpKSB7XHJcbiAgICAgIGFsbG93UGFydGlhbE1hdGNoU2NvcmVzW2ldID0gTkVHQVRJVkVfSU5GSU5JVFlcclxuICAgICAgdmFyIHNlYXJjaCA9IHNlYXJjaGVzW2ldXHJcblxyXG4gICAgICByZXN1bHQgPSBhbGdvcml0aG0oc2VhcmNoLCB0YXJnZXQpXHJcbiAgICAgIGlmKGFsbG93UGFydGlhbE1hdGNoKSB7XHJcbiAgICAgICAgaWYocmVzdWx0ID09PSBOVUxMKSBjb250aW51ZVxyXG4gICAgICAgIGhhc0F0TGVhc3QxTWF0Y2ggPSB0cnVlXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYocmVzdWx0ID09PSBOVUxMKSB7cmVzZXROZXh0QmVnaW5uaW5nSW5kZXhlcygpOyByZXR1cm4gTlVMTH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgbm90IHRoZSBsYXN0IHNlYXJjaCwgd2UgbmVlZCB0byBtdXRhdGUgX25leHRCZWdpbm5pbmdJbmRleGVzIGZvciB0aGUgbmV4dCBzZWFyY2hcclxuICAgICAgdmFyIGlzVGhlTGFzdFNlYXJjaCA9IGkgPT09IHNlYXJjaGVzTGVuIC0gMVxyXG4gICAgICBpZighaXNUaGVMYXN0U2VhcmNoKSB7XHJcbiAgICAgICAgdmFyIGluZGV4ZXMgPSByZXN1bHQuX2luZGV4ZXNcclxuXHJcbiAgICAgICAgdmFyIGluZGV4ZXNJc0NvbnNlY3V0aXZlU3Vic3RyaW5nID0gdHJ1ZVxyXG4gICAgICAgIGZvcihsZXQgaT0wOyBpPGluZGV4ZXMubGVuLTE7IGkrKykge1xyXG4gICAgICAgICAgaWYoaW5kZXhlc1tpKzFdIC0gaW5kZXhlc1tpXSAhPT0gMSkge1xyXG4gICAgICAgICAgICBpbmRleGVzSXNDb25zZWN1dGl2ZVN1YnN0cmluZyA9IGZhbHNlOyBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGluZGV4ZXNJc0NvbnNlY3V0aXZlU3Vic3RyaW5nKSB7XHJcbiAgICAgICAgICB2YXIgbmV3QmVnaW5uaW5nSW5kZXggPSBpbmRleGVzW2luZGV4ZXMubGVuLTFdICsgMVxyXG4gICAgICAgICAgdmFyIHRvUmVwbGFjZSA9IHRhcmdldC5fbmV4dEJlZ2lubmluZ0luZGV4ZXNbbmV3QmVnaW5uaW5nSW5kZXgtMV1cclxuICAgICAgICAgIGZvcihsZXQgaT1uZXdCZWdpbm5pbmdJbmRleC0xOyBpPj0wOyBpLS0pIHtcclxuICAgICAgICAgICAgaWYodG9SZXBsYWNlICE9PSB0YXJnZXQuX25leHRCZWdpbm5pbmdJbmRleGVzW2ldKSBicmVha1xyXG4gICAgICAgICAgICB0YXJnZXQuX25leHRCZWdpbm5pbmdJbmRleGVzW2ldID0gbmV3QmVnaW5uaW5nSW5kZXhcclxuICAgICAgICAgICAgbmV4dEJlZ2lubmluZ0luZGV4ZXNDaGFuZ2VzW2NoYW5nZXNsZW4qMiArIDBdID0gaVxyXG4gICAgICAgICAgICBuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXNbY2hhbmdlc2xlbioyICsgMV0gPSB0b1JlcGxhY2VcclxuICAgICAgICAgICAgY2hhbmdlc2xlbisrXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBzY29yZSArPSByZXN1bHQuX3Njb3JlIC8gc2VhcmNoZXNMZW5cclxuICAgICAgYWxsb3dQYXJ0aWFsTWF0Y2hTY29yZXNbaV0gPSByZXN1bHQuX3Njb3JlIC8gc2VhcmNoZXNMZW5cclxuXHJcbiAgICAgIC8vIGRvY2sgcG9pbnRzIGJhc2VkIG9uIG9yZGVyIG90aGVyd2lzZSBcImMgbWFuXCIgcmV0dXJucyBNYW5pZmVzdC5jcHAgaW5zdGVhZCBvZiBDaGVhdE1hbmFnZXIuaFxyXG4gICAgICBpZihyZXN1bHQuX2luZGV4ZXNbMF0gPCBmaXJzdF9zZWVuX2luZGV4X2xhc3Rfc2VhcmNoKSB7XHJcbiAgICAgICAgc2NvcmUgLT0gKGZpcnN0X3NlZW5faW5kZXhfbGFzdF9zZWFyY2ggLSByZXN1bHQuX2luZGV4ZXNbMF0pICogMlxyXG4gICAgICB9XHJcbiAgICAgIGZpcnN0X3NlZW5faW5kZXhfbGFzdF9zZWFyY2ggPSByZXN1bHQuX2luZGV4ZXNbMF1cclxuXHJcbiAgICAgIGZvcih2YXIgaj0wOyBqPHJlc3VsdC5faW5kZXhlcy5sZW47ICsraikgc2Vlbl9pbmRleGVzLmFkZChyZXN1bHQuX2luZGV4ZXNbal0pXHJcbiAgICB9XHJcblxyXG4gICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2ggJiYgIWhhc0F0TGVhc3QxTWF0Y2gpIHJldHVybiBOVUxMXHJcblxyXG4gICAgcmVzZXROZXh0QmVnaW5uaW5nSW5kZXhlcygpXHJcblxyXG4gICAgLy8gYWxsb3dzIGEgc2VhcmNoIHdpdGggc3BhY2VzIHRoYXQncyBhbiBleGFjdCBzdWJzdHJpbmcgdG8gc2NvcmUgd2VsbFxyXG4gICAgdmFyIGFsbG93U3BhY2VzUmVzdWx0ID0gYWxnb3JpdGhtKHByZXBhcmVkU2VhcmNoLCB0YXJnZXQsIC8qYWxsb3dTcGFjZXM9Ki90cnVlKVxyXG4gICAgaWYoYWxsb3dTcGFjZXNSZXN1bHQgIT09IE5VTEwgJiYgYWxsb3dTcGFjZXNSZXN1bHQuX3Njb3JlID4gc2NvcmUpIHtcclxuICAgICAgaWYoYWxsb3dQYXJ0aWFsTWF0Y2gpIHtcclxuICAgICAgICBmb3IodmFyIGk9MDsgaTxzZWFyY2hlc0xlbjsgKytpKSB7XHJcbiAgICAgICAgICBhbGxvd1BhcnRpYWxNYXRjaFNjb3Jlc1tpXSA9IGFsbG93U3BhY2VzUmVzdWx0Ll9zY29yZSAvIHNlYXJjaGVzTGVuXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhbGxvd1NwYWNlc1Jlc3VsdFxyXG4gICAgfVxyXG5cclxuICAgIGlmKGFsbG93UGFydGlhbE1hdGNoKSByZXN1bHQgPSB0YXJnZXRcclxuICAgIHJlc3VsdC5fc2NvcmUgPSBzY29yZVxyXG5cclxuICAgIHZhciBpID0gMFxyXG4gICAgZm9yIChsZXQgaW5kZXggb2Ygc2Vlbl9pbmRleGVzKSByZXN1bHQuX2luZGV4ZXNbaSsrXSA9IGluZGV4XHJcbiAgICByZXN1bHQuX2luZGV4ZXMubGVuID0gaVxyXG5cclxuICAgIHJldHVybiByZXN1bHRcclxuICB9XHJcblxyXG4gIC8vIHdlIHVzZSB0aGlzIGluc3RlYWQgb2YganVzdCAubm9ybWFsaXplKCdORkQnKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCAnJykgYmVjYXVzZSB0aGF0IHNjcmV3cyB3aXRoIGphcGFuZXNlIGNoYXJhY3RlcnNcclxuICB2YXIgcmVtb3ZlX2FjY2VudHMgPSAoc3RyKSA9PiBzdHIucmVwbGFjZSgvXFxwe1NjcmlwdD1MYXRpbn0rL2d1LCBtYXRjaCA9PiBtYXRjaC5ub3JtYWxpemUoJ05GRCcpKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCAnJylcclxuXHJcbiAgdmFyIHByZXBhcmVMb3dlckluZm8gPSAoc3RyKSA9PiB7XHJcbiAgICBzdHIgPSByZW1vdmVfYWNjZW50cyhzdHIpXHJcbiAgICB2YXIgc3RyTGVuID0gc3RyLmxlbmd0aFxyXG4gICAgdmFyIGxvd2VyID0gc3RyLnRvTG93ZXJDYXNlKClcclxuICAgIHZhciBsb3dlckNvZGVzID0gW10gLy8gbmV3IEFycmF5KHN0ckxlbikgICAgc3BhcnNlIGFycmF5IGlzIHRvbyBzbG93XHJcbiAgICB2YXIgYml0ZmxhZ3MgPSAwXHJcbiAgICB2YXIgY29udGFpbnNTcGFjZSA9IGZhbHNlIC8vIHNwYWNlIGlzbid0IHN0b3JlZCBpbiBiaXRmbGFncyBiZWNhdXNlIG9mIGhvdyBzZWFyY2hpbmcgd2l0aCBhIHNwYWNlIHdvcmtzXHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHN0ckxlbjsgKytpKSB7XHJcbiAgICAgIHZhciBsb3dlckNvZGUgPSBsb3dlckNvZGVzW2ldID0gbG93ZXIuY2hhckNvZGVBdChpKVxyXG5cclxuICAgICAgaWYobG93ZXJDb2RlID09PSAzMikge1xyXG4gICAgICAgIGNvbnRhaW5zU3BhY2UgPSB0cnVlXHJcbiAgICAgICAgY29udGludWUgLy8gaXQncyBpbXBvcnRhbnQgdGhhdCB3ZSBkb24ndCBzZXQgYW55IGJpdGZsYWdzIGZvciBzcGFjZVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgYml0ID0gbG93ZXJDb2RlPj05NyYmbG93ZXJDb2RlPD0xMjIgPyBsb3dlckNvZGUtOTcgLy8gYWxwaGFiZXRcclxuICAgICAgICAgICAgICA6IGxvd2VyQ29kZT49NDgmJmxvd2VyQ29kZTw9NTcgID8gMjYgICAgICAgICAgIC8vIG51bWJlcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDMgYml0cyBhdmFpbGFibGVcclxuICAgICAgICAgICAgICA6IGxvd2VyQ29kZTw9MTI3ICAgICAgICAgICAgICAgID8gMzAgICAgICAgICAgIC8vIG90aGVyIGFzY2lpXHJcbiAgICAgICAgICAgICAgOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDMxICAgICAgICAgICAvLyBvdGhlciB1dGY4XHJcbiAgICAgIGJpdGZsYWdzIHw9IDE8PGJpdFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7bG93ZXJDb2Rlczpsb3dlckNvZGVzLCBiaXRmbGFnczpiaXRmbGFncywgY29udGFpbnNTcGFjZTpjb250YWluc1NwYWNlLCBfbG93ZXI6bG93ZXJ9XHJcbiAgfVxyXG4gIHZhciBwcmVwYXJlQmVnaW5uaW5nSW5kZXhlcyA9ICh0YXJnZXQpID0+IHtcclxuICAgIHZhciB0YXJnZXRMZW4gPSB0YXJnZXQubGVuZ3RoXHJcbiAgICB2YXIgYmVnaW5uaW5nSW5kZXhlcyA9IFtdOyB2YXIgYmVnaW5uaW5nSW5kZXhlc0xlbiA9IDBcclxuICAgIHZhciB3YXNVcHBlciA9IGZhbHNlXHJcbiAgICB2YXIgd2FzQWxwaGFudW0gPSBmYWxzZVxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldExlbjsgKytpKSB7XHJcbiAgICAgIHZhciB0YXJnZXRDb2RlID0gdGFyZ2V0LmNoYXJDb2RlQXQoaSlcclxuICAgICAgdmFyIGlzVXBwZXIgPSB0YXJnZXRDb2RlPj02NSYmdGFyZ2V0Q29kZTw9OTBcclxuICAgICAgdmFyIGlzQWxwaGFudW0gPSBpc1VwcGVyIHx8IHRhcmdldENvZGU+PTk3JiZ0YXJnZXRDb2RlPD0xMjIgfHwgdGFyZ2V0Q29kZT49NDgmJnRhcmdldENvZGU8PTU3XHJcbiAgICAgIHZhciBpc0JlZ2lubmluZyA9IGlzVXBwZXIgJiYgIXdhc1VwcGVyIHx8ICF3YXNBbHBoYW51bSB8fCAhaXNBbHBoYW51bVxyXG4gICAgICB3YXNVcHBlciA9IGlzVXBwZXJcclxuICAgICAgd2FzQWxwaGFudW0gPSBpc0FscGhhbnVtXHJcbiAgICAgIGlmKGlzQmVnaW5uaW5nKSBiZWdpbm5pbmdJbmRleGVzW2JlZ2lubmluZ0luZGV4ZXNMZW4rK10gPSBpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gYmVnaW5uaW5nSW5kZXhlc1xyXG4gIH1cclxuICB2YXIgcHJlcGFyZU5leHRCZWdpbm5pbmdJbmRleGVzID0gKHRhcmdldCkgPT4ge1xyXG4gICAgdGFyZ2V0ID0gcmVtb3ZlX2FjY2VudHModGFyZ2V0KVxyXG4gICAgdmFyIHRhcmdldExlbiA9IHRhcmdldC5sZW5ndGhcclxuICAgIHZhciBiZWdpbm5pbmdJbmRleGVzID0gcHJlcGFyZUJlZ2lubmluZ0luZGV4ZXModGFyZ2V0KVxyXG4gICAgdmFyIG5leHRCZWdpbm5pbmdJbmRleGVzID0gW10gLy8gbmV3IEFycmF5KHRhcmdldExlbikgICAgIHNwYXJzZSBhcnJheSBpcyB0b28gc2xvd1xyXG4gICAgdmFyIGxhc3RJc0JlZ2lubmluZyA9IGJlZ2lubmluZ0luZGV4ZXNbMF1cclxuICAgIHZhciBsYXN0SXNCZWdpbm5pbmdJID0gMFxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRhcmdldExlbjsgKytpKSB7XHJcbiAgICAgIGlmKGxhc3RJc0JlZ2lubmluZyA+IGkpIHtcclxuICAgICAgICBuZXh0QmVnaW5uaW5nSW5kZXhlc1tpXSA9IGxhc3RJc0JlZ2lubmluZ1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxhc3RJc0JlZ2lubmluZyA9IGJlZ2lubmluZ0luZGV4ZXNbKytsYXN0SXNCZWdpbm5pbmdJXVxyXG4gICAgICAgIG5leHRCZWdpbm5pbmdJbmRleGVzW2ldID0gbGFzdElzQmVnaW5uaW5nPT09dW5kZWZpbmVkID8gdGFyZ2V0TGVuIDogbGFzdElzQmVnaW5uaW5nXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBuZXh0QmVnaW5uaW5nSW5kZXhlc1xyXG4gIH1cclxuXHJcbiAgdmFyIHByZXBhcmVkQ2FjaGUgICAgICAgPSBuZXcgTWFwKClcclxuICB2YXIgcHJlcGFyZWRTZWFyY2hDYWNoZSA9IG5ldyBNYXAoKVxyXG5cclxuICAvLyB0aGUgdGhlb3J5IGJlaGluZCB0aGVzZSBiZWluZyBnbG9iYWxzIGlzIHRvIHJlZHVjZSBnYXJiYWdlIGNvbGxlY3Rpb24gYnkgbm90IG1ha2luZyBuZXcgYXJyYXlzXHJcbiAgdmFyIG1hdGNoZXNTaW1wbGUgPSBbXTsgdmFyIG1hdGNoZXNTdHJpY3QgPSBbXVxyXG4gIHZhciBuZXh0QmVnaW5uaW5nSW5kZXhlc0NoYW5nZXMgPSBbXSAvLyBhbGxvd3Mgc3RyYXcgYmVycnkgdG8gbWF0Y2ggc3RyYXdiZXJyeSB3ZWxsLCBieSBtb2RpZnlpbmcgdGhlIGVuZCBvZiBhIHN1YnN0cmluZyB0byBiZSBjb25zaWRlcmVkIGEgYmVnaW5uaW5nIGluZGV4IGZvciB0aGUgcmVzdCBvZiB0aGUgc2VhcmNoXHJcbiAgdmFyIGtleXNTcGFjZXNCZXN0U2NvcmVzID0gW107IHZhciBhbGxvd1BhcnRpYWxNYXRjaFNjb3JlcyA9IFtdXHJcbiAgdmFyIHRtcFRhcmdldHMgPSBbXTsgdmFyIHRtcFJlc3VsdHMgPSBbXVxyXG5cclxuICAvLyBwcm9wID0gJ2tleScgICAgICAgICAgICAgICAgICAyLjVtcyBvcHRpbWl6ZWQgZm9yIHRoaXMgY2FzZSwgc2VlbXMgdG8gYmUgYWJvdXQgYXMgZmFzdCBhcyBkaXJlY3Qgb2JqW3Byb3BdXHJcbiAgLy8gcHJvcCA9ICdrZXkxLmtleTInICAgICAgICAgICAgMTBtc1xyXG4gIC8vIHByb3AgPSBbJ2tleTEnLCAna2V5MiddICAgICAgIDI3bXNcclxuICAvLyBwcm9wID0gb2JqID0+IG9iai50YWdzLmpvaW4oKSA/P21zXHJcbiAgdmFyIGdldFZhbHVlID0gKG9iaiwgcHJvcCkgPT4ge1xyXG4gICAgdmFyIHRtcCA9IG9ialtwcm9wXTsgaWYodG1wICE9PSB1bmRlZmluZWQpIHJldHVybiB0bXBcclxuICAgIGlmKHR5cGVvZiBwcm9wID09PSAnZnVuY3Rpb24nKSByZXR1cm4gcHJvcChvYmopIC8vIHRoaXMgc2hvdWxkIHJ1biBmaXJzdC4gYnV0IHRoYXQgbWFrZXMgc3RyaW5nIHByb3BzIHNsb3dlclxyXG4gICAgdmFyIHNlZ3MgPSBwcm9wXHJcbiAgICBpZighQXJyYXkuaXNBcnJheShwcm9wKSkgc2VncyA9IHByb3Auc3BsaXQoJy4nKVxyXG4gICAgdmFyIGxlbiA9IHNlZ3MubGVuZ3RoXHJcbiAgICB2YXIgaSA9IC0xXHJcbiAgICB3aGlsZSAob2JqICYmICgrK2kgPCBsZW4pKSBvYmogPSBvYmpbc2Vnc1tpXV1cclxuICAgIHJldHVybiBvYmpcclxuICB9XHJcblxyXG4gIHZhciBpc1ByZXBhcmVkID0gKHgpID0+IHsgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgeC5fYml0ZmxhZ3MgPT09ICdudW1iZXInIH1cclxuICB2YXIgSU5GSU5JVFkgPSBJbmZpbml0eTsgdmFyIE5FR0FUSVZFX0lORklOSVRZID0gLUlORklOSVRZXHJcbiAgdmFyIG5vUmVzdWx0cyA9IFtdOyBub1Jlc3VsdHMudG90YWwgPSAwXHJcbiAgdmFyIE5VTEwgPSBudWxsXHJcblxyXG4gIHZhciBub1RhcmdldCA9IHByZXBhcmUoJycpXHJcblxyXG4gIC8vIEhhY2tlZCB2ZXJzaW9uIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9sZW1pcmUvRmFzdFByaW9yaXR5UXVldWUuanNcclxuICB2YXIgZmFzdHByaW9yaXR5cXVldWU9cj0+e3ZhciBlPVtdLG89MCxhPXt9LHY9cj0+e2Zvcih2YXIgYT0wLHY9ZVthXSxjPTE7YzxvOyl7dmFyIHM9YysxO2E9YyxzPG8mJmVbc10uX3Njb3JlPGVbY10uX3Njb3JlJiYoYT1zKSxlW2EtMT4+MV09ZVthXSxjPTErKGE8PDEpfWZvcih2YXIgZj1hLTE+PjE7YT4wJiZ2Ll9zY29yZTxlW2ZdLl9zY29yZTtmPShhPWYpLTE+PjEpZVthXT1lW2ZdO2VbYV09dn07cmV0dXJuIGEuYWRkPShyPT57dmFyIGE9bztlW28rK109cjtmb3IodmFyIHY9YS0xPj4xO2E+MCYmci5fc2NvcmU8ZVt2XS5fc2NvcmU7dj0oYT12KS0xPj4xKWVbYV09ZVt2XTtlW2FdPXJ9KSxhLnBvbGw9KHI9PntpZigwIT09byl7dmFyIGE9ZVswXTtyZXR1cm4gZVswXT1lWy0tb10sdigpLGF9fSksYS5wZWVrPShyPT57aWYoMCE9PW8pcmV0dXJuIGVbMF19KSxhLnJlcGxhY2VUb3A9KHI9PntlWzBdPXIsdigpfSksYX1cclxuICB2YXIgcSA9IGZhc3Rwcmlvcml0eXF1ZXVlKCkgLy8gcmV1c2UgdGhpc1xyXG5cclxuICAvLyBmdXp6eXNvcnQgaXMgd3JpdHRlbiB0aGlzIHdheSBmb3IgbWluaWZpY2F0aW9uLiBhbGwgbmFtZXMgYXJlIG1hbmdlbGVkIHVubGVzcyBxdW90ZWRcclxuICByZXR1cm4geydzaW5nbGUnOnNpbmdsZSwgJ2dvJzpnbywgJ3ByZXBhcmUnOnByZXBhcmUsICdjbGVhbnVwJzpjbGVhbnVwfVxyXG59KSAvLyBVTURcclxuIiwgIi8qKiBSZXN1bHQgYWxsb3dzIGVhc2llciBoYW5kbGluZyBvZiByZXR1cm5pbmcgZWl0aGVyIGFuIGVycm9yIG9yIGEgdmFsdWUgZnJvbSBhXG4gKiBmdW5jdGlvbi4gKi9cbmV4cG9ydCB0eXBlIFJlc3VsdDxUPiA9IHsgb2s6IHRydWU7IHZhbHVlOiBUIH0gfCB7IG9rOiBmYWxzZTsgZXJyb3I6IEVycm9yIH07XG5cbmV4cG9ydCBmdW5jdGlvbiBvazxUPih2YWx1ZTogVCk6IFJlc3VsdDxUPiB7XG4gIHJldHVybiB7IG9rOiB0cnVlLCB2YWx1ZTogdmFsdWUgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVycm9yPFQ+KHZhbHVlOiBzdHJpbmcgfCBFcnJvcik6IFJlc3VsdDxUPiB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBuZXcgRXJyb3IodmFsdWUpIH07XG4gIH1cbiAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogdmFsdWUgfTtcbn1cbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcblxuLy8gT3BlcmF0aW9ucyBvbiBQbGFucy4gTm90ZSB0aGV5IGFyZSByZXZlcnNpYmxlLCBzbyB3ZSBjYW4gaGF2ZSBhbiAndW5kbycgbGlzdC5cblxuLy8gQWxzbywgc29tZSBvcGVyYXRpb25zIG1pZ2h0IGhhdmUgJ3BhcnRpYWxzJywgaS5lLiByZXR1cm4gYSBsaXN0IG9mIHZhbGlkXG4vLyBvcHRpb25zIHRoYXQgY2FuIGJlIHBhc3NlZCB0byB0aGUgb3BlcmF0aW9uLiBGb3IgZXhhbXBsZSwgYWRkaW5nIGFcbi8vIHByZWRlY2Vzc29yIGNvdWxkIGxpc3QgYWxsIHRoZSBUYXNrcyB0aGF0IHdvdWxkIG5vdCBmb3JtIGEgbG9vcCwgaS5lLiBleGNsdWRlXG4vLyBhbGwgZGVzY2VuZGVudHMsIGFuZCB0aGUgVGFzayBpdHNlbGYsIGZyb20gdGhlIGxpc3Qgb2Ygb3B0aW9ucy5cbi8vXG4vLyAqIENoYW5nZSBzdHJpbmcgdmFsdWUgaW4gYSBUYXNrLlxuLy8gKiBDaGFuZ2UgZHVyYXRpb24gdmFsdWUgaW4gYSBUYXNrLlxuLy8gKiBJbnNlcnQgbmV3IGVtcHR5IFRhc2sgYWZ0ZXIgSW5kZXguXG4vLyAqIFNwbGl0IGEgVGFzay4gKFByZWRlY2Vzc29yIHRha2VzIGFsbCBpbmNvbWluZyBlZGdlcywgc291cmNlIHRhc2tzIGFsbCBvdXRnb2luZyBlZGdlcykuXG4vL1xuLy8gKiBEdXBsaWNhdGUgYSBUYXNrIChhbGwgZWRnZXMgYXJlIGR1cGxpY2F0ZWQgZnJvbSB0aGUgc291cmNlIFRhc2spLlxuLy8gKiBEZWxldGUgcHJlZGVjZXNzb3IgdG8gYSBUYXNrLlxuLy8gKiBEZWxldGUgc3VjY2Vzc29yIHRvIGEgVGFzay5cbi8vICogRGVsZXRlIGEgVGFzay5cblxuLy8gTmVlZCBVbmRvL1JlZG8gU3RhY2tzLlxuLy8gVGhlc2UgcmVjb3JkIHRoZSBzdWItb3BzIGZvciBlYWNoIGxhcmdlIG9wLiBFLmcuIGFuIGluc2VydCB0YXNrIG9wIGlzIG1hZGVcbi8vIG9mIHRocmVlIHN1Yi1vcHM6XG4vLyAgICAxLiBpbnNlcnQgdGFzayBpbnRvIFZlcnRpY2VzIGFuZCByZW51bWJlciBFZGdlc1xuLy8gICAgMi4gQWRkIGVkZ2UgZnJvbSBTdGFydCB0byBOZXcgVGFza1xuLy8gICAgMy4gQWRkIGVkZ2UgZnJvbSBOZXcgVGFzayB0byBGaW5pc2hcbi8vXG4vLyBFYWNoIHN1Yi1vcDpcbi8vICAgIDEuIFJlY29yZHMgYWxsIHRoZSBpbmZvIGl0IG5lZWRzIHRvIHdvcmsuXG4vLyAgICAyLiBDYW4gYmUgXCJhcHBsaWVkXCIgdG8gYSBQbGFuLlxuLy8gICAgMy4gQ2FuIGdlbmVyYXRlIGl0cyBpbnZlcnNlIHN1Yi1vcC5cblxuLy8gVGhlIHJlc3VsdHMgZnJvbSBhcHBseWluZyBhIFN1Yk9wLiBUaGlzIGlzIHRoZSBvbmx5IHdheSB0byBnZXQgdGhlIGludmVyc2Ugb2Zcbi8vIGEgU3ViT3Agc2luY2UgdGhlIFN1Yk9wIGludmVyc2UgbWlnaHQgZGVwZW5kIG9uIHRoZSBzdGF0ZSBvZiB0aGUgUGxhbiBhdCB0aGVcbi8vIHRpbWUgdGhlIFN1Yk9wIHdhcyBhcHBsaWVkLlxuZXhwb3J0IGludGVyZmFjZSBTdWJPcFJlc3VsdCB7XG4gIHBsYW46IFBsYW47XG4gIGludmVyc2U6IFN1Yk9wO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN1Yk9wIHtcbiAgLy8gSWYgdGhlIGFwcGx5IHJldHVybnMgYW4gZXJyb3IgaXQgaXMgZ3VhcmFudGVlZCBub3QgdG8gaGF2ZSBtb2RpZmllZCB0aGVcbiAgLy8gUGxhbi5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0Pjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcFJlc3VsdCB7XG4gIHBsYW46IFBsYW47XG4gIGludmVyc2U6IE9wO1xufVxuXG4vLyBPcCBhcmUgb3BlcmF0aW9ucyBhcmUgYXBwbGllZCB0byBtYWtlIGNoYW5nZXMgdG8gYSBQbGFuLlxuZXhwb3J0IGNsYXNzIE9wIHtcbiAgc3ViT3BzOiBTdWJPcFtdID0gW107XG5cbiAgY29uc3RydWN0b3Ioc3ViT3BzOiBTdWJPcFtdKSB7XG4gICAgdGhpcy5zdWJPcHMgPSBzdWJPcHM7XG4gIH1cblxuICAvLyBSZXZlcnRzIGFsbCBTdWJPcHMgdXAgdG8gdGhlIGdpdmVuIGluZGV4LlxuICBhcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4oXG4gICAgcGxhbjogUGxhbixcbiAgICBpbnZlcnNlU3ViT3BzOiBTdWJPcFtdXG4gICk6IFJlc3VsdDxQbGFuPiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnZlcnNlU3ViT3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlID0gaW52ZXJzZVN1Yk9wc1tpXS5hcHBseVRvKHBsYW4pO1xuICAgICAgaWYgKCFlLm9rKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgICAgcGxhbiA9IGUudmFsdWUucGxhbjtcbiAgICB9XG5cbiAgICByZXR1cm4gb2socGxhbik7XG4gIH1cblxuICAvLyBBcHBsaWVzIHRoZSBPcCB0byBhIFBsYW4uXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGludmVyc2VTdWJPcHM6IFN1Yk9wW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc3ViT3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBlID0gdGhpcy5zdWJPcHNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICAgIGlmICghZS5vaykge1xuICAgICAgICAvLyBSZXZlcnQgYWxsIHRoZSBTdWJPcHMgYXBwbGllZCB1cCB0byB0aGlzIHBvaW50IHRvIGdldCB0aGUgUGxhbiBiYWNrIGluIGFcbiAgICAgICAgLy8gZ29vZCBwbGFjZS5cbiAgICAgICAgY29uc3QgcmV2ZXJ0RXJyID0gdGhpcy5hcHBseUFsbEludmVyc2VTdWJPcHNUb1BsYW4ocGxhbiwgaW52ZXJzZVN1Yk9wcyk7XG4gICAgICAgIGlmICghcmV2ZXJ0RXJyLm9rKSB7XG4gICAgICAgICAgcmV0dXJuIHJldmVydEVycjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICAgIHBsYW4gPSBlLnZhbHVlLnBsYW47XG4gICAgICBpbnZlcnNlU3ViT3BzLnVuc2hpZnQoZS52YWx1ZS5pbnZlcnNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IG5ldyBPcChpbnZlcnNlU3ViT3BzKSxcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBBbGxPcHNSZXN1bHQgPSB7XG4gIG9wczogT3BbXTtcbiAgcGxhbjogUGxhbjtcbn07XG5cbmNvbnN0IGFwcGx5QWxsSW52ZXJzZU9wc1RvUGxhbiA9IChpbnZlcnNlczogT3BbXSwgcGxhbjogUGxhbik6IFJlc3VsdDxQbGFuPiA9PiB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaW52ZXJzZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByZXMgPSBpbnZlcnNlc1tpXS5hcHBseVRvKHBsYW4pO1xuICAgIGlmICghcmVzLm9rKSB7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBwbGFuID0gcmVzLnZhbHVlLnBsYW47XG4gIH1cblxuICByZXR1cm4gb2socGxhbik7XG59O1xuXG4vLyBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgYXBwbHlpbmcgbXVsdGlwbGUgT3BzIHRvIGEgcGxhbiwgdXNlZCBtb3N0bHkgZm9yXG4vLyB0ZXN0aW5nLlxuZXhwb3J0IGNvbnN0IGFwcGx5QWxsT3BzVG9QbGFuID0gKFxuICBvcHM6IE9wW10sXG4gIHBsYW46IFBsYW5cbik6IFJlc3VsdDxBbGxPcHNSZXN1bHQ+ID0+IHtcbiAgY29uc3QgaW52ZXJzZXM6IE9wW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByZXMgPSBvcHNbaV0uYXBwbHlUbyhwbGFuKTtcbiAgICBpZiAoIXJlcy5vaykge1xuICAgICAgY29uc3QgaW52ZXJzZVJlcyA9IGFwcGx5QWxsSW52ZXJzZU9wc1RvUGxhbihpbnZlcnNlcywgcGxhbik7XG4gICAgICBpZiAoIWludmVyc2VSZXMub2spIHtcbiAgICAgICAgLy8gVE9ETyBDYW4gd2Ugd3JhcCB0aGUgRXJyb3IgaW4gYW5vdGhlciBlcnJvciB0byBtYWtlIGl0IGNsZWFyIHRoaXNcbiAgICAgICAgLy8gZXJyb3IgaGFwcGVuZWQgd2hlbiB0cnlpbmcgdG8gY2xlYW4gdXAgZnJvbSB0aGUgcHJldmlvdXMgRXJyb3Igd2hlblxuICAgICAgICAvLyB0aGUgYXBwbHkoKSBmYWlsZWQuXG4gICAgICAgIHJldHVybiBpbnZlcnNlUmVzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgaW52ZXJzZXMudW5zaGlmdChyZXMudmFsdWUuaW52ZXJzZSk7XG4gICAgcGxhbiA9IHJlcy52YWx1ZS5wbGFuO1xuICB9XG5cbiAgcmV0dXJuIG9rKHtcbiAgICBvcHM6IGludmVyc2VzLFxuICAgIHBsYW46IHBsYW4sXG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGFwcGx5QWxsT3BzVG9QbGFuQW5kVGhlbkludmVyc2UgPSAoXG4gIG9wczogT3BbXSxcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PEFsbE9wc1Jlc3VsdD4gPT4ge1xuICBjb25zdCByZXMgPSBhcHBseUFsbE9wc1RvUGxhbihvcHMsIHBsYW4pO1xuICBpZiAoIXJlcy5vaykge1xuICAgIHJldHVybiByZXM7XG4gIH1cbiAgcmV0dXJuIGFwcGx5QWxsT3BzVG9QbGFuKHJlcy52YWx1ZS5vcHMsIHJlcy52YWx1ZS5wbGFuKTtcbn07XG4vLyBOb09wIGlzIGEgbm8tb3AuXG5leHBvcnQgZnVuY3Rpb24gTm9PcCgpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW10pO1xufVxuIiwgIi8vIENoYW5nZU1ldHJpY1ZhbHVlXG5cbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IE1ldHJpY0RlZmluaXRpb24gfSBmcm9tIFwiLi4vbWV0cmljcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUmVzdWx0LCBlcnJvciwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBPcCwgU3ViT3AsIFN1Yk9wUmVzdWx0IH0gZnJvbSBcIi4vb3BzLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBBZGRNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiBtZXRyaWMga2V5LlxuICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbiA9IG1ldHJpY0RlZmluaXRpb247XG4gICAgdGhpcy50YXNrTWV0cmljVmFsdWVzID0gdGFza01ldHJpY1ZhbHVlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmIChwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uYW1lfSBhbHJlYWR5IGV4aXN0cyBhcyBhIE1ldHJpY2ApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUsIHRoaXMubWV0cmljRGVmaW5pdGlvbik7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGFkZCB0aGlzIG1ldHJpYyBhbmQgc2V0IGl0IHRvIHRoZSBkZWZhdWx0LFxuICAgIC8vIHVubGVzcyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrTWV0cmljVmFsdWVzLCBpbiB3aGljaCBjYXNlIHdlIHdpbGxcbiAgICAvLyB1c2UgdGhhdCB2YWx1ZSwgaS5lLiB0aGlzIEFkZE1ldHJpY1N1Yk9wIGlzIGFjdHVhbGx5IGEgcmV2ZXJ0IG9mIGFcbiAgICAvLyBEZWxldGVNZXRyaWNTdWJPcC5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIHRhc2suc2V0TWV0cmljKFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgIHRoaXMudGFza01ldHJpY1ZhbHVlcy5nZXQoaW5kZXgpIHx8IHRoaXMubWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IERlbGV0ZU1ldHJpY1N1Yk9wKHRoaXMubmFtZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZU1ldHJpY1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcblxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYFRoZSBtZXRyaWMgd2l0aCBuYW1lICR7dGhpcy5uYW1lfSBkb2VzIG5vdCBleGlzdCBhbmQgY2FuJ3QgYmUgZGVsZXRlZC5gXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFRoZSBzdGF0aWMgTWV0cmljICR7dGhpcy5uYW1lfSBjYW4ndCBiZSBkZWxldGVkLmApO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBmcm9tIHJlc291cmNlIGRlZmluaXRpb25zLlxuICAgIHBsYW4uZGVsZXRlTWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUpO1xuXG4gICAgY29uc3QgdGFza0luZGV4VG9EZWxldGVkTWV0cmljVmFsdWU6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBOb3cgbG9vayBhdCBhbGwgVGFza3MgYW5kIHJlbW92ZSBgdGhpcy5uYW1lYCBmcm9tIHRoZSBtZXRyaWMgd2hpbGUgYWxzb1xuICAgIC8vIGJ1aWxkaW5nIHVwIHRoZSBpbmZvIG5lZWRlZCBmb3IgYSByZXZlcnQuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMubmFtZSk7XG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZS5zZXQoaW5kZXgsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHRhc2suZGVsZXRlTWV0cmljKHRoaXMubmFtZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soe1xuICAgICAgcGxhbjogcGxhbixcbiAgICAgIGludmVyc2U6IHRoaXMuaW52ZXJzZShtZXRyaWNEZWZpbml0aW9uLCB0YXNrSW5kZXhUb0RlbGV0ZWRNZXRyaWNWYWx1ZSksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoXG4gICAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvbixcbiAgICBtZXRyaWNWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VOYW1lOiBNYXA8bnVtYmVyLCBudW1iZXI+XG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZE1ldHJpY1N1Yk9wKFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgbWV0cmljRGVmaW5pdGlvbixcbiAgICAgIG1ldHJpY1ZhbHVlc0ZvckRlbGV0ZWRSZXNvdXJjZU5hbWVcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgb2xkTmFtZTogc3RyaW5nO1xuICBuZXdOYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob2xkTmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLm9sZE5hbWUgPSBvbGROYW1lO1xuICAgIHRoaXMubmV3TmFtZSA9IG5ld05hbWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBpZiAocGxhbi5nZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmV3TmFtZSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmV3TmFtZX0gYWxyZWFkeSBleGlzdHMgYXMgYSBtZXRyaWMuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0cmljRGVmaW5pdGlvbiA9IHBsYW4uZ2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm9sZE5hbWUpO1xuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm9sZE5hbWV9IGRvZXMgbm90IGV4aXN0IGFzIGEgTWV0cmljYCk7XG4gICAgfVxuICAgIGlmIChtZXRyaWNEZWZpbml0aW9uLmlzU3RhdGljKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYFN0YXRpYyBtZXRyaWMgJHt0aGlzLm9sZE5hbWV9IGNhbid0IGJlIHJlbmFtZWQuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRNZXRyaWNEZWZpbml0aW9uKHRoaXMubmV3TmFtZSwgbWV0cmljRGVmaW5pdGlvbik7XG4gICAgcGxhbi5kZWxldGVNZXRyaWNEZWZpbml0aW9uKHRoaXMub2xkTmFtZSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIHJlbmFtZSB0aGlzIG1ldHJpYy5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGFzay5nZXRNZXRyaWModGhpcy5vbGROYW1lKSB8fCBtZXRyaWNEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgICB0YXNrLnNldE1ldHJpYyh0aGlzLm5ld05hbWUsIHZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlTWV0cmljKHRoaXMub2xkTmFtZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVuYW1lTWV0cmljU3ViT3AodGhpcy5uZXdOYW1lLCB0aGlzLm9sZE5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVNZXRyaWNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgbmFtZTogc3RyaW5nO1xuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiBtZXRyaWMga2V5LlxuICB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCkgLy8gU2hvdWxkIG9ubHkgYmUgc3VwcGxpZWQgYnkgaW52ZXJzZSBhY3Rpb25zLlxuICApIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbiA9IG1ldHJpY0RlZmluaXRpb247XG4gICAgdGhpcy50YXNrTWV0cmljVmFsdWVzID0gdGFza01ldHJpY1ZhbHVlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IG9sZE1ldHJpY0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcbiAgICBpZiAob2xkTWV0cmljRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5uYW1lfSBkb2VzIG5vdCBleGlzdCBhcyBhIE1ldHJpY2ApO1xuICAgIH1cbiAgICBpZiAob2xkTWV0cmljRGVmaW5pdGlvbi5pc1N0YXRpYykge1xuICAgICAgcmV0dXJuIGVycm9yKGBTdGF0aWMgbWV0cmljICR7dGhpcy5uYW1lfSBjYW4ndCBiZSB1cGRhdGVkLmApO1xuICAgIH1cblxuICAgIHBsYW4uc2V0TWV0cmljRGVmaW5pdGlvbih0aGlzLm5hbWUsIHRoaXMubWV0cmljRGVmaW5pdGlvbik7XG5cbiAgICBjb25zdCB0YXNrTWV0cmljVmFsdWVzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgdXBkYXRlIHRoZSBtZXRyaWMgdmFsdWVzIHRvIHJlZmxlY3QgdGhlIG5ld1xuICAgIC8vIG1ldHJpYyBkZWZpbml0aW9uLCB1bmxlc3MgdGhlcmUgaXMgbWF0Y2hpbmcgZW50cnkgaW4gdGFza01ldHJpY1ZhbHVlcywgaW5cbiAgICAvLyB3aGljaCBjYXNlIHdlIHdpbGwgdXNlIHRoYXQgdmFsdWUsIGkuZS4gdGhpcyBVcGRhdGVNZXRyaWNTdWJPcCBpc1xuICAgIC8vIGFjdHVhbGx5IGEgcmV2ZXJ0IG9mIGFub3RoZXIgVXBkYXRlTWV0cmljU3ViT3AuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IHRhc2suZ2V0TWV0cmljKHRoaXMubmFtZSkhO1xuXG4gICAgICBsZXQgbmV3VmFsdWU6IG51bWJlcjtcbiAgICAgIGlmICh0aGlzLnRhc2tNZXRyaWNWYWx1ZXMuaGFzKGluZGV4KSkge1xuICAgICAgICAvLyB0YXNrTWV0cmljVmFsdWVzIGhhcyBhIHZhbHVlIHRoZW4gdXNlIHRoYXQsIGFzIHRoaXMgaXMgYW4gaW52ZXJzZVxuICAgICAgICAvLyBvcGVyYXRpb24uXG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy50YXNrTWV0cmljVmFsdWVzLmdldChpbmRleCkhO1xuICAgICAgfSBlbHNlIGlmIChvbGRWYWx1ZSA9PT0gb2xkTWV0cmljRGVmaW5pdGlvbi5kZWZhdWx0KSB7XG4gICAgICAgIC8vIElmIHRoZSBvbGRWYWx1ZSBpcyB0aGUgZGVmYXVsdCwgY2hhbmdlIGl0IHRvIHRoZSBuZXcgZGVmYXVsdC5cbiAgICAgICAgbmV3VmFsdWUgPSB0aGlzLm1ldHJpY0RlZmluaXRpb24uZGVmYXVsdDtcbiAgICAgICAgdGFza01ldHJpY1ZhbHVlcy5zZXQoaW5kZXgsIG9sZFZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENsYW1wLlxuICAgICAgICBuZXdWYWx1ZSA9IHRoaXMubWV0cmljRGVmaW5pdGlvbi5yYW5nZS5jbGFtcChvbGRWYWx1ZSk7XG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy5tZXRyaWNEZWZpbml0aW9uLnByZWNpc2lvbi5yb3VuZChuZXdWYWx1ZSk7XG4gICAgICAgIHRhc2tNZXRyaWNWYWx1ZXMuc2V0KGluZGV4LCBvbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgICB0YXNrLnNldE1ldHJpYyh0aGlzLm5hbWUsIG5ld1ZhbHVlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZE1ldHJpY0RlZmluaXRpb24sIHRhc2tNZXRyaWNWYWx1ZXMpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZShcbiAgICBvbGRNZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uLFxuICAgIHRhc2tNZXRyaWNWYWx1ZXM6IE1hcDxudW1iZXIsIG51bWJlcj5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgVXBkYXRlTWV0cmljU3ViT3AoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICBvbGRNZXRyaWNEZWZpbml0aW9uLFxuICAgICAgdGFza01ldHJpY1ZhbHVlc1xuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldE1ldHJpY1ZhbHVlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmFsdWU6IG51bWJlcjtcbiAgdGFza0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyLCB0YXNrSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgbWV0cmljc0RlZmluaXRpb24gPSBwbGFuLmdldE1ldHJpY0RlZmluaXRpb24odGhpcy5uYW1lKTtcbiAgICBpZiAobWV0cmljc0RlZmluaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmFtZX0gZG9lcyBub3QgZXhpc3QgYXMgYSBNZXRyaWNgKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YXNrID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0aGlzLnRhc2tJbmRleF07XG4gICAgY29uc3Qgb2xkVmFsdWUgPSB0YXNrLmdldE1ldHJpYyh0aGlzLm5hbWUpIHx8IG1ldHJpY3NEZWZpbml0aW9uLmRlZmF1bHQ7XG4gICAgdGFzay5zZXRNZXRyaWMoXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICBtZXRyaWNzRGVmaW5pdGlvbi5wcmVjaXNpb24ucm91bmQoXG4gICAgICAgIG1ldHJpY3NEZWZpbml0aW9uLnJhbmdlLmNsYW1wKHRoaXMudmFsdWUpXG4gICAgICApXG4gICAgKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZShvbGRWYWx1ZSkgfSk7XG4gIH1cblxuICBpbnZlcnNlKHZhbHVlOiBudW1iZXIpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBTZXRNZXRyaWNWYWx1ZVN1Yk9wKHRoaXMubmFtZSwgdmFsdWUsIHRoaXMudGFza0luZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkTWV0cmljT3AoXG4gIG5hbWU6IHN0cmluZyxcbiAgbWV0cmljRGVmaW5pdGlvbjogTWV0cmljRGVmaW5pdGlvblxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgQWRkTWV0cmljU3ViT3AobmFtZSwgbWV0cmljRGVmaW5pdGlvbildKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZU1ldHJpY09wKG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IERlbGV0ZU1ldHJpY1N1Yk9wKG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5hbWVNZXRyaWNPcChvbGROYW1lOiBzdHJpbmcsIG5ld05hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJlbmFtZU1ldHJpY1N1Yk9wKG9sZE5hbWUsIG5ld05hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBVcGRhdGVNZXRyaWNPcChcbiAgbmFtZTogc3RyaW5nLFxuICBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uXG4pOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBVcGRhdGVNZXRyaWNTdWJPcChuYW1lLCBtZXRyaWNEZWZpbml0aW9uKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0TWV0cmljVmFsdWVPcChcbiAgbmFtZTogc3RyaW5nLFxuICB2YWx1ZTogbnVtYmVyLFxuICB0YXNrSW5kZXg6IG51bWJlclxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0TWV0cmljVmFsdWVTdWJPcChuYW1lLCB2YWx1ZSwgdGFza0luZGV4KV0pO1xufVxuIiwgIi8vIEVhY2ggUmVzb3Vyc2UgaGFzIGEga2V5LCB3aGljaCBpcyB0aGUgbmFtZSwgYW5kIGEgbGlzdCBvZiBhY2NlcHRhYmxlIHZhbHVlcy5cbi8vIFRoZSBsaXN0IG9mIHZhbHVlcyBjYW4gbmV2ZXIgYmUgZW1wdHksIGFuZCB0aGUgZmlyc3QgdmFsdWUgaW4gYHZhbHVlc2AgaXMgdGhlXG4vLyBkZWZhdWx0IHZhbHVlIGZvciBhIFJlc291cmNlLlxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9SRVNPVVJDRV9WQUxVRSA9IFwiXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZCB7XG4gIHZhbHVlczogc3RyaW5nW107XG59XG5cbmV4cG9ydCBjbGFzcyBSZXNvdXJjZURlZmluaXRpb24ge1xuICB2YWx1ZXM6IHN0cmluZ1tdO1xuICBpc1N0YXRpYzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICB2YWx1ZXM6IHN0cmluZ1tdID0gW0RFRkFVTFRfUkVTT1VSQ0VfVkFMVUVdLFxuICAgIGlzU3RhdGljOiBib29sZWFuID0gZmFsc2VcbiAgKSB7XG4gICAgdGhpcy52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgdGhpcy5pc1N0YXRpYyA9IGlzU3RhdGljO1xuICB9XG5cbiAgdG9KU09OKCk6IFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZXM6IHRoaXMudmFsdWVzLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogUmVzb3VyY2VEZWZpbml0aW9uU2VyaWFsaXplZCk6IFJlc291cmNlRGVmaW5pdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBSZXNvdXJjZURlZmluaXRpb24ocy52YWx1ZXMpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFJlc291cmNlRGVmaW5pdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IFJlc291cmNlRGVmaW5pdGlvbiB9O1xuZXhwb3J0IHR5cGUgUmVzb3VyY2VEZWZpbml0aW9uc1NlcmlhbGl6ZWQgPSB7XG4gIFtrZXk6IHN0cmluZ106IFJlc291cmNlRGVmaW5pdGlvblNlcmlhbGl6ZWQ7XG59O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW4udHNcIjtcbmltcG9ydCB7IE9wLCBTdWJPcCwgU3ViT3BSZXN1bHQgfSBmcm9tIFwiLi9vcHMudHNcIjtcbmltcG9ydCB7XG4gIERFRkFVTFRfUkVTT1VSQ0VfVkFMVUUsXG4gIFJlc291cmNlRGVmaW5pdGlvbixcbn0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcblxuZXhwb3J0IGNsYXNzIEFkZFJlc291cmNlU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuXG4gIC8vIE1hcHMgYW4gaW5kZXggb2YgYSBUYXNrIHRvIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gIHRhc2tSZXNvdXJjZVZhbHVlczogTWFwPG51bWJlciwgc3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdGFza1Jlc291cmNlVmFsdWVzOiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gbmV3IE1hcDxudW1iZXIsIHN0cmluZz4oKSAvLyBTaG91bGQgb25seSBiZSBzdXBwbGllZCBieSBpbnZlcnNlIGFjdGlvbnMuXG4gICkge1xuICAgIHRoaXMua2V5ID0gbmFtZTtcbiAgICB0aGlzLnRhc2tSZXNvdXJjZVZhbHVlcyA9IHRhc2tSZXNvdXJjZVZhbHVlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IGZvdW5kTWF0Y2ggPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLmtleSk7XG4gICAgaWYgKGZvdW5kTWF0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBhbHJlYWR5IGV4aXN0cyBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuXG4gICAgcGxhbi5zZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXksIG5ldyBSZXNvdXJjZURlZmluaXRpb24oKSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGFkZCB0aGlzIGtleSBhbmQgc2V0IGl0IHRvIHRoZSBkZWZhdWx0LCB1bmxlc3NcbiAgICAvLyB0aGVyZSBpcyBtYXRjaGluZyBlbnRyeSBpbiB0YXNrUmVzb3VyY2VWYWx1ZXMsIGluIHdoaWNoIGNhc2Ugd2Ugd2lsbCB1c2UgdGhhdCB2YWx1ZS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2ssIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIHRhc2suc2V0UmVzb3VyY2UoXG4gICAgICAgIHRoaXMua2V5LFxuICAgICAgICB0aGlzLnRhc2tSZXNvdXJjZVZhbHVlcy5nZXQoaW5kZXgpIHx8IERFRkFVTFRfUkVTT1VSQ0VfVkFMVUVcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlUmVzb3VyY2VTdXBPcCh0aGlzLmtleSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVJlc291cmNlU3VwT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMua2V5ID0gbmFtZTtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHJlc291cmNlRGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYFRoZSByZXNvdXJjZSB3aXRoIG5hbWUgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYW5kIGNhbid0IGJlIGRlbGV0ZWQuYFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgZnJvbSByZXNvdXJjZSBkZWZpbml0aW9ucy5cbiAgICBwbGFuLmRlbGV0ZU1ldHJpY0RlZmluaXRpb24odGhpcy5rZXkpO1xuXG4gICAgY29uc3QgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZTogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXAoKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgcmVtb3ZlIGB0aGlzLmtleWAgZnJvbSB0aGUgcmVzb3VyY2VzIHdoaWxlIGFsc29cbiAgICAvLyBidWlsZGluZyB1cCB0aGUgaW5mbyBuZWVkZWQgZm9yIGEgcmV2ZXJ0LlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0YXNrLmdldFJlc291cmNlKHRoaXMua2V5KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFO1xuICAgICAgdGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZS5zZXQoaW5kZXgsIHZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlUmVzb3VyY2UodGhpcy5rZXkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UodGFza0luZGV4VG9EZWxldGVkUmVzb3VyY2VWYWx1ZSksXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoXG4gICAgcmVzb3VyY2VWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VLZXk6IE1hcDxudW1iZXIsIHN0cmluZz5cbiAgKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkUmVzb3VyY2VTdWJPcCh0aGlzLmtleSwgcmVzb3VyY2VWYWx1ZXNGb3JEZWxldGVkUmVzb3VyY2VLZXkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgaW5kaWNlc09mVGFza3NUb0NoYW5nZTogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW10gLy8gVGhpcyBzaG91bGQgb25seSBiZSBzdXBwbGllZCB3aGVuIGJlaW5nIGNvbnN0cnVjdGVkIGFzIGEgaW52ZXJzZSBvcGVyYXRpb24uXG4gICkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmluZGljZXNPZlRhc2tzVG9DaGFuZ2UgPSBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXNuJ3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cbiAgICBjb25zdCBleGlzdGluZ0luZGV4ID0gZGVmaW5pdGlvbi52YWx1ZXMuZmluZEluZGV4KFxuICAgICAgKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlID09PSB0aGlzLnZhbHVlXG4gICAgKTtcbiAgICBpZiAoZXhpc3RpbmdJbmRleCAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy52YWx1ZX0gYWxyZWFkeSBleGlzdHMgYXMgYSB2YWx1ZSBpbiB0aGUgUmVzb3VyY2UgJHt0aGlzLmtleX0uYFxuICAgICAgKTtcbiAgICB9XG4gICAgZGVmaW5pdGlvbi52YWx1ZXMucHVzaCh0aGlzLnZhbHVlKTtcblxuICAgIC8vIE5vdyBsb29rIGF0IGFsbCBUYXNrcyBhbmQgc2V0IHRoZSB2YWx1ZSBmb3IgdGhlIGdpdmVuIGtleSBmb3IgYWxsIHRoZVxuICAgIC8vIHRhc2tzIGxpc3RlZCBpbiBgaW5kaWNlc09mVGFza3NUb0NoYW5nZWAuXG4gICAgdGhpcy5pbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uc2V0UmVzb3VyY2UodGhpcy5rZXksIHRoaXMudmFsdWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBwcml2YXRlIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgRGVsZXRlUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy52YWx1ZSxcbiAgICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlbGV0ZVJlc291cmNlT3B0aW9uU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xuICBpbmRpY2VzT2ZUYXNrc1RvQ2hhbmdlOiBudW1iZXJbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nLFxuICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdID0gW11cbiAgKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuaW5kaWNlc09mVGFza3NUb0NoYW5nZSA9IGluZGljZXNPZlRhc2tzVG9DaGFuZ2U7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lc24ndCBleGlzdCBhcyBhIFJlc291cmNlYCk7XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlSW5kZXggPSBkZWZpbml0aW9uLnZhbHVlcy5maW5kSW5kZXgoXG4gICAgICAodmFsdWU6IHN0cmluZykgPT4gdmFsdWUgPT09IHRoaXMudmFsdWVcbiAgICApO1xuICAgIGlmICh2YWx1ZUluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLnZhbHVlfSBkb2VzIG5vdCBleGlzdCBhcyBhIHZhbHVlIGluIHRoZSBSZXNvdXJjZSAke3RoaXMua2V5fS5gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBSZXNvdXJjZXMgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSB2YWx1ZS4gJHt0aGlzLnZhbHVlfSBvbmx5IGhhcyBvbmUgdmFsdWUsIHNvIGl0IGNhbid0IGJlIGRlbGV0ZWQuIGBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZGVmaW5pdGlvbi52YWx1ZXMuc3BsaWNlKHZhbHVlSW5kZXgsIDEpO1xuXG4gICAgLy8gTm93IGl0ZXJhdGUgdGhvdWdoIGFsbCB0aGUgdGFza3MgYW5kIGNoYW5nZSBhbGwgdGFza3MgdGhhdCBoYXZlXG4gICAgLy8gXCJrZXk6dmFsdWVcIiB0byBpbnN0ZWFkIGJlIFwia2V5OmRlZmF1bHRcIi4gUmVjb3JkIHdoaWNoIHRhc2tzIGdvdCBjaGFuZ2VkXG4gICAgLy8gc28gdGhhdCB3ZSBjYW4gdXNlIHRoYXQgaW5mb3JtYXRpb24gd2hlbiB3ZSBjcmVhdGUgdGhlIGludmVydCBvcGVyYXRpb24uXG5cbiAgICBjb25zdCBpbmRpY2VzT2ZUYXNrc1dpdGhNYXRjaGluZ1Jlc291cmNlVmFsdWVzOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCByZXNvdXJjZVZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSk7XG4gICAgICBpZiAocmVzb3VyY2VWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gU2luY2UgdGhlIHZhbHVlIGlzIG5vIGxvbmdlciB2YWxpZCB3ZSBjaGFuZ2UgaXQgYmFjayB0byB0aGUgZGVmYXVsdC5cbiAgICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5rZXksIGRlZmluaXRpb24udmFsdWVzWzBdKTtcblxuICAgICAgLy8gUmVjb3JkIHdoaWNoIHRhc2sgd2UganVzdCBjaGFuZ2VkLlxuICAgICAgaW5kaWNlc09mVGFza3NXaXRoTWF0Y2hpbmdSZXNvdXJjZVZhbHVlcy5wdXNoKGluZGV4KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7XG4gICAgICBwbGFuOiBwbGFuLFxuICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKGluZGljZXNPZlRhc2tzV2l0aE1hdGNoaW5nUmVzb3VyY2VWYWx1ZXMpLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpbnZlcnNlKGluZGljZXNPZlRhc2tzVG9DaGFuZ2U6IG51bWJlcltdKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkUmVzb3VyY2VPcHRpb25TdWJPcChcbiAgICAgIHRoaXMua2V5LFxuICAgICAgdGhpcy52YWx1ZSxcbiAgICAgIGluZGljZXNPZlRhc2tzVG9DaGFuZ2VcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5hbWVSZXNvdXJjZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBvbGRLZXk6IHN0cmluZztcbiAgbmV3S2V5OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob2xkS2V5OiBzdHJpbmcsIG5ld0tleTogc3RyaW5nKSB7XG4gICAgdGhpcy5vbGRLZXkgPSBvbGRLZXk7XG4gICAgdGhpcy5uZXdLZXkgPSBuZXdLZXk7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBvbGREZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5vbGRLZXkpO1xuICAgIGlmIChvbGREZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLm9sZEtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIC8vIENvbmZpcm0gdGhlIG5ld0tleSBpcyBub3QgYWxyZWFkeSB1c2VkLlxuICAgIGNvbnN0IG5ld0tleURlZmluaXRpb24gPSBwbGFuLmdldFJlc291cmNlRGVmaW5pdGlvbih0aGlzLm5ld0tleSk7XG4gICAgaWYgKG5ld0tleURlZmluaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMubmV3S2V5fSBhbHJlYWR5IGV4aXN0cyBhcyBhIHJlc291cmNlIG5hbWUuYCk7XG4gICAgfVxuXG4gICAgcGxhbi5kZWxldGVSZXNvdXJjZURlZmluaXRpb24odGhpcy5vbGRLZXkpO1xuICAgIHBsYW4uc2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMubmV3S2V5LCBvbGREZWZpbml0aW9uKTtcblxuICAgIC8vIE5vdyBsb29wIG92ZXIgZXZlcnkgdGFzayBhbmQgY2hhbmdlIG9sZEtleSAtPiBuZXdrZXkgZm9yIHRoZSBnaXZlbiByZXNvdXJjZSBrZXkuXG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5mb3JFYWNoKCh0YXNrOiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPVxuICAgICAgICB0YXNrLmdldFJlc291cmNlKHRoaXMub2xkS2V5KSB8fCBERUZBVUxUX1JFU09VUkNFX1ZBTFVFO1xuICAgICAgdGFzay5zZXRSZXNvdXJjZSh0aGlzLm5ld0tleSwgY3VycmVudFZhbHVlKTtcbiAgICAgIHRhc2suZGVsZXRlUmVzb3VyY2UodGhpcy5vbGRLZXkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFJlbmFtZVJlc291cmNlU3ViT3AodGhpcy5uZXdLZXksIHRoaXMub2xkS2V5KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVuYW1lUmVzb3VyY2VPcHRpb25TdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAga2V5OiBzdHJpbmc7XG4gIG9sZFZhbHVlOiBzdHJpbmc7XG4gIG5ld1ZhbHVlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIG9sZFZhbHVlOiBzdHJpbmcsIG5ld1ZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLm9sZFZhbHVlID0gb2xkVmFsdWU7XG4gICAgdGhpcy5uZXdWYWx1ZSA9IG5ld1ZhbHVlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZm91bmRNYXRjaCA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZm91bmRNYXRjaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBvbGRWYWx1ZSBpcyBpbiB0aGVyZS5cbiAgICBjb25zdCBvbGRWYWx1ZUluZGV4ID0gZm91bmRNYXRjaC52YWx1ZXMuaW5kZXhPZih0aGlzLm9sZFZhbHVlKTtcblxuICAgIGlmIChvbGRWYWx1ZUluZGV4ID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKGAke3RoaXMua2V5fSBkb2VzIG5vdCBhIHZhbHVlICR7dGhpcy5vbGRWYWx1ZX1gKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHRoZSBuZXdWYWx1ZSBpcyBub3QgaW4gdGhlcmUuXG4gICAgY29uc3QgbmV3VmFsdWVJbmRleCA9IGZvdW5kTWF0Y2gudmFsdWVzLmluZGV4T2YodGhpcy5uZXdWYWx1ZSk7XG4gICAgaWYgKG5ld1ZhbHVlSW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGFscmVhZHkgaGFzIGEgdmFsdWUgJHt0aGlzLm5ld1ZhbHVlfWApO1xuICAgIH1cblxuICAgIC8vIFN3YXAgdGhlIHZhbHVlcy5cbiAgICBmb3VuZE1hdGNoLnZhbHVlcy5zcGxpY2Uob2xkVmFsdWVJbmRleCwgMSwgdGhpcy5uZXdWYWx1ZSk7XG5cbiAgICAvLyBOb3cgbG9vcCBvdmVyIGV2ZXJ5IHRhc2sgYW5kIGNoYW5nZSBvbGRWYWx1ZSAtPiBuZXdWYWx1ZSBmb3IgdGhlIGdpdmVuIHJlc291cmNlIGtleS5cbiAgICBwbGFuLmNoYXJ0LlZlcnRpY2VzLmZvckVhY2goKHRhc2s6IFRhc2spID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IHRhc2suZ2V0UmVzb3VyY2UodGhpcy5rZXkpO1xuICAgICAgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gdGhpcy5vbGRWYWx1ZSkge1xuICAgICAgICB0YXNrLnNldFJlc291cmNlKHRoaXMua2V5LCB0aGlzLm5ld1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBSZW5hbWVSZXNvdXJjZU9wdGlvblN1Yk9wKFxuICAgICAgdGhpcy5rZXksXG4gICAgICB0aGlzLm5ld1ZhbHVlLFxuICAgICAgdGhpcy5vbGRWYWx1ZVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgb2xkSW5kZXg6IG51bWJlcjtcbiAgbmV3SW5kZXg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgb2xkVmFsdWU6IG51bWJlciwgbmV3VmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMub2xkSW5kZXggPSBvbGRWYWx1ZTtcbiAgICB0aGlzLm5ld0luZGV4ID0gbmV3VmFsdWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24odGhpcy5rZXkpO1xuICAgIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgZXhpc3QgYXMgYSBSZXNvdXJjZWApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9sZEluZGV4ID4gZGVmaW5pdGlvbi52YWx1ZXMubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICBgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIGF0IGluZGV4ICR7dGhpcy5vbGRJbmRleH1gXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy5uZXdJbmRleCA+IGRlZmluaXRpb24udmFsdWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgYCR7dGhpcy5rZXl9IGRvZXMgbm90IGhhdmUgYSB2YWx1ZSBhdCBpbmRleCAke3RoaXMubmV3SW5kZXh9YFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBTd2FwIHRoZSB2YWx1ZXMuXG4gICAgY29uc3QgdG1wID0gZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5vbGRJbmRleF07XG4gICAgZGVmaW5pdGlvbi52YWx1ZXNbdGhpcy5vbGRJbmRleF0gPSBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm5ld0luZGV4XTtcbiAgICBkZWZpbml0aW9uLnZhbHVlc1t0aGlzLm5ld0luZGV4XSA9IHRtcDtcblxuICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgd2l0aCBUYXNrcyBiZWNhdXNlIHRoZSBpbmRleCBvZiBhIHZhbHVlIGlzXG4gICAgLy8gaXJyZWxldmFudCBzaW5jZSB3ZSBzdG9yZSB0aGUgdmFsdWUgaXRzZWxmLCBub3QgdGhlIGluZGV4LlxuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IE1vdmVSZXNvdXJjZU9wdGlvblN1Yk9wKHRoaXMua2V5LCB0aGlzLm5ld0luZGV4LCB0aGlzLm9sZEluZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IHN0cmluZztcbiAgdGFza0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHRhc2tJbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgZm91bmRNYXRjaCA9IHBsYW4uZ2V0UmVzb3VyY2VEZWZpbml0aW9uKHRoaXMua2V5KTtcbiAgICBpZiAoZm91bmRNYXRjaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoYCR7dGhpcy5rZXl9IGRvZXMgbm90IGV4aXN0IGFzIGEgUmVzb3VyY2VgKTtcbiAgICB9XG5cbiAgICBjb25zdCBmb3VuZFZhbHVlTWF0Y2ggPSBmb3VuZE1hdGNoLnZhbHVlcy5maW5kSW5kZXgoKHY6IHN0cmluZykgPT4ge1xuICAgICAgcmV0dXJuIHYgPT09IHRoaXMudmFsdWU7XG4gICAgfSk7XG4gICAgaWYgKGZvdW5kVmFsdWVNYXRjaCA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBlcnJvcihgJHt0aGlzLmtleX0gZG9lcyBub3QgaGF2ZSBhIHZhbHVlIG9mICR7dGhpcy52YWx1ZX1gKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudGFza0luZGV4IDwgMCB8fCB0aGlzLnRhc2tJbmRleCA+PSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGVycm9yKGBUaGVyZSBpcyBubyBUYXNrIGF0IGluZGV4ICR7dGhpcy50YXNrSW5kZXh9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFzayA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdO1xuICAgIGNvbnN0IG9sZFZhbHVlID0gdGFzay5nZXRSZXNvdXJjZSh0aGlzLmtleSkhO1xuICAgIHRhc2suc2V0UmVzb3VyY2UodGhpcy5rZXksIHRoaXMudmFsdWUpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogdGhpcy5pbnZlcnNlKG9sZFZhbHVlKSB9KTtcbiAgfVxuXG4gIGludmVyc2Uob2xkVmFsdWU6IHN0cmluZyk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFJlc291cmNlVmFsdWVTdWJPcCh0aGlzLmtleSwgb2xkVmFsdWUsIHRoaXMudGFza0luZGV4KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQWRkUmVzb3VyY2VPcChuYW1lOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRSZXNvdXJjZVN1Yk9wKG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVSZXNvdXJjZU9wKG5hbWU6IHN0cmluZyk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IERlbGV0ZVJlc291cmNlU3VwT3AobmFtZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZFJlc291cmNlT3B0aW9uT3Aoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBBZGRSZXNvdXJjZU9wdGlvblN1Yk9wKGtleSwgdmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVSZXNvdXJjZU9wdGlvbk9wKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgRGVsZXRlUmVzb3VyY2VPcHRpb25TdWJPcChrZXksIHZhbHVlKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVuYW1lUmVzb3VyY2VPcHRpb25PcChcbiAga2V5OiBzdHJpbmcsXG4gIG9sZFZhbHVlOiBzdHJpbmcsXG4gIG5ld1ZhbHVlOiBzdHJpbmdcbik6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJlbmFtZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCBvbGRWYWx1ZSwgbmV3VmFsdWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5hbWVSZXNvdXJjZU9wKG9sZFZhbHVlOiBzdHJpbmcsIG5ld1ZhbHVlOiBzdHJpbmcpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBSZW5hbWVSZXNvdXJjZVN1Yk9wKG9sZFZhbHVlLCBuZXdWYWx1ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1vdmVSZXNvdXJjZU9wdGlvbk9wKFxuICBrZXk6IHN0cmluZyxcbiAgb2xkSW5kZXg6IG51bWJlcixcbiAgbmV3SW5kZXg6IG51bWJlclxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgTW92ZVJlc291cmNlT3B0aW9uU3ViT3Aoa2V5LCBvbGRJbmRleCwgbmV3SW5kZXgpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRSZXNvdXJjZVZhbHVlT3AoXG4gIGtleTogc3RyaW5nLFxuICB2YWx1ZTogc3RyaW5nLFxuICB0YXNrSW5kZXg6IG51bWJlclxuKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0UmVzb3VyY2VWYWx1ZVN1Yk9wKGtleSwgdmFsdWUsIHRhc2tJbmRleCldKTtcbn1cbiIsICIvKiogT25lIHZlcnRleCBvZiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgVmVydGV4ID0gb2JqZWN0O1xuXG4vKiogRXZlcnkgVmVydGV4IGluIGEgZ3JhcGguICovXG5leHBvcnQgdHlwZSBWZXJ0aWNlcyA9IFZlcnRleFtdO1xuXG4vKiogQSBzdWJzZXQgb2YgVmVydGljZXMgcmVmZXJyZWQgdG8gYnkgdGhlaXIgaW5kZXggbnVtYmVyLiAqL1xuZXhwb3J0IHR5cGUgVmVydGV4SW5kaWNlcyA9IG51bWJlcltdO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQge1xuICBpOiBudW1iZXI7XG4gIGo6IG51bWJlcjtcbn1cblxuLyoqIE9uZSBlZGdlIG9mIGEgZ3JhcGgsIHdoaWNoIGlzIGEgZGlyZWN0ZWQgY29ubmVjdGlvbiBmcm9tIHRoZSBpJ3RoIFZlcnRleCB0b1xudGhlIGondGggVmVydGV4LCB3aGVyZSB0aGUgVmVydGV4IGlzIHN0b3JlZCBpbiBhIFZlcnRpY2VzLlxuICovXG5leHBvcnQgY2xhc3MgRGlyZWN0ZWRFZGdlIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIgPSAwLCBqOiBudW1iZXIgPSAwKSB7XG4gICAgdGhpcy5pID0gaTtcbiAgICB0aGlzLmogPSBqO1xuICB9XG5cbiAgZXF1YWwocmhzOiBEaXJlY3RlZEVkZ2UpOiBib29sZWFuIHtcbiAgICByZXR1cm4gcmhzLmkgPT09IHRoaXMuaSAmJiByaHMuaiA9PT0gdGhpcy5qO1xuICB9XG5cbiAgdG9KU09OKCk6IERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBpOiB0aGlzLmksXG4gICAgICBqOiB0aGlzLmosXG4gICAgfTtcbiAgfVxufVxuXG4vKiogRXZlcnkgRWdkZSBpbiBhIGdyYXBoLiAqL1xuZXhwb3J0IHR5cGUgRWRnZXMgPSBEaXJlY3RlZEVkZ2VbXTtcblxuLyoqIEEgZ3JhcGggaXMganVzdCBhIGNvbGxlY3Rpb24gb2YgVmVydGljZXMgYW5kIEVkZ2VzIGJldHdlZW4gdGhvc2UgdmVydGljZXMuICovXG5leHBvcnQgdHlwZSBEaXJlY3RlZEdyYXBoID0ge1xuICBWZXJ0aWNlczogVmVydGljZXM7XG4gIEVkZ2VzOiBFZGdlcztcbn07XG5cbi8qKlxuIEdyb3VwcyB0aGUgRWRnZXMgYnkgdGhlaXIgYGlgIHZhbHVlLlxuXG4gQHBhcmFtIGVkZ2VzIC0gQWxsIHRoZSBFZ2VzIGluIGEgRGlyZWN0ZWRHcmFwaC5cbiBAcmV0dXJucyBBIG1hcCBmcm9tIHRoZSBWZXJ0ZXggaW5kZXggdG8gYWxsIHRoZSBFZGdlcyB0aGF0IHN0YXJ0IGF0XG4gICBhdCB0aGF0IFZlcnRleCBpbmRleC5cbiAqL1xuZXhwb3J0IGNvbnN0IGVkZ2VzQnlTcmNUb01hcCA9IChlZGdlczogRWRnZXMpOiBNYXA8bnVtYmVyLCBFZGdlcz4gPT4ge1xuICBjb25zdCByZXQgPSBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCk7XG5cbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgY29uc3QgYXJyID0gcmV0LmdldChlLmkpIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5zZXQoZS5pLCBhcnIpO1xuICB9KTtcblxuICByZXR1cm4gcmV0O1xufTtcblxuLyoqXG4gICBHcm91cHMgdGhlIEVkZ2VzIGJ5IHRoZWlyIGBqYCB2YWx1ZS5cbiAgXG4gICBAcGFyYW0gZWRnZXMgLSBBbGwgdGhlIEVkZ2VzIGluIGEgRGlyZWN0ZWRHcmFwaC5cbiAgIEByZXR1cm5zIEEgbWFwIGZyb20gdGhlIFZlcnRleCBpbmRleCB0byBhbGwgdGhlIEVkZ2VzIHRoYXQgZW5kIGF0XG4gICAgIGF0IHRoYXQgVmVydGV4IGluZGV4LlxuICAgKi9cblxuZXhwb3J0IGNvbnN0IGVkZ2VzQnlEc3RUb01hcCA9IChlZGdlczogRWRnZXMpOiBNYXA8bnVtYmVyLCBFZGdlcz4gPT4ge1xuICBjb25zdCByZXQgPSBuZXcgTWFwPG51bWJlciwgRWRnZXM+KCk7XG5cbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgY29uc3QgYXJyID0gcmV0LmdldChlLmopIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5zZXQoZS5qLCBhcnIpO1xuICB9KTtcblxuICByZXR1cm4gcmV0O1xufTtcblxuZXhwb3J0IHR5cGUgU3JjQW5kRHN0UmV0dXJuID0ge1xuICBieVNyYzogTWFwPG51bWJlciwgRWRnZXM+O1xuICBieURzdDogTWFwPG51bWJlciwgRWRnZXM+O1xufTtcblxuZXhwb3J0IGNvbnN0IGVkZ2VzQnlTcmNBbmREc3RUb01hcCA9IChlZGdlczogRWRnZXMpOiBTcmNBbmREc3RSZXR1cm4gPT4ge1xuICBjb25zdCByZXQgPSB7XG4gICAgYnlTcmM6IG5ldyBNYXA8bnVtYmVyLCBFZGdlcz4oKSxcbiAgICBieURzdDogbmV3IE1hcDxudW1iZXIsIEVkZ2VzPigpLFxuICB9O1xuXG4gIGVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgIGxldCBhcnIgPSByZXQuYnlTcmMuZ2V0KGUuaSkgfHwgW107XG4gICAgYXJyLnB1c2goZSk7XG4gICAgcmV0LmJ5U3JjLnNldChlLmksIGFycik7XG4gICAgYXJyID0gcmV0LmJ5RHN0LmdldChlLmopIHx8IFtdO1xuICAgIGFyci5wdXNoKGUpO1xuICAgIHJldC5ieURzdC5zZXQoZS5qLCBhcnIpO1xuICB9KTtcblxuICByZXR1cm4gcmV0O1xufTtcbiIsICJpbXBvcnQge1xuICBWZXJ0ZXgsXG4gIFZlcnRleEluZGljZXMsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbn0gZnJvbSBcIi4uL2RhZy50c1wiO1xuXG4vKipcblRoZSByZXR1cm4gdHlwZSBmb3IgdGhlIFRvcGxvZ2ljYWxTb3J0IGZ1bmN0aW9uLiBcbiAqL1xudHlwZSBUU1JldHVybiA9IHtcbiAgaGFzQ3ljbGVzOiBib29sZWFuO1xuXG4gIGN5Y2xlOiBWZXJ0ZXhJbmRpY2VzO1xuXG4gIG9yZGVyOiBWZXJ0ZXhJbmRpY2VzO1xufTtcblxuLyoqXG5SZXR1cm5zIGEgdG9wb2xvZ2ljYWwgc29ydCBvcmRlciBmb3IgYSBEaXJlY3RlZEdyYXBoLCBvciB0aGUgbWVtYmVycyBvZiBhIGN5Y2xlIGlmIGFcbnRvcG9sb2dpY2FsIHNvcnQgY2FuJ3QgYmUgZG9uZS5cbiBcbiBUaGUgdG9wb2xvZ2ljYWwgc29ydCBjb21lcyBmcm9tOlxuXG4gICAgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVG9wb2xvZ2ljYWxfc29ydGluZyNEZXB0aC1maXJzdF9zZWFyY2hcblxuTCBcdTIxOTAgRW1wdHkgbGlzdCB0aGF0IHdpbGwgY29udGFpbiB0aGUgc29ydGVkIG5vZGVzXG53aGlsZSBleGlzdHMgbm9kZXMgd2l0aG91dCBhIHBlcm1hbmVudCBtYXJrIGRvXG4gICAgc2VsZWN0IGFuIHVubWFya2VkIG5vZGUgblxuICAgIHZpc2l0KG4pXG5cbmZ1bmN0aW9uIHZpc2l0KG5vZGUgbilcbiAgICBpZiBuIGhhcyBhIHBlcm1hbmVudCBtYXJrIHRoZW5cbiAgICAgICAgcmV0dXJuXG4gICAgaWYgbiBoYXMgYSB0ZW1wb3JhcnkgbWFyayB0aGVuXG4gICAgICAgIHN0b3AgICAoZ3JhcGggaGFzIGF0IGxlYXN0IG9uZSBjeWNsZSlcblxuICAgIG1hcmsgbiB3aXRoIGEgdGVtcG9yYXJ5IG1hcmtcblxuICAgIGZvciBlYWNoIG5vZGUgbSB3aXRoIGFuIGVkZ2UgZnJvbSBuIHRvIG0gZG9cbiAgICAgICAgdmlzaXQobSlcblxuICAgIHJlbW92ZSB0ZW1wb3JhcnkgbWFyayBmcm9tIG5cbiAgICBtYXJrIG4gd2l0aCBhIHBlcm1hbmVudCBtYXJrXG4gICAgYWRkIG4gdG8gaGVhZCBvZiBMXG5cbiAqL1xuZXhwb3J0IGNvbnN0IHRvcG9sb2dpY2FsU29ydCA9IChnOiBEaXJlY3RlZEdyYXBoKTogVFNSZXR1cm4gPT4ge1xuICBjb25zdCByZXQ6IFRTUmV0dXJuID0ge1xuICAgIGhhc0N5Y2xlczogZmFsc2UsXG4gICAgY3ljbGU6IFtdLFxuICAgIG9yZGVyOiBbXSxcbiAgfTtcblxuICBjb25zdCBlZGdlTWFwID0gZWRnZXNCeVNyY1RvTWFwKGcuRWRnZXMpO1xuXG4gIGNvbnN0IG5vZGVzV2l0aG91dFBlcm1hbmVudE1hcmsgPSBuZXcgU2V0PG51bWJlcj4oKTtcbiAgZy5WZXJ0aWNlcy5mb3JFYWNoKChfOiBWZXJ0ZXgsIGluZGV4OiBudW1iZXIpID0+XG4gICAgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5hZGQoaW5kZXgpXG4gICk7XG5cbiAgY29uc3QgaGFzUGVybWFuZW50TWFyayA9IChpbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuICFub2Rlc1dpdGhvdXRQZXJtYW5lbnRNYXJrLmhhcyhpbmRleCk7XG4gIH07XG5cbiAgY29uc3QgdGVtcG9yYXJ5TWFyayA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuXG4gIGNvbnN0IHZpc2l0ID0gKGluZGV4OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICBpZiAoaGFzUGVybWFuZW50TWFyayhpbmRleCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAodGVtcG9yYXJ5TWFyay5oYXMoaW5kZXgpKSB7XG4gICAgICAvLyBXZSBvbmx5IHJldHVybiBmYWxzZSBvbiBmaW5kaW5nIGEgbG9vcCwgd2hpY2ggaXMgc3RvcmVkIGluXG4gICAgICAvLyB0ZW1wb3JhcnlNYXJrLlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0ZW1wb3JhcnlNYXJrLmFkZChpbmRleCk7XG5cbiAgICBjb25zdCBuZXh0RWRnZXMgPSBlZGdlTWFwLmdldChpbmRleCk7XG4gICAgaWYgKG5leHRFZGdlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5leHRFZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlID0gbmV4dEVkZ2VzW2ldO1xuICAgICAgICBpZiAoIXZpc2l0KGUuaikpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0ZW1wb3JhcnlNYXJrLmRlbGV0ZShpbmRleCk7XG4gICAgbm9kZXNXaXRob3V0UGVybWFuZW50TWFyay5kZWxldGUoaW5kZXgpO1xuICAgIHJldC5vcmRlci51bnNoaWZ0KGluZGV4KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBXZSB3aWxsIHByZXN1bWUgdGhhdCBWZXJ0ZXhbMF0gaXMgdGhlIHN0YXJ0IG5vZGUgYW5kIHRoYXQgd2Ugc2hvdWxkIHN0YXJ0IHRoZXJlLlxuICBjb25zdCBvayA9IHZpc2l0KDApO1xuICBpZiAoIW9rKSB7XG4gICAgcmV0Lmhhc0N5Y2xlcyA9IHRydWU7XG4gICAgcmV0LmN5Y2xlID0gWy4uLnRlbXBvcmFyeU1hcmsua2V5cygpXTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59O1xuIiwgImltcG9ydCB7IFJlc3VsdCwgb2ssIGVycm9yIH0gZnJvbSBcIi4uL3Jlc3VsdC50c1wiO1xuaW1wb3J0IHtcbiAgVmVydGV4SW5kaWNlcyxcbiAgRWRnZXMsXG4gIERpcmVjdGVkR3JhcGgsXG4gIGVkZ2VzQnlTcmNUb01hcCxcbiAgZWRnZXNCeURzdFRvTWFwLFxuICBEaXJlY3RlZEVkZ2UsXG4gIERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQsXG59IGZyb20gXCIuLi9kYWcvZGFnXCI7XG5cbmltcG9ydCB7IHRvcG9sb2dpY2FsU29ydCB9IGZyb20gXCIuLi9kYWcvYWxnb3JpdGhtcy90b3Bvc29ydC50c1wiO1xuaW1wb3J0IHsgTWV0cmljVmFsdWVzIH0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuXG5leHBvcnQgdHlwZSBUYXNrU3RhdGUgPSBcInVuc3RhcnRlZFwiIHwgXCJzdGFydGVkXCIgfCBcImNvbXBsZXRlXCI7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1RBU0tfTkFNRSA9IFwiVGFzayBOYW1lXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFza1NlcmlhbGl6ZWQge1xuICByZXNvdXJjZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG4gIG1ldHJpY3M6IE1ldHJpY1ZhbHVlcztcbiAgbmFtZTogc3RyaW5nO1xuICBzdGF0ZTogVGFza1N0YXRlO1xufVxuXG4vLyBEbyB3ZSBjcmVhdGUgc3ViLWNsYXNzZXMgYW5kIHRoZW4gc2VyaWFsaXplIHNlcGFyYXRlbHk/IE9yIGRvIHdlIGhhdmUgYVxuLy8gY29uZmlnIGFib3V0IHdoaWNoIHR5cGUgb2YgRHVyYXRpb25TYW1wbGVyIGlzIGJlaW5nIHVzZWQ/XG4vL1xuLy8gV2UgY2FuIHVzZSB0cmFkaXRpb25hbCBvcHRpbWlzdGljL3Blc3NpbWlzdGljIHZhbHVlLiBPciBKYWNvYmlhbidzXG4vLyB1bmNlcnRhaW50bHkgbXVsdGlwbGllcnMgWzEuMSwgMS41LCAyLCA1XSBhbmQgdGhlaXIgaW52ZXJzZXMgdG8gZ2VuZXJhdGUgYW5cbi8vIG9wdGltaXN0aWMgcGVzc2ltaXN0aWMuXG5cbi8qKiBUYXNrIGlzIGEgVmVydGV4IHdpdGggZGV0YWlscyBhYm91dCB0aGUgVGFzayB0byBjb21wbGV0ZS4gKi9cbmV4cG9ydCBjbGFzcyBUYXNrIHtcbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nID0gXCJcIikge1xuICAgIHRoaXMubmFtZSA9IG5hbWUgfHwgREVGQVVMVF9UQVNLX05BTUU7XG4gICAgdGhpcy5tZXRyaWNzID0ge307XG4gICAgdGhpcy5yZXNvdXJjZXMgPSB7fTtcbiAgfVxuXG4gIC8vIFJlc291cmNlIGtleXMgYW5kIHZhbHVlcy4gVGhlIHBhcmVudCBwbGFuIGNvbnRhaW5zIGFsbCB0aGUgcmVzb3VyY2VcbiAgLy8gZGVmaW5pdGlvbnMuXG5cbiAgcmVzb3VyY2VzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuXG4gIG1ldHJpY3M6IE1ldHJpY1ZhbHVlcztcblxuICBuYW1lOiBzdHJpbmc7XG5cbiAgc3RhdGU6IFRhc2tTdGF0ZSA9IFwidW5zdGFydGVkXCI7XG5cbiAgdG9KU09OKCk6IFRhc2tTZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzb3VyY2VzOiB0aGlzLnJlc291cmNlcyxcbiAgICAgIG1ldHJpY3M6IHRoaXMubWV0cmljcyxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIHN0YXRlOiB0aGlzLnN0YXRlLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZ2V0IGR1cmF0aW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWV0cmljKFwiRHVyYXRpb25cIikhO1xuICB9XG5cbiAgcHVibGljIHNldCBkdXJhdGlvbih2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRNZXRyaWMoXCJEdXJhdGlvblwiLCB2YWx1ZSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0TWV0cmljKGtleTogc3RyaW5nKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5tZXRyaWNzW2tleV07XG4gIH1cblxuICBwdWJsaWMgc2V0TWV0cmljKGtleTogc3RyaW5nLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5tZXRyaWNzW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBkZWxldGVNZXRyaWMoa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5tZXRyaWNzW2tleV07XG4gIH1cblxuICBwdWJsaWMgZ2V0UmVzb3VyY2Uoa2V5OiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlc1trZXldO1xuICB9XG5cbiAgcHVibGljIHNldFJlc291cmNlKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5yZXNvdXJjZXNba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGRlbGV0ZVJlc291cmNlKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMucmVzb3VyY2VzW2tleV07XG4gIH1cblxuICBwdWJsaWMgZHVwKCk6IFRhc2sge1xuICAgIGNvbnN0IHJldCA9IG5ldyBUYXNrKCk7XG4gICAgcmV0LnJlc291cmNlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucmVzb3VyY2VzKTtcbiAgICByZXQubWV0cmljcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMubWV0cmljcyk7XG4gICAgcmV0Lm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0LnN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFRhc2tzID0gVGFza1tdO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoYXJ0U2VyaWFsaXplZCB7XG4gIHZlcnRpY2VzOiBUYXNrU2VyaWFsaXplZFtdO1xuICBlZGdlczogRGlyZWN0ZWRFZGdlU2VyaWFsaXplZFtdO1xufVxuXG4vKiogQSBDaGFydCBpcyBhIERpcmVjdGVkR3JhcGgsIGJ1dCB3aXRoIFRhc2tzIGZvciBWZXJ0aWNlcy4gKi9cbmV4cG9ydCBjbGFzcyBDaGFydCB7XG4gIFZlcnRpY2VzOiBUYXNrcztcbiAgRWRnZXM6IEVkZ2VzO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gbmV3IFRhc2soXCJTdGFydFwiKTtcbiAgICBzdGFydC5zZXRNZXRyaWMoXCJEdXJhdGlvblwiLCAwKTtcbiAgICBjb25zdCBmaW5pc2ggPSBuZXcgVGFzayhcIkZpbmlzaFwiKTtcbiAgICBmaW5pc2guc2V0TWV0cmljKFwiRHVyYXRpb25cIiwgMCk7XG4gICAgdGhpcy5WZXJ0aWNlcyA9IFtzdGFydCwgZmluaXNoXTtcbiAgICB0aGlzLkVkZ2VzID0gW25ldyBEaXJlY3RlZEVkZ2UoMCwgMSldO1xuICB9XG5cbiAgdG9KU09OKCk6IENoYXJ0U2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnRpY2VzOiB0aGlzLlZlcnRpY2VzLm1hcCgodDogVGFzaykgPT4gdC50b0pTT04oKSksXG4gICAgICBlZGdlczogdGhpcy5FZGdlcy5tYXAoKGU6IERpcmVjdGVkRWRnZSkgPT4gZS50b0pTT04oKSksXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUb3BvbG9naWNhbE9yZGVyID0gVmVydGV4SW5kaWNlcztcblxuZXhwb3J0IHR5cGUgVmFsaWRhdGVSZXN1bHQgPSBSZXN1bHQ8VG9wb2xvZ2ljYWxPcmRlcj47XG5cbi8qKiBWYWxpZGF0ZXMgYSBEaXJlY3RlZEdyYXBoIGlzIGEgdmFsaWQgQ2hhcnQuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDaGFydChnOiBEaXJlY3RlZEdyYXBoKTogVmFsaWRhdGVSZXN1bHQge1xuICBpZiAoZy5WZXJ0aWNlcy5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgXCJDaGFydCBtdXN0IGNvbnRhaW4gYXQgbGVhc3QgdHdvIG5vZGUsIHRoZSBzdGFydCBhbmQgZmluaXNoIHRhc2tzLlwiXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IGVkZ2VzQnlEc3QgPSBlZGdlc0J5RHN0VG9NYXAoZy5FZGdlcyk7XG4gIGNvbnN0IGVkZ2VzQnlTcmMgPSBlZGdlc0J5U3JjVG9NYXAoZy5FZGdlcyk7XG5cbiAgLy8gVGhlIGZpcnN0IFZlcnRleCwgVF8wIGFrYSB0aGUgU3RhcnQgTWlsZXN0b25lLCBtdXN0IGhhdmUgMCBpbmNvbWluZyBlZGdlcy5cbiAgaWYgKGVkZ2VzQnlEc3QuZ2V0KDApICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZXJyb3IoXCJUaGUgc3RhcnQgbm9kZSAoMCkgaGFzIGFuIGluY29taW5nIGVkZ2UuXCIpO1xuICB9XG5cbiAgLy8gQW5kIG9ubHkgVF8wIHNob3VsZCBoYXZlIDAgaW5jb21pbmcgZWRnZXMuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgZy5WZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlZGdlc0J5RHN0LmdldChpKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBGb3VuZCBub2RlIHRoYXQgaXNuJ3QgKDApIHRoYXQgaGFzIG5vIGluY29taW5nIGVkZ2VzOiAke2l9YFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgbGFzdCBWZXJ0ZXgsIFRfZmluaXNoLCB0aGUgRmluaXNoIE1pbGVzdG9uZSwgbXVzdCBoYXZlIDAgb3V0Z29pbmcgZWRnZXMuXG4gIGlmIChlZGdlc0J5U3JjLmdldChnLlZlcnRpY2VzLmxlbmd0aCAtIDEpICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBcIlRoZSBsYXN0IG5vZGUsIHdoaWNoIHNob3VsZCBiZSB0aGUgRmluaXNoIE1pbGVzdG9uZSwgaGFzIGFuIG91dGdvaW5nIGVkZ2UuXCJcbiAgICApO1xuICB9XG5cbiAgLy8gQW5kIG9ubHkgVF9maW5pc2ggc2hvdWxkIGhhdmUgMCBvdXRnb2luZyBlZGdlcy5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBnLlZlcnRpY2VzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIGlmIChlZGdlc0J5U3JjLmdldChpKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIGBGb3VuZCBub2RlIHRoYXQgaXNuJ3QgVF9maW5pc2ggdGhhdCBoYXMgbm8gb3V0Z29pbmcgZWRnZXM6ICR7aX1gXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG51bVZlcnRpY2VzID0gZy5WZXJ0aWNlcy5sZW5ndGg7XG4gIC8vIEFuZCBhbGwgZWRnZXMgbWFrZSBzZW5zZSwgaS5lLiB0aGV5IGFsbCBwb2ludCB0byB2ZXJ0ZXhlcyB0aGF0IGV4aXN0LlxuICBmb3IgKGxldCBpID0gMDsgaSA8IGcuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZy5FZGdlc1tpXTtcbiAgICBpZiAoXG4gICAgICBlbGVtZW50LmkgPCAwIHx8XG4gICAgICBlbGVtZW50LmkgPj0gbnVtVmVydGljZXMgfHxcbiAgICAgIGVsZW1lbnQuaiA8IDAgfHxcbiAgICAgIGVsZW1lbnQuaiA+PSBudW1WZXJ0aWNlc1xuICAgICkge1xuICAgICAgcmV0dXJuIGVycm9yKGBFZGdlICR7ZWxlbWVudH0gcG9pbnRzIHRvIGEgbm9uLWV4aXN0ZW50IFZlcnRleC5gKTtcbiAgICB9XG4gIH1cblxuICAvLyBOb3cgd2UgY29uZmlybSB0aGF0IHdlIGhhdmUgYSBEaXJlY3RlZCBBY3ljbGljIEdyYXBoLCBpLmUuIHRoZSBncmFwaCBoYXMgbm9cbiAgLy8gY3ljbGVzIGJ5IGNyZWF0aW5nIGEgdG9wb2xvZ2ljYWwgc29ydCBzdGFydGluZyBhdCBUXzBcbiAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVG9wb2xvZ2ljYWxfc29ydGluZyNEZXB0aC1maXJzdF9zZWFyY2hcbiAgY29uc3QgdHNSZXQgPSB0b3BvbG9naWNhbFNvcnQoZyk7XG4gIGlmICh0c1JldC5oYXNDeWNsZXMpIHtcbiAgICByZXR1cm4gZXJyb3IoYENoYXJ0IGhhcyBjeWNsZTogJHtbLi4udHNSZXQuY3ljbGVdLmpvaW4oXCIsIFwiKX1gKTtcbiAgfVxuXG4gIHJldHVybiBvayh0c1JldC5vcmRlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGFydFZhbGlkYXRlKGM6IENoYXJ0KTogVmFsaWRhdGVSZXN1bHQge1xuICBjb25zdCByZXQgPSB2YWxpZGF0ZUNoYXJ0KGMpO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgaWYgKGMuVmVydGljZXNbMF0uZHVyYXRpb24gIT09IDApIHtcbiAgICByZXR1cm4gZXJyb3IoXG4gICAgICBgU3RhcnQgTWlsZXN0b25lIG11c3QgaGF2ZSBkdXJhdGlvbiBvZiAwLCBpbnN0ZWFkIGdvdCAke2MuVmVydGljZXNbMF0uZHVyYXRpb259YFxuICAgICk7XG4gIH1cbiAgaWYgKGMuVmVydGljZXNbYy5WZXJ0aWNlcy5sZW5ndGggLSAxXS5kdXJhdGlvbiAhPT0gMCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBGaW5pc2ggTWlsZXN0b25lIG11c3QgaGF2ZSBkdXJhdGlvbiBvZiAwLCBpbnN0ZWFkIGdvdCAke1xuICAgICAgICBjLlZlcnRpY2VzW2MuVmVydGljZXMubGVuZ3RoIC0gMV0uZHVyYXRpb25cbiAgICAgIH1gXG4gICAgKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuIiwgImltcG9ydCB7IFJvdW5kZXIgfSBmcm9tIFwiLi4vdHlwZXMvdHlwZXNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBQcmVjaXNpb25TZXJpYWxpemVkIHtcbiAgcHJlY2lzaW9uOiBudW1iZXI7XG59XG5leHBvcnQgY2xhc3MgUHJlY2lzaW9uIHtcbiAgcHJpdmF0ZSBtdWx0aXBsaWVyOiBudW1iZXI7XG4gIHByaXZhdGUgX3ByZWNpc2lvbjogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByZWNpc2lvbjogbnVtYmVyID0gMCkge1xuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHByZWNpc2lvbikpIHtcbiAgICAgIHByZWNpc2lvbiA9IDA7XG4gICAgfVxuICAgIHRoaXMuX3ByZWNpc2lvbiA9IE1hdGguYWJzKE1hdGgudHJ1bmMocHJlY2lzaW9uKSk7XG4gICAgdGhpcy5tdWx0aXBsaWVyID0gMTAgKiogdGhpcy5fcHJlY2lzaW9uO1xuICB9XG5cbiAgcm91bmQoeDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC50cnVuYyh4ICogdGhpcy5tdWx0aXBsaWVyKSAvIHRoaXMubXVsdGlwbGllcjtcbiAgfVxuXG4gIHJvdW5kZXIoKTogUm91bmRlciB7XG4gICAgcmV0dXJuICh4OiBudW1iZXIpOiBudW1iZXIgPT4gdGhpcy5yb3VuZCh4KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcHJlY2lzaW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3ByZWNpc2lvbjtcbiAgfVxuXG4gIHRvSlNPTigpOiBQcmVjaXNpb25TZXJpYWxpemVkIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJlY2lzaW9uOiB0aGlzLl9wcmVjaXNpb24sXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBGcm9tSlNPTihzOiBQcmVjaXNpb25TZXJpYWxpemVkIHwgdW5kZWZpbmVkKTogUHJlY2lzaW9uIHtcbiAgICBpZiAocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IFByZWNpc2lvbigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFByZWNpc2lvbihzLnByZWNpc2lvbik7XG4gIH1cbn1cbiIsICIvLyBVdGlsaXRpZXMgZm9yIGRlYWxpbmcgd2l0aCBhIHJhbmdlIG9mIG51bWJlcnMuXG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0cmljUmFuZ2VTZXJpYWxpemVkIHtcbiAgbWluOiBudW1iZXI7XG4gIG1heDogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgY2xhbXAgPSAoeDogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIgPT4ge1xuICBpZiAoeCA+IG1heCkge1xuICAgIHJldHVybiBtYXg7XG4gIH1cbiAgaWYgKHggPCBtaW4pIHtcbiAgICByZXR1cm4gbWluO1xuICB9XG4gIHJldHVybiB4O1xufTtcblxuLy8gUmFuZ2UgZGVmaW5lcyBhIHJhbmdlIG9mIG51bWJlcnMsIGZyb20gW21pbiwgbWF4XSBpbmNsdXNpdmUuXG5leHBvcnQgY2xhc3MgTWV0cmljUmFuZ2Uge1xuICBwcml2YXRlIF9taW46IG51bWJlciA9IC1OdW1iZXIuTUFYX1ZBTFVFO1xuICBwcml2YXRlIF9tYXg6IG51bWJlciA9IE51bWJlci5NQVhfVkFMVUU7XG5cbiAgY29uc3RydWN0b3IobWluOiBudW1iZXIgPSAtTnVtYmVyLk1BWF9WQUxVRSwgbWF4OiBudW1iZXIgPSBOdW1iZXIuTUFYX1ZBTFVFKSB7XG4gICAgaWYgKG1heCA8IG1pbikge1xuICAgICAgW21pbiwgbWF4XSA9IFttYXgsIG1pbl07XG4gICAgfVxuICAgIHRoaXMuX21pbiA9IG1pbjtcbiAgICB0aGlzLl9tYXggPSBtYXg7XG4gIH1cblxuICBjbGFtcCh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gY2xhbXAodmFsdWUsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWluKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21pbjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWF4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21heDtcbiAgfVxuXG4gIHRvSlNPTigpOiBNZXRyaWNSYW5nZVNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICBtaW46IHRoaXMuX21pbixcbiAgICAgIG1heDogdGhpcy5fbWF4LFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgRnJvbUpTT04oczogTWV0cmljUmFuZ2VTZXJpYWxpemVkIHwgdW5kZWZpbmVkKTogTWV0cmljUmFuZ2Uge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgTWV0cmljUmFuZ2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBNZXRyaWNSYW5nZShzLm1pbiwgcy5tYXgpO1xuICB9XG59XG4iLCAiLy8gTWV0cmljcyBkZWZpbmUgZmxvYXRpbmcgcG9pbnQgdmFsdWVzIHRoYXQgYXJlIHRyYWNrZWQgcGVyIFRhc2suXG5cbmltcG9ydCB7IFByZWNpc2lvbiwgUHJlY2lzaW9uU2VyaWFsaXplZCB9IGZyb20gXCIuLi9wcmVjaXNpb24vcHJlY2lzaW9uLnRzXCI7XG5pbXBvcnQgeyBjbGFtcCwgTWV0cmljUmFuZ2UsIE1ldHJpY1JhbmdlU2VyaWFsaXplZCB9IGZyb20gXCIuL3JhbmdlLnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICByYW5nZTogTWV0cmljUmFuZ2VTZXJpYWxpemVkO1xuICBkZWZhdWx0OiBudW1iZXI7XG4gIHByZWNpc2lvbjogUHJlY2lzaW9uU2VyaWFsaXplZDtcbn1cblxuZXhwb3J0IGNsYXNzIE1ldHJpY0RlZmluaXRpb24ge1xuICByYW5nZTogTWV0cmljUmFuZ2U7XG4gIGRlZmF1bHQ6IG51bWJlcjtcbiAgaXNTdGF0aWM6IGJvb2xlYW47XG4gIHByZWNpc2lvbjogUHJlY2lzaW9uO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGRlZmF1bHRWYWx1ZTogbnVtYmVyLFxuICAgIHJhbmdlOiBNZXRyaWNSYW5nZSA9IG5ldyBNZXRyaWNSYW5nZSgpLFxuICAgIGlzU3RhdGljOiBib29sZWFuID0gZmFsc2UsXG4gICAgcHJlY2lzaW9uOiBQcmVjaXNpb24gPSBuZXcgUHJlY2lzaW9uKDEpXG4gICkge1xuICAgIHRoaXMucmFuZ2UgPSByYW5nZTtcbiAgICB0aGlzLmRlZmF1bHQgPSBjbGFtcChkZWZhdWx0VmFsdWUsIHJhbmdlLm1pbiwgcmFuZ2UubWF4KTtcbiAgICB0aGlzLmlzU3RhdGljID0gaXNTdGF0aWM7XG4gICAgdGhpcy5wcmVjaXNpb24gPSBwcmVjaXNpb247XG4gIH1cblxuICB0b0pTT04oKTogTWV0cmljRGVmaW5pdGlvblNlcmlhbGl6ZWQge1xuICAgIHJldHVybiB7XG4gICAgICByYW5nZTogdGhpcy5yYW5nZS50b0pTT04oKSxcbiAgICAgIGRlZmF1bHQ6IHRoaXMuZGVmYXVsdCxcbiAgICAgIHByZWNpc2lvbjogdGhpcy5wcmVjaXNpb24udG9KU09OKCksXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBGcm9tSlNPTihzOiBNZXRyaWNEZWZpbml0aW9uU2VyaWFsaXplZCB8IHVuZGVmaW5lZCk6IE1ldHJpY0RlZmluaXRpb24ge1xuICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBuZXcgTWV0cmljRGVmaW5pdGlvbigwKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBNZXRyaWNEZWZpbml0aW9uKFxuICAgICAgcy5kZWZhdWx0IHx8IDAsXG4gICAgICBNZXRyaWNSYW5nZS5Gcm9tSlNPTihzLnJhbmdlKSxcbiAgICAgIGZhbHNlLFxuICAgICAgUHJlY2lzaW9uLkZyb21KU09OKHMucHJlY2lzaW9uKVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgTWV0cmljRGVmaW5pdGlvbnMgPSB7IFtrZXk6IHN0cmluZ106IE1ldHJpY0RlZmluaXRpb24gfTtcblxuZXhwb3J0IHR5cGUgTWV0cmljRGVmaW5pdGlvbnNTZXJpYWxpemVkID0ge1xuICBba2V5OiBzdHJpbmddOiBNZXRyaWNEZWZpbml0aW9uU2VyaWFsaXplZDtcbn07XG5cbmV4cG9ydCB0eXBlIE1ldHJpY1ZhbHVlcyA9IHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH07XG4iLCAiaW1wb3J0IHsgUmVzdWx0LCBvaywgZXJyb3IgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgQ2hhcnQsIFRhc2ssIFRhc2tTdGF0ZSB9IGZyb20gXCIuLi9jaGFydC9jaGFydC50c1wiO1xuaW1wb3J0IHsgT3AsIFN1Yk9wLCBTdWJPcFJlc3VsdCB9IGZyb20gXCIuL29wcy50c1wiO1xuXG4vKiogQSB2YWx1ZSBvZiAtMSBmb3IgaiBtZWFucyB0aGUgRmluaXNoIE1pbGVzdG9uZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEaXJlY3RlZEVkZ2VGb3JQbGFuKFxuICBpOiBudW1iZXIsXG4gIGo6IG51bWJlcixcbiAgcGxhbjogUGxhblxuKTogUmVzdWx0PERpcmVjdGVkRWRnZT4ge1xuICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gIGlmIChqID09PSAtMSkge1xuICAgIGogPSBjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuICB9XG4gIGlmIChpIDwgMCB8fCBpID49IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCkge1xuICAgIHJldHVybiBlcnJvcihcbiAgICAgIGBpIGluZGV4IG91dCBvZiByYW5nZTogJHtpfSBub3QgaW4gWzAsICR7Y2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMX1dYFxuICAgICk7XG4gIH1cbiAgaWYgKGogPCAwIHx8IGogPj0gY2hhcnQuVmVydGljZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGVycm9yKFxuICAgICAgYGogaW5kZXggb3V0IG9mIHJhbmdlOiAke2p9IG5vdCBpbiBbMCwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxfV1gXG4gICAgKTtcbiAgfVxuICBpZiAoaSA9PT0gaikge1xuICAgIHJldHVybiBlcnJvcihgQSBUYXNrIGNhbiBub3QgZGVwZW5kIG9uIGl0c2VsZjogJHtpfSA9PT0gJHtqfWApO1xuICB9XG4gIHJldHVybiBvayhuZXcgRGlyZWN0ZWRFZGdlKGksIGopKTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZEVkZ2VTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaTogbnVtYmVyID0gMDtcbiAgajogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpOiBudW1iZXIsIGo6IG51bWJlcikge1xuICAgIHRoaXMuaSA9IGk7XG4gICAgdGhpcy5qID0gajtcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGlmICh0aGlzLmkgPT09IC0xKSB7XG4gICAgICB0aGlzLmkgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuICAgIGlmICh0aGlzLmogPT09IC0xKSB7XG4gICAgICB0aGlzLmogPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gICAgfVxuXG4gICAgY29uc3QgZSA9IERpcmVjdGVkRWRnZUZvclBsYW4odGhpcy5pLCB0aGlzLmosIHBsYW4pO1xuICAgIGlmICghZS5vaykge1xuICAgICAgcmV0dXJuIGU7XG4gICAgfVxuXG4gICAgLy8gT25seSBhZGQgdGhlIGVkZ2UgaWYgaXQgZG9lc24ndCBleGlzdHMgYWxyZWFkeS5cbiAgICBpZiAoIXBsYW4uY2hhcnQuRWRnZXMuZmluZCgodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gdmFsdWUuZXF1YWwoZS52YWx1ZSkpKSB7XG4gICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2goZS52YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmVtb3ZlRWRnZVN1cE9wKHRoaXMuaSwgdGhpcy5qKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVtb3ZlRWRnZVN1cE9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpOiBudW1iZXIgPSAwO1xuICBqOiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGk6IG51bWJlciwgajogbnVtYmVyKSB7XG4gICAgdGhpcy5pID0gaTtcbiAgICB0aGlzLmogPSBqO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgaWYgKHRoaXMuaSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaSA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaiA9PT0gLTEpIHtcbiAgICAgIHRoaXMuaiA9IHBsYW4uY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMTtcbiAgICB9XG5cbiAgICBjb25zdCBlID0gRGlyZWN0ZWRFZGdlRm9yUGxhbih0aGlzLmksIHRoaXMuaiwgcGxhbik7XG4gICAgaWYgKCFlLm9rKSB7XG4gICAgICByZXR1cm4gZTtcbiAgICB9XG4gICAgcGxhbi5jaGFydC5FZGdlcyA9IHBsYW4uY2hhcnQuRWRnZXMuZmlsdGVyKFxuICAgICAgKHY6IERpcmVjdGVkRWRnZSk6IGJvb2xlYW4gPT4gIXYuZXF1YWwoZS52YWx1ZSlcbiAgICApO1xuXG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgQWRkRWRnZVN1Yk9wKHRoaXMuaSwgdGhpcy5qKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyhpbmRleDogbnVtYmVyLCBjaGFydDogQ2hhcnQpOiBSZXN1bHQ8bnVsbD4ge1xuICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID4gY2hhcnQuVmVydGljZXMubGVuZ3RoIC0gMikge1xuICAgIHJldHVybiBlcnJvcihgJHtpbmRleH0gaXMgbm90IGluIHJhbmdlIFswLCAke2NoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDJ9XWApO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn1cblxuZnVuY3Rpb24gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUoXG4gIGluZGV4OiBudW1iZXIsXG4gIGNoYXJ0OiBDaGFydFxuKTogUmVzdWx0PG51bGw+IHtcbiAgaWYgKGluZGV4IDwgMSB8fCBpbmRleCA+IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aCAtIDIpIHtcbiAgICByZXR1cm4gZXJyb3IoYCR7aW5kZXh9IGlzIG5vdCBpbiByYW5nZSBbMSwgJHtjaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAyfV1gKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRUYXNrQWZ0ZXJTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgaW5kZXg6IG51bWJlciA9IDA7XG4gIGZ1bGxUYXNrVG9CZVJlc3RvcmVkOiBGdWxsVGFza1RvQmVSZXN0b3JlZCB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgaW5kZXg6IG51bWJlcixcbiAgICBmdWxsVGFza1RvQmVSZXN0b3JlZDogRnVsbFRhc2tUb0JlUmVzdG9yZWQgfCBudWxsID0gbnVsbFxuICApIHtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5mdWxsVGFza1RvQmVSZXN0b3JlZCA9IGZ1bGxUYXNrVG9CZVJlc3RvcmVkO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgbGV0IHRhc2sgPSBwbGFuLm5ld1Rhc2soKTtcbiAgICBpZiAodGhpcy5mdWxsVGFza1RvQmVSZXN0b3JlZCAhPT0gbnVsbCkge1xuICAgICAgdGFzayA9IHRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQudGFzaztcbiAgICB9XG4gICAgcGxhbi5jaGFydC5WZXJ0aWNlcy5zcGxpY2UodGhpcy5pbmRleCArIDEsIDAsIHRhc2spO1xuXG4gICAgLy8gVXBkYXRlIEVkZ2VzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgIGlmIChlZGdlLmkgPj0gdGhpcy5pbmRleCArIDEpIHtcbiAgICAgICAgZWRnZS5pKys7XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID49IHRoaXMuaW5kZXggKyAxKSB7XG4gICAgICAgIGVkZ2UuaisrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmZ1bGxUYXNrVG9CZVJlc3RvcmVkICE9PSBudWxsKSB7XG4gICAgICBjaGFydC5FZGdlcy5wdXNoKC4uLnRoaXMuZnVsbFRhc2tUb0JlUmVzdG9yZWQuZWRnZXMpO1xuICAgIH1cblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVUYXNrU3ViT3AodGhpcy5pbmRleCArIDEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXBUYXNrU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGluZGV4OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCBjaGFydCA9IHBsYW4uY2hhcnQ7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUodGhpcy5pbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGNvbnN0IGNvcHkgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMuaW5kZXhdLmR1cCgpO1xuICAgIC8vIEluc2VydCB0aGUgZHVwbGljYXRlIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBUYXNrIGl0IGlzIGNvcGllZCBmcm9tLlxuICAgIHBsYW4uY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXgsIDAsIGNvcHkpO1xuXG4gICAgLy8gVXBkYXRlIEVkZ2VzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhcnQuRWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgIGlmIChlZGdlLmkgPiB0aGlzLmluZGV4KSB7XG4gICAgICAgIGVkZ2UuaSsrO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5qKys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZSgpIH0pO1xuICB9XG5cbiAgaW52ZXJzZSgpOiBTdWJPcCB7XG4gICAgcmV0dXJuIG5ldyBEZWxldGVUYXNrU3ViT3AodGhpcy5pbmRleCArIDEpO1xuICB9XG59XG5cbnR5cGUgU3Vic3RpdHV0aW9uID0gTWFwPERpcmVjdGVkRWRnZSwgRGlyZWN0ZWRFZGdlPjtcblxuZXhwb3J0IGNsYXNzIE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIGZyb21UYXNrSW5kZXg6IG51bWJlciA9IDA7XG4gIHRvVGFza0luZGV4OiBudW1iZXIgPSAwO1xuICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGZyb21UYXNrSW5kZXg6IG51bWJlcixcbiAgICB0b1Rhc2tJbmRleDogbnVtYmVyLFxuICAgIGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb24gPSBuZXcgTWFwKClcbiAgKSB7XG4gICAgdGhpcy5mcm9tVGFza0luZGV4ID0gZnJvbVRhc2tJbmRleDtcbiAgICB0aGlzLnRvVGFza0luZGV4ID0gdG9UYXNrSW5kZXg7XG4gICAgdGhpcy5hY3R1YWxNb3ZlcyA9IGFjdHVhbE1vdmVzO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGxldCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlc0V4Y2x1c2l2ZSh0aGlzLmZyb21UYXNrSW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXNFeGNsdXNpdmUodGhpcy50b1Rhc2tJbmRleCwgY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmFjdHVhbE1vdmVzLnZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnN0IGFjdHVhbE1vdmVzOiBTdWJzdGl0dXRpb24gPSBuZXcgTWFwKCk7XG4gICAgICAvLyBVcGRhdGUgYWxsIEVkZ2VzIHRoYXQgc3RhcnQgYXQgJ2Zyb21UYXNrSW5kZXgnIGFuZCBjaGFuZ2UgdGhlIHN0YXJ0IHRvICd0b1Rhc2tJbmRleCcuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXJ0LkVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVkZ2UgPSBjaGFydC5FZGdlc1tpXTtcbiAgICAgICAgLy8gU2tpcCB0aGUgY29ybmVyIGNhc2UgdGhlcmUgZnJvbVRhc2tJbmRleCBwb2ludHMgdG8gVGFza0luZGV4LlxuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21UYXNrSW5kZXggJiYgZWRnZS5qID09PSB0aGlzLnRvVGFza0luZGV4KSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLmZyb21UYXNrSW5kZXgpIHtcbiAgICAgICAgICBhY3R1YWxNb3Zlcy5zZXQoXG4gICAgICAgICAgICBuZXcgRGlyZWN0ZWRFZGdlKHRoaXMudG9UYXNrSW5kZXgsIGVkZ2UuaiksXG4gICAgICAgICAgICBuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgZWRnZS5qKVxuICAgICAgICAgICk7XG4gICAgICAgICAgZWRnZS5pID0gdGhpcy50b1Rhc2tJbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9rKHtcbiAgICAgICAgcGxhbjogcGxhbixcbiAgICAgICAgaW52ZXJzZTogdGhpcy5pbnZlcnNlKFxuICAgICAgICAgIHRoaXMudG9UYXNrSW5kZXgsXG4gICAgICAgICAgdGhpcy5mcm9tVGFza0luZGV4LFxuICAgICAgICAgIGFjdHVhbE1vdmVzXG4gICAgICAgICksXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBuZXdFZGdlID0gdGhpcy5hY3R1YWxNb3Zlcy5nZXQocGxhbi5jaGFydC5FZGdlc1tpXSk7XG4gICAgICAgIGlmIChuZXdFZGdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzW2ldID0gbmV3RWRnZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2soe1xuICAgICAgICBwbGFuOiBwbGFuLFxuICAgICAgICBpbnZlcnNlOiBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcChcbiAgICAgICAgICB0aGlzLnRvVGFza0luZGV4LFxuICAgICAgICAgIHRoaXMuZnJvbVRhc2tJbmRleFxuICAgICAgICApLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgaW52ZXJzZShcbiAgICB0b1Rhc2tJbmRleDogbnVtYmVyLFxuICAgIGZyb21UYXNrSW5kZXg6IG51bWJlcixcbiAgICBhY3R1YWxNb3ZlczogU3Vic3RpdHV0aW9uXG4gICk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IE1vdmVBbGxPdXRnb2luZ0VkZ2VzRnJvbVRvU3ViT3AoXG4gICAgICB0b1Rhc2tJbmRleCxcbiAgICAgIGZyb21UYXNrSW5kZXgsXG4gICAgICBhY3R1YWxNb3Zlc1xuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvcHlBbGxFZGdlc0Zyb21Ub1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBmcm9tSW5kZXg6IG51bWJlciA9IDA7XG4gIHRvSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IoZnJvbUluZGV4OiBudW1iZXIsIHRvSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuZnJvbUluZGV4ID0gZnJvbUluZGV4O1xuICAgIHRoaXMudG9JbmRleCA9IHRvSW5kZXg7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLmZyb21JbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3RWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgcGxhbi5jaGFydC5FZGdlcy5mb3JFYWNoKChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChlZGdlLmkgPT09IHRoaXMuZnJvbUluZGV4KSB7XG4gICAgICAgIG5ld0VkZ2VzLnB1c2gobmV3IERpcmVjdGVkRWRnZSh0aGlzLnRvSW5kZXgsIGVkZ2UuaikpO1xuICAgICAgfVxuICAgICAgaWYgKGVkZ2UuaiA9PT0gdGhpcy5mcm9tSW5kZXgpIHtcbiAgICAgICAgbmV3RWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKGVkZ2UuaSwgdGhpcy50b0luZGV4KSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLm5ld0VkZ2VzKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBSZW1vdmVBbGxFZGdlc1N1Yk9wKG5ld0VkZ2VzKSB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVtb3ZlQWxsRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuXG4gIGNvbnN0cnVjdG9yKGVkZ2VzOiBEaXJlY3RlZEVkZ2VbXSkge1xuICAgIHRoaXMuZWRnZXMgPSBlZGdlcztcbiAgfVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgIChlZGdlOiBEaXJlY3RlZEVkZ2UpID0+XG4gICAgICAgIC0xID09PVxuICAgICAgICB0aGlzLmVkZ2VzLmZpbmRJbmRleCgodG9CZVJlbW92ZWQ6IERpcmVjdGVkRWRnZSkgPT5cbiAgICAgICAgICBlZGdlLmVxdWFsKHRvQmVSZW1vdmVkKVxuICAgICAgICApXG4gICAgKTtcblxuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IG5ldyBBZGRBbGxFZGdlc1N1Yk9wKHRoaXMuZWRnZXMpIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBZGRBbGxFZGdlc1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBlZGdlczogRGlyZWN0ZWRFZGdlW107XG5cbiAgY29uc3RydWN0b3IoZWRnZXM6IERpcmVjdGVkRWRnZVtdKSB7XG4gICAgdGhpcy5lZGdlcyA9IGVkZ2VzO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgcGxhbi5jaGFydC5FZGdlcy5wdXNoKC4uLnRoaXMuZWRnZXMpO1xuXG4gICAgcmV0dXJuIG9rKHsgcGxhbjogcGxhbiwgaW52ZXJzZTogbmV3IFJlbW92ZUFsbEVkZ2VzU3ViT3AodGhpcy5lZGdlcykgfSk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIEZ1bGxUYXNrVG9CZVJlc3RvcmVkIHtcbiAgZWRnZXM6IERpcmVjdGVkRWRnZVtdO1xuICB0YXNrOiBUYXNrO1xufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlVGFza1N1Yk9wIGltcGxlbWVudHMgU3ViT3Age1xuICBpbmRleDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgY2hhcnQgPSBwbGFuLmNoYXJ0O1xuICAgIGNvbnN0IHJldCA9IGluZGV4SW5SYW5nZUZvclZlcnRpY2VzKHRoaXMuaW5kZXgsIGNoYXJ0KTtcbiAgICBpZiAoIXJldC5vaykge1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjb25zdCBlZGdlc1RvQmVSZXN0b3JlZCA9IGNoYXJ0LkVkZ2VzLmZpbHRlcigoZGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgaWYgKGRlLmkgPT09IHRoaXMuaW5kZXggfHwgZGUuaiA9PT0gdGhpcy5pbmRleCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgIC8vIEZpcnN0IHJlbW92ZSBhbGwgZWRnZXMgdG8gYW5kIGZyb20gdGhlIHRhc2suXG4gICAgY2hhcnQuRWRnZXMgPSBjaGFydC5FZGdlcy5maWx0ZXIoKGRlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICAgIGlmIChkZS5pID09PSB0aGlzLmluZGV4IHx8IGRlLmogPT09IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICAvLyBVcGRhdGUgZWRnZXMgZm9yIHRhc2tzIHRoYXQgd2lsbCBlbmQgdXAgYXQgYSBuZXcgaW5kZXguXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFydC5FZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZWRnZSA9IGNoYXJ0LkVkZ2VzW2ldO1xuICAgICAgaWYgKGVkZ2UuaSA+IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgZWRnZS5pLS07XG4gICAgICB9XG4gICAgICBpZiAoZWRnZS5qID4gdGhpcy5pbmRleCkge1xuICAgICAgICBlZGdlLmotLTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0YXNrVG9CZVJlc3RvcmVkID0gY2hhcnQuVmVydGljZXMuc3BsaWNlKHRoaXMuaW5kZXgsIDEpO1xuICAgIGNvbnN0IGZ1bGxUYXNrVG9CZVJlc3RvcmVkID0ge1xuICAgICAgZWRnZXM6IGVkZ2VzVG9CZVJlc3RvcmVkLFxuICAgICAgdGFzazogdGFza1RvQmVSZXN0b3JlZFswXSxcbiAgICB9O1xuICAgIHJldHVybiBvayh7IHBsYW46IHBsYW4sIGludmVyc2U6IHRoaXMuaW52ZXJzZShmdWxsVGFza1RvQmVSZXN0b3JlZCkgfSk7XG4gIH1cblxuICBpbnZlcnNlKGZ1bGxUYXNrVG9CZVJlc3RvcmVkOiBGdWxsVGFza1RvQmVSZXN0b3JlZCk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IEFkZFRhc2tBZnRlclN1Yk9wKHRoaXMuaW5kZXggLSAxLCBmdWxsVGFza1RvQmVSZXN0b3JlZCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJhdGlvbmFsaXplRWRnZXNTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIGFwcGx5VG8ocGxhbjogUGxhbik6IFJlc3VsdDxTdWJPcFJlc3VsdD4ge1xuICAgIGNvbnN0IHNyY0FuZERzdCA9IGVkZ2VzQnlTcmNBbmREc3RUb01hcChwbGFuLmNoYXJ0LkVkZ2VzKTtcbiAgICBjb25zdCBTdGFydCA9IDA7XG4gICAgY29uc3QgRmluaXNoID0gcGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxO1xuXG4gICAgLy8gbG9vcCBvdmVyIGFsbCB2ZXJ0aWNzIGZyb20gW1N0YXJ0LCBGaW5pc2gpIGFuZCBsb29rIGZvciB0aGVpclxuICAgIC8vIGRlc3RpbmF0aW9ucy4gSWYgdGhleSBoYXZlIG5vbmUgdGhlbiBhZGQgaW4gYW4gZWRnZSB0byBGaW5pc2guIElmIHRoZXlcbiAgICAvLyBoYXZlIG1vcmUgdGhhbiBvbmUgdGhlbiByZW1vdmUgYW55IGxpbmtzIHRvIEZpbmlzaC5cbiAgICBmb3IgKGxldCBpID0gU3RhcnQ7IGkgPCBGaW5pc2g7IGkrKykge1xuICAgICAgY29uc3QgZGVzdGluYXRpb25zID0gc3JjQW5kRHN0LmJ5U3JjLmdldChpKTtcbiAgICAgIGlmIChkZXN0aW5hdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCB0b0JlQWRkZWQgPSBuZXcgRGlyZWN0ZWRFZGdlKGksIEZpbmlzaCk7XG4gICAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaCh0b0JlQWRkZWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQXJlIHRoZXJlIGFueSB1bmVlZGVkIEVnZGVzIHRvIEZpbmlzaD8gSWYgc28gZmlsdGVyIHRoZW0gb3V0LlxuICAgICAgICBpZiAoXG4gICAgICAgICAgZGVzdGluYXRpb25zLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICBkZXN0aW5hdGlvbnMuZmluZCgodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gdmFsdWUuaiA9PT0gRmluaXNoKVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCB0b0JlUmVtb3ZlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoaSwgRmluaXNoKTtcbiAgICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhbi5jaGFydC5FZGdlcy5maWx0ZXIoXG4gICAgICAgICAgICAodmFsdWU6IERpcmVjdGVkRWRnZSkgPT4gIXRvQmVSZW1vdmVkLmVxdWFsKHZhbHVlKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBsb29wIG92ZXIgYWxsIHZlcnRpY3MgZnJvbShTdGFydCwgRmluaXNoXSBhbmQgbG9vayBmb3IgdGhlaXIgc291cmNlcy4gSWZcbiAgICAvLyB0aGV5IGhhdmUgbm9uZSB0aGVuIGFkZCBpbiBhbiBlZGdlIGZyb20gU3RhcnQuIElmIHRoZXkgaGF2ZSBtb3JlIHRoYW4gb25lXG4gICAgLy8gdGhlbiByZW1vdmUgYW55IGxpbmtzIGZyb20gU3RhcnQuXG4gICAgZm9yIChsZXQgaSA9IFN0YXJ0ICsgMTsgaSA8IEZpbmlzaDsgaSsrKSB7XG4gICAgICBjb25zdCBkZXN0aW5hdGlvbnMgPSBzcmNBbmREc3QuYnlEc3QuZ2V0KGkpO1xuICAgICAgaWYgKGRlc3RpbmF0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHRvQmVBZGRlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIGkpO1xuICAgICAgICBwbGFuLmNoYXJ0LkVkZ2VzLnB1c2godG9CZUFkZGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFyZSB0aGVyZSBhbnkgdW4tbmVlZGVkIEVnZGVzIGZyb20gU3RhcnQ/IElmIHNvIGZpbHRlciB0aGVtIG91dC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRlc3RpbmF0aW9ucy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgZGVzdGluYXRpb25zLmZpbmQoKHZhbHVlOiBEaXJlY3RlZEVkZ2UpID0+IHZhbHVlLmkgPT09IFN0YXJ0KVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCB0b0JlUmVtb3ZlZCA9IG5ldyBEaXJlY3RlZEVkZ2UoU3RhcnQsIGkpO1xuICAgICAgICAgIHBsYW4uY2hhcnQuRWRnZXMgPSBwbGFuLmNoYXJ0LkVkZ2VzLmZpbHRlcihcbiAgICAgICAgICAgICh2YWx1ZTogRGlyZWN0ZWRFZGdlKSA9PiAhdG9CZVJlbW92ZWQuZXF1YWwodmFsdWUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAocGxhbi5jaGFydC5FZGdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHBsYW4uY2hhcnQuRWRnZXMucHVzaChuZXcgRGlyZWN0ZWRFZGdlKFN0YXJ0LCBGaW5pc2gpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2soeyBwbGFuOiBwbGFuLCBpbnZlcnNlOiB0aGlzLmludmVyc2UoKSB9KTtcbiAgfVxuXG4gIGludmVyc2UoKTogU3ViT3Age1xuICAgIHJldHVybiBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFRhc2tOYW1lU3ViT3AgaW1wbGVtZW50cyBTdWJPcCB7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuICBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IodGFza0luZGV4OiBudW1iZXIsIG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICBhcHBseVRvKHBsYW46IFBsYW4pOiBSZXN1bHQ8U3ViT3BSZXN1bHQ+IHtcbiAgICBjb25zdCByZXQgPSBpbmRleEluUmFuZ2VGb3JWZXJ0aWNlcyh0aGlzLnRhc2tJbmRleCwgcGxhbi5jaGFydCk7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGNvbnN0IG9sZE5hbWUgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzW3RoaXMudGFza0luZGV4XS5uYW1lO1xuICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkTmFtZSksXG4gICAgfSk7XG4gIH1cblxuICBpbnZlcnNlKG9sZE5hbWU6IHN0cmluZyk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFRhc2tOYW1lU3ViT3AodGhpcy50YXNrSW5kZXgsIG9sZE5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXRUYXNrU3RhdGVTdWJPcCBpbXBsZW1lbnRzIFN1Yk9wIHtcbiAgdGFza1N0YXRlOiBUYXNrU3RhdGU7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHRhc2tJbmRleDogbnVtYmVyLCB0YXNrU3RhdGU6IFRhc2tTdGF0ZSkge1xuICAgIHRoaXMudGFza0luZGV4ID0gdGFza0luZGV4O1xuICAgIHRoaXMudGFza1N0YXRlID0gdGFza1N0YXRlO1xuICB9XG5cbiAgYXBwbHlUbyhwbGFuOiBQbGFuKTogUmVzdWx0PFN1Yk9wUmVzdWx0PiB7XG4gICAgY29uc3QgcmV0ID0gaW5kZXhJblJhbmdlRm9yVmVydGljZXModGhpcy50YXNrSW5kZXgsIHBsYW4uY2hhcnQpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBjb25zdCBvbGRTdGF0ZSA9IHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLnN0YXRlO1xuICAgIHBsYW4uY2hhcnQuVmVydGljZXNbdGhpcy50YXNrSW5kZXhdLnN0YXRlID0gdGhpcy50YXNrU3RhdGU7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHBsYW46IHBsYW4sXG4gICAgICBpbnZlcnNlOiB0aGlzLmludmVyc2Uob2xkU3RhdGUpLFxuICAgIH0pO1xuICB9XG5cbiAgaW52ZXJzZSh0YXNrU3RhdGU6IFRhc2tTdGF0ZSk6IFN1Yk9wIHtcbiAgICByZXR1cm4gbmV3IFNldFRhc2tTdGF0ZVN1Yk9wKHRoaXMudGFza0luZGV4LCB0YXNrU3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gICAgbmV3IEFkZFRhc2tBZnRlclN1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IEFkZEVkZ2VTdWJPcCgwLCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKHRhc2tJbmRleCArIDEsIC0xKSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V0VGFza05hbWVPcCh0YXNrSW5kZXg6IG51bWJlciwgbmFtZTogc3RyaW5nKTogT3Age1xuICByZXR1cm4gbmV3IE9wKFtuZXcgU2V0VGFza05hbWVTdWJPcCh0YXNrSW5kZXgsIG5hbWUpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRUYXNrU3RhdGVPcCh0YXNrSW5kZXg6IG51bWJlciwgdGFza1N0YXRlOiBUYXNrU3RhdGUpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW25ldyBTZXRUYXNrU3RhdGVTdWJPcCh0YXNrSW5kZXgsIHRhc2tTdGF0ZSldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNwbGl0VGFza09wKHRhc2tJbmRleDogbnVtYmVyKTogT3Age1xuICBjb25zdCBzdWJPcHM6IFN1Yk9wW10gPSBbXG4gICAgbmV3IER1cFRhc2tTdWJPcCh0YXNrSW5kZXgpLFxuICAgIG5ldyBBZGRFZGdlU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgICBuZXcgTW92ZUFsbE91dGdvaW5nRWRnZXNGcm9tVG9TdWJPcCh0YXNrSW5kZXgsIHRhc2tJbmRleCArIDEpLFxuICBdO1xuXG4gIHJldHVybiBuZXcgT3Aoc3ViT3BzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIER1cFRhc2tPcCh0YXNrSW5kZXg6IG51bWJlcik6IE9wIHtcbiAgY29uc3Qgc3ViT3BzOiBTdWJPcFtdID0gW1xuICAgIG5ldyBEdXBUYXNrU3ViT3AodGFza0luZGV4KSxcbiAgICBuZXcgQ29weUFsbEVkZ2VzRnJvbVRvU3ViT3AodGFza0luZGV4LCB0YXNrSW5kZXggKyAxKSxcbiAgXTtcblxuICByZXR1cm4gbmV3IE9wKHN1Yk9wcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGVUYXNrT3AodGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgRGVsZXRlVGFza1N1Yk9wKHRhc2tJbmRleCksXG4gICAgbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpLFxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFkZEVkZ2VPcChmcm9tVGFza0luZGV4OiBudW1iZXIsIHRvVGFza0luZGV4OiBudW1iZXIpOiBPcCB7XG4gIHJldHVybiBuZXcgT3AoW1xuICAgIG5ldyBSYXRpb25hbGl6ZUVkZ2VzU3ViT3AoKSxcbiAgICBuZXcgQWRkRWRnZVN1Yk9wKGZyb21UYXNrSW5kZXgsIHRvVGFza0luZGV4KSxcbiAgICBuZXcgUmF0aW9uYWxpemVFZGdlc1N1Yk9wKCksXG4gIF0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmF0aW9uYWxpemVFZGdlc09wKCk6IE9wIHtcbiAgcmV0dXJuIG5ldyBPcChbbmV3IFJhdGlvbmFsaXplRWRnZXNTdWJPcCgpXSk7XG59XG4iLCAiLyoqXG4gKiBUcmlhbmd1bGFyIGlzIHRoZSBpbnZlcnNlIEN1bXVsYXRpdmUgRGVuc2l0eSBGdW5jdGlvbiAoQ0RGKSBmb3IgdGhlXG4gKiB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ucmlhbmd1bGFyX2Rpc3RyaWJ1dGlvbiNHZW5lcmF0aW5nX3JhbmRvbV92YXJpYXRlc1xuICpcbiAqIFRoZSBpbnZlcnNlIG9mIHRoZSBDREYgaXMgdXNlZnVsIGZvciBnZW5lcmF0aW5nIHNhbXBsZXMgZnJvbSB0aGVcbiAqIGRpc3RyaWJ1dGlvbiwgaS5lLiBwYXNzaW5nIGluIHZhbHVlcyBmcm9tIHRoZSB1bmlmb3JtIGRpc3RyaWJ1dGlvbiBbMCwgMV1cbiAqIHdpbGwgcHJvZHVjZSBzYW1wbGUgdGhhdCBsb29rIGxpa2UgdGhleSBjb21lIGZyb20gdGhlIHRyaWFuZ3VsYXJcbiAqIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKlxuICovXG5cbmV4cG9ydCBjbGFzcyBUcmlhbmd1bGFyIHtcbiAgcHJpdmF0ZSBhOiBudW1iZXI7XG4gIHByaXZhdGUgYjogbnVtYmVyO1xuICBwcml2YXRlIGM6IG51bWJlcjtcbiAgcHJpdmF0ZSBGX2M6IG51bWJlcjtcblxuICAvKiogIFRoZSB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbiBpcyBhIGNvbnRpbnVvdXMgcHJvYmFiaWxpdHkgZGlzdHJpYnV0aW9uIHdpdGhcbiAgbG93ZXIgbGltaXQgYGFgLCB1cHBlciBsaW1pdCBgYmAsIGFuZCBtb2RlIGBjYCwgd2hlcmUgYSA8IGIgYW5kIGEgXHUyMjY0IGMgXHUyMjY0IGIuICovXG4gIGNvbnN0cnVjdG9yKGE6IG51bWJlciwgYjogbnVtYmVyLCBjOiBudW1iZXIpIHtcbiAgICB0aGlzLmEgPSBhO1xuICAgIHRoaXMuYiA9IGI7XG4gICAgdGhpcy5jID0gYztcblxuICAgIC8vIEZfYyBpcyB0aGUgY3V0b2ZmIGluIHRoZSBkb21haW4gd2hlcmUgd2Ugc3dpdGNoIGJldHdlZW4gdGhlIHR3byBoYWx2ZXMgb2ZcbiAgICAvLyB0aGUgdHJpYW5nbGUuXG4gICAgdGhpcy5GX2MgPSAoYyAtIGEpIC8gKGIgLSBhKTtcbiAgfVxuXG4gIC8qKiAgUHJvZHVjZSBhIHNhbXBsZSBmcm9tIHRoZSB0cmlhbmd1bGFyIGRpc3RyaWJ1dGlvbi4gVGhlIHZhbHVlIG9mICdwJ1xuICAgc2hvdWxkIGJlIGluIFswLCAxLjBdLiAqL1xuICBzYW1wbGUocDogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBpZiAocCA8IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH0gZWxzZSBpZiAocCA+IDEuMCkge1xuICAgICAgcmV0dXJuIDEuMDtcbiAgICB9IGVsc2UgaWYgKHAgPCB0aGlzLkZfYykge1xuICAgICAgcmV0dXJuIHRoaXMuYSArIE1hdGguc3FydChwICogKHRoaXMuYiAtIHRoaXMuYSkgKiAodGhpcy5jIC0gdGhpcy5hKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMuYiAtIE1hdGguc3FydCgoMSAtIHApICogKHRoaXMuYiAtIHRoaXMuYSkgKiAodGhpcy5iIC0gdGhpcy5jKSlcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHsgVHJpYW5ndWxhciB9IGZyb20gXCIuL3RyaWFuZ3VsYXIudHNcIjtcblxuZXhwb3J0IHR5cGUgVW5jZXJ0YWludHkgPSBcImxvd1wiIHwgXCJtb2RlcmF0ZVwiIHwgXCJoaWdoXCIgfCBcImV4dHJlbWVcIjtcblxuZXhwb3J0IGNvbnN0IFVuY2VydGFpbnR5VG9OdW06IFJlY29yZDxVbmNlcnRhaW50eSwgbnVtYmVyPiA9IHtcbiAgbG93OiAxLjEsXG4gIG1vZGVyYXRlOiAxLjUsXG4gIGhpZ2g6IDIsXG4gIGV4dHJlbWU6IDUsXG59O1xuXG5leHBvcnQgY2xhc3MgSmFjb2JpYW4ge1xuICBwcml2YXRlIHRyaWFuZ3VsYXI6IFRyaWFuZ3VsYXI7XG4gIGNvbnN0cnVjdG9yKGV4cGVjdGVkOiBudW1iZXIsIHVuY2VydGFpbnR5OiBVbmNlcnRhaW50eSkge1xuICAgIGNvbnN0IG11bCA9IFVuY2VydGFpbnR5VG9OdW1bdW5jZXJ0YWludHldO1xuICAgIHRoaXMudHJpYW5ndWxhciA9IG5ldyBUcmlhbmd1bGFyKGV4cGVjdGVkIC8gbXVsLCBleHBlY3RlZCAqIG11bCwgZXhwZWN0ZWQpO1xuICB9XG5cbiAgc2FtcGxlKHA6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudHJpYW5ndWxhci5zYW1wbGUocCk7XG4gIH1cbn1cbiIsICJpbXBvcnQge1xuICBDaGFydCxcbiAgQ2hhcnRTZXJpYWxpemVkLFxuICBUYXNrLFxuICBUYXNrU2VyaWFsaXplZCxcbiAgdmFsaWRhdGVDaGFydCxcbn0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIERpcmVjdGVkRWRnZVNlcmlhbGl6ZWQgfSBmcm9tIFwiLi4vZGFnL2RhZy50c1wiO1xuaW1wb3J0IHtcbiAgTWV0cmljRGVmaW5pdGlvbixcbiAgTWV0cmljRGVmaW5pdGlvbnMsXG4gIE1ldHJpY0RlZmluaXRpb25zU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL21ldHJpY3MvbWV0cmljcy50c1wiO1xuaW1wb3J0IHsgTWV0cmljUmFuZ2UgfSBmcm9tIFwiLi4vbWV0cmljcy9yYW5nZS50c1wiO1xuaW1wb3J0IHsgUmF0aW9uYWxpemVFZGdlc09wIH0gZnJvbSBcIi4uL29wcy9jaGFydC50c1wiO1xuaW1wb3J0IHtcbiAgUmVzb3VyY2VEZWZpbml0aW9uLFxuICBSZXNvdXJjZURlZmluaXRpb25zLFxuICBSZXNvdXJjZURlZmluaXRpb25zU2VyaWFsaXplZCxcbn0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBVbmNlcnRhaW50eVRvTnVtIH0gZnJvbSBcIi4uL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuLnRzXCI7XG5cbmV4cG9ydCB0eXBlIFN0YXRpY01ldHJpY0tleXMgPSBcIkR1cmF0aW9uXCIgfCBcIlBlcmNlbnQgQ29tcGxldGVcIjtcblxuZXhwb3J0IGNvbnN0IFN0YXRpY01ldHJpY0RlZmluaXRpb25zOiBNZXRyaWNEZWZpbml0aW9ucyA9IHtcbiAgLy8gSG93IGxvbmcgYSB0YXNrIHdpbGwgdGFrZSwgaW4gZGF5cy5cbiAgRHVyYXRpb246IG5ldyBNZXRyaWNEZWZpbml0aW9uKDAsIG5ldyBNZXRyaWNSYW5nZSgwKSwgdHJ1ZSksXG4gIC8vIFRoZSBwZXJjZW50IGNvbXBsZXRlIGZvciBhIHRhc2suXG4gIFBlcmNlbnQ6IG5ldyBNZXRyaWNEZWZpbml0aW9uKDAsIG5ldyBNZXRyaWNSYW5nZSgwLCAxMDApLCB0cnVlKSxcbn07XG5cbmV4cG9ydCBjb25zdCBTdGF0aWNSZXNvdXJjZURlZmluaXRpb25zOiBSZXNvdXJjZURlZmluaXRpb25zID0ge1xuICBVbmNlcnRhaW50eTogbmV3IFJlc291cmNlRGVmaW5pdGlvbihPYmplY3Qua2V5cyhVbmNlcnRhaW50eVRvTnVtKSwgdHJ1ZSksXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIFBsYW5TZXJpYWxpemVkIHtcbiAgY2hhcnQ6IENoYXJ0U2VyaWFsaXplZDtcbiAgcmVzb3VyY2VEZWZpbml0aW9uczogUmVzb3VyY2VEZWZpbml0aW9uc1NlcmlhbGl6ZWQ7XG4gIG1ldHJpY0RlZmluaXRpb25zOiBNZXRyaWNEZWZpbml0aW9uc1NlcmlhbGl6ZWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBQbGFuIHtcbiAgY2hhcnQ6IENoYXJ0O1xuXG4gIHJlc291cmNlRGVmaW5pdGlvbnM6IFJlc291cmNlRGVmaW5pdGlvbnM7XG5cbiAgbWV0cmljRGVmaW5pdGlvbnM6IE1ldHJpY0RlZmluaXRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY2hhcnQgPSBuZXcgQ2hhcnQoKTtcblxuICAgIHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIFN0YXRpY1Jlc291cmNlRGVmaW5pdGlvbnMpO1xuICAgIHRoaXMubWV0cmljRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBTdGF0aWNNZXRyaWNEZWZpbml0aW9ucyk7XG4gICAgdGhpcy5hcHBseU1ldHJpY3NBbmRSZXNvdXJjZXNUb1ZlcnRpY2VzKCk7XG4gIH1cblxuICBhcHBseU1ldHJpY3NBbmRSZXNvdXJjZXNUb1ZlcnRpY2VzKCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMubWV0cmljRGVmaW5pdGlvbnMpLmZvckVhY2goKG1ldHJpY05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgbWQgPSB0aGlzLm1ldHJpY0RlZmluaXRpb25zW21ldHJpY05hbWVdITtcbiAgICAgIHRoaXMuY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgICB0YXNrLnNldE1ldHJpYyhtZXRyaWNOYW1lLCBtZC5kZWZhdWx0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMucmVzb3VyY2VEZWZpbml0aW9ucykuZm9yRWFjaChcbiAgICAgIChba2V5LCByZXNvdXJjZURlZmluaXRpb25dKSA9PiB7XG4gICAgICAgIHRoaXMuY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaykgPT4ge1xuICAgICAgICAgIHRhc2suc2V0UmVzb3VyY2Uoa2V5LCByZXNvdXJjZURlZmluaXRpb24udmFsdWVzWzBdKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIHRvSlNPTigpOiBQbGFuU2VyaWFsaXplZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNoYXJ0OiB0aGlzLmNoYXJ0LnRvSlNPTigpLFxuICAgICAgcmVzb3VyY2VEZWZpbml0aW9uczogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyh0aGlzLnJlc291cmNlRGVmaW5pdGlvbnMpLmZpbHRlcihcbiAgICAgICAgICAoW2tleSwgcmVzb3VyY2VEZWZpbml0aW9uXSkgPT4gIXJlc291cmNlRGVmaW5pdGlvbi5pc1N0YXRpY1xuICAgICAgICApXG4gICAgICApLFxuICAgICAgbWV0cmljRGVmaW5pdGlvbnM6IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXModGhpcy5tZXRyaWNEZWZpbml0aW9ucylcbiAgICAgICAgICAuZmlsdGVyKChba2V5LCBtZXRyaWNEZWZpbml0aW9uXSkgPT4gIW1ldHJpY0RlZmluaXRpb24uaXNTdGF0aWMpXG4gICAgICAgICAgLm1hcCgoW2tleSwgbWV0cmljRGVmaW5pdGlvbl0pID0+IFtrZXksIG1ldHJpY0RlZmluaXRpb24udG9KU09OKCldKVxuICAgICAgKSxcbiAgICB9O1xuICB9XG5cbiAgZ2V0TWV0cmljRGVmaW5pdGlvbihrZXk6IHN0cmluZyk6IE1ldHJpY0RlZmluaXRpb24gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLm1ldHJpY0RlZmluaXRpb25zW2tleV07XG4gIH1cblxuICBzZXRNZXRyaWNEZWZpbml0aW9uKGtleTogc3RyaW5nLCBtZXRyaWNEZWZpbml0aW9uOiBNZXRyaWNEZWZpbml0aW9uKSB7XG4gICAgdGhpcy5tZXRyaWNEZWZpbml0aW9uc1trZXldID0gbWV0cmljRGVmaW5pdGlvbjtcbiAgfVxuXG4gIGRlbGV0ZU1ldHJpY0RlZmluaXRpb24oa2V5OiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5tZXRyaWNEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgZ2V0UmVzb3VyY2VEZWZpbml0aW9uKGtleTogc3RyaW5nKTogUmVzb3VyY2VEZWZpbml0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZURlZmluaXRpb25zW2tleV07XG4gIH1cblxuICBzZXRSZXNvdXJjZURlZmluaXRpb24oa2V5OiBzdHJpbmcsIHZhbHVlOiBSZXNvdXJjZURlZmluaXRpb24pIHtcbiAgICB0aGlzLnJlc291cmNlRGVmaW5pdGlvbnNba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgZGVsZXRlUmVzb3VyY2VEZWZpbml0aW9uKGtleTogc3RyaW5nKSB7XG4gICAgZGVsZXRlIHRoaXMucmVzb3VyY2VEZWZpbml0aW9uc1trZXldO1xuICB9XG5cbiAgLy8gUmV0dXJucyBhIG5ldyBUYXNrIHdpdGggZGVmYXVsdHMgZm9yIGFsbCBtZXRyaWNzIGFuZCByZXNvdXJjZXMuXG4gIG5ld1Rhc2soKTogVGFzayB7XG4gICAgY29uc3QgcmV0ID0gbmV3IFRhc2soKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLm1ldHJpY0RlZmluaXRpb25zKS5mb3JFYWNoKChtZXRyaWNOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IG1kID0gdGhpcy5nZXRNZXRyaWNEZWZpbml0aW9uKG1ldHJpY05hbWUpITtcbiAgICAgIHJldC5zZXRNZXRyaWMobWV0cmljTmFtZSwgbWQuZGVmYXVsdCk7XG4gICAgfSk7XG4gICAgT2JqZWN0LmVudHJpZXModGhpcy5yZXNvdXJjZURlZmluaXRpb25zKS5mb3JFYWNoKFxuICAgICAgKFtrZXksIHJlc291cmNlRGVmaW5pdGlvbl0pID0+IHtcbiAgICAgICAgcmV0LnNldFJlc291cmNlKGtleSwgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlc1swXSk7XG4gICAgICB9XG4gICAgKTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBGcm9tSlNPTiA9ICh0ZXh0OiBzdHJpbmcpOiBSZXN1bHQ8UGxhbj4gPT4ge1xuICBjb25zdCBwbGFuU2VyaWFsaXplZDogUGxhblNlcmlhbGl6ZWQgPSBKU09OLnBhcnNlKHRleHQpO1xuICBjb25zdCBwbGFuID0gbmV3IFBsYW4oKTtcblxuICBwbGFuLmNoYXJ0LlZlcnRpY2VzID0gcGxhblNlcmlhbGl6ZWQuY2hhcnQudmVydGljZXMubWFwKFxuICAgICh0YXNrU2VyaWFsaXplZDogVGFza1NlcmlhbGl6ZWQpOiBUYXNrID0+IHtcbiAgICAgIGNvbnN0IHRhc2sgPSBuZXcgVGFzayh0YXNrU2VyaWFsaXplZC5uYW1lKTtcbiAgICAgIHRhc2suc3RhdGUgPSB0YXNrU2VyaWFsaXplZC5zdGF0ZTtcbiAgICAgIHRhc2subWV0cmljcyA9IHRhc2tTZXJpYWxpemVkLm1ldHJpY3M7XG4gICAgICB0YXNrLnJlc291cmNlcyA9IHRhc2tTZXJpYWxpemVkLnJlc291cmNlcztcblxuICAgICAgcmV0dXJuIHRhc2s7XG4gICAgfVxuICApO1xuICBwbGFuLmNoYXJ0LkVkZ2VzID0gcGxhblNlcmlhbGl6ZWQuY2hhcnQuZWRnZXMubWFwKFxuICAgIChkaXJlY3RlZEVkZ2VTZXJpYWxpemVkOiBEaXJlY3RlZEVkZ2VTZXJpYWxpemVkKTogRGlyZWN0ZWRFZGdlID0+XG4gICAgICBuZXcgRGlyZWN0ZWRFZGdlKGRpcmVjdGVkRWRnZVNlcmlhbGl6ZWQuaSwgZGlyZWN0ZWRFZGdlU2VyaWFsaXplZC5qKVxuICApO1xuXG4gIGNvbnN0IGRlc2VyaWFsaXplZE1ldHJpY0RlZmluaXRpb25zID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKHBsYW5TZXJpYWxpemVkLm1ldHJpY0RlZmluaXRpb25zKS5tYXAoXG4gICAgICAoW2tleSwgc2VyaWFsaXplZE1ldHJpY0RlZmluaXRpb25dKSA9PiBbXG4gICAgICAgIGtleSxcbiAgICAgICAgTWV0cmljRGVmaW5pdGlvbi5Gcm9tSlNPTihzZXJpYWxpemVkTWV0cmljRGVmaW5pdGlvbiksXG4gICAgICBdXG4gICAgKVxuICApO1xuXG4gIHBsYW4ubWV0cmljRGVmaW5pdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgIHt9LFxuICAgIFN0YXRpY01ldHJpY0RlZmluaXRpb25zLFxuICAgIGRlc2VyaWFsaXplZE1ldHJpY0RlZmluaXRpb25zXG4gICk7XG5cbiAgY29uc3QgZGVzZXJpYWxpemVkUmVzb3VyY2VEZWZpbml0aW9ucyA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhwbGFuU2VyaWFsaXplZC5yZXNvdXJjZURlZmluaXRpb25zKS5tYXAoXG4gICAgICAoW2tleSwgc2VyaWFsaXplZFJlc291cmNlRGVmaW5pdGlvbl0pID0+IFtcbiAgICAgICAga2V5LFxuICAgICAgICBSZXNvdXJjZURlZmluaXRpb24uRnJvbUpTT04oc2VyaWFsaXplZFJlc291cmNlRGVmaW5pdGlvbiksXG4gICAgICBdXG4gICAgKVxuICApO1xuXG4gIHBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucyA9IE9iamVjdC5hc3NpZ24oXG4gICAge30sXG4gICAgU3RhdGljUmVzb3VyY2VEZWZpbml0aW9ucyxcbiAgICBkZXNlcmlhbGl6ZWRSZXNvdXJjZURlZmluaXRpb25zXG4gICk7XG5cbiAgY29uc3QgcmV0ID0gUmF0aW9uYWxpemVFZGdlc09wKCkuYXBwbHlUbyhwbGFuKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgY29uc3QgcmV0VmFsID0gdmFsaWRhdGVDaGFydChwbGFuLmNoYXJ0KTtcbiAgaWYgKCFyZXRWYWwub2spIHtcbiAgICByZXR1cm4gcmV0VmFsO1xuICB9XG4gIHJldHVybiBvayhwbGFuKTtcbn07XG4iLCAiLyoqIEEgY29vcmRpbmF0ZSBwb2ludCBvbiB0aGUgcmVuZGVyaW5nIHN1cmZhY2UuICovXG5leHBvcnQgY2xhc3MgUG9pbnQge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgfVxuXG4gIGFkZCh4OiBudW1iZXIsIHk6IG51bWJlcik6IFBvaW50IHtcbiAgICB0aGlzLnggKz0geDtcbiAgICB0aGlzLnkgKz0geTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHN1bShyaHM6IFBvaW50KTogUG9pbnQge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54ICsgcmhzLngsIHRoaXMueSArIHJocy55KTtcbiAgfVxuXG4gIGVxdWFsKHJoczogUG9pbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy54ID09PSByaHMueCAmJiB0aGlzLnkgPT09IHJocy55O1xuICB9XG5cbiAgc2V0KHJoczogUG9pbnQpOiBQb2ludCB7XG4gICAgdGhpcy54ID0gcmhzLng7XG4gICAgdGhpcy55ID0gcmhzLnk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkdXAoKTogUG9pbnQge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54LCB0aGlzLnkpO1xuICB9XG59XG4iLCAiLyoqXG4gKiBGdW5jdGlvbmFsaXR5IGZvciBjcmVhdGluZyBkcmFnZ2FibGUgZGl2aWRlcnMgYmV0d2VlbiBlbGVtZW50cyBvbiBhIHBhZ2UuXG4gKi9cbmltcG9ydCB7IGNsYW1wIH0gZnJvbSBcIi4uLy4uL21ldHJpY3MvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4uL3NjYWxlL3BvaW50LnRzXCI7XG5cbi8vIFZhbHVlcyBhcmUgcmV0dXJuZWQgYXMgcGVyY2VudGFnZXMgYXJvdW5kIHRoZSBjdXJyZW50IG1vdXNlIGxvY2F0aW9uLiBUaGF0XG4vLyBpcywgaWYgd2UgYXJlIGluIFwiY29sdW1uXCIgbW9kZSB0aGVuIGBiZWZvcmVgIHdvdWxkIGVxdWFsIHRoZSBtb3VzZSBwb3NpdGlvblxuLy8gYXMgYSAlIG9mIHRoZSB3aWR0aCBvZiB0aGUgcGFyZW50IGVsZW1lbnQgZnJvbSB0aGUgbGVmdCBoYW5kIHNpZGUgb2YgdGhlXG4vLyBwYXJlbnQgZWxlbWVudC4gVGhlIGBhZnRlcmAgdmFsdWUgaXMganVzdCAxMDAtYmVmb3JlLlxuZXhwb3J0IGludGVyZmFjZSBEaXZpZGVyTW92ZVJlc3VsdCB7XG4gIGJlZm9yZTogbnVtYmVyO1xuICBhZnRlcjogbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBEaXZpZGVyVHlwZSA9IFwiY29sdW1uXCIgfCBcInJvd1wiO1xuXG5leHBvcnQgY29uc3QgRElWSURFUl9NT1ZFX0VWRU5UID0gXCJkaXZpZGVyX21vdmVcIjtcblxuZXhwb3J0IGNvbnN0IFJFU0laSU5HX0NMQVNTID0gXCJyZXNpemluZ1wiO1xuXG5pbnRlcmZhY2UgUmVjdCB7XG4gIHRvcDogbnVtYmVyO1xuICBsZWZ0OiBudW1iZXI7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xufVxuXG4vKiogUmV0dXJucyBhIGJvdW5kaW5nIHJlY3RhbmdsZSBmb3IgYW4gZWxlbWVudCBpbiBQYWdlIGNvb3JkaW5hdGVzLCBhcyBvcHBvc2VkXG4gKiB0byBWaWV3UG9ydCBjb29yZGluYXRlcywgd2hpY2ggaXMgd2hhdCBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKSByZXR1cm5zLlxuICovXG5leHBvcnQgY29uc3QgZ2V0UGFnZVJlY3QgPSAoZWxlOiBIVE1MRWxlbWVudCk6IFJlY3QgPT4ge1xuICBjb25zdCB2aWV3cG9ydFJlY3QgPSBlbGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHJldHVybiB7XG4gICAgdG9wOiB2aWV3cG9ydFJlY3QudG9wICsgd2luZG93LnNjcm9sbFksXG4gICAgbGVmdDogdmlld3BvcnRSZWN0LmxlZnQgKyB3aW5kb3cuc2Nyb2xsWCxcbiAgICB3aWR0aDogdmlld3BvcnRSZWN0LndpZHRoLFxuICAgIGhlaWdodDogdmlld3BvcnRSZWN0LmhlaWdodCxcbiAgfTtcbn07XG5cbi8qKiBEaXZpZGVyTW92ZSBpcyBjb3JlIGZ1bmN0aW9uYWxpdHkgZm9yIGNyZWF0aW5nIGRyYWdnYWJsZSBkaXZpZGVycyBiZXR3ZWVuXG4gKiBlbGVtZW50cyBvbiBhIHBhZ2UuXG4gKlxuICogQ29uc3RydWN0IGEgRGl2aWRlck1vZGUgd2l0aCBhIHBhcmVudCBlbGVtZW50IGFuZCBhIGRpdmlkZXIgZWxlbWVudCwgd2hlcmVcbiAqIHRoZSBkaXZpZGVyIGVsZW1lbnQgaXMgdGhlIGVsZW1lbnQgYmV0d2VlbiBvdGhlciBwYWdlIGVsZW1lbnRzIHRoYXQgaXNcbiAqIGV4cGVjdGVkIHRvIGJlIGRyYWdnZWQuIEZvciBleGFtcGxlLCBpbiB0aGUgZm9sbG93aW5nIGV4YW1wbGUgI2NvbnRhaW5lclxuICogd291bGQgYmUgdGhlIGBwYXJlbnRgLCBhbmQgI2RpdmlkZXIgd291bGQgYmUgdGhlIGBkaXZpZGVyYCBlbGVtZW50LlxuICpcbiAqICA8ZGl2IGlkPWNvbnRhaW5lcj5cbiAqICAgIDxkaXYgaWQ9bGVmdD48L2Rpdj4gIDxkaXYgaWQ9ZGl2aWRlcj48L2Rpdj4gPGRpdiBpZD1yaWdodD48L2Rpdj9cbiAqICA8L2Rpdj5cbiAqXG4gKiBEaXZpZGVyTW9kZSB3YWl0cyBmb3IgYSBtb3VzZWRvd24gZXZlbnQgb24gdGhlIGBkaXZpZGVyYCBlbGVtZW50IGFuZCB0aGVuXG4gKiB3YXRjaGVzIG1vdXNlIGV2ZW50cyBmb3IgdGhlIGdpdmVuIHBhcmVudCBIVE1MRWxlbWVudCBhbmQgZW1pdHMgZXZlbnRzIGFyb3VuZFxuICogZHJhZ2dpbmcuXG4gKlxuICogVGhlIGVtaXR0ZWQgZXZlbnQgaXMgXCJkaXZpZGVyX21vdmVcIiBhbmQgaXMgYSBDdXN0b21FdmVudDxEaXZpZGVyTW92ZVJlc3VsdD4uXG4gKlxuICogSXQgaXMgdXAgdG8gdGhlIHVzZXIgb2YgRGl2aWRlck1vdmUgdG8gbGlzdGVuIGZvciB0aGUgXCJkaXZpZGVyX21vdmVcIiBldmVudHNcbiAqIGFuZCB1cGRhdGUgdGhlIENTUyBvZiB0aGUgcGFnZSBhcHByb3ByaWF0ZWx5IHRvIHJlZmxlY3QgdGhlIHBvc2l0aW9uIG9mIHRoZVxuICogZGl2aWRlci5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyBkb3duIGFuIGV2ZW50IHdpbGwgYmUgZW1pdHRlZCBwZXJpb2RpY2FsbHkgYXMgdGhlIG1vdXNlXG4gKiBtb3Zlcy5cbiAqXG4gKiBPbmNlIHRoZSBtb3VzZSBpcyByZWxlYXNlZCwgb3IgaWYgdGhlIG1vdXNlIGV4aXRzIHRoZSBwYXJlbnQgSFRNTEVsZW1lbnQsIG9uZVxuICogbGFzdCBldmVudCBpcyBlbWl0dGVkLlxuICpcbiAqIFdoaWxlIGRyYWdnaW5nIHRoZSBkaXZpZGVyLCB0aGUgXCJyZXNpemluZ1wiIGNsYXNzIHdpbGwgYmUgYWRkZWQgdG8gdGhlIHBhcmVudFxuICogZWxlbWVudC4gVGhpcyBjYW4gYmUgdXNlZCB0byBzZXQgYSBzdHlsZSwgZS5nLiAndXNlci1zZWxlY3Q6IG5vbmUnLlxuICovXG5leHBvcnQgY2xhc3MgRGl2aWRlck1vdmUge1xuICAvKiogVGhlIHBvaW50IHdoZXJlIGRyYWdnaW5nIHN0YXJ0ZWQsIGluIFBhZ2UgY29vcmRpbmF0ZXMuICovXG4gIGJlZ2luOiBQb2ludCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBUaGUgZGltZW5zaW9ucyBvZiB0aGUgcGFyZW50IGVsZW1lbnQgaW4gUGFnZSBjb29yZGluYXRlcyBhcyBvZiBtb3VzZWRvd25cbiAgICogb24gdGhlIGRpdmlkZXIuLiAqL1xuICBwYXJlbnRSZWN0OiBSZWN0IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBjdXJyZW50IG1vdXNlIHBvc2l0aW9uIGluIFBhZ2UgY29vcmRpbmF0ZXMuICovXG4gIGN1cnJlbnRNb3ZlTG9jYXRpb246IFBvaW50ID0gbmV3IFBvaW50KDAsIDApO1xuXG4gIC8qKiBUaGUgbGFzdCBtb3VzZSBwb3NpdGlvbiBpbiBQYWdlIGNvb3JkaW5hdGVzIHJlcG9ydGVkIHZpYSBDdXN0b21FdmVudC4gKi9cbiAgbGFzdE1vdmVTZW50OiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcblxuICAvKiogVGhlIHBhcmVudCBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIGRpdmlkZXIuICovXG4gIHBhcmVudDogSFRNTEVsZW1lbnQ7XG5cbiAgLyoqIFRoZSBkaXZpZGVyIGVsZW1lbnQgdG8gYmUgZHJhZ2dlZCBhY3Jvc3MgdGhlIHBhcmVudCBlbGVtZW50LiAqL1xuICBkaXZpZGVyOiBIVE1MRWxlbWVudDtcblxuICAvKiogVGhlIGhhbmRsZSBvZiB0aGUgd2luZG93LnNldEludGVydmFsKCkuICovXG4gIGludGVybnZhbEhhbmRsZTogbnVtYmVyID0gMDtcblxuICAvKiogVGhlIHR5cGUgb2YgZGl2aWRlciwgZWl0aGVyIHZlcnRpY2FsIChcImNvbHVtblwiKSwgb3IgaG9yaXpvbnRhbCAoXCJyb3dcIikuICovXG4gIGRpdmlkZXJUeXBlOiBEaXZpZGVyVHlwZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwYXJlbnQ6IEhUTUxFbGVtZW50LFxuICAgIGRpdmlkZXI6IEhUTUxFbGVtZW50LFxuICAgIGRpdmlkZXJUeXBlOiBEaXZpZGVyVHlwZSA9IFwiY29sdW1uXCJcbiAgKSB7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5kaXZpZGVyID0gZGl2aWRlcjtcbiAgICB0aGlzLmRpdmlkZXJUeXBlID0gZGl2aWRlclR5cGU7XG4gICAgdGhpcy5kaXZpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXRhY2goKSB7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmRpdmlkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcbiAgfVxuXG4gIG9uVGltZW91dCgpIHtcbiAgICBpZiAoIXRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi5lcXVhbCh0aGlzLmxhc3RNb3ZlU2VudCkpIHtcbiAgICAgIGxldCBkaWZmUGVyY2VudDogbnVtYmVyID0gMDtcbiAgICAgIGlmICh0aGlzLmRpdmlkZXJUeXBlID09PSBcImNvbHVtblwiKSB7XG4gICAgICAgIGRpZmZQZXJjZW50ID1cbiAgICAgICAgICAoMTAwICogKHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54IC0gdGhpcy5wYXJlbnRSZWN0IS5sZWZ0KSkgL1xuICAgICAgICAgIHRoaXMucGFyZW50UmVjdCEud2lkdGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaWZmUGVyY2VudCA9XG4gICAgICAgICAgKDEwMCAqICh0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSAtIHRoaXMucGFyZW50UmVjdCEudG9wKSkgL1xuICAgICAgICAgIHRoaXMucGFyZW50UmVjdCEuaGVpZ2h0O1xuICAgICAgfVxuICAgICAgLy8gVE9ETyAtIFNob3VsZCBjbGFtcCBiZSBzZXR0YWJsZSBpbiB0aGUgY29uc3RydWN0b3I/XG4gICAgICBkaWZmUGVyY2VudCA9IGNsYW1wKGRpZmZQZXJjZW50LCA1LCA5NSk7XG5cbiAgICAgIHRoaXMucGFyZW50LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudDxEaXZpZGVyTW92ZVJlc3VsdD4oRElWSURFUl9NT1ZFX0VWRU5ULCB7XG4gICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICBiZWZvcmU6IGRpZmZQZXJjZW50LFxuICAgICAgICAgICAgYWZ0ZXI6IDEwMCAtIGRpZmZQZXJjZW50LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgdGhpcy5sYXN0TW92ZVNlbnQuc2V0KHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgbW91c2Vtb3ZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCA9IGUucGFnZVg7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLnkgPSBlLnBhZ2VZO1xuICB9XG5cbiAgbW91c2Vkb3duKGU6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLmludGVybnZhbEhhbmRsZSA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLm9uVGltZW91dC5iaW5kKHRoaXMpLCAxNik7XG4gICAgdGhpcy5wYXJlbnRSZWN0ID0gZ2V0UGFnZVJlY3QodGhpcy5wYXJlbnQpO1xuXG4gICAgdGhpcy5wYXJlbnQuY2xhc3NMaXN0LmFkZChSRVNJWklOR19DTEFTUyk7XG5cbiAgICB0aGlzLnBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMucGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlbGVhdmUuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmJlZ2luID0gbmV3IFBvaW50KGUucGFnZVgsIGUucGFnZVkpO1xuICB9XG5cbiAgbW91c2V1cChlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maW5pc2hlZChuZXcgUG9pbnQoZS5wYWdlWCwgZS5wYWdlWSkpO1xuICB9XG5cbiAgbW91c2VsZWF2ZShlOiBNb3VzZUV2ZW50KSB7XG4gICAgaWYgKHRoaXMuYmVnaW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5maW5pc2hlZChuZXcgUG9pbnQoZS5wYWdlWCwgZS5wYWdlWSkpO1xuICB9XG5cbiAgZmluaXNoZWQoZW5kOiBQb2ludCkge1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcblxuICAgIHRoaXMucGFyZW50LmNsYXNzTGlzdC5yZW1vdmUoUkVTSVpJTkdfQ0xBU1MpO1xuXG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlbW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnBhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gZW5kO1xuICAgIHRoaXMub25UaW1lb3V0KCk7XG4gICAgdGhpcy5iZWdpbiA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHRoaXMubGFzdE1vdmVTZW50ID0gbmV3IFBvaW50KDAsIDApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi4vc2NhbGUvcG9pbnQudHNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBEcmFnUmFuZ2Uge1xuICBiZWdpbjogUG9pbnQ7XG4gIGVuZDogUG9pbnQ7XG59XG5cbmV4cG9ydCBjb25zdCBEUkFHX1JBTkdFX0VWRU5UID0gXCJkcmFncmFuZ2VcIjtcblxuLyoqIE1vdXNlTW92ZSB3YXRjaGVzIG1vdXNlIGV2ZW50cyBmb3IgYSBnaXZlbiBIVE1MRWxlbWVudCBhbmQgZW1pdHNcbiAqIGV2ZW50cyBhcm91bmQgZHJhZ2dpbmcuXG4gKlxuICogVGhlIGVtaXR0ZWQgZXZlbnQgaXMgXCJkcmFncmFuZ2VcIiBhbmQgaXMgYSBDdXN0b21FdmVudDxEcmFnUmFuZ2U+LlxuICpcbiAqIE9uY2UgdGhlIG1vdXNlIGlzIHByZXNzZWQgZG93biBpbiB0aGUgSFRNTEVsZW1lbnQgYW4gZXZlbnQgd2lsbCBiZVxuICogZW1pdHRlZCBwZXJpb2RpY2FsbHkgYXMgdGhlIG1vdXNlIG1vdmVzLlxuICpcbiAqIE9uY2UgdGhlIG1vdXNlIGlzIHJlbGVhc2VkLCBvciBleGl0cyB0aGUgSFRNTEVsZW1lbnQgb25lIGxhc3QgZXZlbnRcbiAqIGlzIGVtaXR0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBNb3VzZURyYWcge1xuICBiZWdpbjogUG9pbnQgfCBudWxsID0gbnVsbDtcbiAgY3VycmVudE1vdmVMb2NhdGlvbjogUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIGxhc3RNb3ZlU2VudDogUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIGVsZTogSFRNTEVsZW1lbnQ7XG4gIGludGVybnZhbEhhbmRsZTogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihlbGU6IEhUTUxFbGVtZW50KSB7XG4gICAgdGhpcy5lbGUgPSBlbGU7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZWRvd24uYmluZCh0aGlzKSk7XG4gICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2V1cC5iaW5kKHRoaXMpKTtcbiAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZGV0YWNoKCkge1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlZG93bi5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmVsZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNldXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5lbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZWxlYXZlLmJpbmQodGhpcykpO1xuICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJudmFsSGFuZGxlKTtcbiAgfVxuXG4gIG9uVGltZW91dCgpIHtcbiAgICBpZiAoIXRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi5lcXVhbCh0aGlzLmxhc3RNb3ZlU2VudCkpIHtcbiAgICAgIHRoaXMuZWxlLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgIG5ldyBDdXN0b21FdmVudDxEcmFnUmFuZ2U+KERSQUdfUkFOR0VfRVZFTlQsIHtcbiAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgIGJlZ2luOiB0aGlzLmJlZ2luIS5kdXAoKSxcbiAgICAgICAgICAgIGVuZDogdGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLmR1cCgpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgdGhpcy5sYXN0TW92ZVNlbnQuc2V0KHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgbW91c2Vtb3ZlKGU6IE1vdXNlRXZlbnQpIHtcbiAgICBpZiAodGhpcy5iZWdpbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueCA9IGUub2Zmc2V0WDtcbiAgICB0aGlzLmN1cnJlbnRNb3ZlTG9jYXRpb24ueSA9IGUub2Zmc2V0WTtcbiAgfVxuXG4gIG1vdXNlZG93bihlOiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5pbnRlcm52YWxIYW5kbGUgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5vblRpbWVvdXQuYmluZCh0aGlzKSwgMTYpO1xuICAgIHRoaXMuYmVnaW4gPSBuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICB9XG5cbiAgbW91c2V1cChlOiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5maW5pc2hlZChuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpKTtcbiAgfVxuXG4gIG1vdXNlbGVhdmUoZTogTW91c2VFdmVudCkge1xuICAgIGlmICh0aGlzLmJlZ2luID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZmluaXNoZWQobmV3IFBvaW50KGUub2Zmc2V0WCwgZS5vZmZzZXRZKSk7XG4gIH1cblxuICBmaW5pc2hlZChlbmQ6IFBvaW50KSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcm52YWxIYW5kbGUpO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IGVuZDtcbiAgICB0aGlzLm9uVGltZW91dCgpO1xuICAgIHRoaXMuYmVnaW4gPSBudWxsO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICB0aGlzLmxhc3RNb3ZlU2VudCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4uL3NjYWxlL3BvaW50LnRzXCI7XG5cbi8qKiBNb3VzZU1vdmUgd2F0Y2hlcyBtb3VzZSBldmVudHMgZm9yIGEgZ2l2ZW4gSFRNTEVsZW1lbnQgYW5kIHJlY29yZHMgdGhlIG1vc3RcbiAqICByZWNlbnQgbG9jYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBNb3VzZU1vdmUge1xuICBjdXJyZW50TW92ZUxvY2F0aW9uOiBQb2ludCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgbGFzdFJlYWRMb2NhdGlvbjogUG9pbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gIGVsZTogSFRNTEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoZWxlOiBIVE1MRWxlbWVudCkge1xuICAgIHRoaXMuZWxlID0gZWxlO1xuICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZGV0YWNoKCkge1xuICAgIHRoaXMuZWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZW1vdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBtb3VzZW1vdmUoZTogTW91c2VFdmVudCkge1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi54ID0gZS5vZmZzZXRYO1xuICAgIHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbi55ID0gZS5vZmZzZXRZO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYSBQb2ludCBpZiB0aGUgbW91c2UgaGFkIG1vdmVkIHNpbmNlIHRoZSBsYXN0IHJlYWQsIG90aGVyd2lzZVxuICAgKiByZXR1cm5zIG51bGwuXG4gICAqL1xuICByZWFkTG9jYXRpb24oKTogUG9pbnQgfCBudWxsIHtcbiAgICBpZiAodGhpcy5jdXJyZW50TW92ZUxvY2F0aW9uLmVxdWFsKHRoaXMubGFzdFJlYWRMb2NhdGlvbikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0aGlzLmxhc3RSZWFkTG9jYXRpb24uc2V0KHRoaXMuY3VycmVudE1vdmVMb2NhdGlvbik7XG4gICAgcmV0dXJuIHRoaXMubGFzdFJlYWRMb2NhdGlvbi5kdXAoKTtcbiAgfVxufVxuIiwgImV4cG9ydCBjb25zdCBNSU5fRElTUExBWV9SQU5HRSA9IDc7XG5cbi8qKiBSZXByZXNlbnRzIGEgcmFuZ2Ugb2YgZGF5cyBvdmVyIHdoaWNoIHRvIGRpc3BsYXkgYSB6b29tZWQgaW4gdmlldywgdXNpbmdcbiAqIHRoZSBoYWxmLW9wZW4gaW50ZXJ2YWwgW2JlZ2luLCBlbmQpLlxuICovXG5leHBvcnQgY2xhc3MgRGlzcGxheVJhbmdlIHtcbiAgcHJpdmF0ZSBfYmVnaW46IG51bWJlcjtcbiAgcHJpdmF0ZSBfZW5kOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoYmVnaW46IG51bWJlciwgZW5kOiBudW1iZXIpIHtcbiAgICB0aGlzLl9iZWdpbiA9IGJlZ2luO1xuICAgIHRoaXMuX2VuZCA9IGVuZDtcbiAgICBpZiAodGhpcy5fYmVnaW4gPiB0aGlzLl9lbmQpIHtcbiAgICAgIFt0aGlzLl9lbmQsIHRoaXMuX2JlZ2luXSA9IFt0aGlzLl9iZWdpbiwgdGhpcy5fZW5kXTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2VuZCAtIHRoaXMuX2JlZ2luIDwgTUlOX0RJU1BMQVlfUkFOR0UpIHtcbiAgICAgIHRoaXMuX2VuZCA9IHRoaXMuX2JlZ2luICsgTUlOX0RJU1BMQVlfUkFOR0U7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGluKHg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB4ID49IHRoaXMuX2JlZ2luICYmIHggPD0gdGhpcy5fZW5kO1xuICB9XG5cbiAgcHVibGljIGdldCBiZWdpbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9iZWdpbjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW5kKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcmFuZ2VJbkRheXMoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZW5kIC0gdGhpcy5fYmVnaW47XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIEVkZ2VzIH0gZnJvbSBcIi4uLy4uL2RhZy9kYWdcIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBTcGFuIH0gZnJvbSBcIi4uLy4uL3NsYWNrL3NsYWNrXCI7XG5pbXBvcnQgeyBDaGFydCwgVGFzaywgVGFza3MsIHZhbGlkYXRlQ2hhcnQgfSBmcm9tIFwiLi4vY2hhcnRcIjtcblxuZXhwb3J0IGludGVyZmFjZSBDaGFydExpa2Uge1xuICBWZXJ0aWNlczogVGFza3M7XG4gIEVkZ2VzOiBFZGdlcztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGaWx0ZXJSZXN1bHQge1xuICBjaGFydExpa2U6IENoYXJ0TGlrZTtcbiAgZGlzcGxheU9yZGVyOiBudW1iZXJbXTtcbiAgZW1waGFzaXplZFRhc2tzOiBudW1iZXJbXTtcbiAgc3BhbnM6IFNwYW5bXTtcbiAgbGFiZWxzOiBzdHJpbmdbXTtcbiAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj47XG4gIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4OiBNYXA8bnVtYmVyLCBudW1iZXI+O1xuICBzZWxlY3RlZFRhc2tJbmRleDogbnVtYmVyO1xufVxuXG4vKiogVXNlZCBmb3IgZmlsdGVyaW5nIHRhc2tzLCByZXR1cm5zIFRydWUgaWYgdGhlIHRhc2sgaXMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlXG4gKiBmaWx0ZXJlZCByZXN1bHRzLiAqL1xuZXhwb3J0IHR5cGUgRmlsdGVyRnVuYyA9ICh0YXNrOiBUYXNrLCBpbmRleDogbnVtYmVyKSA9PiBib29sZWFuO1xuXG4vKiogRmlsdGVycyB0aGUgY29udGVudHMgb2YgdGhlIENoYXJ0IGJhc2VkIG9uIHRoZSBmaWx0ZXJGdW5jLlxuICpcbiAqIHNlbGVjdGVkVGFza0luZGV4IHdpbGwgYmUgcmV0dXJuZWQgYXMgLTEgaWYgdGhlIHNlbGVjdGVkIHRhc2sgZ2V0cyBmaWx0ZXJlZFxuICogb3V0LlxuICovXG5leHBvcnQgY29uc3QgZmlsdGVyID0gKFxuICBjaGFydDogQ2hhcnQsXG4gIGZpbHRlckZ1bmM6IEZpbHRlckZ1bmMgfCBudWxsLFxuICBlbXBoYXNpemVkVGFza3M6IG51bWJlcltdLFxuICBzcGFuczogU3BhbltdLFxuICBsYWJlbHM6IHN0cmluZ1tdLFxuICBzZWxlY3RlZFRhc2tJbmRleDogbnVtYmVyXG4pOiBSZXN1bHQ8RmlsdGVyUmVzdWx0PiA9PiB7XG4gIGNvbnN0IHZyZXQgPSB2YWxpZGF0ZUNoYXJ0KGNoYXJ0KTtcbiAgaWYgKCF2cmV0Lm9rKSB7XG4gICAgcmV0dXJuIHZyZXQ7XG4gIH1cbiAgY29uc3QgdG9wb2xvZ2ljYWxPcmRlciA9IHZyZXQudmFsdWU7XG4gIGlmIChmaWx0ZXJGdW5jID09PSBudWxsKSB7XG4gICAgY29uc3QgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGNoYXJ0LlZlcnRpY2VzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXguc2V0KGluZGV4LCBpbmRleCk7XG4gICAgfVxuICAgIHJldHVybiBvayh7XG4gICAgICBjaGFydExpa2U6IGNoYXJ0LFxuICAgICAgZGlzcGxheU9yZGVyOiB2cmV0LnZhbHVlLFxuICAgICAgZW1waGFzaXplZFRhc2tzOiBlbXBoYXNpemVkVGFza3MsXG4gICAgICBzcGFuczogc3BhbnMsXG4gICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4OiBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleCxcbiAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4OiBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleCxcbiAgICAgIHNlbGVjdGVkVGFza0luZGV4LFxuICAgIH0pO1xuICB9XG4gIGNvbnN0IHRhc2tzOiBUYXNrcyA9IFtdO1xuICBjb25zdCBlZGdlczogRWRnZXMgPSBbXTtcbiAgY29uc3QgZGlzcGxheU9yZGVyOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBmaWx0ZXJlZFNwYW5zOiBTcGFuW10gPSBbXTtcbiAgY29uc3QgZmlsdGVyZWRMYWJlbHM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4OiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuICBjb25zdCBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXg6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG5cbiAgLy8gRmlyc3QgZmlsdGVyIHRoZSB0YXNrcy5cbiAgY2hhcnQuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgb3JpZ2luYWxJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKGZpbHRlckZ1bmModGFzaywgb3JpZ2luYWxJbmRleCkpIHtcbiAgICAgIHRhc2tzLnB1c2godGFzayk7XG4gICAgICBmaWx0ZXJlZFNwYW5zLnB1c2goc3BhbnNbb3JpZ2luYWxJbmRleF0pO1xuICAgICAgZmlsdGVyZWRMYWJlbHMucHVzaChsYWJlbHNbb3JpZ2luYWxJbmRleF0pO1xuICAgICAgY29uc3QgbmV3SW5kZXggPSB0YXNrcy5sZW5ndGggLSAxO1xuICAgICAgZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LnNldChvcmlnaW5hbEluZGV4LCBuZXdJbmRleCk7XG4gICAgICBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleC5zZXQobmV3SW5kZXgsIG9yaWdpbmFsSW5kZXgpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gTm93IGZpbHRlciB0aGUgZWRnZXMgd2hpbGUgYWxzbyByZXdyaXRpbmcgdGhlbS5cbiAgY2hhcnQuRWRnZXMuZm9yRWFjaCgoZGlyZWN0ZWRFZGdlOiBEaXJlY3RlZEVkZ2UpID0+IHtcbiAgICBpZiAoXG4gICAgICAhZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmhhcyhkaXJlY3RlZEVkZ2UuaSkgfHxcbiAgICAgICFmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguaGFzKGRpcmVjdGVkRWRnZS5qKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlZGdlcy5wdXNoKFxuICAgICAgbmV3IERpcmVjdGVkRWRnZShcbiAgICAgICAgZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChkaXJlY3RlZEVkZ2UuaSksXG4gICAgICAgIGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5nZXQoZGlyZWN0ZWRFZGdlLmopXG4gICAgICApXG4gICAgKTtcbiAgfSk7XG5cbiAgLy8gTm93IGZpbHRlciBhbmQgcmVpbmRleCB0aGUgdG9wb2xvZ2ljYWwvZGlzcGxheSBvcmRlci5cbiAgdG9wb2xvZ2ljYWxPcmRlci5mb3JFYWNoKChvcmlnaW5hbFRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzazogVGFzayA9IGNoYXJ0LlZlcnRpY2VzW29yaWdpbmFsVGFza0luZGV4XTtcbiAgICBpZiAoIWZpbHRlckZ1bmModGFzaywgb3JpZ2luYWxUYXNrSW5kZXgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRpc3BsYXlPcmRlci5wdXNoKGZyb21PcmlnaW5hbFRvRmlsdGVyZWRJbmRleC5nZXQob3JpZ2luYWxUYXNrSW5kZXgpISk7XG4gIH0pO1xuXG4gIC8vIFJlLWluZGV4IGhpZ2hsaWdodGVkIHRhc2tzLlxuICBjb25zdCB1cGRhdGVkRW1waGFzaXplZFRhc2tzID0gZW1waGFzaXplZFRhc2tzLm1hcChcbiAgICAob3JpZ2luYWxUYXNrSW5kZXg6IG51bWJlcik6IG51bWJlciA9PlxuICAgICAgZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LmdldChvcmlnaW5hbFRhc2tJbmRleCkhXG4gICk7XG5cbiAgcmV0dXJuIG9rKHtcbiAgICBjaGFydExpa2U6IHtcbiAgICAgIEVkZ2VzOiBlZGdlcyxcbiAgICAgIFZlcnRpY2VzOiB0YXNrcyxcbiAgICB9LFxuICAgIGRpc3BsYXlPcmRlcjogZGlzcGxheU9yZGVyLFxuICAgIGVtcGhhc2l6ZWRUYXNrczogdXBkYXRlZEVtcGhhc2l6ZWRUYXNrcyxcbiAgICBzcGFuczogZmlsdGVyZWRTcGFucyxcbiAgICBsYWJlbHM6IGZpbHRlcmVkTGFiZWxzLFxuICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4OiBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleCxcbiAgICBmcm9tT3JpZ2luYWxJbmRleFRvRmlsdGVyZWRJbmRleDogZnJvbU9yaWdpbmFsVG9GaWx0ZXJlZEluZGV4LFxuICAgIHNlbGVjdGVkVGFza0luZGV4OiBmcm9tT3JpZ2luYWxUb0ZpbHRlcmVkSW5kZXguZ2V0KHNlbGVjdGVkVGFza0luZGV4KSB8fCAtMSxcbiAgfSk7XG59O1xuIiwgIi8qKiBAbW9kdWxlIGtkXG4gKiBBIGstZCB0cmVlIGltcGxlbWVudGF0aW9uLCB3aGljaCBpcyB1c2VkIHRvIGZpbmQgdGhlIGNsb3Nlc3QgcG9pbnQgaW5cbiAqIHNvbWV0aGluZyBsaWtlIGEgMkQgc2NhdHRlciBwbG90LiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSy1kX3RyZWVcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogRm9ya2VkIGZyb20gaHR0cHM6Ly9za2lhLmdvb2dsZXNvdXJjZS5jb20vYnVpbGRib3QvKy9yZWZzL2hlYWRzL21haW4vcGVyZi9tb2R1bGVzL3Bsb3Qtc2ltcGxlLXNrL2tkLnRzLlxuICpcbiAqIEZvcmtlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9QYW5kaW5vc2F1cnVzL2tkLXRyZWUtamF2YXNjcmlwdCBhbmRcbiAqIHRoZW4gbWFzc2l2ZWx5IHRyaW1tZWQgZG93biB0byBqdXN0IGZpbmQgdGhlIHNpbmdsZSBjbG9zZXN0IHBvaW50LCBhbmQgYWxzb1xuICogcG9ydGVkIHRvIEVTNiBzeW50YXgsIHRoZW4gcG9ydGVkIHRvIFR5cGVTY3JpcHQuXG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL1BhbmRpbm9zYXVydXMva2QtdHJlZS1qYXZhc2NyaXB0IGlzIGEgZm9yayBvZlxuICogaHR0cHM6Ly9naXRodWIuY29tL3ViaWxhYnMva2QtdHJlZS1qYXZhc2NyaXB0XG4gKlxuICogQGF1dGhvciBNaXJjZWEgUHJpY29wIDxwcmljb3BAdWJpbGFicy5uZXQ+LCAyMDEyXG4gKiBAYXV0aG9yIE1hcnRpbiBLbGVwcGUgPGtsZXBwZUB1YmlsYWJzLm5ldD4sIDIwMTJcbiAqIEBhdXRob3IgVWJpbGFicyBodHRwOi8vdWJpbGFicy5uZXQsIDIwMTJcbiAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIDxodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocD5cbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIEtEUG9pbnQge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbn1cblxudHlwZSBEaW1lbnNpb25zID0ga2V5b2YgS0RQb2ludDtcblxuY29uc3QgZGVmYXVsdE1ldHJpYyA9IChhOiBLRFBvaW50LCBiOiBLRFBvaW50KTogbnVtYmVyID0+XG4gIChhLnggLSBiLngpICogKGEueCAtIGIueCkgKyAoYS55IC0gYi55KSAqIChhLnkgLSBiLnkpO1xuXG5jb25zdCBkZWZhdWx0RGltZW5zaW9uczogRGltZW5zaW9uc1tdID0gW1wieFwiLCBcInlcIl07XG5cbi8qKiBAY2xhc3MgQSBzaW5nbGUgbm9kZSBpbiB0aGUgay1kIFRyZWUuICovXG5jbGFzcyBOb2RlPEl0ZW0gZXh0ZW5kcyBLRFBvaW50PiB7XG4gIG9iajogSXRlbTtcblxuICBsZWZ0OiBOb2RlPEl0ZW0+IHwgbnVsbCA9IG51bGw7XG5cbiAgcmlnaHQ6IE5vZGU8SXRlbT4gfCBudWxsID0gbnVsbDtcblxuICBwYXJlbnQ6IE5vZGU8SXRlbT4gfCBudWxsO1xuXG4gIGRpbWVuc2lvbjogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG9iajogSXRlbSwgZGltZW5zaW9uOiBudW1iZXIsIHBhcmVudDogTm9kZTxJdGVtPiB8IG51bGwpIHtcbiAgICB0aGlzLm9iaiA9IG9iajtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLmRpbWVuc2lvbiA9IGRpbWVuc2lvbjtcbiAgfVxufVxuXG4vKipcbiAqIEBjbGFzcyBUaGUgay1kIHRyZWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBLRFRyZWU8UG9pbnQgZXh0ZW5kcyBLRFBvaW50PiB7XG4gIHByaXZhdGUgZGltZW5zaW9uczogRGltZW5zaW9uc1tdO1xuXG4gIHByaXZhdGUgcm9vdDogTm9kZTxQb2ludD4gfCBudWxsO1xuXG4gIHByaXZhdGUgbWV0cmljOiAoYTogS0RQb2ludCwgYjogS0RQb2ludCkgPT4gbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IHBvaW50cyAtIEFuIGFycmF5IG9mIHBvaW50cywgc29tZXRoaW5nIHdpdGggdGhlIHNoYXBlXG4gICAqICAgICB7eDp4LCB5Onl9LlxuICAgKiBAcGFyYW0ge0FycmF5fSBkaW1lbnNpb25zIC0gVGhlIGRpbWVuc2lvbnMgdG8gdXNlIGluIG91ciBwb2ludHMsIGZvclxuICAgKiAgICAgZXhhbXBsZSBbJ3gnLCAneSddLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBtZXRyaWMgLSBBIGZ1bmN0aW9uIHRoYXQgY2FsY3VsYXRlcyB0aGUgZGlzdGFuY2VcbiAgICogICAgIGJldHdlZW4gdHdvIHBvaW50cy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHBvaW50czogUG9pbnRbXSkge1xuICAgIHRoaXMuZGltZW5zaW9ucyA9IGRlZmF1bHREaW1lbnNpb25zO1xuICAgIHRoaXMubWV0cmljID0gZGVmYXVsdE1ldHJpYztcbiAgICB0aGlzLnJvb3QgPSB0aGlzLl9idWlsZFRyZWUocG9pbnRzLCAwLCBudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIHRoZSBuZWFyZXN0IE5vZGUgdG8gdGhlIGdpdmVuIHBvaW50LlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcG9pbnQgLSB7eDp4LCB5Onl9XG4gICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBjbG9zZXN0IHBvaW50IG9iamVjdCBwYXNzZWQgaW50byB0aGUgY29uc3RydWN0b3IuXG4gICAqICAgICBXZSBwYXNzIGJhY2sgdGhlIG9yaWdpbmFsIG9iamVjdCBzaW5jZSBpdCBtaWdodCBoYXZlIGV4dHJhIGluZm9cbiAgICogICAgIGJleW9uZCBqdXN0IHRoZSBjb29yZGluYXRlcywgc3VjaCBhcyB0cmFjZSBpZC5cbiAgICovXG4gIG5lYXJlc3QocG9pbnQ6IEtEUG9pbnQpOiBQb2ludCB7XG4gICAgbGV0IGJlc3ROb2RlID0ge1xuICAgICAgbm9kZTogdGhpcy5yb290LFxuICAgICAgZGlzdGFuY2U6IE51bWJlci5NQVhfVkFMVUUsXG4gICAgfTtcblxuICAgIGNvbnN0IHNhdmVOb2RlID0gKG5vZGU6IE5vZGU8UG9pbnQ+LCBkaXN0YW5jZTogbnVtYmVyKSA9PiB7XG4gICAgICBiZXN0Tm9kZSA9IHtcbiAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgZGlzdGFuY2U6IGRpc3RhbmNlLFxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgY29uc3QgbmVhcmVzdFNlYXJjaCA9IChub2RlOiBOb2RlPFBvaW50PikgPT4ge1xuICAgICAgY29uc3QgZGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb25zW25vZGUuZGltZW5zaW9uXTtcbiAgICAgIGNvbnN0IG93bkRpc3RhbmNlID0gdGhpcy5tZXRyaWMocG9pbnQsIG5vZGUub2JqKTtcblxuICAgICAgaWYgKG5vZGUucmlnaHQgPT09IG51bGwgJiYgbm9kZS5sZWZ0ID09PSBudWxsKSB7XG4gICAgICAgIGlmIChvd25EaXN0YW5jZSA8IGJlc3ROb2RlLmRpc3RhbmNlKSB7XG4gICAgICAgICAgc2F2ZU5vZGUobm9kZSwgb3duRGlzdGFuY2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbGV0IGJlc3RDaGlsZCA9IG51bGw7XG4gICAgICBsZXQgb3RoZXJDaGlsZCA9IG51bGw7XG4gICAgICAvLyBJZiB3ZSBnZXQgaGVyZSB3ZSBrbm93IHRoYXQgYXQgbGVhc3Qgb25lIG9mIC5sZWZ0IGFuZCAucmlnaHQgaXNcbiAgICAgIC8vIG5vbi1udWxsLCBzbyBiZXN0Q2hpbGQgaXMgZ3VhcmFudGVlZCB0byBiZSBub24tbnVsbC5cbiAgICAgIGlmIChub2RlLnJpZ2h0ID09PSBudWxsKSB7XG4gICAgICAgIGJlc3RDaGlsZCA9IG5vZGUubGVmdDtcbiAgICAgIH0gZWxzZSBpZiAobm9kZS5sZWZ0ID09PSBudWxsKSB7XG4gICAgICAgIGJlc3RDaGlsZCA9IG5vZGUucmlnaHQ7XG4gICAgICB9IGVsc2UgaWYgKHBvaW50W2RpbWVuc2lvbl0gPCBub2RlLm9ialtkaW1lbnNpb25dKSB7XG4gICAgICAgIGJlc3RDaGlsZCA9IG5vZGUubGVmdDtcbiAgICAgICAgb3RoZXJDaGlsZCA9IG5vZGUucmlnaHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBiZXN0Q2hpbGQgPSBub2RlLnJpZ2h0O1xuICAgICAgICBvdGhlckNoaWxkID0gbm9kZS5sZWZ0O1xuICAgICAgfVxuXG4gICAgICBuZWFyZXN0U2VhcmNoKGJlc3RDaGlsZCEpO1xuXG4gICAgICBpZiAob3duRGlzdGFuY2UgPCBiZXN0Tm9kZS5kaXN0YW5jZSkge1xuICAgICAgICBzYXZlTm9kZShub2RlLCBvd25EaXN0YW5jZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpbmQgZGlzdGFuY2UgdG8gaHlwZXJwbGFuZS5cbiAgICAgIGNvbnN0IHBvaW50T25IeXBlcnBsYW5lID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwLFxuICAgICAgfTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kaW1lbnNpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpID09PSBub2RlLmRpbWVuc2lvbikge1xuICAgICAgICAgIHBvaW50T25IeXBlcnBsYW5lW3RoaXMuZGltZW5zaW9uc1tpXV0gPSBwb2ludFt0aGlzLmRpbWVuc2lvbnNbaV1dO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBvaW50T25IeXBlcnBsYW5lW3RoaXMuZGltZW5zaW9uc1tpXV0gPSBub2RlLm9ialt0aGlzLmRpbWVuc2lvbnNbaV1dO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBoeXBlcnBsYW5lIGlzIGNsb3NlciB0aGFuIHRoZSBjdXJyZW50IGJlc3QgcG9pbnQgdGhlbiB3ZVxuICAgICAgLy8gbmVlZCB0byBzZWFyY2ggZG93biB0aGUgb3RoZXIgc2lkZSBvZiB0aGUgdHJlZS5cbiAgICAgIGlmIChcbiAgICAgICAgb3RoZXJDaGlsZCAhPT0gbnVsbCAmJlxuICAgICAgICB0aGlzLm1ldHJpYyhwb2ludE9uSHlwZXJwbGFuZSwgbm9kZS5vYmopIDwgYmVzdE5vZGUuZGlzdGFuY2VcbiAgICAgICkge1xuICAgICAgICBuZWFyZXN0U2VhcmNoKG90aGVyQ2hpbGQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAodGhpcy5yb290KSB7XG4gICAgICBuZWFyZXN0U2VhcmNoKHRoaXMucm9vdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJlc3ROb2RlLm5vZGUhLm9iajtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgdGhlIGZyb20gcGFyZW50IE5vZGUgb24gZG93bi5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gcG9pbnRzIC0gQW4gYXJyYXkgb2Yge3g6eCwgeTp5fS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlcHRoIC0gVGhlIGN1cnJlbnQgZGVwdGggZnJvbSB0aGUgcm9vdCBub2RlLlxuICAgKiBAcGFyYW0ge05vZGV9IHBhcmVudCAtIFRoZSBwYXJlbnQgTm9kZS5cbiAgICovXG4gIHByaXZhdGUgX2J1aWxkVHJlZShcbiAgICBwb2ludHM6IFBvaW50W10sXG4gICAgZGVwdGg6IG51bWJlcixcbiAgICBwYXJlbnQ6IE5vZGU8UG9pbnQ+IHwgbnVsbFxuICApOiBOb2RlPFBvaW50PiB8IG51bGwge1xuICAgIC8vIEV2ZXJ5IHN0ZXAgZGVlcGVyIGludG8gdGhlIHRyZWUgd2Ugc3dpdGNoIHRvIHVzaW5nIGFub3RoZXIgYXhpcy5cbiAgICBjb25zdCBkaW0gPSBkZXB0aCAlIHRoaXMuZGltZW5zaW9ucy5sZW5ndGg7XG5cbiAgICBpZiAocG9pbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChwb2ludHMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gbmV3IE5vZGUocG9pbnRzWzBdLCBkaW0sIHBhcmVudCk7XG4gICAgfVxuXG4gICAgcG9pbnRzLnNvcnQoKGEsIGIpID0+IGFbdGhpcy5kaW1lbnNpb25zW2RpbV1dIC0gYlt0aGlzLmRpbWVuc2lvbnNbZGltXV0pO1xuXG4gICAgY29uc3QgbWVkaWFuID0gTWF0aC5mbG9vcihwb2ludHMubGVuZ3RoIC8gMik7XG4gICAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlKHBvaW50c1ttZWRpYW5dLCBkaW0sIHBhcmVudCk7XG4gICAgbm9kZS5sZWZ0ID0gdGhpcy5fYnVpbGRUcmVlKHBvaW50cy5zbGljZSgwLCBtZWRpYW4pLCBkZXB0aCArIDEsIG5vZGUpO1xuICAgIG5vZGUucmlnaHQgPSB0aGlzLl9idWlsZFRyZWUocG9pbnRzLnNsaWNlKG1lZGlhbiArIDEpLCBkZXB0aCArIDEsIG5vZGUpO1xuXG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBjbGFtcCB9IGZyb20gXCIuLi8uLi9tZXRyaWNzL3JhbmdlLnRzXCI7XG5pbXBvcnQgeyBSZW5kZXJPcHRpb25zIH0gZnJvbSBcIi4uL3JlbmRlcmVyLnRzXCI7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuL3BvaW50LnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGF5Um93IHtcbiAgZGF5OiBudW1iZXI7XG4gIHJvdzogbnVtYmVyO1xufVxuXG4vKiogRmVhdHVyZXMgb2YgdGhlIGNoYXJ0IHdlIGNhbiBhc2sgZm9yIGNvb3JkaW5hdGVzIG9mLCB3aGVyZSB0aGUgdmFsdWUgcmV0dXJuZWQgaXNcbiAqIHRoZSB0b3AgbGVmdCBjb29yZGluYXRlIG9mIHRoZSBmZWF0dXJlLlxuICovXG5leHBvcnQgZW51bSBGZWF0dXJlIHtcbiAgdGFza0xpbmVTdGFydCxcbiAgdGV4dFN0YXJ0LFxuICBncm91cFRleHRTdGFydCxcbiAgcGVyY2VudFN0YXJ0LFxuICB2ZXJ0aWNhbEFycm93RGVzdFRvcCxcbiAgdmVydGljYWxBcnJvd0Rlc3RCb3R0b20sXG4gIGhvcml6b250YWxBcnJvd0Rlc3QsXG4gIHZlcnRpY2FsQXJyb3dTdGFydCxcbiAgaG9yaXpvbnRhbEFycm93U3RhcnQsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVUb3AsXG4gIHZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVCb3R0b20sXG4gIGhvcml6b250YWxBcnJvd0Rlc3RUb01pbGVzdG9uZSxcbiAgdmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZVRvcCxcbiAgdmVydGljYWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZUJvdHRvbSxcbiAgaG9yaXpvbnRhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lLFxuICBncm91cEVudmVsb3BlU3RhcnQsXG4gIHRhc2tFbnZlbG9wZVRvcCxcblxuICBkaXNwbGF5UmFuZ2VUb3AsXG4gIHRhc2tSb3dCb3R0b20sXG5cbiAgdGltZU1hcmtTdGFydCxcbiAgdGltZU1hcmtFbmQsXG4gIHRpbWVUZXh0U3RhcnQsXG5cbiAgZ3JvdXBUaXRsZVRleHRTdGFydCxcblxuICB0YXNrc0NsaXBSZWN0T3JpZ2luLFxuICBncm91cEJ5T3JpZ2luLFxufVxuXG4vKiogU2l6ZXMgb2YgZmVhdHVyZXMgb2YgYSByZW5kZXJlZCBjaGFydC4gKi9cbmV4cG9ydCBlbnVtIE1ldHJpYyB7XG4gIHRhc2tMaW5lSGVpZ2h0LFxuICBwZXJjZW50SGVpZ2h0LFxuICBhcnJvd0hlYWRIZWlnaHQsXG4gIGFycm93SGVhZFdpZHRoLFxuICBtaWxlc3RvbmVEaWFtZXRlcixcbiAgbGluZURhc2hMaW5lLFxuICBsaW5lRGFzaEdhcCxcbiAgdGV4dFhPZmZzZXQsXG4gIHJvd0hlaWdodCxcbn1cblxuLyoqIE1ha2VzIGEgbnVtYmVyIG9kZCwgYWRkcyBvbmUgaWYgZXZlbi4gKi9cbmNvbnN0IG1ha2VPZGQgPSAobjogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgaWYgKG4gJSAyID09PSAwKSB7XG4gICAgcmV0dXJuIG4gKyAxO1xuICB9XG4gIHJldHVybiBuO1xufTtcblxuLyoqIFNjYWxlIGNvbnNvbGlkYXRlcyBhbGwgY2FsY3VsYXRpb25zIGFyb3VuZCByZW5kZXJpbmcgYSBjaGFydCBvbnRvIGEgc3VyZmFjZS4gKi9cbmV4cG9ydCBjbGFzcyBTY2FsZSB7XG4gIHByaXZhdGUgZGF5V2lkdGhQeDogbnVtYmVyO1xuICBwcml2YXRlIHJvd0hlaWdodFB4OiBudW1iZXI7XG4gIHByaXZhdGUgYmxvY2tTaXplUHg6IG51bWJlcjtcbiAgcHJpdmF0ZSB0YXNrSGVpZ2h0UHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBsaW5lV2lkdGhQeDogbnVtYmVyO1xuICBwcml2YXRlIG1hcmdpblNpemVQeDogbnVtYmVyO1xuICBwcml2YXRlIHRpbWVsaW5lSGVpZ2h0UHg6IG51bWJlcjtcbiAgcHJpdmF0ZSBvcmlnaW46IFBvaW50O1xuICBwcml2YXRlIHRvdGFsTnVtYmVyT2ZEYXlzOiBudW1iZXI7XG4gIHByaXZhdGUgZ3JvdXBCeUNvbHVtbldpZHRoUHg6IG51bWJlcjtcblxuICBwcml2YXRlIHRpbWVsaW5lT3JpZ2luOiBQb2ludDtcbiAgcHJpdmF0ZSB0YXNrc09yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgZ3JvdXBCeU9yaWdpbjogUG9pbnQ7XG4gIHByaXZhdGUgdGFza3NDbGlwUmVjdE9yaWdpbjogUG9pbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgICBjYW52YXNXaWR0aFB4OiBudW1iZXIsXG4gICAgdG90YWxOdW1iZXJPZkRheXM6IG51bWJlcixcbiAgICBtYXhHcm91cE5hbWVMZW5ndGg6IG51bWJlciA9IDBcbiAgKSB7XG4gICAgdGhpcy50b3RhbE51bWJlck9mRGF5cyA9IHRvdGFsTnVtYmVyT2ZEYXlzO1xuICAgIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggPSBtYXhHcm91cE5hbWVMZW5ndGggKiBvcHRzLmZvbnRTaXplUHg7XG5cbiAgICB0aGlzLmJsb2NrU2l6ZVB4ID0gTWF0aC5mbG9vcihvcHRzLmZvbnRTaXplUHggLyAzKTtcbiAgICB0aGlzLnRhc2tIZWlnaHRQeCA9IG1ha2VPZGQoTWF0aC5mbG9vcigodGhpcy5ibG9ja1NpemVQeCAqIDMpIC8gNCkpO1xuICAgIHRoaXMubGluZVdpZHRoUHggPSBtYWtlT2RkKE1hdGguZmxvb3IodGhpcy50YXNrSGVpZ2h0UHggLyAzKSk7XG4gICAgY29uc3QgbWlsZXN0b25lUmFkaXVzID0gTWF0aC5jZWlsKHRoaXMudGFza0hlaWdodFB4IC8gMikgKyB0aGlzLmxpbmVXaWR0aFB4O1xuICAgIHRoaXMubWFyZ2luU2l6ZVB4ID0gbWlsZXN0b25lUmFkaXVzO1xuICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCA9IG9wdHMuaGFzVGltZWxpbmVcbiAgICAgID8gTWF0aC5jZWlsKChvcHRzLmZvbnRTaXplUHggKiA0KSAvIDMpXG4gICAgICA6IDA7XG5cbiAgICB0aGlzLnRpbWVsaW5lT3JpZ2luID0gbmV3IFBvaW50KG1pbGVzdG9uZVJhZGl1cywgMCk7XG4gICAgdGhpcy5ncm91cEJ5T3JpZ2luID0gbmV3IFBvaW50KDAsIG1pbGVzdG9uZVJhZGl1cyArIHRoaXMudGltZWxpbmVIZWlnaHRQeCk7XG5cbiAgICBsZXQgYmVnaW5PZmZzZXQgPSAwO1xuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZSA9PT0gbnVsbCB8fCBvcHRzLmRpc3BsYXlSYW5nZVVzYWdlID09PSBcImhpZ2hsaWdodFwiKSB7XG4gICAgICAvLyBEbyBub3QgZm9yY2UgZGF5V2lkdGhQeCB0byBhbiBpbnRlZ2VyLCBpdCBjb3VsZCBnbyB0byAwIGFuZCBjYXVzZSBhbGxcbiAgICAgIC8vIHRhc2tzIHRvIGJlIHJlbmRlcmVkIGF0IDAgd2lkdGguXG4gICAgICB0aGlzLmRheVdpZHRoUHggPVxuICAgICAgICAoY2FudmFzV2lkdGhQeCAtIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHggLSAyICogdGhpcy5tYXJnaW5TaXplUHgpIC9cbiAgICAgICAgdG90YWxOdW1iZXJPZkRheXM7XG4gICAgICB0aGlzLm9yaWdpbiA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2hvdWxkIHdlIHNldCB4LW1hcmdpbnMgdG8gMCBpZiBhIFN1YlJhbmdlIGlzIHJlcXVlc3RlZD9cbiAgICAgIC8vIE9yIHNob3VsZCB3ZSB0b3RhbGx5IGRyb3AgYWxsIG1hcmdpbnMgZnJvbSBoZXJlIGFuZCBqdXN0IHVzZVxuICAgICAgLy8gQ1NTIG1hcmdpbnMgb24gdGhlIGNhbnZhcyBlbGVtZW50P1xuICAgICAgdGhpcy5kYXlXaWR0aFB4ID1cbiAgICAgICAgKGNhbnZhc1dpZHRoUHggLSB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gMiAqIHRoaXMubWFyZ2luU2l6ZVB4KSAvXG4gICAgICAgIG9wdHMuZGlzcGxheVJhbmdlLnJhbmdlSW5EYXlzO1xuICAgICAgYmVnaW5PZmZzZXQgPSBNYXRoLmZsb29yKFxuICAgICAgICB0aGlzLmRheVdpZHRoUHggKiBvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiArIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgICApO1xuICAgICAgdGhpcy5vcmlnaW4gPSBuZXcgUG9pbnQoLWJlZ2luT2Zmc2V0ICsgdGhpcy5tYXJnaW5TaXplUHgsIDApO1xuICAgIH1cblxuICAgIHRoaXMudGFza3NPcmlnaW4gPSBuZXcgUG9pbnQoXG4gICAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4IC0gYmVnaW5PZmZzZXQgKyBtaWxlc3RvbmVSYWRpdXMsXG4gICAgICB0aGlzLnRpbWVsaW5lSGVpZ2h0UHggKyBtaWxlc3RvbmVSYWRpdXNcbiAgICApO1xuXG4gICAgdGhpcy50YXNrc0NsaXBSZWN0T3JpZ2luID0gbmV3IFBvaW50KFxuICAgICAgdGhpcy5ncm91cEJ5Q29sdW1uV2lkdGhQeCxcbiAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICk7XG5cbiAgICBpZiAob3B0cy5oYXNUZXh0KSB7XG4gICAgICB0aGlzLnJvd0hlaWdodFB4ID0gNiAqIHRoaXMuYmxvY2tTaXplUHg7IC8vIFRoaXMgbWlnaHQgYWxzbyBiZSBgKGNhbnZhc0hlaWdodFB4IC0gMiAqIG9wdHMubWFyZ2luU2l6ZVB4KSAvIG51bWJlclN3aW1MYW5lc2AgaWYgaGVpZ2h0IGlzIHN1cHBsaWVkP1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJvd0hlaWdodFB4ID0gMS4xICogdGhpcy5ibG9ja1NpemVQeDtcbiAgICB9XG4gIH1cblxuICAvKiogVGhlIGhlaWdodCBvZiB0aGUgY2hhcnQuIE5vdGUgdGhhdCBpdCdzIG5vdCBjb25zdHJhaW5lZCBieSB0aGUgY2FudmFzLiAqL1xuICBwdWJsaWMgaGVpZ2h0KG1heFJvd3M6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIChcbiAgICAgIG1heFJvd3MgKiB0aGlzLnJvd0hlaWdodFB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4ICsgMiAqIHRoaXMubWFyZ2luU2l6ZVB4XG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBkYXlSb3dGcm9tUG9pbnQocG9pbnQ6IFBvaW50KTogRGF5Um93IHtcbiAgICAvLyBUaGlzIHNob3VsZCBhbHNvIGNsYW1wIHRoZSByZXR1cm5lZCAneCcgdmFsdWUgdG8gWzAsIG1heFJvd3MpLlxuICAgIHJldHVybiB7XG4gICAgICBkYXk6IGNsYW1wKFxuICAgICAgICBNYXRoLmZsb29yKFxuICAgICAgICAgICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAqIHBvaW50LnggLVxuICAgICAgICAgICAgdGhpcy5vcmlnaW4ueCAtXG4gICAgICAgICAgICB0aGlzLm1hcmdpblNpemVQeCAtXG4gICAgICAgICAgICB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4KSAvXG4gICAgICAgICAgICB0aGlzLmRheVdpZHRoUHhcbiAgICAgICAgKSxcbiAgICAgICAgMCxcbiAgICAgICAgdGhpcy50b3RhbE51bWJlck9mRGF5c1xuICAgICAgKSxcbiAgICAgIHJvdzogTWF0aC5mbG9vcihcbiAgICAgICAgKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICogcG9pbnQueSAtXG4gICAgICAgICAgdGhpcy5vcmlnaW4ueSAtXG4gICAgICAgICAgdGhpcy5tYXJnaW5TaXplUHggLVxuICAgICAgICAgIHRoaXMudGltZWxpbmVIZWlnaHRQeCkgL1xuICAgICAgICAgIHRoaXMucm93SGVpZ2h0UHhcbiAgICAgICksXG4gICAgfTtcbiAgfVxuXG4gIC8qKiBUaGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSBib3VuZGluZyBib3ggZm9yIGEgc2luZ2xlIHRhc2suICovXG4gIHByaXZhdGUgdGFza1Jvd0VudmVsb3BlU3RhcnQocm93OiBudW1iZXIsIGRheTogbnVtYmVyKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5zdW0oXG4gICAgICBuZXcgUG9pbnQoXG4gICAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgICAgZGF5ICogdGhpcy5kYXlXaWR0aFB4ICsgdGhpcy5tYXJnaW5TaXplUHggKyB0aGlzLmdyb3VwQnlDb2x1bW5XaWR0aFB4XG4gICAgICAgICksXG4gICAgICAgIE1hdGguZmxvb3IoXG4gICAgICAgICAgcm93ICogdGhpcy5yb3dIZWlnaHRQeCArIHRoaXMubWFyZ2luU2l6ZVB4ICsgdGhpcy50aW1lbGluZUhlaWdodFB4XG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICBwcml2YXRlIGdyb3VwUm93RW52ZWxvcGVTdGFydChyb3c6IG51bWJlciwgZGF5OiBudW1iZXIpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMuZ3JvdXBCeU9yaWdpbi5zdW0oXG4gICAgICBuZXcgUG9pbnQoXG4gICAgICAgIDAsXG4gICAgICAgIHJvdyAqIHRoaXMucm93SGVpZ2h0UHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMudGltZWxpbmVIZWlnaHRQeFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGdyb3VwSGVhZGVyU3RhcnQoKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLm9yaWdpbi5zdW0obmV3IFBvaW50KHRoaXMubWFyZ2luU2l6ZVB4LCB0aGlzLm1hcmdpblNpemVQeCkpO1xuICB9XG5cbiAgcHJpdmF0ZSB0aW1lRW52ZWxvcGVTdGFydChkYXk6IG51bWJlcik6IFBvaW50IHtcbiAgICByZXR1cm4gdGhpcy5vcmlnaW4uc3VtKFxuICAgICAgbmV3IFBvaW50KFxuICAgICAgICBkYXkgKiB0aGlzLmRheVdpZHRoUHggKyB0aGlzLm1hcmdpblNpemVQeCArIHRoaXMuZ3JvdXBCeUNvbHVtbldpZHRoUHgsXG4gICAgICAgIDBcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLyoqIFJldHVybnMgdGhlIGNvb3JkaW5hdGUgb2YgdGhlIGl0ZW0gKi9cbiAgZmVhdHVyZShyb3c6IG51bWJlciwgZGF5OiBudW1iZXIsIGNvb3JkOiBGZWF0dXJlKTogUG9pbnQge1xuICAgIHN3aXRjaCAoY29vcmQpIHtcbiAgICAgIGNhc2UgRmVhdHVyZS50YXNrTGluZVN0YXJ0OlxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9wOlxuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMucm93SGVpZ2h0UHggLSB0aGlzLmJsb2NrU2l6ZVB4XG4gICAgICAgICk7XG5cbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdEJvdHRvbTpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZCgwLCB0aGlzLnJvd0hlaWdodFB4KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50ZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KS5hZGQoXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeCxcbiAgICAgICAgICB0aGlzLmJsb2NrU2l6ZVB4XG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUuZ3JvdXBUZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwUm93RW52ZWxvcGVTdGFydChyb3csIGRheSkuYWRkKFxuICAgICAgICAgIHRoaXMuYmxvY2tTaXplUHgsXG4gICAgICAgICAgdGhpcy5ibG9ja1NpemVQeFxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLnBlcmNlbnRTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMucm93SGVpZ2h0UHggLSB0aGlzLmxpbmVXaWR0aFB4XG4gICAgICAgICk7XG4gICAgICBjYXNlIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdDpcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIE1hdGguZmxvb3IodGhpcy5yb3dIZWlnaHRQeCAtIDAuNSAqIHRoaXMuYmxvY2tTaXplUHgpIC0gMVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVUb3A6XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3ApLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLnZlcnRpY2FsQXJyb3dEZXN0VG9NaWxlc3RvbmVCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RUb3ApLmFkZChcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0VG9NaWxlc3RvbmU6XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmUocm93LCBkYXksIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdCkuYWRkKFxuICAgICAgICAgIC0xICogdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKSxcbiAgICAgICAgICAtMSAqIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcilcbiAgICAgICAgKTtcbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydCkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgLTEgKiB0aGlzLm1ldHJpYyhNZXRyaWMubWlsZXN0b25lRGlhbWV0ZXIpXG4gICAgICAgICk7XG5cbiAgICAgIGNhc2UgRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tOlxuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydCkuYWRkKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKVxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZTpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZShyb3csIGRheSwgRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydCkuYWRkKFxuICAgICAgICAgIHRoaXMubWV0cmljKE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlciksXG4gICAgICAgICAgMFxuICAgICAgICApO1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tFbnZlbG9wZVRvcDpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza1Jvd0VudmVsb3BlU3RhcnQocm93LCBkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwRW52ZWxvcGVTdGFydDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBSb3dFbnZlbG9wZVN0YXJ0KHJvdywgZGF5KTtcbiAgICAgIGNhc2UgRmVhdHVyZS50aW1lTWFya1N0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50aW1lRW52ZWxvcGVTdGFydChkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRpbWVNYXJrRW5kOlxuICAgICAgICByZXR1cm4gdGhpcy50aW1lRW52ZWxvcGVTdGFydChkYXkpLmFkZCgwLCB0aGlzLnJvd0hlaWdodFB4ICogKHJvdyArIDEpKTtcbiAgICAgIGNhc2UgRmVhdHVyZS50aW1lVGV4dFN0YXJ0OlxuICAgICAgICByZXR1cm4gdGhpcy50aW1lRW52ZWxvcGVTdGFydChkYXkpLmFkZCh0aGlzLmJsb2NrU2l6ZVB4LCAwKTtcblxuICAgICAgY2FzZSBGZWF0dXJlLmdyb3VwVGl0bGVUZXh0U3RhcnQ6XG4gICAgICAgIHJldHVybiB0aGlzLmdyb3VwSGVhZGVyU3RhcnQoKS5hZGQodGhpcy5ibG9ja1NpemVQeCwgMCk7XG4gICAgICBjYXNlIEZlYXR1cmUuZGlzcGxheVJhbmdlVG9wOlxuICAgICAgICByZXR1cm4gdGhpcy50aW1lRW52ZWxvcGVTdGFydChkYXkpO1xuICAgICAgY2FzZSBGZWF0dXJlLnRhc2tSb3dCb3R0b206XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tSb3dFbnZlbG9wZVN0YXJ0KHJvdyArIDEsIGRheSk7XG4gICAgICBjYXNlIEZlYXR1cmUudGFza3NDbGlwUmVjdE9yaWdpbjpcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza3NDbGlwUmVjdE9yaWdpbjtcbiAgICAgIGNhc2UgRmVhdHVyZS5ncm91cEJ5T3JpZ2luOlxuICAgICAgICByZXR1cm4gdGhpcy5ncm91cEJ5T3JpZ2luO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gVGhlIGxpbmUgYmVsb3cgd2lsbCBub3QgY29tcGlsZSBpZiB5b3UgbWlzc2VkIGFuIGVudW0gaW4gdGhlIHN3aXRjaCBhYm92ZS5cbiAgICAgICAgY29vcmQgc2F0aXNmaWVzIG5ldmVyO1xuICAgICAgICByZXR1cm4gbmV3IFBvaW50KDAsIDApO1xuICAgIH1cbiAgfVxuXG4gIG1ldHJpYyhmZWF0dXJlOiBNZXRyaWMpOiBudW1iZXIge1xuICAgIHN3aXRjaCAoZmVhdHVyZSkge1xuICAgICAgY2FzZSBNZXRyaWMudGFza0xpbmVIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tIZWlnaHRQeDtcbiAgICAgIGNhc2UgTWV0cmljLnBlcmNlbnRIZWlnaHQ6XG4gICAgICAgIHJldHVybiB0aGlzLmxpbmVXaWR0aFB4O1xuICAgICAgY2FzZSBNZXRyaWMuYXJyb3dIZWFkSGVpZ2h0OlxuICAgICAgICByZXR1cm4gdGhpcy50YXNrSGVpZ2h0UHg7XG4gICAgICBjYXNlIE1ldHJpYy5hcnJvd0hlYWRXaWR0aDpcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLnRhc2tIZWlnaHRQeCk7XG4gICAgICBjYXNlIE1ldHJpYy5taWxlc3RvbmVEaWFtZXRlcjpcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLnRhc2tIZWlnaHRQeCk7XG4gICAgICBjYXNlIE1ldHJpYy5saW5lRGFzaExpbmU6XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrU2l6ZVB4O1xuICAgICAgY2FzZSBNZXRyaWMubGluZURhc2hHYXA6XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrU2l6ZVB4O1xuICAgICAgY2FzZSBNZXRyaWMudGV4dFhPZmZzZXQ6XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrU2l6ZVB4O1xuICAgICAgY2FzZSBNZXRyaWMucm93SGVpZ2h0OlxuICAgICAgICByZXR1cm4gdGhpcy5yb3dIZWlnaHRQeDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIFRoZSBsaW5lIGJlbG93IHdpbGwgbm90IGNvbXBpbGUgaWYgeW91IG1pc3NlZCBhbiBlbnVtIGluIHRoZSBzd2l0Y2ggYWJvdmUuXG4gICAgICAgIGZlYXR1cmUgc2F0aXNmaWVzIG5ldmVyO1xuICAgICAgICByZXR1cm4gMC4wO1xuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IFRhc2ssIHZhbGlkYXRlQ2hhcnQgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcbmltcG9ydCB7IENoYXJ0TGlrZSwgZmlsdGVyLCBGaWx0ZXJGdW5jIH0gZnJvbSBcIi4uL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSwgVmVydGV4SW5kaWNlcyB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBQbGFuIH0gZnJvbSBcIi4uL3BsYW4vcGxhbi50c1wiO1xuaW1wb3J0IHsgUmVzb3VyY2VEZWZpbml0aW9uIH0gZnJvbSBcIi4uL3Jlc291cmNlcy9yZXNvdXJjZXMudHNcIjtcbmltcG9ydCB7IFJlc3VsdCwgb2sgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBTcGFuIH0gZnJvbSBcIi4uL3NsYWNrL3NsYWNrLnRzXCI7XG5pbXBvcnQgeyBLRFRyZWUgfSBmcm9tIFwiLi9rZC9rZC50c1wiO1xuaW1wb3J0IHsgRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4vcmFuZ2UvcmFuZ2UudHNcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4vc2NhbGUvcG9pbnQudHNcIjtcbmltcG9ydCB7IEZlYXR1cmUsIE1ldHJpYywgU2NhbGUgfSBmcm9tIFwiLi9zY2FsZS9zY2FsZS50c1wiO1xuXG50eXBlIERpcmVjdGlvbiA9IFwidXBcIiB8IFwiZG93blwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbG9ycyB7XG4gIHN1cmZhY2U6IHN0cmluZztcbiAgb25TdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZU11dGVkOiBzdHJpbmc7XG4gIG9uU3VyZmFjZUhpZ2hsaWdodDogc3RyaW5nO1xuICBvdmVybGF5OiBzdHJpbmc7XG4gIGdyb3VwQ29sb3I6IHN0cmluZztcbiAgaGlnaGxpZ2h0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCB0eXBlIFRhc2tJbmRleFRvUm93ID0gTWFwPG51bWJlciwgbnVtYmVyPjtcblxuLyoqIEZ1bmN0aW9uIHVzZSB0byBwcm9kdWNlIGEgdGV4dCBsYWJlbCBmb3IgYSB0YXNrIGFuZCBpdHMgc2xhY2suICovXG5leHBvcnQgdHlwZSBUYXNrTGFiZWwgPSAodGFza0luZGV4OiBudW1iZXIpID0+IHN0cmluZztcblxuLyoqIENvbnRyb2xzIG9mIHRoZSBkaXNwbGF5UmFuZ2UgaW4gUmVuZGVyT3B0aW9ucyBpcyB1c2VkLlxuICpcbiAqICBcInJlc3RyaWN0XCI6IE9ubHkgZGlzcGxheSB0aGUgcGFydHMgb2YgdGhlIGNoYXJ0IHRoYXQgYXBwZWFyIGluIHRoZSByYW5nZS5cbiAqXG4gKiAgXCJoaWdobGlnaHRcIjogRGlzcGxheSB0aGUgZnVsbCByYW5nZSBvZiB0aGUgZGF0YSwgYnV0IGhpZ2hsaWdodCB0aGUgcmFuZ2UuXG4gKi9cbmV4cG9ydCB0eXBlIERpc3BsYXlSYW5nZVVzYWdlID0gXCJyZXN0cmljdFwiIHwgXCJoaWdobGlnaHRcIjtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUYXNrTGFiZWw6IFRhc2tMYWJlbCA9ICh0YXNrSW5kZXg6IG51bWJlcik6IHN0cmluZyA9PlxuICB0YXNrSW5kZXgudG9GaXhlZCgwKTtcblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJPcHRpb25zIHtcbiAgLyoqIFRoZSB0ZXh0IGZvbnQgc2l6ZSwgdGhpcyBkcml2ZXMgdGhlIHNpemUgb2YgYWxsIG90aGVyIGNoYXJ0IGZlYXR1cmVzLlxuICAgKiAqL1xuICBmb250U2l6ZVB4OiBudW1iZXI7XG5cbiAgLyoqIERpc3BsYXkgdGV4dCBpZiB0cnVlLiAqL1xuICBoYXNUZXh0OiBib29sZWFuO1xuXG4gIC8qKiBJZiBzdXBwbGllZCB0aGVuIG9ubHkgdGhlIHRhc2tzIGluIHRoZSBnaXZlbiByYW5nZSB3aWxsIGJlIGRpc3BsYXllZC4gKi9cbiAgZGlzcGxheVJhbmdlOiBEaXNwbGF5UmFuZ2UgfCBudWxsO1xuXG4gIC8qKiBDb250cm9scyBob3cgdGhlIGBkaXNwbGF5UmFuZ2VgIGlzIHVzZWQgaWYgc3VwcGxpZWQuICovXG4gIGRpc3BsYXlSYW5nZVVzYWdlOiBEaXNwbGF5UmFuZ2VVc2FnZTtcblxuICAvKiogVGhlIGNvbG9yIHRoZW1lLiAqL1xuICBjb2xvcnM6IENvbG9ycztcblxuICAvKiogSWYgdHJ1ZSB0aGVuIGRpc3BsYXkgdGltZXMgYXQgdGhlIHRvcCBvZiB0aGUgY2hhcnQuICovXG4gIGhhc1RpbWVsaW5lOiBib29sZWFuO1xuXG4gIC8qKiBJZiB0cnVlIHRoZW4gZGlzcGxheSB0aGUgdGFzayBiYXJzLiAqL1xuICBoYXNUYXNrczogYm9vbGVhbjtcblxuICAvKiogSWYgdHJ1ZSB0aGVuIGRyYXcgdmVydGljYWwgbGluZXMgZnJvbSB0aGUgdGltZWxpbmUgZG93biB0byB0YXNrIHN0YXJ0IGFuZFxuICAgKiBmaW5pc2ggcG9pbnRzLiAqL1xuICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiBib29sZWFuO1xuXG4gIC8qKiBEcmF3IGRlcGVuZGVuY3kgZWRnZXMgYmV0d2VlbiB0YXNrcyBpZiB0cnVlLiAqL1xuICBoYXNFZGdlczogYm9vbGVhbjtcblxuICAvKiogRnVuY3Rpb24gdGhhdCBwcm9kdWNlcyBkaXNwbGF5IHRleHQgZm9yIGEgVGFzayBhbmQgaXRzIGFzc29jaWF0ZWQgU2xhY2suICovXG4gIHRhc2tMYWJlbDogVGFza0xhYmVsO1xuXG4gIC8qKiBUaGUgaW5kaWNlcyBvZiB0YXNrcyB0aGF0IHNob3VsZCBiZSBlbXBoYXNpemVkIHdoZW4gZHJhdywgdHlwaWNhbGx5IHVzZWRcbiAgICogdG8gZGVub3RlIHRoZSBjcml0aWNhbCBwYXRoLiAqL1xuICB0YXNrRW1waGFzaXplOiBudW1iZXJbXTtcblxuICAvKiogRmlsdGVyIHRoZSBUYXNrcyB0byBiZSBkaXNwbGF5ZWQuICovXG4gIGZpbHRlckZ1bmM6IEZpbHRlckZ1bmMgfCBudWxsO1xuXG4gIC8qKiBHcm91cCB0aGUgdGFza3MgdG9nZXRoZXIgdmVydGljYWxseSBiYXNlZCBvbiB0aGUgZ2l2ZW4gcmVzb3VyY2UuIElmIHRoZVxuICAgKiBlbXB0eSBzdHJpbmcgaXMgc3VwcGxpZWQgdGhlbiBqdXN0IGRpc3BsYXkgYnkgdG9wb2xvZ2ljYWwgb3JkZXIuXG4gICAqL1xuICBncm91cEJ5UmVzb3VyY2U6IHN0cmluZztcblxuICAvKiogVGFzayB0byBoaWdobGlnaHQuICovXG4gIGhpZ2hsaWdodGVkVGFzazogbnVsbCB8IG51bWJlcjtcblxuICAvKiogVGhlIGluZGV4IG9mIHRoZSBzZWxlY3RlZCB0YXNrLCBvciAtMSBpZiBubyB0YXNrIGlzIHNlbGVjdGVkLiBUaGlzIGlzXG4gICAqIGFsd2F5cyBhbiBpbmRleCBpbnRvIHRoZSBvcmlnaW5hbCBjaGFydCwgYW5kIG5vdCBhbiBpbmRleCBpbnRvIGEgZmlsdGVyZWRcbiAgICogY2hhcnQuXG4gICAqL1xuICBzZWxlY3RlZFRhc2tJbmRleDogbnVtYmVyO1xufVxuXG5jb25zdCB2ZXJ0aWNhbEFycm93U3RhcnRGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9IChcbiAgdGFzazogVGFzayxcbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb25cbik6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZG93blwiKSB7XG4gICAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lQm90dG9tO1xuICAgIH1cbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93U3RhcnRGcm9tTWlsZXN0b25lVG9wO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGZWF0dXJlLnZlcnRpY2FsQXJyb3dTdGFydDtcbiAgfVxufTtcblxuY29uc3QgdmVydGljYWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbiA9IChcbiAgdGFzazogVGFzayxcbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb25cbik6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZG93blwiKSB7XG4gICAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lVG9wO1xuICAgIH1cbiAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvTWlsZXN0b25lQm90dG9tO1xuICB9IGVsc2Uge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZG93blwiKSB7XG4gICAgICByZXR1cm4gRmVhdHVyZS52ZXJ0aWNhbEFycm93RGVzdFRvcDtcbiAgICB9XG4gICAgcmV0dXJuIEZlYXR1cmUudmVydGljYWxBcnJvd0Rlc3RCb3R0b207XG4gIH1cbn07XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbmNvbnN0IGhvcml6b250YWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24gPSAodGFzazogVGFzayk6IEZlYXR1cmUgPT4ge1xuICBpZiAodGFzay5kdXJhdGlvbiA9PT0gMCkge1xuICAgIHJldHVybiBGZWF0dXJlLmhvcml6b250YWxBcnJvd1N0YXJ0RnJvbU1pbGVzdG9uZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dTdGFydDtcbiAgfVxufTtcblxuY29uc3QgaG9yaXpvbnRhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uID0gKHRhc2s6IFRhc2spOiBGZWF0dXJlID0+IHtcbiAgaWYgKHRhc2suZHVyYXRpb24gPT09IDApIHtcbiAgICByZXR1cm4gRmVhdHVyZS5ob3Jpem9udGFsQXJyb3dEZXN0VG9NaWxlc3RvbmU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEZlYXR1cmUuaG9yaXpvbnRhbEFycm93RGVzdDtcbiAgfVxufTtcblxuLyoqXG4gKiBDb21wdXRlIHdoYXQgdGhlIGhlaWdodCBvZiB0aGUgY2FudmFzIHNob3VsZCBiZS4gTm90ZSB0aGF0IHRoZSB2YWx1ZSBkb2Vzbid0XG4gKiBrbm93IGFib3V0IGB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb2AsIHNvIGlmIHRoZSBjYW52YXMgaXMgYWxyZWFkeSBzY2FsZWQgYnlcbiAqIGB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb2AgdGhlbiBzbyB3aWxsIHRoZSByZXN1bHQgb2YgdGhpcyBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1Z2dlc3RlZENhbnZhc0hlaWdodChcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcbiAgc3BhbnM6IFNwYW5bXSxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgbWF4Um93czogbnVtYmVyXG4pOiBudW1iZXIge1xuICBpZiAoIW9wdHMuaGFzVGFza3MpIHtcbiAgICBtYXhSb3dzID0gMDtcbiAgfVxuICByZXR1cm4gbmV3IFNjYWxlKFxuICAgIG9wdHMsXG4gICAgY2FudmFzLndpZHRoLFxuICAgIHNwYW5zW3NwYW5zLmxlbmd0aCAtIDFdLmZpbmlzaCArIDFcbiAgKS5oZWlnaHQobWF4Um93cyk7XG59XG5cbi8vIFRoZSBsb2NhdGlvbiwgaW4gY2FudmFzIHBpeGVsIGNvb3JkaW5hdGVzLCBvZiBlYWNoIHRhc2sgYmFyLiBTaG91bGQgdXNlIHRoZVxuLy8gdGV4dCBvZiB0aGUgdGFzayBsYWJlbCBhcyB0aGUgbG9jYXRpb24sIHNpbmNlIHRoYXQncyBhbHdheXMgZHJhd24gaW4gdGhlIHZpZXdcbi8vIGlmIHBvc3NpYmxlLlxuZXhwb3J0IGludGVyZmFjZSBUYXNrTG9jYXRpb24ge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcblxuICAvLyBUaGF0IGluZGV4IG9mIHRoZSB0YXNrIGluIHRoZSB1bmZpbHRlcmVkIENoYXJ0LlxuICBvcmlnaW5hbFRhc2tJbmRleDogbnVtYmVyO1xufVxuXG50eXBlIFVwZGF0ZVR5cGUgPSBcIm1vdXNlbW92ZVwiIHwgXCJtb3VzZWRvd25cIjtcblxuLy8gQSBmdW5jIHRoYXQgdGFrZXMgYSBQb2ludCBhbmQgcmVkcmF3cyB0aGUgaGlnaGxpZ2h0ZWQgdGFzayBpZiBuZWVkZWQsIHJldHVybnNcbi8vIHRoZSBpbmRleCBvZiB0aGUgdGFzayB0aGF0IGlzIGhpZ2hsaWdodGVkLlxuZXhwb3J0IHR5cGUgVXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zID0gKFxuICBwb2ludDogUG9pbnQsXG4gIHVwZGF0ZVR5cGU6IFVwZGF0ZVR5cGVcbikgPT4gbnVtYmVyIHwgbnVsbDtcblxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJSZXN1bHQge1xuICBzY2FsZTogU2NhbGU7XG4gIHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvczogVXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zIHwgbnVsbDtcbiAgc2VsZWN0ZWRUYXNrTG9jYXRpb246IFBvaW50IHwgbnVsbDtcbn1cblxuLy8gVE9ETyAtIFBhc3MgaW4gbWF4IHJvd3MsIGFuZCBhIG1hcHBpbmcgdGhhdCBtYXBzIGZyb20gdGFza0luZGV4IHRvIHJvdyxcbi8vIGJlY2F1c2UgdHdvIGRpZmZlcmVudCB0YXNrcyBtaWdodCBiZSBwbGFjZWQgb24gdGhlIHNhbWUgcm93LiBBbHNvIHdlIHNob3VsZFxuLy8gcGFzcyBpbiBtYXggcm93cz8gT3Igc2hvdWxkIHRoYXQgY29tZSBmcm9tIHRoZSBhYm92ZSBtYXBwaW5nP1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclRhc2tzVG9DYW52YXMoXG4gIHBhcmVudDogSFRNTEVsZW1lbnQsXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBwbGFuOiBQbGFuLFxuICBzcGFuczogU3BhbltdLFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBvdmVybGF5OiBIVE1MQ2FudmFzRWxlbWVudCB8IG51bGwgPSBudWxsXG4pOiBSZXN1bHQ8UmVuZGVyUmVzdWx0PiB7XG4gIGNvbnN0IHZyZXQgPSB2YWxpZGF0ZUNoYXJ0KHBsYW4uY2hhcnQpO1xuICBpZiAoIXZyZXQub2spIHtcbiAgICByZXR1cm4gdnJldDtcbiAgfVxuXG4gIGNvbnN0IHRhc2tMb2NhdGlvbnM6IFRhc2tMb2NhdGlvbltdID0gW107XG5cbiAgY29uc3Qgb3JpZ2luYWxMYWJlbHMgPSBwbGFuLmNoYXJ0LlZlcnRpY2VzLm1hcChcbiAgICAodGFzazogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IG9wdHMudGFza0xhYmVsKHRhc2tJbmRleClcbiAgKTtcblxuICAvLyBBcHBseSB0aGUgZmlsdGVyIGFuZCB3b3JrIHdpdGggdGhlIENoYXJ0TGlrZSByZXR1cm4gZnJvbSB0aGlzIHBvaW50IG9uLlxuICAvLyBGaXRsZXIgYWxzbyBuZWVkcyB0byBiZSBhcHBsaWVkIHRvIHNwYW5zLlxuICBjb25zdCBmcmV0ID0gZmlsdGVyKFxuICAgIHBsYW4uY2hhcnQsXG4gICAgb3B0cy5maWx0ZXJGdW5jLFxuICAgIG9wdHMudGFza0VtcGhhc2l6ZSxcbiAgICBzcGFucyxcbiAgICBvcmlnaW5hbExhYmVscyxcbiAgICBvcHRzLnNlbGVjdGVkVGFza0luZGV4XG4gICk7XG4gIGlmICghZnJldC5vaykge1xuICAgIHJldHVybiBmcmV0O1xuICB9XG4gIGNvbnN0IGNoYXJ0TGlrZSA9IGZyZXQudmFsdWUuY2hhcnRMaWtlO1xuICBjb25zdCBsYWJlbHMgPSBmcmV0LnZhbHVlLmxhYmVscztcbiAgY29uc3QgcmVzb3VyY2VEZWZpbml0aW9uID0gcGxhbi5nZXRSZXNvdXJjZURlZmluaXRpb24ob3B0cy5ncm91cEJ5UmVzb3VyY2UpO1xuICBjb25zdCBmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleCA9XG4gICAgZnJldC52YWx1ZS5mcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleDtcbiAgY29uc3QgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXggPVxuICAgIGZyZXQudmFsdWUuZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXg7XG5cbiAgLy8gU2VsZWN0ZWQgdGFzaywgYXMgYW4gaW5kZXggaW50byB0aGUgdW5maWx0ZXJlZCBDaGFydC5cbiAgbGV0IGxhc3RTZWxlY3RlZFRhc2tJbmRleCA9IG9wdHMuc2VsZWN0ZWRUYXNrSW5kZXg7XG5cbiAgLy8gSGlnaGxpZ2h0ZWQgdGFza3MuXG4gIGNvbnN0IGVtcGhhc2l6ZWRUYXNrczogU2V0PG51bWJlcj4gPSBuZXcgU2V0KGZyZXQudmFsdWUuZW1waGFzaXplZFRhc2tzKTtcbiAgc3BhbnMgPSBmcmV0LnZhbHVlLnNwYW5zO1xuXG4gIC8vIENhbGN1bGF0ZSBob3cgd2lkZSB3ZSBuZWVkIHRvIG1ha2UgdGhlIGdyb3VwQnkgY29sdW1uLlxuICBsZXQgbWF4R3JvdXBOYW1lTGVuZ3RoID0gMDtcbiAgaWYgKG9wdHMuZ3JvdXBCeVJlc291cmNlICE9PSBcIlwiICYmIG9wdHMuaGFzVGV4dCkge1xuICAgIG1heEdyb3VwTmFtZUxlbmd0aCA9IG9wdHMuZ3JvdXBCeVJlc291cmNlLmxlbmd0aDtcbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXMuZm9yRWFjaCgodmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgICBtYXhHcm91cE5hbWVMZW5ndGggPSBNYXRoLm1heChtYXhHcm91cE5hbWVMZW5ndGgsIHZhbHVlLmxlbmd0aCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCB0b3RhbE51bWJlck9mUm93cyA9IHNwYW5zLmxlbmd0aDtcbiAgY29uc3QgdG90YWxOdW1iZXJPZkRheXMgPSBzcGFuc1tzcGFucy5sZW5ndGggLSAxXS5maW5pc2g7XG4gIGNvbnN0IHNjYWxlID0gbmV3IFNjYWxlKFxuICAgIG9wdHMsXG4gICAgY2FudmFzLndpZHRoLFxuICAgIHRvdGFsTnVtYmVyT2ZEYXlzICsgMSxcbiAgICBtYXhHcm91cE5hbWVMZW5ndGhcbiAgKTtcblxuICBjb25zdCB0YXNrTGluZUhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMudGFza0xpbmVIZWlnaHQpO1xuICBjb25zdCBkaWFtb25kRGlhbWV0ZXIgPSBzY2FsZS5tZXRyaWMoTWV0cmljLm1pbGVzdG9uZURpYW1ldGVyKTtcbiAgY29uc3QgcGVyY2VudEhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMucGVyY2VudEhlaWdodCk7XG4gIGNvbnN0IGFycm93SGVhZEhlaWdodCA9IHNjYWxlLm1ldHJpYyhNZXRyaWMuYXJyb3dIZWFkSGVpZ2h0KTtcbiAgY29uc3QgYXJyb3dIZWFkV2lkdGggPSBzY2FsZS5tZXRyaWMoTWV0cmljLmFycm93SGVhZFdpZHRoKTtcbiAgY29uc3QgZGF5c1dpdGhUaW1lTWFya2VyczogU2V0PG51bWJlcj4gPSBuZXcgU2V0KCk7XG4gIGNvbnN0IHRpcmV0ID0gdGFza0luZGV4VG9Sb3dGcm9tR3JvdXBCeShcbiAgICBvcHRzLFxuICAgIHJlc291cmNlRGVmaW5pdGlvbixcbiAgICBjaGFydExpa2UsXG4gICAgZnJldC52YWx1ZS5kaXNwbGF5T3JkZXJcbiAgKTtcbiAgaWYgKCF0aXJldC5vaykge1xuICAgIHJldHVybiB0aXJldDtcbiAgfVxuICBjb25zdCB0YXNrSW5kZXhUb1JvdyA9IHRpcmV0LnZhbHVlLnRhc2tJbmRleFRvUm93O1xuICBjb25zdCByb3dSYW5nZXMgPSB0aXJldC52YWx1ZS5yb3dSYW5nZXM7XG5cbiAgLy8gU2V0IHVwIGNhbnZhcyBiYXNpY3MuXG4gIGNsZWFyQ2FudmFzKGN0eCwgb3B0cywgY2FudmFzKTtcbiAgc2V0Rm9udFNpemUoY3R4LCBvcHRzKTtcblxuICBjb25zdCBjbGlwUmVnaW9uID0gbmV3IFBhdGgyRCgpO1xuICBjb25zdCBjbGlwT3JpZ2luID0gc2NhbGUuZmVhdHVyZSgwLCAwLCBGZWF0dXJlLnRhc2tzQ2xpcFJlY3RPcmlnaW4pO1xuICBjb25zdCBjbGlwV2lkdGggPSBjYW52YXMud2lkdGggLSBjbGlwT3JpZ2luLng7XG4gIGNsaXBSZWdpb24ucmVjdChjbGlwT3JpZ2luLngsIDAsIGNsaXBXaWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgLy8gRHJhdyBiaWcgcmVkIHJlY3Qgb3ZlciB3aGVyZSB0aGUgY2xpcCByZWdpb24gd2lsbCBiZS5cbiAgaWYgKDApIHtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJlZFwiO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlKGNsaXBSZWdpb24pO1xuICB9XG5cbiAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuXG4gIGlmIChyb3dSYW5nZXMgIT09IG51bGwpIHtcbiAgICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgICAgZHJhd1N3aW1MYW5lSGlnaGxpZ2h0cyhcbiAgICAgICAgY3R4LFxuICAgICAgICBzY2FsZSxcbiAgICAgICAgcm93UmFuZ2VzLFxuICAgICAgICB0b3RhbE51bWJlck9mRGF5cyxcbiAgICAgICAgb3B0cy5jb2xvcnMuZ3JvdXBDb2xvclxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAocmVzb3VyY2VEZWZpbml0aW9uICE9PSB1bmRlZmluZWQgJiYgb3B0cy5oYXNUZXh0KSB7XG4gICAgICBkcmF3U3dpbUxhbmVMYWJlbHMoY3R4LCBvcHRzLCByZXNvdXJjZURlZmluaXRpb24sIHNjYWxlLCByb3dSYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcblxuICBjdHguc2F2ZSgpO1xuICBjdHguY2xpcChjbGlwUmVnaW9uKTtcblxuICBpbnRlcmZhY2UgUmVjdENvcm5lcnMge1xuICAgIHRvcExlZnQ6IFBvaW50O1xuICAgIGJvdHRvbVJpZ2h0OiBQb2ludDtcbiAgfVxuICBjb25zdCB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzOiBNYXA8bnVtYmVyLCBSZWN0Q29ybmVycz4gPSBuZXcgTWFwKCk7XG5cbiAgLy8gRHJhdyB0YXNrcyBpbiB0aGVpciByb3dzLlxuICBjaGFydExpa2UuVmVydGljZXMuZm9yRWFjaCgodGFzazogVGFzaywgdGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCByb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQodGFza0luZGV4KSE7XG4gICAgY29uc3Qgc3BhbiA9IHNwYW5zW3Rhc2tJbmRleF07XG4gICAgY29uc3QgdGFza1N0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIHNwYW4uc3RhcnQsIEZlYXR1cmUudGFza0xpbmVTdGFydCk7XG4gICAgY29uc3QgdGFza0VuZCA9IHNjYWxlLmZlYXR1cmUocm93LCBzcGFuLmZpbmlzaCwgRmVhdHVyZS50YXNrTGluZVN0YXJ0KTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcblxuICAgIC8vIERyYXcgaW4gdGltZSBtYXJrZXJzIGlmIGRpc3BsYXllZC5cbiAgICAvLyBUT0RPIC0gTWFrZSBzdXJlIHRoZXkgZG9uJ3Qgb3ZlcmxhcC5cbiAgICBpZiAob3B0cy5kcmF3VGltZU1hcmtlcnNPblRhc2tzKSB7XG4gICAgICBkcmF3VGltZU1hcmtlckF0RGF5VG9UYXNrKFxuICAgICAgICBjdHgsXG4gICAgICAgIHJvdyxcbiAgICAgICAgc3Bhbi5zdGFydCxcbiAgICAgICAgdGFzayxcbiAgICAgICAgb3B0cyxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIGRheXNXaXRoVGltZU1hcmtlcnNcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGVtcGhhc2l6ZWRUYXNrcy5oYXModGFza0luZGV4KSkge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZUhpZ2hsaWdodDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZTtcbiAgICB9XG4gICAgY29uc3QgaGlnaGxpZ2h0VG9wTGVmdCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3csXG4gICAgICBzcGFuLnN0YXJ0LFxuICAgICAgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3BcbiAgICApO1xuICAgIGNvbnN0IGhpZ2hsaWdodEJvdHRvbVJpZ2h0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgIHJvdyArIDEsXG4gICAgICBzcGFuLmZpbmlzaCxcbiAgICAgIEZlYXR1cmUudGFza0VudmVsb3BlVG9wXG4gICAgKTtcblxuICAgIHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMuc2V0KHRhc2tJbmRleCwge1xuICAgICAgdG9wTGVmdDogaGlnaGxpZ2h0VG9wTGVmdCxcbiAgICAgIGJvdHRvbVJpZ2h0OiBoaWdobGlnaHRCb3R0b21SaWdodCxcbiAgICB9KTtcbiAgICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgICAgaWYgKHRhc2tTdGFydC54ID09PSB0YXNrRW5kLngpIHtcbiAgICAgICAgZHJhd01pbGVzdG9uZShjdHgsIHRhc2tTdGFydCwgZGlhbW9uZERpYW1ldGVyLCBwZXJjZW50SGVpZ2h0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyYXdUYXNrQmFyKGN0eCwgdGFza1N0YXJ0LCB0YXNrRW5kLCB0YXNrTGluZUhlaWdodCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNraXAgZHJhd2luZyB0aGUgdGV4dCBvZiB0aGUgU3RhcnQgYW5kIEZpbmlzaCB0YXNrcy5cbiAgICAgIGlmICh0YXNrSW5kZXggIT09IDAgJiYgdGFza0luZGV4ICE9PSB0b3RhbE51bWJlck9mUm93cyAtIDEpIHtcbiAgICAgICAgZHJhd1Rhc2tUZXh0KFxuICAgICAgICAgIGN0eCxcbiAgICAgICAgICBvcHRzLFxuICAgICAgICAgIHNjYWxlLFxuICAgICAgICAgIHJvdyxcbiAgICAgICAgICBzcGFuLFxuICAgICAgICAgIHRhc2ssXG4gICAgICAgICAgdGFza0luZGV4LFxuICAgICAgICAgIGZyb21GaWx0ZXJlZEluZGV4VG9PcmlnaW5hbEluZGV4LmdldCh0YXNrSW5kZXgpISxcbiAgICAgICAgICBjbGlwV2lkdGgsXG4gICAgICAgICAgbGFiZWxzLFxuICAgICAgICAgIHRhc2tMb2NhdGlvbnNcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGN0eC5saW5lV2lkdGggPSAxO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcblxuICAvLyBOb3cgZHJhdyBhbGwgdGhlIGFycm93cywgaS5lLiBlZGdlcy5cbiAgaWYgKG9wdHMuaGFzRWRnZXMgJiYgb3B0cy5oYXNUYXNrcykge1xuICAgIGNvbnN0IGhpZ2hsaWdodGVkRWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgY29uc3Qgbm9ybWFsRWRnZXM6IERpcmVjdGVkRWRnZVtdID0gW107XG4gICAgY2hhcnRMaWtlLkVkZ2VzLmZvckVhY2goKGU6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgaWYgKGVtcGhhc2l6ZWRUYXNrcy5oYXMoZS5pKSAmJiBlbXBoYXNpemVkVGFza3MuaGFzKGUuaikpIHtcbiAgICAgICAgaGlnaGxpZ2h0ZWRFZGdlcy5wdXNoKGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9ybWFsRWRnZXMucHVzaChlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGN0eC5zdHJva2VTdHlsZSA9IG9wdHMuY29sb3JzLm9uU3VyZmFjZU11dGVkO1xuICAgIGRyYXdFZGdlcyhcbiAgICAgIGN0eCxcbiAgICAgIG9wdHMsXG4gICAgICBub3JtYWxFZGdlcyxcbiAgICAgIHNwYW5zLFxuICAgICAgY2hhcnRMaWtlLlZlcnRpY2VzLFxuICAgICAgc2NhbGUsXG4gICAgICB0YXNrSW5kZXhUb1JvdyxcbiAgICAgIGFycm93SGVhZFdpZHRoLFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0LFxuICAgICAgZW1waGFzaXplZFRhc2tzXG4gICAgKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VIaWdobGlnaHQ7XG4gICAgZHJhd0VkZ2VzKFxuICAgICAgY3R4LFxuICAgICAgb3B0cyxcbiAgICAgIGhpZ2hsaWdodGVkRWRnZXMsXG4gICAgICBzcGFucyxcbiAgICAgIGNoYXJ0TGlrZS5WZXJ0aWNlcyxcbiAgICAgIHNjYWxlLFxuICAgICAgdGFza0luZGV4VG9Sb3csXG4gICAgICBhcnJvd0hlYWRXaWR0aCxcbiAgICAgIGFycm93SGVhZEhlaWdodCxcbiAgICAgIGVtcGhhc2l6ZWRUYXNrc1xuICAgICk7XG4gIH1cblxuICAvLyBSZW1vdmUgdGhlIGNsaXAgcmVnaW9uLlxuICBjdHgucmVzdG9yZSgpO1xuXG4gIC8vIE5vdyBkcmF3IHRoZSByYW5nZSBoaWdobGlnaHRzIGlmIHJlcXVpcmVkLlxuICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UgIT09IG51bGwgJiYgb3B0cy5kaXNwbGF5UmFuZ2VVc2FnZSA9PT0gXCJoaWdobGlnaHRcIikge1xuICAgIC8vIERyYXcgYSByZWN0IG92ZXIgZWFjaCBzaWRlIHRoYXQgaXNuJ3QgaW4gdGhlIHJhbmdlLlxuICAgIGlmIChvcHRzLmRpc3BsYXlSYW5nZS5iZWdpbiA+IDApIHtcbiAgICAgIGRyYXdSYW5nZU92ZXJsYXkoXG4gICAgICAgIGN0eCxcbiAgICAgICAgb3B0cyxcbiAgICAgICAgc2NhbGUsXG4gICAgICAgIDAsXG4gICAgICAgIG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luLFxuICAgICAgICB0b3RhbE51bWJlck9mUm93c1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmVuZCA8IHRvdGFsTnVtYmVyT2ZEYXlzKSB7XG4gICAgICBkcmF3UmFuZ2VPdmVybGF5KFxuICAgICAgICBjdHgsXG4gICAgICAgIG9wdHMsXG4gICAgICAgIHNjYWxlLFxuICAgICAgICBvcHRzLmRpc3BsYXlSYW5nZS5lbmQsXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZEYXlzICsgMSxcbiAgICAgICAgdG90YWxOdW1iZXJPZlJvd3NcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgbGV0IHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvczogVXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zIHwgbnVsbCA9IG51bGw7XG4gIGxldCBzZWxlY3RlZFRhc2tMb2NhdGlvbjogUG9pbnQgfCBudWxsID0gbnVsbDtcblxuICBpZiAob3ZlcmxheSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IG92ZXJsYXlDdHggPSBvdmVybGF5LmdldENvbnRleHQoXCIyZFwiKSE7XG5cbiAgICAvLyBBZGQgaW4gYWxsIGZvdXIgY29ybmVycyBvZiBldmVyeSBUYXNrIHRvIHRhc2tMb2NhdGlvbnMuXG4gICAgdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5mb3JFYWNoKFxuICAgICAgKHJjOiBSZWN0Q29ybmVycywgZmlsdGVyZWRUYXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBvcmlnaW5hbFRhc2tJbmRleCA9XG4gICAgICAgICAgZnJvbUZpbHRlcmVkSW5kZXhUb09yaWdpbmFsSW5kZXguZ2V0KGZpbHRlcmVkVGFza0luZGV4KSE7XG4gICAgICAgIHRhc2tMb2NhdGlvbnMucHVzaChcbiAgICAgICAgICB7XG4gICAgICAgICAgICB4OiByYy5ib3R0b21SaWdodC54LFxuICAgICAgICAgICAgeTogcmMuYm90dG9tUmlnaHQueSxcbiAgICAgICAgICAgIG9yaWdpbmFsVGFza0luZGV4OiBvcmlnaW5hbFRhc2tJbmRleCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHg6IHJjLnRvcExlZnQueCxcbiAgICAgICAgICAgIHk6IHJjLnRvcExlZnQueSxcbiAgICAgICAgICAgIG9yaWdpbmFsVGFza0luZGV4OiBvcmlnaW5hbFRhc2tJbmRleCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHg6IHJjLmJvdHRvbVJpZ2h0LngsXG4gICAgICAgICAgICB5OiByYy50b3BMZWZ0LnksXG4gICAgICAgICAgICBvcmlnaW5hbFRhc2tJbmRleDogb3JpZ2luYWxUYXNrSW5kZXgsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB4OiByYy50b3BMZWZ0LngsXG4gICAgICAgICAgICB5OiByYy5ib3R0b21SaWdodC55LFxuICAgICAgICAgICAgb3JpZ2luYWxUYXNrSW5kZXg6IG9yaWdpbmFsVGFza0luZGV4LFxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICApO1xuICAgIGNvbnN0IHRhc2tMb2NhdGlvbktEVHJlZSA9IG5ldyBLRFRyZWUodGFza0xvY2F0aW9ucyk7XG5cbiAgICAvLyBBbHdheXMgcmVjb3JlZCBpbiB0aGUgb3JpZ2luYWwgdW5maWx0ZXJlZCB0YXNrIGluZGV4LlxuICAgIGxldCBsYXN0SGlnaGxpZ2h0ZWRUYXNrSW5kZXggPSAtMTtcblxuICAgIHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyA9IChcbiAgICAgIHBvaW50OiBQb2ludCxcbiAgICAgIHVwZGF0ZVR5cGU6IFVwZGF0ZVR5cGVcbiAgICApOiBudW1iZXIgfCBudWxsID0+IHtcbiAgICAgIC8vIEZpcnN0IGNvbnZlcnQgcG9pbnQgaW4gb2Zmc2V0IGNvb3JkcyBpbnRvIGNhbnZhcyBjb29yZHMuXG4gICAgICBwb2ludC54ID0gcG9pbnQueCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgcG9pbnQueSA9IHBvaW50LnkgKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgIGNvbnN0IHRhc2tMb2NhdGlvbiA9IHRhc2tMb2NhdGlvbktEVHJlZS5uZWFyZXN0KHBvaW50KTtcbiAgICAgIGNvbnN0IG9yaWdpbmFsVGFza0luZGV4ID0gdGFza0xvY2F0aW9uLm9yaWdpbmFsVGFza0luZGV4O1xuICAgICAgaWYgKHVwZGF0ZVR5cGUgPT09IFwibW91c2Vtb3ZlXCIpIHtcbiAgICAgICAgaWYgKG9yaWdpbmFsVGFza0luZGV4ID09PSBsYXN0SGlnaGxpZ2h0ZWRUYXNrSW5kZXgpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChvcmlnaW5hbFRhc2tJbmRleCA9PT0gbGFzdFNlbGVjdGVkVGFza0luZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsVGFza0luZGV4O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh1cGRhdGVUeXBlID09PSBcIm1vdXNlbW92ZVwiKSB7XG4gICAgICAgIGxhc3RIaWdobGlnaHRlZFRhc2tJbmRleCA9IG9yaWdpbmFsVGFza0luZGV4O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFzdFNlbGVjdGVkVGFza0luZGV4ID0gb3JpZ2luYWxUYXNrSW5kZXg7XG4gICAgICB9XG5cbiAgICAgIG92ZXJsYXlDdHguY2xlYXJSZWN0KDAsIDAsIG92ZXJsYXkud2lkdGgsIG92ZXJsYXkuaGVpZ2h0KTtcblxuICAgICAgLy8gRHJhdyBib3RoIGhpZ2hsaWdodCBhbmQgc2VsZWN0aW9uLlxuXG4gICAgICAvLyBEcmF3IGhpZ2hsaWdodC5cbiAgICAgIGxldCBjb3JuZXJzID0gdGFza0luZGV4VG9UYXNrSGlnaGxpZ2h0Q29ybmVycy5nZXQoXG4gICAgICAgIGZyb21PcmlnaW5hbEluZGV4VG9GaWx0ZXJlZEluZGV4LmdldChsYXN0SGlnaGxpZ2h0ZWRUYXNrSW5kZXgpIVxuICAgICAgKTtcbiAgICAgIGlmIChjb3JuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZHJhd1Rhc2tIaWdobGlnaHQoXG4gICAgICAgICAgb3ZlcmxheUN0eCxcbiAgICAgICAgICBjb3JuZXJzLnRvcExlZnQsXG4gICAgICAgICAgY29ybmVycy5ib3R0b21SaWdodCxcbiAgICAgICAgICBvcHRzLmNvbG9ycy5oaWdobGlnaHQsXG4gICAgICAgICAgc2NhbGUubWV0cmljKHRhc2tMaW5lSGVpZ2h0KVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBEcmF3IHNlbGVjdGlvbi5cbiAgICAgIGNvcm5lcnMgPSB0YXNrSW5kZXhUb1Rhc2tIaWdobGlnaHRDb3JuZXJzLmdldChcbiAgICAgICAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXguZ2V0KGxhc3RTZWxlY3RlZFRhc2tJbmRleCkhXG4gICAgICApO1xuICAgICAgaWYgKGNvcm5lcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkcmF3U2VsZWN0aW9uSGlnaGxpZ2h0KFxuICAgICAgICAgIG92ZXJsYXlDdHgsXG4gICAgICAgICAgY29ybmVycy50b3BMZWZ0LFxuICAgICAgICAgIGNvcm5lcnMuYm90dG9tUmlnaHQsXG4gICAgICAgICAgb3B0cy5jb2xvcnMuaGlnaGxpZ2h0XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvcmlnaW5hbFRhc2tJbmRleDtcbiAgICB9O1xuXG4gICAgLy8gRHJhdyBzZWxlY3Rpb24uXG4gICAgY29uc3QgY29ybmVycyA9IHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMuZ2V0KFxuICAgICAgZnJvbU9yaWdpbmFsSW5kZXhUb0ZpbHRlcmVkSW5kZXguZ2V0KGxhc3RTZWxlY3RlZFRhc2tJbmRleCkhXG4gICAgKTtcbiAgICBpZiAoY29ybmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkcmF3U2VsZWN0aW9uSGlnaGxpZ2h0KFxuICAgICAgICBvdmVybGF5Q3R4LFxuICAgICAgICBjb3JuZXJzLnRvcExlZnQsXG4gICAgICAgIGNvcm5lcnMuYm90dG9tUmlnaHQsXG4gICAgICAgIG9wdHMuY29sb3JzLmhpZ2hsaWdodFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBoaWdoZXN0IHRhc2sgb2YgYWxsIHRoZSB0YXNrcyBkaXNwbGF5ZWQuXG4gIHRhc2tJbmRleFRvVGFza0hpZ2hsaWdodENvcm5lcnMuZm9yRWFjaCgocmM6IFJlY3RDb3JuZXJzKSA9PiB7XG4gICAgaWYgKHNlbGVjdGVkVGFza0xvY2F0aW9uID09PSBudWxsKSB7XG4gICAgICBzZWxlY3RlZFRhc2tMb2NhdGlvbiA9IHJjLnRvcExlZnQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChyYy50b3BMZWZ0LnkgPCBzZWxlY3RlZFRhc2tMb2NhdGlvbi55KSB7XG4gICAgICBzZWxlY3RlZFRhc2tMb2NhdGlvbiA9IHJjLnRvcExlZnQ7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gb2soe1xuICAgIHNjYWxlOiBzY2FsZSxcbiAgICB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M6IHVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyxcbiAgICBzZWxlY3RlZFRhc2tMb2NhdGlvbjogc2VsZWN0ZWRUYXNrTG9jYXRpb24sXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkcmF3RWRnZXMoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBlZGdlczogRGlyZWN0ZWRFZGdlW10sXG4gIHNwYW5zOiBTcGFuW10sXG4gIHRhc2tzOiBUYXNrW10sXG4gIHNjYWxlOiBTY2FsZSxcbiAgdGFza0luZGV4VG9Sb3c6IFRhc2tJbmRleFRvUm93LFxuICBhcnJvd0hlYWRXaWR0aDogbnVtYmVyLFxuICBhcnJvd0hlYWRIZWlnaHQ6IG51bWJlcixcbiAgdGFza0hpZ2hsaWdodHM6IFNldDxudW1iZXI+XG4pIHtcbiAgZWRnZXMuZm9yRWFjaCgoZTogRGlyZWN0ZWRFZGdlKSA9PiB7XG4gICAgY29uc3Qgc3JjU2xhY2s6IFNwYW4gPSBzcGFuc1tlLmldO1xuICAgIGNvbnN0IGRzdFNsYWNrOiBTcGFuID0gc3BhbnNbZS5qXTtcbiAgICBjb25zdCBzcmNUYXNrOiBUYXNrID0gdGFza3NbZS5pXTtcbiAgICBjb25zdCBkc3RUYXNrOiBUYXNrID0gdGFza3NbZS5qXTtcbiAgICBjb25zdCBzcmNSb3cgPSB0YXNrSW5kZXhUb1Jvdy5nZXQoZS5pKSE7XG4gICAgY29uc3QgZHN0Um93ID0gdGFza0luZGV4VG9Sb3cuZ2V0KGUuaikhO1xuICAgIGNvbnN0IHNyY0RheSA9IHNyY1NsYWNrLmZpbmlzaDtcbiAgICBjb25zdCBkc3REYXkgPSBkc3RTbGFjay5zdGFydDtcblxuICAgIGlmICh0YXNrSGlnaGxpZ2h0cy5oYXMoZS5pKSAmJiB0YXNrSGlnaGxpZ2h0cy5oYXMoZS5qKSkge1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlSGlnaGxpZ2h0O1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2VNdXRlZDtcbiAgICB9XG5cbiAgICBkcmF3QXJyb3dCZXR3ZWVuVGFza3MoXG4gICAgICBjdHgsXG4gICAgICBzcmNEYXksXG4gICAgICBkc3REYXksXG4gICAgICBzY2FsZSxcbiAgICAgIHNyY1JvdyxcbiAgICAgIHNyY1Rhc2ssXG4gICAgICBkc3RSb3csXG4gICAgICBkc3RUYXNrLFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHRcbiAgICApO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZHJhd1JhbmdlT3ZlcmxheShcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIG9wdHM6IFJlbmRlck9wdGlvbnMsXG4gIHNjYWxlOiBTY2FsZSxcbiAgYmVnaW5EYXk6IG51bWJlcixcbiAgZW5kRGF5OiBudW1iZXIsXG4gIHRvdGFsTnVtYmVyT2ZSb3dzOiBudW1iZXJcbikge1xuICBjb25zdCB0b3BMZWZ0ID0gc2NhbGUuZmVhdHVyZSgwLCBiZWdpbkRheSwgRmVhdHVyZS5kaXNwbGF5UmFuZ2VUb3ApO1xuICBjb25zdCBib3R0b21SaWdodCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgdG90YWxOdW1iZXJPZlJvd3MsXG4gICAgZW5kRGF5LFxuICAgIEZlYXR1cmUudGFza1Jvd0JvdHRvbVxuICApO1xuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub3ZlcmxheTtcbiAgY3R4LmZpbGxSZWN0KFxuICAgIHRvcExlZnQueCxcbiAgICB0b3BMZWZ0LnksXG4gICAgYm90dG9tUmlnaHQueCAtIHRvcExlZnQueCxcbiAgICBib3R0b21SaWdodC55IC0gdG9wTGVmdC55XG4gICk7XG4gIGNvbnNvbGUubG9nKFwiZHJhd1JhbmdlT3ZlcmxheVwiLCB0b3BMZWZ0LCBib3R0b21SaWdodCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdBcnJvd0JldHdlZW5UYXNrcyhcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHNyY0RheTogbnVtYmVyLFxuICBkc3REYXk6IG51bWJlcixcbiAgc2NhbGU6IFNjYWxlLFxuICBzcmNSb3c6IG51bWJlcixcbiAgc3JjVGFzazogVGFzayxcbiAgZHN0Um93OiBudW1iZXIsXG4gIGRzdFRhc2s6IFRhc2ssXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXIsXG4gIGFycm93SGVhZEhlaWdodDogbnVtYmVyXG4pIHtcbiAgaWYgKHNyY0RheSA9PT0gZHN0RGF5KSB7XG4gICAgZHJhd1ZlcnRpY2FsQXJyb3dUb1Rhc2soXG4gICAgICBjdHgsXG4gICAgICBzY2FsZSxcbiAgICAgIHNyY1JvdyxcbiAgICAgIHNyY0RheSxcbiAgICAgIHNyY1Rhc2ssXG4gICAgICBkc3RSb3csXG4gICAgICBkc3REYXksXG4gICAgICBkc3RUYXNrLFxuICAgICAgYXJyb3dIZWFkV2lkdGgsXG4gICAgICBhcnJvd0hlYWRIZWlnaHRcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIGRyYXdMU2hhcGVkQXJyb3dUb1Rhc2soXG4gICAgICBjdHgsXG4gICAgICBzY2FsZSxcbiAgICAgIHNyY1JvdyxcbiAgICAgIHNyY0RheSxcbiAgICAgIHNyY1Rhc2ssXG4gICAgICBkc3RSb3csXG4gICAgICBkc3RUYXNrLFxuICAgICAgZHN0RGF5LFxuICAgICAgYXJyb3dIZWFkSGVpZ2h0LFxuICAgICAgYXJyb3dIZWFkV2lkdGhcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNsZWFyQ2FudmFzKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudFxuKSB7XG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5zdXJmYWNlO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xufVxuXG5mdW5jdGlvbiBzZXRGb250U2l6ZShjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgb3B0czogUmVuZGVyT3B0aW9ucykge1xuICBjdHguZm9udCA9IGAke29wdHMuZm9udFNpemVQeH1weCBzZXJpZmA7XG59XG5cbi8vIERyYXcgTCBzaGFwZWQgYXJyb3csIGZpcnN0IGdvaW5nIGJldHdlZW4gcm93cywgdGhlbiBnb2luZyBiZXR3ZWVuIGRheXMuXG5mdW5jdGlvbiBkcmF3TFNoYXBlZEFycm93VG9UYXNrKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc2NhbGU6IFNjYWxlLFxuICBzcmNSb3c6IG51bWJlcixcbiAgc3JjRGF5OiBudW1iZXIsXG4gIHNyY1Rhc2s6IFRhc2ssXG4gIGRzdFJvdzogbnVtYmVyLFxuICBkc3RUYXNrOiBUYXNrLFxuICBkc3REYXk6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXIsXG4gIGFycm93SGVhZFdpZHRoOiBudW1iZXJcbikge1xuICAvLyBEcmF3IHZlcnRpY2FsIHBhcnQgb2YgdGhlIFwiTFwiLlxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGNvbnN0IGRpcmVjdGlvbjogRGlyZWN0aW9uID0gc3JjUm93IDwgZHN0Um93ID8gXCJkb3duXCIgOiBcInVwXCI7XG4gIGNvbnN0IHZlcnRMaW5lU3RhcnQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIHNyY1JvdyxcbiAgICBzcmNEYXksXG4gICAgdmVydGljYWxBcnJvd1N0YXJ0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oc3JjVGFzaywgZGlyZWN0aW9uKVxuICApO1xuICBjb25zdCB2ZXJ0TGluZUVuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgZHN0Um93LFxuICAgIHNyY0RheSxcbiAgICBob3Jpem9udGFsQXJyb3dEZXN0RmVhdHVyZUZyb21UYXNrRHVyYXRpb24oZHN0VGFzaylcbiAgKTtcbiAgY3R4Lm1vdmVUbyh2ZXJ0TGluZVN0YXJ0LnggKyAwLjUsIHZlcnRMaW5lU3RhcnQueSk7XG4gIGN0eC5saW5lVG8odmVydExpbmVTdGFydC54ICsgMC41LCB2ZXJ0TGluZUVuZC55KTtcblxuICAvLyBEcmF3IGhvcml6b250YWwgcGFydCBvZiB0aGUgXCJMXCIuXG4gIGNvbnN0IGhvcnpMaW5lU3RhcnQgPSB2ZXJ0TGluZUVuZDtcbiAgY29uc3QgaG9yekxpbmVFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIGRzdFJvdyxcbiAgICBkc3REYXksXG4gICAgaG9yaXpvbnRhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKGRzdFRhc2spXG4gICk7XG4gIGN0eC5tb3ZlVG8odmVydExpbmVTdGFydC54ICsgMC41LCBob3J6TGluZVN0YXJ0LnkpO1xuICBjdHgubGluZVRvKGhvcnpMaW5lRW5kLnggKyAwLjUsIGhvcnpMaW5lRW5kLnkpO1xuXG4gIC8vIERyYXcgdGhlIGFycm93aGVhZC4gVGhpcyBhcnJvdyBoZWFkIHdpbGwgYWx3YXlzIHBvaW50IHRvIHRoZSByaWdodFxuICAvLyBzaW5jZSB0aGF0J3MgaG93IHRpbWUgZmxvd3MuXG4gIGN0eC5tb3ZlVG8oaG9yekxpbmVFbmQueCArIDAuNSwgaG9yekxpbmVFbmQueSk7XG4gIGN0eC5saW5lVG8oXG4gICAgaG9yekxpbmVFbmQueCAtIGFycm93SGVhZEhlaWdodCArIDAuNSxcbiAgICBob3J6TGluZUVuZC55ICsgYXJyb3dIZWFkV2lkdGhcbiAgKTtcbiAgY3R4Lm1vdmVUbyhob3J6TGluZUVuZC54ICsgMC41LCBob3J6TGluZUVuZC55KTtcbiAgY3R4LmxpbmVUbyhcbiAgICBob3J6TGluZUVuZC54IC0gYXJyb3dIZWFkSGVpZ2h0ICsgMC41LFxuICAgIGhvcnpMaW5lRW5kLnkgLSBhcnJvd0hlYWRXaWR0aFxuICApO1xuICBjdHguc3Ryb2tlKCk7XG59XG5cbmZ1bmN0aW9uIGRyYXdWZXJ0aWNhbEFycm93VG9UYXNrKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgc2NhbGU6IFNjYWxlLFxuICBzcmNSb3c6IG51bWJlcixcbiAgc3JjRGF5OiBudW1iZXIsXG4gIHNyY1Rhc2s6IFRhc2ssXG4gIGRzdFJvdzogbnVtYmVyLFxuICBkc3REYXk6IG51bWJlcixcbiAgZHN0VGFzazogVGFzayxcbiAgYXJyb3dIZWFkV2lkdGg6IG51bWJlcixcbiAgYXJyb3dIZWFkSGVpZ2h0OiBudW1iZXJcbikge1xuICBjb25zdCBkaXJlY3Rpb246IERpcmVjdGlvbiA9IHNyY1JvdyA8IGRzdFJvdyA/IFwiZG93blwiIDogXCJ1cFwiO1xuICBjb25zdCBhcnJvd1N0YXJ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICBzcmNSb3csXG4gICAgc3JjRGF5LFxuICAgIHZlcnRpY2FsQXJyb3dTdGFydEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKHNyY1Rhc2ssIGRpcmVjdGlvbilcbiAgKTtcbiAgY29uc3QgYXJyb3dFbmQgPSBzY2FsZS5mZWF0dXJlKFxuICAgIGRzdFJvdyxcbiAgICBkc3REYXksXG4gICAgdmVydGljYWxBcnJvd0Rlc3RGZWF0dXJlRnJvbVRhc2tEdXJhdGlvbihkc3RUYXNrLCBkaXJlY3Rpb24pXG4gICk7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubW92ZVRvKGFycm93U3RhcnQueCArIDAuNSwgYXJyb3dTdGFydC55KTtcbiAgY3R4LmxpbmVUbyhhcnJvd0VuZC54ICsgMC41LCBhcnJvd0VuZC55KTtcblxuICAvLyBEcmF3IHRoZSBhcnJvd2hlYWQuXG4gIGNvbnN0IGRlbHRhWSA9IGRpcmVjdGlvbiA9PT0gXCJkb3duXCIgPyAtYXJyb3dIZWFkSGVpZ2h0IDogYXJyb3dIZWFkSGVpZ2h0O1xuICBjdHgubW92ZVRvKGFycm93RW5kLnggKyAwLjUsIGFycm93RW5kLnkpO1xuICBjdHgubGluZVRvKGFycm93RW5kLnggLSBhcnJvd0hlYWRXaWR0aCArIDAuNSwgYXJyb3dFbmQueSArIGRlbHRhWSk7XG4gIGN0eC5tb3ZlVG8oYXJyb3dFbmQueCArIDAuNSwgYXJyb3dFbmQueSk7XG4gIGN0eC5saW5lVG8oYXJyb3dFbmQueCArIGFycm93SGVhZFdpZHRoICsgMC41LCBhcnJvd0VuZC55ICsgZGVsdGFZKTtcbiAgY3R4LnN0cm9rZSgpO1xufVxuXG5mdW5jdGlvbiBkcmF3VGFza1RleHQoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICBzY2FsZTogU2NhbGUsXG4gIHJvdzogbnVtYmVyLFxuICBzcGFuOiBTcGFuLFxuICB0YXNrOiBUYXNrLFxuICB0YXNrSW5kZXg6IG51bWJlcixcbiAgb3JpZ2luYWxUYXNrSW5kZXg6IG51bWJlcixcbiAgY2xpcFdpZHRoOiBudW1iZXIsXG4gIGxhYmVsczogc3RyaW5nW10sXG4gIHRhc2tMb2NhdGlvbnM6IFRhc2tMb2NhdGlvbltdXG4pIHtcbiAgaWYgKCFvcHRzLmhhc1RleHQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgbGFiZWwgPSBsYWJlbHNbdGFza0luZGV4XTtcblxuICBsZXQgeFN0YXJ0SW5UaW1lID0gc3Bhbi5zdGFydDtcbiAgbGV0IHhQaXhlbERlbHRhID0gMDtcbiAgLy8gRGV0ZXJtaW5lIHdoZXJlIG9uIHRoZSB4LWF4aXMgdG8gc3RhcnQgZHJhd2luZyB0aGUgdGFzayB0ZXh0LlxuICBpZiAob3B0cy5kaXNwbGF5UmFuZ2UgIT09IG51bGwgJiYgb3B0cy5kaXNwbGF5UmFuZ2VVc2FnZSA9PT0gXCJyZXN0cmljdFwiKSB7XG4gICAgaWYgKG9wdHMuZGlzcGxheVJhbmdlLmluKHNwYW4uc3RhcnQpKSB7XG4gICAgICB4U3RhcnRJblRpbWUgPSBzcGFuLnN0YXJ0O1xuICAgICAgeFBpeGVsRGVsdGEgPSAwO1xuICAgIH0gZWxzZSBpZiAob3B0cy5kaXNwbGF5UmFuZ2UuaW4oc3Bhbi5maW5pc2gpKSB7XG4gICAgICB4U3RhcnRJblRpbWUgPSBzcGFuLmZpbmlzaDtcbiAgICAgIGNvbnN0IG1lYXMgPSBjdHgubWVhc3VyZVRleHQobGFiZWwpO1xuICAgICAgeFBpeGVsRGVsdGEgPSAtbWVhcy53aWR0aCAtIDIgKiBzY2FsZS5tZXRyaWMoTWV0cmljLnRleHRYT2Zmc2V0KTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgc3Bhbi5zdGFydCA8IG9wdHMuZGlzcGxheVJhbmdlLmJlZ2luICYmXG4gICAgICBzcGFuLmZpbmlzaCA+IG9wdHMuZGlzcGxheVJhbmdlLmVuZFxuICAgICkge1xuICAgICAgeFN0YXJ0SW5UaW1lID0gb3B0cy5kaXNwbGF5UmFuZ2UuYmVnaW47XG4gICAgICB4UGl4ZWxEZWx0YSA9IGNsaXBXaWR0aCAvIDI7XG4gICAgfVxuICB9XG4gIGN0eC5saW5lV2lkdGggPSAxO1xuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjdHgudGV4dEJhc2VsaW5lID0gXCJ0b3BcIjtcbiAgY29uc3QgdGV4dFN0YXJ0ID0gc2NhbGUuZmVhdHVyZShyb3csIHhTdGFydEluVGltZSwgRmVhdHVyZS50ZXh0U3RhcnQpO1xuICBjb25zdCB0ZXh0WCA9IHRleHRTdGFydC54ICsgeFBpeGVsRGVsdGE7XG4gIGNvbnN0IHRleHRZID0gdGV4dFN0YXJ0Lnk7XG4gIGN0eC5maWxsVGV4dChsYWJlbCwgdGV4dFN0YXJ0LnggKyB4UGl4ZWxEZWx0YSwgdGV4dFN0YXJ0LnkpO1xuICB0YXNrTG9jYXRpb25zLnB1c2goe1xuICAgIHg6IHRleHRYLFxuICAgIHk6IHRleHRZLFxuICAgIG9yaWdpbmFsVGFza0luZGV4OiBvcmlnaW5hbFRhc2tJbmRleCxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRyYXdUYXNrQmFyKFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgdGFza1N0YXJ0OiBQb2ludCxcbiAgdGFza0VuZDogUG9pbnQsXG4gIHRhc2tMaW5lSGVpZ2h0OiBudW1iZXJcbikge1xuICBjdHguZmlsbFJlY3QoXG4gICAgdGFza1N0YXJ0LngsXG4gICAgdGFza1N0YXJ0LnksXG4gICAgdGFza0VuZC54IC0gdGFza1N0YXJ0LngsXG4gICAgdGFza0xpbmVIZWlnaHRcbiAgKTtcbn1cblxuZnVuY3Rpb24gZHJhd1Rhc2tIaWdobGlnaHQoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBoaWdobGlnaHRTdGFydDogUG9pbnQsXG4gIGhpZ2hsaWdodEVuZDogUG9pbnQsXG4gIGNvbG9yOiBzdHJpbmcsXG4gIGJvcmRlcldpZHRoOiBudW1iZXJcbikge1xuICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgY3R4LmxpbmVXaWR0aCA9IGJvcmRlcldpZHRoO1xuICBjdHguc3Ryb2tlUmVjdChcbiAgICBoaWdobGlnaHRTdGFydC54LFxuICAgIGhpZ2hsaWdodFN0YXJ0LnksXG4gICAgaGlnaGxpZ2h0RW5kLnggLSBoaWdobGlnaHRTdGFydC54LFxuICAgIGhpZ2hsaWdodEVuZC55IC0gaGlnaGxpZ2h0U3RhcnQueVxuICApO1xufVxuXG5mdW5jdGlvbiBkcmF3U2VsZWN0aW9uSGlnaGxpZ2h0KFxuICBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCxcbiAgaGlnaGxpZ2h0U3RhcnQ6IFBvaW50LFxuICBoaWdobGlnaHRFbmQ6IFBvaW50LFxuICBjb2xvcjogc3RyaW5nXG4pIHtcbiAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICBjdHguZmlsbFJlY3QoXG4gICAgaGlnaGxpZ2h0U3RhcnQueCxcbiAgICBoaWdobGlnaHRTdGFydC55LFxuICAgIGhpZ2hsaWdodEVuZC54IC0gaGlnaGxpZ2h0U3RhcnQueCxcbiAgICBoaWdobGlnaHRFbmQueSAtIGhpZ2hsaWdodFN0YXJ0LnlcbiAgKTtcbn1cblxuZnVuY3Rpb24gZHJhd01pbGVzdG9uZShcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHRhc2tTdGFydDogUG9pbnQsXG4gIGRpYW1vbmREaWFtZXRlcjogbnVtYmVyLFxuICBwZXJjZW50SGVpZ2h0OiBudW1iZXJcbikge1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5saW5lV2lkdGggPSBwZXJjZW50SGVpZ2h0IC8gMjtcbiAgY3R4Lm1vdmVUbyh0YXNrU3RhcnQueCwgdGFza1N0YXJ0LnkgLSBkaWFtb25kRGlhbWV0ZXIpO1xuICBjdHgubGluZVRvKHRhc2tTdGFydC54ICsgZGlhbW9uZERpYW1ldGVyLCB0YXNrU3RhcnQueSk7XG4gIGN0eC5saW5lVG8odGFza1N0YXJ0LngsIHRhc2tTdGFydC55ICsgZGlhbW9uZERpYW1ldGVyKTtcbiAgY3R4LmxpbmVUbyh0YXNrU3RhcnQueCAtIGRpYW1vbmREaWFtZXRlciwgdGFza1N0YXJ0LnkpO1xuICBjdHguY2xvc2VQYXRoKCk7XG4gIGN0eC5zdHJva2UoKTtcbn1cblxuY29uc3QgZHJhd1RpbWVNYXJrZXJBdERheVRvVGFzayA9IChcbiAgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsXG4gIHJvdzogbnVtYmVyLFxuICBkYXk6IG51bWJlcixcbiAgdGFzazogVGFzayxcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgc2NhbGU6IFNjYWxlLFxuICBkYXlzV2l0aFRpbWVNYXJrZXJzOiBTZXQ8bnVtYmVyPlxuKSA9PiB7XG4gIGlmIChkYXlzV2l0aFRpbWVNYXJrZXJzLmhhcyhkYXkpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGRheXNXaXRoVGltZU1hcmtlcnMuYWRkKGRheSk7XG4gIGNvbnN0IHRpbWVNYXJrU3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnRpbWVNYXJrU3RhcnQpO1xuICBjb25zdCB0aW1lTWFya0VuZCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgcm93LFxuICAgIGRheSxcbiAgICB2ZXJ0aWNhbEFycm93RGVzdEZlYXR1cmVGcm9tVGFza0R1cmF0aW9uKHRhc2ssIFwiZG93blwiKVxuICApO1xuICBjdHgubGluZVdpZHRoID0gMC41O1xuICBjdHguc3Ryb2tlU3R5bGUgPSBvcHRzLmNvbG9ycy5vdmVybGF5O1xuXG4gIGN0eC5tb3ZlVG8odGltZU1hcmtTdGFydC54ICsgMC41LCB0aW1lTWFya1N0YXJ0LnkpO1xuICBjdHgubGluZVRvKHRpbWVNYXJrU3RhcnQueCArIDAuNSwgdGltZU1hcmtFbmQueSk7XG4gIGN0eC5zdHJva2UoKTtcblxuICBjdHguc2V0TGluZURhc2goW10pO1xuXG4gIGN0eC5maWxsU3R5bGUgPSBvcHRzLmNvbG9ycy5vblN1cmZhY2U7XG4gIGN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xuICBjb25zdCB0ZXh0U3RhcnQgPSBzY2FsZS5mZWF0dXJlKHJvdywgZGF5LCBGZWF0dXJlLnRpbWVUZXh0U3RhcnQpO1xuICBpZiAob3B0cy5oYXNUZXh0ICYmIG9wdHMuaGFzVGltZWxpbmUpIHtcbiAgICBjdHguZmlsbFRleHQoYCR7ZGF5fWAsIHRleHRTdGFydC54LCB0ZXh0U3RhcnQueSk7XG4gIH1cbn07XG5cbi8qKiBSZXByZXNlbnRzIGEgaGFsZi1vcGVuIGludGVydmFsIG9mIHJvd3MsIGUuZy4gW3N0YXJ0LCBmaW5pc2gpLiAqL1xuaW50ZXJmYWNlIFJvd1JhbmdlIHtcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZmluaXNoOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBUYXNrSW5kZXhUb1Jvd1JldHVybiB7XG4gIHRhc2tJbmRleFRvUm93OiBUYXNrSW5kZXhUb1JvdztcblxuICAvKiogTWFwcyBlYWNoIHJlc291cmNlIHZhbHVlIGluZGV4IHRvIGEgcmFuZ2Ugb2Ygcm93cy4gKi9cbiAgcm93UmFuZ2VzOiBNYXA8bnVtYmVyLCBSb3dSYW5nZT4gfCBudWxsO1xuXG4gIHJlc291cmNlRGVmaW5pdGlvbjogUmVzb3VyY2VEZWZpbml0aW9uIHwgbnVsbDtcbn1cblxuY29uc3QgdGFza0luZGV4VG9Sb3dGcm9tR3JvdXBCeSA9IChcbiAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgcmVzb3VyY2VEZWZpbml0aW9uOiBSZXNvdXJjZURlZmluaXRpb24gfCB1bmRlZmluZWQsXG4gIGNoYXJ0TGlrZTogQ2hhcnRMaWtlLFxuICBkaXNwbGF5T3JkZXI6IFZlcnRleEluZGljZXNcbik6IFJlc3VsdDxUYXNrSW5kZXhUb1Jvd1JldHVybj4gPT4ge1xuICAvLyBkaXNwbGF5T3JkZXIgbWFwcyBmcm9tIHJvdyB0byB0YXNrIGluZGV4LCB0aGlzIHdpbGwgcHJvZHVjZSB0aGUgaW52ZXJzZSBtYXBwaW5nLlxuICBjb25zdCB0YXNrSW5kZXhUb1JvdyA9IG5ldyBNYXAoXG4gICAgLy8gVGhpcyBsb29rcyBiYWNrd2FyZHMsIGJ1dCBpdCBpc24ndC4gUmVtZW1iZXIgdGhhdCB0aGUgbWFwIGNhbGxiYWNrIHRha2VzXG4gICAgLy8gKHZhbHVlLCBpbmRleCkgYXMgaXRzIGFyZ3VtZW50cy5cbiAgICBkaXNwbGF5T3JkZXIubWFwKCh0YXNrSW5kZXg6IG51bWJlciwgcm93OiBudW1iZXIpID0+IFt0YXNrSW5kZXgsIHJvd10pXG4gICk7XG5cbiAgaWYgKHJlc291cmNlRGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG9rKHtcbiAgICAgIHRhc2tJbmRleFRvUm93OiB0YXNrSW5kZXhUb1JvdyxcbiAgICAgIHJvd1JhbmdlczogbnVsbCxcbiAgICAgIHJlc291cmNlRGVmaW5pdGlvbjogbnVsbCxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IHN0YXJ0VGFza0luZGV4ID0gMDtcbiAgY29uc3QgZmluaXNoVGFza0luZGV4ID0gY2hhcnRMaWtlLlZlcnRpY2VzLmxlbmd0aCAtIDE7XG4gIGNvbnN0IGlnbm9yYWJsZSA9IFtzdGFydFRhc2tJbmRleCwgZmluaXNoVGFza0luZGV4XTtcblxuICAvLyBHcm91cCBhbGwgdGFza3MgYnkgdGhlaXIgcmVzb3VyY2UgdmFsdWUsIHdoaWxlIHByZXNlcnZpbmcgZGlzcGxheU9yZGVyXG4gIC8vIG9yZGVyIHdpdGggdGhlIGdyb3Vwcy5cbiAgY29uc3QgZ3JvdXBzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcltdPigpO1xuICBkaXNwbGF5T3JkZXIuZm9yRWFjaCgodGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCByZXNvdXJjZVZhbHVlID1cbiAgICAgIGNoYXJ0TGlrZS5WZXJ0aWNlc1t0YXNrSW5kZXhdLmdldFJlc291cmNlKG9wdHMuZ3JvdXBCeVJlc291cmNlKSB8fCBcIlwiO1xuICAgIGNvbnN0IGdyb3VwTWVtYmVycyA9IGdyb3Vwcy5nZXQocmVzb3VyY2VWYWx1ZSkgfHwgW107XG4gICAgZ3JvdXBNZW1iZXJzLnB1c2godGFza0luZGV4KTtcbiAgICBncm91cHMuc2V0KHJlc291cmNlVmFsdWUsIGdyb3VwTWVtYmVycyk7XG4gIH0pO1xuXG4gIGNvbnN0IHJldCA9IG5ldyBNYXA8bnVtYmVyLCBudW1iZXI+KCk7XG5cbiAgLy8gVWdoLCBTdGFydCBhbmQgRmluaXNoIFRhc2tzIG5lZWQgdG8gYmUgbWFwcGVkLCBidXQgc2hvdWxkIG5vdCBiZSBkb25lIHZpYVxuICAvLyByZXNvdXJjZSB2YWx1ZSwgc28gU3RhcnQgc2hvdWxkIGFsd2F5cyBiZSBmaXJzdC5cbiAgcmV0LnNldCgwLCAwKTtcblxuICAvLyBOb3cgaW5jcmVtZW50IHVwIHRoZSByb3dzIGFzIHdlIG1vdmUgdGhyb3VnaCBhbGwgdGhlIGdyb3Vwcy5cbiAgbGV0IHJvdyA9IDE7XG4gIC8vIEFuZCB0cmFjayBob3cgbWFueSByb3dzIGFyZSBpbiBlYWNoIGdyb3VwLlxuICBjb25zdCByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPiA9IG5ldyBNYXAoKTtcbiAgcmVzb3VyY2VEZWZpbml0aW9uLnZhbHVlcy5mb3JFYWNoKFxuICAgIChyZXNvdXJjZVZhbHVlOiBzdHJpbmcsIHJlc291cmNlSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3Qgc3RhcnRPZlJvdyA9IHJvdztcbiAgICAgIChncm91cHMuZ2V0KHJlc291cmNlVmFsdWUpIHx8IFtdKS5mb3JFYWNoKCh0YXNrSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoaWdub3JhYmxlLmluY2x1ZGVzKHRhc2tJbmRleCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0LnNldCh0YXNrSW5kZXgsIHJvdyk7XG4gICAgICAgIHJvdysrO1xuICAgICAgfSk7XG4gICAgICByb3dSYW5nZXMuc2V0KHJlc291cmNlSW5kZXgsIHsgc3RhcnQ6IHN0YXJ0T2ZSb3csIGZpbmlzaDogcm93IH0pO1xuICAgIH1cbiAgKTtcbiAgcmV0LnNldChmaW5pc2hUYXNrSW5kZXgsIHJvdyk7XG5cbiAgcmV0dXJuIG9rKHtcbiAgICB0YXNrSW5kZXhUb1JvdzogcmV0LFxuICAgIHJvd1Jhbmdlczogcm93UmFuZ2VzLFxuICAgIHJlc291cmNlRGVmaW5pdGlvbjogcmVzb3VyY2VEZWZpbml0aW9uLFxuICB9KTtcbn07XG5cbmNvbnN0IGRyYXdTd2ltTGFuZUhpZ2hsaWdodHMgPSAoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBzY2FsZTogU2NhbGUsXG4gIHJvd1JhbmdlczogTWFwPG51bWJlciwgUm93UmFuZ2U+LFxuICB0b3RhbE51bWJlck9mRGF5czogbnVtYmVyLFxuICBncm91cENvbG9yOiBzdHJpbmdcbikgPT4ge1xuICBjdHguZmlsbFN0eWxlID0gZ3JvdXBDb2xvcjtcblxuICBsZXQgZ3JvdXAgPSAwO1xuICByb3dSYW5nZXMuZm9yRWFjaCgocm93UmFuZ2U6IFJvd1JhbmdlKSA9PiB7XG4gICAgY29uc3QgdG9wTGVmdCA9IHNjYWxlLmZlYXR1cmUoXG4gICAgICByb3dSYW5nZS5zdGFydCxcbiAgICAgIDAsXG4gICAgICBGZWF0dXJlLmdyb3VwRW52ZWxvcGVTdGFydFxuICAgICk7XG4gICAgY29uc3QgYm90dG9tUmlnaHQgPSBzY2FsZS5mZWF0dXJlKFxuICAgICAgcm93UmFuZ2UuZmluaXNoLFxuICAgICAgdG90YWxOdW1iZXJPZkRheXMgKyAxLFxuICAgICAgRmVhdHVyZS50YXNrRW52ZWxvcGVUb3BcbiAgICApO1xuICAgIGdyb3VwKys7XG4gICAgLy8gT25seSBoaWdobGlnaHQgZXZlcnkgb3RoZXIgZ3JvdXAgYmFja2dyb3VkIHdpdGggdGhlIGdyb3VwQ29sb3IuXG4gICAgaWYgKGdyb3VwICUgMiA9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGN0eC5maWxsUmVjdChcbiAgICAgIHRvcExlZnQueCxcbiAgICAgIHRvcExlZnQueSxcbiAgICAgIGJvdHRvbVJpZ2h0LnggLSB0b3BMZWZ0LngsXG4gICAgICBib3R0b21SaWdodC55IC0gdG9wTGVmdC55XG4gICAgKTtcbiAgfSk7XG59O1xuXG5jb25zdCBkcmF3U3dpbUxhbmVMYWJlbHMgPSAoXG4gIGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELFxuICBvcHRzOiBSZW5kZXJPcHRpb25zLFxuICByZXNvdXJjZURlZmluaXRpb246IFJlc291cmNlRGVmaW5pdGlvbixcbiAgc2NhbGU6IFNjYWxlLFxuICByb3dSYW5nZXM6IE1hcDxudW1iZXIsIFJvd1JhbmdlPlxuKSA9PiB7XG4gIGlmIChyb3dSYW5nZXMpIGN0eC5saW5lV2lkdGggPSAxO1xuICBjdHguZmlsbFN0eWxlID0gb3B0cy5jb2xvcnMub25TdXJmYWNlO1xuICBjb25zdCBncm91cEJ5T3JpZ2luID0gc2NhbGUuZmVhdHVyZSgwLCAwLCBGZWF0dXJlLmdyb3VwQnlPcmlnaW4pO1xuXG4gIGlmIChvcHRzLmhhc1RpbWVsaW5lKSB7XG4gICAgY3R4LnRleHRCYXNlbGluZSA9IFwiYm90dG9tXCI7XG4gICAgY3R4LmZpbGxUZXh0KG9wdHMuZ3JvdXBCeVJlc291cmNlLCBncm91cEJ5T3JpZ2luLngsIGdyb3VwQnlPcmlnaW4ueSk7XG4gIH1cblxuICBpZiAob3B0cy5oYXNUYXNrcykge1xuICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xuICAgIHJvd1Jhbmdlcy5mb3JFYWNoKChyb3dSYW5nZTogUm93UmFuZ2UsIHJlc291cmNlSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgaWYgKHJvd1JhbmdlLnN0YXJ0ID09PSByb3dSYW5nZS5maW5pc2gpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgdGV4dFN0YXJ0ID0gc2NhbGUuZmVhdHVyZShcbiAgICAgICAgcm93UmFuZ2Uuc3RhcnQsXG4gICAgICAgIDAsXG4gICAgICAgIEZlYXR1cmUuZ3JvdXBUZXh0U3RhcnRcbiAgICAgICk7XG4gICAgICBjdHguZmlsbFRleHQoXG4gICAgICAgIHJlc291cmNlRGVmaW5pdGlvbi52YWx1ZXNbcmVzb3VyY2VJbmRleF0sXG4gICAgICAgIHRleHRTdGFydC54LFxuICAgICAgICB0ZXh0U3RhcnQueVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxufTtcbiIsICJpbXBvcnQgeyBSZXN1bHQsIG9rLCBlcnJvciB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IFRhc2ssIENoYXJ0LCBDaGFydFZhbGlkYXRlIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBEaXJlY3RlZEVkZ2UsIGVkZ2VzQnlTcmNBbmREc3RUb01hcCB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBSb3VuZGVyIH0gZnJvbSBcIi4uL3R5cGVzL3R5cGVzLnRzXCI7XG5cbi8qKiBTcGFuIHJlcHJlc2VudHMgd2hlbiBhIHRhc2sgd2lsbCBiZSBkb25lLCBpLmUuIGl0IGNvbnRhaW5zIHRoZSB0aW1lIHRoZSB0YXNrXG4gKiBpcyBleHBlY3RlZCB0byBiZWdpbiBhbmQgZW5kLiAqL1xuZXhwb3J0IGNsYXNzIFNwYW4ge1xuICBzdGFydDogbnVtYmVyO1xuICBmaW5pc2g6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihzdGFydDogbnVtYmVyID0gMCwgZmluaXNoOiBudW1iZXIgPSAwKSB7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMuZmluaXNoID0gZmluaXNoO1xuICB9XG59XG5cbi8qKiBUaGUgc3RhbmRhcmQgc2xhY2sgY2FsY3VsYXRpb24gdmFsdWVzLiAqL1xuZXhwb3J0IGNsYXNzIFNsYWNrIHtcbiAgZWFybHk6IFNwYW4gPSBuZXcgU3BhbigpO1xuICBsYXRlOiBTcGFuID0gbmV3IFNwYW4oKTtcbiAgc2xhY2s6IG51bWJlciA9IDA7XG59XG5cbmV4cG9ydCB0eXBlIFRhc2tEdXJhdGlvbiA9ICh0OiBUYXNrLCB0YXNrSW5kZXg6IG51bWJlcikgPT4gbnVtYmVyO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFRhc2tEdXJhdGlvbiA9ICh0OiBUYXNrKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIHQuZHVyYXRpb247XG59O1xuXG5leHBvcnQgdHlwZSBTbGFja1Jlc3VsdCA9IFJlc3VsdDxTbGFja1tdPjtcblxuLy8gQ2FsY3VsYXRlIHRoZSBzbGFjayBmb3IgZWFjaCBUYXNrIGluIHRoZSBDaGFydC5cbmV4cG9ydCBmdW5jdGlvbiBDb21wdXRlU2xhY2soXG4gIGM6IENoYXJ0LFxuICB0YXNrRHVyYXRpb246IFRhc2tEdXJhdGlvbiA9IGRlZmF1bHRUYXNrRHVyYXRpb24sXG4gIHJvdW5kOiBSb3VuZGVyXG4pOiBTbGFja1Jlc3VsdCB7XG4gIC8vIENyZWF0ZSBhIFNsYWNrIGZvciBlYWNoIFRhc2suXG4gIGNvbnN0IHNsYWNrczogU2xhY2tbXSA9IG5ldyBBcnJheShjLlZlcnRpY2VzLmxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYy5WZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuICAgIHNsYWNrc1tpXSA9IG5ldyBTbGFjaygpO1xuICB9XG5cbiAgY29uc3QgciA9IENoYXJ0VmFsaWRhdGUoYyk7XG4gIGlmICghci5vaykge1xuICAgIHJldHVybiBlcnJvcihyLmVycm9yKTtcbiAgfVxuXG4gIGNvbnN0IGVkZ2VzID0gZWRnZXNCeVNyY0FuZERzdFRvTWFwKGMuRWRnZXMpO1xuXG4gIGNvbnN0IHRvcG9sb2dpY2FsT3JkZXIgPSByLnZhbHVlO1xuXG4gIC8vIEZpcnN0IGdvIGZvcndhcmQgdGhyb3VnaCB0aGUgdG9wb2xvZ2ljYWwgc29ydCBhbmQgZmluZCB0aGUgZWFybHkgc3RhcnQgZm9yXG4gIC8vIGVhY2ggdGFzaywgd2hpY2ggaXMgdGhlIG1heCBvZiBhbGwgdGhlIHByZWRlY2Vzc29ycyBlYXJseSBmaW5pc2ggdmFsdWVzLlxuICAvLyBTaW5jZSB3ZSBrbm93IHRoZSBkdXJhdGlvbiB3ZSBjYW4gYWxzbyBjb21wdXRlIHRoZSBlYXJseSBmaW5pc2guXG4gIHRvcG9sb2dpY2FsT3JkZXIuc2xpY2UoMSkuZm9yRWFjaCgodmVydGV4SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHRhc2sgPSBjLlZlcnRpY2VzW3ZlcnRleEluZGV4XTtcbiAgICBjb25zdCBzbGFjayA9IHNsYWNrc1t2ZXJ0ZXhJbmRleF07XG4gICAgc2xhY2suZWFybHkuc3RhcnQgPSBNYXRoLm1heChcbiAgICAgIC4uLmVkZ2VzLmJ5RHN0LmdldCh2ZXJ0ZXhJbmRleCkhLm1hcCgoZTogRGlyZWN0ZWRFZGdlKTogbnVtYmVyID0+IHtcbiAgICAgICAgY29uc3QgcHJlZGVjZXNzb3JTbGFjayA9IHNsYWNrc1tlLmldO1xuICAgICAgICByZXR1cm4gcHJlZGVjZXNzb3JTbGFjay5lYXJseS5maW5pc2g7XG4gICAgICB9KVxuICAgICk7XG4gICAgc2xhY2suZWFybHkuZmluaXNoID0gcm91bmQoXG4gICAgICBzbGFjay5lYXJseS5zdGFydCArIHRhc2tEdXJhdGlvbih0YXNrLCB2ZXJ0ZXhJbmRleClcbiAgICApO1xuICB9KTtcblxuICAvLyBOb3cgYmFja3dhcmRzIHRocm91Z2ggdGhlIHRvcG9sb2dpY2FsIHNvcnQgYW5kIGZpbmQgdGhlIGxhdGUgZmluaXNoIG9mIGVhY2hcbiAgLy8gdGFzaywgd2hpY2ggaXMgdGhlIG1pbiBvZiBhbGwgdGhlIHN1Y2Nlc3NvciB0YXNrcyBsYXRlIHN0YXJ0cy4gQWdhaW4gc2luY2VcbiAgLy8gd2Uga25vdyB0aGUgZHVyYXRpb24gd2UgY2FuIGFsc28gY29tcHV0ZSB0aGUgbGF0ZSBzdGFydC4gRmluYWxseSwgc2luY2Ugd2VcbiAgLy8gbm93IGhhdmUgYWxsIHRoZSBlYXJseS9sYXRlIGFuZCBzdGFydC9maW5pc2ggdmFsdWVzIHdlIGNhbiBub3cgY2FsY3VhdGUgdGhlXG4gIC8vIHNsYWNrLlxuICB0b3BvbG9naWNhbE9yZGVyLnJldmVyc2UoKS5mb3JFYWNoKCh2ZXJ0ZXhJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgdGFzayA9IGMuVmVydGljZXNbdmVydGV4SW5kZXhdO1xuICAgIGNvbnN0IHNsYWNrID0gc2xhY2tzW3ZlcnRleEluZGV4XTtcbiAgICBjb25zdCBzdWNjZXNzb3JzID0gZWRnZXMuYnlTcmMuZ2V0KHZlcnRleEluZGV4KTtcbiAgICBpZiAoIXN1Y2Nlc3NvcnMpIHtcbiAgICAgIHNsYWNrLmxhdGUuZmluaXNoID0gc2xhY2suZWFybHkuZmluaXNoO1xuICAgICAgc2xhY2subGF0ZS5zdGFydCA9IHNsYWNrLmVhcmx5LnN0YXJ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBzbGFjay5sYXRlLmZpbmlzaCA9IE1hdGgubWluKFxuICAgICAgICAuLi5lZGdlcy5ieVNyYy5nZXQodmVydGV4SW5kZXgpIS5tYXAoKGU6IERpcmVjdGVkRWRnZSk6IG51bWJlciA9PiB7XG4gICAgICAgICAgY29uc3Qgc3VjY2Vzc29yU2xhY2sgPSBzbGFja3NbZS5qXTtcbiAgICAgICAgICByZXR1cm4gc3VjY2Vzc29yU2xhY2subGF0ZS5zdGFydDtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICBzbGFjay5sYXRlLnN0YXJ0ID0gcm91bmQoXG4gICAgICAgIHNsYWNrLmxhdGUuZmluaXNoIC0gdGFza0R1cmF0aW9uKHRhc2ssIHZlcnRleEluZGV4KVxuICAgICAgKTtcbiAgICAgIHNsYWNrLnNsYWNrID0gcm91bmQoc2xhY2subGF0ZS5maW5pc2ggLSBzbGFjay5lYXJseS5maW5pc2gpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG9rKHNsYWNrcyk7XG59XG5cbmV4cG9ydCBjb25zdCBDcml0aWNhbFBhdGggPSAoc2xhY2tzOiBTbGFja1tdLCByb3VuZDogUm91bmRlcik6IG51bWJlcltdID0+IHtcbiAgY29uc3QgcmV0OiBudW1iZXJbXSA9IFtdO1xuICBzbGFja3MuZm9yRWFjaCgoc2xhY2s6IFNsYWNrLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKFxuICAgICAgcm91bmQoc2xhY2subGF0ZS5maW5pc2ggLSBzbGFjay5lYXJseS5maW5pc2gpIDwgTnVtYmVyLkVQU0lMT04gJiZcbiAgICAgIHJvdW5kKHNsYWNrLmVhcmx5LmZpbmlzaCAtIHNsYWNrLmVhcmx5LnN0YXJ0KSA+IE51bWJlci5FUFNJTE9OXG4gICAgKSB7XG4gICAgICByZXQucHVzaChpbmRleCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJldDtcbn07XG4iLCAiLy8gV2hlbiBhZGRpbmcgcHJvcGVydGllcyB0byBDb2xvclRoZW1lIGFsc28gbWFrZSBzdXJlIHRvIGFkZCBhIGNvcnJlc3BvbmRpbmdcbi8vIENTUyBAcHJvcGVydHkgZGVjbGFyYXRpb24uXG4vL1xuLy8gTm90ZSB0aGF0IGVhY2ggcHJvcGVydHkgYXNzdW1lcyB0aGUgcHJlc2VuY2Ugb2YgYSBDU1MgdmFyaWFibGUgb2YgdGhlIHNhbWUgbmFtZVxuLy8gd2l0aCBhIHByZWNlZWRpbmcgYC0tYC5cbmV4cG9ydCBpbnRlcmZhY2UgVGhlbWUge1xuICBzdXJmYWNlOiBzdHJpbmc7XG4gIG9uU3VyZmFjZTogc3RyaW5nO1xuICBvblN1cmZhY2VNdXRlZDogc3RyaW5nO1xuICBvblN1cmZhY2VTZWNvbmRhcnk6IHN0cmluZztcbiAgb3ZlcmxheTogc3RyaW5nO1xuICBncm91cENvbG9yOiBzdHJpbmc7XG4gIGhpZ2hsaWdodDogc3RyaW5nO1xufVxuXG50eXBlIFRoZW1lUHJvcCA9IGtleW9mIFRoZW1lO1xuXG5jb25zdCBjb2xvclRoZW1lUHJvdG90eXBlOiBUaGVtZSA9IHtcbiAgc3VyZmFjZTogXCJcIixcbiAgb25TdXJmYWNlOiBcIlwiLFxuICBvblN1cmZhY2VNdXRlZDogXCJcIixcbiAgb25TdXJmYWNlU2Vjb25kYXJ5OiBcIlwiLFxuICBvdmVybGF5OiBcIlwiLFxuICBncm91cENvbG9yOiBcIlwiLFxuICBoaWdobGlnaHQ6IFwiXCIsXG59O1xuXG5leHBvcnQgY29uc3QgY29sb3JUaGVtZUZyb21FbGVtZW50ID0gKGVsZTogSFRNTEVsZW1lbnQpOiBUaGVtZSA9PiB7XG4gIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGUpO1xuICBjb25zdCByZXQgPSBPYmplY3QuYXNzaWduKHt9LCBjb2xvclRoZW1lUHJvdG90eXBlKTtcbiAgT2JqZWN0LmtleXMocmV0KS5mb3JFYWNoKChuYW1lOiBzdHJpbmcpID0+IHtcbiAgICByZXRbbmFtZSBhcyBUaGVtZVByb3BdID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShgLS0ke25hbWV9YCk7XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcbiIsICIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxNyBHb29nbGUgTExDXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQlNELTMtQ2xhdXNlXG4gKi9cblxuLy8gSU1QT1JUQU5UOiB0aGVzZSBpbXBvcnRzIG11c3QgYmUgdHlwZS1vbmx5XG5pbXBvcnQgdHlwZSB7RGlyZWN0aXZlLCBEaXJlY3RpdmVSZXN1bHQsIFBhcnRJbmZvfSBmcm9tICcuL2RpcmVjdGl2ZS5qcyc7XG5pbXBvcnQgdHlwZSB7VHJ1c3RlZEhUTUwsIFRydXN0ZWRUeXBlc1dpbmRvd30gZnJvbSAndHJ1c3RlZC10eXBlcy9saWInO1xuXG5jb25zdCBERVZfTU9ERSA9IHRydWU7XG5jb25zdCBFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MgPSB0cnVlO1xuY29uc3QgRU5BQkxFX1NIQURZRE9NX05PUEFUQ0ggPSB0cnVlO1xuY29uc3QgTk9ERV9NT0RFID0gZmFsc2U7XG5cbi8vIEFsbG93cyBtaW5pZmllcnMgdG8gcmVuYW1lIHJlZmVyZW5jZXMgdG8gZ2xvYmFsVGhpc1xuY29uc3QgZ2xvYmFsID0gZ2xvYmFsVGhpcztcblxuLyoqXG4gKiBDb250YWlucyB0eXBlcyB0aGF0IGFyZSBwYXJ0IG9mIHRoZSB1bnN0YWJsZSBkZWJ1ZyBBUEkuXG4gKlxuICogRXZlcnl0aGluZyBpbiB0aGlzIEFQSSBpcyBub3Qgc3RhYmxlIGFuZCBtYXkgY2hhbmdlIG9yIGJlIHJlbW92ZWQgaW4gdGhlIGZ1dHVyZSxcbiAqIGV2ZW4gb24gcGF0Y2ggcmVsZWFzZXMuXG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbmFtZXNwYWNlXG5leHBvcnQgbmFtZXNwYWNlIExpdFVuc3RhYmxlIHtcbiAgLyoqXG4gICAqIFdoZW4gTGl0IGlzIHJ1bm5pbmcgaW4gZGV2IG1vZGUgYW5kIGB3aW5kb3cuZW1pdExpdERlYnVnTG9nRXZlbnRzYCBpcyB0cnVlLFxuICAgKiB3ZSB3aWxsIGVtaXQgJ2xpdC1kZWJ1ZycgZXZlbnRzIHRvIHdpbmRvdywgd2l0aCBsaXZlIGRldGFpbHMgYWJvdXQgdGhlIHVwZGF0ZSBhbmQgcmVuZGVyXG4gICAqIGxpZmVjeWNsZS4gVGhlc2UgY2FuIGJlIHVzZWZ1bCBmb3Igd3JpdGluZyBkZWJ1ZyB0b29saW5nIGFuZCB2aXN1YWxpemF0aW9ucy5cbiAgICpcbiAgICogUGxlYXNlIGJlIGF3YXJlIHRoYXQgcnVubmluZyB3aXRoIHdpbmRvdy5lbWl0TGl0RGVidWdMb2dFdmVudHMgaGFzIHBlcmZvcm1hbmNlIG92ZXJoZWFkLFxuICAgKiBtYWtpbmcgY2VydGFpbiBvcGVyYXRpb25zIHRoYXQgYXJlIG5vcm1hbGx5IHZlcnkgY2hlYXAgKGxpa2UgYSBuby1vcCByZW5kZXIpIG11Y2ggc2xvd2VyLFxuICAgKiBiZWNhdXNlIHdlIG11c3QgY29weSBkYXRhIGFuZCBkaXNwYXRjaCBldmVudHMuXG4gICAqL1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5hbWVzcGFjZVxuICBleHBvcnQgbmFtZXNwYWNlIERlYnVnTG9nIHtcbiAgICBleHBvcnQgdHlwZSBFbnRyeSA9XG4gICAgICB8IFRlbXBsYXRlUHJlcFxuICAgICAgfCBUZW1wbGF0ZUluc3RhbnRpYXRlZFxuICAgICAgfCBUZW1wbGF0ZUluc3RhbnRpYXRlZEFuZFVwZGF0ZWRcbiAgICAgIHwgVGVtcGxhdGVVcGRhdGluZ1xuICAgICAgfCBCZWdpblJlbmRlclxuICAgICAgfCBFbmRSZW5kZXJcbiAgICAgIHwgQ29tbWl0UGFydEVudHJ5XG4gICAgICB8IFNldFBhcnRWYWx1ZTtcbiAgICBleHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlUHJlcCB7XG4gICAgICBraW5kOiAndGVtcGxhdGUgcHJlcCc7XG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGU7XG4gICAgICBzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheTtcbiAgICAgIGNsb25hYmxlVGVtcGxhdGU6IEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XG4gICAgICBwYXJ0czogVGVtcGxhdGVQYXJ0W107XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQmVnaW5SZW5kZXIge1xuICAgICAga2luZDogJ2JlZ2luIHJlbmRlcic7XG4gICAgICBpZDogbnVtYmVyO1xuICAgICAgdmFsdWU6IHVua25vd247XG4gICAgICBjb250YWluZXI6IEhUTUxFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudDtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBwYXJ0OiBDaGlsZFBhcnQgfCB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgRW5kUmVuZGVyIHtcbiAgICAgIGtpbmQ6ICdlbmQgcmVuZGVyJztcbiAgICAgIGlkOiBudW1iZXI7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQgfCBEb2N1bWVudEZyYWdtZW50O1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIHBhcnQ6IENoaWxkUGFydDtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZUluc3RhbnRpYXRlZCB7XG4gICAgICBraW5kOiAndGVtcGxhdGUgaW5zdGFudGlhdGVkJztcbiAgICAgIHRlbXBsYXRlOiBUZW1wbGF0ZSB8IENvbXBpbGVkVGVtcGxhdGU7XG4gICAgICBpbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZTtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBmcmFnbWVudDogTm9kZTtcbiAgICAgIHBhcnRzOiBBcnJheTxQYXJ0IHwgdW5kZWZpbmVkPjtcbiAgICAgIHZhbHVlczogdW5rbm93bltdO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlSW5zdGFudGlhdGVkQW5kVXBkYXRlZCB7XG4gICAgICBraW5kOiAndGVtcGxhdGUgaW5zdGFudGlhdGVkIGFuZCB1cGRhdGVkJztcbiAgICAgIHRlbXBsYXRlOiBUZW1wbGF0ZSB8IENvbXBpbGVkVGVtcGxhdGU7XG4gICAgICBpbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZTtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBmcmFnbWVudDogTm9kZTtcbiAgICAgIHBhcnRzOiBBcnJheTxQYXJ0IHwgdW5kZWZpbmVkPjtcbiAgICAgIHZhbHVlczogdW5rbm93bltdO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlVXBkYXRpbmcge1xuICAgICAga2luZDogJ3RlbXBsYXRlIHVwZGF0aW5nJztcbiAgICAgIHRlbXBsYXRlOiBUZW1wbGF0ZSB8IENvbXBpbGVkVGVtcGxhdGU7XG4gICAgICBpbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZTtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBwYXJ0czogQXJyYXk8UGFydCB8IHVuZGVmaW5lZD47XG4gICAgICB2YWx1ZXM6IHVua25vd25bXTtcbiAgICB9XG4gICAgZXhwb3J0IGludGVyZmFjZSBTZXRQYXJ0VmFsdWUge1xuICAgICAga2luZDogJ3NldCBwYXJ0JztcbiAgICAgIHBhcnQ6IFBhcnQ7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIHZhbHVlSW5kZXg6IG51bWJlcjtcbiAgICAgIHZhbHVlczogdW5rbm93bltdO1xuICAgICAgdGVtcGxhdGVJbnN0YW5jZTogVGVtcGxhdGVJbnN0YW5jZTtcbiAgICB9XG5cbiAgICBleHBvcnQgdHlwZSBDb21taXRQYXJ0RW50cnkgPVxuICAgICAgfCBDb21taXROb3RoaW5nVG9DaGlsZEVudHJ5XG4gICAgICB8IENvbW1pdFRleHRcbiAgICAgIHwgQ29tbWl0Tm9kZVxuICAgICAgfCBDb21taXRBdHRyaWJ1dGVcbiAgICAgIHwgQ29tbWl0UHJvcGVydHlcbiAgICAgIHwgQ29tbWl0Qm9vbGVhbkF0dHJpYnV0ZVxuICAgICAgfCBDb21taXRFdmVudExpc3RlbmVyXG4gICAgICB8IENvbW1pdFRvRWxlbWVudEJpbmRpbmc7XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdE5vdGhpbmdUb0NoaWxkRW50cnkge1xuICAgICAga2luZDogJ2NvbW1pdCBub3RoaW5nIHRvIGNoaWxkJztcbiAgICAgIHN0YXJ0OiBDaGlsZE5vZGU7XG4gICAgICBlbmQ6IENoaWxkTm9kZSB8IG51bGw7XG4gICAgICBwYXJlbnQ6IERpc2Nvbm5lY3RhYmxlIHwgdW5kZWZpbmVkO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdFRleHQge1xuICAgICAga2luZDogJ2NvbW1pdCB0ZXh0JztcbiAgICAgIG5vZGU6IFRleHQ7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXROb2RlIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgbm9kZSc7XG4gICAgICBzdGFydDogTm9kZTtcbiAgICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUgfCB1bmRlZmluZWQ7XG4gICAgICB2YWx1ZTogTm9kZTtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRBdHRyaWJ1dGUge1xuICAgICAga2luZDogJ2NvbW1pdCBhdHRyaWJ1dGUnO1xuICAgICAgZWxlbWVudDogRWxlbWVudDtcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdFByb3BlcnR5IHtcbiAgICAgIGtpbmQ6ICdjb21taXQgcHJvcGVydHknO1xuICAgICAgZWxlbWVudDogRWxlbWVudDtcbiAgICAgIG5hbWU6IHN0cmluZztcbiAgICAgIHZhbHVlOiB1bmtub3duO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIENvbW1pdEJvb2xlYW5BdHRyaWJ1dGUge1xuICAgICAga2luZDogJ2NvbW1pdCBib29sZWFuIGF0dHJpYnV0ZSc7XG4gICAgICBlbGVtZW50OiBFbGVtZW50O1xuICAgICAgbmFtZTogc3RyaW5nO1xuICAgICAgdmFsdWU6IGJvb2xlYW47XG4gICAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0RXZlbnRMaXN0ZW5lciB7XG4gICAgICBraW5kOiAnY29tbWl0IGV2ZW50IGxpc3RlbmVyJztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9sZExpc3RlbmVyOiB1bmtub3duO1xuICAgICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIC8vIFRydWUgaWYgd2UncmUgcmVtb3ZpbmcgdGhlIG9sZCBldmVudCBsaXN0ZW5lciAoZS5nLiBiZWNhdXNlIHNldHRpbmdzIGNoYW5nZWQsIG9yIHZhbHVlIGlzIG5vdGhpbmcpXG4gICAgICByZW1vdmVMaXN0ZW5lcjogYm9vbGVhbjtcbiAgICAgIC8vIFRydWUgaWYgd2UncmUgYWRkaW5nIGEgbmV3IGV2ZW50IGxpc3RlbmVyIChlLmcuIGJlY2F1c2UgZmlyc3QgcmVuZGVyLCBvciBzZXR0aW5ncyBjaGFuZ2VkKVxuICAgICAgYWRkTGlzdGVuZXI6IGJvb2xlYW47XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBDb21taXRUb0VsZW1lbnRCaW5kaW5nIHtcbiAgICAgIGtpbmQ6ICdjb21taXQgdG8gZWxlbWVudCBiaW5kaW5nJztcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICAgICB2YWx1ZTogdW5rbm93bjtcbiAgICAgIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG5cbmludGVyZmFjZSBEZWJ1Z0xvZ2dpbmdXaW5kb3cge1xuICAvLyBFdmVuIGluIGRldiBtb2RlLCB3ZSBnZW5lcmFsbHkgZG9uJ3Qgd2FudCB0byBlbWl0IHRoZXNlIGV2ZW50cywgYXMgdGhhdCdzXG4gIC8vIGFub3RoZXIgbGV2ZWwgb2YgY29zdCwgc28gb25seSBlbWl0IHRoZW0gd2hlbiBERVZfTU9ERSBpcyB0cnVlIF9hbmRfIHdoZW5cbiAgLy8gd2luZG93LmVtaXRMaXREZWJ1Z0V2ZW50cyBpcyB0cnVlLlxuICBlbWl0TGl0RGVidWdMb2dFdmVudHM/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFVzZWZ1bCBmb3IgdmlzdWFsaXppbmcgYW5kIGxvZ2dpbmcgaW5zaWdodHMgaW50byB3aGF0IHRoZSBMaXQgdGVtcGxhdGUgc3lzdGVtIGlzIGRvaW5nLlxuICpcbiAqIENvbXBpbGVkIG91dCBvZiBwcm9kIG1vZGUgYnVpbGRzLlxuICovXG5jb25zdCBkZWJ1Z0xvZ0V2ZW50ID0gREVWX01PREVcbiAgPyAoZXZlbnQ6IExpdFVuc3RhYmxlLkRlYnVnTG9nLkVudHJ5KSA9PiB7XG4gICAgICBjb25zdCBzaG91bGRFbWl0ID0gKGdsb2JhbCBhcyB1bmtub3duIGFzIERlYnVnTG9nZ2luZ1dpbmRvdylcbiAgICAgICAgLmVtaXRMaXREZWJ1Z0xvZ0V2ZW50cztcbiAgICAgIGlmICghc2hvdWxkRW1pdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBnbG9iYWwuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgbmV3IEN1c3RvbUV2ZW50PExpdFVuc3RhYmxlLkRlYnVnTG9nLkVudHJ5PignbGl0LWRlYnVnJywge1xuICAgICAgICAgIGRldGFpbDogZXZlbnQsXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgOiB1bmRlZmluZWQ7XG4vLyBVc2VkIGZvciBjb25uZWN0aW5nIGJlZ2luUmVuZGVyIGFuZCBlbmRSZW5kZXIgZXZlbnRzIHdoZW4gdGhlcmUgYXJlIG5lc3RlZFxuLy8gcmVuZGVycyB3aGVuIGVycm9ycyBhcmUgdGhyb3duIHByZXZlbnRpbmcgYW4gZW5kUmVuZGVyIGV2ZW50IGZyb20gYmVpbmdcbi8vIGNhbGxlZC5cbmxldCBkZWJ1Z0xvZ1JlbmRlcklkID0gMDtcblxubGV0IGlzc3VlV2FybmluZzogKGNvZGU6IHN0cmluZywgd2FybmluZzogc3RyaW5nKSA9PiB2b2lkO1xuXG5pZiAoREVWX01PREUpIHtcbiAgZ2xvYmFsLmxpdElzc3VlZFdhcm5pbmdzID8/PSBuZXcgU2V0KCk7XG5cbiAgLy8gSXNzdWUgYSB3YXJuaW5nLCBpZiB3ZSBoYXZlbid0IGFscmVhZHkuXG4gIGlzc3VlV2FybmluZyA9IChjb2RlOiBzdHJpbmcsIHdhcm5pbmc6IHN0cmluZykgPT4ge1xuICAgIHdhcm5pbmcgKz0gY29kZVxuICAgICAgPyBgIFNlZSBodHRwczovL2xpdC5kZXYvbXNnLyR7Y29kZX0gZm9yIG1vcmUgaW5mb3JtYXRpb24uYFxuICAgICAgOiAnJztcbiAgICBpZiAoIWdsb2JhbC5saXRJc3N1ZWRXYXJuaW5ncyEuaGFzKHdhcm5pbmcpKSB7XG4gICAgICBjb25zb2xlLndhcm4od2FybmluZyk7XG4gICAgICBnbG9iYWwubGl0SXNzdWVkV2FybmluZ3MhLmFkZCh3YXJuaW5nKTtcbiAgICB9XG4gIH07XG5cbiAgaXNzdWVXYXJuaW5nKFxuICAgICdkZXYtbW9kZScsXG4gICAgYExpdCBpcyBpbiBkZXYgbW9kZS4gTm90IHJlY29tbWVuZGVkIGZvciBwcm9kdWN0aW9uIWBcbiAgKTtcbn1cblxuY29uc3Qgd3JhcCA9XG4gIEVOQUJMRV9TSEFEWURPTV9OT1BBVENIICYmXG4gIGdsb2JhbC5TaGFkeURPTT8uaW5Vc2UgJiZcbiAgZ2xvYmFsLlNoYWR5RE9NPy5ub1BhdGNoID09PSB0cnVlXG4gICAgPyAoZ2xvYmFsLlNoYWR5RE9NIS53cmFwIGFzIDxUIGV4dGVuZHMgTm9kZT4obm9kZTogVCkgPT4gVClcbiAgICA6IDxUIGV4dGVuZHMgTm9kZT4obm9kZTogVCkgPT4gbm9kZTtcblxuY29uc3QgdHJ1c3RlZFR5cGVzID0gKGdsb2JhbCBhcyB1bmtub3duIGFzIFRydXN0ZWRUeXBlc1dpbmRvdykudHJ1c3RlZFR5cGVzO1xuXG4vKipcbiAqIE91ciBUcnVzdGVkVHlwZVBvbGljeSBmb3IgSFRNTCB3aGljaCBpcyBkZWNsYXJlZCB1c2luZyB0aGUgaHRtbCB0ZW1wbGF0ZVxuICogdGFnIGZ1bmN0aW9uLlxuICpcbiAqIFRoYXQgSFRNTCBpcyBhIGRldmVsb3Blci1hdXRob3JlZCBjb25zdGFudCwgYW5kIGlzIHBhcnNlZCB3aXRoIGlubmVySFRNTFxuICogYmVmb3JlIGFueSB1bnRydXN0ZWQgZXhwcmVzc2lvbnMgaGF2ZSBiZWVuIG1peGVkIGluLiBUaGVyZWZvciBpdCBpc1xuICogY29uc2lkZXJlZCBzYWZlIGJ5IGNvbnN0cnVjdGlvbi5cbiAqL1xuY29uc3QgcG9saWN5ID0gdHJ1c3RlZFR5cGVzXG4gID8gdHJ1c3RlZFR5cGVzLmNyZWF0ZVBvbGljeSgnbGl0LWh0bWwnLCB7XG4gICAgICBjcmVhdGVIVE1MOiAocykgPT4gcyxcbiAgICB9KVxuICA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBVc2VkIHRvIHNhbml0aXplIGFueSB2YWx1ZSBiZWZvcmUgaXQgaXMgd3JpdHRlbiBpbnRvIHRoZSBET00uIFRoaXMgY2FuIGJlXG4gKiB1c2VkIHRvIGltcGxlbWVudCBhIHNlY3VyaXR5IHBvbGljeSBvZiBhbGxvd2VkIGFuZCBkaXNhbGxvd2VkIHZhbHVlcyBpblxuICogb3JkZXIgdG8gcHJldmVudCBYU1MgYXR0YWNrcy5cbiAqXG4gKiBPbmUgd2F5IG9mIHVzaW5nIHRoaXMgY2FsbGJhY2sgd291bGQgYmUgdG8gY2hlY2sgYXR0cmlidXRlcyBhbmQgcHJvcGVydGllc1xuICogYWdhaW5zdCBhIGxpc3Qgb2YgaGlnaCByaXNrIGZpZWxkcywgYW5kIHJlcXVpcmUgdGhhdCB2YWx1ZXMgd3JpdHRlbiB0byBzdWNoXG4gKiBmaWVsZHMgYmUgaW5zdGFuY2VzIG9mIGEgY2xhc3Mgd2hpY2ggaXMgc2FmZSBieSBjb25zdHJ1Y3Rpb24uIENsb3N1cmUncyBTYWZlXG4gKiBIVE1MIFR5cGVzIGlzIG9uZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIHRlY2huaXF1ZSAoXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZ29vZ2xlL3NhZmUtaHRtbC10eXBlcy9ibG9iL21hc3Rlci9kb2Mvc2FmZWh0bWwtdHlwZXMubWQpLlxuICogVGhlIFRydXN0ZWRUeXBlcyBwb2x5ZmlsbCBpbiBBUEktb25seSBtb2RlIGNvdWxkIGFsc28gYmUgdXNlZCBhcyBhIGJhc2lzXG4gKiBmb3IgdGhpcyB0ZWNobmlxdWUgKGh0dHBzOi8vZ2l0aHViLmNvbS9XSUNHL3RydXN0ZWQtdHlwZXMpLlxuICpcbiAqIEBwYXJhbSBub2RlIFRoZSBIVE1MIG5vZGUgKHVzdWFsbHkgZWl0aGVyIGEgI3RleHQgbm9kZSBvciBhbiBFbGVtZW50KSB0aGF0XG4gKiAgICAgaXMgYmVpbmcgd3JpdHRlbiB0by4gTm90ZSB0aGF0IHRoaXMgaXMganVzdCBhbiBleGVtcGxhciBub2RlLCB0aGUgd3JpdGVcbiAqICAgICBtYXkgdGFrZSBwbGFjZSBhZ2FpbnN0IGFub3RoZXIgaW5zdGFuY2Ugb2YgdGhlIHNhbWUgY2xhc3Mgb2Ygbm9kZS5cbiAqIEBwYXJhbSBuYW1lIFRoZSBuYW1lIG9mIGFuIGF0dHJpYnV0ZSBvciBwcm9wZXJ0eSAoZm9yIGV4YW1wbGUsICdocmVmJykuXG4gKiBAcGFyYW0gdHlwZSBJbmRpY2F0ZXMgd2hldGhlciB0aGUgd3JpdGUgdGhhdCdzIGFib3V0IHRvIGJlIHBlcmZvcm1lZCB3aWxsXG4gKiAgICAgYmUgdG8gYSBwcm9wZXJ0eSBvciBhIG5vZGUuXG4gKiBAcmV0dXJuIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHNhbml0aXplIHRoaXMgY2xhc3Mgb2Ygd3JpdGVzLlxuICovXG5leHBvcnQgdHlwZSBTYW5pdGl6ZXJGYWN0b3J5ID0gKFxuICBub2RlOiBOb2RlLFxuICBuYW1lOiBzdHJpbmcsXG4gIHR5cGU6ICdwcm9wZXJ0eScgfCAnYXR0cmlidXRlJ1xuKSA9PiBWYWx1ZVNhbml0aXplcjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHdoaWNoIGNhbiBzYW5pdGl6ZSB2YWx1ZXMgdGhhdCB3aWxsIGJlIHdyaXR0ZW4gdG8gYSBzcGVjaWZpYyBraW5kXG4gKiBvZiBET00gc2luay5cbiAqXG4gKiBTZWUgU2FuaXRpemVyRmFjdG9yeS5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHNhbml0aXplLiBXaWxsIGJlIHRoZSBhY3R1YWwgdmFsdWUgcGFzc2VkIGludG9cbiAqICAgICB0aGUgbGl0LWh0bWwgdGVtcGxhdGUgbGl0ZXJhbCwgc28gdGhpcyBjb3VsZCBiZSBvZiBhbnkgdHlwZS5cbiAqIEByZXR1cm4gVGhlIHZhbHVlIHRvIHdyaXRlIHRvIHRoZSBET00uIFVzdWFsbHkgdGhlIHNhbWUgYXMgdGhlIGlucHV0IHZhbHVlLFxuICogICAgIHVubGVzcyBzYW5pdGl6YXRpb24gaXMgbmVlZGVkLlxuICovXG5leHBvcnQgdHlwZSBWYWx1ZVNhbml0aXplciA9ICh2YWx1ZTogdW5rbm93bikgPT4gdW5rbm93bjtcblxuY29uc3QgaWRlbnRpdHlGdW5jdGlvbjogVmFsdWVTYW5pdGl6ZXIgPSAodmFsdWU6IHVua25vd24pID0+IHZhbHVlO1xuY29uc3Qgbm9vcFNhbml0aXplcjogU2FuaXRpemVyRmFjdG9yeSA9IChcbiAgX25vZGU6IE5vZGUsXG4gIF9uYW1lOiBzdHJpbmcsXG4gIF90eXBlOiAncHJvcGVydHknIHwgJ2F0dHJpYnV0ZSdcbikgPT4gaWRlbnRpdHlGdW5jdGlvbjtcblxuLyoqIFNldHMgdGhlIGdsb2JhbCBzYW5pdGl6ZXIgZmFjdG9yeS4gKi9cbmNvbnN0IHNldFNhbml0aXplciA9IChuZXdTYW5pdGl6ZXI6IFNhbml0aXplckZhY3RvcnkpID0+IHtcbiAgaWYgKCFFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKHNhbml0aXplckZhY3RvcnlJbnRlcm5hbCAhPT0gbm9vcFNhbml0aXplcikge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBBdHRlbXB0ZWQgdG8gb3ZlcndyaXRlIGV4aXN0aW5nIGxpdC1odG1sIHNlY3VyaXR5IHBvbGljeS5gICtcbiAgICAgICAgYCBzZXRTYW5pdGl6ZURPTVZhbHVlRmFjdG9yeSBzaG91bGQgYmUgY2FsbGVkIGF0IG1vc3Qgb25jZS5gXG4gICAgKTtcbiAgfVxuICBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwgPSBuZXdTYW5pdGl6ZXI7XG59O1xuXG4vKipcbiAqIE9ubHkgdXNlZCBpbiBpbnRlcm5hbCB0ZXN0cywgbm90IGEgcGFydCBvZiB0aGUgcHVibGljIEFQSS5cbiAqL1xuY29uc3QgX3Rlc3RPbmx5Q2xlYXJTYW5pdGl6ZXJGYWN0b3J5RG9Ob3RDYWxsT3JFbHNlID0gKCkgPT4ge1xuICBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwgPSBub29wU2FuaXRpemVyO1xufTtcblxuY29uc3QgY3JlYXRlU2FuaXRpemVyOiBTYW5pdGl6ZXJGYWN0b3J5ID0gKG5vZGUsIG5hbWUsIHR5cGUpID0+IHtcbiAgcmV0dXJuIHNhbml0aXplckZhY3RvcnlJbnRlcm5hbChub2RlLCBuYW1lLCB0eXBlKTtcbn07XG5cbi8vIEFkZGVkIHRvIGFuIGF0dHJpYnV0ZSBuYW1lIHRvIG1hcmsgdGhlIGF0dHJpYnV0ZSBhcyBib3VuZCBzbyB3ZSBjYW4gZmluZFxuLy8gaXQgZWFzaWx5LlxuY29uc3QgYm91bmRBdHRyaWJ1dGVTdWZmaXggPSAnJGxpdCQnO1xuXG4vLyBUaGlzIG1hcmtlciBpcyB1c2VkIGluIG1hbnkgc3ludGFjdGljIHBvc2l0aW9ucyBpbiBIVE1MLCBzbyBpdCBtdXN0IGJlXG4vLyBhIHZhbGlkIGVsZW1lbnQgbmFtZSBhbmQgYXR0cmlidXRlIG5hbWUuIFdlIGRvbid0IHN1cHBvcnQgZHluYW1pYyBuYW1lcyAoeWV0KVxuLy8gYnV0IHRoaXMgYXQgbGVhc3QgZW5zdXJlcyB0aGF0IHRoZSBwYXJzZSB0cmVlIGlzIGNsb3NlciB0byB0aGUgdGVtcGxhdGVcbi8vIGludGVudGlvbi5cbmNvbnN0IG1hcmtlciA9IGBsaXQkJHtNYXRoLnJhbmRvbSgpLnRvRml4ZWQoOSkuc2xpY2UoMil9JGA7XG5cbi8vIFN0cmluZyB1c2VkIHRvIHRlbGwgaWYgYSBjb21tZW50IGlzIGEgbWFya2VyIGNvbW1lbnRcbmNvbnN0IG1hcmtlck1hdGNoID0gJz8nICsgbWFya2VyO1xuXG4vLyBUZXh0IHVzZWQgdG8gaW5zZXJ0IGEgY29tbWVudCBtYXJrZXIgbm9kZS4gV2UgdXNlIHByb2Nlc3NpbmcgaW5zdHJ1Y3Rpb25cbi8vIHN5bnRheCBiZWNhdXNlIGl0J3Mgc2xpZ2h0bHkgc21hbGxlciwgYnV0IHBhcnNlcyBhcyBhIGNvbW1lbnQgbm9kZS5cbmNvbnN0IG5vZGVNYXJrZXIgPSBgPCR7bWFya2VyTWF0Y2h9PmA7XG5cbmNvbnN0IGQgPVxuICBOT0RFX01PREUgJiYgZ2xvYmFsLmRvY3VtZW50ID09PSB1bmRlZmluZWRcbiAgICA/ICh7XG4gICAgICAgIGNyZWF0ZVRyZWVXYWxrZXIoKSB7XG4gICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9LFxuICAgICAgfSBhcyB1bmtub3duIGFzIERvY3VtZW50KVxuICAgIDogZG9jdW1lbnQ7XG5cbi8vIENyZWF0ZXMgYSBkeW5hbWljIG1hcmtlci4gV2UgbmV2ZXIgaGF2ZSB0byBzZWFyY2ggZm9yIHRoZXNlIGluIHRoZSBET00uXG5jb25zdCBjcmVhdGVNYXJrZXIgPSAoKSA9PiBkLmNyZWF0ZUNvbW1lbnQoJycpO1xuXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10eXBlb2Ytb3BlcmF0b3JcbnR5cGUgUHJpbWl0aXZlID0gbnVsbCB8IHVuZGVmaW5lZCB8IGJvb2xlYW4gfCBudW1iZXIgfCBzdHJpbmcgfCBzeW1ib2wgfCBiaWdpbnQ7XG5jb25zdCBpc1ByaW1pdGl2ZSA9ICh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFByaW1pdGl2ZSA9PlxuICB2YWx1ZSA9PT0gbnVsbCB8fCAodHlwZW9mIHZhbHVlICE9ICdvYmplY3QnICYmIHR5cGVvZiB2YWx1ZSAhPSAnZnVuY3Rpb24nKTtcbmNvbnN0IGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuY29uc3QgaXNJdGVyYWJsZSA9ICh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIEl0ZXJhYmxlPHVua25vd24+ID0+XG4gIGlzQXJyYXkodmFsdWUpIHx8XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIHR5cGVvZiAodmFsdWUgYXMgYW55KT8uW1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbic7XG5cbmNvbnN0IFNQQUNFX0NIQVIgPSBgWyBcXHRcXG5cXGZcXHJdYDtcbmNvbnN0IEFUVFJfVkFMVUVfQ0hBUiA9IGBbXiBcXHRcXG5cXGZcXHJcIidcXGA8Pj1dYDtcbmNvbnN0IE5BTUVfQ0hBUiA9IGBbXlxcXFxzXCInPj0vXWA7XG5cbi8vIFRoZXNlIHJlZ2V4ZXMgcmVwcmVzZW50IHRoZSBmaXZlIHBhcnNpbmcgc3RhdGVzIHRoYXQgd2UgY2FyZSBhYm91dCBpbiB0aGVcbi8vIFRlbXBsYXRlJ3MgSFRNTCBzY2FubmVyLiBUaGV5IG1hdGNoIHRoZSAqZW5kKiBvZiB0aGUgc3RhdGUgdGhleSdyZSBuYW1lZFxuLy8gYWZ0ZXIuXG4vLyBEZXBlbmRpbmcgb24gdGhlIG1hdGNoLCB3ZSB0cmFuc2l0aW9uIHRvIGEgbmV3IHN0YXRlLiBJZiB0aGVyZSdzIG5vIG1hdGNoLFxuLy8gd2Ugc3RheSBpbiB0aGUgc2FtZSBzdGF0ZS5cbi8vIE5vdGUgdGhhdCB0aGUgcmVnZXhlcyBhcmUgc3RhdGVmdWwuIFdlIHV0aWxpemUgbGFzdEluZGV4IGFuZCBzeW5jIGl0XG4vLyBhY3Jvc3MgdGhlIG11bHRpcGxlIHJlZ2V4ZXMgdXNlZC4gSW4gYWRkaXRpb24gdG8gdGhlIGZpdmUgcmVnZXhlcyBiZWxvd1xuLy8gd2UgYWxzbyBkeW5hbWljYWxseSBjcmVhdGUgYSByZWdleCB0byBmaW5kIHRoZSBtYXRjaGluZyBlbmQgdGFncyBmb3IgcmF3XG4vLyB0ZXh0IGVsZW1lbnRzLlxuXG4vKipcbiAqIEVuZCBvZiB0ZXh0IGlzOiBgPGAgZm9sbG93ZWQgYnk6XG4gKiAgIChjb21tZW50IHN0YXJ0KSBvciAodGFnKSBvciAoZHluYW1pYyB0YWcgYmluZGluZylcbiAqL1xuY29uc3QgdGV4dEVuZFJlZ2V4ID0gLzwoPzooIS0tfFxcL1teYS16QS1aXSl8KFxcLz9bYS16QS1aXVtePlxcc10qKXwoXFwvPyQpKS9nO1xuY29uc3QgQ09NTUVOVF9TVEFSVCA9IDE7XG5jb25zdCBUQUdfTkFNRSA9IDI7XG5jb25zdCBEWU5BTUlDX1RBR19OQU1FID0gMztcblxuY29uc3QgY29tbWVudEVuZFJlZ2V4ID0gLy0tPi9nO1xuLyoqXG4gKiBDb21tZW50cyBub3Qgc3RhcnRlZCB3aXRoIDwhLS0sIGxpa2UgPC97LCBjYW4gYmUgZW5kZWQgYnkgYSBzaW5nbGUgYD5gXG4gKi9cbmNvbnN0IGNvbW1lbnQyRW5kUmVnZXggPSAvPi9nO1xuXG4vKipcbiAqIFRoZSB0YWdFbmQgcmVnZXggbWF0Y2hlcyB0aGUgZW5kIG9mIHRoZSBcImluc2lkZSBhbiBvcGVuaW5nXCIgdGFnIHN5bnRheFxuICogcG9zaXRpb24uIEl0IGVpdGhlciBtYXRjaGVzIGEgYD5gLCBhbiBhdHRyaWJ1dGUtbGlrZSBzZXF1ZW5jZSwgb3IgdGhlIGVuZFxuICogb2YgdGhlIHN0cmluZyBhZnRlciBhIHNwYWNlIChhdHRyaWJ1dGUtbmFtZSBwb3NpdGlvbiBlbmRpbmcpLlxuICpcbiAqIFNlZSBhdHRyaWJ1dGVzIGluIHRoZSBIVE1MIHNwZWM6XG4gKiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvc3ludGF4Lmh0bWwjZWxlbWVudHMtYXR0cmlidXRlc1xuICpcbiAqIFwiIFxcdFxcblxcZlxcclwiIGFyZSBIVE1MIHNwYWNlIGNoYXJhY3RlcnM6XG4gKiBodHRwczovL2luZnJhLnNwZWMud2hhdHdnLm9yZy8jYXNjaWktd2hpdGVzcGFjZVxuICpcbiAqIFNvIGFuIGF0dHJpYnV0ZSBpczpcbiAqICAqIFRoZSBuYW1lOiBhbnkgY2hhcmFjdGVyIGV4Y2VwdCBhIHdoaXRlc3BhY2UgY2hhcmFjdGVyLCAoXCIpLCAoJyksIFwiPlwiLFxuICogICAgXCI9XCIsIG9yIFwiL1wiLiBOb3RlOiB0aGlzIGlzIGRpZmZlcmVudCBmcm9tIHRoZSBIVE1MIHNwZWMgd2hpY2ggYWxzbyBleGNsdWRlcyBjb250cm9sIGNoYXJhY3RlcnMuXG4gKiAgKiBGb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgc3BhY2UgY2hhcmFjdGVyc1xuICogICogRm9sbG93ZWQgYnkgXCI9XCJcbiAqICAqIEZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBzcGFjZSBjaGFyYWN0ZXJzXG4gKiAgKiBGb2xsb3dlZCBieTpcbiAqICAgICogQW55IGNoYXJhY3RlciBleGNlcHQgc3BhY2UsICgnKSwgKFwiKSwgXCI8XCIsIFwiPlwiLCBcIj1cIiwgKGApLCBvclxuICogICAgKiAoXCIpIHRoZW4gYW55IG5vbi0oXCIpLCBvclxuICogICAgKiAoJykgdGhlbiBhbnkgbm9uLSgnKVxuICovXG5jb25zdCB0YWdFbmRSZWdleCA9IG5ldyBSZWdFeHAoXG4gIGA+fCR7U1BBQ0VfQ0hBUn0oPzooJHtOQU1FX0NIQVJ9KykoJHtTUEFDRV9DSEFSfSo9JHtTUEFDRV9DSEFSfSooPzoke0FUVFJfVkFMVUVfQ0hBUn18KFwifCcpfCkpfCQpYCxcbiAgJ2cnXG4pO1xuY29uc3QgRU5USVJFX01BVENIID0gMDtcbmNvbnN0IEFUVFJJQlVURV9OQU1FID0gMTtcbmNvbnN0IFNQQUNFU19BTkRfRVFVQUxTID0gMjtcbmNvbnN0IFFVT1RFX0NIQVIgPSAzO1xuXG5jb25zdCBzaW5nbGVRdW90ZUF0dHJFbmRSZWdleCA9IC8nL2c7XG5jb25zdCBkb3VibGVRdW90ZUF0dHJFbmRSZWdleCA9IC9cIi9nO1xuLyoqXG4gKiBNYXRjaGVzIHRoZSByYXcgdGV4dCBlbGVtZW50cy5cbiAqXG4gKiBDb21tZW50cyBhcmUgbm90IHBhcnNlZCB3aXRoaW4gcmF3IHRleHQgZWxlbWVudHMsIHNvIHdlIG5lZWQgdG8gc2VhcmNoIHRoZWlyXG4gKiB0ZXh0IGNvbnRlbnQgZm9yIG1hcmtlciBzdHJpbmdzLlxuICovXG5jb25zdCByYXdUZXh0RWxlbWVudCA9IC9eKD86c2NyaXB0fHN0eWxlfHRleHRhcmVhfHRpdGxlKSQvaTtcblxuLyoqIFRlbXBsYXRlUmVzdWx0IHR5cGVzICovXG5jb25zdCBIVE1MX1JFU1VMVCA9IDE7XG5jb25zdCBTVkdfUkVTVUxUID0gMjtcbmNvbnN0IE1BVEhNTF9SRVNVTFQgPSAzO1xuXG50eXBlIFJlc3VsdFR5cGUgPSB0eXBlb2YgSFRNTF9SRVNVTFQgfCB0eXBlb2YgU1ZHX1JFU1VMVCB8IHR5cGVvZiBNQVRITUxfUkVTVUxUO1xuXG4vLyBUZW1wbGF0ZVBhcnQgdHlwZXNcbi8vIElNUE9SVEFOVDogdGhlc2UgbXVzdCBtYXRjaCB0aGUgdmFsdWVzIGluIFBhcnRUeXBlXG5jb25zdCBBVFRSSUJVVEVfUEFSVCA9IDE7XG5jb25zdCBDSElMRF9QQVJUID0gMjtcbmNvbnN0IFBST1BFUlRZX1BBUlQgPSAzO1xuY29uc3QgQk9PTEVBTl9BVFRSSUJVVEVfUEFSVCA9IDQ7XG5jb25zdCBFVkVOVF9QQVJUID0gNTtcbmNvbnN0IEVMRU1FTlRfUEFSVCA9IDY7XG5jb25zdCBDT01NRU5UX1BBUlQgPSA3O1xuXG4vKipcbiAqIFRoZSByZXR1cm4gdHlwZSBvZiB0aGUgdGVtcGxhdGUgdGFnIGZ1bmN0aW9ucywge0BsaW5rY29kZSBodG1sfSBhbmRcbiAqIHtAbGlua2NvZGUgc3ZnfSB3aGVuIGl0IGhhc24ndCBiZWVuIGNvbXBpbGVkIGJ5IEBsaXQtbGFicy9jb21waWxlci5cbiAqXG4gKiBBIGBUZW1wbGF0ZVJlc3VsdGAgb2JqZWN0IGhvbGRzIGFsbCB0aGUgaW5mb3JtYXRpb24gYWJvdXQgYSB0ZW1wbGF0ZVxuICogZXhwcmVzc2lvbiByZXF1aXJlZCB0byByZW5kZXIgaXQ6IHRoZSB0ZW1wbGF0ZSBzdHJpbmdzLCBleHByZXNzaW9uIHZhbHVlcyxcbiAqIGFuZCB0eXBlIG9mIHRlbXBsYXRlIChodG1sIG9yIHN2ZykuXG4gKlxuICogYFRlbXBsYXRlUmVzdWx0YCBvYmplY3RzIGRvIG5vdCBjcmVhdGUgYW55IERPTSBvbiB0aGVpciBvd24uIFRvIGNyZWF0ZSBvclxuICogdXBkYXRlIERPTSB5b3UgbmVlZCB0byByZW5kZXIgdGhlIGBUZW1wbGF0ZVJlc3VsdGAuIFNlZVxuICogW1JlbmRlcmluZ10oaHR0cHM6Ly9saXQuZGV2L2RvY3MvY29tcG9uZW50cy9yZW5kZXJpbmcpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqL1xuZXhwb3J0IHR5cGUgVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0PFQgZXh0ZW5kcyBSZXN1bHRUeXBlID0gUmVzdWx0VHlwZT4gPSB7XG4gIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gIFsnXyRsaXRUeXBlJCddOiBUO1xuICBzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheTtcbiAgdmFsdWVzOiB1bmtub3duW107XG59O1xuXG4vKipcbiAqIFRoaXMgaXMgYSB0ZW1wbGF0ZSByZXN1bHQgdGhhdCBtYXkgYmUgZWl0aGVyIHVuY29tcGlsZWQgb3IgY29tcGlsZWQuXG4gKlxuICogSW4gdGhlIGZ1dHVyZSwgVGVtcGxhdGVSZXN1bHQgd2lsbCBiZSB0aGlzIHR5cGUuIElmIHlvdSB3YW50IHRvIGV4cGxpY2l0bHlcbiAqIG5vdGUgdGhhdCBhIHRlbXBsYXRlIHJlc3VsdCBpcyBwb3RlbnRpYWxseSBjb21waWxlZCwgeW91IGNhbiByZWZlcmVuY2UgdGhpc1xuICogdHlwZSBhbmQgaXQgd2lsbCBjb250aW51ZSB0byBiZWhhdmUgdGhlIHNhbWUgdGhyb3VnaCB0aGUgbmV4dCBtYWpvciB2ZXJzaW9uXG4gKiBvZiBMaXQuIFRoaXMgY2FuIGJlIHVzZWZ1bCBmb3IgY29kZSB0aGF0IHdhbnRzIHRvIHByZXBhcmUgZm9yIHRoZSBuZXh0XG4gKiBtYWpvciB2ZXJzaW9uIG9mIExpdC5cbiAqL1xuZXhwb3J0IHR5cGUgTWF5YmVDb21waWxlZFRlbXBsYXRlUmVzdWx0PFQgZXh0ZW5kcyBSZXN1bHRUeXBlID0gUmVzdWx0VHlwZT4gPVxuICB8IFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUPlxuICB8IENvbXBpbGVkVGVtcGxhdGVSZXN1bHQ7XG5cbi8qKlxuICogVGhlIHJldHVybiB0eXBlIG9mIHRoZSB0ZW1wbGF0ZSB0YWcgZnVuY3Rpb25zLCB7QGxpbmtjb2RlIGh0bWx9IGFuZFxuICoge0BsaW5rY29kZSBzdmd9LlxuICpcbiAqIEEgYFRlbXBsYXRlUmVzdWx0YCBvYmplY3QgaG9sZHMgYWxsIHRoZSBpbmZvcm1hdGlvbiBhYm91dCBhIHRlbXBsYXRlXG4gKiBleHByZXNzaW9uIHJlcXVpcmVkIHRvIHJlbmRlciBpdDogdGhlIHRlbXBsYXRlIHN0cmluZ3MsIGV4cHJlc3Npb24gdmFsdWVzLFxuICogYW5kIHR5cGUgb2YgdGVtcGxhdGUgKGh0bWwgb3Igc3ZnKS5cbiAqXG4gKiBgVGVtcGxhdGVSZXN1bHRgIG9iamVjdHMgZG8gbm90IGNyZWF0ZSBhbnkgRE9NIG9uIHRoZWlyIG93bi4gVG8gY3JlYXRlIG9yXG4gKiB1cGRhdGUgRE9NIHlvdSBuZWVkIHRvIHJlbmRlciB0aGUgYFRlbXBsYXRlUmVzdWx0YC4gU2VlXG4gKiBbUmVuZGVyaW5nXShodHRwczovL2xpdC5kZXYvZG9jcy9jb21wb25lbnRzL3JlbmRlcmluZykgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogSW4gTGl0IDQsIHRoaXMgdHlwZSB3aWxsIGJlIGFuIGFsaWFzIG9mXG4gKiBNYXliZUNvbXBpbGVkVGVtcGxhdGVSZXN1bHQsIHNvIHRoYXQgY29kZSB3aWxsIGdldCB0eXBlIGVycm9ycyBpZiBpdCBhc3N1bWVzXG4gKiB0aGF0IExpdCB0ZW1wbGF0ZXMgYXJlIG5vdCBjb21waWxlZC4gV2hlbiBkZWxpYmVyYXRlbHkgd29ya2luZyB3aXRoIG9ubHlcbiAqIG9uZSwgdXNlIGVpdGhlciB7QGxpbmtjb2RlIENvbXBpbGVkVGVtcGxhdGVSZXN1bHR9IG9yXG4gKiB7QGxpbmtjb2RlIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdH0gZXhwbGljaXRseS5cbiAqL1xuZXhwb3J0IHR5cGUgVGVtcGxhdGVSZXN1bHQ8VCBleHRlbmRzIFJlc3VsdFR5cGUgPSBSZXN1bHRUeXBlPiA9XG4gIFVuY29tcGlsZWRUZW1wbGF0ZVJlc3VsdDxUPjtcblxuZXhwb3J0IHR5cGUgSFRNTFRlbXBsYXRlUmVzdWx0ID0gVGVtcGxhdGVSZXN1bHQ8dHlwZW9mIEhUTUxfUkVTVUxUPjtcblxuZXhwb3J0IHR5cGUgU1ZHVGVtcGxhdGVSZXN1bHQgPSBUZW1wbGF0ZVJlc3VsdDx0eXBlb2YgU1ZHX1JFU1VMVD47XG5cbmV4cG9ydCB0eXBlIE1hdGhNTFRlbXBsYXRlUmVzdWx0ID0gVGVtcGxhdGVSZXN1bHQ8dHlwZW9mIE1BVEhNTF9SRVNVTFQ+O1xuXG4vKipcbiAqIEEgVGVtcGxhdGVSZXN1bHQgdGhhdCBoYXMgYmVlbiBjb21waWxlZCBieSBAbGl0LWxhYnMvY29tcGlsZXIsIHNraXBwaW5nIHRoZVxuICogcHJlcGFyZSBzdGVwLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBpbGVkVGVtcGxhdGVSZXN1bHQge1xuICAvLyBUaGlzIGlzIGEgZmFjdG9yeSBpbiBvcmRlciB0byBtYWtlIHRlbXBsYXRlIGluaXRpYWxpemF0aW9uIGxhenlcbiAgLy8gYW5kIGFsbG93IFNoYWR5UmVuZGVyT3B0aW9ucyBzY29wZSB0byBiZSBwYXNzZWQgaW4uXG4gIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gIFsnXyRsaXRUeXBlJCddOiBDb21waWxlZFRlbXBsYXRlO1xuICB2YWx1ZXM6IHVua25vd25bXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21waWxlZFRlbXBsYXRlIGV4dGVuZHMgT21pdDxUZW1wbGF0ZSwgJ2VsJz4ge1xuICAvLyBlbCBpcyBvdmVycmlkZGVuIHRvIGJlIG9wdGlvbmFsLiBXZSBpbml0aWFsaXplIGl0IG9uIGZpcnN0IHJlbmRlclxuICBlbD86IEhUTUxUZW1wbGF0ZUVsZW1lbnQ7XG5cbiAgLy8gVGhlIHByZXBhcmVkIEhUTUwgc3RyaW5nIHRvIGNyZWF0ZSBhIHRlbXBsYXRlIGVsZW1lbnQgZnJvbS5cbiAgLy8gVGhlIHR5cGUgaXMgYSBUZW1wbGF0ZVN0cmluZ3NBcnJheSB0byBndWFyYW50ZWUgdGhhdCB0aGUgdmFsdWUgY2FtZSBmcm9tXG4gIC8vIHNvdXJjZSBjb2RlLCBwcmV2ZW50aW5nIGEgSlNPTiBpbmplY3Rpb24gYXR0YWNrLlxuICBoOiBUZW1wbGF0ZVN0cmluZ3NBcnJheTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSB0ZW1wbGF0ZSBsaXRlcmFsIHRhZyBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBUZW1wbGF0ZVJlc3VsdCB3aXRoXG4gKiB0aGUgZ2l2ZW4gcmVzdWx0IHR5cGUuXG4gKi9cbmNvbnN0IHRhZyA9XG4gIDxUIGV4dGVuZHMgUmVzdWx0VHlwZT4odHlwZTogVCkgPT5cbiAgKHN0cmluZ3M6IFRlbXBsYXRlU3RyaW5nc0FycmF5LCAuLi52YWx1ZXM6IHVua25vd25bXSk6IFRlbXBsYXRlUmVzdWx0PFQ+ID0+IHtcbiAgICAvLyBXYXJuIGFnYWluc3QgdGVtcGxhdGVzIG9jdGFsIGVzY2FwZSBzZXF1ZW5jZXNcbiAgICAvLyBXZSBkbyB0aGlzIGhlcmUgcmF0aGVyIHRoYW4gaW4gcmVuZGVyIHNvIHRoYXQgdGhlIHdhcm5pbmcgaXMgY2xvc2VyIHRvIHRoZVxuICAgIC8vIHRlbXBsYXRlIGRlZmluaXRpb24uXG4gICAgaWYgKERFVl9NT0RFICYmIHN0cmluZ3Muc29tZSgocykgPT4gcyA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAnU29tZSB0ZW1wbGF0ZSBzdHJpbmdzIGFyZSB1bmRlZmluZWQuXFxuJyArXG4gICAgICAgICAgJ1RoaXMgaXMgcHJvYmFibHkgY2F1c2VkIGJ5IGlsbGVnYWwgb2N0YWwgZXNjYXBlIHNlcXVlbmNlcy4nXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoREVWX01PREUpIHtcbiAgICAgIC8vIEltcG9ydCBzdGF0aWMtaHRtbC5qcyByZXN1bHRzIGluIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSB3aGljaCBnMyBkb2Vzbid0XG4gICAgICAvLyBoYW5kbGUuIEluc3RlYWQgd2Uga25vdyB0aGF0IHN0YXRpYyB2YWx1ZXMgbXVzdCBoYXZlIHRoZSBmaWVsZFxuICAgICAgLy8gYF8kbGl0U3RhdGljJGAuXG4gICAgICBpZiAoXG4gICAgICAgIHZhbHVlcy5zb21lKCh2YWwpID0+ICh2YWwgYXMge18kbGl0U3RhdGljJDogdW5rbm93bn0pPy5bJ18kbGl0U3RhdGljJCddKVxuICAgICAgKSB7XG4gICAgICAgIGlzc3VlV2FybmluZyhcbiAgICAgICAgICAnJyxcbiAgICAgICAgICBgU3RhdGljIHZhbHVlcyAnbGl0ZXJhbCcgb3IgJ3Vuc2FmZVN0YXRpYycgY2Fubm90IGJlIHVzZWQgYXMgdmFsdWVzIHRvIG5vbi1zdGF0aWMgdGVtcGxhdGVzLlxcbmAgK1xuICAgICAgICAgICAgYFBsZWFzZSB1c2UgdGhlIHN0YXRpYyAnaHRtbCcgdGFnIGZ1bmN0aW9uLiBTZWUgaHR0cHM6Ly9saXQuZGV2L2RvY3MvdGVtcGxhdGVzL2V4cHJlc3Npb25zLyNzdGF0aWMtZXhwcmVzc2lvbnNgXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgICAgWydfJGxpdFR5cGUkJ106IHR5cGUsXG4gICAgICBzdHJpbmdzLFxuICAgICAgdmFsdWVzLFxuICAgIH07XG4gIH07XG5cbi8qKlxuICogSW50ZXJwcmV0cyBhIHRlbXBsYXRlIGxpdGVyYWwgYXMgYW4gSFRNTCB0ZW1wbGF0ZSB0aGF0IGNhbiBlZmZpY2llbnRseVxuICogcmVuZGVyIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IGhlYWRlciA9ICh0aXRsZTogc3RyaW5nKSA9PiBodG1sYDxoMT4ke3RpdGxlfTwvaDE+YDtcbiAqIGBgYFxuICpcbiAqIFRoZSBgaHRtbGAgdGFnIHJldHVybnMgYSBkZXNjcmlwdGlvbiBvZiB0aGUgRE9NIHRvIHJlbmRlciBhcyBhIHZhbHVlLiBJdCBpc1xuICogbGF6eSwgbWVhbmluZyBubyB3b3JrIGlzIGRvbmUgdW50aWwgdGhlIHRlbXBsYXRlIGlzIHJlbmRlcmVkLiBXaGVuIHJlbmRlcmluZyxcbiAqIGlmIGEgdGVtcGxhdGUgY29tZXMgZnJvbSB0aGUgc2FtZSBleHByZXNzaW9uIGFzIGEgcHJldmlvdXNseSByZW5kZXJlZCByZXN1bHQsXG4gKiBpdCdzIGVmZmljaWVudGx5IHVwZGF0ZWQgaW5zdGVhZCBvZiByZXBsYWNlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGh0bWwgPSB0YWcoSFRNTF9SRVNVTFQpO1xuXG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIGFuIFNWRyBmcmFnbWVudCB0aGF0IGNhbiBlZmZpY2llbnRseSByZW5kZXJcbiAqIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IHJlY3QgPSBzdmdgPHJlY3Qgd2lkdGg9XCIxMFwiIGhlaWdodD1cIjEwXCI+PC9yZWN0PmA7XG4gKlxuICogY29uc3QgbXlJbWFnZSA9IGh0bWxgXG4gKiAgIDxzdmcgdmlld0JveD1cIjAgMCAxMCAxMFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAqICAgICAke3JlY3R9XG4gKiAgIDwvc3ZnPmA7XG4gKiBgYGBcbiAqXG4gKiBUaGUgYHN2Z2AgKnRhZyBmdW5jdGlvbiogc2hvdWxkIG9ubHkgYmUgdXNlZCBmb3IgU1ZHIGZyYWdtZW50cywgb3IgZWxlbWVudHNcbiAqIHRoYXQgd291bGQgYmUgY29udGFpbmVkICoqaW5zaWRlKiogYW4gYDxzdmc+YCBIVE1MIGVsZW1lbnQuIEEgY29tbW9uIGVycm9yIGlzXG4gKiBwbGFjaW5nIGFuIGA8c3ZnPmAgKmVsZW1lbnQqIGluIGEgdGVtcGxhdGUgdGFnZ2VkIHdpdGggdGhlIGBzdmdgIHRhZ1xuICogZnVuY3Rpb24uIFRoZSBgPHN2Zz5gIGVsZW1lbnQgaXMgYW4gSFRNTCBlbGVtZW50IGFuZCBzaG91bGQgYmUgdXNlZCB3aXRoaW4gYVxuICogdGVtcGxhdGUgdGFnZ2VkIHdpdGggdGhlIHtAbGlua2NvZGUgaHRtbH0gdGFnIGZ1bmN0aW9uLlxuICpcbiAqIEluIExpdEVsZW1lbnQgdXNhZ2UsIGl0J3MgaW52YWxpZCB0byByZXR1cm4gYW4gU1ZHIGZyYWdtZW50IGZyb20gdGhlXG4gKiBgcmVuZGVyKClgIG1ldGhvZCwgYXMgdGhlIFNWRyBmcmFnbWVudCB3aWxsIGJlIGNvbnRhaW5lZCB3aXRoaW4gdGhlIGVsZW1lbnQnc1xuICogc2hhZG93IHJvb3QgYW5kIHRodXMgbm90IGJlIHByb3Blcmx5IGNvbnRhaW5lZCB3aXRoaW4gYW4gYDxzdmc+YCBIVE1MXG4gKiBlbGVtZW50LlxuICovXG5leHBvcnQgY29uc3Qgc3ZnID0gdGFnKFNWR19SRVNVTFQpO1xuXG4vKipcbiAqIEludGVycHJldHMgYSB0ZW1wbGF0ZSBsaXRlcmFsIGFzIE1hdGhNTCBmcmFnbWVudCB0aGF0IGNhbiBlZmZpY2llbnRseSByZW5kZXJcbiAqIHRvIGFuZCB1cGRhdGUgYSBjb250YWluZXIuXG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IG51bSA9IG1hdGhtbGA8bW4+MTwvbW4+YDtcbiAqXG4gKiBjb25zdCBlcSA9IGh0bWxgXG4gKiAgIDxtYXRoPlxuICogICAgICR7bnVtfVxuICogICA8L21hdGg+YDtcbiAqIGBgYFxuICpcbiAqIFRoZSBgbWF0aG1sYCAqdGFnIGZ1bmN0aW9uKiBzaG91bGQgb25seSBiZSB1c2VkIGZvciBNYXRoTUwgZnJhZ21lbnRzLCBvclxuICogZWxlbWVudHMgdGhhdCB3b3VsZCBiZSBjb250YWluZWQgKippbnNpZGUqKiBhIGA8bWF0aD5gIEhUTUwgZWxlbWVudC4gQSBjb21tb25cbiAqIGVycm9yIGlzIHBsYWNpbmcgYSBgPG1hdGg+YCAqZWxlbWVudCogaW4gYSB0ZW1wbGF0ZSB0YWdnZWQgd2l0aCB0aGUgYG1hdGhtbGBcbiAqIHRhZyBmdW5jdGlvbi4gVGhlIGA8bWF0aD5gIGVsZW1lbnQgaXMgYW4gSFRNTCBlbGVtZW50IGFuZCBzaG91bGQgYmUgdXNlZFxuICogd2l0aGluIGEgdGVtcGxhdGUgdGFnZ2VkIHdpdGggdGhlIHtAbGlua2NvZGUgaHRtbH0gdGFnIGZ1bmN0aW9uLlxuICpcbiAqIEluIExpdEVsZW1lbnQgdXNhZ2UsIGl0J3MgaW52YWxpZCB0byByZXR1cm4gYW4gTWF0aE1MIGZyYWdtZW50IGZyb20gdGhlXG4gKiBgcmVuZGVyKClgIG1ldGhvZCwgYXMgdGhlIE1hdGhNTCBmcmFnbWVudCB3aWxsIGJlIGNvbnRhaW5lZCB3aXRoaW4gdGhlXG4gKiBlbGVtZW50J3Mgc2hhZG93IHJvb3QgYW5kIHRodXMgbm90IGJlIHByb3Blcmx5IGNvbnRhaW5lZCB3aXRoaW4gYSBgPG1hdGg+YFxuICogSFRNTCBlbGVtZW50LlxuICovXG5leHBvcnQgY29uc3QgbWF0aG1sID0gdGFnKE1BVEhNTF9SRVNVTFQpO1xuXG4vKipcbiAqIEEgc2VudGluZWwgdmFsdWUgdGhhdCBzaWduYWxzIHRoYXQgYSB2YWx1ZSB3YXMgaGFuZGxlZCBieSBhIGRpcmVjdGl2ZSBhbmRcbiAqIHNob3VsZCBub3QgYmUgd3JpdHRlbiB0byB0aGUgRE9NLlxuICovXG5leHBvcnQgY29uc3Qgbm9DaGFuZ2UgPSBTeW1ib2wuZm9yKCdsaXQtbm9DaGFuZ2UnKTtcblxuLyoqXG4gKiBBIHNlbnRpbmVsIHZhbHVlIHRoYXQgc2lnbmFscyBhIENoaWxkUGFydCB0byBmdWxseSBjbGVhciBpdHMgY29udGVudC5cbiAqXG4gKiBgYGB0c1xuICogY29uc3QgYnV0dG9uID0gaHRtbGAke1xuICogIHVzZXIuaXNBZG1pblxuICogICAgPyBodG1sYDxidXR0b24+REVMRVRFPC9idXR0b24+YFxuICogICAgOiBub3RoaW5nXG4gKiB9YDtcbiAqIGBgYFxuICpcbiAqIFByZWZlciB1c2luZyBgbm90aGluZ2Agb3ZlciBvdGhlciBmYWxzeSB2YWx1ZXMgYXMgaXQgcHJvdmlkZXMgYSBjb25zaXN0ZW50XG4gKiBiZWhhdmlvciBiZXR3ZWVuIHZhcmlvdXMgZXhwcmVzc2lvbiBiaW5kaW5nIGNvbnRleHRzLlxuICpcbiAqIEluIGNoaWxkIGV4cHJlc3Npb25zLCBgdW5kZWZpbmVkYCwgYG51bGxgLCBgJydgLCBhbmQgYG5vdGhpbmdgIGFsbCBiZWhhdmUgdGhlXG4gKiBzYW1lIGFuZCByZW5kZXIgbm8gbm9kZXMuIEluIGF0dHJpYnV0ZSBleHByZXNzaW9ucywgYG5vdGhpbmdgIF9yZW1vdmVzXyB0aGVcbiAqIGF0dHJpYnV0ZSwgd2hpbGUgYHVuZGVmaW5lZGAgYW5kIGBudWxsYCB3aWxsIHJlbmRlciBhbiBlbXB0eSBzdHJpbmcuIEluXG4gKiBwcm9wZXJ0eSBleHByZXNzaW9ucyBgbm90aGluZ2AgYmVjb21lcyBgdW5kZWZpbmVkYC5cbiAqL1xuZXhwb3J0IGNvbnN0IG5vdGhpbmcgPSBTeW1ib2wuZm9yKCdsaXQtbm90aGluZycpO1xuXG4vKipcbiAqIFRoZSBjYWNoZSBvZiBwcmVwYXJlZCB0ZW1wbGF0ZXMsIGtleWVkIGJ5IHRoZSB0YWdnZWQgVGVtcGxhdGVTdHJpbmdzQXJyYXlcbiAqIGFuZCBfbm90XyBhY2NvdW50aW5nIGZvciB0aGUgc3BlY2lmaWMgdGVtcGxhdGUgdGFnIHVzZWQuIFRoaXMgbWVhbnMgdGhhdFxuICogdGVtcGxhdGUgdGFncyBjYW5ub3QgYmUgZHluYW1pYyAtIHRoZXkgbXVzdCBzdGF0aWNhbGx5IGJlIG9uZSBvZiBodG1sLCBzdmcsXG4gKiBvciBhdHRyLiBUaGlzIHJlc3RyaWN0aW9uIHNpbXBsaWZpZXMgdGhlIGNhY2hlIGxvb2t1cCwgd2hpY2ggaXMgb24gdGhlIGhvdFxuICogcGF0aCBmb3IgcmVuZGVyaW5nLlxuICovXG5jb25zdCB0ZW1wbGF0ZUNhY2hlID0gbmV3IFdlYWtNYXA8VGVtcGxhdGVTdHJpbmdzQXJyYXksIFRlbXBsYXRlPigpO1xuXG4vKipcbiAqIE9iamVjdCBzcGVjaWZ5aW5nIG9wdGlvbnMgZm9yIGNvbnRyb2xsaW5nIGxpdC1odG1sIHJlbmRlcmluZy4gTm90ZSB0aGF0XG4gKiB3aGlsZSBgcmVuZGVyYCBtYXkgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIG9uIHRoZSBzYW1lIGBjb250YWluZXJgIChhbmRcbiAqIGByZW5kZXJCZWZvcmVgIHJlZmVyZW5jZSBub2RlKSB0byBlZmZpY2llbnRseSB1cGRhdGUgdGhlIHJlbmRlcmVkIGNvbnRlbnQsXG4gKiBvbmx5IHRoZSBvcHRpb25zIHBhc3NlZCBpbiBkdXJpbmcgdGhlIGZpcnN0IHJlbmRlciBhcmUgcmVzcGVjdGVkIGR1cmluZ1xuICogdGhlIGxpZmV0aW1lIG9mIHJlbmRlcnMgdG8gdGhhdCB1bmlxdWUgYGNvbnRhaW5lcmAgKyBgcmVuZGVyQmVmb3JlYFxuICogY29tYmluYXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBBbiBvYmplY3QgdG8gdXNlIGFzIHRoZSBgdGhpc2AgdmFsdWUgZm9yIGV2ZW50IGxpc3RlbmVycy4gSXQncyBvZnRlblxuICAgKiB1c2VmdWwgdG8gc2V0IHRoaXMgdG8gdGhlIGhvc3QgY29tcG9uZW50IHJlbmRlcmluZyBhIHRlbXBsYXRlLlxuICAgKi9cbiAgaG9zdD86IG9iamVjdDtcbiAgLyoqXG4gICAqIEEgRE9NIG5vZGUgYmVmb3JlIHdoaWNoIHRvIHJlbmRlciBjb250ZW50IGluIHRoZSBjb250YWluZXIuXG4gICAqL1xuICByZW5kZXJCZWZvcmU/OiBDaGlsZE5vZGUgfCBudWxsO1xuICAvKipcbiAgICogTm9kZSB1c2VkIGZvciBjbG9uaW5nIHRoZSB0ZW1wbGF0ZSAoYGltcG9ydE5vZGVgIHdpbGwgYmUgY2FsbGVkIG9uIHRoaXNcbiAgICogbm9kZSkuIFRoaXMgY29udHJvbHMgdGhlIGBvd25lckRvY3VtZW50YCBvZiB0aGUgcmVuZGVyZWQgRE9NLCBhbG9uZyB3aXRoXG4gICAqIGFueSBpbmhlcml0ZWQgY29udGV4dC4gRGVmYXVsdHMgdG8gdGhlIGdsb2JhbCBgZG9jdW1lbnRgLlxuICAgKi9cbiAgY3JlYXRpb25TY29wZT86IHtpbXBvcnROb2RlKG5vZGU6IE5vZGUsIGRlZXA/OiBib29sZWFuKTogTm9kZX07XG4gIC8qKlxuICAgKiBUaGUgaW5pdGlhbCBjb25uZWN0ZWQgc3RhdGUgZm9yIHRoZSB0b3AtbGV2ZWwgcGFydCBiZWluZyByZW5kZXJlZC4gSWYgbm9cbiAgICogYGlzQ29ubmVjdGVkYCBvcHRpb24gaXMgc2V0LCBgQXN5bmNEaXJlY3RpdmVgcyB3aWxsIGJlIGNvbm5lY3RlZCBieVxuICAgKiBkZWZhdWx0LiBTZXQgdG8gYGZhbHNlYCBpZiB0aGUgaW5pdGlhbCByZW5kZXIgb2NjdXJzIGluIGEgZGlzY29ubmVjdGVkIHRyZWVcbiAgICogYW5kIGBBc3luY0RpcmVjdGl2ZWBzIHNob3VsZCBzZWUgYGlzQ29ubmVjdGVkID09PSBmYWxzZWAgZm9yIHRoZWlyIGluaXRpYWxcbiAgICogcmVuZGVyLiBUaGUgYHBhcnQuc2V0Q29ubmVjdGVkKClgIG1ldGhvZCBtdXN0IGJlIHVzZWQgc3Vic2VxdWVudCB0byBpbml0aWFsXG4gICAqIHJlbmRlciB0byBjaGFuZ2UgdGhlIGNvbm5lY3RlZCBzdGF0ZSBvZiB0aGUgcGFydC5cbiAgICovXG4gIGlzQ29ubmVjdGVkPzogYm9vbGVhbjtcbn1cblxuY29uc3Qgd2Fsa2VyID0gZC5jcmVhdGVUcmVlV2Fsa2VyKFxuICBkLFxuICAxMjkgLyogTm9kZUZpbHRlci5TSE9XX3tFTEVNRU5UfENPTU1FTlR9ICovXG4pO1xuXG5sZXQgc2FuaXRpemVyRmFjdG9yeUludGVybmFsOiBTYW5pdGl6ZXJGYWN0b3J5ID0gbm9vcFNhbml0aXplcjtcblxuLy9cbi8vIENsYXNzZXMgb25seSBiZWxvdyBoZXJlLCBjb25zdCB2YXJpYWJsZSBkZWNsYXJhdGlvbnMgb25seSBhYm92ZSBoZXJlLi4uXG4vL1xuLy8gS2VlcGluZyB2YXJpYWJsZSBkZWNsYXJhdGlvbnMgYW5kIGNsYXNzZXMgdG9nZXRoZXIgaW1wcm92ZXMgbWluaWZpY2F0aW9uLlxuLy8gSW50ZXJmYWNlcyBhbmQgdHlwZSBhbGlhc2VzIGNhbiBiZSBpbnRlcmxlYXZlZCBmcmVlbHkuXG4vL1xuXG4vLyBUeXBlIGZvciBjbGFzc2VzIHRoYXQgaGF2ZSBhIGBfZGlyZWN0aXZlYCBvciBgX2RpcmVjdGl2ZXNbXWAgZmllbGQsIHVzZWQgYnlcbi8vIGByZXNvbHZlRGlyZWN0aXZlYFxuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVQYXJlbnQge1xuICBfJHBhcmVudD86IERpcmVjdGl2ZVBhcmVudDtcbiAgXyRpc0Nvbm5lY3RlZDogYm9vbGVhbjtcbiAgX19kaXJlY3RpdmU/OiBEaXJlY3RpdmU7XG4gIF9fZGlyZWN0aXZlcz86IEFycmF5PERpcmVjdGl2ZSB8IHVuZGVmaW5lZD47XG59XG5cbmZ1bmN0aW9uIHRydXN0RnJvbVRlbXBsYXRlU3RyaW5nKFxuICB0c2E6IFRlbXBsYXRlU3RyaW5nc0FycmF5LFxuICBzdHJpbmdGcm9tVFNBOiBzdHJpbmdcbik6IFRydXN0ZWRIVE1MIHtcbiAgLy8gQSBzZWN1cml0eSBjaGVjayB0byBwcmV2ZW50IHNwb29maW5nIG9mIExpdCB0ZW1wbGF0ZSByZXN1bHRzLlxuICAvLyBJbiB0aGUgZnV0dXJlLCB3ZSBtYXkgYmUgYWJsZSB0byByZXBsYWNlIHRoaXMgd2l0aCBBcnJheS5pc1RlbXBsYXRlT2JqZWN0LFxuICAvLyB0aG91Z2ggd2UgbWlnaHQgbmVlZCB0byBtYWtlIHRoYXQgY2hlY2sgaW5zaWRlIG9mIHRoZSBodG1sIGFuZCBzdmdcbiAgLy8gZnVuY3Rpb25zLCBiZWNhdXNlIHByZWNvbXBpbGVkIHRlbXBsYXRlcyBkb24ndCBjb21lIGluIGFzXG4gIC8vIFRlbXBsYXRlU3RyaW5nQXJyYXkgb2JqZWN0cy5cbiAgaWYgKCFpc0FycmF5KHRzYSkgfHwgIXRzYS5oYXNPd25Qcm9wZXJ0eSgncmF3JykpIHtcbiAgICBsZXQgbWVzc2FnZSA9ICdpbnZhbGlkIHRlbXBsYXRlIHN0cmluZ3MgYXJyYXknO1xuICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgbWVzc2FnZSA9IGBcbiAgICAgICAgICBJbnRlcm5hbCBFcnJvcjogZXhwZWN0ZWQgdGVtcGxhdGUgc3RyaW5ncyB0byBiZSBhbiBhcnJheVxuICAgICAgICAgIHdpdGggYSAncmF3JyBmaWVsZC4gRmFraW5nIGEgdGVtcGxhdGUgc3RyaW5ncyBhcnJheSBieVxuICAgICAgICAgIGNhbGxpbmcgaHRtbCBvciBzdmcgbGlrZSBhbiBvcmRpbmFyeSBmdW5jdGlvbiBpcyBlZmZlY3RpdmVseVxuICAgICAgICAgIHRoZSBzYW1lIGFzIGNhbGxpbmcgdW5zYWZlSHRtbCBhbmQgY2FuIGxlYWQgdG8gbWFqb3Igc2VjdXJpdHlcbiAgICAgICAgICBpc3N1ZXMsIGUuZy4gb3BlbmluZyB5b3VyIGNvZGUgdXAgdG8gWFNTIGF0dGFja3MuXG4gICAgICAgICAgSWYgeW91J3JlIHVzaW5nIHRoZSBodG1sIG9yIHN2ZyB0YWdnZWQgdGVtcGxhdGUgZnVuY3Rpb25zIG5vcm1hbGx5XG4gICAgICAgICAgYW5kIHN0aWxsIHNlZWluZyB0aGlzIGVycm9yLCBwbGVhc2UgZmlsZSBhIGJ1ZyBhdFxuICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9saXQvbGl0L2lzc3Vlcy9uZXc/dGVtcGxhdGU9YnVnX3JlcG9ydC5tZFxuICAgICAgICAgIGFuZCBpbmNsdWRlIGluZm9ybWF0aW9uIGFib3V0IHlvdXIgYnVpbGQgdG9vbGluZywgaWYgYW55LlxuICAgICAgICBgXG4gICAgICAgIC50cmltKClcbiAgICAgICAgLnJlcGxhY2UoL1xcbiAqL2csICdcXG4nKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICB9XG4gIHJldHVybiBwb2xpY3kgIT09IHVuZGVmaW5lZFxuICAgID8gcG9saWN5LmNyZWF0ZUhUTUwoc3RyaW5nRnJvbVRTQSlcbiAgICA6IChzdHJpbmdGcm9tVFNBIGFzIHVua25vd24gYXMgVHJ1c3RlZEhUTUwpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gSFRNTCBzdHJpbmcgZm9yIHRoZSBnaXZlbiBUZW1wbGF0ZVN0cmluZ3NBcnJheSBhbmQgcmVzdWx0IHR5cGVcbiAqIChIVE1MIG9yIFNWRyksIGFsb25nIHdpdGggdGhlIGNhc2Utc2Vuc2l0aXZlIGJvdW5kIGF0dHJpYnV0ZSBuYW1lcyBpblxuICogdGVtcGxhdGUgb3JkZXIuIFRoZSBIVE1MIGNvbnRhaW5zIGNvbW1lbnQgbWFya2VycyBkZW5vdGluZyB0aGUgYENoaWxkUGFydGBzXG4gKiBhbmQgc3VmZml4ZXMgb24gYm91bmQgYXR0cmlidXRlcyBkZW5vdGluZyB0aGUgYEF0dHJpYnV0ZVBhcnRzYC5cbiAqXG4gKiBAcGFyYW0gc3RyaW5ncyB0ZW1wbGF0ZSBzdHJpbmdzIGFycmF5XG4gKiBAcGFyYW0gdHlwZSBIVE1MIG9yIFNWR1xuICogQHJldHVybiBBcnJheSBjb250YWluaW5nIGBbaHRtbCwgYXR0ck5hbWVzXWAgKGFycmF5IHJldHVybmVkIGZvciB0ZXJzZW5lc3MsXG4gKiAgICAgdG8gYXZvaWQgb2JqZWN0IGZpZWxkcyBzaW5jZSB0aGlzIGNvZGUgaXMgc2hhcmVkIHdpdGggbm9uLW1pbmlmaWVkIFNTUlxuICogICAgIGNvZGUpXG4gKi9cbmNvbnN0IGdldFRlbXBsYXRlSHRtbCA9IChcbiAgc3RyaW5nczogVGVtcGxhdGVTdHJpbmdzQXJyYXksXG4gIHR5cGU6IFJlc3VsdFR5cGVcbik6IFtUcnVzdGVkSFRNTCwgQXJyYXk8c3RyaW5nPl0gPT4ge1xuICAvLyBJbnNlcnQgbWFrZXJzIGludG8gdGhlIHRlbXBsYXRlIEhUTUwgdG8gcmVwcmVzZW50IHRoZSBwb3NpdGlvbiBvZlxuICAvLyBiaW5kaW5ncy4gVGhlIGZvbGxvd2luZyBjb2RlIHNjYW5zIHRoZSB0ZW1wbGF0ZSBzdHJpbmdzIHRvIGRldGVybWluZSB0aGVcbiAgLy8gc3ludGFjdGljIHBvc2l0aW9uIG9mIHRoZSBiaW5kaW5ncy4gVGhleSBjYW4gYmUgaW4gdGV4dCBwb3NpdGlvbiwgd2hlcmVcbiAgLy8gd2UgaW5zZXJ0IGFuIEhUTUwgY29tbWVudCwgYXR0cmlidXRlIHZhbHVlIHBvc2l0aW9uLCB3aGVyZSB3ZSBpbnNlcnQgYVxuICAvLyBzZW50aW5lbCBzdHJpbmcgYW5kIHJlLXdyaXRlIHRoZSBhdHRyaWJ1dGUgbmFtZSwgb3IgaW5zaWRlIGEgdGFnIHdoZXJlXG4gIC8vIHdlIGluc2VydCB0aGUgc2VudGluZWwgc3RyaW5nLlxuICBjb25zdCBsID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAvLyBTdG9yZXMgdGhlIGNhc2Utc2Vuc2l0aXZlIGJvdW5kIGF0dHJpYnV0ZSBuYW1lcyBpbiB0aGUgb3JkZXIgb2YgdGhlaXJcbiAgLy8gcGFydHMuIEVsZW1lbnRQYXJ0cyBhcmUgYWxzbyByZWZsZWN0ZWQgaW4gdGhpcyBhcnJheSBhcyB1bmRlZmluZWRcbiAgLy8gcmF0aGVyIHRoYW4gYSBzdHJpbmcsIHRvIGRpc2FtYmlndWF0ZSBmcm9tIGF0dHJpYnV0ZSBiaW5kaW5ncy5cbiAgY29uc3QgYXR0ck5hbWVzOiBBcnJheTxzdHJpbmc+ID0gW107XG4gIGxldCBodG1sID1cbiAgICB0eXBlID09PSBTVkdfUkVTVUxUID8gJzxzdmc+JyA6IHR5cGUgPT09IE1BVEhNTF9SRVNVTFQgPyAnPG1hdGg+JyA6ICcnO1xuXG4gIC8vIFdoZW4gd2UncmUgaW5zaWRlIGEgcmF3IHRleHQgdGFnIChub3QgaXQncyB0ZXh0IGNvbnRlbnQpLCB0aGUgcmVnZXhcbiAgLy8gd2lsbCBzdGlsbCBiZSB0YWdSZWdleCBzbyB3ZSBjYW4gZmluZCBhdHRyaWJ1dGVzLCBidXQgd2lsbCBzd2l0Y2ggdG9cbiAgLy8gdGhpcyByZWdleCB3aGVuIHRoZSB0YWcgZW5kcy5cbiAgbGV0IHJhd1RleHRFbmRSZWdleDogUmVnRXhwIHwgdW5kZWZpbmVkO1xuXG4gIC8vIFRoZSBjdXJyZW50IHBhcnNpbmcgc3RhdGUsIHJlcHJlc2VudGVkIGFzIGEgcmVmZXJlbmNlIHRvIG9uZSBvZiB0aGVcbiAgLy8gcmVnZXhlc1xuICBsZXQgcmVnZXggPSB0ZXh0RW5kUmVnZXg7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICBjb25zdCBzID0gc3RyaW5nc1tpXTtcbiAgICAvLyBUaGUgaW5kZXggb2YgdGhlIGVuZCBvZiB0aGUgbGFzdCBhdHRyaWJ1dGUgbmFtZS4gV2hlbiB0aGlzIGlzXG4gICAgLy8gcG9zaXRpdmUgYXQgZW5kIG9mIGEgc3RyaW5nLCBpdCBtZWFucyB3ZSdyZSBpbiBhbiBhdHRyaWJ1dGUgdmFsdWVcbiAgICAvLyBwb3NpdGlvbiBhbmQgbmVlZCB0byByZXdyaXRlIHRoZSBhdHRyaWJ1dGUgbmFtZS5cbiAgICAvLyBXZSBhbHNvIHVzZSBhIHNwZWNpYWwgdmFsdWUgb2YgLTIgdG8gaW5kaWNhdGUgdGhhdCB3ZSBlbmNvdW50ZXJlZFxuICAgIC8vIHRoZSBlbmQgb2YgYSBzdHJpbmcgaW4gYXR0cmlidXRlIG5hbWUgcG9zaXRpb24uXG4gICAgbGV0IGF0dHJOYW1lRW5kSW5kZXggPSAtMTtcbiAgICBsZXQgYXR0ck5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBsZXQgbGFzdEluZGV4ID0gMDtcbiAgICBsZXQgbWF0Y2ghOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuXG4gICAgLy8gVGhlIGNvbmRpdGlvbnMgaW4gdGhpcyBsb29wIGhhbmRsZSB0aGUgY3VycmVudCBwYXJzZSBzdGF0ZSwgYW5kIHRoZVxuICAgIC8vIGFzc2lnbm1lbnRzIHRvIHRoZSBgcmVnZXhgIHZhcmlhYmxlIGFyZSB0aGUgc3RhdGUgdHJhbnNpdGlvbnMuXG4gICAgd2hpbGUgKGxhc3RJbmRleCA8IHMubGVuZ3RoKSB7XG4gICAgICAvLyBNYWtlIHN1cmUgd2Ugc3RhcnQgc2VhcmNoaW5nIGZyb20gd2hlcmUgd2UgcHJldmlvdXNseSBsZWZ0IG9mZlxuICAgICAgcmVnZXgubGFzdEluZGV4ID0gbGFzdEluZGV4O1xuICAgICAgbWF0Y2ggPSByZWdleC5leGVjKHMpO1xuICAgICAgaWYgKG1hdGNoID09PSBudWxsKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgbGFzdEluZGV4ID0gcmVnZXgubGFzdEluZGV4O1xuICAgICAgaWYgKHJlZ2V4ID09PSB0ZXh0RW5kUmVnZXgpIHtcbiAgICAgICAgaWYgKG1hdGNoW0NPTU1FTlRfU1RBUlRdID09PSAnIS0tJykge1xuICAgICAgICAgIHJlZ2V4ID0gY29tbWVudEVuZFJlZ2V4O1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoW0NPTU1FTlRfU1RBUlRdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBXZSBzdGFydGVkIGEgd2VpcmQgY29tbWVudCwgbGlrZSA8L3tcbiAgICAgICAgICByZWdleCA9IGNvbW1lbnQyRW5kUmVnZXg7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbVEFHX05BTUVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAocmF3VGV4dEVsZW1lbnQudGVzdChtYXRjaFtUQUdfTkFNRV0pKSB7XG4gICAgICAgICAgICAvLyBSZWNvcmQgaWYgd2UgZW5jb3VudGVyIGEgcmF3LXRleHQgZWxlbWVudC4gV2UnbGwgc3dpdGNoIHRvXG4gICAgICAgICAgICAvLyB0aGlzIHJlZ2V4IGF0IHRoZSBlbmQgb2YgdGhlIHRhZy5cbiAgICAgICAgICAgIHJhd1RleHRFbmRSZWdleCA9IG5ldyBSZWdFeHAoYDwvJHttYXRjaFtUQUdfTkFNRV19YCwgJ2cnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVnZXggPSB0YWdFbmRSZWdleDtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFtEWU5BTUlDX1RBR19OQU1FXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICdCaW5kaW5ncyBpbiB0YWcgbmFtZXMgYXJlIG5vdCBzdXBwb3J0ZWQuIFBsZWFzZSB1c2Ugc3RhdGljIHRlbXBsYXRlcyBpbnN0ZWFkLiAnICtcbiAgICAgICAgICAgICAgICAnU2VlIGh0dHBzOi8vbGl0LmRldi9kb2NzL3RlbXBsYXRlcy9leHByZXNzaW9ucy8jc3RhdGljLWV4cHJlc3Npb25zJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVnZXggPSB0YWdFbmRSZWdleDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChyZWdleCA9PT0gdGFnRW5kUmVnZXgpIHtcbiAgICAgICAgaWYgKG1hdGNoW0VOVElSRV9NQVRDSF0gPT09ICc+Jykge1xuICAgICAgICAgIC8vIEVuZCBvZiBhIHRhZy4gSWYgd2UgaGFkIHN0YXJ0ZWQgYSByYXctdGV4dCBlbGVtZW50LCB1c2UgdGhhdFxuICAgICAgICAgIC8vIHJlZ2V4XG4gICAgICAgICAgcmVnZXggPSByYXdUZXh0RW5kUmVnZXggPz8gdGV4dEVuZFJlZ2V4O1xuICAgICAgICAgIC8vIFdlIG1heSBiZSBlbmRpbmcgYW4gdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlLCBzbyBtYWtlIHN1cmUgd2VcbiAgICAgICAgICAvLyBjbGVhciBhbnkgcGVuZGluZyBhdHRyTmFtZUVuZEluZGV4XG4gICAgICAgICAgYXR0ck5hbWVFbmRJbmRleCA9IC0xO1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoW0FUVFJJQlVURV9OQU1FXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gQXR0cmlidXRlIG5hbWUgcG9zaXRpb25cbiAgICAgICAgICBhdHRyTmFtZUVuZEluZGV4ID0gLTI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXR0ck5hbWVFbmRJbmRleCA9IHJlZ2V4Lmxhc3RJbmRleCAtIG1hdGNoW1NQQUNFU19BTkRfRVFVQUxTXS5sZW5ndGg7XG4gICAgICAgICAgYXR0ck5hbWUgPSBtYXRjaFtBVFRSSUJVVEVfTkFNRV07XG4gICAgICAgICAgcmVnZXggPVxuICAgICAgICAgICAgbWF0Y2hbUVVPVEVfQ0hBUl0gPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICA/IHRhZ0VuZFJlZ2V4XG4gICAgICAgICAgICAgIDogbWF0Y2hbUVVPVEVfQ0hBUl0gPT09ICdcIidcbiAgICAgICAgICAgICAgICA/IGRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4XG4gICAgICAgICAgICAgICAgOiBzaW5nbGVRdW90ZUF0dHJFbmRSZWdleDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgcmVnZXggPT09IGRvdWJsZVF1b3RlQXR0ckVuZFJlZ2V4IHx8XG4gICAgICAgIHJlZ2V4ID09PSBzaW5nbGVRdW90ZUF0dHJFbmRSZWdleFxuICAgICAgKSB7XG4gICAgICAgIHJlZ2V4ID0gdGFnRW5kUmVnZXg7XG4gICAgICB9IGVsc2UgaWYgKHJlZ2V4ID09PSBjb21tZW50RW5kUmVnZXggfHwgcmVnZXggPT09IGNvbW1lbnQyRW5kUmVnZXgpIHtcbiAgICAgICAgcmVnZXggPSB0ZXh0RW5kUmVnZXg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOb3Qgb25lIG9mIHRoZSBmaXZlIHN0YXRlIHJlZ2V4ZXMsIHNvIGl0IG11c3QgYmUgdGhlIGR5bmFtaWNhbGx5XG4gICAgICAgIC8vIGNyZWF0ZWQgcmF3IHRleHQgcmVnZXggYW5kIHdlJ3JlIGF0IHRoZSBjbG9zZSBvZiB0aGF0IGVsZW1lbnQuXG4gICAgICAgIHJlZ2V4ID0gdGFnRW5kUmVnZXg7XG4gICAgICAgIHJhd1RleHRFbmRSZWdleCA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoREVWX01PREUpIHtcbiAgICAgIC8vIElmIHdlIGhhdmUgYSBhdHRyTmFtZUVuZEluZGV4LCB3aGljaCBpbmRpY2F0ZXMgdGhhdCB3ZSBzaG91bGRcbiAgICAgIC8vIHJld3JpdGUgdGhlIGF0dHJpYnV0ZSBuYW1lLCBhc3NlcnQgdGhhdCB3ZSdyZSBpbiBhIHZhbGlkIGF0dHJpYnV0ZVxuICAgICAgLy8gcG9zaXRpb24gLSBlaXRoZXIgaW4gYSB0YWcsIG9yIGEgcXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZS5cbiAgICAgIGNvbnNvbGUuYXNzZXJ0KFxuICAgICAgICBhdHRyTmFtZUVuZEluZGV4ID09PSAtMSB8fFxuICAgICAgICAgIHJlZ2V4ID09PSB0YWdFbmRSZWdleCB8fFxuICAgICAgICAgIHJlZ2V4ID09PSBzaW5nbGVRdW90ZUF0dHJFbmRSZWdleCB8fFxuICAgICAgICAgIHJlZ2V4ID09PSBkb3VibGVRdW90ZUF0dHJFbmRSZWdleCxcbiAgICAgICAgJ3VuZXhwZWN0ZWQgcGFyc2Ugc3RhdGUgQidcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gV2UgaGF2ZSBmb3VyIGNhc2VzOlxuICAgIC8vICAxLiBXZSdyZSBpbiB0ZXh0IHBvc2l0aW9uLCBhbmQgbm90IGluIGEgcmF3IHRleHQgZWxlbWVudFxuICAgIC8vICAgICAocmVnZXggPT09IHRleHRFbmRSZWdleCk6IGluc2VydCBhIGNvbW1lbnQgbWFya2VyLlxuICAgIC8vICAyLiBXZSBoYXZlIGEgbm9uLW5lZ2F0aXZlIGF0dHJOYW1lRW5kSW5kZXggd2hpY2ggbWVhbnMgd2UgbmVlZCB0b1xuICAgIC8vICAgICByZXdyaXRlIHRoZSBhdHRyaWJ1dGUgbmFtZSB0byBhZGQgYSBib3VuZCBhdHRyaWJ1dGUgc3VmZml4LlxuICAgIC8vICAzLiBXZSdyZSBhdCB0aGUgbm9uLWZpcnN0IGJpbmRpbmcgaW4gYSBtdWx0aS1iaW5kaW5nIGF0dHJpYnV0ZSwgdXNlIGFcbiAgICAvLyAgICAgcGxhaW4gbWFya2VyLlxuICAgIC8vICA0LiBXZSdyZSBzb21ld2hlcmUgZWxzZSBpbnNpZGUgdGhlIHRhZy4gSWYgd2UncmUgaW4gYXR0cmlidXRlIG5hbWVcbiAgICAvLyAgICAgcG9zaXRpb24gKGF0dHJOYW1lRW5kSW5kZXggPT09IC0yKSwgYWRkIGEgc2VxdWVudGlhbCBzdWZmaXggdG9cbiAgICAvLyAgICAgZ2VuZXJhdGUgYSB1bmlxdWUgYXR0cmlidXRlIG5hbWUuXG5cbiAgICAvLyBEZXRlY3QgYSBiaW5kaW5nIG5leHQgdG8gc2VsZi1jbG9zaW5nIHRhZyBlbmQgYW5kIGluc2VydCBhIHNwYWNlIHRvXG4gICAgLy8gc2VwYXJhdGUgdGhlIG1hcmtlciBmcm9tIHRoZSB0YWcgZW5kOlxuICAgIGNvbnN0IGVuZCA9XG4gICAgICByZWdleCA9PT0gdGFnRW5kUmVnZXggJiYgc3RyaW5nc1tpICsgMV0uc3RhcnRzV2l0aCgnLz4nKSA/ICcgJyA6ICcnO1xuICAgIGh0bWwgKz1cbiAgICAgIHJlZ2V4ID09PSB0ZXh0RW5kUmVnZXhcbiAgICAgICAgPyBzICsgbm9kZU1hcmtlclxuICAgICAgICA6IGF0dHJOYW1lRW5kSW5kZXggPj0gMFxuICAgICAgICAgID8gKGF0dHJOYW1lcy5wdXNoKGF0dHJOYW1lISksXG4gICAgICAgICAgICBzLnNsaWNlKDAsIGF0dHJOYW1lRW5kSW5kZXgpICtcbiAgICAgICAgICAgICAgYm91bmRBdHRyaWJ1dGVTdWZmaXggK1xuICAgICAgICAgICAgICBzLnNsaWNlKGF0dHJOYW1lRW5kSW5kZXgpKSArXG4gICAgICAgICAgICBtYXJrZXIgK1xuICAgICAgICAgICAgZW5kXG4gICAgICAgICAgOiBzICsgbWFya2VyICsgKGF0dHJOYW1lRW5kSW5kZXggPT09IC0yID8gaSA6IGVuZCk7XG4gIH1cblxuICBjb25zdCBodG1sUmVzdWx0OiBzdHJpbmcgfCBUcnVzdGVkSFRNTCA9XG4gICAgaHRtbCArXG4gICAgKHN0cmluZ3NbbF0gfHwgJzw/PicpICtcbiAgICAodHlwZSA9PT0gU1ZHX1JFU1VMVCA/ICc8L3N2Zz4nIDogdHlwZSA9PT0gTUFUSE1MX1JFU1VMVCA/ICc8L21hdGg+JyA6ICcnKTtcblxuICAvLyBSZXR1cm5lZCBhcyBhbiBhcnJheSBmb3IgdGVyc2VuZXNzXG4gIHJldHVybiBbdHJ1c3RGcm9tVGVtcGxhdGVTdHJpbmcoc3RyaW5ncywgaHRtbFJlc3VsdCksIGF0dHJOYW1lc107XG59O1xuXG4vKiogQGludGVybmFsICovXG5leHBvcnQgdHlwZSB7VGVtcGxhdGV9O1xuY2xhc3MgVGVtcGxhdGUge1xuICAvKiogQGludGVybmFsICovXG4gIGVsITogSFRNTFRlbXBsYXRlRWxlbWVudDtcblxuICBwYXJ0czogQXJyYXk8VGVtcGxhdGVQYXJ0PiA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAge3N0cmluZ3MsIFsnXyRsaXRUeXBlJCddOiB0eXBlfTogVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0LFxuICAgIG9wdGlvbnM/OiBSZW5kZXJPcHRpb25zXG4gICkge1xuICAgIGxldCBub2RlOiBOb2RlIHwgbnVsbDtcbiAgICBsZXQgbm9kZUluZGV4ID0gMDtcbiAgICBsZXQgYXR0ck5hbWVJbmRleCA9IDA7XG4gICAgY29uc3QgcGFydENvdW50ID0gc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgIGNvbnN0IHBhcnRzID0gdGhpcy5wYXJ0cztcblxuICAgIC8vIENyZWF0ZSB0ZW1wbGF0ZSBlbGVtZW50XG4gICAgY29uc3QgW2h0bWwsIGF0dHJOYW1lc10gPSBnZXRUZW1wbGF0ZUh0bWwoc3RyaW5ncywgdHlwZSk7XG4gICAgdGhpcy5lbCA9IFRlbXBsYXRlLmNyZWF0ZUVsZW1lbnQoaHRtbCwgb3B0aW9ucyk7XG4gICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gdGhpcy5lbC5jb250ZW50O1xuXG4gICAgLy8gUmUtcGFyZW50IFNWRyBvciBNYXRoTUwgbm9kZXMgaW50byB0ZW1wbGF0ZSByb290XG4gICAgaWYgKHR5cGUgPT09IFNWR19SRVNVTFQgfHwgdHlwZSA9PT0gTUFUSE1MX1JFU1VMVCkge1xuICAgICAgY29uc3Qgd3JhcHBlciA9IHRoaXMuZWwuY29udGVudC5maXJzdENoaWxkITtcbiAgICAgIHdyYXBwZXIucmVwbGFjZVdpdGgoLi4ud3JhcHBlci5jaGlsZE5vZGVzKTtcbiAgICB9XG5cbiAgICAvLyBXYWxrIHRoZSB0ZW1wbGF0ZSB0byBmaW5kIGJpbmRpbmcgbWFya2VycyBhbmQgY3JlYXRlIFRlbXBsYXRlUGFydHNcbiAgICB3aGlsZSAoKG5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKSkgIT09IG51bGwgJiYgcGFydHMubGVuZ3RoIDwgcGFydENvdW50KSB7XG4gICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICBpZiAoREVWX01PREUpIHtcbiAgICAgICAgICBjb25zdCB0YWcgPSAobm9kZSBhcyBFbGVtZW50KS5sb2NhbE5hbWU7XG4gICAgICAgICAgLy8gV2FybiBpZiBgdGV4dGFyZWFgIGluY2x1ZGVzIGFuIGV4cHJlc3Npb24gYW5kIHRocm93IGlmIGB0ZW1wbGF0ZWBcbiAgICAgICAgICAvLyBkb2VzIHNpbmNlIHRoZXNlIGFyZSBub3Qgc3VwcG9ydGVkLiBXZSBkbyB0aGlzIGJ5IGNoZWNraW5nXG4gICAgICAgICAgLy8gaW5uZXJIVE1MIGZvciBhbnl0aGluZyB0aGF0IGxvb2tzIGxpa2UgYSBtYXJrZXIuIFRoaXMgY2F0Y2hlc1xuICAgICAgICAgIC8vIGNhc2VzIGxpa2UgYmluZGluZ3MgaW4gdGV4dGFyZWEgdGhlcmUgbWFya2VycyB0dXJuIGludG8gdGV4dCBub2Rlcy5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAvXig/OnRleHRhcmVhfHRlbXBsYXRlKSQvaSEudGVzdCh0YWcpICYmXG4gICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5pbm5lckhUTUwuaW5jbHVkZXMobWFya2VyKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgY29uc3QgbSA9XG4gICAgICAgICAgICAgIGBFeHByZXNzaW9ucyBhcmUgbm90IHN1cHBvcnRlZCBpbnNpZGUgXFxgJHt0YWd9XFxgIGAgK1xuICAgICAgICAgICAgICBgZWxlbWVudHMuIFNlZSBodHRwczovL2xpdC5kZXYvbXNnL2V4cHJlc3Npb24taW4tJHt0YWd9IGZvciBtb3JlIGAgK1xuICAgICAgICAgICAgICBgaW5mb3JtYXRpb24uYDtcbiAgICAgICAgICAgIGlmICh0YWcgPT09ICd0ZW1wbGF0ZScpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG0pO1xuICAgICAgICAgICAgfSBlbHNlIGlzc3VlV2FybmluZygnJywgbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE8gKGp1c3RpbmZhZ25hbmkpOiBmb3IgYXR0ZW1wdGVkIGR5bmFtaWMgdGFnIG5hbWVzLCB3ZSBkb24ndFxuICAgICAgICAvLyBpbmNyZW1lbnQgdGhlIGJpbmRpbmdJbmRleCwgYW5kIGl0J2xsIGJlIG9mZiBieSAxIGluIHRoZSBlbGVtZW50XG4gICAgICAgIC8vIGFuZCBvZmYgYnkgdHdvIGFmdGVyIGl0LlxuICAgICAgICBpZiAoKG5vZGUgYXMgRWxlbWVudCkuaGFzQXR0cmlidXRlcygpKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIChub2RlIGFzIEVsZW1lbnQpLmdldEF0dHJpYnV0ZU5hbWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChuYW1lLmVuZHNXaXRoKGJvdW5kQXR0cmlidXRlU3VmZml4KSkge1xuICAgICAgICAgICAgICBjb25zdCByZWFsTmFtZSA9IGF0dHJOYW1lc1thdHRyTmFtZUluZGV4KytdO1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IChub2RlIGFzIEVsZW1lbnQpLmdldEF0dHJpYnV0ZShuYW1lKSE7XG4gICAgICAgICAgICAgIGNvbnN0IHN0YXRpY3MgPSB2YWx1ZS5zcGxpdChtYXJrZXIpO1xuICAgICAgICAgICAgICBjb25zdCBtID0gLyhbLj9AXSk/KC4qKS8uZXhlYyhyZWFsTmFtZSkhO1xuICAgICAgICAgICAgICBwYXJ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBBVFRSSUJVVEVfUEFSVCxcbiAgICAgICAgICAgICAgICBpbmRleDogbm9kZUluZGV4LFxuICAgICAgICAgICAgICAgIG5hbWU6IG1bMl0sXG4gICAgICAgICAgICAgICAgc3RyaW5nczogc3RhdGljcyxcbiAgICAgICAgICAgICAgICBjdG9yOlxuICAgICAgICAgICAgICAgICAgbVsxXSA9PT0gJy4nXG4gICAgICAgICAgICAgICAgICAgID8gUHJvcGVydHlQYXJ0XG4gICAgICAgICAgICAgICAgICAgIDogbVsxXSA9PT0gJz8nXG4gICAgICAgICAgICAgICAgICAgICAgPyBCb29sZWFuQXR0cmlidXRlUGFydFxuICAgICAgICAgICAgICAgICAgICAgIDogbVsxXSA9PT0gJ0AnXG4gICAgICAgICAgICAgICAgICAgICAgICA/IEV2ZW50UGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgOiBBdHRyaWJ1dGVQYXJ0LFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgKG5vZGUgYXMgRWxlbWVudCkucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuYW1lLnN0YXJ0c1dpdGgobWFya2VyKSkge1xuICAgICAgICAgICAgICBwYXJ0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBFTEVNRU5UX1BBUlQsXG4gICAgICAgICAgICAgICAgaW5kZXg6IG5vZGVJbmRleCxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyAoanVzdGluZmFnbmFuaSk6IGJlbmNobWFyayB0aGUgcmVnZXggYWdhaW5zdCB0ZXN0aW5nIGZvciBlYWNoXG4gICAgICAgIC8vIG9mIHRoZSAzIHJhdyB0ZXh0IGVsZW1lbnQgbmFtZXMuXG4gICAgICAgIGlmIChyYXdUZXh0RWxlbWVudC50ZXN0KChub2RlIGFzIEVsZW1lbnQpLnRhZ05hbWUpKSB7XG4gICAgICAgICAgLy8gRm9yIHJhdyB0ZXh0IGVsZW1lbnRzIHdlIG5lZWQgdG8gc3BsaXQgdGhlIHRleHQgY29udGVudCBvblxuICAgICAgICAgIC8vIG1hcmtlcnMsIGNyZWF0ZSBhIFRleHQgbm9kZSBmb3IgZWFjaCBzZWdtZW50LCBhbmQgY3JlYXRlXG4gICAgICAgICAgLy8gYSBUZW1wbGF0ZVBhcnQgZm9yIGVhY2ggbWFya2VyLlxuICAgICAgICAgIGNvbnN0IHN0cmluZ3MgPSAobm9kZSBhcyBFbGVtZW50KS50ZXh0Q29udGVudCEuc3BsaXQobWFya2VyKTtcbiAgICAgICAgICBjb25zdCBsYXN0SW5kZXggPSBzdHJpbmdzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgaWYgKGxhc3RJbmRleCA+IDApIHtcbiAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLnRleHRDb250ZW50ID0gdHJ1c3RlZFR5cGVzXG4gICAgICAgICAgICAgID8gKHRydXN0ZWRUeXBlcy5lbXB0eVNjcmlwdCBhcyB1bmtub3duIGFzICcnKVxuICAgICAgICAgICAgICA6ICcnO1xuICAgICAgICAgICAgLy8gR2VuZXJhdGUgYSBuZXcgdGV4dCBub2RlIGZvciBlYWNoIGxpdGVyYWwgc2VjdGlvblxuICAgICAgICAgICAgLy8gVGhlc2Ugbm9kZXMgYXJlIGFsc28gdXNlZCBhcyB0aGUgbWFya2VycyBmb3Igbm9kZSBwYXJ0c1xuICAgICAgICAgICAgLy8gV2UgY2FuJ3QgdXNlIGVtcHR5IHRleHQgbm9kZXMgYXMgbWFya2VycyBiZWNhdXNlIHRoZXkncmVcbiAgICAgICAgICAgIC8vIG5vcm1hbGl6ZWQgd2hlbiBjbG9uaW5nIGluIElFIChjb3VsZCBzaW1wbGlmeSB3aGVuXG4gICAgICAgICAgICAvLyBJRSBpcyBubyBsb25nZXIgc3VwcG9ydGVkKVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXN0SW5kZXg7IGkrKykge1xuICAgICAgICAgICAgICAobm9kZSBhcyBFbGVtZW50KS5hcHBlbmQoc3RyaW5nc1tpXSwgY3JlYXRlTWFya2VyKCkpO1xuICAgICAgICAgICAgICAvLyBXYWxrIHBhc3QgdGhlIG1hcmtlciBub2RlIHdlIGp1c3QgYWRkZWRcbiAgICAgICAgICAgICAgd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgICAgICAgIHBhcnRzLnB1c2goe3R5cGU6IENISUxEX1BBUlQsIGluZGV4OiArK25vZGVJbmRleH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTm90ZSBiZWNhdXNlIHRoaXMgbWFya2VyIGlzIGFkZGVkIGFmdGVyIHRoZSB3YWxrZXIncyBjdXJyZW50XG4gICAgICAgICAgICAvLyBub2RlLCBpdCB3aWxsIGJlIHdhbGtlZCB0byBpbiB0aGUgb3V0ZXIgbG9vcCAoYW5kIGlnbm9yZWQpLCBzb1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBhZGp1c3Qgbm9kZUluZGV4IGhlcmVcbiAgICAgICAgICAgIChub2RlIGFzIEVsZW1lbnQpLmFwcGVuZChzdHJpbmdzW2xhc3RJbmRleF0sIGNyZWF0ZU1hcmtlcigpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCkge1xuICAgICAgICBjb25zdCBkYXRhID0gKG5vZGUgYXMgQ29tbWVudCkuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgPT09IG1hcmtlck1hdGNoKSB7XG4gICAgICAgICAgcGFydHMucHVzaCh7dHlwZTogQ0hJTERfUEFSVCwgaW5kZXg6IG5vZGVJbmRleH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBpID0gLTE7XG4gICAgICAgICAgd2hpbGUgKChpID0gKG5vZGUgYXMgQ29tbWVudCkuZGF0YS5pbmRleE9mKG1hcmtlciwgaSArIDEpKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIC8vIENvbW1lbnQgbm9kZSBoYXMgYSBiaW5kaW5nIG1hcmtlciBpbnNpZGUsIG1ha2UgYW4gaW5hY3RpdmUgcGFydFxuICAgICAgICAgICAgLy8gVGhlIGJpbmRpbmcgd29uJ3Qgd29yaywgYnV0IHN1YnNlcXVlbnQgYmluZGluZ3Mgd2lsbFxuICAgICAgICAgICAgcGFydHMucHVzaCh7dHlwZTogQ09NTUVOVF9QQVJULCBpbmRleDogbm9kZUluZGV4fSk7XG4gICAgICAgICAgICAvLyBNb3ZlIHRvIHRoZSBlbmQgb2YgdGhlIG1hdGNoXG4gICAgICAgICAgICBpICs9IG1hcmtlci5sZW5ndGggLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbm9kZUluZGV4Kys7XG4gICAgfVxuXG4gICAgaWYgKERFVl9NT0RFKSB7XG4gICAgICAvLyBJZiB0aGVyZSB3YXMgYSBkdXBsaWNhdGUgYXR0cmlidXRlIG9uIGEgdGFnLCB0aGVuIHdoZW4gdGhlIHRhZyBpc1xuICAgICAgLy8gcGFyc2VkIGludG8gYW4gZWxlbWVudCB0aGUgYXR0cmlidXRlIGdldHMgZGUtZHVwbGljYXRlZC4gV2UgY2FuIGRldGVjdFxuICAgICAgLy8gdGhpcyBtaXNtYXRjaCBpZiB3ZSBoYXZlbid0IHByZWNpc2VseSBjb25zdW1lZCBldmVyeSBhdHRyaWJ1dGUgbmFtZVxuICAgICAgLy8gd2hlbiBwcmVwYXJpbmcgdGhlIHRlbXBsYXRlLiBUaGlzIHdvcmtzIGJlY2F1c2UgYGF0dHJOYW1lc2AgaXMgYnVpbHRcbiAgICAgIC8vIGZyb20gdGhlIHRlbXBsYXRlIHN0cmluZyBhbmQgYGF0dHJOYW1lSW5kZXhgIGNvbWVzIGZyb20gcHJvY2Vzc2luZyB0aGVcbiAgICAgIC8vIHJlc3VsdGluZyBET00uXG4gICAgICBpZiAoYXR0ck5hbWVzLmxlbmd0aCAhPT0gYXR0ck5hbWVJbmRleCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYERldGVjdGVkIGR1cGxpY2F0ZSBhdHRyaWJ1dGUgYmluZGluZ3MuIFRoaXMgb2NjdXJzIGlmIHlvdXIgdGVtcGxhdGUgYCArXG4gICAgICAgICAgICBgaGFzIGR1cGxpY2F0ZSBhdHRyaWJ1dGVzIG9uIGFuIGVsZW1lbnQgdGFnLiBGb3IgZXhhbXBsZSBgICtcbiAgICAgICAgICAgIGBcIjxpbnB1dCA/ZGlzYWJsZWQ9XFwke3RydWV9ID9kaXNhYmxlZD1cXCR7ZmFsc2V9PlwiIGNvbnRhaW5zIGEgYCArXG4gICAgICAgICAgICBgZHVwbGljYXRlIFwiZGlzYWJsZWRcIiBhdHRyaWJ1dGUuIFRoZSBlcnJvciB3YXMgZGV0ZWN0ZWQgaW4gYCArXG4gICAgICAgICAgICBgdGhlIGZvbGxvd2luZyB0ZW1wbGF0ZTogXFxuYCArXG4gICAgICAgICAgICAnYCcgK1xuICAgICAgICAgICAgc3RyaW5ncy5qb2luKCckey4uLn0nKSArXG4gICAgICAgICAgICAnYCdcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXZSBjb3VsZCBzZXQgd2Fsa2VyLmN1cnJlbnROb2RlIHRvIGFub3RoZXIgbm9kZSBoZXJlIHRvIHByZXZlbnQgYSBtZW1vcnlcbiAgICAvLyBsZWFrLCBidXQgZXZlcnkgdGltZSB3ZSBwcmVwYXJlIGEgdGVtcGxhdGUsIHdlIGltbWVkaWF0ZWx5IHJlbmRlciBpdFxuICAgIC8vIGFuZCByZS11c2UgdGhlIHdhbGtlciBpbiBuZXcgVGVtcGxhdGVJbnN0YW5jZS5fY2xvbmUoKS5cbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ3RlbXBsYXRlIHByZXAnLFxuICAgICAgICB0ZW1wbGF0ZTogdGhpcyxcbiAgICAgICAgY2xvbmFibGVUZW1wbGF0ZTogdGhpcy5lbCxcbiAgICAgICAgcGFydHM6IHRoaXMucGFydHMsXG4gICAgICAgIHN0cmluZ3MsXG4gICAgICB9KTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRkZW4gdmlhIGBsaXRIdG1sUG9seWZpbGxTdXBwb3J0YCB0byBwcm92aWRlIHBsYXRmb3JtIHN1cHBvcnQuXG4gIC8qKiBAbm9jb2xsYXBzZSAqL1xuICBzdGF0aWMgY3JlYXRlRWxlbWVudChodG1sOiBUcnVzdGVkSFRNTCwgX29wdGlvbnM/OiBSZW5kZXJPcHRpb25zKSB7XG4gICAgY29uc3QgZWwgPSBkLmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gICAgZWwuaW5uZXJIVE1MID0gaHRtbCBhcyB1bmtub3duIGFzIHN0cmluZztcbiAgICByZXR1cm4gZWw7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBEaXNjb25uZWN0YWJsZSB7XG4gIF8kcGFyZW50PzogRGlzY29ubmVjdGFibGU7XG4gIF8kZGlzY29ubmVjdGFibGVDaGlsZHJlbj86IFNldDxEaXNjb25uZWN0YWJsZT47XG4gIC8vIFJhdGhlciB0aGFuIGhvbGQgY29ubmVjdGlvbiBzdGF0ZSBvbiBpbnN0YW5jZXMsIERpc2Nvbm5lY3RhYmxlcyByZWN1cnNpdmVseVxuICAvLyBmZXRjaCB0aGUgY29ubmVjdGlvbiBzdGF0ZSBmcm9tIHRoZSBSb290UGFydCB0aGV5IGFyZSBjb25uZWN0ZWQgaW4gdmlhXG4gIC8vIGdldHRlcnMgdXAgdGhlIERpc2Nvbm5lY3RhYmxlIHRyZWUgdmlhIF8kcGFyZW50IHJlZmVyZW5jZXMuIFRoaXMgcHVzaGVzIHRoZVxuICAvLyBjb3N0IG9mIHRyYWNraW5nIHRoZSBpc0Nvbm5lY3RlZCBzdGF0ZSB0byBgQXN5bmNEaXJlY3RpdmVzYCwgYW5kIGF2b2lkc1xuICAvLyBuZWVkaW5nIHRvIHBhc3MgYWxsIERpc2Nvbm5lY3RhYmxlcyAocGFydHMsIHRlbXBsYXRlIGluc3RhbmNlcywgYW5kXG4gIC8vIGRpcmVjdGl2ZXMpIHRoZWlyIGNvbm5lY3Rpb24gc3RhdGUgZWFjaCB0aW1lIGl0IGNoYW5nZXMsIHdoaWNoIHdvdWxkIGJlXG4gIC8vIGNvc3RseSBmb3IgdHJlZXMgdGhhdCBoYXZlIG5vIEFzeW5jRGlyZWN0aXZlcy5cbiAgXyRpc0Nvbm5lY3RlZDogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZURpcmVjdGl2ZShcbiAgcGFydDogQ2hpbGRQYXJ0IHwgQXR0cmlidXRlUGFydCB8IEVsZW1lbnRQYXJ0LFxuICB2YWx1ZTogdW5rbm93bixcbiAgcGFyZW50OiBEaXJlY3RpdmVQYXJlbnQgPSBwYXJ0LFxuICBhdHRyaWJ1dGVJbmRleD86IG51bWJlclxuKTogdW5rbm93biB7XG4gIC8vIEJhaWwgZWFybHkgaWYgdGhlIHZhbHVlIGlzIGV4cGxpY2l0bHkgbm9DaGFuZ2UuIE5vdGUsIHRoaXMgbWVhbnMgYW55XG4gIC8vIG5lc3RlZCBkaXJlY3RpdmUgaXMgc3RpbGwgYXR0YWNoZWQgYW5kIGlzIG5vdCBydW4uXG4gIGlmICh2YWx1ZSA9PT0gbm9DaGFuZ2UpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgbGV0IGN1cnJlbnREaXJlY3RpdmUgPVxuICAgIGF0dHJpYnV0ZUluZGV4ICE9PSB1bmRlZmluZWRcbiAgICAgID8gKHBhcmVudCBhcyBBdHRyaWJ1dGVQYXJ0KS5fX2RpcmVjdGl2ZXM/LlthdHRyaWJ1dGVJbmRleF1cbiAgICAgIDogKHBhcmVudCBhcyBDaGlsZFBhcnQgfCBFbGVtZW50UGFydCB8IERpcmVjdGl2ZSkuX19kaXJlY3RpdmU7XG4gIGNvbnN0IG5leHREaXJlY3RpdmVDb25zdHJ1Y3RvciA9IGlzUHJpbWl0aXZlKHZhbHVlKVxuICAgID8gdW5kZWZpbmVkXG4gICAgOiAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAgICAgKHZhbHVlIGFzIERpcmVjdGl2ZVJlc3VsdClbJ18kbGl0RGlyZWN0aXZlJCddO1xuICBpZiAoY3VycmVudERpcmVjdGl2ZT8uY29uc3RydWN0b3IgIT09IG5leHREaXJlY3RpdmVDb25zdHJ1Y3Rvcikge1xuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgY3VycmVudERpcmVjdGl2ZT8uWydfJG5vdGlmeURpcmVjdGl2ZUNvbm5lY3Rpb25DaGFuZ2VkJ10/LihmYWxzZSk7XG4gICAgaWYgKG5leHREaXJlY3RpdmVDb25zdHJ1Y3RvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjdXJyZW50RGlyZWN0aXZlID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50RGlyZWN0aXZlID0gbmV3IG5leHREaXJlY3RpdmVDb25zdHJ1Y3RvcihwYXJ0IGFzIFBhcnRJbmZvKTtcbiAgICAgIGN1cnJlbnREaXJlY3RpdmUuXyRpbml0aWFsaXplKHBhcnQsIHBhcmVudCwgYXR0cmlidXRlSW5kZXgpO1xuICAgIH1cbiAgICBpZiAoYXR0cmlidXRlSW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgKChwYXJlbnQgYXMgQXR0cmlidXRlUGFydCkuX19kaXJlY3RpdmVzID8/PSBbXSlbYXR0cmlidXRlSW5kZXhdID1cbiAgICAgICAgY3VycmVudERpcmVjdGl2ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHBhcmVudCBhcyBDaGlsZFBhcnQgfCBEaXJlY3RpdmUpLl9fZGlyZWN0aXZlID0gY3VycmVudERpcmVjdGl2ZTtcbiAgICB9XG4gIH1cbiAgaWYgKGN1cnJlbnREaXJlY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbHVlID0gcmVzb2x2ZURpcmVjdGl2ZShcbiAgICAgIHBhcnQsXG4gICAgICBjdXJyZW50RGlyZWN0aXZlLl8kcmVzb2x2ZShwYXJ0LCAodmFsdWUgYXMgRGlyZWN0aXZlUmVzdWx0KS52YWx1ZXMpLFxuICAgICAgY3VycmVudERpcmVjdGl2ZSxcbiAgICAgIGF0dHJpYnV0ZUluZGV4XG4gICAgKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCB0eXBlIHtUZW1wbGF0ZUluc3RhbmNlfTtcbi8qKlxuICogQW4gdXBkYXRlYWJsZSBpbnN0YW5jZSBvZiBhIFRlbXBsYXRlLiBIb2xkcyByZWZlcmVuY2VzIHRvIHRoZSBQYXJ0cyB1c2VkIHRvXG4gKiB1cGRhdGUgdGhlIHRlbXBsYXRlIGluc3RhbmNlLlxuICovXG5jbGFzcyBUZW1wbGF0ZUluc3RhbmNlIGltcGxlbWVudHMgRGlzY29ubmVjdGFibGUge1xuICBfJHRlbXBsYXRlOiBUZW1wbGF0ZTtcbiAgXyRwYXJ0czogQXJyYXk8UGFydCB8IHVuZGVmaW5lZD4gPSBbXTtcblxuICAvKiogQGludGVybmFsICovXG4gIF8kcGFyZW50OiBDaGlsZFBhcnQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPiA9IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZTogVGVtcGxhdGUsIHBhcmVudDogQ2hpbGRQYXJ0KSB7XG4gICAgdGhpcy5fJHRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgdGhpcy5fJHBhcmVudCA9IHBhcmVudDtcbiAgfVxuXG4gIC8vIENhbGxlZCBieSBDaGlsZFBhcnQgcGFyZW50Tm9kZSBnZXR0ZXJcbiAgZ2V0IHBhcmVudE5vZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQucGFyZW50Tm9kZTtcbiAgfVxuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQuXyRpc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIC8vIFRoaXMgbWV0aG9kIGlzIHNlcGFyYXRlIGZyb20gdGhlIGNvbnN0cnVjdG9yIGJlY2F1c2Ugd2UgbmVlZCB0byByZXR1cm4gYVxuICAvLyBEb2N1bWVudEZyYWdtZW50IGFuZCB3ZSBkb24ndCB3YW50IHRvIGhvbGQgb250byBpdCB3aXRoIGFuIGluc3RhbmNlIGZpZWxkLlxuICBfY2xvbmUob3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGVsOiB7Y29udGVudH0sXG4gICAgICBwYXJ0czogcGFydHMsXG4gICAgfSA9IHRoaXMuXyR0ZW1wbGF0ZTtcbiAgICBjb25zdCBmcmFnbWVudCA9IChvcHRpb25zPy5jcmVhdGlvblNjb3BlID8/IGQpLmltcG9ydE5vZGUoY29udGVudCwgdHJ1ZSk7XG4gICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gZnJhZ21lbnQ7XG5cbiAgICBsZXQgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpITtcbiAgICBsZXQgbm9kZUluZGV4ID0gMDtcbiAgICBsZXQgcGFydEluZGV4ID0gMDtcbiAgICBsZXQgdGVtcGxhdGVQYXJ0ID0gcGFydHNbMF07XG5cbiAgICB3aGlsZSAodGVtcGxhdGVQYXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChub2RlSW5kZXggPT09IHRlbXBsYXRlUGFydC5pbmRleCkge1xuICAgICAgICBsZXQgcGFydDogUGFydCB8IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRlbXBsYXRlUGFydC50eXBlID09PSBDSElMRF9QQVJUKSB7XG4gICAgICAgICAgcGFydCA9IG5ldyBDaGlsZFBhcnQoXG4gICAgICAgICAgICBub2RlIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgICAgbm9kZS5uZXh0U2libGluZyxcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBvcHRpb25zXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0ZW1wbGF0ZVBhcnQudHlwZSA9PT0gQVRUUklCVVRFX1BBUlQpIHtcbiAgICAgICAgICBwYXJ0ID0gbmV3IHRlbXBsYXRlUGFydC5jdG9yKFxuICAgICAgICAgICAgbm9kZSBhcyBIVE1MRWxlbWVudCxcbiAgICAgICAgICAgIHRlbXBsYXRlUGFydC5uYW1lLFxuICAgICAgICAgICAgdGVtcGxhdGVQYXJ0LnN0cmluZ3MsXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgb3B0aW9uc1xuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGVtcGxhdGVQYXJ0LnR5cGUgPT09IEVMRU1FTlRfUEFSVCkge1xuICAgICAgICAgIHBhcnQgPSBuZXcgRWxlbWVudFBhcnQobm9kZSBhcyBIVE1MRWxlbWVudCwgdGhpcywgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fJHBhcnRzLnB1c2gocGFydCk7XG4gICAgICAgIHRlbXBsYXRlUGFydCA9IHBhcnRzWysrcGFydEluZGV4XTtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlSW5kZXggIT09IHRlbXBsYXRlUGFydD8uaW5kZXgpIHtcbiAgICAgICAgbm9kZSA9IHdhbGtlci5uZXh0Tm9kZSgpITtcbiAgICAgICAgbm9kZUluZGV4Kys7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFdlIG5lZWQgdG8gc2V0IHRoZSBjdXJyZW50Tm9kZSBhd2F5IGZyb20gdGhlIGNsb25lZCB0cmVlIHNvIHRoYXQgd2VcbiAgICAvLyBkb24ndCBob2xkIG9udG8gdGhlIHRyZWUgZXZlbiBpZiB0aGUgdHJlZSBpcyBkZXRhY2hlZCBhbmQgc2hvdWxkIGJlXG4gICAgLy8gZnJlZWQuXG4gICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gZDtcbiAgICByZXR1cm4gZnJhZ21lbnQ7XG4gIH1cblxuICBfdXBkYXRlKHZhbHVlczogQXJyYXk8dW5rbm93bj4pIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwYXJ0IG9mIHRoaXMuXyRwYXJ0cykge1xuICAgICAgaWYgKHBhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAgICBraW5kOiAnc2V0IHBhcnQnLFxuICAgICAgICAgICAgcGFydCxcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZXNbaV0sXG4gICAgICAgICAgICB2YWx1ZUluZGV4OiBpLFxuICAgICAgICAgICAgdmFsdWVzLFxuICAgICAgICAgICAgdGVtcGxhdGVJbnN0YW5jZTogdGhpcyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKChwYXJ0IGFzIEF0dHJpYnV0ZVBhcnQpLnN0cmluZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIChwYXJ0IGFzIEF0dHJpYnV0ZVBhcnQpLl8kc2V0VmFsdWUodmFsdWVzLCBwYXJ0IGFzIEF0dHJpYnV0ZVBhcnQsIGkpO1xuICAgICAgICAgIC8vIFRoZSBudW1iZXIgb2YgdmFsdWVzIHRoZSBwYXJ0IGNvbnN1bWVzIGlzIHBhcnQuc3RyaW5ncy5sZW5ndGggLSAxXG4gICAgICAgICAgLy8gc2luY2UgdmFsdWVzIGFyZSBpbiBiZXR3ZWVuIHRlbXBsYXRlIHNwYW5zLiBXZSBpbmNyZW1lbnQgaSBieSAxXG4gICAgICAgICAgLy8gbGF0ZXIgaW4gdGhlIGxvb3AsIHNvIGluY3JlbWVudCBpdCBieSBwYXJ0LnN0cmluZ3MubGVuZ3RoIC0gMiBoZXJlXG4gICAgICAgICAgaSArPSAocGFydCBhcyBBdHRyaWJ1dGVQYXJ0KS5zdHJpbmdzIS5sZW5ndGggLSAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcnQuXyRzZXRWYWx1ZSh2YWx1ZXNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICB9XG59XG5cbi8qXG4gKiBQYXJ0c1xuICovXG50eXBlIEF0dHJpYnV0ZVRlbXBsYXRlUGFydCA9IHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIEFUVFJJQlVURV9QQVJUO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGN0b3I6IHR5cGVvZiBBdHRyaWJ1dGVQYXJ0O1xuICByZWFkb25seSBzdHJpbmdzOiBSZWFkb25seUFycmF5PHN0cmluZz47XG59O1xudHlwZSBDaGlsZFRlbXBsYXRlUGFydCA9IHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIENISUxEX1BBUlQ7XG4gIHJlYWRvbmx5IGluZGV4OiBudW1iZXI7XG59O1xudHlwZSBFbGVtZW50VGVtcGxhdGVQYXJ0ID0ge1xuICByZWFkb25seSB0eXBlOiB0eXBlb2YgRUxFTUVOVF9QQVJUO1xuICByZWFkb25seSBpbmRleDogbnVtYmVyO1xufTtcbnR5cGUgQ29tbWVudFRlbXBsYXRlUGFydCA9IHtcbiAgcmVhZG9ubHkgdHlwZTogdHlwZW9mIENPTU1FTlRfUEFSVDtcbiAgcmVhZG9ubHkgaW5kZXg6IG51bWJlcjtcbn07XG5cbi8qKlxuICogQSBUZW1wbGF0ZVBhcnQgcmVwcmVzZW50cyBhIGR5bmFtaWMgcGFydCBpbiBhIHRlbXBsYXRlLCBiZWZvcmUgdGhlIHRlbXBsYXRlXG4gKiBpcyBpbnN0YW50aWF0ZWQuIFdoZW4gYSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQgUGFydHMgYXJlIGNyZWF0ZWQgZnJvbVxuICogVGVtcGxhdGVQYXJ0cy5cbiAqL1xudHlwZSBUZW1wbGF0ZVBhcnQgPVxuICB8IENoaWxkVGVtcGxhdGVQYXJ0XG4gIHwgQXR0cmlidXRlVGVtcGxhdGVQYXJ0XG4gIHwgRWxlbWVudFRlbXBsYXRlUGFydFxuICB8IENvbW1lbnRUZW1wbGF0ZVBhcnQ7XG5cbmV4cG9ydCB0eXBlIFBhcnQgPVxuICB8IENoaWxkUGFydFxuICB8IEF0dHJpYnV0ZVBhcnRcbiAgfCBQcm9wZXJ0eVBhcnRcbiAgfCBCb29sZWFuQXR0cmlidXRlUGFydFxuICB8IEVsZW1lbnRQYXJ0XG4gIHwgRXZlbnRQYXJ0O1xuXG5leHBvcnQgdHlwZSB7Q2hpbGRQYXJ0fTtcbmNsYXNzIENoaWxkUGFydCBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgcmVhZG9ubHkgdHlwZSA9IENISUxEX1BBUlQ7XG4gIHJlYWRvbmx5IG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gIF8kY29tbWl0dGVkVmFsdWU6IHVua25vd24gPSBub3RoaW5nO1xuICAvKiogQGludGVybmFsICovXG4gIF9fZGlyZWN0aXZlPzogRGlyZWN0aXZlO1xuICAvKiogQGludGVybmFsICovXG4gIF8kc3RhcnROb2RlOiBDaGlsZE5vZGU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRlbmROb2RlOiBDaGlsZE5vZGUgfCBudWxsO1xuICBwcml2YXRlIF90ZXh0U2FuaXRpemVyOiBWYWx1ZVNhbml0aXplciB8IHVuZGVmaW5lZDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJHBhcmVudDogRGlzY29ubmVjdGFibGUgfCB1bmRlZmluZWQ7XG4gIC8qKlxuICAgKiBDb25uZWN0aW9uIHN0YXRlIGZvciBSb290UGFydHMgb25seSAoaS5lLiBDaGlsZFBhcnQgd2l0aG91dCBfJHBhcmVudFxuICAgKiByZXR1cm5lZCBmcm9tIHRvcC1sZXZlbCBgcmVuZGVyYCkuIFRoaXMgZmllbGQgaXMgdW51c2VkIG90aGVyd2lzZS4gVGhlXG4gICAqIGludGVudGlvbiB3b3VsZCBiZSBjbGVhcmVyIGlmIHdlIG1hZGUgYFJvb3RQYXJ0YCBhIHN1YmNsYXNzIG9mIGBDaGlsZFBhcnRgXG4gICAqIHdpdGggdGhpcyBmaWVsZCAoYW5kIGEgZGlmZmVyZW50IF8kaXNDb25uZWN0ZWQgZ2V0dGVyKSwgYnV0IHRoZSBzdWJjbGFzc1xuICAgKiBjYXVzZWQgYSBwZXJmIHJlZ3Jlc3Npb24sIHBvc3NpYmx5IGR1ZSB0byBtYWtpbmcgY2FsbCBzaXRlcyBwb2x5bW9ycGhpYy5cbiAgICogQGludGVybmFsXG4gICAqL1xuICBfX2lzQ29ubmVjdGVkOiBib29sZWFuO1xuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgLy8gQ2hpbGRQYXJ0cyB0aGF0IGFyZSBub3QgYXQgdGhlIHJvb3Qgc2hvdWxkIGFsd2F5cyBiZSBjcmVhdGVkIHdpdGggYVxuICAgIC8vIHBhcmVudDsgb25seSBSb290Q2hpbGROb2RlJ3Mgd29uJ3QsIHNvIHRoZXkgcmV0dXJuIHRoZSBsb2NhbCBpc0Nvbm5lY3RlZFxuICAgIC8vIHN0YXRlXG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQ/Ll8kaXNDb25uZWN0ZWQgPz8gdGhpcy5fX2lzQ29ubmVjdGVkO1xuICB9XG5cbiAgLy8gVGhlIGZvbGxvd2luZyBmaWVsZHMgd2lsbCBiZSBwYXRjaGVkIG9udG8gQ2hpbGRQYXJ0cyB3aGVuIHJlcXVpcmVkIGJ5XG4gIC8vIEFzeW5jRGlyZWN0aXZlXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRkaXNjb25uZWN0YWJsZUNoaWxkcmVuPzogU2V0PERpc2Nvbm5lY3RhYmxlPiA9IHVuZGVmaW5lZDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJG5vdGlmeUNvbm5lY3Rpb25DaGFuZ2VkPyhcbiAgICBpc0Nvbm5lY3RlZDogYm9vbGVhbixcbiAgICByZW1vdmVGcm9tUGFyZW50PzogYm9vbGVhbixcbiAgICBmcm9tPzogbnVtYmVyXG4gICk6IHZvaWQ7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRyZXBhcmVudERpc2Nvbm5lY3RhYmxlcz8ocGFyZW50OiBEaXNjb25uZWN0YWJsZSk6IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgc3RhcnROb2RlOiBDaGlsZE5vZGUsXG4gICAgZW5kTm9kZTogQ2hpbGROb2RlIHwgbnVsbCxcbiAgICBwYXJlbnQ6IFRlbXBsYXRlSW5zdGFuY2UgfCBDaGlsZFBhcnQgfCB1bmRlZmluZWQsXG4gICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICB0aGlzLl8kc3RhcnROb2RlID0gc3RhcnROb2RlO1xuICAgIHRoaXMuXyRlbmROb2RlID0gZW5kTm9kZTtcbiAgICB0aGlzLl8kcGFyZW50ID0gcGFyZW50O1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgLy8gTm90ZSBfX2lzQ29ubmVjdGVkIGlzIG9ubHkgZXZlciBhY2Nlc3NlZCBvbiBSb290UGFydHMgKGkuZS4gd2hlbiB0aGVyZSBpc1xuICAgIC8vIG5vIF8kcGFyZW50KTsgdGhlIHZhbHVlIG9uIGEgbm9uLXJvb3QtcGFydCBpcyBcImRvbid0IGNhcmVcIiwgYnV0IGNoZWNraW5nXG4gICAgLy8gZm9yIHBhcmVudCB3b3VsZCBiZSBtb3JlIGNvZGVcbiAgICB0aGlzLl9faXNDb25uZWN0ZWQgPSBvcHRpb25zPy5pc0Nvbm5lY3RlZCA/PyB0cnVlO1xuICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgIC8vIEV4cGxpY2l0bHkgaW5pdGlhbGl6ZSBmb3IgY29uc2lzdGVudCBjbGFzcyBzaGFwZS5cbiAgICAgIHRoaXMuX3RleHRTYW5pdGl6ZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBwYXJlbnQgbm9kZSBpbnRvIHdoaWNoIHRoZSBwYXJ0IHJlbmRlcnMgaXRzIGNvbnRlbnQuXG4gICAqXG4gICAqIEEgQ2hpbGRQYXJ0J3MgY29udGVudCBjb25zaXN0cyBvZiBhIHJhbmdlIG9mIGFkamFjZW50IGNoaWxkIG5vZGVzIG9mXG4gICAqIGAucGFyZW50Tm9kZWAsIHBvc3NpYmx5IGJvcmRlcmVkIGJ5ICdtYXJrZXIgbm9kZXMnIChgLnN0YXJ0Tm9kZWAgYW5kXG4gICAqIGAuZW5kTm9kZWApLlxuICAgKlxuICAgKiAtIElmIGJvdGggYC5zdGFydE5vZGVgIGFuZCBgLmVuZE5vZGVgIGFyZSBub24tbnVsbCwgdGhlbiB0aGUgcGFydCdzIGNvbnRlbnRcbiAgICogY29uc2lzdHMgb2YgYWxsIHNpYmxpbmdzIGJldHdlZW4gYC5zdGFydE5vZGVgIGFuZCBgLmVuZE5vZGVgLCBleGNsdXNpdmVseS5cbiAgICpcbiAgICogLSBJZiBgLnN0YXJ0Tm9kZWAgaXMgbm9uLW51bGwgYnV0IGAuZW5kTm9kZWAgaXMgbnVsbCwgdGhlbiB0aGUgcGFydCdzXG4gICAqIGNvbnRlbnQgY29uc2lzdHMgb2YgYWxsIHNpYmxpbmdzIGZvbGxvd2luZyBgLnN0YXJ0Tm9kZWAsIHVwIHRvIGFuZFxuICAgKiBpbmNsdWRpbmcgdGhlIGxhc3QgY2hpbGQgb2YgYC5wYXJlbnROb2RlYC4gSWYgYC5lbmROb2RlYCBpcyBub24tbnVsbCwgdGhlblxuICAgKiBgLnN0YXJ0Tm9kZWAgd2lsbCBhbHdheXMgYmUgbm9uLW51bGwuXG4gICAqXG4gICAqIC0gSWYgYm90aCBgLmVuZE5vZGVgIGFuZCBgLnN0YXJ0Tm9kZWAgYXJlIG51bGwsIHRoZW4gdGhlIHBhcnQncyBjb250ZW50XG4gICAqIGNvbnNpc3RzIG9mIGFsbCBjaGlsZCBub2RlcyBvZiBgLnBhcmVudE5vZGVgLlxuICAgKi9cbiAgZ2V0IHBhcmVudE5vZGUoKTogTm9kZSB7XG4gICAgbGV0IHBhcmVudE5vZGU6IE5vZGUgPSB3cmFwKHRoaXMuXyRzdGFydE5vZGUpLnBhcmVudE5vZGUhO1xuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuXyRwYXJlbnQ7XG4gICAgaWYgKFxuICAgICAgcGFyZW50ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHBhcmVudE5vZGU/Lm5vZGVUeXBlID09PSAxMSAvKiBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UICovXG4gICAgKSB7XG4gICAgICAvLyBJZiB0aGUgcGFyZW50Tm9kZSBpcyBhIERvY3VtZW50RnJhZ21lbnQsIGl0IG1heSBiZSBiZWNhdXNlIHRoZSBET00gaXNcbiAgICAgIC8vIHN0aWxsIGluIHRoZSBjbG9uZWQgZnJhZ21lbnQgZHVyaW5nIGluaXRpYWwgcmVuZGVyOyBpZiBzbywgZ2V0IHRoZSByZWFsXG4gICAgICAvLyBwYXJlbnROb2RlIHRoZSBwYXJ0IHdpbGwgYmUgY29tbWl0dGVkIGludG8gYnkgYXNraW5nIHRoZSBwYXJlbnQuXG4gICAgICBwYXJlbnROb2RlID0gKHBhcmVudCBhcyBDaGlsZFBhcnQgfCBUZW1wbGF0ZUluc3RhbmNlKS5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gcGFyZW50Tm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcGFydCdzIGxlYWRpbmcgbWFya2VyIG5vZGUsIGlmIGFueS4gU2VlIGAucGFyZW50Tm9kZWAgZm9yIG1vcmVcbiAgICogaW5mb3JtYXRpb24uXG4gICAqL1xuICBnZXQgc3RhcnROb2RlKCk6IE5vZGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fJHN0YXJ0Tm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcGFydCdzIHRyYWlsaW5nIG1hcmtlciBub2RlLCBpZiBhbnkuIFNlZSBgLnBhcmVudE5vZGVgIGZvciBtb3JlXG4gICAqIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgZ2V0IGVuZE5vZGUoKTogTm9kZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl8kZW5kTm9kZTtcbiAgfVxuXG4gIF8kc2V0VmFsdWUodmFsdWU6IHVua25vd24sIGRpcmVjdGl2ZVBhcmVudDogRGlyZWN0aXZlUGFyZW50ID0gdGhpcyk6IHZvaWQge1xuICAgIGlmIChERVZfTU9ERSAmJiB0aGlzLnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFRoaXMgXFxgQ2hpbGRQYXJ0XFxgIGhhcyBubyBcXGBwYXJlbnROb2RlXFxgIGFuZCB0aGVyZWZvcmUgY2Fubm90IGFjY2VwdCBhIHZhbHVlLiBUaGlzIGxpa2VseSBtZWFucyB0aGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBwYXJ0IHdhcyBtYW5pcHVsYXRlZCBpbiBhbiB1bnN1cHBvcnRlZCB3YXkgb3V0c2lkZSBvZiBMaXQncyBjb250cm9sIHN1Y2ggdGhhdCB0aGUgcGFydCdzIG1hcmtlciBub2RlcyB3ZXJlIGVqZWN0ZWQgZnJvbSBET00uIEZvciBleGFtcGxlLCBzZXR0aW5nIHRoZSBlbGVtZW50J3MgXFxgaW5uZXJIVE1MXFxgIG9yIFxcYHRleHRDb250ZW50XFxgIGNhbiBkbyB0aGlzLmBcbiAgICAgICk7XG4gICAgfVxuICAgIHZhbHVlID0gcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCB2YWx1ZSwgZGlyZWN0aXZlUGFyZW50KTtcbiAgICBpZiAoaXNQcmltaXRpdmUodmFsdWUpKSB7XG4gICAgICAvLyBOb24tcmVuZGVyaW5nIGNoaWxkIHZhbHVlcy4gSXQncyBpbXBvcnRhbnQgdGhhdCB0aGVzZSBkbyBub3QgcmVuZGVyXG4gICAgICAvLyBlbXB0eSB0ZXh0IG5vZGVzIHRvIGF2b2lkIGlzc3VlcyB3aXRoIHByZXZlbnRpbmcgZGVmYXVsdCA8c2xvdD5cbiAgICAgIC8vIGZhbGxiYWNrIGNvbnRlbnQuXG4gICAgICBpZiAodmFsdWUgPT09IG5vdGhpbmcgfHwgdmFsdWUgPT0gbnVsbCB8fCB2YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgaWYgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAhPT0gbm90aGluZykge1xuICAgICAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgICAgICBraW5kOiAnY29tbWl0IG5vdGhpbmcgdG8gY2hpbGQnLFxuICAgICAgICAgICAgICBzdGFydDogdGhpcy5fJHN0YXJ0Tm9kZSxcbiAgICAgICAgICAgICAgZW5kOiB0aGlzLl8kZW5kTm9kZSxcbiAgICAgICAgICAgICAgcGFyZW50OiB0aGlzLl8kcGFyZW50LFxuICAgICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLl8kY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBub3RoaW5nO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSAhPT0gdGhpcy5fJGNvbW1pdHRlZFZhbHVlICYmIHZhbHVlICE9PSBub0NoYW5nZSkge1xuICAgICAgICB0aGlzLl9jb21taXRUZXh0KHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgfSBlbHNlIGlmICgodmFsdWUgYXMgVGVtcGxhdGVSZXN1bHQpWydfJGxpdFR5cGUkJ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fY29tbWl0VGVtcGxhdGVSZXN1bHQodmFsdWUgYXMgVGVtcGxhdGVSZXN1bHQpO1xuICAgIH0gZWxzZSBpZiAoKHZhbHVlIGFzIE5vZGUpLm5vZGVUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChERVZfTU9ERSAmJiB0aGlzLm9wdGlvbnM/Lmhvc3QgPT09IHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2NvbW1pdFRleHQoXG4gICAgICAgICAgYFtwcm9iYWJsZSBtaXN0YWtlOiByZW5kZXJlZCBhIHRlbXBsYXRlJ3MgaG9zdCBpbiBpdHNlbGYgYCArXG4gICAgICAgICAgICBgKGNvbW1vbmx5IGNhdXNlZCBieSB3cml0aW5nIFxcJHt0aGlzfSBpbiBhIHRlbXBsYXRlXWBcbiAgICAgICAgKTtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGBBdHRlbXB0ZWQgdG8gcmVuZGVyIHRoZSB0ZW1wbGF0ZSBob3N0YCxcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBgaW5zaWRlIGl0c2VsZi4gVGhpcyBpcyBhbG1vc3QgYWx3YXlzIGEgbWlzdGFrZSwgYW5kIGluIGRldiBtb2RlIGAsXG4gICAgICAgICAgYHdlIHJlbmRlciBzb21lIHdhcm5pbmcgdGV4dC4gSW4gcHJvZHVjdGlvbiBob3dldmVyLCB3ZSdsbCBgLFxuICAgICAgICAgIGByZW5kZXIgaXQsIHdoaWNoIHdpbGwgdXN1YWxseSByZXN1bHQgaW4gYW4gZXJyb3IsIGFuZCBzb21ldGltZXMgYCxcbiAgICAgICAgICBgaW4gdGhlIGVsZW1lbnQgZGlzYXBwZWFyaW5nIGZyb20gdGhlIERPTS5gXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NvbW1pdE5vZGUodmFsdWUgYXMgTm9kZSk7XG4gICAgfSBlbHNlIGlmIChpc0l0ZXJhYmxlKHZhbHVlKSkge1xuICAgICAgdGhpcy5fY29tbWl0SXRlcmFibGUodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBGYWxsYmFjaywgd2lsbCByZW5kZXIgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvblxuICAgICAgdGhpcy5fY29tbWl0VGV4dCh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfaW5zZXJ0PFQgZXh0ZW5kcyBOb2RlPihub2RlOiBUKSB7XG4gICAgcmV0dXJuIHdyYXAod3JhcCh0aGlzLl8kc3RhcnROb2RlKS5wYXJlbnROb2RlISkuaW5zZXJ0QmVmb3JlKFxuICAgICAgbm9kZSxcbiAgICAgIHRoaXMuXyRlbmROb2RlXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1pdE5vZGUodmFsdWU6IE5vZGUpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fJGNvbW1pdHRlZFZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgdGhpcy5fJGNsZWFyKCk7XG4gICAgICBpZiAoXG4gICAgICAgIEVOQUJMRV9FWFRSQV9TRUNVUklUWV9IT09LUyAmJlxuICAgICAgICBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwgIT09IG5vb3BTYW5pdGl6ZXJcbiAgICAgICkge1xuICAgICAgICBjb25zdCBwYXJlbnROb2RlTmFtZSA9IHRoaXMuXyRzdGFydE5vZGUucGFyZW50Tm9kZT8ubm9kZU5hbWU7XG4gICAgICAgIGlmIChwYXJlbnROb2RlTmFtZSA9PT0gJ1NUWUxFJyB8fCBwYXJlbnROb2RlTmFtZSA9PT0gJ1NDUklQVCcpIHtcbiAgICAgICAgICBsZXQgbWVzc2FnZSA9ICdGb3JiaWRkZW4nO1xuICAgICAgICAgIGlmIChERVZfTU9ERSkge1xuICAgICAgICAgICAgaWYgKHBhcmVudE5vZGVOYW1lID09PSAnU1RZTEUnKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPVxuICAgICAgICAgICAgICAgIGBMaXQgZG9lcyBub3Qgc3VwcG9ydCBiaW5kaW5nIGluc2lkZSBzdHlsZSBub2Rlcy4gYCArXG4gICAgICAgICAgICAgICAgYFRoaXMgaXMgYSBzZWN1cml0eSByaXNrLCBhcyBzdHlsZSBpbmplY3Rpb24gYXR0YWNrcyBjYW4gYCArXG4gICAgICAgICAgICAgICAgYGV4ZmlsdHJhdGUgZGF0YSBhbmQgc3Bvb2YgVUlzLiBgICtcbiAgICAgICAgICAgICAgICBgQ29uc2lkZXIgaW5zdGVhZCB1c2luZyBjc3NcXGAuLi5cXGAgbGl0ZXJhbHMgYCArXG4gICAgICAgICAgICAgICAgYHRvIGNvbXBvc2Ugc3R5bGVzLCBhbmQgZG8gZHluYW1pYyBzdHlsaW5nIHdpdGggYCArXG4gICAgICAgICAgICAgICAgYGNzcyBjdXN0b20gcHJvcGVydGllcywgOjpwYXJ0cywgPHNsb3Q+cywgYCArXG4gICAgICAgICAgICAgICAgYGFuZCBieSBtdXRhdGluZyB0aGUgRE9NIHJhdGhlciB0aGFuIHN0eWxlc2hlZXRzLmA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtZXNzYWdlID1cbiAgICAgICAgICAgICAgICBgTGl0IGRvZXMgbm90IHN1cHBvcnQgYmluZGluZyBpbnNpZGUgc2NyaXB0IG5vZGVzLiBgICtcbiAgICAgICAgICAgICAgICBgVGhpcyBpcyBhIHNlY3VyaXR5IHJpc2ssIGFzIGl0IGNvdWxkIGFsbG93IGFyYml0cmFyeSBgICtcbiAgICAgICAgICAgICAgICBgY29kZSBleGVjdXRpb24uYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICdjb21taXQgbm9kZScsXG4gICAgICAgICAgc3RhcnQ6IHRoaXMuXyRzdGFydE5vZGUsXG4gICAgICAgICAgcGFyZW50OiB0aGlzLl8kcGFyZW50LFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgIH0pO1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gdGhpcy5faW5zZXJ0KHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb21taXRUZXh0KHZhbHVlOiB1bmtub3duKTogdm9pZCB7XG4gICAgLy8gSWYgdGhlIGNvbW1pdHRlZCB2YWx1ZSBpcyBhIHByaW1pdGl2ZSBpdCBtZWFucyB3ZSBjYWxsZWQgX2NvbW1pdFRleHQgb25cbiAgICAvLyB0aGUgcHJldmlvdXMgcmVuZGVyLCBhbmQgd2Uga25vdyB0aGF0IHRoaXMuXyRzdGFydE5vZGUubmV4dFNpYmxpbmcgaXMgYVxuICAgIC8vIFRleHQgbm9kZS4gV2UgY2FuIG5vdyBqdXN0IHJlcGxhY2UgdGhlIHRleHQgY29udGVudCAoLmRhdGEpIG9mIHRoZSBub2RlLlxuICAgIGlmIChcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSAhPT0gbm90aGluZyAmJlxuICAgICAgaXNQcmltaXRpdmUodGhpcy5fJGNvbW1pdHRlZFZhbHVlKVxuICAgICkge1xuICAgICAgY29uc3Qgbm9kZSA9IHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkubmV4dFNpYmxpbmcgYXMgVGV4dDtcbiAgICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgICAgaWYgKHRoaXMuX3RleHRTYW5pdGl6ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuX3RleHRTYW5pdGl6ZXIgPSBjcmVhdGVTYW5pdGl6ZXIobm9kZSwgJ2RhdGEnLCAncHJvcGVydHknKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZSA9IHRoaXMuX3RleHRTYW5pdGl6ZXIodmFsdWUpO1xuICAgICAgfVxuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAnY29tbWl0IHRleHQnLFxuICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICAgIChub2RlIGFzIFRleHQpLmRhdGEgPSB2YWx1ZSBhcyBzdHJpbmc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgICAgY29uc3QgdGV4dE5vZGUgPSBkLmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICAgICAgdGhpcy5fY29tbWl0Tm9kZSh0ZXh0Tm9kZSk7XG4gICAgICAgIC8vIFdoZW4gc2V0dGluZyB0ZXh0IGNvbnRlbnQsIGZvciBzZWN1cml0eSBwdXJwb3NlcyBpdCBtYXR0ZXJzIGEgbG90XG4gICAgICAgIC8vIHdoYXQgdGhlIHBhcmVudCBpcy4gRm9yIGV4YW1wbGUsIDxzdHlsZT4gYW5kIDxzY3JpcHQ+IG5lZWQgdG8gYmVcbiAgICAgICAgLy8gaGFuZGxlZCB3aXRoIGNhcmUsIHdoaWxlIDxzcGFuPiBkb2VzIG5vdC4gU28gZmlyc3Qgd2UgbmVlZCB0byBwdXQgYVxuICAgICAgICAvLyB0ZXh0IG5vZGUgaW50byB0aGUgZG9jdW1lbnQsIHRoZW4gd2UgY2FuIHNhbml0aXplIGl0cyBjb250ZW50LlxuICAgICAgICBpZiAodGhpcy5fdGV4dFNhbml0aXplciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5fdGV4dFNhbml0aXplciA9IGNyZWF0ZVNhbml0aXplcih0ZXh0Tm9kZSwgJ2RhdGEnLCAncHJvcGVydHknKTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZSA9IHRoaXMuX3RleHRTYW5pdGl6ZXIodmFsdWUpO1xuICAgICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAgICBraW5kOiAnY29tbWl0IHRleHQnLFxuICAgICAgICAgICAgbm9kZTogdGV4dE5vZGUsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgdGV4dE5vZGUuZGF0YSA9IHZhbHVlIGFzIHN0cmluZztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NvbW1pdE5vZGUoZC5jcmVhdGVUZXh0Tm9kZSh2YWx1ZSBhcyBzdHJpbmcpKTtcbiAgICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgICAga2luZDogJ2NvbW1pdCB0ZXh0JyxcbiAgICAgICAgICAgIG5vZGU6IHdyYXAodGhpcy5fJHN0YXJ0Tm9kZSkubmV4dFNpYmxpbmcgYXMgVGV4dCxcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbW1pdFRlbXBsYXRlUmVzdWx0KFxuICAgIHJlc3VsdDogVGVtcGxhdGVSZXN1bHQgfCBDb21waWxlZFRlbXBsYXRlUmVzdWx0XG4gICk6IHZvaWQge1xuICAgIC8vIFRoaXMgcHJvcGVydHkgbmVlZHMgdG8gcmVtYWluIHVubWluaWZpZWQuXG4gICAgY29uc3Qge3ZhbHVlcywgWydfJGxpdFR5cGUkJ106IHR5cGV9ID0gcmVzdWx0O1xuICAgIC8vIElmICRsaXRUeXBlJCBpcyBhIG51bWJlciwgcmVzdWx0IGlzIGEgcGxhaW4gVGVtcGxhdGVSZXN1bHQgYW5kIHdlIGdldFxuICAgIC8vIHRoZSB0ZW1wbGF0ZSBmcm9tIHRoZSB0ZW1wbGF0ZSBjYWNoZS4gSWYgbm90LCByZXN1bHQgaXMgYVxuICAgIC8vIENvbXBpbGVkVGVtcGxhdGVSZXN1bHQgYW5kIF8kbGl0VHlwZSQgaXMgYSBDb21waWxlZFRlbXBsYXRlIGFuZCB3ZSBuZWVkXG4gICAgLy8gdG8gY3JlYXRlIHRoZSA8dGVtcGxhdGU+IGVsZW1lbnQgdGhlIGZpcnN0IHRpbWUgd2Ugc2VlIGl0LlxuICAgIGNvbnN0IHRlbXBsYXRlOiBUZW1wbGF0ZSB8IENvbXBpbGVkVGVtcGxhdGUgPVxuICAgICAgdHlwZW9mIHR5cGUgPT09ICdudW1iZXInXG4gICAgICAgID8gdGhpcy5fJGdldFRlbXBsYXRlKHJlc3VsdCBhcyBVbmNvbXBpbGVkVGVtcGxhdGVSZXN1bHQpXG4gICAgICAgIDogKHR5cGUuZWwgPT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgKHR5cGUuZWwgPSBUZW1wbGF0ZS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICB0cnVzdEZyb21UZW1wbGF0ZVN0cmluZyh0eXBlLmgsIHR5cGUuaFswXSksXG4gICAgICAgICAgICAgIHRoaXMub3B0aW9uc1xuICAgICAgICAgICAgKSksXG4gICAgICAgICAgdHlwZSk7XG5cbiAgICBpZiAoKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBUZW1wbGF0ZUluc3RhbmNlKT8uXyR0ZW1wbGF0ZSA9PT0gdGVtcGxhdGUpIHtcbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ3RlbXBsYXRlIHVwZGF0aW5nJyxcbiAgICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgICBpbnN0YW5jZTogdGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIFRlbXBsYXRlSW5zdGFuY2UsXG4gICAgICAgICAgcGFydHM6ICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgVGVtcGxhdGVJbnN0YW5jZSkuXyRwYXJ0cyxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgdmFsdWVzLFxuICAgICAgICB9KTtcbiAgICAgICh0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgVGVtcGxhdGVJbnN0YW5jZSkuX3VwZGF0ZSh2YWx1ZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlIGFzIFRlbXBsYXRlLCB0aGlzKTtcbiAgICAgIGNvbnN0IGZyYWdtZW50ID0gaW5zdGFuY2UuX2Nsb25lKHRoaXMub3B0aW9ucyk7XG4gICAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICAgIGtpbmQ6ICd0ZW1wbGF0ZSBpbnN0YW50aWF0ZWQnLFxuICAgICAgICAgIHRlbXBsYXRlLFxuICAgICAgICAgIGluc3RhbmNlLFxuICAgICAgICAgIHBhcnRzOiBpbnN0YW5jZS5fJHBhcnRzLFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICBmcmFnbWVudCxcbiAgICAgICAgICB2YWx1ZXMsXG4gICAgICAgIH0pO1xuICAgICAgaW5zdGFuY2UuX3VwZGF0ZSh2YWx1ZXMpO1xuICAgICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAgICBraW5kOiAndGVtcGxhdGUgaW5zdGFudGlhdGVkIGFuZCB1cGRhdGVkJyxcbiAgICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgICBpbnN0YW5jZSxcbiAgICAgICAgICBwYXJ0czogaW5zdGFuY2UuXyRwYXJ0cyxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgZnJhZ21lbnQsXG4gICAgICAgICAgdmFsdWVzLFxuICAgICAgICB9KTtcbiAgICAgIHRoaXMuX2NvbW1pdE5vZGUoZnJhZ21lbnQpO1xuICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gaW5zdGFuY2U7XG4gICAgfVxuICB9XG5cbiAgLy8gT3ZlcnJpZGRlbiB2aWEgYGxpdEh0bWxQb2x5ZmlsbFN1cHBvcnRgIHRvIHByb3ZpZGUgcGxhdGZvcm0gc3VwcG9ydC5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGdldFRlbXBsYXRlKHJlc3VsdDogVW5jb21waWxlZFRlbXBsYXRlUmVzdWx0KSB7XG4gICAgbGV0IHRlbXBsYXRlID0gdGVtcGxhdGVDYWNoZS5nZXQocmVzdWx0LnN0cmluZ3MpO1xuICAgIGlmICh0ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0ZW1wbGF0ZUNhY2hlLnNldChyZXN1bHQuc3RyaW5ncywgKHRlbXBsYXRlID0gbmV3IFRlbXBsYXRlKHJlc3VsdCkpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29tbWl0SXRlcmFibGUodmFsdWU6IEl0ZXJhYmxlPHVua25vd24+KTogdm9pZCB7XG4gICAgLy8gRm9yIGFuIEl0ZXJhYmxlLCB3ZSBjcmVhdGUgYSBuZXcgSW5zdGFuY2VQYXJ0IHBlciBpdGVtLCB0aGVuIHNldCBpdHNcbiAgICAvLyB2YWx1ZSB0byB0aGUgaXRlbS4gVGhpcyBpcyBhIGxpdHRsZSBiaXQgb2Ygb3ZlcmhlYWQgZm9yIGV2ZXJ5IGl0ZW0gaW5cbiAgICAvLyBhbiBJdGVyYWJsZSwgYnV0IGl0IGxldHMgdXMgcmVjdXJzZSBlYXNpbHkgYW5kIGVmZmljaWVudGx5IHVwZGF0ZSBBcnJheXNcbiAgICAvLyBvZiBUZW1wbGF0ZVJlc3VsdHMgdGhhdCB3aWxsIGJlIGNvbW1vbmx5IHJldHVybmVkIGZyb20gZXhwcmVzc2lvbnMgbGlrZTpcbiAgICAvLyBhcnJheS5tYXAoKGkpID0+IGh0bWxgJHtpfWApLCBieSByZXVzaW5nIGV4aXN0aW5nIFRlbXBsYXRlSW5zdGFuY2VzLlxuXG4gICAgLy8gSWYgdmFsdWUgaXMgYW4gYXJyYXksIHRoZW4gdGhlIHByZXZpb3VzIHJlbmRlciB3YXMgb2YgYW5cbiAgICAvLyBpdGVyYWJsZSBhbmQgdmFsdWUgd2lsbCBjb250YWluIHRoZSBDaGlsZFBhcnRzIGZyb20gdGhlIHByZXZpb3VzXG4gICAgLy8gcmVuZGVyLiBJZiB2YWx1ZSBpcyBub3QgYW4gYXJyYXksIGNsZWFyIHRoaXMgcGFydCBhbmQgbWFrZSBhIG5ld1xuICAgIC8vIGFycmF5IGZvciBDaGlsZFBhcnRzLlxuICAgIGlmICghaXNBcnJheSh0aGlzLl8kY29tbWl0dGVkVmFsdWUpKSB7XG4gICAgICB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPSBbXTtcbiAgICAgIHRoaXMuXyRjbGVhcigpO1xuICAgIH1cblxuICAgIC8vIExldHMgdXMga2VlcCB0cmFjayBvZiBob3cgbWFueSBpdGVtcyB3ZSBzdGFtcGVkIHNvIHdlIGNhbiBjbGVhciBsZWZ0b3ZlclxuICAgIC8vIGl0ZW1zIGZyb20gYSBwcmV2aW91cyByZW5kZXJcbiAgICBjb25zdCBpdGVtUGFydHMgPSB0aGlzLl8kY29tbWl0dGVkVmFsdWUgYXMgQ2hpbGRQYXJ0W107XG4gICAgbGV0IHBhcnRJbmRleCA9IDA7XG4gICAgbGV0IGl0ZW1QYXJ0OiBDaGlsZFBhcnQgfCB1bmRlZmluZWQ7XG5cbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdmFsdWUpIHtcbiAgICAgIGlmIChwYXJ0SW5kZXggPT09IGl0ZW1QYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gSWYgbm8gZXhpc3RpbmcgcGFydCwgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgICAvLyBUT0RPIChqdXN0aW5mYWduYW5pKTogdGVzdCBwZXJmIGltcGFjdCBvZiBhbHdheXMgY3JlYXRpbmcgdHdvIHBhcnRzXG4gICAgICAgIC8vIGluc3RlYWQgb2Ygc2hhcmluZyBwYXJ0cyBiZXR3ZWVuIG5vZGVzXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9saXQvbGl0L2lzc3Vlcy8xMjY2XG4gICAgICAgIGl0ZW1QYXJ0cy5wdXNoKFxuICAgICAgICAgIChpdGVtUGFydCA9IG5ldyBDaGlsZFBhcnQoXG4gICAgICAgICAgICB0aGlzLl9pbnNlcnQoY3JlYXRlTWFya2VyKCkpLFxuICAgICAgICAgICAgdGhpcy5faW5zZXJ0KGNyZWF0ZU1hcmtlcigpKSxcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gUmV1c2UgYW4gZXhpc3RpbmcgcGFydFxuICAgICAgICBpdGVtUGFydCA9IGl0ZW1QYXJ0c1twYXJ0SW5kZXhdO1xuICAgICAgfVxuICAgICAgaXRlbVBhcnQuXyRzZXRWYWx1ZShpdGVtKTtcbiAgICAgIHBhcnRJbmRleCsrO1xuICAgIH1cblxuICAgIGlmIChwYXJ0SW5kZXggPCBpdGVtUGFydHMubGVuZ3RoKSB7XG4gICAgICAvLyBpdGVtUGFydHMgYWx3YXlzIGhhdmUgZW5kIG5vZGVzXG4gICAgICB0aGlzLl8kY2xlYXIoXG4gICAgICAgIGl0ZW1QYXJ0ICYmIHdyYXAoaXRlbVBhcnQuXyRlbmROb2RlISkubmV4dFNpYmxpbmcsXG4gICAgICAgIHBhcnRJbmRleFxuICAgICAgKTtcbiAgICAgIC8vIFRydW5jYXRlIHRoZSBwYXJ0cyBhcnJheSBzbyBfdmFsdWUgcmVmbGVjdHMgdGhlIGN1cnJlbnQgc3RhdGVcbiAgICAgIGl0ZW1QYXJ0cy5sZW5ndGggPSBwYXJ0SW5kZXg7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIG5vZGVzIGNvbnRhaW5lZCB3aXRoaW4gdGhpcyBQYXJ0IGZyb20gdGhlIERPTS5cbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0IFN0YXJ0IG5vZGUgdG8gY2xlYXIgZnJvbSwgZm9yIGNsZWFyaW5nIGEgc3Vic2V0IG9mIHRoZSBwYXJ0J3NcbiAgICogICAgIERPTSAodXNlZCB3aGVuIHRydW5jYXRpbmcgaXRlcmFibGVzKVxuICAgKiBAcGFyYW0gZnJvbSAgV2hlbiBgc3RhcnRgIGlzIHNwZWNpZmllZCwgdGhlIGluZGV4IHdpdGhpbiB0aGUgaXRlcmFibGUgZnJvbVxuICAgKiAgICAgd2hpY2ggQ2hpbGRQYXJ0cyBhcmUgYmVpbmcgcmVtb3ZlZCwgdXNlZCBmb3IgZGlzY29ubmVjdGluZyBkaXJlY3RpdmVzIGluXG4gICAqICAgICB0aG9zZSBQYXJ0cy5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfJGNsZWFyKFxuICAgIHN0YXJ0OiBDaGlsZE5vZGUgfCBudWxsID0gd3JhcCh0aGlzLl8kc3RhcnROb2RlKS5uZXh0U2libGluZyxcbiAgICBmcm9tPzogbnVtYmVyXG4gICkge1xuICAgIHRoaXMuXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZD8uKGZhbHNlLCB0cnVlLCBmcm9tKTtcbiAgICB3aGlsZSAoc3RhcnQgJiYgc3RhcnQgIT09IHRoaXMuXyRlbmROb2RlKSB7XG4gICAgICBjb25zdCBuID0gd3JhcChzdGFydCEpLm5leHRTaWJsaW5nO1xuICAgICAgKHdyYXAoc3RhcnQhKSBhcyBFbGVtZW50KS5yZW1vdmUoKTtcbiAgICAgIHN0YXJ0ID0gbjtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIFJvb3RQYXJ0J3MgYGlzQ29ubmVjdGVkYC4gTm90ZSB0aGF0IHRoaXMgbWV0aG9kXG4gICAqIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBvbiBgUm9vdFBhcnRgcyAodGhlIGBDaGlsZFBhcnRgIHJldHVybmVkIGZyb20gYVxuICAgKiB0b3AtbGV2ZWwgYHJlbmRlcigpYCBjYWxsKS4gSXQgaGFzIG5vIGVmZmVjdCBvbiBub24tcm9vdCBDaGlsZFBhcnRzLlxuICAgKiBAcGFyYW0gaXNDb25uZWN0ZWQgV2hldGhlciB0byBzZXRcbiAgICogQGludGVybmFsXG4gICAqL1xuICBzZXRDb25uZWN0ZWQoaXNDb25uZWN0ZWQ6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5fJHBhcmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9faXNDb25uZWN0ZWQgPSBpc0Nvbm5lY3RlZDtcbiAgICAgIHRoaXMuXyRub3RpZnlDb25uZWN0aW9uQ2hhbmdlZD8uKGlzQ29ubmVjdGVkKTtcbiAgICB9IGVsc2UgaWYgKERFVl9NT0RFKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdwYXJ0LnNldENvbm5lY3RlZCgpIG1heSBvbmx5IGJlIGNhbGxlZCBvbiBhICcgK1xuICAgICAgICAgICdSb290UGFydCByZXR1cm5lZCBmcm9tIHJlbmRlcigpLidcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQSB0b3AtbGV2ZWwgYENoaWxkUGFydGAgcmV0dXJuZWQgZnJvbSBgcmVuZGVyYCB0aGF0IG1hbmFnZXMgdGhlIGNvbm5lY3RlZFxuICogc3RhdGUgb2YgYEFzeW5jRGlyZWN0aXZlYHMgY3JlYXRlZCB0aHJvdWdob3V0IHRoZSB0cmVlIGJlbG93IGl0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFJvb3RQYXJ0IGV4dGVuZHMgQ2hpbGRQYXJ0IHtcbiAgLyoqXG4gICAqIFNldHMgdGhlIGNvbm5lY3Rpb24gc3RhdGUgZm9yIGBBc3luY0RpcmVjdGl2ZWBzIGNvbnRhaW5lZCB3aXRoaW4gdGhpcyByb290XG4gICAqIENoaWxkUGFydC5cbiAgICpcbiAgICogbGl0LWh0bWwgZG9lcyBub3QgYXV0b21hdGljYWxseSBtb25pdG9yIHRoZSBjb25uZWN0ZWRuZXNzIG9mIERPTSByZW5kZXJlZDtcbiAgICogYXMgc3VjaCwgaXQgaXMgdGhlIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSBjYWxsZXIgdG8gYHJlbmRlcmAgdG8gZW5zdXJlIHRoYXRcbiAgICogYHBhcnQuc2V0Q29ubmVjdGVkKGZhbHNlKWAgaXMgY2FsbGVkIGJlZm9yZSB0aGUgcGFydCBvYmplY3QgaXMgcG90ZW50aWFsbHlcbiAgICogZGlzY2FyZGVkLCB0byBlbnN1cmUgdGhhdCBgQXN5bmNEaXJlY3RpdmVgcyBoYXZlIGEgY2hhbmNlIHRvIGRpc3Bvc2Ugb2ZcbiAgICogYW55IHJlc291cmNlcyBiZWluZyBoZWxkLiBJZiBhIGBSb290UGFydGAgdGhhdCB3YXMgcHJldmlvdXNseVxuICAgKiBkaXNjb25uZWN0ZWQgaXMgc3Vic2VxdWVudGx5IHJlLWNvbm5lY3RlZCAoYW5kIGl0cyBgQXN5bmNEaXJlY3RpdmVgcyBzaG91bGRcbiAgICogcmUtY29ubmVjdCksIGBzZXRDb25uZWN0ZWQodHJ1ZSlgIHNob3VsZCBiZSBjYWxsZWQuXG4gICAqXG4gICAqIEBwYXJhbSBpc0Nvbm5lY3RlZCBXaGV0aGVyIGRpcmVjdGl2ZXMgd2l0aGluIHRoaXMgdHJlZSBzaG91bGQgYmUgY29ubmVjdGVkXG4gICAqIG9yIG5vdFxuICAgKi9cbiAgc2V0Q29ubmVjdGVkKGlzQ29ubmVjdGVkOiBib29sZWFuKTogdm9pZDtcbn1cblxuZXhwb3J0IHR5cGUge0F0dHJpYnV0ZVBhcnR9O1xuY2xhc3MgQXR0cmlidXRlUGFydCBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgcmVhZG9ubHkgdHlwZTpcbiAgICB8IHR5cGVvZiBBVFRSSUJVVEVfUEFSVFxuICAgIHwgdHlwZW9mIFBST1BFUlRZX1BBUlRcbiAgICB8IHR5cGVvZiBCT09MRUFOX0FUVFJJQlVURV9QQVJUXG4gICAgfCB0eXBlb2YgRVZFTlRfUEFSVCA9IEFUVFJJQlVURV9QQVJUO1xuICByZWFkb25seSBlbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICByZWFkb25seSBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBJZiB0aGlzIGF0dHJpYnV0ZSBwYXJ0IHJlcHJlc2VudHMgYW4gaW50ZXJwb2xhdGlvbiwgdGhpcyBjb250YWlucyB0aGVcbiAgICogc3RhdGljIHN0cmluZ3Mgb2YgdGhlIGludGVycG9sYXRpb24uIEZvciBzaW5nbGUtdmFsdWUsIGNvbXBsZXRlIGJpbmRpbmdzLFxuICAgKiB0aGlzIGlzIHVuZGVmaW5lZC5cbiAgICovXG4gIHJlYWRvbmx5IHN0cmluZ3M/OiBSZWFkb25seUFycmF5PHN0cmluZz47XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgXyRjb21taXR0ZWRWYWx1ZTogdW5rbm93biB8IEFycmF5PHVua25vd24+ID0gbm90aGluZztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfX2RpcmVjdGl2ZXM/OiBBcnJheTxEaXJlY3RpdmUgfCB1bmRlZmluZWQ+O1xuICAvKiogQGludGVybmFsICovXG4gIF8kcGFyZW50OiBEaXNjb25uZWN0YWJsZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+ID0gdW5kZWZpbmVkO1xuXG4gIHByb3RlY3RlZCBfc2FuaXRpemVyOiBWYWx1ZVNhbml0aXplciB8IHVuZGVmaW5lZDtcblxuICBnZXQgdGFnTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnRhZ05hbWU7XG4gIH1cblxuICAvLyBTZWUgY29tbWVudCBpbiBEaXNjb25uZWN0YWJsZSBpbnRlcmZhY2UgZm9yIHdoeSB0aGlzIGlzIGEgZ2V0dGVyXG4gIGdldCBfJGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl8kcGFyZW50Ll8kaXNDb25uZWN0ZWQ7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3RyaW5nczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LFxuICAgIHBhcmVudDogRGlzY29ubmVjdGFibGUsXG4gICAgb3B0aW9uczogUmVuZGVyT3B0aW9ucyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5fJHBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIGlmIChzdHJpbmdzLmxlbmd0aCA+IDIgfHwgc3RyaW5nc1swXSAhPT0gJycgfHwgc3RyaW5nc1sxXSAhPT0gJycpIHtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IG5ldyBBcnJheShzdHJpbmdzLmxlbmd0aCAtIDEpLmZpbGwobmV3IFN0cmluZygpKTtcbiAgICAgIHRoaXMuc3RyaW5ncyA9IHN0cmluZ3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IG5vdGhpbmc7XG4gICAgfVxuICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgIHRoaXMuX3Nhbml0aXplciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgdGhpcyBwYXJ0IGJ5IHJlc29sdmluZyB0aGUgdmFsdWUgZnJvbSBwb3NzaWJseSBtdWx0aXBsZVxuICAgKiB2YWx1ZXMgYW5kIHN0YXRpYyBzdHJpbmdzIGFuZCBjb21taXR0aW5nIGl0IHRvIHRoZSBET00uXG4gICAqIElmIHRoaXMgcGFydCBpcyBzaW5nbGUtdmFsdWVkLCBgdGhpcy5fc3RyaW5nc2Agd2lsbCBiZSB1bmRlZmluZWQsIGFuZCB0aGVcbiAgICogbWV0aG9kIHdpbGwgYmUgY2FsbGVkIHdpdGggYSBzaW5nbGUgdmFsdWUgYXJndW1lbnQuIElmIHRoaXMgcGFydCBpc1xuICAgKiBtdWx0aS12YWx1ZSwgYHRoaXMuX3N0cmluZ3NgIHdpbGwgYmUgZGVmaW5lZCwgYW5kIHRoZSBtZXRob2QgaXMgY2FsbGVkXG4gICAqIHdpdGggdGhlIHZhbHVlIGFycmF5IG9mIHRoZSBwYXJ0J3Mgb3duaW5nIFRlbXBsYXRlSW5zdGFuY2UsIGFuZCBhbiBvZmZzZXRcbiAgICogaW50byB0aGUgdmFsdWUgYXJyYXkgZnJvbSB3aGljaCB0aGUgdmFsdWVzIHNob3VsZCBiZSByZWFkLlxuICAgKiBUaGlzIG1ldGhvZCBpcyBvdmVybG9hZGVkIHRoaXMgd2F5IHRvIGVsaW1pbmF0ZSBzaG9ydC1saXZlZCBhcnJheSBzbGljZXNcbiAgICogb2YgdGhlIHRlbXBsYXRlIGluc3RhbmNlIHZhbHVlcywgYW5kIGFsbG93IGEgZmFzdC1wYXRoIGZvciBzaW5nbGUtdmFsdWVkXG4gICAqIHBhcnRzLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHBhcnQgdmFsdWUsIG9yIGFuIGFycmF5IG9mIHZhbHVlcyBmb3IgbXVsdGktdmFsdWVkIHBhcnRzXG4gICAqIEBwYXJhbSB2YWx1ZUluZGV4IHRoZSBpbmRleCB0byBzdGFydCByZWFkaW5nIHZhbHVlcyBmcm9tLiBgdW5kZWZpbmVkYCBmb3JcbiAgICogICBzaW5nbGUtdmFsdWVkIHBhcnRzXG4gICAqIEBwYXJhbSBub0NvbW1pdCBjYXVzZXMgdGhlIHBhcnQgdG8gbm90IGNvbW1pdCBpdHMgdmFsdWUgdG8gdGhlIERPTS4gVXNlZFxuICAgKiAgIGluIGh5ZHJhdGlvbiB0byBwcmltZSBhdHRyaWJ1dGUgcGFydHMgd2l0aCB0aGVpciBmaXJzdC1yZW5kZXJlZCB2YWx1ZSxcbiAgICogICBidXQgbm90IHNldCB0aGUgYXR0cmlidXRlLCBhbmQgaW4gU1NSIHRvIG5vLW9wIHRoZSBET00gb3BlcmF0aW9uIGFuZFxuICAgKiAgIGNhcHR1cmUgdGhlIHZhbHVlIGZvciBzZXJpYWxpemF0aW9uLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF8kc2V0VmFsdWUoXG4gICAgdmFsdWU6IHVua25vd24gfCBBcnJheTx1bmtub3duPixcbiAgICBkaXJlY3RpdmVQYXJlbnQ6IERpcmVjdGl2ZVBhcmVudCA9IHRoaXMsXG4gICAgdmFsdWVJbmRleD86IG51bWJlcixcbiAgICBub0NvbW1pdD86IGJvb2xlYW5cbiAgKSB7XG4gICAgY29uc3Qgc3RyaW5ncyA9IHRoaXMuc3RyaW5ncztcblxuICAgIC8vIFdoZXRoZXIgYW55IG9mIHRoZSB2YWx1ZXMgaGFzIGNoYW5nZWQsIGZvciBkaXJ0eS1jaGVja2luZ1xuICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcblxuICAgIGlmIChzdHJpbmdzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFNpbmdsZS12YWx1ZSBiaW5kaW5nIGNhc2VcbiAgICAgIHZhbHVlID0gcmVzb2x2ZURpcmVjdGl2ZSh0aGlzLCB2YWx1ZSwgZGlyZWN0aXZlUGFyZW50LCAwKTtcbiAgICAgIGNoYW5nZSA9XG4gICAgICAgICFpc1ByaW1pdGl2ZSh2YWx1ZSkgfHxcbiAgICAgICAgKHZhbHVlICE9PSB0aGlzLl8kY29tbWl0dGVkVmFsdWUgJiYgdmFsdWUgIT09IG5vQ2hhbmdlKTtcbiAgICAgIGlmIChjaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5fJGNvbW1pdHRlZFZhbHVlID0gdmFsdWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEludGVycG9sYXRpb24gY2FzZVxuICAgICAgY29uc3QgdmFsdWVzID0gdmFsdWUgYXMgQXJyYXk8dW5rbm93bj47XG4gICAgICB2YWx1ZSA9IHN0cmluZ3NbMF07XG5cbiAgICAgIGxldCBpLCB2O1xuICAgICAgZm9yIChpID0gMDsgaSA8IHN0cmluZ3MubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIHYgPSByZXNvbHZlRGlyZWN0aXZlKHRoaXMsIHZhbHVlc1t2YWx1ZUluZGV4ISArIGldLCBkaXJlY3RpdmVQYXJlbnQsIGkpO1xuXG4gICAgICAgIGlmICh2ID09PSBub0NoYW5nZSkge1xuICAgICAgICAgIC8vIElmIHRoZSB1c2VyLXByb3ZpZGVkIHZhbHVlIGlzIGBub0NoYW5nZWAsIHVzZSB0aGUgcHJldmlvdXMgdmFsdWVcbiAgICAgICAgICB2ID0gKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBBcnJheTx1bmtub3duPilbaV07XG4gICAgICAgIH1cbiAgICAgICAgY2hhbmdlIHx8PVxuICAgICAgICAgICFpc1ByaW1pdGl2ZSh2KSB8fCB2ICE9PSAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIEFycmF5PHVua25vd24+KVtpXTtcbiAgICAgICAgaWYgKHYgPT09IG5vdGhpbmcpIHtcbiAgICAgICAgICB2YWx1ZSA9IG5vdGhpbmc7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgIT09IG5vdGhpbmcpIHtcbiAgICAgICAgICB2YWx1ZSArPSAodiA/PyAnJykgKyBzdHJpbmdzW2kgKyAxXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSBhbHdheXMgcmVjb3JkIGVhY2ggdmFsdWUsIGV2ZW4gaWYgb25lIGlzIGBub3RoaW5nYCwgZm9yIGZ1dHVyZVxuICAgICAgICAvLyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgICAgICAodGhpcy5fJGNvbW1pdHRlZFZhbHVlIGFzIEFycmF5PHVua25vd24+KVtpXSA9IHY7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjaGFuZ2UgJiYgIW5vQ29tbWl0KSB7XG4gICAgICB0aGlzLl9jb21taXRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29tbWl0VmFsdWUodmFsdWU6IHVua25vd24pIHtcbiAgICBpZiAodmFsdWUgPT09IG5vdGhpbmcpIHtcbiAgICAgICh3cmFwKHRoaXMuZWxlbWVudCkgYXMgRWxlbWVudCkucmVtb3ZlQXR0cmlidXRlKHRoaXMubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgICAgaWYgKHRoaXMuX3Nhbml0aXplciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5fc2FuaXRpemVyID0gc2FuaXRpemVyRmFjdG9yeUludGVybmFsKFxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICAgICAgJ2F0dHJpYnV0ZSdcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlID0gdGhpcy5fc2FuaXRpemVyKHZhbHVlID8/ICcnKTtcbiAgICAgIH1cbiAgICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgICAga2luZDogJ2NvbW1pdCBhdHRyaWJ1dGUnLFxuICAgICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICAgICAgICB9KTtcbiAgICAgICh3cmFwKHRoaXMuZWxlbWVudCkgYXMgRWxlbWVudCkuc2V0QXR0cmlidXRlKFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgICh2YWx1ZSA/PyAnJykgYXMgc3RyaW5nXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgdHlwZSB7UHJvcGVydHlQYXJ0fTtcbmNsYXNzIFByb3BlcnR5UGFydCBleHRlbmRzIEF0dHJpYnV0ZVBhcnQge1xuICBvdmVycmlkZSByZWFkb25seSB0eXBlID0gUFJPUEVSVFlfUEFSVDtcblxuICAvKiogQGludGVybmFsICovXG4gIG92ZXJyaWRlIF9jb21taXRWYWx1ZSh2YWx1ZTogdW5rbm93bikge1xuICAgIGlmIChFTkFCTEVfRVhUUkFfU0VDVVJJVFlfSE9PS1MpIHtcbiAgICAgIGlmICh0aGlzLl9zYW5pdGl6ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLl9zYW5pdGl6ZXIgPSBzYW5pdGl6ZXJGYWN0b3J5SW50ZXJuYWwoXG4gICAgICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgICAncHJvcGVydHknXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB2YWx1ZSA9IHRoaXMuX3Nhbml0aXplcih2YWx1ZSk7XG4gICAgfVxuICAgIGRlYnVnTG9nRXZlbnQgJiZcbiAgICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAgICBraW5kOiAnY29tbWl0IHByb3BlcnR5JyxcbiAgICAgICAgZWxlbWVudDogdGhpcy5lbGVtZW50LFxuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICB9KTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICh0aGlzLmVsZW1lbnQgYXMgYW55KVt0aGlzLm5hbWVdID0gdmFsdWUgPT09IG5vdGhpbmcgPyB1bmRlZmluZWQgOiB2YWx1ZTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSB7Qm9vbGVhbkF0dHJpYnV0ZVBhcnR9O1xuY2xhc3MgQm9vbGVhbkF0dHJpYnV0ZVBhcnQgZXh0ZW5kcyBBdHRyaWJ1dGVQYXJ0IHtcbiAgb3ZlcnJpZGUgcmVhZG9ubHkgdHlwZSA9IEJPT0xFQU5fQVRUUklCVVRFX1BBUlQ7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfY29tbWl0VmFsdWUodmFsdWU6IHVua25vd24pIHtcbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ2NvbW1pdCBib29sZWFuIGF0dHJpYnV0ZScsXG4gICAgICAgIGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgICB2YWx1ZTogISEodmFsdWUgJiYgdmFsdWUgIT09IG5vdGhpbmcpLFxuICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICB9KTtcbiAgICAod3JhcCh0aGlzLmVsZW1lbnQpIGFzIEVsZW1lbnQpLnRvZ2dsZUF0dHJpYnV0ZShcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgICEhdmFsdWUgJiYgdmFsdWUgIT09IG5vdGhpbmdcbiAgICApO1xuICB9XG59XG5cbnR5cGUgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zID0gRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCAmXG4gIFBhcnRpYWw8QWRkRXZlbnRMaXN0ZW5lck9wdGlvbnM+O1xuXG4vKipcbiAqIEFuIEF0dHJpYnV0ZVBhcnQgdGhhdCBtYW5hZ2VzIGFuIGV2ZW50IGxpc3RlbmVyIHZpYSBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lci5cbiAqXG4gKiBUaGlzIHBhcnQgd29ya3MgYnkgYWRkaW5nIGl0c2VsZiBhcyB0aGUgZXZlbnQgbGlzdGVuZXIgb24gYW4gZWxlbWVudCwgdGhlblxuICogZGVsZWdhdGluZyB0byB0aGUgdmFsdWUgcGFzc2VkIHRvIGl0LiBUaGlzIHJlZHVjZXMgdGhlIG51bWJlciBvZiBjYWxscyB0b1xuICogYWRkL3JlbW92ZUV2ZW50TGlzdGVuZXIgaWYgdGhlIGxpc3RlbmVyIGNoYW5nZXMgZnJlcXVlbnRseSwgc3VjaCBhcyB3aGVuIGFuXG4gKiBpbmxpbmUgZnVuY3Rpb24gaXMgdXNlZCBhcyBhIGxpc3RlbmVyLlxuICpcbiAqIEJlY2F1c2UgZXZlbnQgb3B0aW9ucyBhcmUgcGFzc2VkIHdoZW4gYWRkaW5nIGxpc3RlbmVycywgd2UgbXVzdCB0YWtlIGNhc2VcbiAqIHRvIGFkZCBhbmQgcmVtb3ZlIHRoZSBwYXJ0IGFzIGEgbGlzdGVuZXIgd2hlbiB0aGUgZXZlbnQgb3B0aW9ucyBjaGFuZ2UuXG4gKi9cbmV4cG9ydCB0eXBlIHtFdmVudFBhcnR9O1xuY2xhc3MgRXZlbnRQYXJ0IGV4dGVuZHMgQXR0cmlidXRlUGFydCB7XG4gIG92ZXJyaWRlIHJlYWRvbmx5IHR5cGUgPSBFVkVOVF9QQVJUO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzdHJpbmdzOiBSZWFkb25seUFycmF5PHN0cmluZz4sXG4gICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSxcbiAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnQsIG5hbWUsIHN0cmluZ3MsIHBhcmVudCwgb3B0aW9ucyk7XG5cbiAgICBpZiAoREVWX01PREUgJiYgdGhpcy5zdHJpbmdzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEEgXFxgPCR7ZWxlbWVudC5sb2NhbE5hbWV9PlxcYCBoYXMgYSBcXGBAJHtuYW1lfT0uLi5cXGAgbGlzdGVuZXIgd2l0aCBgICtcbiAgICAgICAgICAnaW52YWxpZCBjb250ZW50LiBFdmVudCBsaXN0ZW5lcnMgaW4gdGVtcGxhdGVzIG11c3QgaGF2ZSBleGFjdGx5ICcgK1xuICAgICAgICAgICdvbmUgZXhwcmVzc2lvbiBhbmQgbm8gc3Vycm91bmRpbmcgdGV4dC4nXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIEV2ZW50UGFydCBkb2VzIG5vdCB1c2UgdGhlIGJhc2UgXyRzZXRWYWx1ZS9fcmVzb2x2ZVZhbHVlIGltcGxlbWVudGF0aW9uXG4gIC8vIHNpbmNlIHRoZSBkaXJ0eSBjaGVja2luZyBpcyBtb3JlIGNvbXBsZXhcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBvdmVycmlkZSBfJHNldFZhbHVlKFxuICAgIG5ld0xpc3RlbmVyOiB1bmtub3duLFxuICAgIGRpcmVjdGl2ZVBhcmVudDogRGlyZWN0aXZlUGFyZW50ID0gdGhpc1xuICApIHtcbiAgICBuZXdMaXN0ZW5lciA9XG4gICAgICByZXNvbHZlRGlyZWN0aXZlKHRoaXMsIG5ld0xpc3RlbmVyLCBkaXJlY3RpdmVQYXJlbnQsIDApID8/IG5vdGhpbmc7XG4gICAgaWYgKG5ld0xpc3RlbmVyID09PSBub0NoYW5nZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBvbGRMaXN0ZW5lciA9IHRoaXMuXyRjb21taXR0ZWRWYWx1ZTtcblxuICAgIC8vIElmIHRoZSBuZXcgdmFsdWUgaXMgbm90aGluZyBvciBhbnkgb3B0aW9ucyBjaGFuZ2Ugd2UgaGF2ZSB0byByZW1vdmUgdGhlXG4gICAgLy8gcGFydCBhcyBhIGxpc3RlbmVyLlxuICAgIGNvbnN0IHNob3VsZFJlbW92ZUxpc3RlbmVyID1cbiAgICAgIChuZXdMaXN0ZW5lciA9PT0gbm90aGluZyAmJiBvbGRMaXN0ZW5lciAhPT0gbm90aGluZykgfHxcbiAgICAgIChuZXdMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLmNhcHR1cmUgIT09XG4gICAgICAgIChvbGRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLmNhcHR1cmUgfHxcbiAgICAgIChuZXdMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLm9uY2UgIT09XG4gICAgICAgIChvbGRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLm9uY2UgfHxcbiAgICAgIChuZXdMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLnBhc3NpdmUgIT09XG4gICAgICAgIChvbGRMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnMpLnBhc3NpdmU7XG5cbiAgICAvLyBJZiB0aGUgbmV3IHZhbHVlIGlzIG5vdCBub3RoaW5nIGFuZCB3ZSByZW1vdmVkIHRoZSBsaXN0ZW5lciwgd2UgaGF2ZVxuICAgIC8vIHRvIGFkZCB0aGUgcGFydCBhcyBhIGxpc3RlbmVyLlxuICAgIGNvbnN0IHNob3VsZEFkZExpc3RlbmVyID1cbiAgICAgIG5ld0xpc3RlbmVyICE9PSBub3RoaW5nICYmXG4gICAgICAob2xkTGlzdGVuZXIgPT09IG5vdGhpbmcgfHwgc2hvdWxkUmVtb3ZlTGlzdGVuZXIpO1xuXG4gICAgZGVidWdMb2dFdmVudCAmJlxuICAgICAgZGVidWdMb2dFdmVudCh7XG4gICAgICAgIGtpbmQ6ICdjb21taXQgZXZlbnQgbGlzdGVuZXInLFxuICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgdmFsdWU6IG5ld0xpc3RlbmVyLFxuICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgIHJlbW92ZUxpc3RlbmVyOiBzaG91bGRSZW1vdmVMaXN0ZW5lcixcbiAgICAgICAgYWRkTGlzdGVuZXI6IHNob3VsZEFkZExpc3RlbmVyLFxuICAgICAgICBvbGRMaXN0ZW5lcixcbiAgICAgIH0pO1xuICAgIGlmIChzaG91bGRSZW1vdmVMaXN0ZW5lcikge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgdGhpcyxcbiAgICAgICAgb2xkTGlzdGVuZXIgYXMgRXZlbnRMaXN0ZW5lcldpdGhPcHRpb25zXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoc2hvdWxkQWRkTGlzdGVuZXIpIHtcbiAgICAgIC8vIEJld2FyZTogSUUxMSBhbmQgQ2hyb21lIDQxIGRvbid0IGxpa2UgdXNpbmcgdGhlIGxpc3RlbmVyIGFzIHRoZVxuICAgICAgLy8gb3B0aW9ucyBvYmplY3QuIEZpZ3VyZSBvdXQgaG93IHRvIGRlYWwgdy8gdGhpcyBpbiBJRTExIC0gbWF5YmVcbiAgICAgIC8vIHBhdGNoIGFkZEV2ZW50TGlzdGVuZXI/XG4gICAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB0aGlzLFxuICAgICAgICBuZXdMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyV2l0aE9wdGlvbnNcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZSA9IG5ld0xpc3RlbmVyO1xuICB9XG5cbiAgaGFuZGxlRXZlbnQoZXZlbnQ6IEV2ZW50KSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLl8kY29tbWl0dGVkVmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuXyRjb21taXR0ZWRWYWx1ZS5jYWxsKHRoaXMub3B0aW9ucz8uaG9zdCA/PyB0aGlzLmVsZW1lbnQsIGV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgKHRoaXMuXyRjb21taXR0ZWRWYWx1ZSBhcyBFdmVudExpc3RlbmVyT2JqZWN0KS5oYW5kbGVFdmVudChldmVudCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIHtFbGVtZW50UGFydH07XG5jbGFzcyBFbGVtZW50UGFydCBpbXBsZW1lbnRzIERpc2Nvbm5lY3RhYmxlIHtcbiAgcmVhZG9ubHkgdHlwZSA9IEVMRU1FTlRfUEFSVDtcblxuICAvKiogQGludGVybmFsICovXG4gIF9fZGlyZWN0aXZlPzogRGlyZWN0aXZlO1xuXG4gIC8vIFRoaXMgaXMgdG8gZW5zdXJlIHRoYXQgZXZlcnkgUGFydCBoYXMgYSBfJGNvbW1pdHRlZFZhbHVlXG4gIF8kY29tbWl0dGVkVmFsdWU6IHVuZGVmaW5lZDtcblxuICAvKiogQGludGVybmFsICovXG4gIF8kcGFyZW50ITogRGlzY29ubmVjdGFibGU7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4/OiBTZXQ8RGlzY29ubmVjdGFibGU+ID0gdW5kZWZpbmVkO1xuXG4gIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsZW1lbnQ6IEVsZW1lbnQsXG4gICAgcGFyZW50OiBEaXNjb25uZWN0YWJsZSxcbiAgICBvcHRpb25zOiBSZW5kZXJPcHRpb25zIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHRoaXMuXyRwYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIC8vIFNlZSBjb21tZW50IGluIERpc2Nvbm5lY3RhYmxlIGludGVyZmFjZSBmb3Igd2h5IHRoaXMgaXMgYSBnZXR0ZXJcbiAgZ2V0IF8kaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRwYXJlbnQuXyRpc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIF8kc2V0VmFsdWUodmFsdWU6IHVua25vd24pOiB2b2lkIHtcbiAgICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgICBkZWJ1Z0xvZ0V2ZW50KHtcbiAgICAgICAga2luZDogJ2NvbW1pdCB0byBlbGVtZW50IGJpbmRpbmcnLFxuICAgICAgICBlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICB9KTtcbiAgICByZXNvbHZlRGlyZWN0aXZlKHRoaXMsIHZhbHVlKTtcbiAgfVxufVxuXG4vKipcbiAqIEVORCBVU0VSUyBTSE9VTEQgTk9UIFJFTFkgT04gVEhJUyBPQkpFQ1QuXG4gKlxuICogUHJpdmF0ZSBleHBvcnRzIGZvciB1c2UgYnkgb3RoZXIgTGl0IHBhY2thZ2VzLCBub3QgaW50ZW5kZWQgZm9yIHVzZSBieVxuICogZXh0ZXJuYWwgdXNlcnMuXG4gKlxuICogV2UgY3VycmVudGx5IGRvIG5vdCBtYWtlIGEgbWFuZ2xlZCByb2xsdXAgYnVpbGQgb2YgdGhlIGxpdC1zc3IgY29kZS4gSW4gb3JkZXJcbiAqIHRvIGtlZXAgYSBudW1iZXIgb2YgKG90aGVyd2lzZSBwcml2YXRlKSB0b3AtbGV2ZWwgZXhwb3J0cyBtYW5nbGVkIGluIHRoZVxuICogY2xpZW50IHNpZGUgY29kZSwgd2UgZXhwb3J0IGEgXyRMSCBvYmplY3QgY29udGFpbmluZyB0aG9zZSBtZW1iZXJzIChvclxuICogaGVscGVyIG1ldGhvZHMgZm9yIGFjY2Vzc2luZyBwcml2YXRlIGZpZWxkcyBvZiB0aG9zZSBtZW1iZXJzKSwgYW5kIHRoZW5cbiAqIHJlLWV4cG9ydCB0aGVtIGZvciB1c2UgaW4gbGl0LXNzci4gVGhpcyBrZWVwcyBsaXQtc3NyIGFnbm9zdGljIHRvIHdoZXRoZXIgdGhlXG4gKiBjbGllbnQtc2lkZSBjb2RlIGlzIGJlaW5nIHVzZWQgaW4gYGRldmAgbW9kZSBvciBgcHJvZGAgbW9kZS5cbiAqXG4gKiBUaGlzIGhhcyBhIHVuaXF1ZSBuYW1lLCB0byBkaXNhbWJpZ3VhdGUgaXQgZnJvbSBwcml2YXRlIGV4cG9ydHMgaW5cbiAqIGxpdC1lbGVtZW50LCB3aGljaCByZS1leHBvcnRzIGFsbCBvZiBsaXQtaHRtbC5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgXyRMSCA9IHtcbiAgLy8gVXNlZCBpbiBsaXQtc3NyXG4gIF9ib3VuZEF0dHJpYnV0ZVN1ZmZpeDogYm91bmRBdHRyaWJ1dGVTdWZmaXgsXG4gIF9tYXJrZXI6IG1hcmtlcixcbiAgX21hcmtlck1hdGNoOiBtYXJrZXJNYXRjaCxcbiAgX0hUTUxfUkVTVUxUOiBIVE1MX1JFU1VMVCxcbiAgX2dldFRlbXBsYXRlSHRtbDogZ2V0VGVtcGxhdGVIdG1sLFxuICAvLyBVc2VkIGluIHRlc3RzIGFuZCBwcml2YXRlLXNzci1zdXBwb3J0XG4gIF9UZW1wbGF0ZUluc3RhbmNlOiBUZW1wbGF0ZUluc3RhbmNlLFxuICBfaXNJdGVyYWJsZTogaXNJdGVyYWJsZSxcbiAgX3Jlc29sdmVEaXJlY3RpdmU6IHJlc29sdmVEaXJlY3RpdmUsXG4gIF9DaGlsZFBhcnQ6IENoaWxkUGFydCxcbiAgX0F0dHJpYnV0ZVBhcnQ6IEF0dHJpYnV0ZVBhcnQsXG4gIF9Cb29sZWFuQXR0cmlidXRlUGFydDogQm9vbGVhbkF0dHJpYnV0ZVBhcnQsXG4gIF9FdmVudFBhcnQ6IEV2ZW50UGFydCxcbiAgX1Byb3BlcnR5UGFydDogUHJvcGVydHlQYXJ0LFxuICBfRWxlbWVudFBhcnQ6IEVsZW1lbnRQYXJ0LFxufTtcblxuLy8gQXBwbHkgcG9seWZpbGxzIGlmIGF2YWlsYWJsZVxuY29uc3QgcG9seWZpbGxTdXBwb3J0ID0gREVWX01PREVcbiAgPyBnbG9iYWwubGl0SHRtbFBvbHlmaWxsU3VwcG9ydERldk1vZGVcbiAgOiBnbG9iYWwubGl0SHRtbFBvbHlmaWxsU3VwcG9ydDtcbnBvbHlmaWxsU3VwcG9ydD8uKFRlbXBsYXRlLCBDaGlsZFBhcnQpO1xuXG4vLyBJTVBPUlRBTlQ6IGRvIG5vdCBjaGFuZ2UgdGhlIHByb3BlcnR5IG5hbWUgb3IgdGhlIGFzc2lnbm1lbnQgZXhwcmVzc2lvbi5cbi8vIFRoaXMgbGluZSB3aWxsIGJlIHVzZWQgaW4gcmVnZXhlcyB0byBzZWFyY2ggZm9yIGxpdC1odG1sIHVzYWdlLlxuKGdsb2JhbC5saXRIdG1sVmVyc2lvbnMgPz89IFtdKS5wdXNoKCczLjIuMScpO1xuaWYgKERFVl9NT0RFICYmIGdsb2JhbC5saXRIdG1sVmVyc2lvbnMubGVuZ3RoID4gMSkge1xuICBpc3N1ZVdhcm5pbmchKFxuICAgICdtdWx0aXBsZS12ZXJzaW9ucycsXG4gICAgYE11bHRpcGxlIHZlcnNpb25zIG9mIExpdCBsb2FkZWQuIGAgK1xuICAgICAgYExvYWRpbmcgbXVsdGlwbGUgdmVyc2lvbnMgaXMgbm90IHJlY29tbWVuZGVkLmBcbiAgKTtcbn1cblxuLyoqXG4gKiBSZW5kZXJzIGEgdmFsdWUsIHVzdWFsbHkgYSBsaXQtaHRtbCBUZW1wbGF0ZVJlc3VsdCwgdG8gdGhlIGNvbnRhaW5lci5cbiAqXG4gKiBUaGlzIGV4YW1wbGUgcmVuZGVycyB0aGUgdGV4dCBcIkhlbGxvLCBab2UhXCIgaW5zaWRlIGEgcGFyYWdyYXBoIHRhZywgYXBwZW5kaW5nXG4gKiBpdCB0byB0aGUgY29udGFpbmVyIGBkb2N1bWVudC5ib2R5YC5cbiAqXG4gKiBgYGBqc1xuICogaW1wb3J0IHtodG1sLCByZW5kZXJ9IGZyb20gJ2xpdCc7XG4gKlxuICogY29uc3QgbmFtZSA9IFwiWm9lXCI7XG4gKiByZW5kZXIoaHRtbGA8cD5IZWxsbywgJHtuYW1lfSE8L3A+YCwgZG9jdW1lbnQuYm9keSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gdmFsdWUgQW55IFtyZW5kZXJhYmxlXG4gKiAgIHZhbHVlXShodHRwczovL2xpdC5kZXYvZG9jcy90ZW1wbGF0ZXMvZXhwcmVzc2lvbnMvI2NoaWxkLWV4cHJlc3Npb25zKSxcbiAqICAgdHlwaWNhbGx5IGEge0BsaW5rY29kZSBUZW1wbGF0ZVJlc3VsdH0gY3JlYXRlZCBieSBldmFsdWF0aW5nIGEgdGVtcGxhdGUgdGFnXG4gKiAgIGxpa2Uge0BsaW5rY29kZSBodG1sfSBvciB7QGxpbmtjb2RlIHN2Z30uXG4gKiBAcGFyYW0gY29udGFpbmVyIEEgRE9NIGNvbnRhaW5lciB0byByZW5kZXIgdG8uIFRoZSBmaXJzdCByZW5kZXIgd2lsbCBhcHBlbmRcbiAqICAgdGhlIHJlbmRlcmVkIHZhbHVlIHRvIHRoZSBjb250YWluZXIsIGFuZCBzdWJzZXF1ZW50IHJlbmRlcnMgd2lsbFxuICogICBlZmZpY2llbnRseSB1cGRhdGUgdGhlIHJlbmRlcmVkIHZhbHVlIGlmIHRoZSBzYW1lIHJlc3VsdCB0eXBlIHdhc1xuICogICBwcmV2aW91c2x5IHJlbmRlcmVkIHRoZXJlLlxuICogQHBhcmFtIG9wdGlvbnMgU2VlIHtAbGlua2NvZGUgUmVuZGVyT3B0aW9uc30gZm9yIG9wdGlvbnMgZG9jdW1lbnRhdGlvbi5cbiAqIEBzZWVcbiAqIHtAbGluayBodHRwczovL2xpdC5kZXYvZG9jcy9saWJyYXJpZXMvc3RhbmRhbG9uZS10ZW1wbGF0ZXMvI3JlbmRlcmluZy1saXQtaHRtbC10ZW1wbGF0ZXN8IFJlbmRlcmluZyBMaXQgSFRNTCBUZW1wbGF0ZXN9XG4gKi9cbmV4cG9ydCBjb25zdCByZW5kZXIgPSAoXG4gIHZhbHVlOiB1bmtub3duLFxuICBjb250YWluZXI6IEhUTUxFbGVtZW50IHwgRG9jdW1lbnRGcmFnbWVudCxcbiAgb3B0aW9ucz86IFJlbmRlck9wdGlvbnNcbik6IFJvb3RQYXJ0ID0+IHtcbiAgaWYgKERFVl9NT0RFICYmIGNvbnRhaW5lciA9PSBudWxsKSB7XG4gICAgLy8gR2l2ZSBhIGNsZWFyZXIgZXJyb3IgbWVzc2FnZSB0aGFuXG4gICAgLy8gICAgIFVuY2F1Z2h0IFR5cGVFcnJvcjogQ2Fubm90IHJlYWQgcHJvcGVydGllcyBvZiBudWxsIChyZWFkaW5nXG4gICAgLy8gICAgICdfJGxpdFBhcnQkJylcbiAgICAvLyB3aGljaCByZWFkcyBsaWtlIGFuIGludGVybmFsIExpdCBlcnJvci5cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBUaGUgY29udGFpbmVyIHRvIHJlbmRlciBpbnRvIG1heSBub3QgYmUgJHtjb250YWluZXJ9YCk7XG4gIH1cbiAgY29uc3QgcmVuZGVySWQgPSBERVZfTU9ERSA/IGRlYnVnTG9nUmVuZGVySWQrKyA6IDA7XG4gIGNvbnN0IHBhcnRPd25lck5vZGUgPSBvcHRpb25zPy5yZW5kZXJCZWZvcmUgPz8gY29udGFpbmVyO1xuICAvLyBUaGlzIHByb3BlcnR5IG5lZWRzIHRvIHJlbWFpbiB1bm1pbmlmaWVkLlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBsZXQgcGFydDogQ2hpbGRQYXJ0ID0gKHBhcnRPd25lck5vZGUgYXMgYW55KVsnXyRsaXRQYXJ0JCddO1xuICBkZWJ1Z0xvZ0V2ZW50ICYmXG4gICAgZGVidWdMb2dFdmVudCh7XG4gICAgICBraW5kOiAnYmVnaW4gcmVuZGVyJyxcbiAgICAgIGlkOiByZW5kZXJJZCxcbiAgICAgIHZhbHVlLFxuICAgICAgY29udGFpbmVyLFxuICAgICAgb3B0aW9ucyxcbiAgICAgIHBhcnQsXG4gICAgfSk7XG4gIGlmIChwYXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBlbmROb2RlID0gb3B0aW9ucz8ucmVuZGVyQmVmb3JlID8/IG51bGw7XG4gICAgLy8gVGhpcyBwcm9wZXJ0eSBuZWVkcyB0byByZW1haW4gdW5taW5pZmllZC5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIChwYXJ0T3duZXJOb2RlIGFzIGFueSlbJ18kbGl0UGFydCQnXSA9IHBhcnQgPSBuZXcgQ2hpbGRQYXJ0KFxuICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShjcmVhdGVNYXJrZXIoKSwgZW5kTm9kZSksXG4gICAgICBlbmROb2RlLFxuICAgICAgdW5kZWZpbmVkLFxuICAgICAgb3B0aW9ucyA/PyB7fVxuICAgICk7XG4gIH1cbiAgcGFydC5fJHNldFZhbHVlKHZhbHVlKTtcbiAgZGVidWdMb2dFdmVudCAmJlxuICAgIGRlYnVnTG9nRXZlbnQoe1xuICAgICAga2luZDogJ2VuZCByZW5kZXInLFxuICAgICAgaWQ6IHJlbmRlcklkLFxuICAgICAgdmFsdWUsXG4gICAgICBjb250YWluZXIsXG4gICAgICBvcHRpb25zLFxuICAgICAgcGFydCxcbiAgICB9KTtcbiAgcmV0dXJuIHBhcnQgYXMgUm9vdFBhcnQ7XG59O1xuXG5pZiAoRU5BQkxFX0VYVFJBX1NFQ1VSSVRZX0hPT0tTKSB7XG4gIHJlbmRlci5zZXRTYW5pdGl6ZXIgPSBzZXRTYW5pdGl6ZXI7XG4gIHJlbmRlci5jcmVhdGVTYW5pdGl6ZXIgPSBjcmVhdGVTYW5pdGl6ZXI7XG4gIGlmIChERVZfTU9ERSkge1xuICAgIHJlbmRlci5fdGVzdE9ubHlDbGVhclNhbml0aXplckZhY3RvcnlEb05vdENhbGxPckVsc2UgPVxuICAgICAgX3Rlc3RPbmx5Q2xlYXJTYW5pdGl6ZXJGYWN0b3J5RG9Ob3RDYWxsT3JFbHNlO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgVGFzayB9IGZyb20gXCIuLi9jaGFydC9jaGFydFwiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW5cIjtcbmltcG9ydCB7IFByZWNpc2lvbiB9IGZyb20gXCIuLi9wcmVjaXNpb24vcHJlY2lzaW9uXCI7XG5pbXBvcnQgeyBDb21wdXRlU2xhY2ssIENyaXRpY2FsUGF0aCB9IGZyb20gXCIuLi9zbGFjay9zbGFja1wiO1xuaW1wb3J0IHsgSmFjb2JpYW4sIFVuY2VydGFpbnR5IH0gZnJvbSBcIi4uL3N0YXRzL2NkZi90cmlhbmd1bGFyL2phY29iaWFuXCI7XG5cbmNvbnN0IE1BWF9SQU5ET00gPSAxMDAwO1xuXG5jb25zdCBwcmVjaXNpb24gPSBuZXcgUHJlY2lzaW9uKDIpO1xuXG5jb25zdCBybmRJbnQgPSAobjogbnVtYmVyKTogbnVtYmVyID0+IHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG4pO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBDcml0aWNhbFBhdGhFbnRyeSB7XG4gIGNvdW50OiBudW1iZXI7XG4gIHRhc2tzOiBudW1iZXJbXTtcbiAgZHVyYXRpb25zOiBudW1iZXJbXTtcbn1cblxuLyoqXG4gKiBTaW11bGF0ZSB0aGUgdW5jZXJ0YWludHkgaW4gdGhlIHBsYW4gYW5kIGdlbmVyYXRlIHBvc3NpYmxlIGFsdGVybmF0ZSBjcml0aWNhbFxuICogcGF0aHMuXG4gKi9cbmV4cG9ydCBjb25zdCBzaW11bGF0aW9uID0gKFxuICBwbGFuOiBQbGFuLFxuICBudW1TaW11bGF0aW9uTG9vcHM6IG51bWJlclxuKTogTWFwPHN0cmluZywgQ3JpdGljYWxQYXRoRW50cnk+ID0+IHtcbiAgLy8gU2ltdWxhdGUgdGhlIHVuY2VydGFpbnR5IGluIHRoZSBwbGFuIGFuZCBnZW5lcmF0ZSBwb3NzaWJsZSBhbHRlcm5hdGVcbiAgLy8gY3JpdGljYWwgcGF0aHMuXG5cbiAgY29uc3QgYWxsQ3JpdGljYWxQYXRocyA9IG5ldyBNYXA8c3RyaW5nLCBDcml0aWNhbFBhdGhFbnRyeT4oKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVNpbXVsYXRpb25Mb29wczsgaSsrKSB7XG4gICAgLy8gR2VuZXJhdGUgcmFuZG9tIGR1cmF0aW9ucyBiYXNlZCBvbiBlYWNoIFRhc2tzIHVuY2VydGFpbnR5LlxuICAgIGNvbnN0IGR1cmF0aW9ucyA9IHBsYW4uY2hhcnQuVmVydGljZXMubWFwKCh0OiBUYXNrKSA9PiB7XG4gICAgICBjb25zdCByYXdEdXJhdGlvbiA9IG5ldyBKYWNvYmlhbihcbiAgICAgICAgdC5kdXJhdGlvbixcbiAgICAgICAgdC5nZXRSZXNvdXJjZShcIlVuY2VydGFpbnR5XCIpIGFzIFVuY2VydGFpbnR5XG4gICAgICApLnNhbXBsZShybmRJbnQoTUFYX1JBTkRPTSkgLyBNQVhfUkFORE9NKTtcbiAgICAgIHJldHVybiBwcmVjaXNpb24ucm91bmQocmF3RHVyYXRpb24pO1xuICAgIH0pO1xuXG4gICAgLy8gQ29tcHV0ZSB0aGUgc2xhY2sgYmFzZWQgb24gdGhvc2UgcmFuZG9tIGR1cmF0aW9ucy5cbiAgICBjb25zdCBzbGFja3NSZXQgPSBDb21wdXRlU2xhY2soXG4gICAgICBwbGFuLmNoYXJ0LFxuICAgICAgKHQ6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKSA9PiBkdXJhdGlvbnNbdGFza0luZGV4XSxcbiAgICAgIHByZWNpc2lvbi5yb3VuZGVyKClcbiAgICApO1xuICAgIGlmICghc2xhY2tzUmV0Lm9rKSB7XG4gICAgICB0aHJvdyBzbGFja3NSZXQuZXJyb3I7XG4gICAgfVxuXG4gICAgY29uc3QgY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrc1JldC52YWx1ZSwgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG4gICAgY29uc3QgY3JpdGljYWxQYXRoQXNTdHJpbmcgPSBgJHtjcml0aWNhbFBhdGh9YDtcbiAgICBsZXQgcGF0aEVudHJ5ID0gYWxsQ3JpdGljYWxQYXRocy5nZXQoY3JpdGljYWxQYXRoQXNTdHJpbmcpO1xuICAgIGlmIChwYXRoRW50cnkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGF0aEVudHJ5ID0ge1xuICAgICAgICBjb3VudDogMCxcbiAgICAgICAgdGFza3M6IGNyaXRpY2FsUGF0aCxcbiAgICAgICAgZHVyYXRpb25zOiBkdXJhdGlvbnMsXG4gICAgICB9O1xuICAgICAgYWxsQ3JpdGljYWxQYXRocy5zZXQoY3JpdGljYWxQYXRoQXNTdHJpbmcsIHBhdGhFbnRyeSk7XG4gICAgfVxuICAgIHBhdGhFbnRyeS5jb3VudCsrO1xuICB9XG5cbiAgcmV0dXJuIGFsbENyaXRpY2FsUGF0aHM7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIENyaXRpY2FsUGF0aFRhc2tFbnRyeSB7XG4gIHRhc2tJbmRleDogbnVtYmVyO1xuICBkdXJhdGlvbjogbnVtYmVyO1xuICBudW1UaW1lc0FwcGVhcmVkOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBjcml0aWNhbFRhc2tGcmVxdWVuY2llcyA9IChcbiAgYWxsQ3JpdGljYWxQYXRoczogTWFwPHN0cmluZywgQ3JpdGljYWxQYXRoRW50cnk+LFxuICBwbGFuOiBQbGFuXG4pOiBDcml0aWNhbFBhdGhUYXNrRW50cnlbXSA9PiB7XG4gIGNvbnN0IGNyaXRpYWxUYXNrczogTWFwPG51bWJlciwgQ3JpdGljYWxQYXRoVGFza0VudHJ5PiA9IG5ldyBNYXAoKTtcblxuICBhbGxDcml0aWNhbFBhdGhzLmZvckVhY2goKHZhbHVlOiBDcml0aWNhbFBhdGhFbnRyeSkgPT4ge1xuICAgIHZhbHVlLnRhc2tzLmZvckVhY2goKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBsZXQgdGFza0VudHJ5ID0gY3JpdGlhbFRhc2tzLmdldCh0YXNrSW5kZXgpO1xuICAgICAgaWYgKHRhc2tFbnRyeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRhc2tFbnRyeSA9IHtcbiAgICAgICAgICB0YXNrSW5kZXg6IHRhc2tJbmRleCxcbiAgICAgICAgICBkdXJhdGlvbjogcGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdLmR1cmF0aW9uLFxuICAgICAgICAgIG51bVRpbWVzQXBwZWFyZWQ6IDAsXG4gICAgICAgIH07XG4gICAgICAgIGNyaXRpYWxUYXNrcy5zZXQodGFza0luZGV4LCB0YXNrRW50cnkpO1xuICAgICAgfVxuICAgICAgdGFza0VudHJ5Lm51bVRpbWVzQXBwZWFyZWQgKz0gdmFsdWUuY291bnQ7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBbLi4uY3JpdGlhbFRhc2tzLnZhbHVlcygpXS5zb3J0KFxuICAgIChhOiBDcml0aWNhbFBhdGhUYXNrRW50cnksIGI6IENyaXRpY2FsUGF0aFRhc2tFbnRyeSk6IG51bWJlciA9PiB7XG4gICAgICByZXR1cm4gYi5kdXJhdGlvbiAtIGEuZHVyYXRpb247XG4gICAgfVxuICApO1xufTtcbiIsICJpbXBvcnQge1xuICBEdXBUYXNrT3AsXG4gIEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AsXG4gIFNldFRhc2tOYW1lT3AsXG4gIFNwbGl0VGFza09wLFxufSBmcm9tIFwiLi4vb3BzL2NoYXJ0XCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wIH0gZnJvbSBcIi4uL29wcy9tZXRyaWNzXCI7XG5pbXBvcnQgeyBPcCwgYXBwbHlBbGxPcHNUb1BsYW4gfSBmcm9tIFwiLi4vb3BzL29wc1wiO1xuaW1wb3J0IHtcbiAgQWRkUmVzb3VyY2VPcCxcbiAgQWRkUmVzb3VyY2VPcHRpb25PcCxcbiAgU2V0UmVzb3VyY2VWYWx1ZU9wLFxufSBmcm9tIFwiLi4vb3BzL3Jlc291cmNlc1wiO1xuaW1wb3J0IHsgUGxhbiB9IGZyb20gXCIuLi9wbGFuL3BsYW5cIjtcblxuY29uc3QgcGVvcGxlOiBzdHJpbmdbXSA9IFtcIkZyZWRcIiwgXCJCYXJuZXlcIiwgXCJXaWxtYVwiLCBcIkJldHR5XCJdO1xuXG5jb25zdCBEVVJBVElPTiA9IDEwMDtcblxuY29uc3Qgcm5kSW50ID0gKG46IG51bWJlcik6IG51bWJlciA9PiB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuKTtcbn07XG5cbmNvbnN0IHJuZER1cmF0aW9uID0gKCk6IG51bWJlciA9PiB7XG4gIHJldHVybiBybmRJbnQoRFVSQVRJT04pO1xufTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlUmFuZG9tUGxhbiA9ICgpOiBQbGFuID0+IHtcbiAgY29uc3QgcGxhbiA9IG5ldyBQbGFuKCk7XG4gIGxldCB0YXNrSUQgPSAwO1xuXG4gIGNvbnN0IG9wczogT3BbXSA9IFtBZGRSZXNvdXJjZU9wKFwiUGVyc29uXCIpXTtcblxuICBwZW9wbGUuZm9yRWFjaCgocGVyc29uOiBzdHJpbmcpID0+IHtcbiAgICBvcHMucHVzaChBZGRSZXNvdXJjZU9wdGlvbk9wKFwiUGVyc29uXCIsIHBlcnNvbikpO1xuICB9KTtcblxuICBvcHMucHVzaChcbiAgICBJbnNlcnROZXdFbXB0eVRhc2tBZnRlck9wKDApLFxuICAgIFNldE1ldHJpY1ZhbHVlT3AoXCJEdXJhdGlvblwiLCBybmREdXJhdGlvbigpLCAxKSxcbiAgICBTZXRUYXNrTmFtZU9wKDEsIHJhbmRvbVRhc2tOYW1lKCkpLFxuICAgIFNldFJlc291cmNlVmFsdWVPcChcIlBlcnNvblwiLCBwZW9wbGVbcm5kSW50KHBlb3BsZS5sZW5ndGgpXSwgMSksXG4gICAgU2V0UmVzb3VyY2VWYWx1ZU9wKFwiVW5jZXJ0YWludHlcIiwgXCJtb2RlcmF0ZVwiLCAxKVxuICApO1xuXG4gIGxldCBudW1UYXNrcyA9IDE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTU7IGkrKykge1xuICAgIGxldCBpbmRleCA9IHJuZEludChudW1UYXNrcykgKyAxO1xuICAgIG9wcy5wdXNoKFxuICAgICAgU3BsaXRUYXNrT3AoaW5kZXgpLFxuICAgICAgU2V0TWV0cmljVmFsdWVPcChcIkR1cmF0aW9uXCIsIHJuZER1cmF0aW9uKCksIGluZGV4ICsgMSksXG4gICAgICBTZXRUYXNrTmFtZU9wKGluZGV4ICsgMSwgcmFuZG9tVGFza05hbWUoKSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJQZXJzb25cIiwgcGVvcGxlW3JuZEludChwZW9wbGUubGVuZ3RoKV0sIGluZGV4ICsgMSksXG4gICAgICBTZXRSZXNvdXJjZVZhbHVlT3AoXCJVbmNlcnRhaW50eVwiLCBcIm1vZGVyYXRlXCIsIGluZGV4ICsgMSlcbiAgICApO1xuICAgIG51bVRhc2tzKys7XG4gICAgaW5kZXggPSBybmRJbnQobnVtVGFza3MpICsgMTtcbiAgICBvcHMucHVzaChcbiAgICAgIER1cFRhc2tPcChpbmRleCksXG4gICAgICBTZXRNZXRyaWNWYWx1ZU9wKFwiRHVyYXRpb25cIiwgcm5kRHVyYXRpb24oKSwgaW5kZXggKyAxKSxcbiAgICAgIFNldFRhc2tOYW1lT3AoaW5kZXggKyAxLCByYW5kb21UYXNrTmFtZSgpKSxcbiAgICAgIFNldFJlc291cmNlVmFsdWVPcChcIlBlcnNvblwiLCBwZW9wbGVbcm5kSW50KHBlb3BsZS5sZW5ndGgpXSwgaW5kZXggKyAxKSxcbiAgICAgIFNldFJlc291cmNlVmFsdWVPcChcIlVuY2VydGFpbnR5XCIsIFwibW9kZXJhdGVcIiwgaW5kZXggKyAxKVxuICAgICk7XG4gICAgbnVtVGFza3MrKztcbiAgfVxuXG4gIGNvbnN0IHJlcyA9IGFwcGx5QWxsT3BzVG9QbGFuKG9wcywgcGxhbik7XG5cbiAgaWYgKCFyZXMub2spIHtcbiAgICBjb25zb2xlLmxvZyhyZXMuZXJyb3IpO1xuICB9XG4gIHJldHVybiBwbGFuO1xufTtcblxuY29uc3QgcGFydHMgPSBbXG4gIFwibG9yZW1cIixcbiAgXCJpcHN1bVwiLFxuICBcImRvbG9yXCIsXG4gIFwic2l0XCIsXG4gIFwiYW1ldFwiLFxuICBcImNvbnNlY3RldHVyXCIsXG4gIFwiYWRpcGlzY2luZ1wiLFxuICBcImVsaXRcIixcbiAgXCJzZWRcIixcbiAgXCJkb1wiLFxuICBcImVpdXNtb2RcIixcbiAgXCJ0ZW1wb3JcIixcbiAgXCJpbmNpZGlkdW50XCIsXG4gIFwidXRcIixcbiAgXCJsYWJvcmVcIixcbiAgXCJldFwiLFxuICBcImRvbG9yZVwiLFxuICBcIm1hZ25hXCIsXG4gIFwiYWxpcXVhXCIsXG4gIFwidXRcIixcbiAgXCJlbmltXCIsXG4gIFwiYWRcIixcbiAgXCJtaW5pbVwiLFxuICBcInZlbmlhbVwiLFxuICBcInF1aXNcIixcbiAgXCJub3N0cnVkXCIsXG4gIFwiZXhlcmNpdGF0aW9uXCIsXG4gIFwidWxsYW1jb1wiLFxuICBcImxhYm9yaXNcIixcbiAgXCJuaXNpXCIsXG4gIFwidXRcIixcbiAgXCJhbGlxdWlwXCIsXG4gIFwiZXhcIixcbiAgXCJlYVwiLFxuICBcImNvbW1vZG9cIixcbiAgXCJjb25zZXF1YXRcIixcbiAgXCJldWlzXCIsXG4gIFwiYXV0ZVwiLFxuICBcImlydXJlXCIsXG4gIFwiZG9sb3JcIixcbiAgXCJpblwiLFxuICBcInJlcHJlaGVuZGVyaXRcIixcbiAgXCJpblwiLFxuICBcInZvbHVwdGF0ZVwiLFxuICBcInZlbGl0XCIsXG4gIFwiZXNzZVwiLFxuICBcImNpbGx1bVwiLFxuICBcImRvbG9yZVwiLFxuICBcImV1XCIsXG4gIFwiZnVnaWF0XCIsXG4gIFwibnVsbGFcIixcbiAgXCJwYXJpYXR1clwiLFxuICBcImV4Y2VwdGV1clwiLFxuICBcInNpbnRcIixcbiAgXCJvY2NhZWNhdFwiLFxuICBcImN1cGlkYXRhdFwiLFxuICBcIm5vblwiLFxuICBcInByb2lkZW50XCIsXG4gIFwic3VudFwiLFxuICBcImluXCIsXG4gIFwiY3VscGFcIixcbiAgXCJxdWlcIixcbiAgXCJvZmZpY2lhXCIsXG4gIFwiZGVzZXJ1bnRcIixcbiAgXCJtb2xsaXRcIixcbiAgXCJhbmltXCIsXG4gIFwiaWRcIixcbiAgXCJlc3RcIixcbiAgXCJsYWJvcnVtXCIsXG5dO1xuXG5jb25zdCBwYXJ0c0xlbmd0aCA9IHBhcnRzLmxlbmd0aDtcblxuY29uc3QgcmFuZG9tVGFza05hbWUgPSAoKTogc3RyaW5nID0+XG4gIGAke3BhcnRzW3JuZEludChwYXJ0c0xlbmd0aCldfSAke3BhcnRzW3JuZEludChwYXJ0c0xlbmd0aCldfWA7XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IE9wIH0gZnJvbSBcIi4uL29wcy9vcHNcIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vcmVzdWx0XCI7XG5cbmV4cG9ydCB0eXBlIFBvc3RBY3RvbldvcmsgPSBcIlwiIHwgXCJwYWludENoYXJ0XCIgfCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrO1xuICB1bmRvOiBib29sZWFuOyAvLyBJZiB0cnVlIGluY2x1ZGUgaW4gdW5kby9yZWRvIGFjdGlvbnMuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPjtcbn1cblxuZXhwb3J0IGNsYXNzIE5PT1BBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJEb2VzIG5vdGhpbmdcIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFJlc3VsdDxBY3Rpb24+IHtcbiAgICByZXR1cm4gb2sobmV3IE5PT1BBY3Rpb24oKSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFjdGlvbkZyb21PcCB7XG4gIG5hbWU6IHN0cmluZyA9IFwiQWN0aW9uRnJvbU9wXCI7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkFjdGlvbiBjb25zdHJ1Y3RlZCBkaXJlY3RseSBmcm9tIGFuIE9wLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yaztcbiAgdW5kbzogYm9vbGVhbjtcblxuICBvcDogT3A7XG5cbiAgY29uc3RydWN0b3Iob3A6IE9wLCBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yaywgdW5kbzogYm9vbGVhbikge1xuICAgIHRoaXMucG9zdEFjdGlvbldvcmsgPSBwb3N0QWN0aW9uV29yaztcbiAgICB0aGlzLnVuZG8gPSB1bmRvO1xuICAgIHRoaXMub3AgPSBvcDtcbiAgfVxuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgY29uc3QgcmV0ID0gdGhpcy5vcC5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBTZWFyY2hUYXNrUGFuZWwgfSBmcm9tIFwiLi4vLi4vc2VhcmNoL3NlYXJjaFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgR29Ub1NlYXJjaEFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIk1vdmVzIGZvY3VzIHRvIHNlYXJjaCBjb250cm9sLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBkbyhfZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFJlc3VsdDxBY3Rpb24+IHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3I8U2VhcmNoVGFza1BhbmVsPihcInNlYXJjaC10YXNrLXBhbmVsXCIpIVxuICAgICAgLnNldEtleWJvYXJkRm9jdXNUb0lucHV0KFwibmFtZS1vbmx5XCIpO1xuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgR29Ub0Z1bGxTZWFyY2hBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID1cbiAgICBcIk1vdmVzIGZvY3VzIHRvIHNlYXJjaCBjb250cm9sIGFuZCBkb2VzIGEgZnVsbCBzZWFyY2ggb2YgYWxsIHJlc291cmNlIHZhbHVlcy5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcIlwiO1xuICB1bmRvOiBib29sZWFuID0gZmFsc2U7XG5cbiAgZG8oX2V4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yPFNlYXJjaFRhc2tQYW5lbD4oXCJzZWFyY2gtdGFzay1wYW5lbFwiKSFcbiAgICAgIC5zZXRLZXlib2FyZEZvY3VzVG9JbnB1dChcImZ1bGwtaW5mb1wiKTtcbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIEhlbHBBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJEaXNwbGF5cyB0aGUgaGVscCBkaWFsb2cuXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgZXhwbGFuTWFpblxuICAgICAgLnF1ZXJ5U2VsZWN0b3I8SFRNTERpYWxvZ0VsZW1lbnQ+KFwia2V5Ym9hcmQtbWFwLWRpYWxvZ1wiKSFcbiAgICAgIC5zaG93TW9kYWwoKTtcbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IEFjdGlvbiwgUG9zdEFjdG9uV29yayB9IGZyb20gXCIuLi9hY3Rpb25cIjtcblxuZXhwb3J0IGNsYXNzIFJlc2V0Wm9vbUFjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIlVuZG9lcyB0aGUgem9vbS5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBhaW50Q2hhcnRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgZXhwbGFuTWFpbi5kaXNwbGF5UmFuZ2UgPSBudWxsO1xuICAgIHJldHVybiBvayh0aGlzKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluXCI7XG5pbXBvcnQge1xuICBEZWxldGVUYXNrT3AsXG4gIER1cFRhc2tPcCxcbiAgSW5zZXJ0TmV3RW1wdHlUYXNrQWZ0ZXJPcCxcbiAgU3BsaXRUYXNrT3AsXG59IGZyb20gXCIuLi8uLi9vcHMvY2hhcnRcIjtcbmltcG9ydCB7IFNldE1ldHJpY1ZhbHVlT3AgfSBmcm9tIFwiLi4vLi4vb3BzL21ldHJpY3NcIjtcbmltcG9ydCB7IGVycm9yLCBvaywgUmVzdWx0IH0gZnJvbSBcIi4uLy4uL3Jlc3VsdFwiO1xuaW1wb3J0IHsgQWN0aW9uLCBBY3Rpb25Gcm9tT3AsIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5cbmV4cG9ydCBjbGFzcyBTcGxpdFRhc2tBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJTcGxpdHMgYSB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgdGFzayBtdXN0IGJlIHNlbGVjdGVkIGZpcnN0LlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IFNwbGl0VGFza09wKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrKS5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEdXBUYXNrQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiRHVwbGljYXRlcyBhIHRhc2suXCI7XG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrID0gXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IHRydWU7XG5cbiAgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFJlc3VsdDxBY3Rpb24+IHtcbiAgICBpZiAoZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2sgPT09IC0xKSB7XG4gICAgICByZXR1cm4gZXJyb3IobmV3IEVycm9yKFwiQSB0YXNrIG11c3QgYmUgc2VsZWN0ZWQgZmlyc3QuXCIpKTtcbiAgICB9XG4gICAgY29uc3QgcmV0ID0gRHVwVGFza09wKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrKS5hcHBseVRvKGV4cGxhbk1haW4ucGxhbik7XG4gICAgaWYgKCFyZXQub2spIHtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOZXdUYXNrQWN0aW9uIGltcGxlbWVudHMgQWN0aW9uIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZyA9IFwiQ3JlYXRlcyBhIG5ldyB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgbGV0IHJldCA9IEluc2VydE5ld0VtcHR5VGFza0FmdGVyT3AoMCkuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICByZXR1cm4gb2soXG4gICAgICBuZXcgQWN0aW9uRnJvbU9wKHJldC52YWx1ZS5pbnZlcnNlLCB0aGlzLnBvc3RBY3Rpb25Xb3JrLCB0aGlzLnVuZG8pXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVsZXRlVGFza0FjdGlvbiBpbXBsZW1lbnRzIEFjdGlvbiB7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBcIkRlbGV0ZXMgYSB0YXNrLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwicGxhbkRlZmluaXRpb25DaGFuZ2VkXCI7XG4gIHVuZG86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGRvKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8QWN0aW9uPiB7XG4gICAgaWYgKGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrID09PSAtMSkge1xuICAgICAgcmV0dXJuIGVycm9yKG5ldyBFcnJvcihcIkEgdGFzayBtdXN0IGJlIHNlbGVjdGVkIGZpcnN0LlwiKSk7XG4gICAgfVxuICAgIGNvbnN0IHJldCA9IERlbGV0ZVRhc2tPcChleHBsYW5NYWluLnNlbGVjdGVkVGFzaykuYXBwbHlUbyhleHBsYW5NYWluLnBsYW4pO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBleHBsYW5NYWluLnNlbGVjdGVkVGFzayA9IC0xO1xuICAgIHJldHVybiBvayhcbiAgICAgIG5ldyBBY3Rpb25Gcm9tT3AocmV0LnZhbHVlLmludmVyc2UsIHRoaXMucG9zdEFjdGlvbldvcmssIHRoaXMudW5kbylcbiAgICApO1xuICB9XG59XG4iLCAiLyoqIFdoZW4gdGhlIGdpdmVuIGVsZW1lbnQgaXMgY2xpY2tlZCwgdGhlbiB0b2dnbGUgdGhlIGBkYXJrbW9kZWAgY2xhc3Mgb24gdGhlXG4gKiBib2R5IGVsZW1lbnQuICovXG5leHBvcnQgY29uc3QgdG9nZ2xlVGhlbWUgPSAoKSA9PiB7XG4gIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcImRhcmttb2RlXCIpO1xufTtcbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IHRvZ2dsZVRoZW1lIH0gZnJvbSBcIi4uLy4uL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlclwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgVG9nZ2xlRGFya01vZGVBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJUb2dnbGVzIGRhcmsgbW9kZS5cIjtcbiAgcG9zdEFjdGlvbldvcms6IFBvc3RBY3RvbldvcmsgPSBcInBhaW50Q2hhcnRcIjtcbiAgdW5kbzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgZG8oZXhwbGFuTWFpbjogRXhwbGFuTWFpbik6IFJlc3VsdDxBY3Rpb24+IHtcbiAgICB0b2dnbGVUaGVtZSgpO1xuICAgIC8vIFRvZ2dsZURhcmtNb2RlQWN0aW9uIGlzIGl0cyBvd24gaW52ZXJzZS5cbiAgICByZXR1cm4gb2sodGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uLy4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi8uLi9yZXN1bHRcIjtcbmltcG9ydCB7IHRvZ2dsZVRoZW1lIH0gZnJvbSBcIi4uLy4uL3N0eWxlL3RvZ2dsZXIvdG9nZ2xlclwiO1xuaW1wb3J0IHsgQWN0aW9uLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4uL2FjdGlvblwiO1xuXG5leHBvcnQgY2xhc3MgVG9nZ2xlUmFkYXJBY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJUb2dnbGVzIHRoZSByYWRhciB2aWV3LlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUmVzdWx0PEFjdGlvbj4ge1xuICAgIGV4cGxhbk1haW4udG9nZ2xlUmFkYXIoKTtcbiAgICAvLyBUb2dnbGVSYWRhckFjdGlvbiBpcyBpdHMgb3duIGludmVyc2UuXG4gICAgcmV0dXJuIG9rKHRoaXMpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgRXhwbGFuTWFpbiB9IGZyb20gXCIuLi8uLi9leHBsYW5NYWluL2V4cGxhbk1haW5cIjtcbmltcG9ydCB7IG9rLCBSZXN1bHQgfSBmcm9tIFwiLi4vLi4vcmVzdWx0XCI7XG5pbXBvcnQgeyBBY3Rpb24sIE5PT1BBY3Rpb24sIFBvc3RBY3RvbldvcmsgfSBmcm9tIFwiLi4vYWN0aW9uXCI7XG5pbXBvcnQgeyB1bmRvIH0gZnJvbSBcIi4uL2V4ZWN1dGVcIjtcblxuZXhwb3J0IGNsYXNzIFVuZG9BY3Rpb24gaW1wbGVtZW50cyBBY3Rpb24ge1xuICBkZXNjcmlwdGlvbjogc3RyaW5nID0gXCJVbmRvZXMgdGhlIGxhc3QgYWN0aW9uLlwiO1xuICBwb3N0QWN0aW9uV29yazogUG9zdEFjdG9uV29yayA9IFwiXCI7XG4gIHVuZG86IGJvb2xlYW4gPSBmYWxzZTtcblxuICBkbyhleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUmVzdWx0PEFjdGlvbj4ge1xuICAgIGNvbnN0IHJldCA9IHVuZG8oZXhwbGFuTWFpbik7XG5cbiAgICAvLyBVbmRvIGlzIG5vdCBhIHJldmVyc2libGUgYWN0aW9uLlxuICAgIHJldHVybiBvayhuZXcgTk9PUEFjdGlvbigpKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbi50c1wiO1xuaW1wb3J0IHtcbiAgR29Ub0Z1bGxTZWFyY2hBY3Rpb24sXG4gIEdvVG9TZWFyY2hBY3Rpb24sXG59IGZyb20gXCIuL2FjdGlvbnMvZ290b1NlYXJjaC50c1wiO1xuaW1wb3J0IHsgSGVscEFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvaGVscC50c1wiO1xuaW1wb3J0IHsgUmVzZXRab29tQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy9yZXNldFpvb20udHNcIjtcbmltcG9ydCB7XG4gIERlbGV0ZVRhc2tBY3Rpb24sXG4gIER1cFRhc2tBY3Rpb24sXG4gIE5ld1Rhc2tBY3Rpb24sXG4gIFNwbGl0VGFza0FjdGlvbixcbn0gZnJvbSBcIi4vYWN0aW9ucy90YXNrcy50c1wiO1xuaW1wb3J0IHsgVG9nZ2xlRGFya01vZGVBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3RvZ2dsZURhcmtNb2RlLnRzXCI7XG5pbXBvcnQgeyBUb2dnbGVSYWRhckFjdGlvbiB9IGZyb20gXCIuL2FjdGlvbnMvdG9nZ2xlUmFkYXIudHNcIjtcbmltcG9ydCB7IFVuZG9BY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL3VuZG8udHNcIjtcblxuZXhwb3J0IHR5cGUgQWN0aW9uTmFtZXMgPVxuICB8IFwiVG9nZ2xlRGFya01vZGVBY3Rpb25cIlxuICB8IFwiVG9nZ2xlUmFkYXJBY3Rpb25cIlxuICB8IFwiUmVzZXRab29tQWN0aW9uXCJcbiAgfCBcIlVuZG9BY3Rpb25cIlxuICB8IFwiSGVscEFjdGlvblwiXG4gIHwgXCJTcGxpdFRhc2tBY3Rpb25cIlxuICB8IFwiRHVwVGFza0FjdGlvblwiXG4gIHwgXCJOZXdUYXNrQWN0aW9uXCJcbiAgfCBcIkRlbGV0ZVRhc2tBY3Rpb25cIlxuICB8IFwiR29Ub1NlYXJjaEFjdGlvblwiXG4gIHwgXCJHb1RvRnVsbFNlYXJjaEFjdGlvblwiO1xuXG5leHBvcnQgY29uc3QgQWN0aW9uUmVnaXN0cnk6IFJlY29yZDxBY3Rpb25OYW1lcywgQWN0aW9uPiA9IHtcbiAgVG9nZ2xlRGFya01vZGVBY3Rpb246IG5ldyBUb2dnbGVEYXJrTW9kZUFjdGlvbigpLFxuICBUb2dnbGVSYWRhckFjdGlvbjogbmV3IFRvZ2dsZVJhZGFyQWN0aW9uKCksXG4gIFJlc2V0Wm9vbUFjdGlvbjogbmV3IFJlc2V0Wm9vbUFjdGlvbigpLFxuICBVbmRvQWN0aW9uOiBuZXcgVW5kb0FjdGlvbigpLFxuICBIZWxwQWN0aW9uOiBuZXcgSGVscEFjdGlvbigpLFxuICBTcGxpdFRhc2tBY3Rpb246IG5ldyBTcGxpdFRhc2tBY3Rpb24oKSxcbiAgRHVwVGFza0FjdGlvbjogbmV3IER1cFRhc2tBY3Rpb24oKSxcbiAgTmV3VGFza0FjdGlvbjogbmV3IE5ld1Rhc2tBY3Rpb24oKSxcbiAgRGVsZXRlVGFza0FjdGlvbjogbmV3IERlbGV0ZVRhc2tBY3Rpb24oKSxcbiAgR29Ub1NlYXJjaEFjdGlvbjogbmV3IEdvVG9TZWFyY2hBY3Rpb24oKSxcbiAgR29Ub0Z1bGxTZWFyY2hBY3Rpb246IG5ldyBHb1RvRnVsbFNlYXJjaEFjdGlvbigpLFxufTtcbiIsICJpbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpbi50c1wiO1xuaW1wb3J0IHsgT3AgfSBmcm9tIFwiLi4vb3BzL29wcy50c1wiO1xuaW1wb3J0IHsgb2ssIFJlc3VsdCB9IGZyb20gXCIuLi9yZXN1bHQudHNcIjtcbmltcG9ydCB7IEFjdGlvbiwgQWN0aW9uRnJvbU9wLCBQb3N0QWN0b25Xb3JrIH0gZnJvbSBcIi4vYWN0aW9uLnRzXCI7XG5pbXBvcnQgeyBBY3Rpb25OYW1lcywgQWN0aW9uUmVnaXN0cnkgfSBmcm9tIFwiLi9yZWdpc3RyeS50c1wiO1xuXG5jb25zdCB1bmRvU3RhY2s6IEFjdGlvbltdID0gW107XG5cbmV4cG9ydCBjb25zdCB1bmRvID0gKGV4cGxhbk1haW46IEV4cGxhbk1haW4pOiBSZXN1bHQ8bnVsbD4gPT4ge1xuICBjb25zdCBhY3Rpb24gPSB1bmRvU3RhY2sucG9wKCkhO1xuICBpZiAoIWFjdGlvbikge1xuICAgIHJldHVybiBvayhudWxsKTtcbiAgfVxuXG4gIHJldHVybiBleGVjdXRlVW5kbyhhY3Rpb24sIGV4cGxhbk1haW4pO1xufTtcblxuZXhwb3J0IGNvbnN0IGV4ZWN1dGUgPSAoXG4gIG5hbWU6IEFjdGlvbk5hbWVzLFxuICBleHBsYW5NYWluOiBFeHBsYW5NYWluXG4pOiBSZXN1bHQ8bnVsbD4gPT4ge1xuICBjb25zdCBhY3Rpb24gPSBBY3Rpb25SZWdpc3RyeVtuYW1lXTtcbiAgY29uc3QgcmV0ID0gYWN0aW9uLmRvKGV4cGxhbk1haW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgc3dpdGNoIChhY3Rpb24ucG9zdEFjdGlvbldvcmspIHtcbiAgICBjYXNlIFwiXCI6XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwicGFpbnRDaGFydFwiOlxuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgYnJlYWs7XG4gIH1cbiAgaWYgKGFjdGlvbi51bmRvKSB7XG4gICAgdW5kb1N0YWNrLnB1c2gocmV0LnZhbHVlKTtcbiAgfVxuICByZXR1cm4gb2sobnVsbCk7XG59O1xuXG5leHBvcnQgY29uc3QgZXhlY3V0ZU9wID0gKFxuICBvcDogT3AsXG4gIHBvc3RBY3Rpb25Xb3JrOiBQb3N0QWN0b25Xb3JrLFxuICB1bmRvOiBib29sZWFuLFxuICBleHBsYW5NYWluOiBFeHBsYW5NYWluXG4pOiBSZXN1bHQ8bnVsbD4gPT4ge1xuICBjb25zdCBhY3Rpb24gPSBuZXcgQWN0aW9uRnJvbU9wKG9wLCBwb3N0QWN0aW9uV29yaywgdW5kbyk7XG4gIGNvbnN0IHJldCA9IGFjdGlvbi5kbyhleHBsYW5NYWluKTtcbiAgaWYgKCFyZXQub2spIHtcbiAgICByZXR1cm4gcmV0O1xuICB9XG4gIHN3aXRjaCAoYWN0aW9uLnBvc3RBY3Rpb25Xb3JrKSB7XG4gICAgY2FzZSBcIlwiOlxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFwicGFpbnRDaGFydFwiOlxuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwbGFuRGVmaW5pdGlvbkNoYW5nZWRcIjpcbiAgICAgIGV4cGxhbk1haW4ucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuICAgICAgZXhwbGFuTWFpbi5wYWludENoYXJ0KCk7XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuICBpZiAoYWN0aW9uLnVuZG8pIHtcbiAgICB1bmRvU3RhY2sucHVzaChyZXQudmFsdWUpO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn07XG5cbmNvbnN0IGV4ZWN1dGVVbmRvID0gKGFjdGlvbjogQWN0aW9uLCBleHBsYW5NYWluOiBFeHBsYW5NYWluKTogUmVzdWx0PG51bGw+ID0+IHtcbiAgY29uc3QgcmV0ID0gYWN0aW9uLmRvKGV4cGxhbk1haW4pO1xuICBpZiAoIXJldC5vaykge1xuICAgIHJldHVybiByZXQ7XG4gIH1cbiAgc3dpdGNoIChhY3Rpb24ucG9zdEFjdGlvbldvcmspIHtcbiAgICBjYXNlIFwiXCI6XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgXCJwYWludENoYXJ0XCI6XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiOlxuICAgICAgZXhwbGFuTWFpbi5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgICBleHBsYW5NYWluLnBhaW50Q2hhcnQoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBvayhudWxsKTtcbn07XG4iLCAiaW1wb3J0IHsgZXhlY3V0ZSB9IGZyb20gXCIuLi9hY3Rpb24vZXhlY3V0ZVwiO1xuaW1wb3J0IHsgQWN0aW9uTmFtZXMgfSBmcm9tIFwiLi4vYWN0aW9uL3JlZ2lzdHJ5XCI7XG5pbXBvcnQgeyBFeHBsYW5NYWluIH0gZnJvbSBcIi4uL2V4cGxhbk1haW4vZXhwbGFuTWFpblwiO1xuXG5leHBvcnQgY29uc3QgS2V5TWFwOiBNYXA8c3RyaW5nLCBBY3Rpb25OYW1lcz4gPSBuZXcgTWFwKFtcbiAgW1wic2hpZnQtY3RybC1SXCIsIFwiVG9nZ2xlUmFkYXJBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtTVwiLCBcIlRvZ2dsZURhcmtNb2RlQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLVpcIiwgXCJSZXNldFpvb21BY3Rpb25cIl0sXG4gIFtcImN0cmwtelwiLCBcIlVuZG9BY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtSFwiLCBcIkhlbHBBY3Rpb25cIl0sXG4gIFtcInNoaWZ0LWN0cmwtfFwiLCBcIlNwbGl0VGFza0FjdGlvblwiXSxcbiAgW1wic2hpZnQtY3RybC1fXCIsIFwiRHVwVGFza0FjdGlvblwiXSxcbiAgW1wiYWx0LUluc2VydFwiLCBcIk5ld1Rhc2tBY3Rpb25cIl0sXG4gIFtcImFsdC1EZWxldGVcIiwgXCJEZWxldGVUYXNrQWN0aW9uXCJdLFxuICBbXCJjdHJsLWZcIiwgXCJHb1RvU2VhcmNoQWN0aW9uXCJdLFxuICBbXCJzaGlmdC1jdHJsLUZcIiwgXCJHb1RvRnVsbFNlYXJjaEFjdGlvblwiXSxcbl0pO1xuXG5sZXQgZXhwbGFuTWFpbjogRXhwbGFuTWFpbjtcblxuZXhwb3J0IGNvbnN0IFN0YXJ0S2V5Ym9hcmRIYW5kbGluZyA9IChlbTogRXhwbGFuTWFpbikgPT4ge1xuICBleHBsYW5NYWluID0gZW07XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIG9uS2V5RG93bik7XG59O1xuXG5jb25zdCBvbktleURvd24gPSAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICBjb25zdCBrZXluYW1lID0gYCR7ZS5zaGlmdEtleSA/IFwic2hpZnQtXCIgOiBcIlwifSR7ZS5jdHJsS2V5ID8gXCJjdHJsLVwiIDogXCJcIn0ke2UubWV0YUtleSA/IFwibWV0YS1cIiA6IFwiXCJ9JHtlLmFsdEtleSA/IFwiYWx0LVwiIDogXCJcIn0ke2Uua2V5fWA7XG4gIGNvbnNvbGUubG9nKGtleW5hbWUpO1xuICBjb25zdCBhY3Rpb25OYW1lID0gS2V5TWFwLmdldChrZXluYW1lKTtcbiAgaWYgKGFjdGlvbk5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnN0IHJldCA9IGV4ZWN1dGUoYWN0aW9uTmFtZSwgZXhwbGFuTWFpbik7XG4gIGlmICghcmV0Lm9rKSB7XG4gICAgY29uc29sZS5sb2cocmV0LmVycm9yKTtcbiAgfVxufTtcbiIsICJpbXBvcnQgeyBUYXNrIH0gZnJvbSBcIi4uL2NoYXJ0L2NoYXJ0LnRzXCI7XG5pbXBvcnQgeyBGaWx0ZXJGdW5jIH0gZnJvbSBcIi4uL2NoYXJ0L2ZpbHRlci9maWx0ZXIudHNcIjtcbmltcG9ydCB7IERpcmVjdGVkRWRnZSB9IGZyb20gXCIuLi9kYWcvZGFnLnRzXCI7XG5pbXBvcnQgeyBTZXRNZXRyaWNWYWx1ZU9wIH0gZnJvbSBcIi4uL29wcy9tZXRyaWNzLnRzXCI7XG5pbXBvcnQgeyBPcCB9IGZyb20gXCIuLi9vcHMvb3BzLnRzXCI7XG5pbXBvcnQgeyBTZXRSZXNvdXJjZVZhbHVlT3AgfSBmcm9tIFwiLi4vb3BzL3Jlc291cmNlcy50c1wiO1xuaW1wb3J0IHsgRnJvbUpTT04sIFBsYW4gfSBmcm9tIFwiLi4vcGxhbi9wbGFuLnRzXCI7XG5pbXBvcnQgeyBQcmVjaXNpb24gfSBmcm9tIFwiLi4vcHJlY2lzaW9uL3ByZWNpc2lvbi50c1wiO1xuaW1wb3J0IHtcbiAgRElWSURFUl9NT1ZFX0VWRU5ULFxuICBEaXZpZGVyTW92ZSxcbiAgRGl2aWRlck1vdmVSZXN1bHQsXG59IGZyb20gXCIuLi9yZW5kZXJlci9kaXZpZGVybW92ZS9kaXZpZGVybW92ZS50c1wiO1xuaW1wb3J0IHtcbiAgRFJBR19SQU5HRV9FVkVOVCxcbiAgRHJhZ1JhbmdlLFxuICBNb3VzZURyYWcsXG59IGZyb20gXCIuLi9yZW5kZXJlci9tb3VzZWRyYWcvbW91c2VkcmFnLnRzXCI7XG5pbXBvcnQgeyBNb3VzZU1vdmUgfSBmcm9tIFwiLi4vcmVuZGVyZXIvbW91c2Vtb3ZlL21vdXNlbW92ZS50c1wiO1xuaW1wb3J0IHsgRGlzcGxheVJhbmdlIH0gZnJvbSBcIi4uL3JlbmRlcmVyL3JhbmdlL3JhbmdlLnRzXCI7XG5pbXBvcnQge1xuICBSZW5kZXJPcHRpb25zLFxuICBSZW5kZXJSZXN1bHQsXG4gIFRhc2tMYWJlbCxcbiAgVXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zLFxuICByZW5kZXJUYXNrc1RvQ2FudmFzLFxuICBzdWdnZXN0ZWRDYW52YXNIZWlnaHQsXG59IGZyb20gXCIuLi9yZW5kZXJlci9yZW5kZXJlci50c1wiO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi4vcmVuZGVyZXIvc2NhbGUvcG9pbnQudHNcIjtcbmltcG9ydCB7IFNjYWxlIH0gZnJvbSBcIi4uL3JlbmRlcmVyL3NjYWxlL3NjYWxlLnRzXCI7XG5pbXBvcnQgeyBSZXN1bHQgfSBmcm9tIFwiLi4vcmVzdWx0LnRzXCI7XG5pbXBvcnQgeyBDb21wdXRlU2xhY2ssIENyaXRpY2FsUGF0aCwgU2xhY2ssIFNwYW4gfSBmcm9tIFwiLi4vc2xhY2svc2xhY2sudHNcIjtcbmltcG9ydCB7IFRoZW1lLCBjb2xvclRoZW1lRnJvbUVsZW1lbnQgfSBmcm9tIFwiLi4vc3R5bGUvdGhlbWUvdGhlbWUudHNcIjtcbmltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7XG4gIENyaXRpY2FsUGF0aFRhc2tFbnRyeSxcbiAgY3JpdGljYWxUYXNrRnJlcXVlbmNpZXMsXG4gIHNpbXVsYXRpb24sXG59IGZyb20gXCIuLi9zaW11bGF0aW9uL3NpbXVsYXRpb24udHNcIjtcbmltcG9ydCB7IGdlbmVyYXRlUmFuZG9tUGxhbiB9IGZyb20gXCIuLi9nZW5lcmF0ZS9nZW5lcmF0ZS50c1wiO1xuaW1wb3J0IHsgZXhlY3V0ZSwgZXhlY3V0ZU9wIH0gZnJvbSBcIi4uL2FjdGlvbi9leGVjdXRlLnRzXCI7XG5pbXBvcnQgeyBBY3Rpb25Gcm9tT3AgfSBmcm9tIFwiLi4vYWN0aW9uL2FjdGlvbi50c1wiO1xuaW1wb3J0IHsgU3RhcnRLZXlib2FyZEhhbmRsaW5nIH0gZnJvbSBcIi4uL2tleW1hcC9rZXltYXAudHNcIjtcbmltcG9ydCB7IERlbGV0ZVRhc2tPcCwgU2V0VGFza05hbWVPcCB9IGZyb20gXCIuLi9vcHMvY2hhcnQudHNcIjtcblxuY29uc3QgRk9OVF9TSVpFX1BYID0gMzI7XG5cbmNvbnN0IE5VTV9TSU1VTEFUSU9OX0xPT1BTID0gMTAwO1xuXG5jb25zdCBwcmVjaXNpb24gPSBuZXcgUHJlY2lzaW9uKDIpO1xuXG4vKiogVHlwZSBvZiBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCB0YXNrIGhhcyBjaGFuZ2VkLiAqL1xudHlwZSBVcGRhdGVTZWxlY3RlZFRhc2tQYW5lbCA9ICh0YXNrSW5kZXg6IG51bWJlcikgPT4gdm9pZDtcblxuaW50ZXJmYWNlIENyaXRpY2FsUGF0aEVudHJ5IHtcbiAgY291bnQ6IG51bWJlcjtcbiAgdGFza3M6IG51bWJlcltdO1xuICBkdXJhdGlvbnM6IG51bWJlcltdO1xufVxuXG4vLyBCdWlsZHMgdGhlIHRhc2sgcGFuZWwgd2hpY2ggdGhlbiByZXR1cm5zIGEgY2xvc3VyZSB1c2VkIHRvIHVwZGF0ZSB0aGUgcGFuZWxcbi8vIHdpdGggaW5mbyBmcm9tIGEgc3BlY2lmaWMgVGFzay5cbmNvbnN0IGJ1aWxkU2VsZWN0ZWRUYXNrUGFuZWwgPSAoXG4gIHBsYW46IFBsYW4sXG4gIHNlbGVjdGVkVGFza1BhbmVsOiBIVE1MRWxlbWVudCxcbiAgZXhwbGFuTWFpbjogRXhwbGFuTWFpblxuKTogVXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWwgPT4ge1xuICBjb25zdCBzZWxlY3RlZFRhc2tQYW5lbFRlbXBsYXRlID0gKFxuICAgIHRhc2s6IFRhc2ssXG4gICAgcGxhbjogUGxhblxuICApOiBUZW1wbGF0ZVJlc3VsdCA9PiBodG1sYFxuICAgIDx0YWJsZT5cbiAgICAgIDx0cj5cbiAgICAgICAgPHRkPk5hbWU8L3RkPlxuICAgICAgICA8dGQ+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAudmFsdWU9XCIke3Rhc2submFtZX1cIlxuICAgICAgICAgICAgQGNoYW5nZT0keyhlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgICBleHBsYW5NYWluLnRhc2tOYW1lQ2hhbmdlZChcbiAgICAgICAgICAgICAgICBleHBsYW5NYWluLnNlbGVjdGVkVGFzayxcbiAgICAgICAgICAgICAgICAoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWVcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC90ZD5cbiAgICAgIDwvdHI+XG4gICAgICAke09iamVjdC5lbnRyaWVzKHBsYW4ucmVzb3VyY2VEZWZpbml0aW9ucykubWFwKFxuICAgICAgICAoW3Jlc291cmNlS2V5LCBkZWZuXSkgPT5cbiAgICAgICAgICBodG1sYCA8dHI+XG4gICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCIke3Jlc291cmNlS2V5fVwiPiR7cmVzb3VyY2VLZXl9PC9sYWJlbD5cbiAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgICBpZD1cIiR7cmVzb3VyY2VLZXl9XCJcbiAgICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZXQgPSBleHBsYW5NYWluLnRhc2tSZXNvdXJjZVZhbHVlQ2hhbmdlZChcbiAgICAgICAgICAgICAgICAgICAgZXhwbGFuTWFpbi5zZWxlY3RlZFRhc2ssXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlS2V5LFxuICAgICAgICAgICAgICAgICAgICAoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWVcbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICBpZiAoIXJldC5vaykge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIHBvcHVwIGVycm9yIG1lc3NhZ2UuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJldCk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgJHtkZWZuLnZhbHVlcy5tYXAoXG4gICAgICAgICAgICAgICAgICAocmVzb3VyY2VWYWx1ZTogc3RyaW5nKSA9PlxuICAgICAgICAgICAgICAgICAgICBodG1sYDxvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICBuYW1lPSR7cmVzb3VyY2VWYWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0ZWQ9JHt0YXNrLnJlc291cmNlc1tyZXNvdXJjZUtleV0gPT09IHJlc291cmNlVmFsdWV9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAke3Jlc291cmNlVmFsdWV9XG4gICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPmBcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgPC90cj5gXG4gICAgICApfVxuICAgICAgJHtPYmplY3Qua2V5cyhwbGFuLm1ldHJpY0RlZmluaXRpb25zKS5tYXAoXG4gICAgICAgIChrZXk6IHN0cmluZykgPT5cbiAgICAgICAgICBodG1sYCA8dHI+XG4gICAgICAgICAgICA8dGQ+PGxhYmVsIGZvcj1cIiR7a2V5fVwiPiR7a2V5fTwvbGFiZWw+PC90ZD5cbiAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgaWQ9XCIke2tleX1cIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgIC52YWx1ZT1cIiR7dGFzay5tZXRyaWNzW2tleV19XCJcbiAgICAgICAgICAgICAgICBAY2hhbmdlPSR7KGU6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCByZXQgPSBleHBsYW5NYWluLnRhc2tNZXRyaWNWYWx1ZUNoYW5nZWQoXG4gICAgICAgICAgICAgICAgICAgIGV4cGxhbk1haW4uc2VsZWN0ZWRUYXNrLFxuICAgICAgICAgICAgICAgICAgICBrZXksXG4gICAgICAgICAgICAgICAgICAgIChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gcG9wdXAgZXJyb3IgbWVzc2FnZS5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmV0KTtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgIDwvdHI+YFxuICAgICAgKX1cbiAgICA8L3RhYmxlPlxuICBgO1xuXG4gIGNvbnN0IHVwZGF0ZVNlbGVjdGVkVGFza1BhbmVsID0gKHRhc2tJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKHRhc2tJbmRleCA9PT0gLTEpIHtcbiAgICAgIHJlbmRlcihodG1sYE5vIHRhc2sgc2VsZWN0ZWQuYCwgc2VsZWN0ZWRUYXNrUGFuZWwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0YXNrID0gcGxhbi5jaGFydC5WZXJ0aWNlc1t0YXNrSW5kZXhdO1xuICAgIGNvbnNvbGUubG9nKHRhc2spO1xuICAgIHJlbmRlcihzZWxlY3RlZFRhc2tQYW5lbFRlbXBsYXRlKHRhc2ssIHBsYW4pLCBzZWxlY3RlZFRhc2tQYW5lbCk7XG4gIH07XG5cbiAgcmV0dXJuIHVwZGF0ZVNlbGVjdGVkVGFza1BhbmVsO1xufTtcblxuY29uc3QgY3JpdGljYWxQYXRoc1RlbXBsYXRlID0gKFxuICBhbGxDcml0aWNhbFBhdGhzOiBNYXA8c3RyaW5nLCBDcml0aWNhbFBhdGhFbnRyeT4sXG4gIGV4cGxhbk1haW46IEV4cGxhbk1haW5cbik6IFRlbXBsYXRlUmVzdWx0ID0+IGh0bWxgXG4gIDx1bD5cbiAgICAke0FycmF5LmZyb20oYWxsQ3JpdGljYWxQYXRocy5lbnRyaWVzKCkpLm1hcChcbiAgICAgIChba2V5LCB2YWx1ZV0pID0+XG4gICAgICAgIGh0bWxgPGxpXG4gICAgICAgICAgQGNsaWNrPSR7KCkgPT5cbiAgICAgICAgICAgIGV4cGxhbk1haW4ub25Qb3RlbnRpYWxDcml0aWNpYWxQYXRoQ2xpY2soa2V5LCBhbGxDcml0aWNhbFBhdGhzKX1cbiAgICAgICAgPlxuICAgICAgICAgICR7dmFsdWUuY291bnR9IDogJHtrZXl9XG4gICAgICAgIDwvbGk+YFxuICAgICl9XG4gIDwvdWw+XG5gO1xuXG5jb25zdCBjcml0aWNhbFRhc2tGcmVxdWVuY2llc1RlbXBsYXRlID0gKFxuICBwbGFuOiBQbGFuLFxuICBjcml0aWNhbFRhc2tzRHVyYXRpb25EZXNjZW5kaW5nOiBDcml0aWNhbFBhdGhUYXNrRW50cnlbXVxuKSA9PlxuICBodG1sYDx0cj5cbiAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgIDx0aD5EdXJhdGlvbjwvdGg+XG4gICAgICA8dGg+RnJlcXVlbmN5ICglKTwvdGg+XG4gICAgPC90cj5cbiAgICAke2NyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcubWFwKFxuICAgICAgKHRhc2tFbnRyeTogQ3JpdGljYWxQYXRoVGFza0VudHJ5KSA9PlxuICAgICAgICBodG1sYDx0cj5cbiAgICAgICAgICA8dGQ+JHtwbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tFbnRyeS50YXNrSW5kZXhdLm5hbWV9PC90ZD5cbiAgICAgICAgICA8dGQ+JHt0YXNrRW50cnkuZHVyYXRpb259PC90ZD5cbiAgICAgICAgICA8dGQ+XG4gICAgICAgICAgICAke01hdGguZmxvb3IoXG4gICAgICAgICAgICAgICgxMDAgKiB0YXNrRW50cnkubnVtVGltZXNBcHBlYXJlZCkgLyBOVU1fU0lNVUxBVElPTl9MT09QU1xuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L3RkPlxuICAgICAgICA8L3RyPmBcbiAgICApfSBgO1xuXG5leHBvcnQgY2xhc3MgRXhwbGFuTWFpbiBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgLyoqIFRoZSBQbGFuIGJlaW5nIGVkaXRlZC4gKi9cbiAgcGxhbjogUGxhbiA9IG5ldyBQbGFuKCk7XG5cbiAgLyoqIFRoZSBzdGFydCBhbmQgZmluaXNoIHRpbWUgZm9yIGVhY2ggVGFzayBpbiB0aGUgUGxhbi4gKi9cbiAgc3BhbnM6IFNwYW5bXSA9IFtdO1xuXG4gIC8qKiBUaGUgdGFzayBpbmRpY2VzIG9mIHRhc2tzIG9uIHRoZSBjcml0aWNhbCBwYXRoLiAqL1xuICBjcml0aWNhbFBhdGg6IG51bWJlcltdID0gW107XG5cbiAgLyoqIFRoZSBzZWxlY3Rpb24gKGluIHRpbWUpIG9mIHRoZSBQbGFuIGN1cnJlbnRseSBiZWluZyB2aWV3ZWQuICovXG4gIGRpc3BsYXlSYW5nZTogRGlzcGxheVJhbmdlIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFNjYWxlIGZvciB0aGUgcmFkYXIgdmlldywgdXNlZCBmb3IgZHJhZyBzZWxlY3RpbmcgYSBkaXNwbGF5UmFuZ2UuICovXG4gIHJhZGFyU2NhbGU6IFNjYWxlIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEFsbCBvZiB0aGUgdHlwZXMgb2YgcmVzb3VyY2VzIGluIHRoZSBwbGFuLiAqL1xuICBncm91cEJ5T3B0aW9uczogc3RyaW5nW10gPSBbXTtcblxuICAvKiogV2hpY2ggb2YgdGhlIHJlc291cmNlcyBhcmUgd2UgY3VycmVudGx5IGdyb3VwaW5nIGJ5LCB3aGVyZSAwIG1lYW5zIG5vXG4gICAqIGdyb3VwaW5nIGlzIGRvbmUuICovXG4gIGdyb3VwQnlPcHRpb25zSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgLyoqIFRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgdGFzaywgYXMgYW4gaW5kZXguICovXG4gIHNlbGVjdGVkVGFzazogbnVtYmVyID0gLTE7XG5cbiAgLy8gVUkgZmVhdHVyZXMgdGhhdCBjYW4gYmUgdG9nZ2xlZCBvbiBhbmQgb2ZmLlxuICB0b3BUaW1lbGluZTogYm9vbGVhbiA9IGZhbHNlO1xuICBjcml0aWNhbFBhdGhzT25seTogYm9vbGVhbiA9IGZhbHNlO1xuICBmb2N1c09uVGFzazogYm9vbGVhbiA9IGZhbHNlO1xuICBtb3VzZU1vdmU6IE1vdXNlTW92ZSB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBDYWxsYmFjayB0byBjYWxsIHdoZW4gdGhlIHNlbGVjdGVkIHRhc2sgY2hhbmdlcy4gKi9cbiAgdXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWw6IFVwZGF0ZVNlbGVjdGVkVGFza1BhbmVsIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIENhbGxiYWNrIHRvIGNhbGwgd2hlbiBhIG1vdXNlIG1vdmVzIG92ZXIgdGhlIGNoYXJ0LiAqL1xuICB1cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3M6IFVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyB8IG51bGwgPSBudWxsO1xuXG4gIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgIHRoaXMucGxhbiA9IGdlbmVyYXRlUmFuZG9tUGxhbigpO1xuICAgIHRoaXMucGxhbkRlZmluaXRpb25IYXNCZWVuQ2hhbmdlZCgpO1xuXG4gICAgLy8gRHJhZ2dpbmcgb24gdGhlIHJhZGFyLlxuICAgIGNvbnN0IHJhZGFyID0gdGhpcy5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcIiNyYWRhclwiKSE7XG4gICAgbmV3IE1vdXNlRHJhZyhyYWRhcik7XG4gICAgcmFkYXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIERSQUdfUkFOR0VfRVZFTlQsXG4gICAgICB0aGlzLmRyYWdSYW5nZUhhbmRsZXIuYmluZCh0aGlzKSBhcyBFdmVudExpc3RlbmVyXG4gICAgKTtcblxuICAgIC8vIERpdmlkZXIgZHJhZ2dpbmcuXG4gICAgY29uc3QgZGl2aWRlciA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCJ2ZXJ0aWNhbC1kaXZpZGVyXCIpITtcbiAgICBuZXcgRGl2aWRlck1vdmUoZG9jdW1lbnQuYm9keSwgZGl2aWRlciwgXCJjb2x1bW5cIik7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoRElWSURFUl9NT1ZFX0VWRU5ULCAoKFxuICAgICAgZTogQ3VzdG9tRXZlbnQ8RGl2aWRlck1vdmVSZXN1bHQ+XG4gICAgKSA9PiB7XG4gICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KFxuICAgICAgICBcImdyaWQtdGVtcGxhdGUtY29sdW1uc1wiLFxuICAgICAgICBgY2FsYygke2UuZGV0YWlsLmJlZm9yZX0lIC0gMTVweCkgMTBweCBhdXRvYFxuICAgICAgKTtcbiAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIH0pIGFzIEV2ZW50TGlzdGVuZXIpO1xuXG4gICAgLy8gQnV0dG9uc1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNyZXNldC16b29tXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgZXhlY3V0ZShcIlJlc2V0Wm9vbUFjdGlvblwiLCB0aGlzKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNkYXJrLW1vZGUtdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgZXhlY3V0ZShcIlRvZ2dsZURhcmtNb2RlQWN0aW9uXCIsIHRoaXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3JhZGFyLXRvZ2dsZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIGV4ZWN1dGUoXCJUb2dnbGVSYWRhckFjdGlvblwiLCB0aGlzKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiN0b3AtdGltZWxpbmUtdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgXCJjbGlja1wiLFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnRvcFRpbWVsaW5lID0gIXRoaXMudG9wVGltZWxpbmU7XG4gICAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZ3JvdXAtYnktdG9nZ2xlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy50b2dnbGVHcm91cEJ5KCk7XG4gICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNjcml0aWNhbC1wYXRocy10b2dnbGVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcImNsaWNrXCIsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMudG9nZ2xlQ3JpdGljYWxQYXRoc09ubHkoKTtcbiAgICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IG92ZXJsYXlDYW52YXMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3I8SFRNTENhbnZhc0VsZW1lbnQ+KFwiI292ZXJsYXlcIikhO1xuICAgIHRoaXMubW91c2VNb3ZlID0gbmV3IE1vdXNlTW92ZShvdmVybGF5Q2FudmFzKTtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG5cbiAgICBvdmVybGF5Q2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHAgPSBuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICAgICAgaWYgKHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRUYXNrID1cbiAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyhwLCBcIm1vdXNlZG93blwiKSB8fCAtMTtcbiAgICAgICAgdGhpcy51cGRhdGVTZWxlY3RlZFRhc2tQYW5lbCEodGhpcy5zZWxlY3RlZFRhc2spO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgb3ZlcmxheUNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHAgPSBuZXcgUG9pbnQoZS5vZmZzZXRYLCBlLm9mZnNldFkpO1xuICAgICAgaWYgKHRoaXMudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2V0Rm9jdXNPblRhc2soXG4gICAgICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MocCwgXCJtb3VzZWRvd25cIikgfHwgLTFcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWwgPSBidWlsZFNlbGVjdGVkVGFza1BhbmVsKFxuICAgICAgdGhpcy5wbGFuLFxuICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwic2VsZWN0ZWQtdGFzay1wYW5lbFwiKSEsXG4gICAgICB0aGlzXG4gICAgKTtcblxuICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWwodGhpcy5zZWxlY3RlZFRhc2spO1xuXG4gICAgLy8gUmVhY3QgdG8gdGhlIHVwbG9hZCBpbnB1dC5cbiAgICBjb25zdCBmaWxlVXBsb2FkID1cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTElucHV0RWxlbWVudD4oXCIjZmlsZS11cGxvYWRcIikhO1xuICAgIGZpbGVVcGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBqc29uID0gYXdhaXQgZmlsZVVwbG9hZC5maWxlcyFbMF0udGV4dCgpO1xuICAgICAgY29uc3QgcmV0ID0gRnJvbUpTT04oanNvbik7XG4gICAgICBpZiAoIXJldC5vaykge1xuICAgICAgICB0aHJvdyByZXQuZXJyb3I7XG4gICAgICB9XG4gICAgICB0aGlzLnBsYW4gPSByZXQudmFsdWU7XG4gICAgICB0aGlzLnBsYW5EZWZpbml0aW9uSGFzQmVlbkNoYW5nZWQoKTtcbiAgICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3NpbXVsYXRlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5zaW11bGF0ZSgpO1xuICAgICAgdGhpcy5wYWludENoYXJ0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjZm9jdXMtb24tc2VsZWN0ZWQtdGFza1wiKSEuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgIFwiY2xpY2tcIixcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy50b2dnbGVGb2N1c09uVGFzaygpO1xuICAgICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2dlbi1yYW5kb20tcGxhblwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucGxhbiA9IGdlbmVyYXRlUmFuZG9tUGxhbigpO1xuICAgICAgdGhpcy5wbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCk7XG4gICAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB9KTtcblxuICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMucGFpbnRDaGFydC5iaW5kKHRoaXMpKTtcbiAgICBTdGFydEtleWJvYXJkSGFuZGxpbmcodGhpcyk7XG4gIH1cblxuICBzZXRGb2N1c09uVGFzayhpbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZWxlY3RlZFRhc2sgPSBpbmRleDtcbiAgICB0aGlzLmZvcmNlRm9jdXNPblRhc2soKTtcbiAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgICB0aGlzLnVwZGF0ZVNlbGVjdGVkVGFza1BhbmVsISh0aGlzLnNlbGVjdGVkVGFzayk7XG4gIH1cblxuICB0YXNrUmVzb3VyY2VWYWx1ZUNoYW5nZWQoXG4gICAgdGFza0luZGV4OiBudW1iZXIsXG4gICAgcmVzb3VyY2VLZXk6IHN0cmluZyxcbiAgICByZXNvdXJjZVZhbHVlOiBzdHJpbmdcbiAgKTogUmVzdWx0PG51bGw+IHtcbiAgICBjb25zdCBvcCA9IFNldFJlc291cmNlVmFsdWVPcChyZXNvdXJjZUtleSwgcmVzb3VyY2VWYWx1ZSwgdGFza0luZGV4KTtcbiAgICByZXR1cm4gZXhlY3V0ZU9wKG9wLCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLCB0cnVlLCB0aGlzKTtcbiAgfVxuXG4gIHRhc2tNZXRyaWNWYWx1ZUNoYW5nZWQoXG4gICAgdGFza0luZGV4OiBudW1iZXIsXG4gICAgbWV0cmljS2V5OiBzdHJpbmcsXG4gICAgbWV0cmljVmFsdWU6IHN0cmluZ1xuICApOiBSZXN1bHQ8bnVsbD4ge1xuICAgIGNvbnN0IG9wID0gU2V0TWV0cmljVmFsdWVPcChtZXRyaWNLZXksICttZXRyaWNWYWx1ZSwgdGFza0luZGV4KTtcbiAgICByZXR1cm4gZXhlY3V0ZU9wKG9wLCBcInBsYW5EZWZpbml0aW9uQ2hhbmdlZFwiLCB0cnVlLCB0aGlzKTtcbiAgfVxuXG4gIHRhc2tOYW1lQ2hhbmdlZCh0YXNrSW5kZXg6IG51bWJlciwgbmFtZTogc3RyaW5nKTogUmVzdWx0PG51bGw+IHtcbiAgICBjb25zdCBvcCA9IFNldFRhc2tOYW1lT3AodGFza0luZGV4LCBuYW1lKTtcbiAgICByZXR1cm4gZXhlY3V0ZU9wKG9wLCBcInBhaW50Q2hhcnRcIiwgdHJ1ZSwgdGhpcyk7XG4gIH1cblxuICBkZWxldGVUYXNrKHRhc2tJbmRleDogbnVtYmVyKTogUmVzdWx0PG51bGw+IHtcbiAgICBjb25zdCBvcCA9IERlbGV0ZVRhc2tPcCh0YXNrSW5kZXgpO1xuICAgIHJldHVybiBleGVjdXRlT3Aob3AsIFwicGFpbnRDaGFydFwiLCB0cnVlLCB0aGlzKTtcbiAgfVxuXG4gIC8vIFRPRE8gLSBUdXJuIHRoaXMgb24gYW5kIG9mZiBiYXNlZCBvbiBtb3VzZSBlbnRlcmluZyB0aGUgY2FudmFzIGFyZWEuXG4gIG9uTW91c2VNb3ZlKCkge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5tb3VzZU1vdmUhLnJlYWRMb2NhdGlvbigpO1xuICAgIGlmIChsb2NhdGlvbiAhPT0gbnVsbCAmJiB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHRGcm9tTW91c2VQb3MobG9jYXRpb24sIFwibW91c2Vtb3ZlXCIpO1xuICAgIH1cbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBwbGFuRGVmaW5pdGlvbkhhc0JlZW5DaGFuZ2VkKCkge1xuICAgIHRoaXMucmFkYXJTY2FsZSA9IG51bGw7XG4gICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuZ3JvdXBCeU9wdGlvbnMgPSBbXCJcIiwgLi4uT2JqZWN0LmtleXModGhpcy5wbGFuLnJlc291cmNlRGVmaW5pdGlvbnMpXTtcbiAgICB0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXggPSAwO1xuICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRUYXNrUGFuZWwgPSBidWlsZFNlbGVjdGVkVGFza1BhbmVsKFxuICAgICAgdGhpcy5wbGFuLFxuICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwic2VsZWN0ZWQtdGFzay1wYW5lbFwiKSEsXG4gICAgICB0aGlzXG4gICAgKTtcbiAgICB0aGlzLnJlY2FsY3VsYXRlU3BhbnNBbmRDcml0aWNhbFBhdGgoKTtcbiAgfVxuXG4gIHJlY2FsY3VsYXRlU3BhbnNBbmRDcml0aWNhbFBhdGgoKSB7XG4gICAgLy8gUG9wdWxhdGUgdGhlIGRvd25sb2FkIGxpbmsuXG4gICAgLy8gVE9ETyAtIE9ubHkgZG8gdGhpcyBvbiBkZW1hbmQuXG4gICAgY29uc3QgZG93bmxvYWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxMaW5rRWxlbWVudD4oXCIjZG93bmxvYWRcIikhO1xuICAgIGNvbnN0IGRvd25sb2FkQmxvYiA9IG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeSh0aGlzLnBsYW4sIG51bGwsIFwiICBcIildLCB7XG4gICAgICB0eXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICB9KTtcbiAgICBkb3dubG9hZC5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChkb3dubG9hZEJsb2IpO1xuXG4gICAgbGV0IHNsYWNrczogU2xhY2tbXSA9IFtdO1xuXG4gICAgY29uc3Qgc2xhY2tSZXN1bHQgPSBDb21wdXRlU2xhY2soXG4gICAgICB0aGlzLnBsYW4uY2hhcnQsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICBwcmVjaXNpb24ucm91bmRlcigpXG4gICAgKTtcbiAgICBpZiAoIXNsYWNrUmVzdWx0Lm9rKSB7XG4gICAgICBjb25zb2xlLmVycm9yKHNsYWNrUmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2xhY2tzID0gc2xhY2tSZXN1bHQudmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5zcGFucyA9IHNsYWNrcy5tYXAoKHZhbHVlOiBTbGFjayk6IFNwYW4gPT4ge1xuICAgICAgcmV0dXJuIHZhbHVlLmVhcmx5O1xuICAgIH0pO1xuICAgIHRoaXMuY3JpdGljYWxQYXRoID0gQ3JpdGljYWxQYXRoKHNsYWNrcywgcHJlY2lzaW9uLnJvdW5kZXIoKSk7XG4gICAgdGhpcy51cGRhdGVTZWxlY3RlZFRhc2tQYW5lbCEodGhpcy5zZWxlY3RlZFRhc2spO1xuICB9XG5cbiAgZ2V0VGFza0xhYmVsbGVyKCk6IFRhc2tMYWJlbCB7XG4gICAgcmV0dXJuICh0YXNrSW5kZXg6IG51bWJlcik6IHN0cmluZyA9PlxuICAgICAgYCR7dGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0ubmFtZX1gO1xuICB9XG5cbiAgZHJhZ1JhbmdlSGFuZGxlcihlOiBDdXN0b21FdmVudDxEcmFnUmFuZ2U+KSB7XG4gICAgaWYgKHRoaXMucmFkYXJTY2FsZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBiZWdpbiA9IHRoaXMucmFkYXJTY2FsZS5kYXlSb3dGcm9tUG9pbnQoZS5kZXRhaWwuYmVnaW4pO1xuICAgIGNvbnN0IGVuZCA9IHRoaXMucmFkYXJTY2FsZS5kYXlSb3dGcm9tUG9pbnQoZS5kZXRhaWwuZW5kKTtcbiAgICB0aGlzLmRpc3BsYXlSYW5nZSA9IG5ldyBEaXNwbGF5UmFuZ2UoYmVnaW4uZGF5LCBlbmQuZGF5KTtcbiAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgfVxuXG4gIHRvZ2dsZVJhZGFyKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcihcInJhZGFyLXBhcmVudFwiKSEuY2xhc3NMaXN0LnRvZ2dsZShcImhpZGRlblwiKTtcbiAgfVxuXG4gIHRvZ2dsZUdyb3VwQnkoKSB7XG4gICAgdGhpcy5ncm91cEJ5T3B0aW9uc0luZGV4ID1cbiAgICAgICh0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXggKyAxKSAlIHRoaXMuZ3JvdXBCeU9wdGlvbnMubGVuZ3RoO1xuICB9XG5cbiAgdG9nZ2xlQ3JpdGljYWxQYXRoc09ubHkoKSB7XG4gICAgdGhpcy5jcml0aWNhbFBhdGhzT25seSA9ICF0aGlzLmNyaXRpY2FsUGF0aHNPbmx5O1xuICB9XG5cbiAgdG9nZ2xlRm9jdXNPblRhc2soKSB7XG4gICAgdGhpcy5mb2N1c09uVGFzayA9ICF0aGlzLmZvY3VzT25UYXNrO1xuICAgIGlmICghdGhpcy5mb2N1c09uVGFzaykge1xuICAgICAgdGhpcy5kaXNwbGF5UmFuZ2UgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGZvcmNlRm9jdXNPblRhc2soKSB7XG4gICAgdGhpcy5mb2N1c09uVGFzayA9IHRydWU7XG4gIH1cblxuICBwYWludENoYXJ0KCkge1xuICAgIGNvbnNvbGUudGltZShcInBhaW50Q2hhcnRcIik7XG5cbiAgICBjb25zdCB0aGVtZUNvbG9yczogVGhlbWUgPSBjb2xvclRoZW1lRnJvbUVsZW1lbnQoZG9jdW1lbnQuYm9keSk7XG5cbiAgICBsZXQgZmlsdGVyRnVuYzogRmlsdGVyRnVuYyB8IG51bGwgPSBudWxsO1xuICAgIGNvbnN0IHN0YXJ0QW5kRmluaXNoID0gWzAsIHRoaXMucGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggLSAxXTtcbiAgICBpZiAodGhpcy5jcml0aWNhbFBhdGhzT25seSkge1xuICAgICAgY29uc3QgaGlnaGxpZ2h0U2V0ID0gbmV3IFNldCh0aGlzLmNyaXRpY2FsUGF0aCk7XG4gICAgICBmaWx0ZXJGdW5jID0gKHRhc2s6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGlmIChzdGFydEFuZEZpbmlzaC5pbmNsdWRlcyh0YXNrSW5kZXgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhpZ2hsaWdodFNldC5oYXModGFza0luZGV4KTtcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0aGlzLmZvY3VzT25UYXNrICYmIHRoaXMuc2VsZWN0ZWRUYXNrICE9IC0xKSB7XG4gICAgICAvLyBGaW5kIGFsbCBwcmVkZWNlc3NvciBhbmQgc3VjY2Vzc29ycyBvZiB0aGUgZ2l2ZW4gdGFzay5cbiAgICAgIGNvbnN0IG5laWdoYm9yU2V0ID0gbmV3IFNldCgpO1xuICAgICAgbmVpZ2hib3JTZXQuYWRkKHRoaXMuc2VsZWN0ZWRUYXNrKTtcbiAgICAgIGxldCBlYXJsaWVzdFN0YXJ0ID0gdGhpcy5zcGFuc1t0aGlzLnNlbGVjdGVkVGFza10uc3RhcnQ7XG4gICAgICBsZXQgbGF0ZXN0RmluaXNoID0gdGhpcy5zcGFuc1t0aGlzLnNlbGVjdGVkVGFza10uZmluaXNoO1xuICAgICAgdGhpcy5wbGFuLmNoYXJ0LkVkZ2VzLmZvckVhY2goKGVkZ2U6IERpcmVjdGVkRWRnZSkgPT4ge1xuICAgICAgICBpZiAoZWRnZS5pID09PSB0aGlzLnNlbGVjdGVkVGFzaykge1xuICAgICAgICAgIG5laWdoYm9yU2V0LmFkZChlZGdlLmopO1xuICAgICAgICAgIGlmIChsYXRlc3RGaW5pc2ggPCB0aGlzLnNwYW5zW2VkZ2Uual0uZmluaXNoKSB7XG4gICAgICAgICAgICBsYXRlc3RGaW5pc2ggPSB0aGlzLnNwYW5zW2VkZ2Uual0uZmluaXNoO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZWRnZS5qID09PSB0aGlzLnNlbGVjdGVkVGFzaykge1xuICAgICAgICAgIG5laWdoYm9yU2V0LmFkZChlZGdlLmkpO1xuICAgICAgICAgIGlmIChlYXJsaWVzdFN0YXJ0ID4gdGhpcy5zcGFuc1tlZGdlLmldLnN0YXJ0KSB7XG4gICAgICAgICAgICBlYXJsaWVzdFN0YXJ0ID0gdGhpcy5zcGFuc1tlZGdlLmldLnN0YXJ0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvLyBUT0RPIC0gU2luY2Ugd2Ugb3ZlcndyaXRlIGRpc3BsYXlSYW5nZSB0aGF0IG1lYW5zIGRyYWdnaW5nIG9uIHRoZSByYWRhclxuICAgICAgLy8gd2lsbCBub3Qgd29yayB3aGVuIGZvY3VzaW5nIG9uIGEgc2VsZWN0ZWQgdGFzay4gQnVnIG9yIGZlYXR1cmU/XG4gICAgICB0aGlzLmRpc3BsYXlSYW5nZSA9IG5ldyBEaXNwbGF5UmFuZ2UoZWFybGllc3RTdGFydCAtIDEsIGxhdGVzdEZpbmlzaCArIDEpO1xuXG4gICAgICBmaWx0ZXJGdW5jID0gKHRhc2s6IFRhc2ssIHRhc2tJbmRleDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGlmIChzdGFydEFuZEZpbmlzaC5pbmNsdWRlcyh0YXNrSW5kZXgpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmVpZ2hib3JTZXQuaGFzKHRhc2tJbmRleCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHJhZGFyT3B0czogUmVuZGVyT3B0aW9ucyA9IHtcbiAgICAgIGZvbnRTaXplUHg6IDYsXG4gICAgICBoYXNUZXh0OiBmYWxzZSxcbiAgICAgIGRpc3BsYXlSYW5nZTogdGhpcy5kaXNwbGF5UmFuZ2UsXG4gICAgICBkaXNwbGF5UmFuZ2VVc2FnZTogXCJoaWdobGlnaHRcIixcbiAgICAgIGNvbG9yczoge1xuICAgICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlTXV0ZWQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZU11dGVkLFxuICAgICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgICAgZ3JvdXBDb2xvcjogdGhlbWVDb2xvcnMuZ3JvdXBDb2xvcixcbiAgICAgICAgaGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5oaWdobGlnaHQsXG4gICAgICB9LFxuICAgICAgaGFzVGltZWxpbmU6IGZhbHNlLFxuICAgICAgaGFzVGFza3M6IHRydWUsXG4gICAgICBoYXNFZGdlczogZmFsc2UsXG4gICAgICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiBmYWxzZSxcbiAgICAgIHRhc2tMYWJlbDogdGhpcy5nZXRUYXNrTGFiZWxsZXIoKSxcbiAgICAgIHRhc2tFbXBoYXNpemU6IHRoaXMuY3JpdGljYWxQYXRoLFxuICAgICAgZmlsdGVyRnVuYzogbnVsbCxcbiAgICAgIGdyb3VwQnlSZXNvdXJjZTogdGhpcy5ncm91cEJ5T3B0aW9uc1t0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXhdLFxuICAgICAgaGlnaGxpZ2h0ZWRUYXNrOiBudWxsLFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXg6IHRoaXMuc2VsZWN0ZWRUYXNrLFxuICAgIH07XG5cbiAgICBjb25zdCB6b29tT3B0czogUmVuZGVyT3B0aW9ucyA9IHtcbiAgICAgIGZvbnRTaXplUHg6IEZPTlRfU0laRV9QWCxcbiAgICAgIGhhc1RleHQ6IHRydWUsXG4gICAgICBkaXNwbGF5UmFuZ2U6IHRoaXMuZGlzcGxheVJhbmdlLFxuICAgICAgZGlzcGxheVJhbmdlVXNhZ2U6IFwicmVzdHJpY3RcIixcbiAgICAgIGNvbG9yczoge1xuICAgICAgICBzdXJmYWNlOiB0aGVtZUNvbG9ycy5zdXJmYWNlLFxuICAgICAgICBvblN1cmZhY2U6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlTXV0ZWQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZU11dGVkLFxuICAgICAgICBvblN1cmZhY2VIaWdobGlnaHQ6IHRoZW1lQ29sb3JzLm9uU3VyZmFjZVNlY29uZGFyeSxcbiAgICAgICAgb3ZlcmxheTogdGhlbWVDb2xvcnMub3ZlcmxheSxcbiAgICAgICAgZ3JvdXBDb2xvcjogdGhlbWVDb2xvcnMuZ3JvdXBDb2xvcixcbiAgICAgICAgaGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5oaWdobGlnaHQsXG4gICAgICB9LFxuICAgICAgaGFzVGltZWxpbmU6IHRoaXMudG9wVGltZWxpbmUsXG4gICAgICBoYXNUYXNrczogdHJ1ZSxcbiAgICAgIGhhc0VkZ2VzOiB0cnVlLFxuICAgICAgZHJhd1RpbWVNYXJrZXJzT25UYXNrczogdHJ1ZSxcbiAgICAgIHRhc2tMYWJlbDogdGhpcy5nZXRUYXNrTGFiZWxsZXIoKSxcbiAgICAgIHRhc2tFbXBoYXNpemU6IHRoaXMuY3JpdGljYWxQYXRoLFxuICAgICAgZmlsdGVyRnVuYzogZmlsdGVyRnVuYyxcbiAgICAgIGdyb3VwQnlSZXNvdXJjZTogdGhpcy5ncm91cEJ5T3B0aW9uc1t0aGlzLmdyb3VwQnlPcHRpb25zSW5kZXhdLFxuICAgICAgaGlnaGxpZ2h0ZWRUYXNrOiAxLFxuICAgICAgc2VsZWN0ZWRUYXNrSW5kZXg6IHRoaXMuc2VsZWN0ZWRUYXNrLFxuICAgIH07XG5cbiAgICBjb25zdCB0aW1lbGluZU9wdHM6IFJlbmRlck9wdGlvbnMgPSB7XG4gICAgICBmb250U2l6ZVB4OiBGT05UX1NJWkVfUFgsXG4gICAgICBoYXNUZXh0OiB0cnVlLFxuICAgICAgZGlzcGxheVJhbmdlOiB0aGlzLmRpc3BsYXlSYW5nZSxcbiAgICAgIGRpc3BsYXlSYW5nZVVzYWdlOiBcInJlc3RyaWN0XCIsXG4gICAgICBjb2xvcnM6IHtcbiAgICAgICAgc3VyZmFjZTogdGhlbWVDb2xvcnMuc3VyZmFjZSxcbiAgICAgICAgb25TdXJmYWNlOiB0aGVtZUNvbG9ycy5vblN1cmZhY2UsXG4gICAgICAgIG9uU3VyZmFjZU11dGVkOiB0aGVtZUNvbG9ycy5vblN1cmZhY2VNdXRlZCxcbiAgICAgICAgb25TdXJmYWNlSGlnaGxpZ2h0OiB0aGVtZUNvbG9ycy5vblN1cmZhY2VTZWNvbmRhcnksXG4gICAgICAgIG92ZXJsYXk6IHRoZW1lQ29sb3JzLm92ZXJsYXksXG4gICAgICAgIGdyb3VwQ29sb3I6IHRoZW1lQ29sb3JzLmdyb3VwQ29sb3IsXG4gICAgICAgIGhpZ2hsaWdodDogdGhlbWVDb2xvcnMuaGlnaGxpZ2h0LFxuICAgICAgfSxcbiAgICAgIGhhc1RpbWVsaW5lOiB0cnVlLFxuICAgICAgaGFzVGFza3M6IGZhbHNlLFxuICAgICAgaGFzRWRnZXM6IHRydWUsXG4gICAgICBkcmF3VGltZU1hcmtlcnNPblRhc2tzOiB0cnVlLFxuICAgICAgdGFza0xhYmVsOiB0aGlzLmdldFRhc2tMYWJlbGxlcigpLFxuICAgICAgdGFza0VtcGhhc2l6ZTogdGhpcy5jcml0aWNhbFBhdGgsXG4gICAgICBmaWx0ZXJGdW5jOiBmaWx0ZXJGdW5jLFxuICAgICAgZ3JvdXBCeVJlc291cmNlOiB0aGlzLmdyb3VwQnlPcHRpb25zW3RoaXMuZ3JvdXBCeU9wdGlvbnNJbmRleF0sXG4gICAgICBoaWdobGlnaHRlZFRhc2s6IG51bGwsXG4gICAgICBzZWxlY3RlZFRhc2tJbmRleDogdGhpcy5zZWxlY3RlZFRhc2ssXG4gICAgfTtcblxuICAgIGNvbnN0IHJldCA9IHRoaXMucGFpbnRPbmVDaGFydChcIiNyYWRhclwiLCByYWRhck9wdHMpO1xuICAgIGlmICghcmV0Lm9rKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucmFkYXJTY2FsZSA9IHJldC52YWx1ZS5zY2FsZTtcblxuICAgIHRoaXMucGFpbnRPbmVDaGFydChcIiN0aW1lbGluZVwiLCB0aW1lbGluZU9wdHMpO1xuICAgIGNvbnN0IHpvb21SZXQgPSB0aGlzLnBhaW50T25lQ2hhcnQoXCIjem9vbWVkXCIsIHpvb21PcHRzLCBcIiNvdmVybGF5XCIpO1xuICAgIGlmICh6b29tUmV0Lm9rKSB7XG4gICAgICB0aGlzLnVwZGF0ZUhpZ2hsaWdodEZyb21Nb3VzZVBvcyA9XG4gICAgICAgIHpvb21SZXQudmFsdWUudXBkYXRlSGlnaGxpZ2h0RnJvbU1vdXNlUG9zO1xuICAgICAgaWYgKHpvb21SZXQudmFsdWUuc2VsZWN0ZWRUYXNrTG9jYXRpb24gIT09IG51bGwpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImNoYXJ0LXBhcmVudFwiKSEuc2Nyb2xsKHtcbiAgICAgICAgICB0b3A6IHpvb21SZXQudmFsdWUuc2VsZWN0ZWRUYXNrTG9jYXRpb24ueSxcbiAgICAgICAgICBiZWhhdmlvcjogXCJzbW9vdGhcIixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS50aW1lRW5kKFwicGFpbnRDaGFydFwiKTtcbiAgfVxuXG4gIHByZXBhcmVDYW52YXMoXG4gICAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCxcbiAgICBjYW52YXNXaWR0aDogbnVtYmVyLFxuICAgIGNhbnZhc0hlaWdodDogbnVtYmVyLFxuICAgIHdpZHRoOiBudW1iZXIsXG4gICAgaGVpZ2h0OiBudW1iZXJcbiAgKTogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHtcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXNXaWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0O1xuICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcblxuICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikhO1xuICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcblxuICAgIHJldHVybiBjdHg7XG4gIH1cblxuICBwYWludE9uZUNoYXJ0KFxuICAgIGNhbnZhc0lEOiBzdHJpbmcsXG4gICAgb3B0czogUmVuZGVyT3B0aW9ucyxcbiAgICBvdmVybGF5SUQ6IHN0cmluZyA9IFwiXCJcbiAgKTogUmVzdWx0PFJlbmRlclJlc3VsdD4ge1xuICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MQ2FudmFzRWxlbWVudD4oY2FudmFzSUQpITtcbiAgICBjb25zdCBwYXJlbnQgPSBjYW52YXMhLnBhcmVudEVsZW1lbnQhO1xuICAgIGNvbnN0IHJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgY29uc3Qgd2lkdGggPSBwYXJlbnQuY2xpZW50V2lkdGggLSBGT05UX1NJWkVfUFg7XG4gICAgbGV0IGhlaWdodCA9IHBhcmVudC5jbGllbnRIZWlnaHQ7XG4gICAgY29uc3QgY2FudmFzV2lkdGggPSBNYXRoLmNlaWwod2lkdGggKiByYXRpbyk7XG4gICAgbGV0IGNhbnZhc0hlaWdodCA9IE1hdGguY2VpbChoZWlnaHQgKiByYXRpbyk7XG5cbiAgICBjb25zdCBuZXdIZWlnaHQgPSBzdWdnZXN0ZWRDYW52YXNIZWlnaHQoXG4gICAgICBjYW52YXMsXG4gICAgICB0aGlzLnNwYW5zLFxuICAgICAgb3B0cyxcbiAgICAgIHRoaXMucGxhbi5jaGFydC5WZXJ0aWNlcy5sZW5ndGggKyAyIC8vIFRPRE8gLSBXaHkgZG8gd2UgbmVlZCB0aGUgKzIgaGVyZSE/XG4gICAgKTtcbiAgICBjYW52YXNIZWlnaHQgPSBuZXdIZWlnaHQ7XG4gICAgaGVpZ2h0ID0gbmV3SGVpZ2h0IC8gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG5cbiAgICBsZXQgb3ZlcmxheTogSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgICBpZiAob3ZlcmxheUlEKSB7XG4gICAgICBvdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MQ2FudmFzRWxlbWVudD4ob3ZlcmxheUlEKSE7XG4gICAgICB0aGlzLnByZXBhcmVDYW52YXMob3ZlcmxheSwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCwgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuICAgIGNvbnN0IGN0eCA9IHRoaXMucHJlcGFyZUNhbnZhcyhcbiAgICAgIGNhbnZhcyxcbiAgICAgIGNhbnZhc1dpZHRoLFxuICAgICAgY2FudmFzSGVpZ2h0LFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHRcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlbmRlclRhc2tzVG9DYW52YXMoXG4gICAgICBwYXJlbnQsXG4gICAgICBjYW52YXMsXG4gICAgICBjdHgsXG4gICAgICB0aGlzLnBsYW4sXG4gICAgICB0aGlzLnNwYW5zLFxuICAgICAgb3B0cyxcbiAgICAgIG92ZXJsYXlcbiAgICApO1xuICB9XG5cbiAgb25Qb3RlbnRpYWxDcml0aWNpYWxQYXRoQ2xpY2soXG4gICAga2V5OiBzdHJpbmcsXG4gICAgYWxsQ3JpdGljYWxQYXRoczogTWFwPHN0cmluZywgQ3JpdGljYWxQYXRoRW50cnk+XG4gICkge1xuICAgIGNvbnN0IGNyaXRpY2FsUGF0aEVudHJ5ID0gYWxsQ3JpdGljYWxQYXRocy5nZXQoa2V5KSE7XG4gICAgY3JpdGljYWxQYXRoRW50cnkuZHVyYXRpb25zLmZvckVhY2goXG4gICAgICAoZHVyYXRpb246IG51bWJlciwgdGFza0luZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgdGhpcy5wbGFuLmNoYXJ0LlZlcnRpY2VzW3Rhc2tJbmRleF0uZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMucmVjYWxjdWxhdGVTcGFuc0FuZENyaXRpY2FsUGF0aCgpO1xuICAgIHRoaXMucGFpbnRDaGFydCgpO1xuICB9XG5cbiAgc2ltdWxhdGUoKSB7XG4gICAgLy8gUnVuIHRoZSBzaW11bGF0aW9uLlxuICAgIGNvbnN0IGFsbENyaXRpY2FsUGF0aHMgPSBzaW11bGF0aW9uKHRoaXMucGxhbiwgTlVNX1NJTVVMQVRJT05fTE9PUFMpO1xuXG4gICAgLy8gRGlzcGxheSBhbGwgdGhlIHBvdGVudGlhbCBjcml0aWNhbCBwYXRocyBmb3VuZC5cbiAgICByZW5kZXIoXG4gICAgICBjcml0aWNhbFBhdGhzVGVtcGxhdGUoYWxsQ3JpdGljYWxQYXRocywgdGhpcyksXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcIiNjcml0aWNhbFBhdGhzXCIpIVxuICAgICk7XG5cbiAgICAvLyBGaW5kIGhvdyBvZnRlbiBlYWNoIHRhc2sgYXBwZWFycyBvbiBhbGwgdGhlIHBvdGVudGlhbCBjcml0aWNhbCBwYXRoLlxuICAgIGNvbnN0IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcgPSBjcml0aWNhbFRhc2tGcmVxdWVuY2llcyhcbiAgICAgIGFsbENyaXRpY2FsUGF0aHMsXG4gICAgICB0aGlzLnBsYW5cbiAgICApO1xuXG4gICAgLy8gRGlzcGxheSBhIHRhYmxlIG9mIHRhc2tzIG9uIGFsbCBwb3RlbnRpYWwgY3JpdGljYWwgcGF0aHMuXG4gICAgcmVuZGVyKFxuICAgICAgY3JpdGljYWxUYXNrRnJlcXVlbmNpZXNUZW1wbGF0ZShcbiAgICAgICAgdGhpcy5wbGFuLFxuICAgICAgICBjcml0aWNhbFRhc2tzRHVyYXRpb25EZXNjZW5kaW5nXG4gICAgICApLFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCIjY3JpdGljYWxUYXNrc1wiKSFcbiAgICApO1xuXG4gICAgLy8gUmVzZXQgdGhlIHNwYW5zIHVzaW5nIHRoZSBvcmlnaW5hbCBkdXJhdGlvbnMuXG4gICAgdGhpcy5yZWNhbGN1bGF0ZVNwYW5zQW5kQ3JpdGljYWxQYXRoKCk7XG5cbiAgICAvLyBIaWdobGlnaHQgYWxsIHRoZSB0YXNrcyB0aGF0IGNvdWxkIGFwcGVhciBvbiB0aGUgY3JpdGljYWwgcGF0aC5cbiAgICB0aGlzLmNyaXRpY2FsUGF0aCA9IGNyaXRpY2FsVGFza3NEdXJhdGlvbkRlc2NlbmRpbmcubWFwKFxuICAgICAgKHRhc2tFbnRyeTogQ3JpdGljYWxQYXRoVGFza0VudHJ5KSA9PiB0YXNrRW50cnkudGFza0luZGV4XG4gICAgKTtcbiAgICB0aGlzLnBhaW50Q2hhcnQoKTtcbiAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoXCJleHBsYW4tbWFpblwiLCBFeHBsYW5NYWluKTtcbiIsICJpbXBvcnQgeyBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IEtleU1hcCB9IGZyb20gXCIuLi9rZXltYXAva2V5bWFwLnRzXCI7XG5pbXBvcnQgeyBBY3Rpb25SZWdpc3RyeSB9IGZyb20gXCIuLi9hY3Rpb24vcmVnaXN0cnlcIjtcblxuY2xhc3MgS2V5Ym9hcmRNYXBEaWFsb2cgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGNvbm5lY3RlZENhbGxiYWNrKCk6IHZvaWQge1xuICAgIGNvbnN0IGtleW1hcEVudHJpZXMgPSBbLi4uS2V5TWFwLmVudHJpZXMoKV07XG4gICAga2V5bWFwRW50cmllcy5zb3J0KCk7XG4gICAgcmVuZGVyKFxuICAgICAgaHRtbGBcbiAgICAgICAgPGRpYWxvZz5cbiAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICAke2tleW1hcEVudHJpZXMubWFwKFxuICAgICAgICAgICAgICAoW2tleSwgYWN0aW9uTmFtZV0pID0+XG4gICAgICAgICAgICAgICAgaHRtbGA8dHI+XG4gICAgICAgICAgICAgICAgICA8dGQ+JHtrZXl9PC90ZD5cbiAgICAgICAgICAgICAgICAgIDx0ZD4ke0FjdGlvblJlZ2lzdHJ5W2FjdGlvbk5hbWVdLmRlc2NyaXB0aW9ufTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5gXG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgIDwvZGlhbG9nPlxuICAgICAgYCxcbiAgICAgIHRoaXNcbiAgICApO1xuICB9XG5cbiAgc2hvd01vZGFsKCkge1xuICAgIHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MRGlhbG9nRWxlbWVudD4oXCJkaWFsb2dcIikhLnNob3dNb2RhbCgpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcImtleWJvYXJkLW1hcC1kaWFsb2dcIiwgS2V5Ym9hcmRNYXBEaWFsb2cpO1xuIiwgImltcG9ydCB7IFRlbXBsYXRlUmVzdWx0LCBodG1sLCByZW5kZXIgfSBmcm9tIFwibGl0LWh0bWxcIjtcbmltcG9ydCB7IEV4cGxhbk1haW4gfSBmcm9tIFwiLi4vZXhwbGFuTWFpbi9leHBsYW5NYWluLnRzXCI7XG5pbXBvcnQgZnV6enlzb3J0IGZyb20gXCJmdXp6eXNvcnRcIjtcbmltcG9ydCB7IFRhc2sgfSBmcm9tIFwiLi4vY2hhcnQvY2hhcnQudHNcIjtcblxuLyoqIFRoZSBpbmRleGVzIHJldHVybmVkIGJ5IGZ1enp5c29ydCBpcyBqdXN0IGEgbGlzdCBvZiB0aGUgaW5kZXhlcyBvZiB0aGUgdGhlXG4gKiAgaW5kaXZpZHVhbCBjaGFycyB0aGF0IGhhdmUgYmVlbiBtYXRjaGVkLiBXZSBuZWVkIHRvIHR1cm4gdGhhdCBpbnRvIHBhaXJzIG9mXG4gKiAgbnVtYmVycyB3ZSBjYW4gcGFzcyB0byBTdHJpbmcucHJvdG90eXBlLnNsaWNlKCkuXG4gKlxuICogIFRoZSBvYnNlcnZhdGlvbiBoZXJlIGlzIHRoYXQgaWYgdGhlIHRhcmdldCBzdHJpbmcgaXMgXCJIZWxsb1wiIGFuZCB0aGUgaW5kaWNlc1xuICogIGFyZSBbMiwzXSB0aGVuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHdlIG1hcmt1cCB0aGUgaGlnaGxpZ2h0ZWQgdGFyZ2V0IGFzXG4gKiAgXCJIZTxiPmxsPC9iPm9cIiBvciBcIkhlPGI+bDwvYj48Yj5sPC9iPm9cIi4gVGhhdCBpcywgd2UgY2FuIHNpbXBsaWZ5IGlmIHdlXG4gKiAgYWx3YXlzIHNsaWNlIG91dCBlYWNoIGNoYXJhY3RlciBpbiB0aGUgdGFyZ2V0IHN0cmluZyB0aGF0IG5lZWRzIHRvIGJlXG4gKiAgaGlnaGxpZ2h0ZWQuXG4gKlxuICogIFNvIGluZGV4ZXNUb1JhbmdlcyByZXR1cm5zIGFuIGFycmF5IG9mIGluZGV4ZXMsIHRoYXQgaWYgdGFrZW4gaW4gcGFpcnMsIHdpbGxcbiAqICBhbHRlcm5hdGVseSBzbGljZSBvZmYgcGFydHMgb2YgdGFyZ2V0IHRoYXQgbmVlZCB0byBiZSBlbXBoYXNpemVkLlxuICpcbiAqICBJbiB0aGUgYWJvdmUgZXhhbXBsZSB0YXJnZXQgPSBcIkhlbGxvXCIgYW5kIGluZGV4ZXMgPSBbMiwzXSwgdGhlblxuICogIGluZGV4ZXNUb1JhbmdlcyB3aWxsIHJldHVyblwiXG4gKlxuICogICAgIFswLDIsMywzLDQsNV1cbiAqXG4gKiAgd2hpY2ggd2lsbCBnZW5lcmF0ZSB0aGUgZm9sbG93aW5nIHBhaXJzIGFzIGFyZ3MgdG8gc2xpY2U6XG4gKlxuICogICAgIFswLDJdIEhlXG4gKiAgICAgWzIsM10gbCAgICNcbiAqICAgICBbMywzXVxuICogICAgIFszLDRdIGwgICAjXG4gKiAgICAgWzQsNV0gb1xuICpcbiAqIE5vdGUgdGhhdCBpZiB3ZSBhbHRlcm5hdGUgYm9sZGluZyB0aGVuIG9ubHkgdGhlIHR3byAnbCdzIGdldCBlbXBoYXNpemVkLFxuICogd2hpY2ggaXMgd2hhdCB3ZSB3YW50IChEZW5vdGVkIGJ5ICMgYWJvdmUpLlxuICovXG5jb25zdCBpbmRleGVzVG9SYW5nZXMgPSAoXG4gIGluZGV4ZXM6IFJlYWRvbmx5PG51bWJlcltdPixcbiAgbGVuOiBudW1iZXJcbik6IG51bWJlcltdID0+IHtcbiAgLy8gQ29udmVydCBlYWNoIGluZGV4IG9mIGEgaGlnaGxpZ2h0ZWQgY2hhciBpbnRvIGEgcGFpciBvZiBudW1iZXJzIHdlIGNhbiBwYXNzXG4gIC8vIHRvIHNsaWNlLCBhbmQgdGhlbiBmbGF0dGVuLlxuICBjb25zdCByYW5nZXMgPSBpbmRleGVzLm1hcCgoeDogbnVtYmVyKSA9PiBbeCwgeCArIDFdKS5mbGF0KCk7XG5cbiAgLy8gTm93IHByZXBlbmQgd2l0aCAwIGFuZCBhcHBlbmQgJ2xlbicgc28gdGhhdCB3ZSBoYXZlIHBhaXJzIHRoYXQgd2lsbCBzbGljZVxuICAvLyB0YXJnZXQgZnVsbHkgaW50byBzdWJzdHJpbmdzLiBSZW1lbWJlciB0aGF0IHNsaWNlIHJldHVybiBjaGFycyBpbiBbYSwgYiksXG4gIC8vIGkuZS4gU3RyaW5nLnNsaWNlKGEsYikgd2hlcmUgYiBpcyBvbmUgYmV5b25kIHRoZSBsYXN0IGNoYXIgaW4gdGhlIHN0cmluZyB3ZVxuICAvLyB3YW50IHRvIGluY2x1ZGUuXG4gIHJldHVybiBbMCwgLi4ucmFuZ2VzLCBsZW5dO1xufTtcblxuLyoqIFJldHVybnMgdGhlIHRhcmdldCBzdHJpbmcgaGlnaGxpZ2h0ZWQgYXJvdW5kIHRoZSBnaXZlbiBjaGFyYWN0ZXIgaW5kZXhlcyBpblxuICogIHRoZSByYW5nZXMgYXJyYXkuICovXG5jb25zdCBoaWdobGlnaHQgPSAocmFuZ2VzOiBudW1iZXJbXSwgdGFyZ2V0OiBzdHJpbmcpOiBUZW1wbGF0ZVJlc3VsdFtdID0+IHtcbiAgY29uc3QgcmV0OiBUZW1wbGF0ZVJlc3VsdFtdID0gW107XG4gIGxldCBpbkhpZ2hsaWdodCA9IGZhbHNlO1xuXG4gIC8vIFJ1biBkb3duIHJhbmdlcyB3aXRoIGEgc2xpZGluZyB3aW5kb3cgb2YgbGVuZ3RoIDIgYW5kIHVzZSB0aGF0IGFzIHRoZVxuICAvLyBhcmd1bWVudHMgdG8gc2xpY2UuIEFsdGVybmF0ZSBoaWdobGlnaHRpbmcgZWFjaCBzZWdtZW50LlxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBjb25zdCBzdWIgPSB0YXJnZXQuc2xpY2UocmFuZ2VzW2ldLCByYW5nZXNbaSArIDFdKTtcbiAgICBpZiAoaW5IaWdobGlnaHQpIHtcbiAgICAgIHJldC5wdXNoKGh0bWxgPGI+JHtzdWJ9PC9iPmApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXQucHVzaChodG1sYCR7c3VifWApO1xuICAgIH1cbiAgICBpbkhpZ2hsaWdodCA9ICFpbkhpZ2hsaWdodDtcbiAgfVxuICByZXR1cm4gcmV0O1xufTtcblxuLyoqIFJldHVybnMgdGhlIHRhcmdldCBzdHJpbmcgaGlnaGxpZ2h0ZWQgYXJvdW5kIHRoZSBnaXZlbiBjaGFyYWN0ZXIgaW5kZXhlcy5cbiAqICBOb3RlIHRoYXQgd2UgZG9uJ3QgdXNlIGZ1enp5c29ydCdzIGhpZ2hsaWdodCBiZWNhdXNlIHdlIGhhdmVuJ3Qgc2FuaXRpemVkXG4gKiAgdGhlIG5hbWVzLlxuICovXG5jb25zdCBoaWdobGlnaHRlZFRhcmdldCA9IChcbiAgaW5kZXhlczogUmVhZG9ubHk8bnVtYmVyW10+LFxuICB0YXJnZXQ6IHN0cmluZ1xuKTogVGVtcGxhdGVSZXN1bHRbXSA9PiB7XG4gIHJldHVybiBoaWdobGlnaHQoaW5kZXhlc1RvUmFuZ2VzKGluZGV4ZXMsIHRhcmdldC5sZW5ndGgpLCB0YXJnZXQpO1xufTtcblxuY29uc3QgdGVtcGxhdGUgPSAoc2VhcmNoVGFza1BhbmVsOiBTZWFyY2hUYXNrUGFuZWwpID0+IGh0bWxgXG4gIDxpbnB1dFxuICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICBAaW5wdXQ9XCIkeyhlOiBJbnB1dEV2ZW50KSA9PiB7XG4gICAgICBzZWFyY2hUYXNrUGFuZWwub25JbnB1dChlKTtcbiAgICB9fVwiXG4gICAgQGtleWRvd249XCIkeyhlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBzZWFyY2hUYXNrUGFuZWwub25LZXlEb3duKGUpO1xuICAgIH19XCJcbiAgICBAYmx1cj1cIiR7KCkgPT4ge1xuICAgICAgc2VhcmNoVGFza1BhbmVsLmxvc3NPZkZvY3VzKCk7XG4gICAgfX1cIlxuICAvPlxuICA8dWw+XG4gICAgJHtzZWFyY2hUYXNrUGFuZWwuc2VhcmNoUmVzdWx0cy5tYXAoXG4gICAgICAodGFzazogRnV6enlzb3J0LktleVJlc3VsdDxUYXNrPiwgaW5kZXg6IG51bWJlcikgPT5cbiAgICAgICAgaHRtbGAgPGxpXG4gICAgICAgICAgQGNsaWNrPVwiJHsoKSA9PiBzZWFyY2hUYXNrUGFuZWwuc2VsZWN0U2VhcmNoUmVzdWx0KGluZGV4KX1cIlxuICAgICAgICAgID9kYXRhLWZvY3VzPSR7aW5kZXggPT09IHNlYXJjaFRhc2tQYW5lbC5mb2N1c0luZGV4fVxuICAgICAgICA+XG4gICAgICAgICAgJHtoaWdobGlnaHRlZFRhcmdldCh0YXNrLmluZGV4ZXMsIHRhc2sudGFyZ2V0KX1cbiAgICAgICAgPC9saT5gXG4gICAgKX1cbiAgPC91bD5cbmA7XG5cbnR5cGUgU2VhcmNoVHlwZSA9IFwibmFtZS1vbmx5XCIgfCBcImZ1bGwtaW5mb1wiO1xuXG5jb25zdCBzZWFyY2hTdHJpbmdGcm9tVGFza0J1aWxkZXIgPSAoXG4gIHNlYXJjaFR5cGU6IFNlYXJjaFR5cGVcbik6ICgodGFzazogVGFzaykgPT4gc3RyaW5nKSA9PiB7XG4gIGlmIChzZWFyY2hUeXBlID09PSBcImZ1bGwtaW5mb1wiKSB7XG4gICAgcmV0dXJuICh0YXNrOiBUYXNrKTogc3RyaW5nID0+IHtcbiAgICAgIGNvbnN0IHJlc291cmNlS2V5cyA9IE9iamVjdC5rZXlzKHRhc2sucmVzb3VyY2VzKTtcbiAgICAgIHJlc291cmNlS2V5cy5zb3J0KCk7XG4gICAgICByZXR1cm4gYCR7dGFzay5uYW1lfSAke3Jlc291cmNlS2V5c1xuICAgICAgICAubWFwKChrZXk6IHN0cmluZykgPT4gdGFzay5yZXNvdXJjZXNba2V5XSlcbiAgICAgICAgLmpvaW4oXCIgXCIpfWA7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKHRhc2s6IFRhc2spOiBzdHJpbmcgPT4gdGFzay5uYW1lO1xuICB9XG59O1xuXG5leHBvcnQgY2xhc3MgU2VhcmNoVGFza1BhbmVsIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBleHBsYW5NYWluOiBFeHBsYW5NYWluIHwgbnVsbCA9IG51bGw7XG4gIGZvY3VzSW5kZXg6IG51bWJlciA9IDA7XG4gIHNlYXJjaFJlc3VsdHM6IEZ1enp5c29ydC5LZXlSZXN1bHRzPFRhc2s+IHwgW10gPSBbXTtcbiAgc2VhcmNoVHlwZTogU2VhcmNoVHlwZSA9IFwibmFtZS1vbmx5XCI7XG5cbiAgY29ubmVjdGVkQ2FsbGJhY2soKTogdm9pZCB7XG4gICAgdGhpcy5leHBsYW5NYWluID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImV4cGxhbi1tYWluXCIpO1xuICAgIGlmICghdGhpcy5leHBsYW5NYWluKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlbmRlcih0ZW1wbGF0ZSh0aGlzKSwgdGhpcyk7XG4gIH1cblxuICBvbklucHV0KGU6IElucHV0RXZlbnQpIHtcbiAgICBjb25zdCB0YXNrcyA9IHRoaXMuZXhwbGFuTWFpbiEucGxhbi5jaGFydC5WZXJ0aWNlcztcbiAgICBjb25zdCBtYXhOYW1lTGVuZ3RoID0gdGFza3MucmVkdWNlPG51bWJlcj4oXG4gICAgICAocHJldjogbnVtYmVyLCB0YXNrOiBUYXNrKTogbnVtYmVyID0+XG4gICAgICAgIHRhc2submFtZS5sZW5ndGggPiBwcmV2ID8gdGFzay5uYW1lLmxlbmd0aCA6IHByZXYsXG4gICAgICAwXG4gICAgKTtcbiAgICB0aGlzLnNlYXJjaFJlc3VsdHMgPSBmdXp6eXNvcnQuZ288VGFzaz4oXG4gICAgICAoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUsXG4gICAgICB0YXNrcy5zbGljZSgxLCAtMiksIC8vIFJlbW92ZSBTdGFydCBhbmQgRmluaXNoIGZyb20gc2VhcmNoIHJhbmdlLlxuICAgICAge1xuICAgICAgICBrZXk6IHNlYXJjaFN0cmluZ0Zyb21UYXNrQnVpbGRlcih0aGlzLnNlYXJjaFR5cGUpLFxuICAgICAgICBsaW1pdDogMTUsXG4gICAgICAgIHRocmVzaG9sZDogMC4yLFxuICAgICAgfVxuICAgICk7XG4gICAgdGhpcy5mb2N1c0luZGV4ID0gMDtcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgb25LZXlEb3duKGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAodGhpcy5zZWFyY2hSZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUT0RPIC0gZXh0cmFjdCBmcm9tIHRoZSB0d28gcGxhY2VzIHdlIGRvIHRoaXMuXG4gICAgY29uc3Qga2V5bmFtZSA9IGAke2Uuc2hpZnRLZXkgPyBcInNoaWZ0LVwiIDogXCJcIn0ke2UuY3RybEtleSA/IFwiY3RybC1cIiA6IFwiXCJ9JHtlLm1ldGFLZXkgPyBcIm1ldGEtXCIgOiBcIlwifSR7ZS5hbHRLZXkgPyBcImFsdC1cIiA6IFwiXCJ9JHtlLmtleX1gO1xuICAgIHN3aXRjaCAoa2V5bmFtZSkge1xuICAgICAgY2FzZSBcIkFycm93RG93blwiOlxuICAgICAgICB0aGlzLmZvY3VzSW5kZXggPSAodGhpcy5mb2N1c0luZGV4ICsgMSkgJSB0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93VXBcIjpcbiAgICAgICAgdGhpcy5mb2N1c0luZGV4ID1cbiAgICAgICAgICAodGhpcy5mb2N1c0luZGV4IC0gMSArIHRoaXMuc2VhcmNoUmVzdWx0cy5sZW5ndGgpICVcbiAgICAgICAgICB0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkVudGVyXCI6XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaFJlc3VsdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VsZWN0U2VhcmNoUmVzdWx0KHRoaXMuZm9jdXNJbmRleCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG5cbiAgc2VsZWN0U2VhcmNoUmVzdWx0KGluZGV4OiBudW1iZXIpIHtcbiAgICBjb25zdCB0YXNrSW5kZXggPSB0aGlzLmV4cGxhbk1haW4hLnBsYW4uY2hhcnQuVmVydGljZXMuaW5kZXhPZihcbiAgICAgIHRoaXMuc2VhcmNoUmVzdWx0c1tpbmRleF0ub2JqXG4gICAgKTtcbiAgICB0aGlzLmV4cGxhbk1haW4hLnNldEZvY3VzT25UYXNrKHRhc2tJbmRleCk7XG4gICAgdGhpcy5zZWFyY2hSZXN1bHRzID0gW107XG4gICAgcmVuZGVyKHRlbXBsYXRlKHRoaXMpLCB0aGlzKTtcbiAgfVxuXG4gIHNldEtleWJvYXJkRm9jdXNUb0lucHV0KHNlYXJjaFR5cGU6IFNlYXJjaFR5cGUpIHtcbiAgICB0aGlzLnNlYXJjaFR5cGUgPSBzZWFyY2hUeXBlO1xuICAgIGNvbnN0IGlucHV0Q29udHJvbCA9IHRoaXMucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihcImlucHV0XCIpITtcbiAgICBpbnB1dENvbnRyb2wuZm9jdXMoKTtcbiAgICBpbnB1dENvbnRyb2wuc2VsZWN0KCk7XG4gIH1cblxuICBsb3NzT2ZGb2N1cygpIHtcbiAgICB0aGlzLnNlYXJjaFJlc3VsdHMgPSBbXTtcbiAgICByZW5kZXIodGVtcGxhdGUodGhpcyksIHRoaXMpO1xuICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZShcInNlYXJjaC10YXNrLXBhbmVsXCIsIFNlYXJjaFRhc2tQYW5lbCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFHQyxPQUFDLENBQUMsTUFBTSxRQUFRO0FBQ2YsWUFBRyxPQUFPLFdBQVcsY0FBYyxPQUFPLElBQUssUUFBTyxDQUFDLEdBQUcsR0FBRztBQUFBLGlCQUNyRCxPQUFPLFdBQVcsWUFBWSxPQUFPLFFBQVMsUUFBTyxVQUFVLElBQUk7QUFBQSxZQUN0RSxNQUFLLFdBQVcsSUFBSSxJQUFJO0FBQUEsTUFDL0IsR0FBRyxTQUFNLENBQUFBLE9BQUs7QUFDWjtBQUVBLFlBQUksU0FBUyxDQUFDLFFBQVEsV0FBVztBQUMvQixjQUFHLENBQUMsVUFBVSxDQUFDLE9BQVEsUUFBTztBQUU5QixjQUFJLGlCQUFpQixrQkFBa0IsTUFBTTtBQUM3QyxjQUFHLENBQUMsV0FBVyxNQUFNLEVBQUcsVUFBUyxZQUFZLE1BQU07QUFFbkQsY0FBSSxpQkFBaUIsZUFBZTtBQUNwQyxlQUFJLGlCQUFpQixPQUFPLGVBQWUsZUFBZ0IsUUFBTztBQUVsRSxpQkFBTyxVQUFVLGdCQUFnQixNQUFNO0FBQUEsUUFDekM7QUFFQSxZQUFJLEtBQUssQ0FBQyxRQUFRLFNBQVMsWUFBWTtBQUNyQyxjQUFHLENBQUMsT0FBUSxRQUFPLFNBQVMsTUFBTSxJQUFJLFNBQVMsT0FBTyxJQUFJO0FBRTFELGNBQUksaUJBQWlCLGtCQUFrQixNQUFNO0FBQzdDLGNBQUksaUJBQWlCLGVBQWU7QUFDcEMsY0FBSSxnQkFBaUIsZUFBZTtBQUVwQyxjQUFJLFlBQVksaUJBQWtCLFNBQVMsYUFBYSxDQUFFO0FBQzFELGNBQUksUUFBWSxTQUFTLFNBQVM7QUFFbEMsY0FBSSxhQUFhO0FBQUcsY0FBSSxlQUFlO0FBQ3ZDLGNBQUksYUFBYSxRQUFRO0FBRXpCLG1C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QUcsSUFBSTtBQUFBLElBQzdCO0FBQUEsSUFFQSx3QkFBd0IsWUFBd0I7QUFDOUMsV0FBSyxhQUFhO0FBQ2xCLFlBQU0sZUFBZSxLQUFLLGNBQWdDLE9BQU87QUFDakUsbUJBQWEsTUFBTTtBQUNuQixtQkFBYSxPQUFPO0FBQUEsSUFDdEI7QUFBQSxJQUVBLGNBQWM7QUFDWixXQUFLLGdCQUFnQixDQUFDO0FBQ3RCLFFBQU8sU0FBUyxJQUFJLEdBQUcsSUFBSTtBQUFBLElBQzdCO0FBQUEsRUFDRjtBQUVBLGlCQUFlLE9BQU8scUJBQXFCLGVBQWU7IiwKICAibmFtZXMiOiBbIl8iLCAicmVzdWx0IiwgImkiLCAiaGlnaGxpZ2h0IiwgInBhcnRzIiwgIlJlc3VsdCIsICJhIiwgImIiLCAicyIsICJzY29yZSIsICJqIiwgIngiLCAiciIsICJlIiwgIm8iLCAidiIsICJjIiwgImYiLCAiaSIsICJlIiwgInMiLCAidiIsICJpIiwgImoiLCAiZSIsICJnIiwgIl8iLCAiaSIsICJlIiwgIm9rIiwgInQiLCAiZSIsICJnIiwgImkiLCAiYyIsICJwcmVjaXNpb24iLCAieCIsICJzIiwgIngiLCAicyIsICJwcmVjaXNpb24iLCAicyIsICJpIiwgImoiLCAiZSIsICJ2IiwgImEiLCAiYiIsICJjIiwgInAiLCAicCIsICJ4IiwgInkiLCAiZSIsICJlIiwgImUiLCAieCIsICJmcm9tRmlsdGVyZWRJbmRleFRvT3JpZ2luYWxJbmRleCIsICJhIiwgImIiLCAiaSIsICJuIiwgImUiLCAiY29ybmVycyIsICJyb3ciLCAidCIsICJjIiwgImkiLCAiciIsICJlIiwgImdsb2JhbCIsICJnbG9iYWxUaGlzIiwgInRydXN0ZWRUeXBlcyIsICJwb2xpY3kiLCAiY3JlYXRlUG9saWN5IiwgImNyZWF0ZUhUTUwiLCAicyIsICJib3VuZEF0dHJpYnV0ZVN1ZmZpeCIsICJtYXJrZXIiLCAiTWF0aCIsICJyYW5kb20iLCAidG9GaXhlZCIsICJzbGljZSIsICJtYXJrZXJNYXRjaCIsICJub2RlTWFya2VyIiwgImQiLCAiZG9jdW1lbnQiLCAiY3JlYXRlTWFya2VyIiwgImNyZWF0ZUNvbW1lbnQiLCAiaXNQcmltaXRpdmUiLCAidmFsdWUiLCAiaXNBcnJheSIsICJBcnJheSIsICJpc0l0ZXJhYmxlIiwgIlN5bWJvbCIsICJpdGVyYXRvciIsICJTUEFDRV9DSEFSIiwgInRleHRFbmRSZWdleCIsICJjb21tZW50RW5kUmVnZXgiLCAiY29tbWVudDJFbmRSZWdleCIsICJ0YWdFbmRSZWdleCIsICJSZWdFeHAiLCAic2luZ2xlUXVvdGVBdHRyRW5kUmVnZXgiLCAiZG91YmxlUXVvdGVBdHRyRW5kUmVnZXgiLCAicmF3VGV4dEVsZW1lbnQiLCAidGFnIiwgInR5cGUiLCAic3RyaW5ncyIsICJ2YWx1ZXMiLCAiXyRsaXRUeXBlJCIsICJodG1sIiwgInN2ZyIsICJtYXRobWwiLCAibm9DaGFuZ2UiLCAiZm9yIiwgIm5vdGhpbmciLCAidGVtcGxhdGVDYWNoZSIsICJXZWFrTWFwIiwgIndhbGtlciIsICJjcmVhdGVUcmVlV2Fsa2VyIiwgInRydXN0RnJvbVRlbXBsYXRlU3RyaW5nIiwgInRzYSIsICJzdHJpbmdGcm9tVFNBIiwgImhhc093blByb3BlcnR5IiwgIkVycm9yIiwgImdldFRlbXBsYXRlSHRtbCIsICJsIiwgImxlbmd0aCIsICJhdHRyTmFtZXMiLCAicmF3VGV4dEVuZFJlZ2V4IiwgInJlZ2V4IiwgImkiLCAiYXR0ck5hbWUiLCAibWF0Y2giLCAiYXR0ck5hbWVFbmRJbmRleCIsICJsYXN0SW5kZXgiLCAiZXhlYyIsICJ0ZXN0IiwgImVuZCIsICJzdGFydHNXaXRoIiwgInB1c2giLCAiVGVtcGxhdGUiLCAiY29uc3RydWN0b3IiLCAib3B0aW9ucyIsICJub2RlIiwgInRoaXMiLCAicGFydHMiLCAibm9kZUluZGV4IiwgImF0dHJOYW1lSW5kZXgiLCAicGFydENvdW50IiwgImVsIiwgImNyZWF0ZUVsZW1lbnQiLCAiY3VycmVudE5vZGUiLCAiY29udGVudCIsICJ3cmFwcGVyIiwgImZpcnN0Q2hpbGQiLCAicmVwbGFjZVdpdGgiLCAiY2hpbGROb2RlcyIsICJuZXh0Tm9kZSIsICJub2RlVHlwZSIsICJoYXNBdHRyaWJ1dGVzIiwgIm5hbWUiLCAiZ2V0QXR0cmlidXRlTmFtZXMiLCAiZW5kc1dpdGgiLCAicmVhbE5hbWUiLCAic3RhdGljcyIsICJnZXRBdHRyaWJ1dGUiLCAic3BsaXQiLCAibSIsICJpbmRleCIsICJjdG9yIiwgIlByb3BlcnR5UGFydCIsICJCb29sZWFuQXR0cmlidXRlUGFydCIsICJFdmVudFBhcnQiLCAiQXR0cmlidXRlUGFydCIsICJyZW1vdmVBdHRyaWJ1dGUiLCAidGFnTmFtZSIsICJ0ZXh0Q29udGVudCIsICJlbXB0eVNjcmlwdCIsICJhcHBlbmQiLCAiZGF0YSIsICJpbmRleE9mIiwgIl9vcHRpb25zIiwgImlubmVySFRNTCIsICJyZXNvbHZlRGlyZWN0aXZlIiwgInBhcnQiLCAicGFyZW50IiwgImF0dHJpYnV0ZUluZGV4IiwgImN1cnJlbnREaXJlY3RpdmUiLCAiX19kaXJlY3RpdmVzIiwgIl9fZGlyZWN0aXZlIiwgIm5leHREaXJlY3RpdmVDb25zdHJ1Y3RvciIsICJfJGluaXRpYWxpemUiLCAiXyRyZXNvbHZlIiwgIlRlbXBsYXRlSW5zdGFuY2UiLCAidGVtcGxhdGUiLCAiXyRwYXJ0cyIsICJfJGRpc2Nvbm5lY3RhYmxlQ2hpbGRyZW4iLCAiXyR0ZW1wbGF0ZSIsICJfJHBhcmVudCIsICJwYXJlbnROb2RlIiwgIl8kaXNDb25uZWN0ZWQiLCAiZnJhZ21lbnQiLCAiY3JlYXRpb25TY29wZSIsICJpbXBvcnROb2RlIiwgInBhcnRJbmRleCIsICJ0ZW1wbGF0ZVBhcnQiLCAiQ2hpbGRQYXJ0IiwgIm5leHRTaWJsaW5nIiwgIkVsZW1lbnRQYXJ0IiwgIl8kc2V0VmFsdWUiLCAiX19pc0Nvbm5lY3RlZCIsICJzdGFydE5vZGUiLCAiZW5kTm9kZSIsICJfJGNvbW1pdHRlZFZhbHVlIiwgIl8kc3RhcnROb2RlIiwgIl8kZW5kTm9kZSIsICJpc0Nvbm5lY3RlZCIsICJkaXJlY3RpdmVQYXJlbnQiLCAiXyRjbGVhciIsICJfY29tbWl0VGV4dCIsICJfY29tbWl0VGVtcGxhdGVSZXN1bHQiLCAiX2NvbW1pdE5vZGUiLCAiX2NvbW1pdEl0ZXJhYmxlIiwgImluc2VydEJlZm9yZSIsICJfaW5zZXJ0IiwgImNyZWF0ZVRleHROb2RlIiwgInJlc3VsdCIsICJfJGdldFRlbXBsYXRlIiwgImgiLCAiX3VwZGF0ZSIsICJpbnN0YW5jZSIsICJfY2xvbmUiLCAiZ2V0IiwgInNldCIsICJpdGVtUGFydHMiLCAiaXRlbVBhcnQiLCAiaXRlbSIsICJzdGFydCIsICJmcm9tIiwgIl8kbm90aWZ5Q29ubmVjdGlvbkNoYW5nZWQiLCAibiIsICJyZW1vdmUiLCAiZWxlbWVudCIsICJmaWxsIiwgIlN0cmluZyIsICJ2YWx1ZUluZGV4IiwgIm5vQ29tbWl0IiwgImNoYW5nZSIsICJ2IiwgIl9jb21taXRWYWx1ZSIsICJzZXRBdHRyaWJ1dGUiLCAidG9nZ2xlQXR0cmlidXRlIiwgInN1cGVyIiwgIm5ld0xpc3RlbmVyIiwgIm9sZExpc3RlbmVyIiwgInNob3VsZFJlbW92ZUxpc3RlbmVyIiwgImNhcHR1cmUiLCAib25jZSIsICJwYXNzaXZlIiwgInNob3VsZEFkZExpc3RlbmVyIiwgInJlbW92ZUV2ZW50TGlzdGVuZXIiLCAiYWRkRXZlbnRMaXN0ZW5lciIsICJldmVudCIsICJjYWxsIiwgImhvc3QiLCAiaGFuZGxlRXZlbnQiLCAicG9seWZpbGxTdXBwb3J0IiwgImdsb2JhbCIsICJsaXRIdG1sUG9seWZpbGxTdXBwb3J0IiwgIlRlbXBsYXRlIiwgIkNoaWxkUGFydCIsICJsaXRIdG1sVmVyc2lvbnMiLCAicHVzaCIsICJyZW5kZXIiLCAidmFsdWUiLCAiY29udGFpbmVyIiwgIm9wdGlvbnMiLCAicGFydE93bmVyTm9kZSIsICJyZW5kZXJCZWZvcmUiLCAicGFydCIsICJlbmROb2RlIiwgImluc2VydEJlZm9yZSIsICJjcmVhdGVNYXJrZXIiLCAiXyRzZXRWYWx1ZSIsICJuIiwgImkiLCAidCIsICJhIiwgImIiLCAicm5kSW50IiwgIm4iLCAiaSIsICJleHBsYW5NYWluIiwgInVuZG8iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJleHBsYW5NYWluIiwgImV4cGxhbk1haW4iLCAiZXhwbGFuTWFpbiIsICJ1bmRvIiwgImUiLCAicHJlY2lzaW9uIiwgImV4cGxhbk1haW4iLCAicGxhbiIsICJlIiwgInAiLCAieCIsICJpIiwgImUiLCAiZnV6enlzb3J0Il0KfQo=
