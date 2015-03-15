var dss = require('dss');
var path = require('path');
var deepExtend = require('deep-extend');
var glob = require('glob');
var fs = require('fs');
var ejs = require('ejs');
var prettyHrtime = require('pretty-hrtime');
var cheerio = require('cheerio');
var util = require('util');

// Module configuration. Public object is exposed to Front-end via options API
var globalConfig = global.opts.plugins && global.opts.plugins.dss ? global.opts.plugins.dss : {};
var config = {
    enabled: true,

    // Glob mask, starting from requested spec path (https://github.com/isaacs/node-glob)
    targetCssMask: '**/*.{css,less,stylus,sass,scss}',

    // Define if example HTML is visible by default
    visibleCode: true,
    templates: {
        sections: path.join(__dirname, '../views/sections.ejs')
    },

    public: {}
};
// Overwriting base options
deepExtend(config, globalConfig);

/*
 * Gets markup and adds custom class to all first level nodes
 *
 * @param {String} markup - HTML markup string
 * @param {String} cssClass - CSS class to add
 * */
var addClassToExample = function(markup, cssClass){
    var $ = cheerio.load('<div id="content">'+ markup +'</div>');

    // Add to all first level elements a state class
    $('#content > *').each(function(){
        $(this).addClass(cssClass);
    });

    return $('#content').html();
};

/*
 * Dynamically render DSS into requested Spec
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - The callback function
 * */
var processRequest = function (req, res, next) {
    if (!config.enabled) {
        next();
        return;
    }

    if (
        req.specData &&
        req.specData.info.role !== 'navigation' && // Not navigation page
        req.specData.renderedHtml &&  // Is spec and has renderedHTML in req
        !(req.specData.info.plugins && req.specData.info.plugins.dss && !req.specData.info.plugins.dss.enabled) // Is not disabled per Spec
    ) {
        var start = process.hrtime();
        var specPath = path.join(global.app.get('user'), req.path);
        var specDirPath = path.dirname(specPath);

        glob(config.targetCssMask, {
            cwd: specDirPath
        }, function (err, files) {
            if (err || files.length === 0) {
                next();
                return;
            }

            var sectionsTplPath = config.templates.sections;

            fs.readFile(sectionsTplPath, 'utf-8', function(err, file){
                if (err) {
                    global.log.warn('DSS template not found'+ sectionsTplPath +':', err);

                    next();
                    return;
                }

                var sectionsTemplate = file;
                var dataForTemplates = {
                    config: config,
                    helpers: {
                        addClassToExample: addClassToExample
                    },
                    sections: []
                };

                // Gather all DSS blocks
                files.forEach(function(filePath){
                    var fullPath = path.join(specDirPath, filePath);

                    try {
                        var file = fs.readFileSync(fullPath, 'utf-8');

                        dss.parse(file, {}, function(parsed) {

                            // Normalizing DSS parser output https://github.com/darcyclarke/DSS/issues/58
                            parsed.blocks.forEach(function(block){
                                for (var key in block) {
                                    var value = block[key];

                                    if (key === 'state' && !util.isArray(value)) {
                                        block[key] = [value];
                                    }
                                }
                            });

                            dataForTemplates.sections = dataForTemplates.sections.concat(parsed.blocks);
                        });
                    } catch(err) {
                        global.log.debug('DSS error parsing '+ fullPath +':', err);
                    }
                });

                // Update HTML
                req.specData.renderedHtml += ejs.render(sectionsTemplate, dataForTemplates);

                var end = process.hrtime(start);
                global.log.debug('DSS processing took:', prettyHrtime(end));

                next();
            });


        });
    } else {
        next();
    }
};

exports.process = processRequest;