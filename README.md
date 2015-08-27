# ShopCare LemonStand Theme

### Working with CSS

1. Install Saas

    ```bash
    gem install sass # or gem update sass
    ```
1. Generating css files

Work on your css in shopcare.scss and shopcare.css will be generated. From the
root of the repo run this command to generate the css file when the scss file changes.
If you are a user of this theme it is recommended that you create your own css file
and do not edit shopcare.scss directly. 

    sass --watch shopcare/resources/css/shopcare.scss:shopcare/resources/css/shopcare.css
