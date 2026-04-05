package models

import "encoding/json"

// JSONRaw is a nullable JSON column that decodes to any Go value.
type JSONRaw json.RawMessage

func (j *JSONRaw) Scan(src any) error {
	if src == nil {
		*j = nil
		return nil
	}
	switch v := src.(type) {
	case string:
		*j = JSONRaw(v)
	case []byte:
		*j = JSONRaw(v)
	}
	return nil
}

func (j JSONRaw) MarshalJSON() ([]byte, error) {
	if j == nil {
		return []byte("null"), nil
	}
	return json.RawMessage(j), nil
}

// ─── Question ───────────────────────────────────────────────────────────────

type Question struct {
	ID          string   `json:"id"`
	Question    string   `json:"question"`
	Answer      string   `json:"answer"`
	Explanation string   `json:"explanation"`
	Diagram     *string  `json:"diagram"`
	Difficulty  string   `json:"difficulty"`
	Tags        JSONRaw  `json:"tags"`
	Channel     string   `json:"channel"`
	SubChannel  string   `json:"subChannel"`
	SourceURL   *string  `json:"sourceUrl"`
	Videos      JSONRaw  `json:"videos"`
	Companies   JSONRaw  `json:"companies"`
	Eli5        *string  `json:"eli5"`
	TLDR        *string  `json:"tldr"`
	IsNew       bool     `json:"isNew"`
	LastUpdated *string  `json:"lastUpdated"`
}

// ─── Channel ─────────────────────────────────────────────────────────────────

type Channel struct {
	ID            string `json:"id"`
	QuestionCount int    `json:"questionCount"`
}

// ─── ChannelStats ─────────────────────────────────────────────────────────────

type ChannelStats struct {
	ID           string `json:"id"`
	Total        int    `json:"total"`
	Beginner     int    `json:"beginner"`
	Intermediate int    `json:"intermediate"`
	Advanced     int    `json:"advanced"`
}

// ─── CodingChallenge ─────────────────────────────────────────────────────────

type StarterCode struct {
	JavaScript string `json:"javascript"`
	Python     string `json:"python"`
}

type Solution struct {
	JavaScript string `json:"javascript"`
	Python     string `json:"python"`
}

type Complexity struct {
	Time        string `json:"time"`
	Space       string `json:"space"`
	Explanation string `json:"explanation"`
}

type CodingChallenge struct {
	ID          string      `json:"id"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Difficulty  string      `json:"difficulty"`
	Category    string      `json:"category"`
	Tags        JSONRaw     `json:"tags"`
	Companies   JSONRaw     `json:"companies"`
	StarterCode StarterCode `json:"starterCode"`
	TestCases   JSONRaw     `json:"testCases"`
	Hints       JSONRaw     `json:"hints"`
	Solution    Solution    `json:"sampleSolution"`
	Complexity  Complexity  `json:"complexity"`
	TimeLimit   int         `json:"timeLimit"`
}

// ─── Flashcard ───────────────────────────────────────────────────────────────

type Flashcard struct {
	ID          string  `json:"id"`
	Channel     string  `json:"channel"`
	Front       string  `json:"front"`
	Back        string  `json:"back"`
	Hint        *string `json:"hint"`
	CodeExample *string `json:"codeExample"`
	Mnemonic    *string `json:"mnemonic"`
	Difficulty  string  `json:"difficulty"`
	Tags        JSONRaw `json:"tags"`
	Category    *string `json:"category"`
}

// ─── VoiceSession ─────────────────────────────────────────────────────────────

type VoiceSession struct {
	ID               string  `json:"id"`
	Topic            string  `json:"topic"`
	Description      *string `json:"description"`
	Channel          string  `json:"channel"`
	Difficulty       string  `json:"difficulty"`
	QuestionIDs      JSONRaw `json:"questionIds"`
	TotalQuestions   int     `json:"totalQuestions"`
	EstimatedMinutes int     `json:"estimatedMinutes"`
}

// ─── Certification ───────────────────────────────────────────────────────────

type Certification struct {
	ID               string  `json:"id"`
	Name             string  `json:"name"`
	Provider         string  `json:"provider"`
	Description      string  `json:"description"`
	Icon             string  `json:"icon"`
	Color            string  `json:"color"`
	Difficulty       string  `json:"difficulty"`
	Category         string  `json:"category"`
	EstimatedHours   int     `json:"estimatedHours"`
	ExamCode         *string `json:"examCode"`
	OfficialURL      *string `json:"officialUrl"`
	Domains          JSONRaw `json:"domains"`
	ChannelMappings  JSONRaw `json:"channelMappings"`
	Tags             JSONRaw `json:"tags"`
	Prerequisites    JSONRaw `json:"prerequisites"`
	QuestionCount    int     `json:"questionCount"`
	PassingScore     int     `json:"passingScore"`
	ExamDuration     int     `json:"examDuration"`
}

// ─── LearningPath ────────────────────────────────────────────────────────────

type LearningPath struct {
	ID                 string  `json:"id"`
	Title              string  `json:"title"`
	Description        string  `json:"description"`
	PathType           string  `json:"pathType"`
	TargetCompany      *string `json:"targetCompany"`
	TargetJobTitle     *string `json:"targetJobTitle"`
	Difficulty         string  `json:"difficulty"`
	EstimatedHours     int     `json:"estimatedHours"`
	QuestionIDs        JSONRaw `json:"questionIds"`
	Channels           JSONRaw `json:"channels"`
	Tags               JSONRaw `json:"tags"`
	Prerequisites      JSONRaw `json:"prerequisites"`
	LearningObjectives JSONRaw `json:"learningObjectives"`
	Milestones         JSONRaw `json:"milestones"`
	Popularity         int     `json:"popularity"`
	CompletionRate     int     `json:"completionRate"`
	AverageRating      int     `json:"averageRating"`
}

// ─── Pagination ──────────────────────────────────────────────────────────────

type Paginated[T any] struct {
	Data       []T  `json:"data"`
	Total      int  `json:"total"`
	Page       int  `json:"page"`
	PageSize   int  `json:"pageSize"`
	TotalPages int  `json:"totalPages"`
	HasNext    bool `json:"hasNext"`
	HasPrev    bool `json:"hasPrev"`
}

// ─── Error ───────────────────────────────────────────────────────────────────

type APIError struct {
	Error   string `json:"error"`
	Code    int    `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}
