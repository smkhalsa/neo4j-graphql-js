'use strict';

var _interopRequireDefault = require('@babel/runtime-corejs2/helpers/interopRequireDefault');

var _Object$defineProperty = require('@babel/runtime-corejs2/core-js/object/define-property');

_Object$defineProperty(exports, '__esModule', {
  value: true
});

exports.neo4jgraphql = neo4jgraphql;
exports.cypherQuery = cypherQuery;
exports.cypherMutation = cypherMutation;
exports.inferSchema = exports.augmentTypeDefs = exports.makeAugmentedSchema = exports.augmentSchema = void 0;

var _regenerator = _interopRequireDefault(
  require('@babel/runtime-corejs2/regenerator')
);

var _stringify = _interopRequireDefault(
  require('@babel/runtime-corejs2/core-js/json/stringify')
);

var _slicedToArray2 = _interopRequireDefault(
  require('@babel/runtime-corejs2/helpers/slicedToArray')
);

var _objectWithoutProperties2 = _interopRequireDefault(
  require('@babel/runtime-corejs2/helpers/objectWithoutProperties')
);

var _asyncToGenerator2 = _interopRequireDefault(
  require('@babel/runtime-corejs2/helpers/asyncToGenerator')
);

var _utils = require('./utils');

var _augment = require('./augment');

var _auth = require('./auth');

var _translate = require('./translate');

var _Neo4jSchemaTree = _interopRequireDefault(
  require('./neo4j-schema/Neo4jSchemaTree')
);

var _graphQLMapper = _interopRequireDefault(
  require('./neo4j-schema/graphQLMapper')
);

function neo4jgraphql(_x, _x2, _x3, _x4) {
  return _neo4jgraphql.apply(this, arguments);
}

function _neo4jgraphql() {
  _neo4jgraphql = (0, _asyncToGenerator2['default'])(
    /*#__PURE__*/
    _regenerator['default'].mark(function _callee(
      object,
      params,
      context,
      resolveInfo
    ) {
      var debug,
        query,
        cypherParams,
        cypherFunction,
        _cypherFunction,
        _cypherFunction2,
        session,
        result,
        _args = arguments;

      return _regenerator['default'].wrap(
        function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                debug =
                  _args.length > 4 && _args[4] !== undefined ? _args[4] : true;

                if (!(0, _auth.checkRequestError)(context)) {
                  _context.next = 3;
                  break;
                }

                throw new Error((0, _auth.checkRequestError)(context));

              case 3:
                cypherFunction = (0, _utils.isMutation)(resolveInfo)
                  ? cypherMutation
                  : cypherQuery;
                _cypherFunction = cypherFunction(params, context, resolveInfo);
                _cypherFunction2 = (0, _slicedToArray2['default'])(
                  _cypherFunction,
                  2
                );
                query = _cypherFunction2[0];
                cypherParams = _cypherFunction2[1];

                if (debug) {
                  console.log(query);
                  console.log(
                    (0, _stringify['default'])(cypherParams, null, 2)
                  );
                }

                session = context.driver.session();
                _context.prev = 10;

                if (!(0, _utils.isMutation)(resolveInfo)) {
                  _context.next = 17;
                  break;
                }

                _context.next = 14;
                return session.writeTransaction(function(tx) {
                  return tx.run(query, cypherParams);
                });

              case 14:
                result = _context.sent;
                _context.next = 20;
                break;

              case 17:
                _context.next = 19;
                return session.readTransaction(function(tx) {
                  return tx.run(query, cypherParams);
                });

              case 19:
                result = _context.sent;

              case 20:
                _context.prev = 20;
                session.close();
                return _context.finish(20);

              case 23:
                return _context.abrupt(
                  'return',
                  (0, _utils.extractQueryResult)(result, resolveInfo.returnType)
                );

              case 24:
              case 'end':
                return _context.stop();
            }
          }
        },
        _callee,
        null,
        [[10, , 20, 23]]
      );
    })
  );
  return _neo4jgraphql.apply(this, arguments);
}

function cypherQuery(_ref, context, resolveInfo) {
  var _ref$first = _ref.first,
    first = _ref$first === void 0 ? -1 : _ref$first,
    _ref$offset = _ref.offset,
    offset = _ref$offset === void 0 ? 0 : _ref$offset,
    _id = _ref._id,
    orderBy = _ref.orderBy,
    otherParams = (0, _objectWithoutProperties2['default'])(_ref, [
      'first',
      'offset',
      '_id',
      'orderBy'
    ]);

  var _typeIdentifiers = (0, _utils.typeIdentifiers)(resolveInfo.returnType),
    typeName = _typeIdentifiers.typeName,
    variableName = _typeIdentifiers.variableName;

  var schemaType = resolveInfo.schema.getType(typeName);
  var selections = (0, _utils.getPayloadSelections)(resolveInfo);
  return (0, _translate.translateQuery)({
    resolveInfo: resolveInfo,
    context: context,
    schemaType: schemaType,
    selections: selections,
    variableName: variableName,
    typeName: typeName,
    first: first,
    offset: offset,
    _id: _id,
    orderBy: orderBy,
    otherParams: otherParams
  });
}

