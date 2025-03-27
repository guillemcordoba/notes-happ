{
  description = "Template for Holochain app development";

  inputs = {
    holonix.url = "github:holochain/holonix/main-0.4";

    nixpkgs.follows = "holonix/nixpkgs";
    flake-parts.follows = "holonix/flake-parts";

    tnesh-stack.url = "github:darksoil-studio/tnesh-stack/main-0.4";
    playground.url = "github:darksoil-studio/holochain-playground/main-0.4";
    p2p-shipyard.url = "github:darksoil-studio/p2p-shipyard/main-0.4";
    file-storage.url = "github:darksoil-studio/file-storage/main-0.4";
    friends-zome.url = "github:darksoil-studio/friends-zome/main-0.4";
    private-event-sourcing-zome.url =
      "github:darksoil-studio/private-event-sourcing-zome/main-0.4";
  };

  nixConfig = {
    extra-substituters = [
      "https://holochain-ci.cachix.org"
      "https://darksoil-studio.cachix.org"
    ];
    extra-trusted-public-keys = [
      "holochain-ci.cachix.org-1:5IUSkZc0aoRS53rfkvH9Kid40NpyjwCMCzwRTXy+QN8="
      "darksoil-studio.cachix.org-1:UEi+aujy44s41XL/pscLw37KEVpTEIn8N/kn7jO8rkc="
    ];
  };

  outputs = inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ ./happ.nix ];

      systems = builtins.attrNames inputs.holonix.devShells;
      perSystem = { inputs', config, pkgs, system, ... }: {
        devShells.default = pkgs.mkShell {
          inputsFrom = [
            inputs'.tnesh-stack.devShells.synchronized-pnpm
            inputs'.holonix.devShells.default
          ];
          packages = [
            inputs'.tnesh-stack.packages.holochain
            inputs'.tnesh-stack.packages.hc-scaffold-happ
            inputs'.p2p-shipyard.packages.hc-pilot
            inputs'.playground.packages.hc-playground
          ];
        };
      };
    };
}
