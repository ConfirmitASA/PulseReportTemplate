class StyleAndJavaScriptUtil {
    
    /*
    * Assemble all "backend dependant" css styles and js scripts
     * @param {object} context {state: state, report: report, log: log}
     * @returns {string} script and style string
     */

    static function assembleBackendDependantStylesAndJS (context) {

        var str = '';

        str += buildReportTemplateModule (context); //js    
        str += applyTheme(context); // css

        return str;
    }

    /** TO DO: organize better to support flexibility for other reports
     * all js variables and functions that
     * - are specific to the template
     * - are defined based on Config
     * - therefore are build with help of Reportal scripting
     * will be properties of ReportTemplate global variable
     * The function below will build that variable.
     * @param {object} context {state: state, report: report, log: log}
     * @returns {string} script string
     */

    static function buildReportTemplateModule (context) {

        var log = context.log;
        var state = context.state;
        var pageContext = context.pageContext;
        var pageId = pageContext.Items['CurrentPageId'];
      
        var globalVarScript = [];
        var properties = []; // array of strings like 'property: propertyValue'

        // the place to define ReportTemplate's properties
        // examples
        // pagesToHide: [\'page1\', \'page2\']
        // logo: \'some url\';
        properties.push('questionsWithData: '+JSON.stringify(PulseProgramUtil.getPulseSurveyContentInfo_ItemsWithData(context)));

        properties.push('executionMode: "'+JSON.stringify(state.ReportExecutionMode) + '"');

        properties.push('pagesToShow: '+JSON.stringify(PageUtil.getPageNamesToShow(context).join(';').toLowerCase()+';'));

        properties.push('pageHasViewSwitch: '+JSON.stringify(PageUtil.isViewSwitchAvailable(context)));

        properties.push('hideTimePeriodFilters: '+Filters.isTimePeriodFilterHidden(context));

        properties.push('hideWaveFilter: '+Filters.isWaveFilterHidden(context));
        
        properties.push('isDirectFilterEnabled: '+Filters.isDirectFilterEnabled(context));

        properties.push('noDataWarning: '+JSON.stringify(TextAndParameterUtil.getTextTranslationByKey(context, 'NoDataMsg')));

        properties.push('TableChartColName_ScoreVsNormValue: '+JSON.stringify(TextAndParameterUtil.getTextTranslationByKey(context, 'ScoreVsNormValue')));

        properties.push('TableChartColName_Distribution: '+JSON.stringify(TextAndParameterUtil.getTextTranslationByKey(context, 'Distribution')));

        properties.push('About: '+JSON.stringify(TextAndParameterUtil.getTextTranslationByKey(context, 'About')));

        properties.push('CollapseExpand: '+JSON.stringify(TextAndParameterUtil.getTextTranslationByKey(context, 'CollapseExpand')));

        properties.push('Apply: '+JSON.stringify(TextAndParameterUtil.getTextTranslationByKey(context, 'Apply')));
        properties.push('Reset: '+JSON.stringify(TextAndParameterUtil.getTextTranslationByKey(context, 'Reset')));
        
        properties.push('DirectToggleLabelText: '+JSON.stringify(TextAndParameterUtil.getTextTranslationByKey(context, 'DirectToggleLabelText')));

        properties.push('isHierarchySelectorHidden: '+JSON.stringify(HierarchyUtil.Hide(context) || Access.hideHierarchyFilter(context)));
        
        properties.push('isAllFiltersHidden: '+JSON.stringify(Access.AllFiltersHidden(context)));
        
        if (pageId === 'Comments') {
            properties.push('tagColumnNumbers: '+JSON.stringify(Hitlist.GetTagColumnNumbers (context, 'p_ScoreQs', 'p_TagQs')));
            properties.push('score_columns: '+JSON.stringify(ParamUtil.GetSelectedCodes (context, 'p_ScoreQs')));
        }

        if (pageId === 'KPI') {
            properties.push('gaugeData: '+JSON.stringify(PageKPI.getKPIResult(context)));
        }

        if (pageId === 'Trends') {
            properties.push('trendQuestionsSelected: '+JSON.stringify(ParamUtil.GetSelectedCodes (context, 'p_TrendQs')));
        }
        
        if (pageId === 'Results') {
            var isPulseProgram = !DataSourceUtil.isProjectSelectorNotNeeded(context);
            var custom_category = DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'CustomStatementCategory');

            if(isPulseProgram && !!custom_category) {
                var custom_questions = QuestionUtil.getQuestionsByCategory(context, custom_category);
                if(custom_questions.length>0) {
                    properties.push('isCustomQuestionsTabVisible: true');
                } else {
                    properties.push('isCustomQuestionsTabVisible: false');
                }
            } else {
                properties.push('isCustomQuestionsTabVisible: false');
            }

            var isDimensionsVisible = PageResults.isDimensionsMode(context);
            properties.push('isDimensionsTabVisible: ' + isDimensionsVisible);
            properties.push('hideHelp: '+!DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'showPrevWave'));
        }

        if (pageId === 'Results' || pageId === 'CulturalBehaviors') {
            properties.push('evenRowColor: '+JSON.stringify(Config.evenRowColor));
            properties.push('evenDimensionColor: '+JSON.stringify(Config.evenDimensionColor));
            properties.push('oddDimensionColor: '+JSON.stringify(Config.oddDimensionColor));
            properties.push('lineColor: '+JSON.stringify(Config.lineColor));
        }

        if (pageId === 'Categorical_') {
            properties.push('pieData: '+JSON.stringify(PageCategorical.getPieCollection(context, 'jsutil')));
            properties.push('pieColors: '+JSON.stringify(Config.pieColors));
        }

        if (pageId === 'CategoricalDrilldown') {
            properties.push('isProjectSelectorDisabled: '+true);
        }

        if (pageId === 'Actions') {
            //properties.push('action_kpi: '+JSON.stringify(PageActions.getKPIResult(context)));
            properties.push('gaugeData: '+JSON.stringify(PageActions.getKPIResult(context)));
            properties.push('tagColumnNumbers: '+JSON.stringify(PageActions.getTagColumnNumbers (context)));
        }

        /*if (pageId === 'Correlation') {
            properties.push('action_kpi: '+JSON.stringify(PageActions.getKPIResult(context)));
            properties.push('allDimensions: '+JSON.stringify(DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'AllDimensions')));
            properties.push('correlationDimensions: '+JSON.stringify(DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'Dimensions')));
            properties.push('isColorsForDimensionUnited: '+JSON.stringify(DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'isColorsForDimensionUnited')));
            properties.push('correlationTranslations: '+JSON.stringify(PageCorrelation.getTranslations(context)));
            properties.push('correlationPalette: '+JSON.stringify(PageCorrelation.getPalette(context)));
        }*/

        globalVarScript.push('<script>');
        globalVarScript.push(';var ReportTemplateConfig = (function(){');
        globalVarScript.push('return {');
        globalVarScript.push(properties.join(', '));
        globalVarScript.push('}');
        globalVarScript.push('})();');
        globalVarScript.push('</script>');

        return globalVarScript.join('');
    }

    static function applyTheme(context) {

        var log = context.log;
        var greenColor = Config.primaryGreenColor;
        var redColor = Config.primaryRedColor;
        var kpiColor = Config.kpiColor;
        var kpiColor_dark = Config.kpiColor_dark;
        var mainColor = Config.mainColor;
        var mainColor_dark = Config.mainColor_dark;
        var hierarchyColor = Config.hierarchyColor;
        var buttonsFontColor = Config.buttonsFontColor;
        var logo = Config.logo;
        var headerBackground = Config.headerBackground;
        var primaryGreyColor = Config.primaryGreyColor;
        var pieColors = Config.pieColors;
        var barChartColors = Config.barChartColors_Distribution;
        var isThreeDotsMenuNeeded = Config.showThreeDotsCardMenu;
        var numberOfVerbatimComments = DataSourceUtil.getPagePropertyValueFromConfig(context, 'Page_KPI', 'NumberOfCommentsToShow');
        var lineColor = Config.lineColor;

        var css_string = '';

        css_string += ''

            //logo
            +'.logo-wrapper {'
            +'background-image: url("'+logo+'");'
            +'}'

            //icon with two men in queue
            +'.icon--kpi{'
            +'background-image: url(data:image/svg+xml,%3Csvg%20fill%3D%22%23'+mainColor.substring(1,mainColor.length)+'%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%20%20%20%20%3Cpath%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22/%3E%0A%20%20%20%20%3Cpath%20d%3D%22M16%2011c1.66%200%202.99-1.34%202.99-3S17.66%205%2016%205c-1.66%200-3%201.34-3%203s1.34%203%203%203zm-8%200c1.66%200%202.99-1.34%202.99-3S9.66%205%208%205C6.34%205%205%206.34%205%208s1.34%203%203%203zm0%202c-2.33%200-7%201.17-7%203.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8%200c-.29%200-.62.02-.97.05%201.16.84%201.97%201.97%201.97%203.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z%22/%3E%0A%3C/svg%3E) !important;'
            +'}'

            //nav menu item color
            +'.css-menu .yui3-menuitem:hover > a'
            +'{ color: '+mainColor+'  !important;}'
            +'div.reportal-horizontal-menu>.yui3-menu li.css-menu-topitem:hover {'
            +'border-bottom-color:'+mainColor+'!important;}'

            //header background
            +'.global-header {'
            +'background-color: '+headerBackground+';'
            +'}'

            // calendar
            +'.yui-calcontainer>table .calnav,'
            +'.yui-calcontainer>table td.calcell.today>a{'
            +'    background: '+mainColor+' !important;'
            +'    color: white!important;'
            +'}'
            +'.yui-calcontainer>table .calnavleft:before,'
            +'.yui-calcontainer>table .calnavright:before{'
            +'border-color: '+mainColor+';}'
            +'.yui-calcontainer>table .calnav:hover {'
            +'background: '+mainColor_dark+' !important;}'

            //unfavorable card
            +'div .material-card.unfavorable,'
            +'.material-card.unfavorable .Table td'
            +'{ background-color: '+redColor+' !important;}'

            //favorable card
            +'div .material-card.favorable,'
            +'div .material-card.favorable .Table td'
            +'{background-color: '+greenColor+';}'

            //buttons
            +'.dd-button-select, .dd-button-select:active, .dd-button-select:hover {'
            +'background: '+mainColor+' !important;'
            +'color: '+buttonsFontColor+' !important;'
            +'}'
              
            //hierarchy selector
            +'div a.dd-block {'
            +'background-color: '+hierarchyColor+' !important;'
            +'}'

            //hitlist navigation
            +'div .hitlist-nav-button:hover, '
            +'div .hitlist-nav-page:hover {'
            +'background-color: '+mainColor+' !important;'
            +'color: '+buttonsFontColor+'!important;'
            +'}'
              
            //Results page - active tab
            +'.scores-tabs__tab--active {'
            +'border-bottom: 0.143rem solid '+mainColor+';'
            +'}'

            //loading animation colors (three blinking dots)
            +'@keyframes pulse { '
            +'from { background-color:'+mainColor+';}'
            +'to { background-color:'+mainColor_dark+';}'
            +'}';

        if(!isThreeDotsMenuNeeded) {
            css_string += '.material-card__title .kebab-menu { display: none; }';
        }


        //CSS to show only the latest n rows with comments
        if(numberOfVerbatimComments) {
            numberOfVerbatimComments = numberOfVerbatimComments + 1;
            css_string += '.material-card--favorable tr:nth-last-child(n+' + numberOfVerbatimComments + ') td { display: none; }'
                +'.material-card--unfavorable tr:nth-last-child(n+' + numberOfVerbatimComments + ') td { display: none; }';
        } else {
            css_string += '.material-card--favorable tr:nth-last-child(n+6) td { display: none; }'
                +'.material-card--unfavorable tr:nth-last-child(n+6) td { display: none; }';
        }

        //Results table
        css_string += '.tablesaw td.addTopBorder {'
                        +'border-top-color: '+lineColor+' !important;'
                        +'}';
        
        //Direct filter toggle
        css_string += '.hierarchy-direct-toggle:checked + .direct-toggle-label {'
                        +'background-color: '+mainColor
                        +'}';
        
        css_string += '.hierarchy-direct-toggle:checked + .direct-toggle-label::after {'
                        +'background-color: '+mainColor
                        +'}';
        //InitialSuppress and GlobalSuppress messages
        css_string += '.initial-suppress-warning {'
                        + 'color: '+mainColor + '!important;'
                        +'}';
                        
        css_string += '.global-warning {'
                        + 'color: '+mainColor + '!important;'
                        + 'font-size: 2em !important;'
                        + 'padding: 0.5em;'
                        +'}';

        return '<style>'+css_string+'</style>';
    }

    static function reportStatisticsTile_Render(context, stat, icon) {

        var log = context.log;
        var str = '';
        var value;

        switch(stat) {
            case 'collectionPeriod': value = PageResponseRate.getCollectionPeriod(context); break;
            default: value = PageResponseRate.getResponseRateSummary(context)[stat]; break;
        }

        str += '<div class="layout horizontal">'
            + '<div class="icon icon--'+icon+'"></div>'
            + '<div class="flex digit self-center">'+value+'</div></div>';

        return str;
    }

    /**
     * function to create js variable from reportal object
     * @param {Object} config - reportal object
     * @param {String} configName - name for the js variable ('config' by degault)
     * @returns {String}
     */
    static function printProperty(config, configName){ // JSON.print prints JSON `config` to page as JavaScript variable with a specified `configName`
        var varName = configName || 'config';
        return '<script type="text/javascript">var '+ varName + '=' + JSON.stringify(config) +'</script>';
    }

}
