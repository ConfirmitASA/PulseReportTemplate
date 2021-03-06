class PageUtil {

    /*
     * Collection of initialse page scripts.
     * Put here the code that needs to run when page loads.
     * @param {object} context object {state: state, report: report, page: page, user:user, pageContext: pageContext, log: log}
     */

    static function Initialise(context) {

        var log = context.log;
        //log.LogDebug('PAGE INIT');
        var state = context.state;
        var page = context.page;
        var pageContext = context.pageContext;

        //log.LogDebug('page init start: '+page.CurrentPageId+' ' + DateTime.Now+ " " + DateTime.Now.Millisecond);
        pageContext.Items.Add('userEmail', context.user.Email);
        pageContext.Items.Add('CurrentPageId', page.CurrentPageId);

        var pageId = getCurrentPageIdInConfig(context);
        //log.LogDebug('page init 1: hier='+context.user.PersonalizedReportBase);

        //save page source to page context
        var pageSource = !!context.pageSourceId ? context.pageSourceId : DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'Source', false);
        pageContext.Items.Add('PageSource', pageSource);

        var pageSpecificFiltersDefined = DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'PageSpecificFilters', false);
        var pageSpecificFiltersFromSurveyDataDefined = DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'PageSpecificFromSurveyData', false);
        pageContext.Items.Add('pageOverridesProgramFilters', (pageSpecificFiltersDefined || pageSpecificFiltersFromSurveyDataDefined));

        //log.LogDebug('page init 3 ' + DateTime.Now+ " " + DateTime.Now.Millisecond);
        ParamUtil.Initialise(context); // initialise parameters
        //log.LogDebug('page init 4 ' + DateTime.Now+ " " + DateTime.Now.Millisecond);

        // if in current DS a page shouldn't be visible, than redirect to default page
        // very actual when 1st report page should not be visible
        if(state.ReportExecutionMode === ReportExecutionMode.Web && !isPageVisible(context) ) {
            page.NextPageId = DataSourceUtil.getSurveyPropertyValueFromConfig (context, 'DefaultPage');
            return;
        }
        //log.LogDebug('page init 5');

        if(!HierarchyUtil.Hide(context) && HierarchyUtil.isDataTableEmpty(context)) { // hierarchy needed and not cached yet
            // populate cached hierarchy if needed
            // for now it's only needed for results page hierarchy benchamrks
            HierarchyUtil.setDataTable(context);
        }
        //log.LogDebug('page init 6 ' + DateTime.Now+ " " + DateTime.Now.Millisecond);

        //for tests
        //PulseProgramUtil.printPulseSurveyContentInfoTable(context);
        //log.LogDebug('page init end ' + DateTime.Now+ " " + DateTime.Now.Millisecond);
    }

    /*
     * Array of pages that should later be hidden (as there's nothing to show) with js by name.
     * @param {object} context object {state: state, report: report, log: log}
     * @returns {Array} pagesToHide array of page Names that should be hidden
     */

    static function getPageNamesToShow(context) {

        var log = context.log;
        var pagesToShow = [];

        var surveyProperties = DataSourceUtil.getSurveyConfig(context);

        for(var property in surveyProperties) {
            if(property.indexOf('Page_')===0) { //page config
                var isHidden = false;
                isHidden = DataSourceUtil.getPagePropertyValueFromConfig(context, property, 'isHidden');
                if(!isHidden) {
                    pagesToShow.push(TextAndParameterUtil.getTextTranslationByKey(context, property));
                }
            }
        }
        return pagesToShow;
    }

    /*
     * Indicates if page is visible for the selected DS or not.
     * @param {object} context object {state: state, report: report, log: log}
     * @returns {Boolean}
     */

    static function isPageVisible(context) {

        var log = context.log;

        var pageContext = context.pageContext;

        try { // check if CurrentPageId doesn't exist
            var pageId = pageContext.Items['CurrentPageId'];
            return !DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'isHidden');
        } catch (e) {

            return true; // return true by default (i.e. show page)
        }

    }

    //TO DO: temporarily solution. should bу a check for each component, not for a whole page
    /*
     * Check if a page should have a toggle to switch between Chart and Table View
     * @param {object} context object {state: state, report: report, log: log, pageContext: pageContext}
     * @returns {Boolean}
     */

    static function isViewSwitchAvailable (context) {
        var log = context.log;
        var pageContext = context.pageContext;
        if (pageContext.Items['CurrentPageId'] === 'Trend')
            return true;
        return false;
    }

    /*
     * Get property name for page config
     * @param {object} context object {state: state, report: report, log: log, pageContext: pageContext}
     * @returns {string} 'Page_'+pageId
     */
    static function getCurrentPageIdInConfig (context) {

        var log = context.log;

        var pageContext = context.pageContext;
        var pageId;

        if(!!pageContext.Items['CurrentPageId']) { // if pageContext contains page id info take from there
            pageId = pageContext.Items['CurrentPageId'];
        } else if(context.hasOwnProperty('CurrentPageId') && context.CurrentPageId) { // try to find it in context
            pageId = context.CurrentPageId;
        } else { //it's nowhere
            throw new Error('PageUtil.getCurrentPageIdInConfig: CurrentPageId is undefined')
        }

        return 'Page_'+pageId;
    }


    /**
     * 
     */
    static function PageHasSpefcificDS(context) {
        return !!context.pageContext.Items['PageSource'];
    }

    /**
     * @param {object} context
     * @returns {boolean} if page has specific DS
     */
    static function PageHasSpefcificFilters(context) {

        var log = context.log;
        var pageId = PageUtil.getCurrentPageIdInConfig(context);
        var bgLevel = DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'PageSpecificFilters', false);
        var surveyLevel = DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'PageSpecificFiltersFromSurveyData', false);
        var union = bgLevel || surveyLevel ? bgLevel.concat(surveyLevel) : null;

        return union && union.length>0;
    }

    /**
     * @param {object} context
     * @param {string} parameterId - id of iteratedParameter
     * @returns {boolean} if current page (with one option of iterated parameter) should be showm=n
     */
    static function hideUnnecessaryPagesForIteratedParameter(context, parameterId) {
        var log = context.log;
        var report = context.report;
        var pageContext = context.pageContext;

        if (!pageContext.Items["IteratedParameterBaseParamterId"]) {
            pageContext.Items.Add("IteratedParameterBaseParamterId", parameterId);
        }

        if (!Export.isExportMode(context)) {
            return false;
        }

        var openTextQIds = ParamUtil.GetSelectedCodes (context, parameterId);
        if (openTextQIds.length > 0) {
            var openTextBase = report.TableUtils.GetCellValue("IteratedParameterBase:Base", 1, 1).Value;
            return openTextBase <= 0;
        }
        return true;
    }
}
