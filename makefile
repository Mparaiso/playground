test:
	@npm test &
start:
	@npm start &
commit:
	@git add .
	@git commit -am"$(message) `date`" | :
push: commit
	@git push origin master
pages: commit
	@git push origin gh-pages
.PHONY: start commit push pages test