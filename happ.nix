{ inputs, ... }:

{
  # Import all `dnas/*/dna.nix` files
  imports = (
    map (m: "${./.}/dnas/${m}/dna.nix")
      (builtins.attrNames (if builtins.pathExists ./dnas then builtins.readDir ./dnas else {} ))
  );

  perSystem =
    { inputs'
    , lib
    , self'
    , system
    , ...
    }: {
  	  packages.notes_happ = inputs.tnesh-stack.outputs.builders.${system}.happ {
        happManifest = ./workdir/happ.yaml;
        dnas = {
          # Include here the DNA packages for this hApp, e.g.:
          # my_dna = inputs'.some_input.packages.my_dna;
          # This overrides all the "bundled" properties for the hApp manifest
          lobby = self'.packages.lobby_dna;
          group = self'.packages.group_dna;
        };
      };
  	};
}
