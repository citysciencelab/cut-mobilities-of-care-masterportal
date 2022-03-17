const storyTellingModes = {
        CREATE: "create",
        PLAY: "play"
    },
    storyTellingModeIcons = {
        [storyTellingModes.CREATE]: "add",
        [storyTellingModes.PLAY]: "play_arrow"
    },
    storyCreationViews = {
        STORY_CREATION: "story",
        STEP_CREATION: "step",
        PREVIEW: "preview"
    },
    emptyStoryConf = {
        chapters: [],
        steps: []
    },
    htmlEditorToolbar = [
        [{header: [false, 1, 2, 3, 4, 5, 6]}],
        ["bold", "italic", "underline", "strike"],
        [
            {align: ""},
            {align: "center"},
            {align: "right"},
            {align: "justify"}
        ],
        [{list: "ordered"}, {list: "bullet"}],
        ["blockquote", "code-block"],
        [{color: []}, {background: []}],
        ["link", "image"],
        ["clean"]
    ];

export {
    storyTellingModes,
    storyTellingModeIcons,
    storyCreationViews,
    emptyStoryConf,
    htmlEditorToolbar
};
