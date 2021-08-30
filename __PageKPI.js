class PageKPI {

    /**
     * @memberof PageKPI
     * @function Hide
     * @description function to hide the page
     * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @returns {Boolean}
     */
    static function Hide(context){
        return false;
    }

    /**
     * @memberof PageKPI
     * @function Render
     * @description function to render the page
     * @param {Object} context - {component: page, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     */

    static function Render(context){

    }

    /**
     * @memberof PageKPI
     * @function tableKPI_Hide
     * @description function to hide the KPI table
     * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @returns {Boolean}
     */
    static function tableKPI_Hide(context){
        return true;
    }

    /**
     * @memberof PageKPI
     * @function tableKPI_Render
     * @description function to render the KPI table
     * @param {Object} context - {table: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log, suppressSettings: suppressSettings}
     */
    static function tableKPI_Render(context){

        var table = context.table;
        var log = context.log;
        var suppressSettings = context.suppressSettings;
        var pageId = PageUtil.getCurrentPageIdInConfig(context);

        var Qs = TableUtil.getActiveQuestionsListFromPageConfig (context, pageId, 'KPI', true);

        for (var i=0; i < Qs.length; i++) {

            var header = TableUtil.getHeaderDescriptorObject(context, Qs[i]);
            var row;

            if(header.Type === 'Question') {
                var qe: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, header.Code);
                row = new HeaderQuestion(qe);
                row.IsCollapsed = true;
                row.HideHeader = true;

            } else if(header.Type === 'Dimension') {

                row = new HeaderCategorization();
                row.CategorizationId = String(header.Code).replace(/[ ,&]/g, '');
                row.DataSourceNodeId = DataSourceUtil.getDsId(context);
                row.DefaultStatistic = StatisticsType.Average;
                row.CalculationRule = CategorizationType.AverageOfAggregates; // AvgOfIndividual affects performance
                row.Preaggregation = PreaggregationType.Average;
                row.SampleRule = SampleEvaluationRule.Max;// https://jiraosl.firmglobal.com/browse/TQA-4116
                row.Collapsed = true;
                row.Totals = true;
            }

            TableUtil.maskOutNA(context, row);
            table.RowHeaders.Add(row);
        }

        // add column statics
        var s : HeaderStatistics = new HeaderStatistics();
        s.Statistics.Avg = true;
        table.ColumnHeaders.Add(s);

        // add distribution columns
        if(DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'showKPISpread')) {
            var distr : HeaderCategories = new HeaderCategories();
            distr.RecodingIdent = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'NPSRecodingId');
            distr.Totals = false;
            distr.Distributions.Enabled = true;
            distr.Distributions.HorizontalPercents = true;
            distr.Decimals = Config.Decimal;
            table.ColumnHeaders.Add(distr);
        }

        // global table settings
        table.Caching.Enabled = false;
        SuppressUtil.setTableSuppress(table, suppressSettings);

    }


    /**
     * @memberof PageKPI
     * @function tableTrend_Hide
     * @description function to hide the Trend table
     * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @returns {Boolean}
     */
    static function tableTrend_Hide(context){

        return SuppressUtil.isGloballyHidden(context);

    }


    /**
     * @memberof PageKPI
     * @function chartTrend_Hide
     * @description function to hide the trend chart
     * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @returns {Boolean}
     */
    static function chartTrend_Hide(context){

        return SuppressUtil.isGloballyHidden(context) || Export.isExcelExportMode(context);

    }


    /**
     * @memberof PageKPI
     * @function tableTrend_Render
     * @description function to render the Trend table
     * @param {Object} context - {table: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log, suppressSettings: suppressSettings}
     */
    static function tableTrend_Render(context){

        var table = context.table;
        var log = context.log;
        var suppressSettings = context.suppressSettings;
        var pageId = PageUtil.getCurrentPageIdInConfig(context);

        var Qs = TableUtil.getActiveQuestionsListFromPageConfig (context, pageId, 'KPI', true);

        for (var i=0; i<Qs.length; i++) {
            table.RowHeaders.Add(TableUtil.getTrendHeader(context, TableUtil.getHeaderDescriptorObject(context, Qs[i])));
        }
        // add column - trending by Date variable
        var dateQId = DataSourceUtil.getSurveyPropertyValueFromConfig (context, 'DateQuestion');
        TableUtil.addTrending(context, dateQId);

        // global table settings
        table.Caching.Enabled = false;
        table.Decimals = Config.Decimal;
        SuppressUtil.setTableSuppress(table, suppressSettings);

    }

    /**
     * @memberof PageKPI
     * @function verbatim_Hide
     * @description function to hide the verbatim table
     * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @returns {Boolean}
     */
    static function verbatim_Hide(context){

        if (SuppressUtil.isGloballyHidden(context)) {
            return true;
        }

        var log = context.log;
        var report = context.report;
        var pageId = PageUtil.getCurrentPageIdInConfig(context);

        // check if question defined
        if(!DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'KPIComment')) {
            throw new Error('PageKPI.verbatim_Hide: KPI Comment question is not specified.');
        }

        // check base value for the verbatim question. If it is less than VerbatimSuppressValue, Verbatim table is hidden

        var counts : Datapoint[] = report.TableUtils.GetColumnValues("VerbatimBase", 1);

        for (var i=0; i<counts.Length; i++) {
            var base = parseInt(counts[i].Value);
            if (base < SuppressConfig.VerbatimSuppressValue) {
                return true;
            }
        }

        return false;
    }

    static function verbatim_Render(context) {

        var report = context.report;
        var state = context.state;
        var log = context.log;
        var verbatimTable = context.component;
        var pageId = PageUtil.getCurrentPageIdInConfig(context);
        var Q = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'KPIComment');
        var qe: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, Q);
        verbatimTable.QuestionnaireElement = qe;

        // Verbatim Hide Script (method 'verbatim_Hide') is used instead. Uncomment the lines below if you need bases for positive and negative comments calculated separately

        //verbatimTable.HideData.SuppressData = true;
        //verbatimTable.HideData.BaseLessThan = Config.SuppressSettings.VerbatimSuppressValue;
    }


    /**
     *
     */
    static function getDistributionKPIResult(context, values, startIndex) {

        var pageId = PageUtil.getCurrentPageIdInConfig(context);
        if(!DataSourceUtil.getPagePropertyValueFromConfig(context, pageId, 'showKPISpread')) {
            return [];
        }

        var distribution = [];
        var distributionColors = Config.npsColors_Distribution;

        if(!distributionColors || distributionColors.length === 0) {
            throw new Error('PageKPI.getDistributionKPIResult: no distribution descriptor provided for LTR scale');
        }

        for(var j=0; j<distributionColors.length; j++) {
            var spread = {};
            var cell = values[j+startIndex];
            var value = (!cell.IsEmpty && !cell.Value.Equals(Double.NaN)) ? (cell.Value*100).toFixed(Config.Decimal) : 0
            spread.value = value;
            spread.label = TextAndParameterUtil.getTextTranslationByKey(context, distributionColors[j].label);
            spread.color = distributionColors[j].color;
            distribution.push(spread);
        }

        return distribution;
    }

    /**
     *
     */
    static function getScoreKPIResult(context, scoreCell) {

        var result = {score: 'NA', color: Config.primaryGreyColor};
        var pageId = PageUtil.getCurrentPageIdInConfig(context);
        var thresholds = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'KPIthreshold');

        if (!scoreCell.IsEmpty && !scoreCell.Value.Equals(Double.NaN)) {
            result.score = parseFloat(scoreCell.Value.toFixed(Config.Decimal));
            for (var j=0; j<thresholds.length; j++) {
                if (result.score >= thresholds[j].score) {
                    result.color =  thresholds[j].color;
                    break;
                }
            }
        }

        return result;
    }

    /**
     * @memberof PageKPI
     * @function getKPIResult
     * @description function to get KPI score and title
     * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @returns {Object} - object with properties title and score
     */
    static function getKPIResult(context) {

        var report = context.report;
        var log = context.log;
        var pageId = PageUtil.getCurrentPageIdInConfig(context);

        // add row = KPI question
        var Qs = TableUtil.getActiveQuestionsListFromPageConfig (context, pageId, 'KPI');
	    
	var minValues = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'KPIMinValues');
	var maxValues = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'KPIMaxValues');
	    
	if (minValues == null || maxValues == null) {
	  throw new Error('PageKPI.getKPIResult: KPIMinValues or KPIMaxValues are not found. Check Config settings.');
	}
	if(minValues.length<Qs.length || maxValues.length<Qs.length){
	  throw new Error('PageKPI.getKPIResult: KPIMinValues or KPIMaxValues are not specified for some KPI questions. Check Config settings.');
	}

        if(Qs.length === 0 || SuppressUtil.isGloballyHidden(context)) {
            return [];
        }

        var titles = report.TableUtils.GetRowHeaderCategoryTitles('KPI:KPI'); //
        var results = [];

        for (var i=0; i < Qs.length; i++) {

            var header = TableUtil.getHeaderDescriptorObject(context, Qs[i]);
            
            var result = {qid: header.Code, title: titles[i], score: { value: 'N/A', color: Config.primaryGreyColor }, distribution: [], minValue: minValues[i], maxValue: maxValues[i]};
            var rowValues: Datapoint[] = report.TableUtils.GetRowValues("KPI:KPI",i+1);

            if (rowValues.length) {
                var scoreCell : Datapoint = rowValues[0];
                result.score = getScoreKPIResult(context, scoreCell);
                result.distribution = getDistributionKPIResult(context, rowValues, 1);
            }
            results.push(result);
        }

        return results;
    }

    static function buildKPIDistributionLegend(context) {

        var distributionColors = Config.npsColors_Distribution;
        var legend = '<div class="distribution-container__legend"><div class="bar-chart-legend">';

        for (var i = 0; i < distributionColors.length; i++) {
            legend += '<div class="bar-chart-legend__item legend-item">' +
                '<div class="legend-item__color" style="background-color: ' + distributionColors[i].color + ';"></div>' +
                '<div class="legend-item__label">' + TextAndParameterUtil.getTextTranslationByKey(context, distributionColors[i].legendLabel) + '</div>' +
                '</div>';
        }

        legend += '</div></div>';

        return legend;
    }

    static function buildKPIDistributionChart(context, qid, distribution) {

        if(!distribution || distribution.length ===0) {
            return '';
        }

        var spread = [];

        for(var i=0; i<distribution.length; i++) {
            var value = distribution[i].value;
            if(value>0) {
                var color = distribution[i].color;
                var title = distribution[i].label;
                var bar = '<div class="distribution-container__bar" style="width:'+value+'%; background-color:'+color+'" title="'+title+'">'+value+'%</div>';
                spread.push(bar);
            }
        }

        var barchart = '<div class = "distribution-container__barchart">'+spread.join('')+'</div>';
        var legend = buildKPIDistributionLegend(context);

        return '<div id="distribution-container-'+qid+'" class = "distribution-container">'+barchart+legend+'</div>';

    }


    /**
     * @memberof PageCategorical
     * @function buildCategoricalTiles
     * @description function to generate material cards with categories
     * @param {Object} context - {report: report, user: user, state: state, confirmit: confirmit, log: log}
     */
    static function buildKPITiles (context) {

        var log = context.log;

        // render cards
        var kpiResults = getKPIResult(context);
        for (var i=0; i<kpiResults.length; i++) {
            var content = {
                title: kpiResults[i].title,
                tooltip: TextAndParameterUtil.getTextTranslationByKey(context, 'KPI_InfoTooltip'),
                hoverText: '',
                qid: kpiResults[i].qid,
                data: '<div id="gauge-container-'+kpiResults[i].qid+'" class = "gauge-container"> </div>'+buildKPIDistributionChart(context, kpiResults[i].qid, kpiResults[i].distribution)
            };

            CardUtil.RenderCard (context, content, 'material-card--kpi');
        }
    }


    /**
     *
     */

    static function tableVerbatimBase_Hide(context) {
        return true;
    }

    /**
     * @memberof PageKPI
     * @function tableVerbatimBase_Render
     * @description function to render the Verbatim Base table. It is used for suppressing Verbatim Tables to check base
     * @param {Object} context - {table: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log, suppressSettings: suppressSettings}
     */
    static function tableVerbatimBase_Render(context){

        var log = context.log;
        var report = context.report;
        var state = context.state;
        var table = context.table;
        var pageId = PageUtil.getCurrentPageIdInConfig(context);
        // add row = open text question
        var Q = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'KPIComment');
        var qe: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, Q);
        var row : HeaderQuestion = new HeaderQuestion(qe);
        row.IsCollapsed = true;
        row.ShowTotals = false;
        table.RowHeaders.Add(row);
        table.Distribution.Enabled = true;
        table.Distribution.Count = true;
        table.Distribution.VerticalPercents = false;
    }

    /**
     * @memberof PageKPI
     * @function tableOrgOverview_Hide
     * @description function to hide the OrgOverview table
     * @param {Object} context - {pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log}
     * @returns {Boolean}
     */
    static function tableOrgOverview_Hide(context){

        return SuppressUtil.isGloballyHidden(context) || ParamUtil.isParameterEmpty(context, 'p_OrgOverviewBreakBy');

    }

    /**
     * @memberof PageKPI
     * @function tableOrgOverview_Render
     * @description function to render the OrgOverview table
     * @param {Object} context - {table: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log, suppressSettings: suppressSettings}
     */
    static function tableOrgOverview_Render(context){

        var table = context.table;
        var log = context.log;
        var report = context.report;
        var suppressSettings = context.suppressSettings;
        var pageId = PageUtil.getCurrentPageIdInConfig(context);

        //rows
        var rowsQid = ParamUtil.GetSelectedCodes(context, 'p_OrgOverviewBreakBy')[0];
        var rowsQidInfo = QuestionUtil.getQuestionInfo(context, rowsQid);
        var qe: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, rowsQid);
        var hrows: HeaderQuestion = new HeaderQuestion(qe);

        if(rowsQidInfo.standardType === 'hierarchy') { 
		
			//add internal benchmarks as top rows
			var reportBases = context.user.PersonalizedReportBase.split(',');
			if (reportBases.length === 1) {

				var internalBenchmarks = ParamUtil.GetSelectedCodes(context,'p_KPIHierarchyBasedComparisons');
				if (internalBenchmarks.length>0) {	
				
					var parentsList = HierarchyUtil.getParentsForCurrentHierarchyNode(context);
					var parentArr = parentsList[0]; //parent array contains top node twice (two last elements), for top node it contains one element - top node
									  
					  for(var i=0; i<internalBenchmarks.length;i++) {
						addBenchmarkRow(context, internalBenchmarks[i], parentArr);
					  }
				}
			}
          
            hrows.HierLayout = HierLayout.Flat;
            hrows.ReferenceGroup.Enabled = true;
            hrows.ReferenceGroup.Self = true;
            hrows.ReferenceGroup.Levels = '+1';                         
        }

        hrows.ShowTotals = false;
        var hs: HeaderSegment = new HeaderSegment();
		hs.DataSourceNodeId = DataSourceUtil.getDsId(context);
		hs.SegmentType = HeaderSegmentType.Expression;
		hs.HideData = false;
        hs.HideHeader = true;
		hs.Expression = Filters.getDirectFilterExpression(context);
        
        hrows.SubHeaders.Add(hs);
        table.RowHeaders.Add(hrows);

		//columns
		var waves = getWavesColumns(context);
		
		var response  = DataSourceUtil.getSurveyPropertyValueFromConfig (context, 'Response');
        qe = QuestionUtil.getQuestionnaireElement(context, response.qId);
        var hq: HeaderQuestion = new HeaderQuestion(qe);
        hq.IsCollapsed = true;
        hq.FilterByMask = true;
        hq.ShowTotals = false;
        hq.Distributions.Enabled = true;
        hq.Distributions.Count = true;
        hq.HideHeader = true;
        if (response.codes.length) {
            var qmask : MaskFlat = new MaskFlat(true);
            qmask.Codes.AddRange(response.codes);
            hq.AnswerMask = qmask;
        }
		AddWavesSubheaders(hq, waves);
        var hc : HeaderSegment = new HeaderSegment(TextAndParameterUtil.getLabelByKey(context, 'Responses'), '');
        hc.DataSourceNodeId = DataSourceUtil.getDsId (context);
        hc.SubHeaders.Add(hq);
        table.ColumnHeaders.Add(hc);


        var Qs = TableUtil.getActiveQuestionsListFromPageConfig (context, pageId, 'KPI', true);

        for (var i=0; i<Qs.length; i++) {

            var header = TableUtil.getHeaderDescriptorObject(context, Qs[i]);
            var col;

            if(header.Type === 'Question') {
                qe = QuestionUtil.getQuestionnaireElement(context, header.Code);
                col = new HeaderQuestion(qe);
                col.IsCollapsed = true;
                col.DefaultStatistic = StatisticsType.Average;

            } else if(header.Type === 'Dimension') {

                col = new HeaderCategorization();
                col.CategorizationId = String(header.Code).replace(/[ ,&]/g, '');
                col.DataSourceNodeId = DataSourceUtil.getDsId(context);
                col.DefaultStatistic = StatisticsType.Average;
                col.CalculationRule = CategorizationType.AverageOfAggregates; // AvgOfIndividual affects performance
                col.Preaggregation = PreaggregationType.Average;
                col.SampleRule = SampleEvaluationRule.Max;// https://jiraosl.firmglobal.com/bcolse/TQA-4116
                col.Collapsed = true;
                col.Totals = true;
            }

            TableUtil.maskOutNA(context, col);
			AddWavesSubheaders(col, waves);
            table.ColumnHeaders.Add(col);
        }

        // global table settings
        table.Caching.Enabled = false;
        table.RemoveEmptyHeaders.Rows = true;
        table.Decimals = Config.Decimal;
        SuppressUtil.setTableSuppress(table, suppressSettings);

    }
	
	 /*
     * @memberof PageKPI
     * @function getWavesColumns
     * @description Create HeaderQuestion columns with the Waves selected from the dropdown
     * @param {Object} context - {table: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log, suppressSettings: suppressSettings}
     * @return {array} created columns
     */
     static function getWavesColumns(context) {
        var log = context.log;
        var waveQid = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'WaveQuestion');

        var selectedWave = ParamUtil.GetSelectedCodes(context, 'p_Wave')[0];
        var selectedWaveType = ParamUtil.GetSelectedCodes(context, 'p_WaveOrgOverview')[0];
        var numberOfWaves = 0;

        switch (selectedWaveType) {
            case "CurrentWave" : numberOfWaves = 1; break;
            case "LastTwoWaves" : numberOfWaves = 2; break;
            case "LastThreeWaves" : numberOfWaves = 3; break;
            default: numberOfWaves = 1; break;
        }

        var maskCodes = TableUtil.getLastNWavesFromSelected(context, numberOfWaves, waveQid, selectedWave);
        var waveHeaders = [];
        
        for(var i = maskCodes.length - 1; i >= 0; i--) {
            var waveHeader = TableUtil.getWaveColumn(context, waveQid, maskCodes[i]);
            waveHeaders.push(waveHeader);
        }

        return waveHeaders;
    }
	
	 /*
	  * Adds row with benchmark
	  * @param {Object} context - {table: table, pageContext: this.pageContext, report: report, user: user, state: state, confirmit: confirmit, log: log, suppressSettings: suppressSettings}
	  * @param {string} bmlevel: top, top-1, parent
	  * @param {array} parentArr: array of parent objects {id: parentId, label: parentLabel} for the current node
	  */
    static function addBenchmarkRow(context, bmlevel, parentArr){
      
		var table = context.table;
        var report = context.report;
      
		var levelSegment: HeaderSegment = new HeaderSegment();
		levelSegment.DataSourceNodeId = DataSourceUtil.getDsId(context);
		levelSegment.SegmentType = HeaderSegmentType.Expression;
		levelSegment.HideData = false;
		
		var index;

		if (bmlevel === 'top' && parentArr.length > 0) {
			index = parentArr.length - 1;
		}
		else if (bmlevel === 'top-1' && parentArr.length > 2){
			index = parentArr.length - 3;
		}
		else if (bmlevel === 'parent' && parentArr.length > 1){
			index = 0;
		}
		else {
			return;
		}

		levelSegment.Expression = HierarchyUtil.getHierarchyFilterExpressionForNode(context, parentArr[index]['id'])
		levelSegment.Label = new Label(report.CurrentLanguage, parentArr[index]['label']);
		table.RowHeaders.Add(levelSegment);		
    }
	
	/*
	  * Adds waves subheaders to specified header
	  * @param {Object} header
	  * @param {array} array of subheaders
	  */
	static function AddWavesSubheaders(header, waves) {
		if(!!waves && ArrayUtil.isArray(waves)) {
			for(var i = 0; i < waves.length; i++) {
				header.SubHeaders.Add(waves[i]);
			}
		}
	}
    
    /*
	 * Checks if OrgOverview table breakby is hierarchy
	 * @param {Object} context 
	 * @returns {Boolean}
	 */
    static function isKPIBreakByHierarchy(context){
        
		var breakByQid = ParamUtil.GetSelectedCodes(context, 'p_OrgOverviewBreakBy')[0];
		var breakByQidInfo = QuestionUtil.getQuestionInfo(context, breakByQid);
		
        return (breakByQidInfo.standardType === 'hierarchy')? true : false;
	}

}
