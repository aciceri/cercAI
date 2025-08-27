{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    git-hooks-nix = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.git-hooks-nix.flakeModule
      ];

      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      perSystem =
        { config, pkgs, ... }:
        {
          pre-commit = {
            check.enable = true;
            settings = {
              hooks = {
                eslint.enable = true;
                prettier.enable = true;
                check-json.enable = true;
                check-yaml.enable = true;
                nixfmt-rfc-style.enable = true;
              };
            };
          };

          devShells.default = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodejs_20
              nodePackages.npm
              nodePackages.typescript
              nodePackages.eslint
            ];
            shellHook = ''
              ${config.pre-commit.installationScript}
            '';
          };

          packages.default = pkgs.buildNpmPackage {
            pname = "cercai";
            version = "alpha";

            src = pkgs.lib.cleanSource ./.;

            npmDepsHash = "sha256-fqZBlxTP3Y1xhknqvVH8rt8aHqDneQqN84OwcK9lTGA=";

            buildPhase = ''
              npm run build
            '';

            installPhase = ''
              mkdir -p $out
              cp -r dist/* $out/
            '';
          };
        };
    };
}
