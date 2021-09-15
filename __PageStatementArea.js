class PageStatementArea{
  
  /*
* @param context = {log:log, confirmit: confirmit, report: report, state:state, pageContext: pageContext, user:user}
*/
  static function statementValuesTable_Render(context, table){
    var log = context.log;
    var pageId = PageUtil.getCurrentPageIdInConfig(context);
    
    statementValuesTable_AddRows(context, table);
    statementValuesTable_AddColumns(context, table);
    
    table.Caching.Enabled = false;
    table.Decimals = 2;
    table.Distribution.Count = true;
    table.Distribution.VerticalPercents = false;
    table.Base = TableBaseType.ExcludeNotAnswered;
    
    table.SuppressData.SuppressData = true;
    table.SuppressData.BaseLessThan = SuppressConfig.TableSuppressValue;
    table.SuppressData.Statistic = StatisticType.Count;
    
    
    
    table.UpperLevelComparison.SpecifyRelation = true;
    table.UpperLevelComparison.RelationName =  DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'UpperLevelComparisonRelationName');
    table.UpperLevelComparison.RuleForCuts = UpperLevelRuleType.UpperLevelOfSelf;
    
    
  }
  //PageStatementArea.statementValuesTable_AddRows({log:log, confirmit: confirmit, report: report, state:state, pageContext: pageContext}, table)
  static function statementValuesTable_AddRows(context, table){
    var log = context.log; 
    var pageId = PageUtil.getCurrentPageIdInConfig(context);
    var dsId = DataSourceUtil.getPageDsId(context);
    
    //overall
    var overall : HeaderCategorization = new HeaderCategorization();
    overall.DataSourceNodeId = dsId;
    overall.CategorizationId = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'OverallCategorization');
    overall.UseDefaults = false;
    overall.DefaultStatistic = StatisticsType.Average;
    overall.CalculationRule = CategorizationType.AverageOfAggregates;
    overall.Collapsed = true;
    overall.Totals = false;
    overall.Preaggregation = PreaggregationType.Average;
    overall.SampleRule = SampleEvaluationRule.Max;
    
    table.RowHeaders.Add(overall);
    
    //empty line
    var emptyFormula : HeaderFormula = new HeaderFormula();
    emptyFormula.UseDefaults = false;
    emptyFormula.Type = FormulaType.Expression;
    emptyFormula.Expression = "EmptyValue()";
    
    table.RowHeaders.Add(emptyFormula);
    
    //statements
    var statementsCategorizations = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'StatementCategorizations');
    
    for(var i=0; i<statementsCategorizations.length; i++){
      var statement : HeaderCategorization = new HeaderCategorization();
      statement.DataSourceNodeId = dsId;
      statement.CategorizationId = statementsCategorizations[i];
      statement.UseDefaults = false;
      statement.DefaultStatistic = StatisticsType.Average;
      statement.CalculationRule = CategorizationType.AverageOfAggregates;
      statement.Collapsed = true;
      statement.Totals = false;
      statement.Preaggregation = PreaggregationType.Average;
       statement.SampleRule = SampleEvaluationRule.Max;
      
      
      table.RowHeaders.Add(statement);
    }
  }
  static function statementValuesTable_AddColumns(context, table){
    var log = context.log;
    var report = context.report;
    var dsId = DataSourceUtil.getPageDsId(context);
    
    var waveQuestionId = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'WaveQuestion');
    var waveDefaultValue = DataSourceUtil.getSurveyPropertyValueFromConfig(context, 'DefaultWaveValue');
    
    var labelThisGroup : Label = new Label(report.CurrentLanguage, TextAndParameterUtil.getTextTranslationByKey(context, "StArea_ThisGroup"));
    
    
    //This group this wave
    
    var thisWaveQE : QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, waveQuestionId);
    var thisWaveSelfHeader: HeaderQuestion = new HeaderQuestion(thisWaveQE);
    
    thisWaveSelfHeader.UseDefaults = false;
    
    var thisWaveMask : MaskFlat = new MaskFlat();
    thisWaveMask.IsInclusive = true;
    thisWaveMask.Codes.Add(waveDefaultValue);
    
    thisWaveSelfHeader.AnswerMask = thisWaveMask;
    thisWaveSelfHeader.IsCollapsed = false;
    thisWaveSelfHeader.ShowTotals = false;
    thisWaveSelfHeader.FilterByMask = true;
    thisWaveSelfHeader.HideHeader = true;
    
    var thisWaveTitle = QuestionUtil.getQuestionAnswerByCode(context, waveQuestionId, waveDefaultValue).Text;
    
    var labelThisGroupThisWave : Label = new Label(report.CurrentLanguage, thisWaveTitle +": " + TextAndParameterUtil.getTextTranslationByKey(context, "StArea_ThisGroup"));
    var thisGroupSegment : HeaderSegment = new HeaderSegment(labelThisGroupThisWave, 'IN(status, "complete")'); 
    thisGroupSegment.DataSourceNodeId = dsId;
    thisGroupSegment.SegmentId = "thisGroupSegment1";
    thisWaveSelfHeader.SubHeaders.Add(thisGroupSegment);
    
    table.ColumnHeaders.Add(thisWaveSelfHeader);
    
    
    //This group previous wave
    
    var previousWaveSelfHeader: HeaderQuestion = new HeaderQuestion(thisWaveQE);
    previousWaveSelfHeader.UseDefaults = false;
    
    var previousWaveMask : MaskFlat = new MaskFlat();
    previousWaveMask.IsInclusive = true;
    previousWaveMask.Codes.Add(waveDefaultValue-1);
    
    previousWaveSelfHeader.AnswerMask = previousWaveMask;
    previousWaveSelfHeader.IsCollapsed = false;
    previousWaveSelfHeader.ShowTotals = false;
    previousWaveSelfHeader.FilterByMask = true;   
    previousWaveSelfHeader.HideHeader = true;
    
    var previousWaveTitle = QuestionUtil.getQuestionAnswerByCode(context, waveQuestionId, waveDefaultValue-1).Text;
    var labelThisGroupPreviousWave : Label = new Label(report.CurrentLanguage, previousWaveTitle +": " + TextAndParameterUtil.getTextTranslationByKey(context, "StArea_ThisGroup"));
  
    var previousGroupSegment : HeaderSegment = new HeaderSegment(labelThisGroupPreviousWave, 'IN(status, "complete")'); 
    previousGroupSegment.DataSourceNodeId = dsId;
    previousGroupSegment.SegmentId = "thisGroupSegment2";
    previousWaveSelfHeader.SubHeaders.Add(previousGroupSegment);
    
    table.ColumnHeaders.Add(previousWaveSelfHeader);
    
    //Benchmark
    
    var benchmarkHeader: HeaderQuestion = new HeaderQuestion(thisWaveQE);
    
    benchmarkHeader.UseDefaults = false;
    
    benchmarkHeader.AnswerMask = thisWaveMask;
    benchmarkHeader.IsCollapsed = false;
    benchmarkHeader.ShowTotals = false;
    benchmarkHeader.FilterByMask = true;
    benchmarkHeader.HideHeader = true;
    
    var benchmarkStatisticSubheader : HeaderStatistics = new HeaderStatistics();
    benchmarkStatisticSubheader.UseDefaults = false;
    benchmarkStatisticSubheader.Statistics.Avg = true;
    benchmarkStatisticSubheader.UpperLevelComparison = true;
    benchmarkStatisticSubheader.Texts.Average = new Label(report.CurrentLanguage, thisWaveTitle + ": "+ TextAndParameterUtil.getTextTranslationByKey(context, "Benchmark"));
    
    benchmarkHeader.SubHeaders.Add(benchmarkStatisticSubheader);
    
    table.ColumnHeaders.Add(benchmarkHeader);
    
  }
  
  static function statementValuesDiffTable_Render(context, table){
    var log = context.log;
    var report = context.report;
    
    statementValuesTable_Render(context, table);
    //hide columns
    
    table.ColumnHeaders[1].HideHeader = true;
    table.ColumnHeaders[1].HideData = true;
    table.ColumnHeaders[1].SubHeaders[0].HideHeader = true;
    table.ColumnHeaders[1].SubHeaders[0].HideData = true;
    
    table.ColumnHeaders[2].HideHeader = true;
    table.ColumnHeaders[2].HideData = true;
    table.ColumnHeaders[2].SubHeaders[0].HideHeader = true;
    table.ColumnHeaders[2].SubHeaders[0].HideData = true;
    
    //add formulas
    var developmentFormula1 : HeaderFormula = new HeaderFormula();
    developmentFormula1.Type = FormulaType.Expression; //FormulaType.Operators;
    developmentFormula1.Expression = "round(cellv(col-3, row) - cellv(col-2, row),10)"; //rounding to avoid computer memory calculation error
    //developmentFormula1.Operator = FormulaOperatorType.Subtract;
    //developmentFormula1.ReferenceType = FormulaOperatorReferenceType.Relative;
    //developmentFormula1.LeftArgument = -3;
    //developmentFormula1.RightArgument = -2;
    developmentFormula1.Percent = false;
    developmentFormula1.Priority = 0;
    developmentFormula1.Title = new Label(report.CurrentLanguage, TextAndParameterUtil.getTextTranslationByKey(context, "StArea_DevFromLastYear"));
    
    table.ColumnHeaders.Add(developmentFormula1);
    
    var developmentFormula2 : HeaderFormula = new HeaderFormula();
    developmentFormula2.Type = FormulaType.Expression; //FormulaType.Operators;
    developmentFormula2.Expression = "round(cellv(col-4, row) - cellv(col-2, row),10)"; //rounding to avoid computer memory calculation error
    //developmentFormula2.Operator = FormulaOperatorType.Subtract;
    //developmentFormula2.ReferenceType = FormulaOperatorReferenceType.Relative;
    //developmentFormula2.LeftArgument = -4;
    //developmentFormula2.RightArgument = -2;
    developmentFormula2.Percent = false;
    developmentFormula2.Priority = 0;
    developmentFormula2.Title = new Label(report.CurrentLanguage, TextAndParameterUtil.getTextTranslationByKey(context, "StArea_GapFromBenchmark"));
    
    table.ColumnHeaders.Add(developmentFormula2);
    
    //add conditional formatting
    var newContext = {confirmit: context.confirmit, report:context.report, state: context.state, log: context.log, pageContext: context.pageContext, table: table};
    setupConditionalFormatting(newContext, [{conditionBody: 'cellv()', condition: ' > 0', style: 'positiveChange'}], 'AreaPositive', {axis: Area.Columns, direction: Area.Left, indexes: "4-5"});
    setupConditionalFormatting(newContext, [{conditionBody: 'cellv()', condition: ' < 0', style: 'negativeChange'}], 'AreaNegantive', {axis: Area.Columns, direction: Area.Left, indexes: "4-5"});
  }
  
  //The one in TableUtil isn't universal
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
      
      
      if (conditions[i].condition) {
        c1.Expression = (conditions[i].conditionBody ? conditions[i].conditionBody : 'cellv(col,row)') + conditions[i].condition;
      } else {
        c1.Expression = 'true';
      }
      area.AddCondition(c1);
    }
    
    formatter.AddArea(area);
    
    table.ConditionalFormatting = formatter;
  }
  static function addPageSpecificHTML(context, text){
    var log = context.log;
    
    addDifferenceTableConditionalFormattingStyles(context, text);
  }
  
  static function addDifferenceTableConditionalFormattingStyles(context, text){
    var log = context.log;
    var pageId = PageUtil.getCurrentPageIdInConfig(context);
    
    var positiveColor =  DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'PositiveFormattingColor');
    var negativeColor =  DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'NegativeFormattingColor');
    
    
    var colorOptions = [{label: "positiveChange", color: positiveColor}, {label: "negativeChange", color: negativeColor}];
    
    var html = getCSSForConditionalFormatting(colorOptions);
    text.Output.Append(html);
    
  }
  
  static function getCSSForConditionalFormatting(colorOptions){
    var styleComponent = '<style>';
    
    for(var i = 0; i < colorOptions.length; i++) {
      var options = colorOptions[i];
      styleComponent += '.cf_' + options.label + ' {\r\n' +
        '  color: ' + options.color + '!important;\r\n' +
          '   text-align: center; font-weight: bold;\r\n'+
            '}\r\n';
    }    
    styleComponent += '</style>';
    return styleComponent;
  }
  
}
