class PageActionPlan{
  
  static const IS_HIERARCHY_CHANGED_PARAMETER_NAME = "isHierarchyValueChanged";
  static const PREVIOUS_HIERARCHY_VALUE_PARAMETER_NAME = "previousHierarchyValue";
  
  /**
* @description function to render the Hitlist.
* @param {Object} context - {state: state, report: report, log: log, table: table, pageContext: pageContext, user: user, confirmit: confirmit}
* @example PageActionPlan.usualHitlist_Render({state: state, report: report, pageContext: pageContext, log: log, hitlist: hitlist, confirmit: confirmit});
*/
  static function usualHitlist_Render(context){
    var hitlist = context.hitlist;
    var pageId = PageUtil.getCurrentPageIdInConfig(context);
    var log = context.log;
    
    var staticCols = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'staticColumns');
    var linksTypes = DataSourceUtil.getPagePropertyValueFromConfig (context, pageId, 'linksTypes');
    
    var position = linksTypes.length;
    var linksNumber = linksTypes.length;
    
    
    
    if(linksNumber != hitlist.Columns.Count) {
      throw new Error('PageActionPlan.usualHitlist_Render: сheck Config settings for the number of links, or add extra links to the hitlist. Do not add other questions manually.');
    }
    
    for (var i=0; i<linksTypes.length; i++){
      hitlist.Columns[i].SurveyLink.Name = linksTypes[i] + ' Link';
    } 
    
    for (var i=0; i<staticCols.length; i++) {
      if (staticCols[i].code == undefined || staticCols[i].code == null || staticCols[i].code == "") {
        Hitlist.AddColumn(context, staticCols[i].id, {sortable: staticCols[i].properties.sortable, searchable: staticCols[i].properties.searchable, order: position});
      } else {
        Hitlist.AddColumnForSubquestion(context, staticCols[i].id, staticCols[i].code, {sortable: staticCols[i].properties.sortable, searchable: staticCols[i].properties.searchable, order: position});      
      }
      
      if (staticCols[i].title != undefined && staticCols[i].title != null && staticCols[i].title != "") {
        hitlist.Columns[i+linksNumber].QuestionnaireElement.Label = new Label(context.report.CurrentLanguage, TextAndParameterUtil.getTextTranslationByKey(context, staticCols[i].title));
      }
      position++;
    }
    
    for (var i=0; i<linksTypes.length; i++){
      var column = hitlist.Columns[0];
      hitlist.Columns.RemoveAt(0);
      hitlist.Columns.Add(column);
    } 
    
    if(staticCols.length !== hitlist.Columns.Count - linksNumber) {
      throw new Error('PageActionPlan.usualHitlist_Render: сheck Config settings for hitlist columns, '+DataSourceUtil.getProgramDsId(context)+'. Duplicated question ids and hierarchy variables are not allowed to use in the hitlist component.');
    }
  }
  
  static function setHierarchyValueChangedParameters(context, page){
    var log = context.log;
    var state = context.state;
    var user = context.user;
    
    
    if (state.Parameters.IsNull(PREVIOUS_HIERARCHY_VALUE_PARAMETER_NAME)) {      
      state.Parameters[PREVIOUS_HIERARCHY_VALUE_PARAMETER_NAME] = new ParameterValueResponse(user.PersonalizedReportBase);
      state.Parameters[IS_HIERARCHY_CHANGED_PARAMETER_NAME] = new ParameterValueResponse("false");
    } else {
  
      if (user.PersonalizedReportBase == state.Parameters.GetString(PREVIOUS_HIERARCHY_VALUE_PARAMETER_NAME)) {
        state.Parameters[IS_HIERARCHY_CHANGED_PARAMETER_NAME] = new ParameterValueResponse("false");
      } else {
        state.Parameters[PREVIOUS_HIERARCHY_VALUE_PARAMETER_NAME] = new ParameterValueResponse(user.PersonalizedReportBase);
        state.Parameters[IS_HIERARCHY_CHANGED_PARAMETER_NAME] = new ParameterValueResponse("true");
      }
    }
  }
  
  static function setDoubleReloadAfterHierarchyChangeScriptHTML(context, text){
    var log = context.log;
    var state = context.state;
    
    var script = "";
    
    if (state.Parameters.GetString(IS_HIERARCHY_CHANGED_PARAMETER_NAME) == "true") {
      var script = "<script>window.addEventListener('load', function (e) { document.querySelector('.css-menu-selected a').click(); });</script>";
    }
    
    text.Output.Append(script);
  }
  
  static function addPageSpecificHTML(context, text){
    setDoubleReloadAfterHierarchyChangeScriptHTML(context, text);
  }
}
