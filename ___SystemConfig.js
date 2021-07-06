public class SystemConfig {

    /** 
  * Object with resources (values) for parameters.
  * - propertyName: name of property (the lowest level of the path so to say) that keeps the value
  * - type (type of data): StaticArrayofObjects (static array text values in format {Code: code, Label: label}), QuestionList (array of question ids), QuestionId (sring with questionId)
  * - locationType (where data is stored): TextAndParameterLibrary (as is), Page (in page property), Survey (in survey property), Report (general report property in Config)
  * - page: when locationType is 'Page' this property specifies pageId
  */
    static var reportParameterValuesMap = {

        'p_projectSelector': { type: 'PulseSurveyInfo', locationType: 'Survey', propertyPath: ['PulseSurveyData', 'visibleSurveys'], CachingDisabled: true},
        'p_Trends_trackerSurveys': { type: 'QuestionId', locationType: 'QuestionId', ID: 'source_projectid', CachingDisabled: true}, //temporary

        'p_Results_CountsPercents':   { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'Distribution' },
        'p_Results_TableTabSwitcher': { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'ResultsTabSwitcher'},
        'p_TimePeriod':               { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'TimePeriods'},
        'p_TimeUnitWithDefault':      { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'TimeUnitsWithDefaultValue'},
        'p_TimeUnitNoDefault':        { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'TimeUnitsNoDefaultValue'},
        'p_LastTimeUnitsNoDefault':   { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'LastTimeUnitsNoDefaultValue'},
        'p_CatDD_TimeUnitNoDefault':  { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'TimeUnitsNoDefaultValue'},
        'p_DisplayMode':              { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'DisplayMode'},
        'p_ShowAllPulseSurveys':      { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'ShowAllPulseSurveys'},
        'p_AcrossAllSurveys':         { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'AcrossAllSurveys'},

        'p_Results_BreakBy':      { type: 'QuestionList', locationType: 'Page', page: 'Page_Results',              propertyName: 'BreakVariables', isQuestionBased: true},
        'p_CategoricalDD_BreakBy':{ type: 'QuestionList', locationType: 'Page', page: 'Page_CategoricalDrilldown', propertyName: 'BreakVariables', isQuestionBased: true},
        'p_ResponseRate_BreakBy': { type: 'QuestionList', locationType: 'Page', page: 'Page_Response_Rate',        propertyName: 'BreakVariables', isQuestionBased: true},
        'p_Demographics':         { type: 'QuestionList', locationType: 'Page', page: 'Page_Response_Rate',        propertyName: 'DemographicsQuestions', isQuestionBased: true},
        'p_OpenTextQs':           { type: 'QuestionList', locationType: 'Page', page: 'Page_Comments',             propertyName: 'Comments', isQuestionBased: true},
        'p_CustomOpenTextQs':     { type: 'CustomQuestionList',  locationType: 'QuestionCategory', page: 'Page_Comments',  propertyName: 'CustomCommentCategory', isQuestionBased: true, CachingDisabled: true},
        'p_AllOpenTextQs':        { type: 'ParameterOptionList', locationType: 'CombinationOfParameters',          parameterList: ['p_OpenTextQs', 'p_CustomOpenTextQs'], isQuestionBased: true, CachingDisabled: true},
        'p_ScoreQs':              { type: 'QuestionList', locationType: 'Page', page: 'Page_Comments',             propertyName: 'ScoresForComments', isQuestionBased: true},
        'p_TagQs':                { type: 'QuestionList', locationType: 'Page', page: 'Page_Comments',             propertyName: 'TagsForComments', isQuestionBased: true},
        'p_QsToFilterBy':         { type: 'QuestionList', locationType: 'Page', page: 'Page_KPI',                  propertyName: 'KPIQuestionsToFilterVerbatim', isQuestionBased: true},  
        'p_BenchmarkSet': { type: 'StaticArrayofObjects', locationType: 'Page', page: 'Page_Results', propertyName: 'BenchmarkSet'},

        'p_Statements':         { type: 'QuestionId',           locationType: 'SystemConfig', section: 'ActionPlannerSettings', propertyName: 'StatementsQId'},
        'p_Dimensions':         { type: 'QuestionId',           locationType: 'SystemConfig', section: 'ActionPlannerSettings', propertyName: 'DimensionsQId'},
        'p_Actions_BreakBy':    { type: 'QuestionList',         locationType: 'Page', page: 'Page_Actions', propertyName: 'BreakVariables'},
        'p_ActionCost_BreakBy': { type: 'QuestionList',         locationType: 'Page', page: 'Page_Actions', propertyName: 'BreakVariables'},
        'p_ActionAllocation':   { type: 'QuestionList',         locationType: 'Page', page: 'Page_Actions', propertyName: 'Breakdown'},
        'p_EndUserSelection':   { type: 'QuestionId',           locationType: 'Page', page: 'Page_Actions', propertyName: 'EndUserSelection'},
        'p_EndUserSelectionHitlist':   { type: 'QuestionId',    locationType: 'Page', page: 'Page_Actions', propertyName: 'EndUserSelection'},

        'p_ActionsHitlistSettings':  { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary',    propertyName: 'ActionsHitlistSettings'},
        'p_OnlyOwnActions':          { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary',    propertyName: 'ShowOnlyOwnActions'},

        'p_TrendQs': { type: 'QuestionAndCategoriesList', locationType: 'Page', page: 'Page_Trends', propertyName: 'TrendQuestions', isQuestionBased: true },
        'p_Wave': { type: 'QuestionId', locationType: 'Survey', propertyName: 'WaveQuestion', isInReverseOrder: true},
        'p_Hierarchy': { type: 'HierarchyTable', locationType: 'ReportHierarchy'}

    };

    static var defaultParameterValues = {
        'p_Wave': { locationType: 'Survey', propertyName: 'DefaultWave'}
    };

    // mandatory parameters can be single or multi. Must have default value when a page opens
    static var mandatoryPageParameters = ['p_ActionAllocation','p_Actions_BreakBy','p_ActionCost_BreakBy',
                                          'p_projectSelector', 'p_TimeUnitWithDefault',  'p_TimePeriod', 'p_BenchmarkSet',
                                          'p_Wave', 'p_OpenTextQs', 'p_CustomOpenTextQs', 'p_AllOpenTextQs', 'p_TrendQs','p_LastTimeUnitsNoDefault',
                                          'p_Demographics', 'p_QsToFilterBy', 'p_Dimensions', 'p_Results_TableTabSwitcher', 'p_Trends_trackerSurveys', 'p_Hierarchy'];

    // optional parameters are usually multiple. Can be empty by default
    static var optionalPageParameters = ['p_OnlyOwnActions', 'p_ScoreQs', 'p_TagQs', 'p_TimeUnitNoDefault',
                                         'p_CatDD_TimeUnitNoDefault','p_EndUserSelection, p_EndUserSelectionHitlist'];  // we must add them empty option as 1st value instead

    static const paramTypesToBeReset = {
        'PulseSurveyInfo': false,
        'QuestionId': false,
        'StaticArrayofObjects': false,
        'CustomQuestionList': true,
        'ParameterOptionList': true,
        'QuestionList': true,
        'QuestionAndCategoriesList': true
    };

    /**
     * list of properties of survey or report page that are based on questions and/or categories
     * for pulse programs to be able to exclude questions not relevant for particular baby survey from selector lists and widgets
     */
    static public var resourcesDependentOnSpecificSurvey = {

        Survey: ['FiltersFromSurveyData'],
        Page_KPI: ['KPI', 'KPIQuestionsToFilterVerbatim'],
        Page_Trends: ['TrendQuestions'],
        Page_Results: ['BreakVariables'],
        Page_Comments: ['Comments', 'ScoresForComments', 'TagsForComments', {type: 'QuestionsCategory', propertyWithCat: 'CustomCommentCategory'}],
        Page_Categorical_: ['ResultCategoricalQuestions', 
                            'ResultMultiCategoricalQuestions', 
                            {type: 'QuestionsCategories', propertyWithCategories: 'CustomCategoriesSingle'}, 
                            {type: 'QuestionsCategories', propertyWithCategories: 'CustomCategoriesMulti'}
                        ],
        Page_CategoricalDrilldown: ['BreakVariables'],
        Page_Response_Rate: ['DemographicsQuestions'],
        Page_Actions: []
    };


    /**
     * stores Action Planner related settings that shouldn't be changed by clients themselves
     * too stable or too complex
     */
    static public var ActionPlannerSettings = {
        //used for selector at the top of the page when add a new action:
        DimensionsQId: 'dimension', //id of dimensions question
        StatementsQId: 'statement', //id of statement question

        ActionCreatorsList: 'userId', //Qid of action creator question - to determine inactive users
        EndUserSelection: 'actionowner', //Qid which holds the list of end users
        CallBlockID: 'Init', //The id of the call block for the hitlist links

        TrendingStartDate : new DateTime (2019, 1, 1)
    };
}
