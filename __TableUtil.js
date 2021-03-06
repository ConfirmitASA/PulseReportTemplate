class TableUtil {

    //type of the selected break by variable
    static var breakByType = '';

    /**
     * @memberof TableUtil
     * @function setBreakByType
     * @description set the break by type
     * @param {String} type of the selected break by variable
     */
    static function setBreakByType(newBreakByType) {
        breakByType = newBreakByType;
    }

    /**
     * @memberof TableUtil
     * @function getBreakByType
     * @description get the break by type
     * @return {String} type of the selected break by variable
     */
    static function getBreakByType() {
        return breakByType;
    }

    /**
     * @memberof TableUtil
     * @function setTimeSeriesByTimeUnit
     * @description function to set time series for a header question depending on the value of parameter TimeUnitsWithDefaultValue ot TimeUnitsNoDefaultValue
     * @param {Object} context - {report: report, user: user, state: state, log: log}
     */
    static function setTimeSeriesByTimeUnit(context, headerQuestion, timeUnit){

        if (!timeUnit || !headerQuestion) {
            throw new Error("TableUtil.setTimeSeriesByTimeUnit: HeaderQuestion or TimeUnit is not defined");
        }

        var timeUnitCode = timeUnit.Code;

        switch (timeUnitCode) {
            case 'Y':
                headerQuestion.TimeSeries.Time1 = TimeseriesTimeUnitType.Year;
                break;

            case 'Q':
                headerQuestion.TimeSeries.Time1 = TimeseriesTimeUnitType.Year;
                headerQuestion.TimeSeries.Time2 = TimeseriesTimeUnitType.Quarter;
                break;

            case 'M':
                headerQuestion.TimeSeries.Time1 = TimeseriesTimeUnitType.Year;
                headerQuestion.TimeSeries.Time2 = TimeseriesTimeUnitType.Month;
                break;

            case 'D':
                headerQuestion.TimeSeries.Time1 = TimeseriesTimeUnitType.Year;
                headerQuestion.TimeSeries.Time2 = TimeseriesTimeUnitType.Month;
                headerQuestion.TimeSeries.Time3 = TimeseriesTimeUnitType.DayOfMonth;
                break;

            default:
                headerQuestion.TimeSeries.Time1 = TimeseriesTimeUnitType.Year;
        }

    }


    /**
     * @memberof TableUtil
     * @function setRollingByTimeUnit
     * @description function to set rolling timesseries for a header question depending on the value of parameter TimeUnitsWithDefaultValue ot TimeUnitsNoDefaultValue
     * @param {Object} context - {report: report, user: user, state: state, log: log}
     */
    static function setRollingByTimeUnit(context, headerQuestion, timeUnit){

        if (!timeUnit || !headerQuestion) {
            throw new Error("TableUtil.setRollingByTimeUnit: HeaderQuestion or TimeUnit is not defined");
        }

        var timeUnitCode = timeUnit.Code;

        headerQuestion.TimeSeries.RollingTimeseries.Enabled = true;
        headerQuestion.TimeSeries.RollingTimeseries.From = -(timeUnit.TimeUnitCount - 1);
        headerQuestion.TimeSeries.RollingTimeseries.To = 0;

        switch (timeUnitCode) {
            case 'Y':
                headerQuestion.TimeSeries.RollingTimeseries.Unit = RollingUnitType.Year;
                break;

            case 'Q':
                headerQuestion.TimeSeries.RollingTimeseries.Unit = RollingUnitType.Quarter;
                break;

            case 'M':
                headerQuestion.TimeSeries.RollingTimeseries.Unit = RollingUnitType.Month;
                break;

            case 'D':
                headerQuestion.TimeSeries.RollingTimeseries.Unit = RollingUnitType.Day;
                break;

            default:
                headerQuestion.TimeSeries.Time1 = TimeseriesTimeUnitType.Year;
        }

    }


    /**
     * @memberof TableUtil
     * @function addTrending
     * @description function to add trending by date variable to Aggregated table column
     * @param {Object} context - {table: table, report: report, user: user, state: state, log: log}
     * @param {String} qId - date question id for trending
     */
    static function addTrending(context, qId) {

        var log = context.log;
        var table = context.table;

        var timeUnits = ParamUtil.GetSelectedOptions (context, 'p_TimeUnitWithDefault');

        if (timeUnits.length) {

            // though it can be multi-parameter, use only 1 option for trend
            var timeUnit = timeUnits[0];

            // check if time unit for breakdown is specified in TextAndParameterLibrary->ParameterValuesLibrary
            if (timeUnit.TimeUnit) {

                // add trending by a date variable passed as a parameter
                var qe: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, qId);
                var timeQuestionHeader: HeaderQuestion = new HeaderQuestion(qe);
                setTimeSeriesByTimeUnit(context, timeQuestionHeader, timeUnit);

                // set rolling if time unit count is specified in TextAndParameterLibrary->ParameterValuesLibrary
                if (timeUnit.TimeUnitCount != null) {
                    setRollingByTimeUnit(context, timeQuestionHeader, timeUnit);
                }
                timeQuestionHeader.TimeSeries.FlatLayout = true;

            } else {

                //  no time units, so add trending by a single (not a date question!) specified in TextAndParameterLibrary->ParameterValuesLibrary
                qe = QuestionUtil.getQuestionnaireElement(context, timeUnit.Code);
                timeQuestionHeader = new HeaderQuestion(qe);

            }

            timeQuestionHeader.ShowTotals = false;
            timeQuestionHeader.HideData = false;
            timeQuestionHeader.HideHeader = false;

            table.RemoveEmptyHeaders.Columns = true;  //https://jiraosl.firmglobal.com/browse/TQA-4243
            table.ColumnHeaders.Add(timeQuestionHeader);

        }
    }

    /**
     * Function sets start and end date for Date header.
     * That allows to limit date interval and number of columns in table when
     * 1) RemoveEmptyHeaders Option is off and 2) Date filter is applied
     * param {object} context {report: report, user: user, state: state, log: log}
     * param {HeaderQuestion} headerDateQuestion - header based on date question
     */
    static function applyDateRangeFilterToHeader(context, headerDateQuestion) {

        if(!Filters.isTimePeriodFilterHidden(context)) {

            var dateRange = DateUtil.defineDateRangeBasedOnFilters(context);

            if(dateRange) {
                headerDateQuestion.TimeSeries.StartDate = dateRange.startDate;
                headerDateQuestion.TimeSeries.EndDate = dateRange.endDate;
            }
        }
        return;
    }

    /**
     * Function that excludes NA answer from header.
     * param {object} context {state: state, report: report, pageContext: pageContext, log: log}
     * param {Header} headerQuestion or headerCategory
     */

    static function maskOutNA(context, header, headerElemID) {

        var log = context.log;
        var pageId = PageUtil.getCurrentPageIdInConfig(context);
        var naCode = DataSourceUtil.getPropertyValueFromConfig(context, pageId, 'NA_answerCode');

        if(!naCode) {
            return;
        }

        if(header.HeaderType === HeaderVariableType.QuestionnaireElement) {

            var project : Project = DataSourceUtil.getProject(context);
            var q : Question;

            if(!!headerElemID) {
                //for some unclear reason the below approach wouldn't work in All Results table
                q = project.GetQuestion(headerElemID);
            } else {
                var qId = header.QuestionnaireElement.QuestionId;
                q = project.GetQuestion(qId);
            }

            // additional check for Multi. Apply Mask only if a question has NA answer, otherwise Internal Server Error
            if (q.QuestionType != QuestionType.Multi || (q.QuestionType == QuestionType.Multi && QuestionUtil.hasAnswer(context, headerElemID, naCode))) {
                var qMask : MaskFlat = new MaskFlat();
                qMask.Codes.Add(naCode);
                qMask.IsInclusive = false;
                header.AnswerMask = qMask;
                header.FilterByMask = true;
            }
        }

        if(header.HeaderType === HeaderVariableType.Categories) {
            header.IgnoreCodes = naCode;
            header.Mask.Type = MaskType.HideCodes;
            header.Mask.Codes = naCode;
        }
    }


    /**
     * Add nested header based on BreakVariables and BreakByTimeUnits properties for 'Results' page.
     * @param {object} context: {state: state, report: report, log: log, table: table, pageContext: pageContext}
     * @param {Header} parent header
     */

    static function addBreakByNestedHeader(context, parentHeader) {

        var log = context.log;
        var pageId = PageUtil.getCurrentPageIdInConfig(context);
        var breakByTimeUnits = DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'BreakByTimeUnits');
        var breakVariables = DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'BreakVariables');
        var breakByParameter = null;
        var breakByType = null;
        var nestedHeader: HeaderQuestion;
        var questionElem: QuestionnaireElement;

        if(breakByTimeUnits && breakVariables && breakVariables.length>0) {
            throw new Error('TableUtil.addBreakByNestedHeader: only one property can be used for break by, exclude either BreakByTimeUnits or BreakVariables from config for the DS, page '+pageId);
        }

        if(!(breakByTimeUnits || (breakVariables && breakVariables.length>0))) { // none of break by values set in config
            return;
        }
        //TO DO: get rid of explicit page names
        if(breakByTimeUnits && pageId === 'Page_Results') {
            breakByParameter = 'p_TimeUnitNoDefault';
            breakByType = 'TimeUnit';
        } else if(breakByTimeUnits && pageId === 'Page_CategoricalDrilldown') {
            breakByParameter = 'p_CatDD_TimeUnitNoDefault';
            breakByType = 'TimeUnit';
        } else if(breakVariables && breakVariables.length>0 && pageId === 'Page_Results') {
            breakByParameter = 'p_Results_BreakBy';
            breakByType = 'Question';
        } else if(breakVariables && breakVariables.length>0 && pageId === 'Page_CategoricalDrilldown') {
            breakByParameter = 'p_CategoricalDD_BreakBy';
            breakByType = 'Question';
        }

        setBreakByType(breakByType);

        var selectedOption = ParamUtil.GetSelectedOptions(context, breakByParameter)[0];

        if(selectedOption==null || selectedOption.Code === 'na') {//no break by option is selected
            return;
        }

        if(breakByType === 'TimeUnit') { // break by time unit

            var qid = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'DateQuestion');

            questionElem = QuestionUtil.getQuestionnaireElement(context, qid);
            nestedHeader = new HeaderQuestion(questionElem);
            nestedHeader.ShowTotals = false;
            nestedHeader.TimeSeries.FlatLayout = true;

            nestedHeader.TimeSeries.Time1 = TimeseriesTimeUnitType.Year;
            if(selectedOption.TimeUnit === 'Quarter') {
                nestedHeader.TimeSeries.Time2 = TimeseriesTimeUnitType.Quarter;
            } else if(selectedOption.TimeUnit === 'Month') {
                nestedHeader.TimeSeries.Time2 = TimeseriesTimeUnitType.Month;
            } else if(selectedOption.TimeUnit === 'Day') {
                nestedHeader.TimeSeries.Time2 = TimeseriesTimeUnitType.Month;
                nestedHeader.TimeSeries.Time3 = TimeseriesTimeUnitType.DayOfMonth;
            }

            TableUtil.applyDateRangeFilterToHeader(context, nestedHeader);
            parentHeader.SubHeaders.Add(nestedHeader);

            return;
        }

        if(breakByType === 'Question') { // break by question

            var questionInfo = QuestionUtil.getQuestionInfo(context, selectedOption.Code);

            questionElem = QuestionUtil.getQuestionnaireElement(context, selectedOption.Code);
            nestedHeader = new HeaderQuestion(questionElem);

            if(questionInfo.standardType === 'hierarchy') { // the same code exists in __PageResponseRate by demographics function :(
                setBreakByType('Hierarchy');
                nestedHeader.ReferenceGroup.Enabled = true;
                nestedHeader.ReferenceGroup.Self = false;
                //var parentLevels = HierarchyUtil.getParentLevelsForCurrentHierarchyNode(context);
                nestedHeader.ReferenceGroup.Levels = '+1';//parentLevels.join(', ');
            }

            nestedHeader.ShowTotals = false;
            parentHeader.SubHeaders.Add(nestedHeader);

            return;
        }
    }

    /**
     *Function adds AVG and Base subheader to a
     *@param {object} context
     *@param {object} header {Type: "Question"|"Dimension", Code: "qid"|"catId"}
     */

    static function getTrendHeader(context, header) {

        var report = context.report;
        var log = context.log;

        // header is question from parameter
        if (header.Type && header.Type === 'Question') {
            return getTrendQuestionHeader(context, header.Code);
        }

        // header is question from config
        if (typeof header === 'string') {
            return getTrendQuestionHeader(context, header);
        }

        //header is dimension
        if (header.Type && header.Type === 'Dimension') {
            return getTrendCategorizationHeader(context, header.Code);
        }

        throw new Error('TableUtil.getTrendHeader: cannot process header ' + JSON.stringify(header));

    }


    /**
     *Function adds AVG and Base subheader to a
     *@param {object} context
     *@param {Header} parent header
     */

    static function getTrendQuestionHeader(context, qid) {

        var report = context.report;
        var AVG = TextAndParameterUtil.getTextTranslationByKey(context, 'AVG', true);
        var N = TextAndParameterUtil.getTextTranslationByKey(context, 'N', true);

        var qe: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, qid);
        var qTitle = QuestionUtil.getQuestionTitle (context, qid);
        var row: HeaderQuestion = new HeaderQuestion(qe);
        row.IsCollapsed = true;
        row.HideHeader = true;
        maskOutNA(context, row);

        var hs : HeaderStatistics = new HeaderStatistics();
        hs.Statistics.Avg = true;
        hs.Statistics.Count = true;
        hs.HideHeader = true;

        hs.Texts.Average = new Label(report.CurrentLanguage, qTitle+' ('+AVG+')');
        hs.Texts.Count = new Label(report.CurrentLanguage, qTitle+' ('+N+')');
        row.SubHeaders.Add(hs);


        return row;
    }

    /**
     *Function adds AVG and Base subheader to a
     *@param {object} context
     *@param {string} categorization id
     */
    static function getTrendCategorizationHeader(context, catId) {

        var report = context.report;
        var row: HeaderCategorization = new HeaderCategorization();

        row.CategorizationId = String(catId).replace(/[ ,&]/g, '');
        row.DataSourceNodeId = DataSourceUtil.getDsId(context);
        row.DefaultStatistic = StatisticsType.Average;
        row.CalculationRule = CategorizationType.AverageOfAggregates; // AvgOfIndividual affects performance
        row.Preaggregation = PreaggregationType.Average;
        row.SampleRule = SampleEvaluationRule.Max;// https://jiraosl.firmglobal.com/browse/TQA-4116
        row.Collapsed = true;
        row.Totals = true;
        maskOutNA(context, row);

        if(!DataSourceUtil.isProjectSelectorNotNeeded(context)) {

            var AVG = TextAndParameterUtil.getTextTranslationByKey(context, 'AVG', true);
            var N = TextAndParameterUtil.getTextTranslationByKey(context, 'N', true);

            var hs : HeaderStatistics = new HeaderStatistics();
            hs.Statistics.Avg = true;
            hs.Statistics.Count = true;
            hs.HideHeader = false;

            var catLabel = TextAndParameterUtil.getTextTranslationByKey(context, 'Cat_'+catId, true);

            hs.Texts.Average = new Label(report.CurrentLanguage, catLabel+' ('+AVG+')');
            hs.Texts.Count = new Label(report.CurrentLanguage, catLabel+' ('+N+')');

            row.HideHeader = true;
            row.SubHeaders.Add(hs);
        }

        return row;
    }


    /**
     *@param {object} context
     *@param {string|object} either qid or object {Type: 'Dimension', Code: 'catId'}
     */
    static function getHeaderDescriptorObject(context, configItem) {

        var header = {}; // prepare param for getTrendHeader

        if(typeof configItem === 'string') {
            header.Code = configItem;
            header.Type = 'Question';
        } else {
            header = configItem;
        }

        if(!header || !header.Type || !header.Code) {
            throw new Error('TableUtil.getHeaderDescriptorObject: cannot create proper header object based on '+JSON.stringify());
        }

        return header;
    }

    /**
     * @param {Object} context
     * @param {String} pageId
     * @param {String} propertyName
     * @param {Boolean} doPreCheck - for the case when there are no questions in the property, i.e. config error
     */
    static function getActiveQuestionsListFromPageConfig (context, pageId, propertyName, doPreCheck) {

        var log = context.log;
        var Qs = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, propertyName);

        if (doPreCheck && Qs.length == 0) {
            throw new Error('TableUtil.getActiveQuestionsListFromPageConfig: questions from page=' + pageId + ', property=' + propertyName + ' are not specified.');
        }
        return PulseProgramUtil.excludeItemsWithoutData(context, Qs);
    }


    static function excludeNotActiveDimensionsFromQuestionsList(context, questions) {

        var log = context.log;

        // not pulse program -> nothing to exclude
        if (DataSourceUtil.isProjectSelectorNotNeeded(context)) {
            return questions;
        }

        var activeDimensions = getActiveCategorizationsForPulseSurveys(context);
        var activeQuestionsAndDimensions = PulseProgramUtil.getPulseSurveyContentInfo_ItemsWithData(context);
        var activeQuestions = [];

        for(var i=0; i<questions.length; i++) {

            if(typeof questions[i] === 'string' && activeQuestionsAndDimensions.hasOwnProperty(questions[i])) { //qid
                activeQuestions.push(questions[i]);
            } else if(questions[i].hasOwnProperty('Type') && questions[i].Type === 'Dimension') { //dimension

                if(ArrayUtil.itemExistInArray(activeDimensions, questions[i].Code)) {
                    activeQuestions.push(questions[i]);
                }
            }
        }

        return activeQuestions;

    }

    /**
     * Retuns active categorizations for selected baby surveys from pulse program it'll be limited list of categorizations.
     * @param {object} context: {state: state, report: report, log: log, table: table}
     * @return {array} array of categorization ids
     */
    static function getActiveCategorizationsForPulseSurveys(context) {

        var log = context.log;
        var pageContext = context.pageContext;

        if(!!pageContext.Items['ActiveCategorizationsForPulseSurveys']) {
            return pageContext.Items['ActiveCategorizationsForPulseSurveys'];
        }

        var schemaId = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'DimensionsForSurveysSchemaId');
        var tableName = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'DimensionsForSurveysTable');
        var schema: DBDesignerSchema = context.confirmit.GetDBDesignerSchema(schemaId);
        var DBTable: DBDesignerTable = schema.GetDBDesignerTable(tableName);
        var pids = ParamUtil.GetSelectedCodes(context, 'p_projectSelector');

        var activeDimensionsIDs = [];

        for(var i=0;i <pids.length; i++) {
            var pid = pids[i];
            var dimensions = DBTable.GetColumnValues('__l9', 'id', pid); //only one or none

            if (dimensions && dimensions.Count > 0) {
                activeDimensionsIDs = activeDimensionsIDs.concat(dimensions[0].split(','));
            }
        }

        activeDimensionsIDs = ArrayUtil.removeDuplicatesFromArray(activeDimensionsIDs);
        pageContext.Items.Add("ActiveCategorizationsForPulseSurveys", activeDimensionsIDs);

        return activeDimensionsIDs;
    }



    /**
     * @param {Object} context
     * @param {String} pageId
     * @param {String} propertyName - property holding array of categories
     * @param {Boolean} doPreCheck - for the case when there are no questions in the property, i.e. config error
     */
    static function getActiveQuestionsListByCategories(context, pageId, propertyName, doPreCheck) {

        var log = context.log;
        var categories = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, propertyName);

        if (doPreCheck && categories.length == 0) {
            throw new Error('TableUtil.getActiveQuestionsListByCategories: questions from page=' + pageId + ', property=' + propertyName + ' are not specified.');
        }

        var Qs = QuestionUtil.getQuestionIdsByCategories(context, categories);
        return PulseProgramUtil.excludeItemsWithoutData(context, Qs);
    }

    /**
     * @param {Object} context
     * @param {Boolean} directionAscending
     * @param {Byte} position
     * @param {Number} topN
     * @param {Boolean} positionFromEnd
     */
    static function setupRowsTableSorting(context, directionAscending: Boolean, position: Byte, topN, positionFromEnd, fixedFromStart, fixedFromEnd){
        var table = context.table;

        table.Sorting.Rows.Enabled = true;
        table.Sorting.Rows.SortByType = TableSortByType.Position;
        table.Sorting.Rows.Direction = directionAscending ? TableSortDirection.Ascending : TableSortDirection.Descending;
        table.Sorting.Rows.Position = position;
        table.Sorting.Rows.PositionDirection =  positionFromEnd ? TableSortByPositionType.FromEnd : TableSortByPositionType.FromStart;
        table.Sorting.Rows.TopN = topN ? topN : 0;
        table.Sorting.Rows.FixedFromStart = fixedFromStart ? fixedFromStart : 0;
        table.Sorting.Rows.FixedFromEnd = fixedFromEnd ? fixedFromEnd : 0;
    }

    /**
     * @param {Object} context
     * @param {Object[]} conditions - array of objects like { expression: 'cellv(col,row)<(-1)', style: 'negative'}
     * @param {String} name
     * @param {Object} applyTo - define area in object like {axis: Area.Columns, direction: Area.Left, indexes: "3"}
     */
    static function setupConditionalFormatting(context, conditions, name, applyTo){
        var table = context.table;
        var log = context.log;

        var formatter : ConditionalFormatting = table.ConditionalFormatting;

        var area : Area = new Area();
        area.Name = name;
        area.ApplyTo(applyTo.axis, applyTo.direction, applyTo.indexes);

        for (var i = 0; i < conditions.length; i++) {
            var c1 : Condition = new Condition();
            c1.Style = conditions[i].style;

            if (i === 0) {
                c1.Expression = (conditions[i].conditionBody ? conditions[i].conditionBody : 'cellv(col,row)') + '==emptyv()';
            } else {
                if (conditions[i].condition) {
                    c1.Expression = (conditions[i].conditionBody ? conditions[i].conditionBody : 'cellv(col,row)') + conditions[i].condition;
                } else {
                    c1.Expression = 'true';
                }
            }

            area.AddCondition(c1);
        }

        formatter.AddArea(area);

        table.ConditionalFormatting = formatter;
    }

    /**
     * @param {String[]} classes
     */
    static function addClasses(context, classes) {
        var table = context.table;

        table.CssClass = ( ( !table.CssClass ) ? "" : (table.CssClass + " " ) ) + classes.join(" ");
    }

    /**
     * Add Score calculation
     * @param {object} context: {state: state, report: report, log: log, table: table}
     * @param {string} scoreType: 'avg', '%fav', '%fav-%unfav'
     * @param {Header} parentHeader - not mandotary
     * @param {Array} [Header1, Header2,...]
     */
    static function addScore(context, parentHeader, baseValExpression, hideHeader) {

        var table = context.table;
        var pageId = PageUtil.getCurrentPageIdInConfig(context);
        var scoreType = DataSourceUtil.getPropertyValueFromConfig(context, pageId, 'ScoreType');

        var posScoreRecodingCols = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'ReusableRecoding_PositiveCols');
        var negScoreRecodingCols = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'ReusableRecoding_NegativeCols');

        //Create separate responses column to be able to check it independently
        //var scoreResponses = getResponsesColumn(context, true);

        var cellSuppressCondition = !!baseValExpression ? baseValExpression : 'true'

        scoreType = scoreType.toLowerCase();

        //CRUNCH: to every value we have to ad 0.01 because otherwise remove empty headers will hide score 0 even if it is based on 100 responses
        if (scoreType === 'avg') {

            // add Score column
            var avg: HeaderFormula = new HeaderFormula();
            avg.Type = FormulaType.Expression;
            avg.Expression = 'if('+cellSuppressCondition+', cellv(col+1, row)+0.001, emptyv())';//avg.Expression = 'if(cellv(col-1,row) = emptyv() OR ROUND(cellv(col-1,row), '+Config.Decimal+') < ' + suppressValue + ', emptyv(), cellv(col+1,row))';
            avg.Decimals = Config.Decimal;
            avg.Title = TextAndParameterUtil.getLabelByKey(context, 'Score');
            avg.HideHeader = hideHeader;

            var score: HeaderStatistics = new HeaderStatistics();
            score.Decimals = Config.Decimal;
            score.Statistics.Avg = true;
            score.HideData = true;

            if (parentHeader) {
                //parentHeader.SubHeaders.Add(scoreResponses);
                parentHeader.SubHeaders.Add(avg);
                parentHeader.SubHeaders.Add(score);
            } else {
                //table.ColumnHeaders.Add(scoreResponses);
                table.ColumnHeaders.Add(avg);
                table.ColumnHeaders.Add(score);
            }
            return [avg, score]; // TO DO: revise, this is cruntch to align avg with other types of scores which consits of 2 cols
        }

        var bcCategories: HeaderCategories = new HeaderCategories();
        //bcCategories.RecodingShowOriginal = true;
        //bcCategories.RecodingPosition = RecodingPositionType.OnStart;
        if (scoreType === '%fav') {

            // add Score column
            var fav: HeaderFormula = new HeaderFormula();
            fav.Type = FormulaType.Expression;
            fav.Expression = 'if('+cellSuppressCondition+', cellv(col+'+posScoreRecodingCols.join(', row)+cellv(col+')+',row)+0.001, emptyv())';//fav.Expression = 'if(cellv(col-1,row) = emptyv() OR ROUND(cellv(col-1,row), '+Config.Decimal+') < ' + suppressValue + ', emptyv(), cellv(col+'+posScoreRecodingCols.join(', row)+cellv(col+')+',row))';
            fav.Decimals = Config.Decimal;
            fav.Title = TextAndParameterUtil.getLabelByKey(context, 'Fav');
            fav.HideHeader = hideHeader;

            //add distribution barChart
            bcCategories.RecodingIdent = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'ReusableRecodingId');
            bcCategories.Totals = false;
            bcCategories.Distributions.Enabled = true;
            bcCategories.Distributions.HorizontalPercents = true;
            bcCategories.Decimals = Config.Decimal;
            bcCategories.HideData = true;

            if (parentHeader) {
                //parentHeader.SubHeaders.Add(scoreResponses);
                parentHeader.SubHeaders.Add(fav);
                parentHeader.SubHeaders.Add(bcCategories);
            } else {
                //table.ColumnHeaders.Add(scoreResponses);
                table.ColumnHeaders.Add(fav);
                table.ColumnHeaders.Add(bcCategories);
            }
            return [fav, bcCategories];
        }

        if (scoreType === '%fav-%unfav') {

            // add Score column
            var diff: HeaderFormula = new HeaderFormula();
            diff.Type = FormulaType.Expression;
            diff.Expression = 'if('+cellSuppressCondition+', cellv(col+'+posScoreRecodingCols.join(', row)+cellv(col+')+',row) - cellv(col+'+negScoreRecodingCols.join(', row)-cellv(col+')+',row)+0.001, emptyv())';
            diff.Decimals = Config.Decimal;
            diff.Title = TextAndParameterUtil.getLabelByKey(context, 'FavMinUnfav');
            diff.HideHeader = hideHeader;

            //add distribution barChart
            bcCategories.RecodingIdent = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'ReusableRecodingId');
            bcCategories.Totals = false;
            bcCategories.Distributions.Enabled = true;
            bcCategories.Distributions.HorizontalPercents = true;
            bcCategories.Decimals = Config.Decimal;
            bcCategories.HideData = true;

            if (parentHeader) {
                //parentHeader.SubHeaders.Add(scoreResponses);
                parentHeader.SubHeaders.Add(diff);
                parentHeader.SubHeaders.Add(bcCategories);
            } else {
                //table.ColumnHeaders.Add(scoreResponses);
                table.ColumnHeaders.Add(diff);
                table.ColumnHeaders.Add(bcCategories);
            }
            return [diff, bcCategories];
        }

        throw new Error('PageResults.addScore: Calculation of score for type "' + scoreType + ' is not found."');
    }
}