function cypherMutation(_ref2, context, resolveInfo) {
  var _ref2$first = _ref2.first,
    first = _ref2$first === void 0 ? -1 : _ref2$first,
    _ref2$offset = _ref2.offset,
    offset = _ref2$offset === void 0 ? 0 : _ref2$offset,
    _id = _ref2._id,
    orderBy = _ref2.orderBy,
    otherParams = (0, _objectWithoutProperties2['default'])(_ref2, [
      'first',
      'offset',
      '_id',
      'orderBy'
    ]);

  var _typeIdentifiers2 = (0, _utils.typeIdentifiers)(resolveInfo.returnType),
    typeName = _typeIdentifiers2.typeName,
    variableName = _typeIdentifiers2.variableName;

  var schemaType = resolveInfo.schema.getType(typeName);
  var selections = (0, _utils.getPayloadSelections)(resolveInfo);
  return (0, _translate.translateMutation)({
    resolveInfo: resolveInfo,
    context: context,
    schemaType: schemaType,
    selections: selections,
    variableName: variableName,
    typeName: typeName,
    first: first,
    offset: offset,
    otherParams: otherParams
  });
}

var augmentSchema = function augmentSchema(schema) {
  var config =
    arguments.length > 1 && arguments[1] !== undefined
      ? arguments[1]
      : {
          query: true,
          mutation: true,
          temporal: true,
          debug: true
        };
  var typeMap = (0, _augment.extractTypeMapFromSchema)(schema);
  var resolvers = (0, _augment.extractResolversFromSchema)(schema);
  return (0, _augment.augmentedSchema)(typeMap, resolvers, config);
};

exports.augmentSchema = augmentSchema;

var makeAugmentedSchema = function makeAugmentedSchema(_ref3) {
  var schema = _ref3.schema,
    typeDefs = _ref3.typeDefs,
    _ref3$resolvers = _ref3.resolvers,
    resolvers = _ref3$resolvers === void 0 ? {} : _ref3$resolvers,
    logger = _ref3.logger,
    _ref3$allowUndefinedI = _ref3.allowUndefinedInResolve,
    allowUndefinedInResolve =
      _ref3$allowUndefinedI === void 0 ? false : _ref3$allowUndefinedI,
    _ref3$resolverValidat = _ref3.resolverValidationOptions,
    resolverValidationOptions =
      _ref3$resolverValidat === void 0 ? {} : _ref3$resolverValidat,
    _ref3$directiveResolv = _ref3.directiveResolvers,
    directiveResolvers =
      _ref3$directiveResolv === void 0 ? null : _ref3$directiveResolv,
    _ref3$schemaDirective = _ref3.schemaDirectives,
    schemaDirectives =
      _ref3$schemaDirective === void 0 ? {} : _ref3$schemaDirective,
    _ref3$parseOptions = _ref3.parseOptions,
    parseOptions = _ref3$parseOptions === void 0 ? {} : _ref3$parseOptions,
    _ref3$inheritResolver = _ref3.inheritResolversFromInterfaces,
    inheritResolversFromInterfaces =
      _ref3$inheritResolver === void 0 ? false : _ref3$inheritResolver,
    _ref3$config = _ref3.config,
    config =
      _ref3$config === void 0
        ? {
            query: true,
            mutation: true,
            temporal: true,
            debug: true
          }
        : _ref3$config;

  if (schema) {
    return augmentSchema(schema, config);
  }

  if (!typeDefs) throw new Error('Must provide typeDefs');
  return (0, _augment.makeAugmentedExecutableSchema)({
    typeDefs: typeDefs,
    resolvers: resolvers,
    logger: logger,
    allowUndefinedInResolve: allowUndefinedInResolve,
    resolverValidationOptions: resolverValidationOptions,
    directiveResolvers: directiveResolvers,
    schemaDirectives: schemaDirectives,
    parseOptions: parseOptions,
    inheritResolversFromInterfaces: inheritResolversFromInterfaces,
    config: config
  });
};

exports.makeAugmentedSchema = makeAugmentedSchema;

var augmentTypeDefs = function augmentTypeDefs(typeDefs, config) {
  var typeMap = (0, _utils.extractTypeMapFromTypeDefs)(typeDefs); // overwrites any provided declarations of system directives

  typeMap = (0, _utils.addDirectiveDeclarations)(typeMap, config); // adds managed types; tepmoral, spatial, etc.

  typeMap = (0, _augment.addTemporalTypes)(typeMap, config);
  return (0, _utils.printTypeMap)(typeMap);
};
/**
 * Infer a GraphQL schema by inspecting the contents of a Neo4j instance.
 * @param {} driver
 * @returns a GraphQL schema.
 */

exports.augmentTypeDefs = augmentTypeDefs;

var inferSchema = function inferSchema(driver) {
  var config =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var tree = new _Neo4jSchemaTree['default'](driver, config);
  return tree.initialize().then(_graphQLMapper['default']);
};

exports.inferSchema = inferSchema;
