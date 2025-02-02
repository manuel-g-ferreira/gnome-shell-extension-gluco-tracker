NAME = gluco-tracker
DOMAIN = gluco.dev
ROOT = gluco-tracker@gluco.dev

# Schema file paths
SCHEMA_FILE = $(ROOT)/schemas/org.gnome.shell.extensions.$(NAME).gschema.xml
SCHEMA_COMPILED = $(ROOT)/schemas/gschemas.compiled

.PHONY: all pack install clean

# Build target: the compiled extension file.
all: $(ROOT)/dist/extension.js

# Install Node.js dependencies inside the extension folder.
$(ROOT)/node_modules: $(ROOT)/package.json
	cd $(ROOT) && npm install

# Compile TypeScript files (e.g. extension.js and prefs.js) using the local TypeScript compiler.
$(ROOT)/dist/extension.js $(ROOT)/dist/prefs.js: $(ROOT)/node_modules
	cd $(ROOT) && ./node_modules/.bin/tsc

# Compile the GSettings schema if the expected schema file exists.
# Otherwise, skip schema compilation and create an empty placeholder.
$(SCHEMA_COMPILED):
	@if [ -f $(SCHEMA_FILE) ]; then \
	  cd $(ROOT) && glib-compile-schemas schemas; \
	else \
	  echo "No schema file $(SCHEMA_FILE) found; skipping schema compilation."; \
	  touch $(SCHEMA_COMPILED); \
	fi

# Create the zip package.
$(NAME).zip: $(ROOT)/dist/extension.js $(ROOT)/dist/prefs.js $(SCHEMA_COMPILED)
	@cp -r $(ROOT)/schemas $(ROOT)/dist/
	@cp $(ROOT)/metadata.json $(ROOT)/dist/
	@(cd $(ROOT)/dist && zip -9r ../../$(NAME).zip .)

pack: $(NAME).zip

# Install the extension by moving the compiled "dist" folder to the GNOME extensions directory.
install: $(NAME).zip
	@touch ~/.local/share/gnome-shell/extensions/$(NAME)@$(DOMAIN)
	@rm -rf ~/.local/share/gnome-shell/extensions/$(NAME)@$(DOMAIN)
	@mv $(ROOT)/dist ~/.local/share/gnome-shell/extensions/$(NAME)@$(DOMAIN)

clean:
	@rm -rf $(ROOT)/dist $(ROOT)/node_modules $(NAME).zip
