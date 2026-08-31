export default {
  name: "Kiwi C++ API Reference",
  siteUrl: "https://kiwisolver.readthedocs.io",
  baseUrl: "/en/latest/cpp-api",
  repo: "https://github.com/nucleic/kiwi",
  editBranch: "main",
  navigation: {
    tabs: [
      {
        tab: "C++ API",
        slug: "",
        doxygen: {
          xml: "./build/doxygen-public/xml",
          language: "cpp",
          groups: false,
          index: "rich",
          sourceUrl:
            "https://github.com/nucleic/kiwi/blob/e8acf1e0eb8c21c6193d7dd621e3f03b7277f122/{path}#L{line}",
        },
      },
    ],
  },
};
