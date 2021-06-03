public class SystemConfig {

    /** 
  * Object with resources (values) for parameters.
  * - propertyName: name of property (the lowest level of the path so to say) that keeps the value
  * - type (type of data): StaticArrayofObjects (static array text values in format {Code: code, Label: label}), QuestionList (array of question ids), QuestionId (sring with questionId)
  * - locationType (where data is stored): TextAndParameterLibrary (as is), Page (in page property), Survey (in survey property), Report (general report property in Config)
  * - page: when locationType is 'Page' this property specifies pageId
  */
    static var reportParameterValuesMap = {

        'p_projectSelector': { type: 'PulseSurveyInfo', locationType: 'Survey', propertyName: ['PulseSurveyData', 'visibleSurveys'], CachingDisabled: true},
        'p_Trends_trackerSurveys': { type: 'DynamicList', locationType: 'FunctionCall', path: 'SurveyTracker.getAllSurveyDescriptors', CachingDisabled: true}, //temporary

        'p_Results_CountsPercents':   { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'Distribution' },
        'p_Results_TableTabSwitcher': { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'ResultsTabSwitcher'},
        'p_TimePeriod':               { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'TimePeriods'},
        'p_TimeUnitWithDefault':      { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'TimeUnitsWithDefaultValue'},
        'p_TimeUnitNoDefault':        { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'TimeUnitsNoDefaultValue'},
        'p_CatDD_TimeUnitNoDefault':  { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'TimeUnitsNoDefaultValue'},
        'p_DisplayMode':              { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'DisplayMode'},
        'p_ShowAllPulseSurveys':      { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'ShowAllPulseSurveys'},
        'p_AcrossAllSurveys':         { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'AcrossAllSurveys'},
        'p_DirectFilter':         { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'DirectFilter'},

        'p_Results_BreakBy':      { type: 'QuestionList', locationType: 'Page', page: 'Page_Results',              propertyName: 'BreakVariables', isQuestionBased: true},
        'p_OrgOverviewBreakBy':   { type: 'QuestionList', locationType: 'Page', page: 'Page_KPI',                  propertyName: 'OrgOverviewBreakVariables', isQuestionBased: true},
        'p_AllResults_BreakBy':   { type: 'QuestionList', locationType: 'Page', page: 'Page_AllResults',           propertyName: 'BreakVariables', isQuestionBased: true},
        'p_CategoricalDD_BreakBy':{ type: 'QuestionList', locationType: 'Page', page: 'Page_CategoricalDrilldown', propertyName: 'BreakVariables', isQuestionBased: true},
        //'p_ResponseRate_BreakBy': { type: 'QuestionList', locationType: 'Page', page: 'Page_Response_Rate',        propertyName: 'BreakVariables', isQuestionBased: true},
        'p_Demographics':         { type: 'QuestionList', locationType: 'Page', page: 'Page_Response_Rate',        propertyName: 'DemographicsQuestions', isQuestionBased: true},
        'p_OpenTextQs':           { type: 'QuestionList', locationType: 'Page', page: 'Page_Comments',             propertyName: 'Comments', isQuestionBased: true},
        'p_CustomOpenTextQs':     { type: 'CustomQuestionList',  locationType: 'QuestionCategory', page: 'Page_Comments',  propertyName: 'CustomCommentCategory', isQuestionBased: true, CachingDisabled: true},
        'p_AllOpenTextQs':        { type: 'ParameterOptionList', locationType: 'CombinationOfParameters',          parameterList: ['p_OpenTextQs', 'p_CustomOpenTextQs'], isQuestionBased: true, CachingDisabled: true},
        'p_ScoreQs':              { type: 'QuestionList', locationType: 'Page', page: 'Page_Comments',             propertyName: 'ScoresForComments', isQuestionBased: true},
        'p_TagQs':                { type: 'QuestionList', locationType: 'Page', page: 'Page_Comments',             propertyName: 'TagsForComments', isQuestionBased: true},
        'p_QsToFilterBy':         { type: 'QuestionList', locationType: 'Page', page: 'Page_KPI',                  propertyName: 'KPIQuestionsToFilterVerbatim', isQuestionBased: true},
        'p_Statements':           { type: 'QuestionList', locationType: 'Page', page: 'Page_Actions',              propertyName: 'Statements', isQuestionBased: true},


        'p_ImpactAnalysisDimension':    { type: 'QuestionAndCategoriesList', locationType: 'Page', page: 'Page_Correlation', propertyName: 'Dimensions', isQuestionBased: true},
        'p_CorrelationQuestion':           { type: 'QuestionList', locationType: 'Page', page: 'Page_Correlation',              propertyName: 'CorrelationQuestions', isQuestionBased: true},


        'p_BenchmarkSet': { type: 'StaticArrayofObjects', locationType: 'Page', page: 'Page_Results', propertyName: 'BenchmarkSet'},
        'p_HierarchyBasedComparisons': { type: 'StaticArrayofObjects', locationType: 'Page', page: 'Page_Results', propertyName: 'HierarchyBasedComparisons'},
        'p_KPIHierarchyBasedComparisons': { type: 'StaticArrayofObjects', locationType: 'Page', page: 'Page_KPI', propertyName: 'KPIHierarchyBasedComparisons'},
        'p_Dimensions':   { type: 'StaticArrayofObjects', locationType: 'Page', page: 'Page_Actions', propertyName: 'Dimensions'},

        'p_TrendQs': { type: 'QuestionAndCategoriesList', locationType: 'Page', page: 'Page_Trends', propertyName: 'TrendQuestions', isQuestionBased: true },

        'p_Wave': { type: 'QuestionId', locationType: 'Survey', propertyName: 'WaveQuestion', isInReverseOrder: true},
        'p_WaveOrgOverview': { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'WaveOrgOverview'},
        'p_WaveSelector': { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'WaveSelector'},
        'p_AllResults_GapSettings': { type: 'StaticArrayofObjects', locationType: 'TextAndParameterLibrary', propertyName: 'GapSettings'},

        'p_LeadersExport_BreakBy': { type: 'QuestionList', locationType: 'Page', page: 'Page_LeadersExport', propertyName: 'BreakVariables', isQuestionBased: true},
        'p_LeadersExport_Dimension' : { type: 'QuestionAndCategoriesList', locationType: 'Page', page: 'Page_LeadersExport', propertyName: 'Questions', isQuestionBased: true},

        'p_CulturalBehaviors_BreakBy' : { type: 'QuestionList', locationType: 'Page', page: 'Page_CulturalBehaviors', propertyName: 'BreakVariables', isQuestionBased: true}

    };

    // mandatory parameters can be single or multi. Must have default value when a page opens
    static var mandatoryPageParameters = ['p_projectSelector', 'p_TimeUnitWithDefault', 'p_TimePeriod', 'p_BenchmarkSet',
                                          'p_Wave', 'p_OpenTextQs', 'p_CustomOpenTextQs', 'p_AllOpenTextQs', 'p_TrendQs',
                                          'p_Demographics', 'p_QsToFilterBy', 'p_Dimensions', 'p_Results_TableTabSwitcher',
                                          'p_OrgOverviewBreakBy', 'p_AllResults_BreakBy', 'p_WaveOrgOverview', 
                                          'p_ImpactAnalysisDimension', 'p_CorrelationQuestion', 'p_WaveSelector', 
                                          'p_LeadersExport_BreakBy', 'p_LeadersExport_Dimension'];

    // optional parameters are usually multiple. Can be empty by default
    static var optionalPageParameters = ['p_ScoreQs', 'p_TagQs', 'p_TimeUnitNoDefault', 'p_CatDD_TimeUnitNoDefault', 'p_AllResults_GapSettings']; // we must add them empty option as 1st value instead

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
        Page_CulturalBehaviors: ['BreakVariables']
    }
}
