class PageCorrelation {

    /*
    * Hide Correlation table because of hierarchy suppress
    * @param {object} context: {state: state, report: report, log: log, table: table}
    */

    static function tableCorrelation_Hide(context) {

        return SuppressUtil.hierarchyUnitIsSensitive(context);
    }

    /*
     * Assemble Statements table
     * @param {object} context: {state: state, report: report, log: log, table: table, pageContext: pageContext, suppressSettings: suppressSettings}
     */
    static function tableCorrelation_Render(context) {

        var log = context.log;
        var table = context.table;
        var suppressSettings = context.suppressSettings;

        table.Caching.Enabled = false;
        table.TotalsFirst = true;
        table.RemoveEmptyHeaders.Rows = true;

        TableUtil.addClasses(context, ["reportal-table","reportal-categories", "correlation-table"]);

        SuppressUtil.setTableSuppress(table, suppressSettings);

        tableCorrelation_AddRows(context);
        tableCorrelation_AddColumns(context);
        tableCorrelation_AddConditionalFormatting(context);
        tableCorrelation_AddSorting(context);
    }

    /*
     * Add rows to the Correlation table based on the selected question/s or dimension/s.
     * @param {object} context: {state: state, report: report, log: log, table: table, pageContext: pageContext, suppressSettings: suppressSettings}
     */
    static function tableCorrelation_AddRows(context) {
        var log = context.log;
        var table = context.table;

        table.RowHeaders.Add(getHeaderFormula_Average(context));

        var headerID = ParamUtil.GetSelectedOptions(context, 'p_ImpactAnalysisDimension');

        for(var i=0; i<headerID.length; i++) {

            var header = TableUtil.getHeaderDescriptorObject(context, headerID[i]);

            if (header.Type === 'Question') {
                var qe: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, header.Code);
                var row: HeaderQuestion = new HeaderQuestion(qe);
                row.IsCollapsed = true;
                row.DefaultStatistic = StatisticsType.Average;
                table.RowHeaders.Add(row);

            } else {
                if (header.Type === 'Dimension') {
                    var categorization: HeaderCategorization = new HeaderCategorization();
                    categorization.CategorizationId = String(header.Code).replace(/[ ,&]/g, '');
                    categorization.DataSourceNodeId = DataSourceUtil.getDsId(context);
                    categorization.DefaultStatistic = StatisticsType.Average;
                    categorization.CalculationRule = CategorizationType.AverageOfAggregates; // AvgOfIndividual affects performance
                    categorization.Preaggregation = PreaggregationType.Average;
                    categorization.SampleRule = SampleEvaluationRule.Max; // https://jiraosl.firmglobal.com/browse/TQA-4116
                    categorization.Collapsed = false;
                    categorization.Totals = false;
                    table.RowHeaders.Add(categorization);
                }
            }
        }
    }

    /*
     * Create HeaderFormula which calculates the average among all column values starting from the second one
     * @return {HeaderFormula} Formula for the average
     */
    static function getHeaderFormula_Average(context) {
        var pageContext = context.pageContext;
        var pageId = pageContext.Items['CurrentPageId'];
        var correlationAxis = DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'CorrelationAxis');

        var avg: HeaderFormula = new HeaderFormula();
        avg.Type = FormulaType.Expression;
        avg.Decimals = 0;
        avg.Priority = 10; //for case when score calced based on one set of scores and correlation on another

        if(correlationAxis.Type === 'manual') {
            avg.Expression = 'if(col = 5, ' + correlationAxis.ZeroLine + ', AVERAGE(COLVALUES(2, ROWS)))';
        } else {
            avg.Expression = 'if(col = 5, (if(min(colvalues(2, rows)) < -0.3, (1 - min(colvalues(2, rows))) / 2, (1 - 0.3) / 2)), AVERAGE(COLVALUES(2, ROWS)))';
        }

        return avg;
    }

    /*
     * Add columns to the Correlation table
     * @param {object} context: {state: state, report: report, log: log, table: table, pageContext: pageContext, suppressSettings: suppressSettings}
     */
    static function tableCorrelation_AddColumns(context) {
        var log = context.log;
        var table = context.table;

        var columnsCollection: HeaderCollection = new HeaderCollection();

        /*
        for case when score calced based on one set of scores and correlation on another
        i.e. whole report uses q scores -100, 0, 100
        correlation can be calced but it will be not precise and sometimes not claculatable val/0
        so for corr scores should be different 0,1,2,3, therefore all got a bit more complex and in rush
         */

        //columnsCollection.Add(getStatisticsColumn());


        //add distribution barChart
        var bcCategories: HeaderCategories = new HeaderCategories();
        bcCategories.RecodingIdent = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'ReusableRecodingId');
        bcCategories.Totals = false;
        bcCategories.Distributions.Enabled = true;
        bcCategories.Distributions.HorizontalPercents = true;
        bcCategories.Decimals = 2;
        bcCategories.HideData = true;

        var posScoreRecodingCols = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'ReusableRecoding_PositiveCols');
        var fav: HeaderFormula = new HeaderFormula();
        fav.Type = FormulaType.Expression;
        fav.Expression = 'cellv(col-1,row)';
        fav.Decimals = 2;
        fav.Title = TextAndParameterUtil.getLabelByKey(context, 'Score');


        columnsCollection.Add(bcCategories);
        columnsCollection.Add(fav);

        columnsCollection.Add(getCorrelation(context));
        columnsCollection.Add(getBaseColumn());
        columnsCollection.Add(getFormulaColumn());

        table.ColumnHeaders.AddRange(columnsCollection);
    }

    /*
     * Create HeaderStatistics column
     * @return {HeaderStatistics} created column
     */
    static function getStatisticsColumn() {
        var headerStatistics = new HeaderStatistics();
        headerStatistics.Statistics.Avg = true;
        headerStatistics.Decimals = 3;

        return headerStatistics
    }

    /*
     * Create HeaderCorrelation column based on the selected correlation question
     * @return {HeaderCorrelation} created column
     */
    static function getCorrelation(context) {
        var selectedCorrelationVariable = ParamUtil.GetSelectedOptions(context, 'p_CorrelationQuestion')[0];

        if(!!selectedCorrelationVariable) {
            var selectedQuestion = selectedCorrelationVariable.Code;
            var questionnaireElement: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, selectedQuestion);

            var headerCorrelation : HeaderCorrelation = new HeaderCorrelation(CorrelationType.Correlation, questionnaireElement);
            headerCorrelation.Decimals = 3;

            return headerCorrelation;
        } else {
            throw new Error("PageCorrelation.tableCorrelation_AddColumns.getCorrelation: no correlation question specified in the Config");
        }
    }

    /*
     * Create HeaderBase column
     * @return {HeaderBase} created column
     */
    static function getBaseColumn() {
        var headerBase: HeaderBase = new HeaderBase();

        return headerBase;
    }

    /*
     * Create HeaderFormula column which is calculated based on AdjustedSentiment
     * if average score < overall average score then Adjusted score = (10 - average score + 5), else Adjusted score = (average score + 5)
     * final value is Adjusted score * Counts * Correlation
     * @return {HeaderFormula} created column
     */
    static function getFormulaColumn() {
        var headerFormula: HeaderFormula = new HeaderFormula();
        headerFormula.Type = FormulaType.Expression;
        headerFormula.Expression = "(IF(cellv(col-3,row)<cellv(col-3,1), (10 - (cellv(col-3,row) + 5)), (cellv(col-3,row) + 5))) * cellv(col-2,row) * cellv(col-1, row)";
        headerFormula.HideData = false;

        return headerFormula;
    }

    /*
     * Apply conditional formatting to the Correlation table to section the table into areas
     * Conditional formatting is used to define key area for each category
     *      1. issues: average score <= overall average score && correlation > 0
     *      2. monitor: average score < overall average score && correlation <= 0
     *      3. strength: average score > overall average score && correlation >0
     *      4. maintain: average score > overall average score && correlation <=0
     * conditional formatting applied to the firs column and then used by js fuction to create chart and 4 different tables
     * @param {object} context: {state: state, report: report, log: log, table: table, pageContext: pageContext, suppressSettings: suppressSettings}
     */
    static function tableCorrelation_AddConditionalFormatting(context) {
        var log = context.log;
        var table = context.table;

        var conditions = [
            {
                style: 'emptyCell'
            },
            {
                conditionBody: 'cellv(col + 1, row) > cellv(col+1, 1) AND cellv(col,row) <= cellv(col, 1) ',
                style: 'issues',
                condition: " "
            },
            {
                conditionBody: '(cellv(col + 1, row) = EMPTYV() OR cellv(col + 1, row) <= cellv(col+1, 1)) AND cellv(col,row) <= cellv(col, 1) ',
                style: 'monitor',
                condition: " "
            },
            {
                conditionBody: 'cellv(col + 1, row) > cellv(col+1, 1) AND cellv(col,row) > cellv(col, 1) ',
                style: 'strength',
                condition: " "
            },
            {
                conditionBody: '(cellv(col + 1, row) = EMPTYV() OR cellv(col + 1, row) <= cellv(col+1, 1)) AND cellv(col,row) > cellv(col, 1) ',
                style: 'maintain',
                condition: " "
            }
        ];

        var name = "KeyAreas";
        var applyTo = {
            axis: Area.Columns,
            direction: Area.Left,
            indexes: "4"
        };

        TableUtil.setupConditionalFormatting(context, conditions, name, applyTo);
    }

    /*
     * Add sorting to the Correlation table
     * @param {object} context: {state: state, report: report, log: log, table: table, pageContext: pageContext, suppressSettings: suppressSettings}
     */
    static function tableCorrelation_AddSorting(context) {
        TableUtil.setupRowsTableSorting(context, false, 1, 0, true, 1);
    }

    /**
     * Show help text depending on what view is chosen
     * @param {Object} context - {component: text, pageContext: this.pageContext,report: report, user: user, state: state, confirmit: confirmit, log: log}
     */
    static function txtHelp_Render(context){
        var text = '<div id="quadrant-table">'+
            TextAndParameterUtil.getTextTranslationByKey(context, 'CorrelationTable_InfoTooltip') +
            '</div>'+
            '<div id="quadrant-chart">'+
            TextAndParameterUtil.getTextTranslationByKey(context, 'CorrelationChart_InfoTooltip') +
            '</div>';

        context.text.Output.Append(text);
    }

    /**
     * txtCorrelationScript_Render
     * @param {Object} context - {component: text, pageContext: this.pageContext,report: report, user: user, state: state, confirmit: confirmit, log: log}
     */
    static function txtCorrelationScript_Render(context){
        var pageContext = context.pageContext;
        var pageId = pageContext.Items['CurrentPageId'];

        var selectedCorrelationVariable = ParamUtil.GetSelectedOptions(context, 'p_CorrelationQuestion')[0];
        var correlationVariableId = selectedCorrelationVariable.Code;
        var correlationVariableName = QuestionUtil.getQuestionTitle(context, correlationVariableId);

        var chartInit = "<script>"+
            "new Reportal.CorrelationView({" +
            "   chartContainer: 'correlation-chart'," +
            "   tableContainer: 'correlation-tables-view'," +
            "   buttonsContainer: 'chart-tables-switcher'," +
            "   table: document.querySelectorAll('.correlation-table')[document.querySelectorAll('.correlation-table').length -1 ]," +
            "   palette: correlationPalette," +
            "   questionName: '" + (correlationVariableName || correlationVariableId) + "'," +
            "   translations: correlationTranslations," +
            "   correlationAxis: correlationAxis," +
            "});"+
            "</script>";

        context.text.Output.Append(StyleAndJavaScriptUtil.printProperty(getTranslations(context),"correlationTranslations"));
        context.text.Output.Append(StyleAndJavaScriptUtil.printProperty(getPalette(context),"correlationPalette"));
        context.text.Output.Append(StyleAndJavaScriptUtil.printProperty(DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'CorrelationAxis'),"correlationAxis"));
        context.text.Output.Append(chartInit);
    }

    /**
     * Create an object with translations necessary for correlation table/chart
     * @param {Object} context - {component: text, pageContext: this.pageContext,report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @return {Object} translations
     */
    static function getTranslations(context) {
        var translation = {
            'No data to display': TextAndParameterUtil.getTextTranslationByKey(context, 'NoDataMsg'),
            'Impact on' : TextAndParameterUtil.getTextTranslationByKey(context, 'ImpactOn'),
            'Correlation chart' : TextAndParameterUtil.getTextTranslationByKey(context, 'CorrelationChart'),
            'Average' : TextAndParameterUtil.getTextTranslationByKey(context, 'AverageScore'),
            'Overall' : TextAndParameterUtil.getTextTranslationByKey(context, 'AverageScoreOverall'),
            'Correlation with' : TextAndParameterUtil.getTextTranslationByKey(context, 'CorrelationWith'),
            'Correlation with NPS' : TextAndParameterUtil.getTextTranslationByKey(context, 'CorrelationWithNPS'),
            'Zero correlation' : TextAndParameterUtil.getTextTranslationByKey(context, 'ZeroCorrelation'),

            'Priority Issues' : TextAndParameterUtil.getTextTranslationByKey(context, 'txtPriorityIssues'),
            'Strength' : TextAndParameterUtil.getTextTranslationByKey(context, 'txtStrength'),
            'Monitor and Improve' : TextAndParameterUtil.getTextTranslationByKey(context, 'txtMonitor'),
            'Maintain' : TextAndParameterUtil.getTextTranslationByKey(context, 'txtMaintain')
        }

        return translation;
    }

    /**
     * Create an object with colors for correlation table/chart
     * @param {Object} context - {component: text, pageContext: this.pageContext,report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @return {Object} palette
     */
    static function getPalette(context) {
        var chartColors = Config.correlationColors.ChartPalette;
        var areasColors = Config.correlationColors.AreasPalette;

        var palette = {
            chartColors: chartColors,
            areasColors: areasColors
        };

        return palette;
    }

    /**
     * Create an object with dimensions and questions for correlation
     * @param {Object} context - {component: text, pageContext: this.pageContext,report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @return {Object} object with dimensions and questions for correlation
     */
    static function getCorrelationDimensionsAndQuestions(context) {
        var log = context.log;
        var pageContext = context.pageContext;
        var pageId = pageContext.Items['CurrentPageId'];
        var correlationDimensions = DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'Dimensions');

        var correlationDimensionsAndQuestions = [];

        for(var i = 0; i < correlationDimensions.length; i++) {
            if(!!correlationDimensions[i].Type && correlationDimensions[i].Type.toLowerCase() === 'dimension') {
                correlationDimensionsAndQuestions.push(
                    {
                        Type: 'Dimension',
                        Code: correlationDimensions[i].Code,
                        Title: correlationDimensions[i].Code,
                        Questions: getQuestionsByDimensionId(context, correlationDimensions[i].Code)
                    }
                );
            } else {
                correlationDimensionsAndQuestions.push(
                    {
                        Type: 'Question',
                        Code: correlationDimensions[i],
                        Title: QuestionUtil.getQuestionTitle(context, correlationDimensions[i]),
                        Questions: []
                    }
                );
            }
        }

        return correlationDimensionsAndQuestions;
    }

    /**
     * Create an object with question info for a specific dimension
     * @param {Object} context - {component: text, pageContext: this.pageContext,report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @param {String} dimensionId
     * @return {Object} object with dimensions and questions for correlation
     */
    static function getQuestionsByDimensionId(context, dimensionId) {
        var log = context.log;
        var allDimensions = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'AllDimensions');
        var questions = [];

        for(var i = 0; i < allDimensions.length; i++) {
            if(allDimensions[i].Code === dimensionId) {
                var questionsInDimension = allDimensions[i].Questions;
                for(var j = 0; j < questionsInDimension.length; j++) {
                    questions.push(
                        {
                            Code: questionsInDimension[j],
                            Title: QuestionUtil.getQuestionTitle(context, questionsInDimension[j])
                        }
                    );
                }
                break;
            }
        }

        if(questions.length === 0) {
            throw new Error("PageCorrelation.getQuestionsByDimensionId: the " + dimensionId + " dimension is not specified in the config");
        }

        return questions;
    }
}
