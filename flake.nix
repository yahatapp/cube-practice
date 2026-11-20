{
  description = "Development environment for cube-practice";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "aarch64-darwin"
        "x86_64-linux"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = import nixpkgs { inherit system; };
          vitePlusVersion = "1.3.0";
          vitePlusRelease = {
            aarch64-darwin = {
              target = "aarch64-apple-darwin";
              hash = "sha256-TwIac9Z1/8eKx3NZ/9QNiaYvJirHViXl4P1WciES+Dg=";
            };
            x86_64-linux = {
              target = "x86_64-unknown-linux-gnu";
              hash = "sha256-P7OmaEcuExLu3XWYs/bFEazrwvZJfCk6XuBOuiSO7n4=";
            };
          }.${system};
          vitePlus = pkgs.stdenvNoCC.mkDerivation {
            pname = "vite-plus";
            version = vitePlusVersion;

            src = pkgs.fetchurl {
              url = "https://github.com/voidzero-dev/vite-plus/releases/download/v${vitePlusVersion}/vp-${vitePlusRelease.target}.tar.gz";
              hash = vitePlusRelease.hash;
            };

            sourceRoot = ".";
            installPhase = ''
              runHook preInstall
              install -Dm755 vp "$out/bin/vp"
              runHook postInstall
            '';
          };
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              bashInteractive
              betterleaks
              coreutils
              curl
              git
              gnugrep
              nodejs_24
              pnpm_10
              vitePlus
            ];
          };
        }
      );
    };
}
