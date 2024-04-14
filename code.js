{
  defaultUnchecked: "🔲",
  defaultChecked: "✔",

  checkmark(app, checked) {
    const key = checked ? "Ticked checkmark (leave empty for ✔)" : "Unticked checkmark (leave empty for 🔲)";
    return app.settings[key] || (checked ? this.defaultChecked : this.defaultUnchecked);
  },

  markdown(fullmark) {
    return `[${fullmark}][^1]\n[^1]:[${fullmark}]()\nClick the button below to toggle the checkbox.`;
  },

  footnote(app, checked) {
    // build a rich footnote in markdown
    const mark = this.checkmark(app, checked);
    return this.markdown(mark);
  },

  startsWith: async function(app, mark) {
    // check if the footnote corresponds a checkbox.
    const floatingPattern = new RegExp(`^\\[${mark}.*\\]`);
    const inTablePattern = new RegExp(`^\\| \\|\n\\|-\\|\n\\|\\[${mark}.*\\]`);
    const isFloating = floatingPattern.test(app.context.selectionContent);
    const isInTable = inTablePattern.test(app.context.selectionContent);
    return floatingPattern.test(app.context.selectionContent)
      || inTablePattern.test(app.context.selectionContent); // also check if inside a table
  },

  isChecked: async function(app, checked) {
    // check if the footnote corresponds to checked or unchecked state.

    const mark = this.checkmark(app, checked);
    return this.startsWith(app, mark);
  },

  insertText: {
    run: async function(app) {
      await app.context.replaceSelection(this.footnote(app, false)); // using replaceSelection() to parse markdown.
    }
  },

  linkOption: {
    "tick": {
      check: async function(app, link) {
        return await this.isChecked(app, false);
      },
  
      run: async function(app, link) {
        const text = app.context.selectionContent.match(new RegExp(`\\[${this.checkmark(app, false)}(.*?)\\]`), 'g')[1];
        const fullmark = this.checkmark(app, true) + text;
        await app.context.replaceSelection(this.markdown(fullmark));
      }
    },

    "untick": {
      check: async function(app, link) {
        return await this.isChecked(app, true);
      },
  
      run: async function(app, link) {
        const text = app.context.selectionContent.match(new RegExp(`\\[${this.checkmark(app, true)}(.*?)\\]`), 'g')[1];
        const fullmark = this.checkmark(app, false) + text;
        await app.context.replaceSelection(this.markdown(fullmark));
      }
    }
  }
}

